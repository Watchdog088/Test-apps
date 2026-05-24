/**
 * Help & Support — Section 24
 * Auto-generated REST route — Firestore is primary; REST is fallback/admin layer
 */
import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();


// GET /help/articles
router.get('/articles', (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, articles: [] });
});
// GET /help/articles/:id
router.get('/articles/:id', (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, article: { id: req.params.id } });
});
// GET /help/faq
router.get('/faq', (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, faq: [] });
});
// POST /help/tickets
router.post('/tickets', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  const { subject, description, category } = req.body;
  res.status(201).json({ success: true, ticket: { id: `tkt_${Date.now()}`, subject, description, category, status: 'open', createdAt: new Date().toISOString() } });
});
// GET /help/tickets
router.get('/tickets', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, tickets: [] });
});
// GET /help/tickets/:id
router.get('/tickets/:id', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, ticket: { id: req.params.id, status: 'open' } });
});
// POST /help/tickets/:id/reply
router.post('/tickets/:id/reply', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, message: 'Reply sent', ticketId: req.params.id });
});

export default router;
