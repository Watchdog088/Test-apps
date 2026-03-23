/**
 * ConnectHub Dating Additional UI Components
 * 16 Additional Missing Dating UI Interfaces Implementation
 * Author: Dating Features Development Team
 * Version: 1.0.0
 */

class DatingAdditionalUIComponents {
    constructor() {
        this.currentVideoProfile = null;
        this.currentMatch = null;
        this.videoCallActive = false;
        this.voiceRecording = false;
        this.init();
    }

    init() {
        console.log('Dating Additional UI Components initialized successfully');
        this.bindEvents();
    }

    bindEvents() {
        // Global event listeners for dating interfaces
        document.addEventListener('DOMContentLoaded', () => {
            this.setupVideoProfileDetection();
            this.setupSwipeAnimations();
        });
    }

    // Utility method to create modals
    createModal(id, className) {
        // Remove existing modal if present
        const existing = document.getElementById(id);
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = id;
        modal.className = `modal-overlay ${className}`;
        document.body.appendChild(modal);
        return modal;
    }

    showModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
        }
    }

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    // ==========================================
    // DISCOVER SCREEN INTERFACES (7 interfaces)
    // ==========================================

    /**
     * 1. VIDEO PROFILE PLAYER
     * In-card video playback interface
     */
    showVideoProfilePlayer(profileData = null) {
        const profile = profileData || {
            name: "Alex Johnson",
            age: 28,
            video: "sample-video.mp4",
            location: "2 miles away",
            verified: true
        };

        this.currentVideoProfile = profile;

        const modal = this.createModal('videoProfilePlayer', 'video-profile-modal');
        modal.innerHTML = `
            <div class="video-profile-container">
                <div class="video-profile-header">
                    <h3>${profile.name}, ${profile.age}</h3>
                    <div class="profile-location">
                        <i class="fas fa-map-marker-alt"></i> ${profile.location}
                    </div>
                    <button class="close-video-profile" onclick="datingAdditionalUI.closeModal('videoProfilePlayer')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="video-player-wrapper">
                    <div class="profile-video-placeholder">
                        <i class="fas fa-play-circle"></i>
                        <p>Video Profile - ${profile.name}</p>
                        <small>Tap to play video introduction</small>
                    </div>
                    
                    <div class="video-controls-overlay">
                        <button class="video-mute-btn" onclick="datingAdditionalUI.toggleVideoMute()">
                            <i class="fas fa-volume-up"></i>
                        </button>
                        <button class="video-fullscreen-btn" onclick="datingAdditionalUI.toggleVideoFullscreen()">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>

                <div class="video-profile-actions">
                    <button class="video-action-btn pass-btn" onclick="datingAdditionalUI.handleVideoProfileAction('pass')">
                        <i class="fas fa-times"></i>
                        <span>Pass</span>
                    </button>
                    <button class="video-action-btn super-like-btn" onclick="datingAdditionalUI.handleVideoProfileAction('super-like')">
                        <i class="fas fa-star"></i>
                        <span>Super Like</span>
                    </button>
                    <button class="video-action-btn like-btn" onclick="datingAdditionalUI.handleVideoProfileAction('like')">
                        <i class="fas fa-heart"></i>
                        <span>Like</span>
                    </button>
                </div>

                <div class="video-profile-info">
                    <div class="profile-stats">
                        <div class="stat-item">
                            <span class="stat-value">156</span>
                            <span class="stat-label">Likes</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">89%</span>
                            <span class="stat-label">Match Rate</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">24h</span>
                            <span class="stat-label">Response Time</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.showModal('videoProfilePlayer');
    }

    handleVideoProfileAction(action) {
        console.log(`Video profile action: ${action} for ${this.currentVideoProfile?.name}`);
        this.showActionFeedback(action);
        
        setTimeout(() => {
            this.closeModal('videoProfilePlayer');
            if (action === 'super-like') {
                this.showSuperLikeConfirmation();
            }
        }, 1000);
    }

    /**
     * 2. SUPER LIKE CONFIRMATION
     * Premium interaction modal
     */
    showSuperLikeConfirmation(profileData = null) {
        const profile = profileData || this.currentVideoProfile || {
            name: "Alex Johnson",
            photo: "👤"
        };

        const modal = this.createModal('superLikeConfirmation', 'super-like-modal');
        modal.innerHTML = `
            <div class="super-like-container">
                <div class="super-like-header">
                    <div class="super-like-icon">
                        <i class="fas fa-star"></i>
                    </div>
                    <h2>Super Like Sent!</h2>
                    <p>You super liked ${profile.name}</p>
                </div>

                <div class="super-like-profile">
                    <div class="profile-image-large">${profile.photo}</div>
                    <h3>${profile.name}</h3>
                </div>

                <div class="super-like-info">
                    <div class="info-item">
                        <i class="fas fa-bolt"></i>
                        <div>
                            <h4>Stand Out</h4>
                            <p>Your profile will be highlighted to ${profile.name}</p>
                        </div>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-heart"></i>
                        <div>
                            <h4>Instant Notification</h4>
                            <p>They'll be notified immediately about your Super Like</p>
                        </div>
                    </div>
                </div>

                <div class="super-like-stats">
                    <div class="stat-box">
                        <span class="stat-number">4</span>
                        <span class="stat-label">Super Likes Remaining</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-number">12h</span>
                        <span class="stat-label">Until Next Free</span>
                    </div>
                </div>

                <div class="super-like-actions">
                    <button class="btn-secondary" onclick="datingAdditionalUI.closeModal('superLikeConfirmation')">
                        Continue Swiping
                    </button>
                    <button class="btn-premium" onclick="datingAdditionalUI.showBoostPurchase()">
                        Get More Super Likes
                    </button>
                </div>
            </div>
        `;

        this.showModal('superLikeConfirmation');
    }

    /**
     * 3. PROFILE VERIFICATION BADGE
     * Trust indicator system
     */
    showProfileVerificationBadge(verificationData = null) {
        const data = verificationData || {
            verified: true,
            verificationLevel: "Premium",
            verificationDate: "March 15, 2024",
            trustScore: 95
        };

        const modal = this.createModal('profileVerification', 'verification-modal');
        modal.innerHTML = `
            <div class="verification-container">
                <div class="verification-header">
                    <div class="verification-badge ${data.verified ? 'verified' : 'unverified'}">
                        <i class="${data.verified ? 'fas fa-shield-check' : 'fas fa-shield-exclamation'}"></i>
                    </div>
                    <h2>${data.verified ? 'Verified Profile' : 'Unverified Profile'}</h2>
                    <p class="verification-level">${data.verificationLevel} Verification</p>
                </div>

                <div class="verification-details">
                    <div class="verification-item ${data.verified ? 'verified' : ''}">
                        <i class="fas fa-id-card"></i>
                        <div>
                            <h4>Photo ID Verification</h4>
                            <p>${data.verified ? 'Government ID verified' : 'Not verified'}</p>
                        </div>
                        <span class="verification-status">
                            <i class="${data.verified ? 'fas fa-check' : 'fas fa-times'}"></i>
                        </span>
                    </div>

                    <div class="verification-item ${data.verified ? 'verified' : ''}">
                        <i class="fas fa-mobile-alt"></i>
                        <div>
                            <h4>Phone Number</h4>
                            <p>${data.verified ? 'Phone number confirmed' : 'Not verified'}</p>
                        </div>
                        <span class="verification-status">
                            <i class="${data.verified ? 'fas fa-check' : 'fas fa-times'}"></i>
                        </span>
                    </div>
                </div>

                ${data.verified ? `
                    <div class="trust-score">
                        <div class="trust-score-display">
                            <span class="trust-score-number">${data.trustScore}</span>
                            <span class="trust-score-label">Trust Score</span>
                        </div>
                        <p class="verification-date">Verified on ${data.verificationDate}</p>
                    </div>
                ` : `
                    <div class="verification-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>This profile is not verified. Be cautious when interacting.</p>
                    </div>
                `}

                <div class="verification-actions">
                    <button class="btn-secondary" onclick="datingAdditionalUI.reportProfile()">
                        <i class="fas fa-flag"></i>
                        Report Profile
                    </button>
                    <button class="btn-primary" onclick="datingAdditionalUI.closeModal('profileVerification')">
                        Continue
                    </button>
                </div>
            </div>
        `;

        this.showModal('profileVerification');
    }

    /**
     * 4. BOOST PURCHASE INTERFACE
     * Visibility upgrade options
     */
    showBoostPurchase() {
        const modal = this.createModal('boostPurchase', 'boost-purchase-modal');
        modal.innerHTML = `
            <div class="boost-purchase-container">
                <div class="boost-header">
                    <div class="boost-icon">
                        <i class="fas fa-rocket"></i>
                    </div>
                    <h2>Boost Your Profile</h2>
                    <p>Be seen by more people in your area</p>
                </div>

                <div class="boost-packages">
                    <div class="package-card recommended">
                        <div class="package-badge">Most Popular</div>
                        <div class="package-icon">
                            <i class="fas fa-bolt"></i>
                        </div>
                        <h3>Single Boost</h3>
                        <div class="package-price">
                            <span class="price-amount">$4.99</span>
                        </div>
                        <div class="package-duration">30 minutes</div>
                        <ul class="package-features">
                            <li><i class="fas fa-check"></i> 10x more profile views</li>
                            <li><i class="fas fa-check"></i> Priority in discovery</li>
                        </ul>
                        <button class="purchase-btn" onclick="datingAdditionalUI.purchaseBoost('single')">
                            Buy Single Boost
                        </button>
                    </div>

                    <div class="package-card">
                        <div class="package-icon">
                            <i class="fas fa-fire"></i>
                        </div>
                        <h3>Boost Pack</h3>
                        <div class="package-price">
                            <span class="price-amount">$19.99</span>
                            <span class="price-original">$24.95</span>
                        </div>
                        <div class="package-duration">5 Boosts</div>
                        <ul class="package-features">
                            <li><i class="fas fa-check"></i> Save 20% vs single</li>
                            <li><i class="fas fa-check"></i> Use anytime</li>
                        </ul>
                        <button class="purchase-btn" onclick="datingAdditionalUI.purchaseBoost('pack')">
                            Buy Boost Pack
                        </button>
                    </div>
                </div>

                <div class="boost-actions">
                    <button class="btn-secondary" onclick="datingAdditionalUI.closeModal('boostPurchase')">
                        Maybe Later
                    </button>
                </div>
            </div>
        `;

        this.showModal('boostPurchase');
    }

    purchaseBoost(type) {
        console.log(`Purchasing boost: ${type}`);
        this.closeModal('boostPurchase');
        this.showActionFeedback('boost-purchased');
    }

    /**
     * 5. MATCH PREVIEW MODAL
     * Quick profile overview
     */
    showMatchPreview(profileData = null) {
        const profile = profileData || {
            name: "Sarah Chen",
            age: 26,
            photos: ["👤", "📸", "🌟"],
            bio: "Adventure seeker, coffee lover, dog mom to Max.",
            interests: ["Travel", "Photography", "Hiking", "Coffee"],
            job: "Marketing Manager",
            education: "NYU",
            distance: "3 miles away",
            mutualFriends: 2
        };

        const modal = this.createModal('matchPreview', 'match-preview-modal');
        modal.innerHTML = `
            <div class="match-preview-container">
                <div class="preview-header">
                    <button class="close-preview" onclick="datingAdditionalUI.closeModal('matchPreview')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="preview-photos">
                    <div class="main-photo">${profile.photos[0]}</div>
                </div>

                <div class="preview-info">
                    <div class="basic-info">
                        <h2>${profile.name}, ${profile.age}</h2>
                        <div class="location-info">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${profile.distance}</span>
                        </div>
                    </div>

                    <div class="bio-preview">
                        <p>${profile.bio}</p>
                    </div>

                    <div class="interests-preview">
                        ${profile.interests.slice(0, 4).map(interest => 
                            `<span class="interest-tag">${interest}</span>`
                        ).join('')}
                    </div>
                </div>

                <div class="preview-actions">
                    <button class="btn-outline" onclick="datingAdditionalUI.quickAction('pass')">
                        Pass
                    </button>
                    <button class="btn-primary" onclick="datingAdditionalUI.quickAction('like')">
                        Like
                    </button>
                </div>
            </div>
        `;

        this.showModal('matchPreview');
    }

    quickAction(action) {
        console.log(`Quick action: ${action}`);
        this.showActionFeedback(action);
        this.closeModal('matchPreview');
    }

    /**
     * 6. LIKE/PASS REASONS
     * Feedback collection interface
     */
    showLikePassReasons(action, profileData = null) {
        const profile = profileData || { name: "Sarah" };
        const modal = this.createModal('likePassReasons', 'reasons-modal');
        
        const reasons = action === 'like' ? {
            title: `Why did you like ${profile.name}?`,
            options: [
                "Great photos",
                "Similar interests",
                "Attractive profile",
                "Good bio",
                "Seems fun",
                "Location nearby"
            ]
        } : {
            title: `Why did you pass on ${profile.name}?`,
            options: [
                "Not my type",
                "Too far away",
                "Different interests",
                "Incomplete profile",
                "Age preference",
                "Other"
            ]
        };

        modal.innerHTML = `
            <div class="reasons-container">
                <div class="reasons-header">
                    <h3>${reasons.title}</h3>
                    <p>Help us improve your matches</p>
                </div>

                <div class="reasons-options">
                    ${reasons.options.map(reason => `
                        <button class="reason-option" onclick="datingAdditionalUI.selectReason('${reason}')">
                            ${reason}
                        </button>
                    `).join('')}
                </div>

                <div class="reasons-actions">
                    <button class="btn-secondary" onclick="datingAdditionalUI.closeModal('likePassReasons')">
                        Skip
                    </button>
                </div>
            </div>
        `;

        this.showModal('likePassReasons');
    }

    selectReason(reason) {
        console.log(`Selected reason: ${reason}`);
        this.closeModal('likePassReasons');
        this.showActionFeedback('feedback-saved');
    }

    /**
     * 7. SWIPE ANIMATION INTERFACE
     * Interactive swipe animations
     */
    showSwipeAnimationInterface() {
        const modal = this.createModal('swipeAnimation', 'swipe-animation-modal');
        modal.innerHTML = `
            <div class="swipe-animation-container">
                <div class="swipe-tutorial">
                    <h3>Swipe to Match</h3>
                    <div class="swipe-demo">
                        <div class="demo-card">
                            <div class="demo-photo">👤</div>
                            <div class="demo-info">
                                <h4>Demo Profile</h4>
                                <p>Swipe right to like, left to pass</p>
                            </div>
                        </div>
                        
                        <div class="swipe-indicators">
                            <div class="swipe-left">
                                <i class="fas fa-times"></i>
                                <span>Pass</span>
                            </div>
                            <div class="swipe-right">
                                <i class="fas fa-heart"></i>
                                <span>Like</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button class="btn-primary" onclick="datingAdditionalUI.closeModal('swipeAnimation')">
                    Got It!
                </button>
            </div>
        `;

        this.showModal('swipeAnimation');
    }

    // ==========================================
    // MATCHES SCREEN INTERFACES (4 interfaces)
    // ==========================================

    /**
     * 8. MATCH FILTER INTERFACE
     * Sort/filter matches
     */
    showMatchFilter() {
        const modal = this.createModal('matchFilter', 'match-filter-modal');
        modal.innerHTML = `
            <div class="match-filter-container">
                <div class="filter-header">
                    <h3>Filter Matches</h3>
                    <button class="close-filter" onclick="datingAdditionalUI.closeModal('matchFilter')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="filter-section">
                    <h4>Sort By</h4>
                    <div class="filter-options">
                        <label class="filter-option">
                            <input type="radio" name="sort" value="recent" checked>
                            <span>Most Recent</span>
                        </label>
                        <label class="filter-option">
                            <input type="radio" name="sort" value="distance">
                            <span>Distance</span>
                        </label>
                        <label class="filter-option">
                            <input type="radio" name="sort" value="activity">
                            <span>Last Active</span>
                        </label>
                    </div>
                </div>

                <div class="filter-section">
                    <h4>Show Only</h4>
                    <div class="filter-options">
                        <label class="filter-option">
                            <input type="checkbox" name="filter" value="unread">
                            <span>Unread Messages</span>
                        </label>
                        <label class="filter-option">
                            <input type="checkbox" name="filter" value="online">
                            <span>Online Now</span>
                        </label>
                        <label class="filter-option">
                            <input type="checkbox" name="filter" value="new">
                            <span>New Matches</span>
                        </label>
                    </div>
                </div>

                <div class="filter-actions">
                    <button class="btn-secondary" onclick="datingAdditionalUI.resetFilters()">
                        Reset
                    </button>
                    <button class="btn-primary" onclick="datingAdditionalUI.applyMatchFilters()">
                        Apply Filters
                    </button>
                </div>
            </div>
        `;

        this.showModal('matchFilter');
    }

    applyMatchFilters() {
        console.log('Applying match filters');
        this.closeModal('matchFilter');
        this.showActionFeedback('filters-applied');
    }

    /**
     * 9. MATCH STATISTICS DASHBOARD
     * Success rate analytics
     */
    showMatchStatistics() {
        const modal = this.createModal('matchStats', 'match-stats-modal');
        modal.innerHTML = `
            <div class="match-stats-container">
                <div class="stats-header">
                    <h3>Your Match Statistics</h3>
                    <button class="close-stats" onclick="datingAdditionalUI.closeModal('matchStats')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div class="stat-value">127</div>
                        <div class="stat-label">Total Matches</div>
                        <div class="stat-change">+12 this week</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-percentage"></i>
                        </div>
                        <div class="stat-value">23%</div>
                        <div class="stat-label">Match Rate</div>
                        <div class="stat-change">+3% vs last month</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-comment"></i>
                        </div>
                        <div class="stat-value">64</div>
                        <div class="stat-label">Conversations</div>
                        <div class="stat-change">50% of matches</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div class="stat-value">8</div>
                        <div class="stat-label">Dates Planned</div>
                        <div class="stat-change">This month</div>
                    </div>
                </div>

                <div class="stats-chart">
                    <h4>Match Activity (Last 7 Days)</h4>
                    <div class="chart-placeholder">
                        <div class="chart-bars">
                            <div class="bar" style="height: 60%"></div>
                            <div class="bar" style="height: 80%"></div>
                            <div class="bar" style="height: 40%"></div>
                            <div class="bar" style="height: 90%"></div>
                            <div class="bar" style="height: 70%"></div>
                            <div class="bar" style="height: 85%"></div>
                            <div class="bar" style="height: 95%"></div>
                        </div>
                    </div>
                </div>

                <button class="btn-primary" onclick="datingAdditionalUI.closeModal('matchStats')">
                    Close
                </button>
            </div>
        `;

        this.showModal('matchStats');
    }

    /**
     * 10. MUTUAL CONNECTIONS DISPLAY
     * Shared social connections
     */
    showMutualConnections(profileData = null) {
        const profile = profileData || { name: "Sarah" };
        const modal = this.createModal('mutualConnections', 'mutual-connections-modal');
        modal.innerHTML = `
            <div class="mutual-connections-container">
                <div class="mutual-header">
                    <h3>Mutual Connections with ${profile.name}</h3>
                    <button class="close-mutual" onclick="datingAdditionalUI.closeModal('mutualConnections')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="mutual-list">
                    <div class="mutual-item">
                        <div class="mutual-avatar">👨</div>
                        <div class="mutual-info">
                            <h4>Mike Johnson</h4>
                            <p>Mutual friend from work</p>
                        </div>
                    </div>

                    <div class="mutual-item">
                        <div class="mutual-avatar">👩</div>
                        <div class="mutual-info">
                            <h4>Lisa Chen</h4>
                            <p>Mutual friend from college</p>
                        </div>
                    </div>

                    <div class="mutual-item">
                        <div class="mutual-avatar">👤</div>
                        <div class="mutual-info">
                            <h4>Photography Club</h4>
                            <p>Shared interest group</p>
                        </div>
                    </div>
                </div>

                <div class="mutual-actions">
                    <button class="btn-primary" onclick="datingAdditionalUI.closeModal('mutualConnections')">
                        Close
                    </button>
                </div>
            </div>
        `;

        this.showModal('mutualConnections');
    }

    /**
     * 11. MATCH EXPIRATION WARNINGS
     * Time limit notifications
     */
    showMatchExpirationWarning(matchData = null) {
        const match = matchData || { name: "Emma", timeLeft: "6 hours" };
        const modal = this.createModal('matchExpiration', 'match-expiration-modal');
        modal.innerHTML = `
            <div class="match-expiration-container">
                <div class="expiration-header">
                    <div class="expiration-icon">
                        <i class="fas fa-hourglass-half"></i>
                    </div>
                    <h3>Match Expiring Soon!</h3>
                    <p>Your match with ${match.name} expires in ${match.timeLeft}</p>
                </div>

                <div class="expiration-info">
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <h4>Time Remaining</h4>
                            <p>${match.timeLeft} until this match expires</p>
                        </div>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-comment"></i>
                        <div>
                            <h4>Start Conversation</h4>
                            <p>Send a message to extend this match</p>
                        </div>
                    </div>
                </div>

                <div class="expiration-actions">
                    <button class="btn-secondary" onclick="datingAdditionalUI.closeModal('matchExpiration')">
                        Dismiss
                    </button>
                    <button class="btn-primary" onclick="datingAdditionalUI.sendMessageToMatch()">
                        <i class="fas fa-comment"></i>
                        Send Message
                    </button>
                </div>
            </div>
        `;

        this.showModal('matchExpiration');
    }

    sendMessageToMatch() {
        console.log('Sending message to match');
        this.closeModal('matchExpiration');
        this.showActionFeedback('message-sent');
    }

    // ==========================================
    // DATING CHAT INTERFACES (5 interfaces)
    // ==========================================

    /**
     * 12. PHOTO SHARING INTERFACE
     * In-chat image sharing
     */
    showPhotoSharingInterface() {
        const modal = this.createModal('photoSharing', 'photo-sharing-modal');
        modal.innerHTML = `
            <div class="photo-sharing-container">
                <div class="sharing-header">
                    <h3>Share Photo</h3>
                    <button class="close-sharing" onclick="datingAdditionalUI.closeModal('photoSharing')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="photo-options">
                    <button class="photo-option" onclick="datingAdditionalUI.selectPhotoSource('camera')">
                        <i class="fas fa-camera"></i>
                        <span>Take Photo</span>
                    </button>
                    <button class="photo-option" onclick="datingAdditionalUI.selectPhotoSource('gallery')">
                        <i class="fas fa-images"></i>
                        <span>Choose from Gallery</span>
                    </button>
                </div>

                <div class="photo-preview" id="photoPreview" style="display: none;">
                    <div class="preview-image">📸</div>
                    <div class="photo-actions">
                        <button class="btn-secondary" onclick="datingAdditionalUI.cancelPhotoShare()">
                            Cancel
                        </button>
                        <button class="btn-primary" onclick="datingAdditionalUI.sharePhoto()">
                            Send Photo
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.showModal('photoSharing');
    }

    selectPhotoSource(source) {
        console.log(`Selected photo source: ${source}`);
        document.getElementById('photoPreview').style.display = 'block';
    }

    sharePhoto() {
        console.log('Sharing photo');
        this.closeModal('photoSharing');
        this.showActionFeedback('photo-shared');
    }

    /**
     * 13. VOICE MESSAGE RECORDER
     * Audio message recording
     */
    showVoiceMessageRecorder() {
        const modal = this.createModal('voiceRecorder', 'voice-recorder-modal');
        modal.innerHTML = `
            <div class="voice-recorder-container">
                <div class="recorder-header">
                    <h3>Voice Message</h3>
                    <button class="close-recorder" onclick="datingAdditionalUI.closeModal('voiceRecorder')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="recording-interface">
                    <div class="recording-visualizer">
                        <div class="audio-waves">
                            <div class="wave"></div>
                            <div class="wave"></div>
                            <div class="wave"></div>
                            <div class="wave"></div>
                            <div class="wave"></div>
                        </div>
                    </div>

                    <div class="recording-timer">
                        <span id="recordingTimer">00:00</span>
                    </div>

                    <div class="recording-controls">
                        <button class="record-btn" onclick="datingAdditionalUI.toggleRecording()">
                            <i class="fas fa-microphone"></i>
                        </button>
                        <button class="play-btn" onclick="datingAdditionalUI.playRecording()" style="display: none;">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>

                    <div class="recording-actions" style="display: none;" id="recordingActions">
                        <button class="btn-secondary" onclick="datingAdditionalUI.deleteRecording()">
                            Delete
                        </button>
                        <button class="btn-primary" onclick="datingAdditionalUI.sendVoiceMessage()">
                            Send
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.showModal('voiceRecorder');
    }

    toggleRecording() {
        this.voiceRecording = !this.voiceRecording;
        const recordBtn = document.querySelector('.record-btn i');
        
        if (this.voiceRecording) {
            recordBtn.className = 'fas fa-stop';
            this.startRecordingTimer();
        } else {
            recordBtn.className = 'fas fa-microphone';
            this.stopRecordingTimer();
            document.getElementById('recordingActions').style.display = 'flex';
        }
    }

    startRecordingTimer() {
        let seconds = 0;
        this.recordingTimer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            document.getElementById('recordingTimer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopRecordingTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
        }
    }

    sendVoiceMessage() {
        console.log('Sending voice message');
        this.closeModal('voiceRecorder');
        this.showActionFeedback('voice-sent');
    }

    /**
     * 14. VIDEO CALL SCREEN
     * Dating-specific video interface
     */
    showVideoCallScreen(matchData = null) {
        const match = matchData || { name: "Sarah", photo: "👤" };
        const modal = this.createModal('videoCall', 'video-call-modal');
        modal.innerHTML = `
            <div class="video-call-container">
                <div class="call-header">
                    <div class="call-info">
                        <span class="caller-name">${match.name}</span>
                        <span class="call-status">Connecting...</span>
                    </div>
                    <button class="minimize-call" onclick="datingAdditionalUI.minimizeVideoCall()">
                        <i class="fas fa-window-minimize"></i>
                    </button>
                </div>

                <div class="video-streams">
                    <div class="remote-video">
                        <div class="video-placeholder">
                            <div class="caller-avatar">${match.photo}</div>
                            <p>Waiting for ${match.name}...</p>
                        </div>
                    </div>
                    <div class="local-video">
                        <div class="video-placeholder small">
                            <p>You</p>
                        </div>
                    </div>
                </div>

                <div class="call-controls">
                    <button class="control-btn mute-btn" onclick="datingAdditionalUI.toggleMute()">
                        <i class="fas fa-microphone"></i>
                    </button>
                    <button class="control-btn camera-btn" onclick="datingAdditionalUI.toggleCamera()">
                        <i class="fas fa-video"></i>
                    </button>
                    <button class="control-btn end-call-btn" onclick="datingAdditionalUI.endVideoCall()">
                        <i class="fas fa-phone-slash"></i>
                    </button>
                    <button class="control-btn settings-btn" onclick="datingAdditionalUI.showCallSettings()">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>

                <div class="call-timer">
                    <span id="callTimer">00:00</span>
                </div>
            </div>
        `;

        this.showModal('videoCall');
        this.startCallTimer();
    }

    startCallTimer() {
        let seconds = 0;
        this.callTimer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            const timer = document.getElementById('callTimer');
            if (timer) {
                timer.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    endVideoCall() {
        if (this.callTimer) clearInterval(this.callTimer);
        this.closeModal('videoCall');
        this.showActionFeedback('call-ended');
    }

    /**
     * 15. GIF/STICKER PICKER
     * Enhanced messaging options
     */
    showGifStickerPicker() {
        const modal = this.createModal('gifStickerPicker', 'gif-sticker-modal');
        modal.innerHTML = `
            <div class="gif-sticker-container">
                <div class="picker-header">
                    <div class="picker-tabs">
                        <button class="tab-btn active" onclick="datingAdditionalUI.switchPickerTab('gif')">
                            GIFs
                        </button>
                        <button class="tab-btn" onclick="datingAdditionalUI.switchPickerTab('sticker')">
                            Stickers
                        </button>
                    </div>
                    <button class="close-picker" onclick="datingAdditionalUI.closeModal('gifStickerPicker')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="picker-search">
                    <input type="text" placeholder="Search..." class="search-input">
                </div>

                <div class="picker-content" id="pickerContent">
                    <div class="gif-grid">
                        <div class="gif-item" onclick="datingAdditionalUI.selectGif('happy')">🎉</div>
                        <div class="gif-item" onclick="datingAdditionalUI.selectGif('love')">💕</div>
                        <div class="gif-item" onclick="datingAdditionalUI.selectGif('laugh')">😂</div>
                        <div class="gif-item" onclick="datingAdditionalUI.selectGif('wink')">😉</div>
                        <div class="gif-item" onclick="datingAdditionalUI.selectGif('thumbs')">👍</div>
                        <div class="gif-item" onclick="datingAdditionalUI.selectGif('fire')">🔥</div>
                    </div>
                </div>
            </div>
        `;

        this.showModal('gifStickerPicker');
    }

    selectGif(type) {
        console.log(`Selected GIF: ${type}`);
        this.closeModal('gifStickerPicker');
        this.showActionFeedback('gif-sent');
    }

    /**
     * 16. DATE CONFIRMATION INTERFACE
     * Meeting arrangement tools
     */
    showDateConfirmationInterface(matchData = null) {
        const match = matchData || { name: "Sarah" };
        const modal = this.createModal('dateConfirmation', 'date-confirmation-modal');
        modal.innerHTML = `
            <div class="date-confirmation-container">
                <div class="confirmation-header">
                    <h3>Confirm Date with ${match.name}</h3>
                    <button class="close-confirmation" onclick="datingAdditionalUI.closeModal('dateConfirmation')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="date-details">
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <div>
                            <h4>Date & Time</h4>
                            <p>Saturday, March 23rd at 7:00 PM</p>
                        </div>
                    </div>

                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <h4>Location</h4>
                            <p>Coffee Bean Café, Downtown</p>
                        </div>
                    </div>

                    <div class="detail-item">
                        <i class="fas fa-user-friends"></i>
                        <div>
                            <h4>Activity</h4>
                            <p>Coffee & Conversation</p>
                        </div>
                    </div>
                </div>

                <div class="safety-info">
                    <div class="safety-header">
                        <i class="fas fa-shield-alt"></i>
                        <h4>Safety Reminders</h4>
                    </div>
                    <ul class="safety-tips">
                        <li>Meet in a public place</li>
                        <li>Let a friend know your plans</li>
                        <li>Trust your instincts</li>
                    </ul>
                </div>

                <div class="confirmation-actions">
                    <button class="btn-secondary" onclick="datingAdditionalUI.rescheduleDate()">
                        Reschedule
                    </button>
                    <button class="btn-danger" onclick="datingAdditionalUI.cancelDate()">
                        Cancel Date
                    </button>
                    <button class="btn-primary" onclick="datingAdditionalUI.confirmDate()">
                        Confirm Date
                    </button>
                </div>
            </div>
        `;

        this.showModal('dateConfirmation');
    }

    confirmDate() {
        console.log('Date confirmed');
        this.closeModal('dateConfirmation');
        this.showActionFeedback('date-confirmed');
    }

    // ==========================================
    // UTILITY METHODS
    // ==========================================

    showActionFeedback(action) {
        const feedback = document.createElement('div');
        feedback.className = 'action-feedback';
        feedback.textContent = this.getFeedbackMessage(action);
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.classList.add('fade-out');
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
    }

    getFeedbackMessage(action) {
        const messages = {
            'pass': 'Passed',
            'like': 'Liked!',
            'super-like': 'Super Like sent!',
            'boost-purchased': 'Boost activated!',
            'filters-applied': 'Filters applied',
            'feedback-saved': 'Feedback saved',
            'photo-shared': 'Photo sent',
            'voice-sent': 'Voice message sent',
            'gif-sent': 'GIF sent',
            'call-ended': 'Call ended',
            'date-confirmed': 'Date confirmed!',
            'message-sent': 'Message sent'
        };
        return messages[action] || 'Action completed';
    }

    setupVideoProfileDetection() {
        // Setup video profile detection logic
        console.log('Video profile detection setup');
    }

    setupSwipeAnimations() {
        // Setup swipe animation logic
        console.log('Swipe animations setup');
    }

    toggleVideoMute() {
        console.log('Toggle video mute');
    }

    toggleVideoFullscreen() {
        console.log('Toggle video fullscreen');
    }

    reportProfile() {
        console.log('Reporting profile');
        this.showActionFeedback('reported');
    }

    resetFilters() {
        console.log('Resetting filters');
    }

    cancelPhotoShare() {
        document.getElementById('photoPreview').style.display = 'none';
    }

    deleteRecording() {
        console.log('Deleting recording');
        this.closeModal('voiceRecorder');
    }

    playRecording() {
        console.log('Playing recording');
    }

    minimizeVideoCall() {
        console.log('Minimizing video call');
    }

    toggleMute() {
        console.log('Toggle mute');
    }

    toggleCamera() {
        console.log('Toggle camera');
    }

    showCallSettings() {
        console.log('Show call settings');
    }

    switchPickerTab(tab) {
        console.log(`Switching to ${tab} tab`);
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(t => t.classList.remove('active'));
        event.target.classList.add('active');
    }

    rescheduleDate() {
        console.log('Rescheduling date');
        this.closeModal('dateConfirmation');
    }

    cancelDate() {
        console.log('Canceling date');
        this.closeModal('dateConfirmation');
    }
}

// Initialize the additional dating UI components
const datingAdditionalUI = new DatingAdditionalUIComponents();

// Make it globally available
window.datingAdditionalUI = datingAdditionalUI;
