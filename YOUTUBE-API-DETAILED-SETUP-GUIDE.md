# 🎥 YouTube Data API - Complete Step-by-Step Setup Guide

**Get your YouTube API key to access trending videos and popular content!**

**Time Required:** 10-15 minutes  
**Cost:** FREE (10,000 units/day)  
**Difficulty:** ⭐⭐ Medium (but we'll make it easy!)

---

## 📋 WHAT YOU'LL GET:

- **YouTube API Key** - Access trending videos, search, channel data
- **10,000 FREE units per day** - Plenty for most applications
- **Access to:** Most Popular Videos, Search, Video Details, Channel Info

---

## 🚀 LET'S BEGIN!

---

# STEP 1: Go to Google Cloud Console (1 minute)

## **Action:**
1. Open your browser
2. Go to: **https://console.cloud.google.com**
3. Sign in with your Google account

## **What You'll See:**

```
┌────────────────────────────────────────────────────────┐
│  Google Cloud Platform                                 │
│                                                        │
│  [Sign in]  or  [Create Account]                      │
│                                                        │
│  Welcome to Google Cloud                               │
│  Build, deploy, and scale applications...             │
└────────────────────────────────────────────────────────┘
```

## **If You Don't Have a Google Account:**
- Click "Create Account"
- Follow the signup process
- Come back to console.cloud.google.com

---

# STEP 2: Create a New Project (3 minutes)

## **Action:**

1. **Look at the top of the page** - You'll see a project dropdown near the Google Cloud logo

2. **Click on** "Select a project" dropdown
   - It might say "My First Project" or "Select a project"
   - It's usually in the **top-left area**

## **What You'll See:**

```
┌────────────────────────────────────────────────────────┐
│ ☰  Google Cloud  [Select a project ▼]                 │
│                                                        │
│  Recently viewed projects                              │
│  ├─ My First Project                                  │
│  └─ (other projects if you have any)                  │
│                                                        │
│  [+ NEW PROJECT]  ← CLICK THIS!                       │
└────────────────────────────────────────────────────────┘
```

3. **Click "+ NEW PROJECT"** button

## **Fill Out the Form:**

```
┌────────────────────────────────────────────────────────┐
│  New Project                                           │
│                                                        │
│  Project name *                                        │
│  [LynkApp                                    ]         │
│                                                        │
│  Organization                                          │
│  [No organization                            ▼]        │
│                                                        │
│  Location                                              │
│  [No organization                            ▼]        │
│                                                        │
│              [CANCEL]  [CREATE]                        │
└────────────────────────────────────────────────────────┘
```

**Enter:**
- **Project name:** `LynkApp` (or whatever you want)
- **Organization:** Leave as "No organization"
- **Location:** Leave as default

4. **Click "CREATE"** button

## **Wait for Project Creation:**
- You'll see a spinning icon
- Takes about 10-20 seconds
- You'll get a notification when it's ready

---

# STEP 3: Make Sure Your Project is Selected (30 seconds)

## **Action:**
1. Look at the top-left dropdown again
2. It should now say **"LynkApp"**
3. If not, click the dropdown and select "LynkApp"

## **What You'll See:**

```
┌────────────────────────────────────────────────────────┐
│ ☰  Google Cloud  [LynkApp ▼]  ← Should say LynkApp   │
│                                                        │
│  Dashboard                                             │
│  Getting Started                                       │
└────────────────────────────────────────────────────────┘
```

---

# STEP 4: Open APIs & Services Library (1 minute)

## **Action:**

### **Option A - Use the Hamburger Menu (Recommended):**

1. **Click the "☰" (hamburger icon)** in the top-left
2. Scroll down to **"APIs & Services"**
3. Click **"Library"**

```
┌────────────────────────────────────────────────────────┐
│ ☰  Menu                                                │
│                                                        │
│  Home                                                  │
│  Marketplace                                           │
│  Billing                                               │
│  APIs & Services  ← Hover here                        │
│    ├─ Dashboard                                       │
│    ├─ Library  ← CLICK THIS!                         │
│    ├─ Credentials                                     │
│    └─ ...                                             │
└────────────────────────────────────────────────────────┘
```

### **Option B - Use Search Bar:**

1. Click the search bar at the top
2. Type: "API Library"
3. Click on "API Library"

---

# STEP 5: Find YouTube Data API v3 (1 minute)

## **Action:**

You're now in the **API Library** page with hundreds of APIs!

1. **Look for the search box** at the top

```
┌────────────────────────────────────────────────────────┐
│  API Library                                           │
│                                                        │
│  Search for APIs & Services                            │
│  [YouTube Data                              🔍]        │
│                                                        │
│  Browse by category or search above                    │
└────────────────────────────────────────────────────────┘
```

2. **Type:** `YouTube Data`
3. **Press Enter** or **click the search icon**

## **What You'll See:**

```
┌────────────────────────────────────────────────────────┐
│  Search results for "YouTube Data"                     │
│                                                        │
│  ┌──────────────────────────────────────────┐        │
│  │  📺 YouTube Data API v3                  │        │
│  │  Google                                   │        │
│  │  The YouTube Data API v3 is an API       │        │
│  │  that provides access to YouTube data... │        │
│  │                                           │        │
│  │  [VIEW]                                   │        │
│  └──────────────────────────────────────────┘        │
│                                                        │
│  (Other YouTube APIs may appear below)                │
└────────────────────────────────────────────────────────┘
```

3. **Click on "YouTube Data API v3"** card (or click "VIEW")

---

# STEP 6: Enable YouTube Data API v3 (30 seconds)

## **Action:**

You're now on the YouTube Data API v3 details page!

```
┌────────────────────────────────────────────────────────┐
│  📺 YouTube Data API v3                                │
│                                                        │
│  The YouTube Data API v3 is an API that provides      │
│  access to YouTube data, such as videos, playlists,   │
│  and channels.                                         │
│                                                        │
│  By Google                                             │
│                                                        │
│  [ENABLE]  ← CLICK THIS BLUE BUTTON!                  │
│                                                        │
│  Documentation  |  Quotas  |  Metrics                  │
└────────────────────────────────────────────────────────┘
```

1. **Click the blue "ENABLE" button**

## **Wait for Activation:**
- Takes about 5-10 seconds
- You'll see a progress indicator
- Page will refresh when ready

---

# STEP 7: Create API Credentials (3 minutes)

## **After Enabling, You'll See:**

```
┌────────────────────────────────────────────────────────┐
│  📺 YouTube Data API v3                                │
│                                                        │
│  ✓ API enabled                                        │
│                                                        │
│  To use this API, you may need credentials.           │
│  [CREATE CREDENTIALS]  ← CLICK THIS!                  │
│                                                        │
│  Metrics  |  Quotas  |  Credentials                    │
└────────────────────────────────────────────────────────┘
```

## **Action:**

1. **Click "CREATE CREDENTIALS"** button

---

# STEP 8: Configure Credentials (2 minutes)

## **You'll see a form asking 3 questions:**

```
┌────────────────────────────────────────────────────────┐
│  Create credentials                                    │
│                                                        │
│  1. Which API are you using?                          │
│  [YouTube Data API v3                        ▼]       │
│                                                        │
│  2. Where will you be calling the API from?           │
│  ( ) Web server (Node.js, Tomcat, etc.)              │
│  (●) Web browser (JavaScript)  ← SELECT THIS          │
│  ( ) Android                                          │
│  ( ) iOS                                              │
│  ( ) Other (e.g., Cron job, G Suite Add-on)          │
│                                                        │
│  3. What data will you be accessing?                  │
│  (●) Public data  ← SELECT THIS                       │
│  ( ) User data                                        │
│                                                        │
│  [WHAT CREDENTIALS DO I NEED?]                        │
└────────────────────────────────────────────────────────┘
```

## **Fill It Out:**

1. **Which API are you using?**
   - Should already say "YouTube Data API v3" ✓

2. **Where will you be calling the API from?**
   - Select: **"Web browser (JavaScript)"** 
   - (Even if you're using it from backend, this works!)

3. **What data will you be accessing?**
   - Select: **"Public data"**

4. **Click** the blue **"WHAT CREDENTIALS DO I NEED?"** button

---

# STEP 9: Get Your API Key! (30 seconds) 🎉

## **Success! You'll see your API key:**

```
┌────────────────────────────────────────────────────────┐
│  You're all set!                                       │
│                                                        │
│  Your API key                                          │
│  ┌────────────────────────────────────────────────┐  │
│  │ AIzaSyABC123DEF456GHI789JKL012MNO345PQR678    │  │
│  │                                    [📋 Copy]   │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  Keep your key secure                                  │
│  • Don't share your API key publicly                  │
│  • Restrict your key to prevent unauthorized use      │
│                                                        │
│  [DONE]                                                │
└────────────────────────────────────────────────────────┘
```

## **Action:**

1. **Click the "📋 Copy" button** to copy your API key
2. **Save it somewhere safe!** (We'll add it to .env in a moment)
3. **Click "DONE"**

---

# STEP 10: Find Your API Key Again (Optional)

**If you need to find your key later:**

1. Go to **☰ Menu** → **APIs & Services** → **Credentials**
2. You'll see your API key listed:

```
┌────────────────────────────────────────────────────────┐
│  Credentials                                           │
│                                                        │
│  API Keys                                              │
│  ┌────────────────────────────────────────────────┐  │
│  │  API key 1                                     │  │
│  │  AIzaSyABC123DEF456GHI789JKL012MNO345...      │  │
│  │  Created: Mar 12, 2026                         │  │
│  │  [✏️ Edit]  [🗑️ Delete]                        │  │
│  └────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

3. Click the key name or "Edit" to see/copy it again

---

# STEP 11: Add API Key to Your .env File (1 minute)

## **Action:**

1. **Open:** `ConnectHub-Backend/.env`

2. **Find the YouTube section** (should already be there):

```env
# YouTube Data API (Trending Videos - Add when ready)
YOUTUBE_API_KEY=
YOUTUBE_API_BASE_URL=https://www.googleapis.com/youtube/v3
```

3. **Paste your API key:**

```env
# YouTube Data API (Trending Videos)
YOUTUBE_API_KEY=AIzaSyABC123DEF456GHI789JKL012MNO345PQR678
YOUTUBE_API_BASE_URL=https://www.googleapis.com/youtube/v3
```

4. **Save the file** (Ctrl+S or Cmd+S)

---

# 🎯 STEP 12: Test Your API Key! (1 minute)

## **Test in Browser:**

1. **Copy this URL** and replace `YOUR_API_KEY` with your actual key:

```
https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=5&regionCode=US&key=YOUR_API_KEY
```

2. **Paste it in your browser** and press Enter

## **You Should See:**

```json
{
  "kind": "youtube#videoListResponse",
  "etag": "...",
  "items": [
    {
      "kind": "youtube#video",
      "id": "dQw4w9WgXcQ",
      "snippet": {
        "title": "Trending Video Title",
        "description": "Video description...",
        ...
      },
      "statistics": {
        "viewCount": "1234567",
        "likeCount": "98765",
        ...
      }
    },
    ...
  ]
}
```

## **Or Test with cURL:**

```bash
curl "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=5&key=YOUR_API_KEY"
```

## **If It Works:**
✅ You'll see JSON data with trending videos!

## **If You Get an Error:**
- Check if API key is correct
- Make sure YouTube Data API v3 is enabled
- Wait a few minutes and try again

---

# 🔒 STEP 13 (OPTIONAL): Secure Your API Key (5 minutes)

## **Why Restrict Your Key?**
- Prevents unauthorized use
- Limits where the key can be used from
- Protects your quota

## **Action:**

1. Go to **APIs & Services** → **Credentials**
2. **Click on your API key name**
3. You'll see restriction options:

```
┌────────────────────────────────────────────────────────┐
│  Edit API key                                          │
│                                                        │
│  API key                                               │
│  AIzaSyABC123DEF456GHI789JKL012MNO345PQR678          │
│                                                        │
│  Application restrictions                              │
│  ( ) None                                             │
│  (●) HTTP referrers (web sites)  ← Recommended        │
│  ( ) IP addresses                                     │
│  ( ) Android apps                                     │
│  ( ) iOS apps                                         │
│                                                        │
│  Website restrictions                                  │
│  [https://lynkapp.com/*                    ]          │
│  [http://localhost:*                       ]          │
│  [+ ADD]                                               │
│                                                        │
│  API restrictions                                      │
│  ( ) Don't restrict key                               │
│  (●) Restrict key  ← Recommended                      │
│      ☑ YouTube Data API v3                            │
│                                                        │
│  [SAVE]                                                │
└────────────────────────────────────────────────────────┘
```

## **Recommended Settings:**

### **Application restrictions:**
- Select: **"HTTP referrers (web sites)"**
- Add these referrers:
  ```
  https://lynkapp.com/*
  https://*.lynkapp.com/*
  http://localhost:*
  http://localhost:3000/*
  http://127.0.0.1:*
  ```

### **API restrictions:**
- Select: **"Restrict key"**
- Check **only**: ☑ YouTube Data API v3

### **Click "SAVE"**

---

# 📊 UNDERSTANDING YOUR QUOTA

## **FREE Tier Includes:**

```
Daily Quota: 10,000 units
Reset: Midnight Pacific Time (PT)
```

## **How Units Are Used:**

| Operation | Units Cost | Example |
|-----------|-----------|---------|
| **Search** | 100 units | Search "trending videos" |
| **List Videos** | 1 unit per video | Get video details |
| **List Channels** | 1 unit per channel | Get channel info |
| **List Playlists** | 1 unit per playlist | Get playlist data |

## **Example Usage:**

```javascript
// Get 50 trending videos = 50 units
// You can do this 200 times per day!

// Or do 100 searches per day (100 units each)
```

## **Quota Usage Tips:**

1. **Cache responses** - Don't fetch same data repeatedly
2. **Batch requests** - Get multiple items at once
3. **Use specific fields** - `part=snippet` instead of `part=*`
4. **Monitor usage** - Check Google Cloud Console → APIs → Dashboard

---

# 💻 CODE EXAMPLES

## **Example 1: Get Trending Videos**

```javascript
const axios = require('axios');

async function getTrendingVideos() {
    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                key: process.env.YOUTUBE_API_KEY,
                part: 'snippet,statistics',
                chart: 'mostPopular',
                regionCode: 'US',
                maxResults: 10
            }
        });
        
        return response.data.items.map(video => ({
            id: video.id,
            title: video.snippet.title,
            thumbnail: video.snippet.thumbnails.high.url,
            views: video.statistics.viewCount,
            likes: video.statistics.likeCount,
            channelTitle: video.snippet.channelTitle
        }));
    } catch (error) {
        console.error('Error fetching trending videos:', error.message);
        throw error;
    }
}

// Use it:
getTrendingVideos()
    .then(videos => console.log('Trending:', videos))
    .catch(err => console.error(err));
```

## **Example 2: Search Videos**

```javascript
async function searchVideos(query) {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
            key: process.env.YOUTUBE_API_KEY,
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: 10
        }
    });
    
    return response.data.items;
}

// Use it:
searchVideos('gaming highlights')
    .then(videos => console.log(videos));
```

## **Example 3: Get Video Details**

```javascript
async function getVideoDetails(videoId) {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
            key: process.env.YOUTUBE_API_KEY,
            part: 'snippet,statistics,contentDetails',
            id: videoId
        }
    });
    
    return response.data.items[0];
}

// Use it:
getVideoDetails('dQw4w9WgXcQ')
    .then(video => console.log(video));
```

---

# 🚨 TROUBLESHOOTING

## **Error: "API key not valid"**

**Solutions:**
1. Check if you copied the entire key
2. Make sure there are no spaces before/after the key
3. Verify YouTube Data API v3 is enabled
4. Wait a few minutes (can take time to activate)

## **Error: "The request did not specify any referer"**

**Solution:**
- If you added HTTP referrer restrictions, make sure your domain is allowed
- Or temporarily set to "None" for testing

## **Error: "Daily Limit Exceeded"**

**Solution:**
- You used all 10,000 units today
- Wait until midnight Pacific Time
- Or upgrade to paid tier

## **Error: "Access Not Configured"**

**Solution:**
- YouTube Data API v3 is not enabled
- Go back to Step 6 and enable it

## **Error: 403 Forbidden**

**Solutions:**
1. Check API restrictions - is YouTube Data API allowed?
2. Verify billing is enabled (may be required)
3. Check if API key is restricted to wrong IPs/referrers

---

# ✅ SUCCESS CHECKLIST

- [x] Created Google Cloud Project
- [x] Enabled YouTube Data API v3
- [x] Created API Key
- [x] Copied API Key
- [x] Added to .env file
- [x] Tested with browser/cURL
- [x] (Optional) Secured with restrictions
- [x] Ready to use!

---

# 📖 USEFUL LINKS

**Google Cloud Console:**
- Main Console: https://console.cloud.google.com
- API Library: https://console.cloud.google.com/apis/library
- Credentials: https://console.cloud.google.com/apis/credentials
- API Dashboard: https://console.cloud.google.com/apis/dashboard

**YouTube Data API Documentation:**
- Overview: https://developers.google.com/youtube/v3
- API Reference: https://developers.google.com/youtube/v3/docs
- Code Samples: https://developers.google.com/youtube/v3/code_samples
- Quota Calculator: https://developers.google.com/youtube/v3/determine_quota_cost

**Support:**
- Stack Overflow: https://stackoverflow.com/questions/tagged/youtube-api
- Issue Tracker: https://issuetracker.google.com/issues?q=componentid:187286

---

# 🎊 CONGRATULATIONS!

You now have:
- ✅ YouTube Data API v3 enabled
- ✅ API Key ready to use
- ✅ 10,000 free units per day
- ✅ Access to trending videos, search, and more!

## **Your API Key:**
```env
YOUTUBE_API_KEY=AIzaSyABC123DEF456GHI789JKL012MNO345PQR678
```

## **Test URL:**
```
https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=5&key=YOUR_KEY
```

## **Next Steps:**
1. Use the code examples above
2. Build your trending video feature
3. Cache results to save quota
4. Monitor usage in Google Cloud Console

---

**Time Spent:** ~10-15 minutes  
**Cost:** $0  
**Result:** Full access to YouTube's data! 🎥✨

**Now go build something awesome!** 🚀
