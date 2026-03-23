/**
 * ConnectHub - Find Friends UI Components
 * Comprehensive friend discovery interface for the explore section
 * Implements the specifications from FIND-FRIENDS-SPECIFICATIONS.md
 */

class FindFriendsUIComponents {
    constructor(app) {
        this.app = app || window.app || { showToast: (msg, type) => console.log(msg) };
        this.currentTab = 'suggested';
        this.currentFilters = {
            location: '',
            radius: 25,
            minAge: 18,
            maxAge: 65,
            interests: [],
            mutualFriends: false,
            onlineOnly: false,
            verifiedOnly: false
        };
        
        // Friend data storage
        this.suggestions = new Map();
        this.dismissedUsers = new Set();
        this.pendingFollows = new Set();
        
        // Location data
        this.userLocation = null;
        this.locationPermission = null;
        
        this.init();
    }

    init() {
        console.log('Initializing Find Friends UI Components...');
        this.createFindFriendsModal();
        this.setupEventListeners();
        this.checkLocationPermission();
        console.log('Find Friends UI Components initialized successfully');
    }

    /**
     * Create the main Find Friends modal interface
     */
    createFindFriendsModal() {
        const findFriendsModalHTML = `
            <div id="find-friends-modal" class="modal find-friends-modal">
                <div class="modal-overlay" onclick="findFriendsUI.closeFindFriends()"></div>
                <div class="find-friends-container">
                    <!-- Header Section -->
                    <div class="find-friends-header">
                        <div class="header-title">
                            <h1><i class="fas fa-users"></i> Find Friends</h1>
                            <p>Discover new connections and expand your network</p>
                        </div>
                        <div class="header-stats" id="find-friends-stats">
                            <span class="stat-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span id="nearby-count">0</span> nearby
                            </span>
                            <span class="stat-item">
                                <i class="fas fa-users"></i>
                                <span id="mutual-count">0</span> mutual friends
                            </span>
                        </div>
                        <div class="header-actions">
                            <button class="header-action-btn" id="import-contacts-btn" onclick="findFriendsUI.importContacts()">
                                <i class="fas fa-address-book"></i> Import Contacts
                            </button>
                            <button class="header-action-btn" id="invite-friends-btn" onclick="findFriendsUI.inviteFriends()">
                                <i class="fas fa-user-plus"></i> Invite Friends
                            </button>
                            <button class="close-find-friends" onclick="findFriendsUI.closeFindFriends()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Navigation Tabs -->
                    <div class="find-friends-tabs">
                        <button class="find-friends-tab active" data-tab="suggested" onclick="findFriendsUI.switchTab('suggested')">
                            <i class="fas fa-magic"></i>
                            <span>Suggested for You</span>
                            <span class="tab-count" id="suggested-count">0</span>
                        </button>
                        <button class="find-friends-tab" data-tab="contacts" onclick="findFriendsUI.switchTab('contacts')">
                            <i class="fas fa-address-book"></i>
                            <span>People You May Know</span>
                            <span class="tab-count" id="contacts-count">0</span>
                        </button>
                        <button class="find-friends-tab" data-tab="nearby" onclick="findFriendsUI.switchTab('nearby')">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>Nearby</span>
                            <span class="tab-count" id="nearby-tab-count">0</span>
                        </button>
                        <button class="find-friends-tab" data-tab="interests" onclick="findFriendsUI.switchTab('interests')">
                            <i class="fas fa-heart"></i>
                            <span>Similar Interests</span>
                            <span class="tab-count" id="interests-count">0</span>
                        </button>
                    </div>

                    <!-- Search and Filters -->
                    <div class="find-friends-search">
                        <div class="search-input-container">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" 
                                   id="find-friends-search-input" 
                                   placeholder="Search by name, username, or interests..."
                                   autocomplete="off">
                            <button class="voice-search-btn" onclick="findFriendsUI.startVoiceSearch()" title="Voice Search">
                                <i class="fas fa-microphone"></i>
                            </button>
                        </div>
                        <button class="filters-toggle-btn" id="filters-toggle" onclick="findFriendsUI.toggleFilters()">
                            <i class="fas fa-filter"></i>
                            <span>Filters</span>
                            <span class="filter-count" id="active-filter-count" style="display: none;">0</span>
                        </button>
                    </div>

                    <!-- Advanced Filters Panel -->
                    <div class="find-friends-filters" id="find-friends-filters">
                        <div class="filters-content">
                            <div class="filter-section">
                                <h4><i class="fas fa-map-marker-alt"></i> Location</h4>
                                <div class="location-filters">
                                    <input type="text" 
                                           id="location-input" 
                                           placeholder="City, state, or zip code..."
                                           value="${this.currentFilters.location}">
                                    <div class="radius-control">
                                        <label>Within: <span id="radius-value">${this.currentFilters.radius}</span> miles</label>
                                        <input type="range" 
                                               id="radius-slider" 
                                               min="1" 
                                               max="100" 
                                               value="${this.currentFilters.radius}"
                                               oninput="findFriendsUI.updateRadiusDisplay(this.value)">
                                    </div>
                                </div>
                            </div>

                            <div class="filter-section">
                                <h4><i class="fas fa-birthday-cake"></i> Age Range</h4>
                                <div class="age-filters">
                                    <div class="age-inputs">
                                        <input type="number" 
                                               id="min-age" 
                                               min="18" 
                                               max="100" 
                                               value="${this.currentFilters.minAge}"
                                               placeholder="Min">
                                        <span>to</span>
                                        <input type="number" 
                                               id="max-age" 
                                               min="18" 
                                               max="100" 
                                               value="${this.currentFilters.maxAge}"
                                               placeholder="Max">
                                    </div>
                                </div>
                            </div>

                            <div class="filter-section">
                                <h4><i class="fas fa-heart"></i> Interests</h4>
                                <div class="interests-filter">
                                    <div class="interest-tags-container">
                                        <div class="popular-interests" id="popular-interests">
                                            <span class="interest-tag" data-interest="photography" onclick="findFriendsUI.toggleInterest('photography')">📸 Photography</span>
                                            <span class="interest-tag" data-interest="travel" onclick="findFriendsUI.toggleInterest('travel')">✈️ Travel</span>
                                            <span class="interest-tag" data-interest="music" onclick="findFriendsUI.toggleInterest('music')">🎵 Music</span>
                                            <span class="interest-tag" data-interest="sports" onclick="findFriendsUI.toggleInterest('sports')">⚽ Sports</span>
                                            <span class="interest-tag" data-interest="food" onclick="findFriendsUI.toggleInterest('food')">🍕 Food</span>
                                            <span class="interest-tag" data-interest="art" onclick="findFriendsUI.toggleInterest('art')">🎨 Art</span>
                                            <span class="interest-tag" data-interest="technology" onclick="findFriendsUI.toggleInterest('technology')">💻 Technology</span>
                                            <span class="interest-tag" data-interest="fitness" onclick="findFriendsUI.toggleInterest('fitness')">💪 Fitness</span>
                                        </div>
                                        <input type="text" 
                                               id="custom-interest-input" 
                                               placeholder="Add custom interest..."
                                               onkeypress="findFriendsUI.handleCustomInterest(event)">
                                    </div>
                                </div>
                            </div>

                            <div class="filter-section">
                                <h4><i class="fas fa-toggle-on"></i> Preferences</h4>
                                <div class="preference-toggles">
                                    <label class="toggle-preference">
                                        <input type="checkbox" id="mutual-friends-toggle">
                                        <span class="toggle-slider"></span>
                                        <span class="toggle-label">Has mutual friends</span>
                                    </label>
                                    <label class="toggle-preference">
                                        <input type="checkbox" id="online-only-toggle">
                                        <span class="toggle-slider"></span>
                                        <span class="toggle-label">Online now</span>
                                    </label>
                                    <label class="toggle-preference">
                                        <input type="checkbox" id="verified-only-toggle">
                                        <span class="toggle-slider"></span>
                                        <span class="toggle-label">Verified accounts only</span>
                                    </label>
                                </div>
                            </div>

                            <div class="filter-actions">
                                <button class="filter-action-btn clear" onclick="findFriendsUI.clearFilters()">
                                    <i class="fas fa-times"></i> Clear All
                                </button>
                                <button class="filter-action-btn apply" onclick="findFriendsUI.applyFilters()">
                                    <i class="fas fa-check"></i> Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Content Area -->
                    <div class="find-friends-content" id="find-friends-content">
                        <!-- Suggested Tab Content -->
                        <div class="tab-content active" data-content="suggested">
                            <div class="suggestions-grid" id="suggested-users-grid">
                                <!-- Suggestion cards will be populated here -->
                            </div>
                            <div class="load-more-container">
                                <button class="load-more-btn" id="load-more-suggested" onclick="findFriendsUI.loadMoreSuggestions()">
                                    <i class="fas fa-chevron-down"></i> Load More Suggestions
                                </button>
                            </div>
                        </div>

                        <!-- Contacts Tab Content -->
                        <div class="tab-content" data-content="contacts">
                            <div class="contacts-header">
                                <h3>People You May Know</h3>
                                <p>Based on your contacts, mutual connections, and social networks</p>
                            </div>
                            <div class="suggestions-grid" id="contacts-users-grid">
                                <!-- Contact-based suggestions will be populated here -->
                            </div>
                        </div>

                        <!-- Nearby Tab Content -->
                        <div class="tab-content" data-content="nearby">
                            <div class="nearby-header">
                                <h3>People Nearby</h3>
                                <div class="location-status" id="location-status">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span id="location-status-text">Checking location...</span>
                                    <button class="enable-location-btn" id="enable-location-btn" onclick="findFriendsUI.requestLocationPermission()" style="display: none;">
                                        Enable Location
                                    </button>
                                </div>
                            </div>
                            <div class="suggestions-grid" id="nearby-users-grid">
                                <!-- Location-based suggestions will be populated here -->
                            </div>
                        </div>

                        <!-- Interests Tab Content -->
                        <div class="tab-content" data-content="interests">
                            <div class="interests-header">
                                <h3>People with Similar Interests</h3>
                                <p>Discover users who share your passions and hobbies</p>
                            </div>
                            <div class="suggestions-grid" id="interests-users-grid">
                                <!-- Interest-based suggestions will be populated here -->
                            </div>
                        </div>
                    </div>

                    <!-- Loading State -->
                    <div class="find-friends-loading" id="find-friends-loading">
                        <div class="loading-spinner"></div>
                        <p>Finding friends for you...</p>
                    </div>

                    <!-- Empty State -->
                    <div class="find-friends-empty" id="find-friends-empty" style="display: none;">
                        <div class="empty-content">
                            <i class="fas fa-user-friends"></i>
                            <h3>No People Found</h3>
                            <p id="empty-message">Try adjusting your filters or search terms</p>
                            <div class="empty-actions">
                                <button class="empty-action-btn" onclick="findFriendsUI.clearFilters()">
                                    <i class="fas fa-filter"></i> Clear Filters
                                </button>
                                <button class="empty-action-btn" onclick="findFriendsUI.importContacts()">
                                    <i class="fas fa-address-book"></i> Import Contacts
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', findFriendsModalHTML);
        this.injectFindFriendsStyles();
    }

    /**
     * Setup event listeners for the find friends interface
     */
    setupEventListeners() {
        // Search input with debouncing
        let searchTimeout;
        const searchInput = document.getElementById('find-friends-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }

        // Filter inputs
        document.getElementById('radius-slider')?.addEventListener('input', (e) => {
            this.updateRadiusDisplay(e.target.value);
        });

        // Age inputs
        document.getElementById('min-age')?.addEventListener('change', () => this.updateFilters());
        document.getElementById('max-age')?.addEventListener('change', () => this.updateFilters());

        // Location input
        document.getElementById('location-input')?.addEventListener('change', () => this.updateFilters());

        // Preference toggles
        document.getElementById('mutual-friends-toggle')?.addEventListener('change', () => this.updateFilters());
        document.getElementById('online-only-toggle')?.addEventListener('change', () => this.updateFilters());
        document.getElementById('verified-only-toggle')?.addEventListener('change', () => this.updateFilters());

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('find-friends-modal')?.classList.contains('show')) {
                this.closeFindFriends();
            }
        });

        // Click outside to close filters
        document.addEventListener('click', (e) => {
            const filtersPanel = document.getElementById('find-friends-filters');
            const filtersToggle = document.getElementById('filters-toggle');
            
            if (filtersPanel && filtersPanel.classList.contains('show') && 
                !filtersPanel.contains(e.target) && 
                !filtersToggle.contains(e.target)) {
                this.toggleFilters();
            }
        });
    }

    /**
     * Open the Find Friends modal
     */
    async openFindFriends() {
        const modal = document.getElementById('find-friends-modal');
        if (!modal) {
            console.error('Find Friends modal not found in DOM');
            return;
        }

        console.log('Opening Find Friends modal...');
        modal.classList.add('show');
        
        // Show loading immediately
        this.showLoading();
        
        try {
            // Load initial data
            console.log('Loading initial Find Friends data...');
            await this.loadInitialData();
            this.hideLoading();
            
            // Track analytics
            this.trackEvent('find_friends_opened');
            
            console.log('Find Friends modal opened successfully');
        } catch (error) {
            console.error('Failed to load Find Friends data:', error);
            this.hideLoading();
            
            // Still show the modal but with empty state
            this.showEmptyState('suggested-users-grid');
            
            // Show a toast message instead of replacing the modal
            if (this.app && this.app.showToast) {
                this.app.showToast('Unable to load friend suggestions. Try refreshing.', 'warning');
            }
        }
    }

    /**
     * Close the Find Friends modal
     */
    closeFindFriends() {
        const modal = document.getElementById('find-friends-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Load initial data for the find friends interface
     */
    async loadInitialData() {
        try {
            // Load suggested friends (default tab)
            await this.loadSuggestedFriends();
            
            // Update stats in header
            this.updateHeaderStats();
            
            // Update tab counters
            this.updateTabCounters();
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
            throw error;
        }
    }

    /**
     * Switch between tabs
     */
    async switchTab(tabName) {
        if (this.currentTab === tabName) return;

        // Update tab buttons
        document.querySelectorAll('.find-friends-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.content === tabName);
        });

        this.currentTab = tabName;

        // Load data for the selected tab if not already loaded
        this.showLoading();
        try {
            switch (tabName) {
                case 'suggested':
                    await this.loadSuggestedFriends();
                    break;
                case 'contacts':
                    await this.loadContactBasedSuggestions();
                    break;
                case 'nearby':
                    await this.loadNearbyFriends();
                    break;
                case 'interests':
                    await this.loadInterestBasedSuggestions();
                    break;
            }
            this.hideLoading();
        } catch (error) {
            console.error(`Failed to load ${tabName} data:`, error);
            this.hideLoading();
            this.showError(`Failed to load ${tabName} suggestions`);
        }

        // Track tab switch
        this.trackEvent('find_friends_tab_switched', { tab: tabName });
    }

    /**
     * Load suggested friends
     */
    async loadSuggestedFriends() {
        try {
            // Simulate API call
            const suggestions = await this.fetchSuggestedFriends();
            this.suggestions.set('suggested', suggestions);
            this.renderSuggestions('suggested-users-grid', suggestions);
        } catch (error) {
            console.error('Failed to load suggested friends:', error);
            throw error;
        }
    }

    /**
     * Load contact-based suggestions
     */
    async loadContactBasedSuggestions() {
        try {
            const suggestions = await this.fetchContactBasedSuggestions();
            this.suggestions.set('contacts', suggestions);
            this.renderSuggestions('contacts-users-grid', suggestions);
        } catch (error) {
            console.error('Failed to load contact suggestions:', error);
            throw error;
        }
    }

    /**
     * Load nearby friends
     */
    async loadNearbyFriends() {
        try {
            if (!this.userLocation) {
                await this.checkLocationPermission();
            }

            const suggestions = await this.fetchNearbyFriends();
            this.suggestions.set('nearby', suggestions);
            this.renderSuggestions('nearby-users-grid', suggestions);
        } catch (error) {
            console.error('Failed to load nearby friends:', error);
            this.showLocationError();
        }
    }

    /**
     * Load interest-based suggestions
     */
    async loadInterestBasedSuggestions() {
        try {
            const suggestions = await this.fetchInterestBasedSuggestions();
            this.suggestions.set('interests', suggestions);
            this.renderSuggestions('interests-users-grid', suggestions);
        } catch (error) {
            console.error('Failed to load interest-based suggestions:', error);
            throw error;
        }
    }

    /**
     * Fetch suggested friends from API (simulated)
     */
    async fetchSuggestedFriends() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return this.generateMockSuggestions('suggested', 12);
    }

    /**
     * Fetch contact-based suggestions (simulated)
     */
    async fetchContactBasedSuggestions() {
        await new Promise(resolve => setTimeout(resolve, 800));
        return this.generateMockSuggestions('contacts', 8);
    }

    /**
     * Fetch nearby friends (simulated)
     */
    async fetchNearbyFriends() {
        if (!this.userLocation) {
            throw new Error('Location permission required');
        }

        await new Promise(resolve => setTimeout(resolve, 1200));
        return this.generateMockSuggestions('nearby', 6);
    }

    /**
     * Fetch interest-based suggestions (simulated)
     */
    async fetchInterestBasedSuggestions() {
        await new Promise(resolve => setTimeout(resolve, 900));
        return this.generateMockSuggestions('interests', 10);
    }

    /**
     * Generate mock suggestion data
     */
    generateMockSuggestions(type, count) {
        const names = ['Alex Rivera', 'Sarah Chen', 'Mike Johnson', 'Emma Wilson', 'David Kim', 'Lisa Garcia', 'Tom Brown', 'Anna Martinez', 'Jake Davis', 'Sophie Taylor', 'Ryan Lee', 'Zoe Anderson'];
        const professions = ['Software Developer', 'Photographer', 'Designer', 'Teacher', 'Marketing Manager', 'Artist', 'Writer', 'Engineer', 'Consultant', 'Entrepreneur'];
        const locations = ['San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Austin', 'Seattle', 'Boston', 'Denver', 'Portland', 'Miami'];
        const reasons = {
            suggested: ['Similar interests', 'Mutual friends', 'Lives nearby', 'Common connections'],
            contacts: ['In your contacts', 'Facebook friend', 'Email contact', 'LinkedIn connection'],
            nearby: ['2 miles away', '5 miles away', '1 mile away', '8 miles away'],
            interests: ['Loves photography', 'Tech enthusiast', 'Travel lover', 'Fitness enthusiast']
        };

        const suggestions = [];
        
        for (let i = 0; i < count; i++) {
            const nameIndex = i % names.length;
            const suggestion = {
                id: `${type}-${i}`,
                name: names[nameIndex],
                username: `@${names[nameIndex].toLowerCase().replace(/\s+/g, '')}`,
                avatar: `https://source.unsplash.com/150x150/?portrait,person&sig=${Date.now() + i}`,
                bio: `${professions[i % professions.length]} based in ${locations[i % locations.length]}`,
                profession: professions[i % professions.length],
                location: locations[i % locations.length],
                verified: Math.random() > 0.7,
                online: Math.random() > 0.6,
                mutualFriends: Math.floor(Math.random() * 15) + 1,
                mutualFriendsAvatars: this.generateMutualFriendsAvatars(3),
                connectionReason: reasons[type][i % reasons[type].length],
                interests: this.generateRandomInterests(),
                distance: type === 'nearby' ? Math.floor(Math.random() * 10) + 1 : null,
                followers: Math.floor(Math.random() * 10000) + 100,
                posts: Math.floor(Math.random() * 500) + 10,
                joinedDate: this.generateRandomDate(),
                lastActive: this.generateLastActive()
            };
            suggestions.push(suggestion);
        }

        return suggestions;
    }

    /**
     * Generate mutual friends avatars
     */
    generateMutualFriendsAvatars(count) {
        return Array.from({length: count}, (_, i) => ({
            name: `Friend ${i + 1}`,
            avatar: `https://source.unsplash.com/32x32/?face&sig=${Date.now() + i + 1000}`
        }));
    }

    /**
     * Generate random interests
     */
    generateRandomInterests() {
        const allInterests = ['photography', 'travel', 'music', 'sports', 'food', 'art', 'technology', 'fitness'];
        const numInterests = Math.floor(Math.random() * 4) + 1;
        const shuffled = allInterests.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numInterests);
    }

    /**
     * Generate random date
     */
    generateRandomDate() {
        const start = new Date(2020, 0, 1);
        const end = new Date();
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    /**
     * Generate last active time
     */
    generateLastActive() {
        const options = ['Just now', '5m ago', '1h ago', '3h ago', '1d ago', '2d ago', '1w ago'];
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Render suggestions in the specified container
     */
    renderSuggestions(containerId, suggestions) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!suggestions || suggestions.length === 0) {
            this.showEmptyState(containerId);
            return;
        }

        container.innerHTML = suggestions.map(suggestion => this.createSuggestionCard(suggestion)).join('');
    }

    /**
     * Create a suggestion card HTML
     */
    createSuggestionCard(suggestion) {
        const mutualFriendsDisplay = suggestion.mutualFriends > 0 ? `
            <div class="mutual-friends">
                <div class="mutual-avatars">
                    ${suggestion.mutualFriendsAvatars.slice(0, 2).map(friend => 
                        `<img src="${friend.avatar}" alt="${friend.name}" class="mutual-avatar">`
                    ).join('')}
                    ${suggestion.mutualFriends > 2 ? `<span class="more-mutual">+${suggestion.mutualFriends - 2}</span>` : ''}
                </div>
                <span class="mutual-text">${suggestion.mutualFriends} mutual friends</span>
            </div>
        ` : '';

        const interestsDisplay = suggestion.interests.length > 0 ? `
            <div class="suggestion-interests">
                ${suggestion.interests.slice(0, 3).map(interest => 
                    `<span class="interest-badge">${this.getInterestEmoji(interest)} ${interest}</span>`
                ).join('')}
            </div>
        ` : '';

        const distanceDisplay = suggestion.distance ? `
            <span class="distance-info">
                <i class="fas fa-map-marker-alt"></i> ${suggestion.distance} miles away
            </span>
        ` : '';

        return `
            <div class="suggestion-card" data-user-id="${suggestion.id}">
                <div class="suggestion-header">
                    <div class="profile-info" onclick="findFriendsUI.viewProfile('${suggestion.id}')">
                        <div class="profile-avatar-container">
                            <img src="${suggestion.avatar}" 
                                 alt="${suggestion.name}" 
                                 class="profile-avatar"
                                 onerror="this.src='https://via.placeholder.com/150x150/cccccc/666666?text=No+Image'">
                            ${suggestion.online ? '<div class="online-indicator"></div>' : ''}
                            ${suggestion.verified ? '<div class="verified-badge"><i class="fas fa-check-circle"></i></div>' : ''}
                        </div>
                        <div class="profile-details">
                            <h3 class="profile-name">${suggestion.name}</h3>
                            <p class="profile-username">${suggestion.username}</p>
                            <p class="profile-bio">${suggestion.bio}</p>
                        </div>
                    </div>
                    <div class="suggestion-actions">
                        <button class="action-btn primary follow-btn" 
                                onclick="findFriendsUI.followUser('${suggestion.id}')"
                                data-user-id="${suggestion.id}">
                            <i class="fas fa-user-plus"></i>
                            Follow
                        </button>
                        <button class="action-btn secondary options-btn" 
                                onclick="findFriendsUI.showUserOptions('${suggestion.id}', event)">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                        <button class="action-btn dismiss-btn" 
                                onclick="findFriendsUI.dismissSuggestion('${suggestion.id}')"
                                title="Not interested">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="suggestion-body">
                    <div class="connection-reason">
                        <i class="fas fa-info-circle"></i>
                        <span>${suggestion.connectionReason}</span>
                        ${distanceDisplay}
                    </div>
                    
                    ${mutualFriendsDisplay}
                    ${interestsDisplay}
                    
                    <div class="suggestion-stats">
                        <span class="stat-item">
                            <i class="fas fa-users"></i>
                            ${this.formatNumber(suggestion.followers)} followers
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-images"></i>
                            ${suggestion.posts} posts
                        </span>
                        ${suggestion.online ? '<span class="online-status">Online</span>' : `<span class="offline-status">Last seen ${suggestion.lastActive}</span>`}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get emoji for interest
     */
    getInterestEmoji(interest) {
        const emojiMap = {
            photography: '📸',
            travel: '✈️',
            music: '🎵',
            sports: '⚽',
            food: '🍕',
            art: '🎨',
            technology: '💻',
            fitness: '💪'
        };
        return emojiMap[interest] || '🌟';
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
     * Follow a user
     */
    async followUser(userId) {
        const button = document.querySelector(`[data-user-id="${userId}"] .follow-btn`);
        if (!button || this.pendingFollows.has(userId)) return;

        this.pendingFollows.add(userId);
        
        // Update button state
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Following...';
        button.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update button to following state
            button.innerHTML = '<i class="fas fa-check"></i> Following';
            button.classList.remove('primary');
            button.classList.add('success');
            
            this.app.showToast('Now following!', 'success');
            
            // Track event
            this.trackEvent('user_followed', { userId });

        } catch (error) {
            console.error('Failed to follow user:', error);
            button.innerHTML = originalContent;
            button.disabled = false;
            this.app.showToast('Failed to follow user', 'error');
        } finally {
            this.pendingFollows.delete(userId);
        }
    }

    /**
     * Dismiss a suggestion
     */
    async dismissSuggestion(userId) {
        const card = document.querySelector(`[data-user-id="${userId}"]`);
        if (!card || this.dismissedUsers.has(userId)) return;

        // Animate card out
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateX(-100px)';

        setTimeout(() => {
            card.remove();
        }, 300);

        this.dismissedUsers.add(userId);
        
        // Track event
        this.trackEvent('suggestion_dismissed', { userId });
        
        this.app.showToast('Suggestion removed', 'info');
    }

    /**
     * Show user options menu
     */
    showUserOptions(userId, event) {
        event.stopPropagation();
        
        // Remove existing menu
        const existingMenu = document.querySelector('.user-options-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.className = 'user-options-menu';
        menu.innerHTML = `
            <div class="option-item" onclick="findFriendsUI.viewProfile('${userId}')">
                <i class="fas fa-user"></i> View Profile
            </div>
            <div class="option-item" onclick="findFriendsUI.sendMessage('${userId}')">
                <i class="fas fa-comment"></i> Send Message
            </div>
            <div class="option-item" onclick="findFriendsUI.blockUser('${userId}')">
                <i class="fas fa-ban"></i> Block User
            </div>
            <div class="option-item" onclick="findFriendsUI.reportUser('${userId}')">
                <i class="fas fa-flag"></i> Report User
            </div>
        `;

        // Position menu
        const rect = event.target.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = rect.bottom + 5 + 'px';
        menu.style.left = rect.left + 'px';
        menu.style.zIndex = '10001';

        document.body.appendChild(menu);

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 100);
    }

    /**
     * View user profile
     */
    viewProfile(userId) {
        // Integrate with existing user profile system
        if (window.socialMissingUI && window.socialMissingUI.openUserProfile) {
            window.socialMissingUI.openUserProfile(userId);
        } else {
            this.app.showToast('Opening profile...', 'info');
        }
        
        // Track event
        this.trackEvent('profile_viewed', { userId });
    }

    /**
     * Send message to user
     */
    sendMessage(userId) {
        this.app.showToast('Opening message...', 'info');
        // Integration with messaging system would go here
        
        // Track event
        this.trackEvent('message_initiated', { userId });
    }

    /**
     * Block user
     */
    async blockUser(userId) {
        if (confirm('Are you sure you want to block this user? They won\'t be able to see your profile or contact you.')) {
            this.dismissSuggestion(userId);
            this.app.showToast('User blocked', 'warning');
            
            // Track event
            this.trackEvent('user_blocked', { userId });
        }
    }

    /**
     * Report user
     */
    reportUser(userId) {
        this.app.showToast('Report submitted', 'info');
        // Integration with reporting system would go here
        
        // Track event
        this.trackEvent('user_reported', { userId });
    }

    /**
     * Perform search
     */
    async performSearch(query) {
        if (!query || query.length < 2) {
            // Reset to original suggestions
            const currentSuggestions = this.suggestions.get(this.currentTab);
            if (currentSuggestions) {
                this.renderSuggestions(`${this.currentTab}-users-grid`, currentSuggestions);
            }
            return;
        }

        this.showLoading();

        try {
            // Simulate search API call
            const results = await this.searchUsers(query);
            this.renderSuggestions(`${this.currentTab}-users-grid`, results);
            this.hideLoading();
            
            // Track search
            this.trackEvent('friends_searched', { query, results: results.length });
            
        } catch (error) {
            console.error('Search failed:', error);
            this.hideLoading();
            this.showError('Search failed');
        }
    }

    /**
     * Search users (simulated)
     */
    async searchUsers(query) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const allSuggestions = this.suggestions.get(this.currentTab) || [];
        return allSuggestions.filter(suggestion => 
            suggestion.name.toLowerCase().includes(query.toLowerCase()) ||
            suggestion.username.toLowerCase().includes(query.toLowerCase()) ||
            suggestion.bio.toLowerCase().includes(query.toLowerCase()) ||
            suggestion.interests.some(interest => interest.toLowerCase().includes(query.toLowerCase()))
        );
    }

    /**
     * Toggle filters panel
     */
    toggleFilters() {
        const filtersPanel = document.getElementById('find-friends-filters');
        const toggleBtn = document.getElementById('filters-toggle');
        
        if (filtersPanel) {
            const isVisible = filtersPanel.classList.toggle('show');
            toggleBtn.classList.toggle('active', isVisible);
        }
    }

    /**
     * Update radius display
     */
    updateRadiusDisplay(value) {
        const radiusValue = document.getElementById('radius-value');
        if (radiusValue) {
            radiusValue.textContent = value;
        }
        this.currentFilters.radius = parseInt(value);
    }

    /**
     * Toggle interest filter
     */
    toggleInterest(interest) {
        const tag = document.querySelector(`[data-interest="${interest}"]`);
        if (!tag) return;

        const isActive = tag.classList.toggle('active');
        
        if (isActive) {
            if (!this.currentFilters.interests.includes(interest)) {
                this.currentFilters.interests.push(interest);
            }
        } else {
            this.currentFilters.interests = this.currentFilters.interests.filter(i => i !== interest);
        }

        this.updateActiveFilterCount();
    }

    /**
     * Handle custom interest input
     */
    handleCustomInterest(event) {
        if (event.key === 'Enter' && event.target.value.trim()) {
            const interest = event.target.value.trim().toLowerCase();
            this.addCustomInterest(interest);
            event.target.value = '';
        }
    }

    /**
     * Add custom interest
     */
    addCustomInterest(interest) {
        if (this.currentFilters.interests.includes(interest)) return;

        this.currentFilters.interests.push(interest);
        
        // Add to UI
        const popularInterests = document.getElementById('popular-interests');
        if (popularInterests) {
            const tag = document.createElement('span');
            tag.className = 'interest-tag active custom';
            tag.dataset.interest = interest;
            tag.innerHTML = `🌟 ${interest} <i class="fas fa-times remove-interest" onclick="findFriendsUI.removeCustomInterest('${interest}')"></i>`;
            tag.onclick = (e) => {
                if (!e.target.classList.contains('remove-interest')) {
                    this.toggleInterest(interest);
                }
            };
            popularInterests.appendChild(tag);
        }

        this.updateActiveFilterCount();
    }

    /**
     * Remove custom interest
     */
    removeCustomInterest(interest) {
        const tag = document.querySelector(`[data-interest="${interest}"].custom`);
        if (tag) tag.remove();

        this.currentFilters.interests = this.currentFilters.interests.filter(i => i !== interest);
        this.updateActiveFilterCount();
    }

    /**
     * Update filters from UI
     */
    updateFilters() {
        // Location
        const locationInput = document.getElementById('location-input');
        if (locationInput) this.currentFilters.location = locationInput.value;

        // Age range
        const minAge = document.getElementById('min-age');
        const maxAge = document.getElementById('max-age');
        if (minAge) this.currentFilters.minAge = parseInt(minAge.value) || 18;
        if (maxAge) this.currentFilters.maxAge = parseInt(maxAge.value) || 65;

        // Preferences
        const mutualToggle = document.getElementById('mutual-friends-toggle');
        const onlineToggle = document.getElementById('online-only-toggle');
        const verifiedToggle = document.getElementById('verified-only-toggle');
        
        if (mutualToggle) this.currentFilters.mutualFriends = mutualToggle.checked;
        if (onlineToggle) this.currentFilters.onlineOnly = onlineToggle.checked;
        if (verifiedToggle) this.currentFilters.verifiedOnly = verifiedToggle.checked;

        this.updateActiveFilterCount();
    }

    /**
     * Apply filters to current results
     */
    async applyFilters() {
        this.updateFilters();
        this.showLoading();
        
        try {
            // Re-fetch data with new filters
            await this.switchTab(this.currentTab);
            this.hideLoading();
            this.toggleFilters(); // Close filters panel
            
            this.app.showToast('Filters applied', 'success');
            
            // Track event
            this.trackEvent('filters_applied', { filters: this.currentFilters });
            
        } catch (error) {
            console.error('Failed to apply filters:', error);
            this.hideLoading();
            this.app.showToast('Failed to apply filters', 'error');
        }
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        // Reset filter values
        this.currentFilters = {
            location: '',
            radius: 25,
            minAge: 18,
            maxAge: 65,
            interests: [],
            mutualFriends: false,
            onlineOnly: false,
            verifiedOnly: false
        };

        // Update UI
        const locationInput = document.getElementById('location-input');
        const radiusSlider = document.getElementById('radius-slider');
        const radiusValue = document.getElementById('radius-value');
        const minAge = document.getElementById('min-age');
        const maxAge = document.getElementById('max-age');
        const mutualToggle = document.getElementById('mutual-friends-toggle');
        const onlineToggle = document.getElementById('online-only-toggle');
        const verifiedToggle = document.getElementById('verified-only-toggle');

        if (locationInput) locationInput.value = '';
        if (radiusSlider) radiusSlider.value = '25';
        if (radiusValue) radiusValue.textContent = '25';
        if (minAge) minAge.value = '18';
        if (maxAge) maxAge.value = '65';
        if (mutualToggle) mutualToggle.checked = false;
        if (onlineToggle) onlineToggle.checked = false;
        if (verifiedToggle) verifiedToggle.checked = false;

        // Clear interest tags
        document.querySelectorAll('.interest-tag.active').forEach(tag => {
            tag.classList.remove('active');
        });
        document.querySelectorAll('.interest-tag.custom').forEach(tag => {
            tag.remove();
        });

        this.updateActiveFilterCount();
        this.app.showToast('Filters cleared', 'info');
    }

    /**
     * Update active filter count
     */
    updateActiveFilterCount() {
        let count = 0;
        
        if (this.currentFilters.location) count++;
        if (this.currentFilters.interests.length > 0) count++;
        if (this.currentFilters.mutualFriends) count++;
        if (this.currentFilters.onlineOnly) count++;
        if (this.currentFilters.verifiedOnly) count++;
        if (this.currentFilters.minAge !== 18 || this.currentFilters.maxAge !== 65) count++;

        const filterCount = document.getElementById('active-filter-count');
        if (filterCount) {
            if (count > 0) {
                filterCount.textContent = count;
                filterCount.style.display = 'inline';
            } else {
                filterCount.style.display = 'none';
            }
        }
    }

    /**
     * Load more suggestions
     */
    async loadMoreSuggestions() {
        const button = document.getElementById('load-more-suggested');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        }

        try {
            const moreSuggestions = await this.fetchMoreSuggestions(this.currentTab);
            const existingSuggestions = this.suggestions.get(this.currentTab) || [];
            const allSuggestions = [...existingSuggestions, ...moreSuggestions];
            
            this.suggestions.set(this.currentTab, allSuggestions);
            this.renderSuggestions(`${this.currentTab}-users-grid`, allSuggestions);
            
            this.app.showToast(`Loaded ${moreSuggestions.length} more suggestions`, 'success');
            
        } catch (error) {
            console.error('Failed to load more suggestions:', error);
            this.app.showToast('Failed to load more suggestions', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-chevron-down"></i> Load More Suggestions';
            }
        }
    }

    /**
     * Fetch more suggestions
     */
    async fetchMoreSuggestions(type) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.generateMockSuggestions(type, 6);
    }

    /**
     * Import contacts
     */
    async importContacts() {
        this.app.showToast('Contact import started...', 'info');
        
        try {
            // Simulate contact import process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.app.showToast('Found 12 friends from your contacts!', 'success');
            
            // Refresh contacts tab
            await this.loadContactBasedSuggestions();
            
            // Track event
            this.trackEvent('contacts_imported');
            
        } catch (error) {
            console.error('Failed to import contacts:', error);
            this.app.showToast('Failed to import contacts', 'error');
        }
    }

    /**
     * Invite friends
     */
    inviteFriends() {
        // Create invite modal
        const inviteModal = document.createElement('div');
        inviteModal.className = 'invite-friends-modal';
        inviteModal.innerHTML = `
            <div class="modal-overlay" onclick="this.remove()"></div>
            <div class="invite-modal-content">
                <div class="invite-header">
                    <h3>Invite Friends to ConnectHub</h3>
                    <button class="close-invite" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="invite-methods">
                    <div class="invite-method" onclick="findFriendsUI.inviteByEmail()">
                        <i class="fas fa-envelope"></i>
                        <h4>Email</h4>
                        <p>Send email invitations</p>
                    </div>
                    <div class="invite-method" onclick="findFriendsUI.inviteBySMS()">
                        <i class="fas fa-sms"></i>
                        <h4>SMS</h4>
                        <p>Send text message invites</p>
                    </div>
                    <div class="invite-method" onclick="findFriendsUI.shareInviteLink()">
                        <i class="fas fa-link"></i>
                        <h4>Share Link</h4>
                        <p>Copy invitation link</p>
                    </div>
                    <div class="invite-method" onclick="findFriendsUI.shareToSocial()">
                        <i class="fas fa-share-alt"></i>
                        <h4>Social Media</h4>
                        <p>Share on other platforms</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(inviteModal);
    }

    /**
     * Invite by email
     */
    inviteByEmail() {
        this.app.showToast('Email invitation feature coming soon!', 'info');
    }

    /**
     * Invite by SMS
     */
    inviteBySMS() {
        this.app.showToast('SMS invitation feature coming soon!', 'info');
    }

    /**
     * Share invite link
     */
    shareInviteLink() {
        const inviteLink = `${window.location.origin}/invite/${this.generateInviteCode()}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(inviteLink).then(() => {
                this.app.showToast('Invite link copied to clipboard!', 'success');
            });
        } else {
            this.app.showToast('Invite link: ' + inviteLink, 'info');
        }
    }

    /**
     * Share to social media
     */
    shareToSocial() {
        this.app.showToast('Social sharing feature coming soon!', 'info');
    }

    /**
     * Generate invite code
     */
    generateInviteCode() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    /**
     * Check location permission
     */
    async checkLocationPermission() {
        if ('geolocation' in navigator) {
            try {
                const permission = await navigator.permissions.query({name: 'geolocation'});
                this.locationPermission = permission.state;
                
                if (permission.state === 'granted') {
                    this.getCurrentLocation();
                } else {
                    this.showLocationPrompt();
                }
                
            } catch (error) {
                console.error('Location permission check failed:', error);
                this.showLocationPrompt();
            }
        } else {
            this.showLocationUnavailable();
        }
    }

    /**
     * Request location permission
     */
    async requestLocationPermission() {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            
            this.userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            
            this.updateLocationStatus('Location enabled');
            
            // Refresh nearby tab if it's active
            if (this.currentTab === 'nearby') {
                await this.loadNearbyFriends();
            }
            
        } catch (error) {
            console.error('Location permission denied:', error);
            this.updateLocationStatus('Location access denied');
        }
    }

    /**
     * Get current location
     */
    getCurrentLocation() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                this.updateLocationStatus('Location enabled');
            },
            (error) => {
                console.error('Failed to get location:', error);
                this.showLocationPrompt();
            }
        );
    }

    /**
     * Update location status
     */
    updateLocationStatus(status) {
        const statusText = document.getElementById('location-status-text');
        const enableBtn = document.getElementById('enable-location-btn');
        
        if (statusText) statusText.textContent = status;
        
        if (enableBtn) {
            enableBtn.style.display = status.includes('denied') || status.includes('unavailable') ? 'inline-block' : 'none';
        }
    }

    /**
     * Show location prompt
     */
    showLocationPrompt() {
        this.updateLocationStatus('Enable location to find people nearby');
    }

    /**
     * Show location unavailable
     */
    showLocationUnavailable() {
        this.updateLocationStatus('Location not available');
    }

    /**
     * Show location error
     */
    showLocationError() {
        const grid = document.getElementById('nearby-users-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="location-error-state">
                    <i class="fas fa-map-marker-slash"></i>
                    <h3>Location Required</h3>
                    <p>To find people nearby, please enable location permissions</p>
                    <button class="enable-location-btn-large" onclick="findFriendsUI.requestLocationPermission()">
                        <i class="fas fa-map-marker-alt"></i> Enable Location
                    </button>
                </div>
            `;
        }
    }

    /**
     * Start voice search
     */
    startVoiceSearch() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const searchInput = document.getElementById('find-friends-search-input');
                if (searchInput) {
                    searchInput.value = transcript;
                    this.performSearch(transcript);
                }
            };
            
            recognition.onerror = () => {
                this.app.showToast('Voice search failed', 'error');
            };
            
            recognition.start();
            this.app.showToast('Listening...', 'info');
        } else {
            this.app.showToast('Voice search not supported', 'warning');
        }
    }

    /**
     * Update header stats
     */
    updateHeaderStats() {
        const nearbySuggestions = this.suggestions.get('nearby') || [];
        const allSuggestions = Array.from(this.suggestions.values()).flat();
        const mutualCount = allSuggestions.filter(s => s.mutualFriends > 0).length;

        const nearbyCount = document.getElementById('nearby-count');
        const mutualCountEl = document.getElementById('mutual-count');

        if (nearbyCount) nearbyCount.textContent = nearbySuggestions.length;
        if (mutualCountEl) mutualCountEl.textContent = mutualCount;
    }

    /**
     * Update tab counters
     */
    updateTabCounters() {
        const tabs = ['suggested', 'contacts', 'nearby', 'interests'];
        tabs.forEach(tab => {
            const suggestions = this.suggestions.get(tab) || [];
            const countEl = document.getElementById(`${tab === 'nearby' ? 'nearby-tab' : tab}-count`);
            if (countEl) {
                countEl.textContent = suggestions.length;
                countEl.style.display = suggestions.length > 0 ? 'inline' : 'none';
            }
        });
    }

    /**
     * Show loading state
     */
    showLoading() {
        const loading = document.getElementById('find-friends-loading');
        const content = document.getElementById('find-friends-content');
        
        if (loading) loading.style.display = 'flex';
        if (content) content.style.display = 'none';
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        const loading = document.getElementById('find-friends-loading');
        const content = document.getElementById('find-friends-content');
        
        if (loading) loading.style.display = 'none';
        if (content) content.style.display = 'block';
    }

    /**
     * Show empty state
     */
    showEmptyState(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const messages = {
            'suggested-users-grid': 'No suggestions available right now. Try adjusting your interests or connecting with more people.',
            'contacts-users-grid': 'No contacts found. Import your contacts to find friends who are already on ConnectHub.',
            'nearby-users-grid': 'No people found nearby. Try expanding your search radius or enabling location permissions.',
            'interests-users-grid': 'No people found with similar interests. Try following more topics or updating your interests.'
        };

        container.innerHTML = `
            <div class="empty-state-container">
                <i class="fas fa-user-friends"></i>
                <h3>No People Found</h3>
                <p>${messages[containerId] || 'Try adjusting your search criteria.'}</p>
            </div>
        `;
    }

    /**
     * Show error state
     */
    showError(message) {
        const content = document.getElementById('find-friends-content');
        if (content) {
            content.innerHTML = `
                <div class="error-state-container">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Something went wrong</h3>
                    <p>${message}</p>
                    <button class="retry-btn" onclick="findFriendsUI.openFindFriends()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `;
        }
    }

    /**
     * Track analytics event
     */
    trackEvent(eventName, data = {}) {
        if (this.app && this.app.trackEvent) {
            this.app.trackEvent(eventName, data);
        } else {
            console.log(`Analytics: ${eventName}`, data);
        }
    }

    /**
     * Inject CSS styles for the Find Friends interface
     */
    injectFindFriendsStyles() {
        if (document.getElementById('find-friends-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'find-friends-styles';
        styles.textContent = `
            /* Find Friends Modal Styles */
            .find-friends-modal {
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

            .find-friends-modal.show {
                opacity: 1;
                visibility: visible;
            }

            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(5px);
            }

            .find-friends-container {
                position: relative;
                width: 95%;
                max-width: 1400px;
                height: 90%;
                margin: 2.5% auto;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform: translateY(30px);
                transition: transform 0.3s ease;
            }

            .find-friends-modal.show .find-friends-container {
                transform: translateY(0);
            }

            /* Header Styles */
            .find-friends-header {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                padding: 20px 30px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
            }

            .header-title h1 {
                color: white;
                font-size: 28px;
                font-weight: 700;
                margin: 0 0 5px 0;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .header-title p {
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
                margin: 0;
            }

            .header-stats {
                display: flex;
                gap: 20px;
                color: white;
            }

            .stat-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 14px;
                background: rgba(255, 255, 255, 0.1);
                padding: 8px 12px;
                border-radius: 15px;
                backdrop-filter: blur(5px);
            }

            .header-actions {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .header-action-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                padding: 10px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .header-action-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }

            .close-find-friends {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 18px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .close-find-friends:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: rotate(90deg);
            }

            /* Navigation Tabs */
            .find-friends-tabs {
                background: rgba(255, 255, 255, 0.05);
                display: flex;
                padding: 0 30px;
                gap: 2px;
                overflow-x: auto;
            }

            .find-friends-tab {
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                padding: 15px 20px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                border-radius: 10px 10px 0 0;
                white-space: nowrap;
                display: flex;
                align-items: center;
                gap: 8px;
                position: relative;
            }

            .find-friends-tab.active {
                background: white;
                color: #667eea;
            }

            .find-friends-tab:hover:not(.active) {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }

            .tab-count {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                font-size: 12px;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
            }

            .find-friends-tab.active .tab-count {
                background: #667eea;
                color: white;
            }

            /* Search and Filters */
            .find-friends-search {
                background: white;
                padding: 20px 30px;
                display: flex;
                align-items: center;
                gap: 15px;
                border-bottom: 1px solid #eee;
            }

            .search-input-container {
                flex: 1;
                position: relative;
                display: flex;
                align-items: center;
            }

            .search-icon {
                position: absolute;
                left: 15px;
                color: #999;
                z-index: 2;
            }

            #find-friends-search-input {
                width: 100%;
                padding: 12px 15px 12px 45px;
                border: 2px solid #f0f0f0;
                border-radius: 25px;
                font-size: 14px;
                outline: none;
                transition: all 0.3s ease;
                background: #fafafa;
            }

            #find-friends-search-input:focus {
                border-color: #667eea;
                background: white;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .voice-search-btn {
                position: absolute;
                right: 8px;
                background: #667eea;
                border: none;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .voice-search-btn:hover {
                background: #5a67d8;
                transform: scale(1.1);
            }

            .filters-toggle-btn {
                background: #f8f9fa;
                border: 2px solid #e9ecef;
                color: #495057;
                padding: 12px 20px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                position: relative;
            }

            .filters-toggle-btn.active {
                background: #667eea;
                border-color: #667eea;
                color: white;
            }

            .filter-count {
                background: #dc3545;
                color: white;
                font-size: 12px;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
                position: absolute;
                top: -5px;
                right: -5px;
            }

            /* Filters Panel */
            .find-friends-filters {
                background: white;
                border-bottom: 1px solid #eee;
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
            }

            .find-friends-filters.show {
                max-height: 400px;
            }

            .filters-content {
                padding: 20px 30px;
            }

            .filter-section {
                margin-bottom: 25px;
            }

            .filter-section h4 {
                color: #333;
                font-size: 16px;
                font-weight: 600;
                margin: 0 0 15px 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .location-filters {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            #location-input {
                padding: 10px 15px;
                border: 2px solid #f0f0f0;
                border-radius: 20px;
                font-size: 14px;
                outline: none;
                transition: all 0.3s ease;
            }

            #location-input:focus {
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .radius-control {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .radius-control label {
                font-size: 14px;
                color: #666;
                white-space: nowrap;
            }

            #radius-value {
                font-weight: 600;
                color: #667eea;
            }

            #radius-slider {
                flex: 1;
                height: 6px;
                border-radius: 3px;
                background: #f0f0f0;
                outline: none;
                appearance: none;
                cursor: pointer;
            }

            #radius-slider::-webkit-slider-thumb {
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #667eea;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
            }

            .age-filters {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .age-inputs {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            #min-age, #max-age {
                width: 80px;
                padding: 8px 12px;
                border: 2px solid #f0f0f0;
                border-radius: 15px;
                font-size: 14px;
                text-align: center;
                outline: none;
                transition: all 0.3s ease;
            }

            #min-age:focus, #max-age:focus {
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .interests-filter {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .interest-tags-container {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .popular-interests {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }

            .interest-tag {
                background: #f8f9fa;
                border: 2px solid #e9ecef;
                color: #495057;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .interest-tag.active {
                background: #667eea;
                border-color: #667eea;
                color: white;
            }

            .interest-tag:hover:not(.active) {
                background: #e9ecef;
                border-color: #dee2e6;
            }

            .interest-tag.custom {
                background: #28a745;
                border-color: #28a745;
                color: white;
            }

            .remove-interest {
                margin-left: 5px;
                cursor: pointer;
                opacity: 0.7;
            }

            .remove-interest:hover {
                opacity: 1;
            }

            #custom-interest-input {
                padding: 10px 15px;
                border: 2px solid #f0f0f0;
                border-radius: 20px;
                font-size: 14px;
                outline: none;
                transition: all 0.3s ease;
            }

            #custom-interest-input:focus {
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .preference-toggles {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .toggle-preference {
                display: flex;
                align-items: center;
                gap: 15px;
                cursor: pointer;
                font-size: 14px;
                color: #495057;
            }

            .toggle-preference input[type="checkbox"] {
                display: none;
            }

            .toggle-slider {
                position: relative;
                width: 50px;
                height: 26px;
                background: #ccc;
                border-radius: 13px;
                transition: all 0.3s ease;
            }

            .toggle-slider::before {
                content: "";
                position: absolute;
                width: 22px;
                height: 22px;
                background: white;
                border-radius: 50%;
                top: 2px;
                left: 2px;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }

            .toggle-preference input[type="checkbox"]:checked + .toggle-slider {
                background: #667eea;
            }

            .toggle-preference input[type="checkbox"]:checked + .toggle-slider::before {
                transform: translateX(24px);
            }

            .filter-actions {
                display: flex;
                gap: 15px;
                justify-content: flex-end;
                padding-top: 20px;
                border-top: 1px solid #eee;
                margin-top: 20px;
            }

            .filter-action-btn {
                padding: 10px 20px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                border: 2px solid;
            }

            .filter-action-btn.clear {
                background: transparent;
                border-color: #6c757d;
                color: #6c757d;
            }

            .filter-action-btn.clear:hover {
                background: #6c757d;
                color: white;
            }

            .filter-action-btn.apply {
                background: #667eea;
                border-color: #667eea;
                color: white;
            }

            .filter-action-btn.apply:hover {
                background: #5a67d8;
                border-color: #5a67d8;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }

            /* Content Area */
            .find-friends-content {
                flex: 1;
                background: white;
                overflow-y: auto;
                padding: 20px 30px;
            }

            .tab-content {
                display: none;
            }

            .tab-content.active {
                display: block;
            }

            .contacts-header, .nearby-header, .interests-header {
                text-align: center;
                margin-bottom: 30px;
            }

            .contacts-header h3, .nearby-header h3, .interests-header h3 {
                color: #333;
                font-size: 24px;
                font-weight: 700;
                margin: 0 0 10px 0;
            }

            .contacts-header p, .nearby-header p, .interests-header p {
                color: #666;
                font-size: 14px;
                margin: 0;
            }

            .location-status {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-top: 15px;
                color: #666;
            }

            .enable-location-btn {
                background: #667eea;
                border: none;
                color: white;
                padding: 8px 16px;
                border-radius: 15px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .enable-location-btn:hover {
                background: #5a67d8;
                transform: translateY(-1px);
            }

            /* Suggestions Grid */
            .suggestions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .suggestion-card {
                background: white;
                border: 2px solid #f0f0f0;
                border-radius: 16px;
                padding: 20px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .suggestion-card:hover {
                border-color: #667eea;
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
                transform: translateY(-2px);
            }

            .suggestion-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 15px;
                margin-bottom: 15px;
            }

            .profile-info {
                display: flex;
                align-items: flex-start;
                gap: 15px;
                cursor: pointer;
                flex: 1;
            }

            .profile-avatar-container {
                position: relative;
                flex-shrink: 0;
            }

            .profile-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid #f0f0f0;
                transition: all 0.3s ease;
            }

            .suggestion-card:hover .profile-avatar {
                border-color: #667eea;
                transform: scale(1.05);
            }

            .online-indicator {
                position: absolute;
                bottom: 2px;
                right: 2px;
                width: 16px;
                height: 16px;
                background: #28a745;
                border: 3px solid white;
                border-radius: 50%;
            }

            .verified-badge {
                position: absolute;
                top: -2px;
                right: -2px;
                background: #007bff;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
            }

            .profile-details {
                flex: 1;
                min-width: 0;
            }

            .profile-name {
                color: #333;
                font-size: 18px;
                font-weight: 700;
                margin: 0 0 4px 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .profile-username {
                color: #667eea;
                font-size: 14px;
                font-weight: 500;
                margin: 0 0 8px 0;
            }

            .profile-bio {
                color: #666;
                font-size: 14px;
                margin: 0;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .suggestion-actions {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .action-btn {
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 2px solid;
                white-space: nowrap;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                min-width: 80px;
            }

            .action-btn.primary {
                background: #667eea;
                border-color: #667eea;
                color: white;
            }

            .action-btn.primary:hover {
                background: #5a67d8;
                border-color: #5a67d8;
                transform: translateY(-1px);
            }

            .action-btn.success {
                background: #28a745;
                border-color: #28a745;
                color: white;
            }

            .action-btn.secondary {
                background: transparent;
                border-color: #6c757d;
                color: #6c757d;
            }

            .action-btn.secondary:hover {
                background: #6c757d;
                color: white;
            }

            .action-btn.dismiss-btn {
                background: transparent;
                border-color: #dc3545;
                color: #dc3545;
                padding: 6px;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                min-width: auto;
            }

            .action-btn.dismiss-btn:hover {
                background: #dc3545;
                color: white;
            }

            .suggestion-body {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .connection-reason {
                background: #f8f9fa;
                color: #495057;
                padding: 10px 15px;
                border-radius: 10px;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .distance-info {
                margin-left: auto;
                color: #667eea;
                font-weight: 500;
            }

            .mutual-friends {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .mutual-avatars {
                display: flex;
                align-items: center;
                gap: -8px;
            }

            .mutual-avatar {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 2px solid white;
                margin-left: -8px;
            }

            .mutual-avatar:first-child {
                margin-left: 0;
            }

            .more-mutual {
                background: #667eea;
                color: white;
                font-size: 10px;
                font-weight: 600;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                margin-left: -8px;
            }

            .mutual-text {
                color: #666;
                font-size: 12px;
            }

            .suggestion-interests {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }

            .interest-badge {
                background: rgba(102, 126, 234, 0.1);
                color: #667eea;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
            }

            .suggestion-stats {
                display: flex;
                align-items: center;
                gap: 15px;
                font-size: 12px;
                color: #666;
                padding-top: 10px;
                border-top: 1px solid #f0f0f0;
            }

            .stat-item {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .online-status {
                color: #28a745;
                font-weight: 600;
                margin-left: auto;
            }

            .offline-status {
                color: #6c757d;
                margin-left: auto;
            }

            /* Load More */
            .load-more-container {
                text-align: center;
                padding: 20px 0;
            }

            .load-more-btn {
                background: #f8f9fa;
                border: 2px solid #e9ecef;
                color: #495057;
                padding: 12px 30px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 10px;
            }

            .load-more-btn:hover {
                background: #e9ecef;
                border-color: #dee2e6;
                transform: translateY(-2px);
            }

            .load-more-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            /* Loading State */
            .find-friends-loading {
                display: none;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                flex: 1;
                background: white;
                gap: 20px;
                color: #666;
            }

            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid #f0f0f0;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Empty State */
            .find-friends-empty {
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 1;
                background: white;
            }

            .empty-content {
                text-align: center;
                max-width: 400px;
                padding: 40px 20px;
            }

            .empty-content i {
                font-size: 80px;
                color: #e9ecef;
                margin-bottom: 20px;
                display: block;
            }

            .empty-content h3 {
                color: #333;
                font-size: 24px;
                font-weight: 700;
                margin: 0 0 10px 0;
            }

            .empty-content p {
                color: #666;
                font-size: 16px;
                margin: 0 0 30px 0;
                line-height: 1.5;
            }

            .empty-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }

            .empty-action-btn {
                background: #667eea;
                border: none;
                color: white;
                padding: 12px 24px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .empty-action-btn:hover {
                background: #5a67d8;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }

            /* User Options Menu */
            .user-options-menu {
                background: white;
                border: 1px solid #eee;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                padding: 8px 0;
                min-width: 150px;
            }

            .option-item {
                padding: 10px 15px;
                font-size: 14px;
                color: #495057;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .option-item:hover {
                background: #f8f9fa;
                color: #667eea;
            }

            /* Error States */
            .location-error-state, .empty-state-container, .error-state-container {
                text-align: center;
                padding: 60px 20px;
                color: #666;
            }

            .location-error-state i, .empty-state-container i, .error-state-container i {
                font-size: 64px;
                color: #e9ecef;
                margin-bottom: 20px;
                display: block;
            }

            .location-error-state h3, .empty-state-container h3, .error-state-container h3 {
                font-size: 20px;
                color: #333;
                margin: 0 0 10px 0;
            }

            .location-error-state p, .empty-state-container p, .error-state-container p {
                font-size: 14px;
                margin: 0 0 20px 0;
                line-height: 1.5;
            }

            .enable-location-btn-large, .retry-btn {
                background: #667eea;
                border: none;
                color: white;
                padding: 12px 24px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }

            .enable-location-btn-large:hover, .retry-btn:hover {
                background: #5a67d8;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }

            /* Invite Modal */
            .invite-friends-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10001;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .invite-modal-content {
                background: white;
                border-radius: 16px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }

            .invite-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 25px;
            }

            .invite-header h3 {
                color: #333;
                font-size: 20px;
                font-weight: 700;
                margin: 0;
            }

            .close-invite {
                background: none;
                border: none;
                color: #666;
                font-size: 18px;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                transition: all 0.3s ease;
            }

            .close-invite:hover {
                background: #f8f9fa;
                color: #333;
            }

            .invite-methods {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }

            .invite-method {
                background: #f8f9fa;
                border: 2px solid #e9ecef;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .invite-method:hover {
                background: white;
                border-color: #667eea;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
            }

            .invite-method i {
                font-size: 32px;
                color: #667eea;
                margin-bottom: 15px;
                display: block;
            }

            .invite-method h4 {
                color: #333;
                font-size: 16px;
                font-weight: 600;
                margin: 0 0 8px 0;
            }

            .invite-method p {
                color: #666;
                font-size: 12px;
                margin: 0;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .find-friends-container {
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    border-radius: 0;
                }

                .find-friends-header {
                    padding: 15px 20px;
                    flex-direction: column;
                    align-items: stretch;
                    gap: 15px;
                }

                .header-actions {
                    justify-content: space-between;
                }

                .header-action-btn {
                    font-size: 12px;
                    padding: 8px 12px;
                }

                .find-friends-search {
                    padding: 15px 20px;
                    flex-direction: column;
                    align-items: stretch;
                    gap: 15px;
                }

                .find-friends-content {
                    padding: 15px 20px;
                }

                .suggestions-grid {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }

                .suggestion-header {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 15px;
                }

                .suggestion-actions {
                    flex-direction: row;
                    justify-content: space-between;
                }

                .filters-content {
                    padding: 15px 20px;
                }

                .filter-section h4 {
                    font-size: 14px;
                }

                .popular-interests {
                    gap: 8px;
                }

                .interest-tag {
                    font-size: 12px;
                    padding: 6px 12px;
                }

                .age-filters {
                    flex-direction: column;
                    align-items: stretch;
                }

                .filter-actions {
                    flex-direction: column;
                }
            }

            @media (max-width: 480px) {
                .suggestion-card {
                    padding: 15px;
                }

                .profile-avatar {
                    width: 50px;
                    height: 50px;
                }

                .profile-name {
                    font-size: 16px;
                }

                .profile-bio {
                    font-size: 13px;
                }

                .find-friends-tabs {
                    padding: 0 10px;
                }

                .find-friends-tab {
                    padding: 12px 15px;
                    font-size: 12px;
                }

                .find-friends-tab span {
                    display: none;
                }

                .header-stats {
                    flex-direction: column;
                    gap: 10px;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Global instance
let findFriendsUI;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window !== 'undefined') {
        window.findFriendsUI = new FindFriendsUIComponents(window.app);
        findFriendsUI = window.findFriendsUI;
        
        console.log('Find Friends UI Components ready!');
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FindFriendsUIComponents;
}
