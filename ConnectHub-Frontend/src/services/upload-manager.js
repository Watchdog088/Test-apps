/**
 * ConnectHub Upload Manager
 * Handles file uploads with queue, progress tracking, and retry logic
 */

class UploadManager {
    constructor() {
        this.uploadQueue = [];
        this.activeUploads = new Map();
        this.maxConcurrentUploads = 3;
        this.maxRetries = 3;
        this.listeners = new Map();
    }

    /**
     * Add file to upload queue
     */
    async queueUpload(file, options = {}) {
        const uploadId = this.generateUploadId();
        
        const upload = {
            id: uploadId,
            file,
            type: options.type || 'general',
            metadata: options.metadata || {},
            status: 'pending',
            progress: 0,
            retries: 0,
            createdAt: Date.now()
        };

        this.uploadQueue.push(upload);
        
        // Save to IndexedDB for persistence
        if (window.offlineManager) {
            await window.offlineManager.saveData('pending-uploads', upload);
        }

        // Start processing queue
        this.processQueue();

        return uploadId;
    }

    /**
     * Process upload queue
     */
    async processQueue() {
        // Check if we can start more uploads
        if (this.activeUploads.size >= this.maxConcurrentUploads) {
            return;
        }

        // Get next pending upload
        const upload = this.uploadQueue.find(u => u.status === 'pending');
        if (!upload) {
            return;
        }

        // Start upload
        upload.status = 'uploading';
        this.activeUploads.set(upload.id, upload);
        this.emit('uploadStarted', upload);

        try {
            // Validate file
            this.validateFile(upload.file, upload.type);

            // Compress if needed
            const processedFile = await this.processFile(upload.file, upload.type);

            // Upload file
            const result = await this.uploadFile(processedFile, upload);

            // Mark as complete
            upload.status = 'complete';
            upload.result = result;
            upload.completedAt = Date.now();
            
            this.emit('uploadComplete', upload);

            // Remove from IndexedDB
            if (window.offlineManager) {
                await window.offlineManager.deleteData('pending-uploads', upload.id);
            }

        } catch (error) {
            console.error('Upload failed:', error);
            
            // Handle retry
            upload.retries++;
            
            if (upload.retries < this.maxRetries) {
                upload.status = 'pending';
                this.emit('uploadRetrying', upload);
                
                // Retry after delay
                setTimeout(() => this.processQueue(), 2000 * upload.retries);
            } else {
                upload.status = 'failed';
                upload.error = error.message;
                this.emit('uploadFailed', upload);
            }
        } finally {
            // Remove from active uploads
            this.activeUploads.delete(upload.id);
            
            // Process next in queue
            this.processQueue();
        }
    }

    /**
     * Validate file before upload
     */
    validateFile(file, type) {
        // Size limits (in bytes)
        const sizeLimits = {
            'image': 10 * 1024 * 1024, // 10MB
            'video': 100 * 1024 * 1024, // 100MB
            'audio': 20 * 1024 * 1024, // 20MB
            'document': 25 * 1024 * 1024, // 25MB
            'general': 50 * 1024 * 1024 // 50MB
        };

        const maxSize = sizeLimits[type] || sizeLimits['general'];

        if (file.size > maxSize) {
            throw new Error(`File too large. Maximum size is ${this.formatFileSize(maxSize)}`);
        }

        // Validate file type
        const allowedTypes = {
            'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            'video': ['video/mp4', 'video/webm', 'video/quicktime'],
            'audio': ['audio/mpeg', 'audio/wav', 'audio/ogg'],
            'document': ['application/pdf', 'application/msword', 'text/plain']
        };

        if (type !== 'general' && allowedTypes[type]) {
            if (!allowedTypes[type].includes(file.type)) {
                throw new Error(`Invalid file type. Allowed types: ${allowedTypes[type].join(', ')}`);
            }
        }
    }

    /**
     * Process file (compress, resize, etc.)
     */
    async processFile(file, type) {
        if (type === 'image') {
            return await this.compressImage(file);
        } else if (type === 'video') {
            // For videos, we might want to create a thumbnail
            // For now, just return the original file
            return file;
        }
        
        return file;
    }

    /**
     * Compress image
     */
    async compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Max dimensions
                    const maxWidth = 1920;
                    const maxHeight = 1920;

                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height = height * (maxWidth / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = width * (maxHeight / height);
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to blob
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        } else {
                            resolve(file);
                        }
                    }, 'image/jpeg', 0.85);
                };

                img.onerror = () => resolve(file);
                img.src = e.target.result;
            };

            reader.onerror = () => resolve(file);
            reader.readAsDataURL(file);
        });
    }

    /**
     * Upload file to server
     */
    async uploadFile(file, upload) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', upload.type);
            
            if (upload.metadata) {
                formData.append('metadata', JSON.stringify(upload.metadata));
            }

            const xhr = new XMLHttpRequest();

            // Track progress
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    upload.progress = Math.round((e.loaded / e.total) * 100);
                    this.emit('uploadProgress', upload);
                }
            });

            // Handle completion
            xhr.addEventListener('load', () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (error) {
                        resolve({ url: xhr.responseText });
                    }
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            });

            // Handle error
            xhr.addEventListener('error', () => {
                reject(new Error('Network error during upload'));
            });

            // Handle abort
            xhr.addEventListener('abort', () => {
                reject(new Error('Upload aborted'));
            });

            // Get API endpoint
            const apiService = window.apiService;
            const baseURL = apiService ? apiService.baseURL : 'http://localhost:3001/api/v1';
            const token = localStorage.getItem('connecthub_token');

            xhr.open('POST', `${baseURL}/upload`);
            
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            // Store XHR for cancellation
            upload.xhr = xhr;

            xhr.send(formData);
        });
    }

    /**
     * Cancel upload
     */
    cancelUpload(uploadId) {
        const upload = this.uploadQueue.find(u => u.id === uploadId) || 
                      this.activeUploads.get(uploadId);

        if (upload) {
            if (upload.xhr) {
                upload.xhr.abort();
            }
            
            upload.status = 'cancelled';
            this.emit('uploadCancelled', upload);
            
            // Remove from queue and active uploads
            this.uploadQueue = this.uploadQueue.filter(u => u.id !== uploadId);
            this.activeUploads.delete(uploadId);
        }
    }

    /**
     * Get upload status
     */
    getUploadStatus(uploadId) {
        return this.uploadQueue.find(u => u.id === uploadId) || 
               this.activeUploads.get(uploadId);
    }

    /**
     * Get all uploads
     */
    getAllUploads() {
        return [...this.uploadQueue, ...Array.from(this.activeUploads.values())];
    }

    /**
     * Clear completed uploads
     */
    clearCompleted() {
        this.uploadQueue = this.uploadQueue.filter(u => u.status !== 'complete');
    }

    /**
     * Retry failed upload
     */
    retryUpload(uploadId) {
        const upload = this.uploadQueue.find(u => u.id === uploadId);
        
        if (upload && upload.status === 'failed') {
            upload.status = 'pending';
            upload.retries = 0;
            upload.error = null;
            this.processQueue();
        }
    }

    /**
     * Generate unique upload ID
     */
    generateUploadId() {
        return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Event listener management
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            this.listeners.set(event, callbacks.filter(cb => cb !== callback));
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }

    /**
     * Batch upload multiple files
     */
    async batchUpload(files, options = {}) {
        const uploadIds = [];
        
        for (const file of files) {
            const uploadId = await this.queueUpload(file, options);
            uploadIds.push(uploadId);
        }
        
        return uploadIds;
    }

    /**
     * Get queue statistics
     */
    getStats() {
        const pending = this.uploadQueue.filter(u => u.status === 'pending').length;
        const uploading = this.activeUploads.size;
        const failed = this.uploadQueue.filter(u => u.status === 'failed').length;
        const completed = this.uploadQueue.filter(u => u.status === 'complete').length;

        return {
            pending,
            uploading,
            failed,
            completed,
            total: this.uploadQueue.length
        };
    }
}

// Create and export global instance
const uploadManager = new UploadManager();
window.uploadManager = uploadManager;

export default uploadManager;
