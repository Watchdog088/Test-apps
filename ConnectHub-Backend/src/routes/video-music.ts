import { Router, Request, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { videoMusicService } from '../services/videoMusicService';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import logger from '../config/logger';

// Multer configuration for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/music/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for music files
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/m4a'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio format'));
    }
  }
});

const router = Router();

/**
 * Get music library based on user subscription
 */
router.get('/music/library', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userSubscription = 'free'; // TODO: Implement subscription system
    const library = await videoMusicService.getMusicLibrary(userSubscription as any);
    
    res.json({
      success: true,
      data: {
        tracks: library,
        totalTracks: library.length,
        subscription: userSubscription
      }
    });
  } catch (error) {
    logger.error('Get music library error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load music library'
    });
  }
});

/**
 * Search music tracks
 */
router.get('/music/search', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { query = '', mood, genre, maxDuration, isPremium } = req.query;
    
    const filters = {
      mood: mood as string,
      genre: genre as string,
      maxDuration: maxDuration ? parseInt(maxDuration as string) : undefined,
      isPremium: isPremium === 'true' ? true : isPremium === 'false' ? false : undefined
    };
    
    const results = await videoMusicService.searchMusic(query as string, filters);
    
    res.json({
      success: true,
      data: {
        tracks: results,
        totalResults: results.length,
        query,
        filters
      }
    });
  } catch (error) {
    logger.error('Music search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search music'
    });
  }
});

/**
 * Get trending music recommendations for video
 */
router.post('/music/trending', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { videoDuration } = req.body;
    const userSubscription = 'free'; // TODO: Implement subscription system
    
    if (!videoDuration || videoDuration <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid video duration is required'
      });
    }
    
    const recommendations = await videoMusicService.getTrendingMusicForVideo(
      videoDuration,
      userSubscription as any
    );
    
    res.json({
      success: true,
      data: {
        recommendations,
        videoDuration,
        totalRecommendations: recommendations.length
      }
    });
  } catch (error) {
    logger.error('Get trending music error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get music recommendations'
    });
  }
});

/**
 * Get music suggestions based on video content
 */
router.post('/music/suggest', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { videoPath, contentType = 'general' } = req.body;
    const userSubscription = 'free'; // TODO: Implement subscription system
    
    if (!videoPath) {
      return res.status(400).json({
        success: false,
        error: 'Video path is required'
      });
    }
    
    const suggestions = await videoMusicService.suggestMusicBasedOnContent(
      videoPath,
      contentType,
      userSubscription as any
    );
    
    res.json({
      success: true,
      data: {
        suggestions,
        contentType,
        totalSuggestions: suggestions.length
      }
    });
  } catch (error) {
    logger.error('Get music suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get music suggestions'
    });
  }
});

/**
 * Upload custom music track
 */
router.post('/music/upload', authenticate, upload.single('audio'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Audio file is required'
      });
    }
    
    const { name, genre, mood } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Music track name is required'
      });
    }
    
    const userId = req.user?.id;
    const result = await videoMusicService.uploadUserMusic(
      req.file.path,
      userId,
      { name, genre, mood }
    );
    
    // Clean up uploaded file if processing failed
    if (!result.success && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (result.success) {
      res.status(201).json({
        success: true,
        data: {
          trackId: result.trackId,
          message: 'Music uploaded successfully'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Upload user music error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload music'
    });
  }
});

/**
 * Get user's uploaded music library
 */
router.get('/music/user', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userLibrary = await videoMusicService.getUserMusicLibrary(userId);
    
    res.json({
      success: true,
      data: {
        tracks: userLibrary,
        totalTracks: userLibrary.length
      }
    });
  } catch (error) {
    logger.error('Get user music library error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load user music library'
    });
  }
});

/**
 * Add music overlay to video
 */
router.post('/overlay/music', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      videoPath,
      musicTrackId,
      volume = { original: 0.7, music: 0.3 },
      fadeIn,
      fadeOut,
      startTime,
      loop = false,
      editingOptions = {}
    } = req.body;
    
    if (!videoPath || !musicTrackId) {
      return res.status(400).json({
        success: false,
        error: 'Video path and music track ID are required'
      });
    }
    
    // Get music track details
    const userSubscription = 'free'; // TODO: Implement subscription system
    const musicLibrary = await videoMusicService.getMusicLibrary(userSubscription as any);
    const userLibrary = await videoMusicService.getUserMusicLibrary(req.user?.id);
    
    const allTracks = [...musicLibrary, ...userLibrary];
    const musicTrack = allTracks.find(track => track.id === musicTrackId);
    
    if (!musicTrack) {
      return res.status(404).json({
        success: false,
        error: 'Music track not found'
      });
    }
    
    // Generate output filename
    const outputFilename = `${Date.now()}_${req.user?.id}_music_overlay.mp4`;
    const outputPath = path.join(__dirname, '../../uploads/processed-videos', outputFilename);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const musicOptions = {
      musicTrack,
      volume,
      fadeIn,
      fadeOut,
      startTime,
      loop
    };
    
    const result = await videoMusicService.addMusicToVideo(
      videoPath,
      outputPath,
      musicOptions,
      editingOptions
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          outputPath: result.outputPath,
          outputUrl: `/api/uploads/processed-videos/${outputFilename}`,
          metadata: result.metadata
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Music overlay error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add music overlay'
    });
  }
});

/**
 * Create social media optimized versions with music
 */
router.post('/create/social-versions', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      videoPath,
      musicTrackId,
      volume = { original: 0.7, music: 0.3 }
    } = req.body;
    
    if (!videoPath || !musicTrackId) {
      return res.status(400).json({
        success: false,
        error: 'Video path and music track ID are required'
      });
    }
    
    // Get music track details
    const userSubscription = 'free'; // TODO: Implement subscription system
    const musicLibrary = await videoMusicService.getMusicLibrary(userSubscription as any);
    const userLibrary = await videoMusicService.getUserMusicLibrary(req.user?.id);
    
    const allTracks = [...musicLibrary, ...userLibrary];
    const musicTrack = allTracks.find(track => track.id === musicTrackId);
    
    if (!musicTrack) {
      return res.status(404).json({
        success: false,
        error: 'Music track not found'
      });
    }
    
    // Create output directory
    const outputDir = path.join(__dirname, '../../uploads/social-versions', `${Date.now()}_${req.user?.id}`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const musicOptions = {
      musicTrack,
      volume
    };
    
    const results = await videoMusicService.createSocialMediaVersions(
      videoPath,
      outputDir,
      musicOptions
    );
    
    // Convert file paths to URLs
    const urlResults = {};
    Object.entries(results).forEach(([platform, filePath]) => {
      if (filePath && typeof filePath === 'string') {
        const filename = path.basename(filePath);
        urlResults[platform] = `/api/uploads/social-versions/${path.basename(outputDir)}/${filename}`;
      }
    });
    
    res.json({
      success: true,
      data: {
        versions: urlResults,
        outputDirectory: outputDir
      }
    });
  } catch (error) {
    logger.error('Create social versions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create social media versions'
    });
  }
});

export default router;
