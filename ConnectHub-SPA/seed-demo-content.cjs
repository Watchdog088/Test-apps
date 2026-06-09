/**
 * seed-demo-content.cjs
 * ITEM-3 FIX (Jun 2026) — Seeds demo users, posts, and stories into Firestore
 * so the feed is not empty for the first beta testers.
 *
 * Usage:
 *   node ConnectHub-SPA/seed-demo-content.cjs
 *
 * Requirements:
 *   - ConnectHub-SPA/serviceAccountKey.json must exist
 *   - firebase-admin must be installed: npm install firebase-admin
 */

'use strict';

const admin = require('firebase-admin');
const path  = require('path');

// ── Init ──────────────────────────────────────────────────────────────────────
const serviceAccount = require(path.resolve(__dirname, 'serviceAccountKey.json'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db        = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// ── Helper: server timestamp ──────────────────────────────────────────────────
const now = () => FieldValue.serverTimestamp();

// ── Demo Users ────────────────────────────────────────────────────────────────
const DEMO_USERS = [
  {
    uid: 'demo_alex_001',
    displayName: 'Alex Rivera',
    handle: 'alexrivera',
    bio: 'Photographer & traveler 📸 | NYC',
    photoURL: 'https://api.dicebear.com/8.x/avataaars/svg?seed=alexrivera',
    interests: ['📸 Photography', '✈️ Travel', '🍕 Food'],
    onboardingComplete: true,
    isDemo: true,
    role: 'user',
    followersCount: 142,
    followingCount: 89,
  },
  {
    uid: 'demo_jordan_002',
    displayName: 'Jordan Lee',
    handle: 'jordanlee',
    bio: 'Music producer 🎵 | Always vibing',
    photoURL: 'https://api.dicebear.com/8.x/avataaars/svg?seed=jordanlee',
    interests: ['🎵 Music', '🎮 Gaming', '🎬 Film'],
    onboardingComplete: true,
    isDemo: true,
    role: 'user',
    followersCount: 310,
    followingCount: 204,
  },
  {
    uid: 'demo_sam_003',
    displayName: 'Sam Chen',
    handle: 'samchen',
    bio: 'Fitness coach 💪 | Helping you get strong',
    photoURL: 'https://api.dicebear.com/8.x/avataaars/svg?seed=samchen',
    interests: ['💪 Fitness', '🧘 Wellness', '🍕 Food'],
    onboardingComplete: true,
    isDemo: true,
    role: 'user',
    followersCount: 521,
    followingCount: 77,
  },
  {
    uid: 'demo_morgan_004',
    displayName: 'Morgan Kim',
    handle: 'morgankim',
    bio: 'Designer & UX nerd 🎨 | Making things beautiful',
    photoURL: 'https://api.dicebear.com/8.x/avataaars/svg?seed=morgankim',
    interests: ['🎨 Art', '💻 Tech', '🏠 Design'],
    onboardingComplete: true,
    isDemo: true,
    role: 'user',
    followersCount: 198,
    followingCount: 156,
  },
  {
    uid: 'demo_taylor_005',
    displayName: 'Taylor Brooks',
    handle: 'taylorbrooks',
    bio: 'Coffee ☕ & code | Building the future',
    photoURL: 'https://api.dicebear.com/8.x/avataaars/svg?seed=taylorbrooks',
    interests: ['💻 Tech', '🚀 Science', '📸 Photography'],
    onboardingComplete: true,
    isDemo: true,
    role: 'user',
    followersCount: 88,
    followingCount: 112,
  },
];

// ── Demo Posts ────────────────────────────────────────────────────────────────
const DEMO_POSTS = [
  {
    id: 'demo_post_001',
    authorId: 'demo_alex_001',
    authorName: 'Alex Rivera',
    authorHandle: 'alexrivera',
    authorAvatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=alexrivera',
    content: 'Just got back from the most incredible trip to Patagonia! 🏔️ The landscapes are absolutely breathtaking. If you ever get the chance — GO. No regrets. 🌎✈️',
    mediaType: 'text',
    likesCount: 47,
    commentsCount: 12,
    sharesCount: 8,
    hashtags: ['travel', 'patagonia', 'adventure', 'photography'],
    isDemo: true,
    visibility: 'public',
  },
  {
    id: 'demo_post_002',
    authorId: 'demo_sam_003',
    authorName: 'Sam Chen',
    authorHandle: 'samchen',
    authorAvatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=samchen',
    content: '5am workout done 💪🔥 Remember: it\'s not about being the best — it\'s about being better than you were yesterday. Small steps every day add up to big results. Who else is up early grinding? Drop a 🔥 below!',
    mediaType: 'text',
    likesCount: 89,
    commentsCount: 31,
    sharesCount: 14,
    hashtags: ['fitness', 'motivation', 'gym', 'wellness'],
    isDemo: true,
    visibility: 'public',
  },
  {
    id: 'demo_post_003',
    authorId: 'demo_jordan_002',
    authorName: 'Jordan Lee',
    authorHandle: 'jordanlee',
    authorAvatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=jordanlee',
    content: 'Just dropped a new beat 🎵🎧 Been working on this one for weeks. Lo-fi hip hop with some jazz chords. Link in bio — let me know what you think! 🎶',
    mediaType: 'text',
    likesCount: 134,
    commentsCount: 42,
    sharesCount: 27,
    hashtags: ['music', 'producer', 'lofi', 'hiphop', 'newmusic'],
    isDemo: true,
    visibility: 'public',
  },
  {
    id: 'demo_post_004',
    authorId: 'demo_morgan_004',
    authorName: 'Morgan Kim',
    authorHandle: 'morgankim',
    authorAvatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=morgankim',
    content: 'Hot take: most apps fail because they forget that design is not how something looks — it\'s how it works. Every pixel has a purpose. Every interaction should feel natural. Don\'t decorate, solve problems. 🎨💡',
    mediaType: 'text',
    likesCount: 203,
    commentsCount: 56,
    sharesCount: 88,
    hashtags: ['design', 'ux', 'product', 'tech', 'startup'],
    isDemo: true,
    visibility: 'public',
  },
  {
    id: 'demo_post_005',
    authorId: 'demo_taylor_005',
    authorName: 'Taylor Brooks',
    authorHandle: 'taylorbrooks',
    authorAvatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=taylorbrooks',
    content: 'LynkApp beta is live and honestly this is the most polished social platform I\'ve seen built from scratch. The feed, stories, dating features — everything just works. Excited to be a beta tester! 🚀⚡',
    mediaType: 'text',
    likesCount: 312,
    commentsCount: 78,
    sharesCount: 45,
    hashtags: ['lynkapp', 'beta', 'tech', 'startup', 'socialmedia'],
    isDemo: true,
    visibility: 'public',
  },
  {
    id: 'demo_post_006',
    authorId: 'demo_alex_001',
    authorName: 'Alex Rivera',
    authorHandle: 'alexrivera',
    authorAvatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=alexrivera',
    content: 'Golden hour hits different when you\'re on top of a mountain 🌅 Three hours of hiking to get this shot. Worth every single step. Photography teaches you patience — and patience teaches you everything else.',
    mediaType: 'text',
    likesCount: 267,
    commentsCount: 33,
    sharesCount: 19,
    hashtags: ['photography', 'goldenhour', 'nature', 'hiking'],
    isDemo: true,
    visibility: 'public',
  },
];

// ── Demo Stories ──────────────────────────────────────────────────────────────
const DEMO_STORIES = [
  {
    id: 'demo_story_001',
    authorId: 'demo_alex_001',
    authorName: 'Alex Rivera',
    authorAvatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=alexrivera',
    text: 'Morning vibes ☀️ Ready for the day!',
    background: 'linear-gradient(135deg,#6366f1,#ec4899)',
    expiresIn: 24,
    viewCount: 42,
    isDemo: true,
  },
  {
    id: 'demo_story_002',
    authorId: 'demo_sam_003',
    authorName: 'Sam Chen',
    authorAvatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=samchen',
    text: 'Pre-workout fuel 🥗💪 Eating clean!',
    background: 'linear-gradient(135deg,#10b981,#3b82f6)',
    expiresIn: 24,
    viewCount: 87,
    isDemo: true,
  },
  {
    id: 'demo_story_003',
    authorId: 'demo_jordan_002',
    authorName: 'Jordan Lee',
    authorAvatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=jordanlee',
    text: 'Studio session 🎧🎵 New vibes incoming…',
    background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
    expiresIn: 24,
    viewCount: 156,
    isDemo: true,
  },
  {
    id: 'demo_story_004',
    authorId: 'demo_morgan_004',
    authorName: 'Morgan Kim',
    authorAvatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=morgankim',
    text: 'Wireframing a new feature 🎨 Design thinking is life',
    background: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
    expiresIn: 24,
    viewCount: 63,
    isDemo: true,
  },
];

// ── Seed function ─────────────────────────────────────────────────────────────
async function seedAll() {
  console.log('\n🌱 LynkApp — Seeding demo content into Firestore...\n');
  const batch = db.batch();

  // ── Users ──
  console.log(`📋 Writing ${DEMO_USERS.length} demo users...`);
  for (const user of DEMO_USERS) {
    const { uid, ...data } = user;
    batch.set(db.collection('users').doc(uid), {
      ...data,
      createdAt: now(),
      updatedAt: now(),
    }, { merge: true });
  }

  // ── Posts ──
  console.log(`📝 Writing ${DEMO_POSTS.length} demo posts...`);
  for (const post of DEMO_POSTS) {
    const { id, ...data } = post;
    batch.set(db.collection('posts').doc(id), {
      ...data,
      createdAt: now(),
      updatedAt: now(),
    }, { merge: true });
  }

  // ── Stories ──
  console.log(`📖 Writing ${DEMO_STORIES.length} demo stories...`);
  for (const story of DEMO_STORIES) {
    const { id, ...data } = story;
    batch.set(db.collection('stories').doc(id), {
      ...data,
      createdAt: now(),
    }, { merge: true });
  }

  await batch.commit();

  console.log('\n✅ Demo content seeded successfully!\n');
  console.log('  Users:   ', DEMO_USERS.length);
  console.log('  Posts:   ', DEMO_POSTS.length);
  console.log('  Stories: ', DEMO_STORIES.length);
  console.log('\n💡 Beta testers will now see a populated feed on first login.\n');
  process.exit(0);
}

seedAll().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
