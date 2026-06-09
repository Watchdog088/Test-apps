/**
 * LynkApp Seed Data Service
 * Creates welcome / demo posts in Firestore for first-time users
 * so the Feed is never empty on sign-up.
 *
 * Call seedNewUserData(uid) right after a new user completes onboarding.
 */

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

const SEED_FLAG_DOC = (uid) => `users/${uid}/meta/seeded`;

/**
 * Returns true if this user has already been seeded.
 */
export async function isUserSeeded(uid) {
  try {
    const db = getFirestore();
    const snap = await getDoc(doc(db, SEED_FLAG_DOC(uid)));
    return snap.exists();
  } catch (_) {
    return false;
  }
}

/**
 * Main entry point — call once after first sign-up / onboarding completion.
 * No-ops silently if already seeded or if Firestore is unavailable.
 */
export async function seedNewUserData(uid, displayName = 'New User') {
  try {
    const already = await isUserSeeded(uid);
    if (already) return;

    const db = getFirestore();
    const batch = writeBatch(db);

    // ── 1. Welcome post from LynkApp team ─────────────────────────────────
    const welcomeRef = doc(collection(db, 'posts'));
    batch.set(welcomeRef, {
      uid: 'lynkapp-team',
      authorName: 'LynkApp Team',
      authorHandle: '@lynkapp',
      authorAvatar: '/icons/icon-192.png',
      content:
        `👋 Welcome to LynkApp, ${displayName}! Start by updating your profile, ` +
        'following some creators, and sharing your first post. ' +
        'Tap the ➕ button below to get started.',
      mediaType: null,
      mediaUrl: null,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      isVerified: true,
      isPinned: true,
      tags: ['welcome', 'gettingstarted'],
      visibility: 'public',
      seedPost: true,
      createdAt: serverTimestamp(),
    });

    // ── 2. Tips post ───────────────────────────────────────────────────────
    const tipsRef = doc(collection(db, 'posts'));
    batch.set(tipsRef, {
      uid: 'lynkapp-team',
      authorName: 'LynkApp Team',
      authorHandle: '@lynkapp',
      authorAvatar: '/icons/icon-192.png',
      content:
        '🚀 Quick start tips:\n' +
        '• 📸 Add a profile photo\n' +
        '• 💬 Start a conversation in Messages\n' +
        '• 📡 Go Live and share your moment\n' +
        '• 🛒 Browse the Marketplace\n' +
        '• 💘 Find your match in Dating',
      mediaType: null,
      mediaUrl: null,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      isVerified: true,
      isPinned: false,
      tags: ['tips', 'howto'],
      visibility: 'public',
      seedPost: true,
      createdAt: serverTimestamp(),
    });

    // ── 3. Mark user as seeded ─────────────────────────────────────────────
    const seedFlagRef = doc(db, SEED_FLAG_DOC(uid));
    batch.set(seedFlagRef, {
      seededAt: serverTimestamp(),
      version: 1,
    });

    await batch.commit();
    console.log('[SeedData] New user seeded:', uid);
  } catch (err) {
    console.warn('[SeedData] Seed failed (non-critical):', err.message);
  }
}

/**
 * Returns sample/demo posts for the feed when Firestore returns 0 posts
 * (i.e. before the user follows anyone). These are purely UI-layer stubs.
 */
export function getFallbackFeedPosts() {
  return [
    {
      id: 'fallback-1',
      uid: 'lynkapp-team',
      authorName: 'LynkApp Team',
      authorHandle: '@lynkapp',
      authorAvatar: '/icons/icon-192.png',
      content:
        '👋 Your feed is empty right now. Start following people, join groups, or create your first post!',
      mediaType: null,
      mediaUrl: null,
      likes: 42,
      comments: 8,
      shares: 3,
      saves: 12,
      isVerified: true,
      isPinned: true,
      tags: ['welcome'],
      visibility: 'public',
      createdAt: new Date(),
      isFallback: true,
    },
    {
      id: 'fallback-2',
      uid: 'lynkapp-team',
      authorName: 'LynkApp Team',
      authorHandle: '@lynkapp',
      authorAvatar: '/icons/icon-192.png',
      content:
        '🔥 Trending now on LynkApp: Live streams, new marketplace listings, and dating matches are waiting for you!',
      mediaType: null,
      mediaUrl: null,
      likes: 128,
      comments: 24,
      shares: 17,
      saves: 35,
      isVerified: true,
      isPinned: false,
      tags: ['trending'],
      visibility: 'public',
      createdAt: new Date(Date.now() - 3600000),
      isFallback: true,
    },
  ];
}

export default { seedNewUserData, isUserSeeded, getFallbackFeedPosts };
