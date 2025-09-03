/**
 * ConnectHub - Video Details Dashboard
 * Comprehensive video viewing and interaction interface that displays after clicking a video profile
 * Features: Video player, profile details, interaction controls, analytics, and social features
 */

class VideoDetailsDashboard {
    constructor(app) {
        this.app = app || window.app || { showToast: (msg, type) => console.log(msg) };
        this.currentProfile = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 30; // Default 30 seconds
        this.playInterval = null;
        this.userInteractions = {
            liked: false,
            superLiked: false,
            bookmarked: false,
            viewed: false,
            shared: false
        };
        this.init();
    }

    init() {
        console.log('Initializing Video Details Dashboard...');
        this.createDashboardHTML();
        this.setupEventListeners();
    }

    /**
     * Create the comprehensive video details dashboard HTML structure
     */
    createDashboardHTML() {
        const dashboardHTML = `
            <div id="video-details-dashboard" class="video-details-modal">
                <div class="video-modal-backdrop" onclick="videoDetailsDashboard.closeDashboard()"></div>
                
                <div class="video-details-container">
                    <!-- Header Controls -->
                    <header class="video-header">
                        <div class="header-left">
                            <button class="back-button" onclick="videoDetailsDashboard.closeDashboard()" title="Back to Video Profiles">
                                <i class="fas fa-arrow-left"></i>
                                <span>Back to Videos</span>
                            </button>
                        </div>
                        
                        <div class="header-center">
                            <div class="video-status-indicator">
                                <div class="status-dot playing"></div>
                                <span class="status-text">Now Playing</span>
                            </div>
                        </div>
                        
                        <div class="header-right">
                            <button class="header-action" onclick="videoDetailsDashboard.toggleFullscreen()" title="Toggle Fullscreen">
                                <i class="fas fa-expand"></i>
                            </button>
                            <button class="header-action" onclick="videoDetailsDashboard.shareVideo()" title="Share Video">
                                <i class="fas fa-share-alt"></i>
                            </button>
                            <button class="header-action" onclick="videoDetailsDashboard.reportVideo()" title="Report Video">
                                <i class="fas fa-flag"></i>
                            </button>
                            <button class="close-dashboard" onclick="videoDetailsDashboard.closeDashboard()" title="Close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </header>

                    <!-- Main Content Grid -->
                    <div class="video-content-grid">
                        <!-- Left Column: Video Player -->
                        <div class="video-player-section">
                            <div class="video-player-container">
                                <!-- Video Player -->
                                <div class="video-player" id="video-player">
                                    <div class="video-background" id="video-background">
                                        <!-- Video content will be rendered here -->
                                        <div class="video-gradient-overlay"></div>
                                        <div class="video-center-icon">
                                            <i class="fas fa-video"></i>
                                        </div>
                                    </div>
                                    
                                    <!-- Video Overlay Controls -->
                                    <div class="video-overlay-controls" id="video-overlay">
                                        <div class="play-pause-overlay" onclick="videoDetailsDashboard.togglePlayback()">
                                            <div class="play-pause-button" id="play-pause-btn">
                                                <i class="fas fa-play"></i>
                                                <div class="button-ripple"></div>
                                            </div>
                                            <div class="play-instructions">
                                                <span class="instruction-text">Click to play video introduction</span>
                                            </div>
                                        </div>
                                        
                                        <!-- Video Progress Indicator -->
                                        <div class="video-progress-overlay">
                                            <div class="progress-ring">
                                                <svg class="progress-svg">
                                                    <circle class="progress-circle" cx="30" cy="30" r="25"></circle>
                                                    <circle class="progress-fill" cx="30" cy="30" r="25" id="progress-fill"></circle>
                                                </svg>
                                                <div class="progress-percentage" id="progress-percentage">0%</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Video Completion Animation -->
                                    <div class="video-completion-animation" id="completion-animation">
                                        <div class="completion-checkmark">
                                            <i class="fas fa-check-circle"></i>
                                        </div>
                                        <div class="completion-text">
                                            <h3>Video Complete!</h3>
                                            <p>You've watched the full introduction</p>
                                        </div>
                                        <div class="completion-effects">
                                            <div class="sparkle sparkle-1">✨</div>
                                            <div class="sparkle sparkle-2">⭐</div>
                                            <div class="sparkle sparkle-3">💫</div>
                                            <div class="sparkle sparkle-4">✨</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Video Controls Bar -->
                                <div class="video-controls-bar">
                                    <button class="control-btn play-pause-ctrl" onclick="videoDetailsDashboard.togglePlayback()" id="play-pause-ctrl">
                                        <i class="fas fa-play"></i>
                                    </button>
                                    
                                    <div class="video-timeline" onclick="videoDetailsDashboard.seekVideo(event)">
                                        <div class="timeline-track">
                                            <div class="timeline-progress" id="timeline-progress"></div>
                                            <div class="timeline-thumb" id="timeline-thumb"></div>
                                        </div>
                                    </div>
                                    
                                    <div class="video-time-display">
                                        <span id="current-time">0:00</span>
                                        <span class="time-separator">/</span>
                                        <span id="total-time">0:30</span>
                                    </div>
                                    
                                    <div class="volume-controls">
                                        <button class="control-btn volume-btn" onclick="videoDetailsDashboard.toggleMute()" id="volume-btn">
                                            <i class="fas fa-volume-up"></i>
                                        </button>
                                        <div class="volume-slider">
                                            <input type="range" min="0" max="100" value="80" id="volume-slider">
                                        </div>
                                    </div>
                                    
                                    <div class="playback-controls">
                                        <button class="control-btn speed-btn" onclick="videoDetailsDashboard.changePlaybackSpeed()">
                                            <span id="speed-display">1x</span>
                                        </button>
                                        <button class="control-btn quality-btn" onclick="videoDetailsDashboard.changeQuality()">
                                            <span id="quality-display">HD</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Video Statistics Panel -->
                            <div class="video-statistics-panel">
                                <div class="statistics-header">
                                    <h4><i class="fas fa-chart-line"></i> Video Analytics</h4>
                                    <button class="stats-toggle" onclick="videoDetailsDashboard.toggleStats()">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                
                                <div class="statistics-grid" id="statistics-grid">
                                    <div class="stat-item views">
                                        <div class="stat-icon"><i class="fas fa-eye"></i></div>
                                        <div class="stat-data">
                                            <span class="stat-number" id="video-views">1,234</span>
                                            <span class="stat-label">Total Views</span>
                                        </div>
                                        <div class="stat-trend positive">
                                            <i class="fas fa-arrow-up"></i>
                                            <span>+12%</span>
                                        </div>
                                    </div>
                                    
                                    <div class="stat-item likes">
                                        <div class="stat-icon"><i class="fas fa-heart"></i></div>
                                        <div class="stat-data">
                                            <span class="stat-number" id="video-likes">89</span>
                                            <span class="stat-label">Likes</span>
                                        </div>
                                        <div class="stat-trend positive">
                                            <i class="fas fa-arrow-up"></i>
                                            <span>+5</span>
                                        </div>
                                    </div>
                                    
                                    <div class="stat-item comments">
                                        <div class="stat-icon"><i class="fas fa-comment-dots"></i></div>
                                        <div class="stat-data">
                                            <span class="stat-number" id="video-comments">23</span>
                                            <span class="stat-label">Comments</span>
                                        </div>
                                        <div class="stat-trend neutral">
                                            <i class="fas fa-minus"></i>
                                            <span>0</span>
                                        </div>
                                    </div>
                                    
                                    <div class="stat-item shares">
                                        <div class="stat-icon"><i class="fas fa-share-alt"></i></div>
                                        <div class="stat-data">
                                            <span class="stat-number" id="video-shares">7</span>
                                            <span class="stat-label">Shares</span>
                                        </div>
                                        <div class="stat-trend positive">
                                            <i class="fas fa-arrow-up"></i>
                                            <span>+2</span>
                                        </div>
                                    </div>
                                    
                                    <div class="stat-item engagement">
                                        <div class="stat-icon"><i class="fas fa-fire"></i></div>
                                        <div class="stat-data">
                                            <span class="stat-number">94%</span>
                                            <span class="stat-label">Engagement</span>
                                        </div>
                                        <div class="stat-trend positive">
                                            <i class="fas fa-arrow-up"></i>
                                            <span>Hot</span>
                                        </div>
                                    </div>
                                    
                                    <div class="stat-item duration">
                                        <div class="stat-icon"><i class="fas fa-clock"></i></div>
                                        <div class="stat-data">
                                            <span class="stat-number">85%</span>
                                            <span class="stat-label">Watch Time</span>
                                        </div>
                                        <div class="stat-trend positive">
                                            <i class="fas fa-arrow-up"></i>
                                            <span>Great</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Right Column: Profile Information & Interactions -->
                        <div class="profile-interaction-section">
                            <!-- Profile Header -->
                            <div class="profile-header-card">
                                <div class="profile-avatar-section">
                                    <div class="profile-avatar" id="profile-avatar">
                                        <div class="avatar-ring"></div>
                                        <div class="avatar-image">
                                            <i class="fas fa-user"></i>
                                        </div>
                                        <div class="online-indicator" id="online-indicator">
                                            <div class="online-pulse"></div>
                                        </div>
                                    </div>
                                    
                                    <div class="verification-badges">
                                        <div class="verified-badge" id="verified-badge" style="display: none;">
                                            <i class="fas fa-check-circle"></i>
                                            <span>Verified</span>
                                        </div>
                                        <div class="premium-badge" id="premium-badge" style="display: none;">
                                            <i class="fas fa-crown"></i>
                                            <span>Premium</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="profile-basic-info">
                                    <div class="name-age-section">
                                        <h2 class="profile-name" id="profile-name">Profile Name</h2>
                                        <span class="profile-age" id="profile-age">25</span>
                                        <div class="compatibility-score">
                                            <div class="compatibility-ring">
                                                <svg class="compatibility-svg">
                                                    <circle class="compatibility-bg" cx="20" cy="20" r="18"></circle>
                                                    <circle class="compatibility-progress" cx="20" cy="20" r="18" id="compatibility-circle"></circle>
                                                </svg>
                                                <span class="compatibility-percentage" id="compatibility-percentage">92%</span>
                                            </div>
                                            <span class="compatibility-label">Match</span>
                                        </div>
                                    </div>
                                    
                                    <div class="location-distance">
                                        <div class="location-info">
                                            <i class="fas fa-map-marker-alt"></i>
                                            <span id="profile-location">Location</span>
                                        </div>
                                        <div class="distance-info">
                                            <span id="profile-distance">2.5 mi</span>
                                            <span class="distance-label">away</span>
                                        </div>
                                    </div>
                                    
                                    <div class="last-seen-info">
                                        <div class="activity-indicator">
                                            <div class="activity-dot active"></div>
                                            <span id="last-seen">Online now</span>
                                        </div>
                                        <div class="response-time">
                                            <i class="fas fa-reply"></i>
                                            <span id="response-time">Replies within 1 hour</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Primary Action Buttons -->
                            <div class="primary-actions-panel">
                                <button class="primary-action-btn like-btn" onclick="videoDetailsDashboard.likeProfile()" id="like-btn">
                                    <div class="btn-icon">
                                        <i class="fas fa-heart"></i>
                                        <div class="like-animation" id="like-animation"></div>
                                    </div>
                                    <div class="btn-content">
                                        <span class="btn-title">Like Video</span>
                                        <span class="btn-subtitle">Show interest</span>
                                    </div>
                                </button>
                                
                                <button class="primary-action-btn super-like-btn" onclick="videoDetailsDashboard.superLike()" id="super-like-btn">
                                    <div class="btn-icon">
                                        <i class="fas fa-star"></i>
                                        <div class="super-like-animation" id="super-like-animation"></div>
                                    </div>
                                    <div class="btn-content">
                                        <span class="btn-title">Super Like</span>
                                        <span class="btn-subtitle">Stand out!</span>
                                    </div>
                                </button>
                                
                                <button class="primary-action-btn message-btn" onclick="videoDetailsDashboard.sendMessage()" id="message-btn">
                                    <div class="btn-icon">
                                        <i class="fas fa-paper-plane"></i>
                                        <div class="message-animation" id="message-animation"></div>
                                    </div>
                                    <div class="btn-content">
                                        <span class="btn-title">Send Message</span>
                                        <span class="btn-subtitle">Start conversation</span>
                                    </div>
                                </button>
                            </div>
                            
                            <!-- Secondary Actions -->
                            <div class="secondary-actions-panel">
                                <button class="secondary-action bookmark" onclick="videoDetailsDashboard.bookmarkProfile()" id="bookmark-btn">
                                    <i class="fas fa-bookmark"></i>
                                    <span>Save for Later</span>
                                </button>
                                
                                <button class="secondary-action view-profile" onclick="videoDetailsDashboard.viewFullProfile()">
                                    <i class="fas fa-user-circle"></i>
                                    <span>View Full Profile</span>
                                </button>
                                
                                <button class="secondary-action gift" onclick="videoDetailsDashboard.sendGift()">
                                    <i class="fas fa-gift"></i>
                                    <span>Send Gift</span>
                                </button>
                            </div>
                            
                            <!-- Profile Bio Section -->
                            <div class="profile-bio-section">
                                <div class="bio-header">
                                    <h4><i class="fas fa-quote-left"></i> About</h4>
                                    <button class="expand-bio" onclick="videoDetailsDashboard.expandBio()">
                                        <i class="fas fa-expand-alt"></i>
                                    </button>
                                </div>
                                
                                <div class="bio-content">
                                    <p id="profile-bio">This is where the profile bio will be displayed with details about the person...</p>
                                </div>
                                
                                <div class="bio-highlights">
                                    <div class="highlight-item">
                                        <i class="fas fa-graduation-cap"></i>
                                        <span id="education">University Graduate</span>
                                    </div>
                                    <div class="highlight-item">
                                        <i class="fas fa-briefcase"></i>
                                        <span id="occupation">Professional</span>
                                    </div>
                                    <div class="highlight-item">
                                        <i class="fas fa-heart"></i>
                                        <span id="relationship-goal">Long-term relationship</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Interests & Hobbies -->
                            <div class="interests-section">
                                <div class="interests-header">
                                    <h4><i class="fas fa-hashtag"></i> Interests & Hobbies</h4>
                                    <span class="interests-count" id="interests-count">6 interests</span>
                                </div>
                                
                                <div class="interests-cloud" id="interests-cloud">
                                    <!-- Interest tags will be populated here -->
                                </div>
                                
                                <div class="mutual-interests" id="mutual-interests">
                                    <div class="mutual-header">
                                        <i class="fas fa-handshake"></i>
                                        <span>Common Interests</span>
                                    </div>
                                    <div class="mutual-tags" id="mutual-tags">
                                        <!-- Mutual interest tags will be populated here -->
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Photos Preview -->
                            <div class="photos-preview-section">
                                <div class="photos-header">
                                    <h4><i class="fas fa-images"></i> More Photos</h4>
                                    <span class="photos-count" id="photos-count">8 photos</span>
                                </div>
                                
                                <div class="photos-grid" id="photos-grid">
                                    <!-- Photo thumbnails will be populated here -->
                                </div>
                                
                                <button class="view-all-photos" onclick="videoDetailsDashboard.viewAllPhotos()">
                                    <i class="fas fa-th"></i>
                                    <span>View All Photos</span>
                                </button>
                            </div>
                            
                            <!-- Connection Insights -->
                            <div class="connection-insights-section">
                                <div class="insights-header">
                                    <h4><i class="fas fa-lightbulb"></i> Connection Insights</h4>
                                </div>
                                
                                <div class="insights-list">
                                    <div class="insight-item compatibility">
                                        <div class="insight-icon"><i class="fas fa-heart"></i></div>
                                        <div class="insight-content">
                                            <span class="insight-title">High Compatibility</span>
                                            <span class="insight-detail">You both love photography and travel</span>
                                        </div>
                                    </div>
                                    
                                    <div class="insight-item activity">
                                        <div class="insight-icon"><i class="fas fa-clock"></i></div>
                                        <div class="insight-content">
                                            <span class="insight-title">Active User</span>
                                            <span class="insight-detail">Usually replies within an hour</span>
                                        </div>
                                    </div>
                                    
                                    <div class="insight-item social">
                                        <div class="insight-icon"><i class="fas fa-users"></i></div>
                                        <div class="insight-content">
                                            <span class="insight-title">Popular Profile</span>
                                            <span class="insight-detail">Gets lots of positive interactions</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Match Celebration Modal -->
                <div class="match-celebration-overlay" id="match-celebration" style="display: none;">
                    <div class="celebration-content">
                        <div class="celebration-hearts">
                            <div class="heart heart-1">💕</div>
                            <div class="heart heart-2">💖</div>
                            <div class="heart heart-3">💓</div>
                            <div class="heart heart-4">💗</div>
                            <div class="heart heart-5">💝</div>
                        </div>
                        
                        <div class="celebration-text">
                            <h2>🎉 It's a Match!</h2>
                            <p>You and <span id="match-name">Profile Name</span> liked each other!</p>
                        </div>
                        
                        <div class="celebration-profiles">
                            <div class="celebration-profile user">
                                <div class="celebration-avatar">
                                    <i class="fas fa-user"></i>
                                </div>
                                <span>You</span>
                            </div>
                            
                            <div class="match-connection">
                                <div class="connection-line"></div>
                                <div class="connection-heart">💖</div>
                            </div>
                            
                            <div class="celebration-profile match">
                                <div class="celebration-avatar" id="celebration-match-avatar">
                                    <i class="fas fa-user"></i>
                                </div>
                                <span id="celebration-match-name">Profile Name</span>
                            </div>
                        </div>
                        
                        <div class="celebration-actions">
                            <button class="celebration-btn send-message" onclick="videoDetailsDashboard.sendMatchMessage()">
                                <i class="fas fa-paper-plane"></i>
                                Send Message
                            </button>
                            <button class="celebration-btn keep-exploring" onclick="videoDetailsDashboard.hideCelebration()">
                                Keep Exploring
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove any existing dashboard
        const existingDashboard = document.getElementById('video-details-dashboard');
        if (existingDashboard) {
            existingDashboard.remove();
        }

        document.body.insertAdjacentHTML('beforeend', dashboardHTML);
        this.injectStyles();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.isDashboardOpen()) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeDashboard();
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePlayback();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.seekBackward();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.seekForward();
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'm':
                case 'M':
                    e.preventDefault();
                    this.toggleMute();
                    break;
            }
        });

        // Volume slider
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value);
            });
        }

        // Timeline interaction
        const timeline = document.querySelector('.video-timeline');
        if (timeline) {
            timeline.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                this.seekVideo(e);
            });

            document.addEventListener('mousemove', (e) => {
                if (this.isDragging) {
                    this.seekVideo(e);
                }
            });

            document.addEventListener('mouseup', () => {
                this.isDragging = false;
            });
        }
    }

    /**
     * Open the video details dashboard with profile data
     */
    openWithProfile(profile) {
        console.log('Opening Video Details Dashboard for:', profile.name);
        
        this.currentProfile = profile;
        this.resetInteractions();
        
        const dashboard = document.getElementById('video-details-dashboard');
        if (!dashboard) {
            console.error('Video Details Dashboard not found in DOM');
            return;
        }

        // Populate profile data
        this.populateProfileData(profile);
        
        // Show dashboard
        dashboard.classList.add('show');
        document.body.classList.add('video-details-open');
        
        // Initialize video
        this.initializeVideo(profile);
        
        this.app.showToast(`Opening ${profile.name}'s video profile`, 'info');
    }

    /**
     * Populate the dashboard with profile data
     */
    populateProfileData(profile) {
        // Basic profile info
        document.getElementById('profile-name').textContent = profile.name;
        document.getElementById('profile-age').textContent = profile.age;
        document.getElementById('profile-location').textContent = profile.location;
        document.getElementById('profile-distance').textContent = `${profile.distance} mi`;
        document.getElementById('profile-bio').textContent = profile.bio;
        
        // Compatibility score
        const compatibilityPercentage = document.getElementById('compatibility-percentage');
        const compatibilityCircle = document.getElementById('compatibility-circle');
        if (compatibilityPercentage && compatibilityCircle) {
            compatibilityPercentage.textContent = `${profile.matchPercentage}%`;
            const circumference = 2 * Math.PI * 18;
            const progress = (profile.matchPercentage / 100) * circumference;
            compatibilityCircle.style.strokeDasharray = circumference;
            compatibilityCircle.style.strokeDashoffset = circumference - progress;
        }

        // Online status
        const onlineIndicator = document.getElementById('online-indicator');
        const lastSeen = document.getElementById('last-seen');
        if (profile.online) {
            onlineIndicator.style.display = 'block';
            lastSeen.textContent = 'Online now';
            lastSeen.classList.add('online');
        } else {
            onlineIndicator.style.display = 'none';
            lastSeen.textContent = profile.lastSeen || 'Active recently';
            lastSeen.classList.remove('online');
        }

        // Verification badges
        if (profile.verified) {
            document.getElementById('verified-badge').style.display = 'flex';
        }

        // Video background
        const videoBackground = document.getElementById('video-background');
        if (videoBackground) {
            videoBackground.style.background = profile.gradient;
        }

        // Avatar
        const profileAvatar = document.getElementById('profile-avatar');
        if (profileAvatar) {
            profileAvatar.querySelector('.avatar-image').style.background = profile.gradient;
        }

        // Interests
        this.populateInterests(profile.interests);
        
        // Photos
        this.populatePhotos(profile.photos || 6);
        
        // Video statistics
        this.populateVideoStats(profile);
    }

    /**
     * Populate interests section
     */
    populateInterests(interests) {
        const interestsCloud = document.getElementById('interests-cloud');
        const interestsCount = document.getElementById('interests-count');
        const mutualTags = document.getElementById('mutual-tags');
        
        if (!interestsCloud || !interests) return;

        interestsCount.textContent = `${interests.length} interests`;
        
        interestsCloud.innerHTML = interests.map(interest => `
            <div class="interest-tag-detailed" onclick="videoDetailsDashboard.filterByInterest('${interest}')">
                <span class="interest-emoji">${this.getInterestEmoji(interest)}</span>
                <span class="interest-name">${interest}</span>
            </div>
        `).join('');
        
        // Simulate mutual interests (3 random interests from the list)
        const mutualInterests = interests.filter(() => Math.random() > 0.5).slice(0, 3);
        if (mutualInterests.length > 0 && mutualTags) {
            mutualTags.innerHTML = mutualInterests.map(interest => `
                <div class="mutual-interest-tag">
                    <span class="mutual-emoji">${this.getInterestEmoji(interest)}</span>
                    <span class="mutual-name">${interest}</span>
                </div>
            `).join('');
        }
    }

    /**
     * Populate photos section
     */
    populatePhotos(photoCount) {
        const photosGrid = document.getElementById('photos-grid');
        const photosCountElement = document.getElementById('photos-count');
        
        if (!photosGrid) return;

        photosCountElement.textContent = `${photoCount} photos`;
        
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        ];
        
        photosGrid.innerHTML = Array.from({length: Math.min(photoCount, 6)}, (_, i) => `
            <div class="photo-thumbnail" style="background: ${gradients[i % gradients.length]};" onclick="videoDetailsDashboard.viewPhoto(${i})">
                <div class="photo-overlay">
                    <i class="fas fa-expand"></i>
                </div>
                <div class="photo-number">${i + 1}</div>
            </div>
        `).join('');
    }

    /**
     * Populate video statistics
     */
    populateVideoStats(profile) {
        document.getElementById('video-views').textContent = this.formatNumber(profile.videoViews || 1234);
        document.getElementById('video-likes').textContent = profile.videoLikes || 89;
        document.getElementById('video-comments').textContent = profile.videoComments || 23;
        document.getElementById('video-shares').textContent = profile.videoShares || 7;
    }

    /**
     * Initialize video playback
     */
    initializeVideo(profile) {
        this.duration = this.getVideoDuration(profile.videoDuration);
        this.currentTime = 0;
        this.isPlaying = false;
        
        // Update time display
        document.getElementById('total-time').textContent = this.formatTime(this.duration);
        document.getElementById('current-time').textContent = '0:00';
        
        // Reset progress indicators
        this.updateProgress(0);
        
        // Mark as viewed after a short delay
        setTimeout(() => {
            this.userInteractions.viewed = true;
            this.incrementVideoViews();
        }, 2000);
    }

    /**
     * Toggle video playback
     */
    togglePlayback() {
        if (this.isPlaying) {
            this.pauseVideo();
        } else {
            this.playVideo();
        }
    }

    /**
     * Play video
     */
    playVideo() {
        if (this.currentTime >= this.duration) {
            this.currentTime = 0;
        }
        
        this.isPlaying = true;
        this.updatePlayButton();
        this.updateStatusIndicator('playing');
        
        // Start progress interval
        this.playInterval = setInterval(() => {
            this.currentTime += 0.1;
            const progress = (this.currentTime / this.duration) * 100;
            
            this.updateProgress(progress);
            this.updateTimeDisplay();
            
            if (this.currentTime >= this.duration) {
                this.completeVideo();
            }
        }, 100);
        
        this.app.showToast(`Playing ${this.currentProfile.name}'s video introduction`, 'info');
    }

    /**
     * Pause video
     */
    pauseVideo() {
        this.isPlaying = false;
        this.updatePlayButton();
        this.updateStatusIndicator('paused');
        
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
    }

    /**
     * Complete video playback
     */
    completeVideo() {
        this.pauseVideo();
        this.updateStatusIndicator('completed');
        
        // Show completion animation
        const completionAnimation = document.getElementById('completion-animation');
        if (completionAnimation) {
            completionAnimation.classList.add('show');
            
            setTimeout(() => {
                completionAnimation.classList.remove('show');
            }, 3000);
        }
        
        this.app.showToast('Video completed! 🎉', 'success');
    }

    /**
     * Update play button states
     */
    updatePlayButton() {
        const playPauseBtn = document.getElementById('play-pause-btn');
        const playPauseCtrl = document.getElementById('play-pause-ctrl');
        
        if (playPauseBtn) {
            const icon = playPauseBtn.querySelector('i');
            icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
        
        if (playPauseCtrl) {
            const icon = playPauseCtrl.querySelector('i');
            icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
    }

    /**
     * Update status indicator
     */
    updateStatusIndicator(status) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        
        if (statusDot && statusText) {
            statusDot.className = `status-dot ${status}`;
            
            switch(status) {
                case 'playing':
                    statusText.textContent = 'Now Playing';
                    break;
                case 'paused':
                    statusText.textContent = 'Paused';
                    break;
                case 'completed':
                    statusText.textContent = 'Completed';
                    break;
                default:
                    statusText.textContent = 'Ready to Play';
            }
        }
    }

    /**
     * Update progress indicators
     */
    updateProgress(percentage) {
        // Circular progress
        const progressFill = document.getElementById('progress-fill');
        const progressPercentage = document.getElementById('progress-percentage');
        
        if (progressFill && progressPercentage) {
            const circumference = 2 * Math.PI * 25;
            const progress = (percentage / 100) * circumference;
            
            progressFill.style.strokeDasharray = circumference;
            progressFill.style.strokeDashoffset = circumference - progress;
            progressPercentage.textContent = Math.round(percentage) + '%';
        }
        
        // Timeline progress
        const timelineProgress = document.getElementById('timeline-progress');
        const timelineThumb = document.getElementById('timeline-thumb');
        
        if (timelineProgress && timelineThumb) {
            timelineProgress.style.width = percentage + '%';
            timelineThumb.style.left = percentage + '%';
        }
    }

    /**
     * Update time display
     */
    updateTimeDisplay() {
        const currentTimeElement = document.getElementById('current-time');
        if (currentTimeElement) {
            currentTimeElement.textContent = this.formatTime(this.currentTime);
        }
    }

    /**
     * Seek to specific time in video
     */
    seekVideo(event) {
        const timeline = document.querySelector('.video-timeline');
        if (!timeline) return;
        
        const rect = timeline.getBoundingClientRect();
        const percentage = ((event.clientX - rect.left) / rect.width) * 100;
        const newTime = (percentage / 100) * this.duration;
        
        this.currentTime = Math.max(0, Math.min(newTime, this.duration));
        this.updateProgress((this.currentTime / this.duration) * 100);
        this.updateTimeDisplay();
    }

    /**
     * Seek backward 10 seconds
     */
    seekBackward() {
        this.currentTime = Math.max(0, this.currentTime - 10);
        this.updateProgress((this.currentTime / this.duration) * 100);
        this.updateTimeDisplay();
    }

    /**
     * Seek forward 10 seconds
     */
    seekForward() {
        this.currentTime = Math.min(this.duration, this.currentTime + 10);
        this.updateProgress((this.currentTime / this.duration) * 100);
        this.updateTimeDisplay();
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        const volumeBtn = document.getElementById('volume-btn');
        const volumeSlider = document.getElementById('volume-slider');
        
        if (!volumeBtn || !volumeSlider) return;
        
        const icon = volumeBtn.querySelector('i');
        const currentVolume = volumeSlider.value;
        
        if (currentVolume > 0) {
            volumeSlider.value = 0;
            icon.className = 'fas fa-volume-mute';
            this.app.showToast('Video muted', 'info');
        } else {
            volumeSlider.value = 80;
            icon.className = 'fas fa-volume-up';
            this.app.showToast('Video unmuted', 'info');
        }
    }

    /**
     * Set volume
     */
    setVolume(volume) {
        const volumeBtn = document.getElementById('volume-btn');
        if (!volumeBtn) return;
        
        const icon = volumeBtn.querySelector('i');
        
        if (volume == 0) {
            icon.className = 'fas fa-volume-mute';
        } else if (volume < 50) {
            icon.className = 'fas fa-volume-down';
        } else {
            icon.className = 'fas fa-volume-up';
        }
    }

    /**
     * Change playback speed
     */
    changePlaybackSpeed() {
        const speedDisplay = document.getElementById('speed-display');
        if (!speedDisplay) return;
        
        const speeds = ['0.5x', '0.75x', '1x', '1.25x', '1.5x', '2x'];
        let currentIndex = speeds.indexOf(speedDisplay.textContent);
        
        currentIndex = (currentIndex + 1) % speeds.length;
        speedDisplay.textContent = speeds[currentIndex];
        
        this.app.showToast(`Playback speed: ${speeds[currentIndex]}`, 'info');
    }

    /**
     * Change video quality
     */
    changeQuality() {
        const qualityDisplay = document.getElementById('quality-display');
        if (!qualityDisplay) return;
        
        const qualities = ['HD', '4K', 'Auto'];
        let currentIndex = qualities.indexOf(qualityDisplay.textContent);
        
        currentIndex = (currentIndex + 1) % qualities.length;
        qualityDisplay.textContent = qualities[currentIndex];
        
        this.app.showToast(`Video quality: ${qualities[currentIndex]}`, 'info');
    }

    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        const dashboard = document.getElementById('video-details-dashboard');
        if (!dashboard) return;
        
        if (dashboard.classList.contains('fullscreen')) {
            dashboard.classList.remove('fullscreen');
            this.app.showToast('Exited fullscreen', 'info');
        } else {
            dashboard.classList.add('fullscreen');
            this.app.showToast('Entered fullscreen', 'info');
        }
    }

    /**
     * Toggle stats visibility
     */
    toggleStats() {
        const statsGrid = document.getElementById('statistics-grid');
        const statsToggle = document.querySelector('.stats-toggle i');
        
        if (!statsGrid || !statsToggle) return;
        
        if (statsGrid.style.display === 'none') {
            statsGrid.style.display = 'grid';
            statsToggle.className = 'fas fa-eye-slash';
        } else {
            statsGrid.style.display = 'none';
            statsToggle.className = 'fas fa-eye';
        }
    }

    // Profile Interaction Methods

    /**
     * Like profile
     */
    likeProfile() {
        if (this.userInteractions.liked) {
            this.app.showToast('Already liked this profile!', 'warning');
            return;
        }
        
        this.userInteractions.liked = true;
        this.updateLikeButton();
        this.animateLike();
        this.incrementLikes();
        
        // Check for match (60% chance)
        const isMatch = Math.random() > 0.4;
        
        if (isMatch) {
            setTimeout(() => {
                this.showMatchCelebration();
            }, 1500);
        } else {
            this.app.showToast(`💕 You liked ${this.currentProfile.name}!`, 'success');
        }
    }

    /**
     * Super like profile
     */
    superLike() {
        if (this.userInteractions.superLiked) {
            this.app.showToast('Already super liked this profile!', 'warning');
            return;
        }
        
        this.userInteractions.superLiked = true;
        this.updateSuperLikeButton();
        this.animateSuperLike();
        
        // Super likes have 80% match chance
        const isMatch = Math.random() > 0.2;
        
        if (isMatch) {
            setTimeout(() => {
                this.showMatchCelebration();
            }, 1500);
        } else {
            this.app.showToast(`⭐ Super Liked ${this.currentProfile.name}! They'll know you're really interested!`, 'success');
        }
    }

    /**
     * Send message
     */
    sendMessage() {
        this.app.showToast(`Opening chat with ${this.currentProfile.name}...`, 'info');
        // Here you would typically open a messaging interface
    }

    /**
     * Bookmark profile
     */
    bookmarkProfile() {
        this.userInteractions.bookmarked = !this.userInteractions.bookmarked;
        this.updateBookmarkButton();
        
        const message = this.userInteractions.bookmarked 
            ? `Saved ${this.currentProfile.name} for later!` 
            : `Removed ${this.currentProfile.name} from saved`;
            
        this.app.showToast(message, 'success');
    }

    /**
     * View full profile
     */
    viewFullProfile() {
        this.app.showToast(`Opening ${this.currentProfile.name}'s full profile...`, 'info');
        // Here you would typically open the full profile view
    }

    /**
     * Send gift
     */
    sendGift() {
        this.app.showToast('Gift feature coming soon! 🎁', 'info');
    }

    /**
     * Share video
     */
    shareVideo() {
        this.userInteractions.shared = true;
        this.incrementShares();
        this.app.showToast('Share options opened!', 'info');
    }

    /**
     * Report video
     */
    reportVideo() {
        this.app.showToast('Report submitted. Thank you for helping keep ConnectHub safe.', 'warning');
    }

    /**
     * Expand bio
     */
    expandBio() {
        const bioContent = document.querySelector('.bio-content');
        if (!bioContent) return;
        
        bioContent.classList.toggle('expanded');
        const expandBtn = document.querySelector('.expand-bio i');
        
        if (expandBtn) {
            expandBtn.className = bioContent.classList.contains('expanded') 
                ? 'fas fa-compress-alt' 
                : 'fas fa-expand-alt';
        }
    }

    /**
     * View photo
     */
    viewPhoto(index) {
        this.app.showToast(`Opening photo ${index + 1}...`, 'info');
    }

    /**
     * View all photos
     */
    viewAllPhotos() {
        this.app.showToast(`Opening photo gallery for ${this.currentProfile.name}...`, 'info');
    }

    /**
     * Filter by interest
     */
    filterByInterest(interest) {
        this.app.showToast(`Finding people who love ${interest}...`, 'info');
    }

    // Animation Methods

    /**
     * Animate like action
     */
    animateLike() {
        const likeAnimation = document.getElementById('like-animation');
        if (!likeAnimation) return;
        
        likeAnimation.innerHTML = '💕';
        likeAnimation.classList.add('animate');
        
        setTimeout(() => {
            likeAnimation.classList.remove('animate');
            likeAnimation.innerHTML = '';
        }, 2000);
    }

    /**
     * Animate super like action
     */
    animateSuperLike() {
        const superLikeAnimation = document.getElementById('super-like-animation');
        if (!superLikeAnimation) return;
        
        superLikeAnimation.innerHTML = '⭐';
        superLikeAnimation.classList.add('animate');
        
        setTimeout(() => {
            superLikeAnimation.classList.remove('animate');
            superLikeAnimation.innerHTML = '';
        }, 3000);
    }

    /**
     * Show match celebration
     */
    showMatchCelebration() {
        const celebration = document.getElementById('match-celebration');
        if (!celebration) return;
        
        // Update match info
        document.getElementById('match-name').textContent = this.currentProfile.name;
        document.getElementById('celebration-match-name').textContent = this.currentProfile.name;
        
        // Show celebration
        celebration.style.display = 'flex';
        celebration.classList.add('show');
        
        this.app.showToast('🎉 It\'s a Match!', 'success');
    }

    /**
     * Hide celebration
     */
    hideCelebration() {
        const celebration = document.getElementById('match-celebration');
        if (!celebration) return;
        
        celebration.classList.remove('show');
        setTimeout(() => {
            celebration.style.display = 'none';
        }, 300);
    }

    /**
     * Send match message
     */
    sendMatchMessage() {
        this.hideCelebration();
        this.sendMessage();
    }

    // Update Methods

    /**
     * Update like button state
     */
    updateLikeButton() {
        const likeBtn = document.getElementById('like-btn');
        if (!likeBtn) return;
        
        if (this.userInteractions.liked) {
            likeBtn.classList.add('liked');
            likeBtn.querySelector('.btn-title').textContent = 'Liked';
            likeBtn.querySelector('.btn-subtitle').textContent = 'Interest shown';
        }
    }

    /**
     * Update super like button state
     */
    updateSuperLikeButton() {
        const superLikeBtn = document.getElementById('super-like-btn');
        if (!superLikeBtn) return;
        
        if (this.userInteractions.superLiked) {
            superLikeBtn.classList.add('super-liked');
            superLikeBtn.querySelector('.btn-title').textContent = 'Super Liked';
            superLikeBtn.querySelector('.btn-subtitle').textContent = 'Really interested!';
        }
    }

    /**
     * Update bookmark button state
     */
    updateBookmarkButton() {
        const bookmarkBtn = document.getElementById('bookmark-btn');
        if (!bookmarkBtn) return;
        
        const icon = bookmarkBtn.querySelector('i');
        const text = bookmarkBtn.querySelector('span');
        
        if (this.userInteractions.bookmarked) {
            icon.className = 'fas fa-bookmark';
            text.textContent = 'Saved';
            bookmarkBtn.classList.add('bookmarked');
        } else {
            icon.className = 'far fa-bookmark';
            text.textContent = 'Save for Later';
            bookmarkBtn.classList.remove('bookmarked');
        }
    }

    // Utility Methods

    /**
     * Increment video views
     */
    incrementVideoViews() {
        const viewsElement = document.getElementById('video-views');
        if (!viewsElement) return;
        
        let currentViews = parseInt(viewsElement.textContent.replace(/[^\d]/g, ''));
        currentViews += 1;
        viewsElement.textContent = this.formatNumber(currentViews);
    }

    /**
     * Increment likes
     */
    incrementLikes() {
        const likesElement = document.getElementById('video-likes');
        if (!likesElement) return;
        
        let currentLikes = parseInt(likesElement.textContent);
        currentLikes += 1;
        likesElement.textContent = currentLikes;
    }

    /**
     * Increment shares
     */
    incrementShares() {
        const sharesElement = document.getElementById('video-shares');
        if (!sharesElement) return;
        
        let currentShares = parseInt(sharesElement.textContent);
        currentShares += 1;
        sharesElement.textContent = currentShares;
    }

    /**
     * Get video duration in seconds
     */
    getVideoDuration(durationString) {
        if (!durationString) return 30;
        
        const parts = durationString.split(':');
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseInt(parts[1]) || 0;
        
        return minutes * 60 + seconds;
    }

    /**
     * Format time in MM:SS format
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Format numbers for display
     */
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    /**
     * Get interest emoji
     */
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

    /**
     * Reset user interactions
     */
    resetInteractions() {
        this.userInteractions = {
            liked: false,
            superLiked: false,
            bookmarked: false,
            viewed: false,
            shared: false
        };
    }

    /**
     * Check if dashboard is open
     */
    isDashboardOpen() {
        const dashboard = document.getElementById('video-details-dashboard');
        return dashboard && dashboard.classList.contains('show');
    }

    /**
     * Close the dashboard
     */
    closeDashboard() {
        const dashboard = document.getElementById('video-details-dashboard');
        if (!dashboard) return;
        
        // Pause video if playing
        if (this.isPlaying) {
            this.pauseVideo();
        }
        
        // Hide dashboard
        dashboard.classList.remove('show');
        document.body.classList.remove('video-details-open');
        
        this.app.showToast('Video dashboard closed', 'info');
    }

    /**
     * Inject comprehensive CSS styles
     */
    injectStyles() {
        if (document.getElementById('video-details-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'video-details-styles';
        styles.textContent = `
            /* Video Details Dashboard - Comprehensive Styles */
            .video-details-modal {
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

            .video-details-modal.show {
                opacity: 1;
                visibility: visible;
            }

            .video-modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(20px);
            }

            .video-details-container {
                position: relative;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
                display: flex;
                flex-direction: column;
                transform: scale(0.95);
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .video-details-modal.show .video-details-container {
                transform: scale(1);
            }

            /* Header Styles */
            .video-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px 32px;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                z-index: 100;
            }

            .back-button {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 12px 20px;
                color: white;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .back-button:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-2px);
            }

            .video-status-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: rgba(236, 72, 153, 0.1);
                border: 1px solid rgba(236, 72, 153, 0.3);
                border-radius: 20px;
            }

            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #22c55e;
                animation: pulse 2s ease-in-out infinite;
            }

            .status-dot.playing {
                background: #22c55e;
            }

            .status-dot.paused {
                background: #f59e0b;
            }

            .status-dot.completed {
                background: #8b5cf6;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
            }

            .status-text {
                color: white;
                font-size: 12px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .header-right {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .header-action, .close-dashboard {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                padding: 10px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .header-action:hover, .close-dashboard:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-1px);
            }

            .close-dashboard {
                background: rgba(239, 68, 68, 0.2);
                border-color: rgba(239, 68, 68, 0.3);
            }

            .close-dashboard:hover {
                background: rgba(239, 68, 68, 0.3);
                transform: rotate(90deg);
            }

            /* Main Content Grid */
            .video-content-grid {
                flex: 1;
                display: grid;
                grid-template-columns: 1fr 400px;
                gap: 32px;
                padding: 32px;
                overflow: hidden;
            }

            /* Video Player Section */
            .video-player-section {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .video-player-container {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .video-player {
                position: relative;
                aspect-ratio: 16/9;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                overflow: hidden;
                cursor: pointer;
            }

            .video-background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .video-gradient-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, rgba(0,0,0,0.3) 0%, transparent 100%);
            }

            .video-center-icon {
                position: relative;
                z-index: 2;
                font-size: 64px;
                color: rgba(255, 255, 255, 0.6);
                pointer-events: none;
            }

            .video-overlay-controls {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.2);
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 3;
            }

            .video-player:hover .video-overlay-controls {
                opacity: 1;
            }

            .play-pause-overlay {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
            }

            .play-pause-button {
                position: relative;
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                color: white;
                transition: all 0.3s ease;
                overflow: hidden;
            }

            .play-pause-button:hover {
                transform: scale(1.1);
                box-shadow: 0 8px 25px rgba(236, 72, 153, 0.4);
            }

            .button-ripple {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 1.5s ease-out infinite;
            }

            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }

            .play-instructions {
                text-align: center;
            }

            .instruction-text {
                color: white;
                font-size: 14px;
                font-weight: 500;
                background: rgba(0, 0, 0, 0.7);
                padding: 8px 16px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
            }

            .video-progress-overlay {
                position: absolute;
                top: 20px;
                right: 20px;
                z-index: 4;
            }

            .progress-ring {
                position: relative;
                width: 60px;
                height: 60px;
            }

            .progress-svg {
                width: 100%;
                height: 100%;
                transform: rotate(-90deg);
            }

            .progress-circle {
                fill: none;
                stroke: rgba(255, 255, 255, 0.2);
                stroke-width: 3;
            }

            .progress-fill {
                fill: none;
                stroke: #ec4899;
                stroke-width: 3;
                stroke-linecap: round;
                stroke-dasharray: 157;
                stroke-dashoffset: 157;
                transition: stroke-dashoffset 0.1s ease;
            }

            .progress-percentage {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 12px;
                font-weight: 600;
            }

            /* Video Completion Animation */
            .video-completion-animation {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.4s ease;
                z-index: 10;
            }

            .video-completion-animation.show {
                opacity: 1;
                visibility: visible;
            }

            .completion-checkmark {
                font-size: 64px;
                color: #22c55e;
                margin-bottom: 16px;
                animation: checkmarkBounce 0.6s ease-out;
            }

            @keyframes checkmarkBounce {
                0% { transform: scale(0); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }

            .completion-text {
                text-align: center;
                color: white;
            }

            .completion-text h3 {
                margin: 0 0 8px 0;
                font-size: 24px;
                font-weight: 700;
            }

            .completion-text p {
                margin: 0;
                font-size: 16px;
                color: rgba(255, 255, 255, 0.8);
            }

            .completion-effects {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }

            .sparkle {
                position: absolute;
                font-size: 24px;
                animation: sparkleFloat 3s ease-in-out infinite;
            }

            .sparkle-1 { top: 20%; left: 20%; animation-delay: 0s; }
            .sparkle-2 { top: 30%; right: 20%; animation-delay: 0.5s; }
            .sparkle-3 { bottom: 30%; left: 25%; animation-delay: 1s; }
            .sparkle-4 { bottom: 20%; right: 25%; animation-delay: 1.5s; }

            @keyframes sparkleFloat {
                0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
                50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
            }

            /* Video Controls Bar */
            .video-controls-bar {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 12px 16px;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
            }

            .control-btn {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 8px;
                padding: 8px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
            }

            .control-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-1px);
            }

            .video-timeline {
                flex: 1;
                height: 20px;
                cursor: pointer;
                position: relative;
                display: flex;
                align-items: center;
            }

            .timeline-track {
                position: relative;
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
                overflow: hidden;
            }

            .timeline-progress {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                background: linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%);
                border-radius: 2px;
                transition: width 0.1s ease;
            }

            .timeline-thumb {
                position: absolute;
                top: 50%;
                width: 12px;
                height: 12px;
                background: #ec4899;
                border: 2px solid white;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                opacity: 0;
                transition: all 0.3s ease;
            }

            .video-timeline:hover .timeline-thumb {
                opacity: 1;
            }

            .video-time-display {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 13px;
                color: rgba(255, 255, 255, 0.8);
                font-family: 'Monaco', monospace;
            }

            .time-separator {
                color: rgba(255, 255, 255, 0.5);
            }

            .volume-controls {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .volume-slider input[type="range"] {
                width: 60px;
                height: 4px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
                outline: none;
                -webkit-appearance: none;
                cursor: pointer;
            }

            .volume-slider input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 12px;
                height: 12px;
                background: #ec4899;
                border-radius: 50%;
                cursor: pointer;
            }

            .playback-controls {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .speed-btn, .quality-btn {
                min-width: 32px;
                font-size: 12px;
                font-weight: 600;
            }

            /* Statistics Panel */
            .video-statistics-panel {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 20px;
            }

            .statistics-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 16px;
            }

            .statistics-header h4 {
                margin: 0;
                color: white;
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .stats-toggle {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 8px;
                padding: 6px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .stats-toggle:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .statistics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 16px;
            }

            .stat-item {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                position: relative;
                overflow: hidden;
            }

            .stat-item.views { border-left-color: #3b82f6; }
            .stat-item.likes { border-left-color: #ef4444; }
            .stat-item.comments { border-left-color: #10b981; }
            .stat-item.shares { border-left-color: #f59e0b; }
            .stat-item.engagement { border-left-color: #8b5cf6; }
            .stat-item.duration { border-left-color: #06b6d4; }

            .stat-icon {
                flex-shrink: 0;
                width: 32px;
                height: 32px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                color: white;
            }

            .stat-data {
                flex: 1;
            }

            .stat-number {
                display: block;
                font-size: 18px;
                font-weight: 700;
                color: white;
                line-height: 1;
            }

            .stat-label {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .stat-trend {
                position: absolute;
                top: 8px;
                right: 8px;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                gap: 2px;
            }

            .stat-trend.positive {
                background: rgba(34, 197, 94, 0.2);
                color: #22c55e;
            }

            .stat-trend.negative {
                background: rgba(239, 68, 68, 0.2);
                color: #ef4444;
            }

            .stat-trend.neutral {
                background: rgba(107, 114, 128, 0.2);
                color: #9ca3af;
            }

            /* Profile Interaction Section */
            .profile-interaction-section {
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .profile-header-card {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 20px;
            }

            .profile-avatar-section {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 16px;
            }

            .profile-avatar {
                position: relative;
                width: 64px;
                height: 64px;
            }

            .avatar-ring {
                position: absolute;
                top: -4px;
                left: -4px;
                width: calc(100% + 8px);
                height: calc(100% + 8px);
                border: 2px solid transparent;
                border-radius: 50%;
                background: linear-gradient(135deg, #ec4899, #8b5cf6) border-box;
                -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: exclude;
                mask-composite: exclude;
            }

            .avatar-image {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                color: white;
                overflow: hidden;
            }

            .online-indicator {
                position: absolute;
                bottom: 2px;
                right: 2px;
                width: 16px;
                height: 16px;
                background: #22c55e;
                border: 3px solid rgba(0, 0, 0, 0.8);
                border-radius: 50%;
            }

            .online-pulse {
                position: absolute;
                width: 100%;
                height: 100%;
                background: #22c55e;
                border-radius: 50%;
                animation: onlinePulse 2s ease-in-out infinite;
            }

            @keyframes onlinePulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
            }

            .verification-badges {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .verified-badge, .premium-badge {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 8px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 500;
            }

            .verified-badge {
                background: rgba(34, 197, 94, 0.2);
                color: #22c55e;
            }

            .premium-badge {
                background: rgba(251, 191, 36, 0.2);
                color: #fbbf24;
            }

            .profile-basic-info {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .name-age-section {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .profile-name {
                margin: 0;
                font-size: 20px;
                font-weight: 700;
                color: white;
            }

            .profile-age {
                font-size: 16px;
                color: rgba(255, 255, 255, 0.7);
                margin-left: 8px;
            }

            .compatibility-score {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .compatibility-ring {
                position: relative;
                width: 40px;
                height: 40px;
            }

            .compatibility-svg {
                width: 100%;
                height: 100%;
                transform: rotate(-90deg);
            }

            .compatibility-bg {
                fill: none;
                stroke: rgba(255, 255, 255, 0.2);
                stroke-width: 3;
            }

            .compatibility-progress {
                fill: none;
                stroke: #ec4899;
                stroke-width: 3;
                stroke-linecap: round;
                stroke-dasharray: 113;
                stroke-dashoffset: 113;
                transition: stroke-dashoffset 0.8s ease;
            }

            .compatibility-percentage {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 10px;
                font-weight: 600;
                color: #ec4899;
            }

            .compatibility-label {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .location-distance {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .location-info {
                display: flex;
                align-items: center;
                gap: 6px;
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
            }

            .distance-info {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
            }

            .last-seen-info {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .activity-indicator {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 13px;
            }

            .activity-dot {
                width: 6px;
                height: 6px;
                background: #f59e0b;
                border-radius: 50%;
            }

            .activity-dot.active {
                background: #22c55e;
                animation: pulse 2s ease-in-out infinite;
            }

            .response-time {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
            }

            /* Primary Actions Panel */
            .primary-actions-panel {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .primary-action-btn {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 16px;
                position: relative;
                overflow: hidden;
            }

            .primary-action-btn:hover {
                background: rgba(255, 255, 255, 0.08);
                transform: translateY(-2px);
                border-color: rgba(255, 255, 255, 0.2);
            }

            .primary-action-btn.like-btn:hover {
                background: rgba(239, 68, 68, 0.1);
                border-color: rgba(239, 68, 68, 0.3);
            }

            .primary-action-btn.super-like-btn:hover {
                background: rgba(251, 191, 36, 0.1);
                border-color: rgba(251, 191, 36, 0.3);
            }

            .primary-action-btn.message-btn:hover {
                background: rgba(59, 130, 246, 0.1);
                border-color: rgba(59, 130, 246, 0.3);
            }

            .primary-action-btn.liked {
                background: rgba(239, 68, 68, 0.2);
                border-color: rgba(239, 68, 68, 0.4);
            }

            .primary-action-btn.super-liked {
                background: rgba(251, 191, 36, 0.2);
                border-color: rgba(251, 191, 36, 0.4);
            }

            .btn-icon {
                position: relative;
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                color: white;
            }

            .btn-content {
                display: flex;
                flex-direction: column;
                gap: 2px;
                text-align: left;
            }

            .btn-title {
                font-size: 14px;
                font-weight: 600;
                color: white;
            }

            .btn-subtitle {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
            }

            /* Animation containers */
            .like-animation, .super-like-animation, .message-animation {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 24px;
                pointer-events: none;
                opacity: 0;
                z-index: 2;
            }

            .like-animation.animate, .super-like-animation.animate, .message-animation.animate {
                animation: actionFloat 2s ease-out forwards;
            }

            @keyframes actionFloat {
                0% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.5);
                }
                30% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1.2);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -50%) translateY(-60px) scale(0.8);
                }
            }

            /* Secondary Actions */
            .secondary-actions-panel {
                display: flex;
                gap: 8px;
            }

            .secondary-action {
                flex: 1;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 10px 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.8);
            }

            .secondary-action:hover {
                background: rgba(255, 255, 255, 0.08);
                transform: translateY(-1px);
            }

            .secondary-action.bookmarked {
                background: rgba(251, 191, 36, 0.1);
                border-color: rgba(251, 191, 36, 0.3);
                color: #fbbf24;
            }

            .secondary-action i {
                font-size: 16px;
                margin-bottom: 2px;
            }

            /* Profile Sections */
            .profile-bio-section, .interests-section, .photos-preview-section, .connection-insights-section {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 16px;
            }

            .bio-header, .interests-header, .photos-header, .insights-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
            }

            .bio-header h4, .interests-header h4, .photos-header h4, .insights-header h4 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
                color: white;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .expand-bio {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 6px;
                padding: 4px;
                color: rgba(255, 255, 255, 0.6);
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .expand-bio:hover {
                background: rgba(255, 255, 255, 0.2);
                color: white;
            }

            .bio-content {
                margin-bottom: 12px;
                max-height: 60px;
                overflow: hidden;
                transition: max-height 0.3s ease;
            }

            .bio-content.expanded {
                max-height: 200px;
            }

            .bio-content p {
                margin: 0;
                font-size: 13px;
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.4;
            }

            .bio-highlights {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .highlight-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
            }

            .highlight-item i {
                width: 16px;
                color: #ec4899;
            }

            /* Interests */
            .interests-count {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
                background: rgba(255, 255, 255, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
            }

            .interests-cloud {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 12px;
            }

            .interest-tag-detailed {
                background: rgba(236, 72, 153, 0.1);
                border: 1px solid rgba(236, 72, 153, 0.3);
                border-radius: 16px;
                padding: 6px 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
            }

            .interest-tag-detailed:hover {
                background: rgba(236, 72, 153, 0.2);
                transform: translateY(-1px);
            }

            .interest-emoji {
                font-size: 14px;
            }

            .interest-name {
                color: white;
                font-weight: 500;
            }

            .mutual-interests {
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                padding-top: 12px;
            }

            .mutual-header {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 8px;
                font-size: 12px;
                color: #22c55e;
                font-weight: 500;
            }

            .mutual-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }

            .mutual-interest-tag {
                background: rgba(34, 197, 94, 0.1);
                border: 1px solid rgba(34, 197, 94, 0.3);
                border-radius: 12px;
                padding: 4px 8px;
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 11px;
                color: #22c55e;
            }

            .mutual-emoji {
                font-size: 12px;
            }

            .mutual-name {
                font-weight: 500;
            }

            /* Photos Grid */
            .photos-count {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
                background: rgba(255, 255, 255, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
            }

            .photos-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                margin-bottom: 12px;
            }

            .photo-thumbnail {
                position: relative;
                aspect-ratio: 1;
                border-radius: 8px;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .photo-thumbnail:hover {
                transform: scale(1.05);
            }

            .photo-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                color: white;
                font-size: 18px;
            }

            .photo-thumbnail:hover .photo-overlay {
                opacity: 1;
            }

            .photo-number {
                position: absolute;
                top: 4px;
                left: 4px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 10px;
                font-weight: 600;
            }

            .view-all-photos {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                padding: 8px 12px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                font-size: 12px;
                width: 100%;
            }

            .view-all-photos:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-1px);
            }

            /* Connection Insights */
            .insights-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .insight-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                transition: all 0.3s ease;
            }

            .insight-item:hover {
                background: rgba(255, 255, 255, 0.08);
                transform: translateY(-1px);
            }

            .insight-icon {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                color: white;
                flex-shrink: 0;
            }

            .insight-item.compatibility .insight-icon {
                background: rgba(239, 68, 68, 0.2);
                color: #ef4444;
            }

            .insight-item.activity .insight-icon {
                background: rgba(34, 197, 94, 0.2);
                color: #22c55e;
            }

            .insight-item.social .insight-icon {
                background: rgba(139, 92, 246, 0.2);
                color: #8b5cf6;
            }

            .insight-content {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .insight-title {
                font-size: 13px;
                font-weight: 600;
                color: white;
            }

            .insight-detail {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
            }

            /* Match Celebration Modal */
            .match-celebration-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(20px);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.4s ease;
            }

            .match-celebration-overlay.show {
                opacity: 1;
                visibility: visible;
            }

            .celebration-content {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                position: relative;
                overflow: hidden;
                max-width: 400px;
                transform: scale(0.8);
                transition: transform 0.4s ease;
            }

            .match-celebration-overlay.show .celebration-content {
                transform: scale(1);
            }

            .celebration-hearts {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
            }

            .heart {
                position: absolute;
                font-size: 24px;
                animation: heartFloat 3s ease-in-out infinite;
            }

            .heart-1 { top: 10%; left: 10%; animation-delay: 0s; }
            .heart-2 { top: 20%; right: 15%; animation-delay: 0.5s; }
            .heart-3 { bottom: 30%; left: 20%; animation-delay: 1s; }
            .heart-4 { bottom: 20%; right: 20%; animation-delay: 1.5s; }
            .heart-5 { top: 50%; left: 5%; animation-delay: 2s; }

            @keyframes heartFloat {
                0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
                50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
            }

            .celebration-text {
                margin: 20px 0;
                position: relative;
                z-index: 2;
            }

            .celebration-text h2 {
                margin: 0 0 8px 0;
                font-size: 28px;
                font-weight: 700;
                background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .celebration-text p {
                margin: 0;
                color: rgba(255, 255, 255, 0.8);
                font-size: 16px;
            }

            .celebration-profiles {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 20px;
                margin: 30px 0;
                position: relative;
                z-index: 2;
            }

            .celebration-profile {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }

            .celebration-avatar {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                color: white;
            }

            .celebration-profile span {
                color: white;
                font-size: 12px;
                font-weight: 500;
            }

            .match-connection {
                display: flex;
                align-items: center;
                position: relative;
            }

            .connection-line {
                width: 40px;
                height: 2px;
                background: linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%);
                position: relative;
            }

            .connection-heart {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 20px;
                animation: connectionPulse 1.5s ease-in-out infinite;
            }

            @keyframes connectionPulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.2); }
            }

            .celebration-actions {
                display: flex;
                gap: 12px;
                position: relative;
                z-index: 2;
            }

            .celebration-btn {
                flex: 1;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 12px 16px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                font-size: 14px;
                font-weight: 500;
            }

            .celebration-btn.send-message {
                background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
                border-color: transparent;
            }

            .celebration-btn:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-2px);
            }

            .celebration-btn.send-message:hover {
                background: linear-gradient(135deg, #db2777 0%, #7c3aed 100%);
                box-shadow: 0 8px 25px rgba(236, 72, 153, 0.3);
            }

            /* Responsive Design */
            @media (max-width: 1024px) {
                .video-content-grid {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }

                .profile-interaction-section {
                    max-height: none;
                    order: 2;
                }

                .video-player-section {
                    order: 1;
                }
            }

            @media (max-width: 768px) {
                .video-header {
                    padding: 16px 20px;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .video-content-grid {
                    padding: 16px;
                    gap: 16px;
                }

                .video-controls-bar {
                    gap: 8px;
                    padding: 8px 12px;
                }

                .volume-controls, .playback-controls {
                    display: none;
                }

                .primary-actions-panel {
                    gap: 8px;
                }

                .primary-action-btn {
                    padding: 12px;
                    gap: 12px;
                }

                .btn-content {
                    display: none;
                }

                .statistics-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .photos-grid {
                    grid-template-columns: repeat(2, 1fr);
                }

                .celebration-content {
                    margin: 20px;
                    padding: 30px 20px;
                }
            }

            /* Dark theme body class */
            body.video-details-open {
                overflow: hidden;
            }

            /* Fullscreen mode */
            .video-details-modal.fullscreen {
                background: rgba(0, 0, 0, 1);
            }

            .video-details-modal.fullscreen .video-content-grid {
                grid-template-columns: 1fr;
                padding: 0;
            }

            .video-details-modal.fullscreen .profile-interaction-section {
                display: none;
            }

            .video-details-modal.fullscreen .video-player {
                border-radius: 0;
                aspect-ratio: unset;
                height: calc(100vh - 160px);
            }
        `;

        document.head.appendChild(styles);
    }
}

// Global instance for use in HTML onclick handlers
let videoDetailsDashboard;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for app to be available
    if (window.app) {
        videoDetailsDashboard = new VideoDetailsDashboard(window.app);
        window.videoDetailsDashboard = videoDetailsDashboard; // Assign to window for global access
    } else {
        // Fallback initialization
        setTimeout(() => {
            videoDetailsDashboard = new VideoDetailsDashboard(window.app || {
                showToast: (msg, type) => console.log(`${type}: ${msg}`)
            });
            window.videoDetailsDashboard = videoDetailsDashboard; // Assign to window for global access
        }, 100);
    }
});

// Also make it available immediately for scripts that load after this
window.VideoDetailsDashboard = VideoDetailsDashboard;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoDetailsDashboard;
}
