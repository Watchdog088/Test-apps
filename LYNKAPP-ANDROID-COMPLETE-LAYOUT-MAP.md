# 📱 LynkApp — Complete Android UI/UX Layout Map
> Every screen, every button, every page — exact positions for Android (360dp wide × 800dp tall baseline)

---

## 🏗️ GLOBAL CHROME (Appears on EVERY screen)

```
┌─────────────────────────────────────┐  ← STATUS BAR (24dp) — system icons, time, battery
│  9:41 AM          ●●●   WiFi  🔋   │
├─────────────────────────────────────┤  ← TOP APP BAR (56dp)
│ [☰ Menu]  🔷 LynkApp  [🔔] [👤]   │    Left: Hamburger menu  |  Center: Logo  |  Right: Notif + Avatar
├─────────────────────────────────────┤
│                                     │
│         PAGE CONTENT AREA           │  ← SCROLLABLE CONTENT (fills remaining height)
│         (varies per page)           │
│                                     │
├─────────────────────────────────────┤  ← BOTTOM NAV BAR (56dp) — always visible
│ [🏠Home] [🔍Search] [➕Post] [💬Msg] [👤Me] │
└─────────────────────────────────────┘  ← Android Nav Bar (48dp) — system back/home/recents
```

### Bottom Navigation Bar — 5 Tabs
| Position | Icon | Label | Navigates To |
|----------|------|-------|-------------|
| 1 (far left) | 🏠 | Home | Feed Page |
| 2 | 🔍 | Search | Search Page |
| 3 (center, raised FAB) | ➕ | Create | Post/Story/Live picker |
| 4 | 💬 | Messages | Messages Page |
| 5 (far right) | 👤 | Me | My Profile Page |

### Top App Bar Buttons
| Position | Button | Action |
|----------|--------|--------|
| Left | ☰ Hamburger | Opens left drawer menu |
| Center | LynkApp logo | Scrolls feed to top |
| Right #1 | 🔔 Bell (with badge) | Opens Notifications |
| Right #2 | Avatar circle | Opens My Profile |

---

## 📋 SCREEN 1 — SPLASH SCREEN

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│         🔷 [LynkApp Logo]           │  ← Center of screen, 120dp × 120dp
│                                     │
│           L Y N K A P P             │  ← Brand name, 28sp bold, centered
│                                     │
│      Connect · Share · Discover     │  ← Tagline, 14sp, centered, gray
│                                     │
│                                     │
│         ────────────────            │  ← Loading progress bar (horizontal, brand color)
│                                     │
│           Loading... 73%            │  ← Progress text, 12sp, centered
│                                     │
└─────────────────────────────────────┘
```
**Duration:** 2.5 seconds → auto-navigates to Login or Feed

---

## 📋 SCREEN 2 — LOGIN PAGE

```
┌─────────────────────────────────────┐
│  ←  Back                            │  ← Back arrow top left (if returning user)
│                                     │
│    🔷 LynkApp                       │  ← Logo 80dp centered, 32dp top margin
│    Welcome Back                     │  ← 24sp bold, centered
│    Sign in to continue              │  ← 14sp gray, centered
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 📧 Email or Username          │  │  ← Text field, 56dp tall, rounded 8dp
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🔒 Password              👁  │  │  ← Password field + show/hide eye icon
│  └───────────────────────────────┘  │
│                                     │
│                    Forgot Password? │  ← Right-aligned text link, 14sp brand color
│                                     │
│  ┌───────────────────────────────┐  │
│  │       SIGN IN                 │  │  ← Primary button, full width, 48dp, brand color
│  └───────────────────────────────┘  │
│                                     │
│  ─────────────  OR  ─────────────   │  ← Divider with label
│                                     │
│  ┌──────────────┐ ┌──────────────┐  │
│  │  G  Google   │ │  f  Facebook │  │  ← Social login buttons, equal width, outlined
│  └──────────────┘ └──────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🍎  Sign in with Apple       │  │  ← Apple login (full width, black bg)
│  └───────────────────────────────┘  │
│                                     │
│    Don't have an account?  Sign Up  │  ← Bottom text link, centered
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 3 — SIGN UP PAGE

```
┌─────────────────────────────────────┐
│  ←  Create Account                  │
│                                     │
│    🔷  Join LynkApp                 │  ← Logo + headline, centered
│    Connect with the world           │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 👤 Full Name                  │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ @ Username                    │  │  ← Shows availability check ✓/✗ inline
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 📧 Email Address              │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🔒 Password              👁  │  │
│  └───────────────────────────────┘  │
│  ● 8+ chars  ● 1 number  ● 1 symbol │  ← Password strength indicators
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🎂 Date of Birth  (MM/DD/YYYY)│  │  ← Date picker on tap
│  └───────────────────────────────┘  │
│                                     │
│  ☐ I agree to Terms of Service      │  ← Checkbox + linked text
│  ☐ I agree to Privacy Policy        │
│                                     │
│  ┌───────────────────────────────┐  │
│  │       CREATE ACCOUNT          │  │  ← Primary button
│  └───────────────────────────────┘  │
│                                     │
│    Already have an account?  Login  │
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 4 — ONBOARDING (5-step wizard, after first sign up)

```
STEP 1 — Profile Setup
┌─────────────────────────────────────┐
│              ●○○○○  Step 1 of 5     │  ← Progress dots top right
│                                     │
│    Add Your Profile Photo           │  ← 24sp bold, centered
│                                     │
│         ┌──────────┐                │
│         │          │                │
│         │  📷 +    │                │  ← 96dp avatar circle, tap to upload
│         │          │                │
│         └──────────┘                │
│         Tap to add photo            │  ← 12sp gray caption
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Write a short bio...          │  │  ← 4-line text area
│  └───────────────────────────────┘  │
│  0/150 characters                   │
│                                     │
│  ┌────────────────┐ ┌─────────────┐ │
│  │   SKIP         │ │   NEXT →    │ │  ← Skip (outlined) | Next (filled)
│  └────────────────┘ └─────────────┘ │
└─────────────────────────────────────┘

STEP 2 — Interests
STEP 3 — Find Friends
STEP 4 — Notification Preferences  
STEP 5 — Complete! (celebration animation)
```

---

## 📋 SCREEN 5 — HOME FEED PAGE  ⭐ MOST IMPORTANT

```
┌─────────────────────────────────────┐
│ ☰  🔷 LynkApp        🔔  👤        │  ← Top App Bar
├─────────────────────────────────────┤
│ 🔍 Search LynkApp...                │  ← Search bar (tappable, goes to Search)
├─────────────────────────────────────┤
│ STORIES ROW (horizontal scroll)     │  ← 80dp tall strip
│ [+Add] [👤User1] [👤User2] [👤User3]→ │    Circular avatars 64dp, tap to view story
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 👤 UserName  •  2h ago    [···] │ │  ← Post header: avatar, name, time, 3-dot menu
│ │ Post caption text here...       │ │  ← Post text
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │                             │ │ │  ← Post image/video (16:9 ratio)
│ │ │        [Media Content]      │ │ │
│ │ │                             │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ ❤️ 234  💬 45  🔁 12   📤 Share │ │  ← Action bar: Like | Comment | Share | Send
│ │ ─────────────────────────────── │ │
│ │ 👤 Add a comment...             │ │  ← Quick comment box
│ └─────────────────────────────────┘ │
│                                     │
│  [AD BANNER — 50dp tall]            │  ← AdMob banner ad
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  [Next post card repeats...]    │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 🏠  🔍  [➕]  💬  👤               │  ← Bottom Nav
└─────────────────────────────────────┘
```

### Post 3-dot Menu (···) Options:
```
┌──────────────────────┐
│ 🔗 Copy Link         │
│ 🔖 Save Post         │
│ 🚫 Hide Post         │
│ 🚩 Report Post       │
│ 👤 View Profile      │
│ ❌ Cancel            │
└──────────────────────┘
```

---

## 📋 SCREEN 6 — CREATE POST (FAB ➕ Picker)

### Step 1 — Content Type Picker (bottom sheet)
```
┌─────────────────────────────────────┐
│                                     │
│          What do you want           │
│            to share?                │
├─────────────────────────────────────┤
│  ┌──────────┐   ┌──────────┐        │
│  │ 📝 Post  │   │ 📸 Story │        │  ← 2 columns, equal size cards
│  │ Share    │   │ 24-hour  │        │
│  │ thoughts │   │ moment   │        │
│  └──────────┘   └──────────┘        │
│  ┌──────────┐   ┌──────────┐        │
│  │ 🔴 Live  │   │ 🎥 Reel  │        │
│  │ Stream   │   │ Short    │        │
│  │ now      │   │ video    │        │
│  └──────────┘   └──────────┘        │
│  ┌──────────┐   ┌──────────┐        │
│  │ 📊 Poll  │   │ 📅 Event │        │
│  └──────────┘   └──────────┘        │
└─────────────────────────────────────┘
```

### Step 2 — Create Post Editor
```
┌─────────────────────────────────────┐
│ ✕  New Post              [SHARE]    │  ← Cancel (X) left | Share button right (brand color)
├─────────────────────────────────────┤
│ 👤  What's on your mind?            │  ← Avatar + expandable text area
│                                     │
│                                     │
│  ─────────────────────────────────  │
│  📍 Location: Add location...       │
│  👥 Audience: 🌍 Public ▼          │  ← Audience picker: Public/Friends/Only Me
│  🎭 Feeling/Activity               │
├─────────────────────────────────────┤
│ MEDIA AREA (if photo/video added)   │
│ ┌──────────────────────────────┐   │
│ │  [Thumbnail]           ✕ ╋ │   │  ← Remove | Reorder buttons on media
│ └──────────────────────────────┘   │
├─────────────────────────────────────┤
│ [🖼️ Photo] [🎥 Video] [📊 Poll]   │  ← Media toolbar (horizontal, bottom of editor)
│ [📍 Place] [👥 Tag]  [😊 Emoji]   │
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 7 — STORIES VIEWER

```
┌─────────────────────────────────────┐
│ ████████████░░░░░░  2/5             │  ← Progress bar (fills over time), story count
│ 👤 Username   •  3h ago        ✕   │  ← Author, time, close button
│                                     │
│                                     │
│                                     │
│         FULL SCREEN MEDIA           │  ← Story image/video fills entire screen
│          (portrait 9:16)            │
│                                     │
│                                     │
│    Story caption text overlaid      │  ← Semi-transparent bg text
│                                     │
│                                     │
│  ← Tap left half    Tap right half→ │  ← Tap left = prev story, tap right = next
│                                     │
│  ─────────────────────────────────  │
│  💬 Reply to @username...      📤  │  ← Reply input + share button (bottom)
│  ❤️  👍  😂  😮  😢  😡         │  ← Quick reaction strip
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 8 — SEARCH PAGE

```
┌─────────────────────────────────────┐
│ ←  🔍 Search people, posts...   ✕  │  ← Search bar active, X to clear
├─────────────────────────────────────┤
│ [People] [Posts] [Tags] [Places]    │  ← Filter tabs (horizontal scroll)
├─────────────────────────────────────┤
│ TRENDING NOW                        │  ← Section header
│ # trending1  🔥 45.2K posts        │
│ # trending2  🔥 32.1K posts        │
│ # trending3  🔥 28.9K posts        │
├─────────────────────────────────────┤
│ SUGGESTED PEOPLE                    │
│ ┌──────────────────────────────┐   │
│ │ 👤 Name   @handle    [Follow]│   │  ← User suggestion row: avatar + name + follow btn
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ 👤 Name   @handle    [Follow]│   │
│ └──────────────────────────────┘   │
├─────────────────────────────────────┤
│ RECENT SEARCHES                     │
│ 🕐 @username1                  ✕  │
│ 🕐 #hashtag                    ✕  │
│ 🕐 photography                 ✕  │
│              Clear All             │
└─────────────────────────────────────┘
```

### Search Results (after typing)
```
┌─────────────────────────────────────┐
│ ← 🔍 "travel"                   ✕  │
├─────────────────────────────────────┤
│ [People 12] [Posts 847] [Tags 34]   │  ← Tabs with result counts
├─────────────────────────────────────┤
│  👤 TravelKing   @travelking        │  ← People results
│     1.2M followers  [Follow]        │
│  ─────────────────────────────────  │
│  👤 TravelDiaries  @travel.diaries  │
│     856K followers  [Follow]        │
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 9 — NOTIFICATIONS PAGE

```
┌─────────────────────────────────────┐
│ ←  Notifications         [⚙️ Settings] │
├─────────────────────────────────────┤
│ [All] [Mentions] [Likes] [Follows]  │  ← Filter tabs
├─────────────────────────────────────┤
│ TODAY                               │
│ ┌──────────────────────────────┐   │
│ │ 👤 @user liked your post  2m │   │  ← Notification row: avatar + text + time
│ │   [Post thumbnail]           │   │    Small post thumbnail on right
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ 👤 @user started following  5m│  │
│ │              [Follow Back]   │   │  ← Action button inline
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ 👥 Group name: New message 8m│   │
│ └──────────────────────────────┘   │
├─────────────────────────────────────┤
│ YESTERDAY                           │
│ [older notifications...]            │
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 10 — MY PROFILE PAGE

```
┌─────────────────────────────────────┐
│ ←  @username              [⋯] [⚙️] │  ← Back, 3-dot more, settings
├─────────────────────────────────────┤
│        ┌──────────────┐             │  ← Cover photo banner (200dp tall)
│        │  Cover Photo │             │
│        │              │  [✏️ Edit]  │  ← Edit cover photo button (top right of banner)
│   ┌────┴──────┐       │             │
│   │  Avatar   │       │             │  ← Profile photo (80dp, overlaps banner bottom)
│   │  96dp     │       │             │
│   └───────────┘       │             │
├─────────────────────────────────────┤
│  Full Name  ✅ Verified             │  ← Name + verified badge
│  @username  •  Creator 🎨           │  ← Handle + role badge
│  "Bio text goes here, up to 150     │
│   characters shown here"            │
│  📍 City, Country  🔗 website.com  │  ← Location + link
│                                     │
│  ┌────────┐  ┌─────────┐  ┌──────┐ │
│  │ 1,234  │  │  567    │  │  89  │ │  ← Stats: Posts | Followers | Following
│  │ Posts  │  │Followers│  │ Following│ │
│  └────────┘  └─────────┘  └──────┘ │
│                                     │
│  ┌─────────────┐  ┌──────────────┐ │
│  │ ✏️ Edit Profile│  │ 📊 Insights  │ │  ← Edit + Insights buttons (own profile)
│  └─────────────┘  └──────────────┘ │
│                           [OR if viewing others:]
│  ┌──────────────┐  ┌─────────────┐ │
│  │  Following ▼ │  │  💬 Message │ │  ← Follow state + Message buttons
│  └──────────────┘  └─────────────┘ │
├─────────────────────────────────────┤
│ STORY HIGHLIGHTS (horizontal scroll)│  ← 60dp circles with labels
│ [+New] [Trip] [Food] [Work] [Life] →│
├─────────────────────────────────────┤
│ [📷 Posts] [🎥 Videos] [🔖 Saved] [🏷️ Tagged] │  ← Content tabs
├─────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐   │  ← 3-column post grid
│ │ Post 1 │ │ Post 2 │ │ Post 3 │   │    Each cell: 120dp × 120dp
│ └────────┘ └────────┘ └────────┘   │
│ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │ Post 4 │ │ Post 5 │ │ Post 6 │   │
│ └────────┘ └────────┘ └────────┘   │
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 11 — MESSAGES PAGE

```
┌─────────────────────────────────────┐
│ Messages              [🔍] [✏️ New] │  ← Title | Search | Compose new
├─────────────────────────────────────┤
│ 🔍 Search conversations...          │  ← Search bar
├─────────────────────────────────────┤
│ [All] [Unread] [Groups] [Requests]  │  ← Filter tabs
├─────────────────────────────────────┤
│ PINNED                              │
│ ┌──────────────────────────────┐   │
│ │ 📌 👤 BestFriend • 2m ago   │   │  ← Pinned conversation (pin icon)
│ │    "Hey, did you see that?..."│   │    Last message preview
│ │                         🔵 3 │   │    Unread badge count
│ └──────────────────────────────┘   │
├─────────────────────────────────────┤
│ RECENT                              │
│ ┌──────────────────────────────┐   │
│ │ 👤 Name • 15m ago            │   │
│ │    "Sounds good! Let's meet.."│   │
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ 👥 Group Name (4) • 1h ago   │   │  ← Group chat shows (member count)
│ │    "👤 User: Great idea!"    │   │
│ └──────────────────────────────┘   │
│  ← SWIPE RIGHT = Mark read         │
│  → SWIPE LEFT = Archive / Delete   │
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 12 — CONVERSATION (Chat Thread)

```
┌─────────────────────────────────────┐
│ ← 👤 Username  🟢 Online  [📞] [📹] │  ← Back | Avatar+name+status | Voice | Video call
├─────────────────────────────────────┤
│                                     │
│       ┌────────────────────┐       │  ← Received message (left-aligned, gray bubble)
│       │ Hey! How are you?  │       │
│       └────────────────────┘       │
│                          10:32 AM   │  ← Timestamp right-aligned under bubble
│                                     │
│    ┌────────────────────────────┐   │  ← Sent message (right-aligned, brand color)
│    │  I'm great! Just saw your  │   │
│    │  post about the hiking     │   │
│    │  trip! 🏔️                 │   │
│    └────────────────────────────┘   │
│                    10:33 AM  ✓✓    │  ← Time + read receipt (double check)
│                                     │
│       ┌────────────────────┐       │
│       │ ┌──────────────┐   │       │  ← Photo message
│       │ │  [Image]     │   │       │
│       │ └──────────────┘   │       │
│       │ It was amazing!!   │       │
│       └────────────────────┘       │
│                                     │
├─────────────────────────────────────┤  ← MESSAGE INPUT BAR (always visible)
│ [😊] ┌────────────────────┐ [📎][🎤] │  ← Emoji | Text input | Attach | Voice note
│      │  Type a message... │          │
│      └────────────────────┘          │
│ ↕ If media attached, preview shows above input bar                    │
└─────────────────────────────────────┘
```

### Attachment Picker (tapping 📎):
```
┌─────────────────────────────────────┐
│  [📷 Camera] [🖼️ Gallery] [📄 File] │
│  [📍 Location] [🎵 Audio] [📋 GIF]  │
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 13 — LIVE STREAMING PAGE

```
┌─────────────────────────────────────┐
│ 🔴 LIVE  👁️ 2,341 watching    ✕ End │  ← LIVE badge | viewer count | End button
│                                     │
│                                     │
│      FULL SCREEN VIDEO FEED         │  ← Live video (landscape or portrait)
│                                     │
│ 👤 UserA: Great stream! 🔥          │  ← Live comments overlay (auto-scroll up)
│ 👤 UserB: Hello from NYC! 👋        │
│ 👤 UserC: 🎉🎉🎉                  │
│                                     │
│  ┌──────┐                           │
│  │ 🎁   │  ← Gift button (opens gift picker)
│  │Gifts │
│  └──────┘
│                                     │
│  💜 💛 🌟 ← Floating gift animations│
│                                     │
├─────────────────────────────────────┤
│ [😊] ┌──────────────────┐  [🎁] [↗️]│  ← Emoji | Comment input | Gifts | Share
│      │  Comment...      │            │
│      └──────────────────┘            │
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 14 — DATING PAGE

```
┌─────────────────────────────────────┐
│ 🔷 Dating         [⚙️ Prefs] [❤️ Matches] │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │  ← SWIPE CARD (full width, 480dp tall)
│ │                                 │ │
│ │       [Profile Photo]           │ │  ← Full card background photo
│ │                                 │ │
│ │  ✅ Verified  📍 2 miles away   │ │  ← Badge + distance (bottom overlay)
│ │                                 │ │
│ │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━   │ │
│ │  Name, 28                 ℹ️   │ │  ← Name, age, info button
│ │  "Love hiking and coffee ☕"    │ │  ← Bio snippet
│ │  🎵 Currently: Artist - Song   │ │  ← Music taste
│ └─────────────────────────────────┘ │
│  ← Swipe LEFT = Pass               │
│  → Swipe RIGHT = Like              │
│  ↑ Swipe UP = Super Like           │
│                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐ │
│  │  ✕  │  │  ⭐  │  │  ❤️  │  │  ⚡  │ │  ← Nope | Super | Like | Boost
│  │Pass │  │Super │  │Like │  │Boost│ │
│  └──────┘  └──────┘  └──────┘  └──────┘ │
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 15 — DATING MATCH CELEBRATION

```
┌─────────────────────────────────────┐
│         🎉 IT'S A MATCH! 🎉         │  ← Full screen, confetti animation
│                                     │
│   ┌──────────┐    ┌──────────┐      │
│   │  Your    │ ❤️ │  Their   │      │  ← Two profile photos side by side
│   │  Photo   │    │  Photo   │      │
│   └──────────┘    └──────────┘      │
│                                     │
│    You and Sarah both liked         │  ← Match description
│    each other! Say hello!           │
│                                     │
│  ┌───────────────────────────────┐  │
│  │    💬  SEND A MESSAGE         │  │  ← Primary CTA button
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │       KEEP SWIPING            │  │  ← Secondary outlined button
│  └───────────────────────────────┘  │
│                                     │
│    🎁 Send a GIF opener             │  ← Optional gif/icebreaker link
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 16 — MARKETPLACE PAGE

```
┌─────────────────────────────────────┐
│ ←  Marketplace        [🔍] [+Sell]  │
├─────────────────────────────────────┤
│ 🔍 Search products...               │
├─────────────────────────────────────┤
│ [All] [For Sale] [Free] [Services]  │  ← Category tabs
├─────────────────────────────────────┤
│ 📍 Near you • 25 miles              │  ← Location filter
├─────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐  │  ← 2-column product grid
│ │ [Product Img]│  │ [Product Img]│  │
│ │ $49.99       │  │ $120.00      │  │
│ │ Item Name    │  │ Item Name    │  │
│ │ 📍 2 mi      │  │ 📍 5 mi      │  │
│ └──────────────┘  └──────────────┘  │
│ ┌──────────────┐  ┌──────────────┐  │
│ │ [Product Img]│  │ [Product Img]│  │
│ │ FREE         │  │ $8.50        │  │
│ └──────────────┘  └──────────────┘  │
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 17 — EVENTS PAGE

```
┌─────────────────────────────────────┐
│ ←  Events              [+Create]   │
├─────────────────────────────────────┤
│ [Upcoming] [Nearby] [Friends Going] │
├─────────────────────────────────────┤
│ THIS WEEKEND                        │
│ ┌──────────────────────────────┐   │
│ │ ┌────┐  Event Name           │   │  ← Event card: thumbnail | details
│ │ │Img │  📅 Sat Jun 14, 7PM   │   │
│ │ └────┘  📍 Venue Name        │   │
│ │         👥 42 going  [Join]  │   │  ← Attendee count + Join button
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ [Event card 2...]            │   │
│ └──────────────────────────────┘   │
│                                     │
│ NEXT WEEK                           │
│ [more events...]                    │
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 18 — GROUPS PAGE

```
┌─────────────────────────────────────┐
│ ←  Groups              [+Create]   │
├─────────────────────────────────────┤
│ [My Groups] [Discover] [Invites]   │
├─────────────────────────────────────┤
│ MY GROUPS                           │
│ ┌──────────────────────────────┐   │
│ │ 🖼️ [Cover] Group Name        │   │
│ │           👥 1,234 members    │   │
│ │           💬 5 new posts      │   │
│ └──────────────────────────────┘   │
├─────────────────────────────────────┤
│ SUGGESTED FOR YOU                   │
│ ┌──────────────────────────────┐   │
│ │ 🖼️ Group Name   [Join]       │   │
│ │    👥 5.2K members           │   │
│ └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 19 — SETTINGS PAGE

```
┌─────────────────────────────────────┐
│ ←  Settings                         │
├─────────────────────────────────────┤
│ 👤 ACCOUNT                          │  ← Section header
│   Edit Profile                  >  │  ← Row: label + chevron
│   Change Password               >  │
│   Email Address                 >  │
│   Phone Number                  >  │
│   Linked Accounts               >  │
├─────────────────────────────────────┤
│ 🔒 PRIVACY & SAFETY                 │
│   Privacy Settings              >  │
│   Blocked Users                 >  │
│   Two-Factor Auth               >  │
│   Data Download                 >  │
├─────────────────────────────────────┤
│ 🔔 NOTIFICATIONS                    │
│   Push Notifications     🔵 ON  ●  │  ← Toggle switch (right side)
│   Email Notifications    🔘 OFF ○  │
│   Quiet Hours                   >  │
├─────────────────────────────────────┤
│ 🎨 APPEARANCE                       │
│   Dark Mode              🔵 ON  ●  │
│   Text Size                     >  │
├─────────────────────────────────────┤
│ 💳 PAYMENTS                         │
│   Payment Methods               >  │
│   Transaction History           >  │
├─────────────────────────────────────┤
│ ℹ️ ABOUT                            │
│   Terms of Service              >  │
│   Privacy Policy                >  │
│   App Version: 1.0.0-beta          │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │    🚪  LOG OUT                │  │  ← Logout button, red text
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │    🗑️  DELETE ACCOUNT        │  │  ← Delete button, red text, destructive
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 20 — LEFT DRAWER MENU (slides in from left)

```
┌─────────────────────────────────────┐
│ ┌──────────────┬──────────────────┐ │
│ │              │                  │ │
│ │ DRAWER (80%) │  SCRIM (20%,     │ │ ← Tap scrim to close
│ │              │  semi-transparent│ │
│ │              │  overlay)        │ │
│ │              │                  │ │
│ └──────────────┘                  │ │
└─────────────────────────────────────┘

DRAWER CONTENT:
┌──────────────────────────┐
│ 👤 [Avatar 64dp]         │
│ Full Name  ✅            │  ← Profile summary at top
│ @username                │
│ 245 friends • 1.2K posts │
├──────────────────────────┤
│ 🏠  Home Feed            │  ← Nav items with icons (48dp tall each)
│ 👥  Friends              │
│ 💬  Messages             │
│ 🔴  Live                 │
│ 🛒  Marketplace          │
│ 📅  Events               │
│ 👥  Groups               │
│ 🎵  Music                │
│ 🎮  Gaming               │
│ 📰  Trending             │
│ 🔖  Saved                │
│ 📹  Video Calls          │
├──────────────────────────┤
│ CREATE                   │
│ ✏️  New Post             │
│ 📷  New Story            │
│ 🔴  Go Live              │
├──────────────────────────┤
│ ⚙️  Settings             │
│ ❓  Help & Support       │
│ 💎  Go Premium           │
├──────────────────────────┤
│ 🚪  Log Out              │
└──────────────────────────┘
```

---

## 📋 SCREEN 21 — VIDEO CALL PAGE

```
┌─────────────────────────────────────┐
│ ●  00:04:32              [⋯ More]   │  ← Recording dot | Timer | More options
│                                     │
│                                     │
│      REMOTE VIDEO (full screen)     │  ← Other person's video
│                                     │
│                                     │
│  ┌──────────┐                       │
│  │ MY VIDEO │                       │  ← Self-view PiP (120×160dp, draggable)
│  └──────────┘                       │
│                                     │
│  ─────────────────────────────────  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐│
│  │🎤 │ │📹 │ │🔊 │ │📺 │ │🔴 │ │  ← Controls bar
│  │Mute│ │Cam │ │Spkr│ │Share│ │End │ │
│  └────┘ └────┘ └────┘ └────┘ └────┘│
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 22 — MUSIC PAGE

```
┌─────────────────────────────────────┐
│ ←  Music                    [🔍]   │
├─────────────────────────────────────┤
│ [For You] [Trending] [Radio] [Podcasts] │
├─────────────────────────────────────┤
│ NOW PLAYING (if song active)        │
│ ┌──────────────────────────────┐   │  ← Mini player (72dp tall)
│ │ 🎵 [AlbumArt] Song Title     │   │
│ │    Artist Name    ⏮ ⏯ ⏭ ❤️  │   │
│ └──────────────────────────────┘   │
├─────────────────────────────────────┤
│ FEATURED PLAYLISTS                  │
│ ┌──────────────┐  ┌──────────────┐  │  ← 2-column playlist grid
│ │ [Cover Art]  │  │ [Cover Art]  │  │
│ │ Playlist Name│  │ Playlist Name│  │
│ │ 24 songs     │  │ 18 songs     │  │
│ └──────────────┘  └──────────────┘  │
└─────────────────────────────────────┘
```

### Full Music Player Screen (when song tapped):
```
┌─────────────────────────────────────┐
│ ∨  Now Playing              [⋯]    │  ← Collapse | More options
├─────────────────────────────────────┤
│                                     │
│         ┌──────────────────┐        │
│         │                  │        │  ← Album art (240×240dp, centered)
│         │   [Album Art]    │        │
│         │                  │        │
│         └──────────────────┘        │
│                                     │
│  Song Title                    ❤️   │  ← Song name + like button
│  Artist Name              [Add ···] │  ← Artist + add to playlist button
│                                     │
│  0:00 ─────────●────────────── 3:45 │  ← Progress scrubber
│                                     │
│  ┌────┐  ┌────┐  ┌─────┐  ┌────┐  ┌────┐ │
│  │ 🔀 │  │ ⏮  │  │  ⏯  │  │ ⏭  │  │ 🔁 │ │  ← Shuffle|Prev|Play|Next|Repeat
│  └────┘  └────┘  └─────┘  └────┘  └────┘ │
│                                     │
│  🔈 ─────────────●────────── 🔊    │  ← Volume slider
│                                     │
│  [Lyrics] [Queue] [Related] [Radio] │  ← Bottom tab options
└─────────────────────────────────────┘
```

---

## 📋 SCREEN 23 — WALLET / PAYMENTS PAGE

```
┌─────────────────────────────────────┐
│ ←  Wallet                           │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │     💎 LynkApp Coins            │ │  ← Balance card (gradient bg)
│ │                                 │ │
│ │          🪙 2,450               │ │  ← Coin balance (large)
│ │         = $24.50 USD            │ │  ← Dollar equivalent
│ │                                 │ │
│ │  [+ Buy Coins]  [→ Send Coins]  │ │  ← Two action buttons inside card
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ QUICK ACTIONS                       │
│ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │ 💰 Top │ │ 📤 Send│ │ 🎁 Gift│   │  ← Action buttons 3-column
│ │   Up   │ │ Money  │ │       │   │
│ └────────┘ └────────┘ └────────┘   │
├─────────────────────────────────────┤
│ RECENT TRANSACTIONS                 │
│ ┌──────────────────────────────┐   │
│ │ ➕ Bought 500 coins  Jun 10  │   │
│ │                    +$5.00    │   │  ← Green = credit
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │ 🎁 Gift to @user    Jun 9   │   │
│ │                    -100 🪙   │   │  ← Red = debit
│ └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 📐 BUTTON SIZE STANDARDS (Android Material Design 3)

| Button Type | Height | Min Width | Corner Radius | Usage |
|-------------|--------|-----------|---------------|-------|
| Primary (filled) | 48dp | Full width | 24dp | Main CTAs |
| Secondary (outlined) | 48dp | Full width | 24dp | Secondary actions |
| Tertiary (text) | 40dp | Wrap content | — | Destructive/links |
| FAB (center) | 56dp | 56dp | 16dp | Create/Post |
| Icon button | 40dp | 40dp | 20dp | Toolbar icons |
| Chip/Tab | 32dp | 72dp | 8dp | Filters/tags |
| Bottom nav item | 56dp | Equal | — | Main navigation |

---

## 📐 SPACING STANDARDS

| Zone | Value |
|------|-------|
| Screen horizontal margin | 16dp |
| Card internal padding | 16dp |
| Between list items | 8dp |
| Between section headers | 24dp |
| Between cards | 12dp |
| Minimum touch target | 48dp × 48dp |

---

## 🎨 COLOR SCHEME — ANDROID SPECIFIC

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Primary brand | #6C63FF (purple) | #9D95FF |
| Background | #FFFFFF | #121212 |
| Surface (cards) | #F5F5F5 | #1E1E1E |
| Text primary | #1A1A1A | #FFFFFF |
| Text secondary | #757575 | #AAAAAA |
| Error/Destructive | #D32F2F | #EF5350 |
| Success | #388E3C | #66BB6A |
| Bottom nav bg | #FFFFFF | #1E1E1E |
| Bottom nav active | #6C63FF | #9D95FF |

---

## 🔑 KEY ANDROID UX RULES FOR LYNKAPP

1. **Back button behavior** — Every screen has a back arrow. Android system back = same as back arrow.
2. **FAB position** — Center-bottom in nav bar (not floating over content)
3. **Swipe gestures** — List items: swipe right = positive action, swipe left = delete/archive
4. **Loading states** — Every list shows skeleton loader (not spinner) while loading
5. **Empty states** — Every empty list shows an illustration + message + action button
6. **Error states** — Network errors show a snackbar at bottom (not a blocking dialog)
7. **Confirmation dialogs** — Destructive actions (delete, logout) require confirmation bottom sheet
8. **Keyboard behavior** — Input fields adjust screen (keyboard pushes content up, not over)
9. **Image loading** — All images use placeholder while loading + error fallback
10. **Long press** — Long press on posts = quick action menu (like, share, save, report)
