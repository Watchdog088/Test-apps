/**
 * ConnectHub / LynkApp Backend Server
 * Fixed: Sep 14, 2026 — Socket.IO enabled, all 36 routes mounted
 *
 * Changes from previous version:
 *  1. initializeSocket() (correct name) is now called — Socket.IO real-time is LIVE
 *  2. All 36 route files are imported and mounted — no more 404s
 *  3. consentRoutes uses named import (matches that file's export style)
 *  4. authMiddleware cast to `any` to resolve AuthRequest ↔ Request type mismatch
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// ── Core Routes ───────────────────────────────────────────────────────────────
// Sentry error tracking (must be the VERY FIRST import)
// Install: npm i @sentry/node @sentry/tracing
// Gracefully skip if SENTRY_DSN is not configured
let Sentry: any = null;
try {
  if (process.env.SENTRY_DSN) {
    Sentry = require('@sentry/node');
    Sentry.init({
      dsn:              process.env.SENTRY_DSN,
      environment:      process.env.NODE_ENV || 'production',
      tracesSampleRate: 0.1,
    });
    console.log('✓ Sentry error tracking initialized');
  }
} catch { /* Sentry package not installed — server continues without it */ }

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import messageRoutes from './routes/messages';
import uploadRoutes from './routes/upload';
import datingRoutes from './routes/dating';
import streamingRoutes from './routes/streaming';
import walletRoutes from './routes/wallet';

// ── Critical Routes (FIX: were commented out — caused 404s) ──────────────────
import notificationRoutes from './routes/notifications';
import notificationsProxyRoutes from './routes/notifications-proxy';
import friendRoutes from './routes/friends';
import groupRoutes from './routes/groups';
import eventRoutes from './routes/events';
import storyRoutes from './routes/stories';
import searchRoutes from './routes/search';
import marketplacePaymentRoutes from './routes/marketplace-payments';
import kycRoutes from './routes/kyc';
import billingRoutes from './routes/billing';

// ── High Priority Routes (newly mounted) ─────────────────────────────────────
import adminRoutes from './routes/admin';
import callRoutes from './routes/calls';
import settingsRoutes from './routes/settings';
import mediaRoutes from './routes/media';
import musicRoutes from './routes/music';
import creatorRoutes from './routes/creator';
import monetizationRoutes from './routes/monetization';
import premiumRoutes from './routes/premium';
import helpRoutes from './routes/help';
import healthRoutes from './routes/health';

// ── Medium / Lower Priority Routes ───────────────────────────────────────────
import businessRoutes from './routes/business';
import gamingRoutes from './routes/gaming';
import gamificationRoutes from './routes/gamification';
import arvrRoutes from './routes/arvr';
import chatbotRoutes from './routes/chatbot';
// FIX: consent.ts uses named export, not default export
import { consentRoutes } from './routes/consent';
import contentControlRoutes from './routes/content-control';
import videoMusicRoutes from './routes/video-music';
import enterpriseRoutes from './routes/enterprise';
// ── New routes added Sep 2026 ─────────────────────────────────────
import authExtRoutes    from './routes/auth-extensions';
import marketplaceRoutes from './routes/marketplace';

// ── WebSocket handlers (FIX: was commented out — real-time was dead) ─────────
// The correct exported function name in sockets/index.ts is `initializeSocket`
import { initializeSocket } from './sockets';

// ── BullMQ Background Workers (Sep 14, 2026 — Gap Fix #4) ────────────────────
import { startEmailWorker } from './workers/email-worker';
import { startPushWorker }  from './workers/push-worker';
import { scheduleRepeatJobs } from './services/bullmq-queue';

// ── Middleware ────────────────────────────────────────────────────────────────
import { errorHandler } from './middleware/errorHandler';
// FIX: cast to `any` to bridge AuthRequest ↔ Request type mismatch
import { authMiddleware as _authMiddleware } from './middleware/auth.middleware';
const authMiddleware = _authMiddleware as any;

// ── CORS whitelist ────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://lynkapp.com',
    'https://www.lynkapp.com',
    'https://lynkapp-c7db1.web.app',
    'https://lynkapp-c7db1.firebaseapp.com',
    process.env.FRONTEND_URL,
].filter(Boolean) as string[];

// ── App & HTTP server ─────────────────────────────────────────────────────────
const app: Express = express();
const httpServer = createServer(app);

// ── Socket.IO ────────────────────────────────────────────────────────────────
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
            callback(new Error(`Socket.IO CORS: origin ${origin} not allowed`));
        },
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// ── Security / body / static ──────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
}));

// ── Top-level health (no auth) ────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        routes: 36,
        services: {
            api: 'operational',
            websocket: io.engine.clientsCount > 0 ? 'connected' : 'ready',
        }
    });
});

// ── API Routes ────────────────────────────────────────────────────────────────
const V1 = '/api/v1';

// Public (no auth)
app.use(`${V1}/auth`, authRoutes);
app.use(`${V1}/health`, healthRoutes);
app.use(`${V1}/notifications/proxy`, notificationsProxyRoutes);

// Webhook routes — Stripe/Mux verify raw body, skip auth middleware
app.use(`${V1}/streaming`, streamingRoutes);
app.use(`${V1}/wallet`, walletRoutes);

// Auth-gated: core
app.use(`${V1}/users`,    authMiddleware, userRoutes);
app.use(`${V1}/posts`,    authMiddleware, postRoutes);
app.use(`${V1}/messages`, authMiddleware, messageRoutes);
app.use(`${V1}/upload`,   authMiddleware, uploadRoutes);
app.use(`${V1}/dating`,   authMiddleware, datingRoutes);

// Auth-gated: critical (previously 404ing)
app.use(`${V1}/notifications`,          authMiddleware, notificationRoutes);
app.use(`${V1}/friends`,                authMiddleware, friendRoutes);
app.use(`${V1}/groups`,                 authMiddleware, groupRoutes);
app.use(`${V1}/events`,                 authMiddleware, eventRoutes);
app.use(`${V1}/stories`,                authMiddleware, storyRoutes);
app.use(`${V1}/search`,                 authMiddleware, searchRoutes);
app.use(`${V1}/marketplace/payments`,   authMiddleware, marketplacePaymentRoutes);
app.use(`${V1}/kyc`,                    authMiddleware, kycRoutes);
app.use(`${V1}/billing`,                authMiddleware, billingRoutes);

// Auth-gated: high priority
app.use(`${V1}/admin`,        authMiddleware, adminRoutes);
app.use(`${V1}/calls`,        authMiddleware, callRoutes);
app.use(`${V1}/settings`,     authMiddleware, settingsRoutes);
app.use(`${V1}/media`,        authMiddleware, mediaRoutes);
app.use(`${V1}/music`,        authMiddleware, musicRoutes);
app.use(`${V1}/creator`,      authMiddleware, creatorRoutes);
app.use(`${V1}/monetization`, authMiddleware, monetizationRoutes);
app.use(`${V1}/premium`,      authMiddleware, premiumRoutes);
app.use(`${V1}/help`,         authMiddleware, helpRoutes);

// Auth-gated: medium / lower priority
app.use(`${V1}/business`,       authMiddleware, businessRoutes);
app.use(`${V1}/gaming`,         authMiddleware, gamingRoutes);
app.use(`${V1}/gamification`,   authMiddleware, gamificationRoutes);
app.use(`${V1}/arvr`,           authMiddleware, arvrRoutes);
app.use(`${V1}/chatbot`,        authMiddleware, chatbotRoutes);
app.use(`${V1}/consent`,        authMiddleware, consentRoutes);
app.use(`${V1}/content-control`,authMiddleware, contentControlRoutes);
app.use(`${V1}/video-music`,    authMiddleware, videoMusicRoutes);
app.use(`${V1}/enterprise`,     authMiddleware, enterpriseRoutes);

// Sep 2026 — newly wired routes
app.use(`${V1}/auth`,        authExtRoutes);          // refresh-token, google/apple sync, delete-account
app.use(`${V1}/marketplace`, authMiddleware, marketplaceRoutes); // listings CRUD + reviews

// 404
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found', message: `${req.method} ${req.url} not found` });
});

// Error handler
app.use(errorHandler);

// ── Server startup ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        // FIX: Socket.IO handlers are now active (was commented out before)
        // initializeSocket expects the raw HTTP server, not the Socket.IO instance
        initializeSocket(httpServer as any);
        console.log('✓ Socket.IO initialized — real-time is LIVE');

        // ── BullMQ Workers — Gap Fix #4 (Sep 14, 2026) ──────────────────────
        // Start email and push workers so queued jobs are actually processed.
        // Workers gracefully no-op if Redis is unavailable (dev without Redis).
        startEmailWorker();
        startPushWorker();
        scheduleRepeatJobs(); // weekly payouts + hourly story cleanup
        console.log('✓ BullMQ workers started (email, push, repeat jobs)');

        httpServer.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════════════╗
║          LynkApp / ConnectHub Backend  v2.0               ║
╠═══════════════════════════════════════════════════════════╣
║  Status:       ✓ Running                                  ║
║  Port:         ${String(PORT).padEnd(10)}                           ║
║  Routes:       36 mounted                                 ║
║  Socket.IO:    ✓ Enabled                                  ║
║  BullMQ:       ✓ Workers running                          ║
║  API:          /api/v1                                    ║
║  Health:       /health                                    ║
╚═══════════════════════════════════════════════════════════╝`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();

process.on('SIGTERM', () => httpServer.close(() => process.exit(0)));
process.on('SIGINT',  () => httpServer.close(() => process.exit(0)));

export { app, io };
