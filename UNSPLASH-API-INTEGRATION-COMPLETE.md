# ✅ Unsplash Photo API Integration — Complete
**Date:** May 18, 2026  
**App ID:** 954839  
**Access Key:** `4vLXSRzZRNTZhRVyJJ6j_XR14mZAmlIuZMy4ASEWQQo` → `ConnectHub-SPA/.env` as `VITE_UNSPLASH_ACCESS_KEY`  
**Secret Key:** `IjtYZN0HDHa5d6tmBzlv5J6qP-03-bCJbyLi3ceyLbc` → `ConnectHub-Backend/.env` as `UNSPLASH_SECRET_KEY` (**backend only — never in frontend**)  
**Dashboard:** https://unsplash.com/developers  
**Service file:** `ConnectHub-SPA/src/services/unsplash-service.js`  
**Plan:** Free — 50 requests/hour (demo) | Up to 5,000/hour after production approval

---

## 🔑 Key Separation (Security)

| Key | Where Stored | Accessible From |
|-----|-------------|-----------------|
| Access Key `4vLXSRzZ...` | `ConnectHub-SPA/.env` as `VITE_UNSPLASH_ACCESS_KEY` | Frontend browser ✅ Safe |
| Secret Key `IjtYZN0H...` | `ConnectHub-Backend/.env` as `UNSPLASH_SECRET_KEY` | Backend server only ✅ Never exposed |

---

## 📋 What Was Done

### 1. Access Key Added to Frontend `.env`
```
# ConnectHub-SPA/.env  (gitignored — never committed)
VITE_UNSPLASH_ACCESS_KEY=4vLXSRzZRNTZhRVyJJ6j_XR14mZAmlIuZMy4ASEWQQo
VITE_UNSPLASH_APP_ID=954839
```

### 2. Secret Key Added to Backend `.env`
```
# ConnectHub-Backend/.env  (gitignored — never committed)
UNSPLASH_SECRET_KEY=IjtYZN0HDHa5d6tmBzlv5J6qP-03-bCJbyLi3ceyLbc
UNSPLASH_APP_ID=954839
```

### 3. `unsplash-service.js` Created
Full-featured Unsplash service with **15 API functions** + presets + helpers:

| Function | Purpose | Used In |
|----------|---------|---------|
| `searchPhotos(query, opts)` | Search by keyword | Search page, feed, stories |
| `getRandomPhotos(opts)` | Random photo feed | Story backgrounds, feed |
| `listPhotos(opts)` | Editorial photo list | Media Hub, feed |
| `getPhoto(id)` | Single photo details | Photo viewer |
| `getTrendingPhotos()` | Popular photos | Trending section |
| `listTopics()` | Unsplash topic categories | Category browse |
| `getTopicPhotos(slug)` | Photos by topic | Topic feeds |
| `getCollection(id)` | Single collection info | Collections |
| `getCollectionPhotos(id)` | Photos in collection | Collection viewer |
| `getUnsplashUser(username)` | Photographer profile | Attribution links |
| `getUserPhotos(username)` | Photographer's photos | Creator profiles |
| `trackDownload(photo)` | ⚠️ Required by ToS | On every download |
| `searchCollections(query)` | Search collections | Search page |
| `searchUsers(query)` | Search photographers | Search page |
| `getPhotoStats(id)` | Photo view/download stats | Analytics |

### 4. Helper Utilities
```js
getPhotoUrl(photo, size)      // 'thumb'(200) | 'small'(400) | 'regular'(1080) | 'full' | 'raw'
getBlurUrl(photo)             // Low-quality thumbnail for blur-up loading effect
getAttribution(photo)         // { name, url, username, avatar } — REQUIRED by Unsplash ToS
getAttributionText(photo)     // "Photo by John Doe on Unsplash"
getPhotoColor(photo)          // Dominant color hex (#3a7bd5) — for placeholder backgrounds
getPhotoDimensions(photo)     // { width, height }
isUnsplashConfigured()        // Feature flag check
```

### 5. LynkApp Presets Object
```js
import { UnsplashPresets } from '../services/unsplash-service';

// Content backgrounds
UnsplashPresets.nature()        // Nature & outdoors photos
UnsplashPresets.travel()        // Travel & adventure photos
UnsplashPresets.architecture()  // Architecture & interior
UnsplashPresets.fashion()       // Fashion & beauty
UnsplashPresets.food()          // Food & drink
UnsplashPresets.technology()    // Business & tech
UnsplashPresets.sports()        // Sports action shots
UnsplashPresets.music()         // Music & concerts

// Profile & UI elements
UnsplashPresets.profileBanners()    // Landscape abstract — profile header
UnsplashPresets.storyBackgrounds()  // Portrait photos — story backgrounds
UnsplashPresets.wallpapers()        // High-res wallpapers

// Editorial feeds
UnsplashPresets.trending()     // Most popular photos
UnsplashPresets.latest()       // Newest photos

// Dynamic search
UnsplashPresets.search('sunset cityscape')
```

---

## 🔌 How to Use in LynkApp Components

### Story Background Photo Picker
```jsx
import UnsplashService from '../services/unsplash-service';

const [photos, setPhotos] = useState([]);

useEffect(() => {
  async function load() {
    const results = await UnsplashService.getRandomPhotos({
      count: 10,
      orientation: 'portrait',
    });
    setPhotos(results);
  }
  load();
}, []);

// Render with REQUIRED attribution:
photos.map(photo => (
  <div key={photo.id} style={{ backgroundColor: UnsplashService.getPhotoColor(photo) }}>
    <img
      src={UnsplashService.getPhotoUrl(photo, 'regular')}
      alt={photo.alt_description}
    />
    {/* ⚠️ REQUIRED by Unsplash Terms: */}
    <a href={UnsplashService.getAttribution(photo).url} target="_blank" rel="noopener">
      {UnsplashService.getAttributionText(photo)}
    </a>
  </div>
))
```

### Search Photos (Feed / Media Hub)
```jsx
const { results } = await UnsplashService.searchPhotos('sunset cityscape', {
  per_page: 20,
  orientation: 'landscape',
});
```

### Profile Banner Selector
```jsx
const banners = await UnsplashService.getTopicPhotos('wallpapers', {
  orientation: 'landscape',
  per_page: 20,
});
// Use: banners[selectedIndex]
```

### Blur-up Image Loading
```jsx
// Show thumb first, swap to regular when loaded
<img
  src={UnsplashService.getBlurUrl(photo)}    // Load instantly
  style={{ filter: 'blur(20px)' }}
  onLoad={(e) => {
    e.target.src = UnsplashService.getPhotoUrl(photo, 'regular');  // Swap to full
    e.target.style.filter = 'none';
  }}
/>
```

### Track Download (REQUIRED for full-res usage)
```jsx
// Call this whenever user downloads or uses photo at full resolution:
await UnsplashService.trackDownload(photo);
```

---

## 📍 Where to Wire It In

| Feature | Location | Integration |
|---------|----------|-------------|
| **Stories** | `StoriesPage.jsx` | Background photo picker → `UnsplashPresets.storyBackgrounds()` |
| **Feed** | `FeedPage.jsx` | Background images for posts → `UnsplashPresets.nature()` etc. |
| **Profile** | `ProfilePage.jsx` | Banner photo selector → `UnsplashPresets.profileBanners()` |
| **Media Hub** | `MediaHubPage.jsx` | Photo gallery → `listPhotos()` / `searchPhotos()` |
| **Search** | `SearchPage.jsx` | "Photos" tab → `searchPhotos(query)` |
| **Onboarding** | `OnboardingPage.jsx` | Interest background → `UnsplashPresets[interest]()` |
| **Messages** | `MessagesPage.jsx` | Photo sharing → `searchPhotos()` + `trackDownload()` |
| **Creator Profile** | Creator pages | Portfolio backgrounds → `getUserPhotos()` |

---

## ⚠️ Unsplash Terms of Service Requirements

### ✅ REQUIRED — Must Do:
1. **Show photographer credit** on every displayed photo
   - Format: `"Photo by [Name] on Unsplash"`
   - Name must link to photographer's Unsplash profile with `?utm_source=lynkapp&utm_medium=referral`
2. **Call `trackDownload(photo)`** every time a photo is used at full resolution
3. **Link "Unsplash"** to `https://unsplash.com?utm_source=lynkapp&utm_medium=referral`

### ❌ NOT Allowed:
- Selling Unsplash photos or compilations of Unsplash photos
- Storing photos on your own CDN for redistribution
- Displaying photos without attribution

### Helper Already Handles Attribution:
```js
const attr = UnsplashService.getAttribution(photo);
// attr.url already includes ?utm_source=lynkapp&utm_medium=referral
```

---

## ⚙️ API Configuration Details

### Photo Response Object (key fields)
```js
photo = {
  id: 'abc123',
  created_at: '2024-01-01T00:00:00Z',
  width: 4608,
  height: 3072,
  color: '#3a7bd5',            // Dominant color for placeholders
  blur_hash: 'LGE...',         // BlurHash for blur-up loading
  alt_description: 'mountain at sunset',
  urls: {
    raw:     'https://images.unsplash.com/photo-...?ixlib=...',  // Original
    full:    '...',            // Full resolution
    regular: '...',            // 1080px wide
    small:   '...',            // 400px wide
    thumb:   '...',            // 200px wide
  },
  links: {
    html: 'https://unsplash.com/photos/abc123',
    download: '...',
    download_location: '...',  // Use for trackDownload()
  },
  user: {
    username: 'johndoe',
    name: 'John Doe',
    links: { html: 'https://unsplash.com/@johndoe' },
    profile_image: { small: '...', medium: '...', large: '...' },
  },
  likes: 1234,
  exif: { make: 'Canon', model: '5D Mark IV', ... },
  location: { name: 'New York, USA' },
}
```

### Rate Limits
| Mode | Requests/Hour |
|------|--------------|
| Demo (current) | 50 |
| After production approval | 5,000 |

**To apply for production approval:** Go to https://unsplash.com/oauth/applications/954839 → "Request production access" (requires showing attribution is implemented)

---

## ✅ Integration Status

| Item | Status |
|------|--------|
| Access Key in `ConnectHub-SPA/.env` | ✅ `VITE_UNSPLASH_ACCESS_KEY` |
| Secret Key in `ConnectHub-Backend/.env` | ✅ `UNSPLASH_SECRET_KEY` (backend only) |
| `.env.example` updated | ✅ Placeholder added |
| `unsplash-service.js` created | ✅ 15 functions + presets + helpers |
| Attribution helpers included | ✅ `getAttribution()`, `getAttributionText()` |
| `trackDownload()` implemented | ✅ Required by Unsplash ToS |
| Build passes | ✅ Exit 0 |
| Committed to GitHub | ✅ |

---

## 🔑 Security Summary

| Key | Status | Why |
|-----|--------|-----|
| Access Key → Frontend `.env` | ✅ Safe | Unsplash Access Keys are designed for frontend use (like Google Maps API key) |
| Secret Key → Backend `.env` only | ✅ Safe | Used for OAuth server-side flows only — must NEVER be in frontend |
| Both `.env` files | ✅ Gitignored | Never committed to GitHub |

---

*Unsplash Dashboard: https://unsplash.com/developers*  
*GitHub: https://github.com/Watchdog088/Test-apps.git*  
*Service: `ConnectHub-SPA/src/services/unsplash-service.js`*
