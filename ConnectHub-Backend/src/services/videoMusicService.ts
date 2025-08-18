import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import logger from '../config/logger';

export interface AudioTrack {
  id: string;
  name: string;
  path: string;
  duration: number;
  genre: string;
  mood: 'energetic' | 'calm' | 'romantic' | 'upbeat' | 'dramatic' | 'chill';
  isPremium: boolean;
  artist?: string;
  license: 'royalty-free' | 'creative-commons' | 'premium' | 'user-upload';
}

export interface MusicOverlayOptions {
  musicTrack: AudioTrack;
  volume: {
    original: number; // 0.0 to 1.0 (original video audio volume)
    music: number;    // 0.0 to 1.0 (background music volume)
  };
  fadeIn?: {
    enabled: boolean;
    duration: number; // seconds
  };
  fadeOut?: {
    enabled: boolean;
    duration: number; // seconds
  };
  startTime?: number; // seconds - when to start the music in the video
  loop?: boolean; // whether to loop music if video is longer
  syncToBeats?: boolean; // advanced: sync video cuts to music beats
}

export interface VideoEditingOptions {
  trim?: {
    start: number; // seconds
    duration: number; // seconds
  };
  speed?: number; // 0.5 = half speed, 2.0 = double speed
  filters?: {
    brightness?: number; // -1.0 to 1.0
    contrast?: number;   // -1.0 to 1.0
    saturation?: number; // -1.0 to 1.0
    vintage?: boolean;
    blackAndWhite?: boolean;
  };
}

class VideoMusicService {
  private readonly supportedAudioFormats = ['.mp3', '.wav', '.aac', '.ogg', '.m4a'];
  private readonly musicLibraryPath = path.join(__dirname, '../../assets/music');
  private readonly userMusicPath = path.join(__dirname, '../../uploads/user-music');

  constructor() {
    // Ensure music directories exist
    this.ensureDirectories();
    this.initializeMusicLibrary();
  }

  /**
   * Creates directories for music storage
   */
  private ensureDirectories(): void {
    [this.musicLibraryPath, this.userMusicPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Initializes the royalty-free music library
   */
  private initializeMusicLibrary(): void {
    // This would be populated with actual royalty-free music tracks
    // For now, we'll create a mock library structure
    const musicLibrary = this.getDefaultMusicLibrary();
    
    // Store music library metadata
    const libraryPath = path.join(this.musicLibraryPath, 'library.json');
    if (!fs.existsSync(libraryPath)) {
      fs.writeFileSync(libraryPath, JSON.stringify(musicLibrary, null, 2));
    }
  }

  /**
   * Gets the default music library with royalty-free tracks
   */
  private getDefaultMusicLibrary(): AudioTrack[] {
    return [
      {
        id: 'upbeat-01',
        name: 'Summer Vibes',
        path: 'upbeat/summer-vibes.mp3',
        duration: 180,
        genre: 'Pop',
        mood: 'upbeat',
        isPremium: false,
        license: 'royalty-free'
      },
      {
        id: 'chill-01',
        name: 'Peaceful Morning',
        path: 'chill/peaceful-morning.mp3',
        duration: 240,
        genre: 'Ambient',
        mood: 'calm',
        isPremium: false,
        license: 'royalty-free'
      },
      {
        id: 'romantic-01',
        name: 'Heart Strings',
        path: 'romantic/heart-strings.mp3',
        duration: 200,
        genre: 'Acoustic',
        mood: 'romantic',
        isPremium: true,
        license: 'premium'
      },
      {
        id: 'energetic-01',
        name: 'Workout Beats',
        path: 'energetic/workout-beats.mp3',
        duration: 220,
        genre: 'Electronic',
        mood: 'energetic',
        isPremium: false,
        license: 'royalty-free'
      },
      {
        id: 'dramatic-01',
        name: 'Epic Journey',
        path: 'dramatic/epic-journey.mp3',
        duration: 300,
        genre: 'Cinematic',
        mood: 'dramatic',
        isPremium: true,
        license: 'premium'
      }
    ];
  }

  /**
   * Gets available music tracks based on user subscription
   */
  async getMusicLibrary(userSubscription: 'free' | 'premium' | 'vip' = 'free'): Promise<AudioTrack[]> {
    try {
      const libraryPath = path.join(this.musicLibraryPath, 'library.json');
      const library: AudioTrack[] = JSON.parse(fs.readFileSync(libraryPath, 'utf8'));
      
      // Filter based on subscription level
      if (userSubscription === 'free') {
        return library.filter(track => !track.isPremium);
      }
      
      return library; // Premium/VIP users get all tracks
      
    } catch (error) {
      logger.error('Failed to load music library:', error);
      return this.getDefaultMusicLibrary();
    }
  }

  /**
   * Searches music library by mood, genre, or name
   */
  async searchMusic(
    query: string,
    filters: {
      mood?: string;
      genre?: string;
      maxDuration?: number;
      isPremium?: boolean;
    } = {}
  ): Promise<AudioTrack[]> {
    const library = await this.getMusicLibrary();
    
    return library.filter(track => {
      // Text search
      const matchesQuery = query === '' || 
        track.name.toLowerCase().includes(query.toLowerCase()) ||
        track.genre.toLowerCase().includes(query.toLowerCase()) ||
        track.mood.toLowerCase().includes(query.toLowerCase());
      
      // Mood filter
      const matchesMood = !filters.mood || track.mood === filters.mood;
      
      // Genre filter
      const matchesGenre = !filters.genre || track.genre.toLowerCase() === filters.genre.toLowerCase();
      
      // Duration filter
      const matchesDuration = !filters.maxDuration || track.duration <= filters.maxDuration;
      
      // Premium filter
      const matchesPremium = filters.isPremium === undefined || track.isPremium === filters.isPremium;
      
      return matchesQuery && matchesMood && matchesGenre && matchesDuration && matchesPremium;
    });
  }

  /**
   * Validates audio file for user uploads
   */
  async validateAudioFile(filePath: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Check file exists
      if (!fs.existsSync(filePath)) {
        errors.push('Audio file not found');
        return { isValid: false, errors };
      }
      
      // Check file size (max 50MB for user uploads)
      const stats = fs.statSync(filePath);
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (stats.size > maxSize) {
        errors.push(`Audio file too large. Max size: ${maxSize / (1024 * 1024)}MB`);
      }
      
      // Check file extension
      const ext = path.extname(filePath).toLowerCase();
      if (!this.supportedAudioFormats.includes(ext)) {
        errors.push(`Unsupported audio format. Supported: ${this.supportedAudioFormats.join(', ')}`);
      }
      
      // Get audio metadata
      const metadata = await this.getAudioMetadata(filePath);
      
      // Check duration (max 10 minutes for user uploads)
      const maxDuration = 600; // 10 minutes
      if (metadata.duration && metadata.duration > maxDuration) {
        errors.push(`Audio too long. Max duration: ${maxDuration / 60} minutes`);
      }
      
      return { isValid: errors.length === 0, errors };
      
    } catch (error) {
      logger.error('Audio validation error:', error);
      errors.push('Failed to validate audio file');
      return { isValid: false, errors };
    }
  }

  /**
   * Gets audio metadata using FFprobe
   */
  async getAudioMetadata(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            duration: metadata.format.duration,
            bitrate: metadata.format.bit_rate,
            format: metadata.format.format_name,
            size: metadata.format.size,
            sampleRate: metadata.streams[0]?.sample_rate,
            channels: metadata.streams[0]?.channels
          });
        }
      });
    });
  }

  /**
   * Applies music overlay to video
   */
  async addMusicToVideo(
    videoPath: string,
    outputPath: string,
    musicOptions: MusicOverlayOptions,
    editingOptions: VideoEditingOptions = {}
  ): Promise<{ success: boolean; outputPath?: string; metadata?: any; error?: string }> {
    try {
      // Get music track path
      const musicPath = path.isAbsolute(musicOptions.musicTrack.path) 
        ? musicOptions.musicTrack.path 
        : path.join(this.musicLibraryPath, musicOptions.musicTrack.path);
      
      // Validate files exist
      if (!fs.existsSync(videoPath)) {
        return { success: false, error: 'Video file not found' };
      }
      
      if (!fs.existsSync(musicPath)) {
        return { success: false, error: 'Music file not found' };
      }
      
      // Get video metadata
      const videoMetadata = await this.getVideoMetadata(videoPath);
      const audioMetadata = await this.getAudioMetadata(musicPath);
      
      logger.info('Adding music to video:', {
        video: { duration: videoMetadata.duration, resolution: `${videoMetadata.width}x${videoMetadata.height}` },
        audio: { duration: audioMetadata.duration, format: audioMetadata.format }
      });

      // Create FFmpeg command
      let command = ffmpeg()
        .input(videoPath)
        .input(musicPath);

      // Build complex filter for audio mixing
      const filters: string[] = [];
      
      // Handle video trimming if specified
      let videoFilter = '[0:v]';
      if (editingOptions.trim) {
        const { start, duration } = editingOptions.trim;
        videoFilter = `[0:v]trim=start=${start}:duration=${duration},setpts=PTS-STARTPTS[trimmed_video]`;
        filters.push(videoFilter);
        videoFilter = '[trimmed_video]';
      }
      
      // Handle video speed adjustment
      if (editingOptions.speed && editingOptions.speed !== 1.0) {
        const speedFilter = `${videoFilter}setpts=${1/editingOptions.speed}*PTS[speed_video]`;
        filters.push(speedFilter);
        videoFilter = '[speed_video]';
      }
      
      // Handle video color filters
      if (editingOptions.filters) {
        const colorFilters: string[] = [];
        const { brightness, contrast, saturation, vintage, blackAndWhite } = editingOptions.filters;
        
        if (brightness !== undefined) {
          colorFilters.push(`eq=brightness=${brightness}`);
        }
        if (contrast !== undefined) {
          colorFilters.push(`eq=contrast=${contrast + 1}`);
        }
        if (saturation !== undefined) {
          colorFilters.push(`eq=saturation=${saturation + 1}`);
        }
        if (blackAndWhite) {
          colorFilters.push('hue=s=0');
        }
        if (vintage) {
          colorFilters.push('colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131');
        }
        
        if (colorFilters.length > 0) {
          const colorFilter = `${videoFilter}${colorFilters.join(',')}[filtered_video]`;
          filters.push(colorFilter);
          videoFilter = '[filtered_video]';
        }
      }

      // Handle audio mixing
      let originalAudioFilter = '[0:a]';
      let musicAudioFilter = '[1:a]';
      
      // Handle music timing and looping
      if (musicOptions.startTime || musicOptions.loop) {
        const musicFilters: string[] = [];
        
        if (musicOptions.startTime) {
          musicFilters.push(`adelay=${musicOptions.startTime * 1000}|${musicOptions.startTime * 1000}`);
        }
        
        // Loop music if video is longer
        if (musicOptions.loop && videoMetadata.duration > audioMetadata.duration) {
          const loops = Math.ceil(videoMetadata.duration / audioMetadata.duration);
          musicFilters.push(`aloop=loop=${loops - 1}:size=${audioMetadata.sampleRate * audioMetadata.duration}`);
        }
        
        if (musicFilters.length > 0) {
          musicAudioFilter = `[1:a]${musicFilters.join(',')}[processed_music]`;
          filters.push(musicAudioFilter);
          musicAudioFilter = '[processed_music]';
        }
      }
      
      // Apply fade effects to music
      if (musicOptions.fadeIn?.enabled || musicOptions.fadeOut?.enabled) {
        const fadeFilters: string[] = [];
        
        if (musicOptions.fadeIn?.enabled) {
          fadeFilters.push(`afade=t=in:st=0:d=${musicOptions.fadeIn.duration}`);
        }
        
        if (musicOptions.fadeOut?.enabled) {
          const fadeStart = Math.max(0, audioMetadata.duration - musicOptions.fadeOut.duration);
          fadeFilters.push(`afade=t=out:st=${fadeStart}:d=${musicOptions.fadeOut.duration}`);
        }
        
        if (fadeFilters.length > 0) {
          const fadeFilter = `${musicAudioFilter}${fadeFilters.join(',')}[faded_music]`;
          filters.push(fadeFilter);
          musicAudioFilter = '[faded_music]';
        }
      }
      
      // Adjust audio volumes and mix
      const originalVolume = musicOptions.volume.original;
      const musicVolume = musicOptions.volume.music;
      
      const audioMixFilter = `${originalAudioFilter}volume=${originalVolume}[original_vol];${musicAudioFilter}volume=${musicVolume}[music_vol];[original_vol][music_vol]amix=inputs=2:duration=first:dropout_transition=3[mixed_audio]`;
      filters.push(audioMixFilter);

      // Apply all filters
      if (filters.length > 0) {
        command = command.complexFilter(filters, [videoFilter.replace(/\[|\]/g, ''), 'mixed_audio']);
        command = command.outputOptions(['-map', '0', '-map', '[mixed_audio]']);
      }

      // Set output codec and format
      command = command
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4');

      // Execute FFmpeg command
      return new Promise((resolve) => {
        command
          .on('start', (commandLine) => {
            logger.info('FFmpeg music overlay started:', commandLine);
          })
          .on('progress', (progress) => {
            logger.debug('Music overlay progress:', progress);
          })
          .on('end', () => {
            logger.info('Music overlay completed:', outputPath);
            resolve({
              success: true,
              outputPath,
              metadata: {
                originalVideoSize: fs.statSync(videoPath).size,
                processedSize: fs.statSync(outputPath).size,
                videoDuration: videoMetadata.duration,
                musicTrack: musicOptions.musicTrack.name
              }
            });
          })
          .on('error', (err) => {
            logger.error('FFmpeg music overlay error:', err);
            resolve({ success: false, error: err.message });
          })
          .save(outputPath);
      });

    } catch (error) {
      logger.error('Video music overlay error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Gets video metadata using FFprobe
   */
  async getVideoMetadata(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            duration: metadata.format.duration,
            width: metadata.streams[0]?.width,
            height: metadata.streams[0]?.height,
            bitrate: metadata.format.bit_rate,
            format: metadata.format.format_name,
            size: metadata.format.size
          });
        }
      });
    });
  }

  /**
   * Creates different video formats optimized for social media platforms
   */
  async createSocialMediaVersions(
    videoPath: string,
    outputDir: string,
    musicOptions: MusicOverlayOptions
  ): Promise<{
    shorts?: string;    // TikTok/YouTube Shorts (9:16)
    story?: string;     // Instagram/Facebook Story (9:16)
    post?: string;      // Instagram Post (1:1)
    landscape?: string; // YouTube/Facebook (16:9)
  }> {
    const results: any = {};
    const baseFilename = path.parse(videoPath).name;

    try {
      // TikTok/YouTube Shorts version (1080x1920, vertical)
      const shortsPath = path.join(outputDir, `${baseFilename}_shorts.mp4`);
      const shortsResult = await this.addMusicToVideo(
        videoPath,
        shortsPath,
        musicOptions,
        {
          filters: {
            brightness: 0.1,
            saturation: 0.2
          }
        }
      );
      if (shortsResult.success) results.shorts = shortsPath;

      // Instagram Story version (1080x1920, vertical)
      const storyPath = path.join(outputDir, `${baseFilename}_story.mp4`);
      const storyResult = await this.addMusicToVideo(
        videoPath,
        storyPath,
        musicOptions,
        {
          trim: { start: 0, duration: 15 }, // Stories are usually short
          filters: {
            vintage: true
          }
        }
      );
      if (storyResult.success) results.story = storyPath;

      // Instagram Post version (1080x1080, square)
      const postPath = path.join(outputDir, `${baseFilename}_post.mp4`);
      const postResult = await this.addMusicToVideo(
        videoPath,
        postPath,
        musicOptions
      );
      if (postResult.success) results.post = postPath;

      // Landscape version (1920x1080, 16:9)
      const landscapePath = path.join(outputDir, `${baseFilename}_landscape.mp4`);
      const landscapeResult = await this.addMusicToVideo(
        videoPath,
        landscapePath,
        musicOptions
      );
      if (landscapeResult.success) results.landscape = landscapePath;

      return results;

    } catch (error) {
      logger.error('Social media versions creation error:', error);
      return results;
    }
  }

  /**
   * Creates a video with trending music recommendations
   */
  async getTrendingMusicForVideo(videoDuration: number, userSubscription: 'free' | 'premium' | 'vip' = 'free'): Promise<AudioTrack[]> {
    const musicLibrary = await this.getMusicLibrary(userSubscription);
    
    // Filter music that fits the video duration (within 20% tolerance)
    const suitableMusic = musicLibrary.filter(track => {
      const durationTolerance = videoDuration * 0.2;
      return Math.abs(track.duration - videoDuration) <= durationTolerance;
    });
    
    // Sort by popularity/mood (for now, randomize but prioritize upbeat/energetic)
    return suitableMusic
      .sort((a, b) => {
        const moodPriority = { energetic: 3, upbeat: 2, dramatic: 1, romantic: 1, calm: 0, chill: 0 };
        return (moodPriority[b.mood] || 0) - (moodPriority[a.mood] || 0);
      })
      .slice(0, 10); // Return top 10 recommendations
  }

  /**
   * Analyzes video content and suggests appropriate music
   */
  async suggestMusicBasedOnContent(
    videoPath: string,
    contentType: 'fitness' | 'travel' | 'food' | 'fashion' | 'dating' | 'general' = 'general',
    userSubscription: 'free' | 'premium' | 'vip' = 'free'
  ): Promise<AudioTrack[]> {
    const musicLibrary = await this.getMusicLibrary(userSubscription);
    
    // Content-based music recommendations
    const contentMoodMap = {
      fitness: ['energetic', 'upbeat'],
      travel: ['upbeat', 'dramatic'],
      food: ['chill', 'upbeat'],
      fashion: ['upbeat', 'dramatic'],
      dating: ['romantic', 'upbeat'],
      general: ['upbeat', 'chill', 'energetic']
    };
    
    const suitableMoods = contentMoodMap[contentType];
    return musicLibrary
      .filter(track => suitableMoods.includes(track.mood))
      .slice(0, 8);
  }

  /**
   * Uploads custom music track for users
   */
  async uploadUserMusic(
    filePath: string,
    userId: string,
    metadata: {
      name: string;
      genre?: string;
      mood?: string;
    }
  ): Promise<{ success: boolean; trackId?: string; error?: string }> {
    try {
      // Validate the audio file
      const validation = await this.validateAudioFile(filePath);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Generate unique track ID
      const trackId = crypto.randomUUID();
      const fileExt = path.extname(filePath);
      const newFilename = `${userId}_${trackId}${fileExt}`;
      const destPath = path.join(this.userMusicPath, newFilename);

      // Copy file to user music directory
      fs.copyFileSync(filePath, destPath);

      // Get audio metadata
      const audioMetadata = await this.getAudioMetadata(destPath);

      // Create track entry
      const userTrack: AudioTrack = {
        id: trackId,
        name: metadata.name,
        path: destPath,
        duration: audioMetadata.duration,
        genre: metadata.genre || 'User Upload',
        mood: (metadata.mood as any) || 'general',
        isPremium: false,
        license: 'user-upload'
      };

      // Save track metadata (in production, this would go to database)
      const userLibraryPath = path.join(this.userMusicPath, `${userId}_library.json`);
      let userLibrary: AudioTrack[] = [];
      
      if (fs.existsSync(userLibraryPath)) {
        userLibrary = JSON.parse(fs.readFileSync(userLibraryPath, 'utf8'));
      }
      
      userLibrary.push(userTrack);
      fs.writeFileSync(userLibraryPath, JSON.stringify(userLibrary, null, 2));

      logger.info(`User music uploaded successfully: ${trackId}`);
      return { success: true, trackId };

    } catch (error) {
      logger.error('User music upload error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Gets user's uploaded music tracks
   */
  async getUserMusicLibrary(userId: string): Promise<AudioTrack[]> {
    try {
      const userLibraryPath = path.join(this.userMusicPath, `${userId}_library.json`);
      
      if (fs.existsSync(userLibraryPath)) {
        return JSON.parse(fs.readFileSync(userLibraryPath, 'utf8'));
      }
      
      return [];
      
    } catch (error) {
      logger.error('Failed to load user music library:', error);
      return [];
    }
  }

  /**
   * Cleans up temporary files
   */
  cleanup(filePaths: string[]): void {
    filePaths.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          logger.info(`Cleaned up temporary file: ${filePath}`);
        } catch (error) {
          logger.error(`Failed to clean up file ${filePath}:`, error);
        }
      }
    });
  }
}

export const videoMusicService = new VideoMusicService();
