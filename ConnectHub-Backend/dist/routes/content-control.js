"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const contentControlAlgorithm_1 = require("../services/contentControlAlgorithm");
const express_validator_1 = require("express-validator");
const logger_1 = __importDefault(require("../config/logger"));
const router = express_1.default.Router();
router.post('/can-view', auth_1.authenticate, [
    (0, express_validator_1.body)('contentOwnerId').isString().notEmpty(),
    (0, express_validator_1.body)('contentId').isString().notEmpty(),
    (0, express_validator_1.body)('contentType').isIn(['post', 'story', 'comment', 'profile']),
    (0, express_validator_1.body)('visibilitySettings').isObject()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { contentOwnerId, contentId, contentType, visibilitySettings } = req.body;
        const viewerId = req.user.id;
        const result = await contentControlAlgorithm_1.contentControlAlgorithm.canUserViewContent(viewerId, contentOwnerId, contentId, contentType, visibilitySettings);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        logger_1.default.error('Error checking content visibility:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/filtered-feed', auth_1.authenticate, [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const viewerId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filteredPosts = await contentControlAlgorithm_1.contentControlAlgorithm.getFilteredFeed(viewerId, page, limit);
        res.json({
            success: true,
            data: {
                posts: filteredPosts,
                page,
                limit,
                hasMore: filteredPosts.length === limit
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting filtered feed:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/custom-audience', auth_1.authenticate, [
    (0, express_validator_1.body)('audienceRule').isObject(),
    (0, express_validator_1.body)('audienceRule.id').isString().notEmpty(),
    (0, express_validator_1.body)('audienceRule.name').isString().notEmpty(),
    (0, express_validator_1.body)('audienceRule.conditions').isArray(),
    (0, express_validator_1.body)('audienceRule.isActive').isBoolean()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const userId = req.user.id;
        const { audienceRule } = req.body;
        const matchingUsers = await contentControlAlgorithm_1.contentControlAlgorithm.createCustomAudience(userId, audienceRule);
        res.status(201).json({
            success: true,
            data: {
                audienceId: audienceRule.id,
                audienceName: audienceRule.name,
                memberCount: matchingUsers.length,
                sampleMembers: matchingUsers.slice(0, 5)
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error creating custom audience:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.put('/post/:postId/visibility', auth_1.authenticate, [
    (0, express_validator_1.param)('postId').isString().notEmpty(),
    (0, express_validator_1.body)('visibilityLevel').isIn(['public', 'friends', 'close_friends', 'followers', 'mutual_friends', 'custom_list', 'private']),
    (0, express_validator_1.body)('customAudienceIds').optional().isArray(),
    (0, express_validator_1.body)('excludedUserIds').optional().isArray(),
    (0, express_validator_1.body)('includedUserIds').optional().isArray(),
    (0, express_validator_1.body)('locationFilters').optional().isObject(),
    (0, express_validator_1.body)('demographicFilters').optional().isObject(),
    (0, express_validator_1.body)('interestFilters').optional().isObject(),
    (0, express_validator_1.body)('relationshipFilters').optional().isObject()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { postId } = req.params;
        const userId = req.user.id;
        const visibilitySettings = req.body;
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
        await prisma.post.update({
            where: { id: postId },
            data: {
                visibility: visibilitySettings.visibilityLevel,
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
    }
    catch (error) {
        logger_1.default.error('Error updating post visibility:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/visibility-options', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { prisma } = require('../config/database');
        const [followersCount, followingCount] = await Promise.all([
            prisma.follow.count({ where: { followingId: userId } }),
            prisma.follow.count({ where: { followerId: userId } })
        ]);
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
    }
    catch (error) {
        logger_1.default.error('Error getting visibility options:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/preview-audience', auth_1.authenticate, [
    (0, express_validator_1.body)('filters').isObject()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const userId = req.user.id;
        const { filters } = req.body;
        const previewRule = {
            id: `preview_${Date.now()}`,
            name: 'Preview Audience',
            conditions: filters.conditions || [],
            isActive: true
        };
        const matchingUsers = await contentControlAlgorithm_1.contentControlAlgorithm.createCustomAudience(userId, previewRule);
        res.json({
            success: true,
            data: {
                estimatedReach: matchingUsers.length,
                sampleUsers: matchingUsers.slice(0, 10),
                breakdown: {
                    totalPotentialAudience: await contentControlAlgorithm_1.contentControlAlgorithm['getPotentialAudienceUsers'](userId).then(users => users.length),
                    matchingUsers: matchingUsers.length,
                    matchPercentage: Math.round((matchingUsers.length / (await contentControlAlgorithm_1.contentControlAlgorithm['getPotentialAudienceUsers'](userId).then(users => users.length)) || 1) * 100)
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error previewing audience:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/block-user', auth_1.authenticate, [
    (0, express_validator_1.body)('targetUserId').isString().notEmpty(),
    (0, express_validator_1.body)('action').isIn(['block', 'unblock'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const userId = req.user.id;
        const { targetUserId, action } = req.body;
        const { prisma } = require('../config/database');
        if (action === 'block') {
            await prisma.report.create({
                data: {
                    reporterId: userId,
                    targetId: targetUserId,
                    targetType: 'user',
                    reason: 'blocked',
                    description: 'User blocked from viewing content'
                }
            });
        }
        else {
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
    }
    catch (error) {
        logger_1.default.error('Error blocking/unblocking user:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=content-control.js.map