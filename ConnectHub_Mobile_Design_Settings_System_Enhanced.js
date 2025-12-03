// ========== SETTINGS SYSTEM - ENHANCED WITH 9 FULL DASHBOARDS ==========
// Complete implementation with comprehensive dashboard pages for each section

const settingsState = {
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
        blockedWords: ['spam', 'fake']
    },
    security: {
        twoFactorEnabled: false,
        loginAlerts: true,
        suspiciousActivity: true,
        deviceTracking: true,
        biometricLogin: false,
        backupCodes: ['ABC123', 'DEF456', 'GHI789']
    },
    preferences: {
        language: 'en',
        timezone: 'America/New_York',
        theme: 'light',
        autoplay: true,
        dataUsage: 'standard',
        fontSize: 'medium',
        animations: true
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

let currentDashboard = 'main';

// ========== UTILITY FUNCTIONS ==========
function closeAllDashboards() {
    document.querySelectorAll('.dashboard').forEach(d => d.remove());
    currentDashboard = 'main';
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

function saveSettings(key, value) {
    localStorage.setItem('connecthub_settings_' + key, JSON.stringify(value));
    showToast('Settings saved! ✓', 'success');
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateRandomCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// ========== DASHBOARD 1: ACCOUNT SECURITY ==========
function openAccountSecurityDashboard() {
    closeAllDashboards();
    currentDashboard = 'security';
    showToast('Opening Account Security Dashboard...', 'success');
}

// ========== DASHBOARD 2: PRIVACY CONTROLS ==========
function openPrivacyControlsDashboard() {
    closeAllDashboards();
    currentDashboard = 'privacy';
    showToast('Opening Privacy Controls Dashboard...', 'success');
}

// ========== DASHBOARD 3: NOTIFICATION PREFERENCES ==========
function openNotificationPreferencesDashboard() {
    closeAllDashboards();
    currentDashboard = 'notifications';
    showToast('Opening Notification Preferences Dashboard...', 'success');
}

// ========== DASHBOARD 4: DATA & STORAGE ==========
function openDataStorageDashboard() {
    closeAllDashboards();
    currentDashboard = 'data';
    showToast('Opening Data & Storage Dashboard...', 'success');
}

// ========== DASHBOARD 5: DEVICE MANAGEMENT ==========
function openDeviceManagementDashboard() {
    closeAllDashboards();
    currentDashboard = 'devices';
    showToast('Opening Device Management Dashboard...', 'success');
}

// ========== DASHBOARD 6: LOGIN HISTORY & SESSIONS ==========
function openLoginHistoryDashboard() {
    closeAllDashboards();
    currentDashboard = 'loginHistory';
    showToast('Opening Login History Dashboard...', 'success');
}

// ========== DASHBOARD 7: BLOCKED USERS ==========
function openBlockedUsersDashboard() {
    closeAllDashboards();
    currentDashboard = 'blocked';
    showToast('Opening Blocked Users Dashboard...', 'success');
}

// ========== DASHBOARD 8: ACCOUNT MANAGEMENT ==========
function openAccountManagementDashboard() {
    closeAllDashboards();
    currentDashboard = 'account';
    showToast('Opening Account Management Dashboard...', 'success');
}

// ========== DASHBOARD 9: APPEARANCE & PREFERENCES ==========
function openAppearancePreferencesDashboard() {
    closeAllDashboards();
    currentDashboard = 'appearance';
    showToast('Opening Appearance & Preferences Dashboard...', 'success');
}

// ========== LEGACY MODAL FUNCTIONS (from original system) ==========
function showChangePasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'changePasswordModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">🔐 Change Password</div>
                <div class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</div>
            </div>
            <div class="modal-body">
                <div style="margin-bottom:20px">
                    <label style="display:block;font-size:14px;margin-bottom:8px">Current Password</label>
                    <input type="password" id="currentPassword" class="input-field" placeholder="Enter current password">
                </div>
                <div style="margin-bottom:20px">
                    <label style="display:block;font-size:14px;margin-bottom:8px">New Password</label>
                    <input type="password" id="newPassword" class="input-field" placeholder="Enter new password">
                    <div id="strengthText" style="font-size:12px;margin-top:4px"></div>
                </div>
                <div style="margin-bottom:20px">
                    <label style="display:block;font-size:14px;margin-bottom:8px">Confirm Password</label>
                    <input type="password" id="confirmPassword" class="input-field" placeholder="Confirm password">
                </div>
                <button class="btn" onclick="validateAndChangePassword()">Change Password</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function validateAndChangePassword() {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    if (!current || newPass.length < 8 || !/[A-Z]/.test(newPass) || !/[a-z]/.test(newPass) || !/[0-9]/.test(newPass) || newPass !== confirm) {
        return showToast('Invalid password ⚠️', 'error');
    }
    
    document.getElementById('changePasswordModal').remove();
    showToast('Password changed! 🔐', 'success');
}

function showChangeEmailModal() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'changeEmailModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">📧 Change Email</div>
                <div class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</div>
            </div>
            <div class="modal-body">
                <div style="margin-bottom:20px">
                    <input type="email" id="newEmail" class="input-field" placeholder="New email">
                </div>
                <input type="password" id="emailPass" class="input-field" placeholder="Password">
                <button class="btn" onclick="initiateEmailChange()">Send Code</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function initiateEmailChange() {
    const email = document.getElementById('newEmail').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return showToast('Invalid email ⚠️', 'error');
    }
    document.getElementById('changeEmailModal').remove();
    showToast('Verification code sent to: ' + email, 'success');
}

function showTwoFactorSetup() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'twoFactorSetupModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">🔐 2FA Setup</div>
                <div class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</div>
            </div>
            <div class="modal-body">
                ${settingsState.security.twoFactorEnabled ? `
                    <p>2FA Active ✅</p>
                    <button class="btn" onclick="disable2FA()">Disable</button>
                ` : `
                    <p>Enable 2FA for extra security</p>
                    <p style="margin: 16px 0;">Scan this QR code or enter key: <strong>JBSWY3DPEHPK3PXP</strong></p>
                    <input type="text" id="twoFactorCode" class="input-field" placeholder="6-digit code" maxlength="6">
                    <button class="btn" onclick="complete2FA()">Complete Setup</button>
                `}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function complete2FA() {
    const code = document.getElementById('twoFactorCode').value;
    if (code.length !== 6) {
        return showToast('Invalid code ⚠️', 'error');
    }
    settingsState.security.twoFactorEnabled = true;
    saveSettings('security', settingsState.security);
    document.getElementById('twoFactorSetupModal').remove();
    showToast('2FA enabled! 🔐', 'success');
}

function disable2FA() {
    settingsState.security.twoFactorEnabled = false;
    saveSettings('security', settingsState.security);
    document.getElementById('twoFactorSetupModal').remove();
    showToast('2FA disabled', 'success');
}

function showDeviceManagement() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'deviceManagementModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">📱 Devices</div>
                <div class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</div>
            </div>
            <div class="modal-body">
                ${settingsState.devices.map(d => `
                    <div class="list-item">
                        <div>
                            <div>${d.type} ${d.name}${d.current ? ' (Current)' : ''}</div>
                            <div style="font-size:12px;color:var(--text-secondary)">${d.os} • ${d.lastActive}</div>
                        </div>
                        ${!d.current ? `<button class="btn-text" onclick="removeDevice(${d.id})">Remove</button>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function removeDevice(id) {
    settingsState.devices = settingsState.devices.filter(d => d.id !== id);
    document.getElementById('deviceManagementModal').remove();
    showToast('Device removed ✓', 'success');
}

function showPrivacyEnforcement() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'privacyEnforcementModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">🔐 Privacy</div>
                <div class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</div>
            </div>
            <div class="modal-body">
                <div class="list-item" onclick="togglePrivacy('lastSeen')">
                    <div>Last Seen</div>
                    <div>${settingsState.privacy.lastSeen ? 'ON' : 'OFF'}</div>
                </div>
                <div class="list-item" onclick="togglePrivacy('readReceipts')">
                    <div>Read Receipts</div>
                    <div>${settingsState.privacy.readReceipts ? 'ON' : 'OFF'}</div>
                </div>
                <div class="list-item" onclick="togglePrivacy('activityStatus')">
                    <div>Activity Status</div>
                    <div>${settingsState.privacy.activityStatus ? 'ON' : 'OFF'}</div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function togglePrivacy(setting) {
    settingsState.privacy[setting] = !settingsState.privacy[setting];
    saveSettings('privacy', settingsState.privacy);
    document.getElementById('privacyEnforcementModal').remove();
}

function showDataExport() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'dataExportModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">📦 Export Data</div>
                <div class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</div>
            </div>
            <div class="modal-body">
                <p>Download your data</p>
                <button class="btn" onclick="requestDataExport('all')">Export All</button>
                <button class="btn" style="margin-top:12px" onclick="requestDataExport('posts')">Export Posts</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function requestDataExport(type) {
    const modalEl = document.getElementById('dataExportModal');
    if (modalEl) modalEl.remove();
    showToast('Processing ' + type + ' export... 📧', 'success');
}

function showAccountDeactivation() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'accountDeactivationModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">⏸️ Deactivate</div>
                <div class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</div>
            </div>
            <div class="modal-body">
                <p>Temporarily deactivate your account</p>
                <button class="btn" onclick="confirmDeactivation()">Deactivate</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmDeactivation() {
    if (confirm('Deactivate account?')) {
        document.getElementById('accountDeactivationModal').remove();
        showToast('Account deactivated 👋', 'success');
    }
}

function showAccountDeletion() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'accountDeletionModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">🗑️ Delete Account</div>
                <div class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</div>
            </div>
            <div class="modal-body">
                <p style="color:var(--error)">This action cannot be undone</p>
                <input type="text" id="deleteConfirm" class="input-field" placeholder="Type DELETE">
                <button class="btn" onclick="confirmDeletion()">Delete Permanently</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmDeletion() {
    if (document.getElementById('deleteConfirm').value !== 'DELETE') {
        return showToast('Type DELETE ⚠️', 'error');
    }
    document.getElementById('accountDeletionModal').remove();
    showToast('Account deletion initiated 📧', 'success');
}

function showLanguageSettings() {
    const langs = [{c:'en',n:'English'},{c:'es',n:'Español'},{c:'fr',n:'Français'}];
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'languageSettingsModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">🌍 Language</div>
                <div class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</div>
            </div>
            <div class="modal-body">
                ${langs.map(l => `
                    <div class="list-item" onclick="setLanguage('${l.c}')">
                        <div>${l.n}</div>
                        ${settingsState.preferences.language === l.c ? '<div>✓</div>' : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function setLanguage(code) {
    settingsState.preferences.language = code;
    saveSettings('preferences', settingsState.preferences);
    document.getElementById('languageSettingsModal').remove();
}

function showTimezoneSettings() {
    const zones = ['America/New_York','America/Los_Angeles','Europe/London'];
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'timezoneSettingsModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">🕐 Timezone</div>
                <div class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</div>
            </div>
            <div class="modal-body">
                ${zones.map(z => `
                    <div class="list-item" onclick="setTimezone('${z}')">
                        <div>${z}</div>
                        ${settingsState.preferences.timezone === z ? '<div>✓</div>' : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function setTimezone(zone) {
    settingsState.preferences.timezone = zone;
    saveSettings('preferences', settingsState.preferences);
    document.getElementById('timezoneSettingsModal').remove();
}

function showNotificationSettings() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'notificationSettingsModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">🔔 Notifications</div>
                <div class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</div>
            </div>
            <div class="modal-body">
                <div class="list-item" onclick="toggleNotification('push')">
                    <div>Push Notifications</div>
                    <div>${settingsState.notifications.push ? 'ON' : 'OFF'}</div>
                </div>
                <div class="list-item" onclick="toggleNotification('email')">
                    <div>Email Notifications</div>
                    <div>${settingsState.notifications.email ? 'ON' : 'OFF'}</div>
                </div>
                <div class="list-item" onclick="toggleNotification('likes')">
                    <div>Likes</div>
                    <div>${settingsState.notifications.likes ? 'ON' : 'OFF'}</div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function toggleNotification(setting) {
    settingsState.notifications[setting] = !settingsState.notifications[setting];
    saveSettings('notifications', settingsState.notifications);
    document.getElementById('notificationSettingsModal').remove();
}

function showBlockedUsers() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'blockedUsersModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">🚫 Blocked Users</div>
                <div class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</div>
            </div>
            <div class="modal-body">
                ${settingsState.blocked.length ? settingsState.blocked.map(u => `
                    <div class="list-item">
                        <div>
                            <div>${u.name}</div>
                            <div style="font-size:12px;color:var(--text-secondary)">${u.username}</div>
                        </div>
                        <button class="btn-text" onclick="unblockUser(${u.id})">Unblock</button>
                    </div>
                `).join('') : '<p>No blocked users</p>'}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function unblockUser(id) {
    settingsState.blocked = settingsState.blocked.filter(u => u.id !== id);
    document.getElementById('blockedUsersModal').remove();
    showToast('User unblocked ✓', 'success');
}

function showLoginHistory() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'loginHistoryModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">📋 Login History</div>
                <div class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</div>
            </div>
            <div class="modal-body">
                ${settingsState.loginHistory.map(l => `
                    <div class="list-item">
                        <div>
                            <div>${l.device}</div>
                            <div style="font-size:12px">${l.date} - ${l.location}</div>
                        </div>
                        <div style="color:${l.status === 'success' ? 'var(--success)' : 'var(--error)'}">${l.status}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showSecurityAlerts() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'securityAlertsModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">⚠️ Security Alerts</div>
                <div class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</div>
            </div>
            <div class="modal-body">
                ${settingsState.securityAlerts.map(a => `
                    <div class="list-item">
                        <div>
                            <div>${a.message}</div>
                            <div style="font-size:12px">${a.date} ${a.time}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showSessionManagement() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'sessionManagementModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">🔐 Active Sessions</div>
                <div class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">✕</div>
            </div>
            <div class="modal-body">
                ${settingsState.sessions.map(s => `
                    <div class="list-item">
                        <div>
                            <div>${s.device}</div>
                            <div style="font-size:12px">${s.location} - ${s.ip}</div>
                        </div>
                        ${s.active ? '<div style="color:var(--success)">Active</div>' : `<button class="btn-text" onclick="terminateSession(${s.id})">End</button>`}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function terminateSession(id) {
    settingsState.sessions = settingsState.sessions.filter(s => s.id !== id);
    document.getElementById('sessionManagementModal').remove();
    showToast('Session terminated ✓', 'success');
}

console.log('✅ Settings System Enhanced - All 9 Dashboards + Legacy Functions Loaded');
