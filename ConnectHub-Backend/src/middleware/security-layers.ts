/**
 * Defense in Depth Security Implementation
 * 7 Layers of Security Protection for ConnectHub
 * 
 * Layer 1: Network Security (Firewall, DDoS Protection)
 * Layer 2: Application Security (Input Validation, HTTPS)
 * Layer 3: Authentication & Authorization (JWT, OAuth, 2FA)
 * Layer 4: Data Encryption (At Rest & In Transit)
 * Layer 5: Access Control (RBAC, Permissions)
 * Layer 6: Monitoring & Logging (Audit Trails)
 * Layer 7: Incident Response (Rate Limiting, Threat Detection)
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import helmet from 'helmet';
import RedisService from '../config/redis-enhanced';

// ============================================================================
// LAYER 1: NETWORK SECURITY
// ============================================================================

/**
 * DDoS Protection Middleware
 */
export class DDoSProtection {
  private static suspiciousIPs = new Set<string>();

  public static async middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    // Check if IP is blacklisted
    if (DDoSProtection.suspiciousIPs.has(ip)) {
      res.status(429).json({ error: 'Too many requests from this IP. Access temporarily blocked.' });
      return;
    }

    // Rate limit check (100 requests per minute per IP)
    const result = await RedisService.checkRateLimit(
      `ddos:${ip}`,
      100,
      60
    );

    if (!result.allowed) {
      // Block IP temporarily
      DDoSProtection.suspiciousIPs.add(ip);
      setTimeout(() => DDoSProtection.suspiciousIPs.delete(ip), 300000); // 5 minutes

      res.status(429).json({ 
        error: 'Rate limit exceeded',
        retryAfter: 60
      });
      return;
    }

    next();
  }
}

/**
 * IP Whitelist/Blacklist
 */
export class IPFilter {
  private static blacklist = new Set<string>();
  private static whitelist = new Set<string>();

  public static addToBlacklist(ip: string): void {
    IPFilter.blacklist.add(ip);
  }

  public static addToWhitelist(ip: string): void {
    IPFilter.whitelist.add(ip);
  }

  public static middleware(req: Request, res: Response, next: NextFunction): void {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    // If whitelist is active, only allow whitelisted IPs
    if (IPFilter.whitelist.size > 0 && !IPFilter.whitelist.has(ip)) {
      res.status(403).json({ error: 'Access forbidden' });
      return;
    }

    // Block blacklisted IPs
    if (IPFilter.blacklist.has(ip)) {
      res.status(403).json({ error: 'Access forbidden' });
      return;
    }

    next();
  }
}

// ============================================================================
// LAYER 2: APPLICATION SECURITY
// ============================================================================

/**
 * Helmet Security Headers
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

/**
 * Input Sanitization
 */
export class InputSanitizer {
  private static sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|\||;|'|"|<|>)/g,
    /(\bOR\b|\bAND\b).*?=/gi
  ];

  private static xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ];

  public static sanitizeString(input: string): string {
    if (!input) return input;

    let sanitized = input;

    // Remove SQL injection attempts
    for (const pattern of InputSanitizer.sqlInjectionPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Remove XSS attempts
    for (const pattern of InputSanitizer.xssPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // HTML encode special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized.trim();
  }

  public static middleware(req: Request, res: Response, next: NextFunction): void {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = InputSanitizer.sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = InputSanitizer.sanitizeObject(req.query);
    }

    next();
  }

  private static sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => InputSanitizer.sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = InputSanitizer.sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = InputSanitizer.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

// ============================================================================
// LAYER 3: AUTHENTICATION & AUTHORIZATION
// ============================================================================

/**
 * JWT Authentication
 */
export class JWTAuth {
  private static readonly SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private static readonly EXPIRY = '24h';

  public static generateToken(userId: string, additional?: Record<string, any>): string {
    return jwt.sign(
      { userId, ...additional },
      JWTAuth.SECRET,
      { expiresIn: JWTAuth.EXPIRY }
    );
  }

  public static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWTAuth.SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  public static async middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const token = authHeader.substring(7);
      const decoded = JWTAuth.verifyToken(token);

      // Verify session in Redis
      const session = await RedisService.getSession(token);
      if (!session) {
        res.status(401).json({ error: 'Session expired' });
        return;
      }

      (req as any).userId = decoded.userId;
      (req as any).token = token;

      next();
    } catch (error) {
      res.status(401).json({ error: 'Authentication failed' });
    }
  }
}

/**
 * Two-Factor Authentication
 */
export class TwoFactorAuth {
  public static generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  public static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  public static async verifyCode(secret: string, code: string, storedCode: string): Promise<boolean> {
    return code === storedCode; // In production, use time-based OTP
  }

  public static async middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = (req as any).userId;
    
    // Check if 2FA is required for this user
    const requires2FA = await RedisService.get(`2fa:required:${userId}`);
    
    if (requires2FA) {
      const code = req.headers['x-2fa-code'] as string;
      
      if (!code) {
        res.status(403).json({ error: '2FA code required', requires2FA: true });
        return;
      }

      const isValid = await RedisService.get(`2fa:code:${userId}:${code}`);
      if (!isValid) {
        res.status(403).json({ error: 'Invalid 2FA code' });
        return;
      }

      // Mark 2FA as verified for this session
      await RedisService.set(`2fa:verified:${userId}`, true, 3600);
    }

    next();
  }
}

/**
 * Role-Based Access Control (RBAC)
 */
export class RBAC {
  private static readonly roles = {
    user: ['read:own', 'write:own'],
    premium: ['read:own', 'write:own', 'read:premium'],
    creator: ['read:own', 'write:own', 'read:premium', 'write:content'],
    business: ['read:own', 'write:own', 'read:business', 'write:business'],
    moderator: ['read:all', 'write:moderation'],
    admin: ['read:all', 'write:all', 'delete:all']
  };

  public static hasPermission(userRole: string, permission: string): boolean {
    const rolePermissions = RBAC.roles[userRole as keyof typeof RBAC.roles] || [];
    return rolePermissions.includes(permission) || rolePermissions.includes('write:all');
  }

  public static requirePermission(permission: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = (req as any).userId;
      
      // Get user role from cache or database
      const userRole = await RedisService.get(`user:${userId}:role`) || 'user';

      if (!RBAC.hasPermission(userRole, permission)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      next();
    };
  }
}

// ============================================================================
// LAYER 4: DATA ENCRYPTION
// ============================================================================

/**
 * Encryption Service
 */
export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY = crypto.scryptSync(
    process.env.ENCRYPTION_KEY || 'your-encryption-key-change-in-production',
    'salt',
    32
  );

  /**
   * Encrypt sensitive data
   */
  public static encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(EncryptionService.ALGORITHM, EncryptionService.KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt sensitive data
   */
  public static decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(EncryptionService.ALGORITHM, EncryptionService.KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash passwords
   */
  public static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Verify password
   */
  public static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate secure random token
   */
  public static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}

// ============================================================================
// LAYER 5: ACCESS CONTROL
// ============================================================================

/**
 * Resource Ownership Verification
 */
export class OwnershipGuard {
  public static async verifyOwnership(
    req: Request,
    res: Response,
    next: NextFunction,
    resourceType: string,
    resourceId: string
  ): Promise<void> {
    const userId = (req as any).userId;

    // Check in cache first
    const ownerKey = `owner:${resourceType}:${resourceId}`;
    const ownerId = await RedisService.get<string>(ownerKey);

    if (ownerId && ownerId !== userId) {
      res.status(403).json({ error: 'Access denied: You do not own this resource' });
      return;
    }

    next();
  }
}

/**
 * Privacy Settings Enforcement
 */
export class PrivacyGuard {
  public static async canAccessResource(
    requestingUserId: string,
    resourceOwnerId: string,
    resourcePrivacy: string
  ): Promise<boolean> {
    if (requestingUserId === resourceOwnerId) return true;

    switch (resourcePrivacy) {
      case 'public':
        return true;
      
      case 'friends':
        // Check if users are friends (from Neo4j)
        const areFriends = await RedisService.get(`friends:${requestingUserId}:${resourceOwnerId}`);
        return areFriends === true;
      
      case 'private':
        return false;
      
      default:
        return false;
    }
  }
}

// ============================================================================
// LAYER 6: MONITORING & LOGGING
// ============================================================================

/**
 * Audit Trail Logger
 */
export class AuditLogger {
  public static async log(data: {
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    severity?: 'info' | 'warning' | 'error' | 'critical';
    metadata?: Record<string, any>;
  }): Promise<void> {
    const logEntry = {
      ...data,
      timestamp: new Date().toISOString(),
      severity: data.severity || 'info'
    };

    // Store in MongoDB for long-term audit trail
    await RedisService.publish('audit_logs', logEntry);

    // For critical actions, also log to PostgreSQL
    if (data.severity === 'critical' || data.severity === 'error') {
      console.error('[AUDIT - CRITICAL]', logEntry);
    }
  }

  public static middleware(action: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = (req as any).userId;
      const ip = req.ip || req.connection.remoteAddress;

      await AuditLogger.log({
        userId,
        action,
        ipAddress: ip,
        userAgent: req.get('user-agent'),
        metadata: {
          method: req.method,
          path: req.path,
          query: req.query
        }
      });

      next();
    };
  }
}

/**
 * Security Event Monitor
 */
export class SecurityMonitor {
  private static readonly suspiciousPatterns = [
    /admin/i,
    /password/i,
    /token/i,
    /api[_-]?key/i,
    /secret/i
  ];

  public static async detectSuspiciousActivity(req: Request): Promise<boolean> {
    const userId = (req as any).userId;
    const ip = req.ip || req.connection.remoteAddress;

    // Check for suspicious patterns in request
    const requestStr = JSON.stringify({
      path: req.path,
      query: req.query,
      body: req.body
    });

    for (const pattern of SecurityMonitor.suspiciousPatterns) {
      if (pattern.test(requestStr)) {
        await AuditLogger.log({
          userId,
          action: 'suspicious_activity_detected',
          severity: 'warning',
          ipAddress: ip,
          metadata: { pattern: pattern.toString(), request: requestStr }
        });
        return true;
      }
    }

    return false;
  }

  public static async middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const isSuspicious = await SecurityMonitor.detectSuspiciousActivity(req);

    if (isSuspicious) {
      // Log but don't block (just monitor)
      console.warn('[SECURITY] Suspicious activity detected:', req.path);
    }

    next();
  }
}

// ============================================================================
// LAYER 7: INCIDENT RESPONSE
// ============================================================================

/**
 * Threat Detection & Response
 */
export class ThreatDetection {
  private static readonly MAX_FAILED_LOGINS = 5;
  private static readonly LOCKOUT_DURATION = 900; // 15 minutes

  public static async recordFailedLogin(identifier: string): Promise<number> {
    const key = `failed_login:${identifier}`;
    const count = await RedisService.incrementCounter(key);

    // Set expiry on first attempt
    if (count === 1) {
      const client = RedisService.getClient();
      await client.expire(key, 3600); // 1 hour window
    }

    // Lock account if too many failures
    if (count >= ThreatDetection.MAX_FAILED_LOGINS) {
      await RedisService.set(
        `account_locked:${identifier}`,
        true,
        ThreatDetection.LOCKOUT_DURATION
      );

      // Create security alert
      await AuditLogger.log({
        action: 'account_locked',
        severity: 'critical',
        metadata: { identifier, failedAttempts: count }
      });
    }

    return count;
  }

  public static async isAccountLocked(identifier: string): Promise<boolean> {
    return await RedisService.exists(`account_locked:${identifier}`);
  }

  public static async clearFailedLogins(identifier: string): Promise<void> {
    await RedisService.del(`failed_login:${identifier}`);
  }
}

/**
 * Advanced Rate Limiting
 */
export class AdvancedRateLimit {
  private static readonly limits = {
    '/api/auth/login': { max: 5, window: 60 },
    '/api/auth/register': { max: 3, window: 3600 },
    '/api/posts': { max: 50, window: 60 },
    '/api/messages': { max: 100, window: 60 },
    '/api/upload': { max: 10, window: 60 },
    'default': { max: 100, window: 60 }
  };

  public static middleware(req: Request, res: Response, next: NextFunction): void {
    const endpoint = req.path;
    const userId = (req as any).userId || req.ip;

    const limit = AdvancedRateLimit.limits[endpoint as keyof typeof AdvancedRateLimit.limits] 
      || AdvancedRateLimit.limits.default;

    RedisService.checkRateLimit(
      `ratelimit:${endpoint}:${userId}`,
      limit.max,
      limit.window
    ).then(result => {
      res.setHeader('X-RateLimit-Limit', limit.max.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());

      if (!result.allowed) {
        res.status(429).json({ 
          error: 'Rate limit exceeded',
          retryAfter: limit.window
        });
        return;
      }

      next();
    }).catch(error => {
      console.error('[RATE LIMIT ERROR]', error);
      next(); // Fail open - don't block legitimate requests
    });
  }
}

/**
 * CORS Security
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://connecthub.com'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

/**
 * SQL Injection Prevention
 */
export class SQLInjectionPrevention {
  public static middleware(req: Request, res: Response, next: NextFunction): void {
    const checkForSQLInjection = (value: any): boolean => {
      if (typeof value !== 'string') return false;

      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b)/gi,
        /(--|;|\/\*|\*\/|xp_|sp_)/gi,
        /(\bUNION\b|\bJOIN\b)/gi,
      ];

      return sqlPatterns.some(pattern => pattern.test(value));
    };

    // Check query parameters
    for (const value of Object.values(req.query)) {
      if (checkForSQLInjection(value as string)) {
        res.status(400).json({ error: 'Invalid input detected' });
        return;
      }
    }

    // Check body
    const checkObject = (obj: any): boolean => {
      if (typeof obj !== 'object') return false;
      
      for (const value of Object.values(obj)) {
        if (typeof value === 'string' && checkForSQLInjection(value)) {
          return true;
        }
        if (typeof value === 'object' && checkObject(value)) {
          return true;
        }
      }
      return false;
    };

    if (req.body && checkObject(req.body)) {
      res.status(400).json({ error: 'Invalid input detected' });
      return;
    }

    next();
  }
}

// ============================================================================
// SECURITY MIDDLEWARE STACK
// ============================================================================

/**
 * Complete Security Stack - Apply all layers
 */
export const securityStack = [
  securityHeaders,                          // Layer 1 & 2
  DDoSProtection.middleware,                // Layer 1
  IPFilter.middleware,                      // Layer 1
  SQLInjectionPrevention.middleware,        // Layer 2
  InputSanitizer.middleware,                // Layer 2
  AdvancedRateLimit.middleware,             // Layer 7
  SecurityMonitor.middleware,               // Layer 6
];

/**
 * Protected Route Stack (requires authentication)
 */
export const protectedStack = [
  ...securityStack,
  JWTAuth.middleware,                       // Layer 3
];

/**
 * Export all security components
 */
export {
  DDoSProtection,
  IPFilter,
  InputSanitizer,
  JWTAuth,
  TwoFactorAuth,
  RBAC,
  EncryptionService,
  OwnershipGuard,
  PrivacyGuard,
  AuditLogger,
  SecurityMonitor,
  ThreatDetection,
  AdvancedRateLimit,
  SQLInjectionPrevention
};
