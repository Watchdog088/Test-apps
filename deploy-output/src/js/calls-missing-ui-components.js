/**
 * ConnectHub - Enhanced Voice/Video Call UI Components
 * This file contains the 3 missing UI interfaces for the Voice/Video Calls section
 * Developed in detail with comprehensive functionality and modern design
 */

class CallsUIManager {
    constructor() {
        this.activeCall = null;
        this.activeGroupCall = null;
        this.incomingCall = null;
        this.callHistory = [];
        this.participants = [];
        this.mediaDevices = {
            cameras: [],
            microphones: [],
            speakers: []
        };
        this.callSettings = {
            videoQuality: 'HD',
            audioQuality: 'High',
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            cameraEnabled: true,
            microphoneEnabled: true
        };
        this.screenShareStream = null;
        this.isRecording = false;
        this.callStartTime = null;
        this.callTimer = null;
        this.volumeMonitoringInterval = null;
        
        this.initializeMissingInterfaces();
        this.initializeMediaDevices();
        this.bindGlobalEvents();
    }

    initializeMissingInterfaces() {
        this.createEnhancedIncomingCallInterface();
        this.createDetailedCallControls();
        this.createGroupCallManagement();
        this.addCallsToCSS();
    }

    initializeMediaDevices() {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices()
                .then(devices => {
                    this.mediaDevices.cameras = devices.filter(device => device.kind === 'videoinput');
                    this.mediaDevices.microphones = devices.filter(device => device.kind === 'audioinput');
                    this.mediaDevices.speakers = devices.filter(device => device.kind === 'audiooutput');
                })
                .catch(err => console.warn('Could not enumerate devices:', err));
        }
    }

    bindGlobalEvents() {
        // Global keyboard shortcuts for call controls
        document.addEventListener('keydown', (e) => {
            if (this.activeCall) {
                switch(e.code) {
                    case 'KeyM':
                        if (e.ctrlKey) {
                            e.preventDefault();
                            this.toggleDetailedMute();
                        }
                        break;
                    case 'KeyV':
                        if (e.ctrlKey) {
                            e.preventDefault();
                            this.toggleDetailedCamera();
                        }
                        break;
                    case 'KeyS':
                        if (e.ctrlKey && e.shiftKey) {
                            e.preventDefault();
                            this.toggleScreenShare();
                        }
                        break;
                    case 'Escape':
                        if (this.incomingCall) {
                            this.declineEnhancedCall();
                        }
                        break;
                }
            }
        });

        // Visibility change handling
        document.addEventListener('visibilitychange', () => {
            if (this.activeCall && document.hidden) {
                this.handleCallBackgrounding();
            }
        });

        // Window resize handling for responsive call interfaces
        window.addEventListener('resize', () => {
            if (this.activeGroupCall) {
                this.adjustParticipantGrid();
            }
        });
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

    // ====================
    // ENHANCED INCOMING CALL FUNCTIONALITY
    // ====================
    acceptEnhancedCall() {
        const container = document.getElementById('enhanced-incoming-call');
        this.incomingCall = null;
        container.classList.add('hidden');
        
        // Remove any minimized widget
        const miniWidget = document.querySelector('.minimized-incoming-call');
        if (miniWidget) miniWidget.remove();
        
        // Start the call with settings
        this.activeCall = {
            id: Date.now().toString(),
            type: 'video',
            startTime: new Date(),
            muted: this.callSettings.microphoneEnabled ? false : true,
            videoEnabled: this.callSettings.cameraEnabled
        };
        
        this.showDetailedCallControls();
        this.startCallTimer();
        this.showToast('Call connected successfully', 'success');
    }

    declineEnhancedCall() {
        const container = document.getElementById('enhanced-incoming-call');
        this.incomingCall = null;
        container.classList.add('hidden');
        
        // Remove any minimized widget
        const miniWidget = document.querySelector('.minimized-incoming-call');
        if (miniWidget) miniWidget.remove();
        
        this.showToast('Call declined', 'info');
    }

    sendQuickMessage() {
        const callerName = document.getElementById('incoming-caller-name').textContent;
        this.showQuickMessageDialog(callerName);
    }

    showQuickMessageDialog(callerName) {
        const dialog = document.createElement('div');
        dialog.className = 'quick-message-dialog';
        dialog.innerHTML = `
            <div class="quick-message-content">
                <h3>Send quick message to ${callerName}</h3>
                <div class="quick-message-options">
                    <button class="quick-msg-btn" onclick="callsUIManager.sendPredefinedMessage('busy')">I'm busy right now</button>
                    <button class="quick-msg-btn" onclick="callsUIManager.sendPredefinedMessage('callback')">I'll call you back</button>
                    <button class="quick-msg-btn" onclick="callsUIManager.sendPredefinedMessage('meeting')">In a meeting</button>
                    <div class="custom-message">
                        <input type="text" placeholder="Type custom message..." id="custom-quick-message">
                        <button class="send-custom-btn" onclick="callsUIManager.sendCustomMessage()">Send</button>
                    </div>
                </div>
                <button class="close-dialog-btn" onclick="callsUIManager.closeQuickMessageDialog()">×</button>
            </div>
        `;
        document.body.appendChild(dialog);
    }

    sendPredefinedMessage(type) {
        const messages = {
            busy: "I'm busy right now, I'll call you back later!",
            callback: "Can't answer now, I'll call you back soon!",
            meeting: "I'm in a meeting, I'll get back to you!"
        };
        this.showToast(`Message sent: "${messages[type]}"`, 'success');
        this.closeQuickMessageDialog();
        this.declineEnhancedCall();
    }

    sendCustomMessage() {
        const message = document.getElementById('custom-quick-message').value;
        if (message.trim()) {
            this.showToast(`Message sent: "${message}"`, 'success');
            this.closeQuickMessageDialog();
            this.declineEnhancedCall();
        }
    }

    closeQuickMessageDialog() {
        const dialog = document.querySelector('.quick-message-dialog');
        if (dialog) dialog.remove();
    }

    toggleQuickMute() {
        this.callSettings.microphoneEnabled = !this.callSettings.microphoneEnabled;
        const btn = document.getElementById('quick-mute-btn');
        btn.classList.toggle('active');
        btn.title = this.callSettings.microphoneEnabled ? 'Join muted' : 'Join unmuted';
    }

    toggleQuickVideo() {
        this.callSettings.cameraEnabled = !this.callSettings.cameraEnabled;
        const btn = document.getElementById('quick-video-off-btn');
        btn.classList.toggle('active');
        btn.title = this.callSettings.cameraEnabled ? 'Join with video off' : 'Join with video on';
    }

    // ====================
    // DETAILED CALL CONTROLS FUNCTIONALITY
    // ====================
    toggleDetailedMute() {
        if (!this.activeCall) return;
        
        this.activeCall.muted = !this.activeCall.muted;
        const btn = document.getElementById('detailed-mute-btn');
        const icon = btn.querySelector('i');
        const label = btn.querySelector('.btn-label');
        
        if (this.activeCall.muted) {
            btn.classList.add('muted');
            icon.className = 'fas fa-microphone-slash';
            label.textContent = 'Unmute';
        } else {
            btn.classList.remove('muted');
            icon.className = 'fas fa-microphone';
            label.textContent = 'Mute';
        }
        
        this.showToast(this.activeCall.muted ? 'Microphone muted' : 'Microphone unmuted', 'info');
    }

    toggleDetailedCamera() {
        if (!this.activeCall) return;
        
        this.activeCall.videoEnabled = !this.activeCall.videoEnabled;
        const btn = document.getElementById('detailed-camera-btn');
        const icon = btn.querySelector('i');
        const label = btn.querySelector('.btn-label');
        
        if (this.activeCall.videoEnabled) {
            btn.classList.remove('disabled');
            icon.className = 'fas fa-video';
            label.textContent = 'Camera';
        } else {
            btn.classList.add('disabled');
            icon.className = 'fas fa-video-slash';
            label.textContent = 'Enable Camera';
        }
        
        this.showToast(this.activeCall.videoEnabled ? 'Camera enabled' : 'Camera disabled', 'info');
    }

    async startScreenShare() {
        try {
            this.screenShareStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });
            
            this.screenShareStream.getVideoTracks()[0].onended = () => {
                this.stopScreenShare();
            };
            
            this.showToast('Screen sharing started', 'success');
        } catch (err) {
            console.error('Error starting screen share:', err);
            this.showToast('Failed to start screen sharing', 'error');
        }
    }

    stopScreenShare() {
        if (this.screenShareStream) {
            this.screenShareStream.getTracks().forEach(track => track.stop());
            this.screenShareStream = null;
        }
        
        const btn = document.getElementById('screen-share-btn');
        btn.classList.remove('active');
        btn.querySelector('.btn-label').textContent = 'Share';
        
        this.showToast('Screen sharing stopped', 'info');
    }

    startCallRecording() {
        this.isRecording = true;
        this.showToast('Call recording started', 'success');
        
        // Start recording timer
        this.recordingStartTime = Date.now();
        this.updateRecordingIndicator();
    }

    stopCallRecording() {
        this.isRecording = false;
        const duration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
        this.showToast(`Recording saved (${this.formatDuration(duration)})`, 'success');
    }

    updateRecordingIndicator() {
        if (!this.isRecording) return;
        
        const indicator = document.querySelector('.recording-indicator');
        if (indicator) {
            indicator.style.opacity = indicator.style.opacity === '0' ? '1' : '0';
            setTimeout(() => this.updateRecordingIndicator(), 500);
        }
    }

    endCallDetailed() {
        if (this.activeCall) {
            const duration = Math.floor((Date.now() - this.activeCall.startTime) / 1000);
            this.addToCallHistory({
                participant: { name: 'Active Caller' },
                type: this.activeCall.type,
                duration: duration,
                status: 'completed',
                endTime: new Date()
            });
        }
        
        this.activeCall = null;
        this.hideDetailedCallControls();
        this.stopCallTimer();
        
        if (this.screenShareStream) {
            this.stopScreenShare();
        }
        
        if (this.isRecording) {
            this.stopCallRecording();
        }
        
        this.showToast('Call ended', 'info');
    }

    showAddPersonDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'add-person-dialog modal active';
        dialog.innerHTML = `
            <div class="modal-content">
                <h3>Add Person to Call</h3>
                <div class="contact-search">
                    <input type="text" placeholder="Search contacts..." id="add-person-search">
                    <div class="contact-list" id="contact-list-add">
                        <!-- Contacts will be populated here -->
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="callsUIManager.closeAddPersonDialog()">Cancel</button>
                    <button class="btn btn-primary" onclick="callsUIManager.addSelectedPersons()">Add to Call</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        this.loadContactsForAdd();
    }

    closeAddPersonDialog() {
        const dialog = document.querySelector('.add-person-dialog');
        if (dialog) dialog.remove();
    }

    addSelectedPersons() {
        // Logic to add selected persons to the call
        this.showToast('Participants added to call', 'success');
        this.closeAddPersonDialog();
    }

    toggleInCallChat() {
        const chatPanel = document.getElementById('in-call-chat-panel');
        if (chatPanel) {
            chatPanel.classList.toggle('hidden');
        } else {
            this.createInCallChatPanel();
        }
    }

    createInCallChatPanel() {
        const chatPanel = document.createElement('div');
        chatPanel.id = 'in-call-chat-panel';
        chatPanel.className = 'in-call-chat-panel';
        chatPanel.innerHTML = `
            <div class="chat-header">
                <h4>Call Chat</h4>
                <button onclick="callsUIManager.toggleInCallChat()">×</button>
            </div>
            <div class="chat-messages-container">
                <div class="chat-message">
                    <strong>You:</strong> Great to connect!
                </div>
            </div>
            <div class="chat-input-container">
                <input type="text" placeholder="Type a message..." id="in-call-chat-input">
                <button onclick="callsUIManager.sendInCallMessage()">Send</button>
            </div>
        `;
        document.body.appendChild(chatPanel);
    }

    sendInCallMessage() {
        const input = document.getElementById('in-call-chat-input');
        const message = input.value.trim();
        if (message) {
            const messagesContainer = document.querySelector('.chat-messages-container');
            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message';
            messageElement.innerHTML = `<strong>You:</strong> ${message}`;
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            input.value = '';
        }
    }

    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            this.showToast('Exited fullscreen', 'info');
        } else {
            document.documentElement.requestFullscreen();
            this.showToast('Entered fullscreen', 'info');
        }
    }

    toggleAdvancedControls() {
        const controls = document.getElementById('advanced-controls');
        const btn = document.getElementById('controls-toggle-btn');
        const icon = btn.querySelector('i');
        
        controls.classList.toggle('hidden');
        icon.className = controls.classList.contains('hidden') ? 
            'fas fa-chevron-up' : 'fas fa-chevron-down';
    }

    // ====================
    // GROUP CALL FUNCTIONALITY
    // ====================
    selectGroupCallType(type) {
        document.querySelectorAll('.call-type-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`group-${type}-btn`).classList.add('active');
    }

    selectScheduleType(type) {
        document.querySelectorAll('.schedule-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`schedule-${type}-btn`).classList.add('active');
        
        const datetimeContainer = document.getElementById('schedule-datetime');
        if (type === 'later') {
            datetimeContainer.classList.remove('hidden');
        } else {
            datetimeContainer.classList.add('hidden');
        }
    }

    startGroupCall() {
        const title = document.getElementById('group-call-title').value || 'Group Call';
        const selectedParticipants = this.getSelectedParticipants();
        
        if (selectedParticipants.length === 0) {
            this.showToast('Please select at least one participant', 'warning');
            return;
        }

        this.activeGroupCall = {
            id: Date.now().toString(),
            title: title,
            participants: selectedParticipants,
            startTime: new Date(),
            isHost: true
        };

        this.showActiveGroupCall();
        this.showToast(`Group call "${title}" started with ${selectedParticipants.length} participants`, 'success');
    }

    showActiveGroupCall() {
        document.querySelector('.group-call-section').classList.add('hidden');
        document.getElementById('active-group-call').classList.remove('hidden');
        
        document.getElementById('active-group-title').textContent = this.activeGroupCall.title;
        document.getElementById('active-group-participants').textContent = 
            `${this.activeGroupCall.participants.length} participants`;
        
        this.renderParticipantGrid();
        this.renderParticipantsList();
    }

    renderParticipantGrid() {
        const grid = document.getElementById('participants-grid');
        grid.innerHTML = '';
        
        this.activeGroupCall.participants.forEach((participant, index) => {
            const tile = document.createElement('div');
            tile.className = 'participant-tile';
            tile.innerHTML = `
                <video class="participant-video" autoplay muted></video>
                <div class="participant-overlay">
                    <div class="participant-name">${participant.name}</div>
                    <div class="participant-status">
                        <i class="fas fa-microphone${participant.muted ? '-slash' : ''}"></i>
                        ${!participant.videoEnabled ? '<i class="fas fa-video-slash"></i>' : ''}
                    </div>
                </div>
                <div class="participant-controls">
                    <button onclick="callsUIManager.toggleParticipantMute('${participant.id}')" 
                            title="Mute/Unmute">
                        <i class="fas fa-microphone${participant.muted ? '-slash' : ''}"></i>
                    </button>
                    ${this.activeGroupCall.isHost ? `
                        <button onclick="callsUIManager.removeParticipant('${participant.id}')" 
                                title="Remove participant">
                            <i class="fas fa-user-times"></i>
                        </button>
                    ` : ''}
                </div>
            `;
            grid.appendChild(tile);
        });
        
        this.adjustParticipantGrid();
    }

    adjustParticipantGrid() {
        const grid = document.getElementById('participants-grid');
        const participantCount = this.activeGroupCall.participants.length;
        
        if (participantCount <= 2) {
            grid.className = 'participants-grid grid-2';
        } else if (participantCount <= 4) {
            grid.className = 'participants-grid grid-4';
        } else if (participantCount <= 6) {
            grid.className = 'participants-grid grid-6';
        } else {
            grid.className = 'participants-grid grid-many';
        }
    }

    switchSidebarTab(tab) {
        document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.sidebar-content').forEach(c => c.classList.add('hidden'));
        
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.querySelector(`[data-content="${tab}"]`).classList.remove('hidden');
    }

    // ====================
    // UTILITY AND HELPER METHODS
    // ====================
    startCallTimer() {
        this.callStartTime = Date.now();
        this.callTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.callStartTime) / 1000);
            const timerElement = document.getElementById('call-timer');
            if (timerElement) {
                timerElement.textContent = this.formatDuration(elapsed);
            }
        }, 1000);
    }

    stopCallTimer() {
        if (this.callTimer) {
            clearInterval(this.callTimer);
            this.callTimer = null;
        }
    }

    startVolumeMonitoring() {
        this.volumeMonitoringInterval = setInterval(() => {
            // Simulate volume level monitoring
            const volumeBars = document.querySelectorAll('.volume-bar');
            const level = Math.floor(Math.random() * 4) + 1;
            
            volumeBars.forEach((bar, index) => {
                bar.classList.toggle('active', index < level);
            });
        }, 100);
    }

    stopVolumeMonitoring() {
        if (this.volumeMonitoringInterval) {
            clearInterval(this.volumeMonitoringInterval);
            this.volumeMonitoringInterval = null;
        }
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

    handleCallBackgrounding() {
        // Handle call when app goes to background
        if (this.activeCall) {
            this.showToast('Call continues in background', 'info');
        }
    }

    addToCallHistory(callData) {
        this.callHistory.unshift({
            id: Date.now().toString(),
            ...callData,
            startTime: this.activeCall ? this.activeCall.startTime : new Date()
        });
        
        // Limit history to 100 items
        if (this.callHistory.length > 100) {
            this.callHistory = this.callHistory.slice(0, 100);
        }
    }

    getSelectedParticipants() {
        // Return mock selected participants
        return [
            { id: '1', name: 'Alice Johnson', muted: false, videoEnabled: true },
            { id: '2', name: 'Bob Smith', muted: false, videoEnabled: true },
            { id: '3', name: 'Carol Brown', muted: true, videoEnabled: false }
        ];
    }

    loadContactsForAdd() {
        // Mock implementation - in real app, this would fetch from contacts API
        const contactList = document.getElementById('contact-list-add');
        const contacts = [
            { id: '4', name: 'David Wilson', online: true },
            { id: '5', name: 'Emma Davis', online: false },
            { id: '6', name: 'Frank Miller', online: true }
        ];
        
        contactList.innerHTML = contacts.map(contact => `
            <div class="contact-item">
                <input type="checkbox" id="contact-${contact.id}" value="${contact.id}">
                <label for="contact-${contact.id}">
                    <span class="contact-name">${contact.name}</span>
                    <span class="contact-status ${contact.online ? 'online' : 'offline'}">
                        ${contact.online ? 'Online' : 'Offline'}
                    </span>
                </label>
            </div>
        `).join('');
    }

    // ====================
    // ADDITIONAL FUNCTIONALITY METHODS
    // ====================
    
    renderParticipantsList() {
        const participantsList = document.getElementById('participants-list');
        if (!participantsList || !this.activeGroupCall) return;
        
        participantsList.innerHTML = '';
        this.activeGroupCall.participants.forEach(participant => {
            const item = document.createElement('div');
            item.className = 'participant-list-item';
            item.innerHTML = `
                <div class="participant-info">
                    <div class="participant-avatar">
                        <img src="${participant.avatar || '/src/assets/default-avatar.png'}" alt="${participant.name}">
                    </div>
                    <div class="participant-details">
                        <span class="participant-name">${participant.name}</span>
                        <span class="participant-connection">Connected</span>
                    </div>
                </div>
                <div class="participant-controls-list">
                    <button class="participant-control-btn ${participant.muted ? 'muted' : ''}" 
                            onclick="callsUIManager.toggleParticipantMute('${participant.id}')">
                        <i class="fas fa-microphone${participant.muted ? '-slash' : ''}"></i>
                    </button>
                    <button class="participant-control-btn ${!participant.videoEnabled ? 'disabled' : ''}" 
                            onclick="callsUIManager.toggleParticipantVideo('${participant.id}')">
                        <i class="fas fa-video${!participant.videoEnabled ? '-slash' : ''}"></i>
                    </button>
                    ${this.activeGroupCall.isHost ? `
                        <button class="participant-control-btn remove" 
                                onclick="callsUIManager.removeParticipant('${participant.id}')">
                            <i class="fas fa-user-times"></i>
                        </button>
                    ` : ''}
                </div>
            `;
            participantsList.appendChild(item);
        });
    }

    toggleParticipantMute(participantId) {
        if (!this.activeGroupCall) return;
        const participant = this.activeGroupCall.participants.find(p => p.id === participantId);
        if (participant) {
            participant.muted = !participant.muted;
            this.renderParticipantGrid();
            this.renderParticipantsList();
            this.showToast(`${participant.name} ${participant.muted ? 'muted' : 'unmuted'}`, 'info');
        }
    }

    toggleParticipantVideo(participantId) {
        if (!this.activeGroupCall) return;
        const participant = this.activeGroupCall.participants.find(p => p.id === participantId);
        if (participant) {
            participant.videoEnabled = !participant.videoEnabled;
            this.renderParticipantGrid();
            this.renderParticipantsList();
            this.showToast(`${participant.name} video ${participant.videoEnabled ? 'enabled' : 'disabled'}`, 'info');
        }
    }

    removeParticipant(participantId) {
        if (!this.activeGroupCall || !this.activeGroupCall.isHost) return;
        const participantIndex = this.activeGroupCall.participants.findIndex(p => p.id === participantId);
        if (participantIndex !== -1) {
            const participant = this.activeGroupCall.participants[participantIndex];
            this.activeGroupCall.participants.splice(participantIndex, 1);
            this.renderParticipantGrid();
            this.renderParticipantsList();
            this.showToast(`${participant.name} removed from call`, 'info');
            
            // Update participant count
            document.getElementById('active-group-participants').textContent = 
                `${this.activeGroupCall.participants.length} participants`;
        }
    }

    showParticipantsPanel() {
        // Toggle participants panel visibility in call interface
        this.showToast('Participants panel toggled', 'info');
    }

    showCallSettings() {
        // Show call settings during active call
        this.showQualitySettings();
    }

    switchCameraDetailed() {
        // Switch between available cameras
        const currentCamera = document.getElementById('camera-select').value;
        this.showToast(`Switched to camera: ${currentCamera}`, 'info');
    }

    // Remaining implementation methods
    clearCallHistory() { 
        this.callHistory = []; 
        this.renderCallHistory(); 
        this.updateHistoryStats();
        this.showToast('Call history cleared', 'info'); 
    }

    exportCallHistory() { 
        const data = JSON.stringify(this.callHistory, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `call-history-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Call history exported', 'success'); 
    }

    filterCallHistory() { 
        const typeFilter = document.getElementById('call-type-filter').value;
        const dateFilter = document.getElementById('date-range-filter').value;
        
        let filteredHistory = [...this.callHistory];
        
        if (typeFilter !== 'all') {
            filteredHistory = filteredHistory.filter(call => call.type === typeFilter);
        }
        
        const now = new Date();
        if (dateFilter !== 'all') {
            filteredHistory = filteredHistory.filter(call => {
                const callDate = new Date(call.startTime);
                const diffTime = Math.abs(now - callDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                switch (dateFilter) {
                    case 'today': return diffDays <= 1;
                    case 'week': return diffDays <= 7;
                    case 'month': return diffDays <= 30;
                    default: return true;
                }
            });
        }
        
        this.renderFilteredCallHistory(filteredHistory);
    }

    renderFilteredCallHistory(filteredHistory) {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';

        filteredHistory.forEach(call => {
            const historyItem = this.createHistoryItem(call);
            historyList.appendChild(historyItem);
        });
    }

    searchCallHistory() { 
        const searchTerm = document.getElementById('history-search').value.toLowerCase();
        const filteredHistory = this.callHistory.filter(call => 
            call.participant.name.toLowerCase().includes(searchTerm)
        );
        this.renderFilteredCallHistory(filteredHistory);
    }

    hideCallDetailModal() { 
        document.getElementById('call-detail-modal').classList.add('hidden'); 
    }

    refreshCallHistory() { 
        this.renderCallHistory(); 
        this.updateHistoryStats();
    }

    updateHistoryStats() { 
        const totalCalls = this.callHistory.length;
        const totalDuration = this.callHistory.reduce((sum, call) => sum + (call.duration || 0), 0);
        const avgPerDay = totalCalls > 0 ? (totalCalls / 30).toFixed(1) : '0';
        
        document.getElementById('total-calls').textContent = totalCalls;
        document.getElementById('total-duration').textContent = this.formatDuration(totalDuration);
        document.getElementById('avg-per-day').textContent = avgPerDay;
    }

    showCallDetail(call) { 
        const modal = document.getElementById('call-detail-modal');
        
        // Update modal content with call details
        document.getElementById('detail-participant').textContent = call.participant.name;
        document.getElementById('detail-type').textContent = call.type.charAt(0).toUpperCase() + call.type.slice(1) + ' Call';
        document.getElementById('detail-status').textContent = call.status;
        document.getElementById('detail-duration').textContent = this.formatDuration(call.duration);
        document.getElementById('detail-start-time').textContent = call.startTime.toLocaleString();
        document.getElementById('detail-end-time').textContent = call.endTime ? call.endTime.toLocaleString() : 'N/A';
        
        modal.classList.remove('hidden'); 
    }

    callBack(callId) { 
        const call = this.callHistory.find(c => c.id === callId);
        if (call) {
            this.showToast(`Calling ${call.participant.name}...`, 'info');
            // Simulate starting a new call
            setTimeout(() => {
                this.showEnhancedIncomingCall({
                    caller: { username: call.participant.name, avatar: call.participant.avatar },
                    callType: call.type
                });
            }, 1000);
        }
    }

    showCallOptions(callId) { 
        const call = this.callHistory.find(c => c.id === callId);
        if (call) {
            const options = document.createElement('div');
            options.className = 'call-options-popup';
            options.innerHTML = `
                <div class="call-options-content">
                    <button onclick="callsUIManager.callBack('${callId}')">Call Back</button>
                    <button onclick="callsUIManager.deleteCall('${callId}')">Delete</button>
                    <button onclick="callsUIManager.blockContact('${callId}')">Block</button>
                </div>
            `;
            document.body.appendChild(options);
            
            setTimeout(() => options.remove(), 3000);
        }
    }

    deleteCall(callId) {
        const index = this.callHistory.findIndex(c => c.id === callId);
        if (index !== -1) {
            this.callHistory.splice(index, 1);
            this.renderCallHistory();
            this.updateHistoryStats();
            this.showToast('Call deleted', 'info');
        }
    }

    blockContact(callId) {
        const call = this.callHistory.find(c => c.id === callId);
        if (call) {
            this.showToast(`${call.participant.name} blocked`, 'warning');
        }
    }

    searchParticipants() { 
        const searchTerm = document.getElementById('participant-search').value.toLowerCase();
        // Mock implementation - filter participant suggestions
        this.showToast('Searching participants...', 'info');
    }

    loadContacts() { 
        // Mock contacts for group call
        const suggestions = document.getElementById('participant-suggestions');
        const contacts = [
            { id: '1', name: 'Alice Johnson', online: true },
            { id: '2', name: 'Bob Smith', online: false },
            { id: '3', name: 'Carol Brown', online: true },
            { id: '4', name: 'David Wilson', online: true }
        ];
        
        suggestions.innerHTML = contacts.map(contact => `
            <div class="participant-suggestion" onclick="callsUIManager.addParticipant('${contact.id}')">
                <div class="suggestion-avatar">
                    <img src="/src/assets/default-avatar.png" alt="${contact.name}">
                    <div class="status-indicator ${contact.online ? 'online' : 'offline'}"></div>
                </div>
                <div class="suggestion-info">
                    <span class="suggestion-name">${contact.name}</span>
                    <span class="suggestion-status">${contact.online ? 'Online' : 'Offline'}</span>
                </div>
            </div>
        `).join('');
    }

    addParticipant(contactId) {
        this.showToast('Participant added to call', 'success');
    }

    saveQualitySettings() { 
        // Save current settings to localStorage
        const settings = {
            videoQuality: document.getElementById('video-quality-select').value,
            audioQuality: document.getElementById('audio-quality-select').value,
            echoCancellation: document.getElementById('echo-cancellation').checked,
            noiseSuppression: document.getElementById('noise-suppression').checked,
            autoGainControl: document.getElementById('auto-gain-control').checked
        };
        
        localStorage.setItem('callsSettings', JSON.stringify(settings));
        this.callSettings = { ...this.callSettings, ...settings };
        this.showToast('Settings saved', 'success'); 
    }

    resetQualitySettings() { 
        // Reset all settings to defaults
        document.getElementById('video-quality-select').value = 'HD';
        document.getElementById('audio-quality-select').value = 'High';
        document.getElementById('echo-cancellation').checked = true;
        document.getElementById('noise-suppression').checked = true;
        document.getElementById('auto-gain-control').checked = true;
        document.getElementById('bandwidth-slider').value = '2000';
        document.getElementById('bandwidth-value').textContent = '2000 kbps';
        
        this.showToast('Settings reset to default', 'info'); 
    }

    testQualitySettings() { 
        this.showToast('Testing current settings...', 'info');
        
        // Simulate testing
        setTimeout(() => {
            this.showToast('Settings test completed successfully', 'success');
        }, 2000);
    }

    initializeDeviceOptions() { 
        // Populate device selection dropdowns
        if (this.mediaDevices.cameras.length > 0) {
            const cameraSelect = document.getElementById('camera-device-select');
            if (cameraSelect) {
                cameraSelect.innerHTML = this.mediaDevices.cameras.map(device => 
                    `<option value="${device.deviceId}">${device.label || 'Camera'}</option>`
                ).join('');
            }
        }

        if (this.mediaDevices.microphones.length > 0) {
            const micSelect = document.getElementById('microphone-device-select');
            if (micSelect) {
                micSelect.innerHTML = this.mediaDevices.microphones.map(device => 
                    `<option value="${device.deviceId}">${device.label || 'Microphone'}</option>`
                ).join('');
            }
        }
    }

    initializeDeviceSelectors() { 
        // Setup device selector dropdowns in call controls
        this.initializeDeviceOptions();
    }

    loadSavedSettings() { 
        const savedSettings = localStorage.getItem('callsSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.callSettings = { ...this.callSettings, ...settings };
            
            // Apply saved settings to UI elements
            const videoSelect = document.getElementById('video-quality-select');
            const audioSelect = document.getElementById('audio-quality-select');
            
            if (videoSelect) videoSelect.value = settings.videoQuality || 'HD';
            if (audioSelect) audioSelect.value = settings.audioQuality || 'High';
        }
    }

    updateNetworkStats() { 
        // Simulate network statistics update
        const stats = {
            connectionType: 'WiFi',
            bandwidth: (Math.random() * 20 + 5).toFixed(1) + ' Mbps',
            latency: Math.floor(Math.random() * 50 + 20) + 'ms',
            packetLoss: (Math.random() * 0.5).toFixed(1) + '%'
        };
        
        document.getElementById('connection-type').textContent = stats.connectionType;
        document.getElementById('available-bandwidth').textContent = stats.bandwidth;
        document.getElementById('network-latency').textContent = stats.latency;
        document.getElementById('packet-loss').textContent = stats.packetLoss;
    }

    testCamera() { 
        this.showToast('Testing camera...', 'info');
        
        // Request camera access for testing
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    const video = document.getElementById('camera-test-video');
                    if (video) {
                        video.srcObject = stream;
                        video.style.display = 'block';
                        
                        setTimeout(() => {
                            stream.getTracks().forEach(track => track.stop());
                            video.style.display = 'none';
                            this.showToast('Camera test completed', 'success');
                        }, 3000);
                    }
                })
                .catch(err => {
                    console.error('Camera test failed:', err);
                    this.showToast('Camera test failed', 'error');
                });
        }
    }

    testMicrophone() { 
        this.showToast('Testing microphone...', 'info');
        
        // Request microphone access for testing
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    // Simulate audio level monitoring
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const analyser = audioContext.createAnalyser();
                    const microphone = audioContext.createMediaStreamSource(stream);
                    microphone.connect(analyser);
                    
                    setTimeout(() => {
                        stream.getTracks().forEach(track => track.stop());
                        audioContext.close();
                        this.showToast('Microphone test completed', 'success');
                    }, 3000);
                })
                .catch(err => {
                    console.error('Microphone test failed:', err);
                    this.showToast('Microphone test failed', 'error');
                });
        }
    }

    testSpeaker() { 
        this.showToast('Testing speaker...', 'info');
        
        // Play test tone
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 440; // A4 note
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        
        setTimeout(() => {
            oscillator.stop();
            audioContext.close();
            this.showToast('Speaker test completed', 'success');
        }, 1000);
    }

    // ====================
    // CSS STYLING INJECTION
    // ====================
    addCallsToCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced Incoming Call Interface Styles */
            .enhanced-incoming-call {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }

            .incoming-call-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(20px);
            }

            .incoming-call-container {
                background: var(--bg-card);
                border-radius: 24px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                border: 1px solid var(--glass-border);
                position: relative;
                text-align: center;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            }

            .incoming-call-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
            }

            .incoming-call-type-badge {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: var(--primary);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: 600;
            }

            .minimize-incoming-btn {
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: var(--text-primary);
                transition: all 0.3s ease;
            }

            .minimize-incoming-btn:hover {
                background: var(--glass-border);
                transform: scale(1.1);
            }

            .caller-avatar-container {
                position: relative;
                margin-bottom: 1rem;
            }

            .caller-avatar {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                border: 4px solid var(--primary);
                object-fit: cover;
            }

            .calling-animation {
                position: absolute;
                top: -10px;
                left: -10px;
                right: -10px;
                bottom: -10px;
                border: 2px solid var(--primary);
                border-radius: 50%;
                animation: callRing 2s infinite;
            }

            @keyframes callRing {
                0% { transform: scale(1); opacity: 1; }
                100% { transform: scale(1.2); opacity: 0; }
            }

            .caller-name {
                font-size: 1.8rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
                color: var(--text-primary);
            }

            .caller-subtitle {
                color: var(--text-secondary);
                margin-bottom: 1rem;
                font-size: 1.1rem;
            }

            .call-info-badges {
                display: flex;
                justify-content: center;
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .info-badge {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: var(--glass);
                padding: 0.5rem 1rem;
                border-radius: 16px;
                font-size: 0.9rem;
                color: var(--text-secondary);
            }

            .info-badge .online {
                color: var(--success);
            }

            .incoming-call-preview {
                background: var(--bg-primary);
                border-radius: 12px;
                height: 200px;
                margin-bottom: 2rem;
                position: relative;
                overflow: hidden;
            }

            .preview-video {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .preview-overlay {
                position: absolute;
                bottom: 1rem;
                left: 1rem;
                color: white;
                font-size: 0.9rem;
            }

            .incoming-call-actions {
                margin-bottom: 1rem;
            }

            .quick-actions {
                display: flex;
                justify-content: center;
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .quick-action-btn {
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 50%;
                width: 50px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: var(--text-primary);
                transition: all 0.3s ease;
            }

            .quick-action-btn:hover {
                background: var(--glass-border);
                transform: translateY(-2px);
            }

            .quick-action-btn.active {
                background: var(--warning);
                color: white;
            }

            .main-actions {
                display: flex;
                justify-content: space-between;
                gap: 1rem;
            }

            .call-action-btn {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
                padding: 1rem;
                border: none;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 600;
            }

            .call-action-btn .btn-icon {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }

            .decline-btn {
                background: var(--error);
                color: white;
            }

            .decline-btn:hover {
                background: #dc2626;
                transform: translateY(-3px);
            }

            .accept-btn {
                background: var(--success);
                color: white;
            }

            .accept-btn:hover {
                background: #059669;
                transform: translateY(-3px);
            }

            .caller-message {
                font-style: italic;
                color: var(--text-secondary);
                font-size: 0.9rem;
            }

            /* Minimized Incoming Call Widget */
            .minimized-incoming-call {
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--bg-card);
                border: 1px solid var(--glass-border);
                border-radius: 16px;
                padding: 1rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                z-index: 9999;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.3s ease;
            }

            .minimized-caller-info {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .mini-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                object-fit: cover;
            }

            .mini-caller-name {
                font-weight: 600;
                color: var(--text-primary);
            }

            .minimized-actions {
                display: flex;
                gap: 0.5rem;
            }

            .mini-action-btn {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }

            .mini-action-btn.accept {
                background: var(--success);
                color: white;
            }

            .mini-action-btn.decline {
                background: var(--error);
                color: white;
            }

            /* Detailed Call Controls Styles */
            .detailed-call-controls {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9998;
                animation: slideUp 0.3s ease;
            }

            @keyframes slideUp {
                from { transform: translate(-50%, 100%); }
                to { transform: translate(-50%, 0); }
            }

            .controls-container {
                background: var(--bg-card);
                border: 1px solid var(--glass-border);
                border-radius: 20px;
                padding: 1.5rem;
                backdrop-filter: blur(20px);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }

            .primary-controls {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .control-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 16px;
                padding: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 80px;
            }

            .control-btn:hover {
                background: var(--glass-border);
                transform: translateY(-2px);
            }

            .control-btn.active {
                background: var(--primary);
                color: white;
            }

            .control-btn.muted {
                background: var(--error);
                color: white;
            }

            .control-btn.disabled {
                background: var(--glass);
                color: var(--text-muted);
                opacity: 0.5;
            }

            .btn-icon {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--glass);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                margin-bottom: 0.5rem;
            }

            .btn-label {
                font-size: 0.8rem;
                font-weight: 600;
                color: var(--text-primary);
            }

            .volume-indicator {
                position: absolute;
                bottom: 5px;
                right: 5px;
            }

            .volume-bars {
                display: flex;
                gap: 2px;
                align-items: flex-end;
                height: 20px;
            }

            .volume-bar {
                width: 3px;
                background: var(--glass-border);
                border-radius: 1px;
                transition: all 0.1s ease;
            }

            .volume-bar:nth-child(1) { height: 25%; }
            .volume-bar:nth-child(2) { height: 50%; }
            .volume-bar:nth-child(3) { height: 75%; }
            .volume-bar:nth-child(4) { height: 100%; }

            .volume-bar.active {
                background: var(--success);
            }

            .recording-indicator {
                position: absolute;
                top: 5px;
                right: 5px;
                width: 8px;
                height: 8px;
                background: var(--error);
                border-radius: 50%;
                display: none;
                animation: blink 1s infinite;
            }

            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }

            .secondary-controls {
                display: flex;
                gap: 0.5rem;
                justify-content: center;
                margin-bottom: 1rem;
            }

            .secondary-control-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 0.75rem 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.9rem;
                position: relative;
            }

            .secondary-control-btn:hover {
                background: var(--glass-border);
            }

            .notification-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: var(--error);
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.7rem;
                font-weight: 700;
            }

            .advanced-controls {
                border-top: 1px solid var(--glass-border);
                padding-top: 1rem;
            }

            .control-group {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .control-group label {
                min-width: 80px;
                font-size: 0.9rem;
                color: var(--text-secondary);
            }

            .control-select {
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 8px;
                padding: 0.5rem;
                color: var(--text-primary);
                flex: 1;
            }

            .controls-toggle-btn {
                position: absolute;
                top: -15px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: var(--text-primary);
                transition: all 0.3s ease;
            }

            .controls-toggle-btn:hover {
                background: var(--glass-border);
            }

            /* Group Call Management Styles */
            .group-call-management {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 9999;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
            }

            .group-call-container {
                background: var(--bg-card);
                border-radius: 20px;
                max-width: 1200px;
                width: 95%;
                max-height: 90vh;
                overflow-y: auto;
                border: 1px solid var(--glass-border);
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            }

            .group-call-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid var(--glass-border);
            }

            .group-call-close-btn {
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: var(--text-primary);
                transition: all 0.3s ease;
            }

            .participants-grid {
                display: grid;
                gap: 1rem;
                padding: 1rem;
            }

            .participants-grid.grid-2 {
                grid-template-columns: repeat(2, 1fr);
            }

            .participants-grid.grid-4 {
                grid-template-columns: repeat(2, 1fr);
                grid-template-rows: repeat(2, 1fr);
            }

            .participants-grid.grid-6 {
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(2, 1fr);
            }

            .participants-grid.grid-many {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            }

            .participant-tile {
                background: var(--bg-primary);
                border-radius: 12px;
                aspect-ratio: 16/9;
                position: relative;
                overflow: hidden;
            }

            .participant-video {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .participant-overlay {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, rgba(0,0,0,0.8));
                padding: 1rem;
                color: white;
            }

            .participant-name {
                font-weight: 600;
                margin-bottom: 0.25rem;
            }

            .participant-status {
                display: flex;
                gap: 0.5rem;
                font-size: 0.9rem;
                opacity: 0.8;
            }

            /* Quick Message Dialog */
            .quick-message-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10001;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
            }

            .quick-message-content {
                background: var(--bg-card);
                border-radius: 16px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                border: 1px solid var(--glass-border);
                position: relative;
            }

            .quick-message-options {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin: 1.5rem 0;
            }

            .quick-msg-btn {
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 1rem;
                cursor: pointer;
                color: var(--text-primary);
                transition: all 0.3s ease;
                text-align: left;
            }

            .quick-msg-btn:hover {
                background: var(--glass-border);
                transform: translateY(-2px);
            }

            .custom-message {
                display: flex;
                gap: 0.5rem;
            }

            .custom-message input {
                flex: 1;
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 8px;
                padding: 0.75rem;
                color: var(--text-primary);
            }

            .send-custom-btn {
                background: var(--primary);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 0.75rem 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .send-custom-btn:hover {
                background: var(--secondary);
            }

            .close-dialog-btn {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--text-secondary);
                transition: color 0.3s ease;
            }

            .close-dialog-btn:hover {
                color: var(--text-primary);
            }

            /* In-Call Chat Panel */
            .in-call-chat-panel {
                position: fixed;
                top: 100px;
                right: 20px;
                width: 300px;
                height: 400px;
                background: var(--bg-card);
                border: 1px solid var(--glass-border);
                border-radius: 16px;
                z-index: 9997;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }

            .chat-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border-bottom: 1px solid var(--glass-border);
            }

            .chat-messages-container {
                flex: 1;
                padding: 1rem;
                overflow-y: auto;
            }

            .chat-input-container {
                display: flex;
                gap: 0.5rem;
                padding: 1rem;
                border-top: 1px solid var(--glass-border);
            }

            .chat-input-container input {
                flex: 1;
                background: var(--glass);
                border: 1px solid var(--glass-border);
                border-radius: 8px;
                padding: 0.5rem;
                color: var(--text-primary);
            }

            .chat-input-container button {
                background: var(--primary);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 0.5rem 1rem;
                cursor: pointer;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .incoming-call-container {
                    max-width: 350px;
                    padding: 1.5rem;
                }

                .controls-container {
                    padding: 1rem;
                }

                .primary-controls {
                    flex-wrap: wrap;
                }

                .control-btn {
                    min-width: 70px;
                    padding: 0.75rem;
                }

                .group-call-container {
                    width: 100%;
                    max-height: 100vh;
                    border-radius: 0;
                }

                .participants-grid.grid-4,
                .participants-grid.grid-6 {
                    grid-template-columns: 1fr;
                }
            }

            /* Accessibility enhancements */
            .control-btn:focus,
            .call-action-btn:focus,
            .quick-action-btn:focus {
                outline: 2px solid var(--primary);
                outline-offset: 2px;
            }

            /* High contrast mode */
            @media (prefers-contrast: high) {
                .control-btn {
                    border-width: 2px;
                }
                
                .call-action-btn {
                    border: 2px solid currentColor;
                }
            }

            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .calling-animation,
                .recording-indicator {
                    animation: none;
                }
                
                .control-btn:hover {
                    transform: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Initialize the Calls UI Manager
document.addEventListener('DOMContentLoaded', () => {
    window.callsUIManager = new CallsUIManager();
});

// Export for use in other modules
export { CallsUIManager };
