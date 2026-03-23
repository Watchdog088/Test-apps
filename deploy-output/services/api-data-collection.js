/**
 * API Data Collection Service
 * Collects real data from all integrated APIs for admin dashboard
 * NO UI/DESIGN CHANGES - Backend data collection only
 */

class APIDataCollectionService {
    constructor() {
        this.data = {
            deepar: { usage: 0, limit: 10, active: false },
            stripe: { transactions: 0, revenue: 0, active: false },
            openai: { requests: 0, tokensUsed: 0, active: false },
            cloudinary: { uploads: 0, storage: 0, active: false },
            onesignal: { notifications: 0, active: false },
            mediastack: { requests: 0, limit: 500, active: false },
            youtube: { requests: 0, limit: 10000, active: false },
            firebase: { users: 0, active: false }
        };
        
        this.initialized = false;
    }

    /**
     * Initialize all API integrations
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Check which APIs are configured
            await this.checkAPIKeys();
            
            // Start collecting data
            await this.collectInitialData();
            
            // Set up periodic updates
            this.startPeriodicCollection();
            
            this.initialized = true;
            console.log('✅ API Data Collection initialized');
        } catch (error) {
            console.error('❌ API Data Collection initialization failed:', error);
        }
    }

    /**
     * Check which API keys are configured
     */
    async checkAPIKeys() {
        // DeepAR
        if (process.env.DEEPAR_LICENSE_KEY) {
            this.data.deepar.active = true;
            console.log('✅ DeepAR configured');
        }

        // Stripe
        if (process.env.STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY) {
            this.data.stripe.active = true;
            console.log('✅ Stripe configured');
        }

        // OpenAI
        if (process.env.OPENAI_API_KEY) {
            this.data.openai.active = true;
            console.log('✅ OpenAI configured');
        }

        // Cloudinary
        if (process.env.CLOUDINARY_CLOUD_NAME) {
            this.data.cloudinary.active = true;
            console.log('✅ Cloudinary configured');
        }

        // OneSignal
        if (process.env.ONESIGNAL_APP_ID) {
            this.data.onesignal.active = true;
            console.log('✅ OneSignal configured');
        }

        // MediaStack
        if (process.env.MEDIASTACK_API_KEY) {
            this.data.mediastack.active = true;
            console.log('✅ MediaStack configured');
        }

        // YouTube
        if (process.env.YOUTUBE_API_KEY) {
            this.data.youtube.active = true;
            console.log('✅ YouTube configured');
        }

        // Firebase
        if (process.env.FIREBASE_API_KEY) {
            this.data.firebase.active = true;
            console.log('✅ Firebase configured');
        }
    }

    /**
     * Collect initial data from all APIs
     */
    async collectInitialData() {
        const promises = [];

        if (this.data.deepar.active) {
            promises.push(this.collectDeepARData());
        }
        if (this.data.stripe.active) {
            promises.push(this.collectStripeData());
        }
        if (this.data.openai.active) {
            promises.push(this.collectOpenAIData());
        }
        if (this.data.cloudinary.active) {
            promises.push(this.collectCloudinaryData());
        }
        if (this.data.onesignal.active) {
            promises.push(this.collectOneSignalData());
        }
        if (this.data.mediastack.active) {
            promises.push(this.collectMediaStackData());
        }
        if (this.data.youtube.active) {
            promises.push(this.collectYouTubeData());
        }
        if (this.data.firebase.active) {
            promises.push(this.collectFirebaseData());
        }

        await Promise.allSettled(promises);
        console.log('✅ Initial data collection complete');
    }

    /**
     * Collect DeepAR usage data
     */
    async collectDeepARData() {
        try {
            // Track DeepAR usage from local storage
            const usageData = localStorage.getItem('deepar_usage') || '{}';
            const usage = JSON.parse(usageData);
            
            this.data.deepar.usage = usage.activeUsers || 0;
            this.data.deepar.lastUsed = usage.lastUsed || null;
            this.data.deepar.totalSessions = usage.totalSessions || 0;
            
            console.log('DeepAR data collected:', this.data.deepar);
        } catch (error) {
            console.error('Error collecting DeepAR data:', error);
        }
    }

    /**
     * Collect Stripe transaction data
     */
    async collectStripeData() {
        try {
            // Note: Actual Stripe API calls should be made from backend
            // This is client-side tracking only
            const transactionData = localStorage.getItem('stripe_transactions') || '{}';
            const transactions = JSON.parse(transactionData);
            
            this.data.stripe.transactions = transactions.count || 0;
            this.data.stripe.revenue = transactions.totalRevenue || 0;
            this.data.stripe.lastTransaction = transactions.lastTransaction || null;
            
            console.log('Stripe data collected:', this.data.stripe);
        } catch (error) {
            console.error('Error collecting Stripe data:', error);
        }
    }

    /**
     * Collect OpenAI moderation data
     */
    async collectOpenAIData() {
        try {
            const moderationData = localStorage.getItem('openai_moderation') || '{}';
            const moderation = JSON.parse(moderationData);
            
            this.data.openai.requests = moderation.totalRequests || 0;
            this.data.openai.tokensUsed = moderation.tokensUsed || 0;
            this.data.openai.flaggedContent = moderation.flaggedContent || 0;
            
            console.log('OpenAI data collected:', this.data.openai);
        } catch (error) {
            console.error('Error collecting OpenAI data:', error);
        }
    }

    /**
     * Collect Cloudinary media data
     */
    async collectCloudinaryData() {
        try {
            const mediaData = localStorage.getItem('cloudinary_uploads') || '{}';
            const media = JSON.parse(mediaData);
            
            this.data.cloudinary.uploads = media.totalUploads || 0;
            this.data.cloudinary.storage = media.storageUsed || 0;
            this.data.cloudinary.bandwidth = media.bandwidthUsed || 0;
            
            console.log('Cloudinary data collected:', this.data.cloudinary);
        } catch (error) {
            console.error('Error collecting Cloudinary data:', error);
        }
    }

    /**
     * Collect OneSignal notification data
     */
    async collectOneSignalData() {
        try {
            const notificationData = localStorage.getItem('onesignal_notifications') || '{}';
            const notifications = JSON.parse(notificationData);
            
            this.data.onesignal.notifications = notifications.totalSent || 0;
            this.data.onesignal.delivered = notifications.delivered || 0;
            this.data.onesignal.clicked = notifications.clicked || 0;
            
            console.log('OneSignal data collected:', this.data.onesignal);
        } catch (error) {
            console.error('Error collecting OneSignal data:', error);
        }
    }

    /**
     * Collect MediaStack news data
     */
    async collectMediaStackData() {
        try {
            if (window.mediaStackService) {
                const stats = window.mediaStackService.getStats();
                this.data.mediastack.requests = stats.requestsThisMonth;
                this.data.mediastack.articlesCollected = stats.articlesCollected || 0;
                this.data.mediastack.lastRequest = stats.lastRequestDate;
            }
            
            console.log('MediaStack data collected:', this.data.mediastack);
        } catch (error) {
            console.error('Error collecting MediaStack data:', error);
        }
    }

    /**
     * Collect YouTube API data
     */
    async collectYouTubeData() {
        try {
            if (window.youtubeService) {
                const stats = window.youtubeService.getStats();
                this.data.youtube.requests = stats.requestsToday;
                this.data.youtube.videosCollected = stats.videosCollected || 0;
                this.data.youtube.lastRequest = stats.lastRequestDate;
            }
            
            console.log('YouTube data collected:', this.data.youtube);
        } catch (error) {
            console.error('Error collecting YouTube data:', error);
        }
    }

    /**
     * Collect Firebase user data
     */
    async collectFirebaseData() {
        try {
            if (window.firebase && window.firebase.auth) {
                const currentUser = window.firebase.auth().currentUser;
                if (currentUser) {
                    this.data.firebase.users = 1; // At least one user logged in
                    this.data.firebase.currentUser = {
                        uid: currentUser.uid,
                        email: currentUser.email
                    };
                }
            }
            
            console.log('Firebase data collected:', this.data.firebase);
        } catch (error) {
            console.error('Error collecting Firebase data:', error);
        }
    }

    /**
     * Start periodic data collection
     */
    startPeriodicCollection() {
        // Update every 5 minutes
        setInterval(() => {
            this.collectInitialData();
        }, 5 * 60 * 1000);

        console.log('✅ Periodic data collection started (every 5 minutes)');
    }

    /**
     * Track DeepAR usage
     */
    trackDeepARUsage() {
        try {
            const usageData = localStorage.getItem('deepar_usage') || '{}';
            const usage = JSON.parse(usageData);
            
            usage.activeUsers = (usage.activeUsers || 0) + 1;
            usage.totalSessions = (usage.totalSessions || 0) + 1;
            usage.lastUsed = new Date().toISOString();
            
            localStorage.setItem('deepar_usage', JSON.stringify(usage));
            this.data.deepar.usage = usage.activeUsers;
            
            console.log('DeepAR usage tracked:', usage);
        } catch (error) {
            console.error('Error tracking DeepAR usage:', error);
        }
    }

    /**
     * Track Stripe transaction
     */
    trackStripeTransaction(amount) {
        try {
            const transactionData = localStorage.getItem('stripe_transactions') || '{}';
            const transactions = JSON.parse(transactionData);
            
            transactions.count = (transactions.count || 0) + 1;
            transactions.totalRevenue = (transactions.totalRevenue || 0) + amount;
            transactions.lastTransaction = new Date().toISOString();
            
            localStorage.setItem('stripe_transactions', JSON.stringify(transactions));
            this.data.stripe.transactions = transactions.count;
            this.data.stripe.revenue = transactions.totalRevenue;
            
            console.log('Stripe transaction tracked:', transactions);
        } catch (error) {
            console.error('Error tracking Stripe transaction:', error);
        }
    }

    /**
     * Track OpenAI moderation request
     */
    trackOpenAIRequest(tokens) {
        try {
            const moderationData = localStorage.getItem('openai_moderation') || '{}';
            const moderation = JSON.parse(moderationData);
            
            moderation.totalRequests = (moderation.totalRequests || 0) + 1;
            moderation.tokensUsed = (moderation.tokensUsed || 0) + tokens;
            moderation.lastRequest = new Date().toISOString();
            
            localStorage.setItem('openai_moderation', JSON.stringify(moderation));
            this.data.openai.requests = moderation.totalRequests;
            this.data.openai.tokensUsed = moderation.tokensUsed;
            
            console.log('OpenAI request tracked:', moderation);
        } catch (error) {
            console.error('Error tracking OpenAI request:', error);
        }
    }

    /**
     * Track Cloudinary upload
     */
    trackCloudinaryUpload(size) {
        try {
            const mediaData = localStorage.getItem('cloudinary_uploads') || '{}';
            const media = JSON.parse(mediaData);
            
            media.totalUploads = (media.totalUploads || 0) + 1;
            media.storageUsed = (media.storageUsed || 0) + size;
            media.lastUpload = new Date().toISOString();
            
            localStorage.setItem('cloudinary_uploads', JSON.stringify(media));
            this.data.cloudinary.uploads = media.totalUploads;
            this.data.cloudinary.storage = media.storageUsed;
            
            console.log('Cloudinary upload tracked:', media);
        } catch (error) {
            console.error('Error tracking Cloudinary upload:', error);
        }
    }

    /**
     * Track OneSignal notification
     */
    trackOneSignalNotification() {
        try {
            const notificationData = localStorage.getItem('onesignal_notifications') || '{}';
            const notifications = JSON.parse(notificationData);
            
            notifications.totalSent = (notifications.totalSent || 0) + 1;
            notifications.lastSent = new Date().toISOString();
            
            localStorage.setItem('onesignal_notifications', JSON.stringify(notifications));
            this.data.onesignal.notifications = notifications.totalSent;
            
            console.log('OneSignal notification tracked:', notifications);
        } catch (error) {
            console.error('Error tracking OneSignal notification:', error);
        }
    }

    /**
     * Get all collected data for admin dashboard
     */
    getAllData() {
        return {
            ...this.data,
            lastUpdated: new Date().toISOString(),
            summary: this.generateSummary()
        };
    }

    /**
     * Generate summary statistics
     */
    generateSummary() {
        const activeAPIs = Object.keys(this.data).filter(key => this.data[key].active).length;
        const totalAPIs = Object.keys(this.data).length;
        
        return {
            activeAPIs,
            totalAPIs,
            configurationComplete: (activeAPIs / totalAPIs * 100).toFixed(0) + '%'
        };
    }

    /**
     * Export data for admin dashboard
     */
    exportForDashboard() {
        return {
            apis: this.getAllData(),
            timestamp: new Date().toISOString(),
            initialized: this.initialized
        };
    }
}

// Create singleton instance
const apiDataCollection = new APIDataCollectionService();

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        apiDataCollection.initialize();
    });
} else {
    apiDataCollection.initialize();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiDataCollection;
}

// Make available globally for admin dashboard
window.apiDataCollection = apiDataCollection;

console.log('✅ API Data Collection Service loaded');
