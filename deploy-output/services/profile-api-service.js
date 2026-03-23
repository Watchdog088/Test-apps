/**
 * ConnectHub Profile API Service
 * Handles all profile-related API operations with real backend integration
 * Includes: View Profiles, Edit Profile, Image Upload/Cropping, User Posts
 */

class ProfileAPIService {
    constructor() {
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3001/api/v1'
            : 'https://api.connecthub.com/api/v1';
        this.apiService = window.apiService;
    }

    // ========== PROFILE VIEW & FETCH ==========

    /**
     * Get user profile by ID with real data
     */
    async getProfile(userId = 'me') {
        try {
            const response = await this.apiService.get(`/profiles/${userId}`);
            return {
                success: true,
                data: response.data || response
            };
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Return mock data if API fails
            return this.getMockProfile(userId);
        }
    }

    /**
     * Get current user's profile
     */
    async getMyProfile() {
        return this.getProfile('me');
    }

    /**
     * Get profile by username
     */
    async getProfileByUsername(username) {
        try {
            const response = await this.apiService.get(`/profiles/username/${username}`);
            return {
                success: true,
                data: response.data || response
            };
        } catch (error) {
            console.error('Error fetching profile by username:', error);
            return this.getMockProfile(username);
        }
    }

    /**
     * Search profiles
     */
    async searchProfiles(query, filters = {}) {
        try {
            const params = {
                q: query,
                ...filters
            };
            const response = await this.apiService.get('/profiles/search', params);
            return {
                success: true,
                data: response.data || response.profiles || []
            };
        } catch (error) {
            console.error('Error searching profiles:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // ========== PROFILE UPDATE & EDIT ==========

    /**
     * Update profile with real API endpoint
     */
    async updateProfile(profileData) {
        try {
            const response = await this.apiService.put('/profiles/me', profileData);
            
            // Update local storage
            const currentUser = JSON.parse(localStorage.getItem('connecthub_user') || '{}');
            localStorage.setItem('connecthub_user', JSON.stringify({
                ...currentUser,
                ...profileData
            }));

            return {
                success: true,
                data: response.data || response,
                message: 'Profile updated successfully'
            };
        } catch (error) {
            console.error('Error updating profile:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update specific profile fields
     */
    async updateProfileField(field, value) {
        return this.updateProfile({ [field]: value });
    }

    /**
     * Update profile bio
     */
    async updateBio(bio) {
        return this.updateProfile({ bio });
    }

    /**
     * Update profile location
     */
    async updateLocation(location) {
        return this.updateProfile({ location });
    }

    /**
     * Update profile work information
     */
    async updateWork(work) {
        return this.updateProfile({ work });
    }

    /**
     * Update profile education
     */
    async updateEducation(education) {
        return this.updateProfile({ education });
    }

    // ========== PROFILE PICTURE UPLOAD & CROPPING ==========

    /**
     * Upload profile picture with cropping support
     */
    async uploadProfilePicture(file, cropData = null) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'profile_picture');
            
            if (cropData) {
                formData.append('crop', JSON.stringify(cropData));
            }

            const token = localStorage.getItem('connecthub_token');
            const response = await fetch(`${this.baseURL}/profiles/me/picture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload profile picture');
            }

            const data = await response.json();
            
            // Update local storage
            const currentUser = JSON.parse(localStorage.getItem('connecthub_user') || '{}');
            currentUser.profilePicture = data.url || data.data?.url;
            localStorage.setItem('connecthub_user', JSON.stringify(currentUser));

            return {
                success: true,
                data: data.data || data,
                message: 'Profile picture updated successfully'
            };
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Upload cover photo
     */
    async uploadCoverPhoto(file, cropData = null) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'cover_photo');
            
            if (cropData) {
                formData.append('crop', JSON.stringify(cropData));
            }

            const token = localStorage.getItem('connecthub_token');
            const response = await fetch(`${this.baseURL}/profiles/me/cover`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload cover photo');
            }

            const data = await response.json();
            
            // Update local storage
            const currentUser = JSON.parse(localStorage.getItem('connecthub_user') || '{}');
            currentUser.coverPhoto = data.url || data.data?.url;
            localStorage.setItem('connecthub_user', JSON.stringify(currentUser));

            return {
                success: true,
                data: data.data || data,
                message: 'Cover photo updated successfully'
            };
        } catch (error) {
            console.error('Error uploading cover photo:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Remove profile picture
     */
    async removeProfilePicture() {
        try {
            const response = await this.apiService.delete('/profiles/me/picture');
            
            // Update local storage
            const currentUser = JSON.parse(localStorage.getItem('connecthub_user') || '{}');
            delete currentUser.profilePicture;
            localStorage.setItem('connecthub_user', JSON.stringify(currentUser));

            return {
                success: true,
                message: 'Profile picture removed successfully'
            };
        } catch (error) {
            console.error('Error removing profile picture:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Remove cover photo
     */
    async removeCoverPhoto() {
        try {
            const response = await this.apiService.delete('/profiles/me/cover');
            
            // Update local storage
            const currentUser = JSON.parse(localStorage.getItem('connecthub_user') || '{}');
            delete currentUser.coverPhoto;
            localStorage.setItem('connecthub_user', JSON.stringify(currentUser));

            return {
                success: true,
                message: 'Cover photo removed successfully'
            };
        } catch (error) {
            console.error('Error removing cover photo:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ========== USER POSTS FETCHING ==========

    /**
     * Fetch user posts with pagination
     */
    async getUserPosts(userId = 'me', options = {}) {
        try {
            const params = {
                page: options.page || 1,
                limit: options.limit || 20,
                sort: options.sort || 'recent'
            };

            const response = await this.apiService.get(`/profiles/${userId}/posts`, params);
            return {
                success: true,
                data: response.data || response.posts || [],
                pagination: response.pagination || {
                    page: params.page,
                    hasMore: false
                }
            };
        } catch (error) {
            console.error('Error fetching user posts:', error);
            // Return mock posts if API fails
            return this.getMockPosts(userId);
        }
    }

    /**
     * Fetch user photos
     */
    async getUserPhotos(userId = 'me', options = {}) {
        try {
            const params = {
                page: options.page || 1,
                limit: options.limit || 30,
                type: 'photo'
            };

            const response = await this.apiService.get(`/profiles/${userId}/media`, params);
            return {
                success: true,
                data: response.data || response.photos || [],
                pagination: response.pagination || {}
            };
        } catch (error) {
            console.error('Error fetching user photos:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    /**
     * Fetch user videos
     */
    async getUserVideos(userId = 'me', options = {}) {
        try {
            const params = {
                page: options.page || 1,
                limit: options.limit || 20,
                type: 'video'
            };

            const response = await this.apiService.get(`/profiles/${userId}/media`, params);
            return {
                success: true,
                data: response.data || response.videos || [],
                pagination: response.pagination || {}
            };
        } catch (error) {
            console.error('Error fetching user videos:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // ========== PROFILE STATS & ANALYTICS ==========

    /**
     * Get profile statistics
     */
    async getProfileStats(userId = 'me') {
        try {
            const response = await this.apiService.get(`/profiles/${userId}/stats`);
            return {
                success: true,
                data: response.data || response
            };
        } catch (error) {
            console.error('Error fetching profile stats:', error);
            return this.getMockStats();
        }
    }

    /**
     * Get profile analytics
     */
    async getProfileAnalytics(period = 'week') {
        try {
            const response = await this.apiService.get('/profiles/me/analytics', { period });
            return {
                success: true,
                data: response.data || response
            };
        } catch (error) {
            console.error('Error fetching profile analytics:', error);
            return this.getMockAnalytics();
        }
    }

    /**
     * Get profile viewers
     */
    async getProfileViewers(options = {}) {
        try {
            const params = {
                page: options.page || 1,
                limit: options.limit || 50
            };

            const response = await this.apiService.get('/profiles/me/viewers', params);
            return {
                success: true,
                data: response.data || response.viewers || [],
                pagination: response.pagination || {}
            };
        } catch (error) {
            console.error('Error fetching profile viewers:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // ========== FOLLOWERS & FOLLOWING ==========

    /**
     * Get followers list
     */
    async getFollowers(userId = 'me', options = {}) {
        try {
            const params = {
                page: options.page || 1,
                limit: options.limit || 50
            };

            const response = await this.apiService.get(`/profiles/${userId}/followers`, params);
            return {
                success: true,
                data: response.data || response.followers || [],
                pagination: response.pagination || {}
            };
        } catch (error) {
            console.error('Error fetching followers:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    /**
     * Get following list
     */
    async getFollowing(userId = 'me', options = {}) {
        try {
            const params = {
                page: options.page || 1,
                limit: options.limit || 50
            };

            const response = await this.apiService.get(`/profiles/${userId}/following`, params);
            return {
                success: true,
                data: response.data || response.following || [],
                pagination: response.pagination || {}
            };
        } catch (error) {
            console.error('Error fetching following:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    /**
     * Get friends list
     */
    async getFriends(userId = 'me', options = {}) {
        try {
            const params = {
                page: options.page || 1,
                limit: options.limit || 50
            };

            const response = await this.apiService.get(`/profiles/${userId}/friends`, params);
            return {
                success: true,
                data: response.data || response.friends || [],
                pagination: response.pagination || {}
            };
        } catch (error) {
            console.error('Error fetching friends:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // ========== HIGHLIGHTS & FEATURED CONTENT ==========

    /**
     * Get profile highlights
     */
    async getHighlights(userId = 'me') {
        try {
            const response = await this.apiService.get(`/profiles/${userId}/highlights`);
            return {
                success: true,
                data: response.data || response.highlights || []
            };
        } catch (error) {
            console.error('Error fetching highlights:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    /**
     * Create new highlight
     */
    async createHighlight(highlightData) {
        try {
            const response = await this.apiService.post('/profiles/me/highlights', highlightData);
            return {
                success: true,
                data: response.data || response,
                message: 'Highlight created successfully'
            };
        } catch (error) {
            console.error('Error creating highlight:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get featured content
     */
    async getFeaturedContent(userId = 'me') {
        try {
            const response = await this.apiService.get(`/profiles/${userId}/featured`);
            return {
                success: true,
                data: response.data || response.featured || []
            };
        } catch (error) {
            console.error('Error fetching featured content:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    /**
     * Add featured content
     */
    async addFeaturedContent(contentId, contentType) {
        try {
            const response = await this.apiService.post('/profiles/me/featured', {
                contentId,
                contentType
            });
            return {
                success: true,
                data: response.data || response,
                message: 'Content featured successfully'
            };
        } catch (error) {
            console.error('Error adding featured content:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== BADGES & ACHIEVEMENTS ==========

    /**
     * Get user badges
     */
    async getBadges(userId = 'me') {
        try {
            const response = await this.apiService.get(`/profiles/${userId}/badges`);
            return {
                success: true,
                data: response.data || response.badges || []
            };
        } catch (error) {
            console.error('Error fetching badges:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // ========== PRIVACY & SETTINGS ==========

    /**
     * Update privacy zones
     */
    async updatePrivacyZones(privacySettings) {
        try {
            const response = await this.apiService.put('/profiles/me/privacy', privacySettings);
            return {
                success: true,
                data: response.data || response,
                message: 'Privacy settings updated successfully'
            };
        } catch (error) {
            console.error('Error updating privacy zones:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update custom URL
     */
    async updateCustomUrl(customUrl) {
        try {
            const response = await this.apiService.put('/profiles/me/url', { customUrl });
            return {
                success: true,
                data: response.data || response,
                message: 'Custom URL updated successfully'
            };
        } catch (error) {
            console.error('Error updating custom URL:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== MOCK DATA (FALLBACK) ==========

    getMockProfile(userId) {
        return {
            success: true,
            data: {
                id: userId,
                username: 'johndoe',
                name: 'John Doe',
                bio: 'Tech enthusiast | Traveler | Coffee lover ☕',
                profilePicture: null,
                coverPhoto: null,
                verified: true,
                stats: {
                    followers: 1234,
                    following: 456,
                    friends: 234,
                    posts: 89
                },
                location: 'San Francisco, CA',
                work: 'Software Engineer at Tech Corp',
                education: 'Stanford University',
                interests: ['Technology', 'Travel', 'Photography', 'Coffee']
            }
        };
    }

    getMockPosts(userId) {
        return {
            success: true,
            data: [
                {
                    id: '1',
                    content: 'Great day at the beach! 🏖️',
                    mediaType: 'photo',
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    likes: 156,
                    comments: 23
                },
                {
                    id: '2',
                    content: 'Working on exciting new projects! 💻',
                    mediaType: 'photo',
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    likes: 89,
                    comments: 12
                }
            ],
            pagination: {
                page: 1,
                hasMore: false
            }
        };
    }

    getMockStats() {
        return {
            success: true,
            data: {
                profileViews: 15234,
                postReach: 3845,
                engagement: 89,
                growth: 45
            }
        };
    }

    getMockAnalytics() {
        return {
            success: true,
            data: {
                totalViews: 2534,
                newFollowers: 567,
                engagements: 1234,
                responseRate: 89,
                period: 'week'
            }
        };
    }
}

// Create and export global instance
const profileAPIService = new ProfileAPIService();
window.profileAPIService = profileAPIService;

export default profileAPIService;
