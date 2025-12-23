/**
 * AWS S3 Blob Storage Service
 * Object Storage for: Images, Videos, Audio files, Documents
 * Provides scalable, durable file storage with CDN integration
 */

import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

interface UploadOptions {
  folder?: string;
  makePublic?: boolean;
  generateThumbnail?: boolean;
  compress?: boolean;
}

interface UploadResult {
  key: string;
  url: string;
  cloudFrontUrl?: string;
  thumbnailUrl?: string;
  fileSize: number;
  mimeType: string;
}

class S3StorageService {
  private s3: AWS.S3;
  private bucket: string;
  private cloudFrontDomain?: string;
  private static instance: S3StorageService;

  private constructor() {
    // Initialize AWS S3
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });

    this.s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      signatureVersion: 'v4'
    });

    this.bucket = process.env.AWS_S3_BUCKET || 'connecthub-media';
    this.cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;

    console.log('✓ AWS S3 Storage Service initialized');
  }

  public static getInstance(): S3StorageService {
    if (!S3StorageService.instance) {
      S3StorageService.instance = new S3StorageService();
    }
    return S3StorageService.instance;
  }

  // ============================================================================
  // FILE UPLOAD OPERATIONS
  // ============================================================================

  /**
   * Upload file to S3
   */
  public async uploadFile(
    file: Buffer,
    originalName: string,
    mimeType: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const fileExtension = originalName.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const folder = options.folder || 'uploads';
    const key = `${folder}/${fileName}`;

    let fileToUpload = file;
    let finalSize = file.length;

    // Compress images if requested
    if (options.compress && mimeType.startsWith('image/')) {
      fileToUpload = await this.compressImage(file);
      finalSize = fileToUpload.length;
    }

    // Upload main file
    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: this.bucket,
      Key: key,
      Body: fileToUpload,
      ContentType: mimeType,
      ACL: options.makePublic ? 'public-read' : 'private',
      Metadata: {
        originalName: originalName,
        uploadedAt: new Date().toISOString()
      }
    };

    await this.s3.upload(uploadParams).promise();

    const url = `https://${this.bucket}.s3.amazonaws.com/${key}`;
    const cloudFrontUrl = this.cloudFrontDomain 
      ? `https://${this.cloudFrontDomain}/${key}` 
      : undefined;

    const result: UploadResult = {
      key,
      url,
      cloudFrontUrl,
      fileSize: finalSize,
      mimeType
    };

    // Generate thumbnail for images/videos if requested
    if (options.generateThumbnail && (mimeType.startsWith('image/') || mimeType.startsWith('video/'))) {
      const thumbnailKey = await this.generateThumbnail(file, mimeType, folder);
      result.thumbnailUrl = this.cloudFrontDomain
        ? `https://${this.cloudFrontDomain}/${thumbnailKey}`
        : `https://${this.bucket}.s3.amazonaws.com/${thumbnailKey}`;
    }

    return result;
  }

  /**
   * Upload multiple files
   */
  public async uploadMultipleFiles(
    files: Array<{ buffer: Buffer; originalName: string; mimeType: string }>,
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const uploads = files.map(file => 
      this.uploadFile(file.buffer, file.originalName, file.mimeType, options)
    );
    
    return await Promise.all(uploads);
  }

  // ============================================================================
  // IMAGE PROCESSING
  // ============================================================================

  /**
   * Compress image using Sharp
   */
  private async compressImage(buffer: Buffer): Promise<Buffer> {
    return await sharp(buffer)
      .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toBuffer();
  }

  /**
   * Generate thumbnail
   */
  private async generateThumbnail(buffer: Buffer, mimeType: string, folder: string): Promise<string> {
    if (!mimeType.startsWith('image/')) {
      // For videos, we'd use a video processing library
      // For now, return a placeholder
      return `${folder}/thumbnails/video-placeholder.jpg`;
    }

    const thumbnailBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    const thumbnailKey = `${folder}/thumbnails/${uuidv4()}.jpg`;

    await this.s3.upload({
      Bucket: this.bucket,
      Key: thumbnailKey,
      Body: thumbnailBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    }).promise();

    return thumbnailKey;
  }

  // ============================================================================
  // FILE OPERATIONS
  // ============================================================================

  /**
   * Get file from S3
   */
  public async getFile(key: string): Promise<Buffer> {
    const params: AWS.S3.GetObjectRequest = {
      Bucket: this.bucket,
      Key: key
    };

    const data = await this.s3.getObject(params).promise();
    return data.Body as Buffer;
  }

  /**
   * Delete file from S3
   */
  public async deleteFile(key: string): Promise<void> {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: this.bucket,
      Key: key
    };

    await this.s3.deleteObject(params).promise();
  }

  /**
   * Delete multiple files
   */
  public async deleteMultipleFiles(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    const params: AWS.S3.DeleteObjectsRequest = {
      Bucket: this.bucket,
      Delete: {
        Objects: keys.map(key => ({ Key: key }))
      }
    };

    await this.s3.deleteObjects(params).promise();
  }

  /**
   * Get signed URL for temporary access
   */
  public getSignedUrl(key: string, expiresInSeconds: number = 3600): string {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresInSeconds
    };

    return this.s3.getSignedUrl('getObject', params);
  }

  /**
   * Get signed URL for upload
   */
  public getSignedUploadUrl(key: string, mimeType: string, expiresInSeconds: number = 300): string {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresInSeconds,
      ContentType: mimeType,
      ACL: 'public-read'
    };

    return this.s3.getSignedUrl('putObject', params);
  }

  /**
   * Check if file exists
   */
  public async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3.headObject({
        Bucket: this.bucket,
        Key: key
      }).promise();
      return true;
    } catch (error: any) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  public async getFileMetadata(key: string): Promise<AWS.S3.HeadObjectOutput> {
    const params = {
      Bucket: this.bucket,
      Key: key
    };

    return await this.s3.headObject(params).promise();
  }

  /**
   * Copy file within S3
   */
  public async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    const params: AWS.S3.CopyObjectRequest = {
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${sourceKey}`,
      Key: destinationKey
    };

    await this.s3.copyObject(params).promise();
  }

  /**
   * Move file (copy then delete source)
   */
  public async moveFile(sourceKey: string, destinationKey: string): Promise<void> {
    await this.copyFile(sourceKey, destinationKey);
    await this.deleteFile(sourceKey);
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  /**
   * List files in folder
   */
  public async listFiles(folder: string, maxKeys: number = 1000): Promise<string[]> {
    const params: AWS.S3.ListObjectsV2Request = {
      Bucket: this.bucket,
      Prefix: folder,
      MaxKeys: maxKeys
    };

    const data = await this.s3.listObjectsV2(params).promise();
    return data.Contents?.map(item => item.Key!).filter(Boolean) || [];
  }

  /**
   * Get total storage used by user
   */
  public async getUserStorageUsed(userId: string): Promise<number> {
    const files = await this.listFiles(`users/${userId}`);
    let totalSize = 0;

    for (const key of files) {
      const metadata = await this.getFileMetadata(key);
      totalSize += metadata.ContentLength || 0;
    }

    return totalSize;
  }

  /**
   * Clean up expired files
   */
  public async cleanupExpiredFiles(folder: string, olderThanDays: number): Promise<number> {
    const files = await this.listFiles(folder);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const filesToDelete: string[] = [];

    for (const key of files) {
      const metadata = await this.getFileMetadata(key);
      if (metadata.LastModified && metadata.LastModified < cutoffDate) {
        filesToDelete.push(key);
      }
    }

    if (filesToDelete.length > 0) {
      await this.deleteMultipleFiles(filesToDelete);
    }

    return filesToDelete.length;
  }

  // ============================================================================
  // SPECIALIZED UPLOADS
  // ============================================================================

  /**
   * Upload user avatar
   */
  public async uploadAvatar(userId: string, buffer: Buffer, mimeType: string): Promise<UploadResult> {
    // Resize and compress avatar
    const processedBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    return await this.uploadFile(
      processedBuffer,
      `avatar-${userId}.jpg`,
      'image/jpeg',
      {
        folder: `users/${userId}/avatar`,
        makePublic: true,
        compress: false // Already compressed
      }
    );
  }

  /**
   * Upload post media
   */
  public async uploadPostMedia(userId: string, buffer: Buffer, originalName: string, mimeType: string): Promise<UploadResult> {
    return await this.uploadFile(
      buffer,
      originalName,
      mimeType,
      {
        folder: `users/${userId}/posts`,
        makePublic: true,
        generateThumbnail: true,
        compress: mimeType.startsWith('image/')
      }
    );
  }

  /**
   * Upload story media
   */
  public async uploadStoryMedia(userId: string, buffer: Buffer, originalName: string, mimeType: string): Promise<UploadResult> {
    return await this.uploadFile(
      buffer,
      originalName,
      mimeType,
      {
        folder: `users/${userId}/stories`,
        makePublic: true,
        generateThumbnail: true,
        compress: true
      }
    );
  }

  /**
   * Upload video with multiple quality versions
   */
  public async uploadVideoWithQualities(
    userId: string,
    buffer: Buffer,
    originalName: string
  ): Promise<{
    original: UploadResult;
    qualities: Map<string, UploadResult>;
  }> {
    // Upload original
    const original = await this.uploadFile(
      buffer,
      originalName,
      'video/mp4',
      {
        folder: `users/${userId}/videos`,
        makePublic: true,
        generateThumbnail: true
      }
    );

    // In production, you'd use AWS MediaConvert or similar
    // to generate multiple quality versions (1080p, 720p, 480p, 360p)
    const qualities = new Map<string, UploadResult>();
    
    // Placeholder for quality versions
    qualities.set('1080p', original);

    return { original, qualities };
  }
}

export default S3StorageService.getInstance();
