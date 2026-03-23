/**
 * Admin Dashboard Data Integration
 * Feeds real API data to existing admin dashboard (NO DESIGN CHANGES)
 * Only populates existing dashboard elements with live data
 */

class AdminDashboardData {
    constructor() {
        this.updateInterval = null;
        this.initialized = false;
    }

    /**
     * Initialize dashboard data updates
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Wait for API data collection to be ready
            if (!window.apiDataCollection) {
                console.warn('API Data Collection not loaded yet, retrying...');
                setTimeout(() => this.initialize(), 1000);
                return;
            }

            // Start updating dashboard
            await this.updateDashboard();
            
            // Update every 30 seconds
            this.updateInterval = setInterval(() => {
                this.updateDashboard();
            }, 30000);

            this.initialized = true;
            console.log('✅ Admin Dashboard Data Integration initialized');
        } catch (error) {
            console.error('❌ Admin Dashboard Data Integration failed:', error);
        }
    }

    /**
     * Update all dashboard elements with real data
     */
    async updateDashboard() {
        try {
            const data = window.apiDataCollection.exportForDashboard();
            
            // Update API status indicators
            this.updateAPIStatus(data.apis);
            
            // Update usage statistics
            this.updateUsageStats(data.apis);
            
            // Update summary cards
            this.updateSummaryCards(data.apis);
            
            console.log('✅ Dashboard updated with real API data');
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }

    /**
     * Update API status indicators (finds existing elements by ID/class)
     */
    updateAPIStatus(apis) {
        // DeepAR status
        const deeparStatus = document.querySelector('#deepar-status, .deepar-status');
        if (deeparStatus && apis.deepar) {
            deeparStatus.textContent = apis.deepar.active ? '✅ Active' : '⚪ Inactive';
            deeparStatus.classList.toggle('active', apis.deepar.active);
        }

        // Stripe status
        const stripeStatus = document.querySelector('#stripe-status, .stripe-status');
        if (stripeStatus && apis.stripe) {
            stripeStatus.textContent = apis.stripe.active ? '✅ Active' : '⚪ Inactive';
            stripeStatus.classList.toggle('active', apis.stripe.active);
        }

        // OpenAI status
        const openaiStatus = document.querySelector('#openai-status, .openai-status');
        if (openaiStatus && apis.openai) {
            openaiStatus.textContent = apis.openai.active ? '✅ Active' : '⚪ Inactive';
            openaiStatus.classList.toggle('active', apis.openai.active);
        }

        // Cloudinary status
        const cloudinaryStatus = document.querySelector('#cloudinary-status, .cloudinary-status');
        if (cloudinaryStatus && apis.cloudinary) {
            cloudinaryStatus.textContent = apis.cloudinary.active ? '✅ Active' : '⚪ Inactive';
            cloudinaryStatus.classList.toggle('active', apis.cloudinary.active);
        }

        // OneSignal status
        const onesignalStatus = document.querySelector('#onesignal-status, .onesignal-status');
        if (onesignalStatus && apis.onesignal) {
            onesignalStatus.textContent = apis.onesignal.active ? '✅ Active' : '⚪ Inactive';
            onesignalStatus.classList.toggle('active', apis.onesignal.active);
        }

        // MediaStack status
        const mediastackStatus = document.querySelector('#mediastack-status, .mediastack-status');
        if (mediastackStatus && apis.mediastack) {
            mediastackStatus.textContent = apis.mediastack.active ? '✅ Active' : '⚪ Inactive';
            mediastackStatus.classList.toggle('active', apis.mediastack.active);
        }

        // YouTube status
        const youtubeStatus = document.querySelector('#youtube-status, .youtube-status');
        if (youtubeStatus && apis.youtube) {
            youtubeStatus.textContent = apis.youtube.active ? '✅ Active' : '⚪ Inactive';
            youtubeStatus.classList.toggle('active', apis.youtube.active);
        }

        // Firebase status
        const firebaseStatus = document.querySelector('#firebase-status, .firebase-status');
        if (firebaseStatus && apis.firebase) {
            firebaseStatus.textContent = apis.firebase.active ? '✅ Active' : '⚪ Inactive';
            firebaseStatus.classList.toggle('active', apis.firebase.active);
        }
    }

    /**
     * Update usage statistics
     */
    updateUsageStats(apis) {
        // DeepAR usage
        if (apis.deepar.active) {
            const deeparUsage = document.querySelector('#deepar-usage, .deepar-usage');
            if (deeparUsage) {
                deeparUsage.textContent = `${apis.deepar.usage} / ${apis.deepar.limit} users`;
            }

            const deeparProgress = document.querySelector('#deepar-progress, .deepar-progress');
            if (deeparProgress) {
                const percentage = (apis.deepar.usage / apis.deepar.limit) * 100;
                deeparProgress.style.width = `${percentage}%`;
            }
        }

        // Stripe revenue
        if (apis.stripe.active) {
            const stripeRevenue = document.querySelector('#stripe-revenue, .stripe-revenue');
            if (stripeRevenue) {
                stripeRevenue.textContent = `$${apis.stripe.revenue.toFixed(2)}`;
            }

            const stripeTransactions = document.querySelector('#stripe-transactions, .stripe-transactions');
            if (stripeTransactions) {
                stripeTransactions.textContent = apis.stripe.transactions;
            }
        }

        // OpenAI usage
        if (apis.openai.active) {
            const openaiRequests = document.querySelector('#openai-requests, .openai-requests');
            if (openaiRequests) {
                openaiRequests.textContent = apis.openai.requests;
            }

            const openaiTokens = document.querySelector('#openai-tokens, .openai-tokens');
            if (openaiTokens) {
                openaiTokens.textContent = apis.openai.tokensUsed.toLocaleString();
            }
        }

        // Cloudinary usage
        if (apis.cloudinary.active) {
            const cloudinaryUploads = document.querySelector('#cloudinary-uploads, .cloudinary-uploads');
            if (cloudinaryUploads) {
                cloudinaryUploads.textContent = apis.cloudinary.uploads;
            }

            const cloudinaryStorage = document.querySelector('#cloudinary-storage, .cloudinary-storage');
            if (cloudinaryStorage) {
                const storageMB = (apis.cloudinary.storage / (1024 * 1024)).toFixed(2);
                cloudinaryStorage.textContent = `${storageMB} MB`;
            }
        }

        // OneSignal notifications
        if (apis.onesignal.active) {
            const onesignalNotifications = document.querySelector('#onesignal-notifications, .onesignal-notifications');
            if (onesignalNotifications) {
                onesignalNotifications.textContent = apis.onesignal.notifications;
            }
        }

        // MediaStack requests
        if (apis.mediastack.active) {
            const mediastackRequests = document.querySelector('#mediastack-requests, .mediastack-requests');
            if (mediastackRequests) {
                mediastackRequests.textContent = `${apis.mediastack.requests} / ${apis.mediastack.limit}`;
            }

            const mediastackProgress = document.querySelector('#mediastack-progress, .mediastack-progress');
            if (mediastackProgress) {
                const percentage = (apis.mediastack.requests / apis.mediastack.limit) * 100;
                mediastackProgress.style.width = `${percentage}%`;
            }
        }

        // YouTube requests
        if (apis.youtube.active) {
            const youtubeRequests = document.querySelector('#youtube-requests, .youtube-requests');
            if (youtubeRequests) {
                youtubeRequests.textContent = `${apis.youtube.requests} / ${apis.youtube.limit}`;
            }

            const youtubeProgress = document.querySelector('#youtube-progress, .youtube-progress');
            if (youtubeProgress) {
                const percentage = (apis.youtube.requests / apis.youtube.limit) * 100;
                youtubeProgress.style.width = `${percentage}%`;
            }
        }

        // Firebase users
        if (apis.firebase.active) {
            const firebaseUsers = document.querySelector('#firebase-users, .firebase-users');
            if (firebaseUsers) {
                firebaseUsers.textContent = apis.firebase.users;
            }
        }
    }

    /**
     * Update summary cards
     */
    updateSummaryCards(apis) {
        // Total active APIs
        const activeAPIs = document.querySelector('#active-apis-count, .active-apis-count');
        if (activeAPIs && apis.summary) {
            activeAPIs.textContent = apis.summary.activeAPIs;
        }

        // Total APIs
        const totalAPIs = document.querySelector('#total-apis-count, .total-apis-count');
        if (totalAPIs && apis.summary) {
            totalAPIs.textContent = apis.summary.totalAPIs;
        }

        // Configuration percentage
        const configPercent = document.querySelector('#config-percentage, .config-percentage');
        if (configPercent && apis.summary) {
            configPercent.textContent = apis.summary.configurationComplete;
        }

        // Last updated timestamp
        const lastUpdated = document.querySelector('#last-updated, .last-updated');
        if (lastUpdated && apis.lastUpdated) {
            const date = new Date(apis.lastUpdated);
            lastUpdated.textContent = date.toLocaleTimeString();
        }
    }

    /**
     * Get current dashboard data
     */
    getCurrentData() {
        if (!window.apiDataCollection) {
            return null;
        }
        return window.apiDataCollection.exportForDashboard();
    }

    /**
     * Manually refresh dashboard
     */
    refresh() {
        this.updateDashboard();
    }

    /**
     * Stop dashboard updates
     */
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.initialized = false;
        console.log('Admin Dashboard Data updates stopped');
    }
}

// Create singleton instance
const adminDashboardData = new AdminDashboardData();

// Auto-initialize on page load if admin dashboard is detected
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Check if we're on admin dashboard page
        if (document.querySelector('#admin-dashboard, .admin-dashboard, [data-page="admin"]')) {
            adminDashboardData.initialize();
        }
    });
} else {
    if (document.querySelector('#admin-dashboard, .admin-dashboard, [data-page="admin"]')) {
        adminDashboardData.initialize();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = adminDashboardData;
}

// Make available globally
window.adminDashboardData = adminDashboardData;

console.log('✅ Admin Dashboard Data Integration loaded');
