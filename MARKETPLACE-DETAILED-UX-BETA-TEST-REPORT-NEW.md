# ConnectHub-SPA — Marketplace: Full UI/UX Beta Test Report
**Tester role:** Independent UX/UI Beta Reviewer  
**File audited:** `ConnectHub-SPA/src/pages/marketplace/MarketplacePage.jsx` (1,667 lines)  
**Date:** May 12, 2026  
**Method:** Complete source-code audit of every component, state variable, handler, and render path

---

## OVERALL SCORE SUMMARY

| Category | Score | Status |
|---|---|---|
| Visual Design & Layout | 88/100 | ✅ Good |
| Navigation & Tab Structure | 82/100 | ⚠️ Issues found |
| Browse & Discovery | 90/100 | ✅ Good |
| Item Detail & Product Page | 85/100 | ⚠️ Issues found |
| Cart & Checkout Flow | 75/100 | 🔴 Bugs present |
| Seller Tools (Sell Tab) | 70/100 | 🔴 Issues found |
| Messaging & Chat | 80/100 | ⚠️ Issues found |
| Notifications | 82/100 | ⚠️ Issues found |
| Wishlist | 72/100 | ⚠️ Issues found |
| Trust & Safety | 78/100 | ⚠️ Issues found |
| Accessibility | 72/100 | ⚠️ Issues found |
| Data / Backend Readiness | 28/100 | 🔴 Mock only |
| **OVERALL** | **79/100** | ⚠️ Beta-worthy with known gaps |

---

## SECTION 1: WHAT WORKS ✅

### 1.1 Browse Tab
- ✅ **900ms loading skeleton** appears on first render (4 skeleton cards) — good loading UX
- ✅ **12 category chips** (Electronics, Music, Fitness, Art, Gaming, etc.) with active highlight, reset visible count on change
- ✅ **Sort dropdown** (Newest, Price Low→High, Price High→Low, Most Popular) — works correctly
- ✅ **Filter sheet** with condition picker, max price input, preset price buttons ($50/$100/$200/$500), Clear All, Apply
- ✅ **Active filter indicator** — filter button turns indigo, badge number shows how many filters are active, inline chips appear below filter bar
- ✅ **Search** — full text search across title, seller name, and tags with live filtering
- ✅ **Search clear button** (✕) appears when search is non-empty
- ✅ **Recent searches** — last 5 saved to localStorage, shown as chips, clear button, 700ms debounce save
- ✅ **No-results empty state** with 🔍 icon and helpful text
- ✅ **Item count** ("X items") shown beside section heading
- ✅ **Load More** — shows 8 items, button displays remaining count, resets on category change
- ✅ **2-column card grid** — condition badge (bottom-left), verified badge (top-left), wishlist heart (top-right)
- ✅ **Star rating on cards** for items with reviews — rounds correctly to nearest star
- ✅ **Quick "Add to Cart" button** directly on card — no need to open detail modal
- ✅ **Sold items excluded** from browse results

### 1.2 Item Detail Modal
- ✅ Full-screen bottom sheet with large emoji hero
- ✅ Title, price, star rating (if reviews exist), condition/location/category chips
- ✅ 🔥 Popular badge for items with >30 likes
- ✅ Full description
- ✅ **Share / Review / Report** action row (3 buttons)
- ✅ **Seller info card** — avatar, name, verified badge, "View seller profile →" prompt, Message button (opens thread without orphan)
- ✅ **Wishlist + Add to Cart** row — wishlist heart changes color when saved
- ✅ **Collapsible reviews section** with ▼/▲ toggle, shows reviewer name, rating stars, text, time

### 1.3 Cart Modal
- ✅ Cart badge shows item count on top bar icon
- ✅ Quantity − / + controls work correctly
- ✅ Remove (×) button per item
- ✅ Subtotal updates live
- ✅ Empty state with helpful message
- ✅ Cart persists via localStorage across page refreshes

### 1.4 Checkout Flow
- ✅ **2-step flow** clearly labeled ("Step 1 of 2 — Shipping Address" / "Step 2 of 2 — Payment")
- ✅ **Local Pickup option** in shipping step
- ✅ **Promo code** field (WELCOME10=10% off, SAVE5=$5 flat), strikethrough original price, success/error message, clear promo button
- ✅ **Buyer Protection badge** — explains 7-day refund policy
- ✅ **4 payment methods** — Credit/Debit Card, PayPal, Crypto, Cash on Pickup
- ✅ Card fields (name, number, MM/YY, CVV) shown only when card is selected
- ✅ Back button goes to shipping step
- ✅ Order placed → success toast + order added to history
- ✅ Cart clears after order placed
- ✅ Promo code resets after order

### 1.5 Sell Tab
- ✅ 4 stat cards (Revenue, Active listings, Rating, Orders count)
- ✅ Orders card is clickable → navigates to Order History
- ✅ "View My Order History" button appears when orders exist
- ✅ "Create New Listing" prominent dashed border button
- ✅ My Listings 2-column grid — sold items have SOLD overlay at 0.6 opacity
- ✅ "✏️ Edit" badge on active listings
- ✅ Click any listing → Manage modal

### 1.6 Create Listing Modal
- ✅ Photo upload with animated progress bar (150ms ticks, realistic feel)
- ✅ Photo preview after upload
- ✅ Title, price, location, category dropdown, condition dropdown, description, tags fields
- ✅ Published listing appears immediately in both Browse and My Listings
- ✅ Toast: "🚀 Listing published!"

### 1.7 Manage Listing Modal
- ✅ Shows item stats (views, likes)
- ✅ Edit title, price, description
- ✅ Save Changes, Mark as Sold, Delete Listing
- ✅ Changes sync to both myListings and browseListings state
- ✅ Sold listings show "Mark as Sold" only when not yet sold

### 1.8 Order History
- ✅ Shows order ID, items with quantities and prices, total, shipping destination, tracking code
- ✅ Order status badge (green "Confirmed")
- ✅ Cancel Order → confirm dialog before deletion
- ✅ Leave Review button → opens Write Review modal
- ✅ Back button returns to Sell tab

### 1.9 Wishlist Tab
- ✅ Saved items shown in 2-column grid
- ✅ Remove heart button works
- ✅ Add to Cart button on each card
- ✅ Empty state with helpful instruction

### 1.10 Messages / Inbox Tab
- ✅ Chat list with avatar, name, item context, last message, timestamp, unread badge
- ✅ Opening a chat marks it as read (unread count clears)
- ✅ Message thread with sender/receiver bubble styles
- ✅ Enter key sends message
- ✅ Auto-scroll to bottom on new message
- ✅ ✓✓ Sent read receipts on outgoing messages
- ✅ 💰 Offer button in chat header opens Make Offer modal
- ✅ Opening from item detail creates thread without duplicates

### 1.11 Notifications Panel
- ✅ Unread count badge on bell icon
- ✅ Opening panel marks all as read
- ✅ Unread dot indicator per notification
- ✅ Mark All Read button
- ✅ **Actionable offer buttons** — Accept (with toast), Counter (see bug below), Decline (with toast)
- ✅ **Track Order button** on shipment notifications — navigates to Order History

### 1.12 Report Listing Modal
- ✅ 6 reason options with radio-style picker
- ✅ Submit Report → success state with "Our team will review within 24 hours" message
- ✅ Auto-closes after 2 seconds

### 1.13 Write Review Modal
- ✅ Animated star picker — selected stars scale up (transform: scale(1.15))
- ✅ Review text area
- ✅ Submit → review appears immediately in item detail (session-persistent localReviews state)
- ✅ Success state with "Thank you for your feedback" message
- ✅ Also accessible from Order History

### 1.14 Seller Profile Modal
- ✅ Gradient header banner, avatar, name, Verified Seller badge
- ✅ Rating, total sales, member since date, bio
- ✅ Up to 4 active listings in mini 2-column grid
- ✅ Clicking a listing closes seller modal and opens item detail

### 1.15 Accessibility & Polish
- ✅ Escape key closes all modals in correct priority order
- ✅ `role="main"`, `role="dialog"`, `role="tablist"`, `role="tab"`, `role="log"` (chat), `role="radiogroup"`, `role="radio"` on interactive elements
- ✅ `aria-label` on all icon buttons, inputs, and interactive divs
- ✅ `aria-selected` on tabs, `aria-expanded` on reviews toggle, `aria-checked` on radio-style inputs
- ✅ `aria-live="polite"` on toast, `role="alert"` on order success toast
- ✅ `tabIndex={0}` + `onKeyDown` Enter handler on card divs
- ✅ `aria-required="true"` on required checkout fields
- ✅ Keyboard-accessible seller info section (`tabIndex={0}`, `onKeyDown`)
- ✅ FAB hidden on Sell tab (prevents duplicate create buttons)
- ✅ Toast z-index (200) above FAB (50) above modals (100) — correct layering
- ✅ Unified toast — all actions use same toast system

---

## SECTION 2: BUGS & BROKEN FEATURES 🔴

### BUG-01: Counter Offer button is completely dead
**Location:** Lines 599–601, Notifications panel  
**What happens:** The "Counter" button in the offer notification row has **no `onClick` handler**. Pressing it does absolutely nothing.  
**Impact:** HIGH — This creates a confusing "broken button" experience. Users will tap it multiple times thinking it's frozen.  
**Fix:** Add a counter-offer flow — either open a price input field inline, or open the chat thread for that item with a pre-filled counter offer.

```jsx
// Current (broken):
<button style={{...}}>Counter</button>

// Should be:
<button onClick={() => { setNotiOpen(false); showToast('💬 Open the chat to send a counter offer'); }}
  style={{...}}>Counter</button>
```

---

### BUG-02: Checkout "Continue to Payment" gives no feedback when fields are empty
**Location:** Line 1280  
**What happens:** `onClick={()=>{if(shipping.name&&shipping.city)setCheckoutStep('payment');}}` — if name or city is empty, the button click is silently ignored. No validation error, no field highlighting, nothing.  
**Impact:** HIGH — Users will repeatedly tap "Continue to Payment" and think the app is broken.  
**Fix:** Show inline validation errors when required fields are empty.

```jsx
const [shippingErrors, setShippingErrors] = useState({});
function continueToPayment() {
  const errs = {};
  if (!shipping.name) errs.name = 'Name is required';
  if (!shipping.city) errs.city = 'City is required';
  if (Object.keys(errs).length) { setShippingErrors(errs); return; }
  setCheckoutStep('payment');
}
```

---

### BUG-03: Card number, expiry, and CVV inputs are uncontrolled (never saved to state)
**Location:** Lines 1345–1348  
**What happens:** The card number, MM/YY, and CVV fields are bare `<input>` elements with no `value` or `onChange`. Their values are never captured. The "Place Order" button fires regardless of whether card details are filled.  
**Impact:** HIGH — A user can place an order with a blank card number. Also, if the user goes "Back" to shipping and returns to payment, all card fields are blank again.  
**Fix:** Add controlled state for card fields and validate before placing order.

```jsx
const [cardNumber, setCardNumber] = useState('');
const [cardExpiry, setCardExpiry] = useState('');
const [cardCVV, setCardCVV]     = useState('');

// In placeOrder():
if (payMethod==='card' && (!cardNumber || !cardExpiry || !cardCVV || !cardName)) {
  showToast('❌ Please fill in all card details');
  return;
}
```

---

### BUG-04: Revenue stat shows fake $1,240 when there are no orders
**Location:** Line 797  
```jsx
'$'+(orders.reduce((s,o)=>s+(o.total||0),0)||1240)
```
**What happens:** The `||1240` fallback means a brand-new seller immediately sees $1,240 in revenue. This is misleading and looks like a hardcoded demo value.  
**Impact:** MEDIUM — Damages trust/credibility in the seller dashboard.  
**Fix:** Remove the fallback:
```jsx
'$'+orders.reduce((s,o)=>s+(o.total||0), 0)
```

---

### BUG-05: Rating stat is permanently hardcoded "4.9"
**Location:** Line 798  
```jsx
['⭐','4.9','Rating'],
```
**What happens:** Seller rating always shows 4.9 regardless of actual reviews received or any real calculation.  
**Impact:** MEDIUM — Meaningless metric. Could confuse users.  
**Fix:** Calculate dynamically from localReviews across the seller's own listings, or use a real backend value. For now, at minimum show "N/A" if no reviews.

---

### BUG-06: Search bar visible on all tabs (Sell, Saved, Messages)
**Location:** Lines 623–649 — search bar + recent searches are rendered outside any tab condition  
**What happens:** When users are on the "Sell", "Messages", or "Saved" tabs, the search bar still appears at the top. Searching while on Messages has no effect on the chat list — the search only filters Browse results but stays visible on every tab.  
**Impact:** MEDIUM — Confusing UX. Users on the Messages tab expect searching to filter their chats, not Browse listings.  
**Fix:** Wrap the search block in `{tab==='browse' && (...)}` or add tab-specific search logic for Messages.

---

### BUG-07: "Leave Review" closes Order History before review is submitted
**Location:** Line 897-899  
```jsx
setWriteReviewItem(firstItem); setViewingOrders(false);
```
**What happens:** Clicking Leave Review instantly closes Order History and drops the user back to the Sell tab stats. After submitting the review, they're left on the stats screen with no way back to orders without clicking the Orders card again.  
**Impact:** MEDIUM — Disjointed navigation. User loses context.  
**Fix:** Either open the Write Review modal ON TOP of Order History (don't set `viewingOrders(false)` until after review is done), or set `viewingOrders(false)` only in the review success callback.

---

### BUG-08: "Write Review" accessible without purchase verification
**Location:** Lines 1085–1089, item detail modal  
**What happens:** Any user can tap "✍️ Review" on any listing and submit a review — no purchase required.  
**Impact:** MEDIUM (trust/safety) — Enables fake/malicious reviews from non-buyers.  
**Fix:** Check `orders.some(o => o.items.some(i => i.id === item.id))` before showing the Review button. If not purchased, show a disabled/grayed "Buy first to review" state.

---

### BUG-09: Manage Listing can't edit location, category, or condition
**Location:** Lines 1440–1444 — manage modal form  
**What happens:** The edit form only shows title, price, and description. Location, category, condition, and tags cannot be changed after publishing.  
**Impact:** MEDIUM — If a seller makes a mistake in category or condition, they have to delete and re-create the listing.  
**Fix:** Add the missing fields to the manage modal form.

---

### BUG-10: Make Offer modal doesn't show the item's asking price
**Location:** Lines 1519–1524 — offer modal  
**What happens:** The offer modal shows "Re: [item name] — enter your offer price:" but never shows the current listed price. Users have to remember the price from when they were in the item detail modal.  
**Impact:** MEDIUM — Poor UX. Users can't make an informed offer without a price reference.  
**Fix:** Store the item's price in the chat object or pass it through the offer modal context.
```jsx
<div style={{color:'#94a3b8',fontSize:'13px',marginBottom:'12px'}}>
  Re: {chatModal?.item} — Listed at <strong style={{color:'#10b981'}}>${chatModal?.itemPrice || '—'}</strong>. Enter your offer:
</div>
```

---

### BUG-11: Order History is under the "Sell" tab — not buyer-friendly
**Location:** `tab === 'selling' && viewingOrders`  
**What happens:** When a user buys something and wants to track their order, they must navigate to the "📦 Sell" tab. The Sell tab is clearly branded for sellers. New buyers who have never listed anything will not think to look there for their purchase history.  
**Impact:** MEDIUM-HIGH UX — causes user confusion.  
**Fix options:**  
  - Add a 5th tab "📋 Orders" or rename "📦 Sell" to "📦 My Market" (covers both buying and selling)  
  - OR add a shortcut to Order History from the top bar (order icon)  
  - OR add it to the Browse tab as a secondary card/section when orders exist

---

### BUG-12: Promo code error message only hints at WELCOME10
**Location:** Line 435  
```jsx
setPromoMsg('❌ Invalid promo code. Try WELCOME10');
```
**What happens:** The error tells users "Try WELCOME10" but SAVE5 also works. Users trying SAVE5 would not discover WELCOME10 either.  
**Fix:**
```jsx
setPromoMsg('❌ Invalid promo code');
```
Or to be helpful:
```jsx
setPromoMsg('❌ Invalid code. First-time buyers can use WELCOME10');
```

---

### BUG-13: Wishlist heart button on Saved tab has no aria-label
**Location:** Line 932  
```jsx
<button onClick={e=>{e.stopPropagation();toggleWishlist(item.id);}}
  style={{...}}>❤️</button>
```
Compare to Browse tab (line 737-740) which has `aria-label`.  
**Fix:** Add `aria-label="Remove from wishlist"` to the wishlist card button.

---

### BUG-14: Seller profile modal has no "Message Seller" button
**Location:** Lines 1157–1200  
**What happens:** The seller profile modal shows bio and listings but there is no way to message the seller directly from their profile. User must close the seller modal, re-open an item detail, and tap "Message" there.  
**Impact:** LOW-MEDIUM UX friction.  
**Fix:** Add a "💬 Message" button in the seller profile modal footer.

---

### BUG-15: "Multiple" attribute on file input but only last photo is saved
**Location:** Line 1376  
```jsx
<input type="file" ... accept="image/*" multiple ... onChange={handlePhotoSelect} />
```
The `multiple` attribute allows selecting several files, but `handlePhotoSelect` only processes `e.target.files[0]` and stores one blob URL in `photoPreview`. If a user selects 5 photos, only the first is previewed and only one can be shown.  
**Impact:** MEDIUM — A marketplace listing with only 1 photo sells worse than listings with multiple photos.  
**Fix:** Store `photoPreview` as an array (`photoPreviews`), loop through `e.target.files`, and render a horizontal scroll strip of thumbnails.

---

### BUG-16: No "Contact Support" / dispute mechanism for order issues
**Location:** Order History tab  
**What happens:** The Buyer Protection badge in checkout promises a "full refund if item not as described or doesn't arrive within 7 days" — but there is no button or flow to actually request that refund anywhere in the UI. Users who receive the wrong item or never receive it have no in-app recourse.  
**Impact:** HIGH trust/safety risk — Buyer Protection is mentioned but is completely non-functional.  
**Fix:** Add a "🆘 Report a Problem" button to each order in Order History that opens a support flow (even if just email or a form for now).

---

### BUG-17: Orders list always shows "Confirmed" status — no status progression
**Location:** Line 405 — `status:'Confirmed'` hardcoded  
**What happens:** All orders perpetually show a green "✅ Confirmed" badge. After an order is "shipped" (per notification n3) there's no status update in the order card.  
**Impact:** MEDIUM — Users want to see "Confirmed → Packed → Shipped → Delivered" progression.  
**Fix:** Add a `status` field to the order object and a status progression system (even simulated with a `setTimeout` chain for demo purposes).

---

### BUG-18: Wishlist items are unsorted and unfiltered
**Location:** Lines 910–950  
**What happens:** The Wishlist tab shows all saved items with no sort controls and no filter.  
**Impact:** LOW-MEDIUM — As wishlist grows, items become hard to find.  
**Fix:** Add at minimum a price sort and a search/filter within the Wishlist tab.

---

### BUG-19: No "recently viewed" history
**What happens:** If a user views an item, closes the modal, browses more items, and wants to go back — they have to scroll through all listings to find it again.  
**Fix:** Maintain a `recentlyViewed` array (last 5 items) and display it as a horizontal scroll strip at the top of the Browse tab.

---

### BUG-20: Toast positioned at bottom:140px may overlap FAB or bottom nav in certain shell configurations
**Location:** Line 1642 (toast: `bottom:'140px'`), Line 1661 (FAB: `bottom:'100px'`), AppShell bottom nav (~70px)  
**What happens:** On devices with taller bottom nav (e.g., iPhone with home indicator), the FAB at 100px and toast at 140px could overlap each other or the bottom nav.  
**Fix:** Use CSS custom properties or a useBottomPadding hook to get the actual safe-area inset. Alternatively use `bottom: calc(var(--bottom-nav-height, 80px) + 24px)` for the FAB.

---

## SECTION 3: WHAT'S MISSING — FEATURE GAPS 🟡

### MISSING-01: Real backend integration
All data is seed/mock. Every "API call" is a `setTimeout`. For production:
- `getBrowseListings()` → `marketplaceApi.getListings()`
- Photo upload → Cloudinary/S3 (currently uses `URL.createObjectURL()` blob which dies on page reload)
- Orders → Firestore (currently localStorage only — clears if user logs in on a different device)
- Real payment → Stripe/PayPal SDK
- Seller verification → ID verification service

### MISSING-02: Shipping fee calculation
The checkout shows item prices only. There's no shipping fee added to the order total. Most marketplace apps show "Item: $X + Shipping: $Y = Total: $Z". Free shipping vs. paid shipping is a key purchasing decision factor.

### MISSING-03: Estimated delivery date
There's no delivery estimate ("Ships in 3–5 business days" or "Ready for pickup Sat") in either the item detail or checkout. This is critical for purchase decisions.

### MISSING-04: Bundle / multi-item discount
No way for sellers to offer "Buy 2 get 10% off" or bundle pricing. Power sellers on marketplace apps commonly do this.

### MISSING-05: Saved searches / price drop alerts
No ability to save a search and get notified when a new item matching the search is listed, or when a wishlisted item drops in price.

### MISSING-06: Listing analytics for sellers
While views and likes numbers are shown on listing cards, there's no analytics page: no trend graph, no click-through rate, no time-on-listing, no comparison between listings.

### MISSING-07: Promoted / Featured listings
No seller ability to pay to boost visibility or pin a listing to the top of search results.

### MISSING-08: Product video support
Only photos can be uploaded. Video demos of products (e.g., showing the item working, demonstrating condition) are increasingly expected on marketplaces.

### MISSING-09: Address book / saved shipping addresses
Users must re-enter their shipping address on every purchase. A "Save address" checkbox and reusable address book would significantly reduce checkout friction.

### MISSING-10: Seller response rate and response time metrics
The seller profile shows rating, sales count, and member since date. It should also show "Responds within 2 hours" or "90% response rate" — major factors in buyer trust.

### MISSING-11: Star rating breakdown / histogram
Reviews section shows individual reviews but no bar chart showing how many 5-star, 4-star, 3-star, etc. reviews exist. This is standard on Amazon, eBay, etc.

### MISSING-12: Bulk seller actions
No way to select multiple listings and delete/mark-sold/edit at once. Sellers with many listings need this.

### MISSING-13: Return / Refund request flow
Buyer Protection is advertised but there's no UI to file a claim. Users have no in-app path to request a refund.

### MISSING-14: Order tracking map / timeline
Tracking codes are shown (e.g., TRK-123456) but they're not linked to any carrier tracking. A visual delivery timeline would greatly improve post-purchase experience.

### MISSING-15: "Hold for buyer" / reservation feature
No ability for a seller to mark an item as "Reserved for [buyer]" while the buyer arranges payment/pickup.

### MISSING-16: Character counter on description fields
Both Create Listing and Write Review have `<textarea>` fields with no character limit indicator. Users don't know how much they can write.

### MISSING-17: Gift option / special instructions in checkout
No "This is a gift" checkbox, no gift message field, and no "Special instructions to seller" field.

### MISSING-18: "View all listings" link on Seller Profile
The seller profile shows only 4 listings (`.slice(0,4)`). If a seller has 10+ listings, there's no way to see them all.

### MISSING-19: Item condition description tooltip / definition
The condition values (New, Like New, Good, Fair, Poor) have no definitions. Buyers don't know whether "Good" means "minor scratches" or "heavy wear". Marketplaces like eBay show condition definitions.

### MISSING-20: Social proof on Browse — "X people are looking at this"
Real urgency cues like "4 people have this saved" or "3 people are viewing this right now" drive purchase decisions on marketplace apps.

---

## SECTION 4: DETAILED RECOMMENDATIONS BY PRIORITY

### 🔴 CRITICAL (fix before beta launch)

| # | Recommendation | Effort | Impact |
|---|---|---|---|
| R1 | Fix the dead "Counter" offer button | Low | High |
| R2 | Add validation feedback on checkout Step 1 (empty field errors) | Low | High |
| R3 | Make card number/expiry/CVV controlled inputs with validation | Low | High |
| R4 | Fix revenue stat — remove the ||1240 fallback | 1 line | High |
| R5 | Hide search bar on non-Browse tabs OR make it filter the active tab | Low | Medium |
| R6 | Fix "Leave Review from Order History" — don't close order history prematurely | Low | Medium |

### 🟡 HIGH PRIORITY (first sprint post-launch)

| # | Recommendation | Effort | Impact |
|---|---|---|---|
| R7 | Add "Report a Problem" / dispute flow to Order History | Medium | High (trust) |
| R8 | Move Order History to a dedicated tab or accessible from top bar | Medium | High (UX) |
| R9 | Add item price reference to Make Offer modal | Low | Medium |
| R10 | Add purchase verification before allowing Write Review | Low | Medium (trust) |
| R11 | Fix Manage Listing to edit location/category/condition/tags | Low | Medium |
| R12 | Add shipping fee field to listing creation and display in checkout | Medium | High |
| R13 | Add "Message Seller" button to Seller Profile modal | Low | Medium |
| R14 | Fix multi-photo upload (store array of previews) | Medium | High |
| R15 | Add estimated delivery date to checkout summary | Low | Medium |

### 🟢 MEDIUM PRIORITY (Sprint 2)

| # | Recommendation | Effort | Impact |
|---|---|---|---|
| R16 | Add "Recently Viewed" strip to Browse tab | Medium | Medium |
| R17 | Add sort/filter controls to Wishlist tab | Low | Low |
| R18 | Add "View All Listings" link on Seller Profile | Low | Medium |
| R19 | Add condition definitions tooltip | Low | Medium |
| R20 | Add character counter to all textarea fields | Low | Low |
| R21 | Add "4 people saved this" social proof to item detail | Low | Medium |
| R22 | Add order status progression (Confirmed → Shipped → Delivered) | Medium | High |
| R23 | Add address book / saved address in checkout | Medium | High |
| R24 | Add star rating histogram to reviews section | Medium | Medium |
| R25 | Fix toast/FAB/bottom-nav safe-area positioning | Low | Low |

### ⚪ LOWER PRIORITY (Backlog)

| # | Recommendation | Effort | Impact |
|---|---|---|---|
| R26 | Saved searches + price drop push notifications | High | High |
| R27 | Product video support | High | Medium |
| R28 | Seller analytics dashboard (graphs/trends) | High | High |
| R29 | Promoted/Featured listings (seller monetization) | High | High |
| R30 | Bundle discounts / multi-item deals | High | Medium |
| R31 | Gift options / special instructions in checkout | Low | Low |
| R32 | "Hold for buyer" reservation feature | Medium | Medium |
| R33 | Seller response rate metrics on seller profile | Medium | Medium |
| R34 | Real carrier tracking link from tracking code | Medium | High |
| R35 | Bulk seller actions (select multiple listings) | Medium | Medium |

---

## SECTION 5: USER JOURNEY ANALYSIS

### Journey 1: First-time buyer discovers and purchases an item
1. Opens app → Marketplace tab ✅ (skeleton loads for 900ms, then items appear)
2. Scrolls Browse tab ✅ (16 items, 8 visible, Load More works)
3. Taps category chip → items filter ✅
4. Taps item → item detail modal opens ✅
5. Reads description, checks condition/location ✅
6. Taps seller profile → sees bio and other listings ✅ (no Message button here 🔴)
7. Goes back to item detail, taps "Add to Cart" ✅
8. Taps cart icon → cart modal opens ✅
9. Adjusts quantity ✅
10. Taps Checkout → shipping form ⚠️ (no validation feedback if fields empty)
11. Fills shipping → Continue → payment page ✅
12. Enters promo code "WELCOME10" ✅ (discount applied, strikethrough shown)
13. Card fields: enters name, number, expiry, CVV ⚠️ (number/expiry/CVV not saved to state)
14. Taps Place Order ✅ (succeeds even with blank card fields — BUG)
15. Success toast ✅ → order in history ✅

**Journey rating: 7/10** — functional but checkout has trust-breaking bugs

---

### Journey 2: Seller lists an item and manages it
1. Taps "📦 Sell" tab ✅
2. Sees stats (Revenue shows fake $1,240 if no orders 🔴)
3. Taps "Create New Listing" ✅
4. Uploads photo → progress bar ✅ → preview ✅
5. Fills title, price, location, category, condition, description, tags ✅
6. Taps Publish → listing appears in Browse and My Listings ✅
7. Later taps listing → Manage modal ✅
8. Can edit title/price/description but NOT location/category/condition 🔴
9. Marks as Sold → SOLD overlay appears ✅

**Journey rating: 7/10** — functional but manage flow is incomplete

---

### Journey 3: Buyer and seller negotiate price via chat
1. Opens item, taps "💬 Message" on seller card ✅ (thread created, navigates to Messages)
2. Sends messages ✅ (Enter key works)
3. Taps 💰 Offer → Make Offer modal ✅ (no price reference visible 🔴)
4. Enters offer amount → sends offer ✅ (appears in chat as text)
5. Seller side: receives notification "Sarah Miller offered $40" ✅
6. Taps Accept ✅ (toast: "✅ Offer accepted!"), Counter 🔴 (nothing happens), Decline ✅

**Journey rating: 6/10** — Counter offer is broken, no price reference in offer modal

---

### Journey 4: User reports and reviews a listing
1. Opens item → taps 🚩 Report ✅
2. Selects reason ✅ → Submit ✅ → success state ✅ → auto-closes ✅
3. Opens item → taps ✍️ Review ✅
4. Selects stars (animated) ✅ → types review ✅ → Post Review ✅
5. New review appears immediately in item detail ✅

**Journey rating: 9/10** — Works well. Only gap: no purchase verification before reviewing.

---

## SECTION 6: VISUAL DESIGN OBSERVATIONS

### Strengths
- 🎨 Dark theme (`#0f172a` background) is consistent and looks premium
- 🎨 Gradient accent (`#6366f1 → #ec4899` indigo-to-pink) applied to title, CTAs, verified badges — cohesive brand
- 🎨 Seller profile gradient header banner is visually polished
- 🎨 Card design with colored emoji backgrounds is distinctive and fun
- 🎨 Condition badge and verified badge placement on cards is clean
- 🎨 Bottom sheet modals with `backdropFilter: blur(4px)` feel native/premium

### Issues
- ⚠️ **All product images are emoji** — In production, real photos are needed. The emoji-on-color-block aesthetic works for a prototype but real users will expect photos.
- ⚠️ **Card title font-size is 12px** — Very small for a marketplace card title. Should be 13–14px minimum. Long titles (e.g., "Lego Star Wars Millennium Falcon") truncate to 2 lines but the text is hard to read at 12px on mobile.
- ⚠️ **Condition badge uses 10px text** — Barely readable. Should be 11px minimum.
- ⚠️ **No visual difference between "Buy" and "Sell" perspective** — The same card design is used in Browse, Wishlist, and My Listings. The My Listings cards should look distinctly different (more dashboard-like).
- ⚠️ **Revenue, Rating, Orders stats on Sell tab are in a horizontal scroll** — On larger screens or if 5+ stats are added, this becomes awkward. Consider a 2×2 grid layout instead.
- ⚠️ **Promo code section uses 12px label** ("PROMO CODE") — slightly small for readability.

---

## SECTION 7: ACCESSIBILITY OBSERVATIONS

### What's Good
- Strong `role` attribute coverage (dialog, tablist, tab, log, radio, radiogroup, alert)
- `aria-label` on all icon buttons
- `aria-live="polite"` on toast
- Keyboard navigation for cards (tabIndex + onKeyDown Enter)
- Escape key modal dismissal

### What Needs Work
- ⚠️ `role="radio"` on `<div>` elements for payment method and report reason — these should use actual `<input type="radio">` for full screen-reader compatibility. The visual custom radio is fine, but wrapping it in a real input gives better accessibility.
- ⚠️ No `aria-describedby` linking field labels to error messages when validation fails
- ⚠️ Wishlist heart button on Saved tab missing `aria-label` (already noted as BUG-13)
- ⚠️ Modal trap — modals have no focus trap. When a modal opens, keyboard focus is not moved to the modal content. Screen reader users could still interact with background content.
- ⚠️ No `aria-modal="true"` on modal dialogs
- ⚠️ Color contrast: `#64748b` text on `#1e293b` background = approximately 3.8:1. WCAG AA requires 4.5:1 for normal text. Many secondary text elements (timestamps, seller name, condition) use this combination and fail AA.
- ⚠️ Star rating in reviews section uses `letter-spacing: 2px` which creates gaps between ★ symbols that look unintentional.

---

## SECTION 8: PERFORMANCE OBSERVATIONS

### What's Good
- ✅ Loading skeleton prevents layout shift on initial load
- ✅ `useCallback` is imported but could be applied to `addToCart`, `toggleWishlist`, and `sendMessage` handlers to avoid re-renders
- ✅ Debounced recent-search save (700ms)
- ✅ Load More pagination — only renders 8 items at a time

### Concerns
- ⚠️ **All state in one 1,667-line component** — The entire marketplace is a single React component with 30+ `useState` hooks and 20+ handler functions. This should be refactored into smaller components: `BrowseTab`, `SellTab`, `CartModal`, `CheckoutModal`, `ChatModal`, etc. As it grows, React reconciliation and re-render costs will increase.
- ⚠️ **`useEffect` for `chatThreads` depends on entire `chatThreads` object** — Line 325: `useEffect(()=>{ chatBottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [chatModal, chatThreads])` — `chatThreads` is an object and this will trigger on every new message across ALL chats, not just the open one.
- ⚠️ **No `React.memo` or `useMemo`** — `filtered` array is recalculated every render. With 16 seed items it's fine, but with 1,000+ real listings, this needs `useMemo`.
- ⚠️ **No virtualization** — The 2-column grid renders all `filtered.slice(0, visibleCount)` items at once. With 40+ items visible, this could cause scroll jank on low-end devices.

---

## SECTION 9: BACKEND READINESS

| Feature | Current State | What's Needed |
|---|---|---|
| Listings data | `SEED_LISTINGS` hardcoded array | `marketplaceApi.getListings(filters, page)` |
| Photo upload | `URL.createObjectURL()` blob | Cloudinary/S3 upload with real URL |
| Cart persistence | `localStorage` | Firestore subcollection per user |
| Orders | `localStorage` | Firestore collection with real order IDs |
| Chat messages | In-memory state | Firestore real-time `onSnapshot` |
| Notifications | In-memory array | Push notifications via OneSignal |
| Payment processing | UI only | Stripe or PayPal SDK |
| Seller verification | Frontend badge only | KYC/identity verification service |
| Reviews | In-memory `localReviews` | Firestore collection with write verification |
| Seller profile stats | Hardcoded seed | Aggregated from real data |

---

## SECTION 10: FINAL VERDICT

### As a Beta Tester, Here Is My Honest Assessment:

**The Marketplace is visually polished, feature-rich, and covers all the core flows that users expect from a social commerce marketplace. The navigation, filtering, and discovery experience is genuinely good. The seller tools are solid. The chat system works. The 3-round sprint of improvements has addressed most major UX bugs from the original version.**

**However, there are 3 bugs that are significant enough to cause user frustration in a real beta:**
1. The silent checkout validation failure (users tapping Continue with nothing happening)
2. The uncontrolled card fields (orders can be placed with blank card numbers)
3. The dead Counter Offer button

**And there are 3 structural UX issues that confuse the user model:**
1. Order History under the Sell tab instead of a dedicated location
2. No purchase verification for reviews
3. No dispute/refund claim flow despite advertising "Buyer Protection"

**Recommendation: Fix the 6 Critical items (R1–R6) before inviting beta testers. The rest can be tracked as post-launch sprint work.**

---

*Report generated: May 12, 2026 | By: ConnectHub Beta Testing Team*
