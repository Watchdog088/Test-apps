/**
 * ConnectHub - Search Posts Dashboard
 * Comprehensive search posts functionality with advanced filtering and real-time results
 * Based on exact specifications from Search Posts Button Functionality.txt
 */

class SearchPostsDashboard {
    constructor(app) {
        this.app = app;
        this.searchResults = [];
        this.currentQuery = '';
        this.isSearching = false;
        this.debounceTimer = null;
        this.currentPage = 1;
        this.resultsPerPage = 20;
        this.hasMoreResults = true;
        this.viewMode = 'list'; // list, grid, compact
        this.sortBy = 'relevance'; // relevance, recent, popular, engaging
        this.searchHistory = [];
        this.savedSearches = [];
        this.voiceSearchActive = false;
        
        // Advanced filters
        this.filters = {
            contentTypes: ['photos', 'videos', 'text', 'polls', 'links'],
            dateRange: { from: null, to: null },
            authorType: 'all', // all, verified, friends, following
            engagementLevel: 'all', // all, high, medium, low
            hashtags: [],
            location: '',
            language: 'all'
        };
        
        // Trending data
        this.trendingHashtags = [
            '#photography', '#travel', '#technology', '#food', '#art', '#music', 
            '#fitness', '#nature', '#business', '#lifestyle', '#education', '#health'
        ];
        
        this.trendingTopics = [
            { topic: 'AI Technology', posts: '45.2K' },
            { topic: 'Travel Photography', posts: '32.1K' },
            { topic: 'Healthy Recipes', posts: '28.7K' },
            { topic: 'Digital Art', posts: '24.8K' },
            { topic: 'Startup Tips', posts: '19.3K' },
            { topic: 'Fitness Journey', posts: '16.9K' }
        ];
        
        this.init();
    }

    init() {
        this.createDashboardInterface();
        this.setupEventListeners();
        this.initializeVoiceSearch();
        this.loadSearchHistory();
        this.loadSavedSearches();
        this.setupRealTimeSearch();
    }

    createDashboardInterface() {
        // Create comprehensive search posts dashboard
        const dashboardHTML = `
            <div class="search-posts-dashboard" id="searchPostsDashboard">
                <!-- Dashboard Header -->
                <div class="search-dashboard-header">
                    <div class="search-header-content">
                        <button class="dashboard-back-btn" onclick="this.closeDashboard()" title="Back to Search">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <div class="search-header-title">
                            <h1><i class="fas fa-search"></i> Search Posts</h1>
                            <p>Search for posts, hashtags, topics across ConnectHub</p>
                        </div>
                        <div class="search-header-actions">
                            <button class="search-settings-btn" onclick="searchPostsDashboard.openSearchSettings()" title="Search Settings">
                                <i class="fas fa-cog"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Primary Search Interface -->
                <div class="search-primary-interface">
                    <div class="search-input-section">
                        <div class="search-input-container">
                            <div class="search-input-wrapper">
                                <i class="fas fa-search search-input-icon"></i>
                                <input type="text" 
                                       id="searchPostsInput" 
                                       class="search-posts-input" 
                                       placeholder="Search for posts, hashtags, topics..." 
                                       autocomplete="off"
                                       spellcheck="false">
                                <button class="voice-search-btn" 
                                        id="voiceSearchBtn" 
                                        title="Voice Search"
                                        onclick="searchPostsDashboard.toggleVoiceSearch()">
                                    <i class="fas fa-microphone"></i>
                                </button>
                                <button class="clear-search-btn" 
                                        id="clearSearchBtn" 
                                        title="Clear Search"
                                        onclick="searchPostsDashboard.clearSearch()"
                                        style="display: none;">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            
                            <!-- Search Suggestions Dropdown -->
                            <div class="search-suggestions-dropdown" id="searchSuggestions" style="display: none;">
                                <div class="suggestions-header">
                                    <span class="suggestions-title">Search Suggestions</span>
                                    <button class="close-suggestions-btn" onclick="searchPostsDashboard.hideSuggestions()">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                                <div class="suggestions-content" id="suggestionsContent">
                                    <!-- Dynamic suggestions will be populated here -->
                                </div>
                            </div>
                        </div>
                        
                        <!-- Quick Search Filters -->
                        <div class="quick-search-filters">
                            <button class="quick-filter-btn active" data-filter="recent" onclick="searchPostsDashboard.applyQuickFilter('recent')">
                                <i class="fas fa-clock"></i> Recent
                            </button>
                            <button class="quick-filter-btn" data-filter="popular" onclick="searchPostsDashboard.applyQuickFilter('popular')">
                                <i class="fas fa-fire"></i> Popular
                            </button>
                            <button class="quick-filter-btn" data-filter="media" onclick="searchPostsDashboard.applyQuickFilter('media')">
                                <i class="fas fa-images"></i> Media
                            </button>
                            <button class="quick-filter-btn" data-filter="text" onclick="searchPostsDashboard.applyQuickFilter('text')">
                                <i class="fas fa-align-left"></i> Text Only
                            </button>
                        </div>
                    </div>

                    <!-- Advanced Filters Section -->
                    <div class="advanced-filters-section" id="advancedFilters" style="display: none;">
                        <div class="filters-header">
                            <h3><i class="fas fa-filter"></i> Advanced Filters</h3>
                            <button class="toggle-filters-btn" onclick="searchPostsDashboard.toggleAdvancedFilters()">
                                <i class="fas fa-chevron-up"></i>
                            </button>
                        </div>
                        
                        <div class="filters-grid">
                            <!-- Content Type Filters -->
                            <div class="filter-group">
                                <label class="filter-label">Content Type</label>
                                <div class="filter-options">
                                    <label class="filter-checkbox">
                                        <input type="checkbox" value="photos" checked> 
                                        <span class="checkmark"></span>
                                        <i class="fas fa-camera"></i> Photos
                                    </label>
                                    <label class="filter-checkbox">
                                        <input type="checkbox" value="videos" checked> 
                                        <span class="checkmark"></span>
                                        <i class="fas fa-video"></i> Videos
                                    </label>
                                    <label class="filter-checkbox">
                                        <input type="checkbox" value="text" checked> 
                                        <span class="checkmark"></span>
                                        <i class="fas fa-font"></i> Text Posts
                                    </label>
                                    <label class="filter-checkbox">
                                        <input type="checkbox" value="polls" checked> 
                                        <span class="checkmark"></span>
                                        <i class="fas fa-poll"></i> Polls
                                    </label>
                                    <label class="filter-checkbox">
                                        <input type="checkbox" value="links" checked> 
                                        <span class="checkmark"></span>
                                        <i class="fas fa-link"></i> Links
                                    </label>
                                </div>
                            </div>
                            
                            <!-- Date Range Filter -->
                            <div class="filter-group">
                                <label class="filter-label">Date Range</label>
                                <div class="date-range-inputs">
                                    <input type="date" id="dateFrom" class="date-input" title="From Date">
                                    <span class="date-separator">to</span>
                                    <input type="date" id="dateTo" class="date-input" title="To Date">
                                </div>
                            </div>
                            
                            <!-- Author Type Filter -->
                            <div class="filter-group">
                                <label class="filter-label">Author Type</label>
                                <select id="authorTypeFilter" class="filter-select">
                                    <option value="all">All Users</option>
                                    <option value="verified">Verified Users</option>
                                    <option value="friends">Friends Only</option>
                                    <option value="following">Following</option>
                                </select>
                            </div>
                            
                            <!-- Engagement Level Filter -->
                            <div class="filter-group">
                                <label class="filter-label">Engagement Level</label>
                                <select id="engagementFilter" class="filter-select">
                                    <option value="all">All Levels</option>
                                    <option value="high">High Engagement</option>
                                    <option value="medium">Medium Engagement</option>
                                    <option value="low">Low Engagement</option>
                                </select>
                            </div>
                            
                            <!-- Location Filter -->
                            <div class="filter-group">
                                <label class="filter-label">Location</label>
                                <input type="text" id="locationFilter" class="filter-input" placeholder="Enter location...">
                            </div>
                            
                            <!-- Language Filter -->
                            <div class="filter-group">
                                <label class="filter-label">Language</label>
                                <select id="languageFilter" class="filter-select">
                                    <option value="all">All Languages</option>
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="it">Italian</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="filters-actions">
                            <button class="apply-filters-btn" onclick="searchPostsDashboard.applyAdvancedFilters()">
                                <i class="fas fa-check"></i> Apply Filters
                            </button>
                            <button class="clear-filters-btn" onclick="searchPostsDashboard.clearAllFilters()">
                                <i class="fas fa-times"></i> Clear All
                            </button>
                            <button class="save-search-btn" onclick="searchPostsDashboard.saveCurrentSearch()">
                                <i class="fas fa-bookmark"></i> Save Search
                            </button>
                        </div>
                    </div>

                    <!-- Trending Section -->
                    <div class="trending-section" id="trendingSection">
                        <div class="trending-content">
                            <div class="trending-hashtags">
                                <h4><i class="fas fa-hashtag"></i> Trending Hashtags</h4>
                                <div class="hashtag-list" id="trendingHashtagsList">
                                    <!-- Dynamic hashtags will be populated here -->
                                </div>
                            </div>
                            
                            <div class="trending-topics">
                                <h4><i class="fas fa-fire"></i> Trending Topics</h4>
                                <div class="topics-list" id="trendingTopicsList">
                                    <!-- Dynamic topics will be populated here -->
                                </div>
                            </div>
                        </div>
                        
                        <button class="toggle-advanced-filters-btn" onclick="searchPostsDashboard.toggleAdvancedFilters()">
                            <i class="fas fa-sliders-h"></i> Advanced Filters
                        </button>
                    </div>
                </div>

                <!-- Search Results Interface -->
                <div class="search-results-interface" id="searchResultsInterface" style="display: none;">
                    <!-- Results Header -->
                    <div class="results-header">
                        <div class="results-info">
                            <h3 class="results-title">Search Results</h3>
                            <p class="results-count" id="resultsCount">0 posts found</p>
                        </div>
                        
                        <div class="results-controls">
                            <!-- Sort Options -->
                            <div class="sort-dropdown">
                                <label for="sortSelect">Sort by:</label>
                                <select id="sortSelect" class="sort-select" onchange="searchPostsDashboard.changeSortOrder(this.value)">
                                    <option value="relevance">Most Relevant</option>
                                    <option value="recent">Most Recent</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="engaging">Most Engaging</option>
                                </select>
                            </div>
                            
                            <!-- View Mode Toggle -->
                            <div class="view-mode-toggle">
                                <button class="view-mode-btn active" data-view="list" onclick="searchPostsDashboard.changeViewMode('list')" title="List View">
                                    <i class="fas fa-list"></i>
                                </button>
                                <button class="view-mode-btn" data-view="grid" onclick="searchPostsDashboard.changeViewMode('grid')" title="Grid View">
                                    <i class="fas fa-th"></i>
                                </button>
                                <button class="view-mode-btn" data-view="compact" onclick="searchPostsDashboard.changeViewMode('compact')" title="Compact View">
                                    <i class="fas fa-bars"></i>
                                </button>
                            </div>
                            
                            <!-- Search within Results -->
                            <div class="search-within-results">
                                <input type="text" id="searchWithinInput" placeholder="Search within results..." class="search-within-input">
                                <button onclick="searchPostsDashboard.searchWithinResults()" class="search-within-btn">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Loading State -->
                    <div class="search-loading" id="searchLoading" style="display: none;">
                        <div class="loading-content">
                            <div class="loading-spinner"></div>
                            <p>Searching posts...</p>
                        </div>
                    </div>
                    
                    <!-- Results Container -->
                    <div class="results-container" id="resultsContainer">
                        <div class="results-list" id="resultsList">
                            <!-- Search results will be populated here -->
                        </div>
                        
                        <!-- Load More Button -->
                        <div class="load-more-section" id="loadMoreSection" style="display: none;">
                            <button class="load-more-btn" onclick="searchPostsDashboard.loadMoreResults()">
                                <i class="fas fa-chevron-down"></i> Load More Results
                            </button>
                        </div>
                    </div>
                    
                    <!-- Export Results -->
                    <div class="export-results-section">
                        <button class="export-btn" onclick="searchPostsDashboard.exportResults()">
                            <i class="fas fa-download"></i> Export Results
                        </button>
                        <button class="share-results-btn" onclick="searchPostsDashboard.shareResults()">
                            <i class="fas fa-share"></i> Share Results
                        </button>
                    </div>
                </div>

                <!-- Search History & Saved Searches -->
                <div class="search-history-section" id="searchHistorySection">
                    <div class="history-tabs">
                        <button class="history-tab active" data-tab="recent" onclick="searchPostsDashboard.switchHistoryTab('recent')">
                            <i class="fas fa-history"></i> Recent Searches
                        </button>
                        <button class="history-tab" data-tab="saved" onclick="searchPostsDashboard.switchHistoryTab('saved')">
                            <i class="fas fa-bookmark"></i> Saved Searches
                        </button>
                    </div>
                    
                    <div class="history-content">
                        <div class="history-list" id="recentSearchesList">
                            <!-- Recent searches will be populated here -->
                        </div>
                        <div class="history-list" id="savedSearchesList" style="display: none;">
                            <!-- Saved searches will be populated here -->
                        </div>
                    </div>
                </div>

                <!-- Voice Search Modal -->
                <div class="voice-search-modal" id="voiceSearchModal" style="display: none;">
                    <div class="voice-modal-content">
                        <div class="voice-animation">
                            <div class="voice-circle"></div>
                            <div class="voice-pulse"></div>
                        </div>
                        <h3>Listening...</h3>
                        <p>Say something to search for posts</p>
                        <button class="stop-voice-btn" onclick="searchPostsDashboard.stopVoiceSearch()">
                            <i class="fas fa-stop"></i> Stop
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Remove existing dashboard if present
        const existing = document.getElementById('searchPostsDashboard');
        if (existing) {
            existing.remove();
        }

        // Add dashboard to page
        document.body.insertAdjacentHTML('beforeend', dashboardHTML);
        
        // Initialize trending content
        this.populateTrendingContent();
        
        console.log('Search Posts Dashboard interface created');
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchPostsInput');
        if (searchInput) {
            // Real-time search with debounce
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
            
            searchInput.addEventListener('focus', () => {
                this.showSearchSuggestions();
            });
            
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch(e.target.value);
                } else if (e.key === 'Escape') {
                    this.hideSuggestions();
                }
            });
        }

        // Content type filter checkboxes
        document.querySelectorAll('#advancedFilters input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateContentTypeFilters();
            });
        });

        // Date range inputs
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');
        if (dateFrom) dateFrom.addEventListener('change', () => this.updateDateRangeFilter());
        if (dateTo) dateTo.addEventListener('change', () => this.updateDateRangeFilter());

        // Other filter inputs
        const filterInputs = ['authorTypeFilter', 'engagementFilter', 'locationFilter', 'languageFilter'];
        filterInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.updateFilters());
            }
        });

        console.log('Search Posts Dashboard event listeners setup complete');
    }

    setupRealTimeSearch() {
        // Setup real-time search functionality
        this.searchInput = document.getElementById('searchPostsInput');
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                
                // Clear previous debounce timer
                if (this.debounceTimer) {
                    clearTimeout(this.debounceTimer);
                }
                
                // Show/hide clear button
                const clearBtn = document.getElementById('clearSearchBtn');
                if (clearBtn) {
                    clearBtn.style.display = query ? 'block' : 'none';
                }
                
                if (query.length >= 2) {
                    // Debounced search
                    this.debounceTimer = setTimeout(() => {
                        this.performRealTimeSearch(query);
                    }, 300);
                } else if (query.length === 0) {
                    this.showTrendingContent();
                    this.hideSearchResults();
                }
            });
        }
    }

    initializeVoiceSearch() {
        // Initialize voice search if supported
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.handleVoiceSearchResult(transcript);
            };
            
            this.recognition.onerror = (event) => {
                this.handleVoiceSearchError(event.error);
            };
            
            this.recognition.onend = () => {
                this.stopVoiceSearch();
            };
            
            console.log('Voice search initialized');
        } else {
            // Hide voice search button if not supported
            const voiceBtn = document.getElementById('voiceSearchBtn');
            if (voiceBtn) {
                voiceBtn.style.display = 'none';
            }
        }
    }

    // Main search functionality
    performSearch(query) {
        if (!query || query.trim().length < 2) {
            this.app.showToast('Please enter at least 2 characters to search', 'warning');
            return;
        }

        this.currentQuery = query.trim();
        this.currentPage = 1;
        this.hasMoreResults = true;
        
        // Add to search history
        this.addToSearchHistory(this.currentQuery);
        
        // Show loading state
        this.showLoading();
        
        // Hide trending content and show results interface
        this.hideTrendingContent();
        this.showSearchResults();
        
        // Perform actual search
        this.executeSearch();
    }

    performRealTimeSearch(query) {
        // Generate real-time search suggestions and update results
        this.generateSearchSuggestions(query);
        
        if (query.length >= 3) {
            // Start real-time search after 3 characters
            this.currentQuery = query;
            this.currentPage = 1;
            this.executeSearch(true); // Real-time mode
        }
    }

    async executeSearch(realTime = false) {
        this.isSearching = true;
        
        try {
            // Simulate API call with realistic delay
            const results = await this.searchAPI(this.currentQuery, this.currentPage);
            
            if (this.currentPage === 1) {
                this.searchResults = results;
            } else {
                this.searchResults = [...this.searchResults, ...results];
            }
            
            this.renderSearchResults();
            this.updateResultsCount();
            
            if (!realTime) {
                this.hideLoading();
            }
            
        } catch (error) {
            console.error('Search error:', error);
            this.app.showToast('Search failed. Please try again.', 'error');
            this.hideLoading();
        }
        
        this.isSearching = false;
    }

    async searchAPI(query, page = 1) {
        // Simulate API call with mock data
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockResults = this.generateMockResults(query, page);
                resolve(mockResults);
            }, realTime ? 200 : 800);
        });
    }

    generateMockResults(query, page) {
        const resultsPerPage = this.resultsPerPage;
        const startIndex = (page - 1) * resultsPerPage;
        const totalResults = Math.min(150, Math.floor(Math.random() * 200) + 50); // Random 50-250 results
        
        const results = [];
        const authors = [
            { name: 'Sarah Chen', username: '@sarahchen', avatar: 'SC', verified: true, followerCount: '45.2K' },
            { name: 'Mike Rodriguez', username: '@mikerodriguez', avatar: 'MR', verified: false, followerCount: '12.8K' },
            { name: 'Emily Davis', username: '@emilydavis', avatar: 'ED', verified: true, followerCount: '89.1K' },
            { name: 'Alex Thompson', username: '@alexthompson', avatar: 'AT', verified: false, followerCount: '5.4K' },
            { name: 'Lisa Wang', username: '@lisawang', avatar: 'LW', verified: true, followerCount: '156.7K' },
            { name: 'David Kim', username: '@davidkim', avatar: 'DK', verified: false, followerCount: '23.9K' }
        ];

        const contentTypes = ['text', 'photos', 'videos', 'polls', 'links'];
        const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA'];

        for (let i = 0; i < Math.min(resultsPerPage, totalResults - startIndex); i++) {
            const author = authors[Math.floor(Math.random() * authors.length)];
            const contentType = this.getRandomContentType();
            const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
            
            const post = {
                id: `post_${Date.now()}_${i}_${page}`,
                author: author,
                contentType: contentType,
                timestamp: timestamp,
                location: locations[Math.floor(Math.random() * locations.length)],
                content: this.generatePostContent(query, contentType),
                media: this.generateMediaContent(contentType, i),
                hashtags: this.generateHashtags(query),
                likes: Math.floor(Math.random() * 5000) + 10,
                comments: Math.floor(Math.random() * 500) + 5,
                shares: Math.floor(Math.random() * 200) + 1,
                views: Math.floor(Math.random() * 10000) + 100,
                engagement: Math.random() * 0.15 + 0.01,
                isLiked: Math.random() > 0.7,
                isBookmarked: Math.random() > 0.8
            };

            // Apply current filters
            if (this.passesFilters(post)) {
                results.push(post);
            }
        }

        // Sort results
        this.sortResults(results);
        
        return results;
    }

    getRandomContentType() {
        const enabledTypes = this.filters.contentTypes;
        return enabledTypes[Math.floor(Math.random() * enabledTypes.length)];
    }

    generatePostContent(query, contentType) {
        const templates = {
            text: [
                `Just discovered something amazing about ${query}! This completely changed my perspective. #${query.replace(/\s+/g, '')}`,
                `Deep thoughts on ${query}: Why it matters more than you think. Thread 🧵`,
                `My experience with ${query} has been incredible. Here's what I learned...`,
                `Hot take: ${query} is the future and here's why everyone should pay attention`,
                `${query} tips that saved me hours of work. Hope this helps someone! 💡`
            ],
            photos: [
                `Captured this beautiful ${query} moment! The lighting was absolutely perfect 📸 #photography #${query.replace(/\s+/g, '')}`,
                `New ${query} photo series I've been working on. What do you think? 📷`,
                `Behind the scenes of my ${query} photoshoot. The story behind this image is incredible`,
                `Found this hidden ${query} spot during my morning walk. Nature never ceases to amaze me 🌟`
            ],
            videos: [
                `Watch my ${query} journey unfold in this 3-minute video! Emotional rollercoaster 🎬 #${query.replace(/\s+/g, '')}`,
                `Tutorial: How to master ${query} in 30 days. Step-by-step guide! ▶️`,
                `Time-lapse of my ${query} project from start to finish. 72 hours in 2 minutes`,
                `Live reaction to experiencing ${query} for the first time. Mind blown! 😱`
            ],
            polls: [
                `Quick poll about ${query}: What's your take on this? Vote below! 🗳️ #${query.replace(/\s+/g, '')}`,
                `Curious about everyone's opinion on ${query}. Help me settle a debate!`,
                `${query} poll: Which option resonates with you most? Results might surprise you`,
                `Community question: How has ${query} impacted your daily life? Share your thoughts!`
            ],
            links: [
                `Essential ${query} resources that changed my life. Bookmark this! 🔗 #${query.replace(/\s+/g, '')}`,
                `Comprehensive guide to ${query} - everything you need to know in one place`,
                `The science behind ${query} explained by leading experts. Mind-blowing research!`,
                `${query} industry report 2024: trends, statistics, and future predictions 📊`
            ]
        };

        const typeTemplates = templates[contentType] || templates.text;
        const content = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
        
        // Highlight search terms
        return this.highlightSearchTerms(content, query);
    }

    generateMediaContent(contentType, index) {
        const searchTerm = this.currentQuery.toLowerCase().replace(/\s+/g, '');
        
        switch (contentType) {
            case 'photos':
                return {
                    type: 'image',
                    url: `https://source.unsplash.com/800x600/?${searchTerm}&sig=${index}`,
                    thumbnail: `https://source.unsplash.com/400x300/?${searchTerm}&sig=${index}`,
                    alt: `${this.currentQuery} image`,
                    resolution: '1920x1080',
                    size: `${Math.floor(Math.random() * 2000) + 500}KB`
                };
            case 'videos':
                return {
                    type: 'video',
                    thumbnail: `https://source.unsplash.com/800x450/?video,${searchTerm}&sig=${index}`,
                    duration: Math.floor(Math.random() * 300) + 30,
                    views: Math.floor(Math.random() * 50000) + 1000,
                    quality: '1080p',
                    size: `${Math.floor(Math.random() * 50) + 10}MB`
                };
            case 'links':
                const domains = ['medium.com', 'youtube.com', 'github.com', 'dev.to', 'blog.com'];
                return {
                    type: 'link',
                    url: `https://${domains[index % domains.length]}/${searchTerm}`,
                    title: `Ultimate guide to ${this.currentQuery}`,
                    description: `Comprehensive resource about ${this.currentQuery} with practical examples and expert insights.`,
                    domain: domains[index % domains.length],
                    favicon: `https://www.google.com/s2/favicons?domain=${domains[index % domains.length]}&sz=32`
                };
            default:
                return null;
        }
    }

    generateHashtags(query) {
        const baseHashtags = [`#${query.replace(/\s+/g, '').toLowerCase()}`];
        const relatedTags = ['#trending', '#viral', '#amazing', '#inspiration', '#community', '#discover'];
        const numAdditional = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numAdditional; i++) {
            const randomTag = relatedTags[Math.floor(Math.random() * relatedTags.length)];
            if (!baseHashtags.includes(randomTag)) {
                baseHashtags.push(randomTag);
            }
        }
        
        return baseHashtags;
    }

    highlightSearchTerms(content, query) {
        if (!query) return content;
        
        const terms = query.toLowerCase().split(' ').filter(term => term.length > 2);
        let highlightedContent = content;
        
        terms.forEach(term => {
            const regex = new RegExp(`(${this.escapeRegExp(term)})`, 'gi');
            highlightedContent = highlightedContent.replace(regex, '<mark class="search-highlight">$1</mark>');
        });
        
        return highlightedContent;
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    passesFilters(post) {
        // Content type filter
        if (!this.filters.contentTypes.includes(post.contentType)) {
            return false;
        }

        // Date range filter
        if (this.filters.dateRange.from && post.timestamp < new Date(this.filters.dateRange.from)) {
            return false;
        }
        if (this.filters.dateRange.to && post.timestamp > new Date(this.filters.dateRange.to)) {
            return false;
        }

        // Author type filter
        if (this.filters.authorType === 'verified' && !post.author.verified) {
            return false;
        }

        // Engagement level filter
        if (this.filters.engagementLevel !== 'all') {
            const threshold = this.filters.engagementLevel === 'high' ? 0.1 : 
                            this.filters.engagementLevel === 'medium' ? 0.05 : 0.02;
            if (post.engagement < threshold) {
                return false;
            }
        }

        return true;
    }

    sortResults(results) {
        const sortFunctions = {
            relevance: (a, b) => b.engagement - a.engagement,
            recent: (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
            popular: (a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares),
            engaging: (a, b) => b.engagement - a.engagement
        };

        const sortFn = sortFunctions[this.sortBy] || sortFunctions.relevance;
        results.sort(sortFn);
    }

    renderSearchResults() {
        const resultsList = document.getElementById('resultsList');
        if (!resultsList) return;

        if (this.searchResults.length === 0) {
            this.showEmptyState();
            return;
        }

        const html = this.searchResults.map(post => this.renderPostCard(post)).join('');
        
        if (this.currentPage === 1) {
            resultsList.innerHTML = html;
        } else {
            resultsList.insertAdjacentHTML('beforeend', html);
        }

        this.updateLoadMoreButton();
    }

    renderPostCard(post) {
        const timeAgo = this.getTimeAgo(post.timestamp);
        
        if (this.viewMode === 'grid') {
            return this.renderGridCard(post, timeAgo);
        } else if (this.viewMode === 'compact') {
            return this.renderCompactCard(post, timeAgo);
        } else {
            return this.renderListCard(post, timeAgo);
        }
    }

    renderListCard(post, timeAgo) {
        return `
            <div class="post-result-card list-view" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-author">
                        <div class="author-avatar">${post.author.avatar}</div>
                        <div class="author-info">
                            <h5 class="author-name">
                                ${post.author.name}
                                ${post.author.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                            </h5>
                            <span class="author-username">${post.author.username}</span>
                            <span class="author-followers">${post.author.followerCount} followers</span>
                        </div>
                    </div>
                    <div class="post-meta">
                        <span class="post-time">${timeAgo}</span>
                        <span class="post-location"><i class="fas fa-map-marker-alt"></i> ${post.location}</span>
                        <span class="content-type-badge ${post.contentType}">
                            ${this.getContentTypeIcon(post.contentType)}
                        </span>
                    </div>
                </div>

                <div class="post-content">
                    <div class="post-text">${post.content}</div>
                    ${this.renderPostMedia(post.media)}
                    ${this.renderHashtags(post.hashtags)}
                </div>

                <div class="post-engagement">
                    <div class="engagement-stats">
                        <span class="stat-item">
                            <i class="fas fa-heart ${post.isLiked ? 'liked' : ''}"></i>
                            <span class="stat-count">${this.formatNumber(post.likes)}</span>
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-comment"></i>
                            <span class="stat-count">${this.formatNumber(post.comments)}</span>
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-share"></i>
                            <span class="stat-count">${this.formatNumber(post.shares)}</span>
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-eye"></i>
                            <span class="stat-count">${this.formatNumber(post.views)}</span>
                        </span>
                    </div>

                    <div class="post-actions">
                        <button class="post-action-btn like-btn ${post.isLiked ? 'active' : ''}" 
                                onclick="searchPostsDashboard.toggleLike('${post.id}')"
                                title="Like post">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="post-action-btn comment-btn" 
                                onclick="searchPostsDashboard.showComments('${post.id}')"
                                title="View comments">
                            <i class="fas fa-comment"></i>
                        </button>
                        <button class="post-action-btn share-btn" 
                                onclick="searchPostsDashboard.sharePost('${post.id}')"
                                title="Share post">
                            <i class="fas fa-share"></i>
                        </button>
                        <button class="post-action-btn bookmark-btn ${post.isBookmarked ? 'active' : ''}" 
                                onclick="searchPostsDashboard.toggleBookmark('${post.id}')"
                                title="Bookmark post">
                            <i class="fas fa-bookmark"></i>
                        </button>
                        <button class="post-action-btn expand-btn" 
                                onclick="searchPostsDashboard.expandPost('${post.id}')"
                                title="View full post">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderGridCard(post, timeAgo) {
        return `
            <div class="post-result-card grid-view" data-post-id="${post.id}">
                <div class="grid-media">
                    ${this.renderGridMedia(post)}
                </div>
                <div class="grid-overlay">
                    <div class="grid-author">
                        <div class="author-avatar small">${post.author.avatar}</div>
                        <span class="author-name">${post.author.name}</span>
                    </div>
                    <div class="grid-stats">
                        <span><i class="fas fa-heart"></i> ${this.formatNumber(post.likes)}</span>
                        <span><i class="fas fa-comment"></i> ${this.formatNumber(post.comments)}</span>
                    </div>
                </div>
                <div class="grid-actions">
                    <button class="grid-action-btn like-btn ${post.isLiked ? 'active' : ''}" 
                            onclick="searchPostsDashboard.toggleLike('${post.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="grid-action-btn expand-btn" 
                            onclick="searchPostsDashboard.expandPost('${post.id}')">
                        <i class="fas fa-expand"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderCompactCard(post, timeAgo) {
        return `
            <div class="post-result-card compact-view" data-post-id="${post.id}">
                <div class="compact-left">
                    <div class="author-avatar tiny">${post.author.avatar}</div>
                    <div class="compact-content">
                        <div class="compact-header">
                            <span class="author-name">${post.author.name}</span>
                            <span class="post-time">${timeAgo}</span>
                        </div>
                        <div class="compact-text">${post.content.substring(0, 120)}${post.content.length > 120 ? '...' : ''}</div>
                    </div>
                </div>
                <div class="compact-right">
                    <div class="compact-stats">
                        <span><i class="fas fa-heart"></i> ${this.formatNumber(post.likes)}</span>
                        <span><i class="fas fa-comment"></i> ${this.formatNumber(post.comments)}</span>
                    </div>
                    <button class="compact-expand" onclick="searchPostsDashboard.expandPost('${post.id}')">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderPostMedia(media) {
        if (!media) return '';

        switch (media.type) {
            case 'image':
                return `
                    <div class="post-media image-media">
                        <img src="${media.url}" alt="${media.alt}" class="post-image" loading="lazy"
                             onclick="searchPostsDashboard.openImageModal('${media.url}', '${media.alt}')">
                        <div class="media-info">
                            <span class="media-resolution">${media.resolution}</span>
                            <span class="media-size">${media.size}</span>
                        </div>
                    </div>
                `;
            case 'video':
                return `
                    <div class="post-media video-media">
                        <div class="video-thumbnail" style="background-image: url('${media.thumbnail}')"
                             onclick="searchPostsDashboard.playVideo('${media.thumbnail}')">
                            <div class="video-play-button">
                                <i class="fas fa-play"></i>
                            </div>
                            <div class="video-duration">${this.formatDuration(media.duration)}</div>
                            <div class="video-quality">${media.quality}</div>
                        </div>
                        <div class="video-stats">
                            <span><i class="fas fa-eye"></i> ${this.formatNumber(media.views)} views</span>
                            <span><i class="fas fa-hdd"></i> ${media.size}</span>
                        </div>
                    </div>
                `;
            case 'link':
                return `
                    <div class="post-media link-media" onclick="window.open('${media.url}', '_blank')">
                        <div class="link-preview">
                            <img src="${media.favicon}" alt="Favicon" class="link-favicon">
                            <div class="link-info">
                                <h6 class="link-title">${media.title}</h6>
                                <p class="link-description">${media.description}</p>
                                <span class="link-domain">${media.domain}</span>
                            </div>
                            <div class="link-arrow">
                                <i class="fas fa-external-link-alt"></i>
                            </div>
                        </div>
                    </div>
                `;
            default:
                return '';
        }
    }

    renderGridMedia(post) {
        if (post.media) {
            switch (post.media.type) {
                case 'image':
                    return `<img src="${post.media.thumbnail || post.media.url}" alt="${post.media.alt}" class="grid-image">`;
                case 'video':
                    return `
                        <div class="grid-video" style="background-image: url('${post.media.thumbnail}')">
                            <div class="grid-video-play"><i class="fas fa-play"></i></div>
                            <div class="grid-video-duration">${this.formatDuration(post.media.duration)}</div>
                        </div>
                    `;
                default:
                    return `<div class="grid-text-placeholder"><i class="fas fa-align-left"></i></div>`;
            }
        }
        return `<div class="grid-text-placeholder"><i class="fas fa-align-left"></i></div>`;
    }

    renderHashtags(hashtags) {
        if (!hashtags || hashtags.length === 0) return '';
        
        return `
            <div class="post-hashtags">
                ${hashtags.map(tag => `
                    <span class="hashtag" onclick="searchPostsDashboard.searchHashtag('${tag}')">
                        ${tag}
                    </span>
                `).join('')}
            </div>
        `;
    }

    getContentTypeIcon(type) {
        const icons = {
            text: '<i class="fas fa-align-left"></i>',
            photos: '<i class="fas fa-camera"></i>',
            videos: '<i class="fas fa-video"></i>',
            polls: '<i class="fas fa-poll"></i>',
            links: '<i class="fas fa-link"></i>'
        };
        return icons[type] || icons.text;
    }

    // Interaction methods
    toggleLike(postId) {
        const post = this.searchResults.find(p => p.id === postId);
        if (post) {
            post.isLiked = !post.isLiked;
            post.likes += post.isLiked ? 1 : -1;
            
            // Update UI
            const postCard = document.querySelector(`[data-post-id="${postId}"]`);
            const likeBtn = postCard.querySelector('.like-btn');
            const likeCount = postCard.querySelector('.engagement-stats .stat-count');
            
            likeBtn.classList.toggle('active', post.isLiked);
            likeBtn.querySelector('i').classList.toggle('liked', post.isLiked);
            if (likeCount) likeCount.textContent = this.formatNumber(post.likes);
            
            this.app.showToast(post.isLiked ? 'Post liked!' : 'Post unliked', 'success');
        }
    }

    toggleBookmark(postId) {
        const post = this.searchResults.find(p => p.id === postId);
        if (post) {
            post.isBookmarked = !post.isBookmarked;
            
            const postCard = document.querySelector(`[data-post-id="${postId}"]`);
            const bookmarkBtn = postCard.querySelector('.bookmark-btn');
            bookmarkBtn.classList.toggle('active', post.isBookmarked);
            
            this.app.showToast(post.isBookmarked ? 'Post bookmarked!' : 'Bookmark removed', 'success');
        }
    }

    showComments(postId) {
        const post = this.searchResults.find(p => p.id === postId);
        if (post) {
            this.app.showToast(`Showing ${post.comments} comments for this post`, 'info');
            // Comments modal would open here
        }
    }

    sharePost(postId) {
        const post = this.searchResults.find(p => p.id === postId);
        if (post) {
            this.app.showToast('Share options opened', 'info');
            // Share modal would open here
        }
    }

    expandPost(postId) {
        const post = this.searchResults.find(p => p.id === postId);
        if (post) {
            this.app.showToast('Opening full post view', 'info');
            // Full post modal would open here
        }
    }

    searchHashtag(hashtag) {
        const searchInput = document.getElementById('searchPostsInput');
        if (searchInput) {
            searchInput.value = hashtag;
            this.performSearch(hashtag);
        }
    }

    // Voice search methods
    toggleVoiceSearch() {
        if (this.voiceSearchActive) {
            this.stopVoiceSearch();
        } else {
            this.startVoiceSearch();
        }
    }

    startVoiceSearch() {
        if (!this.recognition) {
            this.app.showToast('Voice search not supported in this browser', 'error');
            return;
        }

        this.voiceSearchActive = true;
        const voiceModal = document.getElementById('voiceSearchModal');
        const voiceBtn = document.getElementById('voiceSearchBtn');
        
        if (voiceModal) voiceModal.style.display = 'flex';
        if (voiceBtn) voiceBtn.classList.add('active');
        
        try {
            this.recognition.start();
            this.app.showToast('Voice search started. Say something!', 'info');
        } catch (error) {
            this.handleVoiceSearchError(error.message);
        }
    }

    stopVoiceSearch() {
        if (this.recognition) {
            this.recognition.stop();
        }
        
        this.voiceSearchActive = false;
        const voiceModal = document.getElementById('voiceSearchModal');
        const voiceBtn = document.getElementById('voiceSearchBtn');
        
        if (voiceModal) voiceModal.style.display = 'none';
        if (voiceBtn) voiceBtn.classList.remove('active');
    }

    handleVoiceSearchResult(transcript) {
        const searchInput = document.getElementById('searchPostsInput');
        if (searchInput) {
            searchInput.value = transcript;
            this.performSearch(transcript);
        }
        
        this.app.showToast(`Voice search: "${transcript}"`, 'success');
        this.stopVoiceSearch();
    }

    handleVoiceSearchError(error) {
        console.error('Voice search error:', error);
        this.app.showToast(`Voice search error: ${error}`, 'error');
        this.stopVoiceSearch();
    }

    // Filter methods
    applyQuickFilter(filterType) {
        // Update active quick filter button
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filterType);
        });

        switch (filterType) {
            case 'recent':
                this.sortBy = 'recent';
                break;
            case 'popular':
                this.sortBy = 'popular';
                break;
            case 'media':
                this.filters.contentTypes = ['photos', 'videos'];
                break;
            case 'text':
                this.filters.contentTypes = ['text'];
                break;
        }

        if (this.currentQuery) {
            this.executeSearch();
        }
    }

    toggleAdvancedFilters() {
        const advancedFilters = document.getElementById('advancedFilters');
        const isVisible = advancedFilters.style.display !== 'none';
        
        advancedFilters.style.display = isVisible ? 'none' : 'block';
        
        const toggleBtn = document.querySelector('.toggle-filters-btn');
        const advancedBtn = document.querySelector('.toggle-advanced-filters-btn');
        
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            icon.className = isVisible ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
        }
        
        if (advancedBtn) {
            const btnIcon = advancedBtn.querySelector('i');
            const btnText = isVisible ? ' Advanced Filters' : ' Hide Filters';
            advancedBtn.innerHTML = btnIcon.outerHTML + btnText;
        }
    }

    applyAdvancedFilters() {
        this.updateAllFilters();
        if (this.currentQuery) {
            this.executeSearch();
        }
        this.app.showToast('Advanced filters applied', 'success');
    }

    clearAllFilters() {
        // Reset filters to defaults
        this.filters = {
            contentTypes: ['photos', 'videos', 'text', 'polls', 'links'],
            dateRange: { from: null, to: null },
            authorType: 'all',
            engagementLevel: 'all',
            hashtags: [],
            location: '',
            language: 'all'
        };
        
        // Reset UI elements
        document.querySelectorAll('#advancedFilters input[type="checkbox"]').forEach(cb => {
            cb.checked = true;
        });
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');
        if (dateFrom) dateFrom.value = '';
        if (dateTo) dateTo.value = '';
        
        const authorType = document.getElementById('authorTypeFilter');
        const engagement = document.getElementById('engagementFilter');
        const location = document.getElementById('locationFilter');
        const language = document.getElementById('languageFilter');
        
        if (authorType) authorType.value = 'all';
        if (engagement) engagement.value = 'all';
        if (location) location.value = '';
        if (language) language.value = 'all';
        
        if (this.currentQuery) {
            this.executeSearch();
        }
        this.app.showToast('All filters cleared', 'info');
    }

    updateContentTypeFilters() {
        const checkboxes = document.querySelectorAll('#advancedFilters input[type="checkbox"]');
        this.filters.contentTypes = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
    }

    updateDateRangeFilter() {
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');
        this.filters.dateRange.from = dateFrom ? dateFrom.value : null;
        this.filters.dateRange.to = dateTo ? dateTo.value : null;
    }

    updateFilters() {
        this.updateAllFilters();
    }

    updateAllFilters() {
        this.updateContentTypeFilters();
        this.updateDateRangeFilter();
        
        const authorType = document.getElementById('authorTypeFilter');
        const engagement = document.getElementById('engagementFilter');
        const location = document.getElementById('locationFilter');
        const language = document.getElementById('languageFilter');
        
        this.filters.authorType = authorType ? authorType.value : 'all';
        this.filters.engagementLevel = engagement ? engagement.value : 'all';
        this.filters.location = location ? location.value : '';
        this.filters.language = language ? language.value : 'all';
    }

    // View mode methods
    changeViewMode(mode) {
        this.viewMode = mode;
        
        // Update active button
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === mode);
        });
        
        // Re-render results with new view mode
        this.renderSearchResults();
        this.app.showToast(`Switched to ${mode} view`, 'info');
    }

    changeSortOrder(sortBy) {
        this.sortBy = sortBy;
        this.sortResults(this.searchResults);
        this.renderSearchResults();
        this.app.showToast(`Results sorted by ${sortBy}`, 'info');
    }

    // Search suggestions and history
    generateSearchSuggestions(query) {
        const suggestions = [];
        
        // Add trending hashtags that match
        this.trendingHashtags.forEach(tag => {
            if (tag.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push({
                    type: 'hashtag',
                    text: tag,
                    icon: 'fas fa-hashtag'
                });
            }
        });
        
        // Add trending topics that match
        this.trendingTopics.forEach(topic => {
            if (topic.topic.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push({
                    type: 'topic',
                    text: topic.topic,
                    icon: 'fas fa-fire',
                    count: topic.posts
                });
            }
        });
        
        // Add recent searches
        this.searchHistory.forEach(search => {
            if (search.toLowerCase().includes(query.toLowerCase()) && search !== query) {
                suggestions.push({
                    type: 'history',
                    text: search,
                    icon: 'fas fa-history'
                });
            }
        });
        
        this.displaySuggestions(suggestions.slice(0, 8));
    }

    displaySuggestions(suggestions) {
        const suggestionsContent = document.getElementById('suggestionsContent');
        const suggestionsDropdown = document.getElementById('searchSuggestions');
        
        if (!suggestionsContent || suggestions.length === 0) {
            if (suggestionsDropdown) suggestionsDropdown.style.display = 'none';
            return;
        }
        
        const html = suggestions.map(suggestion => `
            <div class="suggestion-item" onclick="searchPostsDashboard.selectSuggestion('${suggestion.text}')">
                <i class="${suggestion.icon}"></i>
                <span class="suggestion-text">${suggestion.text}</span>
                ${suggestion.count ? `<span class="suggestion-count">${suggestion.count}</span>` : ''}
            </div>
        `).join('');
        
        suggestionsContent.innerHTML = html;
        suggestionsDropdown.style.display = 'block';
    }

    selectSuggestion(text) {
        const searchInput = document.getElementById('searchPostsInput');
        if (searchInput) {
            searchInput.value = text;
            this.performSearch(text);
        }
        this.hideSuggestions();
    }

    showSearchSuggestions() {
        const query = document.getElementById('searchPostsInput')?.value;
        if (query && query.length >= 2) {
            this.generateSearchSuggestions(query);
        }
    }

    hideSuggestions() {
        const suggestionsDropdown = document.getElementById('searchSuggestions');
        if (suggestionsDropdown) {
            suggestionsDropdown.style.display = 'none';
        }
    }

    addToSearchHistory(query) {
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            this.searchHistory = this.searchHistory.slice(0, 10); // Keep last 10 searches
            this.saveSearchHistory();
        }
    }

    loadSearchHistory() {
        try {
            const saved = localStorage.getItem('connecthub_search_history');
            if (saved) {
                this.searchHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load search history:', error);
        }
    }

    saveSearchHistory() {
        try {
            localStorage.setItem('connecthub_search_history', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Failed to save search history:', error);
        }
    }

    loadSavedSearches() {
        try {
            const saved = localStorage.getItem('connecthub_saved_searches');
            if (saved) {
                this.savedSearches = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load saved searches:', error);
        }
    }

    saveCurrentSearch() {
        if (!this.currentQuery) {
            this.app.showToast('No search to save', 'warning');
            return;
        }
        
        const searchData = {
            query: this.currentQuery,
            filters: { ...this.filters },
            sortBy: this.sortBy,
            timestamp: new Date().toISOString()
        };
        
        const existingIndex = this.savedSearches.findIndex(s => s.query === this.currentQuery);
        if (existingIndex >= 0) {
            this.savedSearches[existingIndex] = searchData;
        } else {
            this.savedSearches.unshift(searchData);
            this.savedSearches = this.savedSearches.slice(0, 5); // Keep last 5 saved searches
        }
        
        try {
            localStorage.setItem('connecthub_saved_searches', JSON.stringify(this.savedSearches));
            this.app.showToast('Search saved successfully', 'success');
        } catch (error) {
            console.error('Failed to save search:', error);
            this.app.showToast('Failed to save search', 'error');
        }
    }

    // UI state methods
    showLoading() {
        const loading = document.getElementById('searchLoading');
        if (loading) loading.style.display = 'flex';
    }

    hideLoading() {
        const loading = document.getElementById('searchLoading');
        if (loading) loading.style.display = 'none';
    }

    showTrendingContent() {
        const trending = document.getElementById('trendingSection');
        if (trending) trending.style.display = 'block';
    }

    hideTrendingContent() {
        const trending = document.getElementById('trendingSection');
        if (trending) trending.style.display = 'none';
    }

    showSearchResults() {
        const results = document.getElementById('searchResultsInterface');
        if (results) results.style.display = 'block';
    }

    hideSearchResults() {
        const results = document.getElementById('searchResultsInterface');
        if (results) results.style.display = 'none';
    }

    showEmptyState() {
        const resultsList = document.getElementById('resultsList');
        if (resultsList) {
            resultsList.innerHTML = `
                <div class="empty-search-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>No posts found</h3>
                    <p>Try adjusting your search terms or filters to find what you're looking for.</p>
                    <div class="empty-state-suggestions">
                        <h4>Suggestions:</h4>
                        <ul>
                            <li>Check your spelling</li>
                            <li>Use more general terms</li>
                            <li>Try different keywords</li>
                            <li>Remove some filters</li>
                        </ul>
                    </div>
                </div>
            `;
        }
    }

    updateResultsCount() {
        const count = document.getElementById('resultsCount');
        if (count) {
            const total = this.searchResults.length;
            count.textContent = `${total} post${total !== 1 ? 's' : ''} found${this.currentQuery ? ` for "${this.currentQuery}"` : ''}`;
        }
    }

    updateLoadMoreButton() {
        const loadMoreSection = document.getElementById('loadMoreSection');
        if (loadMoreSection) {
            loadMoreSection.style.display = this.hasMoreResults && this.searchResults.length > 0 ? 'block' : 'none';
        }
    }

    // Utility methods
    populateTrendingContent() {
        const hashtagsList = document.getElementById('trendingHashtagsList');
        const topicsList = document.getElementById('trendingTopicsList');
        
        if (hashtagsList) {
            hashtagsList.innerHTML = this.trendingHashtags.map(tag => `
                <span class="trending-hashtag" onclick="searchPostsDashboard.searchHashtag('${tag}')">
                    ${tag}
                </span>
            `).join('');
        }
        
        if (topicsList) {
            topicsList.innerHTML = this.trendingTopics.map(topic => `
                <div class="trending-topic" onclick="searchPostsDashboard.performSearch('${topic.topic}')">
                    <span class="topic-name">${topic.topic}</span>
                    <span class="topic-count">${topic.posts}</span>
                </div>
            `).join('');
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - timestamp) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return timestamp.toLocaleDateString();
    }

    handleSearchInput(value) {
        // This is called by the input event listener
        // Debouncing is handled in setupRealTimeSearch
    }

    clearSearch() {
        const searchInput = document.getElementById('searchPostsInput');
        const clearBtn = document.getElementById('clearSearchBtn');
        
        if (searchInput) searchInput.value = '';
        if (clearBtn) clearBtn.style.display = 'none';
        
        this.currentQuery = '';
        this.searchResults = [];
        this.hideSuggestions();
        this.hideSearchResults();
        this.showTrendingContent();
    }

    // Additional functionality methods
    searchWithinResults() {
        const searchWithinInput = document.getElementById('searchWithinInput');
        const query = searchWithinInput?.value?.trim();
        
        if (!query) {
            this.app.showToast('Enter text to search within results', 'warning');
            return;
        }
        
        const filteredResults = this.searchResults.filter(post => 
            post.content.toLowerCase().includes(query.toLowerCase()) ||
            post.hashtags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
            post.author.name.toLowerCase().includes(query.toLowerCase())
        );
        
        const originalResults = this.searchResults;
        this.searchResults = filteredResults;
        this.renderSearchResults();
        this.updateResultsCount();
        
        this.app.showToast(`Found ${filteredResults.length} results within current search`, 'info');
        
        // Restore original results after 5 seconds
        setTimeout(() => {
            if (searchWithinInput) searchWithinInput.value = '';
            this.searchResults = originalResults;
            this.renderSearchResults();
            this.updateResultsCount();
        }, 10000);
    }

    loadMoreResults() {
        if (this.isSearching || !this.hasMoreResults) return;
        
        this.currentPage++;
        this.executeSearch();
    }

    exportResults() {
        if (this.searchResults.length === 0) {
            this.app.showToast('No results to export', 'warning');
            return;
        }
        
        const exportData = {
            query: this.currentQuery,
            timestamp: new Date().toISOString(),
            resultsCount: this.searchResults.length,
            filters: this.filters,
            sortBy: this.sortBy,
            results: this.searchResults.map(post => ({
                id: post.id,
                author: post.author.name,
                username: post.author.username,
                content: post.content.replace(/<[^>]*>/g, ''), // Remove HTML tags
                contentType: post.contentType,
                timestamp: post.timestamp,
                likes: post.likes,
                comments: post.comments,
                shares: post.shares,
                views: post.views,
                hashtags: post.hashtags
            }))
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `connecthub-search-results-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.app.showToast('Search results exported successfully', 'success');
    }

    shareResults() {
        if (this.searchResults.length === 0) {
            this.app.showToast('No results to share', 'warning');
            return;
        }
        
        const shareData = {
            title: `ConnectHub Search Results: ${this.currentQuery}`,
            text: `Found ${this.searchResults.length} posts for "${this.currentQuery}" on ConnectHub`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData).then(() => {
                this.app.showToast('Results shared successfully', 'success');
            }).catch(err => {
                console.error('Share failed:', err);
                this.fallbackShare(shareData);
            });
        } else {
            this.fallbackShare(shareData);
        }
    }

    fallbackShare(shareData) {
        // Fallback sharing method
        const url = encodeURIComponent(shareData.url);
        const text = encodeURIComponent(shareData.text);
        
        const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        window.open(shareUrl, '_blank');
        this.app.showToast('Share link opened', 'info');
    }

    openSearchSettings() {
        this.app.showToast('Search settings opened', 'info');
        // This would open a settings modal
    }

    switchHistoryTab(tab) {
        // Update active tab
        document.querySelectorAll('.history-tab').forEach(tabBtn => {
            tabBtn.classList.toggle('active', tabBtn.dataset.tab === tab);
        });
        
        // Show/hide content
        const recentList = document.getElementById('recentSearchesList');
        const savedList = document.getElementById('savedSearchesList');
        
        if (tab === 'recent') {
            if (recentList) recentList.style.display = 'block';
            if (savedList) savedList.style.display = 'none';
            this.populateRecentSearches();
        } else {
            if (recentList) recentList.style.display = 'none';
            if (savedList) savedList.style.display = 'block';
            this.populateSavedSearches();
        }
    }

    populateRecentSearches() {
        const list = document.getElementById('recentSearchesList');
        if (!list) return;
        
        if (this.searchHistory.length === 0) {
            list.innerHTML = '<p class="empty-history">No recent searches</p>';
            return;
        }
        
        list.innerHTML = this.searchHistory.map(search => `
            <div class="history-item">
                <i class="fas fa-history"></i>
                <span class="history-text" onclick="searchPostsDashboard.performSearch('${search}')">${search}</span>
                <button class="remove-history-btn" onclick="searchPostsDashboard.removeFromHistory('${search}')" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    populateSavedSearches() {
        const list = document.getElementById('savedSearchesList');
        if (!list) return;
        
        if (this.savedSearches.length === 0) {
            list.innerHTML = '<p class="empty-history">No saved searches</p>';
            return;
        }
        
        list.innerHTML = this.savedSearches.map(search => `
            <div class="history-item">
                <i class="fas fa-bookmark"></i>
                <div class="saved-search-info">
                    <span class="history-text" onclick="searchPostsDashboard.loadSavedSearch('${search.query}')">${search.query}</span>
                    <span class="saved-date">${new Date(search.timestamp).toLocaleDateString()}</span>
                </div>
                <button class="remove-history-btn" onclick="searchPostsDashboard.removeSavedSearch('${search.query}')" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    removeFromHistory(query) {
        this.searchHistory = this.searchHistory.filter(item => item !== query);
        this.saveSearchHistory();
        this.populateRecentSearches();
        this.app.showToast('Removed from history', 'info');
    }

    removeSavedSearch(query) {
        this.savedSearches = this.savedSearches.filter(item => item.query !== query);
        try {
            localStorage.setItem('connecthub_saved_searches', JSON.stringify(this.savedSearches));
            this.populateSavedSearches();
            this.app.showToast('Saved search removed', 'info');
        } catch (error) {
            console.error('Failed to remove saved search:', error);
            this.app.showToast('Failed to remove saved search', 'error');
        }
    }

    loadSavedSearch(query) {
        const saved = this.savedSearches.find(s => s.query === query);
        if (saved) {
            // Load the saved search with all its filters and settings
            this.filters = { ...saved.filters };
            this.sortBy = saved.sortBy;
            this.performSearch(query);
            this.app.showToast('Loaded saved search', 'success');
        }
    }

    closeDashboard() {
        const dashboard = document.getElementById('searchPostsDashboard');
        if (dashboard) {
            dashboard.remove();
        }
    }

    // Public method to open the dashboard
    openDashboard(initialQuery = '') {
        this.createDashboardInterface();
        
        if (initialQuery) {
            const searchInput = document.getElementById('searchPostsInput');
            if (searchInput) {
                searchInput.value = initialQuery;
                this.performSearch(initialQuery);
            }
        }
    }
}

// Initialize search posts dashboard when needed
if (typeof window !== 'undefined') {
    window.SearchPostsDashboard = SearchPostsDashboard;
    
    // Auto-initialize when app is ready
    document.addEventListener('DOMContentLoaded', () => {
        if (window.app) {
            window.searchPostsDashboard = new SearchPostsDashboard(window.app);
        }
    });
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchPostsDashboard;
}
