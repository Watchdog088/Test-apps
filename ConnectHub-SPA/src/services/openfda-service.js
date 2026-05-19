/**
 * OpenFDA API Service
 * Base URL: https://api.fda.gov/
 * API Key: NOT required for up to 1,000 requests/day (40/min)
 *          Optional: get a free key at https://open.fda.gov/apis/authentication/
 *          Add to .env: VITE_OPENFDA_API_KEY=your_key_here (raises limit to 120,000/day)
 * Docs: https://open.fda.gov/apis/
 *
 * Databases covered:
 *   - Drug adverse events (FAERS)
 *   - Drug labels / package inserts
 *   - Drug enforcement (recalls)
 *   - Food enforcement (recalls)
 *   - Device adverse events
 *   - Dietary supplement labels
 */

const FDA_BASE = 'https://api.fda.gov';

function getKey() {
  return import.meta.env?.VITE_OPENFDA_API_KEY || null;
}

async function fdaGet(endpoint, params = {}) {
  const url = new URL(`${FDA_BASE}${endpoint}`);
  const key = getKey();
  if (key) url.searchParams.set('api_key', key);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString());
  if (res.status === 404) return { results: [], meta: { results: { total: 0 } } };
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`OpenFDA ${res.status}: ${body?.error?.message || res.statusText}`);
  }
  return res.json();
}

// ─── Drug Labels (Package Inserts) ─────────────────────────────────────────

/**
 * Search FDA drug labels (package inserts / prescribing information).
 * @param {string} query - Drug name, active ingredient, or NDC code
 * @param {object} opts - { limit, skip, field: 'brand_name'|'generic_name'|'active_ingredient' }
 */
export async function searchDrugLabels(query, opts = {}) {
  const field = opts.field || 'openfda.brand_name';
  return fdaGet('/drug/label.json', {
    search: `${field}:"${query}"`,
    limit: opts.limit || 10,
    skip: opts.skip || 0,
  });
}

/**
 * Get drug label by brand name.
 * @param {string} brandName - e.g. "Tylenol", "Advil"
 */
export async function getDrugByBrandName(brandName) {
  return fdaGet('/drug/label.json', {
    search: `openfda.brand_name:"${brandName}"`,
    limit: 5,
  });
}

/**
 * Get drug label by active ingredient.
 * @param {string} ingredient - e.g. "acetaminophen", "ibuprofen"
 */
export async function getDrugByIngredient(ingredient) {
  return fdaGet('/drug/label.json', {
    search: `openfda.substance_name:"${ingredient}"`,
    limit: 10,
  });
}

// ─── Drug Adverse Events (FAERS) ─────────────────────────────────────────────

/**
 * Search drug adverse event reports.
 * @param {string} drugName - Drug name to search
 * @param {object} opts - { limit, skip, serious: '1'|'2' }
 *   serious: 1 = serious event, 2 = not serious
 */
export async function searchDrugAdverseEvents(drugName, opts = {}) {
  let search = `patient.drug.medicinalproduct:"${drugName}"`;
  if (opts.serious) search += `+AND+serious:${opts.serious}`;
  return fdaGet('/drug/event.json', {
    search,
    limit: opts.limit || 10,
    skip: opts.skip || 0,
  });
}

/**
 * Count adverse reactions for a drug (top reactions).
 * @param {string} drugName
 * @param {number} limit - Number of top reactions to return
 */
export async function getTopAdverseReactions(drugName, limit = 10) {
  return fdaGet('/drug/event.json', {
    search: `patient.drug.medicinalproduct:"${drugName}"`,
    count: 'patient.reaction.reactionmeddrapt.exact',
    limit,
  });
}

// ─── Drug Enforcement / Recalls ──────────────────────────────────────────────

/**
 * Search drug recalls and enforcement actions.
 * @param {object} opts - { status: 'Ongoing'|'Completed'|'Terminated', limit, classification: 'Class I'|'Class II'|'Class III' }
 */
export async function searchDrugRecalls(opts = {}) {
  const parts = [];
  if (opts.status) parts.push(`status:"${opts.status}"`);
  if (opts.classification) parts.push(`classification:"${opts.classification}"`);
  const search = parts.join('+AND+') || undefined;
  return fdaGet('/drug/enforcement.json', {
    search,
    limit: opts.limit || 10,
    skip: opts.skip || 0,
  });
}

/**
 * Search drug recalls by product description keyword.
 * @param {string} keyword - e.g. "acetaminophen", "blood pressure"
 */
export async function searchDrugRecallsByKeyword(keyword) {
  return fdaGet('/drug/enforcement.json', {
    search: `product_description:"${keyword}"`,
    limit: 10,
  });
}

// ─── Food Enforcement / Recalls ───────────────────────────────────────────────

/**
 * Search food recalls and enforcement actions.
 * @param {object} opts - { status, classification, limit, reason }
 */
export async function searchFoodRecalls(opts = {}) {
  const parts = [];
  if (opts.status) parts.push(`status:"${opts.status}"`);
  if (opts.classification) parts.push(`classification:"${opts.classification}"`);
  if (opts.reason) parts.push(`reason_for_recall:"${opts.reason}"`);
  const search = parts.join('+AND+') || undefined;
  return fdaGet('/food/enforcement.json', {
    search,
    limit: opts.limit || 10,
    skip: opts.skip || 0,
  });
}

/**
 * Get recent food recalls (last N recalled items).
 * @param {number} limit
 */
export async function getRecentFoodRecalls(limit = 10) {
  return fdaGet('/food/enforcement.json', {
    limit,
    sort: 'recall_initiation_date:desc',
  });
}

/**
 * Search food recalls by product description.
 * @param {string} product - e.g. "peanut butter", "salmonella"
 */
export async function searchFoodRecallsByProduct(product) {
  return fdaGet('/food/enforcement.json', {
    search: `product_description:"${product}"`,
    limit: 10,
  });
}

// ─── Device Adverse Events ────────────────────────────────────────────────────

/**
 * Search medical device adverse events.
 * @param {string} deviceName - e.g. "insulin pump", "pacemaker"
 * @param {object} opts - { limit }
 */
export async function searchDeviceEvents(deviceName, opts = {}) {
  return fdaGet('/device/event.json', {
    search: `device.generic_name:"${deviceName}"`,
    limit: opts.limit || 10,
  });
}

// ─── Dietary Supplements ──────────────────────────────────────────────────────

/**
 * Search dietary supplement adverse event reports (CFSAN AERS).
 * @param {string} productName
 * @param {object} opts - { limit }
 */
export async function searchSupplementEvents(productName, opts = {}) {
  return fdaGet('/food/event.json', {
    search: `products.name_brand:"${productName}"`,
    limit: opts.limit || 10,
  });
}

// ─── Count / Analytics ────────────────────────────────────────────────────────

/**
 * Count drug recalls by classification.
 */
export async function countDrugRecallsByClass() {
  return fdaGet('/drug/enforcement.json', {
    count: 'classification.exact',
  });
}

/**
 * Count food recalls by reason category.
 */
export async function countFoodRecallsByReason() {
  return fdaGet('/food/enforcement.json', {
    count: 'voluntary_mandated.exact',
    limit: 20,
  });
}

/**
 * Get count of adverse events by drug route of administration.
 * @param {string} drugName
 */
export async function countEventsByRoute(drugName) {
  return fdaGet('/drug/event.json', {
    search: `patient.drug.medicinalproduct:"${drugName}"`,
    count: 'patient.drug.drugadministrationroute.exact',
    limit: 10,
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract clean drug information from a label result.
 * @param {object} label - Single result from searchDrugLabels
 */
export function extractDrugInfo(label) {
  const openfda = label?.openfda || {};
  return {
    brandName:      openfda.brand_name?.[0] || 'Unknown',
    genericName:    openfda.generic_name?.[0] || '',
    manufacturer:   openfda.manufacturer_name?.[0] || '',
    substance:      openfda.substance_name?.[0] || '',
    routeOfAdmin:   openfda.route?.[0] || '',
    dosageForm:     openfda.dosage_form?.[0] || '',
    indications:    label?.indications_and_usage?.[0]?.slice(0, 400) || '',
    warnings:       label?.warnings?.[0]?.slice(0, 400) || '',
    dosage:         label?.dosage_and_administration?.[0]?.slice(0, 400) || '',
    contraindications: label?.contraindications?.[0]?.slice(0, 400) || '',
  };
}

/**
 * Extract clean recall information.
 * @param {object} recall - Single result from searchDrugRecalls / searchFoodRecalls
 */
export function extractRecallInfo(recall) {
  return {
    id:              recall.recall_number || recall.event_id || '',
    product:         recall.product_description || '',
    reason:          recall.reason_for_recall || '',
    classification:  recall.classification || '',
    status:          recall.status || '',
    company:         recall.recalling_firm || recall.firm_fei_number || '',
    date:            recall.recall_initiation_date || '',
    quantity:        recall.product_quantity || '',
    distribution:    recall.distribution_pattern || '',
    state:           recall.state || '',
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const RECALL_CLASSIFICATIONS = {
  CLASS_I:   'Class I',   // Most serious: reasonable probability of serious harm
  CLASS_II:  'Class II',  // May cause temporary adverse health consequences
  CLASS_III: 'Class III', // Unlikely to cause harm but violates regulations
};

export const RECALL_STATUSES = {
  ONGOING:    'Ongoing',
  COMPLETED:  'Completed',
  TERMINATED: 'Terminated',
};
