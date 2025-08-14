export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  coverPhoto?: string;
  isVerified: boolean;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  location?: string;
  website?: string;
  dateOfBirth?: Date;
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}

export interface UserProfile extends Omit<User, 'password'> {
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  mutualFollowers?: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  dateOfBirth?: Date;
  isPrivate?: boolean;
  interests?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}
