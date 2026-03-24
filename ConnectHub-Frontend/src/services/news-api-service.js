/**
 * NewsAPI Service - Trending News Integration
 * Fetches real news articles from NewsAPI.org
 */

class NewsAPIService {
    constructor() {
        // NewsAPI key - In production, move to backend
        this.API_KEY = 'fda0b285fdbb4d27890b48951ad2d0c3';
        this.BASE_URL = 'https://newsapi.org/v2';
        this.cache = new Map();
        this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
    }

    /**
     * Get top headlines
     */
    async getTopHeadlines(options = {}) {
        const {
            country = 'us',
            category = null,
            pageSize = 20,
            page = 1
        } = options;

        const cacheKey = `headlines-${country}-${category}-${page}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            let url = `${this.BASE_URL}/top-headlines?country=${country}&pageSize=${pageSize}&page=${page}&apiKey=${this.API_KEY}`;
            
            if (category) {
                url += `&category=${category}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'ok') {
                // Cache the result
                this.cache.set(cacheKey, {
                    data: data.articles,
                    timestamp: Date.now()
                });

                return data.articles;
            } else {
                throw new Error(data.message || 'Failed to fetch news');
            }
        } catch (error) {
            console.error('NewsAPI Error:', error);
            return [];
        }
    }

    /**
     * Search news articles
     */
    async searchNews(query, options = {}) {
        const {
            sortBy = 'publishedAt',
            pageSize = 20,
            page = 1,
            language = 'en'
        } = options;

        const cacheKey = `search-${query}-${sortBy}-${page}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const url = `${this.BASE_URL}/everything?q=${encodeURIComponent(query)}&sortBy=${sortBy}&pageSize=${pageSize}&page=${page}&language=${language}&apiKey=${this.API_KEY}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'ok') {
                // Cache the result
                this.cache.set(cacheKey, {
                    data: data.articles,
                    timestamp: Date.now()
                });

                return data.articles;
            } else {
                throw new Error(data.message || 'Failed to search news');
            }
        } catch (error) {
            console.error('NewsAPI Search Error:', error);
            return [];
        }
    }

    /**
     * Get news by category
     */
    async getNewsByCategory(category, options = {}) {
        return this.getTopHeadlines({
            ...options,
            category
        });
    }

    /**
     * Get trending topics (combines multiple categories)
     */
    async getTrendingTopics() {
        const categories = ['technology', 'business', 'entertainment', 'sports'];
        const promises = categories.map(cat => 
            this.getNewsByCategory(cat, { pageSize: 5 })
        );

        try {
            const results = await Promise.all(promises);
            const allArticles = results.flat();
            
            // Sort by publish date
            return allArticles.sort((a, b) => 
                new Date(b.publishedAt) - new Date(a.publishedAt)
            );
        } catch (error) {
            console.error('Error fetching trending topics:', error);
            return [];
        }
    }

    /**
     * Convert NewsAPI article to LynkApp trending format
     */
    convertToTrendingFormat(article) {
        return {
            id: `news-${Date.now()}-${Math.random()}`,
            type: 'news',
            title: article.title,
            description: article.description,
            content: article.content,
            image: article.urlToImage,
            source: article.source.name,
            author: article.author || article.source.name,
            url: article.url,
            publishedAt: article.publishedAt,
            category: 'News',
            engagement: {
                views: Math.floor(Math.random() * 10000) + 1000,
                likes: Math.floor(Math.random() * 1000) + 100,
                comments: Math.floor(Math.random() * 100) + 10,
                shares: Math.floor(Math.random() * 500) + 50
            },
            trending: true,
            verified: true
        };
    }

    /**
     * Get formatted trending news for LynkApp
     */
    async getFormattedTrendingNews(limit = 20) {
        const articles = await this.getTopHeadlines({ pageSize: limit });
        return articles
            .filter(article => article.urlToImage) // Only articles with images
            .map(article => this.convertToTrendingFormat(article));
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get available categories
     */
    getCategories() {
        return [
            'business',
            'entertainment',
            'general',
            'health',
            'science',
            'sports',
            'technology'
        ];
    }

    /**
     * Get available countries
     */
    getCountries() {
        return {
            'us': 'United States',
            'gb': 'United Kingdom',
            'ca': 'Canada',
            'au': 'Australia',
            'in': 'India',
            'de': 'Germany',
            'fr': 'France',
            'it': 'Italy',
            'jp': 'Japan',
            'kr': 'South Korea'
        };
    }
}

// Export singleton instance
const newsAPIService = new NewsAPIService();
// export default newsAPIService;
