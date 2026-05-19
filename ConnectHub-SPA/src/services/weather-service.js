// src/services/weather-service.js — Open-Meteo Weather API
// ✅ NO API KEY REQUIRED — completely free, no sign-up, no rate limits (commercial use ok)
// API Docs: https://open-meteo.com/en/docs
// Geocoding Docs: https://open-meteo.com/en/docs/geocoding-api
// License: Open-Meteo data is licensed under Attribution 4.0 International (CC BY 4.0)
// Attribution: "Weather data by Open-Meteo.com"

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1';
const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1';

// ─── WMO Weather Interpretation Codes → Human-readable descriptions & emoji ───
// See: https://open-meteo.com/en/docs#weathervariables
export const WMO_CODES = {
  0:  { label: 'Clear sky',               emoji: '☀️',  icon: 'sun' },
  1:  { label: 'Mainly clear',            emoji: '🌤️', icon: 'sun-cloud' },
  2:  { label: 'Partly cloudy',           emoji: '⛅',  icon: 'cloud-sun' },
  3:  { label: 'Overcast',                emoji: '☁️',  icon: 'cloud' },
  45: { label: 'Fog',                     emoji: '🌫️', icon: 'fog' },
  48: { label: 'Icy fog',                 emoji: '🌫️', icon: 'fog' },
  51: { label: 'Light drizzle',           emoji: '🌦️', icon: 'drizzle' },
  53: { label: 'Moderate drizzle',        emoji: '🌦️', icon: 'drizzle' },
  55: { label: 'Heavy drizzle',           emoji: '🌧️', icon: 'drizzle' },
  56: { label: 'Freezing drizzle',        emoji: '🌧️', icon: 'sleet' },
  57: { label: 'Heavy freezing drizzle',  emoji: '🌧️', icon: 'sleet' },
  61: { label: 'Light rain',              emoji: '🌧️', icon: 'rain' },
  63: { label: 'Moderate rain',           emoji: '🌧️', icon: 'rain' },
  65: { label: 'Heavy rain',              emoji: '🌧️', icon: 'rain' },
  66: { label: 'Freezing rain',           emoji: '🌨️', icon: 'sleet' },
  67: { label: 'Heavy freezing rain',     emoji: '🌨️', icon: 'sleet' },
  71: { label: 'Light snow',              emoji: '🌨️', icon: 'snow' },
  73: { label: 'Moderate snow',           emoji: '❄️',  icon: 'snow' },
  75: { label: 'Heavy snow',              emoji: '❄️',  icon: 'snow' },
  77: { label: 'Snow grains',             emoji: '🌨️', icon: 'snow' },
  80: { label: 'Light showers',           emoji: '🌦️', icon: 'showers' },
  81: { label: 'Moderate showers',        emoji: '🌦️', icon: 'showers' },
  82: { label: 'Heavy showers',           emoji: '⛈️',  icon: 'showers' },
  85: { label: 'Light snow showers',      emoji: '🌨️', icon: 'snow' },
  86: { label: 'Heavy snow showers',      emoji: '❄️',  icon: 'snow' },
  95: { label: 'Thunderstorm',            emoji: '⛈️',  icon: 'thunderstorm' },
  96: { label: 'Thunderstorm with hail',  emoji: '⛈️',  icon: 'thunderstorm' },
  99: { label: 'Thunderstorm, heavy hail',emoji: '⛈️',  icon: 'thunderstorm' },
};

// ─── Helper: decode WMO weather code ──────────────────────────────────────
export function decodeWeatherCode(code) {
  return WMO_CODES[code] || { label: 'Unknown', emoji: '🌡️', icon: 'unknown' };
}

// ─── Helper: safe fetch ───────────────────────────────────────────────────
async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('[WeatherService] fetch error:', err);
    return null;
  }
}

// ─── Helper: build URL with params ───────────────────────────────────────
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
//  1. CURRENT WEATHER
// ═══════════════════════════════════════════════════════════════

// Get current conditions at a lat/lon
// Returns: { temperature, feels_like, humidity, wind_speed, wind_direction,
//            weather_code, description, emoji, icon, is_day, uv_index }
export async function getCurrentWeather(latitude, longitude, {
  temperatureUnit = 'fahrenheit',   // 'celsius' | 'fahrenheit'
  windSpeedUnit = 'mph',            // 'kmh' | 'ms' | 'mph' | 'kn'
  timezone = 'auto',                // 'auto' detects from lat/lon
} = {}) {
  if (!latitude || !longitude) return null;

  const url = buildUrl(OPEN_METEO_BASE, 'forecast', {
    latitude,
    longitude,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'is_day',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
      'precipitation',
      'uv_index',
    ].join(','),
    temperature_unit: temperatureUnit,
    wind_speed_unit: windSpeedUnit,
    timezone,
  });

  const data = await safeFetch(url);
  if (!data?.current) return null;

  const c = data.current;
  const weather = decodeWeatherCode(c.weather_code);

  return {
    temperature:    Math.round(c.temperature_2m),
    feels_like:     Math.round(c.apparent_temperature),
    humidity:       c.relative_humidity_2m,
    wind_speed:     Math.round(c.wind_speed_10m),
    wind_direction: c.wind_direction_10m,
    cloud_cover:    c.cloud_cover,
    precipitation:  c.precipitation,
    uv_index:       c.uv_index,
    weather_code:   c.weather_code,
    description:    weather.label,
    emoji:          weather.emoji,
    icon:           weather.icon,
    is_day:         c.is_day === 1,
    unit:           temperatureUnit === 'fahrenheit' ? '°F' : '°C',
    wind_unit:      windSpeedUnit,
    timestamp:      c.time,
    latitude,
    longitude,
    timezone:       data.timezone,
  };
}

// ═══════════════════════════════════════════════════════════════
//  2. HOURLY FORECAST (48 hours)
// ═══════════════════════════════════════════════════════════════

export async function getHourlyForecast(latitude, longitude, {
  hours = 24,                       // How many hours to return (max 168 = 7 days)
  temperatureUnit = 'fahrenheit',
  windSpeedUnit = 'mph',
  timezone = 'auto',
} = {}) {
  if (!latitude || !longitude) return [];

  const url = buildUrl(OPEN_METEO_BASE, 'forecast', {
    latitude,
    longitude,
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'weather_code',
      'precipitation_probability',
      'wind_speed_10m',
      'is_day',
    ].join(','),
    forecast_hours: Math.min(hours, 168),
    temperature_unit: temperatureUnit,
    wind_speed_unit: windSpeedUnit,
    timezone,
  });

  const data = await safeFetch(url);
  if (!data?.hourly) return [];

  const h = data.hourly;
  const results = [];

  for (let i = 0; i < Math.min(hours, h.time.length); i++) {
    const weather = decodeWeatherCode(h.weather_code[i]);
    results.push({
      time:               h.time[i],
      temperature:        Math.round(h.temperature_2m[i]),
      feels_like:         Math.round(h.apparent_temperature[i]),
      weather_code:       h.weather_code[i],
      description:        weather.label,
      emoji:              weather.emoji,
      icon:               weather.icon,
      precipitation_prob: h.precipitation_probability[i],
      wind_speed:         Math.round(h.wind_speed_10m[i]),
      is_day:             h.is_day?.[i] === 1,
    });
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════
//  3. DAILY FORECAST (up to 16 days)
// ═══════════════════════════════════════════════════════════════

export async function getDailyForecast(latitude, longitude, {
  days = 7,                         // 1–16 days
  temperatureUnit = 'fahrenheit',
  windSpeedUnit = 'mph',
  timezone = 'auto',
} = {}) {
  if (!latitude || !longitude) return [];

  const url = buildUrl(OPEN_METEO_BASE, 'forecast', {
    latitude,
    longitude,
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'uv_index_max',
    ].join(','),
    forecast_days: Math.min(days, 16),
    temperature_unit: temperatureUnit,
    wind_speed_unit: windSpeedUnit,
    timezone,
  });

  const data = await safeFetch(url);
  if (!data?.daily) return [];

  const d = data.daily;
  const results = [];

  for (let i = 0; i < d.time.length; i++) {
    const weather = decodeWeatherCode(d.weather_code[i]);
    results.push({
      date:               d.time[i],
      weather_code:       d.weather_code[i],
      description:        weather.label,
      emoji:              weather.emoji,
      icon:               weather.icon,
      temp_max:           Math.round(d.temperature_2m_max[i]),
      temp_min:           Math.round(d.temperature_2m_min[i]),
      feels_max:          Math.round(d.apparent_temperature_max[i]),
      feels_min:          Math.round(d.apparent_temperature_min[i]),
      sunrise:            d.sunrise?.[i] || null,
      sunset:             d.sunset?.[i] || null,
      precipitation_sum:  d.precipitation_sum[i],
      precip_probability: d.precipitation_probability_max[i],
      wind_speed_max:     Math.round(d.wind_speed_10m_max[i]),
      uv_index_max:       d.uv_index_max?.[i] || 0,
    });
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════
//  4. GEOCODING — convert city name → lat/lon
// ═══════════════════════════════════════════════════════════════

// Search for a city/location and return coordinates
// Usage: const places = await geocodeCity('Washington DC')
export async function geocodeCity(name, { count = 5, language = 'en' } = {}) {
  if (!name?.trim()) return [];

  const url = buildUrl(GEOCODING_BASE, 'search', {
    name: name.trim(),
    count,
    language,
    format: 'json',
  });

  const data = await safeFetch(url);
  return data?.results || [];
}

// Get coordinates for a city and fetch current weather in one call
// Usage: const weather = await getWeatherByCity('New York')
export async function getWeatherByCity(cityName, options = {}) {
  const places = await geocodeCity(cityName, { count: 1 });
  if (!places.length) return null;

  const { latitude, longitude, name, country, admin1 } = places[0];
  const weather = await getCurrentWeather(latitude, longitude, options);

  if (!weather) return null;
  return {
    ...weather,
    city: name,
    region: admin1 || '',
    country: country || '',
    display_name: admin1 ? `${name}, ${admin1}` : `${name}, ${country}`,
  };
}

// ═══════════════════════════════════════════════════════════════
//  5. GEOLOCATION — get user's coordinates from browser
// ═══════════════════════════════════════════════════════════════

// Returns a promise of { latitude, longitude } or null
export function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('[WeatherService] Geolocation not supported.');
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => {
        console.warn('[WeatherService] Geolocation denied:', err.message);
        resolve(null);
      },
      { timeout: 8000, maximumAge: 300000 } // 5-min cache
    );
  });
}

// Get weather at the user's current location (auto-detects via browser geolocation)
export async function getWeatherAtUserLocation(options = {}) {
  const coords = await getUserLocation();
  if (!coords) return null;
  return await getCurrentWeather(coords.latitude, coords.longitude, options);
}

// ═══════════════════════════════════════════════════════════════
//  6. WEATHER FOR EVENTS — useful for Events section
// ═══════════════════════════════════════════════════════════════

// Get the weather forecast for a specific date at a location
// (useful for event cards to show "will it rain?")
export async function getWeatherForDate(latitude, longitude, dateString, options = {}) {
  const daily = await getDailyForecast(latitude, longitude, { days: 16, ...options });
  return daily.find(d => d.date === dateString) || null;
}

// ═══════════════════════════════════════════════════════════════
//  7. AIR QUALITY (uses Open-Meteo Air Quality API)
// ═══════════════════════════════════════════════════════════════

const AIR_QUALITY_BASE = 'https://air-quality-api.open-meteo.com/v1';

export async function getAirQuality(latitude, longitude, { timezone = 'auto' } = {}) {
  if (!latitude || !longitude) return null;

  const url = buildUrl(AIR_QUALITY_BASE, 'air-quality', {
    latitude,
    longitude,
    current: 'us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,dust',
    timezone,
  });

  const data = await safeFetch(url);
  if (!data?.current) return null;

  const c = data.current;
  const aqi = c.us_aqi;

  // AQI level description (EPA scale)
  let aqi_label, aqi_color;
  if      (aqi <= 50)  { aqi_label = 'Good';             aqi_color = '#00e400'; }
  else if (aqi <= 100) { aqi_label = 'Moderate';         aqi_color = '#ffff00'; }
  else if (aqi <= 150) { aqi_label = 'Unhealthy (sensitive)'; aqi_color = '#ff7e00'; }
  else if (aqi <= 200) { aqi_label = 'Unhealthy';        aqi_color = '#ff0000'; }
  else if (aqi <= 300) { aqi_label = 'Very Unhealthy';   aqi_color = '#8f3f97'; }
  else                 { aqi_label = 'Hazardous';         aqi_color = '#7e0023'; }

  return {
    aqi,
    aqi_label,
    aqi_color,
    pm2_5:            c.pm2_5,
    pm10:             c.pm10,
    carbon_monoxide:  c.carbon_monoxide,
    nitrogen_dioxide: c.nitrogen_dioxide,
    ozone:            c.ozone,
    dust:             c.dust,
    timestamp:        c.time,
  };
}

// ═══════════════════════════════════════════════════════════════
//  8. HELPERS & UTILITIES
// ═══════════════════════════════════════════════════════════════

// Convert Celsius to Fahrenheit
export const celsiusToFahrenheit = (c) => Math.round((c * 9/5) + 32);

// Convert Fahrenheit to Celsius
export const fahrenheitToCelsius = (f) => Math.round((f - 32) * 5/9);

// Get wind direction label from degrees
export function getWindDirection(degrees) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(degrees / 45) % 8];
}

// Get UV index label
export function getUVIndexLabel(uv) {
  if (uv < 3)  return { label: 'Low',        color: '#3ea72d' };
  if (uv < 6)  return { label: 'Moderate',   color: '#fff300' };
  if (uv < 8)  return { label: 'High',       color: '#f18b00' };
  if (uv < 11) return { label: 'Very High',  color: '#e53210' };
  return               { label: 'Extreme',   color: '#b567a4' };
}

// Get precipitation probability label
export function getPrecipLabel(percent) {
  if (percent < 20) return 'Unlikely';
  if (percent < 40) return 'Slight chance';
  if (percent < 60) return 'Possible';
  if (percent < 80) return 'Likely';
  return 'Very likely';
}

// Format temperature with unit symbol
export function formatTemp(temp, unit = '°F') {
  return `${temp}${unit}`;
}

// Format time string from ISO-8601 (Open-Meteo returns "2026-05-18T14:00")
export function formatWeatherTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch { return isoString; }
}

// Format date from "2026-05-18"
export function formatWeatherDate(dateString) {
  try {
    const d = new Date(dateString + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch { return dateString; }
}

// ═══════════════════════════════════════════════════════════════
//  LYNKAPP PRESETS — ready-to-use calls for each section
// ═══════════════════════════════════════════════════════════════

// Default city coordinates used as fallback (Washington DC — LynkApp HQ)
export const LYNKAPP_HQ = { latitude: 38.8951, longitude: -77.0364, city: 'Washington', region: 'DC', country: 'US' };

export const WeatherPresets = {
  // Feed header widget: current conditions at user's location
  feedWeather: (lat, lon) => getCurrentWeather(lat, lon),

  // Events section: weather for event date
  eventWeather: (lat, lon, date) => getWeatherForDate(lat, lon, date),

  // Outdoor events: 7-day forecast
  weekForecast: (lat, lon) => getDailyForecast(lat, lon, { days: 7 }),

  // Hourly strip (next 24h) — e.g., for a weather widget
  hourlyStrip: (lat, lon) => getHourlyForecast(lat, lon, { hours: 24 }),

  // Profile/Dating: "Good day to go out?" — current + 24h
  outdoorConditions: async (lat, lon) => {
    const [current, hourly] = await Promise.all([
      getCurrentWeather(lat, lon),
      getHourlyForecast(lat, lon, { hours: 12 }),
    ]);
    return { current, hourly };
  },

  // Air quality widget (Health & Wellness section)
  airQuality: (lat, lon) => getAirQuality(lat, lon),

  // City search for events/dating discover
  cityWeather: (cityName) => getWeatherByCity(cityName),

  // Auto-detect user location and return current weather
  myLocation: () => getWeatherAtUserLocation(),
};

// ─── Default export ───────────────────────────────────────────
const WeatherService = {
  // Core functions
  getCurrentWeather,
  getHourlyForecast,
  getDailyForecast,
  getWeatherByCity,
  getWeatherForDate,
  getWeatherAtUserLocation,
  getUserLocation,
  getAirQuality,
  geocodeCity,
  // Helpers
  decodeWeatherCode,
  getWindDirection,
  getUVIndexLabel,
  getPrecipLabel,
  formatTemp,
  formatWeatherTime,
  formatWeatherDate,
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  // Constants
  WMO_CODES,
  LYNKAPP_HQ,
  // Presets
  WeatherPresets,
};

export default WeatherService;
