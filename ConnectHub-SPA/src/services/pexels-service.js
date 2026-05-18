// src/services/pexels-service.js — Pexels Photos & Videos API
// API Key: tEbzEdpS6T3Wl2KaSBMgg2haM1lVGoEd8mGyAfqaB4v7BjoT2qn5La3z (VITE_PEXELS_API_KEY)
// Dashboard: https://www.pexels.com/api/
// Docs: https://www.pexels.com/api/documentation/
// Plan: Free — 200 req/hr | 20,000 req/month
// ⚠️  Attribution REQUIRED: Show "Photos provided by Pexels" linking to https://www.pexels.com
// ⚠️  Single key covers BOTH Photos API (/v1/) and Videos API (/videos/)

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const PEXELS_PHOTOS_BASE = 'https://api.pexels.com/v1';
const PEXELS_VIDEOS_BASE = 'https://api.pexels.com/videos';

// ─── Validation ────────────────────────────────────────────────────────────
if (!PEXELS_API_KEY) {
  console.warn('[PexelsService] VITE_PEXELS_API_KEY is not set. Photo/Video features will be disabled.');
}

// ─── Helper: safe fetch with Authorization header ─────────────────────────
async function safeFetch(url) {
  try {
    const res = await fetch(url, {
      headers: { Authorization: PEXELS_API_KEY },
    });
    if (!res.ok) throw new Error(`Pexels API error: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('[PexelsService] fetch error:', err);
    return null;
  }
}

// ─── Helper: build URL with query params ──────────────────────────────────
function buildUrl(base, endpoint, params = {}) {
  const url = new URL(`${base}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  });
  return url.toString();
}

// ═══════════════════════════════════════════════════════════════
//  PHOTOS API
// ═══════════════════════════════════════════════════════════════

// ─── 1. Search photos ─────────────────────────────────────────────────────
// Usage: searchPhotos('nature', { per_page: 20 })
export async function searchPhotos(query, {
  page = 1,
  per_page = 20,
  orientation = '',   // landscape | portrait | square
  size = '',          // large | medium | small
  color = '',         // red | orange | yellow | green | turquoise | blue | violet | pink | brown | black | gray | white
  locale = '',        // en-US | pt-BR | es-ES | ca-ES | de-DE | it-IT | fr-FR | sv-SE | id-ID | pl-PL | ja-JP | zh-TW | zh-CN | ko-KR | th-TH | nl-NL | hu-HU | vi-VN | cs-CZ | da-DK | fi-FI | uk-UA | el-GR | ro-RO | nb-NO | sk-SK | tr-TR | ru-RU
} = {}) {
  if (!PEXELS_API_KEY || !query?.trim()) return { photos: [], total_results: 0 };

  const url = buildUrl(PEXELS_PHOTOS_BASE, 'search', { query: query.trim(), page, per_page, orientation, size, color, locale });
  const data = await safeFetch(url);
  return data || { photos: [], total_results: 0 };
}

// ─── 2. Get curated photos (editorial feed) ───────────────────────────────
export async function getCuratedPhotos({ page = 1, per_page = 20 } = {}) {
  if (!PEXELS_API_KEY) return { photos: [] };

  const url = buildUrl(PEXELS_PHOTOS_BASE, 'curated', { page, per_page });
  const data = await safeFetch(url);
  return data || { photos: [] };
}

// ─── 3. Get a single photo by ID ─────────────────────────────────────────
export async function getPhoto(photoId) {
  if (!PEXELS_API_KEY || !photoId) return null;

  const url = `${PEXELS_PHOTOS_BASE}/photos/${photoId}`;
  return await safeFetch(url);
}

// ─── 4. Get photos from a collection ────────────────────────────────────
export async function getCollectionMedia(collectionId, { page = 1, per_page = 20, type = 'photos' } = {}) {
  if (!PEXELS_API_KEY || !collectionId) return { media: [] };

  const url = buildUrl(PEXELS_PHOTOS_BASE, `collections/${collectionId}`, { page, per_page, type });
  const data = await safeFetch(url);
  return data || { media: [] };
}

// ─── 5. Get featured collections ─────────────────────────────────────────
export async function getFeaturedCollections({ page = 1, per_page = 15 } = {}) {
  if (!PEXELS_API_KEY) return { collections: [] };

  const url = buildUrl(PEXELS_PHOTOS_BASE, 'collections/featured', { page, per_page });
  const data = await safeFetch(url);
  return data || { collections: [] };
}

// ═══════════════════════════════════════════════════════════════
//  VIDEOS API
// ═══════════════════════════════════════════════════════════════

// ─── 6. Search videos ─────────────────────────────────────────────────────
// Usage: searchVideos('sunset', { per_page: 10 })
export async function searchVideos(query, {
  page = 1,
  per_page = 15,
  orientation = '',   // landscape | portrait | square
  size = '',          // large | medium | small
  locale = '',
} = {}) {
  if (!PEXELS_API_KEY || !query?.trim()) return { videos: [], total_results: 0 };

  const url = buildUrl(PEXELS_VIDEOS_BASE, 'search', { query: query.trim(), page, per_page, orientation, size, locale });
  const data = await safeFetch(url);
  return data || { videos: [], total_results: 0 };
}

// ─── 7. Get popular videos ────────────────────────────────────────────────
export async function getPopularVideos({
  page = 1,
  per_page = 15,
  min_width = '',
  min_height = '',
  min_duration = '',
  max_duration = '',
} = {}) {
  if (!PEXELS_API_KEY) return { videos: [] };

  const url = buildUrl(PEXELS_VIDEOS_BASE, 'popular', { page, per_page, min_width, min_height, min_duration, max_duration });
  const data = await safeFetch(url);
  return data || { videos: [] };
}

// ─── 8. Get a single video by ID ─────────────────────────────────────────
export async function getVideo(videoId) {
  if (!PEXELS_API_KEY || !videoId) return null;

  const url = `${PEXELS_VIDEOS_BASE}/videos/${videoId}`;
  return await safeFetch(url);
}

// ═══════════════════════════════════════════════════════════════
//  PHOTO HELPERS
// ═══════════════════════════════════════════════════════════════

// Get photo URL at a specific size
// size: 'original' | 'large2x' | 'large' | 'medium' | 'small' | 'portrait' | 'landscape' | 'tiny'
export function getPhotoUrl(photo, size = 'large') {
  return photo?.src?.[size] || photo?.src?.large || photo?.src?.medium || '';
}

// Get photographer credit (REQUIRED by Pexels Terms)
export function getPhotographer(photo) {
  return {
    name: photo?.photographer || 'Unknown',
    url: photo?.photographer_url || 'https://www.pexels.com',
    id: photo?.photographer_id || null,
  };
}

// Get the photo's Pexels page URL
export function getPhotoPageUrl(photo) {
  return photo?.url || 'https://www.pexels.com';
}

// Get average/dominant color for placeholder background
export function getPhotoColor(photo) {
  return photo?.avg_color || '#888888';
}

// Get photo alt text
export function getPhotoAlt(photo) {
  return photo?.alt || 'Photo from Pexels';
}

// Get photo dimensions
export function getPhotoDimensions(photo) {
  return { width: photo?.width || 0, height: photo?.height || 0 };
}

// ═══════════════════════════════════════════════════════════════
//  VIDEO HELPERS
// ═══════════════════════════════════════════════════════════════

// Get best video file URL by preferred quality
// quality: 'hd' | 'sd' | 'uhd' (returns best match available)
export function getVideoUrl(video, quality = 'hd') {
  if (!video?.video_files?.length) return '';

  const files = video.video_files;

  // Try to find exact quality match
  const exact = files.find(f => f.quality === quality);
  if (exact) return exact.link;

  // Fallback: hd > sd > first available
  const hd = files.find(f => f.quality === 'hd');
  const sd = files.find(f => f.quality === 'sd');
  return (hd || sd || files[0])?.link || '';
}

// Get video thumbnail/preview image
export function getVideoThumbnail(video) {
  return video?.image || video?.video_pictures?.[0]?.picture || '';
}

// Get all video preview thumbnails (for scrubbing preview strips)
export function getVideoPreviewFrames(video) {
  return video?.video_pictures?.map(p => p.picture) || [];
}

// Get videographer credit
export function getVideographer(video) {
  return {
    name: video?.user?.name || 'Unknown',
    url: video?.user?.url || 'https://www.pexels.com',
    id: video?.user?.id || null,
  };
}

// Get video dimensions
export function getVideoDimensions(video) {
  return { width: video?.width || 0, height: video?.height || 0 };
}

// Get video duration in seconds
export function getVideoDuration(video) {
  return video?.duration || 0;
}

// ═══════════════════════════════════════════════════════════════
//  ATTRIBUTION HELPERS (REQUIRED by Pexels ToS)
// ═══════════════════════════════════════════════════════════════

// Get attribution text for a photo
export function getPhotoAttributionText(photo) {
  const { name } = getPhotographer(photo);
  return `Photo by ${name} on Pexels`;
}

// Get attribution text for a video
export function getVideoAttributionText(video) {
  const { name } = getVideographer(video);
  return `Video by ${name} on Pexels`;
}

// Returns the required Pexels logo attribution HTML (use one of these on every page)
export const PEXELS_ATTRIBUTION_HTML = {
  // Text link (minimal — always acceptable)
  textLink: `<a href="https://www.pexels.com" target="_blank" rel="noopener">Photos provided by Pexels</a>`,
  // White logo (for dark backgrounds)
  whiteLogo: `<a href="https://www.pexels.com" target="_blank" rel="noopener"><img src="https://images.pexels.com/lib/api/pexels-white.png" alt="Pexels" /></a>`,
  // Black logo (for light backgrounds)
  blackLogo: `<a href="https://www.pexels.com" target="_blank" rel="noopener"><img src="https://images.pexels.com/lib/api/pexels.png" alt="Pexels" /></a>`,
};

// ─── Check if configured ─────────────────────────────────────────────────
export function isPexelsConfigured() {
  return !!PEXELS_API_KEY && !PEXELS_API_KEY.startsWith('your_');
}

// ═══════════════════════════════════════════════════════════════
//  LYNKAPP PRESETS — ready-to-use content for each section
// ═══════════════════════════════════════════════════════════════
export const PexelsPresets = {
  // ── Photo presets ──────────────────────────────────────────
  // Feed backgrounds / post images
  people:       () => searchPhotos('people lifestyle', { per_page: 20 }),
  nature:       () => searchPhotos('nature landscape', { per_page: 20 }),
  city:         () => searchPhotos('city street', { per_page: 20 }),
  food:         () => searchPhotos('food meal', { per_page: 20 }),
  fashion:      () => searchPhotos('fashion style', { per_page: 20 }),
  travel:       () => searchPhotos('travel adventure', { per_page: 20 }),
  sports:       () => searchPhotos('sports action', { per_page: 20 }),
  music:        () => searchPhotos('music concert', { per_page: 20 }),
  technology:   () => searchPhotos('technology digital', { per_page: 20 }),
  business:     () => searchPhotos('business office', { per_page: 20 }),

  // Story/profile backgrounds
  storyBackgrounds:   () => searchPhotos('colorful abstract', { orientation: 'portrait', per_page: 20 }),
  profileBanners:     () => searchPhotos('abstract gradient', { orientation: 'landscape', per_page: 20 }),
  wallpapers:         () => searchPhotos('beautiful scenery', { orientation: 'landscape', per_page: 20 }),

  // Editorial (Pexels curated)
  curated:      () => getCuratedPhotos({ per_page: 20 }),

  // ── Video presets ──────────────────────────────────────────
  // Media Hub / Live backgrounds / Trending
  trendingVideos:     () => getPopularVideos({ per_page: 15 }),
  natureVideos:       () => searchVideos('nature', { per_page: 15 }),
  cityVideos:         () => searchVideos('city street', { orientation: 'landscape', per_page: 15 }),
  peopleVideos:       () => searchVideos('people lifestyle', { per_page: 15 }),
  sportsVideos:       () => searchVideos('sports action', { per_page: 15 }),
  musicVideos:        () => searchVideos('music concert', { per_page: 15 }),

  // Short portrait videos for stories/reels
  storyVideos:        () => searchVideos('lifestyle', { orientation: 'portrait', per_page: 15 }),

  // Dynamic helpers
  searchPhotos: (query) => searchPhotos(query, { per_page: 20 }),
  searchVideos: (query) => searchVideos(query, { per_page: 15 }),
};

// ─── Default export: full service object ─────────────────────────────────
const PexelsService = {
  // Photos
  searchPhotos,
  getCuratedPhotos,
  getPhoto,
  getCollectionMedia,
  getFeaturedCollections,
  // Videos
  searchVideos,
  getPopularVideos,
  getVideo,
  // Photo helpers
  getPhotoUrl,
  getPhotographer,
  getPhotoPageUrl,
  getPhotoColor,
  getPhotoAlt,
  getPhotoDimensions,
  getPhotoAttributionText,
  // Video helpers
  getVideoUrl,
  getVideoThumbnail,
  getVideoPreviewFrames,
  getVideographer,
  getVideoDimensions,
  getVideoDuration,
  getVideoAttributionText,
  // Attribution
  PEXELS_ATTRIBUTION_HTML,
  isPexelsConfigured,
  // Presets
  PexelsPresets,
};

export default PexelsService;
