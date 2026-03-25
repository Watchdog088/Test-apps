# 🔒 TASK 2.8 — FIRESTORE SECURITY RULES
## Step-by-Step Visual Guide (No Tech Knowledge Needed)

**Time Required:** 5–10 minutes  
**What You Need:** A web browser  
**Project:** lynkapp-c7db1

---

## ⚠️ WHY THIS MATTERS

Right now your Firestore database is wide open — anyone who finds your API key could read or delete ALL user data. These rules lock it down so:
- ✅ Users can only edit **their own** profile
- ✅ Users can read **other** profiles (needed for social features)
- ✅ Only logged-in users can access **anything**
- ✅ Users can only delete/edit **their own** posts and messages
- ✅ Notifications are only visible to the **correct recipient**

---

## ❓ WHICH SECTION DO I USE?

Firebase has 3 different database/storage services — you need to know which one:

| Service | What It Does | Do You Need to Update Rules? |
|---------|-------------|------------------------------|
| **Firestore Database** ← THIS ONE | Stores all your app data (users, posts, messages, etc.) | ✅ YES — this is Task 2.8 |
| Storage | Stores uploaded files (photos, videos) | Later (not required right now) |
| Realtime Database | An older, different type of database — LynkApp does NOT use this | ❌ NO — ignore it |

> ✅ **Go to: Firestore Database → Rules tab**
> ❌ Do NOT go to: Storage → Rules  
> ❌ Do NOT go to: Realtime Database → Rules

---

## 📋 STEP-BY-STEP INSTRUCTIONS

---

### STEP 1 — Open the Firebase Console

1. Open your web browser (Chrome, Edge, Firefox — any browser works)
2. Go to this **direct link** (takes you straight to the right place):

```
https://console.firebase.google.com/project/lynkapp-c7db1/firestore/rules
```

> 💡 **If that link doesn't work, follow these steps manually:**
> 1. Go to: https://console.firebase.google.com
> 2. Sign in with your Google account (the one used to set up Firebase)
> 3. Click on the project called **"lynkapp-c7db1"**
> 4. In the **left sidebar**, look for **"Build"** and click it to expand
> 5. Click **"Firestore Database"** (NOT "Realtime Database")
> 6. At the top of the Firestore page, you'll see 3 tabs: **Data | Rules | Indexes | Usage**
> 7. Click the **"Rules"** tab

---

### STEP 2 — You'll See the Rules Editor

When you arrive, you will see a text editor that looks something like this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

> ⚠️ **IMPORTANT:** The existing rules may say `allow read, write: if false;` (blocks everything) 
> or `allow read, write: if true;` (allows everything — this is the dangerous one).
> Either way, you are going to **replace all of it** in the next step.

---

### STEP 3 — Select ALL the Existing Text and Delete It

1. Click anywhere inside the rules text editor box
2. Press **Ctrl + A** (Windows) or **Cmd + A** (Mac) to select all text
3. Press the **Delete** or **Backspace** key — the editor should now be empty

---

### STEP 4 — Copy the New Rules Below

Highlight ALL the text in the box below, copy it (**Ctrl + C** or **Cmd + C**):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────

    // Is the user signed in?
    function isAuthenticated() {
      return request.auth != null;
    }

    // Is the signed-in user the owner of this document?
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // ─── USERS COLLECTION ─────────────────────────────────────────────────────
    // /users/{userId}
    // - Any signed-in user can READ any profile (for search, friend lists, etc.)
    // - Only the profile owner can CREATE, UPDATE, or DELETE their own profile

    match /users/{userId} {
      allow read:   if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAuthenticated() && isOwner(userId);
      allow delete: if isAuthenticated() && isOwner(userId);
    }

    // ─── POSTS COLLECTION ─────────────────────────────────────────────────────
    // /posts/{postId}
    // - Any signed-in user can READ posts (public feed)
    // - Any signed-in user can CREATE a post
    // - Only the post author can UPDATE or DELETE their own post

    match /posts/{postId} {
      allow read:          if isAuthenticated();
      allow create:        if isAuthenticated();
      allow update, delete: if isAuthenticated()
                            && request.auth.uid == resource.data.userId;
    }

    // ─── FRIEND REQUESTS ──────────────────────────────────────────────────────
    // /friendRequests/{requestId}
    // - Any signed-in user can read and create friend requests
    // - Only the sender OR recipient can update/delete a request

    match /friendRequests/{requestId} {
      allow read:          if isAuthenticated();
      allow create:        if isAuthenticated();
      allow update, delete: if isAuthenticated()
                            && (request.auth.uid == resource.data.senderId
                            ||  request.auth.uid == resource.data.recipientId);
    }

    // ─── CONVERSATIONS (DIRECT MESSAGES) ──────────────────────────────────────
    // /conversations/{conversationId}
    // - Only participants in the conversation can read or write
    // - Messages inside a conversation: any authenticated user (already
    //   gated by the parent conversation rule in practice)

    match /conversations/{conversationId} {
      allow read, write: if isAuthenticated()
                         && request.auth.uid in resource.data.participants;

      match /messages/{messageId} {
        allow read, write: if isAuthenticated();
      }
    }

    // ─── NOTIFICATIONS ────────────────────────────────────────────────────────
    // /notifications/{notificationId}
    // - Only the recipient can READ their notifications
    // - Any signed-in user can CREATE a notification (to notify someone else)
    // - Only the recipient can UPDATE (mark as read) or DELETE

    match /notifications/{notificationId} {
      allow read:          if isAuthenticated()
                            && request.auth.uid == resource.data.recipientId;
      allow create:        if isAuthenticated();
      allow update, delete: if isAuthenticated()
                            && request.auth.uid == resource.data.recipientId;
    }

    // ─── STORIES ──────────────────────────────────────────────────────────────
    // /stories/{storyId}
    // - Any signed-in user can read stories
    // - Only the author can create, update, or delete their story

    match /stories/{storyId} {
      allow read:          if isAuthenticated();
      allow create:        if isAuthenticated();
      allow update, delete: if isAuthenticated()
                            && request.auth.uid == resource.data.userId;
    }

    // ─── GROUPS ───────────────────────────────────────────────────────────────
    // /groups/{groupId}
    // - Any signed-in user can read group info
    // - Any signed-in user can create a group
    // - Only the group admin/creator can update or delete

    match /groups/{groupId} {
      allow read:          if isAuthenticated();
      allow create:        if isAuthenticated();
      allow update, delete: if isAuthenticated()
                            && request.auth.uid == resource.data.createdBy;
    }

    // ─── FALLBACK — Block Everything Else ─────────────────────────────────────
    // Any collection not listed above is blocked by default.
    match /{document=**} {
      allow read, write: if false;
    }

  }
}
```

---

### STEP 5 — Paste the New Rules

1. Click inside the now-empty rules editor box
2. Press **Ctrl + V** (Windows) or **Cmd + V** (Mac) to paste
3. The editor should now show all the rules you just copied

---

### STEP 6 — Publish the Rules

1. Look for the blue **"Publish"** button — it is in the top-right area of the Rules editor
2. Click **"Publish"**
3. A confirmation dialog may appear — click **"Publish"** again to confirm

> ✅ You should see a green confirmation message like:
> **"Rules published successfully"**

---

### STEP 7 — Verify It Worked

Wait about **30 seconds** for the rules to take effect across Firebase servers, then:

1. Go to your app (e.g. https://lynkapp.net or your local test URL)
2. Try logging in with a test account:
   - **Email:** `alice@lynkapp.test`
   - **Password:** `TestPass123!`
3. Open the browser Developer Tools: press **F12** → click the **"Console"** tab
4. Look for any red errors that say **"Missing or insufficient permissions"**
   - ✅ If you see **NO** such error → rules are working correctly
   - ❌ If you see that error → scroll down to the Troubleshooting section below

---

## 🔍 WHAT EACH RULE DOES (Plain English)

| Collection | Who Can Read | Who Can Write/Edit/Delete |
|------------|-------------|--------------------------|
| `users` | Any logged-in user | Only YOU can edit YOUR profile |
| `posts` | Any logged-in user | Any logged-in user can create; only author can edit/delete |
| `friendRequests` | Any logged-in user | Sender OR recipient can update/delete |
| `conversations` | Only participants | Only participants |
| `messages` | Any logged-in user | Any logged-in user |
| `notifications` | Only the recipient | Only the recipient can mark as read |
| `stories` | Any logged-in user | Only the author can edit/delete |
| `groups` | Any logged-in user | Only the group creator can edit/delete |
| Everything else | ❌ Blocked | ❌ Blocked |

---

## 🚨 TROUBLESHOOTING

### Problem: "I don't see a Rules tab"
**Fix:** Make sure you clicked on **"Firestore Database"** in the left sidebar (not "Realtime Database" — those are two different services). The Firestore one has a Rules tab; Realtime Database has a different interface.

### Problem: "I can't sign into Firebase Console"
**Fix:** Make sure you're using the same Google account you used when you first set up the project. If you're not sure which account, try signing out and back in.

### Problem: "Publish button is grayed out"
**Fix:** Make sure all the text is pasted correctly and there are no syntax errors. Look for any red underlines in the editor — those indicate a mistake in the rules code. If you see one, delete everything and paste again from Step 4.

### Problem: "Rules published but I still get permission errors"
**Fix:** 
1. Wait 60 seconds — rules can take up to a minute to fully propagate
2. Clear your browser cache: **Ctrl + Shift + Delete** → clear cached data → reload app
3. Try logging out of the app and logging back in
4. Check if the error message says the specific collection name — if it's a collection NOT listed in the rules (e.g. `events`, `marketplace`), we may need to add a rule for it

### Problem: "I accidentally broke the rules / locked myself out"
**Fix:** Go back to Firebase Console → Firestore → Rules → paste this temporary open rule to regain access:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
Then click Publish, and repeat Steps 3–6 with the full rules.

---

## ✅ DONE CHECKLIST

After completing this task, verify each item:

- [ ] Opened Firebase Console at correct URL
- [ ] Found the Firestore Rules tab
- [ ] Deleted all existing rules
- [ ] Pasted the new complete rules
- [ ] Clicked Publish and saw success confirmation
- [ ] Waited 30 seconds
- [ ] Logged into the app with no permission errors in console
- [ ] Task 2.8 = COMPLETE ✅

---

## 🎯 WHAT'S NEXT AFTER THIS?

Once Task 2.8 is done, **Phase 2 is 100% complete!**

**Next Steps (in order):**
1. ✅ Fix the S3 deployment (wrong bucket name — see note below)
2. ✅ Run `TestSeed.runAll()` in your browser console to seed test data
3. ✅ Start user testing with the 7 core journeys

---

## 🔧 BONUS: FIX THE S3 DEPLOYMENT (Do This After Rules Are Set)

The last deployment attempt failed because the bucket name was wrong.

**Run this command in your terminal to deploy the app correctly:**

```bat
aws s3 cp ConnectHub_Mobile_Design.html s3://lynkapp.net/index.html --content-type "text/html" --cache-control "no-cache, no-store, must-revalidate"
```

Then go to: **https://lynkapp.net** to see your live app!

---

*Task 2.8 Guide — LynkApp Development System*  
*Created: March 25, 2026*
