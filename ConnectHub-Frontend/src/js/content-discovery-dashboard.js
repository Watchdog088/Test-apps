/**
 * ConnectHub - Content Discovery Dashboard
 * Comprehensive content discovery interface for the explore section
 * 
 * Features Included:
 * 1. Trending Content Feed - Real-time trending posts across all categories
 * 2. AI-Powered Recommendations - Personalized content based on user interests  
 * 3. Content Categories - Social, Media, Interactive, Live Content
 * 4. Discovery Tools - Integration with existing search components
 * 5. Interactive Elements - Filtering, search integration, real-time updates
 */

class ContentDiscoveryDashboard {
    constructor(app) {
        this.app = app || window.app || { showToast: (msg, type) => console.log(msg) };
        this.currentLanguage = 'en';
        
        // Content discovery data
        this.trendingContent = this.generateTrendingContent();
        this.aiRecommendations = this.generateAIRecommendations();
        this.categoryContent = this.generateCategoryContent();
        this.liveContent = this.generateLiveContent();
        
        // Discovery state
        this.currentView = 'trending';
        this.currentCategory = 'all';
        this.currentFilters = {
            timeRange: '24h',
            contentType: 'all',
            engagement: 'all'
        };
        
        this.translations = {
            en: {
                discoverContent: 'Discover Content',
                trending: 'Trending',
                recommendations: 'For You',
                categories: 'Categories',
                liveContent: 'Live Now',
                filters: 'Filters',
                search: 'Search',
                viewAll: 'View All',
                refresh: 'Refresh',
                share: 'Share',
                like: 'Like',
                comment: 'Comment',
                follow: 'Follow',
                save: 'Save',
                report: 'Report',
                close: 'Close',
                loading: 'Loading...',
                noContent: 'No content found',
                tryDifferentFilters: 'Try different filters or refresh the page',
                contentUpdated: 'Content updated',
                personalizedRecommendations: 'Personalized Recommendations',
                basedOnActivity: 'Based on your activity and interests',
                trendingNow: 'Trending Now',
                hotTopics: 'Hot Topics',
                viralContent: 'Viral Content',
                newAndRising: 'New & Rising',
                socialPosts: 'Social Posts',
                mediaContent: 'Media Content',
                interactiveContent: 'Interactive Content',
                liveStreams: 'Live Streams',
                discoverNew: 'Discover New',
                exploreMore: 'Explore More',
                seeMore: 'See More',
                showLess: 'Show Less'
            }
        };

        this.initializeDiscoveryDashboard();
    }

    // Utility method for translations
    t(key) {
        return this.translations[this.currentLanguage]?.[key] || key;
    }

    // Generate trending content data
    generateTrendingContent() {
        const trendingPosts = [];
        const users = ['Emma Wilson', 'Mike Johnson', 'Sarah Miller', 'Alex Chen', 'Lisa Garcia', 'David Brown', 'Anna Kim', 'John Smith'];
        const avatars = ['EW', 'MJ', 'SM', 'AC', 'LG', 'DB', 'AK', 'JS'];
        const categories = ['Tech', 'Lifestyle', 'Travel', 'Food', 'Fitness', 'Art', 'Music', 'Photography'];
        const trendingTopics = ['#AI', '#TechTrends', '#Photography', '#Travel2024', '#FoodieLife', '#Fitness', '#ArtDaily', '#MusicLovers'];
        
        for (let i = 0; i < 25; i++) {
            const userIndex = i % users.length;
            const categoryIndex = i % categories.length;
            const topicIndex = i % trendingTopics.length;
            
            trendingPosts.push({
                id: `trending_${i}`,
                user: users[userIndex],
                avatar: avatars[userIndex],
                category: categories[categoryIndex],
                type: ['image', 'video', 'text', 'poll'][i % 4],
                content: this.generateContentText(categories[categoryIndex], trendingTopics[topicIndex]),
                image: i % 3 === 0 ? `https://picsum.photos/400/300?random=${i}` : null,
                likes: Math.floor(Math.random() * 5000) + 500,
                comments: Math.floor(Math.random() * 500) + 50,
                shares: Math.floor(Math.random() * 200) + 20,
                views: Math.floor(Math.random() * 50000) + 5000,
                time: this.getRandomTimeAgo(),
                trendingScore: Math.floor(Math.random() * 100) + 50,
                tags: this.generateTags(categories[categoryIndex]),
                engagement: this.calculateEngagement(),
                isVerified: Math.random() > 0.7,
                isSponsored: Math.random() > 0.9
            });
        }
        
        return trendingPosts.sort((a, b) => b.trendingScore - a.trendingScore);
    }

    // Generate AI-powered recommendations
    generateAIRecommendations() {
        const recommendations = {
            basedOnInterests: [],
            followedCreators: [],
            similarContent: [],
            newDiscovery: []
        };

        const interests = ['Technology', 'Photography', 'Travel', 'Cooking', 'Fitness'];
        const creators = ['TechGuru_2024', 'PhotoMaster_Pro', 'TravelExplorer', 'ChefCreative', 'FitnessCoach'];
        
        // Generate content for each recommendation category
        interests.forEach((interest, index) => {
            recommendations.basedOnInterests.push({
                id: `interest_${index}`,
                title: `${interest} Content You'll Love`,
                description: `Curated ${interest.toLowerCase()} content based on your activity`,
                content: this.generateRecommendedPosts(interest, 6),
                confidence: Math.floor(Math.random() * 30) + 70
            });
        });

        creators.forEach((creator, index) => {
            recommendations.followedCreators.push({
                id: `creator_${index}`,
                creator: creator,
                avatar: creator.substring(0, 2).toUpperCase(),
                content: this.generateCreatorPosts(creator, 4),
                followers: Math.floor(Math.random() * 100000) + 10000,
                isLive: Math.random() > 0.7
            });
        });

        return recommendations;
    }

    // Generate category content
    generateCategoryContent() {
        return {
            social: {
                title: 'Social Posts',
                description: 'Connect with friends and discover new conversations',
                icon: '👥',
                content: this.generateCategoryPosts('social', 12)
            },
            media: {
                title: 'Media Content',
                description: 'Photos, videos, and multimedia content',
                icon: '🎬',
                content: this.generateCategoryPosts('media', 12)
            },
            interactive: {
                title: 'Interactive Content',
                description: 'Polls, quizzes, and engaging activities',
                icon: '🎮',
                content: this.generateCategoryPosts('interactive', 12)
            },
            live: {
                title: 'Live Content',
                description: 'Live streams and real-time content',
                icon: '🔴',
                content: this.generateCategoryPosts('live', 8)
            }
        };
    }

    // Generate live content
    generateLiveContent() {
        const liveStreams = [];
        const streamers = ['TechTalks_Live', 'MusicSession_Pro', 'CookingLive', 'GameStream_HD', 'ArtStudio_Live'];
        const categories = ['Tech Talk', 'Music', 'Cooking', 'Gaming', 'Art'];
        
        streamers.forEach((streamer, index) => {
            liveStreams.push({
                id: `live_${index}`,
                streamer: streamer,
                avatar: streamer.substring(0, 2).toUpperCase(),
                title: `Live ${categories[index]} Stream`,
                category: categories[index],
                viewers: Math.floor(Math.random() * 5000) + 100,
                duration: Math.floor(Math.random() * 120) + 30, // minutes
                thumbnail: `https://picsum.photos/320/180?random=${index + 100}`,
                quality: ['HD', '4K', '1080p'][index % 3],
                tags: ['Live', 'Interactive', 'Chat Enabled'],
                isLive: true
            });
        });

        return liveStreams;
    }

    // Initialize the discovery dashboard
    initializeDiscoveryDashboard() {
        this.createDiscoveryInterface();
        this.setupEventListeners();
    }

    // Create the main discovery interface
    createDiscoveryInterface() {
        // Remove existing discovery dashboard
        const existingDashboard = document.getElementById('content-discovery-dashboard');
        if (existingDashboard) {
            existingDashboard.remove();
        }

        const dashboard = document.createElement('div');
        dashboard.id = 'content-discovery-dashboard';
        dashboard.className = 'content-discovery-dashboard hidden';
        dashboard.innerHTML = `
            <div class="discovery-overlay">
                <div class="discovery-modal">
                    <!-- Header -->
                    <div class="discovery-header">
                        <div class="discovery-title">
                            <h1>🌟 ${this.t('discoverContent')}</h1>
                            <p>Explore trending content, personalized recommendations, and live streams</p>
                        </div>
                        <div class="discovery-actions">
                            <button id="refreshDiscovery" class="discovery-action-btn">
                                <i class="fas fa-sync-alt"></i> ${this.t('refresh')}
                            </button>
                            <button id="closeDiscovery" class="discovery-close-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Navigation Tabs -->
                    <div class="discovery-nav">
                        <button class="discovery-tab active" data-view="trending">
                            <i class="fas fa-fire"></i> ${this.t('trending')}
                        </button>
                        <button class="discovery-tab" data-view="recommendations">
                            <i class="fas fa-heart"></i> ${this.t('recommendations')}
                        </button>
                        <button class="discovery-tab" data-view="categories">
                            <i class="fas fa-th-large"></i> ${this.t('categories')}
                        </button>
                        <button class="discovery-tab" data-view="live">
                            <i class="fas fa-broadcast-tower"></i> ${this.t('liveContent')}
                        </button>
                    </div>

                    <!-- Filters Bar -->
                    <div class="discovery-filters">
                        <div class="filters-section">
                            <select id="timeRangeFilter">
                                <option value="1h">Last Hour</option>
                                <option value="24h" selected>Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                            </select>
                            <select id="contentTypeFilter">
                                <option value="all" selected>All Content</option>
                                <option value="image">Images</option>
                                <option value="video">Videos</option>
                                <option value="text">Text Posts</option>
                                <option value="poll">Polls</option>
                            </select>
                            <select id="engagementFilter">
                                <option value="all" selected>All Engagement</option>
                                <option value="high">High Engagement</option>
                                <option value="medium">Medium Engagement</option>
                                <option value="rising">Rising Fast</option>
                            </select>
                            <button id="applyFilters" class="apply-filters-btn">Apply</button>
                            <button id="clearFilters" class="clear-filters-btn">Clear</button>
                        </div>
                        <div class="search-section">
                            <input type="text" id="discoverySearch" placeholder="Search trending content..." />
                            <button id="searchDiscovery" class="search-discovery-btn">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Content Area -->
                    <div class="discovery-content">
                        <!-- Trending View -->
                        <div id="trendingView" class="discovery-view active">
                            ${this.renderTrendingView()}
                        </div>

                        <!-- Recommendations View -->
                        <div id="recommendationsView" class="discovery-view">
                            ${this.renderRecommendationsView()}
                        </div>

                        <!-- Categories View -->
                        <div id="categoriesView" class="discovery-view">
                            ${this.renderCategoriesView()}
                        </div>

                        <!-- Live Content View -->
                        <div id="liveView" class="discovery-view">
                            ${this.renderLiveView()}
                        </div>
                    </div>

                    <!-- Loading State -->
                    <div id="discoveryLoading" class="discovery-loading hidden">
                        <div class="loading-spinner"></div>
                        <p>${this.t('loading')}</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(dashboard);
        this.injectDiscoveryStyles();
    }

    // Render trending content view
    renderTrendingView() {
        return `
            <div class="trending-section">
                <div class="section-header">
                    <h2>🔥 ${this.t('trendingNow')}</h2>
                    <div class="trending-stats">
                        <span class="stat-item">📈 ${this.trendingContent.length} trending posts</span>
                        <span class="stat-item">⚡ Updated 2 min ago</span>
                    </div>
                </div>
                
                <!-- Trending Categories Quick Filter -->
                <div class="trending-categories">
                    <button class="category-filter active" data-category="all">All</button>
                    <button class="category-filter" data-category="Tech">💻 Tech</button>
                    <button class="category-filter" data-category="Lifestyle">🌟 Lifestyle</button>
                    <button class="category-filter" data-category="Travel">✈️ Travel</button>
                    <button class="category-filter" data-category="Food">🍽️ Food</button>
                    <button class="category-filter" data-category="Art">🎨 Art</button>
                </div>

                <!-- Trending Content Grid -->
                <div class="trending-content-grid" id="trendingContentGrid">
                    ${this.renderTrendingContent(this.trendingContent.slice(0, 12))}
                </div>

                <div class="load-more-section">
                    <button id="loadMoreTrending" class="load-more-btn">
                        <i class="fas fa-arrow-down"></i> Load More Trending Content
                    </button>
                </div>
            </div>
        `;
    }

    // Render recommendations view
    renderRecommendationsView() {
        return `
            <div class="recommendations-section">
                <div class="section-header">
                    <h2>❤️ ${this.t('personalizedRecommendations')}</h2>
                    <p>${this.t('basedOnActivity')}</p>
                </div>

                <!-- Interest-Based Recommendations -->
                <div class="recommendation-category">
                    <h3>🎯 Based on Your Interests</h3>
                    <div class="recommendation-carousel">
                        ${this.aiRecommendations.basedOnInterests.map(rec => `
                            <div class="recommendation-card" data-confidence="${rec.confidence}">
                                <div class="rec-header">
                                    <h4>${rec.title}</h4>
                                    <div class="confidence-badge">${rec.confidence}% match</div>
                                </div>
                                <p>${rec.description}</p>
                                <div class="rec-content-preview">
                                    ${this.renderContentPreview(rec.content.slice(0, 3))}
                                </div>
                                <button class="explore-rec-btn" data-rec-id="${rec.id}">
                                    Explore ${rec.content.length} posts
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Creator Recommendations -->
                <div class="recommendation-category">
                    <h3>👤 Creators You Might Like</h3>
                    <div class="creator-recommendations">
                        ${this.aiRecommendations.followedCreators.map(creator => `
                            <div class="creator-rec-card">
                                <div class="creator-info">
                                    <div class="creator-avatar ${creator.isLive ? 'live-indicator' : ''}">${creator.avatar}</div>
                                    <div class="creator-details">
                                        <h4>${creator.creator}</h4>
                                        <p>${this.app.formatNumber ? this.app.formatNumber(creator.followers) : creator.followers} followers</p>
                                        ${creator.isLive ? '<span class="live-badge">🔴 Live</span>' : ''}
                                    </div>
                                </div>
                                <div class="creator-content-preview">
                                    ${this.renderContentPreview(creator.content)}
                                </div>
                                <div class="creator-actions">
                                    <button class="follow-creator-btn" data-creator="${creator.creator}">
                                        <i class="fas fa-plus"></i> Follow
                                    </button>
                                    <button class="view-profile-btn" data-creator="${creator.creator}">
                                        <i class="fas fa-user"></i> Profile
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Discover New -->
                <div class="recommendation-category">
                    <h3>🔍 ${this.t('discoverNew')}</h3>
                    <div class="discover-new-grid">
                        ${this.renderDiscoverNewContent()}
                    </div>
                </div>
            </div>
        `;
    }

    // Render categories view
    renderCategoriesView() {
        return `
            <div class="categories-section">
                <div class="section-header">
                    <h2>📂 Content Categories</h2>
                    <p>Explore content by category and discover what's trending in each area</p>
                </div>

                <div class="categories-grid">
                    ${Object.entries(this.categoryContent).map(([key, category]) => `
                        <div class="category-section-card" data-category="${key}">
                            <div class="category-header">
                                <div class="category-icon">${category.icon}</div>
                                <div class="category-info">
                                    <h3>${category.title}</h3>
                                    <p>${category.description}</p>
                                    <div class="category-stats">
                                        <span>${category.content.length} posts</span>
                                        <span>Updated recently</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="category-content-preview">
                                ${this.renderCategoryContent(category.content.slice(0, 6))}
                            </div>
                            
                            <div class="category-actions">
                                <button class="explore-category-btn" data-category="${key}">
                                    <i class="fas fa-arrow-right"></i> Explore ${category.title}
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Render live content view
    renderLiveView() {
        return `
            <div class="live-section">
                <div class="section-header">
                    <h2>🔴 ${this.t('liveContent')}</h2>
                    <div class="live-stats">
                        <span class="stat-item">📺 ${this.liveContent.length} live streams</span>
                        <span class="stat-item">👥 ${this.liveContent.reduce((sum, stream) => sum + stream.viewers, 0)} total viewers</span>
                    </div>
                </div>

                <!-- Live Stream Grid -->
                <div class="live-streams-grid">
                    ${this.liveContent.map(stream => `
                        <div class="live-stream-card" data-stream-id="${stream.id}">
                            <div class="stream-thumbnail">
                                <img src="${stream.thumbnail}" alt="${stream.title}" />
                                <div class="live-indicator">🔴 LIVE</div>
                                <div class="stream-duration">${Math.floor(stream.duration / 60)}h ${stream.duration % 60}m</div>
                                <div class="stream-quality">${stream.quality}</div>
                            </div>
                            
                            <div class="stream-info">
                                <div class="stream-header">
                                    <div class="streamer-avatar">${stream.avatar}</div>
                                    <div class="stream-details">
                                        <h4>${stream.title}</h4>
                                        <p>${stream.streamer}</p>
                                        <div class="stream-meta">
                                            <span class="category-tag">${stream.category}</span>
                                            <span class="viewers-count">👥 ${stream.viewers}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="stream-tags">
                                    ${stream.tags.map(tag => `<span class="stream-tag">${tag}</span>`).join('')}
                                </div>
                                
                                <div class="stream-actions">
                                    <button class="watch-stream-btn" data-stream-id="${stream.id}">
                                        <i class="fas fa-play"></i> Watch
                                    </button>
                                    <button class="follow-streamer-btn" data-streamer="${stream.streamer}">
                                        <i class="fas fa-heart"></i> Follow
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Discover More Live Content -->
                <div class="discover-more-live">
                    <button id="discoverMoreLive" class="discover-more-btn">
                        <i class="fas fa-search"></i> Discover More Live Streams
                    </button>
                    <button id="createLiveStream" class="create-live-btn">
                        <i class="fas fa-video"></i> Start Your Live Stream
                    </button>
                </div>
            </div>
        `;
    }

    // Helper methods for rendering content
    renderTrendingContent(content) {
        return content.map(post => `
            <div class="trending-post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="user-info">
                        <div class="user-avatar ${post.isVerified ? 'verified' : ''}">${post.avatar}</div>
                        <div class="user-details">
                            <h4>${post.user} ${post.isVerified ? '✓' : ''}</h4>
                            <div class="post-meta">
                                <span class="category">${post.category}</span>
                                <span class="time">${post.time}</span>
                                <span class="trending-score">🔥 ${post.trendingScore}</span>
                            </div>
                        </div>
                    </div>
                    ${post.isSponsored ? '<div class="sponsored-badge">Sponsored</div>' : ''}
                </div>

                <div class="post-content">
                    <p>${post.content}</p>
                    ${post.image ? `<img src="${post.image}" alt="Post content" class="post-image" />` : ''}
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                    </div>
                </div>

                <div class="post-stats">
                    <div class="engagement-stats">
                        <span class="stat-item">❤️ ${this.app.formatNumber ? this.app.formatNumber(post.likes) : post.likes}</span>
                        <span class="stat-item">💬 ${this.app.formatNumber ? this.app.formatNumber(post.comments) : post.comments}</span>
                        <span class="stat-item">🔄 ${this.app.formatNumber ? this.app.formatNumber(post.shares) : post.shares}</span>
                        <span class="stat-item">👀 ${this.app.formatNumber ? this.app.formatNumber(post.views) : post.views}</span>
                    </div>
                    <div class="engagement-rate">
                        <span class="engagement-badge">${post.engagement}% engagement</span>
                    </div>
                </div>

                <div class="post-actions">
                    <button class="action-btn like-btn" data-post-id="${post.id}">
                        <i class="fas fa-heart"></i> ${this.t('like')}
                    </button>
                    <button class="action-btn comment-btn" data-post-id="${post.id}">
                        <i class="fas fa-comment"></i> ${this.t('comment')}
                    </button>
                    <button class="action-btn share-btn" data-post-id="${post.id}">
                        <i class="fas fa-share"></i> ${this.t('share')}
                    </button>
                    <button class="action-btn save-btn" data-post-id="${post.id}">
                        <i class="fas fa-bookmark"></i> ${this.t('save')}
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderContentPreview(content) {
        return content.slice(0, 3).map(item => `
            <div class="content-preview-item">
                <div class="preview-thumbnail">
                    ${item.image ? `<img src="${item.image}" alt="Preview" />` : 
                      `<div class="preview-placeholder">${item.type === 'video' ? '🎥' : item.type === 'poll' ? '📊' : '📝'}</div>`}
                </div>
                <div class="preview-info">
                    <p>${item.content.substring(0, 50)}...</p>
                    <span class="preview-stats">❤️ ${this.app.formatNumber ? this.app.formatNumber(item.likes) : item.likes}</span>
                </div>
            </div>
        `).join('');
    }

    renderCategoryContent(content) {
        return `
            <div class="category-content-grid">
                ${content.map(item => `
                    <div class="category-content-item" data-post-id="${item.id}">
                        <div class="content-preview">
                            ${item.image ? `<img src="${item.image}" alt="Content" />` : 
                              `<div class="content-placeholder">${item.type === 'video' ? '🎥' : item.type === 'poll' ? '📊' : '📝'}</div>`}
                        </div>
                        <div class="content-overlay">
                            <div class="content-stats">
                                <span>❤️ ${this.app.formatNumber ? this.app.formatNumber(item.likes) : item.likes}</span>
                                <span>💬 ${this.app.formatNumber ? this.app.formatNumber(item.comments) : item.comments}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderDiscoverNewContent() {
        const newContent = this.trendingContent.slice(-6);
        return newContent.map(post => `
            <div class="discover-new-item" data-post-id="${post.id}">
                <div class="new-content-preview">
                    ${post.image ? `<img src="${post.image}" alt="New content" />` : 
                      `<div class="new-placeholder">${post.type === 'video' ? '🎥' : '📝'}</div>`}
                    <div class="new-badge">NEW</div>
                </div>
                <div class="new-content-info">
                    <h5>${post.user}</h5>
                    <p>${post.content.substring(0, 60)}...</p>
                    <div class="new-content-stats">
                        <span>❤️ ${post.likes}</span>
                        <span>${post.category}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Setup event listeners
    setupEventListeners() {
        // Tab navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.discovery-tab')) {
                this.handleTabSwitch(e.target.closest('.discovery-tab'));
            }

            // Close discovery dashboard
            if (e.target.id === 'closeDiscovery' || e.target.closest('#closeDiscovery')) {
                this.closeDiscoveryDashboard();
            }

            // Refresh discovery
            if (e.target.id === 'refreshDiscovery' || e.target.closest('#refreshDiscovery')) {
                this.refreshDiscoveryContent();
            }

            // Apply filters
            if (e.target.id === 'applyFilters' || e.target.closest('#applyFilters')) {
                this.applyFilters();
            }

            // Clear filters
            if (e.target.id === 'clearFilters' || e.target.closest('#clearFilters')) {
                this.clearFilters();
            }

            // Search discovery
            if (e.target.id === 'searchDiscovery' || e.target.closest('#searchDiscovery')) {
                this.performDiscoverySearch();
            }

            // Load more trending
            if (e.target.id === 'loadMoreTrending' || e.target.closest('#loadMoreTrending')) {
                this.loadMoreTrendingContent();
            }

            // Category filters
            if (e.target.closest('.category-filter')) {
                this.handleCategoryFilter(e.target.closest('.category-filter'));
            }

            // Post actions
            if (e.target.closest('.like-btn')) {
                this.handleLikePost(e.target.closest('.like-btn').dataset.postId);
            }

            if (e.target.closest('.comment-btn')) {
                this.handleCommentPost(e.target.closest('.comment-btn').dataset.postId);
            }

            if (e.target.closest('.share-btn')) {
                this.handleSharePost(e.target.closest('.share-btn').dataset.postId);
            }

            if (e.target.closest('.save-btn')) {
                this.handleSavePost(e.target.closest('.save-btn').dataset.postId);
            }

            // Creator actions
            if (e.target.closest('.follow-creator-btn')) {
                this.handleFollowCreator(e.target.closest('.follow-creator-btn').dataset.creator);
            }

            if (e.target.closest('.view-profile-btn')) {
                this.handleViewProfile(e.target.closest('.view-profile-btn').dataset.creator);
            }

            // Stream actions
            if (e.target.closest('.watch-stream-btn')) {
                this.handleWatchStream(e.target.closest('.watch-stream-btn').dataset.streamId);
            }

            if (e.target.closest('.follow-streamer-btn')) {
                this.handleFollowStreamer(e.target.closest('.follow-streamer-btn').dataset.streamer);
            }

            // Discover more actions
            if (e.target.id === 'discoverMoreLive' || e.target.closest('#discoverMoreLive')) {
                this.discoverMoreLiveStreams();
            }

            if (e.target.id === 'createLiveStream' || e.target.closest('#createLiveStream')) {
                this.createLiveStream();
            }

            // Explore category
            if (e.target.closest('.explore-category-btn')) {
                this.exploreCategory(e.target.closest('.explore-category-btn').dataset.category);
            }

            // Explore recommendation
            if (e.target.closest('.explore-rec-btn')) {
                this.exploreRecommendation(e.target.closest('.explore-rec-btn').dataset.recId);
            }
        });

        // Search input enter key
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'discoverySearch' && e.key === 'Enter') {
                this.performDiscoverySearch();
            }
        });

        // Overlay click to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('discovery-overlay')) {
                this.closeDiscoveryDashboard();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('content-discovery-dashboard')?.classList.contains('active')) {
                this.closeDiscoveryDashboard();
            }
        });
    }

    // Event handler methods
    handleTabSwitch(tabElement) {
        const view = tabElement.dataset.view;
        
        // Update active tab
        document.querySelectorAll('.discovery-tab').forEach(tab => tab.classList.remove('active'));
        tabElement.classList.add('active');

        // Update active view
        document.querySelectorAll('.discovery-view').forEach(view => view.classList.remove('active'));
        const targetView = document.getElementById(`${view}View`);
        if (targetView) {
            targetView.classList.add('active');
        }

        this.currentView = view;
        this.app.showToast(`Switched to ${view} view`, 'info');
    }

    handleCategoryFilter(filterElement) {
        const category = filterElement.dataset.category;
        
        // Update active filter
        document.querySelectorAll('.category-filter').forEach(filter => filter.classList.remove('active'));
        filterElement.classList.add('active');

        this.currentCategory = category;
        this.filterTrendingContent(category);
        this.app.showToast(`Filtering by ${category === 'all' ? 'all categories' : category}`, 'info');
    }

    handleLikePost(postId) {
        const post = this.trendingContent.find(p => p.id === postId);
        if (post) {
            post.likes += 1;
            this.app.showToast('Post liked! ❤️', 'success');
            this.updatePostStats(postId, 'likes', post.likes);
        }
    }

    handleCommentPost(postId) {
        this.app.showToast('Opening comments...', 'info');
        // Integration point for existing comment system
    }

    handleSharePost(postId) {
        const post = this.trendingContent.find(p => p.id === postId);
        if (post) {
            post.shares += 1;
            this.app.showToast('Post shared! 🔄', 'success');
            this.updatePostStats(postId, 'shares', post.shares);
        }
    }

    handleSavePost(postId) {
        this.app.showToast('Post saved! 📚', 'success');
    }

    handleFollowCreator(creator) {
        this.app.showToast(`Now following ${creator}! ✨`, 'success');
    }

    handleViewProfile(creator) {
        this.app.showToast(`Opening ${creator}'s profile...`, 'info');
    }

    handleWatchStream(streamId) {
        const stream = this.liveContent.find(s => s.id === streamId);
        if (stream) {
            stream.viewers += 1;
            this.app.showToast(`Watching ${stream.title}! 📺`, 'success');
        }
    }

    handleFollowStreamer(streamer) {
        this.app.showToast(`Now following ${streamer}! 🔴`, 'success');
    }

    // Filter and search methods
    applyFilters() {
        const timeRange = document.getElementById('timeRangeFilter')?.value;
        const contentType = document.getElementById('contentTypeFilter')?.value;
        const engagement = document.getElementById('engagementFilter')?.value;

        this.currentFilters = { timeRange, contentType, engagement };
        this.filterContent();
        this.app.showToast('Filters applied!', 'success');
    }

    clearFilters() {
        // Reset filter selects
        if (document.getElementById('timeRangeFilter')) document.getElementById('timeRangeFilter').value = '24h';
        if (document.getElementById('contentTypeFilter')) document.getElementById('contentTypeFilter').value = 'all';
        if (document.getElementById('engagementFilter')) document.getElementById('engagementFilter').value = 'all';

        this.currentFilters = { timeRange: '24h', contentType: 'all', engagement: 'all' };
        this.currentCategory = 'all';
        
        // Reset category filter
        document.querySelectorAll('.category-filter').forEach(filter => filter.classList.remove('active'));
        document.querySelector('.category-filter[data-category="all"]')?.classList.add('active');

        this.refreshTrendingView();
        this.app.showToast('Filters cleared!', 'info');
    }

    performDiscoverySearch() {
        const searchInput = document.getElementById('discoverySearch');
        const query = searchInput?.value.trim();

        if (!query) {
            this.app.showToast('Please enter a search term', 'warning');
            return;
        }

        this.showLoading();
        this.app.showToast(`Searching for "${query}"...`, 'info');

        // Simulate search delay
        setTimeout(() => {
            const results = this.searchContent(query);
            this.displaySearchResults(results, query);
            this.hideLoading();
            this.app.showToast(`Found ${results.length} results for "${query}"`, 'success');
        }, 1000);
    }

    searchContent(query) {
        return this.trendingContent.filter(post => 
            post.content.toLowerCase().includes(query.toLowerCase()) ||
            post.user.toLowerCase().includes(query.toLowerCase()) ||
            post.category.toLowerCase().includes(query.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
    }

    displaySearchResults(results, query) {
        const trendingGrid = document.getElementById('trendingContentGrid');
        if (trendingGrid) {
            trendingGrid.innerHTML = results.length > 0 
                ? this.renderTrendingContent(results)
                : `<div class="no-results">
                     <h3>No results found for "${query}"</h3>
                     <p>Try different keywords or clear your search</p>
                   </div>`;
        }
    }

    filterContent() {
        let filtered = [...this.trendingContent];

        // Apply category filter
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(post => post.category === this.currentCategory);
        }

        // Apply content type filter
        if (this.currentFilters.contentType !== 'all') {
            filtered = filtered.filter(post => post.type === this.currentFilters.contentType);
        }

        // Apply engagement filter
        if (this.currentFilters.engagement !== 'all') {
            switch (this.currentFilters.engagement) {
                case 'high':
                    filtered = filtered.filter(post => parseInt(post.engagement) > 75);
                    break;
                case 'medium':
                    filtered = filtered.filter(post => parseInt(post.engagement) >= 50 && parseInt(post.engagement) <= 75);
                    break;
                case 'rising':
                    filtered = filtered.filter(post => post.trendingScore > 80);
                    break;
            }
        }

        this.displayFilteredContent(filtered);
    }

    filterTrendingContent(category) {
        let filtered = category === 'all' ? this.trendingContent : this.trendingContent.filter(post => post.category === category);
        this.displayFilteredContent(filtered);
    }

    displayFilteredContent(content) {
        const trendingGrid = document.getElementById('trendingContentGrid');
        if (trendingGrid) {
            trendingGrid.innerHTML = content.length > 0 
                ? this.renderTrendingContent(content.slice(0, 12))
                : `<div class="no-results">
                     <h3>No content found</h3>
                     <p>Try different filters or refresh the page</p>
                   </div>`;
        }
    }

    // Content management methods
    loadMoreTrendingContent() {
        const trendingGrid = document.getElementById('trendingContentGrid');
        const currentCount = trendingGrid?.querySelectorAll('.trending-post-card').length || 0;
        const nextBatch = this.trendingContent.slice(currentCount, currentCount + 6);

        if (nextBatch.length > 0 && trendingGrid) {
            trendingGrid.innerHTML += this.renderTrendingContent(nextBatch);
            this.app.showToast(`Loaded ${nextBatch.length} more posts`, 'success');
        } else {
            this.app.showToast('No more content to load', 'info');
        }
    }

    refreshDiscoveryContent() {
        this.showLoading();
        this.app.showToast('Refreshing content...', 'info');

        // Regenerate content
        setTimeout(() => {
            this.trendingContent = this.generateTrendingContent();
            this.aiRecommendations = this.generateAIRecommendations();
            this.liveContent = this.generateLiveContent();

            this.refreshCurrentView();
            this.hideLoading();
            this.app.showToast('Content refreshed! ✨', 'success');
        }, 1500);
    }

    refreshCurrentView() {
        const currentViewElement = document.getElementById(`${this.currentView}View`);
        if (currentViewElement) {
            switch (this.currentView) {
                case 'trending':
                    currentViewElement.innerHTML = this.renderTrendingView();
                    break;
                case 'recommendations':
                    currentViewElement.innerHTML = this.renderRecommendationsView();
                    break;
                case 'categories':
                    currentViewElement.innerHTML = this.renderCategoriesView();
                    break;
                case 'live':
                    currentViewElement.innerHTML = this.renderLiveView();
                    break;
            }
        }
    }

    refreshTrendingView() {
        const trendingView = document.getElementById('trendingView');
        if (trendingView) {
            trendingView.innerHTML = this.renderTrendingView();
        }
    }

    updatePostStats(postId, statType, newValue) {
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
            const statElement = postElement.querySelector(`.stat-item:contains('${statType}')`);
            if (statElement) {
                const icon = statType === 'likes' ? '❤️' : statType === 'shares' ? '🔄' : '💬';
                statElement.textContent = `${icon} ${this.app.formatNumber ? this.app.formatNumber(newValue) : newValue}`;
            }
        }
    }

    // Discovery actions
    discoverMoreLiveStreams() {
        // Integration with existing streaming discovery components
        if (window.searchDiscoveryStreamingComponents) {
            window.searchDiscoveryStreamingComponents.showLiveStreamSearch();
            this.app.showToast('Live Stream Discovery opened! 📺', 'success');
        } else {
            this.app.showToast('Opening live stream discovery...', 'info');
        }
    }

    createLiveStream() {
        // Integration with existing streaming components
        if (window.streamSessionDashboard) {
            window.streamSessionDashboard.showSetupModal();
            this.app.showToast('Stream setup opened! 🔴', 'success');
        } else {
            this.app.showToast('Opening stream creation...', 'info');
        }
    }

    exploreCategory(category) {
        this.currentCategory = category;
        this.currentView = 'trending';
        
        // Switch to trending view and filter by category
        this.handleTabSwitch(document.querySelector('[data-view="trending"]'));
        this.filterTrendingContent(category);
        this.app.showToast(`Exploring ${category} content`, 'success');
    }

    exploreRecommendation(recId) {
        const recommendation = this.aiRecommendations.basedOnInterests.find(rec => rec.id === recId);
        if (recommendation) {
            this.app.showToast(`Exploring ${recommendation.title}`, 'success');
            // Could switch to trending view and show the recommendation content
        }
    }

    // Utility methods
    showLoading() {
        const loading = document.getElementById('discoveryLoading');
        if (loading) loading.classList.remove('hidden');
    }

    hideLoading() {
        const loading = document.getElementById('discoveryLoading');
        if (loading) loading.classList.add('hidden');
    }

    // Helper methods for generating content
    generateContentText(category, topic) {
        const templates = {
            Tech: [
                `Exploring the latest ${topic} innovations that are changing the industry! 🚀`,
                `Just discovered this amazing ${topic} tool that developers need to know about 💻`,
                `${topic} is revolutionizing how we work. Here's what you need to know 🔧`,
            ],
            Lifestyle: [
                `Living my best life with these ${topic} tips! ✨`,
                `${topic} has completely transformed my daily routine 🌟`,
                `Found the perfect balance with ${topic} - sharing the journey 💫`,
            ],
            Travel: [
                `Just got back from an incredible ${topic} adventure! 🌍`,
                `${topic} destination that should be on everyone's bucket list ✈️`,
                `Hidden gems I discovered during my ${topic} journey 🗺️`,
            ],
            Food: [
                `This ${topic} recipe will change your cooking game forever! 🍽️`,
                `Trying out the trending ${topic} spot everyone's talking about 👨‍🍳`,
                `${topic} flavors that took me by surprise - must try! 🤤`,
            ]
        };

        const categoryTemplates = templates[category] || templates.Tech;
        return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
    }

    generateTags(category) {
        const tagSets = {
            Tech: ['#Innovation', '#TechTrends', '#Developer', '#AI', '#Future'],
            Lifestyle: ['#Wellness', '#Mindful', '#SelfCare', '#Balance', '#Growth'],
            Travel: ['#Adventure', '#Explore', '#Wanderlust', '#Culture', '#Journey'],
            Food: ['#Foodie', '#Recipe', '#Culinary', '#Delicious', '#Homemade'],
            Art: ['#Creative', '#Artistic', '#Inspiration', '#Design', '#Beauty'],
            Music: ['#Music', '#Rhythm', '#Melody', '#Artist', '#Sound']
        };

        const tags = tagSets[category] || tagSets.Tech;
        return tags.slice(0, Math.floor(Math.random() * 3) + 2);
    }

    calculateEngagement() {
        return Math.floor(Math.random() * 50) + 25; // 25-75%
    }

    getRandomTimeAgo() {
        const timeOptions = ['2m', '15m', '1h', '3h', '5h', '8h', '12h', '1d', '2d'];
        return timeOptions[Math.floor(Math.random() * timeOptions.length)];
    }

    generateRecommendedPosts(interest, count) {
        return Array.from({ length: count }, (_, i) => ({
            id: `rec_${interest}_${i}`,
            content: `Amazing ${interest} content you'll love! Check this out 🔥`,
            type: ['image', 'video', 'text'][i % 3],
            likes: Math.floor(Math.random() * 1000) + 100,
            comments: Math.floor(Math.random() * 100) + 10,
            image: i % 2 === 0 ? `https://picsum.photos/300/200?random=${Date.now() + i}` : null
        }));
    }

    generateCreatorPosts(creator, count) {
        return Array.from({ length: count }, (_, i) => ({
            id: `creator_${creator}_${i}`,
            content: `Latest update from ${creator}! Don't miss this amazing content ⭐`,
            type: ['image', 'video', 'text'][i % 3],
            likes: Math.floor(Math.random() * 2000) + 200,
            comments: Math.floor(Math.random() * 200) + 20,
            image: i % 2 === 0 ? `https://picsum.photos/300/200?random=${Date.now() + i + 1000}` : null
        }));
    }

    generateCategoryPosts(category, count) {
        return Array.from({ length: count }, (_, i) => ({
            id: `cat_${category}_${i}`,
            content: `Trending ${category} post that's getting amazing engagement! 🚀`,
            type: ['image', 'video', 'text', 'poll'][i % 4],
            likes: Math.floor(Math.random() * 1500) + 150,
            comments: Math.floor(Math.random() * 150) + 15,
            image: i % 3 === 0 ? `https://picsum.photos/300/200?random=${Date.now() + i + 2000}` : null
        }));
    }

    // CSS Injection
    injectDiscoveryStyles() {
        if (document.getElementById('discovery-dashboard-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'discovery-dashboard-styles';
        styles.textContent = `
            .content-discovery-dashboard {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .content-discovery-dashboard.active {
                opacity: 1;
                visibility: visible;
            }

            .discovery-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
            }

            .discovery-modal {
                position: relative;
                width: 95%;
                max-width: 1400px;
                height: 90%;
                margin: 2.5% auto;
                background: var(--bg-card);
                border-radius: 20px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }

            .discovery-header {
                padding: 1.5rem 2rem;
                background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .discovery-title h1 {
                margin: 0 0 0.5rem 0;
                font-size: 1.8rem;
            }

            .discovery-title p {
                margin: 0;
                opacity: 0.9;
                font-size: 0.9rem;
            }

            .discovery-actions {
                display: flex;
                gap: 1rem;
                align-items: center;
            }

            .discovery-action-btn, .discovery-close-btn {
                padding: 0.5rem 1rem;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .discovery-action-btn:hover, .discovery-close-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }

            .discovery-nav {
                padding: 0 2rem;
                background: var(--bg-secondary);
                display: flex;
                gap: 0;
                border-bottom: 1px solid var(--glass-border);
            }

            .discovery-tab {
                padding: 1rem 1.5rem;
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                transition: all 0.2s ease;
                border-bottom: 3px solid transparent;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .discovery-tab:hover {
                background: var(--glass);
                color: var(--text-primary);
            }

            .discovery-tab.active {
                color: var(--primary);
                border-bottom-color: var(--primary);
                background: var(--glass);
            }

            .discovery-filters {
                padding: 1rem 2rem;
                background: var(--bg-secondary);
                border-bottom: 1px solid var(--glass-border);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 1rem;
            }

            .filters-section {
                display: flex;
                gap: 1rem;
                align-items: center;
            }

            .filters-section select {
                padding: 0.5rem;
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 6px;
                color: var(--text-primary);
            }

            .apply-filters-btn, .clear-filters-btn {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.2s ease;
            }

            .apply-filters-btn {
                background: var(--primary);
                color: white;
            }

            .clear-filters-btn {
                background: var(--glass);
                color: var(--text-secondary);
            }

            .search-section {
                display: flex;
                gap: 0.5rem;
            }

            .search-section input {
                padding: 0.5rem 1rem;
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 20px;
                color: var(--text-primary);
                width: 250px;
            }

            .search-discovery-btn {
                padding: 0.5rem 1rem;
                background: var(--primary);
                color: white;
                border: none;
                border-radius: 20px;
                cursor: pointer;
            }

            .discovery-content {
                flex: 1;
                overflow-y: auto;
                padding: 2rem;
            }

            .discovery-view {
                display: none;
            }

            .discovery-view.active {
                display: block;
            }

            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
            }

            .section-header h2 {
                margin: 0;
                color: var(--text-primary);
            }

            .trending-stats, .live-stats {
                display: flex;
                gap: 1rem;
                font-size: 0.9rem;
                color: var(--text-secondary);
            }

            .trending-categories {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 2rem;
                flex-wrap: wrap;
            }

            .category-filter {
                padding: 0.5rem 1rem;
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 20px;
                color: var(--text-secondary);
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .category-filter:hover, .category-filter.active {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }

            .trending-content-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .trending-post-card {
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 1.5rem;
                transition: all 0.2s ease;
            }

            .trending-post-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }

            .post-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .user-info {
                display: flex;
                gap: 1rem;
                align-items: center;
            }

            .user-avatar {
                width: 45px;
                height: 45px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
            }

            .user-avatar.verified {
                border: 2px solid var(--success);
            }

            .user-details h4 {
                margin: 0 0 0.25rem 0;
                color: var(--text-primary);
            }

            .post-meta {
                display: flex;
                gap: 1rem;
                font-size: 0.8rem;
                color: var(--text-secondary);
            }

            .sponsored-badge {
                background: var(--warning);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
                font-size: 0.7rem;
            }

            .post-content {
                margin-bottom: 1rem;
            }

            .post-content p {
                margin: 0 0 1rem 0;
                line-height: 1.6;
            }

            .post-image {
                width: 100%;
                height: 200px;
                object-fit: cover;
                border-radius: 8px;
                margin-bottom: 1rem;
            }

            .post-tags {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }

            .post-tag {
                background: var(--primary);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
                font-size: 0.7rem;
            }

            .post-stats {
                margin-bottom: 1rem;
            }

            .engagement-stats {
                display: flex;
                gap: 1rem;
                margin-bottom: 0.5rem;
            }

            .stat-item {
                font-size: 0.8rem;
                color: var(--text-secondary);
            }

            .engagement-badge {
                background: var(--glass);
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
                font-size: 0.7rem;
                color: var(--primary);
                font-weight: 600;
            }

            .post-actions {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }

            .action-btn {
                padding: 0.5rem 1rem;
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 6px;
                color: var(--text-secondary);
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 0.25rem;
                font-size: 0.8rem;
            }

            .action-btn:hover {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }

            .load-more-section {
                text-align: center;
            }

            .load-more-btn {
                padding: 1rem 2rem;
                background: var(--primary);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .load-more-btn:hover {
                background: var(--secondary);
                transform: translateY(-2px);
            }

            .no-results {
                text-align: center;
                padding: 3rem 2rem;
                color: var(--text-secondary);
            }

            .no-results h3 {
                margin: 0 0 1rem 0;
                color: var(--text-primary);
            }

            .recommendation-carousel {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .recommendation-card {
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 1.5rem;
                transition: all 0.2s ease;
            }

            .recommendation-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }

            .rec-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }

            .confidence-badge {
                background: var(--success);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
                font-size: 0.7rem;
            }

            .rec-content-preview {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 0.5rem;
                margin-bottom: 1rem;
            }

            .content-preview-item {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            .preview-thumbnail {
                width: 100%;
                height: 60px;
                border-radius: 6px;
                overflow: hidden;
            }

            .preview-thumbnail img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .preview-placeholder {
                width: 100%;
                height: 100%;
                background: var(--glass);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
            }

            .preview-info {
                font-size: 0.7rem;
            }

            .preview-info p {
                margin: 0 0 0.25rem 0;
                color: var(--text-secondary);
            }

            .explore-rec-btn {
                width: 100%;
                padding: 0.75rem;
                background: var(--primary);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .creator-recommendations {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .creator-rec-card {
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 1rem;
                transition: all 0.2s ease;
            }

            .creator-info {
                display: flex;
                gap: 1rem;
                align-items: center;
                margin-bottom: 1rem;
            }

            .creator-avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
            }

            .creator-avatar.live-indicator {
                border: 3px solid var(--error);
                animation: pulse 2s infinite;
            }

            .live-badge {
                background: var(--error);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
                font-size: 0.7rem;
            }

            .creator-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1rem;
            }

            .follow-creator-btn, .view-profile-btn {
                flex: 1;
                padding: 0.5rem;
                border: 1px solid var(--glass-border);
                border-radius: 6px;
                background: var(--glass);
                color: var(--text-secondary);
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .follow-creator-btn:hover {
                background: var(--primary);
                color: white;
            }

            .discover-new-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .discover-new-item {
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                overflow: hidden;
                transition: all 0.2s ease;
                cursor: pointer;
            }

            .discover-new-item:hover {
                transform: translateY(-2px);
            }

            .new-content-preview {
                position: relative;
                height: 120px;
            }

            .new-content-preview img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .new-placeholder {
                width: 100%;
                height: 100%;
                background: var(--glass);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
            }

            .new-badge {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                background: var(--success);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
                font-size: 0.6rem;
            }

            .new-content-info {
                padding: 1rem;
            }

            .new-content-info h5 {
                margin: 0 0 0.5rem 0;
                font-size: 0.9rem;
            }

            .new-content-info p {
                margin: 0 0 0.5rem 0;
                font-size: 0.8rem;
                color: var(--text-secondary);
            }

            .new-content-stats {
                display: flex;
                gap: 1rem;
                font-size: 0.7rem;
                color: var(--text-muted);
            }

            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 2rem;
                margin-bottom: 2rem;
            }

            .category-section-card {
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                overflow: hidden;
                transition: all 0.2s ease;
            }

            .category-section-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }

            .category-header {
                display: flex;
                gap: 1rem;
                padding: 1.5rem;
                border-bottom: 1px solid var(--glass-border);
            }

            .category-icon {
                font-size: 2rem;
            }

            .category-info h3 {
                margin: 0 0 0.5rem 0;
            }

            .category-stats {
                display: flex;
                gap: 1rem;
                font-size: 0.8rem;
                color: var(--text-secondary);
                margin-top: 0.5rem;
            }

            .category-content-preview {
                padding: 1rem;
            }

            .category-content-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 0.5rem;
            }

            .category-content-item {
                position: relative;
                height: 80px;
                border-radius: 6px;
                overflow: hidden;
                cursor: pointer;
            }

            .content-preview img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .content-placeholder {
                width: 100%;
                height: 100%;
                background: var(--glass);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }

            .content-overlay {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
                color: white;
                padding: 0.5rem;
            }

            .content-stats {
                display: flex;
                gap: 0.5rem;
                font-size: 0.7rem;
            }

            .category-actions {
                padding: 1rem;
                border-top: 1px solid var(--glass-border);
            }

            .explore-category-btn {
                width: 100%;
                padding: 0.75rem;
                background: var(--primary);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .live-streams-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .live-stream-card {
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                overflow: hidden;
                transition: all 0.2s ease;
            }

            .live-stream-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }

            .stream-thumbnail {
                position: relative;
                height: 180px;
            }

            .stream-thumbnail img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .live-indicator {
                position: absolute;
                top: 0.5rem;
                left: 0.5rem;
                background: var(--error);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
                font-size: 0.7rem;
                font-weight: 600;
            }

            .stream-duration, .stream-quality {
                position: absolute;
                bottom: 0.5rem;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 6px;
                font-size: 0.7rem;
            }

            .stream-duration {
                left: 0.5rem;
            }

            .stream-quality {
                right: 0.5rem;
            }

            .stream-info {
                padding: 1rem;
            }

            .stream-header {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .streamer-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
            }

            .stream-details h4 {
                margin: 0 0 0.25rem 0;
            }

            .stream-meta {
                display: flex;
                gap: 1rem;
                font-size: 0.8rem;
                color: var(--text-secondary);
            }

            .category-tag {
                background: var(--glass);
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
            }

            .stream-tags {
                display: flex;
                gap: 0.25rem;
                margin-bottom: 1rem;
                flex-wrap: wrap;
            }

            .stream-tag {
                background: var(--glass);
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
                font-size: 0.7rem;
                color: var(--text-secondary);
            }

            .stream-actions {
                display: flex;
                gap: 0.5rem;
            }

            .watch-stream-btn, .follow-streamer-btn {
                flex: 1;
                padding: 0.5rem;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .watch-stream-btn {
                background: var(--primary);
                color: white;
            }

            .follow-streamer-btn {
                background: var(--glass);
                color: var(--text-secondary);
                border: 1px solid var(--glass-border);
            }

            .follow-streamer-btn:hover {
                background: var(--error);
                color: white;
                border-color: var(--error);
            }

            .discover-more-live {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }

            .discover-more-btn, .create-live-btn {
                padding: 1rem 2rem;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .discover-more-btn {
                background: var(--glass);
                color: var(--text-primary);
                border: 1px solid var(--glass-border);
            }

            .create-live-btn {
                background: var(--error);
                color: white;
            }

            .discovery-loading {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid var(--glass-border);
                border-top-color: var(--primary);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 1rem;
            }

            @keyframes spin {
                to {
                    transform: rotate(360deg);
                }
            }

            @keyframes pulse {
                0% {
                    box-shadow: 0 0 0 0 var(--error);
                }
                70% {
                    box-shadow: 0 0 0 10px transparent;
                }
                100% {
                    box-shadow: 0 0 0 0 transparent;
                }
            }

            .recommendation-category {
                margin-bottom: 3rem;
            }

            .recommendation-category h3 {
                margin: 0 0 1.5rem 0;
                color: var(--text-primary);
                font-size: 1.2rem;
            }

            @media (max-width: 768px) {
                .discovery-modal {
                    width: 98%;
                    height: 95%;
                    margin: 1% auto;
                }

                .discovery-header {
                    padding: 1rem;
                }

                .discovery-title h1 {
                    font-size: 1.4rem;
                }

                .discovery-filters {
                    flex-direction: column;
                    align-items: stretch;
                }

                .filters-section {
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .search-section input {
                    width: 200px;
                }

                .trending-content-grid {
                    grid-template-columns: 1fr;
                }

                .categories-grid {
                    grid-template-columns: 1fr;
                }

                .live-streams-grid {
                    grid-template-columns: 1fr;
                }

                .recommendation-carousel {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    // Public methods for external access
    showDiscoveryDashboard() {
        const dashboard = document.getElementById('content-discovery-dashboard');
        if (dashboard) {
            dashboard.classList.remove('hidden');
            dashboard.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeDiscoveryDashboard() {
        const dashboard = document.getElementById('content-discovery-dashboard');
        if (dashboard) {
            dashboard.classList.remove('active');
            setTimeout(() => {
                dashboard.classList.add('hidden');
                document.body.style.overflow = '';
            }, 300);
        }
    }
}

// Global initialization
let contentDiscoveryDashboard;

// Initialize immediately when script loads
function initializeContentDiscoveryDashboard() {
    if (!window.ContentDiscoveryDashboard) {
        contentDiscoveryDashboard = new ContentDiscoveryDashboard(window.app);
        
        // Make globally accessible
        window.ContentDiscoveryDashboard = contentDiscoveryDashboard;
        
        console.log('Content Discovery Dashboard initialized successfully');
    }
    return window.ContentDiscoveryDashboard;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeContentDiscoveryDashboard();
});

// Also initialize immediately if DOM is already ready
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initializeContentDiscoveryDashboard);
} else {
    // DOM is already loaded
    initializeContentDiscoveryDashboard();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentDiscoveryDashboard;
}

// Enhanced global function to open discovery dashboard with better error handling
function discoverContent() {
    try {
        // Ensure the dashboard is initialized
        const dashboard = window.ContentDiscoveryDashboard || initializeContentDiscoveryDashboard();
        
        if (dashboard && typeof dashboard.showDiscoveryDashboard === 'function') {
            dashboard.showDiscoveryDashboard();
            if (window.app && window.app.showToast) {
                window.app.showToast('Content Discovery opened! 🌟', 'success');
            }
            console.log('Content Discovery Dashboard launched successfully');
        } else {
            throw new Error('Dashboard not properly initialized');
        }
    } catch (error) {
        console.error('Error launching Content Discovery Dashboard:', error);
        if (window.app && window.app.showToast) {
            window.app.showToast('Error launching Content Discovery Dashboard. Please refresh and try again.', 'error');
        }
    }
}
