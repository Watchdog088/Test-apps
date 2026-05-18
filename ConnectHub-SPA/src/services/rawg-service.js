// src/services/rawg-service.js — RAWG Game Database API
// API Key: 70f7dae8dba4414cb95aad73b328e2fc (stored in .env as VITE_RAWG_API_KEY)
// Dashboard: https://rawg.io/apidocs
// Docs: https://api.rawg.io/docs/
// Plan: Free — 20,000 requests/month | Renews: 6/18/2026
// Registered to: Lynkapp | CEO@lynkapp.net | https://lynkapp.com

const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

// ─── Validation ────────────────────────────────────────────────────────────
if (!RAWG_API_KEY) {
  console.warn('[RawgService] VITE_RAWG_API_KEY is not set. Gaming Hub features will be disabled.');
}

// ─── Helper: build URL with params ────────────────────────────────────────
function buildUrl(endpoint, params = {}) {
  const url = new URL(`${RAWG_BASE_URL}/${endpoint}`);
  url.searchParams.set('key', RAWG_API_KEY);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, v);
    }
  });
  return url.toString();
}

// ─── Helper: safe fetch with error handling ────────────────────────────────
async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`RAWG API error: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('[RawgService] fetch error:', err);
    return null;
  }
}

// ─── 1. Get list of games (with filters) ──────────────────────────────────
// Usage: getGames({ page_size: 20, ordering: '-rating', genres: 'action' })
export async function getGames({
  page = 1,
  page_size = 20,
  ordering = '-rating',       // -rating, -released, -added, -metacritic
  genres = '',                // action, adventure, rpg, shooter, puzzle, etc.
  platforms = '',             // 4=PC, 18=PS4, 1=Xbox, 7=Switch, 21=Android, 3=iOS
  tags = '',
  search = '',
  dates = '',                 // e.g. '2023-01-01,2024-12-31'
  metacritic = '',            // e.g. '80,100'
} = {}) {
  if (!RAWG_API_KEY) return { results: [], count: 0 };

  const url = buildUrl('games', {
    page, page_size, ordering, genres, platforms,
    tags, search, dates, metacritic,
  });

  const data = await safeFetch(url);
  return data || { results: [], count: 0 };
}

// ─── 2. Search games by name ──────────────────────────────────────────────
// Usage: searchGames('Fortnite') → array of game results
export async function searchGames(query, { page_size = 10 } = {}) {
  if (!RAWG_API_KEY || !query?.trim()) return { results: [] };

  const url = buildUrl('games', { search: query.trim(), page_size, search_exact: false });
  const data = await safeFetch(url);
  return data || { results: [] };
}

// ─── 3. Get single game details ────────────────────────────────────────────
// Usage: getGameDetails(3498) → full game object (3498 = GTA V)
export async function getGameDetails(gameId) {
  if (!RAWG_API_KEY || !gameId) return null;

  const url = buildUrl(`games/${gameId}`);
  return await safeFetch(url);
}

// ─── 4. Get trending / popular games ─────────────────────────────────────
// Returns games sorted by number of recent additions to user libraries
export async function getTrendingGames({ page_size = 20 } = {}) {
  return getGames({ ordering: '-added', page_size });
}

// ─── 5. Get highest-rated games ───────────────────────────────────────────
export async function getTopRatedGames({ page_size = 20, metacritic = '80,100' } = {}) {
  return getGames({ ordering: '-metacritic', metacritic, page_size });
}

// ─── 6. Get new releases ──────────────────────────────────────────────────
export async function getNewReleases({ page_size = 20 } = {}) {
  const today = new Date();
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const startDate = threeMonthsAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  return getGames({ ordering: '-released', dates: `${startDate},${endDate}`, page_size });
}

// ─── 7. Get upcoming games ────────────────────────────────────────────────
export async function getUpcomingGames({ page_size = 20 } = {}) {
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const startDate = today.toISOString().split('T')[0];
  const endDate = nextYear.toISOString().split('T')[0];

  return getGames({ ordering: 'released', dates: `${startDate},${endDate}`, page_size });
}

// ─── 8. Get games by genre ────────────────────────────────────────────────
// Genres: action, adventure, rpg, shooter, puzzle, sports, racing, strategy,
//         simulation, platformer, fighting, casual, family, board-games, arcade
export async function getGamesByGenre(genre, { page_size = 20, ordering = '-rating' } = {}) {
  return getGames({ genres: genre, ordering, page_size });
}

// ─── 9. Get games by platform ─────────────────────────────────────────────
// Common platform IDs: 4=PC, 18=PS4, 187=PS5, 1=Xbox One, 186=Xbox S/X,
//                      7=Nintendo Switch, 21=Android, 3=iOS
export async function getGamesByPlatform(platformId, { page_size = 20 } = {}) {
  return getGames({ platforms: platformId, page_size, ordering: '-rating' });
}

// ─── 10. Get game screenshots ─────────────────────────────────────────────
export async function getGameScreenshots(gameId) {
  if (!RAWG_API_KEY || !gameId) return { results: [] };

  const url = buildUrl(`games/${gameId}/screenshots`);
  const data = await safeFetch(url);
  return data || { results: [] };
}

// ─── 11. Get game trailers/movies ─────────────────────────────────────────
export async function getGameMovies(gameId) {
  if (!RAWG_API_KEY || !gameId) return { results: [] };

  const url = buildUrl(`games/${gameId}/movies`);
  const data = await safeFetch(url);
  return data || { results: [] };
}

// ─── 12. Get similar/related games ────────────────────────────────────────
export async function getSuggestedGames(gameId, { page_size = 6 } = {}) {
  if (!RAWG_API_KEY || !gameId) return { results: [] };

  const url = buildUrl(`games/${gameId}/suggested`, { page_size });
  const data = await safeFetch(url);
  return data || { results: [] };
}

// ─── 13. Get all genres list ──────────────────────────────────────────────
export async function getGenres() {
  if (!RAWG_API_KEY) return { results: [] };

  const url = buildUrl('genres');
  const data = await safeFetch(url);
  return data || { results: [] };
}

// ─── 14. Get all platforms list ───────────────────────────────────────────
export async function getPlatforms() {
  if (!RAWG_API_KEY) return { results: [] };

  const url = buildUrl('platforms');
  const data = await safeFetch(url);
  return data || { results: [] };
}

// ─── 15. Get all stores ───────────────────────────────────────────────────
export async function getStores() {
  if (!RAWG_API_KEY) return { results: [] };

  const url = buildUrl('stores');
  const data = await safeFetch(url);
  return data || { results: [] };
}

// ─── 16. Get game achievements ────────────────────────────────────────────
export async function getGameAchievements(gameId) {
  if (!RAWG_API_KEY || !gameId) return { results: [] };

  const url = buildUrl(`games/${gameId}/achievements`);
  const data = await safeFetch(url);
  return data || { results: [] };
}

// ─── 17. Get game DLC / add-ons ───────────────────────────────────────────
export async function getGameAdditions(gameId) {
  if (!RAWG_API_KEY || !gameId) return { results: [] };

  const url = buildUrl(`games/${gameId}/additions`);
  const data = await safeFetch(url);
  return data || { results: [] };
}

// ─── 18. Get developers list ──────────────────────────────────────────────
export async function getDevelopers({ page_size = 20 } = {}) {
  if (!RAWG_API_KEY) return { results: [] };

  const url = buildUrl('developers', { page_size });
  const data = await safeFetch(url);
  return data || { results: [] };
}

// ─── 19. Get publishers list ──────────────────────────────────────────────
export async function getPublishers({ page_size = 20 } = {}) {
  if (!RAWG_API_KEY) return { results: [] };

  const url = buildUrl('publishers', { page_size });
  const data = await safeFetch(url);
  return data || { results: [] };
}

// ─── 20. Get tags list ────────────────────────────────────────────────────
export async function getTags({ page_size = 40 } = {}) {
  if (!RAWG_API_KEY) return { results: [] };

  const url = buildUrl('tags', { page_size });
  const data = await safeFetch(url);
  return data || { results: [] };
}

// ─── Helper: extract background image ─────────────────────────────────────
export function getGameCover(game) {
  return game?.background_image || game?.background_image_additional || '';
}

// ─── Helper: get Metacritic color ─────────────────────────────────────────
export function getMetacriticColor(score) {
  if (!score) return '#888';
  if (score >= 75) return '#6c3';   // green — great
  if (score >= 50) return '#fc3';   // yellow — mixed
  return '#f00';                     // red — poor
}

// ─── Helper: format platform tags ─────────────────────────────────────────
export function formatPlatforms(game) {
  if (!game?.platforms) return [];
  return game.platforms.map(p => p.platform.name);
}

// ─── Helper: format genre tags ────────────────────────────────────────────
export function formatGenres(game) {
  if (!game?.genres) return [];
  return game.genres.map(g => g.name);
}

// ─── Check if API key is configured ──────────────────────────────────────
export function isRawgConfigured() {
  return !!RAWG_API_KEY && !RAWG_API_KEY.startsWith('your_');
}

// ─── Gaming Hub preset collections (used directly in GamingPage) ──────────
export const GamingHubPresets = {
  // Home page tabs
  trending:    () => getTrendingGames({ page_size: 20 }),
  topRated:    () => getTopRatedGames({ page_size: 20 }),
  newReleases: () => getNewReleases({ page_size: 20 }),
  upcoming:    () => getUpcomingGames({ page_size: 20 }),

  // Genre quick-filters
  action:      () => getGamesByGenre('action'),
  rpg:         () => getGamesByGenre('role-playing-games-rpg'),
  shooter:     () => getGamesByGenre('shooter'),
  sports:      () => getGamesByGenre('sports'),
  puzzle:      () => getGamesByGenre('puzzle'),
  adventure:   () => getGamesByGenre('adventure'),
  strategy:    () => getGamesByGenre('strategy'),
  racing:      () => getGamesByGenre('racing'),

  // Platform tabs
  pc:          () => getGamesByPlatform(4),
  playstation: () => getGamesByPlatform(187),   // PS5
  xbox:        () => getGamesByPlatform(186),    // Xbox Series X
  nintendo:    () => getGamesByPlatform(7),      // Switch
  mobile:      () => getGamesByPlatform(21),     // Android
  ios:         () => getGamesByPlatform(3),
};

// ─── Default export: full service object ─────────────────────────────────
const RawgService = {
  getGames,
  searchGames,
  getGameDetails,
  getTrendingGames,
  getTopRatedGames,
  getNewReleases,
  getUpcomingGames,
  getGamesByGenre,
  getGamesByPlatform,
  getGameScreenshots,
  getGameMovies,
  getSuggestedGames,
  getGenres,
  getPlatforms,
  getStores,
  getGameAchievements,
  getGameAdditions,
  getDevelopers,
  getPublishers,
  getTags,
  getGameCover,
  getMetacriticColor,
  formatPlatforms,
  formatGenres,
  isRawgConfigured,
  GamingHubPresets,
};

export default RawgService;
