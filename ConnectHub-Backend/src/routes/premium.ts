import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';
const router = express.Router();

// GET /api/v1/premium/status
router.get('/status', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const sub = await prisma.premiumSubscription.findFirst({ where: { userId, status: 'active' }, orderBy: { expiresAt: 'desc' } });
    res.json({ success: true, data: { isPremium: !!sub, subscription: sub } });
  } catch (error) { logger.error('Premium status error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// GET /api/v1/premium/plans
router.get('/plans', async (_req, res) => {
  res.json({ success: true, data: { plans: [
    { id: 'monthly', name: 'LynkApp Plus Monthly', price: 9.99, interval: 'month', features: ['No ads', 'Creator tools', 'Advanced dating', 'Priority support'] },
    { id: 'yearly',  name: 'LynkApp Plus Yearly',  price: 79.99, interval: 'year',  features: ['No ads', 'Creator tools', 'Advanced dating', 'Priority support', '2 months free'] },
  ] } });
});

export default router;
