# 🏗️ PRODUCTION APP ARCHITECTURE GUIDE
## Web · Android · iOS — Built to Last, Built to Scale

---

## 📋 TABLE OF CONTENTS

1. [Big Picture Overview](#1-big-picture-overview)
2. [Folder & File Structure](#2-folder--file-structure)
3. [Frontend Layer (Web)](#3-frontend-layer-web)
4. [Mobile Layer (Android & iOS)](#4-mobile-layer-android--ios)
5. [Backend Layer (API Server)](#5-backend-layer-api-server)
6. [Database Layer](#6-database-layer)
7. [Authentication & Security](#7-authentication--security)
8. [Real-Time Features (Chat, Notifications, Live)](#8-real-time-features-chat-notifications-live)
9. [File & Media Storage](#9-file--media-storage)
10. [Error Handling & Crash Reporting](#10-error-handling--crash-reporting)
11. [CI/CD Pipeline (Auto Deploy)](#11-cicd-pipeline-auto-deploy)
12. [Monitoring & Logging](#12-monitoring--logging)
13. [Environment Management](#13-environment-management)
14. [Performance & Scaling](#14-performance--scaling)
15. [Complete Checklist](#15-complete-checklist)

---

## 1. BIG PICTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────┐
│                     USERS                                │
│        Web Browser  │  iOS App  │  Android App           │
└────────┬────────────┴─────┬─────┴──────────┬────────────┘
         │                  │                 │
         ▼                  ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│              CDN / Load Balancer (CloudFront/Nginx)      │
│         - Routes traffic  - SSL/HTTPS  - Caching         │
└──────────────────────────┬──────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  REST API    │  │  WebSocket   │  │  GraphQL     │
│  Server      │  │  Server      │  │  (optional)  │
│  (Node.js/   │  │  (Socket.io/ │  │              │
│   Express)   │  │   WS)        │  │              │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       └─────────────────┼──────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  PostgreSQL  │ │    Redis     │ │   S3 / CDN   │
│  (Main DB)  │ │  (Cache &    │ │  (Files &    │
│             │ │   Sessions)  │ │   Media)     │
└─────────────┘ └──────────────┘ └──────────────┘
```

**The Golden Rule:** Every platform (Web, Android, iOS) talks to the SAME backend API.  
They share the same data, the same logic — only the UI differs.

---

## 2. FOLDER & FILE STRUCTURE

This is how your entire project should be organized:

```
my-app/
│
├── 📁 apps/                          ← All platform apps live here
│   ├── 📁 web/                       ← React/Next.js web app
│   ├── 📁 mobile/                    ← React Native (iOS + Android)
│   └── 📁 admin/                     ← Admin dashboard
│
├── 📁 backend/                       ← The API server
│   ├── 📁 src/
│   │   ├── 📁 routes/                ← URL endpoints (/api/users, /api/posts)
│   │   ├── 📁 controllers/           ← Business logic for each route
│   │   ├── 📁 services/              ← Core logic (auth, payments, email)
│   │   ├── 📁 models/                ← Database table definitions
│   │   ├── 📁 middleware/            ← Auth checks, rate limiting, logging
│   │   ├── 📁 utils/                 ← Helper functions
│   │   ├── 📁 config/                ← Database, Redis, S3 connections
│   │   └── 📁 types/                 ← TypeScript interfaces
│   ├── 📁 tests/                     ← Automated tests
│   ├── Dockerfile                    ← How to build the server
│   ├── package.json
│   └── .env.example                  ← Template for environment variables
│
├── 📁 shared/                        ← Code shared by ALL platforms
│   ├── 📁 types/                     ← Shared TypeScript types
│   ├── 📁 validation/                ← Form/input validation rules
│   ├── 📁 constants/                 ← App-wide constants
│   └── 📁 utils/                     ← Shared helper functions
│
├── 📁 infrastructure/                ← Cloud setup & deployment
│   ├── 📁 terraform/                 ← Infrastructure as code (AWS/GCP)
│   ├── 📁 kubernetes/                ← Container orchestration (scaling)
│   └── 📁 scripts/                   ← Deploy scripts
│
├── 📁 .github/
│   └── 📁 workflows/                 ← GitHub Actions CI/CD pipelines
│       ├── deploy-web.yml
│       ├── deploy-backend.yml
│       └── deploy-mobile.yml
│
├── docker-compose.yml                ← Local dev environment (all services)
├── .gitignore
└── README.md
```

---

## 3. FRONTEND LAYER (WEB)

### Technology Choice: **React + Next.js** (Recommended)

```
apps/web/
├── 📁 src/
│   ├── 📁 pages/             ← Each file = a URL route
│   │   ├── index.tsx         ← Home page (/)
│   │   ├── login.tsx         ← Login page (/login)
│   │   ├── profile/
│   │   │   └── [userId].tsx  ← Dynamic route (/profile/123)
│   │   └── _app.tsx          ← Root wrapper (providers, global styles)
│   │
│   ├── 📁 components/        ← Reusable UI pieces
│   │   ├── 📁 ui/            ← Buttons, inputs, modals (no business logic)
│   │   ├── 📁 layout/        ← Header, Footer, Sidebar, Navigation
│   │   └── 📁 features/      ← Full feature components (FeedPost, ChatBox)
│   │
│   ├── 📁 hooks/             ← Custom React hooks
│   │   ├── useAuth.ts        ← Get current user, check login
│   │   ├── useApi.ts         ← Fetch data from backend
│   │   └── useSocket.ts      ← Real-time WebSocket connection
│   │
│   ├── 📁 services/          ← API call functions
│   │   ├── api.ts            ← Base axios/fetch setup
│   │   ├── auth.service.ts   ← Login, logout, register
│   │   └── user.service.ts   ← Get/update user data
│   │
│   ├── 📁 store/             ← Global state management (Redux/Zustand)
│   │   ├── auth.slice.ts     ← Who is logged in
│   │   ├── ui.slice.ts       ← Loading states, modals open/closed
│   │   └── store.ts          ← Main store setup
│   │
│   ├── 📁 styles/            ← CSS/Tailwind styles
│   └── 📁 utils/             ← Helper functions
│
├── 📁 public/
│   ├── manifest.json         ← PWA settings (install on phone from browser)
│   ├── sw.js                 ← Service Worker (offline support)
│   └── 📁 icons/             ← App icons all sizes
│
├── next.config.js            ← Next.js configuration
├── tailwind.config.js        ← Styling configuration
└── package.json
```

### Critical Web Rules:
```
✅ Always use HTTPS (never HTTP in production)
✅ Every page must have a <title> and meta tags (SEO)
✅ Images must have alt text and be compressed
✅ Never store passwords or API secrets in frontend code
✅ Handle loading states (show spinner while data loads)
✅ Handle error states (show message when API fails)
✅ Handle empty states (show "No posts yet" when list is empty)
✅ Service Worker = your app works offline
✅ Lazy load components that aren't needed immediately
```

---

## 4. MOBILE LAYER (ANDROID & IOS)

### Technology Choice: **React Native + Expo** (One codebase = Both platforms)

```
apps/mobile/
├── 📁 src/
│   ├── 📁 screens/           ← Full app screens
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── home/
│   │   │   └── FeedScreen.tsx
│   │   └── profile/
│   │       └── ProfileScreen.tsx
│   │
│   ├── 📁 navigation/        ← How screens connect together
│   │   ├── RootNavigator.tsx  ← Main router (logged in vs logged out)
│   │   ├── AuthStack.tsx      ← Login/register screens
│   │   └── MainTabs.tsx       ← Bottom tab navigation
│   │
│   ├── 📁 components/        ← Reusable UI components
│   ├── 📁 hooks/             ← Same pattern as web
│   ├── 📁 services/          ← API calls (same endpoints as web)
│   ├── 📁 store/             ← State management
│   └── 📁 utils/
│
├── 📁 android/               ← Android-specific native code
├── 📁 ios/                   ← iOS-specific native code
├── app.json                  ← App name, version, permissions
├── eas.json                  ← Expo build configuration
└── package.json
```

### Critical Mobile Rules:
```
✅ Request permissions BEFORE you need them (camera, notifications, location)
✅ Always handle the case where permission is DENIED
✅ Store auth tokens in SecureStore (not AsyncStorage - that's not encrypted)
✅ Handle offline mode gracefully (tell user they're offline)
✅ Test on REAL devices (not just simulator) before releasing
✅ Never hardcode API URLs - use environment variables
✅ Handle the "app goes to background" and "app comes back" lifecycle
✅ Deep links must work (opening the app from a URL or notification)
```

### App Permissions (declare in app.json):
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "To take photos for your profile",
        "NSPhotoLibraryUsageDescription": "To select photos from your library",
        "NSMicrophoneUsageDescription": "For voice messages and video calls",
        "NSLocationWhenInUseUsageDescription": "To find people near you"
      }
    },
    "android": {
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.RECORD_AUDIO",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.VIBRATE"
      ]
    }
  }
}
```

---

## 5. BACKEND LAYER (API SERVER)

### Technology Choice: **Node.js + Express + TypeScript**

```
backend/src/
│
├── 📄 server.ts              ← Entry point - starts the server
├── 📄 app.ts                 ← Express app setup, all middleware
│
├── 📁 routes/                ← Define URL endpoints
│   ├── auth.routes.ts        ← /api/auth/login, /api/auth/register
│   ├── user.routes.ts        ← /api/users/:id
│   ├── post.routes.ts        ← /api/posts
│   └── index.ts              ← Combines all routes
│
├── 📁 controllers/           ← Handle HTTP request/response
│   ├── auth.controller.ts
│   └── user.controller.ts
│
├── 📁 services/              ← Business logic (pure functions)
│   ├── auth.service.ts       ← JWT tokens, password hashing
│   ├── email.service.ts      ← Send emails
│   ├── storage.service.ts    ← Upload to S3
│   └── notification.service.ts
│
├── 📁 models/                ← Database schemas
│   ├── User.ts
│   ├── Post.ts
│   └── Message.ts
│
├── 📁 middleware/            ← Runs before controllers
│   ├── auth.middleware.ts    ← Verify JWT token
│   ├── rateLimit.middleware.ts ← Prevent spam (max 100 req/min)
│   ├── validate.middleware.ts  ← Check request data is valid
│   ├── logger.middleware.ts    ← Log every request
│   └── errorHandler.middleware.ts ← Catch all errors
│
└── 📁 config/
    ├── database.ts           ← PostgreSQL connection
    ├── redis.ts              ← Redis connection
    └── s3.ts                 ← AWS S3 connection
```

### A Route Looks Like This (End to End):

```
Browser/App sends:  POST /api/auth/login  { email, password }
        │
        ▼
[ auth.middleware ] ← Is this route protected? If yes, check JWT token
        │
        ▼
[ rateLimit ] ← Too many attempts? Block for 15 minutes
        │
        ▼
[ validate ] ← Is email a real email? Is password long enough?
        │
        ▼
[ auth.controller.login() ] ← Receives validated request
        │
        ▼
[ auth.service.login() ] ← Checks DB, compares password hash
        │
        ▼
[ Database ] ← SELECT * FROM users WHERE email = ?
        │
        ▼
[ Controller sends response ] ← { token: "...", user: {...} }
        │
        ▼
Browser/App receives the response and saves the token
```

### What Every API Response Looks Like:
```json
// SUCCESS response:
{
  "success": true,
  "data": { "user": { "id": 1, "name": "John" } },
  "message": "Login successful"
}

// ERROR response:
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect"
  }
}
```

---

## 6. DATABASE LAYER

### Main Database: **PostgreSQL** (Relational - for user data)

```sql
-- Core tables every app needs:

users
  id            UUID PRIMARY KEY
  email         VARCHAR UNIQUE NOT NULL
  password_hash VARCHAR NOT NULL
  username      VARCHAR UNIQUE
  avatar_url    VARCHAR
  created_at    TIMESTAMP DEFAULT NOW()
  updated_at    TIMESTAMP
  deleted_at    TIMESTAMP  ← Soft delete (never really delete users)

sessions
  id            UUID PRIMARY KEY
  user_id       UUID REFERENCES users(id)
  token         VARCHAR UNIQUE
  expires_at    TIMESTAMP
  device_info   JSONB      ← What device are they using

posts
  id            UUID PRIMARY KEY
  user_id       UUID REFERENCES users(id)
  content       TEXT
  media_urls    JSONB      ← Array of image/video URLs
  created_at    TIMESTAMP
  deleted_at    TIMESTAMP  ← Soft delete

-- ALWAYS add these indexes for speed:
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

### Cache Layer: **Redis**
```
What Redis stores (for speed):
- User sessions (expire after 30 days)
- Rate limit counters (expire after 1 minute)
- Frequently accessed data (user profile - expire after 5 min)
- Real-time presence (who is online right now)
- Job queues (send email, process video - don't block the main request)
```

### Backup Strategy:
```
✅ Automated daily backups (keep last 30 days)
✅ Point-in-time recovery (restore to any minute in last 7 days)
✅ Backups stored in a DIFFERENT region (if US-East goes down, US-West has backup)
✅ Test restoring from backup every month
```

---

## 7. AUTHENTICATION & SECURITY

### How Login Works Correctly:
```
1. User enters email + password
2. Server looks up user by email
3. Server uses bcrypt.compare(enteredPassword, storedHash)
   ← NEVER store plain text passwords
4. If match → create JWT token (expires in 15 minutes)
5. Also create a Refresh Token (expires in 30 days, stored in DB)
6. Send BOTH tokens to client
7. Client stores:
   - JWT in memory (web) or SecureStore (mobile)
   - Refresh Token in httpOnly cookie (web) or SecureStore (mobile)

When JWT expires (after 15 min):
8. Client sends refresh token to /api/auth/refresh
9. Server checks refresh token in DB
10. Server issues new JWT + new refresh token
11. Old refresh token is deleted (rotation = more secure)
```

### Security Checklist:
```
✅ Passwords: bcrypt with cost factor 12 (slow enough to stop brute force)
✅ JWT: Short expiry (15 min), signed with RS256 algorithm
✅ HTTPS: Everywhere, always (HTTP Strict Transport Security header)
✅ Rate Limiting: Max 5 login attempts per 15 minutes per IP
✅ Input Validation: NEVER trust data from client (validate everything)
✅ SQL Injection: Use parameterized queries (never string concat SQL)
✅ XSS: Sanitize all HTML content before displaying
✅ CSRF: Use csrf tokens for forms on web
✅ CORS: Only allow your own domains to call your API
✅ Secrets: In environment variables, NEVER in code
✅ Dependencies: Run npm audit weekly, fix critical vulnerabilities
✅ Headers: Use helmet.js (sets secure HTTP headers automatically)
✅ Sensitive data: Encrypt PII (Personally Identifiable Information) in DB
```

---

## 8. REAL-TIME FEATURES (CHAT, NOTIFICATIONS, LIVE)

### Technology: **Socket.io** (WebSockets)

```javascript
// How real-time messaging works:

// 1. Client connects when app opens
socket.connect('wss://api.yourapp.com', {
  auth: { token: userJWT }
});

// 2. Server verifies the JWT on connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const user = verifyJWT(token);
  if (!user) return next(new Error('Unauthorized'));
  socket.userId = user.id;
  next();
});

// 3. User joins their personal room and chat rooms
socket.join(`user:${userId}`);  // Personal notifications
socket.join(`chat:${chatId}`);  // Chat room

// 4. Sending a message
socket.emit('message:send', {
  chatId: '123',
  content: 'Hello!'
});

// 5. Server broadcasts to everyone in the room
io.to(`chat:${chatId}`).emit('message:new', {
  id: '456',
  userId: senderId,
  content: 'Hello!',
  createdAt: new Date()
});
```

### Real-Time Events to Handle:
```
message:send        ← User sends a message
message:new         ← New message received
message:read        ← Message was read (show blue checkmarks)
user:typing         ← User is typing (show "John is typing...")
user:online         ← User came online
user:offline        ← User went offline
notification:new    ← New notification (like, comment, follow)
call:incoming       ← Someone is calling
call:accepted       ← Other person answered
call:ended          ← Call ended
live:started        ← Someone started a live stream
```

---

## 9. FILE & MEDIA STORAGE

### Technology: **AWS S3** (or Cloudinary for images/video)

```
NEVER store files on your server - use cloud storage!

Why? Your server can go down. S3 has 99.999999999% durability.

File Upload Flow:
1. App requests "upload URL" from your backend
   GET /api/upload/presigned-url?type=image/jpeg

2. Backend generates a pre-signed S3 URL (valid for 5 minutes)
   Returns: { uploadUrl: "https://s3.aws.../...", fileKey: "uploads/user-123/photo.jpg" }

3. App uploads DIRECTLY to S3 (bypasses your server = faster!)
   PUT https://s3.aws.../... (with the file data)

4. App tells your backend the upload is done
   POST /api/posts { mediaUrl: "https://cdn.yourapp.com/uploads/user-123/photo.jpg" }

5. Backend saves the URL to the database

File Organization in S3:
uploads/
├── avatars/
│   └── user-{userId}/avatar.jpg
├── posts/
│   └── user-{userId}/
│       ├── image-{uuid}.jpg
│       └── video-{uuid}.mp4
└── stories/
    └── user-{userId}/story-{uuid}.jpg
```

### Image Optimization:
```
✅ Resize images on upload (max 1920px wide for posts)
✅ Convert to WebP format (50% smaller than JPEG)
✅ Generate thumbnails (400x400 for feed, 100x100 for avatars)
✅ Use CloudFront CDN (serve files from nearest location to user)
✅ Set Cache-Control headers (images can be cached for 1 year)
```

---

## 10. ERROR HANDLING & CRASH REPORTING

### This Is How You Find and Fix Bugs Fast:

```javascript
// backend/src/middleware/errorHandler.ts

export const errorHandler = (err, req, res, next) => {
  // 1. Log the full error (with stack trace)
  console.error({
    error: err.message,
    stack: err.stack,
    userId: req.user?.id,
    path: req.path,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // 2. Send to error tracking service (Sentry)
  Sentry.captureException(err, {
    user: { id: req.user?.id },
    tags: { endpoint: req.path }
  });

  // 3. Send a safe response (never send stack trace to client!)
  if (err.isOperational) {
    // Known error (user did something wrong)
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message }
    });
  }

  // Unknown error (bug in code)
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' }
  });
};
```

### Error Tracking Tools:
```
Backend:  Sentry.io (free tier available)
          - Shows every error with full stack trace
          - Groups similar errors together
          - Alerts you by email/Slack when new errors appear

Mobile:   Firebase Crashlytics (free)
          - Records every crash on Android and iOS
          - Shows exactly what screen the user was on
          - Shows device info (model, OS version)

Web:      Sentry.io (same as backend)
          - Records JavaScript errors in browser
          - Shows browser and OS version
```

### Error Types You Must Handle:
```
Network errors:    "No internet" - show offline banner
Timeout errors:    Request took too long - show retry button
401 Unauthorized:  Token expired - redirect to login
403 Forbidden:     User doesn't have permission - show message
404 Not Found:     Resource deleted - show "This was deleted"
429 Too Many:      Rate limited - show "Slow down" message
500 Server Error:  Bug on server - show "Something went wrong, try again"
```

---

## 11. CI/CD PIPELINE (AUTO DEPLOY)

### What Is This? When you push code to GitHub, it automatically tests it and deploys it. No manual work needed.

```
.github/workflows/deploy-backend.yml:

name: Deploy Backend

on:
  push:
    branches: [main]     ← Only deploy when code goes to main branch

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Run TypeScript check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm test
      
      - name: Run security audit
        run: npm audit --audit-level=high

  deploy:
    needs: test          ← Only deploy if tests PASS
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker image
        run: docker build -t myapp-backend .
      
      - name: Push to registry
        run: docker push myregistry/myapp-backend:latest
      
      - name: Deploy to AWS ECS
        run: aws ecs update-service --service myapp-backend --force-new-deployment
      
      - name: Health check
        run: curl https://api.yourapp.com/health
      
      - name: Notify team
        run: |
          curl -X POST $SLACK_WEBHOOK -d '{"text": "✅ Backend deployed successfully!"}'
```

### Branch Strategy (Git Flow):
```
main          ← Production code (what users see)
  │
  └── staging ← Testing environment (QA team tests here)
        │
        └── feature/add-dark-mode      ← Developer works here
        └── feature/fix-login-crash    ← Another developer
        └── bugfix/message-not-sending ← Bug fix

Flow:
1. Developer creates feature/fix-login-crash branch
2. Writes code, commits
3. Opens Pull Request to merge into staging
4. GitHub Actions runs tests automatically
5. Another developer reviews the code
6. Merge to staging → auto deploys to staging server
7. QA tests on staging
8. Merge staging to main → auto deploys to production
```

---

## 12. MONITORING & LOGGING

### You Must Know When Things Go Wrong BEFORE Users Complain:

```
Health Check Endpoint (must exist!):
GET /health
Returns:
{
  "status": "healthy",
  "timestamp": "2026-04-29T12:00:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "s3": "connected"
  },
  "uptime": 86400,
  "version": "1.2.3"
}

This endpoint is called every 30 seconds by your monitoring service.
If it fails → you get paged immediately.
```

### Metrics to Monitor:
```
Infrastructure:
✅ CPU usage (alert if > 80%)
✅ Memory usage (alert if > 85%)
✅ Disk usage (alert if > 90%)
✅ Network in/out

Application:
✅ API response time (alert if > 500ms average)
✅ Error rate (alert if > 1% of requests fail)
✅ Requests per second (know your peak traffic)
✅ Active users right now
✅ Database query time (alert if > 100ms average)

Business:
✅ New sign-ups per day
✅ Daily Active Users (DAU)
✅ Revenue (if applicable)
```

### Logging Structure (Every Log Entry):
```json
{
  "timestamp": "2026-04-29T12:00:00Z",
  "level": "error",
  "message": "Database connection failed",
  "service": "backend",
  "requestId": "req-abc-123",
  "userId": "user-456",
  "path": "/api/posts",
  "duration": 5023,
  "error": {
    "code": "ECONNREFUSED",
    "stack": "Error: connect ECONNREFUSED..."
  }
}
```

### Tools:
```
Monitoring: AWS CloudWatch, Grafana, Datadog
Logging:    Winston (Node.js) + CloudWatch Logs
Alerts:     PagerDuty, Opsgenie (pages your phone at 3am if site goes down)
Status Page: statuspage.io (tell users when there's an incident)
```

---

## 13. ENVIRONMENT MANAGEMENT

### You Need 3 Separate Environments:

```
Development (local)  →  Staging (test server)  →  Production (live)

Each environment has its OWN:
- Database (never test with production data!)
- API keys (use test keys for Stripe, etc.)
- S3 bucket
- Domain

Never EVER:
❌ Use production database for testing
❌ Commit .env files to GitHub
❌ Share production API keys with developers
```

### Environment Variables (.env):
```bash
# .env.example (commit this to GitHub - it's a template, no real values)
# Copy to .env and fill in your values

# App
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/myapp_dev

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-here-minimum-32-characters
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=another-secret-here
REFRESH_TOKEN_EXPIRES_IN=30d

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET_NAME=myapp-uploads-dev

# Firebase (for push notifications)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Email
SENDGRID_API_KEY=
FROM_EMAIL=noreply@yourapp.com

# Stripe (payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=

# Error Tracking
SENTRY_DSN=https://...@sentry.io/...
```

### Secrets Management:
```
Local development:  .env file (NEVER commit to git)
Staging/Production: AWS Secrets Manager or GitHub Secrets
                    - Never put secrets in Docker images
                    - Never log secrets
                    - Rotate secrets every 90 days
```

---

## 14. PERFORMANCE & SCALING

### How to Handle More Users:

```
Level 1 (0 - 10,000 users):
- Single server is fine
- PostgreSQL + Redis on same or separate server
- CloudFront CDN for static files
- Cost: ~$50-100/month

Level 2 (10,000 - 100,000 users):
- Load balancer in front of 2+ API servers
- Database read replicas (writes go to primary, reads from replica)
- Redis cluster for sessions/cache
- Cost: ~$500-1000/month

Level 3 (100,000+ users):
- Auto-scaling groups (automatically add servers under load)
- Database connection pooling (PgBouncer)
- Separate WebSocket servers
- Message queue for background jobs (SQS, Bull)
- Cost: $2000+/month

Auto-Scaling Setup (AWS ECS):
- Minimum 2 instances (always running, for redundancy)
- Scale up when CPU > 70%
- Scale down when CPU < 30%
- New instance takes 60 seconds to come online
```

### Performance Optimizations:
```
Database:
✅ Index every column you query or sort by
✅ Use pagination (never return all records)
✅ Cache frequent queries in Redis (5 minute TTL)
✅ Use connection pooling

API:
✅ Compress responses (gzip - reduces size by 70%)
✅ Use ETags (client can check if data changed without re-downloading)
✅ Batch API calls (get multiple things in one request)

Frontend/Mobile:
✅ Code splitting (only load JavaScript for current page)
✅ Image lazy loading (don't load images until user scrolls to them)
✅ Cache API responses (show old data while fetching new)
✅ Virtualized lists (only render items visible on screen)
```

---

## 15. COMPLETE CHECKLIST

Use this checklist before calling your app "production ready":

### 🔐 Security
- [ ] HTTPS enforced everywhere
- [ ] Passwords hashed with bcrypt (cost 12)
- [ ] JWT tokens expire after 15 minutes
- [ ] Rate limiting on all endpoints
- [ ] All user input validated and sanitized
- [ ] No secrets in code or git history
- [ ] Security headers (helmet.js)
- [ ] CORS configured correctly
- [ ] SQL injection impossible (parameterized queries)
- [ ] npm audit shows no critical vulnerabilities

### 🗄️ Database
- [ ] All tables have indexes on frequently queried columns
- [ ] Soft deletes implemented (deleted_at column)
- [ ] Automated daily backups configured
- [ ] Backup restoration tested
- [ ] Database connection pooling set up
- [ ] Migrations tracked and can be rolled back

### 🔄 API
- [ ] All endpoints return consistent response format
- [ ] All errors return proper HTTP status codes
- [ ] All endpoints have input validation
- [ ] API versioning implemented (/api/v1/)
- [ ] Rate limiting on all endpoints
- [ ] Authentication required on protected routes
- [ ] Pagination on all list endpoints

### 📱 Mobile
- [ ] App tested on real iOS device
- [ ] App tested on real Android device
- [ ] App tested on low-end device (slow phone)
- [ ] App works on slow 3G connection
- [ ] App handles no internet connection
- [ ] Push notifications working
- [ ] Deep links working
- [ ] App Store screenshots prepared
- [ ] Privacy policy URL in app store listing
- [ ] In-app purchase tested (if applicable)

### 🌐 Web
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Works on mobile browsers
- [ ] Lighthouse score > 90 for all categories
- [ ] Service Worker for offline support
- [ ] PWA installable from browser
- [ ] All images have alt text
- [ ] Page titles and meta descriptions set
- [ ] 404 page exists

### 🚀 Deployment
- [ ] CI/CD pipeline working (auto-deploy on merge to main)
- [ ] Tests run automatically before deploy
- [ ] Staging environment exists and is tested
- [ ] Rollback procedure documented and tested
- [ ] Health check endpoint exists
- [ ] Environment variables documented (.env.example)
- [ ] Docker containers used

### 📊 Monitoring
- [ ] Error tracking (Sentry) set up
- [ ] Mobile crash reporting (Crashlytics) set up
- [ ] Server monitoring set up (CPU, memory, disk)
- [ ] Alerts configured (email/Slack when things go wrong)
- [ ] Log aggregation working
- [ ] Uptime monitoring (check every minute)
- [ ] Status page for users

### 📄 Documentation
- [ ] README with setup instructions
- [ ] API documentation (Swagger/Postman collection)
- [ ] Architecture diagram
- [ ] Runbook for common incidents
- [ ] On-call rotation set up

---

## 🆘 QUICK FIX GUIDE

When something breaks in production, here's what to do:

```
STEP 1: Find the error (< 2 minutes)
- Check Sentry for latest errors
- Check server logs: aws logs tail /myapp/backend
- Check health endpoint: curl https://api.yourapp.com/health

STEP 2: Assess severity
- Is the entire app down? → P0 (fix NOW, wake everyone up)
- Is one feature broken? → P1 (fix within 1 hour)
- Is something slow? → P2 (fix today)

STEP 3: Fix it
Option A: Fix forward (deploy a fix)
  1. Create bugfix/description branch
  2. Write fix
  3. Test locally
  4. Push → CI runs tests
  5. Merge to main → auto deploys

Option B: Roll back (if fix takes too long)
  1. Find last working deployment
  2. aws ecs update-service --task-definition myapp:previous-version
  3. Takes 2-3 minutes to go live

STEP 4: Post-mortem
- Write what happened, why, and how to prevent it
- Add a test that would have caught this bug
```

---

## 📐 ARCHITECTURE SUMMARY

```
┌──────────────────────────────────────────────────────────────┐
│                     YOUR APP STACK                            │
├──────────────────────────────────────────────────────────────┤
│  USERS ACCESS VIA:  Web Browser | iOS App | Android App       │
├──────────────────────────────────────────────────────────────┤
│  CDN LAYER:         CloudFront (serves files fast globally)   │
├──────────────────────────────────────────────────────────────┤
│  LOAD BALANCER:     AWS ALB (spreads traffic across servers)  │
├──────────────────────────────────────────────────────────────┤
│  API SERVERS:       Node.js/Express on AWS ECS (auto-scales)  │
├──────────────────────────────────────────────────────────────┤
│  WEBSOCKETS:        Socket.io server (real-time features)     │
├──────────────────────────────────────────────────────────────┤
│  DATABASE:          PostgreSQL (RDS - managed by AWS)         │
│  CACHE:             Redis (ElastiCache - managed by AWS)      │
│  FILES:             S3 (unlimited storage)                    │
├──────────────────────────────────────────────────────────────┤
│  MONITORING:        Sentry + CloudWatch + Grafana             │
│  NOTIFICATIONS:     Firebase Cloud Messaging (FCM)            │
│  CI/CD:             GitHub Actions → auto deploy              │
└──────────────────────────────────────────────────────────────┘

RULE: If any single component fails, the app keeps running.
      - 2+ API servers: one crashes, the other takes over
      - Database has replica: primary fails, replica promotes
      - Redis fails: app falls back to database (slower but works)
      - One region down: CloudFront serves from another region
```

---

*This architecture is used by apps with millions of users.*  
*Start simple (Level 1), add complexity only when you need it.*  
*The most important thing: monitoring + error tracking from day one.*
