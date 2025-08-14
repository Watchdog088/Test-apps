import express from 'express';
import { z } from 'zod';
import { getDB } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateBody, validateParams, validateQuery, schemas } from '../middleware/validation';
import { AuthenticatedRequest } from '../middleware/auth';
import logger from '../config/logger';

const router = express.Router();

// Additional validation schemas specific to messages
const messageSchemas = {
  conversationId: z.object({
    conversationId: z.string().uuid('Invalid conversation ID format'),
  }),

  messageId: z.object({
    messageId: z.string().uuid('Invalid message ID format'),
  }),

  getMessages: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
    before: z.string().uuid().optional(),
  }),

  createMessage: z.object({
    conversationId: z.string().uuid('Invalid conversation ID format'),
    content: z.string().min(1, 'Message content is required').max(1000),
    messageType: z.enum(['text', 'image', 'video', 'audio', 'file', 'location']).default('text'),
    mediaUrl: z.string().url().optional(),
    replyToMessageId: z.string().uuid().optional(),
  }),

  createConversation: z.object({
    participantIds: z.array(z.string().uuid()).min(1, 'At least one participant is required'),
    isGroup: z.boolean().default(false),
    name: z.string().max(100).optional(),
  }),

  markAsRead: z.object({
    messageIds: z.array(z.string().uuid()).min(1, 'At least one message ID is required'),
  }),
};

// GET /api/messages/conversations - Get user's conversations
router.get('/conversations', 
  authenticateToken,
  validateQuery(schemas.pagination),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { page = 1, limit = 20 } = req.query as any;
      const offset = (page - 1) * limit;

      // Get conversations with last message and unread count
      const conversationsQuery = `
        WITH conversation_messages AS (
          SELECT DISTINCT
            CASE 
              WHEN m.sender_id = $1 THEN m.recipient_id
              ELSE m.sender_id
            END as other_user_id,
            m.created_at,
            m.content,
            m.media_type,
            m.is_read,
            ROW_NUMBER() OVER (
              PARTITION BY 
                CASE 
                  WHEN m.sender_id = $1 THEN m.recipient_id
                  ELSE m.sender_id
                END 
              ORDER BY m.created_at DESC
            ) as rn
          FROM messages m
          WHERE m.sender_id = $1 OR m.recipient_id = $1
        ),
        unread_counts AS (
          SELECT 
            sender_id as other_user_id,
            COUNT(*) as unread_count
          FROM messages
          WHERE recipient_id = $1 AND is_read = FALSE
          GROUP BY sender_id
        )
        SELECT 
          u.id,
          u.username,
          u.full_name,
          u.avatar_url,
          u.is_active,
          u.last_active,
          cm.content as last_message,
          cm.media_type as last_message_type,
          cm.created_at as last_message_at,
          COALESCE(uc.unread_count, 0) as unread_count
        FROM conversation_messages cm
        JOIN users u ON u.id = cm.other_user_id
        LEFT JOIN unread_counts uc ON uc.other_user_id = u.id
        WHERE cm.rn = 1
        ORDER BY cm.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const conversations = await db.query(conversationsQuery, [req.user!.id, limit, offset]);

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(DISTINCT 
          CASE 
            WHEN m.sender_id = $1 THEN m.recipient_id
            ELSE m.sender_id
          END
        ) as total
        FROM messages m
        WHERE m.sender_id = $1 OR m.recipient_id = $1
      `;
      const countResult = await db.query(countQuery, [req.user!.id]);
      const total = parseInt(countResult.rows[0].total);

      res.json({
        conversations: conversations.rows,
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
      logger.error('Get conversations error:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  }
);

// GET /api/messages/conversations/:conversationId - Get messages in a conversation
router.get('/conversations/:conversationId',
  authenticateToken,
  validateParams(messageSchemas.conversationId),
  validateQuery(messageSchemas.getMessages),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { conversationId } = req.params;
      const { page = 1, limit = 20, before } = req.query as any;
      const offset = (page - 1) * limit;

      // Validate that the conversation exists and user has access
      // For direct messages, conversationId is the other user's ID
      const accessQuery = `
        SELECT COUNT(*) as count
        FROM messages
        WHERE (sender_id = $1 OR recipient_id = $1)
        AND (sender_id = $2 OR recipient_id = $2)
      `;
      const accessResult = await db.query(accessQuery, [req.user!.id, conversationId]);
      
      if (parseInt(accessResult.rows[0].count) === 0) {
        return res.status(403).json({ error: 'Access denied to this conversation' });
      }

      // Build the messages query
      let messagesQuery = `
        SELECT 
          m.id,
          m.sender_id,
          m.recipient_id,
          m.content,
          m.media_url,
          m.media_type,
          m.is_read,
          m.created_at,
          u.username as sender_username,
          u.full_name as sender_name,
          u.avatar_url as sender_avatar
        FROM messages m
        JOIN users u ON u.id = m.sender_id
        WHERE ((m.sender_id = $1 AND m.recipient_id = $2) 
               OR (m.sender_id = $2 AND m.recipient_id = $1))
      `;
      
      const queryParams = [req.user!.id, conversationId];
      
      if (before) {
        messagesQuery += ' AND m.created_at < (SELECT created_at FROM messages WHERE id = $3)';
        queryParams.push(before);
      }
      
      messagesQuery += ' ORDER BY m.created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
      queryParams.push(limit.toString(), offset.toString());

      const messages = await db.query(messagesQuery, queryParams);

      // Mark messages as read
      const markReadQuery = `
        UPDATE messages 
        SET is_read = TRUE 
        WHERE recipient_id = $1 AND sender_id = $2 AND is_read = FALSE
      `;
      await db.query(markReadQuery, [req.user!.id, conversationId]);

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM messages
        WHERE (sender_id = $1 AND recipient_id = $2) 
           OR (sender_id = $2 AND recipient_id = $1)
      `;
      const countResult = await db.query(countQuery, [req.user!.id, conversationId]);
      const total = parseInt(countResult.rows[0].total);

      res.json({
        messages: messages.rows.reverse(), // Return in chronological order
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
      logger.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }
);

// POST /api/messages - Send a message
router.post('/',
  authenticateToken,
  validateBody(messageSchemas.createMessage),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { conversationId, content, messageType = 'text', mediaUrl, replyToMessageId } = req.body;

      // Validate recipient exists and is not blocked
      const recipientQuery = `
        SELECT id, username, is_active
        FROM users
        WHERE id = $1 AND is_active = TRUE
      `;
      const recipientResult = await db.query(recipientQuery, [conversationId]);
      
      if (recipientResult.rows.length === 0) {
        return res.status(404).json({ error: 'Recipient not found or inactive' });
      }

      const recipient = recipientResult.rows[0];

      // For dating app context, check if users have matched (optional - can be enabled later)
      /*
      const matchQuery = `
        SELECT id FROM matches
        WHERE (user1_id = $1 AND user2_id = $2) 
           OR (user1_id = $2 AND user2_id = $1)
        AND is_active = TRUE
      `;
      const matchResult = await db.query(matchQuery, [req.user!.id, conversationId]);
      
      if (matchResult.rows.length === 0) {
        return res.status(403).json({ error: 'Cannot send message - no active match found' });
      }
      */

      // Validate reply-to message if provided
      if (replyToMessageId) {
        const replyToQuery = `
          SELECT id FROM messages
          WHERE id = $1 
          AND ((sender_id = $2 AND recipient_id = $3) OR (sender_id = $3 AND recipient_id = $2))
        `;
        const replyToResult = await db.query(replyToQuery, [replyToMessageId, req.user!.id, conversationId]);
        
        if (replyToResult.rows.length === 0) {
          return res.status(404).json({ error: 'Reply-to message not found in this conversation' });
        }
      }

      // Insert the message
      const insertQuery = `
        INSERT INTO messages (sender_id, recipient_id, content, media_url, media_type, is_read)
        VALUES ($1, $2, $3, $4, $5, FALSE)
        RETURNING id, sender_id, recipient_id, content, media_url, media_type, is_read, created_at
      `;
      const result = await db.query(insertQuery, [
        req.user!.id,
        conversationId,
        content,
        mediaUrl || null,
        messageType
      ]);

      const message = result.rows[0];

      // Add sender info to response
      const messageWithSender = {
        ...message,
        sender_username: req.user!.username,
        sender_name: req.user!.username, // You might want to fetch full name
        sender_avatar: null, // You might want to fetch avatar
      };

      // TODO: Implement real-time notification via WebSocket/Socket.IO
      logger.info(`Message sent from ${req.user!.id} to ${conversationId}`);

      res.status(201).json({
        message: messageWithSender,
        success: true,
      });
    } catch (error) {
      logger.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
);

// PUT /api/messages/:messageId/read - Mark message as read
router.put('/:messageId/read',
  authenticateToken,
  validateParams(messageSchemas.messageId),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { messageId } = req.params;

      // Update message read status
      const updateQuery = `
        UPDATE messages 
        SET is_read = TRUE 
        WHERE id = $1 AND recipient_id = $2 AND is_read = FALSE
        RETURNING id, is_read
      `;
      const result = await db.query(updateQuery, [messageId, req.user!.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Message not found or already read' });
      }

      res.json({
        message: 'Message marked as read',
        messageId: result.rows[0].id,
      });
    } catch (error) {
      logger.error('Mark message as read error:', error);
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  }
);

// POST /api/messages/mark-read - Mark multiple messages as read
router.post('/mark-read',
  authenticateToken,
  validateBody(messageSchemas.markAsRead),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { messageIds } = req.body;

      // Update multiple messages read status
      const updateQuery = `
        UPDATE messages 
        SET is_read = TRUE 
        WHERE id = ANY($1::uuid[]) AND recipient_id = $2 AND is_read = FALSE
        RETURNING id
      `;
      const result = await db.query(updateQuery, [messageIds, req.user!.id]);

      res.json({
        message: 'Messages marked as read',
        updatedCount: result.rows.length,
        updatedIds: result.rows.map(row => row.id),
      });
    } catch (error) {
      logger.error('Mark messages as read error:', error);
      res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  }
);

// DELETE /api/messages/:messageId - Delete a message
router.delete('/:messageId',
  authenticateToken,
  validateParams(messageSchemas.messageId),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { messageId } = req.params;

      // Check if user owns the message
      const checkQuery = `
        SELECT id, sender_id, content
        FROM messages
        WHERE id = $1 AND sender_id = $2
      `;
      const checkResult = await db.query(checkQuery, [messageId, req.user!.id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Message not found or access denied' });
      }

      // Delete the message (or mark as deleted)
      const deleteQuery = `
        DELETE FROM messages
        WHERE id = $1 AND sender_id = $2
        RETURNING id
      `;
      const result = await db.query(deleteQuery, [messageId, req.user!.id]);

      res.json({
        message: 'Message deleted successfully',
        deletedId: result.rows[0].id,
      });
    } catch (error) {
      logger.error('Delete message error:', error);
      res.status(500).json({ error: 'Failed to delete message' });
    }
  }
);

// GET /api/messages/search - Search messages
router.get('/search',
  authenticateToken,
  validateQuery(z.object({
    q: z.string().min(1, 'Search query is required'),
    conversationId: z.string().uuid().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
  })),
  async (req: AuthenticatedRequest, res) => {
    try {
      const db = getDB();
      const { q, conversationId, page = 1, limit = 20 } = req.query as any;
      const offset = (page - 1) * limit;

      let searchQuery = `
        SELECT 
          m.id,
          m.sender_id,
          m.recipient_id,
          m.content,
          m.media_type,
          m.created_at,
          u.username as sender_username,
          u.full_name as sender_name,
          u.avatar_url as sender_avatar
        FROM messages m
        JOIN users u ON u.id = m.sender_id
        WHERE (m.sender_id = $1 OR m.recipient_id = $1)
        AND m.content ILIKE $2
      `;
      
      const queryParams = [req.user!.id, `%${q}%`];

      if (conversationId) {
        searchQuery += ' AND ((m.sender_id = $1 AND m.recipient_id = $3) OR (m.sender_id = $3 AND m.recipient_id = $1))';
        queryParams.push(conversationId);
      }

      searchQuery += ' ORDER BY m.created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
      queryParams.push(limit.toString(), offset.toString());

      const messages = await db.query(searchQuery, queryParams);

      res.json({
        messages: messages.rows,
        query: q,
        pagination: {
          page,
          limit,
          hasNext: messages.rows.length === limit,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error('Search messages error:', error);
      res.status(500).json({ error: 'Failed to search messages' });
    }
  }
);

export default router;
