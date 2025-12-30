/**
 * ConnectHub Stories API Service
 * Complete backend integration for Stories System
 * Includes: Story creation, upload, 24-hour deletion, viewer tracking, interactions
 */

class StoriesAPIService {
    constructor() {
        this.baseURL = 'https://api.connecthub.com/v1/stories';
        this.stories = new Map();
        this.viewedStories = new Set();
        this.deletionTimers = new Map();
        this.wsConnection = null;
        
        this.init();
    }

    async init() {
        // Load cached stories
        this.loadCachedStories();
        
        // Connect to real-time WebSocket
        this.connectStoriesWebSocket();
        
        // Start auto-deletion checker
        this.startAutoDeletionChecker();
        
        console.log('✓ Stories API Service initialized');
    }

    // ========== STORY CREATION & UPLOAD ==========

    /**
     * Create photo story
     * Handles image capture/upload and processing
     */
    async createPhotoStory(photoFile, options = {}) {
        try {
            // Validate file
            if (!photoFile || !photoFile.type.startsWith('image/')) {
                throw new Error('Invalid image file');
            }

            // Compress image before upload
            const compressedFile = await this.compressImage(photoFile);

            // Create FormData
            const formData = new FormData();
            formData.append('photo', compressedFile);
            formData.append('type', 'photo');
            formData.append('duration', options.duration || 5); // 5 seconds default
            
            if (options.text) formData.append('text', options.text);
            if (options.textColor) formData.append('textColor', options.textColor);
            if (options.textPosition) formData.append('textPosition', JSON.stringify(options.textPosition));
            if (options.filter) formData.append('filter', options.filter);
            if (options.stickers) formData.append('stickers', JSON.stringify(options.stickers));
            if (options.music) formData.append('music', options.music);
            if (options.privacy) formData.append('privacy', options.privacy);

            // Upload to server
            const response = await fetch(`${this.baseURL}/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Story creation failed');
            }

            const result = await response.json();
            const story = result.story;

            // Store locally
            this.stories.set(story.id, story);
            this.saveCachedStories();

            // Schedule auto-deletion after 24 hours
            this.scheduleStoryDeletion(story.id, story.expiresAt);

            // Notify followers via WebSocket
            this.notifyNewStory(story);

            return story;
        } catch (error) {
            console.error('Failed to create photo story:', error);
            throw error;
        }
    }

    /**
     * Create video story
     * Handles video recording/upload and processing
     */
    async createVideoStory(videoFile, options = {}) {
        try {
            // Validate file
            if (!videoFile || !videoFile.type.startsWith('video/')) {
                throw new Error('Invalid video file');
            }

            // Check duration (max 60 seconds)
            const duration = await this.getVideoDuration(videoFile);
            if (duration > 60) {
                throw new Error('Video must be 60 seconds or less');
            }

            // Compress video before upload
            const compressedFile = await this.compressVideo(videoFile);

            // Create FormData
            const formData = new FormData();
            formData.append('video', compressedFile);
            formData.append('type', 'video');
            formData.append('duration', duration);
            
            if (options.text) formData.append('text', options.text);
            if (options.filter) formData.append('filter', options.filter);
            if (options.stickers) formData.append('stickers', JSON.stringify(options.stickers));
            if (options.music) formData.append('music', options.music);
            if (options.privacy) formData.append('privacy', options.privacy);

            // Upload to server
            const response = await fetch(`${this.baseURL}/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Video story creation failed');
            }

            const result = await response.json();
            const story = result.story;

            // Store locally
            this.stories.set(story.id, story);
            this.saveCachedStories();

            // Schedule auto-deletion after 24 hours
            this.scheduleStoryDeletion(story.id, story.expiresAt);

            return story;
        } catch (error) {
            console.error('Failed to create video story:', error);
            throw error;
        }
    }

    /**
     * Record video story directly from camera
     */
    async recordVideoStory(streamConfig = {}) {
        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1080 },
                    height: { ideal: 1920 },
                    facingMode: streamConfig.facingMode || 'user'
                },
                audio: true
            });

            return {
                stream,
                recordingAPI: this.createMediaRecorder(stream)
            };
        } catch (error) {
            console.error('Camera access denied:', error);
            throw new Error('Camera access required for video stories');
        }
    }

    /**
     * Create MediaRecorder for video capture
     */
    createMediaRecorder(stream) {
        const chunks = [];
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 2500000
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const videoFile = new File([blob], `story_${Date.now()}.webm`, { type: 'video/webm' });
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
            
            return videoFile;
        };

        return {
            start: () => mediaRecorder.start(),
            stop: () => new Promise((resolve) => {
                mediaRecorder.onstop = async () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    const videoFile = new File([blob], `story_${Date.now()}.webm`, { type: 'video/webm' });
                    stream.getTracks().forEach(track => track.stop());
                    resolve(videoFile);
                };
                mediaRecorder.stop();
            }),
            pause: () => mediaRecorder.pause(),
            resume: () => mediaRecorder.resume()
        };
    }

    // ========== 24-HOUR AUTO-DELETION ==========

    /**
     * Schedule story deletion after 24 hours
     */
    scheduleStoryDeletion(storyId, expiresAt) {
        const expiryTime = new Date(expiresAt).getTime();
        const now = Date.now();
        const timeUntilExpiry = expiryTime - now;

        if (timeUntilExpiry > 0) {
            const timer = setTimeout(() => {
                this.deleteStory(storyId);
            }, timeUntilExpiry);

            this.deletionTimers.set(storyId, timer);
        } else {
            // Story already expired, delete immediately
            this.deleteStory(storyId);
        }
    }

    /**
     * Check and delete expired stories
     */
    startAutoDeletionChecker() {
        // Check every 5 minutes
        setInterval(() => {
            const now = Date.now();
            
            this.stories.forEach((story, storyId) => {
                const expiryTime = new Date(story.expiresAt).getTime();
                
                if (now >= expiryTime) {
                    this.deleteStory(storyId);
                }
            });
        }, 5 * 60 * 1000);
    }

    /**
     * Delete story (auto or manual)
     */
    async deleteStory(storyId) {
        try {
            // Clear deletion timer if exists
            if (this.deletionTimers.has(storyId)) {
                clearTimeout(this.deletionTimers.get(storyId));
                this.deletionTimers.delete(storyId);
            }

            // Delete from server
            await this.apiCall(`/${storyId}`, 'DELETE');

            // Remove from local storage
            this.stories.delete(storyId);
            this.saveCachedStories();

            // Dispatch event
            document.dispatchEvent(new CustomEvent('storyDeleted', {
                detail: { storyId }
            }));

            console.log(`Story ${storyId} deleted`);
            return true;
        } catch (error) {
            console.error('Failed to delete story:', error);
            return false;
        }
    }

    // ========== VIEWER TRACKING ==========

    /**
     * Track story view
     */
    async trackStoryView(storyId) {
        try {
            // Mark as viewed locally
            this.viewedStories.add(storyId);
            localStorage.setItem('viewedStories', JSON.stringify([...this.viewedStories]));

            // Send to server
            const response = await this.apiCall(`/${storyId}/view`, 'POST');

            // Update local story data
            const story = this.stories.get(storyId);
            if (story) {
                story.views = (story.views || 0) + 1;
                story.viewedByMe = true;
                this.stories.set(storyId, story);
                this.saveCachedStories();
            }

            return response;
        } catch (error) {
            console.error('Failed to track story view:', error);
        }
    }

    /**
     * Get viewers list for a story
     */
    async getStoryViewers(storyId) {
        try {
            const response = await this.apiCall(`/${storyId}/viewers`, 'GET');
            return response.viewers || [];
        } catch (error) {
            console.error('Failed to get story viewers:', error);
            return [];
        }
    }

    /**
     * Get detailed viewer analytics
     */
    async getViewerAnalytics(storyId) {
        try {
            const response = await this.apiCall(`/${storyId}/analytics`, 'GET');
            return {
                totalViews: response.totalViews || 0,
                uniqueViewers: response.uniqueViewers || 0,
                viewers: response.viewers || [],
                viewsByTime: response.viewsByTime || [],
                replyCount: response.replyCount || 0,
                shareCount: response.shareCount || 0,
                completionRate: response.completionRate || 0
            };
        } catch (error) {
            console.error('Failed to get viewer analytics:', error);
            return null;
        }
    }

    // ========== STORY INTERACTIONS ==========

    /**
     * React to story
     */
    async reactToStory(storyId, reaction) {
        try {
            const response = await this.apiCall(`/${storyId}/react`, 'POST', {
                reaction,
                timestamp: new Date().toISOString()
            });

            // Notify story owner via WebSocket
            if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
                this.wsConnection.send(JSON.stringify({
                    type: 'story_reaction',
                    data: { storyId, reaction }
                }));
            }

            return response;
        } catch (error) {
            console.error('Failed to react to story:', error);
            throw error;
        }
    }

    /**
     * Reply to story (sends DM)
     */
    async replyToStory(storyId, message) {
        try {
            const response = await this.apiCall(`/${storyId}/reply`, 'POST', {
                message,
                timestamp: new Date().toISOString()
            });

            return response;
        } catch (error) {
            console.error('Failed to reply to story:', error);
            throw error;
        }
    }

    /**
     * Share story
     */
    async shareStory(storyId, recipientIds = []) {
        try {
            const response = await this.apiCall(`/${storyId}/share`, 'POST', {
                recipientIds,
                timestamp: new Date().toISOString()
            });

            return response;
        } catch (error) {
            console.error('Failed to share story:', error);
            throw error;
        }
    }

    // ========== STORY FETCHING ==========

    /**
     * Get all active stories from followed users
     */
    async getFollowingStories() {
        try {
            const response = await this.apiCall('/following', 'GET');
            const stories = response.stories || [];

            // Cache stories
            stories.forEach(story => {
                this.stories.set(story.id, story);
                
                // Schedule deletion
                this.scheduleStoryDeletion(story.id, story.expiresAt);
            });

            this.saveCachedStories();

            return this.groupStoriesByUser(stories);
        } catch (error) {
            console.error('Failed to get following stories:', error);
            // Return cached stories
            return this.groupStoriesByUser([...this.stories.values()]);
        }
    }

    /**
     * Get user's own stories
     */
    async getMyStories() {
        try {
            const response = await this.apiCall('/me', 'GET');
            return response.stories || [];
        } catch (error) {
            console.error('Failed to get my stories:', error);
            return [];
        }
    }

    /**
     * Get stories from specific user
     */
    async getUserStories(userId) {
        try {
            const response = await this.apiCall(`/user/${userId}`, 'GET');
            return response.stories || [];
        } catch (error) {
            console.error('Failed to get user stories:', error);
            return [];
        }
    }

    /**
     * Group stories by user
     */
    groupStoriesByUser(stories) {
        const grouped = new Map();

        stories.forEach(story => {
            const userId = story.userId;
            
            if (!grouped.has(userId)) {
                grouped.set(userId, {
                    userId: userId,
                    username: story.username,
                    avatar: story.userAvatar,
                    stories: [],
                    hasUnviewed: false
                });
            }

            const userGroup = grouped.get(userId);
            userGroup.stories.push(story);
            
            // Check if has unviewed stories
            if (!this.viewedStories.has(story.id)) {
                userGroup.hasUnviewed = true;
            }
        });

        // Sort by most recent story
        return Array.from(grouped.values()).sort((a, b) => {
            const aLatest = new Date(a.stories[0].createdAt).getTime();
            const bLatest = new Date(b.stories[0].createdAt).getTime();
            return bLatest - aLatest;
        });
    }

    // ========== MEDIA PROCESSING ==========

    /**
     * Compress image for upload
     */
    async compressImage(file, maxWidth = 1080, maxHeight = 1920, quality = 0.85) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        }));
                    }, 'image/jpeg', quality);
                };

                img.src = e.target.result;
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Compress video for upload
     */
    async compressVideo(file) {
        // In production, would use FFmpeg.js or similar
        // For now, return original file
        console.log('Video compression would happen here');
        return file;
    }

    /**
     * Get video duration
     */
    getVideoDuration(file) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                resolve(video.duration);
            };

            video.src = URL.createObjectURL(file);
        });
    }

    // ========== WEBSOCKET CONNECTION ==========

    /**
     * Connect to stories WebSocket for real-time updates
     */
    connectStoriesWebSocket() {
        const wsURL = 'wss://api.connecthub.com/v1/stories/ws';
        
        try {
            this.wsConnection = new WebSocket(wsURL);

            this.wsConnection.onopen = () => {
                console.log('✓ Stories WebSocket connected');
                
                // Authenticate
                this.wsConnection.send(JSON.stringify({
                    type: 'auth',
                    token: this.getAuthToken()
                }));
            };

            this.wsConnection.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('WebSocket message parse error:', error);
                }
            };

            this.wsConnection.onerror = (error) => {
                console.error('Stories WebSocket error:', error);
            };

            this.wsConnection.onclose = () => {
                console.log('Stories WebSocket disconnected');
                // Reconnect after 5 seconds
                setTimeout(() => this.connectStoriesWebSocket(), 5000);
            };
        } catch (error) {
            console.error('Failed to connect Stories WebSocket:', error);
        }
    }

    /**
     * Handle WebSocket messages
     */
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'new_story':
                this.handleNewStory(data.story);
                break;
            case 'story_deleted':
                this.handleStoryDeleted(data.storyId);
                break;
            case 'story_viewed':
                this.handleStoryViewed(data);
                break;
            case 'story_reaction':
                this.handleStoryReaction(data);
                break;
            case 'story_reply':
                this.handleStoryReply(data);
                break;
            default:
                console.log('Unknown WebSocket message type:', data.type);
        }
    }

    handleNewStory(story) {
        this.stories.set(story.id, story);
        this.scheduleStoryDeletion(story.id, story.expiresAt);
        this.saveCachedStories();

        document.dispatchEvent(new CustomEvent('newStoryAvailable', {
            detail: story
        }));
    }

    handleStoryDeleted(storyId) {
        this.stories.delete(storyId);
        this.saveCachedStories();

        document.dispatchEvent(new CustomEvent('storyDeleted', {
            detail: { storyId }
        }));
    }

    handleStoryViewed(data) {
        document.dispatchEvent(new CustomEvent('storyViewed', {
            detail: data
        }));
    }

    handleStoryReaction(data) {
        document.dispatchEvent(new CustomEvent('storyReaction', {
            detail: data
        }));
    }

    handleStoryReply(data) {
        document.dispatchEvent(new CustomEvent('storyReply', {
            detail: data
        }));
    }

    notifyNewStory(story) {
        if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
            this.wsConnection.send(JSON.stringify({
                type: 'new_story',
                data: story
            }));
        }
    }

    // ========== STORAGE MANAGEMENT ==========

    loadCachedStories() {
        try {
            const cached = localStorage.getItem('stories');
            if (cached) {
                const stories = JSON.parse(cached);
                stories.forEach(story => {
                    this.stories.set(story.id, story);
                    // Re-schedule deletion timers
                    this.scheduleStoryDeletion(story.id, story.expiresAt);
                });
            }

            const viewedStories = localStorage.getItem('viewedStories');
            if (viewedStories) {
                this.viewedStories = new Set(JSON.parse(viewedStories));
            }
        } catch (error) {
            console.error('Failed to load cached stories:', error);
        }
    }

    saveCachedStories() {
        try {
            const stories = [...this.stories.values()];
            localStorage.setItem('stories', JSON.stringify(stories));
        } catch (error) {
            console.error('Failed to save cached stories:', error);
        }
    }

    // ========== UTILITY METHODS ==========

    /**
     * Generic API call wrapper
     */
    async apiCall(endpoint, method = 'GET', data = null) {
        const url = `${this.baseURL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`API call failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API call error (${endpoint}):`, error);
            throw error;
        }
    }

    getAuthToken() {
        return localStorage.getItem('authToken') || 'demo_token_123';
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.wsConnection) {
            this.wsConnection.close();
        }
        
        // Clear all deletion timers
        this.deletionTimers.forEach(timer => clearTimeout(timer));
        this.deletionTimers.clear();
        
        this.stories.clear();
    }
}

// Initialize and export
const storiesAPIService = new StoriesAPIService();
window.storiesAPIService = storiesAPIService;

export default storiesAPIService;
