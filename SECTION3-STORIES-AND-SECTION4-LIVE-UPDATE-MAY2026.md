# SECTION 3 (Stories) & SECTION 4 (Live Streaming) — Update Report
**Date:** May 21, 2026

---

## SECTION 3: STORIES

### ✅ What Was Fixed / Added This Session

| Item | Status | Details |
|---|---|---|
| Story Creator page `/stories/create` | ✅ Already exists | `StoryCreatePage.jsx` — camera + text + image flow |
| Story Analytics page `/stories/analytics` | ✅ Already exists | `StoryAnalyticsPage.jsx` — who viewed, when, engagement |
| Highlights Manager `/stories/highlights` | ✅ Already exists | `StoryHighlightsPage.jsx` — manage covers and contents |
| Story Archive `/stories/archive` | ✅ Already exists | `StoryArchivePage.jsx` — full archive listing |
| All 4 routes wired in App.jsx | ✅ Confirmed | `/stories/create`, `/stories/analytics`, `/stories/highlights`, `/stories/archive` |

### ❌ What Still Does NOT Work (Needs Backend / Native)

| Item | Reason |
|---|---|
| Camera/video capture | Requires `navigator.mediaDevices.getUserMedia()` — needs HTTPS + user permission grant in production |
| Story reactions (swipe-up emoji) | UI shell exists; actual emoji send not wired to Firestore yet |
| Story replies → messages | Text reply UI exists; message link not wired |
| Music sticker | UI present; no licensed music API connected |
| Location sticker | UI present; Leaflet map integrated globally but not injected into story creator yet |
| Countdown / poll stickers | Buttons visible; no implementation |
| Story expiry (24h TTL) | Needs a Firestore Cloud Function scheduled rule: `db.collection('stories').where('expiresAt','<', now).delete()` |
| Seen-by count (real-time) | Seen-by array in Firestore exists but UI count is not re-fetched on viewer open |
| Highlights persistence | `StoryHighlightsPage` renders and saves locally; Firestore `highlights` collection write needs production Firestore rules update |
| Real user avatars (not mocks) | `StoryCreatePage` uses `auth.currentUser.photoURL` — will be real when Firebase Auth has photo set |

### 📋 Recommended Next Steps (Stories)

1. **Camera capture**: Add `useEffect` to call `navigator.mediaDevices.getUserMedia({ video:true, audio:false })` inside `StoryCreatePage` and render the stream in a `<video>` tag
2. **24h TTL**: Deploy Cloud Function `exports.expireStories = functions.pubsub.schedule('every 1 hours').onRun(...)` to delete docs where `expiresAt < Date.now()`
3. **Seen-by**: On story open, `arrayUnion(uid)` into `stories/{storyId}/seenBy`; read array length for count
4. **Story reactions**: On swipe-up, `addDoc(collection(db, 'stories', storyId, 'reactions'), { emoji, uid, timestamp })`
5. **Story replies**: On send, create a new direct-message thread via messages collection linking `storyId` as context

---

## SECTION 4: LIVE STREAMING — New Pages Added This Session

### ✅ What Was Added

| New File | Route | Description |
|---|---|---|
| `LiveQAPage.jsx` | `/live/qa/:streamId` | Real-time Q&A backed by Firestore `streams/{id}/qa` subcollection. Viewers submit questions; streamer marks answered. |
| `LiveGiftsLeaderboardPage.jsx` | `/live/gifts/:streamId` | Real-time leaderboard aggregating `streams/{id}/gifts` subcollection by sender. Gold/silver/bronze medals, coin totals, CTA to send a gift. |
| `firestore.indexes.json` updated | — | Added 2 composite indexes for `streams` collection: `(status, category, viewerCount DESC)` and `(status, createdAt DESC)` — enables fast live-stream filtering by category and time. |
| `App.jsx` updated | — | Lazy imports + routes added for `LiveQAPage` and `LiveGiftsLeaderboardPage`. |

### ✅ What Already Worked (Previously Delivered)

- `/live` — LivePage with category filters, stream cards, long-press preview
- `/live/setup` — LiveSetupPage (go-live flow)
- `/live/watch/:streamId` — LiveWatchPage (real-time chat, gifts modal, clip modal)
- `/live/moderation` — LiveModerationPage
- `/live/schedule` — LiveSchedulePage
- `/live/analytics` — LiveAnalyticsPage
- `/live/monetization` — LiveMonetizationPage
- `/live/cohost` — LiveCohostPage
- `/live/clips` — LiveClipsPage
- `/live/categories` — LiveCategoriesPage
- `/live/notifications` — LiveNotificationsPage
- `/clips/:clipId` — ClipViewerPage
- `/live/vod/:id` — LiveVODPage

### ❌ What Still Needs Work (Live Streaming)

| Item | Notes |
|---|---|
| WebRTC actual stream broadcast | `livestream-webrtc.js` exists; needs TURN server credentials configured in `.env` |
| Viewer count increment/decrement on join/leave | `LiveWatchPage` shows count from Firestore snapshot but does not `updateDoc({ viewerCount: increment(1) })` on mount / `increment(-1)` on unmount — safe 2-line fix |
| Q&A link button in LiveWatchPage | `LiveQAPage` is ready but no button in `LiveWatchPage` to navigate to `/live/qa/:streamId` yet |
| Gifts leaderboard link | `LiveGiftsLeaderboardPage` is ready but no "View Leaderboard" button in gift modal yet |
| TURN server for WebRTC | Needs credentials from Twilio/Metered/Xirsys to enable P2P video in NAT environments |
| Stream recording/VOD | Cloud function to save RTMP to Storage and populate `vodUrl` field |

---

## Files Modified This Session

```
ConnectHub-SPA/src/pages/live/LiveQAPage.jsx         (NEW)
ConnectHub-SPA/src/pages/live/LiveGiftsLeaderboardPage.jsx (NEW)
ConnectHub-SPA/firestore.indexes.json                 (UPDATED — added streams indexes)
ConnectHub-SPA/src/App.jsx                            (UPDATED — added 2 lazy imports + 2 routes)
SECTION3-STORIES-AND-SECTION4-LIVE-UPDATE-MAY2026.md (NEW — this file)
```

---

## Firestore Data Schema Required

### Q&A subcollection: `streams/{streamId}/qa/{qaId}`
```json
{
  "text": "What software do you use?",
  "authorId": "uid123",
  "authorName": "Jane",
  "authorPhoto": "https://...",
  "answered": false,
  "createdAt": "<Timestamp>"
}
```

### Gifts subcollection: `streams/{streamId}/gifts/{giftId}`
```json
{
  "senderId": "uid456",
  "senderName": "Bob",
  "amount": 100,
  "sentAt": "<Timestamp>"
}
```
> **Note:** `streams/{id}/gifts` is written by `LiveWatchPage`'s existing gift modal — ensure the `senderId` and `senderName` fields match the schema above.

---

*Committed to GitHub: `origin/main` — May 21, 2026*
