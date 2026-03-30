# 🧪 LynkApp — User Testing Start Guide
## How to Start User Testing Right Now

**App URL:** https://lynkapp.net  
**Date:** March 30, 2026

---

## STEP 1 — Verify the App Works (YOU do this first — 5 min)

### 1.1 Open the app
- Go to: **https://lynkapp.net**
- Press **Ctrl + Shift + R** (hard refresh)
- The app should load with the LynkApp splash screen

### 1.2 Run the verification tool
- Press **F12** on your keyboard
- Click the **Console** tab
- Type this and press Enter:
  ```
  TestSeed.quickVerify()
  ```
- ✅ You should see: **SCORE: 7/7 — ALL JOURNEYS VERIFIED!**

### 1.3 Seed test data (creates Alice, Bob, Charlie accounts)
- In the same Console, type:
  ```
  TestSeed.runAll()
  ```
- ✅ You should see accounts created and sample posts seeded

### 1.4 Test login yourself
- Sign in with: `alice@lynkapp.test` / `TestPass123!`
- ✅ You should see the feed with sample posts

---

## STEP 2 — Choose Your Tester Group (Pick 1 Option)

### Option A: Friends & Family (Best for first round)
- Send 5–10 people the link: **https://lynkapp.net**
- Tell them: "Create an account and try using it like a social media app"
- This is unmoderated testing — they do it on their own

### Option B: Coworkers / Professional Testers
- Schedule 30-min sessions with 3–5 people
- Watch them use the app (screen share or in person)
- This is moderated testing — you observe and take notes

### Option C: Public Beta (Bigger reach)
- Post the link on social media / Discord / Reddit
- "Beta testing a new social app — create an account at lynkapp.net"

---

## STEP 3 — What to Tell Your Testers

Send testers this message (copy-paste ready):

---
**Subject: Help me test my new social app! 🚀**

Hey! I'm building a social media app called LynkApp and need your help testing it.

**Link:** https://lynkapp.net

**What to do:**
1. Create an account (just an email + password)
2. Set up your profile
3. Make a post in the feed
4. Add someone as a friend
5. Send a message
6. Like and comment on posts

**Takes about 10 minutes.** Please tell me:
- Anything that didn't work
- Anything that felt confusing
- What you liked
- What's missing

Reply to this message with your feedback! Thank you! 🙏

---

## STEP 4 — The 7 Things to Test (Tell Testers These)

| # | Journey | What to Do |
|---|---------|-----------|
| 1 | **Sign Up** | Create new account with email + password |
| 2 | **Log In** | Log out and log back in |
| 3 | **Create Post** | Post something in the feed (text + optional image) |
| 4 | **Like & Comment** | Find someone else's post, like and comment on it |
| 5 | **Send Message** | Find a user and send them a DM |
| 6 | **Add Friend** | Send a friend request, accept one |
| 7 | **Notifications** | Check if notification bell updates when someone interacts |

---

## STEP 5 — How to Collect Feedback

### Option A: Google Form (Recommended)
Create a free Google Form at https://forms.google.com with these questions:
1. What device/browser did you use?
2. Were you able to create an account? (Yes/No — if no, what happened?)
3. Were you able to make a post? (Yes/No)
4. Were you able to send a message? (Yes/No)
5. What broke or didn't work?
6. What was confusing?
7. What did you like?
8. Rating: 1–10

### Option B: Simple Email Reply
Just ask testers to reply with what worked and what didn't.

### Option C: Watch them live
Screen share via Zoom/Teams and watch them use the app. Take notes.

---

## STEP 6 — Monitor Who Signs Up (Firebase Console)

While testing is happening, watch the Firebase Console to see real users:

1. Go to: https://console.firebase.google.com/project/lynkapp-c7db1/authentication/users
   - See every account that gets created in real time

2. Go to: https://console.firebase.google.com/project/lynkapp-c7db1/firestore
   - See posts, messages, friend requests being created

---

## STEP 7 — What to Do With Feedback

After collecting feedback, categorize issues into:

| Category | Action |
|----------|--------|
| 🔴 **Broken** — something doesn't work at all | Fix immediately, redeploy |
| 🟡 **Confusing** — people don't know how to use it | Add better labels/instructions |
| 🟢 **Missing** — feature people want | Add to roadmap |
| ⭐ **Loved** — things people liked | Keep and expand |

Then:
1. Fix the broken things
2. Redeploy with: `update-lynkapp-FINAL.bat`
3. Run another round of testing

---

## TEST ACCOUNTS (For Your Own Testing)

| Name | Email | Password |
|------|-------|---------|
| Alice Johnson | alice@lynkapp.test | TestPass123! |
| Bob Martinez | bob@lynkapp.test | TestPass123! |
| Charlie Kim | charlie@lynkapp.test | TestPass123! |

**Tip:** Open Alice in Chrome, Bob in a private/incognito window — test real-time features like notifications and messages between two users simultaneously.

---

## QUICK CHECKLIST BEFORE SENDING TO TESTERS

- [ ] App loads at https://lynkapp.net ✅
- [ ] Can create an account ✅
- [ ] Can log in ✅
- [ ] Feed loads with posts ✅
- [ ] Can create a post ✅
- [ ] Can send a message ✅
- [ ] Console shows no red errors (F12 → Console) ✅
- [ ] TestSeed.quickVerify() returns 7/7 ✅

---

## 🚀 RECOMMENDED: Start With 5 Testers

1. You + 4 other people you trust
2. Run through all 7 journeys
3. Fix any issues found
4. Then expand to 20–50 testers
5. Then go public beta

---

*User Testing Start Guide — LynkApp*
*Created: March 30, 2026*
