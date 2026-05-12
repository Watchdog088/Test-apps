/**
 * kyc.ts
 * ConnectHub Backend — KYC Verification Admin Route
 * Routes:
 *   POST   /v1/kyc/verify        (admin only) — set id_verified: true on a user
 *   POST   /v1/kyc/revoke        (admin only) — set id_verified: false on a user
 *   GET    /v1/kyc/status/:uid   (admin only) — read KYC status for a user
 *   GET    /v1/kyc/pending       (admin only) — list all pending KYC submissions
 *   POST   /v1/kyc/submit        (authenticated user) — submit KYC docs for review
 *
 * How id_verified works:
 *   1. User submits docs via POST /v1/kyc/submit
 *   2. Admin reviews (Stripe Identity / Persona / manual) and calls POST /v1/kyc/verify
 *   3. Backend sets users/{uid}.id_verified = true in Firestore
 *   4. checkSellerBadge() in marketplace-backend-service.js reads this flag
 *   5. The ✅ Verified badge appears on seller cards and listing detail pages
 */

import { Router, Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

const router = Router();

// ─── Lazy-init Firebase Admin ────────────────────────────────────────────────
function getDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    });
  }
  return admin.firestore();
}

// ─── Middleware: require admin claim ─────────────────────────────────────────
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded.admin) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }
    (req as any).adminUid = decoded.uid;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── Middleware: require authenticated user ───────────────────────────────────
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    (req as any).user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── POST /v1/kyc/verify — admin grants KYC badge ───────────────────────────
router.post('/verify', requireAdmin, async (req: Request, res: Response) => {
  const { uid, note = '' } = req.body;
  if (!uid) return res.status(400).json({ error: 'uid is required' });

  try {
    const db = getDb();
    await db.collection('users').doc(uid).set(
      {
        id_verified: true,
        kycVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        kycVerifiedBy: (req as any).adminUid,
        kycNote: note,
        kycStatus: 'approved',
      },
      { merge: true }
    );
    console.log(`[KYC] Admin ${(req as any).adminUid} verified user ${uid}`);
    return res.json({ success: true, uid, id_verified: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /v1/kyc/revoke — admin revokes KYC badge ──────────────────────────
router.post('/revoke', requireAdmin, async (req: Request, res: Response) => {
  const { uid, reason = '' } = req.body;
  if (!uid) return res.status(400).json({ error: 'uid is required' });

  try {
    const db = getDb();
    await db.collection('users').doc(uid).set(
      {
        id_verified: false,
        kycRevokedAt: admin.firestore.FieldValue.serverTimestamp(),
        kycRevokedBy: (req as any).adminUid,
        kycRevokeReason: reason,
        kycStatus: 'revoked',
      },
      { merge: true }
    );
    return res.json({ success: true, uid, id_verified: false });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /v1/kyc/status/:uid — admin reads KYC status ───────────────────────
router.get('/status/:uid', requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const doc = await db.collection('users').doc(req.params.uid).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    const data = doc.data() || {};
    return res.json({
      uid: req.params.uid,
      id_verified: data.id_verified ?? false,
      kycStatus: data.kycStatus ?? 'none',
      kycVerifiedAt: data.kycVerifiedAt ?? null,
      kycSubmittedAt: data.kycSubmittedAt ?? null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /v1/kyc/pending — admin lists pending submissions ───────────────────
router.get('/pending', requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const snap = await db
      .collection('users')
      .where('kycStatus', '==', 'pending')
      .orderBy('kycSubmittedAt', 'desc')
      .limit(50)
      .get();

    const pending = snap.docs.map(d => ({
      uid: d.id,
      displayName: d.data().displayName,
      email: d.data().email,
      kycSubmittedAt: d.data().kycSubmittedAt,
      kycDocType: d.data().kycDocType,
    }));
    return res.json({ count: pending.length, users: pending });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /v1/kyc/submit — user submits KYC for review ───────────────────────
// In production, replace docUrl with a Stripe Identity session or Persona inquiry
router.post('/submit', requireAuth, async (req: Request, res: Response) => {
  const { docType, docUrl } = req.body;
  const uid = (req as any).user.uid;

  if (!docType || !docUrl) {
    return res.status(400).json({ error: 'docType and docUrl are required' });
  }
  const allowedDocTypes = ['passport', 'drivers_license', 'national_id', 'residence_permit'];
  if (!allowedDocTypes.includes(docType)) {
    return res.status(400).json({ error: `docType must be one of: ${allowedDocTypes.join(', ')}` });
  }

  try {
    const db = getDb();
    await db.collection('users').doc(uid).set(
      {
        kycStatus: 'pending',
        kycDocType: docType,
        kycDocUrl: docUrl,
        kycSubmittedAt: admin.firestore.FieldValue.serverTimestamp(),
        id_verified: false,
      },
      { merge: true }
    );

    // Also write to kyc_submissions collection for admin queue
    await db.collection('kyc_submissions').add({
      uid,
      docType,
      docUrl,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
    });

    return res.json({
      success: true,
      message: 'KYC submission received. You will be notified once verified.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
