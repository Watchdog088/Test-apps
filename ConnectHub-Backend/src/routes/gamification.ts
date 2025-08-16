import express from 'express';
import { authenticate } from '../middleware/auth';
import { gamificationService } from '../services/gamificationService';
import { localizationMiddleware } from '../services/internationalization';

const router = express.Router();

// Apply localization middleware to all routes
router.use(localizationMiddleware);

// Get user's gamification stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const stats = await gamificationService.getUserGamificationStats(userId);
    
    if (!stats) {
      return res.status(404).json({ 
        error: (req as any).t('gamification.stats_not_found') 
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    res.status(500).json({ 
      error: (req as any).t('common.error') 
    });
  }
});

// Get available achievements
router.get('/achievements', authenticate, async (req, res) => {
  try {
    const achievements = gamificationService.getAchievements();
    
    // Localize achievement names and descriptions if needed
    const localizedAchievements = achievements.map(achievement => ({
      ...achievement,
      name: (req as any).t(`achievements.${achievement.id}.name`) || achievement.name,
      description: (req as any).t(`achievements.${achievement.id}.description`) || achievement.description
    }));

    res.json({
      success: true,
      data: localizedAchievements
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ 
      error: (req as any).t('common.error') 
    });
  }
});

// Check for new achievements (called after user actions)
router.post('/check-achievements', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    // Get user stats first
    const userStats = await gamificationService.getUserGamificationStats(userId);
    if (!userStats) {
      return res.status(404).json({ 
        error: (req as any).t('gamification.stats_not_found') 
      });
    }

    const newAchievements = await gamificationService.checkAchievements(userId, userStats as any);
    
    res.json({
      success: true,
      data: {
        newAchievements: newAchievements.length,
        achievements: newAchievements
      }
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ 
      error: (req as any).t('common.error') 
    });
  }
});

// Get daily challenges
router.get('/challenges/daily', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    // Get user stats for challenge generation
    const userStats = await gamificationService.getUserGamificationStats(userId);
    if (!userStats) {
      return res.status(404).json({ 
        error: (req as any).t('gamification.stats_not_found') 
      });
    }

    const challenges = gamificationService.generateDailyChallenges(userId, userStats as any);
    
    // Localize challenge descriptions
    const localizedChallenges = challenges.map(challenge => ({
      ...challenge,
      description: (req as any).t(`challenges.${challenge.type}`) || challenge.description
    }));

    res.json({
      success: true,
      data: localizedChallenges
    });
  } catch (error) {
    console.error('Error fetching daily challenges:', error);
    res.status(500).json({ 
      error: (req as any).t('common.error') 
    });
  }
});

// Complete daily challenge
router.post('/challenges/:challengeId/complete', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { challengeId } = req.params;
    
    const result = await gamificationService.completeDailyChallenge(userId, challengeId);
    
    if (!result.completed) {
      return res.status(400).json({
        error: (req as any).t('gamification.challenge_already_completed')
      });
    }

    res.json({
      success: true,
      message: (req as any).t('gamification.challenge_completed', { points: result.points }),
      data: {
        points: result.points
      }
    });
  } catch (error) {
    console.error('Error completing daily challenge:', error);
    res.status(500).json({ 
      error: (req as any).t('common.error') 
    });
  }
});

// Get leaderboard
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const { type = 'points', limit = 50 } = req.query;
    const leaderboard = await gamificationService.getLeaderboard(
      type as 'points' | 'level' | 'streak', 
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ 
      error: (req as any).t('common.error') 
    });
  }
});

// Get available rewards
router.get('/rewards', authenticate, async (req, res) => {
  try {
    const rewards = gamificationService.getAvailableRewards();
    
    // Localize reward names and descriptions
    const localizedRewards = rewards.map(reward => ({
      ...reward,
      name: (req as any).t(`rewards.${reward.id}.name`) || reward.name,
      description: (req as any).t(`rewards.${reward.id}.description`) || reward.description
    }));

    res.json({
      success: true,
      data: localizedRewards
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ 
      error: (req as any).t('common.error') 
    });
  }
});

// Redeem reward
router.post('/rewards/:rewardId/redeem', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { rewardId } = req.params;
    
    const result = await gamificationService.redeemReward(userId, rewardId);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.message
      });
    }

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({ 
      error: (req as any).t('common.error') 
    });
  }
});

// Update user streak (called on login)
router.post('/streak/update', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const streakData = await gamificationService.updateStreak(userId);
    
    let message = '';
    if (streakData.streakBroken) {
      message = (req as any).t('gamification.streak_broken');
    } else if (streakData.currentStreak > 1) {
      message = (req as any).t('gamification.streak_continued', { days: streakData.currentStreak });
    } else {
      message = (req as any).t('gamification.streak_started');
    }

    res.json({
      success: true,
      message,
      data: streakData
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    res.status(500).json({ 
      error: (req as any).t('common.error') 
    });
  }
});

// Award points (internal use by other routes)
router.post('/award-points', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { points, reason } = req.body;
    
    if (!points || points <= 0) {
      return res.status(400).json({
        error: (req as any).t('gamification.invalid_points')
      });
    }

    await gamificationService.awardPoints(userId, points);
    
    // Check for new achievements after awarding points
    const userStats = await gamificationService.getUserGamificationStats(userId);
    if (userStats) {
      await gamificationService.checkAchievements(userId, userStats as any);
    }

    res.json({
      success: true,
      message: (req as any).t('gamification.points_awarded', { points }),
      data: {
        points,
        reason
      }
    });
  } catch (error) {
    console.error('Error awarding points:', error);
    res.status(500).json({ 
      error: (req as any).t('common.error') 
    });
  }
});

// Get user's progress summary
router.get('/progress', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const stats = await gamificationService.getUserGamificationStats(userId);
    
    if (!stats) {
      return res.status(404).json({ 
        error: (req as any).t('gamification.stats_not_found') 
      });
    }

    // Calculate progress percentages
    const levelProgress = ((stats.totalPoints - (Math.pow(stats.level - 1, 2) * 100)) / 
                          (Math.pow(stats.level, 2) * 100 - Math.pow(stats.level - 1, 2) * 100)) * 100;

    const progressSummary = {
      level: stats.level,
      levelProgress: Math.min(levelProgress, 100),
      totalPoints: stats.totalPoints,
      pointsToNextLevel: stats.pointsToNextLevel,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      achievements: stats.achievements,
      dailyChallenges: {
        total: stats.dailyChallenges.length,
        completed: stats.dailyChallenges.filter(c => c.completed).length
      }
    };

    res.json({
      success: true,
      data: progressSummary
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ 
      error: (req as any).t('common.error') 
    });
  }
});

export default router;
