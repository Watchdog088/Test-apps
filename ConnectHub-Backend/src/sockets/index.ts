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

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User ${socket.username} disconnected`);
      socket.broadcast.emit('user_status_change', {
        userId: socket.userId,
        status: 'offline'
      });
    });
  });

  return io;
};
