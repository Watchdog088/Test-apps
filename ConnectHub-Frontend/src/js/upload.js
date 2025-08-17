// Enhanced Secure Upload Service with Display Location Options
class UploadService {
    constructor() {
        this.apiUrl = window.API_URL || 'http://localhost:3001/api';
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    }

    /**
     * Validate file before upload
     */
    validateFile(file) {
        const errors = [];
        
        if (!file) {
            errors.push('No file selected');
            return { isValid: false, errors };
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            errors.push('File size must be less than 50MB');
        }

        // Check file type
        if (!this.allowedTypes.includes(file.type.toLowerCase())) {
            errors.push('Only JPEG, PNG, WebP, and HEIC formats are allowed');
        }

        // Check filename
        const filename = file.name.toLowerCase();
        const dangerousPatterns = [
            /\.php$/i, /\.exe$/i, /\.bat$/i, /\.sh$/i, /\.js$/i, /\.html$/i, /\.htm$/i
        ];
        
        const hasDangerousPattern = dangerousPatterns.some(pattern => pattern.test(filename));
        if (hasDangerousPattern) {
            errors.push('Invalid file type detected');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Upload profile photo with display location options
     */
    async uploadProfilePhoto(file, displayLocation = 'profile') {
        const validation = this.validateFile(file);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        const formData = new FormData();
        formData.append('profilePhoto', file);
        formData.append('displayLocation', displayLocation);

        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${this.apiUrl}/upload/profile-photo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Upload failed');
        }

        return result.data;
    }

    /**
     * Upload multiple dating photos
     */
    async uploadDatingPhotos(files) {
        if (!files || files.length === 0) {
            throw new Error('No files selected');
        }

        if (files.length > 6) {
            throw new Error('Maximum 6 photos allowed for dating profile');
        }

        // Validate all files
        for (const file of files) {
            const validation = this.validateFile(file);
            if (!validation.isValid) {
                throw new Error(`File ${file.name}: ${validation.errors.join(', ')}`);
            }
        }

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('photos', files[i]);
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${this.apiUrl}/upload/dating-photos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Upload failed');
        }

        return result.data;
    }

    /**
     * Upload post media
     */
    async uploadPostMedia(files) {
        if (!files || files.length === 0) {
            throw new Error('No files selected');
        }

        if (files.length > 10) {
            throw new Error('Maximum 10 media files allowed per post');
        }

        // Validate all files
        for (const file of files) {
            const validation = this.validateFile(file);
            if (!validation.isValid) {
                throw new Error(`File ${file.name}: ${validation.errors.join(', ')}`);
            }
        }

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('media', files[i]);
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${this.apiUrl}/upload/post-media`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Upload failed');
        }

        return result.data;
    }

    /**
     * Get user's uploaded files
     */
    async getMyFiles() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${this.apiUrl}/upload/my-files`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to get files');
        }

        return result.data;
    }

    /**
     * Delete uploaded file
     */
    async deleteFile(filename) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${this.apiUrl}/upload/file/${filename}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to delete file');
        }

        return result;
    }

    /**
     * Create upload progress handler
     */
    createProgressHandler(progressCallback) {
        return (progressEvent) => {
            if (progressEvent.lengthComputable) {
                const percentComplete = (progressEvent.loaded / progressEvent.total) * 100;
                progressCallback(Math.round(percentComplete));
            }
        };
    }

    /**
     * Create image preview
     */
    createImagePreview(file, callback) {
        if (!file || !file.type.startsWith('image/')) {
            callback(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => callback(e.target.result);
        reader.readAsDataURL(file);
    }

    /**
     * Compress image before upload (client-side)
     */
    async compressImage(file, maxWidth = 2048, maxHeight = 2048, quality = 0.9) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    }));
                }, 'image/jpeg', quality);
            };

            img.src = URL.createObjectURL(file);
        });
    }
}

// Enhanced Upload UI Components
class UploadUI {
    constructor() {
        this.uploadService = new UploadService();
        this.init();
    }

    init() {
        this.createUploadModal();
        this.attachEventListeners();
    }

    createUploadModal() {
        const modal = document.createElement('div');
        modal.id = 'uploadModal';
        modal.className = 'upload-modal';
        modal.innerHTML = `
            <div class="upload-modal-content">
                <div class="upload-modal-header">
                    <h3>Upload Photo</h3>
                    <button class="upload-modal-close">&times;</button>
                </div>
                <div class="upload-modal-body">
                    <div class="upload-options">
                        <h4>Where would you like to display this photo?</h4>
                        <div class="display-location-options">
                            <label>
                                <input type="radio" name="displayLocation" value="profile" checked>
                                <span>Profile Only</span>
                            </label>
                            <label>
                                <input type="radio" name="displayLocation" value="dating">
                                <span>Dating Profile Only</span>
                            </label>
                            <label>
                                <input type="radio" name="displayLocation" value="both">
                                <span>Both Profile & Dating</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="upload-dropzone" id="uploadDropzone">
                        <div class="upload-dropzone-content">
                            <i class="upload-icon">📸</i>
                            <p>Drag & drop your high-resolution photo here</p>
                            <p class="upload-size-info">Support: JPEG, PNG, WebP, HEIC up to 50MB</p>
                            <button type="button" class="btn btn-primary" id="selectFileBtn">
                                Select Photo
                            </button>
                            <input type="file" id="fileInput" accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif" style="display: none;">
                        </div>
                    </div>

                    <div class="upload-preview" id="uploadPreview" style="display: none;">
                        <img id="previewImage" alt="Preview">
                        <div class="upload-info">
                            <p id="fileInfo"></p>
                            <div class="upload-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="progressFill"></div>
                                </div>
                                <span class="progress-text" id="progressText">0%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="upload-modal-footer">
                    <button type="button" class="btn btn-secondary" id="cancelUpload">Cancel</button>
                    <button type="button" class="btn btn-primary" id="startUpload" disabled>
                        Upload Photo
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    attachEventListeners() {
        // Modal controls
        const modal = document.getElementById('uploadModal');
        const closeBtn = modal.querySelector('.upload-modal-close');
        const cancelBtn = document.getElementById('cancelUpload');
        const selectFileBtn = document.getElementById('selectFileBtn');
        const fileInput = document.getElementById('fileInput');
        const startUploadBtn = document.getElementById('startUpload');
        const dropzone = document.getElementById('uploadDropzone');

        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        selectFileBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));
        startUploadBtn.addEventListener('click', () => this.startUpload());

        // Drag and drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        });

        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
    }

    openModal() {
        document.getElementById('uploadModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('uploadModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.resetModal();
    }

    resetModal() {
        document.getElementById('fileInput').value = '';
        document.getElementById('uploadPreview').style.display = 'none';
        document.getElementById('uploadDropzone').style.display = 'block';
        document.getElementById('startUpload').disabled = true;
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('progressText').textContent = '0%';
    }

    handleFileSelect(file) {
        if (!file) return;

        const validation = this.uploadService.validateFile(file);
        if (!validation.isValid) {
            this.showError(validation.errors.join(', '));
            return;
        }

        this.selectedFile = file;
        this.showPreview(file);
        document.getElementById('startUpload').disabled = false;
    }

    showPreview(file) {
        this.uploadService.createImagePreview(file, (src) => {
            if (src) {
                const preview = document.getElementById('uploadPreview');
                const previewImage = document.getElementById('previewImage');
                const fileInfo = document.getElementById('fileInfo');

                previewImage.src = src;
                fileInfo.textContent = `${file.name} (${this.formatFileSize(file.size)})`;
                
                document.getElementById('uploadDropzone').style.display = 'none';
                preview.style.display = 'block';
            }
        });
    }

    async startUpload() {
        if (!this.selectedFile) return;

        const displayLocation = document.querySelector('input[name="displayLocation"]:checked').value;
        const startUploadBtn = document.getElementById('startUpload');
        
        startUploadBtn.disabled = true;
        startUploadBtn.textContent = 'Uploading...';

        try {
            // Show progress
            this.updateProgress(0);
            
            // Compress image if it's very large
            let fileToUpload = this.selectedFile;
            if (this.selectedFile.size > 10 * 1024 * 1024) { // 10MB
                this.updateProgress(10);
                fileToUpload = await this.uploadService.compressImage(this.selectedFile);
            }

            this.updateProgress(20);

            const result = await this.uploadService.uploadProfilePhoto(fileToUpload, displayLocation);
            
            this.updateProgress(100);
            this.showSuccess('Photo uploaded successfully!');
            
            // Update UI with new photo
            if (result.url) {
                this.updateProfilePhoto(result.url, displayLocation);
            }

            setTimeout(() => {
                this.closeModal();
            }, 1500);

        } catch (error) {
            this.showError(error.message);
            startUploadBtn.disabled = false;
            startUploadBtn.textContent = 'Upload Photo';
        }
    }

    updateProgress(percent) {
        document.getElementById('progressFill').style.width = `${percent}%`;
        document.getElementById('progressText').textContent = `${percent}%`;
    }

    updateProfilePhoto(url, displayLocation) {
        // Update profile photo in current page
        const profileImages = document.querySelectorAll('.profile-photo, .user-avatar');
        profileImages.forEach(img => {
            if (displayLocation === 'profile' || displayLocation === 'both') {
                img.src = url;
            }
        });

        // Update dating profile photos if applicable
        if (displayLocation === 'dating' || displayLocation === 'both') {
            const datingImages = document.querySelectorAll('.dating-profile-photo');
            if (datingImages.length > 0) {
                datingImages[0].src = url;
            }
        }
    }

    showError(message) {
        // You can implement a toast notification system here
        alert('Error: ' + message);
    }

    showSuccess(message) {
        // You can implement a toast notification system here
        console.log('Success: ' + message);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// CSS Styles for Upload UI
const uploadStyles = `
.upload-modal {
    display: none;
    position: fixed;
    z-index: 10000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    align-items: center;
    justify-content: center;
}

.upload-modal-content {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 15px;
    padding: 0;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.upload-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
}

.upload-modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
}

.upload-modal-close {
    background: none;
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.3s;
}

.upload-modal-close:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.upload-modal-body {
    padding: 20px;
    color: white;
}

.upload-options {
    margin-bottom: 20px;
}

.display-location-options {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    margin-top: 10px;
}

.display-location-options label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 10px 15px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 10px;
    transition: all 0.3s;
}

.display-location-options label:hover {
    border-color: rgba(255, 255, 255, 0.6);
    background-color: rgba(255, 255, 255, 0.1);
}

.display-location-options input[type="radio"]:checked + span {
    font-weight: bold;
}

.display-location-options input[type="radio"]:checked ~ * {
    border-color: #00f5ff;
    background-color: rgba(0, 245, 255, 0.2);
}

.upload-dropzone {
    border: 2px dashed rgba(255, 255, 255, 0.4);
    border-radius: 15px;
    padding: 40px;
    text-align: center;
    transition: all 0.3s;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.upload-dropzone.drag-over {
    border-color: #00f5ff;
    background-color: rgba(0, 245, 255, 0.1);
}

.upload-dropzone-content .upload-icon {
    font-size: 3rem;
    margin-bottom: 15px;
    display: block;
}

.upload-size-info {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 20px;
}

.upload-preview {
    text-align: center;
}

.upload-preview img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 10px;
    margin-bottom: 15px;
}

.upload-info {
    background: rgba(255, 255, 255, 0.1);
    padding: 15px;
    border-radius: 10px;
}

.upload-progress {
    margin-top: 15px;
}

.progress-bar {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    height: 6px;
    overflow: hidden;
    margin-bottom: 5px;
}

.progress-fill {
    background: linear-gradient(90deg, #00f5ff, #ff00ff);
    height: 100%;
    width: 0%;
    transition: width 0.3s;
}

.progress-text {
    font-size: 0.9rem;
    opacity: 0.9;
}

.upload-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
    .upload-modal-content {
        width: 95%;
        margin: 20px;
    }
    
    .display-location-options {
        flex-direction: column;
    }
    
    .upload-dropzone {
        padding: 20px;
        min-height: 150px;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = uploadStyles;
document.head.appendChild(styleSheet);

// Initialize upload system
const uploadUI = new UploadUI();

// Global functions to open upload modal
window.openUploadModal = () => {
    uploadUI.openModal();
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UploadService, UploadUI };
}
