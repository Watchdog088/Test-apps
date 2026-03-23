class EnhancedStreamingFeatures {
    constructor() {
        this.scheduledStreams = [];
        this.streamTemplates = [];
        this.moderationRules = [];
        this.performanceHistory = [];
        this.revenueTracking = {
            totalEarnings: 0,
            sessionEarnings: 0,
            donations: [],
            subscriptions: []
        };
        
        this.initializeFeatures();
    }

    initializeFeatures() {
        this.createEnhancedStreamingHTML();
        this.setupEnhancedEventListeners();
        this.loadUserPreferences();
    }

    createEnhancedStreamingHTML() {
        const enhancedHTML = `
            <!-- Stream Scheduling Modal -->
            <div id="stream-schedule-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>📅 Schedule Stream</h2>
                        <button class="close-modal" id="close-schedule-modal">&times;</button>
                    </div>
                    
                    <form id="schedule-stream-form">
                        <div class="form-group">
                            <label class="form-label">Stream Title</label>
                            <input type="text" id="schedule-title" class="form-input" placeholder="Enter stream title..." required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group half-width">
                                <label class="form-label">Date</label>
                                <input type="date" id="schedule-date" class="form-input" required>
                            </div>
                            <div class="form-group half-width">
                                <label class="form-label">Time</label>
                                <input type="time" id="schedule-time" class="form-input" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Duration (minutes)</label>
                            <input type="number" id="schedule-duration" class="form-input" value="60" min="15" max="480">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea id="schedule-description" class="form-input" rows="3" placeholder="What will you stream about?"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Category</label>
                            <select id="schedule-category" class="form-input" required>
                                <option value="">Select Category</option>
                                <option value="gaming">🎮 Gaming</option>
                                <option value="music">🎵 Music</option>
                                <option value="talk">💬 Talk Show</option>
                                <option value="education">📚 Educational</option>
                                <option value="cooking">🍳 Cooking</option>
                                <option value="fitness">🏋️ Fitness</option>
                                <option value="art">🎨 Art & Creativity</option>
                            </select>
                        </div>
                        
                        <div class="form-options">
                            <label class="checkbox-option">
                                <input type="checkbox" id="schedule-notifications">
                                <span class="checkmark"></span>
                                Send notifications to followers
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" id="schedule-reminder">
                                <span class="checkmark"></span>
                                Set reminder for me
                            </label>
                        </div>
                        
                        <div class="modal-actions">
                            <button type="button" id="cancel-schedule" class="btn btn-secondary">Cancel</button>
                            <button type="submit" class="btn btn-primary">Schedule Stream</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Stream Templates Modal -->
            <div id="stream-templates-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>📋 Stream Templates</h2>
                        <button class="close-modal" id="close-templates-modal">&times;</button>
                    </div>
                    
                    <div class="templates-grid" id="templates-grid">
                        <!-- Templates will be populated here -->
                    </div>
                    
                    <div class="create-template-section">
                        <h3>Create New Template</h3>
                        <form id="create-template-form">
                            <div class="form-group">
                                <input type="text" id="template-name" class="form-input" placeholder="Template name..." required>
                            </div>
                            <div class="form-group">
                                <textarea id="template-description" class="form-input" placeholder="Template description..." rows="2"></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary btn-small">Save Template</button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Revenue Dashboard Modal -->
            <div id="revenue-dashboard-modal" class="modal" style="display: none;">
                <div class="modal-content revenue-modal">
                    <div class="modal-header">
                        <h2>💰 Revenue Dashboard</h2>
                        <button class="close-modal" id="close-revenue-modal">&times;</button>
                    </div>
                    
                    <div class="revenue-summary">
                        <div class="revenue-card">
                            <div class="revenue-icon">💵</div>
                            <div class="revenue-info">
                                <div class="revenue-amount" id="total-earnings">$0.00</div>
                                <div class="revenue-label">Total Earnings</div>
                            </div>
                        </div>
                        <div class="revenue-card">
                            <div class="revenue-icon">📈</div>
                            <div class="revenue-info">
                                <div class="revenue-amount" id="session-earnings">$0.00</div>
                                <div class="revenue-label">This Session</div>
                            </div>
                        </div>
                        <div class="revenue-card">
                            <div class="revenue-icon">🎁</div>
                            <div class="revenue-info">
                                <div class="revenue-amount" id="donations-count">0</div>
                                <div class="revenue-label">Donations</div>
                            </div>
                        </div>
                        <div class="revenue-card">
                            <div class="revenue-icon">👥</div>
                            <div class="revenue-info">
                                <div class="revenue-amount" id="subscribers-count">0</div>
                                <div class="revenue-label">Subscribers</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="revenue-chart">
                        <h3>Revenue History</h3>
                        <canvas id="revenue-chart" width="400" height="200"></canvas>
                    </div>
                    
                    <div class="recent-donations">
                        <h3>Recent Donations</h3>
                        <div id="donations-list">
                            <!-- Donations will be listed here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Advanced Moderation Panel -->
            <div id="moderation-panel" class="side-panel" style="display: none;">
                <div class="panel-header">
                    <h3>🛡️ Moderation Tools</h3>
                    <button class="close-panel" id="close-moderation-panel">&times;</button>
                </div>
                
                <div class="moderation-controls">
                    <div class="control-group">
                        <h4>Chat Controls</h4>
                        <button class="mod-control-btn" id="toggle-slow-mode" data-active="false">
                            <span class="control-icon">⏱️</span>
                            <span class="control-text">Slow Mode</span>
                            <span class="control-status">Off</span>
                        </button>
                        <button class="mod-control-btn" id="toggle-followers-only" data-active="false">
                            <span class="control-icon">👥</span>
                            <span class="control-text">Followers Only</span>
                            <span class="control-status">Off</span>
                        </button>
                        <button class="mod-control-btn" id="toggle-sub-only" data-active="false">
                            <span class="control-icon">⭐</span>
                            <span class="control-text">Subscriber Only</span>
                            <span class="control-status">Off</span>
                        </button>
                        <button class="mod-control-btn" id="clear-chat">
                            <span class="control-icon">🗑️</span>
                            <span class="control-text">Clear Chat</span>
                        </button>
                    </div>
                    
                    <div class="control-group">
                        <h4>Viewer Management</h4>
                        <div class="viewer-search">
                            <input type="text" id="viewer-search" class="form-input" placeholder="Search viewers...">
                        </div>
                        <div class="viewer-list" id="moderation-viewer-list">
                            <!-- Viewers will be listed here -->
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <h4>Banned Words</h4>
                        <div class="banned-words-input">
                            <input type="text" id="new-banned-word" class="form-input" placeholder="Add banned word...">
                            <button id="add-banned-word" class="btn btn-small">Add</button>
                        </div>
                        <div class="banned-words-list" id="banned-words-list">
                            <!-- Banned words will be listed here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stream Performance Monitor -->
            <div id="performance-monitor" class="floating-panel" style="display: none;">
                <div class="panel-header">
                    <h4>📊 Performance</h4>
                    <button class="minimize-panel" id="minimize-performance">−</button>
                    <button class="close-panel" id="close-performance">×</button>
                </div>
                
                <div class="performance-metrics">
                    <div class="metric-item">
                        <span class="metric-label">FPS:</span>
                        <span class="metric-value" id="fps-value">60</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Bitrate:</span>
                        <span class="metric-value" id="bitrate-value">4000 kbps</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Dropped:</span>
                        <span class="metric-value" id="dropped-frames">0</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">CPU:</span>
                        <span class="metric-value" id="cpu-usage">45%</span>
                    </div>
                </div>
                
                <div class="connection-quality">
                    <div class="quality-indicator" id="connection-quality">
                        <span class="quality-dot stable"></span>
                        <span class="quality-text">Stable</span>
                    </div>
                </div>
            </div>

            <!-- Stream Discovery Tools -->
            <div id="stream-discovery-tools" class="tools-panel" style="display: none;">
                <div class="panel-header">
                    <h3>🔍 Discovery Tools</h3>
                    <button class="close-panel" id="close-discovery-tools">&times;</button>
                </div>
                
                <div class="discovery-sections">
                    <div class="discovery-section">
                        <h4>Trending Tags</h4>
                        <div class="trending-tags" id="trending-tags">
                            <!-- Trending tags will be populated -->
                        </div>
                    </div>
                    
                    <div class="discovery-section">
                        <h4>Recommended Categories</h4>
                        <div class="recommended-categories" id="recommended-categories">
                            <!-- Categories will be populated -->
                        </div>
                    </div>
                    
                    <div class="discovery-section">
                        <h4>Title Optimizer</h4>
                        <div class="title-optimizer">
                            <input type="text" id="title-optimizer-input" class="form-input" placeholder="Enter your title...">
                            <button id="optimize-title" class="btn btn-small">Optimize</button>
                            <div id="title-suggestions" class="suggestions-list">
                                <!-- Title suggestions will appear here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add to main content
        const mainContent = document.querySelector('.main-content') || document.body;
        mainContent.insertAdjacentHTML('beforeend', enhancedHTML);

        this.addEnhancedStyles();
    }

    addEnhancedStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Revenue Dashboard Styles */
            .revenue-modal .modal-content {
                max-width: 800px;
            }

            .revenue-summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .revenue-card {
                padding: 1.5rem;
                background: var(--glass);
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 1rem;
                border: 1px solid var(--glass-border);
                transition: all 0.3s ease;
            }

            .revenue-card:hover {
                transform: translateY(-2px);
                border-color: var(--primary);
            }

            .revenue-icon {
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }

            .revenue-amount {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--primary);
                margin-bottom: 0.25rem;
            }

            .revenue-label {
                font-size: 0.9rem;
                color: var(--text-secondary);
            }

            .revenue-chart {
                margin-bottom: 2rem;
            }

            .revenue-chart h3 {
                margin-bottom: 1rem;
            }

            /* Moderation Panel Styles */
            .side-panel {
                position: fixed;
                top: 80px;
                right: 20px;
                width: 300px;
                max-height: calc(100vh - 120px);
                background: var(--bg-card);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                z-index: 9998;
                overflow-y: auto;
            }

            .panel-header {
                padding: 1rem;
                border-bottom: 1px solid var(--glass-border);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: var(--glass);
            }

            .control-group {
                padding: 1rem;
                border-bottom: 1px solid var(--glass-border);
            }

            .control-group:last-child {
                border-bottom: none;
            }

            .control-group h4 {
                margin-bottom: 1rem;
                color: var(--text-primary);
            }

            .mod-control-btn {
                width: 100%;
                padding: 0.75rem;
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-bottom: 0.5rem;
                color: var(--text-primary);
            }

            .mod-control-btn:hover {
                background: var(--glass-border);
                transform: translateX(2px);
            }

            .mod-control-btn[data-active="true"] {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }

            .control-icon {
                font-size: 1.2rem;
            }

            .control-text {
                flex: 1;
                font-weight: 500;
            }

            .control-status {
                font-size: 0.8rem;
                opacity: 0.8;
            }

            .viewer-search {
                margin-bottom: 1rem;
            }

            .viewer-list {
                max-height: 200px;
                overflow-y: auto;
            }

            .viewer-item {
                padding: 0.5rem;
                border-radius: 6px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.25rem;
                background: var(--glass);
            }

            .viewer-item:hover {
                background: var(--glass-border);
            }

            .banned-words-input {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }

            .banned-words-list {
                display: flex;
                flex-wrap: wrap;
                gap: 0.25rem;
            }

            .banned-word {
                padding: 0.25rem 0.5rem;
                background: var(--error);
                color: white;
                border-radius: 4px;
                font-size: 0.8rem;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }

            .remove-banned-word {
                cursor: pointer;
                opacity: 0.8;
            }

            .remove-banned-word:hover {
                opacity: 1;
            }

            /* Performance Monitor Styles */
            .floating-panel {
                position: fixed;
                top: 120px;
                left: 20px;
                width: 200px;
                background: var(--bg-card);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                z-index: 9997;
                backdrop-filter: blur(10px);
            }

            .performance-metrics {
                padding: 1rem;
            }

            .metric-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
            }

            .metric-label {
                color: var(--text-secondary);
                font-size: 0.9rem;
            }

            .metric-value {
                font-weight: 600;
                color: var(--primary);
                font-size: 0.9rem;
            }

            .connection-quality {
                padding: 0.75rem 1rem;
                border-top: 1px solid var(--glass-border);
            }

            .quality-indicator {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .quality-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
            }

            .quality-dot.stable {
                background: var(--success);
                box-shadow: 0 0 10px var(--success);
            }

            .quality-dot.unstable {
                background: var(--warning);
                box-shadow: 0 0 10px var(--warning);
            }

            .quality-dot.poor {
                background: var(--error);
                box-shadow: 0 0 10px var(--error);
            }

            .quality-text {
                font-size: 0.9rem;
                font-weight: 500;
            }

            /* Discovery Tools Styles */
            .tools-panel {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 350px;
                max-height: 400px;
                background: var(--bg-card);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                z-index: 9996;
                overflow-y: auto;
            }

            .discovery-sections {
                padding: 1rem;
            }

            .discovery-section {
                margin-bottom: 1.5rem;
            }

            .discovery-section:last-child {
                margin-bottom: 0;
            }

            .discovery-section h4 {
                margin-bottom: 0.75rem;
                color: var(--text-primary);
            }

            .trending-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }

            .trending-tag {
                padding: 0.25rem 0.75rem;
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                color: white;
                border-radius: 16px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;
            }

            .trending-tag:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
            }

            .recommended-categories {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .recommended-category {
                padding: 0.75rem;
                background: var(--glass);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .recommended-category:hover {
                background: var(--glass-border);
                transform: translateX(5px);
            }

            .title-optimizer {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .title-optimizer .form-input {
                margin-bottom: 0;
            }

            .suggestions-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                max-height: 150px;
                overflow-y: auto;
            }

            .title-suggestion {
                padding: 0.5rem;
                background: var(--glass);
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s ease;
            }

            .title-suggestion:hover {
                background: var(--glass-border);
                transform: translateX(2px);
            }

            /* Template Styles */
            .templates-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .template-card {
                padding: 1.5rem;
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .template-card:hover {
                transform: translateY(-3px);
                border-color: var(--primary);
                box-shadow: 0 10px 30px rgba(79, 70, 229, 0.2);
            }

            .template-title {
                font-weight: 600;
                margin-bottom: 0.5rem;
                color: var(--text-primary);
            }

            .template-description {
                font-size: 0.9rem;
                color: var(--text-secondary);
                margin-bottom: 1rem;
            }

            .template-actions {
                display: flex;
                gap: 0.5rem;
            }

            .create-template-section {
                padding: 1.5rem;
                background: var(--glass);
                border-radius: 12px;
                border: 1px solid var(--glass-border);
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .side-panel,
                .tools-panel {
                    width: calc(100vw - 40px);
                    left: 20px;
                    right: 20px;
                }

                .floating-panel {
                    width: 150px;
                }

                .revenue-summary {
                    grid-template-columns: 1fr;
                }

                .templates-grid {
                    grid-template-columns: 1fr;
                }
            }

            /* Panel Controls */
            .minimize-panel,
            .close-panel {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                font-size: 1.2rem;
                padding: 0.25rem;
                border-radius: 4px;
                transition: all 0.3s ease;
            }

            .minimize-panel:hover,
            .close-panel:hover {
                background: var(--glass);
                color: var(--text-primary);
            }

            .close-modal {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                font-size: 1.5rem;
                padding: 0.5rem;
                border-radius: 50%;
                transition: all 0.3s ease;
            }

            .close-modal:hover {
                background: var(--glass);
                color: var(--text-primary);
                transform: rotate(90deg);
            }
        `;

        document.head.appendChild(style);
    }

    setupEnhancedEventListeners() {
        // Stream scheduling
        document.getElementById('schedule-stream-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.scheduleStream();
        });

        document.getElementById('close-schedule-modal')?.addEventListener('click', () => {
            this.closeModal('stream-schedule-modal');
        });

        // Template management
        document.getElementById('create-template-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTemplate();
        });

        document.getElementById('close-templates-modal')?.addEventListener('click', () => {
            this.closeModal('stream-templates-modal');
        });

        // Revenue dashboard
        document.getElementById('close-revenue-modal')?.addEventListener('click', () => {
            this.closeModal('revenue-dashboard-modal');
        });

        // Moderation panel
        document.getElementById('close-moderation-panel')?.addEventListener('click', () => {
            this.closePanel('moderation-panel');
        });

        document.getElementById('add-banned-word')?.addEventListener('click', () => {
            this.addBannedWord();
        });

        // Performance monitor
        document.getElementById('close-performance')?.addEventListener('click', () => {
            this.closePanel('performance-monitor');
        });

        document.getElementById('minimize-performance')?.addEventListener('click', () => {
            this.minimizePanel('performance-monitor');
        });

        // Discovery tools
        document.getElementById('close-discovery-tools')?.addEventListener('click', () => {
            this.closePanel('stream-discovery-tools');
        });

        document.getElementById('optimize-title')?.addEventListener('click', () => {
            this.optimizeTitle();
        });

        // Moderation controls
        this.setupModerationControls();
    }

    setupModerationControls() {
        const controlButtons = [
            'toggle-slow-mode',
            'toggle-followers-only', 
            'toggle-sub-only'
        ];

        controlButtons.forEach(id => {
            document.getElementById(id)?.addEventListener('click', (e) => {
                this.toggleModerationControl(e.target.closest('.mod-control-btn'));
            });
        });

        document.getElementById('clear-chat')?.addEventListener('click', () => {
            this.clearChat();
        });
    }

    scheduleStream() {
        const formData = {
            title: document.getElementById('schedule-title').value,
            date: document.getElementById('schedule-date').value,
            time: document.getElementById('schedule-time').value,
            duration: parseInt(document.getElementById('schedule-duration').value),
            description: document.getElementById('schedule-description').value,
            category: document.getElementById('schedule-category').value,
            notifications: document.getElementById('schedule-notifications').checked,
            reminder: document.getElementById('schedule-reminder').checked
        };

        // Add to scheduled streams
        this.scheduledStreams.push({
            id: 'scheduled_' + Date.now(),
            ...formData,
            createdAt: new Date()
        });

        // Show success message
        this.showToast('Stream scheduled successfully!', 'success');
        this.closeModal('stream-schedule-modal');

        // Clear form
        document.getElementById('schedule-stream-form').reset();
    }

    createTemplate() {
        const templateData = {
            id: 'template_' + Date.now(),
            name: document.getElementById('template-name').value,
            description: document.getElementById('template-description').value,
            createdAt: new Date()
        };

        this.streamTemplates.push(templateData);
        this.renderTemplates();

        // Clear form
        document.getElementById('create-template-form').reset();
        this.showToast('Template created!', 'success');
    }

    renderTemplates() {
        const grid = document.getElementById('templates-grid');
        if (!grid) return;

        grid.innerHTML = this.streamTemplates.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-title">${template.name}</div>
                <div class="template-description">${template.description}</div>
                <div class="template-actions">
                    <button class="btn btn-small btn-primary" onclick="enhancedStreamingFeatures.useTemplate('${template.id}')">Use</button>
                    <button class="btn btn-small btn-secondary" onclick="enhancedStreamingFeatures.deleteTemplate('${template.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    useTemplate(templateId) {
        const template = this.streamTemplates.find(t => t.id === templateId);
        if (!template) return;

        // Populate stream setup form with template data
        if (window.streamSessionDashboard) {
            window.streamSessionDashboard.showSetupModal();
            // Auto-fill form fields
            setTimeout(() => {
                document.getElementById('stream-title').value = template.name;
                document.getElementById('stream-description').value = template.description;
            }, 100);
        }
        
        this.closeModal('stream-templates-modal');
        this.showToast('Template loaded!', 'success');
    }

    deleteTemplate(templateId) {
        this.streamTemplates = this.streamTemplates.filter(t => t.id !== templateId);
        this.renderTemplates();
        this.showToast('Template deleted', 'info');
    }

    toggleModerationControl(button) {
        const isActive = button.dataset.active === 'true';
        const newState = !isActive;
        
        button.dataset.active = newState.toString();
        
        const statusElement = button.querySelector('.control-status');
        if (statusElement) {
            statusElement.textContent = newState ? 'On' : 'Off';
        }

        const controlId = button.id;
        switch (controlId) {
            case 'toggle-slow-mode':
                this.slowModeEnabled = newState;
                break;
            case 'toggle-followers-only':
                this.followersOnlyMode = newState;
                break;
            case 'toggle-sub-only':
                this.subOnlyMode = newState;
                break;
        }

        this.showToast(`${controlId.replace('toggle-', '').replace('-', ' ')} ${newState ? 'enabled' : 'disabled'}`, 'info');
    }

    addBannedWord() {
        const input = document.getElementById('new-banned-word');
        const word = input.value.trim().toLowerCase();
        
        if (!word) return;
        
        if (!this.moderationRules.includes(word)) {
            this.moderationRules.push(word);
            this.renderBannedWords();
            input.value = '';
            this.showToast(`"${word}" added to banned words`, 'success');
        }
    }

    renderBannedWords() {
        const container = document.getElementById('banned-words-list');
        if (!container) return;

        container.innerHTML = this.moderationRules.map(word => `
            <div class="banned-word">
                ${word}
                <span class="remove-banned-word" onclick="enhancedStreamingFeatures.removeBannedWord('${word}')">&times;</span>
            </div>
        `).join('');
    }

    removeBannedWord(word) {
        this.moderationRules = this.moderationRules.filter(w => w !== word);
        this.renderBannedWords();
        this.showToast(`"${word}" removed from banned words`, 'info');
    }

    clearChat() {
        const chatContainer = document.getElementById('live-chat-messages');
        if (chatContainer) {
            chatContainer.innerHTML = '';
            this.showToast('Chat cleared', 'info');
        }
    }

    optimizeTitle() {
        const input = document.getElementById('title-optimizer-input');
        const title = input.value.trim();
        
        if (!title) return;

        const suggestions = this.generateTitleSuggestions(title);
        const container = document.getElementById('title-suggestions');
        
        if (container) {
            container.innerHTML = suggestions.map(suggestion => `
                <div class="title-suggestion" onclick="enhancedStreamingFeatures.selectTitleSuggestion('${suggestion}')">
                    ${suggestion}
                </div>
            `).join('');
        }
    }

    generateTitleSuggestions(baseTitle) {
        const enhancements = [
            'LIVE',
            'NEW',
            'EPIC',
            'FIRST TIME',
            'CHALLENGE',
            'REACTION',
            'REVIEW',
            'TUTORIAL',
            'WALKTHROUGH',
            'SPEEDRUN'
        ];

        const suggestions = [
            `🔴 LIVE: ${baseTitle}`,
            `${baseTitle} - LIVE NOW!`,
            `NEW: ${baseTitle}`,
            `EPIC ${baseTitle} Stream!`,
            `${baseTitle} | First Time Playing`,
            `🎮 ${baseTitle} Challenge`,
            `${baseTitle} - Come Chat!`
        ];

        return suggestions.slice(0, 5);
    }

    selectTitleSuggestion(suggestion) {
        const input = document.getElementById('title-optimizer-input');
        if (input) {
            input.value = suggestion;
            this.showToast('Title suggestion applied!', 'success');
        }
    }

    loadTrendingContent() {
        const trendingTags = ['gaming', 'live', 'fun', 'chill', 'music', 'art', 'cooking', 'fitness'];
        const tagsContainer = document.getElementById('trending-tags');
        
        if (tagsContainer) {
            tagsContainer.innerHTML = trendingTags.map(tag => `
                <button class="trending-tag" onclick="enhancedStreamingFeatures.addTrendingTag('${tag}')">#${tag}</button>
            `).join('');
        }

        const categories = [
            { name: 'Gaming', icon: '🎮', popularity: 'High' },
            { name: 'Music', icon: '🎵', popularity: 'Medium' },
            { name: 'Art', icon: '🎨', popularity: 'Growing' },
            { name: 'Cooking', icon: '🍳', popularity: 'Trending' }
        ];

        const categoriesContainer = document.getElementById('recommended-categories');
        if (categoriesContainer) {
            categoriesContainer.innerHTML = categories.map(cat => `
                <div class="recommended-category" onclick="enhancedStreamingFeatures.selectCategory('${cat.name.toLowerCase()}')">
                    <span>${cat.icon}</span>
                    <div>
                        <div style="font-weight: 600;">${cat.name}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${cat.popularity}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    addTrendingTag(tag) {
        const tagsInput = document.getElementById('stream-tags');
        if (tagsInput) {
            const currentTags = tagsInput.value;
            const newValue = currentTags ? `${currentTags}, ${tag}` : tag;
            tagsInput.value = newValue;
            this.showToast(`#${tag} added to tags`, 'success');
        }
    }

    selectCategory(category) {
        const categorySelect = document.getElementById('stream-category');
        if (categorySelect) {
            categorySelect.value = category;
            this.showToast(`${category} category selected`, 'success');
        }
    }

    updatePerformanceMetrics() {
        // Simulate performance metrics
        const fps = Math.floor(Math.random() * 10) + 55; // 55-65 fps
        const bitrate = Math.floor(Math.random() * 1000) + 3500; // 3500-4500 kbps
        const dropped = Math.floor(Math.random() * 5); // 0-4 dropped frames
        const cpu = Math.floor(Math.random() * 30) + 30; // 30-60% CPU

        document.getElementById('fps-value').textContent = fps;
        document.getElementById('bitrate-value').textContent = `${bitrate} kbps`;
        document.getElementById('dropped-frames').textContent = dropped;
        document.getElementById('cpu-usage').textContent = `${cpu}%`;

        // Update connection quality
        const qualityIndicator = document.getElementById('connection-quality');
        const qualityDot = qualityIndicator.querySelector('.quality-dot');
        const qualityText = qualityIndicator.querySelector('.quality-text');

        let quality = 'stable';
        if (dropped > 2 || cpu > 80) quality = 'poor';
        else if (dropped > 1 || cpu > 60) quality = 'unstable';

        qualityDot.className = `quality-dot ${quality}`;
        qualityText.textContent = quality.charAt(0).toUpperCase() + quality.slice(1);
    }

    startPerformanceMonitoring() {
        this.performanceInterval = setInterval(() => {
            this.updatePerformanceMetrics();
        }, 2000);
    }

    stopPerformanceMonitoring() {
        if (this.performanceInterval) {
            clearInterval(this.performanceInterval);
            this.performanceInterval = null;
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showPanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.style.display = 'block';
        }
    }

    closePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.style.display = 'none';
        }
    }

    minimizePanel(panelId) {
        const panel = document.getElementById(panelId);
        const metrics = panel?.querySelector('.performance-metrics');
        
        if (metrics) {
            const isMinimized = metrics.style.display === 'none';
            metrics.style.display = isMinimized ? 'block' : 'none';
            
            const button = document.getElementById('minimize-performance');
            if (button) {
                button.textContent = isMinimized ? '−' : '+';
            }
        }
    }

    loadUserPreferences() {
        // Load user preferences from localStorage
        const prefs = localStorage.getItem('streaming-preferences');
        if (prefs) {
            try {
                const preferences = JSON.parse(prefs);
                this.moderationRules = preferences.moderationRules || [];
                this.streamTemplates = preferences.streamTemplates || [];
                
                // Load default templates if none exist
                if (this.streamTemplates.length === 0) {
                    this.createDefaultTemplates();
                }
                
                this.renderBannedWords();
                this.renderTemplates();
            } catch (error) {
                console.error('Error loading preferences:', error);
                this.createDefaultTemplates();
            }
        } else {
            this.createDefaultTemplates();
        }
        
        this.loadTrendingContent();
    }

    createDefaultTemplates() {
        const defaultTemplates = [
            {
                id: 'template_gaming',
                name: 'Gaming Stream',
                description: 'Perfect for gaming content with chat interaction',
                createdAt: new Date()
            },
            {
                id: 'template_music',
                name: 'Music Performance',
                description: 'Ideal for music streams and performances',
                createdAt: new Date()
            },
            {
                id: 'template_talk',
                name: 'Talk Show',
                description: 'Great for discussions and Q&A sessions',
                createdAt: new Date()
            }
        ];

        this.streamTemplates = defaultTemplates;
        this.renderTemplates();
    }

    saveUserPreferences() {
        const preferences = {
            moderationRules: this.moderationRules,
            streamTemplates: this.streamTemplates,
            revenueTracking: this.revenueTracking
        };
        
        localStorage.setItem('streaming-preferences', JSON.stringify(preferences));
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

    // Public methods to integrate with existing streaming system
    openScheduleModal() {
        this.showModal('stream-schedule-modal');
        
        // Set minimum date to today
        const dateInput = document.getElementById('schedule-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            dateInput.value = today;
        }
    }

    openTemplatesModal() {
        this.showModal('stream-templates-modal');
        this.renderTemplates();
    }

    openRevenueModal() {
        this.showModal('revenue-dashboard-modal');
        this.updateRevenueDashboard();
    }

    openModerationPanel() {
        this.showPanel('moderation-panel');
        this.loadViewerList();
    }

    openPerformanceMonitor() {
        this.showPanel('performance-monitor');
        this.startPerformanceMonitoring();
    }

    openDiscoveryTools() {
        this.showPanel('stream-discovery-tools');
        this.loadTrendingContent();
    }

    updateRevenueDashboard() {
        // Update revenue display with current data
        document.getElementById('total-earnings').textContent = `$${this.revenueTracking.totalEarnings.toFixed(2)}`;
        document.getElementById('session-earnings').textContent = `$${this.revenueTracking.sessionEarnings.toFixed(2)}`;
        document.getElementById('donations-count').textContent = this.revenueTracking.donations.length;
        document.getElementById('subscribers-count').textContent = this.revenueTracking.subscriptions.length;

        this.drawRevenueChart();
    }

    drawRevenueChart() {
        const canvas = document.getElementById('revenue-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw simple revenue chart
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 3;
        ctx.beginPath();

        // Sample revenue data
        const revenueData = [10, 25, 15, 45, 30, 60, 40, 75, 50, 85];
        const maxRevenue = Math.max(...revenueData);

        for (let i = 0; i < revenueData.length; i++) {
            const x = (i / (revenueData.length - 1)) * width;
            const y = height - (revenueData[i] / maxRevenue) * height;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.stroke();

        // Add fill
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = 'rgba(79, 70, 229, 0.1)';
        ctx.fill();
    }

    loadViewerList() {
        const viewerList = document.getElementById('moderation-viewer-list');
        if (!viewerList) return;

        // Simulate viewer list
        const viewers = [
            { name: 'StreamFan23', status: 'viewer' },
            { name: 'ChatMaster', status: 'moderator' },
            { name: 'ViewerOne', status: 'subscriber' },
            { name: 'LiveWatcher', status: 'viewer' }
        ];

        viewerList.innerHTML = viewers.map(viewer => `
            <div class="viewer-item">
                <span>${viewer.name}</span>
                <select onchange="enhancedStreamingFeatures.changeViewerStatus('${viewer.name}', this.value)">
                    <option value="viewer" ${viewer.status === 'viewer' ? 'selected' : ''}>Viewer</option>
                    <option value="moderator" ${viewer.status === 'moderator' ? 'selected' : ''}>Moderator</option>
                    <option value="banned" ${viewer.status === 'banned' ? 'selected' : ''}>Banned</option>
                </select>
            </div>
        `).join('');
    }

    changeViewerStatus(viewerName, newStatus) {
        this.showToast(`${viewerName} status changed to ${newStatus}`, 'info');
        
        if (newStatus === 'banned') {
            this.bannedUsers.push(viewerName);
        } else {
            this.bannedUsers = this.bannedUsers.filter(name => name !== viewerName);
        }
    }

    // Integration hooks for existing streaming system
    onStreamStart() {
        this.openPerformanceMonitor();
        this.revenueTracking.sessionEarnings = 0;
    }

    onStreamEnd() {
        this.stopPerformanceMonitoring();
        this.closePanel('performance-monitor');
        this.saveUserPreferences();
    }

    onDonationReceived(amount, donor, message) {
        this.revenueTracking.donations.push({
            amount,
            donor,
            message,
            timestamp: new Date()
        });
        
        this.revenueTracking.sessionEarnings += amount;
        this.revenueTracking.totalEarnings += amount;
        
        this.updateRevenueDashboard();
        this.showToast(`$${amount} donation from ${donor}!`, 'success');
    }
}

// Initialize enhanced streaming features
const enhancedStreamingFeatures = new EnhancedStreamingFeatures();

// Export for global access
window.enhancedStreamingFeatures = enhancedStreamingFeatures;

// Integration with existing streaming components
if (window.streamingManager) {
    // Add enhanced features to existing streaming UI
    window.streamingManager.showScheduleModal = () => enhancedStreamingFeatures.openScheduleModal();
    window.streamingManager.showTemplatesModal = () => enhancedStreamingFeatures.openTemplatesModal();
    window.streamingManager.showRevenueModal = () => enhancedStreamingFeatures.openRevenueModal();
}

if (window.streamSessionDashboard) {
    // Integrate with stream session dashboard
    const originalStartLiveStream = window.streamSessionDashboard.startLiveStream;
    window.streamSessionDashboard.startLiveStream = function() {
        enhancedStreamingFeatures.onStreamStart();
        return originalStartLiveStream.call(this);
    };

    const originalEndStream = window.streamSessionDashboard.endStream;
    window.streamSessionDashboard.endStream = function() {
        enhancedStreamingFeatures.onStreamEnd();
        return originalEndStream.call(this);
    };
}
