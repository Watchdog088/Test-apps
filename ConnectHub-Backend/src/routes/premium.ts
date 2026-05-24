/**
 * Premium — Section 23
 * Auto-generated REST route — Firestore is primary; REST is fallback/admin layer
 */
import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();


// GET /premium/plans
router.get('/plans', (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, plans: [
    { id: 'basic', name: 'LynkPlus', price: 4.99, interval: 'month', features: ['Ad-free', 'Custom themes'] },
    { id: 'pro', name: 'LynkPro', price: 9.99, interval: 'month', features: ['Everything in Plus', 'Analytics', 'Creator tools'] },
    { id: 'creator', name: 'LynkCreator', price: 19.99, interval: 'month', features: ['Everything in Pro', 'Monetization', 'Priority support'] }
  ]});
});
// GET /premium/status
router.get('/status', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, premium: { active: false, plan: null, expiresAt: null } });
});
// POST /premium/subscribe
router.post('/subscribe', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  const { planId, paymentMethodId } = req.body;
  res.status(201).json({ success: true, message: 'Subscription created (Stripe integration required)', planId });
});
// DELETE /premium/cancel
router.delete('/cancel', authMiddleware as any, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, message: 'Subscription cancelled' });
});

export default router;
