/**
 * set-admin-role.js — LynkApp Admin Role Management
 *
 * SAFE method: Uses Firebase Admin SDK (server-side only).
 * Regular users CANNOT call this — it is protected by Firebase Auth token verification.
 *
 * Callable Cloud Functions:
 *  - setAdminRole(targetUid)        → promotes a user to admin   (only existing admins can call)
 *  - removeAdminRole(targetUid)     → demotes a user from admin  (only existing admins can call)
 *  - checkAdminStatus()             → returns the caller's own role
 *
 * One-time seed script at the bottom:
 *  - makeFirstAdmin(email)          → HTTP function; secured by a secret token in env config
 *                                     Use ONCE to bootstrap your very first admin account.
 */

const functions = require('firebase-functions');
const admin     = require('firebase-admin');

if (!admin.apps.length) admin.initializeApp();
const db   = admin.firestore();
const auth = admin.auth();

// ─────────────────────────────────────────────────────────────────────────────
// Helper: verify the caller is already an admin
// ─────────────────────────────────────────────────────────────────────────────
async function callerIsAdmin(context) {
  if (!context.auth) return false;
  try {
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    return userDoc.exists && userDoc.data().role === 'admin';
  } catch (e) {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CALLABLE: setAdminRole
// Usage (from app): firebase.functions().httpsCallable('setAdminRole')({ targetUid: 'abc123' })
// ─────────────────────────────────────────────────────────────────────────────
exports.setAdminRole = functions.https.onCall(async (data, context) => {
  // 1. Must be signed in
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be signed in.');
  }

  // 2. Caller must already be an admin
  const adminCheck = await callerIsAdmin(context);
  if (!adminCheck) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only existing admins can promote users.'
    );
  }

  const { targetUid } = data;
  if (!targetUid || typeof targetUid !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'targetUid is required.');
  }

  // 3. Make sure target user exists
  try {
    await auth.getUser(targetUid);
  } catch (e) {
    throw new functions.https.HttpsError('not-found', `User ${targetUid} not found in Firebase Auth.`);
  }

  // 4. Set role: 'admin' in Firestore (Admin SDK bypasses Firestore security rules)
  await db.collection('users').doc(targetUid).set(
    { role: 'admin', isAdmin: true, promotedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );

  // 5. Log the action
  await db.collection('adminLogs').add({
    action:      'PROMOTE_TO_ADMIN',
    performedBy: context.auth.uid,
    targetUid,
    timestamp:   admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`[setAdminRole] ${context.auth.uid} promoted ${targetUid} to admin`);
  return { success: true, message: `User ${targetUid} is now an admin.` };
});

// ─────────────────────────────────────────────────────────────────────────────
// CALLABLE: removeAdminRole
// ─────────────────────────────────────────────────────────────────────────────
exports.removeAdminRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be signed in.');
  }

  const adminCheck = await callerIsAdmin(context);
  if (!adminCheck) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can demote users.');
  }

  const { targetUid } = data;
  if (!targetUid || typeof targetUid !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'targetUid is required.');
  }

  // Prevent self-demotion (safety guard)
  if (targetUid === context.auth.uid) {
    throw new functions.https.HttpsError('failed-precondition', 'You cannot remove your own admin role.');
  }

  await db.collection('users').doc(targetUid).set(
    { role: 'user', isAdmin: false, demotedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );

  await db.collection('adminLogs').add({
    action:      'DEMOTE_FROM_ADMIN',
    performedBy: context.auth.uid,
    targetUid,
    timestamp:   admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`[removeAdminRole] ${context.auth.uid} demoted ${targetUid} from admin`);
  return { success: true, message: `User ${targetUid} has been demoted to regular user.` };
});

// ─────────────────────────────────────────────────────────────────────────────
// CALLABLE: checkAdminStatus
// ─────────────────────────────────────────────────────────────────────────────
exports.checkAdminStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be signed in.');
  }
  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  const role = userDoc.exists ? (userDoc.data().role || 'user') : 'user';
  return { uid: context.auth.uid, role, isAdmin: role === 'admin' };
});

// ─────────────────────────────────────────────────────────────────────────────
// HTTP FUNCTION: makeFirstAdmin  ← ONE-TIME BOOTSTRAP ONLY
//
// Secured by a secret token you set in Firebase environment config:
//   firebase functions:config:set admin.bootstrap_token="YOUR_SECRET_HERE"
//
// Call via curl (replace values):
//   curl -X POST \
//     "https://us-central1-YOUR_PROJECT.cloudfunctions.net/makeFirstAdmin" \
//     -H "Content-Type: application/json" \
//     -d '{"email":"you@example.com","bootstrapToken":"YOUR_SECRET_HERE"}'
//
// After you have your first admin, disable or delete this function!
// ─────────────────────────────────────────────────────────────────────────────
exports.makeFirstAdmin = functions.https.onRequest(async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { email, bootstrapToken } = req.body;

  // Validate bootstrap secret
  const expectedToken = functions.config().admin?.bootstrap_token;
  if (!expectedToken || bootstrapToken !== expectedToken) {
    console.warn('[makeFirstAdmin] Unauthorized attempt with token:', bootstrapToken);
    return res.status(403).json({ error: 'Invalid bootstrap token.' });
  }

  if (!email) {
    return res.status(400).json({ error: 'email is required.' });
  }

  try {
    // Look up the user by email in Firebase Auth
    const userRecord = await auth.getUserByEmail(email);
    const uid = userRecord.uid;

    // Check if there's already an admin (prevent re-use of bootstrap after setup)
    const existingAdmins = await db.collection('users')
      .where('role', '==', 'admin')
      .limit(1)
      .get();

    if (!existingAdmins.empty) {
      return res.status(409).json({
        error: 'An admin already exists. Use setAdminRole from the admin dashboard instead.',
      });
    }

    // Grant admin role
    await db.collection('users').doc(uid).set(
      {
        role:         'admin',
        isAdmin:      true,
        bootstrapped: true,
        promotedAt:   admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await db.collection('adminLogs').add({
      action:    'BOOTSTRAP_FIRST_ADMIN',
      targetUid: uid,
      email,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[makeFirstAdmin] Successfully bootstrapped admin: ${email} (${uid})`);
    return res.status(200).json({
      success: true,
      message: `${email} is now the first admin. DISABLE this function now!`,
      uid,
    });
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      return res.status(404).json({ error: `No user found with email: ${email}. Make sure they signed up first.` });
    }
    console.error('[makeFirstAdmin] Error:', err);
    return res.status(500).json({ error: err.message });
  }
});
