/**
 * auth-extensions.ts
 * Additional auth endpoints mounted on /api/v1/auth by server.ts:
 *  POST  /auth/refresh-token   — JWT refresh without hard-logout
 *  POST  /auth/verify-email    — mark email as verified (App Store requirement)
 *  POST  /auth/google          — Google OAuth Firebase-UID → Prisma sync
 *  POST  /auth/apple           — Apple Sign-In Firebase-UID → Prisma sync
 *  DELETE /auth/account        — GDPR / App Store in-app account deletion
 *
 * Mount AFTER the main authRoutes in server.ts:
 *   import authExtRoutes from './routes/auth-extensions';
 *   app.use(`${V1}/auth`, authExtRoutes);
 */

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { authMiddleware as _authMiddleware } from '../middleware/auth.middleware';
// Cast to `any` to silence the AuthRequest ↔ Request type mismatch (same pattern as server.ts)
const authMiddleware = _authMiddleware as any;

const router = Router();

const JWT_SECRET         = process.env.JWT_SECRET          || 'changeme';
const REFRESH_SECRET     = process.env.REFRESH_TOKEN_SECRET || 'refresh-changeme';
const ACCESS_EXPIRES_IN  = '7d';
const REFRESH_EXPIRES_IN = '30d';

// ── POST /auth/refresh-token ───────────────────────────────────────
// Exchange a valid refresh token for a new access token + new refresh token.
// Prevents users from being hard-logged-out after 7 days.
router.post('/refresh-token', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'refreshToken required' });
    }

    let payload: any;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const user = await prisma.user.findUnique({
      where:  { id: payload.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or deactivated' });
    }

    const newAccess  = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET,     { expiresIn: ACCESS_EXPIRES_IN  });
    const newRefresh = jwt.sign({ userId: user.id },                                    REFRESH_SECRET,  { expiresIn: REFRESH_EXPIRES_IN });

    return res.json({ accessToken: newAccess, refreshToken: newRefresh, expiresIn: ACCESS_EXPIRES_IN });
  } catch (err: any) {
    console.error('[auth/refresh-token]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /auth/verify-email ────────────────────────────────────────
// Called by the frontend after the user clicks the Firebase email-verification
// link. Marks the user's emailVerified flag in Prisma so the app knows.
// Apple & Google review require email verification proof.
router.post('/verify-email', authMiddleware, async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user?.uid || (req as any).user?.id;
    if (!uid) return res.status(401).json({ error: 'Unauthorised' });

    // Update Prisma user record
    await prisma.user.updateMany({
      where: { OR: [{ id: uid }, { firebaseUid: uid }] },
      data:  { emailVerified: true, updatedAt: new Date() },
    });

    return res.json({ success: true, message: 'Email verified' });
  } catch (err: any) {
    console.error('[auth/verify-email]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /auth/google ──────────────────────────────────────────────
// Called after Google Sign-In on the client. Receives the Firebase ID token,
// upserts the user in Prisma so they appear in the database.
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { firebaseUid, email, displayName, photoURL, idToken } = req.body;
    if (!firebaseUid || !email) {
      return res.status(400).json({ error: 'firebaseUid and email are required' });
    }

    // Upsert user — create if new, update last-login if existing
    const user = await (prisma.user as any).upsert({
      where:  { firebaseUid },
      update: {
        email,
        avatar:    photoURL    || undefined,
        updatedAt: new Date(),
        emailVerified: true,
      },
      create: {
        firebaseUid,
        email,
        username:  email.split('@')[0].replace(/[^a-z0-9_]/gi, '').toLowerCase() + '_' + Math.random().toString(36).slice(2, 6),
        firstName: displayName?.split(' ')[0] || '',
        lastName:  displayName?.split(' ').slice(1).join(' ') || '',
        avatar:    photoURL || null,
        authProvider: 'google',
        emailVerified: true,
        isActive:   true,
        role:       'user',
      },
      select: { id: true, email: true, username: true, role: true },
    });

    const accessToken  = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET,    { expiresIn: ACCESS_EXPIRES_IN  });
    const refreshToken = jwt.sign({ userId: user.id },                                    REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

    return res.json({ user, accessToken, refreshToken });
  } catch (err: any) {
    console.error('[auth/google]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /auth/apple ───────────────────────────────────────────────
// Mirrors /auth/google but for Apple Sign-In.
// Apple does NOT always return the user's name after the first sign-in.
router.post('/apple', async (req: Request, res: Response) => {
  try {
    const { firebaseUid, email, fullName } = req.body;
    if (!firebaseUid) {
      return res.status(400).json({ error: 'firebaseUid is required' });
    }

    const resolvedEmail = email || `${firebaseUid}@private.apple.com`;

    const user = await (prisma.user as any).upsert({
      where:  { firebaseUid },
      update: { updatedAt: new Date(), emailVerified: true },
      create: {
        firebaseUid,
        email:      resolvedEmail,
        username:   'user_' + Math.random().toString(36).slice(2, 10),
        firstName:  fullName?.givenName  || '',
        lastName:   fullName?.familyName || '',
        authProvider: 'apple',
        emailVerified: true,
        isActive:   true,
        role:       'user',
      },
      select: { id: true, email: true, username: true, role: true },
    });

    const accessToken  = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET,    { expiresIn: ACCESS_EXPIRES_IN  });
    const refreshToken = jwt.sign({ userId: user.id },                                    REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

    return res.json({ user, accessToken, refreshToken });
  } catch (err: any) {
    console.error('[auth/apple]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── DELETE /auth/account ───────────────────────────────────────────
// ⚠️  APPLE & GOOGLE PLAY REQUIREMENT — without this the app will be rejected.
// Permanently deletes the authenticated user's account and all their data.
// Also deletes from Firebase Auth via the Admin SDK if configured.
router.delete('/account', authMiddleware, async (req: Request, res: Response) => {
  try {
    const uid = (req as any).user?.uid || (req as any).user?.id;
    if (!uid) return res.status(401).json({ error: 'Unauthorised' });

    // Find user by Firebase UID or Prisma ID
    const user = await (prisma.user as any).findFirst({
      where: { OR: [{ id: uid }, { firebaseUid: uid }] },
      select: { id: true, firebaseUid: true, email: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const prismaId = user.id;

    // 1. Delete posts, comments, engagements, messages (cascade usually handles this
    //    but we do explicit deletes for safety)
    await prisma.postEngagement.deleteMany({ where: { userId: prismaId } }).catch(() => {});
    await (prisma.comment as any).deleteMany({ where: { userId: prismaId } }).catch(() => {});
    await prisma.post.deleteMany({ where: { userId: prismaId } }).catch(() => {});

    // 2. Delete followers / following
    await (prisma.follow as any).deleteMany({
      where: { OR: [{ followerId: prismaId }, { followingId: prismaId }] },
    }).catch(() => {});

    // 3. Delete the Prisma user record (cascade handles remaining relations)
    await prisma.user.delete({ where: { id: prismaId } });

    // 4. Delete from Firebase Auth (requires Admin SDK — best-effort)
    try {
      const admin = require('firebase-admin');
      if (admin.apps.length && user.firebaseUid) {
        await admin.auth().deleteUser(user.firebaseUid);
      }
    } catch (_) {
      // Non-fatal: Firebase delete may fail if already deleted or SDK not configured
    }

    console.log(`[auth/delete-account] Account deleted: ${prismaId} (firebase: ${user.firebaseUid})`);

    return res.json({ success: true, message: 'Account permanently deleted' });
  } catch (err: any) {
    console.error('[auth/delete-account]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
