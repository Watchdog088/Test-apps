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

    // ========================================
    // 7. FILE/MEDIA UPLOAD IN CHAT
    // ========================================

    initFileMediaUploadInterface() {
        this.setupFileUploadButtons();
        this.setupDragAndDropUpload();
        this.setupMediaPreview();
        this.setupUploadProgress();
    }

    setupFileUploadButtons() {
        // Add file upload button to message composer
        document.addEventListener('DOMContentLoaded', () => {
            const messageComposer = document.querySelector('.message-input-container');
            if (messageComposer && !messageComposer.querySelector('.file-upload-controls')) {
                this.addFileUploadControls(messageComposer);
            }
        });
    }

    addFileUploadControls(messageComposer) {
        const uploadControls = document.createElement('div');
        uploadControls.className = 'file-upload-controls';
        uploadControls.innerHTML = `
            <div class="upload-buttons-container">
                <button class="upload-btn photo-upload-btn" title="Upload Photos">
                    <i class="fas fa-camera"></i>
                </button>
                <button class="upload-btn video-upload-btn" title="Upload Video">
                    <i class="fas fa-video"></i>
                </button>
                <button class="upload-btn document-upload-btn" title="Upload Document">
                    <i class="fas fa-file"></i>
                </button>
                <button class="upload-btn location-share-btn" title="Share Location">
                    <i class="fas fa-map-marker-alt"></i>
                </button>
                <button class="upload-btn contact-share-btn" title="Share Contact">
                    <i class="fas fa-user-plus"></i>
                </button>
            </div>
            <input type="file" id="file-upload-input" multiple accept="*/*" style="display: none;">
            <input type="file" id="photo-upload-input" multiple accept="image/*" style="display: none;">
            <input type="file" id="video-upload-input" multiple accept="video/*" style="display: none;">
            <input type="file" id="document-upload-input" multiple accept=".pdf,.doc,.docx,.txt,.xlsx" style="display: none;">
            
            <div class="upload-preview-container" id="upload-preview-container" style="display: none;">
                <div class="upload-preview-header">
                    <h4>Files to send</h4>
                    <button class="clear-uploads-btn" onclick="messagesMissingUI.clearFileUploads()">
                        <i class="fas fa-times"></i> Clear All
                    </button>
                </div>
                <div class="upload-preview-list" id="upload-preview-list"></div>
                <div class="upload-actions">
                    <button class="btn btn-primary send-files-btn" onclick="messagesMissingUI.sendFiles()">
                        <i class="fas fa-paper-plane"></i> Send Files
                    </button>
                </div>
            </div>
        `;

        // Insert before message input
        const messageInput = messageComposer.querySelector('.message-input');
        messageComposer.insertBefore(uploadControls, messageInput);

        this.setupFileUploadEvents();
    }

    setupFileUploadEvents() {
        // Photo upload
        document.addEventListener('click', (e) => {
            if (e.target.closest('.photo-upload-btn')) {
                document.getElementById('photo-upload-input').click();
            }
        });

        // Video upload
        document.addEventListener('click', (e) => {
            if (e.target.closest('.video-upload-btn')) {
                document.getElementById('video-upload-input').click();
            }
        });

        // Document upload
        document.addEventListener('click', (e) => {
            if (e.target.closest('.document-upload-btn')) {
                document.getElementById('document-upload-input').click();
            }
        });

        // Location sharing
        document.addEventListener('click', (e) => {
            if (e.target.closest('.location-share-btn')) {
                this.shareLocation();
            }
        });

        // Contact sharing
        document.addEventListener('click', (e) => {
            if (e.target.closest('.contact-share-btn')) {
                this.showContactShareModal();
            }
        });

        // File input handlers
        document.getElementById('photo-upload-input').addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files, 'photo');
        });

        document.getElementById('video-upload-input').addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files, 'video');
        });

        document.getElementById('document-upload-input').addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files, 'document');
        });
    }

    handleFileSelection(files, type) {
        const fileArray = Array.from(files);
        fileArray.forEach(file => {
            this.addFileToUploadPreview(file, type);
        });
        this.showUploadPreview();
    }

    addFileToUploadPreview(file, type) {
        const previewList = document.getElementById('upload-preview-list');
        const filePreview = document.createElement('div');
        filePreview.className = 'file-upload-preview';
        filePreview.innerHTML = `
            <div class="file-preview-item" data-file-name="${file.name}">
                <div class="file-thumbnail">
                    ${this.generateFileThumbnail(file, type)}
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                    <div class="upload-progress" style="display: none;">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                        <span class="progress-text">0%</span>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="remove-file-btn" onclick="this.closest('.file-preview-item').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        previewList.appendChild(filePreview);
    }

    generateFileThumbnail(file, type) {
        if (type === 'photo' && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            return `<img src="${url}" alt="${file.name}" class="image-thumbnail">`;
        } else if (type === 'video' && file.type.startsWith('video/')) {
            return `<i class="fas fa-play-circle video-thumbnail"></i>`;
        } else if (type === 'document') {
            const extension = file.name.split('.').pop().toLowerCase();
            const iconMap = {
                'pdf': 'fas fa-file-pdf',
                'doc': 'fas fa-file-word',
                'docx': 'fas fa-file-word',
                'xlsx': 'fas fa-file-excel',
                'txt': 'fas fa-file-alt'
            };
            return `<i class="${iconMap[extension] || 'fas fa-file'}"></i>`;
        }
        return `<i class="fas fa-file"></i>`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showUploadPreview() {
        const previewContainer = document.getElementById('upload-preview-container');
        if (previewContainer) {
            previewContainer.style.display = 'block';
        }
    }

    clearFileUploads() {
        const previewList = document.getElementById('upload-preview-list');
        const previewContainer = document.getElementById('upload-preview-container');
        if (previewList) previewList.innerHTML = '';
        if (previewContainer) previewContainer.style.display = 'none';
    }

    async sendFiles() {
        const fileItems = document.querySelectorAll('.file-preview-item');
        for (const item of fileItems) {
            await this.uploadFile(item);
        }
        this.clearFileUploads();
        this.app.showToast('Files sent successfully!', 'success');
    }

    async uploadFile(fileItem) {
        const fileName = fileItem.dataset.fileName;
        const progressContainer = fileItem.querySelector('.upload-progress');
        const progressFill = fileItem.querySelector('.progress-fill');
        const progressText = fileItem.querySelector('.progress-text');

        // Show progress
        progressContainer.style.display = 'block';

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += Math.random() * 20) {
            if (progress > 100) progress = 100;
            progressFill.style.width = progress + '%';
            progressText.textContent = Math.round(progress) + '%';
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Add uploaded file to conversation
        this.addFileMessageToConversation(fileName);
    }

    addFileMessageToConversation(fileName) {
        const messagesContainer = document.querySelector('.messages-list');
        if (messagesContainer) {
            const fileMessage = document.createElement('div');
            fileMessage.className = 'message own-message file-message';
            fileMessage.innerHTML = `
                <div class="message-content">
                    <div class="file-attachment">
                        <div class="file-icon">
                            <i class="fas fa-file"></i>
                        </div>
                        <div class="file-details">
                            <div class="file-name">${fileName}</div>
                            <div class="file-size">Uploaded</div>
                        </div>
                        <div class="file-actions">
                            <button class="download-file-btn">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            `;
            messagesContainer.appendChild(fileMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    shareLocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.addLocationMessageToConversation(latitude, longitude);
                },
                (error) => {
                    console.error('Location access denied:', error);
                    this.app.showToast('Location access denied', 'error');
                }
            );
        } else {
            this.app.showToast('Geolocation not supported', 'error');
        }
    }

    addLocationMessageToConversation(latitude, longitude) {
        const messagesContainer = document.querySelector('.messages-list');
        if (messagesContainer) {
            const locationMessage = document.createElement('div');
            locationMessage.className = 'message own-message location-message';
            locationMessage.innerHTML = `
                <div class="message-content">
                    <div class="location-share">
                        <div class="location-header">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>Location Shared</span>
                        </div>
                        <div class="location-map">
                            <img src="https://via.placeholder.com/300x150/007bff/white?text=Map+Preview" alt="Location Map" class="map-preview">
                        </div>
                        <div class="location-details">
                            <div class="coordinates">${latitude.toFixed(6)}, ${longitude.toFixed(6)}</div>
                            <button class="open-in-maps-btn">
                                <i class="fas fa-external-link-alt"></i> Open in Maps
                            </button>
                        </div>
                    </div>
                </div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            `;
            messagesContainer.appendChild(locationMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    showContactShareModal() {
        const modal = this.createContactShareModal();
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    createContactShareModal() {
        const modal = document.createElement('div');
        modal.id = 'contact-share-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Share Contact</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="contacts-list">
                        <div class="contact-search">
                            <input type="text" placeholder="Search contacts..." class="form-input">
                        </div>
                        <div class="contacts-grid">
                            <div class="contact-item" onclick="messagesMissingUI.shareContact('emma-watson')">
                                <div class="contact-avatar">EW</div>
                                <div class="contact-name">Emma Watson</div>
                            </div>
                            <div class="contact-item" onclick="messagesMissingUI.shareContact('alex-johnson')">
                                <div class="contact-avatar">AJ</div>
                                <div class="contact-name">Alex Johnson</div>
                            </div>
                            <div class="contact-item" onclick="messagesMissingUI.shareContact('sarah-chen')">
                                <div class="contact-avatar">SC</div>
                                <div class="contact-name">Sarah Chen</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    shareContact(contactId) {
        // Add contact share message
        const messagesContainer = document.querySelector('.messages-list');
        if (messagesContainer) {
            const contactMessage = document.createElement('div');
            contactMessage.className = 'message own-message contact-message';
            contactMessage.innerHTML = `
                <div class="message-content">
                    <div class="shared-contact">
                        <div class="contact-header">
                            <i class="fas fa-user"></i>
                            <span>Contact Shared</span>
                        </div>
                        <div class="contact-card">
                            <div class="contact-avatar">EW</div>
                            <div class="contact-info">
                                <div class="contact-name">Emma Watson</div>
                                <div class="contact-details">emma@example.com</div>
                            </div>
                            <button class="add-contact-btn">
                                <i class="fas fa-user-plus"></i> Add Contact
                            </button>
                        </div>
                    </div>
                </div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            `;
            messagesContainer.appendChild(contactMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Close modal
        document.getElementById('contact-share-modal').remove();
        this.app.showToast('Contact shared successfully', 'success');
    }

    setupDragAndDropUpload() {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                chatContainer.classList.add('drag-over');
            });

            chatContainer.addEventListener('dragleave', (e) => {
                e.preventDefault();
                chatContainer.classList.remove('drag-over');
            });

            chatContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                chatContainer.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileSelection(files, 'mixed');
                }
            });
        }
    }

    setupMediaPreview() {
        // Setup preview functionality for media files
    }

    setupUploadProgress() {
        // Setup upload progress tracking
    }

    // ========================================
    // 8. MESSAGE STATUS INDICATORS
    // ========================================

    initMessageStatusIndicators() {
        this.setupStatusIndicators();
        this.setupStatusUpdates();
        this.setupDeliveryTracking();
    }

    setupStatusIndicators() {
        // Add status indicators to all messages
        document.addEventListener('DOMContentLoaded', () => {
            this.addStatusIndicatorsToMessages();
        });
    }

    addStatusIndicatorsToMessages() {
        const messages = document.querySelectorAll('.message.own-message');
        messages.forEach(message => {
            if (!message.querySelector('.message-status')) {
                this.addStatusIndicator(message);
            }
        });
    }

    addStatusIndicator(messageElement) {
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'message-status';
        statusIndicator.innerHTML = this.getStatusIcon('sent');
        
        const messageTime = messageElement.querySelector('.message-time');
        if (messageTime) {
            messageTime.appendChild(statusIndicator);
        }

        // Simulate status progression
        this.simulateMessageStatusProgression(statusIndicator);
    }

    getStatusIcon(status) {
        const statusIcons = {
            'sending': `
                <div class="status-indicator sending" title="Sending...">
                    <i class="fas fa-clock"></i>
                </div>
            `,
            'sent': `
                <div class="status-indicator sent" title="Sent">
                    <i class="fas fa-check"></i>
                </div>
            `,
            'delivered': `
                <div class="status-indicator delivered" title="Delivered">
                    <i class="fas fa-check-double"></i>
                </div>
            `,
            'read': `
                <div class="status-indicator read" title="Read">
                    <i class="fas fa-check-double read-icon"></i>
                </div>
            `,
            'failed': `
                <div class="status-indicator failed" title="Failed to send">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
            `
        };
        return statusIcons[status] || statusIcons['sent'];
    }

    simulateMessageStatusProgression(statusElement) {
        // Simulate realistic message delivery progression
        setTimeout(() => {
            statusElement.innerHTML = this.getStatusIcon('sent');
        }, 500);

        setTimeout(() => {
            statusElement.innerHTML = this.getStatusIcon('delivered');
        }, 2000);

        // Randomly simulate read status
        if (Math.random() > 0.3) {
            setTimeout(() => {
                statusElement.innerHTML = this.getStatusIcon('read');
            }, 5000 + Math.random() * 10000);
        }
    }

    updateMessageStatus(messageId, status) {
        const message = document.querySelector(`[data-message-id="${messageId}"]`);
        if (message) {
            const statusElement = message.querySelector('.message-status');
            if (statusElement) {
                statusElement.innerHTML = this.getStatusIcon(status);
            }
        }
    }

    setupStatusUpdates() {
        // Listen for real-time status updates from server
        if (this.app.socket) {
            this.app.socket.on('messageStatusUpdate', (data) => {
                this.updateMessageStatus(data.messageId, data.status);
            });
        }
    }

    setupDeliveryTracking() {
        // Setup delivery receipt tracking
        document.addEventListener('click', (e) => {
            if (e.target.closest('.status-indicator')) {
                const messageElement = e.target.closest('.message');
                const messageId = messageElement.dataset.messageId;
                this.showDeliveryDetails(messageId);
            }
        });
    }

    showDeliveryDetails(messageId) {
        const modal = this.createDeliveryDetailsModal(messageId);
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    createDeliveryDetailsModal(messageId) {
        const modal = document.createElement('div');
        modal.id = 'delivery-details-modal';
        modal.className = 'modal small';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Message Details</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="delivery-timeline">
                        <div class="timeline-item completed">
                            <div class="timeline-icon">
                                <i class="fas fa-paper-plane"></i>
                            </div>
                            <div class="timeline-content">
                                <h4>Sent</h4>
                                <p>March 15, 2024 at 10:30 AM</p>
                            </div>
                        </div>
                        <div class="timeline-item completed">
                            <div class="timeline-icon">
                                <i class="fas fa-server"></i>
                            </div>
                            <div class="timeline-content">
                                <h4>Delivered to Server</h4>
                                <p>March 15, 2024 at 10:30 AM</p>
                            </div>
                        </div>
                        <div class="timeline-item completed">
                            <div class="timeline-icon">
                                <i class="fas fa-mobile-alt"></i>
                            </div>
                            <div class="timeline-content">
                                <h4>Delivered to Device</h4>
                                <p>March 15, 2024 at 10:31 AM</p>
                            </div>
                        </div>
                        <div class="timeline-item completed">
                            <div class="timeline-icon">
                                <i class="fas fa-eye"></i>
                            </div>
                            <div class="timeline-content">
                                <h4>Read</h4>
                                <p>March 15, 2024 at 10:32 AM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    // ========================================
    // 9. VOICE MESSAGE INTERFACE
    // ========================================

    initVoiceMessageInterface() {
        this.setupVoiceRecording();
        this.setupVoicePlayback();
        this.setupVoiceControls();
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
    }

    setupVoiceRecording() {
        // Add voice message button to message composer
        document.addEventListener('DOMContentLoaded', () => {
            const messageComposer = document.querySelector('.message-input-container');
            if (messageComposer && !messageComposer.querySelector('.voice-message-btn')) {
                this.addVoiceMessageButton(messageComposer);
            }
        });
    }

    addVoiceMessageButton(messageComposer) {
        const voiceButton = document.createElement('button');
        voiceButton.className = 'voice-message-btn';
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceButton.title = 'Record voice message';
        
        // Add to message input area
        const sendButton = messageComposer.querySelector('.send-message-btn');
        if (sendButton) {
            sendButton.parentNode.insertBefore(voiceButton, sendButton);
        }

        // Setup voice recording events
        voiceButton.addEventListener('mousedown', () => this.startVoiceRecording());
        voiceButton.addEventListener('mouseup', () => this.stopVoiceRecording());
        voiceButton.addEventListener('mouseleave', () => this.stopVoiceRecording());

        // Touch events for mobile
        voiceButton.addEventListener('touchstart', () => this.startVoiceRecording());
        voiceButton.addEventListener('touchend', () => this.stopVoiceRecording());
    }

    async startVoiceRecording() {
        if (this.isRecording) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.recordedChunks = [];

            this.mediaRecorder.addEventListener('dataavailable', (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            });

            this.mediaRecorder.addEventListener('stop', () => {
                this.handleVoiceRecordingComplete();
            });

            this.mediaRecorder.start();
            this.isRecording = true;
            this.showVoiceRecordingInterface();

        } catch (error) {
            console.error('Failed to start voice recording:', error);
            this.app.showToast('Microphone access denied', 'error');
        }
    }

    stopVoiceRecording() {
        if (!this.isRecording || !this.mediaRecorder) return;

        this.mediaRecorder.stop();
        this.isRecording = false;
        this.hideVoiceRecordingInterface();

        // Stop all tracks to release microphone
        if (this.mediaRecorder.stream) {
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    }

    showVoiceRecordingInterface() {
        const recordingInterface = document.createElement('div');
        recordingInterface.id = 'voice-recording-interface';
        recordingInterface.className = 'voice-recording-overlay';
        recordingInterface.innerHTML = `
            <div class="recording-container">
                <div class="recording-visual">
                    <div class="recording-pulse"></div>
                    <div class="recording-icon">
                        <i class="fas fa-microphone"></i>
                    </div>
                </div>
                <div class="recording-info">
                    <h3>Recording Voice Message</h3>
                    <div class="recording-timer" id="recording-timer">00:00</div>
                    <p>Hold to record, release to send</p>
                </div>
                <div class="recording-controls">
                    <button class="cancel-recording-btn" onclick="messagesMissingUI.cancelVoiceRecording()">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(recordingInterface);
        this.startRecordingTimer();
    }

    startRecordingTimer() {
        this.recordingStartTime = Date.now();
        this.recordingTimer = setInterval(() => {
            const elapsed = Date.now() - this.recordingStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            const timerElement = document.getElementById('recording-timer');
            if (timerElement) {
                timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    hideVoiceRecordingInterface() {
        const recordingInterface = document.getElementById('voice-recording-interface');
        if (recordingInterface) {
            recordingInterface.remove();
        }

        // Clear timer
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
        }
    }

    cancelVoiceRecording() {
        this.stopVoiceRecording();
        this.recordedChunks = [];
        this.hideVoiceRecordingInterface();
        this.app.showToast('Voice recording cancelled', 'info');
    }

    handleVoiceRecordingComplete() {
        if (this.recordedChunks.length === 0) {
            this.app.showToast('No audio recorded', 'warning');
            return;
        }

        // Create blob from recorded chunks
        const audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Add voice message to conversation
        this.addVoiceMessageToConversation(audioUrl, this.calculateRecordingDuration());
        
        // Reset recording state
        this.recordedChunks = [];
    }

    calculateRecordingDuration() {
        if (this.recordingStartTime) {
            return Math.floor((Date.now() - this.recordingStartTime) / 1000);
        }
        return 0;
    }

    addVoiceMessageToConversation(audioUrl, duration) {
        const messagesContainer = document.querySelector('.messages-list');
        if (messagesContainer) {
            const voiceMessage = document.createElement('div');
            voiceMessage.className = 'message own-message voice-message';
            voiceMessage.innerHTML = `
                <div class="message-content">
                    <div class="voice-message-player">
                        <button class="voice-play-btn" onclick="messagesMissingUI.toggleVoicePlayback('${audioUrl}', this)">
                            <i class="fas fa-play"></i>
                        </button>
                        <div class="voice-waveform">
                            <div class="waveform-bars">
                                ${this.generateWaveformBars()}
                            </div>
                            <div class="voice-duration">${this.formatDuration(duration)}</div>
                        </div>
                        <div class="voice-progress" style="width: 0%;"></div>
                    </div>
                    <audio preload="metadata" style="display: none;">
                        <source src="${audioUrl}" type="audio/webm">
                    </audio>
                </div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            `;
            messagesContainer.appendChild(voiceMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    generateWaveformBars() {
        // Generate random waveform bars for visual representation
        let bars = '';
        for (let i = 0; i < 40; i++) {
            const height = Math.random() * 30 + 5;
            bars += `<div class="waveform-bar" style="height: ${height}px;"></div>`;
        }
        return bars;
    }

    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    toggleVoicePlayback(audioUrl, playButton) {
        const audioElement = playButton.closest('.voice-message-player').querySelector('audio');
        const playIcon = playButton.querySelector('i');
        const progressBar = playButton.closest('.voice-message-player').querySelector('.voice-progress');

        if (audioElement.paused) {
            // Start playback
            audioElement.play();
            playIcon.className = 'fas fa-pause';
            
            // Update progress during playback
            this.trackVoiceProgress(audioElement, progressBar, playIcon);
        } else {
            // Pause playback
            audioElement.pause();
            playIcon.className = 'fas fa-play';
        }
    }

    trackVoiceProgress(audioElement, progressBar, playIcon) {
        const updateProgress = () => {
            const progress = (audioElement.currentTime / audioElement.duration) * 100;
            progressBar.style.width = progress + '%';

            if (audioElement.ended) {
                playIcon.className = 'fas fa-play';
                progressBar.style.width = '0%';
            }
        };

        audioElement.addEventListener('timeupdate', updateProgress);
        audioElement.addEventListener('ended', () => {
            playIcon.className = 'fas fa-play';
            progressBar.style.width = '0%';
        });
    }

    setupVoicePlayback() {
        // Additional voice playback setup
        document.addEventListener('click', (e) => {
            if (e.target.closest('.voice-speed-btn')) {
                this.showVoiceSpeedMenu(e.target.closest('.voice-message-player'));
            }
        });
    }

    setupVoiceControls() {
        // Setup additional voice control features
        this.setupVoiceToText();
        this.setupVoiceFilters();
    }

    setupVoiceToText() {
        // Add voice-to-text conversion feature
        document.addEventListener('click', (e) => {
            if (e.target.closest('.voice-to-text-btn')) {
                const voiceMessage = e.target.closest('.voice-message');
                this.convertVoiceToText(voiceMessage);
            }
        });
    }

    async convertVoiceToText(voiceMessage) {
        try {
            this.app.showToast('Converting voice to text...', 'info');
            
            // Simulate voice-to-text conversion
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const transcribedText = "Hey, just wanted to let you know that I'll be running a bit late for our meeting today.";
            
            // Add transcription to voice message
            const transcriptionContainer = document.createElement('div');
            transcriptionContainer.className = 'voice-transcription';
            transcriptionContainer.innerHTML = `
                <div class="transcription-header">
                    <i class="fas fa-closed-captioning"></i>
                    <span>Transcription</span>
                    <button class="hide-transcription-btn" onclick="this.closest('.voice-transcription').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="transcribed-text">${transcribedText}</div>
                <div class="transcription-confidence">
                    <span>Accuracy: 92%</span>
                </div>
            `;
            
            voiceMessage.querySelector('.message-content').appendChild(transcriptionContainer);
            this.app.showToast('Voice message transcribed', 'success');
            
        } catch (error) {
            console.error('Voice-to-text conversion failed:', error);
            this.app.showToast('Transcription failed', 'error');
        }
    }

    setupVoiceFilters() {
        // Setup voice message filtering and enhancement
    }

    // ========================================
    // 10. MESSAGE REACTIONS INTERFACE
    // ========================================

    initMessageReactionsInterface() {
        this.setupReactionButtons();
        this.setupReactionPicker();
        this.setupReactionDisplays();
        this.reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'];
    }

    setupReactionButtons() {
        // Add reaction functionality to all messages
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-reaction-btn')) {
                const messageElement = e.target.closest('.message');
                const messageId = messageElement.dataset.messageId;
                this.showReactionPicker(messageElement, messageId);
            }
        });

        // Add reaction buttons to message actions
        document.addEventListener('DOMContentLoaded', () => {
            this.addReactionButtonsToMessages();
        });
    }

    addReactionButtonsToMessages() {
        const messages = document.querySelectorAll('.message:not(.own-message)');
        messages.forEach(message => {
            if (!message.querySelector('.add-reaction-btn')) {
                this.addReactionButton(message);
            }
        });
    }

    addReactionButton(messageElement) {
        const messageActions = messageElement.querySelector('.message-actions');
        if (!messageActions) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'message-actions';
            messageElement.querySelector('.message-content').appendChild(actionsContainer);
        }

        const reactionBtn = document.createElement('button');
        reactionBtn.className = 'message-action-btn add-reaction-btn';
        reactionBtn.innerHTML = '<i class="far fa-smile"></i>';
        reactionBtn.title = 'Add reaction';
        
        const actionsContainer = messageElement.querySelector('.message-actions');
        actionsContainer.appendChild(reactionBtn);
    }

    showReactionPicker(messageElement, messageId) {
        // Remove any existing reaction picker
        const existingPicker = document.getElementById('reaction-picker');
        if (existingPicker) existingPicker.remove();

        const reactionPicker = this.createReactionPicker(messageElement, messageId);
        messageElement.appendChild(reactionPicker);
        
        // Position the picker
        this.positionReactionPicker(reactionPicker, messageElement);
    }

    createReactionPicker(messageElement, messageId) {
        const picker = document.createElement('div');
        picker.id = 'reaction-picker';
        picker.className = 'reaction-picker';
        picker.innerHTML = `
            <div class="reaction-picker-content">
                <div class="quick-reactions">
                    ${this.reactionEmojis.map(emoji => `
                        <button class="quick-reaction-btn" onclick="messagesMissingUI.addQuickReaction('${messageId}', '${emoji}')">
                            ${emoji}
                        </button>
                    `).join('')}
                </div>
                <div class="reaction-categories">
                    <button class="reaction-category-btn" data-category="smileys" title="Smileys & Emotion">
                        <i class="far fa-smile"></i>
                    </button>
                    <button class="reaction-category-btn" data-category="gestures" title="People & Body">
                        <i class="fas fa-hand-paper"></i>
                    </button>
                    <button class="reaction-category-btn" data-category="animals" title="Animals & Nature">
                        <i class="fas fa-paw"></i>
                    </button>
                    <button class="reaction-category-btn" data-category="objects" title="Objects">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="expanded-reactions" id="expanded-reactions" style="display: none;">
                    <div class="reactions-grid">
                        <!-- Reaction categories will be populated here -->
                    </div>
                </div>
                <div class="picker-footer">
                    <button class="close-picker-btn" onclick="messagesMissingUI.hideReactionPicker()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

        this.setupReactionPickerEvents(picker);
        return picker;
    }

    setupReactionPickerEvents(picker) {
        // Category button events
        picker.querySelectorAll('.reaction-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = btn.dataset.category;
                this.showReactionCategory(category);
            });
        });

        // Hide picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#reaction-picker')) {
                this.hideReactionPicker();
            }
        });
    }

    showReactionCategory(category) {
        const expandedReactions = document.getElementById('expanded-reactions');
        const reactionsGrid = expandedReactions.querySelector('.reactions-grid');
        
        const reactionCategories = {
            'smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉'],
            'gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇'],
            'animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
            'objects': ['❤️', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💖']
        };

        reactionsGrid.innerHTML = reactionCategories[category].map(emoji => `
            <button class="expanded-reaction-btn" onclick="messagesMissingUI.addQuickReaction('${this.currentMessageId}', '${emoji}')">
                ${emoji}
            </button>
        `).join('');

        expandedReactions.style.display = 'block';
    }

    positionReactionPicker(picker, messageElement) {
        const rect = messageElement.getBoundingClientRect();
        const chatContainer = document.querySelector('.chat-container');
        const chatRect = chatContainer.getBoundingClientRect();

        // Position above the message
        picker.style.position = 'absolute';
        picker.style.top = (rect.top - chatRect.top - picker.offsetHeight - 10) + 'px';
        picker.style.left = (rect.left - chatRect.left) + 'px';
        picker.style.zIndex = '1000';

        // Store current message ID for category reactions
        this.currentMessageId = messageElement.dataset.messageId;
    }

    addQuickReaction(messageId, emoji) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            // Add reaction to message
            this.addReactionToMessage(messageElement, emoji);
            
            // Hide reaction picker
            this.hideReactionPicker();
            
            // Show success feedback
            this.app.showToast(`Added ${emoji} reaction`, 'success');
        }
    }

    addReactionToMessage(messageElement, emoji) {
        let reactionsContainer = messageElement.querySelector('.message-reactions');
        if (!reactionsContainer) {
            reactionsContainer = document.createElement('div');
            reactionsContainer.className = 'message-reactions';
            messageElement.querySelector('.message-content').appendChild(reactionsContainer);
        }

        // Check if reaction already exists
        const existingReaction = reactionsContainer.querySelector(`[data-emoji="${emoji}"]`);
        if (existingReaction) {
            // Increment count
            const countElement = existingReaction.querySelector('.reaction-count');
            const currentCount = parseInt(countElement.textContent);
            countElement.textContent = currentCount + 1;
            
            // Add user to reaction
            existingReaction.classList.add('user-reacted');
        } else {
            // Create new reaction
            const reactionElement = document.createElement('div');
            reactionElement.className = 'message-reaction user-reacted';
            reactionElement.setAttribute('data-emoji', emoji);
            reactionElement.innerHTML = `
                <span class="reaction-emoji">${emoji}</span>
                <span class="reaction-count">1</span>
            `;
            
            // Add click handler to toggle reaction
            reactionElement.addEventListener('click', () => {
                this.toggleReaction(messageElement, emoji);
            });
            
            reactionsContainer.appendChild(reactionElement);
        }
    }

    toggleReaction(messageElement, emoji) {
        const reactionElement = messageElement.querySelector(`[data-emoji="${emoji}"]`);
        const countElement = reactionElement.querySelector('.reaction-count');
        const currentCount = parseInt(countElement.textContent);
        
        if (reactionElement.classList.contains('user-reacted')) {
            // Remove user's reaction
            if (currentCount === 1) {
                // Remove entire reaction if count reaches 0
                reactionElement.remove();
            } else {
                // Decrease count
                countElement.textContent = currentCount - 1;
                reactionElement.classList.remove('user-reacted');
            }
            this.app.showToast(`Removed ${emoji} reaction`, 'info');
        } else {
            // Add user's reaction
            countElement.textContent = currentCount + 1;
            reactionElement.classList.add('user-reacted');
            this.app.showToast(`Added ${emoji} reaction`, 'success');
        }
    }

    hideReactionPicker() {
        const picker = document.getElementById('reaction-picker');
        if (picker) {
            picker.remove();
        }
    }

    setupReactionPicker() {
        // Close picker on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideReactionPicker();
            }
        });
    }

    setupReactionDisplays() {
        // Setup reaction tooltips and interaction
        document.addEventListener('click', (e) => {
            if (e.target.closest('.message-reaction')) {
                const reaction = e.target.closest('.message-reaction');
                const messageElement = reaction.closest('.message');
                const emoji = reaction.dataset.emoji;
                this.toggleReaction(messageElement, emoji);
            }
        });

        // Show reaction details on hover
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.message-reaction')) {
                const reaction = e.target.closest('.message-reaction');
                this.showReactionTooltip(reaction);
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('.message-reaction')) {
                this.hideReactionTooltip();
            }
        });
    }

    showReactionTooltip(reactionElement) {
        const emoji = reactionElement.dataset.emoji;
        const count = reactionElement.querySelector('.reaction-count').textContent;
        
        const tooltip = document.createElement('div');
        tooltip.id = 'reaction-tooltip';
        tooltip.className = 'reaction-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <span class="tooltip-emoji">${emoji}</span>
                <div class="tooltip-users">
                    <div class="user-list">
                        <span class="user-name">You</span>
                        ${count > 1 ? `<span class="other-users">and ${count - 1} ${count == 2 ? 'other' : 'others'}</span>` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(tooltip);
        this.positionTooltip(tooltip, reactionElement);
    }

    positionTooltip(tooltip, reactionElement) {
        const rect = reactionElement.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
        tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.zIndex = '1001';
    }

    hideReactionTooltip() {
        const tooltip = document.getElementById('reaction-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // ========================================
    // 11. GROUP CHAT CREATION INTERFACE
    // ========================================

    initGroupChatCreationInterface() {
        this.setupGroupChatCreationButton();
        this.setupGroupCreationModal();
        this.setupContactSelection();
    }

    setupGroupChatCreationButton() {
        // Add create group button to conversations header
        document.addEventListener('DOMContentLoaded', () => {
            const conversationsHeader = document.querySelector('.conversations-header');
            if (conversationsHeader && !conversationsHeader.querySelector('.create-group-btn')) {
                this.addCreateGroupButton(conversationsHeader);
            }
        });

        // Handle create group button click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.create-group-btn')) {
                this.showGroupCreationModal();
            }
        });
    }

    addCreateGroupButton(conversationsHeader) {
        const createGroupBtn = document.createElement('button');
        createGroupBtn.className = 'create-group-btn';
        createGroupBtn.innerHTML = '<i class="fas fa-users"></i>';
        createGroupBtn.title = 'Create Group Chat';
        
        // Add to header actions
        let headerActions = conversationsHeader.querySelector('.header-actions');
        if (!headerActions) {
            headerActions = document.createElement('div');
            headerActions.className = 'header-actions';
            conversationsHeader.appendChild(headerActions);
        }
        
        headerActions.appendChild(createGroupBtn);
    }

    showGroupCreationModal() {
        const modal = this.createGroupCreationModal();
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    createGroupCreationModal() {
        const modal = document.createElement('div');
        modal.id = 'group-creation-modal';
        modal.className = 'modal large';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Create Group Chat</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="group-creation-steps">
                        <div class="step-indicators">
                            <div class="step-indicator active" data-step="1">
                                <span class="step-number">1</span>
                                <span class="step-label">Group Info</span>
                            </div>
                            <div class="step-indicator" data-step="2">
                                <span class="step-number">2</span>
                                <span class="step-label">Add Members</span>
                            </div>
                            <div class="step-indicator" data-step="3">
                                <span class="step-number">3</span>
                                <span class="step-label">Settings</span>
                            </div>
                        </div>

                        <!-- Step 1: Group Info -->
                        <div class="creation-step active" data-step="1">
                            <div class="step-content">
                                <div class="group-info-section">
                                    <div class="group-avatar-upload">
                                        <div class="avatar-preview" id="group-avatar-preview">
                                            <i class="fas fa-camera"></i>
                                            <span>Add Group Photo</span>
                                        </div>
                                        <input type="file" id="group-avatar-input" accept="image/*" style="display: none;">
                                        <button class="upload-avatar-btn" onclick="document.getElementById('group-avatar-input').click()">
                                            Choose Photo
                                        </button>
                                    </div>
                                    
                                    <div class="group-basic-info">
                                        <div class="form-group">
                                            <label for="group-name-input">Group Name *</label>
                                            <input type="text" id="group-name-input" class="form-input" placeholder="Enter group name..." maxlength="50">
                                            <small class="char-count">0/50</small>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="group-description">Description (Optional)</label>
                                            <textarea id="group-description" class="form-input" rows="3" placeholder="What's this group about?" maxlength="200"></textarea>
                                            <small class="char-count">0/200</small>
                                        </div>

                                        <div class="group-type-selection">
                                            <label>Group Type</label>
                                            <div class="type-options">
                                                <label class="type-option">
                                                    <input type="radio" name="group-type" value="private" checked>
                                                    <div class="option-card">
                                                        <i class="fas fa-lock"></i>
                                                        <h4>Private</h4>
                                                        <p>Only invited members can join</p>
                                                    </div>
                                                </label>
                                                <label class="type-option">
                                                    <input type="radio" name="group-type" value="public">
                                                    <div class="option-card">
                                                        <i class="fas fa-globe"></i>
                                                        <h4>Public</h4>
                                                        <p>Anyone can discover and join</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 2: Add Members -->
                        <div class="creation-step" data-step="2">
                            <div class="step-content">
                                <div class="member-selection-section">
                                    <div class="search-contacts">
                                        <div class="search-input-container">
                                            <i class="fas fa-search"></i>
                                            <input type="text" id="member-search" placeholder="Search contacts..." class="form-input">
                                        </div>
                                    </div>

                                    <div class="selected-members">
                                        <h4>Selected Members (<span id="selected-count">0</span>)</h4>
                                        <div class="selected-members-list" id="selected-members-list">
                                            <!-- Selected members will appear here -->
                                        </div>
                                    </div>

                                    <div class="contacts-to-add">
                                        <h4>Your Contacts</h4>
                                        <div class="contacts-list" id="contacts-list">
                                            ${this.renderContactsList()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 3: Group Settings -->
                        <div class="creation-step" data-step="3">
                            <div class="step-content">
                                <div class="group-settings-section">
                                    <h4>Group Settings</h4>
                                    
                                    <div class="settings-grid">
                                        <div class="setting-item">
                                            <div class="setting-info">
                                                <h5>Message Approval</h5>
                                                <p>Require admin approval for new messages</p>
                                            </div>
                                            <label class="toggle-switch">
                                                <input type="checkbox" id="message-approval">
                                                <span class="toggle-slider"></span>
                                            </label>
                                        </div>

                                        <div class="setting-item">
                                            <div class="setting-info">
                                                <h5>Media Sharing</h5>
                                                <p>Allow members to share photos and videos</p>
                                            </div>
                                            <label class="toggle-switch">
                                                <input type="checkbox" id="media-sharing" checked>
                                                <span class="toggle-slider"></span>
                                            </label>
                                        </div>

                                        <div class="setting-item">
                                            <div class="setting-info">
                                                <h5>Add Members</h5>
                                                <p>Allow members to add other people</p>
                                            </div>
                                            <label class="toggle-switch">
                                                <input type="checkbox" id="add-members">
                                                <span class="toggle-slider"></span>
                                            </label>
                                        </div>

                                        <div class="setting-item">
                                            <div class="setting-info">
                                                <h5>Group Info Edit</h5>
                                                <p>Allow members to edit group name and photo</p>
                                            </div>
                                            <label class="toggle-switch">
                                                <input type="checkbox" id="edit-group-info">
                                                <span class="toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>

                                    <div class="admin-selection">
                                        <h4>Group Administrators</h4>
                                        <p>Select who can manage this group</p>
                                        <div class="admin-candidates" id="admin-candidates">
                                            <!-- Will be populated with selected members -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="step-navigation">
                        <button class="btn btn-secondary" id="prev-step-btn" style="display: none;" onclick="messagesMissingUI.previousCreationStep()">
                            <i class="fas fa-arrow-left"></i> Previous
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button class="btn btn-primary" id="next-step-btn" onclick="messagesMissingUI.nextCreationStep()">
                            Next <i class="fas fa-arrow-right"></i>
                        </button>
                        <button class="btn btn-primary" id="create-group-btn" style="display: none;" onclick="messagesMissingUI.createGroupChat()">
                            <i class="fas fa-users"></i> Create Group
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupGroupCreationEvents(modal);
        this.currentCreationStep = 1;
        this.selectedMembers = [];
        return modal;
    }

    renderContactsList() {
        const contacts = [
            { id: 'emma-watson', name: 'Emma Watson', avatar: 'EW', online: true },
            { id: 'alex-johnson', name: 'Alex Johnson', avatar: 'AJ', online: false },
            { id: 'sarah-chen', name: 'Sarah Chen', avatar: 'SC', online: true },
            { id: 'mike-torres', name: 'Mike Torres', avatar: 'MT', online: true },
            { id: 'lisa-kim', name: 'Lisa Kim', avatar: 'LK', online: false },
            { id: 'david-brown', name: 'David Brown', avatar: 'DB', online: true }
        ];

        return contacts.map(contact => `
            <div class="contact-item" data-contact-id="${contact.id}">
                <div class="contact-checkbox">
                    <input type="checkbox" id="contact-${contact.id}" onchange="messagesMissingUI.toggleMemberSelection('${contact.id}', this.checked)">
                </div>
                <div class="contact-avatar ${contact.online ? 'online' : ''}">
                    ${contact.avatar}
                    ${contact.online ? '<div class="online-indicator"></div>' : ''}
                </div>
                <div class="contact-info">
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-status">${contact.online ? 'Online' : 'Last seen 2h ago'}</div>
                </div>
            </div>
        `).join('');
    }

    setupGroupCreationEvents(modal) {
        // Character counting for inputs
        const groupNameInput = modal.querySelector('#group-name-input');
        const groupDescription = modal.querySelector('#group-description');
        
        groupNameInput.addEventListener('input', (e) => {
            const charCount = e.target.value.length;
            e.target.parentNode.querySelector('.char-count').textContent = `${charCount}/50`;
        });

        groupDescription.addEventListener('input', (e) => {
            const charCount = e.target.value.length;
            e.target.parentNode.querySelector('.char-count').textContent = `${charCount}/200`;
        });

        // Group avatar upload
        modal.querySelector('#group-avatar-input').addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.handleGroupAvatarUpload(e.target.files[0]);
            }
        });

        // Member search
        modal.querySelector('#member-search').addEventListener('input', (e) => {
            this.filterContactsList(e.target.value);
        });
    }

    handleGroupAvatarUpload(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('group-avatar-preview');
                preview.innerHTML = `<img src="${e.target.result}" alt="Group Avatar" class="avatar-image">`;
            };
            reader.readAsDataURL(file);
        }
    }

    toggleMemberSelection(contactId, isSelected) {
        if (isSelected) {
            this.addMemberToSelection(contactId);
        } else {
            this.removeMemberFromSelection(contactId);
        }
        this.updateSelectedMembersDisplay();
        this.updateAdminCandidates();
    }

    addMemberToSelection(contactId) {
        if (!this.selectedMembers.includes(contactId)) {
            this.selectedMembers.push(contactId);
        }
    }

    removeMemberFromSelection(contactId) {
        this.selectedMembers = this.selectedMembers.filter(id => id !== contactId);
    }

    updateSelectedMembersDisplay() {
        const selectedList = document.getElementById('selected-members-list');
        const selectedCount = document.getElementById('selected-count');
        
        selectedCount.textContent = this.selectedMembers.length;

        if (this.selectedMembers.length === 0) {
            selectedList.innerHTML = '<p class="no-members">No members selected yet</p>';
            return;
        }

        selectedList.innerHTML = this.selectedMembers.map(contactId => {
            const contact = this.getContactById(contactId);
            return `
                <div class="selected-member" data-contact-id="${contactId}">
                    <div class="member-avatar">${contact.avatar}</div>
                    <div class="member-name">${contact.name}</div>
                    <button class="remove-member-btn" onclick="messagesMissingUI.removeMemberFromSelection('${contactId}'); messagesMissingUI.updateSelectedMembersDisplay(); document.getElementById('contact-${contactId}').checked = false;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');
    }

    updateAdminCandidates() {
        const adminCandidates = document.getElementById('admin-candidates');
        if (!adminCandidates) return;

        if (this.selectedMembers.length === 0) {
            adminCandidates.innerHTML = '<p class="no-candidates">Add members first to select administrators</p>';
            return;
        }

        adminCandidates.innerHTML = this.selectedMembers.map(contactId => {
            const contact = this.getContactById(contactId);
            return `
                <label class="admin-candidate">
                    <input type="checkbox" name="group-admin" value="${contactId}">
                    <div class="candidate-info">
                        <div class="candidate-avatar">${contact.avatar}</div>
                        <div class="candidate-name">${contact.name}</div>
                    </div>
                </label>
            `;
        }).join('');
    }

    getContactById(contactId) {
        const contacts = {
            'emma-watson': { name: 'Emma Watson', avatar: 'EW' },
            'alex-johnson': { name: 'Alex Johnson', avatar: 'AJ' },
            'sarah-chen': { name: 'Sarah Chen', avatar: 'SC' },
            'mike-torres': { name: 'Mike Torres', avatar: 'MT' },
            'lisa-kim': { name: 'Lisa Kim', avatar: 'LK' },
            'david-brown': { name: 'David Brown', avatar: 'DB' }
        };
        return contacts[contactId] || { name: 'Unknown', avatar: '?' };
    }

    filterContactsList(searchTerm) {
        const contactItems = document.querySelectorAll('#contacts-list .contact-item');
        const term = searchTerm.toLowerCase();

        contactItems.forEach(item => {
            const name = item.querySelector('.contact-name').textContent.toLowerCase();
            if (name.includes(term) || term === '') {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    nextCreationStep() {
        const currentStep = this.currentCreationStep;
        
        // Validate current step
        if (!this.validateCreationStep(currentStep)) {
            return;
        }

        if (currentStep < 3) {
            this.currentCreationStep++;
            this.showCreationStep(this.currentCreationStep);
        }
    }

    previousCreationStep() {
        if (this.currentCreationStep > 1) {
            this.currentCreationStep--;
            this.showCreationStep(this.currentCreationStep);
        }
    }

    validateCreationStep(step) {
        switch (step) {
            case 1:
                const groupName = document.getElementById('group-name-input').value.trim();
                if (!groupName) {
                    this.app.showToast('Please enter a group name', 'warning');
                    return false;
                }
                break;
            case 2:
                if (this.selectedMembers.length === 0) {
                    this.app.showToast('Please select at least one member', 'warning');
                    return false;
                }
                break;
            case 3:
                // Final validation
                break;
        }
        return true;
    }

    showCreationStep(stepNumber) {
        // Update step indicators
        const indicators = document.querySelectorAll('.step-indicator');
        const steps = document.querySelectorAll('.creation-step');
        
        indicators.forEach((indicator, index) => {
            if (index + 1 <= stepNumber) {
                indicator.classList.add('active');
                if (index + 1 < stepNumber) {
                    indicator.classList.add('completed');
                }
            } else {
                indicator.classList.remove('active', 'completed');
            }
        });

        // Show current step content
        steps.forEach((step, index) => {
            if (index + 1 === stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update navigation buttons
        const prevBtn = document.getElementById('prev-step-btn');
        const nextBtn = document.getElementById('next-step-btn');
        const createBtn = document.getElementById('create-group-btn');

        prevBtn.style.display = stepNumber > 1 ? 'block' : 'none';
        
        if (stepNumber === 3) {
            nextBtn.style.display = 'none';
            createBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            createBtn.style.display = 'none';
        }
    }

    async createGroupChat() {
        try {
            // Collect all group data
            const groupData = this.collectGroupData();
            
            // Validate final data
            if (!this.validateGroupData(groupData)) {
                return;
            }

            // Show creating progress
            this.showGroupCreationProgress();

            // Simulate group creation API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create group in UI
            this.addGroupToConversationsList(groupData);

            // Close modals
            document.getElementById('group-creation-progress').remove();
            document.getElementById('group-creation-modal').remove();

            this.app.showToast('Group created successfully!', 'success');

        } catch (error) {
            console.error('Group creation failed:', error);
            this.app.showToast('Failed to create group', 'error');
        }
    }

    collectGroupData() {
        const modal = document.getElementById('group-creation-modal');
        return {
            name: modal.querySelector('#group-name-input').value.trim(),
            description: modal.querySelector('#group-description').value.trim(),
            type: modal.querySelector('input[name="group-type"]:checked').value,
            members: this.selectedMembers,
            admins: Array.from(modal.querySelectorAll('input[name="group-admin"]:checked')).map(input => input.value),
            settings: {
                messageApproval: modal.querySelector('#message-approval').checked,
                mediaSharing: modal.querySelector('#media-sharing').checked,
                addMembers: modal.querySelector('#add-members').checked,
                editGroupInfo: modal.querySelector('#edit-group-info').checked
            }
        };
    }

    validateGroupData(groupData) {
        if (!groupData.name) {
            this.app.showToast('Group name is required', 'warning');
            return false;
        }
        if (groupData.members.length === 0) {
            this.app.showToast('At least one member is required', 'warning');
            return false;
        }
        return true;
    }

    showGroupCreationProgress() {
        const progressModal = document.createElement('div');
        progressModal.id = 'group-creation-progress';
        progressModal.className = 'modal active';
        progressModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Creating Group</h3>
                </div>
                <div class="modal-body">
                    <div class="creation-progress">
                        <div class="progress-animation">
                            <i class="fas fa-users fa-spin"></i>
                        </div>
                        <h4>Setting up your group...</h4>
                        <p>Adding members and configuring settings</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(progressModal);
    }

    addGroupToConversationsList(groupData) {
        const conversationsList = document.querySelector('.conversations-list');
        if (conversationsList) {
            const groupConversation = document.createElement('div');
            groupConversation.className = 'conversation-item group-conversation';
            groupConversation.setAttribute('data-conversation-id', `group-${Date.now()}`);
            groupConversation.innerHTML = `
                <div class="conversation-avatar group-avatar">
                    <i class="fas fa-users"></i>
                </div>
                <div class="conversation-info">
                    <div class="conversation-name">${groupData.name}</div>
                    <div class="conversation-preview">
                        <span class="member-count">${groupData.members.length + 1} members</span>
                        <span class="group-type ${groupData.type}">${groupData.type}</span>
                    </div>
                </div>
                <div class="conversation-meta">
                    <div class="conversation-time">Just created</div>
                </div>
            `;
            
            // Insert at top of conversations list
            conversationsList.insertBefore(groupConversation, conversationsList.firstChild);
        }
    }

    setupGroupCreationModal() {
        // Additional modal setup
    }

    setupContactSelection() {
        // Additional contact selection setup
    }

    // Update the init method to include all new interfaces
    init() {
        this.initMessageSearchInterface();
        this.initGroupChatManagementPanel();
        this.initMessageSchedulingInterface();
        this.initAdvancedFilePreviewSystem();
        this.initMessageTranslationInterface();
        this.initConversationArchiveExport();
        this.initFileMediaUploadInterface();
        this.initMessageStatusIndicators();
        this.initVoiceMessageInterface();
        this.initMessageReactionsInterface();
        this.initGroupChatCreationInterface();
        
        console.log('All 11 Messages Missing UI Components initialized');
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
