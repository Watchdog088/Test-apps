/**
 * Dating Missing UI Components
 * 6 Critical Dating Interface Implementations
 * 
 * These interfaces fill the most important gaps in the dating experience:
 * 1. Photo Gallery Viewer - Enhanced profile photo browsing
 * 2. Advanced Filter Panel - Comprehensive search criteria
 * 3. Date Planning Assistant - Meeting arrangement tools
 * 4. Safety Reporting Panel - Dating-specific safety tools
 * 5. Match Timeline View - Chronological match history
 * 6. Icebreaker Suggestions - Conversation starters panel
 */

class DatingMissingUIComponents {
    constructor() {
        this.currentPhotoIndex = 0;
        this.currentProfilePhotos = [];
        this.advancedFilters = {
            ageRange: [18, 35],
            distance: 25,
            height: [150, 200],
            education: 'any',
            occupation: 'any',
            interests: [],
            lifestyle: {
                smoking: 'any',
                drinking: 'any',
                exercise: 'any',
                pets: 'any'
            },
            dealBreakers: []
        };
        this.matchTimeline = [];
        this.icebreakerCategories = ['funny', 'thoughtful', 'flirty', 'casual'];
        this.dateIdeas = [
            { type: 'coffee', name: 'Coffee Chat', duration: '1-2 hours', cost: '$', safety: 'public' },
            { type: 'dinner', name: 'Dinner Date', duration: '2-3 hours', cost: '$$', safety: 'public' },
            { type: 'activity', name: 'Mini Golf', duration: '2-3 hours', cost: '$$', safety: 'public' },
            { type: 'walk', name: 'Park Walk', duration: '1-2 hours', cost: 'Free', safety: 'public' },
            { type: 'museum', name: 'Museum Visit', duration: '2-4 hours', cost: '$$', safety: 'public' },
            { type: 'drinks', name: 'Happy Hour', duration: '2-3 hours', cost: '$$', safety: 'public' }
        ];
        
        this.initializeEventListeners();
        this.loadMatchTimeline();
    }

    initializeEventListeners() {
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('dating-modal-overlay')) {
                this.closeModal(e.target.closest('.dating-modal'));
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.dating-modal.active').forEach(modal => {
                    this.closeModal(modal);
                });
            }
            if (e.key === 'ArrowLeft' && document.querySelector('.photo-gallery-modal.active')) {
                this.previousPhoto();
            }
            if (e.key === 'ArrowRight' && document.querySelector('.photo-gallery-modal.active')) {
                this.nextPhoto();
            }
        });
    }

    loadMatchTimeline() {
        // Sample match timeline data
        this.matchTimeline = [
            {
                id: 1,
                name: 'Sarah Miller',
                avatar: 'SM',
                matchDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
                status: 'matched',
                messages: 5,
                lastMessage: '2 hours ago',
                compatibility: 95
            },
            {
                id: 2,
                name: 'Emma Wilson',
                avatar: 'EW',
                matchDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
                status: 'chatting',
                messages: 12,
                lastMessage: '1 day ago',
                compatibility: 89
            },
            {
                id: 3,
                name: 'Lisa Garcia',
                avatar: 'LG',
                matchDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
                status: 'planned_date',
                messages: 8,
                lastMessage: 'Tomorrow 7 PM',
                compatibility: 92
            },
            {
                id: 4,
                name: 'Anna Kim',
                avatar: 'AK',
                matchDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
                status: 'expired',
                messages: 1,
                lastMessage: '5 days ago',
                compatibility: 87
            }
        ];
    }

    // 1. Photo Gallery Viewer - Enhanced profile photo browsing
    showPhotoGalleryViewer(photos, startIndex = 0) {
        this.currentProfilePhotos = photos || [
            '💕', '🌟', '🎵', '✨', '🌈'  // Sample emoji photos
        ];
        this.currentPhotoIndex = startIndex;

        const modal = document.createElement('div');
        modal.className = 'dating-modal photo-gallery-modal active';
        modal.innerHTML = `
            <div class="dating-modal-overlay">
                <div class="dating-modal-content photo-gallery-content">
                    <div class="photo-gallery-header">
                        <h2>Profile Photos</h2>
                        <div class="photo-counter">
                            <span id="currentPhotoNum">${startIndex + 1}</span> of ${this.currentProfilePhotos.length}
                        </div>
                        <button class="close-btn" onclick="this.closest('.dating-modal').remove()">×</button>
                    </div>
                    
                    <div class="photo-gallery-main">
                        <button class="photo-nav-btn prev-btn" onclick="datingUIComponents.previousPhoto()" ${startIndex === 0 ? 'disabled' : ''}>
                            ❮
                        </button>
                        
                        <div class="main-photo-container">
                            <div class="main-photo" id="mainPhoto">
                                ${this.currentProfilePhotos[startIndex]}
                            </div>
                            <div class="photo-overlay">
                                <div class="photo-actions">
                                    <button class="photo-action-btn" onclick="datingUIComponents.reportPhoto()">
                                        🚩 Report
                                    </button>
                                    <button class="photo-action-btn" onclick="datingUIComponents.savePhoto()">
                                        💾 Save
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <button class="photo-nav-btn next-btn" onclick="datingUIComponents.nextPhoto()" ${startIndex === this.currentProfilePhotos.length - 1 ? 'disabled' : ''}>
                            ❯
                        </button>
                    </div>
                    
                    <div class="photo-thumbnails">
                        ${this.currentProfilePhotos.map((photo, index) => `
                            <div class="thumbnail ${index === startIndex ? 'active' : ''}" 
                                 onclick="datingUIComponents.selectPhoto(${index})">
                                ${photo}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="photo-gallery-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.dating-modal').remove()">
                            Close Gallery
                        </button>
                        <button class="btn btn-primary" onclick="datingUIComponents.likeProfile()">
                            💕 Like Profile
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    previousPhoto() {
        if (this.currentPhotoIndex > 0) {
            this.currentPhotoIndex--;
            this.updatePhotoDisplay();
        }
    }

    nextPhoto() {
        if (this.currentPhotoIndex < this.currentProfilePhotos.length - 1) {
            this.currentPhotoIndex++;
            this.updatePhotoDisplay();
        }
    }

    selectPhoto(index) {
        this.currentPhotoIndex = index;
        this.updatePhotoDisplay();
    }

    updatePhotoDisplay() {
        const mainPhoto = document.getElementById('mainPhoto');
        const photoNum = document.getElementById('currentPhotoNum');
        const thumbnails = document.querySelectorAll('.thumbnail');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        if (mainPhoto) mainPhoto.textContent = this.currentProfilePhotos[this.currentPhotoIndex];
        if (photoNum) photoNum.textContent = this.currentPhotoIndex + 1;
        
        thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentPhotoIndex);
        });

        if (prevBtn) prevBtn.disabled = this.currentPhotoIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentPhotoIndex === this.currentProfilePhotos.length - 1;
    }

    reportPhoto() {
        if (confirm('Report this photo as inappropriate?')) {
            showToast('Photo reported. Thank you for keeping our community safe.', 'success');
        }
    }

    savePhoto() {
        showToast('Photo saved to your favorites', 'success');
    }

    likeProfile() {
        showToast('Profile liked! 💕', 'success');
        document.querySelector('.photo-gallery-modal').remove();
    }

    // 2. Advanced Filter Panel - Comprehensive search criteria
    showAdvancedFilterPanel() {
        const modal = document.createElement('div');
        modal.className = 'dating-modal advanced-filter-modal active';
        modal.innerHTML = `
            <div class="dating-modal-overlay">
                <div class="dating-modal-content advanced-filter-content">
                    <div class="filter-header">
                        <h2>🎯 Advanced Filters</h2>
                        <p>Find your perfect match with detailed preferences</p>
                        <button class="close-btn" onclick="this.closest('.dating-modal').remove()">×</button>
                    </div>
                    
                    <div class="filter-sections">
                        <!-- Basic Demographics -->
                        <div class="filter-section">
                            <h3>👤 Demographics</h3>
                            <div class="filter-group">
                                <label>Age Range</label>
                                <div class="range-slider">
                                    <input type="range" id="minAge" min="18" max="65" value="${this.advancedFilters.ageRange[0]}" 
                                           oninput="datingUIComponents.updateAgeRange()">
                                    <input type="range" id="maxAge" min="18" max="65" value="${this.advancedFilters.ageRange[1]}" 
                                           oninput="datingUIComponents.updateAgeRange()">
                                    <div class="range-display" id="ageDisplay">${this.advancedFilters.ageRange[0]} - ${this.advancedFilters.ageRange[1]} years</div>
                                </div>
                            </div>
                            
                            <div class="filter-group">
                                <label>Distance</label>
                                <div class="range-slider">
                                    <input type="range" id="distance" min="1" max="100" value="${this.advancedFilters.distance}" 
                                           oninput="datingUIComponents.updateDistance(this.value)">
                                    <div class="range-display" id="distanceDisplay">${this.advancedFilters.distance} miles</div>
                                </div>
                            </div>
                            
                            <div class="filter-group">
                                <label>Height Range</label>
                                <div class="range-slider">
                                    <input type="range" id="minHeight" min="140" max="220" value="${this.advancedFilters.height[0]}" 
                                           oninput="datingUIComponents.updateHeightRange()">
                                    <input type="range" id="maxHeight" min="140" max="220" value="${this.advancedFilters.height[1]}" 
                                           oninput="datingUIComponents.updateHeightRange()">
                                    <div class="range-display" id="heightDisplay">${this.advancedFilters.height[0]}cm - ${this.advancedFilters.height[1]}cm</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Education & Career -->
                        <div class="filter-section">
                            <h3>🎓 Education & Career</h3>
                            <div class="filter-group">
                                <label>Education Level</label>
                                <select id="education" onchange="datingUIComponents.updateFilter('education', this.value)">
                                    <option value="any">Any Education</option>
                                    <option value="high_school">High School</option>
                                    <option value="some_college">Some College</option>
                                    <option value="bachelor">Bachelor's Degree</option>
                                    <option value="master">Master's Degree</option>
                                    <option value="phd">PhD/Doctorate</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label>Occupation</label>
                                <select id="occupation" onchange="datingUIComponents.updateFilter('occupation', this.value)">
                                    <option value="any">Any Occupation</option>
                                    <option value="tech">Technology</option>
                                    <option value="healthcare">Healthcare</option>
                                    <option value="education">Education</option>
                                    <option value="business">Business</option>
                                    <option value="creative">Creative Arts</option>
                                    <option value="service">Service Industry</option>
                                    <option value="government">Government</option>
                                    <option value="student">Student</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Lifestyle -->
                        <div class="filter-section">
                            <h3>🌟 Lifestyle</h3>
                            <div class="lifestyle-filters">
                                <div class="lifestyle-item">
                                    <label>Smoking</label>
                                    <div class="lifestyle-options">
                                        <button class="lifestyle-btn ${this.advancedFilters.lifestyle.smoking === 'any' ? 'active' : ''}" 
                                                onclick="datingUIComponents.updateLifestyle('smoking', 'any')">Any</button>
                                        <button class="lifestyle-btn ${this.advancedFilters.lifestyle.smoking === 'never' ? 'active' : ''}" 
                                                onclick="datingUIComponents.updateLifestyle('smoking', 'never')">Never</button>
                                        <button class="lifestyle-btn ${this.advancedFilters.lifestyle.smoking === 'sometimes' ? 'active' : ''}" 
                                                onclick="datingUIComponents.updateLifestyle('smoking', 'sometimes')">Sometimes</button>
                                    </div>
                                </div>
                                
                                <div class="lifestyle-item">
                                    <label>Drinking</label>
                                    <div class="lifestyle-options">
                                        <button class="lifestyle-btn ${this.advancedFilters.lifestyle.drinking === 'any' ? 'active' : ''}" 
                                                onclick="datingUIComponents.updateLifestyle('drinking', 'any')">Any</button>
                                        <button class="lifestyle-btn ${this.advancedFilters.lifestyle.drinking === 'never' ? 'active' : ''}" 
                                                onclick="datingUIComponents.updateLifestyle('drinking', 'never')">Never</button>
                                        <button class="lifestyle-btn ${this.advancedFilters.lifestyle.drinking === 'socially' ? 'active' : ''}" 
                                                onclick="datingUIComponents.updateLifestyle('drinking', 'socially')">Socially</button>
                                        <button class="lifestyle-btn ${this.advancedFilters.lifestyle.drinking === 'regularly' ? 'active' : ''}" 
                                                onclick="datingUIComponents.updateLifestyle('drinking', 'regularly')">Regularly</button>
                                    </div>
                                </div>
                                
                                <div class="lifestyle-item">
                                    <label>Exercise</label>
                                    <div class="lifestyle-options">
                                        <button class="lifestyle-btn ${this.advancedFilters.lifestyle.exercise === 'any' ? 'active' : ''}" 
                                                onclick="datingUIComponents.updateLifestyle('exercise', 'any')">Any</button>
                                        <button class="lifestyle-btn ${this.advancedFilters.lifestyle.exercise === 'never' ? 'active' : ''}" 
                                                onclick="datingUIComponents.updateLifestyle('exercise', 'never')">Never</button>
                                        <button class="lifestyle-btn ${this.advancedFilters.lifestyle.exercise === 'sometimes' ? 'active' : ''}" 
                                                onclick="datingUIComponents.updateLifestyle('exercise', 'sometimes')">Sometimes</button>
                                        <button class="lifestyle-btn ${this.advancedFilters.lifestyle.exercise === 'regularly' ? 'active' : ''}" 
                                                onclick="datingUIComponents.updateLifestyle('exercise', 'regularly')">Regularly</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Interests -->
                        <div class="filter-section">
                            <h3>💝 Interests</h3>
                            <div class="interests-grid">
                                ${['Travel', 'Music', 'Sports', 'Art', 'Technology', 'Food', 'Movies', 'Books', 
                                  'Fitness', 'Photography', 'Gaming', 'Dancing', 'Hiking', 'Cooking', 'Fashion', 'Science'].map(interest => `
                                    <button class="interest-filter-btn ${this.advancedFilters.interests.includes(interest) ? 'active' : ''}" 
                                            onclick="datingUIComponents.toggleInterestFilter('${interest}')">
                                        ${interest}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Deal Breakers -->
                        <div class="filter-section deal-breakers">
                            <h3>🚫 Deal Breakers</h3>
                            <p class="deal-breaker-note">Select absolute must-not-haves</p>
                            <div class="deal-breaker-list">
                                ${['Smoking', 'Drinking', 'No Education', 'Pets', 'No Job', 'Different Religion', 'Long Distance', 'No Car'].map(dealBreaker => `
                                    <label class="deal-breaker-item">
                                        <input type="checkbox" ${this.advancedFilters.dealBreakers.includes(dealBreaker) ? 'checked' : ''} 
                                               onchange="datingUIComponents.toggleDealBreaker('${dealBreaker}')">
                                        <span>${dealBreaker}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="filter-actions">
                        <div class="filter-summary">
                            <span id="filterCount">0 filters applied</span>
                        </div>
                        <div class="filter-buttons">
                            <button class="btn btn-secondary" onclick="datingUIComponents.resetFilters()">
                                Reset All
                            </button>
                            <button class="btn btn-primary" onclick="datingUIComponents.applyFilters()">
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.updateFilterCount();
    }

    updateAgeRange() {
        const minAge = parseInt(document.getElementById('minAge').value);
        const maxAge = parseInt(document.getElementById('maxAge').value);
        
        if (minAge > maxAge) {
            document.getElementById('minAge').value = maxAge;
        }
        
        this.advancedFilters.ageRange = [
            parseInt(document.getElementById('minAge').value),
            parseInt(document.getElementById('maxAge').value)
        ];
        
        document.getElementById('ageDisplay').textContent = `${this.advancedFilters.ageRange[0]} - ${this.advancedFilters.ageRange[1]} years`;
        this.updateFilterCount();
    }

    updateDistance(value) {
        this.advancedFilters.distance = parseInt(value);
        document.getElementById('distanceDisplay').textContent = `${value} miles`;
        this.updateFilterCount();
    }

    updateHeightRange() {
        const minHeight = parseInt(document.getElementById('minHeight').value);
        const maxHeight = parseInt(document.getElementById('maxHeight').value);
        
        if (minHeight > maxHeight) {
            document.getElementById('minHeight').value = maxHeight;
        }
        
        this.advancedFilters.height = [
            parseInt(document.getElementById('minHeight').value),
            parseInt(document.getElementById('maxHeight').value)
        ];
        
        document.getElementById('heightDisplay').textContent = `${this.advancedFilters.height[0]}cm - ${this.advancedFilters.height[1]}cm`;
        this.updateFilterCount();
    }

    updateFilter(type, value) {
        this.advancedFilters[type] = value;
        this.updateFilterCount();
    }

    updateLifestyle(category, value) {
        this.advancedFilters.lifestyle[category] = value;
        
        // Update button states
        document.querySelectorAll(`.lifestyle-item:has(label:contains("${category}")) .lifestyle-btn`).forEach(btn => {
            btn.classList.remove('active');
        });
        
        event.target.classList.add('active');
        this.updateFilterCount();
    }

    toggleInterestFilter(interest) {
        const index = this.advancedFilters.interests.indexOf(interest);
        if (index === -1) {
            this.advancedFilters.interests.push(interest);
        } else {
            this.advancedFilters.interests.splice(index, 1);
        }
        
        event.target.classList.toggle('active');
        this.updateFilterCount();
    }

    toggleDealBreaker(dealBreaker) {
        const index = this.advancedFilters.dealBreakers.indexOf(dealBreaker);
        if (index === -1) {
            this.advancedFilters.dealBreakers.push(dealBreaker);
        } else {
            this.advancedFilters.dealBreakers.splice(index, 1);
        }
        this.updateFilterCount();
    }

    updateFilterCount() {
        let count = 0;
        
        // Count non-default filters
        if (this.advancedFilters.ageRange[0] !== 18 || this.advancedFilters.ageRange[1] !== 35) count++;
        if (this.advancedFilters.distance !== 25) count++;
        if (this.advancedFilters.height[0] !== 150 || this.advancedFilters.height[1] !== 200) count++;
        if (this.advancedFilters.education !== 'any') count++;
        if (this.advancedFilters.occupation !== 'any') count++;
        if (this.advancedFilters.lifestyle.smoking !== 'any') count++;
        if (this.advancedFilters.lifestyle.drinking !== 'any') count++;
        if (this.advancedFilters.lifestyle.exercise !== 'any') count++;
        if (this.advancedFilters.interests.length > 0) count++;
        if (this.advancedFilters.dealBreakers.length > 0) count++;
        
        const filterCountEl = document.getElementById('filterCount');
        if (filterCountEl) {
            filterCountEl.textContent = `${count} filter${count !== 1 ? 's' : ''} applied`;
        }
    }

    resetFilters() {
        this.advancedFilters = {
            ageRange: [18, 35],
            distance: 25,
            height: [150, 200],
            education: 'any',
            occupation: 'any',
            interests: [],
            lifestyle: {
                smoking: 'any',
                drinking: 'any',
                exercise: 'any',
                pets: 'any'
            },
            dealBreakers: []
        };
        
        // Close and reopen to reset UI
        document.querySelector('.advanced-filter-modal').remove();
        setTimeout(() => this.showAdvancedFilterPanel(), 100);
    }

    applyFilters() {
        showToast('Advanced filters applied! Finding better matches...', 'success');
        document.querySelector('.advanced-filter-modal').remove();
    }

    // 3. Date Planning Assistant - Meeting arrangement tools
    showDatePlanningAssistant(matchName = 'Sarah') {
        const modal = document.createElement('div');
        modal.className = 'dating-modal date-planning-modal active';
        modal.innerHTML = `
            <div class="dating-modal-overlay">
                <div class="dating-modal-content date-planning-content">
                    <div class="date-planning-header">
                        <h2>💕 Plan a Date with ${matchName}</h2>
                        <p>Let's help you arrange the perfect first meeting</p>
                        <button class="close-btn" onclick="this.closest('.dating-modal').remove()">×</button>
                    </div>
                    
                    <div class="date-planning-steps">
                        <!-- Step 1: Date Type -->
                        <div class="date-step active" id="dateStep1">
                            <h3>Step 1: Choose Date Type</h3>
                            <div class="date-ideas-grid">
                                ${this.dateIdeas.map(idea => `
                                    <div class="date-idea-card" onclick="datingUIComponents.selectDateIdea('${idea.type}')">
                                        <div class="date-idea-icon">${this.getDateIcon(idea.type)}</div>
                                        <h4>${idea.name}</h4>
                                        <div class="date-idea-details">
                                            <span class="duration">⏰ ${idea.duration}</span>
                                            <span class="cost">💰 ${idea.cost}</span>
                                            <span class="safety">🔒 ${idea.safety}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="custom-date-option">
                                <button class="btn btn-secondary" onclick="datingUIComponents.showCustomDateInput()">
                                    ✨ Suggest Something Else
                                </button>
                            </div>
                        </div>
                        
                        <!-- Step 2: Date Details -->
                        <div class="date-step" id="dateStep2">
                            <h3>Step 2: Date Details</h3>
                            <div class="selected-date-info" id="selectedDateInfo">
                                <!-- Will be populated when date type is selected -->
                            </div>
                            
                            <div class="date-details-form">
                                <div class="form-group">
                                    <label>Preferred Day</label>
                                    <select id="dateDay">
                                        <option value="">Select a day...</option>
                                        <option value="today">Today</option>
                                        <option value="tomorrow">Tomorrow</option>
                                        <option value="this_weekend">This Weekend</option>
                                        <option value="next_week">Next Week</option>
                                        <option value="flexible">I'm Flexible</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label>Preferred Time</label>
                                    <select id="dateTime">
                                        <option value="">Select time...</option>
                                        <option value="morning">Morning (9-12 PM)</option>
                                        <option value="lunch">Lunch Time (12-2 PM)</option>
                                        <option value="afternoon">Afternoon (2-5 PM)</option>
                                        <option value="evening">Evening (6-9 PM)</option>
                                        <option value="night">Night (9+ PM)</option>
                                        <option value="flexible">I'm Flexible</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label>Location Preference</label>
                                    <select id="dateLocation">
                                        <option value="">Select location...</option>
                                        <option value="near_me">Near Me</option>
                                        <option value="near_you">Near You</option>
                                        <option value="midpoint">Somewhere Between Us</option>
                                        <option value="specific">I Have a Specific Place in Mind</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label>Personal Message (Optional)</label>
                                    <textarea id="dateMessage" placeholder="Add a personal touch to your date invitation..." rows="3"></textarea>
                                </div>
                            </div>
                            
                            <div class="date-step-actions">
                                <button class="btn btn-secondary" onclick="datingUIComponents.backToStep1()">
                                    ← Back
                                </button>
                                <button class="btn btn-primary" onclick="datingUIComponents.goToStep3()">
                                    Continue →
                                </button>
                            </div>
                        </div>
                        
                        <!-- Step 3: Safety & Confirmation -->
                        <div class="date-step" id="dateStep3">
                            <h3>Step 3: Safety & Confirmation</h3>
                            
                            <div class="safety-guidelines">
                                <h4>🔒 Safety First</h4>
                                <div class="safety-checklist">
                                    <label class="safety-item">
                                        <input type="checkbox" required>
                                        <span>Meet in a public place for the first date</span>
                                    </label>
                                    <label class="safety-item">
                                        <input type="checkbox" required>
                                        <span>Tell a friend about your date plans</span>
                                    </label>
                                    <label class="safety-item">
                                        <input type="checkbox" required>
                                        <span>Plan your own transportation</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="date-preview" id="datePreview">
                                <!-- Will be populated with date details -->
                            </div>
                            
                            <div class="date-step-actions">
                                <button class="btn btn-secondary" onclick="datingUIComponents.backToStep2()">
                                    ← Back
                                </button>
                                <button class="btn btn-primary" onclick="datingUIComponents.sendDateInvitation()">
                                    Send Invitation 💕
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    getDateIcon(type) {
        const icons = {
            coffee: '☕',
            dinner: '🍽️',
            activity: '🏌️',
            walk: '🚶‍♀️',
            museum: '🏛️',
            drinks: '🍻'
        };
        return icons[type] || '💕';
    }

    selectDateIdea(type) {
        const selectedIdea = this.dateIdeas.find(idea => idea.type === type);
        if (!selectedIdea) return;

        // Update selected date info
        const selectedDateInfo = document.getElementById('selectedDateInfo');
        if (selectedDateInfo) {
            selectedDateInfo.innerHTML = `
                <div class="selected-date-card">
                    <div class="selected-date-icon">${this.getDateIcon(type)}</div>
                    <div class="selected-date-details">
                        <h4>${selectedIdea.name}</h4>
                        <div class="selected-date-meta">
                            <span>⏰ ${selectedIdea.duration}</span>
                            <span>💰 ${selectedIdea.cost}</span>
                            <span>🔒 ${selectedIdea.safety}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // Move to step 2
        this.showDateStep(2);
    }

    showCustomDateInput() {
        const customInput = prompt('What kind of date would you like to suggest?');
        if (customInput && customInput.trim()) {
            const selectedDateInfo = document.getElementById('selectedDateInfo');
            if (selectedDateInfo) {
                selectedDateInfo.innerHTML = `
                    <div class="selected-date-card custom-date">
                        <div class="selected-date-icon">✨</div>
                        <div class="selected-date-details">
                            <h4>Custom Date Idea</h4>
                            <p>${customInput}</p>
                        </div>
                    </div>
                `;
            }
            this.showDateStep(2);
        }
    }

    showDateStep(stepNumber) {
        document.querySelectorAll('.date-step').forEach(step => step.classList.remove('active'));
        const targetStep = document.getElementById(`dateStep${stepNumber}`);
        if (targetStep) {
            targetStep.classList.add('active');
        }

        if (stepNumber === 3) {
            this.updateDatePreview();
        }
    }

    backToStep1() { this.showDateStep(1); }
    backToStep2() { this.showDateStep(2); }
    goToStep3() { this.showDateStep(3); }

    updateDatePreview() {
        const datePreview = document.getElementById('datePreview');
        if (!datePreview) return;

        const day = document.getElementById('dateDay')?.value || 'TBD';
        const time = document.getElementById('dateTime')?.value || 'TBD';
        const location = document.getElementById('dateLocation')?.value || 'TBD';
        const message = document.getElementById('dateMessage')?.value || '';

        datePreview.innerHTML = `
            <div class="date-preview-card">
                <h4>📋 Date Summary</h4>
                <div class="preview-details">
                    <div class="preview-item">
                        <strong>When:</strong> ${day} ${time !== 'TBD' ? `at ${time}` : ''}
                    </div>
                    <div class="preview-item">
                        <strong>Where:</strong> ${location}
                    </div>
                    ${message ? `
                        <div class="preview-item">
                            <strong>Your Message:</strong>
                            <div class="message-preview">"${message}"</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    sendDateInvitation() {
        // Check if safety checkboxes are checked
        const safetyCheckboxes = document.querySelectorAll('.safety-item input[type="checkbox"]');
        const allChecked = Array.from(safetyCheckboxes).every(cb => cb.checked);

        if (!allChecked) {
            showToast('Please confirm all safety guidelines', 'warning');
            return;
        }

        showToast('Date invitation sent! 💕', 'success');
        document.querySelector('.date-planning-modal').remove();
    }

    // 4. Safety Reporting Panel - Dating-specific safety tools
    showSafetyReportingPanel(reportType = 'general', targetUser = 'Unknown User') {
        const modal = document.createElement('div');
        modal.className = 'dating-modal safety-report-modal active';
        modal.innerHTML = `
            <div class="dating-modal-overlay">
                <div class="dating-modal-content safety-report-content">
                    <div class="safety-report-header">
                        <h2>🛡️ Safety Report</h2>
                        <p>Help us keep ConnectHub safe for everyone</p>
                        <button class="close-btn" onclick="this.closest('.dating-modal').remove()">×</button>
                    </div>
                    
                    <div class="report-form">
                        <div class="report-user-info">
                            <h3>Reporting: ${targetUser}</h3>
                            <p>Your report is confidential and helps protect our community</p>
                        </div>
                        
                        <div class="report-categories">
                            <h4>What happened?</h4>
                            <div class="report-options">
                                <label class="report-option">
                                    <input type="radio" name="reportReason" value="inappropriate_photos">
                                    <div class="report-option-content">
                                        <div class="report-icon">📸</div>
                                        <div>
                                            <strong>Inappropriate Photos</strong>
                                            <p>Nudity, sexual content, or offensive images</p>
                                        </div>
                                    </div>
                                </label>
                                
                                <label class="report-option">
                                    <input type="radio" name="reportReason" value="harassment">
                                    <div class="report-option-content">
                                        <div class="report-icon">💬</div>
                                        <div>
                                            <strong>Harassment or Abuse</strong>
                                            <p>Threatening, bullying, or abusive behavior</p>
                                        </div>
                                    </div>
                                </label>
                                
                                <label class="report-option">
                                    <input type="radio" name="reportReason" value="fake_profile">
                                    <div class="report-option-content">
                                        <div class="report-icon">🎭</div>
                                        <div>
                                            <strong>Fake Profile</strong>
                                            <p>Using someone else's photos or false information</p>
                                        </div>
                                    </div>
                                </label>
                                
                                <label class="report-option">
                                    <input type="radio" name="reportReason" value="spam">
                                    <div class="report-option-content">
                                        <div class="report-icon">📢</div>
                                        <div>
                                            <strong>Spam or Scam</strong>
                                            <p>Promotional content, bots, or fraudulent activity</p>
                                        </div>
                                    </div>
                                </label>
                                
                                <label class="report-option">
                                    <input type="radio" name="reportReason" value="underage">
                                    <div class="report-option-content">
                                        <div class="report-icon">🔞</div>
                                        <div>
                                            <strong>Underage User</strong>
                                            <p>User appears to be under 18 years old</p>
                                        </div>
                                    </div>
                                </label>
                                
                                <label class="report-option">
                                    <input type="radio" name="reportReason" value="violence">
                                    <div class="report-option-content">
                                        <div class="report-icon">⚠️</div>
                                        <div>
                                            <strong>Violence or Threats</strong>
                                            <p>Threats of violence or dangerous behavior</p>
                                        </div>
                                    </div>
                                </label>
                                
                                <label class="report-option">
                                    <input type="radio" name="reportReason" value="other">
                                    <div class="report-option-content">
                                        <div class="report-icon">❓</div>
                                        <div>
                                            <strong>Other</strong>
                                            <p>Something else that violates community guidelines</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div class="report-details">
                            <label for="reportDescription">Additional Details (Optional)</label>
                            <textarea id="reportDescription" placeholder="Please provide any additional information that might help us understand the situation..." rows="4"></textarea>
                        </div>
                        
                        <div class="evidence-upload">
                            <h4>Evidence (Optional)</h4>
                            <div class="upload-options">
                                <button type="button" class="btn btn-secondary btn-small" onclick="datingUIComponents.uploadScreenshot()">
                                    📱 Screenshot
                                </button>
                                <button type="button" class="btn btn-secondary btn-small" onclick="datingUIComponents.uploadMessages()">
                                    💬 Messages
                                </button>
                                <div class="upload-note">
                                    Screenshots and message logs help us review reports faster
                                </div>
                            </div>
                        </div>
                        
                        <div class="immediate-actions">
                            <h4>Immediate Actions</h4>
                            <div class="action-options">
                                <label class="action-option">
                                    <input type="checkbox" id="blockUser" checked>
                                    <span>Block this user (recommended)</span>
                                </label>
                                <label class="action-option">
                                    <input type="checkbox" id="unmatchUser" checked>
                                    <span>Remove match and delete conversation</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="emergency-help">
                            <div class="emergency-banner">
                                <h4>🚨 Need Immediate Help?</h4>
                                <p>If you're in immediate danger, contact local emergency services</p>
                                <div class="emergency-actions">
                                    <button class="btn btn-error" onclick="datingUIComponents.showEmergencyContacts()">
                                        Emergency Contacts
                                    </button>
                                    <button class="btn btn-warning" onclick="datingUIComponents.showSafetyResources()">
                                        Safety Resources
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="report-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.dating-modal').remove()">
                            Cancel
                        </button>
                        <button class="btn btn-primary" onclick="datingUIComponents.submitSafetyReport()">
                            Submit Report
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    uploadScreenshot() {
        showToast('Screenshot upload feature would open file picker', 'info');
    }

    uploadMessages() {
        showToast('Message export feature would gather conversation data', 'info');
    }

    showEmergencyContacts() {
        alert('Emergency Contacts:\n\n🇺🇸 Police/Fire/Medical: 911\n📞 Crisis Text Line: Text HOME to 741741\n💜 National Domestic Violence Hotline: 1-800-799-7233\n🗣️ National Suicide Prevention Lifeline: 988');
    }

    showSafetyResources() {
        alert('Safety Resources:\n\n• Meeting safely guide\n• Recognizing red flags\n• Online dating safety tips\n• Blocking and reporting tools\n• Community guidelines');
    }

    submitSafetyReport() {
        const selectedReason = document.querySelector('input[name="reportReason"]:checked');
        if (!selectedReason) {
            showToast('Please select a report reason', 'warning');
            return;
        }

        showLoading();
        setTimeout(() => {
            hideLoading();
            showToast('Report submitted. Thank you for helping keep our community safe.', 'success');
            
            // Apply immediate actions
            const blockUser = document.getElementById('blockUser')?.checked;
            const unmatchUser = document.getElementById('unmatchUser')?.checked;
            
            if (blockUser) {
                showToast('User has been blocked', 'info');
            }
            if (unmatchUser) {
                showToast('Match removed and conversation deleted', 'info');
            }
            
            document.querySelector('.safety-report-modal').remove();
        }, 2000);
    }

    // 5. Match Timeline View - Chronological match history
    showMatchTimelineView() {
        const modal = document.createElement('div');
        modal.className = 'dating-modal match-timeline-modal active';
        modal.innerHTML = `
            <div class="dating-modal-overlay">
                <div class="dating-modal-content match-timeline-content">
                    <div class="timeline-header">
                        <h2>📅 Match Timeline</h2>
                        <p>Your dating journey at a glance</p>
                        <button class="close-btn" onclick="this.closest('.dating-modal').remove()">×</button>
                    </div>
                    
                    <div class="timeline-filters">
                        <div class="filter-tabs">
                            <button class="timeline-filter active" onclick="datingUIComponents.filterTimeline('all')">
                                All Matches
                            </button>
                            <button class="timeline-filter" onclick="datingUIComponents.filterTimeline('active')">
                                Active Chats
                            </button>
                            <button class="timeline-filter" onclick="datingUIComponents.filterTimeline('planned_date')">
                                Planned Dates
                            </button>
                            <button class="timeline-filter" onclick="datingUIComponents.filterTimeline('expired')">
                                Expired
                            </button>
                        </div>
                        
                        <div class="timeline-stats">
                            <div class="stat-item">
                                <div class="stat-number">${this.matchTimeline.length}</div>
                                <div class="stat-label">Total Matches</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">${this.matchTimeline.filter(m => m.status === 'chatting').length}</div>
                                <div class="stat-label">Active Chats</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">${this.matchTimeline.filter(m => m.status === 'planned_date').length}</div>
                                <div class="stat-label">Planned Dates</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="timeline-container" id="timelineContainer">
                        ${this.renderMatchTimeline()}
                    </div>
                    
                    <div class="timeline-actions">
                        <button class="btn btn-secondary" onclick="datingUIComponents.exportMatchHistory()">
                            📊 Export History
                        </button>
                        <button class="btn btn-primary" onclick="this.closest('.dating-modal').remove()">
                            Close Timeline
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    renderMatchTimeline(filter = 'all') {
        const filteredMatches = filter === 'all' ? 
            this.matchTimeline : 
            this.matchTimeline.filter(match => match.status === filter);

        if (filteredMatches.length === 0) {
            return `
                <div class="timeline-empty">
                    <div class="empty-icon">💔</div>
                    <h3>No matches found</h3>
                    <p>Try adjusting your filter or start swiping to find new matches!</p>
                </div>
            `;
        }

        return filteredMatches.map(match => {
            const matchDate = new Date(match.matchDate);
            const timeAgo = this.getTimeAgo(matchDate);
            const statusIcon = this.getStatusIcon(match.status);
            const statusText = this.getStatusText(match.status);

            return `
                <div class="timeline-item ${match.status}" onclick="datingUIComponents.viewMatchDetails(${match.id})">
                    <div class="timeline-marker">${statusIcon}</div>
                    <div class="timeline-content">
                        <div class="timeline-match-info">
                            <div class="match-avatar">${match.avatar}</div>
                            <div class="match-details">
                                <h4>${match.name}</h4>
                                <div class="match-meta">
                                    <span class="compatibility">💕 ${match.compatibility}% match</span>
                                    <span class="match-date">📅 ${timeAgo}</span>
                                </div>
                            </div>
                            <div class="match-status">
                                <div class="status-badge ${match.status}">${statusText}</div>
                                <div class="message-count">${match.messages} messages</div>
                            </div>
                        </div>
                        
                        <div class="timeline-actions-inline">
                            ${match.status === 'matched' ? 
                                '<button class="btn btn-small btn-primary" onclick="event.stopPropagation(); datingUIComponents.sendMessage(' + match.id + ')">Send Message</button>' :
                                match.status === 'chatting' ?
                                '<button class="btn btn-small btn-primary" onclick="event.stopPropagation(); datingUIComponents.planDate(' + match.id + ')">Plan Date</button>' :
                                match.status === 'planned_date' ?
                                '<button class="btn btn-small btn-success" onclick="event.stopPropagation(); datingUIComponents.viewDateDetails(' + match.id + ')">View Date</button>' :
                                '<button class="btn btn-small btn-secondary" onclick="event.stopPropagation(); datingUIComponents.rematch(' + match.id + ')">Try Again</button>'
                            }
                            <button class="btn btn-small btn-secondary" onclick="event.stopPropagation(); datingUIComponents.showSafetyReportingPanel('general', '${match.name}')">Report</button>
                        </div>
                        
                        <div class="last-activity">
                            Last activity: ${match.lastMessage}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }

    getStatusIcon(status) {
        const icons = {
            matched: '💕',
            chatting: '💬',
            planned_date: '📅',
            expired: '⏰'
        };
        return icons[status] || '💕';
    }

    getStatusText(status) {
        const texts = {
            matched: 'New Match',
            chatting: 'Chatting',
            planned_date: 'Date Planned',
            expired: 'Expired'
        };
        return texts[status] || 'Unknown';
    }

    filterTimeline(filter) {
        // Update active filter
        document.querySelectorAll('.timeline-filter').forEach(f => f.classList.remove('active'));
        event.target.classList.add('active');
        
        // Re-render timeline
        const container = document.getElementById('timelineContainer');
        if (container) {
            container.innerHTML = this.renderMatchTimeline(filter);
        }
    }

    viewMatchDetails(matchId) {
        const match = this.matchTimeline.find(m => m.id === matchId);
        if (match) {
            showToast(`Opening ${match.name}'s profile...`, 'info');
        }
    }

    sendMessage(matchId) {
        const match = this.matchTimeline.find(m => m.id === matchId);
        if (match) {
            showToast(`Opening chat with ${match.name}...`, 'info');
        }
    }

    planDate(matchId) {
        const match = this.matchTimeline.find(m => m.id === matchId);
        if (match) {
            document.querySelector('.match-timeline-modal').remove();
            setTimeout(() => this.showDatePlanningAssistant(match.name), 100);
        }
    }

    viewDateDetails(matchId) {
        showToast('Opening date details...', 'info');
    }

    rematch(matchId) {
        showToast('Attempting to rematch...', 'info');
    }

    exportMatchHistory() {
        showToast('Match history exported to your downloads', 'success');
    }

    // 6. Icebreaker Suggestions - Conversation starters panel
    showIcebreakerSuggestions(matchName = 'Sarah', matchInterests = ['Travel', 'Music', 'Coffee']) {
        const modal = document.createElement('div');
        modal.className = 'dating-modal icebreaker-modal active';
        modal.innerHTML = `
            <div class="dating-modal-overlay">
                <div class="dating-modal-content icebreaker-content">
                    <div class="icebreaker-header">
                        <h2>💬 Icebreaker Ideas</h2>
                        <p>Start a great conversation with ${matchName}</p>
                        <button class="close-btn" onclick="this.closest('.dating-modal').remove()">×</button>
                    </div>
                    
                    <div class="icebreaker-categories">
                        <div class="category-tabs">
                            ${this.icebreakerCategories.map(category => `
                                <button class="category-tab ${category === 'funny' ? 'active' : ''}" 
                                        onclick="datingUIComponents.showIcebreakerCategory('${category}')">
                                    ${this.getCategoryIcon(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="icebreaker-suggestions" id="icebreakerSuggestions">
                        ${this.renderIcebreakers('funny', matchName, matchInterests)}
                    </div>
                    
                    <div class="personalized-suggestions">
                        <h3>🎯 Based on ${matchName}'s Interests</h3>
                        <div class="interest-based-icebreakers">
                            ${matchInterests.map(interest => `
                                <div class="interest-icebreaker">
                                    <div class="interest-tag">${interest}</div>
                                    <div class="icebreaker-text">${this.getInterestBasedIcebreaker(interest, matchName)}</div>
                                    <button class="btn btn-small btn-secondary" onclick="datingUIComponents.useIcebreaker('${this.getInterestBasedIcebreaker(interest, matchName)}')">
                                        Use This
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="custom-icebreaker">
                        <h3>✨ Create Your Own</h3>
                        <div class="custom-icebreaker-form">
                            <textarea id="customIcebreaker" placeholder="Write your own personalized message..." rows="3"></textarea>
                            <button class="btn btn-primary" onclick="datingUIComponents.useCustomIcebreaker()">
                                Use Custom Message
                            </button>
                        </div>
                    </div>
                    
                    <div class="icebreaker-tips">
                        <h4>💡 Pro Tips</h4>
                        <ul>
                            <li>Ask open-ended questions to encourage conversation</li>
                            <li>Reference their interests or photos</li>
                            <li>Be genuine and avoid generic messages</li>
                            <li>Keep it light and fun for the first message</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    getCategoryIcon(category) {
        const icons = {
            funny: '😄',
            thoughtful: '💭',
            flirty: '😉',
            casual: '😊'
        };
        return icons[category] || '💬';
    }

    renderIcebreakers(category, matchName, matchInterests) {
        const icebreakers = this.getIcebreakersByCategory(category, matchName, matchInterests);
        
        return `
            <div class="icebreaker-list">
                ${icebreakers.map((icebreaker, index) => `
                    <div class="icebreaker-item">
                        <div class="icebreaker-number">${index + 1}</div>
                        <div class="icebreaker-text">${icebreaker}</div>
                        <div class="icebreaker-actions">
                            <button class="btn btn-small btn-primary" onclick="datingUIComponents.useIcebreaker('${icebreaker}')">
                                Use This
                            </button>
                            <button class="btn btn-small btn-secondary" onclick="datingUIComponents.editIcebreaker('${icebreaker}')">
                                Edit
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getIcebreakersByCategory(category, matchName, matchInterests) {
        const icebreakers = {
            funny: [
                `If you were a vegetable, what vegetable would you be and why? 🥕`,
                `What's the most unusual thing you've ever eaten? I promise not to judge... much 😄`,
                `If you had to wear a warning label, what would yours say?`,
                `What's your go-to dance move? Asking for a friend... 💃`,
                `If you could only communicate through movie quotes for a day, which movie would you choose?`,
                `What's the weirdest compliment you've ever received?`,
                `If we were in a zombie apocalypse together, what would your role be in our survival group?`
            ],
            thoughtful: [
                `What's something you've learned recently that completely changed your perspective?`,
                `If you could have dinner with anyone, living or dead, who would it be and what would you ask them?`,
                `What's a belief you held strongly that you've since changed your mind about?`,
                `What's the most meaningful piece of advice you've ever received?`,
                `If you could master one skill overnight, what would it be and how would you use it?`,
                `What's something you're passionate about that most people don't know?`,
                `What's a small act of kindness that had a big impact on you?`
            ],
            flirty: [
                `I have to ask... are you always this charming in your photos, or did you save the best for last? 😉`,
                `I'm usually pretty good with words, but you've got me a little tongue-tied. How do you do that?`,
                `Fair warning: I might be a little nervous if we meet up. You're kind of stunning 💕`,
                `I've been trying to come up with a clever pickup line, but honestly, your smile already picked me up`,
                `So... when can I take you somewhere as beautiful as you are?`,
                `I'm not a photographer, but I can definitely picture us together ✨`,
                `Do you believe in love at first swipe, or should I unmatch and swipe right again? 😘`
            ],
            casual: [
                `Hey ${matchName}! How's your week going? 😊`,
                `Hi! I noticed we both like ${matchInterests[0] || 'similar things'}. What got you into that?`,
                `Hope you're having a great day! What's been the highlight so far?`,
                `Hey there! I'm curious - what's been keeping you busy lately?`,
                `Hi ${matchName}! Quick question: coffee person or tea person?`,
                `Hello! I saw your profile and had to say hi. What's your favorite way to spend weekends?`,
                `Hey! I'm new to this whole dating app thing. Any tips? 😅`
            ]
        };

        return icebreakers[category] || icebreakers.casual;
    }

    getInterestBasedIcebreaker(interest, matchName) {
        const interestIcebreakers = {
            'Travel': `I saw you're into travel! What's the most incredible place you've visited? I'm always looking for new destinations to add to my bucket list ✈️`,
            'Music': `I noticed you love music! What's been on your playlist lately? I'm always looking for new artists to discover 🎵`,
            'Coffee': `A fellow coffee lover! ☕ What's your go-to order? I'm always curious about people's coffee preferences`,
            'Food': `I see you're a foodie! What's the best meal you've had recently? I love trying new restaurants 🍽️`,
            'Photography': `I noticed you're into photography! Do you have a favorite subject to shoot? Your photos are really impressive 📸`,
            'Books': `A book lover! What's the last book that completely captivated you? I'm always looking for my next great read 📚`,
            'Fitness': `I see you're into fitness! What's your favorite way to stay active? I'm always looking for workout inspiration 💪`,
            'Art': `I noticed you appreciate art! Do you create or just enjoy? I'd love to hear about what speaks to you artistically 🎨`,
            'Movies': `A movie buff! What's the last film that really impressed you? I'm always looking for recommendations 🎬`,
            'Sports': `I see you're into sports! What team gets you the most excited? Fair warning: I might become your biggest rival or fan 😄`,
            'Technology': `A tech enthusiast! What's the coolest piece of technology you've encountered lately? I love hearing about innovations 💻`,
            'Gaming': `A fellow gamer! What's been consuming all your free time lately? I promise not to judge your gaming choices... much 🎮`,
            'Dancing': `I noticed you love dancing! What's your style? I have two left feet but I admire anyone who can move with rhythm 💃`,
            'Hiking': `A hiking enthusiast! What's your favorite trail or outdoor adventure? I love hearing about people's outdoor experiences 🥾`,
            'Cooking': `I see you enjoy cooking! What's your signature dish? I'm always looking for new recipes to attempt 👨‍🍳`,
            'Fashion': `I noticed you have great style! Where do you find your fashion inspiration? You clearly have an eye for it ✨`,
            'Science': `A science lover! What area fascinates you most? I love learning about new discoveries and theories 🔬`
        };

        return interestIcebreakers[interest] || `I noticed you're interested in ${interest}! That's really cool - what got you into it?`;
    }

    showIcebreakerCategory(category) {
        // Update active category
        document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');

        // Get current context
        const matchName = document.querySelector('.icebreaker-header p').textContent.includes('with') ? 
            document.querySelector('.icebreaker-header p').textContent.split('with ')[1] : 'Sarah';
        const matchInterests = ['Travel', 'Music', 'Coffee']; // Default interests

        // Update suggestions
        const suggestionsContainer = document.getElementById('icebreakerSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.innerHTML = this.renderIcebreakers(category, matchName, matchInterests);
        }
    }

    useIcebreaker(message) {
        // Copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(message).then(() => {
                showToast('Message copied to clipboard! 📋', 'success');
            });
        } else {
            // Fallback for older browsers
            showToast('Message ready to send: ' + message, 'info');
        }
        
        // Close modal after a delay
        setTimeout(() => {
            document.querySelector('.icebreaker-modal')?.remove();
        }, 1500);
    }

    editIcebreaker(message) {
        const editedMessage = prompt('Edit your message:', message);
        if (editedMessage && editedMessage.trim()) {
            this.useIcebreaker(editedMessage);
        }
    }

    useCustomIcebreaker() {
        const customMessage = document.getElementById('customIcebreaker')?.value.trim();
        if (customMessage) {
            this.useIcebreaker(customMessage);
        } else {
            showToast('Please write a custom message first', 'warning');
        }
    }

    // Utility method to close modals
    closeModal(modal) {
        if (modal) {
            modal.remove();
        }
    }
}

// Initialize the dating UI components
let datingUIComponents = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof DatingMissingUIComponents !== 'undefined') {
        datingUIComponents = new DatingMissingUIComponents();
        console.log('Dating UI Components initialized successfully');
    }
});

// Expose to global scope for onclick handlers
if (typeof window !== 'undefined') {
    window.DatingMissingUIComponents = DatingMissingUIComponents;
}
