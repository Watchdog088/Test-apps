import { launchImageLibrary, launchCamera, MediaType } from 'react-native-image-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform, Alert, ActionSheetIOS } from 'react-native';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

class CameraService {
  constructor() {
    this.mediaOptions = {
      mediaType: 'mixed',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };
  }

  // Permission handling
  async requestCameraPermission() {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;
      
      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Camera permission error:', error);
      return false;
    }
  }

  async requestPhotoLibraryPermission() {
    try {
      const permission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      
      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Photo library permission error:', error);
      return false;
    }
  }

  // Media selection
  async selectMedia(options = {}) {
    const finalOptions = {
      ...this.mediaOptions,
      ...options,
    };

    return new Promise((resolve, reject) => {
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Camera', 'Photo Library'],
            cancelButtonIndex: 0,
          },
          async (buttonIndex) => {
            switch (buttonIndex) {
              case 1:
                this.openCamera(finalOptions, resolve, reject);
                break;
              case 2:
                this.openPhotoLibrary(finalOptions, resolve, reject);
                break;
              default:
                resolve(null);
                break;
            }
          }
        );
      } else {
        Alert.alert(
          'Select Media',
          'Choose an option',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
            { text: 'Camera', onPress: () => this.openCamera(finalOptions, resolve, reject) },
            { text: 'Gallery', onPress: () => this.openPhotoLibrary(finalOptions, resolve, reject) },
          ]
        );
      }
    });
  }

  async openCamera(options, resolve, reject) {
    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) {
      reject(new Error('Camera permission denied'));
      return;
    }

    launchCamera(options, (response) => {
      this.handleMediaResponse(response, resolve, reject);
    });
  }

  async openPhotoLibrary(options, resolve, reject) {
    const hasPermission = await this.requestPhotoLibraryPermission();
    if (!hasPermission) {
      reject(new Error('Photo library permission denied'));
      return;
    }

    launchImageLibrary(options, (response) => {
      this.handleMediaResponse(response, resolve, reject);
    });
  }

  handleMediaResponse(response, resolve, reject) {
    if (response.didCancel) {
      resolve(null);
    } else if (response.errorMessage) {
      reject(new Error(response.errorMessage));
    } else if (response.assets && response.assets.length > 0) {
      resolve(response.assets[0]);
    } else {
      resolve(null);
    }
  }

  // Image processing
  async resizeImage(imageUri, options = {}) {
    try {
      const {
        maxWidth = 1080,
        maxHeight = 1080,
        quality = 80,
        format = 'JPEG',
      } = options;

      const resizedImage = await ImageResizer.createResizedImage(
        imageUri,
        maxWidth,
        maxHeight,
        format,
        quality
      );

      return {
        uri: resizedImage.uri,
        width: resizedImage.width,
        height: resizedImage.height,
        size: resizedImage.size,
      };
    } catch (error) {
      console.error('Image resize error:', error);
      throw error;
    }
  }

  // Create thumbnail
  async createThumbnail(imageUri, size = 200) {
    return this.resizeImage(imageUri, {
      maxWidth: size,
      maxHeight: size,
      quality: 60,
    });
  }

  // Upload media to server
  async uploadMedia(mediaUri, type = 'image') {
    try {
      const formData = new FormData();
      
      // Get file info
      const fileInfo = await RNFS.stat(mediaUri);
      const fileName = mediaUri.split('/').pop();
      const fileExtension = fileName.split('.').pop().toLowerCase();
      
      // Determine MIME type
      let mimeType = 'application/octet-stream';
      if (type === 'image') {
        mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
      } else if (type === 'video') {
        mimeType = 'video/mp4';
      }

      formData.append('file', {
        uri: mediaUri,
        type: mimeType,
        name: fileName,
        size: fileInfo.size,
      });

      formData.append('type', type);

      const response = await fetch('http://localhost:5000/api/v1/upload/media', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Media upload error:', error);
      throw error;
    }
  }

  // Multiple image selection
  async selectMultipleImages(maxSelection = 5) {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      selectionLimit: maxSelection,
    };

    return new Promise((resolve, reject) => {
      launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          resolve([]);
        } else if (response.errorMessage) {
          reject(new Error(response.errorMessage));
        } else if (response.assets) {
          resolve(response.assets);
        } else {
          resolve([]);
        }
      });
    });
  }

  // Video recording
  async recordVideo(options = {}) {
    const videoOptions = {
      mediaType: 'video',
      includeBase64: false,
      durationLimit: options.durationLimit || 60, // 60 seconds max
      quality: options.quality || 'medium',
      ...options,
    };

    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    return new Promise((resolve, reject) => {
      launchCamera(videoOptions, (response) => {
        this.handleMediaResponse(response, resolve, reject);
      });
    });
  }

  // Save media to device
  async saveToGallery(mediaUri, type = 'image') {
    try {
      const CameraRoll = require('@react-native-camera-roll/camera-roll');
      
      const result = await CameraRoll.save(mediaUri, { type });
      return result;
    } catch (error) {
      console.error('Save to gallery error:', error);
      throw error;
    }
  }

  // Generate media preview
  async generatePreview(mediaUri, type = 'image') {
    if (type === 'image') {
      return this.createThumbnail(mediaUri, 300);
    } else if (type === 'video') {
      // For video, we would use a video thumbnail library
      // This is a placeholder implementation
      return {
        uri: mediaUri,
        width: 300,
        height: 300,
      };
    }
  }

  // Batch upload
  async uploadMultipleMedia(mediaItems, onProgress) {
    const results = [];
    
    for (let i = 0; i < mediaItems.length; i++) {
      const item = mediaItems[i];
      
      try {
        // Resize image if needed
        let processedUri = item.uri;
        if (item.type?.startsWith('image/')) {
          const resized = await this.resizeImage(item.uri);
          processedUri = resized.uri;
        }

        // Upload
        const result = await this.uploadMedia(processedUri, item.type?.startsWith('image/') ? 'image' : 'video');
        results.push(result);

        // Progress callback
        if (onProgress) {
          onProgress((i + 1) / mediaItems.length);
        }
      } catch (error) {
        console.error(`Upload failed for item ${i}:`, error);
        results.push({ error: error.message });
      }
    }

    return results;
  }

  // Media validation
  validateMedia(mediaItem) {
    const errors = [];
    
    // File size validation (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (mediaItem.fileSize && mediaItem.fileSize > maxSize) {
      errors.push('File size exceeds 10MB limit');
    }

    // Image dimension validation
    if (mediaItem.type?.startsWith('image/')) {
      if (mediaItem.width < 100 || mediaItem.height < 100) {
        errors.push('Image resolution too low (minimum 100x100)');
      }
    }

    // Video duration validation
    if (mediaItem.type?.startsWith('video/')) {
      if (mediaItem.duration && mediaItem.duration > 300) { // 5 minutes
        errors.push('Video duration exceeds 5 minutes');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Cleanup temporary files
  async cleanupTempFiles() {
    try {
      const tempDir = `${RNFS.TemporaryDirectoryPath}/react-native-image-resizer`;
      const exists = await RNFS.exists(tempDir);
      
      if (exists) {
        await RNFS.unlink(tempDir);
        console.log('Temp files cleaned up');
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  // Get media info
  async getMediaInfo(mediaUri) {
    try {
      const fileInfo = await RNFS.stat(mediaUri);
      return {
        size: fileInfo.size,
        modificationTime: fileInfo.mtime,
        isDirectory: fileInfo.isDirectory(),
        isFile: fileInfo.isFile(),
      };
    } catch (error) {
      console.error('Get media info error:', error);
      return null;
    }
  }
}

export default new CameraService();
