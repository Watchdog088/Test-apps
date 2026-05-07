# 🧪 ConnectHub SPA — Full Beta Tester UX/UI Report
**Date:** May 6, 2026  
**Tester Role:** Senior UI/UX Beta Tester  
**Files Reviewed:** FeedPage, DatingPage, MessagesPage, ProfilePage, BottomNav (SideNav), TopNav, AppShell, LoginPage, App.jsx, global.css, useAppStore  
**Method:** Deep Code-Review Beta Test (source-level inspection of all interaction logic, state management, layout, navigation, and data flows)

---

## 🔴 CRITICAL BUGS (App-Breaking / Misleading to Users)

---

### 🐛 BUG-01 — "Sign Out" button in More Drawer DOESN'T sign out
**Location:** `AppShell.jsx` → `MoreDrawer` component, bottom button  
**Code:** `onClick={() => { onClose(); navigate('/menu'); }}`  
**Problem:** The button is labeled "🚪 Sign Out / Full Menu →" but actually just navigates to `/menu`. A user who taps "Sign Out" expecting to log out will instead land on the Menu page. Their account stays logged in. This is a **critical security and trust issue** — users will think they signed out but didn't.  
**Fix:** The button should call Firebase `signOut()` and redirect to `/login`, exactly like the TopNav dropdown does. OR rename it to "Full Menu →" and add a separate red Sign Out button.

---

### 🐛 BUG-02 — "Following" and "Friends" feed tabs always show empty
**Location:** `FeedPage.jsx` → `filteredPosts` logic; `useAppStore.js`  
**Problem:** `followingIds: []` and `friendIds: []` default to empty arrays in the global store. There is **no code anywhere** that loads these arrays from Firestore when the user logs in. Every user will always see empty states on the "Following" and "Friends" tabs, even if they have dozens of connections. The empty state says "Follow people to see their posts" — which adds to the confusion since they may have followed people.  
**Fix:** Add a `useEffect` in a root-level component or `useAuth` hook that queries Firestore for the current user's `following` and `followers` subcollections and dispatches `setFollowingIds()` / `setFriendIds()`.

---

### 🐛 BUG-03 — Comment button navigates to /feed but no comment UI opens
**Location:** `FeedPage.jsx` line 285  
**Code:** `onComment={(p) => navigate('/feed', { state: { commentPost: p.id } })}`  
**Problem:** Tapping the 💬 comment button does nothing visible. It navigates to `/feed` (same page), passing state `{ commentPost: p.id }`. But there is **no component in FeedPage** that reads this router state and opens a comment sheet or modal. Users tap the button and nothing happens — the page just re-renders in place.  
**Fix:** Add a comment bottom-sheet component to FeedPage that checks `useLocation().state?.commentPost` and opens when a post ID is present.

---

### 🐛 BUG-04 — Dating card swipe broken on mobile (no touch tracking)
**Location:** `DatingPage.jsx` lines 107-108  
**Problem:** `onTouchStart` sets `dragging: true` but there is **no `onTouchMove` handler**. On mobile devices, dragging the card left or right does nothing because `dragX` never changes. The swipe animation and pass/like logic only works with a mouse (desktop). On phones — the primary target device — swiping is completely broken.  
**Fix:** Add `onTouchMove={(e) => { if (dragging) setDragX(e.touches[0].clientX - startX); }}` and track `startX` in `onTouchStart`.

---

### 🐛 BUG-05 — Profile page always shows YOUR profile, even for `/profile/:uid`
**Location:** `ProfilePage.jsx`  
**Code:** `const isOwn = true;` (hardcoded, line 48) + `user.uid` always used for Firestore query  
**Problem:** When navigating to `/profile/anotherUserId` the page never reads the `:uid` URL param — it always loads the **currently logged-in user's** profile data. Anyone's profile link will show your own profile. The "Edit Profile" button will always appear (since `isOwn` is hardcoded `true`), even on others' profiles.  
**Fix:** Use `const { uid: paramUid } = useParams()` and determine `isOwn = !paramUid || paramUid === user?.uid`. Load the profile by `paramUid || user.uid`.

---

### 🐛 BUG-06 — Live red pulsing badge fires for ALL users after 3 seconds
**Location:** `BottomNav.jsx` lines 35-38  
**Code:** `const timer = setTimeout(() => setFriendsLive(true), 3000);`  
**Problem:** Every single user who opens the app will see the red pulsing live badge on the Live nav item after 3 seconds — even if zero friends are streaming. This is fake status shown as real. Users who tap the Live tab and find no live streams will lose trust in the app's accuracy.  
**Fix:** Remove the fake timer. Query Firestore for actual live streams from people the user follows and only show the badge when real streams exist.

---

### 🐛 BUG-07 — TopNav ✏️ "Create Post" button just navigates to /feed
**Location:** `TopNav.jsx` line 162  
**Code:** `<button onClick={() => navigate('/feed')} aria-label="Create post">`  
**Problem:** The ✏️ button in the top navigation bar just navigates to `/feed`. It does NOT open the create post modal. Users tapping it on any page other than Feed will go to Feed but the modal won't open. The store has `createPostOpen` state and `setCreatePostOpen` but it's never called here.  
**Fix:** Replace with `onClick={() => setCreatePostOpen(true)}` and handle `createPostOpen` in AppShell or FeedPage to open the create modal from anywhere.

---

### 🐛 BUG-08 — Chat thread hides the TopNav and SideNav
**Location:** `MessagesPage.jsx` lines 49, 120-127  
**Problem:** When a user opens a conversation, `ChatThread` renders with `height: 100vh`. Since it's inside the `<main>` element (which has `paddingLeft: 72px` and `paddingBottom: 56px`), the chat header gets hidden behind the TopNav and the input bar is partially obscured. The back button `‹` works but the main navigation is completely hidden — users can't access other tabs while in a chat.  
**Fix:** The ChatThread component should be a proper full-page route `/messages/:id` instead of an inline state swap, OR it should use `height: 100%` and account for the AppShell chrome height (`var(--top-nav-h)`).

---

### 🐛 BUG-09 — Unread badges never populate from real data
**Location:** `useAppStore.js` lines 23-24  
**Problem:** `unreadMessages: 0` and `unreadNotifications: 0` start at zero and **no Firestore listener ever updates them**. The badge counts in TopNav (🔔) and SideNav (💬) will always show 0 even if the user has 20 unread messages. Users will miss notifications.  
**Fix:** Add real-time Firestore listeners on app init (in `useAuth` hook or a dedicated `useUnreadCounts` hook) that subscribe to unread message/notification counts for the current user.

---

### 🐛 BUG-10 — No React Error Boundary — crashes show blank white screen
**Location:** `App.jsx` — no ErrorBoundary component wrapping routes  
**Problem:** If any page component throws a runtime error (Firebase config missing, null dereference, etc.), the entire app goes blank. Users see a white screen with no explanation. This is especially bad in Suspense/lazy-loaded routes.  
**Fix:** Wrap `<Routes>` in a React `<ErrorBoundary>` that shows a friendly error UI with a "Return to Home" button and logs the error.

---

## 🟠 HIGH PRIORITY — UX ISSUES THAT HURT THE USER EXPERIENCE

---

### ⚠️ UX-01 — Sidebar is always open on first load, covers 72px of content
**Location:** `BottomNav.jsx` — `const [expanded, setExpanded] = useState(true);`  
**Problem:** The sidebar starts expanded and covers the left 72px of every page's content. On a 390px mobile screen, that's nearly 20% of the viewport eaten by navigation. First-time users don't know the sidebar can collapse. The pull-tab arrow (‹/›) is very small and hard to discover.  
**Fix:** On mobile viewports (< 640px), sidebar should default to `expanded: false`. Add a one-time "swipe right to reveal nav" onboarding tooltip.

---

### ⚠️ UX-02 — Mini Music Player overlaps the FAB button
**Location:** `AppShell.jsx` + `global.css`  
**Problem:** The FAB is positioned `bottom: 88px` and the MiniPlayer is `bottom: 0, height: 56px`. The FAB sits 32px above the mini player — fine normally. But the content area `paddingBottom: 56` doesn't account for BOTH the mini player AND safe area insets. On iPhone with home indicator, content is cut off.  
**Fix:** `paddingBottom` should be `calc(56px + 56px + env(safe-area-inset-bottom))` — accounting for mini player height + safe bottom area. FAB should be `bottom: calc(56px + 20px + env(safe-area-inset-bottom))`.

---

### ⚠️ UX-03 — Feed posts have no images — emoji placeholders look unfinished
**Location:** `FeedPage.jsx` → `PostCard` component  
**Problem:** When a post has no `mediaUrl` (which is ALL demo posts), a colored box with a single emoji is shown. This looks like a broken/loading image. Real users comparing to Instagram/TikTok will find this visually poor.  
**Fix:** Replace the emoji placeholder with a proper image placeholder (gradient card with the post text centered and styled), or auto-generate a quote card from the post text. Better yet, seed demo posts with real Unsplash image URLs.

---

### ⚠️ UX-04 — Dating filter buttons don't actually filter anything
**Location:** `DatingPage.jsx` lines 69-78  
**Problem:** The filter bar shows "Nearby", "Age 20–30", "Interests", "Verified", "Online" as buttons. Tapping them changes `activeFilter` state but the `PROFILES` array is never filtered based on the selection. All 5 profiles always show regardless of which filter is active. Users expect filters to work.  
**Fix:** Actually filter the `PROFILES` array based on `activeFilter`. For example, "Online" should only show profiles with `online: true`, etc.

---

### ⚠️ UX-05 — Matching with someone in Dating just shows a toast
**Location:** `DatingPage.jsx` line 163  
**Problem:** Tapping a match in the "Your Matches" row shows a toast (`Chat with Jordan`) but doesn't navigate to a chat or open any conversation. Users expect tapping a match to open a conversation thread — this is core to dating app UX.  
**Fix:** Navigate to `/messages` with the matched user's data, or open an inline chat bottom sheet.

---

### ⚠️ UX-06 — No "Forgot Password" link on Login page
**Location:** `LoginPage.jsx`  
**Problem:** The login form has email and password fields with no "Forgot password?" link. If a user forgets their password, there is no way to recover it from the UI.  
**Fix:** Add a "Forgot password?" link that calls Firebase `sendPasswordResetEmail(auth, email)` and shows a confirmation message.

---

### ⚠️ UX-07 — Google Sign-In uses popup (broken on many mobile browsers)
**Location:** `LoginPage.jsx` line 62  
**Code:** `await signInWithPopup(auth, new GoogleAuthProvider());`  
**Problem:** `signInWithPopup` is blocked by Safari on iOS (popup blocker) and many mobile browsers. The Google sign-in option will fail silently for a large percentage of users.  
**Fix:** Detect mobile and use `signInWithRedirect` on small screens: `window.innerWidth < 768 ? signInWithRedirect(...) : signInWithPopup(...)`.

---

### ⚠️ UX-08 — Stories carousel uses 100% mock data — no real stories
**Location:** `FeedPage.jsx` → `MOCK_STORIES` constant  
**Problem:** The stories bar shows the same 7 fake people every time the app loads. Clicking a story navigates to `/stories` but there are no real user stories. This is a prominent UI element that is completely non-functional.  
**Fix:** Load actual stories from `Firestore: collection('stories')` with real-time listener. For demo mode, show demo stories. Show "No stories yet — be the first!" empty state if no stories exist.

---

### ⚠️ UX-09 — Messages page shows mock data — no real conversations
**Location:** `MessagesPage.jsx` → `PINNED` and `CONVERSATIONS` constants  
**Problem:** The messages page shows 7 fake conversations with fake people every time it loads. No Firestore integration exists in this SPA component. Sending a message (in ChatThread) only updates local state — it disappears on navigation.  
**Fix:** Replace mock data with real Firestore `collection('conversations')` queries, filtered to the current user. Persist sent messages to Firestore.

---

### ⚠️ UX-10 — Post creation doesn't show who you are (display name missing)
**Location:** `FeedPage.jsx` line 205  
**Code:** `authorName: user?.displayName || user?.email?.split('@')[0] || 'User'`  
**Problem:** Firebase Authentication does NOT automatically set `displayName` on new accounts. New users who create an account (not Google) will have `displayName = null`, making all their posts appear as authored by the first part of their email or just "User". This is jarring.  
**Fix:** After `createUserWithEmailAndPassword`, call `updateProfile(user, { displayName: emailPart })` to set a display name, OR require it in the sign-up form.

---

### ⚠️ UX-11 — Profile Followers / Following numbers are hardcoded strings
**Location:** `ProfilePage.jsx` lines 74-75  
**Code:** `followers: profile?.followersCount || '1.4K'`  
**Problem:** If Firestore doesn't have `followersCount`, the profile shows "1.4K followers" as a default — this is fake data presented as real. New users with 0 followers will see 1,400.  
**Fix:** Default to `0`, not `'1.4K'`. Format numbers with a helper: `formatCount(n) => n >= 1000 ? (n/1000).toFixed(1)+'K' : n`.

---

### ⚠️ UX-12 — Feed has no infinite scroll / load more
**Location:** `FeedPage.jsx` → Firestore query with `limit(20)`  
**Problem:** Only the 20 most recent posts are fetched. There's no "Load more" button or infinite scroll. After 20 posts, the feed ends with no indication. Users will think the app is empty.  
**Fix:** Implement cursor-based pagination using Firestore's `startAfter(lastDoc)` with either a "Load More" button at the bottom of the feed or an Intersection Observer for infinite scroll.

---

### ⚠️ UX-13 — TopNav title is always hardcoded — doesn't reflect current user's name
**Location:** `TopNav.jsx` — TITLES map  
**Problem:** The page title at the top left says just "ConnectHub" on the Feed. It doesn't say "Hi, [Name]" or personalize in any way. There's no app logo — just the word "ConnectHub" as gradient text (but the app is called "LynkApp" per the trademark documentation).  
**Fix:** Show the LynkApp logo instead of "ConnectHub" text, OR on the Feed show "Hi, [firstName] 👋". Update the brand name consistently.

---

### ⚠️ UX-14 — More Drawer has duplicate ☰ entry point in BOTH TopNav and SideNav
**Location:** `TopNav.jsx` (☰ button right side) + `BottomNav.jsx` (☰ "More" tab)  
**Problem:** Both the sidebar and the topnav have a ☰ button that opens the More Drawer. This is redundant and potentially confusing. Users don't know which ☰ to use.  
**Fix:** Remove the ☰ button from TopNav (it's in the sidebar), OR remove the "More" item from the sidebar and keep it ONLY in TopNav. Pick one location.

---

### ⚠️ UX-15 — No toast renderer component visible — toasts may not show
**Location:** `useAppStore.js` → `showToast` + `AppShell.jsx`  
**Problem:** `showToast` sets `toast: message` in the store, but scanning AppShell.jsx, there is **no component that reads `useAppStore(s => s.toast)` and renders it**. Toasts set by the Dating page, Menu items, etc. may never appear on screen.  
**Fix:** Add a `<Toast />` component in `AppShell.jsx` that reads `toast` from the store and displays it (the `.toast` CSS class already exists in global.css — it just needs a component to use it).

---

### ⚠️ UX-16 — Interstitial ads fire too aggressively
**Location:** `AppShell.jsx` lines 278-283  
**Problem:** An interstitial ad can appear 800ms after every single page navigation. If `adService.canShowInterstitial()` is permissive, users navigating through the app will be constantly interrupted by full-screen ads. This will cause extremely high churn.  
**Fix:** Interstitials should only fire at most once per session or after a user has done 5+ page navigations. Add a session counter check in `adService.canShowInterstitial()`.

---

## 🟡 MEDIUM PRIORITY — POLISH & FEATURE GAPS

---

### 📋 POLISH-01 — Story ring gradient doesn't match the CSS class
**Location:** `FeedPage.jsx` → `storyAvatar` inline style  
**Problem:** The story avatar gradient ring is implemented with inline styles instead of using the `.story-ring` CSS class from `global.css`. The CSS class uses `#0f0c29` as the inner background color but the FeedPage uses `#0a0a18`. These are slightly different background colors causing a visible gap on some OLED screens.  
**Fix:** Use the `.story-ring` and `.story-ring-seen` CSS classes instead of inline styles.

---

### 📋 POLISH-02 — Dating page has no "It's a Match!" celebration screen
**Location:** `DatingPage.jsx`  
**Problem:** When you tap ❤️ to like someone, only a toast appears ("💚 Liked Emma Wilson!"). There is no celebratory "It's a Match!" fullscreen modal — which is the most exciting moment in any dating app and is a core part of the expected user experience.  
**Fix:** After a like action (simulated mutual match at random), show a full-screen match celebration modal with confetti animation, the matched user's avatar, and "Send a Message" / "Keep Swiping" buttons.

---

### 📋 POLISH-03 — Profile "Edit Profile" button has no destination
**Location:** `ProfilePage.jsx` line 117  
**Problem:** The "Edit Profile" button (`isOwn` case) has no `onClick` handler. Tapping it does nothing.  
**Fix:** Navigate to `/settings` or open an "Edit Profile" bottom sheet.

---

### 📋 POLISH-04 — Post ••• (options) menu does nothing
**Location:** `FeedPage.jsx` → `PostCard` line 141  
**Problem:** The `•••` button on each post card has no `onClick`. Users expect tapping it to show options (Report, Copy Link, Save, Unfollow, etc.).  
**Fix:** Add a post options bottom sheet with at minimum: Copy Link, Save Post, Report, and (if own post) Delete.

---

### 📋 POLISH-05 — Share button doesn't share anything
**Location:** `FeedPage.jsx` → `PostCard` — "🔁 Share" button  
**Problem:** The Share button has no `onClick` handler. Tapping it does nothing.  
**Fix:** Call `navigator.share({ url: window.location.href, title: post.content })` for native mobile sharing, with a fallback to "Copy link to clipboard".

---

### 📋 POLISH-06 — Bookmark button doesn't save anything
**Location:** `FeedPage.jsx` → `PostCard` — "🔖" button  
**Problem:** The bookmark/save button has no `onClick` handler. Tapping it does nothing. The `/saved` page exists but nothing can be saved to it.  
**Fix:** Add `onClick` that writes to `users/{uid}/saved/{postId}` in Firestore and shows a toast "Post saved ✓".

---

### 📋 POLISH-07 — Profile content grid items have no click action
**Location:** `ProfilePage.jsx` lines 229-242  
**Problem:** The 3-column post grid items are rendered with `cursor: pointer` but have no `onClick` handler. Tapping a post in the grid does nothing — no post detail view opens.  
**Fix:** Navigate to `/feed?post={item.id}` or open a post detail modal on tap.

---

### 📋 POLISH-08 — Music player progress bar is static (hardcoded at 35%)
**Location:** `AppShell.jsx` line 38 (MiniPlayer) + line 237 (FullPlayer)  
**Code:** `<div style={{ width:'35%', ... }}`  
**Problem:** The music player progress bar is permanently at 35% in both the mini player and full player. It never moves. Time shows static "1:24 / 3:32". This makes the music player look like a mockup, not a real feature.  
**Fix:** Add a timer `useEffect` that increments progress position state, simulating playback. Even simulated progress is better than a frozen bar.

---

### 📋 POLISH-09 — No loading state on profile tab switch
**Location:** `ProfilePage.jsx`  
**Problem:** Switching between Posts / Reels / Tagged / Liked tabs shows content instantly without any transition. "Tagged" and "Liked" just show empty states permanently. This makes the profile feel incomplete.  
**Fix:** Add a brief skeleton loader between tab switches. For Tagged/Liked, either populate with demo data or show a better empty state ("Start engaging with posts to see them here").

---

### 📋 POLISH-10 — No "New Post" notification while browsing feed
**Location:** `FeedPage.jsx`  
**Problem:** The Firestore `onSnapshot` listener immediately inserts new posts into the list, causing the feed to jump unexpectedly while reading. Apps like Twitter/X show a "New posts" floating chip at the top that the user can tap to load them.  
**Fix:** Buffer incoming posts in a `newPosts` state array and show a pill at the top "✨ 3 new posts — tap to load". Only insert them on tap.

---

### 📋 POLISH-11 — TopNav avatar is very small (34×34px — below 44px touch target)
**Location:** `TopNav.jsx` line 103  
**Code:** `width:'34px', height:'34px'`  
**Problem:** The avatar button is 34px × 34px, which is below the 44px minimum Apple HIG touch target. On mobile, users will frequently miss the tap or accidentally tap adjacent elements. This is the most-tapped element on the whole TopNav.  
**Fix:** Increase to `width: 44px, height: 44px` as specified in the design system (global.css has `.btn-icon { min-width: 44px; min-height: 44px }`).

---

### 📋 POLISH-12 — Dating page fixed height card stack breaks on small screens
**Location:** `DatingPage.jsx` line 81  
**Code:** `height: '440px'`  
**Problem:** The card stack has a hardcoded height of `440px`. On phones with < 700px screen height (many budget Android devices), this leaves little room for the action buttons and matches row, causing overflow or cramped layout.  
**Fix:** Use a responsive height: `height: min(440px, 58vh)` or calculate based on `window.innerHeight`.

---

### 📋 POLISH-13 — No keyboard shortcut / accessibility for swipe actions
**Location:** `DatingPage.jsx`  
**Problem:** Users who can't swipe (mouse users, accessibility users with motor impairments) only have the ✕ / ⭐ / ❤️ buttons. These work, but there is no `aria-label` on the swipeable card itself, no keyboard shortcut (←/→ arrows), and no voice control support.  
**Fix:** Add `tabIndex={0}` and `onKeyDown` handler to the card (`→` = like, `←` = pass, `↑` = super like). Add `aria-label="Profile card for {name}, age {age}. Press right arrow to like, left to pass."`.

---

### 📋 POLISH-14 — Login page branding says "ConnectHub" not "LynkApp"
**Location:** `LoginPage.jsx` line 99  
**Problem:** The login page prominently says "ConnectHub" with a ⚡ icon. But the app is being branded as "LynkApp" per trademark documentation. Brand inconsistency on the very first screen users see.  
**Fix:** Update login page branding to match LynkApp identity (logo, name, tagline).

---

### 📋 POLISH-15 — No user onboarding flow after first sign-up
**Location:** `App.jsx` — no `/onboarding` route is registered  
**Problem:** When a new user creates an account, they are immediately dumped into the Feed with an empty experience (no posts, no connections, no stories). There is no onboarding — no "choose your interests", no "find friends", no "set up your profile". First-time users will see a completely empty feed and leave.  
**Fix:** After `createUserWithEmailAndPassword`, redirect to `/onboarding` instead of `/feed`. Create a 3-step onboarding: 1) Set profile photo + bio, 2) Choose interests, 3) Find friends.

---

### 📋 POLISH-16 — No "pull to refresh" on the feed
**Location:** `FeedPage.jsx`  
**Problem:** The Firestore `onSnapshot` listener keeps the feed updated in real-time, but users are trained to pull-to-refresh on mobile social apps. Without a visual pull-to-refresh indicator, users may think the feed is stale.  
**Fix:** Add a pull-to-refresh gesture (or a "Refresh" button that appears after scrolling to top) that re-queries the feed and shows a spinner.

---

### 📋 POLISH-17 — TopNav search icon shows on all pages — no active search state
**Location:** `TopNav.jsx` line 167  
**Problem:** The search icon navigates to `/search` but doesn't indicate when you're already on the search page (no active state styling). Also, tapping it always does a full navigation, losing any scroll position.  
**Fix:** Show the search icon as "active" (accent color, different background) when `pathname.startsWith('/search')`.

---

### 📋 POLISH-18 — Feed Filter "Trending" tab duplicates /trending page
**Location:** `FeedPage.jsx` + `App.jsx` (both `/trending` and "Trending" pill exist)  
**Problem:** There's a "Trending" tab in the feed filter pills AND a separate `/trending` route with its own page. These are redundant and confusing — users don't know which to use.  
**Fix:** Remove the standalone `/trending` page (or make it redirect to Feed with "Trending" filter active). Keep Trending only as a feed filter pill, per the original recommendation.

---

### 📋 POLISH-19 — No app name / logo in TopNav — just text
**Location:** `TopNav.jsx` line 85-92  
**Problem:** The left side of TopNav shows a gradient text of the current page name (e.g., "ConnectHub", "Dating", "Messages"). There is no consistent app logo or brand mark. Competitors like Instagram/TikTok always show their logo in the TopNav for brand recognition.  
**Fix:** Show a small LynkApp logo SVG/image in the top-left on the Feed page. On other pages, show the page title (current behavior is fine for secondary pages).

---

### 📋 POLISH-20 — No "typing indicator" in chat threads
**Location:** `MessagesPage.jsx` → `ChatThread`  
**Problem:** The chat thread shows messages but there's no "Alex is typing..." indicator. This is a standard feature users expect in any messaging product.  
**Fix:** When composing a message, broadcast a Firestore "typing" document to the conversation. Show animated dots in the chat when the other person is typing.

---

## 🟢 LOW PRIORITY — NICE-TO-HAVE IMPROVEMENTS

---

### 💡 IMPROVE-01 — Add haptic feedback to dating swipe actions (mobile)
Use `navigator.vibrate(30)` (short pulse) when passing and `navigator.vibrate([30, 30, 30])` (triple pulse) when liking. Makes the swipe feel more physical and satisfying.

### 💡 IMPROVE-02 — Add character counter to Create Post textarea  
The Create Post modal textarea has no character limit or counter. Add a 500-character limit with a counter that turns red at 450+.

### 💡 IMPROVE-03 — Stories progress bar missing from story viewer  
The full-screen story viewer (StoriesPage route) should have a thin progress bar across the top showing story time remaining — the standard from Instagram/Snapchat.

### 💡 IMPROVE-04 — Dating "View all matches" opens empty state  
Clicking "See all →" next to "Your Matches" shows a toast. Should navigate to a matches list page or expand an inline view.

### 💡 IMPROVE-05 — No app icon / PWA icon — just browser default  
The manifest.json exists but update it with actual LynkApp icons (192×192, 512×512 PNG). The current favicon/icon appears to be the Vite default.

### 💡 IMPROVE-06 — More Drawer items lack descriptive subtitles  
In the More Drawer, items are listed as just icon + name. Adding a one-line subtitle ("Find events near you" under 📅 Events) would help users understand what each section does.

### 💡 IMPROVE-07 — No "back to top" button on long feeds  
After scrolling through the feed, there's no "back to top" button. A floating ^ button that appears after 3+ scrolls would improve usability.

### 💡 IMPROVE-08 — Profile handle (@username) is auto-generated, not real  
The handle is generated from `displayName.toLowerCase().replace(/\s+/g, '')`. New users with common names will have duplicate handles. Need uniqueness check.

### 💡 IMPROVE-09 — Dating compatibility percentage is hardcoded  
The `compat` % on each profile card is hardcoded mock data. Should be calculated from shared interests, location proximity, and user preferences.

### 💡 IMPROVE-10 — No skeleton loaders on Profile, Messages, Dating pages  
Only FeedPage has skeleton loaders. Profile, Messages, and Dating show either nothing or jump straight to content with no loading state, causing jarring layout shifts.

---

## 📊 BETA TEST SUMMARY SCORECARD

| Category | Score | Status |
|---|---|---|
| 🔴 Critical Bugs | 10 found | ❌ Must fix before launch |
| 🟠 High Priority UX Issues | 16 found | ⚠️ Fix before beta release |
| 🟡 Medium Polish Issues | 19 found | 📋 Fix in first update |
| 🟢 Low Priority Improvements | 10 found | 💡 Backlog for v1.1 |
| **Total Issues** | **55** | |

### Top 5 Issues To Fix First (highest user impact):
1. **BUG-01** — Sign Out button doesn't sign out (trust-breaking)
2. **BUG-04** — Dating swipe broken on mobile (core feature broken)
3. **BUG-02** — Following/Friends feed tabs always empty (key feature broken)
4. **BUG-05** — Profile always shows own profile (broken social feature)
5. **UX-15** — Toasts don't appear (silent UX feedback broken)

---

*Report generated by: ConnectHub Beta Testing Team, May 6, 2026*
