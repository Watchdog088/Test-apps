/**
 * ConnectHub Realtime Service
 * WebSocket-based real-time communication service
 * Phase 1: Core Infrastructure Implementation
 */

import authService from './auth-service.js';

class RealtimeService {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.eventHandlers = new Map();
        this.messageQueue = [];
        this.heartbeatInterval = null;
        
        // Auto-connect if authenticated
        if (authService.isAuthenticated()) {
            this.connect(authService.getToken());
        }
    }

    /**
     * Connect to WebSocket server
     */
    connect(token) {
        if (this.socket && this.connected) {
            console.log('Already connected to WebSocket');
            return;
        }

        try {
            const wsURL = window.location.hostname === 'localhost'
                ? 'ws://localhost:3001'
                : 'wss://api.connecthub.com';

            this.socket = new WebSocket(`${wsURL}?token=${token}`);
            
            this.socket.onopen = () => this.handleOpen();
            this.socket.onclose = () => this.handleClose();
            this.socket.onerror = (error) => this.handleError(error);
            this.socket.onmessage = (event) => this.handleMessage(event);
            
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.handleReconnect();
        }
    }

    /**
     * Handle connection open
     */
    handleOpen() {
        console.log('✓ Connected to WebSocket server');
        this.connected = true;
        this.reconnectAttempts = 0;
        
        // Start heartbeat
        this.startHeartbeat();
        
        // Send queued messages
        this.flushMessageQueue();
        
        // Notify handlers
        this.emit('connected');
        
        // Show notification
        if (window.showToast) {
            window.showToast('Connected to real-time services ✓');
        }
    }

    /**
     * Handle connection close
     */
    handleClose() {
        console.log('WebSocket connection closed');
        this.connected = false;
        
        // Stop heartbeat
        this.stopHeartbeat();
        
        // Notify handlers
        this.emit('disconnected');
        
        // Attempt reconnect
        this.handleReconnect();
    }

    /**
     * Handle connection error
     */
    handleError(error) {
        console.error('WebSocket error:', error);
        this.emit('error', error);
    }

    /**
     * Handle incoming message
     */
    handleMessage(event) {
        try {
            const message = JSON.parse(event.data);
            
            // Handle different message types
            switch (message.type) {
                case 'message':
                    this.handleNewMessage(message.data);
                    break;
                    
                case 'notification':
                    this.handleNotification(message.data);
                    break;
                    
                case 'match':
                    this.handleNewMatch(message.data);
                    break;
                    
                case 'typing':
                    this.handleTypingIndicator(message.data);
                    break;
                    
                case 'presence':
                    this.handlePresenceUpdate(message.data);
                    break;
                    
                case 'pong':
                    // Heartbeat response
                    break;
                    
                default:
                    console.log('Unknown message type:', message.type);
                    this.emit(message.type, message.data);
            }
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
        }
    }

    /**
     * Handle new message
     */
    handleNewMessage(data) {
        this.emit('newMessage', data);
        
        // Show in-app notification
        if (window.showInAppNotification && !this.isInMessagesScreen()) {
            window.showInAppNotification(
                '💬',
                'New Message',
                `${data.sender?.name || 'Someone'} sent you a message`,
                { type: 'message', data }
            );
        }
        
        // Update message badge
        this.updateMessageBadge();
    }

    /**
     * Handle notification
     */
    handleNotification(data) {
        this.emit('notification', data);
        
        // Show in-app notification
        if (window.showInAppNotification) {
            const icons = {
                'like': '👍',
                'comment': '💬',
                'follow': '👥',
                'mention': '@',
                'share': '🔄'
            };
            
            window.showInAppNotification(
                icons[data.type] || '🔔',
                data.title || 'New Notification',
                data.message || 'You have a new notification',
                { type: 'notification', data }
            );
        }
        
        // Update notification badge
        this.updateNotificationBadge();
    }

    /**
     * Handle new match (dating)
     */
    handleNewMatch(data) {
        this.emit('newMatch', data);
        
        // Show celebration notification
        if (window.showInAppNotification) {
            window.showInAppNotification(
                '💕',
                'New Match!',
                `You matched with ${data.user?.name || 'someone'}!`,
                { type: 'match', data }
            );
        }
        
        // Play sound if enabled
        this.playNotificationSound('match');
    }

    /**
     * Handle typing indicator
     */
    handleTypingIndicator(data) {
        this.emit('typing', data);
    }

    /**
     * Handle presence update
     */
    handlePresenceUpdate(data) {
        this.emit('presence', data);
    }

    /**
     * Send message through WebSocket
     */
    send(type, data) {
        const message = { type, data, timestamp: Date.now() };
        
        if (this.connected && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            // Queue message for later
            this.messageQueue.push(message);
        }
    }

    /**
     * Flush queued messages
     */
    flushMessageQueue() {
        while (this.messageQueue.length > 0 && this.connected) {
            const message = this.messageQueue.shift();
            this.socket.send(JSON.stringify(message));
        }
    }

    /**
     * Subscribe to conversation
     */
    subscribeToConversation(conversationId) {
        this.send('subscribe', { conversation: conversationId });
    }

    /**
     * Unsubscribe from conversation
     */
    unsubscribeFromConversation(conversationId) {
        this.send('unsubscribe', { conversation: conversationId });
    }

    /**
     * Send typing indicator
     */
    sendTyping(conversationId, isTyping) {
        this.send('typing', { conversationId, isTyping });
    }

    /**
     * Send presence update
     */
    updatePresence(status) {
        this.send('presence', { status });
    }

    /**
     * Start heartbeat to keep connection alive
     */
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.connected && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000); // Every 30 seconds
    }

    /**
     * Stop heartbeat
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    /**
     * Handle reconnection
     */
    handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnect attempts reached');
            this.emit('reconnectFailed');
            return;
        }

        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
        this.reconnectAttempts++;
        
        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        
        setTimeout(() => {
            const token = authService.getToken();
            if (token) {
                this.connect(token);
            }
        }, delay);
    }

    /**
     * Disconnect from WebSocket
     */
    disconnect() {
        this.stopHeartbeat();
        
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        
        this.connected = false;
        this.reconnectAttempts = 0;
        this.messageQueue = [];
    }

    /**
     * Add event handler
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    /**
     * Remove event handler
     */
    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            this.eventHandlers.set(
                event,
                handlers.filter(h => h !== handler)
            );
        }
    }

    /**
     * Emit event to handlers
     */
    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in ${event} handler:`, error);
                }
            });
        }
    }

    /**
     * Check if currently in messages screen
     */
    isInMessagesScreen() {
        const messagesScreen = document.getElementById('messages-screen');
        return messagesScreen && messagesScreen.classList.contains('active');
    }

    /**
     * Update message badge count
     */
    updateMessageBadge() {
        const badge = document.querySelector('.bottom-nav .nav-item:nth-child(3) .badge');
        if (badge) {
            const currentCount = parseInt(badge.textContent) || 0;
            badge.textContent = currentCount + 1;
            badge.style.display = 'flex';
        }
    }

    /**
     * Update notification badge count
     */
    updateNotificationBadge() {
        const badge = document.querySelector('.nav-btn .badge');
        if (badge) {
            const currentCount = parseInt(badge.textContent) || 0;
            badge.textContent = currentCount + 1;
            badge.style.display = 'flex';
        }
    }

    /**
     * Play notification sound
     */
    playNotificationSound(type) {
        try {
            // Check if sounds are enabled
            const soundsEnabled = localStorage.getItem('notifications_sounds') !== 'false';
            if (!soundsEnabled) return;

            // Create audio element
            const audio = new Audio();
            
            // Set sound based on type
            const sounds = {
                'message': '/sounds/message.mp3',
                'notification': '/sounds/notification.mp3',
                'match': '/sounds/match.mp3'
            };
            
            audio.src = sounds[type] || sounds['notification'];
            audio.volume = 0.5;
            audio.play().catch(error => {
                console.log('Could not play sound:', error);
            });
        } catch (error) {
            console.error('Sound playback error:', error);
        }
    }

    /**
     * Get connection status
     */
    isConnected() {
        return this.connected && this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    /**
     * Get connection state
     */
    getState() {
        if (!this.socket) return 'CLOSED';
        
        const states = {
            [WebSocket.CONNECTING]: 'CONNECTING',
            [WebSocket.OPEN]: 'OPEN',
            [WebSocket.CLOSING]: 'CLOSING',
            [WebSocket.CLOSED]: 'CLOSED'
        };
        
        return states[this.socket.readyState] || 'UNKNOWN';
    }
}

// Create and export global instance
const realtimeService = new RealtimeService();
window.realtimeService = realtimeService;

export default realtimeService;
