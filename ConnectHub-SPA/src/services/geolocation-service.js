// src/services/geolocation-service.js — ipapi.co Auto-Geolocation Service
// ✅ NO API KEY REQUIRED for free tier (1,000 requests/day per IP)
// API Docs: https://ipapi.co/api/
// Paid plans available at: https://ipapi.co/pricing/ (optional API key for higher limits)
// What it does: Detects the visitor's location from their IP address silently —
//   no browser permission popup required. Returns city, region, country, lat/lon,
//   timezone, currency, language, calling code, ASN, org and more.

const IPAPI_BASE = 'https://ipapi.co';

// Optional API key for paid plans (adds higher rate limits).
// Free tier = 1,000 req/day/IP — no key needed.
// To use a key: set VITE_IPAPI_KEY in .env → e.g. VITE_IPAPI_KEY=your_key_here
const IPAPI_KEY = typeof import.meta !== 'undefined'
  ? import.meta.env?.VITE_IPAPI_KEY || null
  : null;

// ─── In-memory cache — avoid hammering the API on re-renders ─────────────
let _cachedLocation = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ─── Safe fetch helper ─────────────────────────────────────────────────────
async function safeFetch(url) {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`ipapi.co error: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('[GeolocationService] fetch error:', err);
    return null;
  }
}

// ─── Build API URL (with optional key) ────────────────────────────────────
function buildUrl(path) {
  const base = `${IPAPI_BASE}${path}`;
  return IPAPI_KEY ? `${base}?key=${IPAPI_KEY}` : base;
}

// ═══════════════════════════════════════════════════════════════
//  1. GET FULL LOCATION DATA — main function
// ═══════════════════════════════════════════════════════════════

// Detect the current visitor's location from their IP address.
// Returns a normalized location object (all fields safe to access even if null).
// Results are cached for 5 minutes to avoid repeated API calls.
//
// Usage:
//   const loc = await getMyLocation();
//   console.log(loc.city, loc.country, loc.latitude, loc.longitude);
//
export async function getMyLocation({ forceRefresh = false } = {}) {
  const now = Date.now();

  // Return cache if still valid
  if (!forceRefresh && _cachedLocation && (now - _cacheTimestamp) < CACHE_TTL_MS) {
    return _cachedLocation;
  }

  const data = await safeFetch(buildUrl('/json/'));
  if (!data || data.error) {
    console.warn('[GeolocationService] Could not detect location:', data?.reason || 'unknown error');
    return _getFallback();
  }

  const location = _normalize(data);
  _cachedLocation = location;
  _cacheTimestamp = now;
  return location;
}

// ═══════════════════════════════════════════════════════════════
//  2. LOOK UP A SPECIFIC IP ADDRESS
// ═══════════════════════════════════════════════════════════════

// Look up location for any specific IP address.
// Usage: const loc = await getLocationByIP('8.8.8.8')
export async function getLocationByIP(ip) {
  if (!ip || typeof ip !== 'string') return null;
  const data = await safeFetch(buildUrl(`/${ip.trim()}/json/`));
  if (!data || data.error) return null;
  return _normalize(data);
}

// ═══════════════════════════════════════════════════════════════
//  3. GET SPECIFIC FIELD ONLY
// ═══════════════════════════════════════════════════════════════

// Get a single field for the current IP (smaller response — saves bandwidth).
// Available fields: ip, city, region, region_code, country, country_name,
//   country_code, country_code_iso3, country_capital, country_tld,
//   continent_code, in_eu, postal, latitude, longitude, timezone,
//   utc_offset, country_calling_code, currency, currency_name,
//   languages, asn, org
//
// Usage:
//   const city = await getField('city')          // 'Washington'
//   const tz   = await getField('timezone')      // 'America/New_York'
//   const lat  = await getField('latitude')      // 38.9034
//
export async function getField(fieldName) {
  if (!fieldName) return null;
  const url = buildUrl(`/${fieldName}/`);
  try {
    const res = await fetch(url, { headers: { Accept: 'text/plain' } });
    if (!res.ok) return null;
    const text = (await res.text()).trim();
    // Try to parse numbers/booleans
    if (text === 'true') return true;
    if (text === 'false') return false;
    const num = Number(text);
    return isNaN(num) ? text : num;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
//  4. CONVENIENCE HELPERS — most-used data points
// ═══════════════════════════════════════════════════════════════

// Get just the coordinates (fastest way to feed into weather-service.js)
// Returns: { latitude, longitude } or null
export async function getCoordinates() {
  const loc = await getMyLocation();
  if (!loc || !loc.latitude) return null;
  return { latitude: loc.latitude, longitude: loc.longitude };
}

// Get city + country display string
// Returns: 'Washington, DC, US' or fallback
export async function getDisplayLocation() {
  const loc = await getMyLocation();
  if (!loc) return 'Unknown location';
  const parts = [loc.city, loc.region_code || loc.region, loc.country_code].filter(Boolean);
  return parts.join(', ') || 'Unknown location';
}

// Get timezone string
// Returns: 'America/New_York' or null
export async function getTimezone() {
  const loc = await getMyLocation();
  return loc?.timezone || null;
}

// Get currency code
// Returns: 'USD' or null
export async function getCurrency() {
  const loc = await getMyLocation();
  return loc?.currency || null;
}

// Get country code (ISO2)
// Returns: 'US' or null
export async function getCountryCode() {
  const loc = await getMyLocation();
  return loc?.country_code || null;
}

// Check if user is in the EU (GDPR compliance)
// Returns: true | false
export async function isInEU() {
  const loc = await getMyLocation();
  return loc?.in_eu ?? false;
}

// ═══════════════════════════════════════════════════════════════
//  5. INTEGRATION WITH WEATHER SERVICE
// ═══════════════════════════════════════════════════════════════

// Get location + weather-ready coords in one call.
// Perfect to use at app startup to seed weather-service.js.
//
// Usage:
//   import { getLocationForWeather } from './geolocation-service';
//   import { getCurrentWeather } from './weather-service';
//
//   const { latitude, longitude, city, timezone } = await getLocationForWeather();
//   const weather = await getCurrentWeather(latitude, longitude, { timezone });
//
export async function getLocationForWeather() {
  const loc = await getMyLocation();
  if (!loc || !loc.latitude) return null;
  return {
    latitude:    loc.latitude,
    longitude:   loc.longitude,
    city:        loc.city,
    region:      loc.region,
    region_code: loc.region_code,
    country:     loc.country_name,
    country_code:loc.country_code,
    timezone:    loc.timezone,
    postal:      loc.postal,
    display:     [loc.city, loc.region_code, loc.country_code].filter(Boolean).join(', '),
  };
}

// ═══════════════════════════════════════════════════════════════
//  6. LOCALE & INTERNATIONALIZATION HELPERS
// ═══════════════════════════════════════════════════════════════

// Get the primary language from the location data
// e.g. 'en-US,es-US,haw,fr' → 'en-US'
export async function getPrimaryLanguage() {
  const loc = await getMyLocation();
  return loc?.languages?.split(',')[0] || 'en';
}

// Get all languages as an array
// e.g. ['en-US', 'es-US', 'haw', 'fr']
export async function getLanguages() {
  const loc = await getMyLocation();
  return loc?.languages?.split(',').map(l => l.trim()) || ['en'];
}

// Get calling code (phone prefix)
// Returns: '+1'
export async function getCallingCode() {
  const loc = await getMyLocation();
  return loc?.country_calling_code || null;
}

// ═══════════════════════════════════════════════════════════════
//  7. CACHE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// Clear the in-memory cache (force fresh lookup next time)
export function clearLocationCache() {
  _cachedLocation = null;
  _cacheTimestamp = 0;
}

// Check if we have a cached result available
export function hasCachedLocation() {
  return !!_cachedLocation && (Date.now() - _cacheTimestamp) < CACHE_TTL_MS;
}

// Get the cached result directly without making an API call
export function getCachedLocation() {
  if (!hasCachedLocation()) return null;
  return _cachedLocation;
}

// ═══════════════════════════════════════════════════════════════
//  PRIVATE HELPERS
// ═══════════════════════════════════════════════════════════════

// Normalize raw ipapi.co response into a clean consistent object
function _normalize(data) {
  return {
    // Identity
    ip:                   data.ip || null,
    // Location
    city:                 data.city || null,
    postal:               data.postal || null,
    region:               data.region || null,
    region_code:          data.region_code || null,
    // Country
    country_code:         data.country_code || data.country || null,
    country_name:         data.country_name || null,
    country_code_iso3:    data.country_code_iso3 || null,
    country_capital:      data.country_capital || null,
    country_tld:          data.country_tld || null,
    continent_code:       data.continent_code || null,
    in_eu:                data.in_eu === true,
    // Coordinates
    latitude:             typeof data.latitude === 'number' ? data.latitude : null,
    longitude:            typeof data.longitude === 'number' ? data.longitude : null,
    // Time
    timezone:             data.timezone || null,
    utc_offset:           data.utc_offset || null,
    // Finance
    currency:             data.currency || null,
    currency_name:        data.currency_name || null,
    // Language & Phone
    languages:            data.languages || null,
    country_calling_code: data.country_calling_code || null,
    // Network
    asn:                  data.asn || null,
    org:                  data.org || null,
    // Meta
    network:              data.network || null,
    version:              data.version || null,
    // Derived
    display:              _buildDisplay(data),
  };
}

function _buildDisplay(data) {
  const parts = [data.city, data.region_code || data.region, data.country_code || data.country].filter(Boolean);
  return parts.join(', ') || data.country_name || 'Unknown';
}

// Fallback when API is unavailable — returns DC as default
function _getFallback() {
  return {
    ip: null,
    city: 'Washington',
    postal: '20001',
    region: 'District of Columbia',
    region_code: 'DC',
    country_code: 'US',
    country_name: 'United States',
    country_code_iso3: 'USA',
    country_capital: 'Washington',
    country_tld: '.us',
    continent_code: 'NA',
    in_eu: false,
    latitude: 38.8951,
    longitude: -77.0364,
    timezone: 'America/New_York',
    utc_offset: '-0400',
    currency: 'USD',
    currency_name: 'Dollar',
    languages: 'en-US',
    country_calling_code: '+1',
    asn: null,
    org: null,
    network: null,
    version: null,
    display: 'Washington, DC, US',
    _isFallback: true,
  };
}

// ═══════════════════════════════════════════════════════════════
//  LYNKAPP PRESETS
// ═══════════════════════════════════════════════════════════════

export const GeoPresets = {
  // Full location object — use at app startup
  myLocation:          ()         => getMyLocation(),
  // Just coordinates — feed directly into weather-service
  coords:              ()         => getCoordinates(),
  // Weather-ready object with city/timezone
  forWeather:          ()         => getLocationForWeather(),
  // Display string for UI
  displayLocation:     ()         => getDisplayLocation(),
  // Specific lookups
  timezone:            ()         => getTimezone(),
  currency:            ()         => getCurrency(),
  countryCode:         ()         => getCountryCode(),
  inEU:                ()         => isInEU(),
  primaryLanguage:     ()         => getPrimaryLanguage(),
  // Lookup any IP (e.g. for admin / fraud detection)
  lookupIP:            (ip)       => getLocationByIP(ip),
  // Single-field fetch (cheapest request)
  field:               (f)        => getField(f),
};

// ─── Default export ───────────────────────────────────────────
const GeolocationService = {
  // Core
  getMyLocation,
  getLocationByIP,
  getField,
  // Convenience
  getCoordinates,
  getDisplayLocation,
  getTimezone,
  getCurrency,
  getCountryCode,
  isInEU,
  // Weather integration
  getLocationForWeather,
  // Locale
  getPrimaryLanguage,
  getLanguages,
  getCallingCode,
  // Cache
  clearLocationCache,
  hasCachedLocation,
  getCachedLocation,
  // Presets
  GeoPresets,
};

export default GeolocationService;
