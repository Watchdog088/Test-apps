/**
 * AR/VR — Section 20
 * Auto-generated REST route — Firestore is primary; REST is fallback/admin layer
 */
import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();


// GET /arvr/filters
router.get('/filters', (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, filters: [] });
});
// GET /arvr/experiences
router.get('/experiences', (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, experiences: [] });
});
// POST /arvr/session
router.post('/session', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.status(201).json({ success: true, session: { id: `ar_${Date.now()}`, ...req.body } });
});
// GET /arvr/assets
router.get('/assets', (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, assets: [] });
});

export default router;
