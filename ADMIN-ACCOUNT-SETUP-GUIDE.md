# 🔐 LynkApp — Admin Account Setup Guide
## How to Create Admin Accounts & Block Regular Users From Getting Admin Access
**Last updated: June 4, 2026**

---

## 🛡️ How Security Works (What Was Patched Today)

### The Problem We Fixed
Before this patch, the Firestore rule for `/users/{uid}` allowed **any logged-in user to update their own document**, including setting `role: 'admin'`. A user could have typed this in the browser console and promoted themselves:
```js
// ❌ OLD — this WORKED before the patch (SECURITY HOLE)
db.collection('users').doc(myUid).update({ role: 'admin' });
```

### What's Protected Now
The updated `firestore.rules` now **blocks self-assignment of privileged fields**:

```
// Users can update their OWN profile BUT cannot touch role, isAdmin, or isModerator
allow update: if isOwner(uid)
  && !('role' in request.resource.data)
  && !('isAdmin' in request.resource.data)
  && !('isModerator' in request.resource.data);

// ONLY an existing admin can change roles
allow update: if isAdmin();
```

This means:
- ✅ Regular users can still edit their name, avatar, bio, etc.
- ❌ Regular users CANNOT set `role`, `isAdmin`, or `isModerator` on themselves
- ❌ Regular users CANNOT access `/admin` routes (blocked by React's `AdminGuard` component)
- ✅ Only Firebase Cloud Functions (running with Admin SDK) or existing admins can promote users

---

## 🚀 Step 1: Deploy the Updated Security Rules

You must push the updated `firestore.rules` to Firebase before they take effect in production.

```bash
cd ConnectHub-SPA
firebase deploy --only firestore:rules
```

You should see: `✔  firestore: deployed rules`

---

## 🚀 Step 2: Deploy the Cloud Functions

The new admin functions live in `ConnectHub-SPA/functions/set-admin-role.js` and are exported from `functions/index.js`.

```bash
cd ConnectHub-SPA
firebase deploy --only functions:setAdminRole,functions:removeAdminRole,functions:checkAdminStatus,functions:makeFirstAdmin
```

---

## 🎯 Step 3: Create Your FIRST Admin Account (One-Time Bootstrap)

This is the hardest part — you need to grant admin to the very first person with no existing admin to approve it. We handle this with a **one-time bootstrap HTTP function** protected by a secret token.

### 3a. Sign up in the app first
Go to `http://localhost:5173` → Sign Up → create the account you want to be admin with (e.g., `admin@lynkapp.com`).

### 3b. Set the bootstrap secret token in Firebase config
```bash
cd ConnectHub-SPA
firebase functions:config:set admin.bootstrap_token="REPLACE_WITH_A_STRONG_SECRET_LIKE_abc123xyz789"
```
> ⚠️ Keep this secret private. Never commit it to Git.

### 3c. Redeploy functions to pick up the new config
```bash
firebase deploy --only functions:makeFirstAdmin
```

### 3d. Call the bootstrap function via `curl`
Replace `YOUR_PROJECT_ID`, `your@email.com`, and the token with your actual values:

```bash
curl -X POST \
  "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/makeFirstAdmin" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lynkapp.com","bootstrapToken":"REPLACE_WITH_A_STRONG_SECRET_LIKE_abc123xyz789"}'
```

**Success response:**
```json
{
  "success": true,
  "message": "admin@lynkapp.com is now the first admin. DISABLE this function now!",
  "uid": "abc123xyz..."
}
```

### 3e. ⚠️ Disable `makeFirstAdmin` after use!
Once you have your first admin, **delete or comment out the makeFirstAdmin export** in `functions/index.js`, then redeploy:
```bash
firebase deploy --only functions
```
This prevents anyone from ever re-using it.

---

## 🎯 Step 4: Sign In as Admin & Access the Dashboard

1. Go to `http://localhost:5173/login`
2. Sign in with the admin account email (`admin@lynkapp.com`)
3. Navigate to `http://localhost:5173/admin`
4. You should now see the full Admin Dashboard ✅

---

## 👥 Step 5: Promote Additional Admins (from the Admin Dashboard)

Once you're logged in as admin, you can promote other users **from inside the app** using the Admin Dashboard — no more curl commands needed.

### Option A: Via the Admin Dashboard UI
1. Go to `/admin` → **Users** tab
2. Find the user you want to promote
3. Click the **"⋮" menu** → **"Make Admin"**
4. This calls the `setAdminRole` Cloud Function server-side

### Option B: Via the Firebase Console (manual, no deploy needed)
1. Go to [Firebase Console](https://console.firebase.google.com) → Your Project
2. Click **Firestore Database**
3. Browse to `users` collection → find the user's document by their UID
4. Add/update this field:
   - Field: `role` → Type: `string` → Value: `admin`
   - Field: `isAdmin` → Type: `boolean` → Value: `true`
5. Save. The user now has admin access on their next sign-in.

> Note: You can always look up a user's UID in **Firebase Console → Authentication → Users**

---

## 🔒 How Regular Users Are Permanently Blocked From Admin Access

There are **4 layers of protection** — a user would have to break ALL of them:

| Layer | What it does |
|-------|-------------|
| **1. Firestore Rules** | Blocks `role` / `isAdmin` / `isModerator` field writes from the client |
| **2. Admin SDK Only** | Role promotion only happens server-side via Cloud Functions (bypasses client rules safely) |
| **3. React AdminGuard** | `<AdminGuard>` in `App.jsx` wraps all `/admin/*` routes — redirects non-admins to `/` |
| **4. `useAuth` hook** | Reads `user.role` from Firestore after login; non-admins never see admin links in the UI |

Even if someone tried to hack the client-side code, the **Firestore rules are enforced by Google's servers** — there is no way to bypass them from the browser.

---

## 🗂️ Admin Role Reference

| `role` value | Access level |
|---|---|
| `user` (default) | Regular app user — no admin access |
| `moderator` | Can remove posts/comments but cannot access full admin dashboard |
| `admin` | Full access to all admin routes, KYC, reports, verification, user management |

---

## 📋 Files Changed in This Security Update

| File | What Changed |
|------|-------------|
| `ConnectHub-SPA/firestore.rules` | Added field-level blocking on `role`, `isAdmin`, `isModerator` for self-updates |
| `ConnectHub-SPA/functions/set-admin-role.js` | New file — secure server-side `setAdminRole`, `removeAdminRole`, `checkAdminStatus`, `makeFirstAdmin` functions |
| `ConnectHub-SPA/functions/index.js` | Exports the 4 new admin role functions |

---

## ⚡ Quick Deploy All Changes at Once

```bash
cd ConnectHub-SPA
firebase deploy --only firestore:rules,functions
```

---

## 🆘 Troubleshooting

**"Permission denied" when calling `setAdminRole`**
→ You are not signed in as an admin. Make sure `role: 'admin'` is set in Firestore for your account.

**Bootstrap curl returns 403**
→ Double-check the `bootstrapToken` matches exactly what you set with `functions:config:set`.

**Bootstrap curl returns 404 "User not found"**
→ The email hasn't signed up in the app yet. Complete sign-up first, then call the bootstrap.

**Bootstrap curl returns 409 "An admin already exists"**
→ Someone is already an admin. Use the Admin Dashboard → Users → Make Admin to add more.

**Admin dashboard shows "Access Denied" after setting role in Firestore**
→ Sign out and sign back in — the `useAuth` hook needs to re-fetch the user's role from Firestore.
