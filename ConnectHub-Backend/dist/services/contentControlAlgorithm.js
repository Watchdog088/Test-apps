"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentControlAlgorithm = exports.ContentControlAlgorithm = exports.ContentType = exports.VisibilityLevel = void 0;
const database_1 = require("../config/database");
const logger_1 = __importDefault(require("../config/logger"));
var VisibilityLevel;
(function (VisibilityLevel) {
    VisibilityLevel["PUBLIC"] = "public";
    VisibilityLevel["FRIENDS"] = "friends";
    VisibilityLevel["CLOSE_FRIENDS"] = "close_friends";
    VisibilityLevel["FOLLOWERS"] = "followers";
    VisibilityLevel["MUTUAL_FRIENDS"] = "mutual_friends";
    VisibilityLevel["CUSTOM_LIST"] = "custom_list";
    VisibilityLevel["PRIVATE"] = "private";
})(VisibilityLevel || (exports.VisibilityLevel = VisibilityLevel = {}));
var ContentType;
(function (ContentType) {
    ContentType["POST"] = "post";
    ContentType["STORY"] = "story";
    ContentType["COMMENT"] = "comment";
    ContentType["PROFILE"] = "profile";
})(ContentType || (exports.ContentType = ContentType = {}));
class ContentControlAlgorithm {
    async canUserViewContent(viewerId, contentOwnerId, contentId, contentType, visibilitySettings) {
        try {
            if (viewerId === contentOwnerId) {
                return { canView: true };
            }
            const isBlocked = await this.isUserBlocked(contentOwnerId, viewerId);
            if (isBlocked) {
                return { canView: false, reason: 'User is blocked' };
            }
            const basicVisibilityCheck = await this.checkBasicVisibility(viewerId, contentOwnerId, visibilitySettings.visibilityLevel);
            if (!basicVisibilityCheck.canView) {
                return basicVisibilityCheck;
            }
            const customAudienceCheck = await this.checkCustomAudienceRules(viewerId, contentOwnerId, visibilitySettings);
            if (!customAudienceCheck.canView) {
                return customAudienceCheck;
            }
            const advancedFiltersCheck = await this.checkAdvancedFilters(viewerId, visibilitySettings);
            return advancedFiltersCheck;
        }
        catch (error) {
            logger_1.default.error('Error checking content visibility:', error);
            return { canView: false, reason: 'System error' };
        }
    }
    async checkBasicVisibility(viewerId, contentOwnerId, visibilityLevel) {
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
    async checkCustomAudienceRules(viewerId, contentOwnerId, visibilitySettings) {
        if (visibilitySettings.excludedUserIds?.includes(viewerId)) {
            return { canView: false, reason: 'User is explicitly excluded' };
        }
        if (visibilitySettings.includedUserIds?.includes(viewerId)) {
            return { canView: true };
        }
        if (visibilitySettings.customAudienceIds && visibilitySettings.customAudienceIds.length > 0) {
            const isInCustomAudience = await this.checkCustomAudienceMembership(viewerId, visibilitySettings.customAudienceIds);
            if (!isInCustomAudience) {
                return { canView: false, reason: 'User not in target audience' };
            }
        }
        return { canView: true };
    }
    async checkAdvancedFilters(viewerId, visibilitySettings) {
        const userProfile = await this.getUserProfile(viewerId);
        if (!userProfile) {
            return { canView: false, reason: 'User profile not found' };
        }
        if (visibilitySettings.locationFilters) {
            const locationCheck = this.checkLocationFilters(userProfile, visibilitySettings.locationFilters);
            if (!locationCheck.canView)
                return locationCheck;
        }
        if (visibilitySettings.demographicFilters) {
            const demographicCheck = this.checkDemographicFilters(userProfile, visibilitySettings.demographicFilters);
            if (!demographicCheck.canView)
                return demographicCheck;
        }
        if (visibilitySettings.interestFilters) {
            const interestCheck = this.checkInterestFilters(userProfile, visibilitySettings.interestFilters);
            if (!interestCheck.canView)
                return interestCheck;
        }
        if (visibilitySettings.relationshipFilters) {
            const relationshipCheck = await this.checkRelationshipFilters(viewerId, userProfile, visibilitySettings.relationshipFilters);
            if (!relationshipCheck.canView)
                return relationshipCheck;
        }
        return { canView: true };
    }
    checkLocationFilters(userProfile, locationFilters) {
        const userLocation = userProfile.location;
        if (!userLocation) {
            return { canView: false, reason: 'Location information required' };
        }
        if (locationFilters.excludeCountries?.includes(userLocation.country)) {
            return { canView: false, reason: 'Content not available in your country' };
        }
        if (locationFilters.excludeCities?.includes(userLocation.city)) {
            return { canView: false, reason: 'Content not available in your city' };
        }
        if (locationFilters.countries && locationFilters.countries.length > 0) {
            if (!locationFilters.countries.includes(userLocation.country)) {
                return { canView: false, reason: 'Content only available in specific countries' };
            }
        }
        if (locationFilters.cities && locationFilters.cities.length > 0) {
            if (!locationFilters.cities.includes(userLocation.city)) {
                return { canView: false, reason: 'Content only available in specific cities' };
            }
        }
        return { canView: true };
    }
    checkDemographicFilters(userProfile, demographicFilters) {
        if (demographicFilters.ageMin && userProfile.age && userProfile.age < demographicFilters.ageMin) {
            return { canView: false, reason: 'Content restricted by minimum age requirement' };
        }
        if (demographicFilters.ageMax && userProfile.age && userProfile.age > demographicFilters.ageMax) {
            return { canView: false, reason: 'Content restricted by maximum age requirement' };
        }
        if (demographicFilters.verifiedOnly && !userProfile.isVerified) {
            return { canView: false, reason: 'Content only visible to verified users' };
        }
        return { canView: true };
    }
    checkInterestFilters(userProfile, interestFilters) {
        const userInterests = userProfile.interests || [];
        if (interestFilters.includeInterests && interestFilters.includeInterests.length > 0) {
            const hasRequiredInterest = interestFilters.includeInterests.some(interest => userInterests.includes(interest));
            if (!hasRequiredInterest) {
                return { canView: false, reason: 'Content targeted to specific interests' };
            }
        }
        if (interestFilters.excludeInterests && interestFilters.excludeInterests.length > 0) {
            const hasExcludedInterest = interestFilters.excludeInterests.some(interest => userInterests.includes(interest));
            if (hasExcludedInterest) {
                return { canView: false, reason: 'Content not suitable for your interests' };
            }
        }
        return { canView: true };
    }
    async checkRelationshipFilters(viewerId, userProfile, relationshipFilters) {
        if (relationshipFilters.minimumMutualFriends) {
            const mutualFriendsCount = userProfile.mutualFriendsCount || 0;
            if (mutualFriendsCount < relationshipFilters.minimumMutualFriends) {
                return { canView: false, reason: 'Minimum mutual friends requirement not met' };
            }
        }
        if (relationshipFilters.followersOnly) {
            const isFollower = await this.isFollowing(viewerId, userProfile.id);
            if (!isFollower) {
                return { canView: false, reason: 'Only followers can view this content' };
            }
        }
        if (relationshipFilters.followingOnly) {
            const isFollowing = await this.isFollowing(userProfile.id, viewerId);
            if (!isFollowing) {
                return { canView: false, reason: 'Only users you follow can view this content' };
            }
        }
        return { canView: true };
    }
    async createCustomAudience(userId, audienceRule) {
        try {
            const matchingUsers = [];
            const potentialUsers = await this.getPotentialAudienceUsers(userId);
            for (const user of potentialUsers) {
                const userProfile = await this.getUserProfile(user.id);
                if (!userProfile)
                    continue;
                let matchesAllConditions = true;
                for (const condition of audienceRule.conditions) {
                    const conditionResult = await this.evaluateAudienceCondition(userProfile, condition, userId);
                    if (!conditionResult) {
                        matchesAllConditions = false;
                        break;
                    }
                }
                if (matchesAllConditions) {
                    matchingUsers.push(user.id);
                }
            }
            await this.saveCustomAudience(userId, audienceRule.id, matchingUsers);
            logger_1.default.info(`Created custom audience "${audienceRule.name}" with ${matchingUsers.length} users`);
            return matchingUsers;
        }
        catch (error) {
            logger_1.default.error('Error creating custom audience:', error);
            throw error;
        }
    }
    async evaluateAudienceCondition(userProfile, condition, ownerId) {
        switch (condition.type) {
            case 'age':
                if (!userProfile.age)
                    return false;
                return this.evaluateNumericCondition(userProfile.age, condition.operator, condition.value);
            case 'location':
                if (!userProfile.location)
                    return false;
                return this.evaluateLocationCondition(userProfile.location, condition.operator, condition.value);
            case 'interests':
                if (!userProfile.interests)
                    return false;
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
    evaluateNumericCondition(value, operator, targetValue) {
        switch (operator) {
            case 'equals': return value === targetValue;
            case 'not_equals': return value !== targetValue;
            case 'greater_than': return value > targetValue;
            case 'less_than': return value < targetValue;
            default: return false;
        }
    }
    evaluateLocationCondition(location, operator, targetValue) {
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
    evaluateArrayCondition(array, operator, targetValue) {
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
    evaluateBooleanCondition(value, operator, targetValue) {
        switch (operator) {
            case 'equals':
                return value === targetValue;
            case 'not_equals':
                return value !== targetValue;
            default:
                return false;
        }
    }
    async isUserBlocked(blockerId, blockedId) {
        const report = await database_1.prisma.report.findFirst({
            where: {
                reporterId: blockerId,
                targetId: blockedId,
                targetType: 'user'
            }
        });
        return !!report;
    }
    async areFriends(userId1, userId2) {
        const [follow1, follow2] = await Promise.all([
            database_1.prisma.follow.findFirst({
                where: { followerId: userId1, followingId: userId2 }
            }),
            database_1.prisma.follow.findFirst({
                where: { followerId: userId2, followingId: userId1 }
            })
        ]);
        return !!(follow1 && follow2);
    }
    async isCloseFriend(userId, friendId) {
        const areFriends = await this.areFriends(userId, friendId);
        return areFriends;
    }
    async isFollowing(followerId, followingId) {
        const follow = await database_1.prisma.follow.findFirst({
            where: {
                followerId,
                followingId
            }
        });
        return !!follow;
    }
    async haveMutualFriends(userId1, userId2) {
        const mutualCount = await this.getMutualFriendsCount(userId1, userId2);
        return mutualCount > 0;
    }
    async getMutualFriendsCount(userId1, userId2) {
        const [user1Following, user2Following] = await Promise.all([
            database_1.prisma.follow.findMany({
                where: { followerId: userId1 },
                select: { followingId: true }
            }),
            database_1.prisma.follow.findMany({
                where: { followerId: userId2 },
                select: { followingId: true }
            })
        ]);
        const user1FollowingIds = user1Following.map(f => f.followingId);
        const user2FollowingIds = user2Following.map(f => f.followingId);
        const mutualConnections = user1FollowingIds.filter(id => user2FollowingIds.includes(id));
        return mutualConnections.length;
    }
    async checkCustomAudienceMembership(userId, customAudienceIds) {
        const hasConnections = await database_1.prisma.follow.findFirst({
            where: {
                OR: [
                    { followerId: userId },
                    { followingId: userId }
                ]
            }
        });
        return !!hasConnections;
    }
    async getUserProfile(userId) {
        const [user, datingProfile] = await Promise.all([
            database_1.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    location: true,
                    isVerified: true,
                    followersCount: true,
                    dateOfBirth: true
                }
            }),
            database_1.prisma.datingProfile.findUnique({
                where: { userId },
                select: {
                    age: true,
                    interests: true
                }
            })
        ]);
        if (!user)
            return null;
        let age;
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
            location: user.location ? JSON.parse(user.location) : undefined,
            interests: datingProfile?.interests ? JSON.parse(datingProfile.interests) : [],
            isVerified: user.isVerified,
            followersCount: user.followersCount
        };
    }
    async getPotentialAudienceUsers(userId) {
        const [followers, following] = await Promise.all([
            database_1.prisma.follow.findMany({
                where: { followingId: userId },
                select: { followerId: true }
            }),
            database_1.prisma.follow.findMany({
                where: { followerId: userId },
                select: { followingId: true }
            })
        ]);
        const userIds = new Set();
        followers.forEach(f => userIds.add(f.followerId));
        following.forEach(f => userIds.add(f.followingId));
        return Array.from(userIds).map(id => ({ id }));
    }
    async saveCustomAudience(userId, audienceId, memberIds) {
        await database_1.prisma.analytics.create({
            data: {
                userId,
                eventType: 'custom_audience_created',
                eventData: JSON.stringify({
                    audienceId,
                    memberCount: memberIds.length,
                    memberIds: memberIds.slice(0, 10)
                })
            }
        });
    }
    async getFilteredFeed(viewerId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const posts = await database_1.prisma.post.findMany({
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
            take: limit * 3
        });
        const filteredPosts = [];
        for (const post of posts) {
            if (filteredPosts.length >= limit)
                break;
            const visibility = post.visibility || 'public';
            const visibilitySettings = {
                visibilityLevel: visibility
            };
            const canView = await this.canUserViewContent(viewerId, post.userId, post.id, ContentType.POST, visibilitySettings);
            if (canView.canView) {
                filteredPosts.push(post);
            }
        }
        return filteredPosts;
    }
}
exports.ContentControlAlgorithm = ContentControlAlgorithm;
exports.contentControlAlgorithm = new ContentControlAlgorithm();
//# sourceMappingURL=contentControlAlgorithm.js.map