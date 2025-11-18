/**
 * ConnectHub Live Streaming System
 * Complete implementation of all live streaming features
 */

class LiveStreamingSystem {
    constructor() {
        this.isLive = false;
        this.streamData = {
            title: '',
            description: '',
            category: 'general',
            quality: '720p',
            viewerCount: 0,
            duration: 0,
            reactions: {},
            coHosts: [],
            moderators: []
        };
        this.chatMessages = [];
        this.polls = [];
        this.savedLives = [];
        this.streamSettings = {
            camera: true,
            microphone: true,
            screenShare: false,
            recording: false,
            autoSave: true,
            notifications: true
        };
        this.durationInterval = null;
        this.viewerInterval = null;
        
        this.init();
    }

    init() {
        // Load saved data
        this.loadSavedData();
        
        // Initialize mock data for demonstration
        this.initMockData();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    loadSavedData() {
        try {
            const saved = localStorage.getItem('liveStreamingData');
            if (saved) {
                const data = JSON.parse(saved);
                this.savedLives = data.savedLives || [];
                this.streamSettings = data.settings || this.streamSettings;
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    saveData() {
        try {
            const data = {
                savedLives: this.savedLives,
                settings: this.streamSettings,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('liveStreamingData', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    initMockData() {
        // Initialize sample live streams
        this.mockLiveStreams = [
            {
                id: 'stream_001',
                title: 'Gaming Session: Epic Adventures',
                author: 'ProGamer_88',
                category: 'Gaming',
                viewers: 1234,
                duration: '2:15:30',
                thumbnail: '🎮',
                isLive: true
            },
            {
                id: 'stream_002',
                title: 'Cooking Tutorial: Italian Pasta',
                author: 'ChefMaster',
                category: 'Cooking',
                viewers: 856,
                duration: '1:45:20',
                thumbnail: '🍳',
                isLive: true
            },
            {
                id: 'stream_003',
                title: 'Music Performance Live',
                author: 'MusicWave',
                category: 'Music',
                viewers: 2341,
                duration: '0:55:10',
                thumbnail: '🎵',
                isLive: true
            },
            {
                id: 'stream_004',
                title: 'Tech Talk: AI & Future',
                author: 'TechGuru_Pro',
                category: 'Technology',
                viewers: 567,
                duration: '1:20:45',
                thumbnail: '💻',
                isLive: true
            }
        ];

        // Initialize sample saved lives
        if (this.savedLives.length === 0) {
            this.savedLives = [
                {
                    id: 'saved_001',
                    title: 'My First Live Stream',
                    date: '2024-01-15',
                    duration: '45:30',
                    views: 234,
                    thumbnail: '🎥'
                },
                {
                    id: 'saved_002',
                    title: 'Q&A Session with Fans',
                    date: '2024-01-20',
                    duration: '1:15:20',
                    views: 567,
                    thumbnail: '❓'
                }
            ];
        }
    }

    setupEventListeners() {
        // Will be called from HTML
        console.log('Live Streaming System initialized');
    }

    // Stream Setup Functions
    async startStreamSetup() {
        // Request camera and microphone permissions
        try {
            const permissions = await this.requestMediaPermissions();
            if (permissions) {
                showToast('Camera & Microphone access granted', 'success');
                return true;
            }
        } catch (error) {
            showToast('Unable to access camera/microphone', 'error');
            return false;
        }
    }

    async requestMediaPermissions() {
        // Simulate permission request (in real app, would use navigator.mediaDevices.getUserMedia)
        return new Promise((resolve) => {
            setTimeout(() => {
                this.streamSettings.camera = true;
                this.streamSettings.microphone = true;
                resolve(true);
            }, 1000);
        });
    }

    selectQuality(quality) {
        this.streamData.quality = quality;
        showToast(`Stream quality set to ${quality}`, 'info');
    }

    // Go Live Function
    async goLive(streamInfo) {
        if (this.isLive) {
            showToast('Already streaming!', 'warning');
            return;
        }

        // Validate stream info
        if (!streamInfo.title || streamInfo.title.trim() === '') {
            showToast('Please enter a stream title', 'error');
            return;
        }

        // Start stream
        this.isLive = true;
        this.streamData = {
            ...this.streamData,
            ...streamInfo,
            startTime: new Date(),
            viewerCount: 0,
            duration: 0
        };

        // Start counters
        this.startDurationCounter();
        this.startViewerSimulation();

        // Send notification
        if (this.streamSettings.notifications) {
            this.sendLiveNotification();
        }

        // Open live dashboard
        openModal('live-dashboard');
        showToast('🔴 You are now LIVE!', 'success');
    }

    // Stream Control Functions
    toggleCamera() {
        this.streamSettings.camera = !this.streamSettings.camera;
        showToast(this.streamSettings.camera ? 'Camera ON' : 'Camera OFF', 'info');
        return this.streamSettings.camera;
    }

    toggleMicrophone() {
        this.streamSettings.microphone = !this.streamSettings.microphone;
        showToast(this.streamSettings.microphone ? 'Microphone ON' : 'Microphone OFF', 'info');
        return this.streamSettings.microphone;
    }

    toggleScreenShare() {
        this.streamSettings.screenShare = !this.streamSettings.screenShare;
        showToast(this.streamSettings.screenShare ? 'Screen Sharing Started' : 'Screen Sharing Stopped', 'info');
        return this.streamSettings.screenShare;
    }

    toggleRecording() {
        this.streamSettings.recording = !this.streamSettings.recording;
        showToast(this.streamSettings.recording ? '🔴 Recording Started' : '⏹️ Recording Stopped', 'info');
        return this.streamSettings.recording;
    }

    // Duration Counter
    startDurationCounter() {
        this.durationInterval = setInterval(() => {
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

    // Viewer Count Simulation
    startViewerSimulation() {
        // Simulate viewers joining/leaving
        this.viewerInterval = setInterval(() => {
            const change = Math.floor(Math.random() * 10) - 3; // Random change between -3 and +6
            this.streamData.viewerCount = Math.max(0, this.streamData.viewerCount + change);
            this.updateViewerDisplay();
        }, 5000);
    }

    updateViewerDisplay() {
        const viewerElement = document.getElementById('live-viewers');
        if (viewerElement) {
            viewerElement.textContent = this.formatNumber(this.streamData.viewerCount);
        }
    }

    // Chat Functions
    sendChatMessage(message) {
        if (!message || message.trim() === '') return;

        const chatMessage = {
            id: Date.now(),
            username: 'You',
            message: message.trim(),
            timestamp: new Date(),
            isOwn: true
        };

        this.chatMessages.push(chatMessage);
        this.displayChatMessage(chatMessage);
        
        // Simulate responses
        this.simulateChatResponses();
    }

    displayChatMessage(message) {
        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.innerHTML = `
            <div class="chat-username">${message.username}</div>
            <div>${message.message}</div>
        `;

        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    simulateChatResponses() {
        const responses = [
            { username: 'User123', message: 'Great stream!' },
            { username: 'Viewer_456', message: 'Love this content 😍' },
            { username: 'Fan789', message: 'Keep it up!' },
            { username: 'Supporter', message: 'Amazing!' }
        ];

        setTimeout(() => {
            const response = responses[Math.floor(Math.random() * responses.length)];
            const chatMessage = {
                id: Date.now(),
                username: response.username,
                message: response.message,
                timestamp: new Date(),
                isOwn: false
            };
            this.chatMessages.push(chatMessage);
            this.displayChatMessage(chatMessage);
        }, 2000 + Math.random() * 3000);
    }

    // Reaction Functions
    sendReaction(emoji) {
        if (!this.streamData.reactions[emoji]) {
            this.streamData.reactions[emoji] = 0;
        }
        this.streamData.reactions[emoji]++;
        
        // Animate reaction
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

    // Co-Host Functions
    addCoHost(userId) {
        const coHost = {
            id: userId,
            name: `User_${userId}`,
            avatar: '👤',
            status: 'invited',
            joinedAt: null
        };
        
        this.streamData.coHosts.push(coHost);
        showToast(`Co-host invitation sent to ${coHost.name}`, 'success');
        this.updateCoHostsList();
    }

    acceptCoHost(coHostId) {
        const coHost = this.streamData.coHosts.find(h => h.id === coHostId);
        if (coHost) {
            coHost.status = 'active';
            coHost.joinedAt = new Date();
            showToast(`${coHost.name} joined as co-host!`, 'success');
            this.updateCoHostsList();
        }
    }

    removeCoHost(coHostId) {
        this.streamData.coHosts = this.streamData.coHosts.filter(h => h.id !== coHostId);
        showToast('Co-host removed', 'info');
        this.updateCoHostsList();
    }

    updateCoHostsList() {
        const listContainer = document.getElementById('cohost-list');
        if (!listContainer) return;

        listContainer.innerHTML = this.streamData.coHosts.map(coHost => `
            <div class="cohost-item">
                <div class="cohost-avatar">${coHost.avatar}</div>
                <div class="cohost-info">
                    <div class="cohost-name">${coHost.name}</div>
                    <div class="cohost-status">${coHost.status}</div>
                </div>
                <div class="cohost-actions">
                    <div class="icon-btn" onclick="liveSystem.removeCoHost('${coHost.id}')">🚫</div>
                </div>
            </div>
        `).join('');
    }

    // Poll/Q&A Functions
    createPoll(question, options) {
        const poll = {
            id: Date.now(),
            question: question,
            options: options.map(opt => ({
                text: opt,
                votes: 0
            })),
            totalVotes: 0,
            createdAt: new Date()
        };

        this.polls.push(poll);
        showToast('Poll created!', 'success');
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
                        <div class="poll-option" onclick="liveSystem.votePoll(${poll.id}, ${index})">
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
            showToast('Vote recorded!', 'success');
        }
    }

    // Analytics Functions
    getStreamAnalytics() {
        return {
            duration: this.updateDurationDisplay(),
            peakViewers: Math.max(...this.viewerHistory || [this.streamData.viewerCount]),
            avgViewers: this.calculateAverageViewers(),
            totalReactions: Object.values(this.streamData.reactions).reduce((a, b) => a + b, 0),
            chatMessages: this.chatMessages.length,
            engagement: this.calculateEngagement()
        };
    }

    calculateAverageViewers() {
        if (!this.viewerHistory || this.viewerHistory.length === 0) {
            return this.streamData.viewerCount;
        }
        const sum = this.viewerHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.viewerHistory.length);
    }

    calculateEngagement() {
        const totalInteractions = Object.values(this.streamData.reactions).reduce((a, b) => a + b, 0) + this.chatMessages.length;
        const avgViewers = this.calculateAverageViewers();
        if (avgViewers === 0) return 0;
        return ((totalInteractions / avgViewers) * 100).toFixed(1);
    }

    // End Stream Functions
    async endStream() {
        if (!this.isLive) {
            showToast('No active stream', 'warning');
            return;
        }

        const confirmed = confirm('Are you sure you want to end the stream?');
        if (!confirmed) return;

        // Stop counters
        if (this.durationInterval) clearInterval(this.durationInterval);
        if (this.viewerInterval) clearInterval(this.viewerInterval);

        // Get final analytics
        const analytics = this.getStreamAnalytics();

        // Save stream if auto-save is enabled
        if (this.streamSettings.autoSave || this.streamSettings.recording) {
            this.saveStreamRecording();
        }

        // Show end screen
        this.showEndScreen(analytics);

        // Reset stream data
        this.isLive = false;
        this.streamData.duration = 0;
        this.streamData.viewerCount = 0;
        this.chatMessages = [];
        this.polls = [];

        showToast('Stream ended', 'info');
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
                        <button class="btn" onclick="liveSystem.shareStream()">Share Stream</button>
                        <button class="btn btn-secondary" onclick="closeModal('stream-end-screen'); openScreen('live');" style="margin-top: 12px;">Back to Live</button>
                    </div>
                </div>
            `;
        }
    }

    saveStreamRecording() {
        const recording = {
            id: Date.now(),
            title: this.streamData.title,
            date: new Date().toISOString().split('T')[0],
            duration: this.updateDurationDisplay(),
            views: this.streamData.viewerCount,
            thumbnail: '🎥'
        };

        this.savedLives.unshift(recording);
        this.saveData();
        showToast('Stream saved successfully!', 'success');
    }

    // Share Functions
    shareStream() {
        const shareText = `I just finished streaming "${this.streamData.title}" on ConnectHub! 🔴`;
        showToast('Share options opened', 'info');
        // In real app, would use Web Share API or show share modal
    }

    // Notification Functions
    sendLiveNotification() {
        // In real app, would send push notifications to followers
        console.log('Sending live notification to followers');
    }

    // Helper Functions
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Get Methods for Display
    getMockLiveStreams() {
        return this.mockLiveStreams;
    }

    getSavedLives() {
        return this.savedLives;
    }

    getStreamSettings() {
        return this.streamSettings;
    }

    updateSettings(newSettings) {
        this.streamSettings = { ...this.streamSettings, ...newSettings };
        this.saveData();
        showToast('Settings updated', 'success');
    }
}

// Initialize the system
const liveSystem = new LiveStreamingSystem();

// Export for global access
window.liveSystem = liveSystem;
