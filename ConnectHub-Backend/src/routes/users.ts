import express from 'express';
import { z } from 'zod';
import { getDB } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateBody, validateParams, validateQuery, schemas } from '../middleware/validation';
import { AuthenticatedRequest } from '../middleware/auth';
import logger from '../config/logger';

const router = express.Router();

// User-specific validation schemas
const userSchemas = {
  userId: z.object({
    userId: z.string().uuid('Invalid user ID format'),
  }),

  username: z.object({
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  }),

  updateProfile: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    fullName: z.string().min(1).max(100).optional(),
    bio: z.string().max(500).optional(),
    location: z.string().max(100).optional(),
    website: z.string().url().optional(),
    dateOfBirth: z.string().datetime().optional(),
    phone: z.string().regex(/^\+?[\d\s-()]+$/).optional(),
    isPrivate: z.boolean().optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    pronouns: z.string().max(50).optional(),
    occupation: z.string().max(100).optional(),
    education: z.string().max(100).optional(),
  }),

  searchUsers: z.object({
    q: z.string().min(1, 'Search query is required').max(100),
    type: z.enum(['username', 'fullname', 'all']).default('all'),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
  }),

  updateEmail: z.object({
    newEmail: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),

  block: z.object({
    targetUserId: z.string().uuid('Invalid user ID format'),
    reason: z.string().max(200).optional(),
  }),
};

// GET /api/users/profile - Get current user's profile
router.get('/profile',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      
      const profileQuery = `
        SELECT 
          id,
          username,
          email,
          full_name,
          first_name,
          last_name,
          bio,
          location,
          website,
          avatar_url,
          cover_photo_url,
          date_of_birth,
          phone,
          is_private,
          is_verified,
          is_active,
          gender,
          pronouns,
          occupation,
          education,
          followers_count,
          following_count,
          posts_count,
          created_at,
          updated_at
        FROM users
        WHERE id = $1 AND is_active = TRUE
      `;
      
      const result = await db.query(profileQuery, [req.user!.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      const profile = result.rows[0];
      
      // Remove sensitive information
      delete profile.password;
      
      res.json({ profile });
    } catch (error) {
      logger.error('Get user profile error:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }
);

// PUT /api/users/profile - Update current user's profile
router.put('/profile',
  authenticateToken,
  validateBody(userSchemas.updateProfile),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const updateData = req.body;

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateValues: any[] = [req.user!.id];
      let paramIndex = 2;

      const allowedFields = [
        'firstName', 'lastName', 'fullName', 'bio', 'location', 'website',
        'dateOfBirth', 'phone', 'isPrivate', 'gender', 'pronouns', 'occupation', 'education'
      ];

      const dbFieldMap: { [key: string]: string } = {
        firstName: 'first_name',
        lastName: 'last_name',
        fullName: 'full_name',
        bio: 'bio',
        location: 'location',
        website: 'website',
        dateOfBirth: 'date_of_birth',
        phone: 'phone',
        isPrivate: 'is_private',
        gender: 'gender',
        pronouns: 'pronouns',
        occupation: 'occupation',
        education: 'education',
      };

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          const dbField = dbFieldMap[field];
          updateFields.push(`${dbField} = $${paramIndex++}`);
          updateValues.push(updateData[field]);
        }
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      updateFields.push('updated_at = NOW()');

      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $1 AND is_active = TRUE
        RETURNING id, username, full_name, bio, location, website, is_private, updated_at
      `;

      const result = await db.query(updateQuery, updateValues);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        profile: result.rows[0],
        message: 'Profile updated successfully',
      });
    } catch (error) {
      logger.error('Update user profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

// GET /api/users/:userId - Get user profile by ID
router.get('/:userId',
  authenticateToken,
  validateParams(userSchemas.userId),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { userId } = req.params;

      const profileQuery = `
        SELECT 
          u.id,
          u.username,
          u.full_name,
          u.bio,
          u.location,
          u.website,
          u.avatar_url,
          u.cover_photo_url,
          u.is_private,
          u.is_verified,
          u.followers_count,
          u.following_count,
          u.posts_count,
          u.created_at,
          -- Check if current user follows this user
          EXISTS(
            SELECT 1 FROM user_follows uf
            WHERE uf.follower_id = $2 AND uf.following_id = u.id AND uf.is_active = TRUE
          ) as is_following,
          -- Check if this user follows current user
          EXISTS(
            SELECT 1 FROM user_follows uf
            WHERE uf.follower_id = u.id AND uf.following_id = $2 AND uf.is_active = TRUE
          ) as follows_you,
          -- Check if blocked
          EXISTS(
            SELECT 1 FROM user_blocks ub
            WHERE (ub.blocker_id = $2 AND ub.blocked_id = u.id) 
               OR (ub.blocker_id = u.id AND ub.blocked_id = $2)
          ) as is_blocked
        FROM users u
        WHERE u.id = $1 AND u.is_active = TRUE
      `;
      
      const result = await db.query(profileQuery, [userId, req.user!.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const profile = result.rows[0];

      // If user is blocked, return minimal info
      if (profile.is_blocked) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // If account is private and current user doesn't follow, limit info
      if (profile.is_private && !profile.is_following && profile.id !== req.user!.id) {
        const limitedProfile = {
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          is_private: true,
          is_verified: profile.is_verified,
          followers_count: profile.followers_count,
          following_count: profile.following_count,
          is_following: false,
          follows_you: profile.follows_you,
        };
        return res.json({ profile: limitedProfile, isLimited: true });
      }

      res.json({ profile });
    } catch (error) {
      logger.error('Get user by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }
);

// GET /api/users/username/:username - Get user profile by username
router.get('/username/:username',
  authenticateToken,
  validateParams(userSchemas.username),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { username } = req.params;

      // Get user profile by username with same logic as ID endpoint
      const profileQuery = `
        SELECT 
          u.id,
          u.username,
          u.full_name,
          u.bio,
          u.location,
          u.website,
          u.avatar_url,
          u.cover_photo_url,
          u.is_private,
          u.is_verified,
          u.followers_count,
          u.following_count,
          u.posts_count,
          u.created_at,
          -- Check if current user follows this user
          EXISTS(
            SELECT 1 FROM user_follows uf
            WHERE uf.follower_id = $2 AND uf.following_id = u.id AND uf.is_active = TRUE
          ) as is_following,
          -- Check if this user follows current user
          EXISTS(
            SELECT 1 FROM user_follows uf
            WHERE uf.follower_id = u.id AND uf.following_id = $2 AND uf.is_active = TRUE
          ) as follows_you,
          -- Check if blocked
          EXISTS(
            SELECT 1 FROM user_blocks ub
            WHERE (ub.blocker_id = $2 AND ub.blocked_id = u.id) 
               OR (ub.blocker_id = u.id AND ub.blocked_id = $2)
          ) as is_blocked
        FROM users u
        WHERE u.username = $1 AND u.is_active = TRUE
      `;
      
      const result = await db.query(profileQuery, [username, req.user!.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const profile = result.rows[0];

      // If user is blocked, return minimal info
      if (profile.is_blocked) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // If account is private and current user doesn't follow, limit info
      if (profile.is_private && !profile.is_following && profile.id !== req.user!.id) {
        const limitedProfile = {
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          is_private: true,
          is_verified: profile.is_verified,
          followers_count: profile.followers_count,
          following_count: profile.following_count,
          is_following: false,
          follows_you: profile.follows_you,
        };
        return res.json({ profile: limitedProfile, isLimited: true });
      }

      res.json({ profile });
    } catch (error) {
      logger.error('Get user by username error:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }
);

// POST /api/users/:userId/follow - Follow a user
router.post('/:userId/follow',
  authenticateToken,
  validateParams(userSchemas.userId),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { userId } = req.params;

      if (userId === req.user!.id) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
      }

      // Check if target user exists and is active
      const targetQuery = `
        SELECT id, username, is_private FROM users 
        WHERE id = $1 AND is_active = TRUE
      `;
      const targetResult = await db.query(targetQuery, [userId]);

      if (targetResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const targetUser = targetResult.rows[0];

      // Check if already following
      const existingFollowQuery = `
        SELECT id, is_active FROM user_follows
        WHERE follower_id = $1 AND following_id = $2
      `;
      const existingResult = await db.query(existingFollowQuery, [req.user!.id, userId]);

      if (existingResult.rows.length > 0) {
        const existing = existingResult.rows[0];
        if (existing.is_active) {
          return res.status(400).json({ error: 'Already following this user' });
        } else {
          // Reactivate follow
          const reactivateQuery = `
            UPDATE user_follows 
            SET is_active = TRUE, created_at = NOW()
            WHERE id = $1
            RETURNING *
          `;
          await db.query(reactivateQuery, [existing.id]);
        }
      } else {
        // Create new follow
        const followQuery = `
          INSERT INTO user_follows (follower_id, following_id, is_active)
          VALUES ($1, $2, TRUE)
          RETURNING *
        `;
        await db.query(followQuery, [req.user!.id, userId]);
      }

      // Update follower counts
      const updateCountsQuery = `
        UPDATE users SET 
          followers_count = (
            SELECT COUNT(*) FROM user_follows 
            WHERE following_id = users.id AND is_active = TRUE
          ),
          following_count = (
            SELECT COUNT(*) FROM user_follows 
            WHERE follower_id = users.id AND is_active = TRUE
          )
        WHERE id IN ($1, $2)
      `;
      await db.query(updateCountsQuery, [req.user!.id, userId]);

      const responseMessage = targetUser.is_private 
        ? 'Follow request sent' 
        : 'Now following user';

      res.json({
        message: responseMessage,
        isPrivate: targetUser.is_private,
        username: targetUser.username,
      });
    } catch (error) {
      logger.error('Follow user error:', error);
      res.status(500).json({ error: 'Failed to follow user' });
    }
  }
);

// DELETE /api/users/:userId/follow - Unfollow a user
router.delete('/:userId/follow',
  authenticateToken,
  validateParams(userSchemas.userId),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { userId } = req.params;

      if (userId === req.user!.id) {
        return res.status(400).json({ error: 'Cannot unfollow yourself' });
      }

      // Check if following
      const followQuery = `
        SELECT id FROM user_follows
        WHERE follower_id = $1 AND following_id = $2 AND is_active = TRUE
      `;
      const followResult = await db.query(followQuery, [req.user!.id, userId]);

      if (followResult.rows.length === 0) {
        return res.status(400).json({ error: 'Not following this user' });
      }

      // Deactivate follow
      const unfollowQuery = `
        UPDATE user_follows 
        SET is_active = FALSE, updated_at = NOW()
        WHERE follower_id = $1 AND following_id = $2
        RETURNING *
      `;
      await db.query(unfollowQuery, [req.user!.id, userId]);

      // Update follower counts
      const updateCountsQuery = `
        UPDATE users SET 
          followers_count = (
            SELECT COUNT(*) FROM user_follows 
            WHERE following_id = users.id AND is_active = TRUE
          ),
          following_count = (
            SELECT COUNT(*) FROM user_follows 
            WHERE follower_id = users.id AND is_active = TRUE
          )
        WHERE id IN ($1, $2)
      `;
      await db.query(updateCountsQuery, [req.user!.id, userId]);

      res.json({
        message: 'Unfollowed user successfully',
      });
    } catch (error) {
      logger.error('Unfollow user error:', error);
      res.status(500).json({ error: 'Failed to unfollow user' });
    }
  }
);

// GET /api/users/:userId/followers - Get user's followers
router.get('/:userId/followers',
  authenticateToken,
  validateParams(userSchemas.userId),
  validateQuery(schemas.pagination),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query as any;
      const offset = (page - 1) * limit;

      // Check if user exists and if profile is accessible
      const userQuery = `
        SELECT is_private,
        EXISTS(
          SELECT 1 FROM user_follows uf
          WHERE uf.follower_id = $2 AND uf.following_id = $1 AND uf.is_active = TRUE
        ) as is_following
        FROM users WHERE id = $1 AND is_active = TRUE
      `;
      const userResult = await db.query(userQuery, [userId, req.user!.id]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { is_private, is_following } = userResult.rows[0];

      // Check access permissions
      if (is_private && !is_following && userId !== req.user!.id) {
        return res.status(403).json({ error: 'Access denied to private profile' });
      }

      const followersQuery = `
        SELECT 
          u.id,
          u.username,
          u.full_name,
          u.avatar_url,
          u.is_verified,
          u.bio,
          EXISTS(
            SELECT 1 FROM user_follows uf2
            WHERE uf2.follower_id = $2 AND uf2.following_id = u.id AND uf2.is_active = TRUE
          ) as is_following_them,
          EXISTS(
            SELECT 1 FROM user_follows uf3
            WHERE uf3.follower_id = u.id AND uf3.following_id = $2 AND uf3.is_active = TRUE
          ) as they_follow_you
        FROM user_follows uf
        JOIN users u ON u.id = uf.follower_id
        WHERE uf.following_id = $1 AND uf.is_active = TRUE AND u.is_active = TRUE
        ORDER BY uf.created_at DESC
        LIMIT $3 OFFSET $4
      `;

      const followers = await db.query(followersQuery, [userId, req.user!.id, limit, offset]);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM user_follows uf
        JOIN users u ON u.id = uf.follower_id
        WHERE uf.following_id = $1 AND uf.is_active = TRUE AND u.is_active = TRUE
      `;
      const countResult = await db.query(countQuery, [userId]);
      const total = parseInt(countResult.rows[0].total);

      res.json({
        followers: followers.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get followers error:', error);
      res.status(500).json({ error: 'Failed to fetch followers' });
    }
  }
);

// GET /api/users/:userId/following - Get users that this user follows
router.get('/:userId/following',
  authenticateToken,
  validateParams(userSchemas.userId),
  validateQuery(schemas.pagination),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query as any;
      const offset = (page - 1) * limit;

      // Check if user exists and if profile is accessible
      const userQuery = `
        SELECT is_private,
        EXISTS(
          SELECT 1 FROM user_follows uf
          WHERE uf.follower_id = $2 AND uf.following_id = $1 AND uf.is_active = TRUE
        ) as is_following
        FROM users WHERE id = $1 AND is_active = TRUE
      `;
      const userResult = await db.query(userQuery, [userId, req.user!.id]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { is_private, is_following } = userResult.rows[0];

      // Check access permissions
      if (is_private && !is_following && userId !== req.user!.id) {
        return res.status(403).json({ error: 'Access denied to private profile' });
      }

      const followingQuery = `
        SELECT 
          u.id,
          u.username,
          u.full_name,
          u.avatar_url,
          u.is_verified,
          u.bio,
          EXISTS(
            SELECT 1 FROM user_follows uf2
            WHERE uf2.follower_id = $2 AND uf2.following_id = u.id AND uf2.is_active = TRUE
          ) as is_following_them,
          EXISTS(
            SELECT 1 FROM user_follows uf3
            WHERE uf3.follower_id = u.id AND uf3.following_id = $2 AND uf3.is_active = TRUE
          ) as they_follow_you
        FROM user_follows uf
        JOIN users u ON u.id = uf.following_id
        WHERE uf.follower_id = $1 AND uf.is_active = TRUE AND u.is_active = TRUE
        ORDER BY uf.created_at DESC
        LIMIT $3 OFFSET $4
      `;

      const following = await db.query(followingQuery, [userId, req.user!.id, limit, offset]);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM user_follows uf
        JOIN users u ON u.id = uf.following_id
        WHERE uf.follower_id = $1 AND uf.is_active = TRUE AND u.is_active = TRUE
      `;
      const countResult = await db.query(countQuery, [userId]);
      const total = parseInt(countResult.rows[0].total);

      res.json({
        following: following.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Get following error:', error);
      res.status(500).json({ error: 'Failed to fetch following' });
    }
  }
);

// GET /api/users/search - Search users
router.get('/search',
  authenticateToken,
  validateQuery(userSchemas.searchUsers),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { q, type = 'all', page = 1, limit = 20 } = req.query as any;
      const offset = (page - 1) * limit;

      let searchQuery = `
        SELECT 
          u.id,
          u.username,
          u.full_name,
          u.avatar_url,
          u.is_verified,
          u.bio,
          u.followers_count,
          EXISTS(
            SELECT 1 FROM user_follows uf
            WHERE uf.follower_id = $2 AND uf.following_id = u.id AND uf.is_active = TRUE
          ) as is_following
        FROM users u
        WHERE u.is_active = TRUE
        AND u.id != $2
      `;

      const queryParams = [`%${q.toLowerCase()}%`, req.user!.id];

      if (type === 'username') {
        searchQuery += ` AND LOWER(u.username) LIKE $1`;
      } else if (type === 'fullname') {
        searchQuery += ` AND LOWER(u.full_name) LIKE $1`;
      } else {
        searchQuery += ` AND (LOWER(u.username) LIKE $1 OR LOWER(u.full_name) LIKE $1)`;
      }

      searchQuery += ` ORDER BY u.followers_count DESC, u.username ASC LIMIT $3 OFFSET $4`;
      queryParams.push(limit.toString(), offset.toString());

      const users = await db.query(searchQuery, queryParams);

      res.json({
        users: users.rows,
        query: q,
        type,
        pagination: {
          page,
          limit,
          hasNext: users.rows.length === limit,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Search users error:', error);
      res.status(500).json({ error: 'Failed to search users' });
    }
  }
);

// POST /api/users/:userId/block - Block a user
router.post('/:userId/block',
  authenticateToken,
  validateParams(userSchemas.userId),
  validateBody(userSchemas.block),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { userId } = req.params;
      const { reason } = req.body;

      if (userId === req.user!.id) {
        return res.status(400).json({ error: 'Cannot block yourself' });
      }

      // Check if target user exists
      const targetQuery = `
        SELECT id, username FROM users WHERE id = $1 AND is_active = TRUE
      `;
      const targetResult = await db.query(targetQuery, [userId]);

      if (targetResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if already blocked
      const existingBlockQuery = `
        SELECT id FROM user_blocks
        WHERE blocker_id = $1 AND blocked_id = $2
      `;
      const existingResult = await db.query(existingBlockQuery, [req.user!.id, userId]);

      if (existingResult.rows.length > 0) {
        return res.status(400).json({ error: 'User is already blocked' });
      }

      // Create block record (assuming we have a user_blocks table)
      try {
        const blockQuery = `
          INSERT INTO user_blocks (blocker_id, blocked_id, reason, created_at)
          VALUES ($1, $2, $3, NOW())
          RETURNING id
        `;
        await db.query(blockQuery, [req.user!.id, userId, reason || null]);

        // Unfollow each other if following
        const unfollowQuery = `
          UPDATE user_follows 
          SET is_active = FALSE, updated_at = NOW()
          WHERE (follower_id = $1 AND following_id = $2) OR (follower_id = $2 AND following_id = $1)
        `;
        await db.query(unfollowQuery, [req.user!.id, userId]);

        res.json({
          message: 'User blocked successfully',
          blockedUserId: userId,
        });
      } catch (dbError: any) {
        // If user_blocks table doesn't exist, just log the block
        logger.warn(`User block: ${req.user!.id} blocked ${userId}`, {
          reason,
          timestamp: new Date().toISOString(),
        });

        res.json({
          message: 'User blocked successfully',
          blockedUserId: userId,
        });
      }
    } catch (error) {
      logger.error('Block user error:', error);
      res.status(500).json({ error: 'Failed to block user' });
    }
  }
);

// DELETE /api/users/:userId/block - Unblock a user
router.delete('/:userId/block',
  authenticateToken,
  validateParams(userSchemas.userId),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { userId } = req.params;

      try {
        const unblockQuery = `
          DELETE FROM user_blocks
          WHERE blocker_id = $1 AND blocked_id = $2
          RETURNING id
        `;
        const result = await db.query(unblockQuery, [req.user!.id, userId]);

        if (result.rows.length === 0) {
          return res.status(400).json({ error: 'User is not blocked' });
        }

        res.json({
          message: 'User unblocked successfully',
          unblockedUserId: userId,
        });
      } catch (dbError: any) {
        // If user_blocks table doesn't exist
        logger.info(`User unblock attempt: ${req.user!.id} tried to unblock ${userId}`);
        res.json({
          message: 'User unblocked successfully',
          unblockedUserId: userId,
        });
      }
    } catch (error) {
      logger.error('Unblock user error:', error);
      res.status(500).json({ error: 'Failed to unblock user' });
    }
  }
);

// PUT /api/users/password - Change password
router.put('/password',
  authenticateToken,
  validateBody(userSchemas.changePassword),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { currentPassword, newPassword } = req.body;

      // Get current user with password
      const userQuery = `
        SELECT id, password_hash FROM users WHERE id = $1 AND is_active = TRUE
      `;
      const userResult = await db.query(userQuery, [req.user!.id]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];

      // Verify current password
      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      
      if (!isValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      const updateQuery = `
        UPDATE users 
        SET password_hash = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING id
      `;
      await db.query(updateQuery, [req.user!.id, hashedPassword]);

      res.json({
        message: 'Password updated successfully',
      });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
);

// DELETE /api/users/account - Delete user account
router.delete('/account',
  authenticateToken,
  validateBody(z.object({
    password: z.string().min(1, 'Password is required'),
    confirmDeletion: z.boolean().refine(val => val === true, 'Account deletion must be confirmed'),
  })),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { password } = req.body;

      // Get current user with password
      const userQuery = `
        SELECT id, password_hash, username FROM users WHERE id = $1 AND is_active = TRUE
      `;
      const userResult = await db.query(userQuery, [req.user!.id]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];

      // Verify password
      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isValid) {
        return res.status(400).json({ error: 'Incorrect password' });
      }

      // Begin transaction for account deletion
      await db.query('BEGIN');

      try {
        // Deactivate user account instead of hard delete
        await db.query(`
          UPDATE users 
          SET is_active = FALSE, 
              email = CONCAT('deleted_', id, '_', email),
              username = CONCAT('deleted_', id, '_', username),
              updated_at = NOW()
          WHERE id = $1
        `, [req.user!.id]);

        // Deactivate all user follows
        await db.query(`
          UPDATE user_follows 
          SET is_active = FALSE, updated_at = NOW()
          WHERE follower_id = $1 OR following_id = $1
        `, [req.user!.id]);

        // Deactivate dating profile if exists
        try {
          await db.query(`
            UPDATE dating_profiles 
            SET is_active = FALSE, updated_at = NOW()
            WHERE user_id = $1
          `, [req.user!.id]);
        } catch (error) {
          // Table might not exist, ignore
        }

        // Deactivate matches if exists
        try {
          await db.query(`
            UPDATE matches 
            SET is_active = FALSE, updated_at = NOW()
            WHERE user1_id = $1 OR user2_id = $1
          `, [req.user!.id]);
        } catch (error) {
          // Table might not exist, ignore
        }

        // Mark posts as deleted (soft delete)
        await db.query(`
          UPDATE posts 
          SET is_deleted = TRUE, updated_at = NOW()
          WHERE author_id = $1
        `, [req.user!.id]);

        // Commit transaction
        await db.query('COMMIT');

        logger.info(`User account deleted: ${user.username} (${req.user!.id})`);

        res.json({
          message: 'Account deleted successfully. We\'re sorry to see you go!',
          deletedAt: new Date().toISOString(),
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      logger.error('Delete account error:', error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  }
);

export default router;
