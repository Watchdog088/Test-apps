import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import sharp from 'sharp';
import logger from '../config/logger';

export interface WatermarkOptions {
  type: 'text' | 'image' | 'both';
  text?: {
    content: string;
    font: string;
    fontSize: number;
    color: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number; // 0.0 to 1.0
  };
  image?: {
    path: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    scale: number; // 0.1 to 1.0 (percentage of video width)
    opacity: number; // 0.0 to 1.0
  };
  brandLogo?: boolean; // ConnectHub/LynkDating branding
}

export interface VideoProcessingOptions {
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  resolution?: {
    width: number;
    height: number;
  };
  bitrate?: string; // e.g., '1000k', '2M'
  format?: 'mp4' | 'webm' | 'mov';
  maxDuration?: number; // seconds
  maxFileSize?: number; // bytes
}

class VideoWatermarkService {
  private readonly supportedFormats = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'];
  private readonly maxVideoSize = 500 * 1024 * 1024; // 500MB
  private readonly maxDuration = 300; // 5 minutes
  
  constructor() {
    // Set FFmpeg path if needed (adjust for your system)
    // ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
    // ffmpeg.setFfprobePath('/usr/bin/ffprobe');
  }

  /**
   * Validates video file before processing
   */
  async validateVideo(filePath: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Check file exists
      if (!fs.existsSync(filePath)) {
        errors.push('Video file not found');
        return { isValid: false, errors };
      }
      
      // Check file size
      const stats = fs.statSync(filePath);
      if (stats.size > this.maxVideoSize) {
        errors.push(`Video file too large. Max size: ${this.maxVideoSize / (1024 * 1024)}MB`);
      }
      
      // Check file extension
      const ext = path.extname(filePath).toLowerCase();
      if (!this.supportedFormats.includes(ext)) {
        errors.push(`Unsupported video format. Supported: ${this.supportedFormats.join(', ')}`);
      }
      
      // Get video metadata
      const metadata = await this.getVideoMetadata(filePath);
      
      // Check duration
      if (metadata.duration && metadata.duration > this.maxDuration) {
        errors.push(`Video too long. Max duration: ${this.maxDuration} seconds`);
      }
      
      return { isValid: errors.length === 0, errors };
      
    } catch (error) {
      logger.error('Video validation error:', error);
      errors.push('Failed to validate video file');
      return { isValid: false, errors };
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
   * Creates ConnectHub/LynkDating branded watermark image
   */
  async createBrandWatermark(outputPath: string, platform: 'connecthub' | 'lynkdating' = 'connecthub'): Promise<string> {
    const width = 200;
    const height = 60;
    
    // Create SVG watermark with branding
    const svgContent = platform === 'lynkdating' 
      ? `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:0.8" />
              <stop offset="100%" style="stop-color:#F59E0B;stop-opacity:0.8" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad)" rx="15" ry="15"/>
          <text x="20" y="25" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">💖 LynkDating</text>
          <text x="20" y="45" font-family="Arial, sans-serif" font-size="12" fill="white">Find your perfect connection</text>
        </svg>`
      : `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:0.8" />
              <stop offset="100%" style="stop-color:#F59E0B;stop-opacity:0.8" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad)" rx="15" ry="15"/>
          <text x="20" y="25" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">L💜nk CONNECT</text>
          <text x="20" y="45" font-family="Arial, sans-serif" font-size="12" fill="white">SHARE LOVE</text>
        </svg>`;
    
    // Convert SVG to PNG using Sharp
    const svgBuffer = Buffer.from(svgContent);
    await sharp(svgBuffer)
      .png()
      .toFile(outputPath);
    
    return outputPath;
  }

  /**
   * Applies watermark to video
   */
  async applyWatermark(
    inputPath: string,
    outputPath: string,
    watermarkOptions: WatermarkOptions,
    processingOptions: VideoProcessingOptions = {}
  ): Promise<{ success: boolean; outputPath?: string; metadata?: any; error?: string }> {
    try {
      // Validate input video
      const validation = await this.validateVideo(inputPath);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Get video metadata
      const metadata = await this.getVideoMetadata(inputPath);
      logger.info('Processing video:', { 
        duration: metadata.duration, 
        resolution: `${metadata.width}x${metadata.height}` 
      });

      // Create FFmpeg command
      let command = ffmpeg(inputPath);

      // Apply video processing options
      if (processingOptions.quality) {
        const qualitySettings = this.getQualitySettings(processingOptions.quality);
        command = command.videoCodec('libx264').audioCodec('aac');
        
        if (qualitySettings.bitrate) {
          command = command.videoBitrate(qualitySettings.bitrate);
        }
      }

      // Apply resolution if specified
      if (processingOptions.resolution) {
        command = command.size(`${processingOptions.resolution.width}x${processingOptions.resolution.height}`);
      }

      // Apply watermarks
      const filters: string[] = [];

      // Brand logo watermark
      if (watermarkOptions.brandLogo) {
        const brandWatermarkPath = path.join(path.dirname(outputPath), 'brand_watermark.png');
        await this.createBrandWatermark(brandWatermarkPath, 'connecthub');
        
        // Add brand watermark to bottom-right
        filters.push(`[0:v][1:v] overlay=W-w-10:H-h-10:enable='between(t,0,${metadata.duration})'`);
        command = command.input(brandWatermarkPath);
      }

      // Custom image watermark
      if (watermarkOptions.type === 'image' || watermarkOptions.type === 'both') {
        if (watermarkOptions.image?.path) {
          const position = this.getWatermarkPosition(
            watermarkOptions.image.position,
            metadata.width,
            metadata.height,
            watermarkOptions.image.scale || 0.1
          );
          
          const overlayFilter = `overlay=${position.x}:${position.y}:enable='between(t,0,${metadata.duration})'`;
          filters.push(overlayFilter);
          command = command.input(watermarkOptions.image.path);
        }
      }

      // Text watermark
      if (watermarkOptions.type === 'text' || watermarkOptions.type === 'both') {
        if (watermarkOptions.text?.content) {
          const textFilter = this.createTextFilter(watermarkOptions.text, metadata);
          filters.push(textFilter);
        }
      }

      // Apply filters
      if (filters.length > 0) {
        command = command.complexFilter(filters);
      }

      // Set output format
      const format = processingOptions.format || 'mp4';
      command = command.format(format);

      // Execute FFmpeg command
      return new Promise((resolve) => {
        command
          .on('start', (commandLine) => {
            logger.info('FFmpeg command started:', commandLine);
          })
          .on('progress', (progress) => {
            logger.debug('Processing progress:', progress);
          })
          .on('end', () => {
            logger.info('Video watermarking completed:', outputPath);
            resolve({ 
              success: true, 
              outputPath,
              metadata: {
                originalSize: metadata.size,
                processedSize: fs.statSync(outputPath).size,
                duration: metadata.duration,
                format
              }
            });
          })
          .on('error', (err) => {
            logger.error('FFmpeg error:', err);
            resolve({ success: false, error: err.message });
          })
          .save(outputPath);
      });

    } catch (error) {
      logger.error('Video watermarking error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Creates multiple platform-optimized versions
   */
  async createPlatformOptimizedVersions(
    inputPath: string,
    outputDir: string,
    watermarkOptions: WatermarkOptions
  ): Promise<{ 
    web?: string; 
    mobile?: string; 
    instagram?: string; 
    tiktok?: string; 
    youtube?: string; 
  }> {
    const results: any = {};
    const baseFilename = path.parse(inputPath).name;

    try {
      // Web version (1080p, moderate compression)
      const webPath = path.join(outputDir, `${baseFilename}_web.mp4`);
      const webResult = await this.applyWatermark(inputPath, webPath, watermarkOptions, {
        quality: 'high',
        resolution: { width: 1920, height: 1080 },
        format: 'mp4'
      });
      if (webResult.success) results.web = webPath;

      // Mobile version (720p, higher compression)
      const mobilePath = path.join(outputDir, `${baseFilename}_mobile.mp4`);
      const mobileResult = await this.applyWatermark(inputPath, mobilePath, watermarkOptions, {
        quality: 'medium',
        resolution: { width: 1280, height: 720 },
        format: 'mp4'
      });
      if (mobileResult.success) results.mobile = mobilePath;

      // Instagram version (square, 1080x1080)
      const instagramPath = path.join(outputDir, `${baseFilename}_instagram.mp4`);
      const instagramResult = await this.applyWatermark(inputPath, instagramPath, watermarkOptions, {
        quality: 'high',
        resolution: { width: 1080, height: 1080 },
        format: 'mp4'
      });
      if (instagramResult.success) results.instagram = instagramPath;

      // TikTok version (vertical, 1080x1920)
      const tiktokPath = path.join(outputDir, `${baseFilename}_tiktok.mp4`);
      const tiktokResult = await this.applyWatermark(inputPath, tiktokPath, watermarkOptions, {
        quality: 'high',
        resolution: { width: 1080, height: 1920 },
        format: 'mp4'
      });
      if (tiktokResult.success) results.tiktok = tiktokPath;

      // YouTube version (high quality, 4K ready)
      const youtubePath = path.join(outputDir, `${baseFilename}_youtube.mp4`);
      const youtubeResult = await this.applyWatermark(inputPath, youtubePath, watermarkOptions, {
        quality: 'ultra',
        resolution: { width: 3840, height: 2160 },
        format: 'mp4'
      });
      if (youtubeResult.success) results.youtube = youtubePath;

      return results;

    } catch (error) {
      logger.error('Platform optimization error:', error);
      return results;
    }
  }

  /**
   * Gets quality settings for different quality levels
   */
  private getQualitySettings(quality: string) {
    const settings = {
      low: { bitrate: '500k', crf: 28 },
      medium: { bitrate: '1M', crf: 23 },
      high: { bitrate: '2M', crf: 18 },
      ultra: { bitrate: '5M', crf: 15 }
    };
    return settings[quality] || settings.medium;
  }

  /**
   * Calculates watermark position
   */
  private getWatermarkPosition(position: string, videoWidth: number, videoHeight: number, scale: number) {
    const watermarkWidth = videoWidth * scale;
    const watermarkHeight = watermarkWidth * 0.3; // Assume 3:1 aspect ratio for watermark
    const margin = 20;

    switch (position) {
      case 'top-left':
        return { x: margin, y: margin };
      case 'top-right':
        return { x: videoWidth - watermarkWidth - margin, y: margin };
      case 'bottom-left':
        return { x: margin, y: videoHeight - watermarkHeight - margin };
      case 'bottom-right':
        return { x: videoWidth - watermarkWidth - margin, y: videoHeight - watermarkHeight - margin };
      case 'center':
        return { x: (videoWidth - watermarkWidth) / 2, y: (videoHeight - watermarkHeight) / 2 };
      default:
        return { x: videoWidth - watermarkWidth - margin, y: videoHeight - watermarkHeight - margin };
    }
  }

  /**
   * Creates text filter for FFmpeg
   */
  private createTextFilter(textOptions: WatermarkOptions['text'], metadata: any): string {
    const { content, fontSize = 24, color = 'white', position = 'bottom-right', opacity = 0.8 } = textOptions;
    
    // Calculate position
    let x, y;
    const margin = 20;
    
    switch (position) {
      case 'top-left':
        x = margin;
        y = margin + fontSize;
        break;
      case 'top-right':
        x = `w-text_w-${margin}`;
        y = margin + fontSize;
        break;
      case 'bottom-left':
        x = margin;
        y = `h-text_h-${margin}`;
        break;
      case 'bottom-right':
        x = `w-text_w-${margin}`;
        y = `h-text_h-${margin}`;
        break;
      case 'center':
        x = '(w-text_w)/2';
        y = '(h-text_h)/2';
        break;
      default:
        x = `w-text_w-${margin}`;
        y = `h-text_h-${margin}`;
    }

    return `drawtext=text='${content}':fontsize=${fontSize}:fontcolor=${color}@${opacity}:x=${x}:y=${y}:enable='between(t,0,${metadata.duration})'`;
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

export const videoWatermarkService = new VideoWatermarkService();
