/**
 * ConnectHub Home UI Components
 * Enhanced UI interfaces for the Home section
 */

class HomeUIComponents {
    constructor(app) {
        this.app = app;
        this.stories = [];
        this.activeStoryIndex = 0;
        this.quickActionMenu = null;
        this.commentsCache = new Map();
        this.activityFeed = [];
        this.searchCache = new Map();
        
        this.init();
    }

    /**
     * Initialize all Home UI components
     */
    init() {
        this.initializeStoriesSection();
        this.initializeTrendingInteractivePanel();
        this.initializeQuickActionFloatingMenu();
        this.initializeAdvancedPostComposer();
        this.initializeInteractiveCommentsSystem();
        this.initializeRealTimeActivityFeed();
        this.initializeSocialGroupsWidget();
        this.initializeAdvancedSearchPanel();
        // Initialize 12 missing Home Screen interfaces
        this.initializeFullStoryViewer();
        this.initializeStoryCameraCreation();
        this.initializePostCommentsThread();
        this.initializePostReactionsPanel();
        this.initializeSharePostModal();
        this.initializeContentFilterSettings();
        this.initializeLiveActivityNotification();
        this.initializePostEditInterface();
        this.initializePostReportModal();
        this.initializeHashtagBrowseScreen();
        this.initializeMentionSuggestions();
        this.initializePostSchedulingInterface();
        
        console.log('Home UI Components initialized with all missing interfaces');
    }

    // ===== 1. STORIES SECTION =====
    
    /**
     * Initialize Instagram-style stories section
     */
    initializeStoriesSection() {
        const homeSection = document.getElementById('home-section');
        if (!homeSection) return;

        const socialLayout = homeSection.querySelector('.social-layout');
        const contentFeed = socialLayout?.querySelector('.content-feed');
        if (!contentFeed) return;

        // Create stories section HTML
        const storiesHTML = `
            <div class="stories-section" id="stories-section">
                <div class="stories-header">
                    <h3><i class="fas fa-clock"></i> Stories</h3>
                    <button class="add-story-btn" id="add-story-btn" title="Add Story">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="stories-container" id="stories-container">
                    <div class="story-item add-story" id="create-story-item">
                        <div class="story-avatar">
                            <img src="${this.app.currentUser?.avatar || 'https://via.placeholder.com/60x60'}" alt="Your Story">
                            <div class="add-story-overlay">
                                <i class="fas fa-plus"></i>
                            </div>
                        </div>
                        <span class="story-name">Your Story</span>
                    </div>
                </div>
                
                <!-- Stories Viewer Modal -->
                <div id="stories-viewer-modal" class="modal stories-modal">
                    <div class="stories-viewer-content">
                        <div class="stories-viewer-header">
                            <div class="story-progress-bars" id="story-progress-bars"></div>
                            <div class="story-user-info">
                                <img src="" alt="" class="story-user-avatar">
                                <span class="story-user-name"></span>
                                <span class="story-timestamp"></span>
                            </div>
                            <button class="close-stories-btn" id="close-stories-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="story-content-container" id="story-content-container">
                            <div class="story-navigation">
                                <button class="story-nav-btn prev" id="prev-story-btn">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button class="story-nav-btn next" id="next-story-btn">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                        <div class="story-interaction-bar">
                            <input type="text" placeholder="Reply to story..." class="story-reply-input">
                            <button class="story-reaction-btn" title="React">❤️</button>
                            <button class="story-share-btn" title="Share">
                                <i class="fas fa-share"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert before feed navigation
        const feedNav = contentFeed.querySelector('.feed-nav');
        if (feedNav) {
            feedNav.insertAdjacentHTML('beforebegin', storiesHTML);
        }

        // Load initial stories
        this.loadStories();
        this.setupStoriesEventListeners();
    }

    /**
     * Load stories from API or generate mock data
     */
    async loadStories() {
        try {
            // Generate mock stories for demonstration
            this.stories = [
                {
                    id: 'story-1',
                    user: {
                        id: 'user-2',
                        name: 'Emma Watson',
                        avatar: 'https://via.placeholder.com/60x60/42b72a/ffffff?text=EW'
                    },
                    items: [
                        {
                            id: 'story-item-1',
                            type: 'image',
                            url: 'https://source.unsplash.com/400x700/?photography,nature',
                            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
                        }
                    ],
                    viewedByUser: false
                },
                {
                    id: 'story-2',
                    user: {
                        id: 'user-3',
                        name: 'Alex Johnson',
                        avatar: 'https://via.placeholder.com/60x60/ff6b6b/ffffff?text=AJ'
                    },
                    items: [
                        {
                            id: 'story-item-2',
                            type: 'image',
                            url: 'https://source.unsplash.com/400x700/?travel,adventure',
                            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
                        }
                    ],
                    viewedByUser: true
                }
            ];

            this.renderStories();
        } catch (error) {
            console.error('Failed to load stories:', error);
        }
    }

    /**
     * Render stories in the container
     */
    renderStories() {
        const storiesContainer = document.getElementById('stories-container');
        if (!storiesContainer) return;

        // Keep the "Add Story" item and add other stories
        const addStoryItem = storiesContainer.querySelector('#create-story-item');
        storiesContainer.innerHTML = '';
        if (addStoryItem) {
            storiesContainer.appendChild(addStoryItem);
        }

        this.stories.forEach(story => {
            const storyElement = this.createStoryElement(story);
            storiesContainer.appendChild(storyElement);
        });
    }

    /**
     * Create individual story element
     */
    createStoryElement(story) {
        const storyDiv = document.createElement('div');
        storyDiv.className = 'story-item';
        storyDiv.dataset.storyId = story.id;

        const viewedClass = story.viewedByUser ? 'viewed' : 'unviewed';

        storyDiv.innerHTML = `
            <div class="story-avatar ${viewedClass}">
                <img src="${story.user.avatar}" alt="${story.user.name}">
                ${!story.viewedByUser ? '<div class="unviewed-indicator"></div>' : ''}
            </div>
            <span class="story-name">${story.user.name}</span>
        `;

        storyDiv.addEventListener('click', () => this.openStoryViewer(story));
        
        return storyDiv;
    }

    /**
     * Setup stories event listeners
     */
    setupStoriesEventListeners() {
        // Add story button
        const addStoryBtn = document.getElementById('add-story-btn');
        const createStoryItem = document.getElementById('create-story-item');
        
        if (addStoryBtn) {
            addStoryBtn.addEventListener('click', () => this.createNewStory());
        }
        
        if (createStoryItem) {
            createStoryItem.addEventListener('click', () => this.createNewStory());
        }

        // Story viewer controls
        const closeStoriesBtn = document.getElementById('close-stories-btn');
        const prevStoryBtn = document.getElementById('prev-story-btn');
        const nextStoryBtn = document.getElementById('next-story-btn');

        if (closeStoriesBtn) {
            closeStoriesBtn.addEventListener('click', () => this.closeStoryViewer());
        }

        if (prevStoryBtn) {
            prevStoryBtn.addEventListener('click', () => this.navigateStory(-1));
        }

        if (nextStoryBtn) {
            nextStoryBtn.addEventListener('click', () => this.navigateStory(1));
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const storiesModal = document.getElementById('stories-viewer-modal');
            if (storiesModal && storiesModal.classList.contains('show')) {
                if (e.key === 'ArrowLeft') this.navigateStory(-1);
                if (e.key === 'ArrowRight') this.navigateStory(1);
                if (e.key === 'Escape') this.closeStoryViewer();
            }
        });
    }

    /**
     * Open story viewer modal
     */
    openStoryViewer(story) {
        const modal = document.getElementById('stories-viewer-modal');
        if (!modal) return;

        this.currentStory = story;
        this.currentStoryItemIndex = 0;

        // Mark story as viewed
        story.viewedByUser = true;
        this.updateStoryViewedStatus(story.id);

        // Setup viewer
        this.setupStoryViewer();
        modal.classList.add('show');
        
        // Start story progression
        this.startStoryProgression();
    }

    /**
     * Setup story viewer with current story data
     */
    setupStoryViewer() {
        if (!this.currentStory) return;

        const userAvatar = document.querySelector('.story-user-avatar');
        const userName = document.querySelector('.story-user-name');
        const timestamp = document.querySelector('.story-timestamp');
        const progressBars = document.getElementById('story-progress-bars');
        const contentContainer = document.getElementById('story-content-container');

        if (userAvatar) userAvatar.src = this.currentStory.user.avatar;
        if (userName) userName.textContent = this.currentStory.user.name;
        
        // Setup progress bars
        if (progressBars) {
            progressBars.innerHTML = this.currentStory.items.map(() => 
                '<div class="story-progress-bar"><div class="progress-fill"></div></div>'
            ).join('');
        }

        this.displayCurrentStoryItem();
    }

    /**
     * Display current story item
     */
    displayCurrentStoryItem() {
        const item = this.currentStory.items[this.currentStoryItemIndex];
        if (!item) return;

        const contentContainer = document.getElementById('story-content-container');
        const timestamp = document.querySelector('.story-timestamp');

        if (timestamp) {
            timestamp.textContent = this.app.getTimeAgo(item.timestamp);
        }

        if (contentContainer) {
            const storyContent = contentContainer.querySelector('.story-content') || 
                                contentContainer.appendChild(document.createElement('div'));
            storyContent.className = 'story-content';

            if (item.type === 'image') {
                storyContent.innerHTML = `<img src="${item.url}" alt="Story content" class="story-media">`;
            } else if (item.type === 'video') {
                storyContent.innerHTML = `<video src="${item.url}" class="story-media" autoplay muted></video>`;
            }
        }

        this.updateProgressBars();
    }

    /**
     * Update story progress bars
     */
    updateProgressBars() {
        const progressBars = document.querySelectorAll('.story-progress-bar .progress-fill');
        progressBars.forEach((bar, index) => {
            if (index < this.currentStoryItemIndex) {
                bar.style.width = '100%';
            } else if (index === this.currentStoryItemIndex) {
                bar.style.width = '0%';
                bar.style.animation = 'storyProgress 5s linear forwards';
            } else {
                bar.style.width = '0%';
                bar.style.animation = 'none';
            }
        });
    }

    /**
     * Start story progression timer
     */
    startStoryProgression() {
        this.clearStoryTimer();
        this.storyTimer = setTimeout(() => {
            this.navigateStory(1);
        }, 5000); // 5 seconds per story item
    }

    /**
     * Clear story timer
     */
    clearStoryTimer() {
        if (this.storyTimer) {
            clearTimeout(this.storyTimer);
            this.storyTimer = null;
        }
    }

    /**
     * Navigate between story items
     */
    navigateStory(direction) {
        this.clearStoryTimer();

        if (direction === 1) {
            // Next story item
            if (this.currentStoryItemIndex < this.currentStory.items.length - 1) {
                this.currentStoryItemIndex++;
                this.displayCurrentStoryItem();
                this.startStoryProgression();
            } else {
                // Move to next story or close
                const currentIndex = this.stories.findIndex(s => s.id === this.currentStory.id);
                if (currentIndex < this.stories.length - 1) {
                    this.openStoryViewer(this.stories[currentIndex + 1]);
                } else {
                    this.closeStoryViewer();
                }
            }
        } else {
            // Previous story item
            if (this.currentStoryItemIndex > 0) {
                this.currentStoryItemIndex--;
                this.displayCurrentStoryItem();
                this.startStoryProgression();
            } else {
                // Move to previous story
                const currentIndex = this.stories.findIndex(s => s.id === this.currentStory.id);
                if (currentIndex > 0) {
                    this.openStoryViewer(this.stories[currentIndex - 1]);
                }
            }
        }
    }

    /**
     * Close story viewer
     */
    closeStoryViewer() {
        const modal = document.getElementById('stories-viewer-modal');
        if (modal) {
            modal.classList.remove('show');
        }
        
        this.clearStoryTimer();
        this.currentStory = null;
        this.currentStoryItemIndex = 0;
    }

    /**
     * Create new story
     */
    createNewStory() {
        // Create file input for story media
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*,video/*';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.processNewStory(file);
            }
            document.body.removeChild(fileInput);
        });

        document.body.appendChild(fileInput);
        fileInput.click();
    }

    /**
     * Process new story file
     */
    processNewStory(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            // In a real app, you'd upload to server first
            this.app.showToast('Story created successfully!', 'success');
            
            // For demo, just show success message
            // In reality, you'd create the story and refresh the stories list
        };
        
        reader.readAsDataURL(file);
    }

    /**
     * Update story viewed status
     */
    updateStoryViewedStatus(storyId) {
        const storyElement = document.querySelector(`[data-story-id="${storyId}"]`);
        if (storyElement) {
            const avatar = storyElement.querySelector('.story-avatar');
            if (avatar) {
                avatar.classList.remove('unviewed');
                avatar.classList.add('viewed');
                
                const indicator = avatar.querySelector('.unviewed-indicator');
                if (indicator) {
                    indicator.remove();
                }
            }
        }
    }

    // ===== 2. TRENDING INTERACTIVE PANEL =====
    
    /**
     * Initialize interactive trending hashtags panel
     */
    initializeTrendingInteractivePanel() {
        const trendingSection = document.querySelector('.trending-section');
        if (!trendingSection) return;

        // Enhanced trending section HTML
        const enhancedTrendingHTML = `
            <div class="trending-header">
                <h4><i class="fas fa-fire"></i> Trending Topics</h4>
                <div class="trending-controls">
                    <button class="trending-filter-btn" id="trending-filter-btn" title="Filter">
                        <i class="fas fa-sliders-h"></i>
                    </button>
                    <button class="trending-refresh-btn" id="trending-refresh-btn" title="Refresh">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>
            <div class="trending-filters" id="trending-filters" style="display: none;">
                <select class="trending-category-filter" id="trending-category">
                    <option value="all">All Categories</option>
                    <option value="photography">Photography</option>
                    <option value="technology">Technology</option>
                    <option value="travel">Travel</option>
                    <option value="art">Art & Design</option>
                    <option value="music">Music</option>
                </select>
                <select class="trending-time-filter" id="trending-time">
                    <option value="24h">Last 24 hours</option>
                    <option value="week">This week</option>
                    <option value="month">This month</option>
                </select>
            </div>
            <div class="trending-list-interactive" id="trending-list-interactive">
                <!-- Trending items will be loaded here -->
            </div>
        `;

        trendingSection.innerHTML = enhancedTrendingHTML;

        this.loadTrendingTopics();
        this.setupTrendingEventListeners();
    }

    /**
     * Load trending topics
     */
    async loadTrendingTopics() {
        try {
            // Mock trending data with more detail
            const trendingData = [
                {
                    id: 'trend-1',
                    tag: '#SummerVibes',
                    category: 'photography',
                    posts: 24567,
                    growth: '+12%',
                    trending: true,
                    description: 'Beautiful summer photography and moments'
                },
                {
                    id: 'trend-2',
                    tag: '#AIPhotography',
                    category: 'technology',
                    posts: 18234,
                    growth: '+45%',
                    trending: true,
                    description: 'AI-generated and enhanced photography'
                },
                {
                    id: 'trend-3',
                    tag: '#AdventureTime',
                    category: 'travel',
                    posts: 12789,
                    growth: '+8%',
                    trending: false,
                    description: 'Travel adventures and exploration'
                },
                {
                    id: 'trend-4',
                    tag: '#DigitalArt',
                    category: 'art',
                    posts: 9876,
                    growth: '+23%',
                    trending: true,
                    description: 'Digital artwork and creative designs'
                }
            ];

            this.currentTrends = trendingData;
            this.renderTrendingTopics(trendingData);
        } catch (error) {
            console.error('Failed to load trending topics:', error);
        }
    }

    /**
     * Render trending topics
     */
    renderTrendingTopics(trends) {
        const trendingList = document.getElementById('trending-list-interactive');
        if (!trendingList) return;

        trendingList.innerHTML = trends.map(trend => `
            <div class="trending-item-interactive" data-trend-id="${trend.id}">
                <div class="trending-item-header">
                    <div class="trending-tag-info">
                        <span class="trend-category">${this.formatCategory(trend.category)}</span>
                        <span class="trend-name">${trend.tag}</span>
                        ${trend.trending ? '<span class="trending-badge">🔥</span>' : ''}
                    </div>
                    <div class="trending-growth ${trend.growth.includes('+') ? 'positive' : 'negative'}">
                        ${trend.growth}
                    </div>
                </div>
                <div class="trending-item-stats">
                    <span class="trend-posts">${this.app.formatNumber(trend.posts)} posts</span>
                    <span class="trend-description">${trend.description}</span>
                </div>
                <div class="trending-item-actions">
                    <button class="follow-trend-btn" data-tag="${trend.tag}" title="Follow this trend">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="explore-trend-btn" data-tag="${trend.tag}" title="Explore posts">
                        <i class="fas fa-search"></i>
                    </button>
                    <button class="share-trend-btn" data-tag="${trend.tag}" title="Share trend">
                        <i class="fas fa-share"></i>
                    </button>
                </div>
            </div>
        `).join('');

        this.setupTrendingItemListeners();
    }

    /**
     * Setup trending event listeners
     */
    setupTrendingEventListeners() {
        const filterBtn = document.getElementById('trending-filter-btn');
        const refreshBtn = document.getElementById('trending-refresh-btn');
        const categoryFilter = document.getElementById('trending-category');
        const timeFilter = document.getElementById('trending-time');

        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.toggleTrendingFilters());
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshTrending());
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterTrending());
        }

        if (timeFilter) {
            timeFilter.addEventListener('change', () => this.filterTrending());
        }
    }

    /**
     * Setup trending item listeners
     */
    setupTrendingItemListeners() {
        // Follow trend buttons
        document.querySelectorAll('.follow-trend-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tag = btn.dataset.tag;
                this.followTrend(tag, btn);
            });
        });

        // Explore trend buttons
        document.querySelectorAll('.explore-trend-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tag = btn.dataset.tag;
                this.exploreTrend(tag);
            });
        });

        // Share trend buttons
        document.querySelectorAll('.share-trend-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tag = btn.dataset.tag;
                this.shareTrend(tag);
            });
        });
    }

    /**
     * Toggle trending filters visibility
     */
    toggleTrendingFilters() {
        const filters = document.getElementById('trending-filters');
        if (filters) {
            const isVisible = filters.style.display !== 'none';
            filters.style.display = isVisible ? 'none' : 'block';
        }
    }

    /**
     * Refresh trending topics
     */
    async refreshTrending() {
        const refreshBtn = document.getElementById('trending-refresh-btn');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            icon.classList.add('fa-spin');
            
            await this.loadTrendingTopics();
            
            setTimeout(() => {
                icon.classList.remove('fa-spin');
            }, 1000);
        }
    }

    /**
     * Filter trending topics
     */
    filterTrending() {
        const category = document.getElementById('trending-category')?.value;
        const timeFilter = document.getElementById('trending-time')?.value;

        if (!this.currentTrends) return;

        let filteredTrends = this.currentTrends;

        if (category && category !== 'all') {
            filteredTrends = filteredTrends.filter(trend => trend.category === category);
        }

        this.renderTrendingTopics(filteredTrends);
        this.app.showToast(`Filtered trends: ${category || 'all'} categories`, 'info');
    }

    /**
     * Follow a trend
     */
    followTrend(tag, buttonElement) {
        const isFollowing = buttonElement.classList.contains('following');
        
        if (isFollowing) {
            buttonElement.classList.remove('following');
            buttonElement.innerHTML = '<i class="fas fa-plus"></i>';
            buttonElement.title = 'Follow this trend';
            this.app.showToast(`Unfollowed ${tag}`, 'info');
        } else {
            buttonElement.classList.add('following');
            buttonElement.innerHTML = '<i class="fas fa-check"></i>';
            buttonElement.title = 'Unfollow this trend';
            this.app.showToast(`Following ${tag}`, 'success');
        }
    }

    /**
     * Explore posts for a trend
     */
    exploreTrend(tag) {
        // In a real app, this would filter the main feed by the hashtag
        this.app.showToast(`Exploring posts for ${tag}`, 'info');
        
        // Simulate updating the main feed with trend posts
        this.filterMainFeedByHashtag(tag);
    }

    /**
     * Share a trend
     */
    shareTrend(tag) {
        if (navigator.share) {
            navigator.share({
                title: `Check out this trending topic: ${tag}`,
                text: `${tag} is trending on ConnectHub!`,
                url: window.location.href
            }).then(() => {
                this.app.showToast('Trend shared successfully', 'success');
            }).catch(console.error);
        } else {
            // Fallback to copying to clipboard
            navigator.clipboard.writeText(`Check out ${tag} trending on ConnectHub!`)
                .then(() => this.app.showToast('Trend copied to clipboard', 'success'))
                .catch(() => this.app.showToast('Share not supported', 'warning'));
        }
    }

    /**
     * Filter main feed by hashtag
     */
    filterMainFeedByHashtag(tag) {
        const feedNav = document.querySelector('.feed-nav');
        if (feedNav) {
            // Add a temporary trending tab
            const existingTrendTab = feedNav.querySelector('.trend-filter-tab');
            if (existingTrendTab) {
                existingTrendTab.remove();
            }

            const trendTab = document.createElement('button');
            trendTab.className = 'feed-tab trend-filter-tab active';
            trendTab.innerHTML = `<i class="fas fa-hashtag"></i> ${tag}`;
            
            // Make other tabs inactive
            feedNav.querySelectorAll('.feed-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            feedNav.appendChild(trendTab);
            
            // Add close button to remove filter
            trendTab.addEventListener('click', () => {
                trendTab.remove();
                feedNav.querySelector('.feed-tab').classList.add('active');
                this.app.loadFeedPosts();
            });
        }
    }

    /**
     * Format category for display
     */
    formatCategory(category) {
        const categoryMap = {
            'photography': 'Photography',
            'technology': 'Tech',
            'travel': 'Travel',
            'art': 'Art',
            'music': 'Music'
        };
        return categoryMap[category] || category;
    }

    // ===== 3. QUICK ACTION FLOATING MENU =====
    
    /**
     * Initialize quick action floating menu
     */
    initializeQuickActionFloatingMenu() {
        const quickActionHTML = `
            <div class="quick-action-fab" id="quick-action-fab">
                <button class="fab-main-btn" id="fab-main-btn">
                    <i class="fas fa-plus"></i>
                </button>
                <div class="fab-menu" id="fab-menu">
                    <button class="fab-option" data-action="post" title="Create Post">
                        <i class="fas fa-edit"></i>
                        <span>Post</span>
                    </button>
                    <button class="fab-option" data-action="photo" title="Share Photo">
                        <i class="fas fa-camera"></i>
                        <span>Photo</span>
                    </button>
                    <button class="fab-option" data-action="video" title="Share Video">
                        <i class="fas fa-video"></i>
                        <span>Video</span>
                    </button>
                    <button class="fab-option" data-action="story" title="Add Story">
                        <i class="fas fa-clock"></i>
                        <span>Story</span>
                    </button>
                    <button class="fab-option" data-action="live" title="Go Live">
                        <i class="fas fa-broadcast-tower"></i>
                        <span>Live</span>
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', quickActionHTML);
        this.setupQuickActionListeners();
    }

    /**
     * Setup quick action menu listeners
     */
    setupQuickActionListeners() {
        const fabMainBtn = document.getElementById('fab-main-btn');
        const fabMenu = document.getElementById('fab-menu');
        
        if (fabMainBtn) {
            fabMainBtn.addEventListener('click', () => {
                this.toggleQuickActionMenu();
            });
        }

        // Setup action buttons
        document.querySelectorAll('.fab-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
                this.toggleQuickActionMenu(); // Close menu after action
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            const fab = document.getElementById('quick-action-fab');
            if (fab && !fab.contains(e.target)) {
                this.closeQuickActionMenu();
            }
        });
    }

    /**
     * Toggle quick action menu
     */
    toggleQuickActionMenu() {
        const fabMenu = document.getElementById('fab-menu');
        const fabMainBtn = document.getElementById('fab-main-btn');
        
        if (fabMenu && fabMainBtn) {
            const isOpen = fabMenu.classList.contains('open');
            
            if (isOpen) {
                this.closeQuickActionMenu();
            } else {
                this.openQuickActionMenu();
            }
        }
    }

    /**
     * Open quick action menu
     */
    openQuickActionMenu() {
        const fabMenu = document.getElementById('fab-menu');
        const fabMainBtn = document.getElementById('fab-main-btn');
        
        if (fabMenu && fabMainBtn) {
            fabMenu.classList.add('open');
            fabMainBtn.classList.add('open');
            
            // Animate fab options
            const fabOptions = fabMenu.querySelectorAll('.fab-option');
            fabOptions.forEach((option, index) => {
                option.style.animationDelay = `${index * 0.1}s`;
                option.classList.add('animate-in');
            });
        }
    }

    /**
     * Close quick action menu
     */
    closeQuickActionMenu() {
        const fabMenu = document.getElementById('fab-menu');
        const fabMainBtn = document.getElementById('fab-main-btn');
        
        if (fabMenu && fabMainBtn) {
            fabMenu.classList.remove('open');
            fabMainBtn.classList.remove('open');
            
            const fabOptions = fabMenu.querySelectorAll('.fab-option');
            fabOptions.forEach(option => {
                option.classList.remove('animate-in');
            });
        }
    }

    /**
     * Handle quick action
     */
    handleQuickAction(action) {
        switch (action) {
            case 'post':
                this.app.openModal('create-post-modal');
                break;
            case 'photo':
                this.app.handleAddPhoto();
                break;
            case 'video':
                this.app.handleAddVideo();
                break;
            case 'story':
                this.createNewStory();
                break;
            case 'live':
                this.startLiveStream();
                break;
            default:
                this.app.showToast(`${action} feature coming soon`, 'info');
        }
    }

    /**
     * Start live stream
     */
    startLiveStream() {
        this.app.navigateToSection('streaming');
        this.app.showToast('Starting live stream...', 'info');
    }

    // ===== 4. ADVANCED POST COMPOSER =====
    
    /**
     * Initialize advanced post composer with polls, scheduling, etc.
     */
    initializeAdvancedPostComposer() {
        // Enhanced create post modal
        const existingModal = document.getElementById('create-post-modal');
        if (!existingModal) return;

        const modalContent = existingModal.querySelector('.modal-content');
        if (!modalContent) return;

        // Add advanced composer features to existing modal
        const advancedFeaturesHTML = `
            <div class="advanced-composer-features" id="advanced-composer-features">
                <div class="composer-tabs">
                    <button class="composer-tab active" data-tab="basic">
                        <i class="fas fa-edit"></i> Basic
                    </button>
                    <button class="composer-tab" data-tab="poll">
                        <i class="fas fa-poll"></i> Poll
                    </button>
                    <button class="composer-tab" data-tab="event">
                        <i class="fas fa-calendar"></i> Event
                    </button>
                    <button class="composer-tab" data-tab="schedule">
                        <i class="fas fa-clock"></i> Schedule
                    </button>
                </div>
                
                <div class="composer-content">
                    <!-- Basic tab (existing content) -->
                    <div class="composer-tab-content active" id="basic-content">
                        <!-- Existing modal body content will be moved here -->
                    </div>
                    
                    <!-- Poll tab -->
                    <div class="composer-tab-content" id="poll-content">
                        <div class="poll-creator">
                            <h4><i class="fas fa-poll"></i> Create Poll</h4>
                            <input type="text" placeholder="Ask a question..." class="poll-question" maxlength="280">
                            <div class="poll-options-container">
                                <div class="poll-option">
                                    <input type="text" placeholder="Option 1" class="poll-option-input">
                                    <button class="remove-option-btn" style="display: none;">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                                <div class="poll-option">
                                    <input type="text" placeholder="Option 2" class="poll-option-input">
                                    <button class="remove-option-btn" style="display: none;">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            <button class="add-poll-option-btn" id="add-poll-option-btn">
                                <i class="fas fa-plus"></i> Add Option
                            </button>
                            <div class="poll-settings">
                                <div class="poll-setting">
                                    <label>
                                        <input type="checkbox" id="multiple-choice"> Allow multiple choices
                                    </label>
                                </div>
                                <div class="poll-setting">
                                    <label for="poll-duration">Poll duration:</label>
                                    <select id="poll-duration">
                                        <option value="1">1 day</option>
                                        <option value="3">3 days</option>
                                        <option value="7" selected>1 week</option>
                                        <option value="30">1 month</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Event tab -->
                    <div class="composer-tab-content" id="event-content">
                        <div class="event-creator">
                            <h4><i class="fas fa-calendar"></i> Create Event</h4>
                            <input type="text" placeholder="Event title" class="event-title" maxlength="100">
                            <textarea placeholder="Event description" class="event-description" rows="3"></textarea>
                            <div class="event-details">
                                <div class="event-field">
                                    <label for="event-date">Date & Time:</label>
                                    <input type="datetime-local" id="event-date" class="event-datetime">
                                </div>
                                <div class="event-field">
                                    <label for="event-location">Location:</label>
                                    <input type="text" id="event-location" placeholder="Event location">
                                </div>
                                <div class="event-field">
                                    <label for="event-type">Event Type:</label>
                                    <select id="event-type">
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                        <option value="friends">Friends Only</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Schedule tab -->
                    <div class="composer-tab-content" id="schedule-content">
                        <div class="schedule-creator">
                            <h4><i class="fas fa-clock"></i> Schedule Post</h4>
                            <div class="schedule-options">
                                <div class="schedule-option">
                                    <input type="radio" id="post-now" name="schedule" value="now" checked>
                                    <label for="post-now">Post now</label>
                                </div>
                                <div class="schedule-option">
                                    <input type="radio" id="post-later" name="schedule" value="later">
                                    <label for="post-later">Schedule for later</label>
                                </div>
                            </div>
                            <div class="schedule-datetime" id="schedule-datetime" style="display: none;">
                                <label for="schedule-date">Schedule Date & Time:</label>
                                <input type="datetime-local" id="schedule-date">
                                <div class="timezone-info">
                                    <i class="fas fa-info-circle"></i>
                                    Time zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
                                </div>
                            </div>
                            <div class="scheduled-posts-preview">
                                <h5>Upcoming Scheduled Posts</h5>
                                <div class="scheduled-posts-list">
                                    <div class="scheduled-post-item">
                                        <div class="scheduled-post-content">
                                            "Weekend vibes! 🌅"
                                        </div>
                                        <div class="scheduled-post-time">
                                            Tomorrow at 9:00 AM
                                        </div>
                                        <button class="edit-scheduled-post-btn">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert advanced features before the modal footer
        const modalFooter = modalContent.querySelector('.modal-footer');
        if (modalFooter) {
            modalFooter.insertAdjacentHTML('beforebegin', advancedFeaturesHTML);
        }

        this.setupAdvancedComposerListeners();
    }

    /**
     * Setup advanced composer listeners
     */
    setupAdvancedComposerListeners() {
        // Composer tabs
        document.querySelectorAll('.composer-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchComposerTab(tabName);
            });
        });

        // Poll functionality
        const addPollOptionBtn = document.getElementById('add-poll-option-btn');
        if (addPollOptionBtn) {
            addPollOptionBtn.addEventListener('click', () => this.addPollOption());
        }

        // Schedule functionality
        const postLaterRadio = document.getElementById('post-later');
        if (postLaterRadio) {
            postLaterRadio.addEventListener('change', () => {
                const scheduleDateTime = document.getElementById('schedule-datetime');
                if (scheduleDateTime) {
                    scheduleDateTime.style.display = postLaterRadio.checked ? 'block' : 'none';
                }
            });
        }

        const postNowRadio = document.getElementById('post-now');
        if (postNowRadio) {
            postNowRadio.addEventListener('change', () => {
                const scheduleDateTime = document.getElementById('schedule-datetime');
                if (scheduleDateTime) {
                    scheduleDateTime.style.display = postNowRadio.checked ? 'none' : 'block';
                }
            });
        }
    }

    /**
     * Switch composer tab
     */
    switchComposerTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.composer-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.composer-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-content`);
        });
    }

    /**
     * Add poll option
     */
    addPollOption() {
        const optionsContainer = document.querySelector('.poll-options-container');
        const currentOptions = optionsContainer.querySelectorAll('.poll-option');
        
        if (currentOptions.length >= 6) {
            this.app.showToast('Maximum 6 poll options allowed', 'warning');
            return;
        }

        const optionIndex = currentOptions.length + 1;
        const pollOption = document.createElement('div');
        pollOption.className = 'poll-option';
        pollOption.innerHTML = `
            <input type="text" placeholder="Option ${optionIndex}" class="poll-option-input">
            <button class="remove-option-btn" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        optionsContainer.appendChild(pollOption);

        // Show remove buttons when there are more than 2 options
        if (currentOptions.length >= 2) {
            document.querySelectorAll('.remove-option-btn').forEach(btn => {
                btn.style.display = 'block';
            });
        }
    }

    // ===== 5. INTERACTIVE COMMENTS SYSTEM =====
    
    /**
     * Initialize interactive comments system with replies, reactions, etc.
     */
    initializeInteractiveCommentsSystem() {
        // Override the original showComments method
        const originalShowComments = this.app.showComments;
        this.app.showComments = (post) => {
            this.showAdvancedComments(post);
        };

        // Enhance existing post interaction listeners
        this.enhancePostInteractions();
    }

    /**
     * Show advanced comments modal
     */
    showAdvancedComments(post) {
        // Create or get comments modal
        let commentsModal = document.getElementById('comments-modal');
        if (!commentsModal) {
            commentsModal = this.createCommentsModal();
            document.body.appendChild(commentsModal);
        }

        this.currentPost = post;
        this.loadPostComments(post);
        commentsModal.classList.add('show');
    }

    /**
     * Create comments modal
     */
    createCommentsModal() {
        const modal = document.createElement('div');
        modal.id = 'comments-modal';
        modal.className = 'modal comments-modal';
        
        modal.innerHTML = `
            <div class="modal-content comments-modal-content">
                <div class="comments-header">
                    <h3><i class="fas fa-comments"></i> Comments</h3>
                    <div class="comments-sort">
                        <select id="comments-sort-select">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="popular">Most Popular</option>
                        </select>
                    </div>
                    <button class="close-modal" onclick="document.getElementById('comments-modal').classList.remove('show')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="comments-container" id="comments-container">
                    <div class="comments-loading">
                        <div class="loading-spinner"></div>
                        <span>Loading comments...</span>
                    </div>
                </div>
                
                <div class="comment-composer">
                    <img src="${this.app.currentUser?.avatar}" alt="Your avatar" class="comment-user-avatar">
                    <div class="comment-input-container">
                        <textarea placeholder="Write a comment..." class="comment-input" id="comment-input" rows="1"></textarea>
                        <div class="comment-actions">
                            <button class="comment-emoji-btn" title="Add emoji">
                                <i class="far fa-smile"></i>
                            </button>
                            <button class="comment-gif-btn" title="Add GIF">
                                <i class="fas fa-gif"></i>
                            </button>
                            <button class="comment-image-btn" title="Add image">
                                <i class="fas fa-image"></i>
                            </button>
                            <button class="comment-post-btn" id="comment-post-btn" disabled>
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupCommentsModalListeners(modal);
        return modal;
    }

    /**
     * Setup comments modal listeners
     */
    setupCommentsModalListeners(modal) {
        const commentInput = modal.querySelector('#comment-input');
        const commentPostBtn = modal.querySelector('#comment-post-btn');
        const sortSelect = modal.querySelector('#comments-sort-select');

        // Auto-resize textarea
        if (commentInput) {
            commentInput.addEventListener('input', () => {
                this.autoResizeTextarea(commentInput);
                this.toggleCommentPostButton(commentInput, commentPostBtn);
            });

            commentInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    this.postComment();
                }
            });
        }

        // Post comment button
        if (commentPostBtn) {
            commentPostBtn.addEventListener('click', () => this.postComment());
        }

        // Sort comments
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.sortComments(sortSelect.value);
            });
        }

        // Comment actions
        modal.addEventListener('click', (e) => {
            if (e.target.closest('.comment-like-btn')) {
                this.toggleCommentLike(e.target.closest('.comment-like-btn'));
            }
            if (e.target.closest('.comment-reply-btn')) {
                this.replyToComment(e.target.closest('.comment-reply-btn'));
            }
            if (e.target.closest('.comment-share-btn')) {
                this.shareComment(e.target.closest('.comment-share-btn'));
            }
        });
    }

    /**
     * Load post comments
     */
    async loadPostComments(post) {
        const commentsContainer = document.getElementById('comments-container');
        if (!commentsContainer) return;

        try {
            // Check cache first
            if (this.commentsCache.has(post.id)) {
                const cachedComments = this.commentsCache.get(post.id);
                this.renderComments(cachedComments);
                return;
            }

            // Generate mock comments
            const comments = [
                {
                    id: 'comment-1',
                    user: {
                        id: 'user-4',
                        name: 'Sarah Chen',
                        avatar: 'https://via.placeholder.com/32x32/9b59b6/ffffff?text=SC'
                    },
                    content: 'This is absolutely stunning! 😍 The lighting is perfect!',
                    timestamp: new Date(Date.now() - 30 * 60 * 1000),
                    likes: 12,
                    userLiked: false,
                    replies: [
                        {
                            id: 'reply-1',
                            user: {
                                id: 'user-2',
                                name: 'Emma Watson',
                                avatar: 'https://via.placeholder.com/32x32/42b72a/ffffff?text=EW'
                            },
                            content: 'Thank you so much! ❤️',
                            timestamp: new Date(Date.now() - 25 * 60 * 1000),
                            likes: 5,
                            userLiked: true
                        }
                    ]
                },
                {
                    id: 'comment-2',
                    user: {
                        id: 'user-5',
                        name: 'Mike Rodriguez',
                        avatar: 'https://via.placeholder.com/32x32/e67e22/ffffff?text=MR'
                    },
                    content: 'Amazing shot! What camera did you use?',
                    timestamp: new Date(Date.now() - 45 * 60 * 1000),
                    likes: 7,
                    userLiked: true,
                    replies: []
                }
            ];

            this.commentsCache.set(post.id, comments);
            this.renderComments(comments);

        } catch (error) {
            console.error('Failed to load comments:', error);
            commentsContainer.innerHTML = '<div class="comments-error">Failed to load comments</div>';
        }
    }

    /**
     * Render comments
     */
    renderComments(comments) {
        const commentsContainer = document.getElementById('comments-container');
        if (!commentsContainer) return;

        if (comments.length === 0) {
            commentsContainer.innerHTML = `
                <div class="no-comments">
                    <i class="fas fa-comment"></i>
                    <p>No comments yet</p>
                    <p>Be the first to comment!</p>
                </div>
            `;
            return;
        }

        commentsContainer.innerHTML = comments.map(comment => `
            <div class="comment-item" data-comment-id="${comment.id}">
                <img src="${comment.user.avatar}" alt="${comment.user.name}" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${comment.user.name}</span>
                        <span class="comment-timestamp">${this.app.getTimeAgo(comment.timestamp)}</span>
                    </div>
                    <div class="comment-text">${comment.content}</div>
                    <div class="comment-actions">
                        <button class="comment-action-btn comment-like-btn ${comment.userLiked ? 'liked' : ''}" data-comment-id="${comment.id}">
                            <i class="fas fa-heart"></i>
                            <span>${comment.likes || 0}</span>
                        </button>
                        <button class="comment-action-btn comment-reply-btn" data-comment-id="${comment.id}">
                            <i class="fas fa-reply"></i>
                            Reply
                        </button>
                        <button class="comment-action-btn comment-share-btn" data-comment-id="${comment.id}">
                            <i class="fas fa-share"></i>
                        </button>
                    </div>
                    ${comment.replies && comment.replies.length > 0 ? `
                        <div class="comment-replies">
                            ${comment.replies.map(reply => `
                                <div class="reply-item" data-reply-id="${reply.id}">
                                    <img src="${reply.user.avatar}" alt="${reply.user.name}" class="reply-avatar">
                                    <div class="reply-content">
                                        <div class="reply-header">
                                            <span class="reply-author">${reply.user.name}</span>
                                            <span class="reply-timestamp">${this.app.getTimeAgo(reply.timestamp)}</span>
                                        </div>
                                        <div class="reply-text">${reply.content}</div>
                                        <div class="reply-actions">
                                            <button class="reply-like-btn ${reply.userLiked ? 'liked' : ''}">
                                                <i class="fas fa-heart"></i>
                                                <span>${reply.likes || 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    /**
     * Auto resize textarea
     */
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    /**
     * Toggle comment post button
     */
    toggleCommentPostButton(input, button) {
        if (!button) return;
        
        const hasContent = input.value.trim().length > 0;
        button.disabled = !hasContent;
        button.style.opacity = hasContent ? '1' : '0.5';
    }

    /**
     * Post comment
     */
    async postComment() {
        const commentInput = document.getElementById('comment-input');
        const content = commentInput?.value.trim();
        
        if (!content || !this.currentPost) return;

        try {
            // Create new comment object
            const newComment = {
                id: `comment-${Date.now()}`,
                user: {
                    id: this.app.currentUser.id,
                    name: this.app.currentUser.name,
                    avatar: this.app.currentUser.avatar
                },
                content: content,
                timestamp: new Date(),
                likes: 0,
                userLiked: false,
                replies: []
            };

            // Add to cache
            const cachedComments = this.commentsCache.get(this.currentPost.id) || [];
            cachedComments.unshift(newComment);
            this.commentsCache.set(this.currentPost.id, cachedComments);

            // Re-render comments
            this.renderComments(cachedComments);

            // Clear input
            if (commentInput) {
                commentInput.value = '';
                this.autoResizeTextarea(commentInput);
            }

            // Update post comment count
            this.currentPost.stats.comments++;
            this.updatePostCommentCount(this.currentPost.id);

            this.app.showToast('Comment posted successfully!', 'success');

        } catch (error) {
            console.error('Failed to post comment:', error);
            this.app.showToast('Failed to post comment', 'error');
        }
    }

    /**
     * Toggle comment like
     */
    toggleCommentLike(button) {
        const commentId = button.dataset.commentId;
        const isLiked = button.classList.contains('liked');
        
        // Toggle UI
        button.classList.toggle('liked');
        const countSpan = button.querySelector('span');
        if (countSpan) {
            const currentCount = parseInt(countSpan.textContent) || 0;
            countSpan.textContent = isLiked ? currentCount - 1 : currentCount + 1;
        }

        this.app.showToast(isLiked ? 'Comment unliked' : 'Comment liked', 'success');
    }

    /**
     * Reply to comment
     */
    replyToComment(button) {
        const commentId = button.dataset.commentId;
        const commentItem = button.closest('.comment-item');
        
        // Check if reply input already exists
        let replyInput = commentItem.querySelector('.reply-input-container');
        if (replyInput) {
            replyInput.remove();
            return;
        }

        // Create reply input
        replyInput = document.createElement('div');
        replyInput.className = 'reply-input-container';
        replyInput.innerHTML = `
            <img src="${this.app.currentUser?.avatar}" alt="Your avatar" class="reply-user-avatar">
            <div class="reply-input-wrapper">
                <textarea placeholder="Write a reply..." class="reply-input" rows="1"></textarea>
                <div class="reply-input-actions">
                    <button class="cancel-reply-btn">Cancel</button>
                    <button class="post-reply-btn" disabled>Reply</button>
                </div>
            </div>
        `;

        // Insert after comment actions
        const commentActions = commentItem.querySelector('.comment-actions');
        commentActions.insertAdjacentElement('afterend', replyInput);

        // Setup reply input listeners
        this.setupReplyInputListeners(replyInput, commentId);

        // Focus on input
        const textarea = replyInput.querySelector('.reply-input');
        if (textarea) {
            textarea.focus();
        }
    }

    /**
     * Setup reply input listeners
     */
    setupReplyInputListeners(container, commentId) {
        const textarea = container.querySelector('.reply-input');
        const cancelBtn = container.querySelector('.cancel-reply-btn');
        const postBtn = container.querySelector('.post-reply-btn');

        if (textarea) {
            textarea.addEventListener('input', () => {
                this.autoResizeTextarea(textarea);
                this.toggleReplyPostButton(textarea, postBtn);
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                container.remove();
            });
        }

        if (postBtn) {
            postBtn.addEventListener('click', () => {
                this.postReply(commentId, textarea.value.trim());
                container.remove();
            });
        }
    }

    /**
     * Toggle reply post button
     */
    toggleReplyPostButton(input, button) {
        if (!button) return;
        
        const hasContent = input.value.trim().length > 0;
        button.disabled = !hasContent;
        button.style.opacity = hasContent ? '1' : '0.5';
    }

    /**
     * Post reply
     */
    postReply(commentId, content) {
        if (!content) return;

        // In a real app, you'd make an API call here
        this.app.showToast('Reply posted successfully!', 'success');
        
        // For demo, just reload comments
        setTimeout(() => {
            this.loadPostComments(this.currentPost);
        }, 500);
    }

    /**
     * Share comment
     */
    shareComment(button) {
        const commentId = button.dataset.commentId;
        this.app.showToast('Comment shared!', 'success');
    }

    /**
     * Sort comments
     */
    sortComments(sortBy) {
        const cachedComments = this.commentsCache.get(this.currentPost.id);
        if (!cachedComments) return;

        let sortedComments = [...cachedComments];

        switch (sortBy) {
            case 'newest':
                sortedComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                break;
            case 'oldest':
                sortedComments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                break;
            case 'popular':
                sortedComments.sort((a, b) => (b.likes || 0) - (a.likes || 0));
                break;
        }

        this.commentsCache.set(this.currentPost.id, sortedComments);
        this.renderComments(sortedComments);
    }

    /**
     * Update post comment count
     */
    updatePostCommentCount(postId) {
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (!postElement) return;

        const commentBtn = postElement.querySelector('.comment-btn span');
        if (commentBtn) {
            const post = this.app.posts.find(p => p.id === postId);
            if (post) {
                commentBtn.textContent = this.app.formatNumber(post.stats.comments);
            }
        }
    }

    /**
     * Enhance post interactions
     */
    enhancePostInteractions() {
        // This method will be called to enhance existing post interaction buttons
        // with the new advanced comments functionality
        console.log('Enhanced post interactions with advanced comments system');
    }

    // ===== 6. REAL-TIME ACTIVITY FEED =====
    
    /**
     * Initialize real-time activity feed
     */
    initializeRealTimeActivityFeed() {
        const rightSidebar = document.querySelector('.right-sidebar');
        if (!rightSidebar) return;

        const activityFeedHTML = `
            <div class="activity-feed-widget" id="activity-feed-widget">
                <div class="activity-feed-header">
                    <h4><i class="fas fa-pulse"></i> Live Activity</h4>
                    <div class="activity-controls">
                        <button class="activity-filter-btn" id="activity-filter-btn" title="Filter">
                            <i class="fas fa-filter"></i>
                        </button>
                        <button class="activity-refresh-btn" id="activity-refresh-btn" title="Refresh">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="activity-filters" id="activity-filters" style="display: none;">
                    <div class="filter-options">
                        <label class="filter-checkbox">
                            <input type="checkbox" value="likes" checked> Likes
                        </label>
                        <label class="filter-checkbox">
                            <input type="checkbox" value="comments" checked> Comments
                        </label>
                        <label class="filter-checkbox">
                            <input type="checkbox" value="follows" checked> Follows
                        </label>
                        <label class="filter-checkbox">
                            <input type="checkbox" value="posts" checked> Posts
                        </label>
                    </div>
                </div>
                <div class="activity-feed-list" id="activity-feed-list">
                    <div class="activity-loading">
                        <div class="activity-pulse"></div>
                        <span>Loading live activity...</span>
                    </div>
                </div>
            </div>
        `;

        // Insert after suggestions section
        const suggestionsSection = rightSidebar.querySelector('.suggested-connections');
        if (suggestionsSection) {
            suggestionsSection.insertAdjacentHTML('afterend', activityFeedHTML);
        } else {
            rightSidebar.insertAdjacentHTML('beforeend', activityFeedHTML);
        }

        this.setupActivityFeedListeners();
        this.startActivityFeed();
    }

    /**
     * Setup activity feed listeners
     */
    setupActivityFeedListeners() {
        const filterBtn = document.getElementById('activity-filter-btn');
        const refreshBtn = document.getElementById('activity-refresh-btn');

        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.toggleActivityFilters());
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshActivityFeed());
        }

        // Filter checkboxes
        document.querySelectorAll('.filter-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.filterActivityFeed());
        });
    }

    /**
     * Start real-time activity feed
     */
    startActivityFeed() {
        this.loadInitialActivity();
        
        // Simulate real-time updates every 15 seconds
        this.activityInterval = setInterval(() => {
            this.addNewActivityItem();
        }, 15000);
    }

    /**
     * Load initial activity
     */
    loadInitialActivity() {
        const mockActivity = [
            {
                id: 'activity-1',
                type: 'like',
                user: {
                    name: 'Emma Watson',
                    avatar: 'https://via.placeholder.com/24x24/42b72a/ffffff?text=EW'
                },
                action: 'liked your photo',
                timestamp: new Date(Date.now() - 2 * 60 * 1000),
                target: 'Summer sunset'
            },
            {
                id: 'activity-2',
                type: 'comment',
                user: {
                    name: 'Alex Johnson',
                    avatar: 'https://via.placeholder.com/24x24/ff6b6b/ffffff?text=AJ'
                },
                action: 'commented on your post',
                timestamp: new Date(Date.now() - 5 * 60 * 1000),
                target: 'Amazing shot!'
            },
            {
                id: 'activity-3',
                type: 'follow',
                user: {
                    name: 'Sarah Chen',
                    avatar: 'https://via.placeholder.com/24x24/9b59b6/ffffff?text=SC'
                },
                action: 'started following you',
                timestamp: new Date(Date.now() - 10 * 60 * 1000),
                target: null
            }
        ];

        this.activityFeed = mockActivity;
        this.renderActivityFeed();
    }

    /**
     * Add new activity item
     */
    addNewActivityItem() {
        const activityTypes = ['like', 'comment', 'follow', 'post'];
        const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        
        const users = [
            { name: 'Mike Rodriguez', avatar: 'https://via.placeholder.com/24x24/e67e22/ffffff?text=MR' },
            { name: 'Lisa Park', avatar: 'https://via.placeholder.com/24x24/3498db/ffffff?text=LP' },
            { name: 'Tom Wilson', avatar: 'https://via.placeholder.com/24x24/e74c3c/ffffff?text=TW' }
        ];
        
        const randomUser = users[Math.floor(Math.random() * users.length)];
        
        const actions = {
            like: 'liked your post',
            comment: 'commented on your photo',
            follow: 'started following you',
            post: 'shared a new post'
        };

        const newActivity = {
            id: `activity-${Date.now()}`,
            type: randomType,
            user: randomUser,
            action: actions[randomType],
            timestamp: new Date(),
            target: randomType === 'follow' ? null : 'Recent content'
        };

        // Add to beginning of feed
        this.activityFeed.unshift(newActivity);
        
        // Keep only last 10 items
        if (this.activityFeed.length > 10) {
            this.activityFeed = this.activityFeed.slice(0, 10);
        }

        this.renderActivityFeed();
        this.highlightNewActivity(newActivity.id);
    }

    /**
     * Render activity feed
     */
    renderActivityFeed() {
        const activityList = document.getElementById('activity-feed-list');
        if (!activityList) return;

        // Get active filters
        const activeFilters = Array.from(document.querySelectorAll('.filter-checkbox input:checked'))
            .map(cb => cb.value);

        const filteredActivity = this.activityFeed.filter(item => 
            activeFilters.includes(item.type)
        );

        if (filteredActivity.length === 0) {
            activityList.innerHTML = `
                <div class="no-activity">
                    <i class="fas fa-clock"></i>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        activityList.innerHTML = filteredActivity.map(item => `
            <div class="activity-item" id="activity-${item.id}" data-type="${item.type}">
                <img src="${item.user.avatar}" alt="${item.user.name}" class="activity-avatar">
                <div class="activity-content">
                    <div class="activity-text">
                        <strong>${item.user.name}</strong> ${item.action}
                        ${item.target ? `<span class="activity-target">"${item.target}"</span>` : ''}
                    </div>
                    <div class="activity-time">${this.app.getTimeAgo(item.timestamp)}</div>
                </div>
                <div class="activity-type-icon">
                    ${this.getActivityIcon(item.type)}
                </div>
            </div>
        `).join('');
    }

    /**
     * Get activity type icon
     */
    getActivityIcon(type) {
        const icons = {
            like: '<i class="fas fa-heart" style="color: #e74c3c;"></i>',
            comment: '<i class="fas fa-comment" style="color: #3498db;"></i>',
            follow: '<i class="fas fa-user-plus" style="color: #2ecc71;"></i>',
            post: '<i class="fas fa-plus-circle" style="color: #9b59b6;"></i>'
        };
        return icons[type] || '<i class="fas fa-circle"></i>';
    }

    /**
     * Highlight new activity item
     */
    highlightNewActivity(activityId) {
        setTimeout(() => {
            const item = document.getElementById(`activity-${activityId}`);
            if (item) {
                item.classList.add('new-activity');
                setTimeout(() => {
                    item.classList.remove('new-activity');
                }, 3000);
            }
        }, 100);
    }

    /**
     * Toggle activity filters
     */
    toggleActivityFilters() {
        const filters = document.getElementById('activity-filters');
        if (filters) {
            const isVisible = filters.style.display !== 'none';
            filters.style.display = isVisible ? 'none' : 'block';
        }
    }

    /**
     * Filter activity feed
     */
    filterActivityFeed() {
        this.renderActivityFeed();
    }

    /**
     * Refresh activity feed
     */
    refreshActivityFeed() {
        const refreshBtn = document.getElementById('activity-refresh-btn');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            icon.classList.add('fa-spin');
            
            setTimeout(() => {
                this.addNewActivityItem();
                icon.classList.remove('fa-spin');
                this.app.showToast('Activity feed refreshed', 'success');
            }, 1000);
        }
    }

    // ===== 7. SOCIAL GROUPS WIDGET =====
    
    /**
     * Initialize social groups widget
     */
    initializeSocialGroupsWidget() {
        const leftSidebar = document.querySelector('.left-sidebar');
        if (!leftSidebar) return;

        const groupsWidgetHTML = `
            <div class="groups-widget" id="groups-widget">
                <div class="groups-header">
                    <h4><i class="fas fa-users"></i> Your Groups</h4>
                    <button class="create-group-btn" id="create-group-btn" title="Create Group">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="groups-list" id="groups-list">
                    <!-- Groups will be loaded here -->
                </div>
                <div class="groups-actions">
                    <button class="discover-groups-btn" id="discover-groups-btn">
                        <i class="fas fa-compass"></i> Discover Groups
                    </button>
                </div>
            </div>
        `;

        // Insert after quick links
        const quickLinks = leftSidebar.querySelector('.quick-links');
        if (quickLinks) {
            quickLinks.insertAdjacentHTML('afterend', groupsWidgetHTML);
        } else {
            leftSidebar.insertAdjacentHTML('beforeend', groupsWidgetHTML);
        }

        this.loadUserGroups();
        this.setupGroupsWidgetListeners();
    }

    /**
     * Load user groups
     */
    loadUserGroups() {
        const mockGroups = [
            {
                id: 'group-1',
                name: 'Photography Enthusiasts',
                avatar: 'https://via.placeholder.com/40x40/42b72a/ffffff?text=📸',
                members: 2456,
                unreadCount: 3,
                lastActivity: 'Sarah shared a photo'
            },
            {
                id: 'group-2',
                name: 'Travel Buddies',
                avatar: 'https://via.placeholder.com/40x40/3498db/ffffff?text=✈️',
                members: 1789,
                unreadCount: 0,
                lastActivity: 'Alex posted about Tokyo trip'
            },
            {
                id: 'group-3',
                name: 'Digital Artists',
                avatar: 'https://via.placeholder.com/40x40/9b59b6/ffffff?text=🎨',
                members: 892,
                unreadCount: 7,
                lastActivity: 'New artwork shared'
            }
        ];

        this.userGroups = mockGroups;
        this.renderGroups();
    }

    /**
     * Render groups
     */
    renderGroups() {
        const groupsList = document.getElementById('groups-list');
        if (!groupsList) return;

        if (this.userGroups.length === 0) {
            groupsList.innerHTML = `
                <div class="no-groups">
                    <i class="fas fa-users"></i>
                    <p>No groups yet</p>
                    <p>Join groups to connect with people who share your interests</p>
                </div>
            `;
            return;
        }

        groupsList.innerHTML = this.userGroups.map(group => `
            <div class="group-item" data-group-id="${group.id}">
                <div class="group-avatar">
                    <img src="${group.avatar}" alt="${group.name}">
                    ${group.unreadCount > 0 ? `<span class="group-unread-badge">${group.unreadCount}</span>` : ''}
                </div>
                <div class="group-info">
                    <div class="group-name">${group.name}</div>
                    <div class="group-stats">${this.app.formatNumber(group.members)} members</div>
                    <div class="group-activity">${group.lastActivity}</div>
                </div>
            </div>
        `).join('');

        // Add click listeners
        document.querySelectorAll('.group-item').forEach(item => {
            item.addEventListener('click', () => {
                const groupId = item.dataset.groupId;
                this.openGroup(groupId);
            });
        });
    }

    /**
     * Setup groups widget listeners
     */
    setupGroupsWidgetListeners() {
        const createGroupBtn = document.getElementById('create-group-btn');
        const discoverGroupsBtn = document.getElementById('discover-groups-btn');

        if (createGroupBtn) {
            createGroupBtn.addEventListener('click', () => this.createGroup());
        }

        if (discoverGroupsBtn) {
            discoverGroupsBtn.addEventListener('click', () => this.discoverGroups());
        }
    }

    /**
     * Open group
     */
    openGroup(groupId) {
        const group = this.userGroups.find(g => g.id === groupId);
        if (group) {
            this.app.showToast(`Opening ${group.name}`, 'info');
            // In a real app, this would navigate to the group page
        }
    }

    /**
     * Create group
     */
    createGroup() {
        this.app.showToast('Create Group feature coming soon', 'info');
        // In a real app, this would open a create group modal
    }

    /**
     * Discover groups
     */
    discoverGroups() {
        this.app.showToast('Group discovery feature coming soon', 'info');
        // In a real app, this would show a groups discovery page
    }

    // ===== 8. ADVANCED SEARCH PANEL =====
    
    /**
     * Initialize advanced search panel
     */
    initializeAdvancedSearchPanel() {
        const globalSearch = document.getElementById('global-search');
        if (!globalSearch) return;

        // Enhanced search functionality
        this.setupAdvancedSearch();
        this.createSearchDropdown();
    }

    /**
     * Setup advanced search
     */
    setupAdvancedSearch() {
        const globalSearch = document.getElementById('global-search');
        if (!globalSearch) return;

        // Add search suggestions and history
        globalSearch.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                this.showSearchSuggestions(query);
            } else {
                this.hideSearchSuggestions();
            }
        });

        globalSearch.addEventListener('focus', () => {
            this.showSearchHistory();
        });

        globalSearch.addEventListener('blur', () => {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => {
                this.hideSearchSuggestions();
            }, 200);
        });

        globalSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch(globalSearch.value.trim());
            }
        });
    }

    /**
     * Create search dropdown
     */
    createSearchDropdown() {
        const searchBar = document.querySelector('.search-bar');
        if (!searchBar) return;

        const searchDropdown = document.createElement('div');
        searchDropdown.id = 'search-dropdown';
        searchDropdown.className = 'search-dropdown';
        searchDropdown.innerHTML = `
            <div class="search-dropdown-content">
                <div class="search-suggestions" id="search-suggestions">
                    <!-- Suggestions will be loaded here -->
                </div>
                <div class="search-filters" id="search-filters">
                    <div class="search-filter-tabs">
                        <button class="search-filter-tab active" data-filter="all">All</button>
                        <button class="search-filter-tab" data-filter="people">People</button>
                        <button class="search-filter-tab" data-filter="posts">Posts</button>
                        <button class="search-filter-tab" data-filter="hashtags">Tags</button>
                        <button class="search-filter-tab" data-filter="groups">Groups</button>
                    </div>
                </div>
            </div>
        `;

        searchBar.appendChild(searchDropdown);
        this.setupSearchDropdownListeners();
    }

    /**
     * Setup search dropdown listeners
     */
    setupSearchDropdownListeners() {
        document.querySelectorAll('.search-filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchSearchFilter(tab.dataset.filter);
            });
        });
    }

    /**
     * Show search suggestions
     */
    showSearchSuggestions(query) {
        if (this.searchCache.has(query)) {
            const cachedResults = this.searchCache.get(query);
            this.renderSearchSuggestions(cachedResults);
            this.showSearchDropdown();
            return;
        }

        // Simulate API search with mock data
        setTimeout(() => {
            const mockSuggestions = this.generateMockSearchResults(query);
            this.searchCache.set(query, mockSuggestions);
            this.renderSearchSuggestions(mockSuggestions);
            this.showSearchDropdown();
        }, 300);
    }

    /**
     * Generate mock search results
     */
    generateMockSearchResults(query) {
        const people = [
            { name: 'Emma Watson Photography', type: 'person', avatar: 'https://via.placeholder.com/32x32/42b72a/ffffff?text=EW' },
            { name: 'Alex Johnson Travel', type: 'person', avatar: 'https://via.placeholder.com/32x32/ff6b6b/ffffff?text=AJ' }
        ];

        const hashtags = [
            { name: '#photography', type: 'hashtag', posts: 24500 },
            { name: '#travel', type: 'hashtag', posts: 18200 },
            { name: '#art', type: 'hashtag', posts: 12300 }
        ];

        const posts = [
            { title: 'Beautiful sunset photography...', type: 'post', author: 'Sarah Chen' },
            { title: 'Amazing travel tips for...', type: 'post', author: 'Mike Rodriguez' }
        ];

        const groups = [
            { name: 'Photography Enthusiasts', type: 'group', members: 2456 },
            { name: 'Travel Photographers', type: 'group', members: 1789 }
        ];

        // Filter based on query
        const queryLower = query.toLowerCase();
        
        return {
            people: people.filter(p => p.name.toLowerCase().includes(queryLower)),
            hashtags: hashtags.filter(h => h.name.toLowerCase().includes(queryLower)),
            posts: posts.filter(p => p.title.toLowerCase().includes(queryLower)),
            groups: groups.filter(g => g.name.toLowerCase().includes(queryLower))
        };
    }

    /**
     * Render search suggestions
     */
    renderSearchSuggestions(results) {
        const suggestions = document.getElementById('search-suggestions');
        if (!suggestions) return;

        const hasResults = Object.values(results).some(arr => arr.length > 0);
        
        if (!hasResults) {
            suggestions.innerHTML = `
                <div class="no-search-results">
                    <i class="fas fa-search"></i>
                    <p>No results found</p>
                </div>
            `;
            return;
        }

        let html = '';

        if (results.people.length > 0) {
            html += `
                <div class="search-category">
                    <h5>People</h5>
                    ${results.people.map(person => `
                        <div class="search-result-item" data-type="person" data-id="${person.name}">
                            <img src="${person.avatar}" alt="${person.name}" class="result-avatar">
                            <div class="result-info">
                                <div class="result-name">${person.name}</div>
                                <div class="result-type">Person</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (results.hashtags.length > 0) {
            html += `
                <div class="search-category">
                    <h5>Hashtags</h5>
                    ${results.hashtags.map(hashtag => `
                        <div class="search-result-item" data-type="hashtag" data-id="${hashtag.name}">
                            <div class="hashtag-icon">#</div>
                            <div class="result-info">
                                <div class="result-name">${hashtag.name}</div>
                                <div class="result-type">${this.app.formatNumber(hashtag.posts)} posts</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (results.groups.length > 0) {
            html += `
                <div class="search-category">
                    <h5>Groups</h5>
                    ${results.groups.map(group => `
                        <div class="search-result-item" data-type="group" data-id="${group.name}">
                            <div class="group-icon"><i class="fas fa-users"></i></div>
                            <div class="result-info">
                                <div class="result-name">${group.name}</div>
                                <div class="result-type">${this.app.formatNumber(group.members)} members</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        suggestions.innerHTML = html;

        // Add click listeners to results
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                const id = item.dataset.id;
                this.selectSearchResult(type, id);
            });
        });
    }

    /**
     * Show search history
     */
    showSearchHistory() {
        // For now, just show recent searches
        const recentSearches = ['photography tips', 'travel 2024', 'digital art'];
        
        const suggestions = document.getElementById('search-suggestions');
        if (!suggestions) return;

        suggestions.innerHTML = `
            <div class="search-category">
                <h5>Recent Searches</h5>
                ${recentSearches.map(search => `
                    <div class="search-result-item recent-search" data-search="${search}">
                        <div class="search-icon"><i class="fas fa-history"></i></div>
                        <div class="result-info">
                            <div class="result-name">${search}</div>
                        </div>
                        <button class="remove-search-btn" title="Remove">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        this.showSearchDropdown();
    }

    /**
     * Show search dropdown
     */
    showSearchDropdown() {
        const dropdown = document.getElementById('search-dropdown');
        if (dropdown) {
            dropdown.classList.add('show');
        }
    }

    /**
     * Hide search suggestions
     */
    hideSearchSuggestions() {
        const dropdown = document.getElementById('search-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }

    /**
     * Switch search filter
     */
    switchSearchFilter(filter) {
        document.querySelectorAll('.search-filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });

        // Re-render current results with filter
        const globalSearch = document.getElementById('global-search');
        if (globalSearch && globalSearch.value.trim().length >= 2) {
            this.showSearchSuggestions(globalSearch.value.trim());
        }
    }

    /**
     * Select search result
     */
    selectSearchResult(type, id) {
        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.value = id;
        }
        
        this.hideSearchSuggestions();
        this.performSearch(id);
    }

    /**
     * Perform search
     */
    performSearch(query) {
        if (!query) return;

        this.app.showToast(`Searching for "${query}"...`, 'info');
        
        // In a real app, this would navigate to search results page
        // or filter the current view based on the search query
        
        // Add to search history
        this.addToSearchHistory(query);
    }

    /**
     * Add to search history
     */
    addToSearchHistory(query) {
        // In a real app, this would save to localStorage or server
        console.log('Added to search history:', query);
    }

    // ===== MISSING HOME SCREEN INTERFACES =====

    // ===== 1. FULL STORY VIEWER =====
    initializeFullStoryViewer() {
        // Enhanced story viewer with full-screen controls
        this.storyViewerFeatures = {
            autoPlay: true,
            showViewers: false,
            enableReactions: true,
            enableReplies: true
        };
    }

    // ===== 2. STORY CREATION CAMERA =====
    initializeStoryCameraCreation() {
        this.setupStoryCameraInterface();
    }

    setupStoryCameraInterface() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#create-story-camera')) {
                this.showStoryCameraModal();
            }
        });
    }

    showStoryCameraModal() {
        const cameraModal = document.createElement('div');
        cameraModal.id = 'story-camera-modal';
        cameraModal.className = 'modal story-camera-modal active';
        cameraModal.innerHTML = `
            <div class="camera-interface">
                <div class="camera-header">
                    <button class="camera-close-btn" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                    <h3>Create Story</h3>
                    <button class="camera-settings-btn">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
                <div class="camera-preview-area">
                    <video id="story-camera-video" autoplay playsinline></video>
                    <canvas id="story-camera-canvas" style="display: none;"></canvas>
                    <div class="camera-filters-overlay">
                        <div class="filters-list" id="story-filters">
                            <button class="filter-btn active" data-filter="none">None</button>
                            <button class="filter-btn" data-filter="vintage">Vintage</button>
                            <button class="filter-btn" data-filter="bright">Bright</button>
                            <button class="filter-btn" data-filter="dark">Dark</button>
                            <button class="filter-btn" data-filter="sepia">Sepia</button>
                        </div>
                    </div>
                </div>
                <div class="camera-controls">
                    <div class="camera-mode-selector">
                        <button class="camera-mode-btn active" data-mode="photo">
                            <i class="fas fa-camera"></i>
                        </button>
                        <button class="camera-mode-btn" data-mode="video">
                            <i class="fas fa-video"></i>
                        </button>
                    </div>
                    <button class="capture-btn" id="story-capture-btn">
                        <div class="capture-circle"></div>
                    </button>
                    <button class="camera-flip-btn" id="camera-flip-btn">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                <div class="story-text-tools" id="story-text-tools" style="display: none;">
                    <input type="text" placeholder="Add text..." class="story-text-input">
                    <div class="text-style-controls">
                        <button class="text-color-btn" style="background: #fff;" data-color="#fff"></button>
                        <button class="text-color-btn" style="background: #000;" data-color="#000"></button>
                        <button class="text-color-btn" style="background: #ff6b6b;" data-color="#ff6b6b"></button>
                        <button class="text-color-btn" style="background: #4ecdc4;" data-color="#4ecdc4"></button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(cameraModal);
        this.setupStoryCameraEvents(cameraModal);
    }

    setupStoryCameraEvents(modal) {
        // Initialize camera
        this.initializeStoryCamera();
        
        // Filter selection
        modal.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.applyStoryFilter(btn.dataset.filter);
            });
        });

        // Capture button
        modal.querySelector('#story-capture-btn').addEventListener('click', () => {
            this.captureStoryContent();
        });
    }

    async initializeStoryCamera() {
        try {
            const video = document.getElementById('story-camera-video');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' }, 
                audio: false 
            });
            video.srcObject = stream;
        } catch (error) {
            console.error('Camera access failed:', error);
            this.app.showToast('Camera access denied', 'error');
        }
    }

    applyStoryFilter(filterName) {
        const video = document.getElementById('story-camera-video');
        if (!video) return;
        
        const filters = {
            'none': 'none',
            'vintage': 'sepia(0.5) contrast(1.2)',
            'bright': 'brightness(1.2) contrast(1.1)',
            'dark': 'brightness(0.8) contrast(1.3)',
            'sepia': 'sepia(1)'
        };
        
        video.style.filter = filters[filterName] || 'none';
    }

    captureStoryContent() {
        this.app.showToast('Story content captured!', 'success');
        document.getElementById('story-camera-modal')?.remove();
    }

    // ===== 3. POST COMMENTS THREAD =====
    initializePostCommentsThread() {
        // Enhanced thread view for post comments
        this.commentsThreadFeatures = {
            infiniteScroll: true,
            nestedReplies: true,
            realTimeUpdates: true,
            moderationTools: true
        };
    }

    // ===== 4. POST REACTIONS PANEL =====
    initializePostReactionsPanel() {
        this.setupAdvancedReactions();
    }

    setupAdvancedReactions() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.post-reactions-btn')) {
                const postElement = e.target.closest('.feed-post');
                const postId = postElement?.dataset.postId;
                if (postId) {
                    this.showReactionsPanel(postId, e.target.closest('.post-reactions-btn'));
                }
            }
        });
    }

    showReactionsPanel(postId, triggerElement) {
        const reactionsPanel = document.createElement('div');
        reactionsPanel.id = 'post-reactions-panel';
        reactionsPanel.className = 'reactions-panel';
        reactionsPanel.innerHTML = `
            <div class="reactions-panel-content">
                <div class="reactions-header">
                    <span>React to this post</span>
                </div>
                <div class="reactions-grid">
                    <button class="reaction-option" data-reaction="like" title="Like">
                        <span class="reaction-emoji">👍</span>
                        <span class="reaction-label">Like</span>
                    </button>
                    <button class="reaction-option" data-reaction="love" title="Love">
                        <span class="reaction-emoji">❤️</span>
                        <span class="reaction-label">Love</span>
                    </button>
                    <button class="reaction-option" data-reaction="laugh" title="Haha">
                        <span class="reaction-emoji">😂</span>
                        <span class="reaction-label">Haha</span>
                    </button>
                    <button class="reaction-option" data-reaction="wow" title="Wow">
                        <span class="reaction-emoji">😮</span>
                        <span class="reaction-label">Wow</span>
                    </button>
                    <button class="reaction-option" data-reaction="sad" title="Sad">
                        <span class="reaction-emoji">😢</span>
                        <span class="reaction-label">Sad</span>
                    </button>
                    <button class="reaction-option" data-reaction="angry" title="Angry">
                        <span class="reaction-emoji">😡</span>
                        <span class="reaction-label">Angry</span>
                    </button>
                </div>
            </div>
        `;

        // Position panel
        const rect = triggerElement.getBoundingClientRect();
        reactionsPanel.style.position = 'fixed';
        reactionsPanel.style.bottom = (window.innerHeight - rect.top + 10) + 'px';
        reactionsPanel.style.left = rect.left + 'px';
        reactionsPanel.style.zIndex = '10000';

        document.body.appendChild(reactionsPanel);

        // Setup reaction selection
        reactionsPanel.addEventListener('click', (e) => {
            const reactionOption = e.target.closest('.reaction-option');
            if (reactionOption) {
                const reaction = reactionOption.dataset.reaction;
                this.addPostReaction(postId, reaction);
                reactionsPanel.remove();
            }
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
            if (document.body.contains(reactionsPanel)) {
                reactionsPanel.remove();
            }
        }, 5000);
    }

    addPostReaction(postId, reaction) {
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (!postElement) return;

        this.app.showToast(`Reacted with ${reaction}`, 'success');
        
        // Update reaction count in post
        const reactionBtn = postElement.querySelector('.post-reactions-btn');
        if (reactionBtn) {
            reactionBtn.classList.add('reacted');
        }
    }

    // ===== 5. SHARE POST MODAL =====
    initializeSharePostModal() {
        this.setupPostSharing();
    }

    setupPostSharing() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.share-btn')) {
                const postElement = e.target.closest('.feed-post');
                const postId = postElement?.dataset.postId;
                if (postId) {
                    this.showShareModal(postId);
                }
            }
        });
    }

    showShareModal(postId) {
        const shareModal = document.createElement('div');
        shareModal.id = 'share-post-modal';
        shareModal.className = 'modal share-modal active';
        shareModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Share Post</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="share-options">
                        <div class="share-section">
                            <h4>Share to ConnectHub</h4>
                            <div class="share-internal-options">
                                <button class="share-option" data-action="story">
                                    <i class="fas fa-clock"></i>
                                    <span>Share to Story</span>
                                </button>
                                <button class="share-option" data-action="message">
                                    <i class="fas fa-paper-plane"></i>
                                    <span>Send in Message</span>
                                </button>
                                <button class="share-option" data-action="group">
                                    <i class="fas fa-users"></i>
                                    <span>Share to Group</span>
                                </button>
                            </div>
                        </div>
                        <div class="share-section">
                            <h4>Share to Other Apps</h4>
                            <div class="share-external-options">
                                <button class="share-option external" data-platform="facebook">
                                    <i class="fab fa-facebook"></i>
                                    <span>Facebook</span>
                                </button>
                                <button class="share-option external" data-platform="twitter">
                                    <i class="fab fa-twitter"></i>
                                    <span>Twitter</span>
                                </button>
                                <button class="share-option external" data-platform="instagram">
                                    <i class="fab fa-instagram"></i>
                                    <span>Instagram</span>
                                </button>
                                <button class="share-option external" data-platform="whatsapp">
                                    <i class="fab fa-whatsapp"></i>
                                    <span>WhatsApp</span>
                                </button>
                            </div>
                        </div>
                        <div class="share-section">
                            <h4>Copy Link</h4>
                            <div class="copy-link-container">
                                <input type="text" value="https://connecthub.com/posts/${postId}" readonly class="copy-link-input">
                                <button class="copy-link-btn" onclick="this.previousElementSibling.select(); navigator.clipboard.writeText(this.previousElementSibling.value)">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(shareModal);
        this.setupShareModalEvents(shareModal, postId);
    }

    setupShareModalEvents(modal, postId) {
        modal.querySelectorAll('.share-option').forEach(option => {
            option.addEventListener('click', () => {
                const action = option.dataset.action;
                const platform = option.dataset.platform;
                
                if (action) {
                    this.handleInternalShare(postId, action);
                } else if (platform) {
                    this.handleExternalShare(postId, platform);
                }
                
                modal.remove();
            });
        });
    }

    handleInternalShare(postId, shareType) {
        const messages = {
            story: 'Post shared to your story',
            message: 'Opening message composer...',
            group: 'Select a group to share with'
        };
        
        this.app.showToast(messages[shareType], 'success');
    }

    handleExternalShare(postId, platform) {
        const url = `https://connecthub.com/posts/${postId}`;
        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
            instagram: url,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(url)}`
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    }

    // ===== 6. CONTENT FILTER SETTINGS =====
    initializeContentFilterSettings() {
        this.setupContentFilters();
    }

    setupContentFilters() {
        // Add filter button to feed navigation
        const feedNav = document.querySelector('.feed-nav');
        if (feedNav) {
            const filterBtn = document.createElement('button');
            filterBtn.className = 'feed-filter-btn';
            filterBtn.innerHTML = '<i class="fas fa-filter"></i>';
            filterBtn.title = 'Content Filters';
            filterBtn.addEventListener('click', () => this.showContentFilterModal());
            feedNav.appendChild(filterBtn);
        }
    }

    showContentFilterModal() {
        const filterModal = document.createElement('div');
        filterModal.id = 'content-filter-modal';
        filterModal.className = 'modal content-filter-modal active';
        filterModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Content Filter Settings</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="filter-categories">
                        <div class="filter-category">
                            <h4>Content Types</h4>
                            <label class="filter-toggle">
                                <input type="checkbox" checked> Photos
                            </label>
                            <label class="filter-toggle">
                                <input type="checkbox" checked> Videos
                            </label>
                            <label class="filter-toggle">
                                <input type="checkbox" checked> Text Posts
                            </label>
                            <label class="filter-toggle">
                                <input type="checkbox"> Live Streams
                            </label>
                        </div>
                        <div class="filter-category">
                            <h4>Topics</h4>
                            <div class="topic-tags">
                                <button class="topic-tag active" data-topic="all">All</button>
                                <button class="topic-tag" data-topic="photography">Photography</button>
                                <button class="topic-tag" data-topic="travel">Travel</button>
                                <button class="topic-tag" data-topic="art">Art</button>
                                <button class="topic-tag" data-topic="technology">Tech</button>
                            </div>
                        </div>
                        <div class="filter-category">
                            <h4>Sources</h4>
                            <label class="filter-toggle">
                                <input type="checkbox" checked> Friends
                            </label>
                            <label class="filter-toggle">
                                <input type="checkbox" checked> Following
                            </label>
                            <label class="filter-toggle">
                                <input type="checkbox"> Suggested
                            </label>
                            <label class="filter-toggle">
                                <input type="checkbox"> Popular
                            </label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="homeUI.saveContentFilters(); this.closest('.modal').remove();">Save Filters</button>
                </div>
            </div>
        `;

        document.body.appendChild(filterModal);
    }

    saveContentFilters() {
        this.app.showToast('Content filters saved', 'success');
    }

    // ===== 7. LIVE ACTIVITY NOTIFICATION =====
    initializeLiveActivityNotification() {
        this.setupLiveNotifications();
    }

    setupLiveNotifications() {
        // Simulate live notifications
        setInterval(() => {
            this.showLiveNotification();
        }, 30000); // Every 30 seconds
    }

    showLiveNotification() {
        const notification = document.createElement('div');
        notification.className = 'live-activity-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-heart"></i>
                </div>
                <div class="notification-text">
                    <strong>Emma Watson</strong> liked your photo
                </div>
                <button class="notification-close" onclick="this.closest('.live-activity-notification').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        const container = document.querySelector('.notifications-container') || document.body;
        container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // ===== 8. POST EDIT INTERFACE =====
    initializePostEditInterface() {
        this.setupPostEditing();
    }

    setupPostEditing() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-post-btn')) {
                const postElement = e.target.closest('.feed-post');
                const postId = postElement?.dataset.postId;
                if (postId) {
                    this.showPostEditModal(postId);
                }
            }
        });
    }

    showPostEditModal(postId) {
        const editModal = document.createElement('div');
        editModal.id = 'post-edit-modal';
        editModal.className = 'modal post-edit-modal active';
        editModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Post</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="post-edit-content">
                        <textarea class="edit-post-text" placeholder="What's on your mind?" rows="4">Amazing sunset from yesterday's hike! 🌅 #photography #nature</textarea>
                        <div class="edit-post-privacy">
                            <label for="edit-privacy">Privacy:</label>
                            <select id="edit-privacy">
                                <option value="public">Public</option>
                                <option value="friends">Friends</option>
                                <option value="private">Only Me</option>
                            </select>
                        </div>
                        <div class="edit-post-options">
                            <label class="edit-option">
                                <input type="checkbox" checked> Allow comments
                            </label>
                            <label class="edit-option">
                                <input type="checkbox" checked> Allow reactions
                            </label>
                            <label class="edit-option">
                                <input type="checkbox"> Featured post
                            </label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="homeUI.savePostEdit('${postId}'); this.closest('.modal').remove();">Save Changes</button>
                </div>
            </div>
        `;

        document.body.appendChild(editModal);
    }

    savePostEdit(postId) {
        this.app.showToast('Post updated successfully', 'success');
    }

    // ===== 9. POST REPORT MODAL =====
    initializePostReportModal() {
        this.setupPostReporting();
    }

    setupPostReporting() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.report-post-btn')) {
                const postElement = e.target.closest('.feed-post');
                const postId = postElement?.dataset.postId;
                if (postId) {
                    this.showReportModal(postId);
                }
            }
        });
    }

    showReportModal(postId) {
        const reportModal = document.createElement('div');
        reportModal.id = 'post-report-modal';
        reportModal.className = 'modal report-modal active';
        reportModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Report Post</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="report-reasons">
                        <h4>Why are you reporting this post?</h4>
                        <div class="reason-options">
                            <label class="reason-option">
                                <input type="radio" name="report-reason" value="spam">
                                <span class="reason-text">
                                    <strong>Spam</strong>
                                    <small>Repetitive or irrelevant content</small>
                                </span>
                            </label>
                            <label class="reason-option">
                                <input type="radio" name="report-reason" value="harassment">
                                <span class="reason-text">
                                    <strong>Harassment</strong>
                                    <small>Bullying or targeted harassment</small>
                                </span>
                            </label>
                            <label class="reason-option">
                                <input type="radio" name="report-reason" value="inappropriate">
                                <span class="reason-text">
                                    <strong>Inappropriate Content</strong>
                                    <small>Violent, graphic or sexual content</small>
                                </span>
                            </label>
                            <label class="reason-option">
                                <input type="radio" name="report-reason" value="false-info">
                                <span class="reason-text">
                                    <strong>False Information</strong>
                                    <small>Misleading or false content</small>
                                </span>
                            </label>
                            <label class="reason-option">
                                <input type="radio" name="report-reason" value="copyright">
                                <span class="reason-text">
                                    <strong>Copyright Violation</strong>
                                    <small>Uses my content without permission</small>
                                </span>
                            </label>
                        </div>
                        <div class="additional-info">
                            <label for="report-details">Additional details (optional):</label>
                            <textarea id="report-details" rows="3" placeholder="Provide more context..."></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-danger" onclick="homeUI.submitReport('${postId}'); this.closest('.modal').remove();">Submit Report</button>
                </div>
            </div>
        `;

        document.body.appendChild(reportModal);
    }

    submitReport(postId) {
        this.app.showToast('Report submitted. Thank you for helping keep ConnectHub safe.', 'success');
    }

    // ===== 10. HASHTAG BROWSE SCREEN =====
    initializeHashtagBrowseScreen() {
        this.setupHashtagBrowsing();
    }

    setupHashtagBrowsing() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.hashtag') || e.target.closest('.trend-name')) {
                const hashtag = e.target.textContent.includes('#') ? 
                    e.target.textContent : '#' + e.target.textContent.replace('#', '');
                this.showHashtagBrowseModal(hashtag);
            }
        });
    }

    showHashtagBrowseModal(hashtag) {
        const browseModal = document.createElement('div');
        browseModal.id = 'hashtag-browse-modal';
        browseModal.className = 'modal hashtag-browse-modal active';
        browseModal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>${hashtag}</h3>
                    <div class="hashtag-stats">
                        <span>24.5K posts</span>
                        <span>•</span>
                        <span>+12% this week</span>
                    </div>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="hashtag-browse-content">
                        <div class="hashtag-browse-header">
                            <div class="browse-tabs">
                                <button class="browse-tab active" data-tab="top">Top Posts</button>
                                <button class="browse-tab" data-tab="recent">Recent</button>
                                <button class="browse-tab" data-tab="people">People</button>
                            </div>
                            <div class="hashtag-actions">
                                <button class="follow-hashtag-btn">
                                    <i class="fas fa-plus"></i> Follow
                                </button>
                            </div>
                        </div>
                        <div class="hashtag-content-grid" id="hashtag-content-grid">
                            ${this.generateHashtagPosts(hashtag)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(browseModal);
        this.setupHashtagBrowseEvents(browseModal, hashtag);
    }

    generateHashtagPosts(hashtag) {
        const mockPosts = [
            { image: 'https://source.unsplash.com/300x300/?photography,sunset', likes: 234, comments: 45 },
            { image: 'https://source.unsplash.com/300x300/?nature,landscape', likes: 189, comments: 23 },
            { image: 'https://source.unsplash.com/300x300/?travel,beach', likes: 156, comments: 32 }
        ];

        return mockPosts.map((post, index) => `
            <div class="hashtag-post-item" data-post-index="${index}">
                <img src="${post.image}" alt="Hashtag post" class="hashtag-post-image">
                <div class="hashtag-post-overlay">
                    <div class="hashtag-post-stats">
                        <span><i class="fas fa-heart"></i> ${post.likes}</span>
                        <span><i class="fas fa-comment"></i> ${post.comments}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupHashtagBrowseEvents(modal, hashtag) {
        // Tab switching
        modal.querySelectorAll('.browse-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                modal.querySelectorAll('.browse-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.loadHashtagContent(hashtag, tab.dataset.tab);
            });
        });

        // Follow hashtag
        modal.querySelector('.follow-hashtag-btn').addEventListener('click', () => {
            this.followHashtag(hashtag);
        });
    }

    loadHashtagContent(hashtag, tab) {
        const contentGrid = document.getElementById('hashtag-content-grid');
        if (!contentGrid) return;

        switch (tab) {
            case 'top':
                contentGrid.innerHTML = this.generateHashtagPosts(hashtag);
                break;
            case 'recent':
                contentGrid.innerHTML = this.generateHashtagPosts(hashtag);
                break;
            case 'people':
                contentGrid.innerHTML = this.generateHashtagPeople(hashtag);
                break;
        }
    }

    generateHashtagPeople(hashtag) {
        const people = [
            { name: 'Emma Watson', avatar: 'https://via.placeholder.com/80x80/42b72a/ffffff?text=EW', followers: '2.3M' },
            { name: 'Alex Johnson', avatar: 'https://via.placeholder.com/80x80/ff6b6b/ffffff?text=AJ', followers: '856K' }
        ];

        return people.map(person => `
            <div class="hashtag-person-item">
                <img src="${person.avatar}" alt="${person.name}" class="person-avatar">
                <div class="person-info">
                    <h4>${person.name}</h4>
                    <p>${person.followers} followers</p>
                    <button class="follow-person-btn">Follow</button>
                </div>
            </div>
        `).join('');
    }

    followHashtag(hashtag) {
        this.app.showToast(`Now following ${hashtag}`, 'success');
    }

    // ===== 11. MENTION SUGGESTIONS =====
    initializeMentionSuggestions() {
        this.setupMentionAutocomplete();
    }

    setupMentionAutocomplete() {
        // Enhanced mention suggestions for post creation
        document.addEventListener('input', (e) => {
            if (e.target.matches('.post-text, #comment-input, .reply-input')) {
                this.handleMentionInput(e.target);
            }
        });
    }

    handleMentionInput(input) {
        const text = input.value || input.textContent;
        const cursorPos = this.getCursorPosition(input);
        const textBeforeCursor = text.substring(0, cursorPos);
        
        // Check for @mentions
        const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
        if (mentionMatch) {
            this.showMentionSuggestionsList(mentionMatch[1], input);
            return;
        }

        this.hideMentionSuggestions();
    }

    showMentionSuggestionsList(query, inputElement) {
        const suggestions = this.getMentionSuggestions(query);
        
        let suggestionsContainer = document.getElementById('mention-suggestions-popup');
        if (!suggestionsContainer) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.id = 'mention-suggestions-popup';
            suggestionsContainer.className = 'mention-suggestions-popup';
            document.body.appendChild(suggestionsContainer);
        }

        if (suggestions.length === 0) {
            this.hideMentionSuggestions();
            return;
        }

        suggestionsContainer.innerHTML = `
            <div class="mention-suggestions-content">
                <div class="suggestions-header">Mention someone</div>
                <div class="mention-suggestions-list">
                    ${suggestions.map(user => `
                        <div class="mention-suggestion-item" data-user-id="${user.id}" data-username="${user.username}">
                            <img src="${user.avatar}" alt="${user.name}" class="mention-user-avatar">
                            <div class="mention-user-info">
                                <div class="mention-user-name">${user.name}</div>
                                <div class="mention-username">@${user.username}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Position near input
        const rect = inputElement.getBoundingClientRect();
        suggestionsContainer.style.position = 'fixed';
        suggestionsContainer.style.top = (rect.bottom + 5) + 'px';
        suggestionsContainer.style.left = rect.left + 'px';
        suggestionsContainer.style.zIndex = '10000';
        suggestionsContainer.style.display = 'block';

        this.setupMentionSuggestionEvents(suggestionsContainer, inputElement);
    }

    setupMentionSuggestionEvents(container, inputElement) {
        container.addEventListener('click', (e) => {
            const item = e.target.closest('.mention-suggestion-item');
            if (item) {
                const username = item.dataset.username;
                this.insertMention(inputElement, username);
                this.hideMentionSuggestions();
            }
        });
    }

    insertMention(inputElement, username) {
        const text = inputElement.value || inputElement.textContent;
        const newText = text.replace(/@\w*$/, `@${username} `);
        
        if (inputElement.value !== undefined) {
            inputElement.value = newText;
        } else {
            inputElement.textContent = newText;
        }
        
        inputElement.focus();
    }

    getMentionSuggestions(query) {
        const mockUsers = [
            { id: 'user-1', name: 'Emma Watson', username: 'emmawatson', avatar: 'https://via.placeholder.com/32x32/42b72a/ffffff?text=EW' },
            { id: 'user-2', name: 'Alex Johnson', username: 'alexj', avatar: 'https://via.placeholder.com/32x32/ff6b6b/ffffff?text=AJ' },
            { id: 'user-3', name: 'Sarah Chen', username: 'sarahc', avatar: 'https://via.placeholder.com/32x32/9b59b6/ffffff?text=SC' },
            { id: 'user-4', name: 'Mike Rodriguez', username: 'miker', avatar: 'https://via.placeholder.com/32x32/e67e22/ffffff?text=MR' }
        ];

        return mockUsers.filter(user => 
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.username.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
    }

    hideMentionSuggestions() {
        const container = document.getElementById('mention-suggestions-popup');
        if (container) {
            container.style.display = 'none';
        }
    }

    getCursorPosition(element) {
        if (element.value !== undefined) {
            return element.selectionStart;
        }
        
        let caretOffset = 0;
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
        return caretOffset;
    }

    // ===== 12. POST SCHEDULING INTERFACE =====
    initializePostSchedulingInterface() {
        this.setupPostScheduling();
    }

    setupPostScheduling() {
        // Add schedule option to post composer
        document.addEventListener('click', (e) => {
            if (e.target.closest('#schedule-post-btn')) {
                this.showPostSchedulingModal();
            }
        });
    }

    showPostSchedulingModal() {
        const scheduleModal = document.createElement('div');
        scheduleModal.id = 'post-scheduling-modal';
        scheduleModal.className = 'modal scheduling-modal active';
        scheduleModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Schedule Post</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="scheduling-interface">
                        <div class="schedule-options">
                            <h4>When do you want to publish?</h4>
                            <div class="schedule-time-options">
                                <label class="schedule-option">
                                    <input type="radio" name="schedule-type" value="now" checked>
                                    <span>Publish now</span>
                                </label>
                                <label class="schedule-option">
                                    <input type="radio" name="schedule-type" value="custom">
                                    <span>Schedule for later</span>
                                </label>
                                <label class="schedule-option">
                                    <input type="radio" name="schedule-type" value="optimal">
                                    <span>Best time (AI suggested)</span>
                                </label>
                            </div>
                        </div>
                        <div class="custom-schedule-section" id="custom-schedule" style="display: none;">
                            <div class="datetime-picker">
                                <label for="schedule-datetime">Date and Time:</label>
                                <input type="datetime-local" id="schedule-datetime" class="datetime-input">
                            </div>
                            <div class="timezone-display">
                                <i class="fas fa-globe"></i>
                                <span>Your timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                            </div>
                        </div>
                        <div class="optimal-schedule-section" id="optimal-schedule" style="display: none;">
                            <div class="ai-suggestions">
                                <h5>🤖 AI Recommended Times</h5>
                                <div class="optimal-times">
                                    <button class="optimal-time-btn" data-time="today-6pm">
                                        <div class="time-slot">Today 6:00 PM</div>
                                        <div class="engagement-score">High engagement expected</div>
                                    </button>
                                    <button class="optimal-time-btn" data-time="tomorrow-9am">
                                        <div class="time-slot">Tomorrow 9:00 AM</div>
                                        <div class="engagement-score">Peak audience activity</div>
                                    </button>
                                    <button class="optimal-time-btn" data-time="weekend">
                                        <div class="time-slot">Saturday 2:00 PM</div>
                                        <div class="engagement-score">Weekend boost</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="scheduled-posts-manager">
                            <h5>Upcoming Scheduled Posts</h5>
                            <div class="scheduled-posts-list">
                                <div class="scheduled-post-preview">
                                    <div class="scheduled-post-content">
                                        <p>"Weekend photography session! 📸"</p>
                                        <small>Tomorrow at 9:00 AM</small>
                                    </div>
                                    <div class="scheduled-post-actions">
                                        <button class="edit-scheduled-btn">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="delete-scheduled-btn">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="homeUI.saveScheduledPost(); this.closest('.modal').remove();">Schedule Post</button>
                </div>
            </div>
        `;

        document.body.appendChild(scheduleModal);
        this.setupPostSchedulingEvents(scheduleModal);
    }

    setupPostSchedulingEvents(modal) {
        const scheduleTypeRadios = modal.querySelectorAll('input[name="schedule-type"]');
        const customSection = modal.querySelector('#custom-schedule');
        const optimalSection = modal.querySelector('#optimal-schedule');

        scheduleTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                const scheduleType = radio.value;
                
                // Hide all sections
                customSection.style.display = 'none';
                optimalSection.style.display = 'none';
                
                // Show relevant section
                if (scheduleType === 'custom') {
                    customSection.style.display = 'block';
                } else if (scheduleType === 'optimal') {
                    optimalSection.style.display = 'block';
                }
            });
        });

        // Setup optimal time selection
        modal.querySelectorAll('.optimal-time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.optimal-time-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    }

    saveScheduledPost() {
        this.app.showToast('Post scheduled successfully!', 'success');
    }

    /**
     * Cleanup method
     */
    destroy() {
        // Clean up timers and event listeners
        if (this.storyTimer) {
            clearTimeout(this.storyTimer);
        }
        
        if (this.activityInterval) {
            clearInterval(this.activityInterval);
        }
        
        // Clear caches
        this.commentsCache.clear();
        this.searchCache.clear();
        
        console.log('Home UI Components cleaned up');
    }
}

// Export for use
window.HomeUIComponents = HomeUIComponents;
