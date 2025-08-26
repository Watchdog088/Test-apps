/**
 * ConnectHub - Messages UI Components
 * Advanced messaging interfaces for comprehensive chat functionality
 */

class MessagesUIComponents {
    constructor(app) {
        this.app = app;
        this.currentConversation = null;
        this.voiceRecorder = null;
        this.videoCallActive = false;
        this.typingIndicators = new Map();
        this.messageCache = new Map();
        this.conversationsCache = new Map();
        this.searchHistory = [];
        this.activeFilters = {
            status: 'all',
            type: 'all',
            date: 'all'
        };
        
        this.init();
    }

    /**
     * Initialize all Messages UI components
     */
    init() {
        this.initializeMessageThreadInterface();
        this.initializeRichMessageComposer();
        this.initializeVoiceMessages();
        this.initializeVideoCallInterface();
        this.initializeFileSharing();
        this.initializeMessageReactions();
        this.initializeMessageStatusIndicators();
        this.initializeMessageSearchFilters();
        
        console.log('Messages UI Components initialized');
    }

    // ========================================
    // 1. MESSAGE THREAD INTERFACE
    // ========================================

    /**
     * Initialize comprehensive message thread interface
     */
    initializeMessageThreadInterface() {
        // Listen for conversation selection
        document.addEventListener('click', (e) => {
            const conversationItem = e.target.closest('.conversation-item');
            if (conversationItem) {
                const conversationId = conversationItem.dataset.conversationId;
                this.openConversationThread(conversationId);
            }
        });

        // Initialize thread controls
        this.setupThreadControls();
    }

    /**
     * Open and display conversation thread
     */
    async openConversationThread(conversationId) {
        try {
            const messagesMain = document.getElementById('messages-main');
            if (!messagesMain) return;

            // Show loading state
            messagesMain.innerHTML = '<div class="thread-loading"><i class="fas fa-spinner fa-spin"></i> Loading conversation...</div>';

            // Simulate loading conversation data
            const conversation = await this.loadConversationData(conversationId);
            this.currentConversation = conversation;

            // Render thread interface
            messagesMain.innerHTML = this.createThreadInterface(conversation);

            // Setup thread event listeners
            this.setupThreadEventListeners();

            // Mark as read and clear notifications
            this.markConversationAsRead(conversationId);

            // Focus message input
            setTimeout(() => {
                const messageInput = document.getElementById('thread-message-input');
                if (messageInput) messageInput.focus();
            }, 300);

        } catch (error) {
            console.error('Failed to open conversation thread:', error);
            this.app.showToast('Failed to load conversation', 'error');
        }
    }

    /**
     * Create thread interface HTML
     */
    createThreadInterface(conversation) {
        return `
            <div class="message-thread">
                <!-- Thread Header -->
                <div class="thread-header">
                    <div class="thread-user-info">
                        <img src="${conversation.user.avatar}" alt="${conversation.user.name}" class="thread-user-avatar">
                        <div class="thread-user-details">
                            <h3>${conversation.user.name}</h3>
                            <div class="user-status">
                                <span class="status-indicator ${conversation.user.online ? 'online' : 'offline'}"></span>
                                <span class="status-text">${conversation.user.online ? 'Online' : `Last seen ${this.getTimeAgo(conversation.user.lastSeen)}`}</span>
                            </div>
                        </div>
                    </div>
                    <div class="thread-actions">
                        <button class="thread-action-btn" id="thread-video-call" title="Video Call">
                            <i class="fas fa-video"></i>
                        </button>
                        <button class="thread-action-btn" id="thread-voice-call" title="Voice Call">
                            <i class="fas fa-phone"></i>
                        </button>
                        <button class="thread-action-btn" id="thread-info" title="Conversation Info">
                            <i class="fas fa-info-circle"></i>
                        </button>
                        <button class="thread-action-btn" id="thread-settings" title="Thread Settings">
                            <i class="fas fa-cog"></i>
                        </button>
                    </div>
                </div>

                <!-- Messages Container -->
                <div class="messages-container" id="thread-messages">
                    <div class="messages-scroll-area">
                        ${conversation.messages.map(message => this.createMessageElement(message)).join('')}
                    </div>
                    <div class="typing-indicators-container" id="typing-indicators"></div>
                </div>

                <!-- Message Input Area -->
                <div class="message-input-area">
                    <div class="message-input-container">
                        <button class="input-action-btn" id="attach-file-btn" title="Attach File">
                            <i class="fas fa-paperclip"></i>
                        </button>
                        <button class="input-action-btn" id="voice-record-btn" title="Record Voice Message">
                            <i class="fas fa-microphone"></i>
                        </button>
                        <div class="message-input-wrapper">
                            <div class="message-input" 
                                 contenteditable="true" 
                                 id="thread-message-input" 
                                 data-placeholder="Type a message..."
                                 role="textbox"></div>
                            <button class="input-action-btn" id="emoji-picker-btn" title="Add Emoji">
                                <i class="fas fa-smile"></i>
                            </button>
                        </div>
                        <button class="send-message-btn" id="send-message-btn" disabled>
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="message-suggestions" id="message-suggestions"></div>
                </div>
            </div>
        `;
    }

    /**
     * Create individual message element
     */
    createMessageElement(message) {
        const isOwnMessage = message.senderId === this.app.currentUser?.id;
        const messageClass = isOwnMessage ? 'message sent' : 'message received';

        return `
            <div class="${messageClass}" data-message-id="${message.id}">
                ${!isOwnMessage ? `<img src="${message.sender.avatar}" alt="${message.sender.name}" class="message-avatar">` : ''}
                <div class="message-content">
                    ${this.renderMessageContent(message)}
                    <div class="message-metadata">
                        <span class="message-time">${this.formatMessageTime(message.timestamp)}</span>
                        ${isOwnMessage ? `<span class="message-status ${message.status}">${this.getMessageStatusIcon(message.status)}</span>` : ''}
                    </div>
                </div>
                <div class="message-actions">
                    <button class="message-action-btn" data-action="react" title="React">
                        <i class="fas fa-smile"></i>
                    </button>
                    <button class="message-action-btn" data-action="reply" title="Reply">
                        <i class="fas fa-reply"></i>
                    </button>
                    <button class="message-action-btn" data-action="forward" title="Forward">
                        <i class="fas fa-share"></i>
                    </button>
                    ${isOwnMessage ? `<button class="message-action-btn" data-action="delete" title="Delete"><i class="fas fa-trash"></i></button>` : ''}
                </div>
                ${message.reactions && message.reactions.length > 0 ? this.renderMessageReactions(message.reactions) : ''}
            </div>
        `;
    }

    /**
     * Setup thread event listeners
     */
    setupThreadEventListeners() {
        const messageInput = document.getElementById('thread-message-input');
        const sendBtn = document.getElementById('send-message-btn');

        // Message input handling
        if (messageInput) {
            messageInput.addEventListener('input', () => {
                this.handleMessageInput();
            });

            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Typing indicator
            let typingTimeout;
            messageInput.addEventListener('input', () => {
                this.showTypingIndicator();
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => {
                    this.hideTypingIndicator();
                }, 2000);
            });
        }

        // Send button
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Thread action buttons
        document.getElementById('thread-video-call')?.addEventListener('click', () => this.startVideoCall());
        document.getElementById('thread-voice-call')?.addEventListener('click', () => this.startVoiceCall());
        document.getElementById('thread-info')?.addEventListener('click', () => this.showThreadInfo());
        document.getElementById('thread-settings')?.addEventListener('click', () => this.showThreadSettings());

        // Message actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.message-action-btn')) {
                const actionBtn = e.target.closest('.message-action-btn');
                const action = actionBtn.dataset.action;
                const messageElement = actionBtn.closest('.message');
                const messageId = messageElement.dataset.messageId;
                this.handleMessageAction(messageId, action);
            }
        });
    }

    // ========================================
    // 2. RICH MESSAGE COMPOSER
    // ========================================

    /**
     * Initialize rich message composer with advanced features
     */
    initializeRichMessageComposer() {
        this.setupRichTextEditor();
        this.setupMessageFormatting();
        this.setupMessageScheduling();
        this.setupMessageTemplates();
    }

    /**
     * Setup rich text editor functionality
     */
    setupRichTextEditor() {
        // This will be initialized when a thread is opened
        document.addEventListener('thread-opened', () => {
            const messageInput = document.getElementById('thread-message-input');
            if (messageInput) {
                this.enhanceMessageInput(messageInput);
            }
        });
    }

    /**
     * Enhance message input with rich features
     */
    enhanceMessageInput(input) {
        // Add formatting toolbar
        const toolbar = this.createFormattingToolbar();
        input.parentElement.insertBefore(toolbar, input);

        // Handle formatting commands
        input.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'b':
                        e.preventDefault();
                        this.formatText('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.formatText('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.formatText('underline');
                        break;
                }
            }
        });

        // Auto-suggest mentions and hashtags
        input.addEventListener('input', (e) => {
            this.handleAutoSuggestions(e.target);
        });
    }

    /**
     * Create formatting toolbar for rich text
     */
    createFormattingToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'message-formatting-toolbar';
        toolbar.innerHTML = `
            <button type="button" class="format-btn" data-command="bold" title="Bold (Ctrl+B)">
                <i class="fas fa-bold"></i>
            </button>
            <button type="button" class="format-btn" data-command="italic" title="Italic (Ctrl+I)">
                <i class="fas fa-italic"></i>
            </button>
            <button type="button" class="format-btn" data-command="underline" title="Underline (Ctrl+U)">
                <i class="fas fa-underline"></i>
            </button>
            <div class="toolbar-divider"></div>
            <button type="button" class="format-btn" data-command="link" title="Add Link">
                <i class="fas fa-link"></i>
            </button>
            <button type="button" class="format-btn" data-command="code" title="Code Block">
                <i class="fas fa-code"></i>
            </button>
            <button type="button" class="format-btn" data-command="quote" title="Quote">
                <i class="fas fa-quote-left"></i>
            </button>
        `;

        // Add toolbar event listeners
        toolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('.format-btn');
            if (btn) {
                const command = btn.dataset.command;
                this.formatText(command);
            }
        });

        return toolbar;
    }

    /**
     * Format text in message input
     */
    formatText(command) {
        const input = document.getElementById('thread-message-input');
        if (!input) return;

        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;

        switch (command) {
            case 'bold':
                document.execCommand('bold');
                break;
            case 'italic':
                document.execCommand('italic');
                break;
            case 'underline':
                document.execCommand('underline');
                break;
            case 'link':
                const url = prompt('Enter URL:');
                if (url) document.execCommand('createLink', false, url);
                break;
            case 'code':
                this.wrapSelection('`', '`');
                break;
            case 'quote':
                this.wrapSelection('> ', '');
                break;
        }
    }

    /**
     * Handle auto-suggestions for mentions and hashtags
     */
    handleAutoSuggestions(input) {
        const text = input.textContent;
        const cursorPos = this.getCursorPosition(input);
        const textBeforeCursor = text.substring(0, cursorPos);
        
        // Check for @mentions
        const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
        if (mentionMatch) {
            this.showMentionSuggestions(mentionMatch[1]);
            return;
        }

        // Check for #hashtags
        const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
        if (hashtagMatch) {
            this.showHashtagSuggestions(hashtagMatch[1]);
            return;
        }

        // Hide suggestions if no match
        this.hideSuggestions();
    }

    /**
     * Show mention suggestions
     */
    showMentionSuggestions(query) {
        const suggestions = this.getMentionSuggestions(query);
        const suggestionsContainer = document.getElementById('message-suggestions');
        
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        suggestionsContainer.innerHTML = `
            <div class="suggestions-popup mentions">
                <div class="suggestions-header">Mention someone</div>
                <div class="suggestions-list">
                    ${suggestions.map(user => `
                        <div class="suggestion-item" data-user-id="${user.id}" data-type="mention">
                            <img src="${user.avatar}" alt="${user.name}" class="suggestion-avatar">
                            <div class="suggestion-info">
                                <div class="suggestion-name">${user.name}</div>
                                <div class="suggestion-username">@${user.username}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.setupSuggestionListeners();
    }

    // ========================================
    // 3. VOICE MESSAGES INTERFACE
    // ========================================

    /**
     * Initialize voice messages functionality
     */
    initializeVoiceMessages() {
        this.setupVoiceRecording();
        this.setupVoicePlayback();
    }

    /**
     * Setup voice recording capabilities
     */
    setupVoiceRecording() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#voice-record-btn')) {
                this.toggleVoiceRecording();
            }
        });
    }

    /**
     * Toggle voice recording
     */
    async toggleVoiceRecording() {
        if (this.voiceRecorder && this.voiceRecorder.state === 'recording') {
            this.stopVoiceRecording();
        } else {
            await this.startVoiceRecording();
        }
    }

    /**
     * Start voice recording
     */
    async startVoiceRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.voiceRecorder = new MediaRecorder(stream);
            const audioChunks = [];

            this.voiceRecorder.addEventListener('dataavailable', (event) => {
                audioChunks.push(event.data);
            });

            this.voiceRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                this.handleVoiceRecordingComplete(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            });

            this.voiceRecorder.start();
            this.showVoiceRecordingInterface();
            this.app.showToast('Recording voice message...', 'info');

        } catch (error) {
            console.error('Failed to start voice recording:', error);
            this.app.showToast('Could not access microphone', 'error');
        }
    }

    /**
     * Show voice recording interface
     */
    showVoiceRecordingInterface() {
        const voiceBtn = document.getElementById('voice-record-btn');
        const messageInputArea = document.querySelector('.message-input-area');
        
        if (!voiceBtn || !messageInputArea) return;

        // Create voice recording UI
        const recordingUI = document.createElement('div');
        recordingUI.className = 'voice-recording-interface';
        recordingUI.innerHTML = `
            <div class="recording-controls">
                <div class="recording-animation">
                    <div class="recording-dot"></div>
                    <div class="recording-waves">
                        <div class="wave"></div>
                        <div class="wave"></div>
                        <div class="wave"></div>
                    </div>
                </div>
                <div class="recording-info">
                    <span class="recording-time" id="recording-timer">0:00</span>
                    <span class="recording-text">Recording voice message</span>
                </div>
                <div class="recording-actions">
                    <button class="cancel-recording-btn" id="cancel-voice-recording">
                        <i class="fas fa-times"></i>
                        Cancel
                    </button>
                    <button class="stop-recording-btn" id="stop-voice-recording">
                        <i class="fas fa-stop"></i>
                        Send
                    </button>
                </div>
            </div>
        `;

        messageInputArea.appendChild(recordingUI);

        // Start recording timer
        this.startRecordingTimer();

        // Setup recording controls
        document.getElementById('cancel-voice-recording')?.addEventListener('click', () => {
            this.cancelVoiceRecording();
        });

        document.getElementById('stop-voice-recording')?.addEventListener('click', () => {
            this.stopVoiceRecording();
        });
    }

    /**
     * Start recording timer
     */
    startRecordingTimer() {
        this.recordingStartTime = Date.now();
        this.recordingTimer = setInterval(() => {
            const elapsed = Date.now() - this.recordingStartTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const displaySeconds = seconds % 60;
            
            const timerElement = document.getElementById('recording-timer');
            if (timerElement) {
                timerElement.textContent = `${minutes}:${displaySeconds.toString().padStart(2, '0')}`;
            }

            // Auto-stop after 5 minutes
            if (elapsed > 300000) {
                this.stopVoiceRecording();
            }
        }, 1000);
    }

    /**
     * Stop voice recording
     */
    stopVoiceRecording() {
        if (this.voiceRecorder && this.voiceRecorder.state === 'recording') {
            this.voiceRecorder.stop();
        }
        this.cleanupVoiceRecording();
    }

    /**
     * Cancel voice recording
     */
    cancelVoiceRecording() {
        if (this.voiceRecorder && this.voiceRecorder.state === 'recording') {
            this.voiceRecorder.stop();
        }
        this.cleanupVoiceRecording();
        this.app.showToast('Voice recording cancelled', 'info');
    }

    /**
     * Cleanup voice recording UI
     */
    cleanupVoiceRecording() {
        const recordingUI = document.querySelector('.voice-recording-interface');
        if (recordingUI) {
            recordingUI.remove();
        }

        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    /**
     * Handle voice recording completion
     */
    handleVoiceRecordingComplete(audioBlob) {
        const duration = (Date.now() - this.recordingStartTime) / 1000;
        
        // Create voice message object
        const voiceMessage = {
            type: 'voice',
            blob: audioBlob,
            duration: Math.round(duration),
            url: URL.createObjectURL(audioBlob)
        };

        this.sendVoiceMessage(voiceMessage);
    }

    /**
     * Send voice message
     */
    async sendVoiceMessage(voiceMessage) {
        try {
            // Create message object
            const message = {
                id: `msg-${Date.now()}`,
                conversationId: this.currentConversation.id,
                senderId: this.app.currentUser.id,
                sender: {
                    id: this.app.currentUser.id,
                    name: this.app.currentUser.name,
                    avatar: this.app.currentUser.avatar
                },
                type: 'voice',
                content: '',
                voiceData: voiceMessage,
                timestamp: new Date(),
                status: 'sending'
            };

            // Add to conversation
            this.addMessageToThread(message);
            this.app.showToast('Voice message sent', 'success');

            // Simulate API call
            setTimeout(() => {
                message.status = 'delivered';
                this.updateMessageStatus(message.id, 'delivered');
            }, 1000);

        } catch (error) {
            console.error('Failed to send voice message:', error);
            this.app.showToast('Failed to send voice message', 'error');
        }
    }

    // ========================================
    // 4. VIDEO CALL INTERFACE
    // ========================================

    /**
     * Initialize video call interface
     */
    initializeVideoCallInterface() {
        this.setupCallControls();
        this.setupCallNotifications();
    }

    /**
     * Start video call
     */
    async startVideoCall() {
        try {
            if (!this.currentConversation) return;

            this.app.showToast(`Starting video call with ${this.currentConversation.user.name}...`, 'info');
            
            // Create video call interface
            this.createVideoCallInterface();
            
        } catch (error) {
            console.error('Failed to start video call:', error);
            this.app.showToast('Failed to start video call', 'error');
        }
    }

    /**
     * Create video call interface
     */
    createVideoCallInterface() {
        const callInterface = document.createElement('div');
        callInterface.id = 'video-call-interface';
        callInterface.className = 'video-call-interface';
        callInterface.innerHTML = `
            <div class="call-container">
                <div class="call-header">
                    <div class="call-user-info">
                        <img src="${this.currentConversation.user.avatar}" alt="${this.currentConversation.user.name}" class="call-avatar">
                        <div class="call-details">
                            <h3>${this.currentConversation.user.name}</h3>
                            <span class="call-status">Calling...</span>
                        </div>
                    </div>
                    <div class="call-duration" id="call-duration">00:00</div>
                </div>

                <div class="video-streams">
                    <div class="remote-video-container">
                        <video id="remote-video" autoplay playsinline></video>
                        <div class="video-placeholder">
                            <img src="${this.currentConversation.user.avatar}" alt="${this.currentConversation.user.name}" class="placeholder-avatar">
                            <div class="connecting-animation">
                                <div class="pulse-ring"></div>
                                <div class="pulse-ring delay-1"></div>
                                <div class="pulse-ring delay-2"></div>
                            </div>
                        </div>
                    </div>
                    <div class="local-video-container">
                        <video id="local-video" autoplay playsinline muted></video>
                        <div class="video-controls-overlay">
                            <button class="video-control-btn" id="toggle-camera" title="Toggle Camera">
                                <i class="fas fa-video"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="call-controls">
                    <button class="call-control-btn mute-btn" id="toggle-audio" title="Mute/Unmute">
                        <i class="fas fa-microphone"></i>
                    </button>
                    <button class="call-control-btn camera-btn" id="toggle-video" title="Camera On/Off">
                        <i class="fas fa-video"></i>
                    </button>
                    <button class="call-control-btn screen-share-btn" id="share-screen" title="Share Screen">
                        <i class="fas fa-desktop"></i>
                    </button>
                    <button class="call-control-btn chat-btn" id="call-chat" title="Chat">
                        <i class="fas fa-comment"></i>
                    </button>
                    <button class="call-control-btn end-call-btn" id="end-call" title="End Call">
                        <i class="fas fa-phone-slash"></i>
                    </button>
                </div>

                <div class="call-chat-sidebar" id="call-chat-sidebar">
                    <div class="call-chat-header">
                        <h4>Chat</h4>
                        <button class="close-call-chat" id="close-call-chat">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="call-chat-messages" id="call-chat-messages"></div>
                    <div class="call-chat-input">
                        <input type="text" placeholder="Type a message..." id="call-chat-input">
                        <button id="send-call-message"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(callInterface);
        this.setupVideoCallControls();
        this.simulateVideoCall();
    }

    /**
     * Setup video call controls
     */
    setupVideoCallControls() {
        const controls = {
            'toggle-audio': () => this.toggleCallAudio(),
            'toggle-video': () => this.toggleCallVideo(),
            'share-screen': () => this.shareScreen(),
            'call-chat': () => this.toggleCallChat(),
            'end-call': () => this.endCall()
        };

        Object.keys(controls).forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', controls[id]);
            }
        });
    }

    /**
     * Simulate video call progression
     */
    simulateVideoCall() {
        this.videoCallActive = true;
        let callDuration = 0;

        // Simulate call connecting
        setTimeout(() => {
            const status = document.querySelector('.call-status');
            if (status) {
                status.textContent = 'Connected';
                status.style.color = '#10b981';
            }
        }, 3000);

        // Start call timer
        this.callTimer = setInterval(() => {
            callDuration++;
            const minutes = Math.floor(callDuration / 60);
            const seconds = callDuration % 60;
            const duration = document.getElementById('call-duration');
            if (duration) {
                duration.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    /**
     * End video call
     */
    endCall() {
        this.videoCallActive = false;
        
        if (this.callTimer) {
            clearInterval(this.callTimer);
        }

        const callInterface = document.getElementById('video-call-interface');
        if (callInterface) {
            callInterface.remove();
        }

        this.app.showToast('Call ended', 'info');
    }

    // ========================================
    // 5. FILE SHARING INTERFACE
    // ========================================

    /**
     * Initialize file sharing capabilities
     */
    initializeFileSharing() {
        this.setupFileAttachment();
        this.setupFileDragDrop();
        this.setupFilePreview();
    }

    /**
     * Setup file attachment functionality
     */
    setupFileAttachment() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#attach-file-btn')) {
                this.openFileSelector();
            }
        });
    }

    /**
     * Open file selector for attachments
     */
    openFileSelector() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = '*/*';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFileSelection(files);
        });

        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }

    /**
     * Handle file selection and upload
     */
    async handleFileSelection(files) {
        const maxFileSize = 25 * 1024 * 1024; // 25MB limit
        const validFiles = files.filter(file => {
            if (file.size > maxFileSize) {
                this.app.showToast(`File ${file.name} is too large (max 25MB)`, 'warning');
                return false;
            }
            return true;
        });

        for (const file of validFiles) {
            await this.sendFileMessage(file);
        }
    }

    /**
     * Send file message
     */
    async sendFileMessage(file) {
        try {
            const message = {
                id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                conversationId: this.currentConversation.id,
                senderId: this.app.currentUser.id,
                sender: {
                    id: this.app.currentUser.id,
                    name: this.app.currentUser.name,
                    avatar: this.app.currentUser.avatar
                },
                type: 'file',
                content: `Shared a file: ${file.name}`,
                fileData: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: URL.createObjectURL(file)
                },
                timestamp: new Date(),
                status: 'sending'
            };

            this.addMessageToThread(message);
            this.app.showToast(`File ${file.name} sent`, 'success');

        } catch (error) {
            console.error('Failed to send file:', error);
            this.app.showToast('Failed to send file', 'error');
        }
    }

    // ========================================
    // 6. MESSAGE REACTIONS INTERFACE
    // ========================================

    /**
     * Initialize message reactions system
     */
    initializeMessageReactions() {
        this.setupReactionPicker();
        this.setupReactionHandling();
    }

    /**
     * Setup reaction picker
     */
    setupReactionPicker() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="react"]')) {
                const messageElement = e.target.closest('.message');
                const messageId = messageElement.dataset.messageId;
                this.showReactionPicker(messageId, e.target.closest('[data-action="react"]'));
            }
        });
    }

    /**
     * Show reaction picker for message
     */
    showReactionPicker(messageId, triggerElement) {
        // Remove existing picker
        const existingPicker = document.getElementById('reaction-picker');
        if (existingPicker) existingPicker.remove();

        const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '👏'];
        
        const picker = document.createElement('div');
        picker.id = 'reaction-picker';
        picker.className = 'reaction-picker';
        picker.innerHTML = `
            <div class="reaction-picker-content">
                <div class="reactions-list">
                    ${reactions.map(emoji => `
                        <button class="reaction-btn" data-reaction="${emoji}" data-message-id="${messageId}">
                            ${emoji}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Position picker
        const rect = triggerElement.getBoundingClientRect();
        picker.style.position = 'fixed';
        picker.style.top = (rect.top - 60) + 'px';
        picker.style.left = rect.left + 'px';
        picker.style.zIndex = '10000';

        document.body.appendChild(picker);

        // Setup reaction selection
        picker.addEventListener('click', (e) => {
            const reactionBtn = e.target.closest('.reaction-btn');
            if (reactionBtn) {
                const reaction = reactionBtn.dataset.reaction;
                const msgId = reactionBtn.dataset.messageId;
                this.addReactionToMessage(msgId, reaction);
                picker.remove();
            }
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
            if (document.body.contains(picker)) {
                picker.remove();
            }
        }, 5000);
    }

    /**
     * Add reaction to message
     */
    addReactionToMessage(messageId, reaction) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;

        let reactionsContainer = messageElement.querySelector('.message-reactions');
        if (!reactionsContainer) {
            reactionsContainer = document.createElement('div');
            reactionsContainer.className = 'message-reactions';
            messageElement.querySelector('.message-content').appendChild(reactionsContainer);
        }

        // Check if user already reacted with this emoji
        const existingReaction = reactionsContainer.querySelector(`[data-reaction="${reaction}"]`);
        if (existingReaction) {
            const count = parseInt(existingReaction.querySelector('.reaction-count').textContent) + 1;
            existingReaction.querySelector('.reaction-count').textContent = count;
        } else {
            const reactionElement = document.createElement('span');
            reactionElement.className = 'reaction-item';
            reactionElement.dataset.reaction = reaction;
            reactionElement.innerHTML = `
                <span class="reaction-emoji">${reaction}</span>
                <span class="reaction-count">1</span>
            `;
            reactionsContainer.appendChild(reactionElement);
        }

        this.app.showToast('Reaction added', 'success');
    }

    // ========================================
    // 7. MESSAGE STATUS INDICATORS
    // ========================================

    /**
     * Initialize message status indicators
     */
    initializeMessageStatusIndicators() {
        this.setupStatusTracking();
        this.setupReadReceipts();
    }

    /**
     * Get message status icon
     */
    getMessageStatusIcon(status) {
        switch (status) {
            case 'sending':
                return '<i class="fas fa-clock" title="Sending"></i>';
            case 'sent':
                return '<i class="fas fa-check" title="Sent"></i>';
            case 'delivered':
                return '<i class="fas fa-check-double" title="Delivered"></i>';
            case 'read':
                return '<i class="fas fa-check-double read" title="Read"></i>';
            default:
                return '';
        }
    }

    /**
     * Update message status
     */
    updateMessageStatus(messageId, status) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const statusElement = messageElement.querySelector('.message-status');
            if (statusElement) {
                statusElement.className = `message-status ${status}`;
                statusElement.innerHTML = this.getMessageStatusIcon(status);
            }
        }
    }

    // ========================================
    // 8. MESSAGE SEARCH & FILTERS
    // ========================================

    /**
     * Initialize comprehensive message search and filtering
     */
    initializeMessageSearchFilters() {
        this.setupAdvancedSearch();
        this.setupConversationFilters();
        this.setupSearchHistory();
    }

    /**
     * Setup advanced search functionality
     */
    setupAdvancedSearch() {
        const messageSearch = document.getElementById('message-search');
        if (messageSearch) {
            // Replace basic search with advanced search
            const searchContainer = messageSearch.parentElement;
            searchContainer.innerHTML = `
                <div class="advanced-message-search">
                    <div class="search-input-container">
                        <input type="text" id="message-search" placeholder="Search messages..." class="search-input">
                        <button class="search-filters-btn" id="search-filters-toggle" title="Advanced Filters">
                            <i class="fas fa-filter"></i>
                        </button>
                    </div>
                    <div class="search-filters-panel" id="search-filters-panel">
                        <div class="filter-section">
                            <label>Message Type:</label>
                            <select class="filter-select" id="message-type-filter">
                                <option value="all">All Messages</option>
                                <option value="text">Text</option>
                                <option value="image">Images</option>
                                <option value="video">Videos</option>
                                <option value="voice">Voice Messages</option>
                                <option value="file">Files</option>
                            </select>
                        </div>
                        <div class="filter-section">
                            <label>From:</label>
                            <select class="filter-select" id="sender-filter">
                                <option value="all">Anyone</option>
                                <option value="me">Me</option>
                                <option value="others">Others</option>
                            </select>
                        </div>
                        <div class="filter-section">
                            <label>Date Range:</label>
                            <select class="filter-select" id="date-filter">
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                        <div class="filter-actions">
                            <button class="apply-filters-btn" id="apply-search-filters">Apply</button>
                            <button class="clear-filters-btn" id="clear-search-filters">Clear</button>
                        </div>
                    </div>
                </div>
            `;

            this.setupSearchEventListeners();
        }
    }

    /**
     * Setup search event listeners
     */
    setupSearchEventListeners() {
        const searchInput = document.getElementById('message-search');
        const filtersToggle = document.getElementById('search-filters-toggle');
        const filtersPanel = document.getElementById('search-filters-panel');

        // Search input with debounce
        let searchTimeout;
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performMessageSearch(e.target.value);
            }, 300);
        });

        // Filters toggle
        filtersToggle?.addEventListener('click', () => {
            filtersPanel.classList.toggle('show');
        });

        // Apply filters
        document.getElementById('apply-search-filters')?.addEventListener('click', () => {
            this.applySearchFilters();
        });

        // Clear filters
        document.getElementById('clear-search-filters')?.addEventListener('click', () => {
            this.clearSearchFilters();
        });
    }

    /**
     * Perform message search across conversations
     */
    async performMessageSearch(query) {
        if (!query.trim()) {
            this.clearSearchResults();
            return;
        }

        try {
            // Add to search history
            if (!this.searchHistory.includes(query)) {
                this.searchHistory.unshift(query);
                if (this.searchHistory.length > 10) {
                    this.searchHistory = this.searchHistory.slice(0, 10);
                }
            }

            // Perform search with current filters
            const results = await this.searchMessages(query);
            this.displaySearchResults(results, query);

        } catch (error) {
            console.error('Search failed:', error);
            this.app.showToast('Search failed', 'error');
        }
    }

    /**
     * Search messages with filters
     */
    async searchMessages(query) {
        // Simulate API call with filters
        const mockResults = [
            {
                conversationId: 'conv-1',
                conversationName: 'Emma Watson',
                avatar: 'https://via.placeholder.com/40x40/42b72a/ffffff?text=EW',
                messages: [
                    {
                        id: 'msg-search-1',
                        content: `Thanks for the photography tips! The ${query} technique really works.`,
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                        type: 'text'
                    }
                ]
            },
            {
                conversationId: 'conv-2',
                conversationName: 'Alex Johnson',
                avatar: 'https://via.placeholder.com/40x40/ff6b6b/ffffff?text=AJ',
                messages: [
                    {
                        id: 'msg-search-2',
                        content: `The ${query} from our hike was incredible!`,
                        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
                        type: 'text'
                    }
                ]
            }
        ];

        return mockResults;
    }

    /**
     * Display search results
     */
    displaySearchResults(results, query) {
        const conversationsList = document.getElementById('conversations-list');
        if (!conversationsList) return;

        conversationsList.innerHTML = `
            <div class="search-results">
                <div class="search-results-header">
                    <h4>Search Results for "${query}"</h4>
                    <span class="results-count">${results.length} conversation(s) found</span>
                </div>
                ${results.map(result => `
                    <div class="search-result-item">
                        <div class="conversation-header">
                            <img src="${result.avatar}" alt="${result.conversationName}" class="user-avatar small">
                            <span class="conversation-name">${result.conversationName}</span>
                        </div>
                        <div class="matching-messages">
                            ${result.messages.map(message => `
                                <div class="message-preview" data-message-id="${message.id}">
                                    <div class="message-text">${this.highlightSearchTerms(message.content, query)}</div>
                                    <div class="message-time">${this.app.getTimeAgo(message.timestamp)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                <button class="clear-search-btn" onclick="messagesUI.clearSearchResults()">
                    <i class="fas fa-times"></i> Clear Search
                </button>
            </div>
        `;
    }

    /**
     * Highlight search terms in results
     */
    highlightSearchTerms(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    /**
     * Clear search results
     */
    clearSearchResults() {
        document.getElementById('message-search').value = '';
        this.app.loadConversations(); // Reload normal conversations list
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    /**
     * Load conversation data
     */
    async loadConversationData(conversationId) {
        // Check cache first
        if (this.conversationsCache.has(conversationId)) {
            return this.conversationsCache.get(conversationId);
        }

        // Simulate API call
        const mockConversation = {
            id: conversationId,
            user: {
                id: 'user-2',
                name: 'Emma Watson',
                avatar: 'https://via.placeholder.com/40x40/42b72a/ffffff?text=EW',
                online: true,
                lastSeen: new Date()
            },
            messages: [
                {
                    id: 'msg-1',
                    senderId: 'user-2',
                    sender: {
                        id: 'user-2',
                        name: 'Emma Watson',
                        avatar: 'https://via.placeholder.com/40x40/42b72a/ffffff?text=EW'
                    },
                    content: 'Hey! How are you doing?',
                    type: 'text',
                    timestamp: new Date(Date.now() - 60 * 60 * 1000),
                    status: 'read'
                },
                {
                    id: 'msg-2',
                    senderId: this.app.currentUser.id,
                    sender: this.app.currentUser,
                    content: 'Hi Emma! I\'m doing great, thanks for asking. How about you?',
                    type: 'text',
                    timestamp: new Date(Date.now() - 45 * 60 * 1000),
                    status: 'read'
                },
                {
                    id: 'msg-3',
                    senderId: 'user-2',
                    sender: {
                        id: 'user-2',
                        name: 'Emma Watson',
                        avatar: 'https://via.placeholder.com/40x40/42b72a/ffffff?text=EW'
                    },
                    content: 'Thanks for the photography tips! 📸',
                    type: 'text',
                    timestamp: new Date(Date.now() - 30 * 60 * 1000),
                    status: 'delivered',
                    reactions: [
                        { emoji: '👍', users: [this.app.currentUser.id], count: 1 }
                    ]
                }
            ]
        };

        // Cache conversation
        this.conversationsCache.set(conversationId, mockConversation);
        return mockConversation;
    }

    /**
     * Render message content based on type
     */
    renderMessageContent(message) {
        switch (message.type) {
            case 'text':
                return `<div class="message-text">${this.formatMessageText(message.content)}</div>`;
            
            case 'voice':
                return `
                    <div class="voice-message">
                        <button class="play-voice-btn" data-audio-url="${message.voiceData.url}">
                            <i class="fas fa-play"></i>
                        </button>
                        <div class="voice-waveform">
                            <div class="voice-duration">${message.voiceData.duration}s</div>
                            <div class="waveform-bars">
                                ${Array.from({length: 20}, () => '<div class="wave-bar"></div>').join('')}
                            </div>
                        </div>
                    </div>
                `;
            
            case 'file':
                return `
                    <div class="file-message">
                        <div class="file-icon">
                            <i class="fas ${this.getFileIcon(message.fileData.type)}"></i>
                        </div>
                        <div class="file-info">
                            <div class="file-name">${message.fileData.name}</div>
                            <div class="file-size">${this.formatFileSize(message.fileData.size)}</div>
                        </div>
                        <button class="download-file-btn" data-file-url="${message.fileData.url}">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                `;
            
            case 'image':
                return `
                    <div class="image-message">
                        <img src="${message.imageUrl}" alt="Shared image" class="message-image" loading="lazy">
                    </div>
                `;
            
            default:
                return `<div class="message-text">${message.content}</div>`;
        }
    }

    /**
     * Format message text (handle links, mentions, etc.)
     */
    formatMessageText(text) {
        // Convert URLs to links
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
        
        // Convert mentions
        text = text.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
        
        // Convert hashtags
        text = text.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
        
        return text;
    }

    /**
     * Format message timestamp
     */
    formatMessageTime(timestamp) {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInHours = (now - messageTime) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 168) { // Within a week
            return messageTime.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
        } else {
            return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
    }

    /**
     * Get file icon based on file type
     */
    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return 'fa-image';
        if (fileType.startsWith('video/')) return 'fa-video';
        if (fileType.startsWith('audio/')) return 'fa-music';
        if (fileType.includes('pdf')) return 'fa-file-pdf';
        if (fileType.includes('word')) return 'fa-file-word';
        if (fileType.includes('excel')) return 'fa-file-excel';
        if (fileType.includes('powerpoint')) return 'fa-file-powerpoint';
        if (fileType.includes('zip') || fileType.includes('rar')) return 'fa-file-archive';
        return 'fa-file';
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Get time ago string
     */
    getTimeAgo(date) {
        return this.app.getTimeAgo(date);
    }

    /**
     * Handle message input changes
     */
    handleMessageInput() {
        const input = document.getElementById('thread-message-input');
        const sendBtn = document.getElementById('send-message-btn');
        
        if (input && sendBtn) {
            const hasContent = input.textContent.trim().length > 0;
            sendBtn.disabled = !hasContent;
            sendBtn.classList.toggle('active', hasContent);
        }
    }

    /**
     * Send text message
     */
    async sendMessage() {
        const input = document.getElementById('thread-message-input');
        const content = input?.textContent.trim();
        
        if (!content || !this.currentConversation) return;

        try {
            const message = {
                id: `msg-${Date.now()}`,
                conversationId: this.currentConversation.id,
                senderId: this.app.currentUser.id,
                sender: {
                    id: this.app.currentUser.id,
                    name: this.app.currentUser.name,
                    avatar: this.app.currentUser.avatar
                },
                content: content,
                type: 'text',
                timestamp: new Date(),
                status: 'sending'
            };

            // Clear input
            input.textContent = '';
            this.handleMessageInput();

            // Add to thread
            this.addMessageToThread(message);

            // Simulate API call
            setTimeout(() => {
                message.status = 'delivered';
                this.updateMessageStatus(message.id, 'delivered');
            }, 1000);

        } catch (error) {
            console.error('Failed to send message:', error);
            this.app.showToast('Failed to send message', 'error');
        }
    }

    /**
     * Add message to thread
     */
    addMessageToThread(message) {
        const messagesContainer = document.querySelector('.messages-scroll-area');
        if (!messagesContainer) return;

        const messageElement = this.createMessageElement(message);
        messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Mark conversation as read
     */
    markConversationAsRead(conversationId) {
        const conversationItem = document.querySelector(`[data-conversation-id="${conversationId}"]`);
        if (conversationItem) {
            const unreadBadge = conversationItem.querySelector('.unread-badge');
            if (unreadBadge) {
                unreadBadge.style.display = 'none';
            }
        }
    }

    /**
     * Handle message actions (react, reply, forward, delete)
     */
    handleMessageAction(messageId, action) {
        switch (action) {
            case 'react':
                // Already handled by reaction picker
                break;
            case 'reply':
                this.replyToMessage(messageId);
                break;
            case 'forward':
                this.forwardMessage(messageId);
                break;
            case 'delete':
                this.deleteMessage(messageId);
                break;
        }
    }

    /**
     * Reply to specific message
     */
    replyToMessage(messageId) {
        const input = document.getElementById('thread-message-input');
        if (input) {
            input.focus();
            // Add reply indicator
            const replyIndicator = document.createElement('div');
            replyIndicator.className = 'reply-indicator';
            replyIndicator.innerHTML = `
                <i class="fas fa-reply"></i>
                Replying to message
                <button class="cancel-reply-btn" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            input.parentElement.insertBefore(replyIndicator, input);
        }
        this.app.showToast('Reply mode activated', 'info');
    }

    /**
     * Forward message
     */
    forwardMessage(messageId) {
        this.app.showToast('Message forwarding coming soon', 'info');
    }

    /**
     * Delete message
     */
    deleteMessage(messageId) {
        if (confirm('Are you sure you want to delete this message?')) {
            const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement) {
                messageElement.remove();
                this.app.showToast('Message deleted', 'success');
            }
        }
    }

    /**
     * Show thread info
     */
    showThreadInfo() {
        if (!this.currentConversation) return;

        const infoModal = this.createThreadInfoModal();
        document.body.appendChild(infoModal);
        this.app.openModal('thread-info-modal');
    }

    /**
     * Create thread info modal
     */
    createThreadInfoModal() {
        const modal = document.createElement('div');
        modal.id = 'thread-info-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Conversation Info</h3>
                    <button class="close-modal" onclick="connectHub.closeModal('thread-info-modal'); this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="thread-info-content">
                        <div class="thread-user-profile">
                            <img src="${this.currentConversation.user.avatar}" alt="${this.currentConversation.user.name}" class="user-avatar large">
                            <h3>${this.currentConversation.user.name}</h3>
                            <p class="user-status">${this.currentConversation.user.online ? 'Online now' : 'Offline'}</p>
                        </div>
                        <div class="thread-stats">
                            <div class="stat-item">
                                <i class="fas fa-comments"></i>
                                <span>156 messages</span>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-image"></i>
                                <span>23 photos</span>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-paperclip"></i>
                                <span>8 files</span>
                            </div>
                        </div>
                        <div class="thread-actions">
                            <button class="thread-info-btn">
                                <i class="fas fa-bell-slash"></i>
                                Mute Notifications
                            </button>
                            <button class="thread-info-btn">
                                <i class="fas fa-archive"></i>
                                Archive Conversation
                            </button>
                            <button class="thread-info-btn danger">
                                <i class="fas fa-trash"></i>
                                Delete Conversation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return modal;
    }

    /**
     * Setup thread controls
     */
    setupThreadControls() {
        // Message input placeholder enhancement
        document.addEventListener('focus', (e) => {
            if (e.target.id === 'thread-message-input') {
                e.target.dataset.placeholder = 'Type a message... Press Enter to send';
            }
        }, true);

        document.addEventListener('blur', (e) => {
            if (e.target.id === 'thread-message-input') {
                e.target.dataset.placeholder = 'Type a message...';
            }
        }, true);
    }

    /**
     * Setup message formatting
     */
    setupMessageFormatting() {
        this.messageTemplates = [
            { text: "Thanks for reaching out!", category: "professional" },
            { text: "Looking forward to hearing from you!", category: "professional" },
            { text: "Have a great day! 😊", category: "casual" },
            { text: "Let me know if you have any questions.", category: "professional" },
            { text: "Sounds good to me!", category: "casual" }
        ];
    }

    /**
     * Setup message scheduling
     */
    setupMessageScheduling() {
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('#thread-message-input')) {
                e.preventDefault();
                this.showMessageContextMenu(e);
            }
        });
    }

    /**
     * Setup message templates
     */
    setupMessageTemplates() {
        // Templates will be available in context menu
    }

    /**
     * Setup voice playback
     */
    setupVoicePlayback() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.play-voice-btn')) {
                const btn = e.target.closest('.play-voice-btn');
                this.playVoiceMessage(btn);
            }
        });
    }

    /**
     * Setup call controls
     */
    setupCallControls() {
        // Voice call functionality
        this.voiceCallActive = false;
    }

    /**
     * Start voice call
     */
    async startVoiceCall() {
        if (!this.currentConversation) return;
        this.app.showToast(`Starting voice call with ${this.currentConversation.user.name}...`, 'info');
    }

    /**
     * Setup call notifications
     */
    setupCallNotifications() {
        // Handle incoming call notifications
    }

    /**
     * Setup file drag and drop
     */
    setupFileDragDrop() {
        const messagesMain = document.getElementById('messages-main');
        if (messagesMain) {
            messagesMain.addEventListener('dragover', (e) => {
                e.preventDefault();
                messagesMain.classList.add('drag-over');
            });

            messagesMain.addEventListener('dragleave', () => {
                messagesMain.classList.remove('drag-over');
            });

            messagesMain.addEventListener('drop', (e) => {
                e.preventDefault();
                messagesMain.classList.remove('drag-over');
                const files = Array.from(e.dataTransfer.files);
                this.handleFileSelection(files);
            });
        }
    }

    /**
     * Setup file preview
     */
    setupFilePreview() {
        // File preview functionality for images and documents
    }

    /**
     * Setup reaction handling
     */
    setupReactionHandling() {
        // Additional reaction handling functionality
    }

    /**
     * Setup status tracking
     */
    setupStatusTracking() {
        // Track message read status
    }

    /**
     * Setup read receipts
     */
    setupReadReceipts() {
        // Handle read receipt functionality
    }

    /**
     * Setup conversation filters
     */
    setupConversationFilters() {
        // Enhanced conversation filtering
        this.addConversationFilters();
    }

    /**
     * Add conversation filters to sidebar
     */
    addConversationFilters() {
        const messagesHeader = document.querySelector('.messages-header');
        if (messagesHeader) {
            const filtersContainer = document.createElement('div');
            filtersContainer.className = 'conversation-filters';
            filtersContainer.innerHTML = `
                <div class="filter-tabs">
                    <button class="filter-tab active" data-filter="all">All</button>
                    <button class="filter-tab" data-filter="unread">Unread</button>
                    <button class="filter-tab" data-filter="archived">Archived</button>
                    <button class="filter-tab" data-filter="groups">Groups</button>
                </div>
            `;
            
            messagesHeader.appendChild(filtersContainer);

            // Add filter event listeners
            filtersContainer.addEventListener('click', (e) => {
                const tab = e.target.closest('.filter-tab');
                if (tab) {
                    this.filterConversations(tab.dataset.filter);
                    this.updateFilterTabs(tab);
                }
            });
        }
    }

    /**
     * Setup search history
     */
    setupSearchHistory() {
        // Initialize search history functionality
    }

    /**
     * Apply search filters
     */
    applySearchFilters() {
        const typeFilter = document.getElementById('message-type-filter')?.value;
        const senderFilter = document.getElementById('sender-filter')?.value;
        const dateFilter = document.getElementById('date-filter')?.value;

        this.activeFilters = {
            type: typeFilter || 'all',
            sender: senderFilter || 'all',
            date: dateFilter || 'all'
        };

        const currentQuery = document.getElementById('message-search')?.value;
        if (currentQuery) {
            this.performMessageSearch(currentQuery);
        }

        this.app.showToast('Search filters applied', 'success');
    }

    /**
     * Clear search filters
     */
    clearSearchFilters() {
        document.getElementById('message-type-filter').value = 'all';
        document.getElementById('sender-filter').value = 'all';
        document.getElementById('date-filter').value = 'all';
        
        this.activeFilters = { type: 'all', sender: 'all', date: 'all' };
        this.app.showToast('Search filters cleared', 'info');
    }

    /**
     * Filter conversations
     */
    filterConversations(filterType) {
        const conversations = document.querySelectorAll('.conversation-item');
        
        conversations.forEach(conv => {
            let shouldShow = true;
            
            switch (filterType) {
                case 'unread':
                    shouldShow = conv.querySelector('.unread-badge') !== null;
                    break;
                case 'archived':
                    shouldShow = conv.classList.contains('archived');
                    break;
                case 'groups':
                    shouldShow = conv.classList.contains('group-conversation');
                    break;
                default:
                    shouldShow = true;
            }
            
            conv.style.display = shouldShow ? 'flex' : 'none';
        });
    }

    /**
     * Update filter tabs
     */
    updateFilterTabs(activeTab) {
        const tabs = document.querySelectorAll('.filter-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        activeTab.classList.add('active');
    }

    /**
     * Get mention suggestions
     */
    getMentionSuggestions(query) {
        const mockUsers = [
            { id: 'user-1', name: 'Emma Watson', username: 'emmawatson', avatar: 'https://via.placeholder.com/40x40/42b72a/ffffff?text=EW' },
            { id: 'user-2', name: 'Alex Johnson', username: 'alexj', avatar: 'https://via.placeholder.com/40x40/ff6b6b/ffffff?text=AJ' },
            { id: 'user-3', name: 'Sarah Chen', username: 'sarahc', avatar: 'https://via.placeholder.com/40x40/9b59b6/ffffff?text=SC' }
        ];

        return mockUsers.filter(user => 
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.username.toLowerCase().includes(query.toLowerCase())
        );
    }

    /**
     * Show hashtag suggestions
     */
    showHashtagSuggestions(query) {
        const hashtags = ['photography', 'travel', 'art', 'music', 'food', 'nature', 'technology', 'lifestyle'];
        const suggestions = hashtags.filter(tag => tag.includes(query.toLowerCase()));
        
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        const suggestionsContainer = document.getElementById('message-suggestions');
        suggestionsContainer.innerHTML = `
            <div class="suggestions-popup hashtags">
                <div class="suggestions-header">Popular hashtags</div>
                <div class="suggestions-list">
                    ${suggestions.map(tag => `
                        <div class="suggestion-item" data-hashtag="${tag}" data-type="hashtag">
                            <i class="fas fa-hashtag"></i>
                            <span class="hashtag-name">${tag}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.setupSuggestionListeners();
    }

    /**
     * Hide suggestions
     */
    hideSuggestions() {
        const suggestionsContainer = document.getElementById('message-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.innerHTML = '';
        }
    }

    /**
     * Setup suggestion listeners
     */
    setupSuggestionListeners() {
        const suggestionsContainer = document.getElementById('message-suggestions');
        suggestionsContainer.addEventListener('click', (e) => {
            const item = e.target.closest('.suggestion-item');
            if (item) {
                const type = item.dataset.type;
                const input = document.getElementById('thread-message-input');
                
                if (type === 'mention') {
                    const username = item.querySelector('.suggestion-username').textContent;
                    this.insertSuggestion(input, `${username} `, '@');
                } else if (type === 'hashtag') {
                    const hashtag = item.dataset.hashtag;
                    this.insertSuggestion(input, `${hashtag} `, '#');
                }
                
                this.hideSuggestions();
            }
        });
    }

    /**
     * Insert suggestion into input
     */
    insertSuggestion(input, suggestion, prefix) {
        const text = input.textContent;
        const regex = new RegExp(`${prefix}\\w*$`);
        const newText = text.replace(regex, prefix + suggestion);
        input.textContent = newText;
        
        // Place cursor at end
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(input.childNodes[0] || input, newText.length);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    /**
     * Get cursor position
     */
    getCursorPosition(element) {
        let caretOffset = 0;
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
        return caretOffset;
    }

    /**
     * Wrap selection with formatting
     */
    wrapSelection(before, after) {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const selectedText = range.toString();
            const wrappedText = before + selectedText + after;
            range.deleteContents();
            range.insertNode(document.createTextNode(wrappedText));
        }
    }

    /**
     * Show message context menu
     */
    showMessageContextMenu(event) {
        const contextMenu = document.createElement('div');
        contextMenu.className = 'message-context-menu';
        contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="schedule">
                <i class="fas fa-clock"></i> Schedule Message
            </div>
            <div class="context-menu-item" data-action="template">
                <i class="fas fa-file-alt"></i> Use Template
            </div>
            <div class="context-menu-item" data-action="voice-to-text">
                <i class="fas fa-microphone"></i> Voice to Text
            </div>
        `;

        contextMenu.style.position = 'fixed';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
        contextMenu.style.zIndex = '10000';

        document.body.appendChild(contextMenu);

        contextMenu.addEventListener('click', (e) => {
            const action = e.target.closest('.context-menu-item')?.dataset.action;
            if (action) {
                this.handleContextMenuAction(action);
                contextMenu.remove();
            }
        });

        setTimeout(() => {
            document.addEventListener('click', () => {
                if (document.body.contains(contextMenu)) {
                    contextMenu.remove();
                }
            }, { once: true });
        }, 100);
    }

    /**
     * Handle context menu actions
     */
    handleContextMenuAction(action) {
        switch (action) {
            case 'schedule':
                this.showScheduleMessageModal();
                break;
            case 'template':
                this.showTemplateSelector();
                break;
            case 'voice-to-text':
                this.startVoiceToText();
                break;
        }
    }

    /**
     * Show schedule message modal
     */
    showScheduleMessageModal() {
        this.app.showToast('Message scheduling coming soon', 'info');
    }

    /**
     * Show template selector
     */
    showTemplateSelector() {
        const input = document.getElementById('thread-message-input');
        if (!input) return;

        const templatePicker = document.createElement('div');
        templatePicker.className = 'template-picker';
        templatePicker.innerHTML = `
            <div class="template-picker-content">
                <div class="template-header">Quick Templates</div>
                <div class="templates-list">
                    ${this.messageTemplates.map((template, index) => `
                        <div class="template-item" data-template-index="${index}">
                            <span class="template-text">${template.text}</span>
                            <span class="template-category">${template.category}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        input.parentElement.appendChild(templatePicker);

        templatePicker.addEventListener('click', (e) => {
            const item = e.target.closest('.template-item');
            if (item) {
                const index = parseInt(item.dataset.templateIndex);
                const template = this.messageTemplates[index];
                input.textContent = template.text;
                this.handleMessageInput();
                templatePicker.remove();
            }
        });
    }

    /**
     * Start voice to text
     */
    startVoiceToText() {
        this.app.showToast('Voice to text feature coming soon', 'info');
    }

    /**
     * Play voice message
     */
    playVoiceMessage(button) {
        const audioUrl = button.dataset.audioUrl;
        if (!audioUrl) return;

        const audio = new Audio(audioUrl);
        const icon = button.querySelector('i');
        
        // Change to pause icon
        icon.className = 'fas fa-pause';
        
        audio.play().catch(error => {
            console.error('Failed to play voice message:', error);
            this.app.showToast('Could not play voice message', 'error');
        });

        audio.addEventListener('ended', () => {
            icon.className = 'fas fa-play';
        });

        audio.addEventListener('pause', () => {
            icon.className = 'fas fa-play';
        });

        // Toggle play/pause on subsequent clicks
        button.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                icon.className = 'fas fa-pause';
            } else {
                audio.pause();
                icon.className = 'fas fa-play';
            }
        });
    }

    /**
     * Toggle call audio
     */
    toggleCallAudio() {
        const btn = document.getElementById('toggle-audio');
        const icon = btn.querySelector('i');
        
        if (icon.classList.contains('fa-microphone')) {
            icon.className = 'fas fa-microphone-slash';
            btn.classList.add('muted');
            this.app.showToast('Microphone muted', 'info');
        } else {
            icon.className = 'fas fa-microphone';
            btn.classList.remove('muted');
            this.app.showToast('Microphone unmuted', 'info');
        }
    }

    /**
     * Toggle call video
     */
    toggleCallVideo() {
        const btn = document.getElementById('toggle-video');
        const icon = btn.querySelector('i');
        
        if (icon.classList.contains('fa-video')) {
            icon.className = 'fas fa-video-slash';
            btn.classList.add('video-off');
            this.app.showToast('Camera turned off', 'info');
        } else {
            icon.className = 'fas fa-video';
            btn.classList.remove('video-off');
            this.app.showToast('Camera turned on', 'info');
        }
    }

    /**
     * Share screen during call
     */
    shareScreen() {
        this.app.showToast('Screen sharing feature coming soon', 'info');
    }

    /**
     * Toggle call chat sidebar
     */
    toggleCallChat() {
        const sidebar = document.getElementById('call-chat-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    }

    /**
     * Show thread settings
     */
    showThreadSettings() {
        this.app.showToast('Thread settings coming soon', 'info');
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const container = document.getElementById('typing-indicators');
        if (!container) return;

        let indicator = container.querySelector('.typing-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'typing-indicator';
            indicator.innerHTML = `
                <div class="typing-animation">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <span class="typing-text">You are typing...</span>
            `;
            container.appendChild(indicator);
        }
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const container = document.getElementById('typing-indicators');
        const indicator = container?.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Render message reactions
     */
    renderMessageReactions(reactions) {
        return `
            <div class="message-reactions">
                ${reactions.map(reaction => `
                    <span class="reaction-item" data-reaction="${reaction.emoji}">
                        <span class="reaction-emoji">${reaction.emoji}</span>
                        <span class="reaction-count">${reaction.count}</span>
                    </span>
                `).join('')}
            </div>
        `;
    }
}

// Export for global access
window.MessagesUIComponents = MessagesUIComponents;

// Initialize when DOM is ready and app is available
document.addEventListener('DOMContentLoaded', () => {
    if (window.connectHub) {
        window.messagesUI = new MessagesUIComponents(window.connectHub);
    }
});
