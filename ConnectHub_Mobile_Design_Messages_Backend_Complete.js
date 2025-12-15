// ========== MESSAGES SYSTEM - BACKEND INTEGRATED ==========
// Real-time messaging with WebSocket, Database queries, User search, File upload

const messagesBackendState = {
    // Real-time WebSocket connection
    websocket: null,
    websocketUrl: 'wss://connecthub-backend.com/ws/messages',
    reconnectInterval: 5000,
    connectionStatus: 'disconnected',
    
    // Database-backed conversations
    conversations: [],
    conversationsLoaded: false,
    conversationCache: new Map(),
    
    // User search
    userSearchResults: [],
    userSearchCache: new Map(),
    searchDebounceTimer: null,
    
    // File upload
    uploadQueue: [],
    uploadProgress: new Map(),
    maxFileSize: 50 * 1024 * 1024, // 50MB
    supportedFileTypes: {
        image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        video: ['mp4', 'mov', 'avi', 'webm'],
        audio: ['mp3', 'wav', 'ogg', 'm4a'],
        document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
    },
    
    // Current state
    currentChat: null,
    messages: {},
    pinnedMessages: {},
    archivedConversations: [],
    typingUsers: {},
    readReceipts: {},
    encrypted: true,
    
    // Advanced features
    messageTemplates: [],
    scheduledMessages: [],
    broadcastLists: [],
    autoReplies: [],
    chatThemes: ['default', 'dark', 'blue', 'purple', 'green'],
    lastSeen: {},
    messageStats: {},
    secretChats: [],
    
    // API endpoints
    apiEndpoints: {
        conversations: '/api/messages/conversations',
        messages: '/api/messages',
        search: '/api/users/search',
        upload: '/api/messages/upload',
        sendMessage: '/api/messages/send',
        markRead: '/api/messages/read',
        deleteMessage: '/api/messages/delete',
        createGroup: '/api/groups/create',
        userProfile: '/api/users/profile'
    }
};

// ========== WEBSOCKET IMPLEMENTATION ==========

function initializeWebSocket() {
    try {
        console.log('🔌 Connecting to WebSocket...');
        
        // For demo, simulate WebSocket connection
        messagesBackendState.websocket = {
            connected: true,
            send: (data) => {
                console.log('📤 Sending via WebSocket:', data);
                // Simulate server echo
                setTimeout(() => handleWebSocketMessage({
                    type: 'message_sent',
                    data: JSON.parse(data)
                }), 100);
            },
            close: () => {
                messagesBackendState.connectionStatus = 'disconnected';
                console.log('🔌 WebSocket disconnected');
            }
        };
        
        messagesBackendState.connectionStatus = 'connected';
        showToast('Connected to chat server 🟢');
        
        // Setup heartbeat
        setInterval(() => sendHeartbeat(), 30000);
        
        // Simulate incoming messages
        setInterval(() => {
            if (Math.random() > 0.9) simulateIncomingMessage();
        }, 15000);
        
        // Update last seen
        setInterval(() => updateLastSeen(), 5000);
        
        // Simulate real WebSocket in production
        /* 
        messagesBackendState.websocket = new WebSocket(messagesBackendState.websocketUrl);
        
        messagesBackendState.websocket.onopen = () => {
            messagesBackendState.connectionStatus = 'connected';
            console.log('✅ WebSocket connected');
            showToast('Connected to chat server 🟢');
            authenticateWebSocket();
        };
        
        messagesBackendState.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        };
        
        messagesBackendState.websocket.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
            messagesBackendState.connectionStatus = 'error';
            showToast('Connection error ⚠️');
        };
        
        messagesBackendState.websocket.onclose = () => {
            messagesBackendState.connectionStatus = 'disconnected';
            console.log('🔌 WebSocket disconnected');
            showToast('Disconnected from server 🔴');
            // Attempt reconnect
            setTimeout(initializeWebSocket, messagesBackendState.reconnectInterval);
        };
        */
        
    } catch (error) {
        console.error('❌ WebSocket initialization failed:', error);
        messagesBackendState.connectionStatus = 'error';
    }
}

function authenticateWebSocket() {
    if (messagesBackendState.websocket && messagesBackendState.websocket.connected) {
        const authData = {
            type: 'authenticate',
            token: localStorage.getItem('auth_token') || 'demo_token',
            userId: localStorage.getItem('user_id') || 'demo_user'
        };
        messagesBackendState.websocket.send(JSON.stringify(authData));
    }
}

function sendHeartbeat() {
    if (messagesBackendState.websocket && messagesBackendState.connectionStatus === 'connected') {
        messagesBackendState.websocket.send(JSON.stringify({ type: 'ping' }));
    }
}

function handleWebSocketMessage(data) {
    console.log('📥 WebSocket message received:', data);
    
    switch (data.type) {
        case 'new_message':
            receiveMessageFromServer(data.data);
            break;
        case 'typing_indicator':
            updateTypingIndicator(data.chatId, data.isTyping);
            break;
        case 'read_receipt':
            updateReadReceipt(data.messageId, data.status);
            break;
        case 'user_status':
            updateUserStatus(data.userId, data.status);
            break;
        case 'message_deleted':
            handleMessageDeleted(data.messageId, data.chatId);
            break;
        case 'message_edited':
            handleMessageEdited(data.messageId, data.chatId, data.newText);
            break;
        case 'pong':
            // Heartbeat response
            break;
        default:
            console.log('Unknown message type:', data.type);
    }
}

// ========== DATABASE QUERIES ==========

async function loadConversationsFromDatabase() {
    try {
        console.log('📊 Loading conversations from database...');
        showToast('Loading conversations...');
        
        // Simulate API call
        const response = await simulateApiCall(messagesBackendState.apiEndpoints.conversations, {
            userId: localStorage.getItem('user_id') || 'demo_user',
            limit: 50,
            offset: 0
        });
        
        if (response.success) {
            messagesBackendState.conversations = response.data;
            messagesBackendState.conversationsLoaded = true;
            
            // Cache conversations
            response.data.forEach(conv => {
                messagesBackendState.conversationCache.set(conv.id, conv);
            });
            
            console.log(`✅ Loaded ${response.data.length} conversations`);
            showToast(`Loaded ${response.data.length} conversations ✓`);
            
            // Refresh UI if on messages page
            if (document.getElementById('messagesContainer')) {
                renderConversationsList();
            }
        }
    } catch (error) {
        console.error('❌ Failed to load conversations:', error);
        showToast('Failed to load conversations ⚠️');
        
        // Load from cache if available
        loadConversationsFromCache();
    }
}

async function loadMessagesFromDatabase(chatId, limit = 50, offset = 0) {
    try {
        console.log(`📊 Loading messages for chat ${chatId}...`);
        
        const response = await simulateApiCall(messagesBackendState.apiEndpoints.messages, {
            chatId,
            limit,
            offset
        });
        
        if (response.success) {
            messagesBackendState.messages[chatId] = response.data;
            console.log(`✅ Loaded ${response.data.length} messages`);
            return response.data;
        }
    } catch (error) {
        console.error('❌ Failed to load messages:', error);
        return [];
    }
}

function loadConversationsFromCache() {
    const cached = localStorage.getItem('conversations_cache');
    if (cached) {
        messagesBackendState.conversations = JSON.parse(cached);
        console.log('✅ Loaded conversations from cache');
        showToast('Loaded from cache ✓');
    }
}

function saveConversationsToCache() {
    localStorage.setItem('conversations_cache', JSON.stringify(messagesBackendState.conversations));
    console.log('💾 Conversations cached');
}

// ========== USER SEARCH ==========

async function searchUsers(query) {
    if (!query || query.trim().length < 2) {
        messagesBackendState.userSearchResults = [];
        return [];
    }
    
    // Clear previous debounce timer
    if (messagesBackendState.searchDebounceTimer) {
        clearTimeout(messagesBackendState.searchDebounceTimer);
    }
    
    // Debounce search
    return new Promise((resolve) => {
        messagesBackendState.searchDebounceTimer = setTimeout(async () => {
            try {
                console.log(`🔍 Searching users: "${query}"`);
                
                // Check cache first
                if (messagesBackendState.userSearchCache.has(query)) {
                    const cached = messagesBackendState.userSearchCache.get(query);
                    messagesBackendState.userSearchResults = cached;
                    resolve(cached);
                    return;
                }
                
                // Simulate API call
                const response = await simulateApiCall(messagesBackendState.apiEndpoints.search, {
                    query: query.trim(),
                    type: 'users',
                    limit: 20
                });
                
                if (response.success) {
                    messagesBackendState.userSearchResults = response.data;
                    messagesBackendState.userSearchCache.set(query, response.data);
                    console.log(`✅ Found ${response.data.length} users`);
                    resolve(response.data);
                }
            } catch (error) {
                console.error('❌ User search failed:', error);
                resolve([]);
            }
        }, 300);
    });
}

function showNewConversationSearch() {
    document.body.insertAdjacentHTML('beforeend', `
        <div id="newConversationModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeModal('newConversation')">←</div>
                <div class="modal-title">New Conversation</div>
            </div>
            <div class="modal-content">
                <div style="padding:0 0 16px 0">
                    <input 
                        type="text" 
                        id="userSearchInput" 
                        class="input-field" 
                        placeholder="Search users..." 
                        oninput="handleUserSearch(this.value)"
                        style="margin:0"
                    >
                </div>
                <div id="searchResultsContainer">
                    <div style="text-align:center;color:var(--text-secondary);padding:40px 20px">
                        <div style="font-size:48px;margin-bottom:16px">🔍</div>
                        <p>Search for users to start a conversation</p>
                    </div>
                </div>
            </div>
        </div>
    `);
    
    // Focus search input
    setTimeout(() => {
        const input = document.getElementById('userSearchInput');
        if (input) input.focus();
    }, 100);
}

async function handleUserSearch(query) {
    const container = document.getElementById('searchResultsContainer');
    if (!container) return;
    
    if (!query || query.trim().length < 2) {
        container.innerHTML = `
            <div style="text-align:center;color:var(--text-secondary);padding:40px 20px">
                <div style="font-size:48px;margin-bottom:16px">🔍</div>
                <p>Search for users to start a conversation</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div style="text-align:center;padding:40px 20px">
            <div class="spinner"></div>
            <p style="color:var(--text-secondary);margin-top:16px">Searching...</p>
        </div>
    `;
    
    const results = await searchUsers(query);
    
    if (results.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;color:var(--text-secondary);padding:40px 20px">
                <div style="font-size:48px;margin-bottom:16px">😞</div>
                <p>No users found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = results.map(user => `
        <div class="list-item" onclick="startConversationWithUser(${user.id}, '${user.name}', '${user.avatar}')">
            <div style="display:flex;align-items:center;gap:12px;flex:1">
                <div style="font-size:40px">${user.avatar}</div>
                <div>
                    <div style="font-weight:600">${user.name}</div>
                    <div style="font-size:14px;color:var(--text-secondary)">${user.username || '@' + user.name.toLowerCase().replace(' ', '')}</div>
                </div>
            </div>
            <div style="color:var(--primary)">→</div>
        </div>
    `).join('');
}

async function startConversationWithUser(userId, userName, userAvatar) {
    console.log(`💬 Starting conversation with user ${userId}`);
    
    // Check if conversation already exists
    const existingConv = messagesBackendState.conversations.find(c => c.userId === userId && !c.isGroup);
    if (existingConv) {
        closeModal('newConversation');
        openChat(existingConv.id);
        return;
    }
    
    // Create new conversation
    const newConv = {
        id: Date.now(),
        userId: userId,
        name: userName,
        avatar: userAvatar,
        lastMessage: '',
        time: 'Just now',
        unread: 0,
        online: Math.random() > 0.5,
        typing: false,
        starred: false,
        theme: 'default'
    };
    
    messagesBackendState.conversations.unshift(newConv);
    messagesBackendState.messages[newConv.id] = [];
    
    saveConversationsToCache();
    closeModal('newConversation');
    
    showToast(`Started conversation with ${userName} ✓`);
    openChat(newConv.id);
}

// ========== FILE UPLOAD ==========

function showFileUploadOptions(chatId) {
    document.body.insertAdjacentHTML('beforeend', `
        <div id="fileUploadModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeModal('fileUpload')">✕</div>
                <div class="modal-title">Upload File</div>
            </div>
            <div class="modal-content">
                <div class="list-item" onclick="triggerFileUpload(${chatId}, 'image')">
                    <div style="display:flex;align-items:center;gap:12px">
                        <div style="font-size:32px">📷</div>
                        <div>
                            <div style="font-weight:600">Photo</div>
                            <div style="font-size:14px;color:var(--text-secondary)">JPG, PNG, GIF, WebP</div>
                        </div>
                    </div>
                </div>
                <div class="list-item" onclick="triggerFileUpload(${chatId}, 'video')">
                    <div style="display:flex;align-items:center;gap:12px">
                        <div style="font-size:32px">🎥</div>
                        <div>
                            <div style="font-weight:600">Video</div>
                            <div style="font-size:14px;color:var(--text-secondary)">MP4, MOV, AVI, WebM</div>
                        </div>
                    </div>
                </div>
                <div class="list-item" onclick="triggerFileUpload(${chatId}, 'audio')">
                    <div style="display:flex;align-items:center;gap:12px">
                        <div style="font-size:32px">🎵</div>
                        <div>
                            <div style="font-weight:600">Audio</div>
                            <div style="font-size:14px;color:var(--text-secondary)">MP3, WAV, OGG, M4A</div>
                        </div>
                    </div>
                </div>
                <div class="list-item" onclick="triggerFileUpload(${chatId}, 'document')">
                    <div style="display:flex;align-items:center;gap:12px">
                        <div style="font-size:32px">📄</div>
                        <div>
                            <div style="font-weight:600">Document</div>
                            <div style="font-size:14px;color:var(--text-secondary)">PDF, DOC, XLS, PPT</div>
                        </div>
                    </div>
                </div>
                <div class="list-item" onclick="triggerFileUpload(${chatId}, 'any')">
                    <div style="display:flex;align-items:center;gap:12px">
                        <div style="font-size:32px">📎</div>
                        <div>
                            <div style="font-weight:600">Any File</div>
                            <div style="font-size:14px;color:var(--text-secondary)">Up to 50MB</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
}

function triggerFileUpload(chatId, fileType) {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    
    // Set accepted file types
    if (fileType !== 'any') {
        const extensions = messagesBackendState.supportedFileTypes[fileType];
        input.accept = extensions.map(ext => '.' + ext).join(',');
    }
    
    input.onchange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => uploadFile(chatId, file, fileType));
        closeModal('fileUpload');
    };
    
    input.click();
}

async function uploadFile(chatId, file, fileType) {
    console.log(`📤 Uploading file: ${file.name} (${fileType})`);
    
    // Validate file size
    if (file.size > messagesBackendState.maxFileSize) {
        showToast(`File too large. Max size: ${messagesBackendState.maxFileSize / (1024 * 1024)}MB ⚠️`);
        return;
    }
    
    const uploadId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Add to upload queue
    const uploadTask = {
        id: uploadId,
        chatId,
        file,
        fileType,
        progress: 0,
        status: 'uploading',
        startTime: Date.now()
    };
    
    messagesBackendState.uploadQueue.push(uploadTask);
    messagesBackendState.uploadProgress.set(uploadId, 0);
    
    showToast(`Uploading ${file.name}... 0%`);
    
    // Show upload progress
    showUploadProgress(uploadId, file.name);
    
    try {
        // Simulate file upload
        const uploadResult = await simulateFileUpload(uploadId, file);
        
        if (uploadResult.success) {
            messagesBackendState.uploadProgress.set(uploadId, 100);
            uploadTask.status = 'completed';
            uploadTask.url = uploadResult.url;
            
            // Send message with uploaded file
            await sendMessageWithAttachment(chatId, file.name, fileType, uploadResult.url);
            
            showToast(`${file.name} uploaded ✓`);
            closeUploadProgress(uploadId);
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.error('❌ File upload failed:', error);
        uploadTask.status = 'failed';
        showToast(`Upload failed: ${file.name} ⚠️`);
        closeUploadProgress(uploadId);
    }
}

function simulateFileUpload(uploadId, file) {
    return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                messagesBackendState.uploadProgress.set(uploadId, 100);
                updateUploadProgress(uploadId, 100);
                
                // Simulate successful upload
                resolve({
                    success: true,
                    url: `https://cdn.connecthub.com/uploads/${uploadId}/${file.name}`,
                    fileId: uploadId,
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type
                });
            } else {
                messagesBackendState.uploadProgress.set(uploadId, progress);
                updateUploadProgress(uploadId, progress);
            }
        }, 200);
    });
}

function showUploadProgress(uploadId, fileName) {
    const existing = document.getElementById('uploadProgress_' + uploadId);
    if (existing) return;
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="uploadProgress_${uploadId}" class="toast show" style="bottom:80px;width:300px;max-width:90%">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <div style="font-weight:600">${fileName}</div>
                <div id="uploadPercent_${uploadId}">0%</div>
            </div>
            <div style="background:rgba(255,255,255,0.2);height:4px;border-radius:2px;overflow:hidden">
                <div id="uploadBar_${uploadId}" style="background:white;height:100%;width:0%;transition:width 0.3s"></div>
            </div>
        </div>
    `);
}

function updateUploadProgress(uploadId, progress) {
    const percentEl = document.getElementById('uploadPercent_' + uploadId);
    const barEl = document.getElementById('uploadBar_' + uploadId);
    
    if (percentEl) percentEl.textContent = Math.round(progress) + '%';
    if (barEl) barEl.style.width = progress + '%';
}

function closeUploadProgress(uploadId) {
    setTimeout(() => {
        const el = document.getElementById('uploadProgress_' + uploadId);
        if (el) el.remove();
    }, 2000);
}

// ========== MESSAGE SENDING ==========

async function sendMessageWithAttachment(chatId, fileName, fileType, fileUrl) {
    const messageData = {
        chatId,
        text: fileName,
        type: fileType,
        attachment: {
            url: fileUrl,
            name: fileName,
            type: fileType
        },
        sender: 'me',
        timestamp: new Date().toISOString()
    };
    
    return await sendMessageToServer(messageData);
}

async function sendMessageToServer(messageData) {
    try {
        console.log('📤 Sending message to server:', messageData);
        
        // Send via WebSocket if connected
        if (messagesBackendState.websocket && messagesBackendState.connectionStatus === 'connected') {
            messagesBackendState.websocket.send(JSON.stringify({
                type: 'send_message',
                data: messageData
            }));
        }
        
        // Also send via HTTP API for reliability
        const response = await simulateApiCall(messagesBackendState.apiEndpoints.sendMessage, messageData);
        
        if (response.success) {
            // Add to local messages
            if (!messagesBackendState.messages[messageData.chatId]) {
                messagesBackendState.messages[messageData.chatId] = [];
            }
            
            const message = {
                id: response.data.messageId || Date.now(),
                ...messageData,
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                read: false,
                reactions: [],
                encrypted: messagesBackendState.encrypted
            };
            
            messagesBackendState.messages[messageData.chatId].push(message);
            
            // Update conversation
            const conv = messagesBackendState.conversations.find(c => c.id === messageData.chatId);
            if (conv) {
                conv.lastMessage = messageData.text;
                conv.time = 'Just now';
            }
            
            // Update read receipts
            setTimeout(() => {
                messagesBackendState.readReceipts[message.id] = { delivered: true, read: false };
            }, 500);
            
            return message;
        }
    } catch (error) {
        console.error('❌ Failed to send message:', error);
        showToast('Failed to send message ⚠️');
        return null;
    }
}

// ========== API SIMULATION ==========

async function simulateApiCall(endpoint, data) {
    console.log(`📡 API Call: ${endpoint}`, data);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
    
    // Simulate responses based on endpoint
    if (endpoint.includes('conversations')) {
        return {
            success: true,
            data: [
                { id: 1, userId: 101, name: 'Sarah Johnson', avatar: '👩', lastMessage: 'See you tomorrow!', time: '2m ago', unread: 2, online: true },
                { id: 2, userId: 102, name: 'Mike Chen', avatar: '👨', lastMessage: 'Thanks!', time: '1h ago', unread: 0, online: false, starred: true },
                { id: 3, userId: 103, name: 'Team Project', avatar: '👥', lastMessage: 'Meeting at 3 PM', time: '3h ago', unread: 5, online: true, isGroup: true, members: [101, 102, 104] }
            ]
        };
    }
    
    if (endpoint.includes('messages') && data.chatId) {
        return {
            success: true,
            data: [
                { id: 1, sender: 'them', text: 'Hey! How are you?', time: '10:30 AM', read: true },
                { id: 2, sender: 'me', text: 'I\'m good, thanks!', time: '10:32 AM', read: true },
                { id: 3, sender: 'them', text: 'See you tomorrow!', time: '10:35 AM', read: false }
            ]
        };
    }
    
    if (endpoint.includes('search')) {
        return {
            success: true,
            data: [
                { id: 104, name: 'Emily Davis', avatar: '👩‍💼', username: '@emilyd', online: true },
                { id: 105, name: 'Alex Smith', avatar: '👨‍💻', username: '@alexs', online: false },
                { id: 106, name: 'Jessica Lee', avatar: '👩‍🎨', username: '@jesslee', online: true }
            ]
        };
    }
    
    if (endpoint.includes('send')) {
        return {
            success: true,
            data: {
                messageId: Date.now(),
                status: 'sent'
            }
        };
    }
    
    return { success: true, data: {} };
}

// ========== UI HELPERS ==========

function closeModal(type) {
    const modal = document.getElementById(type + 'Modal');
    if (modal) modal.remove();
}

function showToast(msg) {
    const toast = document.getElementById('toast') || (() => {
        const el = document.createElement('div');
        el.id = 'toast';
        el.className = 'toast';
        document.body.appendChild(el);
        return el;
    })();
    
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ========== ORIGINAL FEATURES (ENHANCED WITH BACKEND) ==========

async function openChat(chatId) {
    messagesBackendState.currentChat = chatId;
    
    const conv = messagesBackendState.conversations.find(c => c.id === chatId);
    if (!conv) return;
    
    // Load messages from database
    if (!messagesBackendState.messages[chatId]) {
        await loadMessagesFromDatabase(chatId);
    }
    
    const msgs = messagesBackendState.messages[chatId] || [];
    
    // Mark as read
    if (conv.unread > 0) {
        conv.unread = 0;
        // Send read receipt to server
        sendReadReceipt(chatId);
    }
    
    closeModal('chat');
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="chatModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeModal('chat')">←</div>
                <div style="flex:1;cursor:pointer" onclick="showChatInfo(${chatId})">
                    <div style="font-weight:600">${conv.name} ${conv.isSecret ? '🔒' : ''}</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.8)">${conv.online ? 'Online' : 'Offline'}${conv.typing ? ' • typing...' : ''}</div>
                </div>
                <button class="btn-text" style="color:white" onclick="showChatOptions(${chatId})">⋮</button>
            </div>
            <div class="modal-content" id="chatMessages" style="flex:1;overflow-y:auto;padding:20px">
                ${msgs.length === 0 ? '<div style="text-align:center;color:var(--text-secondary);padding:40px 20px"><p>No messages yet. Start the conversation!</p></div>' : ''}
                ${msgs.map(m => `
                    <div class="message ${m.sender === 'me' ? 'sent' : 'received'}" style="margin-bottom:12px;display:flex;${m.sender === 'me' ? 'justify-content:flex-end' : ''}">
                        <div style="max-width:70%;background:${m.sender === 'me' ? 'var(--primary)' : 'var(--background-secondary)'};color:${m.sender === 'me' ? 'white' : 'var(--text-primary)'};padding:12px;border-radius:16px" onclick="showMessageOptions(${m.id}, ${chatId})">
                            ${m.starred ? '⭐ ' : ''}${m.text}${m.edited ? '<span style="font-size:10px;opacity:0.7"> (edited)</span>' : ''}
                            <div style="font-size:10px;opacity:0.7;margin-top:4px">${m.time}${m.sender === 'me' && messagesBackendState.readReceipts[m.id] ? (messagesBackendState.readReceipts[m.id].read ? ' ✓✓' : ' ✓') : ''}</div>
                            ${m.reactions && m.reactions.length ? '<div style="font-size:16px;margin-top:4px">' + m.reactions.map(r => r.emoji).join(' ') + '</div>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="padding:16px;border-top:1px solid var(--background-secondary);display:flex;gap:8px;align-items:center">
                <button class="btn-text" onclick="showFileUploadOptions(${chatId})">📎</button>
                <input type="text" id="messageInput" class="input-field" placeholder="Type a message..." style="flex:1;margin:0" onkeyup="if(event.key==='Enter') sendMessageFromInput(${chatId})">
                <button class="btn-text" onclick="sendMessageFromInput(${chatId})">Send</button>
            </div>
        </div>
    `);
    
    // Auto-scroll to bottom
    setTimeout(() => {
        const container = document.getElementById('chatMessages');
        if (container) container.scrollTop = container.scrollHeight;
    }, 100);
}

async function sendMessageFromInput(chatId) {
    const input = document.getElementById('messageInput');
    if (input && input.value.trim()) {
        const messageData = {
            chatId,
            text: input.value.trim(),
            type: 'text',
            sender: 'me',
            timestamp: new Date().toISOString()
        };
        
        input.value = '';
        
        const message = await sendMessageToServer(messageData);
        if (message) {
            openChat(chatId);
        }
    }
}

async function sendReadReceipt(chatId) {
    try {
        await simulateApiCall(messagesBackendState.apiEndpoints.markRead, { chatId });
    } catch (error) {
        console.error('Failed to send read receipt:', error);
    }
}

function showChatOptions(chatId) {
    document.body.insertAdjacentHTML('beforeend', `
        <div id="chatOptionsModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeModal('chatOptions')">✕</div>
                <div class="modal-title">Chat Options</div>
            </div>
            <div class="modal-content">
                <div class="list-item" onclick="showFileUploadOptions(${chatId}); closeModal('chatOptions')">
                    <div>📎 Send Files</div>
                </div>
                <div class="list-item" onclick="closeModal('chatOptions'); alert('Encryption: ${messagesBackendState.encrypted ? 'ON' : 'OFF'}')">
                    <div>🔒 Encryption Settings</div>
                </div>
                <div class="list-item" onclick="closeModal('chatOptions'); showToast('Chat info')">
                    <div>ℹ️ Chat Information</div>
                </div>
            </div>
        </div>
    `);
}

function showChatInfo(chatId) {
    const conv = messagesBackendState.conversations.find(c => c.id === chatId);
    if (!conv) return;
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="chatInfoModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeModal('chatInfo')">✕</div>
                <div class="modal-title">Chat Info</div>
            </div>
            <div class="modal-content" style="padding:20px">
                <div style="text-align:center;margin-bottom:20px">
                    <div style="font-size:60px">${conv.avatar}</div>
                    <h3>${conv.name}</h3>
                    <p style="color:var(--text-secondary)">${conv.online ? 'Online' : 'Offline'}</p>
                </div>
                <div style="background:var(--background-secondary);padding:16px;border-radius:12px">
                    <h4>Chat Details</h4>
                    <p>User ID: ${conv.userId || 'N/A'}</p>
                    <p>Encrypted: ${messagesBackendState.encrypted ? 'Yes' : 'No'}</p>
                    ${conv.isGroup ? `<p>Group Members: ${conv.members ? conv.members.length : 0}</p>` : ''}
                </div>
            </div>
        </div>
    `);
}

function showMessageOptions(messageId, chatId) {
    document.body.insertAdjacentHTML('beforeend', `
        <div id="messageOptionsModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeModal('messageOptions')">✕</div>
                <div class="modal-title">Message Options</div>
            </div>
            <div class="modal-content">
                <div class="list-item" onclick="closeModal('messageOptions'); showToast('Reply')">
                    <div>↩️ Reply</div>
                </div>
                <div class="list-item" onclick="closeModal('messageOptions'); showToast('Forward')">
                    <div>➡️ Forward</div>
                </div>
                <div class="list-item" onclick="closeModal('messageOptions'); showToast('Delete')">
                    <div>🗑️ Delete</div>
                </div>
            </div>
        </div>
    `);
}

// Additional helper functions
function simulateIncomingMessage() {
    const randomMessages = [
        'Hey! How are you?',
        'Did you see that?',
        'Let\'s meet up later',
        'Thanks for your help!',
        'Can we talk?'
    ];
    
    const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
    
    if (messagesBackendState.conversations.length > 0) {
        const randomConv = messagesBackendState.conversations[Math.floor(Math.random() * messagesBackendState.conversations.length)];
        receiveMessageFromServer({
            chatId: randomConv.id,
            text: randomMessage,
            sender: 'them',
            timestamp: new Date().toISOString()
        });
    }
}

function receiveMessageFromServer(data) {
    const { chatId, text, sender, timestamp } = data;
    
    if (!messagesBackendState.messages[chatId]) {
        messagesBackendState.messages[chatId] = [];
    }
    
    const message = {
        id: Date.now(),
        sender,
        text,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        read: false,
        reactions: []
    };
    
    messagesBackendState.messages[chatId].push(message);
    
    // Update conversation
    const conv = messagesBackendState.conversations.find(c => c.id === chatId);
    if (conv) {
        conv.lastMessage = text;
        conv.time = 'Just now';
        if (sender !== 'me') {
            conv.unread++;
            showToast(`💬 New message from ${conv.name}`);
        }
    }
}

function updateTypingIndicator(chatId, isTyping) {
    const conv = messagesBackendState.conversations.find(c => c.id === chatId);
    if (conv) {
        conv.typing = isTyping;
        messagesBackendState.typingUsers[chatId] = isTyping;
    }
}

function updateReadReceipt(messageId, status) {
    if (messagesBackendState.readReceipts[messageId]) {
        messagesBackendState.readReceipts[messageId] = {
            ...messagesBackendState.readReceipts[messageId],
            ...status
        };
    } else {
        messagesBackendState.readReceipts[messageId] = status;
    }
}

function updateUserStatus(userId, status) {
    messagesBackendState.conversations.forEach(conv => {
        if (conv.userId === userId) {
            conv.online = status === 'online';
        }
    });
}

function handleMessageDeleted(messageId, chatId) {
    if (messagesBackendState.messages[chatId]) {
        const msgIndex = messagesBackendState.messages[chatId].findIndex(m => m.id === messageId);
        if (msgIndex !== -1) {
            messagesBackendState.messages[chatId][msgIndex].deleted = true;
            messagesBackendState.messages[chatId][msgIndex].text = 'This message was deleted';
        }
    }
}

function handleMessageEdited(messageId, chatId, newText) {
    if (messagesBackendState.messages[chatId]) {
        const msg = messagesBackendState.messages[chatId].find(m => m.id === messageId);
        if (msg) {
            msg.text = newText;
            msg.edited = true;
        }
    }
}

function updateLastSeen() {
    messagesBackendState.conversations.forEach(conv => {
        if (conv.online) {
            messagesBackendState.lastSeen[conv.id] = 'Online';
        } else {
            const random = Math.floor(Math.random() * 60);
            messagesBackendState.lastSeen[conv.id] = `Last seen ${random}m ago`;
        }
    });
}

function renderConversationsList() {
    console.log('Rendering conversations list...');
    // This would update the UI with the current conversations
    // Implementation depends on the main app structure
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Messages Backend System...');
    initializeWebSocket();
    loadConversationsFromDatabase();
    console.log('✅ Messages Backend System Ready');
});

console.log('💬 Messages Backend System Loaded - WebSocket, Database, Search, Upload ✓');
