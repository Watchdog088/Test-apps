import express from 'express';
import { prisma } from '../config/database';
import { body, validationResult, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';
import { matchingAlgorithm } from '../services/matchingAlgorithm';

const router = express.Router();

// Validation rules
const createProfileValidation = [
  body('age').isInt({ min: 18, max: 100 }).withMessage('Age must be between 18-100'),
  body('bio').isLength({ min: 10, max: 500 }).withMessage('Bio must be 10-500 characters'),
  body('interests').isArray({ min: 1, max: 20 }).withMessage('1-20 interests required'),
  body('photos').isArray({ min: 1, max: 6 }).withMessage('1-6 photos required'),
  body('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('location.city').isLength({ min: 1, max: 100 }).withMessage('City required'),
  body('location.country').isLength({ min: 1, max: 100 }).withMessage('Country required'),
  body('preferences.ageMin').isInt({ min: 18, max: 100 }).withMessage('Invalid age minimum'),
  body('preferences.ageMax').isInt({ min: 18, max: 100 }).withMessage('Invalid age maximum'),
  body('preferences.maxDistance').isInt({ min: 1, max: 1000 }).withMessage('Distance 1-1000km'),
  body('preferences.interestedIn').isIn(['male', 'female', 'everyone']).withMessage('Invalid preference')
];

const updateProfileValidation = [
  body('age').optional().isInt({ min: 18, max: 100 }).withMessage('Age must be between 18-100'),
  body('bio').optional().isLength({ min: 10, max: 500 }).withMessage('Bio must be 10-500 characters'),
  body('interests').optional().isArray({ max: 20 }).withMessage('Max 20 interests'),
  body('photos').optional().isArray({ max: 6 }).withMessage('Max 6 photos'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
];

const swipeValidation = [
  body('targetUserId').isLength({ min: 1 }).withMessage('Target user ID required'),
  body('action').isIn(['like', 'pass', 'superlike']).withMessage('Invalid swipe action')
];

const discoveryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
  query('maxDistance').optional().isInt({ min: 1, max: 1000 }).withMessage('Distance 1-1000km'),
  query('ageMin').optional().isInt({ min: 18, max: 100 }).withMessage('Invalid age minimum'),
  query('ageMax').optional().isInt({ min: 18, max: 100 }).withMessage('Invalid age maximum')
];

// POST /api/v1/dating/profile - Create dating profile
router.post('/profile', authenticate, createProfileValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = (req as any).user.id;
    const { age, bio, interests, photos, location, preferences } = req.body;

    // Check if profile already exists
    const existingProfile = await prisma.datingProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Dating profile already exists. Use PUT to update.'
      });
    }

    // Create dating profile
    const profile = await prisma.datingProfile.create({
      data: {
        userId,
        age,
        bio,
        interests: JSON.stringify(interests),
        photos: JSON.stringify(photos),
        location: JSON.stringify(location),
        preferences: JSON.stringify(preferences),
        isActive: true,
        isVerified: false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Dating profile created successfully',
      data: { profile }
    });

  } catch (error) {
    logger.error('Create dating profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/v1/dating/profile - Get current user's dating profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.datingProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Dating profile not found'
      });
    }

    // Parse JSON fields
    const profileData = {
      ...profile,
      interests: JSON.parse(profile.interests),
      photos: JSON.parse(profile.photos),
      location: JSON.parse(profile.location),
      preferences: JSON.parse(profile.preferences)
    };

    res.status(200).json({
      success: true,
      data: { profile: profileData }
    });

  } catch (error) {
    logger.error('Get dating profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/v1/dating/profile - Update dating profile
router.put('/profile', authenticate, updateProfileValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = (req as any).user.id;
    const updateData = req.body;

    // Check if profile exists
    const existingProfile = await prisma.datingProfile.findUnique({
      where: { userId }
    });

    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: 'Dating profile not found'
      });
    }

    // Prepare update data
    const profileUpdate: any = {
      updatedAt: new Date()
    };

    if (updateData.age !== undefined) profileUpdate.age = updateData.age;
    if (updateData.bio !== undefined) profileUpdate.bio = updateData.bio;
    if (updateData.interests !== undefined) profileUpdate.interests = JSON.stringify(updateData.interests);
    if (updateData.photos !== undefined) profileUpdate.photos = JSON.stringify(updateData.photos);
    if (updateData.location !== undefined) profileUpdate.location = JSON.stringify(updateData.location);
    if (updateData.preferences !== undefined) profileUpdate.preferences = JSON.stringify(updateData.preferences);
    if (updateData.isActive !== undefined) profileUpdate.isActive = updateData.isActive;

    const updatedProfile = await prisma.datingProfile.update({
      where: { userId },
      data: profileUpdate
    });

    res.status(200).json({
      success: true,
      message: 'Dating profile updated successfully',
      data: { profile: updatedProfile }
    });

  } catch (error) {
    logger.error('Update dating profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/v1/dating/discover - Discover potential matches
router.get('/discover', authenticate, discoveryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const skip = (page - 1) * limit;

    // Get current user's dating profile
    const userProfile = await prisma.datingProfile.findUnique({
      where: { userId, isActive: true }
    });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Dating profile not found. Please create a profile first.'
      });
    }

    const userPreferences = JSON.parse(userProfile.preferences);

    // Get users already swiped on
    const swipedUserIds = await prisma.swipe.findMany({
      where: { swiperId: userId },
      select: { swipedUserId: true }
    });

    const excludeUserIds = swipedUserIds.map(s => s.swipedUserId);
    excludeUserIds.push(userId); // Exclude self

    // Build filter conditions
    const whereConditions: any = {
      userId: {
        notIn: excludeUserIds
      },
      isActive: true,
      user: {
        isActive: true
      }
    };

    // Apply age filters from user preferences or query params
    const ageMin = parseInt(req.query.ageMin as string) || userPreferences.ageMin;
    const ageMax = parseInt(req.query.ageMax as string) || userPreferences.ageMax;

    if (ageMin) whereConditions.age = { ...whereConditions.age, gte: ageMin };
    if (ageMax) whereConditions.age = { ...whereConditions.age, lte: ageMax };

    // Find potential matches
    const profiles = await prisma.datingProfile.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isVerified: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        lastActive: 'desc'
      }
    });

    // Parse JSON fields and format response
    const formattedProfiles = profiles.map(profile => ({
      ...profile,
      interests: JSON.parse(profile.interests),
      photos: JSON.parse(profile.photos),
      location: JSON.parse(profile.location),
      preferences: JSON.parse(profile.preferences)
    }));

    res.status(200).json({
      success: true,
      data: {
        profiles: formattedProfiles,
        pagination: {
          page,
          limit,
          hasNext: profiles.length === limit,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    logger.error('Discover profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/v1/dating/swipe - Swipe on a user
router.post('/swipe', authenticate, swipeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const swiperId = (req as any).user.id;
    const { targetUserId, action } = req.body;

    if (swiperId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot swipe on yourself'
      });
    }

    // Check if target user exists and has active dating profile
    const targetProfile = await prisma.datingProfile.findFirst({
      where: {
        userId: targetUserId,
        isActive: true,
        user: { isActive: true }
      }
    });

    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found or inactive'
      });
    }

    // Check if already swiped
    const existingSwipe = await prisma.swipe.findUnique({
      where: {
        swiperId_swipedUserId: {
          swiperId,
          swipedUserId: targetUserId
        }
      }
    });

    if (existingSwipe) {
      return res.status(400).json({
        success: false,
        message: 'You have already swiped on this user'
      });
    }

    // Record the swipe
    const swipe = await prisma.swipe.create({
      data: {
        swiperId,
        swipedUserId: targetUserId,
        action
      }
    });

    let isMatch = false;
    let matchId = null;

    // Check for mutual like (match) if action is like or superlike
    if (action === 'like' || action === 'superlike') {
      const mutualSwipe = await prisma.swipe.findFirst({
        where: {
          swiperId: targetUserId,
          swipedUserId: swiperId,
          action: { in: ['like', 'superlike'] }
        }
      });

      if (mutualSwipe) {
        // It's a match! Create match record
        isMatch = true;

        // Use consistent ordering for user IDs
        const user1Id = swiperId < targetUserId ? swiperId : targetUserId;
        const user2Id = swiperId < targetUserId ? targetUserId : swiperId;

        const match = await prisma.match.upsert({
          where: {
            user1Id_user2Id: {
              user1Id,
              user2Id
            }
          },
          update: {
            isActive: true
          },
          create: {
            user1Id,
            user2Id,
            isActive: true
          }
        });

        matchId = match.id;
        logger.info(`New match created: ${swiperId} ↔ ${targetUserId}`);
      }
    }

    res.status(200).json({
      success: true,
      message: isMatch ? "It's a match! 🎉" : 'Swipe recorded successfully',
      data: {
        swipe,
        isMatch,
        matchId
      }
    });

  } catch (error) {
    logger.error('Swipe action error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/v1/dating/matches - Get user's matches
router.get('/matches', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    // Get matches where user is involved
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ],
        isActive: true
      },
      include: {
        user1: {
          include: {
            datingProfile: true
          }
        },
        user2: {
          include: {
            datingProfile: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Format matches to show the other user
    const formattedMatches = matches.map(match => {
      const otherUser = match.user1Id === userId ? match.user2 : match.user1;
      const otherProfile = otherUser.datingProfile;

      return {
        matchId: match.id,
        matchedAt: match.createdAt,
        otherUser: {
          id: otherUser.id,
          username: otherUser.username,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          avatar: otherUser.avatar,
          isVerified: otherUser.isVerified
        },
        profile: otherProfile ? {
          age: otherProfile.age,
          bio: otherProfile.bio,
          photos: JSON.parse(otherProfile.photos),
          interests: JSON.parse(otherProfile.interests)
        } : null,
        lastMessageAt: match.lastMessageAt
      };
    });

    // Get total count
    const total = await prisma.match.count({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ],
        isActive: true
      }
    });

    res.status(200).json({
      success: true,
      data: {
        matches: formattedMatches,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    logger.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/v1/dating/matches/:matchId - Unmatch
router.delete('/matches/:matchId', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { matchId } = req.params;

    // Verify user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ],
        isActive: true
      }
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found or access denied'
      });
    }

    // Deactivate the match
    await prisma.match.update({
      where: { id: matchId },
      data: {
        isActive: false
      }
    });

    res.status(200).json({
      success: true,
      message: 'Match removed successfully',
      data: { matchId }
    });

  } catch (error) {
    logger.error('Remove match error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/v1/dating/stats - Get user's dating stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // Get various stats in parallel
    const [likesSent, likesReceived, totalMatches, profileViews] = await Promise.all([
      // Likes sent
      prisma.swipe.count({
        where: {
          swiperId: userId,
          action: { in: ['like', 'superlike'] }
        }
      }),

      // Likes received
      prisma.swipe.count({
        where: {
          swipedUserId: userId,
          action: { in: ['like', 'superlike'] }
        }
      }),

      // Total active matches
      prisma.match.count({
        where: {
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ],
          isActive: true
        }
      }),

      // Profile views (unique users who swiped)
      prisma.swipe.count({
        where: {
          swipedUserId: userId
        }
      })
    ]);

    const stats = {
      totalLikesSent: likesSent,
      totalLikesReceived: likesReceived,
      totalMatches: totalMatches,
      profileViews: profileViews,
      matchRate: likesSent > 0 ? (totalMatches / likesSent * 100) : 0
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    logger.error('Get dating stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/v1/dating/smart-matches - AI-powered smart matching
router.get('/smart-matches', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 20);

    // Check if user has a dating profile
    const userProfile = await prisma.datingProfile.findUnique({
      where: { userId, isActive: true }
    });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Dating profile not found. Please create a profile first.'
      });
    }

    // Get AI-powered smart matches
    const smartMatches = await matchingAlgorithm.getSmartMatches(userId, limit);

    // Get detailed profile information for each match
    const detailedMatches = await Promise.all(
      smartMatches.map(async (match) => {
        const profile = await prisma.datingProfile.findUnique({
          where: { userId: match.userId },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
                isVerified: true
              }
            }
          }
        });

        if (!profile) return null;

        return {
          user: profile.user,
          profile: {
            age: profile.age,
            bio: profile.bio,
            photos: JSON.parse(profile.photos),
            interests: JSON.parse(profile.interests),
            location: JSON.parse(profile.location)
          },
          matchScore: {
            overall: Math.round(match.overallScore * 100),
            compatibility: Math.round(match.compatibilityScore * 100),
            interests: Math.round(match.interestScore * 100),
            activity: Math.round(match.activityScore * 100),
            location: Math.round(match.locationScore * 100),
            reasons: match.reasons
          }
        };
      })
    );

    // Filter out null results
    const validMatches = detailedMatches.filter(match => match !== null);

    res.status(200).json({
      success: true,
      message: 'AI-powered smart matches generated successfully',
      data: {
        matches: validMatches,
        algorithm: 'ConnectHub AI Matching v1.0',
        totalFound: validMatches.length
      }
    });

  } catch (error) {
    logger.error('Smart matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating smart matches'
    });
  }
});

// POST /api/v1/dating/update-preferences - Update AI preferences based on behavior
router.post('/update-preferences', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // Check if user has a dating profile
    const userProfile = await prisma.datingProfile.findUnique({
      where: { userId, isActive: true }
    });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Dating profile not found'
      });
    }

    // Update user preferences based on swiping behavior
    await matchingAlgorithm.updateUserPreferences(userId);

    res.status(200).json({
      success: true,
      message: 'AI preferences updated based on your activity',
      data: {
        updated: true,
        message: 'Future matches will be more personalized'
      }
    });

  } catch (error) {
    logger.error('Update AI preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences'
    });
  }
});

// GET /api/v1/dating/compatibility/:targetUserId - Get compatibility score with specific user
router.get('/compatibility/:targetUserId', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { targetUserId } = req.params;

    if (userId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot check compatibility with yourself'
      });
    }

    // Check if both users have dating profiles
    const [userProfile, targetProfile] = await Promise.all([
      prisma.datingProfile.findUnique({
        where: { userId, isActive: true },
        include: { user: true }
      }),
      prisma.datingProfile.findUnique({
        where: { userId: targetUserId, isActive: true },
        include: { user: true }
      })
    ]);

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Your dating profile not found'
      });
    }

    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        message: 'Target user profile not found'
      });
    }

    // Transform profiles for AI algorithm
    const userProfileData = {
      id: userId,
      age: userProfile.age,
      bio: userProfile.bio,
      interests: JSON.parse(userProfile.interests),
      photos: JSON.parse(userProfile.photos),
      location: JSON.parse(userProfile.location),
      preferences: JSON.parse(userProfile.preferences),
      lastActive: userProfile.lastActive,
      isVerified: userProfile.user.isVerified
    };

    const targetProfileData = {
      id: targetUserId,
      age: targetProfile.age,
      bio: targetProfile.bio,
      interests: JSON.parse(targetProfile.interests),
      photos: JSON.parse(targetProfile.photos),
      location: JSON.parse(targetProfile.location),
      preferences: JSON.parse(targetProfile.preferences),
      lastActive: targetProfile.lastActive,
      isVerified: targetProfile.user.isVerified
    };

    // Calculate compatibility score
    const compatibility = matchingAlgorithm.calculateMatchScore(userProfileData, targetProfileData);

    res.status(200).json({
      success: true,
      data: {
        targetUser: {
          id: targetProfile.user.id,
          firstName: targetProfile.user.firstName,
          lastName: targetProfile.user.lastName,
          avatar: targetProfile.user.avatar
        },
        compatibility: {
          overall: Math.round(compatibility.overallScore * 100),
          breakdown: {
            compatibility: Math.round(compatibility.compatibilityScore * 100),
            interests: Math.round(compatibility.interestScore * 100),
            activity: Math.round(compatibility.activityScore * 100),
            location: Math.round(compatibility.locationScore * 100)
          },
          reasons: compatibility.reasons,
          interpretation: compatibility.overallScore >= 0.8 ? 'Excellent Match' :
                          compatibility.overallScore >= 0.6 ? 'Great Match' :
                          compatibility.overallScore >= 0.4 ? 'Good Match' :
                          compatibility.overallScore >= 0.2 ? 'Fair Match' : 'Low Match'
        }
      }
    });

  } catch (error) {
    logger.error('Compatibility check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating compatibility'
    });
  }
});

export default router;
