/**
 * MediaStack API Service
 * Real-time News from 7,500+ Sources
 * Free Tier: 500 requests/month
 */

class MediaStackService {
    constructor() {
        this.baseURL = 'http://api.mediastack.com/v1';
        this.apiKey = null; // Will be loaded from .env
        this.cache = new Map();
        this.cacheDuration = 15 * 60 * 1000; // 15 minutes
        this.requestCount = 0;
        this.requestLimit = 500; // Monthly limit
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
     * Get latest news
     */
    async getNews(params = {}) {
        const cacheKey = JSON.stringify(params);
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheDuration) {
                console.log('📦 MediaStack: Returning cached news');
                return cached.data;
            }
        }

        try {
            const queryParams = new URLSearchParams({
                access_key: this.apiKey,
                countries: params.countries || 'us',
                languages: params.languages || 'en',
                categories: params.categories || '',
                limit: params.limit || 25,
                offset: params.offset || 0,
                sort: params.sort || 'published_desc',
                ...params
            });

            const response = await fetch(`${this.baseURL}/news?${queryParams}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'MediaStack API Error');
            }

            // Cache the response
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            // Track request
            this.requestCount++;
            this.trackRequest('news', params);

            // Store data
            this.storeNewsData(data.data);

            console.log(`✅ MediaStack: Fetched ${data.data?.length || 0} news articles`);
            return data;

        } catch (error) {
            console.error('❌ MediaStack Error:', error);
            throw error;
        }
    }

    /**
     * Search news
     */
    async searchNews(keywords, params = {}) {
        try {
            const queryParams = new URLSearchParams({
                access_key: this.apiKey,
                keywords: keywords,
                countries: params.countries || 'us',
                languages: params.languages || 'en',
                limit: params.limit || 25,
                sort: params.sort || 'published_desc',
                ...params
            });

            const response = await fetch(`${this.baseURL}/news?${queryParams}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'MediaStack API Error');
            }

            this.requestCount++;
            this.trackRequest('search', { keywords, ...params });
            this.storeNewsData(data.data);

            return data;

        } catch (error) {
            console.error('❌ MediaStack Search Error:', error);
            throw error;
        }
    }

    /**
     * Get news by category
     */
    async getNewsByCategory(category, limit = 10) {
        return await this.getNews({
            categories: category,
            limit: limit
        });
    }

    /**
     * Get news by source
     */
    async getNewsBySource(sources, limit = 10) {
        return await this.getNews({
            sources: sources,
            limit: limit
        });
    }

    /**
     * Get sources list
     */
    async getSources(params = {}) {
        try {
            const queryParams = new URLSearchParams({
                access_key: this.apiKey,
                countries: params.countries || '',
                categories: params.categories || '',
                languages: params.languages || 'en',
                ...params
            });

            const response = await fetch(`${this.baseURL}/sources?${queryParams}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'MediaStack API Error');
            }

            this.requestCount++;
            return data;

        } catch (error) {
            console.error('❌ MediaStack Sources Error:', error);
            throw error;
        }
    }

    /**
     * Store news data locally
     */
    storeNewsData(articles) {
        if (!articles || !Array.isArray(articles)) return;

        articles.forEach(article => {
            const exists = this.collectedData.find(item => item.url === article.url);
            if (!exists) {
                this.collectedData.push({
                    ...article,
                    collectedAt: new Date().toISOString(),
                    source: 'mediastack'
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
            localStorage.setItem('mediastack_data', JSON.stringify({
                articles: this.collectedData,
                requestCount: this.requestCount,
                lastUpdated: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error saving MediaStack data:', error);
        }
    }

    /**
     * Load stored data from localStorage
     */
    loadStoredData() {
        try {
            const stored = localStorage.getItem('mediastack_data');
            if (stored) {
                const data = JSON.parse(stored);
                this.collectedData = data.articles || [];
                this.requestCount = data.requestCount || 0;
            }
        } catch (error) {
            console.error('Error loading MediaStack data:', error);
        }
    }

    /**
     * Get all collected data
     */
    getCollectedData() {
        return {
            articles: this.collectedData,
            totalArticles: this.collectedData.length,
            requestCount: this.requestCount,
            requestsRemaining: this.requestLimit - this.requestCount,
            lastUpdated: this.collectedData.length > 0 
                ? this.collectedData[0].collectedAt 
                : null
        };
    }

    /**
     * Remove specific article
     */
    removeArticle(url) {
        this.collectedData = this.collectedData.filter(item => item.url !== url);
        this.saveStoredData();
    }

    /**
     * Clear all collected data
     */
    clearAllData() {
        this.collectedData = [];
        this.requestCount = 0;
        this.cache.clear();
        localStorage.removeItem('mediastack_data');
        console.log('🗑️ MediaStack: All data cleared');
    }

    /**
     * Export data as JSON
     */
    exportData() {
        const data = {
            service: 'MediaStack',
            articles: this.collectedData,
            stats: {
                totalArticles: this.collectedData.length,
                requestCount: this.requestCount,
                requestsRemaining: this.requestLimit - this.requestCount
            },
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mediastack-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Track API request
     */
    trackRequest(type, params) {
        const request = {
            type,
            params,
            timestamp: new Date().toISOString(),
            count: this.requestCount
        };

        // Save request history
        const history = JSON.parse(localStorage.getItem('mediastack_requests') || '[]');
        history.push(request);
        
        // Keep only last 100 requests
        if (history.length > 100) {
            history.shift();
        }
        
        localStorage.setItem('mediastack_requests', JSON.stringify(history));
    }

    /**
     * Get request history
     */
    getRequestHistory() {
        return JSON.parse(localStorage.getItem('mediastack_requests') || '[]');
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            totalArticles: this.collectedData.length,
            requestCount: this.requestCount,
            requestsRemaining: this.requestLimit - this.requestCount,
            requestPercentage: ((this.requestCount / this.requestLimit) * 100).toFixed(1),
            cacheSize: this.cache.size,
            lastUpdate: this.collectedData.length > 0 
                ? new Date(this.collectedData[0].collectedAt).toLocaleString()
                : 'Never'
        };
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ MediaStack: Cache cleared');
    }

    /**
     * Test API connection
     */
    async testConnection() {
        try {
            const data = await this.getNews({ limit: 1 });
            return {
                success: true,
                message: 'MediaStack API connected successfully',
                articlesCount: data.data?.length || 0
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}

// Create and export singleton instance
const mediaStackService = new MediaStackService();
export default mediaStackService;
