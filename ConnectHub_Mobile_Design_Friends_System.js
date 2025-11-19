// ========================================
// CONNECTHUB MOBILE DESIGN - FRIENDS SYSTEM
// Complete Friends Management Implementation
// ========================================

// Friends System State Management
const friendsSystem = {
    friends: [
        { id: 1, name: 'Sarah Johnson', username: '@sarahjohnson', emoji: '👤', status: 'online', mutualFriends: 12, friendsSince: '2020-03-15', birthday: '1995-05-20', category: 'close-friends', lastActive: 'Just now', location: 'San Francisco, CA', bio: 'Tech enthusiast | Coffee lover', commonInterests: ['Technology', 'Photography', 'Travel'] },
        { id: 2, name: 'Mike Chen', username: '@mikechen', emoji: '😊', status: 'active', mutualFriends: 8, friendsSince: '2021-07-10', birthday: '1993-09-12', category: 'friends', lastActive: '2h ago', location: 'Los Angeles, CA', bio: 'Gamer | Developer', commonInterests: ['Gaming', 'Coding', 'Music'] },
        { id: 3, name: 'Emily Rodriguez', username: '@emilyrodriguez', emoji: '🎨', status: 'offline', mutualFriends: 5, friendsSince: '2022-01-20', birthday: '1996-12-08', category: 'friends', lastActive: '1d ago', location: 'New York, NY', bio: 'Artist | Designer', commonInterests: ['Art', 'Design', 'Photography'] },
        { id: 4, name: 'David Kim', username: '@davidkim', emoji: '🚀', status: 'online', mutualFriends: 3, friendsSince: '2022-05-15', birthday: '1994-03-25', category: 'friends', lastActive: 'Just now', location: 'Seattle, WA', bio: 'Entrepreneur | Startup founder', commonInterests: ['Business', 'Technology', 'Fitness'] },
        { id: 5, name: 'Jessica Lee', username: '@jessicalee', emoji: '🎭', status: 'active', mutualFriends: 7, friendsSince: '2021-11-30', birthday: '1997-07-18', category: 'family', lastActive: '30m ago', location: 'Austin, TX', bio: 'Content creator | Performer', commonInterests: ['Theater', 'Music', 'Dance'] },
        { id: 6, name: 'Alex Thompson', username: '@alexthompson', emoji: '⚡', status: 'online', mutualFriends: 15, friendsSince: '2019-08-05', birthday: '1992-11-02', category: 'close-friends', lastActive: 'Just now', location: 'Chicago, IL', bio: 'Athlete | Coach', commonInterests: ['Sports', 'Fitness', 'Nutrition'] }
    ],
    
    friendRequests: [
        { id: 101, name: 'Emily Rodriguez', username: '@emilyrodriguez', emoji: '🎨', mutualFriends: 5, requestDate: '2024-12-18T10:30:00', message: 'Hey! We have mutual friends. Would love to connect!' },
        { id: 102, name: 'David Kim', username: '@davidkim', emoji: '🚀', mutualFriends: 3, requestDate: '2024-12-17T15:20:00', message: null }
    ],
    
    sentRequests: [
        { id: 201, name: 'Chris Anderson', username: '@chrisanderson', emoji: '💼', mutualFriends: 4, sentDate: '2024-12-15T14:00:00' }
    ],
    
    suggestions: [
        { id: 301, name: 'Kevin Brown', username: '@kevinbrown', emoji: '🎯', mutualFriends: 8, reason: 'Works at Tech Corp', score: 95 },
        { id: 302, name: 'Lisa Wang', username: '@lisawang', emoji: '💡', mutualFriends: 5, reason: 'Member of Tech Enthusiasts group', score: 88 },
        { id: 303, name: 'James Miller', username: '@jamesmiller', emoji: '🏃', mutualFriends: 4, reason: 'Went to Stanford University', score: 82 }
    ],
    
    blockedUsers: [],
    categories: ['all', 'close-friends', 'friends', 'family', 'work', 'school'],
    currentFilter: 'all',
    currentSort: 'alphabetical',
    searchQuery: '',
    
    friendActivity: [
        { friendId: 1, type: 'post', content: 'Posted a new photo', timestamp: '2h ago', emoji: '📸' },
        { friendId: 2, type: 'like', content: 'Liked your post', timestamp: '3h ago', emoji: '👍' }
    ],
    
    upcomingBirthdays: [],
    syncEnabled: false
};

// Initialize Friends System
function initializeFriendsSystem() {
    console.log('Initializing Friends System...');
    calculateUpcomingBirthdays();
    updateFriendRequestsBadge();
}

// 1. FRIEND SEARCH FUNCTIONALITY
function searchFriends(query) {
    friendsSystem.searchQuery = query.toLowerCase().trim();
    if (!query) return;
    
    const results = friendsSystem.friends.filter(friend => 
        friend.name.toLowerCase().includes(friendsSystem.searchQuery) ||
        friend.username.toLowerCase().includes(friendsSystem.searchQuery)
    );
    
    showToast(`Found ${results.length} friends`);
}

// 2. FRIEND REQUEST SYSTEM
function sendFriendRequest(userId, name, emoji) {
    if (friendsSystem.friends.find(f => f.id === userId)) {
        showToast('Already friends!');
        return;
    }
    
    friendsSystem.sentRequests.push({
        id: userId,
        name: name,
        username: `@${name.toLowerCase().replace(' ', '')}`,
        emoji: emoji,
        mutualFriends: Math.floor(Math.random() * 10),
        sentDate: new Date().toISOString()
    });
    
    showToast(`Friend request sent to ${name}! ✓`);
}

function acceptFriendRequest(requestId) {
    const request = friendsSystem.friendRequests.find(r => r.id === requestId);
    if (!request) return;
    
    friendsSystem.friends.push({
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
        commonInterests: []
    });
    
    friendsSystem.friendRequests = friendsSystem.friendRequests.filter(r => r.id !== requestId);
    updateFriendRequestsBadge();
    showToast(`You and ${request.name} are now friends! 🎉`);
}

function rejectFriendRequest(requestId) {
    friendsSystem.friendRequests = friendsSystem.friendRequests.filter(r => r.id !== requestId);
    updateFriendRequestsBadge();
    showToast('Friend request declined');
}

function updateFriendRequestsBadge() {
    const badge = document.querySelector('.bottom-nav .nav-item:nth-child(5) .badge');
    if (badge) {
        if (friendsSystem.friendRequests.length > 0) {
            badge.textContent = friendsSystem.friendRequests.length;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// 3. MUTUAL FRIENDS CALCULATION
function calculateMutualFriends(friendId) {
    const friend = friendsSystem.friends.find(f => f.id === friendId);
    return friend ? friend.mutualFriends : 0;
}

function showMutualFriends(friendId, friendName) {
    const mutuals = friendsSystem.friends.slice(0, 3);
    showToast(`${mutuals.length} mutual friends with ${friendName}`);
}

// 4. FRIEND LIST FILTERING & SORTING
function filterFriends(category) {
    friendsSystem.currentFilter = category;
    showToast(`Showing: ${category === 'all' ? 'All Friends' : category.replace('-', ' ')}`);
}

function sortFriends(sortBy) {
    friendsSystem.currentSort = sortBy;
    const labels = {
        'alphabetical': 'Alphabetical',
        'recent': 'Recently Active',
        'mutual': 'Most Mutual Friends'
    };
    showToast(`Sorted by: ${labels[sortBy]}`);
}

// 5. FRIEND LIST CATEGORIES
function showCategorySelector() {
    showToast('Friend categories available ✓');
}

function changeFriendCategory(friendId, newCategory) {
    const friend = friendsSystem.friends.find(f => f.id === friendId);
    if (friend) {
        friend.category = newCategory;
        showToast(`Moved to ${newCategory.replace('-', ' ')} ✓`);
    }
}

// 6. UNFRIEND FUNCTIONALITY
function unfriendUser(friendId) {
    const friend = friendsSystem.friends.find(f => f.id === friendId);
    if (!friend) return;
    
    if (confirm(`Unfriend ${friend.name}?`)) {
        friendsSystem.friends = friendsSystem.friends.filter(f => f.id !== friendId);
        showToast(`Unfriended ${friend.name}`);
    }
}

// 7. BLOCK USER FUNCTIONALITY
function blockUserFromFriends(friendId) {
    const friend = friendsSystem.friends.find(f => f.id === friendId);
    if (!friend) return;
    
    if (confirm(`Block ${friend.name}?`)) {
        friendsSystem.blockedUsers.push({
            id: friend.id,
            name: friend.name,
            username: friend.username,
            emoji: friend.emoji,
            blockedDate: new Date().toISOString()
        });
        
        friendsSystem.friends = friendsSystem.friends.filter(f => f.id !== friendId);
        showToast(`${friend.name} has been blocked`);
    }
}

function unblockUser(userId) {
    const blocked = friendsSystem.blockedUsers.find(u => u.id === userId);
    if (!blocked) return;
    
    friendsSystem.blockedUsers = friendsSystem.blockedUsers.filter(u => u.id !== userId);
    showToast(`${blocked.name} has been unblocked`);
}

function showBlockedUsers() {
    showToast(`${friendsSystem.blockedUsers.length} blocked users`);
}

// 8. BIRTHDAY TRACKING
function calculateUpcomingBirthdays() {
    const today = new Date();
    const upcoming = [];
    
    friendsSystem.friends.forEach(friend => {
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
    
    friendsSystem.upcomingBirthdays = upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
}

function showUpcomingBirthdays() {
    calculateUpcomingBirthdays();
    showToast(`${friendsSystem.upcomingBirthdays.length} upcoming birthdays`);
}

function wishHappyBirthday(friendId) {
    const friend = friendsSystem.friends.find(f => f.id === friendId);
    if (!friend) return;
    
    showToast(`Birthday wish sent to ${friend.name}! 🎉`);
}

// 9. FRIEND ACTIVITY FEED
function showFriendActivity() {
    showToast('Friend activity feed opened');
}

function handleActivityClick(friendId, activityType) {
    showToast(`Viewing ${activityType} activity`);
}

// 10. FRIEND RECOMMENDATIONS ALGORITHM
function generateFriendRecommendations() {
    friendsSystem.suggestions.forEach(suggestion => {
        let score = (suggestion.mutualFriends / 15) * 40;
        if (suggestion.reason.includes('group')) score += 30;
        if (suggestion.reason.includes('University')) score += 20;
        suggestion.score = Math.min(100, Math.round(score));
    });
    
    friendsSystem.suggestions.sort((a, b) => b.score - a.score);
}

function showAllSuggestions() {
    generateFriendRecommendations();
    showToast(`${friendsSystem.suggestions.length} friend suggestions`);
}

function removeSuggestion(suggestionId) {
    friendsSystem.suggestions = friendsSystem.suggestions.filter(s => s.id !== suggestionId);
    showToast('Suggestion removed');
}

// 11. IMPORT FRIENDS FROM CONTACTS
function importFriends() {
    showToast('Import friends feature opened');
}

function importFromSource(source) {
    showToast(`Connecting to ${source}... 📥`);
    setTimeout(() => {
        showToast(`Found ${Math.floor(Math.random() * 20) + 5} friends!`);
    }, 1500);
}

// 12. FRIEND SYNC ACROSS PLATFORMS
function toggleFriendSync() {
    friendsSystem.syncEnabled = !friendsSystem.syncEnabled;
    showToast(friendsSystem.syncEnabled ? 'Friend sync enabled ✓' : 'Friend sync disabled');
}

function syncFriendsNow() {
    showToast('Syncing friends... 🔄');
    setTimeout(() => {
        showToast('Sync complete! ✓');
    }, 2000);
}

function showSyncSettings() {
    showToast('Sync settings opened');
}

// 13. FRIEND PROFILE VIEW
function openFriendProfile(friendId) {
    const friend = friendsSystem.friends.find(f => f.id === friendId);
    if (!friend) return;
    
    showToast(`Opening ${friend.name}'s profile`);
}

function openFriendOptions(friendId) {
    showToast('Friend options opened');
}

function messageFriend(friendId) {
    showToast('Opening message');
}

function viewFriendPosts(friendId) {
    showToast('Viewing posts');
}

function pokeFriend(friendId) {
    showToast('Poke sent! 👋');
}

// UTILITY FUNCTIONS
function getYearsSince(dateString) {
    const years = Math.floor((new Date() - new Date(dateString)) / (365.25 * 24 * 60 * 60 * 1000));
    return years || 1;
}

function getTimeSince(dateString) {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function updateFriendStatuses() {
    // Simulated status updates
    console.log('Friend statuses updated');
}

console.log('✓ Friends System loaded successfully');
