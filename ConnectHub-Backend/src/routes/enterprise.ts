import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validation.js';
import { body, param, query } from 'express-validator';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// BUSINESS ACCOUNT MANAGEMENT

// Create business account
router.post('/business-account', 
  authenticate,
  [
    body('businessType').isIn(['startup', 'small_business', 'enterprise', 'agency', 'nonprofit']),
    body('companyName').notEmpty().withMessage('Company name is required'),
    body('businessDescription').notEmpty().withMessage('Business description is required'),
    body('website').isURL().withMessage('Valid website URL is required'),
    body('industry').notEmpty().withMessage('Industry is required'),
    body('employeeCount').isIn(['1-10', '11-50', '51-200', '201-500', '500+']),
    body('headquarters').notEmpty().withMessage('Headquarters location is required'),
    body('founded').isInt({ min: 1800, max: new Date().getFullYear() }),
    body('billingEmail').isEmail().withMessage('Valid billing email is required')
  ],
  validateQuery,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const {
        businessType, companyName, businessDescription, website, industry,
        employeeCount, headquarters, founded, billingEmail, taxId, logo, coverImage
      } = req.body;

      // Check if user already has a business account
      const existingAccount = await prisma.businessAccount.findUnique({
        where: { userId }
      });

      if (existingAccount) {
        return res.status(400).json({ 
          success: false, 
          message: 'User already has a business account' 
        });
      }

      // Create business account
      const businessAccount = await prisma.businessAccount.create({
        data: {
          userId,
          businessType,
          companyName,
          businessDescription,
          website,
          industry,
          employeeCount,
          headquarters,
          founded,
          billingEmail,
          taxId,
          logo,
          coverImage,
          features: JSON.stringify([
            'basic_analytics',
            'team_management',
            'content_scheduling'
          ])
        },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true }
          }
        }
      });

      // Create owner team member record
      await prisma.teamMember.create({
        data: {
          businessAccountId: businessAccount.id,
          userId,
          role: 'owner',
          permissions: JSON.stringify(['all']),
          inviteStatus: 'accepted',
          invitedBy: userId,
          joinedAt: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Business account created successfully',
        businessAccount: {
          ...businessAccount,
          features: JSON.parse(businessAccount.features)
        }
      });
    } catch (error) {
      console.error('Error creating business account:', error);
      res.status(500).json({ success: false, message: 'Failed to create business account' });
    }
  }
);

// Get business account details
router.get('/business-account', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;

    const businessAccount = await prisma.businessAccount.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true }
        },
        teamMembers: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true, profilePicture: true }
            }
          }
        },
        enterpriseSubscription: true,
        whitelabelConfig: true,
        _count: {
          select: {
            campaigns: true,
            scheduledContent: true,
            reports: true
          }
        }
      }
    });

    if (!businessAccount) {
      return res.status(404).json({ 
        success: false, 
        message: 'Business account not found' 
      });
    }

    res.json({
      success: true,
      businessAccount: {
        ...businessAccount,
        features: JSON.parse(businessAccount.features),
        teamMembers: businessAccount.teamMembers.map(member => ({
          ...member,
          permissions: JSON.parse(member.permissions)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching business account:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch business account' });
  }
});

// TEAM MANAGEMENT

// Invite team member
router.post('/team/invite',
  authenticate,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').isIn(['admin', 'manager', 'editor', 'viewer']).withMessage('Invalid role'),
    body('permissions').isArray().withMessage('Permissions must be an array')
  ],
  validateQuery,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { email, role, permissions } = req.body;

      // Get business account
      const businessAccount = await prisma.businessAccount.findUnique({
        where: { userId },
        include: {
          teamMembers: {
            where: { userId, inviteStatus: 'accepted' }
          }
        }
      });

      if (!businessAccount) {
        return res.status(404).json({ success: false, message: 'Business account not found' });
      }

      // Check if current user has permission to invite
      const currentMember = businessAccount.teamMembers[0];
      if (!currentMember || !['owner', 'admin'].includes(currentMember.role)) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      }

      // Find user by email
      const invitedUser = await prisma.user.findUnique({
        where: { email }
      });

      if (!invitedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Check if user is already a team member
      const existingMember = await prisma.teamMember.findUnique({
        where: {
          businessAccountId_userId: {
            businessAccountId: businessAccount.id,
            userId: invitedUser.id
          }
        }
      });

      if (existingMember) {
        return res.status(400).json({ 
          success: false, 
          message: 'User is already a team member' 
        });
      }

      // Create team member invitation
      const teamMember = await prisma.teamMember.create({
        data: {
          businessAccountId: businessAccount.id,
          userId: invitedUser.id,
          role,
          permissions: JSON.stringify(permissions),
          invitedBy: userId
        },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true }
          }
        }
      });

      // TODO: Send invitation email

      res.json({
        success: true,
        message: 'Team member invited successfully',
        teamMember: {
          ...teamMember,
          permissions: JSON.parse(teamMember.permissions)
        }
      });
    } catch (error) {
      console.error('Error inviting team member:', error);
      res.status(500).json({ success: false, message: 'Failed to invite team member' });
    }
  }
);

// Accept team invitation
router.post('/team/accept/:inviteId', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { inviteId } = req.params;

    const teamMember = await prisma.teamMember.findFirst({
      where: {
        id: inviteId,
        userId,
        inviteStatus: 'pending'
      },
      include: {
        businessAccount: true
      }
    });

    if (!teamMember) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    const updatedMember = await prisma.teamMember.update({
      where: { id: inviteId },
      data: {
        inviteStatus: 'accepted',
        joinedAt: new Date()
      },
      include: {
        businessAccount: true,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Team invitation accepted',
      teamMember: {
        ...updatedMember,
        permissions: JSON.parse(updatedMember.permissions)
      }
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ success: false, message: 'Failed to accept invitation' });
  }
});

// ENTERPRISE ANALYTICS

// Get enterprise analytics dashboard
router.get('/analytics',
  authenticate,
  [
    query('period').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { period = 'daily', startDate, endDate } = req.query;

      const businessAccount = await prisma.businessAccount.findUnique({
        where: { userId }
      });

      if (!businessAccount) {
        return res.status(404).json({ success: false, message: 'Business account not found' });
      }

      // Set default date range
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

      const analytics = await prisma.enterpriseAnalytics.findMany({
        where: {
          businessAccountId: businessAccount.id,
          period: period as string,
          startDate: { gte: start },
          endDate: { lte: end }
        },
        orderBy: { startDate: 'desc' }
      });

      // Calculate aggregated metrics
      const totals = analytics.reduce((acc, curr) => ({
        totalReach: acc.totalReach + curr.totalReach,
        totalImpressions: acc.totalImpressions + curr.totalImpressions,
        totalEngagements: acc.totalEngagements + curr.totalEngagements,
        postsPublished: acc.postsPublished + curr.postsPublished,
        followerGrowth: acc.followerGrowth + curr.followerGrowth,
        profileViews: acc.profileViews + curr.profileViews,
        websiteClicks: acc.websiteClicks + curr.websiteClicks,
        leadGenerated: acc.leadGenerated + curr.leadGenerated
      }), {
        totalReach: 0,
        totalImpressions: 0,
        totalEngagements: 0,
        postsPublished: 0,
        followerGrowth: 0,
        profileViews: 0,
        websiteClicks: 0,
        leadGenerated: 0
      });

      res.json({
        success: true,
        analytics: analytics.map(item => ({
          ...item,
          topPerformingPosts: JSON.parse(item.topPerformingPosts),
          audienceDemographics: JSON.parse(item.audienceDemographics),
          peakEngagementTimes: JSON.parse(item.peakEngagementTimes)
        })),
        totals,
        summary: {
          averageEngagementRate: analytics.length ? 
            analytics.reduce((sum, item) => sum + item.engagementRate, 0) / analytics.length : 0,
          averageConversionRate: analytics.length ?
            analytics.reduce((sum, item) => sum + item.conversionRate, 0) / analytics.length : 0,
          totalPeriods: analytics.length
        }
      });
    } catch (error) {
      console.error('Error fetching enterprise analytics:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
  }
);

// CONTENT SCHEDULING

// Schedule content
router.post('/content/schedule',
  authenticate,
  [
    body('postContent').notEmpty().withMessage('Post content is required'),
    body('scheduledFor').isISO8601().withMessage('Valid schedule date is required'),
    body('platforms').isArray().withMessage('Platforms must be an array'),
    body('mediaUrls').optional().isArray()
  ],
  validateQuery,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { postContent, mediaUrls = [], scheduledFor, platforms, autoRepost, repostFrequency } = req.body;

      const businessAccount = await prisma.businessAccount.findUnique({
        where: { userId }
      });

      if (!businessAccount) {
        return res.status(404).json({ success: false, message: 'Business account not found' });
      }

      const scheduledContent = await prisma.contentScheduling.create({
        data: {
          businessAccountId: businessAccount.id,
          userId,
          postContent,
          mediaUrls: JSON.stringify(mediaUrls),
          scheduledFor: new Date(scheduledFor),
          platforms: JSON.stringify(platforms),
          autoRepost,
          repostFrequency
        }
      });

      res.json({
        success: true,
        message: 'Content scheduled successfully',
        scheduledContent: {
          ...scheduledContent,
          mediaUrls: JSON.parse(scheduledContent.mediaUrls),
          platforms: JSON.parse(scheduledContent.platforms),
          postIds: JSON.parse(scheduledContent.postIds)
        }
      });
    } catch (error) {
      console.error('Error scheduling content:', error);
      res.status(500).json({ success: false, message: 'Failed to schedule content' });
    }
  }
);

// Get scheduled content
router.get('/content/scheduled', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;

    const businessAccount = await prisma.businessAccount.findUnique({
      where: { userId }
    });

    if (!businessAccount) {
      return res.status(404).json({ success: false, message: 'Business account not found' });
    }

    const scheduledContent = await prisma.contentScheduling.findMany({
      where: { businessAccountId: businessAccount.id },
      orderBy: { scheduledFor: 'asc' }
    });

    res.json({
      success: true,
      scheduledContent: scheduledContent.map(item => ({
        ...item,
        mediaUrls: JSON.parse(item.mediaUrls),
        platforms: JSON.parse(item.platforms),
        postIds: JSON.parse(item.postIds)
      }))
    });
  } catch (error) {
    console.error('Error fetching scheduled content:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch scheduled content' });
  }
});

// API ACCESS MANAGEMENT

// Generate API keys
router.post('/api/generate-keys', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { permissions = [], rateLimit = 1000 } = req.body;

    const businessAccount = await prisma.businessAccount.findUnique({
      where: { userId }
    });

    if (!businessAccount) {
      return res.status(404).json({ success: false, message: 'Business account not found' });
    }

    // Generate API keys
    const apiKey = `ck_${crypto.randomBytes(16).toString('hex')}`;
    const secretKey = `cs_${crypto.randomBytes(32).toString('hex')}`;

    const apiAccess = await prisma.apiAccess.create({
      data: {
        businessAccountId: businessAccount.id,
        apiKey,
        secretKey,
        permissions: JSON.stringify(permissions),
        rateLimit,
        usageStats: JSON.stringify({
          requestsThisMonth: 0,
          lastRequestAt: null,
          totalRequests: 0
        })
      }
    });

    res.json({
      success: true,
      message: 'API keys generated successfully',
      apiAccess: {
        ...apiAccess,
        permissions: JSON.parse(apiAccess.permissions),
        usageStats: JSON.parse(apiAccess.usageStats)
      }
    });
  } catch (error) {
    console.error('Error generating API keys:', error);
    res.status(500).json({ success: false, message: 'Failed to generate API keys' });
  }
});

// ADVANCED REPORTING

// Generate report
router.post('/reports/generate',
  authenticate,
  [
    body('reportType').isIn(['performance', 'audience', 'content', 'roi', 'competitive']),
    body('timeframe').notEmpty().withMessage('Timeframe is required'),
    body('format').optional().isIn(['json', 'pdf', 'excel'])
  ],
  validateQuery,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { reportType, timeframe, filters = {}, format = 'json' } = req.body;

      const businessAccount = await prisma.businessAccount.findUnique({
        where: { userId }
      });

      if (!businessAccount) {
        return res.status(404).json({ success: false, message: 'Business account not found' });
      }

      // Generate report data (simplified - would be more complex in production)
      const reportData = await generateReportData(businessAccount.id, reportType, timeframe, filters);

      const report = await prisma.advancedReporting.create({
        data: {
          businessAccountId: businessAccount.id,
          reportType,
          timeframe,
          filters: JSON.stringify(filters),
          data: JSON.stringify(reportData),
          generatedBy: userId,
          format
        }
      });

      res.json({
        success: true,
        message: 'Report generated successfully',
        report: {
          ...report,
          filters: JSON.parse(report.filters),
          data: JSON.parse(report.data)
        }
      });
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
  }
);

// WHITELABEL CONFIGURATION

// Setup whitelabel
router.post('/whitelabel/setup',
  authenticate,
  [
    body('domain').isURL().withMessage('Valid domain is required'),
    body('subdomain').notEmpty().withMessage('Subdomain is required'),
    body('branding').isObject().withMessage('Branding configuration is required')
  ],
  validateQuery,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { domain, subdomain, branding, features, customization } = req.body;

      const businessAccount = await prisma.businessAccount.findUnique({
        where: { userId }
      });

      if (!businessAccount) {
        return res.status(404).json({ success: false, message: 'Business account not found' });
      }

      const whitelabelConfig = await prisma.whitelabelConfig.upsert({
        where: { businessAccountId: businessAccount.id },
        create: {
          businessAccountId: businessAccount.id,
          domain,
          subdomain,
          branding: JSON.stringify(branding),
          features: JSON.stringify(features || {}),
          customization: JSON.stringify(customization || {})
        },
        update: {
          domain,
          subdomain,
          branding: JSON.stringify(branding),
          features: JSON.stringify(features || {}),
          customization: JSON.stringify(customization || {})
        }
      });

      res.json({
        success: true,
        message: 'Whitelabel configuration updated successfully',
        whitelabelConfig: {
          ...whitelabelConfig,
          branding: JSON.parse(whitelabelConfig.branding),
          features: JSON.parse(whitelabelConfig.features),
          customization: JSON.parse(whitelabelConfig.customization)
        }
      });
    } catch (error) {
      console.error('Error setting up whitelabel:', error);
      res.status(500).json({ success: false, message: 'Failed to setup whitelabel' });
    }
  }
);

// Helper function to generate report data
async function generateReportData(businessAccountId: string, reportType: string, timeframe: string, filters: any) {
  // This would contain complex analytics logic
  // For now, returning mock data structure
  const baseData = {
    businessAccountId,
    reportType,
    timeframe,
    generatedAt: new Date().toISOString(),
    summary: {},
    details: {},
    charts: {},
    recommendations: []
  };

  switch (reportType) {
    case 'performance':
      baseData.summary = {
        totalReach: Math.floor(Math.random() * 10000),
        engagementRate: Math.random() * 10,
        conversionRate: Math.random() * 5,
        roi: Math.random() * 200
      };
      break;
    case 'audience':
      baseData.summary = {
        totalFollowers: Math.floor(Math.random() * 5000),
        demographics: {
          age: { '18-24': 25, '25-34': 35, '35-44': 25, '45+': 15 },
          gender: { male: 45, female: 53, other: 2 },
          location: { US: 60, CA: 15, UK: 12, other: 13 }
        }
      };
      break;
    // Add more report types as needed
  }

  return baseData;
}

export default router;
