/**
 * freetogame-service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * FreeToGame API — 100% FREE, NO API KEY REQUIRED.
 * Database of free-to-play PC and browser games with screenshots,
 * system requirements, and detailed game info.
 *
 * API docs:  https://www.freetogame.com/api-doc
 * Base URL:  https://www.freetogame.com/api
 *
 * CORS note: FreeToGame does NOT send CORS headers for browser requests.
 *            Calls go through corsproxy.io (same proxy used by Deezer).
 *
 * Features implemented:
 *  1. Get all free-to-play games (with optional filters)
 *  2. Get a single game by ID (full details + screenshots)
 *  3. Filter games by platform (pc | browser | all)
 *  4. Filter games by category / genre
 *  5. Sort games (relevance | popularity | release-date | alphabetical | rating)
 *  6. Get games by multiple filters combined (platform + category + sort)
 *  7. Live games (filter by "live" tag — ongoing online games)
 *  8. Latest released games (sort by release date)
 *  9. Top-rated games (sort by rating)
 * 10. Search / filter games by title (client-side, since API has no search endpoint)
 *
 * All game objects are normalised to a consistent shape.
 */

const BASE  = 'https://www.freetogame.com/api';
const PROXY = 'https://corsproxy.io/?';

// ─── Internal helper ───────────────────────────────────────────────────────
async function ftgFetch(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  const proxyUrl = `${PROXY}${encodeURIComponent(url.toString())}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`FreeToGame API error ${res.status}`);
  return res.json();
}

// ─── Normalise a game summary (list item) ─────────────────────────────────
function normaliseGame(g) {
  return {
    id:           g.id,
    title:        g.title,
    thumbnail:    g.thumbnail,
    shortDesc:    g.short_description,
    gameUrl:      g.game_url,
    genre:        g.genre,
    platform:     g.platform,
    publisher:    g.publisher,
    developer:    g.developer,
    releaseDate:  g.release_date,
    freeToGameUrl: g.freetogame_profile_url,
  };
}

// ─── Normalise a full game detail ─────────────────────────────────────────
function normaliseGameDetail(g) {
  return {
    ...normaliseGame(g),
    status:       g.status,
    description:  g.description,
    screenshots:  (g.screenshots || []).map(s => s.image),
    minimumSystemRequirements: g.minimum_system_requirements || null,
  };
}

// ─── 1. Get All Games ─────────────────────────────────────────────────────
/**
 * Get all free-to-play games.
 * @param {object} opts - { platform, category, sort-by }
 *   platform: 'pc' | 'browser' | 'all'  (default: 'all')
 *   category: see CATEGORIES constant below
 *   'sort-by': 'release-date' | 'popularity' | 'alphabetical' | 'relevance'
 */
export async function getAllGames(opts = {}) {
  const params = {};
  if (opts.platform)  params.platform  = opts.platform;
  if (opts.category)  params.category  = opts.category;
  if (opts['sort-by']) params['sort-by'] = opts['sort-by'];
  const data = await ftgFetch('/games', params);
  return Array.isArray(data) ? data.map(normaliseGame) : [];
}

// ─── 2. Get Single Game Details ────────────────────────────────────────────
/**
 * Get full game details including screenshots and system requirements.
 * @param {number} gameId
 */
export async function getGame(gameId) {
  const data = await ftgFetch('/game', { id: gameId });
  return normaliseGameDetail(data);
}

// ─── 3. Games by Platform ─────────────────────────────────────────────────
export async function getGamesByPlatform(platform = 'all') {
  return getAllGames({ platform });
}

// ─── 4. Games by Category ─────────────────────────────────────────────────
/**
 * @param {string} category  e.g. 'mmorpg', 'shooter', 'battle-royale', 'moba'
 */
export async function getGamesByCategory(category) {
  return getAllGames({ category });
}

// ─── 5. Sort Games ────────────────────────────────────────────────────────
/**
 * @param {string} sortBy  'release-date' | 'popularity' | 'alphabetical' | 'relevance'
 */
export async function getGamesSorted(sortBy = 'popularity') {
  return getAllGames({ 'sort-by': sortBy });
}

// ─── 6. Filter Games (Platform + Category + Sort) ─────────────────────────
/**
 * Apply multiple filters at once.
 * Uses the /filter endpoint when platform+tag+sort are all specified.
 */
export async function filterGames({ platform, tag, sort } = {}) {
  const params = {};
  if (platform) params.platform = platform;
  if (tag)      params.tag      = tag;       // comma-separated for multi-tag
  if (sort)     params['sort-by'] = sort;
  // /filter supports multi-tag queries
  const data = await ftgFetch('/filter', params);
  return Array.isArray(data) ? data.map(normaliseGame) : [];
}

// ─── 7. Live / Active Online Games ────────────────────────────────────────
export async function getLiveGames() {
  return filterGames({ tag: 'pvp,pve' });
}

// ─── 8. Latest Released Games ─────────────────────────────────────────────
export async function getLatestGames(platform = 'all') {
  return getAllGames({ platform, 'sort-by': 'release-date' });
}

// ─── 9. Top-Rated Games ───────────────────────────────────────────────────
export async function getTopRatedGames(platform = 'all') {
  // "relevance" approximates top-rated/featured in FreeToGame's ranking
  return getAllGames({ platform, 'sort-by': 'relevance' });
}

// ─── 10. Client-side Search by Title ─────────────────────────────────────
/**
 * Search games by title (client-side filter — fetches all then filters).
 * @param {string} query
 * @param {object} opts  - same options as getAllGames
 */
export async function searchGames(query, opts = {}) {
  const games = await getAllGames(opts);
  const q = query.toLowerCase().trim();
  return games.filter(g =>
    g.title.toLowerCase().includes(q) ||
    g.genre.toLowerCase().includes(q) ||
    (g.shortDesc || '').toLowerCase().includes(q)
  );
}

// ─── Genre / Category constants ────────────────────────────────────────────
export const GAME_CATEGORIES = [
  'mmorpg', 'shooter', 'strategy', 'moba', 'racing', 'sports',
  'social', 'sandbox', 'open-world', 'survival', 'pvp', 'pve',
  'pixel', 'voxel', 'zombie', 'turn-based', 'first-person',
  'third-Person', 'top-down', 'tank', 'space', 'sailing',
  'side-scroller', 'superhero', 'permadeath', 'card', 'battle-royale',
  'mmo', 'mmofps', 'mmotps', '3d', '2d', 'anime', 'fantasy',
  'sci-fi', 'fighting', 'action-rpg', 'action', 'military',
  'martial-arts', 'flight', 'low-spec', 'tower-defense',
  'horror', 'mmorts',
];

export const GAME_PLATFORMS = [
  { value: 'all',     label: 'All Platforms', emoji: '🎮' },
  { value: 'pc',      label: 'PC',            emoji: '🖥️' },
  { value: 'browser', label: 'Browser',       emoji: '🌐' },
];
