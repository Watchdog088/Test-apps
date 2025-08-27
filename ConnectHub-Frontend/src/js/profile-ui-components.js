/**
 * ConnectHub Profile UI Components
 * Advanced profile interface components for comprehensive user profile management
 */

class ProfileUIComponents {
    constructor(app) {
        this.app = app;
        this.currentProfile = null;
        this.privacySettings = new Map();
        this.blockedUsers = new Set();
        this.verificationData = {};
        
        this.initializeProfileComponents();
    }

    /**
     * Initialize all 10 Profile UI components
     */
    initializeProfileComponents() {
        console.log('Initializing all 10 Profile UI Components');
    }

    /**
     * 1. PROFILE PHOTO UPLOAD INTERFACE
     */
    showProfilePhotoUpload() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-camera"></i> Profile Photo Upload</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="photo-upload-content">
                    <div class="current-photo-section" style="text-align: center; margin-bottom: 2rem;">
                        <div style="width: 150px; height: 150px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white;">📷</div>
                        <h4>Current Profile Photo</h4>
                    </div>

                    <div class="photo-upload-options" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                        <button class="btn btn-secondary" onclick="this.uploadViaCamera()">
                            <i class="fas fa-camera"></i> Take Photo
                        </button>
                        <button class="btn btn-secondary" onclick="this.uploadViaGallery()">
                            <i class="fas fa-images"></i> From Gallery
                        </button>
                        <button class="btn btn-secondary" onclick="this.uploadViaBrowse()">
                            <i class="fas fa-folder"></i> Browse Files
                        </button>
                    </div>

                    <div class="photo-editor-section" style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                        <h4><i class="fas fa-magic"></i> Photo Editor</h4>
                        <div style="margin-top: 1rem;">
                            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.5rem; margin-bottom: 1rem;">
                                <button class="btn btn-small btn-secondary">Original</button>
                                <button class="btn btn-small btn-secondary">Vintage</button>
                                <button class="btn btn-small btn-secondary">B&W</button>
                                <button class="btn btn-small btn-secondary">Warm</button>
                                <button class="btn btn-small btn-secondary">Cool</button>
                                <button class="btn btn-small btn-secondary">Sepia</button>
                            </div>
                            
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem;">Brightness</label>
                                <input type="range" style="width: 100%;" min="-50" max="50" value="0">
                            </div>
                            
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem;">Contrast</label>
                                <input type="range" style="width: 100%;" min="-50" max="50" value="0">
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button class="btn btn-primary" onclick="this.saveProfilePhoto()">Save Photo</button>
                    </div>
                </div>
            </div>
        `;

        modal.uploadViaCamera = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Camera access requested', 'info');
            }
        };

        modal.uploadViaGallery = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Gallery opened', 'info');
            }
        };

        modal.uploadViaBrowse = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('File browser opened', 'info');
            }
        };

        modal.saveProfilePhoto = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Profile photo updated!', 'success');
            }
            modal.remove();
        };

        document.body.appendChild(modal);
    }

    /**
     * 2. COVER PHOTO EDITOR INTERFACE
     */
    showCoverPhotoEditor() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-image"></i> Cover Photo Editor</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="cover-editor-content">
                    <div style="width: 100%; height: 200px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 12px; margin-bottom: 2rem; position: relative; overflow: hidden;">
                        <div style="position: absolute; bottom: 1rem; left: 1rem; display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 60px; height: 60px; border-radius: 50%; background: white; border: 3px solid white;"></div>
                            <div style="color: white;">
                                <h4>John Doe</h4>
                                <p>Digital Creator</p>
                            </div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                        <button class="btn btn-secondary">
                            <i class="fas fa-upload"></i> Upload Photo
                        </button>
                        <button class="btn btn-secondary">
                            <i class="fas fa-images"></i> From Gallery
                        </button>
                        <button class="btn btn-secondary">
                            <i class="fas fa-palette"></i> Templates
                        </button>
                    </div>

                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                        <h4>Position & Effects</h4>
                        <div style="margin-top: 1rem;">
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem;">Position X</label>
                                <input type="range" style="width: 100%;" min="-100" max="100" value="0">
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem;">Position Y</label>
                                <input type="range" style="width: 100%;" min="-100" max="100" value="0">
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem;">Scale</label>
                                <input type="range" style="width: 100%;" min="0.5" max="2" step="0.1" value="1">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem;">Overlay Intensity</label>
                                <input type="range" style="width: 100%;" min="0" max="100" value="20">
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button class="btn btn-primary" onclick="this.saveCoverPhoto()">Save Cover Photo</button>
                    </div>
                </div>
            </div>
        `;

        modal.saveCoverPhoto = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Cover photo updated!', 'success');
            }
            modal.remove();
        };

        document.body.appendChild(modal);
    }

    /**
     * 3. BIO EDITOR INTERFACE
     */
    showBioEditor() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-edit"></i> Bio Editor</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="bio-editor-content">
                    <div style="background: var(--glass); border-radius: 12px; padding: 1rem; margin-bottom: 1rem;">
                        <h4>Current Bio</h4>
                        <p style="margin-top: 0.5rem; color: var(--text-secondary);">🌟 Digital creator passionate about connecting people through technology. Love hiking, photography, and discovering new music. Always up for meaningful conversations! 📸✨</p>
                    </div>

                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; background: var(--glass); border-radius: 8px; padding: 0.5rem;">
                            <button class="btn btn-small btn-secondary">
                                <i class="fas fa-bold"></i>
                            </button>
                            <button class="btn btn-small btn-secondary">
                                <i class="fas fa-italic"></i>
                            </button>
                            <button class="btn btn-small btn-secondary">
                                <i class="fas fa-link"></i>
                            </button>
                            <button class="btn btn-small btn-secondary">
                                <i class="fas fa-smile"></i>
                            </button>
                            <button class="btn btn-small btn-secondary">
                                <i class="fas fa-hashtag"></i>
                            </button>
                            <button class="btn btn-small btn-secondary">
                                <i class="fas fa-at"></i>
                            </button>
                        </div>
                        
                        <textarea style="width: 100%; height: 120px; padding: 1rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-primary); resize: vertical;" placeholder="Tell your story... What makes you unique?" maxlength="500"></textarea>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                            <div style="color: var(--text-muted); font-size: 0.9rem;">
                                <span>0</span>/<span>500</span> characters
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-small btn-secondary">🎵 Music lover</button>
                                <button class="btn btn-small btn-secondary">📚 Book enthusiast</button>
                                <button class="btn btn-small btn-secondary">🏃‍♀️ Fitness</button>
                            </div>
                        </div>
                    </div>

                    <div style="background: var(--glass); border-radius: 12px; padding: 1rem; margin-bottom: 2rem;">
                        <h4><i class="fas fa-eye"></i> Bio Visibility</h4>
                        <div style="margin-top: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem;">
                                <input type="radio" name="bio-visibility" value="public" checked style="margin-right: 0.5rem;">
                                <i class="fas fa-globe"></i> Public - Everyone can see
                            </label>
                            <label style="display: block; margin-bottom: 0.5rem;">
                                <input type="radio" name="bio-visibility" value="connections" style="margin-right: 0.5rem;">
                                <i class="fas fa-users"></i> Connections Only
                            </label>
                            <label style="display: block;">
                                <input type="radio" name="bio-visibility" value="private" style="margin-right: 0.5rem;">
                                <i class="fas fa-lock"></i> Private - Only me
                            </label>
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button class="btn btn-secondary">Preview</button>
                        <button class="btn btn-primary" onclick="this.saveBio()">Save Bio</button>
                    </div>
                </div>
            </div>
        `;

        modal.saveBio = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Bio updated successfully!', 'success');
            }
            modal.remove();
        };

        document.body.appendChild(modal);
    }

    /**
     * 4. ACTIVITY TIMELINE INTERFACE
     */
    showActivityTimeline() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-chart-line"></i> Activity Timeline</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="timeline-filters" style="display: flex; gap: 0.5rem; margin-bottom: 2rem; background: var(--glass); padding: 0.5rem; border-radius: 12px;">
                    <button class="btn btn-small btn-primary">All Activity</button>
                    <button class="btn btn-small btn-secondary">Posts</button>
                    <button class="btn btn-small btn-secondary">Social</button>
                    <button class="btn btn-small btn-secondary">Achievements</button>
                    <button class="btn btn-small btn-secondary">Dating</button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                    <div class="stat-card">
                        <div class="stat-number">47</div>
                        <div class="stat-label">Posts Created</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">1,234</div>
                        <div class="stat-label">Interactions</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">89</div>
                        <div class="stat-label">New Connections</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">12</div>
                        <div class="stat-label">Achievements</div>
                    </div>
                </div>

                <div class="timeline-events" style="background: var(--glass); border-radius: 12px; padding: 1.5rem; max-height: 300px; overflow-y: auto;">
                    <div class="timeline-event" style="padding: 1rem; border-left: 3px solid var(--primary); margin-bottom: 1rem; background: var(--bg-card); border-radius: 8px;">
                        <div style="font-weight: 600;">Created a new post</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin: 0.5rem 0;">"Just completed my profile setup! Excited to connect with like-minded professionals..."</div>
                        <div style="color: var(--text-muted); font-size: 0.8rem;">2 hours ago</div>
                    </div>
                    <div class="timeline-event" style="padding: 1rem; border-left: 3px solid var(--secondary); margin-bottom: 1rem; background: var(--bg-card); border-radius: 8px;">
                        <div style="font-weight: 600;">Connected with 5 new people</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin: 0.5rem 0;">Expanded network in Marketing and Technology</div>
                        <div style="color: var(--text-muted); font-size: 0.8rem;">1 day ago</div>
                    </div>
                    <div class="timeline-event" style="padding: 1rem; border-left: 3px solid var(--success); margin-bottom: 1rem; background: var(--bg-card); border-radius: 8px;">
                        <div style="font-weight: 600;">Achievement Unlocked: Content Creator</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin: 0.5rem 0;">Posted 100+ quality content pieces</div>
                        <div style="color: var(--text-muted); font-size: 0.8rem;">3 days ago</div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                    <button class="btn btn-secondary">
                        <i class="fas fa-download"></i> Export Timeline
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-share"></i> Share Activity
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * 5. PHOTO GALLERY GRID INTERFACE
     */
    showPhotoGalleryGrid() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-images"></i> Photo Gallery</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="gallery-controls" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-small btn-primary">
                            <i class="fas fa-th"></i> Grid
                        </button>
                        <button class="btn btn-small btn-secondary">
                            <i class="fas fa-list"></i> List
                        </button>
                        <button class="btn btn-small btn-secondary">
                            <i class="fas fa-columns"></i> Masonry
                        </button>
                    </div>
                    
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary">
                            <i class="fas fa-upload"></i> Add Photos
                        </button>
                        <button class="btn btn-secondary">
                            <i class="fas fa-folder"></i> Create Album
                        </button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1rem;">
                    <div class="stat-card">
                        <div class="stat-number">1,247</div>
                        <div class="stat-label">Photos</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">89</div>
                        <div class="stat-label">Videos</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">24</div>
                        <div class="stat-label">Albums</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">4.2 GB</div>
                        <div class="stat-label">Storage Used</div>
                    </div>
                </div>

                <div class="photo-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; margin-bottom: 2rem; max-height: 300px; overflow-y: auto;">
                    ${Array.from({length: 18}, (_, i) => `
                        <div style="aspect-ratio: 1; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white; cursor: pointer;">📷</div>
                    `).join('')}
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn btn-secondary">
                        <i class="fas fa-share"></i> Share Selected
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * 6. ACHIEVEMENT SHOWCASE INTERFACE
     */
    showAchievementShowcase() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-trophy"></i> Achievement Showcase</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                    <div class="stat-card">
                        <div class="stat-number">24</div>
                        <div class="stat-label">Total Achievements</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">68%</div>
                        <div class="stat-label">Completion Rate</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">Creator</div>
                        <div class="stat-label">Latest Badge</div>
                    </div>
                </div>

                <div style="display: flex; gap: 0.5rem; margin-bottom: 2rem; background: var(--glass); padding: 0.5rem; border-radius: 12px;">
                    <button class="btn btn-small btn-primary">Earned (24)</button>
                    <button class="btn btn-small btn-secondary">In Progress (8)</button>
                    <button class="btn btn-small btn-secondary">Locked (12)</button>
                    <button class="btn btn-small btn-secondary">Featured</button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem; max-height: 300px; overflow-y: auto;">
                    <div class="achievement-badge" style="background: var(--glass); border-radius: 12px; padding: 1rem; display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 50px; height: 50px; background: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                            <i class="fas fa-check-circle" style="color: white;"></i>
                        </div>
                        <div>
                            <div style="font-weight: 600;">Verified</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Account verified</div>
                            <div style="color: var(--success); font-size: 0.8rem;">Earned</div>
                        </div>
                    </div>

                    <div class="achievement-badge" style="background: var(--glass); border-radius: 12px; padding: 1rem; display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 50px; height: 50px; background: var(--secondary); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                            <i class="fas fa-paint-brush" style="color: white;"></i>
                        </div>
                        <div>
                            <div style="font-weight: 600;">Content Creator</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Posted 100+ quality content</div>
                            <div style="color: var(--success); font-size: 0.8rem;">Earned</div>
                        </div>
                    </div>

                    <div class="achievement-badge" style="background: var(--glass); border-radius: 12px; padding: 1rem; display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 50px; height: 50px; background: var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                            <i class="fas fa-users" style="color: white;"></i>
                        </div>
                        <div>
                            <div style="font-weight: 600;">Social Butterfly</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">1K+ connections made</div>
                            <div style="color: var(--success); font-size: 0.8rem;">Earned</div>
                        </div>
                    </div>

                    <div class="achievement-badge" style="background: var(--glass); border-radius: 12px; padding: 1rem; display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 50px; height: 50px; background: var(--warning); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                            <i class="fas fa-star" style="color: white;"></i>
                        </div>
                        <div>
                            <div style="font-weight: 600;">Influencer</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">10K+ followers needed</div>
                            <div style="color: var(--warning); font-size: 0.8rem;">78% Complete</div>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn btn-secondary">
                        <i class="fas fa-share"></i> Share Achievements
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * 7. PRIVACY SETTINGS PANEL INTERFACE
     */
    showPrivacySettingsPanel() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-shield-alt"></i> Privacy Settings</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="privacy-sections">
                    <div class="privacy-section" style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h4><i class="fas fa-eye"></i> Profile Visibility</h4>
                        <div style="margin-top: 1rem;">
                            <label style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                                <span>Public Profile</span>
                                <input type="checkbox" checked>
                            </label>
                            <label style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                                <span>Show Online Status</span>
                                <input type="checkbox" checked>
                            </label>
                            <label style="display: flex; align-items: center; justify-content: space-between;">
                                <span>Show Activity Status</span>
                                <input type="checkbox">
                            </label>
                        </div>
                    </div>

                    <div class="privacy-section" style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h4><i class="fas fa-users"></i> Contact & Discovery</h4>
                        <div style="margin-top: 1rem;">
                            <label style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                                <span>Allow Messages from Anyone</span>
                                <input type="checkbox">
                            </label>
                            <label style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                                <span>Show in Search Results</span>
                                <input type="checkbox" checked>
                            </label>
                            <label style="display: flex; align-items: center; justify-content: space-between;">
                                <span>Allow Friend Suggestions</span>
                                <input type="checkbox" checked>
                            </label>
                        </div>
                    </div>

                    <div class="privacy-section" style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h4><i class="fas fa-bell"></i> Data & Analytics</h4>
                        <div style="margin-top: 1rem;">
                            <label style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                                <span>Allow Analytics Tracking</span>
                                <input type="checkbox" checked>
                            </label>
                            <label style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                                <span>Personalized Recommendations</span>
                                <input type="checkbox" checked>
                            </label>
                            <label style="display: flex; align-items: center; justify-content: space-between;">
                                <span>Share Activity with Partners</span>
                                <input type="checkbox">
                            </label>
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button class="btn btn-primary" onclick="this.savePrivacySettings()">Save Settings</button>
                    </div>
                </div>
            </div>
        `;

        modal.savePrivacySettings = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Privacy settings updated!', 'success');
            }
            modal.remove();
        };

        document.body.appendChild(modal);
    }

    /**
     * 8. PROFILE VERIFICATION INTERFACE
     */
    showProfileVerification() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-check-circle"></i> Profile Verification</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="verification-steps">
                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h4>Verification Benefits</h4>
                        <ul style="margin: 1rem 0; color: var(--text-secondary);">
                            <li>✅ Verified badge on your profile</li>
                            <li>✅ Increased trust and credibility</li>
                            <li>✅ Higher visibility in search results</li>
                            <li>✅ Access to premium features</li>
                        </ul>
                    </div>

                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h4>Step 1: Identity Verification</h4>
                        <div style="margin-top: 1rem;">
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                                <button class="btn btn-secondary">
                                    <i class="fas fa-id-card"></i> Upload ID Document
                                </button>
                                <button class="btn btn-secondary">
                                    <i class="fas fa-passport"></i> Upload Passport
                                </button>
                            </div>
                            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">
                                Upload a clear photo of your government-issued ID
                            </p>
                        </div>
                    </div>

                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h4>Step 2: Phone Verification</h4>
                        <div style="margin-top: 1rem;">
                            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                                <input type="tel" placeholder="+1 (555) 123-4567" style="flex: 1; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                                <button class="btn btn-primary">Send Code</button>
                            </div>
                            <input type="text" placeholder="Enter verification code" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                        </div>
                    </div>

                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h4>Step 3: Email Verification</h4>
                        <div style="margin-top: 1rem;">
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <span style="color: var(--success);"><i class="fas fa-check-circle"></i></span>
                                <span>john.doe@example.com</span>
                                <span style="color: var(--success); font-size: 0.9rem;">Verified</span>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button class="btn btn-primary" onclick="this.submitVerification()">Submit Verification</button>
                    </div>
                </div>
            </div>
        `;

        modal.submitVerification = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Verification request submitted!', 'success');
            }
            modal.remove();
        };

        document.body.appendChild(modal);
    }

    /**
     * 9. PROFILE ANALYTICS INTERFACE
     */
    showProfileAnalytics() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-chart-bar"></i> Profile Analytics</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="analytics-content">
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                        <div class="stat-card">
                            <div class="stat-number">2,847</div>
                            <div class="stat-label">Profile Views</div>
                            <div style="color: var(--success); font-size: 0.8rem;">↑ +12%</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">156</div>
                            <div class="stat-label">Connection Requests</div>
                            <div style="color: var(--success); font-size: 0.8rem;">↑ +8%</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">89</div>
                            <div class="stat-label">Message Conversations</div>
                            <div style="color: var(--warning); font-size: 0.8rem;">↓ -3%</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">4.8</div>
                            <div class="stat-label">Profile Rating</div>
                            <div style="color: var(--success); font-size: 0.8rem;">↑ +0.2</div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <h4>Profile Views (Last 30 Days)</h4>
                            <div style="height: 200px; display: flex; align-items: end; justify-content: space-between; margin-top: 1rem;">
                                ${Array.from({length: 30}, (_, i) => `
                                    <div style="width: 8px; height: ${Math.random() * 150 + 20}px; background: var(--primary); border-radius: 2px;"></div>
                                `).join('')}
                            </div>
                        </div>

                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <h4>Top Profile Sections</h4>
                            <div style="margin-top: 1rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                    <span>Photos</span>
                                    <span style="color: var(--primary);">43%</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                    <span>Bio</span>
                                    <span style="color: var(--secondary);">28%</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                    <span>Activity</span>
                                    <span style="color: var(--accent);">19%</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span>Achievements</span>
                                    <span style="color: var(--warning);">10%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                        <h4>Audience Demographics</h4>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
                            <div>
                                <h5>Age Groups</h5>
                                <div style="margin-top: 0.5rem;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                        <span>18-24</span><span>23%</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                        <span>25-34</span><span>41%</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                        <span>35-44</span><span>28%</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span>45+</span><span>8%</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h5>Locations</h5>
                                <div style="margin-top: 0.5rem;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                        <span>New York</span><span>34%</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                        <span>California</span><span>26%</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                        <span>Texas</span><span>18%</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span>Other</span><span>22%</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h5>Interests</h5>
                                <div style="margin-top: 0.5rem;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                        <span>Technology</span><span>45%</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                        <span>Photography</span><span>32%</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                        <span>Music</span><span>28%</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span>Travel</span><span>21%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button class="btn btn-secondary">
                            <i class="fas fa-download"></i> Export Report
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * 10. BLOCKED USERS MANAGEMENT INTERFACE
     */
    showBlockedUsersManagement() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-ban"></i> Blocked Users Management</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="blocked-users-content">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <div>
                            <h4>Blocked Users (3)</h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem;">Users you've blocked won't be able to contact you or see your profile</p>
                        </div>
                        <button class="btn btn-secondary">
                            <i class="fas fa-plus"></i> Block User
                        </button>
                    </div>

                    <div class="blocked-users-list" style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                        <div class="blocked-user-item" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-bottom: 1px solid var(--glass-border); margin-bottom: 1rem;">
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--warning) 0%, var(--error) 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                                    AB
                                </div>
                                <div>
                                    <div style="font-weight: 600;">Alex Brown</div>
                                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Blocked 2 weeks ago</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-small btn-secondary" onclick="this.viewBlockReason()">
                                    <i class="fas fa-info"></i>
                                </button>
                                <button class="btn btn-small btn-primary" onclick="this.unblockUser('Alex Brown')">
                                    Unblock
                                </button>
                            </div>
                        </div>

                        <div class="blocked-user-item" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-bottom: 1px solid var(--glass-border); margin-bottom: 1rem;">
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--error) 0%, var(--warning) 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                                    SC
                                </div>
                                <div>
                                    <div style="font-weight: 600;">Sarah Connor</div>
                                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Blocked 1 month ago</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-small btn-secondary" onclick="this.viewBlockReason()">
                                    <i class="fas fa-info"></i>
                                </button>
                                <button class="btn btn-small btn-primary" onclick="this.unblockUser('Sarah Connor')">
                                    Unblock
                                </button>
                            </div>
                        </div>

                        <div class="blocked-user-item" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem;">
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--secondary) 0%, var(--error) 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                                    MJ
                                </div>
                                <div>
                                    <div style="font-weight: 600;">Mike Johnson</div>
                                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Blocked 3 months ago</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-small btn-secondary" onclick="this.viewBlockReason()">
                                    <i class="fas fa-info"></i>
                                </button>
                                <button class="btn btn-small btn-primary" onclick="this.unblockUser('Mike Johnson')">
                                    Unblock
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                        <h4><i class="fas fa-shield-alt"></i> Block Settings</h4>
                        <div style="margin-top: 1rem;">
                            <label style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                                <span>Automatically block users reported multiple times</span>
                                <input type="checkbox" checked>
                            </label>
                            <label style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                                <span>Block users with no profile photo</span>
                                <input type="checkbox">
                            </label>
                            <label style="display: flex; align-items: center; justify-content: space-between;">
                                <span>Block users with incomplete profiles</span>
                                <input type="checkbox">
                            </label>
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button class="btn btn-secondary" onclick="this.exportBlockList()">
                            <i class="fas fa-download"></i> Export List
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;

        modal.viewBlockReason = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Block reason: Inappropriate messages', 'info');
            }
        };

        modal.unblockUser = (userName) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`${userName} has been unblocked`, 'success');
            }
        };

        modal.exportBlockList = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Block list exported successfully', 'success');
            }
        };

        document.body.appendChild(modal);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileUIComponents;
}
