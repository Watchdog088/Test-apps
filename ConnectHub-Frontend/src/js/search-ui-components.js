/**
 * ConnectHub - Search UI Components
 * Comprehensive search functionality with 6 dedicated interfaces
 */

class SearchUIComponents {
    constructor(app) {
        this.app = app;
        this.searchCache = new Map();
        this.searchHistory = [];
        this.activeFilters = {};
        this.searchResults = {
            global: [],
            people: [],
            posts: [],
            dating: [],
            groups: [],
            media: []
        };
        
        this.init();
    }

    /**
     * Initialize all search UI components
     */
    init() {
        this.createSearchSection();
        this.initializeSearchInterfaces();
        this.setupSearchEventListeners();
        this.loadSearchHistory();
        console.log('Search UI Components initialized with 6 interfaces');
    }

    /**
     * Create the main search section in the app
     */
    createSearchSection() {
        // Add search section to main content if it doesn't exist
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        const searchSection = document.createElement('section');
        searchSection.className = 'content-section';
        searchSection.id = 'search-section';
        
        searchSection.innerHTML = this.getSearchSectionHTML();
        mainContent.appendChild(searchSection);

        // Add search navigation item
        this.addSearchNavigation();
    }

    /**
     * Add search navigation to the main nav
     */
    addSearchNavigation() {
        const mainNav = document.querySelector('.main-nav ul');
        if (!mainNav) return;

        // Check if search nav already exists
        if (document.querySelector('[data-section="search"]')) return;

        const searchNavItem = document.createElement('li');
        searchNavItem.className = 'nav-item';
        searchNavItem.setAttribute('data-section', 'search');
        
        searchNavItem.innerHTML = `
            <a href="#search" id="search-nav">
                <i class="fas fa-search"></i>
                <span>Search</span>
            </a>
        `;

        // Insert after home nav item
        const homeNav = mainNav.querySelector('[data-section="home"]');
        if (homeNav && homeNav.nextElementSibling) {
            mainNav.insertBefore(searchNavItem, homeNav.nextElementSibling);
        } else {
            mainNav.appendChild(searchNavItem);
        }

        // Add event listener
        searchNavItem.addEventListener('click', (e) => {
            e.preventDefault();
            this.app.navigateToSection('search');
        });
    }

    /**
     * Get the main search section HTML
     */
    getSearchSectionHTML() {
        return `
            <div class="search-container">
                <!-- Search Header -->
                <div class="search-header">
                    <div class="search-header-content">
                        <h2><i class="fas fa-search"></i> Search</h2>
                        <p>Discover people, posts, groups, and more across ConnectHub</p>
                        
                        <!-- Enhanced Global Search Bar -->
                        <div class="enhanced-search-bar">
                            <div class="search-input-wrapper">
                                <i class="fas fa-search search-icon"></i>
                                <input type="text" id="global-search-main" placeholder="Search for anything..." class="search-input-main">
                                <button class="search-voice-btn" id="voice-search-btn" title="Voice Search">
                                    <i class="fas fa-microphone"></i>
                                </button>
                                <button class="search-camera-btn" id="camera-search-btn" title="Search by Image">
                                    <i class="fas fa-camera"></i>
                                </button>
                            </div>
                            <div class="search-suggestions-dropdown" id="search-suggestions-dropdown">
                                <!-- Search suggestions will appear here -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Search Navigation Tabs -->
                <div class="search-tabs">
                    <button class="search-tab active" data-tab="global" id="global-search-tab">
                        <i class="fas fa-globe"></i>
                        <span>All Results</span>
                        <span class="results-count" id="global-results-count">0</span>
                    </button>
                    <button class="search-tab" data-tab="people" id="people-search-tab">
                        <i class="fas fa-users"></i>
                        <span>People</span>
                        <span class="results-count" id="people-results-count">0</span>
                    </button>
                    <button class="search-tab" data-tab="posts" id="posts-search-tab">
                        <i class="fas fa-newspaper"></i>
                        <span>Posts</span>
                        <span class="results-count" id="posts-results-count">0</span>
                    </button>
                    <button class="search-tab" data-tab="dating" id="dating-search-tab">
                        <i class="fas fa-heart"></i>
                        <span>Dating</span>
                        <span class="results-count" id="dating-results-count">0</span>
                    </button>
                    <button class="search-tab" data-tab="groups" id="groups-search-tab">
                        <i class="fas fa-users-cog"></i>
                        <span>Groups</span>
                        <span class="results-count" id="groups-results-count">0</span>
                    </button>
                    <button class="search-tab" data-tab="advanced" id="advanced-search-tab">
                        <i class="fas fa-sliders-h"></i>
                        <span>Advanced</span>
                    </button>
                </div>

                <!-- Search Content Areas -->
                <div class="search-content">
                    ${this.getGlobalSearchInterface()}
                    ${this.getPeopleSearchInterface()}
                    ${this.getPostsSearchInterface()}
                    ${this.getDatingSearchInterface()}
                    ${this.getGroupsSearchInterface()}
                    ${this.getAdvancedSearchInterface()}
                </div>
            </div>
        `;
    }

    /**
     * Interface 1: Global Search Results Page
     */
    getGlobalSearchInterface() {
        return `
            <div class="search-tab-content active" id="global-search-content">
                <div class="global-search-interface">
                    <!-- Search Results Overview -->
                    <div class="search-results-overview" id="search-results-overview">
                        <div class="results-summary" id="results-summary">
                            <h3>Search Results</h3>
                            <p class="results-info">Enter a search term to see results</p>
                        </div>
                        
                        <div class="search-filters-toggle">
                            <button class="filters-toggle-btn" id="global-filters-toggle">
                                <i class="fas fa-filter"></i>
                                Filters
                            </button>
                            <button class="sort-toggle-btn" id="global-sort-toggle">
                                <i class="fas fa-sort"></i>
                                Sort
                            </button>
                        </div>
                    </div>

                    <!-- Quick Filters -->
                    <div class="quick-filters" id="global-quick-filters">
                        <div class="filter-chips">
                            <button class="filter-chip active" data-filter="all">All</button>
                            <button class="filter-chip" data-filter="recent">Recent</button>
                            <button class="filter-chip" data-filter="popular">Popular</button>
                            <button class="filter-chip" data-filter="verified">Verified</button>
                            <button class="filter-chip" data-filter="nearby">Nearby</button>
                        </div>
                        
                        <div class="time-filter">
                            <select class="time-filter-select" id="global-time-filter">
                                <option value="all">Any time</option>
                                <option value="hour">Past hour</option>
                                <option value="day">Past 24 hours</option>
                                <option value="week">Past week</option>
                                <option value="month">Past month</option>
                                <option value="year">Past year</option>
                            </select>
                        </div>
                    </div>

                    <!-- Mixed Results Display -->
                    <div class="global-results-container" id="global-results-container">
                        <div class="results-categories">
                            <!-- Top People Results -->
                            <div class="result-category" id="global-people-preview">
                                <div class="category-header">
                                    <h4><i class="fas fa-users"></i> People</h4>
                                    <button class="see-all-btn" onclick="searchUI.switchToTab('people')">See all</button>
                                </div>
                                <div class="horizontal-scroll-results" id="global-people-results">
                                    <!-- People results preview -->
                                </div>
                            </div>

                            <!-- Top Posts Results -->
                            <div class="result-category" id="global-posts-preview">
                                <div class="category-header">
                                    <h4><i class="fas fa-newspaper"></i> Posts</h4>
                                    <button class="see-all-btn" onclick="searchUI.switchToTab('posts')">See all</button>
                                </div>
                                <div class="posts-results-grid" id="global-posts-results">
                                    <!-- Posts results preview -->
                                </div>
                            </div>

                            <!-- Top Groups Results -->
                            <div class="result-category" id="global-groups-preview">
                                <div class="category-header">
                                    <h4><i class="fas fa-users-cog"></i> Groups</h4>
                                    <button class="see-all-btn" onclick="searchUI.switchToTab('groups')">See all</button>
                                </div>
                                <div class="horizontal-scroll-results" id="global-groups-results">
                                    <!-- Groups results preview -->
                                </div>
                            </div>

                            <!-- Hashtags & Trends -->
                            <div class="result-category" id="global-hashtags-preview">
                                <div class="category-header">
                                    <h4><i class="fas fa-hashtag"></i> Trending</h4>
                                    <button class="see-all-btn">Explore trends</button>
                                </div>
                                <div class="hashtags-results" id="global-hashtags-results">
                                    <!-- Hashtags results -->
                                </div>
                            </div>
                        </div>

                        <!-- No Results State -->
                        <div class="no-results-state" id="global-no-results" style="display: none;">
                            <div class="no-results-content">
                                <i class="fas fa-search-minus"></i>
                                <h3>No results found</h3>
                                <p>Try different keywords or check your spelling</p>
                                <div class="search-suggestions">
                                    <p>Suggestions:</p>
                                    <div class="suggestion-tags">
                                        <span class="suggestion-tag" onclick="searchUI.performSearch('photography')">photography</span>
                                        <span class="suggestion-tag" onclick="searchUI.performSearch('travel')">travel</span>
                                        <span class="suggestion-tag" onclick="searchUI.performSearch('food')">food</span>
                                        <span class="suggestion-tag" onclick="searchUI.performSearch('art')">art</span>
                                        <span class="suggestion-tag" onclick="searchUI.performSearch('music')">music</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Interface 2: People/Users Search Interface
     */
    getPeopleSearchInterface() {
        return `
            <div class="search-tab-content" id="people-search-content">
                <div class="people-search-interface">
                    <!-- People Search Header -->
                    <div class="people-search-header">
                        <h3><i class="fas fa-users"></i> Find People</h3>
                        <p>Discover new friends and connections</p>
                    </div>

                    <!-- People Filters -->
                    <div class="people-filters">
                        <div class="filter-row">
                            <div class="filter-group">
                                <label>Location</label>
                                <div class="location-filter">
                                    <input type="text" placeholder="City, state, or country" id="people-location-filter">
                                    <select id="people-distance-filter">
                                        <option value="any">Any distance</option>
                                        <option value="5">Within 5 miles</option>
                                        <option value="25">Within 25 miles</option>
                                        <option value="50">Within 50 miles</option>
                                        <option value="100">Within 100 miles</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="filter-group">
                                <label>Age Range</label>
                                <div class="age-range-filter">
                                    <input type="number" placeholder="Min" min="18" max="100" id="people-min-age">
                                    <span>to</span>
                                    <input type="number" placeholder="Max" min="18" max="100" id="people-max-age">
                                </div>
                            </div>
                        </div>

                        <div class="filter-row">
                            <div class="filter-group">
                                <label>Interests</label>
                                <div class="interests-filter">
                                    <div class="interest-tags" id="people-interests-filter">
                                        <span class="interest-tag" data-interest="photography">Photography</span>
                                        <span class="interest-tag" data-interest="travel">Travel</span>
                                        <span class="interest-tag" data-interest="music">Music</span>
                                        <span class="interest-tag" data-interest="sports">Sports</span>
                                        <span class="interest-tag" data-interest="art">Art</span>
                                        <span class="interest-tag" data-interest="food">Food</span>
                                        <span class="interest-tag" data-interest="tech">Technology</span>
                                        <span class="interest-tag" data-interest="fitness">Fitness</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="filter-row">
                            <div class="filter-toggles">
                                <label class="toggle-filter">
                                    <input type="checkbox" id="people-mutual-friends">
                                    <span class="toggle-slider"></span>
                                    Has mutual friends
                                </label>
                                <label class="toggle-filter">
                                    <input type="checkbox" id="people-verified-only">
                                    <span class="toggle-slider"></span>
                                    Verified accounts only
                                </label>
                                <label class="toggle-filter">
                                    <input type="checkbox" id="people-online-now">
                                    <span class="toggle-slider"></span>
                                    Online now
                                </label>
                            </div>
                        </div>

                        <div class="filter-actions">
                            <button class="apply-filters-btn" id="apply-people-filters">Apply Filters</button>
                            <button class="clear-filters-btn" id="clear-people-filters">Clear All</button>
                        </div>
                    </div>

                    <!-- Sort Options -->
                    <div class="people-sort-options">
                        <div class="sort-controls">
                            <span>Sort by:</span>
                            <select id="people-sort-select">
                                <option value="relevance">Most Relevant</option>
                                <option value="recent">Recently Joined</option>
                                <option value="popular">Most Followers</option>
                                <option value="active">Most Active</option>
                                <option value="distance">Nearest First</option>
                                <option value="mutual">Most Mutual Friends</option>
                            </select>
                        </div>
                    </div>

                    <!-- People Results -->
                    <div class="people-results-container" id="people-results-container">
                        <div class="results-grid people-grid" id="people-results-grid">
                            <!-- People results will be loaded here -->
                        </div>

                        <!-- Load More Button -->
                        <div class="load-more-container" id="people-load-more-container" style="display: none;">
                            <button class="load-more-btn" id="people-load-more">
                                <i class="fas fa-chevron-down"></i>
                                Load More People
                            </button>
                        </div>
                    </div>

                    <!-- People Search Empty State -->
                    <div class="people-empty-state" id="people-empty-state">
                        <div class="empty-state-content">
                            <i class="fas fa-user-friends"></i>
                            <h3>Find Your Community</h3>
                            <p>Search for people by name, interests, or location to start connecting</p>
                            <div class="popular-searches">
                                <h4>Popular searches:</h4>
                                <div class="popular-search-tags">
                                    <span class="popular-tag" onclick="searchUI.performPeopleSearch('photographers')">photographers</span>
                                    <span class="popular-tag" onclick="searchUI.performPeopleSearch('travelers')">travelers</span>
                                    <span class="popular-tag" onclick="searchUI.performPeopleSearch('artists')">artists</span>
                                    <span class="popular-tag" onclick="searchUI.performPeopleSearch('musicians')">musicians</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Interface 3: Posts Search Interface
     */
    getPostsSearchInterface() {
        return `
            <div class="search-tab-content" id="posts-search-content">
                <div class="posts-search-interface">
                    <!-- Posts Search Header -->
                    <div class="posts-search-header">
                        <h3><i class="fas fa-newspaper"></i> Search Posts</h3>
                        <p>Find posts, stories, and content across ConnectHub</p>
                    </div>

                    <!-- Posts Filters -->
                    <div class="posts-filters">
                        <div class="filter-row">
                            <div class="filter-group">
                                <label>Content Type</label>
                                <div class="content-type-filters">
                                    <label class="checkbox-filter">
                                        <input type="checkbox" value="text" checked> Text Posts
                                    </label>
                                    <label class="checkbox-filter">
                                        <input type="checkbox" value="image" checked> Photos
                                    </label>
                                    <label class="checkbox-filter">
                                        <input type="checkbox" value="video" checked> Videos
                                    </label>
                                    <label class="checkbox-filter">
                                        <input type="checkbox" value="link"> Links
                                    </label>
                                </div>
                            </div>

                            <div class="filter-group">
                                <label>Date Range</label>
                                <div class="date-range-filters">
                                    <input type="date" id="posts-date-from" placeholder="From">
                                    <input type="date" id="posts-date-to" placeholder="To">
                                </div>
                            </div>
                        </div>

                        <div class="filter-row">
                            <div class="filter-group">
                                <label>Hashtags</label>
                                <input type="text" placeholder="Enter hashtags separated by commas" id="posts-hashtags-filter">
                            </div>

                            <div class="filter-group">
                                <label>Author</label>
                                <input type="text" placeholder="Search by username or name" id="posts-author-filter">
                            </div>
                        </div>

                        <div class="filter-row">
                            <div class="filter-group">
                                <label>Engagement</label>
                                <div class="engagement-filters">
                                    <div class="range-filter">
                                        <label>Min likes:</label>
                                        <input type="number" placeholder="0" id="posts-min-likes">
                                    </div>
                                    <div class="range-filter">
                                        <label>Min comments:</label>
                                        <input type="number" placeholder="0" id="posts-min-comments">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="filter-actions">
                            <button class="apply-filters-btn" id="apply-posts-filters">Apply Filters</button>
                            <button class="clear-filters-btn" id="clear-posts-filters">Clear All</button>
                        </div>
                    </div>

                    <!-- Posts Sort Options -->
                    <div class="posts-sort-options">
                        <div class="sort-controls">
                            <span>Sort by:</span>
                            <select id="posts-sort-select">
                                <option value="relevance">Most Relevant</option>
                                <option value="recent">Most Recent</option>
                                <option value="popular">Most Popular</option>
                                <option value="likes">Most Liked</option>
                                <option value="comments">Most Commented</option>
                                <option value="shares">Most Shared</option>
                            </select>
                        </div>

                        <div class="view-toggle">
                            <button class="view-toggle-btn active" data-view="list" title="List View">
                                <i class="fas fa-list"></i>
                            </button>
                            <button class="view-toggle-btn" data-view="grid" title="Grid View">
                                <i class="fas fa-th"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Posts Results -->
                    <div class="posts-results-container" id="posts-results-container">
                        <div class="results-view list-view active" id="posts-list-view">
                            <!-- List view posts will be loaded here -->
                        </div>
                        <div class="results-view grid-view" id="posts-grid-view">
                            <!-- Grid view posts will be loaded here -->
                        </div>

                        <!-- Load More Button -->
                        <div class="load-more-container" id="posts-load-more-container" style="display: none;">
                            <button class="load-more-btn" id="posts-load-more">
                                <i class="fas fa-chevron-down"></i>
                                Load More Posts
                            </button>
                        </div>
                    </div>

                    <!-- Posts Search Empty State -->
                    <div class="posts-empty-state" id="posts-empty-state">
                        <div class="empty-state-content">
                            <i class="fas fa-file-alt"></i>
                            <h3>Discover Amazing Content</h3>
                            <p>Search for posts, photos, videos, and stories from the ConnectHub community</p>
                            <div class="trending-topics">
                                <h4>Trending topics:</h4>
                                <div class="trending-tags">
                                    <span class="trending-tag" onclick="searchUI.performPostsSearch('#photography')">#photography</span>
                                    <span class="trending-tag" onclick="searchUI.performPostsSearch('#travel')">#travel</span>
                                    <span class="trending-tag" onclick="searchUI.performPostsSearch('#food')">#food</span>
                                    <span class="trending-tag" onclick="searchUI.performPostsSearch('#art')">#art</span>
                                    <span class="trending-tag" onclick="searchUI.performPostsSearch('#music')">#music</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Interface 4: Dating Search Interface
     */
    getDatingSearchInterface() {
        return `
            <div class="search-tab-content" id="dating-search-content">
                <div class="dating-search-interface">
                    <!-- Dating Search Header -->
                    <div class="dating-search-header">
                        <h3><i class="fas fa-heart"></i> Find Your Match</h3>
                        <p>Discover potential partners based on your preferences</p>
                    </div>

                    <!-- Dating Filters -->
                    <div class="dating-filters">
                        <div class="filter-section">
                            <h4><i class="fas fa-user"></i> Basic Preferences</h4>
                            <div class="filter-row">
                                <div class="filter-group">
                                    <label>Looking for</label>
                                    <div class="gender-preferences">
                                        <label class="checkbox-filter">
                                            <input type="checkbox" value="women" checked> Women
                                        </label>
                                        <label class="checkbox-filter">
                                            <input type="checkbox" value="men"> Men
                                        </label>
                                        <label class="checkbox-filter">
                                            <input type="checkbox" value="non-binary"> Non-binary
                                        </label>
                                    </div>
                                </div>

                                <div class="filter-group">
                                    <label>Age Range</label>
                                    <div class="age-slider-container">
                                        <input type="range" id="dating-age-min" min="18" max="80" value="22" class="age-slider">
                                        <input type="range" id="dating-age-max" min="18" max="80" value="35" class="age-slider">
                                        <div class="age-display">
                                            <span id="dating-age-display">22 - 35 years old</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="filter-row">
                                <div class="filter-group">
                                    <label>Distance</label>
                                    <div class="distance-slider-container">
                                        <input type="range" id="dating-distance" min="1" max="100" value="25" class="distance-slider">
                                        <div class="distance-display">
                                            <span id="dating-distance-display">Within 25 miles</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="filter-section">
                            <h4><i class="fas fa-heart"></i> Relationship Preferences</h4>
                            <div class="filter-row">
                                <div class="filter-group">
                                    <label>Looking for</label>
                                    <div class="relationship-type-filters">
                                        <label class="radio-filter">
                                            <input type="radio" name="relationship-type" value="serious" checked> Serious relationship
                                        </label>
                                        <label class="radio-filter">
                                            <input type="radio" name="relationship-type" value="casual"> Something casual
                                        </label>
                                        <label class="radio-filter">
                                            <input type="radio" name="relationship-type" value="friends"> New friends
                                        </label>
                                        <label class="radio-filter">
                                            <input type="radio" name="relationship-type" value="unsure"> Not sure yet
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="filter-section">
                            <h4><i class="fas fa-graduation-cap"></i> Background & Lifestyle</h4>
                            <div class="filter-row">
                                <div class="filter-group">
                                    <label>Education</label>
                                    <select id="dating-education-filter" multiple>
                                        <option value="high-school">High School</option>
                                        <option value="college">College</option>
                                        <option value="bachelors">Bachelor's Degree</option>
                                        <option value="masters">Master's Degree</option>
                                        <option value="phd">PhD</option>
                                    </select>
                                </div>

                                <div class="filter-group">
                                    <label>Occupation</label>
                                    <input type="text" placeholder="e.g., Engineer, Teacher, Artist..." id="dating-occupation-filter">
                                </div>
                            </div>

                            <div class="filter-row">
                                <div class="filter-group">
                                    <label>Lifestyle</label>
                                    <div class="lifestyle-tags" id="dating-lifestyle-tags">
                                        <span class="lifestyle-tag" data-lifestyle="fitness">Fitness enthusiast</span>
                                        <span class="lifestyle-tag" data-lifestyle="travel">Loves to travel</span>
                                        <span class="lifestyle-tag" data-lifestyle="foodie">Foodie</span>
                                        <span class="lifestyle-tag" data-lifestyle="homebody">Homebody</span>
                                        <span class="lifestyle-tag" data-lifestyle="outdoors">Outdoor enthusiast</span>
                                        <span class="lifestyle-tag" data-lifestyle="nightlife">Nightlife lover</span>
                                        <span class="lifestyle-tag" data-lifestyle="creative">Creative type</span>
                                        <span class="lifestyle-tag" data-lifestyle="spiritual">Spiritual</span>
                                        <span class="lifestyle-tag" data-lifestyle="family">Family-oriented</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="filter-actions">
                            <button class="apply-filters-btn" id="apply-dating-filters">Apply Filters</button>
                            <button class="clear-filters-btn" id="clear-dating-filters">Clear All</button>
                        </div>
                    </div>

                    <!-- Dating Results -->
                    <div class="dating-results-container" id="dating-results-container">
                        <div class="compatibility-sorting">
                            <div class="sort-controls">
                                <span>Sort by:</span>
                                <select id="dating-sort-select">
                                    <option value="compatibility">Best Match</option>
                                    <option value="distance">Nearest First</option>
                                    <option value="recent">Recently Active</option>
                                    <option value="age">Age</option>
                                    <option value="popularity">Most Popular</option>
                                </select>
                            </div>
                            
                            <div class="match-view-toggle">
                                <button class="view-toggle-btn active" data-view="cards" title="Card View">
                                    <i class="fas fa-id-card"></i>
                                </button>
                                <button class="view-toggle-btn" data-view="list" title="List View">
                                    <i class="fas fa-list"></i>
                                </button>
                            </div>
                        </div>

                        <div class="dating-results-grid" id="dating-results-grid">
                            <!-- Dating results will be loaded here -->
                        </div>

                        <!-- Load More Button -->
                        <div class="load-more-container" id="dating-load-more-container" style="display: none;">
                            <button class="load-more-btn" id="dating-load-more">
                                <i class="fas fa-chevron-down"></i>
                                Find More Matches
                            </button>
                        </div>
                    </div>

                    <!-- Dating Search Empty State -->
                    <div class="dating-empty-state" id="dating-empty-state">
                        <div class="empty-state-content">
                            <i class="fas fa-heart-broken"></i>
                            <h3>Find Your Perfect Match</h3>
                            <p>Set your preferences above to discover compatible people in your area</p>
                            <div class="dating-tips">
                                <h4>Dating tips:</h4>
                                <ul>
                                    <li>Upload recent, clear photos</li>
                                    <li>Write an engaging bio</li>
                                    <li>Be specific about your interests</li>
                                    <li>Stay safe - meet in public places</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Interface 5: Groups/Communities Search Interface
     */
    getGroupsSearchInterface() {
        return `
            <div class="search-tab-content" id="groups-search-content">
                <div class="groups-search-interface">
                    <!-- Groups Search Header -->
                    <div class="groups-search-header">
                        <h3><i class="fas fa-users-cog"></i> Discover Groups</h3>
                        <p>Find communities that match your interests and passions</p>
                    </div>

                    <!-- Groups Filters -->
                    <div class="groups-filters">
                        <div class="filter-row">
                            <div class="filter-group">
                                <label>Category</label>
                                <select id="groups-category-filter">
                                    <option value="all">All Categories</option>
                                    <option value="photography">Photography</option>
                                    <option value="travel">Travel</option>
                                    <option value="technology">Technology</option>
                                    <option value="fitness">Fitness & Health</option>
                                    <option value="food">Food & Cooking</option>
                                    <option value="music">Music</option>
                                    <option value="art">Arts & Crafts</option>
                                    <option value="sports">Sports</option>
                                    <option value="business">Business</option>
                                    <option value="education">Education</option>
                                    <option value="gaming">Gaming</option>
                                    <option value="books">Books & Literature</option>
                                    <option value="movies">Movies & TV</option>
                                    <option value="lifestyle">Lifestyle</option>
                                    <option value="local">Local Community</option>
                                </select>
                            </div>

                            <div class="filter-group">
                                <label>Group Size</label>
                                <select id="groups-size-filter">
                                    <option value="any">Any Size</option>
                                    <option value="small">Small (< 100 members)</option>
                                    <option value="medium">Medium (100-1000 members)</option>
                                    <option value="large">Large (1000-10K members)</option>
                                    <option value="huge">Huge (10K+ members)</option>
                                </select>
                            </div>

                            <div class="filter-group">
                                <label>Activity Level</label>
                                <select id="groups-activity-filter">
                                    <option value="any">Any Activity</option>
                                    <option value="very-active">Very Active (daily posts)</option>
                                    <option value="active">Active (weekly posts)</option>
                                    <option value="moderate">Moderate (monthly posts)</option>
                                    <option value="low">Low Activity</option>
                                </select>
                            </div>
                        </div>

                        <div class="filter-row">
                            <div class="filter-group">
                                <label>Location</label>
                                <div class="location-filter">
                                    <input type="text" placeholder="City, state, or region" id="groups-location-filter">
                                    <select id="groups-location-type">
                                        <option value="any">Any Location</option>
                                        <option value="local">Local Groups</option>
                                        <option value="online">Online Groups</option>
                                        <option value="hybrid">Hybrid (Local + Online)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="filter-row">
                            <div class="filter-toggles">
                                <label class="toggle-filter">
                                    <input type="checkbox" id="groups-public-only">
                                    <span class="toggle-slider"></span>
                                    Public groups only
                                </label>
                                <label class="toggle-filter">
                                    <input type="checkbox" id="groups-verified-only">
                                    <span class="toggle-slider"></span>
                                    Verified groups
                                </label>
                                <label class="toggle-filter">
                                    <input type="checkbox" id="groups-events-enabled">
                                    <span class="toggle-slider"></span>
                                    Hosts events
                                </label>
                            </div>
                        </div>

                        <div class="filter-actions">
                            <button class="apply-filters-btn" id="apply-groups-filters">Apply Filters</button>
                            <button class="clear-filters-btn" id="clear-groups-filters">Clear All</button>
                        </div>
                    </div>

                    <!-- Groups Sort Options -->
                    <div class="groups-sort-options">
                        <div class="sort-controls">
                            <span>Sort by:</span>
                            <select id="groups-sort-select">
                                <option value="relevance">Most Relevant</option>
                                <option value="members">Most Members</option>
                                <option value="activity">Most Active</option>
                                <option value="recent">Recently Created</option>
                                <option value="name">Name (A-Z)</option>
                                <option value="distance">Nearest First</option>
                            </select>
                        </div>

                        <div class="create-group-btn-container">
                            <button class="create-group-btn" id="create-new-group">
                                <i class="fas fa-plus"></i>
                                Create New Group
                            </button>
                        </div>
                    </div>

                    <!-- Groups Results -->
                    <div class="groups-results-container" id="groups-results-container">
                        <div class="groups-grid" id="groups-results-grid">
                            <!-- Groups results will be loaded here -->
                        </div>

                        <!-- Load More Button -->
                        <div class="load-more-container" id="groups-load-more-container" style="display: none;">
                            <button class="load-more-btn" id="groups-load-more">
                                <i class="fas fa-chevron-down"></i>
                                Load More Groups
                            </button>
                        </div>
                    </div>

                    <!-- Groups Search Empty State -->
                    <div class="groups-empty-state" id="groups-empty-state">
                        <div class="empty-state-content">
                            <i class="fas fa-users"></i>
                            <h3>Find Your Tribe</h3>
                            <p>Discover groups and communities that share your interests and passions</p>
                            <div class="featured-categories">
                                <h4>Popular categories:</h4>
                                <div class="category-tags">
                                    <span class="category-tag" onclick="searchUI.performGroupsSearch('photography')">
                                        <i class="fas fa-camera"></i> Photography
                                    </span>
                                    <span class="category-tag" onclick="searchUI.performGroupsSearch('travel')">
                                        <i class="fas fa-plane"></i> Travel
                                    </span>
                                    <span class="category-tag" onclick="searchUI.performGroupsSearch('fitness')">
                                        <i class="fas fa-dumbbell"></i> Fitness
                                    </span>
                                    <span class="category-tag" onclick="searchUI.performGroupsSearch('technology')">
                                        <i class="fas fa-code"></i> Tech
                                    </span>
                                    <span class="category-tag" onclick="searchUI.performGroupsSearch('food')">
                                        <i class="fas fa-utensils"></i> Food
                                    </span>
                                    <span class="category-tag" onclick="searchUI.performGroupsSearch('music')">
                                        <i class="fas fa-music"></i> Music
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Interface 6: Advanced Search Filters Panel
     */
    getAdvancedSearchInterface() {
        return `
            <div class="search-tab-content" id="advanced-search-content">
                <div class="advanced-search-interface">
                    <!-- Advanced Search Header -->
                    <div class="advanced-search-header">
                        <h3><i class="fas fa-sliders-h"></i> Advanced Search</h3>
                        <p>Create detailed search queries with multiple criteria and filters</p>
                    </div>

                    <!-- Query Builder -->
                    <div class="query-builder">
                        <div class="query-builder-header">
                            <h4><i class="fas fa-cogs"></i> Query Builder</h4>
                            <div class="query-actions">
                                <button class="save-query-btn" id="save-search-query">
                                    <i class="fas fa-save"></i> Save Query
                                </button>
                                <button class="load-query-btn" id="load-search-query">
                                    <i class="fas fa-folder-open"></i> Load Query
                                </button>
                            </div>
                        </div>

                        <div class="search-conditions" id="search-conditions">
                            <div class="condition-group">
                                <div class="condition-header">
                                    <h5>Search Terms</h5>
                                    <button class="add-condition-btn" onclick="searchUI.addSearchCondition('terms')">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                                <div class="search-term-condition">
                                    <select class="condition-operator">
                                        <option value="contains">Contains</option>
                                        <option value="exact">Exact phrase</option>
                                        <option value="starts">Starts with</option>
                                        <option value="ends">Ends with</option>
                                        <option value="excludes">Excludes</option>
                                    </select>
                                    <input type="text" placeholder="Enter search term..." class="condition-value">
                                    <select class="condition-logic">
                                        <option value="and">AND</option>
                                        <option value="or">OR</option>
                                        <option value="not">NOT</option>
                                    </select>
                                </div>
                            </div>

                            <div class="condition-group">
                                <div class="condition-header">
                                    <h5>Content Filters</h5>
                                    <button class="add-condition-btn" onclick="searchUI.addSearchCondition('content')">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                                <div class="content-conditions">
                                    <div class="filter-grid">
                                        <div class="filter-item">
                                            <label>Content Type</label>
                                            <select id="advanced-content-type" multiple>
                                                <option value="posts">Posts</option>
                                                <option value="comments">Comments</option>
                                                <option value="profiles">Profiles</option>
                                                <option value="groups">Groups</option>
                                                <option value="events">Events</option>
                                                <option value="media">Media</option>
                                            </select>
                                        </div>

                                        <div class="filter-item">
                                            <label>Media Type</label>
                                            <div class="checkbox-group">
                                                <label><input type="checkbox" value="image"> Images</label>
                                                <label><input type="checkbox" value="video"> Videos</label>
                                                <label><input type="checkbox" value="audio"> Audio</label>
                                                <label><input type="checkbox" value="document"> Documents</label>
                                            </div>
                                        </div>

                                        <div class="filter-item">
                                            <label>Language</label>
                                            <select id="advanced-language">
                                                <option value="any">Any Language</option>
                                                <option value="en">English</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                                <option value="de">German</option>
                                                <option value="it">Italian</option>
                                                <option value="pt">Portuguese</option>
                                                <option value="zh">Chinese</option>
                                                <option value="ja">Japanese</option>
                                                <option value="ko">Korean</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="condition-group">
                                <div class="condition-header">
                                    <h5>Date & Time Filters</h5>
                                </div>
                                <div class="datetime-conditions">
                                    <div class="filter-grid">
                                        <div class="filter-item">
                                            <label>Date Range</label>
                                            <div class="date-range">
                                                <input type="datetime-local" id="advanced-date-from">
                                                <span>to</span>
                                                <input type="datetime-local" id="advanced-date-to">
                                            </div>
                                        </div>

                                        <div class="filter-item">
                                            <label>Time of Day</label>
                                            <div class="time-range">
                                                <input type="time" id="advanced-time-from">
                                                <span>to</span>
                                                <input type="time" id="advanced-time-to">
                                            </div>
                                        </div>

                                        <div class="filter-item">
                                            <label>Day of Week</label>
                                            <div class="day-checkboxes">
                                                <label><input type="checkbox" value="monday"> Mon</label>
                                                <label><input type="checkbox" value="tuesday"> Tue</label>
                                                <label><input type="checkbox" value="wednesday"> Wed</label>
                                                <label><input type="checkbox" value="thursday"> Thu</label>
                                                <label><input type="checkbox" value="friday"> Fri</label>
                                                <label><input type="checkbox" value="saturday"> Sat</label>
                                                <label><input type="checkbox" value="sunday"> Sun</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="condition-group">
                                <div class="condition-header">
                                    <h5>Location & Geography</h5>
                                </div>
                                <div class="location-conditions">
                                    <div class="filter-grid">
                                        <div class="filter-item">
                                            <label>Location</label>
                                            <input type="text" placeholder="City, state, country..." id="advanced-location">
                                        </div>

                                        <div class="filter-item">
                                            <label>Radius</label>
                                            <select id="advanced-radius">
                                                <option value="any">Anywhere</option>
                                                <option value="5">5 miles</option>
                                                <option value="25">25 miles</option>
                                                <option value="50">50 miles</option>
                                                <option value="100">100 miles</option>
                                                <option value="500">500 miles</option>
                                            </select>
                                        </div>

                                        <div class="filter-item">
                                            <label>Time Zone</label>
                                            <select id="advanced-timezone">
                                                <option value="any">Any Time Zone</option>
                                                <option value="EST">Eastern (EST)</option>
                                                <option value="CST">Central (CST)</option>
                                                <option value="MST">Mountain (MST)</option>
                                                <option value="PST">Pacific (PST)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="condition-group">
                                <div class="condition-header">
                                    <h5>Engagement & Popularity</h5>
                                </div>
                                <div class="engagement-conditions">
                                    <div class="filter-grid">
                                        <div class="filter-item">
                                            <label>Minimum Likes</label>
                                            <input type="number" placeholder="0" id="advanced-min-likes">
                                        </div>

                                        <div class="filter-item">
                                            <label>Minimum Comments</label>
                                            <input type="number" placeholder="0" id="advanced-min-comments">
                                        </div>

                                        <div class="filter-item">
                                            <label>Minimum Shares</label>
                                            <input type="number" placeholder="0" id="advanced-min-shares">
                                        </div>

                                        <div class="filter-item">
                                            <label>Verification Status</label>
                                            <select id="advanced-verification">
                                                <option value="any">Any User</option>
                                                <option value="verified">Verified Only</option>
                                                <option value="unverified">Unverified Only</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="query-preview">
                            <h5>Search Query Preview</h5>
                            <div class="query-display" id="query-display">
                                <code>Build your query using the filters above</code>
                            </div>
                        </div>

                        <div class="query-actions-bottom">
                            <button class="execute-query-btn" id="execute-advanced-search">
                                <i class="fas fa-search"></i>
                                Execute Search
                            </button>
                            <button class="clear-query-btn" id="clear-advanced-search">
                                <i class="fas fa-trash"></i>
                                Clear All
                            </button>
                        </div>
                    </div>

                    <!-- Saved Queries -->
                    <div class="saved-queries" id="saved-queries">
                        <div class="saved-queries-header">
                            <h4><i class="fas fa-bookmark"></i> Saved Queries</h4>
                        </div>
                        <div class="saved-queries-list" id="saved-queries-list">
                            <!-- Saved queries will be loaded here -->
                        </div>
                    </div>

                    <!-- Advanced Search Results -->
                    <div class="advanced-search-results" id="advanced-search-results" style="display: none;">
                        <div class="results-header">
                            <h4>Advanced Search Results</h4>
                            <div class="results-stats" id="advanced-results-stats">
                                <!-- Results statistics will appear here -->
                            </div>
                        </div>
                        <div class="results-container" id="advanced-results-container">
                            <!-- Advanced search results will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize all search interface functionality
     */
    initializeSearchInterfaces() {
        this.setupGlobalSearch();
        this.setupPeopleSearch();
        this.setupPostsSearch();
        this.setupDatingSearch();
        this.setupGroupsSearch();
        this.setupAdvancedSearch();
        this.setupTabSwitching();
        this.setupVoiceSearch();
        this.setupImageSearch();
    }

    /**
     * Setup search event listeners
     */
    setupSearchEventListeners() {
        // Main search input
        const mainSearchInput = document.getElementById('global-search-main');
        if (mainSearchInput) {
            let searchTimeout;
            mainSearchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleGlobalSearch(e.target.value);
                }, 300);
            });

            mainSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });

            mainSearchInput.addEventListener('focus', () => {
                this.showSearchSuggestions();
            });
        }

        // Voice search
        const voiceSearchBtn = document.getElementById('voice-search-btn');
        if (voiceSearchBtn) {
            voiceSearchBtn.addEventListener('click', () => this.startVoiceSearch());
        }

        // Camera search
        const cameraSearchBtn = document.getElementById('camera-search-btn');
        if (cameraSearchBtn) {
            cameraSearchBtn.addEventListener('click', () => this.startImageSearch());
        }
    }

    /**
     * Setup global search functionality
     */
    setupGlobalSearch() {
        // Filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.applyGlobalFilter(chip.dataset.filter);
            });
        });

        // Time filter
        const timeFilter = document.getElementById('global-time-filter');
        if (timeFilter) {
            timeFilter.addEventListener('change', (e) => {
                this.applyTimeFilter(e.target.value);
            });
        }
    }

    /**
     * Setup tab switching functionality
     */
    setupTabSwitching() {
        document.querySelectorAll('.search-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchToTab(tab.dataset.tab);
            });
        });
    }

    /**
     * Switch to a specific search tab
     */
    switchToTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.search-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.search-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-search-content`);
        });

        // Load tab-specific data if needed
        this.loadTabData(tabName);
    }

    /**
     * Load data for specific tab
     */
    loadTabData(tabName) {
        const currentQuery = document.getElementById('global-search-main')?.value;
        
        if (currentQuery && currentQuery.length >= 2) {
            switch (tabName) {
                case 'people':
                    this.performPeopleSearch(currentQuery);
                    break;
                case 'posts':
                    this.performPostsSearch(currentQuery);
                    break;
                case 'dating':
                    this.performDatingSearch(currentQuery);
                    break;
                case 'groups':
                    this.performGroupsSearch(currentQuery);
                    break;
                case 'global':
                    this.performGlobalSearch(currentQuery);
                    break;
            }
        }
    }

    /**
     * Handle global search input
     */
    handleGlobalSearch(query) {
        if (query.length < 2) {
            this.clearSearchResults();
            return;
        }

        this.showSearchSuggestions(query);
    }

    /**
     * Show search suggestions dropdown
     */
    showSearchSuggestions(query = '') {
        const dropdown = document.getElementById('search-suggestions-dropdown');
        if (!dropdown) return;

        if (query.length >= 2) {
            const suggestions = this.generateSearchSuggestions(query);
            dropdown.innerHTML = this.renderSearchSuggestions(suggestions);
            dropdown.classList.add('show');
        } else {
            dropdown.innerHTML = this.renderRecentSearches();
            dropdown.classList.add('show');
        }
    }

    /**
     * Generate search suggestions
     */
    generateSearchSuggestions(query) {
        const mockSuggestions = {
            people: [
                { name: 'John Photographer', avatar: 'https://source.unsplash.com/40x40/?portrait,man', type: 'verified' },
                { name: 'Sarah Travel Blogger', avatar: 'https://source.unsplash.com/40x40/?portrait,woman', type: 'popular' }
            ],
            hashtags: [
                { tag: `#${query}photography`, posts: '12.4K posts' },
                { tag: `#${query}travel`, posts: '8.9K posts' }
            ],
            groups: [
                { name: `${query} Enthusiasts`, members: '2.4K members', category: 'Photography' },
                { name: `${query} Community`, members: '1.8K members', category: 'General' }
            ]
        };

        return mockSuggestions;
    }

    /**
     * Render search suggestions
     */
    renderSearchSuggestions(suggestions) {
        return `
            <div class="suggestions-content">
                <div class="suggestions-section">
                    <h6>People</h6>
                    ${suggestions.people.map(person => `
                        <div class="suggestion-item" onclick="searchUI.selectSuggestion('person', '${person.name}')">
                            <img src="${person.avatar}" alt="${person.name}" class="suggestion-avatar">
                            <div class="suggestion-info">
                                <span class="suggestion-name">${person.name}</span>
                                <span class="suggestion-type ${person.type}">${person.type}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="suggestions-section">
                    <h6>Hashtags</h6>
                    ${suggestions.hashtags.map(hashtag => `
                        <div class="suggestion-item" onclick="searchUI.selectSuggestion('hashtag', '${hashtag.tag}')">
                            <div class="hashtag-icon">#</div>
                            <div class="suggestion-info">
                                <span class="suggestion-name">${hashtag.tag}</span>
                                <span class="suggestion-meta">${hashtag.posts}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render recent searches
     */
    renderRecentSearches() {
        const recentSearches = ['photography tips', 'travel destinations', 'healthy recipes', 'tech news'];
        
        return `
            <div class="suggestions-content">
                <div class="suggestions-section">
                    <h6>Recent Searches</h6>
                    ${recentSearches.map(search => `
                        <div class="suggestion-item" onclick="searchUI.selectSuggestion('recent', '${search}')">
                            <div class="recent-icon"><i class="fas fa-history"></i></div>
                            <div class="suggestion-info">
                                <span class="suggestion-name">${search}</span>
                            </div>
                            <button class="remove-recent" onclick="event.stopPropagation(); searchUI.removeRecentSearch('${search}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Select a search suggestion
     */
    selectSuggestion(type, value) {
        const searchInput = document.getElementById('global-search-main');
        if (searchInput) {
            searchInput.value = value;
            this.performSearch(value);
            this.hideSearchSuggestions();
        }
    }

    /**
     * Hide search suggestions
     */
    hideSearchSuggestions() {
        const dropdown = document.getElementById('search-suggestions-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }

    /**
     * Perform main search
     */
    async performSearch(query) {
        if (!query || query.length < 2) return;

        // Add to search history
        this.addToSearchHistory(query);

        // Update all tabs with results
        await Promise.all([
            this.performGlobalSearch(query),
            this.performPeopleSearch(query),
            this.performPostsSearch(query),
            this.performDatingSearch(query),
            this.performGroupsSearch(query)
        ]);

        // Update result counts
        this.updateResultCounts();
    }

    /**
     * Perform global search
     */
    async performGlobalSearch(query) {
        try {
            const results = await this.searchAll(query);
            this.searchResults.global = results;
            this.renderGlobalResults(results);
        } catch (error) {
            console.error('Global search failed:', error);
            this.app.showToast('Search failed', 'error');
        }
    }

    /**
     * Perform people search
     */
    async performPeopleSearch(query) {
        try {
            const results = await this.searchPeople(query);
            this.searchResults.people = results;
            this.renderPeopleResults(results);
        } catch (error) {
            console.error('People search failed:', error);
        }
    }

    /**
     * Perform posts search
     */
    async performPostsSearch(query) {
        try {
            const results = await this.searchPosts(query);
            this.searchResults.posts = results;
            this.renderPostsResults(results);
        } catch (error) {
            console.error('Posts search failed:', error);
        }
    }

    /**
     * Perform dating search
     */
    async performDatingSearch(query) {
        try {
            const results = await this.searchDatingProfiles(query);
            this.searchResults.dating = results;
            this.renderDatingResults(results);
        } catch (error) {
            console.error('Dating search failed:', error);
        }
    }

    /**
     * Perform groups search
     */
    async performGroupsSearch(query) {
        try {
            const results = await this.searchGroups(query);
            this.searchResults.groups = results;
            this.renderGroupsResults(results);
        } catch (error) {
            console.error('Groups search failed:', error);
        }
    }

    /**
     * Search all content types
     */
    async searchAll(query) {
        // Simulate API call with mock data
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    people: this.generateMockPeople(query, 3),
                    posts: this.generateMockPosts(query, 5),
                    groups: this.generateMockGroups(query, 3),
                    hashtags: this.generateMockHashtags(query)
                });
            }, 500);
        });
    }

    /**
     * Search people/users
     */
    async searchPeople(query) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.generateMockPeople(query, 20));
            }, 300);
        });
    }

    /**
     * Search posts
     */
    async searchPosts(query) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.generateMockPosts(query, 15));
            }, 400);
        });
    }

    /**
     * Search dating profiles
     */
    async searchDatingProfiles(query) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.generateMockDatingProfiles(query, 10));
            }, 350);
        });
    }

    /**
     * Search groups
     */
    async searchGroups(query) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.generateMockGroups(query, 12));
            }, 300);
        });
    }

    /**
     * Generate mock data methods
     */
    generateMockPeople(query, count) {
        const people = [];
        const names = ['Alex Johnson', 'Sarah Chen', 'Mike Rodriguez', 'Emily Davis', 'David Kim', 'Lisa Wang', 'Tom Wilson', 'Anna Brown'];
        
        for (let i = 0; i < count; i++) {
            people.push({
                id: `person-${i}`,
                name: names[i % names.length],
                username: `@${names[i % names.length].toLowerCase().replace(' ', '')}`,
                avatar: `https://source.unsplash.com/150x150/?portrait,person&sig=${i}`,
                bio: `Passionate about ${query} and connecting with like-minded people`,
                followers: Math.floor(Math.random() * 10000),
                verified: Math.random() > 0.7,
                online: Math.random() > 0.5,
                mutualFriends: Math.floor(Math.random() * 20)
            });
        }
        
        return people;
    }

    generateMockPosts(query, count) {
        const posts = [];
        const authors = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'];
        
        for (let i = 0; i < count; i++) {
            posts.push({
                id: `post-${i}`,
                author: {
                    name: authors[i % authors.length],
                    username: `@${authors[i % authors.length].toLowerCase().replace(' ', '')}`,
                    avatar: `https://source.unsplash.com/40x40/?portrait&sig=${i}`
                },
                content: `Amazing ${query} experience! Check out this incredible moment I captured.`,
                image: `https://source.unsplash.com/600x400/?${query}&sig=${i}`,
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                likes: Math.floor(Math.random() * 1000),
                comments: Math.floor(Math.random() * 100),
                shares: Math.floor(Math.random() * 50)
            });
        }
        
        return posts;
    }

    generateMockDatingProfiles(query, count) {
        const profiles = [];
        const names = ['Emma Thompson', 'Lucas Brown', 'Sophia Martinez', 'Noah Davis', 'Isabella Wilson'];
        
        for (let i = 0; i < count; i++) {
            profiles.push({
                id: `dating-${i}`,
                name: names[i % names.length],
                age: 22 + Math.floor(Math.random() * 13),
                distance: Math.floor(Math.random() * 50) + 1,
                photos: [`https://source.unsplash.com/400x600/?portrait&sig=${i}`],
                bio: `Love ${query} and looking for someone who shares my passion for adventure`,
                interests: [query, 'travel', 'music', 'food'].slice(0, 3),
                compatibility: Math.floor(Math.random() * 40) + 60
            });
        }
        
        return profiles;
    }

    generateMockGroups(query, count) {
        const groups = [];
        const categories = ['Photography', 'Travel', 'Technology', 'Fitness', 'Food', 'Music'];
        
        for (let i = 0; i < count; i++) {
            groups.push({
                id: `group-${i}`,
                name: `${query} ${categories[i % categories.length]} Community`,
                description: `A vibrant community for ${query} enthusiasts to share, learn, and connect`,
                category: categories[i % categories.length],
                members: Math.floor(Math.random() * 10000),
                image: `https://source.unsplash.com/300x200/?${query}&sig=${i}`,
                isPublic: true,
                verified: Math.random() > 0.6,
                activity: ['Very Active', 'Active', 'Moderate'][Math.floor(Math.random() * 3)]
            });
        }
        
        return groups;
    }

    generateMockHashtags(query) {
        return [
            { tag: `#${query}`, posts: '24.5K' },
            { tag: `#${query}tips`, posts: '12.3K' },
            { tag: `#${query}community`, posts: '8.7K' },
            { tag: `#love${query}`, posts: '6.2K' }
        ];
    }

    /**
     * Render results methods
     */
    renderGlobalResults(results) {
        // Render people preview
        const peopleResults = document.getElementById('global-people-results');
        if (peopleResults && results.people) {
            peopleResults.innerHTML = results.people.slice(0, 3).map(person => `
                <div class="person-preview-card">
                    <img src="${person.avatar}" alt="${person.name}" class="person-avatar">
                    <div class="person-info">
                        <h5>${person.name}</h5>
                        <p>${person.bio}</p>
                        <div class="person-stats">
                            <span>${person.followers} followers</span>
                            ${person.verified ? '<i class="fas fa-check-circle verified"></i>' : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Render posts preview
        const postsResults = document.getElementById('global-posts-results');
        if (postsResults && results.posts) {
            postsResults.innerHTML = results.posts.slice(0, 4).map(post => `
                <div class="post-preview-card">
                    <img src="${post.image}" alt="Post" class="post-thumbnail">
                    <div class="post-preview-info">
                        <div class="post-author">
                            <img src="${post.author.avatar}" alt="${post.author.name}" class="author-avatar">
                            <span>${post.author.name}</span>
                        </div>
                        <p class="post-content">${post.content.substring(0, 100)}...</p>
                        <div class="post-stats">
                            <span><i class="fas fa-heart"></i> ${post.likes}</span>
                            <span><i class="fas fa-comment"></i> ${post.comments}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Render groups preview
        const groupsResults = document.getElementById('global-groups-results');
        if (groupsResults && results.groups) {
            groupsResults.innerHTML = results.groups.slice(0, 3).map(group => `
                <div class="group-preview-card">
                    <img src="${group.image}" alt="${group.name}" class="group-image">
                    <div class="group-info">
                        <h5>${group.name}</h5>
                        <p>${group.description}</p>
                        <div class="group-stats">
                            <span>${this.formatNumber(group.members)} members</span>
                            <span class="activity-level">${group.activity}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Render hashtags
        const hashtagsResults = document.getElementById('global-hashtags-results');
        if (hashtagsResults && results.hashtags) {
            hashtagsResults.innerHTML = results.hashtags.map(hashtag => `
                <div class="hashtag-item" onclick="searchUI.performSearch('${hashtag.tag}')">
                    <span class="hashtag-name">${hashtag.tag}</span>
                    <span class="hashtag-count">${hashtag.posts}</span>
                </div>
            `).join('');
        }
    }

    /**
     * Add to search history
     */
    addToSearchHistory(query) {
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            if (this.searchHistory.length > 10) {
                this.searchHistory = this.searchHistory.slice(0, 10);
            }
            this.saveSearchHistory();
        }
    }

    /**
     * Load search history
     */
    loadSearchHistory() {
        try {
            const saved = localStorage.getItem('connecthub-search-history');
            if (saved) {
                this.searchHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load search history:', error);
            this.searchHistory = [];
        }
    }

    /**
     * Save search history
     */
    saveSearchHistory() {
        try {
            localStorage.setItem('connecthub-search-history', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Failed to save search history:', error);
        }
    }

    /**
     * Update result counts in tabs
     */
    updateResultCounts() {
        const counts = {
            global: this.getTotalResultCount(),
            people: this.searchResults.people?.length || 0,
            posts: this.searchResults.posts?.length || 0,
            dating: this.searchResults.dating?.length || 0,
            groups: this.searchResults.groups?.length || 0
        };

        Object.keys(counts).forEach(type => {
            const badge = document.getElementById(`${type}-results-count`);
            if (badge) {
                badge.textContent = this.formatNumber(counts[type]);
                badge.style.display = counts[type] > 0 ? 'inline' : 'none';
            }
        });
    }

    /**
     * Get total result count
     */
    getTotalResultCount() {
        const global = this.searchResults.global;
        if (!global) return 0;
        
        return (global.people?.length || 0) + 
               (global.posts?.length || 0) + 
               (global.groups?.length || 0);
    }

    /**
     * Format number for display
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * Setup voice search
     */
    setupVoiceSearch() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.speechRecognition.continuous = false;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = 'en-US';
            
            this.speechRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('global-search-main').value = transcript;
                this.performSearch(transcript);
            };
            
            this.speechRecognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.app.showToast('Voice search failed', 'error');
            };
        }
    }

    /**
     * Start voice search
     */
    startVoiceSearch() {
        if (this.speechRecognition) {
            this.speechRecognition.start();
            this.app.showToast('Listening...', 'info');
        } else {
            this.app.showToast('Voice search not supported', 'warning');
        }
    }

    /**
     * Setup image search
     */
    setupImageSearch() {
        // Image search functionality would be implemented here
        // This would typically involve computer vision APIs
    }

    /**
     * Start image search
     */
    startImageSearch() {
        // Create file input for image upload
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.processImageSearch(file);
            }
        };
        fileInput.click();
    }

    /**
     * Process image search
     */
    processImageSearch(file) {
        // This would integrate with image recognition APIs
        this.app.showToast('Image search feature coming soon', 'info');
    }

    /**
     * Clear search results
     */
    clearSearchResults() {
        this.searchResults = {
            global: [],
            people: [],
            posts: [],
            dating: [],
            groups: [],
            media: []
        };
        
        // Clear result displays
        this.clearResultDisplays();
        
        // Reset result counts
        this.updateResultCounts();
    }

    /**
     * Clear all result displays
     */
    clearResultDisplays() {
        const resultContainers = [
            'global-people-results',
            'global-posts-results',
            'global-groups-results',
            'global-hashtags-results',
            'people-results-grid',
            'posts-list-view',
            'posts-grid-view',
            'dating-results-grid',
            'groups-results-grid'
        ];

        resultContainers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
        });
    }

    /**
     * Setup people search functionality
     */
    setupPeopleSearch() {
        // People filter event listeners will be added here
        this.app.showToast('People search interface ready', 'info');
    }

    /**
     * Setup posts search functionality  
     */
    setupPostsSearch() {
        // Posts filter event listeners will be added here
        this.app.showToast('Posts search interface ready', 'info');
    }

    /**
     * Setup dating search functionality
     */
    setupDatingSearch() {
        // Dating filter event listeners will be added here
        this.app.showToast('Dating search interface ready', 'info');
    }

    /**
     * Setup groups search functionality
     */
    setupGroupsSearch() {
        // Groups filter event listeners will be added here
        this.app.showToast('Groups search interface ready', 'info');
    }

    /**
     * Setup advanced search functionality
     */
    setupAdvancedSearch() {
        // Advanced search event listeners will be added here
        this.app.showToast('Advanced search interface ready', 'info');
    }

    /**
     * Render people results
     */
    renderPeopleResults(results) {
        const container = document.getElementById('people-results-grid');
        if (!container) return;

        container.innerHTML = results.map(person => `
            <div class="people-result-card">
                <img src="${person.avatar}" alt="${person.name}" class="people-avatar">
                <div class="people-info">
                    <h4>${person.name}</h4>
                    <p class="people-username">${person.username}</p>
                    <p class="people-bio">${person.bio}</p>
                    <div class="people-stats">
                        <span>${this.formatNumber(person.followers)} followers</span>
                        ${person.verified ? '<i class="fas fa-check-circle verified"></i>' : ''}
                        ${person.online ? '<span class="online-status">Online</span>' : ''}
                    </div>
                    <div class="people-actions">
                        <button class="follow-btn">Follow</button>
                        <button class="message-btn">Message</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render posts results
     */
    renderPostsResults(results) {
        const listView = document.getElementById('posts-list-view');
        const gridView = document.getElementById('posts-grid-view');
        
        if (listView) {
            listView.innerHTML = results.map(post => `
                <div class="post-result-card">
                    <div class="post-author">
                        <img src="${post.author.avatar}" alt="${post.author.name}" class="author-avatar">
                        <div class="author-info">
                            <h5>${post.author.name}</h5>
                            <span>${post.author.username}</span>
                        </div>
                    </div>
                    <div class="post-content">
                        <p>${post.content}</p>
                        ${post.image ? `<img src="${post.image}" alt="Post content" class="post-image">` : ''}
                    </div>
                    <div class="post-stats">
                        <span><i class="fas fa-heart"></i> ${this.formatNumber(post.likes)}</span>
                        <span><i class="fas fa-comment"></i> ${this.formatNumber(post.comments)}</span>
                        <span><i class="fas fa-share"></i> ${this.formatNumber(post.shares)}</span>
                    </div>
                </div>
            `).join('');
        }

        if (gridView) {
            gridView.innerHTML = results.map(post => `
                <div class="post-grid-item">
                    <img src="${post.image || 'https://via.placeholder.com/300x300?text=No+Image'}" alt="Post" class="grid-post-image">
                    <div class="grid-post-overlay">
                        <div class="grid-post-stats">
                            <span><i class="fas fa-heart"></i> ${this.formatNumber(post.likes)}</span>
                            <span><i class="fas fa-comment"></i> ${this.formatNumber(post.comments)}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    /**
     * Render dating results
     */
    renderDatingResults(results) {
        const container = document.getElementById('dating-results-grid');
        if (!container) return;

        container.innerHTML = results.map(profile => `
            <div class="dating-result-card">
                <div class="dating-photo">
                    <img src="${profile.photos[0]}" alt="${profile.name}" class="dating-profile-image">
                    <div class="compatibility-badge">${profile.compatibility}% match</div>
                </div>
                <div class="dating-info">
                    <h4>${profile.name}, ${profile.age}</h4>
                    <p class="dating-distance">${profile.distance} miles away</p>
                    <p class="dating-bio">${profile.bio}</p>
                    <div class="dating-interests">
                        ${profile.interests.map(interest => `<span class="interest-badge">${interest}</span>`).join('')}
                    </div>
                    <div class="dating-actions">
                        <button class="pass-btn"><i class="fas fa-times"></i></button>
                        <button class="like-btn"><i class="fas fa-heart"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render groups results
     */
    renderGroupsResults(results) {
        const container = document.getElementById('groups-results-grid');
        if (!container) return;

        container.innerHTML = results.map(group => `
            <div class="group-result-card">
                <img src="${group.image}" alt="${group.name}" class="group-cover-image">
                <div class="group-info">
                    <h4>${group.name}</h4>
                    <p class="group-category">${group.category}</p>
                    <p class="group-description">${group.description}</p>
                    <div class="group-stats">
                        <span>${this.formatNumber(group.members)} members</span>
                        <span class="activity-indicator ${group.activity.toLowerCase().replace(' ', '-')}">${group.activity}</span>
                        ${group.verified ? '<i class="fas fa-check-circle verified"></i>' : ''}
                    </div>
                    <div class="group-actions">
                        <button class="join-group-btn">Join Group</button>
                        <button class="view-group-btn">View</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Apply global filter
     */
    applyGlobalFilter(filter) {
        this.activeFilters.global = filter;
        this.app.showToast(`Applied filter: ${filter}`, 'info');
        // Re-filter current results
        const currentQuery = document.getElementById('global-search-main')?.value;
        if (currentQuery) {
            this.performGlobalSearch(currentQuery);
        }
    }

    /**
     * Apply time filter
     */
    applyTimeFilter(timeRange) {
        this.activeFilters.time = timeRange;
        this.app.showToast(`Time filter: ${timeRange}`, 'info');
        // Re-filter current results
        const currentQuery = document.getElementById('global-search-main')?.value;
        if (currentQuery) {
            this.performGlobalSearch(currentQuery);
        }
    }

    /**
     * Remove from recent searches
     */
    removeRecentSearch(query) {
        const index = this.searchHistory.indexOf(query);
        if (index > -1) {
            this.searchHistory.splice(index, 1);
            this.saveSearchHistory();
            this.showSearchSuggestions();
        }
    }
}

// Initialize search UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make SearchUIComponents available globally
    window.SearchUIComponents = SearchUIComponents;
    
    // Initialize when app is available
    if (window.connectHub) {
        window.searchUI = new SearchUIComponents(window.connectHub);
    } else {
        // Wait for app to initialize
        document.addEventListener('app-initialized', () => {
            window.searchUI = new SearchUIComponents(window.connectHub);
        });
    }
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchUIComponents;
}
