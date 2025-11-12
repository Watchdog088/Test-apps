/**
 * DATING FEATURE INTEGRATION
 * Ensures complete integration of:
 * - Swipe mechanics
 * - Matching algorithm UI
 * - Chat integration
 * - Navigation between all dating sections
 * - Post-match flow
 */

// ============================================================================
// ENHANCED SWIPE MECHANICS WITH PROPER UI INTEGRATION
// ============================================================================

let datingProfiles = [];
let currentProfileIndex = 0;
let swipeInProgress = false;

// Initialize dating feature
function initializeDatingFeature() {
    console.log('🎯 Initializing Dating Feature Integration');
    
    // Load initial profiles
    loadDatingProfiles();
    
    // Set up swipe gesture listeners
    setupSwipeGestures();
    
    // Initialize stats dashboard
    initializeStatsDashboard();
    
    // Set up keyboard shortcuts
    setupDatingKeyboardShortcuts();
    
    // Load icebreakers
    loadIcebreakers();
    
    console.log('✅ Dating Feature Integration Complete');
}

// Load dating profiles with matching algorithm data
async function loadDatingProfiles() {
    try {
        showLoading();
        
        // Simulate API call to get profiles with compatibility scores
        const profiles = generateSampleProfiles();
        datingProfiles = profiles;
        
        if (datingProfiles.length > 0) {
            displayProfile(datingProfiles[currentProfileIndex]);
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading profiles:', error);
        showToast('Error loading profiles. Please try again.', 'error');
        hideLoading();
    }
}

// Generate sample profiles with matching algorithm scores
function generateSampleProfiles() {
    const names = ['Sarah', 'Emma', 'Jessica', 'Amanda', 'Rachel', 'Olivia', 'Sophia', 'Isabella'];
    const ages = [24, 25, 26, 27, 28, 29, 30, 31];
    const bios = [
        'Love hiking, coffee, and spontaneous adventures! 🏔️☕',
        'Artist and designer. Looking for creative connections 🎨',
        'Foodie, traveler, and yoga enthusiast 🧘‍♀️🌍',
        'Tech professional who loves the outdoors 💻🌲',
        'Musician seeking harmony in life and love 🎵',
        'Bookworm with a passion for photography 📚📸',
        'Fitness trainer helping others achieve their goals 💪',
        'Entrepreneur building the next big thing 🚀'
    ];
    const interests = [
        ['Coffee', 'Hiking', 'Photography'],
        ['Art', 'Yoga', 'Music'],
        ['Travel', 'Food', 'Dancing'],
        ['Tech', 'Outdoors', 'Camping'],
        ['Music', 'Concerts', 'Festivals'],
        ['Books', 'Photography', 'Writing'],
        ['Fitness', 'Health', 'Sports'],
        ['Business', 'Tech', 'Innovation']
    ];
    
    return names.map((name, index) => ({
        id: `profile_${index + 1}`,
        name: name,
        age: ages[index],
        bio: bios[index],
        interests: interests[index],
        distance: Math.floor(Math.random() * 20) + 1,
        matchScore: Math.floor(Math.random() * 30) + 70, // 70-100% compatibility
        photos: [`https://images.unsplash.com/photo-${1494790108377 + index}?w=400&h=600&fit=crop`],
        verified: Math.random() > 0.5,
        lastActive: 'Active now',
        occupation: ['Designer', 'Engineer', 'Artist', 'Teacher', 'Doctor', 'Chef', 'Entrepreneur', 'Manager'][index]
    }));
}

// Display profile with matching algorithm score
function displayProfile(profile) {
    if (!profile) return;
    
    const card = document.getElementById('datingCard');
    const content = document.getElementById('datingCardContent');
    
    if (!card || !content) return;
    
    // Reset card position and animation
    card.style.transform = 'translateX(0) rotate(0) scale(1)';
    card.classList.remove('card-enter');
    setTimeout(() => card.classList.add('card-enter'), 10);
    
    // Update card content with matching score
    content.innerHTML = `
        <div style="height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative;">
            <img class="card-image" src="${profile.photos[0]}" alt="${profile.name}'s profile photo" onerror="this.src='data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 400 600%27><rect fill=%27%23667eea%27 width=%27400%27 height=%27600%27/><text x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-size=%2760%27 fill=%27white%27>📷</text></svg>'">
            
            <!-- Match Score Badge -->
            <div style="position: absolute; top: 1rem; left: 1rem; background: rgba(255,255,255,0.95); padding: 0.5rem 1rem; border-radius: 20px; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
                <span style="font-size: 1.2rem;">✨</span>
                <span style="color: #10b981;">${profile.matchScore}% Match</span>
            </div>
            
            <!-- Verified Badge -->
            ${profile.verified ? `
                <div style="position: absolute; top: 1rem; right: 1rem; background: rgba(59, 130, 246, 0.95); padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; color: white; display: flex; align-items: center; gap: 0.3rem;">
                    <span>✓</span>
                    <span>Verified</span>
                </div>
            ` : ''}
            
            <div class="card-info">
                <div class="card-name">${profile.name}, ${profile.age}</div>
                <div class="card-details">📍 ${profile.distance} miles away • 💼 ${profile.occupation}</div>
                <div class="card-bio">${profile.bio}</div>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${profile.interests.map(interest => 
                        `<span style="padding: 0.25rem 0.75rem; background: rgba(255,255,255,0.2); border-radius: 20px; font-size: 0.85rem;">${interest}</span>`
                    ).join('')}
                </div>
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(255,255,255,0.15); border-radius: 12px; font-size: 0.9rem;">
                    <strong>Why we matched:</strong> You both love ${profile.interests[0]} and ${profile.interests[1]}!
                </div>
            </div>
        </div>
    `;
    
    // Update compatibility display
    updateCompatibilityScore(profile.matchScore);
}

// Update compatibility score display
function updateCompatibilityScore(score) {
    // You can update a separate UI element showing compatibility
    const scoreElement = document.querySelector('.compatibility-score');
    if (scoreElement) {
        scoreElement.textContent = `${score}% Compatible`;
        scoreElement.style.color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
    }
}

// Enhanced swipe card function with animations and matching
async function enhancedSwipeCard(direction) {
    if (swipeInProgress || currentProfileIndex >= datingProfiles.length) return;
    
    swipeInProgress = true;
    const card = document.getElementById('datingCard');
    const currentProfile = datingProfiles[currentProfileIndex];
    
    if (!card || !currentProfile) {
        swipeInProgress = false;
        return;
    }
    
    // Animate card
    if (direction === 'left') {
        card.style.transform = 'translateX(-150%) rotate(-30deg)';
        showSwipeIndicator('❌', 'left');
    } else if (direction === 'right') {
        card.style.transform = 'translateX(150%) rotate(30deg)';
        showSwipeIndicator('💚', 'right');
    } else if (direction === 'up') {
        card.style.transform = 'translateY(-150%) scale(1.1)';
        showSwipeIndicator('⭐', 'up');
    }
    
    // Send swipe to backend
    try {
        const response = await sendSwipeAction(currentProfile.id, direction);
        
        // Check for match
        if (response.isMatch) {
            setTimeout(() => {
                triggerMatchAnimation(currentProfile);
            }, 300);
        }
        
        // Update stats
        updateDatingStats(direction);
        
    } catch (error) {
        console.error('Swipe error:', error);
    }
    
    // Move to next profile
    setTimeout(() => {
        card.style.transform = 'translateX(0) rotate(0) scale(1)';
        currentProfileIndex++;
        
        if (currentProfileIndex < datingProfiles.length) {
            displayProfile(datingProfiles[currentProfileIndex]);
        } else {
            showNoMoreProfiles();
        }
        
        swipeInProgress = false;
    }, 300);
}

// Show swipe indicator animation
function showSwipeIndicator(emoji, direction) {
    const indicator = document.createElement('div');
    indicator.style.cssText = `
        position: fixed;
        top: 50%;
        ${direction === 'left' ? 'left: 20%' : direction === 'right' ? 'right: 20%' : 'left: 50%; transform: translateX(-50%)'};
        font-size: 5rem;
        z-index: 1000;
        animation: swipeIndicator 0.5s ease;
        pointer-events: none;
    `;
    indicator.textContent = emoji;
    document.body.appendChild(indicator);
    
    setTimeout(() => indicator.remove(), 500);
}

// Send swipe action to backend
async function sendSwipeAction(profileId, direction) {
    const action = direction === 'left' ? 'pass' : direction === 'right' ? 'like' : 'superlike';
    
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            const isMatch = action !== 'pass' && Math.random() > 0.7; // 30% match rate
            resolve({ success: true, isMatch, profileId, action });
        }, 500);
    });
}

// Trigger match animation and flow
function triggerMatchAnimation(profile) {
    // Dispatch event for post-match flow
    const matchEvent = new CustomEvent('datingMatchCreated', {
        detail: {
            id: profile.id,
            name: profile.name,
            age: profile.age,
            avatar: '😊',
            interests: profile.interests,
            matchScore: profile.matchScore
        }
    });
    document.dispatchEvent(matchEvent);
}

// Show no more profiles message
function showNoMoreProfiles() {
    const card = document.getElementById('datingCard');
    const content = document.getElementById('datingCardContent');
    
    if (content) {
        content.innerHTML = `
            <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center; padding: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🎯</div>
                <h3 style="color: white; margin-bottom: 1rem;">You've seen everyone nearby!</h3>
                <p style="color: rgba(255,255,255,0.9); margin-bottom: 2rem;">Check back later for new profiles</p>
                <button class="btn btn-primary" onclick="expandSearchRadius()">Expand Search Radius</button>
                <button class="btn btn-secondary" style="margin-top: 1rem;" onclick="loadDatingProfiles()">Refresh</button>
            </div>
        `;
    }
}

function expandSearchRadius() {
    showToast('Search radius expanded to 50 miles', 'success');
    loadDatingProfiles();
}

// ============================================================================
// STATS DASHBOARD INTEGRATION
// ============================================================================

function initializeStatsDashboard() {
    // Make stats clickable
    const statsElements = [
        { id: 'likesReceived', action: () => showLikesReceivedDashboard() },
        { id: 'matchesToday', action: () => switchToScreen('dating', 'matches') },
        { id: 'profileViews', action: () => window.datingPostMatchFlow?.showProfileViewsDashboard() }
    ];
    
    statsElements.forEach(({ id, action }) => {
        const element = document.getElementById(id);
        if (element) {
            element.style.cursor = 'pointer';
            element.onclick = action;
            element.parentElement.style.cursor = 'pointer';
            element.parentElement.onclick = action;
        }
    });
}

function showLikesReceivedDashboard() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>💚 People Who Liked You</h2>
                <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">These people have liked your profile. Like them back to create a match!</p>
            
            <div class="grid-3">
                ${[1, 2, 3, 4, 5, 6].map(i => `
                    <div class="card" style="text-align: center;">
                        <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 3rem;">
                            😊
                        </div>
                        <h4>Profile ${i}</h4>
                        <p style="color: var(--text-secondary); margin: 0.5rem 0;">85% Match</p>
                        <button class="btn btn-primary btn-small" onclick="viewLikerProfile(${i})">View Profile</button>
                    </div>
                `).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 2rem;">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function viewLikerProfile(id) {
    showToast('Viewing profile...', 'info');
}

function updateDatingStats(action) {
    // Update matches count if it was a match
    if (action === 'right' || action === 'up') {
        const matchesElement = document.getElementById('matchesToday');
        if (matchesElement) {
            const current = parseInt(matchesElement.textContent);
            matchesElement.textContent = current + (Math.random() > 0.7 ? 1 : 0);
        }
    }
}

// ============================================================================
// CHAT INTEGRATION
// ============================================================================

// Open chat with a specific match
function openDatingChat(matchId, matchName) {
    console.log(`Opening chat with match: ${matchId}`);
    
    // Switch to dating chat screen
    switchToScreen('dating', 'chat');
    
    // Populate chat area
    const chatArea = document.getElementById('datingChatArea');
    if (chatArea) {
        chatArea.innerHTML = `
            <div style="padding: 1rem; border-bottom: 1px solid var(--glass-border); display: flex; align-items: center; gap: 1rem;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                    😊
                </div>
                <div style="flex: 1;">
                    <h4 style="margin: 0;">${matchName}</h4>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">Active now</p>
                </div>
                <button class="btn btn-secondary btn-small" onclick="videoCallMatch('${matchId}')">📹 Video Call</button>
            </div>
            
            <div style="flex: 1; overflow-y: auto; padding: 1.5rem;" class="chat-messages" id="chatMessages">
                <div style="text-align: center; color: var(--text-secondary); margin-bottom: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">💕</div>
                    <p>You matched with ${matchName}!</p>
                    <p style="font-size: 0.9rem;">Start the conversation with an icebreaker</p>
                </div>
                
                <div class="message" style="margin-bottom: 1rem;">
                    <div style="background: var(--glass); padding: 0.75rem 1rem; border-radius: 16px; border-radius-top-left: 4px; max-width: 70%;">
                        <p style="margin: 0;">Hey! I saw you like hiking too! 😊</p>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">2:30 PM</div>
                    </div>
                </div>
            </div>
            
            <div style="padding: 1rem; border-top: 1px solid var(--glass-border);">
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary btn-small" onclick="sendEmoji()">😊</button>
                    <button class="btn btn-secondary btn-small" onclick="sendGif()">GIF</button>
                    <input type="text" id="messageInput" placeholder="Type a message..." style="flex: 1; padding: 0.75rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-primary);" onkeypress="if(event.key==='Enter') sendDatingMessage('${matchId}')">
                    <button class="btn btn-primary" onclick="sendDatingMessage('${matchId}')">Send</button>
                </div>
            </div>
        `;
    }
    
    // Load chat history
    loadMatchChatHistory(matchId);
}

function sendDatingMessage(matchId) {
    const input = document.getElementById('messageInput');
    if (!input || !input.value.trim()) return;
    
    const message = input.value.trim();
    const messagesContainer = document.getElementById('chatMessages');
    
    if (messagesContainer) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message own-message';
        messageElement.style.cssText = 'margin-bottom: 1rem; display: flex; justify-content: flex-end;';
        messageElement.innerHTML = `
            <div style="background: var(--primary); color: white; padding: 0.75rem 1rem; border-radius: 16px; border-bottom-right-radius: 4px; max-width: 70%;">
                <p style="margin: 0;">${message}</p>
                <div style="font-size: 0.75rem; opacity: 0.8; margin-top: 0.25rem;">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
        `;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    input.value = '';
    showToast('Message sent', 'success');
    
    // Simulate response
    setTimeout(() => simulateMatchResponse(matchId), 2000);
}

function simulateMatchResponse(matchId) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    const responses = [
        "That's awesome! Where's your favorite trail?",
        "I'd love to hear more about that!",
        "Same here! We should definitely talk more about this",
        "That sounds amazing! Tell me more 😊"
    ];
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.style.cssText = 'margin-bottom: 1rem;';
    messageElement.innerHTML = `
        <div style="background: var(--glass); padding: 0.75rem 1rem; border-radius: 16px; border-top-left-radius: 4px; max-width: 70%;">
            <p style="margin: 0;">${responses[Math.floor(Math.random() * responses.length)]}</p>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
    `;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function loadMatchChatHistory(matchId) {
    console.log(`Loading chat history for match: ${matchId}`);
    // Chat history is already shown in the template above
}

function videoCallMatch(matchId) {
    showToast('Starting video call...', 'info');
    setTimeout(() => {
        showToast('Video call feature - UI Available', 'info');
    }, 1000);
}

function sendEmoji() {
    showToast('Emoji picker - UI Available', 'info');
}

function sendGif() {
    showToast('GIF picker - UI Available', 'info');
}

// ============================================================================
// SWIPE GESTURES
// ============================================================================

function setupSwipeGestures() {
    const card = document.getElementById('datingCard');
    if (!card) return;
    
    let startX = 0, startY = 0, currentX = 0, currentY = 0;
    let isDragging = false;
    
    card.addEventListener('mousedown', startDrag);
    card.addEventListener('touchstart', startDrag);
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    
    function startDrag(e) {
        if (swipeInProgress) return;
        isDragging = true;
        const touch = e.touches ? e.touches[0] : e;
        startX = touch.clientX;
        startY = touch.clientY;
        card.style.transition = 'none';
    }
    
    function drag(e) {
        if (!isDragging || swipeInProgress) return;
        const touch = e.touches ? e.touches[0] : e;
        currentX = touch.clientX - startX;
        currentY= touch.clientY - startY;
        
        const rotation = currentX / 20;
        card.style.transform = `translateX(${currentX}px) translateY(${currentY}px) rotate(${rotation}deg)`;
        
        // Show indicators
        if (Math.abs(currentX) > 50) {
            if (currentX > 0) {
                showSwipeOverlay('like');
            } else {
                showSwipeOverlay('pass');
            }
        } else if (currentY < -50) {
            showSwipeOverlay('superlike');
        } else {
            hideSwipeOverlay();
        }
    }
    
    function endDrag(e) {
        if (!isDragging || swipeInProgress) return;
        isDragging = false;
        card.style.transition = 'transform 0.3s ease';
        
        // Determine swipe direction
        if (currentX > 100) {
            enhancedSwipeCard('right');
        } else if (currentX < -100) {
            enhancedSwipeCard('left');
        } else if (currentY < -100) {
            enhancedSwipeCard('up');
        } else {
            card.style.transform = 'translateX(0) translateY(0) rotate(0)';
        }
        
        hideSwipeOverlay();
        currentX = 0;
        currentY = 0;
    }
}

function showSwipeOverlay(type) {
    // Visual feedback during swipe
}

function hideSwipeOverlay() {
    // Hide visual feedback
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

function setupDatingKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only work when on dating swipe screen
        const datingSwipe = document.getElementById('datingSwipe');
        if (!datingSwipe || !datingSwipe.classList.contains('active')) return;
        
        // Prevent if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                enhancedSwipeCard('left');
                break;
            case 'ArrowRight':
                e.preventDefault();
                enhancedSwipeCard('right');
                break;
            case 'ArrowUp':
                e.preventDefault();
                enhancedSwipeCard('up');
                break;
            case 'r':
            case 'R':
                if (e.ctrlKey || e.metaKey) return;
                e.preventDefault();
                enhancedRewindSwipe();
                break;
        }
    });
}

function enhancedRewindSwipe() {
    if (currentProfileIndex > 0) {
        currentProfileIndex--;
        displayProfile(datingProfiles[currentProfileIndex]);
        showToast('Rewound to previous profile', 'success');
    } else {
        showToast('No more profiles to rewind', 'info');
    }
}

// ============================================================================
// ICEBREAKERS
// ============================================================================

function loadIcebreakers() {
    const icebreakers = [
        "What's your favorite hidden gem in the city?",
        "Coffee or tea? ☕🍵",
        "What's the best concert you've been to?",
        "If you could travel anywhere right now, where would you go?",
        "What's your go-to weekend activity?",
        "Favorite way to spend a rainy day?",
        "What's the last book you read?",
        "Morning person or night owl? 🌅🌙"
    ];
    
    const container = document.getElementById('icebreakerList');
    if (container) {
        container.innerHTML = icebreakers.slice(0, 3).map(icebreaker => `
            <div class="icebreaker-item" onclick="useIcebreaker(this)" style="padding: 0.75rem; margin-bottom: 0.5rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--glass-border)'">
                "${icebreaker}"
            </div>
        `).join('');
    }
}

function useIcebreaker(element) {
    const text = element.textContent.trim().replace(/"/g, '');
    navigator.clipboard.writeText(text).then(() => {
        showToast('Icebreaker copied! Open a match to use it', 'success');
    });
}

// ============================================================================
// POPULATE MATCHES LIST
// ============================================================================

function populateDatingMatches() {
    const matchesList = document.getElementById('matchesList');
    const chatList = document.getElementById('datingChatList');
    
    const matches = [
        { id: 'match1', name: 'Sarah', age: 26, matchScore: 92, lastMessage: 'Hey! I saw you like hiking too! 😊', time: '2m ago', unread: 1 },
        { id: 'match2', name: 'Emma', age: 24, matchScore: 88, lastMessage: 'That sounds amazing!', time: '1h ago', unread: 0 },
        { id: 'match3', name: 'Jessica', age: 28, matchScore: 85, lastMessage: 'We should grab coffee sometime', time: '3h ago', unread: 2 },
        { id: 'match4', name: 'Amanda', age: 25, matchScore: 83, lastMessage: 'Thanks for the recommendation!', time: '5h ago', unread: 0 }
    ];
    
    // Populate matches grid
    if (matchesList) {
        matchesList.innerHTML = matches.map(match => `
            <div class="card" style="text-align: center; cursor: pointer;" onclick="openDatingChat('${match.id}', '${match.name}')">
                <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 3rem;">
                    😊
                </div>
                <h4>${match.name}, ${match.age}</h4>
                <p style="color: var(--text-secondary); margin: 0.5rem 0;">${match.matchScore}% Match</p>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0.5rem 0;">${match.lastMessage}</p>
                <p style="color: var(--text-muted); font-size: 0.8rem;">${match.time}</p>
                ${match.unread > 0 ? `<span style="position: absolute; top: 1rem; right: 1rem; background: var(--primary); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem;">${match.unread}</span>` : ''}
            </div>
        `).join('');
    }
    
    // Populate chat list
    if (chatList) {
        chatList.innerHTML = matches.map(match => `
            <div class="conversation-item" onclick="openDatingChat('${match.id}', '${match.name}')" style="padding: 1rem; border-bottom: 1px solid var(--glass-border); cursor: pointer; transition: background 0.3s ease;" onmouseover="this.style.background='var(--glass)'" onmouseout="this.style.background='transparent'">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">
                        😊
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                            <h4 style="margin: 0; font-weight: 600;">${match.name}</h4>
                            <span style="color: var(--text-muted); font-size: 0.8rem;">${match.time}</span>
                        </div>
                        <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${match.lastMessage}</p>
                    </div>
                    ${match.unread > 0 ? `<span style="background: var(--primary); color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0;">${match.unread}</span>` : ''}
                </div>
            </div>
        `).join('');
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.hash.includes('dating') || document.getElementById('datingCategory')?.classList.contains('active')) {
            initializeDatingFeature();
            populateDatingMatches();
        }
    });
} else {
    if (window.location.hash.includes('dating') || document.getElementById('datingCategory')?.classList.contains('active')) {
        initializeDatingFeature();
        populateDatingMatches();
    }
}

// Make functions globally available
window.initializeDatingFeature = initializeDatingFeature;
window.enhancedSwipeCard = enhancedSwipeCard;
window.openDatingChat = openDatingChat;
window.sendDatingMessage = sendDatingMessage;
window.populateDatingMatches = populateDatingMatches;
window.expandSearchRadius = expandSearchRadius;
window.viewLikerProfile = viewLikerProfile;

console.log('✅ Dating Feature Integration Loaded');
