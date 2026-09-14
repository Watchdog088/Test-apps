import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';
const router = express.Router();

// GET /api/v1/help/faq
router.get('/faq', async (_req, res) => {
  res.json({ success: true, data: { faqs: [
    { id: '1', question: 'How do I reset my password?', answer: 'Go to Settings > Security > Change Password.' },
    { id: '2', question: 'How do I become a creator?', answer: 'Go to your profile and tap "Become a Creator".' },
    { id: '3', question: 'How does the dating feature work?', answer: 'Swipe right to like, left to pass. Matches can message each other.' },
    { id: '4', question: 'How do I cancel premium?', answer: 'Go to Settings > Premium > Cancel Subscription.' },
  ] } });
});

// POST /api/v1/help/tickets
router.post('/tickets', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { subject, description, category } = req.body;
    if (!subject || !description) return res.status(400).json({ success: false, message: 'subject and description required' });
    const ticket = await prisma.supportTicket.create({ data: { userId, subject, description, category: category || 'general', status: 'open' } });
    res.status(201).json({ success: true, data: { ticket } });
  } catch (error) { logger.error('Create ticket error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

// GET /api/v1/help/tickets — user's own tickets
router.get('/tickets', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const tickets = await prisma.supportTicket.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: { tickets } });
  } catch (error) { logger.error('Get tickets error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

export default router;
