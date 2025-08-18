import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import streamingService from '../services/streamingService';
import logger from '../config/logger';
import {
  StreamMessageType,
  CreateStreamRequest,
  UpdateStreamRequest
} from '../types/streaming';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Get live streams
router.get('/live', [
  query('category').optional().isString().trim(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  handleValidationErrors
], async (req: any, res: any) => {
  try {
    const { category, limit = 20 } = req.query;
    const streams = streamingService.getLiveStreams(category, limit);
    
    res.json({
      success: true,
      streams,
      count: streams.length
    });
  } catch (error) {
    logger.error('Error fetching live streams:', error);
    res.status(500).json({
      error: 'Failed to fetch live streams'
    });
  }
});

// Create new stream
router.post('/create', [
  authenticate,
  body('title').notEmpty().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('category').notEmpty().trim(),
  body('thumbnailUrl').optional().isURL(),
  body('tags').optional().isArray(),
  body('isPrivate').optional().isBoolean(),
  body('allowedViewers').optional().isArray(),
  body('chatEnabled').optional().isBoolean(),
  body('recordingEnabled').optional().isBoolean(),
  body('monetizationEnabled').optional().isBoolean(),
  body('scheduledStartTime').optional().isISO8601().toDate(),
  handleValidationErrors
], async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const streamData: CreateStreamRequest = req.body;
    
    const stream = await streamingService.createStream(userId, streamData);
    
    res.status(201).json({
      success: true,
      stream
    });
  } catch (error) {
    logger.error('Error creating stream:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create stream'
    });
  }
});

// Get stream details
router.get('/:streamId', [
  param('streamId').isUUID(),
  handleValidationErrors
], async (req: any, res: any) => {
  try {
    const { streamId } = req.params;
    const stream = streamingService.getStream(streamId);
    
    if (!stream) {
      return res.status(404).json({
        error: 'Stream not found'
      });
    }
    
    // Don't expose stream key to unauthorized users
    if (!req.user || req.user.id !== stream.userId) {
      const { streamKey, ...publicStream } = stream;
      return res.json({
        success: true,
        stream: publicStream
      });
    }
    
    res.json({
      success: true,
      stream
    });
  } catch (error) {
    logger.error('Error fetching stream:', error);
    res.status(500).json({
      error: 'Failed to fetch stream'
    });
  }
});

// Update stream
router.put('/:streamId', [
  authenticate,
  param('streamId').isUUID(),
  body('title').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('category').optional().trim(),
  body('thumbnailUrl').optional().isURL(),
  body('tags').optional().isArray(),
  body('isPrivate').optional().isBoolean(),
  body('allowedViewers').optional().isArray(),
  body('chatEnabled').optional().isBoolean(),
  body('recordingEnabled').optional().isBoolean(),
  body('monetizationEnabled').optional().isBoolean(),
  handleValidationErrors
], async (req: any, res: any) => {
  try {
    const { streamId } = req.params;
    const userId = req.user.id;
    const updates: UpdateStreamRequest = req.body;
    
    const stream = await streamingService.updateStream(streamId, userId, updates);
    
    res.json({
      success: true,
      stream
    });
  } catch (error) {
    logger.error('Error updating stream:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update stream'
    });
  }
});

// Start stream
router.post('/:streamId/start', [
  authenticate,
  param('streamId').isUUID(),
  handleValidationErrors
], async (req: any, res: any) => {
  try {
    const { streamId } = req.params;
    const userId = req.user.id;
    
    const stream = await streamingService.startStream(streamId, userId);
    
    // Emit stream start event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('stream:started', { streamId, stream });
    }
    
    res.json({
      success: true,
      stream
    });
  } catch (error) {
    logger.error('Error starting stream:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to start stream'
    });
  }
});

// End stream
router.post('/:streamId/end', [
  authenticate,
  param('streamId').isUUID(),
  handleValidationErrors
], async (req: any, res: any) => {
  try {
    const { streamId } = req.params;
    const userId = req.user.id;
    
    const stream = await streamingService.endStream(streamId, userId);
    
    // Emit stream end event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('stream:ended', { streamId, stream });
    }
    
    res.json({
      success: true,
      stream
    });
  } catch (error) {
    logger.error('Error ending stream:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to end stream'
    });
  }
});

// Join stream
router.post('/:streamId/join', [
  authenticate,
  param('streamId').isUUID(),
  handleValidationErrors
], async (req: any, res: any) => {
  try {
    const { streamId } = req.params;
    const userId = req.user.id;
    const username = req.user.username;
    
    const viewer = await streamingService.joinStream(streamId, userId, username);
    
    // Emit viewer joined event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`stream:${streamId}`).emit('viewer:joined', { viewer });
    }
    
    res.json({
      success: true,
      viewer
    });
  } catch (error) {
    logger.error('Error joining stream:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to join stream'
    });
  }
});

// Leave stream
router.post('/:streamId/leave', [
  authenticate,
  param('streamId').isUUID(),
  handleValidationErrors
], async (req: any, res: any) => {
  try {
    const { streamId } = req.params;
    const userId = req.user.id;
    
    await streamingService.leaveStream(streamId, userId);
    
    // Emit viewer left event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`stream:${streamId}`).emit('viewer:left', { userId });
    }
    
    res.json({
      success: true,
      message: 'Left stream successfully'
    });
  } catch (error) {
    logger.error('Error leaving stream:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to leave stream'
    });
  }
});

// Send message in stream chat
router.post('/:streamId/chat', [
  authenticate,
  param('streamId').isUUID(),
  body('message').notEmpty().trim().isLength({ min: 1, max: 500 }),
  body('type').optional().isIn(['chat', 'gift', 'follow', 'subscribe', 'donation', 'system']),
  handleValidationErrors
], async (req: any, res: any) => {
  try {
    const { streamId } = req.params;
    const { message, type = 'chat' } = req.body;
    const userId = req.user.id;
    const username = req.user.username;
    
    const streamMessage = await streamingService.sendStreamMessage(
      streamId,
      userId,
      username,
      message,
      type as StreamMessageType
    );
    
    // Emit message via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`stream:${streamId}`).emit('stream:message', { message: streamMessage });
    }
    
    res.json({
      success: true,
      message: streamMessage
    });
  } catch (error) {
    logger.error('Error sending stream message:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to send message'
    });
  }
});

// Send gift
router.post('/:streamId/gift', [
  authenticate,
  param('streamId').isUUID(),
  body('giftType').notEmpty().trim().isIn(['rose', 'heart', 'star', 'diamond', 'crown']),
  body('quantity').isInt({ min: 1, max: 100 }).toInt(),
  body('message').optional().trim().isLength({ max: 200 }),
  handleValidationErrors
], async (req: any, res: any) => {
  try {
    const { streamId } = req.params;
    const { giftType, quantity, message } = req.body;
    const fromUserId = req.user.id;
    
    const gift = await streamingService.sendGift(streamId, fromUserId, giftType, quantity, message);
    
    // Emit gift via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`stream:${streamId}`).emit('stream:gift', { gift });
    }
    
    res.json({
      success: true,
      gift
    });
  } catch (error) {
    logger.error('Error sending gift:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to send gift'
    });
  }
});

// Get stream messages
router.get('/:streamId/messages', [
  param('streamId').isUUID(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  handleValidationErrors
], async (req: any, res: any) => {
  try {
    const { streamId } = req.params;
    const { limit = 50 } = req.query;
    
    const messages = streamingService.getStreamMessages(streamId, limit);
    
    res.json({
      success: true,
      messages,
      count: messages.length
    });
  } catch (error) {
    logger.error('Error fetching stream messages:', error);
    res.status(500).json({
      error: 'Failed to fetch stream messages'
    });
  }
});

// Get stream viewers
router.get('/:streamId/viewers', [
  param('streamId').isUUID(),
  handleValidationErrors
], async (req: any, res: any) => {
  try {
    const { streamId } = req.params;
    const viewers = streamingService.getStreamViewers(streamId);
    
    res.json({
      success: true,
      viewers,
      count: viewers.length
    });
  } catch (error) {
    logger.error('Error fetching stream viewers:', error);
    res.status(500).json({
      error: 'Failed to fetch stream viewers'
    });
  }
});

// Get stream analytics
router.get('/:streamId/analytics', [
  authenticate,
  param('streamId').isUUID(),
  handleValidationErrors
], async (req: any, res: any) => {
  try {
    const { streamId } = req.params;
    const userId = req.user.id;
    
    // Verify stream ownership
    const stream = streamingService.getStream(streamId);
    if (!stream) {
      return res.status(404).json({
        error: 'Stream not found'
      });
    }
    
    if (stream.userId !== userId) {
      return res.status(403).json({
        error: 'Access denied to stream analytics'
      });
    }
    
    const analytics = streamingService.getStreamAnalytics(streamId);
    
    if (!analytics) {
      return res.status(404).json({
        error: 'Analytics not found'
      });
    }
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    logger.error('Error fetching stream analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch stream analytics'
    });
  }
});

// Get user's streams
router.get('/user/:userId', [
  param('userId').isUUID(),
  query('status').optional().isIn(['live', 'upcoming', 'ended', 'all']),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  handleValidationErrors
], async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const { status = 'all', limit = 20 } = req.query;
    
    // This would typically query from database
    // For now, filtering from memory (in production, use proper database queries)
    const allStreams = Array.from(streamingService['streams'].values());
    let userStreams = allStreams.filter(stream => stream.userId === userId);
    
    // Filter by status
    if (status !== 'all') {
      switch (status) {
        case 'live':
          userStreams = userStreams.filter(stream => stream.isLive);
          break;
        case 'upcoming':
          userStreams = userStreams.filter(stream => 
            !stream.isLive && new Date(stream.startTime) > new Date()
          );
          break;
        case 'ended':
          userStreams = userStreams.filter(stream => 
            !stream.isLive && stream.endTime
          );
          break;
      }
    }
    
    // Sort by creation date (most recent first)
    userStreams.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Limit results
    userStreams = userStreams.slice(0, limit);
    
    res.json({
      success: true,
      streams: userStreams,
      count: userStreams.length
    });
  } catch (error) {
    logger.error('Error fetching user streams:', error);
    res.status(500).json({
      error: 'Failed to fetch user streams'
    });
  }
});

// Search streams
router.get('/search', [
  query('q').notEmpty().trim().isLength({ min: 1, max: 100 }),
  query('category').optional().isString().trim(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  handleValidationErrors
], async (req: any, res: any) => {
  try {
    const { q, category, limit = 20 } = req.query;
    
    // Get all live streams
    let streams = streamingService.getLiveStreams(category, 100);
    
    // Filter by search query (title, description, tags)
    const searchQuery = q.toLowerCase();
    streams = streams.filter(stream => 
      stream.title.toLowerCase().includes(searchQuery) ||
      stream.description?.toLowerCase().includes(searchQuery) ||
      stream.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    );
    
    // Limit results
    streams = streams.slice(0, limit);
    
    res.json({
      success: true,
      streams,
      count: streams.length,
      query: q
    });
  } catch (error) {
    logger.error('Error searching streams:', error);
    res.status(500).json({
      error: 'Failed to search streams'
    });
  }
});

export default router;
