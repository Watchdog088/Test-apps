// src/services/unsplash-service.js — Unsplash Photo API
// Access Key: 4vLXSRzZRNTZhRVyJJ6j_XR14mZAmlIuZMy4ASEWQQo (VITE_UNSPLASH_ACCESS_KEY)
// Secret Key: Backend ONLY — never in frontend (UNSPLASH_SECRET_KEY in ConnectHub-Backend/.env)
// Dashboard: https://unsplash.com/developers  |  App ID: 954839
// Docs: https://unsplash.com/documentation
// Plan: Free — 50 req/hr (demo mode) | 5,000 req/hr after production approval
// ⚠️  Unsplash Terms: Must show photographer credit on every image displayed

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';

// ─── Validation ────────────────────────────────────────────────────────────
if (!UNSPLASH_ACCESS_KEY) {
  console.warn('[UnsplashService] VITE_UNSPLASH_ACCESS_KEY is not set. Photo features will be disabled.');
}

// ─── Helper: build URL with params ────────────────────────────────────────
function buildUrl(endpoint, params = {}) {
  const url = new URL(`${UNSPLASH_BASE_URL}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, v);
    }
  });
  return url.toString();
}

// ─── Helper: safe fetch with Authorization header ─────────────────────────
async function safeFetch(url) {
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1',
      },
    });
    if (!res.ok) throw new Error(`Unsplash API error: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('[UnsplashService] fetch error:', err);
    return null;
  }
}

// ─── 1. Search photos by keyword ──────────────────────────────────────────
// Usage: searchPhotos('nature', { per_page: 20 })
export async function searchPhotos(query, {
  page = 1,
  per_page = 20,
  order_by = 'relevant',    // relevant | latest
  color = '',               // black_and_white | black | white | yellow | orange | red | purple | magenta | green | teal | blue
  orientation = '',         // landscape | portrait | squarish
} = {}) {
  if (!UNSPLASH_ACCESS_KEY || !query?.trim()) return { results: [], total: 0 };

  const url = buildUrl('search/photos', { query: query.trim(), page, per_page, order_by, color, orientation });
  const data = await safeFetch(url);
  return data || { results: [], total: 0 };
}

// ─── 2. Get random photos ────────────────────────────────────────────────
// Usage: getRandomPhotos({ count: 10, query: 'city' })
export async function getRandomPhotos({
  count = 10,
  query = '',
  orientation = '',        // landscape | portrait | squarish
  collections = '',        // comma-separated collection IDs
  featured = false,
} = {}) {
  if (!UNSPLASH_ACCESS_KEY) return [];

  const url = buildUrl('photos/random', { count, query, orientation, collections, featured: featured || '' });
  const data = await safeFetch(url);
  return Array.isArray(data) ? data : (data ? [data] : []);
}

// ─── 3. Get a list of photos (editorial feed) ─────────────────────────────
// Usage: listPhotos({ order_by: 'latest', per_page: 30 })
export async function listPhotos({
  page = 1,
  per_page = 20,
  order_by = 'latest',     // latest | oldest | popular
} = {}) {
  if (!UNSPLASH_ACCESS_KEY) return [];

  const url = buildUrl('photos', { page, per_page, order_by });
  const data = await safeFetch(url);
  return Array.isArray(data) ? data : [];
}

// ─── 4. Get a single photo by ID ─────────────────────────────────────────
// Usage: getPhoto('abc123xyz')
export async function getPhoto(photoId) {
  if (!UNSPLASH_ACCESS_KEY || !photoId) return null;

  const url = buildUrl(`photos/${photoId}`);
  return await safeFetch(url);
}

// ─── 5. Get trending/popular photos ──────────────────────────────────────
export async function getTrendingPhotos({ per_page = 20 } = {}) {
  return listPhotos({ order_by: 'popular', per_page });
}

// ─── 6. Get curated topics (Unsplash editorial collections) ──────────────
// Topics: wallpapers, nature, architecture, travel, street-photography, etc.
export async function listTopics({ per_page = 20, order_by = 'featured' } = {}) {
  if (!UNSPLASH_ACCESS_KEY) return [];

  const url = buildUrl('topics', { per_page, order_by });
  const data = await safeFetch(url);
  return Array.isArray(data) ? data : [];
}

// ─── 7. Get photos for a specific topic ──────────────────────────────────
// Usage: getTopicPhotos('nature', { per_page: 20 })
export async function getTopicPhotos(topicSlug, { page = 1, per_page = 20, orientation = '' } = {}) {
  if (!UNSPLASH_ACCESS_KEY || !topicSlug) return [];

  const url = buildUrl(`topics/${topicSlug}/photos`, { page, per_page, orientation });
  const data = await safeFetch(url);
  return Array.isArray(data) ? data : [];
}

// ─── 8. Get a collection ─────────────────────────────────────────────────
export async function getCollection(collectionId) {
  if (!UNSPLASH_ACCESS_KEY || !collectionId) return null;

  const url = buildUrl(`collections/${collectionId}`);
  return await safeFetch(url);
}

// ─── 9. Get photos from a collection ─────────────────────────────────────
export async function getCollectionPhotos(collectionId, { page = 1, per_page = 20 } = {}) {
  if (!UNSPLASH_ACCESS_KEY || !collectionId) return [];

  const url = buildUrl(`collections/${collectionId}/photos`, { page, per_page });
  const data = await safeFetch(url);
  return Array.isArray(data) ? data : [];
}

// ─── 10. Get user profile ─────────────────────────────────────────────────
export async function getUnsplashUser(username) {
  if (!UNSPLASH_ACCESS_KEY || !username) return null;

  const url = buildUrl(`users/${username}`);
  return await safeFetch(url);
}

// ─── 11. Get photos by a specific user ───────────────────────────────────
export async function getUserPhotos(username, { per_page = 20 } = {}) {
  if (!UNSPLASH_ACCESS_KEY || !username) return [];

  const url = buildUrl(`users/${username}/photos`, { per_page });
  const data = await safeFetch(url);
  return Array.isArray(data) ? data : [];
}

// ─── 12. Track a download (required by Unsplash guidelines) ──────────────
// MUST be called when a user downloads or uses a photo at full resolution
export async function trackDownload(photo) {
  if (!UNSPLASH_ACCESS_KEY || !photo?.links?.download_location) return;

  try {
    await fetch(photo.links.download_location, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    });
  } catch (err) {
    console.warn('[UnsplashService] trackDownload failed:', err);
  }
}

// ─── 13. Search collections ───────────────────────────────────────────────
export async function searchCollections(query, { page = 1, per_page = 10 } = {}) {
  if (!UNSPLASH_ACCESS_KEY || !query?.trim()) return { results: [] };

  const url = buildUrl('search/collections', { query: query.trim(), page, per_page });
  const data = await safeFetch(url);
  return data || { results: [] };
}

// ─── 14. Search users ─────────────────────────────────────────────────────
export async function searchUsers(query, { page = 1, per_page = 10 } = {}) {
  if (!UNSPLASH_ACCESS_KEY || !query?.trim()) return { results: [] };

  const url = buildUrl('search/users', { query: query.trim(), page, per_page });
  const data = await safeFetch(url);
  return data || { results: [] };
}

// ─── 15. Get photo statistics ─────────────────────────────────────────────
export async function getPhotoStats(photoId) {
  if (!UNSPLASH_ACCESS_KEY || !photoId) return null;

  const url = buildUrl(`photos/${photoId}/statistics`);
  return await safeFetch(url);
}

// ─── Helper: get photo URL at specific size ───────────────────────────────
// size: 'thumb' (200px) | 'small' (400px) | 'regular' (1080px) | 'full' | 'raw'
export function getPhotoUrl(photo, size = 'regular') {
  return photo?.urls?.[size] || photo?.urls?.regular || '';
}

// ─── Helper: get low-quality placeholder (for blur-up loading) ───────────
export function getBlurUrl(photo) {
  return photo?.urls?.thumb || '';
}

// ─── Helper: get photographer credit (REQUIRED by Unsplash Terms) ─────────
// Returns object with name and profile URL for attribution
export function getAttribution(photo) {
  if (!photo?.user) return { name: 'Unknown', url: 'https://unsplash.com' };
  return {
    name: photo.user.name || photo.user.username,
    url: `${photo.user.links?.html}?utm_source=lynkapp&utm_medium=referral`,
    username: photo.user.username,
    avatar: photo.user.profile_image?.small || '',
  };
}

// ─── Helper: build attribution text string ────────────────────────────────
export function getAttributionText(photo) {
  const { name } = getAttribution(photo);
  return `Photo by ${name} on Unsplash`;
}

// ─── Helper: get dominant color ───────────────────────────────────────────
export function getPhotoColor(photo) {
  return photo?.color || '#888888';
}

// ─── Helper: get photo dimensions ─────────────────────────────────────────
export function getPhotoDimensions(photo) {
  return { width: photo?.width || 0, height: photo?.height || 0 };
}

// ─── Check if API key is configured ───────────────────────────────────────
export function isUnsplashConfigured() {
  return !!UNSPLASH_ACCESS_KEY && !UNSPLASH_ACCESS_KEY.startsWith('your_');
}

// ─── LynkApp preset photo collections ─────────────────────────────────────
// Use these for feed backgrounds, story covers, profile banners, etc.
export const UnsplashPresets = {
  // Feed content backgrounds
  nature:        () => getTopicPhotos('nature', { per_page: 20 }),
  travel:        () => getTopicPhotos('travel', { per_page: 20 }),
  architecture:  () => getTopicPhotos('architecture-interior', { per_page: 20 }),
  fashion:       () => getTopicPhotos('fashion-beauty', { per_page: 20 }),
  food:          () => getTopicPhotos('food-drink', { per_page: 20 }),
  technology:    () => getTopicPhotos('business-work', { per_page: 20 }),
  sports:        () => searchPhotos('sports action', { per_page: 20 }),
  music:         () => searchPhotos('music concert', { per_page: 20 }),

  // Profile & background photos
  profileBanners:    () => searchPhotos('abstract gradient', { orientation: 'landscape', per_page: 20 }),
  storyBackgrounds:  () => getRandomPhotos({ count: 20, orientation: 'portrait' }),
  wallpapers:        () => getTopicPhotos('wallpapers', { orientation: 'landscape', per_page: 20 }),

  // Trending editorial
  trending:      () => getTrendingPhotos({ per_page: 20 }),
  latest:        () => listPhotos({ order_by: 'latest', per_page: 20 }),

  // Specific search helpers
  search: (query) => searchPhotos(query, { per_page: 20 }),
};

// ─── Default export: full service object ─────────────────────────────────
const UnsplashService = {
  searchPhotos,
  getRandomPhotos,
  listPhotos,
  getPhoto,
  getTrendingPhotos,
  listTopics,
  getTopicPhotos,
  getCollection,
  getCollectionPhotos,
  getUnsplashUser,
  getUserPhotos,
  trackDownload,
  searchCollections,
  searchUsers,
  getPhotoStats,
  getPhotoUrl,
  getBlurUrl,
  getAttribution,
  getAttributionText,
  getPhotoColor,
  getPhotoDimensions,
  isUnsplashConfigured,
  UnsplashPresets,
};

export default UnsplashService;
