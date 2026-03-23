/**
 * ConnectHub - Optimized Content Discovery Dashboard Redesign
 * A fast and responsive content discovery interface
 */

class NewContentDiscoveryDashboard {
    constructor(app) {
        this.app = app || window.app || { showToast: (msg, type) => console.log(msg) };
        this.currentLanguage = 'en';
        
        // Discovery state management
        this.currentView = 'trending';
        this.currentCategory = 'all';
        this.currentFilters = {
            timeRange: '24h',
            contentType: 'all',
            engagement: 'all'
        };
        
        // Generate lightweight content
        this.trendingContent = this.generateTrendingContent();
        this.personalizedContent = this.generatePersonalizedRecommendations();
        this.categoryContent = this.generateCategoryContent();
        this.liveContent = this.generateLiveContent();
        this.liveStats = this.generateLiveStats();
        
        this.updateIntervals = {};
        
        this.translations = {
            en: {
                discoverContent: 'Discover Content',
                trending: 'Trending',
                forYou: 'For You',
                categories: 'Categories',
                liveNow: 'Live Now',
                findFriends: 'Find Friends',
                refresh: 'Refresh',
                like: 'Like',
                comment: 'Comment',
                share: 'Share',
                save: 'Save',
                loading: 'Loading...',
                activeUsers: 'Active Users',
                dailyConnections: 'Daily Connections',
                matchSuccessRate: 'Match Success Rate',
                liveStreams: 'Live Streams',
                personalizedRecommendations: 'Personalized Recommendations',
                basedOnActivity: 'Based on your activity and interests',
                trendingNow: 'Trending Now'
            }
        };

        this.initializeDiscoveryDashboard();
    }

    t(key) {
        return this.translations[this.currentLanguage]?.[key] || key;
    }

    // Generate optimized trending content
    generateTrendingContent() {
        const users = [
            { name: 'Emma Wilson', avatar: 'EW', verified: true, followers: '2.4M' },
            { name: 'Mike Johnson', avatar: 'MJ', verified: false, followers: '856K' },
            { name: 'Sarah Miller', avatar: 'SM', verified: true, followers: '1.2M' },
            { name: 'Alex Chen', avatar: 'AC', verified: false, followers: '634K' }
        ];

        const categories = ['Tech', 'Lifestyle', 'Travel', 'Food'];
        const contentTemplates = [
            'Amazing AI breakthrough! 🤖',
            'Living my best life! ✨',
            'Incredible adventure! 🌍',
            'Life-changing recipe! 🍽️'
        ];

        const trendingPosts = [];
        
        for (let i = 0; i < 8; i++) {
            const user = users[i % users.length];
            const category = categories[i % categories.length];
            
            trendingPosts.push({
                id: `trending_${i}`,
                user: user.name,
                avatar: user.avatar,
                verified: user.verified,
                followers: user.followers,
                category: category,
                type: ['image', 'video', 'text', 'poll'][i % 4],
                content: contentTemplates[i % contentTemplates.length],
                hashtags: [`#${category}`, '#ConnectHub'],
                image: (i % 3 === 0) ? `https://picsum.photos/600/400?random=${i}` : null,
                likes: Math.floor(Math.random() * 10000) + 1000,
                comments: Math.floor(Math.random() * 500) + 50,
                shares: Math.floor(Math.random() * 200) + 25,
                views: Math.floor(Math.random() * 50000) + 10000,
                time: this.getRandomTimeAgo(),
                trendingScore: Math.floor(Math.random() * 50) + 50,
                engagementRate: Math.floor(Math.random() * 30) + 25,
                isSponsored: false,
                location: this.getRandomLocation()
            });
        }
        
        return trendingPosts.sort((a, b) => b.trendingScore - a.trendingScore);
    }

    generatePersonalizedRecommendations() {
        const userInterests = ['Technology', 'Photography', 'Travel', 'Cooking'];
        const recommendations = {
            basedOnInterests: [],
            followedCreators: []
        };

        userInterests.forEach((interest, index) => {
            recommendations.basedOnInterests.push({
                id: `interest_${index}`,
                title: `${interest} Content You'll Love`,
                description: `AI-curated ${interest.toLowerCase()} content`,
                interest: interest,
                content: this.generateRecommendedPosts(interest, 3),
                confidence: Math.floor(Math.random() * 30) + 70,
                matchReason: `Based on your ${interest.toLowerCase()} activity`,
                icon: this.getInterestIcon(interest)
            });
        });

        const creators = [
            { name: 'TechGuru_2024', avatar: 'TG', niche: 'Technology', followers: '5.2M' },
            { name: 'PhotoMaster_Pro', avatar: 'PM', niche: 'Photography', followers: '3.8M' }
        ];

        creators.forEach((creator, index) => {
            recommendations.followedCreators.push({
                id: `creator_${index}`,
                creator: creator.name,
                avatar: creator.avatar,
                niche: creator.niche,
                followers: creator.followers,
                content: this.generateCreatorPosts(creator, 3),
                isLive: Math.random() > 0.7,
                mutualConnections: Math.floor(Math.random() * 20) + 5,
                engagementPredict: Math.floor(Math.random() * 40) + 60
            });
        });

        return recommendations;
    }

    generateCategoryContent() {
        return {
            social: {
                title: 'Social Posts',
                description: 'Connect with friends and communities',
                icon: '👥',
                color: 'var(--primary)',
                content: this.generateCategoryPosts('social', 6),
                stats: { totalPosts: '2.4M', activeUsers: '156K', engagement: '23.4%' }
            },
            media: {
                title: 'Media Content',
                description: 'Photos, videos, and multimedia',
                icon: '🎬',
                color: 'var(--secondary)',
                content: this.generateCategoryPosts('media', 6),
                stats: { totalPosts: '1.8M', activeUsers: '89K', engagement: '31.2%' }
            },
            interactive: {
                title: 'Interactive Content',
                description: 'Polls, quizzes, and challenges',
                icon: '🎮',
                color: 'var(--accent)',
                content: this.generateCategoryPosts('interactive', 6),
                stats: { totalPosts: '567K', activeUsers: '78K', engagement: '45.7%' }
            },
            live: {
                title: 'Live Content',
                description: 'Live streams and real-time events',
                icon: '🔴',
                color: 'var(--error)',
                content: this.generateCategoryPosts('live', 6),
                stats: { totalPosts: '23K', activeUsers: '12K', engagement: '67.8%' }
            }
        };
    }

    generateLiveContent() {
        const liveStreamers = [
            { name: 'TechTalks_Live', avatar: 'TT', category: 'Tech Talk', expertise: 'AI & Machine Learning' },
            { name: 'MusicSession_Pro', avatar: 'MS', category: 'Music', expertise: 'Electronic Music' },
            { name: 'CookingLive_Chef', avatar: 'CL', category: 'Cooking', expertise: 'International Cuisine' },
            { name: 'GameStream_HD', avatar: 'GS', category: 'Gaming', expertise: 'Competitive Gaming' }
        ];

        return liveStreamers.map((streamer, index) => ({
            id: `live_${index}`,
            streamer: streamer.name,
            avatar: streamer.avatar,
            displayName: streamer.name.replace(/_/g, ' '),
            title: `Live ${streamer.category}`,
            category: streamer.category,
            expertise: streamer.expertise,
            viewers: Math.floor(Math.random() * 5000) + 500,
            duration: Math.floor(Math.random() * 60) + 15,
            thumbnail: `https://picsum.photos/400/225?random=${index + 200}`,
            quality: ['HD', '4K', '1080p'][index % 3],
            tags: ['Live', 'Interactive', 'Chat'],
            isLive: true,
            language: 'English',
            rating: (Math.random() * 2 + 3).toFixed(1),
            followers: Math.floor(Math.random() * 100000) + 10000
        }));
    }

    generateLiveStats() {
        return {
            activeUsers: Math.floor(Math.random() * 50000) + 150000,
            dailyConnections: Math.floor(Math.random() * 10000) + 45000,
            matchSuccessRate: (Math.random() * 15 + 70).toFixed(1) + '%',
            liveStreams: 4,
            totalViewers: 25000,
            countries: 150,
            languages: 42
        };
    }

    // Helper methods
    getRandomTimeAgo() {
        const options = ['2h ago', '5h ago', '1d ago', '3d ago', '1w ago'];
        return options[Math.floor(Math.random() * options.length)];
    }

    getRandomLocation() {
        const locations = ['New York, NY', 'Los Angeles, CA', 'London, UK', 'Tokyo, Japan', 'Sydney, AU'];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    getInterestIcon(interest) {
        const icons = {
            'Technology': '💻',
            'Photography': '📸',
            'Travel': '✈️',
            'Cooking': '🍳'
        };
        return icons[interest] || '✨';
    }

    generateRecommendedPosts(interest, count) {
        const posts = [];
        for (let i = 0; i < count; i++) {
            posts.push({
                id: `rec_${interest}_${i}`,
                title: `${interest} Post ${i + 1}`,
                type: 'image',
                likes: Math.floor(Math.random() * 1000) + 100,
                engagement: Math.floor(Math.random() * 50) + 25
            });
        }
        return posts;
    }

    generateCreatorPosts(creator, count) {
        const posts = [];
        for (let i = 0; i < count; i++) {
            posts.push({
                id: `creator_${creator.name}_${i}`,
                title: `${creator.niche} Content ${i + 1}`,
                type: 'video',
                likes: Math.floor(Math.random() * 5000) + 500,
                views: Math.floor(Math.random() * 20000) + 2000
            });
        }
        return posts;
    }

    generateCategoryPosts(category, count) {
        const posts = [];
        for (let i = 0; i < count; i++) {
            posts.push({
                id: `cat_${category}_${i}`,
                title: `${category} Post ${i + 1}`,
                type: ['image', 'video', 'text'][i % 3],
                likes: Math.floor(Math.random() * 2000) + 200,
                engagement: Math.floor(Math.random() * 40) + 20
            });
        }
        return posts;
    }

    initializeDiscoveryDashboard() {
        this.createDiscoveryInterface();
        this.setupEventListeners();
        this.startRealTimeUpdates();
    }

    createDiscoveryInterface() {
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
                    <div class="discovery-header">
                        <div class="discovery-title-section">
                            <h1>🌟 ${this.t('discoverContent')}</h1>
                            <p>Explore trending content, personalized recommendations, and live streams</p>
                            <div class="live-stats-bar">
                                <div class="stat-item">
                                    <span class="stat-icon">👥</span>
                                    <span class="stat-value">${this.liveStats.activeUsers.toLocaleString()}</span>
                                    <span class="stat-label">${this.t('activeUsers')}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-icon">💫</span>
                                    <span class="stat-value">${this.liveStats.dailyConnections.toLocaleString()}</span>
                                    <span class="stat-label">${this.t('dailyConnections')}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-icon">🎯</span>
                                    <span class="stat-value">${this.liveStats.matchSuccessRate}</span>
                                    <span class="stat-label">${this.t('matchSuccessRate')}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-icon">🔴</span>
                                    <span class="stat-value">${this.liveStats.liveStreams}</span>
                                    <span class="stat-label">${this.t('liveStreams')}</span>
                                </div>
                            </div>
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

                    <div class="discovery-nav">
                        <button class="discovery-tab active" data-view="trending">
                            <i class="fas fa-fire"></i>
                            <span>${this.t('trending')}</span>
                        </button>
                        <button class="discovery-tab" data-view="foryou">
                            <i class="fas fa-heart"></i>
                            <span>${this.t('forYou')}</span>
                        </button>
                        <button class="discovery-tab" data-view="categories">
                            <i class="fas fa-th-large"></i>
                            <span>${this.t('categories')}</span>
                        </button>
                        <button class="discovery-tab" data-view="live">
                            <i class="fas fa-broadcast-tower"></i>
                            <span>${this.t('liveNow')}</span>
                            <div class="live-dot"></div>
                        </button>
                        <button class="discovery-tab" data-view="friends">
                            <i class="fas fa-users"></i>
                            <span>${this.t('findFriends')}</span>
                        </button>
                    </div>

                    <div class="discovery-filters">
                        <div class="filters-section">
                            <div class="filter-group">
                                <label for="timeRangeFilter">Time Range</label>
                                <select id="timeRangeFilter">
                                    <option value="1h">Last Hour</option>
                                    <option value="24h" selected>Last 24 Hours</option>
                                    <option value="7d">Last 7 Days</option>
                                    <option value="30d">Last 30 Days</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label for="contentTypeFilter">Content Type</label>
                                <select id="contentTypeFilter">
                                    <option value="all" selected>All Content</option>
                                    <option value="image">Images</option>
                                    <option value="video">Videos</option>
                                    <option value="text">Text Posts</option>
                                    <option value="poll">Polls</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label for="engagementFilter">Engagement</label>
                                <select id="engagementFilter">
                                    <option value="all" selected>All Engagement</option>
                                    <option value="high">High (>75%)</option>
                                    <option value="medium">Medium (50-75%)</option>
                                    <option value="rising">Rising Fast</option>
                                </select>
                            </div>
                            <div class="filter-actions">
                                <button id="applyFilters" class="apply-filters-btn">Apply Filters</button>
                                <button id="clearFilters" class="clear-filters-btn">Clear All</button>
                            </div>
                        </div>
                        <div class="search-section">
                            <div class="search-input-group">
                                <input type="text" id="discoverySearch" placeholder="Search trending content..." />
                                <button id="searchDiscovery" class="search-discovery-btn">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                            <div class="trending-suggestions">
                                <div class="suggestion-item">#ConnectHub</div>
                                <div class="suggestion-item">#AITech</div>
                                <div class="suggestion-item">#Photography</div>
                                <div class="suggestion-item">#Travel2024</div>
                            </div>
                        </div>
                    </div>

                    <div class="discovery-content">
                        <div id="trendingView" class="discovery-view active">
                            ${this.renderTrendingView()}
                        </div>
                        <div id="foryouView" class="discovery-view">
                            ${this.renderForYouView()}
                        </div>
                        <div id="categoriesView" class="discovery-view">
                            ${this.renderCategoriesView()}
                        </div>
                        <div id="liveView" class="discovery-view">
                            ${this.renderLiveView()}
                        </div>
                        <div id="friendsView" class="discovery-view">
                            ${this.renderFriendsIntegration()}
                        </div>
                    </div>

                    <div id="discoveryLoading" class="discovery-loading hidden">
                        <div class="loading-animation">
                            <div class="loading-spinner"></div>
                            <div class="loading-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                        <p id="loadingMessage">${this.t('loading')}</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(dashboard);
        this.injectDiscoveryStyles();
    }

    renderTrendingView() {
        return `
            <div class="trending-section">
                <div class="section-header">
                    <div class="section-title">
                        <h2>🔥 ${this.t('trendingNow')}</h2>
                        <div class="section-subtitle">Discover what's viral and trending</div>
                    </div>
                </div>
                
                <div class="trending-categories">
                    <button class="category-filter active" data-category="all">
                        <span class="filter-icon">🌟</span>
                        <span>All</span>
                    </button>
                    <button class="category-filter" data-category="Tech">
                        <span class="filter-icon">💻</span>
                        <span>Tech</span>
                    </button>
                    <button class="category-filter" data-category="Lifestyle">
                        <span class="filter-icon">✨</span>
                        <span>Lifestyle</span>
                    </button>
                    <button class="category-filter" data-category="Travel">
                        <span class="filter-icon">✈️</span>
                        <span>Travel</span>
                    </button>
                    <button class="category-filter" data-category="Food">
                        <span class="filter-icon">🍽️</span>
                        <span>Food</span>
                    </button>
                </div>

                <div class="trending-content-grid">
                    ${this.renderTrendingContent(this.trendingContent)}
                </div>
            </div>
        `;
    }

    renderTrendingContent(content) {
        return content.map(post => `
            <div class="trending-post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="user-info">
                        <div class="user-avatar ${post.verified ? 'verified' : ''}">${post.avatar}</div>
                        <div class="user-details">
                            <div class="user-name">
                                ${post.user}
                                ${post.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                            </div>
                            <div class="user-meta">
                                <span class="followers">${post.followers} followers</span>
                                <span class="separator">•</span>
                                <span class="category">${post.category}</span>
                                <span class="separator">•</span>
                                <span class="time">${post.time}</span>
                            </div>
                        </div>
                    </div>
                    <div class="trending-score">
                        <span class="score-value">${post.trendingScore}</span>
                        <span class="score-label">Trending</span>
                    </div>
                </div>

                <div class="post-content">
                    <p class="post-text">${post.content}</p>
                    <div class="post-hashtags">
                        ${post.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join('')}
                    </div>
                    ${post.image ? `<div class="post-image"><img src="${post.image}" alt="Post content" /></div>` : ''}
                </div>

                <div class="post-metrics">
                    <div class="engagement-stats">
                        <div class="stat">
                            <span class="stat-icon">❤️</span>
                            <span class="stat-value">${post.likes.toLocaleString()}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-icon">💬</span>
                            <span class="stat-value">${post.comments.toLocaleString()}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-icon">🔄</span>
                            <span class="stat-value">${post.shares.toLocaleString()}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-icon">👁️</span>
                            <span class="stat-value">${post.views.toLocaleString()}</span>
                        </div>
                    </div>
                    <div class="engagement-rate">
                        <span class="rate-value">${post.engagementRate}%</span>
                        <span class="rate-label">Engagement</span>
                    </div>
                </div>

                <div class="post-actions">
                    <button class="action-btn like-btn" data-action="like" data-post-id="${post.id}">
                        <i class="fas fa-heart"></i>
                        <span>${this.t('like')}</span>
                    </button>
                    <button class="action-btn comment-btn" data-action="comment" data-post-id="${post.id}">
                        <i class="fas fa-comment"></i>
                        <span>${this.t('comment')}</span>
                    </button>
                    <button class="action-btn share-btn" data-action="share" data-post-id="${post.id}">
                        <i class="fas fa-share"></i>
                        <span>${this.t('share')}</span>
                    </button>
                    <button class="action-btn save-btn" data-action="save" data-post-id="${post.id}">
                        <i class="fas fa-bookmark"></i>
                        <span>${this.t('save')}</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderForYouView() {
        return `
            <div class="foryou-section">
                <div class="section-header">
                    <div class="section-title">
                        <h2>❤️ ${this.t('personalizedRecommendations')}</h2>
                        <div class="section-subtitle">${this.t('basedOnActivity')}</div>
                    </div>
                    <div class="ai-badge">
                        <i class="fas fa-robot"></i>
                        <span>AI Powered</span>
                    </div>
                </div>

                <div class="recommendation-category">
                    <h3>🎯 Based on Your Interests</h3>
                    <div class="recommendation-grid">
                        ${this.personalizedContent.basedOnInterests.map(rec => `
                            <div class="recommendation-card">
                                <div class="rec-header">
                                    <div class="rec-icon">${rec.icon}</div>
                                    <div class="rec-title">
                                        <h4>${rec.title}</h4>
                                        <p>${rec.description}</p>
                                    </div>
                                    <div class="confidence-badge">${rec.confidence}% match</div>
                                </div>
                                <div class="rec-reason">${rec.matchReason}</div>
                                <div class="rec-content-preview">
                                    ${this.renderContentPreview(rec.content)}
                                </div>
                                <div class="rec-actions">
                                    <button class="explore-rec-btn">
                                        <i class="fas fa-arrow-right"></i>
                                        Explore ${rec.content.length} posts
                                    </button>
                                    <button class="rec-feedback-btn">
                                        <i class="fas fa-thumbs-up"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="recommendation-category">
                    <h3>👤 Creators You Might Like</h3>
                    <div class="creator-recommendations">
                        ${this.personalizedContent.followedCreators.map(creator => `
                            <div class="creator-rec-card">
                                <div class="creator-header">
                                    <div class="creator-avatar">${creator.avatar}</div>
                                    <div class="creator-info">
                                        <h4>${creator.creator}</h4>
                                        <div class="creator-meta">
                                            <span class="niche-tag">${creator.niche}</span>
                                            <span class="followers-count">${creator.followers} followers</span>
                                        </div>
                                        ${creator.isLive ? '<div class="live-badge">🔴 Live</div>' : ''}
                                        <div class="mutual-connections">${creator.mutualConnections} mutual connections</div>
                                    </div>
                                    <div class="engagement-predict">
                                        <div class="predict-score">${creator.engagementPredict}%</div>
                                        <div class="predict-label">Engagement Predict</div>
                                    </div>
                                </div>
                                <div class="creator-content-preview">
                                    ${this.renderContentPreview(creator.content)}
                                </div>
                                <div class="creator-actions">
                                    <button class="follow-creator-btn">
                                        <i class="fas fa-plus"></i> Follow
                                    </button>
                                    <button class="view-creator-btn">
                                        <i class="fas fa-user"></i> View Profile
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderCategoriesView() {
        return `
            <div class="categories-section">
                <div class="section-header">
                    <div class="section-title">
                        <h2>📂 Content Categories</h2>
                        <div class="section-subtitle">Explore content organized by type</div>
                    </div>
                </div>

                <div class="categories-grid">
                    ${Object.entries(this.categoryContent).map(([key, category]) => `
                        <div class="category-section-card">
                            <div class="category-header">
                                <div class="category-icon" style="color: ${category.color}">${category.icon}</div>
                                <div class="category-info">
                                    <h3>${category.title}</h3>
                                    <p>${category.description}</p>
                                </div>
                            </div>
                            
                            <div class="category-stats">
                                <div class="stat-row">
                                    <div class="stat">
                                        <span class="stat-value">${category.stats.totalPosts}</span>
                                        <span class="stat-label">Total Posts</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-value">${category.stats.activeUsers}</span>
                                        <span class="stat-label">Active Users</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-value">${category.stats.engagement}</span>
                                        <span class="stat-label">Engagement</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="category-content-preview">
                                ${this.renderCategoryContentPreview(category.content)}
                            </div>
                            
                            <div class="category-actions">
                                <button class="explore-category-btn">
                                    <i class="fas fa-arrow-right"></i> Explore ${category.title}
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderLiveView() {
        return `
            <div class="live-section">
                <div class="section-header">
                    <div class="section-title">
                        <h2>🔴 ${this.t('liveNow')}</h2>
                        <div class="section-subtitle">Join live streams from around the world</div>
                    </div>
                </div>

                <div class="live-streams-grid">
                    ${this.liveContent.map(stream => `
                        <div class="live-stream-card">
                            <div class="stream-thumbnail">
                                <img src="${stream.thumbnail}" alt="${stream.title}" />
                                <div class="live-overlay">
                                    <div class="live-indicator">🔴 LIVE</div>
                                    <div class="stream-duration">${Math.floor(stream.duration / 60)}h ${stream.duration % 60}m</div>
                                </div>
                                <div class="stream-quality-badge">${stream.quality}</div>
                                <div class="viewers-count">👥 ${stream.viewers.toLocaleString()}</div>
                            </div>
                            
                            <div class="stream-info">
                                <div class="stream-header">
                                    <div class="streamer-avatar">${stream.avatar}</div>
                                    <div class="stream-details">
                                        <h4>${stream.title}</h4>
                                        <div class="streamer-name">${stream.displayName}</div>
                                        <div class="stream-category">${stream.category}</div>
                                    </div>
                                    <div class="stream-rating">
                                        <span class="rating-stars">⭐</span>
                                        <span class="rating-value">${stream.rating}</span>
                                    </div>
                                </div>
                                
                                <div class="stream-expertise">
                                    <span class="expertise-tag">${stream.expertise}</span>
                                    <span class="language-tag">${stream.language}</span>
                                </div>
                                
                                <div class="stream-tags">
                                    ${stream.tags.map(tag => `<span class="stream-tag">${tag}</span>`).join('')}
                                </div>
                                
                                <div class="stream-actions">
                                    <button class="watch-stream-btn">
                                        <i class="fas fa-play"></i> Watch Live
                                    </button>
                                    <button class="follow-streamer-btn">
                                        <i class="fas fa-heart"></i> Follow
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderFriendsIntegration() {
        return `
            <div class="friends-integration-section">
                <div class="section-header">
                    <div class="section-title">
                        <h2>👥 ${this.t('findFriends')}</h2>
                        <div class="section-subtitle">Connect with interesting people</div>
                    </div>
                </div>

                <div class="friends-integration-content">
                    <div class="integration-card">
                        <div class="integration-icon">🚀</div>
                        <h3>Meet People Dashboard</h3>
                        <p>Revolutionary dating and networking platform with AI matching, video profiles, and discovery tools.</p>
                        <div class="integration-features">
                            <div class="feature">✨ AI-Powered Matching</div>
                            <div class="feature">📱 Video Profiles</div>
                            <div class="feature">🌍 Global Discovery</div>
                            <div class="feature">🎯 Advanced Filters</div>
                        </div>
                        <button class="open-meet-people-btn" id="openMeetPeopleDashboard">
                            <i class="fas fa-heart"></i>
                            Open Meet People Dashboard
                        </button>
                    </div>

                    <div class="quick-stats-grid">
                        <div class="quick-stat">
                            <div class="stat-icon">💕</div>
                            <div class="stat-value">2.4M+</div>
                            <div class="stat-label">Active Singles</div>
                        </div>
                        <div class="quick-stat">
                            <div class="stat-icon">🎯</div>
                            <div class="stat-value">89%</div>
                            <div class="stat-label">Match Success</div>
                        </div>
                        <div class="quick-stat">
                            <div class="stat-icon">🌍</div>
                            <div class="stat-value">195</div>
                            <div class="stat-label">Countries</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderContentPreview(content) {
        return content.slice(0, 3).map(item => `
            <div class="content-preview-item">
                <div class="preview-title">${item.title}</div>
                <div class="preview-stats">
                    <span class="likes">❤️ ${item.likes.toLocaleString()}</span>
                    <span class="engagement">${item.engagement || 0}%</span>
                </div>
            </div>
        `).join('');
    }

    renderCategoryContentPreview(content) {
        return content.slice(0, 4).map((item, index) => `
            <div class="category-preview-item">
                <div class="preview-thumbnail">
                    <img src="https://picsum.photos/150/100?random=${item.id + index}" alt="${item.title}" />
                    <div class="preview-type">${item.type}</div>
                </div>
                <div class="preview-info">
                    <div class="preview-title">${item.title}</div>
                    <div class="preview-engagement">${item.engagement}% engagement</div>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        const dashboard = document.getElementById('content-discovery-dashboard');
        if (!dashboard) return;

        // Tab navigation
        dashboard.querySelectorAll('.discovery-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const button = e.currentTarget;
                const viewName = button.dataset.view;
                if (viewName) {
                    this.switchView(viewName);
                }
            });
        });

        // Close dashboard
        const closeBtn = dashboard.querySelector('#closeDiscovery');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeDashboard());
        }

        // Refresh dashboard
        const refreshBtn = dashboard.querySelector('#refreshDiscovery');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshContent());
        }

        // Filter controls
        const applyFiltersBtn = dashboard.querySelector('#applyFilters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        }

        const clearFiltersBtn = dashboard.querySelector('#clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        // Search functionality
        const searchBtn = dashboard.querySelector('#searchDiscovery');
        const searchInput = dashboard.querySelector('#discoverySearch');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
        }

        // Post actions
        dashboard.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) {
                const btn = e.target.closest('.action-btn');
                const action = btn.dataset.action;
                const postId = btn.dataset.postId;
                if (action && postId) {
                    this.handlePostAction(action, postId);
                }
            }
        });

        // Meet People Dashboard integration
        const meetPeopleBtn = dashboard.querySelector('#openMeetPeopleDashboard');
        if (meetPeopleBtn) {
            meetPeopleBtn.addEventListener('click', () => this.openMeetPeopleDashboard());
        }

        // Category filters
        dashboard.querySelectorAll('.category-filter').forEach(filter => {
            filter.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterByCategory(category);
            });
        });
    }

    switchView(viewName) {
        // Update active tab
        document.querySelectorAll('.discovery-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Update active view
        document.querySelectorAll('.discovery-view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}View`).classList.add('active');

        this.currentView = viewName;

        // Show loading animation briefly
        this.showLoading('Loading ' + viewName + ' content...');
        setTimeout(() => this.hideLoading(), 800);
    }

    showLoading(message = 'Loading...') {
        const loading = document.getElementById('discoveryLoading');
        const loadingMessage = document.getElementById('loadingMessage');
        if (loading && loadingMessage) {
            loadingMessage.textContent = message;
            loading.classList.remove('hidden');
        }
    }

    hideLoading() {
        const loading = document.getElementById('discoveryLoading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }

    closeDashboard() {
        const dashboard = document.getElementById('content-discovery-dashboard');
        if (dashboard) {
            dashboard.classList.add('hidden');
        }
        
        // Clear update intervals
        Object.values(this.updateIntervals).forEach(clearInterval);
        this.updateIntervals = {};
    }

    refreshContent() {
        this.showLoading('Refreshing content...');
        
        // Regenerate all content
        this.trendingContent = this.generateTrendingContent();
        this.personalizedContent = this.generatePersonalizedRecommendations();
        this.liveStats = this.generateLiveStats();
        
        // Update the current view
        this.updateCurrentView();
        
        setTimeout(() => {
            this.hideLoading();
            this.app.showToast('Content refreshed successfully!', 'success');
        }, 1000);
    }

    updateCurrentView() {
        const currentViewElement = document.getElementById(`${this.currentView}View`);
        if (currentViewElement) {
            switch(this.currentView) {
                case 'trending':
                    currentViewElement.innerHTML = this.renderTrendingView();
                    break;
                case 'foryou':
                    currentViewElement.innerHTML = this.renderForYouView();
                    break;
                case 'categories':
                    currentViewElement.innerHTML = this.renderCategoriesView();
                    break;
                case 'live':
                    currentViewElement.innerHTML = this.renderLiveView();
                    break;
                case 'friends':
                    currentViewElement.innerHTML = this.renderFriendsIntegration();
                    break;
            }
        }
    }

    applyFilters() {
        const timeRange = document.getElementById('timeRangeFilter')?.value;
        const contentType = document.getElementById('contentTypeFilter')?.value;
        const engagement = document.getElementById('engagementFilter')?.value;

        this.currentFilters = { timeRange, contentType, engagement };
        
        this.showLoading('Applying filters...');
        setTimeout(() => {
            this.hideLoading();
            this.app.showToast('Filters applied successfully!', 'success');
        }, 500);
    }

    clearFilters() {
        // Reset filter controls
        const timeRangeFilter = document.getElementById('timeRangeFilter');
        const contentTypeFilter = document.getElementById('contentTypeFilter');
        const engagementFilter = document.getElementById('engagementFilter');

        if (timeRangeFilter) timeRangeFilter.value = '24h';
        if (contentTypeFilter) contentTypeFilter.value = 'all';
        if (engagementFilter) engagementFilter.value = 'all';

        this.currentFilters = {
            timeRange: '24h',
            contentType: 'all',
            engagement: 'all'
        };

        this.app.showToast('Filters cleared', 'info');
    }

    performSearch() {
        const searchInput = document.getElementById('discoverySearch');
        if (searchInput && searchInput.value.trim()) {
            const query = searchInput.value.trim();
            this.showLoading(`Searching for "${query}"...`);
            
            setTimeout(() => {
                this.hideLoading();
                this.app.showToast(`Search results for "${query}"`, 'info');
            }, 800);
        }
    }

    handlePostAction(action, postId) {
        switch(action) {
            case 'like':
                this.likePost(postId);
                break;
            case 'comment':
                this.commentPost(postId);
                break;
            case 'share':
                this.sharePost(postId);
                break;
            case 'save':
                this.savePost(postId);
                break;
        }
    }

    likePost(postId) {
        // Find the post and update likes
        const postCard = document.querySelector(`[data-post-id="${postId}"]`);
        if (postCard) {
            const likeBtn = postCard.querySelector('.like-btn');
            likeBtn.classList.add('liked');
            this.app.showToast('Post liked!', 'success');
        }
    }

    commentPost(postId) {
        this.app.showToast('Comment feature coming soon!', 'info');
    }

    sharePost(postId) {
        this.app.showToast('Post shared!', 'success');
    }

    savePost(postId) {
        this.app.showToast('Post saved!', 'success');
    }

    openMeetPeopleDashboard() {
        // Close current dashboard
        this.closeDashboard();
        
        // Open Meet People Dashboard
        if (window.MeetPeopleDashboard) {
            const meetPeopleDashboard = new window.MeetPeopleDashboard(this.app);
            meetPeopleDashboard.show();
        } else {
            this.app.showToast('Meet People Dashboard will open here', 'info');
        }
    }

    filterByCategory(category) {
        // Update active filter
        document.querySelectorAll('.category-filter').forEach(filter => {
            filter.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        this.currentCategory = category;
        
        // Filter content (for demonstration)
        this.showLoading(`Loading ${category} content...`);
        setTimeout(() => {
            this.hideLoading();
            this.app.showToast(`Filtered by ${category}`, 'success');
        }, 500);
    }

    startRealTimeUpdates() {
        // Update live stats every 30 seconds
        this.updateIntervals.stats = setInterval(() => {
            this.liveStats = this.generateLiveStats();
            this.updateLiveStats();
        }, 30000);

        // Update trending content every 2 minutes
        this.updateIntervals.trending = setInterval(() => {
            this.trendingContent = this.generateTrendingContent();
            if (this.currentView === 'trending') {
                this.updateCurrentView();
            }
        }, 120000);
    }

    updateLiveStats() {
        const statsBar = document.querySelector('.live-stats-bar');
        if (statsBar) {
            const activeUsersValue = statsBar.querySelector('.stat-item:nth-child(1) .stat-value');
            const dailyConnectionsValue = statsBar.querySelector('.stat-item:nth-child(2) .stat-value');
            const matchSuccessValue = statsBar.querySelector('.stat-item:nth-child(3) .stat-value');
            const liveStreamsValue = statsBar.querySelector('.stat-item:nth-child(4) .stat-value');

            if (activeUsersValue) activeUsersValue.textContent = this.liveStats.activeUsers.toLocaleString();
            if (dailyConnectionsValue) dailyConnectionsValue.textContent = this.liveStats.dailyConnections.toLocaleString();
            if (matchSuccessValue) matchSuccessValue.textContent = this.liveStats.matchSuccessRate;
            if (liveStreamsValue) liveStreamsValue.textContent = this.liveStats.liveStreams;
        }
    }

    injectDiscoveryStyles() {
        const existingStyles = document.getElementById('new-discovery-styles');
        if (existingStyles) return;

        const styles = document.createElement('style');
        styles.id = 'new-discovery-styles';
        styles.textContent = `
            .content-discovery-dashboard {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                transition: all 0.3s ease;
            }

            .content-discovery-dashboard.hidden {
                opacity: 0;
                pointer-events: none;
            }

            .discovery-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .discovery-modal {
                width: 95%;
                max-width: 1200px;
                height: 90vh;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(20px);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            }

            .discovery-header {
                padding: 25px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .discovery-title-section h1 {
                font-size: 2rem;
                font-weight: bold;
                color: white;
                margin: 0 0 10px 0;
            }

            .discovery-title-section p {
                color: rgba(255, 255, 255, 0.8);
                margin: 0 0 15px 0;
            }

            .live-stats-bar {
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
            }

            .stat-item {
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(255, 255, 255, 0.1);
                padding: 8px 12px;
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .stat-icon {
                font-size: 1.2em;
            }

            .stat-value {
                font-weight: bold;
                color: white;
            }

            .stat-label {
                font-size: 0.9em;
                color: rgba(255, 255, 255, 0.8);
            }

            .discovery-actions {
                display: flex;
                gap: 15px;
                align-items: center;
            }

            .discovery-action-btn, .discovery-close-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 10px;
                font-size: 0.95em;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .discovery-action-btn {
                background: linear-gradient(45deg, var(--primary), var(--secondary));
                color: white;
            }

            .discovery-close-btn {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .discovery-nav {
                display: flex;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding: 0 25px;
            }

            .discovery-tab {
                padding: 15px 20px;
                border: none;
                background: none;
                color: rgba(255, 255, 255, 0.7);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                position: relative;
                border-bottom: 3px solid transparent;
            }

            .discovery-tab.active {
                color: white;
                border-bottom-color: var(--primary);
            }

            .discovery-tab:hover {
                color: white;
                background: rgba(255, 255, 255, 0.05);
            }

            .live-dot {
                width: 8px;
                height: 8px;
                background: #ff4444;
                border-radius: 50%;
                animation: pulse 2s infinite;
                margin-left: 5px;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .discovery-filters {
                padding: 20px 25px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                gap: 30px;
                align-items: center;
                flex-wrap: wrap;
            }

            .filters-section {
                display: flex;
                gap: 20px;
                align-items: center;
                flex-wrap: wrap;
            }

            .filter-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .filter-group label {
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.9em;
            }

            .filter-group select {
                padding: 8px 12px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                backdrop-filter: blur(10px);
            }

            .search-section {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .search-input-group {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .search-input-group input {
                padding: 8px 15px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                min-width: 200px;
            }

            .search-discovery-btn {
                padding: 8px 12px;
                border: none;
                border-radius: 8px;
                background: var(--primary);
                color: white;
                cursor: pointer;
            }

            .trending-suggestions {
                display: flex;
                gap: 10px;
            }

            .suggestion-item {
                padding: 4px 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                font-size: 0.85em;
                color: rgba(255, 255, 255, 0.8);
                cursor: pointer;
            }

            .discovery-content {
                flex: 1;
                overflow-y: auto;
                padding: 25px;
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
                margin-bottom: 20px;
            }

            .section-title h2 {
                color: white;
                font-size: 1.5em;
                margin: 0 0 5px 0;
            }

            .section-subtitle {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.9em;
            }

            .trending-categories {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }

            .category-filter {
                padding: 8px 15px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
            }

            .category-filter.active {
                background: var(--primary);
                border-color: var(--primary);
            }

            .trending-content-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }

            .trending-post-card {
                background: rgba(255, 255, 255, 0.08);
                border-radius: 15px;
                padding: 20px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
            }

            .post-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 15px;
            }

            .user-info {
                display: flex;
                gap: 12px;
                align-items: center;
            }

            .user-avatar {
                width: 45px;
                height: 45px;
                border-radius: 50%;
                background: linear-gradient(45deg, var(--primary), var(--secondary));
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
            }

            .user-details {
                flex: 1;
            }

            .user-name {
                color: white;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .verified-badge {
                color: #1DA1F2;
                font-size: 0.9em;
            }

            .user-meta {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.85em;
                margin-top: 2px;
            }

            .separator {
                margin: 0 5px;
            }

            .trending-score {
                text-align: center;
                background: rgba(255, 255, 255, 0.1);
                padding: 8px;
                border-radius: 8px;
            }

            .score-value {
                display: block;
                font-size: 1.2em;
                font-weight: bold;
                color: var(--primary);
            }

            .score-label {
                font-size: 0.8em;
                color: rgba(255, 255, 255, 0.7);
            }

            .post-content {
                margin-bottom: 15px;
            }

            .post-text {
                color: white;
                margin-bottom: 10px;
                line-height: 1.5;
            }

            .post-hashtags {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                margin-bottom: 10px;
            }

            .hashtag {
                color: var(--primary);
                font-size: 0.9em;
                cursor: pointer;
            }

            .post-image img {
                width: 100%;
                border-radius: 10px;
                max-height: 200px;
                object-fit: cover;
            }

            .post-metrics {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding: 10px 0;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .engagement-stats {
                display: flex;
                gap: 15px;
            }

            .stat {
                display: flex;
                align-items: center;
                gap: 5px;
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.9em;
            }

            .engagement-rate {
                text-align: right;
            }

            .rate-value {
                display: block;
                font-weight: bold;
                color: var(--accent);
            }

            .rate-label {
                font-size: 0.8em;
                color: rgba(255, 255, 255, 0.7);
            }

            .post-actions {
                display: flex;
                gap: 10px;
                justify-content: space-between;
            }

            .action-btn {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.8);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
                font-size: 0.85em;
                transition: all 0.3s ease;
            }

            .action-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                color: white;
            }

            .action-btn.liked {
                color: #ff4444;
                background: rgba(255, 68, 68, 0.1);
                border-color: #ff4444;
            }

            .discovery-loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                color: white;
            }

            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top: 3px solid var(--primary);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .loading-dots {
                display: flex;
                gap: 5px;
                justify-content: center;
                margin-bottom: 10px;
            }

            .loading-dots span {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: var(--primary);
                animation: bounce 1.4s infinite ease-in-out both;
            }

            .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
            .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

            @keyframes bounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1.0); }
            }

            .ai-badge {
                display: flex;
                align-items: center;
                gap: 5px;
                background: rgba(138, 43, 226, 0.2);
                padding: 5px 10px;
                border-radius: 15px;
                color: #DA70D6;
                font-size: 0.85em;
                border: 1px solid rgba(138, 43, 226, 0.3);
            }

            .recommendation-grid, .creator-recommendations {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                margin-top: 15px;
            }

            .recommendation-card, .creator-rec-card {
                background: rgba(255, 255, 255, 0.08);
                border-radius: 15px;
                padding: 20px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .confidence-badge {
                background: linear-gradient(45deg, #00ff88, #00cc66);
                color: black;
                padding: 3px 8px;
                border-radius: 10px;
                font-size: 0.8em;
                font-weight: bold;
            }

            .categories-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }

            .live-streams-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                gap: 20px;
            }

            .live-stream-card {
                background: rgba(255, 255, 255, 0.08);
                border-radius: 15px;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.1);
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

            .live-overlay {
                position: absolute;
                top: 10px;
                left: 10px;
                right: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .live-indicator {
                background: #ff4444;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8em;
                font-weight: bold;
            }

            .stream-quality-badge {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 0.75em;
            }

            .viewers-count {
                position: absolute;
                bottom: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8em;
            }

            .stream-info {
                padding: 15px;
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .discovery-modal {
                    width: 100%;
                    height: 100vh;
                    border-radius: 0;
                }
                
                .discovery-header {
                    padding: 15px;
                }
                
                .discovery-content {
                    padding: 15px;
                }
                
                .trending-content-grid,
                .categories-grid,
                .live-streams-grid {
                    grid-template-columns: 1fr;
                }
                
                .live-stats-bar {
                    justify-content: center;
                }
                
                .discovery-filters {
                    flex-direction: column;
                    gap: 15px;
                    align-items: stretch;
                }
                
                .filters-section {
                    justify-content: center;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    show() {
        const dashboard = document.getElementById('content-discovery-dashboard');
        if (dashboard) {
            dashboard.classList.remove('hidden');
        }
    }

    // Alias method for compatibility with app.js
    showDiscoveryDashboard() {
        this.show();
    }
}

// Make the class globally available
window.NewContentDiscoveryDashboard = NewContentDiscoveryDashboard;
