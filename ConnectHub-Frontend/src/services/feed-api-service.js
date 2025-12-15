/**
 * Feed/Posts API Service
 * Complete backend integration for Feed system
 * Includes: API endpoints, Firebase Storage, compression, pagination, real-time updates
 */

import firebaseService from './firebase-service.js';
import apiService from './api-service.js';

class FeedAPIService {
    constructor() {
        this.postsCache = new Map();
        this.realtimeListeners = new Map();
        this.compressionQuality = 0.8;
        this.maxImageSize = 1920; // Max width/height
        this.pagination = {
            currentPage: 1,
            postsPerPage: 10,
            hasMore: true
        };
    }

    // ========== POST CREATION WITH API & STORAGE ==========

    /**
     * Create new post with media upload
     */
    async createPost(postData) {
        try {
            // 1. Upload media files if present
            const uploadedMedia = {
                photos: [],
                videos: []
            };

            if (postData.photos && postData.photos.length > 0) {
                uploadedMedia.photos = await this.uploadPhotos(postData.photos);
            }

            if (postData.videos && postData.videos.length > 0) {
                uploadedMedia.videos = await this.uploadVideos(postData.videos);
            }

            // 2. Create post object
            const post = {
                userId: postData.userId || 'current_user',
                author: postData.author || 'Current User',
                authorAvatar: postData.authorAvatar || '👤',
                content: postData.content || '',
                photos: uploadedMedia.photos,
                videos: uploadedMedia.videos,
                location: postData.location || null,
                taggedFriends: postData.taggedFriends || [],
                feeling: postData.feeling || null,
                privacy: postData.privacy || 'public',
                timestamp: Date.now(),
                likes: 0,
                comments: [],
                shares: 0,
                views: 0,
                reactions: {
                    like: 0,
                    love: 0,
                    haha: 0,
                    wow: 0,
                    sad: 0,
                    angry: 0
                },
                gif: postData.gif || null,
                poll: postData.poll || null,
                background: postData.background || null,
                hashtags: this.extractHashtags(postData.content),
                mentions: this.extractMentions(postData.content),
                linkPreview: await this.generateLinkPreview(postData.content),
                analytics: {
                    reach: 0,
                    engagement: 0,
                    clicks: 0,
                    saves: 0,
                    shares: 0
                },
                isEdited: false,
                isPinned: false,
                isSaved: false,
                isArchived: false
            };

            // 3. Save to backend
            const savedPost = await this.savePostToBackend(post);

            // 4. Update local cache
            this.postsCache.set(savedPost.id, savedPost);

            // 5. Trigger real-time update
            this.notifyPostCreated(savedPost);

            return savedPost;

        } catch (error) {
            console.error('Error creating post:', error);
            throw new Error(`Failed to create post: ${error.message}`);
        }
    }

    /**
     * Upload and compress photos
     */
    async uploadPhotos(photos) {
        const uploadedPhotos = [];

        for (const photo of photos) {
            try {
                // 1. Compress image
                const compressedBlob = await this.compressImage(photo);

                // 2. Upload to Firebase Storage
                const url = await this.uploadToFirebaseStorage(compressedBlob, 'photos');

                // 3. Generate thumbnail
                const thumbnailUrl = await this.generateThumbnail(compressedBlob);

                uploadedPhotos.push({
                    url: url,
                    thumbnail: thumbnailUrl,
                    width: null,
                    height: null,
                    size: compressedBlob.size,
                    uploadedAt: Date.now()
                });

            } catch (error) {
                console.error('Error uploading photo:', error);
                throw error;
            }
        }

        return uploadedPhotos;
    }

    /**
     * Compress image using canvas
     */
    async compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    // Calculate new dimensions
                    let width = img.width;
                    let height = img.height;

                    if (width > this.maxImageSize || height > this.maxImageSize) {
                        if (width > height) {
                            height = (height / width) * this.maxImageSize;
                            width = this.maxImageSize;
                        } else {
                            width = (width / height) * this.maxImageSize;
                            height = this.maxImageSize;
                        }
                    }

                    // Create canvas and compress
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(new Error('Failed to compress image'));
                            }
                        },
                        'image/jpeg',
                        this.compressionQuality
                    );
                };

                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Generate thumbnail
     */
    async generateThumbnail(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const thumbnailSize = 300;

                    canvas.width = thumbnailSize;
                    canvas.height = thumbnailSize;

                    const ctx = canvas.getContext('2d');
                    const scale = Math.min(thumbnailSize / img.width, thumbnailSize / img.height);
                    const x = (thumbnailSize - img.width * scale) / 2;
                    const y = (thumbnailSize - img.height * scale) / 2;

                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                    canvas.toBlob(
                        async (thumbnailBlob) => {
                            if (thumbnailBlob) {
                                const url = await this.uploadToFirebaseStorage(thumbnailBlob, 'thumbnails');
                                resolve(url);
                            } else {
                                reject(new Error('Failed to generate thumbnail'));
                            }
                        },
                        'image/jpeg',
                        0.7
                    );
                };

                img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('Failed to read blob'));
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Upload to Firebase Storage
     */
    async uploadToFirebaseStorage(blob, folder = 'posts') {
        try {
            // If using Firebase
            if (!firebaseService.mockMode && firebaseService.storage) {
                const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
                const storageRef = firebaseService.storage.ref(filename);
                
                const snapshot = await storageRef.put(blob);
                const downloadURL = await snapshot.ref.getDownloadURL();
                
                return downloadURL;
            }

            // Mock mode - convert to base64 data URL
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });

        } catch (error) {
            console.error('Error uploading to Firebase Storage:', error);
            throw error;
        }
    }

    /**
     * Upload videos
     */
    async uploadVideos(videos) {
        const uploadedVideos = [];

        for (const video of videos) {
            try {
                // Upload video file
                const url = await this.uploadToFirebaseStorage(video, 'videos');

                // Generate video thumbnail
                const thumbnailUrl = await this.generateVideoThumbnail(video);

                uploadedVideos.push({
                    url: url,
                    thumbnail: thumbnailUrl,
                    duration: 0,
                    size: video.size,
                    uploadedAt: Date.now()
                });

            } catch (error) {
                console.error('Error uploading video:', error);
                throw error;
            }
        }

        return uploadedVideos;
    }

    /**
     * Generate video thumbnail
     */
    async generateVideoThumbnail(videoFile) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = () => {
                video.currentTime = 1; // Capture at 1 second
            };

            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(
                    async (blob) => {
                        if (blob) {
                            const url = await this.uploadToFirebaseStorage(blob, 'video-thumbnails');
                            resolve(url);
                        } else {
                            resolve(null);
                        }
                    },
                    'image/jpeg',
                    0.8
                );
            };

            video.src = URL.createObjectURL(videoFile);
        });
    }

    // ========== POST RETRIEVAL WITH PAGINATION ==========

    /**
     * Get feed posts with pagination
     */
    async getFeedPosts(page = 1, limit = 10, filters = {}) {
        try {
            const params = {
                page: page,
                limit: limit,
                ...filters
            };

            // Check if using Firebase or API
            if (firebaseService.mockMode) {
                return await this.getPaginatedPostsFromFirebase(params);
            } else {
                return await apiService.get('/posts/feed', params);
            }

        } catch (error) {
            console.error('Error fetching feed posts:', error);
            throw error;
        }
    }

    /**
     * Get paginated posts from Firebase
     */
    async getPaginatedPostsFromFirebase(params) {
        const allPosts = await firebaseService.getData('posts') || [];
        
        const startIndex = (params.page - 1) * params.limit;
        const endIndex = startIndex + params.limit;
        
        const paginatedPosts = allPosts.slice(startIndex, endIndex);
        
        return {
            posts: paginatedPosts,
            pagination: {
                currentPage: params.page,
                totalPages: Math.ceil(allPosts.length / params.limit),
                totalPosts: allPosts.length,
                hasMore: endIndex < allPosts.length
            }
        };
    }

    /**
     * Load more posts (infinite scroll)
     */
    async loadMorePosts() {
        this.pagination.currentPage++;
        const result = await this.getFeedPosts(
            this.pagination.currentPage,
            this.pagination.postsPerPage
        );
        
        this.pagination.hasMore = result.pagination.hasMore;
        return result.posts;
    }

    // ========== LIKE/COMMENT PERSISTENCE ==========

    /**
     * Like/Unlike post
     */
    async toggleLike(postId, userId = 'current_user') {
        try {
            // Get current post
            const post = await this.getPost(postId);
            
            if (!post) throw new Error('Post not found');

            // Toggle like status
            const isLiked = post.likedBy && post.likedBy.includes(userId);
            
            if (isLiked) {
                // Unlike
                post.likes = Math.max(0, post.likes - 1);
                post.likedBy = post.likedBy.filter(id => id !== userId);
                post.reactions.like = Math.max(0, post.reactions.like - 1);
            } else {
                // Like
                post.likes++;
                post.likedBy = post.likedBy || [];
                post.likedBy.push(userId);
                post.reactions.like++;
            }

            // Update in backend
            await this.updatePostInBackend(postId, {
                likes: post.likes,
                likedBy: post.likedBy,
                reactions: post.reactions
            });

            // Update cache
            this.postsCache.set(postId, post);

            // Trigger real-time update
            this.notifyPostUpdated(post);

            return {
                success: true,
                isLiked: !isLiked,
                likes: post.likes
            };

        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    }

    /**
     * Add comment to post
     */
    async addComment(postId, commentData) {
        try {
            const post = await this.getPost(postId);
            
            if (!post) throw new Error('Post not found');

            const comment = {
                id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                postId: postId,
                userId: commentData.userId || 'current_user',
                author: commentData.author || 'Current User',
                authorAvatar: commentData.authorAvatar || '👤',
                text: commentData.text,
                timestamp: Date.now(),
                likes: 0,
                replies: []
            };

            // Add comment to post
            post.comments = post.comments || [];
            post.comments.push(comment);

            // Update in backend
            await this.updatePostInBackend(postId, {
                comments: post.comments
            });

            // Update cache
            this.postsCache.set(postId, post);

            // Trigger real-time update
            this.notifyPostUpdated(post);

            return comment;

        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    }

    /**
     * Get post comments
     */
    async getComments(postId) {
        try {
            const post = await this.getPost(postId);
            return post ? post.comments || [] : [];
        } catch (error) {
            console.error('Error getting comments:', error);
            return [];
        }
    }

    /**
     * Update comment counts
     */
    async updateCommentCount(postId) {
        const post = await this.getPost(postId);
        if (post) {
            const commentCount = post.comments ? post.comments.length : 0;
            await this.updatePostInBackend(postId, { commentCount });
        }
    }

    // ========== REAL-TIME UPDATES ==========

    /**
     * Subscribe to real-time post updates
     */
    subscribeToPostUpdates(callback) {
        const unsubscribe = firebaseService.onDataChange('posts', (posts) => {
            // Update cache
            if (Array.isArray(posts)) {
                posts.forEach(post => {
                    this.postsCache.set(post.id, post);
                });
            }
            
            // Notify callback
            callback(posts);
        });

        return unsubscribe;
    }

    /**
     * Notify post created
     */
    notifyPostCreated(post) {
        // Trigger real-time update
        firebaseService.simulateRealTimeUpdate('posts', 500);
        
        // Emit event
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('post:created', { detail: post }));
        }
    }

    /**
     * Notify post updated
     */
    notifyPostUpdated(post) {
        // Trigger real-time update
        firebaseService.simulateRealTimeUpdate('posts', 300);
        
        // Emit event
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('post:updated', { detail: post }));
        }
    }

    // ========== POST OPERATIONS ==========

    /**
     * Get single post
     */
    async getPost(postId) {
        // Check cache first
        if (this.postsCache.has(postId)) {
            return this.postsCache.get(postId);
        }

        // Fetch from backend
        try {
            const posts = await firebaseService.getData('posts') || [];
            const post = posts.find(p => p.id === postId);
            
            if (post) {
                this.postsCache.set(postId, post);
            }
            
            return post;
        } catch (error) {
            console.error('Error getting post:', error);
            return null;
        }
    }

    /**
     * Update post
     */
    async updatePost(postId, updates) {
        try {
            const post = await this.getPost(postId);
            
            if (!post) throw new Error('Post not found');

            // Merge updates
            Object.assign(post, updates, { 
                isEdited: true,
                lastEditedAt: Date.now()
            });

            // Save to backend
            await this.updatePostInBackend(postId, post);

            // Update cache
            this.postsCache.set(postId, post);

            // Trigger real-time update
            this.notifyPostUpdated(post);

            return post;

        } catch (error) {
            console.error('Error updating post:', error);
            throw error;
        }
    }

    /**
     * Delete post
     */
    async deletePost(postId) {
        try {
            // Delete from backend
            await firebaseService.deleteData('posts', postId);

            // Remove from cache
            this.postsCache.delete(postId);

            // Trigger real-time update
            firebaseService.simulateRealTimeUpdate('posts', 300);

            return true;

        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    }

    /**
     * Save post to backend
     */
    async savePostToBackend(post) {
        try {
            post.id = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const posts = await firebaseService.getData('posts') || [];
            posts.unshift(post);
            
            await firebaseService.setData('posts', posts);
            
            return post;

        } catch (error) {
            console.error('Error saving post to backend:', error);
            throw error;
        }
    }

    /**
     * Update post in backend
     */
    async updatePostInBackend(postId, updates) {
        try {
            await firebaseService.updateData('posts', postId, updates);
            return true;
        } catch (error) {
            console.error('Error updating post in backend:', error);
            throw error;
        }
    }

    // ========== UTILITY FUNCTIONS ==========

    /**
     * Extract hashtags from content
     */
    extractHashtags(content) {
        if (!content) return [];
        const hashtagRegex = /#(\w+)/g;
        const matches = content.match(hashtagRegex);
        return matches ? matches.map(tag => tag.substring(1)) : [];
    }

    /**
     * Extract mentions from content
     */
    extractMentions(content) {
        if (!content) return [];
        const mentionRegex = /@(\w+)/g;
        const matches = content.match(mentionRegex);
        return matches ? matches.map(mention => mention.substring(1)) : [];
    }

    /**
     * Generate link preview
     */
    async generateLinkPreview(content) {
        if (!content) return null;
        
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const match = content.match(urlRegex);
        
        if (match && match[0]) {
            const url = match[0];
            const domain = new URL(url).hostname;
            
            return {
                url: url,
                title: 'Link Preview',
                description: 'Click to view content',
                domain: domain,
                icon: '🔗',
                image: null
            };
        }
        
        return null;
    }

    /**
     * Increment view count
     */
    async incrementViews(postId) {
        try {
            const post = await this.getPost(postId);
            if (post) {
                post.views = (post.views || 0) + 1;
                await this.updatePostInBackend(postId, { views: post.views });
            }
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    }

    /**
     * Update analytics
     */
    async updateAnalytics(postId, analyticsData) {
        try {
            const post = await this.getPost(postId);
            if (post) {
                post.analytics = {
                    ...post.analytics,
                    ...analyticsData
                };
                await this.updatePostInBackend(postId, { analytics: post.analytics });
            }
        } catch (error) {
            console.error('Error updating analytics:', error);
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.postsCache.clear();
        console.log('Feed cache cleared');
    }

    /**
     * Get service info
     */
    getInfo() {
        return {
            cachedPosts: this.postsCache.size,
            realtimeListeners: this.realtimeListeners.size,
            pagination: this.pagination,
            compressionQuality: this.compressionQuality,
            maxImageSize: this.maxImageSize
        };
    }
}

// Create and export global instance
const feedAPIService = new FeedAPIService();
window.feedAPIService = feedAPIService;

export default feedAPIService;
