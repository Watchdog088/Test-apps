export interface DatingProfile {
  id: string;
  userId: string;
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
    interestedIn: 'men' | 'women' | 'everyone';
  };
  isActive: boolean;
  isVerified: boolean;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  isActive: boolean;
  createdAt: Date;
  lastMessageAt?: Date;
}

export interface MatchWithProfile extends Match {
  profile: DatingProfile & {
    user: {
      username: string;
      firstName?: string;
      lastName?: string;
    };
  };
  distance?: number;
  compatibility?: number;
}

export interface DateRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  matchId: string;
  message: string;
  proposedDate: Date;
  location: string;
  dateType: 'coffee' | 'dinner' | 'activity' | 'drinks' | 'lunch' | 'custom';
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Swipe {
  id: string;
  swiperId: string;
  swipedUserId: string;
  action: 'like' | 'pass' | 'superlike';
  createdAt: Date;
}

export interface CreateDatingProfileRequest {
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
    interestedIn: 'men' | 'women' | 'everyone';
  };
}

export interface UpdateDatingProfileRequest {
  age?: number;
  bio?: string;
  interests?: string[];
  photos?: string[];
  location?: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  preferences?: {
    ageMin: number;
    ageMax: number;
    maxDistance: number;
    interestedIn: 'men' | 'women' | 'everyone';
  };
  isActive?: boolean;
}

export interface SwipeRequest {
  targetUserId: string;
  action: 'like' | 'pass' | 'superlike';
}

export interface CreateDateRequest {
  matchId: string;
  message: string;
  proposedDate: Date;
  location: string;
  dateType: 'coffee' | 'dinner' | 'activity' | 'drinks' | 'lunch' | 'custom';
}

export interface DiscoveryOptions {
  maxDistance?: number;
  ageMin?: number;
  ageMax?: number;
  limit?: number;
  excludeUserIds?: string[];
}

export interface DatingStats {
  totalSwipes: number;
  totalMatches: number;
  totalDates: number;
  matchRate: number;
  superLikesReceived: number;
  profileViews: number;
}
