/**
 * ConnectHub - Advanced Search Results UI Component
 * The 1 MISSING Search & Discovery interface - Rich search result presentation
 * Provides comprehensive, detailed search results with advanced formatting and interactions
 */

class AdvancedSearchResultsUI {
    constructor(app) {
        this.app = app;
        this.searchQuery = '';
        this.searchResults = {
            people: [],
            posts: [],
            groups: [],
            events: [],
            media: [],
            hashtags: [],
            locations: []
        };
        this.resultStats = {
            totalResults: 0,
            searchTime: 0,
            resultsByType: {}
        };
        this.currentView = 'unified'; // unified, categorized, timeline, map
        this.currentSort = 'relevance';
        this.activeFilters = new Set();
        this.selectedResults = new Set();
        this.resultPreferences = this.loadResultPreferences();
        
        this.init();
    }

    init() {
        console.log('Advanced Search Results UI initialized');
    }

    /**
     * Main method to show advanced search results
     */
    showAdvancedSearchResults(query = '', results = {}) {
        this.searchQuery = query;
        this.searchResults = results;
        this.updateResultStats();

        const modal = document.createElement('div');
        modal.className = 'modal active search-results-modal';
        modal.innerHTML = this.getAdvancedSearchResultsHTML();

        // Add event listeners
        this.attachEventListeners(modal);

        document.body.appendChild(modal);
        
        // Initialize result interactions
        this.initializeResultInteractions(modal);
        
        // Load results if provided
        if (Object.keys(results).length > 0) {
            this.renderAllResults();
        }

        return modal;
    }

    /**
     * Generate the complete Advanced Search Results HTML
     */
    getAdvancedSearchResultsHTML() {
        return `
            <div class="modal-content search-results-content">
                <!-- Search Results Header -->
                <div class="search-results-header">
                    <div class="search-header-top">
                        <div class="search-query-display">
                            <h2><i class="fas fa-search"></i> Search Results</h2>
                            <div class="query-info">
                                <span class="query-text">"${this.searchQuery}"</span>
                                <div class="search-stats">
                                    <span class="result-count">${this.formatNumber(this.resultStats.totalResults)} results</span>
                                    <span class="search-time">(${this.resultStats.searchTime}s)</span>
                                </div>
                            </div>
                        </div>
                        <div class="search-header-actions">
                            <button class="search-action-btn" id="refine-search-btn" title="Refine Search">
                                <i class="fas fa-sliders-h"></i>
                                <span>Refine</span>
                            </button>
                            <button class="search-action-btn" id="save-search-btn" title="Save Search">
                                <i class="fas fa-bookmark"></i>
                                <span>Save</span>
                            </button>
                            <button class="search-action-btn" id="share-results-btn" title="Share Results">
                                <i class="fas fa-share"></i>
                                <span>Share</span>
                            </button>
                            <button class="modal-close-btn" onclick="this.closest('.modal').remove()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Search Result Filters & Controls -->
                    <div class="search-results-controls">
                        <!-- View Toggle -->
                        <div class="view-controls">
                            <label>View:</label>
                            <div class="view-toggle-group">
                                <button class="view-toggle-btn active" data-view="unified" title="Unified View">
                                    <i class="fas fa-stream"></i>
                                    <span>All</span>
                                </button>
                                <button class="view-toggle-btn" data-view="categorized" title="Category View">
                                    <i class="fas fa-th-large"></i>
                                    <span>Categories</span>
                                </button>
                                <button class="view-toggle-btn" data-view="timeline" title="Timeline View">
                                    <i class="fas fa-clock"></i>
                                    <span>Timeline</span>
                                </button>
                                <button class="view-toggle-btn" data-view="map" title="Map View">
                                    <i class="fas fa-map"></i>
                                    <span>Map</span>
                                </button>
                            </div>
                        </div>

                        <!-- Sort Options -->
                        <div class="sort-controls">
                            <label>Sort by:</label>
                            <select class="sort-select" id="results-sort-select">
                                <option value="relevance">Most Relevant</option>
                                <option value="recent">Most Recent</option>
                                <option value="popular">Most Popular</option>
                                <option value="engagement">Most Engaged</option>
                                <option value="proximity">Nearest First</option>
                                <option value="alphabetical">A-Z</option>
                            </select>
                        </div>

                        <!-- Quick Filters -->
                        <div class="quick-filters">
                            <div class="filter-chips" id="quick-filter-chips">
                                <button class="filter-chip" data-filter="verified">
                                    <i class="fas fa-check-circle"></i> Verified Only
                                </button>
                                <button class="filter-chip" data-filter="recent">
                                    <i class="fas fa-clock"></i> Recent
                                </button>
                                <button class="filter-chip" data-filter="nearby">
                                    <i class="fas fa-location-arrow"></i> Nearby
                                </button>
                                <button class="filter-chip" data-filter="trending">
                                    <i class="fas fa-fire"></i> Trending
                                </button>
                                <button class="filter-chip" data-filter="media">
                                    <i class="fas fa-photo-video"></i> Has Media
                                </button>
                            </div>
                        </div>

                        <!-- Result Actions -->
                        <div class="result-actions">
                            <button class="action-btn" id="bulk-select-btn" title="Bulk Select">
                                <i class="fas fa-check-square"></i>
                            </button>
                            <button class="action-btn" id="export-results-btn" title="Export Results">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="action-btn" id="result-preferences-btn" title="Display Preferences">
                                <i class="fas fa-cog"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Search Results Content -->
                <div class="search-results-body">
                    <!-- Results Summary Panel -->
                    <div class="results-summary-panel" id="results-summary-panel">
                        ${this.getResultsSummaryHTML()}
                    </div>

                    <!-- Main Results Area -->
                    <div class="search-results-main" id="search-results-main">
                        <!-- Unified Results View -->
                        <div class="results-view active" id="unified-results-view">
                            <div class="unified-results-container" id="unified-results-container">
                                <!-- Results will be rendered here -->
                            </div>
                        </div>

                        <!-- Categorized Results View -->
                        <div class="results-view" id="categorized-results-view">
                            ${this.getCategorizedResultsHTML()}
                        </div>

                        <!-- Timeline Results View -->
                        <div class="results-view" id="timeline-results-view">
                            <div class="timeline-results-container" id="timeline-results-container">
                                <!-- Timeline results will be rendered here -->
                            </div>
                        </div>

                        <!-- Map Results View -->
                        <div class="results-view" id="map-results-view">
                            ${this.getMapResultsHTML()}
                        </div>
                    </div>

                    <!-- Results Sidebar -->
                    <div class="search-results-sidebar" id="search-results-sidebar">
                        ${this.getResultsSidebarHTML()}
                    </div>
                </div>

                <!-- Search Results Footer -->
                <div class="search-results-footer">
                    <div class="pagination-controls" id="pagination-controls">
                        <button class="page-btn" id="prev-page-btn" disabled>
                            <i class="fas fa-chevron-left"></i> Previous
                        </button>
                        <div class="page-numbers" id="page-numbers">
                            <span class="page-number active">1</span>
                            <span class="page-number">2</span>
                            <span class="page-number">3</span>
                            <span class="page-ellipsis">...</span>
                            <span class="page-number">10</span>
                        </div>
                        <button class="page-btn" id="next-page-btn">
                            Next <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>

                    <div class="results-per-page">
                        <label>Show:</label>
                        <select id="results-per-page-select">
                            <option value="10">10 results</option>
                            <option value="20" selected>20 results</option>
                            <option value="50">50 results</option>
                            <option value="100">100 results</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate Results Summary HTML
     */
    getResultsSummaryHTML() {
        return `
            <div class="summary-header">
                <h4><i class="fas fa-chart-bar"></i> Results Overview</h4>
                <button class="collapse-btn" id="collapse-summary">
                    <i class="fas fa-chevron-up"></i>
                </button>
            </div>
            <div class="summary-content">
                <div class="result-type-breakdown">
                    ${Object.keys(this.searchResults).map(type => `
                        <div class="result-type-item" data-type="${type}">
                            <div class="type-icon">
                                <i class="fas fa-${this.getTypeIcon(type)}"></i>
                            </div>
                            <div class="type-info">
                                <span class="type-name">${this.capitalizeFirst(type)}</span>
                                <span class="type-count">${this.searchResults[type]?.length || 0}</span>
                            </div>
                            <div class="type-percentage">
                                ${this.calculateTypePercentage(type)}%
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="search-insights">
                    <div class="insight-item">
                        <i class="fas fa-lightbulb text-warning"></i>
                        <span>Most results found in <strong>Posts</strong> category</span>
                    </div>
                    <div class="insight-item">
                        <i class="fas fa-clock text-info"></i>
                        <span>Search completed in <strong>${this.resultStats.searchTime}s</strong></span>
                    </div>
                    <div class="insight-item">
                        <i class="fas fa-fire text-danger"></i>
                        <span><strong>12</strong> trending items in results</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate Categorized Results HTML
     */
    getCategorizedResultsHTML() {
        return `
            <div class="categorized-results-container">
                ${Object.keys(this.searchResults).map(category => `
                    <div class="result-category-section" id="${category}-category-section">
                        <div class="category-header">
                            <div class="category-title">
                                <i class="fas fa-${this.getTypeIcon(category)}"></i>
                                <h3>${this.capitalizeFirst(category)}</h3>
                                <span class="category-count">(${this.searchResults[category]?.length || 0})</span>
                            </div>
                            <div class="category-actions">
                                <button class="category-sort-btn" data-category="${category}">
                                    <i class="fas fa-sort"></i> Sort
                                </button>
                                <button class="category-filter-btn" data-category="${category}">
                                    <i class="fas fa-filter"></i> Filter
                                </button>
                                <button class="category-expand-btn" data-category="${category}">
                                    <i class="fas fa-expand"></i> Expand
                                </button>
                            </div>
                        </div>
                        <div class="category-results" id="${category}-results">
                            <!-- Category-specific results will be rendered here -->
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Generate Map Results HTML
     */
    getMapResultsHTML() {
        return `
            <div class="map-results-container">
                <div class="map-controls">
                    <div class="map-search">
                        <input type="text" placeholder="Search location..." class="map-search-input">
                        <button class="current-location-btn" title="Use Current Location">
                            <i class="fas fa-crosshairs"></i>
                        </button>
                    </div>
                    <div class="map-filters">
                        <select class="map-filter-select">
                            <option value="all">All Locations</option>
                            <option value="people">People</option>
                            <option value="groups">Groups</option>
                            <option value="events">Events</option>
                            <option value="posts">Posts</option>
                        </select>
                        <input type="range" class="map-radius-slider" min="1" max="100" value="25">
                        <span class="radius-display">25 miles</span>
                    </div>
                </div>

                <div class="map-container" id="search-results-map">
                    <!-- Interactive map will be rendered here -->
                    <div class="map-placeholder">
                        <div class="map-background">
                            <!-- Mock map interface -->
                            <div class="map-marker" style="top: 30%; left: 40%;" data-type="person">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="map-marker" style="top: 50%; left: 60%;" data-type="group">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="map-marker" style="top: 70%; left: 30%;" data-type="event">
                                <i class="fas fa-calendar"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="map-results-panel">
                    <h4>Nearby Results</h4>
                    <div class="nearby-results" id="nearby-results">
                        <!-- Location-based results will be rendered here -->
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate Results Sidebar HTML
     */
    getResultsSidebarHTML() {
        return `
            <div class="sidebar-section">
                <h4><i class="fas fa-filter"></i> Advanced Filters</h4>
                <div class="advanced-filters-panel">
                    <div class="filter-group">
                        <label>Date Range</label>
                        <div class="date-range-inputs">
                            <input type="date" class="date-input" id="filter-date-from">
                            <input type="date" class="date-input" id="filter-date-to">
                        </div>
                    </div>

                    <div class="filter-group">
                        <label>Content Type</label>
                        <div class="checkbox-group">
                            <label><input type="checkbox" value="text" checked> Text</label>
                            <label><input type="checkbox" value="image" checked> Images</label>
                            <label><input type="checkbox" value="video"> Videos</label>
                            <label><input type="checkbox" value="audio"> Audio</label>
                        </div>
                    </div>

                    <div class="filter-group">
                        <label>User Type</label>
                        <div class="radio-group">
                            <label><input type="radio" name="user-type" value="all" checked> All Users</label>
                            <label><input type="radio" name="user-type" value="verified"> Verified Only</label>
                            <label><input type="radio" name="user-type" value="following"> Following Only</label>
                        </div>
                    </div>

                    <div class="filter-group">
                        <label>Engagement Level</label>
                        <div class="range-group">
                            <label>Min Likes: <span id="min-likes-value">0</span></label>
                            <input type="range" id="min-likes-slider" min="0" max="1000" value="0">
                            <label>Min Comments: <span id="min-comments-value">0</span></label>
                            <input type="range" id="min-comments-slider" min="0" max="100" value="0">
                        </div>
                    </div>

                    <div class="filter-actions">
                        <button class="apply-filters-btn">Apply Filters</button>
                        <button class="clear-filters-btn">Clear All</button>
                    </div>
                </div>
            </div>

            <div class="sidebar-section">
                <h4><i class="fas fa-bookmark"></i> Related Searches</h4>
                <div class="related-searches">
                    ${this.generateRelatedSearches().map(search => `
                        <button class="related-search-btn" onclick="this.performRelatedSearch('${search}')">
                            ${search}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="sidebar-section">
                <h4><i class="fas fa-hashtag"></i> Trending Tags</h4>
                <div class="trending-tags">
                    ${this.generateTrendingTags().map(tag => `
                        <span class="trending-tag" onclick="this.searchByTag('${tag.name}')">
                            ${tag.name} <span class="tag-count">${tag.count}</span>
                        </span>
                    `).join('')}
                </div>
            </div>

            <div class="sidebar-section">
                <h4><i class="fas fa-chart-line"></i> Search Analytics</h4>
                <div class="search-analytics">
                    <div class="analytics-item">
                        <span class="analytics-label">Query Complexity:</span>
                        <div class="complexity-bar">
                            <div class="complexity-fill" style="width: 75%"></div>
                        </div>
                        <span class="complexity-level">High</span>
                    </div>
                    <div class="analytics-item">
                        <span class="analytics-label">Result Relevance:</span>
                        <div class="relevance-score">4.7/5.0</div>
                    </div>
                    <div class="analytics-item">
                        <span class="analytics-label">Search Popularity:</span>
                        <div class="popularity-indicator">
                            <i class="fas fa-fire"></i> Hot Topic
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render unified search results
     */
    renderUnifiedResults() {
        const container = document.getElementById('unified-results-container');
        if (!container) return;

        const allResults = this.getAllResultsFlattened();
        
        container.innerHTML = allResults.map(result => {
            return this.renderResultItem(result);
        }).join('');

        // Add interaction handlers
        this.addResultInteractionHandlers(container);
    }

    /**
     * Render a single result item with rich presentation
     */
    renderResultItem(result) {
        const resultType = result.type;
        
        switch (resultType) {
            case 'person':
                return this.renderPersonResult(result);
            case 'post':
                return this.renderPostResult(result);
            case 'group':
                return this.renderGroupResult(result);
            case 'event':
                return this.renderEventResult(result);
            case 'media':
                return this.renderMediaResult(result);
            default:
                return this.renderGenericResult(result);
        }
    }

    /**
     * Render person search result
     */
    renderPersonResult(person) {
        return `
            <div class="search-result-item person-result" data-id="${person.id}" data-type="person">
                <div class="result-checkbox">
                    <input type="checkbox" class="result-select-checkbox">
                </div>
                <div class="result-content">
                    <div class="person-result-main">
                        <div class="person-avatar">
                            <img src="${person.avatar}" alt="${person.name}">
                            ${person.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                            ${person.online ? '<div class="online-indicator"></div>' : ''}
                        </div>
                        <div class="person-info">
                            <div class="person-header">
                                <h3 class="person-name">${person.name}</h3>
                                <span class="person-username">@${person.username}</span>
                                ${person.location ? `<span class="person-location"><i class="fas fa-map-marker-alt"></i> ${person.location}</span>` : ''}
                            </div>
                            <p class="person-bio">${person.bio}</p>
                            <div class="person-stats">
                                <span class="stat-item">
                                    <i class="fas fa-users"></i> ${this.formatNumber(person.followers)} followers
                                </span>
                                <span class="stat-item">
                                    <i class="fas fa-heart"></i> ${this.formatNumber(person.likes)} likes
                                </span>
                                ${person.mutualFriends > 0 ? `
                                    <span class="stat-item">
                                        <i class="fas fa-user-friends"></i> ${person.mutualFriends} mutual friends
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="person-actions">
                        <button class="result-action-btn primary" onclick="this.followUser('${person.id}')">
                            <i class="fas fa-user-plus"></i> Follow
                        </button>
                        <button class="result-action-btn secondary" onclick="this.messageUser('${person.id}')">
                            <i class="fas fa-comment"></i> Message
                        </button>
                        <button class="result-action-btn secondary" onclick="this.viewProfile('${person.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                </div>
                <div class="result-metadata">
                    <span class="result-relevance">Relevance: ${person.relevanceScore}%</span>
                    <span class="result-timestamp">Updated ${person.lastActive}</span>
                </div>
            </div>
        `;
    }

    /**
     * Render post search result
     */
    renderPostResult(post) {
        return `
            <div class="search-result-item post-result" data-id="${post.id}" data-type="post">
                <div class="result-checkbox">
                    <input type="checkbox" class="result-select-checkbox">
                </div>
                <div class="result-content">
                    <div class="post-result-header">
                        <div class="post-author">
                            <img src="${post.author.avatar}" alt="${post.author.name}" class="author-avatar">
                            <div class="author-info">
                                <span class="author-name">${post.author.name}</span>
                                <span class="post-timestamp">${post.timestamp}</span>
                            </div>
                        </div>
                        <div class="post-type-badge">
                            <i class="fas fa-${post.hasMedia ? 'photo-video' : 'align-left'}"></i>
                            ${post.hasMedia ? 'Media Post' : 'Text Post'}
                        </div>
                    </div>
                    <div class="post-result-content">
                        <div class="post-text">
                            <p>${this.highlightSearchTerms(post.content)}</p>
                        </div>
                        ${post.media ? `
                            <div class="post-media-preview">
                                ${post.media.type === 'image' ? 
                                    `<img src="${post.media.url}" alt="Post media">` :
                                    `<video src="${post.media.url}" controls></video>`
                                }
                            </div>
                        ` : ''}
                        ${post.hashtags && post.hashtags.length > 0 ? `
                            <div class="post-hashtags">
                                ${post.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="post-result-stats">
                        <span class="stat-item">
                            <i class="fas fa-heart"></i> ${this.formatNumber(post.likes)}
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-comment"></i> ${this.formatNumber(post.comments)}
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-share"></i> ${this.formatNumber(post.shares)}
                        </span>
                    </div>
                </div>
                <div class="post-actions">
                    <button class="result-action-btn secondary" onclick="this.likePost('${post.id}')">
                        <i class="fas fa-heart"></i> Like
                    </button>
                    <button class="result-action-btn secondary" onclick="this.commentPost('${post.id}')">
                        <i class="fas fa-comment"></i> Comment
                    </button>
                    <button class="result-action-btn secondary" onclick="this.viewPost('${post.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
                <div class="result-metadata">
                    <span class="result-relevance">Relevance: ${post.relevanceScore}%</span>
                    <span class="result-engagement">Engagement: ${post.engagementRate}%</span>
                </div>
            </div>
        `;
    }

    /**
     * Render group search result
     */
    renderGroupResult(group) {
        return `
            <div class="search-result-item group-result" data-id="${group.id}" data-type="group">
                <div class="result-checkbox">
                    <input type="checkbox" class="result-select-checkbox">
                </div>
                <div class="result-content">
                    <div class="group-result-header">
                        <div class="group-image">
                            <img src="${group.image}" alt="${group.name}">
                            ${group.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                        </div>
                        <div class="group-info">
                            <h3 class="group-name">${group.name}</h3>
                            <div class="group-meta">
                                <span class="group-category">${group.category}</span>
                                <span class="group-privacy">${group.isPublic ? 'Public' : 'Private'}</span>
                                <span class="group-location">${group.location}</span>
                            </div>
                        </div>
                    </div>
                    <div class="group-result-content">
                        <p class="group-description">${this.highlightSearchTerms(group.description)}</p>
                        <div class="group-stats">
                            <span class="stat-item">
                                <i class="fas fa-users"></i> ${this.formatNumber(group.members)} members
                            </span>
                            <span class="stat-item">
                                <i class="fas fa-calendar"></i> ${group.postsThisWeek} posts this week
                            </span>
                            <span class="stat-item activity-level ${group.activityLevel.toLowerCase()}">
                                <i class="fas fa-chart-line"></i> ${group.activityLevel} activity
                            </span>
                        </div>
                        ${group.recentPosts && group.recentPosts.length > 0 ? `
                            <div class="group-recent-posts">
                                <span class="recent-posts-label">Recent posts:</span>
                                ${group.recentPosts.slice(0, 3).map(post => `
                                    <span class="recent-post-preview">"${post.title}"</span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="group-actions">
                    <button class="result-action-btn primary" onclick="this.joinGroup('${group.id}')">
                        <i class="fas fa-plus"></i> Join Group
                    </button>
                    <button class="result-action-btn secondary" onclick="this.viewGroup('${group.id}')">
                        <i class="fas fa-eye"></i> View Group
                    </button>
                </div>
                <div class="result-metadata">
                    <span class="result-relevance">Relevance: ${group.relevanceScore}%</span>
                    <span class="result-activity">Activity: ${group.activityLevel}</span>
                </div>
            </div>
        `;
    }

    /**
     * Render event search result
     */
    renderEventResult(event) {
        return `
            <div class="search-result-item event-result" data-id="${event.id}" data-type="event">
                <div class="result-checkbox">
                    <input type="checkbox" class="result-select-checkbox">
                </div>
                <div class="result-content">
                    <div class="event-result-header">
                        <div class="event-image">
                            <img src="${event.image}" alt="${event.name}">
                            <div class="event-date-badge">
                                <div class="event-month">${event.month}</div>
                                <div class="event-day">${event.day}</div>
                            </div>
                        </div>
                        <div class="event-info">
                            <h3 class="event-name">${event.name}</h3>
                            <div class="event-meta">
                                <span class="event-type">${event.type}</span>
                                <span class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                                <span class="event-time"><i class="fas fa-clock"></i> ${event.time}</span>
                            </div>
                        </div>
                    </div>
                    <div class="event-result-content">
                        <p class="event-description">${this.highlightSearchTerms(event.description)}</p>
                        <div class="event-stats">
                            <span class="stat-item">
                                <i class="fas fa-users"></i> ${this.formatNumber(event.attendees)} attending
                            </span>
                            <span class="stat-item">
                                <i class="fas fa-dollar-sign"></i> ${event.isFree ? 'Free' : event.price}
                            </span>
                            <span class="stat-item">
                                <i class="fas fa-calendar"></i> ${event.date}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="event-actions">
                    <button class="result-action-btn primary" onclick="this.attendEvent('${event.id}')">
                        <i class="fas fa-calendar-plus"></i> Attend
                    </button>
                    <button class="result-action-btn secondary" onclick="this.shareEvent('${event.id}')">
                        <i class="fas fa-share"></i> Share
                    </button>
                    <button class="result-action-btn secondary" onclick="this.viewEvent('${event.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
                <div class="result-metadata">
                    <span class="result-relevance">Relevance: ${event.relevanceScore}%</span>
                    <span class="result-popularity">Popularity: ${event.popularityScore}%</span>
                </div>
            </div>
        `;
    }

    /**
     * Render media search result
     */
    renderMediaResult(media) {
        return `
            <div class="search-result-item media-result" data-id="${media.id}" data-type="media">
                <div class="result-checkbox">
                    <input type="checkbox" class="result-select-checkbox">
                </div>
                <div class="result-content">
                    <div class="media-result-preview">
                        ${media.type === 'image' ? 
                            `<img src="${media.thumbnail}" alt="${media.title}" class="media-thumbnail">` :
                            media.type === 'video' ?
                            `<div class="video-thumbnail">
                                <img src="${media.thumbnail}" alt="${media.title}">
                                <div class="play-overlay"><i class="fas fa-play"></i></div>
                                <div class="video-duration">${media.duration}</div>
                            </div>` :
                            `<div class="audio-thumbnail">
                                <i class="fas fa-music"></i>
                                <div class="audio-duration">${media.duration}</div>
                            </div>`
                        }
                    </div>
                    <div class="media-info">
                        <h3 class="media-title">${this.highlightSearchTerms(media.title)}</h3>
                        <div class="media-meta">
                            <span class="media-type">${media.type}</span>
                            <span class="media-size">${media.size}</span>
                            <span class="media-quality">${media.quality}</span>
                        </div>
                        <div class="media-creator">
                            <img src="${media.creator.avatar}" alt="${media.creator.name}" class="creator-avatar">
                            <span class="creator-name">${media.creator.name}</span>
                        </div>
                        <div class="media-stats">
                            <span class="stat-item">
                                <i class="fas fa-eye"></i> ${this.formatNumber(media.views)} views
                            </span>
                            <span class="stat-item">
                                <i class="fas fa-download"></i> ${this.formatNumber(media.downloads)} downloads
                            </span>
                            <span class="stat-item">
                                <i class="fas fa-star"></i> ${media.rating}/5.0
                            </span>
                        </div>
                    </div>
                </div>
                <div class="media-actions">
                    <button class="result-action-btn primary" onclick="this.viewMedia('${media.id}')">
                        <i class="fas fa-play"></i> View
                    </button>
                    <button class="result-action-btn secondary" onclick="this.downloadMedia('${media.id}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="result-action-btn secondary" onclick="this.shareMedia('${media.id}')">
                        <i class="fas fa-share"></i> Share
                    </button>
                </div>
                <div class="result-metadata">
                    <span class="result-relevance">Relevance: ${media.relevanceScore}%</span>
                    <span class="result-timestamp">Uploaded ${media.uploadDate}</span>
                </div>
            </div>
        `;
    }

    /**
     * Render generic search result
     */
    renderGenericResult(result) {
        return `
            <div class="search-result-item generic-result" data-id="${result.id}" data-type="${result.type}">
                <div class="result-checkbox">
                    <input type="checkbox" class="result-select-checkbox">
                </div>
                <div class="result-content">
                    <div class="generic-result-header">
                        <h3 class="result-title">${this.highlightSearchTerms(result.title)}</h3>
                        <span class="result-type-badge">${result.type}</span>
                    </div>
                    <div class="generic-result-content">
                        <p class="result-description">${this.highlightSearchTerms(result.description)}</p>
                        ${result.metadata ? `
                            <div class="result-extra-metadata">
                                ${Object.entries(result.metadata).map(([key, value]) => `
                                    <span class="metadata-item">
                                        <strong>${key}:</strong> ${value}
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="generic-actions">
                    <button class="result-action-btn primary" onclick="this.viewResult('${result.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="result-action-btn secondary" onclick="this.shareResult('${result.id}')">
                        <i class="fas fa-share"></i> Share
                    </button>
                </div>
                <div class="result-metadata">
                    <span class="result-relevance">Relevance: ${result.relevanceScore}%</span>
                    <span class="result-timestamp">Updated ${result.lastUpdated}</span>
                </div>
            </div>
        `;
    }

    /**
     * Utility Functions
     */

    // Get all results flattened for unified view
    getAllResultsFlattened() {
        const allResults = [];
        Object.keys(this.searchResults).forEach(type => {
            if (this.searchResults[type] && this.searchResults[type].length > 0) {
                this.searchResults[type].forEach(result => {
                    allResults.push({ ...result, type: type });
                });
            }
        });
        return allResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }

    // Update result statistics
    updateResultStats() {
        let total = 0;
        const byType = {};
        
        Object.keys(this.searchResults).forEach(type => {
            const count = this.searchResults[type]?.length || 0;
            total += count;
            byType[type] = count;
        });

        this.resultStats = {
            totalResults: total,
            searchTime: (Math.random() * 2 + 0.5).toFixed(2),
            resultsByType: byType
        };
    }

    // Get type icon for UI
    getTypeIcon(type) {
        const icons = {
            people: 'users',
            posts: 'newspaper',
            groups: 'users-cog',
            events: 'calendar',
            media: 'photo-video',
            hashtags: 'hashtag',
            locations: 'map-marker-alt'
        };
        return icons[type] || 'circle';
    }

    // Capitalize first letter
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Calculate type percentage
    calculateTypePercentage(type) {
        const count = this.searchResults[type]?.length || 0;
        return this.resultStats.totalResults > 0 
            ? Math.round((count / this.resultStats.totalResults) * 100)
            : 0;
    }

    // Format numbers for display
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Highlight search terms in text
    highlightSearchTerms(text) {
        if (!this.searchQuery || !text) return text;
        
        const terms = this.searchQuery.split(' ').filter(term => term.length > 2);
        let highlightedText = text;
        
        terms.forEach(term => {
            const regex = new RegExp(`(${term})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark class="search-highlight">$1</mark>');
        });
        
        return highlightedText;
    }

    // Generate related searches
    generateRelatedSearches() {
        const base = this.searchQuery.toLowerCase();
        return [
            `${base} tips`,
            `${base} tutorials`,
            `${base} community`,
            `${base} news`,
            `${base} 2024`,
            `best ${base}`,
            `${base} guide`,
            `${base} reviews`
        ];
    }

    // Generate trending tags
    generateTrendingTags() {
        return [
            { name: '#photography', count: '12.4K' },
            { name: '#travel', count: '8.9K' },
            { name: '#food', count: '6.7K' },
            { name: '#fitness', count: '5.2K' },
            { name: '#technology', count: '4.8K' },
            { name: '#art', count: '3.9K' }
        ];
    }

    // Attach event listeners
    attachEventListeners(modal) {
        // View toggle buttons
        modal.querySelectorAll('.view-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Filter chips
        modal.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.toggleFilter(filter, e.currentTarget);
            });
        });

        // Sort dropdown
        const sortSelect = modal.querySelector('#results-sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortResults(e.target.value);
            });
        }

        // Bulk select
        const bulkSelectBtn = modal.querySelector('#bulk-select-btn');
        if (bulkSelectBtn) {
            bulkSelectBtn.addEventListener('click', () => {
                this.toggleBulkSelect();
            });
        }

        // Result preferences
        const preferencesBtn = modal.querySelector('#result-preferences-btn');
        if (preferencesBtn) {
            preferencesBtn.addEventListener('click', () => {
                this.showResultPreferences();
            });
        }

        // Save search
        const saveBtn = modal.querySelector('#save-search-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveCurrentSearch();
            });
        }

        // Share results
        const shareBtn = modal.querySelector('#share-results-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareResults();
            });
        }
    }

    // Initialize result interactions
    initializeResultInteractions(modal) {
        // Load sample data for demo
        this.loadSampleResults();
        this.renderAllResults();
    }

    // Load sample results for demonstration
    loadSampleResults() {
        this.searchQuery = 'photography';
        this.searchResults = {
            people: [
                {
                    id: 'user-1',
                    name: 'Sarah Johnson',
                    username: 'sarahphoto',
                    avatar: 'https://source.unsplash.com/100x100/?portrait,woman,1',
                    bio: 'Professional photographer specializing in landscape and portrait photography',
                    followers: 12400,
                    likes: 89300,
                    verified: true,
                    online: true,
                    location: 'New York, NY',
                    mutualFriends: 8,
                    relevanceScore: 95,
                    lastActive: '2 hours ago'
                },
                {
                    id: 'user-2',
                    name: 'Mike Chen',
                    username: 'mikecaptures',
                    avatar: 'https://source.unsplash.com/100x100/?portrait,man,2',
                    bio: 'Street photographer and photography instructor based in San Francisco',
                    followers: 8900,
                    likes: 45600,
                    verified: false,
                    online: false,
                    location: 'San Francisco, CA',
                    mutualFriends: 3,
                    relevanceScore: 88,
                    lastActive: '1 day ago'
                }
            ],
            posts: [
                {
                    id: 'post-1',
                    author: {
                        name: 'Emma Wilson',
                        avatar: 'https://source.unsplash.com/40x40/?portrait,woman,3'
                    },
                    content: 'Just discovered this amazing photography technique for golden hour shots! The key is to...',
                    timestamp: '3 hours ago',
                    likes: 1240,
                    comments: 89,
                    shares: 34,
                    hasMedia: true,
                    media: {
                        type: 'image',
                        url: 'https://source.unsplash.com/400x300/?photography,golden,hour'
                    },
                    hashtags: ['#photography', '#goldenhour', '#tips'],
                    relevanceScore: 92,
                    engagementRate: 8.5
                }
            ],
            groups: [
                {
                    id: 'group-1',
                    name: 'Photography Enthusiasts',
                    category: 'Photography',
                    description: 'A community for photography lovers to share tips, techniques, and showcase their work',
                    image: 'https://source.unsplash.com/300x200/?camera,photography',
                    members: 15600,
                    isPublic: true,
                    verified: true,
                    location: 'Global',
                    activityLevel: 'Very Active',
                    postsThisWeek: 127,
                    relevanceScore: 94,
                    recentPosts: [
                        { title: 'Best camera settings for night photography' },
                        { title: 'Editing workflow for landscape photos' }
                    ]
                }
            ]
        };
        this.updateResultStats();
    }

    // Render all results based on current view
    renderAllResults() {
        switch (this.currentView) {
            case 'unified':
                this.renderUnifiedResults();
                break;
            case 'categorized':
                this.renderCategorizedResults();
                break;
            case 'timeline':
                this.renderTimelineResults();
                break;
            case 'map':
                this.renderMapResults();
                break;
        }
    }

    // Switch between different result views
    switchView(viewType) {
        this.currentView = viewType;
        
        // Update view buttons
        document.querySelectorAll('.view-toggle-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewType);
        });

        // Update view containers
        document.querySelectorAll('.results-view').forEach(view => {
            view.classList.toggle('active', view.id === `${viewType}-results-view`);
        });

        this.renderAllResults();
        
        if (this.app && this.app.showToast) {
            this.app.showToast(`Switched to ${this.capitalizeFirst(viewType)} view`, 'info');
        }
    }

    // Toggle filter state
    toggleFilter(filter, element) {
        if (this.activeFilters.has(filter)) {
            this.activeFilters.delete(filter);
            element.classList.remove('active');
        } else {
            this.activeFilters.add(filter);
            element.classList.add('active');
        }
        
        this.applyFilters();
    }

    // Apply active filters
    applyFilters() {
        // Filter logic would be implemented here
        if (this.app && this.app.showToast) {
            this.app.showToast(`Applied ${this.activeFilters.size} filters`, 'info');
        }
    }

    // Sort results
    sortResults(sortType) {
        this.currentSort = sortType;
        this.renderAllResults();
        
        if (this.app && this.app.showToast) {
            this.app.showToast(`Sorted by ${sortType}`, 'info');
        }
    }

    // Toggle bulk select mode
    toggleBulkSelect() {
        const checkboxes = document.querySelectorAll('.result-select-checkbox');
        const isSelecting = document.querySelector('.search-results-modal').classList.contains('bulk-select-mode');
        
        if (isSelecting) {
            document.querySelector('.search-results-modal').classList.remove('bulk-select-mode');
            checkboxes.forEach(cb => cb.checked = false);
            this.selectedResults.clear();
        } else {
            document.querySelector('.search-results-modal').classList.add('bulk-select-mode');
        }
        
        if (this.app && this.app.showToast) {
            this.app.showToast(isSelecting ? 'Bulk select disabled' : 'Bulk select enabled', 'info');
        }
    }

    // Save current search
    saveCurrentSearch() {
        const searchData = {
            query: this.searchQuery,
            filters: Array.from(this.activeFilters),
            sort: this.currentSort,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage or send to backend
        const savedSearches = JSON.parse(localStorage.getItem('connethub-saved-searches') || '[]');
        savedSearches.unshift(searchData);
        localStorage.setItem('connethub-saved-searches', JSON.stringify(savedSearches.slice(0, 50))); // Keep last 50
        
        if (this.app && this.app.showToast) {
            this.app.showToast('Search saved successfully!', 'success');
        }
    }

    // Share search results
    shareResults() {
        const shareData = {
            title: `Search Results for "${this.searchQuery}"`,
            text: `Found ${this.resultStats.totalResults} results for ${this.searchQuery}`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // Fallback to clipboard
            const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                if (this.app && this.app.showToast) {
                    this.app.showToast('Results copied to clipboard!', 'success');
                }
            });
        }
    }

    // Show result preferences
    showResultPreferences() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-cog"></i> Search Result Preferences</h3>
                    <button class="modal-close-btn" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="preference-section">
                        <h4>Display Preferences</h4>
                        <div class="preference-item">
                            <label>
                                <input type="checkbox" id="show-thumbnails" checked>
                                Show thumbnails for media results
                            </label>
                        </div>
                        <div class="preference-item">
                            <label>
                                <input type="checkbox" id="show-previews" checked>
                                Show content previews
                            </label>
                        </div>
                        <div class="preference-item">
                            <label>
                                <input type="checkbox" id="show-metadata" checked>
                                Show result metadata
                            </label>
                        </div>
                    </div>
                    
                    <div class="preference-section">
                        <h4>Default Settings</h4>
                        <div class="preference-item">
                            <label>Default view:</label>
                            <select id="default-view">
                                <option value="unified">Unified</option>
                                <option value="categorized">Categorized</option>
                                <option value="timeline">Timeline</option>
                                <option value="map">Map</option>
                            </select>
                        </div>
                        <div class="preference-item">
                            <label>Results per page:</label>
                            <select id="default-per-page">
                                <option value="10">10 results</option>
                                <option value="20" selected>20 results</option>
                                <option value="50">50 results</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="this.savePreferences()">Save Preferences</button>
                </div>
            </div>
        `;
        
        modal.savePreferences = () => {
            this.saveResultPreferences();
            modal.remove();
        };
        
        document.body.appendChild(modal);
    }

    // Load result preferences
    loadResultPreferences() {
        try {
            return JSON.parse(localStorage.getItem('connecthub-search-preferences')) || {
                showThumbnails: true,
                showPreviews: true,
                showMetadata: true,
                defaultView: 'unified',
                defaultPerPage: 20
            };
        } catch {
            return {
                showThumbnails: true,
                showPreviews: true,
                showMetadata: true,
                defaultView: 'unified',
                defaultPerPage: 20
            };
        }
    }

    // Save result preferences
    saveResultPreferences() {
        const preferences = {
            showThumbnails: document.getElementById('show-thumbnails')?.checked || true,
            showPreviews: document.getElementById('show-previews')?.checked || true,
            showMetadata: document.getElementById('show-metadata')?.checked || true,
            defaultView: document.getElementById('default-view')?.value || 'unified',
            defaultPerPage: parseInt(document.getElementById('default-per-page')?.value) || 20
        };
        
        localStorage.setItem('connecthub-search-preferences', JSON.stringify(preferences));
        this.resultPreferences = preferences;
        
        if (this.app && this.app.showToast) {
            this.app.showToast('Preferences saved!', 'success');
        }
    }

    // Render categorized results
    renderCategorizedResults() {
        Object.keys(this.searchResults).forEach(category => {
            const container = document.getElementById(`${category}-results`);
            if (container && this.searchResults[category] && this.searchResults[category].length > 0) {
                container.innerHTML = this.searchResults[category].map(result => 
                    this.renderResultItem({ ...result, type: category })
                ).join('');
            }
        });
    }

    // Render timeline results
    renderTimelineResults() {
        const container = document.getElementById('timeline-results-container');
        if (!container) return;
        
        const allResults = this.getAllResultsFlattened();
        // Sort by timestamp for timeline view
        const timelineSorted = allResults.sort((a, b) => {
            const aTime = new Date(a.timestamp || a.lastActive || a.uploadDate || 0);
            const bTime = new Date(b.timestamp || b.lastActive || b.uploadDate || 0);
            return bTime - aTime;
        });
        
        container.innerHTML = `
            <div class="timeline-container">
                ${timelineSorted.map(result => `
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            ${this.renderResultItem(result)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Render map results
    renderMapResults() {
        const container = document.getElementById('nearby-results');
        if (!container) return;
        
        // Filter results that have location data
        const locationResults = this.getAllResultsFlattened().filter(result => 
            result.location || result.latitude
        );
        
        container.innerHTML = locationResults.map(result => `
            <div class="nearby-result-item">
                <div class="result-location-info">
                    <h5>${result.name || result.title}</h5>
                    <p>${result.location || 'Location available'}</p>
                    <span class="distance">0.5 mi away</span>
                </div>
                <button class="btn btn-small btn-primary" onclick="this.focusOnMap('${result.id}')">
                    View on Map
                </button>
            </div>
        `).join('');
    }

    // Add result interaction handlers
    addResultInteractionHandlers(container) {
        // Add click handlers for result items
        container.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.result-action-btn') || e.target.closest('.result-select-checkbox')) {
                    return; // Don't handle if clicking on buttons or checkboxes
                }
                
                const resultId = item.dataset.id;
                const resultType = item.dataset.type;
                this.handleResultClick(resultId, resultType);
            });
        });

        // Add checkbox change handlers
        container.querySelectorAll('.result-select-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const resultItem = e.target.closest('.search-result-item');
                const resultId = resultItem.dataset.id;
                
                if (e.target.checked) {
                    this.selectedResults.add(resultId);
                } else {
                    this.selectedResults.delete(resultId);
                }
                
                this.updateSelectionUI();
            });
        });
    }

    // Handle result item click
    handleResultClick(resultId, resultType) {
        if (this.app && this.app.showToast) {
            this.app.showToast(`Opening ${resultType}: ${resultId}`, 'info');
        }
    }

    // Update selection UI
    updateSelectionUI() {
        const selectedCount = this.selectedResults.size;
        const bulkActions = document.querySelector('.bulk-actions');
        
        if (selectedCount > 0) {
            if (!bulkActions) {
                this.showBulkActions();
            }
            document.querySelector('.selected-count').textContent = `${selectedCount} selected`;
        } else if (bulkActions) {
            bulkActions.remove();
        }
    }

    // Show bulk actions panel
    showBulkActions() {
        const actionsPanel = document.createElement('div');
        actionsPanel.className = 'bulk-actions';
        actionsPanel.innerHTML = `
            <div class="bulk-actions-content">
                <span class="selected-count">0 selected</span>
                <div class="bulk-action-buttons">
                    <button class="btn btn-secondary" onclick="this.exportSelected()">Export</button>
                    <button class="btn btn-secondary" onclick="this.shareSelected()">Share</button>
                    <button class="btn btn-secondary" onclick="this.clearSelection()">Clear</button>
                </div>
            </div>
        `;
        
        document.querySelector('.search-results-content').appendChild(actionsPanel);
    }

    // Focus on map marker
    focusOnMap(resultId) {
        if (this.app && this.app.showToast) {
            this.app.showToast(`Focusing on result: ${resultId}`, 'info');
        }
    }
}

// Initialize and export
if (typeof window !== 'undefined') {
    window.AdvancedSearchResultsUI = AdvancedSearchResultsUI;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.connectHub && window.searchUI) {
        window.advancedSearchResults = new AdvancedSearchResultsUI(window.connectHub);
        
        // Integrate with existing search UI
        if (window.searchUI.showAdvancedResults) {
            window.searchUI.showAdvancedResults = (query, results) => {
                return window.advancedSearchResults.showAdvancedSearchResults(query, results);
            };
        }
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedSearchResultsUI;
}
