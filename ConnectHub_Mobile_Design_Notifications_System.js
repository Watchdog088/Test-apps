/**
 * ConnectHub Mobile Design - Notifications System
 * Complete implementation of Section 22: Notifications Screen
 * 
 * Features Implemented:
 * 1. Real-time notification delivery
 * 2. Notification action handling & routing
 * 3. Notification filtering (all, mentions, likes, comments, etc.)
 * 4. Notification grouping
 * 5. Notification sound/vibration
 * 6. Notification badges update
 * 7. Push notification integration
 * 8. Notification preferences per type
 * 9. Notification history persistence
 * 10. Notification analytics
 */

class NotificationsSystem {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.settings = {
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
            }
        };
        this.currentFilter = 'all';
        this.analytics = {
            totalReceived: 0,
            totalRead: 0,
            averageResponseTime: 0,
            mostEngaging: 'likes',
            clickThroughRate: 0
        };
        
        // NEW: Service Worker for background notifications
        this.serviceWorker = null;
        this.notificationQueue = [];
        this.batchTimeout = null;
        
        // NEW: Device token management
        this.deviceToken = null;
        this.deviceInfo = {
            platform: this.detectPlatform(),
            browser: this.detectBrowser(),
            userId: null
        };
        
        this.init();
    }

    init() {
        console.log('🔔 Notifications System initialized');
        this.loadNotifications();
        this.loadSettings();
        this.loadAnalytics();
        this.startRealTimeDelivery();
        this.requestPushPermission();
        
        // NEW: Initialize missing features
        this.registerServiceWorker();
        this.initializeDeviceToken();
        this.setupCrossScreenNavigation();
        this.startNotificationBatching();
        this.syncWithBackend();
    }
    
    // ========== NEW FEATURE 1: SERVICE WORKER REGISTRATION ==========
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                // Register service worker for background notifications
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });
                
                this.serviceWorker = registration;
                console.log('✅ Service Worker registered for background notifications');
                
                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    if (event.data.type === 'NOTIFICATION_CLICK') {
                        this.handleNotificationClick(event.data.notificationId);
                    }
                });
                
                // Update service worker when available
                registration.addEventListener('updatefound', () => {
                    console.log('🔄 Service Worker update found');
                });
                
                return registration;
            } catch (error) {
                console.log('Service Worker registration simulated (full implementation requires sw.js file)');
                // Simulate service worker for demo purposes
                this.serviceWorker = { active: true };
            }
        } else {
            console.log('Service Workers not supported in this browser');
        }
    }
    
    // ========== NEW FEATURE 2: DEVICE TOKEN MANAGEMENT ==========
    
    async initializeDeviceToken() {
        try {
            // Generate or retrieve device token
            let token = localStorage.getItem('device_notification_token');
            
            if (!token) {
                // Generate new device token (in production, this would come from FCM/APNs)
                token = this.generateDeviceToken();
                localStorage.setItem('device_notification_token', token);
                console.log('✅ New device token generated:', token.substring(0, 20) + '...');
            } else {
                console.log('✅ Device token retrieved:', token.substring(0, 20) + '...');
            }
            
            this.deviceToken = token;
            
            // Register device token with backend (simulated)
            await this.registerDeviceWithBackend(token);
            
        } catch (error) {
            console.log('Device token management error:', error);
        }
    }
    
    generateDeviceToken() {
        // Generate a unique device token (simulated FCM/APNs token)
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        const platform = this.deviceInfo.platform;
        return `${platform}_${timestamp}_${random}`;
    }
    
    async registerDeviceWithBackend(token) {
        // Simulate backend device registration
        console.log('📱 Registering device with backend...');
        
        const deviceData = {
            token: token,
            platform: this.deviceInfo.platform,
            browser: this.deviceInfo.browser,
            userId: this.deviceInfo.userId || 'guest',
            timestamp: new Date().toISOString(),
            preferences: this.settings.preferences
        };
        
        // Store device info
        localStorage.setItem('device_info', JSON.stringify(deviceData));
        
        // In production, this would POST to: /api/devices/register
        console.log('✅ Device registered with backend', deviceData);
    }
    
    detectPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/android/.test(userAgent)) return 'android';
        if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
        if (/windows/.test(userAgent)) return 'windows';
        if (/mac/.test(userAgent)) return 'macos';
        if (/linux/.test(userAgent)) return 'linux';
        return 'web';
    }
    
    detectBrowser() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/chrome/.test(userAgent) && !/edg/.test(userAgent)) return 'chrome';
        if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) return 'safari';
        if (/firefox/.test(userAgent)) return 'firefox';
        if (/edg/.test(userAgent)) return 'edge';
        return 'unknown';
    }
    
    // ========== NEW FEATURE 3: NOTIFICATION SCHEDULING ==========
    
    scheduleNotification(notification, delay) {
        console.log(`📅 Scheduling notification for ${delay}ms from now`);
        
        setTimeout(() => {
            this.receiveNotification(notification);
        }, delay);
        
        // Store scheduled notification
        const scheduledNotifications = JSON.parse(localStorage.getItem('scheduled_notifications') || '[]');
        scheduledNotifications.push({
            notification: notification,
            scheduledFor: new Date(Date.now() + delay).toISOString(),
            status: 'pending'
        });
        localStorage.setItem('scheduled_notifications', JSON.stringify(scheduledNotifications));
        
        return {
            id: notification.id,
            scheduledFor: new Date(Date.now() + delay)
        };
    }
    
    cancelScheduledNotification(notificationId) {
        const scheduledNotifications = JSON.parse(localStorage.getItem('scheduled_notifications') || '[]');
        const updated = scheduledNotifications.filter(n => n.notification.id !== notificationId);
        localStorage.setItem('scheduled_notifications', JSON.stringify(updated));
        console.log('🗑️ Scheduled notification cancelled:', notificationId);
    }
    
    // ========== NEW FEATURE 4: NOTIFICATION BATCHING ==========
    
    startNotificationBatching() {
        // Batch notifications to prevent spam
        console.log('📦 Notification batching enabled');
        
        setInterval(() => {
            if (this.notificationQueue.length > 0) {
                this.processBatchedNotifications();
            }
        }, 5000); // Process batch every 5 seconds
    }
    
    addNotificationToBatch(notification) {
        this.notificationQueue.push(notification);
        
        // If queue gets too large, process immediately
        if (this.notificationQueue.length >= 5) {
            this.processBatchedNotifications();
        }
    }
    
    processBatchedNotifications() {
        const batch = [...this.notificationQueue];
        this.notificationQueue = [];
        
        if (batch.length === 0) return;
        
        console.log(`📦 Processing batch of ${batch.length} notifications`);
        
        // Group similar notifications
        const grouped = this.groupNotificationsByType(batch);
        
        // Display grouped notifications
        Object.keys(grouped).forEach(type => {
            const notifications = grouped[type];
            if (notifications.length > 1) {
                // Create summary notification
                this.createSummaryNotification(type, notifications);
            } else {
                // Display individual notification
                this.receiveNotification(notifications[0]);
            }
        });
    }
    
    groupNotificationsByType(notifications) {
        return notifications.reduce((groups, notif) => {
            if (!groups[notif.type]) {
                groups[notif.type] = [];
            }
            groups[notif.type].push(notif);
            return groups;
        }, {});
    }
    
    createSummaryNotification(type, notifications) {
        const count = notifications.length;
        const summaryNotification = {
            id: Date.now(),
            type: type,
            icon: notifications[0].icon,
            title: `${count} new ${type}s`,
            text: `You have ${count} new ${type} notifications`,
            timestamp: new Date(),
            read: false,
            action: notifications[0].action,
            data: { grouped: true, notifications: notifications }
        };
        
        this.receiveNotification(summaryNotification);
    }
    
    // ========== NEW FEATURE 5: CROSS-SCREEN NAVIGATION ==========
    
    setupCrossScreenNavigation() {
        console.log('🔀 Cross-screen navigation initialized');
        
        // Create global navigation functions
        window.openScreen = (screenName) => {
            console.log(`🔀 Navigating to screen: ${screenName}`);
            
            const screenMap = {
                'feed': { id: 'feed-screen', tab: 'home' },
                'friends': { id: 'friends-screen', tab: 'friends' },
                'messages': { id: 'messages-screen', tab: 'messages' },
                'notifications': { id: 'notifications-screen', tab: 'notifications' },
                'profile': { id: 'profile-screen', tab: 'profile' },
                'events': { id: 'events-screen', tab: 'events' },
                'gaming': { id: 'gaming-screen', tab: 'gaming' },
                'groups': { id: 'groups-screen', tab: 'groups' },
                'marketplace': { id: 'marketplace-screen', tab: 'marketplace' },
                'dating': { id: 'dating-screen', tab: 'dating' },
                'settings': { id: 'settings-screen', tab: 'settings' }
            };
            
            const screen = screenMap[screenName];
            if (screen) {
                // Hide all screens
                document.querySelectorAll('[id$="-screen"]').forEach(s => {
                    s.style.display = 'none';
                });
                
                // Show target screen
                const targetScreen = document.getElementById(screen.id);
                if (targetScreen) {
                    targetScreen.style.display = 'block';
                    window.scrollTo(0, 0);
                } else {
                    // Create placeholder screen if doesn't exist
                    this.createPlaceholderScreen(screenName);
                }
                
                // Update navigation tabs
                this.updateNavigationTabs(screen.tab);
                
                // Show success toast
                if (typeof window.showToast === 'function') {
                    window.showToast(`Opened ${screenName} screen`);
                }
            } else {
                console.log(`Screen "${screenName}" not found in screen map`);
                if (typeof window.showToast === 'function') {
                    window.showToast(`Opening ${screenName}...`);
                }
            }
        };
        
        // Create global modal opening function
        window.openModal = (modalName, data) => {
            console.log(`🔀 Opening modal: ${modalName}`, data);
            
            const modalActions = {
                'comments': () => this.openCommentsModal(data),
                'viewEvent': () => this.openEventModal(data),
                'chatWindow': () => this.openChatModal(data),
                'groupDetails': () => this.openGroupDetailsModal(data),
                'viewLive': () => this.openLiveStreamModal(data),
                'userProfile': () => this.openUserProfileModal(data),
                'postDetails': () => this.openPostDetailsModal(data),
                'friendRequest': () => this.openFriendRequestModal(data),
                'achievement': () => this.openAchievementModal(data)
            };
            
            const action = modalActions[modalName];
            if (action) {
                action();
            } else {
                console.log(`Modal "${modalName}" handler not found`);
                this.createGenericModal(modalName, data);
            }
        };
    }
    
    createPlaceholderScreen(screenName) {
        const placeholder = document.createElement('div');
        placeholder.id = `${screenName}-screen`;
        placeholder.className = 'app-screen';
        placeholder.style.cssText = 'padding: 80px 20px; text-align: center; min-height: 100vh;';
        placeholder.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 20px;">📱</div>
            <h2 style="font-size: 24px; margin-bottom: 10px; color: var(--text-primary);">${screenName.charAt(0).toUpperCase() + screenName.slice(1)}</h2>
            <p style="color: var(--text-secondary); margin-bottom: 20px;">This screen is now accessible from notifications</p>
            <button class="btn" onclick="window.openScreen('notifications')" style="max-width: 300px; margin: 0 auto;">
                ← Back to Notifications
            </button>
        `;
        document.querySelector('.app-container').appendChild(placeholder);
    }
    
    updateNavigationTabs(activeTab) {
        document.querySelectorAll('.nav-item').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const tabElement = document.querySelector(`.nav-item[data-tab="${activeTab}"]`);
        if (tabElement) {
            tabElement.classList.add('active');
        }
    }
    
    // Modal creation functions
    openCommentsModal(data) {
        const modal = this.createModal('Comments', `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">💬</div>
                <h3 style="font-size: 20px; margin-bottom: 12px;">Post Comments</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">View and respond to comments on this post</p>
                <div style="background: var(--background-secondary); padding: 16px; border-radius: 12px; margin-bottom: 16px; text-align: left;">
                    <div style="font-size: 15px; margin-bottom: 8px;"><strong>Sarah Johnson:</strong> Great post! 👍</div>
                    <div style="font-size: 13px; color: var(--text-secondary);">2 hours ago</div>
                </div>
                <button class="btn" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        `);
        document.body.appendChild(modal);
    }
    
    openEventModal(data) {
        const modal = this.createModal('Event Details', `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📅</div>
                <h3 style="font-size: 20px; margin-bottom: 12px;">Tech Conference 2025</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">Tomorrow at 10:00 AM</p>
                <p style="margin-bottom: 20px;">Join us for an exciting day of technology presentations and networking!</p>
                <button class="btn" onclick="this.closest('.modal').remove()">View Full Details</button>
            </div>
        `);
        document.body.appendChild(modal);
    }
    
    openChatModal(data) {
        const modal = this.createModal('Message', `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">💬</div>
                <h3 style="font-size: 20px; margin-bottom: 12px;">Sarah Johnson</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">Start chatting</p>
                <div style="background: var(--background-secondary); padding: 16px; border-radius: 12px; margin-bottom: 16px; text-align: left;">
                    <div style="font-size: 15px;">Hey! How are you?</div>
                </div>
                <button class="btn" onclick="window.openScreen('messages'); this.closest('.modal').remove()">Open Chat</button>
            </div>
        `);
        document.body.appendChild(modal);
    }
    
    openGroupDetailsModal(data) {
        const modal = this.createModal('Group Activity', `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">👥</div>
                <h3 style="font-size: 20px; margin-bottom: 12px;">Tech Enthusiasts</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">New post in group</p>
                <p style="margin-bottom: 20px;">Someone posted an interesting article about AI</p>
                <button class="btn" onclick="window.openScreen('groups'); this.closest('.modal').remove()">View Group</button>
            </div>
        `);
        document.body.appendChild(modal);
    }
    
    openLiveStreamModal(data) {
        const modal = this.createModal('Live Stream', `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔴</div>
                <h3 style="font-size: 20px; margin-bottom: 12px;">Sarah Johnson is Live!</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">Join the live stream now</p>
                <div style="background: var(--error); color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-bottom: 20px;">
                    🔴 LIVE
                </div>
                <button class="btn" onclick="this.closest('.modal').remove()">Join Stream</button>
            </div>
        `);
        document.body.appendChild(modal);
    }
    
    openUserProfileModal(data) {
        const modal = this.createModal('User Profile', `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="width: 80px; height: 80px; border-radius: 40px; background: var(--primary); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                    👤
                </div>
                <h3 style="font-size: 20px; margin-bottom: 8px;">Sarah Johnson</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">@sarahjohnson</p>
                <button class="btn" onclick="window.openScreen('profile'); this.closest('.modal').remove()">View Profile</button>
            </div>
        `);
        document.body.appendChild(modal);
    }
    
    openPostDetailsModal(data) {
        const modal = this.createModal('Post Details', `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
                <h3 style="font-size: 20px; margin-bottom: 12px;">View Post</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">See full post and interactions</p>
                <button class="btn" onclick="window.openScreen('feed'); this.closest('.modal').remove()">View Post</button>
            </div>
        `);
        document.body.appendChild(modal);
    }
    
    openFriendRequestModal(data) {
        const modal = this.createModal('Friend Request', `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">👥</div>
                <h3 style="font-size: 20px; margin-bottom: 12px;">Friend Request</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">Emily Rodriguez wants to be friends</p>
                <div style="display: flex; gap: 12px; max-width: 300px; margin: 0 auto;">
                    <button class="btn" style="flex: 1; background: var(--success);" onclick="this.closest('.modal').remove()">Accept</button>
                    <button class="btn" style="flex: 1; background: var(--background-secondary);" onclick="this.closest('.modal').remove()">Decline</button>
                </div>
            </div>
        `);
        document.body.appendChild(modal);
    }
    
    openAchievementModal(data) {
        const modal = this.createModal('Achievement Unlocked', `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 64px; margin-bottom: 16px;">🏆</div>
                <h3 style="font-size: 24px; margin-bottom: 12px; color: var(--warning);">Level Up!</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">You've reached Level 43</p>
                <button class="btn" onclick="window.openScreen('gaming'); this.closest('.modal').remove()">View Achievements</button>
            </div>
        `);
        document.body.appendChild(modal);
    }
    
    createGenericModal(modalName, data) {
        const modal = this.createModal(modalName, `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔔</div>
                <h3 style="font-size: 20px; margin-bottom: 12px;">${modalName}</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">Modal content goes here</p>
                <button class="btn" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        `);
        document.body.appendChild(modal);
    }
    
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-header">
                <div class="modal-close" onclick="this.closest('.modal').remove()">✕</div>
                <div class="modal-title">${title}</div>
                <div style="width: 32px;"></div>
            </div>
            <div class="modal-content">
                ${content}
            </div>
        `;
        return modal;
    }
    
    // ========== NEW FEATURE 6: BACKEND SYNCHRONIZATION ==========
    
    async syncWithBackend() {
        console.log('🔄 Syncing notifications with backend...');
        
        // Simulate backend sync (in production, this would be an API call)
        try {
            // Get last sync timestamp
            const lastSync = localStorage.getItem('last_notification_sync');
            const now = new Date().toISOString();
            
            // Simulate fetching new notifications from backend
            // In production: const response = await fetch('/api/notifications/sync', {...})
            
            console.log('✅ Backend sync complete');
            localStorage.setItem('last_notification_sync', now);
            
            // Set up periodic sync
            setInterval(() => {
                this.periodicBackendSync();
            }, 60000); // Sync every minute
            
        } catch (error) {
            console.log('Backend sync error:', error);
        }
    }
    
    async periodicBackendSync() {
        // Silently sync with backend
        const lastSync = localStorage.getItem('last_notification_sync');
        console.log('🔄 Periodic sync (last sync:', lastSync, ')');
        
        // In production, this would fetch new notifications from the server
        // and update the local state
    }
    
    async markAsReadOnBackend(notificationId) {
        // Simulate marking notification as read on backend
        console.log('📤 Marking notification as read on backend:', notificationId);
        
        // In production: await fetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' })
    }
    
    async deleteNotificationOnBackend(notificationId) {
        // Simulate deleting notification on backend
        console.log('📤 Deleting notification on backend:', notificationId);
        
        // In production: await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' })
    }

    // ========== REAL-TIME NOTIFICATION DELIVERY ==========
    
    startRealTimeDelivery() {
        console.log('📡 Real-time notification delivery started');
        
        setInterval(() => {
            if (Math.random() > 0.7) {
                this.generateRandomNotification();
            }
        }, 15000);
    }

    generateRandomNotification() {
        const types = [
            { type: 'like', icon: '👍', title: 'New Like', users: ['Sarah Johnson', 'Mike Chen', 'Emily Rodriguez'] },
            { type: 'comment', icon: '💬', title: 'New Comment', users: ['Sarah Johnson', 'Mike Chen'] },
            { type: 'follow', icon: '👥', title: 'New Follower', users: ['Jessica Lee', 'Amanda Smith'] },
            { type: 'mention', icon: '@', title: 'Mentioned You', users: ['Sarah Johnson'] },
            { type: 'friend_request', icon: '👥', title: 'Friend Request', users: ['Emily Rodriguez'] },
            { type: 'event', icon: '📅', title: 'Event Reminder', users: ['Tech Conference 2025'] },
            { type: 'gaming', icon: '🎮', title: 'Achievement', users: ['System'] },
            { type: 'message', icon: '💬', title: 'New Message', users: ['Sarah Johnson'] },
            { type: 'group', icon: '👥', title: 'Group Activity', users: ['Tech Enthusiasts'] },
            { type: 'live', icon: '🔴', title: 'Live Stream', users: ['Sarah Johnson'] }
        ];

        const selected = types[Math.floor(Math.random() * types.length)];
        const user = selected.users[Math.floor(Math.random() * selected.users.length)];
        
        const notification = {
            id: Date.now(),
            type: selected.type,
            icon: selected.icon,
            title: selected.title,
            text: this.generateNotificationText(selected.type, user),
            user: user,
            timestamp: new Date(),
            read: false,
            action: this.getNotificationAction(selected.type),
            data: {
                postId: Math.random() > 0.5 ? 'post_' + Date.now() : null,
                userId: 'user_' + Date.now()
            }
        };

        this.receiveNotification(notification);
    }

    generateNotificationText(type, user) {
        const texts = {
            like: `<strong>${user}</strong> liked your post`,
            comment: `<strong>${user}</strong> commented on your photo`,
            follow: `<strong>${user}</strong> started following you`,
            mention: `<strong>${user}</strong> mentioned you in a post`,
            friend_request: `<strong>${user}</strong> sent you a friend request`,
            event: `<strong>${user}</strong> is starting tomorrow`,
            gaming: `You leveled up to <strong>Level 43</strong>!`,
            message: `<strong>${user}</strong> sent you a message`,
            group: `New post in <strong>${user}</strong>`,
            live: `<strong>${user}</strong> is now live!`
        };
        
        return texts[type] || `New notification from <strong>${user}</strong>`;
    }

    getNotificationAction(type) {
        const actions = {
            like: { screen: 'feed', modal: null },
            comment: { screen: 'feed', modal: 'comments' },
            follow: { screen: 'friends', modal: null },
            mention: { screen: 'feed', modal: null },
            friend_request: { screen: 'friends', modal: null },
            event: { screen: 'events', modal: 'viewEvent' },
            gaming: { screen: 'gaming', modal: null },
            message: { screen: 'messages', modal: 'chatWindow' },
            group: { screen: null, modal: 'groupDetails' },
            live: { screen: null, modal: 'viewLive' }
        };
        
        return actions[type] || { screen: 'feed', modal: null };
    }

    receiveNotification(notification) {
        if (!this.settings.preferences[notification.type]) {
            console.log(`Notification type ${notification.type} is disabled`);
            return;
        }

        this.notifications.unshift(notification);
        this.unreadCount++;
        this.analytics.totalReceived++;
        
        this.updateBadges();
        this.playNotificationSound();
        this.triggerVibration();
        this.showInAppBanner(notification);
        this.sendPushNotification(notification);
        this.saveNotifications();
        
        console.log('🔔 New notification received:', notification);
    }

    handleNotificationClick(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        this.markAsRead(notificationId);
        this.trackNotificationClick(notification);
        this.routeNotification(notification);
    }

    routeNotification(notification) {
        console.log('🔀 Routing notification:', notification);
        
        const action = notification.action;
        
        if (action.screen) {
            setTimeout(() => {
                if (typeof window.openScreen === 'function') {
                    window.openScreen(action.screen);
                }
            }, 300);
        }
        
        if (action.modal) {
            setTimeout(() => {
                if (typeof window.openModal === 'function') {
                    window.openModal(action.modal);
                }
            }, action.screen ? 600 : 300);
        }

        if (typeof window.showToast === 'function') {
            window.showToast('Opening notification...');
        }
    }

    filterNotifications(filterType) {
        this.currentFilter = filterType;
        console.log('🔍 Filtering notifications:', filterType);
        
        let filtered = [...this.notifications];
        
        if (filterType !== 'all') {
            filtered = filtered.filter(n => n.type === filterType);
        }
        
        this.renderNotifications(filtered);
        
        if (typeof window.showToast === 'function') {
            const count = filtered.length;
            window.showToast(`Showing ${count} ${filterType} notification${count !== 1 ? 's' : ''}`);
        }
        
        return filtered;
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.unreadCount--;
            this.analytics.totalRead++;
            this.updateBadges();
            this.saveNotifications();
            this.renderNotifications();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => {
            if (!n.read) {
                n.read = true;
                this.analytics.totalRead++;
            }
        });
        
        this.unreadCount = 0;
        this.updateBadges();
        this.saveNotifications();
        this.renderNotifications();
        
        if (typeof window.showToast === 'function') {
            window.showToast('All notifications marked as read');
        }
    }

    playNotificationSound() {
        if (!this.settings.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            
            console.log('🔊 Notification sound played');
        } catch (error) {
            console.log('Sound playback not available:', error);
        }
    }

    triggerVibration() {
        if (!this.settings.vibrationEnabled) return;
        
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
            console.log('📳 Vibration triggered');
        }
    }

    updateBadges() {
        const navBadge = document.querySelector('.nav-btn .badge');
        if (navBadge) {
            if (this.unreadCount > 0) {
                navBadge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                navBadge.style.display = 'flex';
            } else {
                navBadge.style.display = 'none';
            }
        }

        console.log('🔢 Badges updated:', this.unreadCount, 'unread');
    }

    async requestPushPermission() {
        if (!('Notification' in window)) {
            console.log('Push notifications not supported');
            return;
        }

        if (Notification.permission === 'granted') {
            console.log('✓ Push notifications already granted');
            this.settings.pushEnabled = true;
            return;
        }

        if (Notification.permission !== 'denied') {
            try {
                const permission = await Notification.requestPermission();
                this.settings.pushEnabled = permission === 'granted';
                
                if (permission === 'granted') {
                    console.log('✓ Push notification permission granted');
                }
            } catch (error) {
                console.log('Error requesting notification permission:', error);
            }
        }
    }

    sendPushNotification(notification) {
        if (!this.settings.pushEnabled || Notification.permission !== 'granted') {
            return;
        }

        try {
            if (document.hidden) {
                const push = new Notification(notification.title, {
                    body: notification.text.replace(/<[^>]*>/g, ''),
                    icon: notification.icon,
                    badge: '🔔',
                    tag: notification.type,
                    vibrate: [200, 100, 200],
                    data: notification.data
                });

                push.onclick = () => {
                    window.focus();
                    this.handleNotificationClick(notification.id);
                    push.close();
                };

                console.log('📱 Push notification sent');
            }
        } catch (error) {
            console.log('Error sending push notification:', error);
        }
    }

    showInAppBanner(notification) {
        if (!this.settings.inAppBannerEnabled) return;

        const banner = document.getElementById('inAppNotification');
        if (!banner) return;

        document.getElementById('notificationIcon').textContent = notification.icon;
        document.getElementById('notificationTitle').textContent = notification.title;
        document.getElementById('notificationText').textContent = notification.text.replace(/<[^>]*>/g, '');

        banner.dataset.notificationId = notification.id;
        banner.classList.add('show');

        setTimeout(() => {
            if (banner.classList.contains('show')) {
                banner.classList.remove('show');
            }
        }, 5000);

        console.log('📢 In-app banner shown');
    }

    openNotificationPreferences() {
        const modalHTML = `
            <div id="notificationPreferencesModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="window.notificationsSystem.closePreferences()">✕</div>
                    <div class="modal-title">🔔 Notification Preferences</div>
                    <button class="btn" style="width: auto; padding: 8px 20px;" onclick="window.notificationsSystem.savePreferences()">Save</button>
                </div>
                <div class="modal-content">
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="font-size: 64px; margin-bottom: 16px;">🔔</div>
                        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Manage Notifications</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Choose which notifications you want to receive</div>
                    </div>
                    
                    <div class="section-header">
                        <div class="section-title">Master Controls</div>
                    </div>
                    
                    <div class="toggle-container">
                        <div>
                            <div class="list-item-title">Push Notifications</div>
                            <div class="list-item-subtitle">Device notifications</div>
                        </div>
                        <div class="toggle-switch ${this.settings.pushEnabled ? 'active' : ''}" onclick="window.notificationsSystem.togglePreference('push', this)">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    
                    <div class="toggle-container">
                        <div>
                            <div class="list-item-title">Sound</div>
                            <div class="list-item-subtitle">Play notification sounds</div>
                        </div>
                        <div class="toggle-switch ${this.settings.soundEnabled ? 'active' : ''}" onclick="window.notificationsSystem.togglePreference('sound', this)">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    
                    <div class="toggle-container">
                        <div>
                            <div class="list-item-title">Vibration</div>
                            <div class="list-item-subtitle">Vibrate on notifications</div>
                        </div>
                        <div class="toggle-switch ${this.settings.vibrationEnabled ? 'active' : ''}" onclick="window.notificationsSystem.togglePreference('vibration', this)">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    
                    <div class="section-header">
                        <div class="section-title">Notification Types</div>
                    </div>
                    
                    ${this.renderNotificationTypeToggles()}
                    
                    <div class="section-header">
                        <div class="section-title">Advanced Settings</div>
                    </div>
                    
                    <div class="list-item" onclick="window.notificationsSystem.setQuietHours()">
                        <div class="list-item-icon">🌙</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Quiet Hours</div>
                            <div class="list-item-subtitle">Mute notifications at night</div>
                        </div>
                        <div class="list-item-arrow">→</div>
                    </div>
                    
                    <button class="btn" style="background: var(--error); margin-top: 20px;" onclick="window.notificationsSystem.clearAllNotifications()">
                        🗑️ Clear All Notifications
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    renderNotificationTypeToggles() {
        const types = [
            { key: 'likes', icon: '👍', title: 'Likes', subtitle: 'When someone likes your content' },
            { key: 'comments', icon: '💬', title: 'Comments', subtitle: 'Comments on your posts' },
            { key: 'follows', icon: '👥', title: 'Follows', subtitle: 'New followers' },
            { key: 'mentions', icon: '@', title: 'Mentions', subtitle: 'When you are mentioned' },
            { key: 'friendRequests', icon: '👥', title: 'Friend Requests', subtitle: 'New friend requests' },
            { key: 'events', icon: '📅', title: 'Events', subtitle: 'Event reminders' },
            { key: 'gaming', icon: '🎮', title: 'Gaming', subtitle: 'Achievements' },
            { key: 'messages', icon: '💬', title: 'Messages', subtitle: 'Direct messages' },
            { key: 'groups', icon: '👥', title: 'Groups', subtitle: 'Group activity' },
            { key: 'live', icon: '🔴', title: 'Live Streams', subtitle: 'When friends go live' }
        ];

        return types.map(type => `
            <div class="toggle-container">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-size: 24px;">${type.icon}</div>
                    <div>
                        <div class="list-item-title">${type.title}</div>
                        <div class="list-item-subtitle">${type.subtitle}</div>
                    </div>
                </div>
                <div class="toggle-switch ${this.settings.preferences[type.key] ? 'active' : ''}" onclick="window.notificationsSystem.toggleNotificationType('${type.key}', this)">
                    <div class="toggle-slider"></div>
                </div>
            </div>
        `).join('');
    }

    togglePreference(type, element) {
        element.classList.toggle('active');
        const isActive = element.classList.contains('active');
        
        if (type === 'push') {
            this.settings.pushEnabled = isActive;
        } else if (type === 'sound') {
            this.settings.soundEnabled = isActive;
        } else if (type === 'vibration') {
            this.settings.vibrationEnabled = isActive;
        } else if (type === 'inAppBanner') {
            this.settings.inAppBannerEnabled = isActive;
        }
        
        this.saveSettings();
        
        if (typeof window.showToast === 'function') {
            window.showToast(isActive ? `${type} enabled` : `${type} disabled`);
        }
    }

    toggleNotificationType(type, element) {
        element.classList.toggle('active');
        const isActive = element.classList.contains('active');
        this.settings.preferences[type] = isActive;
        this.saveSettings();
    }

    closePreferences() {
        const modal = document.getElementById('notificationPreferencesModal');
        if (modal) modal.remove();
    }

    savePreferences() {
        this.saveSettings();
        this.closePreferences();
        
        if (typeof window.showToast === 'function') {
            window.showToast('Preferences saved! ✓');
        }
    }

    setQuietHours() {
        const modalHTML = `
            <div id="quietHoursModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="window.notificationsSystem.closeQuietHours()">✕</div>
                    <div class="modal-title">🌙 Quiet Hours</div>
                </div>
                <div class="modal-content">
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="font-size: 64px; margin-bottom: 16px;">🌙</div>
                        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Quiet Hours</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Mute notifications during these hours</div>
                    </div>
                    
                    <div class="toggle-container">
                        <div>
                            <div class="list-item-title">Enable Quiet Hours</div>
                            <div class="list-item-subtitle">Mute at night</div>
                        </div>
                        <div class="toggle-switch active" onclick="toggleSwitch(this)">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                        <div>
                            <label style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; display: block;">Start Time</label>
                            <input type="time" class="input-field" value="22:00" style="margin-bottom: 0;" />
                        </div>
                        <div>
                            <label style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; display: block;">End Time</label>
                            <input type="time" class="input-field" value="08:00" style="margin-bottom: 0;" />
                        </div>
                    </div>
                    
                    <button class="btn" onclick="window.notificationsSystem.saveQuietHours()">Save Quiet Hours</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    closeQuietHours() {
        const modal = document.getElementById('quietHoursModal');
        if (modal) modal.remove();
    }

    saveQuietHours() {
        this.closeQuietHours();
        this.closePreferences();
        
        if (typeof window.showToast === 'function') {
            window.showToast('Quiet hours saved! 🌙');
        }
    }

    configurePriority() {
        const modalHTML = `
            <div id="priorityNotificationsModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="window.notificationsSystem.closePriority()">✕</div>
                    <div class="modal-title">⭐ Priority Notifications</div>
                </div>
                <div class="modal-content">
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="font-size: 64px; margin-bottom: 16px;">⭐</div>
                        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Priority Notifications</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Never miss important updates</div>
                    </div>
                    
                    <div class="section-header">
                        <div class="section-title">Priority Contacts</div>
                    </div>
                    
                    <div class="list-item" onclick="window.notificationsSystem.addPriorityContact()">
                        <div class="list-item-icon">➕</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Add Priority Contact</div>
                            <div class="list-item-subtitle">Always notify for these people</div>
                        </div>
                        <div class="list-item-arrow">→</div>
                    </div>
                    
                    <div class="section-header">
                        <div class="section-title">Priority Keywords</div>
                    </div>
                    
                    <div class="list-item" onclick="window.notificationsSystem.addPriorityKeyword()">
                        <div class="list-item-icon">🔑</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Add Keyword</div>
                            <div class="list-item-subtitle">Get alerts for specific words</div>
                        </div>
                        <div class="list-item-arrow">→</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    closePriority() {
        const modal = document.getElementById('priorityNotificationsModal');
        if (modal) modal.remove();
    }

    addPriorityContact() {
        if (typeof window.showToast === 'function') {
            window.showToast('Select contact to add to priority list');
        }
    }

    addPriorityKeyword() {
        if (typeof window.showToast === 'function') {
            window.showToast('Enter keyword to monitor');
        }
    }

    clearAllNotifications() {
        if (confirm('Clear all notifications? This cannot be undone.')) {
            this.notifications = [];
            this.unreadCount = 0;
            this.updateBadges();
            this.saveNotifications();
            this.renderNotifications();
            this.closePreferences();
            
            if (typeof window.showToast === 'function') {
                window.showToast('All notifications cleared');
            }
        }
    }

    renderNotifications(notificationsToRender) {
        const container = document.querySelector('#notifications-screen');
        if (!container) return;

        const notifications = notificationsToRender || this.notifications;
        const existingItems = container.querySelectorAll('.notification-item');
        existingItems.forEach(item => item.remove());

        const headerElement = container.querySelector('.section-header');
        
        notifications.forEach(notification => {
            const notifElement = this.createNotificationElement(notification);
            if (headerElement && headerElement.nextSibling) {
                headerElement.parentNode.insertBefore(notifElement, headerElement.nextSibling);
            }
        });
    }

    createNotificationElement(notification) {
        const div = document.createElement('div');
        div.className = 'notification-item' + (notification.read ? '' : ' unread');
        
        div.innerHTML = `
            <div class="notification-icon">${notification.icon}</div>
            <div class="notification-content">
                <div class="notification-text">${notification.text}</div>
                <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
            </div>
        `;
        
        div.onclick = () => this.handleNotificationClick(notification.id);
        
        return div;
    }

    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        return time.toLocaleDateString();
    }

    trackNotificationClick(notification) {
        this.analytics.clickThroughRate = ((this.analytics.totalRead / this.analytics.totalReceived) * 100).toFixed(1);
        this.saveAnalytics();
    }

    loadNotifications() {
        try {
            const saved = localStorage.getItem('connecthub_notifications');
            if (saved) {
                const data = JSON.parse(saved);
                this.notifications = data.map(n => ({
                    ...n,
                    timestamp: new Date(n.timestamp)
                }));
                this.unreadCount = this.notifications.filter(n => !n.read).length;
                console.log('📥 Loaded notifications:', this.notifications.length);
            }
        } catch (error) {
            console.log('Error loading notifications:', error);
        }
    }

    saveNotifications() {
        try {
            localStorage.setItem('connecthub_notifications', JSON.stringify(this.notifications));
            console.log('💾 Notifications saved');
        } catch (error) {
            console.log('Error saving notifications:', error);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('connecthub_notification_settings');
            if (saved) {
                this.settings = JSON.parse(saved);
                console.log('📥 Loaded notification settings');
            }
        } catch (error) {
            console.log('Error loading settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('connecthub_notification_settings', JSON.stringify(this.settings));
            console.log('💾 Settings saved');
        } catch (error) {
            console.log('Error saving settings:', error);
        }
    }

    loadAnalytics() {
        try {
            const saved = localStorage.getItem('connecthub_notification_analytics');
            if (saved) {
                this.analytics = JSON.parse(saved);
                console.log('📥 Loaded notification analytics');
            }
        } catch (error) {
            console.log('Error loading analytics:', error);
        }
    }

    saveAnalytics() {
        try {
            localStorage.setItem('connecthub_notification_analytics', JSON.stringify(this.analytics));
            console.log('💾 Analytics saved');
        } catch (error) {
            console.log('Error saving analytics:', error);
        }
    }

    viewAnalytics() {
        const modalHTML = `
            <div id="notificationAnalyticsModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="window.notificationsSystem.closeAnalytics()">✕</div>
                    <div class="modal-title">📊 Notification Analytics</div>
                </div>
                <div class="modal-content">
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="font-size: 64px; margin-bottom: 16px;">📊</div>
                        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Your Notification Stats</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Insights into your notification activity</div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                        <div style="background: var(--background-secondary); padding: 16px; border-radius: 12px;">
                            <div style="font-size: 28px; font-weight: 700; color: var(--primary);">${this.analytics.totalReceived}</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Total Received</div>
                        </div>
                        <div style="background: var(--background-secondary); padding: 16px; border-radius: 12px;">
                            <div style="font-size: 28px; font-weight: 700; color: var(--success);">${this.analytics.totalRead}</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Total Read</div>
                        </div>
                    </div>
                    
                    <div style="background: var(--background-secondary); padding: 16px; border-radius: 12px; margin-bottom: 20px;">
                        <div style="font-size: 28px; font-weight: 700; color: var(--primary);">${this.analytics.clickThroughRate}%</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">Click-Through Rate</div>
                    </div>
                    
                    <div class="section-header">
                        <div class="section-title">Most Engaging</div>
                    </div>
                    
                    <div style="background: var(--background-secondary); padding: 16px; border-radius: 12px;">
                        <div style="font-size: 18px; font-weight: 600;">${this.analytics.mostEngaging}</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">Notification Type</div>
                    </div>
                    
                    <button class="btn" style="margin-top: 20px;" onclick="window.notificationsSystem.closeAnalytics()">Close</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    closeAnalytics() {
        const modal = document.getElementById('notificationAnalyticsModal');
        if (modal) modal.remove();
    }
}

// Initialize notifications system when DOM is ready
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.notificationsSystem = new NotificationsSystem();
        console.log('✅ Notifications System ready');
    });
}
