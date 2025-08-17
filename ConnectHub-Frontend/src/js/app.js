/**
 * ConnectHub - Social Media & Dating App
 * Main Application JavaScript
 */

class ConnectHubApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'home';
        this.socket = null;
        this.posts = [];
        this.conversations = [];
        this.notifications = [];
        this.matches = [];
        this.api = window.connectHubAPI;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('Failed to initialize ConnectHub:', error);
            this.showError('Failed to initialize application');
        }
    }

    /**
     * Initialize app after DOM is ready
     */
    async initializeApp() {
        try {
            // Initialize components
            this.setupEventListeners();
            this.initializeNavigation();
            this.initializeModals();
            this.initializeToastSystem();
            this.initializeDatingSystem();
            this.initializeMessaging();
            this.initializeNotifications();
            this.initializeProfileSystem();
            this.initializePosts();
            
            // Load initial data
            await this.loadInitialData();
            
            // Hide loading screen and show app
            setTimeout(() => {
                this.hideLoadingScreen();
                this.showApp();
            }, 1500);

            console.log('ConnectHub initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app components:', error);
            this.showError('Failed to load application');
        }
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Show main app
     */
    showApp() {
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.style.display = 'flex';
            appContainer.style.flexDirection = 'column';
            appContainer.style.minHeight = '100vh';
        }
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Handle clicks outside dropdowns to close them
        document.addEventListener('click', (e) => {
            const dropdowns = document.querySelectorAll('.dropdown-menu');
            dropdowns.forEach(dropdown => {
                if (!dropdown.closest('.user-menu-dropdown').contains(e.target)) {
                    dropdown.classList.remove('show');
                }
            });
        });

        // Handle escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            this.showToast('Connection restored', 'success');
        });

        window.addEventListener('offline', () => {
            this.showToast('Connection lost', 'warning');
        });
    }

    /**
     * Initialize navigation system
     */
    initializeNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const link = item.querySelector('a');
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const section = item.getAttribute('data-section');
                    if (section) {
                        this.navigateToSection(section);
                    }
                });
            }
        });

        // User menu dropdown
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });
        }

        // Logout functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    /**
     * Navigate to a specific section
     */
    navigateToSection(section) {
        // Update navigation state
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-section') === section);
        });

        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(sec => {
            sec.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = section;
            
            // Load section-specific data
            this.loadSectionData(section);
            
            this.showToast(`Switched to ${section.charAt(0).toUpperCase() + section.slice(1)}`, 'info');
        }
    }

    /**
     * Load section-specific data
     */
    async loadSectionData(section) {
        try {
            switch (section) {
                case 'home':
                    await this.loadFeedPosts();
                    break;
                case 'dating':
                    await this.loadDatingProfiles();
                    break;
                case 'messages':
                    await this.loadConversations();
                    break;
                case 'notifications':
                    await this.loadNotifications();
                    break;
                case 'profile':
                    await this.loadProfileData();
                    break;
            }
        } catch (error) {
            console.error(`Failed to load ${section} data:`, error);
            this.showToast(`Failed to load ${section} data`, 'error');
        }
    }

    /**
     * Initialize modal system
     */
    initializeModals() {
        // Create post modal
        const createPostBtn = document.getElementById('create-post-btn');
        const createPostModal = document.getElementById('create-post-modal');
        const closeCreatePost = document.getElementById('close-create-post');

        if (createPostBtn && createPostModal) {
            createPostBtn.addEventListener('click', () => {
                this.openModal('create-post-modal');
            });
        }

        if (closeCreatePost) {
            closeCreatePost.addEventListener('click', () => {
                this.closeModal('create-post-modal');
            });
        }

        // Post input click to open modal
        const postInput = document.getElementById('post-input');
        if (postInput) {
            postInput.addEventListener('click', () => {
                this.openModal('create-post-modal');
            });
        }

        // Modal publish button
        const modalPublishBtn = document.getElementById('modal-publish-btn');
        if (modalPublishBtn) {
            modalPublishBtn.addEventListener('click', () => {
                this.handleCreatePost();
            });
        }

        // Media options in modal
        this.initializeMediaOptions();
    }

    /**
     * Initialize media options in create post modal
     */
    initializeMediaOptions() {
        const mediaButtons = {
            'modal-add-photo': () => this.handleAddPhoto(),
            'modal-add-video': () => this.handleAddVideo(),
            'modal-add-location': () => this.handleAddLocation(),
            'modal-add-emoji': () => this.handleAddEmoji()
        };

        Object.keys(mediaButtons).forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', mediaButtons[id]);
            }
        });

        // Post action buttons in main feed
        const postActionButtons = {
            'add-photo-btn': () => this.handleAddPhoto(),
            'add-video-btn': () => this.handleAddVideo(),
            'add-location-btn': () => this.handleAddLocation(),
            'add-emoji-btn': () => this.handleAddEmoji(),
            'publish-post-btn': () => this.openModal('create-post-modal')
        };

        Object.keys(postActionButtons).forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', postActionButtons[id]);
            }
        });
    }

    /**
     * Initialize dating system
     */
    initializeDatingSystem() {
        // Dating tabs
        const datingTabs = document.querySelectorAll('.dating-tab');
        datingTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchDatingTab(tab.getAttribute('data-tab'));
            });
        });

        // Initialize discovery cards
        this.initializeDiscoveryCards();
    }

    /**
     * Initialize discovery cards for dating
     */
    initializeDiscoveryCards() {
        const discoveryCards = document.getElementById('discovery-cards');
        if (discoveryCards) {
            this.loadDatingProfile();
        }
    }

    /**
     * Switch dating tab
     */
    switchDatingTab(tabName) {
        // Update tab buttons
        const tabs = document.querySelectorAll('.dating-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
        });

        // Update tab content
        const contents = document.querySelectorAll('.dating-tab-content');
        contents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-content`);
        });

        // Load tab-specific data
        this.loadDatingTabData(tabName);
        
        this.showToast(`Switched to ${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`, 'info');
    }

    /**
     * Load dating tab data
     */
    async loadDatingTabData(tabName) {
        try {
            switch (tabName) {
                case 'discover':
                    await this.loadDatingProfile();
                    break;
                case 'matches':
                    await this.loadMatches();
                    break;
                case 'dates':
                    await this.loadDates();
                    break;
                case 'chat':
                    await this.loadDatingChats();
                    break;
            }
        } catch (error) {
            console.error(`Failed to load ${tabName} data:`, error);
        }
    }

    /**
     * Initialize messaging system
     */
    initializeMessaging() {
        // New message button
        const newMessageBtn = document.getElementById('new-message-btn');
        if (newMessageBtn) {
            newMessageBtn.addEventListener('click', () => {
                this.startNewConversation();
            });
        }

        // Message search
        const messageSearch = document.getElementById('message-search');
        if (messageSearch) {
            messageSearch.addEventListener('input', (e) => {
                this.searchConversations(e.target.value);
            });
        }
    }

    /**
     * Initialize notifications system
     */
    initializeNotifications() {
        // Notification filters
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterNotifications(btn.getAttribute('data-filter'));
            });
        });
    }

    /**
     * Initialize profile system
     */
    initializeProfileSystem() {
        // Profile tabs
        const profileTabs = document.querySelectorAll('.profile-tab');
        profileTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchProfileTab(tab.getAttribute('data-tab'));
            });
        });

        // Edit profile button
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.editProfile();
            });
        }

        // Edit photo/cover buttons
        const editPhotoBtn = document.getElementById('edit-photo-btn');
        const editCoverBtn = document.getElementById('edit-cover-btn');
        
        if (editPhotoBtn) {
            editPhotoBtn.addEventListener('click', () => this.editProfilePhoto());
        }
        
        if (editCoverBtn) {
            editCoverBtn.addEventListener('click', () => this.editCoverPhoto());
        }
    }

    /**
     * Initialize posts system
     */
    initializePosts() {
        // Feed tabs
        const feedTabs = document.querySelectorAll('.feed-tab');
        feedTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchFeedTab(tab.getAttribute('data-feed'));
            });
        });

        // Load initial posts
        this.loadInitialPosts();
    }

    /**
     * Initialize toast notification system
     */
    initializeToastSystem() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    /**
     * Load initial application data
     */
    async loadInitialData() {
        try {
            // Check if user is authenticated
            if (this.api.isAuthenticated()) {
                // Load user profile from API
                const profileResponse = await this.api.getProfile();
                if (profileResponse.success) {
                    this.currentUser = profileResponse.data.user;
                }
                
                // Load initial posts
                await this.loadFeedPosts();
                
                // Update UI with user data
                this.updateUserInterface();
            } else {
                // Show demo data for now (in real app, redirect to login)
                this.loadDemoData();
                this.showToast('Demo mode - Login feature coming soon', 'info');
            }
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
            // Fallback to demo data
            this.loadDemoData();
        }
    }

    /**
     * Load demo data for showcase
     */
    loadDemoData() {
        this.currentUser = {
            id: 'demo-user-1',
            name: 'John Doe',
            username: '@johndoe',
            email: 'john@example.com',
            avatar: 'https://via.placeholder.com/150x150/4facfe/ffffff?text=JD',
            bio: 'Digital creator | Photography enthusiast | Travel lover',
            stats: {
                posts: 248,
                followers: 12400,
                following: 1024
            }
        };
        
        this.updateUserInterface();
        this.loadFeedPosts(); // Will use mock data
    }

    /**
     * Update UI with user data
     */
    updateUserInterface() {
        // Update user name displays
        const userNameElements = document.querySelectorAll('#user-name, #profile-name, .creator-name');
        userNameElements.forEach(el => {
            if (el) el.textContent = this.currentUser.name;
        });

        // Update avatar images
        const avatarElements = document.querySelectorAll('.user-avatar');
        avatarElements.forEach(el => {
            if (el && el.tagName === 'IMG') {
                el.src = this.currentUser.avatar;
                el.alt = this.currentUser.name;
            }
        });

        // Update profile stats
        const statsElements = {
            posts: document.querySelectorAll('.stat .count, .count-large'),
            followers: document.querySelectorAll('.stat .count, .count-large'),
            following: document.querySelectorAll('.stat .count, .count-large')
        };

        // This is a simplified update - in a real app, you'd target specific elements
        console.log('User interface updated with current user data');
    }

    /**
     * Load feed posts
     */
    async loadFeedPosts() {
        try {
            // Simulate API call
            const mockPosts = this.generateMockPosts();
            this.posts = mockPosts;
            
            // Render posts
            this.renderPosts(mockPosts);
            
        } catch (error) {
            console.error('Failed to load feed posts:', error);
            this.showToast('Failed to load posts', 'error');
        }
    }

    /**
     * Generate mock posts for demonstration
     */
    generateMockPosts() {
        return [
            {
                id: 'post-1',
                author: {
                    id: 'user-2',
                    name: 'Emma Watson',
                    avatar: 'https://via.placeholder.com/40x40/42b72a/ffffff?text=EW'
                },
                content: 'Just finished an amazing photography session! The golden hour lighting was absolutely perfect 📸 #photography #goldenhour',
                media: [{
                    type: 'image',
                    url: 'https://source.unsplash.com/600x400/?photography,sunset'
                }],
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                stats: {
                    likes: 1234,
                    comments: 89,
                    shares: 45
                },
                userLiked: false
            },
            {
                id: 'post-2',
                author: {
                    id: 'user-3',
                    name: 'Alex Johnson',
                    avatar: 'https://via.placeholder.com/40x40/ff6b6b/ffffff?text=AJ'
                },
                content: 'Travel tip: Always pack light and bring a good camera! This view from the mountains was worth every step of the hike 🏔️',
                media: [{
                    type: 'image',
                    url: 'https://source.unsplash.com/600x400/?mountains,hiking'
                }],
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
                stats: {
                    likes: 856,
                    comments: 34,
                    shares: 67
                },
                userLiked: true
            },
            {
                id: 'post-3',
                author: {
                    id: 'user-4',
                    name: 'Sarah Chen',
                    avatar: 'https://via.placeholder.com/40x40/9b59b6/ffffff?text=SC'
                },
                content: 'Excited to share my latest art piece! This took me about 20 hours to complete. What do you think? 🎨',
                media: [{
                    type: 'image',
                    url: 'https://source.unsplash.com/600x400/?art,painting'
                }],
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
                stats: {
                    likes: 2341,
                    comments: 156,
                    shares: 89
                },
                userLiked: false
            }
        ];
    }

    /**
     * Render posts in the feed
     */
    renderPosts(posts) {
        const postsContainer = document.getElementById('posts-container');
        if (!postsContainer) return;

        postsContainer.innerHTML = '';

        posts.forEach(post => {
            const postElement = this.createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    }

    /**
     * Create a post element
     */
    createPostElement(post) {
        const postDiv = document.createElement('article');
        postDiv.className = 'post-card';
        postDiv.dataset.postId = post.id;

        const timeAgo = this.getTimeAgo(post.timestamp);
        const likesFormatted = this.formatNumber(post.stats.likes);
        const commentsFormatted = this.formatNumber(post.stats.comments);
        const sharesFormatted = this.formatNumber(post.stats.shares);

        postDiv.innerHTML = `
            <div class="post-header">
                <img src="${post.author.avatar}" alt="${post.author.name}" class="user-avatar">
                <div class="post-author-info">
                    <div class="post-author-name">${post.author.name}</div>
                    <div class="post-timestamp">${timeAgo}</div>
                </div>
                <button class="post-options" title="Post options">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
            
            <div class="post-content">
                <div class="post-text">${post.content}</div>
                ${post.media && post.media.length > 0 ? `
                    <div class="post-media">
                        ${post.media.map(media => 
                            media.type === 'image' 
                                ? `<img src="${media.url}" alt="Post image" loading="lazy">`
                                : `<video src="${media.url}" controls></video>`
                        ).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="post-interactions">
                <button class="interaction-btn like-btn ${post.userLiked ? 'liked' : ''}" data-action="like">
                    <i class="fas fa-heart"></i>
                    <span>${likesFormatted}</span>
                </button>
                <button class="interaction-btn comment-btn" data-action="comment">
                    <i class="fas fa-comment"></i>
                    <span>${commentsFormatted}</span>
                </button>
                <button class="interaction-btn share-btn" data-action="share">
                    <i class="fas fa-share"></i>
                    <span>${sharesFormatted}</span>
                </button>
                <button class="interaction-btn save-btn" data-action="save" title="Save post">
                    <i class="far fa-bookmark"></i>
                </button>
            </div>
        `;

        // Add interaction listeners
        this.addPostInteractionListeners(postDiv, post);

        return postDiv;
    }

    /**
     * Add interaction listeners to a post
     */
    addPostInteractionListeners(postElement, post) {
        const interactionBtns = postElement.querySelectorAll('.interaction-btn');
        
        interactionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.getAttribute('data-action');
                this.handlePostInteraction(post.id, action, btn);
            });
        });
    }

    /**
     * Handle post interactions (like, comment, share, save)
     */
    async handlePostInteraction(postId, action, buttonElement) {
        try {
            const post = this.posts.find(p => p.id === postId);
            if (!post) return;

            switch (action) {
                case 'like':
                    await this.toggleLike(post, buttonElement);
                    break;
                case 'comment':
                    this.showComments(post);
                    break;
                case 'share':
                    await this.sharePost(post);
                    break;
                case 'save':
                    await this.toggleSave(post, buttonElement);
                    break;
            }
        } catch (error) {
            console.error(`Failed to handle ${action} interaction:`, error);
            this.showToast(`Failed to ${action} post`, 'error');
        }
    }

    /**
     * Toggle post like
     */
    async toggleLike(post, buttonElement) {
        const isLiked = post.userLiked;
        const newLikeCount = isLiked ? post.stats.likes - 1 : post.stats.likes + 1;
        
        // Optimistic update
        post.userLiked = !isLiked;
        post.stats.likes = newLikeCount;
        
        // Update UI
        buttonElement.classList.toggle('liked', !isLiked);
        const countSpan = buttonElement.querySelector('span');
        if (countSpan) {
            countSpan.textContent = this.formatNumber(newLikeCount);
        }

        // Show feedback
        this.showToast(isLiked ? 'Post unliked' : 'Post liked', 'success');
        
        // In a real app, you would make an API call here
        // await this.api.toggleLike(post.id);
    }

    /**
     * Toggle post save
     */
    async toggleSave(post, buttonElement) {
        const icon = buttonElement.querySelector('i');
        const isSaved = icon.classList.contains('fas');
        
        // Toggle icon
        icon.classList.toggle('fas', !isSaved);
        icon.classList.toggle('far', isSaved);
        
        // Show feedback
        this.showToast(isSaved ? 'Post unsaved' : 'Post saved', 'success');
        
        // In a real app, you would make an API call here
    }

    /**
     * Share a post
     */
    async sharePost(post) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${post.author.name}'s post`,
                    text: post.content,
                    url: window.location.href
                });
                this.showToast('Post shared successfully', 'success');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error sharing:', error);
                    this.fallbackShare(post);
                }
            }
        } else {
            this.fallbackShare(post);
        }
    }

    /**
     * Fallback share method
     */
    fallbackShare(post) {
        // Copy to clipboard
        const shareText = `${post.author.name}: ${post.content}`;
        navigator.clipboard.writeText(shareText).then(() => {
            this.showToast('Post copied to clipboard', 'success');
        }).catch(() => {
            this.showToast('Sharing not supported', 'warning');
        });
    }

    /**
     * Show comments for a post
     */
    showComments(post) {
        // In a real app, this would open a comments modal or expand comments section
        this.showToast('Comments feature coming soon', 'info');
    }

    /**
     * Handle create post
     */
    async handleCreatePost() {
        const textarea = document.getElementById('modal-post-content');
        const content = textarea ? textarea.value.trim() : '';
        
        if (!content) {
            this.showToast('Please enter some content', 'warning');
            return;
        }

        try {
            // Create new post object
            const newPost = {
                id: `post-${Date.now()}`,
                author: {
                    id: this.currentUser.id,
                    name: this.currentUser.name,
                    avatar: this.currentUser.avatar
                },
                content: content,
                media: [], // TODO: Handle media uploads
                timestamp: new Date(),
                stats: {
                    likes: 0,
                    comments: 0,
                    shares: 0
                },
                userLiked: false
            };

            // Add to posts array
            this.posts.unshift(newPost);
            
            // Re-render posts
            this.renderPosts(this.posts);
            
            // Close modal and reset form
            this.closeModal('create-post-modal');
            if (textarea) textarea.value = '';
            
            this.showToast('Post created successfully!', 'success');
            
            // In a real app, you would make an API call here
            
        } catch (error) {
            console.error('Failed to create post:', error);
            this.showToast('Failed to create post', 'error');
        }
    }

    /**
     * Load a dating profile for discovery
     */
    async loadDatingProfile() {
        const discoveryCards = document.getElementById('discovery-cards');
        if (!discoveryCards) return;

        // Mock dating profile
        const profile = {
            id: 'profile-1',
            name: 'Sophia Williams',
            age: 28,
            distance: 5,
            bio: 'Photographer and coffee enthusiast. Love hiking and exploring new places. Looking for someone to share adventures with!',
            interests: ['Photography', 'Hiking', 'Travel', 'Coffee'],
            photos: [
                'https://source.unsplash.com/400x600/?portrait,woman'
            ]
        };

        discoveryCards.innerHTML = `
            <div class="profile-card">
                <img src="${profile.photos[0]}" alt="${profile.name}" class="profile-card-image">
                <div class="profile-card-overlay">
                    <div class="profile-card-name">${profile.name}</div>
                    <div class="profile-card-age">${profile.age}, ${profile.distance} miles away</div>
                    <div class="profile-card-bio">${profile.bio}</div>
                    <div class="profile-interests">
                        ${profile.interests.map(interest => 
                            `<span class="interest-tag">${interest}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="card-actions">
                    <button class="card-action-btn reject" title="Pass">
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="card-action-btn like" title="Like">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `;

        // Add interaction listeners
        const rejectBtn = discoveryCards.querySelector('.reject');
        const likeBtn = discoveryCards.querySelector('.like');

        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => this.handleDatingAction('reject', profile));
        }

        if (likeBtn) {
            likeBtn.addEventListener('click', () => this.handleDatingAction('like', profile));
        }
    }

    /**
     * Handle dating actions (like/reject)
     */
    async handleDatingAction(action, profile) {
        try {
            if (action === 'like') {
                // Simulate match chance
                const isMatch = Math.random() > 0.7;
                
                if (isMatch) {
                // Initialize match animation if not already done
                if (!this.matchAnimation) {
                    this.matchAnimation = new MatchAnimation();
                }
                
                // Initialize date scheduler if not already done
                if (!this.dateScheduler) {
                    this.dateScheduler = new DateScheduler();
                }
                
                // Show the beautiful "It's a Lynk!" animation
                this.matchAnimation.showMatchAnimation((actionType) => {
                    if (actionType === 'message') {
                        // Navigate to messages and start conversation
                        this.navigateToSection('messages');
                        this.startConversationWithMatch(profile);
                    } else if (actionType === 'date') {
                        // Open date scheduler
                        this.dateScheduler.showDateScheduler(profile, (action, proposal) => {
                            if (action === 'date-proposed') {
                                this.showToast(`Date proposed with ${profile.name}!`, 'success');
                                // Continue dating after scheduling
                                this.loadDatingProfile();
                            }
                        });
                    } else if (actionType === 'continue') {
                        // Continue dating
                        this.loadDatingProfile();
                    }
                });
                    
                    // Add to matches
                    this.matches.push({
                        id: `match-${Date.now()}`,
                        profile: profile,
                        timestamp: new Date()
                    });
                    
                    // Don't load next profile immediately - let animation finish
                    return;
                } else {
                    this.showToast(`You liked ${profile.name}`, 'info');
                }
            } else {
                this.showToast('Profile passed', 'info');
            }

            // Load next profile
            setTimeout(() => {
                this.loadDatingProfile();
            }, 500);
            
        } catch (error) {
            console.error('Failed to handle dating action:', error);
            this.showToast('Action failed', 'error');
        }
    }

    /**
     * Utility Methods
     */

    /**
     * Format numbers for display (e.g., 1234 -> 1.2K)
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
     * Get time ago string
     */
    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showToast(message, 'error');
    }

    /**
     * Open modal
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Close modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.style.overflow = '';
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Responsive adjustments can go here
        console.log('Window resized');
    }

    /**
     * Handle logout
     */
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear user data
            this.currentUser = null;
            this.posts = [];
            this.conversations = [];
            this.notifications = [];
            this.matches = [];
            
            // In a real app, you would redirect to login page
            this.showToast('Logged out successfully', 'success');
            
            // For demo purposes, just reload the page
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    }

    /**
     * Placeholder methods for features not yet implemented
     */

    async loadDatingProfiles() {
        // Placeholder for loading dating profiles
    }

    async loadConversations() {
        // Placeholder for loading conversations
    }

    async loadNotifications() {
        // Placeholder for loading notifications
    }

    async loadProfileData() {
        // Placeholder for loading profile data
    }

    loadInitialPosts() {
        // Already handled in loadFeedPosts
    }

    async loadMatches() {
        // Placeholder for loading matches
    }

    async loadDates() {
        // Placeholder for loading dates
    }

    async loadDatingChats() {
        // Placeholder for loading dating chats
    }

    startNewConversation() {
        this.showToast('New conversation feature coming soon', 'info');
    }

    /**
     * Start conversation with a match
     */
    startConversationWithMatch(profile) {
        // Create a new conversation with the matched user
        const newConversation = {
            id: `conv-${Date.now()}`,
            user: {
                id: profile.id,
                name: profile.name,
                avatar: profile.photos ? profile.photos[0] : 'https://via.placeholder.com/40x40/4facfe/ffffff?text=' + profile.name[0]
            },
            lastMessage: `Matched with ${profile.name}! Say hello 👋`,
            timestamp: new Date(),
            unread: 0,
            isMatch: true
        };

        // Add to conversations
        this.conversations.unshift(newConversation);
        
        this.showToast(`Starting conversation with ${profile.name}`, 'success');
        
        // In a real app, this would open the conversation interface
        // For now, just show the messages section
    }

    searchConversations(query) {
        console.log('Searching conversations:', query);
    }

    filterNotifications(filter) {
        this.showToast(`Filtering notifications: ${filter}`, 'info');
    }

    switchProfileTab(tab) {
        this.showToast(`Profile tab: ${tab}`, 'info');
    }

    editProfile() {
        this.showToast('Edit profile feature coming soon', 'info');
    }

    editProfilePhoto() {
        this.showToast('Edit profile photo feature coming soon', 'info');
    }

    editCoverPhoto() {
        this.showToast('Edit cover photo feature coming soon', 'info');
    }

    switchFeedTab(feed) {
        this.showToast(`Feed: ${feed}`, 'info');
    }

    /**
     * Handle add photo functionality
     */
    handleAddPhoto() {
        this.createFileInput('image/*', (files) => {
            this.handleMediaFiles(files, 'photo');
        });
    }

    /**
     * Handle add video functionality
     */
    handleAddVideo() {
        this.createFileInput('video/*', (files) => {
            this.handleMediaFiles(files, 'video');
        });
    }

    /**
     * Handle add location functionality
     */
    handleAddLocation() {
        if (navigator.geolocation) {
            this.showToast('Getting your location...', 'info');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.addLocationToPost(latitude, longitude);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    this.showToast('Could not get your location', 'warning');
                    this.showLocationPicker();
                }
            );
        } else {
            this.showLocationPicker();
        }
    }

    /**
     * Handle add emoji functionality
     */
    handleAddEmoji() {
        this.showEmojiPicker();
    }

    /**
     * Create file input for media uploads
     */
    createFileInput(accept, callback) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = accept;
        fileInput.multiple = true;
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                callback(files);
            }
            // Clean up
            document.body.removeChild(fileInput);
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
    }

    /**
     * Handle uploaded media files
     */
    handleMediaFiles(files, type) {
        if (files.length === 0) return;

        // Validate file sizes (max 10MB per file)
        const maxSize = 10 * 1024 * 1024; // 10MB
        const validFiles = files.filter(file => {
            if (file.size > maxSize) {
                this.showToast(`File ${file.name} is too large (max 10MB)`, 'warning');
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Process files
        validFiles.forEach(file => {
            this.processMediaFile(file, type);
        });

        this.showToast(`${validFiles.length} ${type}(s) added`, 'success');
    }

    /**
     * Process individual media file
     */
    processMediaFile(file, type) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const mediaData = {
                id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: type,
                file: file,
                url: e.target.result,
                name: file.name,
                size: file.size
            };
            
            // Add to current post media
            if (!this.currentPostMedia) {
                this.currentPostMedia = [];
            }
            this.currentPostMedia.push(mediaData);
            
            // Update media preview
            this.updateMediaPreview();
        };
        
        reader.onerror = () => {
            this.showToast(`Failed to process ${file.name}`, 'error');
        };
        
        reader.readAsDataURL(file);
    }

    /**
     * Update media preview in create post modal
     */
    updateMediaPreview() {
        const mediaPreview = document.getElementById('media-preview');
        if (!mediaPreview || !this.currentPostMedia) return;

        if (this.currentPostMedia.length === 0) {
            mediaPreview.innerHTML = '';
            mediaPreview.style.display = 'none';
            return;
        }

        mediaPreview.style.display = 'block';
        mediaPreview.innerHTML = `
            <div class="media-preview-container">
                ${this.currentPostMedia.map(media => `
                    <div class="media-preview-item" data-media-id="${media.id}">
                        ${media.type === 'photo' ? 
                            `<img src="${media.url}" alt="${media.name}" class="preview-image">` :
                            `<video src="${media.url}" class="preview-video" controls></video>`
                        }
                        <button class="remove-media-btn" onclick="connectHub.removeMediaFromPost('${media.id}')" title="Remove">
                            <i class="fas fa-times"></i>
                        </button>
                        <div class="media-info">
                            <span class="media-name">${media.name}</span>
                            <span class="media-size">${this.formatFileSize(media.size)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Remove media from current post
     */
    removeMediaFromPost(mediaId) {
        if (!this.currentPostMedia) return;
        
        this.currentPostMedia = this.currentPostMedia.filter(media => media.id !== mediaId);
        this.updateMediaPreview();
        this.showToast('Media removed', 'info');
    }

    /**
     * Add location to post
     */
    addLocationToPost(latitude, longitude) {
        // Use reverse geocoding to get location name (simplified version)
        this.currentPostLocation = {
            lat: latitude,
            lng: longitude,
            name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` // Simplified display
        };
        
        // Show location in the post input area
        this.showToast(`Location added: ${this.currentPostLocation.name}`, 'success');
        this.updateLocationDisplay();
    }

    /**
     * Show location picker modal (simplified version)
     */
    showLocationPicker() {
        const locations = [
            { name: 'New York, NY', lat: 40.7128, lng: -74.0060 },
            { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
            { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
            { name: 'Miami, FL', lat: 25.7617, lng: -80.1918 },
            { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 }
        ];
        
        // Simple location selection (in a real app, this would be a proper modal)
        const locationName = prompt('Enter your location (or choose from: ' + 
            locations.map(l => l.name).join(', ') + ')');
            
        if (locationName) {
            const foundLocation = locations.find(l => 
                l.name.toLowerCase().includes(locationName.toLowerCase())
            );
            
            if (foundLocation) {
                this.addLocationToPost(foundLocation.lat, foundLocation.lng);
                this.currentPostLocation.name = foundLocation.name;
            } else {
                this.currentPostLocation = {
                    lat: null,
                    lng: null,
                    name: locationName
                };
            }
            
            this.showToast(`Location set to: ${this.currentPostLocation.name}`, 'success');
        }
    }

    /**
     * Update location display in post composer
     */
    updateLocationDisplay() {
        if (!this.currentPostLocation) return;
        
        // Add visual indicator that location is attached
        const locationBtn = document.getElementById('modal-add-location') || 
                           document.getElementById('add-location-btn');
        
        if (locationBtn) {
            locationBtn.style.color = '#42b72a';
            locationBtn.title = `Location: ${this.currentPostLocation.name}`;
        }
    }

    /**
     * Show emoji picker (simplified version)
     */
    showEmojiPicker() {
        const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', 
                       '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
                       '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
                       '❤️', '💕', '💖', '💗', '💓', '💞', '💘', '💝', '🎉', '🎊',
                       '🔥', '✨', '⭐', '🌟', '💫', '🎯', '🎪', '🎨', '🎭', '🎪'];
        
        // Create emoji picker popup
        const existingPicker = document.getElementById('emoji-picker');
        if (existingPicker) {
            existingPicker.remove();
        }
        
        const emojiPicker = document.createElement('div');
        emojiPicker.id = 'emoji-picker';
        emojiPicker.className = 'emoji-picker';
        emojiPicker.innerHTML = `
            <div class="emoji-picker-content">
                <div class="emoji-picker-header">
                    <span>Choose an emoji</span>
                    <button class="close-emoji-picker" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="emoji-grid">
                    ${emojis.map(emoji => 
                        `<button class="emoji-btn" onclick="connectHub.insertEmoji('${emoji}')">${emoji}</button>`
                    ).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(emojiPicker);
        
        // Position the picker
        const emojiBtn = document.getElementById('modal-add-emoji') || 
                        document.getElementById('add-emoji-btn');
        if (emojiBtn) {
            const rect = emojiBtn.getBoundingClientRect();
            emojiPicker.style.position = 'fixed';
            emojiPicker.style.top = (rect.bottom + 10) + 'px';
            emojiPicker.style.left = rect.left + 'px';
            emojiPicker.style.zIndex = '10000';
        }
    }

    /**
     * Insert emoji into post content
     */
    insertEmoji(emoji) {
        const textarea = document.getElementById('modal-post-content');
        if (textarea) {
            const cursorPos = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, cursorPos);
            const textAfter = textarea.value.substring(textarea.selectionEnd);
            
            textarea.value = textBefore + emoji + textAfter;
            textarea.focus();
            textarea.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
        }
        
        // Close emoji picker
        const picker = document.getElementById('emoji-picker');
        if (picker) {
            picker.remove();
        }
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the app when the script loads
const connectHub = new ConnectHubApp();

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConnectHubApp;
}
