# 🛠️ LynkApp Backend — Remaining Work To Complete
**Generated:** September 14, 2026  
**Based On:** BACKEND-AUDIT-REPORT-SEP2026.md + BACKEND-COMPLETE-GAP-AUDIT-SEP2026.md  
**Overall Backend Completion: ~75%**

---

## 🔴 CRITICAL — App Store Will Reject Without These

### 1. DELETE /users/me — Account Deletion (HIGHEST PRIORITY)
- `DeleteAccountPage.jsx` exists in frontend
- **NO backend endpoint found**
- Apple & Google Play **require** in-app account deletion — this is a hard rejection reason
- **Effort:** ~2 hours
- **Files to edit:** Add to `ConnectHub-Backend/src/routes/users.ts`

### 2. POST /auth/verify-email — Email Verification
- `VerifyEmailPage.jsx` exists in frontend with no backend to call
- Apple & Google both require email verification proof during review
- **Effort:** ~2 hours
- **Files to edit:** `ConnectHub-Backend/src/routes/auth.ts`

### 3. POST /auth/refresh-token — Token Rotation
- `REFRESH_TOKEN_SECRET` is in `.env.example` but no `/auth/refresh` endpoint exists
- Without this, users get hard-logged-out every 7 days (current JWT expiry) — terrible UX
- **Effort:** ~1 hour
- **Files to edit:** `ConnectHub-Backend/src/routes/auth.ts`

### 4. POST /auth/google + POST /auth/apple — OAuth Backend Handlers
- Frontend has full Google/Apple login flows + `AppleSignInButton.jsx`
- **No server-side endpoint** that receives the Firebase ID token and syncs the Firebase UID to the Prisma `users` table
- Without this, social sign-in users won't appear in your database
- **Effort:** ~3 hours
- **Files to edit:** `ConnectHub-Backend/src/routes/auth.ts`

---

## 🟠 HIGH PRIORITY — Core Features Will Silently Fail

### 5. POST /posts/:id/share + POST /posts/:id/save — Post Interactions
- `sharesCount` and `savesCount` are in the Prisma schema, but **no routes exist**
- Share and Save buttons in the feed will silently do nothing
- **Effort:** ~1 hour
- **Files to edit:** `ConnectHub-Backend/src/routes/posts.ts`

### 6. Stripe Webhook — Complete All Event Handlers
- `wallet.ts` route exists but needs to be verified it handles ALL critical events:
  - `payment_intent.succeeded` ✅ (verify)
  - `payment_intent.payment_failed` ❓ (needs check)
  - `account.updated` — Stripe Connect onboarding ❓
  - `payout.paid` / `payout.failed` ❓
  - `customer.subscription.deleted` — Premium cancellation ❓
- **Impact:** Coins and Premium subscriptions may not activate/deactivate correctly
- **Effort:** ~4 hours
- **Files to edit:** `ConnectHub-Backend/src/routes/wallet.ts`

### 7. routes/marketplace.ts — Marketplace Listings Backend
- Only `marketplace-payments.ts` (Stripe checkout) exists
- **No** `/marketplace/listings` route — cannot create, list, search, or buy items via the Node.js backend
- Currently Firestore-only (no server-side fraud prevention, tax calculations, or disputes)
- **Effort:** ~6 hours
- **Files to create:** `ConnectHub-Backend/src/routes/marketplace.ts`

### 8. WebRTC / Video Calls — TURN Server Missing
- `calls.ts` route exists but needs to be **verified it is mounted** in `server.ts`
- **No TURN/STUN server credentials** anywhere in the codebase
- P2P video calls will fail on mobile networks (behind NAT)
- **Effort:** ~2 hours (sign up for Twilio or Metered.ca TURN, add credentials to `.env`)
- **Files to edit:** `ConnectHub-Backend/.env`, `ConnectHub-Backend/src/routes/calls.ts`

---

## 🟡 HIGH PRIORITY — Firebase Cloud Functions (Push Notifications)

### 9. onNewMatch Cloud Function — Dating Match Push
- When a dating match document is created in Firestore, send a push notification to **both** matched users via OneSignal
- Currently there is NO push when users match — they will never know
- **Effort:** ~2 hours
- **File to edit:** `ConnectHub-SPA/functions/index.js`

### 10. onNewMessage Cloud Function — DM Push When App Closed
- DM push notifications currently only work when the app is open (via in-app Firestore listener)
- When the app is closed/backgrounded, **no push is sent**
- **Effort:** ~2 hours
- **File to edit:** `ConnectHub-SPA/functions/index.js`

### 11. onUserReportSubmit Cloud Function — Content Moderation
- When a report document is written to Firestore, send admin FCM alert and auto-flag the reported account/content
- **Effort:** ~1.5 hours
- **File to edit:** `ConnectHub-SPA/functions/index.js`

### 12. Story Expiry Scheduled Function — 24h Auto-Delete
- Stories are created but **never auto-deleted** after 24 hours
- Need a Firebase scheduled function (e.g., runs every hour) to mark/delete expired stories
- **Effort:** ~1 hour
- **File to edit:** `ConnectHub-SPA/functions/index.js`

---

## 🟡 MEDIUM PRIORITY — Feature Gaps

### 13. GET /posts/:postId/likes — Like List Endpoint
- "See who liked" UI exists in frontend but there is no backend endpoint to return the list of users
- **Effort:** ~30 min
- **Files to edit:** `ConnectHub-Backend/src/routes/posts.ts`

### 14. DELETE /posts/:postId/comments/:commentId — Comment Delete
- Users cannot delete their own comments — moderators cannot remove comments
- **Effort:** ~30 min
- **Files to edit:** `ConnectHub-Backend/src/routes/posts.ts`

### 15. GET /streaming/active — Active Streams List
- The "Live" browse page needs a list of currently-active streams from Mux
- No endpoint for this exists
- **Effort:** ~1 hour
- **Files to edit:** `ConnectHub-Backend/src/routes/streaming.ts`

### 16. GET /users/:userId/saved-posts — Saved Posts Endpoint
- The Saved page (`SavedPage.jsx`) has no backend to pull from
- **Effort:** ~30 min
- **Files to edit:** `ConnectHub-Backend/src/routes/users.ts`

### 17. Prisma Migrations on Production PostgreSQL
- Development uses SQLite (`prisma/dev.db`) — production needs PostgreSQL
- Migrations in `prisma/migrations/` have **NOT been run** against the production RDS instance
- `DATABASE_URL=postgresql://lynkadmin:...@lynkapp-db.cq3yg4600cbl.us-east-1.rds.amazonaws.com:5432/lynkapp`
- **Action:** Run `npx prisma migrate deploy` against the production DB
- **Effort:** ~30 min (just running the command once EC2 is configured)

---

## 🟢 LOW PRIORITY — Polish & Monitoring

### 18. Sentry Error Tracking — Initialize in server.ts
- `SENTRY_DSN` is in `.env.example` but the Sentry SDK is **never initialized** in `server.ts`
- Backend errors are invisible without this
- **Effort:** ~30 min
- **Files to edit:** `ConnectHub-Backend/src/server.ts`

### 19. Input Validation Middleware — Wire to All Routes
- `ConnectHub-Shared/src/validation/schemas.ts` exists but is **not imported** in any backend route
- `middleware/validation.ts` exists but **not used** in any route
- All POST/PUT routes should validate input (Zod/Joi)
- **Effort:** ~4 hours across all routes

### 20. BullMQ Background Job Queue
- Long-running tasks (email sending, image processing, payout calculations) run **synchronously** on the request thread
- Needs BullMQ + Redis for async background processing
- **Effort:** ~6 hours

### 21. Creator Payout Trigger (Scheduled)
- No scheduled function exists to trigger weekly creator payouts via Stripe Connect
- **Effort:** ~2 hours
- **File to edit:** `ConnectHub-SPA/functions/index.js`

### 22. Per-User Rate Limiting (Sensitive Endpoints)
- Current rate limiting is IP-based only (100 req / 15 min)
- Dating swipe, coin spend, and message send endpoints need per-user JWT-based rate limiting
- **Effort:** ~2 hours

---

## 📊 Summary Scorecard

| Category | Status | % Done |
|---|---|---|
| Server Setup & Routing | ✅ 36 routes mounted | 100% |
| Auth (login, register, logout, forgot/reset pw) | ✅ Done | 90% |
| Auth (OAuth backend, email verify, refresh token) | ❌ Missing | 30% |
| Posts (CRUD, likes, comments, feed) | ✅ Done | 85% |
| Posts (share, save, like-list, comment delete) | ❌ Missing | 0% |
| Messages (DMs, conversations, Socket.IO) | ✅ Done | 95% |
| Dating (swipe, match, profile) | ✅ Done | 95% |
| Live Streaming (Mux WHIP) | ✅ Substantial | 80% |
| Wallet / Stripe webhook completeness | ⚠️ Needs audit | 60% |
| Marketplace (Firestore only) | ⚠️ No listings route | 40% |
| Push Notifications (Cloud Functions) | ⚠️ Partial | 70% |
| Groups, Events, Friends, Stories | ✅ Routes mounted | 80% |
| Video Calls (TURN server) | ❌ TURN missing | 50% |
| Delete Account (GDPR/App Store) | ❌ Missing | 0% |
| Email Verification | ❌ Missing | 0% |
| Prisma → Production PostgreSQL | ❌ Migrations not run | 10% |
| Middleware & Security | ✅ Done | 95% |
| Sentry / Error Tracking | ❌ Not initialized | 0% |

---

## 🚀 Recommended Sprint Plan

### Sprint 1 — App Store Blockers (Week 1, ~10 hrs)
1. Add `DELETE /users/me` (account deletion)
2. Add `POST /auth/verify-email`
3. Add `POST /auth/refresh-token`
4. Add `POST /auth/google` and `POST /auth/apple` OAuth handlers
5. Add `POST /posts/:id/share` and `POST /posts/:id/save`

### Sprint 2 — Payments & Revenue (Week 2, ~10 hrs)
6. Audit and complete all Stripe webhook event handlers in `wallet.ts`
7. Create `routes/marketplace.ts` for listings, orders, reviews, returns
8. Configure TURN/STUN server credentials for video calls

### Sprint 3 — Cloud Functions & Notifications (Week 3, ~7 hrs)
9. Add `onNewMatch` Cloud Function (dating push notification)
10. Add `onNewMessage` Cloud Function (DM push when app closed)
11. Add `onUserReportSubmit` Cloud Function (admin moderation alert)
12. Add story expiry scheduled Cloud Function

### Sprint 4 — Polish & Production Config (Week 4, ~8 hrs)
13. Run `npx prisma migrate deploy` on production PostgreSQL
14. Initialize Sentry SDK in `server.ts`
15. Add `GET /streaming/active`, `GET /posts/:id/likes`, `DELETE /posts/:id/comments/:id`
16. Wire validation middleware into all routes
17. Add `GET /users/:userId/saved-posts`
