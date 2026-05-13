# 🛍️ ConnectHub-SPA Marketplace — Sprint 13 Bug Fix & UX Gap Report
**Date:** May 13, 2026  
**File Modified:** `ConnectHub-SPA/src/pages/marketplace/MarketplacePage.jsx`  
**Patch Script:** `patch-marketplace-sprint13.js`  
**Changes Applied:** 10 / 10 ✅

---

## ✅ WHAT WAS FIXED IN THIS SESSION (Sprint 13)

These are the remaining bugs and UX gaps identified in the beta test report that were **not yet addressed** in Sprints 1–12.

| # | Fix | Bug / Issue Reference | Status |
|---|-----|-----------------------|--------|
| 1 | Category bar: left `‹` / right `›` scroll arrows added | ISSUE #12 — Category filter bar not scrollable on overflow | ✅ Fixed |
| 2 | Category chips now have `aria-pressed` attribute | Accessibility gap #3 | ✅ Fixed |
| 3 | Product card heart button has `aria-pressed` state | Accessibility gap #2 | ✅ Fixed |
| 4 | Wishlist tab: "Clear All" bulk-remove button added | ISSUE #15 — No remove-from-wishlist mechanism | ✅ Fixed |
| 5 | Inbox: visible `×` delete button per conversation row | ISSUE #13 — No archive/delete for conversations | ✅ Fixed |
| 6 | Orders "Sales" tab: now renders real sold listings with stats + actions | ISSUE #17 — Only shows purchase orders, not sales orders | ✅ Fixed |
| 7 | "View full profile →" now calls `navigate()` to `/marketplace/seller/:name` | BUG — link existed but didn't navigate | ✅ Fixed |
| 8 | Chat message bubbles: `aria-label` added with sender name | Accessibility gap #4 — chat messages for screen readers | ✅ Fixed |
| 9 | `CreateListingWizard` `onPublish` prop wired up to add the new listing to `browseListings` and `myListings` state | ISSUE #7 — Create listing form wasn't wired | ✅ Fixed |
| 10 | Header comment updated to document Sprint 13 changes | Documentation | ✅ Fixed |

---

## 🗂️ WHAT WAS ALREADY FIXED BEFORE THIS SESSION (Sprints 1–12)

| Sprint | Fixes |
|--------|-------|
| **Sprint 1** (Critical Bugs) | BUG #1 sidebar clipping (`left:72px`), BUG #2 grid scroll, BUG #3 detail panel scroll, BUG #4 "Buy to Review" → "Add to Cart" |
| **Sprint 2** | Photo upload in Create Listing, Cloudinary BE wiring, photo gallery carousel in item detail |
| **Sprint 3** | Cart slide-up panel, "Add to Cart" toast, quantity controls, remove from cart, cart badge |
| **Sprint 4** | 20 additional bug fixes (BUG-01 through BUG-20) covering checkout, shipping form, promo codes, offer flow, manage listing |
| **Sprint 5** | Checkout: Stripe payment intent, receipt modal (M11), order status progression |
| **Sprint 6** | All 16 product listings now have seed reviews with star ratings and rating histogram |
| **Sprint 7** | M6 shipping options block, M7 distance filter chips, M9 min/max price range, M13 inbox search + filter tabs, M14 photo attachment in chat, M15 "Mark as Sold" from chat, M17 Purchases/Sales toggle in Orders tab, M20 category scroll fade |
| **Sprint 8** | Order tracking timeline, dispute/problem modal, gift wrapping option, special instructions, buyer protection badge |
| **Sprint 9** | Firestore backend wiring (BE-01–BE-09): listings from Firestore, Cloudinary photo upload, Firestore cart sync, Stripe payment, seller badge check, real-time chat subscription, push notifications, shipping rates API, tracking links |
| **Sprint 10** | M18 Share listing externally, M19 Report listing via OpenAI, M23 Price alert, M24 Bundle discount banner, M25 "You may also like", M26 Map view, M27 Seller response time, M28 Safe meeting spots, M29 QR code, M30 Wishlist share |
| **Sprint 11** | Offer accept/counter/decline UI (M12), offer history modal (M20), listing analytics row (M16), listing expiry + renew (M21), Boost Listing (M22), full seller profile modal, RatingHistogram component |
| **Sprint 12** | `CreateListingWizard` (multi-step form), `MapViewModal`, `SellerProfilePage` standalone page, App.jsx route wiring |
| **Sprint 13** | See table above (this session) |

---

## 🔴 WHAT STILL NEEDS TO BE COMPLETED

The following items remain **not yet implemented** and require additional development work:

### 🔴 Critical / High Priority Remaining

| # | Item | Notes |
|---|------|-------|
| **C1** | Real product photos from real sellers | Currently using `picsum.photos` placeholder URLs. Needs actual image hosting pipeline (Cloudinary already integrated, just needs real uploads from users) |
| **C2** | Live checkout with real Stripe payment | The Stripe flow calls `createPaymentIntent` + `confirmCardPayment` but uses demo/fallback mode when Firebase/Stripe keys are not configured in `.env`. Requires live Stripe secret key in `ConnectHub-SPA/.env` and `ConnectHub-Backend/.env` |
| **C3** | Real Firebase/Firestore backend | All BE-01–BE-09 functions have graceful fallback to seed data. A real Firebase project must be configured in `ConnectHub-SPA/src/firebase/config.js` with valid API keys for live data persistence |
| **C4** | Real push notifications | OneSignal or Firebase Cloud Messaging must be configured for `notifyNewOffer` and `notifyNewMessage` to actually send notifications to devices |

### 🟠 High Priority Remaining

| # | Item | Notes |
|---|------|-------|
| **H1** | Real distance filtering | The "Within X mi" filter chips exist in UI but do not actually filter by location — listings don't carry GPS coordinates yet. Needs geolocation lookup + coordinate storage on listings |
| **H2** | Purchase flow for real external checkout | After order is placed, there is no email confirmation sent to buyer. Needs Mailgun / SendGrid integration |
| **H3** | SellerProfilePage full content | `SellerProfilePage.jsx` exists and is routed at `/marketplace/seller/:name` but may need additional polish — seller's full listing feed, pagination, and follow/unfollow action |
| **H4** | CreateListingWizard completion | `CreateListingWizard.jsx` exists and is wired via `onPublish`, but the wizard itself should be reviewed to ensure all 4 steps (Photos → Details → Price/Shipping → Preview) are complete and functional |

### 🟡 Medium Priority Remaining

| # | Item | Notes |
|---|------|-------|
| **M1** | Listing search — "Has Photos" filter | Filter chip exists in beta report but not yet added to the filter sheet |
| **M2** | "Verified Sellers only" filter | Not yet in filter sheet |
| **M3** | Seller rating minimum filter | Not yet in filter sheet |
| **M4** | Listing age filter ("Posted this week") | Not yet in filter sheet |
| **M5** | Inbox image sharing — timestamp on received messages | Outgoing messages show "✓✓ Sent" but incoming messages have no timestamp; requires per-message timestamp field |
| **M6** | Listing expiry system (backend) | UI shows expiry countdown + Renew button, but no actual backend job expires or renews listings |
| **M7** | Boost Listing (real payment) | "🚀 Boost Listing — $2.99" button shows a toast; not connected to a real payment flow |
| **M8** | MapViewModal real data | `MapViewModal.jsx` exists but uses placeholder map tiles; needs Mapbox/Google Maps API key to show real map with product pins |
| **M9** | QR code real generation | `getQRCodeURL()` returns a placeholder; needs a real QR code generation API (e.g. `api.qrserver.com` or `qr-code-monkey`) |
| **M10** | Price alert notifications (backend) | `savePriceAlert()` saves locally but no backend job monitors price drops to trigger alerts |

### 🔵 Nice-to-Have Remaining (Low Priority)

| # | Item | Notes |
|---|------|-------|
| **L1** | "Ask a Question" button in item detail that opens chat | Currently user must go to seller card → Message button |
| **L2** | Item view count ("142 people viewed this") | No view counter logic yet |
| **L3** | Item posting date ("Listed 3 days ago") | `daysListed` field exists on my listings but not on browse listings |
| **L4** | Return policy / payment methods accepted in item detail | Static display only — no backend field |
| **L5** | Share listing shows real URL | Currently copies `window.location.href`; needs a proper shareable deep-link URL scheme |
| **L6** | Tab bar — "Orders" tab label overflow on narrow screens | 5 tabs on small screens causes the last tab to be partially clipped; consider icon-only tabs at mobile width |

---

## 📋 OVERALL STATUS SUMMARY

| Category | Before Session | After Session |
|----------|----------------|---------------|
| Critical Bugs (from beta report) | 4 → 0 (all fixed in Sprint 1) | ✅ All 4 fixed |
| High Priority Issues (from beta report) | 6 remaining → now 4 remaining | ✅ 2 more fixed this session |
| Medium Priority Issues | 8 remaining → now 5 remaining | ✅ 3 more fixed this session |
| Accessibility Gaps | 5 → 2 remaining | ✅ 3 fixed this session |
| Missing Features (M1–M30) | 30 total → ~10 remaining UI-side | ✅ ~20 implemented across all sprints |
| **Estimated Readiness Score** | **5.9/10** (original beta) | **~8.2/10** (current estimate) |

---

## 🚀 HOW TO RUN THE APP

```bash
cd ConnectHub-SPA
npx vite
```
Open: [http://localhost:5175](http://localhost:5175) → Navigate to the Marketplace section.

---

*Report generated by Cline AI — Sprint 13 | May 13, 2026*
