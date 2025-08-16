/**
 * ConnectHub API Client
 * Handles all communication with the backend API
 */

class ConnectHubAPI {
    constructor() {
        this.baseURL = 'http://localhost:5000/api/v1';
        this.token = localStorage.getItem('connecthub_token');
        this.user = JSON.parse(localStorage.getItem('connecthub_user') || 'null');
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('connecthub_token', token);
    }

    /**
     * Set user data
     */
    setUser(user) {
        this.user = user;
        localStorage.setItem('connecthub_user', JSON.stringify(user));
    }

    /**
     * Clear authentication data
     */
    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('connecthub_token');
        localStorage.removeItem('connecthub_user');
    }

    /**
     * Get authentication headers
     */
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    /**
     * Make API request
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getAuthHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            
            // Handle authentication errors
            if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
                this.clearAuth();
                window.location.reload(); // Force login
            }
            
            throw error;
        }
    }

    /**
     * Authentication API Methods
     */

    async register(userData) {
        return this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(credentials) {
        return this.makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async logout() {
        try {
            await this.makeRequest('/auth/logout', { method: 'POST' });
        } finally {
            this.clearAuth();
        }
    }

    async refreshToken() {
        return this.makeRequest('/auth/refresh', { method: 'POST' });
    }

    async forgotPassword(email) {
        return this.makeRequest('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    /**
     * Users API Methods
     */

    async getProfile(userId = null) {
        const endpoint = userId ? `/users/${userId}` : '/users/profile';
        return this.makeRequest(endpoint);
    }

    async updateProfile(userData) {
        return this.makeRequest('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async searchUsers(query, page = 1, limit = 20) {
        return this.makeRequest(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    }

    async followUser(userId) {
        return this.makeRequest(`/users/${userId}/follow`, { method: 'POST' });
    }

    async unfollowUser(userId) {
        return this.makeRequest(`/users/${userId}/unfollow`, { method: 'DELETE' });
    }

    async getFollowers(userId, page = 1, limit = 20) {
        return this.makeRequest(`/users/${userId}/followers?page=${page}&limit=${limit}`);
    }

    async getFollowing(userId, page = 1, limit = 20) {
        return this.makeRequest(`/users/${userId}/following?page=${page}&limit=${limit}`);
    }

    /**
     * Posts API Methods
     */

    async getFeed(page = 1, limit = 10) {
        return this.makeRequest(`/posts/feed?page=${page}&limit=${limit}`);
    }

    async createPost(postData) {
        return this.makeRequest('/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    }

    async getPost(postId) {
        return this.makeRequest(`/posts/${postId}`);
    }

    async updatePost(postId, postData) {
        return this.makeRequest(`/posts/${postId}`, {
            method: 'PUT',
            body: JSON.stringify(postData)
        });
    }

    async deletePost(postId) {
        return this.makeRequest(`/posts/${postId}`, { method: 'DELETE' });
    }

    async likePost(postId) {
        return this.makeRequest(`/posts/${postId}/like`, { method: 'POST' });
    }

    async unlikePost(postId) {
        return this.makeRequest(`/posts/${postId}/unlike`, { method: 'DELETE' });
    }

    async sharePost(postId) {
        return this.makeRequest(`/posts/${postId}/share`, { method: 'POST' });
    }

    async getPostComments(postId, page = 1, limit = 20) {
        return this.makeRequest(`/posts/${postId}/comments?page=${page}&limit=${limit}`);
    }

    async createComment(postId, content) {
        return this.makeRequest(`/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }

    async getUserPosts(userId, page = 1, limit = 10) {
        return this.makeRequest(`/posts/user/${userId}?page=${page}&limit=${limit}`);
    }

    /**
     * Dating API Methods
     */

    async createDatingProfile(profileData) {
        return this.makeRequest('/dating/profile', {
            method: 'POST',
            body: JSON.stringify(profileData)
        });
    }

    async getDatingProfile() {
        return this.makeRequest('/dating/profile');
    }

    async updateDatingProfile(profileData) {
        return this.makeRequest('/dating/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async discoverProfiles(filters = {}) {
        const queryParams = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== null) {
                queryParams.append(key, filters[key]);
            }
        });
        
        const queryString = queryParams.toString();
        const endpoint = `/dating/discover${queryString ? `?${queryString}` : ''}`;
        return this.makeRequest(endpoint);
    }

    async swipeUser(targetUserId, action) {
        return this.makeRequest('/dating/swipe', {
            method: 'POST',
            body: JSON.stringify({ targetUserId, action })
        });
    }

    async getMatches(page = 1, limit = 20) {
        return this.makeRequest(`/dating/matches?page=${page}&limit=${limit}`);
    }

    async unmatchUser(matchId) {
        return this.makeRequest(`/dating/matches/${matchId}`, { method: 'DELETE' });
    }

    async getDatingStats() {
        return this.makeRequest('/dating/stats');
    }

    /**
     * Messages API Methods
     */

    async getConversations(page = 1, limit = 20) {
        return this.makeRequest(`/messages/conversations?page=${page}&limit=${limit}`);
    }

    async createConversation(participantIds, matchId = null) {
        return this.makeRequest('/messages/conversations', {
            method: 'POST',
            body: JSON.stringify({ participantIds, matchId })
        });
    }

    async getMessages(conversationId, page = 1, limit = 20) {
        return this.makeRequest(`/messages/conversations/${conversationId}?page=${page}&limit=${limit}`);
    }

    async sendMessage(messageData) {
        return this.makeRequest('/messages', {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    async markMessagesAsRead(messageIds) {
        return this.makeRequest('/messages/mark-read', {
            method: 'POST',
            body: JSON.stringify({ messageIds })
        });
    }

    async deleteMessage(messageId) {
        return this.makeRequest(`/messages/${messageId}`, { method: 'DELETE' });
    }

    async searchMessages(query, conversationId = null, page = 1, limit = 20) {
        const params = new URLSearchParams({
            q: query,
            page: page.toString(),
            limit: limit.toString()
        });
        
        if (conversationId) {
            params.append('conversationId', conversationId);
        }
        
        return this.makeRequest(`/messages/search?${params.toString()}`);
    }

    /**
     * Utility Methods
     */

    async uploadFile(file, type = 'general') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        try {
            const response = await fetch(`${this.baseURL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            return data;
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }

    async getHealth() {
        try {
            const response = await fetch('http://localhost:5000/health');
            return response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }

    /**
     * WebSocket connection for real-time features
     */
    initializeWebSocket() {
        if (this.token) {
            this.socket = io('http://localhost:5000', {
                auth: {
                    token: this.token
                }
            });

            this.socket.on('connect', () => {
                console.log('Connected to WebSocket server');
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from WebSocket server');
            });

            this.socket.on('newMessage', (message) => {
                // Handle new message
                window.connectHub.handleNewMessage(message);
            });

            this.socket.on('matchFound', (match) => {
                // Handle new match
                window.connectHub.handleNewMatch(match);
            });

            return this.socket;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!(this.token && this.user);
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.user;
    }
}

// Export for use in other files
window.ConnectHubAPI = ConnectHubAPI;

// Create global instance
window.connectHubAPI = new ConnectHubAPI();
