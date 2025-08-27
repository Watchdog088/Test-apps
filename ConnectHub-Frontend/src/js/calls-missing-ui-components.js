/**
 * ConnectHub - Missing Voice/Video Call UI Components
 * This file contains the 5 missing UI interfaces for the Voice/Video Calls section
 */

class CallsUIManager {
    constructor() {
        this.activeGroupCall = null;
        this.callHistory = [];
        this.callSettings = {
            videoQuality: 'HD',
            audioQuality: 'High',
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        };
        this.initializeMissingInterfaces();
    }

    initializeMissingInterfaces() {
        this.createEnhancedIncomingCallInterface();
        this.createDetailedCallControls();
        this.createCallHistoryDetails();
        this.createGroupCallManagement();
        this.createCallQualitySettings();
    }

    // ====================
    // 1. ENHANCED INCOMING CALL INTERFACE
    // ====================
    createEnhancedIncomingCallInterface() {
        const incomingCallHTML = `
            <div id="enhanced-incoming-call" class="enhanced-incoming-call hidden">
                <div class="incoming-call-backdrop"></div>
                <div class="incoming-call-container">
                    <div class="incoming-call-header">
                        <div class="incoming-call-type-badge">
                            <i class="fas fa-video" id="incoming-call-type-icon"></i>
                            <span id="incoming-call-type-text">Video Call</span>
                        </div>
                        <button class="minimize-incoming-btn" id="minimize-incoming-btn">
                            <i class="fas fa-minus"></i>
                        </button>
                    </div>
                    
                    <div class="incoming-caller-info">
                        <div class="caller-avatar-container">
                            <img src="" alt="" class="caller-avatar" id="incoming-caller-avatar">
                            <div class="calling-animation"></div>
                        </div>
                        <h2 class="caller-name" id="incoming-caller-name">John Doe</h2>
                        <p class="caller-subtitle" id="incoming-caller-subtitle">Incoming call...</p>
                        <div class="call-info-badges">
                            <span class="info-badge" id="caller-location">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>New York</span>
                            </span>
                            <span class="info-badge" id="caller-status">
                                <i class="fas fa-circle online"></i>
                                <span>Online</span>
                            </span>
                        </div>
                    </div>

                    <div class="incoming-call-preview" id="incoming-call-preview">
                        <video id="incoming-preview-video" autoplay muted class="preview-video"></video>
                        <div class="preview-overlay">
                            <p>Your video preview</p>
                        </div>
                    </div>

                    <div class="incoming-call-actions">
                        <div class="quick-actions">
                            <button class="quick-action-btn" id="quick-mute-btn" title="Join muted">
                                <i class="fas fa-microphone-slash"></i>
                            </button>
                            <button class="quick-action-btn" id="quick-video-off-btn" title="Join with video off">
                                <i class="fas fa-video-slash"></i>
                            </button>
                            <button class="quick-action-btn" id="quick-message-btn" title="Send message instead">
                                <i class="fas fa-comment"></i>
                            </button>
                        </div>
                        
                        <div class="main-actions">
                            <button class="call-action-btn decline-btn" id="enhanced-decline-btn">
                                <div class="btn-icon">
                                    <i class="fas fa-phone-slash"></i>
                                </div>
                                <span>Decline</span>
                            </button>
                            
                            <button class="call-action-btn accept-btn" id="enhanced-accept-btn">
                                <div class="btn-icon">
                                    <i class="fas fa-phone"></i>
                                </div>
                                <span>Accept</span>
                            </button>
                        </div>
                    </div>

                    <div class="incoming-call-footer">
                        <p class="caller-message" id="caller-message">
                            "Hey! Are you free to talk?"
                        </p>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', incomingCallHTML);
        this.bindEnhancedIncomingCallEvents();
    }

    bindEnhancedIncomingCallEvents() {
        document.getElementById('enhanced-accept-btn').onclick = () => this.acceptEnhancedCall();
        document.getElementById('enhanced-decline-btn').onclick = () => this.declineEnhancedCall();
        document.getElementById('minimize-incoming-btn').onclick = () => this.minimizeIncomingCall();
        document.getElementById('quick-message-btn').onclick = () => this.sendQuickMessage();
        document.getElementById('quick-mute-btn').onclick = () => this.toggleQuickMute();
        document.getElementById('quick-video-off-btn').onclick = () => this.toggleQuickVideo();
    }

    showEnhancedIncomingCall(callData) {
        const container = document.getElementById('enhanced-incoming-call');
        
        // Update caller information
        document.getElementById('incoming-caller-name').textContent = callData.caller.username;
        document.getElementById('incoming-caller-avatar').src = callData.caller.avatar || '/src/assets/default-avatar.png';
        document.getElementById('incoming-caller-subtitle').textContent = 
            callData.callType === 'video' ? 'Incoming video call...' : 'Incoming voice call...';
        
        // Update call type
        const typeIcon = document.getElementById('incoming-call-type-icon');
        const typeText = document.getElementById('incoming-call-type-text');
        if (callData.callType === 'video') {
            typeIcon.className = 'fas fa-video';
            typeText.textContent = 'Video Call';
            document.getElementById('incoming-call-preview').style.display = 'block';
        } else {
            typeIcon.className = 'fas fa-phone';
            typeText.textContent = 'Voice Call';
            document.getElementById('incoming-call-preview').style.display = 'none';
        }

        // Show caller message if available
        if (callData.message) {
            document.getElementById('caller-message').textContent = `"${callData.message}"`;
        }

        container.classList.remove('hidden');
    }

    acceptEnhancedCall() {
        document.getElementById('enhanced-incoming-call').classList.add('hidden');
        // Trigger existing accept call functionality
        if (window.callManager) {
            window.callManager.acceptCall();
        }
    }

    declineEnhancedCall() {
        document.getElementById('enhanced-incoming-call').classList.add('hidden');
        // Trigger existing decline call functionality
        if (window.callManager) {
            window.callManager.declineCall();
        }
    }

    minimizeIncomingCall() {
        const container = document.getElementById('enhanced-incoming-call');
        container.classList.add('minimized');
        
        // Create minimized floating widget
        const minimizedWidget = document.createElement('div');
        minimizedWidget.className = 'minimized-incoming-call';
        minimizedWidget.innerHTML = `
            <div class="minimized-caller-info">
                <img src="${document.getElementById('incoming-caller-avatar').src}" alt="" class="mini-avatar">
                <span class="mini-caller-name">${document.getElementById('incoming-caller-name').textContent}</span>
            </div>
            <div class="minimized-actions">
                <button class="mini-action-btn accept" onclick="callsUIManager.acceptEnhancedCall()">
                    <i class="fas fa-phone"></i>
                </button>
                <button class="mini-action-btn decline" onclick="callsUIManager.declineEnhancedCall()">
                    <i class="fas fa-phone-slash"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(minimizedWidget);
        container.classList.add('hidden');
    }

    // ====================
    // 2. DETAILED CALL CONTROLS DURING CALL
    // ====================
    createDetailedCallControls() {
        const detailedControlsHTML = `
            <div id="detailed-call-controls" class="detailed-call-controls hidden">
                <div class="controls-container">
                    <!-- Primary Controls Row -->
                    <div class="primary-controls">
                        <button class="control-btn microphone-btn" id="detailed-mute-btn">
                            <div class="btn-icon">
                                <i class="fas fa-microphone"></i>
                            </div>
                            <span class="btn-label">Mute</span>
                            <div class="volume-indicator">
                                <div class="volume-bars">
                                    <div class="volume-bar"></div>
                                    <div class="volume-bar"></div>
                                    <div class="volume-bar"></div>
                                    <div class="volume-bar"></div>
                                </div>
                            </div>
                        </button>

                        <button class="control-btn camera-btn" id="detailed-camera-btn">
                            <div class="btn-icon">
                                <i class="fas fa-video"></i>
                            </div>
                            <span class="btn-label">Camera</span>
                        </button>

                        <button class="control-btn screen-share-btn" id="screen-share-btn">
                            <div class="btn-icon">
                                <i class="fas fa-desktop"></i>
                            </div>
                            <span class="btn-label">Share</span>
                        </button>

                        <button class="control-btn record-btn" id="record-call-btn">
                            <div class="btn-icon">
                                <i class="fas fa-record-vinyl"></i>
                            </div>
                            <span class="btn-label">Record</span>
                            <div class="recording-indicator"></div>
                        </button>

                        <button class="control-btn end-call-btn" id="detailed-end-call-btn">
                            <div class="btn-icon">
                                <i class="fas fa-phone-slash"></i>
                            </div>
                            <span class="btn-label">End</span>
                        </button>
                    </div>

                    <!-- Secondary Controls Row -->
                    <div class="secondary-controls">
                        <button class="secondary-control-btn" id="add-person-btn">
                            <i class="fas fa-user-plus"></i>
                            <span>Add Person</span>
                        </button>

                        <button class="secondary-control-btn" id="chat-toggle-btn">
                            <i class="fas fa-comment"></i>
                            <span>Chat</span>
                            <div class="notification-badge" id="chat-badge">3</div>
                        </button>

                        <button class="secondary-control-btn" id="participants-btn">
                            <i class="fas fa-users"></i>
                            <span>Participants (2)</span>
                        </button>

                        <button class="secondary-control-btn" id="settings-btn">
                            <i class="fas fa-cog"></i>
                            <span>Settings</span>
                        </button>

                        <button class="secondary-control-btn" id="fullscreen-btn">
                            <i class="fas fa-expand"></i>
                            <span>Fullscreen</span>
                        </button>
                    </div>

                    <!-- Advanced Controls (Hidden by default) -->
                    <div class="advanced-controls hidden" id="advanced-controls">
                        <div class="control-group">
                            <label>Camera:</label>
                            <select id="camera-select" class="control-select">
                                <option value="default">Default Camera</option>
                            </select>
                            <button class="switch-camera-btn" id="switch-camera-detailed-btn">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>

                        <div class="control-group">
                            <label>Microphone:</label>
                            <select id="microphone-select" class="control-select">
                                <option value="default">Default Microphone</option>
                            </select>
                            <div class="microphone-test">
                                <button class="test-btn" id="mic-test-btn">Test</button>
                                <div class="audio-level-indicator">
                                    <div class="audio-level-bar"></div>
                                </div>
                            </div>
                        </div>

                        <div class="control-group">
                            <label>Speaker:</label>
                            <select id="speaker-select" class="control-select">
                                <option value="default">Default Speaker</option>
                            </select>
                            <button class="test-btn" id="speaker-test-btn">Test</button>
                        </div>
                    </div>

                    <!-- Control Toggle Button -->
                    <button class="controls-toggle-btn" id="controls-toggle-btn">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', detailedControlsHTML);
        this.bindDetailedControlsEvents();
        this.initializeDeviceSelectors();
    }

    bindDetailedControlsEvents() {
        document.getElementById('detailed-mute-btn').onclick = () => this.toggleDetailedMute();
        document.getElementById('detailed-camera-btn').onclick = () => this.toggleDetailedCamera();
        document.getElementById('screen-share-btn').onclick = () => this.toggleScreenShare();
        document.getElementById('record-call-btn').onclick = () => this.toggleCallRecording();
        document.getElementById('detailed-end-call-btn').onclick = () => this.endCallDetailed();
        document.getElementById('add-person-btn').onclick = () => this.showAddPersonDialog();
        document.getElementById('chat-toggle-btn').onclick = () => this.toggleInCallChat();
        document.getElementById('participants-btn').onclick = () => this.showParticipantsPanel();
        document.getElementById('settings-btn').onclick = () => this.showCallSettings();
        document.getElementById('fullscreen-btn').onclick = () => this.toggleFullscreen();
        document.getElementById('controls-toggle-btn').onclick = () => this.toggleAdvancedControls();
        document.getElementById('switch-camera-detailed-btn').onclick = () => this.switchCameraDetailed();
        document.getElementById('mic-test-btn').onclick = () => this.testMicrophone();
        document.getElementById('speaker-test-btn').onclick = () => this.testSpeaker();
    }

    showDetailedCallControls() {
        document.getElementById('detailed-call-controls').classList.remove('hidden');
        this.startVolumeMonitoring();
    }

    hideDetailedCallControls() {
        document.getElementById('detailed-call-controls').classList.add('hidden');
        this.stopVolumeMonitoring();
    }

    toggleScreenShare() {
        const btn = document.getElementById('screen-share-btn');
        const isSharing = btn.classList.contains('active');
        
        if (!isSharing) {
            this.startScreenShare();
            btn.classList.add('active');
            btn.querySelector('.btn-label').textContent = 'Stop Share';
        } else {
            this.stopScreenShare();
            btn.classList.remove('active');
            btn.querySelector('.btn-label').textContent = 'Share';
        }
    }

    toggleCallRecording() {
        const btn = document.getElementById('record-call-btn');
        const isRecording = btn.classList.contains('recording');
        
        if (!isRecording) {
            this.startCallRecording();
            btn.classList.add('recording');
            btn.querySelector('.btn-label').textContent = 'Stop';
            btn.querySelector('.recording-indicator').style.display = 'block';
        } else {
            this.stopCallRecording();
            btn.classList.remove('recording');
            btn.querySelector('.btn-label').textContent = 'Record';
            btn.querySelector('.recording-indicator').style.display = 'none';
        }
    }

    // ====================
    // 3. CALL HISTORY DETAILS
    // ====================
    createCallHistoryDetails() {
        const callHistoryHTML = `
            <div id="call-history-details" class="call-history-details hidden">
                <div class="history-container">
                    <div class="history-header">
                        <h2>Call History</h2>
                        <div class="history-actions">
                            <button class="history-action-btn" id="clear-history-btn">
                                <i class="fas fa-trash"></i>
                                Clear All
                            </button>
                            <button class="history-action-btn" id="export-history-btn">
                                <i class="fas fa-download"></i>
                                Export
                            </button>
                            <button class="history-close-btn" id="history-close-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <div class="history-filters">
                        <div class="filter-group">
                            <label>Filter by type:</label>
                            <select id="call-type-filter" class="history-filter">
                                <option value="all">All Calls</option>
                                <option value="video">Video Calls</option>
                                <option value="voice">Voice Calls</option>
                                <option value="missed">Missed Calls</option>
                                <option value="group">Group Calls</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label>Date range:</label>
                            <select id="date-range-filter" class="history-filter">
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>

                        <div class="search-group">
                            <input type="text" id="history-search" placeholder="Search contacts..." class="history-search">
                            <i class="fas fa-search search-icon"></i>
                        </div>
                    </div>

                    <div class="history-stats">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-phone"></i>
                            </div>
                            <div class="stat-info">
                                <span class="stat-number" id="total-calls">247</span>
                                <span class="stat-label">Total Calls</span>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="stat-info">
                                <span class="stat-number" id="total-duration">12h 34m</span>
                                <span class="stat-label">Total Duration</span>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-calendar"></i>
                            </div>
                            <div class="stat-info">
                                <span class="stat-number" id="avg-per-day">3.2</span>
                                <span class="stat-label">Avg. per Day</span>
                            </div>
                        </div>
                    </div>

                    <div class="history-list-container">
                        <div class="history-list" id="history-list">
                            <!-- Call history items will be populated here -->
                        </div>
                    </div>

                    <!-- Call Detail Modal -->
                    <div class="call-detail-modal hidden" id="call-detail-modal">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h3 id="modal-call-title">Call Details</h3>
                                <button class="modal-close-btn" id="modal-close-btn">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            
                            <div class="modal-body">
                                <div class="call-detail-info">
                                    <div class="detail-section">
                                        <h4>Call Information</h4>
                                        <div class="detail-item">
                                            <label>Participant:</label>
                                            <span id="detail-participant">John Doe</span>
                                        </div>
                                        <div class="detail-item">
                                            <label>Type:</label>
                                            <span id="detail-type">Video Call</span>
                                        </div>
                                        <div class="detail-item">
                                            <label>Status:</label>
                                            <span id="detail-status" class="status-badge">Completed</span>
                                        </div>
                                        <div class="detail-item">
                                            <label>Duration:</label>
                                            <span id="detail-duration">15:34</span>
                                        </div>
                                    </div>

                                    <div class="detail-section">
                                        <h4>Timing</h4>
                                        <div class="detail-item">
                                            <label>Started:</label>
                                            <span id="detail-start-time">2024-01-15 14:30:00</span>
                                        </div>
                                        <div class="detail-item">
                                            <label>Ended:</label>
                                            <span id="detail-end-time">2024-01-15 14:45:34</span>
                                        </div>
                                        <div class="detail-item">
                                            <label>Time zone:</label>
                                            <span id="detail-timezone">EST (UTC-5)</span>
                                        </div>
                                    </div>

                                    <div class="detail-section">
                                        <h4>Quality Metrics</h4>
                                        <div class="detail-item">
                                            <label>Connection Quality:</label>
                                            <div class="quality-indicator">
                                                <div class="quality-bars">
                                                    <div class="quality-bar active"></div>
                                                    <div class="quality-bar active"></div>
                                                    <div class="quality-bar active"></div>
                                                    <div class="quality-bar active"></div>
                                                    <div class="quality-bar"></div>
                                                </div>
                                                <span>Good (4/5)</span>
                                            </div>
                                        </div>
                                        <div class="detail-item">
                                            <label>Average Bitrate:</label>
                                            <span id="detail-bitrate">1.2 Mbps</span>
                                        </div>
                                        <div class="detail-item">
                                            <label>Packet Loss:</label>
                                            <span id="detail-packet-loss">0.2%</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="modal-actions">
                                    <button class="action-btn secondary" id="call-again-btn">
                                        <i class="fas fa-phone"></i>
                                        Call Again
                                    </button>
                                    <button class="action-btn secondary" id="delete-call-btn">
                                        <i class="fas fa-trash"></i>
                                        Delete
                                    </button>
                                    <button class="action-btn primary" id="export-call-btn">
                                        <i class="fas fa-download"></i>
                                        Export Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', callHistoryHTML);
        this.bindCallHistoryEvents();
        this.loadCallHistory();
    }

    bindCallHistoryEvents() {
        document.getElementById('history-close-btn').onclick = () => this.hideCallHistory();
        document.getElementById('clear-history-btn').onclick = () => this.clearCallHistory();
        document.getElementById('export-history-btn').onclick = () => this.exportCallHistory();
        document.getElementById('call-type-filter').onchange = () => this.filterCallHistory();
        document.getElementById('date-range-filter').onchange = () => this.filterCallHistory();
        document.getElementById('history-search').oninput = () => this.searchCallHistory();
        document.getElementById('modal-close-btn').onclick = () => this.hideCallDetailModal();
    }

    showCallHistory() {
        document.getElementById('call-history-details').classList.remove('hidden');
        this.refreshCallHistory();
    }

    hideCallHistory() {
        document.getElementById('call-history-details').classList.add('hidden');
    }

    loadCallHistory() {
        // Sample call history data
        const sampleHistory = [
            {
                id: '1',
                participant: { name: 'Alice Johnson', avatar: '/src/assets/default-avatar.png' },
                type: 'video',
                status: 'completed',
                duration: 934, // seconds
                startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 934 * 1000),
                quality: 4
            },
            {
                id: '2',
                participant: { name: 'Bob Smith', avatar: '/src/assets/default-avatar.png' },
                type: 'voice',
                status: 'missed',
                duration: 0,
                startTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                endTime: null,
                quality: 0
            },
            {
                id: '3',
                participant: { name: 'Group Call (5 members)', avatar: null },
                type: 'group',
                status: 'completed',
                duration: 2103, // seconds
                startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 2103 * 1000),
                quality: 5
            }
        ];

        this.callHistory = sampleHistory;
        this.renderCallHistory();
        this.updateHistoryStats();
    }

    renderCallHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';

        this.callHistory.forEach(call => {
            const historyItem = this.createHistoryItem(call);
            historyList.appendChild(historyItem);
        });
    }

    createHistoryItem(call) {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.onclick = () => this.showCallDetail(call);

        const statusClass = call.status === 'missed' ? 'missed' : 
                           call.status === 'completed' ? 'completed' : 'ongoing';

        const typeIcon = call.type === 'video' ? 'fa-video' : 
                        call.type === 'voice' ? 'fa-phone' : 'fa-users';

        const duration = call.duration > 0 ? this.formatDuration(call.duration) : 'Not answered';
        const timeAgo = this.getTimeAgo(call.startTime);

        item.innerHTML = `
            <div class="history-item-avatar">
                ${call.participant.avatar ? 
                    `<img src="${call.participant.avatar}" alt="${call.participant.name}">` :
                    `<div class="group-avatar"><i class="fas fa-users"></i></div>`
                }
                <div class="call-type-indicator ${call.type}">
                    <i class="fas ${typeIcon}"></i>
                </div>
            </div>
            
            <div class="history-item-info">
                <div class="history-item-header">
                    <h4 class="participant-name">${call.participant.name}</h4>
                    <span class="call-time">${timeAgo}</span>
                </div>
                
                <div class="history-item-details">
                    <span class="call-status ${statusClass}">${call.status}</span>
                    <span class="call-duration">${duration}</span>
                    ${call.quality > 0 ? `
                        <div class="call-quality-mini">
                            ${this.renderQualityBars(call.quality)}
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="history-item-actions">
                <button class="history-action-btn call-back-btn" onclick="event.stopPropagation(); callsUIManager.callBack('${call.id}')">
                    <i class="fas ${typeIcon}"></i>
                </button>
                <button class="history-action-btn more-btn" onclick="event.stopPropagation(); callsUIManager.showCallOptions('${call.id}')">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        `;

        return item;
    }

    // ====================
    // 4. GROUP CALL MANAGEMENT
    // ====================
    createGroupCallManagement() {
        const groupCallHTML = `
            <div id="group-call-management" class="group-call-management hidden">
                <div class="group-call-container">
                    <div class="group-call-header">
                        <h2>Group Call Management</h2>
                        <button class="group-call-close-btn" id="group-call-close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <!-- Group Call Creation -->
                    <div class="group-call-section">
                        <h3>Start Group Call</h3>
                        <div class="group-call-form">
                            <div class="form-group">
                                <label>Call Title:</label>
                                <input type="text" id="group-call-title" placeholder="Enter call title..." class="group-input">
                            </div>
                            
                            <div class="form-group">
                                <label>Call Type:</label>
                                <div class="call-type-selector">
                                    <button class="call-type-btn active" data-type="video" id="group-video-btn">
                                        <i class="fas fa-video"></i>
                                        Video Call
                                    </button>
                                    <button class="call-type-btn" data-type="voice" id="group-voice-btn">
                                        <i class="fas fa-phone"></i>
                                        Voice Call
                                    </button>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Add Participants:</label>
                                <div class="participant-selector">
                                    <input type="text" id="participant-search" placeholder="Search contacts..." class="participant-search">
                                    <div class="participant-suggestions" id="participant-suggestions">
                                        <!-- Suggestions will be populated here -->
                                    </div>
                                </div>
                                
                                <div class="selected-participants" id="selected-participants">
                                    <!-- Selected participants will be shown here -->
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Schedule:</label>
                                <div class="schedule-options">
                                    <button class="schedule-btn active" data-schedule="now" id="schedule-now-btn">
                                        Start Now
                                    </button>
                                    <button class="schedule-btn" data-schedule="later" id="schedule-later-btn">
                                        Schedule for Later
                                    </button>
                                </div>
                                
                                <div class="schedule-datetime hidden" id="schedule-datetime">
                                    <input type="datetime-local" id="scheduled-time" class="datetime-input">
                                </div>
                            </div>

                            <div class="form-actions">
                                <button class="group-action-btn secondary" id="save-group-btn">
                                    <i class="fas fa-save"></i>
                                    Save Group
                                </button>
                                <button class="group-action-btn primary" id="start-group-call-btn">
                                    <i class="fas fa-play"></i>
                                    Start Call
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Active Group Call Interface -->
                    <div class="active-group-call hidden" id="active-group-call">
                        <div class="group-call-info">
                            <h3 id="active-group-title">Team Meeting</h3>
                            <p id="active-group-participants">8 participants</p>
                        </div>

                        <div class="participants-grid" id="participants-grid">
                            <!-- Participant video tiles will be populated here -->
                        </div>

                        <div class="group-call-sidebar">
                            <div class="sidebar-tabs">
                                <button class="sidebar-tab active" data-tab="participants">
                                    <i class="fas fa-users"></i>
                                    Participants
                                </button>
                                <button class="sidebar-tab" data-tab="chat">
                                    <i class="fas fa-comment"></i>
                                    Chat
                                    <span class="chat-badge">5</span>
                                </button>
                                <button class="sidebar-tab" data-tab="settings">
                                    <i class="fas fa-cog"></i>
                                    Settings
                                </button>
                            </div>

                            <!-- Participants Tab -->
                            <div class="sidebar-content" data-content="participants">
                                <div class="participants-list" id="participants-list">
                                    <!-- Participant list items will be populated here -->
                                </div>
                                
                                <div class="participant-actions">
                                    <button class="participant-action-btn" id="add-more-participants-btn">
                                        <i class="fas fa-user-plus"></i>
                                        Add More People
                                    </button>
                                    <button class="participant-action-btn" id="share-link-btn">
                                        <i class="fas fa-link"></i>
                                        Share Join Link
                                    </button>
                                </div>
                            </div>

                            <!-- Chat Tab -->
                            <div class="sidebar-content hidden" data-content="chat">
                                <div class="group-chat-messages" id="group-chat-messages">
                                    <!-- Chat messages will be populated here -->
                                </div>
                                <div class="group-chat-input">
                                    <input type="text" id="group-chat-text" placeholder="Type a message..." class="chat-input">
                                    <button class="chat-send-btn" id="group-chat-send-btn">
                                        <i class="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>

                            <!-- Settings Tab -->
                            <div class="sidebar-content hidden" data-content="settings">
                                <div class="group-settings">
                                    <div class="setting-item">
                                        <label>Mute all participants</label>
                                        <button class="setting-toggle" id="mute-all-btn">
                                            <i class="fas fa-microphone-slash"></i>
                                        </button>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label>Lock meeting</label>
                                        <button class="setting-toggle" id="lock-meeting-btn">
                                            <i class="fas fa-lock"></i>
                                        </button>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label>Enable waiting room</label>
                                        <button class="setting-toggle active" id="waiting-room-btn">
                                            <i class="fas fa-clock"></i>
                                        </button>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label>Record call</label>
                                        <button class="setting-toggle" id="group-record-btn">
                                            <i class="fas fa-record-vinyl"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Waiting Room -->
                    <div class="waiting-room hidden" id="waiting-room">
                        <div class="waiting-room-content">
                            <h3>Waiting to join</h3>
                            <p id="waiting-room-message">The host will let you in soon...</p>
                            
                            <div class="waiting-room-preview">
                                <video id="waiting-room-video" autoplay muted class="preview-video"></video>
                                <div class="waiting-room-controls">
                                    <button class="waiting-control-btn" id="waiting-mute-btn">
                                        <i class="fas fa-microphone"></i>
                                    </button>
                                    <button class="waiting-control-btn" id="waiting-camera-btn">
                                        <i class="fas fa-video"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <button class="leave-waiting-btn" id="leave-waiting-btn">
                                Leave Waiting Room
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', groupCallHTML);
        this.bindGroupCallEvents();
    }

    bindGroupCallEvents() {
        document.getElementById('group-call-close-btn').onclick = () => this.hideGroupCallManagement();
        document.getElementById('group-video-btn').onclick = () => this.selectGroupCallType('video');
        document.getElementById('group-voice-btn').onclick = () => this.selectGroupCallType('voice');
        document.getElementById('schedule-now-btn').onclick = () => this.selectScheduleType('now');
        document.getElementById('schedule-later-btn').onclick = () => this.selectScheduleType('later');
        document.getElementById('start-group-call-btn').onclick = () => this.startGroupCall();
        document.getElementById('participant-search').oninput = () => this.searchParticipants();
        
        // Sidebar tabs
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.onclick = () => this.switchSidebarTab(tab.dataset.tab);
        });
    }

    showGroupCallManagement() {
        document.getElementById('group-call-management').classList.remove('hidden');
        this.loadContacts();
    }

    hideGroupCallManagement() {
        document.getElementById('group-call-management').classList.add('hidden');
    }

    // ====================
    // 5. CALL QUALITY SETTINGS
    // ====================
    createCallQualitySettings() {
        const qualitySettingsHTML = `
            <div id="call-quality-settings" class="call-quality-settings hidden">
                <div class="settings-container">
                    <div class="settings-header">
                        <h2>Call Quality Settings</h2>
                        <button class="settings-close-btn" id="settings-close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="settings-content">
                        <!-- Video Settings -->
                        <div class="settings-section">
                            <h3>
                                <i class="fas fa-video"></i>
                                Video Settings
                            </h3>
                            
                            <div class="setting-row">
                                <label>Video Quality:</label>
                                <select id="video-quality-select" class="quality-select">
                                    <option value="4K">4K (2160p) - Ultra HD</option>
                                    <option value="HD" selected>HD (720p) - High Definition</option>
                                    <option value="SD">SD (480p) - Standard Definition</option>
                                    <option value="LD">LD (240p) - Low Definition</option>
                                    <option value="auto">Auto (Adaptive)</option>
                                </select>
                                <div class="setting-info">
                                    <i class="fas fa-info-circle"></i>
                                    Higher quality uses more bandwidth
                                </div>
                            </div>

                            <div class="setting-row">
                                <label>Frame Rate:</label>
                                <select id="frame-rate-select" class="quality-select">
                                    <option value="60">60 FPS</option>
                                    <option value="30" selected>30 FPS</option>
                                    <option value="15">15 FPS</option>
                                </select>
                            </div>

                            <div class="setting-row">
                                <label>Bandwidth Limit:</label>
                                <div class="bandwidth-controls">
                                    <input type="range" id="bandwidth-slider" min="500" max="5000" value="2000" class="bandwidth-range">
                                    <span id="bandwidth-value">2000 kbps</span>
                                </div>
                            </div>

                            <div class="setting-row checkbox-row">
                                <input type="checkbox" id="hardware-acceleration" checked>
                                <label for="hardware-acceleration">Enable hardware acceleration</label>
                            </div>

                            <div class="setting-row checkbox-row">
                                <input type="checkbox" id="auto-adjust-quality" checked>
                                <label for="auto-adjust-quality">Auto-adjust quality based on connection</label>
                            </div>
                        </div>

                        <!-- Audio Settings -->
                        <div class="settings-section">
                            <h3>
                                <i class="fas fa-microphone"></i>
                                Audio Settings
                            </h3>
                            
                            <div class="setting-row">
                                <label>Audio Quality:</label>
                                <select id="audio-quality-select" class="quality-select">
                                    <option value="High" selected>High (48kHz)</option>
                                    <option value="Medium">Medium (24kHz)</option>
                                    <option value="Low">Low (16kHz)</option>
                                </select>
                            </div>

                            <div class="setting-row">
                                <label>Audio Codec:</label>
                                <select id="audio-codec-select" class="quality-select">
                                    <option value="opus" selected>Opus (Recommended)</option>
                                    <option value="aac">AAC</option>
                                    <option value="g722">G.722</option>
                                </select>
                            </div>

                            <div class="setting-row checkbox-row">
                                <input type="checkbox" id="echo-cancellation" checked>
                                <label for="echo-cancellation">Echo cancellation</label>
                            </div>

                            <div class="setting-row checkbox-row">
                                <input type="checkbox" id="noise-suppression" checked>
                                <label for="noise-suppression">Noise suppression</label>
                            </div>

                            <div class="setting-row checkbox-row">
                                <input type="checkbox" id="auto-gain-control" checked>
                                <label for="auto-gain-control">Automatic gain control</label>
                            </div>

                            <div class="setting-row">
                                <label>Microphone Sensitivity:</label>
                                <div class="sensitivity-controls">
                                    <input type="range" id="mic-sensitivity" min="0" max="100" value="70" class="sensitivity-range">
                                    <div class="mic-level-indicator">
                                        <div class="mic-level-bar"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Network Settings -->
                        <div class="settings-section">
                            <h3>
                                <i class="fas fa-network-wired"></i>
                                Network & Performance
                            </h3>
                            
                            <div class="setting-row">
                                <label>Connection Priority:</label>
                                <select id="connection-priority" class="quality-select">
                                    <option value="balanced" selected>Balanced</option>
                                    <option value="quality">Prefer Quality</option>
                                    <option value="stability">Prefer Stability</option>
                                    <option value="low-latency">Low Latency</option>
                                </select>
                            </div>

                            <div class="setting-row checkbox-row">
                                <input type="checkbox" id="adaptive-bitrate" checked>
                                <label for="adaptive-bitrate">Adaptive bitrate control</label>
                            </div>

                            <div class="setting-row checkbox-row">
                                <input type="checkbox" id="packet-loss-protection">
                                <label for="packet-loss-protection">Packet loss protection</label>
                            </div>

                            <div class="network-stats">
                                <h4>Current Network Status</h4>
                                <div class="network-stat-item">
                                    <span>Connection Type:</span>
                                    <span id="connection-type">WiFi</span>
                                </div>
                                <div class="network-stat-item">
                                    <span>Bandwidth:</span>
                                    <span id="available-bandwidth">15.2 Mbps</span>
                                </div>
                                <div class="network-stat-item">
                                    <span>Latency:</span>
                                    <span id="network-latency">45ms</span>
                                </div>
                                <div class="network-stat-item">
                                    <span>Packet Loss:</span>
                                    <span id="packet-loss">0.1%</span>
                                </div>
                            </div>
                        </div>

                        <!-- Device Settings -->
                        <div class="settings-section">
                            <h3>
                                <i class="fas fa-cog"></i>
                                Device Configuration
                            </h3>
                            
                            <div class="device-group">
                                <label>Camera:</label>
                                <select id="camera-device-select" class="device-select">
                                    <option value="default">Default Camera</option>
                                </select>
                                <div class="device-actions">
                                    <button class="device-test-btn" id="test-camera-btn">
                                        <i class="fas fa-play"></i>
                                        Test
                                    </button>
                                    <button class="device-settings-btn" id="camera-settings-btn">
                                        <i class="fas fa-cog"></i>
                                    </button>
                                </div>
                                <div class="camera-preview" id="camera-preview">
                                    <video id="camera-test-video" autoplay muted class="test-video"></video>
                                </div>
                            </div>

                            <div class="device-group">
                                <label>Microphone:</label>
                                <select id="microphone-device-select" class="device-select">
                                    <option value="default">Default Microphone</option>
                                </select>
                                <div class="device-actions">
                                    <button class="device-test-btn" id="test-microphone-btn">
                                        <i class="fas fa-play"></i>
                                        Test
                                    </button>
                                    <button class="device-settings-btn" id="microphone-settings-btn">
                                        <i class="fas fa-cog"></i>
                                    </button>
                                </div>
                                <div class="audio-test-controls">
                                    <div class="audio-level-display">
                                        <div class="audio-level-bars">
                                            <div class="audio-bar"></div>
                                            <div class="audio-bar"></div>
                                            <div class="audio-bar"></div>
                                            <div class="audio-bar"></div>
                                            <div class="audio-bar"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="device-group">
                                <label>Speaker:</label>
                                <select id="speaker-device-select" class="device-select">
                                    <option value="default">Default Speaker</option>
                                </select>
                                <div class="device-actions">
                                    <button class="device-test-btn" id="test-speaker-btn">
                                        <i class="fas fa-play"></i>
                                        Test
                                    </button>
                                    <button class="device-settings-btn" id="speaker-settings-btn">
                                        <i class="fas fa-cog"></i>
                                    </button>
                                </div>
                                <div class="volume-controls">
                                    <i class="fas fa-volume-down"></i>
                                    <input type="range" id="speaker-volume" min="0" max="100" value="75" class="volume-slider">
                                    <i class="fas fa-volume-up"></i>
                                    <span id="volume-percentage">75%</span>
                                </div>
                            </div>
                        </div>

                        <!-- Advanced Settings -->
                        <div class="settings-section">
                            <h3>
                                <i class="fas fa-tools"></i>
                                Advanced Settings
                            </h3>
                            
                            <div class="setting-row checkbox-row">
                                <input type="checkbox" id="enable-simulcast">
                                <label for="enable-simulcast">Enable simulcast (multiple quality streams)</label>
                            </div>

                            <div class="setting-row checkbox-row">
                                <input type="checkbox" id="enable-dtx" checked>
                                <label for="enable-dtx">Discontinuous transmission (DTX)</label>
                            </div>

                            <div class="setting-row">
                                <label>DSCP Marking:</label>
                                <select id="dscp-marking" class="quality-select">
                                    <option value="disabled">Disabled</option>
                                    <option value="af41" selected>AF41 (Voice)</option>
                                    <option value="ef">EF (Premium)</option>
                                </select>
                            </div>

                            <div class="setting-row">
                                <label>Jitter Buffer:</label>
                                <select id="jitter-buffer" class="quality-select">
                                    <option value="adaptive" selected>Adaptive</option>
                                    <option value="fixed">Fixed</option>
                                    <option value="disabled">Disabled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="settings-actions">
                        <button class="settings-action-btn secondary" id="reset-settings-btn">
                            <i class="fas fa-undo"></i>
                            Reset to Default
                        </button>
                        <button class="settings-action-btn secondary" id="test-settings-btn">
                            <i class="fas fa-flask"></i>
                            Test Settings
                        </button>
                        <button class="settings-action-btn primary" id="save-settings-btn">
                            <i class="fas fa-save"></i>
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', qualitySettingsHTML);
        this.bindQualitySettingsEvents();
        this.initializeDeviceOptions();
        this.loadSavedSettings();
    }

    bindQualitySettingsEvents() {
        document.getElementById('settings-close-btn').onclick = () => this.hideQualitySettings();
        document.getElementById('save-settings-btn').onclick = () => this.saveQualitySettings();
        document.getElementById('reset-settings-btn').onclick = () => this.resetQualitySettings();
        document.getElementById('test-settings-btn').onclick = () => this.testQualitySettings();
        
        // Bandwidth slider
        document.getElementById('bandwidth-slider').oninput = (e) => {
            document.getElementById('bandwidth-value').textContent = `${e.target.value} kbps`;
        };
        
        // Volume slider
        document.getElementById('speaker-volume').oninput = (e) => {
            document.getElementById('volume-percentage').textContent = `${e.target.value}%`;
        };

        // Device test buttons
        document.getElementById('test-camera-btn').onclick = () => this.testCamera();
        document.getElementById('test-microphone-btn').onclick = () => this.testMicrophone();
        document.getElementById('test-speaker-btn').onclick = () => this.testSpeaker();
    }

    showQualitySettings() {
        document.getElementById('call-quality-settings').classList.remove('hidden');
        this.updateNetworkStats();
    }

    hideQualitySettings() {
        document.getElementById('call-quality-settings').classList.add('hidden');
    }

    // ====================
    // UTILITY METHODS
    // ====================
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    renderQualityBars(quality) {
        let bars = '';
        for (let i = 1; i <= 5; i++) {
            bars += `<div class="quality-bar ${i <= quality ? 'active' : ''}"></div>`;
        }
        return `<div class="quality-bars">${bars}</div>`;
    }

    // Placeholder methods for functionality
    acceptEnhancedCall() { console.log('Enhanced call accepted'); }
    declineEnhancedCall() { console.log('Enhanced call declined'); }
    minimizeIncomingCall() { console.log('Incoming call minimized'); }
    sendQuickMessage() { console.log('Quick message sent'); }
    toggleQuickMute() { console.log('Quick mute toggled'); }
    toggleQuickVideo() { console.log('Quick video toggled'); }
    
    toggleDetailedMute() { console.log('Detailed mute toggled'); }
    toggleDetailedCamera() { console.log('Detailed camera toggled'); }
    toggleScreenShare() { console.log('Screen share toggled'); }
    toggleCallRecording() { console.log('Call recording toggled'); }
    endCallDetailed() { console.log('Call ended'); }
    showAddPersonDialog() { console.log('Add person dialog shown'); }
    toggleInCallChat() { console.log('In-call chat toggled'); }
    showParticipantsPanel() { console.log('Participants panel shown'); }
    showCallSettings() { console.log('Call settings shown'); }
    toggleFullscreen() { console.log('Fullscreen toggled'); }
    toggleAdvancedControls() { console.log('Advanced controls toggled'); }
    switchCameraDetailed() { console.log('Camera switched'); }
    testMicrophone() { console.log('Microphone tested'); }
    testSpeaker() { console.log('Speaker tested'); }
    testCamera() { console.log('Camera tested'); }
    
    clearCallHistory() { console.log('Call history cleared'); }
    exportCallHistory() { console.log('Call history exported'); }
    filterCallHistory() { console.log('Call history filtered'); }
    searchCallHistory() { console.log('Call history searched'); }
    hideCallDetailModal() { console.log('Call detail modal hidden'); }
    refreshCallHistory() { console.log('Call history refreshed'); }
    updateHistoryStats() { console.log('History stats updated'); }
    showCallDetail(call) { console.log('Call detail shown:', call); }
    callBack(callId) { console.log('Calling back:', callId); }
    showCallOptions(callId) { console.log('Call options shown:', callId); }
    
    selectGroupCallType(type) { console.log('Group call type selected:', type); }
    selectScheduleType(type) { console.log('Schedule type selected:', type); }
    startGroupCall() { console.log('Group call started'); }
    searchParticipants() { console.log('Participants searched'); }
    switchSidebarTab(tab) { console.log('Sidebar tab switched:', tab); }
    loadContacts() { console.log('Contacts loaded'); }
    
    saveQualitySettings() { console.log('Quality settings saved'); }
    resetQualitySettings() { console.log('Quality settings reset'); }
    testQualitySettings() { console.log('Quality settings tested'); }
    initializeDeviceOptions() { console.log('Device options initialized'); }
    initializeDeviceSelectors() { console.log('Device selectors initialized'); }
    loadSavedSettings() { console.log('Saved settings loaded'); }
    updateNetworkStats() { console.log('Network stats updated'); }
    startVolumeMonitoring() { console.log('Volume monitoring started'); }
    stopVolumeMonitoring() { console.log('Volume monitoring stopped'); }
    startScreenShare() { console.log('Screen share started'); }
    stopScreenShare() { console.log('Screen share stopped'); }
    startCallRecording() { console.log('Call recording started'); }
    stopCallRecording() { console.log('Call recording stopped'); }
}

// Initialize the Calls UI Manager
document.addEventListener('DOMContentLoaded', () => {
    window.callsUIManager = new CallsUIManager();
});

// Export for use in other modules
export { CallsUIManager };
