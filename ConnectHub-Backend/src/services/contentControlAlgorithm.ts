import { prisma } from '../config/database';
import logger from '../config/logger';

export enum VisibilityLevel {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  CLOSE_FRIENDS = 'close_friends',
  FOLLOWERS = 'followers',
  MUTUAL_FRIENDS = 'mutual_friends',
  CUSTOM_LIST = 'custom_list',
  PRIVATE = 'private'
}

export enum ContentType {
  POST = 'post',
  STORY = 'story',
  COMMENT = 'comment',
  PROFILE = 'profile'
}

export interface AudienceRule {
  id: string;
  name: string;
  conditions: AudienceCondition[];
  isActive: boolean;
}

export interface AudienceCondition {
  type: 'location' | 'age' | 'interests' | 'followers' | 'mutualFriends' | 'verified' | 'customList';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in';
  value: any;
}

export interface ContentVisibilitySettings {
  visibilityLevel: VisibilityLevel;
  customAudienceIds?: string[];
  excludedUserIds?: string[];
  includedUserIds?: string[];
  locationFilters?: {
    countries?: string[];
    cities?: string[];
    excludeCountries?: string[];
    excludeCities?: string[];
  };
  demographicFilters?: {
    ageMin?: number;
    ageMax?: number;
    genders?: string[];
    verifiedOnly?: boolean;
  };
  interestFilters?: {
    includeInterests?: string[];
    excludeInterests?: string[];
  };
  relationshipFilters?: {
    minimumMutualFriends?: number;
    followersOnly?: boolean;
    followingOnly?: boolean;
  };
}

export interface UserProfile {
  id: string;
  age?: number;
  location?: {
    country: string;
    city: string;
  };
  interests?: string[];
  isVerified: boolean;
  followersCount: number;
  mutualFriendsCount?: number;
  relationshipStatus?: string;
}

export class ContentControlAlgorithm {
  
  /**
   * Check if a user can view specific content
   */
  public async canUserViewContent(
    viewerId: string,
    contentOwnerId: string,
    contentId: string,
    contentType: ContentType,
    visibilitySettings: ContentVisibilitySettings
  ): Promise<{ canView: boolean; reason?: string }> {
    
    try {
      // Owner can always see their own content
      if (viewerId === contentOwnerId) {
        return { canView: true };
      }

      // Check if viewer is blocked
      const isBlocked = await this.isUserBlocked(contentOwnerId, viewerId);
      if (isBlocked) {
        return { canView: false, reason: 'User is blocked' };
      }

      // Check basic visibility level
      const basicVisibilityCheck = await this.checkBasicVisibility(
        viewerId,
        contentOwnerId,
        visibilitySettings.visibilityLevel
      );

      if (!basicVisibilityCheck.canView) {
        return basicVisibilityCheck;
      }

      // Check custom audience rules
      const customAudienceCheck = await this.checkCustomAudienceRules(
        viewerId,
        contentOwnerId,
        visibilitySettings
      );

      if (!customAudienceCheck.canView) {
        return customAudienceCheck;
      }

      // Check advanced filters
      const advancedFiltersCheck = await this.checkAdvancedFilters(
        viewerId,
        visibilitySettings
      );

      return advancedFiltersCheck;

    } catch (error) {
      logger.error('Error checking content visibility:', error);
      return { canView: false, reason: 'System error' };
    }
  }

  /**
   * Check basic visibility levels
   */
  private async checkBasicVisibility(
    viewerId: string,
    contentOwnerId: string,
    visibilityLevel: VisibilityLevel
  ): Promise<{ canView: boolean; reason?: string }> {

    switch (visibilityLevel) {
      case VisibilityLevel.PUBLIC:
        return { canView: true };

      case VisibilityLevel.PRIVATE:
        return { canView: false, reason: 'Content is private' };

      case VisibilityLevel.FRIENDS:
        const areFriends = await this.areFriends(contentOwnerId, viewerId);
        return areFriends 
          ? { canView: true } 
          : { canView: false, reason: 'Only friends can view this content' };

      case VisibilityLevel.CLOSE_FRIENDS:
        const isCloseFriend = await this.isCloseFriend(contentOwnerId, viewerId);
        return isCloseFriend
          ? { canView: true }
          : { canView: false, reason: 'Only close friends can view this content' };

      case VisibilityLevel.FOLLOWERS:
        const isFollower = await this.isFollowing(viewerId, contentOwnerId);
        return isFollower
          ? { canView: true }
          : { canView: false, reason: 'Only followers can view this content' };

      case VisibilityLevel.MUTUAL_FRIENDS:
        const haveMutualFriends = await this.haveMutualFriends(contentOwnerId, viewerId);
        return haveMutualFriends
          ? { canView: true }
          : { canView: false, reason: 'Only users with mutual friends can view this content' };

      default:
        return { canView: false, reason: 'Invalid visibility level' };
    }
  }

  /**
   * Check custom audience rules
   */
  private async checkCustomAudienceRules(
    viewerId: string,
    contentOwnerId: string,
    visibilitySettings: ContentVisibilitySettings
  ): Promise<{ canView: boolean; reason?: string }> {

    // Check explicit exclusions
    if (visibilitySettings.excludedUserIds?.includes(viewerId)) {
      return { canView: false, reason: 'User is explicitly excluded' };
    }

    // Check explicit inclusions
    if (visibilitySettings.includedUserIds?.includes(viewerId)) {
      return { canView: true };
    }

    // Check custom audience lists
    if (visibilitySettings.customAudienceIds && visibilitySettings.customAudienceIds.length > 0) {
      const isInCustomAudience = await this.checkCustomAudienceMembership(
        viewerId,
        visibilitySettings.customAudienceIds
      );
      
      if (!isInCustomAudience) {
        return { canView: false, reason: 'User not in target audience' };
      }
    }

    return { canView: true };
  }

  /**
   * Check advanced demographic and interest filters
   */
  private async checkAdvancedFilters(
    viewerId: string,
    visibilitySettings: ContentVisibilitySettings
  ): Promise<{ canView: boolean; reason?: string }> {

    const userProfile = await this.getUserProfile(viewerId);
    
    if (!userProfile) {
      return { canView: false, reason: 'User profile not found' };
    }

    // Check location filters
    if (visibilitySettings.locationFilters) {
      const locationCheck = this.checkLocationFilters(userProfile, visibilitySettings.locationFilters);
      if (!locationCheck.canView) return locationCheck;
    }

    // Check demographic filters
    if (visibilitySettings.demographicFilters) {
      const demographicCheck = this.checkDemographicFilters(userProfile, visibilitySettings.demographicFilters);
      if (!demographicCheck.canView) return demographicCheck;
    }

    // Check interest filters
    if (visibilitySettings.interestFilters) {
      const interestCheck = this.checkInterestFilters(userProfile, visibilitySettings.interestFilters);
      if (!interestCheck.canView) return interestCheck;
    }

    // Check relationship filters
    if (visibilitySettings.relationshipFilters) {
      const relationshipCheck = await this.checkRelationshipFilters(
        viewerId,
        userProfile,
        visibilitySettings.relationshipFilters
      );
      if (!relationshipCheck.canView) return relationshipCheck;
    }

    return { canView: true };
  }

  /**
   * Check location-based filters
   */
  private checkLocationFilters(
    userProfile: UserProfile,
    locationFilters: ContentVisibilitySettings['locationFilters']
  ): { canView: boolean; reason?: string } {

    const userLocation = userProfile.location;
    if (!userLocation) {
      return { canView: false, reason: 'Location information required' };
    }

    // Check excluded countries
    if (locationFilters.excludeCountries?.includes(userLocation.country)) {
      return { canView: false, reason: 'Content not available in your country' };
    }

    // Check excluded cities
    if (locationFilters.excludeCities?.includes(userLocation.city)) {
      return { canView: false, reason: 'Content not available in your city' };
    }

    // Check included countries (if specified)
    if (locationFilters.countries && locationFilters.countries.length > 0) {
      if (!locationFilters.countries.includes(userLocation.country)) {
        return { canView: false, reason: 'Content only available in specific countries' };
      }
    }

    // Check included cities (if specified)
    if (locationFilters.cities && locationFilters.cities.length > 0) {
      if (!locationFilters.cities.includes(userLocation.city)) {
        return { canView: false, reason: 'Content only available in specific cities' };
      }
    }

    return { canView: true };
  }

  /**
   * Check demographic filters
   */
  private checkDemographicFilters(
    userProfile: UserProfile,
    demographicFilters: ContentVisibilitySettings['demographicFilters']
  ): { canView: boolean; reason?: string } {

    // Check age filters
    if (demographicFilters.ageMin && userProfile.age && userProfile.age < demographicFilters.ageMin) {
      return { canView: false, reason: 'Content restricted by minimum age requirement' };
    }

    if (demographicFilters.ageMax && userProfile.age && userProfile.age > demographicFilters.ageMax) {
      return { canView: false, reason: 'Content restricted by maximum age requirement' };
    }

    // Check verification requirement
    if (demographicFilters.verifiedOnly && !userProfile.isVerified) {
      return { canView: false, reason: 'Content only visible to verified users' };
    }

    return { canView: true };
  }

  /**
   * Check interest-based filters
   */
  private checkInterestFilters(
    userProfile: UserProfile,
    interestFilters: ContentVisibilitySettings['interestFilters']
  ): { canView: boolean; reason?: string } {

    const userInterests = userProfile.interests || [];

    // Check required interests
    if (interestFilters.includeInterests && interestFilters.includeInterests.length > 0) {
      const hasRequiredInterest = interestFilters.includeInterests.some(
        interest => userInterests.includes(interest)
      );
      
      if (!hasRequiredInterest) {
        return { canView: false, reason: 'Content targeted to specific interests' };
      }
    }

    // Check excluded interests
    if (interestFilters.excludeInterests && interestFilters.excludeInterests.length > 0) {
      const hasExcludedInterest = interestFilters.excludeInterests.some(
        interest => userInterests.includes(interest)
      );
      
      if (hasExcludedInterest) {
        return { canView: false, reason: 'Content not suitable for your interests' };
      }
    }

    return { canView: true };
  }

  /**
   * Check relationship-based filters
   */
  private async checkRelationshipFilters(
    viewerId: string,
    userProfile: UserProfile,
    relationshipFilters: ContentVisibilitySettings['relationshipFilters']
  ): Promise<{ canView: boolean; reason?: string }> {

    // Check minimum mutual friends requirement
    if (relationshipFilters.minimumMutualFriends) {
      const mutualFriendsCount = userProfile.mutualFriendsCount || 0;
      if (mutualFriendsCount < relationshipFilters.minimumMutualFriends) {
        return { canView: false, reason: 'Minimum mutual friends requirement not met' };
      }
    }

    // Check followers only
    if (relationshipFilters.followersOnly) {
      const isFollower = await this.isFollowing(viewerId, userProfile.id);
      if (!isFollower) {
        return { canView: false, reason: 'Only followers can view this content' };
      }
    }

    // Check following only
    if (relationshipFilters.followingOnly) {
      const isFollowing = await this.isFollowing(userProfile.id, viewerId);
      if (!isFollowing) {
        return { canView: false, reason: 'Only users you follow can view this content' };
      }
    }

    return { canView: true };
  }

  /**
   * Create custom audience based on rules
   */
  public async createCustomAudience(
    userId: string,
    audienceRule: AudienceRule
  ): Promise<string[]> {
    try {
      const matchingUsers: string[] = [];

      // Get all potential users (friends, followers, etc.)
      const potentialUsers = await this.getPotentialAudienceUsers(userId);

      for (const user of potentialUsers) {
        const userProfile = await this.getUserProfile(user.id);
        if (!userProfile) continue;

        let matchesAllConditions = true;

        for (const condition of audienceRule.conditions) {
          const conditionResult = await this.evaluateAudienceCondition(
            userProfile,
            condition,
            userId
          );
          
          if (!conditionResult) {
            matchesAllConditions = false;
            break;
          }
        }

        if (matchesAllConditions) {
          matchingUsers.push(user.id);
        }
      }

      // Store the custom audience
      await this.saveCustomAudience(userId, audienceRule.id, matchingUsers);

      logger.info(`Created custom audience "${audienceRule.name}" with ${matchingUsers.length} users`);
      
      return matchingUsers;

    } catch (error) {
      logger.error('Error creating custom audience:', error);
      throw error;
    }
  }

  /**
   * Evaluate a single audience condition
   */
  private async evaluateAudienceCondition(
    userProfile: UserProfile,
    condition: AudienceCondition,
    ownerId: string
  ): Promise<boolean> {

    switch (condition.type) {
      case 'age':
        if (!userProfile.age) return false;
        return this.evaluateNumericCondition(userProfile.age, condition.operator, condition.value);

      case 'location':
        if (!userProfile.location) return false;
        return this.evaluateLocationCondition(userProfile.location, condition.operator, condition.value);

      case 'interests':
        if (!userProfile.interests) return false;
        return this.evaluateArrayCondition(userProfile.interests, condition.operator, condition.value);

      case 'verified':
        return this.evaluateBooleanCondition(userProfile.isVerified, condition.operator, condition.value);

      case 'followers':
        return this.evaluateNumericCondition(userProfile.followersCount, condition.operator, condition.value);

      case 'mutualFriends':
        const mutualCount = await this.getMutualFriendsCount(ownerId, userProfile.id);
        return this.evaluateNumericCondition(mutualCount, condition.operator, condition.value);

      default:
        return false;
    }
  }

  private evaluateNumericCondition(value: number, operator: string, targetValue: number): boolean {
    switch (operator) {
      case 'equals': return value === targetValue;
      case 'not_equals': return value !== targetValue;
      case 'greater_than': return value > targetValue;
      case 'less_than': return value < targetValue;
      default: return false;
    }
  }

  private evaluateLocationCondition(location: any, operator: string, targetValue: any): boolean {
    const locationString = `${location.city}, ${location.country}`;
    
    switch (operator) {
      case 'contains':
        return locationString.toLowerCase().includes(targetValue.toLowerCase());
      case 'not_contains':
        return !locationString.toLowerCase().includes(targetValue.toLowerCase());
      case 'equals':
        return location.country === targetValue || location.city === targetValue;
      case 'not_equals':
        return location.country !== targetValue && location.city !== targetValue;
      default:
        return false;
    }
  }

  private evaluateArrayCondition(array: string[], operator: string, targetValue: any): boolean {
    switch (operator) {
      case 'contains':
        return Array.isArray(targetValue) 
          ? targetValue.some(val => array.includes(val))
          : array.includes(targetValue);
      case 'not_contains':
        return Array.isArray(targetValue)
          ? !targetValue.some(val => array.includes(val))
          : !array.includes(targetValue);
      case 'in':
        return Array.isArray(targetValue) && array.some(item => targetValue.includes(item));
      case 'not_in':
        return Array.isArray(targetValue) && !array.some(item => targetValue.includes(item));
      default:
        return false;
    }
  }

  private evaluateBooleanCondition(value: boolean, operator: string, targetValue: boolean): boolean {
    switch (operator) {
      case 'equals':
        return value === targetValue;
      case 'not_equals':
        return value !== targetValue;
      default:
        return false;
    }
  }

  // Helper methods for database queries

  private async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    // Check if user is blocked via reports (simplified blocking mechanism)
    const report = await prisma.report.findFirst({
      where: {
        reporterId: blockerId,
        targetId: blockedId,
        targetType: 'user'
      }
    });
    return !!report;
  }

  private async areFriends(userId1: string, userId2: string): Promise<boolean> {
    // Check if users are following each other (mutual follows = friends)
    const [follow1, follow2] = await Promise.all([
      prisma.follow.findFirst({
        where: { followerId: userId1, followingId: userId2 }
      }),
      prisma.follow.findFirst({
        where: { followerId: userId2, followingId: userId1 }
      })
    ]);
    return !!(follow1 && follow2);
  }

  private async isCloseFriend(userId: string, friendId: string): Promise<boolean> {
    // For now, consider close friends as mutual followers with high engagement
    const areFriends = await this.areFriends(userId, friendId);
    return areFriends; // Simplified - all friends are close friends
  }

  private async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await prisma.follow.findFirst({
      where: {
        followerId,
        followingId
      }
    });
    return !!follow;
  }

  private async haveMutualFriends(userId1: string, userId2: string): Promise<boolean> {
    const mutualCount = await this.getMutualFriendsCount(userId1, userId2);
    return mutualCount > 0;
  }

  private async getMutualFriendsCount(userId1: string, userId2: string): Promise<number> {
    // Get mutual followers (simplified mutual friends logic)
    const [user1Following, user2Following] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId1 },
        select: { followingId: true }
      }),
      prisma.follow.findMany({
        where: { followerId: userId2 },
        select: { followingId: true }
      })
    ]);

    const user1FollowingIds = user1Following.map(f => f.followingId);
    const user2FollowingIds = user2Following.map(f => f.followingId);

    // Find mutual connections
    const mutualConnections = user1FollowingIds.filter(id => user2FollowingIds.includes(id));
    return mutualConnections.length;
  }

  private async checkCustomAudienceMembership(
    userId: string,
    customAudienceIds: string[]
  ): Promise<boolean> {
    // Simplified: For now, return true if user has any followers/following
    // In a real implementation, you'd create custom audience tables
    const hasConnections = await prisma.follow.findFirst({
      where: {
        OR: [
          { followerId: userId },
          { followingId: userId }
        ]
      }
    });
    return !!hasConnections;
  }

  private async getUserProfile(userId: string): Promise<UserProfile | null> {
    const [user, datingProfile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          location: true,
          isVerified: true,
          followersCount: true,
          dateOfBirth: true
        }
      }),
      prisma.datingProfile.findUnique({
        where: { userId },
        select: {
          age: true,
          interests: true
        }
      })
    ]);

    if (!user) return null;

    // Calculate age from dateOfBirth if available
    let age: number | undefined;
    if (user.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(user.dateOfBirth);
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    return {
      id: user.id,
      age: datingProfile?.age || age,
      location: user.location ? JSON.parse(user.location as string) : undefined,
      interests: datingProfile?.interests ? JSON.parse(datingProfile.interests as string) : [],
      isVerified: user.isVerified,
      followersCount: user.followersCount
    };
  }

  private async getPotentialAudienceUsers(userId: string): Promise<Array<{ id: string }>> {
    // Get followers and following
    const [followers, following] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        select: { followerId: true }
      }),
      prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true }
      })
    ]);

    const userIds = new Set<string>();
    
    followers.forEach(f => userIds.add(f.followerId));
    following.forEach(f => userIds.add(f.followingId));

    return Array.from(userIds).map(id => ({ id }));
  }

  private async saveCustomAudience(
    userId: string,
    audienceId: string,
    memberIds: string[]
  ): Promise<void> {
    // For now, store in analytics as a custom event
    // In a real implementation, you'd create custom audience tables
    await prisma.analytics.create({
      data: {
        userId,
        eventType: 'custom_audience_created',
        eventData: JSON.stringify({
          audienceId,
          memberCount: memberIds.length,
          memberIds: memberIds.slice(0, 10) // Store first 10 IDs as sample
        })
      }
    });
  }

  /**
   * Get feed with content visibility filtering
   */
  public async getFilteredFeed(
    viewerId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<any[]> {
    const skip = (page - 1) * limit;
    
    // Get all potential posts
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isVerified: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit * 3 // Get more to filter
    });

    const filteredPosts = [];

    for (const post of posts) {
      if (filteredPosts.length >= limit) break;

      // Use post visibility or default to public
      const visibility = post.visibility || 'public';
      const visibilitySettings: ContentVisibilitySettings = {
        visibilityLevel: visibility as VisibilityLevel
      };

      const canView = await this.canUserViewContent(
        viewerId,
        post.userId,
        post.id,
        ContentType.POST,
        visibilitySettings
      );

      if (canView.canView) {
        filteredPosts.push(post);
      }
    }

    return filteredPosts;
  }
}

export const contentControlAlgorithm = new ContentControlAlgorithm();
