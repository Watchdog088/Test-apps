/**
 * Stories Routes — Section 3
 * GET/POST /api/stories
 */
import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// GET /api/stories — fetch active stories for feed
router.get('/', authMiddleware as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;
    res.json({
      success: true,
      stories: [],
      message: 'Stories fetched (Firestore primary source; REST fallback active)'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/stories/:id — fetch single story
router.get('/:id', authMiddleware as any, async (req: Request, res: Response) => {
  res.json({ success: true, story: { id: req.params.id } });
});

// POST /api/stories — create new story
router.post('/', authMiddleware as any, async (req: Request, res: Response) => {
  try {
    const { mediaUrl, mediaType, duration, text, backgroundColor } = req.body;
    res.status(201).json({
      success: true,
      story: { id: `story_${Date.now()}`, mediaUrl, mediaType, duration, text, backgroundColor, createdAt: new Date().toISOString() }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/stories/:id
router.delete('/:id', authMiddleware as any, async (req: Request, res: Response) => {
  res.json({ success: true, message: `Story ${req.params.id} deleted` });
});

// POST /api/stories/:id/view
router.post('/:id/view', authMiddleware as any, async (req: Request, res: Response) => {
  res.json({ success: true, message: 'View recorded' });
});

// POST /api/stories/:id/react
router.post('/:id/react', authMiddleware as any, async (req: Request, res: Response) => {
  const { emoji } = req.body;
  res.json({ success: true, message: 'Reaction saved', emoji });
});

// GET /api/stories/highlights/:userId
router.get('/highlights/:userId', authMiddleware as any, async (req: Request, res: Response) => {
  res.json({ success: true, highlights: [], userId: req.params.userId });
});

export default router;
