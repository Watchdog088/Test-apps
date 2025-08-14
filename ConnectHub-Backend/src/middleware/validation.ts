import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import logger from '../config/logger';

export const validateBody = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({ error: 'Validation failed', errors });
      }
      logger.error('Validation middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const validateQuery = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({ error: 'Validation failed', errors });
      }
      logger.error('Query validation middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const validateParams = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({ error: 'Validation failed', errors });
      }
      logger.error('Params validation middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Common validation schemas
export const schemas = {
  id: z.object({
    id: z.string().cuid('Invalid ID format'),
  }),

  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
  }),

  userRegistration: z.object({
    email: z.string().email('Invalid email format'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be less than 30 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores'
      ),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
  }),

  userLogin: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),

  userUpdate: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    bio: z.string().max(500).optional(),
    location: z.string().max(100).optional(),
    website: z.string().url().optional(),
    dateOfBirth: z.string().datetime().optional(),
    phone: z.string().regex(/^\+?[\d\s-()]+$/).optional(),
    isPrivate: z.boolean().optional(),
  }),

  postCreate: z.object({
    content: z.string().min(1, 'Content is required').max(2000),
    contentType: z.enum(['text', 'image', 'video', 'mixed']),
    mediaUrls: z.array(z.string().url()).default([]),
    hashtags: z.array(z.string()).default([]),
    mentions: z.array(z.string()).default([]),
    visibility: z.enum(['public', 'followers', 'private']).default('public'),
    location: z.string().optional(),
  }),

  postUpdate: z.object({
    content: z.string().min(1).max(2000).optional(),
    visibility: z.enum(['public', 'followers', 'private']).optional(),
    location: z.string().optional(),
  }),

  commentCreate: z.object({
    content: z.string().min(1, 'Comment content is required').max(500),
    parentCommentId: z.string().cuid().optional(),
  }),

  datingProfileCreate: z.object({
    age: z.number().min(18, 'Must be at least 18 years old').max(100),
    bio: z.string().min(10, 'Bio must be at least 10 characters').max(500),
    interests: z.array(z.string()).min(1, 'At least one interest is required'),
    photos: z.array(z.string().url()).min(1, 'At least one photo is required').max(6),
    location: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      city: z.string(),
      country: z.string(),
    }),
    preferences: z.object({
      ageMin: z.number().min(18).max(100),
      ageMax: z.number().min(18).max(100),
      maxDistance: z.number().min(1).max(1000),
      interestedIn: z.enum(['men', 'women', 'everyone']),
    }),
  }),

  datingProfileUpdate: z.object({
    bio: z.string().min(10).max(500).optional(),
    interests: z.array(z.string()).optional(),
    photos: z.array(z.string().url()).max(6).optional(),
    preferences: z.object({
      ageMin: z.number().min(18).max(100).optional(),
      ageMax: z.number().min(18).max(100).optional(),
      maxDistance: z.number().min(1).max(1000).optional(),
      interestedIn: z.enum(['men', 'women', 'everyone']).optional(),
    }).optional(),
    isActive: z.boolean().optional(),
  }),

  swipe: z.object({
    swipedUserId: z.string().cuid(),
    action: z.enum(['like', 'pass', 'superlike']),
  }),

  dateRequest: z.object({
    toUserId: z.string().cuid(),
    matchId: z.string().cuid(),
    message: z.string().min(1).max(500),
    proposedDate: z.string().datetime(),
    location: z.string().min(1).max(200),
    dateType: z.enum(['coffee', 'dinner', 'activity', 'drinks', 'lunch', 'custom']),
  }),

  messageCreate: z.object({
    conversationId: z.string().cuid(),
    receiverId: z.string().cuid(),
    content: z.string().min(1).max(1000),
    messageType: z.enum(['text', 'image', 'video', 'audio', 'file', 'location', 'date_request']).default('text'),
    mediaUrl: z.string().url().optional(),
    replyToMessageId: z.string().cuid().optional(),
  }),

  report: z.object({
    targetId: z.string().cuid(),
    targetType: z.enum(['user', 'post', 'comment', 'message']),
    reason: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
  }),

  passwordReset: z.object({
    email: z.string().email('Invalid email format'),
  }),

  passwordChange: z.object({
    token: z.string().min(1),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
  }),

  emailVerification: z.object({
    token: z.string().min(1),
  }),

  refreshToken: z.object({
    refreshToken: z.string().min(1),
  }),
};

export const sanitizeInput = (input: string): string => {
  // Remove potential XSS and injection attempts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>?/gm, '')
    .trim();
};

export const validateFileUpload = (
  allowedTypes: string[],
  maxSize: number
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type',
        allowedTypes 
      });
    }

    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        error: 'File too large',
        maxSize: `${maxSize / (1024 * 1024)}MB` 
      });
    }

    next();
  };
};
