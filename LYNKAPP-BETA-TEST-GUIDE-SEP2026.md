# LYNKAPP — COMPLETE BETA TEST GUIDE
**Version:** 1.0 — September 2026  
**Tester #1:** CEO / App Owner  
**Platform:** Android (Internal Testing Track — Google Play)  
**App:** LynkApp (com.lynkapp.app)

---

## PRE-TEST SETUP (Do This First — One Time)

### Step 1: Install the Beta APK on Your Android Phone
1. Open **Google Play Console** → Your LynkApp app → **Testing** → **Internal Testing**
2. Copy the **Internal Testing Link**
3. Open that link on your Android phone
4. Tap **"Become a tester"** → **"Download LynkApp"**
5. Install the app

### Step 2: Open Android Studio Logcat (Optional but Helpful)
If you want to see push notification logs in real-time:
1. Connect your phone via USB
2. Open Android Studio → **Logcat** tab
3. Filter by: `[Push]`

### Step 3: What to Record When You Find a Bug
For each bug you find, write down:
- **Section:** (e.g., "Feed")
- **What you did:** (e.g., "Tapped the like button")
- **What happened:** (e.g., "App crashed")
- **What should happen:** (e.g., "Post should get a like")
- **Severity:** Critical / Major / Minor

---

## ═══════════════════════════════════════════════════
## PHASE 1 BETA — SECTION-BY-SECTION TEST CHECKLIST
## (13 Fully Ready Sections)
## ═══════════════════════════════════════════════════

---

## TEST SESSION 1: AUTH & ONBOARDING
**Estimated Time:** 15–20 minutes  
**Status:** ✅ READY FOR BETA

### Step-by-Step Tests:

**Test 1.1 — Sign Up with Email (New Account)**
- [ ] Open LynkApp for the first time
- [ ] Tap **"Create Account"**
- [ ] Enter a NEW email address (not your main one — use a test email)
- [ ] Enter a password (8+ characters)
- [ ] Tap **"Sign Up"**
- ✅ **Expected:** Email verification sent, redirected to verify email screen
- 🔴 **Bug if:** App crashes, no email sent, stuck on loading

**Test 1.2 — Email Verification**
- [ ] Check your email inbox
- [ ] Click the **"Verify your email"** link
- [ ] Return to the app and tap **"I've verified my email"**
- ✅ **Expected:** Moved to onboarding / profile setup
- 🔴 **Bug if:** Link doesn't work, app doesn't detect verification

**Test 1.3 — Onboarding Flow**
- [ ] Add a **profile photo** (tap the camera icon)
- [ ] Enter your **display name** and **username**
- [ ] Select **3+ interests** from the list
- [ ] Choose your **age range / preferences**
- [ ] Tap **"Get Started"**
- ✅ **Expected:** Lands on Feed/Home screen
- 🔴 **Bug if:** Can't upload photo, can't proceed, crashes

**Test 1.4 — Log Out and Log Back In**
- [ ] Go to **Settings** → **Log Out**
- [ ] On the login screen, enter your email + password
- [ ] Tap **"Sign In"**
- ✅ **Expected:** Returns to Feed where you left off
- 🔴 **Bug if:** Wrong screen after login, session not restored

**Test 1.5 — Forgot Password**
- [ ] Tap **"Forgot Password"** on the login screen
- [ ] Enter your test email → Tap **"Send Reset Email"**
- [ ] Check email → Click reset link
- [ ] Set a new password
- [ ] Log in with the new password
- ✅ **Expected:** Password changed, successfully logged in
- 🔴 **Bug if:** No email received, reset link broken, can't log in after

**Test 1.6 — Google Sign In** *(if you have a Google account on the phone)*
- [ ] Log out first
- [ ] Tap **"Continue with Google"**
- [ ] Select your Google account
- ✅ **Expected:** Logged in immediately or taken to onboarding
- 🔴 **Bug if:** Google sign-in screen doesn't appear, crashes

**SESSION 1 NOTES:**
```
Date Tested: _______________
Bugs Found: _______________
Overall: Pass / Fail / Partial
```

---

## TEST SESSION 2: FEED & HOME
**Estimated Time:** 20–30 minutes  
**Status:** ✅ READY FOR BETA

### Step-by-Step Tests:

**Test 2.1 — Feed Loads**
- [ ] Open the app → You should see the main **Feed/Home** screen
- [ ] Scroll down through at least 10 posts
- ✅ **Expected:** Posts load smoothly, images appear, no blank cards
- 🔴 **Bug if:** Infinite loading, white boxes, crashes while scrolling

**Test 2.2 — Create a Text Post**
- [ ] Tap the **"+"** or **"Create Post"** button
- [ ] Type: *"Hello LynkApp! First beta test post 🎉"*
- [ ] Tap **"Post"**
- ✅ **Expected:** Post appears at the top of your feed immediately
- 🔴 **Bug if:** Post doesn't appear, error message, crash

**Test 2.3 — Create a Photo Post**
- [ ] Tap **"+"** → **"Add Photo"**
- [ ] Take a photo or choose from gallery
- [ ] Add a caption: *"Beta testing photo post"*
- [ ] Tap **"Post"**
- ✅ **Expected:** Photo post appears with the caption and your name
- 🔴 **Bug if:** Photo won't upload, stuck on uploading, wrong photo shown

**Test 2.4 — Like a Post**
- [ ] Find any post in the feed
- [ ] Tap the **Heart/Like** button
- ✅ **Expected:** Like count increases by 1, heart turns red/filled
- 🔴 **Bug if:** Number doesn't change, like doesn't save after refresh

**Test 2.5 — Comment on a Post**
- [ ] Tap the **Comment** icon on any post
- [ ] Type: *"Great post!"*
- [ ] Tap **"Send"**
- ✅ **Expected:** Comment appears in the comments list
- 🔴 **Bug if:** Comment doesn't post, keyboard covers input, crash

**Test 2.6 — Share a Post**
- [ ] Tap the **Share** icon on any post
- ✅ **Expected:** Share sheet appears with options (copy link, share to messages, etc.)
- 🔴 **Bug if:** Nothing happens when tapped

**Test 2.7 — Feed Refresh**
- [ ] Pull down on the feed to refresh
- ✅ **Expected:** Loading spinner appears briefly, feed refreshes
- 🔴 **Bug if:** Nothing happens, crashes, duplicate posts appear

**Test 2.8 — Delete Your Own Post**
- [ ] Find the post you created in 2.2
- [ ] Tap the **3-dot menu (•••)** on your post
- [ ] Tap **"Delete"**
- ✅ **Expected:** Post is removed from the feed
- 🔴 **Bug if:** Post can't be deleted, still appears after deletion

**SESSION 2 NOTES:**
```
Date Tested: _______________
Bugs Found: _______________
Overall: Pass / Fail / Partial
```

---

## TEST SESSION 3: STORIES
**Estimated Time:** 15–20 minutes  
**Status:** ✅ READY FOR BETA

### Step-by-Step Tests:

**Test 3.1 — View Stories Strip**
- [ ] Look at the top of the Feed — you should see stories at the top
- [ ] Tap any story circle to view it
- ✅ **Expected:** Story opens full-screen, auto-progresses after a few seconds
- 🔴 **Bug if:** Stories strip doesn't appear, tapping does nothing

**Test 3.2 — Create a Photo Story**
- [ ] Tap the **"+"** on your own story circle (or the "Create Story" button)
- [ ] Take a photo or choose from gallery
- [ ] Add text if desired → Tap **"Share Story"**
- ✅ **Expected:** Your story appears in the strip with a colorful ring
- 🔴 **Bug if:** Can't create story, photo won't upload, crash

**Test 3.3 — View Your Own Story**
- [ ] Tap your story circle
- ✅ **Expected:** Story plays, shows your username and timestamp
- 🔴 **Bug if:** Your story doesn't show your name, plays incorrectly

**Test 3.4 — Story Disappears in 24 Hours** *(Note only — don't wait, just verify it has a timer)*
- [ ] While viewing your story, check if there's a time indicator
- ✅ **Expected:** Stories show when they expire (e.g., "23h left")

**SESSION 3 NOTES:**
```
Date Tested: _______________
Bugs Found: _______________
Overall: Pass / Fail / Partial
```

---

## TEST SESSION 4: PROFILE
**Estimated Time:** 15–20 minutes  
**Status:** ✅ READY FOR BETA

### Step-by-Step Tests:

**Test 4.1 — View Your Profile**
- [ ] Tap the **Profile** tab (bottom navigation)
- ✅ **Expected:** Your name, photo, bio, follower count, and posts all visible
- 🔴 **Bug if:** Profile is empty, photo doesn't load, counts show 0 when wrong

**Test 4.2 — Edit Profile**
- [ ] Tap **"Edit Profile"**
- [ ] Change your **bio** to: *"LynkApp beta tester #1"*
- [ ] Change your **profile photo**
- [ ] Tap **"Save"**
- ✅ **Expected:** Profile updates immediately with new bio and photo
- 🔴 **Bug if:** Changes don't save, photo won't update, crashes

**Test 4.3 — View Profile Insights**
- [ ] Tap **"Insights"** or **"Analytics"** on your profile
- ✅ **Expected:** Shows profile views, reach, post impressions
- 🔴 **Bug if:** Page crashes, all zeros with no explanation

**Test 4.4 — Follow / Unfollow** *(requires another account)*
- [ ] Search for another user
- [ ] Tap **"Follow"** on their profile
- ✅ **Expected:** Button changes to "Following", their follower count increases
- [ ] Tap **"Following"** → **"Unfollow"**
- ✅ **Expected:** Button returns to "Follow"

**SESSION 4 NOTES:**
```
Date Tested: _______________
Bugs Found: _______________
Overall: Pass / Fail / Partial
```

---

## TEST SESSION 5: MESSAGES / DMs
**Estimated Time:** 20–25 minutes  
**Status:** ✅ READY FOR BETA  
**Note:** For full testing, use 2 devices or 2 accounts

### Step-by-Step Tests:

**Test 5.1 — Open Messages**
- [ ] Tap the **Messages** tab (bottom nav)
- ✅ **Expected:** Messages list appears (empty if no conversations yet)
- 🔴 **Bug if:** Crashes, shows error screen

**Test 5.2 — Start a New Conversation**
- [ ] Tap the **"+"** or **"New Message"** icon
- [ ] Search for a user by username
- [ ] Tap their name
- [ ] Type: *"Hey! This is a beta test message 👋"*
- [ ] Tap **Send**
- ✅ **Expected:** Message appears in conversation, delivered checkmark shows
- 🔴 **Bug if:** Can't find users to message, message doesn't send, stuck

**Test 5.3 — Send a Photo in DM**
- [ ] In a conversation, tap the **photo/attachment** icon
- [ ] Choose a photo from your gallery
- [ ] Send it
- ✅ **Expected:** Photo appears in the chat bubble
- 🔴 **Bug if:** Photo won't attach, sends but shows blank

**Test 5.4 — Emoji Reaction**
- [ ] Long-press on a message
- [ ] Tap a reaction emoji (❤️ 😂 etc.)
- ✅ **Expected:** Emoji reaction appears below the message
- 🔴 **Bug if:** Long-press doesn't show options, reaction doesn't appear

**Test 5.5 — Delete a Message**
- [ ] Long-press on a message you sent
- [ ] Tap **"Delete"**
- ✅ **Expected:** Message removed, shows "Message deleted" or just disappears
- 🔴 **Bug if:** Can't delete, shows error

**Test 5.6 — Mark All as Read**
- [ ] Go back to the Messages list
- [ ] Tap the **3-dot menu** → **"Mark all as read"**
- ✅ **Expected:** All unread badges clear

**SESSION 5 NOTES:**
```
Date Tested: _______________
Bugs Found: _______________
Overall: Pass / Fail / Partial
```

---

## TEST SESSION 6: NOTIFICATIONS
**Estimated Time:** 10–15 minutes  
**Status:** ✅ READY FOR BETA

### Step-by-Step Tests:

**Test 6.1 — Notification Permission**
- [ ] When the app asks for notification permission, tap **"Allow"**
- [ ] Go to phone **Settings** → **Apps** → **LynkApp** → **Notifications**
- ✅ **Expected:** Notifications are set to "On" for LynkApp
- 🔴 **Bug if:** App never asked for permission

**Test 6.2 — Receive an In-App Notification**
- [ ] Have someone like your post or send you a message
- [ ] Go to the **Notifications** tab (bell icon)
- ✅ **Expected:** The like/message notification appears in the list
- 🔴 **Bug if:** Notifications tab is empty even after activity

**Test 6.3 — Push Notification (App Closed)**
- [ ] Completely close LynkApp (swipe it away from recents)
- [ ] Have someone send you a message
- ✅ **Expected:** A push notification appears in your notification bar
- [ ] Tap the notification
- ✅ **Expected:** App opens directly to that conversation
- 🔴 **Bug if:** No notification received, or tap opens wrong screen

**Test 6.4 — Quiet Hours**
- [ ] Go to **Notifications** → **Quiet Hours**
- [ ] Set quiet hours from 10pm to 7am
- [ ] Tap **Save**
- ✅ **Expected:** Quiet hours saved, shows confirmation

**SESSION 6 NOTES:**
```
Date Tested: _______________
Bugs Found: _______________
Overall: Pass / Fail / Partial
```

---

## TEST SESSION 7: FRIENDS
**Estimated Time:** 10–15 minutes  
**Status:** ✅ READY FOR BETA

### Step-by-Step Tests:

**Test 7.1 — Find Friends**
- [ ] Tap **Friends** tab
- [ ] Tap **"Find Friends"** or **"Discover People"**
- ✅ **Expected:** Suggested users appear with "Add Friend" buttons
- 🔴 **Bug if:** Empty list with no suggestions

**Test 7.2 — Send Friend Request**
- [ ] Tap **"Add Friend"** on any suggested user
- ✅ **Expected:** Button changes to "Request Sent" or "Pending"
- 🔴 **Bug if:** Button stays as "Add Friend", no confirmation

**Test 7.3 — View Nearby Friends**
- [ ] Tap **"Nearby"** tab in Friends
- [ ] Allow location permission if prompted
- ✅ **Expected:** Shows users near your location (or "No nearby users" if none)
- 🔴 **Bug if:** App crashes on location permission

**SESSION 7 NOTES:**
```
Date Tested: _______________
Bugs Found: _______________
Overall: Pass / Fail / Partial
```

---

## TEST SESSION 8: GROUPS
**Estimated Time:** 15–20 minutes  
**Status:** ✅ READY FOR BETA

### Step-by-Step Tests:

**Test 8.1 — Create a Group**
- [ ] Tap **Groups** tab → **"Create Group"**
- [ ] Name: *"LynkApp Beta Testers"*
- [ ] Add a description
- [ ] Set to **Public**
- [ ] Tap **"Create"**
- ✅ **Expected:** Group created, you're automatically the admin
- 🔴 **Bug if:** Can't create, crashes on group creation

**Test 8.2 — Post in a Group**
- [ ] Inside the group, tap **"Write something..."**
- [ ] Type: *"Welcome to the beta test group!"*
- [ ] Tap **"Post"**
- ✅ **Expected:** Post appears in the group feed
- 🔴 **Bug if:** Post doesn't appear, error

**Test 8.3 — Group Chat**
- [ ] Tap the **"Chat"** tab within the group
- [ ] Send a message: *"Hello group! 🚀"*
- ✅ **Expected:** Message appears in the group chat

**SESSION 8 NOTES:**
```
Date Tested: _______________
Bugs Found: _______________
Overall: Pass / Fail / Partial
```

---

## TEST SESSION 9: EVENTS
**Estimated Time:** 15 minutes  
**Status:** ✅ READY FOR BETA

### Step-by-Step Tests:

**Test 9.1 — Create an Event**
- [ ] Tap **Events** tab → **"Create Event"**
- [ ] Title: *"LynkApp Beta Launch Party"*
- [ ] Date: Pick a date next week
- [ ] Location: *"Online"*
- [ ] Tap **"Create"**
- ✅ **Expected:** Event created and appears in Events list
- 🔴 **Bug if:** Can't select a date, crashes on create

**Test 9.2 — RSVP to an Event**
- [ ] Find an event in the list
- [ ] Tap **"Going"** or **"Interested"**
- ✅ **Expected:** RSVP status saved, attendee count updates

**SESSION 9 NOTES:**
```
Date Tested: _______________
Bugs Found: _______________
Overall: Pass / Fail / Partial
```

---

## TEST SESSION 10: SEARCH
**Estimated Time:** 10 minutes  
**Status:** ✅ READY FOR BETA

### Step-by-Step Tests:

**Test 10.1 — Search for a User**
- [ ] Tap the **Search** tab (magnifying glass)
- [ ] Type your own username
- ✅ **Expected:** Your profile appears in the results
- 🔴 **Bug if:** No results, wrong results, search hangs

**Test 10.2 — Search for a Post / Hashtag**
- [ ] Search for *"beta"*
- ✅ **Expected:** Posts containing "beta" or #beta appear
- 🔴 **Bug if:** No results even though you posted "beta" earlier

**Test 10.3 — Trending Topics**
- [ ] Look for a **"Trending"** section on the search page
- ✅ **Expected:** Shows trending hashtags or topics

**SESSION 10 NOTES:**
```
Date Tested: _______________
Bugs Found: _______________
Overall: Pass / Fail / Partial
```

---

## TEST SESSION 11: SETTINGS
**Estimated Time:** 15–20 minutes  
**Status:** ✅ READY FOR BETA

### Step-by-Step Tests:

**Test 11.1 — Privacy Settings**
- [ ] Go to **Settings** → **Privacy**
- [ ] Toggle your account to **"Private"**
- [ ] Save
- ✅ **Expected:** Account goes private, confirmed by a lock icon on profile
- [ ] Toggle back to **"Public"**

**Test 11.2 — Change Password**
- [ ] Go to **Settings** → **Account Security** → **Change Password**
- [ ] Enter current password, new password, confirm new password
- [ ] Tap **"Update Password"**
- ✅ **Expected:** Password updated, confirmation message shown
- 🔴 **Bug if:** Can't change password, no feedback

**Test 11.3 — Block a User**
- [ ] Go to any user's profile
- [ ] Tap the **3-dot menu** → **"Block"**
- [ ] Confirm the block
- ✅ **Expected:** User is blocked, their content no longer appears

**Test 11.4 — Push Notification Settings**
- [ ] Go to **Settings** → **Notifications**
- [ ] Toggle off **"Likes"** notifications
- ✅ **Expected:** Toggle saves, future likes won't send push notifications

**Test 11.5 — Dark Mode / Light Mode**
- [ ] Go to **Settings** → **Appearance**
- [ ] Switch to **Light Mode**
- ✅ **Expected:** App switches to light theme
- [ ] Switch back to **Dark Mode**

**SESSION 11 NOTES:**
```
Date Tested: _______________
Bugs Found: _______________
Overall: Pass / Fail / Partial
```

---

## TEST SESSION 12: HELP & SUPPORT + LEGAL
**Estimated Time:** 10 minutes  
**Status:** ✅ READY FOR BETA

### Step-by-Step Tests:

**Test 12.1 — Help Center**
- [ ] Go to **Settings** → **Help & Support**
- [ ] Browse the **FAQ section**
- ✅ **Expected:** FAQ items expand/collapse when tapped
- 🔴 **Bug if:** Help page is blank, crashes

**Test 12.2 — Submit a Support Ticket**
- [ ] Tap **"Contact Support"** or **"Submit a Ticket"**
- [ ] Select a topic (e.g., "Bug Report")
- [ ] Type: *"Testing the support ticket system — please ignore"*
- [ ] Tap **"Submit"**
- ✅ **Expected:** Ticket submitted, confirmation shown

**Test 12.3 — Legal Pages**
- [ ] Go to **Settings** → **About** → **Terms of Service**
- ✅ **Expected:** Terms of Service page loads and is readable
- [ ] Check **Privacy Policy** — same test
- [ ] Check **Cookie Policy** — same test

**SESSION 12 NOTES:**
```
Date Tested: _______________
Bugs Found: _______________
Overall: Pass / Fail / Partial
```

---

## ═══════════════════════════════════════════════════
## PHASE 2 BETA — PARTIAL-READY SECTIONS
## (Test with known limitations noted)
## ═══════════════════════════════════════════════════

---

## TEST SESSION 13: DATING SECTION
**Estimated Time:** 20–30 minutes  
**Status:** ⚠️ PARTIAL — works but needs 2+ users for matching  
**Note:** As tester #1 you can test UI and swipe, but won't get real matches yet

### Step-by-Step Tests:

**Test 13.1 — Set Up Dating Profile**
- [ ] Tap the **Dating** tab (heart icon)
- [ ] Complete the dating profile: photos, bio, preferences, age range
- ✅ **Expected:** Dating profile saved and visible

**Test 13.2 — Swipe Interface**
- [ ] On the swipe screen, swipe **right** on a profile (like)
- [ ] Swipe **left** on a profile (pass)
- ✅ **Expected:** Cards animate correctly, swipe is smooth
- 🔴 **Bug if:** Cards don't respond to swipe, wrong direction

**Test 13.3 — Safety Center**
- [ ] Go to Dating → **Safety Center**
- ✅ **Expected:** Safety tips and resources visible

**Test 13.4 — Speed Dating** *(UI only — needs another live user)*
- [ ] Go to Dating → **Speed Dating**
- ✅ **Expected:** Speed dating lobby shows, buttons are functional

**SESSION 13 NOTES:**
```
Date Tested: _______________
Bugs Found: _______________
Overall: Pass / Fail / Partial
```

---

## TEST SESSION 14: LIVE STREAMING
**Estimated Time:** 15 minutes  
**Status:** ⚠️ PARTIAL — UI works, actual streaming needs Mux API keys

### Step-by-Step Tests:

**Test 14.1 — Live Section Navigation**
- [ ] Tap the **Live** tab
- ✅ **Expected:** Live page loads with categories, featured streams

**Test 14.2 — Start a Live Stream** *(will fail at actual broadcast without Mux)*
- [ ] Tap **"Go Live"**
- [ ] Add a title: *"Beta Test Stream"*
- [ ] Select a category
- [ ] Tap **"Start Streaming"**
- ⚠️ **Expected for beta:** May show an error about streaming server — this is OK, note it as a known limitation
- ✅ **What should work:** The setup screens, privacy gate, title input

**Test 14.3 — Live Schedule**
- [ ] Tap **"Schedule"** within the Live section
- [ ] Create a scheduled stream: title, date/time, description
- [ ] Tap **"Schedule"**
- ✅ **Expected:** Scheduled stream appears in your schedule list

**SESSION 14 NOTES:**
```
Date Tested: _______________
Bugs Found: _______________
Overall: Pass / Fail / Partial
Note known limitations: Actual live streaming won't work without Mux keys configured
```

---

## TEST SESSION 15: MARKETPLACE
**Estimated Time:** 20 minutes  
**Status:** ⚠️ PARTIAL — browsing works, real purchases need Stripe sandbox

### Step-by-Step Tests:

**Test 15.1 — Browse Marketplace**
- [ ] Tap **Marketplace** tab
- [ ] Browse through listed items
- ✅ **Expected:** Items load with photos, prices, descriptions

**Test 15.2 — Create a Listing**
- [ ] Tap **"Sell"** or **"Create Listing"**
- [ ] Add title: *"Beta Test Item (Do Not Buy)"*
- [ ] Add a photo, price: $1.00, description, category
- [ ] Tap **"Post Listing"**
- ✅ **Expected:** Listing appears in the marketplace

**Test 15.3 — Product Detail Page**
- [ ] Tap on any listing
- ✅ **Expected:** Full product details page with photos, description, seller info, reviews

**Test 15.4 — Add to Cart / Checkout** *(expected to work in test mode)*
- [ ] On a product, tap **"Buy Now"**
- ⚠️ **Expected:** Stripe checkout page opens — stop here for beta, don't complete a real purchase

**SESSION 15 NOTES:**
```
Date Tested: _______________
Bugs Found: _______________
Overall: Pass / Fail / Partial
```

---

## TEST SESSION 16: MUSIC & PODCASTS
**Estimated Time:** 10–15 minutes  
**Status:** ⚠️ PARTIAL — depends on device audio codec

### Step-by-Step Tests:

**Test 16.1 — Music Player**
- [ ] Tap **Music** tab
- [ ] Browse and tap any song
- ✅ **Expected:** Song begins playing, playback controls work
- 🔴 **Bug if:** No audio, player shows but stays at 0:00

**Test 16.2 — Radio Stations**
- [ ] Tap **"Radio"** tab in Music section
- [ ] Tap any station
- ✅ **Expected:** Radio stream begins playing

**Test 16.3 — Podcast Browse**
- [ ] Tap **"Podcasts"** tab
- [ ] Browse podcast list
- [ ] Tap an episode
- ✅ **Expected:** Episode plays, shows timeline/progress bar

**SESSION 16 NOTES:**
```
Date Tested: _______________
Bugs Found: _______________
Overall: Pass / Fail / Partial
```

---

## TEST SESSION 17: VIDEO CALLS
**Estimated Time:** 10 minutes  
**Status:** ⚠️ PARTIAL — requires 2 users  
**Note:** You need another person to test this fully

### Step-by-Step Tests:

**Test 17.1 — Initiate a Video Call**
- [ ] Go to a conversation in Messages
- [ ] Tap the **video camera** icon at the top
- ✅ **Expected:** Video call screen opens, shows your camera preview
- 🔴 **Bug if:** Crashes, black screen, camera doesn't activate

**Test 17.2 — Toggle Camera / Mute**
- [ ] Tap the **mute** button (microphone icon)
- ✅ **Expected:** Mic muted (icon changes)
- [ ] Tap the **camera flip** button
- ✅ **Expected:** Switches between front and back camera

**Test 17.3 — End Call**
- [ ] Tap the **red hang up** button
- ✅ **Expected:** Call ends, returns to conversation

**SESSION 17 NOTES:**
```
Date Tested: _______________
Bugs Found: _______________
Overall: Pass / Fail / Partial
```

---

## ═══════════════════════════════════════════════════
## CRITICAL CHECKS — DO AFTER ALL SESSIONS
## ═══════════════════════════════════════════════════

### Performance Tests:

**Perf 1 — App Launch Speed**
- [ ] Completely close the app
- [ ] Tap the LynkApp icon
- [ ] Count seconds until you see the Feed
- ✅ **Expected:** Under 3 seconds
- 🔴 **Flag if:** Takes 5+ seconds

**Perf 2 — Scroll Performance**
- [ ] Scroll the feed very fast for 30 seconds
- ✅ **Expected:** No stuttering, no "dropped frames" feeling
- 🔴 **Flag if:** Scroll is choppy, images flash in late

**Perf 3 — Background and Resume**
- [ ] With the app open, press the Home button (go to home screen)
- [ ] Wait 2 minutes doing other things
- [ ] Tap LynkApp icon to return
- ✅ **Expected:** Returns exactly where you left off
- 🔴 **Bug if:** App shows a white screen on resume, or restarts from splash

**Perf 4 — Low Network Test**
- [ ] Turn on **Airplane Mode** briefly while the app is open
- ✅ **Expected:** App shows "No Internet Connection" banner gracefully
- [ ] Turn Airplane Mode back off
- ✅ **Expected:** App reconnects automatically, content loads again

---

## ═══════════════════════════════════════════════════
## BETA TEST RESULTS SUMMARY TEMPLATE
## ═══════════════════════════════════════════════════

```
LYNKAPP BETA TEST — RESULTS SUMMARY
Tester: [Your Name]
Device: [e.g., Samsung Galaxy S24, Android 14]
App Version: 1.0.0 (Internal Build)
Test Date: _______________

SESSION RESULTS:
Session 1 — Auth/Onboarding:  ✅ Pass / ⚠️ Partial / ❌ Fail
Session 2 — Feed/Home:        ✅ Pass / ⚠️ Partial / ❌ Fail
Session 3 — Stories:          ✅ Pass / ⚠️ Partial / ❌ Fail
Session 4 — Profile:          ✅ Pass / ⚠️ Partial / ❌ Fail
Session 5 — Messages:         ✅ Pass / ⚠️ Partial / ❌ Fail
Session 6 — Notifications:    ✅ Pass / ⚠️ Partial / ❌ Fail
Session 7 — Friends:          ✅ Pass / ⚠️ Partial / ❌ Fail
Session 8 — Groups:           ✅ Pass / ⚠️ Partial / ❌ Fail
Session 9 — Events:           ✅ Pass / ⚠️ Partial / ❌ Fail
Session 10 — Search:          ✅ Pass / ⚠️ Partial / ❌ Fail
Session 11 — Settings:        ✅ Pass / ⚠️ Partial / ❌ Fail
Session 12 — Help/Legal:      ✅ Pass / ⚠️ Partial / ❌ Fail
Session 13 — Dating:          ✅ Pass / ⚠️ Partial / ❌ Fail
Session 14 — Live Streaming:  ✅ Pass / ⚠️ Partial / ❌ Fail
Session 15 — Marketplace:     ✅ Pass / ⚠️ Partial / ❌ Fail
Session 16 — Music:           ✅ Pass / ⚠️ Partial / ❌ Fail
Session 17 — Video Calls:     ✅ Pass / ⚠️ Partial / ❌ Fail

PERFORMANCE:
App Launch Speed: ___ seconds
Scroll Performance: Smooth / Choppy
Background Resume: Pass / Fail
Low Network Handling: Pass / Fail

CRITICAL BUGS (Must Fix Before Production):
1. _______________
2. _______________
3. _______________

MINOR BUGS (Can Fix After Launch):
1. _______________
2. _______________

OVERALL BETA RATING: __ / 10
READY FOR CLOSED BETA? YES / NO / NEEDS FIXES FIRST
```

---

## HOW TO REPORT A BUG DURING TESTING

**Option 1 — In-App (Fastest)**
- Tap the **floating beta feedback button** in the app
- Select **"Report a Bug"**
- Describe what happened
- Screenshot automatically attached

**Option 2 — Android Bug Report**
- Hold **Volume Down + Power** for 1 second (takes screenshot)
- Enable Developer Mode → **"Submit Bug Report"**

**Option 3 — Logcat** *(if connected to Android Studio)*
- Look for lines starting with `[Push]`, `[Error]`, or `FATAL`
- Screenshot and save

---

## KNOWN ISSUES TO IGNORE DURING BETA
**Last verified by code inspection: September 10, 2026**

These are **NOT bugs** — they are known limitations during beta:

---

### 1. ⚠️ Live streaming won't broadcast (Phase 2 — needs Mux API keys)
**Code status:** The entire streaming backend IS written — `ConnectHub-Backend/src/services/mux-service.ts`, `ConnectHub-SPA/src/services/whip-publisher.js`, and `ConnectHub-SPA/src/services/livestream-webrtc.js` all exist. The Mux WHIP publisher, stream creation, and viewer hooks are fully coded.
**Why it won't work in beta:** `VITE_MUX_TOKEN_ID` and `VITE_MUX_TOKEN_SECRET` env vars are not yet configured in `.env`. Needs a Mux account + API keys set in backend `.env`.
**What to test instead:** All the Live dashboards, schedule, analytics, moderation, Q&A, VOD, and clips pages fully load. Tap through all tabs and buttons — those work. Only actual live broadcasting requires Mux keys.
**DO NOT report:** "Live stream won't start" — this is expected in beta.

---

### 2. ⚠️ Dating matches won't appear until 2+ real users are swiping
**Code status:** The entire dating system — swipe engine, match algorithm, Firestore rules — is fully built (`DatingPage.jsx`, `DatingMatchesPage.jsx`, swipe + match Firestore rules all deployed).
**Why it appears empty:** Matching requires two real accounts to swipe right on each other. With only 1 tester, the matches collection stays empty.
**What to test instead:** Set your dating profile, set preferences, swipe on any seeded demo profiles if visible, verify the swipe animation, the "No more profiles" state, and the Safety Center page.
**DO NOT report:** "I have no matches" — this is normal with 1 tester.

---

### 3. ⚠️ Coin purchases may fail — Google Play Billing plugin not yet installed
**Code status:** The service logic IS written — `ConnectHub-SPA/src/services/google-play-billing-service.js` (223 lines, full purchase flow). `BuyCoinsPage.jsx` is wired to route Android → Play Billing, iOS → StoreKit, Web → Stripe.
**Why it won't work in beta:** The npm package `@capacitor-community/in-app-purchases` has NOT been installed yet (`package.json` confirmed). The Play Console in-app products (coins_100, coins_500, etc.) also need to be created.
**What to test instead:** Open the Buy Coins page and verify the UI loads. On the web version, Stripe purchases work normally.
**DO NOT report:** "Buy Coins button does nothing on Android" — the billing plugin is pending Phase 2 setup.

---

### 4. ✅ AR/VR shows "Coming Soon" — intentional, not a bug
**Code status:** `ARVRPage.jsx` intentionally renders `<ComingSoonGate>`. This is a confirmed design decision (DeepAR SDK is mocked). The beautiful Coming Soon UI with feature preview cards is the correct final state for Phase 1.
**DO NOT report:** "AR/VR doesn't work" — it is deliberately gated.

---

### 5. ⚠️ Gaming live features limited — intentional placeholder
**Code status:** `GamingPage.jsx` has full UI for gaming discovery, leaderboards, and tournaments. Live multiplayer game sessions are not yet integrated (no real-time game server backend).
**What to test instead:** Browse games, view leaderboard UI, tap through all gaming tabs and category filters — all UI is functional.
**DO NOT report:** "Can't play a live game" — real-time multiplayer gaming is Phase 2.

---

### 6. ⚠️ iOS version does not exist yet — Android only in Phase 1
**Code status:** Confirmed — the `ConnectHub-SPA/ios/` folder does NOT exist. `npx cap add ios` has not been run. A template file (`ios-templates/PrivacyInfo.xcprivacy`) exists for when iOS is created, but there is no Xcode project yet. iOS requires a Mac and Apple Developer Program ($99/year).
**DO NOT report:** Anything about iOS — it is officially Phase 2.

---

*Guide created: September 10, 2026 | Updated: September 10, 2026 (v1.1 — Known Issues verified by code inspection) | LynkApp Beta v1.0*
