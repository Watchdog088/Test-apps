/**
 * Wger Workout Manager API Service
 * Base URL: https://wger.de/api/v2/
 * API Key: NOT required for read-only public endpoints
 * CORS: Native support — direct fetch() works in browser
 * Docs: https://wger.de/en/software/api
 */

const WGER_BASE = 'https://wger.de/api/v2';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function wgerGet(path, params = {}) {
  const url = new URL(`${WGER_BASE}${path}`);
  url.searchParams.set('format', 'json');
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) throw new Error(`Wger API error ${res.status}: ${res.statusText}`);
  return res.json();
}

// ─── Exercises ──────────────────────────────────────────────────────────────

/**
 * Search exercises by name (English only).
 * @param {string} term - Search term e.g. "bench press"
 * @param {object} opts - { language: 2 (English), category, limit, offset }
 * @returns {Promise<{count, results: Exercise[]}>}
 */
export async function searchExercises(term, opts = {}) {
  return wgerGet('/exercise/search/', {
    term,
    language: opts.language || 'english',
    format: 'json',
  });
}

/**
 * Get paginated exercise list with full details.
 * @param {object} opts - { category, muscles, equipment, language, limit, offset }
 */
export async function getExercises(opts = {}) {
  return wgerGet('/exercise/', {
    language: opts.language || 2, // 2 = English
    category: opts.category,
    muscles: opts.muscles,
    equipment: opts.equipment,
    limit: opts.limit || 20,
    offset: opts.offset || 0,
  });
}

/**
 * Get a single exercise by ID.
 * @param {number} exerciseId
 */
export async function getExercise(exerciseId) {
  return wgerGet(`/exercise/${exerciseId}/`);
}

/**
 * Get exercise info (combines exercise + images + videos).
 * @param {number} exerciseId
 */
export async function getExerciseInfo(exerciseId) {
  return wgerGet(`/exerciseinfo/${exerciseId}/`);
}

// ─── Exercise Categories ────────────────────────────────────────────────────

/**
 * Get all exercise categories (Abs, Arms, Back, Chest, Legs, etc.)
 */
export async function getExerciseCategories() {
  return wgerGet('/exercisecategory/');
}

// ─── Muscles ────────────────────────────────────────────────────────────────

/**
 * Get all muscles (for filtering exercises by targeted muscle).
 */
export async function getMuscles() {
  return wgerGet('/muscle/');
}

// ─── Equipment ──────────────────────────────────────────────────────────────

/**
 * Get all equipment types (Barbell, Dumbbell, Kettlebell, etc.)
 */
export async function getEquipment() {
  return wgerGet('/equipment/');
}

// ─── Nutrition ──────────────────────────────────────────────────────────────

/**
 * Search nutritional ingredients/foods.
 * @param {string} name - Food name to search
 * @param {object} opts - { language, limit, offset }
 */
export async function searchIngredients(name, opts = {}) {
  return wgerGet('/ingredient/', {
    name,
    language: opts.language || 2,
    limit: opts.limit || 20,
    offset: opts.offset || 0,
  });
}

/**
 * Get a single nutritional ingredient by ID.
 * @param {number} ingredientId
 */
export async function getIngredient(ingredientId) {
  return wgerGet(`/ingredient/${ingredientId}/`);
}

/**
 * Get nutritional values for a specific ingredient at a given weight.
 * @param {number} ingredientId
 * @param {number} amount - Weight in grams
 */
export async function getNutritionalValues(ingredientId, amount = 100) {
  return wgerGet('/nutritiondiary/nutritional_values/', {
    ingredient: ingredientId,
    weight_unit: 1, // grams
    amount,
  });
}

// ─── Body Weight / Measurements ─────────────────────────────────────────────

/**
 * Get body weight entries (requires auth in production; returns public mock).
 * In a production app, pass user's auth token via Authorization header.
 */
export async function getBodyWeightEntries(opts = {}) {
  return wgerGet('/weightentry/', {
    limit: opts.limit || 30,
    offset: opts.offset || 0,
  });
}

// ─── Constants / Presets ────────────────────────────────────────────────────

export const EXERCISE_CATEGORIES = [
  { id: 10, name: 'Abs' },
  { id: 8,  name: 'Arms' },
  { id: 12, name: 'Back' },
  { id: 11, name: 'Calves' },
  { id: 13, name: 'Chest' },
  { id: 14, name: 'Legs' },
  { id: 9,  name: 'Shoulders' },
];

export const EQUIPMENT_TYPES = [
  { id: 1,  name: 'Barbell' },
  { id: 3,  name: 'Dumbbell' },
  { id: 4,  name: 'Gym mat' },
  { id: 9,  name: 'Pull-up bar' },
  { id: 6,  name: 'Bench' },
  { id: 7,  name: 'Incline bench' },
  { id: 8,  name: 'Kettlebell' },
  { id: 10, name: 'Resistance band' },
  { id: 11, name: 'Cable machine' },
  { id: 99, name: 'Body weight' },
];
