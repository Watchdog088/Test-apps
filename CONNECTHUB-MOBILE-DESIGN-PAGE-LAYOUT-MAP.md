# 📐 ConnectHub_Mobile_Design.html — Complete Page Layout Map
## Exactly where everything lives in the file

---

## 🗂️ FILE OVERVIEW
- **File:** `ConnectHub_Mobile_Design.html`
- **Total lines:** 21,210
- **Single file app** — all CSS, HTML, and JavaScript in one file
- **Lines 1 – 2080:** All CSS styles (`<style>` block inside `<head>`)
- **Lines 2081 – ~21,100:** HTML body (all screens stacked one after another)
- **Lines ~18,000 – 21,210:** All JavaScript (`<script>` block at bottom of `<body>`)

---

## 📋 TOP-LEVEL FILE STRUCTURE (Line Numbers)

```
LINE 1         ← <!DOCTYPE html>
LINE 3         ← <head>  (starts)
LINE 7         ← <style> (CSS block starts)
               │
               │  All CSS is here — theme variables, layouts, every screen's styles
               │
LINE ~2080     ← </style> + </head>
═══════════════════════════════════════════════════════════
LINE 2081      ← <body>  (HTML content starts)
               │
               ├── LINE 2081    SPLASH SCREEN
               ├── LINE 2462    LOGIN SCREEN
               ├── LINE 2586    MAIN APP CONTAINER  ← everything inside here
               │       ├── LINE 2589    TOP NAVIGATION
               │       ├── LINE 2618    PILL NAVIGATION BAR
               │       ├── LINE 2632    MAIN CONTENT AREA (all screens stacked)
               │       │       ├── SECTION  1: Feed        (line 2633)
               │       │       ├── SECTION  2: Stories     (line 2708)
               │       │       ├── SECTION  3: Live        (line 2774)
               │       │       ├── SECTION  4: Trending    (line 2824)
               │       │       ├── SECTION  5: Groups      (line 2883)
               │       │       ├── SECTION  6: Friends     (line 2946)
               │       │       ├── SECTION  7: Saved       (~line 3100)
               │       │       ├── SECTION  8: Events      (~line 3200)
               │       │       ├── SECTION  9: Gaming      (~line 3400)
               │       │       ├── SECTION 10: Messages    (~line 3600)
               │       │       ├── SECTION 11: Dating      (~line 4200)
               │       │       ├── SECTION 12: Search      (~line 5000)
               │       │       ├── SECTION 13: Notifications (~line 5300)
               │       │       ├── SECTION 14: Profile     (~line 5500)
               │       │       ├── SECTION 15: Marketplace (~line 6000)
               │       │       ├── SECTION 16: Media Hub   (~line 7000)
               │       │       ├── SECTION 17: Music Player (~line 8000)
               │       │       ├── SECTION 18: Video Calls (~line 9000)
               │       │       ├── SECTION 19: AR / VR     (~line 10000)
               │       │       ├── SECTION 20: Business Profile (~line 11000)
               │       │       ├── SECTION 21: Creator Profile  (~line 12000)
               │       │       ├── SECTION 22: Premium Profile  (~line 13000)
               │       │       ├── SECTION 23: Settings    (~line 14000)
               │       │       ├── SECTION 24: Help & Support (~line 15000)
               │       │       ├── SECTION 25: Menu/Sidebar (~line 16000)
               │       │       └── All MODALS & OVERLAYS   (~line 16500+)
               │       └── (closing divs for app-container)
               │
LINE ~18,000   ← <script> (ALL JavaScript starts here)
LINE 21,210    ← </body></html>
```

---

## LAYER 1 — SPLASH SCREEN (Lines 2081–2460)

**What it is:** The very first thing the user sees when the app loads.  
**HTML element:** `<div class="splash-screen" id="splashScreen">`  
**Position:** `fixed`, covers 100% of screen, `z-index: 9999` (on top of everything)

```
┌─────────────────────────────┐
│                             │  ← background: dark gradient
│                             │
│           🔗                │  ← .splash-logo (140x140px, glowing icon)
│         Lynkapp             │  ← .splash-app-name (48px gradient text)
│   Connect • Share • Discover│  ← .splash-tagline
│                             │
│           ⟳                 │  ← .splash-loader (spinning circle)
│                             │
│       Version 2.5.1         │  ← .splash-version (bottom)
└─────────────────────────────┘
```

**How it disappears:** A `setTimeout` of 3 seconds adds class `fade-out`, then hides it and shows the login screen.

---

## LAYER 2 — LOGIN SCREEN (Lines 2462–2585)

**HTML element:** `<div class="login-container hidden" id="loginScreen">`  
**Position:** Normal flow, `max-width: 480px`, centered, `min-height: 100vh`  
**Hidden by default** — the splash screen's timer reveals it.

```
┌─────────────────────────────┐
│  🔗  Lynkapp                │  ← .login-logo-section
│  Connect • Share • Discover │     - .login-logo-box (100x100px icon)
│                             │     - .login-app-name
│                             │     - .login-tagline
├─────────────────────────────┤
│  [ Sign In ] [ Sign Up ]    │  ← .login-tabs (pill toggle)
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │ Email address         │  │  ← #loginEmail input
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Password              │  │  ← #loginPassword input
│  └───────────────────────┘  │
│                             │
│  ┌─ Error message ──────┐   │  ← #loginErrorMsg (hidden by default)
│                             │
│  ┌───────────────────────┐  │
│  │       Sign In         │  │  ← .login-button → handleLogin()
│  └───────────────────────┘  │
│                             │
│  ── or continue with ──     │  ← .social-login divider
│                             │
│  [🌐 Google] [FB] [Apple]   │  ← Social login buttons
│                             │
│  Don't have account? Sign up│  ← .login-footer
└─────────────────────────────┘

REGISTER FORM (same position, toggled by tabs):
  - Full Name input
  - Email input
  - Password input
  - Confirm Password input
  - Date of Birth
  - ☐ Enable Dating Features
  - [ Create Account ] button
```

---

## LAYER 3 — MAIN APP CONTAINER (Line 2587 onward)

**HTML element:** `<div class="app-container">`  
**Hidden by default** — JavaScript shows it after successful login.

### 3A. TOP NAVIGATION BAR (Lines 2589–2617)
**HTML element:** `<div class="top-nav">`  
**Position:** Fixed at the very top of the screen.

```
┌─────────────────────────────────────────────────────┐
│  🔗 Lynkapp ✨  │  👤  ➕  🔍  🔔  ☰              │
│  .nav-logo      │  .nav-actions                      │
│                 │  (Avatar)(Create)(Search)(Bell)(Menu)│
└─────────────────────────────────────────────────────┘

nav-actions buttons (left to right):
  👤  → authOnboarding.showLoginScreen()
  ➕  → openModal('createNew')
  🔍  → openModal('searchModal')
  🔔  → openScreen('notifications')    ← has red badge for unread count
  ☰   → openScreen('menu')
```

### 3B. PILL-SHAPED NAVIGATION BAR (Lines 2618–2631)
**HTML element:** `<div class="pill-nav">` (or similar)  
**Position:** Below the top nav, horizontal scrolling pill tabs.

```
┌──────────────────────────────────────────────────────────────────┐
│  [🏠 Feed] [📖 Stories] [🔴 Live] [🔥 Trending] [👥 Groups] ... │
└──────────────────────────────────────────────────────────────────┘
  Each pill calls: switchBottomTab('feed'), switchBottomTab('stories'), etc.
```

---

## LAYER 4 — ALL CONTENT SCREENS (inside app-container)

All screens are stacked at the same position. **Only one is visible at a time** — the `.active` class on `.screen` makes it visible, all others are `display:none`.

---

### SECTION 1 — FEED SCREEN (Line 2633)
**HTML id:** `feed-screen`  **Default class:** `screen active` (first visible screen)

```
┌─────────────────────────────┐
│ [TOP NAV]                   │
│ [PILL NAV]                  │
├─────────────────────────────┤
│ ┌──────────────────────┐    │  ← Create Post box
│ │ 👤 What's on your mind? │  │
│ │ [📷 Photo] [📹 Video]│    │
│ └──────────────────────┘    │
├─────────────────────────────┤
│ ┌──────────────────────┐    │  ← .post-card #1
│ │ 👤 [User Name]  ⋯   │    │    - .post-header (avatar, name, time)
│ │ Just now • 🌍 Public │    │    - .post-content (text)
│ │                       │   │    - .post-image (media)
│ │ [Post text content]   │   │    - .post-actions (❤️ Like, 💬 Comment, 🔗 Share)
│ │ 🎨 [image]            │   │
│ │ ❤️ 0  💬 0  🔗 Share  │   │
│ └──────────────────────┘    │
│ ┌──────────────────────┐    │  ← .post-card #2
│ │ 😊 [User Name]  ⋯   │    │
│ │ Just now • 👥 Friends│    │
│ │ 🌅 [image]           │    │
│ └──────────────────────┘    │
│   ... more posts ...        │
└─────────────────────────────┘
```

---

### SECTION 2 — STORIES SCREEN (Line 2708)
**HTML id:** `stories-screen`

```
┌─────────────────────────────┐
│ ← Back    📖 Stories        │  ← .screen-back-btn + .section-header
├─────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐│  ← .story-card grid
│ │ ➕ │ │ 👤 │ │ 👤 │ │ 👤 ││    Create Story + user stories
│ │Create│ │User│ │User│ │User││    Each opens openModal('viewStory')
│ └────┘ └────┘ └────┘ └────┘│
└─────────────────────────────┘
```

---

### SECTION 3 — LIVE SCREEN (Line 2774)
**HTML id:** `live-screen`

```
┌─────────────────────────────┐
│ ← Back    🔴 Live Now  Settings│
├─────────────────────────────┤
│ [Go Live button]            │  ← Start your own live stream
│                             │
│ Active Streams              │
│ ┌──────────────────────┐    │
│ │ 👤 Sarah's Gaming    │    │  ← .post-card with LIVE badge
│ │ 🎮 [stream preview]  │    │    - .live-badge (red dot + "LIVE")
│ │ 1,234 watching       │    │
│ └──────────────────────┘    │
│   ... more streams ...      │
└─────────────────────────────┘
```

---

### SECTION 4 — TRENDING SCREEN (Line 2824)
**HTML id:** `trending-screen`

```
┌─────────────────────────────┐
│ ← Back    🔥 Trending       │
├─────────────────────────────┤
│ ┌──────────────────────┐    │  ← .trending-card
│ │ #1 TRENDING           │    │    - .trending-tag
│ │ New AI Features Released│  │    - .trending-title
│ │ 45.2K posts • 3 hours │    │    - .trending-stats
│ │ ❤️ Like  💬 Comment  🔗│   │    - .post-actions
│ └──────────────────────┘    │
│ [#2 Tech Conference 2025]   │
│ [#3 Climate Action Summit]  │
│   ... more trends ...       │
└─────────────────────────────┘
```

---

### SECTION 5 — GROUPS SCREEN (Line 2883)
**HTML id:** `groups-screen`

```
┌─────────────────────────────┐
│ ← Back  👥 Your Groups  +New│
├─────────────────────────────┤
│ ┌──────────────────────┐    │  ← .group-card
│ │ 💻 Tech Enthusiasts  │    │    - .group-icon
│ │ 2,456 members        │    │    - .group-title
│ │ [Join/View] button   │    │    - .group-members
│ └──────────────────────┘    │
│ [🎨 Creative Designers]     │
│ [📚 Book Club]              │
│ ─── Discover Groups ───     │
│ [🎮 Gaming Community]       │
└─────────────────────────────┘
```

---

### SECTION 6 — FRIENDS SCREEN (Line 2946)
**HTML id:** `friends-screen`

```
┌─────────────────────────────┐
│ ← Back   🔍 Search friends  │  ← .search-bar
├─────────────────────────────┤
│ All Friends        See All  │
│ ┌──────────────────────┐    │  ← Friend card
│ │ 👤 [Friend Name]     │    │    - Avatar, name, mutual friends
│ │ 12 mutual friends    │    │    - Message / Remove buttons
│ └──────────────────────┘    │
│ ─── Friend Requests ───     │  ← Incoming requests
│ [👤 Pending request]        │    - Accept / Decline buttons
│ ─── People You May Know ─── │  ← Suggested friends
│ [👤 Suggestion]             │    - Add Friend button
└─────────────────────────────┘
```

---

### SECTION 7 — SAVED SCREEN
**HTML id:** `saved-screen`

```
┌─────────────────────────────┐
│ ← Back   🔖 Saved Items     │
├─────────────────────────────┤
│ [ Posts ] [ Videos ] [ Links]│  ← Filter tabs
│ ┌──────────────────────┐    │
│ │ Saved post card      │    │
│ │ [Unsave] button      │    │
│ └──────────────────────┘    │
└─────────────────────────────┘
```

---

### SECTION 8 — EVENTS SCREEN
**HTML id:** `events-screen`

```
┌─────────────────────────────┐
│ ← Back   📅 Events   +Create│
├─────────────────────────────┤
│ [This Week][Upcoming][Past] │  ← Filter tabs
│ ┌──────────────────────┐    │
│ │ 🎭 Event Name        │    │
│ │ 📍 Location  🕐 Time │    │
│ │ 234 attending        │    │
│ │ [RSVP] button        │    │
│ └──────────────────────┘    │
└─────────────────────────────┘
```

---

### SECTION 9 — GAMING SCREEN
**HTML id:** `gaming-screen`

```
┌─────────────────────────────┐
│ ← Back   🎮 Gaming Hub      │
├─────────────────────────────┤
│ [My Games][Leaderboard][News]│
│ ┌──────────────────────┐    │
│ │ 🎮 Game Title         │    │
│ │ Genre • Rating       │    │
│ │ [Play Now] button    │    │
│ └──────────────────────┘    │
│ ─── Leaderboard ───         │
│ 🥇 Player 1  → 45,230 pts   │
│ 🥈 Player 2  → 38,100 pts   │
└─────────────────────────────┘
```

---

### SECTION 10 — MESSAGES SCREEN
**HTML id:** `messages-screen`

```
┌─────────────────────────────┐
│ ← Back   💬 Messages  ✏️    │
├─────────────────────────────┤
│ [All][Direct][Groups][Requests]│  ← Message tabs
│ 🔍 Search conversations     │
│ ┌──────────────────────┐    │
│ │ 👤 Contact Name      │    │  ← Conversation item
│ │ Last message preview │    │    - Unread badge (red dot)
│ │ 2m ago          🔴 3 │    │    - Time + unread count
│ └──────────────────────┘    │
│   ... more conversations... │
└─────────────────────────────┘

CHAT VIEW (opens when a conversation is tapped):
┌─────────────────────────────┐
│ ← [Contact Name]  📞 📹 ⋮  │  ← Chat header
├─────────────────────────────┤
│                             │
│   Hello! How are you?      🗨│  ← Their message bubble (left)
│  🗨 I'm great, thanks!      │  ← My message bubble (right)
│                             │
├─────────────────────────────┤
│ [📎][Message input...] [➤] │  ← .message-input + send button
└─────────────────────────────┘
```

---

### SECTION 11 — DATING SCREEN
**HTML id:** `dating-screen`

```
┌─────────────────────────────┐
│ ← Back   💕 Dating          │
├─────────────────────────────┤
│ [Discover][Matches][Liked][Settings]│
│                             │
│ ┌────────────────────────┐  │  ← .dating-card (swipeable)
│ │                        │  │
│ │    [Profile Photo]     │  │    - Full-height photo
│ │                        │  │
│ │ [Name], 28             │  │    - .dating-card-info
│ │ 📍 2 miles away        │  │    - Name, age, distance
│ │ "About me text..."     │  │    - Bio
│ └────────────────────────┘  │
│                             │
│    [✗ Pass]   [★ Super]  [♥ Like]│  ← .dating-actions
│    .dating-btn.pass  .super  .like│
│                             │
│  ── Your Matches ──         │
│  👤 👤 👤 👤 👤             │  ← Match thumbnails
└─────────────────────────────┘
```

---

### SECTION 12 — SEARCH SCREEN
**HTML id:** `search-screen`

```
┌─────────────────────────────┐
│ ← Back  🔍 Search           │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │  ← Search input bar
│ │ 🔍 Search people, posts │ │
│ └─────────────────────────┘ │
│ [People][Posts][Groups][Tags]│  ← Filter tabs
│                             │
│ Recent Searches             │
│  • [Recent term]  ×         │
│                             │
│ ─── Suggested ───           │
│  👤 [User result]   [Follow]│
│  📝 [Post result]           │
└─────────────────────────────┘
```

---

### SECTION 13 — NOTIFICATIONS SCREEN
**HTML id:** `notifications-screen`

```
┌─────────────────────────────┐
│ ← Back  🔔 Notifications    │
├─────────────────────────────┤
│ [All][Mentions][Likes][System]│  ← Filter tabs
│                             │
│ ─── Today ───               │
│ ┌──────────────────────┐    │
│ │ 👤 [User] liked your post │
│ │ ❤️  Just now         │    │
│ └──────────────────────┘    │
│ ┌──────────────────────┐    │
│ │ 👤 [User] followed you│   │
│ │ 👤  5 minutes ago    │    │
│ └──────────────────────┘    │
│ ─── Yesterday ───           │
│   ... older notifications...│
└─────────────────────────────┘
```

---

### SECTION 14 — PROFILE SCREEN
**HTML id:** `profile-screen`

```
┌─────────────────────────────┐
│ ← Back    [User Name]  ⋯   │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │  [Cover Photo Banner]   │ │  ← Profile header
│ └─────────────────────────┘ │
│      👤 (avatar)            │  ← .profile-avatar (overlaps cover)
│   [Name] ✅  Edit Profile   │  ← Verified badge + edit button
│   @username                 │  ← .profile-username
│   "Bio text here..."        │  ← .profile-bio
│                             │
│  [234 Posts][1.2K Follows][890 Followers]│  ← Stats row
│                             │
│ [Posts][Photos][Videos][Likes]│  ← Content tabs
│                             │
│ ┌───┐ ┌───┐ ┌───┐          │  ← Post grid
│ │ 🎨 │ │ 🌅 │ │ 📸 │          │
│ └───┘ └───┘ └───┘          │
└─────────────────────────────┘
```

---

### SECTION 15 — MARKETPLACE SCREEN
**HTML id:** `marketplace-screen`

```
┌─────────────────────────────┐
│ ← Back  🛍️ Marketplace  +Sell│
├─────────────────────────────┤
│ 🔍 Search items...          │
│ [All][Electronics][Fashion][Home]│  ← Category tabs
│                             │
│ ┌──────┐ ┌──────┐           │  ← Product grid (2 columns)
│ │ 🛍️   │ │ 🛍️   │           │    - Product photo
│ │$29.99│ │$49.99│           │    - Price
│ │Item 1│ │Item 2│           │    - Title
│ └──────┘ └──────┘           │    - [Buy Now] button
│ ┌──────┐ ┌──────┐           │
│ │ 🛍️   │ │ 🛍️   │           │
│ └──────┘ └──────┘           │
└─────────────────────────────┘
```

---

### SECTION 16 — MEDIA HUB SCREEN
**HTML id:** `media-hub-screen` (or `mediahub-screen`)

```
┌─────────────────────────────┐
│ ← Back  🎬 Media Hub        │
├─────────────────────────────┤
│ [Videos][Photos][Reels][Live]│  ← Media type tabs
│                             │
│ Featured Video              │
│ ┌──────────────────────┐    │
│ │  ▶ [Video Thumbnail] │    │  ← Featured video player
│ │  Title / Description │    │
│ └──────────────────────┘    │
│                             │
│ ─── For You ───             │
│ ┌───┐ ┌───┐ ┌───┐          │  ← Video grid
│ │▶  │ │▶  │ │▶  │          │
│ └───┘ └───┘ └───┘          │
└─────────────────────────────┘
```

---

### SECTION 17 — MUSIC PLAYER SCREEN
**HTML id:** `music-screen`

```
┌─────────────────────────────┐
│ ← Back   🎵 Music           │
├─────────────────────────────┤
│ [Library][Playlists][Discover]│
│                             │
│ ┌──────────────────────┐    │  ← Now Playing card
│ │       🎵             │    │    - Album art
│ │  Song Title          │    │    - Song name
│ │  Artist Name         │    │    - Artist
│ │  ████████░░  3:45/5:12│   │    - Progress bar + time
│ │  ⏮  ◀◀  ▶  ▶▶  ⏭   │    │    - Controls
│ │  🔀  ❤️  🔊  ⋮       │    │    - Shuffle, Like, Volume, More
│ └──────────────────────┘    │
│                             │
│ ─── Up Next ───             │
│  🎵 Track 2 / Artist        │
│  🎵 Track 3 / Artist        │
└─────────────────────────────┘
```

---

### SECTION 18 — VIDEO CALLS SCREEN
**HTML id:** `video-calls-screen` (or `videocalls-screen`)

```
┌─────────────────────────────┐
│ ← Back   📹 Video Calls     │
├─────────────────────────────┤
│ [New Call][Recent][Contacts] │
│                             │
│ ┌──────────────────────┐    │  ← Call interface (when active)
│ │  [Your video feed]   │    │    - Your camera (small, corner)
│ │                      │    │    - Other person (large)
│ │    👤 Remote Video   │    │
│ │                      │    │
│ │ [🎤][📹][🔄][📱][📵] │    │    - Call controls row
│ └──────────────────────┘    │
│                             │
│ Recent Calls                │
│ 👤 [Contact] • 2h ago  📹   │
└─────────────────────────────┘
```

---

### SECTION 19 — AR / VR SCREEN
**HTML id:** `ar-vr-screen`

```
┌─────────────────────────────┐
│ ← Back  🥽 AR / VR          │
├─────────────────────────────┤
│ [Filters][Games][Shopping][VR]│
│                             │
│ ─── AR Filters ───          │
│ ┌───┐ ┌───┐ ┌───┐          │  ← Filter cards
│ │ 😎│ │ 🌟│ │ 🐶│          │    Each opens AR camera view
│ └───┘ └───┘ └───┘          │
│                             │
│ ─── VR Experiences ───      │
│ ┌──────────────────────┐    │
│ │ 🥽 Virtual Concert   │    │
│ │ Start Experience     │    │
│ └──────────────────────┘    │
└─────────────────────────────┘
```

---

### SECTION 20 — BUSINESS PROFILE SCREEN
**HTML id:** `business-profile-screen`

```
┌─────────────────────────────┐
│ ← Back  🏢 Business Profile │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │  ← Business header
│ │  [Business Cover Photo] │ │
│ └─────────────────────────┘ │
│  🏢 Business Name  ✅       │
│  📍 Location                │
│  ⭐⭐⭐⭐⭐ 4.8 (234 reviews)│
│                             │
│ [About][Products][Reviews][Contact]│
│                             │
│ ─── Products/Services ───   │
│ ┌───┐ ┌───┐ ┌───┐          │
│ │ 🛍️│ │ 🛍️│ │ 🛍️│          │
│ └───┘ └───┘ └───┘          │
└─────────────────────────────┘
```

---

### SECTION 21 — CREATOR PROFILE SCREEN
**HTML id:** `creator-profile-screen`

```
┌─────────────────────────────┐
│ ← Back  🎨 Creator Profile  │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │  [Creator Cover Photo]  │ │
│ └─────────────────────────┘ │
│  👤 Creator Name  ✅🎨     │  ← Creator badge
│  1.2M followers             │
│  [Monetization stats]       │
│                             │
│ [$Revenue][📊 Analytics][📅 Schedule]│
│                             │
│ ─── Content Library ───     │
│ ┌───┐ ┌───┐ ┌───┐          │
│ └───┘ └───┘ └───┘          │
└─────────────────────────────┘
```

---

### SECTION 22 — PREMIUM PROFILE SCREEN
**HTML id:** `premium-profile-screen`

```
┌─────────────────────────────┐
│ ← Back  ⭐ Premium Profile  │
├─────────────────────────────┤
│      👑 PREMIUM MEMBER      │  ← Premium crown badge
│                             │
│ ─── Your Benefits ───       │
│  ✅ Verified badge          │
│  ✅ Priority in search      │
│  ✅ Ad-free experience      │
│  ✅ Advanced analytics      │
│                             │
│ ─── Upgrade Plan ───        │
│ [Monthly $9.99][Annual $79] │  ← Pricing cards
│ [ Subscribe Now ]           │
└─────────────────────────────┘
```

---

### SECTION 23 — SETTINGS SCREEN
**HTML id:** `settings-screen`

```
┌─────────────────────────────┐
│ ← Back  ⚙️ Settings         │
├─────────────────────────────┤
│ 👤 Account Settings         │  ← Sections list
│   Email, Password, Username │
│ 🔒 Privacy & Security       │
│   Who can see me, blocked   │
│ 🔔 Notifications            │
│   Push, email, in-app       │
│ 🎨 Appearance               │
│   Dark/Light mode, font     │
│ 💳 Payments & Subscriptions │
│ 📊 Data & Storage           │
│ 🌐 Language & Region        │
│ ❓ Help & Support           │
│ 🚪 Log Out                  │
└─────────────────────────────┘
```

---

### SECTION 24 — HELP & SUPPORT SCREEN
**HTML id:** `help-screen`

```
┌─────────────────────────────┐
│ ← Back  ❓ Help & Support   │
├─────────────────────────────┤
│ 🔍 Search help articles...  │
│                             │
│ [FAQ][Tickets][Live Chat]   │
│                             │
│ Popular Topics              │
│  📌 How to reset password   │
│  📌 How to report a user    │
│  📌 Subscription billing    │
│  📌 Delete account          │
│                             │
│ ─── Contact Us ───          │
│  [📧 Email] [💬 Live Chat]  │
└─────────────────────────────┘
```

---

### SECTION 25 — MENU / SIDEBAR SCREEN
**HTML id:** `menu-screen` (opens from ☰ hamburger button)

```
┌─────────────────────────────┐
│  👤 [User Avatar + Name]    │  ← Profile summary
│  @username  Edit Profile →  │
│                             │
│  ─── Navigation ───         │
│  🏠  Feed                   │
│  💕  Dating                 │
│  🛍️  Marketplace            │
│  🎮  Gaming                 │
│  🎵  Music                  │
│  🎬  Media Hub              │
│  📹  Video Calls            │
│  🥽  AR / VR                │
│  📅  Events                 │
│  🔖  Saved                  │
│  🏢  Business Profile       │
│  🎨  Creator Studio         │
│  ⭐  Premium                │
│                             │
│  ─── Account ───            │
│  ⚙️  Settings               │
│  ❓  Help & Support         │
│  🚪  Log Out                │
└─────────────────────────────┘
```

---

## LAYER 5 — MODALS & OVERLAYS (stacked throughout, ~lines 16,500+)

All modals are `position: fixed`, `z-index: 1000+`, hidden by default. They are opened with `openModal('modalName')` and closed with a backdrop click or close button.

```
Modal Name            Opened By
─────────────────     ──────────────────────────────
createNew             ➕ button in top nav
searchModal           🔍 button in top nav
comments              💬 on any post
postOptions           ⋯ on any post
createStory           ➕ in stories
viewStory             Any story card
liveSettings          Settings in Live screen
trendingDetails       Any trending card
groupDetails          Any group card
createGroup           + New in Groups
allFriends            See All in Friends
createEvent           + Create in Events
viewStory             Story card tap
viewProfile           Any user avatar
postCreate            Create post box
viewNotification      Any notification item
matchDetails          Dating match tap
marketplace-item      Product card tap
paymentMethod         Checkout flow
videoPlayer           Media Hub video tap
musicPlayer           Music track tap
arFilter              AR filter tap
vrExperience          VR experience tap
settingsPanel-*       Each settings section
helpTicket            Help > New ticket
```

---

## LAYER 6 — JAVASCRIPT (Lines ~18,000 – 21,210)

All JavaScript is in a single `<script>` block at the very bottom of `<body>`.

```javascript
// Key functions and where they live (conceptually):

// ── Navigation ─────────────────────────────────
function switchBottomTab(tab)    // Shows/hides .screen divs
function switchScreen(screen)    // Inner screen navigation
function openScreen(screen)      // Opens a named screen
function navigateBack()          // Pops back one screen
function goHome()                // Returns to feed-screen

// ── Auth ───────────────────────────────────────
function handleLogin()           // Email/password login
function handleRegister()        // New account creation
function showAppAfterLogin()     // Reveals .app-container
function switchLoginTab(tab)     // Toggles Sign In / Sign Up

// ── Modals ─────────────────────────────────────
function openModal(name)         // Shows a modal overlay
function openScreen(name)        // Shows a full screen

// ── Feed ───────────────────────────────────────
function toggleLikePost(el)      // Like/unlike animation
function sharePost()             // Share dialog
function createPost()            // Post creation

// ── Dating ─────────────────────────────────────
function swipeLeft(card)         // Pass (dismiss card)
function swipeRight(card)        // Like (match)

// ── Messages ───────────────────────────────────
function sendMessage()           // Send chat message
function openConversation(id)    // Open a chat thread

// ── Utility ────────────────────────────────────
function showToast(msg)          // Toast notification
function showInAppNotification() // In-app popup
```

---

## 📊 COMPLETE SECTION SUMMARY TABLE

| # | Section | HTML ID | Line ~| Opened Via |
|---|---------|---------|-------|------------|
| — | Splash Screen | `#splashScreen` | 2081 | Auto (page load) |
| — | Login Screen | `#loginScreen` | 2462 | After 3s splash |
| — | App Container | `.app-container` | 2587 | After login |
| — | Top Nav Bar | `.top-nav` | 2589 | Always visible in app |
| — | Pill Nav Bar | `.pill-nav` | 2618 | Always visible in app |
| 1 | Feed | `#feed-screen` | 2633 | Default active screen |
| 2 | Stories | `#stories-screen` | 2708 | Pill nav / Stories tab |
| 3 | Live | `#live-screen` | 2774 | Pill nav / Live tab |
| 4 | Trending | `#trending-screen` | 2824 | Pill nav / Trending tab |
| 5 | Groups | `#groups-screen` | 2883 | Pill nav / Groups tab |
| 6 | Friends | `#friends-screen` | 2946 | Pill nav / Friends tab |
| 7 | Saved | `#saved-screen` | ~3100 | Menu |
| 8 | Events | `#events-screen` | ~3200 | Pill nav / Menu |
| 9 | Gaming | `#gaming-screen` | ~3400 | Pill nav / Menu |
| 10 | Messages | `#messages-screen` | ~3600 | Top nav 💬 / Menu |
| 11 | Dating | `#dating-screen` | ~4200 | Pill nav / Menu |
| 12 | Search | `#search-screen` | ~5000 | Top nav 🔍 |
| 13 | Notifications | `#notifications-screen` | ~5300 | Top nav 🔔 |
| 14 | Profile | `#profile-screen` | ~5500 | Avatar tap / Menu |
| 15 | Marketplace | `#marketplace-screen` | ~6000 | Pill nav / Menu |
| 16 | Media Hub | `#media-hub-screen` | ~7000 | Pill nav / Menu |
| 17 | Music Player | `#music-screen` | ~8000 | Pill nav / Menu |
| 18 | Video Calls | `#video-calls-screen` | ~9000 | Menu |
| 19 | AR / VR | `#ar-vr-screen` | ~10000 | Menu |
| 20 | Business Profile | `#business-profile-screen` | ~11000 | Menu |
| 21 | Creator Profile | `#creator-profile-screen` | ~12000 | Menu |
| 22 | Premium Profile | `#premium-profile-screen` | ~13000 | Menu |
| 23 | Settings | `#settings-screen` | ~14000 | Top nav ⚙️ / Menu |
| 24 | Help & Support | `#help-screen` | ~15000 | Settings / Menu |
| 25 | Menu / Sidebar | `#menu-screen` | ~16000 | Top nav ☰ |
| — | All Modals | various | ~16500+ | `openModal()` calls |
| — | JavaScript | `<script>` | ~18000 | (runs on page load) |

---

## 🔑 KEY POINTS TO REMEMBER

1. **All screens are in the DOM at all times** — only one has `class="screen active"`, the rest are hidden with CSS.

2. **Navigation works by toggling the `.active` class** — `switchBottomTab()` removes `.active` from all `.screen` divs, then adds it to the target.

3. **Everything is stacked in a single `<div class="app-container">`** — the top nav, pill nav, and all screens are children of this one container.

4. **The CSS `</style>` ends around line 2080** — if you need to add styles, add them before line 2080.

5. **The JavaScript `<script>` starts around line 18,000** — if you need to add JS functions, add them in that block or just before `</body>`.

6. **Modals use `position: fixed` and `z-index: 1000`** — they float over all screens regardless of which screen is active.

7. **The login container and app container are siblings** — login shows when not logged in, app-container shows when logged in. They never show at the same time.
