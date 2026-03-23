/**
 * Nearby Profile Modal System
 * Comprehensive profile viewing experience for the nearby section
 */
class NearbyProfileModal {
    constructor(app) {
        this.app = app;
        this.currentProfile = null;
        this.modalElement = null;
        this.isVisible = false;
        
        this.showProfileModal = this.showProfileModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        
        this.init();
    }

    init() {
        if (!document.getElementById('nearby-profile-modal-styles')) {
            this.addStyles();
        }
        document.addEventListener('keydown', this.handleKeyPress);
    }

    addStyles() {
        const style = document.createElement('style');
        style.id = 'nearby-profile-modal-styles';
        style.textContent = `
            .nearby-profile-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(10px);
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: all 0.3s ease;
            }

            .nearby-profile-modal.active {
                display: flex;
                opacity: 1;
            }

            .profile-modal-container {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 24px;
                width: 900px;
                max-width: 95vw;
                height: 700px;
                max-height: 90vh;
                position: relative;
                overflow: hidden;
                animation: profileModalSlideIn 0.4s ease;
                display: flex;
                flex-direction: column;
            }

            @keyframes profileModalSlideIn {
                from { transform: translateY(50px) scale(0.95); opacity: 0; }
                to { transform: translateY(0) scale(1); opacity: 1; }
            }

            .profile-modal-header {
                padding: 2rem;
                background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                display: flex;
                align-items: center;
                gap: 2rem;
            }

            .profile-photo-main {
                width: 150px;
                height: 150px;
                border-radius: 50%;
                background: linear-gradient(135deg, #4f46e5 0%, #ec4899 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 4rem;
                color: white;
                font-weight: 700;
                position: relative;
                overflow: hidden;
                cursor: pointer;
                border: 3px solid rgba(255, 255, 255, 0.2);
            }

            .profile-photo-main img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
            }

            .status-indicators {
                position: absolute;
                top: -5px;
                right: -5px;
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .status-dot {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 2px solid #1a1a2e;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: white;
                font-weight: 600;
            }

            .status-dot.online { background: #10b981; }
            .status-dot.verified { background: #3b82f6; }
            .status-dot.video-profile { background: #f59e0b; }

            .profile-info-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .profile-name {
                font-size: 2rem;
                font-weight: 700;
                color: white;
                margin: 0;
            }

            .profile-username {
                font-size: 1.1rem;
                color: rgba(255, 255, 255, 0.6);
                margin: 0;
            }

            .profile-occupation {
                font-size: 1rem;
                color: #06b6d4;
                font-weight: 500;
            }

            .profile-bio-preview {
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.5;
                font-size: 0.95rem;
            }

            .profile-modal-close {
                position: absolute;
                top: 1.5rem;
                right: 1.5rem;
                width: 40px;
                height: 40px;
                background: rgba(0, 0, 0, 0.5);
                border: none;
                border-radius: 50%;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                z-index: 10;
            }

            .profile-modal-content {
                flex: 1;
                display: flex;
                overflow: hidden;
            }

            .profile-details-side {
                flex: 1;
                padding: 2rem;
                overflow-y: auto;
            }

            .profile-section {
                margin-bottom: 2rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 1.5rem;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .profile-section-title {
                font-size: 1.1rem;
                font-weight: 600;
                color: white;
                margin: 0 0 1rem 0;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .interests-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 0.75rem;
            }

            .interest-badge {
                background: #4f46e5;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 500;
            }

            .profile-actions-side {
                width: 300px;
                background: rgba(255, 255, 255, 0.08);
                border-left: 1px solid rgba(255, 255, 255, 0.2);
                padding: 2rem;
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }

            .action-btn {
                padding: 1rem 1.5rem;
                border: none;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                font-size: 0.95rem;
            }

            .action-btn.primary {
                background: linear-gradient(135deg, #4f46e5 0%, #ec4899 100%);
                color: white;
            }

            .action-btn.secondary {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .quick-actions {
                display: flex;
                justify-content: space-between;
                gap: 0.5rem;
            }

            .quick-action-btn {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                transition: all 0.3s ease;
            }
        `;
        
        document.head.appendChild(style);
    }

    generateSampleProfile(name, overrides = {}) {
        const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        return {
            name: name,
            username: '@' + name.toLowerCase().replace(/\s+/g, ''),
            avatar: avatar,
            age: 20 + Math.floor(Math.random() * 15),
            location: 'Bay Area, CA',
            distance: `${(Math.random() * 10 + 1).toFixed(1)} miles`,
            lastSeen: Math.random() > 0.5 ? 'Online now' : `Active ${Math.floor(Math.random() * 24) + 1} hours ago`,
            occupation: 'Professional',
            bio: `Hi! I'm ${name}. Love meeting new people and exploring new places.`,
            interests: ['Travel', 'Coffee', 'Music', 'Art'],
            isOnline: Math.random() > 0.5,
            isVerified: Math.random() > 0.7,
            hasVideoProfile: Math.random() > 0.6,
            mutualFriends: Math.floor(Math.random() * 8) + 1,
            ...overrides
        };
    }

    showProfileModal(profileName, profileData = null) {
        this.currentProfile = profileData || this.generateSampleProfile(profileName);
        this.closeModal();
        this.createModal();
        
        setTimeout(() => {
            this.modalElement.classList.add('active');
            this.isVisible = true;
        }, 50);
        
        if (this.app && this.app.showToast) {
            this.app.showToast(`Viewing ${this.currentProfile.name}'s profile`, 'info');
        }
    }

    createModal() {
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'nearby-profile-modal';
        this.modalElement.innerHTML = this.generateModalHTML();
        this.modalElement.addEventListener('click', this.handleOutsideClick);
        document.body.appendChild(this.modalElement);
    }

    generateModalHTML() {
        const profile = this.currentProfile;
        if (!profile) {
            return '<div>Profile data unavailable</div>';
        }
        
        const name = profile.name || 'User';
        const username = profile.username || '@user';
        const age = profile.age || 'N/A';
        const location = profile.location || 'Unknown';
        const distance = profile.distance || 'Unknown';
        const lastSeen = profile.lastSeen || 'Recently active';
        const occupation = profile.occupation || 'Professional';
        const bio = profile.bio || 'No bio available';
        const interests = profile.interests || [];
        
        return `
            <div class="profile-modal-container" tabindex="0">
                <button class="profile-modal-close" onclick="window.nearbyProfileModal.closeModal()">×</button>
                
                <div class="profile-modal-header">
                    <div class="profile-photo-section">
                        <div class="profile-photo-main">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6c5ce7&color=ffffff&size=150" alt="${name}">
                        </div>
                        <div class="status-indicators">
                            ${profile.isOnline ? '<div class="status-dot online">●</div>' : ''}
                            ${profile.isVerified ? '<div class="status-dot verified">✓</div>' : ''}
                            ${profile.hasVideoProfile ? '<div class="status-dot video-profile">▶</div>' : ''}
                        </div>
                    </div>
                    
                    <div class="profile-info-section">
                        <h1 class="profile-name">${name}</h1>
                        <p class="profile-username">${username}</p>
                        <p class="profile-occupation">${occupation}</p>
                        <div class="profile-bio-preview">${bio}</div>
                        <div style="margin-top: 1rem; color: rgba(255, 255, 255, 0.8);">
                            ${age} • ${location} • ${distance} away
                        </div>
                        <div style="margin-top: 0.5rem; color: #10b981;">
                            ${lastSeen}
                        </div>
                    </div>
                </div>
                
                <div class="profile-modal-content">
                    <div class="profile-details-side">
                        <div class="profile-section">
                            <h3 class="profile-section-title">
                                <span>🎯</span> Interests & Hobbies
                            </h3>
                            <div class="interests-grid">
                                ${interests.map(interest => 
                                    `<span class="interest-badge">${interest}</span>`
                                ).join('')}
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <h3 class="profile-section-title">
                                <span>👥</span> Connections
                            </h3>
                            <div style="color: rgba(255, 255, 255, 0.8);">
                                ${profile.mutualFriends} mutual friends
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <h3 class="profile-section-title">
                                <span>⚡</span> Recent Activity
                            </h3>
                            <div style="color: rgba(255, 255, 255, 0.8);">
                                Recently active on ConnectHub
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-actions-side">
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <button class="action-btn primary" onclick="window.nearbyProfileModal.connectWithUser()">
                                <span>👋</span> Connect
                            </button>
                            <button class="action-btn secondary" onclick="window.nearbyProfileModal.sendMessage()">
                                <span>💬</span> Send Message
                            </button>
                            ${profile.hasVideoProfile ? 
                                '<button class="action-btn secondary" onclick="window.nearbyProfileModal.startVideoChat()"><span>📹</span> Video Chat</button>'
                                : ''
                            }
                        </div>
                        
                        <div>
                            <h4 style="margin: 0 0 1rem 0; font-size: 0.9rem; color: rgba(255, 255, 255, 0.6);">Quick Reactions</h4>
                            <div class="quick-actions">
                                <button class="quick-action-btn" onclick="window.nearbyProfileModal.sendReaction('heart')" title="Like">
                                    ❤️
                                </button>
                                <button class="quick-action-btn" onclick="window.nearbyProfileModal.sendReaction('thumbs-up')" title="Thumbs Up">
                                    👍
                                </button>
                                <button class="quick-action-btn" onclick="window.nearbyProfileModal.sendReaction('wave')" title="Wave">
                                    👋
                                </button>
                                <button class="quick-action-btn" onclick="window.nearbyProfileModal.sendReaction('fire')" title="Fire">
                                    🔥
                                </button>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <button class="action-btn secondary" onclick="window.nearbyProfileModal.shareProfile()" style="font-size: 0.85rem;">
                                <span>📤</span> Share
                            </button>
                            <button class="action-btn secondary" onclick="window.nearbyProfileModal.addToFavorites()" style="font-size: 0.85rem;">
                                <span>⭐</span> Favorite
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    connectWithUser() {
        if (this.app && this.app.showToast) {
            this.app.showToast(`Connection request sent to ${this.currentProfile.name}!`, 'success');
        }
    }

    sendMessage() {
        if (this.app && this.app.showToast) {
            this.app.showToast(`Opening conversation with ${this.currentProfile.name}...`, 'info');
        }
    }

    startVideoChat() {
        if (this.app && this.app.showToast) {
            this.app.showToast(`Starting video chat with ${this.currentProfile.name}...`, 'info');
        }
    }

    sendReaction(reactionType) {
        const reactions = { 'heart': '❤️', 'thumbs-up': '👍', 'wave': '👋', 'fire': '🔥' };
        const emoji = reactions[reactionType] || '👍';
        
        if (this.app && this.app.showToast) {
            this.app.showToast(`Sent ${emoji} to ${this.currentProfile.name}!`, 'success');
        }
    }

    shareProfile() {
        if (this.app && this.app.showToast) {
            this.app.showToast(`Sharing ${this.currentProfile.name}'s profile...`, 'info');
        }
    }

    addToFavorites() {
        if (this.app && this.app.showToast) {
            this.app.showToast(`Added ${this.currentProfile.name} to favorites!`, 'success');
        }
    }

    handleKeyPress(event) {
        if (!this.isVisible) return;
        
        if (event.key === 'Escape') {
            event.preventDefault();
            this.closeModal();
        }
    }

    handleOutsideClick(event) {
        if (event.target === this.modalElement) {
            this.closeModal();
        }
    }

    closeModal() {
        if (!this.modalElement) return;
        
        this.isVisible = false;
        this.modalElement.classList.remove('active');
        
        setTimeout(() => {
            if (this.modalElement && this.modalElement.parentNode) {
                this.modalElement.parentNode.removeChild(this.modalElement);
            }
            this.modalElement = null;
            this.currentProfile = null;
        }, 300);
    }
}

// Make class available globally
window.NearbyProfileModal = NearbyProfileModal;

// Create global instance
window.nearbyProfileModal = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const app = window.app || {
        showToast: function(message, type) {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    };
    
    window.nearbyProfileModal = new NearbyProfileModal(app);
    console.log('Nearby Profile Modal initialized');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NearbyProfileModal;
}
