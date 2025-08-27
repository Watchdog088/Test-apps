/**
 * ConnectHub - Messages Missing UI Components
 * 6 detailed missing UI interfaces for the Messaging section
 */

class MessagesMissingUIComponents {
    constructor(app) {
        this.app = app;
        this.currentConversation = null;
        this.scheduledMessages = [];
        this.translationCache = new Map();
        this.filePreviewCache = new Map();
        this.searchHistory = [];
        this.conversationArchives = [];
        
        this.init();
    }

    /**
     * Initialize all missing Messages UI components
     */
    init() {
        this.initMessageSearchInterface();
        this.initGroupChatManagementPanel();
        this.initMessageSchedulingInterface();
        this.initAdvancedFilePreviewSystem();
        this.initMessageTranslationInterface();
        this.initConversationArchiveExport();
        
        console.log('Messages Missing UI Components initialized');
    }

    // ========================================
    // 1. MESSAGE SEARCH INTERFACE
    // ========================================

    initMessageSearchInterface() {
        this.setupAdvancedMessageSearch();
        this.setupSearchFilters();
        this.setupSearchHistory();
    }

    setupAdvancedMessageSearch() {
        // Create comprehensive search interface
        const searchContainer = this.createAdvancedSearchInterface();
        
        // Add to messages sidebar
        const messagesSidebar = document.querySelector('.messages-sidebar');
        if (messagesSidebar) {
            const searchHeader = document.createElement('div');
            searchHeader.className = 'advanced-search-header';
            searchHeader.appendChild(searchContainer);
            messagesSidebar.insertBefore(searchHeader, messagesSidebar.firstChild);
        }
    }

    createAdvancedSearchInterface() {
        const searchInterface = document.createElement('div');
        searchInterface.className = 'advanced-message-search-interface';
        searchInterface.innerHTML = `
            <div class="search-main-container">
                <div class="search-input-wrapper">
                    <div class="search-input-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" id="advanced-message-search" placeholder="Search messages, files, links..." class="advanced-search-input">
                        <button class="search-options-btn" id="search-options-toggle" title="Search Options">
                            <i class="fas fa-sliders-h"></i>
                        </button>
                        <button class="clear-search-btn" id="clear-advanced-search" title="Clear Search" style="display: none;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="search-results-container" id="search-results-container" style="display: none;">
                    <div class="search-results-list" id="search-results-list"></div>
                </div>
            </div>
        `;

        this.setupAdvancedSearchEvents(searchInterface);
        return searchInterface;
    }

    setupAdvancedSearchEvents(searchInterface) {
        const searchInput = searchInterface.querySelector('#advanced-message-search');
        const clearSearch = searchInterface.querySelector('#clear-advanced-search');

        // Search input with debounce
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(searchTimeout);
            
            if (query.length > 0) {
                clearSearch.style.display = 'block';
                searchTimeout = setTimeout(() => {
                    this.performAdvancedSearch(query);
                }, 500);
            } else {
                clearSearch.style.display = 'none';
                this.hideSearchResults();
            }
        });

        // Clear search
        clearSearch.addEventListener('click', () => {
            this.clearAdvancedSearch();
        });
    }

    async performAdvancedSearch(query) {
        try {
            const results = await this.searchMessages(query);
            this.displaySearchResults(results, query);
        } catch (error) {
            console.error('Advanced search failed:', error);
            this.app.showToast('Search failed. Please try again.', 'error');
        }
    }

    async searchMessages(query) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            {
                id: 'result-1',
                conversationName: 'Emma Watson',
                content: `Thanks for sharing that ${query} article!`,
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
            }
        ];
    }

    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('search-results-container');
        const resultsList = document.getElementById('search-results-list');

        if (results.length === 0) {
            resultsList.innerHTML = '<div class="no-results">No results found</div>';
        } else {
            resultsList.innerHTML = results.map(result => `
                <div class="search-result-item">
                    <div class="result-content">${result.content}</div>
                </div>
            `).join('');
        }

        resultsContainer.style.display = 'block';
    }

    clearAdvancedSearch() {
        document.getElementById('advanced-message-search').value = '';
        document.getElementById('clear-advanced-search').style.display = 'none';
        this.hideSearchResults();
    }

    hideSearchResults() {
        const container = document.getElementById('search-results-container');
        if (container) container.style.display = 'none';
    }

    addToSearchHistory(query) {
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            if (this.searchHistory.length > 10) {
                this.searchHistory = this.searchHistory.slice(0, 10);
            }
        }
    }

    setupSearchFilters() {
        // Filter functionality
    }

    setupSearchHistory() {
        // History functionality
    }

    // ========================================
    // 2. GROUP CHAT MANAGEMENT PANEL
    // ========================================

    initGroupChatManagementPanel() {
        this.setupGroupManagementInterface();
        this.setupMemberManagement();
        this.setupGroupSettings();
    }

    setupGroupManagementInterface() {
        // Add group management button to group conversations
        document.addEventListener('click', (e) => {
            if (e.target.closest('.group-manage-btn')) {
                const conversationId = e.target.closest('[data-conversation-id]').dataset.conversationId;
                this.showGroupManagementPanel(conversationId);
            }
        });
    }

    showGroupManagementPanel(conversationId) {
        const modal = this.createGroupManagementModal(conversationId);
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    createGroupManagementModal(conversationId) {
        const modal = document.createElement('div');
        modal.id = 'group-management-modal';
        modal.className = 'modal large';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Manage Group Chat</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="group-management-tabs">
                        <button class="management-tab active" data-tab="members">Members (15)</button>
                        <button class="management-tab" data-tab="settings">Settings</button>
                        <button class="management-tab" data-tab="permissions">Permissions</button>
                    </div>
                    <div class="management-content">
                        <div class="management-tab-content active" data-tab="members">
                            <div class="members-management">
                                <div class="members-list">
                                    ${this.renderGroupMembersList()}
                                </div>
                            </div>
                        </div>
                        <div class="management-tab-content" data-tab="settings">
                            <div class="group-settings-form">
                                <div class="form-group">
                                    <label for="group-name-edit">Group Name</label>
                                    <input type="text" id="group-name-edit" class="form-input" value="Design Team">
                                </div>
                            </div>
                        </div>
                        <div class="management-tab-content" data-tab="permissions">
                            <div class="permissions-manager">
                                <div class="roles-list">
                                    ${this.renderGroupRoles()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-primary">Save Changes</button>
                </div>
            </div>
        `;

        this.setupGroupManagementEvents(modal);
        return modal;
    }

    renderGroupMembersList() {
        const members = [
            { id: 1, name: 'Emma Watson', role: 'Admin', avatar: 'EW' },
            { id: 2, name: 'Alex Johnson', role: 'Member', avatar: 'AJ' },
            { id: 3, name: 'Sarah Chen', role: 'Moderator', avatar: 'SC' }
        ];

        return members.map(member => `
            <div class="member-item" data-member-id="${member.id}">
                <div class="member-avatar">${member.avatar}</div>
                <div class="member-info">
                    <div class="member-name">${member.name}</div>
                    <div class="member-role">${member.role}</div>
                </div>
                <div class="member-actions">
                    <select class="role-select">
                        <option value="admin" ${member.role === 'Admin' ? 'selected' : ''}>Admin</option>
                        <option value="moderator" ${member.role === 'Moderator' ? 'selected' : ''}>Moderator</option>
                        <option value="member" ${member.role === 'Member' ? 'selected' : ''}>Member</option>
                    </select>
                    <button class="remove-member-btn" title="Remove Member">
                        <i class="fas fa-user-minus"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderGroupRoles() {
        const roles = ['Admin', 'Moderator', 'Member'];
        return roles.map(role => `
            <div class="role-item">
                <div class="role-name">${role}</div>
                <div class="role-permissions">Can manage group settings</div>
            </div>
        `).join('');
    }

    setupGroupManagementEvents(modal) {
        // Tab switching
        modal.querySelectorAll('.management-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchManagementTab(modal, tab.dataset.tab);
            });
        });
    }

    switchManagementTab(modal, tabName) {
        modal.querySelectorAll('.management-tab').forEach(tab => tab.classList.remove('active'));
        modal.querySelectorAll('.management-tab-content').forEach(content => content.classList.remove('active'));
        
        modal.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        modal.querySelector(`.management-tab-content[data-tab="${tabName}"]`).classList.add('active');
    }

    setupMemberManagement() {
        // Member management functionality
    }

    setupGroupSettings() {
        // Group settings functionality
    }

    // ========================================
    // 3. MESSAGE SCHEDULING INTERFACE
    // ========================================

    initMessageSchedulingInterface() {
        this.setupScheduledMessageComposer();
        this.setupScheduleManager();
    }

    setupScheduledMessageComposer() {
        // Add schedule button to message composer
        document.addEventListener('click', (e) => {
            if (e.target.closest('#schedule-message-btn')) {
                this.showScheduleMessageModal();
            }
        });
    }

    showScheduleMessageModal() {
        const modal = this.createScheduleMessageModal();
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    createScheduleMessageModal() {
        const modal = document.createElement('div');
        modal.id = 'schedule-message-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Schedule Message</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="schedule-form">
                        <div class="form-group">
                            <label>Message</label>
                            <textarea class="form-input" rows="4" placeholder="Type your message..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Send Date & Time</label>
                            <div class="datetime-picker">
                                <input type="date" class="form-input" id="schedule-date">
                                <input type="time" class="form-input" id="schedule-time">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Recipients</label>
                            <select class="form-input" multiple>
                                <option>Emma Watson</option>
                                <option>Alex Johnson</option>
                                <option>Design Team (Group)</option>
                            </select>
                        </div>
                        <div class="schedule-options">
                            <label class="toggle-label">
                                <input type="checkbox" id="repeat-message">
                                <span class="toggle-slider"></span>
                                Repeat message
                            </label>
                            <div class="repeat-settings" style="display: none;">
                                <select class="form-input">
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                    <option>Monthly</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="messagesMissingUI.scheduleMessage(); this.closest('.modal').remove();">Schedule Message</button>
                </div>
            </div>
        `;

        this.setupScheduleModalEvents(modal);
        return modal;
    }

    setupScheduleModalEvents(modal) {
        const repeatCheckbox = modal.querySelector('#repeat-message');
        const repeatSettings = modal.querySelector('.repeat-settings');

        repeatCheckbox.addEventListener('change', () => {
            repeatSettings.style.display = repeatCheckbox.checked ? 'block' : 'none';
        });
    }

    scheduleMessage() {
        const message = {
            id: Date.now(),
            content: 'Scheduled message',
            scheduledFor: new Date(),
            status: 'scheduled'
        };
        
        this.scheduledMessages.push(message);
        this.app.showToast('Message scheduled successfully!', 'success');
    }

    setupScheduleManager() {
        // Manager for viewing/editing scheduled messages
    }

    // ========================================
    // 4. ADVANCED FILE PREVIEW SYSTEM
    // ========================================

    initAdvancedFilePreviewSystem() {
        this.setupFilePreviewHandlers();
        this.setupPreviewModal();
    }

    setupFilePreviewHandlers() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.file-preview-btn')) {
                const fileUrl = e.target.closest('.file-message').dataset.fileUrl;
                const fileName = e.target.closest('.file-message').dataset.fileName;
                this.showAdvancedFilePreview(fileUrl, fileName);
            }
        });
    }

    showAdvancedFilePreview(fileUrl, fileName) {
        const modal = this.createFilePreviewModal(fileUrl, fileName);
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    createFilePreviewModal(fileUrl, fileName) {
        const modal = document.createElement('div');
        modal.id = 'file-preview-modal';
        modal.className = 'modal large';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="file-preview-header">
                        <h3>${fileName}</h3>
                        <div class="file-actions">
                            <button class="btn btn-outline" onclick="messagesMissingUI.downloadFile('${fileUrl}', '${fileName}')">
                                <i class="fas fa-download"></i> Download
                            </button>
                            <button class="btn btn-outline" onclick="messagesMissingUI.shareFile('${fileUrl}', '${fileName}')">
                                <i class="fas fa-share"></i> Share
                            </button>
                        </div>
                    </div>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="file-preview-container">
                        ${this.renderFilePreview(fileUrl, fileName)}
                    </div>
                    <div class="file-metadata">
                        <div class="metadata-item">
                            <label>File Size:</label>
                            <span>2.3 MB</span>
                        </div>
                        <div class="metadata-item">
                            <label>File Type:</label>
                            <span>PDF Document</span>
                        </div>
                        <div class="metadata-item">
                            <label>Shared by:</label>
                            <span>Emma Watson</span>
                        </div>
                        <div class="metadata-item">
                            <label>Shared on:</label>
                            <span>March 15, 2024</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return modal;
    }

    renderFilePreview(fileUrl, fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'pdf':
                return `
                    <div class="pdf-preview">
                        <embed src="${fileUrl}" type="application/pdf" width="100%" height="500px">
                    </div>
                `;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return `
                    <div class="image-preview">
                        <img src="${fileUrl}" alt="${fileName}" class="preview-image">
                    </div>
                `;
            case 'mp4':
            case 'webm':
            case 'ogg':
                return `
                    <div class="video-preview">
                        <video controls width="100%" height="400px">
                            <source src="${fileUrl}" type="video/${extension}">
                        </video>
                    </div>
                `;
            default:
                return `
                    <div class="generic-file-preview">
                        <i class="fas fa-file-alt"></i>
                        <h4>${fileName}</h4>
                        <p>Preview not available for this file type</p>
                    </div>
                `;
        }
    }

    downloadFile(fileUrl, fileName) {
        // Create download link
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.app.showToast('File download started', 'success');
    }

    shareFile(fileUrl, fileName) {
        if (navigator.share) {
            navigator.share({
                title: fileName,
                files: [new File([fileUrl], fileName)]
            });
        } else {
            // Fallback: copy link to clipboard
            navigator.clipboard.writeText(fileUrl);
            this.app.showToast('File link copied to clipboard', 'success');
        }
    }

    setupPreviewModal() {
        // Additional preview modal setup
    }

    // ========================================
    // 5. MESSAGE TRANSLATION INTERFACE
    // ========================================

    initMessageTranslationInterface() {
        this.setupTranslationButtons();
        this.setupLanguageDetection();
    }

    setupTranslationButtons() {
        // Add translate button to messages
        document.addEventListener('click', (e) => {
            if (e.target.closest('.translate-message-btn')) {
                const messageElement = e.target.closest('.message');
                const messageId = messageElement.dataset.messageId;
                this.translateMessage(messageId);
            }
        });
    }

    async translateMessage(messageId) {
        try {
            const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            const messageText = messageElement.querySelector('.message-text').textContent;
            
            // Check cache first
            if (this.translationCache.has(messageText)) {
                this.showTranslation(messageElement, this.translationCache.get(messageText));
                return;
            }

            // Show loading state
            this.showTranslationLoading(messageElement);

            // Simulate translation API call
            const translation = await this.performTranslation(messageText);
            
            // Cache the translation
            this.translationCache.set(messageText, translation);
            
            // Show translation
            this.showTranslation(messageElement, translation);

        } catch (error) {
            console.error('Translation failed:', error);
            this.app.showToast('Translation failed', 'error');
        }
    }

    async performTranslation(text) {
        // Simulate translation API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            translatedText: `[Translated] ${text}`,
            sourceLanguage: 'auto-detected',
            targetLanguage: 'English',
            confidence: 0.95
        };
    }

    showTranslationLoading(messageElement) {
        let translationContainer = messageElement.querySelector('.translation-container');
        if (!translationContainer) {
            translationContainer = document.createElement('div');
            translationContainer.className = 'translation-container';
            messageElement.querySelector('.message-content').appendChild(translationContainer);
        }

        translationContainer.innerHTML = `
            <div class="translation-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Translating...</span>
            </div>
        `;
    }

    showTranslation(messageElement, translation) {
        let translationContainer = messageElement.querySelector('.translation-container');
        if (!translationContainer) {
            translationContainer = document.createElement('div');
            translationContainer.className = 'translation-container';
            messageElement.querySelector('.message-content').appendChild(translationContainer);
        }

        translationContainer.innerHTML = `
            <div class="translation-result">
                <div class="translation-header">
                    <i class="fas fa-language"></i>
                    <span>Translated from ${translation.sourceLanguage} to ${translation.targetLanguage}</span>
                    <button class="hide-translation-btn" onclick="this.closest('.translation-container').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="translated-text">${translation.translatedText}</div>
                <div class="translation-confidence">
                    <span>Confidence: ${Math.round(translation.confidence * 100)}%</span>
                </div>
            </div>
        `;
    }

    setupLanguageDetection() {
        // Auto-detect language and show translate option
        document.addEventListener('DOMContentLoaded', () => {
            this.detectMessageLanguages();
        });
    }

    detectMessageLanguages() {
        // Simulate language detection for messages
        const messages = document.querySelectorAll('.message-text');
        messages.forEach(message => {
            // Add translate button if different language detected
            this.addTranslateButtonIfNeeded(message);
        });
    }

    addTranslateButtonIfNeeded(messageElement) {
        const messageActions = messageElement.closest('.message').querySelector('.message-actions');
        if (messageActions && !messageActions.querySelector('.translate-message-btn')) {
            const translateBtn = document.createElement('button');
            translateBtn.className = 'message-action-btn translate-message-btn';
            translateBtn.innerHTML = '<i class="fas fa-language"></i>';
            translateBtn.title = 'Translate message';
            messageActions.appendChild(translateBtn);
        }
    }

    // ========================================
    // 6. CONVERSATION ARCHIVE & EXPORT
    // ========================================

    initConversationArchiveExport() {
        this.setupArchiveInterface();
        this.setupExportOptions();
    }

    setupArchiveInterface() {
        // Add archive/export button to conversation settings
        document.addEventListener('click', (e) => {
            if (e.target.closest('.archive-conversation-btn')) {
                const conversationId = e.target.closest('[data-conversation-id]').dataset.conversationId;
                this.showArchiveExportModal(conversationId);
            }
        });
    }

    showArchiveExportModal(conversationId) {
        const modal = this.createArchiveExportModal(conversationId);
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    createArchiveExportModal(conversationId) {
        const modal = document.createElement('div');
        modal.id = 'archive-export-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Archive & Export Conversation</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="archive-export-options">
                        <div class="option-section">
                            <h4>Archive Options</h4>
                            <div class="archive-options">
                                <button class="archive-option-btn" onclick="messagesMissingUI.archiveConversation('${conversationId}')">
                                    <i class="fas fa-archive"></i>
                                    <div class="option-info">
                                        <h5>Archive Conversation</h5>
                                        <p>Hide from main list, keep all messages</p>
                                    </div>
                                </button>
                                <button class="archive-option-btn" onclick="messagesMissingUI.deleteConversation('${conversationId}')">
                                    <i class="fas fa-trash"></i>
                                    <div class="option-info">
                                        <h5>Delete Conversation</h5>
                                        <p>Permanently remove all messages</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div class="option-section">
                            <h4>Export Options</h4>
                            <div class="export-format-selection">
                                <label class="format-option">
                                    <input type="radio" name="export-format" value="json" checked>
                                    <span class="radio-checkmark"></span>
                                    <div class="format-info">
                                        <h5>JSON Format</h5>
                                        <p>Machine-readable format with all metadata</p>
                                    </div>
                                </label>
                                <label class="format-option">
                                    <input type="radio" name="export-format" value="txt">
                                    <span class="radio-checkmark"></span>
                                    <div class="format-info">
                                        <h5>Text Format</h5>
                                        <p>Plain text, easy to read</p>
                                    </div>
                                </label>
                                <label class="format-option">
                                    <input type="radio" name="export-format" value="pdf">
                                    <span class="radio-checkmark"></span>
                                    <div class="format-info">
                                        <h5>PDF Document</h5>
                                        <p>Formatted document with timestamps</p>
                                    </div>
                                </label>
                                <label class="format-option">
                                    <input type="radio" name="export-format" value="html">
                                    <span class="radio-checkmark"></span>
                                    <div class="format-info">
                                        <h5>HTML Format</h5>
                                        <p>Web page with full formatting</p>
                                    </div>
                                </label>
                            </div>

                            <div class="export-options">
                                <div class="option-group">
                                    <h5>Date Range</h5>
                                    <div class="date-range-selector">
                                        <label class="toggle-label">
                                            <input type="radio" name="date-range" value="all" checked>
                                            <span>All messages</span>
                                        </label>
                                        <label class="toggle-label">
                                            <input type="radio" name="date-range" value="custom">
                                            <span>Custom date range</span>
                                        </label>
                                        <div class="custom-date-inputs" style="display: none;">
                                            <input type="date" id="export-date-from" class="form-input">
                                            <span>to</span>
                                            <input type="date" id="export-date-to" class="form-input">
                                        </div>
                                    </div>
                                </div>

                                <div class="option-group">
                                    <h5>Include</h5>
                                    <div class="include-options">
                                        <label class="toggle-label">
                                            <input type="checkbox" checked>
                                            <span class="toggle-slider"></span>
                                            Text messages
                                        </label>
                                        <label class="toggle-label">
                                            <input type="checkbox" checked>
                                            <span class="toggle-slider"></span>
                                            Media files
                                        </label>
                                        <label class="toggle-label">
                                            <input type="checkbox" checked>
                                            <span class="toggle-slider"></span>
                                            Voice messages
                                        </label>
                                        <label class="toggle-label">
                                            <input type="checkbox" checked>
                                            <span class="toggle-slider"></span>
                                            Attachments
                                        </label>
                                        <label class="toggle-label">
                                            <input type="checkbox">
                                            <span class="toggle-slider"></span>
                                            Message metadata
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="export-preview">
                                <h5>Export Preview</h5>
                                <div class="preview-container">
                                    <div class="export-stats">
                                        <div class="stat-item">
                                            <span class="stat-label">Messages:</span>
                                            <span class="stat-value">1,247</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Media files:</span>
                                            <span class="stat-value">89</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Estimated size:</span>
                                            <span class="stat-value">45.2 MB</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-outline" onclick="messagesMissingUI.exportConversation('${conversationId}')">
                        <i class="fas fa-download"></i> Export Conversation
                    </button>
                </div>
            </div>
        `;

        this.setupArchiveExportEvents(modal);
        return modal;
    }

    setupArchiveExportEvents(modal) {
        // Handle date range selection
        const dateRangeInputs = modal.querySelectorAll('input[name="date-range"]');
        const customDateInputs = modal.querySelector('.custom-date-inputs');

        dateRangeInputs.forEach(input => {
            input.addEventListener('change', () => {
                if (input.value === 'custom' && input.checked) {
                    customDateInputs.style.display = 'flex';
                } else if (input.checked) {
                    customDateInputs.style.display = 'none';
                }
            });
        });

        // Update export preview when options change
        const exportOptions = modal.querySelectorAll('input[type="checkbox"], input[type="radio"]');
        exportOptions.forEach(option => {
            option.addEventListener('change', () => {
                this.updateExportPreview(modal);
            });
        });
    }

    updateExportPreview(modal) {
        // Update the export statistics based on selected options
        const includeOptions = {
            text: modal.querySelector('input[type="checkbox"]').checked,
            media: modal.querySelectorAll('input[type="checkbox"]')[1].checked,
            voice: modal.querySelectorAll('input[type="checkbox"]')[2].checked,
            attachments: modal.querySelectorAll('input[type="checkbox"]')[3].checked,
            metadata: modal.querySelectorAll('input[type="checkbox"]')[4].checked
        };

        // Simulate recalculating stats
        let messageCount = includeOptions.text ? 1247 : 0;
        let mediaCount = includeOptions.media ? 89 : 0;
        let estimatedSize = this.calculateEstimatedSize(includeOptions);

        // Update preview
        const statValues = modal.querySelectorAll('.stat-value');
        if (statValues[0]) statValues[0].textContent = messageCount;
        if (statValues[1]) statValues[1].textContent = mediaCount;
        if (statValues[2]) statValues[2].textContent = estimatedSize;
    }

    calculateEstimatedSize(includeOptions) {
        let size = 0;
        if (includeOptions.text) size += 5.2; // MB
        if (includeOptions.media) size += 35.8; // MB
        if (includeOptions.voice) size += 8.5; // MB
        if (includeOptions.attachments) size += 12.3; // MB
        if (includeOptions.metadata) size += 0.5; // MB
        
        return size.toFixed(1) + ' MB';
    }

    archiveConversation(conversationId) {
        // Archive the conversation
        this.conversationArchives.push({
            id: conversationId,
            archivedAt: new Date(),
            reason: 'user_archived'
        });

        // Hide from main conversation list
        const conversationElement = document.querySelector(`[data-conversation-id="${conversationId}"]`);
        if (conversationElement) {
            conversationElement.style.display = 'none';
        }

        this.app.showToast('Conversation archived successfully', 'success');
        
        // Close modal
        const modal = document.getElementById('archive-export-modal');
        if (modal) modal.remove();
    }

    deleteConversation(conversationId) {
        if (confirm('Are you sure you want to permanently delete this conversation? This action cannot be undone.')) {
            // Remove from DOM
            const conversationElement = document.querySelector(`[data-conversation-id="${conversationId}"]`);
            if (conversationElement) {
                conversationElement.remove();
            }

            this.app.showToast('Conversation deleted permanently', 'success');
            
            // Close modal
            const modal = document.getElementById('archive-export-modal');
            if (modal) modal.remove();
        }
    }

    exportConversation(conversationId) {
        // Get export settings from modal
        const modal = document.getElementById('archive-export-modal');
        const format = modal.querySelector('input[name="export-format"]:checked').value;
        const dateRange = modal.querySelector('input[name="date-range"]:checked').value;

        // Show export progress
        this.showExportProgress();

        // Simulate export process
        setTimeout(() => {
            this.completeExport(conversationId, format);
        }, 3000);
    }

    showExportProgress() {
        const progressModal = document.createElement('div');
        progressModal.id = 'export-progress-modal';
        progressModal.className = 'modal active';
        progressModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Exporting Conversation</h3>
                </div>
                <div class="modal-body">
                    <div class="export-progress">
                        <div class="progress-info">
                            <i class="fas fa-download"></i>
                            <h4>Preparing your export...</h4>
                            <p>This may take a few moments depending on the conversation size.</p>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="export-progress-fill"></div>
                        </div>
                        <div class="progress-text" id="export-progress-text">0%</div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(progressModal);
        this.animateExportProgress();
    }

    animateExportProgress() {
        let progress = 0;
        const progressFill = document.getElementById('export-progress-fill');
        const progressText = document.getElementById('export-progress-text');
        
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                progressText.textContent = 'Complete!';
                
                // Auto-close progress modal after completion
                setTimeout(() => {
                    const progressModal = document.getElementById('export-progress-modal');
                    if (progressModal) progressModal.remove();
                }, 1000);
            } else {
                progressFill.style.width = progress + '%';
                progressText.textContent = Math.round(progress) + '%';
            }
        }, 200);
    }

    completeExport(conversationId, format) {
        // Create download for the exported file
        const fileName = `conversation_export_${conversationId}.${format}`;
        const exportData = this.generateExportData(conversationId, format);
        
        // Create and trigger download
        const blob = new Blob([exportData], { type: this.getExportMimeType(format) });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.app.showToast('Conversation exported successfully', 'success');
        
        // Close archive modal
        const archiveModal = document.getElementById('archive-export-modal');
        if (archiveModal) archiveModal.remove();
    }

    generateExportData(conversationId, format) {
        const mockConversationData = {
            id: conversationId,
            participants: ['You', 'Emma Watson'],
            messages: [
                {
                    id: 'msg-1',
                    sender: 'Emma Watson',
                    content: 'Hey! How are you doing?',
                    timestamp: '2024-03-15T10:30:00Z',
                    type: 'text'
                },
                {
                    id: 'msg-2',
                    sender: 'You',
                    content: 'Hi Emma! I\'m doing great, thanks for asking.',
                    timestamp: '2024-03-15T10:31:00Z',
                    type: 'text'
                }
            ],
            exportedAt: new Date().toISOString()
        };

        switch (format) {
            case 'json':
                return JSON.stringify(mockConversationData, null, 2);
            case 'txt':
                return this.formatAsText(mockConversationData);
            case 'html':
                return this.formatAsHTML(mockConversationData);
            case 'pdf':
                return this.formatAsPDF(mockConversationData);
            default:
                return JSON.stringify(mockConversationData, null, 2);
        }
    }

    formatAsText(data) {
        let text = `Conversation Export\n`;
        text += `Participants: ${data.participants.join(', ')}\n`;
        text += `Exported: ${new Date(data.exportedAt).toLocaleString()}\n\n`;
        text += `Messages:\n${'='.repeat(50)}\n\n`;
        
        data.messages.forEach(message => {
            const time = new Date(message.timestamp).toLocaleString();
            text += `[${time}] ${message.sender}: ${message.content}\n\n`;
        });
        
        return text;
    }

    formatAsHTML(data) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Conversation Export</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
                    .message { margin-bottom: 15px; padding: 10px; border-left: 3px solid #007bff; }
                    .timestamp { color: #666; font-size: 0.9em; }
                    .sender { font-weight: bold; color: #333; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Conversation Export</h1>
                    <p><strong>Participants:</strong> ${data.participants.join(', ')}</p>
                    <p><strong>Exported:</strong> ${new Date(data.exportedAt).toLocaleString()}</p>
                </div>
                <div class="messages">
                    ${data.messages.map(message => `
                        <div class="message">
                            <div class="timestamp">${new Date(message.timestamp).toLocaleString()}</div>
                            <div class="sender">${message.sender}:</div>
                            <div class="content">${message.content}</div>
                        </div>
                    `).join('')}
                </div>
            </body>
            </html>
        `;
    }

    formatAsPDF(data) {
        // For PDF, return HTML that would be converted to PDF by the server
        return this.formatAsHTML(data);
    }

    getExportMimeType(format) {
        switch (format) {
            case 'json': return 'application/json';
            case 'txt': return 'text/plain';
            case 'html': return 'text/html';
            case 'pdf': return 'application/pdf';
            default: return 'application/json';
        }
    }

    setupExportOptions() {
        // Additional setup for export functionality
    }
}

// Export for global access
window.MessagesMissingUIComponents = MessagesMissingUIComponents;

// Initialize when DOM is ready and app is available
document.addEventListener('DOMContentLoaded', () => {
    if (window.connectHub) {
        window.messagesMissingUI = new MessagesMissingUIComponents(window.connectHub);
    }
});
