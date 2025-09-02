/**
 * ConnectHub - Story User Interaction System
 * Handles user name clicks in stories section with comprehensive user profile preview
 * and interaction options
 */

class StoryUserInteraction {
    constructor(app) {
        this.app = app;
        this.activePopover = null;
        this.userCache = new Map();
        this.followingStatus = new Map();
        
        this.init();
    }

    /**
     * Initialize story user interaction system
     */
    init() {
        this.setupUserNameClickHandlers();
        this.preloadUserData();
        console.log('Story User Interaction System initialized');
    }

    /**
     * Setup click handlers for user names in stories
     */
    setupUserNameClickHandlers() {
        // Handle clicks on story user names
        document.addEventListener('click', (e) => {
            // Check if clicking on story user name (but not the story itself)
            const storyUserName = e.target.closest('.story-name');
            const storyUserInfo = e.target.closest('.story-user-name');
            
            if (storyUserName || storyUserInfo) {
                e.stopPropagation(); // Prevent story from opening
                
                const storyItem = e.target.closest('.story-item') || e.target.closest('.stories-viewer-header');
                const userId = this.getUserIdFromStoryElement(storyItem);
                const userName = (storyUserName || storyUserInfo).textContent;
                
                this.showUserProfilePopover(userId, userName, e.target);
            }
            
            // Close popover when clicking outside
            if (!e.target.closest('.user-profile-popover') && !e.target.closest('.story-name') && !e.target.closest('.story-user-name')) {
                this.closeUserPopover();
            }
        });

        // Handle hover effects for better UX
        document.addEventListener('mouseover', (e) => {
            const storyUserName = e.target.closest('.story-name');
            const storyUserInfo = e.target.closest('.story-user-name');
            
            if (storyUserName || storyUserInfo) {
                (storyUserName || storyUserInfo).classList.add('hoverable');
            }
        });

        document.addEventListener('mouseout', (e) => {
            const storyUserName = e.target.closest('.story-name');
            const storyUserInfo = e.target.closest('.story-user-name');
            
            if (storyUserName || storyUserInfo) {
                (storyUserName || storyUserInfo).classList.remove('hoverable');
            }
        });
    }

    /**
     * Get user ID from story element
     */
    getUserIdFromStoryElement(storyElement) {
        if (!storyElement) return null;
        
        // Try to get from data attribute
        const storyId = storyElement.dataset?.storyId;
        if (storyId) return storyId.replace('story-', 'user-');
        
        // Fallback: generate from user name
        const userName = storyElement.querySelector('.story-name, .story-user-name')?.textContent;
        if (userName) {
            return 'user-' + userName.toLowerCase().replace(/\s+/g, '-');
        }
        
        return null;
    }

    /**
     * Show user profile popover
     */
    async showUserProfilePopover(userId, userName, triggerElement) {
        // Close any existing popover
        this.closeUserPopover();
        
        // Get or load user data
        const userData = await this.getUserData(userId, userName);
        if (!userData) return;
        
        // Create popover
        this.createUserProfilePopover(userData, triggerElement);
    }

    /**
     * Get user data (from cache or API)
     */
    async getUserData(userId, userName) {
        try {
            // Check cache first
            if (this.userCache.has(userId)) {
                return this.userCache.get(userId);
            }
            
            // Simulate API call with mock data
            const userData = await this.fetchUserData(userId, userName);
            
            // Cache the data
            this.userCache.set(userId, userData);
            
            return userData;
        } catch (error) {
            console.error('Failed to load user data:', error);
            return null;
        }
    }

    /**
     * Fetch user data (mock implementation)
     */
    async fetchUserData(userId, userName) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Generate mock user data
        const mockUsers = {
            'user-emma-watson': {
                id: 'user-emma-watson',
                name: 'Emma Watson',
                username: '@emmawatson',
                avatar: 'https://via.placeholder.com/80x80/42b72a/ffffff?text=EW',
                coverPhoto: 'https://source.unsplash.com/400x200/?photography,portrait',
                bio: 'Professional photographer 📸 | Travel enthusiast ✈️ | Capturing life\'s beautiful moments',
                location: 'New York, NY',
                website: 'www.emmawatsonphoto.com',
                stats: {
                    posts: 284,
                    followers: 12500,
                    following: 892
                },
                isVerified: true,
                isPrivate: false,
                mutualFriends: 5,
                recentActivity: 'Posted 2 hours ago',
                interests: ['Photography', 'Travel', 'Art'],
                storiesCount: 3
            },
            'user-alex-johnson': {
                id: 'user-alex-johnson',
                name: 'Alex Johnson',
                username: '@alexj',
                avatar: 'https://via.placeholder.com/80x80/ff6b6b/ffffff?text=AJ',
                coverPhoto: 'https://source.unsplash.com/400x200/?travel,adventure',
                bio: 'Adventure seeker 🏔️ | Digital nomad | Sharing my journey around the world 🌍',
                location: 'Currently in Bali',
                website: 'alexjohnson.travel',
                stats: {
                    posts: 156,
                    followers: 8900,
                    following: 654
                },
                isVerified: false,
                isPrivate: false,
                mutualFriends: 2,
                recentActivity: 'Active 1 hour ago',
                interests: ['Travel', 'Adventure', 'Food'],
                storiesCount: 5
            }
        };
        
        return mockUsers[userId] || this.generateDefaultUserData(userId, userName);
    }

    /**
     * Generate default user data for unknown users
     */
    generateDefaultUserData(userId, userName) {
        return {
            id: userId,
            name: userName,
            username: '@' + userName.toLowerCase().replace(/\s+/g, ''),
            avatar: `https://via.placeholder.com/80x80/6c5ce7/ffffff?text=${userName.charAt(0)}`,
            coverPhoto: 'https://source.unsplash.com/400x200/?abstract',
            bio: 'ConnectHub user',
            location: null,
            website: null,
            stats: {
                posts: Math.floor(Math.random() * 200) + 10,
                followers: Math.floor(Math.random() * 5000) + 100,
                following: Math.floor(Math.random() * 1000) + 50
            },
            isVerified: false,
            isPrivate: Math.random() > 0.7,
            mutualFriends: Math.floor(Math.random() * 10),
            recentActivity: 'Active recently',
            interests: [],
            storiesCount: Math.floor(Math.random() * 8) + 1
        };
    }

    /**
     * Create user profile popover
     */
    createUserProfilePopover(userData, triggerElement) {
        const isFollowing = this.followingStatus.get(userData.id) || false;
        
        const popover = document.createElement('div');
        popover.id = 'user-profile-popover';
        popover.className = 'user-profile-popover';
        
        popover.innerHTML = `
            <div class="popover-content">
                <!-- Loading State -->
                <div class="popover-loading" id="popover-loading" style="display: none;">
                    <div class="loading-spinner"></div>
                    <span>Loading profile...</span>
                </div>
                
                <!-- Header Section -->
                <div class="popover-header">
                    <div class="header-background">
                        <img src="${userData.coverPhoto}" alt="Cover photo" class="cover-photo">
                        <div class="header-overlay"></div>
                    </div>
                    <div class="profile-header-content">
                        <div class="profile-avatar-container">
                            <img src="${userData.avatar}" alt="${userData.name}" class="profile-avatar">
                            ${userData.isVerified ? '<div class="verified-badge"><i class="fas fa-check-circle"></i></div>' : ''}
                        </div>
                        <button class="close-popover-btn" onclick="storyUserInteraction.closeUserPopover()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Profile Info -->
                <div class="popover-profile-info">
                    <div class="profile-names">
                        <h3 class="profile-display-name">
                            ${userData.name}
                            ${userData.isVerified ? '<i class="fas fa-check-circle verified-icon"></i>' : ''}
                        </h3>
                        <p class="profile-username">${userData.username}</p>
                    </div>
                    
                    ${userData.bio ? `
                        <div class="profile-bio">
                            <p>${userData.bio}</p>
                        </div>
                    ` : ''}
                    
                    <div class="profile-meta">
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
                            <i class="fas fa-clock"></i>
                            <span>${userData.recentActivity}</span>
                        </div>
                        ${userData.mutualFriends > 0 ? `
                            <div class="meta-item mutual-friends">
                                <i class="fas fa-users"></i>
                                <span>${userData.mutualFriends} mutual friend${userData.mutualFriends > 1 ? 's' : ''}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Stats Section -->
                <div class="profile-stats">
                    <div class="stat-item" onclick="storyUserInteraction.viewUserPosts('${userData.id}')">
                        <span class="stat-number">${this.formatNumber(userData.stats.posts)}</span>
                        <span class="stat-label">Posts</span>
                    </div>
                    <div class="stat-item" onclick="storyUserInteraction.viewFollowers('${userData.id}')">
                        <span class="stat-number">${this.formatNumber(userData.stats.followers)}</span>
                        <span class="stat-label">Followers</span>
                    </div>
                    <div class="stat-item" onclick="storyUserInteraction.viewFollowing('${userData.id}')">
                        <span class="stat-number">${this.formatNumber(userData.stats.following)}</span>
                        <span class="stat-label">Following</span>
                    </div>
                    <div class="stat-item stories-stat" onclick="storyUserInteraction.viewAllUserStories('${userData.id}')">
                        <span class="stat-number">${userData.storiesCount}</span>
                        <span class="stat-label">Stories</span>
                    </div>
                </div>
                
                <!-- Interests/Tags -->
                ${userData.interests && userData.interests.length > 0 ? `
                    <div class="profile-interests">
                        <div class="interests-list">
                            ${userData.interests.map(interest => `
                                <span class="interest-tag">${interest}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Action Buttons -->
                <div class="profile-actions">
                    <div class="primary-actions">
                        ${userData.id !== this.app.currentUser?.id ? `
                            <button class="action-btn follow-btn ${isFollowing ? 'following' : 'follow'}" 
                                    onclick="storyUserInteraction.toggleFollow('${userData.id}')" 
                                    id="follow-btn-${userData.id}">
                                <i class="fas fa-${isFollowing ? 'user-check' : 'user-plus'}"></i>
                                <span>${isFollowing ? 'Following' : 'Follow'}</span>
                            </button>
                            <button class="action-btn message-btn" onclick="storyUserInteraction.messageUser('${userData.id}')">
                                <i class="fas fa-comment"></i>
                                <span>Message</span>
                            </button>
                        ` : `
                            <button class="action-btn edit-profile-btn" onclick="storyUserInteraction.editProfile()">
                                <i class="fas fa-edit"></i>
                                <span>Edit Profile</span>
                            </button>
                        `}
                    </div>
                    
                    <div class="secondary-actions">
                        <div class="action-dropdown">
                            <button class="action-btn dropdown-toggle" onclick="storyUserInteraction.toggleActionMenu('${userData.id}')">
                                <i class="fas fa-ellipsis-h"></i>
                            </button>
                            <div class="action-dropdown-menu" id="action-menu-${userData.id}" style="display: none;">
                                ${userData.id !== this.app.currentUser?.id ? `
                                    <button class="dropdown-item" onclick="storyUserInteraction.viewFullProfile('${userData.id}')">
                                        <i class="fas fa-user"></i>
                                        <span>View Full Profile</span>
                                    </button>
                                    <button class="dropdown-item" onclick="storyUserInteraction.shareProfile('${userData.id}')">
                                        <i class="fas fa-share"></i>
                                        <span>Share Profile</span>
                                    </button>
                                    <button class="dropdown-item" onclick="storyUserInteraction.muteUserStories('${userData.id}')">
                                        <i class="fas fa-volume-mute"></i>
                                        <span>Mute Stories</span>
                                    </button>
                                    <hr class="dropdown-divider">
                                    <button class="dropdown-item block-item" onclick="storyUserInteraction.blockUser('${userData.id}')">
                                        <i class="fas fa-ban"></i>
                                        <span>Block User</span>
                                    </button>
                                    <button class="dropdown-item report-item" onclick="storyUserInteraction.reportUser('${userData.id}')">
                                        <i class="fas fa-flag"></i>
                                        <span>Report User</span>
                                    </button>
                                ` : `
                                    <button class="dropdown-item" onclick="storyUserInteraction.viewFullProfile('${userData.id}')">
                                        <i class="fas fa-user"></i>
                                        <span>View My Profile</span>
                                    </button>
                                    <button class="dropdown-item" onclick="storyUserInteraction.shareProfile('${userData.id}')">
                                        <i class="fas fa-share"></i>
                                        <span>Share My Profile</span>
                                    </button>
                                    <button class="dropdown-item" onclick="storyUserInteraction.profileSettings()">
                                        <i class="fas fa-cog"></i>
                                        <span>Profile Settings</span>
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Story Preview -->
                ${userData.storiesCount > 0 ? `
                    <div class="recent-stories-preview">
                        <h5>Recent Stories</h5>
                        <div class="story-thumbnails" onclick="storyUserInteraction.viewAllUserStories('${userData.id}')">
                            <div class="story-thumbnail">
                                <img src="https://source.unsplash.com/60x60/?random,1" alt="Story 1">
                            </div>
                            <div class="story-thumbnail">
                                <img src="https://source.unsplash.com/60x60/?random,2" alt="Story 2">
                            </div>
                            <div class="story-thumbnail">
                                <img src="https://source.unsplash.com/60x60/?random,3" alt="Story 3">
                            </div>
                            ${userData.storiesCount > 3 ? `
                                <div class="story-thumbnail more-stories">
                                    <span>+${userData.storiesCount - 3}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Position popover
        this.positionPopover(popover, triggerElement);
        
        // Add to DOM
        document.body.appendChild(popover);
        
        // Store reference
        this.activePopover = popover;
        
        // Animate in
        setTimeout(() => {
            popover.classList.add('show');
        }, 10);
        
        // Setup auto-close
        this.setupPopoverAutoClose(popover);
    }

    /**
     * Position popover relative to trigger element
     */
    positionPopover(popover, triggerElement) {
        const rect = triggerElement.getBoundingClientRect();
        const popoverWidth = 360; // Fixed width from CSS
        const popoverHeight = 500; // Approximate height
        
        let left = rect.left + (rect.width / 2) - (popoverWidth / 2);
        let top = rect.bottom + 10;
        
        // Adjust for viewport boundaries
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Horizontal adjustment
        if (left < 10) {
            left = 10;
        } else if (left + popoverWidth > viewportWidth - 10) {
            left = viewportWidth - popoverWidth - 10;
        }
        
        // Vertical adjustment
        if (top + popoverHeight > viewportHeight - 10) {
            top = rect.top - popoverHeight - 10;
        }
        
        popover.style.position = 'fixed';
        popover.style.left = left + 'px';
        popover.style.top = top + 'px';
        popover.style.zIndex = '10001';
    }

    /**
     * Setup popover auto-close functionality
     */
    setupPopoverAutoClose(popover) {
        // Close on outside click (handled in main click handler)
        
        // Close on escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeUserPopover();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Auto-close after 30 seconds of inactivity
        let inactivityTimer = setTimeout(() => {
            this.closeUserPopover();
        }, 30000);
        
        // Reset timer on interaction
        popover.addEventListener('mousemove', () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                this.closeUserPopover();
            }, 30000);
        });
    }

    /**
     * Close user popover
     */
    closeUserPopover() {
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
     * Format numbers for display
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
     * Preload user data for better performance
     */
    preloadUserData() {
        // In a real app, this would preload data for users whose stories are currently visible
        console.log('Preloading user data for visible stories...');
    }

    /**
     * Action handlers
     */
    
    toggleFollow(userId) {
        const isCurrentlyFollowing = this.followingStatus.get(userId) || false;
        const newStatus = !isCurrentlyFollowing;
        
        this.followingStatus.set(userId, newStatus);
        
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
        this.app.showToast(`Opening chat with ${userData?.name || 'user'}...`, 'info');
        this.closeUserPopover();
        // In a real app, this would open the messaging interface
    }

    editProfile() {
        this.app.showToast('Opening profile editor...', 'info');
        this.closeUserPopover();
    }

    viewFullProfile(userId) {
        const userData = this.userCache.get(userId);
        this.app.showToast(`Opening ${userData?.name || 'user'}'s profile...`, 'info');
        this.closeUserPopover();
        // In a real app, this would navigate to the full profile page
    }

    shareProfile(userId) {
        const userData = this.userCache.get(userId);
        if (navigator.share) {
            navigator.share({
                title: `${userData?.name || 'User'}'s Profile`,
                text: `Check out ${userData?.name || 'this user'}'s profile on ConnectHub!`,
                url: `https://connecthub.com/profile/${userId}`
            });
        } else {
            // Fallback
            const url = `https://connecthub.com/profile/${userId}`;
            navigator.clipboard.writeText(url).then(() => {
                this.app.showToast('Profile link copied to clipboard', 'success');
            });
        }
        this.closeUserPopover();
    }

    muteUserStories(userId) {
        const userData = this.userCache.get(userId);
        this.app.showToast(`Muted ${userData?.name || 'user'}'s stories`, 'info');
        this.closeUserPopover();
    }

    blockUser(userId) {
        const userData = this.userCache.get(userId);
        if (confirm(`Are you sure you want to block ${userData?.name || 'this user'}?`)) {
            this.app.showToast(`Blocked ${userData?.name || 'user'}`, 'warning');
            this.closeUserPopover();
        }
    }

    reportUser(userId) {
        const userData = this.userCache.get(userId);
        this.app.showToast(`Report submitted for ${userData?.name || 'user'}`, 'warning');
        this.closeUserPopover();
    }

    profileSettings() {
        this.app.showToast('Opening profile settings...', 'info');
        this.closeUserPopover();
    }

    viewUserPosts(userId) {
        const userData = this.userCache.get(userId);
        this.app.showToast(`Viewing ${userData?.name || 'user'}'s posts...`, 'info');
        this.closeUserPopover();
    }

    viewFollowers(userId) {
        const userData = this.userCache.get(userId);
        this.app.showToast(`Viewing ${userData?.name || 'user'}'s followers...`, 'info');
        this.closeUserPopover();
    }

    viewFollowing(userId) {
        const userData = this.userCache.get(userId);
        this.app.showToast(`Viewing who ${userData?.name || 'user'} follows...`, 'info');
        this.closeUserPopover();
    }

    viewAllUserStories(userId) {
        const userData = this.userCache.get(userId);
        this.app.showToast(`Viewing all stories by ${userData?.name || 'user'}...`, 'info');
        this.closeUserPopover();
        // In a real app, this would open a stories viewer with all the user's stories
    }

    toggleActionMenu(userId) {
        const menu = document.getElementById(`action-menu-${userId}`);
        if (menu) {
            const isVisible = menu.style.display !== 'none';
            
            // Close all other menus first
            document.querySelectorAll('.action-dropdown-menu').forEach(m => {
                m.style.display = 'none';
            });
            
            menu.style.display = isVisible ? 'none' : 'block';
        }
    }

    /**
     * Cleanup method
     */
    destroy() {
        this.closeUserPopover();
        this.userCache.clear();
        this.followingStatus.clear();
        console.log('Story User Interaction System cleaned up');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for app to be available
    const initStoryUserInteraction = () => {
        if (typeof app !== 'undefined' && app) {
            window.storyUserInteraction = new StoryUserInteraction(app);
            console.log('Story User Interaction System initialized and ready!');
        } else {
            setTimeout(initStoryUserInteraction, 100);
        }
    };
    
    setTimeout(initStoryUserInteraction, 500);
});

// Export for use
window.StoryUserInteraction = StoryUserInteraction;
