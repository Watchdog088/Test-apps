/**
 * ConnectHub - Search & Discovery Streaming UI Components
 * Advanced streaming-focused search and discovery interfaces
 * 
 * Components Included:
 * 1. Live Stream Search & Discovery Interface
 * 2. Content Recommendation Engine UI
 * 3. Trending Streams & Analytics Dashboard
 */

class SearchDiscoveryStreamingComponents {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {
            en: {
                // Live Stream Search Interface
                liveStreamSearch: 'Live Stream Search',
                searchStreams: 'Search Live Streams',
                searchPlaceholder: 'Search streams, categories, streamers...',
                filters: 'Filters',
                category: 'Category',
                viewerCount: 'Viewer Count',
                streamQuality: 'Stream Quality',
                language: 'Language',
                sortBy: 'Sort By',
                relevance: 'Relevance',
                viewers: 'Viewers',
                recent: 'Most Recent',
                duration: 'Duration',
                applyFilters: 'Apply Filters',
                clearFilters: 'Clear Filters',
                liveNow: 'Live Now',
                watching: 'watching',
                
                // Content Recommendations
                contentRecommendations: 'Content Recommendations',
                recommendedStreams: 'Recommended Streams',
                basedOnHistory: 'Based on your viewing history',
                basedOnFollows: 'Based on who you follow',
                trending: 'Trending',
                newStreamers: 'New Streamers to Follow',
                similarContent: 'Similar Content',
                personalizedFeed: 'Your Personalized Feed',
                refreshRecommendations: 'Refresh Recommendations',
                exploreMore: 'Explore More',
                followStreamer: 'Follow Streamer',
                unfollowStreamer: 'Unfollow Streamer',
                
                // Trending Analytics
                trendingAnalytics: 'Trending Streams Analytics',
                topCategories: 'Top Categories',
                risingStreamers: 'Rising Streamers',
                peakViewingHours: 'Peak Viewing Hours',
                globalTrends: 'Global Trends',
                regionalTrends: 'Regional Trends',
                categoryGrowth: 'Category Growth',
                viewershipStats: 'Viewership Statistics',
                engagementMetrics: 'Engagement Metrics',
                discoverTrends: 'Discover Trends',
                viewDetails: 'View Details',
                
                // Common UI Elements
                close: 'Close',
                save: 'Save',
                cancel: 'Cancel',
                loading: 'Loading...',
                error: 'Error occurred',
                noResults: 'No results found',
                viewStream: 'View Stream',
                shareStream: 'Share Stream',
                reportStream: 'Report Stream',
                addToWatchlist: 'Add to Watchlist',
                removeFromWatchlist: 'Remove from Watchlist'
            }
        };
        
        this.streamCategories = [
            'Gaming', 'Music', 'Art', 'Talk Shows', 'Education', 
            'Sports', 'Technology', 'Food & Cooking', 'Travel', 'Fitness'
        ];
        
        this.streamQualities = ['4K', '1080p', '720p', '480p', 'Audio Only'];
        this.streamLanguages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Portuguese'];
        
        this.mockStreams = this.generateMockStreams();
        this.mockRecommendations = this.generateMockRecommendations();
        this.mockTrendingData = this.generateMockTrendingData();
        
        this.initializeComponents();
    }

    // Utility method for translations
    t(key) {
        return this.translations[this.currentLanguage]?.[key] || key;
    }

    generateMockStreams() {
        const streamers = [
            'TechGuru_2024', 'GameMaster_Pro', 'MusicVibes_Live', 'ArtCreator_Studio',
            'CookingWithLove', 'FitnessChampion', 'TravelExplorer', 'EduStream_Academy'
        ];
        
        return Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            title: `${this.streamCategories[i % this.streamCategories.length]} Stream ${i + 1}`,
            streamer: streamers[i % streamers.length],
            category: this.streamCategories[i % this.streamCategories.length],
            viewers: Math.floor(Math.random() * 10000) + 100,
            quality: this.streamQualities[i % this.streamQualities.length],
            language: this.streamLanguages[i % this.streamLanguages.length],
            duration: Math.floor(Math.random() * 300) + 30, // minutes
            thumbnail: `https://picsum.photos/320/180?random=${i}`,
            isLive: Math.random() > 0.3,
            tags: ['Interactive', 'HD', 'Chat Enabled'],
            description: `Live ${this.streamCategories[i % this.streamCategories.length]} content with interactive chat and high quality streaming.`
        }));
    }

    generateMockRecommendations() {
        return {
            basedOnHistory: this.mockStreams.slice(0, 6),
            basedOnFollows: this.mockStreams.slice(6, 12),
            trending: this.mockStreams.slice(12, 18),
            newStreamers: this.mockStreams.slice(18, 24),
            similarContent: this.mockStreams.slice(24, 30)
        };
    }

    generateMockTrendingData() {
        return {
            topCategories: [
                { name: 'Gaming', viewers: 45000, growth: '+12%' },
                { name: 'Music', viewers: 32000, growth: '+8%' },
                { name: 'Art', viewers: 18000, growth: '+15%' },
                { name: 'Education', viewers: 15000, growth: '+20%' },
                { name: 'Technology', viewers: 12000, growth: '+5%' }
            ],
            risingStreamers: [
                { name: 'NewGamer_2024', followers: 5000, growth: '+45%' },
                { name: 'ArtMaster_Live', followers: 3200, growth: '+38%' },
                { name: 'TechReview_Pro', followers: 4100, growth: '+42%' },
                { name: 'MusicCreator_X', followers: 2800, growth: '+51%' }
            ],
            peakHours: [
                { hour: '18:00', viewers: 75000 },
                { hour: '19:00', viewers: 82000 },
                { hour: '20:00', viewers: 95000 },
                { hour: '21:00', viewers: 88000 },
                { hour: '22:00', viewers: 70000 }
            ]
        };
    }

    initializeComponents() {
        this.createLiveStreamSearchInterface();
        this.createContentRecommendationsInterface();
        this.createTrendingAnalyticsInterface();
        this.attachEventListeners();
    }

    // 1. LIVE STREAM SEARCH & DISCOVERY INTERFACE
    createLiveStreamSearchInterface() {
        const searchInterface = document.createElement('div');
        searchInterface.id = 'live-stream-search-interface';
        searchInterface.className = 'streaming-interface hidden';
        searchInterface.innerHTML = `
            <div class="streaming-overlay">
                <div class="streaming-modal live-stream-search-modal">
                    <div class="streaming-header">
                        <h2>${this.t('liveStreamSearch')}</h2>
                        <button class="close-btn" data-close="live-stream-search">&times;</button>
                    </div>
                    
                    <div class="streaming-content">
                        <!-- Search Bar -->
                        <div class="search-section">
                            <div class="search-input-container">
                                <input type="text" id="stream-search-input" placeholder="${this.t('searchPlaceholder')}" />
                                <button id="search-streams-btn" class="search-btn">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Filters Section -->
                        <div class="filters-section">
                            <div class="filters-toggle">
                                <button id="toggle-filters-btn" class="filters-toggle-btn">
                                    <i class="fas fa-filter"></i> ${this.t('filters')}
                                </button>
                            </div>
                            
                            <div id="filters-panel" class="filters-panel hidden">
                                <div class="filter-grid">
                                    <div class="filter-group">
                                        <label>${this.t('category')}</label>
                                        <select id="category-filter">
                                            <option value="">All Categories</option>
                                            ${this.streamCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                        </select>
                                    </div>
                                    
                                    <div class="filter-group">
                                        <label>${this.t('viewerCount')}</label>
                                        <select id="viewer-filter">
                                            <option value="">Any</option>
                                            <option value="small">1-100</option>
                                            <option value="medium">101-1000</option>
                                            <option value="large">1000+</option>
                                        </select>
                                    </div>
                                    
                                    <div class="filter-group">
                                        <label>${this.t('streamQuality')}</label>
                                        <select id="quality-filter">
                                            <option value="">Any Quality</option>
                                            ${this.streamQualities.map(quality => `<option value="${quality}">${quality}</option>`).join('')}
                                        </select>
                                    </div>
                                    
                                    <div class="filter-group">
                                        <label>${this.t('language')}</label>
                                        <select id="language-filter">
                                            <option value="">Any Language</option>
                                            ${this.streamLanguages.map(lang => `<option value="${lang}">${lang}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="sort-section">
                                    <label>${this.t('sortBy')}</label>
                                    <select id="sort-filter">
                                        <option value="relevance">${this.t('relevance')}</option>
                                        <option value="viewers">${this.t('viewers')}</option>
                                        <option value="recent">${this.t('recent')}</option>
                                        <option value="duration">${this.t('duration')}</option>
                                    </select>
                                </div>
                                
                                <div class="filter-actions">
                                    <button id="apply-filters-btn" class="apply-filters-btn">${this.t('applyFilters')}</button>
                                    <button id="clear-filters-btn" class="clear-filters-btn">${this.t('clearFilters')}</button>
                                </div>
                            </div>
                        </div>

                        <!-- Search Results -->
                        <div class="search-results-section">
                            <div id="search-results-grid" class="search-results-grid">
                                ${this.renderStreamResults(this.mockStreams.slice(0, 12))}
                            </div>
                            
                            <div id="search-loading" class="search-loading hidden">
                                <div class="loading-spinner"></div>
                                <p>${this.t('loading')}</p>
                            </div>
                            
                            <div id="no-results" class="no-results hidden">
                                <i class="fas fa-search"></i>
                                <p>${this.t('noResults')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(searchInterface);
    }

    renderStreamResults(streams) {
        return streams.map(stream => `
            <div class="stream-card" data-stream-id="${stream.id}">
                <div class="stream-thumbnail">
                    <img src="${stream.thumbnail}" alt="${stream.title}" />
                    ${stream.isLive ? `<span class="live-badge">${this.t('liveNow')}</span>` : ''}
                    <span class="duration-badge">${Math.floor(stream.duration / 60)}h ${stream.duration % 60}m</span>
                </div>
                
                <div class="stream-info">
                    <h4 class="stream-title">${stream.title}</h4>
                    <p class="stream-streamer">${stream.streamer}</p>
                    <div class="stream-meta">
                        <span class="stream-category">${stream.category}</span>
                        <span class="stream-viewers">${stream.viewers.toLocaleString()} ${this.t('watching')}</span>
                        <span class="stream-quality">${stream.quality}</span>
                    </div>
                    <div class="stream-tags">
                        ${stream.tags.map(tag => `<span class="stream-tag">${tag}</span>`).join('')}
                    </div>
                </div>
                
                <div class="stream-actions">
                    <button class="view-stream-btn" data-stream-id="${stream.id}">
                        <i class="fas fa-play"></i> ${this.t('viewStream')}
                    </button>
                    <button class="add-watchlist-btn" data-stream-id="${stream.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="share-stream-btn" data-stream-id="${stream.id}">
                        <i class="fas fa-share"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 2. CONTENT RECOMMENDATION ENGINE UI
    createContentRecommendationsInterface() {
        const recommendationsInterface = document.createElement('div');
        recommendationsInterface.id = 'content-recommendations-interface';
        recommendationsInterface.className = 'streaming-interface hidden';
        recommendationsInterface.innerHTML = `
            <div class="streaming-overlay">
                <div class="streaming-modal content-recommendations-modal">
                    <div class="streaming-header">
                        <h2>${this.t('contentRecommendations')}</h2>
                        <button class="close-btn" data-close="content-recommendations">&times;</button>
                    </div>
                    
                    <div class="streaming-content">
                        <div class="recommendations-tabs">
                            <button class="tab-btn active" data-tab="history">${this.t('basedOnHistory')}</button>
                            <button class="tab-btn" data-tab="follows">${this.t('basedOnFollows')}</button>
                            <button class="tab-btn" data-tab="trending">${this.t('trending')}</button>
                            <button class="tab-btn" data-tab="new">${this.t('newStreamers')}</button>
                            <button class="tab-btn" data-tab="similar">${this.t('similarContent')}</button>
                        </div>

                        <div class="recommendations-content">
                            <div id="tab-history" class="tab-content active">
                                <h3>${this.t('recommendedStreams')}</h3>
                                <div class="recommendations-grid">
                                    ${this.renderRecommendationCards(this.mockRecommendations.basedOnHistory)}
                                </div>
                            </div>
                            
                            <div id="tab-follows" class="tab-content">
                                <h3>${this.t('basedOnFollows')}</h3>
                                <div class="recommendations-grid">
                                    ${this.renderRecommendationCards(this.mockRecommendations.basedOnFollows)}
                                </div>
                            </div>
                            
                            <div id="tab-trending" class="tab-content">
                                <h3>${this.t('trending')}</h3>
                                <div class="recommendations-grid">
                                    ${this.renderRecommendationCards(this.mockRecommendations.trending)}
                                </div>
                            </div>
                            
                            <div id="tab-new" class="tab-content">
                                <h3>${this.t('newStreamers')}</h3>
                                <div class="recommendations-grid">
                                    ${this.renderRecommendationCards(this.mockRecommendations.newStreamers)}
                                </div>
                            </div>
                            
                            <div id="tab-similar" class="tab-content">
                                <h3>${this.t('similarContent')}</h3>
                                <div class="recommendations-grid">
                                    ${this.renderRecommendationCards(this.mockRecommendations.similarContent)}
                                </div>
                            </div>
                        </div>

                        <div class="recommendations-actions">
                            <button id="refresh-recommendations-btn" class="refresh-btn">
                                <i class="fas fa-sync-alt"></i> ${this.t('refreshRecommendations')}
                            </button>
                            <button id="explore-more-btn" class="explore-btn">
                                <i class="fas fa-compass"></i> ${this.t('exploreMore')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(recommendationsInterface);
    }

    renderRecommendationCards(streams) {
        return streams.map(stream => `
            <div class="recommendation-card" data-stream-id="${stream.id}">
                <div class="recommendation-thumbnail">
                    <img src="${stream.thumbnail}" alt="${stream.title}" />
                    ${stream.isLive ? `<span class="live-indicator"></span>` : ''}
                </div>
                
                <div class="recommendation-info">
                    <h4 class="recommendation-title">${stream.title}</h4>
                    <p class="recommendation-streamer">${stream.streamer}</p>
                    <div class="recommendation-meta">
                        <span class="recommendation-category">${stream.category}</span>
                        <span class="recommendation-viewers">${stream.viewers.toLocaleString()}</span>
                    </div>
                    <p class="recommendation-description">${stream.description}</p>
                </div>
                
                <div class="recommendation-actions">
                    <button class="watch-now-btn" data-stream-id="${stream.id}">
                        <i class="fas fa-play"></i> Watch Now
                    </button>
                    <button class="follow-streamer-btn" data-streamer="${stream.streamer}">
                        <i class="fas fa-heart"></i> ${this.t('followStreamer')}
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 3. TRENDING STREAMS & ANALYTICS DASHBOARD
    createTrendingAnalyticsInterface() {
        const trendingInterface = document.createElement('div');
        trendingInterface.id = 'trending-analytics-interface';
        trendingInterface.className = 'streaming-interface hidden';
        trendingInterface.innerHTML = `
            <div class="streaming-overlay">
                <div class="streaming-modal trending-analytics-modal">
                    <div class="streaming-header">
                        <h2>${this.t('trendingAnalytics')}</h2>
                        <button class="close-btn" data-close="trending-analytics">&times;</button>
                    </div>
                    
                    <div class="streaming-content">
                        <div class="analytics-tabs">
                            <button class="analytics-tab active" data-analytics-tab="categories">${this.t('topCategories')}</button>
                            <button class="analytics-tab" data-analytics-tab="streamers">${this.t('risingStreamers')}</button>
                            <button class="analytics-tab" data-analytics-tab="hours">${this.t('peakViewingHours')}</button>
                            <button class="analytics-tab" data-analytics-tab="global">${this.t('globalTrends')}</button>
                        </div>

                        <div class="analytics-content">
                            <!-- Top Categories Tab -->
                            <div id="analytics-categories" class="analytics-tab-content active">
                                <div class="analytics-header">
                                    <h3>${this.t('topCategories')}</h3>
                                    <div class="analytics-controls">
                                        <select id="categories-timeframe">
                                            <option value="24h">Last 24 Hours</option>
                                            <option value="7d">Last 7 Days</option>
                                            <option value="30d">Last 30 Days</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="categories-grid">
                                    ${this.renderTopCategories()}
                                </div>
                            </div>

                            <!-- Rising Streamers Tab -->
                            <div id="analytics-streamers" class="analytics-tab-content">
                                <div class="analytics-header">
                                    <h3>${this.t('risingStreamers')}</h3>
                                    <div class="analytics-controls">
                                        <select id="streamers-timeframe">
                                            <option value="24h">Last 24 Hours</option>
                                            <option value="7d">Last 7 Days</option>
                                            <option value="30d">Last 30 Days</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="streamers-list">
                                    ${this.renderRisingStreamers()}
                                </div>
                            </div>

                            <!-- Peak Hours Tab -->
                            <div id="analytics-hours" class="analytics-tab-content">
                                <div class="analytics-header">
                                    <h3>${this.t('peakViewingHours')}</h3>
                                </div>
                                
                                <div class="hours-chart-container">
                                    <canvas id="peak-hours-chart" width="600" height="300"></canvas>
                                </div>
                                
                                <div class="hours-stats">
                                    ${this.renderPeakHoursStats()}
                                </div>
                            </div>

                            <!-- Global Trends Tab -->
                            <div id="analytics-global" class="analytics-tab-content">
                                <div class="analytics-header">
                                    <h3>${this.t('globalTrends')}</h3>
                                </div>
                                
                                <div class="global-trends-grid">
                                    <div class="trend-card">
                                        <h4>${this.t('viewershipStats')}</h4>
                                        <div class="stat-item">
                                            <span class="stat-label">Total Active Viewers</span>
                                            <span class="stat-value">2.4M</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Peak Concurrent</span>
                                            <span class="stat-value">95K</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Average Session</span>
                                            <span class="stat-value">42 min</span>
                                        </div>
                                    </div>
                                    
                                    <div class="trend-card">
                                        <h4>${this.t('engagementMetrics')}</h4>
                                        <div class="stat-item">
                                            <span class="stat-label">Messages/Hour</span>
                                            <span class="stat-value">1.2M</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Active Chatters</span>
                                            <span class="stat-value">180K</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">New Follows</span>
                                            <span class="stat-value">15.2K</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="analytics-actions">
                            <button id="discover-trends-btn" class="discover-trends-btn">
                                <i class="fas fa-chart-line"></i> ${this.t('discoverTrends')}
                            </button>
                            <button id="export-data-btn" class="export-data-btn">
                                <i class="fas fa-download"></i> Export Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(trendingInterface);
        this.initializePeakHoursChart();
    }

    renderTopCategories() {
        return this.mockTrendingData.topCategories.map((category, index) => `
            <div class="category-item" data-category="${category.name}">
                <div class="category-rank">#${index + 1}</div>
                <div class="category-info">
                    <h4 class="category-name">${category.name}</h4>
                    <div class="category-stats">
                        <span class="category-viewers">${category.viewers.toLocaleString()} viewers</span>
                        <span class="category-growth ${category.growth.includes('+') ? 'positive' : 'negative'}">${category.growth}</span>
                    </div>
                </div>
                <div class="category-actions">
                    <button class="view-category-btn" data-category="${category.name}">
                        <i class="fas fa-eye"></i> ${this.t('viewDetails')}
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderRisingStreamers() {
        return this.mockTrendingData.risingStreamers.map((streamer, index) => `
            <div class="streamer-item" data-streamer="${streamer.name}">
                <div class="streamer-rank">#${index + 1}</div>
                <div class="streamer-avatar">
                    <img src="https://picsum.photos/50/50?random=${index + 100}" alt="${streamer.name}" />
                </div>
                <div class="streamer-info">
                    <h4 class="streamer-name">${streamer.name}</h4>
                    <div class="streamer-stats">
                        <span class="streamer-followers">${streamer.followers.toLocaleString()} followers</span>
                        <span class="streamer-growth positive">${streamer.growth}</span>
                    </div>
                </div>
                <div class="streamer-actions">
                    <button class="follow-btn" data-streamer="${streamer.name}">
                        <i class="fas fa-heart"></i> Follow
                    </button>
                    <button class="view-profile-btn" data-streamer="${streamer.name}">
                        <i class="fas fa-user"></i> Profile
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderPeakHoursStats() {
        return this.mockTrendingData.peakHours.map(hour => `
            <div class="hour-stat-item">
                <span class="hour-time">${hour.hour}</span>
                <span class="hour-viewers">${hour.viewers.toLocaleString()}</span>
            </div>
        `).join('');
    }

    initializePeakHoursChart() {
        // Simplified chart rendering - in a real app, you'd use Chart.js or similar
        setTimeout(() => {
            const canvas = document.getElementById('peak-hours-chart');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                const data = this.mockTrendingData.peakHours;
                
                // Simple bar chart representation
                ctx.fillStyle = '#007bff';
                const barWidth = canvas.width / data.length;
                const maxViewers = Math.max(...data.map(d => d.viewers));
                
                data.forEach((item, index) => {
                    const barHeight = (item.viewers / maxViewers) * (canvas.height - 50);
                    const x = index * barWidth + 10;
                    const y = canvas.height - barHeight - 20;
                    
                    ctx.fillRect(x, y, barWidth - 20, barHeight);
                    ctx.fillStyle = '#333';
                    ctx.font = '12px Arial';
                    ctx.fillText(item.hour, x + 5, canvas.height - 5);
                    ctx.fillStyle = '#007bff';
                });
            }
        }, 100);
    }

    attachEventListeners() {
        // Live Stream Search Interface Events
        this.attachLiveStreamSearchEvents();
        
        // Content Recommendations Interface Events
        this.attachRecommendationsEvents();
        
        // Trending Analytics Interface Events
        this.attachTrendingAnalyticsEvents();
        
        // Global Events
        this.attachGlobalEvents();
    }

    attachLiveStreamSearchEvents() {
        // Search functionality
        const searchInput = document.getElementById('stream-search-input');
        const searchBtn = document.getElementById('search-streams-btn');
        const filtersToggle = document.getElementById('toggle-filters-btn');
        const filtersPanel = document.getElementById('filters-panel');
        const applyFiltersBtn = document.getElementById('apply-filters-btn');
        const clearFiltersBtn = document.getElementById('clear-filters-btn');

        if (searchInput && searchBtn) {
            const performSearch = () => {
                const query = searchInput.value.trim();
                this.searchStreams(query);
            };

            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') performSearch();
            });
        }

        if (filtersToggle && filtersPanel) {
            filtersToggle.addEventListener('click', () => {
                filtersPanel.classList.toggle('hidden');
            });
        }

        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.applySearchFilters();
            });
        }

        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearSearchFilters();
            });
        }

        // Stream card interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-stream-btn')) {
                const streamId = e.target.closest('.view-stream-btn').dataset.streamId;
                this.viewStream(streamId);
            }
            
            if (e.target.closest('.add-watchlist-btn')) {
                const streamId = e.target.closest('.add-watchlist-btn').dataset.streamId;
                this.toggleWatchlist(streamId, e.target.closest('.add-watchlist-btn'));
            }
            
            if (e.target.closest('.share-stream-btn')) {
                const streamId = e.target.closest('.share-stream-btn').dataset.streamId;
                this.shareStream(streamId);
            }
        });
    }

    attachRecommendationsEvents() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchRecommendationsTab(tab, btn);
            });
        });

        // Refresh recommendations
        const refreshBtn = document.getElementById('refresh-recommendations-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshRecommendations();
            });
        }

        // Explore more
        const exploreBtn = document.getElementById('explore-more-btn');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                this.exploreMoreContent();
            });
        }

        // Recommendation card interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.watch-now-btn')) {
                const streamId = e.target.closest('.watch-now-btn').dataset.streamId;
                this.watchStream(streamId);
            }
            
            if (e.target.closest('.follow-streamer-btn')) {
                const streamer = e.target.closest('.follow-streamer-btn').dataset.streamer;
                this.toggleFollowStreamer(streamer, e.target.closest('.follow-streamer-btn'));
            }
        });
    }

    attachTrendingAnalyticsEvents() {
        // Analytics tab switching
        const analyticsTabButtons = document.querySelectorAll('.analytics-tab');
        analyticsTabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.analyticsTab;
                this.switchAnalyticsTab(tab, btn);
            });
        });

        // Timeframe changes
        const timeframeSelectors = ['categories-timeframe', 'streamers-timeframe'];
        timeframeSelectors.forEach(selectorId => {
            const selector = document.getElementById(selectorId);
            if (selector) {
                selector.addEventListener('change', () => {
                    this.updateAnalyticsTimeframe(selectorId, selector.value);
                });
            }
        });

        // Discover trends
        const discoverBtn = document.getElementById('discover-trends-btn');
        if (discoverBtn) {
            discoverBtn.addEventListener('click', () => {
                this.discoverTrends();
            });
        }

        // Export data
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportAnalyticsData();
            });
        }

        // Category and streamer interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-category-btn')) {
                const category = e.target.closest('.view-category-btn').dataset.category;
                this.viewCategoryDetails(category);
            }
            
            if (e.target.closest('.follow-btn')) {
                const streamer = e.target.closest('.follow-btn').dataset.streamer;
                this.followStreamer(streamer, e.target.closest('.follow-btn'));
            }
            
            if (e.target.closest('.view-profile-btn')) {
                const streamer = e.target.closest('.view-profile-btn').dataset.streamer;
                this.viewStreamerProfile(streamer);
            }
        });
    }

    attachGlobalEvents() {
        // Close button events
        document.addEventListener('click', (e) => {
            if (e.target.dataset.close) {
                this.closeInterface(e.target.dataset.close);
            }
        });

        // Overlay click to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('streaming-overlay')) {
                const interfaceId = e.target.closest('.streaming-interface').id;
                this.closeInterface(interfaceId.replace('-interface', '').replace('live-stream-', '').replace('content-', '').replace('trending-', ''));
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const visibleInterface = document.querySelector('.streaming-interface:not(.hidden)');
                if (visibleInterface) {
                    const interfaceType = visibleInterface.id.replace('-interface', '').replace('live-stream-', '').replace('content-', '').replace('trending-', '');
                    this.closeInterface(interfaceType);
                }
            }
        });
    }

    // Search Methods
    searchStreams(query) {
        const loadingElement = document.getElementById('search-loading');
        const resultsGrid = document.getElementById('search-results-grid');
        const noResultsElement = document.getElementById('no-results');

        // Show loading
        if (loadingElement) loadingElement.classList.remove('hidden');
        if (resultsGrid) resultsGrid.classList.add('hidden');
        if (noResultsElement) noResultsElement.classList.add('hidden');

        // Simulate search delay
        setTimeout(() => {
            let filteredStreams = this.mockStreams;

            if (query) {
                filteredStreams = this.mockStreams.filter(stream => 
                    stream.title.toLowerCase().includes(query.toLowerCase()) ||
                    stream.streamer.toLowerCase().includes(query.toLowerCase()) ||
                    stream.category.toLowerCase().includes(query.toLowerCase())
                );
            }

            // Apply current filters
            filteredStreams = this.applyCurrentFilters(filteredStreams);

            // Hide loading
            if (loadingElement) loadingElement.classList.add('hidden');

            if (filteredStreams.length > 0) {
                if (resultsGrid) {
                    resultsGrid.innerHTML = this.renderStreamResults(filteredStreams.slice(0, 20));
                    resultsGrid.classList.remove('hidden');
                }
            } else {
                if (noResultsElement) noResultsElement.classList.remove('hidden');
            }
        }, 1000);
    }

    applyCurrentFilters(streams) {
        const categoryFilter = document.getElementById('category-filter')?.value;
        const viewerFilter = document.getElementById('viewer-filter')?.value;
        const qualityFilter = document.getElementById('quality-filter')?.value;
        const languageFilter = document.getElementById('language-filter')?.value;
        const sortFilter = document.getElementById('sort-filter')?.value || 'relevance';

        let filtered = [...streams];

        // Apply filters
        if (categoryFilter) {
            filtered = filtered.filter(stream => stream.category === categoryFilter);
        }
        
        if (viewerFilter) {
            switch (viewerFilter) {
                case 'small':
                    filtered = filtered.filter(stream => stream.viewers <= 100);
                    break;
                case 'medium':
                    filtered = filtered.filter(stream => stream.viewers > 100 && stream.viewers <= 1000);
                    break;
                case 'large':
                    filtered = filtered.filter(stream => stream.viewers > 1000);
                    break;
            }
        }
        
        if (qualityFilter) {
            filtered = filtered.filter(stream => stream.quality === qualityFilter);
        }
        
        if (languageFilter) {
            filtered = filtered.filter(stream => stream.language === languageFilter);
        }

        // Apply sorting
        switch (sortFilter) {
            case 'viewers':
                filtered.sort((a, b) => b.viewers - a.viewers);
                break;
            case 'recent':
                filtered.sort((a, b) => b.id - a.id);
                break;
            case 'duration':
                filtered.sort((a, b) => b.duration - a.duration);
                break;
            default: // relevance
                // Keep current order
                break;
        }

        return filtered;
    }

    applySearchFilters() {
        const searchInput = document.getElementById('stream-search-input');
        const query = searchInput?.value || '';
        this.searchStreams(query);
    }

    clearSearchFilters() {
        ['category-filter', 'viewer-filter', 'quality-filter', 'language-filter', 'sort-filter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
        
        this.applySearchFilters();
    }

    // Recommendations Methods
    switchRecommendationsTab(tab, button) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        const tabContent = document.getElementById(`tab-${tab}`);
        if (tabContent) tabContent.classList.add('active');
    }

    refreshRecommendations() {
        // Simulate refreshing recommendations
        console.log('Refreshing recommendations...');
        // In a real app, this would fetch new recommendations from the API
    }

    exploreMoreContent() {
        console.log('Exploring more content...');
        // In a real app, this would navigate to a broader content discovery page
    }

    // Analytics Methods
    switchAnalyticsTab(tab, button) {
        // Update active tab button
        document.querySelectorAll('.analytics-tab').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Update active tab content
        document.querySelectorAll('.analytics-tab-content').forEach(content => content.classList.remove('active'));
        const tabContent = document.getElementById(`analytics-${tab}`);
        if (tabContent) tabContent.classList.add('active');

        // Redraw chart if switching to hours tab
        if (tab === 'hours') {
            setTimeout(() => this.initializePeakHoursChart(), 100);
        }
    }

    updateAnalyticsTimeframe(selectorId, timeframe) {
        console.log(`Updating ${selectorId} to ${timeframe}`);
        // In a real app, this would fetch new data based on the timeframe
    }

    discoverTrends() {
        console.log('Discovering trends...');
        // In a real app, this would navigate to a trends discovery page
    }

    exportAnalyticsData() {
        console.log('Exporting analytics data...');
        // In a real app, this would generate and download analytics data
    }

    // Stream Interaction Methods
    viewStream(streamId) {
        console.log(`Viewing stream ${streamId}`);
        // In a real app, this would navigate to the stream page
    }

    watchStream(streamId) {
        console.log(`Watching stream ${streamId}`);
        // In a real app, this would start playing the stream
    }

    shareStream(streamId) {
        console.log(`Sharing stream ${streamId}`);
        // In a real app, this would open a share dialog
    }

    toggleWatchlist(streamId, button) {
        const isInWatchlist = button.classList.contains('in-watchlist');
        
        if (isInWatchlist) {
            button.classList.remove('in-watchlist');
            button.innerHTML = '<i class="fas fa-plus"></i>';
            button.title = this.t('addToWatchlist');
        } else {
            button.classList.add('in-watchlist');
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.title = this.t('removeFromWatchlist');
        }
        
        console.log(`${isInWatchlist ? 'Removed from' : 'Added to'} watchlist: stream ${streamId}`);
    }

    toggleFollowStreamer(streamer, button) {
        const isFollowing = button.classList.contains('following');
        
        if (isFollowing) {
            button.classList.remove('following');
            button.innerHTML = `<i class="fas fa-heart"></i> ${this.t('followStreamer')}`;
        } else {
            button.classList.add('following');
            button.innerHTML = `<i class="fas fa-heart-broken"></i> ${this.t('unfollowStreamer')}`;
        }
        
        console.log(`${isFollowing ? 'Unfollowed' : 'Followed'} streamer: ${streamer}`);
    }

    followStreamer(streamer, button) {
        button.classList.add('following');
        button.innerHTML = '<i class="fas fa-heart-broken"></i> Unfollow';
        console.log(`Following streamer: ${streamer}`);
    }

    // Category and Profile Methods
    viewCategoryDetails(category) {
        console.log(`Viewing category details: ${category}`);
        // In a real app, this would navigate to category page
    }

    viewStreamerProfile(streamer) {
        console.log(`Viewing streamer profile: ${streamer}`);
        // In a real app, this would navigate to streamer profile
    }

    // Interface Management
    openInterface(interfaceType) {
        const interface = document.getElementById(`${interfaceType}-interface`);
        if (interface) {
            interface.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    closeInterface(interfaceType) {
        const interfaces = [
            'live-stream-search-interface',
            'content-recommendations-interface', 
            'trending-analytics-interface'
        ];
        
        interfaces.forEach(id => {
            const interface = document.getElementById(id);
            if (interface) {
                interface.classList.add('hidden');
            }
        });
        
        document.body.style.overflow = '';
    }

    // Public Methods for External Access
    showLiveStreamSearch() {
        this.openInterface('live-stream-search');
    }

    showContentRecommendations() {
        this.openInterface('content-recommendations');
    }

    showTrendingAnalytics() {
        this.openInterface('trending-analytics');
    }

    // Language Support
    setLanguage(language) {
        if (this.translations[language]) {
            this.currentLanguage = language;
            // Re-render interfaces with new language
            this.updateInterfaceLanguage();
        }
    }

    updateInterfaceLanguage() {
        // Update all text content with new translations
        console.log(`Updated interface language to: ${this.currentLanguage}`);
        // In a real app, this would update all displayed text
    }
}

// Global initialization
let searchDiscoveryStreamingComponents;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    searchDiscoveryStreamingComponents = new SearchDiscoveryStreamingComponents();
    
    // Make globally accessible for testing
    window.SearchDiscoveryStreaming = searchDiscoveryStreamingComponents;
    
    console.log('Search & Discovery Streaming UI Components initialized successfully');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchDiscoveryStreamingComponents;
}
