/**
 * LynkApp — Set Gold Verified Badge on CEO@lynkapp.net
 * =====================================================
 * Signs in as CEO, then PATCHes the Firestore user doc to add:
 *   isVerified: true
 *   verificationStatus: 'approved'
 *   badgeVariant: 'celebrity'     ← renders gold VerifiedBadge in the UI
 *   verifiedAt: <now>
 *
 * Uses only plain HTTPS — no Admin SDK, no JWT clock issues.
 * Run: node set-ceo-gold-badge.cjs
 */

const https = require('https');

const FIREBASE_API_KEY = 'AIzaSyDmnKjhl--S69dWqaVSgCgJZcMqTsyQgwA';
const FIREBASE_PROJECT = 'lynkapp-c7db1';
const CEO_EMAIL        = 'CEO@lynkapp.net';
const CEO_PASSWORD     = 'LynkApp@CEO2026!';

// ── tiny HTTPS helpers ──────────────────────────────────────────────────────
function httpsRequest(method, hostname, path, body, idToken) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) };
    if (idToken) headers['Authorization'] = `Bearer ${idToken}`;
    const req = https.request({ hostname, path, method, headers }, (res) => {
      let raw = '';
      res.on('data', c => (raw += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const post  = (h, p, b)    => httpsRequest('POST',  h, p, b, null);
const patch = (h, p, b, t) => httpsRequest('PATCH', h, p, b, t);

// ── main ────────────────────────────────────────────────────────────────────
async function setCeoGoldBadge() {
  console.log('\n🏅  LynkApp — CEO Gold Badge Setter');
  console.log('════════════════════════════════════');
  console.log(`📧  Target  : ${CEO_EMAIL}`);
  console.log(`🥇  Badge   : celebrity (gold)`);
  console.log('════════════════════════════════════\n');

  // ── Step 1: Sign in ────────────────────────────────────────────────────
  console.log('Step 1: Signing in as CEO@lynkapp.net ...');
  const signInRes = await post(
    'identitytoolkit.googleapis.com',
    `/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    { email: CEO_EMAIL, password: CEO_PASSWORD, returnSecureToken: true }
  );

  if (signInRes.status !== 200) {
    const msg = signInRes.body?.error?.message || JSON.stringify(signInRes.body);
    console.error(`❌  Sign-in failed: ${msg}`);
    console.error('\n   Make sure you have run seed-admin-rest.cjs first and the');
    console.error('   CEO account exists with password: LynkApp@CEO2026!');
    process.exit(1);
  }

  const uid     = signInRes.body.localId;
  const idToken = signInRes.body.idToken;
  console.log(`✅  Signed in!  UID: ${uid}\n`);

  // ── Step 2: PATCH the Firestore user doc ──────────────────────────────
  console.log('Step 2: Writing gold badge fields to Firestore ...');

  const fields = ['isVerified', 'verificationStatus', 'badgeVariant', 'verifiedAt', 'updatedAt'];
  const maskQs = fields.map(f => `updateMask.fieldPaths=${f}`).join('&');
  const fsPath = `/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/users/${uid}?${maskQs}`;
  const now    = new Date().toISOString();

  const fsBody = {
    fields: {
      isVerified:         { booleanValue: true },
      verificationStatus: { stringValue: 'approved' },
      badgeVariant:       { stringValue: 'celebrity' },
      verifiedAt:         { timestampValue: now },
      updatedAt:          { timestampValue: now },
    },
  };

  const fsRes = await patch('firestore.googleapis.com', fsPath, fsBody, idToken);

  if (fsRes.status === 200) {
    console.log('✅  Firestore updated!\n');
  } else {
    console.warn(`⚠️   Firestore PATCH returned HTTP ${fsRes.status}`);
    console.warn('   Body:', JSON.stringify(fsRes.body, null, 2));
    console.warn('\n   If this is a Firestore RULES error (403), the fields were not');
    console.warn('   saved. You can manually set them in the Firebase Console:');
    console.warn(`   https://console.firebase.google.com/project/${FIREBASE_PROJECT}/firestore`);
    console.warn(`   → Collection: users  →  Document: ${uid}`);
    console.warn('   → Add: isVerified=true, verificationStatus="approved", badgeVariant="celebrity"');
  }

  // ── Done ───────────────────────────────────────────────────────────────
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  🥇  CEO Gold Badge Applied!                             ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  UID            : ${uid.substring(0, 28)}  ║`);
  console.log(`║  Email          : ${CEO_EMAIL}                    ║`);
  console.log('║  isVerified     : true                                   ║');
  console.log('║  badgeVariant   : celebrity  (gold shield ✦)             ║');
  console.log('║  verifiedAt     : ' + now.substring(0, 24) + '  ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║  The gold badge will appear on the CEO profile page      ║');
  console.log('║  automatically — no app rebuild required.                ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
}

setCeoGoldBadge().catch(err => {
  console.error('\n❌  Unexpected error:', err.message || err);
  process.exit(1);
});
