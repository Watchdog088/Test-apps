import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';
const router = express.Router();

// GET /api/v1/gaming/leaderboard
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const entries = await prisma.gamingScore.findMany({ orderBy: { score: 'desc' }, take: 50, include: { user: { select: { id: true, username: true, avatar: true } } } });
    res.json({ success: true, data: { leaderboard: entries } });
  } catch (error) { logger.error('Gaming leaderboard error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// POST /api/v1/gaming/scores
router.post('/scores', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { gameId, score, metadata } = req.body;
    if (!gameId || score === undefined) return res.status(400).json({ success: false, message: 'gameId and score required' });
    const entry = await prisma.gamingScore.create({ data: { userId, gameId, score, metadata } });
    res.status(201).json({ success: true, data: { entry } });
  } catch (error) { logger.error('Submit score error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// GET /api/v1/gaming/achievements
router.get('/achievements', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const achievements = await prisma.userAchievement.findMany({ where: { userId }, orderBy: { unlockedAt: 'desc' } });
    res.json({ success: true, data: { achievements } });
  } catch (error) { logger.error('Get achievements error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

export default router;
