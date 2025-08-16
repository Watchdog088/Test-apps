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
const router = express_1.default.Router();
const createPostValidation = [
    (0, express_validator_1.body)('content').isLength({ min: 1, max: 2000 }).withMessage('Content must be 1-2000 characters'),
    (0, express_validator_1.body)('contentType').optional().isIn(['text', 'image', 'video', 'mixed']).withMessage('Invalid content type'),
    (0, express_validator_1.body)('mediaUrls').optional().isArray().withMessage('Media URLs must be an array'),
    (0, express_validator_1.body)('hashtags').optional().isArray().withMessage('Hashtags must be an array'),
    (0, express_validator_1.body)('mentions').optional().isArray().withMessage('Mentions must be an array'),
    (0, express_validator_1.body)('visibility').optional().isIn(['public', 'followers', 'private']).withMessage('Invalid visibility'),
    (0, express_validator_1.body)('location').optional().isString().withMessage('Location must be a string')
];
const updatePostValidation = [
    (0, express_validator_1.param)('postId').isString().withMessage('Post ID is required'),
    (0, express_validator_1.body)('content').optional().isLength({ min: 1, max: 2000 }).withMessage('Content must be 1-2000 characters'),
    (0, express_validator_1.body)('visibility').optional().isIn(['public', 'followers', 'private']).withMessage('Invalid visibility'),
    (0, express_validator_1.body)('location').optional().isString().withMessage('Location must be a string')
];
const commentValidation = [
    (0, express_validator_1.param)('postId').isString().withMessage('Post ID is required'),
    (0, express_validator_1.body)('content').isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters'),
    (0, express_validator_1.body)('parentCommentId').optional().isString().withMessage('Parent comment ID must be a string')
];
router.post('/', auth_1.authenticate, createPostValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { content, contentType, mediaUrls, hashtags, mentions, visibility, location } = req.body;
        const userId = req.user.id;
        const post = await database_1.prisma.post.create({
            data: {
                userId,
                content,
                contentType: contentType || 'text',
                mediaUrls: JSON.stringify(mediaUrls || []),
                hashtags: JSON.stringify(hashtags || []),
                mentions: JSON.stringify(mentions || []),
                visibility: visibility || 'public',
                location: location || null,
                likesCount: 0,
                commentsCount: 0,
                sharesCount: 0,
                savesCount: 0,
                isEdited: false
            },
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
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                postsCount: { increment: 1 },
                updatedAt: new Date()
            }
        });
        const responsePost = {
            ...post,
            mediaUrls: JSON.parse(post.mediaUrls),
            hashtags: JSON.parse(post.hashtags),
            mentions: JSON.parse(post.mentions)
        };
        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: { post: responsePost }
        });
    }
    catch (error) {
        logger_1.default.error('Create post error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/feed', auth_1.authenticate, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;
        const userId = req.user.id;
        const posts = await database_1.prisma.post.findMany({
            where: {
                OR: [
                    { userId: userId },
                    {
                        user: {
                            followers: {
                                some: {
                                    followerId: userId
                                }
                            }
                        },
                        visibility: { in: ['public', 'followers'] }
                    },
                    { visibility: 'public' }
                ]
            },
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
                },
                _count: {
                    select: {
                        comments: true,
                        engagements: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });
        const postIds = posts.map(post => post.id);
        const userEngagements = await database_1.prisma.postEngagement.findMany({
            where: {
                userId: userId,
                postId: { in: postIds }
            }
        });
        const engagementMap = userEngagements.reduce((acc, engagement) => {
            if (!acc[engagement.postId])
                acc[engagement.postId] = [];
            acc[engagement.postId].push(engagement.type);
            return acc;
        }, {});
        const responsePosts = posts.map(post => ({
            ...post,
            mediaUrls: JSON.parse(post.mediaUrls),
            hashtags: JSON.parse(post.hashtags),
            mentions: JSON.parse(post.mentions),
            isLiked: engagementMap[post.id]?.includes('like') || false,
            isSaved: engagementMap[post.id]?.includes('save') || false,
            commentsCount: post._count.comments,
            actualLikesCount: post.likesCount
        }));
        res.status(200).json({
            success: true,
            data: {
                posts: responsePosts,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(responsePosts.length / limit),
                    hasMore: responsePosts.length === limit
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Get feed error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/:postId', auth_1.authenticate, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        const post = await database_1.prisma.post.findUnique({
            where: { id: postId },
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
                },
                _count: {
                    select: {
                        comments: true
                    }
                }
            }
        });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        if (post.visibility === 'private' && post.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        const userEngagements = await database_1.prisma.postEngagement.findMany({
            where: {
                userId: userId,
                postId: postId
            }
        });
        const engagementTypes = userEngagements.map(e => e.type);
        if (post.userId !== userId && !engagementTypes.includes('view')) {
            await database_1.prisma.postEngagement.create({
                data: {
                    postId: postId,
                    userId: userId,
                    type: 'view'
                }
            });
        }
        const responsePost = {
            ...post,
            mediaUrls: JSON.parse(post.mediaUrls),
            hashtags: JSON.parse(post.hashtags),
            mentions: JSON.parse(post.mentions),
            isLiked: engagementTypes.includes('like'),
            isSaved: engagementTypes.includes('save'),
            commentsCount: post._count.comments
        };
        res.status(200).json({
            success: true,
            data: { post: responsePost }
        });
    }
    catch (error) {
        logger_1.default.error('Get post error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.put('/:postId', auth_1.authenticate, updatePostValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { postId } = req.params;
        const { content, visibility, location } = req.body;
        const userId = req.user.id;
        const existingPost = await database_1.prisma.post.findUnique({
            where: { id: postId }
        });
        if (!existingPost) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        if (existingPost.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        const updatedPost = await database_1.prisma.post.update({
            where: { id: postId },
            data: {
                content: content || existingPost.content,
                visibility: visibility || existingPost.visibility,
                location: location !== undefined ? location : existingPost.location,
                isEdited: true,
                updatedAt: new Date()
            },
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
        const responsePost = {
            ...updatedPost,
            mediaUrls: JSON.parse(updatedPost.mediaUrls),
            hashtags: JSON.parse(updatedPost.hashtags),
            mentions: JSON.parse(updatedPost.mentions)
        };
        res.status(200).json({
            success: true,
            message: 'Post updated successfully',
            data: { post: responsePost }
        });
    }
    catch (error) {
        logger_1.default.error('Update post error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.delete('/:postId', auth_1.authenticate, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        const existingPost = await database_1.prisma.post.findUnique({
            where: { id: postId }
        });
        if (!existingPost) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        if (existingPost.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        await database_1.prisma.post.delete({
            where: { id: postId }
        });
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                postsCount: { decrement: 1 },
                updatedAt: new Date()
            }
        });
        res.status(200).json({
            success: true,
            message: 'Post deleted successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Delete post error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/:postId/like', auth_1.authenticate, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        const post = await database_1.prisma.post.findUnique({
            where: { id: postId }
        });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        const existingLike = await database_1.prisma.postEngagement.findUnique({
            where: {
                postId_userId_type: {
                    postId: postId,
                    userId: userId,
                    type: 'like'
                }
            }
        });
        if (existingLike) {
            await database_1.prisma.postEngagement.delete({
                where: { id: existingLike.id }
            });
            await database_1.prisma.post.update({
                where: { id: postId },
                data: { likesCount: { decrement: 1 } }
            });
            res.status(200).json({
                success: true,
                message: 'Post unliked successfully',
                data: { isLiked: false }
            });
        }
        else {
            await database_1.prisma.postEngagement.create({
                data: {
                    postId: postId,
                    userId: userId,
                    type: 'like'
                }
            });
            await database_1.prisma.post.update({
                where: { id: postId },
                data: { likesCount: { increment: 1 } }
            });
            res.status(200).json({
                success: true,
                message: 'Post liked successfully',
                data: { isLiked: true }
            });
        }
    }
    catch (error) {
        logger_1.default.error('Like post error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/:postId/comments', auth_1.authenticate, commentValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { postId } = req.params;
        const { content, parentCommentId } = req.body;
        const userId = req.user.id;
        const post = await database_1.prisma.post.findUnique({
            where: { id: postId }
        });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        const comment = await database_1.prisma.comment.create({
            data: {
                postId: postId,
                userId: userId,
                content: content,
                parentCommentId: parentCommentId || null
            },
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
        await database_1.prisma.post.update({
            where: { id: postId },
            data: { commentsCount: { increment: 1 } }
        });
        if (parentCommentId) {
            await database_1.prisma.comment.update({
                where: { id: parentCommentId },
                data: { repliesCount: { increment: 1 } }
            });
        }
        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: { comment }
        });
    }
    catch (error) {
        logger_1.default.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/:postId/comments', auth_1.authenticate, async (req, res) => {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const skip = (page - 1) * limit;
        const post = await database_1.prisma.post.findUnique({
            where: { id: postId }
        });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        const comments = await database_1.prisma.comment.findMany({
            where: {
                postId: postId,
                parentCommentId: null
            },
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
                },
                replies: {
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
                    take: 3,
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });
        res.status(200).json({
            success: true,
            data: {
                comments,
                pagination: {
                    currentPage: page,
                    hasMore: comments.length === limit
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Get comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=posts.js.map