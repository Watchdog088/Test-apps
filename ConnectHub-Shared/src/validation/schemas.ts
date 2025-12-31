/**
 * ConnectHub Shared SDK - Validation Schemas
 * Unified validation using Zod for Web and Mobile apps
 */

import { z } from 'zod';

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long'),
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  coverPhoto: z.string().url().optional(),
  verified: z.boolean().default(false),
  premium: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  coverPhoto: z.string().url().optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
  dateOfBirth: z.date().optional(),
});

// ============================================================================
// POST SCHEMAS
// ============================================================================

export const CreatePostSchema = z.object({
  content: z.string()
    .min(1, 'Post content cannot be empty')
    .max(5000, 'Post is too long (max 5000 characters)'),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['image', 'video']),
    thumbnail: z.string().url().optional(),
  })).max(10, 'Maximum 10 media files allowed').optional(),
  location: z.string().max(200).optional(),
  taggedUsers: z.array(z.string().uuid()).max(20).optional(),
  visibility: z.enum(['public', 'friends', 'private']).default('public'),
  allowComments: z.boolean().default(true),
});

export const UpdatePostSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  visibility: z.enum(['public', 'friends', 'private']).optional(),
  allowComments: z.boolean().optional(),
});

export const CommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment is too long'),
  parentId: z.string().uuid().optional(), // For nested comments
});

// ============================================================================
// MESSAGE SCHEMAS
// ============================================================================

export const SendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(10000).optional(),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(['image', 'video', 'audio', 'file']).optional(),
  replyToId: z.string().uuid().optional(),
}).refine(data => data.content || data.mediaUrl, {
  message: 'Message must have either content or media',
});

export const CreateConversationSchema = z.object({
  participantIds: z.array(z.string().uuid())
    .min(1, 'At least one participant required')
    .max(50, 'Too many participants'),
  isGroup: z.boolean().default(false),
  groupName: z.string().min(1).max(100).optional(),
  groupAvatar: z.string().url().optional(),
});

// ============================================================================
// DATING SCHEMAS
// ============================================================================

export const DatingProfileSchema = z.object({
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(500),
  photos: z.array(z.string().url())
    .min(2, 'At least 2 photos required')
    .max(6, 'Maximum 6 photos allowed'),
  dateOfBirth: z.date()
    .refine(date => {
      const age = new Date().getFullYear() - date.getFullYear();
      return age >= 18;
    }, 'You must be at least 18 years old'),
  gender: z.enum(['male', 'female', 'non-binary', 'other']),
  interestedIn: z.array(z.enum(['male', 'female', 'non-binary', 'other'])).min(1),
  location: z.object({
    city: z.string(),
    state: z.string().optional(),
    country: z.string(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  preferences: z.object({
    ageMin: z.number().min(18).max(99),
    ageMax: z.number().min(18).max(99),
    maxDistance: z.number().min(1).max(500), // km
    showMe: z.enum(['everyone', 'verified-only']).default('everyone'),
  }),
  prompts: z.array(z.object({
    question: z.string(),
    answer: z.string().min(1).max(200),
  })).max(3).optional(),
});

export const SwipeSchema = z.object({
  targetUserId: z.string().uuid(),
  action: z.enum(['like', 'pass', 'superlike']),
});

// ============================================================================
// GROUP SCHEMAS
// ============================================================================

export const CreateGroupSchema = z.object({
  name: z.string().min(3, 'Group name must be at least 3 characters').max(100),
  description: z.string().max(1000).optional(),
  avatar: z.string().url().optional(),
  coverPhoto: z.string().url().optional(),
  category: z.string().optional(),
  isPrivate: z.boolean().default(false),
  requireApproval: z.boolean().default(false),
  rules: z.array(z.string()).max(10).optional(),
});

export const UpdateGroupSchema = CreateGroupSchema.partial();

// ============================================================================
// EVENT SCHEMAS
// ============================================================================

export const CreateEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  location: z.object({
    name: z.string(),
    address: z.string().optional(),
    city: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  coverPhoto: z.string().url().optional(),
  category: z.string().optional(),
  isOnline: z.boolean().default(false),
  capacity: z.number().positive().optional(),
  ticketPrice: z.number().nonnegative().optional(),
  isPrivate: z.boolean().default(false),
}).refine(data => {
  if (data.endDate) {
    return data.endDate > data.startDate;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const UpdateEventSchema = CreateEventSchema.partial();

export const RSVPSchema = z.object({
  eventId: z.string().uuid(),
  status: z.enum(['going', 'maybe', 'not-going']),
});

// ============================================================================
// SEARCH SCHEMAS
// ============================================================================

export const SearchSchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty').max(200),
  type: z.enum(['all', 'users', 'posts', 'groups', 'events']).default('all'),
  filters: z.object({
    location: z.string().optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
    verified: z.boolean().optional(),
  }).optional(),
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(20),
});

// ============================================================================
// MARKETPLACE SCHEMAS
// ============================================================================

export const CreateProductSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().positive('Price must be greater than 0'),
  currency: z.string().length(3).default('USD'),
  images: z.array(z.string().url()).min(1).max(10),
  category: z.string(),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']),
  location: z.string(),
  shippingAvailable: z.boolean().default(false),
  quantity: z.number().positive().default(1),
});

export const UpdateProductSchema = CreateProductSchema.partial();

// ============================================================================
// SETTINGS SCHEMAS
// ============================================================================

export const UpdateSettingsSchema = z.object({
  privacy: z.object({
    profileVisibility: z.enum(['public', 'friends', 'private']).optional(),
    showOnlineStatus: z.boolean().optional(),
    allowMessages: z.enum(['everyone', 'friends', 'none']).optional(),
    showLocation: z.boolean().optional(),
  }).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional(),
    likes: z.boolean().optional(),
    comments: z.boolean().optional(),
    messages: z.boolean().optional(),
    mentions: z.boolean().optional(),
  }).optional(),
  preferences: z.object({
    language: z.string().optional(),
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    autoplay: z.boolean().optional(),
  }).optional(),
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate data against schema and return typed result
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Get user-friendly error messages from Zod errors
 */
export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  
  error.errors.forEach(err => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return errors;
}

/**
 * Check if data is valid without throwing
 */
export function isValid<T>(schema: z.ZodSchema<T>, data: unknown): boolean {
  return schema.safeParse(data).success;
}

// Export all schemas
export default {
  UserSchema,
  RegisterSchema,
  LoginSchema,
  UpdateProfileSchema,
  CreatePostSchema,
  UpdatePostSchema,
  CommentSchema,
  SendMessageSchema,
  CreateConversationSchema,
  DatingProfileSchema,
  SwipeSchema,
  CreateGroupSchema,
  UpdateGroupSchema,
  CreateEventSchema,
  UpdateEventSchema,
  RSVPSchema,
  SearchSchema,
  CreateProductSchema,
  UpdateProductSchema,
  UpdateSettingsSchema,
  validate,
  getValidationErrors,
  isValid,
};
