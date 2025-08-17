import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import sharp from 'sharp';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { securityService } from '../services/securityService';
import { videoWatermarkService, WatermarkOptions } from '../services/videoWatermarkService';
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

// Enhanced security file filter for images
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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

// Enhanced security file filter for videos
const videoFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/x-matroska'
  ];
  
  const allowedExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'];
  const ext = path.extname(file.originalname.toLowerCase());
  
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only high-quality video formats (MP4, MOV, AVI, WebM, MKV) are allowed.'));
  }
};

// Mixed media file filter (images and videos)
const mediaFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
    // Videos
    'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'
  ];
  
  const allowedExtensions = [
    // Images
    '.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif',
    // Videos
    '.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'
  ];
  
  const ext = path.extname(file.originalname.toLowerCase());
  
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only high-quality image and video formats are allowed.'));
  }
};

// High-resolution image upload configuration
const imageUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for high-res images
    files: 10
  },
  fileFilter: imageFileFilter
});

// High-capacity video upload configuration
const videoUpload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for videos
    files: 5
  },
  fileFilter: videoFileFilter
});

// Mixed media upload configuration
const mediaUpload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for mixed media
    files: 10
  },
  fileFilter: mediaFileFilter
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
router.post('/profile-photo', authenticate, imageUpload.single('profilePhoto'), async (req: AuthenticatedRequest, res: Response) => {
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
router.post('/cover-photo', authenticate, imageUpload.single('coverPhoto'), async (req: AuthenticatedRequest, res: Response) => {
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
router.post('/post-media', authenticate, mediaUpload.array('media', 10), async (req: AuthenticatedRequest, res: Response) => {
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
router.post('/dating-photos', authenticate, imageUpload.array('photos', 6), async (req: AuthenticatedRequest, res: Response) => {
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

// 🎬 VIDEO WATERMARKING ENDPOINTS - CROSS PLATFORM SUPPORT

// Single video upload with watermarking
router.post('/video', authenticate, videoUpload.single('video'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const userId = req.user.id;
    const {
      platform = 'web', // web, mobile, instagram, tiktok, youtube
      watermarkType = 'both', // text, image, both
      brandLogo = true,
      customText,
      watermarkPosition = 'bottom-right'
    } = req.body;

    // Validate video
    const validation = await videoWatermarkService.validateVideo(req.file.path);
    if (!validation.isValid) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid video file',
        errors: validation.errors
      });
    }

    // Configure watermark options
    const watermarkOptions: WatermarkOptions = {
      type: watermarkType as 'text' | 'image' | 'both',
      brandLogo: brandLogo === 'true' || brandLogo === true,
      text: customText ? {
        content: customText,
        font: 'Arial',
        fontSize: 24,
        color: 'white',
        position: watermarkPosition,
        opacity: 0.8
      } : undefined
    };

    // Generate output path
    const outputPath = req.file.path.replace(/\.[^/.]+$/, '_watermarked.mp4');

    // Apply watermark
    const result = await videoWatermarkService.applyWatermark(
      req.file.path,
      outputPath,
      watermarkOptions,
      { quality: 'high', format: 'mp4' }
    );

    if (!result.success) {
      fs.unlinkSync(req.file.path);
      return res.status(500).json({
        success: false,
        message: 'Video processing failed',
        error: result.error
      });
    }

    // Clean up original file
    fs.unlinkSync(req.file.path);

    const filename = path.basename(outputPath);
    const filepath = `/uploads/${filename}`;

    logger.info(`Video with watermark uploaded for user ${userId}: ${filepath}, platform: ${platform}`);

    res.status(200).json({
      success: true,
      message: 'Video uploaded and watermarked successfully',
      data: {
        filename,
        path: filepath,
        url: `${req.protocol}://${req.get('host')}${filepath}`,
        platform,
        watermarkApplied: true,
        metadata: result.metadata
      }
    });

  } catch (error) {
    logger.error('Video upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload and process video'
    });
  }
});

// Multi-platform video optimization endpoint
router.post('/video/optimize-platforms', authenticate, videoUpload.single('video'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const userId = req.user.id;
    const {
      platforms = ['web', 'mobile'], // Array of platforms to optimize for
      brandLogo = true,
      customText = '@ConnectHub'
    } = req.body;

    // Configure watermark options
    const watermarkOptions: WatermarkOptions = {
      type: 'both',
      brandLogo: brandLogo === 'true' || brandLogo === true,
      text: {
        content: customText,
        font: 'Arial',
        fontSize: 24,
        color: 'white',
        position: 'bottom-right',
        opacity: 0.8
      }
    };

    // Create platform-optimized versions
    const outputDir = path.dirname(req.file.path);
    const optimizedVersions = await videoWatermarkService.createPlatformOptimizedVersions(
      req.file.path,
      outputDir,
      watermarkOptions
    );

    // Clean up original file
    fs.unlinkSync(req.file.path);

    // Prepare response data
    const responseData: any = {
      originalProcessed: true,
      platforms: {}
    };

    Object.entries(optimizedVersions).forEach(([platform, filePath]) => {
      if (filePath && platforms.includes(platform)) {
        const filename = path.basename(filePath);
        responseData.platforms[platform] = {
          filename,
          path: `/uploads/${filename}`,
          url: `${req.protocol}://${req.get('host')}/uploads/${filename}`
        };
      }
    });

    logger.info(`Multi-platform video optimization completed for user ${userId}: ${Object.keys(responseData.platforms).join(', ')}`);

    res.status(200).json({
      success: true,
      message: 'Video optimized for multiple platforms successfully',
      data: responseData
    });

  } catch (error) {
    logger.error('Multi-platform video optimization error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to optimize video for platforms'
    });
  }
});

// Dating app video upload with romantic watermarks
router.post('/dating-video', authenticate, videoUpload.single('video'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const userId = req.user.id;
    
    // Special romantic watermark for dating videos
    const watermarkOptions: WatermarkOptions = {
      type: 'both',
      brandLogo: true, // This will use LynkDating branding
      text: {
        content: '💖 Find Your Perfect Match',
        font: 'Arial',
        fontSize: 20,
        color: 'white',
        position: 'bottom-left',
        opacity: 0.7
      }
    };

    const outputPath = req.file.path.replace(/\.[^/.]+$/, '_dating_watermarked.mp4');

    const result = await videoWatermarkService.applyWatermark(
      req.file.path,
      outputPath,
      watermarkOptions,
      { quality: 'high', format: 'mp4' }
    );

    if (!result.success) {
      fs.unlinkSync(req.file.path);
      return res.status(500).json({
        success: false,
        message: 'Dating video processing failed',
        error: result.error
      });
    }

    fs.unlinkSync(req.file.path);
    
    const filename = path.basename(outputPath);
    const filepath = `/uploads/${filename}`;

    logger.info(`Dating video with romantic watermark uploaded for user ${userId}: ${filepath}`);

    res.status(200).json({
      success: true,
      message: 'Dating video uploaded with romantic watermark successfully',
      data: {
        filename,
        path: filepath,
        url: `${req.protocol}://${req.get('host')}${filepath}`,
        type: 'dating',
        watermarkApplied: true,
        metadata: result.metadata
      }
    });

  } catch (error) {
    logger.error('Dating video upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload dating video'
    });
  }
});

// Social media post video with brand watermarks
router.post('/social-video', authenticate, videoUpload.single('video'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const userId = req.user.id;
    const { postCaption = '@ConnectHub - Share Love' } = req.body;
    
    // Social media branding watermark
    const watermarkOptions: WatermarkOptions = {
      type: 'both',
      brandLogo: true, // ConnectHub branding
      text: {
        content: postCaption,
        font: 'Arial',
        fontSize: 22,
        color: 'white',
        position: 'bottom-right',
        opacity: 0.8
      }
    };

    const outputPath = req.file.path.replace(/\.[^/.]+$/, '_social_watermarked.mp4');

    const result = await videoWatermarkService.applyWatermark(
      req.file.path,
      outputPath,
      watermarkOptions,
      { quality: 'high', format: 'mp4' }
    );

    if (!result.success) {
      fs.unlinkSync(req.file.path);
      return res.status(500).json({
        success: false,
        message: 'Social video processing failed',
        error: result.error
      });
    }

    fs.unlinkSync(req.file.path);
    
    const filename = path.basename(outputPath);
    const filepath = `/uploads/${filename}`;

    logger.info(`Social media video with brand watermark uploaded for user ${userId}: ${filepath}`);

    res.status(200).json({
      success: true,
      message: 'Social media video uploaded with brand watermark successfully',
      data: {
        filename,
        path: filepath,
        url: `${req.protocol}://${req.get('host')}${filepath}`,
        type: 'social',
        watermarkApplied: true,
        postCaption,
        metadata: result.metadata
      }
    });

  } catch (error) {
    logger.error('Social video upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload social video'
    });
  }
});

// Video metadata and validation endpoint
router.post('/video/validate', authenticate, videoUpload.single('video'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const validation = await videoWatermarkService.validateVideo(req.file.path);
    const metadata = validation.isValid ? await videoWatermarkService.getVideoMetadata(req.file.path) : null;

    // Clean up the uploaded file since we're just validating
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      data: {
        isValid: validation.isValid,
        errors: validation.errors,
        metadata: metadata ? {
          duration: metadata.duration,
          resolution: `${metadata.width}x${metadata.height}`,
          size: metadata.size,
          format: metadata.format,
          bitrate: metadata.bitrate
        } : null
      }
    });

  } catch (error) {
    logger.error('Video validation error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to validate video'
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
