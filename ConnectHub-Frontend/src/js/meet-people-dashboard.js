/**
 * ConnectHub - Meet People Dashboard (Complete Redesign)
 * A revolutionary people discovery experience with modern design and advanced features
 * Features: AI-powered matching, video profiles, instant connections, and social discovery
 */

class MeetPeopleDashboard {
    constructor(app) {
        this.app = app || window.app || { showToast: (msg, type) => console.log(msg) };
        this.currentView = 'discover';
        this.profiles = [];
        this.filters = {
            ageRange: [18, 50],
            distance: 25,
            interests: [],
            verified: false,
            online: false
        };
        this.userProfile = {
            name: 'John Doe',
            age: 28,
            bio: 'Passionate traveler and tech enthusiast',
            interests: ['Travel', 'Technology', 'Photography', 'Music']
        };
        
        this.init();
    }

    init() {
        console.log('Initializing redesigned Meet People Dashboard...');
        this.createDashboardHTML();
        this.setupEventListeners();
        this.loadProfiles();
        console.log('Meet People Dashboard redesigned and ready');
    }

    /**
     * Create the revolutionary new dashboard HTML structure
     */
    createDashboardHTML() {
        const dashboardHTML = `
            <div id="meet-people-dashboard" class="meet-people-modal-new">
                <div class="modal-backdrop-new" onclick="meetPeopleDashboard.closeDashboard()"></div>
                
                <div class="meet-people-container-new">
                    <!-- Header Section -->
                    <header class="dashboard-header-new">
                        <div class="header-left">
                            <div class="app-logo">
                                <div class="logo-icon">
                                    <i class="fas fa-heart"></i>
                                    <div class="heartbeat-animation"></div>
                                </div>
                                <div class="logo-text">
                                    <h1>ConnectHub</h1>
                                    <span>Meet Amazing People</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="header-center">
                            <div class="live-stats">
                                <div class="stat-bubble">
                                    <div class="stat-icon">🌟</div>
                                    <div class="stat-data">
                                        <span class="stat-number">2.4M</span>
                                        <span class="stat-label">Active Users</span>
                                    </div>
                                </div>
                                <div class="stat-bubble">
                                    <div class="stat-icon">💫</div>
                                    <div class="stat-data">
                                        <span class="stat-number">156K</span>
                                        <span class="stat-label">Connections Today</span>
                                    </div>
                                </div>
                                <div class="stat-bubble pulse">
                                    <div class="stat-icon">🔥</div>
                                    <div class="stat-data">
                                        <span class="stat-number">89%</span>
                                        <span class="stat-label">Match Success</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="header-right">
                            <button class="header-btn" onclick="meetPeopleDashboard.openFilters()" title="Filters">
                                <i class="fas fa-sliders-h"></i>
                                <span class="btn-label">Filters</span>
                            </button>
                            <button class="header-btn" onclick="meetPeopleDashboard.openNotifications()" title="Notifications">
                                <i class="fas fa-bell"></i>
                                <span class="notification-badge">3</span>
                            </button>
                            <button class="close-btn" onclick="meetPeopleDashboard.closeDashboard()" title="Close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </header>

                    <!-- Navigation Pills -->
                    <nav class="nav-pills">
                        <button class="pill active" data-view="discover" onclick="meetPeopleDashboard.switchView('discover')">
                            <i class="fas fa-compass"></i>
                            <span>Discover</span>
                            <div class="pill-indicator"></div>
                        </button>
                        <button class="pill" data-view="video" onclick="meetPeopleDashboard.switchView('video')">
                            <i class="fas fa-video"></i>
                            <span>Video Profiles</span>
                            <div class="pill-indicator"></div>
                        </button>
                        <button class="pill" data-view="nearby" onclick="meetPeopleDashboard.switchView('nearby')">
                            <i class="fas fa-location-arrow"></i>
                            <span>Nearby</span>
                            <div class="pill-indicator"></div>
                        </button>
                        <button class="pill" data-view="trending" onclick="meetPeopleDashboard.switchView('trending')">
                            <i class="fas fa-fire-alt"></i>
                            <span>Trending</span>
                            <div class="pill-indicator"></div>
                        </button>
                        <button class="pill" data-view="matches" onclick="meetPeopleDashboard.switchView('matches')">
                            <i class="fas fa-users"></i>
                            <span>My Matches</span>
                            <span class="match-count">12</span>
                            <div class="pill-indicator"></div>
                        </button>
                    </nav>

                    <!-- Main Content -->
                    <main class="dashboard-main">
                        <!-- Discover View -->
                        <div class="view-container active" id="discover-view">
                            <div class="discover-layout">
                                <div class="profile-cards-container">
                                    <div class="profile-stack" id="profile-stack">
                                        <!-- Profile cards will be dynamically loaded -->
                                    </div>
                                    
                                    <div class="action-controls">
                                        <button class="action-btn pass" onclick="meetPeopleDashboard.passProfile()" title="Pass">
                                            <i class="fas fa-times"></i>
                                        </button>
                                        <button class="action-btn superlike" onclick="meetPeopleDashboard.superLike()" title="Super Like">
                                            <i class="fas fa-star"></i>
                                        </button>
                                        <button class="action-btn like" onclick="meetPeopleDashboard.likeProfile()" title="Like">
                                            <i class="fas fa-heart"></i>
                                        </button>
                                        <button class="action-btn boost" onclick="meetPeopleDashboard.boostProfile()" title="Boost">
                                            <i class="fas fa-rocket"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="sidebar-info">
                                    <div class="quick-stats">
                                        <h3>Today's Activity</h3>
                                        <div class="activity-grid">
                                            <div class="activity-item">
                                                <div class="activity-icon">👁️</div>
                                                <div class="activity-text">
                                                    <span class="activity-number">47</span>
                                                    <span class="activity-label">Profile Views</span>
                                                </div>
                                            </div>
                                            <div class="activity-item">
                                                <div class="activity-icon">💕</div>
                                                <div class="activity-text">
                                                    <span class="activity-number">23</span>
                                                    <span class="activity-label">Likes Received</span>
                                                </div>
                                            </div>
                                            <div class="activity-item">
                                                <div class="activity-icon">⭐</div>
                                                <div class="activity-text">
                                                    <span class="activity-number">8</span>
                                                    <span class="activity-label">Super Likes</span>
                                                </div>
                                            </div>
                                            <div class="activity-item">
                                                <div class="activity-icon">💬</div>
                                                <div class="activity-text">
                                                    <span class="activity-number">12</span>
                                                    <span class="activity-label">New Messages</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="discovery-tips">
                                        <h3>💡 Discovery Tips</h3>
                                        <div class="tip-card">
                                            <div class="tip-icon">🎯</div>
                                            <p>Use filters to find people with similar interests</p>
                                        </div>
                                        <div class="tip-card">
                                            <div class="tip-icon">🕐</div>
                                            <p>Best time to find active users: 6-9 PM</p>
                                        </div>
                                        <div class="tip-card">
                                            <div class="tip-icon">📸</div>
                                            <p>Profiles with videos get 3x more matches</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Video Profiles View -->
                        <div class="view-container" id="video-view">
                            <div class="video-grid" id="video-grid">
                                <!-- Video profiles will be loaded here -->
                            </div>
                        </div>

                        <!-- Nearby View -->
                        <div class="view-container" id="nearby-view">
                            <div class="nearby-header">
                                <div class="location-display">
                                    <div class="location-icon">
                                        <i class="fas fa-map-marker-alt"></i>
                                    </div>
                                    <div class="location-info">
                                        <h3>People Near You</h3>
                                        <p id="current-location">San Francisco, CA</p>
                                    </div>
                                    <button class="refresh-location" onclick="meetPeopleDashboard.refreshLocation()">
                                        <i class="fas fa-sync-alt"></i>
                                    </button>
                                </div>
                                
                                <div class="distance-slider">
                                    <label>Distance: <span id="distance-value">25</span> miles</label>
                                    <input type="range" id="distance-range" min="1" max="100" value="25" 
                                           oninput="meetPeopleDashboard.updateDistance(this.value)">
                                    <div class="slider-track">
                                        <div class="slider-fill" style="width: 25%"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="nearby-grid" id="nearby-grid">
                                <!-- Nearby profiles will be loaded here -->
                            </div>
                        </div>

                        <!-- Trending View -->
                        <div class="view-container" id="trending-view">
                            <div class="trending-header">
                                <h2>🔥 Trending This Week</h2>
                                <p>Most popular profiles getting lots of attention</p>
                            </div>
                            
                            <div class="trending-leaderboard" id="trending-leaderboard">
                                <!-- Trending profiles will be loaded here -->
                            </div>
                        </div>

                        <!-- Matches View -->
                        <div class="view-container" id="matches-view">
                            <div class="matches-header">
                                <h2>💫 Your Matches</h2>
                                <div class="match-filters">
                                    <button class="match-filter active" data-filter="all">All</button>
                                    <button class="match-filter" data-filter="recent">Recent</button>
                                    <button class="match-filter" data-filter="unread">Unread</button>
                                    <button class="match-filter" data-filter="favorites">Favorites</button>
                                </div>
                            </div>
                            
                            <div class="matches-grid" id="matches-grid">
                                <!-- Matches will be loaded here -->
                            </div>
                        </div>
                    </main>

                    <!-- Loading Overlay -->
                    <div class="loading-overlay" id="loading-overlay">
                        <div class="loading-content">
                            <div class="loading-spinner">
                                <div class="spinner-ring"></div>
                                <div class="spinner-ring"></div>
                                <div class="spinner-ring"></div>
                            </div>
                            <p class="loading-text">Finding amazing people for you...</p>
                        </div>
                    </div>
                </div>

                <!-- Filters Modal -->
                <div class="filters-modal" id="filters-modal">
                    <div class="filters-content">
                        <div class="filters-header">
                            <h3>Discovery Filters</h3>
                            <button class="close-filters" onclick="meetPeopleDashboard.closeFilters()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="filters-body">
                            <div class="filter-section">
                                <h4>Age Range</h4>
                                <div class="age-range-slider">
                                    <div class="age-inputs">
                                        <input type="number" id="min-age" value="18" min="18" max="80">
                                        <span>to</span>
                                        <input type="number" id="max-age" value="50" min="18" max="80">
                                    </div>
                                    <div class="range-slider-container">
                                        <input type="range" id="min-age-slider" min="18" max="80" value="18">
                                        <input type="range" id="max-age-slider" min="18" max="80" value="50">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="filter-section">
                                <h4>Interests</h4>
                                <div class="interests-grid" id="interests-grid">
                                    <!-- Interest tags will be populated -->
                                </div>
                            </div>
                            
                            <div class="filter-section">
                                <h4>Preferences</h4>
                                <div class="preference-toggles">
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="verified-only">
                                        <span class="toggle-slider"></span>
                                        <span class="toggle-label">Verified profiles only</span>
                                    </label>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="online-only">
                                        <span class="toggle-slider"></span>
                                        <span class="toggle-label">Currently online</span>
                                    </label>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="has-photos">
                                        <span class="toggle-slider"></span>
                                        <span class="toggle-label">Has multiple photos</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="filters-footer">
                            <button class="reset-filters" onclick="meetPeopleDashboard.resetFilters()">
                                Reset All
                            </button>
                            <button class="apply-filters" onclick="meetPeopleDashboard.applyFilters()">
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Profile Detail Modal -->
                <div class="profile-modal" id="profile-modal">
                    <div class="profile-modal-content">
                        <div class="profile-modal-header">
                            <button class="back-btn" onclick="meetPeopleDashboard.closeProfileModal()">
                                <i class="fas fa-arrow-left"></i>
                            </button>
                            <div class="profile-actions">
                                <button class="profile-action-btn" onclick="meetPeopleDashboard.reportProfile()">
                                    <i class="fas fa-flag"></i>
                                </button>
                                <button class="profile-action-btn" onclick="meetPeopleDashboard.blockProfile()">
                                    <i class="fas fa-ban"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="profile-modal-body" id="profile-modal-body">
                            <!-- Profile details will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove any existing dashboard
        const existingDashboard = document.getElementById('meet-people-dashboard');
        if (existingDashboard) {
            existingDashboard.remove();
        }

        document.body.insertAdjacentHTML('beforeend', dashboardHTML);
        this.injectStyles();
    }

    /**
     * Setup event listeners for the new dashboard
     */
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.isDashboardOpen()) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeDashboard();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.passProfile();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.likeProfile();
                    break;
                case ' ':
                    e.preventDefault();
                    this.superLike();
                    break;
            }
        });

        // Touch/swipe gestures for mobile
        this.setupSwipeGestures();

        // Auto-refresh stats
        setInterval(() => {
            if (this.isDashboardOpen()) {
                this.updateLiveStats();
            }
        }, 15000);
    }

    /**
     * Setup swipe gestures for profile cards
     */
    setupSwipeGestures() {
        let startX = 0, startY = 0;
        let currentX = 0, currentY = 0;
        let isDragging = false;

        const container = document.getElementById('profile-stack');
        if (!container) return;

        container.addEventListener('mousedown', (e) => {
            if (!e.target.closest('.profile-card')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            currentX = e.clientX - startX;
            currentY = e.clientY - startY;
            
            const activeCard = document.querySelector('.profile-card.active');
            if (activeCard) {
                const rotation = currentX * 0.1;
                activeCard.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;
                
                // Add visual feedback
                if (Math.abs(currentX) > 100) {
                    activeCard.classList.toggle('swipe-left', currentX < -100);
                    activeCard.classList.toggle('swipe-right', currentX > 100);
                } else {
                    activeCard.classList.remove('swipe-left', 'swipe-right');
                }
            }
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            
            const activeCard = document.querySelector('.profile-card.active');
            if (activeCard) {
                if (Math.abs(currentX) > 120) {
                    if (currentX > 120) {
                        this.likeProfile();
                    } else {
                        this.passProfile();
                    }
                } else {
                    // Return to center
                    activeCard.style.transform = '';
                    activeCard.classList.remove('swipe-left', 'swipe-right');
                }
            }
            
            currentX = 0;
            currentY = 0;
        });
    }

    /**
     * Load profiles data
     */
    async loadProfiles() {
        this.showLoading();
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1200));
            
            this.profiles = this.generateMockProfiles(50);
            this.renderDiscoverView();
            this.renderVideoView();
            this.renderNearbyView();
            this.renderTrendingView();
            this.renderMatchesView();
            
        } catch (error) {
            console.error('Failed to load profiles:', error);
            this.app.showToast('Failed to load profiles', 'error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Generate mock profiles with advanced data
     */
    generateMockProfiles(count) {
        const names = [
            'Emma Rodriguez', 'Alex Chen', 'Sarah Johnson', 'Michael Kim', 'Jessica Williams',
            'David Martinez', 'Ashley Brown', 'Ryan Garcia', 'Olivia Davis', 'James Wilson',
            'Sophia Anderson', 'Daniel Thompson', 'Isabella Taylor', 'Christopher Lee', 'Madison White',
            'Lucas Rodriguez', 'Ava Martinez', 'Ethan Johnson', 'Mia Garcia', 'Noah Brown'
        ];

        const bios = [
            'Adventure seeker who loves exploring hidden gems around the world ✈️',
            'Tech enthusiast by day, chef by night. Always experimenting with new recipes 👨‍🍳',
            'Professional photographer capturing life\'s beautiful moments 📸',
            'Yoga instructor spreading good vibes and positive energy 🧘‍♀️',
            'Music producer creating beats that move the soul 🎵',
            'Startup founder building the future, one idea at a time 🚀',
            'Marine biologist passionate about ocean conservation 🌊',
            'Digital artist bringing imagination to life through pixels 🎨',
            'Travel blogger sharing stories from 47 countries and counting 🗺️',
            'Coffee connoisseur and weekend hiker seeking new adventures ☕'
        ];

        const interests = [
            'Photography', 'Travel', 'Music', 'Art', 'Technology', 'Fitness', 'Food', 'Books',
            'Movies', 'Gaming', 'Dancing', 'Hiking', 'Yoga', 'Cooking', 'Fashion', 'Sports'
        ];

        const locations = [
            'San Francisco, CA', 'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Boston, MA',
            'Seattle, WA', 'Austin, TX', 'Denver, CO', 'Portland, OR', 'Miami, FL'
        ];

        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
        ];

        return Array.from({ length: count }, (_, i) => ({
            id: `profile-${Date.now()}-${i}`,
            name: names[i % names.length],
            age: Math.floor(Math.random() * 20) + 22,
            bio: bios[i % bios.length],
            location: locations[i % locations.length],
            interests: this.shuffleArray([...interests]).slice(0, Math.floor(Math.random() * 4) + 2),
            gradient: gradients[i % gradients.length],
            verified: Math.random() > 0.7,
            online: Math.random() > 0.6,
            distance: Math.floor(Math.random() * 15) + 1,
            matchPercentage: Math.floor(Math.random() * 30) + 70,
            photos: Math.floor(Math.random() * 8) + 3,
            lastSeen: this.getRandomLastSeen(),
            hasVideo: Math.random() > 0.6,
            isPopular: Math.random() > 0.8,
            connectionScore: Math.floor(Math.random() * 1000) + 100
        }));
    }

    /**
     * Utility function to shuffle array
     */
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    /**
     * Get random last seen text
     */
    getRandomLastSeen() {
        const options = [
            'Online now',
            'Active 5 minutes ago',
            'Active 1 hour ago',
            'Active today',
            'Active yesterday',
            'Active this week'
        ];
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Open the redesigned dashboard
     */
    async openDashboard() {
        const modal = document.getElementById('meet-people-dashboard');
        if (!modal) {
            console.error('Meet People Dashboard not found in DOM');
            return;
        }

        console.log('Opening redesigned Meet People Dashboard...');
        modal.classList.add('show');
        
        // Initialize with fresh data
        await this.loadProfiles();
        
        // Show welcome toast
        this.app.showToast('Meet People Dashboard launched! 👥', 'success');
        
        console.log('Meet People Dashboard opened successfully');
    }

    /**
     * Close the dashboard
     */
    closeDashboard() {
        const modal = document.getElementById('meet-people-dashboard');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Check if dashboard is open
     */
    isDashboardOpen() {
        const modal = document.getElementById('meet-people-dashboard');
        return modal && modal.classList.contains('show');
    }

    /**
     * Switch between views
     */
    async switchView(viewName) {
        if (this.currentView === viewName) return;

        // Update navigation
        document.querySelectorAll('.pill').forEach(pill => {
            pill.classList.toggle('active', pill.dataset.view === viewName);
        });

        // Update content
        document.querySelectorAll('.view-container').forEach(view => {
            view.classList.toggle('active', view.id === `${viewName}-view`);
        });

        this.currentView = viewName;
        console.log(`Switched to ${viewName} view`);

        // Load view-specific data if needed
        switch (viewName) {
            case 'video':
                this.renderVideoView();
                break;
            case 'nearby':
                this.renderNearbyView();
                break;
            case 'trending':
                this.renderTrendingView();
                break;
            case 'matches':
                this.renderMatchesView();
                break;
        }
    }

    /**
     * Render discover view with profile cards
     */
    renderDiscoverView() {
        const container = document.getElementById('profile-stack');
        if (!container) return;

        const visibleProfiles = this.profiles.slice(0, 3);
        
        container.innerHTML = visibleProfiles.map((profile, index) => `
            <div class="profile-card ${index === 0 ? 'active' : ''}" 
                 data-profile-id="${profile.id}"
                 style="z-index: ${10 - index}; transform: scale(${1 - index * 0.05}) translateY(${index * 8}px);">
                
                <div class="profile-image" style="background: ${profile.gradient};">
                    <div class="image-overlay">
                        <div class="profile-badges">
                            ${profile.verified ? '<div class="verified-badge"><i class="fas fa-check"></i></div>' : ''}
                            ${profile.online ? '<div class="online-badge"></div>' : ''}
                            ${profile.hasVideo ? '<div class="video-badge"><i class="fas fa-play"></i></div>' : ''}
                        </div>
                        
                        <div class="quick-actions-overlay">
                            <button class="quick-action" onclick="meetPeopleDashboard.viewProfile('${profile.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="quick-action" onclick="meetPeopleDashboard.sendMessage('${profile.id}')">
                                <i class="fas fa-comment"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="profile-photo">
                        <i class="fas fa-user"></i>
                    </div>
                </div>
                
                <div class="profile-content">
                    <div class="profile-header">
                        <div class="profile-name-age">
                            <h3>${profile.name}</h3>
                            <span class="age">${profile.age}</span>
                        </div>
                        <div class="match-percentage">
                            <span>${profile.matchPercentage}%</span>
                            <div class="match-label">Match</div>
                        </div>
                    </div>
                    
                    <div class="profile-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${profile.location}</span>
                        <span class="distance">${profile.distance} miles away</span>
                    </div>
                    
                    <div class="profile-bio">
                        ${profile.bio}
                    </div>
                    
                    <div class="profile-interests">
                        ${profile.interests.slice(0, 3).map(interest => 
                            `<span class="interest-tag">${this.getInterestEmoji(interest)} ${interest}</span>`
                        ).join('')}
                        ${profile.interests.length > 3 ? `<span class="more-interests">+${profile.interests.length - 3}</span>` : ''}
                    </div>
                    
                    <div class="profile-stats">
                        <div class="stat">
                            <i class="fas fa-images"></i>
                            <span>${profile.photos} photos</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-clock"></i>
                            <span>${profile.lastSeen}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render video profiles view
     */
    renderVideoView() {
        const container = document.getElementById('video-grid');
        if (!container) return;

        const videoProfiles = this.profiles.filter(p => p.hasVideo).slice(0, 12);
        
        container.innerHTML = videoProfiles.map(profile => `
            <div class="video-profile-card" onclick="meetPeopleDashboard.playVideo('${profile.id}')">
                <div class="video-thumbnail" style="background: ${profile.gradient};">
                    <div class="play-overlay">
                        <div class="play-button">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                    <div class="video-info">
                        <div class="video-duration">0:30</div>
                        ${profile.verified ? '<div class="verified-mini"><i class="fas fa-check"></i></div>' : ''}
                    </div>
                </div>
                
                <div class="video-profile-info">
                    <h4>${profile.name}, ${profile.age}</h4>
                    <p>${profile.location}</p>
                    <div class="video-actions">
                        <button class="video-action like" onclick="event.stopPropagation(); meetPeopleDashboard.likeProfile('${profile.id}')">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="video-action message" onclick="event.stopPropagation(); meetPeopleDashboard.sendMessage('${profile.id}')">
                            <i class="fas fa-comment"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render nearby profiles
     */
    renderNearbyView() {
        const container = document.getElementById('nearby-grid');
        if (!container) return;

        const nearbyProfiles = this.profiles.filter(p => p.distance <= this.filters.distance).slice(0, 20);
        
        container.innerHTML = nearbyProfiles.map(profile => `
            <div class="nearby-profile-card" onclick="meetPeopleDashboard.viewProfile('${profile.id}')">
                <div class="nearby-photo" style="background: ${profile.gradient};">
                    <i class="fas fa-user"></i>
                    ${profile.online ? '<div class="online-indicator"></div>' : ''}
                    ${profile.verified ? '<div class="verified-small"><i class="fas fa-check"></i></div>' : ''}
                </div>
                
                <div class="nearby-info">
                    <h4>${profile.name}</h4>
                    <p class="nearby-age">${profile.age} years old</p>
                    <p class="nearby-distance">${profile.distance} miles away</p>
                    
                    <div class="nearby-interests">
                        ${profile.interests.slice(0, 2).map(interest => 
                            `<span class="mini-interest">${this.getInterestEmoji(interest)}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="nearby-actions">
                    <button class="nearby-btn like" onclick="event.stopPropagation(); meetPeopleDashboard.likeProfile('${profile.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="nearby-btn message" onclick="event.stopPropagation(); meetPeopleDashboard.sendMessage('${profile.id}')">
                        <i class="fas fa-comment"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render trending profiles
     */
    renderTrendingView() {
        const container = document.getElementById('trending-leaderboard');
        if (!container) return;

        const trendingProfiles = this.profiles
            .filter(p => p.isPopular)
            .sort((a, b) => b.connectionScore - a.connectionScore)
            .slice(0, 10);
        
        container.innerHTML = trendingProfiles.map((profile, index) => `
            <div class="trending-card rank-${index + 1}" onclick="meetPeopleDashboard.viewProfile('${profile.id}')">
                <div class="trending-rank">
                    <div class="rank-number">#${index + 1}</div>
                    <div class="trend-badge ${index < 3 ? 'gold' : index < 6 ? 'silver' : 'bronze'}">
                        <i class="fas ${index < 3 ? 'fa-fire' : index < 6 ? 'fa-trending-up' : 'fa-star'}"></i>
                    </div>
                </div>
                
                <div class="trending-photo" style="background: ${profile.gradient};">
                    <i class="fas fa-user"></i>
                    ${profile.verified ? '<div class="verified-trending"><i class="fas fa-check"></i></div>' : ''}
                </div>
                
                <div class="trending-info">
                    <h3>${profile.name}, ${profile.age}</h3>
                    <p class="trending-location">${profile.location}</p>
                    <div class="trending-stats">
                        <span class="stat">
                            <i class="fas fa-heart"></i>
                            ${this.formatNumber(profile.connectionScore)}
                        </span>
                        <span class="stat">
                            <i class="fas fa-eye"></i>
                            ${this.formatNumber(profile.connectionScore * 2)}
                        </span>
                    </div>
                    <p class="trending-reason">Most liked this week</p>
                </div>
                
                <div class="trending-actions">
                    <button class="trending-connect" onclick="event.stopPropagation(); meetPeopleDashboard.likeProfile('${profile.id}')">
                        Connect
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render matches view
     */
    renderMatchesView() {
        const container = document.getElementById('matches-grid');
        if (!container) return;

        const matches = this.profiles.slice(0, 12);
        
        container.innerHTML = matches.map(profile => `
            <div class="match-card" onclick="meetPeopleDashboard.openChat('${profile.id}')">
                <div class="match-photo" style="background: ${profile.gradient};">
                    <i class="fas fa-user"></i>
                    ${profile.online ? '<div class="online-dot"></div>' : ''}
                    ${profile.verified ? '<div class="verified-match"><i class="fas fa-check"></i></div>' : ''}
                </div>
                
                <div class="match-info">
                    <h4>${profile.name}</h4>
                    <p class="match-time">Matched 2 days ago</p>
                    <p class="last-message">Hey! How's your weekend going? 😊</p>
                </div>
                
                <div class="match-status">
                    <div class="unread-badge">2</div>
                </div>
            </div>
        `).join('');
    }

    // Action Methods
    passProfile() {
        this.animateCardOut('left');
        this.app.showToast('Profile passed', 'info');
        this.nextProfile();
    }

    likeProfile() {
        this.animateCardOut('right');
        this.app.showToast('Profile liked! 💕', 'success');
        this.nextProfile();
    }

    superLike() {
        this.animateCardOut('up');
        this.app.showToast('Super Like sent! ⭐', 'success');
        this.nextProfile();
    }

    boostProfile() {
        this.app.showToast('Profile boosted! 🚀', 'success');
    }

    animateCardOut(direction) {
        const activeCard = document.querySelector('.profile-card.active');
        if (!activeCard) return;

        let transform = '';
        switch(direction) {
            case 'left':
                transform = 'translateX(-100vw) rotate(-30deg)';
                break;
            case 'right':
                transform = 'translateX(100vw) rotate(30deg)';
                break;
            case 'up':
                transform = 'translateY(-100vh) scale(1.1)';
                break;
        }

        activeCard.style.transition = 'all 0.5s ease-out';
        activeCard.style.transform = transform;
        activeCard.style.opacity = '0';

        setTimeout(() => {
            activeCard.remove();
        }, 500);
    }

    nextProfile() {
        setTimeout(() => {
            const cards = document.querySelectorAll('.profile-card');
            if (cards.length > 0) {
                cards[0].classList.add('active');
                this.reorderCards();
            }
            
            // Load more profiles if needed
            if (cards.length < 2) {
                this.loadMoreProfiles();
            }
        }, 300);
    }

    reorderCards() {
        const cards = document.querySelectorAll('.profile-card');
        cards.forEach((card, index) => {
            card.style.zIndex = 10 - index;
            card.style.transform = `scale(${1 - index * 0.05}) translateY(${index * 8}px)`;
        });
    }

    async loadMoreProfiles() {
        const newProfiles = this.generateMockProfiles(5);
        this.profiles.push(...newProfiles);
        
        const container = document.getElementById('profile-stack');
        const newCards = newProfiles.slice(0, 2).map((profile, index) => `
            <div class="profile-card" data-profile-id="${profile.id}" style="z-index: ${5 - index};">
                <!-- Profile card HTML here (same as renderDiscoverView) -->
            </div>
        `).join('');
        
        container.insertAdjacentHTML('beforeend', newCards);
    }

    // Utility Methods
    getInterestEmoji(interest) {
        const emojiMap = {
            Photography: '📸', Travel: '✈️', Music: '🎵', Art: '🎨',
            Technology: '💻', Fitness: '💪', Food: '🍕', Books: '📚',
            Movies: '🎬', Gaming: '🎮', Dancing: '💃', Hiking: '🥾',
            Yoga: '🧘', Cooking: '👨‍🍳', Fashion: '👗', Sports: '⚽'
        };
        return emojiMap[interest] || '🌟';
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    updateDistance(value) {
        this.filters.distance = value;
        document.getElementById('distance-value').textContent = value;
        document.querySelector('.slider-fill').style.width = `${value}%`;
        this.renderNearbyView();
    }

    updateLiveStats() {
        // Simulate live stat updates
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            const current = parseFloat(stat.textContent);
            const increment = Math.random() * 0.1;
            stat.textContent = (current + increment).toFixed(1) + (stat.textContent.includes('M') ? 'M' : stat.textContent.includes('K') ? 'K' : '%');
        });
    }

    // Modal Methods
    openFilters() {
        const modal = document.getElementById('filters-modal');
        if (modal) {
            modal.classList.add('show');
            this.populateInterests();
        }
    }

    closeFilters() {
        const modal = document.getElementById('filters-modal');
        if (modal) modal.classList.remove('show');
    }

    populateInterests() {
        const container = document.getElementById('interests-grid');
        if (!container) return;

        const interests = ['Photography', 'Travel', 'Music', 'Art', 'Technology', 'Fitness', 'Food', 'Books'];
        container.innerHTML = interests.map(interest => `
            <button class="interest-filter" data-interest="${interest}">
                ${this.getInterestEmoji(interest)} ${interest}
            </button>
        `).join('');
    }

    applyFilters() {
        // Apply filter logic here
        this.closeFilters();
        this.app.showToast('Filters applied successfully', 'success');
        this.renderDiscoverView();
    }

    resetFilters() {
        this.filters = {
            ageRange: [18, 50],
            distance: 25,
            interests: [],
            verified: false,
            online: false
        };
        this.app.showToast('Filters reset', 'info');
    }

    viewProfile(profileId) {
        console.log('Viewing profile:', profileId);
        
        // Find the profile data
        const profile = this.profiles.find(p => p.id === profileId);
        if (!profile) {
            console.error('Profile not found:', profileId);
            this.app.showToast('Profile not found', 'error');
            return;
        }

        // Initialize nearby profile modal if not available
        if (!window.nearbyProfileModal) {
            console.log('NearbyProfileModal not found, checking for availability...');
            if (window.NearbyProfileModal) {
                window.nearbyProfileModal = new window.NearbyProfileModal(this.app);
                console.log('NearbyProfileModal initialized');
            } else {
                console.error('NearbyProfileModal class not found');
                this.app.showToast('Profile modal not available', 'error');
                return;
            }
        }

        // Convert meet people profile to nearby profile format
        const nearbyProfile = {
            id: profile.id,
            name: profile.name,
            age: profile.age,
            bio: profile.bio,
            location: profile.location,
            distance: profile.distance,
            interests: profile.interests,
            photos: profile.photos || 5,
            verified: profile.verified,
            online: profile.online,
            lastSeen: profile.lastSeen,
            hasVideo: profile.hasVideo,
            matchPercentage: profile.matchPercentage,
            mutualFriends: Math.floor(Math.random() * 10) + 1,
            profession: 'Professional', // Default profession
            mutualConnections: Math.floor(Math.random() * 5) + 1,
            socialScore: profile.connectionScore || 500,
            recentActivity: profile.lastSeen
        };

        // Open the comprehensive nearby profile modal
        try {
            this.app.showToast(`Opening ${profile.name}'s profile`, 'info');
            window.nearbyProfileModal.showProfileModal(nearbyProfile.name, nearbyProfile);
        } catch (error) {
            console.error('Error opening nearby profile modal:', error);
            this.app.showToast('Error opening profile modal', 'error');
        }
    }

    sendMessage(profileId) {
        console.log('Sending message to:', profileId);
        this.app.showToast('Opening chat...', 'info');
    }

    playVideo(profileId) {
        console.log('Playing video for:', profileId);
        
        // Find the profile data
        const profile = this.profiles.find(p => p.id === profileId);
        if (!profile) {
            console.error('Profile not found:', profileId);
            this.app.showToast('Profile not found', 'error');
            return;
        }

        // Initialize video details dashboard if not available
        if (!window.videoDetailsDashboard) {
            console.log('VideoDetailsDashboard not found, initializing...');
            if (window.VideoDetailsDashboard) {
                window.videoDetailsDashboard = new window.VideoDetailsDashboard(this.app);
                console.log('VideoDetailsDashboard initialized');
            } else {
                console.error('VideoDetailsDashboard class not found');
                this.app.showToast('Video dashboard not available', 'error');
                return;
            }
        }

        // Open the video details dashboard with profile data
        try {
            this.app.showToast(`Opening ${profile.name}'s video profile`, 'info');
            window.videoDetailsDashboard.openWithProfile(profile);
        } catch (error) {
            console.error('Error opening video dashboard:', error);
            this.app.showToast('Error opening video dashboard', 'error');
        }
    }

    openChat(profileId) {
        console.log('Opening chat with:', profileId);
        this.app.showToast('Opening conversation...', 'info');
    }

    refreshLocation() {
        this.app.showToast('Refreshing location...', 'info');
        setTimeout(() => {
            this.app.showToast('Location updated', 'success');
            this.renderNearbyView();
        }, 1000);
    }

    openNotifications() {
        this.app.showToast('Opening notifications...', 'info');
    }

    reportProfile() {
        this.app.showToast('Profile reported', 'warning');
    }

    blockProfile() {
        this.app.showToast('Profile blocked', 'error');
    }

    closeProfileModal() {
        const modal = document.getElementById('profile-modal');
        if (modal) modal.classList.remove('show');
    }

    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'flex';
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    /**
     * Inject modern CSS styles
     */
    injectStyles() {
        if (document.getElementById('meet-people-new-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'meet-people-new-styles';
        styles.textContent = `
            /* Meet People Dashboard - Revolutionary Design */
            .meet-people-modal-new {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .meet-people-modal-new.show {
                opacity: 1;
                visibility: visible;
            }

            .modal-backdrop-new {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(20px);
            }

            .meet-people-container-new {
                position: relative;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
                display: flex;
                flex-direction: column;
                transform: scale(0.95);
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .meet-people-modal-new.show .meet-people-container-new {
                transform: scale(1);
            }

            /* Header */
            .dashboard-header-new {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 24px 32px;
                background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .app-logo {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .logo-icon {
                position: relative;
                width: 56px;
                height: 56px;
                background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                color: white;
            }

            .heartbeat-animation {
                position: absolute;
                width: 100%;
                height: 100%;
                border: 2px solid #ec4899;
                border-radius: 16px;
                animation: heartbeat 2s ease-in-out infinite;
            }

            @keyframes heartbeat {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.7; }
            }

            .logo-text h1 {
                font-size: 28px;
                font-weight: 800;
                margin: 0;
                background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .logo-text span {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.7);
                font-weight: 500;
            }

            .live-stats {
                display: flex;
                gap: 20px;
            }

            .stat-bubble {
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 16px 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.3s ease;
            }

            .stat-bubble:hover {
                background: rgba(255, 255, 255, 0.08);
                transform: translateY(-2px);
            }

            .stat-bubble.pulse {
                animation: pulse 2s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            .stat-icon {
                font-size: 20px;
            }

            .stat-data {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .stat-number {
                font-size: 18px;
                font-weight: 700;
                color: #ec4899;
                line-height: 1;
            }

            .stat-label {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                line-height: 1;
            }

            .header-right {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .header-btn {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 12px 16px;
                color: white;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                position: relative;
            }

            .header-btn:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-2px);
            }

            .notification-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: #ef4444;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 11px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .close-btn {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 50%;
                width: 44px;
                height: 44px;
                color: white;
                font-size: 18px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: rotate(90deg);
            }

            /* Navigation Pills */
            .nav-pills {
                display: flex;
                justify-content: center;
                gap: 8px;
                padding: 20px 32px;
                background: rgba(255, 255, 255, 0.02);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .pill {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 25px;
                padding: 12px 20px;
                color: rgba(255, 255, 255, 0.7);
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                position: relative;
                overflow: hidden;
            }

            .pill:hover {
                background: rgba(255, 255, 255, 0.08);
                transform: translateY(-2px);
            }

            .pill.active {
                background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
                color: white;
                box-shadow: 0 8px 25px rgba(236, 72, 153, 0.3);
            }

            .match-count {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                padding: 2px 6px;
                font-size: 11px;
                font-weight: 700;
            }

            .pill-indicator {
                position: absolute;
                bottom: -1px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 2px;
                background: white;
                transition: width 0.3s ease;
            }

            .pill.active .pill-indicator {
                width: 80%;
            }

            /* Main Content */
            .dashboard-main {
                flex: 1;
                padding: 32px;
                overflow: hidden;
            }

            .view-container {
                display: none;
                height: 100%;
            }

            .view-container.active {
                display: block;
            }

            /* Discover View */
            .discover-layout {
                display: grid;
                grid-template-columns: 1fr 350px;
                gap: 32px;
                height: 100%;
            }

            .profile-cards-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 32px;
            }

            .profile-stack {
                position: relative;
                width: 400px;
                height: 600px;
            }

            .profile-card {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                overflow: hidden;
                cursor: grab;
                transition: all 0.3s ease;
                user-select: none;
            }

            .profile-card:active {
                cursor: grabbing;
            }

            .profile-card.swipe-left {
                border-color: #ef4444;
                box-shadow: 0 0 30px rgba(239, 68, 68, 0.3);
            }

            .profile-card.swipe-right {
                border-color: #22c55e;
                box-shadow: 0 0 30px rgba(34, 197, 94, 0.3);
            }

            .profile-image {
                position: relative;
                height: 70%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 60px;
            }

            .image-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%);
                opacity: 0;
                transition: opacity 0.3s ease;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 20px;
            }

            .profile-card:hover .image-overlay {
                opacity: 1;
            }

            .profile-badges {
                display: flex;
                gap: 8px;
                align-self: flex-end;
            }

            .verified-badge, .online-badge, .video-badge {
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(10px);
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                color: white;
            }

            .verified-badge {
                background: #10b981;
            }

            .online-badge {
                background: #22c55e;
                position: relative;
            }

            .online-badge::after {
                content: '';
                position: absolute;
                width: 8px;
                height: 8px;
                background: #22c55e;
                border: 2px solid white;
                border-radius: 50%;
            }

            .quick-actions-overlay {
                display: flex;
                gap: 12px;
                align-self: center;
            }

            .quick-action {
                background: rgba(255, 255, 255, 0.9);
                border: none;
                border-radius: 50%;
                width: 44px;
                height: 44px;
                color: #1f2937;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .quick-action:hover {
                background: white;
                transform: scale(1.1);
            }

            .profile-content {
                padding: 20px;
                height: 30%;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .profile-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .profile-name-age {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .profile-name-age h3 {
                margin: 0;
                font-size: 20px;
                font-weight: 700;
                color: white;
            }

            .age {
                font-size: 16px;
                color: rgba(255, 255, 255, 0.7);
            }

            .match-percentage {
                text-align: center;
            }

            .match-percentage span {
                font-size: 16px;
                font-weight: 700;
                color: #ec4899;
                display: block;
            }

            .match-label {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
                text-transform: uppercase;
            }

            .profile-location {
                display: flex;
                align-items: center;
                gap: 8px;
                color: rgba(255, 255, 255, 0.7);
                font-size: 14px;
            }

            .distance {
                margin-left: auto;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.5);
            }

            .profile-bio {
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
                line-height: 1.4;
                flex: 1;
            }

            .profile-interests {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }

            .interest-tag {
                background: rgba(236, 72, 153, 0.2);
                border: 1px solid rgba(236, 72, 153, 0.3);
                color: #ec4899;
                border-radius: 12px;
                padding: 4px 8px;
                font-size: 11px;
                font-weight: 500;
            }

            .more-interests {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.7);
                border-radius: 12px;
                padding: 4px 8px;
                font-size: 11px;
            }

            .profile-stats {
                display: flex;
                gap: 16px;
                margin-top: 8px;
            }

            .stat {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
            }

            /* Action Controls */
            .action-controls {
                display: flex;
                gap: 20px;
                align-items: center;
            }

            .action-btn {
                border: none;
                border-radius: 50%;
                width: 64px;
                height: 64px;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }

            .action-btn:hover {
                transform: scale(1.1);
            }

            .action-btn.pass {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
                box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
            }

            .action-btn.like {
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                color: white;
                box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
            }

            .action-btn.superlike {
                background: linear-gradient(135deg, #eab308 0%, #f59e0b 100%);
                color: white;
                box-shadow: 0 8px 25px rgba(234, 179, 8, 0.3);
                width: 72px;
                height: 72px;
            }

            .action-btn.boost {
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                color: white;
                box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
            }

            /* Sidebar Info */
            .sidebar-info {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }

            .quick-stats {
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 24px;
            }

            .quick-stats h3 {
                margin: 0 0 16px 0;
                color: white;
                font-size: 18px;
                font-weight: 600;
            }

            .activity-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
            }

            .activity-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                transition: all 0.3s ease;
            }

            .activity-item:hover {
                background: rgba(255, 255, 255, 0.08);
                transform: translateY(-2px);
            }

            .activity-icon {
                font-size: 20px;
            }

            .activity-text {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .activity-number {
                font-size: 16px;
                font-weight: 700;
                color: #ec4899;
                line-height: 1;
            }

            .activity-label {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
                line-height: 1;
            }

            .discovery-tips {
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 24px;
            }

            .discovery-tips h3 {
                margin: 0 0 16px 0;
                color: white;
                font-size: 18px;
                font-weight: 600;
            }

            .tip-card {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                margin-bottom: 12px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                transition: all 0.3s ease;
            }

            .tip-card:hover {
                background: rgba(255, 255, 255, 0.08);
            }

            .tip-card:last-child {
                margin-bottom: 0;
            }

            .tip-icon {
                font-size: 16px;
                flex-shrink: 0;
            }

            .tip-card p {
                margin: 0;
                font-size: 13px;
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.4;
            }

            /* Loading Overlay */
            .loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                display: none;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 100;
            }

            .loading-content {
                text-align: center;
            }

            .loading-spinner {
                position: relative;
                width: 80px;
                height: 80px;
                margin-bottom: 20px;
            }

            .spinner-ring {
                position: absolute;
                width: 100%;
                height: 100%;
                border: 3px solid rgba(236, 72, 153, 0.2);
                border-radius: 50%;
                animation: spin 2s linear infinite;
            }

            .spinner-ring:nth-child(1) {
                border-top-color: #ec4899;
                animation-delay: 0s;
            }

            .spinner-ring:nth-child(2) {
                border-top-color: #8b5cf6;
                animation-delay: 0.5s;
            }

            .spinner-ring:nth-child(3) {
                border-top-color: #06b6d4;
                animation-delay: 1s;
            }

            @keyframes spin {
                to {
                    transform: rotate(360deg);
                }
            }

            .loading-text {
                color: white;
                font-size: 18px;
                font-weight: 500;
                margin: 0;
            }

            /* Video Grid and Other Views */
            .video-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 20px;
                padding: 20px 0;
                overflow-y: auto;
                height: 100%;
            }

            .video-profile-card {
                background: rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .video-profile-card:hover {
                transform: translateY(-4px);
                border-color: #ec4899;
                box-shadow: 0 12px 30px rgba(236, 72, 153, 0.2);
            }

            .video-thumbnail {
                position: relative;
                height: 200px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 40px;
            }

            .play-overlay {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            .play-button {
                width: 60px;
                height: 60px;
                background: rgba(236, 72, 153, 0.9);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                color: white;
                transition: all 0.3s ease;
            }

            .video-profile-card:hover .play-button {
                transform: scale(1.1);
                box-shadow: 0 8px 25px rgba(236, 72, 153, 0.4);
            }

            .video-info {
                position: absolute;
                top: 12px;
                right: 12px;
                display: flex;
                gap: 8px;
            }

            .video-duration {
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 4px 8px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
            }

            .verified-mini {
                background: #10b981;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
            }

            .video-profile-info {
                padding: 16px;
            }

            .video-profile-info h4 {
                margin: 0 0 8px 0;
                color: white;
                font-size: 16px;
                font-weight: 600;
            }

            .video-profile-info p {
                margin: 0 0 12px 0;
                color: rgba(255, 255, 255, 0.7);
                font-size: 14px;
            }

            .video-actions {
                display: flex;
                gap: 8px;
            }

            .video-action {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                padding: 8px 12px;
                color: white;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .video-action:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-1px);
            }

            .video-action.like:hover {
                background: #22c55e;
                border-color: #22c55e;
            }

            .video-action.message:hover {
                background: #3b82f6;
                border-color: #3b82f6;
            }

            /* Nearby, Trending, and Matches Grids */
            .nearby-grid, .trending-leaderboard, .matches-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
                padding: 20px 0;
                overflow-y: auto;
                height: calc(100% - 100px);
            }

            .nearby-header, .trending-header, .matches-header {
                padding-bottom: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                margin-bottom: 20px;
            }

            .nearby-header h2, .trending-header h2, .matches-header h2 {
                color: white;
                font-size: 24px;
                font-weight: 700;
                margin: 0 0 8px 0;
            }

            .nearby-header p, .trending-header p {
                color: rgba(255, 255, 255, 0.7);
                margin: 0;
                font-size: 16px;
            }

            .location-display {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 20px;
            }

            .location-icon {
                background: #ec4899;
                color: white;
                border-radius: 12px;
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }

            .location-info h3 {
                margin: 0;
                color: white;
                font-size: 18px;
                font-weight: 600;
            }

            .location-info p {
                margin: 0;
                color: rgba(255, 255, 255, 0.7);
                font-size: 14px;
            }

            .refresh-location {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                width: 40px;
                height: 40px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .refresh-location:hover {
                background: #ec4899;
                border-color: #ec4899;
                transform: rotate(180deg);
            }

            .distance-slider {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .distance-slider label {
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
                font-weight: 500;
            }

            .distance-slider input[type="range"] {
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                outline: none;
                -webkit-appearance: none;
            }

            .distance-slider input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 20px;
                height: 20px;
                background: #ec4899;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            }

            /* Filter Modal and other modals */
            .filters-modal, .profile-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                z-index: 10001;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .filters-modal.show, .profile-modal.show {
                opacity: 1;
                visibility: visible;
            }

            .filters-content, .profile-modal-content {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }

            .filters-modal.show .filters-content,
            .profile-modal.show .profile-modal-content {
                transform: scale(1);
            }

            /* Card styles for different views */
            .nearby-profile-card, .trending-card, .match-card {
                background: rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .nearby-profile-card:hover, .trending-card:hover, .match-card:hover {
                transform: translateY(-4px);
                border-color: #ec4899;
                box-shadow: 0 12px 30px rgba(236, 72, 153, 0.2);
            }

            /* Responsive Design */
            @media (max-width: 1200px) {
                .discover-layout {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }

                .sidebar-info {
                    display: none;
                }

                .dashboard-header-new {
                    padding: 16px 20px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .live-stats {
                    order: 3;
                    width: 100%;
                    justify-content: center;
                }

                .nav-pills {
                    padding: 16px 20px;
                    overflow-x: auto;
                }

                .pill {
                    white-space: nowrap;
                }
            }

            @media (max-width: 768px) {
                .meet-people-container-new {
                    height: 100vh;
                }

                .dashboard-main {
                    padding: 16px;
                }

                .profile-stack {
                    width: 320px;
                    height: 500px;
                }

                .action-controls {
                    gap: 16px;
                }

                .action-btn {
                    width: 56px;
                    height: 56px;
                    font-size: 20px;
                }

                .action-btn.superlike {
                    width: 64px;
                    height: 64px;
                }

                .video-grid,
                .nearby-grid,
                .trending-leaderboard,
                .matches-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Initialize the dashboard when the script loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for app to be ready
    setTimeout(() => {
        if (window.app && !window.meetPeopleDashboard) {
            window.meetPeopleDashboard = new MeetPeopleDashboard(window.app);
            console.log('Meet People Dashboard instance created and ready');
        }
    }, 500);
});

// Also initialize when app-ready event is fired
document.addEventListener('app-ready', () => {
    if (window.app && !window.meetPeopleDashboard) {
        window.meetPeopleDashboard = new MeetPeopleDashboard(window.app);
        console.log('Meet People Dashboard initialized on app-ready event');
    }
});

// Fallback initialization for when the class is loaded but app isn't ready yet
if (typeof window !== 'undefined') {
    window.MeetPeopleDashboard = MeetPeopleDashboard;
    
    // If app is already available, initialize immediately
    if (window.app && !window.meetPeopleDashboard) {
        window.meetPeopleDashboard = new MeetPeopleDashboard(window.app);
        console.log('Meet People Dashboard initialized immediately');
    }
}
