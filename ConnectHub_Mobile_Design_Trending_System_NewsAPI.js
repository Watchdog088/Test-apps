// ========================================
// CONNECTHUB MOBILE DESIGN - TRENDING SYSTEM WITH NEWSAPI
// Real News Integration - KEEPS EXISTING DESIGN
// ========================================

// Import NewsAPI service
import newsAPIService from './ConnectHub-Frontend/src/services/news-api-service.js';

(function() {
    'use strict';

    // ========== HYBRID DATA SOURCES ==========
    
    let hybridTrendingData = [];
    let isLoadingNews = false;
    let newsCache = null;
    let lastNewsUpdate = null;
    const NEWS_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

    // Mock user posts (to mix with news)
    const userPostsData = [
        {
            id: 'user-1',
            type: 'post',
            rank: null,
            title: 'Amazing product launch!',
            hashtag: '#ProductLaunch',
            category: 'Business',
            postCount: 1200,
            engagementRate: 6.5,
            trendingDuration: 45,
            location: 'San Francisco, CA',
            peakTime: '9:00 AM',
            relatedHashtags: ['#Startup', '#Innovation', '#Business'],
            trendingScore: 75.2,
            isFollowing: false,
            relatedPosts: []
        }
    ];

    const trendingCategories = [
        { id: 'all', name: 'All', emoji: '🔥' },
        { id: 'technology', name: 'Technology', emoji: '💻' },
        { id: 'business', name: 'Business', emoji: '💼' },
        { id: 'entertainment', name: 'Entertainment', emoji: '🎬' },
        { id: 'sports', name: 'Sports', emoji: '⚽' },
        { id: 'health', name: 'Health', emoji: '🏥' },
        { id: 'science', name: 'Science', emoji: '🔬' },
        { id: 'news', name: 'News', emoji: '📰' }
    ];

    let currentTrendingFilter = 'all';
    let currentLocationFilter = 'all';
    let followedTopics = new Set();
    let trendingNotifications = new Set();

    // ========== NEWS INTEGRATION FUNCTIONS ==========
    
    async function fetchRealNews(category = null, limit = 10) {
        if (isLoadingNews) return [];
        
        // Check cache
        if (newsCache && lastNewsUpdate && 
            Date.now() - lastNewsUpdate < NEWS_CACHE_DURATION) {
            return newsCache;
        }

        isLoadingNews = true;
        
        try {
            let newsArticles;
            
            if (category && category !== 'all') {
                newsArticles = await newsAPIService.getNewsByCategory(category, { pageSize: limit });
            } else {
                newsArticles = await newsAPIService.getFormattedTrendingNews(limit);
            }
            
            // Cache the results
            newsCache = newsArticles;
            lastNewsUpdate = Date.now();
            
            return newsArticles;
        } catch (error) {
            console.error('Error fetching news:', error);
            return [];
        } finally {
            isLoadingNews = false;
        }
    }

    function convertNewsToTrendingFormat(news, rank) {
        return {
            id: news.id || `news-${Date.now()}-${rank}`,
            type: 'news',
            rank: rank,
            title: news.title,
            hashtag: `#${news.category || 'News'}`,
            category: news.category || 'News',
            postCount: news.engagement?.views || 1000,
            engagementRate: Math.floor(Math.random() * 3) + 6, // 6-9%
            trendingDuration: Math.floor(Math.random() * 300) + 60, // 60-360 min
            location: 'Global',
            peakTime: new Date(news.publishedAt).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
            relatedHashtags: [news.hashtag, '#Breaking', '#News', `#${news.source}`],
            trendingScore: news.engagement?.likes ? (news.engagement.likes / 100) : 85,
            isFollowing: false,
            image: news.image,
            url: news.url,
            source: news.source,
            author: news.author,
            publishedAt: news.publishedAt,
            description: news.description,
            relatedPosts: [
                {
                    id: `${news.id}-comment-1`,
                    author: news.source,
                    avatar: '📰',
                    content: news.description || news.title,
                    timestamp: formatTimestamp(news.publishedAt),
                    likes: news.engagement?.likes || 100,
                    comments: news.engagement?.comments || 10
                }
            ]
        };
    }

    async function loadHybridTrendingData(category = 'all') {
        showLoadingIndicator();
        
        try {
            // Fetch real news
            const realNews = await fetchRealNews(category, 15);
            
            // Convert to trending format
            const newsTopics = realNews.map((news, index) => 
                convertNewsToTrendingFormat(news, index + 1)
            );
            
            // Mix with user posts
            const allTopics = [...newsTopics, ...userPostsData];
            
            // Sort by trending score
            allTopics.sort((a, b) => b.trendingScore - a.trendingScore);
            
            // Assign ranks
            allTopics.forEach((topic, index) => {
                topic.rank = index + 1;
            });
            
            hybridTrendingData = allTopics;
            
            hideLoadingIndicator();
            return allTopics;
            
        } catch (error) {
            console.error('Error loading hybrid trending data:', error);
            hideLoadingIndicator();
            // Return user posts only if news fails
            return userPostsData;
        }
    }

    // ========== UTILITY FUNCTIONS ==========
    
    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    function formatDuration(minutes) {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            return hours + (hours === 1 ? ' hour' : ' hours');
        }
        return minutes + (minutes === 1 ? ' minute' : ' minutes');
    }

    function formatTimestamp(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    }

    function showLoadingIndicator() {
        const container = document.querySelector('.trending-cards-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔄</div>
                    <div style="font-size: 16px; color: var(--text-secondary);">
                        Loading trending topics...
                    </div>
                </div>
            `;
        }
    }

    function hideLoadingIndicator() {
        // Loading will be replaced by content
    }

    // ========== TRENDING UI RENDERING ==========
    
    async function renderTrendingCards(filter = 'all', locationFilter = 'all') {
        // Load hybrid data
        await loadHybridTrendingData(filter);
        
        let filteredTopics = [...hybridTrendingData];
        
        if (filter !== 'all') {
            filteredTopics = filteredTopics.filter(topic => 
                topic.category.toLowerCase() === filter.toLowerCase()
            );
        }
        
        if (locationFilter !== 'all') {
            filteredTopics = filteredTopics.filter(topic => 
                topic.location.includes(locationFilter) || topic.location === 'Global'
            );
        }
        
        const trendingScreen = document.getElementById('trending-screen');
        if (!trendingScreen) return;
        
        let container = trendingScreen.querySelector('.trending-cards-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'trending-cards-container';
            container.style.marginTop = '16px';
            
            const filters = trendingScreen.querySelector('.trending-filters');
            if (filters) {
                filters.after(container);
            }
        }
        
        container.innerHTML = filteredTopics.map(topic => `
            <div class="trending-card ${topic.type === 'news' ? 'news-card' : ''}" 
                 onclick="window.trendingSystemNews.openTrendingDetails(${topic.id})" 
                 style="cursor: pointer; margin-bottom: 16px; ${topic.image ? `background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${topic.image}'); background-size: cover; background-position: center;` : ''}">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div class="trending-tag">#${topic.rank} TRENDING ${topic.type === 'news' ? '📰' : ''}</div>
                    <button class="nav-btn" onclick="event.stopPropagation(); window.trendingSystemNews.toggleFollowTopic(${topic.id})" style="width: 32px; height: 32px;">
                        ${followedTopics.has(topic.id) ? '⭐' : '☆'}
                    </button>
                </div>
                <div class="trending-title" style="${topic.image ? 'text-shadow: 0 2px 4px rgba(0,0,0,0.8);' : ''}">${topic.title}</div>
                ${topic.description ? `<div style="font-size: 13px; color: var(--text-secondary); margin: 8px 0; ${topic.image ? 'text-shadow: 0 1px 2px rgba(0,0,0,0.8);' : ''}">${topic.description.substring(0, 120)}...</div>` : ''}
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; ${topic.image ? 'text-shadow: 0 1px 2px rgba(0,0,0,0.8);' : ''}">
                    ${topic.hashtag} • ${topic.category}${topic.source ? ` • ${topic.source}` : ''}
                </div>
                <div class="trending-stats" style="${topic.image ? 'text-shadow: 0 1px 2px rgba(0,0,0,0.8);' : ''}">${formatNumber(topic.postCount)} ${topic.type === 'news' ? 'views' : 'posts'} • ${formatTimestamp(topic.publishedAt || new Date())}</div>
                ${topic.type === 'news' ? `
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <button class="btn" onclick="event.stopPropagation(); window.open('${topic.url}', '_blank')" style="width: 100%; padding: 10px; font-size: 13px;">
                            Read Full Article →
                        </button>
                    </div>
                ` : ''}
                <div class="post-actions" style="border-top: 1px solid var(--glass-border); margin-top: 12px;">
                    <div class="post-action" onclick="event.stopPropagation(); window.trendingSystemNews.likeTrendingTopic(${topic.id}, this)">
                        <span>👍</span> Like
                    </div>
                    <div class="post-action" onclick="event.stopPropagation(); window.trendingSystemNews.commentOnTrending(${topic.id})">
                        <span>💬</span> Comment
                    </div>
                    <div class="post-action" onclick="event.stopPropagation(); window.trendingSystemNews.shareTrendingTopic(${topic.id})">
                        <span>🔄</span> Share
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderTrendingFilters() {
        const trendingScreen = document.getElementById('trending-screen');
        if (!trendingScreen) return;
        
        const header = trendingScreen.querySelector('.section-header');
        if (!header) return;
        
        let filtersContainer = trendingScreen.querySelector('.trending-filters');
        if (!filtersContainer) {
            filtersContainer = document.createElement('div');
            filtersContainer.className = 'trending-filters';
            header.after(filtersContainer);
        }
        
        filtersContainer.innerHTML = `
            <div style="display: flex; gap: 8px; overflow-x: auto; padding: 12px 0;">
                ${trendingCategories.map(cat => `
                    <div class="pill-nav-button ${cat.id === currentTrendingFilter ? 'active' : ''}" 
                         onclick="window.trendingSystemNews.filterByCategory('${cat.id}')"
                         style="flex-shrink: 0;">
                        ${cat.emoji} ${cat.name}
                    </div>
                `).join('')}
            </div>
            <div style="display: flex; gap: 8px; padding: 12px 0;">
                <button class="btn" style="width: auto; padding: 10px 16px; font-size: 13px;" onclick="window.trendingSystemNews.refreshTrending()">
                    🔄 Refresh News
                </button>
                <button class="btn" style="width: auto; padding: 10px 16px; font-size: 13px; background: var(--glass);" onclick="window.trendingSystemNews.clearNewsCache()">
                    🗑️ Clear Cache
                </button>
            </div>
        `;
    }

    async function filterByCategory(category) {
        currentTrendingFilter = category;
        renderTrendingFilters();
        await renderTrendingCards(category, currentLocationFilter);
        
        const categoryName = trendingCategories.find(c => c.id === category)?.name || 'All';
        if (typeof showToast === 'function') {
            showToast(`Showing: ${categoryName}`);
        }
    }

    // Continue with other functions...
    // (Due to length, I'll create the rest in the next message)

    // ========== PUBLIC API ==========
    
    window.trendingSystemNews = {
        initialize: async () => {
            renderTrendingFilters();
            await renderTrendingCards();
            console.log('✓ Trending System with NewsAPI initialized');
        },
        filterByCategory,
        refreshTrending: async () => {
            newsCache = null;
            lastNewsUpdate = null;
            if (typeof showToast === 'function') {
                showToast('Refreshing news... 🔄');
            }
            await renderTrendingCards(currentTrendingFilter, currentLocationFilter);
            if (typeof showToast === 'function') {
                showToast('News updated! ✓');
            }
        },
        clearNewsCache: () => {
            newsCache = null;
            lastNewsUpdate = null;
            if (typeof showToast === 'function') {
                showToast('Cache cleared! 🗑️');
            }
        },
        toggleFollowTopic: (topicId) => {
            // Implementation continues...
        },
        likeTrendingTopic: (topicId, element) => {
            if (element) {
                element.classList.toggle('active');
                const icon = element.querySelector('span');
                if (element.classList.contains('active')) {
                    icon.textContent = '❤️';
                }
            }
        },
        commentOnTrending: (topicId) => {
            if (typeof showToast === 'function') {
                showToast('Comments coming soon!');
            }
        },
        shareTrendingTopic: (topicId) => {
            if (typeof showToast === 'function') {
                showToast('Shared!');
            }
        },
        openTrendingDetails: (topicId) => {
            if (typeof showToast === 'function') {
                showToast('Opening details...');
            }
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.trendingSystemNews.initialize());
    } else {
        window.trendingSystemNews.initialize();
    }

})();

console.log('✓ ConnectHub Trending System with NewsAPI loaded');
