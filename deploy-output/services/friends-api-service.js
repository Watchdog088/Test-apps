// ========================================
// FRIENDS API SERVICE
// Backend Integration with Relationship Tables & Notifications
// ========================================

class FriendsAPIService {
    constructor() {
        this.baseURL = 'https://connecthub-api.com/api/v1';
        this.listeners = new Map();
        this.cache = {
            friends: null,
            friendRequests: null,
            sentRequests: null,
            blockedUsers: null,
            suggestions: null,
            lastUpdate: null
        };
    }

    // ========================================
    // RELATIONSHIP TABLE OPERATIONS
    // ========================================

    /**
     * Get user's friends with relationship metadata
     * Uses relationship table for efficient querying
     */
    async getFriends(userId, options = {}) {
        try {
            const { category = 'all', sort = 'alphabetical', limit = 100, offset = 0 } = options;

            // Check cache first
            if (this.cache.friends && !this.isCacheExpired()) {
                return this.filterAndSortFriends(this.cache.friends, category, sort);
            }

            const response = await fetch(`${this.baseURL}/friends/${userId}`, {
                method: 'GET',
                headers: this.getHeaders(),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch friends');

            const data = await response.json();
            
            // Cache the results
            this.cache.friends = data.friends;
            this.cache.lastUpdate = Date.now();

            return this.filterAndSortFriends(data.friends, category, sort);
        } catch (error) {
            console.error('Error fetching friends:', error);
            return this.getMockFriends(); // Fallback to mock data
        }
    }

    /**
     * Get friend relationship details
     * Includes: friendsSince, category, mutualFriends, interactions
     */
    async getFriendRelationship(userId, friendId) {
        try {
            const response = await fetch(`${this.baseURL}/friends/${userId}/relationship/${friendId}`, {
                method: 'GET',
                headers: this.getHeaders(),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch relationship');

            return await response.json();
        } catch (error) {
            console.error('Error fetching relationship:', error);
            return this.getMockRelationship(friendId);
        }
    }

    // ========================================
    // FRIEND REQUESTS WITH RELATIONSHIP TABLE
    // ========================================

    /**
     * Get incoming friend requests
     * Uses friend_requests table with status tracking
     */
    async getFriendRequests(userId) {
        try {
            const response = await fetch(`${this.baseURL}/friends/requests/received/${userId}`, {
                method: 'GET',
                headers: this.getHeaders(),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch friend requests');

            const data = await response.json();
            this.cache.friendRequests = data.requests;
            
            return data.requests;
        } catch (error) {
            console.error('Error fetching friend requests:', error);
            return this.getMockFriendRequests();
        }
    }

    /**
     * Get sent friend requests
     */
    async getSentRequests(userId) {
        try {
            const response = await fetch(`${this.baseURL}/friends/requests/sent/${userId}`, {
                method: 'GET',
                headers: this.getHeaders(),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch sent requests');

            const data = await response.json();
            this.cache.sentRequests = data.requests;
            
            return data.requests;
        } catch (error) {
            console.error('Error fetching sent requests:', error);
            return this.getMockSentRequests();
        }
    }

    /**
     * Send friend request with notification
     * Creates entry in friend_requests table and triggers notification
     */
    async sendFriendRequest(userId, targetUserId, message = null) {
        try {
            const response = await fetch(`${this.baseURL}/friends/requests/send`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    from_user_id: userId,
                    to_user_id: targetUserId,
                    message: message,
                    status: 'pending',
                    created_at: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error('Failed to send friend request');

            const data = await response.json();

            // Trigger notification
            await this.triggerNotification({
                type: 'friend_request',
                userId: targetUserId,
                fromUserId: userId,
                message: `${data.fromUser.name} sent you a friend request`,
                data: {
                    requestId: data.requestId,
                    fromUser: data.fromUser
                }
            });

            // Invalidate cache
            this.cache.sentRequests = null;

            return data;
        } catch (error) {
            console.error('Error sending friend request:', error);
            throw error;
        }
    }

    /**
     * Accept friend request with notifications
     * Updates relationship table and sends notifications to both users
     */
    async acceptFriendRequest(userId, requestId) {
        try {
            const response = await fetch(`${this.baseURL}/friends/requests/${requestId}/accept`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    user_id: userId,
                    accepted_at: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error('Failed to accept friend request');

            const data = await response.json();

            // Create bidirectional friendship in relationship table
            await this.createFriendship(userId, data.fromUserId);

            // Trigger notification to requester
            await this.triggerNotification({
                type: 'friend_request_accepted',
                userId: data.fromUserId,
                fromUserId: userId,
                message: `${data.acceptedBy.name} accepted your friend request`,
                data: {
                    friendId: userId,
                    friend: data.acceptedBy
                }
            });

            // Invalidate caches
            this.cache.friends = null;
            this.cache.friendRequests = null;

            return data;
        } catch (error) {
            console.error('Error accepting friend request:', error);
            throw error;
        }
    }

    /**
     * Decline friend request with notification
     */
    async declineFriendRequest(userId, requestId) {
        try {
            const response = await fetch(`${this.baseURL}/friends/requests/${requestId}/decline`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    user_id: userId,
                    declined_at: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error('Failed to decline friend request');

            const data = await response.json();

            // Optional: Notify requester (silent notification)
            await this.triggerNotification({
                type: 'friend_request_declined',
                userId: data.fromUserId,
                fromUserId: userId,
                message: null, // Silent notification
                data: {
                    requestId: requestId
                },
                silent: true
            });

            // Invalidate cache
            this.cache.friendRequests = null;

            return data;
        } catch (error) {
            console.error('Error declining friend request:', error);
            throw error;
        }
    }

    /**
     * Cancel sent friend request
     */
    async cancelFriendRequest(userId, requestId) {
        try {
            const response = await fetch(`${this.baseURL}/friends/requests/${requestId}/cancel`, {
                method: 'DELETE',
                headers: this.getHeaders(),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to cancel friend request');

            // Invalidate cache
            this.cache.sentRequests = null;

            return await response.json();
        } catch (error) {
            console.error('Error canceling friend request:', error);
            throw error;
        }
    }

    // ========================================
    // FRIENDSHIP MANAGEMENT
    // ========================================

    /**
     * Create friendship in relationship table (bidirectional)
     */
    async createFriendship(userId1, userId2) {
        try {
            const response = await fetch(`${this.baseURL}/friends/relationship/create`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    user_id_1: userId1,
                    user_id_2: userId2,
                    created_at: new Date().toISOString(),
                    category: 'friends'
                })
            });

            if (!response.ok) throw new Error('Failed to create friendship');

            return await response.json();
        } catch (error) {
            console.error('Error creating friendship:', error);
            throw error;
        }
    }

    /**
     * Update friend category
     */
    async updateFriendCategory(userId, friendId, category) {
        try {
            const response = await fetch(`${this.baseURL}/friends/${userId}/category/${friendId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    category: category,
                    updated_at: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error('Failed to update category');

            // Invalidate cache
            this.cache.friends = null;

            return await response.json();
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    }

    /**
     * Unfriend user with notification
     */
    async unfriend(userId, friendId) {
        try {
            const response = await fetch(`${this.baseURL}/friends/${userId}/unfriend/${friendId}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to unfriend');

            // Optional: Trigger notification (silent)
            await this.triggerNotification({
                type: 'unfriended',
                userId: friendId,
                fromUserId: userId,
                message: null,
                silent: true
            });

            // Invalidate cache
            this.cache.friends = null;

            return await response.json();
        } catch (error) {
            console.error('Error unfriending:', error);
            throw error;
        }
    }

    // ========================================
    // BLOCK/UNBLOCK WITH FILTERING
    // ========================================

    /**
     * Block user with filtering
     * Adds to blocked_users table and filters from all interactions
     */
    async blockUser(userId, targetUserId, reason = null) {
        try {
            const response = await fetch(`${this.baseURL}/friends/block`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    user_id: userId,
                    blocked_user_id: targetUserId,
                    reason: reason,
                    blocked_at: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error('Failed to block user');

            const data = await response.json();

            // Remove from friends if exists
            await this.unfriend(userId, targetUserId);

            // Filter user from all content
            await this.applyUserFilter(userId, targetUserId, 'block');

            // Invalidate caches
            this.cache.friends = null;
            this.cache.blockedUsers = null;

            return data;
        } catch (error) {
            console.error('Error blocking user:', error);
            throw error;
        }
    }

    /**
     * Unblock user and remove filters
     */
    async unblockUser(userId, targetUserId) {
        try {
            const response = await fetch(`${this.baseURL}/friends/unblock/${targetUserId}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to unblock user');

            // Remove user filter
            await this.removeUserFilter(userId, targetUserId, 'block');

            // Invalidate cache
            this.cache.blockedUsers = null;

            return await response.json();
        } catch (error) {
            console.error('Error unblocking user:', error);
            throw error;
        }
    }

    /**
     * Get blocked users list
     */
    async getBlockedUsers(userId) {
        try {
            const response = await fetch(`${this.baseURL}/friends/blocked/${userId}`, {
                method: 'GET',
                headers: this.getHeaders(),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch blocked users');

            const data = await response.json();
            this.cache.blockedUsers = data.blockedUsers;
            
            return data.blockedUsers;
        } catch (error) {
            console.error('Error fetching blocked users:', error);
            return this.getMockBlockedUsers();
        }
    }

    /**
     * Apply content filter for blocked user
     */
    async applyUserFilter(userId, targetUserId, filterType) {
        try {
            await fetch(`${this.baseURL}/content/filters/apply`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    user_id: userId,
                    target_user_id: targetUserId,
                    filter_type: filterType,
                    applies_to: ['posts', 'stories', 'messages', 'search', 'suggestions']
                })
            });
        } catch (error) {
            console.error('Error applying filter:', error);
        }
    }

    /**
     * Remove content filter
     */
    async removeUserFilter(userId, targetUserId, filterType) {
        try {
            await fetch(`${this.baseURL}/content/filters/remove`, {
                method: 'DELETE',
                headers: this.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    user_id: userId,
                    target_user_id: targetUserId,
                    filter_type: filterType
                })
            });
        } catch (error) {
            console.error('Error removing filter:', error);
        }
    }

    // ========================================
    // FRIEND SUGGESTIONS
    // ========================================

    /**
     * Get AI-powered friend suggestions
     */
    async getFriendSuggestions(userId, limit = 10) {
        try {
            const response = await fetch(`${this.baseURL}/friends/suggestions/${userId}?limit=${limit}`, {
                method: 'GET',
                headers: this.getHeaders(),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch suggestions');

            const data = await response.json();
            this.cache.suggestions = data.suggestions;
            
            return data.suggestions;
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            return this.getMockSuggestions();
        }
    }

    /**
     * Dismiss suggestion
     */
    async dismissSuggestion(userId, suggestionId) {
        try {
            await fetch(`${this.baseURL}/friends/suggestions/${suggestionId}/dismiss`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({ user_id: userId })
            });

            // Invalidate cache
            this.cache.suggestions = null;
        } catch (error) {
            console.error('Error dismissing suggestion:', error);
        }
    }

    // ========================================
    // MUTUAL FRIENDS
    // ========================================

    /**
     * Get mutual friends between two users
     */
    async getMutualFriends(userId, targetUserId) {
        try {
            const response = await fetch(`${this.baseURL}/friends/${userId}/mutual/${targetUserId}`, {
                method: 'GET',
                headers: this.getHeaders(),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch mutual friends');

            return await response.json();
        } catch (error) {
            console.error('Error fetching mutual friends:', error);
            return this.getMockMutualFriends();
        }
    }

    // ========================================
    // NOTIFICATION SYSTEM
    // ========================================

    /**
     * Trigger notification for friend actions
     */
    async triggerNotification(notification) {
        try {
            // Send to notification service
            await fetch(`${this.baseURL}/notifications/send`, {
                method: 'POST',
                headers: this.getHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    user_id: notification.userId,
                    type: notification.type,
                    from_user_id: notification.fromUserId,
                    title: this.getNotificationTitle(notification.type),
                    message: notification.message,
                    data: notification.data,
                    silent: notification.silent || false,
                    created_at: new Date().toISOString(),
                    read: false
                })
            });

            // Trigger real-time notification via WebSocket
            this.sendRealtimeNotification(notification);

        } catch (error) {
            console.error('Error triggering notification:', error);
        }
    }

    /**
     * Send real-time notification
     */
    sendRealtimeNotification(notification) {
        if (window.realtimeService && window.realtimeService.socket) {
            window.realtimeService.socket.emit('notification', notification);
        }
    }

    /**
     * Get notification title based on type
     */
    getNotificationTitle(type) {
        const titles = {
            'friend_request': 'New Friend Request',
            'friend_request_accepted': 'Friend Request Accepted',
            'friend_request_declined': 'Friend Request Update',
            'unfriended': 'Friendship Update',
            'birthday': 'Birthday Reminder',
            'poke': 'Someone Poked You'
        };
        return titles[type] || 'Notification';
    }

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    /**
     * Filter and sort friends
     */
    filterAndSortFriends(friends, category, sortBy) {
        let filtered = friends;

        // Apply category filter
        if (category !== 'all') {
            filtered = friends.filter(f => f.category === category);
        }

        // Apply sorting
        switch (sortBy) {
            case 'alphabetical':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'recent':
                filtered.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
                break;
            case 'mutual':
                filtered.sort((a, b) => b.mutualFriends - a.mutualFriends);
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.friendsSince) - new Date(b.friendsSince));
                break;
            case 'newest':
                filtered.sort((a, b) => new Date(b.friendsSince) - new Date(a.friendsSince));
                break;
        }

        return filtered;
    }

    /**
     * Check if cache is expired
     */
    isCacheExpired() {
        if (!this.cache.lastUpdate) return true;
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        return Date.now() - this.cache.lastUpdate > CACHE_DURATION;
    }

    /**
     * Get request headers
     */
    getHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache = {
            friends: null,
            friendRequests: null,
            sentRequests: null,
            blockedUsers: null,
            suggestions: null,
            lastUpdate: null
        };
    }

    // ========================================
    // MOCK DATA (FALLBACK)
    // ========================================

    getMockFriends() {
        return [
            { id: 1, name: 'Sarah Johnson', username: '@sarahjohnson', emoji: '👤', status: 'online', mutualFriends: 12, friendsSince: '2020-03-15', birthday: '1995-05-20', category: 'close-friends', lastActive: 'Just now', location: 'San Francisco, CA', bio: 'Tech enthusiast | Coffee lover ☕', commonInterests: ['Technology', 'Photography', 'Travel'], posts: 156, followers: 1240, following: 890 },
            { id: 2, name: 'Mike Chen', username: '@mikechen', emoji: '😊', status: 'active', mutualFriends: 8, friendsSince: '2021-07-10', birthday: '1993-09-12', category: 'friends', lastActive: '2h ago', location: 'Los Angeles, CA', bio: 'Gamer | Developer 🎮', commonInterests: ['Gaming', 'Coding', 'Music'], posts: 234, followers: 890, following: 567 }
        ];
    }

    getMockFriendRequests() {
        return [
            { id: 101, name: 'Emily Rodriguez', username: '@emilyrodriguez', emoji: '🎨', mutualFriends: 5, requestDate: '2024-12-18T10:30:00', message: 'Hey! We have mutual friends. Would love to connect!' },
            { id: 102, name: 'David Kim', username: '@davidkim', emoji: '🚀', mutualFriends: 3, requestDate: '2024-12-17T15:20:00', message: null }
        ];
    }

    getMockSentRequests() {
        return [
            { id: 201, name: 'Chris Anderson', username: '@chrisanderson', emoji: '💼', mutualFriends: 4, sentDate: '2024-12-15T14:00:00' }
        ];
    }

    getMockBlockedUsers() {
        return [
            { id: 401, name: 'Spam Account', username: '@spamaccount', emoji: '🚫', blockedDate: '2024-11-01T10:00:00' }
        ];
    }

    getMockSuggestions() {
        return [
            { id: 301, name: 'Kevin Brown', username: '@kevinbrown', emoji: '🎯', mutualFriends: 8, reason: 'Works at Tech Corp', score: 95, location: 'San Francisco, CA' },
            { id: 302, name: 'Lisa Wang', username: '@lisawang', emoji: '💡', mutualFriends: 5, reason: 'Member of Tech Enthusiasts group', score: 88, location: 'Seattle, WA' }
        ];
    }

    getMockMutualFriends() {
        return {
            count: 5,
            friends: this.getMockFriends().slice(0, 5)
        };
    }

    getMockRelationship(friendId) {
        return {
            friendId: friendId,
            friendsSince: '2021-01-15',
            category: 'friends',
            mutualFriends: 8,
            interactions: {
                messages: 156,
                likes: 89,
                comments: 45
            }
        };
    }
}

// Export singleton instance
const friendsAPIService = new FriendsAPIService();

// Make globally available
if (typeof window !== 'undefined') {
    window.friendsAPIService = friendsAPIService;
}

console.log('✓ Friends API Service loaded with backend integration!');
