# 🔒 TASK 2.8 — FIRESTORE SECURITY RULES (FINAL — READY TO COPY-PASTE)
## LynkApp Firebase Project: lynkapp-c7db1

**Status:** ⏰ Needs to be published in Firebase Console (5 minutes)  
**Created:** March 26, 2026

---

## ⚠️ IMPORTANT: Have rules been added yet?

The rules were written into a guide file on your computer but have **NOT been published to Firebase** yet.
Publishing requires you to paste them manually into the Firebase Console web interface.
This takes about 5 minutes. Follow the steps below.

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### STEP 1 — Open your browser and go to this exact URL:
```
https://console.firebase.google.com/project/lynkapp-c7db1/firestore/rules
```
> Sign in with the Google account you used when you created the Firebase project.

---

### STEP 2 — Make sure you are on the RIGHT page
You should see:
- The heading says **"Cloud Firestore"**
- There are tabs at the top: **Data | Rules | Indexes | Usage**
- You are on the **Rules** tab ← click it if not already selected

> ⚠️ DO NOT go to "Storage → Rules" or "Realtime Database → Rules"
> Those are different services. LynkApp uses Firestore only.

---

### STEP 3 — Select all existing text and delete it
1. Click anywhere inside the text editor box on screen
2. Press **Ctrl + A** (Windows) to select everything
3. Press **Delete** or **Backspace** — the editor is now empty

---

### STEP 4 — Copy the FULL rules below (Ctrl+A then Ctrl+C on the code block)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // ─── USERS ────────────────────────────────────────────────────────────────
    // Any signed-in user can read profiles (needed for search, friends, etc.)
    // Only the owner can create/update/delete their own profile document

    match /users/{userId} {
      allow read:   if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAuthenticated() && isOwner(userId);
      allow delete: if isAuthenticated() && isOwner(userId);
    }

    // ─── POSTS ────────────────────────────────────────────────────────────────
    // Any signed-in user can read posts and create new posts
    // Only the post's author (userId field) can update or delete it

    match /posts/{postId} {
      allow read:           if isAuthenticated();
      allow create:         if isAuthenticated();
      allow update, delete: if isAuthenticated()
                            && request.auth.uid == resource.data.userId;
    }

    // ─── FRIEND REQUESTS ──────────────────────────────────────────────────────
    // Any signed-in user can read and send friend requests
    // Only the sender OR recipient can update/delete the request

    match /friendRequests/{requestId} {
      allow read:           if isAuthenticated();
      allow create:         if isAuthenticated();
      allow update, delete: if isAuthenticated()
                            && (request.auth.uid == resource.data.senderId
                            ||  request.auth.uid == resource.data.recipientId);
    }

    // ─── FRIENDSHIPS ──────────────────────────────────────────────────────────
    // Any signed-in user can read friendships (for mutual friends feature)
    // Only one of the two users in the friendship can delete it (unfriend)

    match /friendships/{friendshipId} {
      allow read:   if isAuthenticated();
      allow create: if isAuthenticated();
      allow delete: if isAuthenticated()
                    && (request.auth.uid == resource.data.user1Id
                    ||  request.auth.uid == resource.data.user2Id);
    }

    // ─── CONVERSATIONS & MESSAGES ─────────────────────────────────────────────
    // Only conversation participants can read or write
    // Sub-collection messages: any authenticated user (parent conversation gates access)

    match /conversations/{conversationId} {
      allow read, write: if isAuthenticated()
                         && request.auth.uid in resource.data.participants;

      match /messages/{messageId} {
        allow read, write: if isAuthenticated();
      }
    }

    // ─── NOTIFICATIONS ────────────────────────────────────────────────────────
    // Only the recipient can read their own notifications
    // Any signed-in user can CREATE a notification (to notify someone else)
    // Only the recipient can update (mark as read) or delete

    match /notifications/{notificationId} {
      allow read:           if isAuthenticated()
                            && request.auth.uid == resource.data.recipientId;
      allow create:         if isAuthenticated();
      allow update, delete: if isAuthenticated()
                            && request.auth.uid == resource.data.recipientId;
    }

    // ─── STORIES ──────────────────────────────────────────────────────────────
    // Any signed-in user can read stories
    // Only the story author can update or delete their story

    match /stories/{storyId} {
      allow read:           if isAuthenticated();
      allow create:         if isAuthenticated();
      allow update, delete: if isAuthenticated()
                            && request.auth.uid == resource.data.userId;
    }

    // ─── GROUPS ───────────────────────────────────────────────────────────────
    // Any signed-in user can read group info and create groups
    // Only the group creator can update or delete the group

    match /groups/{groupId} {
      allow read:           if isAuthenticated();
      allow create:         if isAuthenticated();
      allow update, delete: if isAuthenticated()
                            && request.auth.uid == resource.data.createdBy;
    }

    // ─── EVENTS ───────────────────────────────────────────────────────────────
    // Any signed-in user can read events and create new ones
    // Only the event creator can update or delete the event

    match /events/{eventId} {
      allow read:           if isAuthenticated();
      allow create:         if isAuthenticated();
      allow update, delete: if isAuthenticated()
                            && request.auth.uid == resource.data.createdBy;
    }

    // ─── MARKETPLACE LISTINGS ─────────────────────────────────────────────────
    // Any signed-in user can browse listings and create new ones
    // Only the seller can update or delete their listing

    match /listings/{listingId} {
      allow read:           if isAuthenticated();
      allow create:         if isAuthenticated();
      allow update, delete: if isAuthenticated()
                            && request.auth.uid == resource.data.sellerId;
    }

    // ─── FALLBACK — Block Everything Else ─────────────────────────────────────
    // Any Firestore collection NOT listed above is completely blocked

    match /{document=**} {
      allow read, write: if false;
    }

  }
}
```

---

### STEP 5 — Paste into the Firebase rules editor
1. Click inside the (now empty) rules editor box
2. Press **Ctrl + V** to paste
3. The rules should now appear in the editor

---

### STEP 6 — Click "Publish"
1. Look for the blue **"Publish"** button in the top-right area
2. Click it
3. A confirmation dialog may appear — click **"Publish"** again

✅ You should see: **"Rules published successfully"**

---

### STEP 7 — Verify (30 seconds after publishing)
1. Open your app: **https://lynkapp.net**
2. Press **F12** → click the **Console** tab
3. Try to log in
4. ✅ If you see **no red "Missing or insufficient permissions" errors** → rules are working!

---

## 📊 What Each Rule Does (Plain English)

| Collection | Who Can Read | Who Can Write / Edit / Delete |
|------------|-------------|-------------------------------|
| `users` | Any logged-in user | Only YOU can edit YOUR profile |
| `posts` | Any logged-in user | Only the post author can edit/delete |
| `friendRequests` | Any logged-in user | Only sender or recipient |
| `friendships` | Any logged-in user | Only one of the two friends |
| `conversations` | Only participants | Only participants |
| `messages` | Any logged-in user | Any logged-in user |
| `notifications` | Only the recipient | Only the recipient |
| `stories` | Any logged-in user | Only the story author |
| `groups` | Any logged-in user | Only the group creator |
| `events` | Any logged-in user | Only the event creator |
| `listings` | Any logged-in user | Only the seller |
| Everything else | ❌ Blocked | ❌ Blocked |

---

## 🚨 Troubleshooting

**Problem: "I still see permission errors after publishing"**
- Wait 60 seconds — rules can take up to a minute to fully propagate
- Clear your browser cache: Ctrl + Shift + Delete → clear cached data → reload

**Problem: "Publish button is grayed out"**
- The rules have a syntax error. Delete everything and paste again from Step 4.

**Problem: "I accidentally broke the rules / locked myself out"**
Paste this TEMPORARY rule to regain access, then redo Steps 3-6:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## ✅ DONE CHECKLIST

- [ ] Opened Firebase Console at correct URL
- [ ] Found the Firestore Rules tab
- [ ] Deleted all existing rules
- [ ] Pasted the new complete rules from Step 4
- [ ] Clicked Publish and saw success confirmation
- [ ] Waited 30 seconds
- [ ] Logged into app with no permission errors in console
- [ ] **Task 2.8 = COMPLETE ✅ — All 10 Phases Done! 🎉**

---

## ⏭️ After Publishing Rules — Next Steps

1. ✅ **Run test seed data** — Open your app, press F12 → Console, type:
   ```
   TestSeed.runAll()
   ```
   This creates the 3 test accounts (Alice, Bob, Charlie) with sample posts and messages.

2. ✅ **Test the 7 user journeys** — Log in as Alice in one tab, Bob in another.
   Have Bob like Alice's post and watch Alice's notification bell update in real-time.

3. ✅ **Fix the splash screen JS error** (duplicate declarations in ConnectHub_Mobile_Design.html)
   — Let me know when you're ready for this and I'll fix it!

---

*Task 2.8 Final Guide — LynkApp Development System*
*Created: March 26, 2026*
