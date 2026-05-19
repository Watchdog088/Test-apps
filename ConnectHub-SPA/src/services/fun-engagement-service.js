/**
 * fun-engagement-service.js
 * Fun & Engagement APIs — NEW-27 through NEW-33
 *
 * NEW-27: Numbers API          — NO KEY, FREE  — fun number/date facts
 * NEW-28: Robohash             — NO KEY, FREE  — robot/monster avatars
 * NEW-29: Holiday API          — free tier, needs VITE_HOLIDAY_API_KEY
 * NEW-30: Forismatic Quotes    — NO KEY, FREE  — 500k+ motivational quotes
 * NEW-31: PokéAPI              — NO KEY, FREE  — Pokémon data
 * NEW-32: Cat Facts + Dog API  — NO KEY, FREE  — pet facts & photos
 * NEW-33: HuggingFace GPT-2    — free tier, needs VITE_HUGGINGFACE_API_KEY — AI story prompts
 */

// ─── NEW-27: Numbers API ──────────────────────────────────────────────────────
// NOTE: numbersapi.com supports both http and https

/**
 * Get a fun trivia fact about any number.
 * @param {number} n
 * @returns {Promise<string>}  fact text
 */
export async function getNumberFact(n) {
  const res = await fetch(`http://numbersapi.com/${n}?json`);
  if (!res.ok) throw new Error(`Numbers API error: ${res.status}`);
  const data = await res.json();
  return data.text;
}

/**
 * Get a math fact about any number.
 * @param {number} n
 * @returns {Promise<string>}
 */
export async function getNumberMathFact(n) {
  const res = await fetch(`http://numbersapi.com/${n}/math?json`);
  if (!res.ok) throw new Error(`Numbers API error: ${res.status}`);
  const data = await res.json();
  return data.text;
}

/**
 * Get a historical fact for a given date (month/day).
 * @param {number} month  1–12
 * @param {number} day    1–31
 * @returns {Promise<string>}
 */
export async function getDateFact(month, day) {
  const res = await fetch(`http://numbersapi.com/${month}/${day}/date?json`);
  if (!res.ok) throw new Error(`Numbers API error: ${res.status}`);
  const data = await res.json();
  return data.text;
}

/**
 * Get a fact for today's date.
 * @returns {Promise<string>}
 */
export async function getTodayFact() {
  const now = new Date();
  return getDateFact(now.getMonth() + 1, now.getDate());
}

/**
 * Get a random number fact.
 * @returns {Promise<{number: number, text: string}>}
 */
export async function getRandomNumberFact() {
  const res = await fetch('http://numbersapi.com/random/trivia?json');
  if (!res.ok) throw new Error(`Numbers API error: ${res.status}`);
  return res.json(); // { number, text, found, type }
}

// ─── NEW-28: Robohash Avatars ─────────────────────────────────────────────────

/**
 * Generate a Robohash avatar URL for any string/username.
 * @param {string} seed   Any string — username, email, user ID
 * @param {Object} [opts]
 * @param {1|2|3|4} [opts.set=1]   1=robots, 2=monsters, 3=robot heads, 4=cats
 * @param {string} [opts.size='200x200']
 * @param {string} [opts.bgSet]   'bg1' or 'bg2' for background
 * @returns {string}  URL to the generated avatar image
 */
export function getRobohashUrl(seed, { set = 1, size = '200x200', bgSet = '' } = {}) {
  const encoded = encodeURIComponent(seed);
  let url = `https://robohash.org/${encoded}.png?set=set${set}&size=${size}`;
  if (bgSet) url += `&bgset=${bgSet}`;
  return url;
}

/**
 * Generate multiple Robohash variants for a username.
 * Returns URLs for all 4 sets.
 * @param {string} username
 * @returns {Object}  { robot, monster, robotHead, cat }
 */
export function getAllRobohashStyles(username) {
  return {
    robot:     getRobohashUrl(username, { set: 1 }),
    monster:   getRobohashUrl(username, { set: 2 }),
    robotHead: getRobohashUrl(username, { set: 3 }),
    cat:       getRobohashUrl(username, { set: 4 }),
  };
}

// ─── NEW-29: Holiday API ──────────────────────────────────────────────────────

const HOLIDAY_API_KEY = import.meta.env?.VITE_HOLIDAY_API_KEY || '';
const HOLIDAY_BASE = 'https://holidayapi.com/v1';

/**
 * Get public holidays for a country and year.
 * @param {string} country  ISO 3166-1 alpha-2 e.g. 'US', 'GB', 'DE'
 * @param {number} [year]   defaults to current year - 1 (free tier restriction)
 * @returns {Promise<Array>}  array of holiday objects
 */
export async function getPublicHolidays(country, year) {
  if (!HOLIDAY_API_KEY) {
    console.warn('Holiday API: VITE_HOLIDAY_API_KEY not set. Using mock data.');
    return getMockHolidays(country);
  }
  // Free tier only allows past years
  const targetYear = year || (new Date().getFullYear() - 1);
  const params = new URLSearchParams({ key: HOLIDAY_API_KEY, country, year: targetYear });
  const res = await fetch(`${HOLIDAY_BASE}/holidays?${params}`);
  if (!res.ok) throw new Error(`Holiday API error: ${res.status}`);
  const data = await res.json();
  return (data.holidays || []).map((h) => ({
    name: h.name,
    date: h.date,
    observed: h.observed,
    public: h.public,
    country: h.country,
    uuid: h.uuid,
  }));
}

/**
 * Get upcoming public holidays (within the next 60 days) for a country.
 * @param {string} country
 * @returns {Promise<Array>}
 */
export async function getUpcomingHolidays(country = 'US') {
  const year = new Date().getFullYear() - 1; // free tier: past years only
  const holidays = await getPublicHolidays(country, year);
  const today = new Date();
  return holidays
    .filter((h) => {
      const d = new Date(h.date);
      const diffDays = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 60;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function getMockHolidays(country) {
  const year = new Date().getFullYear();
  return [
    { name: "New Year's Day",      date: `${year}-01-01`, public: true, country },
    { name: "Martin Luther King Jr. Day", date: `${year}-01-20`, public: true, country },
    { name: "Presidents' Day",     date: `${year}-02-17`, public: true, country },
    { name: "Memorial Day",        date: `${year}-05-26`, public: true, country },
    { name: "Independence Day",    date: `${year}-07-04`, public: true, country },
    { name: "Labor Day",           date: `${year}-09-01`, public: true, country },
    { name: "Thanksgiving Day",    date: `${year}-11-27`, public: true, country },
    { name: "Christmas Day",       date: `${year}-12-25`, public: true, country },
  ];
}

// ─── NEW-30: Forismatic Quotes ────────────────────────────────────────────────

/**
 * Get a random motivational quote.
 * Uses a CORS proxy since Forismatic doesn't support direct browser CORS.
 * @returns {Promise<{quoteText: string, quoteAuthor: string}>}
 */
export async function getMotivationalQuote() {
  // Forismatic has CORS issues in browser — use allorigins proxy
  const apiUrl = 'https://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=json';
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
  try {
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`Forismatic proxy error: ${res.status}`);
    const data = await res.json();
    return {
      quoteText: data.quoteText?.trim() || '',
      quoteAuthor: data.quoteAuthor?.trim() || 'Unknown',
      quoteLink: data.quoteLink || '',
    };
  } catch {
    // Final fallback: curated quotes
    return getFallbackQuote();
  }
}

const FALLBACK_QUOTES = [
  { quoteText: "The only way to do great work is to love what you do.", quoteAuthor: "Steve Jobs" },
  { quoteText: "In the middle of every difficulty lies opportunity.", quoteAuthor: "Albert Einstein" },
  { quoteText: "It does not matter how slowly you go as long as you do not stop.", quoteAuthor: "Confucius" },
  { quoteText: "Life is what happens when you're busy making other plans.", quoteAuthor: "John Lennon" },
  { quoteText: "The future belongs to those who believe in the beauty of their dreams.", quoteAuthor: "Eleanor Roosevelt" },
  { quoteText: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", quoteAuthor: "Mother Teresa" },
  { quoteText: "When you reach the end of your rope, tie a knot in it and hang on.", quoteAuthor: "Franklin D. Roosevelt" },
  { quoteText: "Always remember that you are absolutely unique. Just like everyone else.", quoteAuthor: "Margaret Mead" },
];

export function getFallbackQuote() {
  return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
}

// ─── NEW-31: PokéAPI ──────────────────────────────────────────────────────────

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

/**
 * Get data for a specific Pokémon by name or ID.
 * @param {string|number} nameOrId  e.g. 'pikachu', 25
 * @returns {Promise<Object>}  simplified Pokémon object
 */
export async function getPokemon(nameOrId) {
  const key = String(nameOrId).toLowerCase();
  const res = await fetch(`${POKEAPI_BASE}/pokemon/${key}`);
  if (!res.ok) throw new Error(`PokéAPI error: ${res.status} for "${nameOrId}"`);
  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    height: data.height,      // in decimetres
    weight: data.weight,      // in hectograms
    types: data.types.map((t) => t.type.name),
    abilities: data.abilities.map((a) => a.ability.name),
    stats: Object.fromEntries(data.stats.map((s) => [s.stat.name, s.base_stat])),
    sprites: {
      front: data.sprites.front_default,
      frontShiny: data.sprites.front_shiny,
      artwork: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
    },
    moves: data.moves.slice(0, 10).map((m) => m.move.name), // first 10 moves
    baseExperience: data.base_experience,
  };
}

/**
 * Get a random Pokémon (from gen 1-8, IDs 1-898).
 * @returns {Promise<Object>}
 */
export async function getRandomPokemon() {
  const id = Math.floor(Math.random() * 898) + 1;
  return getPokemon(id);
}

/**
 * List Pokémon with pagination.
 * @param {number} [limit=20]
 * @param {number} [offset=0]
 * @returns {Promise<Array>}  array of { name, url, id }
 */
export async function listPokemon(limit = 20, offset = 0) {
  const res = await fetch(`${POKEAPI_BASE}/pokemon?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error(`PokéAPI list error: ${res.status}`);
  const data = await res.json();
  return data.results.map((p) => {
    const id = parseInt(p.url.split('/').filter(Boolean).pop());
    return { name: p.name, url: p.url, id, sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png` };
  });
}

/**
 * Get Pokémon type information.
 * @param {string} type  e.g. 'fire', 'water', 'grass'
 * @returns {Promise<Object>}
 */
export async function getPokemonType(type) {
  const res = await fetch(`${POKEAPI_BASE}/type/${type.toLowerCase()}`);
  if (!res.ok) throw new Error(`PokéAPI type error: ${res.status}`);
  const data = await res.json();
  return {
    name: data.name,
    doubleDamageTo: data.damage_relations.double_damage_to.map((t) => t.name),
    halfDamageTo: data.damage_relations.half_damage_to.map((t) => t.name),
    noDamageTo: data.damage_relations.no_damage_to.map((t) => t.name),
    doubleDamageFrom: data.damage_relations.double_damage_from.map((t) => t.name),
    pokemonCount: data.pokemon.length,
  };
}

// ─── NEW-32: Cat Facts + Dog API ──────────────────────────────────────────────

/**
 * Get a random cat fact.
 * @returns {Promise<{fact: string, length: number}>}
 */
export async function getCatFact() {
  const res = await fetch('https://catfact.ninja/fact');
  if (!res.ok) throw new Error(`Cat Facts API error: ${res.status}`);
  return res.json(); // { fact, length }
}

/**
 * Get multiple cat facts.
 * @param {number} [count=5]
 * @returns {Promise<Array<string>>}
 */
export async function getCatFacts(count = 5) {
  const res = await fetch(`https://catfact.ninja/facts?limit=${count}`);
  if (!res.ok) throw new Error(`Cat Facts API error: ${res.status}`);
  const data = await res.json();
  return data.data.map((f) => f.fact);
}

/**
 * Get a random dog image URL.
 * @returns {Promise<string>}  URL to a random dog photo
 */
export async function getRandomDogImage() {
  const res = await fetch('https://dog.ceo/api/breeds/image/random');
  if (!res.ok) throw new Error(`Dog API error: ${res.status}`);
  const data = await res.json();
  return data.message; // URL string
}

/**
 * Get multiple random dog images.
 * @param {number} [count=5]
 * @returns {Promise<string[]>}  array of image URLs
 */
export async function getRandomDogImages(count = 5) {
  const res = await fetch(`https://dog.ceo/api/breeds/image/random/${count}`);
  if (!res.ok) throw new Error(`Dog API error: ${res.status}`);
  const data = await res.json();
  return data.message; // array of URLs
}

/**
 * Get all dog breeds.
 * @returns {Promise<string[]>}  sorted list of breed names
 */
export async function getDogBreeds() {
  const res = await fetch('https://dog.ceo/api/breeds/list/all');
  if (!res.ok) throw new Error(`Dog API error: ${res.status}`);
  const data = await res.json();
  return Object.keys(data.message).sort();
}

/**
 * Get random images for a specific dog breed.
 * @param {string} breed  e.g. 'labrador', 'poodle', 'husky'
 * @param {number} [count=3]
 * @returns {Promise<string[]>}
 */
export async function getDogImagesByBreed(breed, count = 3) {
  const res = await fetch(`https://dog.ceo/api/breed/${breed.toLowerCase()}/images/random/${count}`);
  if (!res.ok) throw new Error(`Dog API error for breed "${breed}": ${res.status}`);
  const data = await res.json();
  return data.message;
}

// ─── NEW-33: HuggingFace GPT-2 (Story/Creative Prompts) ──────────────────────

const HF_API_KEY = import.meta.env?.VITE_HUGGINGFACE_API_KEY || '';
const HF_MODEL = 'gpt2';

/**
 * Generate a creative story continuation using HuggingFace GPT-2.
 * @param {string} prompt  Story opening / prompt text
 * @param {number} [maxTokens=100]
 * @returns {Promise<string>}  generated continuation text
 */
export async function generateStoryPrompt(prompt, maxTokens = 100) {
  if (!HF_API_KEY) {
    console.warn('HuggingFace: VITE_HUGGINGFACE_API_KEY not set. Using creative fallback.');
    return getCreativeFallback(prompt);
  }
  const res = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: maxTokens, temperature: 0.8, do_sample: true },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    // Model may be loading — return friendly message
    if (res.status === 503) return 'The AI story engine is warming up. Please try again in 20 seconds!';
    throw new Error(`HuggingFace error: ${res.status} — ${err}`);
  }
  const data = await res.json();
  const generated = data[0]?.generated_text || '';
  // Return only the new text (after the prompt)
  return generated.startsWith(prompt) ? generated.slice(prompt.length).trim() : generated.trim();
}

/**
 * Get a random creative writing prompt (no AI needed).
 * @returns {string}
 */
export function getWritingPrompt() {
  const prompts = [
    "A detective wakes up to find they are the prime suspect in their own case...",
    "In a world where music is illegal, one musician refuses to be silenced...",
    "The last lighthouse keeper receives a message from a ship that disappeared 100 years ago...",
    "Two strangers keep meeting in their dreams — but they've never met in real life...",
    "A chef discovers that the secret ingredient in their grandmother's recipe is magic...",
    "An astronaut returning from a 2-year mission finds that everyone on Earth has forgotten she exists...",
    "The new AI assistant is suspiciously helpful — almost like it knows what's going to happen...",
    "A time traveler arrives to warn you about next Tuesday...",
    "You discover that your shadow has been living a completely different life...",
    "The fortune cookie was right. Every single one of them, for the past 30 days...",
  ];
  return prompts[Math.floor(Math.random() * prompts.length)];
}

function getCreativeFallback(prompt) {
  const continuations = [
    " ...and that's when everything changed. The world would never be the same after that moment.",
    " ...the door creaked open slowly, revealing a mystery that had waited centuries to be solved.",
    " ...suddenly, a voice from behind whispered the three words that changed everything.",
    " ...in that instant, every decision ever made led perfectly to this one unforgettable moment.",
    " ...the answer had been there all along, hidden in plain sight the entire time.",
  ];
  return continuations[Math.floor(Math.random() * continuations.length)];
}

// ─── Combined: Daily "Fun Feed" Widget ────────────────────────────────────────

/**
 * Get a full "Fun Feed" bundle: quote + number fact + random Pokémon + cat fact.
 * Used for the Feed header daily widget.
 * @returns {Promise<Object>}
 */
export async function getDailyFunBundle() {
  const today = new Date();
  const [quote, dateFact, pokemon, catFact, dogImage] = await Promise.allSettled([
    getMotivationalQuote(),
    getTodayFact(),
    getRandomPokemon(),
    getCatFact(),
    getRandomDogImage(),
  ]);

  return {
    date: today.toISOString().split('T')[0],
    quote: quote.status === 'fulfilled' ? quote.value : getFallbackQuote(),
    dateFact: dateFact.status === 'fulfilled' ? dateFact.value : `Today is ${today.toDateString()}`,
    pokemon: pokemon.status === 'fulfilled' ? pokemon.value : null,
    catFact: catFact.status === 'fulfilled' ? catFact.value.fact : 'Cats sleep 12-16 hours a day.',
    dogImage: dogImage.status === 'fulfilled' ? dogImage.value : null,
  };
}

export default {
  // Numbers API
  getNumberFact,
  getNumberMathFact,
  getDateFact,
  getTodayFact,
  getRandomNumberFact,
  // Robohash
  getRobohashUrl,
  getAllRobohashStyles,
  // Holiday API
  getPublicHolidays,
  getUpcomingHolidays,
  // Forismatic Quotes
  getMotivationalQuote,
  getFallbackQuote,
  // PokéAPI
  getPokemon,
  getRandomPokemon,
  listPokemon,
  getPokemonType,
  // Cat & Dog
  getCatFact,
  getCatFacts,
  getRandomDogImage,
  getRandomDogImages,
  getDogBreeds,
  getDogImagesByBreed,
  // HuggingFace
  generateStoryPrompt,
  getWritingPrompt,
  // Combined
  getDailyFunBundle,
};
