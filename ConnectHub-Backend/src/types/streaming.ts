export interface StreamInfo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  isLive: boolean;
  viewerCount: number;
  startTime: Date;
  endTime?: Date;
  streamKey: string;
  rtmpUrl?: string;
  hlsUrl?: string;
  quality: StreamQuality[];
  tags: string[];
  isPrivate: boolean;
  allowedViewers?: string[];
  chatEnabled: boolean;
  recordingEnabled: boolean;
  monetizationEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamQuality {
  resolution: string; // "1080p", "720p", "480p", "360p"
  bitrate: number;
  fps: number;
  url: string;
}

export interface StreamMessage {
  id: string;
  streamId: string;
  userId: string;
  username: string;
  message: string;
  type: StreamMessageType;
  timestamp: Date;
  isFromStreamer: boolean;
  isPinned: boolean;
  reactions?: StreamReaction[];
}

export enum StreamMessageType {
  CHAT = 'chat',
  GIFT = 'gift',
  FOLLOW = 'follow',
  SUBSCRIBE = 'subscribe',
  DONATION = 'donation',
  SYSTEM = 'system'
}

export interface StreamReaction {
  id: string;
  userId: string;
  type: StreamReactionType;
  timestamp: Date;
}

export enum StreamReactionType {
  LIKE = 'like',
  LOVE = 'love',
  LAUGH = 'laugh',
  WOW = 'wow',
  CLAP = 'clap',
  FIRE = 'fire'
}

export interface StreamViewer {
  id: string;
  streamId: string;
  userId: string;
  username: string;
  joinTime: Date;
  leaveTime?: Date;
  isActive: boolean;
  isModerator: boolean;
  watchTime: number; // in seconds
}

export interface StreamGift {
  id: string;
  streamId: string;
  fromUserId: string;
  toUserId: string; // streamer
  giftType: string;
  quantity: number;
  value: number; // in platform currency
  message?: string;
  timestamp: Date;
}

export interface StreamAnalytics {
  streamId: string;
  totalViewers: number;
  uniqueViewers: number;
  peakViewers: number;
  averageWatchTime: number;
  totalWatchTime: number;
  chatMessages: number;
  reactions: number;
  gifts: StreamGift[];
  viewersByCountry: Record<string, number>;
  viewersByDevice: Record<string, number>;
  revenueGenerated: number;
}

export interface CreateStreamRequest {
  title: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  tags?: string[];
  isPrivate?: boolean;
  allowedViewers?: string[];
  chatEnabled?: boolean;
  recordingEnabled?: boolean;
  monetizationEnabled?: boolean;
  scheduledStartTime?: Date;
}

export interface UpdateStreamRequest {
  title?: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string;
  tags?: string[];
  isPrivate?: boolean;
  allowedViewers?: string[];
  chatEnabled?: boolean;
  recordingEnabled?: boolean;
  monetizationEnabled?: boolean;
}

export interface StreamSettings {
  id: string;
  userId: string;
  maxBitrate: number;
  defaultQuality: string;
  enableAutoRecord: boolean;
  enableChat: boolean;
  enableDonations: boolean;
  moderators: string[];
  blockedUsers: string[];
  chatFilters: string[];
  donationGoal?: number;
  donationMessage?: string;
  streamOverlays: StreamOverlay[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamOverlay {
  id: string;
  type: 'donation_goal' | 'recent_followers' | 'chat' | 'viewer_count' | 'custom';
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, any>;
  isVisible: boolean;
}

export interface StreamNotification {
  id: string;
  streamId: string;
  userId: string;
  type: StreamNotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export enum StreamNotificationType {
  STREAM_STARTED = 'stream_started',
  STREAM_ENDED = 'stream_ended',
  NEW_FOLLOWER = 'new_follower',
  NEW_DONATION = 'new_donation',
  MILESTONE_REACHED = 'milestone_reached',
  RAID_RECEIVED = 'raid_received',
  MODERATION_ACTION = 'moderation_action'
}
