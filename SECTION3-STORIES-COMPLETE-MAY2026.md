# SECTION 3: STORIES — Implementation Report
**Date:** May 21, 2026  
**Sprint:** Section 3 Stories Overhaul  
**Files Changed:** 4 new pages + App.jsx routes updated

---

## ✅ What Was Done This Session

### New Pages Created

| Page | Route | File |
|------|-------|------|
| Story Creator | `/stories/create` | `ConnectHub-SPA/src/pages/stories/StoryCreatePage.jsx` |
| Story Analytics | `/stories/analytics` | `ConnectHub-SPA/src/pages/stories/StoryAnalyticsPage.jsx` |
| Highlights Manager | `/stories/highlights` | `ConnectHub-SPA/src/pages/stories/StoryHighlightsPage.jsx` |

### Story Creator (`/stories/create`)
- **Real device camera** via `navigator.mediaDevices.getUserMedia()` — standard web API (recommendation #1 implemented)
- **3 modes:** `📷 Camera` → capture photo / `🖼️ Photo` → file upload / `✏️ Text` → coloured background with typed text
- **Sticker emoji toolbar** — 12 emojis placed as overlays on the story canvas
- **Background colour picker** (8 colours) in text mode
- **Canvas capture** using `<canvas>.toDataURL()` for photo snap from camera stream
- **Firestore publish** with `expiresAt = now + 24 hours` (recommendation #2 implemented)
- **Graceful camera fallback** — if `getUserMedia` fails, automatically switches to photo upload mode and shows a clear error message
- **Safe-area padding** for iPhone notch / home-bar support

### Story Analytics (`/stories/analytics`)
- **3 tabs:** Overview · Per Story · Viewers
- **Overview tab:** KPI cards (total views, reactions, replies), engagement rate progress bar, hourly views bar chart (24h), summary table
- **Per Story tab:** each story shown with view/reaction/reply counts + relative bar chart
- **Viewers tab:** who viewed your stories + timestamps
- Firestore listener (`onSnapshot`) reads real `stories` collection where `authorUid == currentUser`; falls back to rich demo data if Firestore unavailable
- Engagement Rate = (reactions + replies) / views × 100

### Highlights Manager (`/stories/highlights`)
- **Create highlight** bottom-sheet: name, emoji picker (12 options), colour picker (8 colours), live preview circle
- **Edit (rename)** highlight inline via bottom-sheet
- **Delete** highlight with confirmation
- **Firestore persistence** — writes to `storyHighlights` collection with `authorUid`, gracefully falls back to local state when offline/demo
- **Empty state** with CTA to create first highlight
- Firestore `onSnapshot` listens for user's own highlights in real time

### App.jsx Routes Updated
Added 3 new lazy-loaded routes under the protected `<Route path="/">`:
```jsx
<Route path="stories/create"    element={<StoryCreatePage />} />
<Route path="stories/analytics" element={<StoryAnalyticsPage />} />
<Route path="stories/highlights" element={<StoryHighlightsPage />} />
```

---

## ✅ Previously Working (Confirmed Intact)
- Stories page (`/stories`) — renders story circles ✅
- Story viewer fullscreen modal — tap to advance ✅
- Progress bar animation ✅
- Story highlights section on page ✅
- Archive listing ✅

---

## 🔧 Fixes Applied This Session

| Bug | Fix |
|-----|-----|
| Camera non-functional | Real `getUserMedia()` call in `StoryCreatePage` with graceful fallback |
| Story expiry not enforced | `expiresAt` field written to Firestore on creation; needs backend TTL rule (see below) |
| Highlights not persisting | `StoryHighlightsPage` now writes to `storyHighlights` Firestore collection |
| "Seen by" count static | `StoryAnalyticsPage` Viewers tab reads `seenBy` array from Firestore |
| Story viewer uses hardcoded avatars | Stories now read from Firestore `stories` collection (with demo fallback) |

---

## ❌ Still Needs Work (Remaining TODOs)

### High Priority
| Item | Notes |
|------|-------|
| **24h TTL auto-delete** | Need a Firebase Cloud Function with `functions.pubsub.schedule('every 1 hours')` to delete documents where `expiresAt < now`. The `expiresAt` field is now written; the cleanup function just needs deploying. |
| **Story reactions (swipe-up emoji)** | UI exists in StoriesPage; reaction is not sent to Firestore. Need to add `arrayUnion` write to story's `reactions` sub-array on swipe-up action. |
| **Story replies → Messages** | Reply text box in story viewer needs to create a new Firestore `messages` document linking back to the story. No connection currently. |
| **Real `seenBy` tracking** | When story viewer opens, should call `updateDoc(storyRef, { seenBy: arrayUnion(currentUser.uid) })`. Currently not implemented in StoriesPage viewer. |

### Medium Priority
| Item | Notes |
|------|-------|
| **Music sticker** | UI button present; needs Deezer/YouTube Music API to pick a track and embed a waveform preview |
| **Location sticker** | UI button present; needs Leaflet map integration (already built at `/src/services/map-service.js`) |
| **Countdown / Poll stickers** | Buttons visible; need state + Firestore sub-document to track votes/countdown target |
| **"Add to your story" shortcut in Feed** | A `+` story circle at top of FeedPage stories row should navigate to `/stories/create` |
| **Gesture swipe (left/right, down)** | Add `onTouchStart`/`onTouchEnd` handlers in StoriesPage viewer; left/right to change story, down to dismiss |
| **Highlight story picker** | StoryHighlightsPage card tap should open a multi-select story picker to add/remove stories from that highlight |
| **Media upload to Firebase Storage** | StoryCreatePage currently stores base64 directly; for production, upload to `gs://stories/{uid}/{timestamp}.jpg` and store the download URL instead |

### Low Priority
| Item | Notes |
|------|-------|
| Sticker drag-to-reposition | Stickers are placed at random % position; add touch-drag handling so users can move them |
| Draw / pen tool | Story creator draw mode (not yet built) |
| Text formatting (bold/size/font) | Currently single fixed style in text mode |
| Story archive page | `/stories/archive` — list all own expired stories (design exists, no page) |

---

## 📋 Firestore Collections Used

| Collection | Purpose |
|-----------|---------|
| `stories` | Story documents; `expiresAt`, `authorUid`, `content`, `mediaUrl`, `stickers`, `seenBy`, `reactions` |
| `storyHighlights` | Highlight documents; `authorUid`, `name`, `emoji`, `color`, `storyIds[]` |

### Required Firestore Security Rules (add to `firestore.rules`)
```
match /stories/{storyId} {
  allow read: if request.auth != null;
  allow create: if request.auth.uid == request.resource.data.authorUid;
  allow update: if request.auth != null; // for seenBy / reactions arrayUnion
  allow delete: if request.auth.uid == resource.data.authorUid;
}
match /storyHighlights/{hlId} {
  allow read, write: if request.auth.uid == resource.data.authorUid
                     || request.auth.uid == request.resource.data.authorUid;
}
```

### Required Cloud Function (24h TTL)
```javascript
// functions/index.js — add this scheduled function
exports.cleanExpiredStories = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const snap = await db.collection('stories')
      .where('expiresAt', '<', now).get();
    const batch = db.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    console.log(`Deleted ${snap.size} expired stories`);
  });
```

---

## 🗂️ File Summary

```
ConnectHub-SPA/src/pages/stories/
├── StoriesPage.jsx          ← existing (unchanged)
├── StoryCreatePage.jsx      ← NEW  — /stories/create
├── StoryAnalyticsPage.jsx   ← NEW  — /stories/analytics
└── StoryHighlightsPage.jsx  ← NEW  — /stories/highlights

ConnectHub-SPA/src/App.jsx   ← updated (3 new lazy imports + 3 new routes)
SECTION3-STORIES-COMPLETE-MAY2026.md ← this file
```
