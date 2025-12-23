/**
 * MongoDB Schemas for ConnectHub
 * NoSQL/Document Database for flexible, unstructured data
 * Handles: Analytics, Logs, Real-time data, Media metadata, User activities
 */

import mongoose, { Schema, Document } from 'mongoose';

// ============================================================================
// ANALYTICS & ENGAGEMENT (Document Store)
// ============================================================================

export interface IPostAnalytics extends Document {
  postId: string;
  views: {
    total: number;
    unique: number;
    byDate: Map<string, number>;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    clickThroughRate: number;
  };
  demographics: {
    ageGroups: Map<string, number>;
    genderDistribution: Map<string, number>;
    topLocations: Array<{ location: string; count: number }>;
  };
  reachMetrics: {
    organic: number;
    viral: number;
    promoted: number;
  };
  timestamp: Date;
}

const PostAnalyticsSchema = new Schema<IPostAnalytics>({
  postId: { type: String, required: true, index: true },
  views: {
    total: { type: Number, default: 0 },
    unique: { type: Number, default: 0 },
    byDate: { type: Map, of: Number, default: new Map() }
  },
  engagement: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    clickThroughRate: { type: Number, default: 0 }
  },
  demographics: {
    ageGroups: { type: Map, of: Number, default: new Map() },
    genderDistribution: { type: Map, of: Number, default: new Map() },
    topLocations: [{ location: String, count: Number }]
  },
  reachMetrics: {
    organic: { type: Number, default: 0 },
    viral: { type: Number, default: 0 },
    promoted: { type: Number, default: 0 }
  },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'post_analytics'
});

PostAnalyticsSchema.index({ postId: 1, timestamp: -1 });
export const PostAnalytics = mongoose.model<IPostAnalytics>('PostAnalytics', PostAnalyticsSchema);

// ============================================================================
// USER ACTIVITY TRACKING
// ============================================================================

export interface IUserActivity extends Document {
  userId: string;
  activityType: string;
  entityType?: string;
  entityId?: string;
  metadata: Record<string, any>;
  deviceInfo: {
    deviceType: string;
    os: string;
    browser: string;
  };
  location: {
    country?: string;
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  timestamp: Date;
}

const UserActivitySchema = new Schema<IUserActivity>({
  userId: { type: String, required: true, index: true },
  activityType: { type: String, required: true, index: true },
  entityType: String,
  entityId: String,
  metadata: { type: Schema.Types.Mixed, default: {} },
  deviceInfo: {
    deviceType: String,
    os: String,
    browser: String
  },
  location: {
    country: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true,
  collection: 'user_activities'
});

// TTL Index - Auto-delete after 90 days
UserActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });
export const UserActivity = mongoose.model<IUserActivity>('UserActivity', UserActivitySchema);

// ============================================================================
// MEDIA METADATA (For S3 Objects)
// ============================================================================

export interface IMediaMetadata extends Document {
  mediaId: string;
  userId: string;
  s3Key: string;
  s3Bucket: string;
  cloudFrontUrl?: string;
  
  mediaType: 'image' | 'video' | 'audio' | 'document';
  mimeType: string;
  fileSize: number;
  
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // For video/audio in seconds
  
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  thumbnailUrl?: string;
  
  metadata: {
    originalName?: string;
    uploadedFrom?: string;
    compressionApplied?: boolean;
    watermarked?: boolean;
  };
  
  uploadedAt: Date;
  expiresAt?: Date;
}

const MediaMetadataSchema = new Schema<IMediaMetadata>({
  mediaId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  s3Key: { type: String, required: true },
  s3Bucket: { type: String, required: true },
  cloudFrontUrl: String,
  
  mediaType: { type: String, enum: ['image', 'video', 'audio', 'document'], required: true },
  mimeType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  
  dimensions: {
    width: Number,
    height: Number
  },
  duration: Number,
  
  processingStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  thumbnailUrl: String,
  
  metadata: {
    originalName: String,
    uploadedFrom: String,
    compressionApplied: Boolean,
    watermarked: Boolean
  },
  
  uploadedAt: { type: Date, default: Date.now },
  expiresAt: Date
}, {
  timestamps: true,
  collection: 'media_metadata'
});

MediaMetadataSchema.index({ userId: 1, uploadedAt: -1 });
MediaMetadataSchema.index({ mediaType: 1 });
export const MediaMetadata = mongoose.model<IMediaMetadata>('MediaMetadata', MediaMetadataSchema);

// ============================================================================
// LIVE STREAMING DATA
// ============================================================================

export interface IStreamSession extends Document {
  streamId: string;
  userId: string;
  title: string;
  description?: string;
  
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  
  streamUrl?: string;
  rtmpUrl?: string;
  playbackUrl?: string;
  
  viewers: {
    current: number;
    peak: number;
    total: number;
    concurrent: Array<{
      userId: string;
      joinedAt: Date;
      leftAt?: Date;
    }>;
  };
  
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    donations: number;
    totalDonationAmount: number;
  };
  
  quality: {
    resolution: string;
    frameRate: number;
    bitrate: number;
  };
  
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in seconds
  
  recordingUrl?: string;
  thumbnailUrl?: string;
  
  createdAt: Date;
}

const StreamSessionSchema = new Schema<IStreamSession>({
  streamId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: String,
  
  status: { 
    type: String, 
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  
  streamUrl: String,
  rtmpUrl: String,
  playbackUrl: String,
  
  viewers: {
    current: { type: Number, default: 0 },
    peak: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    concurrent: [{
      userId: String,
      joinedAt: Date,
      leftAt: Date
    }]
  },
  
  engagement: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    donations: { type: Number, default: 0 },
    totalDonationAmount: { type: Number, default: 0 }
  },
  
  quality: {
    resolution: String,
    frameRate: Number,
    bitrate: Number
  },
  
  startTime: Date,
  endTime: Date,
  duration: Number,
  
  recordingUrl: String,
  thumbnailUrl: String,
  
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'stream_sessions'
});

StreamSessionSchema.index({ userId: 1, status: 1 });
StreamSessionSchema.index({ startTime: -1 });
export const StreamSession = mongoose.model<IStreamSession>('StreamSession', StreamSessionSchema);

// ============================================================================
// REAL-TIME CHAT MESSAGES (High Volume)
// ============================================================================

export interface IChatMessage extends Document {
  conversationId: string;
  senderId: string;
  recipientId: string;
  message: string;
  messageType: 'text' | 'image' | 'video' | 'voice' | 'file' | 'location';
  mediaUrl?: string;
  
  reactions: Map<string, string[]>; // emoji -> userIds
  
  isRead: boolean;
  readAt?: Date;
  isDeleted: boolean;
  deletedBy?: string[];
  
  replyTo?: string;
  forwardedFrom?: string;
  
  timestamp: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true, index: true },
  recipientId: { type: String, required: true, index: true },
  message: String,
  messageType: { 
    type: String, 
    enum: ['text', 'image', 'video', 'voice', 'file', 'location'],
    default: 'text'
  },
  mediaUrl: String,
  
  reactions: { type: Map, of: [String], default: new Map() },
  
  isRead: { type: Boolean, default: false },
  readAt: Date,
  isDeleted: { type: Boolean, default: false },
  deletedBy: [String],
  
  replyTo: String,
  forwardedFrom: String,
  
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true,
  collection: 'chat_messages'
});

ChatMessageSchema.index({ conversationId: 1, timestamp: -1 });
// TTL Index - Delete messages after 1 year
ChatMessageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });
export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

// ============================================================================
// SEARCH INDEX (Full-Text Search)
// ============================================================================

export interface ISearchIndex extends Document {
  entityType: 'user' | 'post' | 'group' | 'event' | 'business';
  entityId: string;
  content: string;
  tags: string[];
  metadata: Record<string, any>;
  popularity: number;
  lastUpdated: Date;
}

const SearchIndexSchema = new Schema<ISearchIndex>({
  entityType: { type: String, required: true, index: true },
  entityId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  tags: [{ type: String, index: true }],
  metadata: Schema.Types.Mixed,
  popularity: { type: Number, default: 0, index: true },
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'search_index'
});

// Text index for full-text search
SearchIndexSchema.index({ content: 'text', tags: 'text' });
SearchIndexSchema.index({ entityType: 1, popularity: -1 });
export const SearchIndex = mongoose.model<ISearchIndex>('SearchIndex', SearchIndexSchema);

// ============================================================================
// GAMING & ACHIEVEMENTS
// ============================================================================

export interface IGamingProfile extends Document {
  userId: string;
  level: number;
  experiencePoints: number;
  
  games: Map<string, {
    gamesPlayed: number;
    gamesWon: number;
    highScore: number;
    totalPlayTime: number;
    lastPlayed: Date;
  }>;
  
  achievements: Array<{
    achievementId: string;
    name: string;
    unlockedAt: Date;
    rarity: string;
  }>;
  
  leaderboardRanks: Map<string, number>;
  
  stats: {
    totalGames: number;
    totalWins: number;
    winRate: number;
    totalPlayTime: number;
  };
  
  updatedAt: Date;
}

const GamingProfileSchema = new Schema<IGamingProfile>({
  userId: { type: String, required: true, unique: true, index: true },
  level: { type: Number, default: 1 },
  experiencePoints: { type: Number, default: 0 },
  
  games: { type: Map, of: Schema.Types.Mixed, default: new Map() },
  
  achievements: [{
    achievementId: String,
    name: String,
    unlockedAt: Date,
    rarity: String
  }],
  
  leaderboardRanks: { type: Map, of: Number, default: new Map() },
  
  stats: {
    totalGames: { type: Number, default: 0 },
    totalWins: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    totalPlayTime: { type: Number, default: 0 }
  },
  
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'gaming_profiles'
});

export const GamingProfile = mongoose.model<IGamingProfile>('GamingProfile', GamingProfileSchema);

// ============================================================================
// CONTENT FEED CACHE (Personalized Feeds)
// ============================================================================

export interface IFeedCache extends Document {
  userId: string;
  feedType: 'home' | 'trending' | 'following' | 'discover';
  posts: Array<{
    postId: string;
    score: number;
    timestamp: Date;
  }>;
  lastGenerated: Date;
  expiresAt: Date;
}

const FeedCacheSchema = new Schema<IFeedCache>({
  userId: { type: String, required: true, index: true },
  feedType: { 
    type: String, 
    enum: ['home', 'trending', 'following', 'discover'],
    required: true 
  },
  posts: [{
    postId: String,
    score: Number,
    timestamp: Date
  }],
  lastGenerated: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true,
  collection: 'feed_cache'
});

FeedCacheSchema.index({ userId: 1, feedType: 1 }, { unique: true });
// TTL Index
FeedCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const FeedCache = mongoose.model<IFeedCache>('FeedCache', FeedCacheSchema);

// ============================================================================
// MARKETPLACE LISTINGS
// ============================================================================

export interface IMarketplaceListing extends Document {
  listingId: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  
  images: string[];
  condition: string;
  location: string;
  
  status: 'active' | 'sold' | 'removed';
  
  views: number;
  saves: number;
  inquiries: number;
  
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceListingSchema = new Schema<IMarketplaceListing>({
  listingId: { type: String, required: true, unique: true, index: true },
  sellerId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true, index: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  
  images: [String],
  condition: String,
  location: { type: String, index: true },
  
  status: { 
    type: String, 
    enum: ['active', 'sold', 'removed'],
    default: 'active',
    index: true
  },
  
  views: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 },
  
  tags: [{ type: String, index: true }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'marketplace_listings'
});

MarketplaceListingSchema.index({ title: 'text', description: 'text', tags: 'text' });
export const MarketplaceListing = mongoose.model<IMarketplaceListing>('MarketplaceListing', MarketplaceListingSchema);

// ============================================================================
// RECOMMENDATION ENGINE DATA
// ============================================================================

export interface IRecommendation extends Document {
  userId: string;
  recommendationType: 'user' | 'post' | 'group' | 'event' | 'dating';
  recommendations: Array<{
    entityId: string;
    score: number;
    reason: string[];
  }>;
  generatedAt: Date;
  expiresAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>({
  userId: { type: String, required: true, index: true },
  recommendationType: { 
    type: String, 
    enum: ['user', 'post', 'group', 'event', 'dating'],
    required: true 
  },
  recommendations: [{
    entityId: String,
    score: Number,
    reason: [String]
  }],
  generatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true,
  collection: 'recommendations'
});

RecommendationSchema.index({ userId: 1, recommendationType: 1 }, { unique: true });
// TTL Index
RecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const Recommendation = mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);

// ============================================================================
// ERROR LOGS & MONITORING
// ============================================================================

export interface IErrorLog extends Document {
  errorId: string;
  errorType: string;
  message: string;
  stack?: string;
  
  userId?: string;
  endpoint?: string;
  method?: string;
  
  requestData?: Record<string, any>;
  responseStatus?: number;
  
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  environment: 'development' | 'staging' | 'production';
  
  timestamp: Date;
}

const ErrorLogSchema = new Schema<IErrorLog>({
  errorId: { type: String, required: true, unique: true },
  errorType: { type: String, required: true, index: true },
  message: { type: String, required: true },
  stack: String,
  
  userId: { type: String, index: true },
  endpoint: String,
  method: String,
  
  requestData: Schema.Types.Mixed,
  responseStatus: Number,
  
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  
  environment: { 
    type: String, 
    enum: ['development', 'staging', 'production'],
    required: true 
  },
  
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true,
  collection: 'error_logs'
});

// TTL Index - Auto-delete after 30 days
ErrorLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });
export const ErrorLog = mongoose.model<IErrorLog>('ErrorLog', ErrorLogSchema);
