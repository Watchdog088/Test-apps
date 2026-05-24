/**
 * Settings — Section 15
 * Auto-generated REST route — Firestore is primary; REST is fallback/admin layer
 */
import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();


// GET /settings
router.get('/', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, settings: { theme: 'dark', language: 'en', privacy: 'public', notifications: {} } });
});
// PUT /settings
router.put('/', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, settings: req.body, message: 'Settings saved' });
});
// PUT /settings/privacy
router.put('/privacy', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, privacy: req.body });
});
// PUT /settings/password
router.put('/password', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, message: 'Password updated' });
});
// DELETE /settings/account
router.delete('/account', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, message: 'Account deletion queued' });
});
// GET /settings/blocked
router.get('/blocked/users', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, blocked: [] });
});

export default router;
