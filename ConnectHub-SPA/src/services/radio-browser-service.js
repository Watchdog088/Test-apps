/**
 * radio-browser-service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Radio Browser API — 100% FREE, NO API KEY REQUIRED.
 * Community-maintained database of 40,000+ internet radio stations worldwide.
 *
 * API docs:   https://api.radio-browser.info/
 * Base URL:   https://de1.api.radio-browser.info/json  (auto-selects best server)
 *
 * Features implemented:
 *  1. Search stations by name, tag, country, language, codec
 *  2. Get top stations by votes / click count
 *  3. Get stations by country
 *  4. Get stations by genre / tag
 *  5. Get stations by language
 *  6. Get all countries (with station counts)
 *  7. Get all tags / genres (with station counts)
 *  8. Get all languages (with station counts)
 *  9. Record a "click" (tells the API a station was played — helps rankings)
 * 10. Get recently changed / added stations
 *
 * Stream playback: Use <audio src={station.url_resolved} /> or the Web Audio API.
 * Stations provide direct stream URLs in the `url_resolved` field.
 */

// Use de1 as primary server (reliable); can also use nl1, at1, fr1
const BASE = 'https://de1.api.radio-browser.info/json';

// ─── Internal helper ───────────────────────────────────────────────────────
async function rbFetch(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  // Radio Browser requires a User-Agent, but browsers set it automatically
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'ConnectHub-App/1.0' },
  });
  if (!res.ok) throw new Error(`Radio Browser API error ${res.status}`);
  return res.json();
}

// ─── Normalise a station object ────────────────────────────────────────────
function normaliseStation(s) {
  return {
    stationuuid:  s.stationuuid,
    name:         s.name,
    url:          s.url_resolved || s.url,
    favicon:      s.favicon,
    country:      s.country,
    countrycode:  s.countrycode,
    language:     s.language,
    tags:         s.tags ? s.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    votes:        s.votes,
    clickcount:   s.clickcount,
    clicktrend:   s.clicktrend,
    codec:        s.codec,
    bitrate:      s.bitrate,
    homepage:     s.homepage,
    geo_lat:      s.geo_lat,
    geo_long:     s.geo_long,
    lastchangetime: s.lastchangetime,
  };
}

// ─── 1. Search Stations ────────────────────────────────────────────────────
/**
 * Search radio stations by various criteria.
 * @param {object} opts
 *   name, tag, country, language, codec
 *   order: 'name'|'url'|'homepage'|'favicon'|'tags'|'country'|'state'|'language'|
 *          'votes'|'codec'|'bitrate'|'lastcheckok'|'lastchecktime'|'clickcount'|
 *          'clicktrend'|'random' (default: 'votes')
 *   reverse: true/false
 *   limit: max stations to return (default 20, max 100)
 *   offset: pagination offset
 *   hidebroken: true = only return working stations (default true)
 */
export async function searchStations(opts = {}) {
  const params = {
    name:       opts.name,
    tag:        opts.tag,
    country:    opts.country,
    language:   opts.language,
    codec:      opts.codec,
    order:      opts.order      || 'votes',
    reverse:    opts.reverse    !== undefined ? opts.reverse : true,
    limit:      opts.limit      || 20,
    offset:     opts.offset     || 0,
    hidebroken: opts.hidebroken !== false ? 'true' : 'false',
  };
  const data = await rbFetch('/stations/search', params);
  return data.map(normaliseStation);
}

// ─── 2. Top Stations by Votes ─────────────────────────────────────────────
export async function getTopStations(limit = 20) {
  const data = await rbFetch('/stations', {
    order: 'votes',
    reverse: true,
    limit,
    hidebroken: 'true',
  });
  return data.map(normaliseStation);
}

// ─── 3. Stations by Country ────────────────────────────────────────────────
/**
 * @param {string} countrycode  ISO 3166-1 alpha-2, e.g. 'US', 'GB', 'DE'
 */
export async function getStationsByCountry(countrycode, limit = 30) {
  const data = await rbFetch(`/stations/bycountrycodeexact/${encodeURIComponent(countrycode)}`, {
    order: 'votes',
    reverse: true,
    limit,
    hidebroken: 'true',
  });
  return data.map(normaliseStation);
}

// ─── 4. Stations by Tag / Genre ────────────────────────────────────────────
/**
 * @param {string} tag  e.g. 'pop', 'jazz', 'news', 'classical', 'hip-hop'
 */
export async function getStationsByTag(tag, limit = 30) {
  const data = await rbFetch(`/stations/bytag/${encodeURIComponent(tag.toLowerCase())}`, {
    order: 'votes',
    reverse: true,
    limit,
    hidebroken: 'true',
  });
  return data.map(normaliseStation);
}

// ─── 5. Stations by Language ──────────────────────────────────────────────
/**
 * @param {string} language  e.g. 'english', 'spanish', 'french'
 */
export async function getStationsByLanguage(language, limit = 30) {
  const data = await rbFetch(`/stations/bylanguage/${encodeURIComponent(language.toLowerCase())}`, {
    order: 'votes',
    reverse: true,
    limit,
    hidebroken: 'true',
  });
  return data.map(normaliseStation);
}

// ─── 6. All Countries ─────────────────────────────────────────────────────
/**
 * Get list of all countries with station counts, sorted by station count.
 */
export async function getCountries() {
  const data = await rbFetch('/countries', { order: 'stationcount', reverse: true });
  return data.map(c => ({
    name:         c.name,
    iso_3166_1:   c.iso_3166_1,
    stationcount: c.stationcount,
  }));
}

// ─── 7. All Tags / Genres ─────────────────────────────────────────────────
/**
 * Get tags sorted by station count (most popular genres first).
 * @param {number} limit  Max tags to return (default 50)
 */
export async function getTags(limit = 50) {
  const data = await rbFetch('/tags', {
    order: 'stationcount',
    reverse: true,
    limit,
  });
  return data.map(t => ({
    name:         t.name,
    stationcount: t.stationcount,
  }));
}

// ─── 8. All Languages ─────────────────────────────────────────────────────
export async function getLanguages(limit = 50) {
  const data = await rbFetch('/languages', {
    order: 'stationcount',
    reverse: true,
    limit,
  });
  return data.map(l => ({
    name:         l.name,
    stationcount: l.stationcount,
  }));
}

// ─── 9. Record Station Click ──────────────────────────────────────────────
/**
 * Tell the Radio Browser API that a station was clicked/played.
 * This improves the station's click count ranking.
 * @param {string} stationuuid
 */
export async function recordStationClick(stationuuid) {
  const data = await rbFetch(`/url/${encodeURIComponent(stationuuid)}`);
  return data; // { ok: true, message: '...', url: '...' }
}

// ─── 10. Recently Added / Changed Stations ────────────────────────────────
/**
 * Get recently changed stations (new or updated in the last N days).
 * @param {object} opts - { limit, lastcheckokonly }
 */
export async function getRecentStations(opts = {}) {
  const data = await rbFetch('/stations/lastchange', {
    limit: opts.limit || 20,
    hidebroken: 'true',
    lastcheckokonly: opts.lastcheckokonly ? 'true' : undefined,
  });
  return data.map(normaliseStation);
}

// ─── Curated station presets for ConnectHub genres ─────────────────────────
export const RADIO_GENRE_PRESETS = [
  { tag: 'pop',       label: 'Pop',       emoji: '🎵' },
  { tag: 'hip-hop',   label: 'Hip-Hop',   emoji: '🎤' },
  { tag: 'rock',      label: 'Rock',      emoji: '🎸' },
  { tag: 'jazz',      label: 'Jazz',      emoji: '🎷' },
  { tag: 'classical', label: 'Classical', emoji: '🎻' },
  { tag: 'electronic',label: 'Electronic',emoji: '🎹' },
  { tag: 'country',   label: 'Country',   emoji: '🤠' },
  { tag: 'rnb',       label: 'R&B',       emoji: '🎶' },
  { tag: 'latin',     label: 'Latin',     emoji: '💃' },
  { tag: 'news',      label: 'News',      emoji: '📰' },
  { tag: 'sports',    label: 'Sports',    emoji: '⚽' },
  { tag: 'talk',      label: 'Talk',      emoji: '🗣️' },
];
