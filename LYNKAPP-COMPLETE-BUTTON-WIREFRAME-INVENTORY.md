# LynkApp — Complete Button & Interactive Element Inventory
## For UI/UX Designer — Wireframe Button Reference Document
### Version 1.0 | June 2026

---

> **HOW TO USE THIS DOCUMENT**
> Every button, link, icon-action, tab, and interactive element is listed by screen.
> For each button you will find: Button Label · Button Type · Location on Screen · Where It Goes / What It Does

---

## GLOBAL / PERSISTENT ELEMENTS (Appear on every authenticated screen)

### TOP NAVIGATION BAR (TopNav.jsx)
| # | Button Label | Type | Position | Action / Destination |
|---|---|---|---|---|
| 1 | LynkApp Logo | Logo/Link | Top-left | → /feed (Home) |
| 2 | 🔍 Search Icon | Icon Button | Top-center | → /search |
| 3 | 🔔 Notifications Bell | Icon Button | Top-right | → /notifications |
| 4 | 💬 Messages Bubble | Icon Button | Top-right | → /messages |
| 5 | User Avatar | Icon Button | Top-right | → /profile |

---

### BOTTOM NAVIGATION BAR (BottomNav.jsx / MobileBottomNav.jsx)
| # | Button Label | Type | Position | Action / Destination |
|---|---|---|---|---|
| 1 | 🏠 Home | Tab Icon | Bottom-left | → /feed |
| 2 | 🔍 Search | Tab Icon | Bottom-center-left | → /search |
| 3 | ➕ Create | Tab Icon (Primary/FAB) | Bottom-center | → Create Post Modal |
| 4 | 🔔 Notifications | Tab Icon | Bottom-center-right | → /notifications |
| 5 | 👤 Profile | Tab Icon | Bottom-right | → /profile |

---

---

## SECTION 0 — LANDING PAGE (Public — Not Logged In)
**File:** `src/pages/landing/LandingPage.jsx`
**Route:** `/`

### Navigation Bar
| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Sign In | Text Link | Nav — top-right | → /login |
| 2 | Get Started Free | Primary CTA Button | Nav — top-right | → /login |

### Hero Section
| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 3 | Join Free → | Primary CTA Button | Hero — center | → /login |
| 4 | See Features | Secondary Ghost Button | Hero — center | Scroll to #features anchor |

### Feature Cards (12 cards — MISSING BUTTONS — need to be added)
| # | Feature Card | Button Needed | Where It Should Go |
|---|---|---|---|
| 5 | 📱 Social Feed | "Explore Feed →" | → /login?next=/feed |
| 6 | 🎥 Live Streaming | "Go Live →" | → /login?next=/live |
| 7 | 💬 Private Messaging | "Start Chatting →" | → /login?next=/messages |
| 8 | ❤️ Dating | "Find Matches →" | → /login?next=/dating |
| 9 | 🛒 Marketplace | "Browse Items →" | → /login?next=/marketplace |
| 10 | 🎮 Gaming Hub | "Play Now →" | → /login?next=/gaming |
| 11 | 🎵 Music Player | "Listen Now →" | → /login?next=/music |
| 12 | 👥 Groups & Events | "Join a Group →" | → /login?next=/groups |
| 13 | 🏪 Creator Profiles | "Become a Creator →" | → /login?next=/creator |
| 14 | 📹 Video Calls | "Start a Call →" | → /login?next=/video-calls |
| 15 | 🔔 Smart Notifications | "Stay Updated →" | → /login?next=/notifications |
| 16 | 🔒 Privacy & Safety | "Learn More →" | → /privacy |

### Bottom CTA Section
| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 17 | Create Free Account → | Primary CTA Button | Center bottom | → /login |

### Footer
| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 18 | Privacy Policy | Text Link | Footer | → /privacy |
| 19 | Terms of Service | Text Link | Footer | → /terms |
| 20 | Sign In | Text Link | Footer | → /login |
| 21 | Create Account | Text Link | Footer | → /login |

---

## SECTION 1 — AUTH & ONBOARDING

### LOGIN PAGE
**File:** `src/pages/auth/LoginPage.jsx`
**Route:** `/login`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Continue with Google | OAuth Button | Center | Google OAuth sign-in |
| 2 | Continue with Apple | OAuth Button | Center | Apple OAuth sign-in |
| 3 | Sign In (Email) | Primary Submit Button | Form bottom | Submit login form |
| 4 | Forgot Password? | Text Link | Below password field | → /forgot-password |
| 5 | Create an account | Text Link | Page bottom | → /signup |
| 6 | Demo Login | Secondary Button | Below form | Login with demo credentials |

### SIGNUP PAGE
**File:** `src/pages/auth/SignupPage.jsx`
**Route:** `/signup`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Continue with Google | OAuth Button | Top | Google OAuth |
| 2 | Continue with Apple | OAuth Button | Top | Apple OAuth |
| 3 | Create Account | Primary Submit Button | Form bottom | Submit registration |
| 4 | Already have an account? Sign In | Text Link | Page bottom | → /login |
| 5 | Terms of Service | Text Link | Inline consent | → /terms |
| 6 | Privacy Policy | Text Link | Inline consent | → /privacy |

### FORGOT PASSWORD PAGE
**File:** `src/pages/auth/ForgotPasswordPage.jsx`
**Route:** `/forgot-password`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Send Reset Email | Primary Button | Form bottom | Sends password reset email |
| 2 | Back to Sign In | Text Link / Back Button | Top or bottom | → /login |

### VERIFY EMAIL PAGE
**File:** `src/pages/auth/VerifyEmailPage.jsx`
**Route:** `/verify-email`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Resend Verification Email | Secondary Button | Center | Re-sends verification email |
| 2 | I've Verified — Continue | Primary Button | Center | → /onboarding or /feed |

### ACCOUNT RECOVERY PAGE
**File:** `src/pages/auth/AccountRecoveryPage.jsx`
**Route:** `/account-recovery`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Submit Recovery Request | Primary Button | Form bottom | Submits recovery form |
| 2 | Back to Login | Text Link | Top | → /login |

### ONBOARDING PAGE
**File:** `src/pages/onboarding/OnboardingPage.jsx`
**Route:** `/onboarding`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Next → | Primary Button | Bottom-right | Advance to next onboarding step |
| 2 | ← Back | Secondary/Ghost Button | Bottom-left | Return to previous step |
| 3 | Skip | Text Link | Top-right | Skip onboarding → /feed |
| 4 | Get Started! | Primary CTA Button | Final step | → /feed |
| 5 | Interest Tags (each) | Toggle/Chip Button | Center grid | Select/deselect interest |
| 6 | Upload Profile Photo | Image Upload Button | Center | Open camera/file picker |

### PROFILE SETUP PAGE
**File:** `src/pages/profile/ProfileSetupPage.jsx`
**Route:** `/profile-setup`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Upload Photo | Secondary Button | Center | Open file picker |
| 2 | Save & Continue | Primary Button | Bottom | Save profile → /feed |
| 3 | Skip for Now | Text Link | Bottom | → /feed |

---

## SECTION 2 — FEED / HOME

### FEED PAGE
**File:** `src/pages/feed/FeedPage.jsx`
**Route:** `/feed`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | + Create Post | FAB / Primary Button | Top of feed or sticky | Open create post modal |
| 2 | Stories Strip (each story circle) | Circular Tap Button | Horizontal scroll top | → /stories/view/[userId] |
| 3 | + Add Story (first circle) | Add Story Button | Stories strip — first | → /stories/create |
| 4 | 👍 Like / React | Icon Button | Below each post | Toggle like / open emoji reactions |
| 5 | 💬 Comment | Icon Button | Below each post | Open comments drawer |
| 6 | ↗ Share | Icon Button | Below each post | Open share sheet |
| 7 | 🔖 Save | Icon Button | Below each post | Save post to saved collection |
| 8 | ··· More Options | Overflow Icon Button | Top-right of each post | Open post options menu |
| 9 | Follow (on suggested users) | Pill Button | Suggested users widget | Follow that user |
| 10 | See All (suggested users) | Text Link | Suggested users header | → /friends/find |
| 11 | Filter: For You / Following / Trending | Tab Row | Below top nav | Switch feed algorithm |

### POST DETAIL PAGE
**File:** `src/pages/post/PostDetailPage.jsx`
**Route:** `/post/[postId]`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | ← Back | Back Arrow | Top-left | Navigate back |
| 2 | 👍 Like | Icon Button | Below post | Toggle like |
| 3 | ↗ Share | Icon Button | Below post | Share post |
| 4 | 🔖 Save | Icon Button | Below post | Save post |
| 5 | ··· Options | Overflow Button | Top-right | Edit / Delete / Report |
| 6 | Add a comment… | Input + Send Button | Bottom | Submit comment |
| 7 | Reply (on each comment) | Text Button | Below comment | Open reply thread |
| 8 | 👍 Like Comment | Icon Button | Next to comment | Toggle comment like |

### HASHTAG PAGE
**File:** `src/pages/hashtag/HashtagPage.jsx`
**Route:** `/hashtag/[tag]`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | ← Back | Back Arrow | Top-left | Navigate back |
| 2 | Follow #hashtag | Primary Button | Top | Follow that hashtag |
| 3 | Filter: Top / Recent | Tab Row | Below header | Switch sort |

---

## SECTION 3 — STORIES

### STORIES PAGE
**File:** `src/pages/stories/StoriesPage.jsx`
**Route:** `/stories`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | + Create Story | Primary FAB | Top-right | → /stories/create |
| 2 | Story Card (each) | Tap/Click | Grid | → /stories/view/[storyId] |
| 3 | My Story | Special Card | Top-left | → /stories/view/own |
| 4 | Archive | Text Link / Icon | Top | → /stories/archive |
| 5 | Highlights | Text Link / Icon | Top | → /stories/highlights |

### STORY VIEWER PAGE
**File:** `src/pages/stories/StoryViewerPage.jsx`
**Route:** `/stories/view/[storyId]`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | ✕ Close | X Button | Top-right | Close viewer → back |
| 2 | ← Previous Story | Tap Left Half | Left side | Go to previous story |
| 3 | → Next Story | Tap Right Half | Right side | Go to next story |
| 4 | ❤️ React | Emoji Reaction Bar | Bottom | React to story |
| 5 | 💬 Reply | Message Input | Bottom | Send reply to story poster |
| 6 | Send | Send Icon Button | Bottom-right of input | Send reply message |
| 7 | ··· More | Overflow Button | Top-right | Report / Mute / Share |
| 8 | ↗ Share | Icon | Bottom | Share story |

### STORY CREATE PAGE
**File:** `src/pages/stories/StoryCreatePage.jsx`
**Route:** `/stories/create`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | 📷 Camera | Tab | Top | Switch to camera mode |
| 2 | 🖼️ Gallery | Tab | Top | Pick from gallery |
| 3 | Aa Text | Tool Button | Right toolbar | Add text overlay |
| 4 | 🎨 Draw | Tool Button | Right toolbar | Draw on story |
| 5 | 😀 Sticker | Tool Button | Right toolbar | Add sticker/GIF |
| 6 | 🎵 Music | Tool Button | Right toolbar | Add background music |
| 7 | Post Story | Primary Button | Bottom-right | Publish story |
| 8 | Close / Discard | X Button | Top-left | Cancel → back |

### STORY ANALYTICS PAGE
**File:** `src/pages/stories/StoryAnalyticsPage.jsx`
**Route:** `/stories/analytics`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | ← Back | Back Arrow | Top-left | Navigate back |
| 2 | Export Data | Secondary Button | Top-right | Download analytics CSV |

### STORY HIGHLIGHTS PAGE
**File:** `src/pages/stories/StoryHighlightsPage.jsx`
**Route:** `/stories/highlights`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | + New Highlight | Primary Button | Top-right | Create highlight reel |
| 2 | Highlight Card (each) | Tap | Grid | View that highlight |
| 3 | Edit Highlight | Icon Button | On each card | Edit highlight |
| 4 | Delete Highlight | Icon Button | On each card | Delete highlight |

---

## SECTION 4 — LIVE STREAMING

### LIVE PAGE (Dashboard)
**File:** `src/pages/live/LivePage.jsx`
**Route:** `/live`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | 🔴 Go Live | Primary Red CTA Button | Top / Center | → /live/setup |
| 2 | Live Stream Card (each) | Tap | Grid | → /live/watch/[streamId] |
| 3 | Category Filter Tabs | Tab Row | Below header | Filter by category |
| 4 | Following | Tab | Top | Show followed streamers |
| 5 | Trending | Tab | Top | Show trending streams |
| 6 | Schedule a Stream | Secondary Button | Header | → /live/schedule |

### LIVE SETUP PAGE
**File:** `src/pages/live/LiveSetupPage.jsx`
**Route:** `/live/setup`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Start Streaming | Primary Red Button | Bottom | Begin broadcast |
| 2 | Add Thumbnail | Image Upload | Center | Upload stream thumbnail |
| 3 | Select Category | Dropdown | Form | Choose stream category |
| 4 | Invite Co-host | Secondary Button | Form | → co-host invite flow |
| 5 | Cancel | Ghost Button | Top-left | → /live |

### LIVE WATCH PAGE
**File:** `src/pages/live/LiveWatchPage.jsx`
**Route:** `/live/watch/[streamId]`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | ❤️ Heart / React | Floating Animation Button | Right side | Send reaction |
| 2 | 💰 Send Gift | Gift Button | Bottom-right | Open gift panel |
| 3 | 💬 Comment | Chat Input | Bottom | Send chat message |
| 4 | Send | Send Button | Chat input | Submit comment |
| 5 | Follow Streamer | Pill Button | Overlaid on video | Follow that user |
| 6 | Share Stream | Icon Button | Top-right | Share stream link |
| 7 | ··· More | Overflow | Top-right | Report / Mute |
| 8 | Full Screen | Icon | Top-right | Toggle fullscreen |
| 9 | ✕ Exit | X Button | Top-left | Leave stream → /live |

### LIVE ANALYTICS PAGE
**File:** `src/pages/live/LiveAnalyticsPage.jsx`
**Route:** `/live/analytics`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | ← Back | Back Arrow | Top-left | Navigate back |
| 2 | Date Range Picker | Dropdown | Top-right | Filter analytics by date |
| 3 | Export Report | Secondary Button | Top-right | Download analytics |

### LIVE SCHEDULE PAGE
**File:** `src/pages/live/LiveSchedulePage.jsx`
**Route:** `/live/schedule`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | + Schedule Stream | Primary Button | Top-right | Create scheduled event |
| 2 | Notify Followers | Toggle | Form | Enable pre-stream notification |
| 3 | Save Schedule | Primary Button | Bottom | Save scheduled stream |
| 4 | Cancel | Ghost Button | Bottom | → /live |

### LIVE MODERATION PAGE
**File:** `src/pages/live/LiveModerationPage.jsx`
**Route:** `/live/moderation`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Mute User | Danger Button | Per user row | Mute that user |
| 2 | Ban User | Danger Button | Per user row | Ban from stream |
| 3 | End Stream | Red Danger Button | Top-right | End live broadcast |
| 4 | Slow Mode | Toggle | Settings | Enable slow mode |

### OTHER LIVE PAGES
| Screen | Key Buttons |
|---|---|
| LiveCohostPage (/live/cohost) | Invite Co-host, Accept, Decline, End Co-host |
| LiveClipsPage (/live/clips) | Create Clip, Download, Share, Delete |
| LiveVODPage (/live/vod) | Play, Pause, Download, Share, Delete |
| LiveQAPage (/live/qa) | Submit Question, Upvote, Answer (host), Pin |
| LiveGiftsLeaderboardPage (/live/gifts) | Send Gift, View All, Top Gifters |
| LiveMonetizationPage (/live/monetize) | Enable Donations, Set Price, Withdraw |
| LiveNotificationsPage (/live/notifications) | Subscribe, Unsubscribe, Mark Read |
| LiveCategoriesPage (/live/categories) | Category Cards (each navigates to that category) |

---

## SECTION 5 — DATING

### DATING PAGE (Swipe Dashboard)
**File:** `src/pages/dating/DatingPage.jsx`
**Route:** `/dating`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | ✗ Pass / Nope | Red Circle Button | Bottom-left | Swipe left / reject |
| 2 | ⭐ Super Like | Blue Star Button | Bottom-center | Super like this profile |
| 3 | ❤️ Like | Green Heart Button | Bottom-right | Swipe right / like |
| 4 | ← Undo | Small Icon | Top-left | Undo last swipe |
| 5 | 🔥 Boost | Icon Button | Top-right | Boost your profile (premium) |
| 6 | ⚙️ Filters | Icon Button | Top-right | Open filter preferences |
| 7 | Matches Tab | Tab | Top | → /dating/matches |
| 8 | Swipe Tab | Tab | Top | Stay on swipe view |

### DATING MATCHES PAGE
**File:** `src/pages/dating/DatingMatchesPage.jsx`
**Route:** `/dating/matches`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Match Card (each) | Tap | Grid | → /dating/chat/[matchId] |
| 2 | 💬 Message | Primary Button | On each match | → /dating/chat/[matchId] |
| 3 | Unmatch | Danger Text | Match detail | Unmatch this person |
| 4 | Report | Text Link | Match detail | Report profile |

### DATING CHAT PAGE
**File:** `src/pages/dating/DatingChatPage.jsx`
**Route:** `/dating/chat/[matchId]`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | ← Back | Back Arrow | Top-left | → /dating/matches |
| 2 | View Profile | Avatar/Name | Top | → /dating/profile-view/[userId] |
| 3 | 📷 Camera | Icon | Input bar | Attach photo |
| 4 | 😀 Emoji | Icon | Input bar | Open emoji picker |
| 5 | 🎁 Gift | Icon | Input bar | Send virtual gift |
| 6 | Send | Send Button | Input bar right | Send message |
| 7 | ··· More | Overflow | Top-right | Unmatch / Block / Report |

### DATING PROFILE VIEW PAGE
**File:** `src/pages/dating/DatingProfileViewPage.jsx`
**Route:** `/dating/profile-view/[userId]`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | ← Back | Back Arrow | Top-left | Navigate back |
| 2 | ❤️ Like | Primary Button | Bottom | Like this profile |
| 3 | ✗ Pass | Secondary Button | Bottom | Pass on this profile |
| 4 | 💬 Message | Primary Button | Bottom | → /dating/chat |
| 5 | Report | Text Link | Options menu | Report profile |

### DATING PROFILE EDIT PAGE
**File:** `src/pages/dating/DatingProfileEditPage.jsx`
**Route:** `/dating/profile-edit`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | + Add Photo | Image Upload | Photo grid | Add dating photo |
| 2 | Save Changes | Primary Button | Bottom | Save profile edits |
| 3 | Cancel | Ghost Button | Bottom | Discard changes |
| 4 | Preview Profile | Secondary Button | Top-right | See how profile looks to others |

### OTHER DATING PAGES
| Screen | Key Buttons |
|---|---|
| SafetyCenterPage (/dating/safety) | Report, Block, Panic Button, Resources |
| SpeedDatingPage (/dating/speed) | Join Session, Next Match, Like, Pass |
| DatingPreferencesDeepPage (/dating/preferences) | Save Preferences, Reset Filters |
| DatingMatchCelebrationPage | Message Match, Keep Swiping |

---

## SECTION 6 — MESSAGES

### MESSAGES PAGE (Inbox)
**File:** `src/pages/messages/MessagesPage.jsx`
**Route:** `/messages`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | ✏️ New Message / Compose | FAB or Icon | Top-right | → /messages/new |
| 2 | Conversation Row (each) | Tap | List | → /messages/[conversationId] |
| 3 | 🔍 Search Conversations | Search Input | Top | Filter conversations |
| 4 | Archive | Swipe Action or Icon | On each row | Archive conversation |
| 5 | Delete | Swipe Action | On each row | Delete conversation |
| 6 | Requests Tab | Tab | Top | → /messages/requests |
| 7 | Groups Tab | Tab | Top | Show group chats |

### CONVERSATION PAGE
**File:** `src/pages/messages/ConversationPage.jsx`
**Route:** `/messages/[conversationId]`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | ← Back | Back Arrow | Top-left | → /messages |
| 2 | User Avatar/Name | Header | Top-center | → view that user's profile |
| 3 | 📷 Camera | Icon | Input bar | Attach photo/video |
| 4 | 📎 Attachment | Icon | Input bar | Attach file |
| 5 | 😀 Emoji | Icon | Input bar | Open emoji picker |
| 6 | 🎤 Voice Note | Hold Icon | Input bar | Record voice note |
| 7 | Send | Send Button | Input bar right | Send message |
| 8 | ··· More | Overflow | Top-right | Block / Mute / Report / Archive |
| 9 | Video Call | Icon | Top-right | Start video call |
| 10 | Voice Call | Icon | Top-right | Start voice call |
| 11 | React to message | Long press | On each message | Open emoji reaction |

### NEW MESSAGE PAGE
**File:** `src/pages/messages/NewMessagePage.jsx`
**Route:** `/messages/new`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | ← Back | Back Arrow | Top-left | → /messages |
| 2 | Search People | Search Input | Top | Find users to message |
| 3 | User Row (each) | Tap | List | Start conversation |
| 4 | New Group Chat | Secondary Button | Top | → /messages/group-create |

### GROUP CHAT CREATE PAGE
**File:** `src/pages/messages/GroupChatCreatePage.jsx`
**Route:** `/messages/group-create`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Search & Add Members | Search Input | Top | Search contacts |
| 2 | Add Member (each result) | + Button | Per search result | Add to group |
| 3 | Remove Member | × Button | Per added member | Remove from group |
| 4 | Upload Group Photo | Image Upload | Center | Set group avatar |
| 5 | Create Group | Primary Button | Bottom | Create group chat |
| 6 | Cancel | Ghost Button | Bottom | → /messages |

### OTHER MESSAGE PAGES
| Screen | Key Buttons |
|---|---|
| MessageRequestsPage (/messages/requests) | Accept, Decline, Delete |
| ArchivedConversationsPage (/messages/archived) | Unarchive, Delete |

---

## SECTION 7 — NOTIFICATIONS

### NOTIFICATIONS PAGE
**File:** `src/pages/notifications/NotificationsPage.jsx`
**Route:** `/notifications`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Mark All Read | Text Button | Top-right | Mark all as read |
| 2 | All / Mentions / Follows / Likes | Tab Row | Top | Filter notifications |
| 3 | Notification Row (each) | Tap | List | Navigate to that content |
| 4 | Follow Back | Pill Button | On follow notifications | Follow that user back |
| 5 | ⚙️ Settings | Icon | Top-right | → /notifications/settings |

### OTHER NOTIFICATION PAGES
| Screen | Key Buttons |
|---|---|
| ActivitySummaryPage (/notifications/activity) | Share Summary, Export |
| NotificationQuietHoursPage (/notifications/quiet-hours) | Save, Toggle switches, Time pickers |

---

## SECTION 8 — PROFILE

### PROFILE PAGE
**File:** `src/pages/profile/ProfilePage.jsx`
**Route:** `/profile` or `/profile/[userId]`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Edit Profile | Primary Button | Below avatar (own profile) | → /profile/edit |
| 2 | Follow | Primary Button | Below avatar (other's profile) | Follow that user |
| 3 | Following | Secondary Button (toggle) | If already following | Unfollow |
| 4 | Message | Secondary Button | Other's profile | → /messages/new/[userId] |
| 5 | ··· More | Overflow | Top-right | Report / Block / Share |
| 6 | Posts Tab | Tab | Profile grid | Show posts |
| 7 | Reels/Videos Tab | Tab | Profile grid | Show video content |
| 8 | Tagged Tab | Tab | Profile grid | Show tagged posts |
| 9 | [Followers count] | Clickable Number | Profile stats | → /profile/followers |
| 10 | [Following count] | Clickable Number | Profile stats | → /profile/following |
| 11 | ⚙️ Settings | Icon Button | Top-right (own profile) | → /settings |
| 12 | Share Profile | Icon Button | Top-right | Share profile link |

### PROFILE EDIT PAGE
**File:** `src/pages/profile/ProfileEditPage.jsx`
**Route:** `/profile/edit`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Change Photo | Image Overlay Button | On avatar | Open file picker |
| 2 | Save | Primary Button | Top-right / Bottom | Save changes |
| 3 | Cancel | Ghost Button | Top-left | Discard changes |

### OTHER PROFILE PAGES
| Screen | Key Buttons |
|---|---|
| FollowersPage (/profile/followers) | Follow Back (each), Remove Follower |
| FollowingPage (/profile/following) | Unfollow (each) |
| ProfileInsightsPage (/profile/insights) | Date Filter, Export |
| ProfileVerifyRequestPage (/profile/verify) | Submit Verification Request |

---

## SECTION 9 — FRIENDS

### FRIENDS PAGE
**File:** `src/pages/friends/FriendsPage.jsx`
**Route:** `/friends`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | + Find Friends | Primary Button | Top-right | → /friends/find |
| 2 | Friend Request (Accept) | Green Button | Requests section | Accept friend request |
| 3 | Decline | Gray Button | Requests section | Decline friend request |
| 4 | Message | Icon | Friend list item | → /messages/[userId] |
| 5 | Unfriend | ··· Overflow | Friend list item | Remove friend |
| 6 | Nearby Tab | Tab | Top | → /friends/nearby |
| 7 | Birthdays Tab | Tab | Top | → /friends/birthdays |
| 8 | Suggestions Tab | Tab | Top | Show suggested friends |

### FRIEND FIND PAGE
**File:** `src/pages/friends/FriendFindPage.jsx`
**Route:** `/friends/find`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | 🔍 Search | Search Input | Top | Search by name/username |
| 2 | Add Friend | Primary Pill Button | Per search result | Send friend request |
| 3 | Request Sent | Disabled Button | After sending | Shows request pending |
| 4 | Import Contacts | Secondary Button | Top | Access contacts |

---

## SECTION 10 — GROUPS

### GROUPS PAGE
**File:** `src/pages/groups/GroupsPage.jsx`
**Route:** `/groups`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | + Create Group | Primary Button | Top-right | → /groups/create |
| 2 | Group Card (each) | Tap | Grid | → /groups/[groupId] |
| 3 | Join | Pill Button | On each group card | Join that group |
| 4 | Discover Tab | Tab | Top | Find new groups |
| 5 | My Groups Tab | Tab | Top | Show joined groups |

### GROUP DETAIL PAGE
**File:** `src/pages/groups/GroupDetailPage.jsx`
**Route:** `/groups/[groupId]`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Join Group | Primary Button | Top | Join this group |
| 2 | Leave Group | Danger Text Button | Top (if member) | Leave group |
| 3 | Invite Friends | Secondary Button | Header | Share invite link |
| 4 | + Post to Group | Primary Button | Feed area | Create post in group |
| 5 | Members (count) | Clickable | Header stats | → /groups/[id]/members |
| 6 | ⚙️ Manage (admin) | Settings Icon | Top-right | → group settings |
| 7 | About Tab | Tab | Top | Show group info |
| 8 | Posts Tab | Tab | Top | Show group posts |
| 9 | Media Tab | Tab | Top | Show group media |
| 10 | Members Tab | Tab | Top | Show member list |

### GROUP CREATE PAGE
**File:** `src/pages/groups/GroupCreatePage.jsx`
**Route:** `/groups/create`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Upload Cover Photo | Image Upload | Center | Set group banner |
| 2 | Public / Private | Toggle Buttons | Form | Set group privacy |
| 3 | Create Group | Primary Button | Bottom | Submit and create group |
| 4 | Cancel | Ghost Button | Bottom | → /groups |

---

## SECTION 11 — EVENTS

### EVENTS PAGE
**File:** `src/pages/events/EventsPage.jsx`
**Route:** `/events`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | + Create Event | Primary Button | Top-right | → /events/create |
| 2 | Event Card (each) | Tap | Grid | → /events/[eventId] |
| 3 | RSVP / Going | Pill Button | On each event card | RSVP to event |
| 4 | Discover / My Events | Tab Row | Top | Filter events |
| 5 | Calendar View | Icon Toggle | Top-right | Switch to calendar view |

### EVENT DETAIL PAGE
**File:** `src/pages/events/EventDetailPage.jsx`
**Route:** `/events/[eventId]`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | ✅ Going | Primary Button | Top | RSVP as going |
| 2 | 🤔 Maybe | Secondary Button | Top | RSVP as maybe |
| 3 | ✗ Can't Go | Ghost Button | Top | Decline event |
| 4 | Share Event | Icon | Top-right | Share event link |
| 5 | Invite Friends | Secondary Button | Middle | Invite friends to event |
| 6 | Get Directions | Map Button | Location section | Open maps app |
| 7 | View Attendees | Text Link | Attendees count | → /events/[id]/attendees |
| 8 | ··· More | Overflow | Top-right | Report / Save |

### EVENT CREATE PAGE
**File:** `src/pages/events/EventCreatePage.jsx`
**Route:** `/events/create`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Upload Event Photo | Image Upload | Top | Set event banner |
| 2 | Pick Date & Time | Date Picker | Form | Choose event date |
| 3 | Add Location | Location Input | Form | Set event location |
| 4 | In Person / Online | Toggle | Form | Event type |
| 5 | Publish Event | Primary Button | Bottom | Create event |
| 6 | Save as Draft | Secondary Button | Bottom | Save without publishing |
| 7 | Cancel | Ghost Button | Bottom | → /events |

---

## SECTION 12 — MARKETPLACE

### MARKETPLACE PAGE
**File:** `src/pages/marketplace/MarketplacePage.jsx`
**Route:** `/marketplace`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | + Sell an Item | Primary Button | Top-right | → /marketplace/create-listing |
| 2 | Product Card (each) | Tap | Grid | → /marketplace/product/[id] |
| 3 | 🔍 Search | Search Input | Top | Search products |
| 4 | Category Filter | Horizontal scroll chips | Below search | Filter by category |
| 5 | Sort: Newest / Price | Dropdown | Top-right | Sort product grid |
| 6 | 🗺️ Map View | Map Icon | Top-right | → Map modal |
| 7 | My Orders | Text Link | Top | → /marketplace/orders |
| 8 | Seller Dashboard | Text Link | Top | → /marketplace/seller-dashboard |
| 9 | 🔖 Save Item | Icon | On each product card | Add to saved items |

### PRODUCT DETAIL PAGE
**File:** `src/pages/marketplace/ProductDetailPage.jsx`
**Route:** `/marketplace/product/[productId]`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | ← Back | Back Arrow | Top-left | Navigate back |
| 2 | 🔖 Save | Icon | Top-right | Save product |
| 3 | ↗ Share | Icon | Top-right | Share product link |
| 4 | Add to Cart | Primary Button | Bottom | Add to cart |
| 5 | Buy Now | CTA Button | Bottom | → /marketplace/checkout |
| 6 | 💬 Message Seller | Secondary Button | Bottom | → /messages/[sellerId] |
| 7 | View Seller Profile | Text Link | Seller section | → /marketplace/seller/[id] |
| 8 | Photo Gallery (each) | Tap | Top | Expand/view photo |
| 9 | Write a Review | Text Link | Reviews section | → /marketplace/review/[id] |

### CHECKOUT PAGE
**File:** `src/pages/marketplace/CheckoutPage.jsx`
**Route:** `/marketplace/checkout`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Edit Cart | Text Button | Cart summary | Modify cart |
| 2 | Apply Promo Code | Secondary Button | Form | Apply discount |
| 3 | Change Address | Text Button | Shipping section | Edit shipping address |
| 4 | Select Payment | Dropdown/Cards | Payment section | Choose payment method |
| 5 | Place Order | Primary CTA Button | Bottom | Submit order |
| 6 | Cancel | Ghost Button | Bottom | → /marketplace |

### CREATE LISTING WIZARD
**File:** `src/pages/marketplace/CreateListingWizard.jsx`
**Route:** `/marketplace/create-listing`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | + Add Photos | Image Upload | Top | Upload product photos |
| 2 | Next → | Primary Button | Bottom-right | Advance wizard step |
| 3 | ← Back | Secondary Button | Bottom-left | Previous step |
| 4 | Publish Listing | Primary Button | Final step | Publish product |
| 5 | Save as Draft | Secondary Button | Final step | Save without publishing |

### SELLER DASHBOARD PAGE
**File:** `src/pages/marketplace/SellerDashboardPage.jsx`
**Route:** `/marketplace/seller-dashboard`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | + New Listing | Primary Button | Top-right | → /marketplace/create-listing |
| 2 | Edit Listing | Icon | Per listing row | Edit that listing |
| 3 | Delete Listing | Danger Icon | Per listing row | Delete listing |
| 4 | Mark as Sold | Button | Per active listing | Mark sold |
| 5 | Withdraw Earnings | Primary Button | Earnings section | Initiate payout |
| 6 | View KYC Status | Text Link | Header | → /marketplace/kyc |

### OTHER MARKETPLACE PAGES
| Screen | Key Buttons |
|---|---|
| MyOrdersPage (/marketplace/orders) | Track Order, Cancel Order, Request Return |
| SellerKYCPage (/marketplace/kyc) | Upload ID, Submit Verification |
| WriteReviewPage (/marketplace/review) | Submit Review, Upload Photos, Star Rating |
| ReturnsPage (/marketplace/returns) | Request Return, Upload Evidence, Submit |
| SellerProfilePage (/marketplace/seller/[id]) | Follow Seller, Message, Report |

---

## SECTION 13 — SEARCH

### SEARCH PAGE
**File:** `src/pages/search/SearchPage.jsx`
**Route:** `/search`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Search Input | Input Field | Top | Enter search query |
| 2 | Cancel | Text Button | Right of input | Clear search → back |
| 3 | All / People / Posts / Groups / Events / Tags | Tab Row | Below input | Filter search results |
| 4 | Result Row (each) | Tap | List | Navigate to that result |
| 5 | Follow (on people results) | Pill Button | Per person result | Follow that user |
| 6 | Trending Hashtag (each) | Chip | Trending section | → /hashtag/[tag] |

---

## SECTION 14 — SETTINGS

### SETTINGS PAGE
**File:** `src/pages/settings/SettingsPage.jsx`
**Route:** `/settings`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | ← Back | Back Arrow | Top-left | → /profile |
| 2 | Account | Row | List | → Account settings sub-page |
| 3 | Privacy | Row | List | → Privacy settings sub-page |
| 4 | Notifications | Row | List | → /settings/notifications |
| 5 | Security | Row | List | → Security settings sub-page |
| 6 | Appearance / Theme | Row | List | → Theme settings |
| 7 | Language | Row | List | → Language picker |
| 8 | Blocked Users | Row | List | → Blocked users list |
| 9 | Help & Support | Row | List | → /help |
| 10 | About | Row | List | → /about |
| 11 | Log Out | Danger Text Button | Bottom | Sign out |
| 12 | Delete Account | Danger Text | Bottom | → /settings/delete-account |

### SETTINGS SUB-PAGES
**File:** `src/pages/settings/SettingsSubPages.jsx`

| Screen | Key Buttons |
|---|---|
| Account Settings | Save Changes, Change Email, Change Username |
| Privacy Settings | Save (per toggle group), toggle switches |
| Push Notifications (/settings/notifications) | Save, toggle per category |
| AccountSecurityPages | Change Password, Enable 2FA, Connected Apps → Revoke |
| DeleteAccountPage (/settings/delete-account) | Confirm Delete (danger), Cancel |

---

## SECTION 15 — MUSIC

### MUSIC PAGE
**File:** `src/pages/music/MusicPage.jsx`
**Route:** `/music`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | ▶ Play / ⏸ Pause | Primary Circle Button | Player bar | Toggle playback |
| 2 | ⏭ Next Track | Icon | Player bar | Skip to next |
| 3 | ⏮ Previous Track | Icon | Player bar | Go to previous |
| 4 | 🔀 Shuffle | Icon Toggle | Player bar | Toggle shuffle |
| 5 | 🔁 Repeat | Icon Toggle | Player bar | Toggle repeat |
| 6 | ❤️ Like Track | Heart Icon | Now playing | Like this song |
| 7 | + Add to Playlist | Icon | Track row | Add to playlist |
| 8 | ··· More | Overflow | Track row | Share / Queue / Artist |
| 9 | Search Music | Input | Top | Search songs/artists |
| 10 | Now Playing | Mini Player Tap | Bottom | Expand full player |
| 11 | For You / Charts / Playlists | Tab Row | Top | Filter music view |

### PODCAST PAGE
**File:** `src/pages/music/PodcastPage.jsx`
**Route:** `/music/podcasts`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | ▶ Play Episode | Play Button | Per episode | Start playback |
| 2 | Subscribe | Primary Button | Show detail | Subscribe to podcast |
| 3 | + | Add Icon | Per episode | Add to queue |
| 4 | Download | Download Icon | Per episode | Download episode |

---

## SECTION 16 — VIDEO CALLS

### VIDEO CALLS PAGE
**File:** `src/pages/videocalls/VideoCallsPage.jsx`
**Route:** `/video-calls`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | + New Call | Primary Button | Top-right | Start new video call |
| 2 | Recent Call (each) | Tap | List | Call that person back |
| 3 | 📹 Video Icon | Icon | Per call log row | Start video call |
| 4 | 📞 Voice Icon | Icon | Per call log row | Start voice call |
| 5 | History Tab | Tab | Top | → /video-calls/history |
| 6 | Meetings Tab | Tab | Top | → /meetings |

### VIDEO CALL ROOM PAGE
**File:** `src/pages/videocalls/VideoCallRoomPage.jsx`
**Route:** `/video-calls/room/[callId]`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | 🎤 Mute / Unmute | Toggle Button | Bottom control bar | Toggle microphone |
| 2 | 📹 Camera On/Off | Toggle Button | Bottom control bar | Toggle camera |
| 3 | 📺 Screen Share | Toggle Button | Bottom control bar | Share your screen |
| 4 | 💬 Chat | Icon Button | Bottom | Open in-call chat |
| 5 | ↗ Invite | Icon Button | Bottom | Invite more participants |
| 6 | 📷 Flip Camera | Icon | Top | Switch front/rear camera |
| 7 | 🔴 End Call | Red Circle Button | Bottom-center | End and leave call |
| 8 | Virtual Background | Icon | Top | Select virtual background |

---

## SECTION 17 — GAMING

### GAMING PAGE
**File:** `src/pages/gaming/GamingPage.jsx`
**Route:** `/gaming`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Play (per game) | Primary Button | Game card | Launch game |
| 2 | Leaderboard | Tab / Button | Top | View rankings |
| 3 | Tournaments | Tab | Top | View active tournaments |
| 4 | Challenge Friend | Secondary Button | Game detail | Invite friend to play |
| 5 | View All Games | Text Link | Sections | Show full game list |
| 6 | My Stats | Tab | Profile | View personal stats |

---

## SECTION 18 — CREATOR PROFILE

### CREATOR PAGE
**File:** `src/pages/creator/CreatorPage.jsx`
**Route:** `/creator`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Apply to Become a Creator | Primary Button | Header | Open creator application |
| 2 | Creator Dashboard | Primary Button | Header (if creator) | → /creator/dashboard |
| 3 | + Create Post | Button | Dashboard | Create content post |
| 4 | Monetization | Tab/Button | Dashboard | → /creator/monetization |
| 5 | Analytics | Tab/Button | Dashboard | → /creator/analytics |
| 6 | Subscriptions | Tab/Button | Dashboard | Manage subscription tiers |
| 7 | Withdraw | Primary Button | Earnings section | Withdraw earnings |

### CREATOR SUB-PAGES
**File:** `src/pages/creator/CreatorSubPages.jsx` & `CreatorExtraPages.jsx`

| Screen | Key Buttons |
|---|---|
| CreatorAnalytics | Date Filter, Export CSV |
| CreatorMonetization | Set Price, Enable Tips, Enable Paid Posts |
| CreatorSubscriptions | Create Tier, Edit Tier, Delete Tier |

---

## SECTION 19 — BUSINESS PROFILE

### BUSINESS PAGE
**File:** `src/pages/business/BusinessPage.jsx`
**Route:** `/business`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Set Up Business Profile | Primary Button | Header | Create business profile |
| 2 | Business Dashboard | Primary Button | If already setup | View dashboard |
| 3 | Boost Post | Button | Per post | Promote that post |
| 4 | Insights | Tab | Dashboard | View business analytics |
| 5 | Create Ad | Primary Button | Ads section | Launch ad campaign |

---

## SECTION 20 — PREMIUM

### PREMIUM PAGE
**File:** `src/pages/premium/PremiumPage.jsx`
**Route:** `/premium`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Upgrade to Premium | Gold/Primary CTA | Hero section | → payment flow |
| 2 | Monthly Plan | Radio/Select | Pricing | Select monthly |
| 3 | Annual Plan (Save X%) | Radio/Select | Pricing | Select annual |
| 4 | Start Free Trial | Primary Button | Bottom | Begin trial |
| 5 | Compare Plans | Text Link | Below pricing | Expand feature comparison |
| 6 | Manage Subscription | Text Button | If subscribed | Cancel / change plan |

### PREMIUM FEATURES PAGE
**File:** `src/pages/premium/PremiumFeaturesPage.jsx`
**Route:** `/premium/features`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Get Premium | Primary CTA | Per feature section | → /premium |
| 2 | ← Back | Back Arrow | Top-left | Navigate back |

---

## SECTION 21 — WALLET

### WALLET PAGE
**File:** `src/pages/wallet/WalletPage.jsx`
**Route:** `/wallet`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Add Funds | Primary Button | Top | Add money to wallet |
| 2 | Withdraw | Secondary Button | Top | Withdraw funds |
| 3 | Send Money | Primary Button | Top | Send to another user |
| 4 | Transaction Row (each) | Tap | List | View transaction detail |
| 5 | Payment Method | Row | List | Manage cards/bank |
| 6 | + Add Payment Method | Text Button | Payment section | Add new card/bank |

---

## SECTION 22 — AR/VR

### AR/VR PAGE
**File:** `src/pages/arvr/ARVRPage.jsx`
**Route:** `/ar-vr`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Launch AR Filter | Primary Button | Per filter card | Open AR camera |
| 2 | Apply Filter | Button | AR camera mode | Apply selected filter |
| 3 | 📷 Capture | Shutter Button | AR mode | Take photo with filter |
| 4 | 🎥 Record | Hold Button | AR mode | Record video with filter |
| 5 | Share | Share Button | Post-capture | Share to feed/stories |
| 6 | Save | Save Button | Post-capture | Save to device |

---

## SECTION 23 — HELP & SUPPORT

### HELP PAGE
**File:** `src/pages/help/HelpPage.jsx`
**Route:** `/help`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | 🔍 Search Help Articles | Search Input | Top | Search knowledge base |
| 2 | Article Row (each) | Tap | List | Open help article |
| 3 | Contact Support | Primary Button | Top / Bottom | Open support ticket form |
| 4 | Live Chat | Secondary Button | Header | Start live chat |
| 5 | Category (each) | Chip/Card | Grid | Filter by help category |
| 6 | Was this helpful? Yes / No | Feedback Buttons | Bottom of articles | Rate article |

### HELP SUB-PAGES
**File:** `src/pages/help/HelpSubPages.jsx`

| Screen | Key Buttons |
|---|---|
| Submit Ticket | Submit, Attach File, Cancel |
| FAQ Page | Expand/Collapse each question |
| Community Forum | Post Question, Reply, Vote |

---

## SECTION 24 — LEGAL & MISC

| Screen | Route | Key Buttons |
|---|---|---|
| TermsPage | /terms | Accept, Download PDF, Back |
| PrivacyPage | /privacy | Accept, Download PDF, Back |
| AboutPage | /about | Back |
| ContactPage | /contact | Send Message, Attach File |
| CookiePolicyPage | /cookies | Accept All, Customize, Reject |
| InvitePage | /invite | Copy Link, Share via SMS, Share via Email |
| FeedbackPage | /feedback | Submit Feedback, Attach Screenshot, Cancel |
| WhatsNewPage | /whats-new | Back |
| ReportPage | /report | Submit Report, Cancel |

---

## SECTION 25 — ADMIN DASHBOARD (Admin Users Only)

### ADMIN DASHBOARD
**File:** `src/pages/admin/AdminDashboardPage.jsx`
**Route:** `/admin`

| # | Button Label | Type | Position | Action |
|---|---|---|---|---|
| 1 | Users Tab | Tab | Sidebar | → /admin/users |
| 2 | Reports Tab | Tab | Sidebar | → /admin/reports |
| 3 | KYC Review Tab | Tab | Sidebar | → /admin/kyc |
| 4 | Verification Tab | Tab | Sidebar | → /admin/verification |
| 5 | Analytics Tab | Tab | Sidebar | → /admin/analytics |
| 6 | Ban User | Danger Button | Per user row | Ban that account |
| 7 | Approve KYC | Green Button | KYC queue | Approve identity |
| 8 | Reject KYC | Red Button | KYC queue | Reject identity |
| 9 | Approve Verification | Green Button | Verification queue | Grant verified badge |
| 10 | Dismiss Report | Secondary Button | Reports queue | Dismiss false report |
| 11 | Take Action | Primary Button | Reports queue | Act on valid report |
| 12 | Export Data | Secondary Button | Analytics | Export to CSV |

---

## SECTION 26 — BETA PAGES

| Screen | Route | Key Buttons |
|---|---|---|
| BetaWelcomePage | /beta | Continue, Skip Tour, Give Feedback |
| BetaDashboardPage | /beta/dashboard | Submit Feedback, Report Bug, View Roadmap |

---

## SECTION 27 — MEETINGS

| Screen | Route | Key Buttons |
|---|---|---|
| MeetingDashboardPage | /meetings | + New Meeting, Join by Code, Scheduled Meetings list |
| MeetingWaitingRoomPage | /meetings/waiting | Leave, Admit (host), Settings |
| MeetingRoomPage | /meetings/room | Mute, Camera, Share Screen, End, Chat, Participants |

---

## SECTION 28 — SAVED / MEDIA HUB

| Screen | Route | Key Buttons |
|---|---|---|
| SavedPage | /saved | Collections grid, Create Collection, Remove from Saved |
| MediaHubPage | /media-hub | Upload, Filter tabs, Download, Share, Delete |

---

## BUTTON TYPE LEGEND (For Designer Reference)

| Type | Description | Suggested Visual |
|---|---|---|
| **Primary CTA** | Main action on the screen | Filled, brand color (purple/pink gradient), rounded-full |
| **Secondary** | Alternate or supporting action | Outlined border, no fill, brand color text |
| **Ghost** | Low-emphasis, cancel/back | No border, no fill, gray text |
| **Danger** | Destructive actions (delete, ban, block) | Filled red or red text |
| **Icon Button** | Action icon only, no label | 44×44px tap target minimum |
| **Tab** | Navigation tabs within a section | Underline style or pill style |
| **Pill Button** | Inline contextual action | Small, rounded-full, outlined or filled |
| **Toggle / Switch** | On/Off settings | iOS-style toggle switch |
| **FAB** | Floating Action Button (create/compose) | Large circle, brand gradient, elevated shadow |
| **OAuth Button** | Social sign-in | White fill, social brand icon, black border |
| **Chip** | Filter / interest tag | Small pill, tap to select/deselect |

---

## MISSING BUTTONS PRIORITY LIST
*(These need to be added by the developer after designer delivers wireframes)*

| Priority | Location | Missing Button | Notes |
|---|---|---|---|
| 🔴 HIGH | Landing Page — each of 12 Feature Cards | "Explore →" CTA | Links to /login?next=[section] |
| 🔴 HIGH | Landing Page Nav | Features, About, Pricing nav links | Direct anchor links |
| 🔴 HIGH | Feed Page | "Load More" / infinite scroll indicator | Pagination feedback |
| 🟡 MEDIUM | Profile Page | "Share Profile" prominent button | Currently only in overflow |
| 🟡 MEDIUM | Story Viewer | "Add to Highlights" button | After viewing own stories |
| 🟡 MEDIUM | Marketplace | Cart icon with item count badge | Global cart button |
| 🟡 MEDIUM | Messages | "Mark All Read" | In messages header |
| 🟢 LOW | All pages | "Back to Top" scroll button | On long pages |
| 🟢 LOW | All pages | Cookie Consent "Manage Preferences" | Additional option needed |

---

*Document prepared: June 2026 | LynkApp ConnectHub-SPA | Total buttons catalogued: 350+*
