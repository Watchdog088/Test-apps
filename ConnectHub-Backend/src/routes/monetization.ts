import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validateQuery } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();

// SUBSCRIPTION MANAGEMENT

// Get available subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      plans: plans.map(plan => ({
        ...plan,
        features: JSON.parse(plan.features)
      }))
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subscription plans' });
  }
});

// Subscribe to a plan
router.post('/subscribe', 
  authenticate,
  [
    body('planId').notEmpty().withMessage('Plan ID is required'),
    body('paymentMethodId').notEmpty().withMessage('Payment method is required')
  ],
  validateQuery,
  async (req, res) => {
    try {
      const { planId, paymentMethodId } = req.body;
      const userId = req.user?.id;

      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId, isActive: true }
      });

      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan not found' });
      }

      const paymentMethod = await prisma.paymentMethod.findFirst({
        where: { id: paymentMethodId, userId }
      });

      if (!paymentMethod) {
        return res.status(404).json({ success: false, message: 'Payment method not found' });
      }

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      if (plan.billingCycle === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (plan.billingCycle === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Create subscription
      const subscription = await prisma.subscription.create({
        data: {
          userId,
          planId,
          startDate,
          endDate,
          paymentMethodId,
          amount: plan.price,
          currency: plan.currency
        },
        include: {
          plan: true,
          paymentMethod: true
        }
      });

      // Create payment record
      await prisma.payment.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          paymentMethodId,
          amount: plan.price,
          currency: plan.currency,
          status: 'completed',
          paymentGateway: 'stripe',
          description: `Subscription to ${plan.name}`
        }
      });

      // Update business analytics
      await updateBusinessAnalytics('subscription', plan.price);

      res.json({
        success: true,
        message: 'Subscription created successfully',
        subscription: {
          ...subscription,
          plan: {
            ...subscription.plan,
            features: JSON.parse(subscription.plan.features)
          }
        }
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ success: false, message: 'Failed to create subscription' });
    }
  }
);

// Get user's current subscription
router.get('/subscription', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
        endDate: { gt: new Date() }
      },
      include: {
        plan: true,
        paymentMethod: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!subscription) {
      return res.json({ success: true, subscription: null });
    }

    res.json({
      success: true,
      subscription: {
        ...subscription,
        plan: {
          ...subscription.plan,
          features: JSON.parse(subscription.plan.features)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subscription' });
  }
});

// ADVERTISEMENT MANAGEMENT

// Get targeted ads for user
router.get('/ads', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { placement = 'feed' } = req.query;

    // Get user profile for targeting
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        datingProfile: true,
        analytics: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Simple ad targeting logic (can be enhanced with ML)
    const ads = await prisma.advertisement.findMany({
      where: {
        status: 'active',
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        spent: { lt: prisma.advertisement.fields.budget }
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });

    // Track ad impressions
    const impressions = await Promise.all(
      ads.map(async (ad) => {
        const impression = await prisma.adImpression.create({
          data: {
            adId: ad.id,
            userId,
            placement: placement as string,
            revenue: 0.05, // $0.05 per impression
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || ''
          }
        });

        // Update ad stats
        await prisma.advertisement.update({
          where: { id: ad.id },
          data: {
            impressionCount: { increment: 1 },
            spent: { increment: 0.05 }
          }
        });

        return impression;
      })
    );

    // Update business analytics
    await updateBusinessAnalytics('ad_revenue', ads.length * 0.05);

    res.json({
      success: true,
      ads: ads.map(ad => ({
        ...ad,
        targeting: JSON.parse(ad.targeting)
      }))
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ads' });
  }
});

// Track ad click
router.post('/ads/:adId/click', 
  authenticate,
  [param('adId').notEmpty().withMessage('Ad ID is required')],
  validateQuery,
  async (req, res) => {
    try {
      const { adId } = req.params;
      const userId = req.user?.id;

      // Find recent impression for this user and ad
      const impression = await prisma.adImpression.findFirst({
        where: {
          adId,
          userId,
          timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        },
        orderBy: { timestamp: 'desc' }
      });

      if (!impression) {
        return res.status(404).json({ success: false, message: 'Ad impression not found' });
      }

      // Update impression as clicked
      await prisma.adImpression.update({
        where: { id: impression.id },
        data: {
          clicked: true,
          revenue: 0.25 // $0.25 per click
        }
      });

      // Update ad stats
      await prisma.advertisement.update({
        where: { id: adId },
        data: {
          clicks: { increment: 1 },
          spent: { increment: 0.20 } // Additional $0.20 for click
        }
      });

      // Update user analytics
      await prisma.userAnalytics.upsert({
        where: { userId },
        create: {
          userId,
          adInteractions: 1,
          revenueIndirect: 0.25
        },
        update: {
          adInteractions: { increment: 1 },
          revenueIndirect: { increment: 0.25 }
        }
      });

      // Update business analytics
      await updateBusinessAnalytics('ad_revenue', 0.25);

      res.json({ success: true, message: 'Ad click tracked successfully' });
    } catch (error) {
      console.error('Error tracking ad click:', error);
      res.status(500).json({ success: false, message: 'Failed to track ad click' });
    }
  }
);

// ANALYTICS & REVENUE

// Get business analytics dashboard
router.get('/analytics/business', authenticate, async (req, res) => {
  try {
    const { period = 'daily', days = 30 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    const analytics = await prisma.businessAnalytics.findMany({
      where: {
        period: period as string,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'desc' }
    });

    // Calculate totals
    const totals = analytics.reduce((acc, curr) => ({
      totalRevenue: acc.totalRevenue + curr.totalRevenue,
      subscriptionRevenue: acc.subscriptionRevenue + curr.subscriptionRevenue,
      adRevenue: acc.adRevenue + curr.adRevenue,
      activeUsers: Math.max(acc.activeUsers, curr.activeUsers),
      newSignups: acc.newSignups + curr.newSignups,
      premiumConversions: acc.premiumConversions + curr.premiumConversions
    }), {
      totalRevenue: 0,
      subscriptionRevenue: 0,
      adRevenue: 0,
      activeUsers: 0,
      newSignups: 0,
      premiumConversions: 0
    });

    res.json({
      success: true,
      analytics,
      totals,
      summary: {
        averageRevenue: totals.totalRevenue / analytics.length || 0,
        conversionRate: analytics.length ? (totals.premiumConversions / totals.newSignups) * 100 : 0,
        revenueGrowth: calculateGrowthRate(analytics, 'totalRevenue')
      }
    });
  } catch (error) {
    console.error('Error fetching business analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

// Get user analytics for targeting
router.get('/analytics/users/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    const userAnalytics = await prisma.userAnalytics.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            createdAt: true,
            lastActiveAt: true
          }
        }
      }
    });

    if (!userAnalytics) {
      return res.status(404).json({ success: false, message: 'User analytics not found' });
    }

    res.json({
      success: true,
      analytics: {
        ...userAnalytics,
        deviceTypes: JSON.parse(userAnalytics.deviceTypes),
        locations: JSON.parse(userAnalytics.locations),
        interests: JSON.parse(userAnalytics.interests)
      }
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user analytics' });
  }
});

// PREMIUM FEATURES

// Get available premium features
router.get('/features', authenticate, async (req, res) => {
  try {
    const features = await prisma.premiumFeature.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' }
    });

    const categorizedFeatures = features.reduce((acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = [];
      }
      acc[feature.category].push({
        ...feature,
        requiredPlan: JSON.parse(feature.requiredPlan)
      });
      return acc;
    }, {} as Record<string, any[]>);

    res.json({
      success: true,
      features: categorizedFeatures
    });
  } catch (error) {
    console.error('Error fetching premium features:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch premium features' });
  }
});

// Helper Functions

async function updateBusinessAnalytics(type: string, amount: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const updateData: any = {};
  
  if (type === 'subscription') {
    updateData.subscriptionRevenue = { increment: amount };
    updateData.totalRevenue = { increment: amount };
    updateData.premiumConversions = { increment: 1 };
  } else if (type === 'ad_revenue') {
    updateData.adRevenue = { increment: amount };
    updateData.totalRevenue = { increment: amount };
  }

  await prisma.businessAnalytics.upsert({
    where: {
      period_date: {
        period: 'daily',
        date: today
      }
    },
    create: {
      period: 'daily',
      date: today,
      ...updateData
    },
    update: updateData
  });
}

function calculateGrowthRate(analytics: any[], field: string): number {
  if (analytics.length < 2) return 0;
  
  const current = analytics[0][field];
  const previous = analytics[1][field];
  
  if (previous === 0) return current > 0 ? 100 : 0;
  
  return ((current - previous) / previous) * 100;
}

export default router;
