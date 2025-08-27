// Privacy & Security UI Components
// Implements 5 missing UI interfaces for Privacy/Security section

class PrivacySecurityUIComponents {
    constructor() {
        this.reportedContent = [];
        this.blockedUsers = [];
        this.mutedUsers = [];
        this.privacySettings = {
            profileVisibility: 'friends',
            messageFrom: 'everyone',
            postVisibility: 'public',
            locationSharing: false,
            activityStatus: true,
            dataCollection: true,
            analyticsOptIn: false
        };
        this.contentFilters = {
            adultContent: false,
            violentContent: true,
            spamContent: true,
            offensiveLanguage: true,
            politicalContent: false,
            religiousContent: false
        };
        this.exportRequests = [];
        this.init();
    }

    init() {
        this.createModalStructures();
        this.attachEventListeners();
        this.loadUserPreferences();
    }

    createModalStructures() {
        // Create all necessary modal structures for privacy/security UIs
        const modalsHTML = `
            <!-- Content Reporting Modal -->
            <div id="contentReportModal" class="modal" role="dialog" aria-labelledby="reportTitle" aria-hidden="true">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2 id="reportTitle">🚨 Report Content</h2>
                        <button class="modal-close" onclick="this.closest('.modal').classList.remove('active')" aria-label="Close">&times;</button>
                    </div>
                    <div class="modal-body" id="reportContentBody">
                        <!-- Content will be dynamically loaded -->
                    </div>
                </div>
            </div>

            <!-- Block/Mute User Modal -->
            <div id="blockMuteUserModal" class="modal" role="dialog" aria-labelledby="blockMuteTitle" aria-hidden="true">
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h2 id="blockMuteTitle">🚫 User Management</h2>
                        <button class="modal-close" onclick="this.closest('.modal').classList.remove('active')" aria-label="Close">&times;</button>
                    </div>
                    <div class="modal-body" id="blockMuteUserBody">
                        <!-- Content will be dynamically loaded -->
                    </div>
                </div>
            </div>

            <!-- Privacy Policy & Terms Modal -->
            <div id="privacyPolicyModal" class="modal" role="dialog" aria-labelledby="privacyTitle" aria-hidden="true">
                <div class="modal-content" style="max-width: 800px; max-height: 90vh;">
                    <div class="modal-header">
                        <h2 id="privacyTitle">📜 Legal Documents</h2>
                        <button class="modal-close" onclick="this.closest('.modal').classList.remove('active')" aria-label="Close">&times;</button>
                    </div>
                    <div class="modal-body" id="privacyPolicyBody" style="max-height: 70vh; overflow-y: auto;">
                        <!-- Content will be dynamically loaded -->
                    </div>
                </div>
            </div>

            <!-- Data Export Modal -->
            <div id="dataExportModal" class="modal" role="dialog" aria-labelledby="dataExportTitle" aria-hidden="true">
                <div class="modal-content" style="max-width: 750px;">
                    <div class="modal-header">
                        <h2 id="dataExportTitle">📥 Data Export & Privacy</h2>
                        <button class="modal-close" onclick="this.closest('.modal').classList.remove('active')" aria-label="Close">&times;</button>
                    </div>
                    <div class="modal-body" id="dataExportBody">
                        <!-- Content will be dynamically loaded -->
                    </div>
                </div>
            </div>

            <!-- Content Filter Settings Modal -->
            <div id="contentFilterModal" class="modal" role="dialog" aria-labelledby="contentFilterTitle" aria-hidden="true">
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h2 id="contentFilterTitle">🛡️ Content Filter Settings</h2>
                        <button class="modal-close" onclick="this.closest('.modal').classList.remove('active')" aria-label="Close">&times;</button>
                    </div>
                    <div class="modal-body" id="contentFilterBody">
                        <!-- Content will be dynamically loaded -->
                    </div>
                </div>
            </div>
        `;

        // Append modals to body if they don't exist
        if (!document.getElementById('contentReportModal')) {
            document.body.insertAdjacentHTML('beforeend', modalsHTML);
        }
    }

    attachEventListeners() {
        // Global keyboard shortcuts for security features
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                this.showQuickReportInterface();
            }
            if (e.ctrlKey && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                this.showBlockMuteInterface();
            }
        });

        // Context menu for reporting content
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.post, .message, .comment')) {
                e.preventDefault();
                this.showContextualReportMenu(e);
            }
        });
    }

    loadUserPreferences() {
        // Load user preferences from localStorage
        const savedPrivacy = localStorage.getItem('privacySettings');
        const savedFilters = localStorage.getItem('contentFilters');
        const savedBlocked = localStorage.getItem('blockedUsers');
        const savedMuted = localStorage.getItem('mutedUsers');

        if (savedPrivacy) this.privacySettings = JSON.parse(savedPrivacy);
        if (savedFilters) this.contentFilters = JSON.parse(savedFilters);
        if (savedBlocked) this.blockedUsers = JSON.parse(savedBlocked);
        if (savedMuted) this.mutedUsers = JSON.parse(savedMuted);
    }

    saveUserPreferences() {
        localStorage.setItem('privacySettings', JSON.stringify(this.privacySettings));
        localStorage.setItem('contentFilters', JSON.stringify(this.contentFilters));
        localStorage.setItem('blockedUsers', JSON.stringify(this.blockedUsers));
        localStorage.setItem('mutedUsers', JSON.stringify(this.mutedUsers));
    }

    // 1. Content Reporting Interface
    showContentReportInterface(contentId = null, contentType = 'post', contentPreview = '') {
        const modal = document.getElementById('contentReportModal');
        const body = document.getElementById('reportContentBody');

        body.innerHTML = `
            <div class="privacy-interface">
                <div class="report-header">
                    <div class="alert-icon">🚨</div>
                    <h3>Report Inappropriate Content</h3>
                    <p>Help us keep ConnectHub safe for everyone by reporting content that violates our community guidelines.</p>
                </div>

                ${contentPreview ? `
                    <div class="reported-content-preview">
                        <h4>Content Being Reported:</h4>
                        <div class="content-preview">${contentPreview}</div>
                    </div>
                ` : ''}

                <div class="report-form">
                    <div class="form-group">
                        <label for="reportReason">Reason for Report</label>
                        <select id="reportReason" class="form-control" required>
                            <option value="">Select a reason</option>
                            <option value="harassment">Harassment or Bullying</option>
                            <option value="hate-speech">Hate Speech</option>
                            <option value="violence">Violence or Threats</option>
                            <option value="spam">Spam or Fake Content</option>
                            <option value="adult-content">Adult or Sexual Content</option>
                            <option value="copyright">Copyright Infringement</option>
                            <option value="misinformation">Misinformation</option>
                            <option value="privacy">Privacy Violation</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="reportDescription">Additional Details (Optional)</label>
                        <textarea id="reportDescription" class="form-control" rows="4" 
                                  placeholder="Provide any additional context that might help us understand your report..."></textarea>
                    </div>

                    <div class="report-options">
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="blockAfterReport">
                                <span class="checkmark"></span>
                                Block this user after reporting
                            </label>
                        </div>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="hideContentAfterReport" checked>
                                <span class="checkmark"></span>
                                Hide this content from my feed
                            </label>
                        </div>
                    </div>

                    <div class="severity-selector">
                        <h4>Report Priority</h4>
                        <div class="severity-options">
                            <label class="severity-option">
                                <input type="radio" name="severity" value="low" checked>
                                <span class="severity-indicator low"></span>
                                <div>
                                    <strong>Low Priority</strong>
                                    <p>Minor violations, reviewed within 24-48 hours</p>
                                </div>
                            </label>
                            <label class="severity-option">
                                <input type="radio" name="severity" value="medium">
                                <span class="severity-indicator medium"></span>
                                <div>
                                    <strong>Medium Priority</strong>
                                    <p>Significant violations, reviewed within 12-24 hours</p>
                                </div>
                            </label>
                            <label class="severity-option">
                                <input type="radio" name="severity" value="high">
                                <span class="severity-indicator high"></span>
                                <div>
                                    <strong>High Priority</strong>
                                    <p>Serious violations, immediate attention required</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="report-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').classList.remove('active')">
                            Cancel
                        </button>
                        <button class="btn btn-error" onclick="privacySecurityUI.submitReport('${contentId}', '${contentType}')">
                            🚨 Submit Report
                        </button>
                    </div>
                </div>

                <div class="report-info">
                    <div class="info-box">
                        <h4>📋 What happens next?</h4>
                        <ul>
                            <li>Your report is reviewed by our moderation team</li>
                            <li>We'll investigate within 24-48 hours</li>
                            <li>You'll receive an update once action is taken</li>
                            <li>All reports are confidential and anonymous</li>
                        </ul>
                    </div>
                    
                    <div class="emergency-contact">
                        <h4>🆘 Need immediate help?</h4>
                        <p>If you're in immediate danger, contact local emergency services.</p>
                        <button class="btn btn-warning btn-small" onclick="privacySecurityUI.showEmergencyContacts()">
                            Emergency Resources
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    submitReport(contentId, contentType) {
        const reason = document.getElementById('reportReason').value;
        const description = document.getElementById('reportDescription').value;
        const blockAfter = document.getElementById('blockAfterReport').checked;
        const hideContent = document.getElementById('hideContentAfterReport').checked;
        const severity = document.querySelector('input[name="severity"]:checked').value;

        if (!reason) {
            showToast('Please select a reason for reporting', 'warning');
            return;
        }

        const report = {
            id: Date.now(),
            contentId,
            contentType,
            reason,
            description,
            severity,
            blockAfter,
            hideContent,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        this.reportedContent.push(report);
        showToast('Report submitted successfully. We\'ll review it within 24 hours.', 'success');
        
        // Close modal
        document.getElementById('contentReportModal').classList.remove('active');
        
        // Show confirmation
        this.showReportConfirmation(report);
    }

    showReportConfirmation(report) {
        const confirmationHTML = `
            <div class="toast-custom success" style="position: fixed; top: 20px; right: 20px; z-index: 10000; background: var(--success); color: white; padding: 1rem 1.5rem; border-radius: 12px; max-width: 350px;">
                <div style="display: flex; align-items: flex-start; gap: 1rem;">
                    <div style="font-size: 1.5rem;">✅</div>
                    <div>
                        <h4 style="margin: 0 0 0.5rem 0;">Report Submitted</h4>
                        <p style="margin: 0; font-size: 0.9rem;">Report ID: #${report.id}</p>
                        <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem;">We'll update you once reviewed</p>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; padding: 0;">&times;</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', confirmationHTML);
        
        setTimeout(() => {
            const toast = document.querySelector('.toast-custom');
            if (toast) toast.remove();
        }, 10000);
    }

    // 2. Block/Mute User Interface
    showBlockMuteInterface(userId = null, username = '') {
        const modal = document.getElementById('blockMuteUserModal');
        const body = document.getElementById('blockMuteUserBody');

        body.innerHTML = `
            <div class="privacy-interface">
                <div class="block-mute-header">
                    <div class="tabs-container">
                        <div class="tab-nav">
                            <button class="tab-btn active" onclick="privacySecurityUI.switchBlockMuteTab('manage')">
                                🚫 Block/Mute User
                            </button>
                            <button class="tab-btn" onclick="privacySecurityUI.switchBlockMuteTab('list')">
                                📋 Manage Blocked Users
                            </button>
                            <button class="tab-btn" onclick="privacySecurityUI.switchBlockMuteTab('settings')">
                                ⚙️ Privacy Settings
                            </button>
                        </div>
                    </div>
                </div>

                <div id="blockMuteContent">
                    ${this.renderBlockMuteTab('manage', userId, username)}
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    switchBlockMuteTab(tab, userId = null, username = '') {
        // Update tab buttons
        document.querySelectorAll('#blockMuteUserModal .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`#blockMuteUserModal .tab-btn[onclick*="${tab}"]`).classList.add('active');

        // Update content
        const content = document.getElementById('blockMuteContent');
        content.innerHTML = this.renderBlockMuteTab(tab, userId, username);
    }

    renderBlockMuteTab(tab, userId = null, username = '') {
        switch (tab) {
            case 'manage':
                return `
                    <div class="tab-content">
                        <div class="user-action-form">
                            <h3>Block or Mute User</h3>
                            <p>Choose how you want to limit interactions with specific users.</p>

                            <div class="form-group">
                                <label for="targetUser">Search User</label>
                                <div class="user-search-container">
                                    <input type="text" id="targetUser" class="form-control" 
                                           placeholder="Type username or email..." 
                                           value="${username}"
                                           oninput="privacySecurityUI.searchUsers(this.value)">
                                    <div id="userSearchResults" class="search-results"></div>
                                </div>
                            </div>

                            <div class="action-options">
                                <div class="action-card">
                                    <div class="action-header">
                                        <div class="action-icon">🔇</div>
                                        <h4>Mute User</h4>
                                    </div>
                                    <p>You won't see their posts, but they can still interact with you.</p>
                                    <div class="mute-duration">
                                        <label>Duration:</label>
                                        <select id="muteDuration" class="form-control">
                                            <option value="1h">1 Hour</option>
                                            <option value="24h">24 Hours</option>
                                            <option value="7d" selected>7 Days</option>
                                            <option value="30d">30 Days</option>
                                            <option value="permanent">Permanent</option>
                                        </select>
                                    </div>
                                    <button class="btn btn-warning btn-small" onclick="privacySecurityUI.muteUser()">
                                        🔇 Mute User
                                    </button>
                                </div>

                                <div class="action-card">
                                    <div class="action-header">
                                        <div class="action-icon">🚫</div>
                                        <h4>Block User</h4>
                                    </div>
                                    <p>Complete restriction - they can't see your profile or contact you.</p>
                                    <div class="block-options">
                                        <label class="checkbox-label">
                                            <input type="checkbox" id="blockMessages" checked>
                                            <span class="checkmark"></span>
                                            Block all messages
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" id="blockProfileViews" checked>
                                            <span class="checkmark"></span>
                                            Hide my profile from them
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" id="blockTagging">
                                            <span class="checkmark"></span>
                                            Prevent tagging me
                                        </label>
                                    </div>
                                    <button class="btn btn-error btn-small" onclick="privacySecurityUI.blockUser()">
                                        🚫 Block User
                                    </button>
                                </div>
                            </div>

                            <div class="bulk-actions">
                                <h4>Bulk Actions</h4>
                                <div class="bulk-options">
                                    <button class="btn btn-secondary btn-small" onclick="privacySecurityUI.importBlockList()">
                                        📥 Import Block List
                                    </button>
                                    <button class="btn btn-secondary btn-small" onclick="privacySecurityUI.exportBlockList()">
                                        📤 Export Block List
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

            case 'list':
                return `
                    <div class="tab-content">
                        <div class="blocked-users-manager">
                            <div class="list-header">
                                <h3>Blocked & Muted Users</h3>
                                <div class="list-filters">
                                    <button class="filter-btn active" onclick="privacySecurityUI.filterBlockedUsers('all')">
                                        All (${this.blockedUsers.length + this.mutedUsers.length})
                                    </button>
                                    <button class="filter-btn" onclick="privacySecurityUI.filterBlockedUsers('blocked')">
                                        Blocked (${this.blockedUsers.length})
                                    </button>
                                    <button class="filter-btn" onclick="privacySecurityUI.filterBlockedUsers('muted')">
                                        Muted (${this.mutedUsers.length})
                                    </button>
                                </div>
                            </div>

                            <div class="users-list">
                                ${this.renderBlockedUsersList()}
                            </div>

                            <div class="list-actions">
                                <button class="btn btn-secondary" onclick="privacySecurityUI.clearAllBlocked()">
                                    Clear All Blocked
                                </button>
                                <button class="btn btn-secondary" onclick="privacySecurityUI.clearExpiredMutes()">
                                    Clear Expired Mutes
                                </button>
                            </div>
                        </div>
                    </div>
                `;

            case 'settings':
                return `
                    <div class="tab-content">
                        <div class="privacy-settings">
                            <h3>Advanced Privacy Settings</h3>
                            
                            <div class="setting-section">
                                <h4>🔒 Profile Visibility</h4>
                                <div class="setting-group">
                                    <label>Who can see your profile?</label>
                                    <select id="profileVisibility" class="form-control" 
                                            onchange="privacySecurityUI.updatePrivacySetting('profileVisibility', this.value)">
                                        <option value="public" ${this.privacySettings.profileVisibility === 'public' ? 'selected' : ''}>Everyone</option>
                                        <option value="friends" ${this.privacySettings.profileVisibility === 'friends' ? 'selected' : ''}>Friends Only</option>
                                        <option value="private" ${this.privacySettings.profileVisibility === 'private' ? 'selected' : ''}>Only Me</option>
                                    </select>
                                </div>
                            </div>

                            <div class="setting-section">
                                <h4>💬 Message Settings</h4>
                                <div class="setting-group">
                                    <label>Who can message you?</label>
                                    <select id="messageFrom" class="form-control" 
                                            onchange="privacySecurityUI.updatePrivacySetting('messageFrom', this.value)">
                                        <option value="everyone" ${this.privacySettings.messageFrom === 'everyone' ? 'selected' : ''}>Everyone</option>
                                        <option value="friends" ${this.privacySettings.messageFrom === 'friends' ? 'selected' : ''}>Friends & Connections</option>
                                        <option value="nobody" ${this.privacySettings.messageFrom === 'nobody' ? 'selected' : ''}>Nobody</option>
                                    </select>
                                </div>
                            </div>

                            <div class="setting-section">
                                <h4>📍 Location & Activity</h4>
                                <div class="setting-toggles">
                                    <label class="toggle-label">
                                        <input type="checkbox" id="locationSharing" 
                                               ${this.privacySettings.locationSharing ? 'checked' : ''}
                                               onchange="privacySecurityUI.updatePrivacySetting('locationSharing', this.checked)">
                                        <span class="toggle-slider"></span>
                                        Share location in posts
                                    </label>
                                    <label class="toggle-label">
                                        <input type="checkbox" id="activityStatus" 
                                               ${this.privacySettings.activityStatus ? 'checked' : ''}
                                               onchange="privacySecurityUI.updatePrivacySetting('activityStatus', this.checked)">
                                        <span class="toggle-slider"></span>
                                        Show online status
                                    </label>
                                </div>
                            </div>

                            <div class="auto-block-settings">
                                <h4>🤖 Automatic Blocking</h4>
                                <p>Automatically block users based on certain behaviors:</p>
                                <div class="auto-block-options">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="autoBlockSpam">
                                        <span class="checkmark"></span>
                                        Block suspected spam accounts
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="autoBlockNewAccounts">
                                        <span class="checkmark"></span>
                                        Require approval for new accounts
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="autoBlockKeywords">
                                        <span class="checkmark"></span>
                                        Block messages with offensive keywords
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

            default:
                return '<div>Invalid tab</div>';
        }
    }

    renderBlockedUsersList() {
        let html = '';
        
        // Add blocked users
        this.blockedUsers.forEach(user => {
            html += `
                <div class="user-item blocked">
                    <div class="user-info">
                        <div class="user-avatar">${user.name[0]}</div>
                        <div class="user-details">
                            <div class="user-name">${user.name}</div>
                            <div class="user-status">🚫 Blocked on ${user.blockedDate}</div>
                        </div>
                    </div>
                    <div class="user-actions">
                        <button class="btn btn-success btn-small" onclick="privacySecurityUI.unblockUser('${user.id}')">
                            Unblock
                        </button>
                    </div>
                </div>
            `;
        });

        // Add muted users
        this.mutedUsers.forEach(user => {
            html += `
                <div class="user-item muted">
                    <div class="user-info">
                        <div class="user-avatar">${user.name[0]}</div>
                        <div class="user-details">
                            <div class="user-name">${user.name}</div>
                            <div class="user-status">🔇 Muted until ${user.muteUntil}</div>
                        </div>
                    </div>
                    <div class="user-actions">
                        <button class="btn btn-warning btn-small" onclick="privacySecurityUI.unmuteUser('${user.id}')">
                            Unmute
                        </button>
                    </div>
                </div>
            `;
        });

        return html || '<div class="empty-state">No blocked or muted users</div>';
    }

    // 3. Privacy Policy & Terms Interface
    showPrivacyPolicyInterface() {
        const modal = document.getElementById('privacyPolicyModal');
        const body = document.getElementById('privacyPolicyBody');

        body.innerHTML = `
            <div class="privacy-interface legal-documents">
                <div class="document-tabs">
                    <button class="tab-btn active" onclick="privacySecurityUI.switchLegalTab('privacy')">
                        🔒 Privacy Policy
                    </button>
                    <button class="tab-btn" onclick="privacySecurityUI.switchLegalTab('terms')">
                        📜 Terms of Service
                    </button>
                    <button class="tab-btn" onclick="privacySecurityUI.switchLegalTab('cookies')">
                        🍪 Cookie Policy
                    </button>
                    <button class="tab-btn" onclick="privacySecurityUI.switchLegalTab('community')">
                        👥 Community Guidelines
                    </button>
                </div>

                <div id="legalContent">
                    ${this.renderLegalTab('privacy')}
                </div>

                <div class="legal-actions">
                    <button class="btn btn-secondary" onclick="privacySecurityUI.downloadLegalDoc('privacy')">
                        📥 Download PDF
                    </button>
                    <button class="btn btn-primary" onclick="privacySecurityUI.acceptTerms()">
                        ✅ Accept Terms
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    switchLegalTab(tab) {
        // Update tab buttons
        document.querySelectorAll('#privacyPolicyModal .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`#privacyPolicyModal .tab-btn[onclick*="${tab}"]`).classList.add('active');

        // Update content
        const content = document.getElementById('legalContent');
        content.innerHTML = this.renderLegalTab(tab);
    }

    renderLegalTab(tab) {
        const currentDate = new Date().toLocaleDateString();
        
        switch (tab) {
            case 'privacy':
                return `
                    <div class="legal-document">
                        <div class="document-header">
                            <h2>🔒 Privacy Policy</h2>
                            <p class="last-updated">Last updated: ${currentDate}</p>
                        </div>
                        <div class="document-content">
                            <section>
                                <h3>1. Information We Collect</h3>
                                <p>We collect information you provide directly to us, such as when you create an account, make a post, or contact us for support.</p>
                                <ul>
                                    <li><strong>Personal Information:</strong> Name, email address, profile photo</li>
                                    <li><strong>Content:</strong> Posts, messages, photos, and other content you share</li>
                                    <li><strong>Usage Data:</strong> How you interact with our platform</li>
                                    <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                                </ul>
                            </section>
                            
                            <section>
                                <h3>2. How We Use Your Information</h3>
                                <ul>
                                    <li>Provide and maintain our services</li>
                                    <li>Personalize your experience</li>
                                    <li>Communicate with you about our services</li>
                                    <li>Protect against fraud and abuse</li>
                                    <li>Comply with legal obligations</li>
                                </ul>
                            </section>
                            
                            <section>
                                <h3>3. Information Sharing</h3>
                                <p>We do not sell or rent your personal information to third parties. We may share information in these situations:</p>
                                <ul>
                                    <li>With your consent</li>
                                    <li>For legal compliance</li>
                                    <li>To protect rights and safety</li>
                                    <li>With service providers who assist us</li>
                                </ul>
                            </section>
                            
                            <section>
                                <h3>4. Your Rights</h3>
                                <p>You have the right to:</p>
                                <ul>
                                    <li>Access your personal data</li>
                                    <li>Correct inaccurate data</li>
                                    <li>Delete your account and data</li>
                                    <li>Export your data</li>
                                    <li>Object to data processing</li>
                                </ul>
                            </section>
                        </div>
                    </div>
                `;
            
            case 'terms':
                return `
                    <div class="legal-document">
                        <div class="document-header">
                            <h2>📜 Terms of Service</h2>
                            <p class="last-updated">Last updated: ${currentDate}</p>
                        </div>
                        <div class="document-content">
                            <section>
                                <h3>1. Acceptance of Terms</h3>
                                <p>By using ConnectHub, you agree to these Terms of Service and our Privacy Policy.</p>
                            </section>
                            
                            <section>
                                <h3>2. User Responsibilities</h3>
                                <ul>
                                    <li>Provide accurate registration information</li>
                                    <li>Maintain account security</li>
                                    <li>Follow community guidelines</li>
                                    <li>Respect intellectual property rights</li>
                                    <li>Report violations and abuse</li>
                                </ul>
                            </section>
                            
                            <section>
                                <h3>3. Prohibited Conduct</h3>
                                <p>You may not:</p>
                                <ul>
                                    <li>Post harmful, offensive, or illegal content</li>
                                    <li>Harass, bully, or threaten others</li>
                                    <li>Spam or distribute malware</li>
                                    <li>Impersonate others</li>
                                    <li>Violate others' privacy</li>
                                </ul>
                            </section>
                            
                            <section>
                                <h3>4. Account Termination</h3>
                                <p>We may suspend or terminate your account if you violate these terms or engage in harmful behavior.</p>
                            </section>
                        </div>
                    </div>
                `;
                
            case 'cookies':
                return `
                    <div class="legal-document">
                        <div class="document-header">
                            <h2>🍪 Cookie Policy</h2>
                            <p class="last-updated">Last updated: ${currentDate}</p>
                        </div>
                        <div class="document-content">
                            <section>
                                <h3>What Are Cookies?</h3>
                                <p>Cookies are small text files stored on your device when you visit our website. They help us provide you with a better experience.</p>
                            </section>
                            
                            <section>
                                <h3>Types of Cookies We Use</h3>
                                <ul>
                                    <li><strong>Essential Cookies:</strong> Required for basic site functionality</li>
                                    <li><strong>Performance Cookies:</strong> Help us understand how you use our site</li>
                                    <li><strong>Functional Cookies:</strong> Remember your preferences</li>
                                    <li><strong>Analytics Cookies:</strong> Help us improve our services</li>
                                </ul>
                            </section>
                            
                            <section>
                                <h3>Managing Cookies</h3>
                                <p>You can control cookies through your browser settings. Note that disabling certain cookies may affect site functionality.</p>
                            </section>
                        </div>
                    </div>
                `;
                
            case 'community':
                return `
                    <div class="legal-document">
                        <div class="document-header">
                            <h2>👥 Community Guidelines</h2>
                            <p class="last-updated">Last updated: ${currentDate}</p>
                        </div>
                        <div class="document-content">
                            <section>
                                <h3>Our Community Values</h3>
                                <p>ConnectHub is built on respect, authenticity, and positive connections.</p>
                            </section>
                            
                            <section>
                                <h3>Be Respectful</h3>
                                <ul>
                                    <li>Treat others with kindness and respect</li>
                                    <li>No harassment, bullying, or hate speech</li>
                                    <li>Respect different opinions and backgrounds</li>
                                </ul>
                            </section>
                            
                            <section>
                                <h3>Be Authentic</h3>
                                <ul>
                                    <li>Use your real identity</li>
                                    <li>Don't impersonate others</li>
                                    <li>Share accurate information</li>
                                </ul>
                            </section>
                            
                            <section>
                                <h3>Keep It Safe</h3>
                                <ul>
                                    <li>Protect your personal information</li>
                                    <li>Report suspicious activity</li>
                                    <li>Don't share harmful content</li>
                                </ul>
                            </section>
                        </div>
                    </div>
                `;
                
            default:
                return '<div>Select a document to view</div>';
        }
    }

    // 4. Data Export Interface
    showDataExportInterface() {
        const modal = document.getElementById('dataExportModal');
        const body = document.getElementById('dataExportBody');

        body.innerHTML = `
            <div class="privacy-interface">
                <div class="export-header">
                    <div class="export-icon">📥</div>
                    <h3>Data Export & Privacy Controls</h3>
                    <p>Download your data or request account deletion in compliance with privacy laws.</p>
                </div>

                <div class="export-tabs">
                    <button class="tab-btn active" onclick="privacySecurityUI.switchExportTab('download')">
                        📥 Download Data
                    </button>
                    <button class="tab-btn" onclick="privacySecurityUI.switchExportTab('delete')">
                        🗑️ Delete Account
                    </button>
                    <button class="tab-btn" onclick="privacySecurityUI.switchExportTab('requests')">
                        📋 My Requests
                    </button>
                </div>

                <div id="exportContent">
                    ${this.renderExportTab('download')}
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    switchExportTab(tab) {
        // Update tab buttons
        document.querySelectorAll('#dataExportModal .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`#dataExportModal .tab-btn[onclick*="${tab}"]`).classList.add('active');

        // Update content
        const content = document.getElementById('exportContent');
        content.innerHTML = this.renderExportTab(tab);
    }

    renderExportTab(tab) {
        switch (tab) {
            case 'download':
                return `
                    <div class="export-section">
                        <h4>📥 Download Your Data</h4>
                        <p>Request a copy of your ConnectHub data. We'll prepare a downloadable file containing your information.</p>
                        
                        <div class="data-categories">
                            <h5>Select data to include:</h5>
                            <div class="data-options">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="exportProfile" checked>
                                    <span class="checkmark"></span>
                                    <div class="data-item">
                                        <strong>Profile Information</strong>
                                        <p>Name, email, bio, profile photo</p>
                                    </div>
                                </label>
                                
                                <label class="checkbox-label">
                                    <input type="checkbox" id="exportPosts" checked>
                                    <span class="checkmark"></span>
                                    <div class="data-item">
                                        <strong>Posts & Content</strong>
                                        <p>All your posts, comments, and shared content</p>
                                    </div>
                                </label>
                                
                                <label class="checkbox-label">
                                    <input type="checkbox" id="exportMessages" checked>
                                    <span class="checkmark"></span>
                                    <div class="data-item">
                                        <strong>Messages</strong>
                                        <p>Direct messages and conversation history</p>
                                    </div>
                                </label>
                                
                                <label class="checkbox-label">
                                    <input type="checkbox" id="exportConnections">
                                    <span class="checkmark"></span>
                                    <div class="data-item">
                                        <strong>Connections & Friends</strong>
                                        <p>Your friends list and connection history</p>
                                    </div>
                                </label>
                                
                                <label class="checkbox-label">
                                    <input type="checkbox" id="exportActivity">
                                    <span class="checkmark"></span>
                                    <div class="data-item">
                                        <strong>Activity Data</strong>
                                        <p>Login history, activity logs, preferences</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div class="export-format">
                            <h5>Export Format:</h5>
                            <div class="format-options">
                                <label class="radio-label">
                                    <input type="radio" name="exportFormat" value="json" checked>
                                    <span class="radio-mark"></span>
                                    JSON (Machine readable)
                                </label>
                                <label class="radio-label">
                                    <input type="radio" name="exportFormat" value="csv">
                                    <span class="radio-mark"></span>
                                    CSV (Spreadsheet compatible)
                                </label>
                                <label class="radio-label">
                                    <input type="radio" name="exportFormat" value="html">
                                    <span class="radio-mark"></span>
                                    HTML (Human readable)
                                </label>
                            </div>
                        </div>
                        
                        <div class="export-actions">
                            <button class="btn btn-primary" onclick="privacySecurityUI.requestDataExport()">
                                📥 Request Data Export
                            </button>
                            <p class="export-note">
                                <strong>Note:</strong> Data preparation may take up to 48 hours. You'll receive an email when your download is ready.
                            </p>
                        </div>
                        
                        <div class="recent-exports">
                            <h5>Recent Export Requests:</h5>
                            <div class="exports-list">
                                ${this.exportRequests.length ? this.exportRequests.map(req => `
                                    <div class="export-item">
                                        <div class="export-info">
                                            <strong>Export #${req.id}</strong>
                                            <p>Requested: ${req.requestDate}</p>
                                            <p>Status: ${req.status}</p>
                                        </div>
                                        <div class="export-actions">
                                            ${req.status === 'ready' ? 
                                                '<button class="btn btn-success btn-small">Download</button>' : 
                                                '<span class="status-badge">Processing</span>'
                                            }
                                        </div>
                                    </div>
                                `).join('') : '<div class="empty-state">No recent export requests</div>'}
                            </div>
                        </div>
                    </div>
                `;
                
            case 'delete':
                return `
                    <div class="export-section delete-section">
                        <h4>🗑️ Delete Account</h4>
                        <div class="warning-box">
                            <div class="warning-icon">⚠️</div>
                            <div>
                                <h5>This action is permanent</h5>
                                <p>Once you delete your account, all your data will be permanently removed and cannot be recovered.</p>
                            </div>
                        </div>
                        
                        <div class="deletion-info">
                            <h5>What will be deleted:</h5>
                            <ul>
                                <li>✓ Your profile and account information</li>
                                <li>✓ All posts, comments, and content</li>
                                <li>✓ Message history and conversations</li>
                                <li>✓ Photos and media files</li>
                                <li>✓ Connection and friend lists</li>
                                <li>✓ Activity logs and preferences</li>
                            </ul>
                            
                            <h5>Before you delete:</h5>
                            <ul>
                                <li>📥 Consider downloading your data first</li>
                                <li>💬 Inform important contacts of your departure</li>
                                <li>📱 Remove ConnectHub from connected apps</li>
                                <li>🔑 Update any accounts using ConnectHub login</li>
                            </ul>
                        </div>
                        
                        <div class="deletion-form">
                            <h5>Confirm Account Deletion</h5>
                            
                            <div class="form-group">
                                <label for="deleteReason">Why are you leaving? (Optional)</label>
                                <select id="deleteReason" class="form-control">
                                    <option value="">Select a reason</option>
                                    <option value="privacy">Privacy concerns</option>
                                    <option value="no-use">Don't use the service anymore</option>
                                    <option value="too-time">Takes too much time</option>
                                    <option value="technical">Technical issues</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="deleteFeedback">Additional feedback (Optional)</label>
                                <textarea id="deleteFeedback" class="form-control" rows="3" 
                                          placeholder="Help us improve by sharing your feedback..."></textarea>
                            </div>
                            
                            <div class="confirmation-checks">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="confirmUnderstand">
                                    <span class="checkmark"></span>
                                    I understand this action is permanent and cannot be undone
                                </label>
                                
                                <label class="checkbox-label">
                                    <input type="checkbox" id="confirmDataLoss">
                                    <span class="checkmark"></span>
                                    I accept that all my data will be permanently deleted
                                </label>
                                
                                <label class="checkbox-label">
                                    <input type="checkbox" id="confirmNotification">
                                    <span class="checkmark"></span>
                                    I've informed important contacts about leaving ConnectHub
                                </label>
                            </div>
                            
                            <div class="deletion-actions">
                                <button class="btn btn-secondary" onclick="privacySecurityUI.switchExportTab('download')">
                                    📥 Download Data First
                                </button>
                                <button class="btn btn-error" onclick="privacySecurityUI.requestAccountDeletion()" disabled id="deleteAccountBtn">
                                    🗑️ Delete My Account
                                </button>
                            </div>
                            
                            <script>
                                // Enable delete button only when all confirmations are checked
                                document.querySelectorAll('.confirmation-checks input[type="checkbox"]').forEach(checkbox => {
                                    checkbox.addEventListener('change', () => {
                                        const allChecked = document.querySelectorAll('.confirmation-checks input[type="checkbox"]:checked').length === 3;
                                        document.getElementById('deleteAccountBtn').disabled = !allChecked;
                                    });
                                });
                            </script>
                        </div>
                    </div>
                `;
                
            case 'requests':
                return `
                    <div class="export-section">
                        <h4>📋 My Privacy Requests</h4>
                        <p>Track the status of your data export and deletion requests.</p>
                        
                        <div class="requests-list">
                            ${this.exportRequests.length || this.blockedUsers.length ? `
                                <div class="request-categories">
                                    <div class="request-category">
                                        <h5>Data Export Requests</h5>
                                        ${this.exportRequests.map(req => `
                                            <div class="request-item">
                                                <div class="request-info">
                                                    <div class="request-header">
                                                        <strong>Export Request #${req.id}</strong>
                                                        <span class="status-badge ${req.status}">${req.status}</span>
                                                    </div>
                                                    <p>Requested: ${req.requestDate}</p>
                                                    <p>Format: ${req.format}</p>
                                                    <p>Categories: ${req.categories.join(', ')}</p>
                                                </div>
                                                <div class="request-actions">
                                                    ${req.status === 'ready' ? 
                                                        '<button class="btn btn-success btn-small">Download</button>' :
                                                        '<button class="btn btn-secondary btn-small" disabled>Processing</button>'
                                                    }
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : '<div class="empty-state">No privacy requests found</div>'}
                        </div>
                        
                        <div class="privacy-rights-info">
                            <h5>Your Privacy Rights</h5>
                            <div class="rights-grid">
                                <div class="right-item">
                                    <h6>📥 Right to Access</h6>
                                    <p>Request a copy of your personal data</p>
                                </div>
                                <div class="right-item">
                                    <h6>✏️ Right to Rectification</h6>
                                    <p>Correct inaccurate personal data</p>
                                </div>
                                <div class="right-item">
                                    <h6>🗑️ Right to Erasure</h6>
                                    <p>Request deletion of your personal data</p>
                                </div>
                                <div class="right-item">
                                    <h6>🚫 Right to Object</h6>
                                    <p>Object to processing of your data</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
            default:
                return '<div>Invalid tab</div>';
        }
    }

    // 5. Content Filter Settings Interface
    showContentFilterInterface() {
        const modal = document.getElementById('contentFilterModal');
        const body = document.getElementById('contentFilterBody');

        body.innerHTML = `
            <div class="privacy-interface">
                <div class="filter-header">
                    <div class="filter-icon">🛡️</div>
                    <h3>Content Filter Settings</h3>
                    <p>Control what type of content you see on ConnectHub to create a safer, more comfortable experience.</p>
                </div>

                <div class="filter-tabs">
                    <button class="tab-btn active" onclick="privacySecurityUI.switchFilterTab('content')">
                        🛡️ Content Filters
                    </button>
                    <button class="tab-btn" onclick="privacySecurityUI.switchFilterTab('keywords')">
                        🔤 Keyword Filters
                    </button>
                    <button class="tab-btn" onclick="privacySecurityUI.switchFilterTab('sources')">
                        🌐 Source Filters
                    </button>
                </div>

                <div id="filterContent">
                    ${this.renderFilterTab('content')}
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    switchFilterTab(tab) {
        // Update tab buttons
        document.querySelectorAll('#contentFilterModal .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`#contentFilterModal .tab-btn[onclick*="${tab}"]`).classList.add('active');

        // Update content
        const content = document.getElementById('filterContent');
        content.innerHTML = this.renderFilterTab(tab);
    }

    renderFilterTab(tab) {
        switch (tab) {
            case 'content':
                return `
                    <div class="filter-section">
                        <div class="filter-categories">
                            <div class="category-group">
                                <h4>🚫 Sensitive Content</h4>
                                
                                <div class="filter-item">
                                    <div class="filter-info">
                                        <h5>Adult Content</h5>
                                        <p>Filter sexually explicit material</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="adultContentFilter" 
                                               ${this.contentFilters.adultContent ? 'checked' : ''}
                                               onchange="privacySecurityUI.updateContentFilter('adultContent', this.checked)">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div class="filter-item">
                                    <div class="filter-info">
                                        <h5>Violent Content</h5>
                                        <p>Hide content depicting violence or gore</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="violentContentFilter" 
                                               ${this.contentFilters.violentContent ? 'checked' : ''}
                                               onchange="privacySecurityUI.updateContentFilter('violentContent', this.checked)">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="category-group">
                                <h4>📢 Communication</h4>
                                
                                <div class="filter-item">
                                    <div class="filter-info">
                                        <h5>Spam Content</h5>
                                        <p>Automatically hide suspected spam posts</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="spamContentFilter" 
                                               ${this.contentFilters.spamContent ? 'checked' : ''}
                                               onchange="privacySecurityUI.updateContentFilter('spamContent', this.checked)">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div class="filter-item">
                                    <div class="filter-info">
                                        <h5>Offensive Language</h5>
                                        <p>Filter posts containing offensive language</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="offensiveLanguageFilter" 
                                               ${this.contentFilters.offensiveLanguage ? 'checked' : ''}
                                               onchange="privacySecurityUI.updateContentFilter('offensiveLanguage', this.checked)">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="category-group">
                                <h4>🏛️ Topics</h4>
                                
                                <div class="filter-item">
                                    <div class="filter-info">
                                        <h5>Political Content</h5>
                                        <p>Hide political discussions and news</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="politicalContentFilter" 
                                               ${this.contentFilters.politicalContent ? 'checked' : ''}
                                               onchange="privacySecurityUI.updateContentFilter('politicalContent', this.checked)">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div class="filter-item">
                                    <div class="filter-info">
                                        <h5>Religious Content</h5>
                                        <p>Filter religious discussions and content</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="religiousContentFilter" 
                                               ${this.contentFilters.religiousContent ? 'checked' : ''}
                                               onchange="privacySecurityUI.updateContentFilter('religiousContent', this.checked)">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="filter-actions">
                            <button class="btn btn-secondary" onclick="privacySecurityUI.resetFilters()">
                                Reset to Default
                            </button>
                            <button class="btn btn-primary" onclick="privacySecurityUI.saveFilterSettings()">
                                💾 Save Settings
                            </button>
                        </div>
                        
                        <div class="filter-stats">
                            <h5>Filter Statistics</h5>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-number">127</div>
                                    <div class="stat-label">Posts filtered this week</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-number">45</div>
                                    <div class="stat-label">Spam messages blocked</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-number">12</div>
                                    <div class="stat-label">Keywords filtered</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
            case 'keywords':
                return `
                    <div class="filter-section">
                        <h4>🔤 Custom Keyword Filters</h4>
                        <p>Add specific words or phrases you don't want to see in your feed.</p>
                        
                        <div class="keyword-input">
                            <div class="input-group">
                                <input type="text" id="newKeyword" class="form-control" 
                                       placeholder="Enter word or phrase to block..." 
                                       onkeypress="if(event.key==='Enter') privacySecurityUI.addKeywordFilter()">
                                <button class="btn btn-primary" onclick="privacySecurityUI.addKeywordFilter()">
                                    ➕ Add Filter
                                </button>
                            </div>
                        </div>
                        
                        <div class="keyword-options">
                            <label class="checkbox-label">
                                <input type="checkbox" id="caseSensitive">
                                <span class="checkmark"></span>
                                Case sensitive matching
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="wholeWords" checked>
                                <span class="checkmark"></span>
                                Match whole words only
                            </label>
                        </div>
                        
                        <div class="keyword-list">
                            <h5>Active Keyword Filters</h5>
                            <div id="keywordFilters">
                                <div class="keyword-item">
                                    <span class="keyword-text">example</span>
                                    <button class="btn btn-error btn-small" onclick="this.parentElement.remove()">Remove</button>
                                </div>
                                <div class="empty-state">No keyword filters added yet</div>
                            </div>
                        </div>
                        
                        <div class="keyword-presets">
                            <h5>Quick Add Presets</h5>
                            <div class="preset-categories">
                                <div class="preset-group">
                                    <h6>Profanity</h6>
                                    <button class="btn btn-secondary btn-small" onclick="privacySecurityUI.addPresetKeywords('profanity')">
                                        Add Common Profanity
                                    </button>
                                </div>
                                <div class="preset-group">
                                    <h6>Spam Terms</h6>
                                    <button class="btn btn-secondary btn-small" onclick="privacySecurityUI.addPresetKeywords('spam')">
                                        Add Spam Keywords
                                    </button>
                                </div>
                                <div class="preset-group">
                                    <h6>Harassment</h6>
                                    <button class="btn btn-secondary btn-small" onclick="privacySecurityUI.addPresetKeywords('harassment')">
                                        Add Harassment Terms
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
            case 'sources':
                return `
                    <div class="filter-section">
                        <h4>🌐 Source & Domain Filters</h4>
                        <p>Block content from specific sources or domains.</p>
                        
                        <div class="source-input">
                            <div class="input-group">
                                <input type="text" id="newSource" class="form-control" 
                                       placeholder="Enter domain or source to block..." 
                                       onkeypress="if(event.key==='Enter') privacySecurityUI.addSourceFilter()">
                                <button class="btn btn-primary" onclick="privacySecurityUI.addSourceFilter()">
                                    🚫 Block Source
                                </button>
                            </div>
                        </div>
                        
                        <div class="source-options">
                            <label class="checkbox-label">
                                <input type="checkbox" id="blockSubdomains" checked>
                                <span class="checkmark"></span>
                                Block all subdomains
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="blockSimilar">
                                <span class="checkmark"></span>
                                Block similar domain names
                            </label>
                        </div>
                        
                        <div class="blocked-sources">
                            <h5>Blocked Sources</h5>
                            <div id="blockedSources">
                                <div class="empty-state">No sources blocked yet</div>
                            </div>
                        </div>
                        
                        <div class="trusted-sources">
                            <h5>Always Allow (Whitelist)</h5>
                            <p>Content from these sources will always be shown, even if other filters would block it.</p>
                            <div class="input-group">
                                <input type="text" id="trustedSource" class="form-control" 
                                       placeholder="Enter trusted domain..." 
                                       onkeypress="if(event.key==='Enter') privacySecurityUI.addTrustedSource()">
                                <button class="btn btn-success" onclick="privacySecurityUI.addTrustedSource()">
                                    ✅ Add Trusted
                                </button>
                            </div>
                            <div id="trustedSources">
                                <div class="source-item trusted">
                                    <span class="source-text">connecthub.com</span>
                                    <button class="btn btn-error btn-small" onclick="this.parentElement.remove()">Remove</button>
                                </div>
                                <div class="empty-state">No additional trusted sources</div>
                            </div>
                        </div>
                    </div>
                `;
                
            default:
                return '<div>Invalid tab</div>';
        }
    }

    // Helper Methods for Privacy/Security UI Components

    // Content Reporting Helper Methods
    showQuickReportInterface() {
        this.showContentReportInterface();
    }

    showContextualReportMenu(event) {
        const x = event.clientX;
        const y = event.clientY;
        
        const contextMenu = document.createElement('div');
        contextMenu.style.cssText = `
            position: fixed;
            top: ${y}px;
            left: ${x}px;
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: 8px;
            padding: 0.5rem 0;
            z-index: 10000;
            min-width: 150px;
        `;
        
        contextMenu.innerHTML = `
            <div onclick="privacySecurityUI.showContentReportInterface(); this.parentElement.remove()" 
                 style="padding: 0.5rem 1rem; cursor: pointer; hover: background: var(--glass);">
                🚨 Report Content
            </div>
            <div onclick="privacySecurityUI.showBlockMuteInterface(); this.parentElement.remove()" 
                 style="padding: 0.5rem 1rem; cursor: pointer; hover: background: var(--glass);">
                🚫 Block User
            </div>
        `;
        
        document.body.appendChild(contextMenu);
        
        setTimeout(() => {
            document.addEventListener('click', () => contextMenu.remove(), { once: true });
        }, 100);
    }

    showEmergencyContacts() {
        showToast('Emergency contacts and resources displayed', 'info');
        // In a real app, this would show actual emergency resources
    }

    // Block/Mute Helper Methods
    searchUsers(query) {
        if (query.length < 2) {
            document.getElementById('userSearchResults').innerHTML = '';
            return;
        }
        
        const mockUsers = [
            { id: 1, name: 'John Doe', username: 'johndoe' },
            { id: 2, name: 'Jane Smith', username: 'janesmith' },
            { id: 3, name: 'Mike Johnson', username: 'mikejohnson' }
        ];
        
        const results = mockUsers.filter(user => 
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.username.toLowerCase().includes(query.toLowerCase())
        );
        
        const resultsHTML = results.map(user => `
            <div class="search-result" onclick="document.getElementById('targetUser').value='${user.username}'; document.getElementById('userSearchResults').innerHTML='';">
                <div class="user-info">
                    <strong>${user.name}</strong> (@${user.username})
                </div>
            </div>
        `).join('');
        
        document.getElementById('userSearchResults').innerHTML = resultsHTML;
    }

    muteUser() {
        const username = document.getElementById('targetUser').value;
        const duration = document.getElementById('muteDuration').value;
        
        if (!username) {
            showToast('Please select a user to mute', 'warning');
            return;
        }
        
        const muteUntil = this.calculateMuteExpiry(duration);
        this.mutedUsers.push({
            id: Date.now(),
            name: username,
            muteUntil: muteUntil,
            duration: duration
        });
        
        this.saveUserPreferences();
        showToast(`${username} has been muted until ${muteUntil}`, 'success');
        document.getElementById('blockMuteUserModal').classList.remove('active');
    }

    blockUser() {
        const username = document.getElementById('targetUser').value;
        
        if (!username) {
            showToast('Please select a user to block', 'warning');
            return;
        }
        
        const blockMessages = document.getElementById('blockMessages').checked;
        const blockProfileViews = document.getElementById('blockProfileViews').checked;
        const blockTagging = document.getElementById('blockTagging').checked;
        
        this.blockedUsers.push({
            id: Date.now(),
            name: username,
            blockedDate: new Date().toLocaleDateString(),
            blockMessages,
            blockProfileViews,
            blockTagging
        });
        
        this.saveUserPreferences();
        showToast(`${username} has been blocked`, 'success');
        document.getElementById('blockMuteUserModal').classList.remove('active');
    }

    unblockUser(userId) {
        this.blockedUsers = this.blockedUsers.filter(user => user.id != userId);
        this.saveUserPreferences();
        showToast('User unblocked', 'success');
        this.switchBlockMuteTab('list');
    }

    unmuteUser(userId) {
        this.mutedUsers = this.mutedUsers.filter(user => user.id != userId);
        this.saveUserPreferences();
        showToast('User unmuted', 'success');
        this.switchBlockMuteTab('list');
    }

    calculateMuteExpiry(duration) {
        const now = new Date();
        switch (duration) {
            case '1h':
                now.setHours(now.getHours() + 1);
                break;
            case '24h':
                now.setDate(now.getDate() + 1);
                break;
            case '7d':
                now.setDate(now.getDate() + 7);
                break;
            case '30d':
                now.setDate(now.getDate() + 30);
                break;
            case 'permanent':
                return 'Never';
        }
        return now.toLocaleDateString();
    }

    updatePrivacySetting(key, value) {
        this.privacySettings[key] = value;
        this.saveUserPreferences();
        showToast('Privacy setting updated', 'success');
    }

    filterBlockedUsers(filter) {
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Filter and display users
        this.switchBlockMuteTab('list');
    }

    clearAllBlocked() {
        if (confirm('Are you sure you want to unblock all users?')) {
            this.blockedUsers = [];
            this.saveUserPreferences();
            showToast('All users unblocked', 'success');
            this.switchBlockMuteTab('list');
        }
    }

    clearExpiredMutes() {
        const now = new Date();
        this.mutedUsers = this.mutedUsers.filter(user => {
            if (user.muteUntil === 'Never') return true;
            return new Date(user.muteUntil) > now;
        });
        this.saveUserPreferences();
        showToast('Expired mutes cleared', 'success');
        this.switchBlockMuteTab('list');
    }

    importBlockList() {
        showToast('Block list import functionality would be implemented here', 'info');
    }

    exportBlockList() {
        const data = {
            blocked: this.blockedUsers,
            muted: this.mutedUsers,
            exported: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'connecthub-block-list.json';
        a.click();
        
        showToast('Block list exported successfully', 'success');
    }

    // Legal Documents Helper Methods
    downloadLegalDoc(docType) {
        showToast(`Downloading ${docType} document...`, 'info');
        // In a real app, this would trigger actual PDF download
    }

    acceptTerms() {
        localStorage.setItem('termsAccepted', new Date().toISOString());
        showToast('Terms accepted successfully', 'success');
        document.getElementById('privacyPolicyModal').classList.remove('active');
    }

    // Data Export Helper Methods
    requestDataExport() {
        const selectedCategories = [];
        const formatInputs = document.querySelectorAll('input[name="exportFormat"]');
        let selectedFormat = 'json';
        
        // Get selected data categories
        ['exportProfile', 'exportPosts', 'exportMessages', 'exportConnections', 'exportActivity'].forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox && checkbox.checked) {
                selectedCategories.push(id.replace('export', '').toLowerCase());
            }
        });
        
        // Get selected format
        formatInputs.forEach(input => {
            if (input.checked) selectedFormat = input.value;
        });
        
        if (selectedCategories.length === 0) {
            showToast('Please select at least one data category', 'warning');
            return;
        }
        
        const exportRequest = {
            id: Date.now(),
            requestDate: new Date().toLocaleDateString(),
            categories: selectedCategories,
            format: selectedFormat,
            status: 'processing'
        };
        
        this.exportRequests.push(exportRequest);
        this.saveUserPreferences();
        
        showToast('Data export requested. You\'ll receive an email when ready.', 'success');
        
        // Simulate processing
        setTimeout(() => {
            exportRequest.status = 'ready';
            this.saveUserPreferences();
            showToast('Your data export is ready for download!', 'success');
        }, 5000);
        
        this.switchExportTab('download');
    }

    requestAccountDeletion() {
        const reason = document.getElementById('deleteReason').value;
        const feedback = document.getElementById('deleteFeedback').value;
        
        // In a real app, this would send a deletion request to the backend
        showToast('Account deletion request submitted. You\'ll receive confirmation via email.', 'info');
        document.getElementById('dataExportModal').classList.remove('active');
    }

    // Content Filter Helper Methods
    updateContentFilter(filterType, enabled) {
        this.contentFilters[filterType] = enabled;
        this.saveUserPreferences();
        showToast(`${filterType} filter ${enabled ? 'enabled' : 'disabled'}`, 'success');
    }

    addKeywordFilter() {
        const input = document.getElementById('newKeyword');
        const keyword = input.value.trim();
        
        if (!keyword) {
            showToast('Please enter a keyword to filter', 'warning');
            return;
        }
        
        const keywordFilters = document.getElementById('keywordFilters');
        const newFilter = document.createElement('div');
        newFilter.className = 'keyword-item';
        newFilter.innerHTML = `
            <span class="keyword-text">${keyword}</span>
            <button class="btn btn-error btn-small" onclick="this.parentElement.remove()">Remove</button>
        `;
        
        keywordFilters.appendChild(newFilter);
        input.value = '';
        showToast(`Keyword "${keyword}" added to filter list`, 'success');
    }

    addPresetKeywords(category) {
        const presets = {
            profanity: ['offensive1', 'offensive2', 'offensive3'],
            spam: ['click here', 'free money', 'win now'],
            harassment: ['harassment1', 'harassment2', 'harassment3']
        };
        
        const keywords = presets[category] || [];
        const keywordFilters = document.getElementById('keywordFilters');
        
        keywords.forEach(keyword => {
            const newFilter = document.createElement('div');
            newFilter.className = 'keyword-item';
            newFilter.innerHTML = `
                <span class="keyword-text">${keyword}</span>
                <button class="btn btn-error btn-small" onclick="this.parentElement.remove()">Remove</button>
            `;
            keywordFilters.appendChild(newFilter);
        });
        
        showToast(`Added ${keywords.length} ${category} keywords`, 'success');
    }

    addSourceFilter() {
        const input = document.getElementById('newSource');
        const source = input.value.trim();
        
        if (!source) {
            showToast('Please enter a source to block', 'warning');
            return;
        }
        
        const blockedSources = document.getElementById('blockedSources');
        const newSource = document.createElement('div');
        newSource.className = 'source-item blocked';
        newSource.innerHTML = `
            <span class="source-text">${source}</span>
            <button class="btn btn-error btn-small" onclick="this.parentElement.remove()">Remove</button>
        `;
        
        blockedSources.appendChild(newSource);
        input.value = '';
        showToast(`Source "${source}" blocked`, 'success');
    }

    addTrustedSource() {
        const input = document.getElementById('trustedSource');
        const source = input.value.trim();
        
        if (!source) {
            showToast('Please enter a trusted source', 'warning');
            return;
        }
        
        const trustedSources = document.getElementById('trustedSources');
        const newSource = document.createElement('div');
        newSource.className = 'source-item trusted';
        newSource.innerHTML = `
            <span class="source-text">${source}</span>
            <button class="btn btn-error btn-small" onclick="this.parentElement.remove()">Remove</button>
        `;
        
        trustedSources.appendChild(newSource);
        input.value = '';
        showToast(`Source "${source}" added to trusted list`, 'success');
    }

    resetFilters() {
        this.contentFilters = {
            adultContent: false,
            violentContent: true,
            spamContent: true,
            offensiveLanguage: true,
            politicalContent: false,
            religiousContent: false
        };
        this.saveUserPreferences();
        showToast('Filters reset to default settings', 'success');
        this.switchFilterTab('content');
    }

    saveFilterSettings() {
        this.saveUserPreferences();
        showToast('Filter settings saved successfully', 'success');
    }
}

// Initialize Privacy & Security UI Components
let privacySecurityUI = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        privacySecurityUI = new PrivacySecurityUIComponents();
        window.privacySecurityUI = privacySecurityUI; // Make globally available
    }, 1000);
});

// Global functions to interface with the Privacy & Security UI
function showContentReportInterface(contentId, contentType, contentPreview) {
    if (privacySecurityUI) {
        privacySecurityUI.showContentReportInterface(contentId, contentType, contentPreview);
    }
}

function showBlockMuteInterface(userId, username) {
    if (privacySecurityUI) {
        privacySecurityUI.showBlockMuteInterface(userId, username);
    }
}

function showPrivacyPolicyInterface() {
    if (privacySecurityUI) {
        privacySecurityUI.showPrivacyPolicyInterface();
    }
}

function showDataExportInterface() {
    if (privacySecurityUI) {
        privacySecurityUI.showDataExportInterface();
    }
}

function showContentFilterInterface() {
    if (privacySecurityUI) {
        privacySecurityUI.showContentFilterInterface();
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrivacySecurityUIComponents;
}
