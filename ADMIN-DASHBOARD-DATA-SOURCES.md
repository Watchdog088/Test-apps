# LynkApp Admin Dashboard — Complete Data Source Registry
**Updated:** August 12, 2026  
**Site:** www.lynkapp.net  
**Firebase Project:** lynkapp-c7db1  

---

## Summary

The LynkApp Admin Dashboard receives live data from **35 data sources** across Firebase, REST APIs, SDKs, and browser APIs. All Firestore data is queried in real-time using Firebase v10 SDK onSnapshot listeners and getCountFromServer.

---

## Legend
- **● LIVE** = actively queried in real-time by the dashboard
- **⚙ Configured** = credentials set; server-side stats not accessible from browser (requires backend proxy)

---

## Complete Data Source List

| # | Source / Service | Type | URL / Endpoint | Data Provided | Status |
|---|---|---|---|---|---|
| 1 | 🔥 **Firebase Firestore** | Real-Time Database | lynkapp-c7db1.firebaseapp.com | Users, Posts, Stories, Matches, Orders, Reports, Groups, Events, Messages, KYC, Disputes, Listings, Livestreams, Notifications, Settings | ● LIVE |
| 2 | 🔐 **Firebase Authentication** | Auth | lynkapp-c7db1.firebaseapp.com/auth | User identity, admin role, session tokens | ● LIVE |
| 3 | 📦 **Firebase Storage** | File Storage | lynkapp-c7db1.firebasestorage.app | Media files, user uploads, story assets | ● LIVE |
| 4 | 📰 **NewsAPI** | REST API | newsapi.org/v2/top-headlines | Trending news articles, headlines, categories | ● LIVE |
| 5 | 🖼️ **Cloudinary CDN** | Media CDN | res.cloudinary.com/do6ue7mgf | Image/video uploads, transformations, storage usage | ⚙ Configured |
| 6 | 🔔 **OneSignal** | Push Notifications | onesignal.com / App: 00c74474-9140-4f10-b8a9-a94e836e43ac | Subscriber count, notification delivery stats, click rates | ⚙ Configured |
| 7 | 🤖 **OpenAI Moderation** | AI API | api.openai.com/v1/moderations | Content violation flags, hate speech, harassment scores | ● LIVE |
| 8 | 💳 **Stripe** | Payments | api.stripe.com | Order payments, refunds, transaction history | ⚙ Configured |
| 9 | 📹 **Metered TURN/WebRTC** | WebRTC | lynkapp.metered.live | Video call connections, relay stats, active calls | ● LIVE |
| 10 | 📍 **ipapi.co Geolocation** | REST API | ipapi.co/json | User locations for dating distance, nearby friends | ● LIVE |
| 11 | 🌤️ **Open-Meteo Weather** | REST API | api.open-meteo.com/v1/forecast | Local weather for events & activities | ● LIVE |
| 12 | 📰 **Mediastack News** | REST API | api.mediastack.com/v1/news | Supplemental trending news, breaking news | ● LIVE |
| 13 | ▶️ **YouTube Data API v3** | REST API | youtube.googleapis.com/youtube/v3 | Video search, trending videos, channel data | ● LIVE |
| 14 | 🎮 **RAWG Gaming API** | REST API | api.rawg.io/api/games | Game listings, ratings, gaming hub content | ● LIVE |
| 15 | 😄 **Giphy API** | REST API | api.giphy.com/v1/gifs | GIF search for messages and reactions | ● LIVE |
| 16 | 📷 **Unsplash API** | REST API | api.unsplash.com/photos | Stock photos for profile backgrounds, posts | ● LIVE |
| 17 | 🖼️ **Pexels API** | REST API | api.pexels.com/v1/search | Stock photos and videos | ● LIVE |
| 18 | 🎵 **Deezer Music API** | REST API | api.deezer.com/search | Music tracks, artists, playlists | ● LIVE |
| 19 | 📻 **Radio Browser API** | REST API | de1.api.radio-browser.info | Live radio stations worldwide | ● LIVE |
| 20 | 🕹️ **FreeToGame API** | REST API | freetogame.com/api/games | Free-to-play game listings for gaming hub | ● LIVE |
| 21 | 💰 **CoinGecko Crypto API** | REST API | api.coingecko.com/api/v3 | Crypto prices, LynkCoin market data | ● LIVE |
| 22 | 🗺️ **Leaflet / OpenStreetMap** | Maps | tile.openstreetmap.org / leafletjs.com | Event maps, nearby friends, dating map view | ● LIVE |
| 23 | 👤 **DiceBear Avatar API** | REST API | api.dicebear.com/7.x | Generated default profile avatars | ● LIVE |
| 24 | 🍎 **Guardian News API** | REST API | content.guardianapis.com | World news for trending section | ● LIVE |
| 25 | 💻 **Dev.to API** | REST API | dev.to/api/articles | Tech articles for tech-savvy users | ● LIVE |
| 26 | 🟠 **Hacker News API** | REST API | hacker-news.firebaseio.com/v0 | Tech trending stories | ● LIVE |
| 27 | 🏋️ **WGER Fitness API** | REST API | wger.de/api/v2 | Exercise data for health section | ● LIVE |
| 28 | 🥗 **USDA Food Database** | REST API | api.nal.usda.gov/fdc/v1 | Nutritional data for health features | ● LIVE |
| 29 | 💊 **OpenFDA API** | REST API | api.fda.gov/drug | Drug information for wellness section | ● LIVE |
| 30 | 🤖 **DeepAR (AR Filters)** | SDK | sdk.deepar.ai | AR face filters for live streaming & camera | ⚙ Configured |
| 31 | 🎯 **Firebase Analytics (GA4)** | Analytics | G-V82FSK7TYV | Page views, user sessions, conversion events | ● LIVE |
| 32 | 🖥️ **Browser Performance API** | Browser API | window.performance (local) | FCP, LCP, CLS, TTFB, memory usage | ● LIVE |
| 33 | 🌐 **www.lynkapp.net (Firebase Hosting)** | Hosting | www.lynkapp.net / lynkapp-c7db1.web.app | Main app deployment, CDN delivery of all assets | ● LIVE |
| 34 | 📱 **Reddit API** | REST API | reddit.com/r/popular.json | Trending community posts & topics | ● LIVE |
| 35 | 🎵 **YouTube Music API** | REST API | youtube.googleapis.com (music search) | Music search, trending music videos | ● LIVE |

---

## Firebase Firestore Collections Monitored

The following Firestore collections are queried live by the admin dashboard:

| Collection | Data | Dashboard Section |
|---|---|---|
| `users` | Total user count, seller flag | General KPIs |
| `posts` | Total posts, posts today | General KPIs, Recent Posts |
| `stories` | Total stories | General KPIs |
| `messages` | Total messages | General KPIs |
| `groups` | Total groups | General KPIs |
| `events` | Total events | General KPIs |
| `livestreams` | Active live streams (status=live) | General KPIs |
| `kyc` | Pending KYC reviews | General KPIs, Marketplace |
| `datingProfiles` | Total dating profiles | Dating Tab |
| `matches` | Total dating matches | Dating Tab |
| `reports` | Open safety reports | Dating + Moderation |
| `listings` | Active marketplace listings | Marketplace Tab |
| `orders` | All orders, revenue, pipeline status | Marketplace Tab |
| `disputes` | Open marketplace disputes | Marketplace Tab |
| `likes` | Engagement calculation | General KPIs |
| `comments` | Engagement calculation | General KPIs |
| `errorLogs` | Error tracking | Error Tracking Section |

---

## API Keys & Configuration

| Service | Key/ID (Partial) | Location |
|---|---|---|
| Firebase | AIzaSyDmnKjhl--S69dWq… | ConnectHub-SPA/.env |
| NewsAPI | fda0b285fdbb4d27… | ConnectHub-SPA/.env |
| Cloudinary | Cloud: do6ue7mgf | ConnectHub-SPA/.env |
| OneSignal | 00c74474-9140-4f10… | ConnectHub-SPA/.env |
| Stripe (Test) | pk_test_51Sk8Oy… | ConnectHub-SPA/.env |
| Metered WebRTC | 83d69637403c2a… | ConnectHub-SPA/.env |
| YouTube API | AIzaSyB4zNs_jzRUnM… | ConnectHub-SPA/.env |
| RAWG Gaming | 70f7dae8dba441… | ConnectHub-SPA/.env |
| Giphy | ekdmBElA27eDXZ… | ConnectHub-SPA/.env |
| Pexels | tEbzEdpS6T3Wl2… | ConnectHub-SPA/.env |
| Unsplash | 4vLXSRzZRNTZhRVy… | ConnectHub-SPA/.env |
| Mediastack | 7c3ebee3dbb44683… | ConnectHub-SPA/.env |
| DeepAR | 8d56a8f3d88b56f4… | ConnectHub-SPA/.env |
| Firebase Analytics | G-V82FSK7TYV | ConnectHub-SPA/.env |

---

## Auto-Refresh Schedule

| Data Source | Refresh Interval |
|---|---|
| Firestore counts (users, posts, etc.) | Every 5 minutes + real-time listeners |
| NewsAPI headlines | Every 5 minutes |
| Firestore real-time listeners (posts, reports, orders) | Instant (onSnapshot) |
| Browser performance metrics | On page load |
| Error logs | Real-time (onSnapshot) |

---

*This document was auto-generated by the LynkApp Admin Dashboard on August 12, 2026.*  
*Source: admin-dashboard.html → Tab: 📡 Data Sources*
