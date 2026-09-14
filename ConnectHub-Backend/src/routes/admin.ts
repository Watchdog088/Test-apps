import express from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';

const router = express.Router();

// Require admin role middleware
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// GET /api/v1/admin/stats — dashboard overview
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const [users, posts, reports, streams] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.post.count(),
      prisma.report.count({ where: { status: 'pending' } }),
      prisma.stream.count({ where: { status: 'live' } }),
    ]);
    const newUsersToday = await prisma.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 86400000) } },
    });
    res.json({ success: true, data: { users, posts, pendingReports: reports, liveStreams: streams, newUsersToday } });
  } catch (error) {
    logger.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/v1/admin/users — paginated user list
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const page  = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const q     = (req.query.q as string) || '';
    const skip  = (page - 1) * limit;

    const where: any = {};
    if (q) {
      where.OR = [
        { username: { contains: q, mode: 'insensitive' } },
        { email:    { contains: q, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, username: true, email: true, role: true, isActive: true, isVerified: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data: { users, total, page, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    logger.error('Admin list users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PATCH /api/v1/admin/users/:userId — ban/unban or change role
router.patch('/users/:userId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, role } = req.body;

    const data: any = {};
    if (typeof isActive === 'boolean') data.isActive = isActive;
    if (role && ['user', 'admin', 'moderator'].includes(role)) data.role = role;

    const updated = await prisma.user.update({ where: { id: userId }, data, select: { id: true, username: true, isActive: true, role: true } });
    res.json({ success: true, data: { user: updated } });
  } catch (error) {
    logger.error('Admin update user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/v1/admin/reports — pending content reports
router.get('/reports', authenticate, requireAdmin, async (req, res) => {
  try {
    const status = (req.query.status as string) || 'pending';
    const page   = parseInt(req.query.page as string) || 1;
    const limit  = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip   = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { status },
        include: {
          reporter: { select: { id: true, username: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.report.count({ where: { status } }),
    ]);

    res.json({ success: true, data: { reports, total, page, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    logger.error('Admin reports error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PATCH /api/v1/admin/reports/:reportId — resolve a report
router.patch('/reports/:reportId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminNote } = req.body; // resolved | dismissed

    const report = await prisma.report.update({
      where: { id: reportId },
      data: { status: status || 'resolved', adminNote, resolvedAt: new Date() },
    });
    res.json({ success: true, data: { report } });
  } catch (error) {
    logger.error('Admin resolve report error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/v1/admin/verifications — pending blue-tick requests
router.get('/verifications', authenticate, requireAdmin, async (req, res) => {
  try {
    const requests = await prisma.verificationRequest.findMany({
      where: { status: 'pending' },
      include: { user: { select: { id: true, username: true, email: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: { requests } });
  } catch (error) {
    logger.error('Admin verifications error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PATCH /api/v1/admin/verifications/:id — approve or reject
router.patch('/verifications/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'reject'

    const vReq = await prisma.verificationRequest.update({
      where: { id },
      data: { status: action === 'approve' ? 'approved' : 'rejected', reviewedAt: new Date() },
    });

    if (action === 'approve') {
      await prisma.user.update({ where: { id: vReq.userId }, data: { isVerified: true } });
    }

    res.json({ success: true, data: { request: vReq } });
  } catch (error) {
    logger.error('Admin verification action error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
