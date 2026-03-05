/**
 * LynkApp - OneSignal Push Notifications Service
 * FREE unlimited push notifications for web & mobile
 * Features: Push notifications, in-app messages, email, SMS
 */

class OneSignalService {
    constructor() {
        // Your OneSignal App ID (create at https://onesignal.com)
        this.appId = 'YOUR_ONESIGNAL_APP_ID';
        this.initialized = false;
        this.subscribed = false;
        
        // Statistics tracking
        this.stats = {
            totalSent: 0,
            totalDelivered: 0,
            totalClicked: 0,
            subscribed: 0,
            lastNotification: null
        };
    }

    /**
     * Initialize OneSignal
     * Call this on app load
     */
    async initialize() {
        if (this.initialized) {
            console.log('OneSignal already initialized');
            return;
        }

        try {
            // Load OneSignal SDK
            if (!window.OneSignal) {
                await this.loadScript();
            }

            // Initialize OneSignal
            window.OneSignal = window.OneSignal || [];
            window.OneSignal.push(() => {
                window.OneSignal.init({
                    appId: this.appId,
                    safari_web_id: 'web.onesignal.auto.YOUR_SAFARI_WEB_ID',
                    notifyButton: {
                        enable: true,
                        size: 'medium',
                        theme: 'default',
                        position: 'bottom-right',
                        offset: {
                            bottom: '20px',
                            right: '20px'
                        },
                        text: {
                            'tip.state.unsubscribed': 'Subscribe to notifications',
                            'tip.state.subscribed': "You're subscribed to notifications",
                            'tip.state.blocked': "You've blocked notifications",
                            'message.prenotify': 'Click to subscribe to notifications',
                            'message.action.subscribed': "Thanks for subscribing!",
                            'message.action.resubscribed': "You're subscribed to notifications",
                            'message.action.unsubscribed': "You won't receive notifications again",
                            'dialog.main.title': 'Manage Site Notifications',
                            'dialog.main.button.subscribe': 'SUBSCRIBE',
                            'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
                            'dialog.blocked.title': 'Unblock Notifications',
                            'dialog.blocked.message': "Follow these instructions to allow notifications:"
                        }
                    },
                    welcomeNotification: {
                        title: "LynkApp",
                        message: "Thanks for subscribing! You'll get updates about your friends, messages, and more.",
                        url: "" // Optional redirect URL
                    },
                    promptOptions: {
                        slidedown: {
                            enabled: true,
                            actionMessage: "We'd like to show you notifications for the latest updates.",
                            acceptButtonText: "ALLOW",
                            cancelButtonText: "NO THANKS",
                            categories: {
                                tags: [
                                    {
                                        tag: "messages",
                                        label: "New Messages"
                                    },
                                    {
                                        tag: "friend_requests",
                                        label: "Friend Requests"
                                    },
                                    {
                                        tag: "likes",
                                        label: "Likes & Comments"
                                    },
                                    {
                                        tag: "trending",
                                        label: "Trending Content"
                                    }
                                ]
                            }
                        }
                    }
                });
            });

            // Set up event listeners
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('✅ OneSignal initialized successfully');
            
            // Load saved stats
            this.loadStats();
            
            return { success: true };
        } catch (error) {
            console.error('OneSignal initialization error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load OneSignal SDK script
     */
    loadScript() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Set up OneSignal event listeners
     */
    setupEventListeners() {
        window.OneSignal.push(() => {
            // Subscription changed
            window.OneSignal.on('subscriptionChange', (isSubscribed) => {
                console.log('Subscription changed:', isSubscribed);
                this.subscribed = isSubscribed;
                if (isSubscribed) {
                    this.stats.subscribed++;
                    this.saveStats();
                }
            });

            // Notification displayed
            window.OneSignal.on('notificationDisplay', (event) => {
                console.log('Notification displayed:', event);
                this.stats.totalDelivered++;
                this.stats.lastNotification = new Date().toISOString();
                this.saveStats();
            });

            // Notification clicked
            window.OneSignal.on('notificationDismiss', (event) => {
                console.log('Notification dismissed:', event);
            });
        });
    }

    /**
     * Subscribe user to notifications
     */
    async subscribe() {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            await window.OneSignal.push(() => {
                window.OneSignal.showSlidedownPrompt();
            });

            return { success: true };
        } catch (error) {
            console.error('Subscribe error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Unsubscribe user from notifications
     */
    async unsubscribe() {
        try {
            await window.OneSignal.push(() => {
                window.OneSignal.setSubscription(false);
            });

            return { success: true };
        } catch (error) {
            console.error('Unsubscribe error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get subscription status
     */
    async isSubscribed() {
        try {
            return await window.OneSignal.push(() => {
                return window.OneSignal.isPushNotificationsEnabled();
            });
        } catch (error) {
            console.error('Error checking subscription:', error);
            return false;
        }
    }

    /**
     * Get user ID (Player ID)
     */
    async getUserId() {
        try {
            return await window.OneSignal.push(() => {
                return window.OneSignal.getUserId();
            });
        } catch (error) {
            console.error('Error getting user ID:', error);
            return null;
        }
    }

    /**
     * Send tags to OneSignal (for segmentation)
     * @param {Object} tags - Key-value pairs of tags
     */
    async sendTags(tags) {
        try {
            await window.OneSignal.push(() => {
                window.OneSignal.sendTags(tags);
            });

            return { success: true };
        } catch (error) {
            console.error('Error sending tags:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Set user email for email notifications
     * @param {string} email - User's email address
     */
    async setEmail(email) {
        try {
            await window.OneSignal.push(() => {
                window.OneSignal.setEmail(email);
            });

            return { success: true };
        } catch (error) {
            console.error('Error setting email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Set user SMS number
     * @param {string} phoneNumber - User's phone number
     */
    async setSMS(phoneNumber) {
        try {
            await window.OneSignal.push(() => {
                window.OneSignal.setSMSNumber(phoneNumber);
            });

            return { success: true };
        } catch (error) {
            console.error('Error setting SMS:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send a notification (requires backend API call)
     * This is a helper to structure the notification data
     * @param {Object} notification - Notification data
     */
    createNotificationPayload(notification) {
        const {
            title = 'LynkApp',
            message,
            url = window.location.origin,
            icon = '/icon-192.png',
            image = null,
            data = {},
            buttons = [],
            segments = ['All']
        } = notification;

        return {
            app_id: this.appId,
            headings: { en: title },
            contents: { en: message },
            url: url,
            chrome_web_icon: icon,
            firefox_icon: icon,
            chrome_web_image: image,
            data: data,
            buttons: buttons,
            included_segments: segments
        };
    }

    /**
     * Get notification statistics
     */
    getStats() {
        return {
            ...this.stats,
            isSubscribed: this.subscribed,
            isInitialized: this.initialized
        };
    }

    /**
     * Save stats to localStorage
     */
    saveStats() {
        try {
            localStorage.setItem('onesignal_stats', JSON.stringify(this.stats));
        } catch (error) {
            console.error('Failed to save OneSignal stats:', error);
        }
    }

    /**
     * Load stats from localStorage
     */
    loadStats() {
        try {
            const saved = localStorage.getItem('onesignal_stats');
            if (saved) {
                this.stats = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load OneSignal stats:', error);
        }
    }

    /**
     * Test OneSignal by showing notification bell
     */
    async showPrompt() {
        try {
            await window.OneSignal.push(() => {
                window.OneSignal.showSlidedownPrompt();
            });
            return { success: true };
        } catch (error) {
            console.error('Error showing prompt:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Show native prompt
     */
    async showNativePrompt() {
        try {
            await window.OneSignal.push(() => {
                window.OneSignal.showNativePrompt();
            });
            return { success: true };
        } catch (error) {
            console.error('Error showing native prompt:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create singleton instance
const oneSignalService = new OneSignalService();

// Auto-initialize on load (optional - can be called manually)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Uncomment to auto-initialize
        // oneSignalService.initialize();
    });
} else {
    // Uncomment to auto-initialize
    // oneSignalService.initialize();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = oneSignalService;
}

console.log('✅ OneSignal Service loaded - Ready to initialize');
