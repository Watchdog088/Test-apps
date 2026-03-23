/**
 * Stream Chat Overlay - Displays live chat messages directly on the stream screen
 * This module adds a toggleable chat overlay that shows on the video preview during streaming
 */

class StreamChatOverlay {
    constructor() {
        this.isVisible = true;
        this.isMinimized = false;
        this.messages = [];
        this.maxMessages = 50;
        
        this.init();
    }

    init() {
        this.injectHTML();
        this.injectStyles();
        this.setupEventListeners();
        this.restorePreferences();
    }

    injectHTML() {
        // Find the live preview container
        const previewContainer = document.querySelector('.live-preview-container');
        if (!previewContainer) {
            console.warn('Live preview container not found');
            return;
        }

        // Check if overlay already exists
        if (document.getElementById('stream-chat-overlay')) {
            return;
        }

        // Create chat overlay HTML
        const overlayHTML = `
            <div class="stream-chat-overlay" id="stream-chat-overlay">
                <div class="chat-overlay-header">
                    <span class="chat-overlay-title">💬 Live Chat</span>
                    <div class="chat-overlay-controls">
                        <button id="minimize-chat-overlay" class="chat-overlay-btn" title="Minimize">📍</button>
                        <button id="close-chat-overlay" class="chat-overlay-btn" title="Hide">✕</button>
                    </div>
                </div>
                <div class="chat-overlay-messages" id="chat-overlay-messages">
                    <div class="chat-overlay-empty">No messages yet. Chat will appear here during your stream.</div>
                </div>
            </div>
        `;

        // Add to preview overlay
        const previewOverlay = previewContainer.querySelector('.preview-overlay');
        if (previewOverlay) {
            previewOverlay.insertAdjacentHTML('beforeend', overlayHTML);
        }

        // Add toggle button to stream controls
        this.addToggleButton();
    }

    addToggleButton() {
        const primaryControls = document.querySelector('.primary-controls');
        if (!primaryControls) return;

        // Check if button already exists
        if (document.getElementById('toggle-chat-overlay-btn')) return;

        const toggleButton = document.createElement('button');
        toggleButton.id = 'toggle-chat-overlay-btn';
        toggleButton.className = 'control-btn active';
        toggleButton.innerHTML = `
            <span class="control-icon">💬</span>
            <span class="control-label">Chat on Stream</span>
        `;
        toggleButton.title = 'Toggle chat overlay on stream';

        primaryControls.appendChild(toggleButton);
    }

    injectStyles() {
        // Check if styles already exist
        if (document.getElementById('stream-chat-overlay-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'stream-chat-overlay-styles';
        style.textContent = `
            /* Stream Chat Overlay Styles */
            .stream-chat-overlay {
                position: absolute;
                bottom: 4rem;
                right: 1rem;
                width: 340px;
                max-height: 450px;
                background: rgba(0, 0, 0, 0.90);
                backdrop-filter: blur(15px);
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.15);
                display: flex;
                flex-direction: column;
                transition: all 0.3s ease;
                pointer-events: auto;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                z-index: 100;
            }

            .stream-chat-overlay.hidden {
                opacity: 0;
                transform: translateX(120%);
                pointer-events: none;
            }

            .stream-chat-overlay.minimized {
                max-height: 50px;
            }

            .stream-chat-overlay.minimized .chat-overlay-messages {
                display: none;
            }

            .chat-overlay-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.875rem 1rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(0, 0, 0, 0.4);
                border-radius: 16px 16px 0 0;
            }

            .chat-overlay-title {
                color: white;
                font-weight: 600;
                font-size: 0.95rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .chat-overlay-controls {
                display: flex;
                gap: 0.5rem;
            }

            .chat-overlay-btn {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                font-size: 0.9rem;
            }

            .chat-overlay-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.05);
            }

            .chat-overlay-btn:active {
                transform: scale(0.95);
            }

            .chat-overlay-messages {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                max-height: 400px;
            }

            .chat-overlay-messages::-webkit-scrollbar {
                width: 6px;
            }

            .chat-overlay-messages::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 3px;
            }

            .chat-overlay-messages::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
            }

            .chat-overlay-messages::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .chat-overlay-empty {
                color: rgba(255, 255, 255, 0.5);
                text-align: center;
                padding: 2rem 1rem;
                font-size: 0.9rem;
                line-height: 1.5;
            }

            .chat-overlay-message {
                background: rgba(255, 255, 255, 0.12);
                padding: 0.625rem 0.875rem;
                border-radius: 10px;
                animation: chatMessageSlideIn 0.3s ease;
                border-left: 3px solid var(--primary, #4f46e5);
            }

            .chat-overlay-message:hover {
                background: rgba(255, 255, 255, 0.15);
            }

            .chat-overlay-username {
                color: var(--primary, #4f46e5);
                font-weight: 700;
                font-size: 0.875rem;
                margin-bottom: 0.35rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .chat-overlay-badge {
                background: rgba(255, 255, 255, 0.2);
                padding: 0.125rem 0.5rem;
                border-radius: 10px;
                font-size: 0.7rem;
                font-weight: 600;
            }

            .chat-overlay-text {
                color: rgba(255, 255, 255, 0.95);
                font-size: 0.875rem;
                line-height: 1.4;
                word-wrap: break-word;
                word-break: break-word;
            }

            .chat-overlay-timestamp {
                color: rgba(255, 255, 255, 0.4);
                font-size: 0.7rem;
                margin-top: 0.25rem;
            }

            @keyframes chatMessageSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(15px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            /* Responsive adjustments */
            @media (max-width: 1024px) {
                .stream-chat-overlay {
                    width: 300px;
                    max-height: 350px;
                    bottom: 3rem;
                    right: 0.5rem;
                }

                .chat-overlay-messages {
                    max-height: 300px;
                }
            }

            @media (max-width: 768px) {
                .stream-chat-overlay {
                    width: 280px;
                    max-height: 300px;
                }

                .chat-overlay-messages {
                    max-height: 250px;
                    padding: 0.75rem;
                }
            }
        `;

        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Toggle button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#toggle-chat-overlay-btn')) {
                this.toggle();
            }
        });

        // Minimize button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#minimize-chat-overlay')) {
                this.toggleMinimize();
            }
        });

        // Close button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#close-chat-overlay')) {
                this.hide();
            }
        });
    }

    addMessage(username, text, options = {}) {
        const overlay = document.getElementById('chat-overlay-messages');
        if (!overlay) return;

        // Remove empty state
        const emptyState = overlay.querySelector('.chat-overlay-empty');
        if (emptyState) {
            emptyState.remove();
        }

        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-overlay-message';
        
        const badge = options.badge ? `<span class="chat-overlay-badge">${options.badge}</span>` : '';
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageElement.innerHTML = `
            <div class="chat-overlay-username">${username}${badge}</div>
            <div class="chat-overlay-text">${this.sanitizeHTML(text)}</div>
            <div class="chat-overlay-timestamp">${timestamp}</div>
        `;

        overlay.appendChild(messageElement);
        overlay.scrollTop = overlay.scrollHeight;

        // Keep only last maxMessages
        this.messages.push({ username, text, timestamp });
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
            const firstMessage = overlay.querySelector('.chat-overlay-message');
            if (firstMessage) firstMessage.remove();
        }
    }

    sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    toggle() {
        const overlay = document.getElementById('stream-chat-overlay');
        const button = document.getElementById('toggle-chat-overlay-btn');
        
        if (!overlay) return;

        this.isVisible = overlay.classList.toggle('hidden');
        this.isVisible = !this.isVisible; // Invert because we just toggled hidden

        if (button) {
            button.classList.toggle('active', this.isVisible);
        }

        this.savePreferences();
    }

    hide() {
        const overlay = document.getElementById('stream-chat-overlay');
        const button = document.getElementById('toggle-chat-overlay-btn');
        
        if (overlay) {
            overlay.classList.add('hidden');
            this.isVisible = false;
        }

        if (button) {
            button.classList.remove('active');
        }

        this.savePreferences();
    }

    show() {
        const overlay = document.getElementById('stream-chat-overlay');
        const button = document.getElementById('toggle-chat-overlay-btn');
        
        if (overlay) {
            overlay.classList.remove('hidden');
            this.isVisible = true;
        }

        if (button) {
            button.classList.add('active');
        }

        this.savePreferences();
    }

    toggleMinimize() {
        const overlay = document.getElementById('stream-chat-overlay');
        const button = document.getElementById('minimize-chat-overlay');
        
        if (!overlay) return;

        this.isMinimized = overlay.classList.toggle('minimized');
        
        if (button) {
            button.textContent = this.isMinimized ? '📌' : '📍';
            button.title = this.isMinimized ? 'Expand' : 'Minimize';
        }

        this.savePreferences();
    }

    clear() {
        const overlay = document.getElementById('chat-overlay-messages');
        if (!overlay) return;

        this.messages = [];
        overlay.innerHTML = '<div class="chat-overlay-empty">Chat cleared</div>';
    }

    savePreferences() {
        localStorage.setItem('streamChatOverlay', JSON.stringify({
            isVisible: this.isVisible,
            isMinimized: this.isMinimized
        }));
    }

    restorePreferences() {
        try {
            const saved = JSON.parse(localStorage.getItem('streamChatOverlay'));
            if (saved) {
                if (!saved.isVisible) {
                    this.hide();
                }
                if (saved.isMinimized) {
                    this.toggleMinimize();
                }
            }
        } catch (error) {
            console.warn('Could not restore chat overlay preferences', error);
        }
    }

    // Integration method - hook into existing chat system
    integrateWithChatSystem() {
        // Override or extend the existing addChatMessage function if it exists
        if (window.streamSessionDashboard) {
            const original = window.streamSessionDashboard.addChatMessage;
            if (original) {
                window.streamSessionDashboard.addChatMessage = (username, message) => {
                    // Call original function
                    original.call(window.streamSessionDashboard, username, message);
                    // Also add to overlay
                    this.addMessage(username, message);
                };
            }
        }
    }
}

// Initialize the overlay when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.streamChatOverlay = new StreamChatOverlay();
        // Give the dashboard time to initialize
        setTimeout(() => {
            window.streamChatOverlay.integrateWithChatSystem();
        }, 1000);
    });
} else {
    window.streamChatOverlay = new StreamChatOverlay();
    setTimeout(() => {
        window.streamChatOverlay.integrateWithChatSystem();
    }, 1000);
}

// Export for global access
window.StreamChatOverlay = StreamChatOverlay;
