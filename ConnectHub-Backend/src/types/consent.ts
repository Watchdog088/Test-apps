/**
 * Consent Management Types
 * Professional consent system for dating app safety
 */

export interface ConsentRequest {
  id: string;
  requesterId: string;
  recipientId: string;
  dateId?: string; // Optional reference to a specific date
  requestType: 'intimate_encounter';
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'withdrawn';
  message?: string;
  boundaries?: string[];
  safetyPreferences?: SafetyPreferences;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  respondedAt?: Date;
}

export interface SafetyPreferences {
  protectionRequired: boolean;
  mutualTesting: boolean;
  safeWord?: string;
  emergencyContact?: EmergencyContact;
  location?: LocationSafety;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface LocationSafety {
  shareLocation: boolean;
  trustedContact?: string;
  checkInTime?: Date;
}

export interface ConsentResponse {
  id: string;
  consentRequestId: string;
  userId: string;
  decision: 'accept' | 'decline';
  boundaries?: string[];
  safetyPreferences?: SafetyPreferences;
  message?: string;
  createdAt: Date;
}

export interface MutualConsent {
  id: string;
  userOneId: string;
  userTwoId: string;
  dateId?: string;
  consentType: 'intimate_encounter';
  agreedBoundaries: string[];
  safetyPlan: SafetyPreferences;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: string;
}

export interface ConsentEducation {
  topic: string;
  content: string;
  resources: Array<{
    title: string;
    url: string;
    type: 'article' | 'video' | 'helpline';
  }>;
}

// API Request/Response Types
export interface CreateConsentRequestBody {
  recipientId: string;
  dateId?: string;
  message?: string;
  boundaries?: string[];
  safetyPreferences?: SafetyPreferences;
}

export interface RespondToConsentBody {
  decision: 'accept' | 'decline';
  boundaries?: string[];
  safetyPreferences?: SafetyPreferences;
  message?: string;
}

export interface ConsentApiResponse {
  success: boolean;
  message: string;
  data?: {
    consentRequest?: ConsentRequest;
    mutualConsent?: MutualConsent;
    education?: ConsentEducation[];
  };
  error?: string;
}
