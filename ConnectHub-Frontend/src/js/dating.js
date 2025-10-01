// Dating API endpoints
const API = {
    profile: '/api/v1/dating/profile',
    discover: '/api/v1/dating/discover',
    swipe: '/api/v1/dating/swipe',
    matches: '/api/v1/dating/matches',
    stats: '/api/v1/dating/stats',
    smartMatches: '/api/v1/dating/smart-matches'
};

// State management
let currentProfile = null;
let currentProfileIndex = 0;
let profiles = [];
let isLoading = false;

// Initialize WebSocket connection for real-time updates
const socket = new WebSocket(window.location.origin.replace('http', 'ws'));
socket.onmessage = handleWebSocketMessage;

// Load initial profiles
async function loadProfiles() {
    try {
        isLoading = true;
        showLoading();

        const response = await fetch(API.discover);
        if (!response.ok) throw new Error('Failed to fetch profiles');

        const data = await response.json();
        if (data.success && data.data.profiles) {
            profiles = data.data.profiles;
            await loadProfile();
        }
    } catch (error) {
        showError('Error loading profiles. Please try again.');
        console.error('Profile loading error:', error);
    } finally {
        isLoading = false;
        hideLoading();
    }
}

// Load and display a profile
async function loadProfile() {
    if (profiles.length === 0 || currentProfileIndex >= profiles.length) {
        await loadMoreProfiles();
        return;
    }

    const profile = profiles[currentProfileIndex];
    const card = document.getElementById('datingCard');
    
    if (!card) return;

    card.classList.remove('card-enter');
    setTimeout(() => card.classList.add('card-enter'), 10);
    
    document.getElementById('datingCardContent').innerHTML = `
        <div style="height: 100%; background: ${profile.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}; position: relative;">
            <img class="card-image" src="${profile.photos[0]}" alt="Profile photo" onerror="this.src='assets/default-profile.jpg'">
            <div class="card-info">
                <div class="card-name">${profile.user.firstName}, ${profile.age}</div>
                <div class="card-details">📍 ${profile.location.city} • 🎓 ${profile.occupation || 'Not specified'}</div>
                <div class="card-bio">${profile.bio}</div>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${profile.interests.map(interest => 
                        `<span style="padding: 0.25rem 0.75rem; background: rgba(255,255,255,0.2); border-radius: 20px; font-size: 0.85rem;">${interest}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
    `;

    // Update compatibility score if available
    if (profile.matchScore) {
        updateCompatibilityScore(profile.matchScore);
    }
}

// Load more profiles when running low
async function loadMoreProfiles() {
    try {
        const page = Math.floor(profiles.length / 10) + 1;
        const response = await fetch(`${API.discover}?page=${page}`);
        if (!response.ok) throw new Error('Failed to fetch more profiles');

        const data = await response.json();
        if (data.success && data.data.profiles) {
            profiles = [...profiles, ...data.data.profiles];
            if (profiles.length === 0) {
                showNoMoreProfiles();
            } else {
                currentProfileIndex = Math.min(currentProfileIndex, profiles.length - 1);
                await loadProfile();
            }
        }
    } catch (error) {
        showError('Error loading more profiles');
        console.error('Load more profiles error:', error);
    }
}

// Swipe card left or right
async function swipeCard(direction) {
    if (isLoading || !profiles[currentProfileIndex]) return;

    const card = document.getElementById('datingCard');
    const reasonPanel = document.getElementById('swipeReasonPanel');
    
    try {
        const profile = profiles[currentProfileIndex];
        const action = direction === 'left' ? 'pass' : 'like';

        // Animate card
        if (direction === 'left') {
            card.style.transform = 'translateX(-150%) rotate(-30deg)';
            reasonPanel.style.display = 'block';
            setTimeout(() => reasonPanel.style.display = 'none', 3000);
        } else {
            card.style.transform = 'translateX(150%) rotate(30deg)';
        }

        // Send swipe to backend
        const response = await fetch(API.swipe, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                targetUserId: profile.user.id,
                action
            })
        });

        const data = await response.json();
        
        // Handle match
        if (data.success && data.data.isMatch) {
            showMatch(profile);
            updateMatchCount(1);
        }

    } catch (error) {
        showError('Error processing swipe');
        console.error('Swipe error:', error);
    } finally {
        // Reset card position and load next profile
        setTimeout(() => {
            card.style.transform = 'translateX(0) rotate(0)';
            currentProfileIndex++;
            loadProfile();
        }, 300);
    }
}

// Super like functionality
async function superLike() {
    if (isLoading || !profiles[currentProfileIndex]) return;

    const card = document.getElementById('datingCard');
    
    try {
        const profile = profiles[currentProfileIndex];

        card.style.transform = 'translateY(-150%) scale(1.1)';

        const response = await fetch(API.swipe, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                targetUserId: profile.user.id,
                action: 'superlike'
            })
        });

        const data = await response.json();
        
        if (data.success && data.data.isMatch) {
            showMatch(profile);
            updateMatchCount(1);
        }

    } catch (error) {
        showError('Error processing super like');
        console.error('Super like error:', error);
    } finally {
        setTimeout(() => {
            card.style.transform = 'translateX(0) rotate(0) scale(1)';
            currentProfileIndex++;
            loadProfile();
        }, 300);
    }
}

// Rewind last swipe
async function rewindSwipe() {
    if (currentProfileIndex > 0) {
        currentProfileIndex--;
        await loadProfile();
    }
}

// Handle WebSocket messages
function handleWebSocketMessage(event) {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
        case 'new_match':
            showMatch(data.profile);
            updateMatchCount(1);
            break;
        case 'message':
            showNewMessage(data.message);
            break;
        case 'profile_update':
            updateProfileInList(data.profile);
            break;
    }
}

// Update match count display
function updateMatchCount(increment) {
    const matchCount = document.getElementById('matchesToday');
    if (matchCount) {
        const current = parseInt(matchCount.textContent);
        matchCount.textContent = current + increment;
    }
}

// Show match modal
function showMatch(profile) {
    // Implementation of match celebration modal
    const modal = document.createElement('div');
    modal.className = 'match-modal active';
    modal.innerHTML = `
        <div class="match-content">
            <h2>It's a Match! 🎉</h2>
            <div class="match-profiles">
                <div class="match-profile">
                    <img src="${profile.photos[0]}" alt="${profile.user.firstName}">
                    <div>${profile.user.firstName}</div>
                </div>
            </div>
            <div class="match-actions">
                <button onclick="sendMessage('${profile.user.id}')" class="btn btn-primary">Send Message</button>
                <button onclick="keepSwiping()" class="btn btn-secondary">Keep Swiping</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Error handling
function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Loading state management
function showLoading() {
    const loader = document.getElementById('loadingOverlay');
    if (loader) loader.style.display = 'flex';
}

function hideLoading() {
    const loader = document.getElementById('loadingOverlay');
    if (loader) loader.style.display = 'none';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProfiles();
    initializeChat();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (document.querySelector('.modal-overlay.active')) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                swipeCard('left');
                break;
            case 'ArrowRight':
                swipeCard('right');
                break;
            case 'ArrowUp':
                superLike();
                break;
        }
    });
});

// Chat functionality
let currentMatchId = null;
let currentUserId = null;

function initializeChat() {
    // Get current user ID from the server
    fetch('/api/v1/auth/me')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUserId = data.data.userId;
            }
        })
        .catch(error => console.error('Error fetching user ID:', error));
}

async function sendMessage(matchId, content) {
    try {
        const response = await fetch('/api/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                matchId,
                content,
                messageType: 'text'
            })
        });

        if (!response.ok) throw new Error('Failed to send message');

        const data = await response.json();
        if (data.success) {
            appendMessage(document.querySelector('.chat-messages'), {
                id: data.data.message.id,
                content,
                senderId: currentUserId,
                createdAt: new Date(),
                status: 'sending'
            });

            // Update message status after sending
            updateMessageStatus(data.data.message.id, 'sent');
        }
    } catch (error) {
        showError('Failed to send message');
        console.error('Message send error:', error);
    }
}

function loadChatHistory(matchId) {
    currentMatchId = matchId;
    const chatContainer = document.querySelector('.chat-messages');
    if (!chatContainer) return;

    fetch(`/api/v1/messages/conversations/${matchId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                chatContainer.innerHTML = '';
                data.data.messages.forEach(message => appendMessage(chatContainer, message));
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        })
        .catch(error => {
            showError('Failed to load chat history');
            console.error('Chat history error:', error);
        });
}

function updateMessageStatus(messageId, status) {
    const message = document.querySelector(`[data-message-id="${messageId}"]`);
    if (message) {
        const statusIndicator = message.querySelector('.message-status');
        if (statusIndicator) {
            statusIndicator.innerHTML = getStatusIcon(status);
        }
    }
}

function getStatusIcon(status) {
    const icons = {
        'sending': '<i class="fas fa-clock"></i>',
        'sent': '<i class="fas fa-check"></i>',
        'delivered': '<i class="fas fa-check-double"></i>',
        'read': '<i class="fas fa-check-double read"></i>',
        'error': '<i class="fas fa-exclamation-circle"></i>'
    };
    return icons[status] || icons.sent;
}

function showNewMessage(message) {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer && message.matchId === currentMatchId) {
        appendMessage(chatContainer, message);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Mark message as read if it's not from current user
        if (message.senderId !== currentUserId) {
            markMessageAsRead(message.id);
        }
    }
}

function appendMessage(container, message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.senderId === currentUserId ? 'own-message' : ''}`;
    messageElement.dataset.messageId = message.id;
    messageElement.innerHTML = `
        <div class="message-content">
            <div class="message-text">${message.content}</div>
            <div class="message-time">
                ${new Date(message.createdAt).toLocaleTimeString()}
                ${message.senderId === currentUserId ? 
                    `<span class="message-status">${getStatusIcon(message.status || 'sent')}</span>` : 
                    ''}
            </div>
        </div>
    `;
    container.appendChild(messageElement);
}

function markMessageAsRead(messageId) {
    fetch('/api/v1/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds: [messageId] })
    }).catch(error => console.error('Error marking message as read:', error));
}
