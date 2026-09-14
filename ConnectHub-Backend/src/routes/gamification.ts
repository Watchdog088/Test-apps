import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';
const router = express.Router();

// GET /api/v1/gamification/points
router.get('/points', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const record = await prisma.userPoints.findUnique({ where: { userId } });
    res.json({ success: true, data: { points: record?.points ?? 0, level: record?.level ?? 1 } });
  } catch (error) { logger.error('Get points error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// POST /api/v1/gamification/points/award (internal/admin)
router.post('/points/award', authenticate, async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    if (!userId || !points) return res.status(400).json({ success: false, message: 'userId and points required' });
    const updated = await prisma.userPoints.upsert({
      where: { userId },
      update: { points: { increment: points } },
      create: { userId, points, level: 1 },
    });
    await prisma.pointTransaction.create({ data: { userId, points, reason: reason || 'award', balanceAfter: updated.points } });
    res.json({ success: true, data: { record: updated } });
  } catch (error) { logger.error('Award points error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// GET /api/v1/gamification/badges
router.get('/badges', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const badges = await prisma.userBadge.findMany({ where: { userId }, orderBy: { awardedAt: 'desc' } });
    res.json({ success: true, data: { badges } });
  } catch (error) { logger.error('Get badges error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

export default router;
