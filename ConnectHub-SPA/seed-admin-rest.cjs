/**
 * LynkApp CEO Admin Seeder — REST API VERSION
 * ============================================
 * Uses Firebase Identity Toolkit REST API + Firestore REST API
 * NO Admin SDK  →  NO JWT  →  NO clock dependency
 * Just plain HTTPS calls with the Web API Key.
 *
 * Run: node seed-admin-rest.cjs
 */

const https = require('https');

// ── Config ─────────────────────────────────────────
const FIREBASE_API_KEY  = 'AIzaSyDmnKjhl--S69dWqaVSgCgJZcMqTsyQgwA';
const FIREBASE_PROJECT  = 'lynkapp-c7db1';
const ADMIN_EMAIL       = 'CEO@lynkapp.net';
const ADMIN_PASSWORD    = 'LynkApp@CEO2026!';
const ADMIN_DISPLAY     = 'LynkApp CEO';

// ── Tiny HTTPS helper ──────────────────────────────
function post(hostname, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function patch(hostname, path, body, idToken) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname,
      path,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': `Bearer ${idToken}`,
      },
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ── Main ───────────────────────────────────────────
async function seedAdmin() {
  console.log('\n🚀  LynkApp CEO Admin Seeder (REST API — No Clock Required)');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📧  Email    : ${ADMIN_EMAIL}`);
  console.log(`👤  Name     : ${ADMIN_DISPLAY}`);
  console.log(`🔑  Password : ${ADMIN_PASSWORD}  ← CHANGE AFTER FIRST LOGIN!`);
  console.log('═══════════════════════════════════════════════════════════\n');

  let uid, idToken;

  // ── Step 1: Try to create user ─────────────────
  console.log('Step 1: Creating Firebase Auth account...');
  const signUpRes = await post(
    'identitytoolkit.googleapis.com',
    `/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, displayName: ADMIN_DISPLAY, returnSecureToken: true }
  );

  if (signUpRes.status === 200) {
    uid     = signUpRes.body.localId;
    idToken = signUpRes.body.idToken;
    console.log(`✅  Account created!  UID: ${uid}`);
  } else if (signUpRes.body?.error?.message === 'EMAIL_EXISTS') {
    // ── Step 1b: Sign in if already exists ────────
    console.log('   Account exists — signing in...');
    const signInRes = await post(
      'identitytoolkit.googleapis.com',
      `/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, returnSecureToken: true }
    );
    if (signInRes.status !== 200) {
      const errMsg = signInRes.body?.error?.message || '';
      if (errMsg === 'INVALID_LOGIN_CREDENTIALS' || errMsg === 'INVALID_PASSWORD') {
        // ── Password mismatch — send reset email ──
        console.log('\n⚠️   Account exists but password is different.');
        console.log('   Sending password reset email to', ADMIN_EMAIL, '...');
        const resetRes = await post(
          'identitytoolkit.googleapis.com',
          `/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
          { requestType: 'PASSWORD_RESET', email: ADMIN_EMAIL }
        );
        if (resetRes.status === 200) {
          console.log('\n✅  Password reset email sent to CEO@lynkapp.net!');
          console.log('');
          console.log('══════════════════════════════════════════════════');
          console.log('  ACTION REQUIRED — Do ONE of the following:');
          console.log('══════════════════════════════════════════════════');
          console.log('');
          console.log('  OPTION A (if you have CEO@lynkapp.net email access):');
          console.log('  1. Check your CEO@lynkapp.net inbox for a reset email');
          console.log('  2. Click the link and set password to: LynkApp@CEO2026!');
          console.log('  3. Run this script again — it will sign in successfully');
          console.log('');
          console.log('  OPTION B (recommended — quickest):');
          console.log('  1. Go to: https://console.firebase.google.com/project/lynkapp-c7db1/authentication/users');
          console.log('  2. Find CEO@lynkapp.net → click the 3-dot menu → Delete');
          console.log('  3. Run this script again — it will create a fresh account');
          console.log('');
          console.log('══════════════════════════════════════════════════');
        } else {
          console.warn('⚠️   Could not send reset email:', resetRes.body?.error?.message);
          console.log('\n  MANUAL FIX REQUIRED:');
          console.log('  1. Go to: https://console.firebase.google.com/project/lynkapp-c7db1/authentication/users');
          console.log('  2. Find CEO@lynkapp.net → Delete it');
          console.log('  3. Run this script again');
        }
        process.exit(0);
      }
      console.error('❌  Sign-in failed:', errMsg || JSON.stringify(signInRes.body));
      process.exit(1);
    }
    uid     = signInRes.body.localId;
    idToken = signInRes.body.idToken;
    console.log(`✅  Signed in!  UID: ${uid}`);
  } else {
    console.error('❌  Sign-up failed:', signUpRes.body?.error?.message || JSON.stringify(signUpRes.body));
    process.exit(1);
  }

  // ── Step 2: Write Firestore user document ──────
  console.log('\nStep 2: Writing Firestore user profile...');
  const firestorePath =
    `/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/users/${uid}` +
    `?updateMask.fieldPaths=uid&updateMask.fieldPaths=email&updateMask.fieldPaths=displayName` +
    `&updateMask.fieldPaths=role&updateMask.fieldPaths=isAdmin&updateMask.fieldPaths=isPremium` +
    `&updateMask.fieldPaths=createdAt&updateMask.fieldPaths=updatedAt&updateMask.fieldPaths=username`;

  const now = new Date().toISOString();
  const firestoreBody = {
    fields: {
      uid:         { stringValue: uid },
      email:       { stringValue: ADMIN_EMAIL },
      displayName: { stringValue: ADMIN_DISPLAY },
      username:    { stringValue: 'ceo_lynkapp' },
      role:        { stringValue: 'admin' },
      isAdmin:     { booleanValue: true },
      isPremium:   { booleanValue: true },
      createdAt:   { timestampValue: now },
      updatedAt:   { timestampValue: now },
    },
  };

  const fsRes = await patch(
    'firestore.googleapis.com',
    firestorePath,
    firestoreBody,
    idToken
  );

  if (fsRes.status === 200) {
    console.log('✅  Firestore profile written!');
  } else {
    console.warn('⚠️   Firestore write returned status', fsRes.status);
    console.warn('   This is often a Firestore RULES issue — see below.');
    console.warn('   Body:', JSON.stringify(fsRes.body, null, 2));
    console.warn('\n   ➡️  FALLBACK: The Firebase Auth account WAS created.');
    console.warn('   ➡️  Log in to https://lynkapp.net with the credentials above.');
    console.warn('   ➡️  Then go to Firebase Console → Firestore → users → your UID');
    console.warn(`   ➡️  Add field: isAdmin = true (boolean), role = "admin" (string)`);
  }

  // ── Step 3: Write admins collection doc ────────
  console.log('\nStep 3: Writing admins collection entry...');
  const adminDocPath =
    `/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/admins/${uid}` +
    `?updateMask.fieldPaths=uid&updateMask.fieldPaths=email&updateMask.fieldPaths=role&updateMask.fieldPaths=grantedAt`;

  const adminBody = {
    fields: {
      uid:       { stringValue: uid },
      email:     { stringValue: ADMIN_EMAIL },
      role:      { stringValue: 'super_admin' },
      grantedAt: { timestampValue: now },
    },
  };

  const adminRes = await patch(
    'firestore.googleapis.com',
    adminDocPath,
    adminBody,
    idToken
  );

  if (adminRes.status === 200) {
    console.log('✅  Admins collection entry written!');
  } else {
    console.warn('⚠️   Admins collection write returned status', adminRes.status, '(rules may block this — that\'s OK)');
  }

  // ── Done ───────────────────────────────────────
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   🎉  CEO Admin Account Ready!                   ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║   UID      : ${uid.substring(0,20)}...          `);
  console.log(`║   Email    : ${ADMIN_EMAIL}              `);
  console.log(`║   Password : ${ADMIN_PASSWORD}      `);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║   Next steps:                                    ║');
  console.log('║   1. Go to https://lynkapp.net → Login           ║');
  console.log('║   2. Sign in with the credentials above          ║');
  console.log('║   3. Navigate to /admin                          ║');
  console.log('║   4. CHANGE YOUR PASSWORD immediately!           ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
}

seedAdmin().catch((err) => {
  console.error('\n❌  Unexpected error:', err.message || err);
  process.exit(1);
});
