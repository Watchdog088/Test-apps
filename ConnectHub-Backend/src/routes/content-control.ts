import express from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { contentControlAlgorithm, VisibilityLevel, ContentType, ContentVisibilitySettings, AudienceRule } from '../services/contentControlAlgorithm';
import { validationResult, body, param, query } from 'express-validator';
import logger from '../config/logger';

const router = express.Router();

/**
 * Check if user can view specific content
 */
router.post('/can-view', authenticate, [
  body('contentOwnerId').isString().notEmpty(),
  body('contentId').isString().notEmpty(),
  body('contentType').isIn(['post', 'story', 'comment', 'profile']),
  body('visibilitySettings').isObject()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { contentOwnerId, contentId, contentType, visibilitySettings } = req.body;
    const viewerId = req.user!.id;

    const result = await contentControlAlgorithm.canUserViewContent(
      viewerId,
      contentOwnerId,
      contentId,
      contentType as ContentType,
      visibilitySettings as ContentVisibilitySettings
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Error checking content visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Get filtered feed with content visibility control
 */
router.get('/filtered-feed', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const viewerId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filteredPosts = await contentControlAlgorithm.getFilteredFeed(
      viewerId,
      page,
      limit
    );

    res.json({
      success: true,
      data: {
        posts: filteredPosts,
        page,
        limit,
        hasMore: filteredPosts.length === limit
      }
    });

  } catch (error) {
    logger.error('Error getting filtered feed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Create custom audience based on rules
 */
router.post('/custom-audience', authenticate, [
  body('audienceRule').isObject(),
  body('audienceRule.id').isString().notEmpty(),
  body('audienceRule.name').isString().notEmpty(),
  body('audienceRule.conditions').isArray(),
  body('audienceRule.isActive').isBoolean()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const userId = req.user!.id;
    const { audienceRule } = req.body;

    const matchingUsers = await contentControlAlgorithm.createCustomAudience(
      userId,
      audienceRule as AudienceRule
    );

    res.status(201).json({
      success: true,
      data: {
        audienceId: audienceRule.id,
        audienceName: audienceRule.name,
        memberCount: matchingUsers.length,
        sampleMembers: matchingUsers.slice(0, 5) // Return first 5 members as preview
      }
    });

  } catch (error) {
    logger.error('Error creating custom audience:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Set content visibility for a post
 */
router.put('/post/:postId/visibility', authenticate, [
  param('postId').isString().notEmpty(),
  body('visibilityLevel').isIn(['public', 'friends', 'close_friends', 'followers', 'mutual_friends', 'custom_list', 'private']),
  body('customAudienceIds').optional().isArray(),
  body('excludedUserIds').optional().isArray(),
  body('includedUserIds').optional().isArray(),
  body('locationFilters').optional().isObject(),
  body('demographicFilters').optional().isObject(),
  body('interestFilters').optional().isObject(),
  body('relationshipFilters').optional().isObject()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { postId } = req.params;
    const userId = req.user!.id;
    const visibilitySettings: ContentVisibilitySettings = req.body;

    // Verify user owns the post
    const { prisma } = require('../config/database');
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only modify visibility of your own posts'
      });
    }

    // Update post visibility
    await prisma.post.update({
      where: { id: postId },
      data: {
        visibility: visibilitySettings.visibilityLevel,
        // Store advanced settings in a JSON field (if you add it to schema)
        // visibilitySettings: JSON.stringify(visibilitySettings)
      }
    });

    res.json({
      success: true,
      message: 'Post visibility updated successfully',
      data: {
        postId,
        visibilitySettings
      }
    });

  } catch (error) {
    logger.error('Error updating post visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Get visibility options and user's audience data
 */
router.get('/visibility-options', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { prisma } = require('../config/database');

    // Get user's followers and following counts
    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } })
    ]);

    // Get mutual friends count (simplified)
    const mutualFriends = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          include: {
            followers: {
              where: { followingId: userId }
            }
          }
        }
      }
    });

    const mutualFriendsCount = mutualFriends.filter(f => f.following.followers.length > 0).length;

    res.json({
      success: true,
      data: {
        visibilityLevels: [
          {
            level: 'public',
            name: 'Public',
            description: 'Anyone can see this content',
            audience: 'Everyone'
          },
          {
            level: 'followers',
            name: 'Followers',
            description: 'Only your followers can see this content',
            audience: `${followersCount} followers`
          },
          {
            level: 'friends',
            name: 'Friends',
            description: 'Only people you follow and who follow you back',
            audience: `${mutualFriendsCount} friends`
          },
          {
            level: 'close_friends',
            name: 'Close Friends',
            description: 'Your closest connections',
            audience: `${Math.floor(mutualFriendsCount * 0.3)} close friends`
          },
          {
            level: 'custom_list',
            name: 'Custom Audience',
            description: 'Specific group of people based on your criteria',
            audience: 'Custom selection'
          },
          {
            level: 'private',
            name: 'Only Me',
            description: 'Only you can see this content',
            audience: 'Just you'
          }
        ],
        audienceStats: {
          followers: followersCount,
          following: followingCount,
          mutualFriends: mutualFriendsCount
        }
      }
    });

  } catch (error) {
    logger.error('Error getting visibility options:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Preview audience for given filters
 */
router.post('/preview-audience', authenticate, [
  body('filters').isObject()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const userId = req.user!.id;
    const { filters } = req.body;

    // Create a temporary audience rule for preview
    const previewRule: AudienceRule = {
      id: `preview_${Date.now()}`,
      name: 'Preview Audience',
      conditions: filters.conditions || [],
      isActive: true
    };

    const matchingUsers = await contentControlAlgorithm.createCustomAudience(
      userId,
      previewRule
    );

    res.json({
      success: true,
      data: {
        estimatedReach: matchingUsers.length,
        sampleUsers: matchingUsers.slice(0, 10),
        breakdown: {
          totalPotentialAudience: await contentControlAlgorithm['getPotentialAudienceUsers'](userId).then(users => users.length),
          matchingUsers: matchingUsers.length,
          matchPercentage: Math.round((matchingUsers.length / (await contentControlAlgorithm['getPotentialAudienceUsers'](userId).then(users => users.length)) || 1) * 100)
        }
      }
    });

  } catch (error) {
    logger.error('Error previewing audience:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Block/unblock user from seeing content
 */
router.post('/block-user', authenticate, [
  body('targetUserId').isString().notEmpty(),
  body('action').isIn(['block', 'unblock'])
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const userId = req.user!.id;
    const { targetUserId, action } = req.body;
    const { prisma } = require('../config/database');

    if (action === 'block') {
      // Create a report entry (simplified blocking)
      await prisma.report.create({
        data: {
          reporterId: userId,
          targetId: targetUserId,
          targetType: 'user',
          reason: 'blocked',
          description: 'User blocked from viewing content'
        }
      });
    } else {
      // Remove report entry
      await prisma.report.deleteMany({
        where: {
          reporterId: userId,
          targetId: targetUserId,
          targetType: 'user',
          reason: 'blocked'
        }
      });
    }

    res.json({
      success: true,
      message: `User ${action}ed successfully`,
      data: {
        targetUserId,
        action
      }
    });

  } catch (error) {
    logger.error('Error blocking/unblocking user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
