import { prisma } from '../config/database';
import logger from '../config/logger';

interface UserProfile {
  id: string;
  age: number;
  bio: string;
  interests: string[];
  photos: string[];
  location: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  preferences: {
    ageMin: number;
    ageMax: number;
    maxDistance: number;
    interestedIn: string;
  };
  lastActive: Date;
  isVerified: boolean;
  swipeStats?: {
    totalLikes: number;
    totalPasses: number;
    totalMatches: number;
  };
}

interface MatchScore {
  userId: string;
  compatibilityScore: number;
  interestScore: number;
  activityScore: number;
  locationScore: number;
  overallScore: number;
  reasons: string[];
}

export class AIMatchingAlgorithm {
  private readonly weights = {
    compatibility: 0.35,
    interests: 0.25,
    activity: 0.20,
    location: 0.20
  };

  private readonly interestCategories = {
    'fitness': ['gym', 'workout', 'running', 'yoga', 'sports', 'health'],
    'music': ['music', 'concerts', 'singing', 'dancing', 'instruments'],
    'travel': ['travel', 'adventure', 'hiking', 'exploring', 'cultures'],
    'food': ['cooking', 'food', 'restaurants', 'wine', 'culinary'],
    'arts': ['art', 'painting', 'photography', 'design', 'creativity'],
    'tech': ['technology', 'programming', 'gaming', 'innovation', 'gadgets'],
    'reading': ['books', 'literature', 'writing', 'learning', 'knowledge'],
    'outdoor': ['nature', 'camping', 'hiking', 'beach', 'outdoors'],
    'entertainment': ['movies', 'tv', 'comedy', 'theater', 'entertainment']
  };

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate compatibility score based on preferences and demographics
   */
  private calculateCompatibilityScore(user: UserProfile, candidate: UserProfile): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Age compatibility (both ways)
    const userAgeMatch = candidate.age >= user.preferences.ageMin && candidate.age <= user.preferences.ageMax;
    const candidateAgeMatch = user.age >= candidate.preferences.ageMin && user.age <= candidate.preferences.ageMax;
    
    if (userAgeMatch && candidateAgeMatch) {
      score += 1.0;
      reasons.push('Age compatibility');
    } else if (userAgeMatch || candidateAgeMatch) {
      score += 0.5;
      reasons.push('Partial age compatibility');
    }

    // Bio compatibility (text similarity - simplified)
    if (user.bio && candidate.bio) {
      const userWords = user.bio.toLowerCase().split(' ');
      const candidateWords = candidate.bio.toLowerCase().split(' ');
      const commonWords = userWords.filter(word => 
        candidateWords.includes(word) && word.length > 3
      ).length;
      
      if (commonWords > 0) {
        const bioScore = Math.min(0.3, commonWords * 0.1);
        score += bioScore;
        if (bioScore > 0.1) {
          reasons.push('Similar interests mentioned in bio');
        }
      }
    }

    // Photo count (users with more photos tend to be more serious)
    const avgPhotos = (user.photos.length + candidate.photos.length) / 2;
    if (avgPhotos >= 3) {
      score += 0.2;
      reasons.push('Both users have multiple photos');
    }

    // Verification bonus
    if (user.isVerified && candidate.isVerified) {
      score += 0.3;
      reasons.push('Both users verified');
    } else if (user.isVerified || candidate.isVerified) {
      score += 0.15;
      reasons.push('One user verified');
    }

    return { score: Math.min(1.0, score), reasons };
  }

  /**
   * Calculate interest similarity score
   */
  private calculateInterestScore(user: UserProfile, candidate: UserProfile): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Direct interest overlap
    const commonInterests = user.interests.filter(interest => 
      candidate.interests.includes(interest)
    );

    if (commonInterests.length > 0) {
      score += Math.min(0.6, commonInterests.length * 0.2);
      reasons.push(`${commonInterests.length} shared interests: ${commonInterests.slice(0, 3).join(', ')}`);
    }

    // Category-based interest similarity
    const userCategories = this.categorizeInterests(user.interests);
    const candidateCategories = this.categorizeInterests(candidate.interests);
    
    const commonCategories = Object.keys(userCategories).filter(category => 
      candidateCategories[category] !== undefined
    );

    if (commonCategories.length > 0) {
      const categoryScore = Math.min(0.4, commonCategories.length * 0.1);
      score += categoryScore;
      reasons.push(`Similar interest categories: ${commonCategories.slice(0, 2).join(', ')}`);
    }

    return { score: Math.min(1.0, score), reasons };
  }

  /**
   * Categorize interests into broader categories
   */
  private categorizeInterests(interests: string[]): Record<string, number> {
    const categories: Record<string, number> = {};
    
    interests.forEach(interest => {
      const lowerInterest = interest.toLowerCase();
      
      Object.entries(this.interestCategories).forEach(([category, keywords]) => {
        if (keywords.some(keyword => lowerInterest.includes(keyword))) {
          categories[category] = (categories[category] || 0) + 1;
        }
      });
    });

    return categories;
  }

  /**
   * Calculate activity score based on user engagement
   */
  private calculateActivityScore(user: UserProfile, candidate: UserProfile): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    const now = new Date();
    const daysSinceUserActive = (now.getTime() - user.lastActive.getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceCandidateActive = (now.getTime() - candidate.lastActive.getTime()) / (1000 * 60 * 60 * 24);

    // Recent activity bonus
    if (daysSinceUserActive <= 1 && daysSinceCandidateActive <= 1) {
      score += 0.4;
      reasons.push('Both users active recently');
    } else if (daysSinceUserActive <= 3 && daysSinceCandidateActive <= 3) {
      score += 0.2;
      reasons.push('Both users active this week');
    }

    // Engagement rate (if we have swipe stats)
    if (user.swipeStats && candidate.swipeStats) {
      const userSelectivity = user.swipeStats.totalLikes / Math.max(1, user.swipeStats.totalLikes + user.swipeStats.totalPasses);
      const candidateSelectivity = candidate.swipeStats.totalLikes / Math.max(1, candidate.swipeStats.totalLikes + candidate.swipeStats.totalPasses);
      
      // Similar selectivity levels indicate similar standards
      const selectivityDiff = Math.abs(userSelectivity - candidateSelectivity);
      if (selectivityDiff < 0.2) {
        score += 0.3;
        reasons.push('Similar matching standards');
      }

      // Match success rate
      const userMatchRate = user.swipeStats.totalMatches / Math.max(1, user.swipeStats.totalLikes);
      const candidateMatchRate = candidate.swipeStats.totalMatches / Math.max(1, candidate.swipeStats.totalLikes);
      
      if (userMatchRate > 0.1 && candidateMatchRate > 0.1) {
        score += 0.3;
        reasons.push('Both users have good match rates');
      }
    }

    return { score: Math.min(1.0, score), reasons };
  }

  /**
   * Calculate location-based score
   */
  private calculateLocationScore(user: UserProfile, candidate: UserProfile): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    const distance = this.calculateDistance(
      user.location.latitude,
      user.location.longitude,
      candidate.location.latitude,
      candidate.location.longitude
    );

    // Check if within user's preferred distance
    if (distance <= user.preferences.maxDistance) {
      // Closer = higher score
      if (distance <= 5) {
        score = 1.0;
        reasons.push(`Very close (${Math.round(distance)}km away)`);
      } else if (distance <= 20) {
        score = 0.8;
        reasons.push(`Nearby (${Math.round(distance)}km away)`);
      } else if (distance <= 50) {
        score = 0.6;
        reasons.push(`Same area (${Math.round(distance)}km away)`);
      } else {
        score = 0.3;
        reasons.push(`Within range (${Math.round(distance)}km away)`);
      }
    } else {
      score = 0.1;
      reasons.push(`Outside preferred distance (${Math.round(distance)}km away)`);
    }

    // Same city bonus
    if (user.location.city.toLowerCase() === candidate.location.city.toLowerCase()) {
      score += 0.2;
      reasons.push('Same city');
    }

    // Same country bonus
    if (user.location.country.toLowerCase() === candidate.location.country.toLowerCase()) {
      score += 0.1;
      reasons.push('Same country');
    }

    return { score: Math.min(1.0, score), reasons };
  }

  /**
   * Calculate overall match score
   */
  public calculateMatchScore(user: UserProfile, candidate: UserProfile): MatchScore {
    const compatibility = this.calculateCompatibilityScore(user, candidate);
    const interests = this.calculateInterestScore(user, candidate);
    const activity = this.calculateActivityScore(user, candidate);
    const location = this.calculateLocationScore(user, candidate);

    const overallScore = 
      compatibility.score * this.weights.compatibility +
      interests.score * this.weights.interests +
      activity.score * this.weights.activity +
      location.score * this.weights.location;

    const allReasons = [
      ...compatibility.reasons,
      ...interests.reasons,
      ...activity.reasons,
      ...location.reasons
    ];

    return {
      userId: candidate.id,
      compatibilityScore: compatibility.score,
      interestScore: interests.score,
      activityScore: activity.score,
      locationScore: location.score,
      overallScore,
      reasons: allReasons
    };
  }

  /**
   * Get AI-powered matches for a user
   */
  public async getSmartMatches(userId: string, limit: number = 20): Promise<MatchScore[]> {
    try {
      // Get user's dating profile
      const userProfileData = await prisma.datingProfile.findUnique({
        where: { userId, isActive: true },
        include: {
          user: {
            select: {
              id: true,
              isVerified: true
            }
          }
        }
      });

      if (!userProfileData) {
        throw new Error('User dating profile not found');
      }

      // Parse user profile
      const userProfile: UserProfile = {
        id: userId,
        age: userProfileData.age,
        bio: userProfileData.bio,
        interests: JSON.parse(userProfileData.interests),
        photos: JSON.parse(userProfileData.photos),
        location: JSON.parse(userProfileData.location),
        preferences: JSON.parse(userProfileData.preferences),
        lastActive: userProfileData.lastActive,
        isVerified: userProfileData.user.isVerified
      };

      // Get user's swipe statistics
      const swipeStats = await prisma.swipe.groupBy({
        by: ['action'],
        where: { swiperId: userId },
        _count: { action: true }
      });

      const totalLikes = swipeStats.find(s => s.action === 'like')?._count.action || 0;
      const totalPasses = swipeStats.find(s => s.action === 'pass')?._count.action || 0;
      const totalMatches = await prisma.match.count({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
          isActive: true
        }
      });

      userProfile.swipeStats = { totalLikes, totalPasses, totalMatches };

      // Get users already swiped on
      const swipedUserIds = await prisma.swipe.findMany({
        where: { swiperId: userId },
        select: { swipedUserId: true }
      });
      const excludeUserIds = swipedUserIds.map(s => s.swipedUserId);
      excludeUserIds.push(userId); // Exclude self

      // Find potential matches
      const candidateProfiles = await prisma.datingProfile.findMany({
        where: {
          userId: { notIn: excludeUserIds },
          isActive: true,
          age: {
            gte: userProfile.preferences.ageMin,
            lte: userProfile.preferences.ageMax
          },
          user: {
            isActive: true
          }
        },
        include: {
          user: {
            select: {
              id: true,
              isVerified: true
            }
          }
        },
        take: limit * 3 // Get more candidates to filter and rank
      });

      // Calculate match scores
      const matchScores: MatchScore[] = [];

      for (const candidateData of candidateProfiles) {
        try {
          const candidateProfile: UserProfile = {
            id: candidateData.userId,
            age: candidateData.age,
            bio: candidateData.bio,
            interests: JSON.parse(candidateData.interests),
            photos: JSON.parse(candidateData.photos),
            location: JSON.parse(candidateData.location),
            preferences: JSON.parse(candidateData.preferences),
            lastActive: candidateData.lastActive,
            isVerified: candidateData.user.isVerified
          };

          // Get candidate's swipe stats
          const candidateSwipeStats = await prisma.swipe.groupBy({
            by: ['action'],
            where: { swiperId: candidateData.userId },
            _count: { action: true }
          });

          const candidateLikes = candidateSwipeStats.find(s => s.action === 'like')?._count.action || 0;
          const candidatePasses = candidateSwipeStats.find(s => s.action === 'pass')?._count.action || 0;
          const candidateMatches = await prisma.match.count({
            where: {
              OR: [
                { user1Id: candidateData.userId }, 
                { user2Id: candidateData.userId }
              ],
              isActive: true
            }
          });

          candidateProfile.swipeStats = { 
            totalLikes: candidateLikes, 
            totalPasses: candidatePasses, 
            totalMatches: candidateMatches 
          };

          // Check if candidate would match user's preferences too
          const mutualCompatibility = 
            userProfile.age >= candidateProfile.preferences.ageMin &&
            userProfile.age <= candidateProfile.preferences.ageMax;

          if (mutualCompatibility) {
            const score = this.calculateMatchScore(userProfile, candidateProfile);
            matchScores.push(score);
          }
        } catch (error) {
          logger.error(`Error calculating match score for candidate ${candidateData.userId}:`, error);
        }
      }

      // Sort by overall score and apply diversity
      matchScores.sort((a, b) => b.overallScore - a.overallScore);

      // Apply diversity filter to avoid too many similar profiles
      const diverseMatches = this.applyDiversityFilter(matchScores, candidateProfiles);

      logger.info(`AI matching: Found ${diverseMatches.length} smart matches for user ${userId}`);

      return diverseMatches.slice(0, limit);
    } catch (error) {
      logger.error('Error in AI matching algorithm:', error);
      throw error;
    }
  }

  /**
   * Apply diversity filter to ensure variety in matches
   */
  private applyDiversityFilter(matchScores: MatchScore[], candidateProfiles: any[]): MatchScore[] {
    const diverseMatches: MatchScore[] = [];
    const usedLocations = new Set<string>();
    const usedAgeRanges = new Set<string>();
    const usedInterestCategories = new Set<string>();

    for (const match of matchScores) {
      const candidate = candidateProfiles.find(p => p.userId === match.userId);
      if (!candidate) continue;

      const location = JSON.parse(candidate.location);
      const interests = JSON.parse(candidate.interests);
      
      const locationKey = `${location.city}_${location.country}`;
      const ageRange = `${Math.floor(candidate.age / 5) * 5}`; // Group by 5-year ranges
      const interestCategories = this.categorizeInterests(interests);
      const primaryCategory = Object.keys(interestCategories)[0] || 'general';

      // Apply diversity penalties
      let diversityPenalty = 0;
      
      if (usedLocations.has(locationKey)) diversityPenalty += 0.1;
      if (usedAgeRanges.has(ageRange)) diversityPenalty += 0.05;
      if (usedInterestCategories.has(primaryCategory)) diversityPenalty += 0.1;

      // Still include if score is high enough or if we have few matches
      const adjustedScore = match.overallScore * (1 - diversityPenalty);
      
      if (adjustedScore > 0.3 || diverseMatches.length < 5) {
        diverseMatches.push({
          ...match,
          overallScore: adjustedScore
        });

        // Track used characteristics
        usedLocations.add(locationKey);
        usedAgeRanges.add(ageRange);
        usedInterestCategories.add(primaryCategory);
      }
    }

    return diverseMatches;
  }

  /**
   * Update user preferences based on their swiping behavior
   */
  public async updateUserPreferences(userId: string): Promise<void> {
    try {
      const swipes = await prisma.swipe.findMany({
        where: { swiperId: userId },
        include: {
          swipedUser: {
            include: {
              datingProfile: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 100 // Analyze last 100 swipes
      });

      if (swipes.length < 10) return; // Need enough data

      const likedProfiles = swipes
        .filter(s => s.action === 'like' || s.action === 'superlike')
        .map(s => s.swipedUser.datingProfile)
        .filter(Boolean);

      if (likedProfiles.length === 0) return;

      // Analyze patterns in liked profiles
      const patterns = {
        avgAge: 0,
        commonInterests: new Map<string, number>(),
        commonLocations: new Map<string, number>()
      };

      // Calculate average age of liked profiles
      patterns.avgAge = likedProfiles.reduce((sum, profile) => sum + profile.age, 0) / likedProfiles.length;

      // Find common interests
      likedProfiles.forEach(profile => {
        const interests = JSON.parse(profile.interests);
        interests.forEach((interest: string) => {
          const count = patterns.commonInterests.get(interest) || 0;
          patterns.commonInterests.set(interest, count + 1);
        });
      });

      // Find common locations
      likedProfiles.forEach(profile => {
        const location = JSON.parse(profile.location);
        const locationKey = `${location.city}_${location.country}`;
        const count = patterns.commonLocations.get(locationKey) || 0;
        patterns.commonLocations.set(locationKey, count + 1);
      });

      // Store learned preferences (in a real app, this would update ML models)
      logger.info(`Updated preferences for user ${userId}:`, {
        avgLikedAge: patterns.avgAge,
        topInterests: Array.from(patterns.commonInterests.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
        topLocations: Array.from(patterns.commonLocations.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
      });

    } catch (error) {
      logger.error(`Error updating user preferences for ${userId}:`, error);
    }
  }
}

export const matchingAlgorithm = new AIMatchingAlgorithm();
