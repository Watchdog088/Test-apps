/**
 * Friends — Section 9
 * Auto-generated REST route — Firestore is primary; REST is fallback/admin layer
 */
import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();


// GET /friends — list my friends
router.get('/', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, friends: [], total: 0 });
});
// POST /friends/request — send friend request
router.post('/request', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  const { targetUserId } = req.body;
  res.status(201).json({ success: true, message: 'Friend request sent', targetUserId });
});
// PUT /friends/request/:id/accept
router.put('/request/:id/accept', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, message: 'Friend request accepted' });
});
// PUT /friends/request/:id/reject
router.put('/request/:id/reject', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, message: 'Friend request rejected' });
});
// DELETE /friends/:id — unfriend
router.delete('/:id', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, message: 'Unfriended', userId: req.params.id });
});
// GET /friends/suggestions
router.get('/suggestions/list', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, suggestions: [] });
});
// GET /friends/requests/pending
router.get('/requests/pending', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, requests: [] });
});

export default router;
