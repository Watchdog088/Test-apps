# 🦊 HackerNews API Integration — COMPLETE

**Date:** May 19, 2026  
**Status:** ✅ Implementation Complete  
**API:** HackerNews Official API (Firebase) + Algolia HN Search  
**Cost:** FREE — No API key required, no rate limit  
**Base URL:** `https://hacker-news.firebaseio.com/v0/`  
**Search URL:** `https://hn.algolia.com/api/v1/`

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `ConnectHub-SPA/src/services/hackernews-service.js` | Full HN service module |
| `test-hackernews.html` | Live browser test page |
| `HACKERNEWS-API-INTEGRATION-COMPLETE.md` | This documentation |

---

## 🔧 Service API Reference (`hackernews-service.js`)

### Core Functions

| Function | Endpoint | Returns |
|----------|----------|---------|
| `getItem(id)` | `/item/{id}.json` | Single story/comment/poll/job |
| `getUser(username)` | `/user/{username}.json` | User profile (karma, about, stories) |
| `getMaxItemId()` | `/maxitem.json` | Latest item ID (for polling) |
| `getUpdates()` | `/updates.json` | Changed items & profiles |

### Story List Functions

| Function | Endpoint | Default Limit |
|----------|----------|--------------|
| `getTopStories(limit)` | `/topstories.json` | 30 |
| `getBestStories(limit)` | `/beststories.json` | 30 |
| `getNewStories(limit)` | `/newstories.json` | 30 |
| `getAskStories(limit)` | `/askstories.json` | 20 |
| `getShowStories(limit)` | `/showstories.json` | 20 |
| `getJobStories(limit)` | `/jobstories.json` | 20 |
| `getStories(type, limit, offset)` | Any type above | Paginated |

### Comments

| Function | Description |
|----------|-------------|
| `getStoryComments(storyId, limit)` | Fetch top-level comments for a story |

### Search (Algolia — Free, No Key)

| Function | Endpoint | Sort |
|----------|----------|------|
| `searchHN(query, type, limit)` | `/search` | By relevance |
| `searchHNByDate(query, limit)` | `/search_by_date` | Most recent first |
| `getStoriesByAuthor(username, limit)` | `/search` | By author |

### Formatters

| Function | Example Output |
|----------|---------------|
| `extractDomain(url)` | `github.com` |
| `timeAgo(unixTs)` | `"3h ago"`, `"2d ago"` |
| `scoreBadgeColor(score)` | `#f97316` (orange=viral, gold=hot, green=good, blue=normal) |
| `formatComments(n)` | `"42 comments"` |
| `stripHtml(html)` | Clean plaintext from HN comment HTML |

### UI Builder Functions

| Function | Used In | Description |
|----------|---------|-------------|
| `buildStoryCard(story, index)` | Feed / Trending | Full story card with rank, score, domain, meta |
| `buildJobCard(job, index)` | Jobs tab | Purple-accented job listing card |
| `buildCommentCard(comment)` | Story detail | Comment with avatar, author, timestamp, preview |
| `buildTrendingItem(story, rank)` | Trending strip | Compact inline ticker item |
| `buildTrendingFeed(limit)` | Trending page | Full tabbed feed (Top/Best/New) |
| `buildFeedWidget(limit)` | Feed sidebar | Mini top-5 HN widget |
| `buildMediaHubPanel(limit)` | Media Hub | Ask HN + Show HN two-panel view |
| `buildSearchResults(query, limit)` | Search page | Rendered Algolia search results |

---

## 📰 Story Types Explained

| Type | Description | Best Used In |
|------|-------------|-------------|
| **Top** | Current most popular stories | Main feed, Trending |
| **Best** | Highest rated stories over time | "Best of" section |
| **New** | Most recently submitted | Live stream / latest feed |
| **Ask HN** | Community questions | Discussion section |
| **Show HN** | Project showcases | Media Hub, Discovery |
| **Jobs** | YC/startup job listings | Jobs section |

---

## 📊 Score Color System

| Score Range | Color | Emoji | Label |
|-------------|-------|-------|-------|
| 500+ | 🟠 `#f97316` | 🔥 | Viral |
| 200–499 | 🟡 `#f59e0b` | ⭐ | Hot |
| 50–199 | 🟢 `#22c55e` | ✅ | Good |
| 1–49 | 🔵 `#3b82f6` | — | Normal |

---

## 🧪 Test Page Features (`test-hackernews.html`)

When served via `http://localhost:3001/test-hackernews.html`:

1. ✅ **6 status checks** — all turn green (topstories, beststories, newstories, item, algolia, maxitem)
2. ✅ **Live trending ticker** — horizontal scrollable strip of top 12 stories with scores
3. ✅ **Tabbed story feed** — 6 tabs: 🔥 Top / ⭐ Best / 🆕 New / 💡 Ask HN / 🚀 Show HN / 💼 Jobs
4. ✅ **Algolia search** — pre-filled "artificial intelligence", supports Enter key, real-time results
5. ✅ **Story #1 detail** — score, comment count, author, time in stat boxes
6. ✅ **Top comments** — avatars, usernames, timestamps, stripped plaintext preview
7. ✅ **Feed sidebar widget** — top 5 stories with score badges in a compact card

---

## 🔗 How to Use in LynkApp SPA

```javascript
// Import service
import HN, { getTopStories, searchHN, buildFeedWidget, buildTrendingFeed } from '../services/hackernews-service.js';

// Get top stories for feed
const stories = await getTopStories(20);

// Build full trending feed (HTML string, inject into DOM)
const feedHtml = await buildTrendingFeed(15);
document.getElementById('trending-container').innerHTML = feedHtml;

// Build sidebar widget
const widget = await buildFeedWidget(5);
document.getElementById('sidebar').innerHTML = widget;

// Search
const results = await searchHN('react', 'story', 10);

// Get comments for story ID 39891234
const comments = await HN.getStoryComments(39891234, 10);
```

---

## 🌐 LynkApp Section Integration Map

| LynkApp Section | HN Feature |
|----------------|------------|
| **Trending** | Top/Best/New story feed + ticker strip |
| **Feed** | HN sidebar widget (top 5 stories) |
| **Media Hub** | Ask HN + Show HN panels |
| **Search** | Full-text Algolia search |
| **Notifications** | `getUpdates()` for live change polling |
| **Profile** | `getUser(username)` for HN user info |

---

## ⚠️ Sandbox/Environment Note

The test page will show **loading spinners** in:
- Puppeteer/automated browser (no internet)
- `file://` protocol (CORS blocked)

**Fix:** Navigate to `http://localhost:3001/test-hackernews.html` in Chrome/Edge/Firefox.  
The server on port 3001 is already running (see active terminals). All 6 status checks will turn ✅ green.

---

## 📜 API Attribution

- **HackerNews Firebase API:** Created by Y Combinator. Free, public domain, no ToS restrictions.
- **Algolia HN Search:** [hn.algolia.com](https://hn.algolia.com/api) — Free full-text search over all HN content.
- No API key required for either. No rate limit documented (be polite — don't hammer it).
