class StreamSessionDashboard {
    constructor() {
        this.currentStream = null;
        this.localStream = null;
        this.isStreaming = false;
        this.streamStartTime = null;
        this.viewerCount = 0;
        this.peakViewers = 0;
        this.totalViews = 0;
        this.chatMessages = [];
        this.connectionQuality = 'stable';
        this.streamSocket = null;
        
        // Media settings
        this.cameraEnabled = true;
        this.microphoneEnabled = true;
        this.currentQuality = '720p';
        
        // Analytics
        this.sessionStats = {
            duration: 0,
            messages: 0,
            reactions: 0,
            gifts: 0,
            followers: 0
        };
        
        this.initializeDashboard();
    }

    initializeDashboard() {
        this.createStreamDashboardHTML();
        this.setupEventListeners();
        this.setupMediaDevices();
    }

    createStreamDashboardHTML() {
        const dashboardHTML = `
            <!-- Stream Setup Modal -->
            <div id="stream-setup-modal" class="modal" style="display: none;">
                <div class="modal-content stream-setup-content">
                    <div class="stream-setup-header">
                        <h2>🔴 Stream Setup</h2>
                        <button class="close-modal" id="close-setup-modal">&times;</button>
                    </div>
                    
                    <div class="setup-tabs">
                        <button class="setup-tab active" data-tab="configuration">Configuration</button>
                        <button class="setup-tab" data-tab="technical">Technical Settings</button>
                        <button class="setup-tab" data-tab="checklist">Pre-Stream Check</button>
                    </div>

                    <!-- Configuration Panel -->
                    <div id="configuration-panel" class="setup-panel active">
                        <form id="stream-config-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Stream Title *</label>
                                    <input type="text" id="stream-title" class="form-input" 
                                           placeholder="Enter stream title..." maxlength="100" required>
                                    <div class="char-counter">0/100</div>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group half-width">
                                    <label class="form-label">Category *</label>
                                    <select id="stream-category" class="form-input" required>
                                        <option value="">Select Category</option>
                                        <option value="gaming">🎮 Gaming</option>
                                        <option value="music">🎵 Music</option>
                                        <option value="talk">💬 Talk</option>
                                        <option value="cooking">🍳 Cooking</option>
                                        <option value="fitness">🏋️ Fitness</option>
                                        <option value="art">🎨 Art</option>
                                        <option value="education">📚 Education</option>
                                    </select>
                                </div>
                                <div class="form-group half-width">
                                    <label class="form-label">Privacy</label>
                                    <select id="stream-privacy" class="form-input">
                                        <option value="public">🌍 Public</option>
                                        <option value="private">🔒 Private</option>
                                        <option value="friends">👥 Friends Only</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Description</label>
                                <textarea id="stream-description" class="form-input" 
                                         placeholder="Describe your stream..." maxlength="500" rows="3"></textarea>
                                <div class="char-counter">0/500</div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Tags</label>
                                <input type="text" id="stream-tags" class="form-input" 
                                       placeholder="gaming, fun, live (comma separated)">
                                <small class="form-hint">Use tags to help people discover your stream</small>
                            </div>

                            <div class="form-options">
                                <label class="checkbox-option">
                                    <input type="checkbox" id="chat-enabled" checked>
                                    <span class="checkmark"></span>
                                    Enable Chat
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" id="recording-enabled">
                                    <span class="checkmark"></span>
                                    Record Stream
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" id="monetization-enabled">
                                    <span class="checkmark"></span>
                                    Enable Donations/Tips
                                </label>
                            </div>
                        </form>
                    </div>

                    <!-- Technical Settings Panel -->
                    <div id="technical-panel" class="setup-panel">
                        <div class="technical-grid">
                            <div class="camera-preview-section">
                                <h3>Camera Preview</h3>
                                <div class="camera-preview-container">
                                    <video id="camera-preview" autoplay muted></video>
                                    <div class="camera-overlay">
                                        <button id="test-camera" class="btn btn-secondary btn-small">Test Camera</button>
                                    </div>
                                </div>
                                <div class="device-controls">
                                    <button id="toggle-camera" class="device-btn active">
                                        <span class="device-icon">📹</span>
                                        Camera
                                    </button>
                                    <button id="toggle-mic" class="device-btn active">
                                        <span class="device-icon">🎤</span>
                                        Microphone
                                    </button>
                                </div>
                            </div>

                            <div class="audio-settings">
                                <h3>Audio Settings</h3>
                                <div class="audio-level-container">
                                    <label>Input Level</label>
                                    <div class="audio-level-meter">
                                        <div class="audio-level-fill" id="audio-level"></div>
                                    </div>
                                    <div class="audio-controls">
                                        <label>Microphone</label>
                                        <select id="mic-select" class="form-input">
                                            <option>Default Microphone</option>
                                        </select>
                                        <label>Volume</label>
                                        <input type="range" id="mic-volume" min="0" max="100" value="75" class="volume-slider">
                                    </div>
                                </div>
                            </div>

                            <div class="stream-quality-section">
                                <h3>Stream Quality</h3>
                                <div class="quality-options">
                                    <label class="quality-option">
                                        <input type="radio" name="quality" value="1080p">
                                        <div class="quality-card">
                                            <div class="quality-title">1080p HD</div>
                                            <div class="quality-desc">6000 kbps • High Quality</div>
                                            <div class="quality-warning">⚠️ Requires stable connection</div>
                                        </div>
                                    </label>
                                    <label class="quality-option">
                                        <input type="radio" name="quality" value="720p" checked>
                                        <div class="quality-card active">
                                            <div class="quality-title">720p HD</div>
                                            <div class="quality-desc">4000 kbps • Recommended</div>
                                        </div>
                                    </label>
                                    <label class="quality-option">
                                        <input type="radio" name="quality" value="480p">
                                        <div class="quality-card">
                                            <div class="quality-title">480p</div>
                                            <div class="quality-desc">2500 kbps • Good Quality</div>
                                        </div>
                                    </label>
                                    <label class="quality-option">
                                        <input type="radio" name="quality" value="360p">
                                        <div class="quality-card">
                                            <div class="quality-title">360p</div>
                                            <div class="quality-desc">1000 kbps • Basic Quality</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Pre-Stream Checklist Panel -->
                    <div id="checklist-panel" class="setup-panel">
                        <h3>Pre-Stream Checklist</h3>
                        <div class="checklist-container">
                            <div class="checklist-item" id="check-camera">
                                <div class="check-icon">⏳</div>
                                <div class="check-content">
                                    <div class="check-title">Camera Access</div>
                                    <div class="check-status">Checking permissions...</div>
                                </div>
                                <button class="check-action" style="display: none;">Grant Access</button>
                            </div>
                            <div class="checklist-item" id="check-microphone">
                                <div class="check-icon">⏳</div>
                                <div class="check-content">
                                    <div class="check-title">Microphone Access</div>
                                    <div class="check-status">Checking permissions...</div>
                                </div>
                                <button class="check-action" style="display: none;">Grant Access</button>
                            </div>
                            <div class="checklist-item" id="check-connection">
                                <div class="check-icon">⏳</div>
                                <div class="check-content">
                                    <div class="check-title">Internet Connection</div>
                                    <div class="check-status">Testing speed...</div>
                                </div>
                                <div class="connection-speed" style="display: none;"></div>
                            </div>
                            <div class="checklist-item" id="check-stream-config">
                                <div class="check-icon">⏳</div>
                                <div class="check-content">
                                    <div class="check-title">Stream Configuration</div>
                                    <div class="check-status">Validating settings...</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="connection-test-results" id="connection-results" style="display: none;">
                            <h4>Connection Test Results</h4>
                            <div class="test-metrics">
                                <div class="metric">
                                    <span class="metric-label">Download Speed:</span>
                                    <span class="metric-value" id="download-speed">--</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Upload Speed:</span>
                                    <span class="metric-value" id="upload-speed">--</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Latency:</span>
                                    <span class="metric-value" id="latency">--</span>
                                </div>
                                <div class="recommendation" id="quality-recommendation"></div>
                            </div>
                        </div>
                    </div>

                    <div class="setup-actions">
                        <button id="cancel-setup" class="btn btn-secondary">Cancel</button>
                        <button id="start-streaming" class="btn btn-primary" disabled>
                            🔴 Start Streaming
                        </button>
                    </div>
                </div>
            </div>

            <!-- Live Stream Dashboard -->
            <div id="live-stream-dashboard" class="stream-dashboard" style="display: none;">
                <div class="dashboard-header">
                    <div class="stream-status-bar">
                        <div class="live-indicator">
                            <span class="live-dot"></span>
                            <span id="stream-status-text">GOING LIVE...</span>
                        </div>
                        <div class="stream-timer">
                            <span id="stream-duration">00:00</span>
                        </div>
                        <div class="viewer-stats">
                            <span id="current-viewer-count">0</span> viewers
                            <span class="peak-viewers">Peak: <span id="peak-viewer-count">0</span></span>
                        </div>
                        <div class="connection-status">
                            <div class="connection-indicator" id="connection-indicator">
                                <span class="signal-strength">📶</span>
                                <span id="connection-text">Stable</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <!-- Live Preview -->
                    <div class="preview-section">
                        <div class="live-preview-container">
                            <video id="live-preview" autoplay muted></video>
                            <div class="preview-overlay">
                                <div class="stream-info-overlay">
                                    <h3 id="live-stream-title">My Stream</h3>
                                    <div class="stream-quality-indicator">
                                        <span id="current-quality">720p</span>
                                        <span id="current-bitrate">4000 kbps</span>
                                    </div>
                                </div>
                                
                                <!-- Engagement Notifications -->
                                <div class="engagement-notifications" id="engagement-notifications">
                                    <!-- Notifications appear here -->
                                </div>
                            </div>
                        </div>

                        <!-- Stream Controls -->
                        <div class="stream-controls">
                            <div class="primary-controls">
                                <button id="end-stream-btn" class="btn btn-error">
                                    ⏹️ End Stream
                                </button>
                                <button id="camera-toggle" class="control-btn active">
                                    <span class="control-icon">📹</span>
                                    <span class="control-label">Camera</span>
                                </button>
                                <button id="mic-toggle" class="control-btn active">
                                    <span class="control-icon">🎤</span>
                                    <span class="control-label">Microphone</span>
                                </button>
                                <button id="settings-btn" class="control-btn">
                                    <span class="control-icon">⚙️</span>
                                    <span class="control-label">Settings</span>
                                </button>
                            </div>
                            
                            <div class="secondary-controls">
                                <select id="quality-selector" class="control-select">
                                    <option value="1080p">1080p</option>
                                    <option value="720p" selected>720p</option>
                                    <option value="480p">480p</option>
                                    <option value="360p">360p</option>
                                </select>
                                <button id="share-stream" class="control-btn">
                                    <span class="control-icon">📤</span>
                                    <span class="control-label">Share</span>
                                </button>
                                <button id="fullscreen-btn" class="control-btn">
                                    <span class="control-icon">⛶</span>
                                    <span class="control-label">Fullscreen</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Chat & Engagement -->
                    <div class="chat-section">
                        <div class="chat-header">
                            <h3>Live Chat</h3>
                            <div class="chat-stats">
                                <span id="message-count">0</span> messages
                            </div>
                        </div>
                        
                        <div class="chat-messages" id="live-chat-messages">
                            <!-- Messages appear here -->
                        </div>
                        
                        <div class="chat-input-section">
                            <div class="reaction-bar">
                                <button class="reaction-btn" data-reaction="heart">❤️</button>
                                <button class="reaction-btn" data-reaction="laugh">😂</button>
                                <button class="reaction-btn" data-reaction="wow">😮</button>
                                <button class="reaction-btn" data-reaction="clap">👏</button>
                                <button class="reaction-btn" data-reaction="fire">🔥</button>
                                <button class="reaction-btn" data-reaction="love">😍</button>
                            </div>
                            <div class="moderator-tools" style="display: none;">
                                <button class="mod-btn" id="slow-mode">⏱️ Slow Mode</button>
                                <button class="mod-btn" id="followers-only">👥 Followers Only</button>
                                <button class="mod-btn" id="clear-chat">🗑️ Clear Chat</button>
                            </div>
                        </div>
                    </div>

                    <!-- Analytics Dashboard -->
                    <div class="analytics-section">
                        <h3>Live Analytics</h3>
                        <div class="analytics-grid">
                            <div class="analytics-card">
                                <div class="analytics-icon">👁️</div>
                                <div class="analytics-content">
                                    <div class="analytics-value" id="total-views">0</div>
                                    <div class="analytics-label">Total Views</div>
                                </div>
                            </div>
                            <div class="analytics-card">
                                <div class="analytics-icon">💬</div>
                                <div class="analytics-content">
                                    <div class="analytics-value" id="chat-activity">0</div>
                                    <div class="analytics-label">Messages/Min</div>
                                </div>
                            </div>
                            <div class="analytics-card">
                                <div class="analytics-icon">👥</div>
                                <div class="analytics-content">
                                    <div class="analytics-value" id="new-followers">0</div>
                                    <div class="analytics-label">New Followers</div>
                                </div>
                            </div>
                            <div class="analytics-card">
                                <div class="analytics-icon">🎁</div>
                                <div class="analytics-content">
                                    <div class="analytics-value" id="gifts-received">0</div>
                                    <div class="analytics-label">Gifts Received</div>
                                </div>
                            </div>
                        </div>

                        <!-- Real-time Chart -->
                        <div class="viewer-chart">
                            <h4>Viewer Activity</h4>
                            <canvas id="viewer-activity-chart" width="300" height="150"></canvas>
                        </div>

                        <!-- Geographic Distribution -->
                        <div class="viewer-locations">
                            <h4>Viewer Locations</h4>
                            <div class="location-list" id="viewer-locations-list">
                                <!-- Location data appears here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stream End Summary Modal -->
            <div id="stream-end-modal" class="modal" style="display: none;">
                <div class="modal-content stream-summary-content">
                    <div class="summary-header">
                        <h2>🎉 Stream Complete!</h2>
                        <button class="close-modal" id="close-summary-modal">&times;</button>
                    </div>
                    
                    <div class="stream-summary">
                        <div class="summary-stats">
                            <div class="summary-stat">
                                <div class="stat-icon">⏱️</div>
                                <div class="stat-content">
                                    <div class="stat-value" id="final-duration">00:00</div>
                                    <div class="stat-label">Stream Duration</div>
                                </div>
                            </div>
                            <div class="summary-stat">
                                <div class="stat-icon">👁️</div>
                                <div class="stat-content">
                                    <div class="stat-value" id="final-peak-viewers">0</div>
                                    <div class="stat-label">Peak Viewers</div>
                                </div>
                            </div>
                            <div class="summary-stat">
                                <div class="stat-icon">👥</div>
                                <div class="stat-content">
                                    <div class="stat-value" id="final-total-views">0</div>
                                    <div class="stat-label">Total Views</div>
                                </div>
                            </div>
                            <div class="summary-stat">
                                <div class="stat-icon">💬</div>
                                <div class="stat-content">
                                    <div class="stat-value" id="final-messages">0</div>
                                    <div class="stat-label">Chat Messages</div>
                                </div>
                            </div>
                        </div>

                        <div class="recording-section" id="recording-section" style="display: none;">
                            <h3>Stream Recording</h3>
                            <div class="recording-info">
                                <p>Your stream has been recorded and is being processed.</p>
                                <div class="recording-actions">
                                    <button class="btn btn-primary" id="view-recording">View Recording</button>
                                    <button class="btn btn-secondary" id="download-recording">Download</button>
                                    <button class="btn btn-secondary" id="share-highlights">Create Highlights</button>
                                </div>
                            </div>
                        </div>

                        <div class="summary-actions">
                            <button class="btn btn-secondary" id="stream-again">Stream Again</button>
                            <button class="btn btn-primary" id="share-stream-summary">Share Summary</button>
                            <button class="btn btn-secondary" id="back-to-streams">Back to Streams</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add to main content area
        const mainContent = document.querySelector('.main-content') || document.body;
        mainContent.insertAdjacentHTML('beforeend', dashboardHTML);

        // Add custom styles
        this.addCustomStyles();
    }

    addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Stream Setup Modal Styles */
            .stream-setup-content {
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
            }

            .stream-setup-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--glass-border);
            }

            .setup-tabs {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 2rem;
                background: var(--glass);
                padding: 0.5rem;
                border-radius: 12px;
            }

            .setup-tab {
                flex: 1;
                padding: 0.75rem 1rem;
                background: transparent;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.3s ease;
                font-weight: 500;
            }

            .setup-tab.active {
                background: var(--primary);
                color: white;
            }

            .setup-tab:hover:not(.active) {
                background: var(--glass-border);
                color: var(--text-primary);
            }

            .setup-panel {
                display: none;
                animation: fadeIn 0.3s ease;
            }

            .setup-panel.active {
                display: block;
            }

            .form-row {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .form-group.half-width {
                flex: 1;
            }

            .char-counter {
                font-size: 0.8rem;
                color: var(--text-muted);
                text-align: right;
                margin-top: 0.25rem;
            }

            .form-hint {
                font-size: 0.8rem;
                color: var(--text-muted);
                margin-top: 0.25rem;
                display: block;
            }

            .form-options {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin-top: 1.5rem;
            }

            .checkbox-option {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                cursor: pointer;
                user-select: none;
            }

            .checkbox-option input[type="checkbox"] {
                display: none;
            }

            .checkmark {
                width: 20px;
                height: 20px;
                border: 2px solid var(--glass-border);
                border-radius: 4px;
                position: relative;
                transition: all 0.3s ease;
            }

            .checkbox-option input[type="checkbox"]:checked + .checkmark {
                background: var(--primary);
                border-color: var(--primary);
            }

            .checkbox-option input[type="checkbox"]:checked + .checkmark::after {
                content: '✓';
                position: absolute;
                color: white;
                font-size: 12px;
                top: -2px;
                left: 3px;
            }

            .technical-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                margin-bottom: 2rem;
            }

            .camera-preview-container {
                position: relative;
                width: 100%;
                aspect-ratio: 16/9;
                background: var(--bg-primary);
                border-radius: 12px;
                overflow: hidden;
                border: 1px solid var(--glass-border);
            }

            .camera-preview-container video {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .camera-overlay {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            .device-controls {
                display: flex;
                gap: 1rem;
                margin-top: 1rem;
            }

            .device-btn {
                flex: 1;
                padding: 0.75rem;
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 8px;
                color: var(--text-secondary);
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
            }

            .device-btn.active {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }

            .device-btn:hover:not(.active) {
                background: var(--glass-border);
                color: var(--text-primary);
            }

            .device-icon {
                font-size: 1.5rem;
            }

            .audio-level-meter {
                width: 100%;
                height: 20px;
                background: var(--glass);
                border-radius: 10px;
                overflow: hidden;
                margin: 0.5rem 0;
            }

            .audio-level-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--success), var(--warning), var(--error));
                border-radius: 10px;
                width: 0%;
                transition: width 0.1s ease;
            }

            .audio-controls {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .volume-slider {
                width: 100%;
                height: 6px;
                background: var(--glass);
                border-radius: 3px;
                outline: none;
                -webkit-appearance: none;
                appearance: none;
            }

            .volume-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                background: var(--primary);
                border-radius: 50%;
                cursor: pointer;
            }

            .quality-options {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }

            .quality-option {
                cursor: pointer;
            }

            .quality-option input[type="radio"] {
                display: none;
            }

            .quality-card {
                padding: 1rem;
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 8px;
                transition: all 0.3s ease;
                text-align: center;
            }

            .quality-card.active,
            .quality-option input[type="radio"]:checked + .quality-card {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }

            .quality-card:hover {
                border-color: var(--primary);
                transform: translateY(-2px);
            }

            .quality-title {
                font-weight: 600;
                margin-bottom: 0.25rem;
            }

            .quality-desc {
                font-size: 0.9rem;
                opacity: 0.8;
            }

            .quality-warning {
                font-size: 0.8rem;
                margin-top: 0.5rem;
                opacity: 0.9;
            }

            .checklist-container {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .checklist-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                background: var(--glass);
                border-radius: 8px;
                border: 1px solid var(--glass-border);
            }

            .check-icon {
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: var(--glass-border);
                font-size: 1.5rem;
            }

            .checklist-item.success .check-icon {
                background: var(--success);
                color: white;
            }

            .checklist-item.error .check-icon {
                background: var(--error);
                color: white;
            }

            .check-content {
                flex: 1;
            }

            .check-title {
                font-weight: 600;
                margin-bottom: 0.25rem;
            }

            .check-status {
                font-size: 0.9rem;
                color: var(--text-secondary);
            }

            .check-action {
                padding: 0.5rem 1rem;
                background: var(--primary);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .setup-actions {
                display: flex;
                justify-content: space-between;
                gap: 1rem;
                margin-top: 2rem;
                padding-top: 2rem;
                border-top: 1px solid var(--glass-border);
            }

            /* Live Stream Dashboard Styles */
            .stream-dashboard {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: var(--bg-primary);
                z-index: 9999;
                display: flex;
                flex-direction: column;
            }

            .dashboard-header {
                background: var(--bg-secondary);
                border-bottom: 1px solid var(--glass-border);
                padding: 1rem;
            }

            .stream-status-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                max-width: 1400px;
                margin: 0 auto;
            }

            .live-indicator {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 600;
            }

            .live-dot {
                width: 12px;
                height: 12px;
                background: var(--error);
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            .stream-timer {
                font-family: 'Courier New', monospace;
                font-size: 1.2rem;
                font-weight: 600;
                color: var(--primary);
            }

            .viewer-stats {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .peak-viewers {
                color: var(--text-secondary);
                font-size: 0.9rem;
            }

            .connection-indicator {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                background: var(--glass);
                border-radius: 20px;
                border: 1px solid var(--glass-border);
            }

            .connection-indicator.stable {
                border-color: var(--success);
            }

            .connection-indicator.unstable {
                border-color: var(--warning);
            }

            .connection-indicator.poor {
                border-color: var(--error);
            }

            .dashboard-grid {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr;
                gap: 2rem;
                padding: 2rem;
                flex: 1;
                overflow: hidden;
                max-width: 1400px;
                margin: 0 auto;
                width: 100%;
            }

            .preview-section {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .live-preview-container {
                position: relative;
                aspect-ratio: 16/9;
                background: var(--bg-secondary);
                border-radius: 12px;
                overflow: hidden;
                border: 1px solid var(--glass-border);
            }

            .live-preview-container video {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .preview-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.5) 100%);
                pointer-events: none;
            }

            .stream-info-overlay {
                position: absolute;
                top: 1rem;
                left: 1rem;
                right: 1rem;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }

            .stream-quality-indicator {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 0.25rem;
                font-size: 0.9rem;
                background: rgba(0,0,0,0.7);
                padding: 0.5rem;
                border-radius: 6px;
            }

            .engagement-notifications {
                position: absolute;
                bottom: 4rem;
                left: 1rem;
                right: 1rem;
                pointer-events: none;
            }

            .stream-controls {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                background: var(--bg-card);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 1.5rem;
            }

            .primary-controls {
                display: flex;
                gap: 1rem;
                align-items: center;
            }

            .secondary-controls {
                display: flex;
                gap: 1rem;
                align-items: center;
            }

            .control-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.25rem;
                padding: 1rem;
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                color: var(--text-secondary);
                flex: 1;
            }

            .control-btn.active {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }

            .control-btn:hover:not(.active) {
                background: var(--glass-border);
                color: var(--text-primary);
            }

            .control-icon {
                font-size: 1.5rem;
            }

            .control-label {
                font-size: 0.8rem;
                font-weight: 500;
            }

            .control-select {
                padding: 0.5rem;
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 6px;
                color: var(--text-primary);
                cursor: pointer;
            }

            .chat-section {
                background: var(--bg-card);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .chat-header {
                padding: 1rem;
                border-bottom: 1px solid var(--glass-border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .chat-stats {
                font-size: 0.9rem;
                color: var(--text-secondary);
            }

            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
                max-height: 400px;
            }

            .chat-input-section {
                border-top: 1px solid var(--glass-border);
                padding: 1rem;
            }

            .reaction-bar {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
                justify-content: center;
            }

            .reaction-btn {
                width: 40px;
                height: 40px;
                border: none;
                background: var(--glass);
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 1.2rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .reaction-btn:hover {
                background: var(--glass-border);
                transform: scale(1.1);
            }

            .moderator-tools {
                display: flex;
                gap: 0.5rem;
                margin-top: 1rem;
            }

            .mod-btn {
                padding: 0.5rem;
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 6px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.3s ease;
                color: var(--text-secondary);
            }

            .analytics-section {
                background: var(--bg-card);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 1.5rem;
                overflow-y: auto;
            }

            .analytics-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .analytics-card {
                padding: 1rem;
                background: var(--glass);
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .analytics-icon {
                width: 40px;
                height: 40px;
                background: var(--primary);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
            }

            .analytics-value {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--primary);
            }

            .analytics-label {
                font-size: 0.8rem;
                color: var(--text-secondary);
            }

            .viewer-chart {
                margin-bottom: 2rem;
            }

            .viewer-chart h4 {
                margin-bottom: 1rem;
            }

            .viewer-locations h4 {
                margin-bottom: 1rem;
            }

            .location-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            /* Stream Summary Modal */
            .stream-summary-content {
                max-width: 600px;
            }

            .summary-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--glass-border);
            }

            .summary-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .summary-stat {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                background: var(--glass);
                border-radius: 12px;
            }

            .stat-icon {
                width: 50px;
                height: 50px;
                background: var(--primary);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }

            .stat-content {
                flex: 1;
            }

            .stat-value {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--primary);
                margin-bottom: 0.25rem;
            }

            .stat-label {
                font-size: 0.9rem;
                color: var(--text-secondary);
            }

            .recording-section {
                background: var(--glass);
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 2rem;
            }

            .recording-actions {
                display: flex;
                gap: 1rem;
                margin-top: 1rem;
            }

            .summary-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
            }

            /* Responsive Design */
            @media (max-width: 1024px) {
                .dashboard-grid {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }

                .technical-grid {
                    grid-template-columns: 1fr;
                }

                .quality-options {
                    grid-template-columns: 1fr;
                }

                .summary-stats {
                    grid-template-columns: 1fr;
                }

                .analytics-grid {
                    grid-template-columns: 1fr;
                }
            }

            /* Animations */
            @keyframes engagementNotification {
                0% { opacity: 0; transform: translateY(20px); }
                20% { opacity: 1; transform: translateY(0); }
                80% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-20px); }
            }

            .engagement-notification {
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 0.75rem 1rem;
                border-radius: 20px;
                margin-bottom: 0.5rem;
                animation: engagementNotification 4s ease-in-out;
                backdrop-filter: blur(10px);
            }
        `;

        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Setup tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('setup-tab')) {
                this.switchSetupTab(e.target.dataset.tab);
            }
        });

        // Character counters
        const titleInput = document.getElementById('stream-title');
        const descInput = document.getElementById('stream-description');
        
        if (titleInput) {
            titleInput.addEventListener('input', (e) => {
                const counter = e.target.parentNode.querySelector('.char-counter');
                if (counter) {
                    counter.textContent = `${e.target.value.length}/100`;
                    if (e.target.value.length > 80) counter.style.color = 'var(--warning)';
                    else if (e.target.value.length > 95) counter.style.color = 'var(--error)';
                    else counter.style.color = 'var(--text-muted)';
                }
                this.validateForm();
            });
        }

        if (descInput) {
            descInput.addEventListener('input', (e) => {
                const counter = e.target.parentNode.querySelector('.char-counter');
                if (counter) {
                    counter.textContent = `${e.target.value.length}/500`;
                }
            });
        }

        // Quality selection
        document.addEventListener('change', (e) => {
            if (e.target.name === 'quality') {
                document.querySelectorAll('.quality-card').forEach(card => card.classList.remove('active'));
                e.target.nextElementSibling.classList.add('active');
                this.currentQuality = e.target.value;
            }
        });

        // Modal controls
        document.getElementById('close-setup-modal')?.addEventListener('click', () => {
            this.closeSetupModal();
        });

        document.getElementById('cancel-setup')?.addEventListener('click', () => {
            this.closeSetupModal();
        });

        document.getElementById('start-streaming')?.addEventListener('click', () => {
            this.initiateStream();
        });

        // Device controls
        document.getElementById('toggle-camera')?.addEventListener('click', () => {
            this.toggleCamera();
        });

        document.getElementById('toggle-mic')?.addEventListener('click', () => {
            this.toggleMicrophone();
        });

        // Live dashboard controls
        document.getElementById('end-stream-btn')?.addEventListener('click', () => {
            this.endStream();
        });

        document.getElementById('camera-toggle')?.addEventListener('click', () => {
            this.toggleCamera();
        });

        document.getElementById('mic-toggle')?.addEventListener('click', () => {
            this.toggleMicrophone();
        });

        // Reactions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('reaction-btn')) {
                this.sendReaction(e.target.dataset.reaction);
            }
        });

        // Stream end modal
        document.getElementById('close-summary-modal')?.addEventListener('click', () => {
            this.closeSummaryModal();
        });

        document.getElementById('stream-again')?.addEventListener('click', () => {
            this.streamAgain();
        });

        document.getElementById('back-to-streams')?.addEventListener('click', () => {
            this.backToStreams();
        });
    }

    async setupMediaDevices() {
        try {
            // Enumerate available devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const micSelect = document.getElementById('mic-select');
            
            if (micSelect) {
                micSelect.innerHTML = '<option>Default Microphone</option>';
                devices.filter(device => device.kind === 'audioinput').forEach(device => {
                    const option = document.createElement('option');
                    option.value = device.deviceId;
                    option.textContent = device.label || `Microphone ${micSelect.options.length}`;
                    micSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error enumerating devices:', error);
        }
    }

    switchSetupTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.setup-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update panels
        document.querySelectorAll('.setup-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}-panel`).classList.add('active');

        // Run specific tab actions
        if (tabName === 'technical') {
            this.setupTechnicalPreview();
        } else if (tabName === 'checklist') {
            this.runPreStreamChecklist();
        }
    }

    async setupTechnicalPreview() {
        try {
            if (!this.localStream) {
                this.localStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
            }

            const preview = document.getElementById('camera-preview');
            if (preview && this.localStream) {
                preview.srcObject = this.localStream;
            }

            // Start audio level monitoring
            this.startAudioLevelMonitoring();
        } catch (error) {
            console.error('Error setting up technical preview:', error);
            this.showPermissionError('camera');
        }
    }

    startAudioLevelMonitoring() {
        if (!this.localStream) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(this.localStream);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        analyser.fftSize = 256;
        microphone.connect(analyser);

        const updateAudioLevel = () => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
            const percentage = (average / 255) * 100;

            const audioLevel = document.getElementById('audio-level');
            if (audioLevel) {
                audioLevel.style.width = `${percentage}%`;
            }

            if (this.isStreaming) {
                requestAnimationFrame(updateAudioLevel);
            }
        };

        updateAudioLevel();
    }

    async runPreStreamChecklist() {
        const checks = [
            { id: 'check-camera', test: this.checkCameraAccess.bind(this) },
            { id: 'check-microphone', test: this.checkMicrophoneAccess.bind(this) },
            { id: 'check-connection', test: this.checkInternetConnection.bind(this) },
            { id: 'check-stream-config', test: this.checkStreamConfiguration.bind(this) }
        ];

        for (const check of checks) {
            await this.runCheck(check.id, check.test);
        }

        // Enable start button if all checks pass
        const allPassed = checks.every(check => {
            const item = document.getElementById(check.id);
            return item.classList.contains('success');
        });

        const startBtn = document.getElementById('start-streaming');
        if (startBtn) {
            startBtn.disabled = !allPassed;
        }
    }

    async runCheck(checkId, testFunction) {
        const item = document.getElementById(checkId);
        const icon = item.querySelector('.check-icon');
        const status = item.querySelector('.check-status');

        icon.textContent = '⏳';
        status.textContent = 'Checking...';
        item.classList.remove('success', 'error');

        try {
            const result = await testFunction();
            if (result.success) {
                icon.textContent = '✅';
                status.textContent = result.message;
                item.classList.add('success');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            icon.textContent = '❌';
            status.textContent = error.message;
            item.classList.add('error');
        }
    }

    async checkCameraAccess() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            return { success: true, message: 'Camera access granted' };
        } catch (error) {
            return { success: false, message: 'Camera access denied' };
        }
    }

    async checkMicrophoneAccess() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return { success: true, message: 'Microphone access granted' };
        } catch (error) {
            return { success: false, message: 'Microphone access denied' };
        }
    }

    async checkInternetConnection() {
        try {
            const startTime = Date.now();
            const response = await fetch('https://www.google.com/favicon.ico', { 
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache'
            });
            const endTime = Date.now();
            const latency = endTime - startTime;

            // Simulate speed test
            const downloadSpeed = Math.random() * 50 + 10; // 10-60 Mbps
            const uploadSpeed = Math.random() * 20 + 5; // 5-25 Mbps

            // Update UI with results
            document.getElementById('download-speed').textContent = `${downloadSpeed.toFixed(1)} Mbps`;
            document.getElementById('upload-speed').textContent = `${uploadSpeed.toFixed(1)} Mbps`;
            document.getElementById('latency').textContent = `${latency}ms`;

            const results = document.getElementById('connection-results');
            if (results) results.style.display = 'block';

            // Provide quality recommendation
            const recommendation = document.getElementById('quality-recommendation');
            if (recommendation) {
                if (uploadSpeed >= 15) {
                    recommendation.textContent = '✅ Excellent connection - 1080p recommended';
                    recommendation.style.color = 'var(--success)';
                } else if (uploadSpeed >= 8) {
                    recommendation.textContent = '✅ Good connection - 720p recommended';
                    recommendation.style.color = 'var(--success)';
                } else if (uploadSpeed >= 4) {
                    recommendation.textContent = '⚠️ Fair connection - 480p recommended';
                    recommendation.style.color = 'var(--warning)';
                } else {
                    recommendation.textContent = '❌ Poor connection - consider improving internet';
                    recommendation.style.color = 'var(--error)';
                    throw new Error('Internet connection too slow for streaming');
                }
            }

            return { success: true, message: `Connection speed: ${uploadSpeed.toFixed(1)} Mbps up` };
        } catch (error) {
            return { success: false, message: 'Connection test failed' };
        }
    }

    async checkStreamConfiguration() {
        const title = document.getElementById('stream-title').value.trim();
        const category = document.getElementById('stream-category').value;

        if (!title) {
            return { success: false, message: 'Stream title is required' };
        }

        if (!category) {
            return { success: false, message: 'Stream category is required' };
        }

        if (title.length < 3) {
            return { success: false, message: 'Stream title too short' };
        }

        return { success: true, message: 'Stream configuration valid' };
    }

    validateForm() {
        const title = document.getElementById('stream-title').value.trim();
        const category = document.getElementById('stream-category').value;
        const startBtn = document.getElementById('start-streaming');

        if (startBtn) {
            startBtn.disabled = !title || !category || title.length < 3;
        }
    }

    async showSetupModal() {
        const modal = document.getElementById('stream-setup-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeSetupModal() {
        const modal = document.getElementById('stream-setup-modal');
        if (modal) {
            modal.style.display = 'none';
        }

        // Clean up streams
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
    }

    async initiateStream() {
        try {
            // Get form data
            const formData = this.getStreamFormData();

            // Create stream record
            const streamResponse = await this.createStreamRecord(formData);
            
            if (streamResponse.success) {
                this.currentStream = streamResponse.stream;
                
                // Close setup modal and show dashboard
                this.closeSetupModal();
                this.showLiveDashboard();
                
                // Start actual streaming
                await this.startLiveStream();
            }
        } catch (error) {
            console.error('Error initiating stream:', error);
            this.showToast('Failed to start stream', 'error');
        }
    }

    getStreamFormData() {
        return {
            title: document.getElementById('stream-title').value.trim(),
            description: document.getElementById('stream-description').value.trim(),
            category: document.getElementById('stream-category').value,
            privacy: document.getElementById('stream-privacy').value,
            tags: document.getElementById('stream-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            chatEnabled: document.getElementById('chat-enabled').checked,
            recordingEnabled: document.getElementById('recording-enabled').checked,
            monetizationEnabled: document.getElementById('monetization-enabled').checked,
            quality: this.currentQuality
        };
    }

    async createStreamRecord(formData) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    stream: {
                        id: 'stream_' + Date.now(),
                        ...formData,
                        createdAt: new Date(),
                        streamKey: 'sk_' + Math.random().toString(36).substr(2, 9)
                    }
                });
            }, 1000);
        });
    }

    showLiveDashboard() {
        const dashboard = document.getElementById('live-stream-dashboard');
        if (dashboard) {
            dashboard.style.display = 'flex';
            
            // Update stream info
            const titleElement = document.getElementById('live-stream-title');
            const qualityElement = document.getElementById('current-quality');
            const bitrateElement = document.getElementById('current-bitrate');

            if (titleElement) titleElement.textContent = this.currentStream.title;
            if (qualityElement) qualityElement.textContent = this.currentStream.quality;
            if (bitrateElement) {
                const bitrates = {
                    '1080p': '6000 kbps',
                    '720p': '4000 kbps',
                    '480p': '2500 kbps',
                    '360p': '1000 kbps'
                };
                bitrateElement.textContent = bitrates[this.currentStream.quality];
            }
        }
    }

    async startLiveStream() {
        try {
            // Get media stream if not already available
            if (!this.localStream) {
                this.localStream = await navigator.mediaDevices.getUserMedia({
                    video: this.cameraEnabled,
                    audio: this.microphoneEnabled
                });
            }

            // Set up live preview
            const livePreview = document.getElementById('live-preview');
            if (livePreview && this.localStream) {
                livePreview.srcObject = this.localStream;
            }

            // Update streaming state
            this.isStreaming = true;
            this.streamStartTime = Date.now();

            // Update status
            const statusText = document.getElementById('stream-status-text');
            if (statusText) statusText.textContent = 'LIVE';

            // Start timers and analytics
            this.startStreamTimer();
            this.startAnalyticsUpdates();
            this.simulateViewerActivity();

            // Set up socket connection for real-time features
            this.setupStreamSocket();

            this.showToast('Stream started successfully!', 'success');
        } catch (error) {
            console.error('Error starting live stream:', error);
            this.showToast('Failed to start stream', 'error');
        }
    }

    startStreamTimer() {
        if (this.streamTimer) clearInterval(this.streamTimer);
        
        this.streamTimer = setInterval(() => {
            if (this.isStreaming && this.streamStartTime) {
                const elapsed = Date.now() - this.streamStartTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                
                const timerElement = document.getElementById('stream-duration');
                if (timerElement) {
                    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
                
                this.sessionStats.duration = elapsed;
            }
        }, 1000);
    }

    startAnalyticsUpdates() {
        if (this.analyticsInterval) clearInterval(this.analyticsInterval);
        
        this.analyticsInterval = setInterval(() => {
            this.updateAnalytics();
        }, 5000); // Update every 5 seconds
    }

    updateAnalytics() {
        // Update analytics cards
        document.getElementById('total-views').textContent = this.totalViews;
        document.getElementById('chat-activity').textContent = Math.floor(this.sessionStats.messages / (this.sessionStats.duration / 60000) || 0);
        document.getElementById('new-followers').textContent = this.sessionStats.followers;
        document.getElementById('gifts-received').textContent = this.sessionStats.gifts;

        // Update viewer chart
        this.updateViewerChart();
        
        // Update geographic locations
        this.updateViewerLocations();
    }

    updateViewerChart() {
        const canvas = document.getElementById('viewer-activity-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw simple line chart
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Generate sample data points
        const points = 20;
        for (let i = 0; i < points; i++) {
            const x = (i / (points - 1)) * width;
            const y = height - (Math.random() * 0.5 + 0.3) * height;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.stroke();
    }

    updateViewerLocations() {
        const locationsList = document.getElementById('viewer-locations-list');
        if (!locationsList) return;

        const locations = [
            { country: '🇺🇸 United States', count: Math.floor(this.viewerCount * 0.4) },
            { country: '🇬🇧 United Kingdom', count: Math.floor(this.viewerCount * 0.2) },
            { country: '🇨🇦 Canada', count: Math.floor(this.viewerCount * 0.15) },
            { country: '🇩🇪 Germany', count: Math.floor(this.viewerCount * 0.1) },
            { country: '🇫🇷 France', count: Math.floor(this.viewerCount * 0.1) },
            { country: '🌍 Others', count: Math.floor(this.viewerCount * 0.05) }
        ].filter(loc => loc.count > 0);

        locationsList.innerHTML = locations.map(loc => `
            <div class="location-item" style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
                <span>${loc.country}</span>
                <span style="color: var(--primary); font-weight: 600;">${loc.count}</span>
            </div>
        `).join('');
    }

    simulateViewerActivity() {
        // Simulate gradual increase in viewers
        let baseViewers = 0;
        const viewerSimulation = setInterval(() => {
            if (!this.isStreaming) {
                clearInterval(viewerSimulation);
                return;
            }

            // Random viewer changes
            const change = Math.floor(Math.random() * 5) - 2; // -2 to +3
            baseViewers = Math.max(0, baseViewers + change);
            
            // Add some randomness based on stream duration
            const timeBonus = Math.floor(this.sessionStats.duration / 60000); // 1 per minute
            this.viewerCount = baseViewers + timeBonus + Math.floor(Math.random() * 3);
            
            if (this.viewerCount > this.peakViewers) {
                this.peakViewers = this.viewerCount;
            }

            this.totalViews += Math.max(0, change);

            // Update UI
            document.getElementById('current-viewer-count').textContent = this.viewerCount;
            document.getElementById('peak-viewer-count').textContent = this.peakViewers;
        }, 3000);
    }

    setupStreamSocket() {
        // Simulate socket connection
        this.streamSocket = {
            emit: (event, data) => console.log('Socket emit:', event, data),
            on: (event, callback) => console.log('Socket on:', event)
        };

        // Simulate incoming messages and reactions
        this.simulateChatActivity();
    }

    simulateChatActivity() {
        const messages = [
            { user: 'StreamFan23', text: 'Great stream! 🔥' },
            { user: 'ViewerOne', text: 'Love the content!' },
            { user: 'ChatMaster', text: 'Keep it up! 👏' },
            { user: 'LiveWatcher', text: 'Amazing quality!' },
            { user: 'StreamLover', text: 'This is awesome! ❤️' }
        ];

        const chatSimulation = setInterval(() => {
            if (!this.isStreaming) {
                clearInterval(chatSimulation);
                return;
            }

            if (Math.random() < 0.3) { // 30% chance of message
                const message = messages[Math.floor(Math.random() * messages.length)];
                this.addChatMessage(message.user, message.text);
                this.sessionStats.messages++;
            }

            if (Math.random() < 0.1) { // 10% chance of reaction
                const reactions = ['heart', 'fire', 'clap', 'wow'];
                const reaction = reactions[Math.floor(Math.random() * reactions.length)];
                this.showEngagementNotification(`Someone reacted with ${reaction}!`);
                this.sessionStats.reactions++;
            }
        }, 5000);
    }

    addChatMessage(username, message) {
        const chatContainer = document.getElementById('live-chat-messages');
        if (!chatContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message-item';
        messageElement.innerHTML = `
            <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="color: var(--primary); font-weight: 600;">${username}:</span>
                <span style="color: var(--text-primary);">${message}</span>
            </div>
        `;

        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Update message count
        const messageCount = document.getElementById('message-count');
        if (messageCount) {
            messageCount.textContent = this.sessionStats.messages;
        }
    }

    showEngagementNotification(text) {
        const container = document.getElementById('engagement-notifications');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = 'engagement-notification';
        notification.textContent = text;

        container.appendChild(notification);

        // Remove after animation
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    toggleCamera() {
        this.cameraEnabled = !this.cameraEnabled;
        
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = this.cameraEnabled;
            }
        }

        // Update button states
        const setupBtn = document.getElementById('toggle-camera');
        const liveBtn = document.getElementById('camera-toggle');
        
        [setupBtn, liveBtn].forEach(btn => {
            if (btn) {
                if (this.cameraEnabled) {
                    btn.classList.add('active');
                    btn.querySelector('.control-icon, .device-icon').textContent = '📹';
                } else {
                    btn.classList.remove('active');
                    btn.querySelector('.control-icon, .device-icon').textContent = '📹';
                    btn.style.opacity = '0.5';
                }
            }
        });
    }

    toggleMicrophone() {
        this.microphoneEnabled = !this.microphoneEnabled;
        
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = this.microphoneEnabled;
            }
        }

        // Update button states
        const setupBtn = document.getElementById('toggle-mic');
        const liveBtn = document.getElementById('mic-toggle');
        
        [setupBtn, liveBtn].forEach(btn => {
            if (btn) {
                if (this.microphoneEnabled) {
                    btn.classList.add('active');
                    btn.querySelector('.control-icon, .device-icon').textContent = '🎤';
                } else {
                    btn.classList.remove('active');
                    btn.querySelector('.control-icon, .device-icon').textContent = '🎤';
                    btn.style.opacity = '0.5';
                }
            }
        });
    }

    sendReaction(reactionType) {
        this.showEngagementNotification(`You reacted with ${reactionType}!`);
        this.sessionStats.reactions++;
    }

    async endStream() {
        if (!this.isStreaming) return;

        try {
            this.isStreaming = false;

            // Stop timers
            if (this.streamTimer) clearInterval(this.streamTimer);
            if (this.analyticsInterval) clearInterval(this.analyticsInterval);

            // Stop media tracks
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => track.stop());
                this.localStream = null;
            }

            // Hide dashboard
            const dashboard = document.getElementById('live-stream-dashboard');
            if (dashboard) dashboard.style.display = 'none';

            // Show summary
            this.showStreamSummary();

            this.showToast('Stream ended successfully', 'success');
        } catch (error) {
            console.error('Error ending stream:', error);
            this.showToast('Error ending stream', 'error');
        }
    }

    showStreamSummary() {
        const modal = document.getElementById('stream-end-modal');
        if (!modal) return;

        // Calculate duration
        const duration = this.sessionStats.duration;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        const durationText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update summary stats
        document.getElementById('final-duration').textContent = durationText;
        document.getElementById('final-peak-viewers').textContent = this.peakViewers;
        document.getElementById('final-total-views').textContent = this.totalViews;
        document.getElementById('final-messages').textContent = this.sessionStats.messages;

        // Show recording section if recording was enabled
        const recordingSection = document.getElementById('recording-section');
        if (recordingSection && this.currentStream?.recordingEnabled) {
            recordingSection.style.display = 'block';
        }

        modal.style.display = 'flex';
    }

    closeSummaryModal() {
        const modal = document.getElementById('stream-end-modal');
        if (modal) modal.style.display = 'none';
    }

    streamAgain() {
        this.closeSummaryModal();
        this.resetStreamState();
        this.showSetupModal();
    }

    backToStreams() {
        this.closeSummaryModal();
        this.resetStreamState();
        
        // Hide streaming section and show main content
        const streamingSection = document.getElementById('streaming-section');
        if (streamingSection) streamingSection.style.display = 'block';
    }

    resetStreamState() {
        this.currentStream = null;
        this.isStreaming = false;
        this.streamStartTime = null;
        this.viewerCount = 0;
        this.peakViewers = 0;
        this.totalViews = 0;
        this.chatMessages = [];
        this.sessionStats = {
            duration: 0,
            messages: 0,
            reactions: 0,
            gifts: 0,
            followers: 0
        };
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize the dashboard
const streamSessionDashboard = new StreamSessionDashboard();

// Export for global access
window.streamSessionDashboard = streamSessionDashboard;

// Integration with existing streaming manager
if (window.streamingManager) {
    // Override the start stream functionality
    window.streamingManager.showStartSession = () => {
        streamSessionDashboard.showSetupModal();
    };
}
