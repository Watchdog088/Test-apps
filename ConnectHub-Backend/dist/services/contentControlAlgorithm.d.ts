export declare enum VisibilityLevel {
    PUBLIC = "public",
    FRIENDS = "friends",
    CLOSE_FRIENDS = "close_friends",
    FOLLOWERS = "followers",
    MUTUAL_FRIENDS = "mutual_friends",
    CUSTOM_LIST = "custom_list",
    PRIVATE = "private"
}
export declare enum ContentType {
    POST = "post",
    STORY = "story",
    COMMENT = "comment",
    PROFILE = "profile"
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
export declare class ContentControlAlgorithm {
    canUserViewContent(viewerId: string, contentOwnerId: string, contentId: string, contentType: ContentType, visibilitySettings: ContentVisibilitySettings): Promise<{
        canView: boolean;
        reason?: string;
    }>;
    private checkBasicVisibility;
    private checkCustomAudienceRules;
    private checkAdvancedFilters;
    private checkLocationFilters;
    private checkDemographicFilters;
    private checkInterestFilters;
    private checkRelationshipFilters;
    createCustomAudience(userId: string, audienceRule: AudienceRule): Promise<string[]>;
    private evaluateAudienceCondition;
    private evaluateNumericCondition;
    private evaluateLocationCondition;
    private evaluateArrayCondition;
    private evaluateBooleanCondition;
    private isUserBlocked;
    private areFriends;
    private isCloseFriend;
    private isFollowing;
    private haveMutualFriends;
    private getMutualFriendsCount;
    private checkCustomAudienceMembership;
    private getUserProfile;
    private getPotentialAudienceUsers;
    private saveCustomAudience;
    getFilteredFeed(viewerId: string, page?: number, limit?: number): Promise<any[]>;
}
export declare const contentControlAlgorithm: ContentControlAlgorithm;
