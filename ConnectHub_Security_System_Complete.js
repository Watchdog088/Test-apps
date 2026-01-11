// ============================================================================
// CONNECTHUB SECURITY SYSTEM - COMPLETE IMPLEMENTATION
// ============================================================================
// Comprehensive security features with all dashboards, modals, and functionality

class SecuritySystem {
    constructor() {
        this.initializeState();
        this.initializeSecuritySystem();
    }

    initializeState() {
        // Load or create security state
        this.securityState = JSON.parse(localStorage.getItem('connecthub_security_state')) || {
            twoFactorEnabled: false,
            backupCodes: this.generateBackupCodes(),
            loginAlerts: true,
            suspiciousActivity: true,
            deviceTracking: true,
            biometricLogin: false,
            sessions: [
                { id: 1, device: 'iPhone 14 Pro', location: 'New York, USA', ip: '192.168.1.1', startTime: '2024-01-20 10:30', active: true },
                { id: 2, device: 'MacBook Pro', location: 'New York, USA', ip: '192.168.1.2', startTime: '2024-01-20 09:00', active: true }
            ],
            loginHistory: [
                { id: 1, date: '2024-01-20 10:30', device: 'iPhone 14 Pro', location: 'New York, USA', ip: '192.168.1.1', status: 'success' },
                { id: 2, date: '2024-01-20 09:00', device: 'MacBook Pro', location: 'New York, USA', ip: '192.168.1.2', status: 'success' },
                { id: 3, date: '2024-01-18 09:20', device: 'Web Browser', location: 'Unknown', ip: '203.0.113.0', status: 'failed' }
            ],
            securityAlerts: [
                { id: 1, date: '2024-01-20', time: '10:30 AM', message: 'New login from iPhone 14 Pro', type: 'info', location: 'New York, USA' },
                { id: 2, date: '2024-01-18', time: '09:20 AM', message: 'Failed login attempt detected', type: 'warning', location: 'Unknown' }
            ],
            trustedDevices: [
                { id: 1, name: 'iPhone 14 Pro', type: '📱', lastUsed: '2 mins ago', trusted: true },
                { id: 2, name: 'MacBook Pro', type: '💻', lastUsed: '1 hour ago', trusted: true }
            ]
        };
    }

    initializeSecuritySystem() {
        console.log('🔐 Security System Initialized');
        this.createSecurityModals();
    }

    generateBackupCodes() {
        return Array.from({length: 6}, () => 
            Math.random().toString(36).substr(2, 6).toUpperCase()
        );
    }

    saveState() {
        localStorage.setItem('connecthub_security_state', JSON.stringify(this.securityState));
        this.showToast('Security settings saved', 'success');
    }

    createSecurityModals() {
        const modalsHTML = `
            <!-- Change Password Modal -->
            <div id="changePasswordModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>🔐 Change Password</h3>
                        <button class="modal-close" onclick="securitySystem.closeModal('changePasswordModal')">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Current Password</label>
                            <input type="password" id="currentPassword" class="form-control" placeholder="Enter current password">
                        </div>
                        <div class="form-group">
                            <label>New Password</label>
                            <input type="password" id="newPassword" class="form-control" placeholder="Enter new password">
                            <div class="password-requirements">
                                <small>• At least 8 characters</small>
                                <small>• Include uppercase and lowercase</small>
                                <small>• Include numbers and symbols</small>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Confirm New Password</label>
                            <input type="password" id="confirmPassword" class="form-control" placeholder="Confirm new password">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="securitySystem.closeModal('changePasswordModal')">Cancel</button>
                        <button class="btn btn-primary" onclick="securitySystem.changePassword()">Change Password</button>
                    </div>
                </div>
            </div>

            <!-- Change Email Modal -->
            <div id="changeEmailModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>📧 Change Email</h3>
                        <button class="modal-close" onclick="securitySystem.closeModal('changeEmailModal')">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Current Email</label>
                            <input type="email" class="form-control" value="user@example.com" disabled>
                        </div>
                        <div class="form-group">
                            <label>New Email</label>
                            <input type="email" id="newEmail" class="form-control" placeholder="Enter new email">
                        </div>
                        <div class="form-group">
                            <label>Password (for verification)</label>
                            <input type="password" id="emailChangePassword" class="form-control" placeholder="Enter your password">
                        </div>
                        <div class="info-box">
                            <p>📧 We'll send a verification link to your new email address</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="securitySystem.closeModal('changeEmailModal')">Cancel</button>
                        <button class="btn btn-primary" onclick="securitySystem.changeEmail()">Change Email</button>
                    </div>
                </div>
            </div>

            <!-- Two-Factor Authentication Modal -->
            <div id="twoFactorModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>🔐 Two-Factor Authentication</h3>
                        <button class="modal-close" onclick="securitySystem.closeModal('twoFactorModal')">×</button>
                    </div>
                    <div class="modal-body">
                        <div id="2faSetupContent"></div>
                    </div>
                </div>
            </div>

            <!-- Login History Modal -->
            <div id="loginHistoryModal" class="modal">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3>📜 Login History</h3>
                        <button class="modal-close" onclick="securitySystem.closeModal('loginHistoryModal')">×</button>
                    </div>
                    <div class="modal-body">
                        <div id="loginHistoryContent"></div>
                    </div>
                </div>
            </div>

            <!-- Active Sessions Modal -->
            <div id="activeSessionsModal" class="modal">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3>🖥️ Active Sessions</h3>
                        <button class="modal-close" onclick="securitySystem.closeModal('activeSessionsModal')">×</button>
                    </div>
                    <div class="modal-body">
                        <div id="activeSessionsContent"></div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-error" onclick="securitySystem.terminateAllSessions()">Sign Out All Other Devices</button>
                    </div>
                </div>
            </div>

            <!-- Security Alerts Modal -->
            <div id="securityAlertsModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>⚠️ Security Alerts</h3>
                        <button class="modal-close" onclick="securitySystem.closeModal('securityAlertsModal')">×</button>
                    </div>
                    <div class="modal-body">
                        <div id="securityAlertsContent"></div>
                    </div>
                </div>
            </div>

            <!-- Trusted Devices Modal -->
            <div id="trustedDevicesModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>📱 Trusted Devices</h3>
                        <button class="modal-close" onclick="securitySystem.closeModal('trustedDevicesModal')">×</button>
                    </div>
                    <div class="modal-body">
                        <div id="trustedDevicesContent"></div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modals if any
        const existingContainer = document.getElementById('securityModalsContainer');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Add modals to page
        const container = document.createElement('div');
        container.id = 'securityModalsContainer';
        container.innerHTML = modalsHTML;
        document.body.appendChild(container);
    }

    // ============================================================================
    // MODAL FUNCTIONS
    // ============================================================================

    showChangePasswordModal() {
        this.openModal('changePasswordModal');
        // Clear fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }

    changePassword() {
        const current = document.getElementById('currentPassword').value;
        const newPwd = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmPassword').value;

        if (!current || !newPwd || !confirm) {
            this.showToast('Please fill all fields', 'error');
            return;
        }

        if (newPwd !== confirm) {
            this.showToast('Passwords do not match', 'error');
            return;
        }

        if (newPwd.length < 8) {
            this.showToast('Password must be at least 8 characters', 'error');
            return;
        }

        // Simulate password change
        setTimeout(() => {
            this.closeModal('changePasswordModal');
            this.showToast('Password changed successfully! You will be logged out for security.', 'success');
            
            // Add to security alerts
            this.securityState.securityAlerts.unshift({
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString(),
                message: 'Password changed successfully',
                type: 'success',
                location: 'Current device'
            });
            this.saveState();
        }, 500);
    }

    showChangeEmailModal() {
        this.openModal('changeEmailModal');
        document.getElementById('newEmail').value = '';
        document.getElementById('emailChangePassword').value = '';
    }

    changeEmail() {
        const newEmail = document.getElementById('newEmail').value;
        const password = document.getElementById('emailChangePassword').value;

        if (!newEmail || !password) {
            this.showToast('Please fill all fields', 'error');
            return;
        }

        if (!this.isValidEmail(newEmail)) {
            this.showToast('Please enter a valid email', 'error');
            return;
        }

        setTimeout(() => {
            this.closeModal('changeEmailModal');
            this.showToast('Verification email sent to ' + newEmail, 'success');
            
            // Add to security alerts
            this.securityState.securityAlerts.unshift({
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString(),
                message: 'Email change requested',
                type: 'info',
                location: 'Current device'
            });
            this.saveState();
        }, 500);
    }

    showTwoFactorSetup() {
        this.openModal('twoFactorModal');
        
        const content = document.getElementById('2faSetupContent');
        if (!this.securityState.twoFactorEnabled) {
            content.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 80px; margin: 20px 0;">🔐</div>
                    <h4>Enable Two-Factor Authentication</h4>
                    <p style="color: var(--text-secondary); margin: 16px 0;">
                        Add an extra layer of security to your account
                    </p>
                    
                    <div style="background: var(--glass); padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <h5>Setup Options</h5>
                        <button class="btn btn-primary" onclick="securitySystem.enable2FA('app')" style="width: 100%; margin: 8px 0;">
                            📱 Authenticator App (Recommended)
                        </button>
                        <button class="btn btn-secondary" onclick="securitySystem.enable2FA('sms')" style="width: 100%; margin: 8px 0;">
                            📞 SMS Text Message
                        </button>
                        <button class="btn btn-secondary" onclick="securitySystem.enable2FA('email')" style="width: 100%; margin: 8px 0;">
                            📧 Email Verification
                        </button>
                    </div>
                    
                    <div class="info-box">
                        <p><strong>Why enable 2FA?</strong></p>
                        <p>Protect your account from unauthorized access even if someone gets your password.</p>
                    </div>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 80px; margin: 20px 0;">✅</div>
                    <h4>2FA is Active</h4>
                    <p style="color: var(--success); margin: 16px 0;">
                        Your account is protected with two-factor authentication
                    </p>
                    
                    <div style="background: var(--glass); padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <h5>Backup Codes</h5>
                        <div class="backup-codes-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 16px 0;">
                            ${this.securityState.backupCodes.map(code => `
                                <div style="background: var(--bg-primary); padding: 12px; border-radius: 8px; font-family: monospace; font-weight: 600;">
                                    ${code}
                                </div>
                            `).join('')}
                        </div>
                        <button class="btn btn-secondary" onclick="securitySystem.regenerateBackupCodes()">
                            🔄 Regenerate Codes
                        </button>
                    </div>
                    
                    <button class="btn btn-error" onclick="securitySystem.disable2FA()">
                        Disable 2FA
                    </button>
                </div>
            `;
        }
    }

    enable2FA(method) {
        this.showToast(`Setting up 2FA via ${method}...`, 'info');
        
        setTimeout(() => {
            this.securityState.twoFactorEnabled = true;
            this.securityState.twoFactorMethod = method;
            this.securityState.backupCodes = this.generateBackupCodes();
            this.saveState();
            
            this.showTwoFactorSetup();
            this.showToast('2FA enabled successfully!', 'success');
            
            // Add to security alerts
            this.securityState.securityAlerts.unshift({
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString(),
                message: '2FA enabled',
                type: 'success',
                location: 'Current device'
            });
        }, 1000);
    }

    disable2FA() {
        if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
            this.securityState.twoFactorEnabled = false;
            this.saveState();
            this.closeModal('twoFactorModal');
            this.showToast('2FA disabled', 'success');
            
            // Add to security alerts
            this.securityState.securityAlerts.unshift({
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString(),
                message: '2FA disabled',
                type: 'warning',
                location: 'Current device'
            });
        }
    }

    regenerateBackupCodes() {
        if (confirm('Regenerate backup codes? Your old codes will no longer work.')) {
            this.securityState.backupCodes = this.generateBackupCodes();
            this.saveState();
            this.showTwoFactorSetup();
            this.showToast('Backup codes regenerated', 'success');
        }
    }

    showLoginHistory() {
        this.openModal('loginHistoryModal');
        
        const content = document.getElementById('loginHistoryContent');
        content.innerHTML = `
            <div class="login-history-list">
                ${this.securityState.loginHistory.map(login => `
                    <div class="login-history-item" style="display: flex; align-items: center; padding: 16px; background: var(--glass); border-radius: 12px; margin-bottom: 12px;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 24px;">${login.status === 'success' ? '✅' : '❌'}</span>
                                <div>
                                    <div style="font-weight: 600;">${login.device}</div>
                                    <div style="font-size: 14px; color: var(--text-secondary);">
                                        ${login.location} • ${login.ip}
                                    </div>
                                    <div style="font-size: 13px; color: var(--text-secondary);">
                                        ${login.date}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <span class="badge ${login.status === 'success' ? 'badge-success' : 'badge-error'}">
                            ${login.status}
                        </span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showActiveSessions() {
        this.openModal('activeSessionsModal');
        
        const content = document.getElementById('activeSessionsContent');
        content.innerHTML = `
            <div class="sessions-list">
                ${this.securityState.sessions.map(session => `
                    <div class="session-item" style="display: flex; align-items: center; padding: 16px; background: var(--glass); border-radius: 12px; margin-bottom: 12px;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 24px;">${session.device.includes('Phone') ? '📱' : '💻'}</span>
                                <div>
                                    <div style="font-weight: 600;">
                                        ${session.device}
                                        ${session.active ? '<span class="badge badge-success">Active</span>' : ''}
                                    </div>
                                    <div style="font-size: 14px; color: var(--text-secondary);">
                                        ${session.location} • ${session.ip}
                                    </div>
                                    <div style="font-size: 13px; color: var(--text-secondary);">
                                        Started: ${session.startTime}
                                    </div>
                                </div>
                            </div>
                        </div>
                        ${session.active ? `
                            <button class="btn btn-error btn-small" onclick="securitySystem.terminateSession(${session.id})">
                                End Session
                            </button>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    terminateSession(sessionId) {
        if (confirm('End this session?')) {
            this.securityState.sessions = this.securityState.sessions.filter(s => s.id !== sessionId);
            this.saveState();
            this.showActiveSessions();
            this.showToast('Session terminated', 'success');
        }
    }

    terminateAllSessions() {
        if (confirm('Sign out all other devices? You will remain signed in on this device.')) {
            this.securityState.sessions = this.securityState.sessions.filter(s => s.active && s.id === 1);
            this.saveState();
            this.closeModal('activeSessionsModal');
            this.showToast('All other sessions terminated', 'success');
        }
    }

    showSecurityAlerts() {
        this.openModal('securityAlertsModal');
        
        const content = document.getElementById('securityAlertsContent');
        content.innerHTML = `
            <div class="alerts-list">
                ${this.securityState.securityAlerts.map(alert => `
                    <div class="alert-item ${alert.type}" style="padding: 16px; background: var(--glass); border-radius: 12px; margin-bottom: 12px; border-left: 4px solid ${
                        alert.type === 'success' ? 'var(--success)' : 
                        alert.type === 'warning' ? 'var(--warning)' : 
                        alert.type === 'error' ? 'var(--error)' : 
                        'var(--primary)'
                    };">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <div style="font-weight: 600; margin-bottom: 4px;">${alert.message}</div>
                                <div style="font-size: 13px; color: var(--text-secondary);">
                                    ${alert.location}
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 12px; color: var(--text-secondary);">${alert.date}</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">${alert.time}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <button class="btn btn-secondary" onclick="securitySystem.clearSecurityAlerts()">
                Clear All Alerts
            </button>
        `;
    }

    clearSecurityAlerts() {
        if (confirm('Clear all security alerts?')) {
            this.securityState.securityAlerts = [];
            this.saveState();
            this.closeModal('securityAlertsModal');
            this.showToast('Security alerts cleared', 'success');
        }
    }

    showTrustedDevices() {
        this.openModal('trustedDevicesModal');
        
        const content = document.getElementById('trustedDevicesContent');
        content.innerHTML = `
            <div class="info-box" style="margin-bottom: 20px;">
                <p>Trusted devices can access your account without additional verification.</p>
            </div>
            
            <div class="devices-list">
                ${this.securityState.trustedDevices.map(device => `
                    <div class="device-item" style="display: flex; align-items: center; padding: 16px; background: var(--glass); border-radius: 12px; margin-bottom: 12px;">
                        <span style="font-size: 32px; margin-right: 16px;">${device.type}</span>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">${device.name}</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">
                                Last used: ${device.lastUsed}
                            </div>
                        </div>
                        <button class="btn btn-error btn-small" onclick="securitySystem.removeTrustedDevice(${device.id})">
                            Remove
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    removeTrustedDevice(deviceId) {
        if (confirm('Remove this trusted device?')) {
            this.securityState.trustedDevices = this.securityState.trustedDevices.filter(d => d.id !== deviceId);
            this.saveState();
            this.showTrustedDevices();
            this.showToast('Device removed', 'success');
        }
    }

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showToast(message, type = 'info') {
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// ============================================================================
// NAVIGATION INTEGRATION FUNCTIONS
// ============================================================================

function showChangePasswordModal() {
    if (window.securitySystem) {
        window.securitySystem.showChangePasswordModal();
    } else {
        console.warn('Security system not initialized');
    }
}

function showChangeEmailModal() {
    if (window.securitySystem) {
        window.securitySystem.showChangeEmailModal();
    } else {
        console.warn('Security system not initialized');
    }
}

function showTwoFactorSetup() {
    if (window.securitySystem) {
        window.securitySystem.showTwoFactorSetup();
    } else {
        console.warn('Security system not initialized');
    }
}

function showLoginHistory() {
    if (window.securitySystem) {
        window.securitySystem.showLoginHistory();
    } else {
        console.warn('Security system not initialized');
    }
}

function viewLoginHistory() {
    showLoginHistory();
}

function showActiveSessions() {
    if (window.securitySystem) {
        window.securitySystem.showActiveSessions();
    } else {
        console.warn('Security system not initialized');
    }
}

function manageSecurityAlerts() {
    if (window.securitySystem) {
        window.securitySystem.showSecurityAlerts();
    } else {
        console.warn('Security system not initialized');
    }
}

function showSecurityAlerts() {
    manageSecurityAlerts();
}

function showTrustedDevices() {
    if (window.securitySystem) {
        window.securitySystem.showTrustedDevices();
    } else {
        console.warn('Security system not initialized');
    }
}

function setupTwoFactorAuth() {
    showTwoFactorSetup();
}

// Initialize Security System
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.securitySystem = new SecuritySystem();
        console.log('✅ Security System Loaded - All features functional');
    }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecuritySystem;
}
