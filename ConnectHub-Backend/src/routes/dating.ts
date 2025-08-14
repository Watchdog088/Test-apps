import express from 'express';
import { z } from 'zod';
import { getDB } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateBody, validateParams, validateQuery, schemas } from '../middleware/validation';
import { AuthenticatedRequest } from '../middleware/auth';
import logger from '../config/logger';

const router = express.Router();

// Dating-specific validation schemas
const datingSchemas = {
  userId: z.object({
    userId: z.string().uuid('Invalid user ID format'),
  }),

  matchId: z.object({
    matchId: z.string().uuid('Invalid match ID format'),
  }),

  createProfile: z.object({
    age: z.number().min(18, 'Must be at least 18 years old').max(100),
    bio: z.string().min(10, 'Bio must be at least 10 characters').max(500),
    interests: z.array(z.string()).min(1, 'At least one interest is required').max(20),
    photos: z.array(z.string().url()).min(1, 'At least one photo is required').max(6),
    location: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      city: z.string().min(1).max(100),
      country: z.string().min(1).max(100),
    }),
    lookingFor: z.enum(['friendship', 'dating', 'relationship', 'marriage']),
    preferences: z.object({
      ageMin: z.number().min(18).max(100),
      ageMax: z.number().min(18).max(100),
      maxDistance: z.number().min(1).max(1000),
      interestedIn: z.enum(['men', 'women', 'everyone']),
    }),
  }),

  updateProfile: z.object({
    age: z.number().min(18).max(100).optional(),
    bio: z.string().min(10).max(500).optional(),
    interests: z.array(z.string()).max(20).optional(),
    photos: z.array(z.string().url()).max(6).optional(),
    location: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      city: z.string().min(1).max(100),
      country: z.string().min(1).max(100),
    }).optional(),
    lookingFor: z.enum(['friendship', 'dating', 'relationship', 'marriage']).optional(),
    preferences: z.object({
      ageMin: z.number().min(18).max(100).optional(),
      ageMax: z.number().min(18).max(100).optional(),
      maxDistance: z.number().min(1).max(1000).optional(),
      interestedIn: z.enum(['men', 'women', 'everyone']).optional(),
    }).optional(),
    isActive: z.boolean().optional(),
  }),

  swipeAction: z.object({
    targetUserId: z.string().uuid('Invalid user ID format'),
    action: z.enum(['like', 'pass', 'super_like']),
  }),

  discoveryQuery: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
    maxDistance: z.coerce.number().min(1).max(1000).optional(),
    ageMin: z.coerce.number().min(18).max(100).optional(),
    ageMax: z.coerce.number().min(18).max(100).optional(),
    interests: z.array(z.string()).optional(),
  }),

  reportUser: z.object({
    targetUserId: z.string().uuid('Invalid user ID format'),
    reason: z.enum(['inappropriate_photos', 'harassment', 'spam', 'fake_profile', 'underage', 'other']),
    description: z.string().max(500).optional(),
  }),
};

// POST /api/dating/profile - Create or update dating profile
router.post('/profile',
  authenticateToken,
  validateBody(datingSchemas.createProfile),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { age, bio, interests, photos, location, lookingFor, preferences } = req.body;

      // Check if profile already exists
      const existingQuery = `
        SELECT id FROM dating_profiles WHERE user_id = $1
      `;
      const existingResult = await db.query(existingQuery, [req.user!.id]);

      if (existingResult.rows.length > 0) {
        // Update existing profile
        const updateQuery = `
          UPDATE dating_profiles
          SET age = $2, looking_for = $3, max_distance = $4, age_min = $5, age_max = $6,
              photos = $7, prompt_answers = $8, updated_at = NOW()
          WHERE user_id = $1
          RETURNING *
        `;
        
        const promptAnswers = {
          bio,
          interests,
          location,
          preferences,
        };

        const result = await db.query(updateQuery, [
          req.user!.id,
          age,
          lookingFor,
          preferences.maxDistance,
          preferences.ageMin,
          preferences.ageMax,
          photos,
          JSON.stringify(promptAnswers),
        ]);

        return res.json({
          profile: result.rows[0],
          message: 'Dating profile updated successfully',
        });
      } else {
        // Create new profile
        const insertQuery = `
          INSERT INTO dating_profiles (user_id, age, looking_for, max_distance, age_min, age_max, photos, prompt_answers)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;
        
        const promptAnswers = {
          bio,
          interests,
          location,
          preferences,
        };

        const result = await db.query(insertQuery, [
          req.user!.id,
          age,
          lookingFor,
          preferences.maxDistance,
          preferences.ageMin,
          preferences.ageMax,
          photos,
          JSON.stringify(promptAnswers),
        ]);

        res.status(201).json({
          profile: result.rows[0],
          message: 'Dating profile created successfully',
        });
      }
    } catch (error) {
      logger.error('Create/update dating profile error:', error);
      res.status(500).json({ error: 'Failed to create/update dating profile' });
    }
  }
);

// GET /api/dating/profile - Get current user's dating profile
router.get('/profile',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      
      const profileQuery = `
        SELECT 
          dp.*,
          u.username,
          u.full_name,
          u.avatar_url
        FROM dating_profiles dp
        JOIN users u ON u.id = dp.user_id
        WHERE dp.user_id = $1
      `;
      
      const result = await db.query(profileQuery, [req.user!.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Dating profile not found' });
      }

      const profile = result.rows[0];
      
      // Parse prompt_answers JSON
      if (profile.prompt_answers) {
        profile.prompt_answers = JSON.parse(profile.prompt_answers);
      }

      res.json({ profile });
    } catch (error) {
      logger.error('Get dating profile error:', error);
      res.status(500).json({ error: 'Failed to fetch dating profile' });
    }
  }
);

// PUT /api/dating/profile - Update dating profile
router.put('/profile',
  authenticateToken,
  validateBody(datingSchemas.updateProfile),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const updateData = req.body;

      // Check if profile exists
      const existingQuery = `
        SELECT id, prompt_answers FROM dating_profiles WHERE user_id = $1
      `;
      const existingResult = await db.query(existingQuery, [req.user!.id]);

      if (existingResult.rows.length === 0) {
        return res.status(404).json({ error: 'Dating profile not found' });
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateValues: any[] = [req.user!.id];
      let paramIndex = 2;

      if (updateData.age !== undefined) {
        updateFields.push(`age = $${paramIndex++}`);
        updateValues.push(updateData.age);
      }

      if (updateData.lookingFor !== undefined) {
        updateFields.push(`looking_for = $${paramIndex++}`);
        updateValues.push(updateData.lookingFor);
      }

      if (updateData.photos !== undefined) {
        updateFields.push(`photos = $${paramIndex++}`);
        updateValues.push(updateData.photos);
      }

      if (updateData.isActive !== undefined) {
        updateFields.push(`is_active = $${paramIndex++}`);
        updateValues.push(updateData.isActive);
      }

      // Update preferences in prompt_answers
      if (updateData.preferences || updateData.bio || updateData.interests || updateData.location) {
        const currentAnswers = existingResult.rows[0].prompt_answers 
          ? JSON.parse(existingResult.rows[0].prompt_answers) 
          : {};

        const updatedAnswers = {
          ...currentAnswers,
          ...(updateData.bio && { bio: updateData.bio }),
          ...(updateData.interests && { interests: updateData.interests }),
          ...(updateData.location && { location: updateData.location }),
          ...(updateData.preferences && { 
            preferences: { ...currentAnswers.preferences, ...updateData.preferences } 
          }),
        };

        updateFields.push(`prompt_answers = $${paramIndex++}`);
        updateValues.push(JSON.stringify(updatedAnswers));

        // Update preferences in main table if provided
        if (updateData.preferences) {
          if (updateData.preferences.ageMin !== undefined) {
            updateFields.push(`age_min = $${paramIndex++}`);
            updateValues.push(updateData.preferences.ageMin);
          }
          if (updateData.preferences.ageMax !== undefined) {
            updateFields.push(`age_max = $${paramIndex++}`);
            updateValues.push(updateData.preferences.ageMax);
          }
          if (updateData.preferences.maxDistance !== undefined) {
            updateFields.push(`max_distance = $${paramIndex++}`);
            updateValues.push(updateData.preferences.maxDistance);
          }
        }
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      updateFields.push('updated_at = NOW()');

      const updateQuery = `
        UPDATE dating_profiles 
        SET ${updateFields.join(', ')}
        WHERE user_id = $1
        RETURNING *
      `;

      const result = await db.query(updateQuery, updateValues);

      res.json({
        profile: result.rows[0],
        message: 'Dating profile updated successfully',
      });
    } catch (error) {
      logger.error('Update dating profile error:', error);
      res.status(500).json({ error: 'Failed to update dating profile' });
    }
  }
);

// GET /api/dating/discover - Discover potential matches
router.get('/discover',
  authenticateToken,
  validateQuery(datingSchemas.discoveryQuery),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { page = 1, limit = 10, maxDistance, ageMin, ageMax, interests } = req.query as any;
      const offset = (page - 1) * limit;

      // Get current user's profile and preferences
      const userProfileQuery = `
        SELECT * FROM dating_profiles WHERE user_id = $1 AND is_active = TRUE
      `;
      const userProfileResult = await db.query(userProfileQuery, [req.user!.id]);

      if (userProfileResult.rows.length === 0) {
        return res.status(404).json({ error: 'Dating profile not found. Please create a profile first.' });
      }

      const userProfile = userProfileResult.rows[0];
      const userPreferences = userProfile.prompt_answers 
        ? JSON.parse(userProfile.prompt_answers).preferences 
        : {};

      // Build discovery query
      let discoveryQuery = `
        SELECT DISTINCT
          dp.user_id,
          dp.age,
          dp.photos,
          dp.prompt_answers,
          u.username,
          u.full_name,
          u.avatar_url
        FROM dating_profiles dp
        JOIN users u ON u.id = dp.user_id
        WHERE dp.user_id != $1
        AND dp.is_active = TRUE
        AND u.is_active = TRUE
      `;

      const queryParams: any[] = [req.user!.id];
      let paramIndex = 2;

      // Apply age filters
      const effectiveAgeMin = ageMin || userProfile.age_min;
      const effectiveAgeMax = ageMax || userProfile.age_max;
      if (effectiveAgeMin) {
        discoveryQuery += ` AND dp.age >= $${paramIndex++}`;
        queryParams.push(effectiveAgeMin);
      }
      if (effectiveAgeMax) {
        discoveryQuery += ` AND dp.age <= $${paramIndex++}`;
        queryParams.push(effectiveAgeMax);
      }

      // Exclude users already swiped on
      discoveryQuery += `
        AND dp.user_id NOT IN (
          SELECT target_user_id FROM dating_interactions WHERE user_id = $1
        )
      `;

      // Add interest filtering if provided
      if (interests && interests.length > 0) {
        discoveryQuery += `
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(dp.prompt_answers->'interests') AS interest
            WHERE interest = ANY($${paramIndex++}::text[])
          )
        `;
        queryParams.push(interests);
      }

      // Order by random for discovery
      discoveryQuery += ` ORDER BY RANDOM() LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      queryParams.push(limit, offset);

      const result = await db.query(discoveryQuery, queryParams);

      // Parse prompt_answers for each profile
      const profiles = result.rows.map(profile => ({
        ...profile,
        prompt_answers: profile.prompt_answers ? JSON.parse(profile.prompt_answers) : null,
      }));

      res.json({
        profiles,
        pagination: {
          page,
          limit,
          hasNext: profiles.length === limit,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Discover profiles error:', error);
      res.status(500).json({ error: 'Failed to discover profiles' });
    }
  }
);

// POST /api/dating/swipe - Swipe on a user (like/pass/super_like)
router.post('/swipe',
  authenticateToken,
  validateBody(datingSchemas.swipeAction),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { targetUserId, action } = req.body;

      // Validate target user exists and has active profile
      const targetQuery = `
        SELECT u.id, u.username, dp.is_active
        FROM users u
        JOIN dating_profiles dp ON dp.user_id = u.id
        WHERE u.id = $1 AND u.is_active = TRUE AND dp.is_active = TRUE
      `;
      const targetResult = await db.query(targetQuery, [targetUserId]);

      if (targetResult.rows.length === 0) {
        return res.status(404).json({ error: 'Target user not found or inactive' });
      }

      // Check if user already swiped on this target
      const existingSwipeQuery = `
        SELECT id, type FROM dating_interactions
        WHERE user_id = $1 AND target_user_id = $2
      `;
      const existingResult = await db.query(existingSwipeQuery, [req.user!.id, targetUserId]);

      if (existingResult.rows.length > 0) {
        return res.status(400).json({ error: 'You have already swiped on this user' });
      }

      // Record the swipe
      const swipeQuery = `
        INSERT INTO dating_interactions (user_id, target_user_id, type)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const swipeResult = await db.query(swipeQuery, [req.user!.id, targetUserId, action]);

      let isMatch = false;
      let matchId = null;

      // Check for mutual like (match) if the action is like or super_like
      if (action === 'like' || action === 'super_like') {
        const mutualLikeQuery = `
          SELECT id FROM dating_interactions
          WHERE user_id = $1 AND target_user_id = $2 AND type IN ('like', 'super_like')
        `;
        const mutualResult = await db.query(mutualLikeQuery, [targetUserId, req.user!.id]);

        if (mutualResult.rows.length > 0) {
          // It's a match! Create match record
          isMatch = true;
          
          const createMatchQuery = `
            INSERT INTO matches (user1_id, user2_id, matched_at)
            VALUES (
              LEAST($1::uuid, $2::uuid),
              GREATEST($1::uuid, $2::uuid),
              NOW()
            )
            ON CONFLICT (user1_id, user2_id) DO UPDATE SET 
              matched_at = NOW(),
              is_active = TRUE
            RETURNING id
          `;
          const matchResult = await db.query(createMatchQuery, [req.user!.id, targetUserId]);
          matchId = matchResult.rows[0].id;

          logger.info(`New match created: ${req.user!.id} ↔ ${targetUserId}`);
        }
      }

      res.json({
        swipe: swipeResult.rows[0],
        isMatch,
        matchId,
        message: isMatch ? 'It\'s a match! 🎉' : 'Swipe recorded successfully',
      });
    } catch (error) {
      logger.error('Swipe action error:', error);
      res.status(500).json({ error: 'Failed to process swipe' });
    }
  }
);

// GET /api/dating/matches - Get user's matches
router.get('/matches',
  authenticateToken,
  validateQuery(schemas.pagination),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { page = 1, limit = 20 } = req.query as any;
      const offset = (page - 1) * limit;

      const matchesQuery = `
        SELECT 
          m.id as match_id,
          m.matched_at,
          CASE 
            WHEN m.user1_id = $1 THEN m.user2_id
            ELSE m.user1_id
          END as other_user_id,
          u.username,
          u.full_name,
          u.avatar_url,
          dp.age,
          dp.photos,
          dp.prompt_answers,
          -- Get last message
          (
            SELECT content FROM messages msg
            WHERE (
              (msg.sender_id = $1 AND msg.recipient_id = CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END) OR
              (msg.recipient_id = $1 AND msg.sender_id = CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END)
            )
            ORDER BY msg.created_at DESC
            LIMIT 1
          ) as last_message,
          -- Get unread count
          (
            SELECT COUNT(*) FROM messages msg
            WHERE msg.recipient_id = $1 
            AND msg.sender_id = CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END
            AND msg.is_read = FALSE
          ) as unread_count
        FROM matches m
        JOIN users u ON u.id = CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END
        JOIN dating_profiles dp ON dp.user_id = u.id
        WHERE (m.user1_id = $1 OR m.user2_id = $1)
        AND m.is_active = TRUE
        AND u.is_active = TRUE
        ORDER BY m.matched_at DESC
        LIMIT $2 OFFSET $3
      `;

      const matches = await db.query(matchesQuery, [req.user!.id, limit, offset]);

      // Parse prompt_answers for each match
      const matchesWithParsedData = matches.rows.map(match => ({
        ...match,
        prompt_answers: match.prompt_answers ? JSON.parse(match.prompt_answers) : null,
        unread_count: parseInt(match.unread_count),
      }));

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM matches m
        WHERE (m.user1_id = $1 OR m.user2_id = $1) AND m.is_active = TRUE
      `;
      const countResult = await db.query(countQuery, [req.user!.id]);
      const total = parseInt(countResult.rows[0].total);

      res.json({
        matches: matchesWithParsedData,
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
      logger.error('Get matches error:', error);
      res.status(500).json({ error: 'Failed to fetch matches' });
    }
  }
);

// DELETE /api/dating/matches/:matchId - Unmatch (delete match)
router.delete('/matches/:matchId',
  authenticateToken,
  validateParams(datingSchemas.matchId),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { matchId } = req.params;

      // Verify user is part of this match
      const matchQuery = `
        SELECT id, user1_id, user2_id
        FROM matches
        WHERE id = $1 AND (user1_id = $2 OR user2_id = $2) AND is_active = TRUE
      `;
      const matchResult = await db.query(matchQuery, [matchId, req.user!.id]);

      if (matchResult.rows.length === 0) {
        return res.status(404).json({ error: 'Match not found or access denied' });
      }

      // Deactivate the match instead of deleting
      const deactivateQuery = `
        UPDATE matches
        SET is_active = FALSE, updated_at = NOW()
        WHERE id = $1
        RETURNING id
      `;
      await db.query(deactivateQuery, [matchId]);

      res.json({
        message: 'Match removed successfully',
        matchId,
      });
    } catch (error) {
      logger.error('Remove match error:', error);
      res.status(500).json({ error: 'Failed to remove match' });
    }
  }
);

// POST /api/dating/report - Report a user
router.post('/report',
  authenticateToken,
  validateBody(datingSchemas.reportUser),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { targetUserId, reason, description } = req.body;

      // Validate target user exists
      const targetQuery = `
        SELECT id FROM users WHERE id = $1 AND is_active = TRUE
      `;
      const targetResult = await db.query(targetQuery, [targetUserId]);

      if (targetResult.rows.length === 0) {
        return res.status(404).json({ error: 'Target user not found' });
      }

      // Check if user already reported this target
      const existingReportQuery = `
        SELECT id FROM user_reports
        WHERE reporter_id = $1 AND reported_user_id = $2
      `;
      const existingResult = await db.query(existingReportQuery, [req.user!.id, targetUserId]);

      if (existingResult.rows.length > 0) {
        return res.status(400).json({ error: 'You have already reported this user' });
      }

      // Create report (assuming we have a user_reports table)
      const reportQuery = `
        INSERT INTO user_reports (reporter_id, reported_user_id, reason, description, status, created_at)
        VALUES ($1, $2, $3, $4, 'pending', NOW())
        RETURNING id
      `;
      
      try {
        const result = await db.query(reportQuery, [req.user!.id, targetUserId, reason, description || null]);
        
        res.status(201).json({
          message: 'User reported successfully. Our team will review this report.',
          reportId: result.rows[0].id,
        });
      } catch (dbError: any) {
        // If user_reports table doesn't exist, log the report for now
        logger.warn(`User report: ${req.user!.id} reported ${targetUserId} for ${reason}`, {
          description,
          timestamp: new Date().toISOString(),
        });

        res.status(201).json({
          message: 'User reported successfully. Our team will review this report.',
        });
      }
    } catch (error) {
      logger.error('Report user error:', error);
      res.status(500).json({ error: 'Failed to report user' });
    }
  }
);

// GET /api/dating/stats - Get user's dating stats
router.get('/stats',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();

      // Get various stats
      const statsQueries = await Promise.all([
        // Total likes sent
        db.query(`
          SELECT COUNT(*) as total_likes_sent
          FROM dating_interactions
          WHERE user_id = $1 AND type IN ('like', 'super_like')
        `, [req.user!.id]),

        // Total likes received
        db.query(`
          SELECT COUNT(*) as total_likes_received
          FROM dating_interactions
          WHERE target_user_id = $1 AND type IN ('like', 'super_like')
        `, [req.user!.id]),

        // Total matches
        db.query(`
          SELECT COUNT(*) as total_matches
          FROM matches
          WHERE (user1_id = $1 OR user2_id = $1) AND is_active = TRUE
        `, [req.user!.id]),

        // Profile views (if we track them)
        db.query(`
          SELECT COUNT(DISTINCT user_id) as profile_views
          FROM dating_interactions
          WHERE target_user_id = $1
        `, [req.user!.id]),
      ]);

      const stats = {
        totalLikesSent: parseInt(statsQueries[0].rows[0].total_likes_sent),
        totalLikesReceived: parseInt(statsQueries[1].rows[0].total_likes_received),
        totalMatches: parseInt(statsQueries[2].rows[0].total_matches),
        profileViews: parseInt(statsQueries[3].rows[0].profile_views),
        matchRate: 0,
      };

      // Calculate match rate
      if (stats.totalLikesSent > 0) {
        stats.matchRate = (stats.totalMatches / stats.totalLikesSent * 100);
      }

      res.json({ stats });
    } catch (error) {
      logger.error('Get dating stats error:', error);
      res.status(500).json({ error: 'Failed to fetch dating stats' });
    }
  }
);

export default router;
