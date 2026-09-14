import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';
const router = express.Router();

// GET /api/v1/arvr/filters — list available AR filters/effects
router.get('/filters', async (_req, res) => {
  res.json({ success: true, data: { filters: [
    { id: 'beauty', name: 'Beauty', category: 'face', thumbnailUrl: '/assets/ar/beauty.jpg' },
    { id: 'neon',   name: 'Neon Glow', category: 'effects', thumbnailUrl: '/assets/ar/neon.jpg' },
    { id: 'bg_blur', name: 'Background Blur', category: 'background', thumbnailUrl: '/assets/ar/bg_blur.jpg' },
    { id: 'vr_space', name: 'VR Space', category: 'vr', thumbnailUrl: '/assets/ar/vr_space.jpg' },
  ] } });
});

// POST /api/v1/arvr/sessions — record AR/VR session usage
router.post('/sessions', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { filterId, durationSeconds, mode } = req.body;
    const session = await prisma.arVrSession.create({ data: { userId, filterId: filterId || 'none', durationSeconds: durationSeconds || 0, mode: mode || 'ar' } });
    res.status(201).json({ success: true, data: { session } });
  } catch (error) { logger.error('AR/VR session error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

export default router;
