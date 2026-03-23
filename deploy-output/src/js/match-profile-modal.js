/**
 * Match Profile Modal System
 * Comprehensive profile viewing experience for the my matches section
 * Follows the same pattern as nearby and video profile systems
 */
class MatchProfileModal {
    constructor(app) {
        this.app = app;
        this.currentProfile = null;
        this.modalElement = null;
        this.isVisible = false;
        
        this.showMatchProfile = this.showMatchProfile.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        
        this.init();
    }

    init() {
        if (!document.getElementById('match-profile-modal-styles')) {
            this.addStyles();
        }
        this.bindEvents();
        document.addEventListener('keydown', this.handleKeyPress);
    }

    addStyles() {
        const style = document.createElement('style');
        style.id = 'match-profile-modal-styles';
        style.textContent = `
            .match-profile-modal {
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

            .match-profile-modal.active {
                display: flex;
                opacity: 1;
            }

            .match-modal-container {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 24px;
                width: 900px;
                max-width: 95vw;
                height: 700px;
                max-height: 90vh;
                position: relative;
                overflow: hidden;
                animation: matchModalSlideIn 0.4s ease;
                display: flex;
                flex-direction: column;
            }

            @keyframes matchModalSlideIn {
                from { transform: translateY(50px) scale(0.95); opacity: 0; }
                to { transform: translateY(0) scale(1); opacity: 1; }
            }

            .match-modal-header {
                padding: 2rem;
                background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                display: flex;
                align-items: center;
                gap: 2rem;
            }

            .match-photo-main {
                width: 150px;
                height: 150px;
                border-radius: 50%;
                background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
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

            .match-photo-main img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
            }

            .match-status-indicators {
                position: absolute;
                top: -5px;
                right: -5px;
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .match-status-dot {
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

            .match-status-dot.online { background: #10b981; }
            .match-status-dot.verified { background: #3b82f6; }
            .match-status-dot.premium { background: #f59e0b; }

            .match-info-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .match-name {
                font-size: 2rem;
                font-weight: 700;
                color: white;
                margin: 0;
            }

            .match-username {
                font-size: 1.1rem;
                color: rgba(255, 255, 255, 0.6);
                margin: 0;
            }

            .match-details {
                font-size: 1rem;
                color: #06b6d4;
                font-weight: 500;
            }

            .match-compatibility {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-top: 0.5rem;
            }

            .compatibility-percentage {
                font-size: 1.5rem;
                font-weight: 700;
                color: #ec4899;
            }

            .compatibility-label {
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.9rem;
            }

            .match-bio-preview {
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.5;
                font-size: 0.95rem;
                margin-top: 0.5rem;
            }

            .match-modal-close {
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
                transition: all 0.3s ease;
            }

            .match-modal-close:hover {
                background: rgba(239, 68, 68, 0.6);
                transform: rotate(90deg);
            }

            .match-modal-content {
                flex: 1;
                display: flex;
                overflow: hidden;
            }

            .match-details-side {
                flex: 1;
                padding: 2rem;
                overflow-y: auto;
            }

            .match-section {
                margin-bottom: 2rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 1.5rem;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .match-section-title {
                font-size: 1.1rem;
                font-weight: 600;
                color: white;
                margin: 0 0 1rem 0;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .match-interests-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 0.75rem;
            }

            .match-interest-badge {
                background: #ec4899;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 500;
                transition: all 0.3s ease;
                cursor: pointer;
            }

            .match-interest-badge:hover {
                background: #db2777;
                transform: translateY(-2px);
            }

            .match-actions-side {
                width: 300px;
                background: rgba(255, 255, 255, 0.08);
                border-left: 1px solid rgba(255, 255, 255, 0.2);
                padding: 2rem;
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }

            .match-action-btn {
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

            .match-action-btn.primary {
                background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
                color: white;
            }

            .match-action-btn.primary:hover {
                background: linear-gradient(135deg, #db2777 0%, #7c3aed 100%);
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(236, 72, 153, 0.3);
            }

            .match-action-btn.secondary {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .match-action-btn.secondary:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-2px);
            }

            .match-quick-actions {
                display: flex;
                justify-content: space-between;
                gap: 0.5rem;
            }

            .match-quick-action-btn {
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

            .match-quick-action-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
            }

            .match-photos-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 0.5rem;
                margin-top: 1rem;
            }

            .match-photo-item {
                aspect-ratio: 1;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .match-photo-item:hover {
                transform: scale(1.05);
            }

            .match-photo-overlay {
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
            }

            .match-photo-item:hover .match-photo-overlay {
                opacity: 1;
            }

            .conversation-starters {
                background: rgba(139, 92, 246, 0.1);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 12px;
                padding: 1rem;
            }

            .starter-item {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                padding: 0.75rem;
                margin-bottom: 0.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
                color: rgba(255, 255, 255, 0.9);
                font-size: 0.9rem;
            }

            .starter-item:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-1px);
            }

            .starter-item:last-child {
                margin-bottom: 0;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .match-modal-container {
                    width: 95vw;
                    height: 95vh;
                    border-radius: 16px;
                }

                .match-modal-header {
                    padding: 1.5rem;
                    flex-direction: column;
                    text-align: center;
                    gap: 1rem;
                }

                .match-photo-main {
                    width: 120px;
                    height: 120px;
                    font-size: 3rem;
                }

                .match-name {
                    font-size: 1.5rem;
                }

                .match-modal-content {
                    flex-direction: column;
                }

                .match-actions-side {
                    width: 100%;
                    padding: 1rem;
                }

                .match-details-side {
                    padding: 1rem;
                }

                .match-section {
                    padding: 1rem;
                    margin-bottom: 1rem;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    bindEvents() {
        const self = this;
        
        // Listen for clicks on match profile triggers
        document.addEventListener('click', (e) => {
            const matchElement = e.target.closest('.match-profile-trigger');
            if (matchElement) {
                e.preventDefault();
                e.stopPropagation();
                
                const matchData = {
                    name: matchElement.dataset.matchName,
                    age: parseInt(matchElement.dataset.matchAge),
                    distance: matchElement.dataset.matchDistance,
                    compatibility: parseInt(matchElement.dataset.matchCompatibility),
                    interests: matchElement.dataset.matchInterests ? matchElement.dataset.matchInterests.split(',') : [],
                    bio: matchElement.dataset.matchBio,
                    avatar: matchElement.dataset.matchAvatar
                };
                
                console.log('Match clicked:', matchData);
                self.showMatchProfile(matchData);
            }
        });
    }

    generateSampleProfile(name, overrides = {}) {
        // Handle cases where name might not be a string
        const userName = typeof name === 'string' ? name : (name && name.name) ? name.name : 'Sample User';
        const avatar = userName.split(' ').map(n => n[0]).join('').toUpperCase();
        
        return {
            name: userName,
            username: '@' + userName.toLowerCase().replace(/\s+/g, ''),
            avatar: avatar,
            age: 20 + Math.floor(Math.random() * 15),
            location: 'San Francisco, CA',
            distance: `${(Math.random() * 10 + 1).toFixed(1)} miles`,
            compatibility: 85 + Math.floor(Math.random() * 15),
            lastSeen: Math.random() > 0.5 ? 'Online now' : `Active ${Math.floor(Math.random() * 24) + 1} hours ago`,
            occupation: 'Professional',
            bio: `Hi! I'm ${userName}. Looking for meaningful connections and someone who shares my interests.`,
            interests: ['Travel', 'Photography', 'Music', 'Fitness', 'Food', 'Movies'],
            isOnline: Math.random() > 0.5,
            isVerified: Math.random() > 0.7,
            isPremium: Math.random() > 0.6,
            mutualFriends: Math.floor(Math.random() * 12) + 1,
            photos: 6,
            ...overrides
        };
    }

    showMatchProfile(matchData) {
        // If we have complete match data, use it; otherwise generate sample data
        let profile;
        if (matchData && matchData.name && typeof matchData.name === 'string') {
            profile = matchData;
        } else {
            // Generate sample profile, using the name if available
            const nameToUse = (matchData && matchData.name) ? matchData.name : 'Sample User';
            profile = this.generateSampleProfile(nameToUse, matchData || {});
        }
        
        this.currentProfile = profile;
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
        this.modalElement.className = 'match-profile-modal';
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
        const distance = profile.distance || 'Unknown';
        const compatibility = profile.compatibility || 85;
        const bio = profile.bio || 'No bio available';
        const interests = profile.interests || [];
        const photos = profile.photos || 6;
        
        // Generate conversation starters based on interests
        const starters = this.generateConversationStarters(interests, name);
        
        return `
            <div class="match-modal-container" tabindex="0">
                <button class="match-modal-close" onclick="window.matchProfileModal.closeModal()">×</button>
                
                <div class="match-modal-header">
                    <div class="match-photo-section">
                        <div class="match-photo-main">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ec4899&color=ffffff&size=150" alt="${name}">
                        </div>
                        <div class="match-status-indicators">
                            ${profile.isOnline ? '<div class="match-status-dot online">●</div>' : ''}
                            ${profile.isVerified ? '<div class="match-status-dot verified">✓</div>' : ''}
                            ${profile.isPremium ? '<div class="match-status-dot premium">★</div>' : ''}
                        </div>
                    </div>
                    
                    <div class="match-info-section">
                        <h1 class="match-name">${name}</h1>
                        <p class="match-username">${username}</p>
                        <div class="match-details">${age} • ${distance} away</div>
                        <div class="match-compatibility">
                            <span class="compatibility-percentage">${compatibility}%</span>
                            <span class="compatibility-label">Match Compatibility</span>
                        </div>
                        <div class="match-bio-preview">${bio}</div>
                    </div>
                </div>
                
                <div class="match-modal-content">
                    <div class="match-details-side">
                        <div class="match-section">
                            <h3 class="match-section-title">
                                <span>🎯</span> Shared Interests
                            </h3>
                            <div class="match-interests-grid">
                                ${interests.map(interest => 
                                    `<span class="match-interest-badge">${interest}</span>`
                                ).join('')}
                            </div>
                        </div>
                        
                        <div class="match-section">
                            <h3 class="match-section-title">
                                <span>📸</span> More Photos
                            </h3>
                            <div class="match-photos-grid">
                                ${Array.from({length: Math.min(photos, 6)}, (_, i) => `
                                    <div class="match-photo-item" onclick="window.matchProfileModal.viewPhoto(${i})">
                                        <span>${i + 1}</span>
                                        <div class="match-photo-overlay">
                                            <i class="fas fa-expand"></i>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="match-section">
                            <h3 class="match-section-title">
                                <span>💬</span> AI Conversation Starters
                            </h3>
                            <div class="conversation-starters">
                                ${starters.map(starter => 
                                    `<div class="starter-item" onclick="window.matchProfileModal.useStarter('${starter}')">${starter}</div>`
                                ).join('')}
                            </div>
                        </div>
                        
                        <div class="match-section">
                            <h3 class="match-section-title">
                                <span>👥</span> Connection Info
                            </h3>
                            <div style="color: rgba(255, 255, 255, 0.8);">
                                ${profile.mutualFriends} mutual connections<br>
                                ${profile.lastSeen}<br>
                                Usually responds within a few hours
                            </div>
                        </div>
                    </div>
                    
                    <div class="match-actions-side">
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <button class="match-action-btn primary" onclick="window.matchProfileModal.sendMessage()">
                                <span>💬</span> Send Message
                            </button>
                            <button class="match-action-btn secondary" onclick="window.matchProfileModal.likeProfile()">
                                <span>❤️</span> Super Like
                            </button>
                            <button class="match-action-btn secondary" onclick="window.matchProfileModal.connectUser()">
                                <span>👋</span> Connect
                            </button>
                            <button class="match-action-btn secondary" onclick="window.matchProfileModal.viewFullProfile()">
                                <span>👤</span> Full Profile
                            </button>
                        </div>
                        
                        <div>
                            <h4 style="margin: 0 0 1rem 0; font-size: 0.9rem; color: rgba(255, 255, 255, 0.6);">Quick Actions</h4>
                            <div class="match-quick-actions">
                                <button class="match-quick-action-btn" onclick="window.matchProfileModal.sendReaction('heart')" title="Heart">
                                    ❤️
                                </button>
                                <button class="match-quick-action-btn" onclick="window.matchProfileModal.sendReaction('thumbs-up')" title="Like">
                                    👍
                                </button>
                                <button class="match-quick-action-btn" onclick="window.matchProfileModal.sendReaction('wave')" title="Wave">
                                    👋
                                </button>
                                <button class="match-quick-action-btn" onclick="window.matchProfileModal.sendReaction('fire')" title="Fire">
                                    🔥
                                </button>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <button class="match-action-btn secondary" onclick="window.matchProfileModal.shareProfile()" style="font-size: 0.85rem;">
                                <span>📤</span> Share
                            </button>
                            <button class="match-action-btn secondary" onclick="window.matchProfileModal.saveProfile()" style="font-size: 0.85rem;">
                                <span>⭐</span> Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateConversationStarters(interests, name) {
        const starters = [
            `I noticed you're into ${interests[0] || 'travel'}. What's been your favorite experience so far?`,
            `Hey ${name}! Your profile caught my attention. What's something you're passionate about lately?`,
            `I love that we both enjoy ${interests[1] || 'music'}. Any recent discoveries you'd recommend?`,
            `Your bio mentions ${interests[2] || 'fitness'}. I'm curious about your journey with that!`,
            `${name}, what's something about you that people usually find surprising?`
        ];
        
        return starters.slice(0, 3);
    }

    // Action Methods
    sendMessage() {
        if (this.app && this.app.showToast) {
            this.app.showToast(`Opening conversation with ${this.currentProfile.name}...`, 'info');
        }
        this.closeModal();
    }

    likeProfile() {
        if (this.app && this.app.showToast) {
            this.app.showToast(`Super liked ${this.currentProfile.name}! 💕`, 'success');
        }
    }

    connectUser() {
        if (this.app && this.app.showToast) {
            this.app.showToast(`Connection request sent to ${this.currentProfile.name}!`, 'success');
        }
    }

    viewFullProfile() {
        if (this.app && this.app.showToast) {
            this.app.showToast(`Opening ${this.currentProfile.name}'s full profile...`, 'info');
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

    saveProfile() {
        if (this.app && this.app.showToast) {
            this.app.showToast(`Saved ${this.currentProfile.name} to your favorites!`, 'success');
        }
    }

    viewPhoto(index) {
        if (this.app && this.app.showToast) {
            this.app.showToast(`Viewing photo ${index + 1}...`, 'info');
        }
    }

    useStarter(starter) {
        if (this.app && this.app.showToast) {
            this.app.showToast('Conversation starter copied to clipboard!', 'success');
        }
        
        // Copy to clipboard if available
        if (navigator.clipboard) {
            navigator.clipboard.writeText(starter);
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
window.MatchProfileModal = MatchProfileModal;

// Create global instance
window.matchProfileModal = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const app = window.app || {
        showToast: function(message, type) {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    };
    
    window.matchProfileModal = new MatchProfileModal(app);
    console.log('Match Profile Modal initialized');
});
