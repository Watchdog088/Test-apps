import express from 'express';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';
const router = express.Router();

// GET /api/v1/enterprise/plans
router.get('/plans', async (_req, res) => {
  res.json({ success: true, data: { plans: [
    { id: 'team',       name: 'Team',       seats: 10,  pricePerSeat: 4.99,  features: ['Team workspaces', 'Admin dashboard', 'Priority support'] },
    { id: 'business',   name: 'Business',   seats: 50,  pricePerSeat: 3.99,  features: ['All Team features', 'Analytics', 'Custom branding'] },
    { id: 'enterprise', name: 'Enterprise', seats: 999, pricePerSeat: 2.99,  features: ['All Business features', 'SSO', 'SLA guarantee', 'Dedicated CSM'] },
  ] } });
});

// POST /api/v1/enterprise/inquire — sales inquiry
router.post('/inquire', authenticate, async (req, res) => {
  try {
    const { companyName, email, seats, message } = req.body;
    if (!companyName || !email) return res.status(400).json({ success: false, message: 'companyName and email required' });
    // In production this would email the sales team and create a CRM record
    logger.info(`Enterprise inquiry from ${companyName} (${email}), seats: ${seats}, message: ${message}`);
    res.status(201).json({ success: true, message: 'Inquiry received. Our sales team will contact you within 24 hours.' });
  } catch (error) { logger.error('Enterprise inquiry error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

export default router;
