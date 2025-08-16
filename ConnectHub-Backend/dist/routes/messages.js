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
const createConversationValidation = [
    (0, express_validator_1.body)('participantIds').isArray({ min: 1, max: 10 }).withMessage('1-10 participants required'),
    (0, express_validator_1.body)('participantIds.*').isLength({ min: 1 }).withMessage('Valid participant IDs required'),
    (0, express_validator_1.body)('matchId').optional().isLength({ min: 1 }).withMessage('Valid match ID required')
];
const sendMessageValidation = [
    (0, express_validator_1.body)('conversationId').isLength({ min: 1 }).withMessage('Conversation ID required'),
    (0, express_validator_1.body)('content').isLength({ min: 1, max: 1000 }).withMessage('Content 1-1000 characters'),
    (0, express_validator_1.body)('messageType').isIn(['text', 'image', 'video', 'audio', 'file', 'location', 'date_request']).withMessage('Invalid message type'),
    (0, express_validator_1.body)('mediaUrl').optional().isURL().withMessage('Invalid media URL'),
    (0, express_validator_1.body)('replyToMessageId').optional().isLength({ min: 1 }).withMessage('Valid reply message ID required')
];
const paginationValidation = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
    (0, express_validator_1.query)('before').optional().isLength({ min: 1 }).withMessage('Valid before cursor required')
];
const markReadValidation = [
    (0, express_validator_1.body)('messageIds').isArray({ min: 1 }).withMessage('Message IDs array required'),
    (0, express_validator_1.body)('messageIds.*').isLength({ min: 1 }).withMessage('Valid message IDs required')
];
router.get('/conversations', auth_1.authenticate, paginationValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;
        const conversations = await database_1.prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: userId
                    }
                },
                isActive: true
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                                isActive: true,
                                lastActiveAt: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                match: {
                    select: {
                        id: true,
                        user1: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                                avatar: true
                            }
                        },
                        user2: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                                avatar: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                lastMessageAt: 'desc'
            },
            skip,
            take: limit
        });
        const formattedConversations = conversations.map(conversation => {
            const otherParticipants = conversation.participants
                .filter(p => p.userId !== userId)
                .map(p => p.user);
            const currentUserParticipant = conversation.participants.find(p => p.userId === userId);
            const lastMessage = conversation.messages[0];
            return {
                id: conversation.id,
                matchId: conversation.matchId,
                participants: otherParticipants,
                lastMessage: lastMessage ? {
                    id: lastMessage.id,
                    content: lastMessage.content,
                    messageType: lastMessage.messageType,
                    createdAt: lastMessage.createdAt,
                    sender: lastMessage.sender,
                    isFromCurrentUser: lastMessage.senderId === userId
                } : null,
                lastMessageAt: conversation.lastMessageAt,
                unreadCount: currentUserParticipant?.unreadCount || 0,
                createdAt: conversation.createdAt
            };
        });
        const total = await database_1.prisma.conversation.count({
            where: {
                participants: {
                    some: {
                        userId: userId
                    }
                },
                isActive: true
            }
        });
        res.status(200).json({
            success: true,
            data: {
                conversations: formattedConversations,
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
        logger_1.default.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/conversations', auth_1.authenticate, createConversationValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const userId = req.user.id;
        const { participantIds, matchId } = req.body;
        const allParticipantIds = [...new Set([userId, ...participantIds])];
        const participants = await database_1.prisma.user.findMany({
            where: {
                id: { in: allParticipantIds },
                isActive: true
            },
            select: { id: true }
        });
        if (participants.length !== allParticipantIds.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more participants not found or inactive'
            });
        }
        if (allParticipantIds.length === 2) {
            const existingConversation = await database_1.prisma.conversation.findFirst({
                where: {
                    participants: {
                        every: {
                            userId: { in: allParticipantIds }
                        }
                    },
                    isActive: true
                },
                include: {
                    participants: true
                }
            });
            if (existingConversation && existingConversation.participants.length === 2) {
                return res.status(200).json({
                    success: true,
                    message: 'Existing conversation found',
                    data: { conversation: { id: existingConversation.id } }
                });
            }
        }
        if (matchId) {
            const match = await database_1.prisma.match.findFirst({
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
        }
        const conversation = await database_1.prisma.conversation.create({
            data: {
                matchId: matchId || null,
                participants: {
                    create: allParticipantIds.map(participantId => ({
                        userId: participantId,
                        unreadCount: 0
                    }))
                }
            },
            include: {
                participants: {
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
                }
            }
        });
        res.status(201).json({
            success: true,
            message: 'Conversation created successfully',
            data: { conversation }
        });
    }
    catch (error) {
        logger_1.default.error('Create conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/conversations/:conversationId', auth_1.authenticate, paginationValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const userId = req.user.id;
        const { conversationId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;
        const before = req.query.before;
        const conversation = await database_1.prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: {
                    some: {
                        userId: userId
                    }
                },
                isActive: true
            }
        });
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found or access denied'
            });
        }
        const whereConditions = {
            conversationId: conversationId,
            deletedAt: null
        };
        if (before) {
            const beforeMessage = await database_1.prisma.message.findUnique({
                where: { id: before }
            });
            if (beforeMessage) {
                whereConditions.createdAt = {
                    lt: beforeMessage.createdAt
                };
            }
        }
        const messages = await database_1.prisma.message.findMany({
            where: whereConditions,
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true
                    }
                },
                replyToMessage: {
                    select: {
                        id: true,
                        content: true,
                        messageType: true,
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });
        await database_1.prisma.message.updateMany({
            where: {
                conversationId: conversationId,
                receiverId: userId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });
        await database_1.prisma.conversationParticipant.updateMany({
            where: {
                conversationId: conversationId,
                userId: userId
            },
            data: {
                unreadCount: 0
            }
        });
        const total = await database_1.prisma.message.count({
            where: {
                conversationId: conversationId,
                deletedAt: null
            }
        });
        res.status(200).json({
            success: true,
            data: {
                messages: messages.reverse(),
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
        logger_1.default.error('Get conversation messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/', auth_1.authenticate, sendMessageValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const userId = req.user.id;
        const { conversationId, content, messageType = 'text', mediaUrl, replyToMessageId } = req.body;
        const conversation = await database_1.prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: {
                    some: {
                        userId: userId
                    }
                },
                isActive: true
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                isActive: true
                            }
                        }
                    }
                }
            }
        });
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found or access denied'
            });
        }
        const otherParticipants = conversation.participants
            .filter(p => p.userId !== userId && p.user.isActive);
        if (otherParticipants.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No active recipients in conversation'
            });
        }
        const receiverId = otherParticipants[0].userId;
        if (replyToMessageId) {
            const replyToMessage = await database_1.prisma.message.findFirst({
                where: {
                    id: replyToMessageId,
                    conversationId: conversationId
                }
            });
            if (!replyToMessage) {
                return res.status(404).json({
                    success: false,
                    message: 'Reply-to message not found in this conversation'
                });
            }
        }
        const message = await database_1.prisma.message.create({
            data: {
                conversationId,
                senderId: userId,
                receiverId,
                content,
                messageType,
                mediaUrl: mediaUrl || null,
                replyToMessageId: replyToMessageId || null,
                isRead: false,
                isDelivered: true
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true
                    }
                },
                replyToMessage: {
                    select: {
                        id: true,
                        content: true,
                        messageType: true,
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });
        await database_1.prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() }
        });
        await database_1.prisma.conversationParticipant.updateMany({
            where: {
                conversationId: conversationId,
                userId: { not: userId }
            },
            data: {
                unreadCount: { increment: 1 }
            }
        });
        logger_1.default.info(`Message sent in conversation ${conversationId} by user ${userId}`);
        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: { message }
        });
    }
    catch (error) {
        logger_1.default.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/mark-read', auth_1.authenticate, markReadValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const userId = req.user.id;
        const { messageIds } = req.body;
        const result = await database_1.prisma.message.updateMany({
            where: {
                id: { in: messageIds },
                receiverId: userId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });
        res.status(200).json({
            success: true,
            message: 'Messages marked as read',
            data: {
                updatedCount: result.count
            }
        });
    }
    catch (error) {
        logger_1.default.error('Mark messages as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.delete('/:messageId', auth_1.authenticate, async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;
        const message = await database_1.prisma.message.findFirst({
            where: {
                id: messageId,
                senderId: userId,
                deletedAt: null
            }
        });
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found or access denied'
            });
        }
        await database_1.prisma.message.update({
            where: { id: messageId },
            data: { deletedAt: new Date() }
        });
        res.status(200).json({
            success: true,
            message: 'Message deleted successfully',
            data: { messageId }
        });
    }
    catch (error) {
        logger_1.default.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/search', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const query = req.query.q;
        const conversationId = req.query.conversationId;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;
        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        const whereConditions = {
            deletedAt: null,
            content: {
                contains: query.trim(),
                mode: 'insensitive'
            },
            conversation: {
                participants: {
                    some: {
                        userId: userId
                    }
                }
            }
        };
        if (conversationId) {
            whereConditions.conversationId = conversationId;
        }
        const messages = await database_1.prisma.message.findMany({
            where: whereConditions,
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                conversation: {
                    select: {
                        id: true,
                        participants: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        username: true,
                                        firstName: true,
                                        lastName: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });
        res.status(200).json({
            success: true,
            data: {
                messages,
                query,
                pagination: {
                    page,
                    limit,
                    hasNext: messages.length === limit,
                    hasPrev: page > 1
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Search messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=messages.js.map