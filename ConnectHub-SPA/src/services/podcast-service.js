// src/services/podcast-service.js
// Podcast data via iTunes Search API — completely FREE, no API key required.
// Library (subscriptions + playback progress) persisted in localStorage.
//
// WHY iTunes Search API?
//  • 100% free, no account or key needed
//  • Returns cover art, author, episode count, RSS feed URL
//  • Works cross-origin from browsers (CORS enabled by Apple)
//  • 4 million+ podcasts indexed
//
// FUTURE UPGRADE PATH:
//  • Swap to Podcast Index API (podcastindex.org) for richer episode data
//    and chapter markers — free but requires a key pair.

const ITUNES_BASE = 'https://itunes.apple.com';
const CORS_PROXY  = ''; // empty = direct (iTunes allows CORS)
const LS_SUBS     = 'lynk_podcast_subscriptions';
const LS_PROGRESS = 'lynk_podcast_progress';

// ── Genre IDs from iTunes (used for category browsing) ───────────────────────
export const PODCAST_GENRES = [
  { id: '1318', name: 'Technology',   emoji: '💻' },
  { id: '1321', name: 'Business',     emoji: '💼' },
  { id: '1302', name: 'Comedy',       emoji: '😂' },
  { id: '1315', name: 'Science',      emoji: '🔬' },
  { id: '1309', name: 'News',         emoji: '📰' },
  { id: '1301', name: 'Arts',         emoji: '🎨' },
  { id: '1487', name: 'True Crime',   emoji: '🔍' },
  { id: '1305', name: 'Sports',       emoji: '⚽' },
  { id: '1307', name: 'Health',       emoji: '🏃' },
  { id: '1310', name: 'Music',        emoji: '🎵' },
  { id: '1304', name: 'Education',    emoji: '📚' },
  { id: '1444', name: 'Religion',     emoji: '✝️' },
  { id: '1325', name: 'Society',      emoji: '🌍' },
  { id: '1303', name: 'Leisure',      emoji: '🎮' },
];

// ── Search podcasts ───────────────────────────────────────────────────────────
export async function searchPodcasts(term, limit = 20) {
  const url = `${ITUNES_BASE}/search?term=${encodeURIComponent(term)}&entity=podcast&limit=${limit}&media=podcast`;
  const res = await fetch(CORS_PROXY + url);
  if (!res.ok) throw new Error(`iTunes search failed: ${res.status}`);
  const json = await res.json();
  return (json.results || []).map(normalisePodcast);
}

// ── Browse by genre ───────────────────────────────────────────────────────────
export async function browsePodcastsByGenre(genreId, limit = 20) {
  // iTunes top-charts by genre
  const url = `${ITUNES_BASE}/search?term=podcast&genreId=${genreId}&entity=podcast&limit=${limit}&media=podcast`;
  const res = await fetch(CORS_PROXY + url);
  if (!res.ok) throw new Error(`iTunes genre fetch failed: ${res.status}`);
  const json = await res.json();
  return (json.results || []).map(normalisePodcast);
}

// ── Get episodes for a podcast (by iTunes collection ID) ─────────────────────
export async function getPodcastEpisodes(collectionId, limit = 30) {
  const url = `${ITUNES_BASE}/lookup?id=${collectionId}&entity=podcastEpisode&limit=${limit}`;
  const res = await fetch(CORS_PROXY + url);
  if (!res.ok) throw new Error(`iTunes lookup failed: ${res.status}`);
  const json = await res.json();
  // First result is the podcast itself; rest are episodes
  return (json.results || [])
    .filter(r => r.wrapperType === 'podcastEpisode')
    .map(normaliseEpisode);
}

// ── Trending / featured (curated popular searches) ───────────────────────────
export async function getTrendingPodcasts() {
  const seeds = ['true crime', 'tech news', 'comedy', 'business', 'science'];
  const seed = seeds[Math.floor(Math.random() * seeds.length)];
  return searchPodcasts(seed, 12);
}

// ── Normalise raw iTunes podcast object ──────────────────────────────────────
function normalisePodcast(r) {
  return {
    id:           String(r.collectionId || r.trackId || Math.random()),
    collectionId: r.collectionId,
    name:         r.collectionName || r.trackName || 'Unknown Podcast',
    author:       r.artistName || 'Unknown Author',
    cover:        (r.artworkUrl600 || r.artworkUrl100 || '').replace('100x100', '400x400'),
    genre:        (r.genres || [])[0] || 'General',
    episodes:     r.trackCount || 0,
    feedUrl:      r.feedUrl || null,
    country:      r.country || '',
    itunesUrl:    r.collectionViewUrl || '',
  };
}

// ── Normalise raw iTunes episode object ──────────────────────────────────────
function normaliseEpisode(r) {
  return {
    id:          String(r.trackId || Math.random()),
    title:       r.trackName || 'Episode',
    description: r.description || r.shortDescription || '',
    duration:    r.trackTimeMillis ? Math.round(r.trackTimeMillis / 1000) : 0,
    releaseDate: r.releaseDate || '',
    audioUrl:    r.episodeUrl || '',
    cover:       (r.artworkUrl160 || r.artworkUrl60 || '').replace('60x60', '400x400'),
    episodeType: r.episodeType || 'full',
  };
}

// ── LOCAL LIBRARY (localStorage) ─────────────────────────────────────────────

export function getSubscriptions() {
  try { return JSON.parse(localStorage.getItem(LS_SUBS) || '[]'); }
  catch { return []; }
}

export function isSubscribed(podcastId) {
  return getSubscriptions().some(s => s.id === String(podcastId));
}

export function subscribe(podcast) {
  const subs = getSubscriptions().filter(s => s.id !== String(podcast.id));
  subs.unshift({ ...podcast, subscribedAt: Date.now() });
  localStorage.setItem(LS_SUBS, JSON.stringify(subs));
}

export function unsubscribe(podcastId) {
  const subs = getSubscriptions().filter(s => s.id !== String(podcastId));
  localStorage.setItem(LS_SUBS, JSON.stringify(subs));
}

// ── Playback progress ─────────────────────────────────────────────────────────
export function getProgress(episodeId) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_PROGRESS) || '{}');
    return all[String(episodeId)] || 0; // seconds
  } catch { return 0; }
}

export function saveProgress(episodeId, seconds) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_PROGRESS) || '{}');
    all[String(episodeId)] = seconds;
    localStorage.setItem(LS_PROGRESS, JSON.stringify(all));
  } catch {}
}

export function formatDuration(seconds) {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2,'0')}s`;
  return `${s}s`;
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default {
  searchPodcasts,
  browsePodcastsByGenre,
  getPodcastEpisodes,
  getTrendingPodcasts,
  getSubscriptions,
  isSubscribed,
  subscribe,
  unsubscribe,
  getProgress,
  saveProgress,
  formatDuration,
  formatDate,
  PODCAST_GENRES,
};
