/**
 * Dating Comprehensive Missing UI Components
 * 3 Critical Missing Dating Interface Implementations
 * 
 * This file implements the exact 3 missing UIs identified in the detailed breakdown:
 * 1. Dating Profile Setup Wizard - Complete step-by-step profile building system
 * 2. Super Like/Boost Features - Premium interaction features with effects and purchasing
 * 3. Date Scheduling Interface - Comprehensive date scheduling and planning tools
 * 
 * Author: Dating Features Development Team
 * Version: 2.0.0 - Comprehensive Implementation
 */

class DatingComprehensiveMissingUI {
    constructor() {
        this.profileSetupStep = 0;
        this.maxProfileSteps = 6;
        this.profileData = {
            photos: [],
            bio: '',
            interests: [],
            preferences: {},
            verification: false,
            occupation: '',
            education: ''
        };
        this.superLikeCount = 1; // Free super likes
        this.boostCount = 0; // Premium boosts
        this.dateScheduling = {
            selectedDate: null,
            selectedTime: null,
            selectedLocation: null,
            currentMatch: null,
            preferences: {}
        };
        
        this.init();
    }

    init() {
        console.log('Dating Comprehensive Missing UI Components initialized');
        this.setupGlobalEventListeners();
        this.loadUserData();
    }

    setupGlobalEventListeners() {
        // Close modals on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Close modals on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('dating-comprehensive-overlay')) {
                this.closeModal(e.target.closest('.dating-comprehensive-modal'));
            }
        });
    }

    loadUserData() {
        // Load existing user profile data
        const saved = localStorage.getItem('datingProfileData');
        if (saved) {
            this.profileData = { ...this.profileData, ...JSON.parse(saved) };
        }
    }

    saveUserData() {
        localStorage.setItem('datingProfileData', JSON.stringify(this.profileData));
    }

    closeAllModals() {
        document.querySelectorAll('.dating-comprehensive-modal.active').forEach(modal => {
            this.closeModal(modal);
        });
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    // ==========================================
    // 1. DATING PROFILE SETUP WIZARD
    // Complete step-by-step profile building system
    // ==========================================

    showDatingProfileSetupWizard() {
        this.profileSetupStep = 0;
        
        const modal = document.createElement('div');
        modal.className = 'dating-comprehensive-modal profile-setup-wizard active';
        modal.innerHTML = `
            <div class="dating-comprehensive-overlay">
                <div class="dating-comprehensive-content profile-setup-content">
                    <div class="setup-wizard-header">
                        <h2>💕 Create Your Dating Profile</h2>
                        <p>Let's build an amazing profile that represents the real you</p>
                        <div class="wizard-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${((this.profileSetupStep + 1) / this.maxProfileSteps) * 100}%"></div>
                            </div>
                            <span class="progress-text">Step ${this.profileSetupStep + 1} of ${this.maxProfileSteps}</span>
                        </div>
                        <button class="wizard-close-btn" onclick="datingComprehensiveUI.confirmExitWizard()">×</button>
                    </div>
                    
                    <div class="wizard-steps-container" id="wizardStepsContainer">
                        ${this.renderWizardStep(0)}
                    </div>
                    
                    <div class="wizard-navigation">
                        <button class="btn btn-secondary" id="wizardBackBtn" 
                                onclick="datingComprehensiveUI.previousWizardStep()" 
                                style="display: ${this.profileSetupStep === 0 ? 'none' : 'block'}">
                            ← Previous
                        </button>
                        <button class="btn btn-primary" id="wizardNextBtn" 
                                onclick="datingComprehensiveUI.nextWizardStep()">
                            ${this.profileSetupStep === this.maxProfileSteps - 1 ? 'Complete Profile 🎉' : 'Continue →'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.initializeCurrentStep();
    }

    renderWizardStep(step) {
        const steps = {
            0: this.renderWelcomeStep(),
            1: this.renderPhotosStep(),
            2: this.renderBioStep(),
            3: this.renderInterestsStep(),
            4: this.renderPreferencesStep(),
            5: this.renderVerificationStep()
        };

        return steps[step] || '';
    }

    renderWelcomeStep() {
        return `
            <div class="wizard-step welcome-step">
                <div class="welcome-content">
                    <div class="welcome-icon">👋</div>
                    <h3>Welcome to ConnectHub Dating!</h3>
                    <p>We'll help you create an amazing profile that attracts the right people. This should take about 5-10 minutes.</p>
                    
                    <div class="setup-benefits">
                        <h4>What you'll get:</h4>
                        <div class="benefit-list">
                            <div class="benefit-item">
                                <i class="fas fa-heart"></i>
                                <span>Better quality matches</span>
                            </div>
                            <div class="benefit-item">
                                <i class="fas fa-eye"></i>
                                <span>More profile views</span>
                            </div>
                            <div class="benefit-item">
                                <i class="fas fa-shield-check"></i>
                                <span>Verified profile badge</span>
                            </div>
                            <div class="benefit-item">
                                <i class="fas fa-star"></i>
                                <span>Premium features access</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="setup-stats">
                        <div class="stat-card">
                            <div class="stat-number">3x</div>
                            <div class="stat-label">More matches with complete profiles</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">85%</div>
                            <div class="stat-label">Response rate with good photos</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPhotosStep() {
        return `
            <div class="wizard-step photos-step">
                <div class="step-header">
                    <h3>📸 Add Your Best Photos</h3>
                    <p>Upload 4-6 photos that show your personality. The first photo will be your main profile picture.</p>
                </div>
                
                <div class="photo-upload-grid">
                    <div class="main-photo-slot ${this.profileData.photos.length > 0 ? 'has-photo' : ''}" 
                         onclick="datingComprehensiveUI.uploadPhoto(0, true)">
                        ${this.profileData.photos[0] ? `
                            <div class="uploaded-photo">${this.profileData.photos[0]}</div>
                            <div class="photo-overlay">
                                <button class="photo-action-btn" onclick="event.stopPropagation(); datingComprehensiveUI.removePhoto(0)">×</button>
                            </div>
                        ` : `
                            <div class="photo-placeholder">
                                <i class="fas fa-camera"></i>
                                <span>Main Photo</span>
                                <small>Required</small>
                            </div>
                        `}
                    </div>
                    
                    ${Array.from({length: 5}, (_, i) => {
                        const index = i + 1;
                        return `
                            <div class="photo-slot ${this.profileData.photos.length > index ? 'has-photo' : ''}" 
                                 onclick="datingComprehensiveUI.uploadPhoto(${index})">
                                ${this.profileData.photos[index] ? `
                                    <div class="uploaded-photo">${this.profileData.photos[index]}</div>
                                    <div class="photo-overlay">
                                        <button class="photo-action-btn" onclick="event.stopPropagation(); datingComprehensiveUI.removePhoto(${index})">×</button>
                                    </div>
                                ` : `
                                    <div class="photo-placeholder">
                                        <i class="fas fa-plus"></i>
                                        <span>Add Photo</span>
                                    </div>
                                `}
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="photo-tips">
                    <h4>📋 Photo Tips</h4>
                    <div class="tips-grid">
                        <div class="tip-item">
                            <i class="fas fa-smile"></i>
                            <span>Smile genuinely</span>
                        </div>
                        <div class="tip-item">
                            <i class="fas fa-eye"></i>
                            <span>Make eye contact</span>
                        </div>
                        <div class="tip-item">
                            <i class="fas fa-sun"></i>
                            <span>Good lighting</span>
                        </div>
                        <div class="tip-item">
                            <i class="fas fa-user-friends"></i>
                            <span>Show hobbies</span>
                        </div>
                        <div class="tip-item">
                            <i class="fas fa-ban"></i>
                            <span>No group photos as main</span>
                        </div>
                        <div class="tip-item">
                            <i class="fas fa-image"></i>
                            <span>High resolution</span>
                        </div>
                    </div>
                </div>
                
                <div class="photo-guidelines">
                    <div class="guideline-item">
                        <strong>Do:</strong> Use recent photos (within 1 year)
                    </div>
                    <div class="guideline-item">
                        <strong>Don't:</strong> Use heavily filtered or misleading photos
                    </div>
                </div>
            </div>
        `;
    }

    renderBioStep() {
        return `
            <div class="wizard-step bio-step">
                <div class="step-header">
                    <h3>✍️ Write Your Bio</h3>
                    <p>Tell potential matches about yourself. Be authentic and interesting!</p>
                </div>
                
                <div class="bio-editor">
                    <div class="bio-input-container">
                        <textarea id="bioTextarea" placeholder="Tell people about yourself... What makes you unique? What are you passionate about? What kind of connection are you looking for?" 
                                  maxlength="500" oninput="datingComprehensiveUI.updateBioCounter()">${this.profileData.bio}</textarea>
                        <div class="bio-counter">
                            <span id="bioCharCount">${this.profileData.bio.length}</span>/500 characters
                        </div>
                    </div>
                    
                    <div class="bio-suggestions">
                        <h4>💡 Bio Suggestions</h4>
                        <div class="suggestion-buttons">
                            <button class="suggestion-btn" onclick="datingComprehensiveUI.addBioSuggestion('interests')">
                                Add Interests
                            </button>
                            <button class="suggestion-btn" onclick="datingComprehensiveUI.addBioSuggestion('goals')">
                                Relationship Goals
                            </button>
                            <button class="suggestion-btn" onclick="datingComprehensiveUI.addBioSuggestion('humor')">
                                Add Humor
                            </button>
                            <button class="suggestion-btn" onclick="datingComprehensiveUI.addBioSuggestion('lifestyle')">
                                Lifestyle
                            </button>
                        </div>
                    </div>
                    
                    <div class="bio-examples">
                        <h4>✨ Good Bio Examples</h4>
                        <div class="example-bios">
                            <div class="example-bio">
                                <p>"Weekend warrior who loves hiking trails and trying new coffee shops. Looking for someone who can keep up with my adventures and isn't afraid of terrible puns!"</p>
                                <small>Good: Shows interests, personality, and what they want</small>
                            </div>
                            <div class="example-bio">
                                <p>"Marketing professional by day, amateur chef by night. I believe the best conversations happen over good food. Let's explore the city together!"</p>
                                <small>Good: Professional + personal interests, clear invitation</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bio-analysis" id="bioAnalysis">
                    <div class="analysis-item">
                        <span class="analysis-label">Personality:</span>
                        <span class="analysis-value" id="personalityScore">Add more personality!</span>
                    </div>
                    <div class="analysis-item">
                        <span class="analysis-label">Interests:</span>
                        <span class="analysis-value" id="interestsScore">Mention specific interests</span>
                    </div>
                    <div class="analysis-item">
                        <span class="analysis-label">Clarity:</span>
                        <span class="analysis-value" id="clarityScore">Be more specific</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderInterestsStep() {
        const availableInterests = [
            'Travel', 'Music', 'Sports', 'Art', 'Technology', 'Food', 'Movies', 'Books',
            'Fitness', 'Photography', 'Gaming', 'Dancing', 'Hiking', 'Cooking', 'Fashion',
            'Science', 'Business', 'Yoga', 'Wine', 'Beer', 'Coffee', 'Tea', 'Pets',
            'Volunteering', 'Meditation', 'Writing', 'Design', 'Cars', 'Motorcycles',
            'Gardening', 'DIY', 'History', 'Politics', 'Environment', 'Spirituality'
        ];

        return `
            <div class="wizard-step interests-step">
                <div class="step-header">
                    <h3>🎯 Select Your Interests</h3>
                    <p>Choose 5-15 interests that represent you. This helps us find compatible matches.</p>
                </div>
                
                <div class="interests-selection">
                    <div class="selected-interests">
                        <h4>Your Selected Interests (${this.profileData.interests.length})</h4>
                        <div class="selected-interests-container" id="selectedInterests">
                            ${this.profileData.interests.map(interest => `
                                <span class="selected-interest-tag" onclick="datingComprehensiveUI.removeInterest('${interest}')">
                                    ${interest} ×
                                </span>
                            `).join('')}
                            ${this.profileData.interests.length === 0 ? '<p class="no-interests">No interests selected yet</p>' : ''}
                        </div>
                    </div>
                    
                    <div class="interest-categories">
                        <div class="search-interests">
                            <input type="text" id="interestSearch" placeholder="Search interests..." 
                                   oninput="datingComprehensiveUI.filterInterests()" class="interest-search-input">
                        </div>
                        
                        <div class="available-interests" id="availableInterests">
                            ${availableInterests.map(interest => `
                                <button class="interest-option ${this.profileData.interests.includes(interest) ? 'selected' : ''}" 
                                        onclick="datingComprehensiveUI.toggleInterest('${interest}')">
                                    ${interest}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="interests-recommendations" id="interestRecommendations">
                        <h4>💡 Recommended Based on Your Profile</h4>
                        <div class="recommended-interests">
                            <button class="interest-option recommended" onclick="datingComprehensiveUI.toggleInterest('Coffee')">
                                ☕ Coffee
                            </button>
                            <button class="interest-option recommended" onclick="datingComprehensiveUI.toggleInterest('Travel')">
                                ✈️ Travel
                            </button>
                            <button class="interest-option recommended" onclick="datingComprehensiveUI.toggleInterest('Photography')">
                                📸 Photography
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="interests-impact">
                    <div class="impact-stats">
                        <div class="stat">
                            <span class="stat-value">${this.calculateMatchPotential()}%</span>
                            <span class="stat-label">Match Potential</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${this.profileData.interests.length * 150}</span>
                            <span class="stat-label">Potential Weekly Views</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPreferencesStep() {
        return `
            <div class="wizard-step preferences-step">
                <div class="step-header">
                    <h3>💝 Dating Preferences</h3>
                    <p>Help us find people you're most likely to connect with</p>
                </div>
                
                <div class="preferences-form">
                    <div class="preference-section">
                        <h4>👤 Looking For</h4>
                        <div class="preference-options">
                            <label class="preference-option">
                                <input type="radio" name="lookingFor" value="relationship" ${this.profileData.preferences.lookingFor === 'relationship' ? 'checked' : ''}>
                                <span>Long-term relationship</span>
                            </label>
                            <label class="preference-option">
                                <input type="radio" name="lookingFor" value="dating" ${this.profileData.preferences.lookingFor === 'dating' ? 'checked' : ''}>
                                <span>Dating and see where it goes</span>
                            </label>
                            <label class="preference-option">
                                <input type="radio" name="lookingFor" value="friends" ${this.profileData.preferences.lookingFor === 'friends' ? 'checked' : ''}>
                                <span>New friends and connections</span>
                            </label>
                            <label class="preference-option">
                                <input type="radio" name="lookingFor" value="casual" ${this.profileData.preferences.lookingFor === 'casual' ? 'checked' : ''}>
                                <span>Something casual</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="preference-section">
                        <h4>📍 Distance Range</h4>
                        <div class="range-control">
                            <input type="range" id="distanceRange" min="1" max="100" value="${this.profileData.preferences.maxDistance || 25}" 
                                   oninput="datingComprehensiveUI.updateDistancePreference(this.value)">
                            <div class="range-display">
                                <span id="distanceValue">${this.profileData.preferences.maxDistance || 25}</span> miles
                            </div>
                        </div>
                    </div>
                    
                    <div class="preference-section">
                        <h4>🎂 Age Range</h4>
                        <div class="age-range-control">
                            <div class="age-input">
                                <label>From</label>
                                <input type="number" id="minAge" min="18" max="65" value="${this.profileData.preferences.minAge || 18}" 
                                       onchange="datingComprehensiveUI.updateAgePreference()">
                            </div>
                            <div class="age-input">
                                <label>To</label>
                                <input type="number" id="maxAge" min="18" max="65" value="${this.profileData.preferences.maxAge || 35}" 
                                       onchange="datingComprehensiveUI.updateAgePreference()">
                            </div>
                        </div>
                    </div>
                    
                    <div class="preference-section">
                        <h4>🎓 Education Preference</h4>
                        <select id="educationPref" onchange="datingComprehensiveUI.updatePreference('education', this.value)">
                            <option value="any">Any education level</option>
                            <option value="high_school">High school or above</option>
                            <option value="college">College or above</option>
                            <option value="graduate">Graduate degree preferred</option>
                        </select>
                    </div>
                    
                    <div class="preference-section">
                        <h4>🚭 Lifestyle Preferences</h4>
                        <div class="lifestyle-prefs">
                            <div class="lifestyle-item">
                                <label>Smoking</label>
                                <select onchange="datingComprehensiveUI.updatePreference('smoking', this.value)">
                                    <option value="any">No preference</option>
                                    <option value="never">Non-smoker only</option>
                                    <option value="sometimes">Occasional is okay</option>
                                </select>
                            </div>
                            <div class="lifestyle-item">
                                <label>Drinking</label>
                                <select onchange="datingComprehensiveUI.updatePreference('drinking', this.value)">
                                    <option value="any">No preference</option>
                                    <option value="never">Non-drinker only</option>
                                    <option value="social">Social drinking okay</option>
                                    <option value="regular">Regular drinking okay</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="preferences-preview">
                    <h4>🎯 Your Match Criteria</h4>
                    <div class="criteria-summary" id="criteriaSummary">
                        Looking for people within ${this.profileData.preferences.maxDistance || 25} miles, 
                        ages ${this.profileData.preferences.minAge || 18}-${this.profileData.preferences.maxAge || 35}
                    </div>
                </div>
            </div>
        `;
    }

    renderVerificationStep() {
        return `
            <div class="wizard-step verification-step">
                <div class="step-header">
                    <h3>🛡️ Profile Verification</h3>
                    <p>Get verified to increase trust and get 3x more matches</p>
                </div>
                
                <div class="verification-benefits">
                    <div class="benefit-card">
                        <i class="fas fa-shield-check"></i>
                        <h4>Verification Badge</h4>
                        <p>Stand out with a blue checkmark on your profile</p>
                    </div>
                    <div class="benefit-card">
                        <i class="fas fa-heart"></i>
                        <h4>More Matches</h4>
                        <p>Verified profiles get 300% more likes</p>
                    </div>
                    <div class="benefit-card">
                        <i class="fas fa-comments"></i>
                        <h4>Better Conversations</h4>
                        <p>85% response rate for verified users</p>
                    </div>
                </div>
                
                <div class="verification-process">
                    <h4>📋 Verification Steps</h4>
                    <div class="verification-steps">
                        <div class="verification-item">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h5>Photo Verification</h5>
                                <p>Take a selfie to confirm you match your profile photos</p>
                                <button class="btn btn-primary btn-small" onclick="datingComprehensiveUI.startPhotoVerification()">
                                    📸 Start Photo Verification
                                </button>
                            </div>
                        </div>
                        
                        <div class="verification-item">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h5>Phone Verification</h5>
                                <p>Verify your phone number for account security</p>
                                <button class="btn btn-secondary btn-small" onclick="datingComprehensiveUI.startPhoneVerification()">
                                    📱 Verify Phone
                                </button>
                            </div>
                        </div>
                        
                        <div class="verification-item optional">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <h5>Social Media Link (Optional)</h5>
                                <p>Link Instagram or Facebook to show authenticity</p>
                                <button class="btn btn-outline btn-small" onclick="datingComprehensiveUI.linkSocialMedia()">
                                    🔗 Link Accounts
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="verification-status">
                    <div class="status-display ${this.profileData.verification ? 'verified' : 'pending'}">
                        <i class="${this.profileData.verification ? 'fas fa-shield-check' : 'fas fa-shield-exclamation'}"></i>
                        <span>${this.profileData.verification ? 'Profile Verified!' : 'Verification Pending'}</span>
                    </div>
                </div>
                
                <div class="skip-option">
                    <button class="btn btn-text" onclick="datingComprehensiveUI.skipVerification()">
                        Skip for now (can verify later)
                    </button>
                </div>
            </div>
        `;
    }

    // Wizard navigation methods
    nextWizardStep() {
        if (!this.validateCurrentStep()) {
            return;
        }

        if (this.profileSetupStep < this.maxProfileSteps - 1) {
            this.profileSetupStep++;
        } else {
            this.completeProfileSetup();
            return;
        }

        this.updateWizardStep();
    }

    previousWizardStep() {
        if (this.profileSetupStep > 0) {
            this.profileSetupStep--;
            this.updateWizardStep();
        }
    }

    updateWizardStep() {
        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${((this.profileSetupStep + 1) / this.maxProfileSteps) * 100}%`;
        }
        if (progressText) {
            progressText.textContent = `Step ${this.profileSetupStep + 1} of ${this.maxProfileSteps}`;
        }

        // Update step content
        const container = document.getElementById('wizardStepsContainer');
        if (container) {
            container.innerHTML = this.renderWizardStep(this.profileSetupStep);
            this.initializeCurrentStep();
        }

        // Update navigation buttons
        const backBtn = document.getElementById('wizardBackBtn');
        const nextBtn = document.getElementById('wizardNextBtn');
        
        if (backBtn) {
            backBtn.style.display = this.profileSetupStep === 0 ? 'none' : 'block';
        }
        if (nextBtn) {
            nextBtn.textContent = this.profileSetupStep === this.maxProfileSteps - 1 ? 'Complete Profile 🎉' : 'Continue →';
        }
    }

    initializeCurrentStep() {
        // Initialize any step-specific functionality
        if (this.profileSetupStep === 2) { // Bio step
            this.updateBioCounter();
        }
    }

    validateCurrentStep() {
        switch (this.profileSetupStep) {
            case 1: // Photos
                if (this.profileData.photos.length === 0) {
                    this.showToast('Please upload at least one photo to continue', 'warning');
                    return false;
                }
                return true;
            case 2: // Bio
                const bioText = document.getElementById('bioTextarea')?.value || '';
                if (bioText.length < 20) {
                    this.showToast('Please write a bio with at least 20 characters', 'warning');
                    return false;
                }
                this.profileData.bio = bioText;
                return true;
            case 3: // Interests
                if (this.profileData.interests.length < 3) {
                    this.showToast('Please select at least 3 interests', 'warning');
                    return false;
                }
                return true;
            default:
                return true;
        }
    }

    completeProfileSetup() {
        this.saveUserData();
        this.showToast('Profile setup completed! 🎉', 'success');
        this.closeAllModals();
        setTimeout(() => this.showProfileCompletionCelebration(), 500);
    }

    showProfileCompletionCelebration() {
        const modal = document.createElement('div');
        modal.className = 'dating-comprehensive-modal profile-completion-modal active';
        modal.innerHTML = `
            <div class="dating-comprehensive-overlay">
                <div class="dating-comprehensive-content completion-content">
                    <div class="completion-celebration">
                        <div class="celebration-icon">🎉</div>
                        <h2>Profile Complete!</h2>
                        <p>Your dating profile is now live and ready to attract amazing matches</p>
                    </div>
                    
                    <div class="completion-stats">
                        <div class="stat-preview">
                            <div class="stat-item">
                                <span class="stat-number">3x</span>
                                <span class="stat-label">More likely to get matches</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">95%</span>
                                <span class="stat-label">Profile completeness</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="next-steps">
                        <h3>🚀 Ready to Start Dating?</h3>
                        <div class="action-cards">
                            <button class="action-card" onclick="datingComprehensiveUI.startSwiping()">
                                <i class="fas fa-heart"></i>
                                <h4>Start Swiping</h4>
                                <p>Find your perfect match</p>
                            </button>
                            <button class="action-card" onclick="datingComprehensiveUI.showBoostOptions()">
                                <i class="fas fa-rocket"></i>
                                <h4>Boost Your Profile</h4>
                                <p>Get seen by more people</p>
                            </button>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" onclick="datingComprehensiveUI.closeModal(document.querySelector('.profile-completion-modal'))">
                        Start Dating! 💕
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Profile Setup Helper Methods
    uploadPhoto(index, isMain = false) {
        // Simulate photo upload
        const photoEmojis = ['😊', '🌟', '📸', '🎉', '✨', '💫'];
        const randomPhoto = photoEmojis[Math.floor(Math.random() * photoEmojis.length)];
        
        if (this.profileData.photos.length <= index) {
            this.profileData.photos[index] = randomPhoto;
        } else {
            this.profileData.photos[index] = randomPhoto;
        }
        
        this.showToast(`Photo ${isMain ? '(main)' : ''} uploaded!`, 'success');
        this.updateWizardStep();
    }

    removePhoto(index) {
        this.profileData.photos.splice(index, 1);
        this.updateWizardStep();
    }

    updateBioCounter() {
        const textarea = document.getElementById('bioTextarea');
        const counter = document.getElementById('bioCharCount');
        
        if (textarea && counter) {
            const length = textarea.value.length;
            counter.textContent = length;
            this.profileData.bio = textarea.value;
            this.analyzeBio(textarea.value);
        }
    }

    analyzeBio(bioText) {
        const personalityScore = bioText.includes('I ') || bioText.includes('my ') ? 'Good!' : 'Add more personality!';
        const interestsScore = bioText.length > 50 ? 'Good!' : 'Mention specific interests';
        const clarityScore = bioText.length > 100 ? 'Clear and detailed' : 'Be more specific';
        
        const personalityEl = document.getElementById('personalityScore');
        const interestsEl = document.getElementById('interestsScore');
        const clarityEl = document.getElementById('clarityScore');
        
        if (personalityEl) personalityEl.textContent = personalityScore;
        if (interestsEl) interestsEl.textContent = interestsScore;
        if (clarityEl) clarityEl.textContent = clarityScore;
    }

    addBioSuggestion(type) {
        const suggestions = {
            interests: "I love trying new restaurants and weekend hiking adventures. ",
            goals: "Looking for someone genuine to explore the city with. ",
            humor: "Fair warning: I make terrible puns and I'm not sorry about it! ",
            lifestyle: "Work hard, play harder - always up for spontaneous adventures. "
        };
        
        const textarea = document.getElementById('bioTextarea');
        if (textarea) {
            textarea.value += suggestions[type];
            this.updateBioCounter();
        }
    }

    toggleInterest(interest) {
        const index = this.profileData.interests.indexOf(interest);
        
        if (index === -1) {
            if (this.profileData.interests.length < 15) {
                this.profileData.interests.push(interest);
            } else {
                this.showToast('Maximum 15 interests allowed', 'warning');
                return;
            }
        } else {
            this.profileData.interests.splice(index, 1);
        }
        
        this.updateWizardStep();
    }

    removeInterest(interest) {
        const index = this.profileData.interests.indexOf(interest);
        if (index !== -1) {
            this.profileData.interests.splice(index, 1);
            this.updateWizardStep();
        }
    }

    calculateMatchPotential() {
        let potential = 30; // Base potential
        potential += this.profileData.photos.length * 10; // Photos impact
        potential += Math.min(this.profileData.interests.length * 3, 30); // Interests impact
        potential += this.profileData.bio.length > 50 ? 20 : 0; // Bio impact
        potential += this.profileData.verification ? 15 : 0; // Verification impact
        
        return Math.min(potential, 95);
    }

    updateDistancePreference(value) {
        this.profileData.preferences.maxDistance = parseInt(value);
        const display = document.getElementById('distanceValue');
        if (display) {
            display.textContent = value;
        }
    }

    updateAgePreference() {
        const minAge = parseInt(document.getElementById('minAge')?.value || 18);
        const maxAge = parseInt(document.getElementById('maxAge')?.value || 35);
        
        if (minAge > maxAge) {
            this.showToast('Minimum age cannot be greater than maximum age', 'warning');
            return;
        }
        
        this.profileData.preferences.minAge = minAge;
        this.profileData.preferences.maxAge = maxAge;
        
        const summary = document.getElementById('criteriaSummary');
        if (summary) {
            summary.textContent = `Looking for people within ${this.profileData.preferences.maxDistance || 25} miles, ages ${minAge}-${maxAge}`;
        }
    }

    startPhotoVerification() {
        this.showToast('Opening camera for photo verification...', 'info');
        setTimeout(() => {
            this.profileData.verification = true;
            this.updateWizardStep();
            this.showToast('Photo verification completed! ✅', 'success');
        }, 2000);
    }

    startPhoneVerification() {
        const phone = prompt('Enter your phone number:');
        if (phone) {
            this.showToast('Verification code sent to ' + phone, 'info');
        }
    }

    linkSocialMedia() {
        this.showToast('Social media linking would open OAuth flow', 'info');
    }

    skipVerification() {
        this.showToast('You can verify your profile later from settings', 'info');
        this.nextWizardStep();
    }

    confirmExitWizard() {
        if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
            this.saveUserData();
            this.closeAllModals();
        }
    }

    startSwiping() {
        this.closeAllModals();
        this.showToast('Starting your dating journey! 💕', 'success');
    }

    showBoostOptions() {
        this.closeAllModals();
        setTimeout(() => this.showSuperLikeBoostFeatures(), 300);
    }

    // ==========================================
    // 2. SUPER LIKE/BOOST FEATURES
    // Premium interaction features with effects and purchasing
    // ==========================================

    showSuperLikeBoostFeatures() {
        const modal = document.createElement('div');
        modal.className = 'dating-comprehensive-modal super-like-boost-modal active';
        modal.innerHTML = `
            <div class="dating-comprehensive-overlay">
                <div class="dating-comprehensive-content super-like-boost-content">
                    <div class="premium-header">
                        <h2>⭐ Premium Dating Features</h2>
                        <p>Stand out and get noticed with Super Likes and Profile Boosts</p>
                        <button class="premium-close-btn" onclick="datingComprehensiveUI.closeModal(document.querySelector('.super-like-boost-modal'))">×</button>
                    </div>
                    
                    <div class="current-status">
                        <div class="status-cards">
                            <div class="status-card">
                                <div class="status-icon">⭐</div>
                                <div class="status-info">
                                    <h4>Super Likes</h4>
                                    <div class="status-count">${this.superLikeCount} available</div>
                                    <div class="status-reset">Next free in 18 hours</div>
                                </div>
                            </div>
                            <div class="status-card">
                                <div class="status-icon">🚀</div>
                                <div class="status-info">
                                    <h4>Profile Boosts</h4>
                                    <div class="status-count">${this.boostCount} available</div>
                                    <div class="status-reset">Premium feature</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="premium-features">
                        <!-- Super Like Section -->
                        <div class="feature-section">
                            <div class="feature-header">
                                <h3>⭐ Super Likes</h3>
                                <p>Let someone know they really caught your eye</p>
                            </div>
                            
                            <div class="feature-benefits">
                                <div class="benefit-item">
                                    <i class="fas fa-bolt"></i>
                                    <span>Instant notification to the person</span>
                                </div>
                                <div class="benefit-item">
                                    <i class="fas fa-star"></i>
                                    <span>Your profile highlighted in their queue</span>
                                </div>
                                <div class="benefit-item">
                                    <i class="fas fa-chart-line"></i>
                                    <span>3x higher chance of matching</span>
                                </div>
                            </div>
                            
                            <div class="super-like-packages">
                                <div class="package-card">
                                    <h4>Single Super Like</h4>
                                    <div class="package-price">$2.99</div>
                                    <button class="btn btn-primary" onclick="datingComprehensiveUI.purchaseSuperLikes(1)" 
                                            ${this.superLikeCount > 0 ? 'disabled' : ''}>
                                        ${this.superLikeCount > 0 ? 'You have free Super Likes' : 'Buy Super Like'}
                                    </button>
                                </div>
                                <div class="package-card recommended">
                                    <div class="package-badge">Best Value</div>
                                    <h4>5 Super Likes</h4>
                                    <div class="package-price">$9.99</div>
                                    <div class="package-savings">Save 33%</div>
                                    <button class="btn btn-primary" onclick="datingComprehensiveUI.purchaseSuperLikes(5)">
                                        Buy 5 Super Likes
                                    </button>
                                </div>
                                <div class="package-card">
                                    <h4>15 Super Likes</h4>
                                    <div class="package-price">$24.99</div>
                                    <div class="package-savings">Save 44%</div>
                                    <button class="btn btn-primary" onclick="datingComprehensiveUI.purchaseSuperLikes(15)">
                                        Buy 15 Super Likes
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Profile Boost Section -->
                        <div class="feature-section">
                            <div class="feature-header">
                                <h3>🚀 Profile Boosts</h3>
                                <p>Be seen by 10x more people in your area for 30 minutes</p>
                            </div>
                            
                            <div class="feature-benefits">
                                <div class="benefit-item">
                                    <i class="fas fa-eye"></i>
                                    <span>10x more profile views</span>
                                </div>
                                <div class="benefit-item">
                                    <i class="fas fa-users"></i>
                                    <span>Featured in top profiles</span>
                                </div>
                                <div class="benefit-item">
                                    <i class="fas fa-clock"></i>
                                    <span>30 minutes of premium visibility</span>
                                </div>
                            </div>
                            
                            <div class="boost-timing">
                                <h4>🕐 Best Times to Boost</h4>
                                <div class="timing-chart">
                                    <div class="time-slot peak">
                                        <span class="time">7-9 PM</span>
                                        <span class="label">Peak Time</span>
                                        <span class="multiplier">15x effectiveness</span>
                                    </div>
                                    <div class="time-slot good">
                                        <span class="time">6-7 PM</span>
                                        <span class="label">Good Time</span>
                                        <span class="multiplier">12x effectiveness</span>
                                    </div>
                                    <div class="time-slot normal">
                                        <span class="time">12-2 PM</span>
                                        <span class="label">Normal</span>
                                        <span class="multiplier">8x effectiveness</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="boost-packages">
                                <div class="package-card">
                                    <h4>Single Boost</h4>
                                    <div class="package-price">$4.99</div>
                                    <div class="package-duration">30 minutes</div>
                                    <button class="btn btn-primary" onclick="datingComprehensiveUI.purchaseBoost(1)">
                                        Buy Single Boost
                                    </button>
                                </div>
                                <div class="package-card recommended">
                                    <div class="package-badge">Popular</div>
                                    <h4>3 Boosts</h4>
                                    <div class="package-price">$12.99</div>
                                    <div class="package-savings">Save 13%</div>
                                    <button class="btn btn-primary" onclick="datingComprehensiveUI.purchaseBoost(3)">
                                        Buy 3 Boosts
                                    </button>
                                </div>
                                <div class="package-card">
                                    <h4>10 Boosts</h4>
                                    <div class="package-price">$39.99</div>
                                    <div class="package-savings">Save 20%</div>
                                    <button class="btn btn-primary" onclick="datingComprehensiveUI.purchaseBoost(10)">
                                        Buy 10 Boosts
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="premium-actions">
                        <button class="btn btn-outline" onclick="datingComprehensiveUI.showBoostAnalytics()">
                            📊 View Analytics
                        </button>
                        <button class="btn btn-secondary" onclick="datingComprehensiveUI.closeModal(document.querySelector('.super-like-boost-modal'))">
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    purchaseSuperLikes(count) {
        this.showToast(`Processing payment for ${count} Super Like${count > 1 ? 's' : ''}...`, 'info');
        
        setTimeout(() => {
            this.superLikeCount += count;
            this.showToast(`${count} Super Like${count > 1 ? 's' : ''} added to your account! ⭐`, 'success');
            this.updatePremiumStatus();
        }, 1500);
    }

    purchaseBoost(count) {
        this.showToast(`Processing payment for ${count} boost${count > 1 ? 's' : ''}...`, 'info');
        
        setTimeout(() => {
            this.boostCount += count;
            this.showToast(`${count} boost${count > 1 ? 's' : ''} added to your account! 🚀`, 'success');
            this.updatePremiumStatus();
        }, 1500);
    }

    updatePremiumStatus() {
        const superLikeStatus = document.querySelector('.status-card .status-count');
        if (superLikeStatus) {
            superLikeStatus.textContent = `${this.superLikeCount} available`;
        }
    }

    showBoostAnalytics() {
        this.closeAllModals();
        setTimeout(() => this.showBoostPerformanceAnalytics(), 300);
    }

    showBoostPerformanceAnalytics() {
        const modal = document.createElement('div');
        modal.className = 'dating-comprehensive-modal boost-analytics-modal active';
        modal.innerHTML = `
            <div class="dating-comprehensive-overlay">
                <div class="dating-comprehensive-content boost-analytics-content">
                    <div class="analytics-header">
                        <h2>📊 Boost Performance Analytics</h2>
                        <p>See how your boosts have performed</p>
                        <button class="analytics-close-btn" onclick="datingComprehensiveUI.closeModal(document.querySelector('.boost-analytics-modal'))">×</button>
                    </div>
                    
                    <div class="analytics-summary">
                        <div class="summary-stats">
                            <div class="summary-stat">
                                <div class="stat-value">2,547</div>
                                <div class="stat-label">Total Profile Views</div>
                                <div class="stat-change">+847% vs unboosted</div>
                            </div>
                            <div class="summary-stat">
                                <div class="stat-value">156</div>
                                <div class="stat-label">Likes Received</div>
                                <div class="stat-change">+923% vs unboosted</div>
                            </div>
                            <div class="summary-stat">
                                <div class="stat-value">34</div>
                                <div class="stat-label">New Matches</div>
                                <div class="stat-change">+1,200% vs unboosted</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="boost-history">
                        <h3>📅 Recent Boosts</h3>
                        <div class="boost-timeline">
                            <div class="boost-entry">
                                <div class="boost-date">Mar 15, 8:30 PM</div>
                                <div class="boost-results">
                                    <span class="views">847 views</span>
                                    <span class="likes">34 likes</span>
                                    <span class="matches">12 matches</span>
                                </div>
                                <div class="boost-rating excellent">Excellent</div>
                            </div>
                            <div class="boost-entry">
                                <div class="boost-date">Mar 12, 2:00 PM</div>
                                <div class="boost-results">
                                    <span class="views">523 views</span>
                                    <span class="likes">28 likes</span>
                                    <span class="matches">8 matches</span>
                                </div>
                                <div class="boost-rating good">Good</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="boost-insights">
                        <h3>💡 Insights & Tips</h3>
                        <div class="insights-grid">
                            <div class="insight-card">
                                <h4>🕗 Best Time</h4>
                                <p>Sunday 8-9 PM gives you maximum visibility</p>
                            </div>
                            <div class="insight-card">
                                <h4>📸 Photo Impact</h4>
                                <p>Your main photo gets 65% of attention during boosts</p>
                            </div>
                            <div class="insight-card">
                                <h4>📍 Location Factor</h4>
                                <p>Urban areas see 40% better boost performance</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analytics-actions">
                        <button class="btn btn-secondary" onclick="datingComprehensiveUI.scheduleBoost()">
                            ⏰ Schedule Next Boost
                        </button>
                        <button class="btn btn-primary" onclick="datingComprehensiveUI.activateBoostNow()">
                            🚀 Boost Now
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    scheduleBoost() {
        this.showToast('Opening boost scheduler...', 'info');
    }

    activateBoostNow() {
        if (this.boostCount > 0) {
            this.boostCount--;
            this.showToast('Profile boost activated! You\'re now featured for 30 minutes 🚀', 'success');
            this.startBoostCountdown();
        } else {
            this.showToast('No boosts available. Purchase boosts to continue.', 'warning');
        }
    }

    startBoostCountdown() {
        // Simulate boost countdown
        let timeLeft = 30 * 60; // 30 minutes in seconds
        const countdownInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                this.showToast('Boost completed! Great results! ⭐', 'success');
            }
        }, 1000);
    }

    // Super Like Effect Animation
    showSuperLikeEffect(targetElement) {
        const effect = document.createElement('div');
        effect.className = 'super-like-effect';
        effect.innerHTML = `
            <div class="super-like-animation">
                <div class="star-burst">
                    <i class="fas fa-star"></i>
                </div>
                <div class="super-like-text">SUPER LIKE!</div>
            </div>
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            effect.classList.add('fade-out');
            setTimeout(() => effect.remove(), 500);
        }, 2000);
    }

    // ==========================================
    // 3. DATE SCHEDULING INTERFACE
    // Comprehensive date scheduling and planning tools
    // ==========================================

    showDateSchedulingInterface(matchData = null) {
        this.dateScheduling.currentMatch = matchData || {
            id: 'match_123',
            name: 'Sarah Chen',
            photo: '👤',
            age: 26,
            location: '3 miles away',
            interests: ['Coffee', 'Art', 'Hiking']
        };

        const modal = document.createElement('div');
        modal.className = 'dating-comprehensive-modal date-scheduling-modal active';
        modal.innerHTML = `
            <div class="dating-comprehensive-overlay">
                <div class="dating-comprehensive-content date-scheduling-content">
                    <div class="scheduling-header">
                        <h2>📅 Plan a Date with ${this.dateScheduling.currentMatch.name}</h2>
                        <p>Let's arrange the perfect meeting</p>
                        <button class="scheduling-close-btn" onclick="datingComprehensiveUI.closeModal(document.querySelector('.date-scheduling-modal'))">×</button>
                    </div>
                    
                    <div class="match-context">
                        <div class="match-preview-card">
                            <div class="match-photo">${this.dateScheduling.currentMatch.photo}</div>
                            <div class="match-info">
                                <h3>${this.dateScheduling.currentMatch.name}, ${this.dateScheduling.currentMatch.age}</h3>
                                <p>${this.dateScheduling.currentMatch.location}</p>
                                <div class="shared-interests">
                                    ${this.dateScheduling.currentMatch.interests.map(interest => `
                                        <span class="interest-tag">${interest}</span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="scheduling-wizard">
                        <!-- Step 1: Date Type Selection -->
                        <div class="scheduling-step active" id="dateStep1">
                            <h3>🎯 Choose Date Type</h3>
                            <div class="date-type-grid">
                                <div class="date-type-card" onclick="datingComprehensiveUI.selectDateType('coffee')">
                                    <div class="date-icon">☕</div>
                                    <h4>Coffee Date</h4>
                                    <div class="date-details">
                                        <span class="duration">1-2 hours</span>
                                        <span class="cost">$</span>
                                        <span class="safety">Public</span>
                                    </div>
                                    <div class="date-description">Perfect for first meetings</div>
                                </div>
                                
                                <div class="date-type-card" onclick="datingComprehensiveUI.selectDateType('dinner')">
                                    <div class="date-icon">🍽️</div>
                                    <h4>Dinner Date</h4>
                                    <div class="date-details">
                                        <span class="duration">2-3 hours</span>
                                        <span class="cost">$$</span>
                                        <span class="safety">Public</span>
                                    </div>
                                    <div class="date-description">Classic romantic option</div>
                                </div>
                                
                                <div class="date-type-card" onclick="datingComprehensiveUI.selectDateType('activity')">
                                    <div class="date-icon">🎨</div>
                                    <h4>Activity Date</h4>
                                    <div class="date-details">
                                        <span class="duration">2-4 hours</span>
                                        <span class="cost">$$</span>
                                        <span class="safety">Public</span>
                                    </div>
                                    <div class="date-description">Fun shared experience</div>
                                </div>
                                
                                <div class="date-type-card" onclick="datingComprehensiveUI.selectDateType('casual')">
                                    <div class="date-icon">🚶‍♀️</div>
                                    <h4>Casual Meet</h4>
                                    <div class="date-details">
                                        <span class="duration">1-2 hours</span>
                                        <span class="cost">Free</span>
                                        <span class="safety">Public</span>
                                    </div>
                                    <div class="date-description">Low-pressure meeting</div>
                                </div>
                            </div>
                            
                            <div class="custom-date-option">
                                <button class="btn btn-outline" onclick="datingComprehensiveUI.showCustomDateInput()">
                                    ✨ Suggest Something Custom
                                </button>
                            </div>
                        </div>
                        
                        <!-- Step 2: Date & Time Selection -->
                        <div class="scheduling-step" id="dateStep2">
                            <h3>📅 Pick Date & Time</h3>
                            
                            <div class="selected-type" id="selectedDateType">
                                <!-- Will be populated when date type is selected -->
                            </div>
                            
                            <div class="calendar-container">
                                <div class="calendar-header">
                                    <h4>Select Date</h4>
                                    <div class="month-navigation">
                                        <button onclick="datingComprehensiveUI.changeMonth(-1)">❮</button>
                                        <span id="currentMonth">March 2024</span>
                                        <button onclick="datingComprehensiveUI.changeMonth(1)">❯</button>
                                    </div>
                                </div>
                                
                                <div class="calendar-grid">
                                    ${this.generateCalendar()}
                                </div>
                            </div>
                            
                            <div class="time-selection">
                                <h4>Select Time</h4>
                                <div class="time-slots">
                                    <div class="time-period">
                                        <h5>Morning</h5>
                                        <div class="time-options">
                                            <button class="time-slot" onclick="datingComprehensiveUI.selectTime('9:00 AM')">9:00 AM</button>
                                            <button class="time-slot" onclick="datingComprehensiveUI.selectTime('10:00 AM')">10:00 AM</button>
                                            <button class="time-slot" onclick="datingComprehensiveUI.selectTime('11:00 AM')">11:00 AM</button>
                                        </div>
                                    </div>
                                    <div class="time-period">
                                        <h5>Afternoon</h5>
                                        <div class="time-options">
                                            <button class="time-slot" onclick="datingComprehensiveUI.selectTime('12:00 PM')">12:00 PM</button>
                                            <button class="time-slot" onclick="datingComprehensiveUI.selectTime('1:00 PM')">1:00 PM</button>
                                            <button class="time-slot" onclick="datingComprehensiveUI.selectTime('2:00 PM')">2:00 PM</button>
                                            <button class="time-slot" onclick="datingComprehensiveUI.selectTime('3:00 PM')">3:00 PM</button>
                                        </div>
                                    </div>
                                    <div class="time-period">
                                        <h5>Evening</h5>
                                        <div class="time-options">
                                            <button class="time-slot" onclick="datingComprehensiveUI.selectTime('6:00 PM')">6:00 PM</button>
                                            <button class="time-slot" onclick="datingComprehensiveUI.selectTime('7:00 PM')">7:00 PM</button>
                                            <button class="time-slot" onclick="datingComprehensiveUI.selectTime('8:00 PM')">8:00 PM</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="scheduling-actions">
                                <button class="btn btn-secondary" onclick="datingComprehensiveUI.backToDateType()">
                                    ← Back
                                </button>
                                <button class="btn btn-primary" onclick="datingComprehensiveUI.goToLocationStep()" disabled id="dateTimeNext">
                                    Continue to Location →
                                </button>
                            </div>
                        </div>
                        
                        <!-- Step 3: Location Selection -->
                        <div class="scheduling-step" id="dateStep3">
                            <h3>📍 Choose Location</h3>
                            
                            <div class="location-options">
                                <div class="location-type-selector">
                                    <button class="location-type-btn active" onclick="datingComprehensiveUI.showLocationSearch('nearby')">
                                        📍 Nearby Places
                                    </button>
                                    <button class="location-type-btn" onclick="datingComprehensiveUI.showLocationSearch('popular')">
                                        🌟 Popular Spots
                                    </button>
                                    <button class="location-type-btn" onclick="datingComprehensiveUI.showLocationSearch('custom')">
                                        ✏️ Custom Location
                                    </button>
                                </div>
                                
                                <div class="location-search">
                                    <input type="text" id="locationSearch" placeholder="Search for restaurants, cafes, activities..." 
                                           class="location-search-input">
                                </div>
                                
                                <div class="location-results" id="locationResults">
                                    ${this.generateLocationSuggestions()}
                                </div>
                            </div>
                            
                            <div class="selected-location" id="selectedLocation" style="display: none;">
                                <!-- Will show selected location details -->
                            </div>
                            
                            <div class="scheduling-actions">
                                <button class="btn btn-secondary" onclick="datingComprehensiveUI.backToDateTime()">
                                    ← Back
                                </button>
                                <button class="btn btn-primary" onclick="datingComprehensiveUI.goToConfirmation()" disabled id="locationNext">
                                    Continue to Confirmation →
                                </button>
                            </div>
                        </div>
                        
                        <!-- Step 4: Date Confirmation -->
                        <div class="scheduling-step" id="dateStep4">
                            <h3>✅ Confirm Your Date</h3>
                            
                            <div class="date-summary" id="dateSummary">
                                <!-- Will be populated with complete date details -->
                            </div>
                            
                            <div class="safety-reminder">
                                <h4>🛡️ Safety Reminders</h4>
                                <div class="safety-checklist">
                                    <label class="safety-item">
                                        <input type="checkbox" required>
                                        <span>Meet in a public place</span>
                                    </label>
                                    <label class="safety-item">
                                        <input type="checkbox" required>
                                        <span>Tell a friend about your plans</span>
                                    </label>
                                    <label class="safety-item">
                                        <input type="checkbox" required>
                                        <span>Plan your own transportation</span>
                                    </label>
                                    <label class="safety-item">
                                        <input type="checkbox">
                                        <span>Enable safety check-in (recommended)</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="date-message">
                                <h4>💌 Personal Message (Optional)</h4>
                                <textarea id="dateInviteMessage" placeholder="Add a personal touch to your date invitation..." rows="3"></textarea>
                            </div>
                            
                            <div class="scheduling-actions">
                                <button class="btn btn-secondary" onclick="datingComprehensiveUI.backToLocation()">
                                    ← Back
                                </button>
                                <button class="btn btn-primary" onclick="datingComprehensiveUI.sendDateInvitation()">
                                    Send Date Invitation 💕
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    generateCalendar() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        let calendar = '';
        let date = 1;
        
        // Generate 6 weeks of calendar
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                if (week === 0 && day < firstDay) {
                    calendar += '<div class="calendar-day empty"></div>';
                } else if (date <= daysInMonth) {
                    const isToday = date === today.getDate() && currentMonth === today.getMonth();
                    const isPast = date < today.getDate() && currentMonth === today.getMonth();
                    
                    calendar += `
                        <div class="calendar-day ${isToday ? 'today' : ''} ${isPast ? 'past' : 'available'}" 
                             onclick="${!isPast ? `datingComprehensiveUI.selectDate(${date})` : ''}">
                            ${date}
                        </div>
                    `;
                    date++;
                } else {
                    calendar += '<div class="calendar-day empty"></div>';
                }
            }
        }
        
        return calendar;
    }

    generateLocationSuggestions() {
        const suggestions = [
            {
                name: 'The Coffee Bean Café',
                type: 'Coffee Shop',
                distance: '0.5 miles',
                rating: 4.8,
                price: '$',
                features: ['WiFi', 'Outdoor Seating', 'Quiet']
            },
            {
                name: 'Bella Vista Restaurant',
                type: 'Italian Restaurant',
                distance: '1.2 miles',
                rating: 4.6,
                price: '$$',
                features: ['Romantic', 'Wine Selection', 'Reservations']
            },
            {
                name: 'Central Park',
                type: 'Park',
                distance: '0.8 miles',
                rating: 4.9,
                price: 'Free',
                features: ['Walking Paths', 'Scenic', 'Public']
            },
            {
                name: 'Art Gallery Downtown',
                type: 'Cultural',
                distance: '2.1 miles',
                rating: 4.7,
                price: '$',
                features: ['Interactive', 'Educational', 'Indoor']
            }
        ];

        return suggestions.map(location => `
            <div class="location-suggestion" onclick="datingComprehensiveUI.selectLocation('${location.name}')">
                <div class="location-info">
                    <h4>${location.name}</h4>
                    <p class="location-type">${location.type}</p>
                    <div class="location-meta">
                        <span class="distance">📍 ${location.distance}</span>
                        <span class="rating">⭐ ${location.rating}</span>
                        <span class="price">💰 ${location.price}</span>
                    </div>
                    <div class="location-features">
                        ${location.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                    </div>
                </div>
                <div class="location-select-btn">
                    <i class="fas fa-check"></i>
                </div>
            </div>
        `).join('');
    }

    // Date Scheduling Helper Methods
    selectDateType(type) {
        const typeData = {
            coffee: { name: 'Coffee Date', icon: '☕', description: 'Perfect for first meetings' },
            dinner: { name: 'Dinner Date', icon: '🍽️', description: 'Classic romantic option' },
            activity: { name: 'Activity Date', icon: '🎨', description: 'Fun shared experience' },
            casual: { name: 'Casual Meet', icon: '🚶‍♀️', description: 'Low-pressure meeting' }
        };

        this.dateScheduling.selectedType = type;
        
        const selectedTypeEl = document.getElementById('selectedDateType');
        if (selectedTypeEl) {
            selectedTypeEl.innerHTML = `
                <div class="selected-date-type">
                    <div class="type-icon">${typeData[type].icon}</div>
                    <div class="type-info">
                        <h4>${typeData[type].name}</h4>
                        <p>${typeData[type].description}</p>
                    </div>
                </div>
            `;
        }

        this.showSchedulingStep(2);
    }

    showCustomDateInput() {
        const customType = prompt('What kind of date would you like to suggest?');
        if (customType && customType.trim()) {
            this.dateScheduling.selectedType = 'custom';
            this.dateScheduling.customDescription = customType;
            
            const selectedTypeEl = document.getElementById('selectedDateType');
            if (selectedTypeEl) {
                selectedTypeEl.innerHTML = `
                    <div class="selected-date-type">
                        <div class="type-icon">✨</div>
                        <div class="type-info">
                            <h4>Custom Date Idea</h4>
                            <p>${customType}</p>
                        </div>
                    </div>
                `;
            }
            
            this.showSchedulingStep(2);
        }
    }

    selectDate(date) {
        this.dateScheduling.selectedDate = date;
        
        // Update calendar UI
        document.querySelectorAll('.calendar-day').forEach(day => day.classList.remove('selected'));
        event.target.classList.add('selected');
        
        this.checkDateTimeSelection();
    }

    selectTime(time) {
        this.dateScheduling.selectedTime = time;
        
        // Update time UI
        document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
        event.target.classList.add('selected');
        
        this.checkDateTimeSelection();
    }

    checkDateTimeSelection() {
        const nextBtn = document.getElementById('dateTimeNext');
        if (nextBtn && this.dateScheduling.selectedDate && this.dateScheduling.selectedTime) {
            nextBtn.disabled = false;
        }
    }

    selectLocation(locationName) {
        this.dateScheduling.selectedLocation = locationName;
        
        // Update location UI
        document.querySelectorAll('.location-suggestion').forEach(loc => loc.classList.remove('selected'));
        event.target.classList.add('selected');
        
        const selectedLocationEl = document.getElementById('selectedLocation');
        if (selectedLocationEl) {
            selectedLocationEl.style.display = 'block';
            selectedLocationEl.innerHTML = `
                <div class="location-selected">
                    <h4>✅ Selected Location</h4>
                    <div class="location-card">
                        <h5>${locationName}</h5>
                        <p>Perfect choice for your date!</p>
                    </div>
                </div>
            `;
        }
        
        const nextBtn = document.getElementById('locationNext');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
    }

    showSchedulingStep(step) {
        // Hide all steps
        document.querySelectorAll('.scheduling-step').forEach(s => s.classList.remove('active'));
        
        // Show target step
        const targetStep = document.getElementById(`dateStep${step}`);
        if (targetStep) {
            targetStep.classList.add('active');
        }

        // Update date summary if on confirmation step
        if (step === 4) {
            this.updateDateSummary();
        }
    }

    updateDateSummary() {
        const summaryEl = document.getElementById('dateSummary');
        if (summaryEl) {
            summaryEl.innerHTML = `
                <div class="summary-card">
                    <h4>📋 Date Details</h4>
                    <div class="summary-details">
                        <div class="detail-row">
                            <strong>Who:</strong> You and ${this.dateScheduling.currentMatch.name}
                        </div>
                        <div class="detail-row">
                            <strong>What:</strong> ${this.getSelectedTypeText()}
                        </div>
                        <div class="detail-row">
                            <strong>When:</strong> ${this.dateScheduling.selectedDate ? `March ${this.dateScheduling.selectedDate}` : 'TBD'} 
                                                  ${this.dateScheduling.selectedTime ? `at ${this.dateScheduling.selectedTime}` : ''}
                        </div>
                        <div class="detail-row">
                            <strong>Where:</strong> ${this.dateScheduling.selectedLocation || 'TBD'}
                        </div>
                    </div>
                </div>
            `;
        }
    }

    getSelectedTypeText() {
        if (this.dateScheduling.selectedType === 'custom') {
            return this.dateScheduling.customDescription;
        }
        const types = {
            coffee: 'Coffee Date',
            dinner: 'Dinner Date', 
            activity: 'Activity Date',
            casual: 'Casual Meet'
        };
        return types[this.dateScheduling.selectedType] || 'TBD';
    }

    // Navigation methods
    backToDateType() { this.showSchedulingStep(1); }
    goToLocationStep() { this.showSchedulingStep(3); }
    backToDateTime() { this.showSchedulingStep(2); }
    goToConfirmation() { this.showSchedulingStep(4); }
    backToLocation() { this.showSchedulingStep(3); }

    sendDateInvitation() {
        // Validate safety checkboxes
        const requiredChecks = document.querySelectorAll('.safety-item input[required]');
        const allChecked = Array.from(requiredChecks).every(cb => cb.checked);
        
        if (!allChecked) {
            this.showToast('Please confirm all required safety guidelines', 'warning');
            return;
        }

        const message = document.getElementById('dateInviteMessage')?.value || '';
        
        this.showToast('Sending date invitation...', 'info');
        
        setTimeout(() => {
            this.showToast('Date invitation sent! 💕', 'success');
            this.closeAllModals();
            this.showDateConfirmationSuccess();
        }, 1500);
    }

    showDateConfirmationSuccess() {
        const modal = document.createElement('div');
        modal.className = 'dating-comprehensive-modal date-success-modal active';
        modal.innerHTML = `
            <div class="dating-comprehensive-overlay">
                <div class="dating-comprehensive-content date-success-content">
                    <div class="success-header">
                        <div class="success-icon">💕</div>
                        <h2>Date Invitation Sent!</h2>
                        <p>Your date invitation has been sent to ${this.dateScheduling.currentMatch.name}</p>
                    </div>
                    
                    <div class="success-details">
                        <div class="detail-card">
                            <h4>What happens next?</h4>
                            <div class="steps-list">
                                <div class="step-item">
                                    <div class="step-icon">📱</div>
                                    <span>${this.dateScheduling.currentMatch.name} will receive your invitation</span>
                                </div>
                                <div class="step-item">
                                    <div class="step-icon">💬</div>
                                    <span>You'll get notified of their response</span>
                                </div>
                                <div class="step-item">
                                    <div class="step-icon">📅</div>
                                    <span>If accepted, the date will be added to your calendar</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="success-actions">
                        <button class="btn btn-secondary" onclick="datingComprehensiveUI.enableSafetyCheckin()">
                            🛡️ Enable Safety Check-in
                        </button>
                        <button class="btn btn-primary" onclick="datingComprehensiveUI.closeModal(document.querySelector('.date-success-modal'))">
                            Continue Dating
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    enableSafetyCheckin() {
        this.showToast('Safety check-in enabled for your upcoming date! 🛡️', 'success');
        this.closeAllModals();
    }

    // Utility Methods
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `dating-toast dating-toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#007bff'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100px);
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    filterInterests() {
        const searchTerm = document.getElementById('interestSearch')?.value.toLowerCase() || '';
        const interestButtons = document.querySelectorAll('#availableInterests .interest-option');
        
        interestButtons.forEach(button => {
            const interestName = button.textContent.toLowerCase();
            if (interestName.includes(searchTerm)) {
                button.style.display = 'block';
            } else {
                button.style.display = 'none';
            }
        });
    }

    updatePreference(key, value) {
        if (!this.profileData.preferences) {
            this.profileData.preferences = {};
        }
        this.profileData.preferences[key] = value;
    }

    changeMonth(direction) {
        // Implementation for month navigation
        this.showToast(`Changing month ${direction > 0 ? 'forward' : 'backward'}`, 'info');
    }

    showLocationSearch(type) {
        // Update active location type
        document.querySelectorAll('.location-type-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Update location results based on type
        const resultsEl = document.getElementById('locationResults');
        if (resultsEl) {
            resultsEl.innerHTML = this.generateLocationSuggestions();
        }
    }
}

// Initialize the comprehensive dating UI components
const datingComprehensiveUI = new DatingComprehensiveMissingUI();

// Make globally available
window.datingComprehensiveUI = datingComprehensiveUI;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatingComprehensiveMissingUI;
}

console.log('Dating Comprehensive Missing UI Components loaded successfully');
