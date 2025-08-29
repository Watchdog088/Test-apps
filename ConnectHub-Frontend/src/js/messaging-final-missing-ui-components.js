/**
 * ConnectHub - 4 Missing Messaging & Communication UI Components
 * Final missing messaging interfaces for complete messaging functionality
 */

class MessagingFinalMissingUIComponents {
    constructor(app) {
        this.app = app;
        this.messageThreads = new Map();
        this.editingMessage = null;
        this.forwardingMessages = [];
        this.chatCustomizations = {};
        
        this.init();
    }

    /**
     * Initialize the 4 missing Messaging UI components
     */
    init() {
        this.initMessageThreadingSystem();
        this.initMessageEditingInterface();
        this.initMessageForwardingInterface();
        this.initChatCustomizationInterface();
        
        console.log('4 Final Missing Messaging UI Components initialized');
    }

    // ========================================
    // 1. MESSAGE THREADING SYSTEM
    // ========================================

    initMessageThreadingSystem() {
        this.setupThreadCreation();
        this.setupThreadDisplay();
        this.setupThreadNavigation();
        this.setupThreadManagement();
    }

    setupThreadCreation() {
        // Add "Start Thread" option to message actions
        document.addEventListener('DOMContentLoaded', () => {
            this.addThreadButtonsToMessages();
        });

        // Handle thread creation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.start-thread-btn')) {
                const messageElement = e.target.closest('.message');
                const messageId = messageElement.dataset.messageId;
                this.startMessageThread(messageId);
            }
        });
    }

    addThreadButtonsToMessages() {
        const messages = document.querySelectorAll('.message:not(.own-message)');
        messages.forEach(message => {
            if (!message.querySelector('.start-thread-btn')) {
                this.addThreadButton(message);
            }
        });
    }

    addThreadButton(messageElement) {
        let messageActions = messageElement.querySelector('.message-actions');
        if (!messageActions) {
            messageActions = document.createElement('div');
            messageActions.className = 'message-actions';
            messageElement.querySelector('.message-content').appendChild(messageActions);
        }

        const threadBtn = document.createElement('button');
        threadBtn.className = 'message-action-btn start-thread-btn';
        threadBtn.innerHTML = '<i class="fas fa-comments"></i>';
        threadBtn.title = 'Start thread';
        
        messageActions.appendChild(threadBtn);
    }

    startMessageThread(parentMessageId) {
        const parentMessage = document.querySelector(`[data-message-id="${parentMessageId}"]`);
        if (!parentMessage) return;

        // Show thread creation modal
        const modal = this.createThreadModal(parentMessageId);
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    createThreadModal(parentMessageId) {
        const modal = document.createElement('div');
        modal.id = 'thread-modal';
        modal.className = 'modal thread-modal large';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="thread-header">
                        <div class="thread-title">
                            <i class="fas fa-comments"></i>
                            <h3>Thread Reply</h3>
                        </div>
                        <div class="thread-participants">
                            <div class="participants-avatars">
                                <div class="participant-avatar">EW</div>
                                <div class="participant-avatar">YU</div>
                            </div>
                            <span class="participants-count">2 participants</span>
                        </div>
                    </div>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="thread-container">
                        <div class="parent-message-reference">
                            <div class="reference-header">
                                <i class="fas fa-reply"></i>
                                <span>Replying to</span>
                            </div>
                            <div class="referenced-message">
                                ${this.getMessageContent(parentMessageId)}
                            </div>
                        </div>
                        
                        <div class="thread-messages" id="thread-messages-${parentMessageId}">
                            <div class="thread-messages-list">
                                ${this.renderThreadMessages(parentMessageId)}
                            </div>
                        </div>

                        <div class="thread-input-container">
                            <div class="thread-input-wrapper">
                                <div class="thread-composer">
                                    <textarea class="thread-input" placeholder="Reply to this thread..." rows="3"></textarea>
                                    <div class="thread-input-actions">
                                        <button class="thread-action-btn emoji-btn" title="Add emoji">
                                            <i class="far fa-smile"></i>
                                        </button>
                                        <button class="thread-action-btn attachment-btn" title="Add attachment">
                                            <i class="fas fa-paperclip"></i>
                                        </button>
                                        <button class="thread-action-btn mention-btn" title="Mention someone">
                                            <i class="fas fa-at"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="thread-send-section">
                                    <div class="thread-options">
                                        <label class="thread-option">
                                            <input type="checkbox" id="notify-thread" checked>
                                            <span>Notify participants</span>
                                        </label>
                                        <label class="thread-option">
                                            <input type="checkbox" id="also-send-channel">
                                            <span>Also send to main chat</span>
                                        </label>
                                    </div>
                                    <button class="send-thread-reply-btn" onclick="messagingFinalMissing.sendThreadReply('${parentMessageId}')">
                                        <i class="fas fa-paper-plane"></i>
                                        Send Reply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="thread-footer-info">
                        <div class="thread-stats">
                            <span class="thread-replies-count">3 replies</span>
                            <span class="thread-participants-count">2 participants</span>
                            <span class="thread-last-activity">Last reply 5 minutes ago</span>
                        </div>
                        <div class="thread-actions">
                            <button class="btn btn-outline thread-settings-btn" onclick="messagingFinalMissing.showThreadSettings('${parentMessageId}')">
                                <i class="fas fa-cog"></i> Settings
                            </button>
                            <button class="btn btn-outline" onclick="messagingFinalMissing.shareThread('${parentMessageId}')">
                                <i class="fas fa-share"></i> Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupThreadModalEvents(modal, parentMessageId);
        return modal;
    }

    getMessageContent(messageId) {
        const message = document.querySelector(`[data-message-id="${messageId}"]`);
        if (message) {
            const messageText = message.querySelector('.message-text');
            const senderName = message.querySelector('.message-sender')?.textContent || 'Emma Watson';
            return `
                <div class="referenced-message-header">
                    <div class="sender-info">
                        <div class="sender-avatar">EW</div>
                        <span class="sender-name">${senderName}</span>
                    </div>
                    <div class="message-time">2:30 PM</div>
                </div>
                <div class="referenced-message-content">
                    ${messageText ? messageText.innerHTML : 'Hey everyone! Just wanted to share this amazing article I found about the latest tech trends.'}
                </div>
            `;
        }
        return '<div class="message-not-found">Original message not found</div>';
    }

    renderThreadMessages(parentMessageId) {
        // Get existing thread messages or create mock data
        const threadMessages = this.messageThreads.get(parentMessageId) || [
            {
                id: 'thread-msg-1',
                sender: 'Alex Johnson',
                avatar: 'AJ',
                content: 'Thanks for sharing! This is really interesting.',
                timestamp: new Date(Date.now() - 15 * 60 * 1000),
                isOwn: false
            },
            {
                id: 'thread-msg-2',
                sender: 'You',
                avatar: 'YU',
                content: 'I thought you might find it useful for the project we\'re working on.',
                timestamp: new Date(Date.now() - 10 * 60 * 1000),
                isOwn: true
            },
            {
                id: 'thread-msg-3',
                sender: 'Alex Johnson',
                avatar: 'AJ',
                content: 'Absolutely! The part about AI integration is particularly relevant.',
                timestamp: new Date(Date.now() - 5 * 60 * 1000),
                isOwn: false
            }
        ];

        return threadMessages.map(msg => `
            <div class="thread-message ${msg.isOwn ? 'own-message' : ''}" data-thread-message-id="${msg.id}">
                <div class="thread-message-avatar">
                    <div class="avatar">${msg.avatar}</div>
                </div>
                <div class="thread-message-content">
                    <div class="thread-message-header">
                        <span class="thread-sender-name">${msg.sender}</span>
                        <span class="thread-message-time">${this.formatThreadTime(msg.timestamp)}</span>
                    </div>
                    <div class="thread-message-text">${msg.content}</div>
                    <div class="thread-message-actions">
                        <button class="thread-msg-action-btn react-btn" title="Add reaction">
                            <i class="far fa-smile"></i>
                        </button>
                        <button class="thread-msg-action-btn reply-btn" title="Reply">
                            <i class="fas fa-reply"></i>
                        </button>
                        ${msg.isOwn ? '<button class="thread-msg-action-btn edit-btn" title="Edit"><i class="fas fa-edit"></i></button>' : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    formatThreadTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        return timestamp.toLocaleDateString();
    }

    setupThreadModalEvents(modal, parentMessageId) {
        // Auto-resize textarea
        const threadInput = modal.querySelector('.thread-input');
        threadInput.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
        });

        // Send on Ctrl+Enter
        threadInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.sendThreadReply(parentMessageId);
            }
        });

        // Handle emoji picker
        modal.querySelector('.emoji-btn').addEventListener('click', () => {
            this.showThreadEmojiPicker(threadInput);
        });

        // Handle mentions
        modal.querySelector('.mention-btn').addEventListener('click', () => {
            this.showThreadMentionPicker(threadInput);
        });
    }

    sendThreadReply(parentMessageId) {
        const modal = document.getElementById('thread-modal');
        const threadInput = modal.querySelector('.thread-input');
        const content = threadInput.value.trim();

        if (!content) {
            this.app.showToast('Please enter a message', 'warning');
            return;
        }

        // Create new thread message
        const newMessage = {
            id: `thread-msg-${Date.now()}`,
            sender: 'You',
            avatar: 'YU',
            content: content,
            timestamp: new Date(),
            isOwn: true
        };

        // Add to thread
        if (!this.messageThreads.has(parentMessageId)) {
            this.messageThreads.set(parentMessageId, []);
        }
        this.messageThreads.get(parentMessageId).push(newMessage);

        // Update thread display
        this.updateThreadDisplay(parentMessageId);

        // Clear input
        threadInput.value = '';
        threadInput.style.height = 'auto';

        // Add thread indicator to original message
        this.addThreadIndicator(parentMessageId);

        this.app.showToast('Reply sent to thread', 'success');
    }

    updateThreadDisplay(parentMessageId) {
        const threadContainer = document.querySelector(`#thread-messages-${parentMessageId} .thread-messages-list`);
        if (threadContainer) {
            threadContainer.innerHTML = this.renderThreadMessages(parentMessageId);
            
            // Scroll to bottom
            threadContainer.scrollTop = threadContainer.scrollHeight;
            
            // Update stats
            this.updateThreadStats(parentMessageId);
        }
    }

    updateThreadStats(parentMessageId) {
        const modal = document.getElementById('thread-modal');
        const threadMessages = this.messageThreads.get(parentMessageId) || [];
        
        const repliesCount = modal.querySelector('.thread-replies-count');
        const lastActivity = modal.querySelector('.thread-last-activity');
        
        if (repliesCount) {
            repliesCount.textContent = `${threadMessages.length} replies`;
        }
        
        if (lastActivity) {
            lastActivity.textContent = 'Just now';
        }
    }

    addThreadIndicator(parentMessageId) {
        const parentMessage = document.querySelector(`[data-message-id="${parentMessageId}"]`);
        if (parentMessage && !parentMessage.querySelector('.thread-indicator')) {
            const threadIndicator = document.createElement('div');
            threadIndicator.className = 'thread-indicator';
            threadIndicator.innerHTML = `
                <button class="view-thread-btn" onclick="messagingFinalMissing.openThread('${parentMessageId}')">
                    <i class="fas fa-comments"></i>
                    <span class="thread-count">${this.messageThreads.get(parentMessageId)?.length || 0} replies</span>
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
            parentMessage.querySelector('.message-content').appendChild(threadIndicator);
        } else if (parentMessage) {
            // Update existing indicator
            const threadCount = parentMessage.querySelector('.thread-count');
            if (threadCount) {
                threadCount.textContent = `${this.messageThreads.get(parentMessageId)?.length || 0} replies`;
            }
        }
    }

    openThread(parentMessageId) {
        const modal = this.createThreadModal(parentMessageId);
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    showThreadSettings(parentMessageId) {
        const settingsModal = this.createThreadSettingsModal(parentMessageId);
        document.body.appendChild(settingsModal);
        settingsModal.classList.add('active');
    }

    createThreadSettingsModal(parentMessageId) {
        const modal = document.createElement('div');
        modal.id = 'thread-settings-modal';
        modal.className = 'modal small';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Thread Settings</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="thread-settings">
                        <div class="setting-group">
                            <h4>Notifications</h4>
                            <label class="setting-option">
                                <input type="checkbox" checked>
                                <span class="setting-label">Notify me of new replies</span>
                            </label>
                            <label class="setting-option">
                                <input type="checkbox">
                                <span class="setting-label">Send push notifications</span>
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <h4>Privacy</h4>
                            <label class="setting-option">
                                <input type="checkbox">
                                <span class="setting-label">Make thread public</span>
                            </label>
                            <label class="setting-option">
                                <input type="checkbox" checked>
                                <span class="setting-label">Allow new participants</span>
                            </label>
                        </div>

                        <div class="setting-group">
                            <h4>Thread Actions</h4>
                            <button class="setting-action-btn">
                                <i class="fas fa-pin"></i>
                                <span>Pin thread</span>
                            </button>
                            <button class="setting-action-btn">
                                <i class="fas fa-archive"></i>
                                <span>Archive thread</span>
                            </button>
                            <button class="setting-action-btn danger">
                                <i class="fas fa-trash"></i>
                                <span>Delete thread</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    <button class="btn btn-primary">Save Changes</button>
                </div>
            </div>
        `;
        return modal;
    }

    shareThread(parentMessageId) {
        const shareModal = this.createShareThreadModal(parentMessageId);
        document.body.appendChild(shareModal);
        shareModal.classList.add('active');
    }

    createShareThreadModal(parentMessageId) {
        const modal = document.createElement('div');
        modal.id = 'share-thread-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Share Thread</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="share-options">
                        <div class="share-method" onclick="messagingFinalMissing.copyThreadLink('${parentMessageId}')">
                            <i class="fas fa-link"></i>
                            <div class="share-info">
                                <h4>Copy Link</h4>
                                <p>Copy thread link to clipboard</p>
                            </div>
                        </div>
                        <div class="share-method" onclick="messagingFinalMissing.shareThreadToChat('${parentMessageId}')">
                            <i class="fas fa-comment"></i>
                            <div class="share-info">
                                <h4>Share to Chat</h4>
                                <p>Share thread in another conversation</p>
                            </div>
                        </div>
                        <div class="share-method" onclick="messagingFinalMissing.emailThread('${parentMessageId}')">
                            <i class="fas fa-envelope"></i>
                            <div class="share-info">
                                <h4>Send Email</h4>
                                <p>Email thread summary</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    copyThreadLink(parentMessageId) {
        const link = `${window.location.origin}/thread/${parentMessageId}`;
        navigator.clipboard.writeText(link);
        this.app.showToast('Thread link copied to clipboard', 'success');
        document.getElementById('share-thread-modal').remove();
    }

    shareThreadToChat(parentMessageId) {
        // Implementation for sharing to another chat
        this.app.showToast('Thread shared to chat', 'success');
        document.getElementById('share-thread-modal').remove();
    }

    emailThread(parentMessageId) {
        // Implementation for emailing thread
        this.app.showToast('Thread emailed successfully', 'success');
        document.getElementById('share-thread-modal').remove();
    }

    showThreadEmojiPicker(inputElement) {
        // Implementation for emoji picker in threads
        this.app.showToast('Emoji picker opened', 'info');
    }

    showThreadMentionPicker(inputElement) {
        // Implementation for mention picker in threads
        this.app.showToast('Mention picker opened', 'info');
    }

    setupThreadDisplay() {
        // Handle thread message interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-thread-btn')) {
                const threadBtn = e.target.closest('.view-thread-btn');
                const messageElement = threadBtn.closest('.message');
                const parentMessageId = messageElement.dataset.messageId;
                this.openThread(parentMessageId);
            }
        });
    }

    setupThreadNavigation() {
        // Keyboard navigation for threads
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 't' && document.getElementById('thread-modal')) {
                e.preventDefault();
                const threadInput = document.querySelector('#thread-modal .thread-input');
                if (threadInput) threadInput.focus();
            }
        });
    }

    setupThreadManagement() {
        // Thread management features
        this.setupThreadArchiving();
        this.setupThreadPinning();
        this.setupThreadSearch();
    }

    setupThreadArchiving() {
        // Archive completed threads
    }

    setupThreadPinning() {
        // Pin important threads
    }

    setupThreadSearch() {
        // Search within threads
    }

    // ========================================
    // 2. MESSAGE EDITING INTERFACE
    // ========================================

    initMessageEditingInterface() {
        this.setupEditButtons();
        this.setupEditModal();
        this.setupEditHistory();
        this.setupEditPermissions();
    }

    setupEditButtons() {
        // Add edit buttons to own messages
        document.addEventListener('DOMContentLoaded', () => {
            this.addEditButtonsToMessages();
        });

        // Handle edit button clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-message-btn')) {
                const messageElement = e.target.closest('.message');
                const messageId = messageElement.dataset.messageId;
                this.startMessageEdit(messageId);
            }
        });
    }

    addEditButtonsToMessages() {
        const ownMessages = document.querySelectorAll('.message.own-message');
        ownMessages.forEach(message => {
            if (!message.querySelector('.edit-message-btn') && this.canEditMessage(message)) {
                this.addEditButton(message);
            }
        });
    }

    canEditMessage(messageElement) {
        // Check if message can be edited (time limit, permissions, etc.)
        const messageTime = messageElement.dataset.timestamp || Date.now();
        const timeDiff = Date.now() - messageTime;
        const editTimeLimit = 15 * 60 * 1000; // 15 minutes
        
        return timeDiff < editTimeLimit;
    }

    addEditButton(messageElement) {
        let messageActions = messageElement.querySelector('.message-actions');
        if (!messageActions) {
            messageActions = document.createElement('div');
            messageActions.className = 'message-actions';
            messageElement.querySelector('.message-content').appendChild(messageActions);
        }

        const editBtn = document.createElement('button');
        editBtn.className = 'message-action-btn edit-message-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit message';
        
        messageActions.appendChild(editBtn);
    }

    startMessageEdit(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;

        // Check editing permissions
        if (!this.canEditMessage(messageElement)) {
            this.app.showToast('Message cannot be edited (time limit exceeded)', 'warning');
            return;
        }

        // Show editing interface
        this.showEditInterface(messageElement);
    }

    showEditInterface(messageElement) {
        // Replace message content with edit interface
        const messageContent = messageElement.querySelector('.message-text');
        const originalText = messageContent.textContent;
        
        // Store original content for cancellation
        messageElement.setAttribute('data-original-text', originalText);
        
        const editInterface = document.createElement('div');
        editInterface.className = 'message-edit-interface';
        editInterface.innerHTML = `
            <div class="edit-container">
                <div class="edit-header">
                    <i class="fas fa-edit"></i>
                    <span>Editing message</span>
                    <div class="edit-time-limit">
                        <i class="fas fa-clock"></i>
                        <span id="edit-time-remaining">14:59</span>
                    </div>
                </div>
                <div class="edit-input-container">
                    <textarea class="edit-textarea" rows="3">${originalText}</textarea>
                    <div class="edit-formatting-toolbar">
                        <button class="format-btn" data-format="bold" title="Bold">
                            <i class="fas fa-bold"></i>
                        </button>
                        <button class="format-btn" data-format="italic" title="Italic">
                            <i class="fas fa-italic"></i>
                        </button>
                        <button class="format-btn" data-format="underline" title="Underline">
                            <i class="fas fa-underline"></i>
                        </button>
                        <button class="format-btn" data-format="strikethrough" title="Strikethrough">
                            <i class="fas fa-strikethrough"></i>
                        </button>
                        <div class="format-separator"></div>
                        <button class="format-btn emoji-picker-btn" title="Add emoji">
                            <i class="far fa-smile"></i>
                        </button>
                        <button class="format-btn mention-btn" title="Mention someone">
                            <i class="fas fa-at"></i>
                        </button>
                    </div>
                </div>
                <div class="edit-actions">
                    <div class="edit-options">
                        <label class="edit-option">
                            <input type="checkbox" id="notify-edit">
                            <span>Notify about edit</span>
                        </label>
                        <button class="edit-history-btn" onclick="messagingFinalMissing.showEditHistory('${messageElement.dataset.messageId}')">
                            <i class="fas fa-history"></i>
                            View History
                        </button>
                    </div>
                    <div class="edit-buttons">
                        <button class="btn btn-secondary cancel-edit-btn" onclick="messagingFinalMissing.cancelMessageEdit('${messageElement.dataset.messageId}')">
                            Cancel
                        </button>
                        <button class="btn btn-primary save-edit-btn" onclick="messagingFinalMissing.saveMessageEdit('${messageElement.dataset.messageId}')">
                            <i class="fas fa-check"></i>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Replace message content with edit interface
        messageContent.style.display = 'none';
        messageElement.querySelector('.message-content').appendChild(editInterface);

        // Start edit timer
        this.startEditTimer(messageElement);

        // Setup edit interface events
        this.setupEditInterfaceEvents(editInterface, messageElement);

        // Focus on textarea
        const textarea = editInterface.querySelector('.edit-textarea');
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);

        // Store editing state
        this.editingMessage = messageElement.dataset.messageId;
    }

    startEditTimer(messageElement) {
        const timerElement = messageElement.querySelector('#edit-time-remaining');
        let timeLeft = 15 * 60; // 15 minutes in seconds

        const timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                clearInterval(timer);
                this.cancelMessageEdit(messageElement.dataset.messageId);
                this.app.showToast('Edit time expired', 'warning');
            }
            timeLeft--;
        }, 1000);

        // Store timer reference
        messageElement.editTimer = timer;
    }

    setupEditInterfaceEvents(editInterface, messageElement) {
        const textarea = editInterface.querySelector('.edit-textarea');
        
        // Auto-resize textarea
        textarea.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
        });

        // Keyboard shortcuts
        textarea.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.saveMessageEdit(messageElement.dataset.messageId);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.cancelMessageEdit(messageElement.dataset.messageId);
            }
        });

        // Formatting buttons
        editInterface.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyTextFormatting(textarea, btn.dataset.format);
            });
        });
    }

    applyTextFormatting(textarea, format) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);

        let formattedText;
        switch (format) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                break;
            case 'underline':
                formattedText = `__${selectedText}__`;
                break;
            case 'strikethrough':
                formattedText = `~~${selectedText}~~`;
                break;
            default:
                return;
        }

        const newValue = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
        textarea.value = newValue;
        
        // Update cursor position
        const newCursorPos = start + formattedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
    }

    saveMessageEdit(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        const editInterface = messageElement.querySelector('.message-edit-interface');
        const textarea = editInterface.querySelector('.edit-textarea');
        const newContent = textarea.value.trim();

        if (!newContent) {
            this.app.showToast('Message cannot be empty', 'warning');
            return;
        }

        // Simulate API call
        setTimeout(() => {
            // Update message content
            const messageText = messageElement.querySelector('.message-text');
            messageText.textContent = newContent;
            messageText.style.display = 'block';

            // Add edit indicator
            this.addEditIndicator(messageElement);

            // Remove edit interface
            editInterface.remove();

            // Clear edit timer
            if (messageElement.editTimer) {
                clearInterval(messageElement.editTimer);
            }

            // Clear editing state
            this.editingMessage = null;

            this.app.showToast('Message updated successfully', 'success');
        }, 500);
    }

    cancelMessageEdit(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        const editInterface = messageElement.querySelector('.message-edit-interface');
        const messageText = messageElement.querySelector('.message-text');

        // Show original message
        messageText.style.display = 'block';

        // Remove edit interface
        if (editInterface) {
            editInterface.remove();
        }

        // Clear edit timer
        if (messageElement.editTimer) {
            clearInterval(messageElement.editTimer);
        }

        // Clear editing state
        this.editingMessage = null;
    }

    addEditIndicator(messageElement) {
        if (!messageElement.querySelector('.edit-indicator')) {
            const editIndicator = document.createElement('div');
            editIndicator.className = 'edit-indicator';
            editIndicator.innerHTML = `
                <i class="fas fa-edit"></i>
                <span>edited</span>
            `;
            messageElement.querySelector('.message-time').appendChild(editIndicator);
        }
    }

    showEditHistory(messageId) {
        const modal = this.createEditHistoryModal(messageId);
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    createEditHistoryModal(messageId) {
        const modal = document.createElement('div');
        modal.id = 'edit-history-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit History</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="edit-history-list">
                        <div class="history-item current">
                            <div class="history-header">
                                <span class="history-version">Current</span>
                                <span class="history-time">Just now</span>
                            </div>
                            <div class="history-content">Thanks for sharing! This looks really interesting and I'll definitely check it out.</div>
                        </div>
                        <div class="history-item">
                            <div class="history-header">
                                <span class="history-version">Version 1</span>
                                <span class="history-time">5 minutes ago</span>
                            </div>
                            <div class="history-content">Thanks for sharing! This looks really interesting.</div>
                        </div>
                        <div class="history-item original">
                            <div class="history-header">
                                <span class="history-version">Original</span>
                                <span class="history-time">10 minutes ago</span>
                            </div>
                            <div class="history-content">Thanks for sharing!</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    setupEditModal() {
        // Additional edit modal functionality
    }

    setupEditHistory() {
        // Edit history tracking
    }

    setupEditPermissions() {
        // Edit permission management
    }

    // ========================================
    // 3. MESSAGE FORWARDING INTERFACE
    // ========================================

    initMessageForwardingInterface() {
        this.setupForwardButtons();
        this.setupForwardModal();
        this.setupBulkForwarding();
        this.setupForwardHistory();
    }

    setupForwardButtons() {
        // Add forward buttons to all messages
        document.addEventListener('DOMContentLoaded', () => {
            this.addForwardButtonsToMessages();
        });

        // Handle forward button clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.forward-message-btn')) {
                const messageElement = e.target.closest('.message');
                const messageId = messageElement.dataset.messageId;
                this.startMessageForward([messageId]);
            }
        });

        // Handle bulk forward selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.select-message-checkbox')) {
                this.updateForwardSelection();
            }
        });
    }

    addForwardButtonsToMessages() {
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            if (!message.querySelector('.forward-message-btn')) {
                this.addForwardButton(message);
            }
        });
    }

    addForwardButton(messageElement) {
        let messageActions = messageElement.querySelector('.message-actions');
        if (!messageActions) {
            messageActions = document.createElement('div');
            messageActions.className = 'message-actions';
            messageElement.querySelector('.message-content').appendChild(messageActions);
        }

        const forwardBtn = document.createElement('button');
        forwardBtn.className = 'message-action-btn forward-message-btn';
        forwardBtn.innerHTML = '<i class="fas fa-share"></i>';
        forwardBtn.title = 'Forward message';
        
        messageActions.appendChild(forwardBtn);

        // Add selection checkbox for bulk operations
        const selectCheckbox = document.createElement('input');
        selectCheckbox.type = 'checkbox';
        selectCheckbox.className = 'select-message-checkbox';
        selectCheckbox.style.display = 'none';
        messageElement.appendChild(selectCheckbox);
    }

    startMessageForward(messageIds) {
        this.forwardingMessages = messageIds;
        const modal = this.createForwardModal(messageIds);
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    createForwardModal(messageIds) {
        const modal = document.createElement('div');
        modal.id = 'forward-modal';
        modal.className = 'modal large';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="forward-header">
                        <i class="fas fa-share"></i>
                        <h3>Forward ${messageIds.length === 1 ? 'Message' : `${messageIds.length} Messages`}</h3>
                    </div>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="forward-container">
                        <div class="messages-to-forward">
                            <h4>Messages to Forward</h4>
                            <div class="forward-preview">
                                ${this.renderForwardPreview(messageIds)}
                            </div>
                        </div>

                        <div class="recipient-selection">
                            <div class="recipient-search">
                                <div class="search-input-container">
                                    <i class="fas fa-search"></i>
                                    <input type="text" id="recipient-search" placeholder="Search contacts and conversations..." class="form-input">
                                </div>
                            </div>

                            <div class="recipient-tabs">
                                <button class="recipient-tab active" data-tab="contacts" onclick="messagingFinalMissing.switchRecipientTab('contacts')">
                                    <i class="fas fa-users"></i>
                                    Contacts
                                </button>
                                <button class="recipient-tab" data-tab="conversations" onclick="messagingFinalMissing.switchRecipientTab('conversations')">
                                    <i class="fas fa-comments"></i>
                                    Recent Chats
                                </button>
                                <button class="recipient-tab" data-tab="groups" onclick="messagingFinalMissing.switchRecipientTab('groups')">
                                    <i class="fas fa-users-cog"></i>
                                    Groups
                                </button>
                            </div>

                            <div class="recipient-content">
                                <div class="recipient-list active" data-tab="contacts">
                                    ${this.renderContactsList()}
                                </div>
                                <div class="recipient-list" data-tab="conversations">
                                    ${this.renderRecentChats()}
                                </div>
                                <div class="recipient-list" data-tab="groups">
                                    ${this.renderGroupsList()}
                                </div>
                            </div>

                            <div class="selected-recipients" id="selected-recipients">
                                <h4>Selected Recipients (<span id="recipient-count">0</span>)</h4>
                                <div class="recipient-chips" id="recipient-chips"></div>
                            </div>
                        </div>

                        <div class="forward-options">
                            <div class="forward-settings">
                                <label class="forward-option">
                                    <input type="checkbox" id="forward-with-attribution" checked>
                                    <span>Include original sender information</span>
                                </label>
                                <label class="forward-option">
                                    <input type="checkbox" id="forward-notify-sender">
                                    <span>Notify original sender</span>
                                </label>
                                <label class="forward-option">
                                    <input type="checkbox" id="forward-add-comment">
                                    <span>Add personal comment</span>
                                </label>
                            </div>

                            <div class="forward-comment" id="forward-comment" style="display: none;">
                                <textarea placeholder="Add a comment to your forwarded message..." rows="3" class="form-input"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="forward-summary">
                        <span class="forward-info">${messageIds.length} message${messageIds.length === 1 ? '' : 's'} • <span id="recipients-summary">0 recipients</span></span>
                    </div>
                    <div class="forward-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button class="btn btn-primary forward-send-btn" onclick="messagingFinalMissing.sendForwardedMessages()" disabled>
                            <i class="fas fa-paper-plane"></i>
                            Forward Messages
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupForwardModalEvents(modal);
        this.selectedRecipients = [];
        return modal;
    }

    renderForwardPreview(messageIds) {
        return messageIds.map(messageId => {
            const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement) {
                const senderName = messageElement.classList.contains('own-message') ? 'You' : 'Emma Watson';
                const content = messageElement.querySelector('.message-text')?.textContent || 'Media message';
                const time = messageElement.querySelector('.message-time')?.textContent || 'Now';
                
                return `
                    <div class="forward-message-preview">
                        <div class="preview-header">
                            <span class="preview-sender">${senderName}</span>
                            <span class="preview-time">${time}</span>
                        </div>
                        <div class="preview-content">${content}</div>
                    </div>
                `;
            }
            return '';
        }).join('');
    }

    renderContactsList() {
        const contacts = [
            { id: 'emma-watson', name: 'Emma Watson', avatar: 'EW', status: 'online' },
            { id: 'alex-johnson', name: 'Alex Johnson', avatar: 'AJ', status: 'offline' },
            { id: 'sarah-chen', name: 'Sarah Chen', avatar: 'SC', status: 'online' },
            { id: 'mike-torres', name: 'Mike Torres', avatar: 'MT', status: 'away' }
        ];

        return contacts.map(contact => `
            <div class="recipient-item" data-recipient-id="${contact.id}" data-recipient-type="contact">
                <div class="recipient-checkbox">
                    <input type="checkbox" onchange="messagingFinalMissing.toggleRecipient('${contact.id}', 'contact', this.checked)">
                </div>
                <div class="recipient-avatar ${contact.status}">
                    ${contact.avatar}
                    <div class="status-indicator"></div>
                </div>
                <div class="recipient-info">
                    <div class="recipient-name">${contact.name}</div>
                    <div class="recipient-status">${contact.status}</div>
                </div>
            </div>
        `).join('');
    }

    renderRecentChats() {
        const chats = [
            { id: 'chat-1', name: 'Emma Watson', avatar: 'EW', lastMessage: 'Thanks for the update!' },
            { id: 'chat-2', name: 'Design Team', avatar: 'DT', lastMessage: 'Meeting at 3 PM', isGroup: true },
            { id: 'chat-3', name: 'Alex Johnson', avatar: 'AJ', lastMessage: 'See you tomorrow' }
        ];

        return chats.map(chat => `
            <div class="recipient-item" data-recipient-id="${chat.id}" data-recipient-type="chat">
                <div class="recipient-checkbox">
                    <input type="checkbox" onchange="messagingFinalMissing.toggleRecipient('${chat.id}', 'chat', this.checked)">
                </div>
                <div class="recipient-avatar">
                    ${chat.avatar}
                    ${chat.isGroup ? '<i class="fas fa-users group-indicator"></i>' : ''}
                </div>
                <div class="recipient-info">
                    <div class="recipient-name">${chat.name}</div>
                    <div class="recipient-preview">${chat.lastMessage}</div>
                </div>
            </div>
        `).join('');
    }

    renderGroupsList() {
        const groups = [
            { id: 'group-1', name: 'Design Team', avatar: 'DT', members: 12 },
            { id: 'group-2', name: 'Project Alpha', avatar: 'PA', members: 8 },
            { id: 'group-3', name: 'Family Chat', avatar: 'FC', members: 5 }
        ];

        return groups.map(group => `
            <div class="recipient-item" data-recipient-id="${group.id}" data-recipient-type="group">
                <div class="recipient-checkbox">
                    <input type="checkbox" onchange="messagingFinalMissing.toggleRecipient('${group.id}', 'group', this.checked)">
                </div>
                <div class="recipient-avatar group">
                    ${group.avatar}
                    <i class="fas fa-users"></i>
                </div>
                <div class="recipient-info">
                    <div class="recipient-name">${group.name}</div>
                    <div class="recipient-members">${group.members} members</div>
                </div>
            </div>
        `).join('');
    }

    setupForwardModalEvents(modal) {
        // Search functionality
        const searchInput = modal.querySelector('#recipient-search');
        searchInput.addEventListener('input', (e) => {
            this.filterRecipients(e.target.value);
        });

        // Forward options
        const addCommentCheckbox = modal.querySelector('#forward-add-comment');
        const commentArea = modal.querySelector('#forward-comment');
        
        addCommentCheckbox.addEventListener('change', (e) => {
            commentArea.style.display = e.target.checked ? 'block' : 'none';
        });
    }

    switchRecipientTab(tabName) {
        const tabs = document.querySelectorAll('.recipient-tab');
        const lists = document.querySelectorAll('.recipient-list');

        tabs.forEach(tab => tab.classList.remove('active'));
        lists.forEach(list => list.classList.remove('active'));

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.querySelector(`.recipient-list[data-tab="${tabName}"]`).classList.add('active');
    }

    toggleRecipient(recipientId, recipientType, isSelected) {
        const recipient = { id: recipientId, type: recipientType };

        if (isSelected) {
            if (!this.selectedRecipients.find(r => r.id === recipientId)) {
                this.selectedRecipients.push(recipient);
            }
        } else {
            this.selectedRecipients = this.selectedRecipients.filter(r => r.id !== recipientId);
        }

        this.updateRecipientDisplay();
    }

    updateRecipientDisplay() {
        const recipientChips = document.getElementById('recipient-chips');
        const recipientCount = document.getElementById('recipient-count');
        const recipientsSummary = document.getElementById('recipients-summary');
        const forwardButton = document.querySelector('.forward-send-btn');

        // Update count
        recipientCount.textContent = this.selectedRecipients.length;
        recipientsSummary.textContent = `${this.selectedRecipients.length} recipient${this.selectedRecipients.length === 1 ? '' : 's'}`;

        // Enable/disable forward button
        forwardButton.disabled = this.selectedRecipients.length === 0;

        // Update recipient chips
        recipientChips.innerHTML = this.selectedRecipients.map(recipient => {
            const name = this.getRecipientName(recipient.id, recipient.type);
            return `
                <div class="recipient-chip">
                    <span class="chip-name">${name}</span>
                    <button class="remove-recipient-btn" onclick="messagingFinalMissing.removeRecipient('${recipient.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');
    }

    removeRecipient(recipientId) {
        this.selectedRecipients = this.selectedRecipients.filter(r => r.id !== recipientId);
        
        // Uncheck the corresponding checkbox
        const checkbox = document.querySelector(`[data-recipient-id="${recipientId}"] input[type="checkbox"]`);
        if (checkbox) checkbox.checked = false;
        
        this.updateRecipientDisplay();
    }

    getRecipientName(recipientId, recipientType) {
        // Mock implementation - in real app, would fetch from data
        const names = {
            'emma-watson': 'Emma Watson',
            'alex-johnson': 'Alex Johnson',
            'sarah-chen': 'Sarah Chen',
            'mike-torres': 'Mike Torres',
            'chat-1': 'Emma Watson',
            'chat-2': 'Design Team',
            'chat-3': 'Alex Johnson',
            'group-1': 'Design Team',
            'group-2': 'Project Alpha',
            'group-3': 'Family Chat'
        };
        return names[recipientId] || 'Unknown';
    }

    filterRecipients(searchTerm) {
        const recipientItems = document.querySelectorAll('.recipient-item');
        const term = searchTerm.toLowerCase();

        recipientItems.forEach(item => {
            const name = item.querySelector('.recipient-name').textContent.toLowerCase();
            if (name.includes(term) || term === '') {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    sendForwardedMessages() {
        const modal = document.getElementById('forward-modal');
        const withAttribution = modal.querySelector('#forward-with-attribution').checked;
        const notifySender = modal.querySelector('#forward-notify-sender').checked;
        const addComment = modal.querySelector('#forward-add-comment').checked;
        const comment = addComment ? modal.querySelector('#forward-comment textarea').value : '';

        // Simulate forwarding process
        this.app.showToast(`Forwarding ${this.forwardingMessages.length} message(s) to ${this.selectedRecipients.length} recipient(s)...`, 'info');

        setTimeout(() => {
            this.app.showToast('Messages forwarded successfully', 'success');
            modal.remove();
            
            // Clear forwarding state
            this.forwardingMessages = [];
            this.selectedRecipients = [];
        }, 1000);
    }

    updateForwardSelection() {
        const checkboxes = document.querySelectorAll('.select-message-checkbox:checked');
        if (checkboxes.length > 0) {
            const messageIds = Array.from(checkboxes).map(cb => cb.closest('.message').dataset.messageId);
            this.showBulkForwardToolbar(messageIds);
        } else {
            this.hideBulkForwardToolbar();
        }
    }

    showBulkForwardToolbar(messageIds) {
        // Remove existing toolbar
        const existingToolbar = document.getElementById('bulk-forward-toolbar');
        if (existingToolbar) existingToolbar.remove();

        const toolbar = document.createElement('div');
        toolbar.id = 'bulk-forward-toolbar';
        toolbar.className = 'bulk-forward-toolbar';
        toolbar.innerHTML = `
            <div class="toolbar-content">
                <div class="toolbar-info">
                    <span>${messageIds.length} message${messageIds.length === 1 ? '' : 's'} selected</span>
                </div>
                <div class="toolbar-actions">
                    <button class="toolbar-btn" onclick="messagingFinalMissing.startMessageForward(['${messageIds.join("','")}'])">
                        <i class="fas fa-share"></i>
                        Forward
                    </button>
                    <button class="toolbar-btn" onclick="messagingFinalMissing.hideBulkForwardToolbar()">
                        <i class="fas fa-times"></i>
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(toolbar);
    }

    hideBulkForwardToolbar() {
        const toolbar = document.getElementById('bulk-forward-toolbar');
        if (toolbar) toolbar.remove();
        
        // Uncheck all selection checkboxes
        document.querySelectorAll('.select-message-checkbox').forEach(cb => {
            cb.checked = false;
            cb.style.display = 'none';
        });
    }

    setupForwardModal() {
        // Additional forward modal setup
    }

    setupBulkForwarding() {
        // Setup bulk forwarding features
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'a' && document.querySelector('.chat-container')) {
                e.preventDefault();
                this.toggleBulkSelectMode();
            }
        });
    }

    toggleBulkSelectMode() {
        const checkboxes = document.querySelectorAll('.select-message-checkbox');
        const isVisible = checkboxes[0]?.style.display !== 'none';

        checkboxes.forEach(cb => {
            cb.style.display = isVisible ? 'none' : 'block';
        });

        if (isVisible) {
            this.hideBulkForwardToolbar();
        }
    }

    setupForwardHistory() {
        // Track forwarded messages for analytics
    }

    // ========================================
    // 4. CHAT CUSTOMIZATION INTERFACE
    // ========================================

    initChatCustomizationInterface() {
        this.setupCustomizationPanel();
        this.setupThemeCustomization();
        this.setupChatBackgrounds();
        this.setupFontCustomization();
        this.setupSoundCustomization();
    }

    setupCustomizationPanel() {
        // Add customization button to chat header
        document.addEventListener('DOMContentLoaded', () => {
            this.addCustomizationButton();
        });

        // Handle customization button clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.chat-customize-btn')) {
                this.showCustomizationPanel();
            }
        });
    }

    addCustomizationButton() {
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader && !chatHeader.querySelector('.chat-customize-btn')) {
            const customizeBtn = document.createElement('button');
            customizeBtn.className = 'chat-customize-btn header-action-btn';
            customizeBtn.innerHTML = '<i class="fas fa-palette"></i>';
            customizeBtn.title = 'Customize chat';
            
            // Add to header actions
            let headerActions = chatHeader.querySelector('.header-actions');
            if (!headerActions) {
                headerActions = document.createElement('div');
                headerActions.className = 'header-actions';
                chatHeader.appendChild(headerActions);
            }
            
            headerActions.appendChild(customizeBtn);
        }
    }

    showCustomizationPanel() {
        const modal = this.createCustomizationModal();
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    createCustomizationModal() {
        const modal = document.createElement('div');
        modal.id = 'chat-customization-modal';
        modal.className = 'modal large';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="customization-header">
                        <i class="fas fa-palette"></i>
                        <h3>Chat Customization</h3>
                    </div>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="customization-container">
                        <div class="customization-sidebar">
                            <div class="customization-tabs">
                                <button class="customization-tab active" data-tab="theme" onclick="messagingFinalMissing.switchCustomizationTab('theme')">
                                    <i class="fas fa-paint-brush"></i>
                                    <span>Theme & Colors</span>
                                </button>
                                <button class="customization-tab" data-tab="background" onclick="messagingFinalMissing.switchCustomizationTab('background')">
                                    <i class="fas fa-image"></i>
                                    <span>Background</span>
                                </button>
                                <button class="customization-tab" data-tab="fonts" onclick="messagingFinalMissing.switchCustomizationTab('fonts')">
                                    <i class="fas fa-font"></i>
                                    <span>Typography</span>
                                </button>
                                <button class="customization-tab" data-tab="sounds" onclick="messagingFinalMissing.switchCustomizationTab('sounds')">
                                    <i class="fas fa-volume-up"></i>
                                    <span>Sounds & Notifications</span>
                                </button>
                                <button class="customization-tab" data-tab="bubbles" onclick="messagingFinalMissing.switchCustomizationTab('bubbles')">
                                    <i class="fas fa-comment"></i>
                                    <span>Message Bubbles</span>
                                </button>
                                <button class="customization-tab" data-tab="animations" onclick="messagingFinalMissing.switchCustomizationTab('animations')">
                                    <i class="fas fa-magic"></i>
                                    <span>Animations</span>
                                </button>
                            </div>

                            <div class="chat-preview">
                                <h4>Preview</h4>
                                <div class="preview-chat" id="preview-chat">
                                    <div class="preview-message received">
                                        <div class="preview-avatar">EW</div>
                                        <div class="preview-content">
                                            <div class="preview-text">Hey! How's your day going?</div>
                                        </div>
                                    </div>
                                    <div class="preview-message sent">
                                        <div class="preview-content">
                                            <div class="preview-text">Great! Just working on some projects.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="customization-content">
                            <!-- Theme & Colors Tab -->
                            <div class="customization-panel active" data-tab="theme">
                                <h4>Theme & Color Scheme</h4>
                                <div class="theme-options">
                                    <div class="theme-presets">
                                        <h5>Quick Themes</h5>
                                        <div class="theme-grid">
                                            <div class="theme-preset active" data-theme="default" onclick="messagingFinalMissing.applyTheme('default')">
                                                <div class="theme-preview default"></div>
                                                <span>Default</span>
                                            </div>
                                            <div class="theme-preset" data-theme="dark" onclick="messagingFinalMissing.applyTheme('dark')">
                                                <div class="theme-preview dark"></div>
                                                <span>Dark</span>
                                            </div>
                                            <div class="theme-preset" data-theme="blue" onclick="messagingFinalMissing.applyTheme('blue')">
                                                <div class="theme-preview blue"></div>
                                                <span>Ocean Blue</span>
                                            </div>
                                            <div class="theme-preset" data-theme="green" onclick="messagingFinalMissing.applyTheme('green')">
                                                <div class="theme-preview green"></div>
                                                <span>Forest Green</span>
                                            </div>
                                            <div class="theme-preset" data-theme="purple" onclick="messagingFinalMissing.applyTheme('purple')">
                                                <div class="theme-preview purple"></div>
                                                <span>Royal Purple</span>
                                            </div>
                                            <div class="theme-preset" data-theme="sunset" onclick="messagingFinalMissing.applyTheme('sunset')">
                                                <div class="theme-preview sunset"></div>
                                                <span>Sunset</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="custom-colors">
                                        <h5>Custom Colors</h5>
                                        <div class="color-customization">
                                            <div class="color-section">
                                                <label>Primary Color</label>
                                                <div class="color-input-group">
                                                    <input type="color" id="primary-color" value="#007bff" onchange="messagingFinalMissing.updateCustomColor('primary', this.value)">
                                                    <input type="text" id="primary-color-hex" value="#007bff" class="color-hex-input">
                                                </div>
                                            </div>
                                            <div class="color-section">
                                                <label>Secondary Color</label>
                                                <div class="color-input-group">
                                                    <input type="color" id="secondary-color" value="#6c757d" onchange="messagingFinalMissing.updateCustomColor('secondary', this.value)">
                                                    <input type="text" id="secondary-color-hex" value="#6c757d" class="color-hex-input">
                                                </div>
                                            </div>
                                            <div class="color-section">
                                                <label>Chat Background</label>
                                                <div class="color-input-group">
                                                    <input type="color" id="bg-color" value="#ffffff" onchange="messagingFinalMissing.updateCustomColor('background', this.value)">
                                                    <input type="text" id="bg-color-hex" value="#ffffff" class="color-hex-input">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Background Tab -->
                            <div class="customization-panel" data-tab="background">
                                <h4>Chat Background</h4>
                                <div class="background-options">
                                    <div class="background-types">
                                        <div class="bg-type-selector">
                                            <label class="bg-type-option">
                                                <input type="radio" name="bg-type" value="solid" checked>
                                                <span>Solid Color</span>
                                            </label>
                                            <label class="bg-type-option">
                                                <input type="radio" name="bg-type" value="gradient">
                                                <span>Gradient</span>
                                            </label>
                                            <label class="bg-type-option">
                                                <input type="radio" name="bg-type" value="image">
                                                <span>Image</span>
                                            </label>
                                            <label class="bg-type-option">
                                                <input type="radio" name="bg-type" value="pattern">
                                                <span>Pattern</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div class="background-presets">
                                        <h5>Background Gallery</h5>
                                        <div class="bg-gallery">
                                            <div class="bg-preset active" data-bg="none" onclick="messagingFinalMissing.applyBackground('none')">
                                                <div class="bg-preview solid-white"></div>
                                                <span>Default</span>
                                            </div>
                                            <div class="bg-preset" data-bg="gradient1" onclick="messagingFinalMissing.applyBackground('gradient1')">
                                                <div class="bg-preview gradient-blue"></div>
                                                <span>Blue Gradient</span>
                                            </div>
                                            <div class="bg-preset" data-bg="gradient2" onclick="messagingFinalMissing.applyBackground('gradient2')">
                                                <div class="bg-preview gradient-sunset"></div>
                                                <span>Sunset</span>
                                            </div>
                                            <div class="bg-preset" data-bg="pattern1" onclick="messagingFinalMissing.applyBackground('pattern1')">
                                                <div class="bg-preview pattern-dots"></div>
                                                <span>Dots</span>
                                            </div>
                                            <div class="bg-preset" data-bg="pattern2" onclick="messagingFinalMissing.applyBackground('pattern2')">
                                                <div class="bg-preview pattern-waves"></div>
                                                <span>Waves</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="background-upload">
                                        <h5>Custom Background</h5>
                                        <div class="upload-area">
                                            <button class="upload-btn" onclick="document.getElementById('bg-upload').click()">
                                                <i class="fas fa-upload"></i>
                                                Upload Image
                                            </button>
                                            <input type="file" id="bg-upload" accept="image/*" style="display: none;" onchange="messagingFinalMissing.handleBackgroundUpload(this)">
                                            <p class="upload-help">JPG, PNG, or GIF. Max 5MB.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Typography Tab -->
                            <div class="customization-panel" data-tab="fonts">
                                <h4>Typography & Text Settings</h4>
                                <div class="font-options">
                                    <div class="font-family">
                                        <h5>Font Family</h5>
                                        <select id="font-family-select" onchange="messagingFinalMissing.updateFont('family', this.value)">
                                            <option value="system">System Default</option>
                                            <option value="Arial">Arial</option>
                                            <option value="Helvetica">Helvetica</option>
                                            <option value="Georgia">Georgia</option>
                                            <option value="Times New Roman">Times New Roman</option>
                                            <option value="Courier New">Courier New</option>
                                            <option value="Roboto">Roboto</option>
                                            <option value="Open Sans">Open Sans</option>
                                        </select>
                                    </div>

                                    <div class="font-size">
                                        <h5>Message Text Size</h5>
                                        <div class="size-slider">
                                            <input type="range" id="font-size-slider" min="12" max="20" value="14" onchange="messagingFinalMissing.updateFont('size', this.value)">
                                            <span class="size-display" id="font-size-display">14px</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Sounds Tab -->
                            <div class="customization-panel" data-tab="sounds">
                                <h4>Sounds & Notifications</h4>
                                <div class="sound-options">
                                    <div class="notification-sounds">
                                        <h5>Notification Sounds</h5>
                                        <select id="notification-sound" onchange="messagingFinalMissing.updateSound('notification', this.value)">
                                            <option value="default">Default</option>
                                            <option value="chime">Chime</option>
                                            <option value="pop">Pop</option>
                                            <option value="ding">Ding</option>
                                            <option value="silent">Silent</option>
                                        </select>
                                    </div>

                                    <div class="sound-settings">
                                        <label class="sound-option">
                                            <input type="checkbox" id="typing-sounds" checked onchange="messagingFinalMissing.updateSound('typing', this.checked)">
                                            <span>Typing sounds</span>
                                        </label>
                                        <label class="sound-option">
                                            <input type="checkbox" id="send-sounds" checked onchange="messagingFinalMissing.updateSound('send', this.checked)">
                                            <span>Send message sounds</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- Message Bubbles Tab -->
                            <div class="customization-panel" data-tab="bubbles">
                                <h4>Message Bubble Style</h4>
                                <div class="bubble-options">
                                    <div class="bubble-styles">
                                        <h5>Bubble Shape</h5>
                                        <div class="style-grid">
                                            <div class="bubble-style active" data-style="rounded" onclick="messagingFinalMissing.applyBubbleStyle('rounded')">
                                                <div class="bubble-preview rounded"></div>
                                                <span>Rounded</span>
                                            </div>
                                            <div class="bubble-style" data-style="square" onclick="messagingFinalMissing.applyBubbleStyle('square')">
                                                <div class="bubble-preview square"></div>
                                                <span>Square</span>
                                            </div>
                                            <div class="bubble-style" data-style="pill" onclick="messagingFinalMissing.applyBubbleStyle('pill')">
                                                <div class="bubble-preview pill"></div>
                                                <span>Pill</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Animations Tab -->
                            <div class="customization-panel" data-tab="animations">
                                <h4>Animation Settings</h4>
                                <div class="animation-options">
                                    <label class="animation-option">
                                        <input type="checkbox" id="message-animations" checked onchange="messagingFinalMissing.updateAnimation('messages', this.checked)">
                                        <span>Message animations</span>
                                    </label>
                                    <label class="animation-option">
                                        <input type="checkbox" id="typing-indicators" checked onchange="messagingFinalMissing.updateAnimation('typing', this.checked)">
                                        <span>Typing indicators</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="customization-actions">
                        <button class="btn btn-outline" onclick="messagingFinalMissing.resetCustomizations()">
                            <i class="fas fa-undo"></i>
                            Reset to Default
                        </button>
                        <button class="btn btn-outline" onclick="messagingFinalMissing.exportCustomizations()">
                            <i class="fas fa-download"></i>
                            Export Settings
                        </button>
                    </div>
                    <div class="main-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button class="btn btn-primary" onclick="messagingFinalMissing.saveCustomizations(); this.closest('.modal').remove();">
                            <i class="fas fa-save"></i>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupCustomizationEvents(modal);
        return modal;
    }

    setupCustomizationEvents(modal) {
        // Tab switching functionality
        modal.querySelectorAll('.customization-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchCustomizationTab(tab.dataset.tab);
            });
        });
    }

    switchCustomizationTab(tabName) {
        const tabs = document.querySelectorAll('.customization-tab');
        const panels = document.querySelectorAll('.customization-panel');

        tabs.forEach(tab => tab.classList.remove('active'));
        panels.forEach(panel => panel.classList.remove('active'));

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.querySelector(`.customization-panel[data-tab="${tabName}"]`).classList.add('active');
    }

    applyTheme(themeName) {
        // Update theme selection
        document.querySelectorAll('.theme-preset').forEach(preset => preset.classList.remove('active'));
        document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');

        // Apply theme to preview
        const previewChat = document.getElementById('preview-chat');
        if (previewChat) {
            previewChat.className = `preview-chat theme-${themeName}`;
        }

        // Store theme preference
        this.chatCustomizations.theme = themeName;
        this.app.showToast(`Applied ${themeName} theme`, 'success');
    }

    updateCustomColor(colorType, value) {
        // Update corresponding hex input
        const hexInput = document.getElementById(`${colorType}-color-hex`);
        if (hexInput) hexInput.value = value;

        // Apply to preview
        this.applyColorToPreview(colorType, value);

        // Store customization
        if (!this.chatCustomizations.colors) this.chatCustomizations.colors = {};
        this.chatCustomizations.colors[colorType] = value;
    }

    applyColorToPreview(colorType, value) {
        const previewChat = document.getElementById('preview-chat');
        if (previewChat) {
            previewChat.style.setProperty(`--${colorType}-color`, value);
        }
    }

    applyBackground(backgroundType) {
        // Update background selection
        document.querySelectorAll('.bg-preset').forEach(preset => preset.classList.remove('active'));
        document.querySelector(`[data-bg="${backgroundType}"]`).classList.add('active');

        // Apply to preview
        const previewChat = document.getElementById('preview-chat');
        if (previewChat) {
            previewChat.className = `preview-chat bg-${backgroundType}`;
        }

        // Store customization
        this.chatCustomizations.background = backgroundType;
        this.app.showToast(`Applied background: ${backgroundType}`, 'success');
    }

    handleBackgroundUpload(input) {
        if (input.files && input.files[0]) {
            const file = input.files[0];
            if (file.size > 5 * 1024 * 1024) {
                this.app.showToast('File size must be less than 5MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                // Apply custom background
                const previewChat = document.getElementById('preview-chat');
                if (previewChat) {
                    previewChat.style.backgroundImage = `url(${e.target.result})`;
                    previewChat.style.backgroundSize = 'cover';
                }

                // Store customization
                this.chatCustomizations.customBackground = e.target.result;
                this.app.showToast('Custom background uploaded', 'success');
            };
            reader.readAsDataURL(file);
        }
    }

    updateFont(property, value) {
        if (property === 'size') {
            // Update display
            const display = document.getElementById('font-size-display');
            if (display) display.textContent = value + 'px';
        }

        // Apply to preview
        const previewChat = document.getElementById('preview-chat');
        if (previewChat) {
            if (property === 'family') {
                previewChat.style.fontFamily = value;
            } else if (property === 'size') {
                previewChat.style.fontSize = value + 'px';
            }
        }

        // Store customization
        if (!this.chatCustomizations.font) this.chatCustomizations.font = {};
        this.chatCustomizations.font[property] = value;
    }

    updateSound(soundType, value) {
        // Store sound preferences
        if (!this.chatCustomizations.sounds) this.chatCustomizations.sounds = {};
        this.chatCustomizations.sounds[soundType] = value;

        this.app.showToast(`Updated ${soundType} sound setting`, 'success');
    }

    applyBubbleStyle(styleName) {
        // Update bubble style selection
        document.querySelectorAll('.bubble-style').forEach(style => style.classList.remove('active'));
        document.querySelector(`[data-style="${styleName}"]`).classList.add('active');

        // Apply to preview
        const previewMessages = document.querySelectorAll('.preview-message');
        previewMessages.forEach(msg => {
            msg.className = `preview-message ${msg.classList.contains('received') ? 'received' : 'sent'} bubble-${styleName}`;
        });

        // Store customization
        this.chatCustomizations.bubbleStyle = styleName;
        this.app.showToast(`Applied ${styleName} bubble style`, 'success');
    }

    updateAnimation(animationType, enabled) {
        // Store animation preferences
        if (!this.chatCustomizations.animations) this.chatCustomizations.animations = {};
        this.chatCustomizations.animations[animationType] = enabled;

        this.app.showToast(`${enabled ? 'Enabled' : 'Disabled'} ${animationType} animations`, 'success');
    }

    saveCustomizations() {
        // Apply customizations to actual chat interface
        this.applyCustomizationsToChat();
        
        // Save to local storage
        localStorage.setItem('chatCustomizations', JSON.stringify(this.chatCustomizations));
        
        this.app.showToast('Chat customizations saved successfully', 'success');
    }

    applyCustomizationsToChat() {
        const chatContainer = document.querySelector('.chat-container');
        if (!chatContainer) return;

        // Apply theme
        if (this.chatCustomizations.theme) {
            chatContainer.setAttribute('data-theme', this.chatCustomizations.theme);
        }

        // Apply colors
        if (this.chatCustomizations.colors) {
            Object.entries(this.chatCustomizations.colors).forEach(([type, color]) => {
                chatContainer.style.setProperty(`--${type}-color`, color);
            });
        }

        // Apply background
        if (this.chatCustomizations.background) {
            chatContainer.setAttribute('data-background', this.chatCustomizations.background);
        }

        if (this.chatCustomizations.customBackground) {
            chatContainer.style.backgroundImage = `url(${this.chatCustomizations.customBackground})`;
        }

        // Apply font settings
        if (this.chatCustomizations.font) {
            const { family, size } = this.chatCustomizations.font;
            if (family) chatContainer.style.fontFamily = family;
            if (size) chatContainer.style.fontSize = size + 'px';
        }

        // Apply bubble style
        if (this.chatCustomizations.bubbleStyle) {
            chatContainer.setAttribute('data-bubble-style', this.chatCustomizations.bubbleStyle);
        }
    }

    resetCustomizations() {
        if (confirm('Are you sure you want to reset all customizations to default?')) {
            this.chatCustomizations = {};
            localStorage.removeItem('chatCustomizations');
            
            // Reset UI to defaults
            this.loadDefaultCustomizations();
            this.app.showToast('Customizations reset to default', 'success');
        }
    }

    exportCustomizations() {
        const customizationsJSON = JSON.stringify(this.chatCustomizations, null, 2);
        const blob = new Blob([customizationsJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'chat-customizations.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.app.showToast('Customizations exported successfully', 'success');
    }

    loadDefaultCustomizations() {
        // Load saved customizations or set defaults
        const saved = localStorage.getItem('chatCustomizations');
        if (saved) {
            this.chatCustomizations = JSON.parse(saved);
            this.applyCustomizationsToChat();
        } else {
            this.chatCustomizations = {
                theme: 'default',
                colors: {
                    primary: '#007bff',
                    secondary: '#6c757d',
                    background: '#ffffff'
                },
                background: 'none',
                font: {
                    family: 'system',
                    size: '14'
                },
                bubbleStyle: 'rounded',
                sounds: {
                    notification: 'default',
                    typing: true,
                    send: true
                },
                animations: {
                    messages: true,
                    typing: true
                }
            };
        }
    }

    setupThemeCustomization() {
        // Load saved customizations on startup
        this.loadDefaultCustomizations();
    }

    setupChatBackgrounds() {
        // Background customization setup
    }

    setupFontCustomization() {
        // Font customization setup
    }

    setupSoundCustomization() {
        // Sound customization setup
    }
}

// Export for global access
window.MessagingFinalMissingUIComponents = MessagingFinalMissingUIComponents;

// Initialize when DOM is ready and app is available
document.addEventListener('DOMContentLoaded', () => {
    if (window.connectHub) {
        window.messagingFinalMissing = new MessagingFinalMissingUIComponents(window.connectHub);
    }
});
