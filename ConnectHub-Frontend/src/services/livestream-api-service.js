/**
 * ConnectHub Live Streaming API Service
 * Comprehensive backend integration for all 18 live streaming features
 * Connects Enhanced Live Streaming System to backend APIs
 */

class LiveStreamAPIService {
    constructor() {
        this.baseURL = window.API_BASE_URL || 'http://localhost:3000/api';
        this.wsURL = window.WS_BASE_URL || 'ws://localhost:3000';
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.currentStreamId = null;
        this.eventHandlers = new Map();
    }

    /**
     * Initialize WebSocket connection for real-time streaming features
     */
    async initializeWebSocket(streamId) {
        try {
            this.currentStreamId = streamId;
            
            // Close existing connection
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.close();
            }

            // Get auth token
            const token = this.getAuthToken();
            
            // Establish WebSocket connection
            this.socket = new WebSocket(`${this.wsURL}/live/${streamId}?token=${token}`);
            
            this.socket.onopen = () => {
                console.log('✅ Live streaming WebSocket connected');
                this.reconnectAttempts = 0;
                this.emit('socket:connected', { streamId });
            };

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };

            this.socket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.emit('socket:error', { error });
            };

            this.socket.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                this.emit('socket:disconnected', {});
                this.attemptReconnect();
            };

            return true;
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
            return false;
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.currentStreamId) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            setTimeout(() => {
                this.initializeWebSocket(this.currentStreamId);
            }, 2000 * this.reconnectAttempts);
        }
    }

    handleWebSocketMessage(data) {
        const { type, payload } = data;
        
        switch (type) {
            case 'viewer:joined':
                this.emit('viewer:joined', payload);
                break;
            case 'viewer:left':
                this.emit('viewer:left', payload);
                break;
            case 'chat:message':
                this.emit('chat:message', payload);
                break;
            case 'reaction:received':
                this.emit('reaction:received', payload);
                break;
            case 'donation:received':
                this.emit('donation:received', payload);
                break;
            case 'alert:show':
                this.emit('alert:show', payload);
                break;
            case 'poll:vote':
                this.emit('poll:vote', payload);
                break;
            case 'health:update':
                this.emit('health:update', payload);
                break;
            case 'cohost:joined':
                this.emit('cohost:joined', payload);
                break;
            case 'stream:ended':
                this.emit('stream:ended', payload);
                break;
            default:
                console.log('Unknown WebSocket message type:', type);
        }
    }

    sendWebSocketMessage(type, payload) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type, payload }));
            return true;
        }
        return false;
    }

    // Event emitter methods
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => handler(data));
        }
    }

    getAuthToken() {
        return localStorage.getItem('authToken') || '';
    }

    async makeRequest(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        };

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error(`API Request failed [${endpoint}]:`, error);
            throw error;
        }
    }

    // ========================================
    // FEATURE 1: Stream Management (Go Live)
    // ========================================
    
    async createStream(streamData) {
        try {
            const response = await this.makeRequest('/livestream/create', {
                method: 'POST',
                body: JSON.stringify({
                    title: streamData.title,
                    description: streamData.description,
                    category: streamData.category,
                    quality: streamData.quality,
                    isPrivate: streamData.isPrivate || false,
                    scheduledTime: streamData.scheduledTime || null,
                    tags: streamData.tags || []
                })
            });

            this.currentStreamId = response.data.streamId;
            
            // Initialize WebSocket for this stream
            await this.initializeWebSocket(this.currentStreamId);
            
            return {
                success: true,
                streamId: response.data.streamId,
                streamKey: response.data.streamKey,
                rtmpUrl: response.data.rtmpUrl,
                message: 'Stream created successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async startStream(streamId) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/start`, {
                method: 'POST'
            });

            return {
                success: true,
                data: response.data,
                message: 'Stream started successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async endStream(streamId) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/end`, {
                method: 'POST'
            });

            // Close WebSocket connection
            if (this.socket) {
                this.socket.close();
                this.socket = null;
            }

            this.currentStreamId = null;

            return {
                success: true,
                data: response.data,
                message: 'Stream ended successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getStreamDetails(streamId) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ========================================
    // FEATURE 2-3: WebRTC & Stream Setup
    // ========================================

    async getStreamConfiguration(quality) {
        try {
            const response = await this.makeRequest(`/livestream/config?quality=${quality}`);
            return {
                success: true,
                config: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateStreamSettings(streamId, settings) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/settings`, {
                method: 'PATCH',
                body: JSON.stringify(settings)
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ========================================
    // FEATURE 4-7: Chat & Moderation
    // ========================================

    async sendChatMessage(streamId, message) {
        try {
            // Send via WebSocket for real-time
            const sent = this.sendWebSocketMessage('chat:send', {
                streamId,
                message,
                timestamp: new Date().toISOString()
            });

            if (!sent) {
                // Fallback to HTTP if WebSocket unavailable
                await this.makeRequest(`/livestream/${streamId}/chat`, {
                    method: 'POST',
                    body: JSON.stringify({ message })
                });
            }

            return {
                success: true,
                message: 'Message sent'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async deleteMessage(streamId, messageId) {
        try {
            await this.makeRequest(`/livestream/${streamId}/chat/${messageId}`, {
                method: 'DELETE'
            });

            // Notify via WebSocket
            this.sendWebSocketMessage('chat:delete', { messageId });

            return {
                success: true,
                message: 'Message deleted'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async timeoutUser(streamId, userId, duration = 300) {
        try {
            await this.makeRequest(`/livestream/${streamId}/moderation/timeout`, {
                method: 'POST',
                body: JSON.stringify({
                    userId,
                    duration
                })
            });

            return {
                success: true,
                message: 'User timed out'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async banUser(streamId, userId) {
        try {
            await this.makeRequest(`/livestream/${streamId}/moderation/ban`, {
                method: 'POST',
                body: JSON.stringify({ userId })
            });

            return {
                success: true,
                message: 'User banned'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async unbanUser(streamId, userId) {
        try {
            await this.makeRequest(`/livestream/${streamId}/moderation/unban`, {
                method: 'POST',
                body: JSON.stringify({ userId })
            });

            return {
                success: true,
                message: 'User unbanned'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async addModerator(streamId, userId) {
        try {
            await this.makeRequest(`/livestream/${streamId}/moderators`, {
                method: 'POST',
                body: JSON.stringify({ userId })
            });

            return {
                success: true,
                message: 'Moderator added'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ========================================
    // FEATURE 8: Donation Processing
    // ========================================

    async processDonation(streamId, donationData) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/donations`, {
                method: 'POST',
                body: JSON.stringify({
                    amount: donationData.amount,
                    currency: donationData.currency || 'USD',
                    message: donationData.message,
                    paymentMethodId: donationData.paymentMethodId
                })
            });

            // Trigger alert via WebSocket
            this.sendWebSocketMessage('donation:alert', {
                donor: donationData.donor,
                amount: donationData.amount,
                message: donationData.message
            });

            return {
                success: true,
                data: response.data,
                message: 'Donation processed'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getDonationHistory(streamId) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/donations`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ========================================
    // FEATURE 9: Stream Recording & VOD
    // ========================================

    async startRecording(streamId) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/recording/start`, {
                method: 'POST'
            });

            return {
                success: true,
                data: response.data,
                message: 'Recording started'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async stopRecording(streamId) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/recording/stop`, {
                method: 'POST'
            });

            return {
                success: true,
                data: response.data,
                message: 'Recording stopped'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getRecordings(userId) {
        try {
            const response = await this.makeRequest(`/livestream/recordings?userId=${userId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ========================================
    // FEATURE 10: Multi-Platform Streaming
    // ========================================

    async setupMultiPlatform(streamId, platforms) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/multiplatform`, {
                method: 'POST',
                body: JSON.stringify({ platforms })
            });

            return {
                success: true,
                data: response.data,
                message: 'Multi-platform streaming configured'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getPlatformConnections(userId) {
        try {
            const response = await this.makeRequest(`/user/${userId}/platform-connections`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ========================================
    // FEATURE 11: Analytics & Metrics
    // ========================================

    async getStreamAnalytics(streamId) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/analytics`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getRealtimeMetrics(streamId) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/metrics/realtime`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateViewerCount(streamId, count) {
        // Send via WebSocket for efficiency
        this.sendWebSocketMessage('metrics:viewers', {
            streamId,
            count,
            timestamp: Date.now()
        });
    }

    // ========================================
    // FEATURE 12-13: Engagement (Reactions, Polls)
    // ========================================

    async sendReaction(streamId, emoji) {
        try {
            // Send via WebSocket for real-time
            const sent = this.sendWebSocketMessage('reaction:send', {
                streamId,
                emoji,
                timestamp: Date.now()
            });

            if (!sent) {
                await this.makeRequest(`/livestream/${streamId}/reactions`, {
                    method: 'POST',
                    body: JSON.stringify({ emoji })
                });
            }

            return {
                success: true,
                message: 'Reaction sent'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async createPoll(streamId, pollData) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/polls`, {
                method: 'POST',
                body: JSON.stringify({
                    question: pollData.question,
                    options: pollData.options,
                    duration: pollData.duration || 300
                })
            });

            return {
                success: true,
                data: response.data,
                message: 'Poll created'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async votePoll(streamId, pollId, optionIndex) {
        try {
            // Send via WebSocket
            const sent = this.sendWebSocketMessage('poll:vote', {
                streamId,
                pollId,
                optionIndex
            });

            if (!sent) {
                await this.makeRequest(`/livestream/${streamId}/polls/${pollId}/vote`, {
                    method: 'POST',
                    body: JSON.stringify({ optionIndex })
                });
            }

            return {
                success: true,
                message: 'Vote recorded'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async endPoll(streamId, pollId) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/polls/${pollId}/end`, {
                method: 'POST'
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ========================================
    // FEATURE 14: Stream Scheduling
    // ========================================

    async scheduleStream(scheduleData) {
        try {
            const response = await this.makeRequest('/livestream/schedule', {
                method: 'POST',
                body: JSON.stringify({
                    title: scheduleData.title,
                    description: scheduleData.description,
                    scheduledTime: scheduleData.scheduledTime,
                    category: scheduleData.category,
                    notifyFollowers: scheduleData.notifyFollowers !== false
                })
            });

            return {
                success: true,
                data: response.data,
                message: 'Stream scheduled successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getScheduledStreams(userId) {
        try {
            const response = await this.makeRequest(`/livestream/scheduled?userId=${userId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async cancelScheduledStream(scheduleId) {
        try {
            await this.makeRequest(`/livestream/schedule/${scheduleId}`, {
                method: 'DELETE'
            });

            return {
                success: true,
                message: 'Scheduled stream cancelled'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ========================================
    // FEATURE 15-16: Stream Quality & Health
    // ========================================

    async updateStreamQuality(streamId, quality) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/quality`, {
                method: 'PATCH',
                body: JSON.stringify({ quality })
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async reportStreamHealth(streamId, healthData) {
        // Send via WebSocket for efficiency
        this.sendWebSocketMessage('health:report', {
            streamId,
            health: healthData.health,
            bitrate: healthData.bitrate,
            fps: healthData.fps,
            droppedFrames: healthData.droppedFrames,
            timestamp: Date.now()
        });
    }

    async activateBackupStream(streamId) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/backup/activate`, {
                method: 'POST'
            });

            return {
                success: true,
                data: response.data,
                message: 'Backup stream activated'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ========================================
    // FEATURE 17: Clip Creation
    // ========================================

    async createClip(streamId, clipData) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/clips`, {
                method: 'POST',
                body: JSON.stringify({
                    startTime: clipData.startTime,
                    duration: clipData.duration,
                    title: clipData.title
                })
            });

            return {
                success: true,
                data: response.data,
                message: 'Clip created successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getClips(streamId) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/clips`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async deleteClip(clipId) {
        try {
            await this.makeRequest(`/livestream/clips/${clipId}`, {
                method: 'DELETE'
            });

            return {
                success: true,
                message: 'Clip deleted'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ========================================
    // FEATURE 18: Co-Host Management
    // ========================================

    async inviteCoHost(streamId, userId) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/cohosts/invite`, {
                method: 'POST',
                body: JSON.stringify({ userId })
            });

            return {
                success: true,
                data: response.data,
                message: 'Co-host invitation sent'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async acceptCoHostInvite(streamId) {
        try {
            const response = await this.makeRequest(`/livestream/${streamId}/cohosts/accept`, {
                method: 'POST'
            });

            return {
                success: true,
                data: response.data,
                message: 'Co-host invitation accepted'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async removeCoHost(streamId, coHostId) {
        try {
            await this.makeRequest(`/livestream/${streamId}/cohosts/${coHostId}`, {
                method: 'DELETE'
            });

            return {
                success: true,
                message: 'Co-host removed'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ========================================
    // Additional Features
    // ========================================

    async getLiveStreams(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await this.makeRequest(`/livestream/browse?${queryParams}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async followStream(streamId) {
        try {
            await this.makeRequest(`/livestream/${streamId}/follow`, {
                method: 'POST'
            });

            return {
                success: true,
                message: 'Following stream'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async unfollowStream(streamId) {
        try {
            await this.makeRequest(`/livestream/${streamId}/unfollow`, {
                method: 'POST'
            });

            return {
                success: true,
                message: 'Unfollowed stream'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async reportStream(streamId, reason) {
        try {
            await this.makeRequest(`/livestream/${streamId}/report`, {
                method: 'POST',
                body: JSON.stringify({ reason })
            });

            return {
                success: true,
                message: 'Stream reported'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Cleanup
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.eventHandlers.clear();
    }
}

// Create singleton instance
const liveStreamAPI = new LiveStreamAPIService();

// Export for global access
window.liveStreamAPI = liveStreamAPI;

// Export as module if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LiveStreamAPIService;
}
