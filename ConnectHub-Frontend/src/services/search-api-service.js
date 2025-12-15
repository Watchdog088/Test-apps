/**
 * ConnectHub Search API Service
 * Backend Integration for Search System
 * Handles search operations, indexing, and filters
 */

class SearchAPIService {
    constructor() {
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api'
            : 'https://api.connecthub.com';
        
        this.endpoints = {
            search: '/search',
            autocomplete: '/search/autocomplete',
            trending: '/search/trending',
            history: '/search/history',
            saved: '/search/saved',
            nearby: '/search/nearby',
            advanced: '/search/advanced',
            indexing: '/search/index'
        };

        // Cache for performance
        this.cache = {
            autocomplete: new Map(),
            trending: null,
            trendingTimestamp: null
        };

        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Main Search Function
     * Performs full-text search with filters
     */
    async search(query, filters = {}) {
        try {
            const params = new URLSearchParams({
                q: query,
                type: filters.type || 'all',
                location: filters.location || '',
                sortBy: filters.sortBy || 'relevance',
                radius: filters.radius || 25,
                page: filters.page || 1,
                limit: filters.limit || 20
            });

            const response = await fetch(`${this.baseURL}${this.endpoints.search}?${params}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            
            // Track search in history
            await this.addToHistory(query);

            return {
                success: true,
                results: data.results,
                total: data.total,
                page: data.page,
                hasMore: data.hasMore
            };
        } catch (error) {
            console.error('Search error:', error);
            return {
                success: false,
                error: error.message,
                results: this.getFallbackResults(query)
            };
        }
    }

    /**
     * Autocomplete Suggestions
     * Real-time search suggestions with caching
     */
    async getAutocomplete(query) {
        if (query.length < 2) return [];

        // Check cache first
        const cacheKey = query.toLowerCase();
        if (this.cache.autocomplete.has(cacheKey)) {
            const cached = this.cache.autocomplete.get(cacheKey);
            if (Date.now() - cached.timestamp < this.CACHE_DURATION) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.autocomplete}?q=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Autocomplete failed');
            }

            const data = await response.json();
            
            // Cache the results
            this.cache.autocomplete.set(cacheKey, {
                data: data.suggestions,
                timestamp: Date.now()
            });

            return data.suggestions;
        } catch (error) {
            console.error('Autocomplete error:', error);
            return [];
        }
    }

    /**
     * Trending Searches
     * Get popular search queries
     */
    async getTrending() {
        // Check cache
        if (this.cache.trending && Date.now() - this.cache.trendingTimestamp < this.CACHE_DURATION) {
            return this.cache.trending;
        }

        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.trending}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch trending searches');
            }

            const data = await response.json();
            
            // Cache the results
            this.cache.trending = data.trending;
            this.cache.trendingTimestamp = Date.now();

            return data.trending;
        } catch (error) {
            console.error('Trending searches error:', error);
            return [];
        }
    }

    /**
     * Search History Management
     */
    async getHistory() {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.history}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch search history');
            }

            const data = await response.json();
            return data.history;
        } catch (error) {
            console.error('Search history error:', error);
            return [];
        }
    }

    async addToHistory(query) {
        try {
            await fetch(`${this.baseURL}${this.endpoints.history}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ query })
            });
        } catch (error) {
            console.error('Add to history error:', error);
        }
    }

    async clearHistory() {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.history}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to clear history');
            }

            return { success: true };
        } catch (error) {
            console.error('Clear history error:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteHistoryItem(query) {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.history}/${encodeURIComponent(query)}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to delete history item');
            }

            return { success: true };
        } catch (error) {
            console.error('Delete history item error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Saved Searches
     */
    async getSavedSearches() {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.saved}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch saved searches');
            }

            const data = await response.json();
            return data.saved;
        } catch (error) {
            console.error('Saved searches error:', error);
            return [];
        }
    }

    async saveSearch(query, filters) {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.saved}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ query, filters })
            });

            if (!response.ok) {
                throw new Error('Failed to save search');
            }

            const data = await response.json();
            return { success: true, data: data.saved };
        } catch (error) {
            console.error('Save search error:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteSavedSearch(searchId) {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.saved}/${searchId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to delete saved search');
            }

            return { success: true };
        } catch (error) {
            console.error('Delete saved search error:', error);
            return { success: false, error: error.message };
        }
    }

    async toggleSearchNotifications(searchId, enabled) {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.saved}/${searchId}/notifications`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({ enabled })
            });

            if (!response.ok) {
                throw new Error('Failed to toggle notifications');
            }

            return { success: true, enabled };
        } catch (error) {
            console.error('Toggle notifications error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Location-Based Search
     */
    async searchNearby(latitude, longitude, radius = 25, filters = {}) {
        try {
            const params = new URLSearchParams({
                lat: latitude,
                lng: longitude,
                radius,
                type: filters.type || 'all'
            });

            const response = await fetch(`${this.baseURL}${this.endpoints.nearby}?${params}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Nearby search failed');
            }

            const data = await response.json();
            return {
                success: true,
                results: data.results,
                total: data.total
            };
        } catch (error) {
            console.error('Nearby search error:', error);
            return {
                success: false,
                error: error.message,
                results: { users: [], events: [], groups: [], marketplace: [], total: 0 }
            };
        }
    }

    /**
     * Advanced Search
     * Multi-criteria search with complex filters
     */
    async advancedSearch(criteria) {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.advanced}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(criteria)
            });

            if (!response.ok) {
                throw new Error('Advanced search failed');
            }

            const data = await response.json();
            return {
                success: true,
                results: data.results,
                total: data.total
            };
        } catch (error) {
            console.error('Advanced search error:', error);
            return {
                success: false,
                error: error.message,
                results: {}
            };
        }
    }

    /**
     * Search Indexing
     * Update search index for new content
     */
    async indexContent(contentType, content) {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.indexing}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    type: contentType,
                    content
                })
            });

            if (!response.ok) {
                throw new Error('Indexing failed');
            }

            return { success: true };
        } catch (error) {
            console.error('Indexing error:', error);
            return { success: false, error: error.message };
        }
    }

    async reindexAll() {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.indexing}/reindex`, {
                method: 'POST',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Reindexing failed');
            }

            return { success: true };
        } catch (error) {
            console.error('Reindexing error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Search Analytics
     */
    async getAnalytics() {
        try {
            const response = await fetch(`${this.baseURL}/search/analytics`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }

            const data = await response.json();
            return data.analytics;
        } catch (error) {
            console.error('Analytics error:', error);
            return {
                totalSearches: 0,
                uniqueSearches: 0,
                savedSearches: 0,
                trendingSearches: 0,
                avgResultsPerSearch: 0
            };
        }
    }

    /**
     * Helper Methods
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        const token = this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    getAuthToken() {
        return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    }

    /**
     * Fallback Results for Offline Mode
     */
    getFallbackResults(query) {
        // Return cached or demo results when API is unavailable
        return {
            users: [],
            posts: [],
            groups: [],
            events: [],
            marketplace: [],
            hashtags: [],
            locations: [],
            total: 0
        };
    }

    /**
     * Clear Cache
     */
    clearCache() {
        this.cache.autocomplete.clear();
        this.cache.trending = null;
        this.cache.trendingTimestamp = null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchAPIService;
}

// Initialize global instance
window.searchAPIService = new SearchAPIService();

console.log('🔍 Search API Service Initialized');
