# LynkApp — Minor UX Issues: Fix Status Report
**Date:** June 23, 2026  
**Source:** `app MINOR (polishUX issues).txt`

---

## ✅ Issue #10 — `useAuth.js` Auth Timeout Too Aggressive (FIXED)

**Problem:**  
The Firebase auth timeout was set to **3 seconds**. On slow/mobile connections this caused legitimate logged-in users to be incorrectly treated as unauthenticated mid-session and kicked to the login screen.

**Fix Applied (`ConnectHub-SPA/src/hooks/useAuth.js`):**  
- Increased timeout from `3000 ms` → **`15000 ms` (15 seconds)**  
- The timer is still cleared immediately the moment `onAuthStateChanged` fires, so users on fast connections experience **zero delay**  
- The 15s only applies as the absolute worst-case fallback for truly unreachable Firebase servers  
- Updated the inline comment to explain the reasoning

**File changed:** `ConnectHub-SPA/src/hooks/useAuth.js` (line ~46)

---

## ✅ Issue #12 — `serviceAccountKey.json` in Repo (VERIFIED SAFE — No Action Needed)

**Problem Reported:**  
`ConnectHub-SPA/serviceAccountKey.json` (Firebase Admin SDK private key) should never be in a public repository.

**Investigation Result:**  
The file is **NOT tracked by git** and was **never committed**. Verification:
- `.gitignore` already contains explicit rules blocking it:
  ```
  serviceAccountKey.json
  *serviceAccountKey*.json
  *service-account*.json
  *service_account*.json
  ConnectHub-SPA/serviceAccountKey.json
  ```
- `git rm --cached ConnectHub-SPA/serviceAccountKey.json` returned `fatal: pathspec did not match any files` — confirming it is untracked
- The file only exists **locally** and will never be pushed to GitHub

**Status:** ✅ Already protected. No key rotation needed.  
**Recommendation:** Keep the `.gitignore` rules as-is. The local file is fine for seeding scripts.

---

## ⚠️ Issue #11 — Placeholder Sub-Pages Need Real Content (PENDING — Developer Action Required)

**Problem:**  
Several "sub-pages" in the following files are placeholder skeletons with no real UI or data:

| File | Status |
|------|--------|
| `ConnectHub-SPA/src/pages/misc/RemainingDashboards.jsx` | Placeholder skeletons |
| `ConnectHub-SPA/src/pages/misc/MiscSubPages.jsx` | Placeholder skeletons |

These pages are reachable from navigation but show empty/stub content to real users.

**Why Not Fixed Now:**  
This requires full product/content decisions and real Firestore data wiring for each sub-page. This is a sprint-level task, not a single-file fix.

**What Needs to Happen (Pre-Launch Checklist):**
- [ ] Audit every route in `RemainingDashboards.jsx` — list which are true "coming soon" vs which need immediate content
- [ ] For "coming soon" pages: add a polished `EmptyState` component (already exists at `src/components/common/EmptyState.jsx`) with a message like "Coming soon — check back soon!"
- [ ] For pages that should have real content: wire to Firestore collections + build the UI
- [ ] Pages in `MiscSubPages.jsx` (Report, Feedback, WhatsNew, etc.) — verify these route correctly and show useful content
- [ ] Consider gating placeholder pages behind a feature flag so beta testers don't land on blank screens

**Estimated Effort:** 2–5 engineering days depending on scope

---

## Summary

| Issue | Status | File(s) Changed |
|-------|--------|----------------|
| #10 Auth timeout 3s → 15s | ✅ **FIXED & COMMITTED** | `useAuth.js` |
| #12 serviceAccountKey.json in repo | ✅ **ALREADY SAFE** (never tracked) | — |
| #11 Placeholder sub-pages | ⚠️ **PENDING** (requires sprint work) | `RemainingDashboards.jsx`, `MiscSubPages.jsx` |
