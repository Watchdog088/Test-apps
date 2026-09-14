import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';
const router = express.Router();

// GET /api/v1/creator/profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    let profile = await prisma.creatorProfile.findUnique({ where: { userId } });
    if (!profile) profile = await prisma.creatorProfile.create({ data: { userId } });
    res.json({ success: true, data: { profile } });
  } catch (error) { logger.error('Get creator profile error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// PUT /api/v1/creator/profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { bio, categories, socialLinks, portfolioUrl, rates } = req.body;
    const profile = await prisma.creatorProfile.upsert({
      where: { userId },
      update: { bio, categories, socialLinks, portfolioUrl, rates, updatedAt: new Date() },
      create: { userId, bio, categories, socialLinks, portfolioUrl, rates },
    });
    res.json({ success: true, data: { profile } });
  } catch (error) { logger.error('Update creator profile error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// GET /api/v1/creator/analytics
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const [posts, followers, totalLikes] = await Promise.all([
      prisma.post.count({ where: { authorId: userId } }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.like.count({ where: { post: { authorId: userId } } }),
    ]);
    res.json({ success: true, data: { posts, followers, totalLikes } });
  } catch (error) { logger.error('Creator analytics error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

export default router;
