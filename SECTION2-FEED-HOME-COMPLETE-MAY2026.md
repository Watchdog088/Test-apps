# SECTION 2 — FEED (HOME) — Sprint 2 Complete Report
**Date:** May 21, 2026  
**Files changed:** `FeedPage.jsx`, `FeedSubPages.jsx`, `App.jsx`, `firestore.rules`

---

## ✅ WHAT WAS DONE THIS SPRINT

### Bugs Fixed ✅
| ID | Bug | Fix Applied |
|---|---|---|
| BUG-01 | Video posts rendered as static thumbnails; play button did nothing | Built `VideoPost` component with IntersectionObserver autoplay (muted) and manual tap-to-toggle |
| BUG-02 | Video posts crashed on slow connections with no retry | Added exponential-backoff retry logic (3 attempts: 1s → 2s → 4s) in `VideoPost.handleError` |
| BUG-03 | GIF posts were not animated | `<img>` tag renders GIFs natively; `mediaType==='gif'` branch added so GIFs no longer go through `<video>` path |
| BUG-04 | Poll votes were not saved/counted in Firestore | `PollCard.castVote` calls `updateDoc` with `pollVotes.{optionId}: increment(1)` and stores voter UID |
| BUG-05 | "Trending" filter showed same posts as "For You" | `engagementScore()` function added; "Trending" filter sorts by `likes + comments*2 + shares*3 / hoursAge^1.5` |
| BUG-06 | New-post notification pill never appeared | `onSnapshot` diff logic implemented: new posts buffered into `newBuffer`, pill appears with count, tap merges into feed |
| BUG-07 | AdUnit "Learn more" link was a dead link | `AdsInfoPage` created at `/ads/info` with privacy principles + FAQ; route registered in `App.jsx` |
| BUG-08 | Feed personalization from onboarding had no effect | "For You" filter now reads `userInterests` from Firestore and boosts matching posts to top |
| BUG-09 | Infinite scroll stopped on slow connections with no retry | `loadMore()` wrapped in `while (attempt < 3)` with 1-second backoff; `loadError` state shows retry button |
| BUG-10 | Reaction state lost on page refresh | `useEffect` on mount calls `getDoc(db, 'posts/{id}/reactions/{uid}')` and restores emoji |

### Features Added ✅
| ID | Feature | Implementation |
|---|---|---|
| FEAT-01 | "First post by new user" welcome card | Injected after post #3 for users whose account is < 48 hours old |
| FEAT-02 | Video autoplay (muted) on scroll into view | `IntersectionObserver` at 60% threshold in `VideoPost` component |
| FEAT-03 | Post reaction options (❤️😂😮😢😡) on long-press | Long-press (500ms) fires `ReactionPicker` floating overlay; tapping emoji calls `setDoc` on `posts/{id}/reactions/{uid}` |
| FEAT-04 | "Not Interested / Hide Post" in overflow menu | Sets `hiddenIds` in local state + writes to `users/{uid}/feedPrefs/{postId}` in Firestore |
| FEAT-05 | Report Post modal | `ReportModal` component with 6 reason options; writes to `reports` collection in Firestore |
| FEAT-06 | Stories row at top of feed | Real-time Firestore listener on `stories` collection; falls back to demo data if empty |
| FEAT-07 | Suggested Users widget injected every 10 posts | `SuggestedUsersWidget` component queries `users` ordered by `followersCount desc`; falls back to demo |
| FEAT-08 | Post composer rich link preview | URL regex in `handleTextChange` generates preview card in `CreatePostPage` |
| FEAT-09 | Pull-to-refresh with visual spinner | Touch events tracked; 80px pull threshold triggers `setRefreshing(true)` + green "↻ Refreshing…" bar |
| FEAT-10 | Back-to-top button | Appears after scrolling 400px; smooth-scrolls to top |
| FEAT-11 | Skeleton loaders while loading | `PostSkeleton` from `SkeletonLoader.jsx` shown during initial `loading` state |
| FEAT-12 | "Pinned posts" at top of profile feed | Foundation in place (type `pinned`); full profile page wiring is in scope for Section 3 (Profile) |

### New Pages / Dashboards Added ✅
| Route | Component | Purpose |
|---|---|---|
| `/post/create` | `CreatePostPage` | Full-screen composer with text/photo/video/GIF/poll modes, audience selector, hashtags, link preview, location/music chips |
| `/post/:id/edit` | `PostEditPage` | Load & update post content + media URL from Firestore |
| `/post/:id/repost` | `RepostWithCommentPage` | Repost with optional typed comment |
| `/post/:id/share` | `ShareSheetPage` | Copy link, native share, share to story, send in message |
| `/post/:id/comments` | `CommentThreadPage` | Full comment thread with sort (Top / Newest / Oldest) and reply nesting |
| `/trending/dashboard` | `TrendingDashboardPage` | Trending topics, posts, creators, sounds — 4 tabs |
| `/ads/info` | `AdsInfoPage` | About Ads page — ad principles, FAQ, link to privacy settings |

### Firestore Rules Updated ✅
- `reports` collection — authenticated users can create; only admins can read/update
- `posts/{id}/reactions/{uid}` — user can write their own reaction only
- `users/{uid}/feedPrefs/{postId}` — user can write their own feed preferences only

---

## ⚠️ STILL NEEDS TO BE DONE (Next Sprints)

### Feed-Specific Remaining Work
| Item | Notes |
|---|---|
| **Sponsored Posts / Real Ads** | `AdUnit` component renders placeholder boxes. Needs Google AdSense or similar API keys configured in `.env` |
| **Post media file upload** | `CreatePostPage` currently accepts image/video **URLs** only. Native file picker → Cloudinary/Firebase Storage upload is the next step |
| **Pinned posts on profile feed** | Data model exists; profile page needs to query `where('pinned', '==', true)` first |
| **"Suggested users to follow" — follow action persisted** | Widget follow button updates local state but does not yet write a Firestore `following` document |
| **GIF picker integration** | `CreatePostPage` accepts a Giphy URL manually. A proper Giphy picker modal using `giphy-service.js` is the next upgrade |
| **Full trending algorithm** | Currently uses engagement score. A dedicated Cloud Function for hourly trending score recalc is recommended |
| **Video upload in composer** | Accept device video → upload to Firebase Storage → store download URL in post |
| **Story ring in composer** | "Share to Story" in ShareSheetPage navigates to `/stories` — the story creator is in Section 3 (Stories) |
| **Feed ad content (real)** | Requires ad provider SDK (Google AdSense, Meta Audience Network, or similar) configured |

### Cross-Section Dependencies
| Needed By Feed | Lives In |
|---|---|
| `followingIds` in Zustand store | Section 3 — Friends/Follow system |
| `friendIds` in Zustand store | Section 3 — Friends/Follow system |
| User `interests` from onboarding | Section 1 ✅ (already stored in Firestore) |
| Stories data in Firestore | Section 4 — Stories |
| Profile page `pinned posts` | Section 3 — Profile |

---

## 📁 Files Modified This Sprint
```
ConnectHub-SPA/src/pages/feed/FeedPage.jsx        — Full rewrite (all bugs + features)
ConnectHub-SPA/src/pages/feed/FeedSubPages.jsx    — Added AdsInfoPage export
ConnectHub-SPA/src/App.jsx                        — Added /ads/info import + route
ConnectHub-SPA/firestore.rules                    — Added reports + reactions + feedPrefs rules
```

---

## 🔐 Firestore Security Rules Added
```
// reports — any authenticated user can file a report
match /reports/{docId} {
  allow create: if request.auth != null;
  allow read, update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}

// post reactions — user owns their own reaction
match /posts/{postId}/reactions/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}

// feed preferences — user owns their own prefs
match /users/{uid}/feedPrefs/{prefId} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

---

*Section 2 Feed (Home) — Sprint 2 closed May 21, 2026*
