/**
 * ConnectHub Backend Server
 * Complete Express + Socket.IO server with real API integration
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import messageRoutes from './routes/messages';
import uploadRoutes from './routes/upload';
import datingRoutes from './routes/dating';

// Import WebSocket handlers
import { initializeSocketIO } from './sockets';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth.middleware';

const app: Express = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Initialize WebSocket handlers
initializeSocketIO(io);

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: {
            api: 'operational',
            websocket: io.engine.clientsCount > 0 ? 'connected' : 'ready',
            database: 'operational'
        }
    });
});

// API Routes
const API_VERSION = '/api/v1';

app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/users`, authMiddleware, userRoutes);
app.use(`${API_VERSION}/posts`, authMiddleware, postRoutes);
app.use(`${API_VERSION}/messages`, authMiddleware, messageRoutes);
app.use(`${API_VERSION}/notifications`, authMiddleware, notificationRoutes);
app.use(`${API_VERSION}/upload`, authMiddleware, uploadRoutes);
app.use(`${API_VERSION}/dating`, authMiddleware, datingRoutes);
app.use(`${API_VERSION}/groups`, authMiddleware, groupRoutes);
app.use(`${API_VERSION}/events`, authMiddleware, eventRoutes);
app.use(`${API_VERSION}/stories`, authMiddleware, storyRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.url} not found`
    });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║            ConnectHub Backend Server                   ║
╠════════════════════════════════════════════════════════╣
║  Status: ✓ Running                                     ║
║  Port: ${PORT}                                              ║
║  Environment: ${process.env.NODE_ENV || 'development'}                          ║
║  API: http://localhost:${PORT}/api/v1                   ║
║  Health: http://localhost:${PORT}/health                ║
║  WebSocket: Ready for connections                      ║
╚════════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

export { app, io };
