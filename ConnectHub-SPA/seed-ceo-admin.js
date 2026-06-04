/**
 * seed-ceo-admin.js — LynkApp First Admin Account Seeder
 * ─────────────────────────────────────────────────────────
 * Creates the CEO / owner admin account for CEO@lynkapp.net
 * using the Firebase Admin SDK (bypasses Firestore security rules safely).
 *
 * WHAT THIS SCRIPT DOES:
 *   1. Creates (or updates) Firebase Auth user: CEO@lynkapp.net
 *   2. Sets a temporary initial password (shown in output — change after login!)
 *   3. Writes the Firestore users/{uid} document with:
 *        role: 'admin', isAdmin: true, displayName: 'LynkApp CEO'
 *   4. Writes an adminLogs entry recording the bootstrap
 *
 * REQUIREMENTS (run once, before executing):
 *   1. Download your Firebase service account key JSON:
 *      Firebase Console → Project Settings → Service Accounts → Generate new private key
 *      Save as:  ConnectHub-SPA/serviceAccountKey.json
 *
 *   2. Install the Admin SDK (if not already):
 *      cd ConnectHub-SPA/functions && npm install
 *      (firebase-admin is already in functions/package.json)
 *
 * HOW TO RUN:
 *   Double-click run-ceo-admin.bat   ← EASIEST
 *   — OR —
 *   cd ConnectHub-SPA && node seed-ceo-admin.js
 */

const path    = require('path');
const fs      = require('fs');

// ── Load service account key ──────────────────────────────────────────────────
const keyPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
  console.error('\n❌  ERROR: serviceAccountKey.json not found!');
  console.error('');
  console.error('   Please download your Firebase service account key:');
  console.error('   1. Go to https://console.firebase.google.com');
  console.error('   2. Select your project → ⚙️ Project Settings → Service Accounts');
  console.error('   3. Click "Generate new private key" → save the file as:');
  console.error('       ConnectHub-SPA/serviceAccountKey.json');
  console.error('   4. Re-run this script.\n');
  process.exit(1);
}

const serviceAccount = require(keyPath);
const admin          = require('./functions/node_modules/firebase-admin');

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
// ⚠️  CHANGE THIS PASSWORD after your first login!
const TEMP_PASSWORD    = 'LynkApp@CEO2026!';

// ─────────────────────────────────────────────────────────────────────────────
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

    // Update display name, photo, and reset password
    await auth.updateUser(uid, {
      displayName:   CEO_DISPLAY_NAME,
      photoURL:      CEO_PHOTO_URL,
      password:      TEMP_PASSWORD,
      emailVerified: true,   // skip email verification for the owner account
    });
    console.log(`✅  Firebase Auth: found existing account → UID: ${uid}`);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      // Create new account
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

  // ── Step 2: Write Firestore users/{uid} with admin role ───────────────────
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
    coinBalance:   10000,           // bonus founder coins
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
    scriptRun: 'seed-ceo-admin.js',
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
  console.log('  1. Go to http://localhost:5173/login  (or your live URL)');
  console.log(`  2. Sign in with ${CEO_EMAIL} / ${TEMP_PASSWORD}`);
  console.log('  3. Navigate to /admin → you now have full admin access');
  console.log('  4. Go to Settings → Change your password to something private!');
  console.log('\n  ⚠️  Delete or rename serviceAccountKey.json after you are done.');
  console.log('      Never commit it to Git — it grants full Firebase access.\n');

  process.exit(0);
}

seedCEOAdmin().catch(err => {
  console.error('\n❌  Seed script failed:', err.message);
  console.error(err);
  process.exit(1);
});
