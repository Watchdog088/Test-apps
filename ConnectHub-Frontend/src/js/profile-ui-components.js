/**
 * ConnectHub Profile UI Components
 * Advanced profile interface components for comprehensive user profile management
 */

class ProfileUIComponents {
    constructor(app) {
        this.app = app;
        this.currentProfile = null;
        this.activityCache = new Map();
        this.connectionsCache = new Map();
        this.mediaCache = new Map();
        this.analyticsCache = new Map();
        this.customizationSettings = {
            theme: 'default',
            layout: 'standard',
            badges: [],
            colors: {
                primary: '#8B5CF6',
                accent: '#F59E0B'
            }
        };
        this.currentGalleryView = 'grid';
        this.selectedMediaItems = new Set();
        
        this.initializeProfileComponents();
    }

    /**
     * Initialize all profile UI components
     */
    initializeProfileComponents() {
        this.initializeActivityTimeline();
        this.initializeConnectionsManager();
        this.initializeMediaGallery();
        this.initializeAnalyticsDashboard();
        this.initializeCustomizationStudio();
        
        console.log('Profile UI Components initialized');
    }

    /**
     * 1. PROFILE ACTIVITY TIMELINE INTERFACE
     * Comprehensive timeline showing user's activities, interactions, posts, and milestones
     */
    initializeActivityTimeline() {
        this.activityTimeline = {
            container: null,
            currentFilter: 'all',
            currentPeriod: 'week',
            activities: [],
            milestones: [],
            
            create: () => {
                const timelineContainer = document.createElement('div');
                timelineContainer.className = 'activity-timeline-container';
                timelineContainer.innerHTML = `
                    <div class="activity-timeline-header">
                        <div class="timeline-title-section">
                            <h3><i class="fas fa-chart-line"></i> Activity Timeline</h3>
                            <p>Track your journey and achievements</p>
                        </div>
                        
                        <div class="timeline-controls">
                            <div class="timeline-filters">
                                <button class="timeline-filter-btn active" data-filter="all">
                                    <i class="fas fa-globe"></i> All Activity
                                </button>
                                <button class="timeline-filter-btn" data-filter="posts">
                                    <i class="fas fa-file-alt"></i> Posts
                                </button>
                                <button class="timeline-filter-btn" data-filter="social">
                                    <i class="fas fa-users"></i> Social
                                </button>
                                <button class="timeline-filter-btn" data-filter="achievements">
                                    <i class="fas fa-trophy"></i> Achievements
                                </button>
                                <button class="timeline-filter-btn" data-filter="dating">
                                    <i class="fas fa-heart"></i> Dating
                                </button>
                            </div>
                            
                            <div class="timeline-period-selector">
                                <select id="timeline-period">
                                    <option value="day">Today</option>
                                    <option value="week" selected>This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="year">This Year</option>
                                    <option value="all">All Time</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="activity-timeline-stats">
                        <div class="timeline-stat-card">
                            <div class="stat-icon posts-icon">
                                <i class="fas fa-edit"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-value" id="timeline-posts-count">47</div>
                                <div class="stat-label">Posts Created</div>
                            </div>
                        </div>
                        
                        <div class="timeline-stat-card">
                            <div class="stat-icon interactions-icon">
                                <i class="fas fa-heart"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-value" id="timeline-interactions-count">1,234</div>
                                <div class="stat-label">Interactions</div>
                            </div>
                        </div>
                        
                        <div class="timeline-stat-card">
                            <div class="stat-icon connections-icon">
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-value" id="timeline-connections-count">89</div>
                                <div class="stat-label">New Connections</div>
                            </div>
                        </div>
                        
                        <div class="timeline-stat-card">
                            <div class="stat-icon achievements-icon">
                                <i class="fas fa-trophy"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-value" id="timeline-achievements-count">12</div>
                                <div class="stat-label">Achievements</div>
                            </div>
                        </div>
                    </div>

                    <div class="activity-timeline-content">
                        <div class="timeline-navigation">
                            <button class="timeline-nav-btn" id="timeline-prev-btn">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <div class="timeline-period-display">
                                <span id="current-timeline-period">October 14-20, 2024</span>
                            </div>
                            <button class="timeline-nav-btn" id="timeline-next-btn">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>

                        <div class="timeline-events-container">
                            <div class="timeline-scroll-area" id="timeline-events">
                                <!-- Timeline events will be loaded here -->
                            </div>
                        </div>

                        <div class="timeline-milestones-section">
                            <h4><i class="fas fa-star"></i> Recent Milestones</h4>
                            <div class="milestones-grid" id="timeline-milestones">
                                <!-- Milestones will be loaded here -->
                            </div>
                        </div>
                    </div>

                    <div class="timeline-actions">
                        <button class="timeline-action-btn export-btn">
                            <i class="fas fa-download"></i> Export Timeline
                        </button>
                        <button class="timeline-action-btn share-btn">
                            <i class="fas fa-share"></i> Share Activity
                        </button>
                        <button class="timeline-action-btn privacy-btn">
                            <i class="fas fa-eye"></i> Privacy Settings
                        </button>
                    </div>
                `;

                this.setupActivityTimelineListeners(timelineContainer);
                this.loadTimelineData();
                return timelineContainer;
            }
        };

        this.activityTimeline.container = this.activityTimeline.create();
    }

    /**
     * 2. PROFILE CONNECTIONS MANAGER INTERFACE
     * Advanced followers/following management with mutual connections and recommendations
     */
    initializeConnectionsManager() {
        this.connectionsManager = {
            container: null,
            currentView: 'overview',
            selectedConnections: new Set(),
            
            create: () => {
                const connectionsContainer = document.createElement('div');
                connectionsContainer.className = 'connections-manager-container';
                connectionsContainer.innerHTML = `
                    <div class="connections-manager-header">
                        <div class="connections-title-section">
                            <h3><i class="fas fa-network-wired"></i> Connections Manager</h3>
                            <p>Manage your social network and discover new connections</p>
                        </div>
                        
                        <div class="connections-search-section">
                            <div class="connections-search-bar">
                                <i class="fas fa-search"></i>
                                <input type="text" id="connections-search" placeholder="Search connections, mutual friends, or suggested users...">
                                <button class="search-filter-btn" id="connections-filter-btn">
                                    <i class="fas fa-filter"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="connections-stats-overview">
                        <div class="connection-stat-card">
                            <div class="stat-visual">
                                <div class="stat-circle followers-circle">
                                    <div class="stat-number" id="followers-count">12.4K</div>
                                </div>
                            </div>
                            <div class="stat-details">
                                <div class="stat-title">Followers</div>
                                <div class="stat-growth">+127 this week</div>
                            </div>
                        </div>
                        
                        <div class="connection-stat-card">
                            <div class="stat-visual">
                                <div class="stat-circle following-circle">
                                    <div class="stat-number" id="following-count">1,024</div>
                                </div>
                            </div>
                            <div class="stat-details">
                                <div class="stat-title">Following</div>
                                <div class="stat-growth">+23 this week</div>
                            </div>
                        </div>
                        
                        <div class="connection-stat-card">
                            <div class="stat-visual">
                                <div class="stat-circle mutual-circle">
                                    <div class="stat-number" id="mutual-count">342</div>
                                </div>
                            </div>
                            <div class="stat-details">
                                <div class="stat-title">Mutual Friends</div>
                                <div class="stat-growth">Strong network</div>
                            </div>
                        </div>
                        
                        <div class="connection-stat-card">
                            <div class="stat-visual">
                                <div class="stat-circle engagement-circle">
                                    <div class="stat-number" id="engagement-rate">8.7%</div>
                                </div>
                            </div>
                            <div class="stat-details">
                                <div class="stat-title">Engagement Rate</div>
                                <div class="stat-growth">Above average</div>
                            </div>
                        </div>
                    </div>

                    <div class="connections-navigation-tabs">
                        <button class="connections-tab active" data-tab="overview">
                            <i class="fas fa-chart-pie"></i> Overview
                        </button>
                        <button class="connections-tab" data-tab="followers">
                            <i class="fas fa-users"></i> Followers
                        </button>
                        <button class="connections-tab" data-tab="following">
                            <i class="fas fa-user-friends"></i> Following
                        </button>
                        <button class="connections-tab" data-tab="suggested">
                            <i class="fas fa-user-plus"></i> Suggested
                        </button>
                    </div>

                    <div class="connections-content-area">
                        <div class="connections-tab-content active" id="overview-content">
                            <div class="connections-overview-grid">
                                <div class="overview-section network-visualization">
                                    <h4><i class="fas fa-project-diagram"></i> Network Visualization</h4>
                                    <div class="network-canvas" id="network-canvas">
                                        <div class="network-placeholder">
                                            <i class="fas fa-project-diagram"></i>
                                            <p>Interactive network visualization loading...</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="overview-section recent-activity">
                                    <h4><i class="fas fa-clock"></i> Recent Connection Activity</h4>
                                    <div class="recent-connections-list" id="recent-connections">
                                        <!-- Recent activity will be loaded here -->
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="connections-tab-content" id="followers-content">
                            <div class="connections-list-container" id="followers-list">
                                <!-- Followers will be loaded here -->
                            </div>
                        </div>

                        <div class="connections-tab-content" id="following-content">
                            <div class="connections-list-container" id="following-list">
                                <!-- Following will be loaded here -->
                            </div>
                        </div>

                        <div class="connections-tab-content" id="suggested-content">
                            <div class="connections-suggestions-grid" id="suggestions-grid">
                                <!-- Suggested connections will be loaded here -->
                            </div>
                        </div>
                    </div>

                    <div class="connections-bulk-actions">
                        <div class="bulk-actions-selector">
                            <input type="checkbox" id="select-all-connections" class="bulk-select-checkbox">
                            <label for="select-all-connections">Select All</label>
                            <span class="selected-count" id="selected-connections-count">0 selected</span>
                        </div>
                        
                        <div class="bulk-actions-buttons">
                            <button class="bulk-action-btn" id="bulk-organize">
                                <i class="fas fa-folder"></i> Organize
                            </button>
                            <button class="bulk-action-btn" id="bulk-message">
                                <i class="fas fa-envelope"></i> Message
                            </button>
                            <button class="bulk-action-btn" id="bulk-unfollow">
                                <i class="fas fa-user-minus"></i> Unfollow
                            </button>
                        </div>
                    </div>
                `;

                this.setupConnectionsManagerListeners(connectionsContainer);
                this.loadConnectionsData();
                return connectionsContainer;
            }
        };

        this.connectionsManager.container = this.connectionsManager.create();
    }

    /**
     * 3. PROFILE MEDIA GALLERY INTERFACE
     * Advanced media management with albums, tagging, filtering, and sharing
     */
    initializeMediaGallery() {
        this.mediaGallery = {
            container: null,
            currentView: 'grid',
            currentFilter: 'all',
            selectedItems: new Set(),
            
            create: () => {
                const galleryContainer = document.createElement('div');
                galleryContainer.className = 'media-gallery-container';
                galleryContainer.innerHTML = `
                    <div class="media-gallery-header">
                        <div class="gallery-title-section">
                            <h3><i class="fas fa-images"></i> Media Gallery</h3>
                            <p>Organize and manage your photos, videos, and albums</p>
                        </div>
                        
                        <div class="gallery-controls">
                            <div class="gallery-view-switcher">
                                <button class="view-btn active" data-view="grid">
                                    <i class="fas fa-th"></i>
                                </button>
                                <button class="view-btn" data-view="list">
                                    <i class="fas fa-list"></i>
                                </button>
                                <button class="view-btn" data-view="masonry">
                                    <i class="fas fa-columns"></i>
                                </button>
                            </div>
                            
                            <button class="gallery-upload-btn" id="upload-media-btn">
                                <i class="fas fa-upload"></i> Upload Media
                            </button>
                        </div>
                    </div>

                    <div class="media-gallery-stats">
                        <div class="media-stat-card">
                            <div class="stat-icon photos-icon">
                                <i class="fas fa-image"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-value" id="photos-count">1,247</div>
                                <div class="stat-label">Photos</div>
                            </div>
                        </div>
                        
                        <div class="media-stat-card">
                            <div class="stat-icon videos-icon">
                                <i class="fas fa-video"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-value" id="videos-count">89</div>
                                <div class="stat-label">Videos</div>
                            </div>
                        </div>
                        
                        <div class="media-stat-card">
                            <div class="stat-icon albums-icon">
                                <i class="fas fa-folder"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-value" id="albums-count">24</div>
                                <div class="stat-label">Albums</div>
                            </div>
                        </div>
                        
                        <div class="media-stat-card">
                            <div class="stat-icon storage-icon">
                                <i class="fas fa-hdd"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-value" id="storage-used">4.2 GB</div>
                                <div class="stat-label">Storage Used</div>
                            </div>
                        </div>
                    </div>

                    <div class="media-gallery-filters">
                        <div class="filter-tabs">
                            <button class="filter-tab active" data-filter="all">
                                <i class="fas fa-globe"></i> All Media
                            </button>
                            <button class="filter-tab" data-filter="photos">
                                <i class="fas fa-image"></i> Photos
                            </button>
                            <button class="filter-tab" data-filter="videos">
                                <i class="fas fa-video"></i> Videos
                            </button>
                            <button class="filter-tab" data-filter="albums">
                                <i class="fas fa-folder"></i> Albums
                            </button>
                            <button class="filter-tab" data-filter="favorites">
                                <i class="fas fa-heart"></i> Favorites
                            </button>
                        </div>
                        
                        <div class="media-search-bar">
                            <i class="fas fa-search"></i>
                            <input type="text" id="media-search" placeholder="Search media by name, tags, or date...">
                        </div>
                    </div>

                    <div class="media-gallery-content">
                        <div class="media-albums-section" id="albums-section">
                            <h4><i class="fas fa-folder-open"></i> Albums</h4>
                            <div class="albums-grid" id="albums-grid">
                                <!-- Albums will be loaded here -->
                            </div>
                        </div>

                        <div class="media-items-section">
                            <div class="media-section-header">
                                <h4><i class="fas fa-images"></i> Media Items</h4>
                                <div class="media-sort-controls">
                                    <select id="media-sort" class="sort-select">
                                        <option value="date-desc">Newest First</option>
                                        <option value="date-asc">Oldest First</option>
                                        <option value="name">Name (A-Z)</option>
                                        <option value="size">File Size</option>
                                        <option value="likes">Most Liked</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="media-grid" id="media-grid">
                                <!-- Media items will be loaded here -->
                            </div>
                        </div>
                    </div>

                    <div class="media-gallery-actions">
                        <div class="selection-info">
                            <span class="selected-count" id="selected-media-count">0 selected</span>
                            <button class="select-all-btn" id="select-all-media">Select All</button>
                        </div>
                        
                        <div class="gallery-action-buttons">
                            <button class="gallery-action-btn" id="create-album-btn">
                                <i class="fas fa-folder-plus"></i> Create Album
                            </button>
                            <button class="gallery-action-btn" id="share-media-btn">
                                <i class="fas fa-share"></i> Share Selected
                            </button>
                            <button class="gallery-action-btn" id="download-media-btn">
                                <i class="fas fa-download"></i> Download
                            </button>
                            <button class="gallery-action-btn danger" id="delete-media-btn">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;

                this.setupMediaGalleryListeners(galleryContainer);
                this.loadMediaGalleryData();
                return galleryContainer;
            }
        };

        this.mediaGallery.container = this.mediaGallery.create();
    }

    /**
     * 4. PROFILE ANALYTICS DASHBOARD INTERFACE
     * Comprehensive analytics showing profile performance, engagement metrics, and insights
     */
    initializeAnalyticsDashboard() {
        this.analyticsDashboard = {
            container: null,
            currentPeriod: 'week',
            currentMetric: 'overview',
            
            create: () => {
                const analyticsContainer = document.createElement('div');
                analyticsContainer.className = 'analytics-dashboard-container';
                analyticsContainer.innerHTML = `
                    <div class="analytics-dashboard-header">
                        <div class="analytics-title-section">
                            <h3><i class="fas fa-chart-bar"></i> Analytics Dashboard</h3>
                            <p>Track your profile performance and audience insights</p>
                        </div>
                        
                        <div class="analytics-period-selector">
                            <div class="period-buttons">
                                <button class="period-btn" data-period="day">Today</button>
                                <button class="period-btn active" data-period="week">7 Days</button>
                                <button class="period-btn" data-period="month">30 Days</button>
                                <button class="period-btn" data-period="year">1 Year</button>
                            </div>
                            <button class="export-analytics-btn" id="export-analytics">
                                <i class="fas fa-download"></i> Export Report
                            </button>
                        </div>
                    </div>

                    <div class="analytics-overview-cards">
                        <div class="analytics-card">
                            <div class="card-icon profile-views-icon">
                                <i class="fas fa-eye"></i>
                            </div>
                            <div class="card-content">
                                <div class="card-value" id="profile-views">24,567</div>
                                <div class="card-label">Profile Views</div>
                                <div class="card-change positive">
                                    <i class="fas fa-arrow-up"></i> +12.5%
                                </div>
                            </div>
                        </div>
                        
                        <div class="analytics-card">
                            <div class="card-icon engagement-icon">
                                <i class="fas fa-heart"></i>
                            </div>
                            <div class="card-content">
                                <div class="card-value" id="total-engagement">8,234</div>
                                <div class="card-label">Total Engagement</div>
                                <div class="card-change positive">
                                    <i class="fas fa-arrow-up"></i> +8.7%
                                </div>
                            </div>
                        </div>
                        
                        <div class="analytics-card">
                            <div class="card-icon reach-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="card-content">
                                <div class="card-value" id="reach">45,123</div>
                                <div class="card-label">Reach</div>
                                <div class="card-change negative">
                                    <i class="fas fa-arrow-down"></i> -2.1%
                                </div>
                            </div>
                        </div>
                        
                        <div class="analytics-card">
                            <div class="card-icon followers-growth-icon">
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <div class="card-content">
                                <div class="card-value" id="followers-growth">+347</div>
                                <div class="card-label">New Followers</div>
                                <div class="card-change positive">
                                    <i class="fas fa-arrow-up"></i> +15.3%
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="analytics-charts-section">
                        <div class="analytics-chart-container">
                            <div class="chart-header">
                                <h4><i class="fas fa-chart-line"></i> Engagement Over Time</h4>
                                <div class="chart-controls">
                                    <select id="engagement-metric" class="chart-select">
                                        <option value="likes">Likes</option>
                                        <option value="comments">Comments</option>
                                        <option value="shares">Shares</option>
                                        <option value="all" selected>All Engagement</option>
                                    </select>
                                </div>
                            </div>
                            <div class="chart-canvas" id="engagement-chart">
                                <div class="chart-placeholder">
                                    <i class="fas fa-chart-line"></i>
                                    <p>Engagement chart will be rendered here</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="analytics-chart-container">
                            <div class="chart-header">
                                <h4><i class="fas fa-chart-pie"></i> Audience Demographics</h4>
                            </div>
                            <div class="chart-canvas" id="demographics-chart">
                                <div class="demographics-breakdown">
                                    <div class="demographic-item">
                                        <div class="demo-label">Age Groups</div>
                                        <div class="demo-bars">
                                            <div class="demo-bar" style="width: 35%">18-24 (35%)</div>
                                            <div class="demo-bar" style="width: 40%">25-34 (40%)</div>
                                            <div class="demo-bar" style="width: 20%">35-44 (20%)</div>
                                            <div class="demo-bar" style="width: 5%">45+ (5%)</div>
                                        </div>
                                    </div>
                                    <div class="demographic-item">
                                        <div class="demo-label">Gender</div>
                                        <div class="demo-bars">
                                            <div class="demo-bar gender-female" style="width: 52%">Female (52%)</div>
                                            <div class="demo-bar gender-male" style="width: 46%">Male (46%)</div>
                                            <div class="demo-bar gender-other" style="width: 2%">Other (2%)</div>
                                        </div>
                                    </div>
                                    <div class="demographic-item">
                                        <div class="demo-label">Top Locations</div>
                                        <div class="demo-bars">
                                            <div class="demo-bar" style="width: 25%">New York (25%)</div>
                                            <div class="demo-bar" style="width: 18%">Los Angeles (18%)</div>
                                            <div class="demo-bar" style="width: 15%">Chicago (15%)</div>
                                            <div class="demo-bar" style="width: 42%">Other (42%)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="analytics-insights-section">
                        <div class="insights-container">
                            <div class="insights-header">
                                <h4><i class="fas fa-lightbulb"></i> Key Insights</h4>
                                <button class="insights-refresh-btn" id="refresh-insights">
                                    <i class="fas fa-sync"></i> Refresh
                                </button>
                            </div>
                            
                            <div class="insights-grid" id="insights-grid">
                                <div class="insight-card positive">
                                    <div class="insight-icon">
                                        <i class="fas fa-trending-up"></i>
                                    </div>
                                    <div class="insight-content">
                                        <div class="insight-title">Peak Engagement Time</div>
                                        <div class="insight-description">Your posts perform best between 7-9 PM on weekdays</div>
                                    </div>
                                </div>
                                
                                <div class="insight-card neutral">
                                    <div class="insight-icon">
                                        <i class="fas fa-images"></i>
                                    </div>
                                    <div class="insight-content">
                                        <div class="insight-title">Content Performance</div>
                                        <div class="insight-description">Photos with people get 40% more engagement than landscape shots</div>
                                    </div>
                                </div>
                                
                                <div class="insight-card warning">
                                    <div class="insight-icon">
                                        <i class="fas fa-exclamation-triangle"></i>
                                    </div>
                                    <div class="insight-content">
                                        <div class="insight-title">Engagement Drop</div>
                                        <div class="insight-description">Comments have decreased by 15% this week. Consider more engaging captions</div>
                                    </div>
                                </div>
                                
                                <div class="insight-card positive">
                                    <div class="insight-icon">
                                        <i class="fas fa-users"></i>
                                    </div>
                                    <div class="insight-content">
                                        <div class="insight-title">Growing Audience</div>
                                        <div class="insight-description">You're attracting more followers in the 25-34 age group</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="top-content-section">
                            <h4><i class="fas fa-star"></i> Top Performing Content</h4>
                            <div class="top-posts-grid" id="top-posts-grid">
                                <!-- Top performing posts will be loaded here -->
                            </div>
                        </div>
                    </div>
                `;

                this.setupAnalyticsDashboardListeners(analyticsContainer);
                this.loadAnalyticsData();
                return analyticsContainer;
            }
        };

        this.analyticsDashboard.container = this.analyticsDashboard.create();
    }

    /**
     * 5. PROFILE CUSTOMIZATION STUDIO INTERFACE
     * Advanced profile customization with themes, layouts, badges, and personalization
     */
    initializeCustomizationStudio() {
        this.customizationStudio = {
            container: null,
            previewMode: false,
            currentTheme: 'default',
            
            create: () => {
                const customizationContainer = document.createElement('div');
                customizationContainer.className = 'customization-studio-container';
                customizationContainer.innerHTML = `
                    <div class="customization-studio-header">
                        <div class="customization-title-section">
                            <h3><i class="fas fa-palette"></i> Customization Studio</h3>
                            <p>Personalize your profile appearance and showcase your unique style</p>
                        </div>
                        
                        <div class="customization-controls">
                            <button class="preview-toggle-btn" id="preview-toggle">
                                <i class="fas fa-eye"></i> Preview Mode
                            </button>
                            <button class="reset-customization-btn" id="reset-customization">
                                <i class="fas fa-undo"></i> Reset to Default
                            </button>
                        </div>
                    </div>

                    <div class="customization-tabs">
                        <button class="customization-tab active" data-tab="themes">
                            <i class="fas fa-paint-brush"></i> Themes
                        </button>
                        <button class="customization-tab" data-tab="layout">
                            <i class="fas fa-th-large"></i> Layout
                        </button>
                        <button class="customization-tab" data-tab="colors">
                            <i class="fas fa-palette"></i> Colors
                        </button>
                        <button class="customization-tab" data-tab="badges">
                            <i class="fas fa-award"></i> Badges
                        </button>
                        <button class="customization-tab" data-tab="fonts">
                            <i class="fas fa-font"></i> Typography
                        </button>
                    </div>

                    <div class="customization-content-area">
                        <!-- Themes Tab -->
                        <div class="customization-tab-content active" id="themes-content">
                            <div class="themes-grid">
                                <div class="theme-option active" data-theme="default">
                                    <div class="theme-preview default-theme">
                                        <div class="theme-header"></div>
                                        <div class="theme-body">
                                            <div class="theme-card"></div>
                                            <div class="theme-card"></div>
                                        </div>
                                    </div>
                                    <div class="theme-info">
                                        <div class="theme-name">Classic</div>
                                        <div class="theme-description">Clean and professional</div>
                                    </div>
                                </div>
                                
                                <div class="theme-option" data-theme="modern">
                                    <div class="theme-preview modern-theme">
                                        <div class="theme-header"></div>
                                        <div class="theme-body">
                                            <div class="theme-card"></div>
                                            <div class="theme-card"></div>
                                        </div>
                                    </div>
                                    <div class="theme-info">
                                        <div class="theme-name">Modern</div>
                                        <div class="theme-description">Bold and contemporary</div>
                                    </div>
                                </div>
                                
                                <div class="theme-option" data-theme="minimal">
                                    <div class="theme-preview minimal-theme">
                                        <div class="theme-header"></div>
                                        <div class="theme-body">
                                            <div class="theme-card"></div>
                                            <div class="theme-card"></div>
                                        </div>
                                    </div>
                                    <div class="theme-info">
                                        <div class="theme-name">Minimal</div>
                                        <div class="theme-description">Simple and elegant</div>
                                    </div>
                                </div>
                                
                                <div class="theme-option" data-theme="creative">
                                    <div class="theme-preview creative-theme">
                                        <div class="theme-header"></div>
                                        <div class="theme-body">
                                            <div class="theme-card"></div>
                                            <div class="theme-card"></div>
                                        </div>
                                    </div>
                                    <div class="theme-info">
                                        <div class="theme-name">Creative</div>
                                        <div class="theme-description">Artistic and vibrant</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Layout Tab -->
                        <div class="customization-tab-content" id="layout-content">
                            <div class="layout-options">
                                <div class="layout-section">
                                    <h4><i class="fas fa-columns"></i> Profile Layout</h4>
                                    <div class="layout-grid">
                                        <div class="layout-option active" data-layout="standard">
                                            <div class="layout-preview standard-layout">
                                                <div class="layout-header"></div>
                                                <div class="layout-sidebar"></div>
                                                <div class="layout-main"></div>
                                            </div>
                                            <div class="layout-name">Standard</div>
                                        </div>
                                        
                                        <div class="layout-option" data-layout="centered">
                                            <div class="layout-preview centered-layout">
                                                <div class="layout-header"></div>
                                                <div class="layout-main-centered"></div>
                                            </div>
                                            <div class="layout-name">Centered</div>
                                        </div>
                                        
                                        <div class="layout-option" data-layout="wide">
                                            <div class="layout-preview wide-layout">
                                                <div class="layout-header"></div>
                                                <div class="layout-content-wide"></div>
                                            </div>
                                            <div class="layout-name">Wide</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="layout-section">
                                    <h4><i class="fas fa-th"></i> Content Organization</h4>
                                    <div class="organization-options">
                                        <div class="organization-option">
                                            <input type="checkbox" id="show-activity-timeline" checked>
                                            <label for="show-activity-timeline">Show Activity Timeline</label>
                                        </div>
                                        <div class="organization-option">
                                            <input type="checkbox" id="show-media-gallery" checked>
                                            <label for="show-media-gallery">Show Media Gallery</label>
                                        </div>
                                        <div class="organization-option">
                                            <input type="checkbox" id="show-connections-manager" checked>
                                            <label for="show-connections-manager">Show Connections Manager</label>
                                        </div>
                                        <div class="organization-option">
                                            <input type="checkbox" id="show-analytics-dashboard" checked>
                                            <label for="show-analytics-dashboard">Show Analytics Dashboard</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Colors Tab -->
                        <div class="customization-tab-content" id="colors-content">
                            <div class="color-customization">
                                <div class="color-section">
                                    <h4><i class="fas fa-palette"></i> Primary Color</h4>
                                    <div class="color-picker-container">
                                        <input type="color" id="primary-color" value="#8B5CF6" class="color-picker">
                                        <div class="color-presets">
                                            <button class="color-preset" data-color="#8B5CF6" style="background-color: #8B5CF6;"></button>
                                            <button class="color-preset" data-color="#EF4444" style="background-color: #EF4444;"></button>
                                            <button class="color-preset" data-color="#10B981" style="background-color: #10B981;"></button>
                                            <button class="color-preset" data-color="#F59E0B" style="background-color: #F59E0B;"></button>
                                            <button class="color-preset" data-color="#3B82F6" style="background-color: #3B82F6;"></button>
                                            <button class="color-preset" data-color="#8B5CF6" style="background-color: #8B5CF6;"></button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="color-section">
                                    <h4><i class="fas fa-star"></i> Accent Color</h4>
                                    <div class="color-picker-container">
                                        <input type="color" id="accent-color" value="#F59E0B" class="color-picker">
                                        <div class="color-presets">
                                            <button class="color-preset" data-color="#F59E0B" style="background-color: #F59E0B;"></button>
                                            <button class="color-preset" data-color="#06B6D4" style="background-color: #06B6D4;"></button>
                                            <button class="color-preset" data-color="#EC4899" style="background-color: #EC4899;"></button>
                                            <button class="color-preset" data-color="#84CC16" style="background-color: #84CC16;"></button>
                                            <button class="color-preset" data-color="#F97316" style="background-color: #F97316;"></button>
                                            <button class="color-preset" data-color="#A855F7" style="background-color: #A855F7;"></button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="color-section">
                                    <h4><i class="fas fa-adjust"></i> Background Style</h4>
                                    <div class="background-options">
                                        <div class="background-option active" data-bg="solid">
                                            <div class="bg-preview solid-bg"></div>
                                            <div class="bg-name">Solid</div>
                                        </div>
                                        <div class="background-option" data-bg="gradient">
                                            <div class="bg-preview gradient-bg"></div>
                                            <div class="bg-name">Gradient</div>
                                        </div>
                                        <div class="background-option" data-bg="pattern">
                                            <div class="bg-preview pattern-bg"></div>
                                            <div class="bg-name">Pattern</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Badges Tab -->
                        <div class="customization-tab-content" id="badges-content">
                            <div class="badges-customization">
                                <div class="badges-section">
                                    <h4><i class="fas fa-trophy"></i> Achievement Badges</h4>
                                    <div class="badges-grid available-badges">
                                        <div class="badge-item earned" data-badge="verified">
                                            <div class="badge-icon verified">
                                                <i class="fas fa-check-circle"></i>
                                            </div>
                                            <div class="badge-info">
                                                <div class="badge-name">Verified</div>
                                                <div class="badge-description">Account verified</div>
                                            </div>
                                            <div class="badge-status earned">Earned</div>
                                        </div>
                                        
                                        <div class="badge-item earned" data-badge="creator">
                                            <div class="badge-icon creator">
                                                <i class="fas fa-paint-brush"></i>
                                            </div>
                                            <div class="badge-info">
                                                <div class="badge-name">Content Creator</div>
                                                <div class="badge-description">Posted 100+ quality content</div>
                                            </div>
                                            <div class="badge-status earned">Earned</div>
                                        </div>
                                        
                                        <div class="badge-item earned" data-badge="social">
                                            <div class="badge-icon social">
                                                <i class="fas fa-users"></i>
                                            </div>
                                            <div class="badge-info">
                                                <div class="badge-name">Social Butterfly</div>
                                                <div class="badge-description">1K+ connections made</div>
                                            </div>
                                            <div class="badge-status earned">Earned</div>
                                        </div>
                                        
                                        <div class="badge-item progress" data-badge="influencer">
                                            <div class="badge-icon influencer">
                                                <i class="fas fa-star"></i>
                                            </div>
                                            <div class="badge-info">
                                                <div class="badge-name">Influencer</div>
                                                <div class="badge-description">10K+ followers needed</div>
                                            </div>
                                            <div class="badge-status progress">78% Complete</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="badges-section">
                                    <h4><i class="fas fa-star"></i> Displayed Badges</h4>
                                    <p>Drag badges here to display on your profile (max 3)</p>
                                    <div class="displayed-badges-area" id="displayed-badges">
                                        <div class="badge-slot active">
                                            <div class="badge-icon verified">
                                                <i class="fas fa-check-circle"></i>
                                            </div>
                                        </div>
                                        <div class="badge-slot active">
                                            <div class="badge-icon creator">
                                                <i class="fas fa-paint-brush"></i>
                                            </div>
                                        </div>
                                        <div class="badge-slot empty">
                                            <i class="fas fa-plus"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Typography Tab -->
                        <div class="customization-tab-content" id="fonts-content">
                            <div class="typography-customization">
                                <div class="font-section">
                                    <h4><i class="fas fa-font"></i> Font Family</h4>
                                    <div class="font-options">
                                        <div class="font-option active" data-font="default">
                                            <div class="font-preview" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;">
                                                Aa
                                            </div>
                                            <div class="font-name">System Default</div>
                                        </div>
                                        
                                        <div class="font-option" data-font="inter">
                                            <div class="font-preview" style="font-family: Inter, sans-serif;">
                                                Aa
                                            </div>
                                            <div class="font-name">Inter</div>
                                        </div>
                                        
                                        <div class="font-option" data-font="poppins">
                                            <div class="font-preview" style="font-family: Poppins, sans-serif;">
                                                Aa
                                            </div>
                                            <div class="font-name">Poppins</div>
                                        </div>
                                        
                                        <div class="font-option" data-font="playfair">
                                            <div class="font-preview" style="font-family: 'Playfair Display', serif;">
                                                Aa
                                            </div>
                                            <div class="font-name">Playfair Display</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="font-section">
                                    <h4><i class="fas fa-text-height"></i> Font Size</h4>
                                    <div class="font-size-slider">
                                        <input type="range" id="font-size-range" min="12" max="20" value="14" class="slider">
                                        <div class="size-labels">
                                            <span>Small</span>
                                            <span>Medium</span>
                                            <span>Large</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="font-section">
                                    <h4><i class="fas fa-bold"></i> Text Styling</h4>
                                    <div class="text-style-options">
                                        <label class="style-option">
                                            <input type="checkbox" id="bold-headings">
                                            <span class="checkmark"></span>
                                            Bold Headings
                                        </label>
                                        <label class="style-option">
                                            <input type="checkbox" id="italic-captions">
                                            <span class="checkmark"></span>
                                            Italic Captions
                                        </label>
                                        <label class="style-option">
                                            <input type="checkbox" id="uppercase-labels">
                                            <span class="checkmark"></span>
                                            Uppercase Labels
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="customization-actions">
                        <button class="customization-action-btn secondary" id="save-template">
                            <i class="fas fa-save"></i> Save as Template
                        </button>
                        <button class="customization-action-btn primary" id="apply-customization">
                            <i class="fas fa-check"></i> Apply Changes
                        </button>
                    </div>
                `;

                this.setupCustomizationStudioListeners(customizationContainer);
                return customizationContainer;
            }
        };

        this.customizationStudio.container = this.customizationStudio.create();
    }

    /**
     * Setup event listeners for Activity Timeline
     */
    setupActivityTimelineListeners(container) {
        // Timeline filter buttons
        const filterBtns = container.querySelectorAll('.timeline-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activityTimeline.currentFilter = btn.dataset.filter;
                this.loadTimelineEvents();
            });
        });

        // Period selector
        const periodSelect = container.querySelector('#timeline-period');
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                this.activityTimeline.currentPeriod = e.target.value;
                this.loadTimelineEvents();
            });
        }

        // Navigation buttons
        const prevBtn = container.querySelector('#timeline-prev-btn');
        const nextBtn = container.querySelector('#timeline-next-btn');
        if (prevBtn) prevBtn.addEventListener('click', () => this.navigateTimelinePeriod('prev'));
        if (nextBtn) nextBtn.addEventListener('click', () => this.navigateTimelinePeriod('next'));

        // Action buttons
        const exportBtn = container.querySelector('.export-btn');
        const shareBtn = container.querySelector('.share-btn');
        const privacyBtn = container.querySelector('.privacy-btn');
        
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportTimeline());
        if (shareBtn) shareBtn.addEventListener('click', () => this.shareTimeline());
        if (privacyBtn) privacyBtn.addEventListener('click', () => this.openTimelinePrivacySettings());
    }

    /**
     * Setup event listeners for Connections Manager
     */
    setupConnectionsManagerListeners(container) {
        // Tab navigation
        const connectionsTabs = container.querySelectorAll('.connections-tab');
        connectionsTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                connectionsTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const contents = container.querySelectorAll('.connections-tab-content');
                contents.forEach(content => content.classList.remove('active'));
                
                const targetContent = container.querySelector(`#${tab.dataset.tab}-content`);
                if (targetContent) targetContent.classList.add('active');
                
                this.connectionsManager.currentView = tab.dataset.tab;
                this.loadConnectionsTabData(tab.dataset.tab);
            });
        });

        // Search functionality
        const searchInput = container.querySelector('#connections-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchConnections(e.target.value);
            });
        }

        // Bulk actions
        const selectAllCheckbox = container.querySelector('#select-all-connections');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.toggleAllConnectionsSelection(e.target.checked);
            });
        }
    }

    /**
     * Setup event listeners for Media Gallery
     */
    setupMediaGalleryListeners(container) {
        // View switcher buttons
        const viewBtns = container.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.mediaGallery.currentView = btn.dataset.view;
                this.updateMediaGalleryView();
            });
        });

        // Filter tabs
        const filterTabs = container.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.mediaGallery.currentFilter = tab.dataset.filter;
                this.filterMediaGallery();
            });
        });

        // Upload button
        const uploadBtn = container.querySelector('#upload-media-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.openMediaUploadModal());
        }

        // Gallery actions
        const createAlbumBtn = container.querySelector('#create-album-btn');
        const shareMediaBtn = container.querySelector('#share-media-btn');
        const downloadMediaBtn = container.querySelector('#download-media-btn');
        const deleteMediaBtn = container.querySelector('#delete-media-btn');
        
        if (createAlbumBtn) createAlbumBtn.addEventListener('click', () => this.createNewAlbum());
        if (shareMediaBtn) shareMediaBtn.addEventListener('click', () => this.shareSelectedMedia());
        if (downloadMediaBtn) downloadMediaBtn.addEventListener('click', () => this.downloadSelectedMedia());
        if (deleteMediaBtn) deleteMediaBtn.addEventListener('click', () => this.deleteSelectedMedia());
    }

    /**
     * Setup event listeners for Analytics Dashboard
     */
    setupAnalyticsDashboardListeners(container) {
        // Period buttons
        const periodBtns = container.querySelectorAll('.period-btn');
        periodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                periodBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.analyticsDashboard.currentPeriod = btn.dataset.period;
                this.loadAnalyticsData();
            });
        });

        // Export analytics
        const exportBtn = container.querySelector('#export-analytics');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAnalyticsReport());
        }

        // Refresh insights
        const refreshInsightsBtn = container.querySelector('#refresh-insights');
        if (refreshInsightsBtn) {
            refreshInsightsBtn.addEventListener('click', () => this.refreshInsights());
        }

        // Chart controls
        const engagementMetricSelect = container.querySelector('#engagement-metric');
        if (engagementMetricSelect) {
            engagementMetricSelect.addEventListener('change', (e) => {
                this.updateEngagementChart(e.target.value);
            });
        }
    }

    /**
     * Setup event listeners for Customization Studio
     */
    setupCustomizationStudioListeners(container) {
        // Tab navigation
        const customizationTabs = container.querySelectorAll('.customization-tab');
        customizationTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                customizationTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const contents = container.querySelectorAll('.customization-tab-content');
                contents.forEach(content => content.classList.remove('active'));
                
                const targetContent = container.querySelector(`#${tab.dataset.tab}-content`);
                if (targetContent) targetContent.classList.add('active');
            });
        });

        // Theme selection
        const themeOptions = container.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                themeOptions.forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                this.customizationSettings.theme = option.dataset.theme;
                this.applyThemePreview();
            });
        });

        // Color pickers
        const primaryColorPicker = container.querySelector('#primary-color');
        const accentColorPicker = container.querySelector('#accent-color');
        
        if (primaryColorPicker) {
            primaryColorPicker.addEventListener('change', (e) => {
                this.customizationSettings.colors.primary = e.target.value;
                this.applyColorPreview();
            });
        }
        
        if (accentColorPicker) {
            accentColorPicker.addEventListener('change', (e) => {
                this.customizationSettings.colors.accent = e.target.value;
                this.applyColorPreview();
            });
        }

        // Apply and save buttons
        const applyBtn = container.querySelector('#apply-customization');
        const saveTemplateBtn = container.querySelector('#save-template');
        
        if (applyBtn) applyBtn.addEventListener('click', () => this.applyCustomization());
        if (saveTemplateBtn) saveTemplateBtn.addEventListener('click', () => this.saveCustomizationTemplate());
    }

    /**
     * Load timeline data and events
     */
    loadTimelineData() {
        this.loadTimelineEvents();
        this.loadTimelineMilestones();
    }

    loadTimelineEvents() {
        // This method would load timeline events based on current filter and period
        console.log('Loading timeline events for:', this.activityTimeline.currentFilter, this.activityTimeline.currentPeriod);
    }

    loadTimelineMilestones() {
        // This method would load milestones data
        console.log('Loading timeline milestones');
    }

    loadConnectionsData() {
        this.loadConnectionsOverview();
        this.loadRecentConnectionActivity();
    }

    loadConnectionsOverview() {
        console.log('Loading connections overview');
    }

    loadRecentConnectionActivity() {
        console.log('Loading recent connection activity');
    }

    loadConnectionsTabData(tabName) {
        console.log('Loading connections tab data for:', tabName);
    }

    loadMediaGalleryData() {
        this.loadMediaAlbums();
        this.loadMediaItems();
    }

    loadMediaAlbums() {
        console.log('Loading media albums');
    }

    loadMediaItems() {
        console.log('Loading media items');
    }

    loadAnalyticsData() {
        this.loadAnalyticsOverview();
        this.loadEngagementChart();
        this.loadDemographicsData();
        this.loadTopPerformingContent();
    }

    loadAnalyticsOverview() {
        console.log('Loading analytics overview for period:', this.analyticsDashboard.currentPeriod);
    }

    loadEngagementChart() {
        console.log('Loading engagement chart');
    }

    loadDemographicsData() {
        console.log('Loading demographics data');
    }

    loadTopPerformingContent() {
        console.log('Loading top performing content');
    }

    // Additional helper methods for component interactions
    navigateTimelinePeriod(direction) {
        console.log('Navigating timeline:', direction);
    }

    exportTimeline() {
        console.log('Exporting timeline');
    }

    shareTimeline() {
        console.log('Sharing timeline');
    }

    searchConnections(query) {
        console.log('Searching connections:', query);
    }

    toggleAllConnectionsSelection(selected) {
        console.log('Toggle all connections selection:', selected);
    }

    updateMediaGalleryView() {
        console.log('Updating media gallery view:', this.mediaGallery.currentView);
    }

    filterMediaGallery() {
        console.log('Filtering media gallery:', this.mediaGallery.currentFilter);
    }

    openMediaUploadModal() {
        console.log('Opening media upload modal');
    }

    createNewAlbum() {
        console.log('Creating new album');
    }

    shareSelectedMedia() {
        console.log('Sharing selected media');
    }

    downloadSelectedMedia() {
        console.log('Downloading selected media');
    }

    deleteSelectedMedia() {
        console.log('Deleting selected media');
    }

    exportAnalyticsReport() {
        console.log('Exporting analytics report');
    }

    refreshInsights() {
        console.log('Refreshing insights');
    }

    updateEngagementChart(metric) {
        console.log('Updating engagement chart for metric:', metric);
    }

    // Customization Studio methods
    applyThemePreview() {
        console.log('Applying theme preview:', this.customizationSettings.theme);
    }

    applyColorPreview() {
        console.log('Applying color preview:', this.customizationSettings.colors);
    }

    applyCustomization() {
        console.log('Applying customization settings:', this.customizationSettings);
        if (this.app && this.app.showToast) {
            this.app.showToast('Profile customization applied!', 'success');
        }
    }

    saveCustomizationTemplate() {
        console.log('Saving customization template');
        if (this.app && this.app.showToast) {
            this.app.showToast('Customization template saved!', 'success');
        }
    }

    openTimelinePrivacySettings() {
        console.log('Opening timeline privacy settings');
        if (this.app && this.app.showToast) {
            this.app.showToast('Timeline privacy settings opened', 'info');
        }
    }

    // Public methods to access the UI components
    getActivityTimeline() {
        return this.activityTimeline.container;
    }

    getConnectionsManager() {
        return this.connectionsManager.container;
    }

    getMediaGallery() {
        return this.mediaGallery.container;
    }

    getAnalyticsDashboard() {
        return this.analyticsDashboard.container;
    }

    getCustomizationStudio() {
        return this.customizationStudio.container;
    }

    // Method to render all components in a profile section
    renderProfileComponents(container) {
        if (!container) {
            console.error('Container element not provided for profile components');
            return;
        }

        // Create a comprehensive profile interface container
        const profileInterfaceContainer = document.createElement('div');
        profileInterfaceContainer.className = 'profile-interfaces-container';
        profileInterfaceContainer.innerHTML = `
            <div class="profile-interfaces-navigation">
                <div class="interfaces-nav-tabs">
                    <button class="interface-tab active" data-interface="timeline">
                        <i class="fas fa-chart-line"></i> Activity Timeline
                    </button>
                    <button class="interface-tab" data-interface="connections">
                        <i class="fas fa-network-wired"></i> Connections
                    </button>
                    <button class="interface-tab" data-interface="media">
                        <i class="fas fa-images"></i> Media Gallery
                    </button>
                    <button class="interface-tab" data-interface="analytics">
                        <i class="fas fa-chart-bar"></i> Analytics
                    </button>
                    <button class="interface-tab" data-interface="customization">
                        <i class="fas fa-palette"></i> Customize
                    </button>
                </div>
            </div>
            <div class="profile-interfaces-content">
                <div class="profile-interface-panel active" id="timeline-panel"></div>
                <div class="profile-interface-panel" id="connections-panel"></div>
                <div class="profile-interface-panel" id="media-panel"></div>
                <div class="profile-interface-panel" id="analytics-panel"></div>
                <div class="profile-interface-panel" id="customization-panel"></div>
            </div>
        `;

        container.appendChild(profileInterfaceContainer);

        // Add the individual components to their panels
        const timelinePanel = profileInterfaceContainer.querySelector('#timeline-panel');
        const connectionsPanel = profileInterfaceContainer.querySelector('#connections-panel');
        const mediaPanel = profileInterfaceContainer.querySelector('#media-panel');
        const analyticsPanel = profileInterfaceContainer.querySelector('#analytics-panel');
        const customizationPanel = profileInterfaceContainer.querySelector('#customization-panel');

        if (timelinePanel) timelinePanel.appendChild(this.getActivityTimeline());
        if (connectionsPanel) connectionsPanel.appendChild(this.getConnectionsManager());
        if (mediaPanel) mediaPanel.appendChild(this.getMediaGallery());
        if (analyticsPanel) analyticsPanel.appendChild(this.getAnalyticsDashboard());
        if (customizationPanel) customizationPanel.appendChild(this.getCustomizationStudio());

        // Setup navigation between interfaces
        this.setupInterfaceNavigation(profileInterfaceContainer);

        console.log('Profile components rendered successfully');
    }

    // Setup navigation between different profile interfaces
    setupInterfaceNavigation(container) {
        const tabs = container.querySelectorAll('.interface-tab');
        const panels = container.querySelectorAll('.profile-interface-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const interfaceType = tab.dataset.interface;
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update active panel
                panels.forEach(panel => panel.classList.remove('active'));
                const targetPanel = container.querySelector(`#${interfaceType}-panel`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }

                // Show success message
                if (this.app && this.app.showToast) {
                    const interfaceName = tab.textContent.trim();
                    this.app.showToast(`Switched to ${interfaceName}`, 'info');
                }
            });
        });
    }

    // Utility method to get profile component statistics
    getProfileStats() {
        return {
            totalInterfaces: 5,
            activeFilters: {
                timeline: this.activityTimeline.currentFilter,
                connections: this.connectionsManager.currentView,
                media: this.mediaGallery.currentFilter,
                analytics: this.analyticsDashboard.currentPeriod,
                customization: this.customizationSettings.theme
            },
            selectedItems: {
                media: this.mediaGallery.selectedItems.size,
                connections: this.connectionsManager.selectedConnections.size
            }
        };
    }

    // Method to export all profile data
    exportAllProfileData() {
        const profileData = {
            activityData: this.activityCache,
            connectionsData: this.connectionsCache,
            mediaData: this.mediaCache,
            analyticsData: this.analyticsCache,
            customizationSettings: this.customizationSettings,
            timestamp: new Date().toISOString()
        };

        // In a real application, this would trigger a download or API call
        console.log('Exporting complete profile data:', profileData);
        
        if (this.app && this.app.showToast) {
            this.app.showToast('Profile data export initiated', 'success');
        }

        return profileData;
    }

    // Method to reset all profile interfaces to default state
    resetAllInterfaces() {
        // Reset timeline
        this.activityTimeline.currentFilter = 'all';
        this.activityTimeline.currentPeriod = 'week';
        
        // Reset connections
        this.connectionsManager.currentView = 'overview';
        this.connectionsManager.selectedConnections.clear();
        
        // Reset media gallery
        this.mediaGallery.currentView = 'grid';
        this.mediaGallery.currentFilter = 'all';
        this.mediaGallery.selectedItems.clear();
        
        // Reset analytics
        this.analyticsDashboard.currentPeriod = 'week';
        this.analyticsDashboard.currentMetric = 'overview';
        
        // Reset customization
        this.customizationSettings = {
            theme: 'default',
            layout: 'standard',
            badges: [],
            colors: {
                primary: '#8B5CF6',
                accent: '#F59E0B'
            }
        };
        
        console.log('All profile interfaces reset to default state');
        
        if (this.app && this.app.showToast) {
            this.app.showToast('All profile interfaces reset to default', 'info');
        }
    }
}

// Export the ProfileUIComponents class for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileUIComponents;
}
