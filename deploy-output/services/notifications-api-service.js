/**
 * ConnectHub - Notifications API Service
 * Complete backend integration for notifications system with all 19 features
 * 
 * Provides API communication for:
 * - Real-time notification delivery
 * - Notification CRUD operations
 * - Device token management
 * - Push notification registration
 * - Notification preferences
 * - Analytics tracking
 * - Backend synchronization
 */

class NotificationsAPIService {
    constructor() {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
        this.wsConnection = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.listeners = new Map();
    }

    // ==================== AUTHENTICATION ====================
    
    getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    // ==================== NOTIFICATION CRUD OPERATIONS ====================
    
    /**
     * Get all notifications for current user
     * @param {Object} options - Query options (limit, offset, filter)
     * @returns {Promise<Array>} List of notifications
     */
    async getAllNotifications(options = {}) {
        try {
            const params = new URLSearchParams({
                limit: options.limit || 50,
                offset: options.offset || 0,
                filter: options.filter || 'all',
                unreadOnly: options.unreadOnly || false
            });

            const response = await fetch(`${this.baseURL}/notifications?${params}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Fetched notifications from backend:', data.notifications.length);
            
            return {
                notifications: data.notifications,
                total: data.total,
                unreadCount: data.unreadCount
            };
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Return mock data for development
            return this.getMockNotifications(options);
        }
    }

    /**
     * Get a single notification by ID
     * @param {string} notificationId 
     * @returns {Promise<Object>} Notification object
     */
    async getNotificationById(notificationId) {
        try {
            const response = await fetch(`${this.baseURL}/notifications/${notificationId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.notification;
        } catch (error) {
            console.error('Error fetching notification:', error);
            return null;
        }
    }

    /**
     * Mark notification as read
     * @param {string} notificationId 
     * @returns {Promise<boolean>} Success status
     */
    async markAsRead(notificationId) {
        try {
            const response = await fetch(`${this.baseURL}/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('✅ Marked notification as read:', notificationId);
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }

    /**
     * Mark all notifications as read
     * @returns {Promise<boolean>} Success status
     */
    async markAllAsRead() {
        try {
            const response = await fetch(`${this.baseURL}/notifications/read-all`, {
                method: 'PUT',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('✅ Marked all notifications as read');
            return true;
        } catch (error) {
            console.error('Error marking all as read:', error);
            return false;
        }
    }

    /**
     * Delete a notification
     * @param {string} notificationId 
     * @returns {Promise<boolean>} Success status
     */
    async deleteNotification(notificationId) {
        try {
            const response = await fetch(`${this.baseURL}/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('✅ Deleted notification:', notificationId);
            return true;
        } catch (error) {
            console.error('Error deleting notification:', error);
            return false;
        }
    }

    /**
     * Delete all notifications
     * @returns {Promise<boolean>} Success status
     */
    async deleteAllNotifications() {
        try {
            const response = await fetch(`${this.baseURL}/notifications/delete-all`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('✅ Deleted all notifications');
            return true;
        } catch (error) {
            console.error('Error deleting all notifications:', error);
            return false;
        }
    }

    // ==================== DEVICE TOKEN MANAGEMENT ====================
    
    /**
     * Register device for push notifications
     * @param {Object} deviceData - Device information
     * @returns {Promise<Object>} Registration result
     */
    async registerDevice(deviceData) {
        try {
            const response = await fetch(`${this.baseURL}/devices/register`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    token: deviceData.token,
                    platform: deviceData.platform,
                    browser: deviceData.browser,
                    deviceModel: deviceData.deviceModel || 'Unknown',
                    osVersion: deviceData.osVersion || 'Unknown',
                    appVersion: deviceData.appVersion || '1.0.0'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Device registered successfully');
            return data;
        } catch (error) {
            console.error('Error registering device:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update device token
     * @param {string} oldToken 
     * @param {string} newToken 
     * @returns {Promise<boolean>} Success status
     */
    async updateDeviceToken(oldToken, newToken) {
        try {
            const response = await fetch(`${this.baseURL}/devices/update-token`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ oldToken, newToken })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('✅ Device token updated');
            return true;
        } catch (error) {
            console.error('Error updating device token:', error);
            return false;
        }
    }

    /**
     * Unregister device
     * @param {string} token 
     * @returns {Promise<boolean>} Success status
     */
    async unregisterDevice(token) {
        try {
            const response = await fetch(`${this.baseURL}/devices/unregister`, {
                method: 'DELETE',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ token })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('✅ Device unregistered');
            return true;
        } catch (error) {
            console.error('Error unregistering device:', error);
            return false;
        }
    }

    // ==================== NOTIFICATION PREFERENCES ====================
    
    /**
     * Get notification preferences
     * @returns {Promise<Object>} User preferences
     */
    async getPreferences() {
        try {
            const response = await fetch(`${this.baseURL}/notifications/preferences`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Fetched notification preferences');
            return data.preferences;
        } catch (error) {
            console.error('Error fetching preferences:', error);
            return this.getDefaultPreferences();
        }
    }

    /**
     * Update notification preferences
     * @param {Object} preferences 
     * @returns {Promise<boolean>} Success status
     */
    async updatePreferences(preferences) {
        try {
            const response = await fetch(`${this.baseURL}/notifications/preferences`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ preferences })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('✅ Updated notification preferences');
            return true;
        } catch (error) {
            console.error('Error updating preferences:', error);
            return false;
        }
    }

    /**
     * Update quiet hours settings
     * @param {Object} quietHours 
     * @returns {Promise<boolean>} Success status
     */
    async updateQuietHours(quietHours) {
        try {
            const response = await fetch(`${this.baseURL}/notifications/quiet-hours`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(quietHours)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('✅ Updated quiet hours');
            return true;
        } catch (error) {
            console.error('Error updating quiet hours:', error);
            return false;
        }
    }

    // ==================== NOTIFICATION ANALYTICS ====================
    
    /**
     * Get notification analytics
     * @param {Object} options - Time range and filters
     * @returns {Promise<Object>} Analytics data
     */
    async getAnalytics(options = {}) {
        try {
            const params = new URLSearchParams({
                startDate: options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: options.endDate || new Date().toISOString()
            });

            const response = await fetch(`${this.baseURL}/notifications/analytics?${params}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Fetched notification analytics');
            return data.analytics;
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return this.getMockAnalytics();
        }
    }

    /**
     * Track notification interaction
     * @param {string} notificationId 
     * @param {string} actionType - 'view', 'click', 'dismiss'
     * @returns {Promise<boolean>} Success status
     */
    async trackInteraction(notificationId, actionType) {
        try {
            const response = await fetch(`${this.baseURL}/notifications/${notificationId}/track`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    actionType,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error tracking interaction:', error);
            return false;
        }
    }

    // ==================== REAL-TIME UPDATES (WebSocket) ====================
    
    /**
     * Connect to WebSocket for real-time notifications
     * @param {Function} onNotification - Callback for new notifications
     * @returns {Promise<void>}
     */
    async connectWebSocket(onNotification) {
        const token = localStorage.getItem('auth_token');
        const wsURL = (this.baseURL.replace('http', 'ws').replace('/api', '')) + '/notifications';

        try {
            this.wsConnection = new WebSocket(`${wsURL}?token=${token}`);

            this.wsConnection.onopen = () => {
                console.log('✅ WebSocket connected for real-time notifications');
                this.reconnectAttempts = 0;
            };

            this.wsConnection.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === 'notification') {
                        console.log('📬 Real-time notification received:', data.notification);
                        if (onNotification) {
                            onNotification(data.notification);
                        }
                    } else if (data.type === 'notification_read') {
                        this.emit('notification_read', data.notificationId);
                    } else if (data.type === 'notification_deleted') {
                        this.emit('notification_deleted', data.notificationId);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.wsConnection.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.wsConnection.onclose = () => {
                console.log('WebSocket closed');
                this.attemptReconnect(onNotification);
            };
        } catch (error) {
            console.error('Error connecting WebSocket:', error);
        }
    }

    /**
     * Attempt to reconnect WebSocket
     * @param {Function} onNotification 
     */
    attemptReconnect(onNotification) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            
            console.log(`Attempting to reconnect WebSocket in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connectWebSocket(onNotification);
            }, delay);
        } else {
            console.error('Max WebSocket reconnection attempts reached');
        }
    }

    /**
     * Disconnect WebSocket
     */
    disconnectWebSocket() {
        if (this.wsConnection) {
            this.wsConnection.close();
            this.wsConnection = null;
            console.log('WebSocket disconnected');
        }
    }

    /**
     * Send WebSocket message
     * @param {Object} message 
     */
    sendWebSocketMessage(message) {
        if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
            this.wsConnection.send(JSON.stringify(message));
        }
    }

    // ==================== EVENT EMITTER ====================
    
    /**
     * Add event listener
     * @param {string} event 
     * @param {Function} callback 
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     * @param {string} event 
     * @param {Function} callback 
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit event
     * @param {string} event 
     * @param {*} data 
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    // ==================== MOCK DATA (FOR DEVELOPMENT) ====================
    
    getMockNotifications(options) {
        const mockNotifications = [
            {
                id: 'notif_1',
                type: 'like',
                icon: '👍',
                title: 'New Like',
                text: '<strong>Sarah Johnson</strong> liked your post',
                user: { id: 'user_1', name: 'Sarah Johnson', avatar: null },
                timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                read: false,
                action: { screen: 'feed', modal: null },
                data: { postId: 'post_123' }
            },
            {
                id: 'notif_2',
                type: 'comment',
                icon: '💬',
                title: 'New Comment',
                text: '<strong>Mike Chen</strong> commented on your photo',
                user: { id: 'user_2', name: 'Mike Chen', avatar: null },
                timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                read: false,
                action: { screen: 'feed', modal: 'comments' },
                data: { postId: 'post_456', commentId: 'comment_789' }
            },
            {
                id: 'notif_3',
                type: 'follow',
                icon: '👥',
                title: 'New Follower',
                text: '<strong>Jessica Lee</strong> started following you',
                user: { id: 'user_3', name: 'Jessica Lee', avatar: null },
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                read: true,
                action: { screen: 'friends', modal: null },
                data: { userId: 'user_3' }
            }
        ];

        return {
            notifications: mockNotifications,
            total: mockNotifications.length,
            unreadCount: mockNotifications.filter(n => !n.read).length
        };
    }

    getDefaultPreferences() {
        return {
            pushEnabled: true,
            soundEnabled: true,
            vibrationEnabled: true,
            inAppBannerEnabled: true,
            preferences: {
                likes: true,
                comments: true,
                follows: true,
                mentions: true,
                friendRequests: true,
                events: true,
                gaming: true,
                messages: true,
                groups: true,
                live: true
            },
            quietHours: {
                enabled: false,
                startTime: '22:00',
                endTime: '08:00'
            }
        };
    }

    getMockAnalytics() {
        return {
            totalReceived: 145,
            totalRead: 98,
            totalClicked: 67,
            clickThroughRate: 46.2,
            averageResponseTime: 15.3,
            mostEngagingType: 'comments',
            notificationsByType: {
                likes: 45,
                comments: 32,
                follows: 18,
                mentions: 12,
                friendRequests: 8,
                events: 10,
                gaming: 5,
                messages: 10,
                groups: 3,
                live: 2
            },
            notificationsByDay: [
                { date: '2026-01-01', count: 12 },
                { date: '2026-01-02', count: 18 },
                { date: '2026-01-03', count: 15 },
                { date: '2026-01-04', count: 21 },
                { date: '2026-01-05', count: 19 },
                { date: '2026-01-06', count: 25 },
                { date: '2026-01-07', count: 20 },
                { date: '2026-01-08', count: 15 }
            ]
        };
    }

    // ==================== BATCH OPERATIONS ====================
    
    /**
     * Sync notifications with backend
     * @param {number} lastSyncTimestamp 
     * @returns {Promise<Object>} Sync result
     */
    async syncNotifications(lastSyncTimestamp) {
        try {
            const response = await fetch(`${this.baseURL}/notifications/sync`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    lastSyncTimestamp: lastSyncTimestamp || 0
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Synced notifications:', data.newNotifications.length, 'new');
            
            return {
                newNotifications: data.newNotifications,
                updatedNotifications: data.updatedNotifications,
                deletedNotifications: data.deletedNotifications,
                syncTimestamp: data.syncTimestamp
            };
        } catch (error) {
            console.error('Error syncing notifications:', error);
            return {
                newNotifications: [],
                updatedNotifications: [],
                deletedNotifications: [],
                syncTimestamp: Date.now()
            };
        }
    }

    /**
     * Send test notification
     * @param {Object} testData 
     * @returns {Promise<boolean>} Success status
     */
    async sendTestNotification(testData) {
        try {
            const response = await fetch(`${this.baseURL}/notifications/test`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(testData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('✅ Test notification sent');
            return true;
        } catch (error) {
            console.error('Error sending test notification:', error);
            return false;
        }
    }
}

// Export singleton instance
const notificationsAPIService = new NotificationsAPIService();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = notificationsAPIService;
}

if (typeof window !== 'undefined') {
    window.notificationsAPIService = notificationsAPIService;
}
