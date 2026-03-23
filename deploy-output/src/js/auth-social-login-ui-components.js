/**
 * Authentication Social Media Login Interface
 * Complete Social OAuth Integration for ConnectHub
 * 
 * This interface provides:
 * 1. Social Login Provider Selection
 * 2. OAuth Connection Management 
 * 3. Account Linking Interface
 * 4. Social Profile Import
 * 5. Connected Accounts Management
 * 6. Privacy & Permission Controls
 */

class AuthSocialLoginUI {
    constructor() {
        this.connectedAccounts = new Map();
        this.availableProviders = [
            {
                id: 'google',
                name: 'Google',
                icon: 'fab fa-google',
                color: '#4285f4',
                connected: false
            },
            {
                id: 'facebook',
                name: 'Facebook', 
                icon: 'fab fa-facebook-f',
                color: '#1877f2',
                connected: false
            },
            {
                id: 'apple',
                name: 'Apple',
                icon: 'fab fa-apple',
                color: '#000000',
                connected: false
            },
            {
                id: 'twitter',
                name: 'Twitter/X',
                icon: 'fab fa-x-twitter',
                color: '#000000',
                connected: false
            },
            {
                id: 'linkedin',
                name: 'LinkedIn',
                icon: 'fab fa-linkedin-in',
                color: '#0077b5',
                connected: false
            },
            {
                id: 'github',
                name: 'GitHub',
                icon: 'fab fa-github',
                color: '#333333',
                connected: false
            },
            {
                id: 'microsoft',
                name: 'Microsoft',
                icon: 'fab fa-microsoft',
                color: '#00a1f1',
                connected: false
            },
            {
                id: 'discord',
                name: 'Discord',
                icon: 'fab fa-discord',
                color: '#5865f2',
                connected: false
            }
        ];
        
        this.initializeSocialLoginSystem();
    }

    initializeSocialLoginSystem() {
        console.log('Social Login System initialized');
        this.addStyles();
        this.loadConnectedAccounts();
        this.bindGlobalEvents();
    }

    addStyles() {
        if (!document.getElementById('social-login-styles')) {
            const style = document.createElement('style');
            style.id = 'social-login-styles';
            style.textContent = `
                .social-modal-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center;
                    z-index: 10000; opacity: 0; visibility: hidden; transition: all 0.3s ease;
                }
                .social-modal-overlay.show { opacity: 1; visibility: visible; }
                .social-modal { background: #fff; border-radius: 16px; width: 95%; max-width: 700px; max-height: 90vh; 
                    overflow-y: auto; transform: scale(0.9); transition: transform 0.3s ease; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
                .social-modal-overlay.show .social-modal { transform: scale(1); }
                .social-modal-header { padding: 25px 30px; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: space-between; }
                .social-modal-content { padding: 30px; }
                .social-close-btn { background: none; border: none; font-size: 20px; color: #666; cursor: pointer; 
                    padding: 8px; border-radius: 50%; transition: all 0.2s ease; }
                .social-close-btn:hover { background: #f5f5f5; }
                .social-login-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; }
                .social-provider-card { border: 2px solid #e9ecef; border-radius: 12px; padding: 20px; cursor: pointer; 
                    transition: all 0.3s ease; display: flex; align-items: center; gap: 15px; }
                .social-provider-card:hover { border-color: var(--provider-color); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .social-provider-card.connected { border-color: #28a745; background: linear-gradient(135deg, #f8fff9 0%, #e8f5e8 100%); }
                .social-provider-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; 
                    justify-content: center; color: white; font-size: 22px; flex-shrink: 0; }
                .social-provider-info { flex: 1; }
                .social-provider-name { font-weight: 600; margin: 0 0 5px 0; font-size: 16px; }
                .social-provider-status { margin: 0; font-size: 13px; color: #666; }
                .social-provider-status.connected { color: #28a745; font-weight: 500; }
                .social-provider-action { background: none; border: 2px solid; border-radius: 8px; padding: 8px 16px; 
                    cursor: pointer; font-weight: 500; transition: all 0.2s ease; font-size: 14px; }
                .social-provider-action.connect { border-color: var(--provider-color); color: var(--provider-color); }
                .social-provider-action.connect:hover { background: var(--provider-color); color: white; }
                .social-provider-action.disconnect { border-color: #dc3545; color: #dc3545; }
                .social-provider-action.disconnect:hover { background: #dc3545; color: white; }
                .social-permissions-section { background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; }
                .permissions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
                .permission-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: white; border-radius: 8px; }
                .permission-toggle { position: relative; width: 44px; height: 24px; background: #ccc; border-radius: 12px; 
                    cursor: pointer; transition: all 0.3s ease; }
                .permission-toggle.active { background: #007bff; }
                .permission-toggle::after { content: ''; position: absolute; width: 20px; height: 20px; background: white; 
                    border-radius: 50%; top: 2px; left: 2px; transition: all 0.3s ease; }
                .permission-toggle.active::after { left: 22px; }
                .social-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 20px; 
                    text-align: center; margin: 20px 0; }
                .social-stat { padding: 15px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
                    border-radius: 12px; }
                .social-stat h3 { margin: 0 0 5px 0; font-size: 24px; font-weight: 700; color: #007bff; }
                .social-stat p { margin: 0; color: #666; font-size: 14px; }
                .social-toast { position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 12px; 
                    color: white; z-index: 10001; transform: translateX(100%); transition: all 0.3s ease; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
                .social-toast.show { transform: translateX(0); }
                .social-toast.success { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); }
                .social-toast.error { background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%); }
                .social-toast.warning { background: linear-gradient(135deg, #ffc107 0%, #ffca2c 100%); color: #212529; }
                .btn { padding: 12px 24px; border: none; border-radius: 10px; cursor: pointer; font-weight: 500; 
                    transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 10px; font-size: 14px; }
                .btn-primary { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; }
                .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,123,255,0.3); }
                .btn-secondary { background: #6c757d; color: white; }
                .btn-outline { background: transparent; color: #007bff; border: 2px solid #007bff; }
                .btn-outline:hover { background: #007bff; color: white; }
                .btn-danger { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; }
                .btn-full { width: 100%; justify-content: center; }
                .connection-status { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; }
                .status-indicator { width: 8px; height: 8px; border-radius: 50%; }
                .status-indicator.connected { background: #28a745; }
                .status-indicator.disconnected { background: #dc3545; }
                .account-preview { border: 1px solid #e9ecef; border-radius: 12px; padding: 15px; margin-top: 15px; 
                    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); }
                .account-preview-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
                .account-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
                .import-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 15px; }
                .import-option { display: flex; align-items: center; gap: 8px; font-size: 13px; }
                .import-option input[type="checkbox"] { margin: 0; }
            `;
            document.head.appendChild(style);
        }
    }

    bindGlobalEvents() {
        // Handle OAuth callback messages
        window.addEventListener('message', (event) => {
            if (event.data.type === 'oauth-callback') {
                this.handleOAuthCallback(event.data);
            }
        });

        // Close modals on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    loadConnectedAccounts() {
        // Simulate loading connected accounts from storage
        const saved = localStorage.getItem('connectedSocialAccounts');
        if (saved) {
            const accounts = JSON.parse(saved);
            accounts.forEach(account => {
                this.connectedAccounts.set(account.providerId, account);
                const provider = this.availableProviders.find(p => p.id === account.providerId);
                if (provider) provider.connected = true;
            });
        }
    }

    saveConnectedAccounts() {
        const accounts = Array.from(this.connectedAccounts.values());
        localStorage.setItem('connectedSocialAccounts', JSON.stringify(accounts));
    }

    // 1. Social Login Provider Selection
    showSocialLoginSelection() {
        const modal = document.createElement('div');
        modal.className = 'social-modal-overlay';
        modal.id = 'social-login-modal';
        modal.innerHTML = `
            <div class="social-modal">
                <div class="social-modal-header">
                    <h2>🔗 Connect Social Accounts</h2>
                    <button class="social-close-btn" onclick="socialLoginUI.closeModal('social-login-modal')">×</button>
                </div>
                <div class="social-modal-content">
                    <div class="social-stats">
                        <div class="social-stat">
                            <h3>${this.connectedAccounts.size}</h3>
                            <p>Connected</p>
                        </div>
                        <div class="social-stat">
                            <h3>${this.availableProviders.length}</h3>
                            <p>Available</p>
                        </div>
                        <div class="social-stat">
                            <h3>100%</h3>
                            <p>Secure</p>
                        </div>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <h3>Available Providers</h3>
                        <p style="color: #666; margin-bottom: 20px;">Connect your social media accounts for faster login and enhanced features.</p>
                        
                        <div class="social-login-grid">
                            ${this.availableProviders.map(provider => this.renderProviderCard(provider)).join('')}
                        </div>
                    </div>

                    <div class="social-permissions-section">
                        <h4>🔒 Privacy & Permissions</h4>
                        <p style="margin-bottom: 15px; color: #666;">Control what information we can access from your social accounts:</p>
                        
                        <div class="permissions-grid">
                            <div class="permission-item">
                                <div class="permission-toggle active" onclick="socialLoginUI.togglePermission(this, 'basic_info')"></div>
                                <div>
                                    <strong>Basic Info</strong>
                                    <div style="font-size: 12px; color: #666;">Name, email, profile picture</div>
                                </div>
                            </div>
                            <div class="permission-item">
                                <div class="permission-toggle" onclick="socialLoginUI.togglePermission(this, 'friend_list')"></div>
                                <div>
                                    <strong>Friend Connections</strong>
                                    <div style="font-size: 12px; color: #666;">Find friends on ConnectHub</div>
                                </div>
                            </div>
                            <div class="permission-item">
                                <div class="permission-toggle" onclick="socialLoginUI.togglePermission(this, 'posts')"></div>
                                <div>
                                    <strong>Public Posts</strong>
                                    <div style="font-size: 12px; color: #666;">Import recent public posts</div>
                                </div>
                            </div>
                            <div class="permission-item">
                                <div class="permission-toggle active" onclick="socialLoginUI.togglePermission(this, 'profile_sync')"></div>
                                <div>
                                    <strong>Profile Sync</strong>
                                    <div style="font-size: 12px; color: #666;">Keep profile info updated</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="background: #e3f2fd; border-radius: 12px; padding: 20px; margin-top: 20px;">
                        <h4 style="color: #1976d2; margin: 0 0 10px 0;">🛡️ Your Privacy is Protected</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #1976d2;">
                            <li>We never post without your permission</li>
                            <li>Your data is encrypted and secure</li>
                            <li>You can disconnect anytime</li>
                            <li>Full control over what we access</li>
                        </ul>
                    </div>

                    <div style="display: flex; gap: 15px; margin-top: 25px;">
                        <button class="btn btn-secondary" onclick="socialLoginUI.closeModal('social-login-modal')">
                            Maybe Later
                        </button>
                        <button class="btn btn-primary" onclick="socialLoginUI.showConnectedAccountsManager()">
                            <i class="fas fa-cog"></i> Manage Connected Accounts
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    renderProviderCard(provider) {
        const isConnected = provider.connected;
        return `
            <div class="social-provider-card ${isConnected ? 'connected' : ''}" 
                 style="--provider-color: ${provider.color};"
                 onclick="socialLoginUI.${isConnected ? 'disconnectProvider' : 'connectProvider'}('${provider.id}')">
                <div class="social-provider-icon" style="background: ${provider.color};">
                    <i class="${provider.icon}"></i>
                </div>
                <div class="social-provider-info">
                    <h4 class="social-provider-name">${provider.name}</h4>
                    <p class="social-provider-status ${isConnected ? 'connected' : ''}">
                        ${isConnected ? '✓ Connected' : 'Not connected'}
                    </p>
                </div>
                <button class="social-provider-action ${isConnected ? 'disconnect' : 'connect'}" 
                        style="--provider-color: ${provider.color};">
                    ${isConnected ? 'Disconnect' : 'Connect'}
                </button>
            </div>
        `;
    }

    // 2. OAuth Connection Management
    async connectProvider(providerId) {
        const provider = this.availableProviders.find(p => p.id === providerId);
        if (!provider) return;

        this.showToast(`Connecting to ${provider.name}...`, 'info');

        try {
            // Open OAuth popup
            const popup = window.open(
                `/api/auth/oauth/${providerId}`,
                'oauth-popup',
                'width=500,height=600,scrollbars=yes,resizable=yes'
            );

            // Wait for OAuth completion
            const result = await this.waitForOAuthCallback(popup);
            
            if (result.success) {
                // Save connected account
                const accountData = {
                    providerId: providerId,
                    providerName: provider.name,
                    accountId: result.accountId,
                    displayName: result.displayName,
                    email: result.email,
                    avatar: result.avatar,
                    connectedAt: new Date().toISOString(),
                    permissions: result.permissions || ['basic_info', 'profile_sync']
                };

                this.connectedAccounts.set(providerId, accountData);
                provider.connected = true;
                this.saveConnectedAccounts();

                this.showToast(`Successfully connected to ${provider.name}!`, 'success');
                
                // Refresh the UI
                this.closeAllModals();
                setTimeout(() => this.showSocialLoginSelection(), 300);
                
                // Show profile import option
                setTimeout(() => this.showProfileImportOptions(accountData), 1000);
            } else {
                throw new Error(result.error || 'Failed to connect account');
            }
        } catch (error) {
            this.showToast(`Failed to connect to ${provider.name}: ${error.message}`, 'error');
        }
    }

    async disconnectProvider(providerId) {
        const provider = this.availableProviders.find(p => p.id === providerId);
        const account = this.connectedAccounts.get(providerId);
        
        if (!provider || !account) return;

        if (confirm(`Are you sure you want to disconnect your ${provider.name} account (${account.displayName})?`)) {
            try {
                // Call API to disconnect
                await fetch(`/api/auth/oauth/${providerId}/disconnect`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });

                this.connectedAccounts.delete(providerId);
                provider.connected = false;
                this.saveConnectedAccounts();

                this.showToast(`Disconnected from ${provider.name}`, 'success');
                
                // Refresh the UI
                this.closeAllModals();
                setTimeout(() => this.showSocialLoginSelection(), 300);
            } catch (error) {
                this.showToast(`Failed to disconnect from ${provider.name}`, 'error');
            }
        }
    }

    waitForOAuthCallback(popup) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                popup.close();
                reject(new Error('OAuth timeout'));
            }, 60000); // 1 minute timeout

            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    clearTimeout(timeout);
                    reject(new Error('OAuth cancelled'));
                }
            }, 1000);

            // Listen for callback message
            const messageHandler = (event) => {
                if (event.data.type === 'oauth-callback') {
                    clearInterval(checkClosed);
                    clearTimeout(timeout);
                    window.removeEventListener('message', messageHandler);
                    popup.close();
                    
                    if (event.data.success) {
                        resolve(event.data);
                    } else {
                        reject(new Error(event.data.error));
                    }
                }
            };

            window.addEventListener('message', messageHandler);
        });
    }

    handleOAuthCallback(data) {
        // This would be called from the OAuth callback page
        console.log('OAuth callback received:', data);
    }

    // 3. Account Linking Interface  
    showAccountLinkingInterface() {
        const modal = document.createElement('div');
        modal.className = 'social-modal-overlay';
        modal.id = 'account-linking-modal';
        modal.innerHTML = `
            <div class="social-modal">
                <div class="social-modal-header">
                    <h2>🔗 Link Existing Account</h2>
                    <button class="social-close-btn" onclick="socialLoginUI.closeModal('account-linking-modal')">×</button>
                </div>
                <div class="social-modal-content">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <div style="font-size: 60px; margin-bottom: 15px;">🔗</div>
                        <h3>Account Found!</h3>
                        <p>We found an existing account that may belong to you. Would you like to link it?</p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                        <div style="text-align: center; padding: 20px; border: 2px solid #e9ecef; border-radius: 12px;">
                            <img src="/src/assets/default-avatar.png" alt="Current Account" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 10px;">
                            <h4>Current Account</h4>
                            <p style="color: #666; margin: 0;">john.doe@gmail.com</p>
                            <small style="color: #999;">Created: March 2024</small>
                        </div>
                        <div style="text-align: center; padding: 20px; border: 2px solid #007bff; border-radius: 12px; background: #f8fbff;">
                            <img src="/src/assets/google-avatar.png" alt="Google Account" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 10px;">
                            <h4>Google Account</h4>
                            <p style="color: #666; margin: 0;">john.doe@gmail.com</p>
                            <small style="color: #999;">Last used: Today</small>
                        </div>
                    </div>

                    <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                        <h4>What happens when you link accounts?</h4>
                        <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
                            <li>Your Google profile info will be imported</li>
                            <li>You can log in with either email or Google</li>
                            <li>Your existing data will be preserved</li>
                            <li>You'll have enhanced security options</li>
                        </ul>
                    </div>

                    <div style="background: #fff3cd; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                        <h4 style="color: #856404; margin: 0 0 10px 0;">⚠️ Different Email Detected</h4>
                        <p style="color: #856404; margin: 0; font-size: 14px;">
                            The email addresses don't match. Linking will merge the accounts but keep both email addresses for login.
                        </p>
                    </div>

                    <div style="display: flex; gap: 15px;">
                        <button class="btn btn-secondary" onclick="socialLoginUI.closeModal('account-linking-modal')">
                            Not Now
                        </button>
                        <button class="btn btn-outline" onclick="socialLoginUI.createNewAccount()">
                            Create Separate Account
                        </button>
                        <button class="btn btn-primary" onclick="socialLoginUI.linkAccounts()">
                            <i class="fas fa-link"></i> Link Accounts
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    linkAccounts() {
        this.showToast('Accounts linked successfully! 🔗', 'success');
        this.closeModal('account-linking-modal');
    }

    createNewAccount() {
        this.showToast('Creating separate account...', 'info');
        this.closeModal('account-linking-modal');
    }

    // 4. Social Profile Import
    showProfileImportOptions(accountData) {
        const modal = document.createElement('div');
        modal.className = 'social-modal-overlay';
        modal.id = 'profile-import-modal';
        modal.innerHTML = `
            <div class="social-modal">
                <div class="social-modal-header">
                    <h2>📥 Import Profile Data</h2>
                    <button class="social-close-btn" onclick="socialLoginUI.closeModal('profile-import-modal')">×</button>
                </div>
                <div class="social-modal-content">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <img src="${accountData.avatar}" alt="${accountData.displayName}" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px;">
                        <h3>Welcome, ${accountData.displayName}!</h3>
                        <p>We can import some information from your ${accountData.providerName} account to get you started faster.</p>
                    </div>

                    <div class="account-preview">
                        <div class="account-preview-header">
                            <img src="${accountData.avatar}" alt="Avatar" class="account-avatar">
                            <div>
                                <h4 style="margin: 0;">${accountData.displayName}</h4>
                                <p style="margin: 0; color: #666; font-size: 14px;">${accountData.email}</p>
                            </div>
                        </div>
                        
                        <div class="import-options">
                            <label class="import-option">
                                <input type="checkbox" checked>
                                <span>Profile Picture</span>
                            </label>
                            <label class="import-option">
                                <input type="checkbox" checked>
                                <span>Display Name</span>
                            </label>
                            <label class="import-option">
                                <input type="checkbox" checked>
                                <span>Email Address</span>
                            </label>
                            <label class="import-option">
                                <input type="checkbox">
                                <span>Bio/About</span>
                            </label>
                            <label class="import-option">
                                <input type="checkbox">
                                <span>Location</span>
                            </label>
                            <label class="import-option">
                                <input type="checkbox">
                                <span>Work/Education</span>
                            </label>
                        </div>
                    </div>

                    <div style="background: #fff3cd; border-radius: 12px; padding: 15px; margin: 20px 0;">
                        <h4 style="color: #856404; margin: 0 0 8px 0;">⚠️ Review Before Importing</h4>
                        <p style="color: #856404; margin: 0; font-size: 14px;">
                            Please review the selected information before importing. You can always edit these details later in your profile settings.
                        </p>
                    </div>

                    <div style="display: flex; gap: 15px; margin-top: 25px;">
                        <button class="btn btn-secondary" onclick="socialLoginUI.skipProfileImport()">
                            Skip Import
                        </button>
                        <button class="btn btn-primary" onclick="socialLoginUI.importProfileData()">
                            <i class="fas fa-download"></i> Import Selected Data
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    skipProfileImport() {
        this.showToast('Profile import skipped. You can always import data later!', 'info');
        this.closeModal('profile-import-modal');
    }

    importProfileData() {
        const checkboxes = document.querySelectorAll('#profile-import-modal input[type="checkbox"]:checked');
        const selectedData = Array.from(checkboxes).map(cb => cb.nextElementSibling.textContent);
        
        this.showToast(`Imported: ${selectedData.join(', ')}`, 'success');
        this.closeModal('profile-import-modal');
    }

    // 5. Connected Accounts Management
    showConnectedAccountsManager() {
        const modal = document.createElement('div');
        modal.className = 'social-modal-overlay';
        modal.id = 'accounts-manager-modal';
        modal.innerHTML = `
            <div class="social-modal" style="max-width: 800px;">
                <div class="social-modal-header">
                    <h2>⚙️ Connected Accounts Manager</h2>
                    <button class="social-close-btn" onclick="socialLoginUI.closeModal('accounts-manager-modal')">×</button>
                </div>
                <div class="social-modal-content">
                    <div style="display: flex; gap: 10px; margin-bottom: 25px;">
                        <button class="btn btn-primary" onclick="socialLoginUI.filterAccounts('all')">All Accounts</button>
                        <button class="btn btn-outline" onclick="socialLoginUI.filterAccounts('connected')">Connected</button>
                        <button class="btn btn-outline" onclick="socialLoginUI.filterAccounts('available')">Available</button>
                        <button class="btn btn-outline" onclick="socialLoginUI.addNewProvider()">+ Add Provider</button>
                    </div>

                    <div id="accounts-list">
                        ${this.renderAccountsList()}
                    </div>

                    <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-top: 25px;">
                        <h4>🔧 Account Management Tips</h4>
                        <ul style="margin: 10px 0; color: #666;">
                            <li><strong>Security:</strong> Connected accounts use OAuth 2.0 for secure authentication</li>
                            <li><strong>Privacy:</strong> You control what data each account can access</li>
                            <li><strong>Convenience:</strong> Use any connected account to sign in instantly</li>
                            <li><strong>Sync:</strong> Keep profile information updated across platforms</li>
                        </ul>
                    </div>

                    <div style="display: flex; gap: 15px; margin-top: 25px;">
                        <button class="btn btn-outline" onclick="socialLoginUI.exportAccountData()">
                            <i class="fas fa-download"></i> Export Data
                        </button>
                        <button class="btn btn-secondary" onclick="socialLoginUI.closeModal('accounts-manager-modal')">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    renderAccountsList() {
        return this.availableProviders.map(provider => {
            const account = this.connectedAccounts.get(provider.id);
            const isConnected = provider.connected && account;

            if (isConnected) {
                return `
                    <div style="border: 1px solid #28a745; border-radius: 12px; padding: 20px; margin-bottom: 15px; background: linear-gradient(135deg, #f8fff9 0%, #e8f5e8 100%);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="width: 48px; height: 48px; background: ${provider.color}; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 22px;">
                                    <i class="${provider.icon}"></i>
                                </div>
                                <div>
                                    <h4 style="margin: 0 0 4px 0;">${provider.name}</h4>
                                    <div class="connection-status">
                                        <div class="status-indicator connected"></div>
                                        <span>Connected as ${account.displayName}</span>
                                    </div>
                                </div>
                            </div>
                            <button class="btn btn-outline" onclick="socialLoginUI.manageAccount('${provider.id}')">
                                <i class="fas fa-cog"></i> Manage
                            </button>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; font-size: 13px; color: #666;">
                            <div>
                                <strong>Email:</strong><br>
                                ${account.email || 'Not available'}
                            </div>
                            <div>
                                <strong>Connected:</strong><br>
                                ${new Date(account.connectedAt).toLocaleDateString()}
                            </div>
                            <div>
                                <strong>Permissions:</strong><br>
                                ${account.permissions.length} granted
                            </div>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div style="border: 1px solid #e9ecef; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="width: 48px; height: 48px; background: ${provider.color}; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 22px;">
                                    <i class="${provider.icon}"></i>
                                </div>
                                <div>
                                    <h4 style="margin: 0 0 4px 0;">${provider.name}</h4>
                                    <div class="connection-status">
                                        <div class="status-indicator disconnected"></div>
                                        <span>Not connected</span>
                                    </div>
                                </div>
                            </div>
                            <button class="btn btn-primary" onclick="socialLoginUI.connectProvider('${provider.id}')">
                                <i class="fas fa-plus"></i> Connect
                            </button>
                        </div>
                    </div>
                `;
            }
        }).join('');
    }

    manageAccount(providerId) {
        const provider = this.availableProviders.find(p => p.id === providerId);
        const account = this.connectedAccounts.get(providerId);
        
        if (!provider || !account) return;

        const modal = document.createElement('div');
        modal.className = 'social-modal-overlay';
        modal.id = 'manage-account-modal';
        modal.innerHTML = `
            <div class="social-modal">
                <div class="social-modal-header">
                    <h2>⚙️ Manage ${provider.name} Account</h2>
                    <button class="social-close-btn" onclick="socialLoginUI.closeModal('manage-account-modal')">×</button>
                </div>
                <div class="social-modal-content">
                    <div class="account-preview" style="margin-bottom: 25px;">
                        <div class="account-preview-header">
                            <img src="${account.avatar}" alt="Avatar" class="account-avatar">
                            <div>
                                <h4 style="margin: 0;">${account.displayName}</h4>
                                <p style="margin: 0; color: #666; font-size: 14px;">${account.email}</p>
                                <small style="color: #999;">Connected: ${new Date(account.connectedAt).toLocaleDateString()}</small>
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <h4>🔐 Permissions</h4>
                        <div class="permissions-grid">
                            ${account.permissions.map(permission => `
                                <div class="permission-item">
                                    <div class="permission-toggle active"></div>
                                    <div>
                                        <strong>${this.formatPermissionName(permission)}</strong>
                                        <div style="font-size: 12px; color: #666;">${this.getPermissionDescription(permission)}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                        <h4>📊 Account Usage</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; text-align: center;">
                            <div>
                                <h3 style="margin: 0; color: #007bff;">15</h3>
                                <p style="margin: 0; font-size: 13px; color: #666;">Logins this month</p>
                            </div>
                            <div>
                                <h3 style="margin: 0; color: #28a745;">Active</h3>
                                <p style="margin: 0; font-size: 13px; color: #666;">Connection status</p>
                            </div>
                            <div>
                                <h3 style="margin: 0; color: #17a2b8;">${account.permissions.length}</h3>
                                <p style="margin: 0; font-size: 13px; color: #666;">Permissions granted</p>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 15px;">
                        <button class="btn btn-outline" onclick="socialLoginUI.refreshAccountData('${providerId}')">
                            <i class="fas fa-sync"></i> Refresh Data
                        </button>
                        <button class="btn btn-danger" onclick="socialLoginUI.disconnectProvider('${providerId}')">
                            <i class="fas fa-unlink"></i> Disconnect Account
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    // 6. Privacy & Permission Controls
    togglePermission(toggle, permissionType) {
        toggle.classList.toggle('active');
        const isActive = toggle.classList.contains('active');
        
        this.showToast(`Permission ${permissionType} ${isActive ? 'enabled' : 'disabled'}`, 'info');
    }

    formatPermissionName(permission) {
        const names = {
            'basic_info': 'Basic Info',
            'friend_list': 'Friend Connections',
            'posts': 'Public Posts',
            'profile_sync': 'Profile Sync',
            'email': 'Email Access',
            'location': 'Location Data'
        };
        return names[permission] || permission;
    }

    getPermissionDescription(permission) {
        const descriptions = {
            'basic_info': 'Name, email, profile picture',
            'friend_list': 'Find friends on ConnectHub',
            'posts': 'Import recent public posts',
            'profile_sync': 'Keep profile info updated',
            'email': 'Send notifications and updates',
            'location': 'Location-based features'
        };
        return descriptions[permission] || 'Permission access';
    }

    // Utility Methods
    filterAccounts(filter) {
        // Update active button
        document.querySelectorAll('#accounts-manager-modal .btn').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline');
        });
        event.target.classList.remove('btn-outline');
        event.target.classList.add('btn-primary');
        
        this.showToast(`Showing ${filter} accounts`, 'info');
    }

    addNewProvider() {
        this.showToast('Additional providers can be configured by the administrator', 'info');
    }

    exportAccountData() {
        const data = Array.from(this.connectedAccounts.values());
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'connected-accounts.json';
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Account data exported successfully! 📁', 'success');
    }

    refreshAccountData(providerId) {
        this.showToast(`Refreshing ${providerId} account data...`, 'info');
        // Simulate refresh
        setTimeout(() => {
            this.showToast('Account data refreshed successfully! ✅', 'success');
        }, 2000);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    closeAllModals() {
        document.querySelectorAll('.social-modal-overlay.show').forEach(modal => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.social-toast');
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `social-toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; margin-left: auto; cursor: pointer; padding: 4px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }

    // Quick login for login pages
    renderSocialLoginButtons() {
        return this.availableProviders.slice(0, 4).map(provider => `
            <button class="btn btn-outline btn-full social-login-btn" 
                    style="--provider-color: ${provider.color};" 
                    onclick="socialLoginUI.quickLogin('${provider.id}')">
                <i class="${provider.icon}" style="color: ${provider.color};"></i>
                Continue with ${provider.name}
            </button>
        `).join('');
    }

    async quickLogin(providerId) {
        const provider = this.availableProviders.find(p => p.id === providerId);
        if (!provider) return;

        try {
            await this.connectProvider(providerId);
            // Redirect to dashboard or main app
            window.location.href = '/';
        } catch (error) {
            this.showToast(`Login failed: ${error.message}`, 'error');
        }
    }

    // Demo function for testing
    loadDemoData() {
        const demoAccount = {
            providerId: 'google',
            providerName: 'Google',
            accountId: 'demo_123',
            displayName: 'John Doe',
            email: 'john.doe@gmail.com',
            avatar: '/src/assets/default-avatar.png',
            connectedAt: new Date().toISOString(),
            permissions: ['basic_info', 'profile_sync']
        };

        this.connectedAccounts.set('google', demoAccount);
        this.availableProviders.find(p => p.id === 'google').connected = true;
        this.saveConnectedAccounts();
    }
}

// Initialize the Social Login UI
const socialLoginUI = new AuthSocialLoginUI();

// Make it globally available
window.socialLoginUI = socialLoginUI;

// Demo functions for testing
function demoSocialLogin() {
    socialLoginUI.showSocialLoginSelection();
}

function demoAccountLinking() {
    socialLoginUI.showAccountLinkingInterface();
}

function demoConnectedAccounts() {
    socialLoginUI.loadDemoData();
    socialLoginUI.showConnectedAccountsManager();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSocialLoginUI;
}
