/**
 * Dating Final UI Components
 * 6 Final Critical Dating Interface Implementations
 * 
 * These interfaces complete the dating experience with:
 * 1. Swipe Animation Tutorial Interface - Interactive tutorial for new users
 * 2. Profile Boost Analytics Dashboard - Shows boost performance metrics  
 * 3. Date Safety Check-in System - Safety feature for actual dates
 * 4. Advanced Matching Algorithm Preferences - AI-powered matching settings
 * 5. Dating Profile Completeness Checker - Profile optimization tool
 * 6. Match Icebreaker Generator - AI-powered conversation starters
 */

class DatingFinalUIComponents {
    constructor() {
        this.tutorialStep = 0;
        this.profileCompleteness = 0;
        this.matchingPreferences = {
            aiEnabled: true,
            compatibilityWeight: 0.7,
            interestWeight: 0.5,
            locationWeight: 0.3,
            activityWeight: 0.6
        };
        this.safetyCheckIn = {
            active: false,
            location: null,
            emergencyContact: null,
            checkInTime: null
        };
        
        this.initializeComponents();
    }

    initializeComponents() {
        console.log('Dating Final UI Components initialized');
        this.bindGlobalEvents();
    }

    bindGlobalEvents() {
        // Listen for escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('dating-final-modal-overlay')) {
                this.closeModal(e.target.closest('.dating-final-modal'));
            }
        });
    }

    closeAllModals() {
        document.querySelectorAll('.dating-final-modal.active').forEach(modal => {
            this.closeModal(modal);
        });
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    // 1. Swipe Animation Tutorial Interface - Interactive tutorial for new users
    showSwipeAnimationTutorial() {
        const modal = document.createElement('div');
        modal.className = 'dating-final-modal swipe-tutorial-modal active';
        modal.innerHTML = `
            <div class="dating-final-modal-overlay">
                <div class="dating-final-modal-content swipe-tutorial-content">
                    <div class="tutorial-header">
                        <h2>💕 Learn to Swipe</h2>
                        <p>Master the art of finding your perfect match</p>
                        <button class="tutorial-close-btn" onclick="this.closest('.dating-final-modal').remove()">×</button>
                    </div>
                    
                    <div class="tutorial-steps">
                        <!-- Step 1: Basic Swiping -->
                        <div class="tutorial-step ${this.tutorialStep === 0 ? 'active' : ''}" id="tutorialStep0">
                            <div class="step-content">
                                <h3>Step 1: Basic Swiping</h3>
                                <div class="interactive-demo">
                                    <div class="demo-card" id="demoCard1">
                                        <div class="demo-profile">
                                            <div class="demo-avatar">😊</div>
                                            <div class="demo-info">
                                                <h4>Alex, 25</h4>
                                                <p>2 miles away</p>
                                                <div class="demo-interests">
                                                    <span class="interest-tag">Coffee</span>
                                                    <span class="interest-tag">Travel</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="swipe-indicators">
                                            <div class="swipe-indicator left">
                                                <i class="fas fa-times"></i>
                                                <span>Pass</span>
                                            </div>
                                            <div class="swipe-indicator right">
                                                <i class="fas fa-heart"></i>
                                                <span>Like</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="step-instructions">
                                    <p><strong>Swipe Right</strong> to like someone</p>
                                    <p><strong>Swipe Left</strong> to pass</p>
                                    <p>Try swiping the card above!</p>
                                </div>
                                
                                <div class="step-actions">
                                    <button class="btn btn-primary" onclick="datingFinalUI.nextTutorialStep()" disabled id="step1NextBtn">
                                        Practice Swiping First
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Step 2: Super Likes -->
                        <div class="tutorial-step ${this.tutorialStep === 1 ? 'active' : ''}" id="tutorialStep1">
                            <div class="step-content">
                                <h3>Step 2: Super Likes</h3>
                                <div class="interactive-demo">
                                    <div class="demo-card superlike-demo" id="demoCard2">
                                        <div class="demo-profile">
                                            <div class="demo-avatar">✨</div>
                                            <div class="demo-info">
                                                <h4>Jordan, 28</h4>
                                                <p>1 mile away</p>
                                                <div class="demo-interests">
                                                    <span class="interest-tag">Music</span>
                                                    <span class="interest-tag">Art</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="superlike-indicator">
                                            <i class="fas fa-star"></i>
                                            <span>Swipe Up for Super Like!</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="step-instructions">
                                    <p><strong>Swipe Up</strong> to send a Super Like</p>
                                    <p>Super Likes make you stand out and get noticed first!</p>
                                    <p>You get 1 free Super Like per day</p>
                                </div>
                                
                                <div class="step-actions">
                                    <button class="btn btn-secondary" onclick="datingFinalUI.prevTutorialStep()">
                                        Previous
                                    </button>
                                    <button class="btn btn-primary" onclick="datingFinalUI.nextTutorialStep()">
                                        Next: Profile Tips
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Step 3: Profile Tips -->
                        <div class="tutorial-step ${this.tutorialStep === 2 ? 'active' : ''}" id="tutorialStep2">
                            <div class="step-content">
                                <h3>Step 3: Profile Browsing Tips</h3>
                                <div class="tips-grid">
                                    <div class="tip-item">
                                        <i class="fas fa-images"></i>
                                        <div>
                                            <h4>Check All Photos</h4>
                                            <p>Tap on photos to see more</p>
                                        </div>
                                    </div>
                                    <div class="tip-item">
                                        <i class="fas fa-user"></i>
                                        <div>
                                            <h4>Read the Bio</h4>
                                            <p>Learn about their interests</p>
                                        </div>
                                    </div>
                                    <div class="tip-item">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <div>
                                            <h4>Check Distance</h4>
                                            <p>Consider how far they are</p>
                                        </div>
                                    </div>
                                    <div class="tip-item">
                                        <i class="fas fa-shield-alt"></i>
                                        <div>
                                            <h4>Verification Badge</h4>
                                            <p>Look for verified profiles</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="step-actions">
                                    <button class="btn btn-secondary" onclick="datingFinalUI.prevTutorialStep()">
                                        Previous
                                    </button>
                                    <button class="btn btn-primary" onclick="datingFinalUI.completeTutorial()">
                                        Start Swiping! 🎉
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tutorial-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${((this.tutorialStep + 1) / 3) * 100}%"></div>
                        </div>
                        <span class="progress-text">${this.tutorialStep + 1} of 3</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupTutorialInteractions();
    }

    setupTutorialInteractions() {
        // Make demo cards interactive
        const demoCard1 = document.getElementById('demoCard1');
        if (demoCard1) {
            let isDragging = false;
            let startX = 0;
            let currentX = 0;
            
            demoCard1.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                demoCard1.style.cursor = 'grabbing';
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                currentX = e.clientX - startX;
                demoCard1.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.1}deg)`;
                
                // Show swipe indicators based on direction
                if (Math.abs(currentX) > 50) {
                    document.getElementById('step1NextBtn').disabled = false;
                    document.getElementById('step1NextBtn').textContent = 'Great! Continue →';
                }
            });
            
            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    demoCard1.style.cursor = 'grab';
                    if (Math.abs(currentX) > 100) {
                        // Card swiped successfully
                        demoCard1.style.transform = `translateX(${currentX > 0 ? 300 : -300}px) rotate(${currentX * 0.2}deg)`;
                        setTimeout(() => {
                            demoCard1.style.transform = 'translateX(0) rotate(0)';
                        }, 500);
                    } else {
                        // Snap back
                        demoCard1.style.transform = 'translateX(0) rotate(0)';
                    }
                }
            });
        }
    }

    nextTutorialStep() {
        if (this.tutorialStep < 2) {
            this.tutorialStep++;
            document.querySelectorAll('.tutorial-step').forEach(step => step.classList.remove('active'));
            document.getElementById(`tutorialStep${this.tutorialStep}`).classList.add('active');
            
            // Update progress
            const progressFill = document.querySelector('.progress-fill');
            const progressText = document.querySelector('.progress-text');
            if (progressFill) progressFill.style.width = `${((this.tutorialStep + 1) / 3) * 100}%`;
            if (progressText) progressText.textContent = `${this.tutorialStep + 1} of 3`;
        }
    }

    prevTutorialStep() {
        if (this.tutorialStep > 0) {
            this.tutorialStep--;
            document.querySelectorAll('.tutorial-step').forEach(step => step.classList.remove('active'));
            document.getElementById(`tutorialStep${this.tutorialStep}`).classList.add('active');
            
            // Update progress
            const progressFill = document.querySelector('.progress-fill');
            const progressText = document.querySelector('.progress-text');
            if (progressFill) progressFill.style.width = `${((this.tutorialStep + 1) / 3) * 100}%`;
            if (progressText) progressText.textContent = `${this.tutorialStep + 1} of 3`;
        }
    }

    completeTutorial() {
        showToast('Tutorial completed! Happy swiping! 💕', 'success');
        this.closeAllModals();
    }

    // 2. Profile Boost Analytics Dashboard - Shows boost performance metrics
    showBoostAnalyticsDashboard() {
        const modal = document.createElement('div');
        modal.className = 'dating-final-modal boost-analytics-modal active';
        modal.innerHTML = `
            <div class="dating-final-modal-overlay">
                <div class="dating-final-modal-content boost-analytics-content">
                    <div class="analytics-header">
                        <h2>🚀 Boost Analytics</h2>
                        <p>See how your boosts performed</p>
                        <button class="analytics-close-btn" onclick="this.closest('.dating-final-modal').remove()">×</button>
                    </div>
                    
                    <div class="boost-summary">
                        <div class="summary-card">
                            <div class="summary-icon">📊</div>
                            <div class="summary-stats">
                                <h3>Last Boost Performance</h3>
                                <div class="boost-metrics">
                                    <div class="metric">
                                        <span class="metric-value">847</span>
                                        <span class="metric-label">Profile Views</span>
                                        <span class="metric-change">+523% vs normal</span>
                                    </div>
                                    <div class="metric">
                                        <span class="metric-value">34</span>
                                        <span class="metric-label">New Likes</span>
                                        <span class="metric-change">+890% vs normal</span>
                                    </div>
                                    <div class="metric">
                                        <span class="metric-value">12</span>
                                        <span class="metric-label">New Matches</span>
                                        <span class="metric-change">+1200% vs normal</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="boost-timeline">
                        <h3>Boost History</h3>
                        <div class="timeline-list">
                            <div class="timeline-item">
                                <div class="timeline-date">
                                    <div class="date-day">15</div>
                                    <div class="date-month">Mar</div>
                                </div>
                                <div class="timeline-content">
                                    <h4>Evening Boost</h4>
                                    <div class="boost-results">
                                        <span class="result">👁️ 847 views</span>
                                        <span class="result">💕 34 likes</span>
                                        <span class="result">✨ 12 matches</span>
                                    </div>
                                    <div class="boost-duration">30 minutes • $4.99</div>
                                </div>
                                <div class="timeline-rating">
                                    <div class="rating-stars">⭐⭐⭐⭐⭐</div>
                                    <div class="rating-label">Excellent</div>
                                </div>
                            </div>
                            
                            <div class="timeline-item">
                                <div class="timeline-date">
                                    <div class="date-day">10</div>
                                    <div class="date-month">Mar</div>
                                </div>
                                <div class="timeline-content">
                                    <h4>Weekend Boost</h4>
                                    <div class="boost-results">
                                        <span class="result">👁️ 623 views</span>
                                        <span class="result">💕 28 likes</span>
                                        <span class="result">✨ 8 matches</span>
                                    </div>
                                    <div class="boost-duration">30 minutes • $4.99</div>
                                </div>
                                <div class="timeline-rating">
                                    <div class="rating-stars">⭐⭐⭐⭐</div>
                                    <div class="rating-label">Great</div>
                                </div>
                            </div>
                            
                            <div class="timeline-item">
                                <div class="timeline-date">
                                    <div class="date-day">05</div>
                                    <div class="date-month">Mar</div>
                                </div>
                                <div class="timeline-content">
                                    <h4>Lunch Break Boost</h4>
                                    <div class="boost-results">
                                        <span class="result">👁️ 445 views</span>
                                        <span class="result">💕 18 likes</span>
                                        <span class="result">✨ 5 matches</span>
                                    </div>
                                    <div class="boost-duration">30 minutes • $4.99</div>
                                </div>
                                <div class="timeline-rating">
                                    <div class="rating-stars">⭐⭐⭐</div>
                                    <div class="rating-label">Good</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="boost-insights">
                        <h3>🔍 Insights & Recommendations</h3>
                        <div class="insights-grid">
                            <div class="insight-card">
                                <div class="insight-icon">🕘</div>
                                <div class="insight-content">
                                    <h4>Best Time to Boost</h4>
                                    <p>Sunday 7-9 PM gets you the most matches</p>
                                    <div class="insight-action">
                                        <button class="btn btn-small btn-primary" onclick="datingFinalUI.scheduleBoost()">
                                            Schedule Boost
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="insight-card">
                                <div class="insight-icon">📍</div>
                                <div class="insight-content">
                                    <h4>Location Impact</h4>
                                    <p>Boosts work 40% better in downtown areas</p>
                                    <div class="insight-tip">Tip: Boost when you're in busy areas</div>
                                </div>
                            </div>
                            
                            <div class="insight-card">
                                <div class="insight-icon">📸</div>
                                <div class="insight-content">
                                    <h4>Profile Optimization</h4>
                                    <p>Update your main photo to get 25% more matches</p>
                                    <div class="insight-action">
                                        <button class="btn btn-small btn-secondary" onclick="datingFinalUI.optimizeProfile()">
                                            Optimize Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analytics-actions">
                        <button class="btn btn-secondary" onclick="datingFinalUI.exportBoostData()">
                            📊 Export Data
                        </button>
                        <button class="btn btn-primary" onclick="datingFinalUI.showBoostPurchase()">
                            🚀 Buy More Boosts
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    scheduleBoost() {
        showToast('Boost scheduled for Sunday 7 PM! 🚀', 'success');
    }

    optimizeProfile() {
        this.closeAllModals();
        setTimeout(() => this.showProfileCompletenessChecker(), 300);
    }

    exportBoostData() {
        showToast('Boost analytics exported to your downloads 📊', 'success');
    }

    showBoostPurchase() {
        showToast('Opening boost purchase options... 💳', 'info');
    }

    // 3. Date Safety Check-in System - Safety feature for actual dates
    showDateSafetyCheckIn() {
        const modal = document.createElement('div');
        modal.className = 'dating-final-modal safety-checkin-modal active';
        modal.innerHTML = `
            <div class="dating-final-modal-overlay">
                <div class="dating-final-modal-content safety-checkin-content">
                    <div class="safety-header">
                        <h2>🛡️ Date Safety Check-in</h2>
                        <p>Stay safe while meeting new people</p>
                        <button class="safety-close-btn" onclick="this.closest('.dating-final-modal').remove()">×</button>
                    </div>
                    
                    <div class="safety-setup">
                        <div class="setup-step">
                            <h3>📍 Set Your Date Location</h3>
                            <div class="location-input">
                                <input type="text" id="dateLocation" placeholder="Enter restaurant, café, or venue name" class="location-field">
                                <button class="btn btn-secondary btn-small" onclick="datingFinalUI.getCurrentLocation()">
                                    📍 Use Current Location
                                </button>
                            </div>
                            <div class="location-suggestion">
                                <i class="fas fa-lightbulb"></i>
                                <span>Choose a public place for your first date</span>
                            </div>
                        </div>
                        
                        <div class="setup-step">
                            <h3>👥 Emergency Contact</h3>
                            <div class="contact-selection">
                                <select id="emergencyContact" class="contact-dropdown">
                                    <option value="">Select emergency contact...</option>
                                    <option value="mom">Mom - (555) 123-4567</option>
                                    <option value="dad">Dad - (555) 234-5678</option>
                                    <option value="best_friend">Sarah (Best Friend) - (555) 345-6789</option>
                                    <option value="sibling">Alex (Sibling) - (555) 456-7890</option>
                                    <option value="custom">+ Add New Contact</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="setup-step">
                            <h3>⏰ Check-in Schedule</h3>
                            <div class="checkin-options">
                                <label class="checkin-option">
                                    <input type="radio" name="checkinTime" value="30" checked>
                                    <span>Every 30 minutes</span>
                                </label>
                                <label class="checkin-option">
                                    <input type="radio" name="checkinTime" value="60">
                                    <span>Every 1 hour</span>
                                </label>
                                <label class="checkin-option">
                                    <input type="radio" name="checkinTime" value="120">
                                    <span>Every 2 hours</span>
                                </label>
                                <label class="checkin-option">
                                    <input type="radio" name="checkinTime" value="custom">
                                    <span>Custom time</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="setup-step">
                            <h3>📱 Safety Features</h3>
                            <div class="safety-features">
                                <label class="safety-feature">
                                    <input type="checkbox" checked>
                                    <span>Send location updates to emergency contact</span>
                                </label>
                                <label class="safety-feature">
                                    <input type="checkbox" checked>
                                    <span>Quick exit call if you need help</span>
                                </label>
                                <label class="safety-feature">
                                    <input type="checkbox">
                                    <span>Auto-notify contact if check-in is missed</span>
                                </label>
                                <label class="safety-feature">
                                    <input type="checkbox">
                                    <span>Share date details with trusted friend</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="safety-tips">
                        <h4>💡 Safety Tips</h4>
                        <ul class="tips-list">
                            <li>Meet in a public place</li>
                            <li>Drive yourself or use your own transportation</li>
                            <li>Tell a friend about your date plans</li>
                            <li>Trust your instincts - leave if you feel uncomfortable</li>
                            <li>Keep your phone charged and accessible</li>
                        </ul>
                    </div>
                    
                    <div class="emergency-actions">
                        <div class="emergency-buttons">
                            <button class="btn btn-danger" onclick="datingFinalUI.emergencyCall()">
                                🚨 Emergency Call
                            </button>
                            <button class="btn btn-warning" onclick="datingFinalUI.quickExit()">
                                📞 Quick Exit Call
                            </button>
                        </div>
                    </div>
                    
                    <div class="safety-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.dating-final-modal').remove()">
                            Cancel
                        </button>
                        <button class="btn btn-primary" onclick="datingFinalUI.activateSafetyCheckIn()">
                            🛡️ Activate Safety Check-in
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    getCurrentLocation() {
        showToast('Getting current location... 📍', 'info');
        document.getElementById('dateLocation').value = 'Downtown Coffee Shop, 123 Main St';
    }

    emergencyCall() {
        if (confirm('This will call emergency services (911). Do you need immediate help?')) {
            showToast('Calling emergency services... 🚨', 'error');
            // In a real app, this would initiate an emergency call
        }
    }

    quickExit() {
        showToast('Calling your emergency contact with pre-planned excuse... 📞', 'info');
        // In a real app, this would call the emergency contact
    }

    activateSafetyCheckIn() {
        this.safetyCheckIn.active = true;
        this.safetyCheckIn.location = document.getElementById('dateLocation').value;
        this.safetyCheckIn.emergencyContact = document.getElementById('emergencyContact').value;
        this.safetyCheckIn.checkInTime = document.querySelector('input[name="checkinTime"]:checked').value;
        
        showToast('Safety check-in activated! Stay safe! 🛡️', 'success');
        this.closeAllModals();
        
        // Start safety check-in process
        this.startSafetyCheckIn();
    }

    startSafetyCheckIn() {
        // Simulate periodic check-ins
        const checkInInterval = parseInt(this.safetyCheckIn.checkInTime) * 60 * 1000; // Convert to milliseconds
        
        setTimeout(() => {
            if (this.safetyCheckIn.active) {
                this.showCheckInPrompt();
            }
        }, checkInInterval);
    }

    showCheckInPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'safety-prompt';
        prompt.innerHTML = `
            <div class="prompt-content">
                <h4>🛡️ Safety Check-in</h4>
                <p>Are you okay? Check in to let us know you're safe.</p>
                <div class="prompt-actions">
                    <button class="btn btn-success btn-small" onclick="datingFinalUI.confirmSafety()">
                        I'm Safe ✓
                    </button>
                    <button class="btn btn-danger btn-small" onclick="datingFinalUI.requestHelp()">
                        Need Help!
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(prompt);
        
        // Auto-expire after 5 minutes
        setTimeout(() => {
            if (document.contains(prompt)) {
                this.requestHelp();
                prompt.remove();
            }
        }, 300000);
    }

    confirmSafety() {
        document.querySelector('.safety-prompt')?.remove();
        showToast('Check-in confirmed. Enjoy your date! 💕', 'success');
        
        // Schedule next check-in
        if (this.safetyCheckIn.active) {
            this.startSafetyCheckIn();
        }
    }

    requestHelp() {
        document.querySelector('.safety-prompt')?.remove();
        showToast('Alerting emergency contact and providing assistance... 🚨', 'error');
        this.safetyCheckIn.active = false;
    }

    // 4. Advanced Matching Algorithm Preferences - AI-powered matching settings
    showAdvancedMatchingPreferences() {
        const modal = document.createElement('div');
        modal.className = 'dating-final-modal matching-preferences-modal active';
        modal.innerHTML = `
            <div class="dating-final-modal-overlay">
                <div class="dating-final-modal-content matching-preferences-content">
                    <div class="preferences-header">
                        <h2>🧠 AI Matching Preferences</h2>
                        <p>Customize how our algorithm finds your perfect matches</p>
                        <button class="preferences-close-btn" onclick="this.closest('.dating-final-modal').remove()">×</button>
                    </div>
                    
                    <div class="ai-toggle">
                        <div class="toggle-header">
                            <h3>🤖 AI-Powered Matching</h3>
                            <label class="toggle-switch">
                                <input type="checkbox" id="aiEnabled" ${this.matchingPreferences.aiEnabled ? 'checked' : ''} onchange="datingFinalUI.toggleAI()">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <p class="ai-description">Let AI learn your preferences and find better matches over time</p>
                    </div>
                    
                    <div class="preferences-weights ${this.matchingPreferences.aiEnabled ? '' : 'disabled'}">
                        <h3>🎯 Matching Priorities</h3>
                        <p>Adjust what matters most to you in potential matches</p>
                        
                        <div class="weight-controls">
                            <div class="weight-control">
                                <label>💕 Compatibility Score</label>
                                <div class="weight-slider">
                                    <input type="range" id="compatibilityWeight" min="0" max="1" step="0.1" 
                                           value="${this.matchingPreferences.compatibilityWeight}" 
                                           oninput="datingFinalUI.updateWeight('compatibility', this.value)">
                                    <div class="weight-display">${Math.round(this.matchingPreferences.compatibilityWeight * 100)}%</div>
                                </div>
                                <p class="weight-description">Based on personality, values, and relationship goals</p>
                            </div>
                            
                            <div class="weight-control">
                                <label>🎨 Shared Interests</label>
                                <div class="weight-slider">
                                    <input type="range" id="interestWeight" min="0" max="1" step="0.1" 
                                           value="${this.matchingPreferences.interestWeight}" 
                                           oninput="datingFinalUI.updateWeight('interest', this.value)">
                                    <div class="weight-display">${Math.round(this.matchingPreferences.interestWeight * 100)}%</div>
                                </div>
                                <p class="weight-description">Hobbies, activities, and passion alignment</p>
                            </div>
                            
                            <div class="weight-control">
                                <label>📍 Location Proximity</label>
                                <div class="weight-slider">
                                    <input type="range" id="locationWeight" min="0" max="1" step="0.1" 
                                           value="${this.matchingPreferences.locationWeight}" 
                                           oninput="datingFinalUI.updateWeight('location', this.value)">
                                    <div class="weight-display">${Math.round(this.matchingPreferences.locationWeight * 100)}%</div>
                                </div>
                                <p class="weight-description">How important distance is for potential matches</p>
                            </div>
                            
                            <div class="weight-control">
                                <label>📱 Activity Level</label>
                                <div class="weight-slider">
                                    <input type="range" id="activityWeight" min="0" max="1" step="0.1" 
                                           value="${this.matchingPreferences.activityWeight}" 
                                           oninput="datingFinalUI.updateWeight('activity', this.value)">
                                    <div class="weight-display">${Math.round(this.matchingPreferences.activityWeight * 100)}%</div>
                                </div>
                                <p class="weight-description">How active they are on the app and responsiveness</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ai-insights">
                        <h3>📊 AI Insights</h3>
                        <div class="insights-list">
                            <div class="insight-item">
                                <div class="insight-icon">🎯</div>
                                <div class="insight-content">
                                    <h4>Your Match Pattern</h4>
                                    <p>You tend to match with creative professionals who live within 10 miles</p>
                                </div>
                            </div>
                            <div class="insight-item">
                                <div class="insight-icon">💡</div>
                                <div class="insight-content">
                                    <h4>Success Tip</h4>
                                    <p>Profiles with detailed bios get 3x more responses from your matches</p>
                                </div>
                            </div>
                            <div class="insight-item">
                                <div class="insight-icon">⚡</div>
                                <div class="insight-content">
                                    <h4>Optimization Suggestion</h4>
                                    <p>Consider increasing interest weight - shared hobbies lead to 40% longer conversations</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="preferences-actions">
                        <button class="btn btn-secondary" onclick="datingFinalUI.resetMatchingPreferences()">
                            Reset to Defaults
                        </button>
                        <button class="btn btn-primary" onclick="datingFinalUI.saveMatchingPreferences()">
                            Save Preferences
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    toggleAI() {
        this.matchingPreferences.aiEnabled = !this.matchingPreferences.aiEnabled;
        const weightsSection = document.querySelector('.preferences-weights');
        if (weightsSection) {
            weightsSection.classList.toggle('disabled', !this.matchingPreferences.aiEnabled);
        }
    }

    updateWeight(type, value) {
        const weightType = type + 'Weight';
        this.matchingPreferences[weightType] = parseFloat(value);
        
        // Update display
        const display = document.querySelector(`#${type}Weight`).nextElementSibling;
        if (display) {
            display.textContent = `${Math.round(value * 100)}%`;
        }
    }

    resetMatchingPreferences() {
        this.matchingPreferences = {
            aiEnabled: true,
            compatibilityWeight: 0.7,
            interestWeight: 0.5,
            locationWeight: 0.3,
            activityWeight: 0.6
        };
        
        this.closeAllModals();
        setTimeout(() => this.showAdvancedMatchingPreferences(), 100);
    }

    saveMatchingPreferences() {
        showToast('AI matching preferences saved! 🧠', 'success');
        this.closeAllModals();
    }

    // 5. Dating Profile Completeness Checker - Profile optimization tool
    showProfileCompletenessChecker() {
        // Calculate profile completeness
        const profileData = this.calculateProfileCompleteness();
        
        const modal = document.createElement('div');
        modal.className = 'dating-final-modal profile-completeness-modal active';
        modal.innerHTML = `
            <div class="dating-final-modal-overlay">
                <div class="dating-final-modal-content profile-completeness-content">
                    <div class="completeness-header">
                        <h2>📈 Profile Optimization</h2>
                        <p>Improve your profile to get more matches</p>
                        <button class="completeness-close-btn" onclick="this.closest('.dating-final-modal').remove()">×</button>
                    </div>
                    
                    <div class="completeness-score">
                        <div class="score-circle">
                            <div class="score-progress" style="--progress: ${profileData.completeness}%">
                                <div class="score-value">${profileData.completeness}%</div>
                            </div>
                        </div>
                        <div class="score-info">
                            <h3>Profile Strength</h3>
                            <div class="score-level ${profileData.level.toLowerCase()}">${profileData.level}</div>
                            <p>${profileData.description}</p>
                        </div>
                    </div>
                    
                    <div class="completeness-checklist">
                        <h3>✅ Optimization Checklist</h3>
                        <div class="checklist-items">
                            ${profileData.items.map(item => `
                                <div class="checklist-item ${item.completed ? 'completed' : ''}">
                                    <div class="item-status">
                                        ${item.completed ? '✅' : '⭕'}
                                    </div>
                                    <div class="item-content">
                                        <h4>${item.title}</h4>
                                        <p>${item.description}</p>
                                        <div class="item-impact">+${item.impact}% match rate improvement</div>
                                    </div>
                                    <div class="item-action">
                                        ${!item.completed ? `
                                            <button class="btn btn-small btn-primary" onclick="datingFinalUI.completeProfileItem('${item.id}')">
                                                ${item.actionText}
                                            </button>
                                        ` : '<span class="completed-badge">Done!</span>'}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="profile-tips">
                        <h3>💡 Pro Tips</h3>
                        <div class="tips-grid">
                            <div class="tip-card">
                                <div class="tip-icon">📸</div>
                                <h4>Photo Quality</h4>
                                <p>Use high-resolution photos with good lighting. Smile and make eye contact with the camera.</p>
                            </div>
                            <div class="tip-card">
                                <div class="tip-icon">✍️</div>
                                <h4>Bio Writing</h4>
                                <p>Be authentic and specific. Mention your hobbies and what you're looking for.</p>
                            </div>
                            <div class="tip-card">
                                <div class="tip-icon">🎯</div>
                                <h4>Interest Selection</h4>
                                <p>Choose interests that truly represent you. Quality over quantity.</p>
                            </div>
                            <div class="tip-card">
                                <div class="tip-icon">🔄</div>
                                <h4>Regular Updates</h4>
                                <p>Refresh your photos and bio every few months to stay current.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="completeness-actions">
                        <button class="btn btn-secondary" onclick="datingFinalUI.shareProfile()">
                            📤 Share for Feedback
                        </button>
                        <button class="btn btn-primary" onclick="datingFinalUI.optimizeNow()">
                            🚀 Optimize Now
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    calculateProfileCompleteness() {
        // Simulate profile completeness calculation
        const items = [
            {
                id: 'photos',
                title: 'Add More Photos',
                description: 'Upload at least 4 high-quality photos',
                completed: false,
                impact: 25,
                actionText: 'Upload Photos'
            },
            {
                id: 'bio',
                title: 'Complete Bio',
                description: 'Write a detailed bio (at least 100 characters)',
                completed: true,
                impact: 30,
                actionText: 'Write Bio'
            },
            {
                id: 'interests',
                title: 'Select Interests',
                description: 'Choose at least 5 interests that represent you',
                completed: false,
                impact: 20,
                actionText: 'Add Interests'
            },
            {
                id: 'preferences',
                title: 'Set Preferences',
                description: 'Complete your dating preferences',
                completed: true,
                impact: 15,
                actionText: 'Set Preferences'
            },
            {
                id: 'verification',
                title: 'Verify Profile',
                description: 'Complete profile verification for trust',
                completed: false,
                impact: 35,
                actionText: 'Get Verified'
            },
            {
                id: 'occupation',
                title: 'Add Job Title',
                description: 'Add your occupation and workplace',
                completed: false,
                impact: 10,
                actionText: 'Add Job'
            }
        ];

        const completedItems = items.filter(item => item.completed).length;
        const completeness = Math.round((completedItems / items.length) * 100);

        let level = 'Beginner';
        let description = 'Your profile needs work to attract more matches';
        
        if (completeness >= 80) {
            level = 'Expert';
            description = 'Your profile is optimized for maximum matches!';
        } else if (completeness >= 60) {
            level = 'Advanced';
            description = 'Your profile is good, with room for improvement';
        } else if (completeness >= 40) {
            level = 'Intermediate';
            description = 'Your profile is decent but could be much better';
        }

        return { completeness, level, description, items };
    }

    completeProfileItem(itemId) {
        showToast(`Opening ${itemId} editor...`, 'info');
        // In a real app, this would open the appropriate editor
    }

    shareProfile() {
        showToast('Profile shared with friends for feedback! 📤', 'success');
    }

    optimizeNow() {
        showToast('Starting profile optimization wizard... 🚀', 'info');
        this.closeAllModals();
    }

    // 6. Match Icebreaker Generator - AI-powered conversation starters
    showMatchIcebreakerGenerator(matchName = 'Sarah', matchData = null) {
        const match = matchData || {
            name: matchName,
            age: 26,
            interests: ['Photography', 'Travel', 'Coffee', 'Hiking'],
            bio: 'Adventure seeker and coffee enthusiast',
            photos: ['📸', '🏔️', '☕'],
            occupation: 'Marketing Manager'
        };

        const modal = document.createElement('div');
        modal.className = 'dating-final-modal icebreaker-generator-modal active';
        modal.innerHTML = `
            <div class="dating-final-modal-overlay">
                <div class="dating-final-modal-content icebreaker-generator-content">
                    <div class="generator-header">
                        <h2>💬 AI Icebreaker Generator</h2>
                        <p>Perfect conversation starters for ${match.name}</p>
                        <button class="generator-close-btn" onclick="this.closest('.dating-final-modal').remove()">×</button>
                    </div>
                    
                    <div class="match-context">
                        <div class="match-preview">
                            <div class="match-avatar">${match.photos[0]}</div>
                            <div class="match-info">
                                <h3>${match.name}, ${match.age}</h3>
                                <p class="match-bio">${match.bio}</p>
                                <div class="match-interests">
                                    ${match.interests.map(interest => `
                                        <span class="interest-tag">${interest}</span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="icebreaker-categories">
                        <h3>🎯 Choose Your Style</h3>
                        <div class="category-buttons">
                            <button class="category-btn active" onclick="datingFinalUI.generateIcebreakers('personalized')" id="personalizedBtn">
                                🎨 Personalized
                            </button>
                            <button class="category-btn" onclick="datingFinalUI.generateIcebreakers('funny')" id="funnyBtn">
                                😄 Funny
                            </button>
                            <button class="category-btn" onclick="datingFinalUI.generateIcebreakers('thoughtful')" id="thoughtfulBtn">
                                💭 Thoughtful
                            </button>
                            <button class="category-btn" onclick="datingFinalUI.generateIcebreakers('casual')" id="casualBtn">
                                😊 Casual
                            </button>
                        </div>
                    </div>
                    
                    <div class="icebreaker-results" id="icebreakerResults">
                        ${this.generateIcebreakerOptions('personalized', match)}
                    </div>
                    
                    <div class="generation-controls">
                        <button class="btn btn-secondary" onclick="datingFinalUI.regenerateIcebreakers()">
                            🔄 Generate New Ideas
                        </button>
                        <button class="btn btn-outline" onclick="datingFinalUI.customIcebreaker()">
                            ✍️ Write Custom Message
                        </button>
                    </div>
                    
                    <div class="success-tips">
                        <h4>💡 Success Tips</h4>
                        <div class="tips-row">
                            <div class="tip">✨ Be authentic and genuine</div>
                            <div class="tip">🎯 Reference something specific from their profile</div>
                            <div class="tip">❓ Ask open-ended questions</div>
                            <div class="tip">😊 Keep it light and positive</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.currentMatch = match;
    }

    generateIcebreakerOptions(category, match) {
        const icebreakers = this.getIcebreakersForCategory(category, match);
        
        return `
            <div class="icebreaker-list">
                ${icebreakers.map((icebreaker, index) => `
                    <div class="icebreaker-option">
                        <div class="icebreaker-text">${icebreaker}</div>
                        <div class="icebreaker-actions">
                            <button class="btn btn-small btn-secondary" onclick="datingFinalUI.editIcebreaker(${index}, '${icebreaker.replace(/'/g, "\\'")}')">
                                ✏️ Edit
                            </button>
                            <button class="btn btn-small btn-primary" onclick="datingFinalUI.useIcebreaker('${icebreaker.replace(/'/g, "\\'")}')">
                                💌 Use This
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getIcebreakersForCategory(category, match) {
        const generators = {
            personalized: [
                `I noticed you're into ${match.interests[0]}! I'm actually planning a ${match.interests[0].toLowerCase()} trip soon - any recommendations?`,
                `Your photos from ${match.interests[1].toLowerCase()} adventures look amazing! What's been your favorite spot so far?`,
                `Fellow ${match.interests[2].toLowerCase()} lover here! ☕ What's your go-to order? I'm always looking for new favorites to try.`,
                `I see you work in ${match.occupation} - that must be exciting! What's the best part about what you do?`,
                `Your bio mentioned being an adventure seeker - what's the most spontaneous thing you've done recently?`
            ],
            funny: [
                `I have a very important question: ${match.interests[2].toLowerCase()} or tea? This could make or break us 😄`,
                `I'm not saying you're out of my league, but I did have to Google "how to talk to someone this cool" 😅`,
                `If you were a ${match.interests[0].toLowerCase()} style, what style would you be? I'm asking for... science.`,
                `I promise I'm more interesting than my profile suggests. That's not saying much, but it's a start! 😊`,
                `Quick question: do you believe in love at first swipe, or should I unmatch and try again? 😉`
            ],
            thoughtful: [
                `What's something about ${match.interests[1].toLowerCase()} that most people don't know but should?`,
                `I'm curious - what drew you to ${match.occupation}? Was it always the plan or did life lead you there?`,
                `If you could only keep one of your hobbies, which would you choose and why?`,
                `What's the most meaningful piece of advice you've received recently?`,
                `I noticed you appreciate ${match.interests[0].toLowerCase()} - what is it about capturing moments that speaks to you?`
            ],
            casual: [
                `Hey ${match.name}! How's your week going? 😊`,
                `Hi! I saw we both love ${match.interests[0].toLowerCase()} - what got you started with that?`,
                `Hope you're having a great day! What's been the highlight so far?`,
                `Hey there! Quick question: best ${match.interests[2].toLowerCase()} spot in town? I'm always looking for new places to try!`,
                `Hello! Your profile caught my eye - what's your favorite way to spend weekends?`
            ]
        };

        return generators[category] || generators.casual;
    }

    generateIcebreakers(category) {
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${category}Btn`).classList.add('active');
        
        // Generate new icebreakers
        const results = document.getElementById('icebreakerResults');
        if (results && this.currentMatch) {
            results.innerHTML = this.generateIcebreakerOptions(category, this.currentMatch);
        }
    }

    regenerateIcebreakers() {
        const activeCategory = document.querySelector('.category-btn.active').onclick.toString().match(/'([^']+)'/)[1];
        this.generateIcebreakers(activeCategory);
        showToast('Generated fresh icebreaker ideas! 🔄', 'success');
    }

    customIcebreaker() {
        const customMessage = prompt('Write your own personalized message:');
        if (customMessage && customMessage.trim()) {
            this.useIcebreaker(customMessage);
        }
    }

    editIcebreaker(index, originalMessage) {
        const editedMessage = prompt('Edit your message:', originalMessage);
        if (editedMessage && editedMessage.trim()) {
            this.useIcebreaker(editedMessage);
        }
    }

    useIcebreaker(message) {
        // Copy to clipboard if available
        if (navigator.clipboard) {
            navigator.clipboard.writeText(message).then(() => {
                showToast('Message copied to clipboard! Ready to send 💌', 'success');
            });
        } else {
            showToast('Message ready: ' + message.substring(0, 50) + '...', 'info');
        }
        
        this.closeAllModals();
    }
}

// Initialize the final dating UI components
const datingFinalUI = new DatingFinalUIComponents();

// Make it globally available
window.datingFinalUI = datingFinalUI;

// Utility functions for toasts (assuming they exist or need to be implemented)
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
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
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
