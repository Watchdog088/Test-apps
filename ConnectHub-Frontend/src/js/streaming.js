class StreamingManager {
    constructor() {
        this.socket = null;
        this.currentStream = null;
        this.isViewing = false;
        this.isStreaming = false;
        this.mediaRecorder = null;
        this.localStream = null;
        
        // Initialize streaming interface
        this.initializeStreaming();
    }

    initializeStreaming() {
        // Create streaming UI elements if they don't exist
        this.createStreamingUI();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    createStreamingUI() {
        // Check if streaming section already exists
        if (document.getElementById('streaming-section')) return;

        const streamingHTML = `
            <div id="streaming-section" class="content-section" style="display: none;">
                <div class="streaming-container">
                    <!-- Live Streams Grid -->
                    <div id="live-streams-grid">
                        <h2>🔴 Live Streams</h2>
                        <div class="streams-filter">
                            <select id="stream-category-filter">
                                <option value="">All Categories</option>
                                <option value="gaming">Gaming</option>
                                <option value="music">Music</option>
                                <option value="talk">Talk</option>
                                <option value="cooking">Cooking</option>
                                <option value="fitness">Fitness</option>
                                <option value="art">Art</option>
                                <option value="education">Education</option>
                            </select>
                            <input type="text" id="stream-search" placeholder="Search streams...">
                        </div>
                        <div id="streams-grid" class="streams-grid">
                            <!-- Streams will be populated here -->
                        </div>
                    </div>

                    <!-- Stream Viewer -->
                    <div id="stream-viewer" style="display: none;">
                        <div class="stream-player-container">
                            <video id="stream-video" controls autoplay muted></video>
                            <div class="stream-overlay">
                                <div class="stream-info">
                                    <h3 id="stream-title"></h3>
                                    <p id="stream-streamer"></p>
                                    <span id="stream-viewers">0 viewers</span>
                                </div>
                                <div class="stream-actions">
                                    <button id="follow-streamer-btn">Follow</button>
                                    <button id="share-stream-btn">Share</button>
                                    <button id="leave-stream-btn">Leave</button>
                                </div>
                            </div>
                            <div class="stream-reactions">
                                <button class="reaction-btn" data-type="like">❤️</button>
                                <button class="reaction-btn" data-type="love">😍</button>
                                <button class="reaction-btn" data-type="laugh">😂</button>
                                <button class="reaction-btn" data-type="wow">😮</button>
                                <button class="reaction-btn" data-type="clap">👏</button>
                                <button class="reaction-btn" data-type="fire">🔥</button>
                            </div>
                        </div>
                        
                        <!-- Stream Chat -->
                        <div class="stream-chat">
                            <div id="stream-messages" class="chat-messages">
                                <!-- Messages will appear here -->
                            </div>
                            <div class="chat-input-container">
                                <input type="text" id="stream-chat-input" placeholder="Say something..." maxlength="500">
                                <button id="send-stream-message">Send</button>
                                <button id="send-gift-btn">🎁 Gift</button>
                            </div>
                        </div>
                    </div>

                    <!-- Stream Creator -->
                    <div id="stream-creator" style="display: none;">
                        <h2>Create New Stream</h2>
                        <form id="create-stream-form">
                            <input type="text" id="stream-title-input" placeholder="Stream Title" required maxlength="100">
                            <textarea id="stream-description-input" placeholder="Stream Description" maxlength="500"></textarea>
                            <select id="stream-category-input" required>
                                <option value="">Select Category</option>
                                <option value="gaming">Gaming</option>
                                <option value="music">Music</option>
                                <option value="talk">Talk</option>
                                <option value="cooking">Cooking</option>
                                <option value="fitness">Fitness</option>
                                <option value="art">Art</option>
                                <option value="education">Education</option>
                            </select>
                            <input type="text" id="stream-tags-input" placeholder="Tags (comma separated)">
                            <label>
                                <input type="checkbox" id="stream-private-checkbox"> Private Stream
                            </label>
                            <label>
                                <input type="checkbox" id="stream-chat-enabled" checked> Enable Chat
                            </label>
                            <label>
                                <input type="checkbox" id="stream-recording-enabled"> Enable Recording
                            </label>
                            <label>
                                <input type="checkbox" id="stream-monetization-enabled"> Enable Monetization
                            </label>
                            <button type="submit">Create Stream</button>
                        </form>
                    </div>

                    <!-- Stream Controls (for streamers) -->
                    <div id="stream-controls" style="display: none;">
                        <div class="streaming-preview">
                            <video id="stream-preview" muted autoplay></video>
                            <div class="stream-status">
                                <span id="stream-status-text">Not Streaming</span>
                                <span id="current-viewers">0 viewers</span>
                            </div>
                        </div>
                        <div class="control-buttons">
                            <button id="start-stream-btn">Start Stream</button>
                            <button id="end-stream-btn" style="display: none;">End Stream</button>
                            <button id="toggle-camera-btn">📹 Camera</button>
                            <button id="toggle-mic-btn">🎤 Mic</button>
                            <select id="stream-quality-select">
                                <option value="1080p">1080p (6000 kbps)</option>
                                <option value="720p" selected>720p (4000 kbps)</option>
                                <option value="480p">480p (2500 kbps)</option>
                                <option value="360p">360p (1000 kbps)</option>
                            </select>
                        </div>
                    </div>

                    <!-- Gift Modal -->
                    <div id="gift-modal" class="modal" style="display: none;">
                        <div class="modal-content">
                            <span class="close">&times;</span>
                            <h3>Send Gift</h3>
                            <div class="gifts-grid">
                                <div class="gift-option" data-gift="rose" data-value="1">
                                    <div class="gift-icon">🌹</div>
                                    <div class="gift-name">Rose</div>
                                    <div class="gift-price">$1</div>
                                </div>
                                <div class="gift-option" data-gift="heart" data-value="5">
                                    <div class="gift-icon">💖</div>
                                    <div class="gift-name">Heart</div>
                                    <div class="gift-price">$5</div>
                                </div>
                                <div class="gift-option" data-gift="star" data-value="10">
                                    <div class="gift-icon">⭐</div>
                                    <div class="gift-name">Star</div>
                                    <div class="gift-price">$10</div>
                                </div>
                                <div class="gift-option" data-gift="diamond" data-value="50">
                                    <div class="gift-icon">💎</div>
                                    <div class="gift-name">Diamond</div>
                                    <div class="gift-price">$50</div>
                                </div>
                                <div class="gift-option" data-gift="crown" data-value="100">
                                    <div class="gift-icon">👑</div>
                                    <div class="gift-name">Crown</div>
                                    <div class="gift-price">$100</div>
                                </div>
                            </div>
                            <div class="gift-quantity">
                                <label>Quantity:</label>
                                <input type="number" id="gift-quantity" min="1" value="1">
                            </div>
                            <div class="gift-message">
                                <input type="text" id="gift-message" placeholder="Optional message..." maxlength="200">
                            </div>
                            <button id="send-gift-confirm">Send Gift</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add to main content area
        const mainContent = document.querySelector('.main-content') || document.body;
        mainContent.insertAdjacentHTML('beforeend', streamingHTML);
    }

    setupEventListeners() {
        // Navigation
        const streamingBtn = document.getElementById('streaming-btn');
        if (streamingBtn) {
            streamingBtn.addEventListener('click', () => this.showStreaming());
        }

        // Stream creation
        const createStreamForm = document.getElementById('create-stream-form');
        if (createStreamForm) {
            createStreamForm.addEventListener('submit', (e) => this.handleCreateStream(e));
        }

        // Stream controls
        const startStreamBtn = document.getElementById('start-stream-btn');
        const endStreamBtn = document.getElementById('end-stream-btn');
        if (startStreamBtn) startStreamBtn.addEventListener('click', () => this.startStream());
        if (endStreamBtn) endStreamBtn.addEventListener('click', () => this.endStream());

        // Chat
        const chatInput = document.getElementById('stream-chat-input');
        const sendMessageBtn = document.getElementById('send-stream-message');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendChatMessage();
            });
        }
        if (sendMessageBtn) sendMessageBtn.addEventListener('click', () => this.sendChatMessage());

        // Reactions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('reaction-btn')) {
                const type = e.target.dataset.type;
                this.sendReaction(type);
            }
        });

        // Gifts
        const sendGiftBtn = document.getElementById('send-gift-btn');
        const giftModal = document.getElementById('gift-modal');
        if (sendGiftBtn) {
            sendGiftBtn.addEventListener('click', () => {
                giftModal.style.display = 'block';
            });
        }

        // Gift modal
        const giftOptions = document.querySelectorAll('.gift-option');
        giftOptions.forEach(option => {
            option.addEventListener('click', () => {
                giftOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        const sendGiftConfirm = document.getElementById('send-gift-confirm');
        if (sendGiftConfirm) {
            sendGiftConfirm.addEventListener('click', () => this.sendGift());
        }

        // Close modal
        const closeModal = giftModal?.querySelector('.close');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                giftModal.style.display = 'none';
            });
        }

        // Stream search and filters
        const searchInput = document.getElementById('stream-search');
        const categoryFilter = document.getElementById('stream-category-filter');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterStreams());
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterStreams());
        }
    }

    showStreaming() {
        // Hide other sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show streaming section
        const streamingSection = document.getElementById('streaming-section');
        if (streamingSection) {
            streamingSection.style.display = 'block';
            
            // Show live streams by default
            this.showLiveStreams();
            
            // Load live streams
            this.loadLiveStreams();
        }
    }

    showLiveStreams() {
        document.getElementById('live-streams-grid').style.display = 'block';
        document.getElementById('stream-viewer').style.display = 'none';
        document.getElementById('stream-creator').style.display = 'none';
        document.getElementById('stream-controls').style.display = 'none';
    }

    async loadLiveStreams() {
        try {
            const response = await fetch(`${API_BASE_URL}/streaming/live`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                this.displayStreams(data.streams);
            }
        } catch (error) {
            console.error('Error loading live streams:', error);
        }
    }

    displayStreams(streams) {
        const grid = document.getElementById('streams-grid');
        if (!grid) return;

        if (streams.length === 0) {
            grid.innerHTML = '<p class="no-streams">No live streams available</p>';
            return;
        }

        grid.innerHTML = streams.map(stream => `
            <div class="stream-card" data-stream-id="${stream.id}">
                <div class="stream-thumbnail">
                    <img src="${stream.thumbnailUrl || '/src/assets/default-stream.jpg'}" alt="${stream.title}">
                    <div class="live-indicator">🔴 LIVE</div>
                    <div class="viewer-count">${stream.viewerCount} viewers</div>
                </div>
                <div class="stream-info">
                    <h4>${stream.title}</h4>
                    <p class="stream-category">${stream.category}</p>
                    <p class="stream-streamer">by ${stream.userId}</p>
                    <div class="stream-tags">
                        ${stream.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                </div>
                <button class="join-stream-btn" onclick="streamingManager.joinStream('${stream.id}')">
                    Watch
                </button>
            </div>
        `).join('');
    }

    async joinStream(streamId) {
        try {
            const response = await fetch(`${API_BASE_URL}/streaming/${streamId}/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                this.currentStream = streamId;
                this.isViewing = true;
                this.showStreamViewer(streamId);
                this.setupStreamSocket();
            }
        } catch (error) {
            console.error('Error joining stream:', error);
            alert('Failed to join stream');
        }
    }

    showStreamViewer(streamId) {
        document.getElementById('live-streams-grid').style.display = 'none';
        document.getElementById('stream-viewer').style.display = 'block';
        
        // Set up stream video (this would connect to RTMP/HLS stream)
        const video = document.getElementById('stream-video');
        video.src = `https://stream.connecthub.com/hls/${streamId}/playlist.m3u8`;
        
        // Join stream room via socket
        if (this.socket) {
            this.socket.emit('join_stream', streamId);
        }
    }

    setupStreamSocket() {
        if (!this.socket && window.socket) {
            this.socket = window.socket;
        }
        
        if (!this.socket) return;

        // Listen for stream events
        this.socket.on('stream:message', (data) => {
            this.displayChatMessage(data.message);
        });

        this.socket.on('stream:gift', (data) => {
            this.displayGift(data.gift);
        });

        this.socket.on('stream:reaction', (data) => {
            this.displayReaction(data.reaction);
        });

        this.socket.on('viewer_joined', (data) => {
            this.updateViewerCount();
        });

        this.socket.on('viewer_left', (data) => {
            this.updateViewerCount();
        });
    }

    sendChatMessage() {
        const input = document.getElementById('stream-chat-input');
        const message = input.value.trim();
        
        if (!message || !this.currentStream || !this.socket) return;
        
        this.socket.emit('stream_message', {
            streamId: this.currentStream,
            message: message
        });
        
        input.value = '';
    }

    sendReaction(type) {
        if (!this.currentStream || !this.socket) return;
        
        this.socket.emit('stream_reaction', {
            streamId: this.currentStream,
            type: type
        });
    }

    sendGift() {
        const selectedGift = document.querySelector('.gift-option.selected');
        const quantity = parseInt(document.getElementById('gift-quantity').value);
        const message = document.getElementById('gift-message').value.trim();
        
        if (!selectedGift || !this.currentStream) return;
        
        const giftType = selectedGift.dataset.gift;
        
        // Send gift via API
        fetch(`${API_BASE_URL}/streaming/${this.currentStream}/gift`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                giftType: giftType,
                quantity: quantity,
                message: message
            })
        });
        
        // Close modal
        document.getElementById('gift-modal').style.display = 'none';
    }

    displayChatMessage(message) {
        const messagesContainer = document.getElementById('stream-messages');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.innerHTML = `
            <span class="message-user">${message.username}</span>
            <span class="message-content">${message.message}</span>
            <span class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</span>
        `;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    displayGift(gift) {
        // Display gift animation
        const giftElement = document.createElement('div');
        giftElement.className = 'gift-notification';
        giftElement.innerHTML = `
            <span>${gift.fromUsername} sent ${gift.quantity}x ${gift.giftType}! 🎁</span>
        `;
        
        document.querySelector('.stream-player-container').appendChild(giftElement);
        
        // Remove after animation
        setTimeout(() => {
            giftElement.remove();
        }, 5000);
    }

    displayReaction(reaction) {
        // Display reaction animation
        const reactionElement = document.createElement('div');
        reactionElement.className = 'reaction-animation';
        reactionElement.textContent = this.getReactionEmoji(reaction.type);
        
        document.querySelector('.stream-player-container').appendChild(reactionElement);
        
        // Remove after animation
        setTimeout(() => {
            reactionElement.remove();
        }, 3000);
    }

    getReactionEmoji(type) {
        const emojis = {
            'like': '❤️',
            'love': '😍',
            'laugh': '😂',
            'wow': '😮',
            'clap': '👏',
            'fire': '🔥'
        };
        return emojis[type] || '👍';
    }

    async handleCreateStream(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('stream-title-input').value,
            description: document.getElementById('stream-description-input').value,
            category: document.getElementById('stream-category-input').value,
            tags: document.getElementById('stream-tags-input').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            isPrivate: document.getElementById('stream-private-checkbox').checked,
            chatEnabled: document.getElementById('stream-chat-enabled').checked,
            recordingEnabled: document.getElementById('stream-recording-enabled').checked,
            monetizationEnabled: document.getElementById('stream-monetization-enabled').checked
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/streaming/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            if (data.success) {
                this.currentStream = data.stream.id;
                this.showStreamControls();
                alert('Stream created successfully!');
            }
        } catch (error) {
            console.error('Error creating stream:', error);
            alert('Failed to create stream');
        }
    }

    showStreamControls() {
        document.getElementById('live-streams-grid').style.display = 'none';
        document.getElementById('stream-creator').style.display = 'none';
        document.getElementById('stream-controls').style.display = 'block';
    }

    async startStream() {
        if (!this.currentStream) return;
        
        try {
            // Get camera/mic access
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            // Show preview
            const preview = document.getElementById('stream-preview');
            preview.srcObject = this.localStream;
            
            // Start streaming
            const response = await fetch(`${API_BASE_URL}/streaming/${this.currentStream}/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                this.isStreaming = true;
                document.getElementById('start-stream-btn').style.display = 'none';
                document.getElementById('end-stream-btn').style.display = 'block';
                document.getElementById('stream-status-text').textContent = 'Live';
            }
        } catch (error) {
            console.error('Error starting stream:', error);
            alert('Failed to start stream');
        }
    }

    async endStream() {
        if (!this.currentStream) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/streaming/${this.currentStream}/end`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => track.stop());
            }
            
            this.isStreaming = false;
            this.currentStream = null;
            document.getElementById('start-stream-btn').style.display = 'block';
            document.getElementById('end-stream-btn').style.display = 'none';
            document.getElementById('stream-status-text').textContent = 'Not Streaming';
            
            // Return to live streams view
            this.showLiveStreams();
            this.loadLiveStreams();
        } catch (error) {
            console.error('Error ending stream:', error);
        }
    }

    filterStreams() {
        const search = document.getElementById('stream-search').value.toLowerCase();
        const category = document.getElementById('stream-category-filter').value;
        
        // This would typically filter the displayed streams
        // For now, we'll reload with filters
        this.loadLiveStreams();
    }

    updateViewerCount() {
        if (!this.socket || !this.currentStream) return;
        
        this.socket.emit('request_viewer_count', this.currentStream);
        
        this.socket.on('stream:viewer_count', (data) => {
            const viewerElement = document.getElementById('stream-viewers') || document.getElementById('current-viewers');
            if (viewerElement) {
                viewerElement.textContent = `${data.count} viewers`;
            }
        });
    }
}

// Initialize streaming manager
const streamingManager = new StreamingManager();

// Export for global access
window.streamingManager = streamingManager;
