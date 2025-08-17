import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import logger from '../config/logger';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Profile photo upload
router.post('/profile-photo', authenticate, upload.single('profilePhoto'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const userId = req.user.id;
    const filename = req.file.filename;
    const filepath = `/uploads/${filename}`;

    // Update user's avatar in database
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: filepath }
    });

    logger.info(`Profile photo updated for user ${userId}: ${filepath}`);

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        filename: filename,
        path: filepath,
        url: `${req.protocol}://${req.get('host')}${filepath}`
      }
    });

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
