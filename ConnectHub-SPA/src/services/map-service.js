// src/services/map-service.js — OpenStreetMap + Leaflet Maps Service
// ✅ NO API KEY REQUIRED — completely free, open-source
// Leaflet:       https://leafletjs.com          (BSD 2-Clause License)
// OpenStreetMap: https://openstreetmap.org      (ODbL License — free to use)
// Nominatim:     https://nominatim.openstreetmap.org (geocoding — free, rate-limited)
//
// CDN:
//   CSS: https://unpkg.com/leaflet@1.9.4/dist/leaflet.css
//   JS:  https://unpkg.com/leaflet@1.9.4/dist/leaflet.js
//
// What it does:
//   Full-featured interactive maps for every LynkApp section:
//   Events, Marketplace, Dating (nearby), Friends (nearby),
//   Business profiles, Check-ins, Post location tags, Geocoding

// ─── Leaflet CDN versions ──────────────────────────────────────────────────
export const LEAFLET_VERSION = '1.9.4';
export const LEAFLET_CSS_CDN = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
export const LEAFLET_JS_CDN  = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;

// ─── OpenStreetMap tile servers (all free, no API key) ───────────────────
export const TILE_LAYERS = {
  // Standard OpenStreetMap (default — most complete)
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    label: 'OpenStreetMap (Standard)',
  },
  // OpenStreetMap Hot (Humanitarian) — good for detail
  hot: {
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles by <a href="https://hot.openstreetmap.org/">HOT</a>',
    maxZoom: 19,
    label: 'Humanitarian (HOT)',
  },
  // Stadia Alidade Smooth Dark — dark mode map
  stadiaSmooth: {
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://stadiamaps.com/">Stadia Maps</a>, © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 20,
    label: 'Stadia Smooth (Light)',
  },
  // Stadia Alidade Smooth Dark
  stadiaDark: {
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://stadiamaps.com/">Stadia Maps</a>, © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 20,
    label: 'Dark Mode',
  },
  // CartoDB Positron — clean light map, good for data overlays
  cartoLight: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    label: 'CartoDB Light',
  },
  // CartoDB Dark Matter — dark map
  cartoDark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    label: 'CartoDB Dark',
  },
  // OpenTopoMap — topographic
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: © <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
    label: 'Topographic',
  },
};

// ─── LynkApp section → tile layer assignments ─────────────────────────────
export const SECTION_TILE_LAYERS = {
  events:      'osm',          // Standard map for event locations
  marketplace: 'cartoLight',   // Clean light map for seller locations
  dating:      'stadiaDark',   // Dark mode for nearby users
  friends:     'stadiaSmooth', // Smooth light for friends map
  business:    'cartoLight',   // Clean for business profiles
  checkin:     'osm',          // Standard for check-ins
  feed:        'osm',          // Standard for post locations
  explore:     'cartoLight',   // Clean for explore/discovery
};

// ─── LynkApp brand marker colors ─────────────────────────────────────────
export const MARKER_COLORS = {
  primary:   '#a78bfa', // purple (LynkApp brand)
  event:     '#f59e0b', // amber — events
  market:    '#22c55e', // green — marketplace
  dating:    '#ec4899', // pink — dating
  friend:    '#3b82f6', // blue — friends
  business:  '#6366f1', // indigo — business
  checkin:   '#14b8a6', // teal — check-ins
  user:      '#8b5cf6', // violet — current user
  warning:   '#ef4444', // red — warnings/errors
};

// ─── Default map settings ─────────────────────────────────────────────────
export const MAP_DEFAULTS = {
  center: [38.9072, -77.0369], // Washington DC (LynkApp HQ)
  zoom: 13,
  minZoom: 2,
  maxZoom: 19,
};

// ═══════════════════════════════════════════════════════════════
//  1. LEAFLET CDN LOADER — inject CSS + JS into the page
// ═══════════════════════════════════════════════════════════════

// Call this once before initializing any maps.
// It's safe to call multiple times (checks if already loaded).
//
// Usage:
//   await loadLeaflet();
//   const map = initMap('map-container');
//
export async function loadLeaflet() {
  // Check if already loaded
  if (window.L) return window.L;

  return new Promise((resolve, reject) => {
    // 1. Inject CSS
    if (!document.querySelector('#leaflet-css')) {
      const css = document.createElement('link');
      css.id = 'leaflet-css';
      css.rel = 'stylesheet';
      css.href = LEAFLET_CSS_CDN;
      document.head.appendChild(css);
    }

    // 2. Inject JS
    if (!document.querySelector('#leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = LEAFLET_JS_CDN;
      script.onload = () => resolve(window.L);
      script.onerror = () => reject(new Error('Failed to load Leaflet from CDN'));
      document.head.appendChild(script);
    } else {
      // Already in DOM — wait for it
      const check = setInterval(() => {
        if (window.L) { clearInterval(check); resolve(window.L); }
      }, 50);
    }
  });
}

// ═══════════════════════════════════════════════════════════════
//  2. MAP INITIALIZATION
// ═══════════════════════════════════════════════════════════════

// Initialize a Leaflet map in any HTML container element.
//
// Usage:
//   const map = initMap('map-div-id', { zoom: 15, tileLayer: 'cartoLight' });
//   // or
//   const map = initMap(domElement, options);
//
export function initMap(containerIdOrEl, options = {}) {
  if (!window.L) throw new Error('Leaflet not loaded. Call loadLeaflet() first.');
  const L = window.L;

  const {
    center = MAP_DEFAULTS.center,
    zoom = MAP_DEFAULTS.zoom,
    tileLayer = 'osm',
    minZoom = MAP_DEFAULTS.minZoom,
    maxZoom,
    scrollWheelZoom = true,
    zoomControl = true,
    attributionControl = true,
    dragging = true,
    tap = true,
    ...leafletOptions
  } = options;

  // Build map
  const map = L.map(containerIdOrEl, {
    center,
    zoom,
    minZoom,
    scrollWheelZoom,
    zoomControl,
    attributionControl,
    dragging,
    tap,
    ...leafletOptions,
  });

  // Add tile layer
  const tileConfig = TILE_LAYERS[tileLayer] || TILE_LAYERS.osm;
  L.tileLayer(tileConfig.url, {
    attribution: tileConfig.attribution,
    maxZoom: maxZoom || tileConfig.maxZoom,
    subdomains: tileConfig.subdomains || 'abc',
  }).addTo(map);

  return map;
}

// Change the tile layer of an existing map
export function setTileLayer(map, tileLayerName) {
  if (!window.L || !map) return;
  const L = window.L;
  const config = TILE_LAYERS[tileLayerName] || TILE_LAYERS.osm;

  // Remove existing tile layers
  map.eachLayer(layer => {
    if (layer instanceof L.TileLayer) map.removeLayer(layer);
  });

  // Add new tile layer
  L.tileLayer(config.url, {
    attribution: config.attribution,
    maxZoom: config.maxZoom,
    subdomains: config.subdomains || 'abc',
  }).addTo(map);
}

// ═══════════════════════════════════════════════════════════════
//  3. CUSTOM MARKERS
// ═══════════════════════════════════════════════════════════════

// Create a colored circle marker (dot marker — cleaner than default pins)
export function createDotMarker(color = MARKER_COLORS.primary, options = {}) {
  if (!window.L) return null;
  return window.L.circleMarker(options.latlng || [0, 0], {
    radius: options.radius || 10,
    fillColor: color,
    color: '#fff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.9,
    ...options,
  });
}

// Create a custom HTML marker with an icon + label
export function createHtmlMarker(html, options = {}) {
  if (!window.L) return null;
  const L = window.L;
  const icon = L.divIcon({
    html,
    className: options.className || 'lynkapp-marker',
    iconSize: options.iconSize || [40, 40],
    iconAnchor: options.iconAnchor || [20, 40],
    popupAnchor: options.popupAnchor || [0, -40],
  });
  return icon;
}

// Create a numbered marker (for ranked results, search results, etc.)
export function createNumberedMarker(number, color = MARKER_COLORS.primary) {
  if (!window.L) return null;
  return createHtmlMarker(
    `<div style="
      background:${color};color:#fff;border-radius:50%;
      width:28px;height:28px;display:flex;align-items:center;
      justify-content:center;font-weight:700;font-size:12px;
      border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);">
      ${number}
    </div>`,
    { iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28] }
  );
}

// Create a pin marker with an emoji or icon
export function createEmojiMarker(emoji, options = {}) {
  if (!window.L) return null;
  return createHtmlMarker(
    `<div style="font-size:${options.size || 24}px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));">
      ${emoji}
    </div>`,
    { iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32], ...options }
  );
}

// Add a marker to a map with optional popup
export function addMarker(map, lat, lng, options = {}) {
  if (!window.L || !map) return null;
  const L = window.L;

  const {
    popup,           // popup HTML string
    tooltip,         // tooltip string
    color = MARKER_COLORS.primary,
    icon,            // custom L.Icon or L.DivIcon
    dot = false,     // use dot marker instead of pin
    ...markerOptions
  } = options;

  let marker;

  if (dot) {
    marker = L.circleMarker([lat, lng], {
      radius: markerOptions.radius || 10,
      fillColor: color,
      color: '#fff',
      weight: 2,
      fillOpacity: 0.9,
      ...markerOptions,
    }).addTo(map);
  } else {
    const markerOpts = icon ? { icon } : {};
    marker = L.marker([lat, lng], { ...markerOpts, ...markerOptions }).addTo(map);
  }

  if (popup) marker.bindPopup(popup);
  if (tooltip) marker.bindTooltip(tooltip);

  return marker;
}

// Add multiple markers at once
export function addMarkers(map, markers) {
  // markers: [{ lat, lng, ...options }, ...]
  return markers.map(({ lat, lng, ...opts }) => addMarker(map, lat, lng, opts));
}

// ═══════════════════════════════════════════════════════════════
//  4. NOMINATIM GEOCODING (free, no API key)
// ═══════════════════════════════════════════════════════════════
// Usage policy: max 1 request/second, must include User-Agent
// Full docs: https://nominatim.openstreetmap.org/

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const NOMINATIM_HEADERS = { 'User-Agent': 'LynkApp/1.0 (https://lynkapp.com)' };

// Forward geocoding: address → coordinates
// Returns: { lat, lng, displayName, address, ... }
export async function geocode(query, options = {}) {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: options.limit || 5,
    addressdetails: 1,
    ...(options.countrycodes && { countrycodes: options.countrycodes }),
    ...(options.viewbox    && { viewbox: options.viewbox, bounded: 1 }),
  });

  const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: NOMINATIM_HEADERS,
  });
  if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);
  const data = await res.json();

  return data.map(r => ({
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    displayName: r.display_name,
    shortName: r.display_name.split(',')[0],
    type: r.type,
    importance: r.importance,
    address: r.address || {},
    raw: r,
  }));
}

// Reverse geocoding: coordinates → address
// Returns: { displayName, address, city, state, country, ... }
export async function reverseGeocode(lat, lng, options = {}) {
  const params = new URLSearchParams({
    lat,
    lon: lng,
    format: 'json',
    addressdetails: 1,
    zoom: options.zoom || 18,
  });

  const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
    headers: NOMINATIM_HEADERS,
  });
  if (!res.ok) throw new Error(`Nominatim reverse error: ${res.status}`);
  const data = await res.json();

  const addr = data.address || {};
  return {
    displayName: data.display_name,
    shortName: data.display_name.split(',').slice(0, 2).join(', '),
    city: addr.city || addr.town || addr.village || addr.suburb || '',
    state: addr.state || '',
    country: addr.country || '',
    postcode: addr.postcode || '',
    road: addr.road || '',
    neighbourhood: addr.neighbourhood || addr.suburb || '',
    address: addr,
    raw: data,
  };
}

// Place search with autocomplete (good for search inputs)
export async function searchPlaces(query, options = {}) {
  if (!query || query.length < 2) return [];
  return geocode(query, { limit: options.limit || 5, ...options });
}

// ═══════════════════════════════════════════════════════════════
//  5. USER LOCATION (Browser Geolocation API)
// ═══════════════════════════════════════════════════════════════

// Get the user's current location
// Returns: { lat, lng, accuracy }
export function getUserLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by this browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
      err => reject(new Error(`Geolocation error: ${err.message}`)),
      {
        enableHighAccuracy: options.highAccuracy !== false,
        timeout: options.timeout || 10000,
        maximumAge: options.maxAge || 60000,
      }
    );
  });
}

// Watch user location (continuous updates)
export function watchUserLocation(callback, options = {}) {
  if (!navigator.geolocation) return null;
  return navigator.geolocation.watchPosition(
    pos => callback(null, {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    }),
    err => callback(new Error(`Geolocation watch error: ${err.message}`)),
    {
      enableHighAccuracy: options.highAccuracy !== false,
      timeout: options.timeout || 10000,
      maximumAge: options.maxAge || 30000,
    }
  );
}

// Center map on user's location, add a "you are here" marker
export async function centerOnUser(map, options = {}) {
  const location = await getUserLocation(options);
  if (!window.L || !map) return location;

  map.setView([location.lat, location.lng], options.zoom || 15);

  // Add "you are here" pulse marker
  if (options.addMarker !== false) {
    const L = window.L;

    // Accuracy circle
    if (options.showAccuracy && location.accuracy) {
      L.circle([location.lat, location.lng], {
        radius: location.accuracy,
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        color: '#3b82f6',
        weight: 1,
      }).addTo(map);
    }

    // User dot
    L.circleMarker([location.lat, location.lng], {
      radius: 10,
      fillColor: '#3b82f6',
      color: '#fff',
      weight: 3,
      fillOpacity: 1,
    }).addTo(map)
      .bindPopup(options.popupText || '📍 You are here');
  }

  return location;
}

// ═══════════════════════════════════════════════════════════════
//  6. SHAPES & OVERLAYS
// ═══════════════════════════════════════════════════════════════

// Draw a circle on the map (e.g. nearby radius)
export function drawCircle(map, lat, lng, radiusMeters, options = {}) {
  if (!window.L || !map) return null;
  return window.L.circle([lat, lng], {
    radius: radiusMeters,
    fillColor: options.fillColor || MARKER_COLORS.primary,
    fillOpacity: options.fillOpacity || 0.15,
    color: options.color || MARKER_COLORS.primary,
    weight: options.weight || 2,
    ...options,
  }).addTo(map);
}

// Draw a polygon
export function drawPolygon(map, latlngs, options = {}) {
  if (!window.L || !map) return null;
  return window.L.polygon(latlngs, {
    fillColor: options.fillColor || MARKER_COLORS.primary,
    fillOpacity: options.fillOpacity || 0.2,
    color: options.color || MARKER_COLORS.primary,
    weight: options.weight || 2,
    ...options,
  }).addTo(map);
}

// Draw a polyline (route/path)
export function drawPolyline(map, latlngs, options = {}) {
  if (!window.L || !map) return null;
  return window.L.polyline(latlngs, {
    color: options.color || MARKER_COLORS.primary,
    weight: options.weight || 4,
    opacity: options.opacity || 0.8,
    smoothFactor: 1,
    ...options,
  }).addTo(map);
}

// ═══════════════════════════════════════════════════════════════
//  7. MARKER CLUSTERS (logical grouping, no npm needed)
// ═══════════════════════════════════════════════════════════════

// Group nearby markers into a cluster count bubble
// (Simple manual implementation — no plugin required)
export function clusterMarkers(map, markers, options = {}) {
  if (!window.L || !map) return;
  const L = window.L;
  const clusterRadius = options.radius || 60; // pixels

  const groups = [];
  const used = new Set();

  markers.forEach((m, i) => {
    if (used.has(i)) return;
    const group = [m];
    used.add(i);

    markers.forEach((m2, j) => {
      if (used.has(j) || i === j) return;
      const p1 = map.latLngToLayerPoint(m.getLatLng ? m.getLatLng() : L.latLng(m.lat, m.lng));
      const p2 = map.latLngToLayerPoint(m2.getLatLng ? m2.getLatLng() : L.latLng(m2.lat, m2.lng));
      const dist = p1.distanceTo(p2);
      if (dist < clusterRadius) { group.push(m2); used.add(j); }
    });

    groups.push(group);
  });

  return groups;
}

// ═══════════════════════════════════════════════════════════════
//  8. UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Calculate distance between two points (Haversine formula) in km
export function distanceBetween(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Format distance for display: "0.3 km" or "1.2 mi"
export function formatDistance(km, unit = 'km') {
  if (unit === 'mi') {
    const mi = km * 0.621371;
    return mi < 0.1 ? `${Math.round(mi * 5280)} ft` : `${mi.toFixed(1)} mi`;
  }
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

// Get bounding box that fits all given lat/lng points
export function getBounds(points) {
  if (!window.L || !points.length) return null;
  return window.L.latLngBounds(points.map(p => [p.lat, p.lng]));
}

// Fit map to show all markers
export function fitToMarkers(map, markers, options = {}) {
  if (!window.L || !map || !markers.length) return;
  const bounds = window.L.latLngBounds(
    markers.map(m => m.getLatLng ? m.getLatLng() : window.L.latLng(m.lat, m.lng))
  );
  map.fitBounds(bounds, { padding: options.padding || [50, 50] });
}

// Pan map to a location
export function panTo(map, lat, lng, zoom) {
  if (!map) return;
  if (zoom) map.setView([lat, lng], zoom);
  else map.panTo([lat, lng]);
}

// Clear all markers from map
export function clearMarkers(map, markerArray) {
  if (!map) return;
  markerArray.forEach(m => { if (m && m.remove) m.remove(); });
}

// Remove a layer from map
export function removeLayer(map, layer) {
  if (map && layer) map.removeLayer(layer);
}

// ═══════════════════════════════════════════════════════════════
//  9. LYNKAPP SECTION-SPECIFIC MAP BUILDERS
// ═══════════════════════════════════════════════════════════════

// Events Map — show event locations with numbered markers
// events: [{ lat, lng, title, date, emoji }]
export async function buildEventsMap(containerId, events = [], options = {}) {
  await loadLeaflet();
  const map = initMap(containerId, {
    tileLayer: 'osm',
    zoom: options.zoom || 13,
    center: options.center || (events[0] ? [events[0].lat, events[0].lng] : MAP_DEFAULTS.center),
  });

  const markers = events.map((event, i) => {
    const icon = createNumberedMarker(i + 1, MARKER_COLORS.event);
    const marker = addMarker(map, event.lat, event.lng, {
      icon,
      popup: `
        <div style="min-width:160px;">
          <div style="font-size:20px;text-align:center;margin-bottom:4px;">${event.emoji || '📅'}</div>
          <strong>${event.title}</strong><br>
          <span style="color:#888;font-size:12px;">${event.date || ''}</span>
          ${event.address ? `<br><span style="font-size:11px;">📍 ${event.address}</span>` : ''}
        </div>
      `,
    });
    return marker;
  });

  if (markers.length > 1) fitToMarkers(map, markers);
  return { map, markers };
}

// Marketplace Map — show item/seller locations
// items: [{ lat, lng, title, price, emoji }]
export async function buildMarketplaceMap(containerId, items = [], options = {}) {
  await loadLeaflet();
  const map = initMap(containerId, {
    tileLayer: 'cartoLight',
    zoom: options.zoom || 13,
    center: options.center || (items[0] ? [items[0].lat, items[0].lng] : MAP_DEFAULTS.center),
  });

  const markers = items.map(item => {
    const icon = createEmojiMarker(item.emoji || '🛍️');
    return addMarker(map, item.lat, item.lng, {
      icon,
      popup: `
        <div style="min-width:140px;">
          <strong>${item.title}</strong><br>
          ${item.price ? `<span style="color:#22c55e;font-weight:600;">$${item.price}</span>` : ''}
          ${item.seller ? `<br><span style="font-size:11px;color:#888;">by ${item.seller}</span>` : ''}
          ${item.distance ? `<br><span style="font-size:11px;">📍 ${item.distance} away</span>` : ''}
        </div>
      `,
    });
  });

  if (markers.length > 1) fitToMarkers(map, markers);
  return { map, markers };
}

// Nearby Users Map — dating/friends (privacy-safe: approximate locations only)
// users: [{ lat, lng, name, emoji, distance }] — use approximate coords only!
export async function buildNearbyUsersMap(containerId, users = [], options = {}) {
  await loadLeaflet();
  const tileLayer = options.darkMode ? 'stadiaDark' : 'stadiaSmooth';
  const map = initMap(containerId, {
    tileLayer,
    zoom: options.zoom || 13,
    center: options.center || MAP_DEFAULTS.center,
  });

  // Draw "nearby radius" circle
  if (options.radiusKm) {
    const center = options.center || MAP_DEFAULTS.center;
    drawCircle(map, center[0], center[1], options.radiusKm * 1000, {
      fillColor: options.darkMode ? '#a78bfa' : '#3b82f6',
      color: options.darkMode ? '#a78bfa' : '#3b82f6',
    });
  }

  const markers = users.map(user => {
    const color = options.type === 'dating' ? MARKER_COLORS.dating : MARKER_COLORS.friend;
    const icon = createEmojiMarker(user.emoji || (options.type === 'dating' ? '❤️' : '👤'));
    return addMarker(map, user.lat, user.lng, {
      icon,
      popup: `
        <div style="min-width:120px;text-align:center;">
          <div style="font-size:24px;">${user.emoji || '👤'}</div>
          <strong>${user.name || 'User'}</strong><br>
          ${user.distance ? `<span style="font-size:11px;color:#888;">${user.distance} away</span>` : ''}
        </div>
      `,
    });
  });

  if (markers.length > 1) fitToMarkers(map, markers);
  return { map, markers };
}

// Business Location Map — single business profile map
export async function buildBusinessMap(containerId, business = {}, options = {}) {
  await loadLeaflet();
  const map = initMap(containerId, {
    tileLayer: 'cartoLight',
    zoom: options.zoom || 16,
    center: [business.lat || MAP_DEFAULTS.center[0], business.lng || MAP_DEFAULTS.center[1]],
    scrollWheelZoom: options.scrollWheelZoom !== false,
  });

  const icon = createEmojiMarker(business.emoji || '🏢', { size: 28 });
  const marker = addMarker(map, business.lat, business.lng, {
    icon,
    popup: `
      <div style="min-width:160px;">
        <strong>${business.name || 'Business'}</strong><br>
        ${business.address ? `<span style="font-size:12px;">📍 ${business.address}</span>` : ''}
        ${business.hours ? `<br><span style="font-size:11px;color:#888;">🕐 ${business.hours}</span>` : ''}
        ${business.phone ? `<br><span style="font-size:11px;">📞 ${business.phone}</span>` : ''}
      </div>
    `,
  });

  marker.openPopup();
  return { map, marker };
}

// Check-in Map — post a check-in location
export async function buildCheckinMap(containerId, location = {}, options = {}) {
  await loadLeaflet();
  const map = initMap(containerId, {
    tileLayer: 'osm',
    zoom: options.zoom || 16,
    center: [location.lat, location.lng],
  });

  const icon = createEmojiMarker(location.emoji || '📍', { size: 28 });
  addMarker(map, location.lat, location.lng, {
    icon,
    popup: `<strong>${location.name || 'Check-in'}</strong>`,
  });

  return { map };
}

// ─── Default export ────────────────────────────────────────────────────────
const MapService = {
  // Loader
  loadLeaflet,
  // Map init
  initMap,
  setTileLayer,
  // Markers
  addMarker,
  addMarkers,
  createDotMarker,
  createHtmlMarker,
  createNumberedMarker,
  createEmojiMarker,
  // Geocoding
  geocode,
  reverseGeocode,
  searchPlaces,
  // User location
  getUserLocation,
  watchUserLocation,
  centerOnUser,
  // Shapes
  drawCircle,
  drawPolygon,
  drawPolyline,
  // Utilities
  distanceBetween,
  formatDistance,
  getBounds,
  fitToMarkers,
  panTo,
  clearMarkers,
  removeLayer,
  // Section builders
  buildEventsMap,
  buildMarketplaceMap,
  buildNearbyUsersMap,
  buildBusinessMap,
  buildCheckinMap,
  // Constants
  TILE_LAYERS,
  MARKER_COLORS,
  SECTION_TILE_LAYERS,
  MAP_DEFAULTS,
  LEAFLET_VERSION,
  LEAFLET_CSS_CDN,
  LEAFLET_JS_CDN,
};

export default MapService;
