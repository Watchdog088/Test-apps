# Black Screen Fix — Root Cause Analysis & Resolution
**Date:** June 23, 2026  
**Files Changed:** `ConnectHub-SPA/src/hooks/useAuth.js`, `ConnectHub-SPA/src/components/layout/AppShell.jsx`

---

## Root Causes (4 bugs, all fixed)

### Bug #1 — `auth.currentUser` crash when Firebase is not initialised
**File:** `AppShell.jsx` — GAP-03 `useEffect`  
**Problem:** The live-stream notification effect called `auth.currentUser` directly.
When Firebase env vars are missing (e.g. on a fresh checkout without `.env`),
`auth` is `null` and the property access throws:  
`TypeError: Cannot read properties of null (reading 'currentUser')`  
React's error boundary catches this, renders nothing, and the screen is black.  
**Fix:** Added `if (!auth || !auth.currentUser) return;` guard at the top of the effect.

---

### Bug #2 — `useAppStore.getState()` called inside JSX (Rules-of-Hooks violation)
**File:** `AppShell.jsx` — `MobileBottomNav onCreatePost` prop  
**Problem:** The prop callback was:
```js
onCreatePost={() => {
  const setCreatePostOpen = useAppStore.getState().setCreatePostOpen;
  ...
}}
```
Calling `useAppStore.getState()` is fine anywhere, but the original code was
also accidentally calling `useAppStore(...)` (a hook) inside the JSX prop —
which violates Rules of Hooks and causes React to throw during render.  
**Fix:** `setCreatePostOpen` is now extracted with `useAppStore((s) => s.setCreatePostOpen)` at
the top level of `AppShell`, and the callback is simplified to `() => setCreatePostOpen(true)`.

---

### Bug #3 — `MiniPlayer` referenced deleted `playing`/`setPlaying` local state
**File:** `AppShell.jsx` — `MiniPlayer` component  
**Problem:** An earlier refactor was supposed to replace the local `playing` / `setPlaying`
state with Zustand store values (`storeIsPlaying` / `setStoreIsPlaying`), but the
play/pause `<button>` JSX still referenced the old, now-undefined variables.
This caused a ReferenceError that crashed the component tree inside `AppShell`,
resulting in a black screen.  
**Fix:** The button now correctly references `storeIsPlaying` / `setStoreIsPlaying`.

---

### Bug #4 — `useAuth` nested Firestore `onSnapshot` listener leak
**File:** `useAuth.js` — `following` snapshot callback  
**Problem:** Every time the following-list changed, a brand-new `followers` listener
was registered *inside* the `following` snapshot callback without ever cancelling
the previous one.  Over time this created an unbounded number of open Firestore
connections.  Each new listener re-triggered the auth state chain, which caused
the `loading` flag to oscillate, producing repeated SplashScreen flashes —
effectively a black/white screen loop.  
**Fix:** A `let unsubFollowers = null` ref tracks the active inner listener;
it is cancelled (`unsubFollowers()`) before a new one is opened.  Both listeners
are also pushed into the shared `unsubs` array so the outer cleanup on logout
tears them all down correctly.

---

## Additional hardening also shipped

| Item | Description |
|------|-------------|
| `useAuth` — BLACK-SCREEN-FIX | `loading` now initialises from `useAppStore.getState().user` so subsequent calls to `useAuth()` on the same page load don't each restart with `loading=true`, avoiding extra SplashScreen flashes. |
| `useAuth` — NULL-AUTH-FIX | If `auth` is `null` (missing env vars), the hook immediately resolves with `user=null` instead of hanging forever. |
| `useAuth` — TIMEOUT-FIX | A 3-second timeout ensures the app never stays stuck on the splash screen even if Firebase takes too long to respond. |

---

## How to verify the fix

```bash
cd ConnectHub-SPA
npm run dev
```

1. Open `http://localhost:5173` in a browser.
2. The app should load the LandingPage / LoginPage — **no black screen**.
3. Log in with any test account.
4. Navigate between pages — no more SplashScreen flicker between route changes.
5. Open DevTools → Console → confirm zero `TypeError: Cannot read properties of null` errors.
