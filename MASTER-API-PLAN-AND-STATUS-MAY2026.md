# 🚀 LynkApp Master API Plan & Status — May 16, 2026
**Complete picture: what's done, what's missing, what to add next**

---

## ✅ SECTION 1 — COMPLETED THIS WEEK (May 15, 2026)

### 1a. Work Saved to GitHub
**Commit `0cc39d0`** pushed to `https://github.com/Watchdog088/Test-apps.git` on `main`
- `ConnectHub-SPA/src/services/reddit-service.js` — Live trending via Reddit public JSON
- `ConnectHub-SPA/src/services/youtube-music-service.js` — YouTube IFrame music player
- `ConnectHub-SPA/src/pages/trending/TrendingPage.jsx` — Fully upgraded with live data
- `FREE-API-UPGRADES-MAY2026.md` — First version of this documentation

### 1b. App Status: ✅ WORKING
The LynkApp React SPA runs correctly on `http://127.0.0.1:5175` (Vite dev server).
Feed, stories, navigation, music player, dating, marketplace — all confirmed loading.
**Why it appeared broken:** Multiple Vite processes were competing on ports 5173/5174/5175.
**Fix:** Always use the HIGHEST port number, or kill old processes before starting fresh.

### 1c. Money Saved This Session
| API Removed | Was Costing | Replaced With | Savings/Month |
|-------------|-------------|---------------|---------------|
| Twitter/X   | $100+/mo    | Reddit public JSON (free) | **$100+** |
| FeedFM      | $99+/mo     | YouTube IFrame API (free) | **$99+** |
| **TOTAL**   |             |               | **~$200+/mo** |

---

## ❌ SECTION 2 — WHAT'S STILL MISSING (Honest Status)

### 🔴 Critical — Must Have BEFORE Public Launch

| Item | Status | How to Fix | Time |
|------|--------|-----------|------|
| **Stripe LIVE key** | ❌ Test mode only | Go to dashboard.stripe.com → Activate account → Replace `VITE_STRIPE_TEST_KEY` with live key | 1-3 days for Stripe review |
| **Google AdSense publisher ID** | ❌ Not applied | Go to adsense.google.com → Apply → Takes 1-2 weeks to approve | 1-2 weeks |
| **Firebase Auth email verification** | ⚠️ Partial | Enable email verification in Firebase Console → Auth → Templates. Already coded in auth-service.js | 30 min |
| **Firebase Security Rules tightened** | ⚠️ Open rules | Run: `firebase deploy --only firestore:rules` using the rules in `ConnectHub-SPA/firestore.rules` | 1 hour |
| **Domain SSL certificate** | ⚠️ HTTP only locally | CloudFront distribution already created. Point lynkapp.com DNS to CloudFront — already have guide | 1-2 days DNS propagation |

### 🟡 Important — Should Have Before Beta Testing

| Item | Status | How to Fix | Time |
|------|--------|-----------|------|
| **Google Analytics 4 (GA4)** | ❌ Missing | Free. Go to analytics.google.com → Create property → Get Measurement ID → Add `VITE_GA4_MEASUREMENT_ID` | 30 min |
| **Sentry error tracking** | ❌ Missing | Free tier (5K errors/mo). sentry.io → Create project → Install `npm install @sentry/react` | 1 hour |
| **Reddit OAuth** | ❌ Not needed now | NOT REQUIRED — we use public JSON. Only needed if users can post to Reddit from the app | Skip |
| **Jamendo music backup** | 🟡 Optional | jamendo.com/developers → Free tier → Register app. Backup music source if YouTube embeds get blocked | 30 min |
| **App Store / Play Store listings** | ❌ Not started | Need Apple Dev account ($99/yr) + Google Play ($25 one-time) for native app launch | 1-2 weeks |

### 🟢 Nice to Have — Post-Launch

| Item | Status | Notes |
|------|--------|-------|
| **AppLovin MAX** | ❌ Skip for now | Optional ad network — adds revenue but wait until 10K+ daily users |
| **IronSource/Unity Ads** | ❌ Skip for now | Same as above |
| **Twilio SMS verification** | 🟡 Optional | For phone number 2FA. $0.0075/SMS. Free trial credits available |
| **SendGrid email** | 🟡 Optional | Free 100 emails/day. Better alternative to Mailgun |

---

## 💡 SECTION 3 — BONUS FREE API RECOMMENDATIONS (25 APIs)

These are all **100% free or have generous free tiers** that directly enhance LynkApp features.
Organized by which section of the app they improve.

---

### 🗂️ GROUP A — No API Key Needed (Works Right Now)

#### A1. 🗺️ OpenStreetMap + Leaflet.js (Maps)
- **Cost:** FREE forever, no key, no account
- **Adds:** Interactive maps to Events section, Marketplace "View on Map", Dating radius circles
- **Already built:** `ConnectHub-SPA/src/pages/marketplace/MapViewModal.jsx` just needs Leaflet wired in
- **Install:** `npm install leaflet react-leaflet`
- **Sample code:**
```js
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
<MapContainer center={[lat, lng]} zoom={13}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Marker position={[lat, lng]} />
</MapContainer>
```

#### A2. 🌐 ipapi.co (Auto-Detect Location)
- **Cost:** FREE, 1,000 req/day, NO key needed
- **Adds:** Auto-sets user region/currency/timezone on first open
- **Use in:** Marketplace (show local currency), News (region-specific), Events (local timezone)
- **One line of code:** `const geo = await fetch('https://ipapi.co/json/').then(r => r.json())`
- **Returns:** `{ country_code, city, currency, timezone, languages, latitude, longitude }`

#### A3. 🎨 DiceBear Avatars (Auto Profile Pics)
- **Cost:** FREE forever, no key, no account
- **Adds:** Every new user gets a unique generated avatar immediately
- **Use in:** Profile setup, group avatars, anonymous users
- **URL format:** `https://api.dicebear.com/8.x/avataaars/svg?seed=USERNAME&backgroundColor=b6e3f4`
- **Styles available:** avataaars, adventurer, big-ears, bottts, croodles, fun-emoji, icons, lorelei, micah, miniavs, notionists, open-peeps, personas, pixel-art, shapes, thumbs
- **Example:** `https://api.dicebear.com/8.x/fun-emoji/svg?seed=JordanM`

#### A4. 🕐 WorldTimeAPI (Timezone Data)
- **Cost:** FREE, no key
- **Adds:** Correct local time for events, live streams, scheduled content
- **Call:** `fetch('https://worldtimeapi.org/api/ip')` — auto-detects timezone from IP
- **Returns:** `{ timezone, datetime, utc_offset, day_of_week }`

#### A5. 🌈 ColourLovers API (Color Palettes)
- **Cost:** FREE, no key
- **Adds:** Dynamic color themes for user profiles, group pages, creator profiles
- **Use:** Let users pick a "vibe palette" for their profile
- **Call:** `https://www.colourlovers.com/api/palettes/top?format=json`

#### A6. 🔤 RandomUser.me (Demo/Test User Data)
- **Cost:** FREE, no key
- **Adds:** Realistic demo data for testing, onboarding walkthroughs, admin previews
- **Call:** `fetch('https://randomuser.me/api/?results=10&nat=us')` — returns fake user profiles with photos
- **Use:** Demo mode, user testing scenarios, admin dashboard placeholders

#### A7. 🌍 RestCountries API (Country Data)
- **Cost:** FREE, no key
- **Adds:** Country flags, phone codes, currency symbols for international users
- **Call:** `https://restcountries.com/v3.1/all?fields=name,flags,cca2,currencies,idd`
- **Use in:** Signup country selector, marketplace international shipping, dating location display

---

### 🗂️ GROUP B — Free API Key (Sign Up, Get Key Instantly)

#### B1. 🌤️ OpenWeatherMap (Weather)
- **Cost:** Free tier — 1,000 calls/day, 60 calls/min
- **Sign up:** openweathermap.org/api → Takes 2 minutes
- **Adds:** Weather cards on Events page, outdoor event warnings
- **Add to .env:** `VITE_OPENWEATHER_API_KEY=your_key`
- **Sample:**
```js
const weather = await fetch(
  `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_KEY}&units=imperial`
).then(r => r.json());
// { weather[0].description, main.temp, main.feels_like, wind.speed }
```

#### B2. 😂 Giphy API (GIFs)
- **Cost:** Free — 100 req/hour dev, 1,000 req/day production
- **Sign up:** developers.giphy.com → Takes 2 minutes
- **Adds:** GIF picker in Messages, reaction GIFs on posts, trending GIFs section
- **Add to .env:** `VITE_GIPHY_API_KEY=your_key`
- **Endpoints:**
  - `https://api.giphy.com/v1/gifs/trending?api_key=KEY&limit=20` — trending GIFs
  - `https://api.giphy.com/v1/gifs/search?q=QUERY&api_key=KEY` — search GIFs
  - `https://api.giphy.com/v1/stickers/trending?api_key=KEY` — stickers too

#### B3. 🎮 RAWG Games API (Gaming Hub)
- **Cost:** Free — 20,000 req/month (very generous)
- **Sign up:** rawg.io/apidocs → Takes 2 minutes
- **Adds:** Full gaming hub — 500K+ games, screenshots, ratings, trailers, ESRB ratings
- **Add to .env:** `VITE_RAWG_API_KEY=your_key`
- **Endpoints:**
  - `/api/games?key=KEY&ordering=-added` — trending games
  - `/api/games?key=KEY&metacritic=80,100` — top-rated
  - `/api/games/{id}/screenshots?key=KEY` — game screenshots
  - `/api/platforms?key=KEY` — PS5, Xbox, PC, Mobile filters

#### B4. 📸 Unsplash API (Stock Photos)
- **Cost:** Free — 50 req/hour
- **Sign up:** unsplash.com/developers → Takes 2 minutes
- **Adds:** Beautiful placeholder images for empty states, event covers, post thumbnails
- **Add to .env:** `VITE_UNSPLASH_ACCESS_KEY=your_key`
- **Sample:** `https://api.unsplash.com/photos/random?query=nature&client_id=KEY` — random photo
- **Use:** Empty feed state ("No posts yet" + beautiful photo), event default covers, onboarding backgrounds

#### B5. 📰 GNews API (Backup News)
- **Cost:** Free — 100 req/day
- **Sign up:** gnews.io → Takes 2 minutes
- **Adds:** Backup news source for when NewsAPI quota hits daily limit
- **Add to .env:** `VITE_GNEWS_API_KEY=your_key`
- **Categories:** general, world, nation, business, technology, entertainment, sports, science, health

#### B6. 📺 Pexels API (Stock Videos + Photos)
- **Cost:** Free — 200 req/hour, 20,000/month
- **Sign up:** pexels.com/api → Takes 2 minutes
- **Adds:** Free stock videos for the Videos section, video post thumbnails
- **Add to .env:** `VITE_PEXELS_API_KEY=your_key`
- **Endpoints:**
  - `https://api.pexels.com/videos/popular` — trending videos
  - `https://api.pexels.com/v1/search?query=TOPIC` — photo search
  - All CC0 licensed — safe to use commercially

#### B7. 🎵 Jamendo Music API (Free Music Streaming)
- **Cost:** Free — unlimited for non-commercial, licensing for commercial
- **Sign up:** jamendo.com/developers → Takes 5 minutes
- **Adds:** Backup music player with 600,000+ free licensed tracks
- **Add to .env:** `VITE_JAMENDO_CLIENT_ID=your_client_id`
- **Why add:** Backup if YouTube embeds get blocked by school/work networks
- **Sample:** `https://api.jamendo.com/v3.0/tracks/?client_id=KEY&format=json&limit=10&include=musicinfo`

#### B8. 🌐 Abstract API — Email Validation
- **Cost:** Free — 100 verifications/month
- **Sign up:** abstractapi.com → Takes 2 minutes
- **Adds:** Validate email addresses on signup (catch typos, block disposable emails)
- **Add to .env:** `VITE_ABSTRACT_EMAIL_KEY=your_key`
- **Use:** Prevent fake accounts, improve email deliverability for notifications

#### B9. 📍 Geoapify (Geocoding + Places — Generous Free)
- **Cost:** Free — 3,000 req/day
- **Sign up:** geoapify.com → Takes 2 minutes
- **Adds:** Convert address text to lat/lng for events, find nearby places for dating/events
- **Add to .env:** `VITE_GEOAPIFY_API_KEY=your_key`
- **Better than Google Maps** for free tier (Google charges after 200 req/day)
- **Endpoints:** geocoding, reverse geocoding, places search, routing, isochrones

#### B10. 📱 The Movie Database — TMDB (Movie/TV Content)
- **Cost:** Free — unlimited reads
- **Sign up:** themoviedb.org/settings/api → Takes 5 minutes
- **Adds:** Movie/TV show data for Media Hub — posters, trailers, ratings, cast
- **Add to .env:** `VITE_TMDB_API_KEY=your_key`
- **Endpoints:**
  - `/movie/trending/week` — trending movies
  - `/tv/trending/week` — trending shows
  - `/movie/{id}/videos` — trailers (links to YouTube)
  - `/movie/popular` — popular movies

#### B11. 📚 Open Library API (Books — NO KEY NEEDED)
- **Cost:** FREE, no key
- **Sign up:** Not required
- **Adds:** Books section in Media Hub — 20M+ books, covers, descriptions
- **Call:** `https://openlibrary.org/search.json?q=QUERY&fields=title,author_name,cover_i,first_publish_year`
- **Cover image:** `https://covers.openlibrary.org/b/id/{cover_i}-M.jpg`

#### B12. 🎵 Spotify (Read-Only Music Data — Free)
- **Cost:** Free for reading track/artist data (no playback without Premium SDK)
- **Sign up:** developer.spotify.com → Takes 5 minutes
- **Adds:** Song info display, album art, artist bios, related artists
- **What's FREE:** Search, artist info, album details, track metadata, new releases
- **What costs:** Actual audio playback (use YouTube IFrame for that instead)
- **Add to .env:** `VITE_SPOTIFY_CLIENT_ID=your_id` + `VITE_SPOTIFY_CLIENT_SECRET=your_secret`
- **Use:** Show "Now Playing: X by Y" with real cover art and metadata, artist pages

#### B13. 🏆 Open Trivia Database (Gaming Quiz — NO KEY NEEDED)
- **Cost:** FREE, no key
- **Adds:** Live quiz games, trivia challenges in Gaming Hub
- **Call:** `https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple`
- **Categories:** General, Entertainment, Science, Sports, Geography, History, Art, Celebrities

#### B14. 🍕 Spoonacular Food API (Food Content)
- **Cost:** Free — 150 req/day
- **Sign up:** spoonacular.com/food-api → Takes 2 minutes
- **Adds:** Recipe cards for food posts, nutrition info, restaurant-style content
- **Add to .env:** `VITE_SPOONACULAR_API_KEY=your_key`
- **Use:** When users post food photos, auto-suggest recipe link; food category in Feed

#### B15. 🔤 Dictionary API (NO KEY NEEDED)
- **Cost:** FREE, no key
- **Adds:** Word definitions in a "define" feature, auto-correct suggestions
- **Call:** `https://api.dictionaryapi.dev/api/v2/entries/en/WORD`
- **Use:** Hashtag description overlays, search suggestions, content moderation context

#### B16. ✈️ Aviation Stack (Flight Tracking — Has Free Tier)
- **Cost:** Free — 100 req/month
- **Sign up:** aviationstack.com → Takes 2 minutes
- **Adds:** Real-time flight tracking for "Travel" posts category
- **Use case:** Users posting travel content can show live flight status

#### B17. 💱 ExchangeRate-API (Currency Conversion — Free)
- **Cost:** Free — 1,500 req/month (no key needed on basic endpoint)
- **Call:** `https://api.exchangerate-api.com/v4/latest/USD`
- **Adds:** Automatic price conversion in Marketplace for international buyers
- **Returns all major currencies** in one call, cache for 24 hours

#### B18. 🖼️ Pixabay API (Free Images + Videos)
- **Cost:** Free — 5,000 req/hour
- **Sign up:** pixabay.com/api/docs → Takes 2 minutes
- **Adds:** MORE free stock photos/videos (backup to Pexels/Unsplash)
- **Add to .env:** `VITE_PIXABAY_API_KEY=your_key`
- **All CC0 licensed** — safe for commercial use

#### B19. 🧠 Joke API (NO KEY NEEDED)
- **Cost:** FREE, no key
- **Adds:** Daily joke/humor content for Feed, ice-breaker for Dating section
- **Call:** `https://v2.jokeapi.dev/joke/Any?safe-mode` — returns safe, random jokes
- **Also:** `https://official-joke-api.appspot.com/random_joke`

#### B20. 📊 CoinGecko API (Crypto Prices — NO KEY NEEDED)
- **Cost:** FREE, 30 calls/min, no key
- **Adds:** Crypto price feed for Finance/Business section
- **Call:** `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10`
- **Use:** Business profile finance dashboard, trending crypto widget

#### B21. 🏋️ ExerciseDB API (Workout Data)
- **Cost:** Free tier on RapidAPI — 100 req/day
- **Sign up:** rapidapi.com/justin-WFnsXH_t6/api/exercisedb
- **Adds:** Exercise library for Health/Fitness posts, workout plan builder
- **Add to .env:** `VITE_RAPIDAPI_KEY=your_key` (one key works for all RapidAPI services)

#### B22. 🌿 Edamam Nutrition API (Food Analysis)
- **Cost:** Free — 400 calls/month
- **Sign up:** developer.edamam.com → Takes 5 minutes
- **Adds:** Nutrition analysis for food posts, recipe nutrition breakdowns
- **Add to .env:** `VITE_EDAMAM_APP_ID=your_id` + `VITE_EDAMAM_APP_KEY=your_key`

#### B23. 🎭 BoredAPI (Activity Suggestions — NO KEY NEEDED)
- **Cost:** FREE, no key
- **Adds:** "Bored? Try this!" widget for Events/Social sections
- **Call:** `https://www.boredapi.com/api/activity` — random activity suggestion
- **Use:** Activity suggestions in Events section, ice-breakers in Dating

#### B24. 🌦️ Open-Meteo (Weather — NO KEY NEEDED, Better Free Tier)
- **Cost:** FREE, unlimited, no key — better than OpenWeatherMap for free tier
- **Call:** `https://api.open-meteo.com/v1/forecast?latitude=LAT&longitude=LNG&current_weather=true`
- **Returns:** Temperature, wind speed, weather code, all FREE with no rate limit
- **Use this INSTEAD of OpenWeatherMap** if you don't want to deal with API keys

#### B25. 📈 Alpha Vantage (Stock Market Data)
- **Cost:** Free — 25 req/day
- **Sign up:** alphavantage.co → Takes 2 minutes
- **Adds:** Real-time stock prices for Business/Finance section
- **Add to .env:** `VITE_ALPHAVANTAGE_KEY=your_key`
- **Endpoints:** stock quotes, forex rates, crypto prices, technical indicators

---

## 📋 SECTION 4 — IMPLEMENTATION PRIORITY ORDER

### Add These First (Max Impact, Zero Effort):
1. **ipapi.co** — No key, 1 line of code → auto-detect user region everywhere
2. **DiceBear Avatars** — No key, no install → every new user has a unique avatar
3. **Open-Meteo** — No key → weather in Events with ZERO setup
4. **Open Trivia DB** — No key → live quiz games in Gaming Hub immediately
5. **OpenStreetMap/Leaflet** — `npm install leaflet` → maps in marketplace/events
6. **CoinGecko** — No key → crypto prices in Business section

### Add These Second (30-min signups, big value):
7. **Giphy** — GIFs in messages (users expect this)
8. **RAWG** — Gaming hub with real game data
9. **TMDB** — Movie/TV content in Media Hub
10. **Unsplash** — Beautiful empty states and event covers
11. **Pexels** — Stock videos for the Videos tab

### Add These Third (Slightly more work, revenue impact):
12. **GA4** — You need analytics before real launch
13. **Sentry** — Error tracking catches bugs users report
14. **Spotify** — Music metadata display (not playback)
15. **Geoapify** — Better maps/geocoding than Google (free)

---

## 📊 SECTION 5 — COMPLETE API INVENTORY (Current State)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APIS ALREADY WORKING (10 total):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Firebase Auth/Firestore/Storage  ✅  Keys in ConnectHub-SPA/.env
  YouTube Data API v3              ✅  VITE_YOUTUBE_API_KEY in .env
  Reddit Public JSON               ✅  NO KEY — works now
  NewsAPI                          ✅  VITE_NEWS_API_KEY in .env
  MediaStack                       ✅  VITE_MEDIASTACK_KEY in .env
  Cloudinary                       ✅  Keys in .env (media uploads)
  OneSignal Push                   ✅  Keys in .env (notifications)
  OpenAI Moderation                ✅  OPENAI_API_KEY in backend .env
  DeepAR (AR filters)              ✅  VITE_DEEPAR_KEY in .env
  Stripe (Test mode)               ✅  VITE_STRIPE_KEY in .env

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REMOVED / REPLACED (saves $200+/mo):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Twitter/X API                    🗑️  REMOVED — $100+/mo saved
  FeedFM music                     🗑️  REPLACED with YouTube IFrame — $99/mo saved

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL MISSING (REQUIRED BEFORE PUBLIC LAUNCH):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Stripe LIVE key                  ❌  Activate at dashboard.stripe.com
  Google AdSense                   ❌  Apply at adsense.google.com (1-2 week review)
  Google Analytics 4               ❌  analytics.google.com (30 min setup, FREE)
  Sentry Error Tracking            ❌  sentry.io (FREE tier, 1 hour setup)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FREE ADDS — NO KEY NEEDED (add today):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ipapi.co geolocation             🟢  No key — auto-detect region
  DiceBear avatars                 🟢  No key — auto profile pics
  Open-Meteo weather               🟢  No key — weather in events
  OpenStreetMap/Leaflet maps       🟢  No key — npm install leaflet
  Open Trivia DB                   🟢  No key — gaming quiz
  CoinGecko crypto                 🟢  No key — business/finance
  Open Library books               🟢  No key — media hub books
  RestCountries                    🟢  No key — international users
  WorldTimeAPI                     🟢  No key — event timezones
  Joke API                         🟢  No key — fun daily content
  BoredAPI                         🟢  No key — activity suggestions
  ExchangeRate-API                 🟢  No key — marketplace currency
  Dictionary API                   🟢  No key — search/content
  RandomUser.me                    🟢  No key — demo/test data

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FREE ADDS — QUICK SIGNUP NEEDED (add this week):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Giphy API                        🟡  Free — GIFs in messages
  RAWG Games API                   🟡  Free — gaming hub data
  TMDB Movies/TV                   🟡  Free — media hub content
  Unsplash photos                  🟡  Free — stock photos
  Pexels photos/videos             🟡  Free — stock media
  Pixabay                          🟡  Free — more stock media
  OpenWeatherMap (OR Open-Meteo)   🟡  Free — weather data
  GNews (backup news)              🟡  Free — news backup
  Jamendo music                    🟡  Free — music backup
  Spotify metadata                 🟡  Free — music display
  Geoapify geocoding               🟡  Free — better maps
  Alpha Vantage stocks             🟡  Free — business data
  Spoonacular food                 🟡  Free — food content
  Abstract email validation        🟡  Free — signup quality
  ExerciseDB                       🟡  Free — fitness content
  Edamam nutrition                 🟡  Free — food analysis

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SKIP FOR NOW (post-launch, paid):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AppLovin MAX ads                 ⏸️  Post-launch (need user base first)
  IronSource/Unity Ads             ⏸️  Post-launch
  Twilio SMS                       ⏸️  $0.0075/SMS — add if needed for 2FA
  SendGrid email                   ⏸️  100 free/day — add if Mailgun fails
  Apple Push (APNS)                ⏸️  Need Apple Dev account ($99/yr)
```

---

## 🗓️ SECTION 6 — NEXT STEPS CHECKLIST (In Order)

### This Week (May 16-22):
- [ ] Add `ipapi.co` auto-geolocation (no key, 30 min)
- [ ] Add DiceBear to default profile picture generation (no key, 30 min)
- [ ] Add Open-Meteo to Events page weather card (no key, 1 hour)
- [ ] Wire Leaflet.js into MapViewModal.jsx (no key, 2 hours)
- [ ] Sign up for Giphy API and add GIF picker to Messages (2 hours)
- [ ] Sign up for RAWG and wire into Gaming Hub (3 hours)
- [ ] Apply for Google AdSense NOW (takes 1-2 weeks to approve)
- [ ] Activate Stripe LIVE key (takes 1-3 days for review)
- [ ] Set up Google Analytics 4 (FREE, 30 min)

### Next Week (May 23-29):
- [ ] Sign up for TMDB and add to Media Hub (2 hours)
- [ ] Sign up for Pexels/Unsplash for empty states (2 hours)
- [ ] Add Sentry error tracking (FREE, 1 hour)
- [ ] Test Firebase security rules and deploy
- [ ] Point lynkapp.com domain to CloudFront (HTTPS)
- [ ] Enable Firebase email verification

### Beta Launch Requirements (all of above PLUS):
- [ ] Stripe live key activated
- [ ] AdSense application submitted (waiting)
- [ ] GA4 tracking active
- [ ] Sentry monitoring active
- [ ] HTTPS via CloudFront working
- [ ] Firebase rules locked down
- [ ] Test 10 user accounts end-to-end

---

## 💰 SECTION 7 — TOTAL MONTHLY COST PROJECTION

| Category | Current Cost | After Optimizations |
|----------|-------------|---------------------|
| Firebase (Spark plan) | $0 | $0 |
| YouTube API | $0 | $0 |
| Reddit Public JSON | $0 | $0 |
| NewsAPI / MediaStack | $0 | $0 |
| Cloudinary (free tier) | $0 | $0 |
| OneSignal (free tier) | $0 | $0 |
| OpenAI (pay-per-use) | ~$5-20/mo | ~$5-20/mo |
| DeepAR | ~$0 (dev key) | ~$99/mo at launch |
| Stripe | 2.9% + $0.30 per transaction | Same |
| AWS (S3 + CloudFront) | ~$5-15/mo | ~$5-15/mo |
| Twitter/X | ~~$100/mo~~ | **$0 — REMOVED** |
| FeedFM | ~~$99/mo~~ | **$0 — REPLACED** |
| **TOTAL** | **~$220-235/mo** | **~$10-35/mo** |

**Monthly savings achieved: ~$200+/month** ✅

---

*Last updated: May 16, 2026 | Commit: see GitHub `main` branch*
*GitHub: https://github.com/Watchdog088/Test-apps.git*
