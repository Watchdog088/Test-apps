import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import logger from '../config/logger';

/**
 * Comprehensive Security Service for Data Breach Protection
 */
export class SecurityService {
  private static instance: SecurityService;
  private readonly encryptionKey: string;
  private readonly algorithm = 'aes-256-gcm';

  constructor() {
    // Generate a secure encryption key from environment or create one
    this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateEncryptionKey();
    if (!process.env.ENCRYPTION_KEY) {
      logger.warn('No ENCRYPTION_KEY found in environment. Generated temporary key for session.');
    }
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Generate a secure encryption key
   */
  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encrypt sensitive data before storing in database
   */
  public encryptData(data: string): { encrypted: string; iv: string } {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return {
        encrypted,
        iv: iv.toString('hex')
      };
    } catch (error) {
      logger.error('Encryption error:', error);
      throw new Error('Data encryption failed');
    }
  }

  /**
   * Decrypt sensitive data retrieved from database
   */
  public decryptData(encryptedData: { encrypted: string; iv: string }): string {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Decryption error:', error);
      throw new Error('Data decryption failed');
    }
  }

  /**
   * Hash sensitive data with salt for one-way encryption
   */
  public async hashData(data: string, saltRounds: number = 12): Promise<string> {
    try {
      return await bcrypt.hash(data, saltRounds);
    } catch (error) {
      logger.error('Hashing error:', error);
      throw new Error('Data hashing failed');
    }
  }

  /**
   * Verify hashed data
   */
  public async verifyHash(data: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(data, hash);
    } catch (error) {
      logger.error('Hash verification error:', error);
      return false;
    }
  }

  /**
   * Sanitize user input to prevent XSS and injection attacks
   */
  public sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/[<>'"]/g, (char) => {
        const escapeMap: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;'
        };
        return escapeMap[char] || char;
      })
      .trim()
      .substring(0, 10000); // Limit length to prevent DoS
  }

  /**
   * Generate secure random tokens for sessions, password resets, etc.
   */
  public generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Create a rate limiter for API endpoints
   */
  public createRateLimiter(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100, message?: string) {
    return rateLimit({
      windowMs,
      max: maxRequests,
      message: message || 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: Request) => {
        // Use IP + User-Agent for more specific rate limiting
        return `${req.ip}-${crypto.createHash('md5').update(req.get('User-Agent') || '').digest('hex')}`;
      },
      skip: (req: Request) => {
        // Skip rate limiting for trusted IPs (if configured)
        const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
        return trustedIPs.includes(req.ip);
      }
    });
  }

  /**
   * Validate and sanitize file uploads
   */
  public validateFileUpload(file: Express.Multer.File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      errors.push('File size exceeds 50MB limit');
    }
    
    // Check file type
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      errors.push('Invalid file type. Only JPEG, PNG, WebP, and HEIC formats are allowed.');
    }
    
    // Check filename for malicious content
    const filename = file.originalname.toLowerCase();
    const dangerousPatterns = [
      /\.php$/i, /\.exe$/i, /\.bat$/i, /\.sh$/i, /\.js$/i, /\.html$/i, /\.htm$/i,
      /\.\./g, // Directory traversal
      /[<>:"|?*]/g // Invalid filename characters
    ];
    
    const hasDangerousPattern = dangerousPatterns.some(pattern => pattern.test(filename));
    if (hasDangerousPattern) {
      errors.push('Filename contains invalid or potentially dangerous characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create secure session data
   */
  public createSecureSession(userId: string, additionalData: any = {}): string {
    const sessionData = {
      userId,
      timestamp: Date.now(),
      randomSalt: crypto.randomBytes(16).toString('hex'),
      ...additionalData
    };
    
    const sessionString = JSON.stringify(sessionData);
    const { encrypted, iv } = this.encryptData(sessionString);
    
    return Buffer.from(JSON.stringify({ encrypted, iv })).toString('base64');
  }

  /**
   * Validate and decrypt session data
   */
  public validateSession(sessionToken: string): { isValid: boolean; data?: any } {
    try {
      const sessionEncrypted = JSON.parse(Buffer.from(sessionToken, 'base64').toString('utf8'));
      const decryptedSession = this.decryptData(sessionEncrypted);
      const sessionData = JSON.parse(decryptedSession);
      
      // Check if session is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - sessionData.timestamp > maxAge) {
        return { isValid: false };
      }
      
      return { isValid: true, data: sessionData };
    } catch (error) {
      logger.error('Session validation error:', error);
      return { isValid: false };
    }
  }

  /**
   * Log security events for monitoring
   */
  public logSecurityEvent(event: string, userId?: string, details?: any): void {
    logger.warn('SECURITY EVENT', {
      event,
      userId,
      timestamp: new Date().toISOString(),
      details
    });
  }

  /**
   * Detect and prevent common attack patterns
   */
  public detectSuspiciousActivity(req: Request): { isSuspicious: boolean; reasons: string[] } {
    const reasons: string[] = [];
    
    // Check for SQL injection patterns
    const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)|('|('')|--|\/\*|\*\/)/gi;
    const queryString = JSON.stringify(req.query);
    const bodyString = JSON.stringify(req.body);
    
    if (sqlPatterns.test(queryString) || sqlPatterns.test(bodyString)) {
      reasons.push('Potential SQL injection attempt detected');
    }
    
    // Check for XSS patterns
    const xssPatterns = /<script|javascript:|onclick=|onerror=|onload=/gi;
    if (xssPatterns.test(queryString) || xssPatterns.test(bodyString)) {
      reasons.push('Potential XSS attempt detected');
    }
    
    // Check for excessive request size
    if (JSON.stringify(req.body).length > 100000) { // 100KB
      reasons.push('Unusually large request body');
    }
    
    // Check for suspicious headers
    const userAgent = req.get('User-Agent') || '';
    if (userAgent.length === 0 || userAgent.includes('bot') || userAgent.includes('crawler')) {
      reasons.push('Suspicious or missing User-Agent');
    }
    
    return {
      isSuspicious: reasons.length > 0,
      reasons
    };
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance();
