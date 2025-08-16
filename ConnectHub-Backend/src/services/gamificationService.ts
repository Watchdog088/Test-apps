import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'social' | 'dating' | 'engagement' | 'streaks' | 'special';
  icon: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: {
    type: string;
    value: number;
    timeframe?: string;
  };
  unlockConditions: any[];
  isHidden: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  requirement: any;
}

export interface UserStats {
  userId: string;
  level: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  postsCreated: number;
  likesReceived: number;
  commentsGiven: number;
  matchesMade: number;
  messagesExchanged: number;
  dailyChallengesCompleted: number;
  achievementsUnlocked: number;
  badgesEarned: number;
  lastActiveDate: Date;
}

export interface DailyChallenge {
  id: string;
  date: string;
  type: 'post' | 'like' | 'comment' | 'match' | 'message' | 'profile';
  description: string;
  target: number;
  points: number;
  icon: string;
  progress?: number;
  completed?: boolean;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'coins' | 'premium_time' | 'boost' | 'super_like' | 'badge' | 'feature';
  value: number;
  cost: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  duration?: number; // in hours for temporary rewards
}

class GamificationService {
  private achievements: Achievement[] = [
    // Social Achievements
    {
      id: 'first-post',
      name: 'First Steps',
      description: 'Create your first post',
      category: 'social',
      icon: '📝',
      points: 10,
      rarity: 'common',
      requirement: { type: 'posts_created', value: 1 },
      unlockConditions: [],
      isHidden: false
    },
    {
      id: 'social-butterfly',
      name: 'Social Butterfly',
      description: 'Create 50 posts',
      category: 'social',
      icon: '🦋',
      points: 500,
      rarity: 'rare',
      requirement: { type: 'posts_created', value: 50 },
      unlockConditions: [],
      isHidden: false
    },
    {
      id: 'influencer',
      name: 'Influencer',
      description: 'Get 1000 likes on your posts',
      category: 'social',
      icon: '⭐',
      points: 1000,
      rarity: 'epic',
      requirement: { type: 'likes_received', value: 1000 },
      unlockConditions: [],
      isHidden: false
    },
    // Dating Achievements
    {
      id: 'first-match',
      name: 'Perfect Match',
      description: 'Get your first match',
      category: 'dating',
      icon: '💕',
      points: 25,
      rarity: 'common',
      requirement: { type: 'matches_made', value: 1 },
      unlockConditions: [],
      isHidden: false
    },
    {
      id: 'matchmaker',
      name: 'Matchmaker',
      description: 'Get 100 matches',
      category: 'dating',
      icon: '💖',
      points: 1000,
      rarity: 'rare',
      requirement: { type: 'matches_made', value: 100 },
      unlockConditions: [],
      isHidden: false
    },
    {
      id: 'heartbreaker',
      name: 'Heartbreaker',
      description: 'Get 500 matches',
      category: 'dating',
      icon: '💔',
      points: 2500,
      rarity: 'epic',
      requirement: { type: 'matches_made', value: 500 },
      unlockConditions: [],
      isHidden: false
    },
    // Engagement Achievements
    {
      id: 'conversationalist',
      name: 'Conversationalist',
      description: 'Send 100 messages',
      category: 'engagement',
      icon: '💬',
      points: 200,
      rarity: 'common',
      requirement: { type: 'messages_sent', value: 100 },
      unlockConditions: [],
      isHidden: false
    },
    {
      id: 'chatterbox',
      name: 'Chatterbox',
      description: 'Send 1000 messages',
      category: 'engagement',
      icon: '🗣️',
      points: 1500,
      rarity: 'rare',
      requirement: { type: 'messages_sent', value: 1000 },
      unlockConditions: [],
      isHidden: false
    },
    // Streak Achievements
    {
      id: 'daily-user',
      name: 'Daily User',
      description: 'Login for 7 consecutive days',
      category: 'streaks',
      icon: '🔥',
      points: 100,
      rarity: 'common',
      requirement: { type: 'login_streak', value: 7 },
      unlockConditions: [],
      isHidden: false
    },
    {
      id: 'dedicated',
      name: 'Dedicated',
      description: 'Login for 30 consecutive days',
      category: 'streaks',
      icon: '🏆',
      points: 500,
      rarity: 'rare',
      requirement: { type: 'login_streak', value: 30 },
      unlockConditions: [],
      isHidden: false
    },
    {
      id: 'legendary-streak',
      name: 'Legendary Streak',
      description: 'Login for 100 consecutive days',
      category: 'streaks',
      icon: '👑',
      points: 2000,
      rarity: 'legendary',
      requirement: { type: 'login_streak', value: 100 },
      unlockConditions: [],
      isHidden: false
    },
    // Special Achievements
    {
      id: 'early-bird',
      name: 'Early Bird',
      description: 'Post before 6 AM',
      category: 'special',
      icon: '🐦',
      points: 50,
      rarity: 'common',
      requirement: { type: 'early_post', value: 1 },
      unlockConditions: [],
      isHidden: false
    },
    {
      id: 'night-owl',
      name: 'Night Owl',
      description: 'Post after midnight',
      category: 'special',
      icon: '🦉',
      points: 50,
      rarity: 'common',
      requirement: { type: 'late_post', value: 1 },
      unlockConditions: [],
      isHidden: false
    },
    {
      id: 'speed-dater',
      name: 'Speed Dater',
      description: 'Get 10 matches in one day',
      category: 'special',
      icon: '⚡',
      points: 300,
      rarity: 'epic',
      requirement: { type: 'matches_in_day', value: 10, timeframe: 'daily' },
      unlockConditions: [],
      isHidden: false
    }
  ];

  private badges: Badge[] = [
    {
      id: 'verified',
      name: 'Verified',
      description: 'Verified account',
      icon: '✅',
      color: '#1DA1F2',
      category: 'status',
      requirement: { type: 'verified', value: true }
    },
    {
      id: 'premium',
      name: 'Premium Member',
      description: 'Premium subscription active',
      icon: '💎',
      color: '#FFD700',
      category: 'subscription',
      requirement: { type: 'premium', value: true }
    },
    {
      id: 'founding-member',
      name: 'Founding Member',
      description: 'Joined in the first month',
      icon: '🏗️',
      color: '#FF6B35',
      category: 'special',
      requirement: { type: 'joined_early', value: true }
    },
    {
      id: 'top-contributor',
      name: 'Top Contributor',
      description: 'In top 1% of active users',
      icon: '🌟',
      color: '#9C27B0',
      category: 'achievement',
      requirement: { type: 'top_contributor', value: true }
    }
  ];

  private rewards: Reward[] = [
    {
      id: 'boost-profile',
      name: 'Profile Boost',
      description: '2x profile visibility for 1 hour',
      type: 'boost',
      value: 1,
      cost: 100,
      icon: '🚀',
      rarity: 'common',
      duration: 1
    },
    {
      id: 'super-like',
      name: 'Super Like',
      description: 'Show someone you really like them',
      type: 'super_like',
      value: 1,
      cost: 50,
      icon: '💙',
      rarity: 'common'
    },
    {
      id: 'premium-day',
      name: '1 Day Premium',
      description: 'Unlock premium features for 24 hours',
      type: 'premium_time',
      value: 24,
      cost: 200,
      icon: '💎',
      rarity: 'rare',
      duration: 24
    },
    {
      id: 'coins-100',
      name: '100 Coins',
      description: 'Get 100 ConnectHub coins',
      type: 'coins',
      value: 100,
      cost: 50,
      icon: '🪙',
      rarity: 'common'
    },
    {
      id: 'exclusive-badge',
      name: 'Exclusive Badge',
      description: 'Limited time exclusive badge',
      type: 'badge',
      value: 1,
      cost: 500,
      icon: '🏅',
      rarity: 'legendary'
    }
  ];

  // Calculate user level based on total points
  calculateLevel(points: number): number {
    // Level formula: level = floor(sqrt(points / 100))
    return Math.floor(Math.sqrt(points / 100)) + 1;
  }

  // Calculate points needed for next level
  pointsToNextLevel(currentPoints: number): number {
    const currentLevel = this.calculateLevel(currentPoints);
    const nextLevelPoints = Math.pow(currentLevel, 2) * 100;
    return nextLevelPoints - currentPoints;
  }

  // Generate daily challenges
  generateDailyChallenges(userId: string, userStats: UserStats): DailyChallenge[] {
    const today = new Date().toISOString().split('T')[0];
    const challenges: DailyChallenge[] = [];

    // Base challenges that appear for everyone
    const baseChallenges = [
      {
        id: `${today}-post`,
        date: today,
        type: 'post' as const,
        description: 'Create 3 posts today',
        target: 3,
        points: 50,
        icon: '📝'
      },
      {
        id: `${today}-like`,
        date: today,
        type: 'like' as const,
        description: 'Give 10 likes today',
        target: 10,
        points: 30,
        icon: '❤️'
      },
      {
        id: `${today}-comment`,
        date: today,
        type: 'comment' as const,
        description: 'Comment on 5 posts',
        target: 5,
        points: 40,
        icon: '💬'
      }
    ];

    // Level-based challenges
    if (userStats.level >= 5) {
      challenges.push({
        id: `${today}-match`,
        date: today,
        type: 'match',
        description: 'Get 2 new matches',
        target: 2,
        points: 100,
        icon: '💕'
      });
    }

    if (userStats.level >= 10) {
      challenges.push({
        id: `${today}-message`,
        date: today,
        type: 'message',
        description: 'Send 15 messages',
        target: 15,
        points: 75,
        icon: '💌'
      });
    }

    return [...baseChallenges, ...challenges];
  }

  // Check and unlock achievements
  async checkAchievements(userId: string, userStats: UserStats): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];

    // Get user's existing achievements
    const existingAchievements = await prisma.userAchievement.findMany({
      where: { userId }
    });

    const existingIds = new Set(existingAchievements.map(a => a.achievementId));

    for (const achievement of this.achievements) {
      if (existingIds.has(achievement.id)) continue;

      let unlocked = false;

      switch (achievement.requirement.type) {
        case 'posts_created':
          unlocked = userStats.postsCreated >= achievement.requirement.value;
          break;
        case 'likes_received':
          unlocked = userStats.likesReceived >= achievement.requirement.value;
          break;
        case 'matches_made':
          unlocked = userStats.matchesMade >= achievement.requirement.value;
          break;
        case 'messages_sent':
          unlocked = userStats.messagesExchanged >= achievement.requirement.value;
          break;
        case 'login_streak':
          unlocked = userStats.currentStreak >= achievement.requirement.value;
          break;
        // Add more cases as needed
      }

      if (unlocked) {
        // Save achievement to database
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            unlockedAt: new Date(),
            points: achievement.points
          }
        });

        // Award points
        await this.awardPoints(userId, achievement.points);
        
        unlockedAchievements.push(achievement);
      }
    }

    return unlockedAchievements;
  }

  // Award points to user
  async awardPoints(userId: string, points: number): Promise<void> {
    await prisma.userStats.upsert({
      where: { userId },
      update: {
        totalPoints: { increment: points }
      },
      create: {
        userId,
        totalPoints: points,
        level: 1,
        currentStreak: 0,
        longestStreak: 0
      }
    });
  }

  // Update user streak
  async updateStreak(userId: string): Promise<{ currentStreak: number; streakBroken: boolean }> {
    const userStats = await prisma.userStats.findUnique({
      where: { userId }
    });

    if (!userStats) {
      // First time user
      await prisma.userStats.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: new Date(),
          totalPoints: 0,
          level: 1
        }
      });
      return { currentStreak: 1, streakBroken: false };
    }

    const today = new Date();
    const lastActive = new Date(userStats.lastActiveDate);
    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    let currentStreak = userStats.currentStreak;
    let streakBroken = false;

    if (daysDiff === 1) {
      // Consecutive day
      currentStreak += 1;
    } else if (daysDiff > 1) {
      // Streak broken
      currentStreak = 1;
      streakBroken = true;
    }
    // If daysDiff === 0, same day, no change

    const longestStreak = Math.max(userStats.longestStreak, currentStreak);

    await prisma.userStats.update({
      where: { userId },
      data: {
        currentStreak,
        longestStreak,
        lastActiveDate: today
      }
    });

    return { currentStreak, streakBroken };
  }

  // Get leaderboard
  async getLeaderboard(type: 'points' | 'level' | 'streak' = 'points', limit: number = 50) {
    const orderBy: any = {};
    
    switch (type) {
      case 'points':
        orderBy.totalPoints = 'desc';
        break;
      case 'level':
        orderBy.level = 'desc';
        break;
      case 'streak':
        orderBy.currentStreak = 'desc';
        break;
    }

    return await prisma.userStats.findMany({
      take: limit,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true
          }
        }
      }
    });
  }

  // Complete daily challenge
  async completeDailyChallenge(userId: string, challengeId: string): Promise<{ points: number; completed: boolean }> {
    // Check if challenge was already completed
    const existing = await prisma.dailyChallenge.findFirst({
      where: {
        userId,
        challengeId,
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    if (existing) {
      return { points: 0, completed: false };
    }

    // Find challenge details
    const challenge = this.generateDailyChallenges(userId, {} as UserStats)
      .find(c => c.id === challengeId);

    if (!challenge) {
      return { points: 0, completed: false };
    }

    // Mark challenge as completed
    await prisma.dailyChallenge.create({
      data: {
        userId,
        challengeId,
        completedAt: new Date(),
        points: challenge.points
      }
    });

    // Award points
    await this.awardPoints(userId, challenge.points);

    return { points: challenge.points, completed: true };
  }

  // Redeem reward
  async redeemReward(userId: string, rewardId: string): Promise<{ success: boolean; message: string }> {
    const reward = this.rewards.find(r => r.id === rewardId);
    if (!reward) {
      return { success: false, message: 'Reward not found' };
    }

    // Check if user has enough coins
    const userStats = await prisma.userStats.findUnique({
      where: { userId }
    });

    if (!userStats || (userStats.coins || 0) < reward.cost) {
      return { success: false, message: 'Insufficient coins' };
    }

    // Deduct coins
    await prisma.userStats.update({
      where: { userId },
      data: {
        coins: { decrement: reward.cost }
      }
    });

    // Apply reward
    await prisma.userReward.create({
      data: {
        userId,
        rewardId: reward.id,
        redeemedAt: new Date(),
        expiresAt: reward.duration ? new Date(Date.now() + reward.duration * 60 * 60 * 1000) : null
      }
    });

    return { success: true, message: `Successfully redeemed ${reward.name}!` };
  }

  // Get user's gamification stats
  async getUserGamificationStats(userId: string) {
    const userStats = await prisma.userStats.findUnique({
      where: { userId },
      include: {
        achievements: {
          include: {
            achievement: true
          }
        },
        rewards: {
          where: {
            expiresAt: {
              gt: new Date()
            }
          }
        }
      }
    });

    if (!userStats) {
      return null;
    }

    const level = this.calculateLevel(userStats.totalPoints);
    const pointsToNext = this.pointsToNextLevel(userStats.totalPoints);
    const dailyChallenges = this.generateDailyChallenges(userId, userStats as any);

    return {
      level,
      totalPoints: userStats.totalPoints,
      pointsToNextLevel: pointsToNext,
      currentStreak: userStats.currentStreak,
      longestStreak: userStats.longestStreak,
      achievements: userStats.achievements.length,
      badges: this.badges.filter(badge => this.checkBadgeEligibility(userId, badge)),
      dailyChallenges,
      activeRewards: userStats.rewards
    };
  }

  // Check if user is eligible for a badge
  private checkBadgeEligibility(userId: string, badge: Badge): boolean {
    // This would check various conditions based on badge requirements
    // For now, return false as a placeholder
    return false;
  }

  // Get available rewards
  getAvailableRewards(): Reward[] {
    return this.rewards;
  }

  // Get all achievements
  getAchievements(): Achievement[] {
    return this.achievements;
  }
}

export const gamificationService = new GamificationService();
