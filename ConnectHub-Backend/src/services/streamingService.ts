import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import logger from '../config/logger';
import {
  StreamInfo,
  StreamMessage,
  StreamViewer,
  StreamGift,
  StreamAnalytics,
  CreateStreamRequest,
  UpdateStreamRequest,
  StreamSettings,
  StreamNotification,
  StreamMessageType,
  StreamReactionType,
  StreamNotificationType
} from '../types/streaming';

class StreamingService {
  private streams: Map<string, StreamInfo> = new Map();
  private viewers: Map<string, StreamViewer[]> = new Map();
  private messages: Map<string, StreamMessage[]> = new Map();
  private analytics: Map<string, StreamAnalytics> = new Map();

  // Generate unique stream key for RTMP streaming
  generateStreamKey(userId: string): string {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    return crypto
      .createHash('sha256')
      .update(`${userId}-${timestamp}-${randomBytes}`)
      .digest('hex');
  }

  // Create a new stream
  async createStream(userId: string, streamData: CreateStreamRequest): Promise<StreamInfo> {
    try {
      const streamId = uuidv4();
      const streamKey = this.generateStreamKey(userId);
      
      const stream: StreamInfo = {
        id: streamId,
        userId,
        title: streamData.title,
        description: streamData.description,
        category: streamData.category,
        thumbnailUrl: streamData.thumbnailUrl,
        isLive: false,
        viewerCount: 0,
        startTime: streamData.scheduledStartTime || new Date(),
        streamKey,
        rtmpUrl: `rtmp://stream.connecthub.com/live/${streamKey}`,
        hlsUrl: `https://stream.connecthub.com/hls/${streamKey}/playlist.m3u8`,
        quality: [
          { resolution: '1080p', bitrate: 6000, fps: 60, url: '' },
          { resolution: '720p', bitrate: 4000, fps: 30, url: '' },
          { resolution: '480p', bitrate: 2500, fps: 30, url: '' },
          { resolution: '360p', bitrate: 1000, fps: 30, url: '' }
        ],
        tags: streamData.tags || [],
        isPrivate: streamData.isPrivate || false,
        allowedViewers: streamData.allowedViewers || [],
        chatEnabled: streamData.chatEnabled !== false,
        recordingEnabled: streamData.recordingEnabled || false,
        monetizationEnabled: streamData.monetizationEnabled || false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.streams.set(streamId, stream);
      this.viewers.set(streamId, []);
      this.messages.set(streamId, []);
      
      // Initialize analytics
      this.analytics.set(streamId, {
        streamId,
        totalViewers: 0,
        uniqueViewers: 0,
        peakViewers: 0,
        averageWatchTime: 0,
        totalWatchTime: 0,
        chatMessages: 0,
        reactions: 0,
        gifts: [],
        viewersByCountry: {},
        viewersByDevice: {},
        revenueGenerated: 0
      });

      logger.info(`Stream created: ${streamId} by user ${userId}`);
      return stream;
    } catch (error) {
      logger.error('Error creating stream:', error);
      throw new Error('Failed to create stream');
    }
  }

  // Start a live stream
  async startStream(streamId: string, userId: string): Promise<StreamInfo> {
    try {
      const stream = this.streams.get(streamId);
      if (!stream) {
        throw new Error('Stream not found');
      }
      
      if (stream.userId !== userId) {
        throw new Error('Unauthorized to start this stream');
      }

      stream.isLive = true;
      stream.startTime = new Date();
      stream.updatedAt = new Date();

      this.streams.set(streamId, stream);

      // Notify followers about stream start
      await this.notifyStreamStart(stream);

      logger.info(`Stream started: ${streamId}`);
      return stream;
    } catch (error) {
      logger.error('Error starting stream:', error);
      throw error;
    }
  }

  // End a live stream
  async endStream(streamId: string, userId: string): Promise<StreamInfo> {
    try {
      const stream = this.streams.get(streamId);
      if (!stream) {
        throw new Error('Stream not found');
      }
      
      if (stream.userId !== userId) {
        throw new Error('Unauthorized to end this stream');
      }

      stream.isLive = false;
      stream.endTime = new Date();
      stream.viewerCount = 0;
      stream.updatedAt = new Date();

      this.streams.set(streamId, stream);

      // Remove all viewers
      const viewers = this.viewers.get(streamId) || [];
      viewers.forEach(viewer => {
        viewer.isActive = false;
        viewer.leaveTime = new Date();
      });

      // Calculate final analytics
      await this.finalizeStreamAnalytics(streamId);

      // Notify about stream end
      await this.notifyStreamEnd(stream);

      logger.info(`Stream ended: ${streamId}`);
      return stream;
    } catch (error) {
      logger.error('Error ending stream:', error);
      throw error;
    }
  }

  // Join a stream as viewer
  async joinStream(streamId: string, userId: string, username: string): Promise<StreamViewer> {
    try {
      const stream = this.streams.get(streamId);
      if (!stream) {
        throw new Error('Stream not found');
      }

      if (!stream.isLive) {
        throw new Error('Stream is not live');
      }

      // Check if stream is private
      if (stream.isPrivate && !stream.allowedViewers?.includes(userId)) {
        throw new Error('Access denied to private stream');
      }

      const viewers = this.viewers.get(streamId) || [];
      
      // Check if user already viewing
      const existingViewer = viewers.find(v => v.userId === userId && v.isActive);
      if (existingViewer) {
        return existingViewer;
      }

      const viewer: StreamViewer = {
        id: uuidv4(),
        streamId,
        userId,
        username,
        joinTime: new Date(),
        isActive: true,
        isModerator: false,
        watchTime: 0
      };

      viewers.push(viewer);
      this.viewers.set(streamId, viewers);

      // Update viewer count
      stream.viewerCount = viewers.filter(v => v.isActive).length;
      this.streams.set(streamId, stream);

      // Update analytics
      const analytics = this.analytics.get(streamId);
      if (analytics) {
        analytics.totalViewers++;
        analytics.uniqueViewers = new Set(viewers.map(v => v.userId)).size;
        analytics.peakViewers = Math.max(analytics.peakViewers, stream.viewerCount);
        this.analytics.set(streamId, analytics);
      }

      logger.info(`User ${userId} joined stream ${streamId}`);
      return viewer;
    } catch (error) {
      logger.error('Error joining stream:', error);
      throw error;
    }
  }

  // Leave a stream
  async leaveStream(streamId: string, userId: string): Promise<void> {
    try {
      const viewers = this.viewers.get(streamId) || [];
      const viewerIndex = viewers.findIndex(v => v.userId === userId && v.isActive);
      
      if (viewerIndex === -1) {
        return; // User not in stream
      }

      const viewer = viewers[viewerIndex];
      viewer.isActive = false;
      viewer.leaveTime = new Date();
      viewer.watchTime = Math.floor((viewer.leaveTime.getTime() - viewer.joinTime.getTime()) / 1000);

      this.viewers.set(streamId, viewers);

      // Update viewer count
      const stream = this.streams.get(streamId);
      if (stream) {
        stream.viewerCount = viewers.filter(v => v.isActive).length;
        this.streams.set(streamId, stream);
      }

      // Update analytics
      const analytics = this.analytics.get(streamId);
      if (analytics) {
        analytics.totalWatchTime += viewer.watchTime;
        analytics.averageWatchTime = analytics.totalWatchTime / analytics.uniqueViewers;
        this.analytics.set(streamId, analytics);
      }

      logger.info(`User ${userId} left stream ${streamId}`);
    } catch (error) {
      logger.error('Error leaving stream:', error);
      throw error;
    }
  }

  // Send message in stream chat
  async sendStreamMessage(
    streamId: string,
    userId: string,
    username: string,
    message: string,
    type: StreamMessageType = StreamMessageType.CHAT
  ): Promise<StreamMessage> {
    try {
      const stream = this.streams.get(streamId);
      if (!stream) {
        throw new Error('Stream not found');
      }

      if (!stream.chatEnabled) {
        throw new Error('Chat is disabled for this stream');
      }

      const streamMessage: StreamMessage = {
        id: uuidv4(),
        streamId,
        userId,
        username,
        message,
        type,
        timestamp: new Date(),
        isFromStreamer: userId === stream.userId,
        isPinned: false,
        reactions: []
      };

      const messages = this.messages.get(streamId) || [];
      messages.push(streamMessage);
      
      // Keep only last 1000 messages
      if (messages.length > 1000) {
        messages.splice(0, messages.length - 1000);
      }
      
      this.messages.set(streamId, messages);

      // Update analytics
      const analytics = this.analytics.get(streamId);
      if (analytics) {
        analytics.chatMessages++;
        this.analytics.set(streamId, analytics);
      }

      logger.info(`Message sent in stream ${streamId} by user ${userId}`);
      return streamMessage;
    } catch (error) {
      logger.error('Error sending stream message:', error);
      throw error;
    }
  }

  // Send gift to streamer
  async sendGift(
    streamId: string,
    fromUserId: string,
    giftType: string,
    quantity: number,
    message?: string
  ): Promise<StreamGift> {
    try {
      const stream = this.streams.get(streamId);
      if (!stream) {
        throw new Error('Stream not found');
      }

      if (!stream.monetizationEnabled) {
        throw new Error('Monetization is disabled for this stream');
      }

      // Define gift values (in platform currency)
      const giftValues: Record<string, number> = {
        'rose': 1,
        'heart': 5,
        'star': 10,
        'diamond': 50,
        'crown': 100
      };

      const giftValue = giftValues[giftType] || 1;

      const gift: StreamGift = {
        id: uuidv4(),
        streamId,
        fromUserId,
        toUserId: stream.userId,
        giftType,
        quantity,
        value: giftValue * quantity,
        message,
        timestamp: new Date()
      };

      // Update analytics
      const analytics = this.analytics.get(streamId);
      if (analytics) {
        analytics.gifts.push(gift);
        analytics.revenueGenerated += gift.value;
        this.analytics.set(streamId, analytics);
      }

      // Send gift notification message
      await this.sendStreamMessage(
        streamId,
        fromUserId,
        'System',
        `Sent ${quantity}x ${giftType} to ${stream.title}`,
        StreamMessageType.GIFT
      );

      logger.info(`Gift sent in stream ${streamId}: ${giftType} x${quantity}`);
      return gift;
    } catch (error) {
      logger.error('Error sending gift:', error);
      throw error;
    }
  }

  // Get stream information
  getStream(streamId: string): StreamInfo | undefined {
    return this.streams.get(streamId);
  }

  // Get live streams
  getLiveStreams(category?: string, limit: number = 20): StreamInfo[] {
    const liveStreams = Array.from(this.streams.values())
      .filter(stream => stream.isLive && !stream.isPrivate)
      .sort((a, b) => b.viewerCount - a.viewerCount);

    if (category) {
      return liveStreams
        .filter(stream => stream.category === category)
        .slice(0, limit);
    }

    return liveStreams.slice(0, limit);
  }

  // Get stream messages
  getStreamMessages(streamId: string, limit: number = 100): StreamMessage[] {
    const messages = this.messages.get(streamId) || [];
    return messages.slice(-limit);
  }

  // Get stream viewers
  getStreamViewers(streamId: string): StreamViewer[] {
    return this.viewers.get(streamId)?.filter(v => v.isActive) || [];
  }

  // Get stream analytics
  getStreamAnalytics(streamId: string): StreamAnalytics | undefined {
    return this.analytics.get(streamId);
  }

  // Update stream information
  async updateStream(streamId: string, userId: string, updates: UpdateStreamRequest): Promise<StreamInfo> {
    try {
      const stream = this.streams.get(streamId);
      if (!stream) {
        throw new Error('Stream not found');
      }

      if (stream.userId !== userId) {
        throw new Error('Unauthorized to update this stream');
      }

      const updatedStream = {
        ...stream,
        ...updates,
        updatedAt: new Date()
      };

      this.streams.set(streamId, updatedStream);
      
      logger.info(`Stream updated: ${streamId}`);
      return updatedStream;
    } catch (error) {
      logger.error('Error updating stream:', error);
      throw error;
    }
  }

  // Notify followers about stream start
  private async notifyStreamStart(stream: StreamInfo): Promise<void> {
    // Implementation would notify followers via push notifications, email, etc.
    logger.info(`Notifying followers about stream start: ${stream.id}`);
  }

  // Notify about stream end
  private async notifyStreamEnd(stream: StreamInfo): Promise<void> {
    logger.info(`Stream ended notification: ${stream.id}`);
  }

  // Finalize stream analytics
  private async finalizeStreamAnalytics(streamId: string): Promise<void> {
    const analytics = this.analytics.get(streamId);
    const viewers = this.viewers.get(streamId) || [];
    
    if (analytics) {
      // Calculate final statistics
      const totalWatchTime = viewers.reduce((sum, viewer) => sum + viewer.watchTime, 0);
      analytics.totalWatchTime = totalWatchTime;
      analytics.averageWatchTime = analytics.uniqueViewers > 0 ? totalWatchTime / analytics.uniqueViewers : 0;
      
      this.analytics.set(streamId, analytics);
      logger.info(`Analytics finalized for stream: ${streamId}`);
    }
  }

  // Clean up old streams and data
  async cleanup(): Promise<void> {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Remove old inactive streams
    for (const [streamId, stream] of this.streams.entries()) {
      if (!stream.isLive && stream.updatedAt < cutoff) {
        this.streams.delete(streamId);
        this.viewers.delete(streamId);
        this.messages.delete(streamId);
        // Keep analytics for longer term storage
        logger.info(`Cleaned up old stream: ${streamId}`);
      }
    }
  }
}

export default new StreamingService();
