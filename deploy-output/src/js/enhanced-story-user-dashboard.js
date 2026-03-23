/**
 * ConnectHub - Enhanced Story User Dashboard System
 * Comprehensive dashboard that displays detailed user information after clicking user names in stories
 * Extends the existing story user interaction with advanced features
 */

class EnhancedStoryUserDashboard {
    constructor(app) {
        this.app = app;
        this.activePopover = null;
        this.userCache = new Map();
        this.followingStatus = new Map();
        this.userInteractions = new Map();
        this.activityFeeds = new Map();
        this.userAnalytics = new Map();
        
        this.init();
    }

    /**
     * Initialize enhanced story user dashboard system
     */
    init() {
        this.setupUserNameClickHandlers();
        this.preloadUserData();
        this.initializeUserInteractionTracking();
        console.log('Enhanced Story User Dashboard System initialized');
    }

    /**
     * Setup click handlers for user names in stories
     */
    setupUserNameClickHandlers() {
        document.addEventListener('click', (e) => {
            const storyUserName = e.target.closest('.story-name');
            const storyUserInfo = e.target.closest('.story-user-name');
            const storyUsername = e.target.closest('.story-username');
            
            if (storyUserName || storyUserInfo || storyUsername) {
                e.stopPropagation();
                
                const storyItem = e.target.closest('.story-item') || e.target.closest('.stories-viewer-header');
                const userId = this.getUserIdFromStoryElement(storyItem);
                const userName = (storyUserName || storyUserInfo || storyUsername).textContent;
                
                this.showEnhancedUserDashboard(userId, userName, e.target);
            }
            
            // Close dashboard when clicking outside
            if (!e.target.closest('.enhanced-user-dashboard') && !e.target.closest('.story-name') && !e.target.closest('.story-user-name') && !e.target.closest('.story-username')) {
                this.closeUserDashboard();
            }
        });

        // Handle hover effects
        document.addEventListener('mouseover', (e) => {
            const storyUserName = e.target.closest('.story-name');
            const storyUserInfo = e.target.closest('.story-user-name');
            const storyUsername = e.target.closest('.story-username');
            
            if (storyUserName || storyUserInfo || storyUsername) {
                (storyUserName || storyUserInfo || storyUsername).classList.add('hoverable');
            }
        });
    }

    /**
     * Get user ID from story element
     */
    getUserIdFromStoryElement(storyElement) {
        if (!storyElement) return null;
        
        const storyId = storyElement.dataset?.storyId;
        if (storyId) return storyId.replace('story-', 'user-');
        
        const userName = storyElement.querySelector('.story-name, .story-user-name')?.textContent;
        if (userName) {
            return 'user-' + userName.toLowerCase().replace(/\s+/g, '-');
        }
        
        return null;
    }

    /**
     * Show enhanced user dashboard with comprehensive information
     * Supports both new parameter format (userData) and legacy format (userId, userName, triggerElement)
     */
    async showEnhancedUserDashboard(userDataOrUserId, userName, triggerElement) {
        this.closeUserDashboard();
        
        let userData;
        let userId;
        
        // Handle both parameter formats
        if (typeof userDataOrUserId === 'object' && userDataOrUserId !== null) {
            // New format: showEnhancedUserDashboard(userData)
            userData = userDataOrUserId;
            userId = userData.id;
            triggerElement = triggerElement || document.querySelector('.story-username'); // Fallback trigger
        } else {
            // Legacy format: showEnhancedUserDashboard(userId, userName, triggerElement)
            userId = userDataOrUserId;
            userData = await this.getEnhancedUserData(userId, userName);
            if (!userData) return;
        }
        
        // Track interaction
        this.trackUserInteraction(userId, 'profile_view');
        
        // Create enhanced dashboard
        this.createEnhancedUserDashboard(userData, triggerElement);
    }

    /**
     * Get enhanced user data with comprehensive information
     */
    async getEnhancedUserData(userId, userName) {
        try {
            if (this.userCache.has(userId)) {
                // Refresh activity data even if cached
                const cachedData = this.userCache.get(userId);
                cachedData.recentActivity = await this.fetchUserRecentActivity(userId);
                cachedData.analytics = await this.fetchUserAnalytics(userId);
                return cachedData;
            }
            
            const userData = await this.fetchEnhancedUserData(userId, userName);
            this.userCache.set(userId, userData);
            
            return userData;
        } catch (error) {
            console.error('Failed to load enhanced user data:', error);
            return null;
        }
    }

    /**
     * Fetch enhanced user data with comprehensive information
     */
    async fetchEnhancedUserData(userId, userName) {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const enhancedUsers = {
            'user-emma-watson': {
                id: 'user-emma-watson',
                name: 'Emma Watson',
                username: '@emmawatson',
                avatar: 'https://via.placeholder.com/120x120/42b72a/ffffff?text=EW',
                coverPhoto: 'https://source.unsplash.com/600x300/?photography,portrait',
                bio: 'Professional photographer 📸 | Travel enthusiast ✈️ | Capturing life\'s beautiful moments around the world 🌍',
                location: 'New York, NY',
                website: 'www.emmawatsonphoto.com',
                joinDate: '2019-03-15',
                lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                stats: {
                    posts: 284,
                    followers: 12500,
                    following: 892,
                    stories: 3,
                    likes: 89000,
                    comments: 15600,
                    shares: 3400
                },
                verification: {
                    isVerified: true,
                    verifiedSince: '2020-01-15',
                    verificationBadges: ['photographer', 'creator']
                },
                privacy: {
                    isPrivate: false,
                    allowMessages: true,
                    allowTags: true
                },
                connections: {
                    mutualFriends: 5,
                    commonInterests: ['Photography', 'Travel'],
                    sharedGroups: ['NYC Photographers', 'Travel Enthusiasts']
                },
                interests: ['Photography', 'Travel', 'Art', 'Nature', 'Architecture'],
                recentActivity: await this.generateRecentActivity(userId),
                analytics: await this.generateUserAnalytics(userId),
                contentHighlights: {
                    topPosts: [
                        { id: 1, image: 'https://source.unsplash.com/300x300/?photography,1', likes: 450, comments: 23 },
                        { id: 2, image: 'https://source.unsplash.com/300x300/?travel,1', likes: 380, comments: 15 },
                        { id: 3, image: 'https://source.unsplash.com/300x300/?nature,1', likes: 520, comments: 31 }
                    ],
                    recentStories: [
                        { id: 1, thumbnail: 'https://source.unsplash.com/80x80/?photography,2', timestamp: Date.now() - 1000 * 60 * 60 * 1 },
                        { id: 2, thumbnail: 'https://source.unsplash.com/80x80/?travel,2', timestamp: Date.now() - 1000 * 60 * 60 * 3 },
                        { id: 3, thumbnail: 'https://source.unsplash.com/80x80/?nature,2', timestamp: Date.now() - 1000 * 60 * 60 * 6 }
                    ]
                },
                socialProof: {
                    endorsements: 15,
                    recommendations: 8,
                    collaborations: 12
                }
            },
            'user-alex-johnson': {
                id: 'user-alex-johnson',
                name: 'Alex Johnson',
                username: '@alexj',
                avatar: 'https://via.placeholder.com/120x120/ff6b6b/ffffff?text=AJ',
                coverPhoto: 'https://source.unsplash.com/600x300/?travel,adventure',
                bio: 'Digital nomad 🌍 | Adventure seeker 🏔️ | Sharing my journey around the world | Currently exploring Southeast Asia',
                location: 'Currently in Bali, Indonesia',
                website: 'alexjohnson.travel',
                joinDate: '2020-07-22',
                lastActive: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
                stats: {
                    posts: 156,
                    followers: 8900,
                    following: 654,
                    stories: 5,
                    likes: 45000,
                    comments: 8900,
                    shares: 2100
                },
                verification: {
                    isVerified: false,
                    verifiedSince: null,
                    verificationBadges: ['traveler']
                },
                privacy: {
                    isPrivate: false,
                    allowMessages: true,
                    allowTags: true
                },
                connections: {
                    mutualFriends: 2,
                    commonInterests: ['Travel', 'Adventure'],
                    sharedGroups: ['Digital Nomads', 'Adventure Seekers']
                },
                interests: ['Travel', 'Adventure', 'Food', 'Culture', 'Photography'],
                recentActivity: await this.generateRecentActivity(userId),
                analytics: await this.generateUserAnalytics(userId),
                contentHighlights: {
                    topPosts: [
                        { id: 1, image: 'https://source.unsplash.com/300x300/?travel,3', likes: 320, comments: 18 },
                        { id: 2, image: 'https://source.unsplash.com/300x300/?adventure,1', likes: 280, comments: 12 },
                        { id: 3, image: 'https://source.unsplash.com/300x300/?food,1', likes: 410, comments: 25 }
                    ],
                    recentStories: [
                        { id: 1, thumbnail: 'https://source.unsplash.com/80x80/?travel,3', timestamp: Date.now() - 1000 * 60 * 30 },
                        { id: 2, thumbnail: 'https://source.unsplash.com/80x80/?adventure,2', timestamp: Date.now() - 1000 * 60 * 120 },
                        { id: 3, thumbnail: 'https://source.unsplash.com/80x80/?food,2', timestamp: Date.now() - 1000 * 60 * 180 }
                    ]
                },
                socialProof: {
                    endorsements: 8,
                    recommendations: 5,
                    collaborations: 7
                }
            }
        };
        
        return enhancedUsers[userId] || await this.generateDefaultEnhancedUserData(userId, userName);
    }

    /**
     * Generate default enhanced user data
     */
    async generateDefaultEnhancedUserData(userId, userName) {
        const stats = {
            posts: Math.floor(Math.random() * 500) + 50,
            followers: Math.floor(Math.random() * 10000) + 200,
            following: Math.floor(Math.random() * 2000) + 100,
            stories: Math.floor(Math.random() * 10) + 1,
            likes: Math.floor(Math.random() * 50000) + 1000,
            comments: Math.floor(Math.random() * 10000) + 500,
            shares: Math.floor(Math.random() * 5000) + 200
        };

        return {
            id: userId,
            name: userName,
            username: '@' + userName.toLowerCase().replace(/\s+/g, ''),
            avatar: `https://via.placeholder.com/120x120/6c5ce7/ffffff?text=${userName.charAt(0)}`,
            coverPhoto: 'https://source.unsplash.com/600x300/?abstract',
            bio: `ConnectHub user | Sharing moments and connecting with friends`,
            location: null,
            website: null,
            joinDate: '2021-01-01',
            lastActive: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24),
            stats: stats,
            verification: {
                isVerified: Math.random() > 0.8,
                verifiedSince: null,
                verificationBadges: []
            },
            privacy: {
                isPrivate: Math.random() > 0.7,
                allowMessages: true,
                allowTags: Math.random() > 0.3
            },
            connections: {
                mutualFriends: Math.floor(Math.random() * 15),
                commonInterests: ['Social Media', 'Technology'],
                sharedGroups: []
            },
            interests: ['Social Media', 'Technology', 'Music'],
            recentActivity: await this.generateRecentActivity(userId),
            analytics: await this.generateUserAnalytics(userId),
            contentHighlights: {
                topPosts: [],
                recentStories: []
            },
            socialProof: {
                endorsements: Math.floor(Math.random() * 20),
                recommendations: Math.floor(Math.random() * 15),
                collaborations: Math.floor(Math.random() * 10)
            }
        };
    }

    /**
     * Generate recent activity data
     */
    async generateRecentActivity(userId) {
        const activities = [
            { type: 'post', action: 'shared a new photo', timestamp: Date.now() - 1000 * 60 * 60 * 2, engagement: 45 },
            { type: 'story', action: 'added to their story', timestamp: Date.now() - 1000 * 60 * 60 * 4, engagement: 23 },
            { type: 'comment', action: 'commented on a friend\'s post', timestamp: Date.now() - 1000 * 60 * 60 * 6, engagement: 12 },
            { type: 'like', action: 'liked several posts', timestamp: Date.now() - 1000 * 60 * 60 * 8, engagement: 8 },
            { type: 'follow', action: 'started following 3 new people', timestamp: Date.now() - 1000 * 60 * 60 * 12, engagement: 5 }
        ];

        return activities.slice(0, Math.floor(Math.random() * 4) + 2);
    }

    /**
     * Generate user analytics data
     */
    async generateUserAnalytics(userId) {
        return {
            engagement: {
                rate: (Math.random() * 8 + 2).toFixed(1) + '%',
                trend: Math.random() > 0.5 ? 'up' : 'down',
                change: (Math.random() * 2 + 0.5).toFixed(1) + '%'
            },
            reach: {
                weekly: Math.floor(Math.random() * 5000) + 500,
                monthly: Math.floor(Math.random() * 20000) + 2000,
                growth: (Math.random() * 15 + 5).toFixed(1) + '%'
            },
            interactions: {
                avgLikesPerPost: Math.floor(Math.random() * 200) + 50,
                avgCommentsPerPost: Math.floor(Math.random() * 30) + 5,
                avgSharesPerPost: Math.floor(Math.random() * 20) + 2
            }
        };
    }

    /**
     * Create enhanced user dashboard with comprehensive information
     */
    createEnhancedUserDashboard(userData, triggerElement) {
        const isFollowing = this.followingStatus.get(userData.id) || false;
        const isCurrentUser = userData.id === this.app.currentUser?.id;
        
        const dashboard = document.createElement('div');
        dashboard.id = 'enhanced-user-dashboard';
        dashboard.className = 'enhanced-user-dashboard';
        
        dashboard.innerHTML = `
            <div class="dashboard-content">
                ${this.renderDashboardHeader(userData)}
                ${this.renderUserProfileSection(userData)}
                ${this.renderUserStatsSection(userData)}
                ${this.renderUserAnalyticsSection(userData)}
                ${this.renderRecentActivitySection(userData)}
                ${this.renderContentHighlightsSection(userData)}
                ${this.renderConnectionsSection(userData)}
                ${this.renderActionButtonsSection(userData, isFollowing, isCurrentUser)}
                ${this.renderSocialProofSection(userData)}
            </div>
        `;
        
        this.positionDashboard(dashboard, triggerElement);
        document.body.appendChild(dashboard);
        this.activePopover = dashboard;
        
        setTimeout(() => {
            dashboard.classList.add('show');
        }, 10);
        
        this.setupDashboardInteractions(dashboard, userData);
        this.setupDashboardAutoClose(dashboard);
    }

    /**
     * Render dashboard header
     */
    renderDashboardHeader(userData) {
        return `
            <div class="dashboard-header">
                <div class="header-background">
                    <img src="${userData.coverPhoto}" alt="Cover photo" class="cover-photo">
                    <div class="header-overlay"></div>
                </div>
                <div class="header-content">
                    <div class="profile-avatar-section">
                        <div class="avatar-container">
                            <img src="${userData.avatar}" alt="${userData.name}" class="profile-avatar">
                            ${userData.verification.isVerified ? '<div class="verified-badge"><i class="fas fa-check-circle"></i></div>' : ''}
                        </div>
                        <div class="online-status ${this.getUserOnlineStatus(userData.lastActive)}">
                            <div class="status-dot"></div>
                        </div>
                    </div>
                    <button class="close-dashboard-btn" onclick="enhancedStoryDashboard.closeUserDashboard()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render user profile section
     */
    renderUserProfileSection(userData) {
        return `
            <div class="dashboard-profile-section">
                <div class="profile-identity">
                    <h2 class="profile-name">
                        ${userData.name}
                        ${userData.verification.isVerified ? '<i class="fas fa-check-circle verified-icon"></i>' : ''}
                    </h2>
                    <p class="profile-username">${userData.username}</p>
                    ${userData.verification.verificationBadges.length > 0 ? `
                        <div class="verification-badges">
                            ${userData.verification.verificationBadges.map(badge => `
                                <span class="verification-badge">${badge}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                ${userData.bio ? `
                    <div class="profile-bio">
                        <p>${userData.bio}</p>
                    </div>
                ` : ''}
                
                <div class="profile-metadata">
                    ${userData.location ? `
                        <div class="meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${userData.location}</span>
                        </div>
                    ` : ''}
                    ${userData.website ? `
                        <div class="meta-item">
                            <i class="fas fa-link"></i>
                            <a href="https://${userData.website}" target="_blank" rel="noopener">${userData.website}</a>
                        </div>
                    ` : ''}
                    <div class="meta-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Joined ${this.formatDate(userData.joinDate)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>Active ${this.getTimeAgo(userData.lastActive)}</span>
                    </div>
                    ${userData.connections.mutualFriends > 0 ? `
                        <div class="meta-item mutual-connections">
                            <i class="fas fa-users"></i>
                            <span>${userData.connections.mutualFriends} mutual friend${userData.connections.mutualFriends > 1 ? 's' : ''}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render user stats section
     */
    renderUserStatsSection(userData) {
        return `
            <div class="dashboard-stats-section">
                <h4>Profile Statistics</h4>
                <div class="stats-grid">
                    <div class="stat-card primary-stats">
                        <div class="stat-item" onclick="enhancedStoryDashboard.viewUserPosts('${userData.id}')">
                            <div class="stat-number">${this.formatNumber(userData.stats.posts)}</div>
                            <div class="stat-label">Posts</div>
                        </div>
                        <div class="stat-item" onclick="enhancedStoryDashboard.viewFollowers('${userData.id}')">
                            <div class="stat-number">${this.formatNumber(userData.stats.followers)}</div>
                            <div class="stat-label">Followers</div>
                        </div>
                        <div class="stat-item" onclick="enhancedStoryDashboard.viewFollowing('${userData.id}')">
                            <div class="stat-number">${this.formatNumber(userData.stats.following)}</div>
                            <div class="stat-label">Following</div>
                        </div>
                        <div class="stat-item" onclick="enhancedStoryDashboard.viewAllUserStories('${userData.id}')">
                            <div class="stat-number">${userData.stats.stories}</div>
                            <div class="stat-label">Stories</div>
                        </div>
                    </div>
                    
                    <div class="stat-card engagement-stats">
                        <div class="stat-item">
                            <div class="stat-number">${this.formatNumber(userData.stats.likes)}</div>
                            <div class="stat-label">Total Likes</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${this.formatNumber(userData.stats.comments)}</div>
                            <div class="stat-label">Comments</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${this.formatNumber(userData.stats.shares)}</div>
                            <div class="stat-label">Shares</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render user analytics section
     */
    renderUserAnalyticsSection(userData) {
        return `
            <div class="dashboard-analytics-section">
                <h4>User Analytics</h4>
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <div class="analytics-header">
                            <h5>Engagement Rate</h5>
                            <span class="trend-indicator ${userData.analytics.engagement.trend}">
                                <i class="fas fa-arrow-${userData.analytics.engagement.trend}"></i>
                                ${userData.analytics.engagement.change}
                            </span>
                        </div>
                        <div class="analytics-value">${userData.analytics.engagement.rate}</div>
                    </div>
                    
                    <div class="analytics-card">
                        <div class="analytics-header">
                            <h5>Monthly Reach</h5>
                            <span class="growth-indicator">
                                +${userData.analytics.reach.growth}
                            </span>
                        </div>
                        <div class="analytics-value">${this.formatNumber(userData.analytics.reach.monthly)}</div>
                    </div>
                    
                    <div class="analytics-card">
                        <div class="analytics-header">
                            <h5>Avg. Engagement</h5>
                        </div>
                        <div class="engagement-breakdown">
                            <div class="engagement-item">
                                <span class="label">Likes:</span>
                                <span class="value">${userData.analytics.interactions.avgLikesPerPost}</span>
                            </div>
                            <div class="engagement-item">
                                <span class="label">Comments:</span>
                                <span class="value">${userData.analytics.interactions.avgCommentsPerPost}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render recent activity section
     */
    renderRecentActivitySection(userData) {
        return `
            <div class="dashboard-activity-section">
                <h4>Recent Activity</h4>
                <div class="activity-feed">
                    ${userData.recentActivity.map(activity => `
                        <div class="activity-item">
                            <div class="activity-icon ${activity.type}">
                                <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                            </div>
                            <div class="activity-content">
                                <span class="activity-text">${activity.action}</span>
                                <span class="activity-time">${this.getTimeAgo(new Date(activity.timestamp))}</span>
                                ${activity.engagement ? `
                                    <div class="activity-engagement">
                                        <i class="fas fa-heart"></i>
                                        <span>${activity.engagement}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render content highlights section
     */
    renderContentHighlightsSection(userData) {
        return `
            <div class="dashboard-content-section">
                <h4>Content Highlights</h4>
                ${userData.contentHighlights.topPosts.length > 0 ? `
                    <div class="content-showcase">
                        <h5>Top Posts</h5>
                        <div class="top-posts-grid">
                            ${userData.contentHighlights.topPosts.map(post => `
                                <div class="post-preview" onclick="enhancedStoryDashboard.viewPost('${post.id}')">
                                    <img src="${post.image}" alt="Post ${post.id}">
                                    <div class="post-stats">
                                        <span class="stat">
                                            <i class="fas fa-heart"></i>
                                            ${post.likes}
                                        </span>
                                        <span class="stat">
                                            <i class="fas fa-comment"></i>
                                            ${post.comments}
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${userData.contentHighlights.recentStories.length > 0 ? `
                    <div class="recent-stories-section">
                        <h5>Recent Stories</h5>
                        <div class="stories-timeline">
                            ${userData.contentHighlights.recentStories.map(story => `
                                <div class="story-preview" onclick="enhancedStoryDashboard.viewStory('${story.id}')">
                                    <img src="${story.thumbnail}" alt="Story ${story.id}">
                                    <div class="story-time">${this.getTimeAgo(new Date(story.timestamp))}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render connections section
     */
    renderConnectionsSection(userData) {
        return `
            <div class="dashboard-connections-section">
                <h4>Connections & Interests</h4>
                
                ${userData.connections.commonInterests.length > 0 ? `
                    <div class="common-interests">
                        <h5>Common Interests</h5>
                        <div class="interests-tags">
                            ${userData.connections.commonInterests.map(interest => `
                                <span class="interest-tag common">${interest}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${userData.interests.length > 0 ? `
                    <div class="user-interests">
                        <h5>All Interests</h5>
                        <div class="interests-tags">
                            ${userData.interests.map(interest => `
                                <span class="interest-tag">${interest}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${userData.connections.sharedGroups.length > 0 ? `
                    <div class="shared-groups">
                        <h5>Shared Groups</h5>
                        <div class="groups-list">
                            ${userData.connections.sharedGroups.map(group => `
                                <div class="group-item">
                                    <i class="fas fa-users"></i>
                                    <span>${group}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render action buttons section
     */
    renderActionButtonsSection(userData, isFollowing, isCurrentUser) {
        return `
            <div class="dashboard-actions-section">
                <div class="primary-actions">
                    ${!isCurrentUser ? `
                        <button class="action-btn follow-btn ${isFollowing ? 'following' : 'follow'}" 
                                onclick="enhancedStoryDashboard.toggleFollow('${userData.id}')" 
                                id="follow-btn-${userData.id}">
                            <i class="fas fa-${isFollowing ? 'user-check' : 'user-plus'}"></i>
                            <span>${isFollowing ? 'Following' : 'Follow'}</span>
                        </button>
                        <button class="action-btn message-btn" onclick="enhancedStoryDashboard.messageUser('${userData.id}')">
                            <i class="fas fa-comment"></i>
                            <span>Message</span>
                        </button>
                        <button class="action-btn share-btn" onclick="enhancedStoryDashboard.shareProfile('${userData.id}')">
                            <i class="fas fa-share"></i>
                            <span>Share</span>
                        </button>
                    ` : `
                        <button class="action-btn edit-profile-btn" onclick="enhancedStoryDashboard.editProfile()">
                            <i class="fas fa-edit"></i>
                            <span>Edit Profile</span>
                        </button>
                        <button class="action-btn settings-btn" onclick="enhancedStoryDashboard.profileSettings()">
                            <i class="fas fa-cog"></i>
                            <span>Settings</span>
                        </button>
                    `}
                </div>
                
                <div class="secondary-actions">
                    <div class="action-dropdown">
                        <button class="action-btn dropdown-toggle" onclick="enhancedStoryDashboard.toggleActionMenu('${userData.id}')">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                        <div class="action-dropdown-menu" id="action-menu-${userData.id}" style="display: none;">
                            ${!isCurrentUser ? `
                                <button class="dropdown-item" onclick="enhancedStoryDashboard.viewFullProfile('${userData.id}')">
                                    <i class="fas fa-user"></i>
                                    <span>View Full Profile</span>
                                </button>
                                <button class="dropdown-item" onclick="enhancedStoryDashboard.addToFriends('${userData.id}')">
                                    <i class="fas fa-user-friends"></i>
                                    <span>Add Friend</span>
                                </button>
                                <button class="dropdown-item" onclick="enhancedStoryDashboard.muteUserStories('${userData.id}')">
                                    <i class="fas fa-volume-mute"></i>
                                    <span>Mute Stories</span>
                                </button>
                                <hr class="dropdown-divider">
                                <button class="dropdown-item block-item" onclick="enhancedStoryDashboard.blockUser('${userData.id}')">
                                    <i class="fas fa-ban"></i>
                                    <span>Block User</span>
                                </button>
                                <button class="dropdown-item report-item" onclick="enhancedStoryDashboard.reportUser('${userData.id}')">
                                    <i class="fas fa-flag"></i>
                                    <span>Report User</span>
                                </button>
                            ` : `
                                <button class="dropdown-item" onclick="enhancedStoryDashboard.viewFullProfile('${userData.id}')">
                                    <i class="fas fa-user"></i>
                                    <span>View My Profile</span>
                                </button>
                                <button class="dropdown-item" onclick="enhancedStoryDashboard.privacySettings()">
                                    <i class="fas fa-shield-alt"></i>
                                    <span>Privacy Settings</span>
                                </button>
                                <button class="dropdown-item" onclick="enhancedStoryDashboard.accountSettings()">
                                    <i class="fas fa-cog"></i>
                                    <span>Account Settings</span>
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render social proof section
     */
    renderSocialProofSection(userData) {
        return `
            <div class="dashboard-social-proof-section">
                <h4>Social Proof</h4>
                <div class="social-proof-grid">
                    <div class="proof-item">
                        <div class="proof-number">${userData.socialProof.endorsements}</div>
                        <div class="proof-label">Endorsements</div>
                    </div>
                    <div class="proof-item">
                        <div class="proof-number">${userData.socialProof.recommendations}</div>
                        <div class="proof-label">Recommendations</div>
                    </div>
                    <div class="proof-item">
                        <div class="proof-number">${userData.socialProof.collaborations}</div>
                        <div class="proof-label">Collaborations</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Position dashboard relative to trigger element
     */
    positionDashboard(dashboard, triggerElement) {
        const rect = triggerElement.getBoundingClientRect();
        const dashboardWidth = 450; // Fixed width from CSS
        const dashboardHeight = 700; // Approximate height
        
        let left = rect.left + (rect.width / 2) - (dashboardWidth / 2);
        let top = rect.bottom + 10;
        
        // Adjust for viewport boundaries
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Horizontal adjustment
        if (left < 10) {
            left = 10;
        } else if (left + dashboardWidth > viewportWidth - 10) {
            left = viewportWidth - dashboardWidth - 10;
        }
        
        // Vertical adjustment
        if (top + dashboardHeight > viewportHeight - 10) {
            top = rect.top - dashboardHeight - 10;
            if (top < 10) {
                top = 10;
                dashboard.classList.add('scrollable');
            }
        }
        
        dashboard.style.position = 'fixed';
        dashboard.style.left = left + 'px';
        dashboard.style.top = top + 'px';
        dashboard.style.zIndex = '10001';
    }

    /**
     * Setup dashboard interactions
     */
    setupDashboardInteractions(dashboard, userData) {
        // Add smooth scroll behavior for long content
        const content = dashboard.querySelector('.dashboard-content');
        if (content.scrollHeight > content.clientHeight) {
            content.classList.add('scrollable');
        }
        
        // Setup tab navigation for sections
        this.setupSectionNavigation(dashboard);
        
        // Setup keyboard navigation
        this.setupKeyboardNavigation(dashboard);
    }

    /**
     * Setup dashboard auto-close functionality
     */
    setupDashboardAutoClose(dashboard) {
        // Close on escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeUserDashboard();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Auto-close after 45 seconds of inactivity
        let inactivityTimer = setTimeout(() => {
            this.closeUserDashboard();
        }, 45000);
        
        // Reset timer on interaction
        dashboard.addEventListener('mousemove', () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                this.closeUserDashboard();
            }, 45000);
        });
    }

    /**
     * Setup section navigation
     */
    setupSectionNavigation(dashboard) {
        const sections = dashboard.querySelectorAll('[class*="-section"]');
        sections.forEach((section, index) => {
            section.addEventListener('click', () => {
                sections.forEach(s => s.classList.remove('active'));
                section.classList.add('active');
            });
        });
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation(dashboard) {
        const focusableElements = dashboard.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach((element, index) => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const nextIndex = e.shiftKey ? index - 1 : index + 1;
                    const nextElement = focusableElements[nextIndex] || focusableElements[0];
                    nextElement.focus();
                }
            });
        });
    }

    /**
     * Close user dashboard
     */
    closeUserDashboard() {
        if (this.activePopover) {
            this.activePopover.classList.remove('show');
            setTimeout(() => {
                if (this.activePopover && this.activePopover.parentElement) {
                    this.activePopover.remove();
                }
                this.activePopover = null;
            }, 300);
        }
        
        // Close any open action menus
        document.querySelectorAll('.action-dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }

    /**
     * Helper methods
     */
    
    getUserOnlineStatus(lastActive) {
        const now = new Date();
        const diffInMinutes = Math.floor((now - lastActive) / (1000 * 60));
        
        if (diffInMinutes < 5) return 'online';
        if (diffInMinutes < 30) return 'away';
        return 'offline';
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    getActivityIcon(type) {
        const icons = {
            'post': 'image',
            'story': 'clock',
            'comment': 'comment',
            'like': 'heart',
            'follow': 'user-plus',
            'share': 'share'
        };
        return icons[type] || 'circle';
    }

    /**
     * User interaction tracking
     */
    
    initializeUserInteractionTracking() {
        // Initialize interaction tracking system
        console.log('User interaction tracking initialized');
    }

    trackUserInteraction(userId, interactionType) {
        if (!this.userInteractions.has(userId)) {
            this.userInteractions.set(userId, []);
        }
        
        this.userInteractions.get(userId).push({
            type: interactionType,
            timestamp: new Date(),
            sessionId: this.generateSessionId()
        });
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Preload user data for better performance
     */
    preloadUserData() {
        console.log('Preloading enhanced user data for visible stories...');
    }

    /**
     * Action handlers
     */
    
    toggleFollow(userId) {
        const isCurrentlyFollowing = this.followingStatus.get(userId) || false;
        const newStatus = !isCurrentlyFollowing;
        
        this.followingStatus.set(userId, newStatus);
        this.trackUserInteraction(userId, newStatus ? 'follow' : 'unfollow');
        
        const followBtn = document.getElementById(`follow-btn-${userId}`);
        if (followBtn) {
            const icon = followBtn.querySelector('i');
            const text = followBtn.querySelector('span');
            
            if (newStatus) {
                followBtn.className = 'action-btn follow-btn following';
                icon.className = 'fas fa-user-check';
                text.textContent = 'Following';
                this.app.showToast('Now following user', 'success');
            } else {
                followBtn.className = 'action-btn follow-btn follow';
                icon.className = 'fas fa-user-plus';
                text.textContent = 'Follow';
                this.app.showToast('Unfollowed user', 'info');
            }
        }
    }

    messageUser(userId) {
        const userData = this.userCache.get(userId);
        this.trackUserInteraction(userId, 'message_intent');
        this.app.showToast(`Opening chat with ${userData?.name || 'user'}...`, 'info');
        this.closeUserDashboard();
    }

    shareProfile(userId) {
        const userData = this.userCache.get(userId);
        this.trackUserInteraction(userId, 'share');
        
        if (navigator.share) {
            navigator.share({
                title: `${userData?.name || 'User'}'s Profile`,
                text: `Check out ${userData?.name || 'this user'}'s profile on ConnectHub!`,
                url: `https://connecthub.com/profile/${userId}`
            });
        } else {
            const url = `https://connecthub.com/profile/${userId}`;
            navigator.clipboard.writeText(url).then(() => {
                this.app.showToast('Profile link copied to clipboard', 'success');
            });
        }
        this.closeUserDashboard();
    }

    editProfile() {
        this.app.showToast('Opening profile editor...', 'info');
        this.closeUserDashboard();
    }

    profileSettings() {
        this.app.showToast('Opening profile settings...', 'info');
        this.closeUserDashboard();
    }

    viewFullProfile(userId) {
        const userData = this.userCache.get(userId);
        this.trackUserInteraction(userId, 'view_full_profile');
        this.app.showToast(`Opening ${userData?.name || 'user'}'s full profile...`, 'info');
        this.closeUserDashboard();
    }

    addToFriends(userId) {
        const userData = this.userCache.get(userId);
        this.trackUserInteraction(userId, 'friend_request');
        this.app.showToast(`Friend request sent to ${userData?.name || 'user'}`, 'success');
        this.closeUserDashboard();
    }

    muteUserStories(userId) {
        const userData = this.userCache.get(userId);
        this.trackUserInteraction(userId, 'mute_stories');
        this.app.showToast(`Muted ${userData?.name || 'user'}'s stories`, 'info');
        this.closeUserDashboard();
    }

    blockUser(userId) {
        const userData = this.userCache.get(userId);
        if (confirm(`Are you sure you want to block ${userData?.name || 'this user'}?`)) {
            this.trackUserInteraction(userId, 'block');
            this.app.showToast(`Blocked ${userData?.name || 'user'}`, 'warning');
            this.closeUserDashboard();
        }
    }

    reportUser(userId) {
        const userData = this.userCache.get(userId);
        this.trackUserInteraction(userId, 'report');
        this.app.showToast(`Report submitted for ${userData?.name || 'user'}`, 'warning');
        this.closeUserDashboard();
    }

    viewUserPosts(userId) {
        const userData = this.userCache.get(userId);
        this.trackUserInteraction(userId, 'view_posts');
        this.app.showToast(`Viewing ${userData?.name || 'user'}'s posts...`, 'info');
        this.closeUserDashboard();
    }

    viewFollowers(userId) {
        const userData = this.userCache.get(userId);
        this.trackUserInteraction(userId, 'view_followers');
        this.app.showToast(`Viewing ${userData?.name || 'user'}'s followers...`, 'info');
        this.closeUserDashboard();
    }

    viewFollowing(userId) {
        const userData = this.userCache.get(userId);
        this.trackUserInteraction(userId, 'view_following');
        this.app.showToast(`Viewing who ${userData?.name || 'user'} follows...`, 'info');
        this.closeUserDashboard();
    }

    viewAllUserStories(userId) {
        const userData = this.userCache.get(userId);
        this.trackUserInteraction(userId, 'view_all_stories');
        this.app.showToast(`Viewing all stories by ${userData?.name || 'user'}...`, 'info');
        this.closeUserDashboard();
    }

    viewPost(postId) {
        this.app.showToast(`Opening post ${postId}...`, 'info');
    }

    viewStory(storyId) {
        this.app.showToast(`Opening story ${storyId}...`, 'info');
    }

    toggleActionMenu(userId) {
        const menu = document.getElementById(`action-menu-${userId}`);
        if (menu) {
            const isVisible = menu.style.display !== 'none';
            
            document.querySelectorAll('.action-dropdown-menu').forEach(m => {
                m.style.display = 'none';
            });
            
            menu.style.display = isVisible ? 'none' : 'block';
        }
    }

    privacySettings() {
        this.app.showToast('Opening privacy settings...', 'info');
        this.closeUserDashboard();
    }

    accountSettings() {
        this.app.showToast('Opening account settings...', 'info');
        this.closeUserDashboard();
    }

    /**
     * Cleanup method
     */
    destroy() {
        this.closeUserDashboard();
        this.userCache.clear();
        this.followingStatus.clear();
        this.userInteractions.clear();
        this.activityFeeds.clear();
        this.userAnalytics.clear();
        console.log('Enhanced Story User Dashboard System cleaned up');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const initEnhancedStoryDashboard = () => {
        if (typeof app !== 'undefined' && app) {
            window.enhancedStoryDashboard = new EnhancedStoryUserDashboard(app);
            console.log('Enhanced Story User Dashboard System initialized and ready!');
        } else {
            setTimeout(initEnhancedStoryDashboard, 100);
        }
    };
    
    setTimeout(initEnhancedStoryDashboard, 500);
});

// Export for use
window.EnhancedStoryUserDashboard = EnhancedStoryUserDashboard;
