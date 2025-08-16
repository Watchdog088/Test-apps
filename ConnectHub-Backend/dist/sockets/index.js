"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../config/logger"));
const initializeSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            socket.username = decoded.username;
            next();
        }
        catch (err) {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        logger_1.default.info(`User ${socket.username} connected with socket ID: ${socket.id}`);
        socket.join(`user_${socket.userId}`);
        socket.on('join_conversation', (conversationId) => {
            socket.join(`conversation_${conversationId}`);
            logger_1.default.info(`User ${socket.username} joined conversation ${conversationId}`);
        });
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(`conversation_${conversationId}`);
            logger_1.default.info(`User ${socket.username} left conversation ${conversationId}`);
        });
        socket.on('send_message', (data) => {
            socket.to(`conversation_${data.conversationId}`).emit('new_message', {
                senderId: socket.userId,
                senderUsername: socket.username,
                ...data
            });
            socket.to(`user_${data.receiverId}`).emit('message_notification', {
                senderId: socket.userId,
                senderUsername: socket.username,
                conversationId: data.conversationId,
                preview: data.content.substring(0, 50)
            });
        });
        socket.on('typing_start', (data) => {
            socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
                userId: socket.userId,
                username: socket.username
            });
        });
        socket.on('typing_stop', (data) => {
            socket.to(`conversation_${data.conversationId}`).emit('user_stop_typing', {
                userId: socket.userId
            });
        });
        socket.on('update_status', (status) => {
            socket.broadcast.emit('user_status_change', {
                userId: socket.userId,
                status
            });
        });
        socket.on('match_made', (data) => {
            socket.to(`user_${data.matchedUserId}`).emit('new_match', {
                userId: socket.userId,
                username: socket.username
            });
        });
        socket.on('disconnect', () => {
            logger_1.default.info(`User ${socket.username} disconnected`);
            socket.broadcast.emit('user_status_change', {
                userId: socket.userId,
                status: 'offline'
            });
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
//# sourceMappingURL=index.js.map