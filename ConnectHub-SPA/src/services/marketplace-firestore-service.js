// marketplace-firestore-service.js — Sprint 21
// Firestore data layer for all marketplace collections.
// Replaces localStorage reads/writes with real Firestore persistence.
// Collections: marketplace/listings, marketplace/cart/{uid}, marketplace/orders,
//              marketplace/wishlists/{uid}, marketplace/reviews, marketplace/reports
//
// Usage:
//   import { mfs } from './marketplace-firestore-service';
//   const listings = await mfs.listings.getAll({ category: 'Electronics' });

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();
const uid = () => auth.currentUser?.uid;

// ─── HELPER ──────────────────────────────────────────────────────────────────
function snap2arr(snapshot) {
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── LISTINGS ─────────────────────────────────────────────────────────────────
const listings = {
  col: () => collection(db, 'marketplace', 'data', 'listings'),

  /** Get paginated listings with optional filters */
  async getAll({ category, condition, minPrice, maxPrice, searchQuery, sortBy = 'createdAt', pageSize = 20, cursor } = {}) {
    let q = query(this.col(), where('status', '==', 'active'));
    if (category && category !== 'All') q = query(q, where('category', '==', category));
    if (condition) q = query(q, where('condition', '==', condition));
    if (minPrice != null) q = query(q, where('price', '>=', Number(minPrice)));
    if (maxPrice != null) q = query(q, where('price', '<=', Number(maxPrice)));
    q = query(q, orderBy(sortBy === 'price_asc' || sortBy === 'price_desc' ? 'price' : 'createdAt',
      sortBy === 'price_asc' ? 'asc' : 'desc'), limit(pageSize));
    if (cursor) q = query(q, startAfter(cursor));
    const snap = await getDocs(q);
    const items = snap2arr(snap);
    if (searchQuery) {
      const lc = searchQuery.toLowerCase();
      return items.filter(i => i.title?.toLowerCase().includes(lc) || i.description?.toLowerCase().includes(lc));
    }
    return items;
  },

  /** Get single listing by ID */
  async getById(listingId) {
    const snap = await getDoc(doc(this.col(), listingId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  /** Get all listings by a specific seller */
  async getBySeller(sellerUid) {
    const q = query(this.col(), where('sellerUid', '==', sellerUid), orderBy('createdAt', 'desc'));
    return snap2arr(await getDocs(q));
  },

  /** Create a new listing */
  async create(listingData) {
    const ref = await addDoc(this.col(), {
      ...listingData,
      sellerUid: uid(),
      status: 'active',
      views: 0,
      saves: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  /** Update an existing listing (owner only enforced by Firestore rules) */
  async update(listingId, updates) {
    await updateDoc(doc(this.col(), listingId), { ...updates, updatedAt: serverTimestamp() });
  },

  /** Mark listing as sold */
  async markSold(listingId, buyerUid) {
    await updateDoc(doc(this.col(), listingId), { status: 'sold', soldTo: buyerUid, soldAt: serverTimestamp() });
  },

  /** Delete a listing */
  async delete(listingId) {
    await deleteDoc(doc(this.col(), listingId));
  },

  /** Increment view count */
  async incrementViews(listingId) {
    await updateDoc(doc(this.col(), listingId), { views: increment(1) });
  },

  /** Real-time listener for a single listing */
  subscribe(listingId, callback) {
    return onSnapshot(doc(this.col(), listingId), snap => {
      callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
  },
};

// ─── CART ─────────────────────────────────────────────────────────────────────
const cart = {
  docRef: () => doc(db, 'marketplace', 'data', 'carts', uid()),

  async get() {
    const snap = await getDoc(this.docRef());
    return snap.exists() ? snap.data().items || [] : [];
  },

  async addItem(listing) {
    const existing = await this.get();
    const idx = existing.findIndex(i => i.id === listing.id);
    let updated;
    if (idx >= 0) {
      updated = existing.map((i, n) => n === idx ? { ...i, qty: (i.qty || 1) + 1 } : i);
    } else {
      updated = [...existing, { ...listing, qty: 1, addedAt: new Date().toISOString() }];
    }
    await setDoc(this.docRef(), { items: updated, updatedAt: serverTimestamp() }, { merge: true });
    return updated;
  },

  async removeItem(listingId) {
    const existing = await this.get();
    const updated = existing.filter(i => i.id !== listingId);
    await setDoc(this.docRef(), { items: updated, updatedAt: serverTimestamp() }, { merge: true });
    return updated;
  },

  async updateQty(listingId, qty) {
    const existing = await this.get();
    const updated = qty <= 0
      ? existing.filter(i => i.id !== listingId)
      : existing.map(i => i.id === listingId ? { ...i, qty } : i);
    await setDoc(this.docRef(), { items: updated, updatedAt: serverTimestamp() }, { merge: true });
    return updated;
  },

  async clear() {
    await setDoc(this.docRef(), { items: [], updatedAt: serverTimestamp() });
  },

  subscribe(callback) {
    if (!uid()) return () => {};
    return onSnapshot(this.docRef(), snap => {
      callback(snap.exists() ? snap.data().items || [] : []);
    });
  },
};

// ─── WISHLIST ─────────────────────────────────────────────────────────────────
const wishlist = {
  docRef: () => doc(db, 'marketplace', 'data', 'wishlists', uid()),

  async get() {
    const snap = await getDoc(this.docRef());
    return snap.exists() ? snap.data().items || [] : [];
  },

  async toggle(listing) {
    const existing = await this.get();
    const isIn = existing.some(i => i.id === listing.id);
    if (isIn) {
      await updateDoc(this.docRef(), { items: arrayRemove(existing.find(i => i.id === listing.id)) });
      // decrement listing saves counter
      await updateDoc(doc(listings.col(), listing.id), { saves: increment(-1) });
    } else {
      await setDoc(this.docRef(), { items: arrayUnion({ ...listing, savedAt: new Date().toISOString() }) }, { merge: true });
      await updateDoc(doc(listings.col(), listing.id), { saves: increment(1) });
    }
    return !isIn;
  },

  subscribe(callback) {
    if (!uid()) return () => {};
    return onSnapshot(this.docRef(), snap => {
      callback(snap.exists() ? snap.data().items || [] : []);
    });
  },
};

// ─── ORDERS ───────────────────────────────────────────────────────────────────
const orders = {
  col: () => collection(db, 'marketplace', 'data', 'orders'),

  async getMyPurchases() {
    const q = query(this.col(), where('buyerUid', '==', uid()), orderBy('createdAt', 'desc'));
    return snap2arr(await getDocs(q));
  },

  async getMySales() {
    const q = query(this.col(), where('sellerUid', '==', uid()), orderBy('createdAt', 'desc'));
    return snap2arr(await getDocs(q));
  },

  async create(orderData) {
    const ref = await addDoc(this.col(), {
      ...orderData,
      buyerUid: uid(),
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async updateStatus(orderId, status) {
    await updateDoc(doc(this.col(), orderId), { status, updatedAt: serverTimestamp() });
  },

  subscribe(orderId, callback) {
    return onSnapshot(doc(this.col(), orderId), snap => {
      callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
  },
};

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
const reviews = {
  col: () => collection(db, 'marketplace', 'data', 'reviews'),

  async getForListing(listingId) {
    const q = query(this.col(), where('listingId', '==', listingId), orderBy('createdAt', 'desc'));
    return snap2arr(await getDocs(q));
  },

  async getForSeller(sellerUid) {
    const q = query(this.col(), where('sellerUid', '==', sellerUid), orderBy('createdAt', 'desc'));
    return snap2arr(await getDocs(q));
  },

  async create(reviewData) {
    const ref = await addDoc(this.col(), {
      ...reviewData,
      reviewerUid: uid(),
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },
};

// ─── REPORTS ──────────────────────────────────────────────────────────────────
const reports = {
  col: () => collection(db, 'marketplace', 'data', 'reports'),

  async submit(listingId, listingTitle, reportType, details) {
    await addDoc(this.col(), {
      listingId,
      listingTitle,
      reportType,
      details,
      reportedBy: uid(),
      status: 'pending',
      createdAt: serverTimestamp(),
    });
  },

  async getAll(statusFilter = 'pending') {
    const q = statusFilter === 'all'
      ? query(this.col(), orderBy('createdAt', 'desc'))
      : query(this.col(), where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
    return snap2arr(await getDocs(q));
  },

  async resolve(reportId, action) {
    await updateDoc(doc(this.col(), reportId), { status: action, resolvedAt: serverTimestamp() });
  },
};

// ─── PRICE ALERTS ─────────────────────────────────────────────────────────────
const priceAlerts = {
  col: () => collection(db, 'marketplace', 'data', 'price_alerts'),

  async create(listingId, listingTitle, targetPrice) {
    await addDoc(this.col(), {
      listingId,
      listingTitle,
      targetPrice,
      userId: uid(),
      triggered: false,
      createdAt: serverTimestamp(),
    });
  },

  async getMyAlerts() {
    const q = query(this.col(), where('userId', '==', uid()), where('triggered', '==', false));
    return snap2arr(await getDocs(q));
  },

  async delete(alertId) {
    await deleteDoc(doc(this.col(), alertId));
  },
};

// ─── MIGRATE LOCALSTORAGE → FIRESTORE ────────────────────────────────────────
/**
 * One-time migration: reads existing localStorage marketplace data and
 * writes it to Firestore.  Call once after user signs in.
 */
export async function migrateLocalStorageToFirestore() {
  if (!uid()) return;
  try {
    // Cart
    const lsCart = JSON.parse(localStorage.getItem('marketplace_cart') || '[]');
    if (lsCart.length > 0) {
      await setDoc(cart.docRef(), { items: lsCart, migratedAt: serverTimestamp() }, { merge: true });
      localStorage.removeItem('marketplace_cart');
      console.log('[MFS] ✅ Cart migrated to Firestore');
    }
    // Wishlist
    const lsWish = JSON.parse(localStorage.getItem('marketplace_wishlist') || '[]');
    if (lsWish.length > 0) {
      await setDoc(wishlist.docRef(), { items: lsWish, migratedAt: serverTimestamp() }, { merge: true });
      localStorage.removeItem('marketplace_wishlist');
      console.log('[MFS] ✅ Wishlist migrated to Firestore');
    }
  } catch (e) {
    console.warn('[MFS] Migration error (non-fatal):', e);
  }
}

// ─── EXPORTED NAMESPACE ───────────────────────────────────────────────────────
export const mfs = { listings, cart, wishlist, orders, reviews, reports, priceAlerts };
export default mfs;
