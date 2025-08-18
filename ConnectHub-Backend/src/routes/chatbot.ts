import express from 'express';
import { authenticate } from '../middleware/auth';
import { validateQuery } from '../middleware/validation';
import aiChatbotService from '../services/aiChatbotService';
import logger from '../config/logger';

const router = express.Router();

// Validation schemas
const chatMessageSchema = {
  type: 'object',
  properties: {
    message: { type: 'string', minLength: 1, maxLength: 2000 },
    context: { type: 'string', enum: ['general', 'dating', 'safety'] }
  },
  required: ['message'],
  additionalProperties: false
};

const sessionSchema = {
  type: 'object',
  properties: {
    context: { type: 'string', enum: ['general', 'dating', 'safety'] }
  },
  additionalProperties: false
};

// Create new chat session
router.post('/sessions', 
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { context = 'general' } = req.body;

      const sessionId = await aiChatbotService.createChatSession(userId, context);
      
      res.status(201).json({
        success: true,
        data: {
          sessionId,
          context,
          message: 'Chat session created successfully'
        }
      });
    } catch (error) {
      logger.error('Error creating chat session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create chat session'
      });
    }
  }
);

// Send message to chatbot
router.post('/sessions/:sessionId/messages',
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { sessionId } = req.params;
      const { message } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      const response = await aiChatbotService.sendMessage(sessionId, userId, message);
      
      res.json({
        success: true,
        data: {
          response: response.content,
          messageId: response.id,
          timestamp: response.timestamp
        }
      });
    } catch (error) {
      logger.error('Error sending message to chatbot:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message'
      });
    }
  }
);

// Get chat history
router.get('/sessions/:sessionId/messages',
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { sessionId } = req.params;

      const messages = await aiChatbotService.getChatHistory(sessionId, userId);
      
      res.json({
        success: true,
        data: {
          messages,
          count: messages.length
        }
      });
    } catch (error) {
      logger.error('Error getting chat history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get chat history'
      });
    }
  }
);

// Get user's chat sessions
router.get('/sessions',
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user?.id;

      const sessions = await aiChatbotService.getUserChatSessions(userId);
      
      res.json({
        success: true,
        data: {
          sessions,
          count: sessions.length
        }
      });
    } catch (error) {
      logger.error('Error getting chat sessions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get chat sessions'
      });
    }
  }
);

// Delete chat session
router.delete('/sessions/:sessionId',
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { sessionId } = req.params;

      await aiChatbotService.deleteChatSession(sessionId, userId);
      
      res.json({
        success: true,
        message: 'Chat session deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting chat session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete chat session'
      });
    }
  }
);

// Quick response endpoint for simple queries
router.post('/quick-response',
  authenticate,
  async (req, res) => {
    try {
      const { query } = req.body;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Query is required'
        });
      }

      const response = await aiChatbotService.getQuickResponse(query);
      
      res.json({
        success: true,
        data: {
          response,
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('Error getting quick response:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get response'
      });
    }
  }
);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'AI Chatbot',
    status: 'operational',
    timestamp: new Date()
  });
});

export default router;
