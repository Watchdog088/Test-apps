"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const logger_1 = __importDefault(require("../config/logger"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = express_1.default.Router();
const updateProfileValidation = [
    (0, express_validator_1.body)('firstName').optional().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
    (0, express_validator_1.body)('lastName').optional().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
    (0, express_validator_1.body)('bio').optional().isLength({ max: 500 }).withMessage('Bio must be max 500 characters'),
    (0, express_validator_1.body)('location').optional().isLength({ max: 100 }).withMessage('Location must be max 100 characters'),
    (0, express_validator_1.body)('website').optional().isURL().withMessage('Invalid website URL'),
    (0, express_validator_1.body)('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
    (0, express_validator_1.body)('phone').optional().matches(/^\+?[\d\s-()]+$/).withMessage('Invalid phone format'),
    (0, express_validator_1.body)('isPrivate').optional().isBoolean().withMessage('isPrivate must be boolean'),
    (0, express_validator_1.body)('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender'),
];
const searchValidation = [
    (0, express_validator_1.query)('q').isLength({ min: 1, max: 100 }).withMessage('Search query required, max 100 chars'),
    (0, express_validator_1.query)('type').optional().isIn(['username', 'fullname', 'all']).withMessage('Invalid search type'),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50')
];
const changePasswordValidation = [
    (0, express_validator_1.body)('currentPassword').isLength({ min: 1 }).withMessage('Current password required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain lowercase, uppercase, and number')
];
router.get('/profile', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await database_1.prisma.user.findUnique({
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
    }
    catch (error) {
        logger_1.default.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.put('/profile', auth_1.authenticate, updateProfileValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const userId = req.user.id;
        const updateData = req.body;
        const updatedProfile = await database_1.prisma.user.update({
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
    }
    catch (error) {
        logger_1.default.error('Update user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/:userId', auth_1.authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;
        const profile = await database_1.prisma.user.findUnique({
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
        const isFollowing = await database_1.prisma.follow.findFirst({
            where: {
                followerId: currentUserId,
                followingId: userId
            }
        });
        const followsYou = await database_1.prisma.follow.findFirst({
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
    }
    catch (error) {
        logger_1.default.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/:userId/follow', auth_1.authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;
        if (userId === currentUserId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot follow yourself'
            });
        }
        const targetUser = await database_1.prisma.user.findUnique({
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
        const existingFollow = await database_1.prisma.follow.findFirst({
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
        await database_1.prisma.follow.create({
            data: {
                followerId: currentUserId,
                followingId: userId
            }
        });
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                followersCount: { increment: 1 },
                updatedAt: new Date()
            }
        });
        await database_1.prisma.user.update({
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
    }
    catch (error) {
        logger_1.default.error('Follow user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.delete('/:userId/follow', auth_1.authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;
        if (userId === currentUserId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot unfollow yourself'
            });
        }
        const follow = await database_1.prisma.follow.findFirst({
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
        await database_1.prisma.follow.delete({
            where: { id: follow.id }
        });
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                followersCount: { decrement: 1 },
                updatedAt: new Date()
            }
        });
        await database_1.prisma.user.update({
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
    }
    catch (error) {
        logger_1.default.error('Unfollow user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/:userId/followers', auth_1.authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;
        const user = await database_1.prisma.user.findUnique({
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
        const isFollowing = await database_1.prisma.follow.findFirst({
            where: {
                followerId: currentUserId,
                followingId: userId
            }
        });
        if (user.isPrivate && !isFollowing && userId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to private profile'
            });
        }
        const followers = await database_1.prisma.follow.findMany({
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
        const total = await database_1.prisma.follow.count({
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
    }
    catch (error) {
        logger_1.default.error('Get followers error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/:userId/following', auth_1.authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;
        const user = await database_1.prisma.user.findUnique({
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
        const isFollowing = await database_1.prisma.follow.findFirst({
            where: {
                followerId: currentUserId,
                followingId: userId
            }
        });
        if (user.isPrivate && !isFollowing && userId !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to private profile'
            });
        }
        const following = await database_1.prisma.follow.findMany({
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
        const total = await database_1.prisma.follow.count({
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
    }
    catch (error) {
        logger_1.default.error('Get following error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/search', auth_1.authenticate, searchValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const q = req.query.q;
        const type = req.query.type || 'all';
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;
        const currentUserId = req.user.id;
        let whereCondition = {
            isActive: true,
            NOT: {
                id: currentUserId
            }
        };
        if (type === 'username') {
            whereCondition.username = {
                contains: q,
                mode: 'insensitive'
            };
        }
        else if (type === 'fullname') {
            whereCondition.OR = [
                { firstName: { contains: q, mode: 'insensitive' } },
                { lastName: { contains: q, mode: 'insensitive' } }
            ];
        }
        else {
            whereCondition.OR = [
                { username: { contains: q, mode: 'insensitive' } },
                { firstName: { contains: q, mode: 'insensitive' } },
                { lastName: { contains: q, mode: 'insensitive' } }
            ];
        }
        const users = await database_1.prisma.user.findMany({
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
    }
    catch (error) {
        logger_1.default.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.put('/password', auth_1.authenticate, changePasswordValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        const user = await database_1.prisma.user.findUnique({
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
        const isValid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        const salt = await bcryptjs_1.default.genSalt(12);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        await database_1.prisma.user.update({
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
    }
    catch (error) {
        logger_1.default.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map