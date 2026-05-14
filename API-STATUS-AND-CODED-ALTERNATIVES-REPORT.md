# 🔑 API Status Report — LynkApp / ConnectHub
**Generated:** May 14, 2026  
**Purpose:** Full inventory of APIs we have, APIs we're missing, and which missing ones can be coded away with free alternatives.

---

## ✅ SECTION 1 — APIs WE ALREADY HAVE (Keys Configured)

| API | Purpose | Status | Key Location |
|-----|---------|--------|-------------|
| **Firebase** | Auth, Firestore DB, Storage, Realtime | ✅ COMPLETE | `ConnectHub-SPA/.env` |
| **Stripe** | Payments (Marketplace, Subscriptions) | ✅ TEST MODE | `ConnectHub-SPA/.env` (test key only) |
| **DeepAR** | AR filters / camera effects | ✅ COMPLETE | `ConnectHub-SPA/.env` |
| **NewsAPI** | Trending news articles | ✅ COMPLETE | `ConnectHub-SPA/.env` |
| **MediaStack** | Additional news / trending | ✅ COMPLETE | `ConnectHub-SPA/.env` |
| **YouTube Data API v3** | Video content, music, trending | ✅ COMPLETE | `ConnectHub-SPA/.env` |
| **Cloudinary** | Media uploads (images, videos) | ✅ COMPLETE | `ConnectHub-SPA/.env` |
| **OneSignal** | Push notifications | ✅ COMPLETE | `ConnectHub-SPA/.env` |
| **OpenAI** | Content moderation (reports flow) | ✅ BACKEND ONLY | `ConnectHub-Backend/.env` |

---

## ❌ SECTION 2 — APIs WE ARE MISSING

| API | Purpose | Status | Cost |
|-----|---------|--------|------|
| **Google AdSense** | Banner / interstitial ads | ❌ MISSING publisher ID | Free (revenue share) |
| **AppLovin MAX** | Mobile ad mediation | ❌ MISSING SDK key | Free (revenue share) |
| **IronSource LevelPlay** | Mobile ad mediation | ❌ MISSING app key | Free (revenue share) |
| **FeedFM** | Licensed background music player | ❌ MISSING token/secret | Paid — $99+/mo |
| **Twitter/X API** | Social trending posts | ❌ MISSING bearer token | $100+/mo (Basic tier) |
| **Reddit API** | Community / trending posts | ❌ MISSING client ID | Free tier available |
| **Stripe LIVE key** | Production payments | ❌ TEST KEY ONLY | Free (2.9% + 30¢ per txn) |

---

## 🔧 SECTION 3 — WHAT CAN BE CODED AWAY (Free Alternatives)

### 1. ✅ REDDIT API — Can be 100% coded away (NO KEY NEEDED)

**Problem:** We're missing the Reddit OAuth client ID.  
**Solution:** Reddit publicly exposes JSON feeds for any subreddit **without any API key**:
```
GET https://www.reddit.com/r/popular.json?limit=25
GET https://www.reddit.com/r/technology.json?limit=10
GET https://www.reddit.com/search.json?q=trending&sort=hot
```
**Action:** Replace the Reddit OAuth calls with direct `.json` URL fetches — zero cost, no key, works today.

---

### 2. ✅ TWITTER/X API — Can be coded away using what we already have

**Problem:** Twitter API now costs $100+/month for the Basic tier.  
**Solution:** We already have **NewsAPI + MediaStack + YouTube** which together cover all trending content. Twitter-style trending can be simulated by:
- NewsAPI hot stories (already integrated ✅)
- YouTube trending videos (already integrated ✅)
- MediaStack breaking news (already integrated ✅)
- Reddit public JSON for social buzz (see #1 above)

**Action:** Remove Twitter dependency entirely. The Trending page already uses NewsAPI + YouTube — just ensure it never tries to call Twitter without a key (add a guard: `if (!import.meta.env.VITE_TWITTER_BEARER_TOKEN || VITE_TWITTER_BEARER_TOKEN.includes('MISSING')) return [];`).

---

### 3. ✅ FeedFM (Music) — Can be replaced with free alternatives

**Problem:** FeedFM costs $99+/month for licensed streaming music.  
**Solution options (all free):**

**Option A — YouTube Music Embed (BEST — we already have the key):**
```js
// Use existing VITE_YOUTUBE_API_KEY to fetch music playlists
// Search for "lofi hip hop radio" or "chill beats" live streams
// Embed via YouTube IFrame Player API (completely free)
```

**Option B — Jamendo API (Free, Creative Commons licensed music):**
```
GET https://api.jamendo.com/v3.0/tracks/?client_id=YOUR_FREE_ID&format=jsonpretty&limit=20&tags=chillout
```
Jamendo client IDs are free to register at jamendo.com/developers

**Option C — Web Audio API + royalty-free tracks:**
Store a small set of royalty-free mp3s in Firebase Storage (already have Cloudinary too) and play them with the built-in browser Web Audio API.

**Recommendation:** Use YouTube IFrame API — we already have the key, it has unlimited licensed music, and it's truly free.

---

### 4. ✅ ADS (AdSense / AppLovin / IronSource) — Already coded away with house-ads fallback

**Status:** The code in `ConnectHub-SPA/src/components/ads/AdUnit.jsx` and `src/services/ad-service.js` **already** has a fallback that shows gradient house-ads (app's own promotional content) when the AdSense publisher ID is missing.

**For beta testing:** The house-ad fallback is sufficient. No revenue will be generated but the UI looks identical.

**For production revenue:** Sign up for Google AdSense (free, takes ~1-2 weeks for approval) then add the publisher ID to `.env`. AppLovin and IronSource are optional supplements.

---

### 5. ⚠️ STRIPE LIVE KEY — Can't be coded away, but easy to get

**Problem:** We only have a test key (`pk_test_...`). Payments won't actually charge cards.  
**For beta testing:** This is fine — use the test key, testers use Stripe test card `4242 4242 4242 4242`.  
**For launch:** Log into [dashboard.stripe.com](https://dashboard.stripe.com), activate your account, and get the `pk_live_...` key. Free to sign up, 2.9% + 30¢ per transaction.

---

## 📋 SECTION 4 — PRIORITY ACTION PLAN

### 🟢 Do NOW (coded away — no cost, no signup):
- [ ] Add Reddit public JSON fallback (no key needed)
- [ ] Add Twitter/X guard (`if key missing, skip Twitter, use NewsAPI`)
- [ ] Switch music player to YouTube IFrame API (key already have)

### 🟡 Do BEFORE BETA (free signups):
- [ ] Sign up at [jamendo.com/developers](https://developer.jamendo.com/v3.0) (free music API)
- [ ] Sign up for [Reddit API](https://www.reddit.com/prefs/apps) (free tier, 100 req/min)
- [ ] Verify AdSense house-ad fallback is working (already coded)

### 🔴 Do BEFORE LAUNCH (paid/revenue):
- [ ] Activate Stripe account → get `pk_live_...` key
- [ ] Apply for Google AdSense → get publisher ID + slot IDs
- [ ] Decide if FeedFM ($99/mo) is needed vs YouTube music (free)

---

## 📊 SECTION 5 — FULL API INVENTORY SUMMARY

```
CORE INFRASTRUCTURE (all ✅ working):
  Firebase Auth        ✅  Keys in .env
  Firebase Firestore   ✅  Keys in .env
  Firebase Storage     ✅  Keys in .env
  Firebase Realtime DB ✅  Keys in .env

MEDIA & CONTENT (all ✅ working):
  Cloudinary           ✅  Keys in .env (images/video upload)
  YouTube Data API v3  ✅  Keys in .env (video + music content)
  NewsAPI              ✅  Keys in .env (trending news)
  MediaStack           ✅  Keys in .env (breaking news)
  DeepAR               ✅  License key in .env (AR filters)

PAYMENTS:
  Stripe (Test)        ✅  Test publishable key in .env
  Stripe (Live)        ❌  Need to activate Stripe account

NOTIFICATIONS:
  OneSignal            ✅  App ID + API key in .env

AI/MODERATION:
  OpenAI               ✅  In backend .env (not exposed to frontend)

ADS (all using house-ad fallback):
  Google AdSense       ❌  Need publisher approval (~1-2 weeks)
  AppLovin MAX         ❌  Optional — skip for now
  IronSource           ❌  Optional — skip for now

SOCIAL/TRENDING:
  Twitter/X            ❌  $100+/mo — REPLACE with NewsAPI + Reddit
  Reddit               ❌  Free — USE PUBLIC JSON (no key needed!)

MUSIC:
  FeedFM               ❌  $99/mo — REPLACE with YouTube IFrame API (free)
```

---

## ⚡ QUICK WINS — 3 Things We Can Fix In Code Today

1. **Reddit**: Change all Reddit API calls to use `https://www.reddit.com/r/popular.json` (no key)
2. **Twitter guard**: Add `if (!env.TWITTER_BEARER_TOKEN || env.TWITTER_BEARER_TOKEN.includes('MISSING')) return [];` before any Twitter fetch
3. **Music**: Replace FeedFM calls with YouTube IFrame API using our existing `VITE_YOUTUBE_API_KEY`

Want me to implement any of these right now?
