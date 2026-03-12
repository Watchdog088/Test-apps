# 📰 Trending & News APIs Setup Guide

**Complete step-by-step instructions for:**
- Reddit API
- MediaStack API  
- Currents API
- YouTube Data API

**Time:** 30-40 minutes total  
**Cost:** All have FREE tiers!

---

## 🎯 WHY YOU NEED THESE:

These APIs power your **Trending Content** section in LynkApp:
- **Reddit** - Trending posts, discussions, communities
- **MediaStack** - Real-time news from 7,500+ sources
- **Currents** - Breaking news & articles  
- **YouTube** - Trending videos, popular content

---

# 1. 🔴 REDDIT API SETUP

## **Overview:**
- **Cost:** FREE (60 requests/minute)
- **Time:** 10 minutes
- **Difficulty:** ⭐⭐ Medium
- **What You Get:** Client ID, Client Secret, Refresh Token

---

## **STEP 1: Create Reddit Account** (2 minutes)

1. Go to: https://www.reddit.com/register
2. Create account or login
3. Verify your email

---

## **STEP 2: Create Reddit App** (5 minutes)

1. **Go to Reddit Apps:**
   - Visit: https://www.reddit.com/prefs/apps
   - Or: Click your profile → User Settings → Safety & Privacy → Apps

2. **Click "create another app..." button** (at bottom)

3. **Fill out the form:**
   ```
   Name: LynkApp
   
   App type: [●] script (for personal use)
   
   Description: Social media trending content aggregator
   
   About URL: (leave blank or add your site)
   
   Redirect URI: http://localhost:8080
   ```

4. **Click "create app"**

---

## **STEP 3: Get Your Credentials** (2 minutes)

You'll see your new app with:

```
┌──────────────────────────────────────┐
│ LynkApp                    [delete]  │
│ script                     [edit]    │
│                                       │
│ xXxxxXXxXxXxXXx            ← Client ID (under app name)
│                                       │
│ secret  abc123...xyz       ← Client Secret
│                                       │
│ http://localhost:8080      ← Redirect URI
└──────────────────────────────────────┘
```

**Copy these:**
- **Client ID**: The random string under "LynkApp"
- **Client Secret**: Next to "secret"

---

## **STEP 4: Get Refresh Token** (3 minutes)

Reddit requires OAuth2. Here's the easiest way:

### **Option A - Use this Python script:**

1. **Save as `reddit_token.py`:**
```python
import requests
import requests.auth

client_id = 'YOUR_CLIENT_ID'
client_secret = 'YOUR_CLIENT_SECRET'

client_auth = requests.auth.HTTPBasicAuth(client_id, client_secret)
post_data = {
    "grant_type": "password",
    "username": "YOUR_REDDIT_USERNAME",
    "password": "YOUR_REDDIT_PASSWORD"
}
headers = {"User-Agent": "LynkApp/0.1"}

response = requests.post(
    "https://www.reddit.com/api/v1/access_token",
    auth=client_auth,
    data=post_data,
    headers=headers
)

print("Access Token:", response.json()["access_token"])
print("Refresh Token:", response.json().get("refresh_token", "N/A"))
```

2. **Run it:**
```bash
pip install requests
python reddit_token.py
```

### **Option B - Manual OAuth (Advanced):**

Visit this URL (replace YOUR_CLIENT_ID):
```
https://www.reddit.com/api/v1/authorize?client_id=YOUR_CLIENT_ID&response_type=code&state=RANDOM_STRING&redirect_uri=http://localhost:8080&duration=permanent&scope=read
```

---

## **STEP 5: Add to .env** 

```env
# Reddit API (Trending Posts)
REDDIT_CLIENT_ID=xXxxxXXxXxXxXXx
REDDIT_CLIENT_SECRET=abc123xyz456
REDDIT_REFRESH_TOKEN=789456123
REDDIT_USER_AGENT=LynkApp/1.0
```

---

# 2. 📊 MEDIASTACK API SETUP

## **Overview:**
- **Cost:** FREE (500 requests/month)
- **Time:** 5 minutes
- **Difficulty:** ⭐ Easy
- **What You Get:** API Key

---

## **STEP 1: Create Account** (2 minutes)

1. Go to: https://mediastack.com/product
2. Click **"GET FREE API KEY"** button
3. Fill out the form:
   ```
   Email: your@email.com
   Password: (create password)
   ```
4. Click **"GET FREE API KEY"**

---

## **STEP 2: Verify Email** (1 minute)

1. Check your inbox
2. Click verification link
3. You'll be redirected to dashboard

---

## **STEP 3: Get API Key** (1 minute)

On your dashboard, you'll see:

```
┌────────────────────────────────────────┐
│  Your API Access Key                   │
│                                        │
│  abc123def456ghi789jkl012mno345pqr678 │
│  [📋 Copy]                             │
│                                        │
│  Usage: 0 / 500 requests              │
└────────────────────────────────────────┘
```

**Click the copy button** to copy your API key!

---

## **STEP 4: Add to .env**

```env
# MediaStack API (Real-time News)
MEDIASTACK_API_KEY=abc123def456ghi789jkl012mno345pqr678
MEDIASTACK_BASE_URL=http://api.mediastack.com/v1
```

---

## **STEP 5: Test It** (Optional)

```bash
curl "http://api.mediastack.com/v1/news?access_key=YOUR_API_KEY&countries=us&limit=3"
```

---

# 3. 📰 CURRENTS API SETUP

## **Overview:**
- **Cost:** FREE (600 requests/day)
- **Time:** 3 minutes
- **Difficulty:** ⭐ Easy
- **What You Get:** API Key

---

## **STEP 1: Create Account** (1 minute)

1. Go to: https://currentsapi.services/en/register
2. Fill out form:
   ```
   Full Name: Your Name
   Email: your@email.com
   Password: (create password)
   ```
3. Click **"Sign Up"**

---

## **STEP 2: Verify Email** (1 minute)

1. Check inbox
2. Click verification link
3. Login to dashboard

---

## **STEP 3: Get API Key** (1 minute)

On dashboard, you'll see:

```
┌────────────────────────────────────────┐
│  API Key                                │
│                                        │
│  XyZ9aBcD3eFgH6iJkL2mNoPqR5sTuV8wXy   │
│  [📋 Copy]                             │
│                                        │
│  Plan: Free (600 req/day)              │
└────────────────────────────────────────┘
```

**Copy your API key!**

---

## **STEP 4: Add to .env**

```env
# Currents API (Breaking News)
CURRENTS_API_KEY=XyZ9aBcD3eFgH6iJkL2mNoPqR5sTuV8wXy
CURRENTS_BASE_URL=https://api.currentsapi.services/v1
```

---

## **STEP 5: Test It** (Optional)

```bash
curl "https://api.currentsapi.services/v1/latest-news?apiKey=YOUR_API_KEY&language=en"
```

---

# 4. 🎥 YOUTUBE DATA API SETUP

## **Overview:**
- **Cost:** FREE (10,000 units/day)
- **Time:** 10 minutes
- **Difficulty:** ⭐⭐ Medium
- **What You Get:** API Key

---

## **STEP 1: Create Google Cloud Project** (3 minutes)

1. Go to: https://console.cloud.google.com
2. Click **"Select a project"** dropdown (top left)
3. Click **"NEW PROJECT"**
4. Fill out:
   ```
   Project Name: LynkApp
   Organization: (leave as is)
   Location: (leave as is)
   ```
5. Click **"CREATE"**
6. Wait 10-20 seconds for project to be created

---

## **STEP 2: Enable YouTube Data API** (3 minutes)

1. Make sure "LynkApp" project is selected (top left)

2. Click **"☰" menu** → **"APIs & Services"** → **"Library"**

3. **Search for:** "YouTube Data API v3"

4. Click on **"YouTube Data API v3"**

5. Click **"ENABLE"** button

6. Wait for it to enable (~10 seconds)

---

## **STEP 3: Create API Key** (3 minutes)

1. Click **"CREATE CREDENTIALS"** button (top right)

2. On "Create credentials" popup:
   - Which API: **YouTube Data API v3**
   - Where: **Web browser (JavaScript)**
   - Data type: **Public data**

3. Click **"WHAT CREDENTIALS DO I NEED?"**

4. You'll see your API Key:
   ```
   ┌────────────────────────────────────────┐
   │  Your API key                           │
   │                                        │
   │  AIzaSyABC123DEF456GHI789JKL012MNO345 │
   │  [📋 Copy]                             │
   └────────────────────────────────────────┘
   ```

5. **Copy the API key!**

6. Click **"DONE"**

---

## **STEP 4: (Optional) Restrict API Key** (2 minutes)

For security, restrict your key:

1. Go to: **APIs & Services** → **Credentials**

2. Click on your API key name

3. Under **"API restrictions"**:
   - Select: **"Restrict key"**
   - Check: **"YouTube Data API v3"**

4. Under **"Application restrictions"** (optional):
   - Select: **"HTTP referrers"**
   - Add: `https://lynkapp.com/*`
   - Add: `http://localhost:*`

5. Click **"SAVE"**

---

## **STEP 5: Add to .env**

```env
# YouTube Data API (Trending Videos)
YOUTUBE_API_KEY=AIzaSyABC123DEF456GHI789JKL012MNO345
YOUTUBE_API_BASE_URL=https://www.googleapis.com/youtube/v3
```

---

## **STEP 6: Test It** (Optional)

```bash
curl "https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=5&key=YOUR_API_KEY"
```

---

# 📋 COMPLETE .ENV FILE

Add all keys to `ConnectHub-Backend/.env`:

```env
# ============================================================================
# TRENDING & NEWS APIs
# ============================================================================

# NewsAPI.org (Already have)
NEWS_API_KEY=fda0b285fdbb4d27890b48951ad2d0c3
NEWS_API_BASE_URL=https://newsapi.org/v2

# Reddit API (Trending Posts & Discussions)
REDDIT_CLIENT_ID=xXxxxXXxXxXxXXx
REDDIT_CLIENT_SECRET=abc123xyz456
REDDIT_REFRESH_TOKEN=789456123
REDDIT_USER_AGENT=LynkApp/1.0

# MediaStack API (Real-time News from 7,500+ sources)
MEDIASTACK_API_KEY=abc123def456ghi789jkl012mno345pqr678
MEDIASTACK_BASE_URL=http://api.mediastack.com/v1

# Currents API (Breaking News & Articles)
CURRENTS_API_KEY=XyZ9aBcD3eFgH6iJkL2mNoPqR5sTuV8wXy
CURRENTS_BASE_URL=https://api.currentsapi.services/v1

# YouTube Data API (Trending Videos)
YOUTUBE_API_KEY=AIzaSyABC123DEF456GHI789JKL012MNO345
YOUTUBE_API_BASE_URL=https://www.googleapis.com/youtube/v3
```

---

# 💰 COST BREAKDOWN

## **FREE Tiers:**

| API | Free Limit | Cost After |
|-----|-----------|-----------|
| **Reddit** | 60 req/min | FREE always |
| **MediaStack** | 500 req/month | $9.99/mo (5,000) |
| **Currents** | 600 req/day | $12/mo (unlimited) |
| **YouTube** | 10,000 units/day | Pay per use |
| **NewsAPI** | 1,000 req/day | $449/mo (business) |

**Total Monthly Cost:** $0 (using free tiers)

---

# ⚡ QUICK REFERENCE

## **Dashboard URLs:**

```
Reddit Apps:      https://www.reddit.com/prefs/apps
MediaStack:       https://mediastack.com/dashboard  
Currents:         https://currentsapi.services/en/dashboard
YouTube/Google:   https://console.cloud.google.com
NewsAPI:          https://newsapi.org/account
```

## **Documentation:**

```
Reddit:       https://www.reddit.com/dev/api
MediaStack:   https://mediastack.com/documentation
Currents:     https://currentsapi.services/en/docs
YouTube:      https://developers.google.com/youtube/v3/docs
NewsAPI:      https://newsapi.org/docs
```

---

# 🔧 API USAGE EXAMPLES

## **Reddit - Get Trending Posts:**
```javascript
const axios = require('axios');

const getTrendingReddit = async () => {
    const response = await axios.get('https://oauth.reddit.com/r/all/hot', {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'LynkApp/1.0'
        },
        params: {
            limit: 10
        }
    });
    return response.data.data.children;
};
```

## **MediaStack - Get Latest News:**
```javascript
const getMediaStackNews = async () => {
    const response = await axios.get('http://api.mediastack.com/v1/news', {
        params: {
            access_key: process.env.MEDIASTACK_API_KEY,
            countries: 'us',
            languages: 'en',
            limit: 10
        }
    });
    return response.data.data;
};
```

## **Currents - Get Breaking News:**
```javascript
const getCurrentsNews = async () => {
    const response = await axios.get('https://api.currentsapi.services/v1/latest-news', {
        params: {
            apiKey: process.env.CURRENTS_API_KEY,
            language: 'en',
            country: 'us'
        }
    });
    return response.data.news;
};
```

## **YouTube - Get Trending Videos:**
```javascript
const getYouTubeTrending = async () => {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
            key: process.env.YOUTUBE_API_KEY,
            part: 'snippet,statistics',
            chart: 'mostPopular',
            regionCode: 'US',
            maxResults: 10
        }
    });
    return response.data.items;
};
```

---

# 🎯 INTEGRATION CHECKLIST

- [ ] **Reddit API**
  - [ ] Create Reddit app
  - [ ] Get Client ID
  - [ ] Get Client Secret  
  - [ ] Get Refresh Token
  - [ ] Add to .env
  - [ ] Test API call

- [ ] **MediaStack API**
  - [ ] Create account
  - [ ] Verify email
  - [ ] Get API key
  - [ ] Add to .env
  - [ ] Test API call

- [ ] **Currents API**
  - [ ] Create account
  - [ ] Verify email
  - [ ] Get API key
  - [ ] Add to .env
  - [ ] Test API call

- [ ] **YouTube API**
  - [ ] Create Google Cloud project
  - [ ] Enable YouTube Data API
  - [ ] Create API key
  - [ ] Restrict key (optional)
  - [ ] Add to .env
  - [ ] Test API call

---

# 🚨 TROUBLESHOOTING

## **Reddit API:**

**Error: 401 Unauthorized**
- Check Client ID & Secret are correct
- Verify Refresh Token is valid
- Make sure User-Agent header is set

**Error: 429 Too Many Requests**
- You exceeded 60 requests/minute
- Wait 1 minute and try again
- Implement rate limiting in your code

## **MediaStack API:**

**Error: 104 - Usage Limit Reached**
- You used all 500 free requests this month
- Upgrade plan or wait until next month

**Error: 101 - Invalid API Key**
- Check API key is copied correctly
- No spaces before/after the key

## **Currents API:**

**Error: 429 - Rate Limit Exceeded**
- You exceeded 600 requests today
- Wait until tomorrow
- Cache responses to reduce API calls

## **YouTube API:**

**Error: 403 - Quota Exceeded**
- You used all 10,000 units today
- Wait until tomorrow (resets at midnight PT)
- Optimize queries to use fewer units

**Error: 400 - Invalid API Key**
- Check key is correct
- Make sure YouTube Data API v3 is enabled
- Check API restrictions

---

# 💡 PRO TIPS

## **1. Cache Responses:**
```javascript
// Cache for 15 minutes
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000;

const getCachedNews = async (source) => {
    if (cache.has(source)) {
        const {data, timestamp} = cache.get(source);
        if (Date.now() - timestamp < CACHE_TTL) {
            return data;
        }
    }
    const freshData = await fetchNews(source);
    cache.set(source, {data: freshData, timestamp: Date.now()});
    return freshData;
};
```

## **2. Implement Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/trending', apiLimiter);
```

## **3. Rotate APIs:**
```javascript
const sources = ['newsapi', 'mediastack', 'currents'];
let currentIndex = 0;

const getNews = async () => {
    const source = sources[currentIndex];
    currentIndex = (currentIndex + 1) % sources.length;
    return await fetchFrom(source);
};
```

## **4. Handle Errors Gracefully:**
```javascript
const getTrendingContent = async () => {
    const results = await Promise.allSettled([
        getRedditTrending(),
        getMediaStackNews(),
        getCurrentsNews(),
        getYouTubeTrending()
    ]);
    
    return results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
        .flat();
};
```

---

# ✅ SUCCESS CHECKLIST

You know everything is working when:

- ✅ All 4 API keys added to .env
- ✅ Test calls return data successfully
- ✅ No 401/403 errors
- ✅ Trending section shows content
- ✅ Rate limits respected
- ✅ Responses cached properly

---

# 📞 SUPPORT LINKS

**Reddit:**
- API Docs: https://www.reddit.com/dev/api
- Support: https://www.reddithelp.com
- Status: https://www.redditstatus.com

**MediaStack:**
- Dashboard: https://mediastack.com/dashboard
- Docs: https://mediastack.com/documentation  
- Support: support@mediastack.com

**Currents:**
- Dashboard: https://currentsapi.services/en/dashboard
- Docs: https://currentsapi.services/en/docs
- Support: support@currentsapi.services

**YouTube:**
- Console: https://console.cloud.google.com
- API Docs: https://developers.google.com/youtube/v3
- Support: https://support.google.com/youtube

---

# 🎊 SUMMARY

**Total Setup Time:** 30-40 minutes  
**Total Cost:** $0/month (FREE tiers)  
**APIs Integrated:** 5 (NewsAPI + 4 new)  
**Trending Sources:** Reddit, News, Videos, Articles  

**You Now Have Access To:**
- Reddit trending posts & discussions
- Real-time news from 7,500+ sources (MediaStack)
- Breaking news & articles (Currents)
- YouTube trending videos
- NewsAPI news (already have)

**Next Steps:**
1. Copy all API keys to `.env`
2. Test each API
3. Build your trending content aggregator!

---

**Status:** ✅ Complete Guide Ready  
**All APIs:** FREE tiers available  
**Get your keys and power up LynkApp's trending section!** 📰🎥✨
