import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';
const router = express.Router();

// GET /api/v1/media — list media items for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const type   = (req.query.type as string) || undefined; // image|video|audio
    const page   = parseInt(req.query.page as string) || 1;
    const limit  = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip   = (page - 1) * limit;
    const where: any = { userId };
    if (type) where.type = type;
    const [items, total] = await Promise.all([
      prisma.mediaItem.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.mediaItem.count({ where }),
    ]);
    res.json({ success: true, data: { items, total, page, totalPages: Math.ceil(total / limit) } });
  } catch (error) { logger.error('Get media error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// DELETE /api/v1/media/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    await prisma.mediaItem.deleteMany({ where: { id: req.params.id, userId } });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { logger.error('Delete media error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

export default router;
