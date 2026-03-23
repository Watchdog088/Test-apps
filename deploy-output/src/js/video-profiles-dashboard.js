/**
 * ConnectHub - Comprehensive Video Profiles Dashboard
 * Detailed implementation for video profiles section in meet people dashboard
 * Based on specifications for what displays when clicking "Video Profiles" button
 */

class VideoProfilesDashboard {
    constructor(app) {
        this.app = app || window.app || { showToast: (msg, type) => console.log(msg) };
        this.videoProfiles = [];
        this.sortBy = 'newest';
        this.filterDuration = 'all';
        this.init();
    }

    init() {
        console.log('Initializing Video Profiles Dashboard...');
        this.generateVideoProfiles();
    }

    /**
     * Generate comprehensive video profiles data
     */
    generateVideoProfiles() {
        const names = [
            'Emma Rodriguez', 'Alex Chen', 'Sarah Johnson', 'Michael Kim', 'Jessica Williams',
            'David Martinez', 'Ashley Brown', 'Ryan Garcia', 'Olivia Davis', 'James Wilson',
            'Sophia Anderson', 'Daniel Thompson', 'Isabella Taylor', 'Christopher Lee', 'Madison White',
            'Lucas Rodriguez', 'Ava Martinez', 'Ethan Johnson', 'Mia Garcia', 'Noah Brown',
            'Zoe Parker', 'Tyler Brooks', 'Hannah Lee', 'Jordan Smith'
        ];

        const bios = [
            'Adventure seeker exploring the world one video at a time ✈️',
            'Tech enthusiast sharing coding tips and life hacks 💻',
            'Professional photographer capturing life\'s moments 📸',
            'Yoga instructor spreading positive vibes 🧘‍♀️',
            'Music producer creating beats that move souls 🎵',
            'Startup founder building the future 🚀',
            'Marine biologist passionate about ocean conservation 🌊',
            'Digital artist bringing imagination to life 🎨',
            'Travel blogger with stories from 47 countries 🗺️',
            'Coffee connoisseur and weekend adventurer ☕'
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

        this.videoProfiles = Array.from({ length: 24 }, (_, i) => ({
            id: `video-profile-${Date.now()}-${i}`,
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
            videoDuration: this.getRandomVideoDuration(),
            videoViews: Math.floor(Math.random() * 10000) + 1000,
            videoLikes: Math.floor(Math.random() * 500) + 100,
            videoComments: Math.floor(Math.random() * 100) + 25,
            videoShares: Math.floor(Math.random() * 50) + 10,
            uploadTime: this.getVideoUploadTime(),
            responseTime: this.getResponseTime(),
            videoFrequency: this.getVideoFrequency(),
            lastSeen: this.getRandomLastSeen(),
            videoQuote: this.getVideoPreviewQuote()
        }));
    }

    /**
     * Render the comprehensive video profiles view
     */
    renderVideoProfilesView() {
        const container = document.getElementById('video-grid');
        if (!container) return;

        // Add comprehensive header
        this.addVideoProfilesHeader();
        
        // Show enhanced loading state
        container.innerHTML = `
            <div class="video-loading-comprehensive">
                <div class="video-loader-advanced">
                    <div class="video-loading-icon">
                        <i class="fas fa-video"></i>
                        <div class="loading-pulse"></div>
                    </div>
                    <h3>Loading video profiles...</h3>
                    <p>Finding the best video introductions for you</p>
                    <div class="loading-progress">
                        <div class="progress-bar"></div>
                    </div>
                </div>
            </div>
        `;

        // Enhanced loading simulation with progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            const progressBar = document.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = Math.min(progress, 100) + '%';
            }
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                this.renderVideoProfileCards(container);
            }
        }, 150);
    }

    /**
     * Add comprehensive video profiles header
     */
    addVideoProfilesHeader() {
        const existingHeader = document.querySelector('.video-view-header-comprehensive');
        if (existingHeader) existingHeader.remove();

        const videoView = document.getElementById('video-view');
        if (!videoView) return;

        const totalAvailable = this.videoProfiles.length;
        const newToday = Math.floor(Math.random() * 50) + 30;

        const headerHTML = `
            <div class="video-view-header-comprehensive">
                <!-- Main Video Header Section -->
                <div class="video-header-main">
                    <div class="video-header-left-enhanced">
                        <div class="video-title-section">
                            <h1 class="video-main-title">
                                <i class="fas fa-video"></i>
                                Video Profiles
                            </h1>
                            <p class="video-description">Discover amazing people through their video introductions</p>
                        </div>
                        
                        <!-- Enhanced Statistics Panel -->
                        <div class="video-statistics-enhanced">
                            <div class="video-stat-bubble available">
                                <div class="stat-icon">
                                    <i class="fas fa-users"></i>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-number">${totalAvailable}</span>
                                    <span class="stat-label">video profiles available</span>
                                </div>
                            </div>
                            
                            <div class="video-stat-bubble new-today">
                                <div class="stat-icon">
                                    <i class="fas fa-fire"></i>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-number">${newToday}</span>
                                    <span class="stat-label">new today</span>
                                </div>
                            </div>
                            
                            <div class="video-stat-bubble match-rate">
                                <div class="stat-icon">
                                    <i class="fas fa-heart"></i>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-number">3x</span>
                                    <span class="stat-label">higher match rate</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Enhanced Action Buttons -->
                    <div class="video-header-actions-enhanced">
                        <button class="video-action-btn filter-videos" onclick="videoProfilesDashboard.openVideoFiltersAdvanced()">
                            <div class="btn-icon">
                                <i class="fas fa-filter"></i>
                                <div class="btn-notification">2</div>
                            </div>
                            <div class="btn-content">
                                <span class="btn-title">Filter Videos</span>
                                <span class="btn-subtitle">Customize preferences</span>
                            </div>
                        </button>
                        
                        <button class="video-action-btn create-video primary" onclick="videoProfilesDashboard.createVideoProfileAdvanced()">
                            <div class="btn-icon">
                                <i class="fas fa-plus-circle"></i>
                            </div>
                            <div class="btn-content">
                                <span class="btn-title">Create Your Video</span>
                                <span class="btn-subtitle">Stand out from the crowd</span>
                            </div>
                        </button>
                    </div>
                </div>
                
                <!-- Enhanced Pro Tip Section -->
                <div class="video-pro-tip-enhanced">
                    <div class="tip-container-advanced">
                        <div class="tip-icon-enhanced">
                            <i class="fas fa-lightbulb"></i>
                            <div class="tip-glow"></div>
                        </div>
                        <div class="tip-content-enhanced">
                            <div class="tip-main-text">
                                <strong>Pro Tip:</strong> Video profiles get 300% more matches! Create yours to stand out.
                            </div>
                            <div class="tip-additional-info">
                                Video profiles receive 5x more messages and 4x more profile views than photo-only profiles.
                            </div>
                        </div>
                        <div class="tip-actions-enhanced">
                            <button class="tip-action-btn learn-more" onclick="videoProfilesDashboard.learnAboutVideoProfiles()">
                                <i class="fas fa-info-circle"></i>
                                Learn More
                            </button>
                            <button class="tip-close-btn" onclick="this.closest('.video-pro-tip-enhanced').remove()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Video Discovery Tools -->
                <div class="video-discovery-tools">
                    <div class="discovery-filters-quick">
                        <div class="filter-group">
                            <label>Sort by:</label>
                            <select class="video-sort-select" onchange="videoProfilesDashboard.sortVideoProfiles(this.value)">
                                <option value="newest">Newest First</option>
                                <option value="popular">Most Popular</option>
                                <option value="compatible">Most Compatible</option>
                                <option value="nearby">Closest to You</option>
                                <option value="active">Recently Active</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label>Video Length:</label>
                            <div class="duration-filters">
                                <button class="duration-filter active" data-duration="all" onclick="videoProfilesDashboard.filterVideosByDuration('all')">All</button>
                                <button class="duration-filter" data-duration="short" onclick="videoProfilesDashboard.filterVideosByDuration('short')">Under 1min</button>
                                <button class="duration-filter" data-duration="medium" onclick="videoProfilesDashboard.filterVideosByDuration('medium')">1-2min</button>
                                <button class="duration-filter" data-duration="long" onclick="videoProfilesDashboard.filterVideosByDuration('long')">2min+</button>
                            </div>
                        </div>
                        
                        <div class="filter-group">
                            <button class="advanced-filters-toggle" onclick="videoProfilesDashboard.toggleAdvancedVideoFilters()">
                                <i class="fas fa-sliders-h"></i>
                                Advanced Filters
                                <i class="fas fa-chevron-down"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        videoView.insertAdjacentHTML('afterbegin', headerHTML);
    }

    /**
     * Render comprehensive video profile cards
     */
    renderVideoProfileCards(container) {
        container.innerHTML = this.videoProfiles.map((profile, index) => `
            <div class="video-profile-card-enhanced" onclick="videoProfilesDashboard.playVideoProfile('${profile.id}')">
                <!-- Video Thumbnail with Advanced Overlay -->
                <div class="video-thumbnail-advanced" style="background: ${profile.gradient};" data-profile="${profile.id}">
                    <!-- Main Play Interface -->
                    <div class="video-play-interface">
                        <div class="play-button-enhanced">
                            <div class="play-icon-container">
                                <i class="fas fa-play"></i>
                                <div class="play-ripple"></div>
                            </div>
                            <div class="play-text">Watch Introduction</div>
                        </div>
                        
                        <!-- Video Preview Overlay -->
                        <div class="video-preview-overlay">
                            <div class="preview-text">"${profile.videoQuote}"</div>
                            <div class="preview-duration">${profile.videoDuration}</div>
                        </div>
                    </div>
                    
                    <!-- Enhanced Video Info Panel -->
                    <div class="video-info-panel">
                        <!-- Top Info Bar -->
                        <div class="video-top-info">
                            <div class="video-badges-cluster">
                                <div class="video-duration-badge">${profile.videoDuration}</div>
                                ${profile.verified ? '<div class="verified-video-badge"><i class="fas fa-check-circle"></i></div>' : ''}
                                ${profile.online ? '<div class="online-video-badge"><div class="online-pulse"></div><i class="fas fa-circle"></i></div>' : ''}
                                <div class="video-quality-badge">HD</div>
                            </div>
                            
                            <!-- Video Popularity Indicator -->
                            <div class="video-popularity">
                                <div class="popularity-stars">
                                    ${this.generatePopularityStars(profile.matchPercentage)}
                                </div>
                                <span class="view-count">
                                    <i class="fas fa-eye"></i>
                                    ${this.formatNumber(profile.videoViews)}
                                </span>
                            </div>
                        </div>
                        
                        <!-- Bottom Quick Actions -->
                        <div class="video-quick-actions">
                            <button class="video-quick-action bookmark" onclick="event.stopPropagation(); videoProfilesDashboard.bookmarkVideo('${profile.id}')" title="Save Video">
                                <i class="fas fa-bookmark"></i>
                            </button>
                            <button class="video-quick-action volume" onclick="event.stopPropagation(); videoProfilesDashboard.toggleVideoSound('${profile.id}')" title="Audio Preview">
                                <i class="fas fa-volume-up"></i>
                            </button>
                            <button class="video-quick-action fullscreen" onclick="event.stopPropagation(); videoProfilesDashboard.expandVideo('${profile.id}')" title="View Fullscreen">
                                <i class="fas fa-expand"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Video Progress Bar -->
                    <div class="video-progress-container">
                        <div class="video-progress-bar" style="width: 0%"></div>
                    </div>
                </div>
                
                <!-- Comprehensive Profile Information Panel -->
                <div class="video-profile-details">
                    <!-- Profile Header with Enhanced Info -->
                    <div class="video-profile-header-enhanced">
                        <div class="profile-name-section">
                            <h4 class="profile-name-enhanced">${profile.name}, ${profile.age}</h4>
                            <div class="profile-verification-status">
                                ${profile.verified ? '<span class="verification-checkmark"><i class="fas fa-shield-check"></i> Verified</span>' : ''}
                                ${profile.online ? '<span class="online-status-enhanced"><i class="fas fa-circle"></i> Online Now</span>' : '<span class="offline-status">Active ' + profile.lastSeen + '</span>'}
                            </div>
                        </div>
                        
                        <!-- Advanced Match Compatibility -->
                        <div class="match-compatibility-advanced">
                            <div class="compatibility-circle">
                                <div class="compatibility-progress" style="--progress: ${profile.matchPercentage}%">
                                    <span class="compatibility-percentage">${profile.matchPercentage}%</span>
                                </div>
                            </div>
                            <div class="compatibility-label">
                                <span class="match-text">Match</span>
                                <div class="compatibility-hearts">
                                    ${this.generateCompatibilityHearts(profile.matchPercentage)}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Location and Distance Info -->
                    <div class="video-location-enhanced">
                        <div class="location-info-detailed">
                            <i class="fas fa-map-marker-alt"></i>
                            <span class="location-text">${profile.location}</span>
                            <span class="distance-badge">${profile.distance}mi away</span>
                            ${profile.distance <= 5 ? '<span class="proximity-badge">Very Close</span>' : ''}
                        </div>
                        <div class="location-actions">
                            <button class="location-action" onclick="event.stopPropagation(); videoProfilesDashboard.viewLocationMap('${profile.id}')" title="View on Map">
                                <i class="fas fa-map"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Video Introduction Teaser -->
                    <div class="video-introduction-section">
                        <div class="introduction-header">
                            <i class="fas fa-quote-left"></i>
                            <span>Video Introduction</span>
                        </div>
                        <p class="video-teaser-enhanced">${profile.bio}</p>
                        <div class="video-engagement-stats">
                            <span class="engagement-stat">
                                <i class="fas fa-thumbs-up"></i>
                                ${profile.videoLikes} likes
                            </span>
                            <span class="engagement-stat">
                                <i class="fas fa-comment-dots"></i>
                                ${profile.videoComments} comments
                            </span>
                            <span class="engagement-stat">
                                <i class="fas fa-share"></i>
                                ${profile.videoShares} shares
                            </span>
                        </div>
                    </div>
                    
                    <!-- Interest Tags with Enhanced Display -->
                    <div class="video-interests-enhanced">
                        <div class="interests-header">
                            <i class="fas fa-hashtag"></i>
                            <span>Interests & Hobbies</span>
                        </div>
                        <div class="interests-grid-enhanced">
                            ${profile.interests.slice(0, 4).map(interest => 
                                `<button class="interest-tag-enhanced" onclick="event.stopPropagation(); videoProfilesDashboard.filterByInterest('${interest}')" title="Filter by ${interest}">
                                    <span class="interest-emoji">${this.getInterestEmoji(interest)}</span>
                                    <span class="interest-name">${interest}</span>
                                </button>`
                            ).join('')}
                            ${profile.interests.length > 4 ? 
                                `<button class="more-interests-enhanced" onclick="event.stopPropagation(); videoProfilesDashboard.showAllInterests('${profile.id}')">
                                    <span class="more-count">+${profile.interests.length - 4}</span>
                                    <span class="more-text">more</span>
                                </button>` : ''}
                        </div>
                    </div>
                    
                    <!-- Enhanced Video Actions Panel -->
                    <div class="video-actions-comprehensive">
                        <div class="primary-actions">
                            <button class="video-action-enhanced like" onclick="event.stopPropagation(); videoProfilesDashboard.likeVideoProfile('${profile.id}')" title="Like This Video">
                                <div class="action-icon">
                                    <i class="fas fa-heart"></i>
                                    <div class="action-ripple"></div>
                                </div>
                                <span class="action-text">Like Video</span>
                                <span class="action-count">${profile.videoLikes}</span>
                            </button>
                            
                            <button class="video-action-enhanced message" onclick="event.stopPropagation(); videoProfilesDashboard.sendVideoMessage('${profile.id}')" title="Send Message">
                                <div class="action-icon">
                                    <i class="fas fa-paper-plane"></i>
                                    <div class="action-ripple"></div>
                                </div>
                                <span class="action-text">Message</span>
                                <span class="action-hint">Say Hi!</span>
                            </button>
                            
                            <button class="video-action-enhanced share" onclick="event.stopPropagation(); videoProfilesDashboard.shareVideoProfile('${profile.id}')" title="Share Profile">
                                <div class="action-icon">
                                    <i class="fas fa-share-alt"></i>
                                    <div class="action-ripple"></div>
                                </div>
                                <span class="action-text">Share</span>
                                <span class="action-hint">Spread the love</span>
                            </button>
                        </div>
                        
                        <div class="secondary-actions">
                            <button class="secondary-action super-like" onclick="event.stopPropagation(); videoProfilesDashboard.superLikeVideo('${profile.id}')" title="Super Like">
                                <i class="fas fa-star"></i>
                                <span>Super Like</span>
                            </button>
                            <button class="secondary-action profile-view" onclick="event.stopPropagation(); videoProfilesDashboard.viewFullProfile('${profile.id}')" title="View Full Profile">
                                <i class="fas fa-user-circle"></i>
                                <span>Full Profile</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Video Profile Statistics Dashboard -->
                    <div class="video-profile-statistics">
                        <div class="statistics-header">
                            <i class="fas fa-chart-line"></i>
                            <span>Profile Analytics</span>
                        </div>
                        <div class="statistics-grid">
                            <div class="stat-item">
                                <div class="stat-icon views">
                                    <i class="fas fa-eye"></i>
                                </div>
                                <div class="stat-details">
                                    <span class="stat-number">${this.formatNumber(profile.videoViews)}</span>
                                    <span class="stat-label">Views</span>
                                </div>
                            </div>
                            
                            <div class="stat-item">
                                <div class="stat-icon engagement">
                                    <i class="fas fa-heart"></i>
                                </div>
                                <div class="stat-details">
                                    <span class="stat-number">${profile.videoLikes}</span>
                                    <span class="stat-label">Likes</span>
                                </div>
                            </div>
                            
                            <div class="stat-item">
                                <div class="stat-icon messages">
                                    <i class="fas fa-comment"></i>
                                </div>
                                <div class="stat-details">
                                    <span class="stat-number">${profile.videoComments}</span>
                                    <span class="stat-label">Messages</span>
                                </div>
                            </div>
                            
                            <div class="stat-item">
                                <div class="stat-icon recent">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <div class="stat-details">
                                    <span class="stat-number">${profile.uploadTime}</span>
                                    <span class="stat-label">Uploaded</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Profile Activity Indicators -->
                    <div class="profile-activity-enhanced">
                        <div class="activity-indicator-grid">
                            ${profile.online ? 
                                '<div class="activity-indicator online-now"><i class="fas fa-circle"></i> Online Now</div>' :
                                `<div class="activity-indicator last-seen">Last seen ${profile.lastSeen}</div>`
                            }
                            <div class="activity-indicator response-time">
                                <i class="fas fa-clock"></i>
                                Replies in ${profile.responseTime}
                            </div>
                            <div class="activity-indicator video-frequency">
                                <i class="fas fa-video"></i>
                                Posts ${profile.videoFrequency} videos
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Hover Enhancement Overlay -->
                <div class="video-hover-enhancement">
                    <div class="hover-actions-panel">
                        <button class="hover-action quick-like" onclick="event.stopPropagation(); videoProfilesDashboard.quickLikeVideo('${profile.id}')" title="Quick Like">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="hover-action quick-message" onclick="event.stopPropagation(); videoProfilesDashboard.quickMessage('${profile.id}')" title="Quick Message">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                        <button class="hover-action quick-save" onclick="event.stopPropagation(); videoProfilesDashboard.saveProfile('${profile.id}')" title="Save for Later">
                            <i class="fas fa-bookmark"></i>
                        </button>
                    </div>
                    
                    <div class="hover-info-panel">
                        <div class="quick-compatibility">
                            <span class="compatibility-score">${profile.matchPercentage}% Compatible</span>
                            <div class="mutual-interests">
                                ${this.getMutualInterests(profile.interests).slice(0, 3).map(interest => 
                                    `<span class="mutual-tag">${this.getInterestEmoji(interest)}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Initialize enhanced video interactions
        this.initializeVideoProfileInteractions();
    }

    // Video Profile Interaction Methods
    playVideoProfile(profileId) {
        console.log('Playing video for:', profileId);
        const profile = this.videoProfiles.find(p => p.id === profileId);
        if (!profile) return;

        // Open the detailed video dashboard instead of playing inline
        if (window.videoDetailsDashboard) {
            window.videoDetailsDashboard.openWithProfile(profile);
        } else {
            // Fallback to the original inline playback if video details dashboard isn't available
            const card = document.querySelector(`[data-profile="${profileId}"]`);
            if (card) {
                const progressBar = card.querySelector('.video-progress-bar');
                let progress = 0;
                
                const playInterval = setInterval(() => {
                    progress += 2;
                    if (progressBar) {
                        progressBar.style.width = progress + '%';
                    }
                    
                    if (progress >= 100) {
                        clearInterval(playInterval);
                        this.showVideoCompleteAnimation(profileId);
                    }
                }, 100);
            }

            this.app.showToast(`Playing ${profile.name}'s video introduction`, 'info');
        }
    }

    showVideoCompleteAnimation(profileId) {
        const card = document.querySelector(`[data-profile="${profileId}"]`);
        if (card) {
            // Add completion checkmark
            const checkmark = document.createElement('div');
            checkmark.className = 'video-complete-checkmark';
            checkmark.innerHTML = '<i class="fas fa-check-circle"></i>';
            card.appendChild(checkmark);

            setTimeout(() => checkmark.remove(), 3000);
        }
    }

    likeVideoProfile(profileId) {
        const profile = this.videoProfiles.find(p => p.id === profileId);
        if (!profile) return;

        // Increment like count
        profile.videoLikes += 1;
        
        // Update display
        const likeButton = document.querySelector(`[onclick*="likeVideoProfile('${profileId}')"] .action-count`);
        if (likeButton) {
            likeButton.textContent = profile.videoLikes;
        }

        // Show like animation
        this.showVideoLikeAnimation(profileId);
        
        // Check for potential match
        const isMatch = Math.random() > 0.4; // 60% chance for video profiles
        
        if (isMatch) {
            setTimeout(() => {
                this.showVideoMatchAnimation(profile);
                this.app.showToast(`🎉 Video Match with ${profile.name}!`, 'success');
            }, 1000);
        } else {
            this.app.showToast(`💕 You liked ${profile.name}'s video!`, 'success');
        }
    }

    showVideoLikeAnimation(profileId) {
        const card = document.querySelector(`[data-profile="${profileId}"]`);
        if (!card) return;

        const heart = document.createElement('div');
        heart.className = 'video-like-heart-enhanced';
        heart.innerHTML = '💕';
        heart.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 3rem;
            z-index: 1000;
            animation: videoLikeFloat 2s ease-out forwards;
            pointer-events: none;
        `;

        card.appendChild(heart);
        setTimeout(() => heart.remove(), 2000);
    }

    showVideoMatchAnimation(profile) {
        // Create match overlay
        const matchOverlay = document.createElement('div');
        matchOverlay.className = 'video-match-overlay';
        matchOverlay.innerHTML = `
            <div class="match-animation-container">
                <div class="match-hearts">
                    <div class="heart heart-1">💖</div>
                    <div class="heart heart-2">💕</div>
                    <div class="heart heart-3">💓</div>
                </div>
                <h2 class="match-title">It's a Video Match!</h2>
                <p class="match-text">You and ${profile.name} liked each other's videos</p>
                <div class="match-actions">
                    <button class="match-action send-message" onclick="videoProfilesDashboard.sendMatchMessage('${profile.id}')">
                        <i class="fas fa-paper-plane"></i>
                        Send Message
                    </button>
                    <button class="match-action keep-browsing" onclick="this.closest('.video-match-overlay').remove()">
                        Keep Browsing
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(matchOverlay);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (matchOverlay.parentNode) {
                matchOverlay.remove();
            }
        }, 10000);
    }

    sendVideoMessage(profileId) {
        const profile = this.videoProfiles.find(p => p.id === profileId);
        if (!profile) return;

        // Create message modal
        const messageModal = document.createElement('div');
        messageModal.className = 'video-message-modal';
        messageModal.innerHTML = `
            <div class="message-modal-content">
                <div class="modal-header">
                    <h3>Send Message to ${profile.name}</h3>
                    <button class="modal-close" onclick="this.closest('.video-message-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="profile-preview">
                        <div class="profile-video-thumb" style="background: ${profile.gradient};">
                            <i class="fas fa-video"></i>
                        </div>
                        <div class="profile-info">
                            <h4>${profile.name}, ${profile.age}</h4>
                            <p>${profile.location}</p>
                            <span class="match-indicator">${profile.matchPercentage}% match</span>
                        </div>
                    </div>
                    
                    <div class="message-templates">
                        <h4>Quick Templates:</h4>
                        <div class="template-buttons">
                            <button class="template-btn" onclick="videoProfilesDashboard.useMessageTemplate('Hey! I loved your video introduction! 😊')">
                                💬 Love your video!
                            </button>
                            <button class="template-btn" onclick="videoProfilesDashboard.useMessageTemplate('Your video was amazing! What inspired you to create it?')">
                                ❓ Ask about video
                            </button>
                            <button class="template-btn" onclick="videoProfilesDashboard.useMessageTemplate('Hi ${profile.name}! We have so much in common. Would love to chat! ✨')">
                                ✨ Common interests
                            </button>
                        </div>
                    </div>
                    
                    <div class="message-composer">
                        <textarea id="videoMessageText" placeholder="Write your message here..." rows="4"></textarea>
                        <div class="message-actions">
                            <button class="send-message-btn" onclick="videoProfilesDashboard.sendMessage('${profileId}')">
                                <i class="fas fa-paper-plane"></i>
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(messageModal);
    }

    shareVideoProfile(profileId) {
        const profile = this.videoProfiles.find(p => p.id === profileId);
        if (!profile) return;

        // Create share modal
        const shareModal = document.createElement('div');
        shareModal.className = 'video-share-modal';
        shareModal.innerHTML = `
            <div class="share-modal-content">
                <div class="modal-header">
                    <h3>Share ${profile.name}'s Video Profile</h3>
                    <button class="modal-close" onclick="this.closest('.video-share-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="share-options">
                        <h4>Share via:</h4>
                        <div class="share-buttons">
                            <button class="share-btn facebook" onclick="videoProfilesDashboard.shareToFacebook('${profileId}')">
                                <i class="fab fa-facebook"></i>
                                Facebook
                            </button>
                            <button class="share-btn twitter" onclick="videoProfilesDashboard.shareToTwitter('${profileId}')">
                                <i class="fab fa-twitter"></i>
                                Twitter
                            </button>
                            <button class="share-btn instagram" onclick="videoProfilesDashboard.shareToInstagram('${profileId}')">
                                <i class="fab fa-instagram"></i>
                                Instagram
                            </button>
                            <button class="share-btn whatsapp" onclick="videoProfilesDashboard.shareToWhatsApp('${profileId}')">
                                <i class="fab fa-whatsapp"></i>
                                WhatsApp
                            </button>
                            <button class="share-btn copy-link" onclick="videoProfilesDashboard.copyProfileLink('${profileId}')">
                                <i class="fas fa-link"></i>
                                Copy Link
                            </button>
                        </div>
                    </div>
                    
                    <div class="share-preview">
                        <h4>Preview:</h4>
                        <div class="share-card">
                            <div class="share-thumb" style="background: ${profile.gradient};">
                                <i class="fas fa-video"></i>
                            </div>
                            <div class="share-info">
                                <h5>${profile.name}'s Video Profile</h5>
                                <p>${profile.bio}</p>
                                <span class="share-stats">${profile.videoViews} views • ${profile.videoLikes} likes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(shareModal);
    }

    // Filter and Sort Methods
    sortVideoProfiles(sortBy) {
        this.sortBy = sortBy;
        let sortedProfiles = [...this.videoProfiles];

        switch (sortBy) {
            case 'newest':
                sortedProfiles.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
                break;
            case 'popular':
                sortedProfiles.sort((a, b) => b.videoViews - a.videoViews);
                break;
            case 'compatible':
                sortedProfiles.sort((a, b) => b.matchPercentage - a.matchPercentage);
                break;
            case 'nearby':
                sortedProfiles.sort((a, b) => a.distance - b.distance);
                break;
            case 'active':
                sortedProfiles.sort((a, b) => a.online === b.online ? 0 : a.online ? -1 : 1);
                break;
        }

        this.videoProfiles = sortedProfiles;
        const container = document.getElementById('video-grid');
        if (container) {
            this.renderVideoProfileCards(container);
        }

        this.app.showToast(`Sorted by ${sortBy}`, 'info');
    }

    filterVideosByDuration(duration) {
        this.filterDuration = duration;
        
        // Update active filter button
        document.querySelectorAll('.duration-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-duration="${duration}"]`).classList.add('active');

        // Apply filter logic here
        this.app.showToast(`Filtered by ${duration} duration`, 'info');
    }

    // Additional Interactive Methods
    bookmarkVideo(profileId) {
        const profile = this.videoProfiles.find(p => p.id === profileId);
        if (!profile) return;

        this.app.showToast(`Bookmarked ${profile.name}'s video profile!`, 'success');
    }

    toggleVideoSound(profileId) {
        const profile = this.videoProfiles.find(p => p.id === profileId);
        if (!profile) return;

        this.app.showToast(`Audio preview for ${profile.name}'s video`, 'info');
    }

    expandVideo(profileId) {
        const profile = this.videoProfiles.find(p => p.id === profileId);
        if (!profile) return;

        // Create fullscreen video modal
        const fullscreenModal = document.createElement('div');
        fullscreenModal.className = 'video-fullscreen-modal';
        fullscreenModal.innerHTML = `
            <div class="fullscreen-content">
                <div class="fullscreen-header">
                    <h3>${profile.name}'s Video Introduction</h3>
                    <button class="fullscreen-close" onclick="this.closest('.video-fullscreen-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="fullscreen-video-container">
                    <div class="fullscreen-video-player" style="background: ${profile.gradient};">
                        <div class="fullscreen-play-button">
                            <i class="fas fa-play"></i>
                        </div>
                        <div class="video-overlay-info">
                            <h4>${profile.name}, ${profile.age}</h4>
                            <p>${profile.location}</p>
                        </div>
                    </div>
                </div>
                
                <div class="fullscreen-actions">
                    <button class="fullscreen-action like" onclick="videoProfilesDashboard.likeVideoProfile('${profileId}')">
                        <i class="fas fa-heart"></i>
                        Like
                    </button>
                    <button class="fullscreen-action message" onclick="videoProfilesDashboard.sendVideoMessage('${profileId}')">
                        <i class="fas fa-paper-plane"></i>
                        Message
                    </button>
                    <button class="fullscreen-action share" onclick="videoProfilesDashboard.shareVideoProfile('${profileId}')">
                        <i class="fas fa-share-alt"></i>
                        Share
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(fullscreenModal);
    }

    superLikeVideo(profileId) {
        const profile = this.videoProfiles.find(p => p.id === profileId);
        if (!profile) return;

        // Create super like animation
        const card = document.querySelector(`[data-profile="${profileId}"]`);
        if (card) {
            const star = document.createElement('div');
            star.className = 'super-like-star';
            star.innerHTML = '⭐';
            star.style.cssText = `
                position: absolute;
                top: 20%;
                left: 50%;
                transform: translateX(-50%);
                font-size: 4rem;
                z-index: 1000;
                animation: superLikeBurst 3s ease-out forwards;
                pointer-events: none;
            `;
            
            card.appendChild(star);
            setTimeout(() => star.remove(), 3000);
        }

        this.app.showToast(`⭐ Super Liked ${profile.name}'s video! They'll know you're really interested!`, 'success');
    }

    viewFullProfile(profileId) {
        const profile = this.videoProfiles.find(p => p.id === profileId);
        if (!profile) return;

        this.app.showToast(`Opening ${profile.name}'s full profile...`, 'info');
        // Here you would typically navigate to the full profile view
    }

    // Quick action methods
    quickLikeVideo(profileId) {
        this.likeVideoProfile(profileId);
    }

    quickMessage(profileId) {
        this.sendVideoMessage(profileId);
    }

    saveProfile(profileId) {
        this.bookmarkVideo(profileId);
    }

    // Interest and filtering methods
    filterByInterest(interest) {
        this.app.showToast(`Filtering videos by ${interest} interest`, 'info');
    }

    showAllInterests(profileId) {
        const profile = this.videoProfiles.find(p => p.id === profileId);
        if (!profile) return;

        const interestsModal = document.createElement('div');
        interestsModal.className = 'interests-modal';
        interestsModal.innerHTML = `
            <div class="interests-modal-content">
                <div class="modal-header">
                    <h3>${profile.name}'s Interests</h3>
                    <button class="modal-close" onclick="this.closest('.interests-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="all-interests-grid">
                        ${profile.interests.map(interest => 
                            `<div class="interest-item-detailed">
                                <span class="interest-emoji-large">${this.getInterestEmoji(interest)}</span>
                                <span class="interest-name-large">${interest}</span>
                                <button class="interest-filter-btn" onclick="videoProfilesDashboard.filterByInterest('${interest}')">
                                    Find Similar
                                </button>
                            </div>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(interestsModal);
    }

    viewLocationMap(profileId) {
        const profile = this.videoProfiles.find(p => p.id === profileId);
        if (!profile) return;

        this.app.showToast(`Showing ${profile.name}'s location on map`, 'info');
    }

    // Message and sharing utility methods
    useMessageTemplate(template) {
        const messageTextarea = document.getElementById('videoMessageText');
        if (messageTextarea) {
            messageTextarea.value = template;
            messageTextarea.focus();
        }
    }

    sendMessage(profileId) {
        const messageTextarea = document.getElementById('videoMessageText');
        const message = messageTextarea?.value || '';
        
        if (!message.trim()) {
            this.app.showToast('Please write a message first!', 'warning');
            return;
        }

        const profile = this.videoProfiles.find(p => p.id === profileId);
        if (!profile) return;

        this.app.showToast(`Message sent to ${profile.name}!`, 'success');
        
        // Close modal
        document.querySelector('.video-message-modal')?.remove();
    }

    sendMatchMessage(profileId) {
        this.sendVideoMessage(profileId);
        document.querySelector('.video-match-overlay')?.remove();
    }

    // Social sharing methods
    shareToFacebook(profileId) {
        this.app.showToast('Sharing to Facebook...', 'info');
        this.closeShareModal();
    }

    shareToTwitter(profileId) {
        this.app.showToast('Sharing to Twitter...', 'info');
        this.closeShareModal();
    }

    shareToInstagram(profileId) {
        this.app.showToast('Sharing to Instagram...', 'info');
        this.closeShareModal();
    }

    shareToWhatsApp(profileId) {
        this.app.showToast('Sharing to WhatsApp...', 'info');
        this.closeShareModal();
    }

    copyProfileLink(profileId) {
        const profile = this.videoProfiles.find(p => p.id === profileId);
        if (!profile) return;

        // Simulate copying to clipboard
        const link = `https://connecthub.com/video-profile/${profileId}`;
        navigator.clipboard?.writeText(link).then(() => {
            this.app.showToast('Profile link copied to clipboard!', 'success');
        }).catch(() => {
            this.app.showToast('Link copied!', 'success');
        });
        
        this.closeShareModal();
    }

    closeShareModal() {
        document.querySelector('.video-share-modal')?.remove();
    }

    // Advanced filter methods
    openVideoFiltersAdvanced() {
        const filtersModal = document.createElement('div');
        filtersModal.className = 'advanced-filters-modal';
        filtersModal.innerHTML = `
            <div class="filters-modal-content">
                <div class="modal-header">
                    <h3>Advanced Video Filters</h3>
                    <button class="modal-close" onclick="this.closest('.advanced-filters-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="filter-sections">
                        <div class="filter-section">
                            <h4>Distance</h4>
                            <input type="range" id="distanceRange" min="1" max="50" value="25">
                            <span id="distanceValue">25 miles</span>
                        </div>
                        
                        <div class="filter-section">
                            <h4>Age Range</h4>
                            <input type="range" id="ageRange" min="18" max="65" value="35">
                            <span id="ageValue">18-35</span>
                        </div>
                        
                        <div class="filter-section">
                            <h4>Video Quality</h4>
                            <select id="videoQuality">
                                <option value="all">All Quality</option>
                                <option value="hd">HD Only</option>
                                <option value="4k">4K Only</option>
                            </select>
                        </div>
                        
                        <div class="filter-section">
                            <h4>Online Status</h4>
                            <label><input type="checkbox" id="onlineOnly"> Online Now Only</label>
                        </div>
                        
                        <div class="filter-section">
                            <h4>Verification</h4>
                            <label><input type="checkbox" id="verifiedOnly"> Verified Profiles Only</label>
                        </div>
                    </div>
                    
                    <div class="filter-actions">
                        <button class="apply-filters-btn" onclick="videoProfilesDashboard.applyAdvancedFilters()">
                            Apply Filters
                        </button>
                        <button class="reset-filters-btn" onclick="videoProfilesDashboard.resetFilters()">
                            Reset All
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(filtersModal);
    }

    applyAdvancedFilters() {
        this.app.showToast('Advanced filters applied!', 'success');
        document.querySelector('.advanced-filters-modal')?.remove();
    }

    resetFilters() {
        this.app.showToast('All filters reset', 'info');
    }

    toggleAdvancedVideoFilters() {
        this.openVideoFiltersAdvanced();
    }

    createVideoProfileAdvanced() {
        const createModal = document.createElement('div');
        createModal.className = 'create-video-modal';
        createModal.innerHTML = `
            <div class="create-modal-content">
                <div class="modal-header">
                    <h3>Create Your Video Profile</h3>
                    <button class="modal-close" onclick="this.closest('.create-video-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="create-steps">
                        <div class="step-indicator">
                            <div class="step active">1</div>
                            <div class="step">2</div>
                            <div class="step">3</div>
                        </div>
                        
                        <div class="step-content">
                            <h4>Step 1: Record Your Introduction</h4>
                            <p>Create a 30-90 second video introducing yourself</p>
                            
                            <div class="video-tips">
                                <h5>Pro Tips for Great Video Profiles:</h5>
                                <ul>
                                    <li>💡 Good lighting makes a huge difference</li>
                                    <li>🎤 Clear audio is essential</li>
                                    <li>😊 Be authentic and smile</li>
                                    <li>📱 Hold your phone vertically</li>
                                    <li>⏱️ Keep it between 30-90 seconds</li>
                                </ul>
                            </div>
                            
                            <div class="record-actions">
                                <button class="record-btn primary">
                                    <i class="fas fa-video"></i>
                                    Start Recording
                                </button>
                                <button class="upload-btn">
                                    <i class="fas fa-upload"></i>
                                    Upload Video
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(createModal);
    }

    learnAboutVideoProfiles() {
        const learnModal = document.createElement('div');
        learnModal.className = 'learn-video-modal';
        learnModal.innerHTML = `
            <div class="learn-modal-content">
                <div class="modal-header">
                    <h3>Why Video Profiles Work</h3>
                    <button class="modal-close" onclick="this.closest('.learn-video-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="learn-content">
                        <div class="benefit-card">
                            <div class="benefit-icon">📈</div>
                            <h4>300% More Matches</h4>
                            <p>Video profiles receive significantly more likes and matches than photo-only profiles</p>
                        </div>
                        
                        <div class="benefit-card">
                            <div class="benefit-icon">💬</div>
                            <h4>5x More Messages</h4>
                            <p>People are more likely to start conversations after watching your video introduction</p>
                        </div>
                        
                        <div class="benefit-card">
                            <div class="benefit-icon">👥</div>
                            <h4>Better Quality Connections</h4>
                            <p>Video profiles help people get to know the real you, leading to more meaningful connections</p>
                        </div>
                        
                        <div class="benefit-card">
                            <div class="benefit-icon">⭐</div>
                            <h4>Stand Out from the Crowd</h4>
                            <p>Most people still use only photos - a video makes you instantly more memorable</p>
                        </div>
                    </div>
                    
                    <div class="learn-actions">
                        <button class="create-video-btn" onclick="videoProfilesDashboard.createVideoProfileAdvanced(); this.closest('.learn-video-modal').remove();">
                            <i class="fas fa-video"></i>
                            Create My Video Profile
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(learnModal);
    }

    // Helper methods for video profile interactions
    initializeVideoProfileInteractions() {
        // Add hover effects and animations
        document.querySelectorAll('.video-profile-card-enhanced').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.classList.add('hovered');
            });
            
            card.addEventListener('mouseleave', () => {
                card.classList.remove('hovered');
            });
        });

        // Initialize progress bars for compatibility circles
        document.querySelectorAll('.compatibility-progress').forEach(circle => {
            const progress = circle.style.getPropertyValue('--progress');
            if (progress) {
                setTimeout(() => {
                    circle.style.setProperty('--progress', progress);
                }, 100);
            }
        });
    }

    // Utility helper methods
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    getRandomVideoDuration() {
        const durations = ['0:45', '1:12', '0:38', '1:25', '0:52', '1:08', '0:41', '1:33', '0:56', '1:15'];
        return durations[Math.floor(Math.random() * durations.length)];
    }

    getVideoUploadTime() {
        const times = ['2h ago', '5h ago', '1d ago', '2d ago', '3d ago', '1w ago', '2w ago'];
        return times[Math.floor(Math.random() * times.length)];
    }

    getResponseTime() {
        const times = ['under 1h', '2-3h', '4-6h', 'same day', '1-2 days'];
        return times[Math.floor(Math.random() * times.length)];
    }

    getVideoFrequency() {
        const frequencies = ['daily', 'few times a week', 'weekly', 'bi-weekly', 'monthly'];
        return frequencies[Math.floor(Math.random() * frequencies.length)];
    }

    getRandomLastSeen() {
        const times = ['5m ago', '1h ago', '2h ago', 'yesterday', '2d ago'];
        return times[Math.floor(Math.random() * times.length)];
    }

    getVideoPreviewQuote() {
        const quotes = [
            "Hi! I love exploring new places and trying new foods...",
            "Looking for someone to share adventures with!",
            "Passionate about music and making memories...",
            "Just moved to the city and excited to meet people!",
            "Love hiking, coffee, and deep conversations...",
            "Entrepreneur by day, foodie by night!",
            "Always up for trying something new...",
            "Family means everything to me...",
            "Let's create our own adventure story!",
            "Life's too short for boring conversations!"
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    // Additional helper methods for displaying profile information
    generatePopularityStars(matchPercentage) {
        const starCount = Math.floor(matchPercentage / 20);
        let stars = '';
        for (let i = 0; i < 5; i++) {
            if (i < starCount) {
                stars += '<i class="fas fa-star"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    generateCompatibilityHearts(matchPercentage) {
        const heartCount = Math.floor(matchPercentage / 25);
        let hearts = '';
        for (let i = 0; i < 4; i++) {
            if (i < heartCount) {
                hearts += '💕';
            } else {
                hearts += '🤍';
            }
        }
        return hearts;
    }

    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    getInterestEmoji(interest) {
        const emojiMap = {
            'Photography': '📸',
            'Travel': '✈️',
            'Music': '🎵',
            'Art': '🎨',
            'Technology': '💻',
            'Fitness': '💪',
            'Food': '🍕',
            'Books': '📚',
            'Movies': '🎬',
            'Gaming': '🎮',
            'Dancing': '💃',
            'Hiking': '🥾',
            'Yoga': '🧘',
            'Cooking': '👨‍🍳',
            'Fashion': '👗',
            'Sports': '⚽'
        };
        return emojiMap[interest] || '🌟';
    }

    getMutualInterests(interests) {
        // Simulate mutual interests - in a real app this would compare with user's interests
        return interests.filter(() => Math.random() > 0.6);
    }
}

// Global instance for use in HTML onclick handlers
let videoProfilesDashboard;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for app to be available
    if (window.app) {
        videoProfilesDashboard = new VideoProfilesDashboard(window.app);
    } else {
        // Fallback initialization
        setTimeout(() => {
            videoProfilesDashboard = new VideoProfilesDashboard(window.app || {
                showToast: (msg, type) => console.log(`${type}: ${msg}`)
            });
        }, 100);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoProfilesDashboard;
}
