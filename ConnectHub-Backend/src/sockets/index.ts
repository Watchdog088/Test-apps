import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

interface JwtPayload {
  userId: string;
  username: string;
}

export const initializeSocket = (server: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User ${socket.username} connected with socket ID: ${socket.id}`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
      logger.info(`User ${socket.username} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`);
      logger.info(`User ${socket.username} left conversation ${conversationId}`);
    });

    // Handle sending messages
    socket.on('send_message', (data: {
      conversationId: string;
      receiverId: string;
      content: string;
      messageType: string;
    }) => {
      // Emit to conversation participants
      socket.to(`conversation_${data.conversationId}`).emit('new_message', {
        senderId: socket.userId,
        senderUsername: socket.username,
        ...data
      });

      // Emit to receiver's personal room for notifications
      socket.to(`user_${data.receiverId}`).emit('message_notification', {
        senderId: socket.userId,
        senderUsername: socket.username,
        conversationId: data.conversationId,
        preview: data.content.substring(0, 50)
      });
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { conversationId: string; receiverId: string }) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.username
      });
    });

    socket.on('typing_stop', (data: { conversationId: string }) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_stop_typing', {
        userId: socket.userId
      });
    });

    // Handle user status updates
    socket.on('update_status', (status: 'online' | 'away' | 'offline') => {
      socket.broadcast.emit('user_status_change', {
        userId: socket.userId,
        status
      });
    });

    // Handle match notifications
    socket.on('match_made', (data: { matchedUserId: string }) => {
      socket.to(`user_${data.matchedUserId}`).emit('new_match', {
        userId: socket.userId,
        username: socket.username
      });
    });

    // ===== STREAMING EVENTS =====
    
    // Handle joining stream rooms
    socket.on('join_stream', (streamId: string) => {
      socket.join(`stream:${streamId}`);
      logger.info(`User ${socket.username} joined stream ${streamId}`);
      
      // Notify other viewers that someone joined
      socket.to(`stream:${streamId}`).emit('viewer_joined', {
        userId: socket.userId,
        username: socket.username,
        timestamp: new Date()
      });
    });

    // Handle leaving stream rooms
    socket.on('leave_stream', (streamId: string) => {
      socket.leave(`stream:${streamId}`);
      logger.info(`User ${socket.username} left stream ${streamId}`);
      
      // Notify other viewers that someone left
      socket.to(`stream:${streamId}`).emit('viewer_left', {
        userId: socket.userId,
        username: socket.username,
        timestamp: new Date()
      });
    });

    // Handle stream chat messages
    socket.on('stream_message', (data: {
      streamId: string;
      message: string;
      type?: string;
    }) => {
      const streamMessage = {
        id: `msg_${Date.now()}_${socket.id}`,
        streamId: data.streamId,
        userId: socket.userId,
        username: socket.username,
        message: data.message,
        type: data.type || 'chat',
        timestamp: new Date(),
        isFromStreamer: false // This would be determined by comparing userId with stream owner
      };

      // Emit to all viewers in the stream
      io.to(`stream:${data.streamId}`).emit('stream:message', {
        message: streamMessage
      });
    });

    // Handle stream reactions
    socket.on('stream_reaction', (data: {
      streamId: string;
      type: string; // 'like', 'love', 'laugh', etc.
    }) => {
      const reaction = {
        id: `reaction_${Date.now()}_${socket.id}`,
        streamId: data.streamId,
        userId: socket.userId,
        username: socket.username,
        type: data.type,
        timestamp: new Date()
      };

      // Emit to all viewers in the stream
      io.to(`stream:${data.streamId}`).emit('stream:reaction', {
        reaction
      });
    });

    // Handle stream gifts
    socket.on('stream_gift', (data: {
      streamId: string;
      giftType: string;
      quantity: number;
      message?: string;
    }) => {
      const gift = {
        id: `gift_${Date.now()}_${socket.id}`,
        streamId: data.streamId,
        fromUserId: socket.userId,
        fromUsername: socket.username,
        giftType: data.giftType,
        quantity: data.quantity,
        message: data.message,
        timestamp: new Date()
      };

      // Emit to all viewers in the stream
      io.to(`stream:${data.streamId}`).emit('stream:gift', {
        gift
      });
    });

    // Handle streamer controls
    socket.on('stream_control', (data: {
      streamId: string;
      action: 'start' | 'end' | 'pause' | 'resume';
    }) => {
      // Emit to all viewers in the stream
      socket.to(`stream:${data.streamId}`).emit('stream:control', {
        streamId: data.streamId,
        action: data.action,
        timestamp: new Date()
      });
    });

    // Handle stream quality change
    socket.on('stream_quality_change', (data: {
      streamId: string;
      quality: string;
    }) => {
      socket.to(`stream:${data.streamId}`).emit('stream:quality_changed', {
        quality: data.quality,
        timestamp: new Date()
      });
    });

    // Handle stream viewer count updates
    socket.on('request_viewer_count', (streamId: string) => {
      const room = io.sockets.adapter.rooms.get(`stream:${streamId}`);
      const viewerCount = room ? room.size : 0;
      
      socket.emit('stream:viewer_count', {
        streamId,
        count: viewerCount
      });
    });

    // ===== END STREAMING EVENTS =====

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User ${socket.username} disconnected`);
      socket.broadcast.emit('user_status_change', {
        userId: socket.userId,
        status: 'offline'
      });

      // Handle leaving all stream rooms on disconnect
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room.startsWith('stream:')) {
          const streamId = room.replace('stream:', '');
          socket.to(room).emit('viewer_left', {
            userId: socket.userId,
            username: socket.username,
            timestamp: new Date()
          });
        }
      });
    });
  });

  return io;
};
