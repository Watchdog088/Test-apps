import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';
const router = express.Router();

// GET /api/v1/business/profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    let profile = await prisma.businessProfile.findUnique({ where: { userId } });
    if (!profile) profile = await prisma.businessProfile.create({ data: { userId } });
    res.json({ success: true, data: { profile } });
  } catch (error) { logger.error('Get business profile error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// PUT /api/v1/business/profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { businessName, description, category, website, phone, address } = req.body;
    const profile = await prisma.businessProfile.upsert({
      where: { userId },
      update: { businessName, description, category, website, phone, address, updatedAt: new Date() },
      create: { userId, businessName, description, category, website, phone, address },
    });
    res.json({ success: true, data: { profile } });
  } catch (error) { logger.error('Update business profile error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// GET /api/v1/business/analytics
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const profileViews = await prisma.profileView.count({ where: { profileUserId: userId } });
    const followers = await prisma.follow.count({ where: { followingId: userId } });
    res.json({ success: true, data: { profileViews, followers } });
  } catch (error) { logger.error('Business analytics error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

export default router;
