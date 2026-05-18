# 🔧 LynkApp Complete API Setup Guide — May 18, 2026
**Step-by-step instructions for every API + 35 more bonus free APIs + full status**

---

## ✅ SECTION 1 — WHAT'S BEEN COMPLETED (As of May 18, 2026)

| Date | What Was Done | Commit |
|------|--------------|--------|
| May 15 | Reddit public JSON service — live trending, no key | `0cc39d0` |
| May 15 | YouTube IFrame music player — replaces FeedFM ($99/mo saved) | `0cc39d0` |
| May 15 | TrendingPage.jsx upgraded — live Reddit data, Twitter removed | `0cc39d0` |
| May 16 | Master API Plan document — 25 bonus APIs, status report | `2ba0fd3` |
| May 16 | App confirmed working at `http://127.0.0.1:5175` | Verified |
| May 18 | **THIS DOCUMENT** — 35+ more bonus APIs + step-by-step guides | (this commit) |

**Money saved so far:** ~$200+/month (Twitter $100+ + FeedFM $99)

---

## ❌ SECTION 2 — WHAT STILL NEEDS TO BE DONE

### 🔴 CRITICAL — Must complete before public launch:
- [ ] Stripe LIVE key (test mode only right now)
- [ ] Google AdSense publisher ID (apply now — takes 1-2 weeks)
- [ ] Google Analytics 4 (free, 30 min — needed before launch)
- [ ] Sentry error tracking (free, 1 hour — catch bugs before users report)
- [ ] Firebase Security Rules deployed (rules file exists, just not deployed)
- [ ] Firebase email verification enabled
- [ ] lynkapp.com HTTPS via CloudFront (DNS already pointed, just needs verification)

### 🟡 SHOULD DO — Before beta testing:
- [ ] Add DiceBear auto-avatars (no key, 30 min)
- [ ] Add ipapi.co geolocation (no key, 30 min)
- [ ] Add Open-Meteo weather to Events (no key, 1 hour)
- [ ] Wire Leaflet.js maps into MapViewModal.jsx (npm install, 2 hours)
- [ ] Giphy API for Messages GIF picker (signup, 2 hours)
- [ ] RAWG API for Gaming Hub (signup, 3 hours)
- [ ] TMDB for Media Hub movies/TV (signup, 2 hours)

---

## 📋 SECTION 3 — STEP-BY-STEP INSTRUCTIONS FOR ALL MISSING APIS

---

### 🔴 STEP 1: Activate Stripe LIVE Key
**Time:** 30 min setup + 1-3 days review
**Cost:** Free to activate, 2.9% + $0.30 per transaction

1. Go to **https://dashboard.stripe.com**
2. Log in with your Stripe account
3. Click **"Activate your account"** in the top banner
4. Fill out: Business name (LynkApp), business type (Software/App), bank account for payouts
5. Submit — Stripe reviews in 1-3 business days
6. Once approved, go to **Developers → API Keys**
7. Copy the **"Publishable key"** that starts with `pk_live_`
8. Copy the **"Secret key"** that starts with `sk_live_`
9. Open `ConnectHub-SPA/.env` and update:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
```
10. Open `ConnectHub-Backend/.env` and update:
```
STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE
```
11. In terminal:
```bash
cd ConnectHub-SPA
git add .env
# DO NOT commit .env — it's gitignored. Just update it locally.
```
12. Test with a real card to confirm live payments work
13. ✅ Done — users can now make real purchases

---

### 🔴 STEP 2: Apply for Google AdSense
**Time:** 15 min to apply + 1-2 weeks review
**Cost:** FREE — Google pays YOU

1. Go to **https://adsense.google.com**
2. Click **"Get started"**
3. Enter website URL: `https://lynkapp.com`
4. Enter your email address
5. Select country: United States
6. Click **"Start using AdSense"**
7. Google will review your site (1-2 weeks). Requirements:
   - Site must have original content
   - Site must be live and accessible
   - Must have privacy policy page (already in app)
8. When approved, you get a Publisher ID like: `ca-pub-1234567890123456`
9. Open `ConnectHub-SPA/.env` and add:
```
VITE_ADSENSE_PUBLISHER_ID=ca-pub-YOUR_ID_HERE
```
10. Open `ConnectHub-SPA/src/services/ad-service.js` — already has AdSense integration
11. The AdUnit component at `ConnectHub-SPA/src/components/ads/AdUnit.jsx` is ready
12. ✅ Done — ads will start showing and generating revenue

---

### 🔴 STEP 3: Set Up Google Analytics 4 (GA4)
**Time:** 30 minutes total
**Cost:** FREE

1. Go to **https://analytics.google.com**
2. Click **"Start measuring"** or sign in
3. Create account name: `LynkApp`
4. Create property name: `LynkApp Production`
5. Select **United States** and **USD**
6. Select **"Web"** as platform
7. Enter website URL: `https://lynkapp.com`
8. Stream name: `LynkApp Web`
9. Click **"Create stream"**
10. Copy the **Measurement ID** (looks like `G-XXXXXXXXXX`)
11. Open `ConnectHub-SPA/.env` and add:
```
VITE_GA4_MEASUREMENT_ID=G-YOUR_ID_HERE
```
12. Open `ConnectHub-SPA/index.html` and add before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_ID_HERE"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-YOUR_ID_HERE');
</script>
```
13. Or install the npm package (cleaner for React):
```bash
cd ConnectHub-SPA
npm install @gtm-support/react-gtm-module
```
14. In `ConnectHub-SPA/src/main.jsx`, add:
```js
import ReactGA from 'react-ga4';
ReactGA.initialize(import.meta.env.VITE_GA4_MEASUREMENT_ID);
```
15. Visit the site and check **GA4 → Realtime** to confirm data flowing
16. ✅ Done — you can now track users, sessions, page views, events

---

### 🔴 STEP 4: Set Up Sentry Error Tracking
**Time:** 1 hour total
**Cost:** FREE (5,000 errors/month on free tier)

1. Go to **https://sentry.io**
2. Click **"Get Started for Free"**
3. Sign up with GitHub or email
4. Create organization: `LynkApp`
5. Create project: Select **React**, name it `lynkapp-frontend`
6. Copy the **DSN** (looks like `https://abc123@sentry.io/1234567`)
7. In terminal:
```bash
cd ConnectHub-SPA
npm install @sentry/react @sentry/tracing
```
8. Open `ConnectHub-SPA/src/main.jsx` and add at the TOP:
```js
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 0.1, // 10% of transactions
  environment: import.meta.env.MODE,
});
```
9. Open `ConnectHub-SPA/.env` and add:
```
VITE_SENTRY_DSN=https://YOUR_KEY@sentry.io/YOUR_PROJECT_ID
```
10. Add Sentry to `ConnectHub-SPA/.env.example` (without real value):
```
VITE_SENTRY_DSN=your_sentry_dsn_here
```
11. To test: in any component, temporarily add `throw new Error('Test Sentry')` and check your Sentry dashboard
12. Remove the test error and commit
13. ✅ Done — all crashes and errors will appear in your Sentry dashboard

---

### 🔴 STEP 5: Deploy Firebase Security Rules
**Time:** 1 hour
**Cost:** FREE

1. Open `ConnectHub-SPA/firestore.rules` — rules are already written
2. Open `ConnectHub-SPA/firestore.indexes.json` — indexes are already defined
3. Make sure Firebase CLI is installed:
```bash
npm install -g firebase-tools
```
4. Login:
```bash
firebase login
```
5. In terminal navigate to project:
```bash
cd ConnectHub-SPA
```
6. Initialize (if not already):
```bash
firebase init firestore
```
7. Deploy rules only:
```bash
firebase deploy --only firestore:rules
```
8. Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```
9. Go to **Firebase Console → Firestore → Rules** to verify the rules are live
10. Test: try to read data without authentication — should get "permission denied"
11. ✅ Done — database is now protected from unauthorized access

---

### 🔴 STEP 6: Enable Firebase Email Verification
**Time:** 30 minutes
**Cost:** FREE

1. Go to **https://console.firebase.google.com**
2. Select your project: `lynkapp-app`
3. Go to **Authentication → Templates**
4. Click **"Email address verification"**
5. Customize the email:
   - Subject: `Verify your LynkApp email address`
   - From name: `LynkApp`
   - Reply-to: `support@lynkapp.com`
6. Click **"Save"**
7. Open `ConnectHub-Frontend/src/services/auth-service.js`
8. The `sendEmailVerification` call is already coded
9. Verify this line exists in your sign-up flow:
```js
await sendEmailVerification(auth.currentUser);
```
10. Test by creating a new account — check email for verification link
11. ✅ Done — users must verify email before full access

---

### 🟡 STEP 7: Add Giphy API (GIFs in Messages)
**Time:** 2 hours
**Cost:** FREE (100 req/hour)

1. Go to **https://developers.giphy.com**
2. Click **"Create an App"**
3. Select **"API"** (not SDK)
4. App name: `LynkApp`
5. App description: `Social media platform for content creators`
6. Click **"Create App"**
7. Copy your **API Key**
8. Open `ConnectHub-SPA/.env` and add:
```
VITE_GIPHY_API_KEY=your_giphy_key_here
```
9. Create file `ConnectHub-SPA/src/services/giphy-service.js`:
```js
const API_KEY = import.meta.env.VITE_GIPHY_API_KEY;
const BASE = 'https://api.giphy.com/v1/gifs';

export const giphyService = {
  async trending(limit = 20) {
    const r = await fetch(`${BASE}/trending?api_key=${API_KEY}&limit=${limit}&rating=pg-13`);
    const d = await r.json();
    return d.data;
  },
  async search(query, limit = 20) {
    const r = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}&api_key=${API_KEY}&limit=${limit}&rating=pg-13`);
    const d = await r.json();
    return d.data;
  },
  getImageUrl(gif, size = 'fixed_height') {
    return gif.images[size]?.url || gif.images.original.url;
  }
};
```
10. Add a GIF picker button to `ConnectHub-SPA/src/pages/messages/MessagesPage.jsx` in the message input bar
11. When clicked, show a grid of trending GIFs with a search bar
12. On GIF click, send the image URL as a message
13. ✅ Done — users can send GIFs in Messages

---

### 🟡 STEP 8: Add RAWG Games API (Gaming Hub)
**Time:** 3 hours
**Cost:** FREE (20,000 req/month)

1. Go to **https://rawg.io/apidocs**
2. Click **"Get API Key"**
3. Sign up with email
4. Your key is shown on the API page
5. Open `ConnectHub-SPA/.env` and add:
```
VITE_RAWG_API_KEY=your_rawg_key_here
```
6. Create file `ConnectHub-SPA/src/services/rawg-service.js`:
```js
const KEY = import.meta.env.VITE_RAWG_API_KEY;
const BASE = 'https://api.rawg.io/api';

export const rawgService = {
  async trending() {
    const r = await fetch(`${BASE}/games?key=${KEY}&ordering=-added&page_size=20`);
    return (await r.json()).results;
  },
  async topRated() {
    const r = await fetch(`${BASE}/games?key=${KEY}&metacritic=80,100&ordering=-metacritic&page_size=20`);
    return (await r.json()).results;
  },
  async search(query) {
    const r = await fetch(`${BASE}/games?key=${KEY}&search=${encodeURIComponent(query)}&page_size=20`);
    return (await r.json()).results;
  },
  async getGame(id) {
    const r = await fetch(`${BASE}/games/${id}?key=${KEY}`);
    return r.json();
  },
  async getScreenshots(id) {
    const r = await fetch(`${BASE}/games/${id}/screenshots?key=${KEY}`);
    return (await r.json()).results;
  }
};
```
7. Update Gaming Hub page to import and use `rawgService.trending()`
8. Show game cards with cover image, rating, platform icons
9. ✅ Done — Gaming Hub shows 500K+ real games

---

### 🟡 STEP 9: Add TMDB (Movies/TV in Media Hub)
**Time:** 2 hours
**Cost:** FREE (unlimited reads)

1. Go to **https://www.themoviedb.org/settings/api**
2. Create an account (free)
3. Click **"Request an API Key"** → Select **"Developer"**
4. Fill out: App name `LynkApp`, URL `https://lynkapp.com`, app description
5. You get an **API Key (v3 auth)** immediately
6. Open `ConnectHub-SPA/.env` and add:
```
VITE_TMDB_API_KEY=your_tmdb_key_here
VITE_TMDB_BASE_IMAGE=https://image.tmdb.org/t/p/w500
```
7. Create file `ConnectHub-SPA/src/services/tmdb-service.js`:
```js
const KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p/w500';

export const tmdbService = {
  async trendingMovies() {
    const r = await fetch(`${BASE}/trending/movie/week?api_key=${KEY}`);
    return (await r.json()).results;
  },
  async trendingTV() {
    const r = await fetch(`${BASE}/trending/tv/week?api_key=${KEY}`);
    return (await r.json()).results;
  },
  async popularMovies() {
    const r = await fetch(`${BASE}/movie/popular?api_key=${KEY}`);
    return (await r.json()).results;
  },
  async getTrailers(movieId) {
    const r = await fetch(`${BASE}/movie/${movieId}/videos?api_key=${KEY}`);
    const vids = (await r.json()).results;
    return vids.filter(v => v.site === 'YouTube' && v.type === 'Trailer');
  },
  posterUrl(path) { return path ? `${IMG}${path}` : null; }
};
```
8. Update `ConnectHub-SPA/src/pages/mediahub/MediaHubPage.jsx` to show trending movies/TV
9. ✅ Done — Media Hub has real movie and TV data with posters and trailers

---

### 🟡 STEP 10: Add Unsplash (Stock Photos for Empty States)
**Time:** 1 hour
**Cost:** FREE (50 req/hour)

1. Go to **https://unsplash.com/developers**
2. Click **"Register as a developer"**
3. Create account → **"New Application"**
4. App name: `LynkApp`, description: `Social media platform`
5. Accept terms → Create application
6. Copy the **Access Key**
7. Open `ConnectHub-SPA/.env` and add:
```
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_key_here
```
8. Create file `ConnectHub-SPA/src/services/unsplash-service.js`:
```js
const KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const BASE = 'https://api.unsplash.com';

export const unsplashService = {
  async random(query = 'social media', count = 1) {
    const r = await fetch(`${BASE}/photos/random?query=${query}&count=${count}&client_id=${KEY}`);
    return r.json();
  },
  async search(query, page = 1) {
    const r = await fetch(`${BASE}/search/photos?query=${query}&page=${page}&per_page=20&client_id=${KEY}`);
    return (await r.json()).results;
  },
  getUrl(photo, size = 'regular') {
    return photo?.urls?.[size] || photo?.urls?.regular;
  }
};
```
9. Use in empty feed states, event default covers, onboarding backgrounds
10. ✅ Done — beautiful fallback photos everywhere

---

### 🟡 STEP 11: Add Pexels (Free Stock Videos)
**Time:** 1 hour
**Cost:** FREE (200 req/hour)

1. Go to **https://www.pexels.com/api/**
2. Click **"Get Started"**
3. Create account → **"Your API Key"** is shown immediately
4. Open `ConnectHub-SPA/.env` and add:
```
VITE_PEXELS_API_KEY=your_pexels_key_here
```
5. Create file `ConnectHub-SPA/src/services/pexels-service.js`:
```js
const KEY = import.meta.env.VITE_PEXELS_API_KEY;
const BASE = 'https://api.pexels.com';

export const pexelsService = {
  async popularVideos(perPage = 15) {
    const r = await fetch(`${BASE}/videos/popular?per_page=${perPage}`, {
      headers: { Authorization: KEY }
    });
    return (await r.json()).videos;
  },
  async searchVideos(query) {
    const r = await fetch(`${BASE}/videos/search?query=${encodeURIComponent(query)}&per_page=15`, {
      headers: { Authorization: KEY }
    });
    return (await r.json()).videos;
  },
  async searchPhotos(query) {
    const r = await fetch(`${BASE}/v1/search?query=${encodeURIComponent(query)}&per_page=20`, {
      headers: { Authorization: KEY }
    });
    return (await r.json()).photos;
  }
};
```
6. Use in the Videos tab of Media Hub
7. ✅ Done — Video section has real, licensable stock videos

---

### 🟡 STEP 12: Add Open-Meteo Weather (No Key — Events Page)
**Time:** 1 hour
**Cost:** FREE, unlimited, no key

1. No signup needed — works immediately
2. Create file `ConnectHub-SPA/src/services/weather-service.js`:
```js
export const weatherService = {
  async getByCoords(lat, lng) {
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,weathercode&timezone=auto`
    );
    const data = await r.json();
    return {
      temp: Math.round(data.current_weather.temperature * 9/5 + 32), // Convert to °F
      windspeed: data.current_weather.windspeed,
      code: data.current_weather.weathercode,
      emoji: weatherService.codeToEmoji(data.current_weather.weathercode)
    };
  },
  codeToEmoji(code) {
    if (code === 0) return '☀️';
    if (code <= 2) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌦️';
    return '⛈️';
  }
};
```
3. Add geolocation in Events page before fetching weather:
```js
navigator.geolocation.getCurrentPosition(async (pos) => {
  const weather = await weatherService.getByCoords(
    pos.coords.latitude, pos.coords.longitude
  );
  setEventWeather(weather);
});
```
4. Display in Events: `{weather.emoji} {weather.temp}°F`
5. ✅ Done — Events show local weather with no API key

---

### 🟡 STEP 13: Add ipapi.co Auto-Geolocation (No Key)
**Time:** 30 minutes
**Cost:** FREE, no key

1. No signup needed
2. Create file `ConnectHub-SPA/src/services/geo-service.js`:
```js
let cachedGeo = null;

export const geoService = {
  async detect() {
    if (cachedGeo) return cachedGeo;
    try {
      const r = await fetch('https://ipapi.co/json/');
      cachedGeo = await r.json();
      return cachedGeo;
    } catch {
      return { country_code: 'US', city: 'Unknown', currency: 'USD', timezone: 'America/New_York' };
    }
  },
  getCurrency: async () => (await geoService.detect()).currency,
  getCountry: async () => (await geoService.detect()).country_code,
  getTimezone: async () => (await geoService.detect()).timezone,
  getCity: async () => (await geoService.detect()).city,
};
```
3. Call at app startup in `ConnectHub-SPA/src/App.jsx`:
```js
import { geoService } from './services/geo-service';
useEffect(() => { geoService.detect(); }, []); // Pre-warm cache
```
4. Use in Marketplace: `const currency = await geoService.getCurrency();`
5. Use in News: load news for user's country automatically
6. ✅ Done — app automatically localizes for the user

---

### 🟡 STEP 14: Add DiceBear Auto-Avatars (No Key)
**Time:** 30 minutes
**Cost:** FREE, no key

1. No signup needed
2. Add to `ConnectHub-SPA/src/services/avatar-service.js` (create if not exists):
```js
export const avatarService = {
  generate(seed, style = 'avataaars') {
    const styles = ['avataaars', 'fun-emoji', 'personas', 'pixel-art', 'big-ears', 'notionists'];
    const selectedStyle = style === 'random'
      ? styles[Math.floor(Math.random() * styles.length)]
      : style;
    return `https://api.dicebear.com/8.x/${selectedStyle}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  },
  generateForUser(username) {
    return avatarService.generate(username, 'avataaars');
  },
  generateForGroup(groupName) {
    return avatarService.generate(groupName, 'bottts');
  }
};
```
3. Use in `ProfilePage.jsx` when user has no profile photo:
```js
const avatarUrl = user.photoURL || avatarService.generateForUser(user.displayName || user.uid);
```
4. Use in Groups when a group has no cover image
5. ✅ Done — every user and group always has a visual identity

---

### 🟡 STEP 15: Add OpenStreetMap + Leaflet Maps
**Time:** 2 hours
**Cost:** FREE, no key

1. Install packages:
```bash
cd ConnectHub-SPA
npm install leaflet react-leaflet
```
2. Add Leaflet CSS to `ConnectHub-SPA/index.html` in `<head>`:
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
```
3. Open `ConnectHub-SPA/src/pages/marketplace/MapViewModal.jsx`
4. Replace the placeholder with:
```jsx
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon (Leaflet/Vite issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// In your component:
<MapContainer center={[lat, lng]} zoom={13} style={{ height: '300px', width: '100%', borderRadius: '12px' }}>
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
  <Marker position={[lat, lng]}>
    <Popup>{locationName}</Popup>
  </Marker>
  <Circle center={[lat, lng]} radius={5000} color="#7c3aed" fillOpacity={0.1} />
</MapContainer>
```
5. Use the same approach in Events page for event location maps
6. ✅ Done — real interactive maps in Marketplace and Events

---

### 🟡 STEP 16: Add Spotify Music Metadata (Display Only — Free)
**Time:** 2 hours
**Cost:** FREE for metadata reads

1. Go to **https://developer.spotify.com/dashboard**
2. Log in with your Spotify account (create one free if needed)
3. Click **"Create App"**
4. App name: `LynkApp`, Description: `Social music features`, Redirect URI: `http://localhost:5175/callback`
5. Copy **Client ID** and **Client Secret**
6. Open `ConnectHub-SPA/.env` and add:
```
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret
```
7. Create `ConnectHub-SPA/src/services/spotify-service.js`:
```js
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
let token = null;
let tokenExpiry = 0;

async function getToken() {
  if (token && Date.now() < tokenExpiry) return token;
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
    },
    body: 'grant_type=client_credentials'
  });
  const data = await r.json();
  token = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
  return token;
}

export const spotifyService = {
  async search(query, type = 'track') {
    const t = await getToken();
    const r = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=10`, {
      headers: { Authorization: `Bearer ${t}` }
    });
    return r.json();
  },
  async getNewReleases() {
    const t = await getToken();
    const r = await fetch('https://api.spotify.com/v1/browse/new-releases?limit=20', {
      headers: { Authorization: `Bearer ${t}` }
    });
    return (await r.json()).albums?.items || [];
  },
  async getArtist(id) {
    const t = await getToken();
    const r = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
      headers: { Authorization: `Bearer ${t}` }
    });
    return r.json();
  }
};
```
8. Use to show song metadata next to YouTube music player — real album art, track info
9. ✅ Done — music player shows real Spotify metadata

---

### 🟡 STEP 17: Add CoinGecko Crypto Prices (No Key)
**Time:** 1 hour
**Cost:** FREE, no key

1. No signup needed
2. Create `ConnectHub-SPA/src/services/crypto-service.js`:
```js
const BASE = 'https://api.coingecko.com/api/v3';
let cache = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cryptoService = {
  async getTop10() {
    if (cache && Date.now() - cacheTime < CACHE_DURATION) return cache;
    const r = await fetch(
      `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true`
    );
    cache = await r.json();
    cacheTime = Date.now();
    return cache;
  },
  async getCoin(id) {
    const r = await fetch(`${BASE}/coins/${id}?localization=false&tickers=false&community_data=false`);
    return r.json();
  },
  formatPrice(price) {
    return price < 1 ? `$${price.toFixed(6)}` : `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },
  formatChange(change) {
    const sign = change >= 0 ? '▲' : '▼';
    return `${sign} ${Math.abs(change).toFixed(2)}%`;
  }
};
```
3. Add a "Crypto Prices" widget to the Business Profile dashboard
4. ✅ Done — Business section shows live crypto prices

---

### 🟡 STEP 18: Add Pixabay (More Stock Photos/Videos — Free)
**Time:** 30 minutes
**Cost:** FREE (5,000 req/hour)

1. Go to **https://pixabay.com/api/docs/**
2. Click **"Join the API"** (free account)
3. Your API key appears at the top of the docs page
4. Open `ConnectHub-SPA/.env` and add:
```
VITE_PIXABAY_API_KEY=your_pixabay_key_here
```
5. Create `ConnectHub-SPA/src/services/pixabay-service.js`:
```js
const KEY = import.meta.env.VITE_PIXABAY_API_KEY;
const BASE = 'https://pixabay.com/api';

export const pixabayService = {
  async searchPhotos(query, perPage = 20) {
    const r = await fetch(`${BASE}/?key=${KEY}&q=${encodeURIComponent(query)}&per_page=${perPage}&image_type=photo&safesearch=true`);
    return (await r.json()).hits;
  },
  async searchVideos(query, perPage = 15) {
    const r = await fetch(`${BASE}/videos/?key=${KEY}&q=${encodeURIComponent(query)}&per_page=${perPage}`);
    return (await r.json()).hits;
  }
};
```
6. Use as fallback when Pexels or Unsplash quotas are hit
7. ✅ Done — triple stock media coverage (Unsplash + Pexels + Pixabay)

---

## 🆕 SECTION 4 — 35 MORE BONUS FREE APIS (New Additions)

These are IN ADDITION to the 25 already documented in `MASTER-API-PLAN-AND-STATUS-MAY2026.md`.

---

### 🎯 BATCH 1 — Social & Community Features

#### NEW-1. 🐦 Mastodon API (Twitter Alternative Social Feed)
- **Cost:** FREE, no key needed for public content
- **Adds:** Real social posts from Mastodon (federated Twitter alternative) for Trending
- **Call:** `https://mastodon.social/api/v1/timelines/public?limit=20`
- **No account needed** for reading public timeline
- **Better than Twitter** — free, no rate limits on public data

#### NEW-2. 🗞️ HackerNews API (Tech News — NO KEY)
- **Cost:** FREE, no key
- **Call:** `https://hacker-news.firebaseio.com/v0/topstories.json`
- **Then per story:** `https://hacker-news.firebaseio.com/v0/item/STORY_ID.json`
- **Adds:** Tech/startup news for the Trending section, tech-savvy users
- **Real-time:** Updates every few minutes

#### NEW-3. 📰 The Guardian API (Quality News — Free)
- **Cost:** FREE — 12 req/sec, unlimited articles
- **Sign up:** https://open-platform.theguardian.com/access/ → Takes 2 minutes
- **Adds:** High-quality journalism backup for news section
- **Add to .env:** `VITE_GUARDIAN_API_KEY=your_key`
- **Endpoint:** `https://content.guardianapis.com/search?api-key=KEY&q=TOPIC`

#### NEW-4. 📻 NPR News API (US News — Free)
- **Cost:** FREE
- **Sign up:** https://api.npr.org → 2 minutes
- **Adds:** Audio news stories — users can listen to news in the app
- **Add to .env:** `VITE_NPR_API_KEY=your_key`

#### NEW-5. 🌐 Dev.to API (Developer Content — NO KEY)
- **Cost:** FREE, no key
- **Call:** `https://dev.to/api/articles?per_page=20&tag=javascript`
- **Adds:** Tech/dev articles for tech-focused users
- **No signup needed** — returns full article data

---

### 🎯 BATCH 2 — Entertainment & Media

#### NEW-6. 📺 YouTube Data API v3 Additional Uses (Already Have Key)
- **You already have:** `VITE_YOUTUBE_API_KEY` in .env
- **Add these new endpoints you're not using yet:**
  - `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=20&key=KEY` — Trending YouTube videos
  - `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=QUERY&type=video&key=KEY` — Video search
  - `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=CHANNEL_ID&key=KEY` — Creator profiles
- **Adds:** Real trending videos for the Videos section — no new key needed

#### NEW-7. 🎬 Vimeo API (Creative Video Content — Free)
- **Cost:** FREE — read-only public data
- **Sign up:** https://developer.vimeo.com → 5 minutes
- **Adds:** High-quality creative/art videos (better quality than YouTube for creative content)
- **Add to .env:** `VITE_VIMEO_TOKEN=your_client_token`

#### NEW-8. 🎵 Deezer API (Music Metadata — NO KEY NEEDED)
- **Cost:** FREE, no key for public data
- **Call:** `https://api.deezer.com/chart/0/tracks?limit=20` — Top 20 tracks
- **Call:** `https://api.deezer.com/search?q=QUERY` — Music search
- **Adds:** Backup music metadata (album art, track info) — complements Spotify
- **30-second preview URLs included** — can play audio snippets

#### NEW-9. 📻 Radio Browser API (Free Radio Streams — NO KEY)
- **Cost:** FREE, no key
- **Call:** `https://de1.api.radio-browser.info/json/stations/topvote/20` — Top 20 radio stations
- **Adds:** Live radio streaming option in the music player
- **50,000+ stations worldwide** with stream URLs

#### NEW-10. 🎮 FreeToGame API (Free-to-Play Games — NO KEY)
- **Cost:** FREE, no key
- **Call:** `https://www.freetogame.com/api/games` — all free-to-play games
- **Call:** `https://www.freetogame.com/api/games?category=shooter` — by genre
- **Adds:** Free game recommendations in Gaming Hub

---

### 🎯 BATCH 3 — E-Commerce & Finance

#### NEW-11. 💹 Financial Modeling Prep API (Stocks — Free Tier)
- **Cost:** Free — 250 req/day
- **Sign up:** https://site.financialmodelingprep.com/developer/docs → 2 minutes
- **Adds:** More comprehensive stock data than Alpha Vantage
- **Add to .env:** `VITE_FMP_API_KEY=your_key`

#### NEW-12. 🛒 Best Buy Products API
- **Cost:** FREE — 5 req/sec
- **Sign up:** https://bestbuyapis.github.io/api-documentation/
- **Adds:** Real product listings for Marketplace comparison
- **Add to .env:** `VITE_BESTBUY_API_KEY=your_key`

#### NEW-13. 📦 ShipEngine Shipping Rates (Free Trial — Good for Marketplace)
- **Cost:** Free tier available — 500 free API calls
- **Sign up:** https://shipengine.com → "Start for free"
- **Adds:** Real shipping cost calculator for Marketplace listings
- **Add to .env:** `VITE_SHIPENGINE_API_KEY=your_key`
- **Note:** Already have shipping-rates service file — connect it here

#### NEW-14. 💱 Fixer.io (Currency Exchange — Free Tier)
- **Cost:** Free — 100 req/month
- **Sign up:** https://fixer.io → free plan
- **Better than ExchangeRate-API** — more currencies, historical data
- **Add to .env:** `VITE_FIXER_API_KEY=your_key`

---

### 🎯 BATCH 4 — Health, Fitness & Lifestyle

#### NEW-15. 🏃 Wger Workout Manager API (Exercise Data — NO KEY)
- **Cost:** FREE, no key
- **Call:** `https://wger.de/api/v2/exercise/?format=json&language=2&limit=20`
- **Adds:** Free exercise database (alternative to ExerciseDB)
- **Languages:** English, German, Spanish + more

#### NEW-16. 🧘 Meditopia API / Calm Affirmations (Wellness Content)
- **Cost:** FREE quotes from multiple sources
- **Call:** `https://zenquotes.io/api/random` — random mindfulness quote, NO KEY
- **Also:** `https://type.fit/api/quotes` — 1600+ inspirational quotes, NO KEY
- **Adds:** Daily affirmation/quote widget for the Feed's wellness section

#### NEW-17. 🍎 USDA Food Database (Nutrition — NO KEY)
- **Cost:** FREE, no key
- **Call:** `https://api.nal.usda.gov/fdc/v1/foods/search?query=apple&api_key=DEMO_KEY`
- **Note:** DEMO_KEY works for testing, or sign up at fdc.nal.usda.gov for higher limits
- **Adds:** Detailed nutrition facts for food posts

#### NEW-18. 💊 Open FDA (Drug/Health Data)
- **Cost:** FREE, no key for basic use
- **Call:** `https://api.fda.gov/drug/label.json?search=brand_name:aspirin`
- **Adds:** Health/wellness content verification, medication info widget

---

### 🎯 BATCH 5 — Location & Travel

#### NEW-19. 🗺️ Nominatim Geocoding (OpenStreetMap Geocoder — NO KEY)
- **Cost:** FREE, no key, no account
- **Call:** `https://nominatim.openstreetmap.org/search?q=New+York&format=json&addressdetails=1`
- **Adds:** Convert any address to lat/lng for FREE (Geoapify backup)
- **Reverse:** `https://nominatim.openstreetmap.org/reverse?lat=40.7&lon=-74.0&format=json`

#### NEW-20. 🌐 Country.is (Country from IP — NO KEY)
- **Cost:** FREE, no key
- **Call:** `https://api.country.is/` — returns `{ country: "US" }` from IP
- **Simpler than ipapi.co** if you only need country code
- **Great for:** Marketplace international shipping checks, content geo-restrictions

#### NEW-21. ✈️ OpenSky Network (Real Flight Data — NO KEY)
- **Cost:** FREE, no key for public data
- **Call:** `https://opensky-network.org/api/states/all?lamin=45&lomin=5&lamax=48&lomax=11`
- **Adds:** Live flight tracking for travel posts, airport nearby events
- **Better than Aviation Stack** — unlimited free calls

#### NEW-22. 🏨 Hotels.com Public API
- **Cost:** Available via RapidAPI free tier
- **Adds:** Hotel/accommodation search for Travel section, Events section
- **Note:** Requires `VITE_RAPIDAPI_KEY` (one key for all RapidAPI services)

---

### 🎯 BATCH 6 — Development Tools & Utilities

#### NEW-23. 🔑 Have I Been Pwned (Security Check — Free)
- **Cost:** FREE for personal/non-commercial
- **Call:** `https://haveibeenpwned.com/api/v3/breachedaccount/EMAIL`
- **Adds:** Security alert when user signs up with a compromised email
- **Add to security features** in Settings → Security section

#### NEW-24. 📊 Mockaroo (Realistic Test Data — Free)
- **Cost:** Free — 200 records/day
- **Sign up:** https://mockaroo.com → free account
- **Adds:** Realistic test data for development, demo mode, admin previews
- **Add to .env:** `VITE_MOCKAROO_API_KEY=your_key`

#### NEW-25. 🤖 HuggingFace Inference API (AI — Free Tier)
- **Cost:** FREE tier available
- **Sign up:** https://huggingface.co → free account
- **Adds:** AI text generation, sentiment analysis, image classification
- **Use case:** Auto-caption photos, sentiment analysis on posts for content moderation
- **Add to .env:** `VITE_HUGGINGFACE_API_KEY=your_key`

#### NEW-26. 📝 Notion API (Content Management)
- **Cost:** FREE
- **Sign up:** https://www.notion.so/my-integrations
- **Adds:** Use Notion as a CMS for help articles, blog posts, FAQ content
- **Add to .env:** `VITE_NOTION_API_KEY=your_key`

---

### 🎯 BATCH 7 — Fun & Engagement

#### NEW-27. 🎲 Numbers API (Fun Facts — NO KEY)
- **Cost:** FREE, no key
- **Call:** `http://numbersapi.com/42` — fact about the number 42
- **Call:** `http://numbersapi.com/5/17/date` — fact about May 17th
- **Adds:** Fun "Did you know?" widget in Feed, birthday facts, anniversary facts

#### NEW-28. 🧑‍🎨 Robohash (Robot Avatars — NO KEY)
- **Cost:** FREE, no key
- **URL:** `https://robohash.org/USERNAME.png?size=200x200`
- **Sets:** robots, monsters, robot heads, cats (set=set1/set2/set3/set4)
- **Alternative to DiceBear** — more whimsical/fun for gaming usernames

#### NEW-29. 📅 Holiday API (Public Holidays — Free Tier)
- **Cost:** Free — 12,500 req/year (about 34/day)
- **Sign up:** https://holidayapi.com → free plan
- **Adds:** Show upcoming public holidays in Events section
- **Add to .env:** `VITE_HOLIDAY_API_KEY=your_key`

#### NEW-30. 🌟 Forismatic API (Motivational Quotes — NO KEY)
- **Cost:** FREE, no key
- **Call:** `https://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=json`
- **Adds:** Daily motivational quote in the Feed header
- **Alternative to zenquotes.io** — 500,000+ quotes

#### NEW-31. 🎴 Pokémon API (PokéAPI — NO KEY)
- **Cost:** FREE forever, no key
- **Call:** `https://pokeapi.co/api/v2/pokemon/pikachu`
- **Adds:** Fun Pokémon gaming section, quiz games, profile badges
- **50,000+ req/day** allowed per IP — very generous

#### NEW-32. 🐱 Cat Facts API (Fun Content — NO KEY)
- **Cost:** FREE, no key
- **Call:** `https://catfact.ninja/fact` — random cat fact
- **Also:** `https://dog.ceo/api/breeds/image/random` — random dog photo
- **Adds:** Fun "Pet Corner" section, animal lovers community

#### NEW-33. 🎭 Character.AI / Fiction API (Storytelling — Free)
- **Cost:** FREE tier
- **Adds:** AI-generated story prompts for creative writing section
- **Via HuggingFace:** `https://api-inference.huggingface.co/models/gpt2`

---

### 🎯 BATCH 8 — Business & Productivity

#### NEW-34. 📊 Google Sheets API (Admin Tracking — Free)
- **Cost:** FREE (you already use Google services)
- **Sign up:** Same Google account as GA4
- **Adds:** Export app analytics to a Google Sheet for non-technical team members
- **Use case:** Business metrics dashboard that updates in real-time

#### NEW-35. 📧 Hunter.io (Email Finder — Free Tier)
- **Cost:** Free — 25 searches/month
- **Sign up:** https://hunter.io → free account
- **Adds:** Verify business email addresses for Business Profile verification
- **Add to .env:** `VITE_HUNTER_API_KEY=your_key`

---

## 📊 SECTION 5 — UPDATED COMPLETE API INVENTORY

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKING RIGHT NOW (10 APIs):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Firebase (Auth/DB/Storage)  ✅  In .env
YouTube Data API v3         ✅  VITE_YOUTUBE_API_KEY
Reddit Public JSON          ✅  NO KEY
NewsAPI                     ✅  VITE_NEWS_API_KEY
MediaStack                  ✅  VITE_MEDIASTACK_KEY
Cloudinary                  ✅  VITE_CLOUDINARY_*
OneSignal Push              ✅  VITE_ONESIGNAL_*
OpenAI (backend)            ✅  OPENAI_API_KEY
DeepAR (AR filters)         ✅  VITE_DEEPAR_KEY
Stripe (Test)               ✅  VITE_STRIPE_KEY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL MISSING (must do before launch):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stripe LIVE key             ❌  See Step 1 above
Google AdSense              ❌  See Step 2 above
Google Analytics 4          ❌  See Step 3 above
Sentry error tracking       ❌  See Step 4 above
Firebase Rules deployed     ❌  See Step 5 above
Firebase email verify       ❌  See Step 6 above

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BONUS FREE — NO KEY NEEDED (add today, 0 signup):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Open-Meteo weather          🟢  See Step 12
ipapi.co geolocation        🟢  See Step 13
DiceBear avatars            🟢  See Step 14
OpenStreetMap/Leaflet maps  🟢  See Step 15 (npm install)
CoinGecko crypto            🟢  See Step 17
Open Library books          🟢  No key
RestCountries               🟢  No key
WorldTimeAPI timezones      🟢  No key
Open Trivia DB quiz         🟢  No key
BoredAPI activities         🟢  No key
ExchangeRate-API currency   🟢  No key
Dictionary API              🟢  No key
RandomUser.me test data     🟢  No key
ColourLovers palettes       🟢  No key
Joke API humor              🟢  No key
Mastodon social feed        🟢  No key (NEW)
HackerNews tech news        🟢  No key (NEW)
Deezer music metadata       🟢  No key (NEW)
Radio Browser streams       🟢  No key (NEW)
FreeToGame gaming           🟢  No key (NEW)
Nominatim geocoding         🟢  No key (NEW)
Country.is IP lookup        🟢  No key (NEW)
OpenSky flights             🟢  No key (NEW)
Numbers API fun facts       🟢  No key (NEW)
Robohash avatars            🟢  No key (NEW)
PokéAPI gaming              🟢  No key (NEW)
Cat/Dog Facts fun           🟢  No key (NEW)
Forismatic quotes           🟢  No key (NEW)
ZenQuotes wellness          🟢  No key (NEW)
Type.fit quotes             🟢  No key (NEW)
USDA Food data              🟢  DEMO key works (NEW)
Dev.to tech articles        🟢  No key (NEW)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BONUS FREE — QUICK SIGNUP (5-10 min each):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Giphy GIFs                  🟡  See Step 7 (2 min signup)
RAWG games                  🟡  See Step 8 (2 min signup)
TMDB movies/TV              🟡  See Step 9 (5 min signup)
Unsplash photos             🟡  See Step 10 (2 min signup)
Pexels videos/photos        🟡  See Step 11 (2 min signup)
Spotify metadata            🟡  See Step 16 (5 min signup)
Pixabay media               🟡  See Step 18 (2 min signup)
GNews backup news           🟡  2 min signup
Jamendo music backup        🟡  5 min signup
Geoapify geocoding          🟡  2 min signup
Alpha Vantage stocks        🟡  2 min signup
Spoonacular food            🟡  2 min signup
Abstract email verify       🟡  2 min signup
ExerciseDB fitness          🟡  Via RapidAPI
Edamam nutrition            🟡  5 min signup
The Guardian news           🟡  2 min signup (NEW)
NPR audio news              🟡  2 min signup (NEW)
Vimeo video                 🟡  5 min signup (NEW)
HuggingFace AI              🟡  2 min signup (NEW)
Financial Modeling Prep     🟡  2 min signup (NEW)
ShipEngine shipping         🟡  5 min signup (NEW)
Holiday API                 🟡  2 min signup (NEW)
Hunter.io email verify      🟡  2 min signup (NEW)
Have I Been Pwned security  🟡  No key for basic (NEW)
Notion CMS                  🟡  5 min if you use Notion (NEW)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SKIP FOR NOW — POST-LAUNCH REVENUE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AppLovin MAX ads            ⏸️  Need 10K+ daily users first
IronSource/Unity Ads        ⏸️  Same
Twilio SMS 2FA              ⏸️  $0.0075/SMS
SendGrid transactional      ⏸️  100 free/day
Apple APNS push             ⏸️  Need $99/yr Apple Dev account
```

---

## 🗓️ SECTION 6 — MASTER ACTION CHECKLIST

### 🔴 Do This Week (Critical Path):
- [ ] **Step 1:** Activate Stripe LIVE key at dashboard.stripe.com (30 min)
- [ ] **Step 2:** Apply for Google AdSense TODAY (takes weeks — start NOW)
- [ ] **Step 3:** Set up Google Analytics 4 (30 min, free)
- [ ] **Step 4:** Set up Sentry error tracking (1 hour, free)
- [ ] **Step 5:** Deploy Firebase Security Rules (1 hour)
- [ ] **Step 6:** Enable Firebase email verification (30 min)

### 🟡 Do This Week (High Value, Easy):
- [ ] **Step 12:** Add Open-Meteo to Events (no key, 1 hour)
- [ ] **Step 13:** Add ipapi.co geolocation (no key, 30 min)
- [ ] **Step 14:** Add DiceBear auto-avatars (no key, 30 min)
- [ ] **Step 15:** Wire Leaflet maps (npm install, 2 hours)
- [ ] **Step 17:** Add CoinGecko crypto widget (no key, 1 hour)
- [ ] Add Mastodon public feed to Trending (no key, 1 hour)
- [ ] Add HackerNews to Trending tech tab (no key, 30 min)
- [ ] Add Deezer 30-sec previews to music player (no key, 1 hour)
- [ ] Add Radio Browser to music player (no key, 1 hour)

### 🟡 Do Next Week (Signup Required):
- [ ] **Step 7:** Sign up Giphy — GIFs in Messages
- [ ] **Step 8:** Sign up RAWG — real gaming hub data
- [ ] **Step 9:** Sign up TMDB — movies/TV in Media Hub
- [ ] **Step 10:** Sign up Unsplash — stock photos
- [ ] **Step 11:** Sign up Pexels — stock videos
- [ ] **Step 16:** Sign up Spotify — music metadata
- [ ] **Step 18:** Sign up Pixabay — more stock media

### 🟢 Do Before Beta Launch:
- [ ] All critical steps above completed
- [ ] HTTPS on lynkapp.com working via CloudFront
- [ ] Test 10+ user accounts end-to-end
- [ ] Sentry showing clean (no uncaught errors)
- [ ] GA4 showing traffic data
- [ ] Stripe test payment succeeds

---

## 💰 SECTION 7 — MONTHLY COST AFTER ALL OPTIMIZATIONS

| Category | Before | After | Notes |
|----------|--------|-------|-------|
| Firebase | $0 | $0 | Spark plan |
| YouTube API | $0 | $0 | Already have key |
| Reddit/Mastodon/HN | ~~$100/mo~~ | **$0** | Free public APIs |
| FeedFM music | ~~$99/mo~~ | **$0** | Replaced with YouTube+Deezer+Radio |
| OpenAI moderation | ~$5-20/mo | ~$5-20/mo | Pay per use |
| DeepAR AR | ~$0 (dev) | ~$99/mo | After launch |
| Stripe fees | 2.9%+$0.30 | 2.9%+$0.30 | Per transaction |
| AWS S3+CloudFront | ~$5-15/mo | ~$5-15/mo | Static hosting |
| All new free APIs | $0 | **$0** | 60+ free APIs |
| **TOTAL SAVED** | **$200+/mo** | | Twitter + FeedFM gone |
| **NEW TOTAL** | | **~$10-35/mo** | Before transaction fees |

---

*Document created: May 18, 2026*
*GitHub: https://github.com/Watchdog088/Test-apps.git*
*App runs at: http://127.0.0.1:5175*
