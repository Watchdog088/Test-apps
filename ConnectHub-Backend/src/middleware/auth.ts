import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDB } from '../config/database';
import logger from '../config/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    isVerified: boolean;
  };
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const db = getDB();

    // Verify user still exists and is active
    const userQuery = `
      SELECT id, email, username, is_verified, is_active
      FROM users
      WHERE id = $1
    `;
    const userResult = await db.query(userQuery, [decoded.userId]);

    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    const user = userResult.rows[0];

    // Update last active timestamp
    const updateQuery = `
      UPDATE users
      SET last_active_at = NOW()
      WHERE id = $1
    `;
    await db.query(updateQuery, [user.id]);

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      isVerified: user.is_verified,
    };
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without authentication
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const db = getDB();

    const userQuery = `
      SELECT id, email, username, is_verified, is_active
      FROM users
      WHERE id = $1
    `;
    const userResult = await db.query(userQuery, [decoded.userId]);

    if (userResult.rows.length > 0 && userResult.rows[0].is_active) {
      const user = userResult.rows[0];
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.is_verified,
      };
      
      // Update last active timestamp
      const updateQuery = `
        UPDATE users
        SET last_active_at = NOW()
        WHERE id = $1
      `;
      await db.query(updateQuery, [user.id]);
    }

    next();
  } catch (error) {
    // Log error but continue without authentication
    logger.warn('Optional auth failed:', error);
    next();
  }
};

export const requireVerifiedUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ 
      error: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }

  next();
};

export const requireAdminRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const db = getDB();
    const userQuery = `
      SELECT settings
      FROM users
      WHERE id = $1
    `;
    const userResult = await db.query(userQuery, [req.user.id]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const isAdmin = user.settings && 
      typeof user.settings === 'object' && 
      'role' in user.settings && 
      user.settings.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    logger.error('Admin role check error:', error);
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

export const rateLimitByUser = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id || req.ip || 'anonymous';
    const now = Date.now();

    if (!userRequests.has(userId)) {
      userRequests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const userLimit = userRequests.get(userId)!;

    if (now > userLimit.resetTime) {
      userLimit.count = 1;
      userLimit.resetTime = now + windowMs;
      return next();
    }

    if (userLimit.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
      });
    }

    userLimit.count++;
    next();
  };
};
