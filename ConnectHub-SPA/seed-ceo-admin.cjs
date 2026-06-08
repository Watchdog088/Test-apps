/**
 * seed-ceo-admin.cjs — LynkApp CEO Admin Seeder (CommonJS version)
 * Run: node seed-ceo-admin.cjs  (from inside ConnectHub-SPA folder)
 */

const path = require('path');
const fs   = require('fs');

// ── Load service account key ──────────────────────────────────────────────────
const keyPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
  console.error('\n❌  serviceAccountKey.json not found in ConnectHub-SPA/');
  process.exit(1);
}

const serviceAccount = require(keyPath);

// Load firebase-admin from functions/node_modules
const adminPath = path.join(__dirname, 'functions', 'node_modules', 'firebase-admin');
let admin;
try {
  admin = require(adminPath);
} catch (e) {
  console.error('\n❌  firebase-admin not found. Run:  cd functions && npm install\n');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();
const db   = admin.firestore();

// ── CEO Account details ───────────────────────────────────────────────────────
const CEO_EMAIL        = 'CEO@lynkapp.net';
const CEO_DISPLAY_NAME = 'LynkApp CEO';
const CEO_PHOTO_URL    = 'https://api.dicebear.com/8.x/initials/svg?seed=CEO&backgroundColor=6366f1&textColor=ffffff';
const TEMP_PASSWORD    = 'LynkApp@CEO2026!';

async function seedCEOAdmin() {
  console.log('\n🚀  LynkApp CEO Admin Seeder');
  console.log('════════════════════════════════════════');
  console.log(`📧  Email    : ${CEO_EMAIL}`);
  console.log(`👤  Name     : ${CEO_DISPLAY_NAME}`);
  console.log(`🔑  Password : ${TEMP_PASSWORD}  ← CHANGE AFTER FIRST LOGIN!`);
  console.log('════════════════════════════════════════\n');

  let uid;
  let action;

  // ── Step 1: Create or update Firebase Auth user ───────────────────────────
  try {
    const existing = await auth.getUserByEmail(CEO_EMAIL);
    uid    = existing.uid;
    action = 'updated (already existed)';
    await auth.updateUser(uid, {
      displayName:   CEO_DISPLAY_NAME,
      photoURL:      CEO_PHOTO_URL,
      password:      TEMP_PASSWORD,
      emailVerified: true,
    });
    console.log(`✅  Firebase Auth: found existing account → UID: ${uid}`);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      const newUser = await auth.createUser({
        email:         CEO_EMAIL,
        password:      TEMP_PASSWORD,
        displayName:   CEO_DISPLAY_NAME,
        photoURL:      CEO_PHOTO_URL,
        emailVerified: true,
      });
      uid    = newUser.uid;
      action = 'created fresh';
      console.log(`✅  Firebase Auth: created new account → UID: ${uid}`);
    } else {
      throw err;
    }
  }

  // ── Step 2: Write Firestore users/{uid} ───────────────────────────────────
  const userDocRef = db.collection('users').doc(uid);
  await userDocRef.set({
    uid,
    email:         CEO_EMAIL,
    displayName:   CEO_DISPLAY_NAME,
    photoURL:      CEO_PHOTO_URL,
    username:      'CEO',
    role:          'admin',
    isAdmin:       true,
    isModerator:   false,
    isVerified:    true,
    isPremium:     true,
    accountTier:   'founder',
    coinBalance:   10000,
    bio:           'LynkApp Founder & CEO',
    website:       'https://lynkapp.net',
    createdAt:     admin.firestore.FieldValue.serverTimestamp(),
    bootstrapped:  true,
    promotedAt:    admin.firestore.FieldValue.serverTimestamp(),
    onboardingComplete: true,
  }, { merge: true });
  console.log(`✅  Firestore: users/${uid} written with role: 'admin'`);

  // ── Step 3: Write audit log ───────────────────────────────────────────────
  await db.collection('adminLogs').add({
    action:    'BOOTSTRAP_CEO_ADMIN',
    targetUid: uid,
    email:     CEO_EMAIL,
    scriptRun: 'seed-ceo-admin.cjs',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`✅  Admin log written`);

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════');
  console.log('🎉  CEO Admin account ready!');
  console.log('════════════════════════════════════════');
  console.log(`\n  Account ${action}:`);
  console.log(`  UID      : ${uid}`);
  console.log(`  Email    : ${CEO_EMAIL}`);
  console.log(`  Password : ${TEMP_PASSWORD}`);
  console.log(`  Role     : admin (full access)`);
  console.log('\n  👉  Next steps:');
  console.log('  1. Go to your live app URL or http://localhost:5173/login');
  console.log(`  2. Sign in with ${CEO_EMAIL} / ${TEMP_PASSWORD}`);
  console.log('  3. Navigate to /admin → you now have full admin access');
  console.log('  4. Go to Settings → Change your password to something private!');
  console.log('\n  ⚠️  Delete serviceAccountKey.json after you are done.\n');

  process.exit(0);
}

seedCEOAdmin().catch(err => {
  console.error('\n❌  Seed script failed:', err.message);
  console.error(err);
  process.exit(1);
});
