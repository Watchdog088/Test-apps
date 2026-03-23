/**
 * ConnectHub - Video Calls Dashboard Manager
 * Manages all video call features including dashboards for:
 * - Video calls
 * - Voice calls
 * - Screen share
 * - Recording
 * - Add people
 * - Backgrounds
 * - History
 * - Schedule
 * - Recent calls
 */

class VideoCallsDashboard {
    constructor() {
        this.currentCall = null;
        this.recentCalls = [];
        this.scheduledCalls = [];
        this.callRecordings = [];
        this.backgrounds = [];
        this.initializeVideoCallsFeatures();
    }

    initializeVideoCallsFeatures() {
        this.loadRecentCalls();
        this.loadScheduledCalls();
        this.loadBackgrounds();
        this.renderRecentCalls();
    }

    // ==================== VIDEO CALL DASHBOARD ====================
    startVideoCall(contactId = null) {
        // Show video call selection screen if no contact specified
        if (!contactId) {
            this.showVideoCallSelector();
            return;
        }

        // Start WebRTC video call
        if (window.callManager) {
            window.callManager.initiateCall(contactId, 'video');
        }

        // Show enhanced UI
        if (window.callsUIManager) {
            window.callsUIManager.showDetailedCallControls();
        }

        this.showSuccessToast('Starting video call...');
    }

    showVideoCallSelector() {
        const modal = this.createModal('video-call-selector', 'Start Video Call');
        modal.innerHTML += `
            <div class="call-selector-container">
                <div class="selector-header">
                    <h3>📹 Start Video Call</h3>
                    <p>Select a contact or enter meeting details</p>
                </div>

                <div class="selector-tabs">
                    <button class="selector-tab active" data-tab="contacts">
                        <i class="fas fa-users"></i>
                        Contacts
                    </button>
                    <button class="selector-tab" data-tab="group">
                        <i class="fas fa-user-friends"></i>
                        Group Call
                    </button>
                    <button class="selector-tab" data-tab="meeting">
                        <i class="fas fa-link"></i>
                        Join Meeting
                    </button>
                </div>

                <div class="selector-content">
                    <!-- Contacts Tab -->
                    <div class="selector-panel active" data-panel="contacts">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" placeholder="Search contacts..." id="contact-search-video" oninput="videoCallsDashboard.searchContacts(this.value)">
                        </div>
                        <div class="contacts-list" id="video-contacts-list">
                            ${this.renderContactsList()}
                        </div>
                    </div>

                    <!-- Group Call Tab -->
                    <div class="selector-panel" data-panel="group">
                        <p>Start a group video call with multiple people</p>
                        <button class="btn btn-primary" onclick="videoCallsDashboard.startGroupVideoCall()">
                            <i class="fas fa-video"></i>
                            Start Group Video Call
                        </button>
                    </div>

                    <!-- Join Meeting Tab -->
                    <div class="selector-panel" data-panel="meeting">
                        <div class="form-group">
                            <label>Meeting ID or Link</label>
                            <input type="text" id="meeting-id-input" placeholder="Enter meeting ID or paste link..." class="form-input">
                        </div>
                        <button class="btn btn-primary" onclick="videoCallsDashboard.joinMeeting()">
                            <i class="fas fa-sign-in-alt"></i>
                            Join Meeting
                        </button>
                    </div>
                </div>

                <div class="selector-actions">
                    <button class="btn btn-secondary" onclick="videoCallsDashboard.closeModal('video-call-selector')">Cancel</button>
                </div>
            </div>
        `;

        this.bindSelectorTabs();
        document.body.appendChild(modal);
    }

    // ==================== VOICE CALL DASHBOARD ====================
    startVoiceCall(contactId = null) {
        if (!contactId) {
            this.showVoiceCallSelector();
            return;
        }

        // Start WebRTC voice call
        if (window.callManager) {
            window.callManager.initiateCall(contactId, 'voice');
        }

        // Show enhanced UI
        if (window.callsUIManager) {
            window.callsUIManager.showDetailedCallControls();
        }

        this.showSuccessToast('Starting voice call...');
    }

    showVoiceCallSelector() {
        const modal = this.createModal('voice-call-selector', 'Start Voice Call');
        modal.innerHTML += `
            <div class="call-selector-container">
                <div class="selector-header">
                    <h3>📞 Start Voice Call</h3>
                    <p>Select a contact to call</p>
                </div>

                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Search contacts..." id="contact-search-voice" oninput="videoCallsDashboard.searchContacts(this.value, 'voice')">
                </div>

                <div class="contacts-list" id="voice-contacts-list">
                    ${this.renderContactsList('voice')}
                </div>

                <div class="selector-actions">
                    <button class="btn btn-secondary" onclick="videoCallsDashboard.closeModal('voice-call-selector')">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // ==================== SCREEN SHARE DASHBOARD ====================
    openScreenShareDashboard() {
        const modal = this.createModal('screen-share-dashboard', 'Screen Share');
        modal.innerHTML += `
            <div class="screen-share-container">
                <div class="dashboard-header">
                    <h3>🖥️ Screen Share Options</h3>
                    <p>Share your screen, window, or specific tab</p>
                </div>

                <div class="share-options-grid">
                    <div class="share-option-card" onclick="videoCallsDashboard.shareScreen('entire')">
                        <div class="option-icon">
                            <i class="fas fa-desktop"></i>
                        </div>
                        <h4>Entire Screen</h4>
                        <p>Share everything on your screen</p>
                        <button class="btn btn-primary">Share Entire Screen</button>
                    </div>

                    <div class="share-option-card" onclick="videoCallsDashboard.shareScreen('window')">
                        <div class="option-icon">
                            <i class="fas fa-window-maximize"></i>
                        </div>
                        <h4>Application Window</h4>
                        <p>Share a specific window</p>
                        <button class="btn btn-primary">Share Window</button>
                    </div>

                    <div class="share-option-card" onclick="videoCallsDashboard.shareScreen('tab')">
                        <div class="option-icon">
                            <i class="fas fa-browser"></i>
                        </div>
                        <h4>Browser Tab</h4>
                        <p>Share a specific browser tab</p>
                        <button class="btn btn-primary">Share Tab</button>
                    </div>
                </div>

                <div class="share-settings">
                    <h4>Screen Share Settings</h4>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="share-audio-checkbox" checked>
                            Share system audio
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="share-cursor-checkbox" checked>
                            Show cursor in share
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>Quality:</label>
                        <select id="share-quality-select">
                            <option value="hd">HD (1080p)</option>
                            <option value="standard" selected>Standard (720p)</option>
                            <option value="low">Low (480p)</option>
                        </select>
                    </div>
                </div>

                <div class="current-shares">
                    <h4>Active Screen Shares</h4>
                    <div id="active-shares-list">
                        <p class="empty-state">No active screen shares</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    async shareScreen(type) {
        try {
            let captureOptions = {
                video: true,
                audio: document.getElementById('share-audio-checkbox')?.checked || false
            };

            if (type === 'window') {
                captureOptions.video = { displaySurface: 'window' };
            } else if (type === 'tab') {
                captureOptions.video = { displaySurface: 'browser' };
            }

            const stream = await navigator.mediaDevices.getDisplayMedia(captureOptions);
            
            this.showSuccessToast('Screen sharing started');
            this.closeModal('screen-share-dashboard');

            // Update active shares list
            this.addActiveShare(stream, type);

        } catch (error) {
            console.error('Screen share error:', error);
            this.showErrorToast('Failed to start screen sharing');
        }
    }

    addActiveShare(stream, type) {
        const shareInfo = {
            id: Date.now(),
            type: type,
            stream: stream,
            startTime: new Date()
        };

        const shareElement = document.createElement('div');
        shareElement.className = 'active-share-item';
        shareElement.innerHTML = `
            <div class="share-info">
                <i class="fas fa-desktop"></i>
                <span>Sharing ${type}</span>
                <span class="share-duration">0:00</span>
            </div>
            <button class="btn btn-error btn-small" onclick="videoCallsDashboard.stopSharingScreen('${shareInfo.id}')">
                Stop Sharing
            </button>
        `;

        const activeSharesList = document.getElementById('active-shares-list');
        if (activeSharesList) {
            const emptyState = activeSharesList.querySelector('.empty-state');
            if (emptyState) emptyState.remove();
            activeSharesList.appendChild(shareElement);
        }

        // Handle stream end
        stream.getVideoTracks()[0].onended = () => {
            this.stopSharingScreen(shareInfo.id);
        };
    }

    stopSharingScreen(shareId) {
        this.showSuccessToast('Screen sharing stopped');
        // Remove from UI
        const shareElement = document.querySelector(`[data-share-id="${shareId}"]`);
        if (shareElement) shareElement.remove();
    }

    // ==================== RECORDING DASHBOARD ====================
    openRecordingDashboard() {
        const modal = this.createModal('recording-dashboard', 'Call Recording');
        modal.innerHTML += `
            <div class="recording-container">
                <div class="dashboard-header">
                    <h3>🎥 Call Recording</h3>
                    <p>Record your calls and manage recordings</p>
                </div>

                <div class="recording-controls">
                    <div class="recording-status">
                        <div class="status-indicator" id="recording-indicator">
                            <div class="status-dot"></div>
                            <span>Not Recording</span>
                        </div>
                        <div class="recording-duration" id="recording-duration">00:00:00</div>
                    </div>

                    <div class="recording-actions">
                        <button class="btn btn-primary btn-large" id="start-recording-btn" onclick="videoCallsDashboard.startRecording()">
                            <i class="fas fa-record-vinyl"></i>
                            Start Recording
                        </button>
                        <button class="btn btn-error btn-large hidden" id="stop-recording-btn" onclick="videoCallsDashboard.stopRecording()">
                            <i class="fas fa-stop"></i>
                            Stop Recording
                        </button>
                    </div>
                </div>

                <div class="recording-settings">
                    <h4>Recording Settings</h4>
                    <div class="setting-item">
                        <label>Quality:</label>
                        <select id="recording-quality">
                            <option value="hd">HD (1080p)</option>
                            <option value="standard" selected>Standard (720p)</option>
                            <option value="low">Low (480p)</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="record-audio-checkbox" checked>
                            Record audio
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="record-video-checkbox" checked>
                            Record video
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="auto-save-checkbox" checked>
                            Auto-save recordings
                        </label>
                    </div>
                </div>

                <div class="recordings-list">
                    <h4>Recent Recordings</h4>
                    <div id="recordings-grid">
                        ${this.renderRecordingsList()}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    startRecording() {
        this.currentRecording = {
            startTime: new Date(),
            duration: 0
        };

        document.getElementById('start-recording-btn').classList.add('hidden');
        document.getElementById('stop-recording-btn').classList.remove('hidden');
        document.getElementById('recording-indicator').classList.add('recording');
        document.getElementById('recording-indicator').querySelector('span').textContent = 'Recording...';

        this.startRecordingTimer();
        this.showSuccessToast('Recording started');
    }

    stopRecording() {
        clearInterval(this.recordingTimer);

        document.getElementById('start-recording-btn').classList.remove('hidden');
        document.getElementById('stop-recording-btn').classList.add('hidden');
        document.getElementById('recording-indicator').classList.remove('recording');
        document.getElementById('recording-indicator').querySelector('span').textContent = 'Not Recording';

        const recording = {
            id: Date.now(),
            date: new Date(),
            duration: this.currentRecording.duration,
            filename: `recording_${Date.now()}.mp4`
        };

        this.callRecordings.unshift(recording);
        this.currentRecording = null;

        this.showSuccessToast('Recording saved');
    }

    startRecordingTimer() {
        this.recordingTimer = setInterval(() => {
            this.currentRecording.duration++;
            const hours = Math.floor(this.currentRecording.duration / 3600);
            const minutes = Math.floor((this.currentRecording.duration % 3600) / 60);
            const seconds = this.currentRecording.duration % 60;
            
            document.getElementById('recording-duration').textContent = 
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }

    renderRecordingsList() {
        if (this.callRecordings.length === 0) {
            return '<p class="empty-state">No recordings yet</p>';
        }

        return this.callRecordings.map(recording => `
            <div class="recording-item">
                <div class="recording-thumbnail">
                    <i class="fas fa-video"></i>
                </div>
                <div class="recording-info">
                    <h5>${recording.filename}</h5>
                    <p>${this.formatDate(recording.date)} • ${this.formatDuration(recording.duration)}</p>
                </div>
                <div class="recording-actions-menu">
                    <button class="btn btn-secondary btn-small" onclick="videoCallsDashboard.playRecording('${recording.id}')">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="videoCallsDashboard.downloadRecording('${recording.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-error btn-small" onclick="videoCallsDashboard.deleteRecording('${recording.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ==================== ADD PEOPLE DASHBOARD ====================
    openAddPeopleDashboard() {
        const modal = this.createModal('add-people-dashboard', 'Add People to Call');
        modal.innerHTML += `
            <div class="add-people-container">
                <div class="dashboard-header">
                    <h3>👥 Add People to Call</h3>
                    <p>Invite more people to join this call</p>
                </div>

                <div class="add-methods">
                    <div class="method-card" onclick="videoCallsDashboard.showContactPicker()">
                        <i class="fas fa-user-plus"></i>
                        <h4>Add from Contacts</h4>
                        <p>Select from your contacts list</p>
                    </div>

                    <div class="method-card" onclick="videoCallsDashboard.showInviteLink()">
                        <i class="fas fa-link"></i>
                        <h4>Share Invite Link</h4>
                        <p>Generate a shareable link</p>
                    </div>

                    <div class="method-card" onclick="videoCallsDashboard.showDialPad()">
                        <i class="fas fa-phone"></i>
                        <h4>Dial Phone Number</h4>
                        <p>Call a phone number</p>
                    </div>
                </div>

                <div class="current-participants">
                    <h4>Current Participants (3)</h4>
                    <div id="participants-in-call">
                        ${this.renderCurrentParticipants()}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    showContactPicker() {
        const contactModal = this.createModal('contact-picker-modal', 'Select Contacts');
        contactModal.innerHTML += `
            <div class="contact-picker-container">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Search contacts..." oninput="videoCallsDashboard.filterContacts(this.value)">
                </div>

                <div class="contacts-grid" id="contacts-picker-grid">
                    ${this.renderContactsForPicker()}
                </div>

                <div class="picker-actions">
                    <button class="btn btn-secondary" onclick="videoCallsDashboard.closeModal('contact-picker-modal')">Cancel</button>
                    <button class="btn btn-primary" onclick="videoCallsDashboard.addSelectedContacts()">
                        <i class="fas fa-user-plus"></i>
                        Add Selected
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(contactModal);
    }

    showInviteLink() {
        const inviteLink = `https://lynk.app/call/${Date.now()}`;
        const modal = this.createModal('invite-link-modal', 'Share Invite Link');
        modal.innerHTML += `
            <div class="invite-link-container">
                <p>Share this link with people you want to add to the call:</p>
                <div class="link-display">
                    <input type="text" value="${inviteLink}" readonly id="invite-link-input">
                    <button class="btn btn-primary" onclick="videoCallsDashboard.copyInviteLink()">
                        <i class="fas fa-copy"></i>
                        Copy
                    </button>
                </div>

                <div class="share-options">
                    <h4>Share via:</h4>
                    <div class="share-buttons">
                        <button class="share-btn" onclick="videoCallsDashboard.shareVia('email')">
                            <i class="fas fa-envelope"></i>
                            Email
                        </button>
                        <button class="share-btn" onclick="videoCallsDashboard.shareVia('message')">
                            <i class="fas fa-comment"></i>
                            Message
                        </button>
                        <button class="share-btn" onclick="videoCallsDashboard.shareVia('social')">
                            <i class="fas fa-share-alt"></i>
                            Social
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    copyInviteLink() {
        const input = document.getElementById('invite-link-input');
        input.select();
        document.execCommand('copy');
        this.showSuccessToast('Link copied to clipboard');
    }

    // ==================== BACKGROUNDS DASHBOARD ====================
    openBackgroundsDashboard() {
        const modal = this.createModal('backgrounds-dashboard', 'Virtual Backgrounds');
        modal.innerHTML += `
            <div class="backgrounds-container">
                <div class="dashboard-header">
                    <h3>🎨 Virtual Backgrounds</h3>
                    <p>Choose or upload a virtual background</p>
                </div>

                <div class="background-preview">
                    <video id="background-preview-video" autoplay muted></video>
                    <div class="preview-controls">
                        <button class="btn btn-secondary btn-small" onclick="videoCallsDashboard.toggleBackgroundPreview()">
                            <i class="fas fa-video"></i>
                            Toggle Camera
                        </button>
                    </div>
                </div>

                <div class="background-tabs">
                    <button class="bg-tab active" data-tab="none" onclick="videoCallsDashboard.switchBackgroundTab('none')">
                        <i class="fas fa-ban"></i>
                        None
                    </button>
                    <button class="bg-tab" data-tab="blur" onclick="videoCallsDashboard.switchBackgroundTab('blur')">
                        <i class="fas fa-adjust"></i>
                        Blur
                    </button>
                    <button class="bg-tab" data-tab="images" onclick="videoCallsDashboard.switchBackgroundTab('images')">
                        <i class="fas fa-image"></i>
                        Images
                    </button>
                    <button class="bg-tab" data-tab="upload" onclick="videoCallsDashboard.switchBackgroundTab('upload')">
                        <i class="fas fa-upload"></i>
                        Upload
                    </button>
                </div>

                <div class="backgrounds-grid" id="backgrounds-grid">
                    ${this.renderBackgroundsGrid()}
                </div>

                <div class="background-actions">
                    <button class="btn btn-secondary" onclick="videoCallsDashboard.closeModal('backgrounds-dashboard')">Cancel</button>
                    <button class="btn btn-primary" onclick="videoCallsDashboard.applyBackground()">
                        <i class="fas fa-check"></i>
                        Apply Background
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.startBackgroundPreview();
    }

    renderBackgroundsGrid() {
        const backgrounds = [
            { id: 1, name: 'Office Space', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800' },
            { id: 2, name: 'Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800' },
            { id: 3, name: 'City Skyline', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800' },
            { id: 4, name: 'Mountain View', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800' },
            { id: 5, name: 'Library', url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800' },
            { id: 6, name: 'Coffee Shop', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800' }
        ];

        return backgrounds.map(bg => `
            <div class="background-option" data-bg-id="${bg.id}" onclick="videoCallsDashboard.selectBackground('${bg.id}')">
                <img src="${bg.url}" alt="${bg.name}">
                <span class="bg-name">${bg.name}</span>
            </div>
        `).join('');
    }

    selectBackground(bgId) {
        document.querySelectorAll('.background-option').forEach(el => el.classList.remove('selected'));
        document.querySelector(`[data-bg-id="${bgId}"]`).classList.add('selected');
    }

    applyBackground() {
        this.showSuccessToast('Background applied');
        this.closeModal('backgrounds-dashboard');
    }

    async startBackgroundPreview() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.getElementById('background-preview-video');
            if (video) {
                video.srcObject = stream;
            }
        } catch (error) {
            console.error('Failed to start camera preview:', error);
        }
    }

    // ==================== CALL HISTORY DASHBOARD ====================
    viewCallHistory() {
        if (window.callsUIManager && window.callsUIManager.createCallHistoryDetails) {
            // Use the detailed call history from callsUIManager if available
            window.callsUIManager.createCallHistoryDetails();
            window.callsUIManager.showCallHistory();
        } else {
            // Fallback to basic history view
            this.showBasicCallHistory();
        }
    }

    showBasicCallHistory() {
        const modal = this.createModal('call-history-dashboard', 'Call History');
        modal.innerHTML += `
            <div class="history-container">
                <div class="dashboard-header">
                    <h3>📋 Call History</h3>
                    <p>View your recent calls</p>
                </div>

                <div class="history-filters">
                    <select id="history-filter" onchange="videoCallsDashboard.filterHistory(this.value)">
                        <option value="all">All Calls</option>
                        <option value="video">Video Calls</option>
                        <option value="voice">Voice Calls</option>
                        <option value="missed">Missed Calls</option>
                    </select>

                    <select id="history-date-filter" onchange="videoCallsDashboard.filterHistoryByDate(this.value)">
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="all">All Time</option>
                    </select>
                </div>

                <div class="history-list" id="call-history-list">
                    ${this.renderCallHistory()}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    renderCallHistory() {
        if (this.recentCalls.length === 0) {
            return '<p class="empty-state">No call history</p>';
        }

        return this.recentCalls.map(call => `
            <div class="history-item" onclick="videoCallsDashboard.showCallDetails('${call.id}')">
                <div class="history-avatar">
                    <img src="${call.avatar || '/src/assets/default-avatar.png'}" alt="${call.name}">
                    <i class="fas fa-${call.type === 'video' ? 'video' : 'phone'} call-type-icon"></i>
                </div>
                <div class="history-info">
                    <h4>${call.name}</h4>
                    <p>${call.status} • ${this.formatDate(call.date)} • ${this.formatDuration(call.duration)}</p>
                </div>
                <div class="history-actions">
                    <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); videoCallsDashboard.callBack('${call.id}', '${call.type}')">
                        <i class="fas fa-${call.type === 'video' ? 'video' : 'phone'}"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    callBack(callId, type) {
        const call = this.recentCalls.find(c => c.id === callId);
        if (call) {
            if (type === 'video') {
                this.startVideoCall(call.contactId);
            } else {
                this.startVoiceCall(call.contactId);
            }
        }
    }

    // ==================== SCHEDULE DASHBOARD ====================
    scheduleCall() {
        const modal = this.createModal('schedule-call-dashboard', 'Schedule Call');
        modal.innerHTML += `
            <div class="schedule-container">
                <div class="dashboard-header">
                    <h3>📅 Schedule Call</h3>
                    <p>Plan a call for later</p>
                </div>

                <div class="schedule-form">
                    <div class="form-group">
                        <label>Call Title</label>
                        <input type="text" id="schedule-title" placeholder="Enter call title..." class="form-input">
                    </div>

                    <div class="form-group">
                        <label>Date & Time</label>
                        <input type="datetime-local" id="schedule-datetime" class="form-input">
                    </div>

                    <div class="form-group">
                        <label>Call Type</label>
                        <select id="schedule-call-type" class="form-input">
                            <option value="video">Video Call</option>
                            <option value="voice">Voice Call</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Participants</label>
                        <div id="schedule-participants-list">
                            <button class="btn btn-secondary" onclick="videoCallsDashboard.addScheduleParticipants()">
                                <i class="fas fa-user-plus"></i>
                                Add Participants
                            </button>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button class="btn btn-secondary" onclick="videoCallsDashboard.closeModal('schedule-call-dashboard')">Cancel</button>
                        <button class="btn btn-primary" onclick="videoCallsDashboard.saveScheduledCall()">
                            <i class="fas fa-calendar-plus"></i>
                            Schedule Call
                        </button>
                    </div>
                </div>

                <div class="scheduled-calls-list">
                    <h4>Upcoming Calls</h4>
                    <div id="upcoming-calls">
                        ${this.renderScheduledCalls()}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    saveScheduledCall() {
        const title = document.getElementById('schedule-title').value;
        const datetime = document.getElementById('schedule-datetime').value;
        const type = document.getElementById('schedule-call-type').value;

        if (!title || !datetime) {
            this.showErrorToast('Please fill in all required fields');
            return;
        }

        const scheduledCall = {
            id: Date.now(),
            title: title,
            datetime: new Date(datetime),
            type: type,
            participants: []
        };

        this.scheduledCalls.push(scheduledCall);
        this.showSuccessToast('Call scheduled successfully');
        this.closeModal('schedule-call-dashboard');
    }

    renderScheduledCalls() {
        if (this.scheduledCalls.length === 0) {
            return '<p class="empty-state">No scheduled calls</p>';
        }

        return this.scheduledCalls.map(call => `
            <div class="scheduled-call-item">
                <div class="call-info">
                    <h5>${call.title}</h5>
                    <p><i class="fas fa-${call.type === 'video' ? 'video' : 'phone'}"></i> ${this.formatDate(call.datetime)}</p>
                </div>
                <div class="call-actions">
                    <button class="btn btn-primary btn-small" onclick="videoCallsDashboard.joinScheduledCall('${call.id}')">Join</button>
                    <button class="btn btn-error btn-small" onclick="videoCallsDashboard.cancelScheduledCall('${call.id}')">Cancel</button>
                </div>
            </div>
        `).join('');
    }

    // ==================== RECENT CALLS SECTION ====================
    renderRecentCalls() {
        const recentCallsContainer = document.getElementById('recentCalls');
        if (!recentCallsContainer) return;

        if (this.recentCalls.length === 0) {
            recentCallsContainer.innerHTML = '<p class="empty-state">No recent calls</p>';
            return;
        }

        recentCallsContainer.innerHTML = this.recentCalls.slice(0, 5).map(call => `
            <div class="recent-call-item" onclick="videoCallsDashboard.callBack('${call.id}', '${call.type}')">
                <img src="${call.avatar || '/src/assets/default-avatar.png'}" alt="${call.name}" class="call-avatar">
                <div class="call-details">
                    <div class="call-name">${call.name}</div>
                    <div class="call-meta">
                        <i class="fas fa-${call.type === 'video' ? 'video' : 'phone'}"></i>
                        ${this.formatDate(call.date)}
                    </div>
                </div>
                <button class="call-action-btn" onclick="event.stopPropagation(); videoCallsDashboard.callBack('${call.id}', '${call.type}')">
                    <i class="fas fa-${call.type === 'video' ? 'video' : 'phone'}"></i>
                </button>
            </div>
        `).join('');
    }

    // ==================== UTILITY METHODS ====================
    createModal(id, title) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'video-calls-modal modal active';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="videoCallsDashboard.closeModal('${id}')"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="videoCallsDashboard.closeModal('${id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
        `;
        return modal;
    }

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.remove();
        }
    }

    bindSelectorTabs() {
        setTimeout(() => {
            document.querySelectorAll('.selector-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    document.querySelectorAll('.selector-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.selector-panel').forEach(p => p.classList.remove('active'));
                    
                    e.target.classList.add('active');
                    const panel = document.querySelector(`[data-panel="${e.target.dataset.tab}"]`);
                    if (panel) panel.classList.add('active');
                });
            });
        }, 100);
    }

    renderContactsList(type = 'video') {
        const contacts = [
            { id: '1', name: 'Alice Johnson', status: 'online', avatar: '/src/assets/default-avatar.png' },
            { id: '2', name: 'Bob Smith', status: 'offline', avatar: '/src/assets/default-avatar.png' },
            { id: '3', name: 'Carol Williams', status: 'online', avatar: '/src/assets/default-avatar.png' }
        ];

        return contacts.map(contact => `
            <div class="contact-item" onclick="videoCallsDashboard.${type === 'video' ? 'startVideoCall' : 'startVoiceCall'}('${contact.id}')">
                <img src="${contact.avatar}" alt="${contact.name}" class="contact-avatar">
                <div class="contact-info">
                    <h4>${contact.name}</h4>
                    <span class="status-indicator ${contact.status}"><i class="fas fa-circle"></i> ${contact.status}</span>
                </div>
                <button class="btn btn-primary btn-small">
                    <i class="fas fa-${type === 'video' ? 'video' : 'phone'}"></i>
                </button>
            </div>
        `).join('');
    }

    renderContactsForPicker() {
        const contacts = [
            { id: '1', name: 'Alice Johnson', status: 'online' },
            { id: '2', name: 'Bob Smith', status: 'offline' },
            { id: '3', name: 'Carol Williams', status: 'online' },
            { id: '4', name: 'David Brown', status: 'online' }
        ];

        return contacts.map(contact => `
            <div class="picker-contact-item">
                <input type="checkbox" id="contact-${contact.id}" value="${contact.id}">
                <label for="contact-${contact.id}">
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-status ${contact.status}">${contact.status}</div>
                </label>
            </div>
        `).join('');
    }

    renderCurrentParticipants() {
        const participants = [
            { id: '1', name: 'You' },
            { id: '2', name: 'Alice Johnson' },
            { id: '3', name: 'Bob Smith' }
        ];

        return participants.map(p => `
            <div class="participant-chip">
                <span>${p.name}</span>
                ${p.name !== 'You' ? `<button onclick="videoCallsDashboard.removeParticipant('${p.id}')"><i class="fas fa-times"></i></button>` : ''}
            </div>
        `).join('');
    }

    loadRecentCalls() {
        this.recentCalls = [
            { id: '1', name: 'Alice Johnson', type: 'video', date: new Date(Date.now() - 3600000), duration: 1234, status: 'completed', contactId: '1', avatar: '/src/assets/default-avatar.png' },
            { id: '2', name: 'Bob Smith', type: 'voice', date: new Date(Date.now() - 7200000), duration: 456, status: 'completed', contactId: '2', avatar: '/src/assets/default-avatar.png' },
            { id: '3', name: 'Carol Williams', type: 'video', date: new Date(Date.now() - 86400000), duration: 2340, status: 'missed', contactId: '3', avatar: '/src/assets/default-avatar.png' }
        ];
    }

    loadScheduledCalls() {
        this.scheduledCalls = [];
    }

    loadBackgrounds() {
        this.backgrounds = [];
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const hours = Math.floor(diff / 3600000);
        
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return new Date(date).toLocaleDateString();
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    }

    showSuccessToast(message) {
        this.showToast(message, 'success');
    }

    showErrorToast(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--primary)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Placeholder methods for features that will be expanded
    searchContacts(query, type = 'video') { console.log('Searching contacts:', query, type); }
    startGroupVideoCall() { 
        if (window.callsUIManager) {
            window.callsUIManager.showGroupCallManagement();
        } else {
            this.showSuccessToast('Starting group video call...');
        }
    }
    joinMeeting() { this.showSuccessToast('Joining meeting...'); }
    filterContacts(query) { console.log('Filtering contacts:', query); }
    addSelectedContacts() { this.showSuccessToast('Contacts added to call'); this.closeModal('contact-picker-modal'); }
    shareVia(method) { this.showSuccessToast(`Sharing via ${method}`); }
    showDialPad() { this.showSuccessToast('Opening dial pad...'); }
    removeParticipant(id) { this.showSuccessToast('Participant removed'); }
    toggleBackgroundPreview() { console.log('Toggling background preview'); }
    switchBackgroundTab(tab) { console.log('Switching to background tab:', tab); }
    playRecording(id) { this.showSuccessToast('Playing recording...'); }
    downloadRecording(id) { this.showSuccessToast('Downloading recording...'); }
    deleteRecording(id) { this.showSuccessToast('Recording deleted'); }
    showCallDetails(id) { console.log('Showing call details:', id); }
    filterHistory(filter) { console.log('Filtering history:', filter); }
    filterHistoryByDate(filter) { console.log('Filtering by date:', filter); }
    addScheduleParticipants() { this.showContactPicker(); }
    joinScheduledCall(id) { this.showSuccessToast('Joining scheduled call...'); }
    cancelScheduledCall(id) { this.showSuccessToast('Call cancelled'); this.scheduledCalls = this.scheduledCalls.filter(c => c.id != id); }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.videoCallsDashboard = new VideoCallsDashboard();
});

// Also make functions available globally for onclick handlers in HTML
window.startVideoCall = () => window.videoCallsDashboard?.startVideoCall();
window.startVoiceCall = () => window.videoCallsDashboard?.startVoiceCall();
window.viewCallHistory = () => window.videoCallsDashboard?.viewCallHistory();
window.scheduleCall = () => window.videoCallsDashboard?.scheduleCall();
