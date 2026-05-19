/**
 * USDA FoodData Central API Service
 * Base URL: https://api.nal.usda.gov/fdc/v1/
 * API Key: FREE — get yours at https://api.data.gov/signup/
 * Add to .env: VITE_USDA_API_KEY=your_key_here
 * Rate Limit: 1,000 requests/hour (free tier)
 * Docs: https://app.swaggerhub.com/apis/fdcnal/food-data_central_api/1.0.1
 */

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

function getKey() {
  const key = import.meta.env?.VITE_USDA_API_KEY;
  if (!key) console.warn('[USDA] No API key — add VITE_USDA_API_KEY to .env');
  return key || 'DEMO_KEY'; // DEMO_KEY: 30 req/hour fallback
}

async function usdaGet(path, params = {}) {
  const url = new URL(`${USDA_BASE}${path}`);
  url.searchParams.set('api_key', getKey());
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`USDA API ${res.status}: ${err}`);
  }
  return res.json();
}

async function usdaPost(path, body = {}) {
  const url = new URL(`${USDA_BASE}${path}`);
  url.searchParams.set('api_key', getKey());
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`USDA API ${res.status}: ${res.statusText}`);
  return res.json();
}

// ─── Food Search ─────────────────────────────────────────────────────────────

/**
 * Search foods by keyword across all USDA databases.
 * @param {string} query - Search term e.g. "cheddar cheese"
 * @param {object} opts
 *   dataType: ['Foundation','SR Legacy','Survey (FNDDS)','Branded'] (array)
 *   pageSize: 1-200 (default 25)
 *   pageNumber: 1+
 *   sortBy: 'dataType.keyword'|'description'|'fdcId'|'publishedDate'
 *   sortOrder: 'asc'|'desc'
 *   brandOwner: string (for branded foods only)
 */
export async function searchFoods(query, opts = {}) {
  return usdaPost('/foods/search', {
    query,
    dataType: opts.dataType || ['Foundation', 'SR Legacy', 'Branded'],
    pageSize: opts.pageSize || 25,
    pageNumber: opts.pageNumber || 1,
    sortBy: opts.sortBy || 'dataType.keyword',
    sortOrder: opts.sortOrder || 'asc',
    brandOwner: opts.brandOwner,
  });
}

/**
 * Quick food search — lighter response, just essential fields.
 * @param {string} query
 * @param {number} limit
 */
export async function quickSearchFoods(query, limit = 10) {
  return usdaGet('/foods/search', {
    query,
    pageSize: limit,
    dataType: 'Foundation,SR Legacy',
  });
}

// ─── Food Details ────────────────────────────────────────────────────────────

/**
 * Get full nutrient data for a single food by FDC ID.
 * @param {number|string} fdcId - FoodData Central ID
 * @param {string} format - 'abridged'|'full' (default 'abridged')
 * @param {number[]} nutrients - Optional array of nutrient IDs to filter
 */
export async function getFoodDetails(fdcId, format = 'abridged', nutrients = []) {
  const params = { format };
  if (nutrients.length) params.nutrients = nutrients.join(',');
  return usdaGet(`/food/${fdcId}`, params);
}

/**
 * Get details for multiple foods at once (up to 20 FDC IDs).
 * @param {number[]} fdcIds - Array of FDC IDs
 * @param {string} format - 'abridged'|'full'
 */
export async function getMultipleFoods(fdcIds, format = 'abridged') {
  return usdaPost('/foods', { fdcIds, format });
}

// ─── Nutrient Lookup ─────────────────────────────────────────────────────────

/**
 * Get all available nutrients in the USDA database.
 */
export async function getNutrients() {
  return usdaGet('/nutrients');
}

// ─── Branded Foods ───────────────────────────────────────────────────────────

/**
 * Search branded food products (packaged foods with UPC/barcodes).
 * @param {string} query
 * @param {string} brandOwner - Filter by brand e.g. "Kraft"
 */
export async function searchBrandedFoods(query, brandOwner = '') {
  return usdaPost('/foods/search', {
    query,
    dataType: ['Branded'],
    brandOwner: brandOwner || undefined,
    pageSize: 25,
  });
}

// ─── Helpers / Calculators ───────────────────────────────────────────────────

/**
 * Common nutrient IDs for filtering.
 */
export const NUTRIENT_IDS = {
  ENERGY_KCAL:   1008,
  PROTEIN:       1003,
  FAT_TOTAL:     1004,
  CARBOHYDRATE:  1005,
  FIBER:         1079,
  SUGARS:        2000,
  CALCIUM:       1087,
  IRON:          1089,
  SODIUM:        1093,
  VITAMIN_C:     1162,
  VITAMIN_D:     1114,
  POTASSIUM:     1092,
  CHOLESTEROL:   1253,
  SATURATED_FAT: 1258,
};

/**
 * Extract a specific nutrient value from a food's nutrient array.
 * @param {object} food - Food object returned by getFoodDetails
 * @param {number} nutrientId - From NUTRIENT_IDS
 * @returns {{ value: number, unit: string } | null}
 */
export function extractNutrient(food, nutrientId) {
  const nutrients = food?.foodNutrients || food?.nutrients || [];
  const match = nutrients.find(
    n => (n.nutrientId || n.nutrient?.id) === nutrientId
  );
  if (!match) return null;
  return {
    value: match.value ?? match.amount ?? 0,
    unit: match.unitName || match.nutrient?.unitName || '',
  };
}

/**
 * Build a simple nutrition summary from a food object.
 * @param {object} food
 * @returns {object} - { calories, protein, fat, carbs, fiber, sodium }
 */
export function buildNutritionSummary(food) {
  const get = (id) => extractNutrient(food, id)?.value ?? 0;
  return {
    name: food.description || food.lowercaseDescription || 'Unknown',
    fdcId: food.fdcId,
    calories:  get(NUTRIENT_IDS.ENERGY_KCAL),
    protein:   get(NUTRIENT_IDS.PROTEIN),
    fat:       get(NUTRIENT_IDS.FAT_TOTAL),
    carbs:     get(NUTRIENT_IDS.CARBOHYDRATE),
    fiber:     get(NUTRIENT_IDS.FIBER),
    sugars:    get(NUTRIENT_IDS.SUGARS),
    sodium:    get(NUTRIENT_IDS.SODIUM),
    vitaminC:  get(NUTRIENT_IDS.VITAMIN_C),
    calcium:   get(NUTRIENT_IDS.CALCIUM),
  };
}

/**
 * Calculate daily value percentages based on 2,000-calorie diet.
 * @param {object} summary - from buildNutritionSummary
 * @returns {object} - Each key is a percentage (0-100+)
 */
export function calcDailyValues(summary) {
  return {
    calories:  Math.round((summary.calories / 2000) * 100),
    fat:       Math.round((summary.fat       / 78)   * 100),
    carbs:     Math.round((summary.carbs     / 275)  * 100),
    fiber:     Math.round((summary.fiber     / 28)   * 100),
    protein:   Math.round((summary.protein   / 50)   * 100),
    sodium:    Math.round((summary.sodium    / 2300) * 100),
    vitaminC:  Math.round((summary.vitaminC  / 90)   * 100),
    calcium:   Math.round((summary.calcium   / 1300) * 100),
  };
}

// ─── Common Foods Reference ──────────────────────────────────────────────────

export const POPULAR_FOODS = [
  { name: 'Apple, raw',          fdcId: 1750340 },
  { name: 'Banana, raw',         fdcId: 1105073 },
  { name: 'Chicken breast, raw', fdcId: 331960  },
  { name: 'Brown rice, cooked',  fdcId: 168876  },
  { name: 'Whole milk',          fdcId: 746782  },
  { name: 'Egg, whole, raw',     fdcId: 748967  },
  { name: 'Broccoli, raw',       fdcId: 170379  },
  { name: 'Salmon, Atlantic',    fdcId: 175167  },
  { name: 'Almonds',             fdcId: 170567  },
  { name: 'Oatmeal, plain',      fdcId: 173903  },
];
