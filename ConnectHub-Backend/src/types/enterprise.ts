export interface BusinessAccount {
  id: string;
  userId: string;
  businessType: 'startup' | 'small_business' | 'enterprise' | 'agency' | 'nonprofit';
  companyName: string;
  businessDescription: string;
  website: string;
  industry: string;
  employeeCount: string; // '1-10', '11-50', '51-200', '201-500', '500+'
  headquarters: string;
  founded: number;
  logo: string;
  coverImage: string;
  isVerified: boolean;
  verificationDate?: Date;
  features: string[]; // JSON array of enabled features
  billingEmail: string;
  taxId?: string;
  status: 'active' | 'suspended' | 'pending_verification';
}

export interface TeamMember {
  id: string;
  businessAccountId: string;
  userId: string;
  role: 'owner' | 'admin' | 'manager' | 'editor' | 'viewer';
  permissions: string[]; // JSON array of specific permissions
  inviteStatus: 'pending' | 'accepted' | 'declined';
  invitedBy: string;
  invitedAt: Date;
  joinedAt?: Date;
}

export interface EnterpriseAnalytics {
  id: string;
  businessAccountId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  
  // Engagement Metrics
  totalReach: number;
  totalImpressions: number;
  totalEngagements: number;
  engagementRate: number;
  
  // Content Performance
  postsPublished: number;
  averageLikes: number;
  averageComments: number;
  averageShares: number;
  topPerformingPosts: string[]; // JSON array of post IDs
  
  // Audience Insights
  followerGrowth: number;
  audienceDemographics: string; // JSON object with age, gender, location data
  peakEngagementTimes: string; // JSON array of optimal posting times
  
  // Conversion Metrics
  profileViews: number;
  websiteClicks: number;
  leadGenerated: number;
  conversionRate: number;
  
  // Dating-specific metrics (if applicable)
  matchesGenerated?: number;
  messagesExchanged?: number;
  dateRequestsReceived?: number;
}

export interface WhitelabelConfig {
  id: string;
  businessAccountId: string;
  domain: string;
  subdomain: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    faviconUrl: string;
    fontFamily: string;
    customCss?: string;
  };
  features: {
    socialMedia: boolean;
    dating: boolean;
    messaging: boolean;
    videoCallsAvailable: boolean;
    customRegistration: boolean;
    ssoEnabled: boolean;
  };
  customization: {
    welcomeMessage: string;
    termsOfServiceUrl?: string;
    privacyPolicyUrl?: string;
    supportEmail: string;
    customFooter?: string;
  };
  isActive: boolean;
}

export interface EnterpriseSubscription {
  id: string;
  businessAccountId: string;
  planType: 'business_starter' | 'business_pro' | 'enterprise' | 'whitelabel';
  monthlyPrice: number;
  yearlyPrice: number;
  billingCycle: 'monthly' | 'yearly';
  maxUsers: number;
  maxTeamMembers: number;
  features: string[]; // JSON array of included features
  customLimits: string; // JSON object with custom usage limits
  supportTier: 'standard' | 'priority' | 'dedicated';
  contractTerms?: string; // For enterprise custom contracts
}

export interface CampaignManagement {
  id: string;
  businessAccountId: string;
  name: string;
  description: string;
  type: 'brand_awareness' | 'lead_generation' | 'engagement' | 'dating_promotion';
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  startDate: Date;
  endDate: Date;
  targetAudience: string; // JSON object with targeting criteria
  creativeAssets: string[]; // JSON array of image/video URLs
  kpis: string; // JSON object with key performance indicators
}

export interface APIAccess {
  id: string;
  businessAccountId: string;
  apiKey: string;
  secretKey: string;
  permissions: string[]; // Array of allowed API endpoints
  rateLimit: number; // Requests per hour
  usageStats: string; // JSON object with usage statistics
  isActive: boolean;
  expiresAt?: Date;
}

export interface BusinessVerification {
  id: string;
  businessAccountId: string;
  verificationType: 'document' | 'domain' | 'phone' | 'manual_review';
  status: 'pending' | 'approved' | 'rejected' | 'requires_action';
  submittedDocuments: string[]; // JSON array of document URLs
  reviewedBy?: string; // Admin user ID
  reviewedAt?: Date;
  rejectionReason?: string;
  verificationBadge: 'none' | 'verified' | 'premium' | 'enterprise';
}

export interface ContentScheduling {
  id: string;
  businessAccountId: string;
  userId: string; // Team member who created the schedule
  postContent: string;
  mediaUrls: string[]; // JSON array of media files
  scheduledFor: Date;
  platforms: string[]; // Which platforms to post to
  status: 'scheduled' | 'posted' | 'failed' | 'cancelled';
  postIds: string[]; // IDs of created posts after publishing
  autoRepost?: boolean;
  repostFrequency?: string; // 'daily', 'weekly', 'monthly'
}

export interface AdvancedReporting {
  id: string;
  businessAccountId: string;
  reportType: 'performance' | 'audience' | 'content' | 'roi' | 'competitive';
  timeframe: string; // Date range for the report
  filters: string; // JSON object with applied filters
  data: string; // JSON object containing report data
  generatedAt: Date;
  generatedBy: string; // User ID who requested the report
  format: 'json' | 'pdf' | 'excel';
  downloadUrl?: string;
}
