import express from 'express';
import { prisma } from '../config/database';
import { body, validationResult, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('firstName').optional().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
  body('lastName').optional().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be max 500 characters'),
  body('location').optional().isLength({ max: 100 }).withMessage('Location must be max 100 characters'),
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  body('phone').optional().matches(/^\+?[\d\s-()]+$/).withMessage('Invalid phone format'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be boolean'),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender'),
];

const searchValidation = [
  query('q').isLength({ min: 1, max: 100 }).withMessage('Search query required, max 100 chars'),
  query('type').optional().isIn(['username', 'fullname', 'all']).withMessage('Invalid search type'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50')
];

const changePasswordValidation = [
  body('currentPassword').isLength({ min: 1 }).withMessage('Current password required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain lowercase, uppercase, and number')
];

// GET /api/v1/users/profile - Get current user's profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.user.findUnique({
      where: { 
        id: userId,
        isActive: true 
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        location: true,
        website: true,
        avatar: true,
        dateOfBirth: true,
        phone: true,
        isPrivate: true,
        isVerified: true,
        isActive: true,
        gender: true,
        followersCount: true,
        followingCount: true,
        postsCount: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { profile }
    });

  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/v1/users/profile - Update current user's profile
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

    const updatedProfile = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        location: true,
        website: true,
        avatar: true,
        isPrivate: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile: updatedProfile }
    });

  } catch (error) {
    logger.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/v1/users/:userId - Get user profile by ID
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user.id;

    const profile = await prisma.user.findUnique({
      where: { 
        id: userId,
        isActive: true 
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        location: true,
        website: true,
        avatar: true,
        isPrivate: true,
        isVerified: true,
        followersCount: true,
        followingCount: true,
        postsCount: true,
        createdAt: true
      }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current user follows this user
    const isFollowing = await prisma.follow.findFirst({
      where: {
        followerId: currentUserId,
        followingId: userId
      }
    });

    // Check if this user follows current user back
    const followsYou = await prisma.follow.findFirst({
      where: {
        followerId: userId,
        followingId: currentUserId
      }
    });

    const responseProfile = {
      ...profile,
      isFollowing: !!isFollowing,
      followsYou: !!followsYou
    };

    // If account is private and current user doesn't follow, limit info
    if (profile.isPrivate && !isFollowing && profile.id !== currentUserId) {
      const limitedProfile = {
        id: profile.id,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatar: profile.avatar,
        isPrivate: true,
        isVerified: profile.isVerified,
        followersCount: profile.followersCount,
        followingCount: profile.followingCount,
        isFollowing: false,
        followsYou: !!followsYou
      };
      
      return res.status(200).json({
        success: true,
        data: { profile: limitedProfile },
        isLimited: true
      });
    }

    res.status(200).json({
      success: true,
      data: { profile: responseProfile }
    });

  } catch (error) {
    logger.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/v1/users/:userId/follow - Follow a user
router.post('/:userId/follow', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user.id;

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { 
        id: userId,
        isActive: true 
      },
      select: {
        id: true,
        username: true,
        isPrivate: true
      }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId: currentUserId,
        followingId: userId
      }
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }

    // Create new follow
    await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: userId
      }
    });

    // Update follower counts
    await prisma.user.update({
      where: { id: userId },
      data: {
        followersCount: { increment: 1 },
        updatedAt: new Date()
      }
    });

    await prisma.user.update({
      where: { id: currentUserId },
      data: {
        followingCount: { increment: 1 },
        updatedAt: new Date()
      }
    });

    const responseMessage = targetUser.isPrivate 
      ? 'Follow request sent' 
      : 'Now following user';

    res.status(200).json({
      success: true,
      message: responseMessage,
      data: {
        isPrivate: targetUser.isPrivate,
        username: targetUser.username
      }
    });

  } catch (error) {
    logger.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/v1/users/:userId/follow - Unfollow a user
router.delete('/:userId/follow', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user.id;

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot unfollow yourself'
      });
    }

    // Check if following
    const follow = await prisma.follow.findFirst({
      where: {
        followerId: currentUserId,
        followingId: userId
      }
    });

    if (!follow) {
      return res.status(400).json({
        success: false,
        message: 'Not following this user'
      });
    }

    // Delete follow
    await prisma.follow.delete({
      where: { id: follow.id }
    });

    // Update follower counts
    await prisma.user.update({
      where: { id: userId },
      data: {
        followersCount: { decrement: 1 },
        updatedAt: new Date()
      }
    });

    await prisma.user.update({
      where: { id: currentUserId },
      data: {
        followingCount: { decrement: 1 },
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Unfollowed user successfully'
    });

  } catch (error) {
    logger.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/v1/users/:userId/followers - Get user's followers
router.get('/:userId/followers', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    // Check if user exists and if profile is accessible
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
      select: { 
        id: true,
        isPrivate: true 
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current user follows this user
    const isFollowing = await prisma.follow.findFirst({
      where: {
        followerId: currentUserId,
        followingId: userId
      }
    });

    // Check access permissions
    if (user.isPrivate && !isFollowing && userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private profile'
      });
    }

    // Get followers with pagination
    const followers = await prisma.follow.findMany({
      where: {
        followingId: userId
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isVerified: true,
            bio: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Get total count
    const total = await prisma.follow.count({
      where: {
        followingId: userId
      }
    });

    res.status(200).json({
      success: true,
      data: {
        followers: followers.map(f => f.follower),
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
    logger.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/v1/users/:userId/following - Get users that this user follows
router.get('/:userId/following', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    // Check if user exists and if profile is accessible
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
      select: { 
        id: true,
        isPrivate: true 
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current user follows this user
    const isFollowing = await prisma.follow.findFirst({
      where: {
        followerId: currentUserId,
        followingId: userId
      }
    });

    // Check access permissions
    if (user.isPrivate && !isFollowing && userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private profile'
      });
    }

    // Get following with pagination
    const following = await prisma.follow.findMany({
      where: {
        followerId: userId
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isVerified: true,
            bio: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Get total count
    const total = await prisma.follow.count({
      where: {
        followerId: userId
      }
    });

    res.status(200).json({
      success: true,
      data: {
        following: following.map(f => f.following),
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
    logger.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/v1/users/search - Search users
router.get('/search', authenticate, searchValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const q = req.query.q as string;
    const type = (req.query.type as string) || 'all';
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;
    const currentUserId = (req as any).user.id;

    let whereCondition: any = {
      isActive: true,
      NOT: {
        id: currentUserId
      }
    };

    // Build search condition based on type
    if (type === 'username') {
      whereCondition.username = {
        contains: q,
        mode: 'insensitive'
      };
    } else if (type === 'fullname') {
      whereCondition.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } }
      ];
    } else {
      // Search in both username and names
      whereCondition.OR = [
        { username: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        isVerified: true,
        bio: true,
        followersCount: true
      },
      orderBy: [
        { followersCount: 'desc' },
        { username: 'asc' }
      ],
      skip,
      take: limit
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        query: q,
        type,
        pagination: {
          page,
          limit,
          hasNext: users.length === limit,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    logger.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/v1/users/password - Change password
router.put('/password', authenticate, changePasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.id;

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { 
        id: userId,
        isActive: true 
      },
      select: {
        id: true,
        passwordHash: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
