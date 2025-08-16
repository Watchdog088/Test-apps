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
export declare class AIMatchingAlgorithm {
    private readonly weights;
    private readonly interestCategories;
    private calculateDistance;
    private toRadians;
    private calculateCompatibilityScore;
    private calculateInterestScore;
    private categorizeInterests;
    private calculateActivityScore;
    private calculateLocationScore;
    calculateMatchScore(user: UserProfile, candidate: UserProfile): MatchScore;
    getSmartMatches(userId: string, limit?: number): Promise<MatchScore[]>;
    private applyDiversityFilter;
    updateUserPreferences(userId: string): Promise<void>;
}
export declare const matchingAlgorithm: AIMatchingAlgorithm;
export {};
