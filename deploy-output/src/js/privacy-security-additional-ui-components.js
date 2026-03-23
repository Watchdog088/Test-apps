// Privacy & Security Additional UI Components
// Implements the 2 missing UI interfaces identified in the audit
// Missing UI #28: Advanced Content Reporting System
// Missing UI #29: GDPR Data Export & Compliance Interface

class PrivacySecurityAdditionalUI {
    constructor() {
        this.reportTracker = [];
        this.dataExportRequests = [];
        this.complianceSettings = {
            dataRetention: '2_years',
            autoDelete: false,
            consentTracking: true,
            cookieConsent: true,
            emailConsent: true,
            analyticsConsent: false
        };
        this.reportStatuses = ['pending', 'under_review', 'resolved', 'escalated', 'dismissed'];
        this.evidenceFiles = [];
        this.init();
    }

    init() {
        this.createModalStructures();
        this.attachGlobalEventListeners();
        this.loadUserData();
    }

    createModalStructures() {
        const modalsHTML = `
            <!-- Advanced Content Reporting Modal -->
            <div id="advancedReportModal" class="modal" role="dialog" aria-labelledby="advancedReportTitle" aria-hidden="true">
                <div class="modal-content" style="max-width: 900px; max-height: 90vh;">
                    <div class="modal-header">
                        <h2 id="advancedReportTitle">🚨 Advanced Content Reporting System</h2>
                        <button class="modal-close" onclick="this.closest('.modal').classList.remove('active')" aria-label="Close">&times;</button>
                    </div>
                    <div class="modal-body" id="advancedReportBody" style="max-height: 80vh; overflow-y: auto;">
                        <!-- Content will be dynamically loaded -->
                    </div>
                </div>
            </div>

            <!-- GDPR Data Export Modal -->
            <div id="gdprDataExportModal" class="modal" role="dialog" aria-labelledby="gdprDataTitle" aria-hidden="true">
                <div class="modal-content" style="max-width: 950px; max-height: 90vh;">
                    <div class="modal-header">
                        <h2 id="gdprDataTitle">🔒 GDPR Data Export & Compliance</h2>
                        <button class="modal-close" onclick="this.closest('.modal').classList.remove('active')" aria-label="Close">&times;</button>
                    </div>
                    <div class="modal-body" id="gdprDataBody" style="max-height: 80vh; overflow-y: auto;">
                        <!-- Content will be dynamically loaded -->
                    </div>
                </div>
            </div>
        `;

        // Append modals to body if they don't exist
        if (!document.getElementById('advancedReportModal')) {
            document.body.insertAdjacentHTML('beforeend', modalsHTML);
        }
    }

    attachGlobalEventListeners() {
        // Right-click context menu for advanced reporting
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.post, .message, .comment, .user-profile, .media-content')) {
                this.showAdvancedReportContextMenu(e);
            }
        });

        // Keyboard shortcut for quick reporting
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 'R') {
                e.preventDefault();
                this.showAdvancedContentReporting();
            }
            if (e.ctrlKey && e.altKey && e.key === 'D') {
                e.preventDefault();
                this.showGDPRDataExport();
            }
        });
    }

    loadUserData() {
        const savedReports = localStorage.getItem('advancedReportTracker');
        const savedExports = localStorage.getItem('gdprDataExports');
        const savedCompliance = localStorage.getItem('complianceSettings');

        if (savedReports) this.reportTracker = JSON.parse(savedReports);
        if (savedExports) this.dataExportRequests = JSON.parse(savedExports);
        if (savedCompliance) this.complianceSettings = JSON.parse(savedCompliance);
    }

    saveUserData() {
        localStorage.setItem('advancedReportTracker', JSON.stringify(this.reportTracker));
        localStorage.setItem('gdprDataExports', JSON.stringify(this.dataExportRequests));
        localStorage.setItem('complianceSettings', JSON.stringify(this.complianceSettings));
    }

    // MISSING UI #28: Advanced Content Reporting System
    showAdvancedContentReporting(contentId = null, contentType = 'unknown', contentData = {}) {
        const modal = document.getElementById('advancedReportModal');
        const body = document.getElementById('advancedReportBody');

        body.innerHTML = `
            <div class="advanced-reporting-interface">
                <div class="reporting-tabs">
                    <button class="tab-btn active" onclick="privacySecurityAdditionalUI.switchReportTab('report')">
                        🚨 Submit Report
                    </button>
                    <button class="tab-btn" onclick="privacySecurityAdditionalUI.switchReportTab('track')">
                        📋 Track Reports
                    </button>
                    <button class="tab-btn" onclick="privacySecurityAdditionalUI.switchReportTab('evidence')">
                        📎 Evidence Manager
                    </button>
                    <button class="tab-btn" onclick="privacySecurityAdditionalUI.switchReportTab('appeal')">
                        ⚖️ Appeals
                    </button>
                </div>

                <div id="reportingContent">
                    ${this.renderReportingTab('report', contentId, contentType, contentData)}
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    switchReportTab(tab, contentId = null, contentType = 'unknown', contentData = {}) {
        // Update tab buttons
        document.querySelectorAll('#advancedReportModal .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`#advancedReportModal .tab-btn[onclick*="${tab}"]`).classList.add('active');

        // Update content
        const content = document.getElementById('reportingContent');
        content.innerHTML = this.renderReportingTab(tab, contentId, contentType, contentData);
    }

    renderReportingTab(tab, contentId = null, contentType = 'unknown', contentData = {}) {
        switch (tab) {
            case 'report':
                return `
                    <div class="report-submission-form">
                        <div class="form-header">
                            <h3>📝 Advanced Report Submission</h3>
                            <p>Provide detailed information to help us investigate this report thoroughly.</p>
                        </div>

                        ${contentId ? `
                            <div class="content-preview-section">
                                <h4>📄 Content Being Reported</h4>
                                <div class="content-preview-card">
                                    <div class="content-type-badge">${contentType.toUpperCase()}</div>
                                    <div class="content-id">ID: ${contentId}</div>
                                    <div class="content-timestamp">Reported: ${new Date().toLocaleString()}</div>
                                </div>
                            </div>
                        ` : ''}

                        <div class="report-form-sections">
                            <div class="form-section">
                                <h4>🎯 Report Category</h4>
                                <div class="category-grid">
                                    <label class="category-option">
                                        <input type="radio" name="reportCategory" value="harassment">
                                        <div class="category-card">
                                            <div class="category-icon">😤</div>
                                            <div class="category-title">Harassment/Bullying</div>
                                            <div class="category-desc">Targeted abuse or intimidation</div>
                                        </div>
                                    </label>
                                    
                                    <label class="category-option">
                                        <input type="radio" name="reportCategory" value="hate_speech">
                                        <div class="category-card">
                                            <div class="category-icon">😡</div>
                                            <div class="category-title">Hate Speech</div>
                                            <div class="category-desc">Discrimination based on identity</div>
                                        </div>
                                    </label>
                                    
                                    <label class="category-option">
                                        <input type="radio" name="reportCategory" value="violence">
                                        <div class="category-card">
                                            <div class="category-icon">⚠️</div>
                                            <div class="category-title">Violence/Threats</div>
                                            <div class="category-desc">Physical threats or violence</div>
                                        </div>
                                    </label>
                                    
                                    <label class="category-option">
                                        <input type="radio" name="reportCategory" value="sexual_content">
                                        <div class="category-card">
                                            <div class="category-icon">🔞</div>
                                            <div class="category-title">Sexual Content</div>
                                            <div class="category-desc">Inappropriate sexual material</div>
                                        </div>
                                    </label>
                                    
                                    <label class="category-option">
                                        <input type="radio" name="reportCategory" value="spam">
                                        <div class="category-card">
                                            <div class="category-icon">📢</div>
                                            <div class="category-title">Spam/Scam</div>
                                            <div class="category-desc">Fraudulent or unwanted content</div>
                                        </div>
                                    </label>
                                    
                                    <label class="category-option">
                                        <input type="radio" name="reportCategory" value="copyright">
                                        <div class="category-card">
                                            <div class="category-icon">©️</div>
                                            <div class="category-title">Copyright</div>
                                            <div class="category-desc">Unauthorized use of content</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div class="form-section">
                                <h4>📋 Detailed Description</h4>
                                <textarea id="reportDescription" class="form-control" rows="6" 
                                          placeholder="Describe the violation in detail. Include specific examples, timestamps, and context that will help our moderation team understand the issue."></textarea>
                                <div class="character-count">
                                    <span id="charCount">0</span>/2000 characters
                                </div>
                            </div>

                            <div class="form-section">
                                <h4>📎 Evidence Submission</h4>
                                <div class="evidence-upload">
                                    <div class="upload-area" onclick="document.getElementById('evidenceFiles').click()">
                                        <div class="upload-icon">📎</div>
                                        <div class="upload-text">
                                            <strong>Click to upload evidence files</strong>
                                            <p>Screenshots, recordings, or other supporting documentation</p>
                                            <small>Supported: PNG, JPG, MP4, PDF (Max 50MB total)</small>
                                        </div>
                                    </div>
                                    <input type="file" id="evidenceFiles" multiple accept=".png,.jpg,.jpeg,.mp4,.pdf" style="display: none;" onchange="privacySecurityAdditionalUI.handleEvidenceUpload(this.files)">
                                    <div id="uploadedEvidence" class="uploaded-files"></div>
                                </div>
                            </div>

                            <div class="form-section">
                                <h4>⚡ Priority Level</h4>
                                <div class="priority-options">
                                    <label class="priority-option">
                                        <input type="radio" name="priority" value="low" checked>
                                        <div class="priority-indicator low"></div>
                                        <div class="priority-info">
                                            <strong>Low Priority</strong>
                                            <p>Minor violations - 48-72 hour review</p>
                                        </div>
                                    </label>
                                    
                                    <label class="priority-option">
                                        <input type="radio" name="priority" value="medium">
                                        <div class="priority-indicator medium"></div>
                                        <div class="priority-info">
                                            <strong>Medium Priority</strong>
                                            <p>Significant violations - 24-48 hour review</p>
                                        </div>
                                    </label>
                                    
                                    <label class="priority-option">
                                        <input type="radio" name="priority" value="high">
                                        <div class="priority-indicator high"></div>
                                        <div class="priority-info">
                                            <strong>High Priority</strong>
                                            <p>Serious violations - Immediate attention</p>
                                        </div>
                                    </label>
                                    
                                    <label class="priority-option">
                                        <input type="radio" name="priority" value="urgent">
                                        <div class="priority-indicator urgent"></div>
                                        <div class="priority-info">
                                            <strong>Urgent</strong>
                                            <p>Imminent harm/danger - Emergency response</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div class="form-section">
                                <h4>🔧 Additional Actions</h4>
                                <div class="additional-actions">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="blockUser">
                                        <span class="checkmark"></span>
                                        Block the user after submitting report
                                    </label>
                                    
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="hideContent">
                                        <span class="checkmark"></span>
                                        Hide this content from my feed
                                    </label>
                                    
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="notifyUpdates">
                                        <span class="checkmark"></span>
                                        Email me with investigation updates
                                    </label>
                                    
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="shareWithLawEnforcement">
                                        <span class="checkmark"></span>
                                        Allow sharing with law enforcement if necessary
                                    </label>
                                </div>
                            </div>

                            <div class="form-actions">
                                <button class="btn btn-secondary" onclick="privacySecurityAdditionalUI.saveDraft()">
                                    💾 Save Draft
                                </button>
                                <button class="btn btn-warning" onclick="privacySecurityAdditionalUI.submitAdvancedReport()">
                                    🚨 Submit Report
                                </button>
                            </div>
                        </div>

                        <div class="reporting-guidelines">
                            <h4>📚 Reporting Guidelines</h4>
                            <div class="guidelines-grid">
                                <div class="guideline-item">
                                    <h5>✅ What to Report</h5>
                                    <ul>
                                        <li>Content that violates community guidelines</li>
                                        <li>Harassment or threatening behavior</li>
                                        <li>Illegal or harmful activities</li>
                                        <li>Copyright infringement</li>
                                        <li>Spam or fraudulent content</li>
                                    </ul>
                                </div>
                                
                                <div class="guideline-item">
                                    <h5>❌ What NOT to Report</h5>
                                    <ul>
                                        <li>Content you simply disagree with</li>
                                        <li>Personal disputes or arguments</li>
                                        <li>Content that doesn't violate policies</li>
                                        <li>Legitimate criticism or debate</li>
                                        <li>Parody or satirical content</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

            case 'track':
                return `
                    <div class="report-tracking">
                        <div class="tracking-header">
                            <h3>📋 Report Tracking Dashboard</h3>
                            <div class="tracking-stats">
                                <div class="stat-card">
                                    <div class="stat-number">${this.reportTracker.length}</div>
                                    <div class="stat-label">Total Reports</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">${this.reportTracker.filter(r => r.status === 'pending').length}</div>
                                    <div class="stat-label">Pending</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">${this.reportTracker.filter(r => r.status === 'resolved').length}</div>
                                    <div class="stat-label">Resolved</div>
                                </div>
                            </div>
                        </div>

                        <div class="reports-filter">
                            <select id="statusFilter" class="form-control" onchange="privacySecurityAdditionalUI.filterReports(this.value)">
                                <option value="all">All Reports</option>
                                <option value="pending">Pending</option>
                                <option value="under_review">Under Review</option>
                                <option value="resolved">Resolved</option>
                                <option value="escalated">Escalated</option>
                                <option value="dismissed">Dismissed</option>
                            </select>
                        </div>

                        <div class="reports-list">
                            ${this.reportTracker.length ? this.reportTracker.map(report => `
                                <div class="report-item" data-status="${report.status}">
                                    <div class="report-header">
                                        <div class="report-id">Report #${report.id}</div>
                                        <div class="report-status status-${report.status}">${report.status.replace('_', ' ')}</div>
                                        <div class="report-date">${report.submittedDate}</div>
                                    </div>
                                    
                                    <div class="report-details">
                                        <div class="report-category">
                                            <strong>Category:</strong> ${report.category}
                                        </div>
                                        <div class="report-content">
                                            <strong>Content:</strong> ${report.contentType} - ${report.contentId || 'N/A'}
                                        </div>
                                        <div class="report-description">
                                            ${report.description.substring(0, 100)}${report.description.length > 100 ? '...' : ''}
                                        </div>
                                    </div>
                                    
                                    <div class="report-actions">
                                        <button class="btn btn-small btn-secondary" onclick="privacySecurityAdditionalUI.viewReportDetails('${report.id}')">
                                            👁️ View Details
                                        </button>
                                        ${report.status === 'resolved' || report.status === 'dismissed' ? `
                                            <button class="btn btn-small btn-warning" onclick="privacySecurityAdditionalUI.submitAppeal('${report.id}')">
                                                ⚖️ Submit Appeal
                                            </button>
                                        ` : ''}
                                        <button class="btn btn-small btn-error" onclick="privacySecurityAdditionalUI.withdrawReport('${report.id}')">
                                            ❌ Withdraw
                                        </button>
                                    </div>
                                    
                                    ${report.moderatorResponse ? `
                                        <div class="moderator-response">
                                            <h5>👤 Moderator Response:</h5>
                                            <p>${report.moderatorResponse}</p>
                                            <small>Responded: ${report.responseDate}</small>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('') : '<div class="empty-state">No reports submitted yet</div>'}
                        </div>
                    </div>
                `;

            case 'evidence':
                return `
                    <div class="evidence-manager">
                        <h3>📎 Evidence Manager</h3>
                        <p>Manage evidence files for your reports and appeals.</p>

                        <div class="evidence-upload-section">
                            <h4>Upload New Evidence</h4>
                            <div class="evidence-upload-area">
                                <input type="file" id="newEvidenceFiles" multiple accept=".png,.jpg,.jpeg,.mp4,.pdf,.txt" onchange="privacySecurityAdditionalUI.uploadEvidence(this.files)">
                                <label for="newEvidenceFiles" class="upload-label">
                                    <div class="upload-icon">📎</div>
                                    <div>Click or drag files here to upload</div>
                                    <small>PNG, JPG, MP4, PDF, TXT files up to 50MB each</small>
                                </label>
                            </div>
                        </div>

                        <div class="evidence-library">
                            <h4>Evidence Library</h4>
                            <div class="evidence-grid">
                                ${this.evidenceFiles.length ? this.evidenceFiles.map(file => `
                                    <div class="evidence-item">
                                        <div class="evidence-preview">
                                            ${this.getFilePreview(file)}
                                        </div>
                                        <div class="evidence-info">
                                            <div class="file-name">${file.name}</div>
                                            <div class="file-size">${this.formatFileSize(file.size)}</div>
                                            <div class="file-date">${file.uploadDate}</div>
                                        </div>
                                        <div class="evidence-actions">
                                            <button class="btn btn-small btn-primary" onclick="privacySecurityAdditionalUI.viewEvidence('${file.id}')">
                                                👁️ View
                                            </button>
                                            <button class="btn btn-small btn-secondary" onclick="privacySecurityAdditionalUI.downloadEvidence('${file.id}')">
                                                💾 Download
                                            </button>
                                            <button class="btn btn-small btn-error" onclick="privacySecurityAdditionalUI.deleteEvidence('${file.id}')">
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                `).join('') : '<div class="empty-state">No evidence files uploaded</div>'}
                            </div>
                        </div>
                    </div>
                `;

            case 'appeal':
                return `
                    <div class="appeal-system">
                        <h3>⚖️ Appeals System</h3>
                        <p>If you disagree with a moderation decision, you can submit an appeal for review.</p>

                        <div class="appeal-form">
                            <h4>Submit New Appeal</h4>
                            <div class="form-group">
                                <label for="appealReportId">Report ID to Appeal</label>
                                <select id="appealReportId" class="form-control">
                                    <option value="">Select a report</option>
                                    ${this.reportTracker.filter(r => r.status === 'resolved' || r.status === 'dismissed').map(report => `
                                        <option value="${report.id}">Report #${report.id} - ${report.category}</option>
                                    `).join('')}
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="appealReason">Reason for Appeal</label>
                                <select id="appealReason" class="form-control">
                                    <option value="">Select reason</option>
                                    <option value="incorrect_decision">Incorrect moderation decision</option>
                                    <option value="missing_context">Important context was missed</option>
                                    <option value="policy_misinterpretation">Policy was misinterpreted</option>
                                    <option value="new_evidence">New evidence available</option>
                                    <option value="bias_concern">Concern about bias in review</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="appealDescription">Detailed Explanation</label>
                                <textarea id="appealDescription" class="form-control" rows="6" 
                                          placeholder="Explain why you believe the moderation decision was incorrect. Provide specific details and any additional context."></textarea>
                            </div>

                            <div class="form-group">
                                <label for="appealEvidence">Additional Evidence</label>
                                <input type="file" id="appealEvidence" multiple accept=".png,.jpg,.jpeg,.mp4,.pdf">
                                <small>Upload any new evidence that supports your appeal</small>
                            </div>

                            <div class="form-actions">
                                <button class="btn btn-primary" onclick="privacySecurityAdditionalUI.submitAppealForm()">
                                    ⚖️ Submit Appeal
                                </button>
                            </div>
                        </div>

                        <div class="appeals-history">
                            <h4>Appeal History</h4>
                            <div class="appeals-list">
                                <div class="empty-state">No appeals submitted yet</div>
                            </div>
                        </div>
                    </div>
                `;

            default:
                return '<div>Invalid tab</div>';
        }
    }

    // MISSING UI #29: GDPR Data Export & Compliance Interface
    showGDPRDataExport() {
        const modal = document.getElementById('gdprDataExportModal');
        const body = document.getElementById('gdprDataBody');

        body.innerHTML = `
            <div class="gdpr-compliance-interface">
                <div class="gdpr-tabs">
                    <button class="tab-btn active" onclick="privacySecurityAdditionalUI.switchGDPRTab('export')">
                        📥 Data Export
                    </button>
                    <button class="tab-btn" onclick="privacySecurityAdditionalUI.switchGDPRTab('rights')">
                        📜 Your Rights
                    </button>
                    <button class="tab-btn" onclick="privacySecurityAdditionalUI.switchGDPRTab('compliance')">
                        🔒 Compliance
                    </button>
                    <button class="tab-btn" onclick="privacySecurityAdditionalUI.switchGDPRTab('verification')">
                        ✅ Data Verification
                    </button>
                </div>

                <div id="gdprContent">
                    ${this.renderGDPRTab('export')}
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    switchGDPRTab(tab) {
        // Update tab buttons
        document.querySelectorAll('#gdprDataExportModal .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`#gdprDataExportModal .tab-btn[onclick*="${tab}"]`).classList.add('active');

        // Update content
        const content = document.getElementById('gdprContent');
        content.innerHTML = this.renderGDPRTab(tab);
    }

    renderGDPRTab(tab) {
        switch (tab) {
            case 'export':
                return `
                    <div class="data-export-section">
                        <div class="export-header">
                            <h3>📥 GDPR Data Export Request</h3>
                            <p>Request a copy of all personal data we have collected about you, in compliance with GDPR regulations.</p>
                        </div>

                        <div class="export-wizard">
                            <div class="wizard-steps">
                                <div class="step active">1. Select Data</div>
                                <div class="step">2. Choose Format</div>
                                <div class="step">3. Verification</div>
                                <div class="step">4. Request</div>
                            </div>

                            <div class="wizard-content">
                                <div class="data-categories">
                                    <h4>Select Data Categories to Export</h4>
                                    <div class="categories-grid">
                                        <label class="data-category">
                                            <input type="checkbox" name="dataCategory" value="profile" checked>
                                            <div class="category-card">
                                                <div class="category-icon">👤</div>
                                                <div class="category-info">
                                                    <h5>Profile Information</h5>
                                                    <p>Name, email, bio, profile photo, account settings</p>
                                                    <small>Last updated: ${new Date().toLocaleDateString()}</small>
                                                </div>
                                            </div>
                                        </label>

                                        <label class="data-category">
                                            <input type="checkbox" name="dataCategory" value="posts" checked>
                                            <div class="category-card">
                                                <div class="category-icon">📝</div>
                                                <div class="category-info">
                                                    <h5>Posts & Content</h5>
                                                    <p>All posts, comments, shares, reactions</p>
                                                    <small>Estimated: 247 posts, 1,432 comments</small>
                                                </div>
                                            </div>
                                        </label>

                                        <label class="data-category">
                                            <input type="checkbox" name="dataCategory" value="messages">
                                            <div class="category-card">
                                                <div class="category-icon">💬</div>
                                                <div class="category-info">
                                                    <h5>Messages & Conversations</h5>
                                                    <p>Direct messages, group chats, call history</p>
                                                    <small>Estimated: 89 conversations</small>
                                                </div>
                                            </div>
                                        </label>

                                        <label class="data-category">
                                            <input type="checkbox" name="dataCategory" value="activity">
                                            <div class="category-card">
                                                <div class="category-icon">📊</div>
                                                <div class="category-info">
                                                    <h5>Activity & Analytics</h5>
                                                    <p>Login history, device information, usage patterns</p>
                                                    <small>Estimated: 1,234 activity records</small>
                                                </div>
                                            </div>
                                        </label>

                                        <label class="data-category">
                                            <input type="checkbox" name="dataCategory" value="connections">
                                            <div class="category-card">
                                                <div class="category-icon">🤝</div>
                                                <div class="category-info">
                                                    <h5>Connections & Relationships</h5>
                                                    <p>Friends, followers, blocked users, matches</p>
                                                    <small>Estimated: 156 connections</small>
                                                </div>
                                            </div>
                                        </label>

                                        <label class="data-category">
                                            <input type="checkbox" name="dataCategory" value="media">
                                            <div class="category-card">
                                                <div class="category-icon">📸</div>
                                                <div class="category-info">
                                                    <h5>Media Files</h5>
                                                    <p>Photos, videos, audio files uploaded</p>
                                                    <small>Estimated: 89 files (2.3 GB)</small>
                                                </div>
                                            </div>
                                        </label>

                                        <label class="data-category">
                                            <input type="checkbox" name="dataCategory" value="transactions">
                                            <div class="category-card">
                                                <div class="category-icon">💳</div>
                                                <div class="category-info">
                                                    <h5>Transaction History</h5>
                                                    <p>Purchases, subscriptions, payment methods</p>
                                                    <small>Estimated: 23 transactions</small>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div class="export-format-selection">
                                    <h4>Choose Export Format</h4>
                                    <div class="format-options">
                                        <label class="format-option">
                                            <input type="radio" name="exportFormat" value="json" checked>
                                            <div class="format-card">
                                                <div class="format-icon">📄</div>
                                                <div class="format-info">
                                                    <h5>JSON Format</h5>
                                                    <p>Machine-readable, good for developers</p>
                                                    <small>Structured data format</small>
                                                </div>
                                            </div>
                                        </label>

                                        <label class="format-option">
                                            <input type="radio" name="exportFormat" value="csv">
                                            <div class="format-card">
                                                <div class="format-icon">📊</div>
                                                <div class="format-info">
                                                    <h5>CSV Format</h5>
                                                    <p>Spreadsheet-compatible, good for analysis</p>
                                                    <small>Opens in Excel, Google Sheets</small>
                                                </div>
                                            </div>
                                        </label>

                                        <label class="format-option">
                                            <input type="radio" name="exportFormat" value="pdf">
                                            <div class="format-card">
                                                <div class="format-icon">📋</div>
                                                <div class="format-info">
                                                    <h5>PDF Format</h5>
                                                    <p>Human-readable, good for records</p>
                                                    <small>Easy to view and print</small>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div class="export-timeline">
                                    <h4>Select Time Period</h4>
                                    <div class="timeline-options">
                                        <label class="checkbox-label">
                                            <input type="radio" name="timePeriod" value="all" checked>
                                            <span class="radio-mark"></span>
                                            All data (account creation to now)
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="radio" name="timePeriod" value="last_year">
                                            <span class="radio-mark"></span>
                                            Last 12 months
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="radio" name="timePeriod" value="last_6_months">
                                            <span class="radio-mark"></span>
                                            Last 6 months
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="radio" name="timePeriod" value="custom">
                                            <span class="radio-mark"></span>
                                            Custom date range
                                        </label>
                                    </div>
                                </div>

                                <div class="export-actions">
                                    <button class="btn btn-primary" onclick="privacySecurityAdditionalUI.initiateGDPRExport()">
                                        📥 Request Data Export
                                    </button>
                                    <button class="btn btn-secondary" onclick="privacySecurityAdditionalUI.previewExport()">
                                        👁️ Preview Export
                                    </button>
                                </div>

                                <div class="export-info">
                                    <div class="info-box">
                                        <h5>📋 What to Expect</h5>
                                        <ul>
                                            <li>Export preparation may take up to 48 hours</li>
                                            <li>You'll receive an email when your data is ready</li>
                                            <li>Download link will be valid for 30 days</li>
                                            <li>Large exports may be split into multiple files</li>
                                        </ul>
                                    </div>
                                </div>

                                <div class="recent-exports">
                                    <h4>Recent Export Requests</h4>
                                    <div class="exports-timeline">
                                        ${this.dataExportRequests.length ? this.dataExportRequests.map(req => `
                                            <div class="export-request-item">
                                                <div class="request-info">
                                                    <div class="request-header">
                                                        <strong>Export Request #${req.id}</strong>
                                                        <span class="request-status status-${req.status}">${req.status}</span>
                                                    </div>
                                                    <div class="request-details">
                                                        <p>Requested: ${req.requestDate}</p>
                                                        <p>Format: ${req.format.toUpperCase()}</p>
                                                        <p>Categories: ${req.categories.length} selected</p>
                                                    </div>
                                                </div>
                                                <div class="request-actions">
                                                    ${req.status === 'ready' ? 
                                                        '<button class="btn btn-success btn-small" onclick="privacySecurityAdditionalUI.downloadExport(\'' + req.id + '\')">📥 Download</button>' :
                                                        '<button class="btn btn-secondary btn-small" disabled>Processing...</button>'
                                                    }
                                                </div>
                                            </div>
                                        `).join('') : '<div class="empty-state">No recent export requests</div>'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

            case 'rights':
                return `
                    <div class="gdpr-rights-section">
                        <h3>📜 Your GDPR Rights</h3>
                        <p>Under the General Data Protection Regulation (GDPR), you have several rights regarding your personal data.</p>

                        <div class="rights-grid">
                            <div class="right-card">
                                <div class="right-icon">📖</div>
                                <div class="right-content">
                                    <h4>Right to Information</h4>
                                    <p>You have the right to know what personal data we collect, how we use it, and who we share it with.</p>
                                    <button class="btn btn-small btn-secondary" onclick="privacySecurityAdditionalUI.viewDataProcessingInfo()">
                                        View Our Practices
                                    </button>
                                </div>
                            </div>

                            <div class="right-card">
                                <div class="right-icon">📥</div>
                                <div class="right-content">
                                    <h4>Right of Access</h4>
                                    <p>You can request a copy of all personal data we hold about you.</p>
                                    <button class="btn btn-small btn-primary" onclick="privacySecurityAdditionalUI.switchGDPRTab('export')">
                                        Request My Data
                                    </button>
                                </div>
                            </div>

                            <div class="right-card">
                                <div class="right-icon">✏️</div>
                                <div class="right-content">
                                    <h4>Right to Rectification</h4>
                                    <p>You can request correction of inaccurate or incomplete personal data.</p>
                                    <button class="btn btn-small btn-secondary" onclick="privacySecurityAdditionalUI.requestDataCorrection()">
                                        Request Correction
                                    </button>
                                </div>
                            </div>

                            <div class="right-card">
                                <div class="right-icon">🗑️</div>
                                <div class="right-content">
                                    <h4>Right to Erasure</h4>
                                    <p>You can request deletion of your personal data under certain circumstances.</p>
                                    <button class="btn btn-small btn-error" onclick="privacySecurityAdditionalUI.requestDataDeletion()">
                                        Request Deletion
                                    </button>
                                </div>
                            </div>

                            <div class="right-card">
                                <div class="right-icon">⏸️</div>
                                <div class="right-content">
                                    <h4>Right to Restrict Processing</h4>
                                    <p>You can request to limit how we process your personal data.</p>
                                    <button class="btn btn-small btn-warning" onclick="privacySecurityAdditionalUI.requestProcessingRestriction()">
                                        Request Restriction
                                    </button>
                                </div>
                            </div>

                            <div class="right-card">
                                <div class="right-icon">📱</div>
                                <div class="right-content">
                                    <h4>Right to Data Portability</h4>
                                    <p>You can request your data in a portable format to transfer to another service.</p>
                                    <button class="btn btn-small btn-primary" onclick="privacySecurityAdditionalUI.requestDataPortability()">
                                        Request Portability
                                    </button>
                                </div>
                            </div>

                            <div class="right-card">
                                <div class="right-icon">🚫</div>
                                <div class="right-content">
                                    <h4>Right to Object</h4>
                                    <p>You can object to certain types of data processing, including marketing.</p>
                                    <button class="btn btn-small btn-warning" onclick="privacySecurityAdditionalUI.objectToProcessing()">
                                        Object to Processing
                                    </button>
                                </div>
                            </div>

                            <div class="right-card">
                                <div class="right-icon">🤖</div>
                                <div class="right-content">
                                    <h4>Rights Related to Automated Decision-Making</h4>
                                    <p>You have rights regarding automated processing and profiling.</p>
                                    <button class="btn btn-small btn-secondary" onclick="privacySecurityAdditionalUI.viewAutomatedProcessing()">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="rights-process">
                            <h4>📋 How to Exercise Your Rights</h4>
                            <div class="process-steps">
                                <div class="step">
                                    <div class="step-number">1</div>
                                    <div class="step-content">
                                        <h5>Submit Request</h5>
                                        <p>Use the buttons above or contact our privacy team directly</p>
                                    </div>
                                </div>
                                <div class="step">
                                    <div class="step-number">2</div>
                                    <div class="step-content">
                                        <h5>Identity Verification</h5>
                                        <p>We may need to verify your identity for security purposes</p>
                                    </div>
                                </div>
                                <div class="step">
                                    <div class="step-number">3</div>
                                    <div class="step-content">
                                        <h5>Processing</h5>
                                        <p>We'll process your request within 30 days as required by GDPR</p>
                                    </div>
                                </div>
                                <div class="step">
                                    <div class="step-number">4</div>
                                    <div class="step-content">
                                        <h5>Response</h5>
                                        <p>You'll receive our response via email with any requested data or actions</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

            case 'compliance':
                return `
                    <div class="compliance-dashboard">
                        <h3>🔒 GDPR Compliance Dashboard</h3>
                        <p>Monitor your data processing preferences and compliance status.</p>

                        <div class="compliance-overview">
                            <div class="compliance-stats">
                                <div class="stat-card">
                                    <div class="stat-icon">✅</div>
                                    <div class="stat-info">
                                        <div class="stat-number">98%</div>
                                        <div class="stat-label">Compliance Score</div>
                                    </div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-icon">📊</div>
                                    <div class="stat-info">
                                        <div class="stat-number">${new Date().toLocaleDateString()}</div>
                                        <div class="stat-label">Last Updated</div>
                                    </div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-icon">🔒</div>
                                    <div class="stat-info">
                                        <div class="stat-number">Active</div>
                                        <div class="stat-label">Privacy Status</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="consent-management">
                            <h4>🍪 Consent Management</h4>
                            <div class="consent-options">
                                <div class="consent-item">
                                    <div class="consent-info">
                                        <h5>Essential Cookies</h5>
                                        <p>Required for basic website functionality</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" checked disabled>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>

                                <div class="consent-item">
                                    <div class="consent-info">
                                        <h5>Analytics Cookies</h5>
                                        <p>Help us understand how you use our platform</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" ${this.complianceSettings.analyticsConsent ? 'checked' : ''} 
                                               onchange="privacySecurityAdditionalUI.updateConsent('analyticsConsent', this.checked)">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>

                                <div class="consent-item">
                                    <div class="consent-info">
                                        <h5>Marketing Cookies</h5>
                                        <p>Used for advertising and personalized content</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" ${this.complianceSettings.cookieConsent ? 'checked' : ''} 
                                               onchange="privacySecurityAdditionalUI.updateConsent('cookieConsent', this.checked)">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>

                                <div class="consent-item">
                                    <div class="consent-info">
                                        <h5>Email Communications</h5>
                                        <p>Newsletters, updates, and promotional emails</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" ${this.complianceSettings.emailConsent ? 'checked' : ''} 
                                               onchange="privacySecurityAdditionalUI.updateConsent('emailConsent', this.checked)">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="data-retention">
                            <h4>📅 Data Retention Settings</h4>
                            <div class="retention-options">
                                <label class="radio-option">
                                    <input type="radio" name="dataRetention" value="1_year" 
                                           ${this.complianceSettings.dataRetention === '1_year' ? 'checked' : ''}
                                           onchange="privacySecurityAdditionalUI.updateRetention(this.value)">
                                    <div class="option-content">
                                        <h5>1 Year Retention</h5>
                                        <p>Delete my data after 1 year of inactivity</p>
                                    </div>
                                </label>

                                <label class="radio-option">
                                    <input type="radio" name="dataRetention" value="2_years" 
                                           ${this.complianceSettings.dataRetention === '2_years' ? 'checked' : ''}
                                           onchange="privacySecurityAdditionalUI.updateRetention(this.value)">
                                    <div class="option-content">
                                        <h5>2 Years Retention (Default)</h5>
                                        <p>Delete my data after 2 years of inactivity</p>
                                    </div>
                                </label>

                                <label class="radio-option">
                                    <input type="radio" name="dataRetention" value="5_years" 
                                           ${this.complianceSettings.dataRetention === '5_years' ? 'checked' : ''}
                                           onchange="privacySecurityAdditionalUI.updateRetention(this.value)">
                                    <div class="option-content">
                                        <h5>5 Years Retention</h5>
                                        <p>Keep my data for 5 years of inactivity</p>
                                    </div>
                                </label>

                                <label class="radio-option">
                                    <input type="radio" name="dataRetention" value="indefinite" 
                                           ${this.complianceSettings.dataRetention === 'indefinite' ? 'checked' : ''}
                                           onchange="privacySecurityAdditionalUI.updateRetention(this.value)">
                                    <div class="option-content">
                                        <h5>Keep Indefinitely</h5>
                                        <p>Don't automatically delete my data</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="privacy-controls">
                            <h4>🔐 Advanced Privacy Controls</h4>
                            <div class="control-options">
                                <div class="control-item">
                                    <div class="control-info">
                                        <h5>Automatic Data Deletion</h5>
                                        <p>Automatically delete old data based on retention settings</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" ${this.complianceSettings.autoDelete ? 'checked' : ''} 
                                               onchange="privacySecurityAdditionalUI.updateSetting('autoDelete', this.checked)">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>

                                <div class="control-item">
                                    <div class="control-info">
                                        <h5>Consent Tracking</h5>
                                        <p>Track and log all consent changes for compliance</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" ${this.complianceSettings.consentTracking ? 'checked' : ''} 
                                               onchange="privacySecurityAdditionalUI.updateSetting('consentTracking', this.checked)">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="compliance-actions">
                            <button class="btn btn-primary" onclick="privacySecurityAdditionalUI.generateComplianceReport()">
                                📄 Generate Compliance Report
                            </button>
                            <button class="btn btn-secondary" onclick="privacySecurityAdditionalUI.downloadConsentHistory()">
                                📥 Download Consent History
                            </button>
                        </div>
                    </div>
                `;

            case 'verification':
                return `
                    <div class="data-verification-section">
                        <h3>✅ Data Verification & Audit</h3>
                        <p>Verify the accuracy of your personal data and audit our data processing practices.</p>

                        <div class="verification-wizard">
                            <div class="verification-steps">
                                <div class="step active">1. Data Review</div>
                                <div class="step">2. Accuracy Check</div>
                                <div class="step">3. Corrections</div>
                                <div class="step">4. Verification</div>
                            </div>

                            <div class="data-review">
                                <h4>📋 Personal Data Summary</h4>
                                <div class="data-summary-grid">
                                    <div class="summary-card">
                                        <div class="summary-icon">👤</div>
                                        <div class="summary-content">
                                            <h5>Profile Data</h5>
                                            <div class="data-points">
                                                <div class="data-point">
                                                    <span class="label">Name:</span>
                                                    <span class="value">John Doe</span>
                                                    <button class="btn btn-small btn-secondary" onclick="privacySecurityAdditionalUI.requestCorrection('name')">
                                                        ✏️ Correct
                                                    </button>
                                                </div>
                                                <div class="data-point">
                                                    <span class="label">Email:</span>
                                                    <span class="value">john@example.com</span>
                                                    <button class="btn btn-small btn-secondary" onclick="privacySecurityAdditionalUI.requestCorrection('email')">
                                                        ✏️ Correct
                                                    </button>
                                                </div>
                                                <div class="data-point">
                                                    <span class="label">Location:</span>
                                                    <span class="value">New York, NY</span>
                                                    <button class="btn btn-small btn-secondary" onclick="privacySecurityAdditionalUI.requestCorrection('location')">
                                                        ✏️ Correct
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="summary-card">
                                        <div class="summary-icon">📊</div>
                                        <div class="summary-content">
                                            <h5>Usage Analytics</h5>
                                            <div class="data-points">
                                                <div class="data-point">
                                                    <span class="label">Account Created:</span>
                                                    <span class="value">${new Date(Date.now() - 365*24*60*60*1000).toLocaleDateString()}</span>
                                                </div>
                                                <div class="data-point">
                                                    <span class="label">Last Login:</span>
                                                    <span class="value">${new Date().toLocaleDateString()}</span>
                                                </div>
                                                <div class="data-point">
                                                    <span class="label">Total Posts:</span>
                                                    <span class="value">247</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="summary-card">
                                        <div class="summary-icon">🔗</div>
                                        <div class="summary-content">
                                            <h5>Connected Services</h5>
                                            <div class="data-points">
                                                <div class="data-point">
                                                    <span class="label">Google Account:</span>
                                                    <span class="value">Connected</span>
                                                    <button class="btn btn-small btn-warning" onclick="privacySecurityAdditionalUI.disconnectService('google')">
                                                        🔗 Disconnect
                                                    </button>
                                                </div>
                                                <div class="data-point">
                                                    <span class="label">Facebook Account:</span>
                                                    <span class="value">Not Connected</span>
                                                    <button class="btn btn-small btn-secondary" onclick="privacySecurityAdditionalUI.connectService('facebook')">
                                                        🔗 Connect
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="data-audit">
                                <h4>🔍 Data Processing Audit</h4>
                                <div class="audit-items">
                                    <div class="audit-item">
                                        <div class="audit-status status-verified">✅</div>
                                        <div class="audit-content">
                                            <h5>Data Collection Practices</h5>
                                            <p>All data collection follows GDPR guidelines</p>
                                            <small>Last audited: ${new Date().toLocaleDateString()}</small>
                                        </div>
                                    </div>

                                    <div class="audit-item">
                                        <div class="audit-status status-verified">✅</div>
                                        <div class="audit-content">
                                            <h5>Data Sharing</h5>
                                            <p>No unauthorized data sharing detected</p>
                                            <small>Last audited: ${new Date().toLocaleDateString()}</small>
                                        </div>
                                    </div>

                                    <div class="audit-item">
                                        <div class="audit-status status-verified">✅</div>
                                        <div class="audit-content">
                                            <h5>Data Security</h5>
                                            <p>All data encrypted and securely stored</p>
                                            <small>Last audited: ${new Date().toLocaleDateString()}</small>
                                        </div>
                                    </div>

                                    <div class="audit-item">
                                        <div class="audit-status status-pending">⏳</div>
                                        <div class="audit-content">
                                            <h5>Data Accuracy</h5>
                                            <p>Pending your verification of personal information</p>
                                            <small>Action required</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="verification-actions">
                                <button class="btn btn-primary" onclick="privacySecurityAdditionalUI.verifyAllData()">
                                    ✅ Verify All Data is Accurate
                                </button>
                                <button class="btn btn-secondary" onclick="privacySecurityAdditionalUI.requestDataAudit()">
                                    🔍 Request Full Data Audit
                                </button>
                                <button class="btn btn-warning" onclick="privacySecurityAdditionalUI.reportDataIssue()">
                                    ⚠️ Report Data Issue
                                </button>
                            </div>
                        </div>
                    </div>
                `;

            default:
                return '<div>Invalid tab</div>';
        }
    }

    // Helper methods for Advanced Content Reporting System
    showAdvancedReportContextMenu(event) {
        const x = event.clientX;
        const y = event.clientY;
        
        const contextMenu = document.createElement('div');
        contextMenu.className = 'advanced-report-context-menu';
        contextMenu.style.cssText = `
            position: fixed;
            top: ${y}px;
            left: ${x}px;
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: 8px;
            padding: 0.5rem 0;
            z-index: 10000;
            min-width: 200px;
: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        contextMenu.innerHTML = `
            <div onclick="privacySecurityAdditionalUI.showAdvancedContentReporting(); this.parentElement.remove()" 
                 style="padding: 0.5rem 1rem; cursor: pointer;">
                🚨 Advanced Report
            </div>
            <div onclick="privacySecurityAdditionalUI.blockUserFromContext(); this.parentElement.remove()" 
                 style="padding: 0.5rem 1rem; cursor: pointer;">
                🚫 Block User
            </div>
            <div onclick="privacySecurityAdditionalUI.muteUserFromContext(); this.parentElement.remove()" 
                 style="padding: 0.5rem 1rem; cursor: pointer;">
                🔇 Mute User
            </div>
        `;
        
        document.body.appendChild(contextMenu);
        
        setTimeout(() => {
            document.addEventListener('click', () => contextMenu.remove(), { once: true });
        }, 100);
    }

    handleEvidenceUpload(files) {
        Array.from(files).forEach(file => {
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                showToast(`File ${file.name} is too large (max 50MB)`, 'error');
                return;
            }

            const evidenceFile = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type,
                uploadDate: new Date().toLocaleDateString()
            };

            this.evidenceFiles.push(evidenceFile);
            this.displayUploadedEvidence();
        });
    }

    displayUploadedEvidence() {
        const container = document.getElementById('uploadedEvidence');
        if (container) {
            container.innerHTML = this.evidenceFiles.map(file => `
                <div class="uploaded-file">
                    <div class="file-info">
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${this.formatFileSize(file.size)}</span>
                    </div>
                    <button class="btn btn-error btn-small" onclick="privacySecurityAdditionalUI.removeEvidence('${file.id}')">
                        ❌
                    </button>
                </div>
            `).join('');
        }
    }

    submitAdvancedReport() {
        const category = document.querySelector('input[name="reportCategory"]:checked')?.value;
        const description = document.getElementById('reportDescription')?.value;
        const priority = document.querySelector('input[name="priority"]:checked')?.value;

        if (!category) {
            showToast('Please select a report category', 'warning');
            return;
        }

        if (!description || description.trim().length < 10) {
            showToast('Please provide a detailed description (minimum 10 characters)', 'warning');
            return;
        }

        const report = {
            id: Date.now(),
            category,
            description: description.trim(),
            priority,
            contentId: Date.now(),
            contentType: 'post',
            status: 'pending',
            submittedDate: new Date().toLocaleDateString(),
            evidence: [...this.evidenceFiles]
        };

        this.reportTracker.push(report);
        this.saveUserData();

        showToast('Advanced report submitted successfully', 'success');
        document.getElementById('advancedReportModal').classList.remove('active');
    }

    saveDraft() {
        const draftData = {
            category: document.querySelector('input[name="reportCategory"]:checked')?.value,
            description: document.getElementById('reportDescription')?.value,
            priority: document.querySelector('input[name="priority"]:checked')?.value,
            evidence: [...this.evidenceFiles]
        };
        
        localStorage.setItem('reportDraft', JSON.stringify(draftData));
        showToast('Report draft saved', 'success');
    }

    filterReports(status) {
        const reportItems = document.querySelectorAll('.report-item');
        reportItems.forEach(item => {
            if (status === 'all' || item.dataset.status === status) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    viewReportDetails(reportId) {
        showToast('Report details would be displayed in a detailed view', 'info');
    }

    withdrawReport(reportId) {
        if (confirm('Are you sure you want to withdraw this report?')) {
            this.reportTracker = this.reportTracker.filter(r => r.id != reportId);
            this.saveUserData();
            showToast('Report withdrawn', 'success');
            this.switchReportTab('track');
        }
    }

    submitAppeal(reportId) {
        showToast('Appeal submission interface would open', 'info');
    }

    submitAppealForm() {
        const reportId = document.getElementById('appealReportId')?.value;
        const reason = document.getElementById('appealReason')?.value;
        const description = document.getElementById('appealDescription')?.value;

        if (!reportId || !reason || !description) {
            showToast('Please fill in all required fields', 'warning');
            return;
        }

        showToast('Appeal submitted successfully', 'success');
        document.getElementById('advancedReportModal').classList.remove('active');
    }

    uploadEvidence(files) {
        this.handleEvidenceUpload(files);
    }

    getFilePreview(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const icons = {
            'png': '🖼️', 'jpg': '🖼️', 'jpeg': '🖼️',
            'pdf': '📄', 'txt': '📝', 'mp4': '🎥'
        };
        return icons[extension] || '📁';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    viewEvidence(fileId) {
        showToast('Evidence viewer would open', 'info');
    }

    downloadEvidence(fileId) {
        showToast('Evidence download would start', 'info');
    }

    deleteEvidence(fileId) {
        if (confirm('Are you sure you want to delete this evidence file?')) {
            this.evidenceFiles = this.evidenceFiles.filter(f => f.id != fileId);
            showToast('Evidence file deleted', 'success');
        }
    }

    removeEvidence(fileId) {
        this.evidenceFiles = this.evidenceFiles.filter(f => f.id != fileId);
        this.displayUploadedEvidence();
    }

    // GDPR Helper Methods
    initiateGDPRExport() {
        const selectedCategories = [];
        const categoryInputs = document.querySelectorAll('input[name="dataCategory"]:checked');
        const formatInput = document.querySelector('input[name="exportFormat"]:checked');
        const timePeriodInput = document.querySelector('input[name="timePeriod"]:checked');

        categoryInputs.forEach(input => {
            selectedCategories.push(input.value);
        });

        if (selectedCategories.length === 0) {
            showToast('Please select at least one data category', 'warning');
            return;
        }

        const exportRequest = {
            id: Date.now(),
            requestDate: new Date().toLocaleDateString(),
            categories: selectedCategories,
            format: formatInput ? formatInput.value : 'json',
            timePeriod: timePeriodInput ? timePeriodInput.value : 'all',
            status: 'processing'
        };

        this.dataExportRequests.push(exportRequest);
        this.saveUserData();

        showToast('GDPR data export requested successfully. You\'ll receive an email when ready.', 'success');
        
        // Simulate processing time
        setTimeout(() => {
            exportRequest.status = 'ready';
            this.saveUserData();
            showToast('Your data export is now ready for download!', 'success');
        }, 3000);
    }

    previewExport() {
        showToast('Export preview would show data summary and structure', 'info');
    }

    downloadExport(requestId) {
        showToast(`Downloading export #${requestId}...`, 'info');
        // In a real app, this would trigger actual file download
    }

    // GDPR Rights Helper Methods
    viewDataProcessingInfo() {
        showToast('Data processing information would be displayed', 'info');
    }

    requestDataCorrection() {
        showToast('Data correction request form would open', 'info');
    }

    requestDataDeletion() {
        if (confirm('Are you sure you want to request account deletion? This action cannot be undone.')) {
            showToast('Account deletion request submitted', 'warning');
        }
    }

    requestProcessingRestriction() {
        showToast('Processing restriction request submitted', 'info');
    }

    requestDataPortability() {
        showToast('Data portability request would be processed', 'info');
    }

    objectToProcessing() {
        showToast('Processing objection submitted', 'info');
    }

    viewAutomatedProcessing() {
        showToast('Automated decision-making details would be shown', 'info');
    }

    // Compliance Helper Methods
    updateConsent(consentType, value) {
        this.complianceSettings[consentType] = value;
        this.saveUserData();
        showToast(`${consentType} consent updated`, 'success');
    }

    updateRetention(value) {
        this.complianceSettings.dataRetention = value;
        this.saveUserData();
        showToast('Data retention settings updated', 'success');
    }

    updateSetting(setting, value) {
        this.complianceSettings[setting] = value;
        this.saveUserData();
        showToast(`${setting} setting updated`, 'success');
    }

    generateComplianceReport() {
        const report = {
            generatedDate: new Date().toISOString(),
            complianceScore: '98%',
            settings: this.complianceSettings,
            consentHistory: []
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gdpr-compliance-report.json';
        a.click();

        showToast('Compliance report generated and downloaded', 'success');
    }

    downloadConsentHistory() {
        const consentHistory = {
            userId: 'user123',
            consentChanges: [
                { date: new Date().toISOString(), type: 'analytics', value: this.complianceSettings.analyticsConsent },
                { date: new Date().toISOString(), type: 'marketing', value: this.complianceSettings.cookieConsent }
            ]
        };

        const blob = new Blob([JSON.stringify(consentHistory, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'consent-history.json';
        a.click();

        showToast('Consent history downloaded', 'success');
    }

    // Data Verification Helper Methods
    requestCorrection(field) {
        showToast(`Correction request submitted for ${field}`, 'info');
    }

    disconnectService(service) {
        if (confirm(`Are you sure you want to disconnect your ${service} account?`)) {
            showToast(`${service} account disconnected`, 'success');
        }
    }

    connectService(service) {
        showToast(`Connecting to ${service}... (would redirect to OAuth)`, 'info');
    }

    verifyAllData() {
        showToast('All data marked as verified. Thank you for confirming accuracy.', 'success');
    }

    requestDataAudit() {
        showToast('Full data audit requested. You\'ll receive a comprehensive report within 7 days.', 'info');
    }

    reportDataIssue() {
        showToast('Data issue reporting form would open', 'info');
    }

    // Additional Context Menu Actions
    blockUserFromContext() {
        showToast('User blocking interface would open', 'info');
    }

    muteUserFromContext() {
        showToast('User muting interface would open', 'info');
    }
}

// Initialize Privacy & Security Additional UI Components
let privacySecurityAdditionalUI = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        privacySecurityAdditionalUI = new PrivacySecurityAdditionalUI();
        window.privacySecurityAdditionalUI = privacySecurityAdditionalUI; // Make globally available
    }, 1000);
});

// Global functions to interface with the Privacy & Security Additional UI
function showAdvancedContentReporting(contentId, contentType, contentData) {
    if (privacySecurityAdditionalUI) {
        privacySecurityAdditionalUI.showAdvancedContentReporting(contentId, contentType, contentData);
    }
}

function showGDPRDataExport() {
    if (privacySecurityAdditionalUI) {
        privacySecurityAdditionalUI.showGDPRDataExport();
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrivacySecurityAdditionalUI;
}
