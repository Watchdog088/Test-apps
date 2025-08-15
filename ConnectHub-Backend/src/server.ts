import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import 'express-async-errors';

// Import configurations and middleware
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import logger from './config/logger';
// Simple error handlers inline instead of importing
const errorHandler = (err: any, req: any, res: any, next: any) => {
  logger.error(err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};

const notFound = (req: any, res: any, next: any) => {
  res.status(404).json({
    error: `Not Found - ${req.originalUrl}`
  });
};

// Import routes
// import authRoutes from './routes/auth';
// import userRoutes from './routes/users';
// import postRoutes from './routes/posts';
// import datingRoutes from './routes/dating';
// import messageRoutes from './routes/messages';
import uploadRoutes from './routes/upload';
import healthRoutes from './routes/health';

// Import socket handlers
import { initializeSocket } from './sockets';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Initialize socket handlers
initializeSocket(server);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Compression
app.use(compression());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.API_VERSION || 'v1'
  });
});

// API routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/health`, healthRoutes);
// app.use(`/api/${API_VERSION}/auth`, authRoutes);
// app.use(`/api/${API_VERSION}/users`, userRoutes);
// app.use(`/api/${API_VERSION}/posts`, postRoutes);
// app.use(`/api/${API_VERSION}/dating`, datingRoutes);
// app.use(`/api/${API_VERSION}/messages`, messageRoutes);
// app.use(`/api/${API_VERSION}/upload`, uploadRoutes);

// Documentation route (placeholder for Swagger)
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    version: API_VERSION,
    endpoints: {
      auth: `/api/${API_VERSION}/auth`,
      users: `/api/${API_VERSION}/users`,
      posts: `/api/${API_VERSION}/posts`,
      dating: `/api/${API_VERSION}/dating`,
      messages: `/api/${API_VERSION}/messages`,
      upload: `/api/${API_VERSION}/upload`
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to databases
    await connectDB();
    await connectRedis();
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Initialize server
if (require.main === module) {
  startServer();
}

export { app, server, io };
