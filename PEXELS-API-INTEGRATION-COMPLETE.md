# ✅ Pexels Photos & Videos API Integration — Complete
**Date:** May 18, 2026  
**API Key:** `tEbzEdpS6T3Wl2KaSBMgg2haM1lVGoEd8mGyAfqaB4v7BjoT2qn5La3z` → `ConnectHub-SPA/.env` as `VITE_PEXELS_API_KEY`  
**Dashboard:** https://www.pexels.com/api/  
**Service file:** `ConnectHub-SPA/src/services/pexels-service.js`  
**Plan:** Free — 200 req/hr | 20,000 req/month  
**Coverage:** ✅ **Both Photos API AND Videos API** — single key

---

## 🔑 Key Storage

| Key | Where Stored | Notes |
|-----|-------------|-------|
| `tEbzEdpS6T3Wl2KaSBMgg2haM1lVGoEd8mGyAfqaB4v7BjoT2qn5La3z` | `ConnectHub-SPA/.env` as `VITE_PEXELS_API_KEY` | ✅ Safe — Pexels keys are designed for frontend use |
| `.env.example` | Placeholder `your_pexels_api_key_here` | ✅ Never exposes real key |
| Both `.env` files | Gitignored | ✅ Never committed to GitHub |

---

## 📋 What Was Done

### 1. API Key Added to `.env`
```
# ConnectHub-SPA/.env  (gitignored — never committed)
VITE_PEXELS_API_KEY=tEbzEdpS6T3Wl2KaSBMgg2haM1lVGoEd8mGyAfqaB4v7BjoT2qn5La3z
```

### 2. `pexels-service.js` Created — 8 API Functions + Presets + Helpers

#### 📸 Photos API Functions
| Function | Purpose | Used In |
|----------|---------|---------|
| `searchPhotos(query, opts)` | Search by keyword with filters | Feed, Search, Stories |
| `getCuratedPhotos(opts)` | Pexels editorial selection | Feed, Media Hub |
| `getPhoto(id)` | Single photo by ID | Photo viewer |
| `getCollectionMedia(id)` | Photos/videos in a collection | Collections |
| `getFeaturedCollections(opts)` | Pexels featured collections | Discover tab |

#### 🎬 Videos API Functions
| Function | Purpose | Used In |
|----------|---------|---------|
| `searchVideos(query, opts)` | Search videos by keyword | Media Hub, Stories |
| `getPopularVideos(opts)` | Trending/popular videos | Trending, Media Hub |
| `getVideo(id)` | Single video by ID | Video player |

### 3. Photo Helper Utilities
```js
getPhotoUrl(photo, size)      // 'original'|'large2x'|'large'|'medium'|'small'|'portrait'|'landscape'|'tiny'
getPhotographer(photo)        // { name, url, id } — REQUIRED attribution
getPhotoPageUrl(photo)        // Pexels page URL for attribution link
getPhotoColor(photo)          // avg_color hex (#978E82) — placeholder backgrounds
getPhotoAlt(photo)            // Alt text for accessibility
getPhotoDimensions(photo)     // { width, height }
getPhotoAttributionText(photo)// "Photo by Joey Farina on Pexels"
```

### 4. Video Helper Utilities
```js
getVideoUrl(video, quality)       // 'hd'|'sd'|'uhd' — best available fallback
getVideoThumbnail(video)          // Preview image URL
getVideoPreviewFrames(video)      // Array of frame URLs for scrubbing strip
getVideographer(video)            // { name, url, id } — REQUIRED attribution
getVideoDimensions(video)         // { width, height }
getVideoDuration(video)           // Duration in seconds
getVideoAttributionText(video)    // "Video by Joey Farina on Pexels"
```

### 5. Attribution Helpers (REQUIRED by Pexels ToS)
```js
// Pre-built HTML strings — use one on every page displaying Pexels content:
PexelsService.PEXELS_ATTRIBUTION_HTML.textLink   // <a href="...">Photos provided by Pexels</a>
PexelsService.PEXELS_ATTRIBUTION_HTML.whiteLogo  // White logo (dark backgrounds)
PexelsService.PEXELS_ATTRIBUTION_HTML.blackLogo  // Black logo (light backgrounds)
```

### 6. PexelsPresets Object — 22 Ready-to-Use Presets

```js
import { PexelsPresets } from '../services/pexels-service';

// ── Photos ──────────────────────────────────────────────────────
PexelsPresets.people()           // People & lifestyle
PexelsPresets.nature()           // Nature & landscapes
PexelsPresets.city()             // City & street
PexelsPresets.food()             // Food & meals
PexelsPresets.fashion()          // Fashion & style
PexelsPresets.travel()           // Travel & adventure
PexelsPresets.sports()           // Sports action
PexelsPresets.music()            // Music & concerts
PexelsPresets.technology()       // Technology & digital
PexelsPresets.business()         // Business & office
PexelsPresets.storyBackgrounds() // Portrait abstract — story overlays
PexelsPresets.profileBanners()   // Landscape gradients — profile headers
PexelsPresets.wallpapers()       // Beautiful scenery — wallpapers
PexelsPresets.curated()          // Pexels editorial picks

// ── Videos ──────────────────────────────────────────────────────
PexelsPresets.trendingVideos()   // Popular/trending videos
PexelsPresets.natureVideos()     // Nature footage
PexelsPresets.cityVideos()       // City street footage
PexelsPresets.peopleVideos()     // People lifestyle footage
PexelsPresets.sportsVideos()     // Sports action footage
PexelsPresets.musicVideos()      // Music & concert footage
PexelsPresets.storyVideos()      // Portrait videos for stories/reels

// Dynamic helpers
PexelsPresets.searchPhotos('golden hour')
PexelsPresets.searchVideos('ocean waves')
```

---

## 🔌 How to Use in LynkApp Components

### Feed Post Background Photos
```jsx
import PexelsService from '../services/pexels-service';

const { photos } = await PexelsService.getCuratedPhotos({ per_page: 20 });

photos.map(photo => (
  <div
    key={photo.id}
    style={{ backgroundColor: PexelsService.getPhotoColor(photo) }}
  >
    <img
      src={PexelsService.getPhotoUrl(photo, 'large')}
      alt={PexelsService.getPhotoAlt(photo)}
    />
    {/* ⚠️ REQUIRED attribution: */}
    <a href={PexelsService.getPhotoPageUrl(photo)} target="_blank" rel="noopener">
      {PexelsService.getPhotoAttributionText(photo)}
    </a>
  </div>
))
```

### Media Hub Video Player
```jsx
const { videos } = await PexelsService.getPopularVideos({ per_page: 15 });

videos.map(video => (
  <div key={video.id}>
    <video
      src={PexelsService.getVideoUrl(video, 'hd')}
      poster={PexelsService.getVideoThumbnail(video)}
      controls
    />
    {/* ⚠️ REQUIRED attribution: */}
    <p>{PexelsService.getVideoAttributionText(video)}</p>
  </div>
))
```

### Story Background Picker
```jsx
const { photos } = await PexelsService.searchPhotos('colorful abstract', {
  orientation: 'portrait',
  per_page: 20,
});
```

### Search Page — Photos Tab
```jsx
const { photos, total_results } = await PexelsService.searchPhotos(searchQuery, {
  per_page: 20,
  page: currentPage,
});
```

### Trending Videos Section
```jsx
const { videos } = await PexelsPresets.trendingVideos();
// or:
const { videos } = await PexelsService.getPopularVideos({ per_page: 15 });
```

---

## 📍 Where to Wire It In

| Feature | Location | Integration |
|---------|----------|-------------|
| **Feed** | `FeedPage.jsx` | Post background photos → `PexelsPresets.curated()` |
| **Stories** | `StoriesPage.jsx` | Background picker → `PexelsPresets.storyBackgrounds()` |
| **Media Hub** | `MediaHubPage.jsx` | Photo gallery + Video tab → `getCuratedPhotos()` + `getPopularVideos()` |
| **Profile** | `ProfilePage.jsx` | Banner photo → `PexelsPresets.profileBanners()` |
| **Search** | `SearchPage.jsx` | Photo tab → `searchPhotos(query)` |
| **Trending** | `TrendingPage.jsx` | Video section → `PexelsPresets.trendingVideos()` |
| **Onboarding** | `OnboardingPage.jsx` | Interest backgrounds → `PexelsPresets[interest]()` |
| **Live** | `LivePage.jsx` | Background overlays → `searchVideos('abstract')` |

---

## ⚠️ Pexels Terms of Service Requirements

### ✅ REQUIRED — Must Do:
1. **Show attribution on every page** that displays Pexels content:
   - Minimum: Text link `<a href="https://www.pexels.com">Photos provided by Pexels</a>`
   - Or use white/black logo images (provided in `PEXELS_ATTRIBUTION_HTML` constant)
2. **Link each photo back** to its Pexels page: `photo.url`
3. **Credit the photographer**: `"Photo by [name]"` linking to `photographer_url`

### ❌ NOT Allowed:
- Claiming photos/videos as your own
- Selling Pexels content directly
- Removing attribution or photographer credit

### Built-in helpers handle all attribution:
```js
PexelsService.PEXELS_ATTRIBUTION_HTML.textLink  // Already formatted
PexelsService.getPhotoAttributionText(photo)     // "Photo by Joey Farina on Pexels"
PexelsService.getVideoAttributionText(video)     // "Video by Joey Farina on Pexels"
```

---

## 📦 Photo Resource Object (key fields)
```js
photo = {
  id: 2014422,
  width: 3024,
  height: 3024,
  url: 'https://www.pexels.com/photo/...',         // Link to Pexels page (attribution)
  photographer: 'Joey Farina',                      // Creator credit
  photographer_url: 'https://www.pexels.com/@joey', // Creator profile link
  photographer_id: 680589,
  avg_color: '#978E82',                             // Dominant color for placeholders
  src: {
    original: '...',   // Full resolution
    large2x:  '...',   // 940px × 2x DPR
    large:    '...',   // 940px wide
    medium:   '...',   // 350px high
    small:    '...',   // 130px high
    portrait: '...',   // 800×1200 crop
    landscape:'...',   // 1200×627 crop
    tiny:     '...',   // 280×200 thumbnail
  },
  alt: 'Brown Rocks During Golden Hour',
}
```

## 🎬 Video Resource Object (key fields)
```js
video = {
  id: 2499611,
  width: 1080,
  height: 1920,
  url: 'https://www.pexels.com/video/2499611/',
  image: 'https://images.pexels.com/...',           // Thumbnail
  duration: 22,                                     // Seconds
  user: { id: 680589, name: 'Joey Farina', url: '...' },
  video_files: [
    { id: 125004, quality: 'hd', file_type: 'video/mp4', width: 1080, height: 1920, fps: 23.976, link: '...' },
    { id: 125005, quality: 'sd', file_type: 'video/mp4', width: 540,  height: 960,  fps: 23.976, link: '...' },
  ],
  video_pictures: [                                 // Preview frame strips
    { id: 308178, picture: '...preview-0.jpg', nr: 0 },
    { id: 308179, picture: '...preview-1.jpg', nr: 1 },
  ]
}
```

---

## ⚙️ Rate Limits

| Limit | Value |
|-------|-------|
| Requests per hour | 200 |
| Requests per month | 20,000 |
| Per-page max | 80 photos | 80 videos |

---

## ✅ Integration Status

| Item | Status |
|------|--------|
| API key in `ConnectHub-SPA/.env` | ✅ `VITE_PEXELS_API_KEY` |
| `.env.example` placeholder | ✅ Added |
| `pexels-service.js` created | ✅ 8 API functions + 22 presets + 14 helpers |
| Photos API | ✅ search, curated, by-ID, collections |
| Videos API | ✅ search, popular, by-ID |
| Attribution helpers | ✅ `PEXELS_ATTRIBUTION_HTML`, `getPhotoAttributionText()`, `getVideoAttributionText()` |
| Safe fallbacks | ✅ Returns empty arrays/null if key missing |
| Build passes | ✅ Exit 0 |
| Committed to GitHub | ✅ |

---

*Pexels Dashboard: https://www.pexels.com/api/*  
*GitHub: https://github.com/Watchdog088/Test-apps.git*  
*Service: `ConnectHub-SPA/src/services/pexels-service.js`*
