import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';

const router = express.Router();

// GET /api/v1/calls/history — paginated call history
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const page   = parseInt(req.query.page as string) || 1;
    const limit  = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip   = (page - 1) * limit;

    const [calls, total] = await Promise.all([
      prisma.videoCall.findMany({
        where: { OR: [{ callerId: userId }, { calleeId: userId }] },
        include: {
          caller: { select: { id: true, username: true, avatar: true } },
          callee: { select: { id: true, username: true, avatar: true } },
        },
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.videoCall.count({ where: { OR: [{ callerId: userId }, { calleeId: userId }] } }),
    ]);

    res.json({ success: true, data: { calls, total, page, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    logger.error('Call history error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/v1/calls — initiate a call record
router.post('/', authenticate, async (req, res) => {
  try {
    const callerId = (req as any).user.id;
    const { calleeId, type } = req.body; // type: 'video' | 'audio'

    if (!calleeId) return res.status(400).json({ success: false, message: 'calleeId required' });

    const call = await prisma.videoCall.create({
      data: { callerId, calleeId, type: type || 'video', status: 'initiated', startedAt: new Date() },
    });

    res.status(201).json({ success: true, data: { call } });
  } catch (error) {
    logger.error('Create call error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PATCH /api/v1/calls/:callId — update call status (answered, ended, missed)
router.patch('/:callId', authenticate, async (req, res) => {
  try {
    const { callId } = req.params;
    const { status, endedAt, durationSeconds } = req.body;

    const call = await prisma.videoCall.update({
      where: { id: callId },
      data: { status, endedAt: endedAt ? new Date(endedAt) : undefined, durationSeconds },
    });

    res.json({ success: true, data: { call } });
  } catch (error) {
    logger.error('Update call error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
