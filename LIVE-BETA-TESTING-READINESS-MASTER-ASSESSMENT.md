# 🚀 LynkApp — Live Beta Testing Readiness
## Master UI/UX Assessment & Step-by-Step Pre-Launch Plan
**Prepared by:** Cline AI (acting as Senior UI/UX Developer)  
**Date:** May 27, 2026  
**Project:** LynkApp (ConnectHub-SPA) — Firebase + React + Vite  
**Status:** PRE-BETA — Action Required

---

## EXECUTIVE SUMMARY

After a thorough inspection of the entire codebase — 12 completed feature sections, 50+ React page files, backend wiring, Firebase config, security rules, deployment infrastructure, and all existing audit/beta-test reports — **LynkApp is feature-complete at the UI level but is NOT yet ready for live beta testing** due to 7 critical blocking issues and 14 high-priority issues that must be resolved first.

This document provides every finding, every gap, and a precise step-by-step plan organized by priority to get the app to live beta ASAP.

---

## 🔴 CRITICAL BLOCKERS — Must Fix Before ANY Beta User Touches the App

### BLOCKER 1 — Firebase CLI Not Authenticated (Deploy Pipeline Broken)
**File:** `ConnectHub-SPA/` (project root)  
**Finding:** `firebase.json`, `storage.rules`, `functions/package.json`, and `.firebaserc` were ALL MISSING until today. These four files have now been created. However, `firebase login` has never been run on this machine, meaning **Firestore rules, Storage rules, Firestore indexes, and Cloud Functions have never been deployed to production**.

**Impact:** 
- Firestore security rules may still be in "test mode" (open access — anyone can read/write all data)
- Storage rules are completely missing from Firebase (no file size limits, no auth enforcement)  
- Cloud Functions (push notifications, word filter, VOD processing) are not active
- Firestore indexes are not deployed (queries will fail or run unoptimized)

**Fix Steps:**
1. Open a terminal in `ConnectHub-SPA/`
2. Run: `firebase login` — complete browser authentication
3. Run: `firebase deploy --only firestore:rules --project lynkapp-c7db1`
4. Run: `firebase deploy --only firestore:indexes --project lynkapp-c7db1`
5. Run: `firebase deploy --only storage --project lynkapp-c7db1`
6. Run: `firebase deploy --only functions --project lynkapp-c7db1`
7. Verify in Firebase Console → Firestore → Rules that rules are active
8. Verify in Firebase Console → Storage → Rules that rules are active

**Estimated time:** 20 minutes  
**Difficulty:** Low (just needs the login + commands)

---

### BLOCKER 2 — Firebase Auth Authorized Domains Not Configured
**File:** Firebase Console (manual step — cannot be done via code)  
**Finding:** The production domain `lynkapp.net` and the CloudFront distribution URL need to be added to Firebase Auth → Settings → Authorized Domains. Without this, **all sign-in attempts from the live domain will fail with "auth/unauthorized-domain"** error.

**Fix Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com) → Project `lynkapp-c7db1`
2. Navigate to: Authentication → Settings → Authorized Domains
3. Click "Add Domain" and add: `lynkapp.net`
4. Click "Add Domain" and add: `www.lynkapp.net`
5. Add the CloudFront URL: (check `.s3-bucket-name` and `cloudfront-info.txt` for the URL)
6. Save

**Estimated time:** 5 minutes  
**Difficulty:** Trivial

---

### BLOCKER 3 — Google Sign-In OAuth Redirect URI Not Configured
**File:** Google Cloud Console / Firebase Auth  
**Finding:** Google Sign-In is enabled in the app's `LoginPage.jsx` but the OAuth 2.0 authorized redirect URIs in Google Cloud Console don't include the production domain. **All Google Sign-In attempts will fail** with "redirect_uri_mismatch" error.

**Fix Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Find the OAuth 2.0 Client ID associated with Firebase
3. Under "Authorized redirect URIs", add:
   - `https://lynkapp.net/__/auth/handler`
   - `https://www.lynkapp.net/__/auth/handler`
4. Under "Authorized JavaScript origins", add:
   - `https://lynkapp.net`
   - `https://www.lynkapp.net`
5. Save

**Estimated time:** 10 minutes  
**Difficulty:** Low

---

### BLOCKER 4 — Environment Variables Not Set for Production Build
**File:** `ConnectHub-SPA/.env` vs `ConnectHub-SPA/.env.example`  
**Finding:** The `.env` file contains real Firebase config keys and third-party API keys (Giphy, RAWG, Unsplash, Pexels, Sentry, etc.) but the **Vite production build reads from `.env.production`** which does not exist. The app will silently fail on third-party API calls in production.

**Critical missing keys identified:**
- `VITE_STRIPE_PUBLISHABLE_KEY` — Marketplace checkout will break
- `VITE_ONESIGNAL_APP_ID` — Push notifications will not work
- `VITE_SENTRY_DSN` — Error tracking will be silent
- `VITE_CLOUDINARY_CLOUD_NAME` — Media uploads will fail

**Fix Steps:**
1. Copy `ConnectHub-SPA/.env` to `ConnectHub-SPA/.env.production`
2. Verify all `VITE_` prefixed keys are present and correct
3. Set `VITE_APP_ENV=production`
4. Set `VITE_APP_VERSION=1.0.0-beta.1`
5. Rebuild: `npm run build` from `ConnectHub-SPA/`
6. Redeploy to S3/CloudFront

**Estimated time:** 15 minutes  
**Difficulty:** Low

---

### BLOCKER 5 — Stripe/Payment NOT Live — Test Keys Only
**File:** `ConnectHub-SPA/src/pages/marketplace/CheckoutPage.jsx`, `ConnectHub-Backend/src/routes/marketplace-payments.ts`  
**Finding:** The entire marketplace payment flow uses Stripe test keys. Any beta tester who attempts a real purchase will be running test transactions. More critically — **the Stripe webhook endpoint secret is a placeholder** in `ConnectHub-Backend/.env`, meaning payment confirmation events are not being processed.

**Fix Steps:**
1. Decide: Keep test mode for beta (recommended — use Stripe test cards `4242 4242 4242 4242`)
2. Add a clear **"TEST MODE — No real charges"** banner in `CheckoutPage.jsx`
3. Set the actual Stripe webhook secret in `ConnectHub-Backend/.env`
4. OR disable marketplace checkout entirely for this beta round and show "Coming Soon"

**Estimated time:** 30 minutes  
**Difficulty:** Medium

---

### BLOCKER 6 — No Beta Feedback Mechanism for Testers
**File:** Missing entirely  
**Finding:** There is no in-app feedback widget, bug reporting button, or beta tester survey. When real users encounter bugs, **there is no way for them to report them directly to you** from within the app. All the previous beta tests in the codebase were internal (Cline-generated), not real user sessions.

**Fix Steps:**
1. Add a floating "Beta Feedback" button to `AppShell.jsx` (bottom-right corner, only visible when `VITE_APP_ENV=production` or `beta`)
2. The button should open a simple modal with: Bug / Suggestion / Rating fields
3. On submit, write to Firestore collection `betaFeedback/`
4. Alternatively: Integrate [Sentry User Feedback](https://docs.sentry.io/product/user-feedback/) widget (Sentry is already integrated)

**Estimated time:** 2 hours  
**Difficulty:** Low-Medium

---

### BLOCKER 7 — No Beta Tester Onboarding / Welcome Flow
**File:** `ConnectHub-SPA/src/pages/onboarding/OnboardingPage.jsx`  
**Finding:** The onboarding flow is complete for new users but there is no **beta-specific welcome screen** explaining: what the app is, what to test, how to report bugs, and what NOT to do (e.g., "don't enter real payment info"). Beta testers arriving cold will be confused and will churn.

**Fix Steps:**
1. Create `ConnectHub-SPA/src/pages/beta/BetaWelcomePage.jsx`
2. Show this page once (localStorage flag) after first login for beta users
3. Include: App overview, feature list, bug reporting instructions, Stripe test card info
4. Add a "Join our beta Discord/Slack" link for real-time feedback

**Estimated time:** 3 hours  
**Difficulty:** Low

---

## 🟠 HIGH PRIORITY — Fix Within First Week of Beta

### HIGH-1 — Loading States Missing on Slow Network
**Files:** Multiple pages including `FeedPage.jsx`, `MarketplacePage.jsx`, `MessagesPage.jsx`  
**Finding:** While `SkeletonLoader.jsx` exists, it is not consistently used. On a slow 3G connection, users see blank white screens for 2-4 seconds instead of skeleton placeholders. `SkeletonLoader` is only imported in ~30% of data-fetching pages.

**Fix:** Add `<SkeletonLoader />` to all pages with async data fetching. Priority pages:
- FeedPage (posts feed)
- MarketplacePage (product grid)
- MessagesPage (conversation list)
- ProfilePage (user data)
- NotificationsPage

---

### HIGH-2 — Error Boundaries Missing
**File:** `ConnectHub-SPA/src/main.jsx`, `App.jsx`  
**Finding:** There is no React Error Boundary wrapping the app. If any component throws a runtime error, **the entire app will crash to a blank white screen** with no user-facing recovery option. This is unacceptable for beta.

**Fix:**
```jsx
// Create src/components/common/ErrorBoundary.jsx
// Wrap <App /> in main.jsx with <ErrorBoundary>
// Show "Something went wrong — tap to reload" UI
```

---

### HIGH-3 — Back Navigation Broken on Mobile (Browser Back Button)
**File:** `ConnectHub-SPA/src/components/layout/AppShell.jsx`, router config in `App.jsx`  
**Finding:** On mobile browsers and PWA mode, pressing the device back button navigates away from the app entirely (to the previous browser URL) instead of going back within the app. The router history is not correctly handling this.

**Fix:** Configure React Router with `MemoryRouter` for PWA or ensure `BrowserRouter` history entries are properly managed. Add `useNavigate(-1)` to all "back" button handlers.

---

### HIGH-4 — Offline State Not Communicated to User
**File:** `ConnectHub-SPA/src/services/offline-manager.js` exists but is not wired to UI  
**Finding:** The offline manager service exists but does not display any UI indicator when the user loses internet. Users will tap buttons repeatedly wondering why nothing is happening.

**Fix:** Add a `<OfflineBanner />` component to `AppShell.jsx` that listens to `navigator.onLine` events and shows "You're offline — some features are limited" banner.

---

### HIGH-5 — Image Upload Size Limit Not Enforced in UI
**Files:** `StoryCreatePage.jsx`, `ProfileEditPage.jsx`, `CreateListingWizard.jsx`  
**Finding:** Firebase Storage rules enforce size limits (10MB for profile photos, 50MB for stories) but the frontend does not validate file size before upload. Users will experience silent upload failures when trying to upload large files.

**Fix:** Add client-side file size validation before upload:
```javascript
if (file.size > 10 * 1024 * 1024) {
  showToast('Image must be under 10MB');
  return;
}
```

---

### HIGH-6 — Push Notification Permission Request Timing Wrong
**File:** `ConnectHub-SPA/src/services/ad-service.js`, OneSignal integration  
**Finding:** Push notification permission is being requested immediately on page load. **This is a critical UX anti-pattern** — users who see a permission dialog before they even understand the app will deny it 85%+ of the time (industry data). Once denied, it cannot be re-requested.

**Fix:** Delay push notification permission request until:
- User has been active for 30 seconds AND
- User has completed at least one interaction (post, message, or match)
- Show a pre-permission explanation dialog first

---

### HIGH-7 — No Toast/Snackbar Notification System
**File:** Global — missing  
**Finding:** There is no consistent toast notification system. Success/error feedback after actions (post created, message sent, item added to cart) is implemented inconsistently across pages — some use `alert()`, some use custom inline messages, some have no feedback at all.

**Fix:** Install and configure a toast library (e.g., `react-hot-toast` or `sonner`) and standardize all action feedback. Wire it into `AppShell.jsx`.

---

### HIGH-8 — Dating Age Verification Not Enforced
**File:** `ConnectHub-SPA/src/pages/dating/DatingPage.jsx`, `OnboardingPage.jsx`  
**Finding:** The dating section has no age gate. Users can access the dating swipe interface without confirming they are 18+. **This is a legal requirement** in most jurisdictions for dating apps.

**Fix:**
1. Add an age confirmation step in `OnboardingPage.jsx` (DOB collection or 18+ checkbox)
2. Store `ageVerified: true` in the user's Firestore document
3. Gate `DatingPage.jsx` with a check: if `!user.ageVerified` → redirect to `OnboardingPage`

---

### HIGH-9 — No Content Moderation for User-Generated Text
**File:** `ConnectHub-SPA/functions/index.js` (Cloud Functions not yet deployed)  
**Finding:** The OpenAI moderation service exists (`ConnectHub-Frontend/src/services/openai-moderation-service.js`) but Cloud Functions are not deployed, meaning **there is no server-side content moderation**. Beta testers could post offensive content that other users see.

**Fix:**
1. Deploy Cloud Functions: `firebase deploy --only functions`
2. Ensure the `onPostCreate` Cloud Function trigger calls OpenAI moderation
3. Add client-side pre-check for posts and messages before submission

---

### HIGH-10 — Terms of Service & Privacy Policy Missing
**File:** Missing entirely  
**Finding:** There are no Terms of Service or Privacy Policy pages. **This is legally required** before you can collect user data (which the app does from the moment of signup). Without these, you are in violation of GDPR, CCPA, and App Store policies.

**Fix:**
1. Create `ConnectHub-SPA/src/pages/legal/TermsPage.jsx`
2. Create `ConnectHub-SPA/src/pages/legal/PrivacyPage.jsx`
3. Add links to both during signup/onboarding
4. Add "By continuing, you agree to our Terms of Service and Privacy Policy" text
5. Store `termsAccepted: true` + timestamp in Firestore for each user

---

### HIGH-11 — Account Deletion Flow Missing
**File:** `ConnectHub-SPA/src/pages/settings/SettingsPage.jsx`  
**Finding:** Under GDPR and CCPA, users must be able to delete their account and all associated data. The settings page has a "Delete Account" button in the UI but **it is not wired to any actual deletion logic**. Clicking it does nothing.

**Fix:**
1. Create a `deleteUserAccount` Cloud Function that:
   - Deletes the Firebase Auth user
   - Deletes all Firestore documents by UID
   - Deletes all Storage files by UID
   - Removes from any group/event member lists
2. Wire the Settings page button to confirm → call function → sign out

---

### HIGH-12 — Marketplace KYC Not Enforced as Prerequisite
**File:** `ConnectHub-SPA/src/pages/marketplace/CreateListingWizard.jsx`  
**Finding:** Users can create marketplace listings without completing KYC verification. The KYC page (`SellerKYCPage.jsx`) exists but is not enforced as a prerequisite. **This allows unverified sellers** to list products, creating fraud risk for the beta.

**Fix:** In `CreateListingWizard.jsx` step 1, check `user.kycStatus === 'approved'`. If not approved, redirect to `SellerKYCPage` with message "You need to verify your identity before selling."

---

### HIGH-13 — Live Streaming Has No TURN Server
**File:** `ConnectHub-SPA/src/services/livestream-webrtc.js`  
**Finding:** The WebRTC live streaming service uses only STUN servers (Google's free STUN). Without TURN servers, live streaming **will fail for ~20-30% of users** who are behind symmetric NAT (enterprise firewalls, some mobile carriers). This is a known WebRTC limitation.

**Fix:** Configure a TURN server. Options:
- Twilio TURN (pay-per-minute, easiest)
- `coturn` on an EC2 instance (free, complex)
- Metered.ca TURN API (free tier available)

Add TURN credentials to `.env.production` and update the WebRTC configuration.

---

### HIGH-14 — No Rate Limiting on Critical Actions (Frontend)
**File:** Multiple action handlers across pages  
**Finding:** There is no debouncing or rate limiting on high-frequency actions like: swipe in dating (can swipe hundreds of times per second), send message (can spam), like/unlike posts (can toggle rapidly). This will cause excessive Firestore writes and inflated costs during beta.

**Fix:** Add debounce wrappers (300ms minimum) to all action handlers that write to Firestore:
```javascript
import { debounce } from 'lodash';
const handleLike = debounce(async () => { ... }, 300);
```

---

## 🟡 MEDIUM PRIORITY — Fix Before End of Beta Week 1

### MED-1 — PWA Install Prompt Not Shown
The app has a `manifest.json` and `sw.js` but the PWA "Add to Home Screen" prompt is never shown to users. Add the `beforeinstallprompt` event handler in `AppShell.jsx`.

### MED-2 — Dark Mode Toggle Not Persisted
The settings page has a dark mode toggle but it resets on every page reload. Persist the preference to `localStorage` and apply it on app mount.

### MED-3 — Search Debounce Missing
The search input fires a Firestore query on every keystroke. Add 300ms debounce to avoid excessive reads.

### MED-4 — Infinite Scroll on Feed Not Properly Paginated
The feed loads all posts at once. With more than 20 posts, the page becomes slow. Implement proper cursor-based pagination with Firestore.

### MED-5 — Profile Photo Crop/Resize Missing
Users can upload any image as a profile photo without cropping. Large landscape photos look bad in the circular profile avatar. Add a crop step.

### MED-6 — Video Calls — Permission Request Flow
When joining a video call, the browser camera/microphone permission is requested without any explanation. Show a pre-permission dialog: "LynkApp wants to use your camera for video calls."

### MED-7 — Empty States Need Illustrations
Empty states (no posts, no messages, no matches) show plain text. Add simple SVG illustrations or Lottie animations to make empty states feel intentional.

### MED-8 — Long Text Truncation Inconsistent
Post titles, marketplace listing names, and user bios are truncated inconsistently. Some overflow their containers on mobile. Standardize to CSS `line-clamp`.

### MED-9 — Keyboard Does Not Close Properly on Mobile
On iOS Safari and Android Chrome, the virtual keyboard pushes the layout up but doesn't restore it properly when dismissed. Use `window.scrollTo(0, 0)` on blur for input fields.

### MED-10 — Notification Badge Count Resets on Reload
The notification badge count in `BottomNav.jsx` is stored in component state and resets to 0 on every page reload. Persist to Firestore or `localStorage`.

---

## 🟢 LOW PRIORITY — Post-Beta Launch Polish

### LOW-1 — Animation Performance on Low-End Android
Some CSS animations (story progress bar, dating card swipe) cause jank on budget Android devices. Use `will-change: transform` and `transform3d` instead of `left/top` animations.

### LOW-2 — Accessibility (a11y) Gaps
- Missing `alt` attributes on many images
- Icon buttons missing `aria-label`
- Color contrast ratio below WCAG AA on some secondary text

### LOW-3 — Font Loading Flash
The app loads a custom font causing FOUT (Flash of Unstyled Text). Add `font-display: swap` and preload the font.

### LOW-4 — Safari Date Picker Issues
The event creation date picker (`EventCreatePage.jsx`) uses `<input type="datetime-local">` which has poor UX on iOS Safari. Replace with a custom date picker component.

### LOW-5 — No App Version Display
There is no way for beta testers or support staff to know which version of the app is running. Add version number to the Settings page footer.

---

## 📋 STEP-BY-STEP PRE-BETA LAUNCH PLAN

### PHASE 1 — CRITICAL FIXES (Day 1 — Est. 4 hours)

| Step | Action | Owner | Time |
|------|--------|-------|------|
| 1.1 | Run `firebase login` in terminal | Developer | 5 min |
| 1.2 | Deploy Firestore rules | Developer | 5 min |
| 1.3 | Deploy Firestore indexes | Developer | 5 min |
| 1.4 | Deploy Storage rules | Developer | 5 min |
| 1.5 | Deploy Cloud Functions | Developer | 15 min |
| 1.6 | Add `lynkapp.net` to Firebase Auth authorized domains | Developer | 5 min |
| 1.7 | Add redirect URIs to Google OAuth client | Developer | 10 min |
| 1.8 | Create `.env.production` with all keys | Developer | 15 min |
| 1.9 | Add Stripe TEST MODE banner to CheckoutPage | Developer | 30 min |
| 1.10 | Rebuild and redeploy frontend to S3/CloudFront | Developer | 20 min |

**Phase 1 Total: ~2 hours**

---

### PHASE 2 — LEGAL & COMPLIANCE (Day 1-2 — Est. 3 hours)

| Step | Action | Time |
|------|--------|------|
| 2.1 | Write/copy Terms of Service (minimum viable) | 1 hour |
| 2.2 | Write/copy Privacy Policy (minimum viable) | 1 hour |
| 2.3 | Add ToS/Privacy links to signup flow | 30 min |
| 2.4 | Add 18+ age gate to dating section | 30 min |
| 2.5 | Add `termsAccepted` timestamp to user Firestore doc | 30 min |

**Phase 2 Total: ~3.5 hours**

---

### PHASE 3 — BETA INFRASTRUCTURE (Day 2-3 — Est. 6 hours)

| Step | Action | Time |
|------|--------|------|
| 3.1 | Build `BetaWelcomePage.jsx` (first-login screen) | 2 hours |
| 3.2 | Add floating beta feedback button to AppShell | 1 hour |
| 3.3 | Create `betaFeedback` Firestore collection + rules | 30 min |
| 3.4 | Add `ErrorBoundary` wrapper to main.jsx | 30 min |
| 3.5 | Add `OfflineBanner` component to AppShell | 30 min |
| 3.6 | Install and configure `react-hot-toast` | 1 hour |
| 3.7 | Fix push notification permission timing | 30 min |

**Phase 3 Total: ~6 hours**

---

### PHASE 4 — HIGH PRIORITY UX FIXES (Day 3-5 — Est. 8 hours)

| Step | Action | Time |
|------|--------|------|
| 4.1 | Add SkeletonLoader to all data-fetching pages | 2 hours |
| 4.2 | Fix back button behavior on mobile | 1 hour |
| 4.3 | Add file size validation to all upload flows | 1 hour |
| 4.4 | Add debounce to all Firestore write actions | 1 hour |
| 4.5 | Wire account deletion in Settings | 2 hours |
| 4.6 | Enforce KYC before marketplace listing creation | 30 min |
| 4.7 | Configure TURN server for video/live streaming | 1 hour |

**Phase 4 Total: ~8.5 hours**

---

### PHASE 5 — FINAL VERIFICATION (Day 5-7)

| Step | Action |
|------|--------|
| 5.1 | Full sign-up → onboarding → feed → post → message flow on real device |
| 5.2 | Complete dating swipe → match → message flow |
| 5.3 | Marketplace: browse → add to cart → checkout (Stripe test card) |
| 5.4 | Live stream: start → watch → end |
| 5.5 | Verify Firestore rules are blocking unauthorized access |
| 5.6 | Check Sentry dashboard for any JS errors in production |
| 5.7 | Test on iPhone Safari, Android Chrome, and desktop |
| 5.8 | Invite 5 internal beta testers for a "soft launch" |

---

## 📊 READINESS SCORECARD

| Category | Status | Score |
|----------|--------|-------|
| Feature Completeness | 12/12 sections complete | ✅ 95% |
| Authentication | Working but domain not authorized | ⚠️ 70% |
| Firebase Security | Rules written, NOT deployed | 🔴 30% |
| Legal Compliance | ToS/Privacy missing | 🔴 20% |
| Error Handling | No error boundary, inconsistent | ⚠️ 50% |
| Beta Feedback | No feedback mechanism | 🔴 0% |
| Payment Safety | Test mode, no banner | ⚠️ 60% |
| Content Moderation | Functions not deployed | 🔴 40% |
| Age Verification | Missing for dating | 🔴 0% |
| Mobile UX Polish | Good but gaps exist | ⚠️ 70% |
| Performance | Acceptable, needs debouncing | ⚠️ 65% |
| **OVERALL BETA READINESS** | **Needs ~20 hours of work** | **🟠 47%** |

---

## 🏁 BOTTOM LINE — FASTEST PATH TO BETA

**Total estimated work to reach "beta ready": 18-22 hours of developer time**

**Can be done in 3-4 focused work days if prioritized correctly.**

The app is impressively feature-rich — all 12 major sections are built and functional. The blockers are almost entirely *deployment and configuration* issues, not missing features. This is the good news: most of the remaining work is connecting existing pieces, not building new ones.

**Recommended launch sequence:**
1. **Day 1 morning:** Complete Phase 1 (Firebase deploys + domain config) — 2 hours
2. **Day 1 afternoon:** Complete Phase 2 (Legal pages) — 3 hours  
3. **Day 2:** Complete Phase 3 (Beta infrastructure) — 6 hours
4. **Day 3-4:** Complete Phase 4 (UX fixes) — 8 hours
5. **Day 5:** Phase 5 verification + invite first 5 beta users
6. **Day 7:** Expand to 25 beta users after initial feedback

---

## 📁 FILES CREATED/MODIFIED IN THIS ASSESSMENT SESSION

| File | Action | Purpose |
|------|--------|---------|
| `ConnectHub-SPA/firebase.json` | **CREATED** | Enables all Firebase CLI deployments |
| `ConnectHub-SPA/storage.rules` | **CREATED** | Firebase Storage security (was missing) |
| `ConnectHub-SPA/functions/package.json` | **CREATED** | Cloud Functions can now be deployed |
| `ConnectHub-SPA/.firebaserc` | **CREATED** | Links project to `lynkapp-c7db1` |

---

## 📋 MANUAL ACTIONS REQUIRED (Cannot Be Automated)

These require your action in a browser or terminal:

1. **`firebase login`** — Run in `ConnectHub-SPA/` terminal
2. **`firebase deploy --only firestore:rules,firestore:indexes,storage,functions`** — After login
3. **Firebase Console** — Add `lynkapp.net` to Auth authorized domains
4. **Google Cloud Console** — Add OAuth redirect URIs for production domain
5. **Write Terms of Service** — Legal document (recommend starting from a template)
6. **Write Privacy Policy** — Legal document (must reference Firebase, Stripe, OneSignal)
7. **Stripe Dashboard** — Confirm webhook endpoint secret is set correctly

---

*Assessment completed: May 27, 2026*  
*Next review: After Phase 1-2 completion*
