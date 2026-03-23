/**
 * Groups API Service for ConnectHub
 * Handles all backend API calls related to groups functionality
 */

class GroupsAPIService {
    constructor(apiService, authService) {
        this.api = apiService;
        this.auth = authService;
        this.baseUrl = '/api/groups';
    }

    /**
     * Get all groups (discover)
     */
    async getAllGroups(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.privacy) params.append('privacy', filters.privacy);
            if (filters.search) params.append('search', filters.search);
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);

            const response = await this.api.get(`${this.baseUrl}?${params.toString()}`);
            return {
                success: true,
                groups: response.data.groups,
                total: response.data.total,
                page: response.data.page,
                hasMore: response.data.hasMore
            };
        } catch (error) {
            console.error('Error fetching groups:', error);
            return {
                success: false,
                error: error.message,
                groups: []
            };
        }
    }

    /**
     * Get group by ID
     */
    async getGroupById(groupId) {
        try {
            const response = await this.api.get(`${this.baseUrl}/${groupId}`);
            return {
                success: true,
                group: response.data
            };
        } catch (error) {
            console.error('Error fetching group:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create new group
     */
    async createGroup(groupData) {
        try {
            const response = await this.api.post(this.baseUrl, groupData);
            return {
                success: true,
                group: response.data
            };
        } catch (error) {
            console.error('Error creating group:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update group
     */
    async updateGroup(groupId, updates) {
        try {
            const response = await this.api.put(`${this.baseUrl}/${groupId}`, updates);
            return {
                success: true,
                group: response.data
            };
        } catch (error) {
            console.error('Error updating group:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete group
     */
    async deleteGroup(groupId) {
        try {
            await this.api.delete(`${this.baseUrl}/${groupId}`);
            return { success: true };
        } catch (error) {
            console.error('Error deleting group:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get user's groups
     */
    async getUserGroups(userId = null) {
        try {
            const url = userId 
                ? `${this.baseUrl}/user/${userId}` 
                : `${this.baseUrl}/my-groups`;
            
            const response = await this.api.get(url);
            return {
                success: true,
                groups: response.data
            };
        } catch (error) {
            console.error('Error fetching user groups:', error);
            return {
                success: false,
                error: error.message,
                groups: []
            };
        }
    }

    /**
     * Join group
     */
    async joinGroup(groupId) {
        try {
            const response = await this.api.post(`${this.baseUrl}/${groupId}/join`);
            return {
                success: true,
                membership: response.data
            };
        } catch (error) {
            console.error('Error joining group:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Leave group
     */
    async leaveGroup(groupId) {
        try {
            await this.api.post(`${this.baseUrl}/${groupId}/leave`);
            return { success: true };
        } catch (error) {
            console.error('Error leaving group:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get group members
     */
    async getGroupMembers(groupId, page = 1, limit = 50) {
        try {
            const response = await this.api.get(
                `${this.baseUrl}/${groupId}/members?page=${page}&limit=${limit}`
            );
            return {
                success: true,
                members: response.data.members,
                total: response.data.total,
                hasMore: response.data.hasMore
            };
        } catch (error) {
            console.error('Error fetching group members:', error);
            return {
                success: false,
                error: error.message,
                members: []
            };
        }
    }

    /**
     * Invite user to group
     */
    async inviteUser(groupId, userId) {
        try {
            const response = await this.api.post(`${this.baseUrl}/${groupId}/invite`, {
                userId
            });
            return {
                success: true,
                invitation: response.data
            };
        } catch (error) {
            console.error('Error inviting user:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Remove member from group
     */
    async removeMember(groupId, userId) {
        try {
            await this.api.delete(`${this.baseUrl}/${groupId}/members/${userId}`);
            return { success: true };
        } catch (error) {
            console.error('Error removing member:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update member role
     */
    async updateMemberRole(groupId, userId, role) {
        try {
            const response = await this.api.put(`${this.baseUrl}/${groupId}/members/${userId}/role`, {
                role
            });
            return {
                success: true,
                member: response.data
            };
        } catch (error) {
            console.error('Error updating member role:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get group posts
     */
    async getGroupPosts(groupId, page = 1, limit = 20) {
        try {
            const response = await this.api.get(
                `${this.baseUrl}/${groupId}/posts?page=${page}&limit=${limit}`
            );
            return {
                success: true,
                posts: response.data.posts,
                total: response.data.total,
                hasMore: response.data.hasMore
            };
        } catch (error) {
            console.error('Error fetching group posts:', error);
            return {
                success: false,
                error: error.message,
                posts: []
            };
        }
    }

    /**
     * Create group post
     */
    async createGroupPost(groupId, postData) {
        try {
            const response = await this.api.post(`${this.baseUrl}/${groupId}/posts`, postData);
            return {
                success: true,
                post: response.data
            };
        } catch (error) {
            console.error('Error creating group post:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get group events
     */
    async getGroupEvents(groupId, upcoming = true) {
        try {
            const response = await this.api.get(
                `${this.baseUrl}/${groupId}/events?upcoming=${upcoming}`
            );
            return {
                success: true,
                events: response.data
            };
        } catch (error) {
            console.error('Error fetching group events:', error);
            return {
                success: false,
                error: error.message,
                events: []
            };
        }
    }

    /**
     * Create group event
     */
    async createGroupEvent(groupId, eventData) {
        try {
            const response = await this.api.post(`${this.baseUrl}/${groupId}/events`, eventData);
            return {
                success: true,
                event: response.data
            };
        } catch (error) {
            console.error('Error creating group event:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get group discussions
     */
    async getGroupDiscussions(groupId, page = 1, limit = 20) {
        try {
            const response = await this.api.get(
                `${this.baseUrl}/${groupId}/discussions?page=${page}&limit=${limit}`
            );
            return {
                success: true,
                discussions: response.data.discussions,
                total: response.data.total,
                hasMore: response.data.hasMore
            };
        } catch (error) {
            console.error('Error fetching group discussions:', error);
            return {
                success: false,
                error: error.message,
                discussions: []
            };
        }
    }

    /**
     * Create group discussion
     */
    async createGroupDiscussion(groupId, discussionData) {
        try {
            const response = await this.api.post(
                `${this.baseUrl}/${groupId}/discussions`, 
                discussionData
            );
            return {
                success: true,
                discussion: response.data
            };
        } catch (error) {
            console.error('Error creating group discussion:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get group rules
     */
    async getGroupRules(groupId) {
        try {
            const response = await this.api.get(`${this.baseUrl}/${groupId}/rules`);
            return {
                success: true,
                rules: response.data
            };
        } catch (error) {
            console.error('Error fetching group rules:', error);
            return {
                success: false,
                error: error.message,
                rules: []
            };
        }
    }

    /**
     * Update group rules
     */
    async updateGroupRules(groupId, rules) {
        try {
            const response = await this.api.put(`${this.baseUrl}/${groupId}/rules`, {
                rules
            });
            return {
                success: true,
                rules: response.data
            };
        } catch (error) {
            console.error('Error updating group rules:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get group analytics (admin only)
     */
    async getGroupAnalytics(groupId) {
        try {
            const response = await this.api.get(`${this.baseUrl}/${groupId}/analytics`);
            return {
                success: true,
                analytics: response.data
            };
        } catch (error) {
            console.error('Error fetching group analytics:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Search groups
     */
    async searchGroups(query, filters = {}) {
        try {
            const params = new URLSearchParams({
                q: query,
                ...filters
            });

            const response = await this.api.get(`${this.baseUrl}/search?${params.toString()}`);
            return {
                success: true,
                groups: response.data.groups,
                total: response.data.total
            };
        } catch (error) {
            console.error('Error searching groups:', error);
            return {
                success: false,
                error: error.message,
                groups: []
            };
        }
    }

    /**
     * Get suggested groups
     */
    async getSuggestedGroups(limit = 10) {
        try {
            const response = await this.api.get(`${this.baseUrl}/suggested?limit=${limit}`);
            return {
                success: true,
                groups: response.data
            };
        } catch (error) {
            console.error('Error fetching suggested groups:', error);
            return {
                success: false,
                error: error.message,
                groups: []
            };
        }
    }

    /**
     * Get popular groups
     */
    async getPopularGroups(limit = 10) {
        try {
            const response = await this.api.get(`${this.baseUrl}/popular?limit=${limit}`);
            return {
                success: true,
                groups: response.data
            };
        } catch (error) {
            console.error('Error fetching popular groups:', error);
            return {
                success: false,
                error: error.message,
                groups: []
            };
        }
    }

    /**
     * Report group
     */
    async reportGroup(groupId, reason, description) {
        try {
            const response = await this.api.post(`${this.baseUrl}/${groupId}/report`, {
                reason,
                description
            });
            return {
                success: true,
                report: response.data
            };
        } catch (error) {
            console.error('Error reporting group:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get pending join requests (admin only)
     */
    async getPendingRequests(groupId) {
        try {
            const response = await this.api.get(`${this.baseUrl}/${groupId}/requests`);
            return {
                success: true,
                requests: response.data
            };
        } catch (error) {
            console.error('Error fetching pending requests:', error);
            return {
                success: false,
                error: error.message,
                requests: []
            };
        }
    }

    /**
     * Approve join request
     */
    async approveJoinRequest(groupId, userId) {
        try {
            const response = await this.api.post(
                `${this.baseUrl}/${groupId}/requests/${userId}/approve`
            );
            return {
                success: true,
                member: response.data
            };
        } catch (error) {
            console.error('Error approving join request:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Reject join request
     */
    async rejectJoinRequest(groupId, userId) {
        try {
            await this.api.post(`${this.baseUrl}/${groupId}/requests/${userId}/reject`);
            return { success: true };
        } catch (error) {
            console.error('Error rejecting join request:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Upload group cover image
     */
    async uploadCoverImage(groupId, imageFile) {
        try {
            const formData = new FormData();
            formData.append('cover', imageFile);

            const response = await this.api.post(
                `${this.baseUrl}/${groupId}/cover`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return {
                success: true,
                coverUrl: response.data.coverUrl
            };
        } catch (error) {
            console.error('Error uploading cover image:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get group categories
     */
    async getCategories() {
        try {
            const response = await this.api.get(`${this.baseUrl}/categories`);
            return {
                success: true,
                categories: response.data
            };
        } catch (error) {
            console.error('Error fetching categories:', error);
            return {
                success: false,
                error: error.message,
                categories: []
            };
        }
    }

    /**
     * Mute/Unmute group notifications
     */
    async toggleNotifications(groupId, muted) {
        try {
            const response = await this.api.put(`${this.baseUrl}/${groupId}/notifications`, {
                muted
            });
            return {
                success: true,
                settings: response.data
            };
        } catch (error) {
            console.error('Error toggling notifications:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Pin/Unpin group post
     */
    async togglePinPost(groupId, postId, pinned) {
        try {
            const response = await this.api.put(
                `${this.baseUrl}/${groupId}/posts/${postId}/pin`,
                { pinned }
            );
            return {
                success: true,
                post: response.data
            };
        } catch (error) {
            console.error('Error toggling pin post:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GroupsAPIService;
}
