import express from 'express';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';
const router = express.Router();

const CANNED: Record<string, string> = {
  hello: 'Hey there! How can LynkApp help you today?',
  hi:    'Hey there! How can LynkApp help you today?',
  reset: 'To reset your password go to Settings → Security → Change Password.',
  premium: 'LynkApp Plus starts at $9.99/month. Head to the Premium tab to subscribe!',
  creator: 'To become a creator, visit your Profile and tap "Become a Creator".',
  delete: 'To delete your account go to Settings → Account → Delete Account.',
  report: 'To report a user, tap the ⋯ menu on their profile and select "Report".',
};

// POST /api/v1/chatbot/message
router.post('/message', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'message required' });
    const key = Object.keys(CANNED).find(k => message.toLowerCase().includes(k));
    const reply = key
      ? CANNED[key]
      : 'I didn\'t quite catch that. Try asking about "reset", "premium", "creator", or "report".';
    res.json({ success: true, data: { reply, source: key ? 'canned' : 'fallback' } });
  } catch (error) { logger.error('Chatbot error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

export default router;
