import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';
const router = express.Router();

// GET /api/v1/monetization/earnings
router.get('/earnings', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const earnings = await prisma.creatorEarning.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
    const total = earnings.reduce((sum, e) => sum + e.amount, 0);
    res.json({ success: true, data: { earnings, total } });
  } catch (error) { logger.error('Get earnings error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// GET /api/v1/monetization/subscriptions — fans subscribed to this creator
router.get('/subscriptions', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const subs = await prisma.creatorSubscription.findMany({ where: { creatorId: userId }, include: { subscriber: { select: { id: true, username: true, avatar: true } } }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: { subscriptions: subs, count: subs.length } });
  } catch (error) { logger.error('Get subs error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// POST /api/v1/monetization/tips — send a tip to a creator
router.post('/tips', authenticate, async (req, res) => {
  try {
    const senderId = (req as any).user.id;
    const { creatorId, amount, message } = req.body;
    if (!creatorId || !amount) return res.status(400).json({ success: false, message: 'creatorId and amount required' });
    const tip = await prisma.tip.create({ data: { senderId, receiverId: creatorId, amount, message } });
    await prisma.creatorEarning.create({ data: { userId: creatorId, amount, source: 'tip', referenceId: tip.id } });
    res.status(201).json({ success: true, data: { tip } });
  } catch (error) { logger.error('Send tip error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

export default router;
