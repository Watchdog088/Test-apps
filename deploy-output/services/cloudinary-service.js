/**
 * LynkApp - Cloudinary Media Management Service
 * Professional image/video upload, optimization & transformation
 * FREE tier: 25 GB storage + 25 GB bandwidth/month
 */

class CloudinaryService {
    constructor() {
        this.cloudName = 'do6ue7mgf';
        this.apiKey = '919359489477421';
        this.uploadPreset = 'lynkapp_uploads'; // Create this in Cloudinary dashboard
        this.baseUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}`;
        
        // Statistics tracking
        this.stats = {
            totalUploads: 0,
            totalStorage: 0,
            totalBandwidth: 0,
            images: 0,
            videos: 0,
            lastUpload: null
        };
    }

    /**
     * Upload image/video to Cloudinary
     * @param {File} file - The file to upload
     * @param {Object} options - Upload options (folder, tags, etc.)
     */
    async uploadMedia(file, options = {}) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', this.uploadPreset);
            
            // Optional parameters
            if (options.folder) formData.append('folder', options.folder);
            if (options.tags) formData.append('tags', options.tags.join(','));
            if (options.publicId) formData.append('public_id', options.publicId);
            
            // Auto-detect resource type (image/video)
            const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
            const endpoint = `${this.baseUrl}/${resourceType}/upload`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Update stats
            this.stats.totalUploads++;
            this.stats.totalStorage += result.bytes;
            this.stats.lastUpload = new Date().toISOString();
            
            if (resourceType === 'image') {
                this.stats.images++;
            } else {
                this.stats.videos++;
            }
            
            this.saveStats();
            
            return {
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
                bytes: result.bytes,
                resourceType: result.resource_type,
                createdAt: result.created_at
            };
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get optimized image URL with transformations
     * @param {string} publicId - The public ID of the image
     * @param {Object} transformations - Transformation options
     */
    getOptimizedUrl(publicId, transformations = {}) {
        const {
            width = 800,
            height = 600,
            crop = 'fill',
            quality = 'auto',
            format = 'auto',
            gravity = 'auto'
        } = transformations;
        
        const transformStr = [
            `w_${width}`,
            `h_${height}`,
            `c_${crop}`,
            `q_${quality}`,
            `f_${format}`,
            `g_${gravity}`
        ].join(',');
        
        return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformStr}/${publicId}`;
    }

    /**
     * Get thumbnail URL
     * @param {string} publicId - The public ID of the image
     * @param {number} size - Thumbnail size (default: 200px)
     */
    getThumbnail(publicId, size = 200) {
        return this.getOptimizedUrl(publicId, {
            width: size,
            height: size,
            crop: 'thumb',
            gravity: 'face'
        });
    }

    /**
     * Get responsive image URLs for different screen sizes
     * @param {string} publicId - The public ID of the image
     */
    getResponsiveUrls(publicId) {
        return {
            mobile: this.getOptimizedUrl(publicId, { width: 480, height: 360 }),
            tablet: this.getOptimizedUrl(publicId, { width: 768, height: 576 }),
            desktop: this.getOptimizedUrl(publicId, { width: 1200, height: 900 }),
            hd: this.getOptimizedUrl(publicId, { width: 1920, height: 1080 })
        };
    }

    /**
     * Delete media from Cloudinary (requires backend API)
     * @param {string} publicId - The public ID to delete
     */
    async deleteMedia(publicId) {
        // This requires server-side implementation with API secret
        console.warn('Delete operation requires backend implementation');
        return {
            success: false,
            error: 'Delete requires backend API'
        };
    }

    /**
     * Get upload statistics
     */
    getStats() {
        return {
            ...this.stats,
            storageUsed: this.formatBytes(this.stats.totalStorage),
            bandwidthUsed: this.formatBytes(this.stats.totalBandwidth),
            storageLimit: '25 GB',
            bandwidthLimit: '25 GB/month',
            tier: 'FREE'
        };
    }

    /**
     * Save stats to localStorage
     */
    saveStats() {
        try {
            localStorage.setItem('cloudinary_stats', JSON.stringify(this.stats));
        } catch (error) {
            console.error('Failed to save Cloudinary stats:', error);
        }
    }

    /**
     * Load stats from localStorage
     */
    loadStats() {
        try {
            const saved = localStorage.getItem('cloudinary_stats');
            if (saved) {
                this.stats = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load Cloudinary stats:', error);
        }
    }

    /**
     * Format bytes to human-readable string
     * @param {number} bytes
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Test Cloudinary connection
     */
    async testConnection() {
        try {
            // Create a test 1x1 pixel image
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            const blob = await new Promise(resolve => canvas.toBlob(resolve));
            const file = new File([blob], 'test.png', { type: 'image/png' });
            
            const result = await this.uploadMedia(file, {
                folder: 'test',
                tags: ['test', 'connection']
            });
            
            return {
                success: result.success,
                message: result.success ? 'Cloudinary connected successfully!' : 'Connection failed',
                details: result
            };
        } catch (error) {
            return {
                success: false,
                message: 'Connection test failed',
                error: error.message
            };
        }
    }
}

// Create singleton instance
const cloudinaryService = new CloudinaryService();
cloudinaryService.loadStats();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = cloudinaryService;
}

console.log('✅ Cloudinary Service initialized - Cloud: do6ue7mgf');
