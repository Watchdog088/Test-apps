# 📰 News APIs Integration — COMPLETE

**Date:** May 19, 2026  
**Status:** ✅ Implementation Complete  
**APIs Added:** The Guardian • NPR News • Dev.to  
**Total Cost:** FREE — Guardian uses demo key, NPR uses public RSS, Dev.to requires no key

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `ConnectHub-SPA/src/services/guardian-service.js` | The Guardian API service module |
| `ConnectHub-SPA/src/services/npr-service.js` | NPR News RSS service module |
| `ConnectHub-SPA/src/services/devto-service.js` | Dev.to API service module |
| `test-news-apis.html` | Combined live test page for all 3 APIs |
| `NEWS-APIS-INTEGRATION-COMPLETE.md` | This documentation |

---

## 1. 🗞️ The Guardian API

**Base URL:** `https://content.guardianapis.com`  
**Auth:** Demo key `"test"` (50 req/day) — free production key at [open-platform.theguardian.com](https://open-platform.theguardian.com/access/)

### Functions

| Function | Description |
|----------|-------------|
| `searchArticles(query, opts)` | Full-text search with optional section/tag/orderBy |
| `getLatestArticles(section, limit)` | Newest articles, optional section filter |
| `getTopStories(limit)` | Top relevance articles published today |
| `getBySection(section, limit)` | Articles from a named section |
| `getArticle(id)` | Single article by Guardian ID path |
| `getSections()` | All available sections (~60 sections) |
| `getTags(query, limit)` | Search/list tags |
| `formatDate(isoString)` | "3h ago", "2d ago" etc. |
| `getSectionColor(section)` | Color-coded by section type |
| `buildArticleCard(article)` | Renders a styled article card with thumbnail |

### Available Sections (examples)
`world` · `technology` · `science` · `sport` · `culture` · `us-news` · `uk-news` · `politics` · `business` · `environment` · `media` · `opinion`

### Usage Example
```javascript
import { getBySection, searchArticles, buildArticleCard } from '../services/guardian-service.js';

// Get technology news
const articles = await getBySection('technology', 15);

// Search
const results = await searchArticles('artificial intelligence', { limit: 10, orderBy: 'newest' });

// Render
document.getElementById('news').innerHTML = articles.map(buildArticleCard).join('');
```

---

## 2. 📻 NPR News API

**Method:** Public RSS feeds via [rss2json.com](https://api.rss2json.com) (FREE, no key)  
**All 9 feeds are free with no authentication required.**

### Available Feeds

| Key | NPR Feed ID | Label | Color |
|-----|------------|-------|-------|
| `news` | 1001 | 📰 News | Red |
| `technology` | 1019 | 💻 Technology | Blue |
| `science` | 1007 | 🔬 Science | Purple |
| `politics` | 1014 | 🏛️ Politics | Orange |
| `health` | 1128 | 🏥 Health | Green |
| `business` | 1006 | 💼 Business | Teal |
| `arts` | 1008 | 🎨 Arts & Life | Amber |
| `music` | 1039 | 🎵 Music | Purple |
| `world` | 1004 | 🌎 World | Cyan |

### Functions

| Function | Description |
|----------|-------------|
| `getByCategory(category, limit)` | Get stories from any of the 9 named feeds |
| `getTopNews(limit)` | Shortcut for news feed |
| `getTechStories(limit)` | Shortcut for technology feed |
| `getScienceStories(limit)` | Shortcut for science feed |
| `getMultiCategory(categories, limitEach)` | Fetch multiple feeds, merged flat |
| `getFeedInfo(category)` | Get RSS feed metadata |
| `buildNprCard(item)` | Render a styled NPR article card |
| `buildNprFeedWidget(items)` | Render a full feed section |

### Usage Example
```javascript
import { getTopNews, getMultiCategory, buildNprFeedWidget } from '../services/npr-service.js';

// Get top news
const news = await getTopNews(10);

// Get multiple categories merged
const mixed = await getMultiCategory(['news', 'technology', 'science'], 5);

// Render
document.getElementById('npr').innerHTML = buildNprFeedWidget(news);
```

---

## 3. 👩‍💻 Dev.to API

**Base URL:** `https://dev.to/api`  
**Auth:** None required for read operations. Optional API key for write actions.

### Functions

| Function | Description |
|----------|-------------|
| `getArticles(opts)` | Get articles with page/limit/tag/state filters |
| `getTrending(limit)` | Top articles of the past 7 days |
| `getByTag(tag, limit)` | Articles filtered by tag |
| `getArticle(id)` | Single article by numeric ID |
| `getUserArticles(username, limit)` | Articles by a specific user |
| `searchArticles(query, limit)` | Client-side search by title/tag |
| `getPopularTags()` | Top 30 popular tags |
| `getUser(username)` | User profile data |
| `getComments(articleId)` | Comments for an article |
| `buildDevtoCard(article)` | Styled article card with tags, reactions, read time |
| `buildDevtoTagBadge(tag)` | Colored clickable tag badge |

### Article States
- `fresh` — Latest articles
- `rising` — Rising articles
- `all` — All-time articles
- `top=7` — Top this week (trending)

### Usage Example
```javascript
import { getTrending, getByTag, buildDevtoCard } from '../services/devto-service.js';

// Get trending dev articles
const articles = await getTrending(20);

// Get by tag
const jsArticles = await getByTag('javascript', 15);

// Render
document.getElementById('devto').innerHTML = articles.map(buildDevtoCard).join('');
```

---

## 🧪 Test Page (`test-news-apis.html`)

Accessible at `http://localhost:3001/test-news-apis.html`

### 6 Status Checks
| Check | What It Verifies |
|-------|-----------------|
| The Guardian API | Demo key "test" works, returns total article count |
| NPR News (RSS) | RSS2JSON proxy responds, stories load |
| Dev.to API | Public endpoint responds, trending articles fetch |
| Dev.to Tags | Popular tag cloud loads (10 tags) |
| Guardian Sections | All ~60 sections enumerated |
| NPR Multi-Feed | Tech + Science feeds both load simultaneously |

### Interactive Features
- **Guardian:** 6 section tabs (World/Tech/Science/US News/Sport/Culture) + live search with Enter key
- **NPR:** 8 category tabs (News/Tech/Science/Politics/Health/Arts/Music/World)
- **Dev.to:** 6 tabs (Trending/Latest/#javascript/#python/#webdev/#ai) + search + clickable tag cloud

---

## 🗺️ LynkApp Section Integration Map

| LynkApp Section | Guardian | NPR | Dev.to |
|----------------|----------|-----|--------|
| **Trending** | World/Tech/Science/Politics | News/Tech | Trending/Rising |
| **Feed** | Latest articles widget | Top news widget | Fresh articles |
| **Media Hub** | Culture/Arts section | Arts & Music feeds | Show HN-style |
| **Search** | Full-text search | — | Tag-based search |
| **Notifications** | Breaking news | — | — |
| **Gaming** | — | — | `#gaming` tag |

---

## 🔑 Production Keys

| API | Current | Production |
|-----|---------|-----------|
| The Guardian | `"test"` demo key (50 req/day) | Free key at open-platform.theguardian.com |
| NPR | No key (RSS proxy) | Optional: api.npr.org for metadata |
| Dev.to | No key (public) | Optional: dev.to/settings/extensions for write access |

---

## 📜 Attribution

- **The Guardian Open Platform** — [open-platform.theguardian.com](https://open-platform.theguardian.com)
- **NPR Public RSS** — [npr.org](https://npr.org) — Free public feeds
- **RSS2JSON Proxy** — [rss2json.com](https://rss2json.com) — Free RSS to JSON converter
- **Dev.to API** — [developers.forem.com](https://developers.forem.com/api) — Free public API
