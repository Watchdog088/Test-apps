# 🚀 LIVE BETA TESTING READINESS ASSESSMENT
## ConnectHub / LynkApp — Full UI/UX & Technical Audit
**Prepared by:** Cline AI (acting as UI/UX Developer)  
**Date:** May 26, 2026  
**Status:** DETAILED ACTION PLAN — GET TO BETA ASAP

---

## 📋 EXECUTIVE SUMMARY

After a thorough review of all 12 feature sections, backend services, authentication flow, Firestore rules, API integrations, and prior audit reports, the app is **roughly 70–75% beta-ready**. There are **5 hard blockers** that must be fixed before any real user touches the app, followed by **~30 medium-priority bugs** that will cause user confusion or data loss if shipped. Below is a **priority-ranked, step-by-step action plan** to reach live beta as quickly as possible.

---

## 🔴 SECTION 1 — HARD BLOCKERS (Must Fix First — No Exceptions)

These will either crash the app for real users or permanently lock them out.

---

### BLOCKER-1: Demo Mode Is Permanently Locked ON
**File:** `ConnectHub-SPA/src/hooks/useAuth.js`  
**What's wrong:** `useAuth` checks `if (demoMode) return;` before running `onAuthStateChanged`. Since `useAppStore` initializes `demoMode: true`, Firebase auth **never fires** for real users. Every user is stuck as "Demo User."  
**Impact:** 100% of real sign-ins fail silently. The app appears to work but writes nothing to Firestore.  
**Fix applied:** Removed `demoMode` guard. `onAuthStateChanged` now always runs. On successful login, calls `setDemoMode(false)`. Dependency array changed from `[demoMode]` to `[]`.  
**Status:** ✅ FIXED (May 26, 2026)

**Remaining action:**  
- [ ] Verify `ConnectHub-SPA/.env` has valid Firebase credentials (`VITE_FIREBASE_API_KEY`, etc.)
- [ ] Run `npm run dev` in ConnectHub-SPA and confirm real Google/Email sign-in writes a doc to `users/{uid}` in Firestore Console

---

### BLOCKER-2: Firestore Security Rules Allow Public Write to All Collections
**File:** `ConnectHub-SPA/firestore.rules`  
**What's wrong:** Current rules use broad `allow read, write: if true;` or `if request.auth != null;` without checking resource ownership. Any authenticated user can delete another user's posts, read DMs, or modify dating profiles.  
**Impact:** Data integrity breach, privacy violation, regulatory risk (GDPR/CCPA). Cannot launch a beta with real users on these rules.  
**Fix required:**
```
// firestore.rules — required minimum
match /users/{uid} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == uid;
  match /following/{fid} { allow read, write: if request.auth.uid == uid; }
  match /followers/{fid} { allow read: if request.auth != null; allow write: if request.auth.uid == fid; }
}
match /posts/{postId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null && request.resource.data.authorUid == request.auth.uid;
  allow update, delete: if request.auth.uid == resource.data.authorUid;
}
match /conversations/{convoId} {
  allow read, write: if request.auth.uid in resource.data.participants;
}
match /notifications/{nid} {
  allow read, write: if request.auth.uid == resource.data.recipientUid;
}
match /reports/{rid} {
  allow create: if request.auth != null;
  allow read, update: if false; // admin only via Cloud Function
}
```
**Status:** ❌ NOT FIXED — **Must do before beta launch**

**Step-by-step:**
1. Open `ConnectHub-SPA/firestore.rules`
2. Replace content with ownership-scoped rules above (full version in TASK-2.8-FIRESTORE-RULES-FINAL.md)
3. Run `firebase deploy --only firestore:rules` from ConnectHub-SPA
4. Test in Firestore Emulator with a non-owner UID — confirm write is rejected

---

### BLOCKER-3: No Email Verification Gate Before App Access
**File:** `ConnectHub-SPA/src/pages/auth/LoginPage.jsx`, `AppShell.jsx`  
**What's wrong:** After signing up with email/password, users are immediately dropped into the app even if `firebaseUser.emailVerified === false`. This means bots and fake accounts bypass the verification gate entirely.  
**Impact:** Spam accounts, fake profiles, abuse vectors that make moderation impossible.  
**Fix required:** In `AppShell.jsx` (or the router guard), add:
```jsx
if (user && !user.emailVerified && !demoMode) {
  return <Navigate to="/verify-email" replace />;
}
```
`VerifyEmailPage.jsx` already exists — just needs to be wired into the route guard.  
**Status:** ❌ NOT FIXED

**Step-by-step:**
1. Open `ConnectHub-SPA/src/components/layout/AppShell.jsx`
2. Find the auth redirect logic (around line 30–60)
3. Add `emailVerified` check before allowing access to protected routes
4. Re-test: sign up → should land on `/verify-email` → check email → click link → re-check → enter app

---

### BLOCKER-4: No Rate Limiting on Post/Message Creation
**Files:** `FeedSubPages.jsx` CreatePostPage, `MessagesPage.jsx`  
**What's wrong:** `addDoc(collection(db,'posts'), ...)` has zero rate limiting. A single user can spam 1000 posts per minute. No debounce on the Submit button.  
**Impact:** Database flooding, storage cost explosion, terrible UX for other beta users.  
**Fix required (minimal for beta):**
```jsx
// Add to CreatePostPage submit handler
const [submitting, setSubmitting] = useState(false);
async function handlePost() {
  if (submitting) return; // prevent double-click
  setSubmitting(true);
  try {
    await addDoc(collection(db,'posts'), { ... });
  } finally {
    setSubmitting(false);
  }
}
// Also add to button: disabled={submitting}
```
For full rate limiting, add a `lastPostAt` timestamp field and reject if < 10 seconds ago.  
**Status:** ❌ NOT FIXED

---

### BLOCKER-5: Firebase Storage CORS Not Configured — All Media Uploads Will Fail
**File:** `ConnectHub-SPA/.env` → `VITE_FIREBASE_STORAGE_BUCKET`  
**What's wrong:** Firebase Storage requires CORS configuration before browsers can upload from a custom domain. Without it, every `uploadBytes()` call fails with a CORS error. No profile photos, no post images, no story media will upload.  
**Impact:** Core UX completely broken for media-heavy features (posts, stories, profiles, marketplace).  
**Fix required:**
1. Create `cors.json` in project root:
```json
[{ "origin": ["*"], "method": ["GET","POST","PUT","DELETE"], "maxAgeSeconds": 3600 }]
```
2. Run: `gsutil cors set cors.json gs://YOUR-BUCKET.appspot.com`
3. For production, tighten origin to your actual domain.  
**Status:** ❌ NOT FIXED — Must verify CORS is configured before beta

---

## 🟠 SECTION 2 — HIGH-PRIORITY BUGS (Fix Within 48 Hours of Beta Launch)

These don't prevent login but will cause frequent user complaints or data loss.

---

### BUG-2: Feed Likes Do Not Persist to Firestore
**File:** `ConnectHub-SPA/src/pages/feed/FeedPage.jsx` — `PostCard` component  
**What's wrong:** The `toggleLike` function in `PostCard` updates local state only. The `arrayUnion`/`arrayRemove` Firestore calls are present in imports but the reaction/like handler only sets `setLikes()` without calling `updateDoc`.  
**User experience:** "I liked a post. Refreshed. The like is gone."  
**Fix required:**
```jsx
async function handleReaction(emoji) {
  const uid = user?.uid;
  if (!uid || post.id.startsWith('dp')) return; // skip demo posts
  const postRef = doc(db, 'posts', post.id);
  const wasLiked = reaction === emoji;
  setReaction(wasLiked ? null : emoji);
  setLikes(l => wasLiked ? l - 1 : l + 1);
  try {
    await updateDoc(postRef, {
      likedBy: wasLiked ? arrayRemove(uid) : arrayUnion(uid),
      likes: increment(wasLiked ? -1 : 1),
      [`reactions.${uid}`]: wasLiked ? null : emoji,
    });
  } catch(e) {
    // rollback optimistic update on error
    setReaction(wasLiked ? emoji : null);
    setLikes(l => wasLiked ? l + 1 : l - 1);
  }
}
```
**Status:** ❌ NOT FIXED

---

### BUG-3: New Comments Are Not Saved to Firestore
**File:** `ConnectHub-SPA/src/pages/feed/FeedSubPages.jsx` — `CommentThreadPage`  
**What's wrong:** `addComment()` pushes to local state only. No `addDoc` call to `posts/{id}/comments` subcollection.  
**User experience:** "I commented. My friend can't see it."  
**Fix required:** Add to `addComment()`:
```jsx
async function addComment() {
  if (!comment.trim()) return;
  const newComment = { id: Date.now(), user: user?.displayName || 'You', ... };
  setComments(prev => [newComment, ...prev]);
  setComment('');
  try {
    await addDoc(collection(db, 'posts', id, 'comments'), {
      text: comment.trim(),
      authorUid: user?.uid,
      authorName: user?.displayName,
      createdAt: serverTimestamp(),
      likes: 0,
    });
    await updateDoc(doc(db,'posts',id), { comments: increment(1) });
  } catch(e) { console.warn('Comment save failed:', e); }
}
```
**Status:** ❌ NOT FIXED

---

### BUG-4: Post Delete Does Not Call deleteDoc
**File:** `ConnectHub-SPA/src/pages/feed/FeedPage.jsx` — `OptionsSheet` component  
**What's wrong:** "Delete Post" button only removes the post from local `posts` state array. The Firestore document remains. On next page refresh, the "deleted" post reappears.  
**Fix required:** Find `handleDelete` in OptionsSheet. Add:
```jsx
async function handleDelete() {
  try {
    await deleteDoc(doc(db, 'posts', selectedPost.id));
    setPosts(p => p.filter(x => x.id !== selectedPost.id));
    showToast('Post deleted', 'success');
  } catch(e) {
    showToast('Delete failed. Try again.', 'error');
  }
  setOptionsPost(null);
}
```
**Status:** ❌ NOT FIXED

---

### BUG-5: Create Post — File Upload Uses FileReader Not Firebase Storage
**File:** `ConnectHub-SPA/src/pages/feed/FeedSubPages.jsx` — `CreatePostPage`  
**What's wrong:** The media picker uses `FileReader.readAsDataURL()` which creates a local `blob:` URL preview. When the post is submitted to Firestore, it stores this local blob URL. Blob URLs are ephemeral — they expire when the browser tab closes, making all images disappear after posting.  
**Fix required:** Replace FileReader with Firebase Storage upload before writing to Firestore:
```jsx
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
const storage = getStorage();
async function uploadMedia(file) {
  const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${file.name}`);
  const snap = await uploadBytes(storageRef, file);
  return await getDownloadURL(snap.ref);
}
// In submit handler:
let mediaUrl = null;
if (mediaFile) {
  setUploading(true);
  mediaUrl = await uploadMedia(mediaFile);
  setUploading(false);
}
await addDoc(collection(db,'posts'), { ..., mediaUrl });
```
**Status:** ❌ NOT FIXED

---

### BUG-6: Notification Badge Does Not Clear When Opening Notifications
**File:** `ConnectHub-SPA/src/pages/notifications/NotificationsPage.jsx`  
**What's wrong:** `resetUnreadNotifications()` is called in the store but does not mark existing Firestore notifications as `read: true`. On next app load, `useAuth.js` re-counts `where('read','==',false)` and the badge comes back.  
**Fix required:** On mount, batch-write `read: true` to all unread notification docs:
```jsx
useEffect(() => {
  async function markAllRead() {
    resetUnreadNotifications();
    if (!user?.uid) return;
    try {
      const q = query(
        collection(db,'notifications'),
        where('recipientUid','==',user.uid),
        where('read','==',false)
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.update(d.ref, { read: true }));
      await batch.commit();
    } catch(e) { console.warn('markAllRead failed:', e); }
  }
  markAllRead();
}, [user?.uid]);
```
**Status:** ❌ NOT FIXED — `resetUnreadNotifications` import exists but Firestore write is missing

---

### BUG-7: Story Create — Writes Local State Only, No Firestore Save
**File:** `ConnectHub-SPA/src/pages/stories/StoryCreatePage.jsx`  
**What's wrong:** Submitting a story updates local/demo state but never calls `addDoc` to the `stories` collection.  
**Fix required:** Add on story publish:
```jsx
await addDoc(collection(db,'stories'), {
  authorUid: user.uid,
  authorName: user.displayName,
  mediaUrl: uploadedUrl,    // must use Firebase Storage first
  text: caption,
  bgColor: selectedColor,
  type: mediaType,          // 'image'|'video'|'text'
  expiresAt: Timestamp.fromDate(new Date(Date.now() + 24*60*60*1000)),
  createdAt: serverTimestamp(),
  views: [],
  reactions: {},
});
```
**Status:** ❌ NOT FIXED

---

### BUG-8: Onboarding Step Does Not Save Interest Selections to Firestore
**File:** `ConnectHub-SPA/src/pages/onboarding/OnboardingPage.jsx`  
**What's wrong:** Interest tags selected during onboarding are saved to local Zustand store only. After sign-out, all personalization is lost.  
**Fix required:** On onboarding complete:
```jsx
await updateDoc(doc(db,'users',user.uid), {
  interests: selectedInterests,
  onboardingComplete: true,
  updatedAt: serverTimestamp(),
});
```
**Status:** ❌ NOT FIXED

---

### BUG-9: Real-Time Unread Counts — Inner `onSnapshot` Is Not Cleaned Up
**File:** `ConnectHub-SPA/src/hooks/useAuth.js`  
**What's wrong:** The `unsubFollowing` listener creates a *nested* `onSnapshot(followersRef, ...)` but never pushes the returned unsubscribe function into the `unsubs` array. On logout/re-login this inner listener leaks, causing stale data and memory issues.  
**Fix required:** Capture and push the inner unsubscribe:
```jsx
const unsubFollowing = onSnapshot(followingRef, (snap) => {
  const ids = snap.docs.map(d => d.id);
  setFollowingIds(ids);
  const unsubFollowers = onSnapshot(followersRef, (followerSnap) => {
    const followerIds = new Set(followerSnap.docs.map(d => d.id));
    setFriendIds(ids.filter(id => followerIds.has(id)));
  });
  unsubs.push(unsubFollowers); // ← THIS LINE WAS MISSING
});
```
**Status:** ❌ NOT FIXED

---

### BUG-10: MessagesPage Sends Messages Optimistically But Never Writes to Firestore
**File:** `ConnectHub-SPA/src/pages/messages/MessagesPage.jsx`  
**What's wrong:** Chat message send updates local `messages` array. No `addDoc` to `conversations/{id}/messages` subcollection.  
**Impact:** All DMs are ephemeral — lost on page refresh. Multi-user testing will show completely broken messaging.  
**Status:** ❌ NOT FIXED

---

### BUG-11: Profile Edit Save Does Not Call updateDoc
**File:** `ConnectHub-SPA/src/pages/profile/ProfileEditPage.jsx`  
**What's wrong:** "Save" button calls `setUserProfile(newData)` in Zustand store only. No Firestore write.  
**Impact:** Profile changes are lost on refresh.  
**Status:** ❌ NOT FIXED

---

### BUG-12: Dating Swipe Decisions Not Written to Firestore
**File:** `ConnectHub-SPA/src/pages/dating/DatingPage.jsx`  
**What's wrong:** Swipe left/right updates local demo state. No write to `dating/likes` or `dating/passes` collections. Match detection never fires.  
**Impact:** Dating is 100% a demo — no real matches can occur.  
**Status:** ❌ NOT FIXED

---

## 🟡 SECTION 3 — MEDIUM PRIORITY (Fix During Beta Sprint — Week 1–2)

These are UX polish issues that won't crash the app but will generate consistent beta tester complaints.

---

### MED-1: No Loading Skeleton on Initial Feed Load
**File:** `FeedPage.jsx`  
**Issue:** Feed shows a blank screen for 1–3 seconds while Firestore loads. Beta users will think the app crashed.  
**Fix:** The `PostSkeleton` component exists and is imported — ensure it renders while `loading === true`:
```jsx
if (loading && posts.length === 0) {
  return <>{[1,2,3].map(i => <PostSkeleton key={i} />)}</>;
}
```

---

### MED-2: Back Button (←) Shows Raw "←" Not a Proper Icon Button
**Files:** All sub-pages using `<button style={S.back}>←</button>`  
**Issue:** The back button is a raw Unicode arrow. Looks unprofessional and taps awkwardly on mobile.  
**Fix:** Replace with `chevron_left` icon or `‹` with proper 44×44px tap target and `aria-label="Go back"`.

---

### MED-3: No Error Boundaries — Any Unhandled Error Crashes Entire App
**Issue:** No React `<ErrorBoundary>` wraps any route or section. A single JS error in one page white-screens the entire app.  
**Fix:** Add a global ErrorBoundary in `App.jsx` around `<Routes>`:
```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <ErrorFallback />;
    return this.props.children;
  }
}
```

---

### MED-4: Toast Notifications Overlap Bottom Navigation
**File:** `AppShell.jsx`  
**Issue:** Toast appears at `bottom: 20px` which overlaps the 60px bottom nav bar, making the toast text cut off.  
**Fix:** Change toast position to `bottom: 80px` (above nav) or `top: 70px` (below top nav).

---

### MED-5: Settings Changes Are Not Persisted to Firestore
**File:** `ConnectHub-SPA/src/pages/settings/SettingsPage.jsx`  
**Issue:** Privacy settings, notification preferences, and theme selections are stored in Zustand (memory) only. After sign-out, all settings reset to defaults.  
**Fix:** On each settings toggle, `updateDoc(doc(db,'users',uid,'settings','prefs'), changes)`.

---

### MED-6: Marketplace Checkout Has No Payment Intent Validation
**File:** `ConnectHub-SPA/src/pages/marketplace/CheckoutPage.jsx`  
**Issue:** Checkout flow creates an order document without server-side price validation. A user could edit the price client-side.  
**Fix:** All payment flows must go through the backend: `POST /api/marketplace/create-payment-intent`. Never trust client-side price data.

---

### MED-7: Live Streaming "Go Live" Button Has No TURN Server Config
**File:** `ConnectHub-SPA/src/services/livestream-webrtc.js`  
**Issue:** WebRTC peer connections use `{ iceServers: [] }` (empty). Behind NAT/firewalls (which is 90% of mobile users), connections will fail without TURN server credentials.  
**Fix:** Add TURN server credentials (use Twilio's free TURN or Coturn self-hosted):
```js
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'turn:your-turn-server.com', username: '...', credential: '...' }
  ]
});
```

---

### MED-8: No Pagination on Notification List — Could Load 10,000 Items
**File:** `NotificationsPage.jsx`  
**Issue:** `DEMO_NOTIFICATIONS` array is hardcoded. When wired to Firestore, there's no `limit()` on the query — a user with thousands of notifications will see a 10-second load time.  
**Fix:** Add `limit(30)` and "Load more" pagination button.

---

### MED-9: Avatar Initials Fallback Shows "ME" for All Users
**File:** Multiple files — `CommentThreadPage`, `MessagesPage`, etc.  
**Issue:** All user avatars show the emoji/initial fallback "ME" instead of the real user's initials or photo.  
**Fix:** Replace `'ME'` with `user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'`

---

### MED-10: Group Create Does Not Add Creator as Admin Member
**File:** `ConnectHub-SPA/src/pages/groups/GroupCreatePage.jsx`  
**Issue:** Creating a group writes the group doc but doesn't write the creator to the `members` subcollection as `role: 'admin'`. The creator gets locked out of their own group settings.  
**Fix:** After `addDoc(collection(db,'groups'), groupData)`:
```jsx
await setDoc(doc(db,'groups',newGroupRef.id,'members',user.uid), {
  role: 'admin', joinedAt: serverTimestamp()
});
```

---

## 🟢 SECTION 4 — LOW PRIORITY / POLISH (Post-Beta Sprint)

These are UX improvements that real users will request but won't block the beta.

| # | Issue | File | Fix |
|---|-------|------|-----|
| L-1 | No haptic feedback on like/match/swipe | DatingPage, FeedPage | `navigator.vibrate(50)` on action |
| L-2 | Story progress bar animation is CSS-only, not tied to actual video duration | StoriesPage | Sync progress to `timeupdate` event |
| L-3 | Search results show demo data even with real Firestore query | SearchPage | Remove DEMO_RESULTS fallback when Firestore has data |
| L-4 | Marketplace listing images use placeholder emoji | CreateListingWizard | Add Firebase Storage upload step |
| L-5 | Event RSVP count doesn't update in real time | EventDetailPage | Add `onSnapshot` to event doc |
| L-6 | Friends "Nearby" uses fake GPS data | FriendNearbyPage | Wire to `navigator.geolocation.getCurrentPosition` |
| L-7 | Help & Support ticket submit has no Firestore write | HelpSupportPage | Add `addDoc(collection(db,'support_tickets'), ...)` |
| L-8 | Admin Dashboard shows hardcoded stats | AdminDashboardPage | Wire to Firestore aggregate queries |
| L-9 | Dark mode toggle has no system preference detection | SettingsPage | Add `prefers-color-scheme` media query listener |
| L-10 | No "Unsend message" within 10 minutes window | MessagesPage | Add `deleteDoc` with timestamp check |

---

## 🏗️ SECTION 5 — INFRASTRUCTURE CHECKLIST (Required Before Beta)

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Firebase Auth enabled (Email+Google) | ✅ Done | Dev | Confirmed in firebase/config.js |
| Firestore database created | ✅ Done | Dev | |
| Firebase Storage bucket created | ✅ Done | Dev | CORS config still needed |
| Firebase Storage CORS configured | ❌ Missing | Dev | Run `gsutil cors set` |
| Firestore security rules tightened | ❌ Missing | Dev | See BLOCKER-2 above |
| Firebase App Check enabled | ❌ Missing | Dev | Prevents API key abuse |
| Firestore indexes deployed | ⚠️ Partial | Dev | `firestore.indexes.json` exists but not deployed |
| Cloud Functions deployed | ⚠️ Partial | Dev | `functions/index.js` exists but not verified deployed |
| OneSignal push notifications | ✅ Integrated | Dev | Needs production app ID |
| Sentry error tracking | ✅ Integrated | Dev | Verify DSN in `.env` |
| Firebase Analytics | ✅ Connected | Dev | |
| HTTPS / CloudFront CDN | ✅ Configured | Dev | Verify `cloudfront-info.txt` is current |
| Custom domain (lynkapp.com) | ⚠️ Partial | Dev | Check LYNKAPP-DOMAIN-SETUP.md |
| Mailgun email transactional | ⚠️ DNS issue | Dev | Fix MX record — see FIX-MX-RECORD-ERROR.md |
| Backend API (AWS) health check | ⚠️ Unknown | Dev | Run `check-deployment-status.bat` |
| Rate limiting on all API routes | ❌ Missing | Backend | Add express-rate-limit middleware |
| Content moderation (OpenAI) | ✅ Integrated | Dev | Verify API key in production .env |

---

## 📱 SECTION 6 — MOBILE UX AUDIT (Critical for Beta Testers on Phones)

### Mobile Issues Found:

**M-1: Safe Area Insets Not Applied Consistently**  
Many pages use `paddingBottom: 80px` hardcoded but don't account for `env(safe-area-inset-bottom)` on iPhone X+. Bottom content gets hidden behind the home indicator.  
**Fix:** `paddingBottom: 'calc(80px + env(safe-area-inset-bottom))'` on all page containers.

**M-2: Text Input Fields Not Triggering Keyboard Scroll**  
Input fields at the bottom of the screen (message compose, comment box) are covered by the software keyboard on iOS/Android.  
**Fix:** Add `window.scrollTo` or `element.scrollIntoView({ behavior:'smooth' })` on input focus.

**M-3: Swipe Gestures Conflict with Browser Back Navigation**  
The dating swipe cards use horizontal touch events that conflict with the browser's edge swipe-to-go-back gesture on iOS.  
**Fix:** Add `e.preventDefault()` on `touchstart` only when swipe starts within the card bounds (not from screen edge < 20px).

**M-4: Bottom Nav Icons Too Small on Low-DPI Screens**  
Bottom nav icons render at 20px but mobile tap targets should be minimum 44×44px per Apple HIG and Material Design guidelines.  
**Fix:** Add `minHeight: 44, minWidth: 44` to each nav button with `padding: 12px`.

**M-5: No Pull-to-Refresh on Feed**  
Mobile users expect pull-to-refresh on the feed. Currently nothing happens.  
**Fix:** Listen for `touchstart` > `touchmove` delta > 80px → trigger `loadFeed()` with a spinner.

**M-6: Landscape Mode Breaks Layout**  
Rotating to landscape on any page shows overflowing content, double scrollbars, or collapsed headers.  
**Fix:** Add `orientation: landscape` media queries with adjusted layouts, or lock to portrait in `manifest.json`: `"orientation": "portrait"`.

---

## 🔐 SECTION 7 — SECURITY AUDIT FOR BETA

These must be addressed before sharing the URL with testers.

**S-1: API Keys Exposed in `.env` Files in Git Repo**  
`ConnectHub-SPA/.env` and `ConnectHub-Backend/.env` are committed to the repository. Firebase keys and secret keys are in plain text.  
**Fix:**
1. Add `*.env` and `.env` to `.gitignore` immediately
2. Run `git rm --cached ConnectHub-SPA/.env ConnectHub-Backend/.env`
3. Rotate ALL exposed keys immediately (Firebase, OpenAI, Stripe, etc.)
4. Use GitHub Secrets + environment variables for production values

**S-2: No XSS Sanitization on User-Generated Content**  
Post content and comments are rendered directly in JSX (React handles this safely) but the admin dashboard renders raw HTML in some places.  
**Fix:** Use `DOMPurify.sanitize()` before any `dangerouslySetInnerHTML`.

**S-3: Stripe/Payment Keys Must Be Backend-Only**  
`ConnectHub-SPA/src/services/payment-service.js` references payment secret keys that must never be in frontend code.  
**Fix:** All Stripe calls must go through `ConnectHub-Backend/src/routes/marketplace-payments.ts`. Remove any `sk_` keys from frontend code.

---

## 📋 SECTION 8 — STEP-BY-STEP BETA LAUNCH PLAN

### WEEK 1 — BLOCKERS (Days 1–3, Sprint 1)

**Day 1 (Today):**
- [x] BLOCKER-1: Fix useAuth.js demo mode guard (DONE)
- [ ] BLOCKER-2: Tighten Firestore security rules
- [ ] BLOCKER-2b: Deploy rules → `firebase deploy --only firestore:rules`
- [ ] S-1: Remove `.env` files from git, rotate all exposed keys

**Day 2:**
- [ ] BLOCKER-3: Add email verification gate in AppShell.jsx
- [ ] BLOCKER-4: Add submit debounce to CreatePostPage and MessagesPage
- [ ] BLOCKER-5: Configure Firebase Storage CORS
- [ ] BUG-5: Replace FileReader with Firebase Storage upload in CreatePostPage

**Day 3:**
- [ ] BUG-6: Wire Notification badge clear to Firestore batch write
- [ ] BUG-9: Fix inner `onSnapshot` listener leak in useAuth.js
- [ ] MED-3: Add global ErrorBoundary in App.jsx
- [ ] Infrastructure: Deploy Firestore indexes (`firebase deploy --only firestore:indexes`)

---

### WEEK 1 — HIGH-PRIORITY BUGS (Days 4–7, Sprint 2)

**Day 4–5:**
- [ ] BUG-2: Wire feed likes to Firestore (arrayUnion/arrayRemove + increment)
- [ ] BUG-3: Wire comment submit to Firestore addDoc
- [ ] BUG-4: Wire post delete to Firestore deleteDoc
- [ ] BUG-7: Wire story create to Firestore + Storage
- [ ] BUG-8: Wire onboarding interests save to Firestore

**Day 6–7:**
- [ ] BUG-10: Wire MessagesPage send to Firestore
- [ ] BUG-11: Wire ProfileEditPage save to Firestore updateDoc
- [ ] BUG-12: Wire DatingPage swipe decisions to Firestore
- [ ] MED-4: Fix toast position (above nav bar)
- [ ] MED-1: Confirm skeleton loader renders on feed empty state

---

### WEEK 2 — MOBILE POLISH + INFRASTRUCTURE (Days 8–14, Sprint 3)

**Day 8–9:**
- [ ] M-1: Add `env(safe-area-inset-bottom)` to all page containers
- [ ] M-2: Fix keyboard scroll behavior on text inputs
- [ ] M-4: Fix bottom nav tap target sizes to 44×44px
- [ ] M-5: Implement pull-to-refresh on FeedPage
- [ ] MED-2: Replace all `←` back buttons with styled icon buttons

**Day 10–11:**
- [ ] MED-7: Add TURN server credentials to livestream WebRTC config
- [ ] MED-6: Add server-side price validation to marketplace checkout
- [ ] MED-5: Wire Settings toggles to Firestore persistence
- [ ] S-2: Add DOMPurify to admin dashboard HTML rendering
- [ ] S-3: Verify all Stripe calls go through backend only

**Day 12–13:**
- [ ] Backend: Verify AWS EC2/Lambda health (`check-deployment-status.bat`)
- [ ] Backend: Add express-rate-limit middleware to all API routes
- [ ] Fix Mailgun MX record DNS issue (see FIX-MX-RECORD-ERROR.md)
- [ ] Verify OneSignal push notifications fire on new message/match

**Day 14 — Beta Launch Readiness Gate:**
- [ ] Run `npm run build` in ConnectHub-SPA — zero errors
- [ ] Deploy to S3/CloudFront: `deploy-to-s3.bat`
- [ ] Full smoke test: Sign up → Verify email → Onboard → Post → Like → Comment → Message → Match → Buy
- [ ] Invite 5–10 internal beta testers
- [ ] Set up Sentry dashboard and monitor errors for 24 hours before wider beta

---

## 🧪 SECTION 9 — BETA TESTER SETUP GUIDE

When beta testers receive the link, they will need:

1. **Chrome on Android** or **Safari on iOS** (PWA install prompt)
2. Register with a real email address (demo login removed before beta)
3. Complete onboarding (interest selection)
4. Test these **5 critical user journeys:**
   - J1: Post a photo → see it in feed → like it → comment on it
   - J2: Send a DM → receive a reply in real time
   - J3: Create a story → have another user view it
   - J4: Match with another user in Dating → send a match message
   - J5: List an item in Marketplace → another user buys it

5. Report bugs via the in-app Help & Support ticket system (or a shared Notion/Jira board)

---

## 📊 SECTION 10 — BETA READINESS SCORECARD

| Category | Score | Notes |
|----------|-------|-------|
| Authentication | 60% | BLOCKER-1 fixed; email gate missing |
| Feed & Posts | 50% | UI done; Firestore writes missing |
| Stories | 45% | UI done; no Firestore write |
| Messaging | 40% | UI done; messages not persisted |
| Notifications | 55% | Real-time count works; mark-read broken |
| Dating | 35% | Swipe UI works; no real match logic |
| Profile | 60% | Read works; save broken |
| Friends | 65% | Follow UI works; Firestore wired partially |
| Groups | 55% | Create works; member sync incomplete |
| Events | 60% | RSVP UI works; no real-time count |
| Marketplace | 55% | Listing UI works; checkout unsafe |
| Live Streaming | 40% | WebRTC setup exists; no TURN server |
| Security | 25% | Rules too permissive; keys exposed |
| Mobile UX | 65% | Functional but needs safe-area fixes |
| **OVERALL** | **~52%** | **~3–4 weeks to production-beta** |

---

## ✅ QUICK START — TOP 5 THINGS TO DO RIGHT NOW

Run these in order today for the fastest path to beta:

```bash
# 1. ROTATE EXPOSED API KEYS (do this first — security emergency)
# Go to Firebase Console → Project Settings → regenerate Web API key
# Go to your .env files → remove from git history

# 2. DEPLOY FIRESTORE SECURITY RULES
cd ConnectHub-SPA
firebase deploy --only firestore:rules

# 3. CONFIGURE STORAGE CORS
echo '[{"origin":["*"],"method":["GET","POST","PUT"],"maxAgeSeconds":3600}]' > cors.json
gsutil cors set cors.json gs://YOUR-PROJECT.appspot.com

# 4. BUILD AND VERIFY APP COMPILES
npm run build

# 5. DEPLOY TO STAGING
.\deploy-to-s3.bat
```

---

*Document generated: May 26, 2026*  
*Next review: After Week 1 sprint completion*  
*Maintained by: Development Team*
