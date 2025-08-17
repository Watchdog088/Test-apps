import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import sharp from 'sharp';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { securityService } from '../services/securityService';
import logger from '../config/logger';

const router = express.Router();

// Security: Sanitize filename to prevent directory traversal
const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
};

// Security: Generate cryptographically secure filename
const generateSecureFilename = (originalName: string, userId: string): string => {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const ext = path.extname(sanitizeFilename(originalName));
  const userHash = crypto.createHash('sha256').update(userId).digest('hex').substring(0, 8);
  return `${userHash}_${timestamp}_${randomBytes}${ext}`;
};

// Enhanced storage configuration with security
const storage = multer.diskStorage({
  destination: (req: AuthenticatedRequest, file, cb) => {
    const userId = req.user?.id || 'anonymous';
    const userHash = crypto.createHash('sha256').update(userId).digest('hex').substring(0, 8);
    const uploadDir = `uploads/${userHash}/`;
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
    }
    cb(null, uploadDir);
  },
  filename: (req: AuthenticatedRequest, file, cb) => {
    const userId = req.user?.id || 'anonymous';
    const secureFilename = generateSecureFilename(file.originalname, userId);
    cb(null, secureFilename);
  }
});

// Enhanced security file filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ];
  
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
  const ext = path.extname(file.originalname.toLowerCase());
  
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only high-quality image formats (JPEG, PNG, WebP, HEIC) are allowed.'));
  }
};

// High-resolution upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for high-res images
    files: 10
  },
  fileFilter: fileFilter
});

// Image processing service for optimization and security
const processImage = async (
  inputPath: string, 
  outputPath: string, 
  options: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    format?: 'jpeg' | 'png' | 'webp';
    removeMetadata?: boolean;
  } = {}
): Promise<{ width: number; height: number; size: number; format: string }> => {
  const {
    quality = 85,
    maxWidth = 4096,
    maxHeight = 4096,
    format = 'jpeg',
    removeMetadata = true
  } = options;

  let sharpInstance = sharp(inputPath);

  // Remove EXIF data for privacy/security
  if (removeMetadata) {
    sharpInstance = sharpInstance.withMetadata();
  }

  // Resize if necessary while maintaining aspect ratio
  sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
    fit: 'inside',
    withoutEnlargement: true
  });

  // Apply format and quality settings
  switch (format) {
    case 'jpeg':
      sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
      break;
    case 'png':
      sharpInstance = sharpInstance.png({ quality, progressive: true });
      break;
    case 'webp':
      sharpInstance = sharpInstance.webp({ quality });
      break;
  }

  const info = await sharpInstance.toFile(outputPath);
  return {
    width: info.width,
    height: info.height,
    size: info.size,
    format: info.format
  };
};

// Enhanced profile photo upload with security and multiple display options
router.post('/profile-photo', authenticate, upload.single('profilePhoto'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    // Security validation
    const validation = securityService.validateFileUpload(req.file);
    if (!validation.isValid) {
      // Delete uploaded file if invalid
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid file',
        errors: validation.errors
      });
    }

    // Detect suspicious activity
    const suspiciousActivity = securityService.detectSuspiciousActivity(req);
    if (suspiciousActivity.isSuspicious) {
      securityService.logSecurityEvent('Suspicious upload attempt', req.user.id, suspiciousActivity.reasons);
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: 'Upload rejected due to security concerns'
      });
    }

    const userId = req.user.id;
    const { displayLocation } = req.body; // Where to display: 'profile', 'dating', 'both'
    
    // Process image for high quality and security
    const processedImagePath = path.join(path.dirname(req.file.path), 'processed_' + req.file.filename);
    
    try {
      const imageInfo = await processImage(req.file.path, processedImagePath, {
        quality: 90,
        maxWidth: 2048,
        maxHeight: 2048,
        format: 'jpeg',
        removeMetadata: true
      });

      // Delete original file
      fs.unlinkSync(req.file.path);
      
      // Move processed file to final location
      const finalPath = req.file.path;
      fs.renameSync(processedImagePath, finalPath);

      const filepath = `/uploads/${req.file.filename}`;

      // Update user's avatar based on display location
      const updateData: any = {};
      if (displayLocation === 'profile' || displayLocation === 'both' || !displayLocation) {
        updateData.avatar = filepath;
      }

      await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      // Log successful upload
      securityService.logSecurityEvent('Profile photo uploaded', userId, { 
        filename: req.file.filename, 
        size: imageInfo.size,
        displayLocation 
      });

      logger.info(`Profile photo updated for user ${userId}: ${filepath}, display: ${displayLocation}`);

      res.status(200).json({
        success: true,
        message: 'Profile photo uploaded successfully',
        data: {
          filename: req.file.filename,
          path: filepath,
          url: `${req.protocol}://${req.get('host')}${filepath}`,
          displayLocation,
          imageInfo: {
            width: imageInfo.width,
            height: imageInfo.height,
            size: imageInfo.size,
            format: imageInfo.format
          }
        }
      });

    } catch (processingError) {
      // Clean up files on processing error
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      if (fs.existsSync(processedImagePath)) fs.unlinkSync(processedImagePath);
      throw processingError;
    }

  } catch (error) {
    logger.error('Profile photo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo'
    });
  }
});

// Cover photo upload (placeholder - implement when schema supports it)
router.post('/cover-photo', authenticate, upload.single('coverPhoto'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const filename = req.file.filename;
    const filepath = `/uploads/${filename}`;

    // TODO: Add coverPhoto field to User model in Prisma schema
    logger.info(`Cover photo uploaded for user ${req.user.id}: ${filepath}`);

    res.status(200).json({
      success: true,
      message: 'Cover photo uploaded successfully',
      data: {
        filename: filename,
        path: filepath,
        url: `${req.protocol}://${req.get('host')}${filepath}`
      }
    });

  } catch (error) {
    logger.error('Cover photo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload cover photo'
    });
  }
});

// Post media upload (multiple files)
router.post('/post-media', authenticate, upload.array('media', 10), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    const files = req.files as Express.Multer.File[];
    const uploadedFiles = files.map(file => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size
    }));

    logger.info(`Post media uploaded for user ${req.user.id}: ${uploadedFiles.length} files`);

    res.status(200).json({
      success: true,
      message: 'Media files uploaded successfully',
      data: {
        files: uploadedFiles
      }
    });

  } catch (error) {
    logger.error('Post media upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload media files'
    });
  }
});

// Dating profile photos upload (multiple) - placeholder until DatingPhoto model is added
router.post('/dating-photos', authenticate, upload.array('photos', 6), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    const files = req.files as Express.Multer.File[];
    const uploadedPhotos = files.map((file, index) => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
      order: index
    }));

    logger.info(`Dating photos uploaded for user ${req.user.id}: ${uploadedPhotos.length} photos`);

    res.status(200).json({
      success: true,
      message: 'Dating photos uploaded successfully',
      data: {
        photos: uploadedPhotos
      }
    });

  } catch (error) {
    logger.error('Dating photos upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload dating photos'
    });
  }
});

// Delete uploaded file
router.delete('/file/:filename', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filename } = req.params;
    const filepath = path.join('uploads', filename);

    // Check if file exists
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      
      logger.info(`File deleted by user ${req.user.id}: ${filename}`);
      
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

  } catch (error) {
    logger.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
});

// Get user's uploaded files
router.get('/my-files', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;

    // Get user data with available photo fields
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        avatar: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const files = {
      profilePhoto: user.avatar ? {
        path: user.avatar,
        url: `${req.protocol}://${req.get('host')}${user.avatar}`
      } : null,
      // TODO: Add coverPhoto and datingPhotos when schema is updated
      coverPhoto: null,
      datingPhotos: []
    };

    res.status(200).json({
      success: true,
      data: files
    });

  } catch (error) {
    logger.error('Get user files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve files'
    });
  }
});

export default router;
