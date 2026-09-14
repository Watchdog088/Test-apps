import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';

const router = express.Router();

// GET /api/v1/settings — get current user's settings
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    let settings = await prisma.userSettings.findUnique({ where: { userId } });
    if (!settings) {
      settings = await prisma.userSettings.create({ data: { userId } });
    }
    res.json({ success: true, data: { settings } });
  } catch (error) {
    logger.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/v1/settings — update settings (partial)
router.put('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const data   = req.body;

    const settings = await prisma.userSettings.upsert({
      where:  { userId },
      update: { ...data, updatedAt: new Date() },
      create: { userId, ...data },
    });

    res.json({ success: true, data: { settings } });
  } catch (error) {
    logger.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/v1/settings/account — soft-delete user account
router.delete('/account', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    await prisma.user.update({ where: { id: userId }, data: { isActive: false, deletedAt: new Date() } });
    res.json({ success: true, message: 'Account deactivated successfully' });
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
