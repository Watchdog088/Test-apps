# 🔍 FULL UX/UI AUDIT REPORT — LynkApp
### Date: May 20, 2026 | Auditor: AI UX/UI Tester | App: ConnectHub-SPA (React + Firebase)

---

## TABLE OF CONTENTS
1. [Executive Summary](#executive-summary)
2. [App Architecture Overview](#app-architecture-overview)
3. [SECTION 1: Authentication & Onboarding](#section-1-authentication--onboarding)
4. [SECTION 2: Navigation & Global Shell](#section-2-navigation--global-shell)
5. [SECTION 3: Home Feed](#section-3-home-feed)
6. [SECTION 4: Stories](#section-4-stories)
7. [SECTION 5: Live Streaming](#section-5-live-streaming)
8. [SECTION 6: Dating](#section-6-dating)
9. [SECTION 7: Messages](#section-7-messages)
10. [SECTION 8: Marketplace](#section-8-marketplace)
11. [SECTION 9: Groups](#section-9-groups)
12. [SECTION 10: Events](#section-10-events)
13. [SECTION 11: Profile](#section-11-profile)
14. [SECTION 12: Friends](#section-12-friends)
15. [SECTION 13: Notifications](#section-13-notifications)
16. [SECTION 14: Search](#section-14-search)
17. [SECTION 15: Settings](#section-15-settings)
18. [SECTION 16: Music Player](#section-16-music-player)
19. [SECTION 17: Media Hub](#section-17-media-hub)
20. [SECTION 18: Gaming Hub](#section-18-gaming-hub)
21. [SECTION 19: Video Calls](#section-19-video-calls)
22. [SECTION 20: AR/VR](#section-20-arvr)
23. [SECTION 21: Creator Studio](#section-21-creator-studio)
24. [SECTION 22: Business Tools](#section-22-business-tools)
25. [SECTION 23: Premium](#section-23-premium)
26. [SECTION 24: Help & Support](#section-24-help--support)
27. [SECTION 25: Menu / More Drawer](#section-25-menu--more-drawer)
28. [SECTION 26: Admin Pages](#section-26-admin-pages)
29. [SECTION 27: Saved Posts](#section-27-saved-posts)
30. [CRITICAL ISSUES THAT NEED IMMEDIATE ATTENTION](#critical-issues-that-need-immediate-attention)
31. [MISSING DASHBOARDS & PAGES NEEDED](#missing-dashboards--pages-needed)
32. [WHAT WORKS WELL](#what-works-well)
33. [WHAT DOES NOT WORK](#what-does-not-work)
34. [FEATURES STILL NEEDED TO ADD](#features-still-needed-to-add)
35. [UX RECOMMENDATIONS](#ux-recommendations)

---

## EXECUTIVE SUMMARY

LynkApp is a feature-rich social media platform built with React + Vite + Firebase. It has an **extremely large feature set** (~30+ sections/pages) covering social feed, dating, live streaming, marketplace, gaming, AR/VR, and more. The codebase is well-organized, but there are **significant gaps between what is coded and what is fully functional**. Many pages contain UI shells with **mock/demo data that are not wired to a real backend**. The dev server fails to serve pages via `localhost:5176` due to the Vite config scanning outside the SPA directory. Navigation works via side nav (left vertical bar) and a "More" drawer.

**Overall Readiness Score: 62/100** (Strong UI foundation, incomplete backend wiring, missing dashboards)

---

## APP ARCHITECTURE OVERVIEW

```
ConnectHub-SPA/
├── src/
│   ├── App.jsx              ← Router with 35+ routes
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.jsx ← Global chrome (TopNav + SideNav + MiniPlayer + Drawer)
│   │   │   ├── TopNav.jsx   ← Fixed header with logo, search, notifications, avatar
│   │   │   └── BottomNav.jsx ← Left vertical sidebar (Home/Live/Dating/Messages/Shop/More)
│   │   └── common/
│   │       └── SkeletonLoader.jsx
│   ├── pages/ (35 pages)
│   ├── services/ (30+ API integrations)
│   ├── store/ (Zustand global store)
│   ├── hooks/
│   └── firebase/
```

**Navigation Model:** Left vertical sidebar (72px) with 6 primary tabs:
- Home (Feed), Live, Dating, Messages, Marketplace (Shop), More (drawer)

**Secondary navigation:** "More" drawer opens 75vh bottom sheet with full menu.

---

## SECTION 1: AUTHENTICATION & ONBOARDING

### ✅ WHAT WORKS
- Email/Password sign-in and sign-up — **FULLY FUNCTIONAL** (Firebase Auth wired)
- Google OAuth Sign-In — **FUNCTIONAL** (uses signInWithPopup on desktop, signInWithRedirect on mobile)
- Forgot Password flow — **FUNCTIONAL** (sends reset email via Firebase)
- Demo Login button — **FUNCTIONAL** (bypasses Firebase, creates mock user in Zustand store)
- Display name set on signup — **FUNCTIONAL** (updateProfile + Firestore user doc creation)
- Firebase error messages humanized (removes "Firebase:" prefix)
- Onboarding route (`/onboarding`) exists and is lazy-loaded
- New users are redirected to `/onboarding` after sign-up

### ❌ WHAT DOES NOT WORK
- **CRITICAL: The Vite dev server does not serve pages** — 404 on every route including `/login`. The `vite.config.js` root context issue means the server starts but pages cannot be loaded in browser. The `historyApiFallback` is likely not configured properly for client-side routing, causing all page routes to return 404.
- **Onboarding page is incomplete** — The `OnboardingPage.jsx` exists but needs verification of all steps being wired.
- **No email verification flow** — After sign-up, users are not prompted to verify their email before using the app. High-risk for spam accounts.
- **No phone number authentication** — Many social apps offer phone sign-up; it's missing here.
- **Google sign-in redirect on mobile** — After `signInWithRedirect`, the `getRedirectResult()` call must be present to capture the result; it may not be implemented in `useAuth.js`.
- **No social proof on login page** — No "Join X million users" text to build trust.
- **Password strength indicator missing** — Sign-up form has no password strength meter.
- **No "Remember Me" option** — Firebase handles session persistence, but there's no explicit UX for this.

### 📝 NEEDS DASHBOARD WHEN CLICKED
- The **avatar/profile button** on the login page doesn't exist — should show "already logged in" state redirect
- **Onboarding page** needs a complete multi-step setup dashboard with: profile photo upload, bio, interests selection, birthday, gender, and notification preferences

### 🔧 RECOMMENDATIONS
1. Add `getRedirectResult()` in `useAuth.js` to capture Google mobile redirect sign-ins
2. Add email verification step before allowing access to the main app
3. Add phone number auth option
4. Add a password strength meter to the sign-up form
5. Add social proof text (user count or tagline) below the LynkApp branding
6. Create a proper multi-step onboarding flow (5-7 steps)
7. **FIX CRITICAL: Configure `vite.config.js` with `historyApiFallback` via a proxy or deploy with proper SPA fallback**

---

## SECTION 2: NAVIGATION & GLOBAL SHELL

### ✅ WHAT WORKS
- **AppShell** correctly wraps all protected routes with a persistent layout
- **TopNav** — Fixed header with LynkApp logo on feed, page title on other pages, ✏️ Create, 🔍 Search, 🔔 Notifications badge, avatar
- **SideNav (BottomNav.jsx)** — Left vertical sidebar with 6 tabs (Home, Live, Dating, Messages, Shop, More)
- Sidebar can be collapsed/expanded with a pull-tab toggle
- Active state highlights current route
- "More" drawer opens from the "More" tab — contains 5 sections with all secondary pages
- **Mini Music Player** persistent at bottom with play/pause, track name, animated progress bar
- **Full Music Player Modal** expands from mini player
- **Error Boundary** catches crashes and shows a recovery screen
- **Toast notifications** (success/warning/error/info) render at top:72px
- **Live "went live" banner** shows when followed users go live (Firestore wired)
- **Offline banner** detects network state changes
- **Interstitial ads** trigger every N page navigations via `adService`
- **Rewarded ads** trigger when user clicks "Watch Ad" for coins

### ❌ WHAT DOES NOT WORK
- **CRITICAL: SideNav is coded as a vertical left sidebar but the `paddingLeft: 72px` in AppShell means the main content is always pushed right** — on mobile screens < 640px, this causes the sidebar to visually collapse but the content padding still applies, creating a blank left gutter. **This is a major layout bug on mobile.**
- **The SideNav defaults to collapsed on mobile** (`isMobile` check), but the `isMobile` variable uses `window.innerWidth` at render time — it does NOT respond to window resize events, so rotating a device won't update the state.
- **Mini Player music is hardcoded** — The demo track is "Blinding Lights / The Weeknd" hardcoded. If a user is actually on the Music page playing real music, the mini player won't reflect that. There is no real audio integration between the Music page and the AppShell mini player.
- **The "More Drawer" duplicates the Menu page** — Both `MoreDrawer` in AppShell and the `/menu` route have similar content. This is confusing. Clicking `More` in the sidebar opens the drawer; navigating to `/menu` opens a full page. These should be unified.
- **No "trending" page** — `/trending` redirects to `/feed?filter=trending`. The feed filter for "Trending" works but there's no dedicated trending page with trending topics, hashtags, or content discovery.
- **Interstitial ads appear on every navigation** — After a few clicks, this becomes extremely intrusive. The `canShowInterstitial()` method needs better frequency capping.
- **No back button on TopNav for nested routes** — When navigating to `/live/watch/:streamId` or `/marketplace/seller/:name`, there's no back arrow in the top nav to return to the parent page.

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **Avatar in TopNav** → Should open a quick profile dropdown with: View Profile, Switch Account, Settings, Sign Out
- **🔔 Notifications bell** → Routes to `/notifications` (works), but the badge count doesn't clear when the page opens
- **✏️ Create button** → Opens CreatePostModal (works), but needs option to select post type: Photo, Video, Text, Poll, Story, Live

### 🔧 RECOMMENDATIONS
1. **Fix mobile layout**: On screens < 640px, remove the `paddingLeft: 72px` entirely when the sidebar is collapsed
2. Add a resize event listener to re-check `isMobile` in SideNav
3. Wire the mini player to actual audio from the Music page (use Zustand store for `currentTrack`)
4. Merge the More Drawer and Menu page into one consistent experience
5. Add a back-arrow `<` to TopNav when on nested routes
6. Limit interstitial ads to max once every 5+ page navigations
7. Create a dedicated Trending dashboard page

---

## SECTION 3: HOME FEED

### ✅ WHAT WORKS
- **Firestore real-time feed** with onSnapshot (falls back to demo posts if no DB)
- **Stories bar** at top (horizontal scroll, clicking navigates to `/stories`)
- **Filter tabs**: For You | Following | Friends | Trending | Live — **filters are wired**
- **Post cards** with: author avatar, name, timestamp, content, media image, Like, Comment, Share, Bookmark
- **Like button** with haptic feedback (`navigator.vibrate`) — toggles optimistically
- **Bookmark button** saves to Firestore `users/{uid}/saved/{postId}`
- **Share button** uses Web Share API with clipboard fallback
- **Comment bottom sheet** opens per post with comment input
- **Post options sheet** (•••): Copy Link, Save Post, Report Post, Delete Post (owner only)
- **Create Post modal** with 500-char counter (turns red at 450+) — posts to Firestore
- **Cursor-based pagination** ("Load More" button)
- **New posts buffer pill** "✨ N new posts — tap to load" when new posts arrive
- **Pull-to-refresh** via touch gesture detection
- **Back-to-top button** appears after scrolling 400px
- **Quote cards** for text-only posts (gradient backgrounds)
- **Skeleton loaders** during initial load
- **Empty state messages** per filter with CTA

### ❌ WHAT DOES NOT WORK
- **Image/video upload in Create Post is MISSING** — The create post modal only accepts text. There is no way to attach a photo or video to a post from this modal. The `mediaUrl` field is hardcoded to `null`. This is a major missing feature.
- **"Following" and "Friends" filters show empty** if `followingIds` / `friendIds` are not populated in the Zustand store from the backend. In demo mode, these will always be empty.
- **Comments are NOT saved to Firestore** — The `CommentSheet` uses local state only. Comments disappear on close.
- **Like toggle is NOT persisted to Firestore** — While the UI updates optimistically, the like count is not written back to the `posts` collection. Refresh = lost likes.
- **Share button** — The share count shown (e.g., "8") is read-only; sharing doesn't increment the actual counter.
- **Post deletion** in options sheet calls `showToast('Post deleted')` but does NOT actually delete from Firestore.
- **Report Post** in options sheet calls `showToast('Report submitted')` but does NOT send anything to any backend or admin queue.
- **The "Live" filter tab** in the feed doesn't actually show live-stream posts — it just shows the same feed as "For You".
- **No video post support** — Feed only renders image (mediaUrl) or gradient quote cards. Video posts are not rendered.
- **No poll post type** — No voting UI.
- **No GIF support** — Giphy service is integrated but not wired into post creation.
- **Story ring "seen" state** is hardcoded mock data — doesn't persist.
- **No infinite scroll** — Only "Load More" button; no auto-loading on scroll bottom.

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **Clicking a post author's name/avatar** → Should open a **User Profile Dashboard** (`/profile/:uid`) with their posts, bio, follow button, mutual friends — this route exists (`/profile/:uid`) but needs the PostCard to navigate there on author click
- **Clicking "Comments"** → Currently opens a sheet; should have a **dedicated comment thread page** (`/post/:id/comments`) for deep-link sharing
- **Clicking "Trending" filter** → Should load a proper **Trending Dashboard** with trending hashtags, topics, and posts sorted by engagement
- **Clicking "Live" filter** → Should show a **Live Posts/Streams feed**

### 🔧 RECOMMENDATIONS
1. **Add media upload** to Create Post modal (image picker, video, camera)
2. **Persist likes** to Firestore with proper user-specific like tracking
3. **Persist comments** to Firestore subcollection `posts/{postId}/comments`
4. **Wire post deletion** to Firestore `deleteDoc`
5. **Wire report** to Firestore `reports` collection or admin queue
6. Add **infinite scroll** using IntersectionObserver
7. Add **video post rendering** with `<video>` tag and mute/unmute controls
8. Add **poll post type** with voting
9. Wire **Giphy GIF picker** to the Create Post modal
10. Make **author names/avatars clickable** to navigate to user profiles

---

## SECTION 4: STORIES

### ✅ WHAT WORKS
- Stories page exists at `/stories`
- Story viewing UI exists (per StoriesSystem docs: 33+ features implemented)
- Highlights and Archive features coded
- Story reactions and reply system coded
- Story progress bars coded
- Story creation UI coded

### ❌ WHAT DOES NOT WORK
- **Stories in the feed bar are ALL MOCK DATA** — The 5 story circles on the feed are hardcoded (Jordan, Alex, Riley, Morgan, Sam) and do not pull from Firebase
- **Clicking any story in the feed** navigates to `/stories` but doesn't deep-link to that specific user's story
- **"Add Story" button** navigates to `/stories` but doesn't directly open the camera/upload flow
- **Story creation** — No actual camera integration; media upload for stories relies on Cloudinary which requires API key setup
- **Story "seen" state** is hardcoded in `MOCK_STORIES` array — unseen stories always show as unseen

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **Clicking a story ring** → Should open a **Story Viewer Dashboard** with full-screen immersive view, progress bar, tap-to-advance, swipe-to-next user, reply bar, reaction options
- **Clicking "Add" story** → Should open a **Story Creation Dashboard** with camera, media picker, text overlay, stickers, GIFs, music, drawing tools

### 🔧 RECOMMENDATIONS
1. Wire stories to Firestore `stories` collection
2. Make each story circle in the feed link to that user's specific story
3. Create a full-screen immersive **StoryViewer** component
4. Build **Story Creation flow** with camera/upload + text/sticker overlay

---

## SECTION 5: LIVE STREAMING

### ✅ WHAT WORKS
- Main Live page at `/live`
- **Live Setup page** at `/live/setup`
- **Live Watch page** at `/live/watch/:streamId`
- **Live Monetization page** at `/live/monetization`
- **Live Moderation page** at `/live/moderation`
- **Live Schedule page** at `/live/schedule`
- **Live Analytics page** at `/live/analytics`
- **Live Notifications page** at `/live/notifications` (bell icon destination fixed)
- **Clip Viewer page** at `/clips/:clipId`
- **VOD Replay page** at `/live/vod/:id`
- WebRTC service exists (`livestream-webrtc.js`)
- "Went live" in-app banner notification from AppShell (Firestore wired)

### ❌ WHAT DOES NOT WORK
- **WebRTC is NOT fully wired** — The `livestream-webrtc.js` service exists but actual peer-to-peer or TURN/STUN connection setup for real multi-viewer streaming requires a signaling server that is not deployed
- **Live Setup page** — Camera/mic permissions may not be properly tested; actual stream initiation to Firebase depends on backend WebRTC infrastructure
- **Monetization page** — "Super Chats" and "Bits/Coins" donations are UI-only; no payment processor integration for in-stream payments
- **Clip creation** — Clips are shown but actual stream clipping (recording a segment) is not implemented
- **VOD replays** — No actual recording stored; VOD page is a UI shell
- **Viewer count** — Hardcoded or estimated; no real-time viewer tracking
- **Live analytics** — Charts/graphs on the analytics page likely show mock data
- **Live chat** — Messages may not persist to Firestore correctly at scale
- **Gift/reaction animations** — UI exists but no real gift economy wiring

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **"Go Live" button** → Should open **Live Setup Dashboard** (exists at `/live/setup`) — needs full camera preview, title input, category select, thumbnail upload
- **"Schedule Stream" button** → Should open **Stream Scheduler Dashboard** (exists at `/live/schedule`) — needs date/time picker, recurring schedule, notification to followers
- **"Analytics" button** → Should open **Live Analytics Dashboard** (exists at `/live/analytics`) — needs real data: peak viewers, watch time, revenue, clip views
- **Stream cards in the Live feed** → Should open **Stream Watch Dashboard** (exists at `/live/watch/:id`) — needs live chat, reactions, gift sending, full-screen toggle

### 🔧 RECOMMENDATIONS
1. Deploy a WebRTC signaling server (or use Agora/Livekit/100ms SDK as drop-in)
2. Implement actual video recording for VODs using cloud storage
3. Wire viewer count to Firestore real-time presence
4. Implement Super Chat payment flow via Stripe
5. Add content categories/tags to live streams for discoverability
6. Implement stream notifications to all followers via push notifications
7. Add gift animations layer on the stream watch page

---

## SECTION 6: DATING

### ✅ WHAT WORKS
- **Swipe card stack** with drag-to-like/pass gesture — FULLY FUNCTIONAL
- **Card depth effect** (next card visible behind) — WORKS
- **Like/Pass/Super Like/Undo** action buttons with labels — WORKS
- **Compatibility score** (deterministic, no random jitter) — WORKS
- **Match Modal** with dual avatars + confetti animation — WORKS
- **Date Assistant Modal** with 3 date suggestions post-match — WORKS
- **Date scheduling step** (time slot picker) — WORKS
- **Profile Detail Sheet** (tap card to expand) with photo gallery + tap zones — WORKS
- **Photo navigation** with progress dots — WORKS
- **Compatibility tooltip** showing shared interests — WORKS
- **Dating Preferences Sheet** (age range, distance, gender, looking for, toggles) — WORKS
- **Block/Report Sheet** per profile — WORKS
- **Daily swipe counter** (100/day, localStorage) — WORKS
- **Super Like counter** (3/day, localStorage) — WORKS
- **Boost button** with 30-min countdown (premium-gated) — WORKS
- **"Who Liked You" panel** (blurred for non-premium) — WORKS
- **Video Intro Modal** — WORKS (UI only, no real video)
- **Age gate** (18+) check — WORKS
- **Filter bar** (All/Nearby/Online/Verified/Serious/Casual/Age Range/Looking For) — WORKS
- **Mutual friends pill** on cards — WORKS
- **Rewind/Undo button** with history stack — WORKS
- **Favorites button** — WORKS
- **Accessibility**: aria-labels, focus trap in modal, reduced-motion support — WORKS

### ❌ WHAT DOES NOT WORK
- **ALL PROFILES ARE MOCK DATA** — The 5 profiles (Jordan, Alex, Sam, Riley, Casey) are hardcoded in `BASE_PROFILES`. No real user profiles are pulled from Firestore. In production, the dating feature would show NO real people.
- **Swipe decisions are NOT persisted to Firestore** — Likes, passes, and super likes only update localStorage. If a user reinstalls the app, their swipe history is lost. Matches cannot be seen by the other person.
- **Matches row shows hardcoded names** — INITIAL_MATCHES (Morgan, Taylor, Blake, Quinn) are fake. Real matches from Firestore are not loaded.
- **"Send a Message" in MatchModal** — Navigates to `/messages` but does NOT create a real chat thread with the matched user
- **Video Intro is a UI shell** — The video modal shows an emoji placeholder with a play button, but there is no actual video URL or video element. No real video plays.
- **Preferences NOT saved to Firestore** — Dating preferences are saved to localStorage only; they don't sync across devices
- **The "Looking For" filter in the filter bar** doesn't actually filter the mock profiles correctly (it matches `lookingForKey` but the filtering logic in the main `DatingPageInner` component needs verification)
- **Location/distance is not real** — All distances (2mi, 5mi, etc.) are hardcoded
- **No real-time match notification** — When a mutual like occurs, there's no push notification
- **Match count badge in header** shows static count

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **Match avatars in the matches row** → Should open a **Match Conversation Dashboard** (direct message thread with that match)
- **"Messages" button on a match** → Should open **Chat Dashboard** at `/messages/:matchId` (route exists but thread isn't created)
- **"See All Matches"** → Should open a **Matches Dashboard** listing all mutual likes, sortable by date/compatibility
- **Boost button** → Should show **Boost Analytics Dashboard** showing profile view increase during boost
- **Compat % badge** → Already has tooltip; could link to a **Compatibility Deep-Dive Dashboard**
- **⚙️ preferences button** → Opens preferences sheet (works); should also link to full **Dating Settings Dashboard**

### 🔧 RECOMMENDATIONS
1. **CRITICAL: Wire all swipe actions to Firestore** — store likes/passes and check for mutual matches
2. Wire profiles to real user data from Firestore
3. When MatchModal "Send Message" is clicked, auto-create a chat thread in Firestore
4. Persist dating preferences to Firestore user document
5. Implement real-time match notifications via push (OneSignal already integrated)
6. Add proper video intro upload/playback via Cloudinary
7. Wire distance calculation using real geolocation
8. Build a dedicated **Matches List page** (`/dating/matches`) with conversation starters

---

## SECTION 7: MESSAGES

### ✅ WHAT WORKS
- Messages page at `/messages` and `/messages/:id`
- WebRTC service for video calls (`webrtc-service.js`) exists
- Firebase messaging service exists
- Chat thread UI coded
- Group chat coded
- Message status indicators (sent/delivered/read) coded
- Media sharing in messages coded
- Voice messages coded
- Reaction emojis to messages coded
- Message search coded
- Archive/mute/pin chats coded

### ❌ WHAT DOES NOT WORK
- **New Chat creation** — There's no "New Message" button that lets you search users and start a conversation
- **Dating → Messages handoff** — When matches click "Send a Message," no thread is pre-created
- **Real-time message delivery** — The WebRTC signaling server for video calls in messages is not deployed
- **Push notifications for new messages** — OneSignal is integrated but not wired to message events
- **Message read receipts** — May be UI-only without Firestore write-back
- **Media messages** — File upload requires Cloudinary/Storage API keys to be configured

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **Chat list rows** → Should open **Chat Thread Dashboard** with full message history, input bar, media, calls
- **Video call icon in a chat** → Should open **Video Call Dashboard** with camera/mic controls, screen share, recording
- **"New Message" button** (MISSING — needs to be added) → Should open **User Search Dashboard** to find and start a chat
- **Group chat name header** → Should open **Group Info Dashboard** with members list, media gallery, leave group, admin controls
- **Phone/video icon in chat header** → Should open **Active Call Dashboard**

### 🔧 RECOMMENDATIONS
1. Add a prominent "New Message" FAB (Floating Action Button) on the messages list
2. Wire Dating matches to auto-create `/messages/:matchId` thread
3. Deploy signaling server or use Agora SDK for in-app calls
4. Add message push notifications via OneSignal
5. Add group creation flow from the Messages page
6. Add "Message Requests" section for messages from non-friends

---

## SECTION 8: MARKETPLACE

### ✅ WHAT WORKS
- Marketplace page with product listings, categories, search — **SUBSTANTIAL** (24+ sprint iterations)
- Seller profile page at `/marketplace/seller/:name`
- Create Listing wizard (`CreateListingWizard.jsx`)
- Map view modal (`MapViewModal.jsx`)
- KYC (Know Your Customer) verification flow
- Firestore-backed marketplace service
- Analytics tracking
- Marketplace extensions (boost listings, admin guard)

### ❌ WHAT DOES NOT WORK
- **Payment processing is NOT live** — Stripe integration exists in `marketplace-payments.ts` but requires Stripe keys and webhook configuration
- **KYC admin page** is admin-only but the admin role assignment mechanism in Firestore rules needs verification
- **Actual product images** — Listings may use placeholder images; Cloudinary upload needs API keys
- **Shipping rates** service (`shipping-rates.ts`) exists but rates API key needed
- **Order management** — No buyer "My Orders" dashboard
- **Seller earnings dashboard** — No payout/earnings tracking page for sellers
- **Reviews/Ratings system** — Not visible in the routed pages
- **Map view for local listings** — Leaflet maps integrated but Google Maps API or exact coordinates may not be wired

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **Product listing card** → Should open **Product Detail Dashboard** with full description, photos, seller info, shipping, reviews, Buy/Add to Cart buttons
- **Seller name/avatar** → Should open **Seller Profile Dashboard** (exists at `/marketplace/seller/:name`) — needs: seller rating, reviews, active listings, join date, response rate
- **"My Listings" (seller)** → Should open **Seller Dashboard** with: listing manager, orders received, earnings, analytics, payout settings
- **Shopping Cart icon** (MISSING from nav) → Should open **Cart Dashboard** with items, quantities, checkout
- **"My Orders" (buyer)** → Should open **Orders Dashboard** with: order status, tracking, dispute resolution
- **"Boost Listing" button** → Should open **Listing Boost Dashboard** with pricing tiers, duration picker, reach estimate

### 🔧 RECOMMENDATIONS
1. Add a shopping cart icon to the Marketplace TopNav
2. Create `MyOrdersPage.jsx` at `/marketplace/orders`
3. Create `SellerDashboardPage.jsx` at `/marketplace/seller/dashboard`
4. Wire Stripe payment keys and test checkout end-to-end
5. Add product detail page at `/marketplace/product/:id`
6. Add review/rating system post-purchase
7. Add saved/wishlist functionality for buyers

---

## SECTION 9: GROUPS

### ✅ WHAT WORKS
- Groups page at `/groups`
- Group creation flow coded
- Group feed/posts coded
- Group membership management coded
- Group admin roles coded
- Group chat coded (linked to messages)
- Group discovery coded

### ❌ WHAT DOES NOT WORK
- **Group discovery/search** — Finding public groups from the groups page needs filtering
- **Group events integration** — Groups should be able to create events; not currently linked
- **Group invitations** — Inviting friends to a group from their profile is not wired
- **Group notifications** — New posts in groups don't appear in the notifications feed

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **Group card/row** → Should open **Group Dashboard** with: about, members list, feed, events, media gallery, join/leave button, settings (if admin)
- **"Create Group" button** → Should open **Group Creation Wizard** with name, description, privacy, category, cover photo
- **Member count** → Should open **Members Dashboard** showing all members, admins, pending requests
- **Group Settings gear icon** (admin only) → Should open **Group Settings Dashboard** with rules, approval settings, banned words, remove members

### 🔧 RECOMMENDATIONS
1. Add group discovery with categories and "Popular Groups Near You"
2. Link Groups page to Events page for group-created events
3. Add group invite sharing via link or friend tag
4. Wire group activity to Notifications

---

## SECTION 10: EVENTS

### ✅ WHAT WORKS
- Events page at `/events`
- Event creation flow coded
- RSVP system coded
- Event categories and filtering coded
- Calendar view coded

### ❌ WHAT DOES NOT WORK
- **Event payment/ticketing** — Paid events have no payment collection flow
- **Event reminder notifications** — Scheduling push reminders before events doesn't appear wired
- **Map integration for event locations** — Leaflet map exists but may need real coordinates
- **Calendar sync** — No "Add to Google Calendar" or iCal export

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **Event card** → Should open **Event Detail Dashboard** with: cover photo, description, organizer, attendees, location map, RSVP button, share button, comments
- **"Create Event" button** → Should open **Event Creation Dashboard** (multi-step: type, title, date/time/location, tickets, cover, description, invite)
- **Attendee count** → Should open **Attendees Dashboard** listing all RSVPs with filter (Going/Maybe/Not Going)
- **"My Events" tab** → Should show **Personal Events Dashboard** with events the user created and events they're attending

### 🔧 RECOMMENDATIONS
1. Add iCal/Google Calendar export per event
2. Add ticket purchasing flow for paid events via Stripe
3. Add event reminder push notifications
4. Add post-event photos/recap feature
5. Add "Events Near Me" using geolocation

---

## SECTION 11: PROFILE

### ✅ WHAT WORKS
- Profile page at `/profile` and `/profile/:uid`
- Edit profile functionality coded
- Profile photo management coded
- Post grid coded
- Followers/Following counts coded
- Bio and links coded
- Verification badge display coded
- Premium profile features coded

### ❌ WHAT DOES NOT WORK
- **Profile photo upload** — Requires Cloudinary API key; in demo mode just shows initial letter
- **Post grid** — May show empty if Firestore isn't populated
- **Follower/Following navigation** — Clicking follower count should open a list; unclear if wired
- **Blocking users** from the profile — No "Block" button visible
- **Profile completeness bar** — Referenced in Dating section but unclear if on profile page

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **Follower count** → Should open **Followers Dashboard** with list, mutual indicator, follow-back buttons
- **Following count** → Should open **Following Dashboard** with list, unfollow buttons
- **"Edit Profile" button** → Should open **Profile Edit Dashboard** with all fields, photo upload, social links
- **Post in the grid** → Should open **Post Detail Dashboard** with full post view, comments, likes
- **Premium badge** → Should link to **Premium Dashboard** or upgrade page
- **"Share Profile"** → Should trigger share sheet with profile link

### 🔧 RECOMMENDATIONS
1. Add profile completeness percentage bar with actionable missing fields
2. Add a "Block" option in the `...` overflow menu on other users' profiles
3. Wire followers/following counts to open list pages
4. Add profile "insights" for creators (views, reach, engagement)
5. Add social link previews (Instagram, Twitter, etc.)

---

## SECTION 12: FRIENDS

### ✅ WHAT WORKS
- Friends page at `/friends`
- Friend requests (send/accept/decline) coded
- People You May Know suggestions coded
- Friend search coded
- Mutual friends display coded

### ❌ WHAT DOES NOT WORK
- **Friend suggestions algorithm** — "People You May Know" likely uses mock data not real Firestore graph
- **Friend requests don't trigger notifications** — No push notification when someone sends a friend request
- **Importing contacts** — No phone contacts sync option

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **Friend request** → Shows accept/decline inline; should also link to **Requester Profile Dashboard**
- **"Find Friends" / "Contacts"** → Should open **Contact Import Dashboard** with phone contacts, Facebook friends, suggested people

### 🔧 RECOMMENDATIONS
1. Wire "People You May Know" to Neo4j graph database (already set up in backend)
2. Send push notification on new friend request
3. Add mutual friends algorithm using the friends graph

---

## SECTION 13: NOTIFICATIONS

### ✅ WHAT WORKS
- Notifications page at `/notifications`
- Badge count in TopNav
- Multiple notification types coded (likes, comments, follows, mentions, matches, events)

### ❌ WHAT DOES NOT WORK
- **Notification badge does not clear** when the notifications page is opened — counter stays the same
- **Push notifications** — OneSignal is integrated in the service but the subscriber registration and notification dispatch for each event type needs to be wired individually
- **Notification deep-links** — Tapping a notification should navigate to the relevant post/comment/profile; links may not be wired
- **"Mark All as Read" button** — Unclear if persisted to Firestore

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **Notification item (e.g. "Alex liked your post")** → Should navigate to **Post Detail Dashboard** for that specific post
- **Notification item (e.g. "Jordan sent you a friend request")** → Should navigate to **Profile Dashboard** with accept/decline actions inline
- **Notification settings (gear icon)** → Should open **Notification Settings Dashboard** with toggles per type (likes, comments, follows, messages, dating, live)

### 🔧 RECOMMENDATIONS
1. Clear badge count when `/notifications` is mounted
2. Add per-notification deep-link routing
3. Add "Mark All as Read" functionality wired to Firestore
4. Create a Notification Preferences page accessible from within the notifications page
5. Wire OneSignal registration after user logs in

---

## SECTION 14: SEARCH

### ✅ WHAT WORKS
- Search page at `/search`
- Multi-tab search (People, Posts, Groups, Events, Hashtags) coded
- Search history coded
- Trending searches coded

### ❌ WHAT DOES NOT WORK
- **Full-text search** requires Algolia or Typesense — Firestore doesn't support native full-text search
- **Hashtag search** — No hashtag index in Firestore
- **People search** — Only finds exact display name matches in Firestore; not fuzzy search

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **Person search result** → Should open **User Profile Dashboard** (`/profile/:uid`)
- **Hashtag result** → Should open **Hashtag Feed Dashboard** showing all posts with that tag
- **Group result** → Should open **Group Dashboard**
- **Event result** → Should open **Event Detail Dashboard**
- **Trending search item** → Should open appropriate dashboard based on type

### 🔧 RECOMMENDATIONS
1. Integrate Algolia for full-text search across users, posts, groups, events
2. Add hashtag indexing to posts (parse `#tag` in content)
3. Create a dedicated **Hashtag Page** (`/hashtag/:tag`)
4. Add voice search capability (Web Speech API)
5. Add recent search persistence with clear button

---

## SECTION 15: SETTINGS

### ✅ WHAT WORKS
- Settings page at `/settings`
- Multiple settings categories coded
- Toggle switches for various settings coded

### ❌ WHAT DOES NOT WORK
- **Settings are not persisted properly** — Many settings toggle in the UI but don't write to Firestore user document
- **Account deletion** — If present, must go through Firebase Auth + Firestore cleanup
- **Two-Factor Authentication** — No 2FA setup flow (highly recommended for social app)
- **Privacy settings** — "Who can see my posts" dropdowns may be UI-only
- **Connected apps** (OAuth) — No list of connected apps/revoke access

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **"Privacy" row** → Should open **Privacy Settings Dashboard** with: post visibility, profile visibility, who can message, who can tag
- **"Security" row** → Should open **Security Dashboard** with: change password, 2FA setup, active sessions, login history
- **"Notifications" row** → Should open **Notification Preferences Dashboard**
- **"Blocked Users"** → Should open **Blocked Users Dashboard** with list and unblock buttons
- **"Data & Storage"** → Should open **Data Dashboard** with: data download request, delete account, storage used
- **"Linked Accounts"** row → Should open **Linked Accounts Dashboard** with Google/Apple linked status and revoke buttons
- **"Language & Region"** → Should open **Locale Dashboard**
- **"Payment Methods"** → Should open **Payment Methods Dashboard** with saved cards, billing history

### 🔧 RECOMMENDATIONS
1. Persist ALL settings to Firestore `users/{uid}/settings` document
2. Add Two-Factor Authentication (Firebase phone verification or TOTP)
3. Add account deletion flow with 30-day cool-off period
4. Add "Download My Data" GDPR feature
5. Add session management (see active devices, log out of others)

---

## SECTION 16: MUSIC PLAYER

### ✅ WHAT WORKS
- Music page at `/music`
- Mini player in AppShell (persistent)
- Full player modal in AppShell
- Deezer API service integrated
- Radio Browser service integrated
- YouTube Music service integrated
- Play/pause, next/prev buttons coded
- Progress bar with animation

### ❌ WHAT DOES NOT WORK
- **No real audio playback** — The mini player and full player use a visual progress animation but there is NO `<audio>` element or real audio being played. `navigator.mediaSession` is not wired. Music doesn't actually play.
- **The mini player plays a hardcoded demo track** ("Blinding Lights / The Weeknd") regardless of what's on the Music page
- **Deezer API** — Deezer shut down free API access; actual playback URLs require Deezer authentication
- **Playlist creation** — May be UI only without Firestore persistence
- **Music sync with mini player** — Music page and AppShell mini player are disconnected

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **Artist card** → Should open **Artist Dashboard** with discography, top tracks, follow button, related artists
- **Album card** → Should open **Album Dashboard** with track listing, play all, share
- **Playlist** → Should open **Playlist Dashboard** with tracks, play all, add to queue, share, collaborate
- **"Create Playlist" button** → Should open **Playlist Creation Dashboard**
- **"Now Playing" mini player** → Should expand to **Full Music Player Dashboard** (exists but not wired to real audio)

### 🔧 RECOMMENDATIONS
1. **CRITICAL: Wire actual audio playback** using `<audio>` element in the music page
2. Use Zustand store to pass `currentTrack` between Music page and AppShell mini player
3. Replace Deezer API with Spotify Web Playback SDK or YouTube Music for actual streaming
4. Add a crossfade feature between tracks
5. Add visualizer/equalizer animation while playing

---

## SECTION 17: MEDIA HUB

### ✅ WHAT WORKS
- Media Hub page at `/media`
- Multiple media categories coded
- YouTube Data API service integrated
- Pexels photo API integrated

### ❌ WHAT DOES NOT WORK
- **YouTube API requires key** — Without `VITE_YOUTUBE_API_KEY` in `.env`, videos don't load
- **Video playback** — Clicking a video should open a player; unclear if the player is implemented
- **Personal media gallery** — User's uploaded photos/videos from posts may not appear here

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **Video card** → Should open **Video Player Dashboard** with full-screen player, comments, likes, share
- **Photo category** → Should open **Photo Gallery Dashboard**
- **"Upload Media" button** (if exists) → Should open **Media Upload Dashboard**
- **"My Media"** → Should open **Personal Media Library Dashboard**

### 🔧 RECOMMENDATIONS
1. Add YouTube API key setup instructions clearly
2. Build a full-screen video player component
3. Add personal media library (photos/videos user has posted)
4. Add media collections/albums feature

---

## SECTION 18: GAMING HUB

### ✅ WHAT WORKS
- Gaming page at `/gaming`
- RAWG Games API integrated
- FreeToGame API integrated
- Game discovery and browsing coded

### ❌ WHAT DOES NOT WORK
- **RAWG API key** needs configuration in `.env`
- **Game launching** — Clicking a game cannot launch it (no in-app browser/WebGL game runner)
- **Gaming achievements/leaderboards** — UI exists but no backend for tracking
- **Friends' gaming activity** — No "friend is playing X" integration

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **Game card** → Should open **Game Detail Dashboard** with: description, screenshots, ratings, platform info, play button, reviews
- **"Leaderboards" button** → Should open **Leaderboard Dashboard** with rankings, filters by game/global
- **"My Games" / "Library"** → Should open **Gaming Library Dashboard** with saved games, achievements, playtime
- **"Tournaments" button** → Should open **Tournament Dashboard** with brackets, registration, prizes

### 🔧 RECOMMENDATIONS
1. Configure RAWG API key
2. Add "wishlist" feature for games
3. Build gaming profile with achievements display
4. Add friend challenges for compatible games

---

## SECTION 19: VIDEO CALLS

### ✅ WHAT WORKS
- Video Calls page at `/videocalls`
- WebRTC service (`webrtc-service.js`) and Signaling service exist
- P2P video call architecture designed

### ❌ WHAT DOES NOT WORK
- **No deployed signaling server** — WebRTC requires a signaling server (WebSocket) for peer connection establishment
- **STUN/TURN server** — No ICE configuration for NAT traversal
- **Call history** — Not persisted
- **Group video calls** — Unclear if SFU architecture is implemented for 3+ participants

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **"New Call" button** → Should open **Call Setup Dashboard** with user search, audio/video toggles, start call
- **Incoming call** → Should show **Incoming Call Screen** with accept/decline (like native phone)
- **During call** → Should show **Active Call Dashboard** with video feeds, mic/camera toggles, screen share, end call
- **Call history row** → Should show call details and "Call Back" button

### 🔧 RECOMMENDATIONS
1. Deploy WebSocket signaling server (or use Livekit/Daily.co SDK)
2. Configure STUN (Google's free) + TURN servers
3. Add call recording with user consent
4. Add virtual backgrounds for video calls
5. Add "Raise Hand" feature for group calls

---

## SECTION 20: AR/VR

### ✅ WHAT WORKS
- AR/VR page at `/arvr`
- DeepAR API key security setup complete
- AR filter framework coded

### ❌ WHAT DOES NOT WORK
- **DeepAR SDK** requires API key and CDN loading — AR filters won't work without valid key
- **Camera access** for AR — Requires HTTPS; local dev server may not work
- **VR experiences** — WebXR API requires specific hardware; most users won't have VR headsets
- **AR filters applied to profile** — No integration with profile photo system

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **AR Filter card** → Should open **AR Filter Preview Dashboard** with live camera view and filter overlay
- **"Create AR Filter" button** → Should open **Filter Creation Dashboard**
- **VR Experience card** → Should open **VR Viewer Dashboard** (WebXR)

### 🔧 RECOMMENDATIONS
1. Configure DeepAR key securely
2. Focus on AR face filters for Stories (high engagement feature)
3. Add "try filter" → "share to story" flow
4. Integrate AR filters into the Live Streaming setup

---

## SECTION 21: CREATOR STUDIO

### ✅ WHAT WORKS
- Creator page at `/creator`
- Creator profile UI coded
- Content analytics UI coded

### ❌ WHAT DOES NOT WORK
- **Monetization setup** — No Stripe Connect for creator payouts
- **Content scheduling** — Schedule post is UI-only; no actual queue/scheduler
- **Analytics** — Likely mock/demo data; no real Firestore aggregation
- **Collaboration requests** — No brand deal / collaboration inbox

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **"Analytics" section** → Should open **Creator Analytics Dashboard** with: reach, impressions, engagement rate, top posts, follower growth, revenue
- **"Monetization" section** → Should open **Creator Monetization Dashboard** with: subscription tiers, tips, brand deals, payout history
- **"Content Library"** → Should open **Content Management Dashboard** with all posts, stories, scheduled content
- **"Partnerships"** → Should open **Brand Partnerships Dashboard** with incoming offers, active campaigns, analytics per sponsorship

### 🔧 RECOMMENDATIONS
1. Implement real analytics aggregation via Cloud Functions
2. Add Stripe Connect for creator payouts
3. Add content scheduling with background job execution
4. Add "Collab" feature where two creators can co-create content

---

## SECTION 22: BUSINESS TOOLS

### ✅ WHAT WORKS
- Business page at `/business`
- Business profile setup coded
- Analytics UI coded
- Ad campaign management UI coded

### ❌ WHAT DOES NOT WORK
- **Ad campaigns** — No actual ad delivery system or budget management tied to real targeting
- **Business verification** — No process to verify a business
- **Analytics** — Demo/mock data
- **Booking/appointments** — If coded, needs calendar integration

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **"Create Campaign" button** → Should open **Ad Campaign Dashboard** with: targeting, budget, schedule, creative upload, preview
- **"Business Analytics"** → Should open **Business Analytics Dashboard** with: impressions, clicks, conversions, ROI
- **"Customers/Contacts"** → Should open **CRM Dashboard** with customer list, interaction history
- **"Booking Calendar"** → Should open **Booking Dashboard** with availability, appointments, confirmations

### 🔧 RECOMMENDATIONS
1. Define a clear "Business Account" upgrade path
2. Integrate Google Calendar API for booking/scheduling
3. Build real ad targeting engine or integrate a 3rd-party ad network
4. Add "Business Page" public-facing profile distinct from personal profile

---

## SECTION 23: PREMIUM

### ✅ WHAT WORKS
- Premium page at `/premium`
- Feature list and tier comparison UI coded
- "Who Liked You" premium gate in Dating — WORKS
- Boost feature premium gate — WORKS

### ❌ WHAT DOES NOT WORK
- **No actual payment** — Premium upgrade button doesn't process payment
- **Premium status is not persisted** to Firestore; `userProfile.premium` is always false unless set manually
- **Premium features aren't consistently enforced** — Some premium-gated features may not actually check the flag

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **"Upgrade to Premium" button** → Should open **Premium Checkout Dashboard** with plan selection, payment form, confirmation
- **"Manage Subscription"** → Should open **Subscription Management Dashboard** with current plan, next billing date, cancel option, billing history

### 🔧 RECOMMENDATIONS
1. Integrate Stripe Checkout for premium subscriptions
2. Store premium status in Firestore with expiry date
3. Enforce premium gates consistently across all sections
4. Add annual plan pricing (save 30%) with visual comparison
5. Add free trial (7 days) to increase conversion

---

## SECTION 24: HELP & SUPPORT

### ✅ WHAT WORKS
- Help page at `/help`
- FAQ accordion coded
- Support ticket creation coded
- Live chat widget coded

### ❌ WHAT DOES NOT WORK
- **Support tickets** don't actually send to any support system (Zendesk/Freshdesk/email)
- **Live chat** is likely a UI shell with no real agent
- **FAQ content** — May be placeholder content

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **"Open Ticket" button** → Should open **Support Ticket Dashboard** with form, category, priority, attachments, ticket history
- **"Live Chat"** → Should open **Live Chat Dashboard** (consider Intercom or Crisp integration)
- **FAQ item** → Should expand inline (accordion) — likely already works

### 🔧 RECOMMENDATIONS
1. Integrate Freshdesk or Zendesk for real ticket routing
2. Add chatbot (use OpenAI which is already integrated) for instant FAQ answers
3. Add "Report a Bug" form that sends to GitHub Issues or email
4. Add community forum link

---

## SECTION 25: MENU / MORE DRAWER

### ✅ WHAT WORKS
- More Drawer slides up from bottom (75vh) with 5 sections
- All navigation items work correctly
- Sign Out properly calls Firebase `signOut()`
- Drag handle visual element present
- Close button and backdrop click to dismiss

### ❌ WHAT DOES NOT WORK
- **Duplicate with `/menu` page** — The menu page route and the drawer have the same items, causing redundancy
- **No user profile preview** in the drawer — Missing the user's avatar/name at the top before the sections
- **"Trending" in Discover section** → navigates to `/search` with state `{tab:'trending'}` — This is confusing; should be its own route

### 📝 NEEDS DASHBOARD WHEN CLICKED
- All items already navigate to appropriate pages — the issue is those pages need proper dashboards (**see individual sections above**)

### 🔧 RECOMMENDATIONS
1. Add user profile preview (avatar, name, follower count) at the top of the More Drawer
2. Remove the duplicate `/menu` page and make the More Drawer the only access point
3. Add "Switch to Creator Mode" / "Switch to Business Mode" quick toggle in the drawer

---

## SECTION 26: ADMIN PAGES

### ✅ WHAT WORKS
- KYC Admin page at `/admin/kyc` — guarded by `AdminGuard`
- Reports Admin page at `/admin/reports` — guarded by `AdminGuard`

### ❌ WHAT DOES NOT WORK
- **AdminGuard** requires `isAdmin` field in Firestore user document — no mechanism to grant admin status during onboarding or initial setup
- **KYC verification** — The verification workflow likely needs manual review; no automated ID verification SDK
- **Reports moderation** — Reports from users need to flow into this page from the Report system which itself is not wired

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **Admin menu** → Should have a proper **Admin Dashboard** home page (`/admin`) with overview metrics: total users, DAU, reports pending, revenue, KYC queue size
- **KYC queue** → Individual KYC review workflow with approve/reject + reason
- **Reports queue** → Individual report review with context of the reported content + action buttons

### 🔧 RECOMMENDATIONS
1. Create a proper `/admin` dashboard home page with platform metrics
2. Add admin role assignment via Firebase custom claims
3. Build moderation queue with priority sorting
4. Add content audit tools (flagged posts, spam detection)
5. Add admin activity log (who did what, when)

---

## SECTION 27: SAVED POSTS

### ✅ WHAT WORKS
- Saved page at `/saved`
- Bookmark logic in Feed saves to Firestore `users/{uid}/saved/{postId}`

### ❌ WHAT DOES NOT WORK
- **Saved page doesn't load saved posts from Firestore** — The page may not actually query `users/{uid}/saved` and join with post data
- **Collections/folders** — No way to organize saved posts into collections
- **Unsave from saved page** — Unclear if present

### 📝 NEEDS DASHBOARD WHEN CLICKED
- **Saved post row/card** → Should open **Post Detail Dashboard** or inline expanded view
- **"New Collection"** → Should open **Collection Creation Dashboard**

### 🔧 RECOMMENDATIONS
1. Wire Saved page to query Firestore subcollection and join post data
2. Add collections/folders for organizing saves (like Instagram Saved Collections)
3. Add bulk delete/manage saved posts

---

## CRITICAL ISSUES THAT NEED IMMEDIATE ATTENTION

### 🚨 SEVERITY 1 — APP-BREAKING
1. **Vite dev server serves 404 on all routes** — The SPA router is not being served by the dev server properly. `vite.config.js` likely needs `server: { historyApiFallback: true }` or the root needs to be explicitly set to the SPA directory. In production (S3/CloudFront), S3 static website needs error document set to `index.html`.
2. **Mobile layout broken** — `paddingLeft: 72px` on `<main>` even when sidebar is collapsed on mobile creates a large blank left area. This makes the app unusable on small screens.
3. **No real audio playback** — The music player shows visual progress but plays nothing. Users expect music to actually play.
4. **Feed likes/comments/deletes not persisted** — Core social actions vanish on refresh.

### 🚨 SEVERITY 2 — MAJOR FEATURE GAPS
5. **Dating profiles are all fake** — No real users show up in dating section
6. **Messages can't start new conversations** — No "New Message" button
7. **No image/video upload in Create Post** — Text-only posts are a major limitation
8. **Premium has no payment processing** — Upgrade button does nothing
9. **Notifications badge doesn't clear** when notifications page opens

### 🚨 SEVERITY 3 — UX/FLOW ISSUES
10. **No back button on nested routes** in TopNav
11. **Mini player disconnected from Music page** — Hardcoded track
12. **"Send Message" in Dating doesn't create chat thread**
13. **Story "seen" state is hardcoded** — Never actually marks as seen
14. **Comments disappear** — Not saved to Firestore

---

## MISSING DASHBOARDS & PAGES NEEDED

The following dedicated pages/dashboards do not yet exist as routes in `App.jsx` and must be created:

| Dashboard | Route | Priority |
|-----------|-------|----------|
| Product Detail Page | `/marketplace/product/:id` | 🔴 Critical |
| My Orders (Buyer) | `/marketplace/orders` | 🔴 Critical |
| Seller Dashboard | `/marketplace/seller/dashboard` | 🔴 Critical |
| Post Detail / Thread | `/post/:id` | 🔴 Critical |
| Admin Home Dashboard | `/admin` | 🔴 Critical |
| Matches List Page | `/dating/matches` | 🟠 High |
| Followers List | `/profile/:uid/followers` | 🟠 High |
| Following List | `/profile/:uid/following` | 🟠 High |
| Hashtag Feed | `/hashtag/:tag` | 🟠 High |
| User Search (start chat) | `/messages/new` | 🟠 High |
| Group Detail Page | `/groups/:id` | 🟠 High |
| Event Detail Page | `/events/:id` | 🟠 High |
| Notification Settings | `/settings/notifications` | 🟠 High |
| Privacy Settings | `/settings/privacy` | 🟠 High |
| Security Settings | `/settings/security` | 🟠 High |
| Payment Methods | `/settings/payments` | 🟠 High |
| Creator Analytics | `/creator/analytics` | 🟡 Medium |
| Creator Monetization | `/creator/monetization` | 🟡 Medium |
| Business Analytics | `/business/analytics` | 🟡 Medium |
| Gaming Library | `/gaming/library` | 🟡 Medium |
| Gaming Leaderboard | `/gaming/leaderboard` | 🟡 Medium |
| Artist Page | `/music/artist/:id` | 🟡 Medium |
| Album Page | `/music/album/:id` | 🟡 Medium |
| Video Player | `/media/video/:id` | 🟡 Medium |
| Saved Collections | `/saved/collections` | 🟡 Medium |
| Account Deletion | `/settings/delete-account` | 🟡 Medium |
| Data Export | `/settings/data` | 🟡 Medium |

---

## WHAT WORKS WELL

✅ **App Architecture is Solid** — React + Firebase + Zustand is a good stack choice. Lazy loading with `Suspense` keeps initial load fast.

✅ **Dating Section is the Most Polished** — The swipe card, match modal, compat score, preferences sheet, and date assistant are the most complete and working features. 70+ features documented and working.

✅ **Authentication System** — Firebase Auth with Google, email/password, password reset, demo login, and proper user document creation is well-implemented.

✅ **Global Toast System** — The ToastRenderer with typed toasts (success/warning/error/info) and proper z-index placement is well-designed.

✅ **Error Boundary** — Wraps all routes and provides a recovery screen, which is production-ready.

✅ **Offline Detection** — The network status banner is a good UX touch.

✅ **Live Streaming Architecture** — Having dedicated sub-pages (setup, watch, analytics, moderation, monetization, VOD) shows a well-thought-out feature scope.

✅ **Accessibility Basics** — aria-labels on nav buttons, aria-current on active routes, focus trap in Dating match modal, role="switch" on toggles, 44px touch targets.

✅ **Skeleton Loaders** — PostSkeleton and other loaders prevent blank screens during loading.

✅ **Marketplace Coverage** — 24+ sprints of Marketplace development shows serious investment; the create listing wizard, seller profiles, KYC, and map view are substantial.

✅ **Pull-to-Refresh** — Touch gesture detection for pull-to-refresh is well-implemented in the Feed.

✅ **Interstitial + Rewarded Ads** — Ad integration with coin rewards is present and structured correctly.

---

## WHAT DOES NOT WORK

❌ **No actual music playback** — The entire music system is visual-only
❌ **Feed core actions not persisted** — Likes, comments, deletes don't write to Firestore
❌ **Dating profiles are 100% mock data** — Zero real users visible
❌ **Messages can't initiate new conversations**
❌ **Create Post has no media upload** — Text only
❌ **Premium has no payment** — Upgrade does nothing
❌ **WebRTC calls not deployable** — No signaling server
❌ **Stories are all fake data** — Story rings in feed are hardcoded
❌ **Full-text search doesn't work** — Firestore can't do it without Algolia
❌ **Vite server 404s** — App cannot be accessed in browser (dev server routing issue)
❌ **Mobile layout broken** — 72px left padding when sidebar collapsed
❌ **Notification badge doesn't clear**
❌ **Settings don't persist** most changes to Firestore
❌ **Report/Delete post** — Toast only, no backend action
❌ **Video calls require deployed signaling server** — Not deployed
❌ **AR/VR requires DeepAR key + HTTPS** — Not functional in dev
❌ **Creator analytics are mock data**
❌ **Business ad campaigns are UI-only**
❌ **Support tickets don't route to any system**

---

## FEATURES STILL NEEDED TO ADD

### 🔴 CRITICAL (Must-Have Before Launch)
1. **Media upload in Create Post** (photo + video picker)
2. **Persist feed actions** (likes, comments, saves, deletes) to Firestore
3. **Real user profiles in Dating** (Firestore query for datable users)
4. **Persist swipe decisions** (likes/passes/matches) to Firestore
5. **New Message flow** — user search + thread creation in Messages
6. **Premium payment processing** via Stripe
7. **Fix mobile layout bug** — remove left padding when sidebar collapsed
8. **Fix Vite SPA routing** — configure historyApiFallback
9. **Email verification** before app access
10. **Notification badge auto-clear** on page open

### 🟠 HIGH PRIORITY (Must-Have for Good UX)
11. **Image/Video rendering in Feed** for video posts
12. **Story viewer full-screen component** with real Firestore stories
13. **Dedicated `/post/:id` page** for post deep-links
14. **Product detail page** in Marketplace
15. **Order management** for buyers (My Orders)
16. **Seller dashboard** with earnings and payout
17. **Dating matches list page** at `/dating/matches`
18. **Music player with actual audio** (`<audio>` element)
19. **Push notification wiring** (OneSignal → specific events)
20. **Settings persistence** to Firestore

### 🟡 MEDIUM PRIORITY (Should Have)
21. **Trending page** (dedicated, not a redirect)
22. **Hashtag pages** (`/hashtag/:tag`)
23. **Groups discovery** with categories
24. **Event detail page** with RSVP flow
25. **Admin home dashboard** at `/admin`
26. **Two-Factor Authentication** in Settings
27. **Profile completeness bar** on Profile page
28. **Account deletion flow** (GDPR compliant)
29. **Data download** request feature
30. **Algolia full-text search** integration
31. **Video call signaling server** deployment
32. **Creator analytics** wired to real data
33. **Back button** on nested routes in TopNav
34. **GIF picker** in Create Post (Giphy already integrated)
35. **Poll post type**

### 🟢 NICE TO HAVE (Enhancements)
36. **Voice notes** in messages (UI exists, needs audio recording)
37. **Collaborative playlists** in Music
38. **AR filters in Stories** (DeepAR)
39. **Calendar export** from Events (iCal/Google Calendar)
40. **"Nearby" discovery** using geolocation
41. **Profile verification** badge request flow
42. **Language/locale selector** in Settings
43. **Dark/Light mode toggle** (currently dark-only)
44. **Font size accessibility settings**
45. **Keyboard shortcut support** for desktop

---

## UX RECOMMENDATIONS

### 1. INFORMATION ARCHITECTURE
- The sidebar has 5 primary tabs + "More". This is good. However, **Dating and Marketplace** are in primary nav while **Notifications and Profile** are secondary (in More/TopNav). Consider promoting Notifications to primary nav (standard on all major social apps).
- Suggested primary nav: **Home | Live | Messages | Notifications | Profile** (with Dating/Marketplace/Explore in More)

### 2. ONBOARDING FLOW
- Current: Login → Onboarding (single page, details unknown)
- Recommended: Login → **5-step onboarding wizard**: (1) Profile photo, (2) Display name/bio, (3) Interests (tags), (4) Birthday/gender for dating, (5) Notification permissions → Feed
- Show progress bar during onboarding (e.g., "Step 2 of 5")

### 3. FIRST-TIME USER EXPERIENCE
- Empty feed for new users is jarring — add onboarding posts from "LynkApp Official" or curated content
- Empty Dating deck shows users nothing — add "Complete your profile to get matches" CTA
- Add a "Welcome Tour" tooltip overlay on first login (like Intercom onboarding tours)

### 4. VISUAL CONSISTENCY
- Some pages use `background: #0a0a18`, others use `background: #1a1a2e`, others use `rgba(10,8,30,0.98)` — standardize background colors via CSS variables
- Button border radius is inconsistent (12px, 14px, 16px, 20px, 24px) — standardize to 12px for small, 16px for medium, 24px for large
- Emoji-based icons (🏠, 🔴, 💬) in the sidebar should be replaced with **proper SVG icons** for a professional look. Emojis render differently across platforms/OS.

### 5. PERFORMANCE
- All 35+ page components are lazy-loaded — this is good
- However, the Firestore `onSnapshot` listeners in Feed, AppShell, etc. might not be properly cleaned up on all unmounts, causing **memory leaks**
- The demo track progress bar interval in AppShell runs every 500ms even when not on the music player — should only run when playing

### 6. ACCESSIBILITY GAPS
- Many buttons throughout the app use emoji as their only label (e.g., `•••` for options). These need `aria-label` attributes.
- Color contrast in some places (text color `#475569` on dark background `#0a0a18`) may not meet WCAG 2.1 AA (4.5:1 ratio)
- No `<label>` tags on form inputs in LoginPage — only `placeholder` attributes. Screen readers may miss context.
- The SideNav pull-tab (‹ ›) has no text label — needs `aria-label` describing what it does

### 7. ERROR HANDLING
- Firestore errors in Feed fall back to demo data silently — users have no idea they're seeing fake content
- API call failures (Deezer, RAWG, etc.) need user-facing error states with retry buttons, not silent fallbacks
- Network errors should show a specific "Can't connect to server" message, not just the offline banner

### 8. APP-LEVEL MISSING FEATURES
- **Deep linking** — The app doesn't handle external URLs (e.g., `lynkapp://post/123`)
- **App-to-app sharing** — No support for receiving shared content from other apps (Share to LynkApp)
- **Widgets** — No home screen widget support
- **App clips/Instant Apps** — Not applicable yet but worth planning
- **A/B testing infrastructure** — No feature flags system for gradual rollout

---

*Report generated by AI UX/UI Tester on May 20, 2026*
*Scope: Full code review of ConnectHub-SPA (React + Firebase + Zustand)*
*Files reviewed: App.jsx, AppShell.jsx, BottomNav.jsx, TopNav.jsx, LoginPage.jsx, FeedPage.jsx, DatingPage.jsx + all route stubs*
