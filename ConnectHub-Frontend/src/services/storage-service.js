/**
 * LynkApp Storage Service - Phase 7
 * Firebase Storage File Uploads
 *
 * Phase 7 Features:
 *   7.1 Upload profile photo (with live progress callback)
 *   7.2 Upload post image (with live progress callback)
 *   7.3 Compress images before upload (saves bandwidth & storage)
 *   7.4 Upload progress bar support
 *   7.5 Delete uploaded files from Storage
 *   7.6 Send image message in DMs (integrates with Phase 6)
 *   7.7 Update profile avatar URL in Firestore after upload
 *
 * Firebase Storage paths:
 *   avatars/{userId}/profile.jpg       ← profile photo
 *   posts/{userId}/{timestamp}.jpg     ← post images
 *   messages/{conversationId}/{timestamp}.jpg  ← chat images
 *
 * Updated: Phase 7 - March 2026
 */

let storage, db;
let storageRef, uploadBytesResumable, getDownloadURL, deleteObject, ref;
let firestoreDoc, updateDoc;

class StorageService {
    constructor() {
        this.firebaseInitialized = false;
        this.initializeFirebase();

        // Compression defaults
        this.MAX_WIDTH        = 1200;   // Max image width (px)
        this.MAX_HEIGHT       = 1200;   // Max image height (px)
        this.QUALITY          = 0.82;   // JPEG quality (0-1)
        this.AVATAR_MAX_SIZE  = 500;    // Avatar max px
        this.AVATAR_QUALITY   = 0.85;
    }

    // ─────────────────────────────────────────────
    //  FIREBASE INIT
    // ─────────────────────────────────────────────

    async initializeFirebase() {
        try {
            const storageModule   = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js');
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
            const { getApps }     = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');

            const apps = getApps();
            if (apps.length === 0) {
                console.warn('⏳ StorageService: Firebase not ready, retrying...');
                setTimeout(() => this.initializeFirebase(), 1000);
                return;
            }

            storage = storageModule.getStorage(apps[0]);
            db      = firestoreModule.getFirestore(apps[0]);

            ref                  = storageModule.ref;
            uploadBytesResumable = storageModule.uploadBytesResumable;
            getDownloadURL       = storageModule.getDownloadURL;
            deleteObject         = storageModule.deleteObject;
            firestoreDoc         = firestoreModule.doc;
            updateDoc            = firestoreModule.updateDoc;

            this.firebaseInitialized = true;
            console.log('✅ StorageService: Firebase Storage ready');
        } catch (error) {
            console.error('❌ StorageService: Firebase init failed', error);
        }
    }

    async waitForFirebase() {
        let attempts = 0;
        while (!this.firebaseInitialized && attempts < 20) {
            await new Promise(r => setTimeout(r, 500));
            attempts++;
        }
        if (!this.firebaseInitialized) throw new Error('Firebase not available. Please refresh.');
    }

    _me() {
        const u = window.authService?.getCurrentUser();
        if (!u) throw new Error('You must be logged in');
        return u;
    }

    // ─────────────────────────────────────────────
    //  TASK 7.3 — IMAGE COMPRESSION (runs before upload)
    // ─────────────────────────────────────────────

    /**
     * Compress a File or Blob using a canvas element.
     * Returns a compressed Blob at JPEG quality.
     *
     * @param {File|Blob} file
     * @param {object}    [opts]
     * @param {number}    [opts.maxWidth=1200]
     * @param {number}    [opts.maxHeight=1200]
     * @param {number}    [opts.quality=0.82]  0.0 – 1.0
     * @returns {Promise<Blob>}
     */
    async compressImage(file, opts = {}) {
        const maxWidth  = opts.maxWidth  || this.MAX_WIDTH;
        const maxHeight = opts.maxHeight || this.MAX_HEIGHT;
        const quality   = opts.quality   || this.QUALITY;

        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);

                let { width, height } = img;

                // Scale down proportionally
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width  = Math.round(width  * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement('canvas');
                canvas.width  = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    blob => blob ? resolve(blob) : reject(new Error('Compression failed')),
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Could not load image'));
            };

            img.src = url;
        });
    }

    // ─────────────────────────────────────────────
    //  CORE UPLOAD HELPER (with progress)
    // ─────────────────────────────────────────────

    /**
     * Upload a blob to Firebase Storage with live progress callbacks.
     *
     * @param {string}   storagePath   e.g. "avatars/uid123/profile.jpg"
     * @param {Blob}     blob
     * @param {object}   [opts]
     * @param {Function} [opts.onProgress]  Called with (percent: number, bytesTransferred, totalBytes)
     * @param {string}   [opts.contentType] defaults to "image/jpeg"
     * @returns {Promise<{ success, downloadURL, storagePath }>}
     */
    _upload(storagePath, blob, opts = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.waitForFirebase();

                const fileRef  = ref(storage, storagePath);
                const metadata = { contentType: opts.contentType || 'image/jpeg' };
                const task     = uploadBytesResumable(fileRef, blob, metadata);

                // TASK 7.4 — Progress tracking
                task.on(
                    'state_changed',
                    (snapshot) => {
                        const percent = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                        if (opts.onProgress) {
                            opts.onProgress(percent, snapshot.bytesTransferred, snapshot.totalBytes);
                        }
                        window.dispatchEvent(new CustomEvent('upload:progress', {
                            detail: { storagePath, percent }
                        }));
                    },
                    (error) => {
                        console.error('❌ Upload failed:', error);
                        reject(error);
                    },
                    async () => {
                        // Upload complete — get the public download URL
                        const downloadURL = await getDownloadURL(task.snapshot.ref);
                        window.dispatchEvent(new CustomEvent('upload:complete', {
                            detail: { storagePath, downloadURL }
                        }));
                        resolve({ success: true, downloadURL, storagePath });
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    // ─────────────────────────────────────────────
    //  TASK 7.1 — UPLOAD PROFILE PHOTO
    // ─────────────────────────────────────────────

    /**
     * Upload a profile photo for the current user.
     * Compresses the image, uploads to Storage, then saves the URL to Firestore.
     *
     * @param {File}     file          Selected image file from <input type="file">
     * @param {Function} [onProgress]  Called with (percent: number)
     * @returns {{ success, downloadURL }}
     *
     * Usage:
     *   const input = document.querySelector('#avatar-input');
     *   input.addEventListener('change', async (e) => {
     *       const result = await storageService.uploadProfilePhoto(
     *           e.target.files[0],
     *           (pct) => progressBar.style.width = pct + '%'
     *       );
     *       if (result.success) {
     *           avatarImg.src = result.downloadURL;
     *       }
     *   });
     */
    async uploadProfilePhoto(file, onProgress) {
        try {
            await this.waitForFirebase();
            const me = this._me();

            // Validate file type
            if (!file.type.startsWith('image/')) {
                return { success: false, error: 'Please select an image file' };
            }

            // Compress the image
            const compressed = await this.compressImage(file, {
                maxWidth:  this.AVATAR_MAX_SIZE,
                maxHeight: this.AVATAR_MAX_SIZE,
                quality:   this.AVATAR_QUALITY
            });

            const sizeBefore = (file.size / 1024).toFixed(0);
            const sizeAfter  = (compressed.size / 1024).toFixed(0);
            console.log(`📷 Compressed: ${sizeBefore}KB → ${sizeAfter}KB`);

            // Upload to Storage
            const storagePath = `avatars/${me.userId}/profile.jpg`;
            const result = await this._upload(storagePath, compressed, { onProgress });

            // TASK 7.7 — Save URL to Firestore user profile
            await updateDoc(firestoreDoc(db, 'users', me.userId), {
                profilePicture: result.downloadURL,
                updatedAt:      new Date().toISOString()
            });

            window.dispatchEvent(new CustomEvent('profile:photoUpdated', {
                detail: { downloadURL: result.downloadURL }
            }));

            console.log('✅ Profile photo uploaded:', result.downloadURL);
            return { success: true, downloadURL: result.downloadURL };
        } catch (error) {
            console.error('❌ uploadProfilePhoto error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 7.2 — UPLOAD POST IMAGE
    // ─────────────────────────────────────────────

    /**
     * Upload an image for a new post.
     * Compresses, uploads, and returns the download URL.
     * Pass this URL to feedAPIService.createPost({ imageUrl: downloadURL }).
     *
     * @param {File}     file
     * @param {Function} [onProgress]  Called with (percent: number)
     * @returns {{ success, downloadURL }}
     *
     * Usage:
     *   const { success, downloadURL } = await storageService.uploadPostImage(file, pct => {
     *       document.querySelector('#upload-progress').style.width = pct + '%';
     *   });
     *   if (success) {
     *       await feedAPIService.createPost({ content: 'My post', imageUrl: downloadURL });
     *   }
     */
    async uploadPostImage(file, onProgress) {
        try {
            await this.waitForFirebase();
            const me = this._me();

            if (!file.type.startsWith('image/')) {
                return { success: false, error: 'Please select an image file' };
            }

            // Compress the image
            const compressed = await this.compressImage(file, {
                maxWidth:  this.MAX_WIDTH,
                maxHeight: this.MAX_HEIGHT,
                quality:   this.QUALITY
            });

            // Unique filename using timestamp
            const timestamp   = Date.now();
            const storagePath = `posts/${me.userId}/${timestamp}.jpg`;

            const result = await this._upload(storagePath, compressed, { onProgress });

            console.log('✅ Post image uploaded:', result.downloadURL);
            return { success: true, downloadURL: result.downloadURL, storagePath };
        } catch (error) {
            console.error('❌ uploadPostImage error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 7.6 — UPLOAD IMAGE MESSAGE (DMs)
    // ─────────────────────────────────────────────

    /**
     * Upload an image to send in a DM conversation.
     * Uploads the image, then calls messagingService.sendMessage() with type="image".
     *
     * @param {string}   conversationId
     * @param {File}     file
     * @param {Function} [onProgress]  Called with (percent: number)
     * @returns {{ success, messageId, downloadURL }}
     *
     * Usage:
     *   const result = await storageService.sendImageMessage(conversationId, file, pct => {
     *       uploadBar.style.width = pct + '%';
     *   });
     */
    async sendImageMessage(conversationId, file, onProgress) {
        try {
            await this.waitForFirebase();
            const me = this._me();

            if (!file.type.startsWith('image/')) {
                return { success: false, error: 'Please select an image file' };
            }

            // Compress image (smaller for messages)
            const compressed = await this.compressImage(file, {
                maxWidth:  800,
                maxHeight: 800,
                quality:   0.8
            });

            const timestamp   = Date.now();
            const storagePath = `messages/${conversationId}/${me.userId}_${timestamp}.jpg`;

            const uploadResult = await this._upload(storagePath, compressed, { onProgress });

            if (!uploadResult.success) {
                return { success: false, error: 'Upload failed' };
            }

            // Send the message via Phase 6 messaging service
            if (window.messagingService) {
                const msgResult = await window.messagingService.sendMessage(
                    conversationId,
                    uploadResult.downloadURL,
                    'image'
                );
                return {
                    success:     true,
                    messageId:   msgResult.messageId,
                    downloadURL: uploadResult.downloadURL
                };
            }

            return { success: true, downloadURL: uploadResult.downloadURL };
        } catch (error) {
            console.error('❌ sendImageMessage error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 7.5 — DELETE A FILE FROM STORAGE
    // ─────────────────────────────────────────────

    /**
     * Delete a file from Firebase Storage by its storage path.
     * Use this when a user deletes a post or replaces their avatar.
     *
     * @param {string} storagePath  e.g. "posts/uid123/1234567890.jpg"
     * @returns {{ success }}
     *
     * Usage:
     *   await storageService.deleteFile("posts/abc123/1709999999.jpg");
     */
    async deleteFile(storagePath) {
        try {
            await this.waitForFirebase();
            const fileRef = ref(storage, storagePath);
            await deleteObject(fileRef);
            console.log('✅ File deleted from Storage:', storagePath);
            return { success: true };
        } catch (error) {
            // "object-not-found" is not a critical error
            if (error.code === 'storage/object-not-found') {
                return { success: true }; // Already gone
            }
            console.error('❌ deleteFile error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  HELPER — VALIDATE FILE SIZE
    // ─────────────────────────────────────────────

    /**
     * Validate a file before upload.
     * Returns an error message if invalid, or null if OK.
     */
    validateImageFile(file, maxMB = 10) {
        if (!file) return 'No file selected';
        if (!file.type.startsWith('image/')) return 'File must be an image (JPG, PNG, GIF, WebP)';
        const maxBytes = maxMB * 1024 * 1024;
        if (file.size > maxBytes) return `File must be under ${maxMB}MB`;
        return null; // Valid
    }

    // ─────────────────────────────────────────────
    //  HELPER — GENERATE PREVIEW URL (before upload)
    // ─────────────────────────────────────────────

    /**
     * Create a local preview URL from a File object.
     * Shows the image immediately without waiting for upload.
     * Remember to call URL.revokeObjectURL(url) when done to free memory.
     *
     * @param {File} file
     * @returns {string} Object URL
     *
     * Usage:
     *   const previewUrl = storageService.createPreviewURL(file);
     *   document.querySelector('#preview-img').src = previewUrl;
     *   // After upload completes: URL.revokeObjectURL(previewUrl);
     */
    createPreviewURL(file) {
        return URL.createObjectURL(file);
    }

    /**
     * Get the original (uncompressed) image dimensions.
     */
    getImageDimensions(file) {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve({ width: img.naturalWidth, height: img.naturalHeight });
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve({ width: 0, height: 0 });
            };
            img.src = url;
        });
    }
}

// ── Singleton ─────────────────────────────────
const storageService = new StorageService();
window.storageService = storageService;

export default storageService;
