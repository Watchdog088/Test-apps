// src/services/giphy-service.js — Giphy GIF search & trending API
// API Key: ekdmBElA27eDXZQodVbRvQSTD4x0RLSX (stored in .env as VITE_GIPHY_API_KEY)
// Dashboard: https://developers.giphy.com/dashboard/
// Docs: https://developers.giphy.com/docs/api/

const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY;
const GIPHY_BASE_URL = 'https://api.giphy.com/v1/gifs';

// ─── Validation ────────────────────────────────────────────────────────────
if (!GIPHY_API_KEY) {
  console.warn('[GiphyService] VITE_GIPHY_API_KEY is not set. GIF features will be disabled.');
}

// ─── Helper: build URL with params ────────────────────────────────────────
function buildUrl(endpoint, params = {}) {
  const url = new URL(`${GIPHY_BASE_URL}/${endpoint}`);
  url.searchParams.set('api_key', GIPHY_API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

// ─── 1. Search GIFs ───────────────────────────────────────────────────────
// Usage: searchGifs('happy') → array of GIF objects
export async function searchGifs(query, { limit = 20, offset = 0, rating = 'pg-13', lang = 'en' } = {}) {
  if (!GIPHY_API_KEY) return { data: [], pagination: {} };
  if (!query || !query.trim()) return { data: [], pagination: {} };

  try {
    const url = buildUrl('search', { q: query.trim(), limit, offset, rating, lang });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Giphy search failed: ${res.status}`);
    const json = await res.json();
    return {
      data: json.data || [],
      pagination: json.pagination || {},
      total: json.pagination?.total_count || 0,
    };
  } catch (err) {
    console.error('[GiphyService] searchGifs error:', err);
    return { data: [], pagination: {}, total: 0 };
  }
}

// ─── 2. Trending GIFs ─────────────────────────────────────────────────────
// Usage: getTrendingGifs() → array of currently trending GIFs
export async function getTrendingGifs({ limit = 20, offset = 0, rating = 'pg-13' } = {}) {
  if (!GIPHY_API_KEY) return { data: [] };

  try {
    const url = buildUrl('trending', { limit, offset, rating });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Giphy trending failed: ${res.status}`);
    const json = await res.json();
    return { data: json.data || [] };
  } catch (err) {
    console.error('[GiphyService] getTrendingGifs error:', err);
    return { data: [] };
  }
}

// ─── 3. Get single GIF by ID ──────────────────────────────────────────────
export async function getGifById(gifId) {
  if (!GIPHY_API_KEY || !gifId) return null;

  try {
    const url = `${GIPHY_BASE_URL}/${gifId}?api_key=${GIPHY_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Giphy getById failed: ${res.status}`);
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error('[GiphyService] getGifById error:', err);
    return null;
  }
}

// ─── 4. Translate text → single GIF ──────────────────────────────────────
// Giphy "translate" picks one best GIF for a phrase — good for reactions
export async function translateToGif(phrase, { weirdness = 5 } = {}) {
  if (!GIPHY_API_KEY || !phrase) return null;

  try {
    const url = buildUrl('translate', { s: phrase.trim(), weirdness });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Giphy translate failed: ${res.status}`);
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error('[GiphyService] translateToGif error:', err);
    return null;
  }
}

// ─── 5. Random GIF ────────────────────────────────────────────────────────
export async function getRandomGif({ tag = '', rating = 'pg-13' } = {}) {
  if (!GIPHY_API_KEY) return null;

  try {
    const params = { rating };
    if (tag) params.tag = tag;
    const url = buildUrl('random', params);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Giphy random failed: ${res.status}`);
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error('[GiphyService] getRandomGif error:', err);
    return null;
  }
}

// ─── 6. Sticker search (animated stickers) ────────────────────────────────
export async function searchStickers(query, { limit = 20, offset = 0, rating = 'pg-13' } = {}) {
  if (!GIPHY_API_KEY) return { data: [] };
  if (!query || !query.trim()) return { data: [] };

  try {
    const url = new URL('https://api.giphy.com/v1/stickers/search');
    url.searchParams.set('api_key', GIPHY_API_KEY);
    url.searchParams.set('q', query.trim());
    url.searchParams.set('limit', limit);
    url.searchParams.set('offset', offset);
    url.searchParams.set('rating', rating);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Giphy sticker search failed: ${res.status}`);
    const json = await res.json();
    return { data: json.data || [] };
  } catch (err) {
    console.error('[GiphyService] searchStickers error:', err);
    return { data: [] };
  }
}

// ─── 7. Extract best image URL from a GIF object ─────────────────────────
// Giphy returns many sizes — this picks the right one for each use case
export function getGifUrl(gif, size = 'fixed_height') {
  if (!gif || !gif.images) return '';
  const image = gif.images[size] || gif.images.fixed_height || gif.images.original;
  return image?.url || image?.webp || '';
}

// Convenience shortcuts for common sizes:
export const getGifPreviewUrl   = (gif) => getGifUrl(gif, 'fixed_height_small');  // 100px — for picker grid
export const getGifFullUrl      = (gif) => getGifUrl(gif, 'fixed_height');         // 200px — for chat bubbles
export const getGifOriginalUrl  = (gif) => getGifUrl(gif, 'original');             // full size — for story view
export const getGifDownsizedUrl = (gif) => getGifUrl(gif, 'downsized');            // < 2MB — safe for upload

// ─── 8. Format GIF for sending in chat ───────────────────────────────────
// Returns the object shape to store in Firestore as a chat message
export function formatGifMessage(gif) {
  if (!gif) return null;
  return {
    type: 'gif',
    gifId: gif.id,
    title: gif.title || '',
    url: getGifFullUrl(gif),
    previewUrl: getGifPreviewUrl(gif),
    originalUrl: getGifOriginalUrl(gif),
    width: gif.images?.fixed_height?.width || '200',
    height: gif.images?.fixed_height?.height || '200',
    source: 'giphy',
    attribution: 'Powered by GIPHY',  // ← Giphy ToS requires attribution
  };
}

// ─── 9. Check if API key is configured ───────────────────────────────────
export function isGiphyConfigured() {
  return !!GIPHY_API_KEY && !GIPHY_API_KEY.startsWith('MISSING');
}

// ─── Default export: full service object ─────────────────────────────────
const GiphyService = {
  searchGifs,
  getTrendingGifs,
  getGifById,
  translateToGif,
  getRandomGif,
  searchStickers,
  getGifUrl,
  getGifPreviewUrl,
  getGifFullUrl,
  getGifOriginalUrl,
  getGifDownsizedUrl,
  formatGifMessage,
  isGiphyConfigured,
};

export default GiphyService;
