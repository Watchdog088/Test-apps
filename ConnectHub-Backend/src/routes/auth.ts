import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDB } from '../config/database';
import { validateBody } from '../middleware/validation';
import { schemas } from '../middleware/validation';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import logger from '../config/logger';
import { sendEmail } from '../services/email';

const router = Router();

// Register
router.post('/register', validateBody(schemas.userRegistration), async (req, res) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;
    const db = getDB();

    // Check if user already exists
    const existingUserQuery = `
      SELECT id, email, username 
      FROM users 
      WHERE email = $1 OR username = $2
    `;
    const existingUserResult = await db.query(existingUserQuery, [email, username]);

    if (existingUserResult.rows.length > 0) {
      const existingUser = existingUserResult.rows[0];
      return res.status(400).json({
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Start transaction
    await db.query('BEGIN');

    try {
      // Create user
      const userQuery = `
        INSERT INTO users (
          email, username, password, first_name, last_name,
          email_verification_token, email_verification_expires
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, email, username, first_name, last_name, is_verified, created_at
      `;
      
      const userResult = await db.query(userQuery, [
        email, username, hashedPassword, firstName, lastName,
        emailVerificationToken, emailVerificationExpires
      ]);

      const user = userResult.rows[0];

      // Send verification email
      try {
        await sendEmail({
          to: email,
          subject: 'Verify your ConnectHub account',
          template: 'email-verification',
          data: {
            name: firstName || username,
            verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`
          }
        });
      } catch (emailError) {
        logger.error('Failed to send verification email:', emailError);
        // Continue without failing registration
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' }
      );

      // Save refresh token to database
      const refreshTokenQuery = `
        INSERT INTO refresh_tokens (token, user_id, expires_at)
        VALUES ($1, $2, $3)
      `;
      await db.query(refreshTokenQuery, [
        refreshToken, 
        user.id, 
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ]);

      await db.query('COMMIT');

      const userResponse = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        isEmailVerified: user.is_verified
      };

      res.status(201).json({
        message: 'User registered successfully. Please check your email for verification.',
        user: userResponse,
        accessToken,
        refreshToken
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', validateBody(schemas.userLogin), async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDB();

    // Find user
    const userQuery = `
      SELECT id, email, username, password, first_name, last_name, 
             is_verified, is_active, last_login_at
      FROM users 
      WHERE email = $1
    `;
    const userResult = await db.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account has been deactivated' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    const updateLoginQuery = `
      UPDATE users 
      SET last_login_at = NOW()
      WHERE id = $1
    `;
    await db.query(updateLoginQuery, [user.id]);

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    // Save refresh token
    const refreshTokenQuery = `
      INSERT INTO refresh_tokens (token, user_id, expires_at)
      VALUES ($1, $2, $3)
    `;
    await db.query(refreshTokenQuery, [
      refreshToken,
      user.id,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ]);

    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      isEmailVerified: user.is_verified
    };

    res.json({
      message: 'Login successful',
      user: userResponse,
      accessToken,
      refreshToken
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh Token
router.post('/refresh', validateBody(schemas.refreshToken), async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const db = getDB();

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };

    // Check if refresh token exists and is valid
    const tokenQuery = `
      SELECT user_id, expires_at, is_revoked
      FROM refresh_tokens
      WHERE token = $1 AND user_id = $2 AND expires_at > NOW() AND is_revoked = false
    `;
    const tokenResult = await db.query(tokenQuery, [refreshToken, decoded.userId]);

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Get user
    const userQuery = `
      SELECT id, email, is_active
      FROM users
      WHERE id = $1
    `;
    const userResult = await db.query(userQuery, [decoded.userId]);

    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    const user = userResult.rows[0];

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });

  } catch (error) {
    logger.error('Token refresh error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const db = getDB();
    const authReq = req as AuthenticatedRequest;

    if (refreshToken && authReq.user) {
      // Revoke refresh token
      const revokeQuery = `
        UPDATE refresh_tokens
        SET is_revoked = true
        WHERE token = $1 AND user_id = $2
      `;
      await db.query(revokeQuery, [refreshToken, authReq.user.id]);
    }

    res.json({ message: 'Logged out successfully' });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify Email
router.post('/verify-email', validateBody(schemas.emailVerification), async (req, res) => {
  try {
    const { token } = req.body;
    const db = getDB();

    const userQuery = `
      SELECT id
      FROM users
      WHERE email_verification_token = $1 AND email_verification_expires > NOW()
    `;
    const userResult = await db.query(userQuery, [token]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    const user = userResult.rows[0];

    // Update user as verified
    const updateQuery = `
      UPDATE users
      SET is_verified = true, 
          email_verification_token = NULL,
          email_verification_expires = NULL
      WHERE id = $1
    `;
    await db.query(updateQuery, [user.id]);

    res.json({ message: 'Email verified successfully' });

  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot Password
router.post('/forgot-password', validateBody(schemas.passwordReset), async (req, res) => {
  try {
    const { email } = req.body;
    const db = getDB();

    const userQuery = `
      SELECT id, first_name, username
      FROM users
      WHERE email = $1
    `;
    const userResult = await db.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists for security
      return res.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    const user = userResult.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const updateQuery = `
      UPDATE users
      SET password_reset_token = $1, password_reset_expires = $2
      WHERE id = $3
    `;
    await db.query(updateQuery, [resetToken, resetExpires, user.id]);

    // Send reset email
    try {
      await sendEmail({
        to: email,
        subject: 'Reset your ConnectHub password',
        template: 'password-reset',
        data: {
          name: user.first_name || user.username,
          resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
        }
      });
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    res.json({ message: 'If the email exists, a reset link has been sent.' });

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password
router.post('/reset-password', validateBody(schemas.passwordChange), async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const db = getDB();

    const userQuery = `
      SELECT id
      FROM users
      WHERE password_reset_token = $1 AND password_reset_expires > NOW()
    `;
    const userResult = await db.query(userQuery, [token]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const user = userResult.rows[0];

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Start transaction
    await db.query('BEGIN');

    try {
      // Update user password and clear reset tokens
      const updatePasswordQuery = `
        UPDATE users
        SET password = $1, 
            password_reset_token = NULL,
            password_reset_expires = NULL
        WHERE id = $2
      `;
      await db.query(updatePasswordQuery, [hashedPassword, user.id]);

      // Revoke all refresh tokens to force re-login
      const revokeTokensQuery = `
        UPDATE refresh_tokens
        SET is_revoked = true
        WHERE user_id = $1
      `;
      await db.query(revokeTokensQuery, [user.id]);

      await db.query('COMMIT');

      res.json({ message: 'Password reset successfully' });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userQuery = `
      SELECT 
        u.id, u.email, u.username, u.first_name, u.last_name,
        u.is_verified, u.created_at, u.bio, u.avatar, u.is_private,
        (SELECT COUNT(*) FROM posts WHERE author_id = u.id AND is_deleted = false) as posts_count,
        u.followers_count,
        u.following_count
      FROM users u
      WHERE u.id = $1
    `;
    const userResult = await db.query(userQuery, [authReq.user.id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      isEmailVerified: user.is_verified,
      bio: user.bio,
      avatar: user.avatar,
      isPrivate: user.is_private,
      createdAt: user.created_at,
      stats: {
        postsCount: parseInt(user.posts_count) || 0,
        followersCount: user.followers_count || 0,
        followingCount: user.following_count || 0
      }
    };

    res.json({ user: userResponse });

  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
