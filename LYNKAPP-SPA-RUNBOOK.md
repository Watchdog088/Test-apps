# LynkApp SPA — Operations Runbook
> **Version:** 1.0 | **Last Updated:** August 11, 2026
> **Stack:** React 18 + Vite 5 + Firebase 10 (Auth, Firestore, Storage, Functions) + Zustand + Capacitor 6
> **Project Root:** `ConnectHub-SPA/`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Starting the App (Development)](#2-starting-the-app-development)
3. [Starting the App (Production / Firebase Hosting)](#3-starting-the-app-production--firebase-hosting)
4. [Stopping the App](#4-stopping-the-app)
5. [Environment Configuration (.env)](#5-environment-configuration-env)
6. [Deployment — Step-by-Step](#6-deployment--step-by-step)
7. [Section Map — All Pages & Routes](#7-section-map--all-pages--routes)
8. [Common Issues & Fixes](#8-common-issues--fixes)
   - [8.1 Black Screen / Infinite Splash Screen](#81-black-screen--infinite-splash-screen)
   - [8.2 Firebase Not Initializing / Missing .env](#82-firebase-not-initializing--missing-env)
   - [8.3 User Stuck on Login — Demo Mode Broken](#83-user-stuck-on-login--demo-mode-broken)
   - [8.4 White Screen / React Error Boundary Triggered](#84-white-screen--react-error-boundary-triggered)
   - [8.5 Vite Build Fails](#85-vite-build-fails)
   - [8.6 Firebase Deployment Fails](#86-firebase-deployment-fails)
   - [8.7 Port 5173 Already in Use](#87-port-5173-already-in-use)
   - [8.8 node_modules Missing / Dependency Error](#88-node_modules-missing--dependency-error)
9. [Section Failure Map — What Can Break & How to Fix It](#9-section-failure-map--what-can-break--how-to-fix-it)
   - [9.1 Authentication & Onboarding](#91-authentication--onboarding)
   - [9.2 Feed / Home](#92-feed--home)
   - [9.3 Stories](#93-stories)
   - [9.4 Live Streaming](#94-live-streaming)
   - [9.5 Dating](#95-dating)
   - [9.6 Messages / Conversations](#96-messages--conversations)
   - [9.7 Notifications](#97-notifications)
   - [9.8 Profile](#98-profile)
   - [9.9 Friends](#99-friends)
   - [9.10 Groups](#910-groups)
   - [9.11 Events](#911-events)
   - [9.12 Marketplace](#912-marketplace)
   - [9.13 Video Calls / Meetings](#913-video-calls--meetings)
   - [9.14 Music / Podcasts](#914-music--podcasts)
   - [9.15 Gaming Hub](#915-gaming-hub)
   - [9.16 Trending](#916-trending)
   - [9.17 Admin Dashboard](#917-admin-dashboard)
   - [9.18 Settings](#918-settings)
   - [9.19 Wallet / Payments](#919-wallet--payments)
   - [9.20 AR/VR Section](#920-arvr-section)
   - [9.21 Media Hub](#921-media-hub)
   - [9.22 Third-Party API Services](#922-third-party-api-services)
10. [Firebase Firestore Rules Failures](#10-firebase-firestore-rules-failures)
11. [Firestore Indexes Issues](#11-firestore-indexes-issues)
12. [Android Build Issues](#12-android-build-issues)
13. [Quick Reference — Useful Commands](#13-quick-reference--useful-commands)
14. [Escalation & Contacts](#14-escalation--contacts)

---

## 1. Architecture Overview

```
ConnectHub-SPA/
├── src/
│   ├── App.jsx              ← Root router (100+ lazy-loaded routes)
│   ├── main.jsx             ← React 18 entry point
│   ├── firebase/
│   │   └── config.js        ← Firebase init (Auth, Firestore, Storage)
│   ├── hooks/
│   │   └── useAuth.js       ← Auth state + Firestore listeners
│   ├── store/
│   │   └── useAppStore.js   ← Global Zustand state store
│   ├── components/
│   │   ├── layout/          ← AppShell, TopNav, BottomNav
│   │   └── common/          ← SplashScreen, ErrorBoundary, OfflineOverlay
│   ├── pages/               ← All 100+ page components (lazy loaded)
│   └── services/            ← API integrations (Firestore, REST APIs)
├── public/
│   └── sw.js                ← Service Worker (PWA offline support)
├── functions/               ← Firebase Cloud Functions (Node 22)
├── firestore.rules          ← Firestore security rules
├── storage.rules            ← Firebase Storage security rules
├── firestore.indexes.json   ← Composite Firestore indexes
├── firebase.json            ← Firebase project config (hosting, functions, emulators)
├── vite.config.js           ← Vite build config with path aliases
├── .env                     ← Local environment variables (NEVER commit)
└── .env.production          ← Production environment variables
```

**Auth Flow:**
```
Browser Load → SplashScreen → Firebase onAuthStateChanged fires
  ├─ No user     → SmartRoot shows LandingPage
  ├─ Demo mode   → DEMO_USER injected, navigate to /feed
  └─ Real user   → PrivateRoute passes → AppShell → /feed
                   └─ Firestore profile loaded async in background
```

**State Management:**
- `useAppStore` (Zustand) is the single source of truth for: user, userProfile, demoMode, unreadMessages, unreadNotifications, feedPosts, datingState, currentTrack
- `useAuth.js` populates the store via Firebase listeners on login

---

## 2. Starting the App (Development)

### Prerequisites
- Node.js v18+ (v20 recommended)
- npm v9+
- Firebase CLI: `npm install -g firebase-tools`

### Method 1 — Using the batch script (Windows)
```cmd
cd ConnectHub-SPA
start-dev.bat
```

### Method 2 — Manual npm command
```cmd
cd ConnectHub-SPA
npm run dev
```

The app starts at: **http://localhost:5173**

The Vite dev server binds to `0.0.0.0:5173` — it is accessible from any device on the same local network (useful for mobile testing).

### Method 3 — Run with Firebase Emulators (recommended for testing rules)
```cmd
cd ConnectHub-SPA
firebase emulators:start
```
Emulator ports:
| Service    | Port |
|------------|------|
| Firestore  | 8080 |
| Functions  | 5001 |
| Storage    | 9199 |
| Emulator UI | 4000 |

---

## 3. Starting the App (Production / Firebase Hosting)

### Build and deploy in one step (recommended)
```cmd
cd ConnectHub-SPA
DEPLOY-LYNKAPP.bat
```
This runs: `npm run build` → `firebase deploy --only hosting`

### Step-by-step manual deploy
```cmd
cd ConnectHub-SPA

REM Step 1: Login to Firebase (only needed once per machine)
firebase login

REM Step 2: Build production bundle
npm run build

REM Step 3: Deploy hosting only
firebase deploy --only hosting
```

### Deploy everything (hosting + functions + rules + indexes)
```cmd
cd ConnectHub-SPA
MASTER-DEPLOY-ALL.bat
```
This runs all deploy scripts in order:
1. `firebase deploy --only firestore:rules`
2. `firebase deploy --only storage`
3. `firebase deploy --only firestore:indexes`
4. `firebase deploy --only functions`
5. `npm run build`
6. `firebase deploy --only hosting`

### Live production URL
After deployment, the app is live at:
```
https://lynkapp-c7db1.web.app
```
(Replace `lynkapp-c7db1` with your actual Firebase project ID found in `.firebaserc`)

---

## 4. Stopping the App

### Stop Development Server
In the terminal running `npm run dev`, press:
```
Ctrl + C
```
Then type `Y` and press Enter to confirm.

### Stop Firebase Emulators
In the terminal running `firebase emulators:start`, press:
```
Ctrl + C
```

### Stop a specific port (if Ctrl+C did not work)
```cmd
REM Find process using port 5173
netstat -ano | findstr :5173

REM Kill it (replace <PID> with the actual process ID)
taskkill /PID <PID> /F
```

### Stop production (Firebase Hosting)
Production runs on Firebase's global CDN — there is no server process to stop. To take the site offline:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select the project → **Hosting** → **Disable hosting**
   OR deploy a maintenance page over the existing site.

---

## 5. Environment Configuration (.env)

The app will **not work** without a valid `.env` file in `ConnectHub-SPA/`.

### Setup
```cmd
cd ConnectHub-SPA
copy .env.example .env
```
Then open `.env` and fill in all values.

### Required Variables (App will not start without these)

| Variable | Where to Get It | Impact if Missing |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project Settings → Web App | App runs in DEMO MODE only, no real auth |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Console → Project Settings | Auth fails |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Console → Project Settings | Firestore fails |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Console → Project Settings | File uploads fail |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console → Project Settings | Push notifications fail |
| `VITE_FIREBASE_APP_ID` | Firebase Console → Project Settings | Firebase fails |

### Important Optional Variables

| Variable | Service | Impact if Missing |
|---|---|---|
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics | Analytics disabled (non-fatal) |
| `VITE_SENTRY_DSN` | Sentry | Error tracking disabled |
| `VITE_METERED_API_KEY` | Metered TURN server | Video calls fail on mobile data (NAT traversal fails) |
| `VITE_ONESIGNAL_APP_ID` | OneSignal | Push notifications disabled |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe | Marketplace payments disabled |
| `VITE_GIPHY_API_KEY` | Giphy | GIF search in messages broken |
| `VITE_RAWG_API_KEY` | RAWG | Gaming Hub shows no game data |
| `VITE_PEXELS_API_KEY` | Pexels | Photo content missing from Feed/Stories |
| `VITE_UNSPLASH_ACCESS_KEY` | Unsplash | Photo content missing |
| `VITE_NEWSAPI_KEY` | NewsAPI | Trending news section empty |
| `VITE_GUARDIAN_API_KEY` | The Guardian | Trending news missing |
| `VITE_YOUTUBE_API_KEY` | YouTube Data v3 | YouTube videos missing |
| `VITE_DEEPAR_KEY` | DeepAR | AR filters broken |
| `VITE_ADSENSE_PUBLISHER_ID` | Google AdSense | Ads not shown |

### Verifying .env is loaded
In the browser console on `localhost:5173`, type:
```js
import.meta.env.VITE_FIREBASE_PROJECT_ID
```
If it returns `undefined`, your `.env` file is not loading. Restart the Vite dev server after editing `.env`.

---

## 6. Deployment — Step-by-Step

### Full deployment checklist

```cmd
cd ConnectHub-SPA

REM 1. Login to Firebase
firebase login

REM 2. Verify you are on the correct project
firebase use --list

REM 3. Deploy Firestore security rules
firebase deploy --only firestore:rules

REM 4. Deploy Firestore indexes (run before hosting if indexes are new)
firebase deploy --only firestore:indexes

REM 5. Deploy Storage rules
firebase deploy --only storage

REM 6. Deploy Cloud Functions
firebase deploy --only functions

REM 7. Build the React SPA
npm run build

REM 8. Deploy hosting (serves the /dist folder)
firebase deploy --only hosting
```

### Deploy only code changes (most common)
```cmd
cd ConnectHub-SPA
DEPLOY-CHANGES.bat
```
This runs `npm run build` + `firebase deploy --only hosting`.

### Deploy only Firestore rules (after rule changes)
```cmd
cd ConnectHub-SPA
deploy-firestore-rules.bat
```

### Deploy only Cloud Functions
```cmd
cd ConnectHub-SPA
7-deploy-functions-only.bat
```

### Roll back a bad deployment
Firebase Hosting keeps previous versions:
1. Go to Firebase Console → **Hosting** → **Release history**
2. Click the previous good release → **Roll back**

---

## 7. Section Map — All Pages & Routes

| Section | Route | Key File |
|---|---|---|
| Landing | `/` | `pages/landing/LandingPage.jsx` |
| Login | `/login` | `pages/auth/LoginPage.jsx` |
| Sign Up | `/signup` | `pages/auth/SignupPage.jsx` |
| Onboarding | `/onboarding` | `pages/onboarding/OnboardingPage.jsx` |
| Feed / Home | `/feed` | `pages/feed/FeedPage.jsx` |
| Stories | `/stories` | `pages/stories/StoriesPage.jsx` |
| Live Streaming | `/live` | `pages/live/LivePage.jsx` |
| Trending | `/trending` | `pages/trending/TrendingPage.jsx` |
| Dating | `/dating` | `pages/dating/DatingPage.jsx` |
| Messages | `/messages` | `pages/messages/MessagesPage.jsx` |
| Notifications | `/notifications` | `pages/notifications/NotificationsPage.jsx` |
| Profile | `/profile` | `pages/profile/ProfilePage.jsx` |
| Friends | `/friends` | `pages/friends/FriendsPage.jsx` |
| Groups | `/groups` | `pages/groups/GroupsPage.jsx` |
| Events | `/events` | `pages/events/EventsPage.jsx` |
| Marketplace | `/marketplace` | `pages/marketplace/MarketplacePage.jsx` |
| Gaming | `/gaming` | `pages/gaming/GamingPage.jsx` |
| Music | `/music` | `pages/music/MusicPage.jsx` |
| Podcasts | `/music/podcasts` | `pages/music/PodcastPage.jsx` |
| Video Calls | `/videocalls` | `pages/videocalls/VideoCallsPage.jsx` |
| Meetings | `/meetings` | `pages/meetings/MeetingDashboardPage.jsx` |
| Media Hub | `/media` | `pages/mediahub/MediaHubPage.jsx` |
| AR/VR | `/arvr` | `pages/arvr/ARVRPage.jsx` |
| Search | `/search` | `pages/search/SearchPage.jsx` |
| Settings | `/settings` | `pages/settings/SettingsPage.jsx` |
| Saved | `/saved` | `pages/saved/SavedPage.jsx` |
| Business | `/business` | `pages/business/BusinessPage.jsx` |
| Creator | `/creator` | `pages/creator/CreatorPage.jsx` |
| Premium | `/premium` | `pages/premium/PremiumPage.jsx` |
| Wallet | `/wallet` | `pages/wallet/WalletPage.jsx` |
| Help | `/help` | `pages/help/HelpPage.jsx` |
| Admin | `/admin` | `pages/admin/AdminDashboardPage.jsx` |
| Beta Dashboard | `/beta` | `pages/beta/BetaDashboardPage.jsx` |

---

## 8. Common Issues & Fixes

---

### 8.1 Black Screen / Infinite Splash Screen

**Symptom:** The app loads a dark screen or the animated splash screen never goes away.

**Root Causes & Fixes:**

**Cause A — Firebase auth timeout (>15 seconds)**
```
[useAuth] Firebase auth timeout (15s) — treating as unauthenticated
```
- **Fix:** Check your internet connection and Firebase project status at https://status.firebase.google.com
- If Firebase is down, the app will treat the session as unauthenticated after 15 seconds (by design).

**Cause B — Missing or invalid .env variables**
```
[Firebase] Missing VITE_FIREBASE_* environment variables.
```
- **Fix:** Ensure `ConnectHub-SPA/.env` exists and has valid Firebase keys. Restart Vite after editing.
  ```cmd
  cd ConnectHub-SPA
  copy .env.example .env
  REM Edit .env with real values, then:
  npm run dev
  ```

**Cause C — Zustand store has `userProfile === undefined` blocking SmartRoot**
- **Fix (already in code):** SmartRoot does NOT wait for `userProfile` — it redirects to `/feed` immediately once `user` is resolved. If this is still blocked, there may be a stale build. Run:
  ```cmd
  cd ConnectHub-SPA
  npm run build
  ```

**Cause D — Service Worker caching an old broken build**
- **Fix:** In Chrome, open DevTools → Application → Service Workers → click **Unregister**. Then hard refresh (Ctrl+Shift+R).

---

### 8.2 Firebase Not Initializing / Missing .env

**Symptom:** Console warns `[Firebase] Missing VITE_FIREBASE_* environment variables. App will run in DEMO MODE.`

**Fix:**
1. Verify the file exists:
   ```cmd
   dir ConnectHub-SPA\.env
   ```
2. Ensure all 6 required Firebase vars are set (see Section 5).
3. Variables must start with `VITE_` — Vite only exposes variables prefixed with `VITE_` to the browser.
4. Restart the dev server — `.env` changes are **not** hot-reloaded.

---

### 8.3 User Stuck on Login — Demo Mode Broken

**Symptom:** Clicking "Try Demo" on the login page logs in briefly, then the user is bounced back to `/login`.

**Root Cause:** Firebase fires `onAuthStateChanged(null)` immediately when there is no real Firebase session. Without the demoMode guard in `useAuth.js`, this wipes the demo user.

**Fix (already implemented in useAuth.js):** The guard at line ~120 checks `useAppStore.getState().demoMode` before wiping the user. If this regression occurs:
1. Open `ConnectHub-SPA/src/hooks/useAuth.js`
2. Verify the block around line 120 contains:
   ```js
   if (useAppStore.getState().demoMode) {
     setLoading(false);
     return;
   }
   ```
3. If missing, restore from git:
   ```cmd
   git checkout ConnectHub-SPA/src/hooks/useAuth.js
   ```

---

### 8.4 White Screen / React Error Boundary Triggered

**Symptom:** A white or dark screen appears with the message "Something went wrong" and a "🏠 Return to Home" button.

**What this means:** The global `ErrorBoundary` in `App.jsx` caught an unhandled render error.

**Fix:**
1. Click "Return to Home" to reset the boundary.
2. Open browser DevTools → Console. The error will be printed by `[ErrorBoundary]`.
3. In development mode, the raw error text is shown on screen.
4. Common causes:
   - A lazy-loaded chunk failed to download (network issue) → Hard refresh fixes it.
   - A component received `null` from Firestore where an object was expected → Check the specific page's `useEffect` for null guards.
   - A bad deployment where a chunk hash is stale → Redeploy with `npm run build && firebase deploy --only hosting`.

---

### 8.5 Vite Build Fails

**Symptom:** `npm run build` throws errors and does not produce a `/dist` folder.

**Fix — Step 1: Check the error message**
```cmd
cd ConnectHub-SPA
npm run build 2>&1
```

**Fix — Missing dependency:**
```cmd
npm install
npm run build
```

**Fix — Path alias resolution error** (e.g., `Cannot find module '@fb/config'`):
- Check `vite.config.js` — aliases must match:
  ```js
  '@fb': resolve(__dirname, 'src/firebase'),
  '@store': resolve(__dirname, 'src/store'),
  ```
- Verify the referenced file actually exists.

**Fix — Chunk size warning causing build abort:**
- This is a warning, not an error. The `chunkSizeWarningLimit: 1000` in `vite.config.js` already raises the threshold.

**Fix — ESLint errors blocking build:**
```cmd
cd ConnectHub-SPA
npx eslint . --fix
npm run build
```

---

### 8.6 Firebase Deployment Fails

**Symptom:** `firebase deploy` exits with an error.

**Fix — Not logged in:**
```cmd
firebase login
```

**Fix — Wrong project:**
```cmd
firebase use --list
firebase use lynkapp-c7db1
```

**Fix — Functions deploy fails (Node version mismatch):**
- `firebase.json` specifies `"runtime": "nodejs22"`. Ensure your machine has Node 22 for functions, or change runtime to `nodejs20`.

**Fix — Firestore rules deploy fails (syntax error in rules):**
```cmd
firebase firestore:rules:get
```
Check `firestore.rules` for syntax issues before deploying.

**Fix — "Hosting site not found" error:**
```cmd
firebase hosting:sites:list
firebase use --add
```

---

### 8.7 Port 5173 Already in Use

**Symptom:** `Error: listen EADDRINUSE: address already in use :::5173`

**Fix:**
```cmd
REM Find what is using port 5173
netstat -ano | findstr :5173

REM Kill the process (replace 12345 with the actual PID)
taskkill /PID 12345 /F

REM Restart dev server
cd ConnectHub-SPA
npm run dev
```

Alternatively, Vite is configured with `strictPort: false` so it will automatically try port 5174, 5175, etc. if 5173 is busy.

---

### 8.8 node_modules Missing / Dependency Error

**Symptom:** `Cannot find module 'react'` or similar, or `npm run dev` fails immediately.

**Fix — Full reinstall:**
```cmd
cd ConnectHub-SPA
rmdir /s /q node_modules
del package-lock.json
npm install
npm run dev
```

---

## 9. Section Failure Map — What Can Break & How to Fix It

---

### 9.1 Authentication & Onboarding

**Files:** `src/pages/auth/`, `src/hooks/useAuth.js`, `src/firebase/config.js`

| Failure | Symptoms | Fix |
|---|---|---|
| Firebase Auth not initialized | "Missing VITE_FIREBASE_*" warning, users cannot log in | Add Firebase env vars to `.env`, restart Vite |
| Login loop (keeps redirecting to `/login`) | User logs in but bounces back | Check if `VITE_FIREBASE_AUTH_DOMAIN` matches the Firebase project. Also verify Firestore rules allow `users/{uid}` reads. |
| New user stuck at onboarding | After sign-up, user loops between `/onboarding` and `/login` | Ensure the `onboardingComplete` field is being written to Firestore on onboarding completion. Check `PrivateRoute` logic in `App.jsx`. |
| Email verification not sending | User signs up but gets no verification email | Check Firebase Console → Authentication → Email/Password provider is enabled. Check that the Firebase project has Blaze plan (required for email sending at scale). |
| Password reset not working | Forgot password email never arrives | Verify Firebase Auth is on Blaze plan and the sender email domain is configured. |
| Google/Social login fails | "Error 400: redirect_uri_mismatch" | In Google Cloud Console, add your domain to the OAuth authorized redirect URIs. Also add it in Firebase Console → Authentication → Authorized domains. |

---

### 9.2 Feed / Home

**Files:** `src/pages/feed/FeedPage.jsx`, `src/pages/feed/FeedSubPages.jsx`

| Failure | Symptoms | Fix |
|---|---|---|
| Feed is empty | No posts shown, no error | Check Firestore `posts` collection exists and has documents. Check Firestore rules allow reads. Run seed script: `node seed-demo-content.cjs` |
| Feed shows loading forever | Spinner never stops | Open DevTools → Network → check for Firestore `listen` errors (403 = rules deny). Check `VITE_FIREBASE_PROJECT_ID` is correct. |
| Post creation fails | Error on submit, post doesn't appear | Check Firestore rules allow writes to `posts` for authenticated users. Check Storage rules for image uploads. |
| Optimistic post not showing | Post appears to submit but doesn't show in feed | The `pendingPost` in Zustand store may have stale data. Navigate away and back to `/feed` to trigger a re-fetch. |
| Trending filter broken | `/feed?filter=trending` shows nothing | This is a client-side filter — no server needed. Check `FeedPage.jsx` for the trending filter logic. |

---

### 9.3 Stories

**Files:** `src/pages/stories/StoriesPage.jsx`, `src/components/common/StoriesStrip.jsx`

| Failure | Symptoms | Fix |
|---|---|---|
| Stories strip empty | No story circles at top of feed | Check Firestore `stories` collection. Stories expire after 24 hours — if all are expired, strip is empty (expected behavior). |
| Story creation fails | Upload stalls or errors | Check `VITE_FIREBASE_STORAGE_BUCKET` is set. Check Storage rules allow authenticated uploads. |
| Story viewer crashes | Error boundary triggered on `/stories/view/:id` | Ensure the story document still exists in Firestore (may have auto-expired). The viewer should handle missing docs gracefully. |
| Story analytics empty | `/stories/analytics` shows no data | Analytics require the Pexels/Unsplash API keys for demo content. Real analytics come from Firestore view counts. |

---

### 9.4 Live Streaming

**Files:** `src/pages/live/LivePage.jsx`, `src/services/livestream-webrtc.js`

| Failure | Symptoms | Fix |
|---|---|---|
| Cannot start a stream | Live setup fails, no camera access | Browser must have camera/microphone permission. Check site permissions in browser. |
| Stream fails on mobile data | Works on WiFi, fails on 4G | TURN server not configured. Set `VITE_METERED_API_KEY`, `VITE_TURN_USERNAME`, `VITE_TURN_PASSWORD` in `.env`. |
| Live page is blank | `/live` renders empty | Check if `LivePage.jsx` has a Firestore query for active streams — the `streams` collection may be empty. This is expected if no one is live. |
| Viewer count not updating | Stream shows 0 viewers always | This is a Firestore real-time listener on `streams/{streamId}/viewers`. Check Firestore rules allow reads on this subcollection. |
| VOD playback broken | `/live/vod/:id` shows error | Check that the stream was saved correctly. Video files require Storage URLs to be publicly readable. |

---

### 9.5 Dating

**Files:** `src/pages/dating/DatingPage.jsx`, `src/pages/dating/DatingMatchesPage.jsx`

| Failure | Symptoms | Fix |
|---|---|---|
| Swipe deck is empty | No profiles to swipe on | Dating profiles come from Firestore `datingProfiles` collection. Run `seed-demo-content.cjs` to populate test data. |
| Match not recorded | After right-swipe, no match notification | Check Firestore rules for `matches` collection writes. Verify the match detection logic writes to both users' `matches` subcollection. |
| Dating chat broken | `/dating/chat/:matchId` shows error | The `matchId` must exist as a document in `matches` collection. Check routing and Firestore rules. |
| Dating preferences not saving | Changes to preferences don't persist | Check Firestore writes to `users/{uid}/datingPreferences`. Check rules allow authenticated write. |
| Safety center not loading | `/dating/safety` blank | Static page — check `SafetyCenterPage.jsx` for missing imports. |

---

### 9.6 Messages / Conversations

**Files:** `src/pages/messages/MessagesPage.jsx`, `src/pages/messages/ConversationPage.jsx`

| Failure | Symptoms | Fix |
|---|---|---|
| Messages list is empty | No conversations shown | Check Firestore `conversations` collection. Each conversation doc must include the user's UID in the `participants` array. |
| Messages not sending | Send button does nothing / error | Check Firestore rules allow writes to `conversations/{id}/messages`. Check that `db` is initialized (non-null). |
| Unread badge stuck at wrong number | Badge shows wrong count | `useAuth.js` subscribes to conversation unread counts. If the listener is broken, check Firestore rules for `conversations` reads. |
| Group chat creation fails | Error on `/messages/group/create` | Check Firestore rules allow creating new conversation documents. |
| Real-time messages not arriving | Messages only appear after page refresh | Firestore `onSnapshot` listener may have been dropped. Check network connection and Firestore rules. Hard refresh the page. |

---

### 9.7 Notifications

**Files:** `src/pages/notifications/NotificationsPage.jsx`

| Failure | Symptoms | Fix |
|---|---|---|
| No notifications appear | Notifications page is empty | Check Firestore `notifications` collection. Documents need `recipientUid` matching the logged-in user. |
| Notification badge wrong | Badge count doesn't match actual unread | `useAuth.js` queries `notifications` where `read == false`. Check Firestore index exists for this query (see `firestore.indexes.json`). |
| Push notifications not arriving | Native push notifications not delivered | Requires `VITE_ONESIGNAL_APP_ID` to be configured. OneSignal must be set up in the Firebase Console as well. |
| Quiet hours not working | Notifications arrive despite quiet hours | This is client-side logic in `NotificationQuietHoursPage.jsx`. Preferences are stored in Firestore — check they are being read correctly. |

---

### 9.8 Profile

**Files:** `src/pages/profile/ProfilePage.jsx`, `src/pages/profile/ProfileEditPage.jsx`

| Failure | Symptoms | Fix |
|---|---|---|
| Profile page blank | My profile shows nothing | Check Firestore `users/{uid}` document exists. `useAuth.js` creates it on first login. If it's missing, check for write failures in the console. |
| Profile picture not uploading | Upload spinner stalls | Check `VITE_FIREBASE_STORAGE_BUCKET`. Verify Storage rules allow authenticated users to write to `users/{uid}/avatar`. |
| Follower/Following counts wrong | Shows 0 when there should be data | These come from `users/{uid}/followers` and `users/{uid}/following` subcollections. Check Firestore indexes. |
| Profile edit not saving | Changes made in edit page don't persist | Check Firestore rules allow writes to `users/{uid}`. Only the owner should be able to write their own profile. |
| Verified badge not showing | User should be verified but badge is missing | Check `isVerified: true` exists in the Firestore user document. Admin must set this via `/admin/verification`. |

---

### 9.9 Friends

**Files:** `src/pages/friends/FriendsPage.jsx`, `src/services/friends-firestore-service.js`

| Failure | Symptoms | Fix |
|---|---|---|
| Friends list empty | No friends shown despite having some | Friends are computed as mutual follows (follow each other). Check both `users/{uid}/following` and `users/{uid}/followers` are populated. |
| Friend request not sending | Follow button does nothing | Check Firestore rules allow writes to `users/{targetUid}/followers` and `users/{myUid}/following`. |
| Nearby friends not showing | `/friends/nearby` shows no one | Requires Geolocation API permission in browser. Also requires users to have shared their location in Firestore. |
| Birthday list empty | `/friends/birthdays` shows nothing | Friends must have a `birthday` field in their Firestore profile document. |

---

### 9.10 Groups

**Files:** `src/pages/groups/GroupsPage.jsx`, `src/services/groups-firestore-service.js`

| Failure | Symptoms | Fix |
|---|---|---|
| Groups list empty | No groups shown | Check Firestore `groups` collection. Run `seed-demo-content.cjs` to populate demo groups. |
| Cannot create a group | Error on `/groups/create` | Check Firestore rules allow authenticated users to create `groups` documents. |
| Cannot join a group | Join button fails | Check group's `members` subcollection write rules. Also verify the group exists in Firestore. |
| Group invite link broken | `/groups/join/:token` shows 404-style error | The token must match a group document's `inviteToken` field. Check the group creation logic sets this field. |
| Group chat not loading | Group detail page has no messages | Check Firestore rules for `groups/{id}/messages` subcollection reads. |

---

### 9.11 Events

**Files:** `src/pages/events/EventsPage.jsx`, `src/services/events-firestore-service.js`

| Failure | Symptoms | Fix |
|---|---|---|
| Events list empty | No events shown | Check Firestore `events` collection. Run `seed-demo-content.cjs` for test data. |
| Cannot create an event | Error on `/events/create` | Check Firestore rules allow authenticated users to create `events` documents. |
| Check-in not working | `/events/:id/checkin` gives error | Event check-in writes to `events/{id}/attendees/{uid}`. Check Firestore rules. |
| Event RSVP not saving | Attending status doesn't persist | Same as check-in — attendees subcollection write rules. |

---

### 9.12 Marketplace

**Files:** `src/pages/marketplace/MarketplacePage.jsx`, `src/services/marketplace-firestore-service.js`, `src/services/marketplace-backend-service.js`

| Failure | Symptoms | Fix |
|---|---|---|
| Listings not showing | Marketplace page is empty | Check Firestore `listings` collection. Check Firestore rules allow reads. |
| Cannot create a listing | Create Listing Wizard errors | Check Firestore write rules for `listings`. Also check Storage rules for listing images. |
| Checkout fails | Payment processing error | Check `VITE_STRIPE_PUBLISHABLE_KEY` is set. Stripe must be in TEST mode for beta (`pk_test_...`). |
| KYC verification stuck | Seller KYC page shows error | KYC goes through the backend API. Check that the ConnectHub-Backend is running and reachable. |
| Order tracking broken | Order status not updating | Orders are in Firestore `orders` collection. Check real-time listener and Firestore rules for buyer/seller reads. |
| Map view not loading | Map modal shows blank | Requires the Leaflet map service (`src/services/map-service.js`). Check network access to tile servers. No API key required (OpenStreetMap is free). |

---

### 9.13 Video Calls / Meetings

**Files:** `src/pages/videocalls/VideoCallsPage.jsx`, `src/pages/meetings/MeetingRoomPage.jsx`

| Failure | Symptoms | Fix |
|---|---|---|
| Video call fails on mobile data | Works on WiFi, not on LTE | TURN server required. Set `VITE_METERED_API_KEY`, `VITE_TURN_USERNAME`, `VITE_TURN_PASSWORD`. |
| Camera/mic not detected | Black video frame, no audio | Check browser permissions for the site. HTTPS is required for camera access in production. |
| Meeting room link not working | `/meeting/:roomId/room` shows error | The `roomId` must match a document in Firestore `meetings` collection. Check the meeting creation flow. |
| Call history not showing | `/videocalls/history` is empty | Call records must be saved to Firestore on call end. Check the WebRTC service teardown logic. |

---

### 9.14 Music / Podcasts

**Files:** `src/pages/music/MusicPage.jsx`, `src/services/podcast-service.js`

| Failure | Symptoms | Fix |
|---|---|---|
| Music not playing | Play button does nothing | Audio playback uses Deezer/Radio Browser APIs. Check `VITE_*` keys for audio services. Also check browser autoplay policies — user gesture is required. |
| Global music player not persisting | Music stops when navigating | The global player state is in Zustand (`currentTrack`, `isPlaying`). Check `AppShell.jsx` for the persistent audio element. |
| Podcast list empty | No podcasts shown | Podcasts come from `src/services/podcast-service.js` which calls a public podcast index API. Check network access. |
| Podcast Studio not working | `/music/podcasts/studio` shows error | This is a UI-only section — no third-party API required for basic recording (uses browser MediaRecorder API). Check browser permissions for microphone. |

---

### 9.15 Gaming Hub

**Files:** `src/pages/gaming/GamingPage.jsx`, `src/services/rawg-service.js`

| Failure | Symptoms | Fix |
|---|---|---|
| Game list empty | No games in the Hub | Requires `VITE_RAWG_API_KEY`. Get a free key at https://rawg.io/apidocs |
| Game detail not loading | `/gaming/game/:id` shows error | The RAWG API must be reachable. Check network and API key quota (free tier: 20,000 req/month). |
| Leaderboard empty | No leaderboard data | Leaderboard data is in Firestore `leaderboards` collection. Check if seeded. |
| Tournaments not loading | Tournament page blank | Tournament data is in Firestore `tournaments` collection. |

---

### 9.16 Trending

**Files:** `src/pages/trending/TrendingPage.jsx`, `src/services/hackernews-service.js`, `src/services/guardian-service.js`

| Failure | Symptoms | Fix |
|---|---|---|
| Trending page blank | Nothing shown in Trending | Multiple APIs feed this section. Check which fail in DevTools Network tab. |
| News feed empty | No news articles | Requires `VITE_NEWSAPI_KEY` and/or `VITE_GUARDIAN_API_KEY`. NewsAPI free tier: 100 req/day. |
| HackerNews not loading | Tech section empty | HackerNews API is free and requires no key. Check network connectivity to `https://hacker-news.firebaseio.com`. |
| Crypto prices not showing | No crypto data | CoinGecko API is free and keyless. Check network access. |

---

### 9.17 Admin Dashboard

**Files:** `src/pages/admin/AdminDashboardPage.jsx`, `src/pages/admin/AdminSubPages.jsx`
**Guard:** `AdminGuard` in `src/pages/marketplace/MarketplaceExtensions.jsx`

| Failure | Symptoms | Fix |
|---|---|---|
| "Access Denied" on `/admin` | Non-admin user sees this (expected) OR admin cannot access | Admin status is stored as `isAdmin: true` or `role: 'admin'` in Firestore user document. Run `node seed-ceo-admin.cjs` to set admin role, or set manually in Firestore Console. |
| Admin cannot set | Running seed script fails | Check `serviceAccountKey.json` exists in `ConnectHub-SPA/`. Run `node fix-service-key.js` first. |
| Admin analytics blank | `/admin/analytics` shows no data | Analytics queries Firestore aggregations. Ensure Firestore has data and rules allow admin reads. |
| User management broken | Cannot promote/demote users | This requires Cloud Functions (`functions/set-admin-role.js`). Deploy functions: `firebase deploy --only functions`. |
| Beta feedback empty | `/admin/beta-feedback` shows nothing | Feedback is stored in Firestore `betaFeedback` collection (written by `BetaFeedbackModal.jsx`). |

---

### 9.18 Settings

**Files:** `src/pages/settings/SettingsPage.jsx`, `src/pages/settings/SettingsSubPages.jsx`

| Failure | Symptoms | Fix |
|---|---|---|
| Settings not saving | Changed setting reverts on refresh | Settings are persisted to Firestore `users/{uid}/settings`. Check write rules and that the save function calls `setDoc/updateDoc`. |
| Delete account fails | Error on `/settings/delete-account` | Account deletion calls Firebase Auth `deleteUser()` + Firestore cleanup. This requires the user to have re-authenticated recently. Prompt for re-auth before deletion. |
| Change password fails | Error after entering new password | Firebase requires the user to have signed in recently. Prompt re-authentication. |
| Push notifications not toggling | Toggle doesn't do anything | Requires `VITE_ONESIGNAL_APP_ID`. Check OneSignal SDK is loaded. |
| Blocked users list empty | No users shown even after blocking | Blocked users are stored in Firestore `users/{uid}/blocked`. Check Firestore rules allow reads on this subcollection. |

---

### 9.19 Wallet / Payments

**Files:** `src/pages/wallet/WalletPage.jsx`

| Failure | Symptoms | Fix |
|---|---|---|
| Wallet balance wrong | Balance doesn't match transactions | Wallet balance is in Firestore `users/{uid}/wallet`. Check if transactions are being properly credited/debited. |
| Payment method add fails | Card entry error | Stripe integration requires `VITE_STRIPE_PUBLISHABLE_KEY`. Use test card `4242 4242 4242 4242` in test mode. |
| Withdrawal fails | Payout button errors | Payouts require Stripe Connect configuration on the backend (ConnectHub-Backend). |

---

### 9.20 AR/VR Section

**Files:** `src/pages/arvr/ARVRPage.jsx`

| Failure | Symptoms | Fix |
|---|---|---|
| AR filters not loading | Camera shows but no filters overlay | Requires `VITE_DEEPAR_KEY`. Get a key at https://developer.deepar.ai. Free tier available. |
| Camera not accessible | Black screen on AR page | Check browser permissions for camera. HTTPS is required in production. |
| VR viewer not working | `/arvr/vr/:id` shows blank | VR viewer uses WebXR API — only supported in compatible browsers (Chrome, Edge). Check if the device supports WebXR. |

---

### 9.21 Media Hub

**Files:** `src/pages/mediahub/MediaHubPage.jsx`

| Failure | Symptoms | Fix |
|---|---|---|
| Media uploads failing | Upload progress stalls or errors | Check `VITE_FIREBASE_STORAGE_BUCKET`. Check Storage rules allow authenticated uploads to `media/{uid}/`. |
| Video player not working | `/video/:id` shows error | Video URLs must be Firebase Storage download URLs or external CDN links. Check the `videoUrl` field in Firestore. |
| Photo gallery empty | No photos in gallery | Photos are stored in Firestore `media` collection with `type: 'photo'`. Check collection and rules. |

---

### 9.22 Third-Party API Services

| Service | Files | Failure Signs | Fix |
|---|---|---|---|
| Giphy | `services/giphy-service.js` | GIF search returns nothing | Add `VITE_GIPHY_API_KEY` |
| Unsplash | `services/unsplash-service.js` | No photos in picker | Add `VITE_UNSPLASH_ACCESS_KEY` |
| Pexels | `services/pexels-service.js` | No stock photos/video | Add `VITE_PEXELS_API_KEY` |
| RAWG | `services/rawg-service.js` | Gaming Hub empty | Add `VITE_RAWG_API_KEY` |
| Open-Meteo | `services/weather-service.js` | Weather widget broken | Free, no key needed — check network |
| IP-API | `services/geolocation-service.js` | Location features broken | Free, no key needed — check network |
| DiceBear | `services/avatar-service.js` | Default avatars broken | Free CDN — check network |
| CoinGecko | `services/crypto-service.js` | Crypto section empty | Free, no key — check network. Rate limit: 30 req/min |
| Deezer | `services/deezer-service.js` | Music tracks not loading | Deezer API is free (no key). Check CORS — may need proxy in production |
| Reddit | `services/reddit-service.js` | Reddit posts not loading | Reddit public API — check network and rate limits |
| YouTube | `services/youtube-data-service.js` | YouTube videos missing | Add `VITE_YOUTUBE_API_KEY` |

**General API failure pattern:**
1. Open DevTools → Network tab
2. Filter by XHR/Fetch
3. Look for failed requests (red)
4. Read the response status:
   - `401` / `403` = Invalid or missing API key
   - `429` = Rate limit exceeded — wait or upgrade plan
   - `CORS error` = API not allowed from browser — needs backend proxy
   - `503` / `504` = API is down — check provider status page

---

## 10. Firebase Firestore Rules Failures

**Symptom:** Console shows `FirebaseError: [code=permission-denied]` or `Missing or insufficient permissions`.

**Check current rules:**
```cmd
cd ConnectHub-SPA
cat firestore.rules
```

**Deploy updated rules:**
```cmd
firebase deploy --only firestore:rules
```

**Common rule issues:**

| Issue | Rule Cause | Fix |
|---|---|---|
| Cannot read own profile | `users/{uid}` read rule too strict | Ensure rule allows `request.auth.uid == uid` |
| Cannot write posts | `posts` write rule missing | Add `allow create: if request.auth != null;` |
| Admin cannot access all docs | Admin rule not set | Add `allow read, write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;` |
| Unauthenticated user sees data | Rules too permissive | Add `if request.auth != null;` to all read rules |

**Test rules without deploying:**
Use Firebase Emulator or the Firebase Console → Firestore → Rules → Rules Playground.

---

## 11. Firestore Indexes Issues

**Symptom:** `FirebaseError: The query requires an index.` followed by a link.

**Quick fix:**
Click the link in the error message — it opens Firebase Console with the index pre-filled. Click **Create Index**.

**Deploy all indexes from file:**
```cmd
cd ConnectHub-SPA
firebase deploy --only firestore:indexes
```

**Common indexes needed:**

| Collection | Fields Indexed | Reason |
|---|---|---|
| `notifications` | `recipientUid` ASC, `read` ASC | Unread notifications query in `useAuth.js` |
| `conversations` | `participants` ARRAY_CONTAINS, `updatedAt` DESC | Messages list sorted by recent |
| `posts` | `authorUid` ASC, `createdAt` DESC | Profile posts by user |
| `events` | `startDate` ASC, `isPublic` ASC | Upcoming public events |
| `listings` | `category` ASC, `createdAt` DESC | Marketplace by category |

If `firestore.indexes.json` is already complete, deploying it handles all indexes.

---

## 12. Android Build Issues

**Files:** `android/`, `capacitor.config.json`, `android-build.bat`

**Symptom:** Android build fails or APK crashes.

**Fix — Sync web build to Android:**
```cmd
cd ConnectHub-SPA
npm run build
npx cap sync android
```

**Fix — Open in Android Studio for debugging:**
```cmd
cd ConnectHub-SPA
npx cap open android
```

**Fix — Gradle build errors:**
```cmd
cd ConnectHub-SPA/android
./gradlew clean
./gradlew assembleDebug
```

**Fix — google-services.json missing:**
- Download from Firebase Console → Project Settings → Android App → `google-services.json`
- Place at `ConnectHub-SPA/android/app/google-services.json`

**Fix — Gradle wrapper version mismatch:**
```cmd
cd ConnectHub-SPA/android
cat gradle/wrapper/gradle-wrapper.properties
```
Ensure the Gradle version in that file is compatible with your Android Gradle Plugin version.

**Fix — App crashes immediately on Android:**
- Check `capacitor.config.json` — `webDir` must be `"dist"` and the dist folder must exist.
- Enable USB debugging on device, run: `adb logcat | findstr lynkapp`

---

## 13. Quick Reference — Useful Commands

```cmd
REM ── Development ─────────────────────────────────────────────────────
cd ConnectHub-SPA && npm run dev                          # Start dev server (port 5173)
cd ConnectHub-SPA && firebase emulators:start             # Start Firebase emulators

REM ── Build ────────────────────────────────────────────────────────────
cd ConnectHub-SPA && npm run build                        # Build production bundle to /dist

REM ── Deploy ───────────────────────────────────────────────────────────
cd ConnectHub-SPA && firebase deploy --only hosting       # Deploy hosting only
cd ConnectHub-SPA && firebase deploy --only firestore:rules  # Deploy Firestore rules
cd ConnectHub-SPA && firebase deploy --only firestore:indexes # Deploy indexes
cd ConnectHub-SPA && firebase deploy --only functions     # Deploy Cloud Functions
cd ConnectHub-SPA && firebase deploy                      # Deploy everything

REM ── Firebase Auth ────────────────────────────────────────────────────
firebase login                                            # Login to Firebase CLI
firebase use lynkapp-c7db1                                # Switch to the LynkApp project
firebase logout                                           # Logout

REM ── Admin Setup ──────────────────────────────────────────────────────
cd ConnectHub-SPA && node seed-ceo-admin.cjs              # Create CEO/admin account
cd ConnectHub-SPA && node seed-demo-content.cjs           # Seed demo posts/profiles/events

REM ── Android ──────────────────────────────────────────────────────────
cd ConnectHub-SPA && npm run build:android                # Build + sync to Android
cd ConnectHub-SPA && npx cap open android                 # Open Android Studio

REM ── Diagnostics ──────────────────────────────────────────────────────
cd ConnectHub-SPA && npm run lint                         # Run ESLint
netstat -ano | findstr :5173                              # Check if port 5173 is in use

REM ── Git ──────────────────────────────────────────────────────────────
cd /d c:\Users\Jnewball\Test-apps\Test-apps
SAVE-TO-GITHUB.bat                                        # Save and push all changes to GitHub
```

---

## 14. Escalation & Contacts

| System | Where to Check | Admin |
|---|---|---|
| Firebase Console | https://console.firebase.google.com | Project Owner |
| Firebase Status | https://status.firebase.google.com | N/A |
| Sentry Error Dashboard | https://sentry.io | Developer |
| Stripe Dashboard | https://dashboard.stripe.com | Business Owner |
| OneSignal Dashboard | https://onesignal.com | Developer |
| GitHub Repository | https://github.com/Watchdog088/Test-apps | Developer |
| Google AdSense | https://adsense.google.com | Business Owner |

### Emergency Procedures

**App is down in production:**
1. Check Firebase Status page first — if Firebase is down, wait for recovery.
2. Roll back to previous release: Firebase Console → Hosting → Release History → Roll back.
3. Check Sentry for error spike that matches the production push time.
4. If a bad deployment, redeploy the previous known-good build from git:
   ```cmd
   git revert HEAD
   cd ConnectHub-SPA
   npm run build
   firebase deploy --only hosting
   ```

**Security breach / data leak suspected:**
1. Immediately tighten Firestore rules: `firebase deploy --only firestore:rules`
2. Revoke all API keys in Firebase Console → Project Settings → Service Accounts.
3. Disable compromised provider in Firebase Console → Authentication.
4. Review Firebase Console → Firestore → Usage for unusual read/write spikes.

**User account locked out:**
1. Go to Firebase Console → Authentication → Users.
2. Search by email.
3. Click the user → **Reset password** or **Disable/Enable** account.

---

*This runbook was generated based on source analysis of the LynkApp SPA codebase (`ConnectHub-SPA/`) as of August 11, 2026.*
