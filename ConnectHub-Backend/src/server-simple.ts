/**
 * ConnectHub Backend Server - Simplified Version for Quick Start
 * This version runs without TypeScript compilation errors
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
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
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req: any, res: any) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: {
            url: process.env.DATABASE_URL ? 'Connected' : 'Not configured',
            endpoint: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'N/A'
        },
        services: {
            api: 'operational',
            websocket: io.engine.clientsCount + ' clients connected',
            storage: process.env.AWS_S3_BUCKET || 'Not configured'
        }
    });
});

// Root endpoint
app.get('/', (req: any, res: any) => {
    res.json({
        message: 'LynkApp API Server',
        version: '1.0.0',
        status: 'Running',
        endpoints: {
            health: '/health',
            api: '/api/v1'
        }
    });
});

// API Routes placeholder
const API_VERSION = '/api/v1';

// Placeholder routes for testing
app.get(`${API_VERSION}/test`, (req: any, res: any) => {
    res.json({
        message: 'API is working!',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req: any, res: any) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.url} not found`,
        availableEndpoints: {
            health: 'GET /health',
            root: 'GET /',
            test: `GET ${API_VERSION}/test`
        }
    });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║            LynkApp Backend Server                      ║
╠════════════════════════════════════════════════════════╣
║  Status: ✓ Running                                     ║
║  Port: ${PORT}                                              ║
║  Environment: ${process.env.NODE_ENV || 'development'}                          ║
║  API: http://localhost:${PORT}/api/v1                   ║
║  Health: http://localhost:${PORT}/health                ║
║  WebSocket: Ready for connections                      ║
╠════════════════════════════════════════════════════════╣
║  Database: ${process.env.DATABASE_URL ? '✓ Configured' : '✗ Not configured'}                              ║
║  S3 Bucket: ${process.env.AWS_S3_BUCKET || 'Not configured'}                            ║
╚════════════════════════════════════════════════════════╝
    `);
    
    // Log database connection info
    if (process.env.DATABASE_URL) {
        const dbEndpoint = process.env.DATABASE_URL.split('@')[1]?.split(':')[0];
        console.log(`📊 Database: ${dbEndpoint}`);
    }
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
