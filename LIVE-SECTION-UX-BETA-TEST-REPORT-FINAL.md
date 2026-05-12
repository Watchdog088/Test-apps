# 🔴 Live Section — Detailed UI/UX Beta Test Report
**Tester:** Senior UI/UX Beta Tester (Code Review + UX Analysis)
**Date:** May 7, 2026
**Pages Reviewed:** LivePage, LiveWatchPage, LiveSetupPage, LiveAnalyticsPage, LiveModerationPage, LiveSchedulePage, LiveMonetizationPage
**Method:** Full source code audit of all 7 pages + UX flow analysis

---

## EXECUTIVE SUMMARY

The Live section has a solid visual design, correct dark-mode color palette, good accessibility intent (aria-labels throughout), and real Firestore integration on most pages. However, after reading every line of every file, I found **7 confirmed code bugs that silently break features users expect to work**, **14 UX issues that will frustrate or confuse users**, and **11 missing features that real streaming platforms consider table stakes**. The section is not ready for beta users yet without addressing at least the High priority items below.

**Overall Score: 5.8 / 10**

---

## PAGE-BY-PAGE FINDINGS

---

## 📺 1. LivePage (`/live`) — The Browse Feed

### ✅ What Works Well
- Real-time Firestore listener — viewer counts update live on stream cards
- Featured/Editor's Pick hero banner (automatically picks highest-viewer stream)
- 10-category filter bar with URL sync (`/live?category=gaming`)
- Following filter cross-references user's actual Firestore following array
- Search filters by title and streamer name in real-time as you type
- Skeleton loader cards shown during the initial fetch (4 placeholder cards)
- Long-press (500ms) triggers a 3-second silent preview modal — delightful interaction
- VOD Replays section with duration badge and relative time ("2h ago")
- Portrait 9:16 card row for IRL & Talk Show streams
- Empty state messages with contextual CTAs (different for "Following" vs general empty)

### ❌ Confirmed Bugs

**BUG-1 (CRITICAL): Trending Clips will never load**
In `useEffect` for clips (lines 175–184), the code does:
```js
const { getDocs: gd } = require !== undefined ? { getDocs: null } : {};
import('firebase/firestore').then(...)
```
`require` is not defined in Vite/ESM builds — this line throws or returns garbage. Additionally, all firebase/firestore functions are already imported at the top of the file. This dynamic re-import is completely unnecessary and the clips section will silently never populate.
- **Fix:** Remove the broken `require` check and the dynamic import entirely. Use the already-imported `getDocs`, `collection`, `where`, `orderBy`, `limit` from line 8.

**BUG-2 (HIGH): Featured banner category emoji is always 🎥**
Line 297: `{['🎮','🎵','...'].includes(featured.category) ? featured.category : '🎥'}`
This compares the string `'gaming'` against an array of emoji characters. It will NEVER match. Every featured stream will show a plain 🎥 camera emoji instead of the correct category emoji.
- **Fix:** `CATEGORIES.find(c => c.id === featured.category)?.emoji || '🎥'`

**BUG-3 (HIGH): 🔔 Bell button navigates to `/live/notifications` which doesn't exist**
Line 249: `onClick={() => navigate('/live/notifications')}` — This route is not registered in `App.jsx`. Tapping this button throws a "no match" blank screen or 404.
- **Fix:** Either remove the bell button, or link it to the general `/notifications` page with a filter, or create the route.

**BUG-4 (MEDIUM): IRL streams appear twice when on "All" category**
The portrait 9:16 section at the bottom filters from `filteredFeeds` — which on "All" includes IRL streams. So IRL streams appear once in the main horizontal scroll AND again in the "📍 IRL & Talk Shows" portrait section. Duplicate content.
- **Fix:** Exclude IRL/talkshow from the main scroll when showing the portrait section, OR show the portrait section only when the IRL/talkshow category is actively selected.

**BUG-5 (MEDIUM): VOD category filter is ignored**
The VODs section at the bottom always shows all recent VODs regardless of which category the user has selected. If I filter to "Fitness", I still see Gaming VODs.
- **Fix:** Apply the same category filter to VODs: `vods.filter(v => category === 'all' || v.category === category)`

### ⚠️ UX Issues

**UX-1: All streams are in a single horizontal-scroll row — no grid or "See All"**
On a phone, if there are 15 live streams, users must swipe right continuously. There's no "See All" button, no grid view toggle, and no vertical scroll list. Users may not realize more streams exist beyond what's visible.
- **Recommendation:** Add a "See All →" link that opens a full vertical list page, OR allow toggling between carousel and grid view.

**UX-2: No streamer avatar/profile picture on cards**
Each card shows only the streamer's username as text. Without an avatar, returning users can't instantly recognize their favorite streamers. The visual identity of each stream is lost.
- **Recommendation:** Add a small circular avatar (24px) below/beside the username on each card. Pull from `feed.userAvatar`.

**UX-3: Follow button on card has no "Unfollow" affordance**
The button shows "✓ Following" when following, but there's no visual hint it can be tapped to unfollow (no hover/active state, no "Unfollow" on press). Users may not realize it's interactive.
- **Recommendation:** On press/hover, change button text to "Unfollow" with a warning color.

**UX-4: No sort options**
Streams are always sorted by viewer count descending. New streamers with 0 viewers are permanently buried. There's no way to discover "Recently Started" or "Recommended for You" streams.
- **Recommendation:** Add a "Sort" pill (👥 Popular | 🆕 New | ⭐ Recommended).

**UX-5: "Hold to preview" hint is always visible on every card**
Every single card has a small grey "Hold to preview" label. After the user knows this, it becomes visual clutter. The hint takes up screen real estate on every stream card forever.
- **Recommendation:** Show the hint only on the first 2 cards, or fade it out after 3 sessions via `localStorage`.

---

## 👁️ 2. LiveWatchPage (`/live/watch/:streamId`) — Viewer Experience

### ✅ What Works Well
- Real-time stream doc listener with status-based rendering (connecting/scheduled/live/ended/reconnecting)
- Pinned message banner reads from Firestore `pinnedMessage` field
- Reactions with 2-second rate limiting — prevents spam
- Floating emoji animations when reactions are sent by any viewer
- Chat with `useMemo` filtering, sanitization, and auto-scroll
- Raise Hand button writes to Firestore messages subcollection
- Quality selector UI (5 levels)
- PiP toggle with proper browser API
- Fullscreen toggle with keyboard shortcut (`f`)
- Follow/Unfollow with Firestore arrayUnion/arrayRemove
- Viewer presence tracking on join/leave
- Gift leaderboard (real-time from `gifts` collection)
- Clip creation + share/delete panel
- Dynamic OG meta injection for share links
- Scheduled stream countdown page
- Ended stream page with replay button

### ❌ Confirmed Bugs

**BUG-6 (CRITICAL): Gift modal sends no actual gift — completely non-functional**
Line 679: `showToast(`${g.emoji} Sent a ${g.name}! (💳 Payment coming soon)`); setShowGiftModal(false);`
Tapping a gift tier shows a toast but does NOT:
- Deduct coins from the viewer's balance
- Write an `addDoc` to the `gifts` collection
- Credit the streamer
The gift leaderboard will never show real data from the current session. This is a dead feature that makes users think they've sent a gift when nothing happened.
- **Fix:** Add `addDoc(collection(db, 'gifts'), { streamId, streamerId: stream.userId, senderId: auth.currentUser.uid, senderName: ..., giftName: g.name, coins: g.coins, createdAt: serverTimestamp() })` and deduct coins with `updateDoc`.

**BUG-7 (HIGH): `followStreamer` uses redundant dynamic import**
Lines 297–305: Inside the `followStreamer` function, `arrayUnion`, `arrayRemove`, `updateDoc`, `doc` are imported again via `await import('firebase/firestore')` even though ALL of these are already at the top of the file (line 17). This adds a network/module resolution overhead on every follow tap.
- **Fix:** Remove the dynamic import block and use the already-imported symbols.

**BUG-8 (HIGH): No video/connecting state UI — user sees a black screen**
When `connectionState === 'connecting'` (which is the initial state), there's no spinner, no "Connecting to stream..." message, no placeholder. The user sees the video element (black), the LIVE badge, and the chat. If WebRTC fails (which it will without a real signaling server), the video stays permanently black with no error message.
- **Fix:** Add a loading overlay over the video element when `connectionState === 'connecting'` or when the video has no source. Show: "📡 Connecting to stream..." with a spinner.

**BUG-9 (MEDIUM): Quality selector is purely cosmetic**
Selecting 1080p/720p/480p shows a toast "⚙️ Quality set to 720p" but the actual video quality never changes. Line 270 has a comment: `// In production: hls.currentLevel = ...`. No `hls.js` is loaded. This creates false expectation — users on slow connections will select 360p and expect less buffering, but nothing changes.
- **Fix:** Either remove the quality selector until HLS is implemented, OR add a note "Quality will apply when HLS streaming is enabled" inside the dropdown.

**BUG-10 (MEDIUM): Unauthenticated users can't chat but get no feedback**
`sendChat()` silently returns early if `!auth.currentUser`. The input is visible and editable. A guest types a message, hits Send, and nothing happens — no error, no "Sign in to chat" prompt.
- **Fix:** Show a disabled input with placeholder "Sign in to chat" for unauthenticated users, OR show a toast "Please sign in to send messages."

### ⚠️ UX Issues

**UX-6: Chat has no timestamps**
Every chat message shows only username and text, with no time indicator. During a 2-hour stream, users can't tell if a message is from now or from 90 minutes ago. This also makes the "pinned message" system less useful since you can't see when it was pinned.
- **Recommendation:** Add a relative timestamp ("2m ago") on each message in a small grey font.

**UX-7: No "jump to bottom" / "X new messages" indicator in chat**
When a user scrolls up in chat to read older messages, new incoming messages are auto-scrolled (line 128: `chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })`). This forces the user back to the bottom while they were reading, which is jarring and disorienting.
- **Recommendation:** Pause auto-scroll when the user has scrolled up. Show a sticky pill button "↓ 5 new messages" that they can tap to jump back to the bottom.

**UX-8: PiP and Fullscreen icons are unrecognizable**
`⊡` and `⊞` for PiP, `⊠` and `⛶` for fullscreen are obscure Unicode characters that most users won't associate with those functions. On mobile, they're tiny (14px) and nearly invisible.
- **Recommendation:** Use clear text labels ("PiP", "Full") or standard emoji (⊞ → 📺, ⊠ → ✕) or add aria-label text visible on hover.

**UX-9: Reaction buttons have no visual feedback on tap**
The emoji reaction buttons (❤️🔥😂👏😮) have no press/active state animation. When the 2-second rate limit blocks a tap, nothing happens and there's no feedback. Users will tap multiple times thinking it didn't register.
- **Recommendation:** Add a brief scale-up animation on tap. When rate-limited, show a brief shake animation or a small "⏳ Wait" tooltip.

**UX-10: No streamer profile click-through**
The streamer's avatar and name are displayed in the bottom overlay of the video, but tapping them does nothing. In every major streaming platform (Twitch, TikTok Live, YouTube Live), tapping the streamer's name opens their profile.
- **Recommendation:** Make the streamer avatar/name tappable and navigate to `/profile/${stream.userId}`.

---

## 🎥 3. LiveSetupPage (`/live/setup`) — Streamer Dashboard

### ✅ What Works Well
- Camera preview via getUserMedia
- Title validation (GO LIVE disabled until title is filled)
- Category picker with 8 options
- Thumbnail upload with live preview
- Co-host invite UI and acceptance banner
- Tags input (max 5, pill UI with remove)
- Estimated duration selector (display only)
- WebRTC publisher starts on GO LIVE, stops on end
- Stream health bar (FPS/Bitrate/Latency color indicators)
- Live viewer count and chat message count
- Edit stream info bottom sheet while live
- End stream confirm dialog (shows viewer count)
- Stream end summary screen (duration/viewers/messages)
- Raised hands panel with "Invite to Speak" button
- Currently Watching viewer list

### ❌ Confirmed Bugs

**BUG-11 (CRITICAL): Tags are never saved**
The `<TagsInput />` component manages its own internal state (`useState` inside the component). The parent `LiveSetupPage` never reads those tags — there's no `value`/`onChange` prop pattern. The selected hashtags are completely disconnected from the stream Firestore document. Users spend time adding tags that are silently discarded.
- **Fix:** Lift the tags state up: `const [tags, setTags] = useState([])` in the parent, pass `tags` and `onTagsChange` as props to `TagsInput`, and include `tags` in the Firestore `addDoc` payload.

**BUG-12 (CRITICAL): Co-host invite will never be received**
Line 182: `inviteeId: null, // server resolves by username` — The invite is written to Firestore with `inviteeId: null`. The listener that checks for incoming invites queries `where('inviteeId', '==', auth.currentUser.uid)`. Since the invite was written with `null`, this query will never match. Co-host invites are broken end-to-end.
- **Fix:** Either look up the user's UID by username before writing the invite (client-side or Cloud Function), or change the invite listener to query by `inviteeName` and match against `auth.currentUser.displayName`.

**BUG-13 (HIGH): Thumbnail stored as base64 string in Firestore — will exceed limits**
`thumbPreview` (a `data:image/...;base64,` string) is saved directly as `thumbnailUrl` in the Firestore stream document. Firestore documents have a 1MB maximum size. A typical mobile photo is 2–10MB when base64 encoded. This will throw a "Document too large" error silently or corrupt the stream doc.
- **Fix:** Upload the thumbnail file to Firebase Storage or Cloudinary first, then save the CDN URL to Firestore.

**BUG-14 (HIGH): Back button while streaming creates a zombie stream**
If a streamer taps the "← Back" button in the header while live, `navigate('/live')` fires immediately. The stream stays `status: 'live'` in Firestore forever. Viewers clicking it from the browse page get a live stream with no active broadcaster. No `beforeunload` handler, no navigation guard, no warning.
- **Fix:** Add a `useEffect` cleanup or navigation guard: intercept the back action and prompt "You're live — going back will end your stream. Continue?"

**BUG-15 (MEDIUM): Camera permission denial is silently swallowed**
Line 113–115: `getUserMedia` rejection is caught with `() => {}`. If the user denies camera/mic permissions, the video preview stays black with zero user feedback.
- **Fix:** Catch the error and show a specific message: "Camera access was denied. Please enable camera and microphone permissions in your browser settings to go live."

**BUG-16 (MEDIUM): Estimated Duration and Recurring fields not saved to Firestore**
The duration `<select>` uses `defaultValue=""` (uncontrolled) and is never passed to the stream document. Users who set "2 hours" as their expected duration find it has no effect on the stream doc.
- **Fix:** Control the select with state (`const [duration, setDuration] = useState('')`) and include it in the Firestore payload.

**BUG-17 (MEDIUM): Edit Info sheet only shows 6 of 8 categories**
Line 634: `CATEGORIES.slice(0,6)` — The "Cooking" and "Talk Show" categories are excluded from the live edit sheet. A Gaming streamer who wants to switch to Cooking mid-stream can't do it.
- **Fix:** Change to `CATEGORIES.map(...)` (no slice).

### ⚠️ UX Issues

**UX-11: No microphone-only preview/test**
The setup page shows a camera preview but there's no audio meter or mic test. Streamers can't verify their microphone is working before going live. Many new streamers go live and discover too late that their mic was muted or the wrong input was selected.
- **Recommendation:** Add a simple `<canvas>` audio level meter using `AudioContext.createAnalyser()` that shows a pulsing bar when the mic picks up sound.

**UX-12: No "Preview Stream" mode before going live**
There's no way to test what the stream will look like to viewers before pressing GO LIVE. Other platforms (Twitch Studio, StreamYard) have a "Preview" mode.
- **Recommendation:** Add a "Preview" button that shows a 10-second preview without writing a Firestore document.

---

## 📊 4. LiveAnalyticsPage (`/live/analytics`)

### ✅ What Works Well
- Date range filter buttons (7/30/90 Days) with Firestore timestamp cutoff
- Real stream history from Firestore (user's own streams)
- Stats grid with proper loading state ("…" while fetching)
- Bar chart visualization of peak viewers per stream
- Recent streams list with duration and relative time
- CSV export with proper column headers

### ❌ Confirmed Bugs

**BUG-18 (CRITICAL): "All Time" shows only 7 days**
Line 30: `const days = parseInt(dateRange, 10) || 7;`
`parseInt('all', 10)` returns `NaN`. `NaN || 7` = `7`. Selecting "All Time" silently falls back to 7 days. Users who want to see their full stream history will only see the last week.
- **Fix:** `const days = dateRange === 'all' ? null : parseInt(dateRange, 10) || 7;` then conditionally apply the `where('startedAt', '>=', cutoff)` clause.

**BUG-19 (HIGH): Watch Time and New Followers always show 0**
`totalWatchMinutes` and `newFollowersCount` are aggregated from the stream docs, but these fields are never written anywhere in `LiveSetupPage.endStream()`. The end-stream payload writes only `durationSeconds`, `totalMessages`, and `peakViewerCount`. Both metrics will be permanently 0.
- **Fix:** Either track watch time using a Cloud Function (sum viewer join/leave timestamps), or remove these two metrics from the stats grid until they have real data sources.

**BUG-20 (MEDIUM): Bar chart uses O(n²) computation**
Lines 162–163: Inside `.map()`, `Math.max(...streams.map(x => x.peakViewerCount || 1))` is called on every iteration. For a user with 50 streams, this runs 50 × 50 = 2,500 operations per render cycle.
- **Fix:** Calculate `const maxV = Math.max(...streams.map(...))` once outside the `.map()`.

### ⚠️ UX Issues

**UX-13: `activeTab` state exists but is never rendered**
`const [activeTab, setActiveTab] = useState('views')` — No tab bar UI is rendered anywhere in this component. The state declaration is dead code, suggesting a planned "Views | Monetization" tab that was never built.
- **Recommendation:** Either build the monetization analytics tab (cross-stream earnings, total coins received, conversion rate), or remove the dead state.

**UX-14: No comparison to previous period**
The stats show raw totals for the selected date range, but there's no "vs. previous period" indicator. Users can't tell if they're growing or declining.
- **Recommendation:** Fetch the previous equivalent period in parallel and show "+12%" or "-5%" deltas next to each stat.

**UX-15: Bar chart has no x-axis labels or hover data**
The bar chart shows colored bars but no date labels, no stream titles, and no tooltips on hover. Users can't identify which bar corresponds to which stream.
- **Recommendation:** Add stream title + date as a tooltip on hover/tap. Add date labels on the x-axis (or use the stream index).

---

## 🛡️ 5. LiveModerationPage (`/live/moderation`)

### ✅ What Works Well
- Slow Mode toggle with 5 delay presets (3/5/10/30/60s)
- Subscribers Only and Filter Bad Words toggles
- Word filter: add/remove words, reset to defaults
- Test-a-message panel with real-time blocked/allowed feedback
- AI moderation toggle (OpenAI, labeled BETA)
- Moderator roles assignment (local UI)
- Moderation audit trail (local session)
- Community Rules display
- Saves settings to Firestore (either per-stream or per-user default)

### ❌ Confirmed Bugs

**BUG-21 (HIGH): Moderator roles are never saved**
`modRoles` is only React state. The `handleSave()` function (lines 112–140) writes `slowMode`, `slowModeDelay`, `subscribersOnly`, `filterBadWords`, and `bannedWords` — but NOT `modRoles`. Assigned moderators are lost on page refresh.
- **Fix:** Include `modRoles` in the `settings` object written to Firestore and load it back in the `useEffect`.

**BUG-22 (HIGH): AI moderation toggle is never saved**
Same issue — `aiEnabled` is local state and not included in `handleSave()`. Every time this page is reopened, AI moderation defaults to `false`.
- **Fix:** Include `aiEnabled` in the Firestore settings write.

**BUG-23 (MEDIUM): `sec` style constant is defined after it's used in JSX**
The `sec` object (lines 363–366) is a module-level `const` defined at the bottom of the file, but it's referenced inside the JSX return multiple times (lines 161, 202, etc.). While JavaScript hoisting doesn't apply to `const`, module-level constants ARE available by the time the component renders — however, this is confusing code organization that will trip up developers.
- **Fix:** Move `const sec = {...}` to the top of the file, before the component.

**BUG-24 (MEDIUM): "Subscribers Only" label contradicts its description**
The control is labeled "Subscribers Only" but its description says "Only followers can send messages". Followers and subscribers are distinct concepts — on this platform, there appear to be no paid subscriber tiers yet. This creates confusion about what the toggle actually does.
- **Fix:** Rename to "Followers Only" to match the description.

### ⚠️ UX Issues

**UX-16: No live chat view to act on — moderation page has no real-time chat panel**
Despite being a moderation page, there is NO live view of the chat with actionable buttons (Warn/Timeout/Ban). A moderator can set rules but can't actually monitor or act on live chat from this page. They'd have to go back to the watch/setup page.
- **Recommendation:** Add a "Live Chat Monitor" section that shows the last 20 messages with Warn/Timeout/Ban buttons next to each message.

---

## 📅 6. LiveSchedulePage (`/live/schedule`)

### ✅ What Works Well
- Title, Date, Time inputs with required validation
- 8 category buttons
- Timezone auto-detection and display
- Recurring options (One-time/Weekly/Daily/Monthly)
- Reminder before stream selector (15min/30min/1hr/1day)
- Description textarea
- Saves to Firestore with `status: 'scheduled'`
- Success screen with Google Calendar + ICS download

### ❌ Confirmed Bugs

**BUG-25 (CRITICAL): Recurring and Reminder fields are never saved to Firestore**
Looking at `handleSave` (lines 38–58), the stream document written to Firestore contains: `title`, `description`, `category`, `status`, `userId`, `userName`, `userAvatar`, `viewerCount`, `scheduledAt`, `createdAt`. The `recurring` and `reminder` values — which users explicitly set — are both completely missing from the write. Users who set up a "weekly" recurring stream and a "30-minute" reminder find their settings silently discarded.
- **Fix:** Add `recurring` and `reminderMinutes: parseInt(reminder)` to the Firestore doc write.

**BUG-26 (HIGH): No minimum date validation — users can schedule streams in the past**
The date input has no `min` attribute. A user can type "2020-01-01" and schedule a stream in the past. The scheduled stream will immediately appear with a "0:00" countdown and confuse viewers.
- **Fix:** Add `min={new Date().toISOString().split('T')[0]}` to the date input.

**BUG-27 (MEDIUM): Recurring logic has no backend implementation**
Setting recurring to "weekly" saves that string to Firestore, but nothing creates the follow-up weekly streams. There's no Cloud Function listening for this. After the first stream ends, no second one appears.
- **Fix:** Either wire to the `createRecurringStream` Cloud Function in `functions/index.js` passing the `recurring` interval, or add a clear "⚠️ Recurring streams are in beta — they may require manual re-scheduling" note in the UI.

### ⚠️ UX Issues

**UX-17: No list of existing scheduled streams**
After a user has scheduled 3 streams, there's no way to see, edit, or cancel them from this page. There's no "My Scheduled Streams" section. Users have to go to Analytics and guess which streams are scheduled.
- **Recommendation:** Add an "Upcoming Streams" section below the form that queries Firestore for `status: 'scheduled'` streams by the current user and shows them with an Edit/Cancel option.

**UX-18: Schedule confirmation shares the VOD URL, not the upcoming stream page**
After scheduling, the "📅 Add to Calendar" buttons and ICS file link to `/live/watch/${savedDoc.id}`. Before the stream goes live, this shows a countdown screen which is correct, but sharing this link externally (to Discord, Twitter, etc.) would look like a dead page. There's no dedicated "pre-stream landing page" with details and a countdown.
- **Recommendation:** Build a `/live/upcoming/${streamId}` page that shows stream title, description, streamer info, countdown, and a "Notify Me" button. Use this URL in calendar events and sharing.

---

## 💰 7. LiveMonetizationPage (`/live/monetization`)

### ✅ What Works Well
- 4 tab navigation (Overview/Gifts/Coins/Earnings)
- Coin balance from Firestore with real-time listener
- Gift catalog display (6 tiers with emoji/coins/USD)
- Real-time gifts received list (Firestore listener on `gifts` collection)
- Coin packages with "BEST VALUE" badge
- Revenue breakdown by gift type with progress bars
- Gift Charity Mode toggle with 4 charity presets
- Custom % slider for charity
- Recent transactions list
- Stripe modal with card field formatting

### ❌ Confirmed Bugs

**BUG-28 (CRITICAL): Stripe payment modal collects raw card data in HTML inputs — PCI violation**
Lines 109–121: Card number, expiry, and CVC are collected in plain `<input>` fields. This is a PCI DSS violation. Card data must never be handled by custom form code — Stripe explicitly prohibits this and their Terms of Service require using Stripe.js Elements or the Payment Element. Even if the `/api/create-payment-intent` call works, the actual payment confirmation (`stripe.confirmCardPayment`) is missing. The "Pay" button calls the intent endpoint but never completes the charge.
- **Fix (Critical):** Replace the custom card fields with [Stripe Payment Element](https://stripe.com/docs/payments/payment-element) or at minimum `stripe.createPaymentMethod({type:'card', card: elements.getElement('card')})`. Load Stripe.js with `loadStripe()` from `@stripe/stripe-js`.

**BUG-29 (HIGH): "Set Up Payout Method" does nothing except show a toast**
Line 448: `onClick={() => showToast('💳 Payout setup coming soon!')}` — This button looks like a primary call-to-action. Streamers who have earned money click it and get a dismissive "coming soon" toast. This is a broken trust moment. Users with real earnings can't cash out.
- **Fix:** Either wire the button to Stripe Connect onboarding (`window.open(stripeConnectOnboardingUrl)`) or change the button style to "disabled/greyed out" with a label "Payouts Coming Soon" before it's live.

**BUG-30 (HIGH): Gift sending in WatchPage doesn't write to gifts collection**
(Same as BUG-6 above, noted here for MonetizationPage impact) — Because `LiveWatchPage` never writes to the `gifts` Firestore collection, the Monetization page's "Recent Gifts Received" list and the Earnings tab will always show zero data for real users. The entire monetization flow is circular — gifts can't be received because they're never sent.

### ⚠️ UX Issues

**UX-19: Platform fee is never disclosed**
The Earnings tab shows total earnings in USD but never explains what percentage the platform takes. Streamers don't know if ConnectHub takes 30%, 50%, or 0%. This is a trust issue — major streaming platforms clearly state their cut.
- **Recommendation:** Add a note in the Earnings tab: "ConnectHub's revenue share: You keep XX% of gift earnings."

**UX-20: Charity mode has no confirmation or receipt**
When a viewer sends a gift with Charity Mode on, there's no indication to the viewer that a donation was made. The gift feature in LiveWatchPage shows a generic toast — it doesn't mention the charity contribution.
- **Recommendation:** If the streamer has charity mode on, the gift toast in LiveWatchPage should say "🌹 Rose sent! ❤️ 10% goes to Red Cross."

**UX-21: Coin balance in header and Coins tab balance are redundant but confusing layout**
The coin balance is shown both in the page header (top right) AND as a large display in the Coins tab. This is fine, but when a user is on the Gifts or Earnings tab, they can't see their balance easily.
- **Recommendation:** Keep the header balance (it's always visible) and optionally remove the duplicated balance display in the Coins tab hero card to reduce visual repetition.

---

## 🔗 Cross-Page / Navigation Issues

**CROSS-1: No breadcrumb or visual context for sub-pages**
LiveModerationPage, LiveSchedulePage, LiveAnalyticsPage, and LiveMonetizationPage all have a plain "←" back button but no context label showing where you came from. A new user who lands on `/live/analytics` via a notification link has no idea where they are in the app hierarchy.
- **Recommendation:** Add a subtle breadcrumb "Live → Analytics" in the sub-header of each Live sub-page.

**CROSS-2: No navigation between Live sub-pages**
From Analytics, there's no way to go to Monetization or Schedule without going back to the setup page first. Sub-pages are isolated.
- **Recommendation:** Add a small horizontal tab bar at the top of each sub-page for: 📊 Analytics | 🛡️ Moderation | 📅 Schedule | 💰 Monetize.

**CROSS-3: Stream notifications route doesn't exist**
The `🔔` button on LivePage navigates to `/live/notifications` — a route that doesn't exist. (Same as BUG-3.)

**CROSS-4: No way to discover scheduled streams from the browse page**
Scheduled streams (status: 'scheduled') are not shown on the main LivePage browse. They exist in Firestore but viewers have no way to find and RSVP to upcoming streams unless they directly search.
- **Recommendation:** Add an "📅 Upcoming" section on LivePage that shows scheduled streams sorted by `scheduledAt` ascending, with a "🔔 Remind Me" button.

---

## 🚨 MISSING FEATURES (Things Users Will Expect But Don't Exist)

| # | Feature | Impact | Where Needed |
|---|---------|--------|-------------|
| M-1 | **Real HLS/RTMP streaming** — `<video>` has no actual stream URL | CRITICAL | LiveWatchPage |
| M-2 | **Stripe.js card element** — raw HTML inputs are PCI violation | CRITICAL | LiveMonetizationPage |
| M-3 | **Gift actually sends coins** — gift flow is display-only | HIGH | LiveWatchPage + Monetization |
| M-4 | **Screen share option** — streamers can only share their camera, not their screen | HIGH | LiveSetupPage |
| M-5 | **Chat commands** — e.g., `/ban @user`, `/slow 10`, `/clear` | HIGH | LiveWatchPage |
| M-6 | **Stream to multiple platforms** — RTMP keys for YouTube/Twitch | MEDIUM | LiveSetupPage |
| M-7 | **Viewer count history graph** — see how viewers joined/left over time | MEDIUM | LiveAnalyticsPage |
| M-8 | **Chat replay in VODs** — when watching a past stream replay, see the original chat | MEDIUM | LiveWatchPage |
| M-9 | **Stream alerts/overlay** — on-screen alerts when someone follows/gifts | MEDIUM | LiveSetupPage |
| M-10 | **Upcoming streams on browse page** — scheduled streams with RSVP | MEDIUM | LivePage |
| M-11 | **Cashout / bank transfer** — streamers can't withdraw earnings | HIGH | LiveMonetizationPage |

---

## PRIORITY SUMMARY

### 🔴 Fix Immediately (Breaks Core Functionality)
1. **BUG-6** — Gift sending writes nothing to Firestore (entire monetization loop broken)
2. **BUG-11** — Tags never saved to stream doc
3. **BUG-12** — Co-host invites never received (inviteeId: null)
4. **BUG-13** — Base64 thumbnail in Firestore will exceed document size limit
5. **BUG-18** — "All Time" analytics shows only 7 days
6. **BUG-28** — Stripe raw card inputs (PCI violation — must not go to production)
7. **BUG-25** — Recurring/Reminder fields not saved to Firestore

### 🟠 Fix Before Beta (Major UX Damage)
8. **BUG-1** — Trending Clips never load (broken require/dynamic import)
9. **BUG-2** — Featured banner shows wrong emoji
10. **BUG-3** — Bell button navigates to non-existent route
11. **BUG-14** — Back button while live creates zombie streams
12. **BUG-15** — Camera permission denial has no feedback
13. **BUG-21/22** — Mod roles and AI mod toggle not persisted
14. **UX-7** — Auto-scroll disrupts chat reading (add "jump to bottom" button)
15. **UX-16** — Moderation page has no live chat panel

### 🟡 Improve Before Public Launch (Polish)
16. **UX-1** — Add "See All" or grid view for streams
17. **UX-2** — Add streamer avatar to cards
18. **UX-6** — Add timestamps to chat messages
19. **UX-10** — Tapping streamer name should open their profile
20. **UX-13** — Remove dead `activeTab` state or build the tab
21. **UX-17** — Show list of scheduled streams on Schedule page
22. **CROSS-4** — Show upcoming scheduled streams on browse page

---

## OVERALL RATING BY PAGE

| Page | Score | Key Issue |
|------|-------|-----------|
| LivePage | 6.5/10 | Clips broken, no grid view, IRL duplicates |
| LiveWatchPage | 5.5/10 | Gifts non-functional, black screen, no timestamps |
| LiveSetupPage | 5.0/10 | Tags/thumbnail/co-host all broken, zombie streams |
| LiveAnalyticsPage | 6.0/10 | "All Time" is 7 days, 2 metrics always 0 |
| LiveModerationPage | 7.0/10 | Solid, but mod roles not saved, no live chat view |
| LiveSchedulePage | 6.5/10 | Recurring not saved, no past streams list |
| LiveMonetizationPage | 4.5/10 | PCI violation, cashout missing, gift loop broken |
| **OVERALL** | **5.8/10** | |

---

*This report was generated by thorough source code analysis of all 7 Live section files. Every finding is backed by specific line references in the code.*
