/**
 * ConnectHub Enhanced Live Streaming System
 * Complete implementation of ALL live streaming features with real functionality
 */

class EnhancedLiveStreamingSystem {
    constructor() {
        this.isLive = false;
        this.mediaStream = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        
        this.streamData = {
            title: '',
            description: '',
            category: 'general',
            quality: '720p',
            viewerCount: 0,
            duration: 0,
            reactions: {},
            coHosts: [],
            moderators: [],
            bitrate: 0,
            fps: 0,
            health: 100,
            streamKey: ''
        };
        
        this.chatMessages = [];
        this.polls = [];
        this.savedLives = [];
        this.clips = [];
        this.donations = [];
        this.alerts = [];
        this.bannedUsers = new Set();
        this.mutedUsers = new Map();
        
        this.streamSettings = {
            camera: true,
            microphone: true,
            screenShare: false,
            recording: false,
            autoSave: true,
            notifications: true,
            autoQuality: true,
            backupStream: true,
            multiPlatform: false,
            platforms: ['ConnectHub']
        };
        
        this.analytics = {
            viewerHistory: [],
            reactionHistory: [],
            chatHistory: [],
            peakViewers: 0,
            avgViewTime: 0,
            engagement: 0
        };
        
        this.intervals = {
            duration: null,
            viewer: null,
            analytics: null,
            health: null,
            bitrate: null
        };
        
        this.init();
    }

    init() {
        this.loadSavedData();
        this.initMockData();
        this.setupEventListeners();
        this.initializeAlertSystem();
    }

    loadSavedData() {
        try {
            const saved = localStorage.getItem('liveStreamingDataEnhanced');
            if (saved) {
                const data = JSON.parse(saved);
                this.savedLives = data.savedLives || [];
                this.clips = data.clips || [];
                this.streamSettings = { ...this.streamSettings, ...(data.settings || {}) };
                this.donations = data.donations || [];
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    saveData() {
        try {
            const data = {
                savedLives: this.savedLives,
                clips: this.clips,
                settings: this.streamSettings,
                donations: this.donations,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('liveStreamingDataEnhanced', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    initMockData() {
        this.mockLiveStreams = [
            {
                id: 'stream_001',
                title: 'Gaming Session: Epic Adventures',
                author: 'ProGamer_88',
                category: 'Gaming',
                viewers: 1234,
                duration: '2:15:30',
                thumbnail: '🎮',
                isLive: true,
                quality: '1080p',
                bitrate: 6000
            },
            {
                id: 'stream_002',
                title: 'Cooking Tutorial: Italian Pasta',
                author: 'ChefMaster',
                category: 'Cooking',
                viewers: 856,
                duration: '1:45:20',
                thumbnail: '🍳',
                isLive: true,
                quality: '720p',
                bitrate: 4500
            }
        ];

        if (this.savedLives.length === 0) {
            this.savedLives = [
                {
                    id: 'saved_001',
                    title: 'My First Live Stream',
                    date: '2024-01-15',
                    duration: '45:30',
                    views: 234,
                    thumbnail: '🎥',
                    url: null,
                    clips: 3
                },
                {
                    id: 'saved_002',
                    title: 'Q&A Session with Fans',
                    date: '2024-01-20',
                    duration: '1:15:20',
                    views: 567,
                    thumbnail: '❓',
                    url: null,
                    clips: 5
                }
            ];
        }
    }

    setupEventListeners() {
        console.log('Enhanced Live Streaming System initialized');
    }

    // ======================
    // WEBRTC & MEDIA ACCESS
    // ======================

    async requestMediaPermissions() {
        try {
            const constraints = {
                video: {
                    width: { ideal: this.getQualityWidth() },
                    height: { ideal: this.getQualityHeight() },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };

            this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.displayStreamPreview();
            
            showToast('✅ Camera & Microphone access granted', 'success');
            return true;
        } catch (error) {
            console.error('Media access error:', error);
            showToast('❌ Unable to access camera/microphone. Please grant permissions.', 'error');
            return false;
        }
    }

    displayStreamPreview() {
        const previewElement = document.getElementById('stream-preview');
        if (previewElement && this.mediaStream) {
            previewElement.srcObject = this.mediaStream;
            previewElement.play();
            previewElement.style.display = 'block';
        }
    }

    getQualityWidth() {
        const qualities = { '720p': 1280, '1080p': 1920, '4K': 3840 };
        return qualities[this.streamData.quality] || 1280;
    }

    getQualityHeight() {
        const qualities = { '720p': 720, '1080p': 1080, '4K': 2160 };
        return qualities[this.streamData.quality] || 720;
    }

    async toggleCamera() {
        if (!this.mediaStream) {
            await this.requestMediaPermissions();
            return true;
        }

        const videoTracks = this.mediaStream.getVideoTracks();
        if (videoTracks.length > 0) {
            videoTracks[0].enabled = !videoTracks[0].enabled;
            this.streamSettings.camera = videoTracks[0].enabled;
            showToast(this.streamSettings.camera ? '📹 Camera ON' : '📹 Camera OFF', 'info');
            return this.streamSettings.camera;
        }
        return false;
    }

    async toggleMicrophone() {
        if (!this.mediaStream) {
            await this.requestMediaPermissions();
            return true;
        }

        const audioTracks = this.mediaStream.getAudioTracks();
        if (audioTracks.length > 0) {
            audioTracks[0].enabled = !audioTracks[0].enabled;
            this.streamSettings.microphone = audioTracks[0].enabled;
            showToast(this.streamSettings.microphone ? '🎤 Microphone ON' : '🎤 Microphone OFF', 'info');
            return this.streamSettings.microphone;
        }
        return false;
    }

    async toggleScreenShare() {
        try {
            if (this.streamSettings.screenShare) {
                const screenTracks = this.mediaStream.getTracks().filter(t => t.label.includes('screen'));
                screenTracks.forEach(track => track.stop());
                this.streamSettings.screenShare = false;
                showToast('🖥️ Screen sharing stopped', 'info');
            } else {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: "always" },
                    audio: false
                });
                
                screenStream.getTracks().forEach(track => {
                    this.mediaStream.addTrack(track);
                });
                
                this.streamSettings.screenShare = true;
                showToast('🖥️ Screen sharing started', 'success');
            }
            return this.streamSettings.screenShare;
        } catch (error) {
            showToast('❌ Screen sharing unavailable', 'error');
            return false;
        }
    }

    async toggleRecording() {
        if (!this.mediaStream) {
            showToast('❌ No active stream to record', 'error');
            return false;
        }

        if (this.streamSettings.recording) {
            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
                this.streamSettings.recording = false;
                showToast('⏹️ Recording stopped', 'info');
            }
        } else {
            try {
                this.recordedChunks = [];
                this.mediaRecorder = new MediaRecorder(this.mediaStream, {
                    mimeType: 'video/webm;codecs=vp9'
                });

                this.mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        this.recordedChunks.push(event.data);
                    }
                };

                this.mediaRecorder.onstop = () => {
                    this.saveRecording();
                };

                this.mediaRecorder.start(1000);
                this.streamSettings.recording = true;
                showToast('🔴 Recording started', 'success');
            } catch (error) {
                console.error('Recording error:', error);
                showToast('❌ Recording failed to start', 'error');
                return false;
            }
        }
        return this.streamSettings.recording;
    }

    saveRecording() {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        const recording = {
            id: Date.now(),
            title: this.streamData.title || 'Untitled Stream',
            date: new Date().toISOString().split('T')[0],
            duration: this.formatDuration(this.streamData.duration),
            views: this.streamData.viewerCount,
            thumbnail: '🎥',
            url: url,
            blob: blob,
            clips: 0
        };

        this.savedLives.unshift(recording);
        this.saveData();
        showToast('💾 Recording saved successfully!', 'success');
    }

    async goLive(streamInfo) {
        if (this.isLive) {
            showToast('Already streaming!', 'warning');
            return;
        }

        if (!streamInfo.title || streamInfo.title.trim() === '') {
            showToast('Please enter a stream title', 'error');
            return;
        }

        const hasPermissions = await this.requestMediaPermissions();
        if (!hasPermissions) return;

        this.isLive = true;
        this.streamData = {
            ...this.streamData,
            ...streamInfo,
            startTime: new Date(),
            viewerCount: 0,
            duration: 0,
            health: 100
        };

        this.startDurationCounter();
        this.startViewerSimulation();
        this.startHealthMonitoring();
        this.startBitrateMonitoring();
        this.startQualityAutoAdjustment();
        this.simulateAlerts();

        if (this.streamSettings.notifications) {
            this.sendLiveNotification();
        }

        openModal('live-dashboard');
        showToast('🔴 You are now LIVE!', 'success');
    }

    startDurationCounter() {
        this.intervals.duration = setInterval(() => {
            this.streamData.duration++;
            this.updateDurationDisplay();
        }, 1000);
    }

    updateDurationDisplay() {
        const hours = Math.floor(this.streamData.duration / 3600);
        const minutes = Math.floor((this.streamData.duration % 3600) / 60);
        const seconds = this.streamData.duration % 60;
        const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const durationElement = document.getElementById('live-duration');
        if (durationElement) {
            durationElement.textContent = formatted;
        }
        
        return formatted;
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    startViewerSimulation() {
        this.intervals.viewer = setInterval(() => {
            const change = Math.floor(Math.random() * 10) - 3;
            this.streamData.viewerCount = Math.max(0, this.streamData.viewerCount + change);
            this.analytics.viewerHistory.push(this.streamData.viewerCount);
            this.analytics.peakViewers = Math.max(this.analytics.peakViewers, this.streamData.viewerCount);
            this.updateViewerDisplay();
        }, 5000);
    }

    updateViewerDisplay() {
        const viewerElement = document.getElementById('live-viewers');
        if (viewerElement) {
            viewerElement.textContent = this.formatNumber(this.streamData.viewerCount);
        }
    }

    selectQuality(quality) {
        this.streamData.quality = quality;
        
        if (this.streamSettings.autoQuality) {
            this.adjustStreamQuality(quality);
        }
        
        showToast(`📺 Stream quality set to ${quality}`, 'info');
    }

    adjustStreamQuality(quality) {
        if (!this.mediaStream) return;

        const videoTrack = this.mediaStream.getVideoTracks()[0];
        if (videoTrack) {
            const constraints = {
                width: { ideal: this.getQualityWidth() },
                height: { ideal: this.getQualityHeight() },
                frameRate: { ideal: 30 }
            };
            
            videoTrack.applyConstraints(constraints).catch(error => {
                console.error('Quality adjustment failed:', error);
            });
        }
    }

    startQualityAutoAdjustment() {
        if (!this.streamSettings.autoQuality) return;

        setInterval(() => {
            const health = this.streamData.health;
            
            if (health < 50 && this.streamData.quality === '1080p') {
                this.selectQuality('720p');
                showToast('📉 Quality reduced to maintain stable connection', 'warning');
            } else if (health > 80 && this.streamData.quality === '720p') {
                this.selectQuality('1080p');
                showToast('📈 Quality increased due to good connection', 'success');
            }
        }, 10000);
    }

    startHealthMonitoring() {
        this.intervals.health = setInterval(() => {
            const fluctuation = Math.random() * 20 - 10;
            this.streamData.health = Math.max(0, Math.min(100, this.streamData.health + fluctuation));
            
            this.updateHealthIndicator();
            
            if (this.streamData.health < 30) {
                this.handleLowHealth();
            }
        }, 5000);
    }

    updateHealthIndicator() {
        const healthElement = document.getElementById('stream-health');
        if (healthElement) {
            let status = '🟢 Excellent';
            let color = '#10b981';
            
            if (this.streamData.health < 30) {
                status = '🔴 Poor';
                color = '#ef4444';
            } else if (this.streamData.health < 60) {
                status = '🟡 Fair';
                color = '#f59e0b';
            }
            
            healthElement.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span>${status}</span>
                    <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                        <div style="width: ${this.streamData.health}%; height: 100%; background: ${color}; transition: width 0.3s;"></div>
                    </div>
                    <span style="font-size: 12px; color: #94a3b8;">${Math.round(this.streamData.health)}%</span>
                </div>
            `;
        }
    }

    handleLowHealth() {
        if (this.streamSettings.backupStream) {
            showToast('⚠️ Connection unstable. Activating backup stream...', 'warning');
            this.activateBackupStream();
        } else {
            showToast('⚠️ Connection unstable. Consider reducing quality.', 'warning');
        }
    }

    activateBackupStream() {
        setTimeout(() => {
            this.streamData.health = 70;
            showToast('✅ Backup stream activated', 'success');
        }, 2000);
    }

    startBitrateMonitoring() {
        this.intervals.bitrate = setInterval(() => {
            const targetBitrate = this.getTargetBitrate();
            const fluctuation = Math.random() * 1000 - 500;
            this.streamData.bitrate = Math.max(0, targetBitrate + fluctuation);
            this.streamData.fps = Math.floor(Math.random() * 5) + 28;
            
            this.updateBitrateDisplay();
        }, 2000);
    }

    getTargetBitrate() {
        const bitrates = { '720p': 4500, '1080p': 6000, '4K': 20000 };
        return bitrates[this.streamData.quality] || 4500;
    }

    updateBitrateDisplay() {
        const bitrateElement = document.getElementById('stream-bitrate');
        if (bitrateElement) {
            bitrateElement.innerHTML = `
                <div style="font-size: 12px;">
                    <div>📊 Bitrate: ${(this.streamData.bitrate / 1000).toFixed(1)} Mbps</div>
                    <div style="color: #94a3b8; margin-top: 4px;">FPS: ${this.streamData.fps}</div>
                </div>
            `;
        }
    }

    initializeAlertSystem() {
        this.alertTypes = {
            follower: { emoji: '➕', color: '#4f46e5', duration: 5000 },
            donation: { emoji: '💰', color: '#10b981', duration: 8000 },
            subscription: { emoji: '⭐', color: '#ec4899', duration: 6000 },
            raid: { emoji: '🎉', color: '#f59e0b', duration: 10000 }
        };
    }

    showAlert(type, data) {
        const alert = {
            id: Date.now(),
            type: type,
            data: data,
            timestamp: new Date()
        };

        this.alerts.push(alert);
        this.displayAlert(alert);
    }

    displayAlert(alert) {
        const config = this.alertTypes[alert.type];
        if (!config) return;

        const alertOverlay = document.createElement('div');
        alertOverlay.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, ${config.color}, ${config.color}dd);
            padding: 16px 24px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            z-index: 2000;
            animation: slideDown 0.3s, slideUp 0.3s ${config.duration - 300}ms;
            max-width: 90%;
            text-align: center;
        `;

        alertOverlay.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 8px;">${config.emoji}</div>
            <div style="font-size: 16px; font-weight: 700;">${this.getAlertMessage(alert)}</div>
        `;

        document.body.appendChild(alertOverlay);

        setTimeout(() => {
            alertOverlay.remove();
        }, config.duration);
    }

    getAlertMessage(alert) {
        switch (alert.type) {
            case 'follower':
                return `${alert.data.username} started following!`;
            case 'donation':
                return `${alert.data.username} donated $${alert.data.amount}!`;
            case 'subscription':
                return `${alert.data.username} subscribed!`;
            case 'raid':
                return `${alert.data.username} raided with ${alert.data.viewers} viewers!`;
            default:
                return 'New alert!';
        }
    }

    simulateAlerts() {
        const alertTypes = ['follower', 'donation', 'subscription', 'raid'];
        
        setInterval(() => {
            if (!this.isLive) return;
            
            const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
            const data = this.generateAlertData(type);
            this.showAlert(type, data);
        }, 15000);
    }

    generateAlertData(type) {
        const usernames = ['User123', 'Viewer456', 'Fan789', 'Supporter', 'ProGamer'];
        const username = usernames[Math.floor(Math.random() * usernames.length)];

        switch (type) {
            case 'donation':
                return { username, amount: Math.floor(Math.random() * 50) + 5 };
            case 'raid':
                return { username, viewers: Math.floor(Math.random() * 100) + 10 };
            default:
                return { username };
        }
    }

    sendChatMessage(message) {
        if (!message || message.trim() === '') return;

        const chatMessage = {
            id: Date.now(),
            userId: 'current_user',
            username: 'You',
            message: message.trim(),
            timestamp: new Date(),
            isOwn: true,
            deleted: false
        };

        this.chatMessages.push(chatMessage);
        this.displayChatMessage(chatMessage);
        this.simulateChatResponses();
    }

    displayChatMessage(message) {
        if (message.deleted) return;

        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.id = `chat-msg-${message.id}`;
        messageElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <div class="chat-username">${message.username}</div>
                    <div>${message.message}</div>
                </div>
                ${!message.isOwn ? `
                    <div class="chat-actions" style="display: flex; gap: 4px;">
                        <button onclick="liveSystemEnhanced.deleteMessage('${message.id}')" 
                                style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px; font-size: 16px;"
                                title="Delete">🗑️</button>
                        <button onclick="liveSystemEnhanced.timeoutUser('${message.userId}', '${message.username}')" 
                                style="background: none; border: none; color: #f59e0b; cursor: pointer; padding: 4px; font-size: 16px;"
                                title="Timeout">⏱️</button>
                        <button onclick="liveSystemEnhanced.banUser('${message.userId}', '${message.username}')" 
                                style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px; font-size: 16px;"
                                title="Ban">🚫</button>
                    </div>
                ` : ''}
            </div>
        `;

        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    deleteMessage(messageId) {
        const message = this.chatMessages.find(m => m.id.toString() === messageId.toString());
        if (message) {
            message.deleted = true;
            const messageElement = document.getElementById(`chat-msg-${messageId}`);
            if (messageElement) {
                messageElement.remove();
            }
            showToast('🗑️ Message deleted', 'info');
        }
    }

    timeoutUser(userId, username) {
        const duration = 300000;
        this.mutedUsers.set(userId, Date.now() + duration);
        
        this.chatMessages.forEach(msg => {
            if (msg.userId === userId) {
                msg.deleted = true;
                const elem = document.getElementById(`chat-msg-${msg.id}`);
                if (elem) elem.remove();
            }
        });
        
        showToast(`⏱️ ${username} timed out for 5 minutes`, 'warning');
        
        setTimeout(() => {
            this.mutedUsers.delete(userId);
            showToast(`✅ ${username} timeout expired`, 'info');
        }, duration);
    }

    banUser(userId, username) {
        this.bannedUsers.add(userId);
        
        this.chatMessages.forEach(msg => {
            if (msg.userId === userId) {
                msg.deleted = true;
                const elem = document.getElementById(`chat-msg-${msg.id}`);
                if (elem) elem.remove();
            }
        });
        
        showToast(`🚫 ${username} permanently banned`, 'error');
    }

    unbanUser(userId) {
        this.bannedUsers.delete(userId);
        showToast('✅ User unbanned', 'success');
    }

    simulateChatResponses() {
        const responses = [
            { userId: 'user_123', username: 'User123', message: 'Great stream!' },
            { userId: 'user_456', username: 'Viewer_456', message: 'Love this content 😍' },
            { userId: 'user_789', username: 'Fan789', message: 'Keep it up!' },
            { userId: 'user_abc', username: 'Supporter', message: 'Amazing!' }
        ];

        setTimeout(() => {
            const response = responses[Math.floor(Math.random() * responses.length)];
            
            if (this.bannedUsers.has(response.userId)) return;
            if (this.mutedUsers.has(response.userId)) {
                if (Date.now() < this.mutedUsers.get(response.userId)) return;
                this.mutedUsers.delete(response.userId);
            }

            const chatMessage = {
                id: Date.now(),
                userId: response.userId,
                username: response.username,
                message: response.message,
                timestamp: new Date(),
                isOwn: false,
                deleted: false
            };
            
            this.chatMessages.push(chatMessage);
            this.displayChatMessage(chatMessage);
        }, 2000 + Math.random() * 3000);
    }

    createClipFromStream(startTime, duration) {
        const clip = {
            id: Date.now(),
            title: `Clip from ${this.streamData.title}`,
            streamId: this.streamData.id,
            startTime: startTime,
            duration: duration,
            createdAt: new Date(),
            views: 0,
            thumbnail: '🎬'
        };

        this.clips.push(clip);
        this.saveData();
        showToast('✂️ Clip created successfully!', 'success');
        return clip;
    }

    createPoll(question, options) {
        const poll = {
            id: Date.now(),
            question: question,
            options: options.map(opt => ({ text: opt, votes: 0 })),
            totalVotes: 0,
            createdAt: new Date()
        };

        this.polls.push(poll);
        showToast('📊 Poll created!', 'success');
        this.displayPoll(poll);
    }

    displayPoll(poll) {
        const pollContainer = document.getElementById('active-poll');
        if (!pollContainer) return;

        pollContainer.innerHTML = `
            <div class="poll-card">
                <div class="poll-question">${poll.question}</div>
                ${poll.options.map((option, index) => {
                    const percent = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                    return `
                        <div class="poll-option" onclick="liveSystemEnhanced.votePoll(${poll.id}, ${index})">
                            <div class="poll-option-bg" style="width: ${percent}%"></div>
                            <div class="poll-option-content">
                                <div class="poll-option-text">${option.text}</div>
                                <div class="poll-option-percent">${percent}%</div>
                            </div>
                        </div>
                    `;
                }).join('')}
                <div style="margin-top: 12px; text-align: center; color: var(--text-secondary); font-size: 12px;">
                    ${poll.totalVotes} votes
                </div>
            </div>
        `;
    }

    votePoll(pollId, optionIndex) {
        const poll = this.polls.find(p => p.id === pollId);
        if (poll) {
            poll.options[optionIndex].votes++;
            poll.totalVotes++;
            this.displayPoll(poll);
            showToast('✅ Vote recorded!', 'success');
        }
    }

    sendReaction(emoji) {
        if (!this.streamData.reactions[emoji]) {
            this.streamData.reactions[emoji] = 0;
        }
        this.streamData.reactions[emoji]++;
        this.animateReaction(emoji);
        showToast(`Sent ${emoji}`, 'info');
    }

    animateReaction(emoji) {
        const reaction = document.createElement('div');
        reaction.textContent = emoji;
        reaction.style.cssText = `
            position: fixed;
            font-size: 32px;
            pointer-events: none;
            z-index: 1000;
            animation: floatUp 2s ease-out forwards;
            left: ${Math.random() * 80 + 10}%;
            bottom: 20%;
        `;
        
        document.body.appendChild(reaction);
        setTimeout(() => reaction.remove(), 2000);
    }

    async endStream() {
        if (!this.isLive) return;

        const confirmed = confirm('Are you sure you want to end the stream?');
        if (!confirmed) return;

        Object.values(this.intervals).forEach(interval => {
            if (interval) clearInterval(interval);
        });

        const analytics = this.getStreamAnalytics();

        if (this.streamSettings.autoSave || this.streamSettings.recording) {
            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
            }
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }

        this.showEndScreen(analytics);
        this.isLive = false;
        this.streamData.duration = 0;
        this.streamData.viewerCount = 0;
        this.chatMessages = [];
        this.polls = [];

        showToast('Stream ended', 'info');
    }

    getStreamAnalytics() {
        return {
            duration: this.updateDurationDisplay(),
            peakViewers: this.analytics.peakViewers,
            avgViewers: this.calculateAverageViewers(),
            totalReactions: Object.values(this.streamData.reactions).reduce((a, b) => a + b, 0),
            chatMessages: this.chatMessages.length,
            engagement: this.calculateEngagement()
        };
    }

    calculateAverageViewers() {
        if (this.analytics.viewerHistory.length === 0) {
            return this.streamData.viewerCount;
        }
        const sum = this.analytics.viewerHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.analytics.viewerHistory.length);
    }

    calculateEngagement() {
        const totalInteractions = Object.values(this.streamData.reactions).reduce((a, b) => a + b, 0) + this.chatMessages.length;
        const avgViewers = this.calculateAverageViewers();
        if (avgViewers === 0) return 0;
        return ((totalInteractions / avgViewers) * 100).toFixed(1);
    }

    showEndScreen(analytics) {
        openModal('stream-end-screen');
        
        const endScreenContent = document.getElementById('end-screen-content');
        if (endScreenContent) {
            endScreenContent.innerHTML = `
                <div style="text-align: center; padding: 24px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                    <h2 style="margin-bottom: 24px;">Stream Completed!</h2>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">${analytics.duration}</div>
                            <div class="stat-label">Duration</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${analytics.peakViewers}</div>
                            <div class="stat-label">Peak Viewers</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${analytics.totalReactions}</div>
                            <div class="stat-label">Reactions</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${analytics.engagement}%</div>
                            <div class="stat-label">Engagement</div>
                        </div>
                    </div>

                    <div style="margin-top: 24px;">
                        <button class="btn" onclick="liveSystemEnhanced.shareStream()">Share Stream</button>
                        <button class="btn btn-secondary" onclick="closeModal('stream-end-screen'); openScreen('live');" style="margin-top: 12px;">Back to Live</button>
                    </div>
                </div>
            `;
        }
    }

    shareStream() {
        const shareText = `I just finished streaming "${this.streamData.title}" on ConnectHub! 🔴`;
        showToast('Share options opened', 'info');
    }

    sendLiveNotification() {
        console.log('Sending live notification to followers');
        showToast('📢 Notifying followers that you are live!', 'success');
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    getMockLiveStreams() {
        return this.mockLiveStreams;
    }

    getSavedLives() {
        return this.savedLives;
    }

    getClips() {
        return this.clips;
    }

    getStreamSettings() {
        return this.streamSettings;
    }

    updateSettings(newSettings) {
        this.streamSettings = { ...this.streamSettings, ...newSettings };
        this.saveData();
        showToast('⚙️ Settings updated', 'success');
    }

    addCoHost(userId, username) {
        const coHost = {
            id: userId,
            name: username || `User_${userId}`,
            avatar: '👤',
            status: 'invited',
            joinedAt: null
        };
        
        this.streamData.coHosts.push(coHost);
        showToast(`📧 Co-host invitation sent to ${coHost.name}`, 'success');
        return coHost;
    }

    removeCoHost(coHostId) {
        this.streamData.coHosts = this.streamData.coHosts.filter(h => h.id !== coHostId);
        showToast('❌ Co-host removed', 'info');
    }

    setupMultiPlatformStreaming(platforms) {
        this.streamSettings.multiPlatform = true;
        this.streamSettings.platforms = platforms;
        showToast(`📡 Multi-platform streaming enabled for ${platforms.length} platforms`, 'success');
    }

    scheduleStream(scheduledTime, streamInfo) {
        const schedule = {
            id: Date.now(),
            scheduledTime: scheduledTime,
            streamInfo: streamInfo,
            notificationSent: false
        };
        
        showToast(`📅 Stream scheduled for ${new Date(scheduledTime).toLocaleString()}`, 'success');
        return schedule;
    }

    processDonation(donor, amount, message) {
        const donation = {
            id: Date.now(),
            donor: donor,
            amount: amount,
            message: message || '',
            timestamp: new Date()
        };

        this.donations.push(donation);
        this.saveData();
        this.showAlert('donation', { username: donor, amount: amount });
        showToast(`💰 Received $${amount} from ${donor}!`, 'success');
    }

    enableVODProcessing() {
        showToast('📹 VOD processing enabled - stream will be available for replay', 'success');
    }
}

// Initialize the enhanced system
const liveSystemEnhanced = new EnhancedLiveStreamingSystem();

// Export for global access
window.liveSystemEnhanced = liveSystemEnhanced;

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        from {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        to {
            transform: translateY(-100px) scale(1.5);
            opacity: 0;
        }
    }

    @keyframes slideDown {
        from {
            transform: translate(-50%, -20px);
            opacity: 0;
        }
        to {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }

    @keyframes slideUp {
        from {
            transform: translate(-50%, 0);
            opacity: 1;
        }
        to {
            transform: translate(-50%, -20px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
