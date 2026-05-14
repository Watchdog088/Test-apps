/**
 * marketplace-analytics.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight analytics layer for the ConnectHub-SPA Marketplace.
 *
 * Responsibilities
 *  1. A/B test — "Bundle & Save" placement (SIDEBAR_BUTTON vs BOTTOM_SHEET)
 *  2. BundleDiscountModal lifecycle events (open / complete / dismiss)
 *  3. SimilarItemsRow click-through rate (CTR) tracking
 *
 * All events are emitted through three channels in priority order:
 *   a) window.gtag (Google Analytics 4 / GA4) if present
 *   b) window.analytics (Segment) if present
 *   c) localStorage event log (always — useful for debugging / offline)
 *
 * Usage
 *   import { trackBundleModalOpen, trackBundleModalComplete,
 *            trackBundleModalDismiss, trackSimilarItemClick,
 *            getBundlePlacementVariant } from '../services/marketplace-analytics';
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/**
 * Internal event dispatcher — sends to every available analytics sink.
 * @param {string} eventName   Snake-case event identifier, e.g. "bundle_modal_open"
 * @param {Object} params      Key/value dimensions & metrics
 */
function _dispatch(eventName, params = {}) {
  const payload = {
    ...params,
    timestamp: new Date().toISOString(),
    source: 'marketplace',
  };

  // 1 ── Google Analytics 4
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, payload);
    } catch (_) { /* silent */ }
  }

  // 2 ── Segment
  if (typeof window !== 'undefined' && window.analytics && typeof window.analytics.track === 'function') {
    try {
      // Segment prefers Title Case event names — convert automatically
      const segmentName = eventName
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      window.analytics.track(segmentName, payload);
    } catch (_) { /* silent */ }
  }

  // 3 ── localStorage debug log (capped at 500 entries)
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const KEY = 'ch_marketplace_events';
      const raw = localStorage.getItem(KEY);
      const log = raw ? JSON.parse(raw) : [];
      log.push({ event: eventName, ...payload });
      if (log.length > 500) log.splice(0, log.length - 500);
      localStorage.setItem(KEY, JSON.stringify(log));
    }
  } catch (_) { /* storage full / private mode — ignore */ }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* A/B TEST — Bundle & Save Placement                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Variant identifiers used across the A/B test.
 *   BOTTOM_SHEET — current implementation: a "Bundle & Save" bottom-sheet
 *                  that opens when the buyer taps a button in the product detail.
 *   SIDEBAR_BUTTON — alternative: a persistent "Bundle & Save 🎁" sticky
 *                    button pinned to the right side of the product detail panel.
 */
export const BUNDLE_AB_VARIANTS = {
  BOTTOM_SHEET: 'bottom_sheet',
  SIDEBAR_BUTTON: 'sidebar_button',
};

/**
 * Retrieve (or deterministically assign) this user's A/B variant.
 *
 * Assignment strategy:
 *  - If a variant is already stored in localStorage, return it (sticky assignment).
 *  - Otherwise, assign based on a simple hash of the stored userId or a random ID.
 *    ~50 / 50 split between the two variants.
 *
 * @returns {'bottom_sheet'|'sidebar_button'}
 */
export function getBundlePlacementVariant() {
  const STORAGE_KEY = 'ch_bundle_ab_variant';

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && Object.values(BUNDLE_AB_VARIANTS).includes(stored)) {
      return stored;
    }
  } catch (_) { /* storage unavailable */ }

  // Assign a new variant
  let seed;
  try {
    // Try to use the stored user-id for determinism across sessions/devices
    seed = localStorage.getItem('ch_user_id') || String(Math.random());
  } catch (_) {
    seed = String(Math.random());
  }

  // Simple string hash → even/odd → variant
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const variant = hash % 2 === 0
    ? BUNDLE_AB_VARIANTS.BOTTOM_SHEET
    : BUNDLE_AB_VARIANTS.SIDEBAR_BUTTON;

  try {
    localStorage.setItem(STORAGE_KEY, variant);
  } catch (_) { /* ignore */ }

  // Log the assignment once
  _dispatch('bundle_ab_assigned', { variant });

  return variant;
}

/**
 * Override the A/B variant (useful for QA / manual testing).
 * Call from the browser console:  window.__setBundleVariant('sidebar_button')
 * @param {'bottom_sheet'|'sidebar_button'} variant
 */
export function overrideBundlePlacementVariant(variant) {
  if (!Object.values(BUNDLE_AB_VARIANTS).includes(variant)) {
    console.warn('[marketplace-analytics] Unknown bundle variant:', variant);
    return;
  }
  try {
    localStorage.setItem('ch_bundle_ab_variant', variant);
    console.info('[marketplace-analytics] Bundle variant overridden to:', variant);
  } catch (_) { /* ignore */ }
}

// Expose override helper globally for QA
if (typeof window !== 'undefined') {
  window.__setBundleVariant = overrideBundlePlacementVariant;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* BUNDLE DISCOUNT MODAL — Lifecycle Events                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Fire when BundleDiscountModal mounts / becomes visible.
 *
 * @param {Object} params
 * @param {string}  params.sellerId          Seller's user ID
 * @param {string}  params.sellerName        Seller's display name
 * @param {string}  params.currentItemId     The listing the buyer is currently viewing
 * @param {number}  params.eligibleItemCount How many other items the seller has available
 * @param {string}  [params.triggerType]     'bottom_sheet' | 'sidebar_button' — A/B variant
 */
export function trackBundleModalOpen({
  sellerId,
  sellerName,
  currentItemId,
  eligibleItemCount,
  triggerType,
} = {}) {
  _dispatch('bundle_modal_open', {
    seller_id: sellerId,
    seller_name: sellerName,
    current_item_id: currentItemId,
    eligible_item_count: eligibleItemCount,
    trigger_type: triggerType || getBundlePlacementVariant(),
  });
}

/**
 * Fire when the buyer taps "Add X items to Cart (Y% off!)" and the bundle
 * is successfully added to the cart.
 *
 * @param {Object} params
 * @param {string}   params.sellerId       Seller's user ID
 * @param {string[]} params.itemIds        Array of listing IDs added to bundle
 * @param {number}   params.discountPct    Discount tier applied (10 / 15 / 20)
 * @param {number}   params.subtotal       Pre-discount subtotal in USD
 * @param {number}   params.savings        Dollar amount saved
 * @param {number}   params.finalTotal     After-discount total in USD
 * @param {string}   [params.triggerType]  A/B variant
 */
export function trackBundleModalComplete({
  sellerId,
  itemIds = [],
  discountPct,
  subtotal,
  savings,
  finalTotal,
  triggerType,
} = {}) {
  _dispatch('bundle_modal_complete', {
    seller_id: sellerId,
    item_ids: itemIds.join(','),
    item_count: itemIds.length,
    discount_pct: discountPct,
    subtotal_usd: subtotal,
    savings_usd: savings,
    final_total_usd: finalTotal,
    trigger_type: triggerType || getBundlePlacementVariant(),
  });
}

/**
 * Fire when the buyer closes the BundleDiscountModal without adding to cart.
 *
 * @param {Object} params
 * @param {string}  params.sellerId        Seller's user ID
 * @param {string}  params.currentItemId   Listing the buyer was viewing
 * @param {number}  params.timeOpenMs      Milliseconds the modal was open
 * @param {number}  [params.itemsSelected] Items the buyer had selected before dismissing
 * @param {string}  [params.dismissMethod] 'x_button' | 'backdrop_tap' | 'swipe_down'
 * @param {string}  [params.triggerType]   A/B variant
 */
export function trackBundleModalDismiss({
  sellerId,
  currentItemId,
  timeOpenMs,
  itemsSelected = 0,
  dismissMethod = 'unknown',
  triggerType,
} = {}) {
  _dispatch('bundle_modal_dismiss', {
    seller_id: sellerId,
    current_item_id: currentItemId,
    time_open_ms: timeOpenMs,
    items_selected_before_dismiss: itemsSelected,
    dismiss_method: dismissMethod,
    trigger_type: triggerType || getBundlePlacementVariant(),
  });
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* SIMILAR ITEMS ROW — Click-Through Rate Tracking                             */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Fire when the SimilarItemsRow is rendered and at least one card is visible.
 * Call this in a useEffect / on mount of the SimilarItemsRow component.
 *
 * @param {Object} params
 * @param {string}  params.sourceItemId    The listing currently being viewed
 * @param {number}  params.recommendCount  How many similar items were displayed
 * @param {string}  params.algorithm       Algorithm variant used (e.g. "relevance_v1")
 */
export function trackSimilarItemsImpression({
  sourceItemId,
  recommendCount,
  algorithm = 'relevance_v1',
} = {}) {
  _dispatch('similar_items_impression', {
    source_item_id: sourceItemId,
    recommend_count: recommendCount,
    algorithm,
  });
}

/**
 * Fire when a buyer taps on any card in the SimilarItemsRow.
 *
 * @param {Object} params
 * @param {string}  params.sourceItemId     Listing that was open when the row appeared
 * @param {string}  params.clickedItemId    Listing the buyer tapped
 * @param {string}  params.clickedItemTitle Title of the tapped listing
 * @param {number}  params.clickedItemPrice Price of the tapped listing
 * @param {number}  params.position         0-based index in the row (leftmost = 0)
 * @param {number}  params.relevanceScore   Score used to rank this recommendation
 * @param {string}  params.algorithm        Algorithm variant used
 */
export function trackSimilarItemClick({
  sourceItemId,
  clickedItemId,
  clickedItemTitle,
  clickedItemPrice,
  position,
  relevanceScore,
  algorithm = 'relevance_v1',
} = {}) {
  _dispatch('similar_item_click', {
    source_item_id: sourceItemId,
    clicked_item_id: clickedItemId,
    clicked_item_title: clickedItemTitle,
    clicked_item_price_usd: clickedItemPrice,
    position,
    relevance_score: relevanceScore,
    algorithm,
    // Convenience CTR helper for dashboards
    ctr_event: true,
  });
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* DEBUG HELPERS                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Return the last N events from the localStorage debug log.
 * Useful in the browser console: window.__marketplaceEvents(20)
 * @param {number} [n=50]
 * @returns {Array}
 */
export function getEventLog(n = 50) {
  try {
    const raw = localStorage.getItem('ch_marketplace_events');
    if (!raw) return [];
    const log = JSON.parse(raw);
    return log.slice(-n);
  } catch (_) {
    return [];
  }
}

/**
 * Clear the localStorage debug log.
 * window.__clearMarketplaceEvents()
 */
export function clearEventLog() {
  try {
    localStorage.removeItem('ch_marketplace_events');
    console.info('[marketplace-analytics] Event log cleared.');
  } catch (_) { /* ignore */ }
}

// Expose debug helpers globally
if (typeof window !== 'undefined') {
  window.__marketplaceEvents = getEventLog;
  window.__clearMarketplaceEvents = clearEventLog;
}
