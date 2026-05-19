/**
 * location-travel-service.js
 * Location & Travel APIs — NEW-19 through NEW-22
 *
 * NEW-19: Nominatim Geocoding (OpenStreetMap) — NO KEY, FREE
 *   Forward: address → lat/lng
 *   Reverse: lat/lng → address
 *   https://nominatim.openstreetmap.org
 *
 * NEW-20: Country.is — NO KEY, FREE
 *   IP → country code (simpler than ipapi.co)
 *   https://api.country.is/
 *
 * NEW-21: OpenSky Network — NO KEY, FREE
 *   Live flight tracking within a bounding box
 *   https://opensky-network.org/api/states/all
 *
 * NEW-22: Hotels.com via RapidAPI — requires VITE_RAPIDAPI_KEY
 *   Hotel/accommodation search
 */

// ─── NEW-19: Nominatim Geocoding ────────────────────────────────────────────

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const NOMINATIM_HEADERS = {
  'Accept-Language': 'en',
  // Nominatim usage policy: include a descriptive User-Agent
  'User-Agent': 'LynkApp/1.0 (https://lynkapp.com; contact@lynkapp.com)',
};

/**
 * Forward geocode: convert an address string to lat/lng + address details.
 * @param {string} query  e.g. "New York", "1600 Pennsylvania Ave, Washington DC"
 * @param {number} [limit=5]  max results to return
 * @returns {Promise<Array>}  array of result objects with lat, lon, display_name, address
 */
export async function geocodeAddress(query, limit = 5) {
  if (!query || !query.trim()) return [];
  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    addressdetails: '1',
    limit: String(limit),
  });
  const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: NOMINATIM_HEADERS,
  });
  if (!res.ok) throw new Error(`Nominatim geocode error: ${res.status}`);
  const data = await res.json();
  return data.map((item) => ({
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    displayName: item.display_name,
    type: item.type,
    category: item.category,
    importance: item.importance,
    address: item.address || {},
    placeId: item.place_id,
  }));
}

/**
 * Reverse geocode: convert lat/lng to a human-readable address.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>} address details object
 */
export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: 'json',
    addressdetails: '1',
  });
  const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
    headers: NOMINATIM_HEADERS,
  });
  if (!res.ok) throw new Error(`Nominatim reverse geocode error: ${res.status}`);
  const data = await res.json();
  return {
    lat: parseFloat(data.lat),
    lon: parseFloat(data.lon),
    displayName: data.display_name,
    address: data.address || {},
    placeId: data.place_id,
  };
}

/**
 * Geocode an address and return just the first result's coordinates.
 * Convenience wrapper for single-result use cases (e.g. map pin).
 * @param {string} query
 * @returns {Promise<{lat:number, lon:number, displayName:string}|null>}
 */
export async function getCoordinates(query) {
  const results = await geocodeAddress(query, 1);
  return results.length > 0 ? results[0] : null;
}

// ─── NEW-20: Country.is — IP to Country ──────────────────────────────────────

/**
 * Detect the visitor's country code from their IP address.
 * Returns { ip: string, country: string } e.g. { ip: "1.2.3.4", country: "US" }
 * @returns {Promise<{ip: string, country: string}>}
 */
export async function getCountryFromIP() {
  const res = await fetch('https://api.country.is/');
  if (!res.ok) throw new Error(`Country.is error: ${res.status}`);
  return res.json(); // { ip: "...", country: "US" }
}

/**
 * Check if the visitor is in a specific country.
 * Useful for geo-restrictions and marketplace international shipping.
 * @param {string} countryCode  ISO 3166-1 alpha-2, e.g. "US"
 * @returns {Promise<boolean>}
 */
export async function isVisitorInCountry(countryCode) {
  const { country } = await getCountryFromIP();
  return country.toUpperCase() === countryCode.toUpperCase();
}

/**
 * Check if shipping is available to visitor's country.
 * @param {string[]} allowedCountries  array of ISO country codes
 * @returns {Promise<{allowed: boolean, country: string}>}
 */
export async function checkShippingAvailability(allowedCountries) {
  const { country } = await getCountryFromIP();
  const allowed = allowedCountries.map((c) => c.toUpperCase()).includes(country.toUpperCase());
  return { allowed, country };
}

// ─── NEW-21: OpenSky Network — Live Flight Tracking ──────────────────────────

const OPENSKY_BASE = 'https://opensky-network.org/api';

/**
 * Get all live flights within a geographic bounding box.
 * @param {Object} bbox  { lamin, lomin, lamax, lomax } — lat/lon min/max
 * @returns {Promise<Array>}  array of flight state objects
 *
 * Example bbox for Europe: { lamin: 45, lomin: 5, lamax: 48, lomax: 11 }
 * Example bbox for US East Coast: { lamin: 25, lomin: -90, lamax: 50, lomax: -60 }
 */
export async function getFlightsInArea({ lamin, lomin, lamax, lomax }) {
  const params = new URLSearchParams({
    lamin: String(lamin),
    lomin: String(lomin),
    lamax: String(lamax),
    lomax: String(lomax),
  });
  const res = await fetch(`${OPENSKY_BASE}/states/all?${params}`);
  if (!res.ok) throw new Error(`OpenSky error: ${res.status}`);
  const data = await res.json();

  // OpenSky returns states as arrays; map to readable objects
  const states = (data.states || []).map((s) => ({
    icao24: s[0],         // Unique ICAO 24-bit aircraft address
    callsign: (s[1] || '').trim(),
    originCountry: s[2],
    timePosition: s[3],   // Unix timestamp of last position update
    lastContact: s[4],    // Unix timestamp of last contact
    lon: s[5],            // WGS-84 longitude
    lat: s[6],            // WGS-84 latitude
    baroAltitude: s[7],   // Barometric altitude in meters
    onGround: s[8],       // true if on ground
    velocity: s[9],       // Ground speed in m/s
    trueTrack: s[10],     // Track angle in degrees (clockwise from north)
    verticalRate: s[11],  // Vertical rate in m/s (positive = climbing)
    sensors: s[12],
    geoAltitude: s[13],   // Geometric altitude in meters
    squawk: s[14],        // Transponder code
    spi: s[15],
    positionSource: s[16],
  }));

  return {
    time: data.time,
    count: states.length,
    flights: states,
  };
}

/**
 * Get live flights near a specific coordinate (within ~100km radius approximation).
 * Builds a 1-degree bounding box around the point.
 * @param {number} lat
 * @param {number} lon
 * @param {number} [degreePadding=1]  degrees of padding (≈111km per degree)
 * @returns {Promise<Object>}
 */
export async function getFlightsNearLocation(lat, lon, degreePadding = 1) {
  return getFlightsInArea({
    lamin: lat - degreePadding,
    lomin: lon - degreePadding,
    lamax: lat + degreePadding,
    lomax: lon + degreePadding,
  });
}

/**
 * Get all currently airborne flights in a country's airspace (preset bounding boxes).
 * @param {'US'|'UK'|'EU'|'AU'} region
 * @returns {Promise<Object>}
 */
export async function getFlightsByRegion(region) {
  const boxes = {
    US:  { lamin: 24, lomin: -125, lamax: 50, lomax: -66 },
    UK:  { lamin: 49, lomin: -8,   lamax: 61, lomax:  2  },
    EU:  { lamin: 36, lomin: -10,  lamax: 60, lomax:  30 },
    AU:  { lamin: -44, lomin: 113, lamax: -10, lomax: 154 },
  };
  const bbox = boxes[region.toUpperCase()];
  if (!bbox) throw new Error(`Unknown region: ${region}. Use US, UK, EU, or AU.`);
  return getFlightsInArea(bbox);
}

// ─── NEW-22: Hotels.com via RapidAPI ─────────────────────────────────────────

const RAPIDAPI_KEY = import.meta.env?.VITE_RAPIDAPI_KEY || '';
const HOTELS_BASE = 'https://hotels4.p.rapidapi.com';
const HOTELS_HEADERS = {
  'X-RapidAPI-Key': RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'hotels4.p.rapidapi.com',
  'Content-Type': 'application/json',
};

/**
 * Search for a hotel location/city to get its destination ID.
 * Must be called before searchHotels().
 * @param {string} city  e.g. "New York", "Paris"
 * @param {string} [locale='en_US']
 * @returns {Promise<Array>}  array of location suggestions
 */
export async function searchHotelLocations(city, locale = 'en_US') {
  if (!RAPIDAPI_KEY) {
    console.warn('Hotels.com: VITE_RAPIDAPI_KEY not set. Using mock data.');
    return getMockHotelLocations(city);
  }
  const params = new URLSearchParams({ query: city, locale });
  const res = await fetch(`${HOTELS_BASE}/locations/v3/search?${params}`, {
    headers: HOTELS_HEADERS,
  });
  if (!res.ok) throw new Error(`Hotels.com locations error: ${res.status}`);
  const data = await res.json();
  return (data.sr || []).map((item) => ({
    gaiaId: item.gaiaId,
    type: item.type,
    regionNames: item.regionNames || {},
    coordinates: item.coordinates || {},
    destinationId: item.gaiaId,
  }));
}

/**
 * Search for hotels by destination ID.
 * @param {Object} params
 * @param {string} params.destinationId  from searchHotelLocations()
 * @param {string} params.checkIn   'YYYY-MM-DD'
 * @param {string} params.checkOut  'YYYY-MM-DD'
 * @param {number} [params.adults=1]
 * @param {number} [params.rooms=1]
 * @param {string} [params.currency='USD']
 * @returns {Promise<Object>}
 */
export async function searchHotels({
  destinationId,
  checkIn,
  checkOut,
  adults = 1,
  rooms = 1,
  currency = 'USD',
}) {
  if (!RAPIDAPI_KEY) {
    console.warn('Hotels.com: VITE_RAPIDAPI_KEY not set. Using mock data.');
    return getMockHotels();
  }
  const body = {
    currency,
    eapid: 1,
    locale: 'en_US',
    siteId: 300000001,
    destination: { regionId: String(destinationId) },
    checkInDate: { day: parseInt(checkIn.split('-')[2]), month: parseInt(checkIn.split('-')[1]), year: parseInt(checkIn.split('-')[0]) },
    checkOutDate: { day: parseInt(checkOut.split('-')[2]), month: parseInt(checkOut.split('-')[1]), year: parseInt(checkOut.split('-')[0]) },
    rooms: [{ adults }],
    resultsStartingIndex: 0,
    resultsSize: 20,
    sort: 'PRICE_LOW_TO_HIGH',
    filters: { price: { max: 5000, min: 1 } },
  };

  const res = await fetch(`${HOTELS_BASE}/properties/v2/list`, {
    method: 'POST',
    headers: HOTELS_HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Hotels.com search error: ${res.status}`);
  const data = await res.json();
  return data;
}

// ─── Mock data fallbacks (no API key / offline) ──────────────────────────────

function getMockHotelLocations(city) {
  return [
    {
      gaiaId: 'mock-1',
      type: 'CITY',
      regionNames: { fullName: `${city}, United States`, shortName: city },
      coordinates: { lat: 40.7128, lon: -74.006 },
      destinationId: 'mock-1',
    },
  ];
}

function getMockHotels() {
  return {
    data: {
      propertySearch: {
        properties: [
          { id: 'h1', name: 'Grand Hotel Downtown', star: 4, price: { lead: { amount: 149, formatted: '$149' } }, reviews: { score: 8.6, total: 1234 } },
          { id: 'h2', name: 'Budget Inn Express', star: 2, price: { lead: { amount: 59, formatted: '$59' } }, reviews: { score: 7.2, total: 456 } },
          { id: 'h3', name: 'Luxury Suites & Spa', star: 5, price: { lead: { amount: 389, formatted: '$389' } }, reviews: { score: 9.4, total: 892 } },
        ],
      },
    },
  };
}

// ─── Composite helper: Geocode + Nearby Flights ───────────────────────────────

/**
 * Search an address, get its coordinates, then find live flights nearby.
 * Great for "Travel posts near me" feature.
 * @param {string} address
 * @returns {Promise<{location: Object, flights: Object}>}
 */
export async function getTravelDataForAddress(address) {
  const location = await getCoordinates(address);
  if (!location) throw new Error(`Could not geocode: ${address}`);
  const flights = await getFlightsNearLocation(location.lat, location.lon);
  return { location, flights };
}

export default {
  // Nominatim
  geocodeAddress,
  reverseGeocode,
  getCoordinates,
  // Country.is
  getCountryFromIP,
  isVisitorInCountry,
  checkShippingAvailability,
  // OpenSky
  getFlightsInArea,
  getFlightsNearLocation,
  getFlightsByRegion,
  // Hotels.com
  searchHotelLocations,
  searchHotels,
  // Composite
  getTravelDataForAddress,
};
