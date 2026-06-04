# 🛡️ LynkApp — Complete Admin Dashboard & Admin Account Setup Guide
## Step-by-Step Instructions in Exact Order
**Last updated: June 4, 2026**

---

## 📋 What's Already Built (You Don't Have to Create These)

Your admin system is 100% coded and waiting. Here's what exists:

| File | What it does |
|------|-------------|
| `src/pages/admin/AdminDashboardPage.jsx` | Main admin home — metrics, reports queue, KYC queue |
| `src/pages/admin/AdminSubPages.jsx` | Admin Users page + Admin Announcements page |
| `src/pages/admin/KYCAdminPage.jsx` | KYC document review + approve/reject |
| `src/pages/admin/ReportsAdminPage.jsx` | User reports + content moderation |
| `src/pages/admin/VerificationAdminPage.jsx` | Profile verification badge approvals |
| `src/pages/marketplace/MarketplaceExtensions.jsx` | Contains the `AdminGuard` component that blocks non-admins |
| `src/App.jsx` | All `/admin/*` routes are already wired with `AdminGuard` |
| `functions/set-admin-role.js` | Cloud Functions for server-side role management |
| `functions/index.js` | Exports all admin Cloud Functions |
| `firestore.rules` | Security rules blocking self-promotion to admin |
| `seed-ceo-admin.js` | One-time script to create CEO@lynkapp.net as first admin |
| `run-ceo-admin.bat` | Double-click launcher for the seed script |

**Admin routes already in the app:**
- `/admin` — Overview dashboard
- `/admin/users` — User management
- `/admin/reports` — Content reports
- `/admin/kyc` — KYC review
- `/admin/announcements` — Push announcements
- `/admin/verification` — Verification badge requests

---

## 🗺️ SETUP ORDER — Do These Steps In This Exact Order

---

## ✅ STEP 1 — Make Sure the Dev Server Is Running

**What:** Confirm the app is running locally so you can test the admin dashboard after setup.

**How:**
```
Double-click:  ConnectHub-SPA/start-dev.bat
```
Or open a terminal and run:
```bash
cd ConnectHub-SPA
npx vite --port 5173
```

**Confirm:** Open your browser → go to `http://localhost:5173`
You should see the LynkApp login page.

✅ Done when: The app loads without errors.

---

## ✅ STEP 2 — Deploy the Firestore Security Rules

**What:** Push the updated `firestore.rules` to Firebase so the self-promotion exploit is blocked in production.

**Why first:** If you skip this, ANY logged-in user could give themselves admin access by typing a command in the browser console.

**How:**

1. Open a terminal in `ConnectHub-SPA/`
2. Make sure you're logged into Firebase:
   ```bash
   firebase login
   ```
   (A browser window opens → sign in with your Google account that owns the Firebase project)

3. Deploy rules:
   ```bash
   cd ConnectHub-SPA
   firebase deploy --only firestore:rules
   ```

**Confirm:** You should see:
```
✔  firestore: deployed rules
```

✅ Done when: You see the green checkmark confirmation.

---

## ✅ STEP 3 — Deploy the Cloud Functions

**What:** Push the `setAdminRole`, `removeAdminRole`, `checkAdminStatus`, and `makeFirstAdmin` Cloud Functions to Firebase.

**Why:** The admin dashboard's "Make Admin" button calls `setAdminRole` server-side. Without deploying, the button won't work.

**How:**

1. First install Cloud Function dependencies:
   ```bash
   cd ConnectHub-SPA/functions
   npm install
   cd ..
   ```

2. Deploy the functions:
   ```bash
   firebase deploy --only functions
   ```

**Confirm:** You should see:
```
✔  functions: deployed setAdminRole
✔  functions: deployed removeAdminRole
✔  functions: deployed checkAdminStatus
✔  functions: deployed makeFirstAdmin
```

✅ Done when: All 4 functions show green checkmarks.

---

## ✅ STEP 4 — Download Your Firebase Service Account Key

**What:** A JSON file that gives your seed script admin-level access to Firebase. It's needed only once to create the first admin account.

**How:**

1. Go to: https://console.firebase.google.com
2. Click your project (the one your app uses)
3. Click the **⚙️ gear icon** → **Project Settings**
4. Click the **Service Accounts** tab
5. Click the blue **"Generate new private key"** button
6. Click **"Generate key"** in the confirmation popup
7. A JSON file downloads automatically (it will have a long name like `myproject-firebase-adminsdk-xxx.json`)
8. **Rename it to exactly:** `serviceAccountKey.json`
9. **Move it to:** `ConnectHub-SPA/` folder (same folder as `package.json`)

**Security warning:** This file gives anyone who has it FULL admin access to your entire Firebase project. We will delete it after use in Step 6.

✅ Done when: The file `ConnectHub-SPA/serviceAccountKey.json` exists.

---

## ✅ STEP 5 — Run the CEO Admin Seed Script

**What:** Creates your `CEO@lynkapp.net` account in Firebase Auth and marks it as admin in Firestore — all in one click.

**How:**

**Option A (Easiest) — Double-click:**
```
ConnectHub-SPA/run-ceo-admin.bat
```

**Option B — Terminal:**
```bash
cd ConnectHub-SPA
node seed-ceo-admin.js
```

**What you'll see printed:**
```
🚀  LynkApp CEO Admin Seeder
════════════════════════════════════════
📧  Email    : CEO@lynkapp.net
👤  Name     : LynkApp CEO
🔑  Password : LynkApp@CEO2026!  ← CHANGE AFTER FIRST LOGIN!
════════════════════════════════════════

✅  Firebase Auth: created new account → UID: [some-uid]
✅  Firestore: users/[uid] written with role: 'admin'
✅  Admin log written

════════════════════════════════════════
🎉  CEO Admin account ready!
════════════════════════════════════════
```

✅ Done when: You see the 🎉 success message with a UID printed.

---

## ✅ STEP 6 — Delete the Service Account Key

**What:** Remove `serviceAccountKey.json` from your computer now that the seed is done.

**Why:** Leaving it around is a major security risk. If it ever gets pushed to GitHub, anyone can take over your Firebase project.

**How:**
1. In File Explorer, go to `ConnectHub-SPA/`
2. Delete `serviceAccountKey.json`
3. Or in terminal:
   ```bash
   del ConnectHub-SPA\serviceAccountKey.json
   ```

✅ Done when: The file no longer exists. (Git will also ignore it thanks to `.gitignore`, but delete it anyway.)

---

## ✅ STEP 7 — Sign In as CEO Admin & Test the Dashboard

**What:** Log in with your CEO account and verify the admin dashboard works.

**How:**

1. Go to `http://localhost:5173/login`
2. Enter:
   - **Email:** `CEO@lynkapp.net`
   - **Password:** `LynkApp@CEO2026!`
3. Click **Sign In**
4. Once logged in, go to: `http://localhost:5173/admin`

**What you should see:**
- Header showing "⚙️ Admin Dashboard" with a red "🔴 ADMIN ACCESS" badge
- 5 tabs: **Overview | Reports | KYC | Users | More**
- **Overview tab:** 6 metric cards (Total Users, DAU, Revenue, Reports Pending, KYC Queue, Active Streams)
- **Reports tab:** Content moderation queue
- **KYC tab:** ID verification queue
- **Users tab:** User list with role management

✅ Done when: You can see the full admin dashboard and navigate all tabs.

---

## ✅ STEP 8 — Change Your CEO Password

**What:** Replace the temporary password `LynkApp@CEO2026!` with a strong private password.

**How:**

**Option A — In the app:**
1. Go to `/settings/security`
2. Find "Change Password"
3. Enter current password → new password → confirm → Save

**Option B — In Firebase Console:**
1. Go to https://console.firebase.google.com → Authentication → Users
2. Find `CEO@lynkapp.net`
3. Click the **⋮** menu → **Reset password**
4. Enter a new strong password

✅ Done when: You've changed from `LynkApp@CEO2026!` to your own private password.

---

## ✅ STEP 9 — Deploy the Updated Firestore Rules to Production

**What:** Push the same security rules to your live/production Firebase project.

**Why:** If your app is deployed to a live URL, the rules need to be on the production Firebase project too — not just locally tested.

**How:**
```bash
cd ConnectHub-SPA
firebase deploy --only firestore:rules
```

✅ Done when: Rules are deployed to production.

---

## ✅ STEP 10 — Add More Admin Accounts (When Needed)

Once you're signed in as CEO admin, you can add other admins without any scripts.

**How to promote someone to admin from the Admin Dashboard:**

1. Sign in as `CEO@lynkapp.net`
2. Go to `/admin`
3. Click the **"Users"** tab
4. Find the user you want to promote
5. Click the **"⋮"** menu next to their name
6. Click **"Make Admin"**

This calls the `setAdminRole` Cloud Function server-side — no Firestore Console required.

**How to demote an admin:**
- Same path → Click **"Remove Admin"** in the ⋮ menu

---

## 📊 What Each Admin Dashboard Section Does

### Overview Tab (`/admin`)
- Live platform metrics: total users, DAU, revenue, pending reports, KYC queue, active streams
- Recent reports queue (high priority shown first)
- KYC pending review list
- Quick action buttons to each sub-section

### Reports Tab (`/admin/reports`)
- Full list of user-reported content (spam, harassment, fake profiles, etc.)
- Filter by type, priority, and status
- Approve / Dismiss / Escalate each report

### KYC Tab (`/admin/kyc`)
- ID verification document review
- Approve or reject submitted IDs
- View document type, submission date, user info

### Users Tab (`/admin/users`)
- Full user list searchable by email/username
- Make Admin / Remove Admin buttons
- Ban / Unban users
- View user roles

### Verification Tab (`/admin/verification`)
- Handles "verified badge" requests from users
- Approve or reject profile verification

### Announcements (`/admin/announcements`)
- Send push announcements to all users or specific groups

---

## 🔒 Security Summary — 4 Layers Protecting Admin Access

| Layer | Where | What it blocks |
|-------|-------|----------------|
| **1. Firestore Rules** | Firebase server-side | Client writes to `role`, `isAdmin`, `isModerator` fields |
| **2. Admin SDK only** | Cloud Functions | Role changes only happen server-side — client can't fake it |
| **3. AdminGuard** | `App.jsx` → React | Redirects non-admins away from `/admin/*` routes |
| **4. useAuth hook** | Frontend state | Admin links/buttons only appear if `user.role === 'admin'` |

---

## 🚨 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| `/admin` redirects you away after login | Sign out completely, clear cache, sign back in. The `useAuth` hook re-reads your role on fresh login. |
| `firebase deploy` says "not logged in" | Run `firebase login` first |
| Seed script fails: "serviceAccountKey.json not found" | Make sure the file is in `ConnectHub-SPA/` — not a subfolder |
| Seed script fails: "Permission denied" | The service account key must be for the same Firebase project as your app |
| Admin dashboard shows no data | The metrics are currently static demo data. Real data will come when Firebase Analytics is connected (future sprint). |
| "Make Admin" button in Users tab doesn't work | The Cloud Functions haven't been deployed yet. Complete Step 3 above. |

---

## 📁 Complete File Reference

```
ConnectHub-SPA/
├── firestore.rules              ← Security rules (deploy to Firebase)
├── functions/
│   ├── index.js                 ← Exports all Cloud Functions
│   ├── set-admin-role.js        ← Admin role management functions
│   └── package.json             ← firebase-admin dependency
├── seed-ceo-admin.js            ← One-time CEO account creator
├── run-ceo-admin.bat            ← Double-click launcher
└── src/
    ├── App.jsx                  ← Routes with AdminGuard wrapping /admin/*
    ├── hooks/useAuth.js         ← Reads user.role from Firestore
    └── pages/admin/
        ├── AdminDashboardPage.jsx     ← /admin
        ├── AdminSubPages.jsx          ← /admin/users, /admin/announcements
        ├── KYCAdminPage.jsx           ← /admin/kyc
        ├── ReportsAdminPage.jsx       ← /admin/reports
        └── VerificationAdminPage.jsx  ← /admin/verification
```

---

## ⚡ Fastest Path — Full Setup in One Session

```
1. firebase login
2. firebase deploy --only firestore:rules,functions   (Steps 2 & 3 combined)
3. Download serviceAccountKey.json from Firebase Console → save to ConnectHub-SPA/
4. Double-click ConnectHub-SPA/run-ceo-admin.bat       (Step 5)
5. Delete serviceAccountKey.json                        (Step 6)
6. Go to http://localhost:5173/login → sign in as CEO@lynkapp.net
7. Go to http://localhost:5173/admin → admin dashboard is live ✅
8. Settings → Change your password
```

Total time: ~10 minutes.

---

*Guide created June 4, 2026 — LynkApp Admin System*
