import express from 'express';
import { prisma } from '../config/database';
import { body, validationResult, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';

const router = express.Router();

// Validation rules
const createConversationValidation = [
  body('participantIds').isArray({ min: 1, max: 10 }).withMessage('1-10 participants required'),
  body('participantIds.*').isLength({ min: 1 }).withMessage('Valid participant IDs required'),
  body('matchId').optional().isLength({ min: 1 }).withMessage('Valid match ID required')
];

const sendMessageValidation = [
  body('conversationId').isLength({ min: 1 }).withMessage('Conversation ID required'),
  body('content').isLength({ min: 1, max: 1000 }).withMessage('Content 1-1000 characters'),
  body('messageType').isIn(['text', 'image', 'video', 'audio', 'file', 'location', 'date_request']).withMessage('Invalid message type'),
  body('mediaUrl').optional().isURL().withMessage('Invalid media URL'),
  body('replyToMessageId').optional().isLength({ min: 1 }).withMessage('Valid reply message ID required')
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
  query('before').optional().isLength({ min: 1 }).withMessage('Valid before cursor required')
];

const markReadValidation = [
  body('messageIds').isArray({ min: 1 }).withMessage('Message IDs array required'),
  body('messageIds.*').isLength({ min: 1 }).withMessage('Valid message IDs required')
];

// GET /api/v1/messages/conversations - Get user's conversations
router.get('/conversations', authenticate, paginationValidation, async (req, res) => {
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
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    // Get conversations where user is a participant
    const conversations = await prisma.conversation.findMany({
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

    // Format conversations with additional info
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

    // Get total count
    const total = await prisma.conversation.count({
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

  } catch (error) {
    logger.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/v1/messages/conversations - Create a new conversation
router.post('/conversations', authenticate, createConversationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = (req as any).user.id;
    const { participantIds, matchId } = req.body;

    // Add current user to participants if not included
    const allParticipantIds = [...new Set([userId, ...participantIds])];

    // Validate all participants exist and are active
    const participants = await prisma.user.findMany({
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

    // For direct messages (2 participants), check if conversation already exists
    if (allParticipantIds.length === 2) {
      const existingConversation = await prisma.conversation.findFirst({
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

      // If conversation exists and has exactly 2 participants, return it
      if (existingConversation && existingConversation.participants.length === 2) {
        return res.status(200).json({
          success: true,
          message: 'Existing conversation found',
          data: { conversation: { id: existingConversation.id } }
        });
      }
    }

    // If matchId provided, validate the match
    if (matchId) {
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
    }

    // Create conversation
    const conversation = await prisma.conversation.create({
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

  } catch (error) {
    logger.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/v1/messages/conversations/:conversationId - Get messages in a conversation
router.get('/conversations/:conversationId', authenticate, paginationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = (req as any).user.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;
    const before = req.query.before as string;

    // Verify user has access to conversation
    const conversation = await prisma.conversation.findFirst({
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

    // Build message query conditions
    const whereConditions: any = {
      conversationId: conversationId,
      deletedAt: null
    };

    if (before) {
      // Get messages before the specified message
      const beforeMessage = await prisma.message.findUnique({
        where: { id: before }
      });
      if (beforeMessage) {
        whereConditions.createdAt = {
          lt: beforeMessage.createdAt
        };
      }
    }

    // Get messages with pagination
    const messages = await prisma.message.findMany({
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

    // Mark messages as read for current user
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        receiverId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    // Update unread count for current user
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId: conversationId,
        userId: userId
      },
      data: {
        unreadCount: 0
      }
    });

    // Get total count
    const total = await prisma.message.count({
      where: {
        conversationId: conversationId,
        deletedAt: null
      }
    });

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
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
    logger.error('Get conversation messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/v1/messages - Send a message
router.post('/', authenticate, sendMessageValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = (req as any).user.id;
    const { conversationId, content, messageType = 'text', mediaUrl, replyToMessageId } = req.body;

    // Verify user has access to conversation
    const conversation = await prisma.conversation.findFirst({
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

    // Get the other participant (for direct messages)
    const otherParticipants = conversation.participants
      .filter(p => p.userId !== userId && p.user.isActive);

    if (otherParticipants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active recipients in conversation'
      });
    }

    // For direct messages, get the main recipient
    const receiverId = otherParticipants[0].userId;

    // Validate reply-to message if provided
    if (replyToMessageId) {
      const replyToMessage = await prisma.message.findFirst({
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

    // Create message
    const message = await prisma.message.create({
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

    // Update conversation last message timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    // Update unread count for other participants
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId: conversationId,
        userId: { not: userId }
      },
      data: {
        unreadCount: { increment: 1 }
      }
    });

    // TODO: Implement real-time notification via Socket.IO
    logger.info(`Message sent in conversation ${conversationId} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });

  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/v1/messages/mark-read - Mark messages as read
router.post('/mark-read', authenticate, markReadValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = (req as any).user.id;
    const { messageIds } = req.body;

    // Update messages as read where user is the receiver
    const result = await prisma.message.updateMany({
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

  } catch (error) {
    logger.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/v1/messages/:messageId - Delete a message
router.delete('/:messageId', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = (req as any).user.id;

    // Check if user owns the message
    const message = await prisma.message.findFirst({
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

    // Soft delete the message
    await prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() }
    });

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      data: { messageId }
    });

  } catch (error) {
    logger.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/v1/messages/search - Search messages
router.get('/search', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const query = req.query.q as string;
    const conversationId = req.query.conversationId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Build search conditions
    const whereConditions: any = {
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

    // Search messages
    const messages = await prisma.message.findMany({
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

  } catch (error) {
    logger.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
