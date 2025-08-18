// ConnectHub Frontend Production Configuration
const PRODUCTION_CONFIG = {
    // API Configuration
    API_BASE_URL: 'https://api.connecthub.yourdomain.com',
    SOCKET_URL: 'https://api.connecthub.yourdomain.com',
    
    // App Configuration
    APP_NAME: 'ConnectHub',
    APP_URL: 'https://connecthub.yourdomain.com',
    VERSION: '1.0.0',
    
    // Environment
    NODE_ENV: 'production',
    DEBUG: false,
    
    // Features
    FEATURES: {
        SOCIAL_MEDIA: true,
        DATING: true,
        MESSAGING: true,
        VIDEO_CALLS: true,
        PUSH_NOTIFICATIONS: true,
        GEOLOCATION: true,
        CONTENT_MODERATION: true,
        PREMIUM_FEATURES: true
    },
    
    // Upload Configuration
    MAX_FILE_SIZE: 10485760, // 10MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
    
    // Social Media Settings
    POSTS_PER_PAGE: 20,
    AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
    
    // Dating Settings
    MAX_DISTANCE: 50, // km
    AGE_RANGE: {
        MIN: 18,
        MAX: 80
    },
    
    // Real-time Configuration
    SOCKET_OPTIONS: {
        transports: ['websocket'],
        upgrade: true,
        rememberUpgrade: true
    },
    
    // Analytics
    ANALYTICS: {
        ENABLED: true,
        TRACK_USER_INTERACTIONS: true,
        TRACK_PERFORMANCE: true
    },
    
    // Performance
    CACHE_DURATION: 300000, // 5 minutes
    IMAGE_LAZY_LOADING: true,
    
    // Security
    CSRF_PROTECTION: true,
    XSS_PROTECTION: true,
    
    // Monitoring
    ERROR_REPORTING: true,
    PERFORMANCE_MONITORING: true
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PRODUCTION_CONFIG;
} else {
    window.PRODUCTION_CONFIG = PRODUCTION_CONFIG;
}
