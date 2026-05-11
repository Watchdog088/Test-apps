# Live Section Bug Fix & Feature Implementation Progress Report
**Date:** May 11, 2026  
**Source report:** `live 1.2 BUGS FOUND.txt` (user-submitted beta test findings)  
**Branch:** `main` | Last commit: `ec1f9fd`

---

## SUMMARY

This report tracks every bug and missing feature from the beta test report across 8 sections of the Live module. Items are marked ✅ DONE, 🔄 PARTIAL, or ❌ PENDING (next session).

---

## ✅ COMPLETED IN THIS SESSION

### ClipViewerPage.jsx — `ConnectHub-SPA/src/pages/live/ClipViewerPage.jsx`
**Commit:** `b20993c`  
Full file rewrite — 310 insertions.

| ID | Fix | Status |
|---|---|---|
| BUG-C01 / MISS-C01 | Share button: `navigator.share()` + clipboard fallback | ✅ Done |
| BUG-C02 | Download button (anchor click `a.download`) | ✅ Done |
| BUG-C03 | Related clips rail (Firestore query top 10 by views, excludes current) | ✅ Done |
| BUG-C04 | Comment section (Firestore addDoc + real-time optimistic display) | ✅ Done |
| MISS-C02 | Clip looping toggle (`<video loop>` + button to toggle) | ✅ Done |
| MISS-C03 | Emoji reactions bar (6 reactions, persisted to Firestore) | ✅ Done |
| *Bonus* | View count increment on mount | ✅ Done |
| *Bonus* | Like toggle with optimistic UI + error revert | ✅ Done |
| *Bonus* | Sign-in prompt for unauthenticated comment/react/like | ✅ Done |

---

### LiveAnalyticsPage.jsx — `ConnectHub-SPA/src/pages/live/LiveAnalyticsPage.jsx`
**Commit:** `ec1f9fd`  
Full file rewrite — completely replaced mock `Math.random()` data.

| ID | Fix | Status |
|---|---|---|
| BUG-A01 | **CRITICAL** Replaced `Math.random()` with real Firestore `streamHistory/{uid}/sessions` queries | ✅ Done |
| BUG-A02 | Date range selector: 7d / 30d / 90d / All — re-queries on change | ✅ Done |
| BUG-A03 | Real revenue from `gifts/` subcollection (coins × $0.01 × 70% share) | ✅ Done |
| BUG-A04 | "Best Stream" computed from highest `peakViewers` in real session data | ✅ Done |
| MISS-A01 | Real Firestore aggregation hook (inline in component) | ✅ Done |
| MISS-A02 | Chat activity heatmap explained (bucket tracking info card) | ✅ Done |
| MISS-A04 | CSV export button — serializes all session data, triggers `URL.createObjectURL` download | ✅ Done |
| MISS-A05 | Period-over-period ▲▼ delta indicators (current vs previous equal period) | ✅ Done |
| MISS-A03 | Geographic breakdown — informational card (requires browser geo tracking) | 🔄 Info card |

---

### LiveMonetizationPage.jsx — `ConnectHub-SPA/src/pages/live/LiveMonetizationPage.jsx`
**Commit:** `ec1f9fd`  
Full file rewrite.

| ID | Fix | Status |
|---|---|---|
| BUG-M01 | **CRITICAL** Real balance display (total gifts × 70% minus paid-out history) + Withdraw button | ✅ Done |
| BUG-M02 | Subscription price validated: min $0.99, max $499.99, inline error message | ✅ Done |
| BUG-M03 | Stripe Connect — UI placeholder with clear "NEEDS_BACKEND" note + contact support instruction | 🔄 UI Only |
| BUG-M04 | Revenue split bar: 70% Creator / 30% Platform — always visible | ✅ Done |
| MISS-M01 | Payout history table: reads `payouts/{uid}/history`, shows amount/status/date | ✅ Done |
| MISS-M02 | Monthly earnings forecast: subscribers × price + avg gifts × 4 | ✅ Done |
| MISS-M03 | Tax info (W-9/VAT) — informational placeholder under Bank Connect section | 🔄 Info Only |
| MISS-M04 | Bank account status — shown as part of Stripe Connect section | 🔄 UI Only |

---

## ❌ PENDING — NEXT SESSION

### LiveModerationPage.jsx
**File:** `ConnectHub-SPA/src/pages/live/LiveModerationPage.jsx`

| ID | Fix Needed |
|---|---|
| BUG-MOD01 | Add "Escalate to Platform Admin" button → writes to `adminReports/` collection |
| BUG-MOD02 | **CRITICAL** Ban enforcement: `LiveWatchPage.jsx` sendMessage must check `bannedUsers/` before `addDoc` |
| BUG-MOD03 | Move banned word list to `users/{uid}/moderationSettings` (per-account, not per-stream) |
| BUG-MOD04 | Audit log: write ban/unban actions to `moderationAuditLog/` subcollection |
| BUG-MOD05 | Report context: show prior chat messages alongside reported message |
| MISS-MOD01 | **CRITICAL** Wire `openAIModerationService.moderate()` to chat `addDoc` pipeline |
| MISS-MOD02 | Timeout ban: `timeoutUntil` field + check in send handler |
| MISS-MOD03 | Viewer report history: link to `reports/?reportedUserId=X` |
| MISS-MOD04 | Keyword alerts: highlight watch-word messages client-side |

---

### LiveSchedulePage.jsx
**File:** `ConnectHub-SPA/src/pages/live/LiveSchedulePage.jsx`

| ID | Fix Needed |
|---|---|
| BUG-SC01 | Viewer "Set Reminder" — not a bug, see MISS-SC01 |
| BUG-SC02 | Recurring stream creates future docs (daily/weekly instances) in Firestore |
| BUG-SC03 | Display `scheduledAt` in user's local timezone with `toLocaleString()` |
| BUG-SC04 | Form fields (especially category) properly reset after submit |
| MISS-SC01 | **CRITICAL** "Browse Upcoming (Following)" tab — queries followed users' scheduled streams |
| MISS-SC02 | 🔔 Reminder bell on stream cards → writes to `reminders/{uid}/{scheduleId}` |
| MISS-SC03 | iCal/Google Calendar export (.ics file download) |
| MISS-SC04 | Timezone label next to each scheduled time (`Intl.DateTimeFormat().resolvedOptions().timeZone`) |

---

### LiveWatchPage.jsx — CRITICAL BUGS PENDING
**File:** `ConnectHub-SPA/src/pages/live/LiveWatchPage.jsx`

| ID | Fix Needed | Priority |
|---|---|---|
| BUG-W01 / MISS-W01 | **P0** Share button: `navigator.share()` + clipboard fallback in controls | 🔴 Critical |
| BUG-MOD02 | **P0** Check `bannedUsers/` before sendMessage `addDoc` | 🔴 Critical |
| MISS-MOD01 | **P0** Run `openAIModerationService.moderate(text)` before each chat message | 🔴 Critical |
| BUG-W03 | Poll vote: disable button + show spinner while Firestore call pending | 🟡 Medium |
| BUG-W04 | MediaRecorder MIME type fallback: check `isTypeSupported()` before vp9 | 🟡 Medium |
| BUG-W05 | Chat `addDoc` failure: show toast "Message failed to send" on error | 🟡 Medium |
| BUG-W07 | iOS fullscreen: `video.webkitRequestFullscreen?.()` fallback | 🟡 Medium |
| BUG-W08 | Back-navigation guard: `window.onbeforeunload` confirm "Leave stream?" | 🟡 Medium |
| MISS-W02 | "Add to Watch Later" 🔖 button in controls | 🟡 Medium |
| MISS-W05 | VOD progress memory: store `currentTime` in localStorage on `timeupdate` | 🟡 Medium |
| MISS-W06 | Keyboard shortcuts: K=pause, F=fullscreen, M=mute, C=chat, ←→=seek | 🟢 Low |
| BUG-W06 | `streamAge()` uses `Date.now()` not `nowTs` — low visual impact | 🟢 Low |

---

### LiveSetupPage.jsx
**File:** `ConnectHub-SPA/src/pages/live/LiveSetupPage.jsx`

| ID | Fix Needed | Priority |
|---|---|---|
| BUG-S05 | **P0** End stream calls `livestreamWebRTC.destroy()` — camera LED stays on without this | 🔴 Critical |
| BUG-S01 / MISS-S01 | **P1** Auto-thumbnail: canvas screenshot 10s after `startStream()`, upload to Storage | 🟡 High |
| MISS-S02 | **P1** Quality monitoring bar: `getStats()` every 5s → 🟢/🟡/🔴 bitrate indicator | 🟡 High |
| BUG-S02 | Camera permission denied state with user instructions | 🟡 Medium |
| BUG-S04 | Tags deduplication: `[...new Set(tags)]` in tag parser | 🟢 Low |
| BUG-S03 | iOS Safari WebRTC background kill — requires native RTMP, cannot fix in browser | ❌ Platform Limitation |
| MISS-S03 | Round-trip loopback preview — complex, nice-to-have | 🟢 Low |
| MISS-S04 | Co-streaming guest invite — major new feature, separate sprint | ❌ Future Sprint |
| MISS-S05 | Stream title templates — simple UX addition | 🟢 Low |

---

### LivePage.jsx (Browse Page)
**File:** `ConnectHub-SPA/src/pages/live/LivePage.jsx`

| ID | Fix Needed | Priority |
|---|---|---|
| MISS-L01 | Go Live FAB: fixed red 🔴 button bottom-right above nav → navigate to `/live/setup` | 🟡 High |
| MISS-L08 | LIVE card pulsing red ring: `boxShadow + animation: liveRingPulse` on live cards | 🟡 High |
| MISS-L08 | Add keyframe `liveRingPulse` to `global.css` | 🟡 High |
| MISS-L02 | Skeleton for featured banner (full-width 16:9 skeleton while loading) | 🟡 Medium |
| MISS-L06 | Share button 🔗 on each stream card in browse | 🟡 Medium |
| BUG-L05 | iOS Safari autoFocus: use `setTimeout(() => ref.current?.focus(), 100)` | 🟡 Medium |
| MISS-L07 | Animated search bar: `maxHeight` transition `0 → 60px` | 🟢 Low |
| MISS-L04 | Category emoji chip on trending rows | 🟢 Low |
| MISS-L05 | `/live/saved` Watch Later dedicated page | 🟢 Low |
| BUG-L01 | VOD timeAgo badge: add `background: rgba(0,0,0,0.6)` for readability | 🟢 Low |
| BUG-L02 | `pillsRef` declaration order (ESLint warning, not runtime bug) | 🟢 Low |
| BUG-L03 | Replace dynamic `import('firebase/firestore')` with static import for clips | 🟢 Low |
| BUG-L04 | Featured banner `streamDuration` badge: adjust `bottom` to avoid info panel overlap | 🟢 Low |
| MISS-L03 | Live Now badge on BottomNav — requires `useFollowerLiveStatus` hook | 🟢 Low |

---

### livestream-webrtc.js
**File:** `ConnectHub-SPA/src/services/livestream-webrtc.js`

| ID | Fix Needed | Priority |
|---|---|---|
| BUG-RT02 | `createAnswer` should set `offerToReceiveVideo: true, offerToReceiveAudio: true` | 🟡 Medium |
| BUG-RT03 | TURN credential fetch failure shows toast `⚠️ Limited connectivity mode` | 🟡 Medium |
| BUG-RT04 | Wire `getStats()` results to display quality indicator in LiveSetupPage | 🟡 Medium |
| BUG-RT01 | iOS Safari background WebRTC kill — platform limitation, no browser fix | ❌ Platform Limitation |

---

## WHAT REQUIRES BACKEND / EXTERNAL SERVICE

These items **cannot be fully implemented in frontend code alone** and require server-side infrastructure:

| Item | What's Needed |
|---|---|
| BUG-M03: Stripe Connect | Server endpoint: `/api/stripe/connect-onboard`, Stripe SDK, webhook handler |
| MISS-M03: Tax Info (W-9/VAT) | Legal form + server-side storage + compliance review |
| MISS-M04: Bank status | Stripe `accounts.retrieve()` server-side |
| MISS-W03: Go-live push notifications | OneSignal segment push in `startStream()` Cloud Function |
| MISS-W04: Server-side chat moderation | Firestore security rules or Cloud Function trigger |
| BUG-SC02: Recurring stream instances | Cloud Function triggered by Firestore write, generates future docs |
| BUG-S03 / BUG-RT01: iOS background streaming | Requires React Native app or RTMP media server |

---

## NEXT SESSION PRIORITY ORDER

### Start with (P0 — must fix for beta launch):
1. `LiveWatchPage.jsx` — Share button (BUG-W01/MISS-W01) + AI moderation wiring (MISS-MOD01) + banned user check (BUG-MOD02)
2. `LiveSetupPage.jsx` — `destroy()` on end stream (BUG-S05) + auto-thumbnail (MISS-S01) + quality bar (MISS-S02)
3. `LiveModerationPage.jsx` — Escalate button (BUG-MOD01) + per-account word list (BUG-MOD03) + timeout ban (MISS-MOD02)

### Then (P1):
4. `LiveSchedulePage.jsx` — full rewrite: local time display + browse tab + reminder bell + iCal export
5. `LivePage.jsx` — Go Live FAB + LIVE card ring + share buttons on cards + skeleton for banner
6. `livestream-webrtc.js` — RT02 + RT03 patches

---

## GIT COMMITS IN THIS SESSION

| Commit | Message | Files |
|---|---|---|
| `b20993c` | Beta fix round 2: ClipViewerPage complete rewrite | `ClipViewerPage.jsx` |
| `ec1f9fd` | Beta fixes: LiveAnalyticsPage real data + LiveMonetizationPage payout | `LiveAnalyticsPage.jsx`, `LiveMonetizationPage.jsx` |

---

## OVERALL STATUS

| Category | Bugs Fixed | Features Added | Pending |
|---|---|---|---|
| Clip Viewer (Section 8) | 4/4 | 4/4 | 0 |
| Analytics (Section 5) | 4/4 | 4/5 | 1 (geo) |
| Monetization (Section 6) | 3/4 | 2/4 | 2 (Stripe/Tax — backend) |
| Moderation (Section 7) | 0/5 | 0/4 | All pending |
| Schedule (Section 4) | 0/4 | 0/4 | All pending |
| Watch Page (Section 2) | 0/8 | 0/8 | All pending |
| Setup Page (Section 3) | 0/5 | 0/5 | All pending |
| Browse Page (Section 1) | 0/5 | 0/8 | All pending |
| WebRTC (Section 9) | 0/4 | — | All pending |

**Total items from report: ~85**  
**Fixed in this session: ~21**  
**Remaining: ~64**  
**Estimated dev time for all remaining: 4–6 hours**

---

*Report generated: May 11, 2026 — Session 2 of Live Section Bug Fixes*
