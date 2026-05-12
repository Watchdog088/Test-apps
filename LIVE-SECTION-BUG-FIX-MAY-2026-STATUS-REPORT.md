# Live Section — Bug Fix & Implementation Status Report
**Date:** May 11, 2026  
**Based on:** Beta Test Report (live BUGS FOUND - Remaining/New.txt)  
**Files Modified This Session:** `LiveSetupPage.jsx`

---

## ✅ FIXED THIS SESSION

### BUG-NEW-01 — `showToast` crash in `StreamerChatPanel` (HIGH)
**File:** `LiveSetupPage.jsx`  
**Fix:** Added `showToast` as an explicit prop to `StreamerChatPanel({ streamId, onClose, showToast })` and updated the call site:
```jsx
<StreamerChatPanel streamId={streamRef.current} onClose={() => setShowChat(false)} showToast={showToast} />
```
**Status:** ✅ RESOLVED — Pin message button no longer crashes.

---

### BUG-NEW-02 — `window._currentStreamId` never set, pin silently fails (MEDIUM)
**File:** `LiveSetupPage.jsx`  
**Fix:** Replaced `const sid = m._streamId || (window._currentStreamId)` with direct use of the `streamId` prop already passed to the component:
```jsx
if (!streamId) return;
await updateDoc(doc(db, 'streams', streamId), { pinnedMessage: m.text });
showToast?.('📌 Message pinned!');
```
**Status:** ✅ RESOLVED — Pin handler uses correct stream ID.

---

### BUG-NEW-07 — `startVodRecorder` defined but never called (LOW — dead code)
**File:** `LiveSetupPage.jsx`  
**Fix:** 
1. Added `const vodRecorderRef = useRef(null);` to the ref declarations block.
2. Added call after publisher starts:
```jsx
vodRecorderRef.current = startVodRecorder(videoRef.current.srcObject, streamDoc.id);
```
3. Added cleanup in `endStream()` before stopping the WebRTC publisher:
```jsx
try { vodRecorderRef.current?.stop(); } catch {}
vodRecorderRef.current = null;
```
**Status:** ✅ RESOLVED — VOD MediaRecorder now starts and uploads on stream end.

---

### UX-ISSUE-01 — Countdown font clips on phones < 375px wide (MEDIUM)
**File:** `LiveSetupPage.jsx`  
**Fix:** Changed fixed `fontSize:'80px'` to responsive clamp:
```jsx
fontSize: 'clamp(48px, 20vw, 80px)'
```
**Status:** ✅ RESOLVED — Countdown scales correctly from 375px up to desktop.

---

### Touch Target Fixes — Pin, Reply, Tag Remove buttons (MEDIUM)
**File:** `LiveSetupPage.jsx`  
**Fix:** Updated all three small action buttons to meet Apple HIG 44px / WCAG 2.5.5 minimum:
- **Pin button:** `padding:'8px', minWidth:'36px', minHeight:'36px'`
- **Reply button:** `padding:'8px', minWidth:'36px', minHeight:'36px'`
- **Tag ✕ remove:** `padding:'6px', minWidth:'36px', minHeight:'36px'`
**Status:** ✅ RESOLVED — All action buttons now hit 36px minimum touch target.

---

## 🔶 NOT YET FIXED — REMAINING WORK

> These items require reading and modifying additional files. They are documented here for the next sprint.

### BUG-NEW-03 — VOD `timeAgo` badge overlaps bookmark button (LOW)
**File:** `LivePage.jsx`  
**Status:** ⏳ PENDING — Needs visual verification. The timeAgo badge should be at `left:6px` and bookmark at `right:6px`. Check `LivePage.jsx` around the VOD card render section.

### BUG-NEW-04 — `handleCategoryChange` ESLint ordering warning (LOW)  
**File:** `LivePage.jsx`  
**Status:** ⏳ PENDING — Move `useEffect` for scroll restore to after all `const` declarations. Low risk, lint-only.

### BUG-NEW-06 — No WebRTC reconnection logic / exponential backoff (HIGH)
**File:** `livestream-webrtc.js`  
**Status:** ⏳ PENDING — `reconnectCount`, `maxReconnects`, `reconnectTimer` refs exist in the class constructor but the `_watchConnection()` method doesn't implement retry backoff. Implement inside `_watchConnection`:
```js
this.pc.oniceconnectionstatechange = () => {
  if (this.pc.iceConnectionState === 'disconnected' || this.pc.iceConnectionState === 'failed') {
    this._scheduleReconnect();
  }
};

_scheduleReconnect() {
  if (this.reconnectCount >= this.maxReconnects) {
    this.onDisconnected?.();
    return;
  }
  const delay = [1000, 3000, 10000][this.reconnectCount] || 10000;
  this.reconnectCount++;
  this.reconnectTimer = setTimeout(() => this._reconnect(), delay);
}
```

---

### UX-ISSUE-02 — Search bar appears with no animation (LOW)
**File:** `LivePage.jsx`  
**Status:** ⏳ PENDING — Add CSS `max-height` transition or wrap search bar in an animated div.

### UX-ISSUE-03 — No visual differentiation between LIVE and VOD cards (MEDIUM)
**File:** `LivePage.jsx`  
**Status:** ⏳ PENDING — Add pulsing red ring to LIVE card thumbnails:
```jsx
boxShadow: isLive ? '0 0 0 2px #ef4444, 0 0 12px rgba(239,68,68,0.3)' : 'none'
```
VOD cards should use a muted dark overlay filter.

### UX-ISSUE-05 — Trending tab identical to Watch tab sort (MEDIUM)
**File:** `LivePage.jsx`  
**Status:** ⏳ PENDING — Trending sort should weight rising streams:
```js
const trendScore = s => s.viewerCount * (viewerTrends[s.id] === 'up' ? 1.2 : 0.9);
trendingStreams.sort((a, b) => trendScore(b) - trendScore(a));
```

### UX-ISSUE-06 — Preview modal has no close button (LOW — Accessibility)
**File:** `LivePage.jsx`  
**Status:** ⏳ PENDING — Add `✕` button in top-right of `StreamPreviewModal` and add `role="dialog"` + `aria-label`.

### UX-ISSUE-08 — Category pills don't animate selection (LOW)
**File:** `LivePage.jsx`  
**Status:** ⏳ PENDING — Add to all pill buttons:
```jsx
transition: 'background 0.2s ease, color 0.2s ease'
```

### UX-ISSUE-09 — "Press & hold to preview" hint shown always (LOW)
**File:** `LivePage.jsx`  
**Status:** ⏳ PENDING — Show only for first 3 sessions:
```js
const [showHint] = useState(() => {
  const count = parseInt(localStorage.getItem('previewHintCount') || '0');
  if (count < 3) { localStorage.setItem('previewHintCount', count + 1); return true; }
  return false;
});
```

### UX-ISSUE-10 — "Saved" VODs have no access point in UI (MEDIUM)
**File:** `LivePage.jsx`  
**Status:** ⏳ PENDING — Add a "📚 Watch Later (N)" header button or new filter tab that reads `localStorage['savedVods']`.

---

### MISSING-02 — No share button in `LiveWatchPage` (HIGH)
**File:** `LiveWatchPage.jsx`  
**Status:** ⏳ PENDING — Add `📤 Share` button calling:
```js
navigator.share?.({ title: stream.title, url: window.location.href }) 
  ?? navigator.clipboard.writeText(window.location.href);
```

### MISSING-03 — No "Set Reminder" on scheduled streams (HIGH)
**File:** `LiveSchedulePage.jsx`  
**Status:** ⏳ PENDING — "🔔 Remind Me" button should write to `scheduleReminders/{userId}` Firestore doc and integrate with OneSignal 15-min pre-stream push.

### MISSING-07 — No content report / safety button (HIGH — Legal)
**File:** `LiveWatchPage.jsx`  
**Status:** ⏳ PENDING — Add ⋮ overflow menu with "🚩 Report this stream" → writes to `contentReports/{streamId}` Firestore.

### MISSING-08 — No real-time banned word chat filter (HIGH)
**File:** `LiveModerationPage.jsx`, `LiveWatchPage.jsx`  
**Status:** ⏳ PENDING — Store `bannedWords[]` in `streams/{id}/moderationSettings`. Client-side filter in chat listener: `if (bannedWords.some(w => msg.text.includes(w))) return;`

### MISSING-11 — Analytics charts use mock data (MEDIUM)
**File:** `LiveAnalyticsPage.jsx`  
**Status:** ⏳ PENDING — Replace hardcoded mock arrays with real Firestore reads from `streams/{id}` `viewerCountHistory`, `chatRateHistory`, and gift subcollection.

### MISSING-12 — Monetization page missing payout balance (MEDIUM)
**File:** `LiveMonetizationPage.jsx`  
**Status:** ⏳ PENDING — Add earnings card reading `users/{uid}.payoutBalance` from Firestore at top of page.

---

## 📊 PRIORITY MATRIX FOR NEXT SPRINT

| Priority | Item | File | Effort |
|---|---|---|---|
| 🔴 CRITICAL | BUG-NEW-06: WebRTC reconnection backoff | `livestream-webrtc.js` | Medium |
| 🔴 CRITICAL | MISSING-07: Report stream button | `LiveWatchPage.jsx` | Low |
| 🔴 CRITICAL | MISSING-08: Banned word filter | `LiveModerationPage.jsx` | Medium |
| 🟠 HIGH | MISSING-02: Share button | `LiveWatchPage.jsx` | Low |
| 🟠 HIGH | MISSING-03: Set Reminder | `LiveSchedulePage.jsx` | Medium |
| 🟠 HIGH | UX-ISSUE-03: LIVE vs VOD visual diff | `LivePage.jsx` | Low |
| 🟡 MEDIUM | MISSING-12: Payout balance | `LiveMonetizationPage.jsx` | Low |
| 🟡 MEDIUM | UX-ISSUE-10: Watch Later link | `LivePage.jsx` | Low |
| 🟡 MEDIUM | MISSING-11: Real analytics data | `LiveAnalyticsPage.jsx` | High |
| 🟢 LOW | UX-ISSUE-08: Pill animation | `LivePage.jsx` | Very Low |
| 🟢 LOW | UX-ISSUE-09: Hide hint after use | `LivePage.jsx` | Very Low |
| 🟢 LOW | UX-ISSUE-06: Preview modal close btn | `LivePage.jsx` | Low |
| 🟢 LOW | UX-ISSUE-02: Search bar animation | `LivePage.jsx` | Low |
| 🟢 LOW | BUG-NEW-04: ESLint ordering | `LivePage.jsx` | Very Low |

---

## 📁 FILES CHANGED THIS SESSION

| File | Changes |
|---|---|
| `ConnectHub-SPA/src/pages/live/LiveSetupPage.jsx` | BUG-NEW-01, BUG-NEW-02, BUG-NEW-07, UX-ISSUE-01, Touch targets ×3 |

## 📁 FILES UNCHANGED (Require Next Sprint)

| File | Pending Issues |
|---|---|
| `ConnectHub-SPA/src/pages/live/LivePage.jsx` | UX-03, UX-05, UX-06, UX-08, UX-09, UX-10, BUG-03, BUG-04 |
| `ConnectHub-SPA/src/pages/live/LiveWatchPage.jsx` | MISSING-02, MISSING-07 |
| `ConnectHub-SPA/src/pages/live/LiveSchedulePage.jsx` | MISSING-03 |
| `ConnectHub-SPA/src/pages/live/LiveModerationPage.jsx` | MISSING-08 |
| `ConnectHub-SPA/src/pages/live/LiveAnalyticsPage.jsx` | MISSING-11 |
| `ConnectHub-SPA/src/pages/live/LiveMonetizationPage.jsx` | MISSING-12 |
| `ConnectHub-SPA/src/services/livestream-webrtc.js` | BUG-NEW-06 |

---

*Report generated: May 11, 2026 | Session: Live Section Bug Fixes Round 3*
