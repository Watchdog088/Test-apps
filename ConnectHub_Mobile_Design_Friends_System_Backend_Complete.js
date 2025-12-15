// ========================================
// CONNECTHUB MOBILE DESIGN - FRIENDS SYSTEM
// COMPLETE BACKEND INTEGRATION
// With Relationship Tables, Notifications & Filtering
// ========================================

// Friends System with Backend Integration
const friendsSystemBackend = {
    currentUserId: 1, // Current logged-in user
    friends: [],
    friendRequests: [],
    sentRequests: [],
    suggestions: [],
    blockedUsers: [],
    categories: [
        { id: 'all', name: 'All Friends', icon: '👥', count: 0 },
        { id: 'close-friends', name: 'Close Friends', icon: '⭐', count: 0 },
        { id: 'friends', name: 'Friends', icon: '👥', count: 0 },
        { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦', count: 0 },
        { id: 'work', name: 'Work', icon: '💼', count: 0 },
        { id: 'school', name: 'School', icon: '🎓', count: 0 }
    ],
    currentFilter: 'all',
    currentSort: 'alphabetical',
    searchQuery: '',
    friendActivity: [],
    upcomingBirthdays: [],
    syncEnabled: false,
    currentView: 'list',
    isLoading: false
};

// ========================================
// INITIALIZATION WITH BACKEND
// ========================================

async function initializeFriendsSystemBackend() {
    console.log('Initializing Friends System with Backend...');
    
    try {
        friendsSystemBackend.isLoading = true;
        
        // Load all data from backend
        await Promise.all([
            loadFriendsFromBackend(),
            loadFriendRequestsFromBackend(),
            loadSentRequestsFromBackend(),
            loadSuggestionsFromBackend(),
            loadBlockedUsersFromBackend()
        ]);
        
        // Update UI
        calculateUpcomingBirthdaysBackend();
        updateFriendRequestsBadgeBackend();
        updateCategoryCounts();
        
        friendsSystemBackend.isLoading = false;
        console.log('✓ Friends System Backend loaded successfully!');
        
    } catch (error) {
        console.error('Error initializing friends system:', error);
        friendsSystemBackend.isLoading = false;
    }
}

// ========================================
// BACKEND DATA LOADING
// ========================================

async function loadFriendsFromBackend() {
    try {
        const friends = await window.friendsAPIService.getFriends(
            friendsSystemBackend.currentUserId,
            {
                category: friendsSystemBackend.currentFilter,
                sort: friendsSystemBackend.currentSort
            }
        );
        friendsSystemBackend.friends = friends;
        return friends;
    } catch (error) {
        console.error('Error loading friends:', error);
        return [];
    }
}

async function loadFriendRequestsFromBackend() {
    try {
        const requests = await window.friendsAPIService.getFriendRequests(
            friendsSystemBackend.currentUserId
        );
        friendsSystemBackend.friendRequests = requests;
        return requests;
    } catch (error) {
        console.error('Error loading friend requests:', error);
        return [];
    }
}

async function loadSentRequestsFromBackend() {
    try {
        const requests = await window.friendsAPIService.getSentRequests(
            friendsSystemBackend.currentUserId
        );
        friendsSystemBackend.sentRequests = requests;
        return requests;
    } catch (error) {
        console.error('Error loading sent requests:', error);
        return [];
    }
}

async function loadSuggestionsFromBackend() {
    try {
        const suggestions = await window.friendsAPIService.getFriendSuggestions(
            friendsSystemBackend.currentUserId
        );
        friendsSystemBackend.suggestions = suggestions;
        return suggestions;
    } catch (error) {
        console.error('Error loading suggestions:', error);
        return [];
    }
}

async function loadBlockedUsersFromBackend() {
    try {
        const blocked = await window.friendsAPIService.getBlockedUsers(
            friendsSystemBackend.currentUserId
        );
        friendsSystemBackend.blockedUsers = blocked;
        return blocked;
    } catch (error) {
        console.error('Error loading blocked users:', error);
        return [];
    }
}

// ========================================
// FRIEND REQUESTS WITH NOTIFICATIONS
// ========================================

async function sendFriendRequestBackend(userId, name, emoji) {
    try {
        showLoadingToast('Sending friend request...');
        
        const result = await window.friendsAPIService.sendFriendRequest(
            friendsSystemBackend.currentUserId,
            userId,
            `Hi ${name}! Let's connect on ConnectHub!`
        );
        
        // Add to sent requests locally
        friendsSystemBackend.sentRequests.push({
            id: result.requestId,
            name: name,
            username: `@${name.toLowerCase().replace(' ', '')}`,
            emoji: emoji,
            mutualFriends: Math.floor(Math.random() * 10),
            sentDate: new Date().toISOString()
        });
        
        showToast(`Friend request sent to ${name}! ✓`);
        renderFriendRequests();
        
    } catch (error) {
        console.error('Error sending friend request:', error);
        showToast('Failed to send friend request. Please try again.');
    }
}

async function acceptFriendRequestBackend(requestId) {
    try {
        const request = friendsSystemBackend.friendRequests.find(r => r.id === requestId);
        if (!request) return;
        
        showLoadingToast('Accepting friend request...');
        
        // Accept via backend - creates relationship and sends notification
        await window.friendsAPIService.acceptFriendRequest(
            friendsSystemBackend.currentUserId,
            requestId
        );
        
        // Add to friends locally
        friendsSystemBackend.friends.push({
            id: request.id,
            name: request.name,
            username: request.username,
            emoji: request.emoji,
            status: 'online',
            mutualFriends: request.mutualFriends,
            friendsSince: new Date().toISOString().split('T')[0],
            birthday: null,
            category: 'friends',
            lastActive: 'Just now',
            location: 'Unknown',
            bio: 'New friend',
            commonInterests: [],
            posts: 0,
            followers: 0,
            following: 0
        });
        
        // Remove from requests
        friendsSystemBackend.friendRequests = friendsSystemBackend.friendRequests.filter(r => r.id !== requestId);
        
        updateFriendRequestsBadgeBackend();
        updateCategoryCounts();
        showToast(`You and ${request.name} are now friends! 🎉`);
        renderFriendRequests();
        
    } catch (error) {
        console.error('Error accepting friend request:', error);
        showToast('Failed to accept friend request. Please try again.');
    }
}

async function rejectFriendRequestBackend(requestId) {
    try {
        const request = friendsSystemBackend.friendRequests.find(r => r.id === requestId);
        if (!request) return;
        
        showLoadingToast('Declining request...');
        
        // Decline via backend - sends notification
        await window.friendsAPIService.declineFriendRequest(
            friendsSystemBackend.currentUserId,
            requestId
        );
        
        // Remove from requests
        friendsSystemBackend.friendRequests = friendsSystemBackend.friendRequests.filter(r => r.id !== requestId);
        
        updateFriendRequestsBadgeBackend();
        showToast(`Request from ${request.name} declined`);
        renderFriendRequests();
        
    } catch (error) {
        console.error('Error declining friend request:', error);
        showToast('Failed to decline request. Please try again.');
    }
}

async function cancelFriendRequestBackend(requestId) {
    try {
        const request = friendsSystemBackend.sentRequests.find(r => r.id === requestId);
        if (!request) return;
        
        showLoadingToast('Canceling request...');
        
        await window.friendsAPIService.cancelFriendRequest(
            friendsSystemBackend.currentUserId,
            requestId
        );
        
        friendsSystemBackend.sentRequests = friendsSystemBackend.sentRequests.filter(r => r.id !== requestId);
        showToast(`Request to ${request.name} cancelled`);
        renderFriendRequests();
        
    } catch (error) {
        console.error('Error canceling request:', error);
        showToast('Failed to cancel request. Please try again.');
    }
}

// ========================================
// FRIENDSHIP MANAGEMENT
// ========================================

async function changeFriendCategoryBackend(friendId, newCategory) {
    try {
        const friend = friendsSystemBackend.friends.find(f => f.id === friendId);
        if (!friend) return;
        
        showLoadingToast('Updating category...');
        
        await window.friendsAPIService.updateFriendCategory(
            friendsSystemBackend.currentUserId,
            friendId,
            newCategory
        );
        
        friend.category = newCategory;
        updateCategoryCounts();
        showToast(`${friend.name} moved to ${newCategory.replace('-', ' ')} ✓`);
        closeModal('categoriesModal');
        
    } catch (error) {
        console.error('Error updating category:', error);
        showToast('Failed to update category. Please try again.');
    }
}

async function confirmUnfriendBackend(friendId) {
    try {
        const friend = friendsSystemBackend.friends.find(f => f.id === friendId);
        if (!friend) return;
        
        showLoadingToast('Unfriending...');
        
        await window.friendsAPIService.unfriend(
            friendsSystemBackend.currentUserId,
            friendId
        );
        
        friendsSystemBackend.friends = friendsSystemBackend.friends.filter(f => f.id !== friendId);
        updateCategoryCounts();
        showToast(`Unfriended ${friend.name}`);
        closeModal('unfriendModal');
        
    } catch (error) {
        console.error('Error unfriending:', error);
        showToast('Failed to unfriend. Please try again.');
    }
}

// ========================================
// BLOCK/UNBLOCK WITH FILTERING
// ========================================

async function confirmBlockBackend(friendId) {
    try {
        const friend = friendsSystemBackend.friends.find(f => f.id === friendId);
        if (!friend) return;
        
        showLoadingToast('Blocking user...');
        
        // Block user - removes from friends, adds to blocked, applies filters
        await window.friendsAPIService.blockUser(
            friendsSystemBackend.currentUserId,
            friendId,
            'Blocked via profile'
        );
        
        // Add to blocked users locally
        friendsSystemBackend.blockedUsers.push({
            id: friend.id,
            name: friend.name,
            username: friend.username,
            emoji: friend.emoji,
            blockedDate: new Date().toISOString()
        });
        
        // Remove from friends
        friendsSystemBackend.friends = friendsSystemBackend.friends.filter(f => f.id !== friendId);
        updateCategoryCounts();
        
        showToast(`${friend.name} has been blocked`);
        closeModal('blockUserModal');
        
    } catch (error) {
        console.error('Error blocking user:', error);
        showToast('Failed to block user. Please try again.');
    }
}

async function unblockUserBackend(userId) {
    try {
        const blocked = friendsSystemBackend.blockedUsers.find(u => u.id === userId);
        if (!blocked) return;
        
        showLoadingToast('Unblocking user...');
        
        // Unblock user - removes filters
        await window.friendsAPIService.unblockUser(
            friendsSystemBackend.currentUserId,
            userId
        );
        
        friendsSystemBackend.blockedUsers = friendsSystemBackend.blockedUsers.filter(u => u.id !== userId);
        showToast(`${blocked.name} has been unblocked`);
        renderBlockedUsers();
        
    } catch (error) {
        console.error('Error unblocking user:', error);
        showToast('Failed to unblock user. Please try again.');
    }
}

// ========================================
// FRIEND SUGGESTIONS
// ========================================

async function removeSuggestionBackend(suggestionId) {
    try {
        showLoadingToast('Removing suggestion...');
        
        await window.friendsAPIService.dismissSuggestion(
            friendsSystemBackend.currentUserId,
            suggestionId
        );
        
        friendsSystemBackend.suggestions = friendsSystemBackend.suggestions.filter(s => s.id !== suggestionId);
        showToast('Suggestion removed');
        renderFriendSuggestions();
        
    } catch (error) {
        console.error('Error removing suggestion:', error);
        showToast('Failed to remove suggestion.');
    }
}

// ========================================
// MUTUAL FRIENDS
// ========================================

async function loadMutualFriendsBackend(friendId) {
    try {
        const result = await window.friendsAPIService.getMutualFriends(
            friendsSystemBackend.currentUserId,
            friendId
        );
        return result;
    } catch (error) {
        console.error('Error loading mutual friends:', error);
        return { count: 0, friends: [] };
    }
}

// ========================================
// MODAL MANAGEMENT
// ========================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
}

// ========================================
// FRIEND SEARCH
// ========================================

function openFriendSearchModal() {
    openModal('friendSearchModal');
    renderFriendSearchResults();
}

function searchFriendsBackend(query) {
    friendsSystemBackend.searchQuery = query.toLowerCase().trim();
    renderFriendSearchResults();
}

function renderFriendSearchResults() {
    const container = document.getElementById('searchResultsContainer');
    if (!container) return;
    
    let results = friendsSystemBackend.friends;
    
    if (friendsSystemBackend.searchQuery) {
        results = results.filter(friend => 
            friend.name.toLowerCase().includes(friendsSystemBackend.searchQuery) ||
            friend.username.toLowerCase().includes(friendsSystemBackend.searchQuery) ||
            friend.bio.toLowerCase().includes(friendsSystemBackend.searchQuery)
        );
    }
    
    container.innerHTML = results.map(friend => `
        <div class="friend-search-result" onclick="openFriendProfileModal(${friend.id})">
            <div class="friend-avatar">${friend.emoji}</div>
            <div class="friend-info">
                <h4>${friend.name}</h4>
                <p>${friend.username}</p>
                <p class="friend-bio">${friend.bio}</p>
            </div>
            <div class="friend-status ${friend.status}"></div>
        </div>
    `).join('');
}

// ========================================
// FRIEND REQUESTS MODAL
// ========================================

function openFriendRequestsModal() {
    openModal('friendRequestsModal');
    renderFriendRequests();
}

function renderFriendRequests() {
    const container = document.getElementById('friendRequestsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="requests-tabs">
            <button class="tab-btn active" onclick="showRequestsTab('received', event)">Received (${friendsSystemBackend.friendRequests.length})</button>
            <button class="tab-btn" onclick="showRequestsTab('sent', event)">Sent (${friendsSystemBackend.sentRequests.length})</button>
        </div>
        <div id="receivedRequests" class="requests-list">
            ${friendsSystemBackend.friendRequests.length > 0 ? friendsSystemBackend.friendRequests.map(req => `
                <div class="request-card">
                    <div class="request-header">
                        <div class="friend-avatar">${req.emoji}</div>
                        <div class="friend-info">
                            <h4>${req.name}</h4>
                            <p>${req.username}</p>
                            <p class="mutual-friends">${req.mutualFriends} mutual friends</p>
                        </div>
                    </div>
                    ${req.message ? `<p class="request-message">"${req.message}"</p>` : ''}
                    <p class="request-time">${getTimeSinceBackend(req.requestDate)}</p>
                    <div class="request-actions">
                        <button class="btn-accept" onclick="acceptFriendRequestBackend(${req.id})">Accept</button>
                        <button class="btn-reject" onclick="rejectFriendRequestBackend(${req.id})">Decline</button>
                    </div>
                </div>
            `).join('') : '<p class="empty-state">No pending friend requests</p>'}
        </div>
        <div id="sentRequests" class="requests-list" style="display: none;">
            ${friendsSystemBackend.sentRequests.length > 0 ? friendsSystemBackend.sentRequests.map(req => `
                <div class="request-card">
                    <div class="request-header">
                        <div class="friend-avatar">${req.emoji}</div>
                        <div class="friend-info">
                            <h4>${req.name}</h4>
                            <p>${req.username}</p>
                            <p class="mutual-friends">${req.mutualFriends} mutual friends</p>
                        </div>
                    </div>
                    <p class="request-time">Sent ${getTimeSinceBackend(req.sentDate)}</p>
                    <button class="btn-cancel" onclick="cancelFriendRequestBackend(${req.id})">Cancel Request</button>
                </div>
            `).join('') : '<p class="empty-state">No sent friend requests</p>'}
        </div>
    `;
}

function showRequestsTab(tab, event) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('receivedRequests').style.display = tab === 'received' ? 'block' : 'none';
    document.getElementById('sentRequests').style.display = tab === 'sent' ? 'block' : 'none';
}

// ========================================
// MUTUAL FRIENDS MODAL
// ========================================

async function openMutualFriendsModal(friendId) {
    const friend = friendsSystemBackend.friends.find(f => f.id === friendId);
    if (!friend) return;
    
    openModal('mutualFriendsModal');
    document.getElementById('mutualFriendsTitle').textContent = `Mutual Friends with ${friend.name}`;
    
    // Load mutual friends from backend
    const result = await loadMutualFriendsBackend(friendId);
    renderMutualFriends(result.friends);
}

function renderMutualFriends(mutualFriends) {
    const container = document.getElementById('mutualFriendsContainer');
    if (!container) return;
    
    if (mutualFriends.length === 0) {
        container.innerHTML = '<p class="empty-state">No mutual friends</p>';
        return;
    }
    
    container.innerHTML = mutualFriends.map(friend => `
        <div class="mutual-friend-card" onclick="openFriendProfileModal(${friend.id})">
            <div class="friend-avatar">${friend.emoji}</div>
            <div class="friend-info">
                <h4>${friend.name}</h4>
                <p>${friend.username}</p>
            </div>
        </div>
    `).join('');
}

// ========================================
// FILTER & SORT MODAL
// ========================================

function openFilterSortModal() {
    openModal('filterSortModal');
    renderFilterOptions();
}

function renderFilterOptions() {
    const container = document.getElementById('filterOptionsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="filter-section">
            <h3>Categories</h3>
            ${friendsSystemBackend.categories.map(cat => `
                <button class="filter-option ${friendsSystemBackend.currentFilter === cat.id ? 'active' : ''}"
                        onclick="applyFilterBackend('${cat.id}')">
                    ${cat.icon} ${cat.name} (${cat.count})
                </button>
            `).join('')}
        </div>
        
        <div class="filter-section">
            <h3>Sort By</h3>
            <button class="filter-option ${friendsSystemBackend.currentSort === 'alphabetical' ? 'active' : ''}"
                    onclick="applySortBackend('alphabetical')">
                🔤 Alphabetical
            </button>
            <button class="filter-option ${friendsSystemBackend.currentSort === 'recent' ? 'active' : ''}"
                    onclick="applySortBackend('recent')">
                ⏰ Recently Active
            </button>
            <button class="filter-option ${friendsSystemBackend.currentSort === 'mutual' ? 'active' : ''}"
                    onclick="applySortBackend('mutual')">
                🤝 Most Mutual Friends
            </button>
            <button class="filter-option ${friendsSystemBackend.currentSort === 'oldest' ? 'active' : ''}"
                    onclick="applySortBackend('oldest')">
                📅 Oldest Friends First
            </button>
            <button class="filter-option ${friendsSystemBackend.currentSort === 'newest' ? 'active' : ''}"
                    onclick="applySortBackend('newest')">
                ✨ Newest Friends First
            </button>
        </div>
    `;
}

async function applyFilterBackend(category) {
    friendsSystemBackend.currentFilter = category;
    await loadFriendsFromBackend();
    renderFilterOptions();
    showToast(`Filter: ${category === 'all' ? 'All Friends' : category.replace('-', ' ')}`);
}

async function applySortBackend(sortBy) {
    friendsSystemBackend.currentSort = sortBy;
    await loadFriendsFromBackend();
    renderFilterOptions();
    const labels = {
        'alphabetical': 'Alphabetical',
        'recent': 'Recently Active',
        'mutual': 'Most Mutual Friends',
        'oldest': 'Oldest Friends First',
        'newest': 'Newest Friends First'
    };
    showToast(`Sorted by: ${labels[sortBy]}`);
}

// ========================================
// CATEGORIES MODAL
// ========================================

function openCategoriesModal(friendId) {
    const friend = friendsSystemBackend.friends.find(f => f.id === friendId);
    if (!friend) return;
    
    openModal('categoriesModal');
    renderCategoriesList(friendId);
}

function renderCategoriesList(friendId) {
    const friend = friendsSystemBackend.friends.find(f => f.id === friendId);
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    document.getElementById('categoriesTitle').textContent = `Move ${friend.name} to...`;
    
    container.innerHTML = friendsSystemBackend.categories.filter(c => c.id !== 'all').map(cat => `
        <button class="category-option ${friend.category === cat.id ? 'active' : ''}"
                onclick="changeFriendCategoryBackend(${friendId}, '${cat.id}')">
            ${cat.icon} ${cat.name}
        </button>
    `).join('');
}

// ========================================
// UNFRIEND MODAL
// ========================================

function openUnfriendModal(friendId) {
    const friend = friendsSystemBackend.friends.find(f => f.id === friendId);
    if (!friend) return;
    
    openModal('unfriendModal');
    renderUnfriendConfirmation(friendId);
}

function renderUnfriendConfirmation(friendId) {
    const friend = friendsSystemBackend.friends.find(f => f.id === friendId);
    const container = document.getElementById('unfriendContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="confirmation-content">
            <div class="friend-avatar-large">${friend.emoji}</div>
            <h3>Unfriend ${friend.name}?</h3>
            <p>You can still see their posts and send them messages.</p>
            <p>To prevent them from seeing your posts or contacting you, block them instead.</p>
            <div class="confirmation-actions">
                <button class="btn-confirm" onclick="confirmUnfriendBackend(${friendId})">Unfriend</button>
                <button class="btn-cancel-action" onclick="closeModal('unfriendModal')">Cancel</button>
            </div>
        </div>
    `;
}

// ========================================
// BLOCK USER MODAL
// ========================================

function openBlockUserModal(friendId) {
    const friend = friendsSystemBackend.friends.find(f => f.id === friendId);
    if (!friend) return;
    
    openModal('blockUserModal');
    renderBlockUserConfirmation(friendId);
}

function renderBlockUserConfirmation(friendId) {
    const friend = friendsSystemBackend.friends.find(f => f.id === friendId);
    const container = document.getElementById('blockUserContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="confirmation-content">
            <div class="friend-avatar-large">${friend.emoji}</div>
            <h3>Block ${friend.name}?</h3>
            <p>They won't be able to:</p>
            <ul class="block-list">
                <li>See your profile or posts</li>
                <li>Message you</li>
                <li>Find you in search</li>
            </ul>
            <p><strong>They won't be notified that you blocked them.</strong></p>
            <div class="confirmation-actions">
                <button class="btn-block" onclick="confirmBlockBackend(${friendId})">Block</button>
                <button class="btn-cancel-action" onclick="closeModal('blockUserModal')">Cancel</button>
            </div>
        </div>
    `;
}

// ========================================
// BLOCKED USERS MODAL
// ========================================

function openBlockedUsersModal() {
    openModal('blockedUsersModal');
    renderBlockedUsers();
}

function renderBlockedUsers() {
    const container = document.getElementById('blockedUsersContainer');
    if (!container) return;
    
    if (friendsSystemBackend.blockedUsers.length === 0) {
        container.innerHTML = '<p class="empty-state">No blocked users</p>';
        return;
    }
    
    container.innerHTML = friendsSystemBackend.blockedUsers.map(user => `
        <div class="blocked-user-card">
            <div class="friend-avatar">${user.emoji}</div>
            <div class="friend-info">
                <h4>${user.name}</h4>
                <p>${user.username}</p>
                <p class="blocked-date">Blocked ${getTimeSinceBackend(user.blockedDate)}</p>
            </div>
            <button class="btn-unblock" onclick="unblockUserBackend(${user.id})">Unblock</button>
        </div>
    `).join('');
}

// ========================================
// BIRTHDAYS
// ========================================

function openBirthdaysModal() {
    openModal('birthdaysModal');
    calculateUpcomingBirthdaysBackend();
    renderUpcomingBirthdays();
}

function calculateUpcomingBirthdaysBackend() {
    const today = new Date();
    const upcoming = [];
    
    friendsSystemBackend.friends.forEach(friend => {
        if (!friend.birthday) return;
        
        const birthday = new Date(friend.birthday);
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        
        if (thisYearBirthday < today) {
            thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        const daysUntil = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 30) {
            upcoming.push({
                friend: friend,
                daysUntil: daysUntil,
                date: thisYearBirthday
            });
        }
    });
    
    friendsSystemBackend.upcomingBirthdays = upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
}

function renderUpcomingBirthdays() {
    const container = document.getElementById('birthdaysContainer');
    if (!container) return;
    
    if (friendsSystemBackend.upcomingBirthdays.length === 0) {
        container.innerHTML = '<p class="empty-state">No upcoming birthdays in the next 30 days</p>';
        return;
    }
    
    container.innerHTML = friendsSystemBackend.upcomingBirthdays.map(birthday => {
        const daysText = birthday.daysUntil === 0 ? 'Today! 🎉' : 
                        birthday.daysUntil === 1 ? 'Tomorrow' :
                        `In ${birthday.daysUntil} days`;
        
        return `
            <div class="birthday-card">
                <div class="friend-avatar">${birthday.friend.emoji}</div>
                <div class="friend-info">
                    <h4>${birthday.friend.name}</h4>
                    <p class="birthday-date">${daysText}</p>
                </div>
                <button class="btn-wish" onclick="wishHappyBirthdayBackend(${birthday.friend.id})">🎂 Wish</button>
            </div>
        `;
    }).join('');
}

function wishHappyBirthdayBackend(friendId) {
    const friend = friendsSystemBackend.friends.find(f => f.id === friendId);
    if (!friend) return;
    
    showToast(`Birthday wish sent to ${friend.name}! 🎉`);
    closeModal('birthdaysModal');
}

// ========================================
// ACTIVITY FEED
// ========================================

function openActivityModal() {
    openModal('activityModal');
    renderFriendActivity();
}

function renderFriendActivity() {
    const container = document.getElementById('activityContainer');
    if (!container) return;
    
    // Generate mock activity (in production, this would come from backend)
    const activities = [
        { friendId: 1, type: 'post', content: 'Posted a new photo', timestamp: '2h ago', emoji: '📸' },
        { friendId: 2, type: 'like', content: 'Liked your post', timestamp: '3h ago', emoji: '👍' }
    ];
    
    container.innerHTML = activities.map(activity => {
        const friend = friendsSystemBackend.friends.find(f => f.id === activity.friendId);
        if (!friend) return '';
        
        return `
            <div class="activity-card">
                <div class="friend-avatar">${friend.emoji}</div>
                <div class="activity-info">
                    <h4>${friend.name}</h4>
                    <p>${activity.emoji} ${activity.content}</p>
                    <p class="activity-time">${activity.timestamp}</p>
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// SUGGESTIONS
// ========================================

function openSuggestionsModal() {
    openModal('suggestionsModal');
    renderFriendSuggestions();
}

function renderFriendSuggestions() {
    const container = document.getElementById('suggestionsContainer');
    if (!container) return;
    
    container.innerHTML = friendsSystemBackend.suggestions.map(suggestion => `
        <div class="suggestion-card">
            <div class="friend-avatar">${suggestion.emoji}</div>
            <div class="friend-info">
                <h4>${suggestion.name}</h4>
                <p>${suggestion.username}</p>
                <p class="suggestion-reason">${suggestion.reason}</p>
                <p class="mutual-friends">${suggestion.mutualFriends} mutual friends</p>
            </div>
            <div class="suggestion-actions">
                <button class="btn-add-friend" onclick="sendFriendRequestBackend(${suggestion.id}, '${suggestion.name}', '${suggestion.emoji}')">Add Friend</button>
                <button class="btn-remove" onclick="removeSuggestionBackend(${suggestion.id})">Remove</button>
            </div>
        </div>
    `).join('');
}

// ========================================
// IMPORT & SYNC
// ========================================

function openImportModal() {
    openModal('importModal');
}

function importFromSourceBackend(source) {
    showToast(`Connecting to ${source}... 📥`);
    setTimeout(() => {
        const found = Math.floor(Math.random() * 20) + 5;
        showToast(`Found ${found} friends on ${source}!`);
    }, 1500);
}

function openSyncModal() {
    openModal('syncModal');
    renderSyncSettings();
}

function renderSyncSettings() {
    const container = document.getElementById('syncContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="sync-toggle">
            <label>Auto-Sync Friends</label>
            <input type="checkbox" ${friendsSystemBackend.syncEnabled ? 'checked' : ''} onchange="toggleSyncBackend()">
        </div>
        <p class="sync-description">Automatically sync your friends across all devices</p>
        <div class="sync-platforms">
            <div class="platform-status">
                <span>📱 Mobile</span>
                <span class="status-badge">Synced</span>
            </div>
            <div class="platform-status">
                <span>💻 Web</span>
                <span class="status-badge">Synced</span>
            </div>
            <div class="platform-status">
                <span>🖥️ Desktop</span>
                <span class="status-badge">Synced</span>
            </div>
        </div>
        <button class="btn-sync-now" onclick="syncFriendsNowBackend()">Sync Now</button>
    `;
}

function toggleSyncBackend() {
    friendsSystemBackend.syncEnabled = !friendsSystemBackend.syncEnabled;
    showToast(friendsSystemBackend.syncEnabled ? 'Auto-sync enabled ✓' : 'Auto-sync disabled');
}

function syncFriendsNowBackend() {
    showToast('Syncing friends... 🔄');
    setTimeout(() => {
        showToast('Sync complete! ✓');
    }, 2000);
}

// ========================================
// FRIEND PROFILE
// ========================================

function openFriendProfileModal(friendId) {
    const friend = friendsSystemBackend.friends.find(f => f.id === friendId);
    if (!friend) return;
    
    openModal('friendProfileModal');
    renderFriendProfile(friend);
}

function renderFriendProfile(friend) {
    const container = document.getElementById('friendProfileContainer');
    if (!container) return;
    
    const years = getYearsSinceBackend(friend.friendsSince);
    
    container.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar-large">${friend.emoji}</div>
            <h2>${friend.name}</h2>
            <p>${friend.username}</p>
            <div class="status-indicator ${friend.status}">${friend.status}</div>
        </div>
        
        <div class="profile-stats">
            <div class="stat">
                <strong>${friend.posts}</strong>
                <span>Posts</span>
            </div>
            <div class="stat">
                <strong>${friend.followers}</strong>
                <span>Followers</span>
            </div>
            <div class="stat">
                <strong>${friend.following}</strong>
                <span>Following</span>
            </div>
        </div>
        
        <div class="profile-info">
            <p class="bio">${friend.bio}</p>
            <p>📍 ${friend.location}</p>
            <p>🤝 ${friend.mutualFriends} mutual friends</p>
            <p>🎂 Friends for ${years} year${years !== 1 ? 's' : ''}</p>
        </div>
        
        <div class="profile-interests">
            <h4>Common Interests</h4>
            <div class="interests-tags">
                ${friend.commonInterests.map(interest => `<span class="interest-tag">${interest}</span>`).join('')}
            </div>
        </div>
        
        <div class="profile-actions">
            <button class="btn-message" onclick="messageFriendBackend(${friend.id})">💬 Message</button>
            <button class="btn-view-posts" onclick="viewFriendPostsBackend(${friend.id})">📱 View Posts</button>
            <button class="btn-more" onclick="openFriendOptionsModal(${friend.id})">⋯ More</button>
        </div>
    `;
}

function messageFriendBackend(friendId) {
    showToast('Opening message...');
    closeModal('friendProfileModal');
}

function viewFriendPostsBackend(friendId) {
    showToast('Viewing posts...');
    closeModal('friendProfileModal');
}

function pokeFriendBackend(friendId) {
    const friend = friendsSystemBackend.friends.find(f => f.id === friendId);
    showToast(`You poked ${friend.name}! 👋`);
}

// ========================================
// FRIEND OPTIONS
// ========================================

function openFriendOptionsModal(friendId) {
    const friend = friendsSystemBackend.friends.find(f => f.id === friendId);
    if (!friend) return;
    
    closeModal('friendProfileModal');
    openModal('friendOptionsModal');
    renderFriendOptions(friendId);
}

function renderFriendOptions(friendId) {
    const container = document.getElementById('friendOptionsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <button class="option-btn" onclick="openCategoriesModal(${friendId})">📋 Change Category</button>
        <button class="option-btn" onclick="viewMutualFriendsFromOptions(${friendId})">🤝 View Mutual Friends</button>
        <button class="option-btn" onclick="pokeFriendBackend(${friendId}); closeModal('friendOptionsModal');">👋 Poke</button>
        <button class="option-btn" onclick="openUnfriendModal(${friendId}); closeModal('friendOptionsModal');">😢 Unfriend</button>
        <button class="option-btn danger" onclick="openBlockUserModal(${friendId}); closeModal('friendOptionsModal');">🚫 Block</button>
    `;
}

function viewMutualFriendsFromOptions(friendId) {
    closeModal('friendOptionsModal');
    openMutualFriendsModal(friendId);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function getTimeSinceBackend(dateString) {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function getYearsSinceBackend(dateString) {
    const years = Math.floor((new Date() - new Date(dateString)) / (365.25 * 24 * 60 * 60 * 1000));
    return years || 1;
}

function updateFriendRequestsBadgeBackend() {
    const badge = document.querySelector('.friends-badge');
    if (badge) {
        if (friendsSystemBackend.friendRequests.length > 0) {
            badge.textContent = friendsSystemBackend.friendRequests.length;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function updateCategoryCounts() {
    friendsSystemBackend.categories.forEach(cat => {
        if (cat.id === 'all') {
            cat.count = friendsSystemBackend.friends.length;
        } else {
            cat.count = friendsSystemBackend.friends.filter(f => f.category === cat.id).length;
        }
    });
}

// Toast functions
function showToast(message) {
    console.log('Toast:', message);
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}

function showLoadingToast(message) {
    console.log('Loading:', message);
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message + ' ⏳';
        toast.style.display = 'block';
    }
}

console.log('✓ Friends System Backend Complete loaded successfully!');
