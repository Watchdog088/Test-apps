export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethodId: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  isDefault: boolean;
  cardLast4?: string;
  cardBrand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  paypalEmail?: string;
}

export interface Advertisement {
  id: string;
  advertiserId: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  targeting: AdTargeting;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  status: 'active' | 'paused' | 'completed' | 'rejected';
  startDate: Date;
  endDate: Date;
}

export interface AdTargeting {
  ageMin: number;
  ageMax: number;
  gender: string[];
  location: {
    countries: string[];
    cities: string[];
    radius?: number;
  };
  interests: string[];
  behaviors: string[];
  demographics: string[];
}

export interface AdImpression {
  id: string;
  adId: string;
  userId: string;
  timestamp: Date;
  placement: 'feed' | 'story' | 'sidebar' | 'interstitial';
  clicked: boolean;
  converted: boolean;
  revenue: number;
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  category: 'dating' | 'social' | 'messaging' | 'analytics';
  requiredPlan: string[];
  isActive: boolean;
}

export interface UserAnalytics {
  userId: string;
  totalSessions: number;
  totalTimeSpent: number;
  postsCreated: number;
  postsLiked: number;
  matchesMade: number;
  messagesExchanged: number;
  profileViews: number;
  adInteractions: number;
  revenueDirect: number;
  revenueIndirect: number;
  lastActive: Date;
  deviceTypes: string[];
  locations: string[];
  interests: string[];
  engagementScore: number;
}

export interface BusinessAnalytics {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: Date;
  activeUsers: number;
  newSignups: number;
  premiumConversions: number;
  subscriptionRevenue: number;
  adRevenue: number;
  totalRevenue: number;
  averageSessionTime: number;
  retentionRate: number;
  churnRate: number;
  ltv: number; // Lifetime Value
  cac: number; // Customer Acquisition Cost
}
