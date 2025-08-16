import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
export declare const validateBody: (schema: z.ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const validateQuery: (schema: z.ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const validateParams: (schema: z.ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const schemas: {
    id: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id?: string;
    }, {
        id?: string;
    }>;
    pagination: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        page?: number;
        limit?: number;
    }, {
        page?: number;
        limit?: number;
    }>;
    userRegistration: z.ZodObject<{
        email: z.ZodString;
        username: z.ZodString;
        password: z.ZodString;
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email?: string;
        username?: string;
        firstName?: string;
        lastName?: string;
        password?: string;
    }, {
        email?: string;
        username?: string;
        firstName?: string;
        lastName?: string;
        password?: string;
    }>;
    userLogin: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email?: string;
        password?: string;
    }, {
        email?: string;
        password?: string;
    }>;
    userUpdate: z.ZodObject<{
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        bio: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
        dateOfBirth: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        isPrivate: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        firstName?: string;
        lastName?: string;
        bio?: string;
        dateOfBirth?: string;
        phone?: string;
        isPrivate?: boolean;
        location?: string;
        website?: string;
    }, {
        firstName?: string;
        lastName?: string;
        bio?: string;
        dateOfBirth?: string;
        phone?: string;
        isPrivate?: boolean;
        location?: string;
        website?: string;
    }>;
    postCreate: z.ZodObject<{
        content: z.ZodString;
        contentType: z.ZodEnum<["text", "image", "video", "mixed"]>;
        mediaUrls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        hashtags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        mentions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        visibility: z.ZodDefault<z.ZodEnum<["public", "followers", "private"]>>;
        location: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        location?: string;
        content?: string;
        contentType?: "text" | "image" | "video" | "mixed";
        mediaUrls?: string[];
        hashtags?: string[];
        mentions?: string[];
        visibility?: "followers" | "public" | "private";
    }, {
        location?: string;
        content?: string;
        contentType?: "text" | "image" | "video" | "mixed";
        mediaUrls?: string[];
        hashtags?: string[];
        mentions?: string[];
        visibility?: "followers" | "public" | "private";
    }>;
    postUpdate: z.ZodObject<{
        content: z.ZodOptional<z.ZodString>;
        visibility: z.ZodOptional<z.ZodEnum<["public", "followers", "private"]>>;
        location: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        location?: string;
        content?: string;
        visibility?: "followers" | "public" | "private";
    }, {
        location?: string;
        content?: string;
        visibility?: "followers" | "public" | "private";
    }>;
    commentCreate: z.ZodObject<{
        content: z.ZodString;
        parentCommentId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        content?: string;
        parentCommentId?: string;
    }, {
        content?: string;
        parentCommentId?: string;
    }>;
    datingProfileCreate: z.ZodObject<{
        age: z.ZodNumber;
        bio: z.ZodString;
        interests: z.ZodArray<z.ZodString, "many">;
        photos: z.ZodArray<z.ZodString, "many">;
        location: z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
            city: z.ZodString;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            latitude?: number;
            longitude?: number;
            city?: string;
            country?: string;
        }, {
            latitude?: number;
            longitude?: number;
            city?: string;
            country?: string;
        }>;
        preferences: z.ZodObject<{
            ageMin: z.ZodNumber;
            ageMax: z.ZodNumber;
            maxDistance: z.ZodNumber;
            interestedIn: z.ZodEnum<["men", "women", "everyone"]>;
        }, "strip", z.ZodTypeAny, {
            maxDistance?: number;
            ageMin?: number;
            ageMax?: number;
            interestedIn?: "everyone" | "men" | "women";
        }, {
            maxDistance?: number;
            ageMin?: number;
            ageMax?: number;
            interestedIn?: "everyone" | "men" | "women";
        }>;
    }, "strip", z.ZodTypeAny, {
        bio?: string;
        location?: {
            latitude?: number;
            longitude?: number;
            city?: string;
            country?: string;
        };
        age?: number;
        interests?: string[];
        photos?: string[];
        preferences?: {
            maxDistance?: number;
            ageMin?: number;
            ageMax?: number;
            interestedIn?: "everyone" | "men" | "women";
        };
    }, {
        bio?: string;
        location?: {
            latitude?: number;
            longitude?: number;
            city?: string;
            country?: string;
        };
        age?: number;
        interests?: string[];
        photos?: string[];
        preferences?: {
            maxDistance?: number;
            ageMin?: number;
            ageMax?: number;
            interestedIn?: "everyone" | "men" | "women";
        };
    }>;
    datingProfileUpdate: z.ZodObject<{
        bio: z.ZodOptional<z.ZodString>;
        interests: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        photos: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        preferences: z.ZodOptional<z.ZodObject<{
            ageMin: z.ZodOptional<z.ZodNumber>;
            ageMax: z.ZodOptional<z.ZodNumber>;
            maxDistance: z.ZodOptional<z.ZodNumber>;
            interestedIn: z.ZodOptional<z.ZodEnum<["men", "women", "everyone"]>>;
        }, "strip", z.ZodTypeAny, {
            maxDistance?: number;
            ageMin?: number;
            ageMax?: number;
            interestedIn?: "everyone" | "men" | "women";
        }, {
            maxDistance?: number;
            ageMin?: number;
            ageMax?: number;
            interestedIn?: "everyone" | "men" | "women";
        }>>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        bio?: string;
        isActive?: boolean;
        interests?: string[];
        photos?: string[];
        preferences?: {
            maxDistance?: number;
            ageMin?: number;
            ageMax?: number;
            interestedIn?: "everyone" | "men" | "women";
        };
    }, {
        bio?: string;
        isActive?: boolean;
        interests?: string[];
        photos?: string[];
        preferences?: {
            maxDistance?: number;
            ageMin?: number;
            ageMax?: number;
            interestedIn?: "everyone" | "men" | "women";
        };
    }>;
    swipe: z.ZodObject<{
        swipedUserId: z.ZodString;
        action: z.ZodEnum<["like", "pass", "superlike"]>;
    }, "strip", z.ZodTypeAny, {
        swipedUserId?: string;
        action?: "like" | "pass" | "superlike";
    }, {
        swipedUserId?: string;
        action?: "like" | "pass" | "superlike";
    }>;
    dateRequest: z.ZodObject<{
        toUserId: z.ZodString;
        matchId: z.ZodString;
        message: z.ZodString;
        proposedDate: z.ZodString;
        location: z.ZodString;
        dateType: z.ZodEnum<["coffee", "dinner", "activity", "drinks", "lunch", "custom"]>;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        location?: string;
        matchId?: string;
        toUserId?: string;
        proposedDate?: string;
        dateType?: "custom" | "coffee" | "dinner" | "activity" | "drinks" | "lunch";
    }, {
        message?: string;
        location?: string;
        matchId?: string;
        toUserId?: string;
        proposedDate?: string;
        dateType?: "custom" | "coffee" | "dinner" | "activity" | "drinks" | "lunch";
    }>;
    messageCreate: z.ZodObject<{
        conversationId: z.ZodString;
        receiverId: z.ZodString;
        content: z.ZodString;
        messageType: z.ZodDefault<z.ZodEnum<["text", "image", "video", "audio", "file", "location", "date_request"]>>;
        mediaUrl: z.ZodOptional<z.ZodString>;
        replyToMessageId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        content?: string;
        conversationId?: string;
        messageType?: "location" | "text" | "image" | "video" | "audio" | "file" | "date_request";
        mediaUrl?: string;
        replyToMessageId?: string;
        receiverId?: string;
    }, {
        content?: string;
        conversationId?: string;
        messageType?: "location" | "text" | "image" | "video" | "audio" | "file" | "date_request";
        mediaUrl?: string;
        replyToMessageId?: string;
        receiverId?: string;
    }>;
    report: z.ZodObject<{
        targetId: z.ZodString;
        targetType: z.ZodEnum<["user", "post", "comment", "message"]>;
        reason: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        targetId?: string;
        targetType?: "user" | "post" | "comment" | "message";
        reason?: string;
        description?: string;
    }, {
        targetId?: string;
        targetType?: "user" | "post" | "comment" | "message";
        reason?: string;
        description?: string;
    }>;
    passwordReset: z.ZodObject<{
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email?: string;
    }, {
        email?: string;
    }>;
    passwordChange: z.ZodObject<{
        token: z.ZodString;
        newPassword: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        newPassword?: string;
        token?: string;
    }, {
        newPassword?: string;
        token?: string;
    }>;
    emailVerification: z.ZodObject<{
        token: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        token?: string;
    }, {
        token?: string;
    }>;
    refreshToken: z.ZodObject<{
        refreshToken: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        refreshToken?: string;
    }, {
        refreshToken?: string;
    }>;
};
export declare const sanitizeInput: (input: string) => string;
export declare const validateFileUpload: (allowedTypes: string[], maxSize: number) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
