/**
 * YouTube Data API Service
 * Trending Videos & Content
 * Free Tier: 10,000 units/day
 */

class YouTubeService {
    constructor() {
        this.baseURL = 'https://www.googleapis.com/youtube/v3';
        this.apiKey = null; // Will be loaded from .env
        this.cache = new Map();
        this.cacheDuration = 15 * 60 * 1000; // 15 minutes
        this.unitsUsed = 0;
        this.unitsLimit = 10000; // Daily limit
        this.collectedData = [];
    }

    /**
     * Initialize service with API key
     */
    init(apiKey) {
        this.apiKey = apiKey;
        this.loadStoredData();
    }

    /**
     * Get trending videos
     */
    async getTrendingVideos(params = {}) {
        const cacheKey = `trending-${JSON.stringify(params)}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheDuration) {
                console.log('📦 YouTube: Returning cached trending videos');
                return cached.data;
            }
        }

        try {
            const queryParams = new URLSearchParams({
                key: this.apiKey,
                part: params.part || 'snippet,statistics',
                chart: 'mostPopular',
                regionCode: params.regionCode || 'US',
                maxResults: params.maxResults || 20,
                videoCategoryId: params.categoryId || ''
            });

            const response = await fetch(`${this.baseURL}/videos?${queryParams}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'YouTube API Error');
            }

            // Cache the response
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            // Track units (1 unit per video)
            const unitsUsed = data.items?.length || 0;
            this.unitsUsed += unitsUsed;
            this.trackRequest('trending', params, unitsUsed);

            // Store data
            this.storeVideoData(data.items);

            console.log(`✅ YouTube: Fetched ${data.items?.length || 0} trending videos`);
            return data;

        } catch (error) {
            console.error('❌ YouTube Error:', error);
            throw error;
        }
    }

    /**
     * Search videos
     */
    async searchVideos(query, params = {}) {
        try {
            const queryParams = new URLSearchParams({
                key: this.apiKey,
                part: 'snippet',
                q: query,
                type: 'video',
                maxResults: params.maxResults || 20,
                regionCode: params.regionCode || 'US',
                relevanceLanguage: params.language || 'en',
                order: params.order || 'relevance'
            });

            const response = await fetch(`${this.baseURL}/search?${queryParams}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'YouTube API Error');
            }

            // Search costs 100 units
            this.unitsUsed += 100;
            this.trackRequest('search', { query, ...params }, 100);

            // Get full video details
            if (data.items && data.items.length > 0) {
                const videoIds = data.items.map(item => item.id.videoId).join(',');
                const videoDetails = await this.getVideoDetails(videoIds);
                this.storeVideoData(videoDetails.items);
                return videoDetails;
            }

            return data;

        } catch (error) {
            console.error('❌ YouTube Search Error:', error);
            throw error;
        }
    }

    /**
     * Get video details
     */
    async getVideoDetails(videoIds) {
        try {
            const queryParams = new URLSearchParams({
                key: this.apiKey,
                part: 'snippet,statistics,contentDetails',
                id: videoIds
            });

            const response = await fetch(`${this.baseURL}/videos?${queryParams}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'YouTube API Error');
            }

            // 1 unit per video
            const unitsUsed = videoIds.split(',').length;
            this.unitsUsed += unitsUsed;

            return data;

        } catch (error) {
            console.error('❌ YouTube Video Details Error:', error);
            throw error;
        }
    }

    /**
     * Get videos by category
     */
    async getVideosByCategory(categoryId, maxResults = 20) {
        return await this.getTrendingVideos({
            categoryId: categoryId,
            maxResults: maxResults
        });
    }

    /**
     * Get channel details
     */
    async getChannelDetails(channelId) {
        try {
            const queryParams = new URLSearchParams({
                key: this.apiKey,
                part: 'snippet,statistics',
                id: channelId
            });

            const response = await fetch(`${this.baseURL}/channels?${queryParams}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'YouTube API Error');
            }

            // 1 unit per channel
            this.unitsUsed += 1;

            return data;

        } catch (error) {
            console.error('❌ YouTube Channel Error:', error);
            throw error;
        }
    }

    /**
     * Get video categories
     */
    async getCategories(regionCode = 'US') {
        try {
            const queryParams = new URLSearchParams({
                key: this.apiKey,
                part: 'snippet',
                regionCode: regionCode
            });

            const response = await fetch(`${this.baseURL}/videoCategories?${queryParams}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'YouTube API Error');
            }

            // 1 unit
            this.unitsUsed += 1;

            return data;

        } catch (error) {
            console.error('❌ YouTube Categories Error:', error);
            throw error;
        }
    }

    /**
     * Store video data locally
     */
    storeVideoData(videos) {
        if (!videos || !Array.isArray(videos)) return;

        videos.forEach(video => {
            const exists = this.collectedData.find(item => item.id === video.id);
            if (!exists) {
                this.collectedData.push({
                    ...video,
                    collectedAt: new Date().toISOString(),
                    source: 'youtube'
                });
            }
        });

        // Save to localStorage
        this.saveStoredData();
    }

    /**
     * Save data to localStorage
     */
    saveStoredData() {
        try {
            localStorage.setItem('youtube_data', JSON.stringify({
                videos: this.collectedData,
                unitsUsed: this.unitsUsed,
                lastUpdated: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error saving YouTube data:', error);
        }
    }

    /**
     * Load stored data from localStorage
     */
    loadStoredData() {
        try {
            const stored = localStorage.getItem('youtube_data');
            if (stored) {
                const data = JSON.parse(stored);
                this.collectedData = data.videos || [];
                
                // Reset units if it's a new day
                const lastUpdate = new Date(data.lastUpdated);
                const today = new Date();
                if (lastUpdate.getDate() !== today.getDate()) {
                    this.unitsUsed = 0;
                } else {
                    this.unitsUsed = data.unitsUsed || 0;
                }
            }
        } catch (error) {
            console.error('Error loading YouTube data:', error);
        }
    }

    /**
     * Get all collected data
     */
    getCollectedData() {
        return {
            videos: this.collectedData,
            totalVideos: this.collectedData.length,
            unitsUsed: this.unitsUsed,
            unitsRemaining: this.unitsLimit - this.unitsUsed,
            lastUpdated: this.collectedData.length > 0 
                ? this.collectedData[0].collectedAt 
                : null
        };
    }

    /**
     * Remove specific video
     */
    removeVideo(videoId) {
        this.collectedData = this.collectedData.filter(item => item.id !== videoId);
        this.saveStoredData();
    }

    /**
     * Clear all collected data
     */
    clearAllData() {
        this.collectedData = [];
        this.unitsUsed = 0;
        this.cache.clear();
        localStorage.removeItem('youtube_data');
        console.log('🗑️ YouTube: All data cleared');
    }

    /**
     * Export data as JSON
     */
    exportData() {
        const data = {
            service: 'YouTube',
            videos: this.collectedData,
            stats: {
                totalVideos: this.collectedData.length,
                unitsUsed: this.unitsUsed,
                unitsRemaining: this.unitsLimit - this.unitsUsed
            },
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `youtube-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Track API request
     */
    trackRequest(type, params, units) {
        const request = {
            type,
            params,
            units,
            timestamp: new Date().toISOString(),
            totalUnitsUsed: this.unitsUsed
        };

        // Save request history
        const history = JSON.parse(localStorage.getItem('youtube_requests') || '[]');
        history.push(request);
        
        // Keep only last 100 requests
        if (history.length > 100) {
            history.shift();
        }
        
        localStorage.setItem('youtube_requests', JSON.stringify(history));
    }

    /**
     * Get request history
     */
    getRequestHistory() {
        return JSON.parse(localStorage.getItem('youtube_requests') || '[]');
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            totalVideos: this.collectedData.length,
            unitsUsed: this.unitsUsed,
            unitsRemaining: this.unitsLimit - this.unitsUsed,
            unitsPercentage: ((this.unitsUsed / this.unitsLimit) * 100).toFixed(1),
            cacheSize: this.cache.size,
            lastUpdate: this.collectedData.length > 0 
                ? new Date(this.collectedData[0].collectedAt).toLocaleString()
                : 'Never',
            resetsAt: this.getResetTime()
        };
    }

    /**
     * Get quota reset time
     */
    getResetTime() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        
        const hoursUntil = Math.floor((midnight - now) / (1000 * 60 * 60));
        const minutesUntil = Math.floor(((midnight - now) % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hoursUntil}h ${minutesUntil}m`;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ YouTube: Cache cleared');
    }

    /**
     * Test API connection
     */
    async testConnection() {
        try {
            const data = await this.getTrendingVideos({ maxResults: 1 });
            return {
                success: true,
                message: 'YouTube API connected successfully',
                videosCount: data.items?.length || 0,
                unitsUsed: 1
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Format video data for display
     */
    formatVideoForDisplay(video) {
        return {
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
            channelTitle: video.snippet.channelTitle,
            publishedAt: video.snippet.publishedAt,
            viewCount: parseInt(video.statistics?.viewCount || 0),
            likeCount: parseInt(video.statistics?.likeCount || 0),
            commentCount: parseInt(video.statistics?.commentCount || 0),
            duration: video.contentDetails?.duration || 'N/A',
            url: `https://www.youtube.com/watch?v=${video.id}`
        };
    }

    /**
     * Get formatted trending videos
     */
    async getFormattedTrending(maxResults = 20) {
        const data = await this.getTrendingVideos({ maxResults });
        return data.items.map(video => this.formatVideoForDisplay(video));
    }
}

// Create and export singleton instance
const youtubeService = new YouTubeService();
// export default youtubeService;
