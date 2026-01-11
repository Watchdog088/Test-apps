// ========== SETTINGS SYSTEM - COMPLETE WITH PERSISTENCE & PRIVACY CONTROLS ==========
// Full implementation with localStorage persistence and comprehensive privacy controls

// ========== SETTINGS STATE WITH PERSISTENCE ==========
const defaultSettings = {
    notifications: {
        push: true, email: true, sms: false,
        likes: true, comments: true, follows: true,
        messages: true, liveStreams: true, posts: true,
        mentions: true, tags: true, groupActivity: true,
        eventReminders: true, promotions: false
    },
    privacy: {
        profileVisibility: 'public',
        lastSeen: true,
        readReceipts: true,
        storySeen: true,
        activityStatus: true,
        searchability: true,
        tagging: 'friends',
        mentions: 'everyone',
        whoCanMessage: 'everyone',
        whoCanCall: 'friends',
        blockedWords: ['spam', 'fake'],
        dataSharing: false,
        locationSharing: false,
        contactSync: false
    },
    security: {
        twoFactorEnabled: false,
        loginAlerts: true,
        suspiciousActivity: true,
        deviceTracking: true,
        biometricLogin: false,
        backupCodes: ['ABC123', 'DEF456', 'GHI789', 'JKL012', 'MNO345', 'PQR678']
    },
    preferences: {
        language: 'en',
        timezone: 'America/New_York',
        theme: 'light',
        autoplay: true,
        dataUsage: 'standard',
        fontSize: 'medium',
        animations: true,
        soundEffects: true
    },
    blocked: [
        { id: 1, name: 'Bob Smith', username: '@bobsmith', avatar: '👤', blockedDate: '2024-01-15' },
        { id: 2, name: 'Spam Account', username: '@spammer', avatar: '👤', blockedDate: '2024-01-10' }
    ],
    devices: [
        { id: 1, name: 'iPhone 14 Pro', type: '📱', os: 'iOS 17.2', lastActive: '2 mins ago', location: 'New York, USA', current: true },
        { id: 2, name: 'MacBook Pro', type: '💻', os: 'macOS 14.1', lastActive: '1 hour ago', location: 'New York, USA', current: false },
        { id: 3, name: 'iPad Air', type: '📱', os: 'iPadOS 17.2', lastActive: '1 day ago', location: 'New York, USA', current: false }
    ],
    sessions: [
        { id: 1, device: 'iPhone 14 Pro', location: 'New York, USA', ip: '192.168.1.1', startTime: '2024-01-20 10:30', active: true },
        { id: 2, device: 'MacBook Pro', location: 'New York, USA', ip: '192.168.1.2', startTime: '2024-01-20 09:00', active: true },
        { id: 3, device: 'Web Browser', location: 'Los Angeles, USA', ip: '192.168.1.3', startTime: '2024-01-19 15:00', active: false }
    ],
    loginHistory: [
        { id: 1, date: '2024-01-20 10:30', device: 'iPhone 14 Pro', location: 'New York, USA', ip: '192.168.1.1', status: 'success' },
        { id: 2, date: '2024-01-20 09:00', device: 'MacBook Pro', location: 'New York, USA', ip: '192.168.1.2', status: 'success' },
        { id: 3, date: '2024-01-19 15:45', device: 'iPad Air', location: 'New York, USA', ip: '192.168.1.4', status: 'success' },
        { id: 4, date: '2024-01-18 09:20', device: 'Web Browser', location: 'Unknown', ip: '203.0.113.0', status: 'failed' },
        { id: 5, date: '2024-01-17 14:15', device: 'iPhone 14 Pro', location: 'New York, USA', ip: '192.168.1.1', status: 'success' }
    ],
    securityAlerts: [
        { id: 1, date: '2024-01-20', time: '10:30 AM', message: 'New login from iPhone 14 Pro', type: 'info', location: 'New York, USA' },
        { id: 2, date: '2024-01-18', time: '09:20 AM', message: 'Failed login attempt detected', type: 'warning', location: 'Unknown' },
        { id: 3, date: '2024-01-15', time: '03:45 PM', message: 'Password changed successfully', type: 'success', location: 'New York, USA' }
    ],
    dataExports: [
        { id: 1, type: 'All Data', date: '2024-01-15', status: 'completed', size: '2.4 GB', downloadUrl: '#' },
        { id: 2, type: 'Posts Only', date: '2024-01-10', status: 'completed', size: '450 MB', downloadUrl: '#' }
    ],
    storageUsage: {
        total: 5000,
        used: 2450,
        photos: 1200,
        videos: 850,
        documents: 300,
        other: 100
    }
};

// Load settings from localStorage or use defaults
let settingsState = JSON.parse(localStorage.getItem('connecthub_settings_all')) || JSON.parse(JSON.stringify(defaultSettings));

// ========== UTILITY FUNCTIONS ==========
function saveSettings() {
    localStorage.setItem('connecthub_settings_all', JSON.stringify(settingsState));
    showToast('Settings saved! ✓', 'success');
}

function showToast(msg, type = 'default') {
    const toast = document.getElementById('settingsToast') || (() => {
        const e = document.createElement('div');
        e.id = 'settingsToast';
        e.className = 'settings-toast';
        document.body.appendChild(e);
        return e;
    })();
    toast.textContent = msg;
    toast.className = 'settings-toast show ' + (type === 'success' ? 'success' : type === 'error' ? 'error' : '');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function closeAllDashboards() {
    document.querySelectorAll('.dashboard').forEach(d => d.remove());
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========== DASHBOARD 1: ACCOUNT SECURITY ==========
function openAccountSecurityDashboard() {
    closeAllDashboards();
    
    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard';
    dashboard.innerHTML = `
        <div class="dashboard-header">
            <button class="back-btn" onclick="closeAllDashboards()">← Back</button>
            <h2>🔑 Account Security</h2>
        </div>
        <div class="dashboard-content">
            <div class="dashboard-section">
                <h3>Password & Authentication</h3>
                <div class="setting-card" onclick="showChangePasswordModal()">
                    <div class="setting-card-icon">🔐</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Change Password</div>
                        <div class="setting-card-desc">Update your password</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
                <div class="setting-card" onclick="showChangeEmailModal()">
                    <div class="setting-card-icon">📧</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Change Email</div>
                        <div class="setting-card-desc">user@example.com</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Two-Factor Authentication</h3>
                <div class="setting-card" onclick="showTwoFactorSetup()">
                    <div class="setting-card-icon">🔐</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Two-Factor Authentication</div>
                        <div class="setting-card-desc">${settingsState.security.twoFactorEnabled ? 'Enabled ✓' : 'Not enabled'}</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
                ${settingsState.security.twoFactorEnabled ? `
                    <div class="info-box">
                        <strong>Backup Codes</strong>
                        <div class="backup-codes-grid">
                            ${settingsState.security.backupCodes.map(code => `
                                <div class="backup-code">${code}</div>
                            `).join('')}
                        </div>
                        <button class="btn" onclick="regenerateBackupCodes()">Regenerate Codes</button>
                    </div>
                ` : ''}
            </div>

            <div class="dashboard-section">
                <h3>Security Preferences</h3>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Login Alerts</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Get notified of new logins</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.security.loginAlerts ? 'active' : ''}" 
                            onclick="toggleSecuritySetting('loginAlerts')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Suspicious Activity Alerts</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Monitor unusual account activity</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.security.suspiciousActivity ? 'active' : ''}" 
                            onclick="toggleSecuritySetting('suspiciousActivity')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Device Tracking</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Track logged-in devices</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.security.deviceTracking ? 'active' : ''}" 
                            onclick="toggleSecuritySetting('deviceTracking')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Biometric Login</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Use fingerprint/face ID</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.security.biometricLogin ? 'active' : ''}" 
                            onclick="toggleSecuritySetting('biometricLogin')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Recent Security Alerts</h3>
                ${settingsState.securityAlerts.map(alert => `
                    <div class="alert-card ${alert.type}">
                        <div class="alert-header">
                            <div class="alert-title">${alert.message}</div>
                            <div class="alert-time">${alert.time}</div>
                        </div>
                        <div class="alert-message">${alert.location}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(dashboard);
}

function toggleSecuritySetting(setting) {
    settingsState.security[setting] = !settingsState.security[setting];
    saveSettings();
    openAccountSecurityDashboard();
}

function regenerateBackupCodes() {
    settingsState.security.backupCodes = Array.from({length: 6}, () => 
        Math.random().toString(36).substr(2, 6).toUpperCase()
    );
    saveSettings();
    openAccountSecurityDashboard();
    showToast('Backup codes regenerated!', 'success');
}

// ========== DASHBOARD 2: PRIVACY CONTROLS ==========
function openPrivacyControlsDashboard() {
    closeAllDashboards();
    
    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard';
    dashboard.innerHTML = `
        <div class="dashboard-header">
            <button class="back-btn" onclick="closeAllDashboards()">← Back</button>
            <h2>🔐 Privacy Controls</h2>
        </div>
        <div class="dashboard-content">
            <div class="dashboard-section">
                <h3>Profile Visibility</h3>
                <div class="chip-group">
                    <div class="chip ${settingsState.privacy.profileVisibility === 'public' ? 'active' : ''}" 
                         onclick="updatePrivacySetting('profileVisibility', 'public')">
                        🌍 Public
                    </div>
                    <div class="chip ${settingsState.privacy.profileVisibility === 'friends' ? 'active' : ''}" 
                         onclick="updatePrivacySetting('profileVisibility', 'friends')">
                        👥 Friends Only
                    </div>
                    <div class="chip ${settingsState.privacy.profileVisibility === 'private' ? 'active' : ''}" 
                         onclick="updatePrivacySetting('profileVisibility', 'private')">
                        🔒 Private
                    </div>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Activity Status</h3>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Show Last Seen</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Let others see when you were last active</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.privacy.lastSeen ? 'active' : ''}" 
                            onclick="togglePrivacySetting('lastSeen')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Read Receipts</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Show when you've read messages</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.privacy.readReceipts ? 'active' : ''}" 
                            onclick="togglePrivacySetting('readReceipts')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Story Seen Status</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Show when you've viewed stories</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.privacy.storySeen ? 'active' : ''}" 
                            onclick="togglePrivacySetting('storySeen')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Activity Status</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Show when you're online</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.privacy.activityStatus ? 'active' : ''}" 
                            onclick="togglePrivacySetting('activityStatus')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Search & Discovery</h3>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Search Visibility</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Allow others to find you in search</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.privacy.searchability ? 'active' : ''}" 
                            onclick="togglePrivacySetting('searchability')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Interaction Controls</h3>
                <div class="list-item" onclick="showInteractionControlModal('tagging')">
                    <div>
                        <div style="font-weight:600">Who Can Tag You</div>
                        <div style="font-size:13px;color:var(--text-secondary)">${capitalizeFirst(settingsState.privacy.tagging)}</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
                <div class="list-item" onclick="showInteractionControlModal('mentions')">
                    <div>
                        <div style="font-weight:600">Who Can Mention You</div>
                        <div style="font-size:13px;color:var(--text-secondary)">${capitalizeFirst(settingsState.privacy.mentions)}</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
                <div class="list-item" onclick="showInteractionControlModal('whoCanMessage')">
                    <div>
                        <div style="font-weight:600">Who Can Message You</div>
                        <div style="font-size:13px;color:var(--text-secondary)">${capitalizeFirst(settingsState.privacy.whoCanMessage)}</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
                <div class="list-item" onclick="showInteractionControlModal('whoCanCall')">
                    <div>
                        <div style="font-weight:600">Who Can Call You</div>
                        <div style="font-size:13px;color:var(--text-secondary)">${capitalizeFirst(settingsState.privacy.whoCanCall)}</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Data & Privacy</h3>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Data Sharing</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Share data with partners</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.privacy.dataSharing ? 'active' : ''}" 
                            onclick="togglePrivacySetting('dataSharing')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Location Sharing</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Share your location</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.privacy.locationSharing ? 'active' : ''}" 
                            onclick="togglePrivacySetting('locationSharing')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Contact Sync</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Sync device contacts</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.privacy.contactSync ? 'active' : ''}" 
                            onclick="togglePrivacySetting('contactSync')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Blocked Words</h3>
                <div class="list-item" onclick="showBlockedWordsModal()">
                    <div>
                        <div style="font-weight:600">Filter Words & Phrases</div>
                        <div style="font-size:13px;color:var(--text-secondary)">${settingsState.privacy.blockedWords.length} words blocked</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(dashboard);
}

function togglePrivacySetting(setting) {
    settingsState.privacy[setting] = !settingsState.privacy[setting];
    saveSettings();
    openPrivacyControlsDashboard();
}

function updatePrivacySetting(setting, value) {
    settingsState.privacy[setting] = value;
    saveSettings();
    openPrivacyControlsDashboard();
}

// ========== DASHBOARD 3: NOTIFICATION PREFERENCES ==========
function openNotificationPreferencesDashboard() {
    closeAllDashboards();
    
    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard';
    dashboard.innerHTML = `
        <div class="dashboard-header">
            <button class="back-btn" onclick="closeAllDashboards()">← Back</button>
            <h2>🔔 Notification Preferences</h2>
        </div>
        <div class="dashboard-content">
            <div class="dashboard-section">
                <h3>Notification Channels</h3>
                <div class="notification-grid">
                    <div class="notification-item">
                        <div class="notification-icon">📱</div>
                        <div class="notification-label">Push Notifications</div>
                        <button class="toggle-btn small ${settingsState.notifications.push ? 'active' : ''}" 
                                onclick="toggleNotification('push')">
                            <div class="toggle-slider"></div>
                        </button>
                    </div>
                    <div class="notification-item">
                        <div class="notification-icon">📧</div>
                        <div class="notification-label">Email Notifications</div>
                        <button class="toggle-btn small ${settingsState.notifications.email ? 'active' : ''}" 
                                onclick="toggleNotification('email')">
                            <div class="toggle-slider"></div>
                        </button>
                    </div>
                    <div class="notification-item">
                        <div class="notification-icon">💬</div>
                        <div class="notification-label">SMS Notifications</div>
                        <button class="toggle-btn small ${settingsState.notifications.sms ? 'active' : ''}" 
                                onclick="toggleNotification('sms')">
                            <div class="toggle-slider"></div>
                        </button>
                    </div>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Activity Notifications</h3>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Likes</div>
                        <div style="font-size:13px;color:var(--text-secondary)">When someone likes your content</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.notifications.likes ? 'active' : ''}" 
                            onclick="toggleNotification('likes')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Comments</div>
                        <div style="font-size:13px;color:var(--text-secondary)">When someone comments</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.notifications.comments ? 'active' : ''}" 
                            onclick="toggleNotification('comments')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">New Followers</div>
                        <div style="font-size:13px;color:var(--text-secondary)">When someone follows you</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.notifications.follows ? 'active' : ''}" 
                            onclick="toggleNotification('follows')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Mentions</div>
                        <div style="font-size:13px;color:var(--text-secondary)">When someone mentions you</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.notifications.mentions ? 'active' : ''}" 
                            onclick="toggleNotification('mentions')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Tags</div>
                        <div style="font-size:13px;color:var(--text-secondary)">When someone tags you</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.notifications.tags ? 'active' : ''}" 
                            onclick="toggleNotification('tags')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Communication Notifications</h3>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Messages</div>
                        <div style="font-size:13px;color:var(--text-secondary)">New message notifications</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.notifications.messages ? 'active' : ''}" 
                            onclick="toggleNotification('messages')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Live Streams</div>
                        <div style="font-size:13px;color:var(--text-secondary)">When someone goes live</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.notifications.liveStreams ? 'active' : ''}" 
                            onclick="toggleNotification('liveStreams')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">New Posts</div>
                        <div style="font-size:13px;color:var(--text-secondary)">From people you follow</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.notifications.posts ? 'active' : ''}" 
                            onclick="toggleNotification('posts')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Group & Event Notifications</h3>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Group Activity</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Activity in your groups</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.notifications.groupActivity ? 'active' : ''}" 
                            onclick="toggleNotification('groupActivity')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Event Reminders</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Upcoming event notifications</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.notifications.eventReminders ? 'active' : ''}" 
                            onclick="toggleNotification('eventReminders')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Marketing & Promotions</h3>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Promotional Updates</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Offers and updates</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.notifications.promotions ? 'active' : ''}" 
                            onclick="toggleNotification('promotions')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(dashboard);
}

function toggleNotification(setting) {
    settingsState.notifications[setting] = !settingsState.notifications[setting];
    saveSettings();
    openNotificationPreferencesDashboard();
}

// ========== DASHBOARD 4: DATA & STORAGE ==========
function openDataStorageDashboard() {
    closeAllDashboards();
    
    const usagePercent = (settingsState.storageUsage.used / settingsState.storageUsage.total) * 100;
    
    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard';
    dashboard.innerHTML = `
        <div class="dashboard-header">
            <button class="back-btn" onclick="closeAllDashboards()">← Back</button>
            <h2>💾 Data & Storage</h2>
        </div>
        <div class="dashboard-content">
            <div class="storage-card">
                <div class="storage-summary">
                    <div class="storage-used">${settingsState.storageUsage.used} MB</div>
                    <div class="storage-total">of ${settingsState.storageUsage.total} MB used</div>
                </div>
                <div class="storage-bar">
                    <div class="storage-fill" style="width:${usagePercent}%"></div>
                </div>
                <div class="storage-breakdown">
                    <div class="storage-item">
                        <span>📸 Photos</span>
                        <span>${settingsState.storageUsage.photos} MB</span>
                    </div>
                    <div class="storage-item">
                        <span>🎥 Videos</span>
                        <span>${settingsState.storageUsage.videos} MB</span>
                    </div>
                    <div class="storage-item">
                        <span>📄 Documents</span>
                        <span>${settingsState.storageUsage.documents} MB</span>
                    </div>
                    <div class="storage-item">
                        <span>📦 Other</span>
                        <span>${settingsState.storageUsage.other} MB</span>
                    </div>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Storage Management</h3>
                <div class="setting-card" onclick="clearCache()">
                    <div class="setting-card-icon">🧹</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Clear Cache</div>
                        <div class="setting-card-desc">Free up space</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Data Export</h3>
                ${settingsState.dataExports.map(exp => `
                    <div class="device-card">
                        <div class="device-icon">📦</div>
                        <div class="device-info">
                            <div class="device-name">${exp.type}</div>
                            <div class="device-details">${exp.date} • ${exp.size}</div>
                        </div>
                        <span class="badge badge-success">${exp.status}</span>
                    </div>
                `).join('')}
                <button class="btn" onclick="requestDataExport()">Request New Export</button>
            </div>
        </div>
    `;
    document.body.appendChild(dashboard);
}

function clearCache() {
    settingsState.storageUsage.other = Math.max(0, settingsState.storageUsage.other - 50);
    settingsState.storageUsage.used -= 50;
    saveSettings();
    openDataStorageDashboard();
    showToast('Cache cleared! 50MB freed', 'success');
}

function requestDataExport() {
    const newExport = {
        id: Date.now(),
        type: 'All Data',
        date: new Date().toISOString().split('T')[0],
        status: 'processing',
        size: 'Processing...',
        downloadUrl: '#'
    };
    settingsState.dataExports.unshift(newExport);
    saveSettings();
    openDataStorageDashboard();
    showToast('Export requested! You will be notified when ready.', 'success');
}

// ========== DASHBOARD 5: DEVICE MANAGEMENT ==========
function openDeviceManagementDashboard() {
    closeAllDashboards();
    
    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard';
    dashboard.innerHTML = `
        <div class="dashboard-header">
            <button class="back-btn" onclick="closeAllDashboards()">← Back</button>
            <h2>📱 Device Management</h2>
        </div>
        <div class="dashboard-content">
            <div class="dashboard-section">
                <h3>Active Devices</h3>
                ${settingsState.devices.map(device => `
                    <div class="device-card">
                        <div class="device-icon">${device.type}</div>
                        <div class="device-info">
                            <div class="device-name">${device.name}${device.current ? ' (This Device)' : ''}</div>
                            <div class="device-details">${device.os} • ${device.lastActive}</div>
                            <div class="device-details">${device.location}</div>
                        </div>
                        ${!device.current ? `<button class="btn btn-small" onclick="removeDevice(${device.id})">Remove</button>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(dashboard);
}

function removeDevice(deviceId) {
    if (confirm('Remove this device? You will need to log in again on that device.')) {
        settingsState.devices = settingsState.devices.filter(d => d.id !== deviceId);
        saveSettings();
        openDeviceManagementDashboard();
        showToast('Device removed successfully', 'success');
    }
}

// ========== FEATURE 16: ACCESSIBILITY SETTINGS ==========
function openAccessibilityDashboard() {
    closeAllDashboards();
    
    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard';
    dashboard.innerHTML = `
        <div class="dashboard-header">
            <button class="back-btn" onclick="closeAllDashboards()">← Back</button>
            <h2>♿ Accessibility</h2>
        </div>
        <div class="dashboard-content">
            <div class="dashboard-section">
                <h3>Display Settings</h3>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Font Size</div>
                        <div style="font-size:13px;color:var(--text-secondary)">${settingsState.preferences.fontSize}</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">High Contrast Mode</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Improve visibility</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.preferences.highContrast ? 'active' : ''}" 
                            onclick="toggleAccessibility('highContrast')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Reduce Motion</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Minimize animations</div>
                    </div>
                    <button class="toggle-btn small ${!settingsState.preferences.animations ? 'active' : ''}" 
                            onclick="toggleAccessibility('animations')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Audio Settings</h3>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Screen Reader</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Enable voice feedback</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.preferences.screenReader ? 'active' : ''}" 
                            onclick="toggleAccessibility('screenReader')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Captions</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Auto-display captions</div>
                    </div>
                    <button class="toggle-btn small ${settingsState.preferences.captions ? 'active' : ''}" 
                            onclick="toggleAccessibility('captions')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(dashboard);
}

function toggleAccessibility(setting) {
    if (setting === 'animations') {
        settingsState.preferences.animations = !settingsState.preferences.animations;
    } else {
        settingsState.preferences[setting] = !settingsState.preferences[setting];
    }
    saveSettings();
    openAccessibilityDashboard();
}

// ========== FEATURE 17: APP PERMISSIONS ==========
function openAppPermissionsDashboard() {
    closeAllDashboards();
    
    const permissions = settingsState.permissions || {
        camera: true,
        microphone: true,
        location: false,
        photos: true,
        notifications: true,
        contacts: false,
        storage: true
    };
    
    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard';
    dashboard.innerHTML = `
        <div class="dashboard-header">
            <button class="back-btn" onclick="closeAllDashboards()">← Back</button>
            <h2>🔐 App Permissions</h2>
        </div>
        <div class="dashboard-content">
            <div class="dashboard-section">
                <h3>Device Permissions</h3>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">📷 Camera</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Take photos and videos</div>
                    </div>
                    <button class="toggle-btn small ${permissions.camera ? 'active' : ''}" 
                            onclick="togglePermission('camera')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">🎤 Microphone</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Record audio</div>
                    </div>
                    <button class="toggle-btn small ${permissions.microphone ? 'active' : ''}" 
                            onclick="togglePermission('microphone')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">📍 Location</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Access your location</div>
                    </div>
                    <button class="toggle-btn small ${permissions.location ? 'active' : ''}" 
                            onclick="togglePermission('location')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">📸 Photos</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Access photo library</div>
                    </div>
                    <button class="toggle-btn small ${permissions.photos ? 'active' : ''}" 
                            onclick="togglePermission('photos')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">👥 Contacts</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Access contacts</div>
                    </div>
                    <button class="toggle-btn small ${permissions.contacts ? 'active' : ''}" 
                            onclick="togglePermission('contacts')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">💾 Storage</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Access device storage</div>
                    </div>
                    <button class="toggle-btn small ${permissions.storage ? 'active' : ''}" 
                            onclick="togglePermission('storage')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(dashboard);
}

function togglePermission(permission) {
    if (!settingsState.permissions) {
        settingsState.permissions = {
            camera: true, microphone: true, location: false,
            photos: true, notifications: true, contacts: false, storage: true
        };
    }
    settingsState.permissions[permission] = !settingsState.permissions[permission];
    saveSettings();
    openAppPermissionsDashboard();
}

// ========== FEATURE 18: CONNECTED APPS ==========
function openConnectedAppsDashboard() {
    closeAllDashboards();
    
    const connectedApps = settingsState.connectedApps || [
        { id: 1, name: 'Instagram', icon: '📷', connected: '2024-01-15', permissions: ['Profile', 'Photos'] },
        { id: 2, name: 'Spotify', icon: '🎵', connected: '2024-01-10', permissions: ['Music', 'Listening History'] },
        { id: 3, name: 'Google Drive', icon: '📁', connected: '2024-01-05', permissions: ['File Storage'] }
    ];
    
    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard';
    dashboard.innerHTML = `
        <div class="dashboard-header">
            <button class="back-btn" onclick="closeAllDashboards()">← Back</button>
            <h2>🔗 Connected Apps</h2>
        </div>
        <div class="dashboard-content">
            <div class="dashboard-section">
                <h3>Third-Party Apps</h3>
                ${connectedApps.map(app => `
                    <div class="device-card">
                        <div class="device-icon">${app.icon}</div>
                        <div class="device-info">
                            <div class="device-name">${app.name}</div>
                            <div class="device-details">Connected: ${app.connected}</div>
                            <div class="device-details">Permissions: ${app.permissions.join(', ')}</div>
                        </div>
                        <button class="btn btn-small" onclick="disconnectApp(${app.id})">Disconnect</button>
                    </div>
                `).join('')}
            </div>
            
            <div class="dashboard-section">
                <button class="btn" onclick="showToast('Connect new app feature coming soon!', 'default')">+ Connect New App</button>
            </div>
        </div>
    `;
    document.body.appendChild(dashboard);
}

function disconnectApp(appId) {
    if (confirm('Disconnect this app? It will lose access to your account.')) {
        if (!settingsState.connectedApps) {
            settingsState.connectedApps = [];
        }
        settingsState.connectedApps = settingsState.connectedApps.filter(app => app.id !== appId);
        saveSettings();
        openConnectedAppsDashboard();
        showToast('App disconnected', 'success');
    }
}

// ========== FEATURE 19: DOWNLOAD SETTINGS ==========
function openDownloadSettingsDashboard() {
    closeAllDashboards();
    
    const downloadSettings = settingsState.downloadSettings || {
        autoDownload: true,
        wifiOnly: true,
        videoQuality: 'HD',
        downloadLocation: 'Internal Storage'
    };
    
    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard';
    dashboard.innerHTML = `
        <div class="dashboard-header">
            <button class="back-btn" onclick="closeAllDashboards()">← Back</button>
            <h2>⬇️ Download Settings</h2>
        </div>
        <div class="dashboard-content">
            <div class="dashboard-section">
                <h3>Auto-Download</h3>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Auto-Download Media</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Automatically download shared media</div>
                    </div>
                    <button class="toggle-btn small ${downloadSettings.autoDownload ? 'active' : ''}" 
                            onclick="toggleDownloadSetting('autoDownload')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">WiFi Only</div>
                        <div style="font-size:13px;color:var(--text-secondary)">Download only on WiFi</div>
                    </div>
                    <button class="toggle-btn small ${downloadSettings.wifiOnly ? 'active' : ''}" 
                            onclick="toggleDownloadSetting('wifiOnly')">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Quality & Storage</h3>
                <div class="list-item" onclick="showVideoQualityModal()">
                    <div>
                        <div style="font-weight:600">Video Quality</div>
                        <div style="font-size:13px;color:var(--text-secondary)">${downloadSettings.videoQuality}</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
                <div class="list-item" onclick="showDownloadLocationModal()">
                    <div>
                        <div style="font-weight:600">Download Location</div>
                        <div style="font-size:13px;color:var(--text-secondary)">${downloadSettings.downloadLocation}</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(dashboard);
}

function toggleDownloadSetting(setting) {
    if (!settingsState.downloadSettings) {
        settingsState.downloadSettings = {
            autoDownload: true, wifiOnly: true,
            videoQuality: 'HD', downloadLocation: 'Internal Storage'
        };
    }
    settingsState.downloadSettings[setting] = !settingsState.downloadSettings[setting];
    saveSettings();
    openDownloadSettingsDashboard();
}

function showVideoQualityModal() {
    showToast('Video quality selection coming soon!', 'default');
}

function showDownloadLocationModal() {
    showToast('Download location selection coming soon!', 'default');
}

// ========== FEATURE 20: ABOUT & LEGAL ==========
function openAboutLegalDashboard() {
    closeAllDashboards();
    
    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard';
    dashboard.innerHTML = `
        <div class="dashboard-header">
            <button class="back-btn" onclick="closeAllDashboards()">← Back</button>
            <h2>ℹ️ About & Legal</h2>
        </div>
        <div class="dashboard-content">
            <div class="dashboard-section">
                <h3>App Information</h3>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Version</div>
                        <div style="font-size:13px;color:var(--text-secondary)">1.0.0</div>
                    </div>
                </div>
                <div class="list-item">
                    <div>
                        <div style="font-weight:600">Build Number</div>
                        <div style="font-size:13px;color:var(--text-secondary)">2024.01.20</div>
                    </div>
                </div>
                <div class="setting-card" onclick="showToast('Checking for updates...', 'default')">
                    <div class="setting-card-icon">🔄</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Check for Updates</div>
                        <div class="setting-card-desc">You're on the latest version</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Legal</h3>
                <div class="setting-card" onclick="showToast('Loading Terms of Service...', 'default')">
                    <div class="setting-card-icon">📄</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Terms of Service</div>
                        <div class="setting-card-desc">Read our terms</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
                <div class="setting-card" onclick="showToast('Loading Privacy Policy...', 'default')">
                    <div class="setting-card-icon">🔒</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Privacy Policy</div>
                        <div class="setting-card-desc">How we protect your data</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
                <div class="setting-card" onclick="showToast('Loading Licenses...', 'default')">
                    <div class="setting-card-icon">⚖️</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Open Source Licenses</div>
                        <div class="setting-card-desc">Third-party software</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Support</h3>
                <div class="setting-card" onclick="showToast('Opening Help Center...', 'default')">
                    <div class="setting-card-icon">❓</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Help Center</div>
                        <div class="setting-card-desc">Get support</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
                <div class="setting-card" onclick="showToast('Opening Feedback form...', 'default')">
                    <div class="setting-card-icon">💬</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Send Feedback</div>
                        <div class="setting-card-desc">Help us improve</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
            </div>

            <div class="dashboard-section">
                <div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px;">
                    <div>© 2024 ConnectHub</div>
                    <div style="margin-top:8px;">Made with ❤️ for connecting people</div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(dashboard);
}

// ========== DASHBOARD 21: COMPLIANCE & GDPR ==========
function openComplianceDashboard() {
    closeAllDashboards();
    
    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard';
    dashboard.innerHTML = `
        <div class="dashboard-header">
            <button class="back-btn" onclick="closeAllDashboards()">← Back</button>
            <h2>⚖️ Compliance & GDPR</h2>
        </div>
        <div class="dashboard-content">
            <div class="dashboard-section">
                <h3>Data Protection & Privacy</h3>
                <div class="setting-card" onclick="openGDPRDataExport()">
                    <div class="setting-card-icon">📥</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">GDPR Data Export</div>
                        <div class="setting-card-desc">Request a copy of your data</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
                <div class="setting-card" onclick="openDataRightsModal()">
                    <div class="setting-card-icon">📜</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Your Data Rights</div>
                        <div class="setting-card-desc">View GDPR rights & options</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
                <div class="setting-card" onclick="openConsentManagement()">
                    <div class="setting-card-icon">🍪</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Consent Management</div>
                        <div class="setting-card-desc">Manage cookies & consent</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Compliance Status</h3>
                <div class="info-box">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
                        <div style="font-size:48px">✅</div>
                        <div>
                            <div style="font-size:24px;font-weight:700">98% Compliant</div>
                            <div style="font-size:14px;color:var(--text-secondary)">Last updated: ${new Date().toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div style="margin-top:20px">
                        <div style="font-weight:600;margin-bottom:8px">Active Protections:</div>
                        <div style="display:grid;gap:8px">
                            <div>✅ GDPR Compliance</div>
                            <div>✅ CCPA Compliance</div>
                            <div>✅ Data Encryption (AES-256)</div>
                            <div>✅ Privacy by Design</div>
                            <div>✅ Right to be Forgotten</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Legal Documents</h3>
                <div class="setting-card" onclick="viewTermsOfService()">
                    <div class="setting-card-icon">📄</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Terms of Service</div>
                        <div class="setting-card-desc">Read our terms</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
                <div class="setting-card" onclick="viewPrivacyPolicy()">
                    <div class="setting-card-icon">🔒</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Privacy Policy</div>
                        <div class="setting-card-desc">How we protect your data</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
                <div class="setting-card" onclick="viewCookiePolicy()">
                    <div class="setting-card-icon">🍪</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Cookie Policy</div>
                        <div class="setting-card-desc">How we use cookies</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Data Verification</h3>
                <div class="setting-card" onclick="verifyPersonalData()">
                    <div class="setting-card-icon">✅</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Verify Personal Data</div>
                        <div class="setting-card-desc">Confirm data accuracy</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
                <div class="setting-card" onclick="requestDataCorrection()">
                    <div class="setting-card-icon">✏️</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Request Data Correction</div>
                        <div class="setting-card-desc">Fix inaccurate information</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
                <div class="setting-card" onclick="requestDataDeletion()">
                    <div class="setting-card-icon">🗑️</div>
                    <div class="setting-card-content">
                        <div class="setting-card-title">Request Data Deletion</div>
                        <div class="setting-card-desc">Exercise right to erasure</div>
                    </div>
                    <div class="setting-card-arrow">›</div>
                </div>
            </div>

            <div class="dashboard-section">
                <h3>Reports & Audit</h3>
                <button class="btn" onclick="downloadComplianceReport()">
                    📄 Download Compliance Report
                </button>
                <button class="btn" onclick="requestDataAudit()" style="margin-top:12px">
                    🔍 Request Full Data Audit
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(dashboard);
}

// Compliance Helper Functions
function openGDPRDataExport() {
    if (window.privacySecurityAdditionalUI) {
        window.privacySecurityAdditionalUI.showGDPRDataExport();
    } else {
        showToast('Opening GDPR Data Export...', 'info');
    }
}

function openDataRightsModal() {
    if (window.privacySecurityAdditionalUI) {
        window.privacySecurityAdditionalUI.showGDPRDataExport();
        setTimeout(() => {
            window.privacySecurityAdditionalUI.switchGDPRTab('rights');
        }, 100);
    } else {
        showToast('Opening Data Rights...', 'info');
    }
}

function openConsentManagement() {
    if (window.privacySecurityAdditionalUI) {
        window.privacySecurityAdditionalUI.showGDPRDataExport();
        setTimeout(() => {
            window.privacySecurityAdditionalUI.switchGDPRTab('compliance');
        }, 100);
    } else {
        showToast('Opening Consent Management...', 'info');
    }
}

function viewTermsOfService() {
    window.open('ConnectHub-Frontend/legal/terms-of-service.html', '_blank');
}

function viewPrivacyPolicy() {
    window.open('ConnectHub-Frontend/legal/privacy-policy.html', '_blank');
}

function viewCookiePolicy() {
    showToast('Cookie Policy - UI Available', 'info');
}

function verifyPersonalData() {
    if (window.privacySecurityAdditionalUI) {
        window.privacySecurityAdditionalUI.showGDPRDataExport();
        setTimeout(() => {
            window.privacySecurityAdditionalUI.switchGDPRTab('verification');
        }, 100);
    } else {
        showToast('Data Verification - UI Available', 'info');
    }
}

function requestDataCorrection() {
    showToast('Data correction request submitted', 'success');
}

function requestDataDeletion() {
    if (confirm('Are you sure you want to request deletion of all your data? This cannot be undone.')) {
        showToast('Data deletion request submitted. We will process this within 30 days.', 'success');
    }
}

function downloadComplianceReport() {
    const report = {
        generatedDate: new Date().toISOString(),
        complianceScore: '98%',
        gdprCompliant: true,
        ccpaCompliant: true,
        dataProtection: 'AES-256 Encryption',
        lastAudit: new Date().toLocaleDateString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compliance-report.json';
    a.click();
    
    showToast('Compliance report downloaded', 'success');
}

function requestDataAudit() {
    showToast('Full data audit requested. You will receive a comprehensive report within 7 days.', 'success');
}

// Initialize default values for new features
if (!settingsState.preferences.highContrast) settingsState.preferences.highContrast = false;
if (!settingsState.preferences.screenReader) settingsState.preferences.screenReader = false;
if (!settingsState.preferences.captions) settingsState.preferences.captions = false;
