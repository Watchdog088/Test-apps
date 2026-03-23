/**
 * Dating Video Date Interface
 * Complete Video Dating Implementation for ConnectHub
 * 
 * This interface provides:
 * 1. Video Date Setup & Scheduling
 * 2. In-Call Video Date Interface
 * 3. Virtual Date Activities & Games  
 * 4. Date Safety Features
 * 5. Post-Date Feedback System
 * 6. Video Quality & Technical Controls
 */

class DatingVideoDateUI {
    constructor() {
        this.currentVideoCall = null;
        this.videoStream = null;
        this.audioStream = null;
        this.isVideoEnabled = true;
        this.isAudioEnabled = true;
        this.virtualActivities = [];
        this.dateStartTime = null;
        this.safetyFeatures = {
            recording: false,
            emergencyContact: null,
            reportingEnabled: true
        };
        
        this.initializeVideoDateSystem();
    }

    initializeVideoDateSystem() {
        console.log('Video Dating System initialized');
        this.bindGlobalEvents();
    }

    bindGlobalEvents() {
        // Listen for escape key to end video dates safely
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentVideoCall) {
                this.showEndDateConfirmation();
            }
        });
        
        // Handle browser beforeunload during video dates
        window.addEventListener('beforeunload', (e) => {
            if (this.currentVideoCall) {
                e.preventDefault();
                e.returnValue = 'You are currently on a video date. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    }

    // 1. Video Date Setup & Scheduling Interface
    showVideoDateSetup(matchData) {
        const modal = document.createElement('div');
        modal.className = 'video-date-modal video-date-setup-modal active';
        modal.innerHTML = `
            <div class="video-date-modal-overlay">
                <div class="video-date-modal-content">
                    <div class="video-date-header">
                        <h2>📹 Schedule Video Date</h2>
                        <p>Set up a virtual date with ${matchData.name}</p>
                        <button class="video-date-close-btn" onclick="this.closest('.video-date-modal').remove()">×</button>
                    </div>

                    <div class="match-preview">
                        <div class="match-info">
                            <div class="match-avatar">
                                <img src="${matchData.photo || '/src/assets/default-avatar.png'}" alt="${matchData.name}">
                            </div>
                            <div class="match-details">
                                <h3>${matchData.name}, ${matchData.age}</h3>
                                <div class="match-verification">
                                    <span class="verified-badge">✓ Verified</span>
                                    <span class="safety-score">🛡️ Safety Score: A+</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="date-setup-form">
                        <!-- Date & Time Selection -->
                        <div class="setup-section">
                            <h3>📅 When would you like to meet?</h3>
                            <div class="datetime-picker">
                                <div class="date-picker">
                                    <label>Date</label>
                                    <input type="date" id="videoDateDate" min="${new Date().toISOString().split('T')[0]}" value="${this.getDefaultDate()}">
                                </div>
                                <div class="time-picker">
                                    <label>Time</label>
                                    <select id="videoDateTime">
                                        <option value="18:00">6:00 PM</option>
                                        <option value="19:00" selected>7:00 PM</option>
                                        <option value="20:00">8:00 PM</option>
                                        <option value="21:00">9:00 PM</option>
                                        <option value="14:00">2:00 PM (Weekend)</option>
                                        <option value="15:00">3:00 PM (Weekend)</option>
                                        <option value="16:00">4:00 PM (Weekend)</option>
                                    </select>
                                </div>
                                <div class="duration-picker">
                                    <label>Duration</label>
                                    <select id="videoDateDuration">
                                        <option value="30">30 minutes</option>
                                        <option value="45">45 minutes</option>
                                        <option value="60" selected>1 hour</option>
                                        <option value="90">1.5 hours</option>
                                        <option value="120">2 hours</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Activity Selection -->
                        <div class="setup-section">
                            <h3>🎮 Choose Date Activities</h3>
                            <div class="activity-grid">
                                <div class="activity-option" onclick="this.classList.toggle('selected')" data-activity="conversation">
                                    <div class="activity-icon">💬</div>
                                    <h4>Getting to Know You</h4>
                                    <p>Casual conversation & questions</p>
                                </div>
                                <div class="activity-option" onclick="this.classList.toggle('selected')" data-activity="games">
                                    <div class="activity-icon">🎲</div>
                                    <h4>Interactive Games</h4>
                                    <p>20 Questions, Would You Rather</p>
                                </div>
                                <div class="activity-option" onclick="this.classList.toggle('selected')" data-activity="cooking">
                                    <div class="activity-icon">👨‍🍳</div>
                                    <h4>Virtual Cooking</h4>
                                    <p>Cook the same recipe together</p>
                                </div>
                                <div class="activity-option" onclick="this.classList.toggle('selected')" data-activity="movie">
                                    <div class="activity-icon">🎬</div>
                                    <h4>Watch Together</h4>
                                    <p>Movie or show sync viewing</p>
                                </div>
                                <div class="activity-option" onclick="this.classList.toggle('selected')" data-activity="workout">
                                    <div class="activity-icon">💪</div>
                                    <h4>Virtual Workout</h4>
                                    <p>Exercise or yoga session</p>
                                </div>
                                <div class="activity-option" onclick="this.classList.toggle('selected')" data-activity="art">
                                    <div class="activity-icon">🎨</div>
                                    <h4>Creative Activity</h4>
                                    <p>Drawing, painting, or crafts</p>
                                </div>
                            </div>
                        </div>

                        <!-- Safety & Preferences -->
                        <div class="setup-section">
                            <h3>🛡️ Safety & Preferences</h3>
                            <div class="safety-options">
                                <label class="safety-option">
                                    <input type="checkbox" checked>
                                    <span>Enable automatic recording for safety</span>
                                </label>
                                <label class="safety-option">
                                    <input type="checkbox" checked>
                                    <span>Allow reporting during call</span>
                                </label>
                                <label class="safety-option">
                                    <input type="checkbox">
                                    <span>Send reminder to emergency contact</span>
                                </label>
                                <label class="safety-option">
                                    <input type="checkbox">
                                    <span>Enable background blur by default</span>
                                </label>
                            </div>
                        </div>

                        <!-- Pre-call Checklist -->
                        <div class="setup-section">
                            <h3>✅ Pre-Call Checklist</h3>
                            <div class="checklist-items">
                                <div class="checklist-item">
                                    <input type="checkbox" id="cameraTest">
                                    <label for="cameraTest">Test camera and microphone</label>
                                    <button class="btn btn-small btn-secondary" onclick="videoDateUI.testAudioVideo()">Test Now</button>
                                </div>
                                <div class="checklist-item">
                                    <input type="checkbox" id="internetTest">
                                    <label for="internetTest">Check internet connection</label>
                                    <button class="btn btn-small btn-secondary" onclick="videoDateUI.testConnection()">Test Speed</button>
                                </div>
                                <div class="checklist-item">
                                    <input type="checkbox" id="backgroundSetup">
                                    <label for="backgroundSetup">Set up good lighting & background</label>
                                </div>
                                <div class="checklist-item">
                                    <input type="checkbox" id="conversationPrep">
                                    <label for="conversationPrep">Review conversation starters</label>
                                    <button class="btn btn-small btn-secondary" onclick="videoDateUI.showConversationStarters()">View Tips</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="setup-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.video-date-modal').remove()">
                            Cancel
                        </button>
                        <button class="btn btn-primary" onclick="videoDateUI.scheduleVideoDate()">
                            📹 Schedule Video Date
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // 2. In-Call Video Date Interface  
    showVideoDateInterface(callData) {
        this.currentVideoCall = callData;
        this.dateStartTime = new Date();
        
        const videoInterface = document.createElement('div');
        videoInterface.className = 'video-date-call-interface active';
        videoInterface.innerHTML = `
            <div class="video-call-container">
                <!-- Video Streams -->
                <div class="video-streams">
                    <div class="remote-video-container">
                        <video id="remoteVideo" class="remote-video" autoplay playsinline></video>
                        <div class="remote-video-overlay">
                            <div class="participant-name">${callData.partnerName}</div>
                            <div class="connection-status">
                                <div class="status-indicator good"></div>
                                <span>Excellent connection</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="local-video-container">
                        <video id="localVideo" class="local-video" autoplay playsinline muted></video>
                        <div class="local-video-overlay">
                            <div class="participant-name">You</div>
                        </div>
                    </div>
                </div>

                <!-- Call Controls -->
                <div class="video-call-controls">
                    <div class="primary-controls">
                        <button class="control-btn ${this.isAudioEnabled ? 'active' : 'muted'}" 
                                onclick="videoDateUI.toggleAudio()" id="audioToggle">
                            <i class="fas ${this.isAudioEnabled ? 'fa-microphone' : 'fa-microphone-slash'}"></i>
                        </button>
                        
                        <button class="control-btn ${this.isVideoEnabled ? 'active' : 'disabled'}" 
                                onclick="videoDateUI.toggleVideo()" id="videoToggle">
                            <i class="fas ${this.isVideoEnabled ? 'fa-video' : 'fa-video-slash'}"></i>
                        </button>
                        
                        <button class="control-btn" onclick="videoDateUI.toggleScreenShare()" id="screenShare">
                            <i class="fas fa-desktop"></i>
                        </button>
                        
                        <button class="control-btn end-call" onclick="videoDateUI.showEndDateConfirmation()">
                            <i class="fas fa-phone-slash"></i>
                        </button>
                    </div>

                    <div class="secondary-controls">
                        <button class="control-btn" onclick="videoDateUI.toggleChat()" id="chatToggle">
                            <i class="fas fa-comment"></i>
                            <span class="notification-badge" id="chatBadge" style="display: none;">0</span>
                        </button>
                        
                        <button class="control-btn" onclick="videoDateUI.showActivities()" id="activitiesBtn">
                            <i class="fas fa-gamepad"></i>
                        </button>
                        
                        <button class="control-btn" onclick="videoDateUI.showSettings()" id="settingsBtn">
                            <i class="fas fa-cog"></i>
                        </button>
                        
                        <button class="control-btn safety-btn" onclick="videoDateUI.showSafetyOptions()" id="safetyBtn">
                            <i class="fas fa-shield-alt"></i>
                        </button>
                    </div>
                </div>

                <!-- Call Info -->
                <div class="call-info">
                    <div class="call-timer" id="callTimer">00:00</div>
                    <div class="call-quality">
                        <div class="quality-indicator">
                            <div class="quality-bars">
                                <div class="bar active"></div>
                                <div class="bar active"></div>
                                <div class="bar active"></div>
                                <div class="bar active"></div>
                            </div>
                            <span>HD</span>
                        </div>
                    </div>
                </div>

                <!-- Side Panel for Activities/Chat -->
                <div class="video-date-side-panel" id="sidePanelContainer" style="display: none;">
                    <!-- Content will be dynamically loaded -->
                </div>

                <!-- Safety Quick Actions -->
                <div class="safety-quick-actions">
                    <button class="safety-action emergency" onclick="videoDateUI.emergencyExit()" title="Emergency Exit">
                        🚨
                    </button>
                    <button class="safety-action report" onclick="videoDateUI.reportIssue()" title="Report Issue">
                        ⚠️
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(videoInterface);
        
        // Initialize video call
        this.initializeVideoCall();
        this.startCallTimer();
    }

    // 3. Virtual Date Activities & Games
    showActivities() {
        const sidePanel = document.getElementById('sidePanelContainer');
        sidePanel.style.display = 'block';
        sidePanel.innerHTML = `
            <div class="side-panel-content">
                <div class="panel-header">
                    <h3>🎮 Date Activities</h3>
                    <button class="panel-close-btn" onclick="videoDateUI.closeSidePanel()">×</button>
                </div>

                <div class="activities-list">
                    <!-- Ice Breaker Games -->
                    <div class="activity-category">
                        <h4>🧊 Ice Breakers</h4>
                        <div class="activity-items">
                            <div class="activity-item" onclick="videoDateUI.startActivity('20questions')">
                                <div class="activity-icon">❓</div>
                                <div class="activity-info">
                                    <h5>20 Questions</h5>
                                    <p>Get to know each other better</p>
                                </div>
                            </div>
                            <div class="activity-item" onclick="videoDateUI.startActivity('wouldyourather')">
                                <div class="activity-icon">🤔</div>
                                <div class="activity-info">
                                    <h5>Would You Rather</h5>
                                    <p>Fun hypothetical scenarios</p>
                                </div>
                            </div>
                            <div class="activity-item" onclick="videoDateUI.startActivity('twotruths')">
                                <div class="activity-icon">🕵️</div>
                                <div class="activity-info">
                                    <h5>Two Truths & a Lie</h5>
                                    <p>Guess what's true</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Interactive Games -->
                    <div class="activity-category">
                        <h4>🎯 Interactive Games</h4>
                        <div class="activity-items">
                            <div class="activity-item" onclick="videoDateUI.startActivity('storytelling')">
                                <div class="activity-icon">📖</div>
                                <div class="activity-info">
                                    <h5>Story Building</h5>
                                    <p>Create a story together</p>
                                </div>
                            </div>
                            <div class="activity-item" onclick="videoDateUI.startActivity('drawing')">
                                <div class="activity-icon">🎨</div>
                                <div class="activity-info">
                                    <h5>Draw & Guess</h5>
                                    <p>Digital drawing game</p>
                                </div>
                            </div>
                            <div class="activity-item" onclick="videoDateUI.startActivity('trivia')">
                                <div class="activity-icon">🧠</div>
                                <div class="activity-info">
                                    <h5>Couple's Trivia</h5>
                                    <p>Fun facts and questions</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Shared Experiences -->
                    <div class="activity-category">
                        <h4>🎬 Shared Experiences</h4>
                        <div class="activity-items">
                            <div class="activity-item" onclick="videoDateUI.startActivity('watchparty')">
                                <div class="activity-icon">📺</div>
                                <div class="activity-info">
                                    <h5>Watch Party</h5>
                                    <p>Sync video watching</p>
                                </div>
                            </div>
                            <div class="activity-item" onclick="videoDateUI.startActivity('music')">
                                <div class="activity-icon">🎵</div>
                                <div class="activity-info">
                                    <h5>Music Sharing</h5>
                                    <p>Share favorite songs</p>
                                </div>
                            </div>
                            <div class="activity-item" onclick="videoDateUI.startActivity('virtualtour')">
                                <div class="activity-icon">🗺️</div>
                                <div class="activity-info">
                                    <h5>Virtual Tour</h5>
                                    <p>Explore places together</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="current-activity" id="currentActivity" style="display: none;">
                    <!-- Active activity content will be loaded here -->
                </div>
            </div>
        `;
    }

    // 4. Date Safety Features
    showSafetyOptions() {
        const sidePanel = document.getElementById('sidePanelContainer');
        sidePanel.style.display = 'block';
        sidePanel.innerHTML = `
            <div class="side-panel-content">
                <div class="panel-header">
                    <h3>🛡️ Safety Center</h3>
                    <button class="panel-close-btn" onclick="videoDateUI.closeSidePanel()">×</button>
                </div>

                <div class="safety-options-content">
                    <!-- Emergency Actions -->
                    <div class="safety-section emergency">
                        <h4>🚨 Emergency Actions</h4>
                        <div class="emergency-buttons">
                            <button class="btn btn-danger btn-full" onclick="videoDateUI.emergencyExit()">
                                🚨 Emergency Exit & Block
                            </button>
                            <button class="btn btn-warning btn-full" onclick="videoDateUI.reportIssue()">
                                ⚠️ Report Inappropriate Behavior
                            </button>
                        </div>
                    </div>

                    <!-- Recording Options -->
                    <div class="safety-section">
                        <h4>📹 Recording & Evidence</h4>
                        <div class="recording-controls">
                            <label class="safety-toggle">
                                <input type="checkbox" ${this.safetyFeatures.recording ? 'checked' : ''} 
                                       onchange="videoDateUI.toggleRecording(this.checked)">
                                <span>Auto-record for safety</span>
                                <small>Recording saved locally for 24 hours</small>
                            </label>
                            
                            <button class="btn btn-secondary btn-full" onclick="videoDateUI.takeScreenshot()">
                                📸 Take Screenshot
                            </button>
                        </div>
                    </div>

                    <!-- Privacy Controls -->
                    <div class="safety-section">
                        <h4>🔒 Privacy Controls</h4>
                        <div class="privacy-controls">
                            <label class="safety-toggle">
                                <input type="checkbox" onchange="videoDateUI.toggleBackgroundBlur(this.checked)">
                                <span>Enable background blur</span>
                            </label>
                            
                            <label class="safety-toggle">
                                <input type="checkbox" onchange="videoDateUI.toggleLocationSharing(this.checked)">
                                <span>Hide precise location</span>
                            </label>
                        </div>
                    </div>

                    <!-- Quick Exit Options -->
                    <div class="safety-section">
                        <h4>🚪 Quick Exit Options</h4>
                        <div class="exit-options">
                            <button class="btn btn-outline btn-full" onclick="videoDateUI.fakePhoneCall()">
                                📞 Fake Emergency Call
                            </button>
                            <button class="btn btn-outline btn-full" onclick="videoDateUI.technicalIssues()">
                                ⚡ Claim Technical Issues
                            </button>
                        </div>
                    </div>

                    <!-- Support Information -->
                    <div class="safety-section">
                        <h4>💬 Get Help</h4>
                        <div class="support-info">
                            <p>If you feel unsafe or uncomfortable:</p>
                            <ul>
                                <li>Trust your instincts</li>
                                <li>End the call immediately</li>
                                <li>Report the user</li>
                                <li>Contact our 24/7 safety team</li>
                            </ul>
                            <button class="btn btn-primary btn-full" onclick="videoDateUI.contactSafetyTeam()">
                                💬 Contact Safety Team
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 5. Post-Date Feedback System
    showPostDateFeedback() {
        const modal = document.createElement('div');
        modal.className = 'video-date-modal post-date-feedback-modal active';
        modal.innerHTML = `
            <div class="video-date-modal-overlay">
                <div class="video-date-modal-content">
                    <div class="feedback-header">
                        <h2>💭 How was your video date?</h2>
                        <p>Your feedback helps us improve the dating experience</p>
                    </div>

                    <div class="date-summary">
                        <div class="summary-info">
                            <div class="date-details">
                                <span>📅 ${this.getFormattedDate()}</span>
                                <span>⏱️ ${this.getCallDuration()}</span>
                                <span>👥 Video Date with ${this.currentVideoCall?.partnerName || 'Partner'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="feedback-form">
                        <!-- Overall Rating -->
                        <div class="feedback-section">
                            <h3>⭐ Overall Experience</h3>
                            <div class="rating-stars" data-rating="0">
                                <span class="star" onclick="videoDateUI.setRating(1)">⭐</span>
                                <span class="star" onclick="videoDateUI.setRating(2)">⭐</span>
                                <span class="star" onclick="videoDateUI.setRating(3)">⭐</span>
                                <span class="star" onclick="videoDateUI.setRating(4)">⭐</span>
                                <span class="star" onclick="videoDateUI.setRating(5)">⭐</span>
                            </div>
                            <div class="rating-labels">
                                <span>Poor</span>
                                <span>Excellent</span>
                            </div>
                        </div>

                        <!-- Specific Ratings -->
                        <div class="feedback-section">
                            <h3>📊 Rate Different Aspects</h3>
                            <div class="aspect-ratings">
                                <div class="aspect-rating">
                                    <label>Conversation Quality</label>
                                    <div class="rating-scale">
                                        <input type="range" min="1" max="5" value="3" class="rating-slider">
                                        <span class="rating-value">3</span>
                                    </div>
                                </div>
                                <div class="aspect-rating">
                                    <label>Connection & Chemistry</label>
                                    <div class="rating-scale">
                                        <input type="range" min="1" max="5" value="3" class="rating-slider">
                                        <span class="rating-value">3</span>
                                    </div>
                                </div>
                                <div class="aspect-rating">
                                    <label>Comfort Level</label>
                                    <div class="rating-scale">
                                        <input type="range" min="1" max="5" value="3" class="rating-slider">
                                        <span class="rating-value">3</span>
                                    </div>
                                </div>
                                <div class="aspect-rating">
                                    <label>Technical Quality</label>
                                    <div class="rating-scale">
                                        <input type="range" min="1" max="5" value="4" class="rating-slider">
                                        <span class="rating-value">4</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Feedback -->
                        <div class="feedback-section">
                            <h3>💬 Quick Feedback</h3>
                            <div class="feedback-tags">
                                <button class="feedback-tag" onclick="this.classList.toggle('selected')">Great conversation</button>
                                <button class="feedback-tag" onclick="this.classList.toggle('selected')">Good chemistry</button>
                                <button class="feedback-tag" onclick="this.classList.toggle('selected')">Felt comfortable</button>
                                <button class="feedback-tag" onclick="this.classList.toggle('selected')">Want to meet again</button>
                                <button class="feedback-tag" onclick="this.classList.toggle('selected')">Activities were fun</button>
                                <button class="feedback-tag" onclick="this.classList.toggle('selected')">Technical issues</button>
                                <button class="feedback-tag" onclick="this.classList.toggle('selected')">Felt awkward</button>
                                <button class="feedback-tag" onclick="this.classList.toggle('selected')">Not compatible</button>
                            </div>
                        </div>

                        <!-- Written Feedback -->
                        <div class="feedback-section">
                            <h3>✍️ Additional Comments (Optional)</h3>
                            <textarea class="feedback-textarea" 
                                      placeholder="Share more about your experience, what went well, or suggestions for improvement..." 
                                      maxlength="500"></textarea>
                            <div class="character-count">0/500 characters</div>
                        </div>

                        <!-- Future Date Interest -->
                        <div class="feedback-section">
                            <h3>📅 Would you like another video date?</h3>
                            <div class="future-date-options">
                                <label class="date-interest-option">
                                    <input type="radio" name="futureDate" value="yes">
                                    <span>Yes, I'd love to plan another video date!</span>
                                </label>
                                <label class="date-interest-option">
                                    <input type="radio" name="futureDate" value="maybe">
                                    <span>Maybe, I need to think about it</span>
                                </label>
                                <label class="date-interest-option">
                                    <input type="radio" name="futureDate" value="meetup">
                                    <span>I'd prefer to meet in person next time</span>
                                </label>
                                <label class="date-interest-option">
                                    <input type="radio" name="futureDate" value="no">
                                    <span>No, I don't think we're compatible</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="feedback-actions">
                        <button class="btn btn-secondary" onclick="videoDateUI.skipFeedback()">
                            Skip Feedback
                        </button>
                        <button class="btn btn-primary" onclick="videoDateUI.submitFeedback()">
                            📝 Submit Feedback
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Setup feedback interactivity
        this.setupFeedbackInteractivity();
    }

    // 6. Video Quality & Technical Controls
    showSettings() {
        const sidePanel = document.getElementById('sidePanelContainer');
        sidePanel.style.display = 'block';
        sidePanel.innerHTML = `
            <div class="side-panel-content">
                <div class="panel-header">
                    <h3>⚙️ Video Settings</h3>
                    <button class="panel-close-btn" onclick="videoDateUI.closeSidePanel()">×</button>
                </div>

                <div class="settings-content">
                    <!-- Video Quality -->
                    <div class="settings-section">
                        <h4>📹 Video Quality</h4>
                        <div class="quality-options">
                            <label class="quality-option">
                                <input type="radio" name="videoQuality" value="auto" checked>
                                <span>Auto (Recommended)</span>
                                <small>Adjusts automatically based on connection</small>
                            </label>
                            <label class="quality-option">
                                <input type="radio" name="videoQuality" value="hd">
                                <span>HD (720p)</span>
                                <small>High quality, requires good connection</small>
                            </label>
                            <label class="quality-option">
                                <input type="radio" name="videoQuality" value="sd">
                                <span>Standard (480p)</span>
                                <small>Good quality, lower bandwidth</small>
                            </label>
                            <label class="quality-option">
                                <input type="radio" name="videoQuality" value="low">
                                <span>Low (360p)</span>
                                <small>For slower connections</small>
                            </label>
                        </div>
                    </div>

                    <!-- Audio Settings -->
                    <div class="settings-section">
                        <h4>🎤 Audio Settings</h4>
                        <div class="audio-controls">
                            <div class="audio-control">
                                <label>Microphone Volume</label>
                                <div class="volume-control">
                                    <input type="range" min="0" max="100" value="75" class="volume-slider" id="micVolume">
                                    <span class="volume-display">75%</span>
                                </div>
                            </div>
                            <div class="audio-control">
                                <label>Speaker Volume</label>
                                <div class="volume-control">
                                    <input type="range" min="0" max="100" value="80" class="volume-slider" id="speakerVolume">
                                    <span class="volume-display">80%</span>
                                </div>
                            </div>
                            <label class="audio-toggle">
                                <input type="checkbox" onchange="videoDateUI.toggleNoiseReduction(this.checked)">
                                <span>Enable noise reduction</span>
                            </label>
                            <label class="audio-toggle">
                                <input type="checkbox" onchange="videoDateUI.toggleEchoCancellation(this.checked)" checked>
                                <span>Echo cancellation</span>
                            </label>
                        </div>
                    </div>

                    <!-- Camera Settings -->
                    <div class="settings-section">
                        <h4>📷 Camera Settings</h4>
                        <div class="camera-controls">
                            <div class="camera-selection">
                                <label>Select Camera</label>
                                <select id="cameraSelect" onchange="videoDateUI.switchCamera(this.value)">
                                    <option value="default">Default Camera</option>
                                    <option value="front">Front Camera</option>
                                    <option value="back">Back Camera</option>
                                </select>
                            </div>
                            
                            <div class="camera-effects">
                                <label class="effect-toggle">
                                    <input type="checkbox" onchange="videoDateUI.toggleBackgroundBlur(this.checked)">
                                    <span>Background Blur</span>
                                </label>
                                <label class="effect-toggle">
                                    <input type="checkbox" onchange="videoDateUI.toggleBeautyFilter(this.checked)">
                                    <span>Beauty Filter</span>
                                </label>
                                <label class="effect-toggle">
                                    <input type="checkbox" onchange="videoDateUI.toggleAutoFocus(this.checked)" checked>
                                    <span>Auto Focus</span>
                                </label>
                            </div>

                            <div class="camera-adjustments">
                                <div class="adjustment-control">
                                    <label>Brightness</label>
                                    <input type="range" min="-50" max="50" value="0" class="adjustment-slider" id="brightness">
                                </div>
                                <div class="adjustment-control">
                                    <label>Contrast</label>
                                    <input type="range" min="-50" max="50" value="0" class="adjustment-slider" id="contrast">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Connection Info -->
                    <div class="settings-section">
                        <h4>🌐 Connection Status</h4>
                        <div class="connection-stats">
                            <div class="stat-item">
                                <span class="stat-label">Connection Quality</span>
                                <span class="stat-value good">Excellent</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Bandwidth</span>
                                <span class="stat-value">2.5 Mbps ↑ / 5.2 Mbps ↓</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Latency</span>
                                <span class="stat-value">42ms</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Packet Loss</span>
                                <span class="stat-value">0.1%</span>
                            </div>
                        </div>
                        
                        <button class="btn btn-outline btn-full" onclick="videoDateUI.runConnectionTest()">
                            🧪 Run Connection Test
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Utility Methods
    getDefaultDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }

    getFormattedDate() {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getCallDuration() {
        if (!this.dateStartTime) return '0:00';
        const now = new Date();
        const duration = Math.floor((now - this.dateStartTime) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Event Handlers
    scheduleVideoDate() {
        const dateValue = document.getElementById('videoDateDate').value;
        const timeValue = document.getElementById('videoDateTime').value;
        const durationValue = document.getElementById('videoDateDuration').value;
        
        // Get selected activities
        const selectedActivities = Array.from(document.querySelectorAll('.activity-option.selected'))
            .map(el => el.dataset.activity);
        
        const dateData = {
            date: dateValue,
            time: timeValue,
            duration: durationValue,
            activities: selectedActivities
        };
        
        console.log('Video date scheduled:', dateData);
        this.showToast('Video date scheduled successfully! 📹✨', 'success');
        this.closeAllModals();
    }

    testAudioVideo() {
        this.showToast('Testing camera and microphone... 🔧', 'info');
        // In a real implementation, this would test the user's devices
        setTimeout(() => {
            document.getElementById('cameraTest').checked = true;
            this.showToast('Audio/Video test completed successfully! ✅', 'success');
        }, 2000);
    }

    testConnection() {
        this.showToast('Testing internet speed... 🌐', 'info');
        setTimeout(() => {
            document.getElementById('internetTest').checked = true;
            this.showToast('Connection test: 25 Mbps - Excellent! 🚀', 'success');
        }, 3000);
    }

    showConversationStarters() {
        this.showToast('Opening conversation starter guide... 💭', 'info');
        // In a real app, this would show conversation tips
    }

    // Call Controls
    toggleAudio() {
        this.isAudioEnabled = !this.isAudioEnabled;
        const audioBtn = document.getElementById('audioToggle');
        const icon = audioBtn.querySelector('i');
        
        audioBtn.className = `control-btn ${this.isAudioEnabled ? 'active' : 'muted'}`;
        icon.className = `fas ${this.isAudioEnabled ? 'fa-microphone' : 'fa-microphone-slash'}`;
        
        this.showToast(`Microphone ${this.isAudioEnabled ? 'enabled' : 'muted'}`, 'info');
    }

    toggleVideo() {
        this.isVideoEnabled = !this.isVideoEnabled;
        const videoBtn = document.getElementById('videoToggle');
        const icon = videoBtn.querySelector('i');
        
        videoBtn.className = `control-btn ${this.isVideoEnabled ? 'active' : 'disabled'}`;
        icon.className = `fas ${this.isVideoEnabled ? 'fa-video' : 'fa-video-slash'}`;
        
        this.showToast(`Camera ${this.isVideoEnabled ? 'enabled' : 'disabled'}`, 'info');
    }

    toggleScreenShare() {
        this.showToast('Screen sharing toggled 🖥️', 'info');
    }

    toggleChat() {
        this.showToast('Chat panel toggled 💬', 'info');
    }

    closeSidePanel() {
        const sidePanel = document.getElementById('sidePanelContainer');
        if (sidePanel) {
            sidePanel.style.display = 'none';
        }
    }

    // Activity Management
    startActivity(activityType) {
        const activityContent = document.getElementById('currentActivity');
        activityContent.style.display = 'block';
        
        const activities = {
            '20questions': this.generate20Questions(),
            'wouldyourather': this.generateWouldYouRather(),
            'twotruths': this.generateTwoTruths(),
            'storytelling': this.generateStorytellingPrompt(),
            'drawing': this.startDrawingGame(),
            'trivia': this.generateTrivia(),
            'watchparty': this.startWatchParty(),
            'music': this.startMusicSharing(),
            'virtualtour': this.startVirtualTour()
        };
        
        activityContent.innerHTML = activities[activityType] || 'Activity not found';
        this.showToast(`Started ${activityType} activity! 🎮`, 'success');
    }

    generate20Questions() {
        const questions = [
            "What's your biggest fear?",
            "If you could have dinner with anyone, who would it be?",
            "What's your favorite childhood memory?",
            "What would you do with a million dollars?",
            "What's your biggest dream?"
        ];
        
        return `
            <div class="activity-content">
                <h4>❓ 20 Questions</h4>
                <p>Take turns asking each other these questions:</p>
                <div class="question-list">
                    ${questions.map((q, i) => `<div class="question-item">${i + 1}. ${q}</div>`).join('')}
                </div>
                <button class="btn btn-primary" onclick="videoDateUI.generateMoreQuestions()">More Questions</button>
            </div>
        `;
    }

    generateWouldYouRather() {
        return `
            <div class="activity-content">
                <h4>🤔 Would You Rather</h4>
                <div class="wyr-scenario">
                    <p>Would you rather have the ability to fly or be invisible?</p>
                    <div class="wyr-options">
                        <button class="btn btn-outline">🦅 Fly</button>
                        <button class="btn btn-outline">👻 Invisible</button>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="videoDateUI.nextWYRScenario()">Next Scenario</button>
            </div>
        `;
    }

    generateTwoTruths() {
        return `
            <div class="activity-content">
                <h4>🕵️ Two Truths & A Lie</h4>
                <p>Each person shares three statements about themselves - two true, one false. The other person guesses which is the lie!</p>
                <div class="game-instructions">
                    <h5>How to Play:</h5>
                    <ol>
                        <li>Think of two true facts about yourself</li>
                        <li>Make up one believable lie</li>
                        <li>Share all three statements</li>
                        <li>Your date guesses which is the lie!</li>
                    </ol>
                </div>
            </div>
        `;
    }

    generateStorytellingPrompt() {
        return `
            <div class="activity-content">
                <h4>📖 Story Building</h4>
                <p>Create a story together! One person starts with a sentence, then you take turns adding to it.</p>
                <div class="story-starter">
                    <strong>Story Starter:</strong> "It was a dark and stormy night when Sarah and Alex discovered a mysterious door in the basement..."
                </div>
                <textarea class="story-text" placeholder="Continue the story here..."></textarea>
            </div>
        `;
    }

    startDrawingGame() {
        return `
            <div class="activity-content">
                <h4>🎨 Draw & Guess</h4>
                <p>Take turns drawing something while the other person guesses!</p>
                <canvas id="drawingCanvas" width="300" height="200" style="border: 2px solid #ddd;"></canvas>
                <div class="drawing-controls">
                    <button class="btn btn-small">✏️ Pencil</button>
                    <button class="btn btn-small">🖍️ Marker</button>
                    <button class="btn btn-small">🧽 Eraser</button>
                    <button class="btn btn-small">🗑️ Clear</button>
                </div>
            </div>
        `;
    }

    generateTrivia() {
        return `
            <div class="activity-content">
                <h4>🧠 Couple's Trivia</h4>
                <div class="trivia-question">
                    <p><strong>Question:</strong> What percentage of couples who meet online end up getting married?</p>
                    <div class="trivia-options">
                        <button class="btn btn-outline">A) 15%</button>
                        <button class="btn btn-outline">B) 35%</button>
                        <button class="btn btn-outline">C) 55%</button>
                        <button class="btn btn-outline">D) 75%</button>
                    </div>
                </div>
            </div>
        `;
    }

    startWatchParty() {
        return `
            <div class="activity-content">
                <h4>🎬 Watch Party</h4>
                <p>Watch something together! Choose from popular videos or share your own links.</p>
                <div class="watch-options">
                    <button class="btn btn-outline">🎥 Short Films</button>
                    <button class="btn btn-outline">😂 Comedy Videos</button>
                    <button class="btn btn-outline">🐾 Animal Videos</button>
                    <button class="btn btn-outline">🔗 Share Link</button>
                </div>
            </div>
        `;
    }

    startMusicSharing() {
        return `
            <div class="activity-content">
                <h4>🎵 Music Sharing</h4>
                <p>Share your favorite songs with each other!</p>
                <div class="music-sharing">
                    <input type="text" placeholder="Paste a song link or search..." class="music-input">
                    <button class="btn btn-primary">🎵 Share Song</button>
                </div>
                <div class="shared-songs">
                    <div class="song-item">🎵 "Perfect" by Ed Sheeran - Shared by Alex</div>
                </div>
            </div>
        `;
    }

    startVirtualTour() {
        return `
            <div class="activity-content">
                <h4>🗺️ Virtual Tour</h4>
                <p>Explore places around the world together!</p>
                <div class="tour-options">
                    <button class="btn btn-outline">🗼 Paris, France</button>
                    <button class="btn btn-outline">🏔️ Swiss Alps</button>
                    <button class="btn btn-outline">🏖️ Maldives</button>
                    <button class="btn btn-outline">🏛️ Rome, Italy</button>
                </div>
            </div>
        `;
    }

    // Safety Methods
    emergencyExit() {
        if (confirm('This will immediately end the call and block this user. Are you sure?')) {
            this.endVideoCall(true);
            this.showToast('Call ended. User blocked. You are safe. 🛡️', 'success');
        }
    }

    reportIssue() {
        this.showToast('Report submitted. Our safety team will review immediately. 📋', 'success');
    }

    toggleRecording(enabled) {
        this.safetyFeatures.recording = enabled;
        this.showToast(`Recording ${enabled ? 'enabled' : 'disabled'} 📹`, 'info');
    }

    takeScreenshot() {
        this.showToast('Screenshot captured for safety records 📸', 'success');
    }

    toggleBackgroundBlur(enabled) {
        this.showToast(`Background blur ${enabled ? 'enabled' : 'disabled'} 🔒`, 'info');
    }

    toggleLocationSharing(enabled) {
        this.showToast(`Location sharing ${enabled ? 'hidden' : 'visible'} 📍`, 'info');
    }

    fakePhoneCall() {
        this.showToast('Initiating fake emergency call... 📞', 'info');
        setTimeout(() => {
            this.endVideoCall();
            this.showToast('Emergency call excuse activated 🚪', 'success');
        }, 2000);
    }

    technicalIssues() {
        this.showToast('Claiming technical difficulties... ⚡', 'info');
        setTimeout(() => {
            this.endVideoCall();
            this.showToast('Technical issues excuse activated 💻', 'success');
        }, 1500);
    }

    contactSafetyTeam() {
        this.showToast('Connecting to safety team... 🆘', 'info');
    }

    // Feedback Methods
    setupFeedbackInteractivity() {
        // Rating sliders
        document.querySelectorAll('.rating-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const value = e.target.nextElementSibling;
                if (value) value.textContent = e.target.value;
            });
        });

        // Character counter
        const textarea = document.querySelector('.feedback-textarea');
        if (textarea) {
            textarea.addEventListener('input', (e) => {
                const counter = document.querySelector('.character-count');
                if (counter) {
                    counter.textContent = `${e.target.value.length}/500 characters`;
                }
            });
        }
    }

    setRating(rating) {
        const stars = document.querySelector('.rating-stars');
        if (stars) {
            stars.setAttribute('data-rating', rating);
            const starElements = stars.querySelectorAll('.star');
            starElements.forEach((star, index) => {
                star.style.color = index < rating ? '#ffd700' : '#ddd';
            });
        }
    }

    skipFeedback() {
        this.closeAllModals();
        this.showToast('Feedback skipped. Thanks for using video dating! 👋', 'info');
    }

    submitFeedback() {
        // Collect feedback data
        const rating = document.querySelector('.rating-stars').getAttribute('data-rating');
        const comments = document.querySelector('.feedback-textarea').value;
        const futureDate = document.querySelector('input[name="futureDate"]:checked')?.value;
        
        console.log('Feedback submitted:', { rating, comments, futureDate });
        
        this.closeAllModals();
        this.showToast('Thank you for your feedback! 💝', 'success');
    }

    // Call Management
    initializeVideoCall() {
        // Initialize video streams (placeholder for WebRTC implementation)
        console.log('Initializing video call...');
        this.showToast('Connecting video call... 📹', 'info');
    }

    startCallTimer() {
        setInterval(() => {
            const timer = document.getElementById('callTimer');
            if (timer && this.dateStartTime) {
                timer.textContent = this.getCallDuration();
            }
        }, 1000);
    }

    showEndDateConfirmation() {
        if (confirm('Are you sure you want to end the video date?')) {
            this.endVideoCall();
        }
    }

    endVideoCall(emergency = false) {
        this.currentVideoCall = null;
        
        // Remove video interface
        const videoInterface = document.querySelector('.video-date-call-interface');
        if (videoInterface) {
            videoInterface.remove();
        }
        
        if (!emergency) {
            // Show feedback after normal call end
            setTimeout(() => this.showPostDateFeedback(), 1000);
        }
    }

    // Utility Methods
    closeAllModals() {
        document.querySelectorAll('.video-date-modal.active').forEach(modal => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `video-date-toast toast-${type}`;
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
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize the Video Date UI
const videoDateUI = new DatingVideoDateUI();

// Make it globally available
window.videoDateUI = videoDateUI;

// Demo functions for testing
function demoVideoDateSetup() {
    const demoMatch = {
        name: 'Sarah',
        age: 26,
        photo: '/src/assets/default-avatar.png'
    };
    
    videoDateUI.showVideoDateSetup(demoMatch);
}

function demoVideoDateCall() {
    const demoCallData = {
        partnerName: 'Sarah',
        callId: 'demo_call_' + Date.now()
    };
    
    videoDateUI.showVideoDateInterface(demoCallData);
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatingVideoDateUI;
}
