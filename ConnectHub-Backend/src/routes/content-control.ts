import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';
const router = express.Router();

// POST /api/v1/content-control/block — block a user
router.post('/block', authenticate, async (req, res) => {
  try {
    const blockerId = (req as any).user.id;
    const { blockedId } = req.body;
    if (!blockedId) return res.status(400).json({ success: false, message: 'blockedId required' });
    await prisma.userBlock.upsert({ where: { blockerId_blockedId: { blockerId, blockedId } }, update: {}, create: { blockerId, blockedId } });
    res.json({ success: true, message: 'User blocked' });
  } catch (error) { logger.error('Block user error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// DELETE /api/v1/content-control/block/:id — unblock
router.delete('/block/:id', authenticate, async (req, res) => {
  try {
    const blockerId = (req as any).user.id;
    await prisma.userBlock.deleteMany({ where: { blockerId, blockedId: req.params.id } });
    res.json({ success: true, message: 'User unblocked' });
  } catch (error) { logger.error('Unblock error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// GET /api/v1/content-control/blocked — list blocked users
router.get('/blocked', authenticate, async (req, res) => {
  try {
    const blockerId = (req as any).user.id;
    const blocks = await prisma.userBlock.findMany({ where: { blockerId }, include: { blocked: { select: { id: true, username: true, avatar: true } } } });
    res.json({ success: true, data: { blockedUsers: blocks.map(b => b.blocked) } });
  } catch (error) { logger.error('Get blocked error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// POST /api/v1/content-control/mute — mute a user (hide from feed without blocking)
router.post('/mute', authenticate, async (req, res) => {
  try {
    const muterId = (req as any).user.id;
    const { mutedId } = req.body;
    if (!mutedId) return res.status(400).json({ success: false, message: 'mutedId required' });
    await prisma.userMute.upsert({ where: { muterId_mutedId: { muterId, mutedId } }, update: {}, create: { muterId, mutedId } });
    res.json({ success: true, message: 'User muted' });
  } catch (error) { logger.error('Mute user error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

export default router;
