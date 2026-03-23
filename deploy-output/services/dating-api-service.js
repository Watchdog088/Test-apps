/**
 * ConnectHub Dating API Service
 * Complete backend integration for Dating System
 * Includes: Matching algorithm, distance calculation, profile setup, dating chat, preferences filtering
 */

class DatingAPIService {
    constructor() {
        this.baseURL = 'https://api.connecthub.com/v1/dating';
        this.wsConnection = null;
        this.userLocation = null;
        this.matchingCache = new Map();
        
        this.init();
    }

    async init() {
        // Initialize geolocation
        await this.initializeGeolocation();
        
        // Connect to real-time dating WebSocket
        this.connectDatingWebSocket();
        
        console.log('✓ Dating API Service initialized');
    }

    // ========== GEOLOCATION & DISTANCE CALCULATION ==========

    /**
     * Initialize user geolocation for distance-based matching
     */
    async initializeGeolocation() {
        if (!navigator.geolocation) {
            console.warn('Geolocation not supported');
            return;
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date().toISOString()
                    };
                    
                    // Save to localStorage
                    localStorage.setItem('userLocation', JSON.stringify(this.userLocation));
                    
                    console.log('✓ User location obtained:', this.userLocation);
                    resolve(this.userLocation);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    // Try to load cached location
                    const cached = localStorage.getItem('userLocation');
                    if (cached) {
                        this.userLocation = JSON.parse(cached);
                    }
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     * Returns distance in miles
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 3959; // Earth's radius in miles
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return Math.round(distance * 10) / 10; // Round to 1 decimal
    }

    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Update user location in real-time
     */
    async updateUserLocation() {
        try {
            const location = await this.initializeGeolocation();
            
            // Send to backend
            await this.apiCall('/profile/location', 'PUT', {
                latitude: location.latitude,
                longitude: location.longitude
            });
            
            return location;
        } catch (error) {
            console.error('Failed to update location:', error);
            throw error;
        }
    }

    // ========== MATCHING ALGORITHM ==========

    /**
     * Advanced Matching Algorithm with Multiple Factors
     * Factors: Interests, Distance, Age, Education, Lifestyle, Activity, Personality
     */
    async getMatches(preferences, limit = 20) {
        try {
            // Build query parameters
            const params = {
                ...preferences,
                latitude: this.userLocation?.latitude,
                longitude: this.userLocation?.longitude,
                limit: limit
            };

            const response = await this.apiCall('/matches/discover', 'POST', params);
            
            // Calculate match scores locally for real-time updates
            const profilesWithScores = response.profiles.map(profile => ({
                ...profile,
                distance: this.calculateDistance(
                    this.userLocation.latitude,
                    this.userLocation.longitude,
                    profile.location.latitude,
                    profile.location.longitude
                ),
                matchScore: this.calculateMatchScore(profile, preferences),
                matchingFactors: this.getDetailedMatchingFactors(profile, preferences)
            }));

            // Sort by match score
            profilesWithScores.sort((a, b) => b.matchScore - a.matchScore);

            // Cache results
            profilesWithScores.forEach(profile => {
                this.matchingCache.set(profile.id, profile);
            });

            return profilesWithScores;
        } catch (error) {
            console.error('Failed to get matches:', error);
            // Return cached matches if available
            return Array.from(this.matchingCache.values());
        }
    }

    /**
     * Calculate comprehensive match score (0-100)
     */
    calculateMatchScore(profile, preferences) {
        let score = 0;
        let totalWeight = 0;

        // 1. Interest Compatibility (30% weight)
        if (preferences.interests && profile.interests) {
            const sharedInterests = profile.interests.filter(i => 
                preferences.interests.includes(i)
            );
            const interestScore = (sharedInterests.length / Math.max(preferences.interests.length, profile.interests.length)) * 100;
            score += interestScore * 0.30;
            totalWeight += 0.30;
        }

        // 2. Distance Score (25% weight)
        if (profile.distance !== undefined) {
            const maxDistance = preferences.maxDistance || 50;
            const distanceScore = Math.max(0, 100 - (profile.distance / maxDistance) * 100);
            score += distanceScore * 0.25;
            totalWeight += 0.25;
        }

        // 3. Age Compatibility (15% weight)
        if (preferences.ageRange && profile.age) {
            const ageInRange = profile.age >= preferences.ageRange.min && 
                               profile.age <= preferences.ageRange.max;
            const ageMidpoint = (preferences.ageRange.min + preferences.ageRange.max) / 2;
            const ageProximity = 100 - Math.abs(profile.age - ageMidpoint) * 2;
            const ageScore = ageInRange ? Math.max(ageProximity, 70) : 30;
            score += ageScore * 0.15;
            totalWeight += 0.15;
        }

        // 4. Education Match (10% weight)
        if (preferences.education && profile.education) {
            const educationMatch = preferences.education.includes(profile.education);
            score += (educationMatch ? 100 : 40) * 0.10;
            totalWeight += 0.10;
        }

        // 5. Lifestyle Compatibility (10% weight)
        if (preferences.lifestyle && profile.lifestyle) {
            let lifestyleScore = 100;
            if (preferences.lifestyle.smoking !== 'Any' && 
                preferences.lifestyle.smoking !== profile.lifestyle.smoking) {
                lifestyleScore -= 40;
            }
            if (preferences.lifestyle.drinking !== 'Any' && 
                preferences.lifestyle.drinking !== profile.lifestyle.drinking) {
                lifestyleScore -= 30;
            }
            score += Math.max(0, lifestyleScore) * 0.10;
            totalWeight += 0.10;
        }

        // 6. Height Preference (5% weight)
        if (preferences.heightRange && profile.height) {
            const heightInRange = profile.height >= preferences.heightRange.min && 
                                 profile.height <= preferences.heightRange.max;
            score += (heightInRange ? 100 : 50) * 0.05;
            totalWeight += 0.05;
        }

        // 7. Activity Level Match (5% weight)
        if (preferences.activityLevel && profile.activityLevel) {
            const activityMatch = preferences.activityLevel === profile.activityLevel;
            score += (activityMatch ? 100 : 60) * 0.05;
            totalWeight += 0.05;
        }

        // Normalize score
        return totalWeight > 0 ? Math.round(score / totalWeight) : 50;
    }

    /**
     * Get detailed breakdown of matching factors
     */
    getDetailedMatchingFactors(profile, preferences) {
        const factors = {
            sharedInterests: [],
            distanceScore: 0,
            ageCompatibility: 0,
            educationMatch: false,
            lifestyleMatch: {},
            heightMatch: false,
            activityMatch: false,
            personalityMatch: 0
        };

        // Shared interests
        if (preferences.interests && profile.interests) {
            factors.sharedInterests = profile.interests.filter(i => 
                preferences.interests.includes(i)
            );
        }

        // Distance score
        if (profile.distance !== undefined) {
            const maxDistance = preferences.maxDistance || 50;
            factors.distanceScore = Math.max(0, 100 - (profile.distance / maxDistance) * 100);
        }

        // Age compatibility
        if (preferences.ageRange && profile.age) {
            const ageInRange = profile.age >= preferences.ageRange.min && 
                               profile.age <= preferences.ageRange.max;
            factors.ageCompatibility = ageInRange ? 100 : 50;
        }

        // Education match
        if (preferences.education && profile.education) {
            factors.educationMatch = preferences.education.includes(profile.education);
        }

        // Lifestyle match
        if (preferences.lifestyle && profile.lifestyle) {
            factors.lifestyleMatch = {
                smoking: preferences.lifestyle.smoking === profile.lifestyle.smoking,
                drinking: preferences.lifestyle.drinking === profile.lifestyle.drinking,
                exercise: preferences.lifestyle.exercise === profile.lifestyle.exercise
            };
        }

        // Height match
        if (preferences.heightRange && profile.height) {
            factors.heightMatch = profile.height >= preferences.heightRange.min && 
                                 profile.height <= preferences.heightRange.max;
        }

        // Activity match
        if (preferences.activityLevel && profile.activityLevel) {
            factors.activityMatch = preferences.activityLevel === profile.activityLevel;
        }

        return factors;
    }

    // ========== PROFILE SETUP & MANAGEMENT ==========

    /**
     * Create/Update dating profile
     */
    async saveDatingProfile(profileData) {
        try {
            const response = await this.apiCall('/profile', 'PUT', profileData);
            
            // Cache profile locally
            localStorage.setItem('datingProfile', JSON.stringify(response.profile));
            
            return response.profile;
        } catch (error) {
            console.error('Failed to save dating profile:', error);
            throw error;
        }
    }

    /**
     * Upload profile photos (max 6)
     */
    async uploadProfilePhotos(files) {
        try {
            if (files.length > 6) {
                throw new Error('Maximum 6 photos allowed');
            }

            const formData = new FormData();
            files.forEach((file, index) => {
                formData.append(`photo${index}`, file);
            });

            const response = await fetch(`${this.baseURL}/profile/photos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Photo upload failed');
            }

            const result = await response.json();
            return result.photoUrls;
        } catch (error) {
            console.error('Photo upload error:', error);
            throw error;
        }
    }

    /**
     * Delete profile photo
     */
    async deleteProfilePhoto(photoId) {
        try {
            await this.apiCall(`/profile/photos/${photoId}`, 'DELETE');
            return true;
        } catch (error) {
            console.error('Failed to delete photo:', error);
            throw error;
        }
    }

    /**
     * Get dating profile
     */
    async getDatingProfile(userId = 'me') {
        try {
            const response = await this.apiCall(`/profile/${userId}`, 'GET');
            return response.profile;
        } catch (error) {
            console.error('Failed to get dating profile:', error);
            // Return cached profile
            const cached = localStorage.getItem('datingProfile');
            return cached ? JSON.parse(cached) : null;
        }
    }

    // ========== PREFERENCES & FILTERING ==========

    /**
     * Save user preferences
     */
    async savePreferences(preferences) {
        try {
            const response = await this.apiCall('/preferences', 'PUT', preferences);
            
            // Cache locally
            localStorage.setItem('datingPreferences', JSON.stringify(preferences));
            
            return response.preferences;
        } catch (error) {
            console.error('Failed to save preferences:', error);
            throw error;
        }
    }

    /**
     * Get user preferences
     */
    async getPreferences() {
        try {
            const response = await this.apiCall('/preferences', 'GET');
            return response.preferences;
        } catch (error) {
            // Return cached preferences
            const cached = localStorage.getItem('datingPreferences');
            return cached ? JSON.parse(cached) : this.getDefaultPreferences();
        }
    }

    getDefaultPreferences() {
        return {
            ageRange: { min: 22, max: 35 },
            maxDistance: 50,
            genderPreference: [],
            interests: [],
            education: ['College Graduate', 'Masters Degree', 'PhD'],
            lifestyle: { 
                smoking: 'No', 
                drinking: 'Socially',
                exercise: 'Regular'
            },
            heightRange: { min: 150, max: 190 },
            activityLevel: 'Moderate',
            dealbreakers: []
        };
    }

    // ========== SWIPE ACTIONS ==========

    /**
     * Record swipe right (like)
     */
    async swipeRight(profileId) {
        try {
            const response = await this.apiCall('/swipe/right', 'POST', { profileId });
            
            // Check if it's a match
            if (response.isMatch) {
                this.handleNewMatch(response.match);
            }
            
            return response;
        } catch (error) {
            console.error('Swipe right error:', error);
            throw error;
        }
    }

    /**
     * Record swipe left (pass)
     */
    async swipeLeft(profileId) {
        try {
            const response = await this.apiCall('/swipe/left', 'POST', { profileId });
            return response;
        } catch (error) {
            console.error('Swipe left error:', error);
            throw error;
        }
    }

    /**
     * Send super like
     */
    async superLike(profileId) {
        try {
            const response = await this.apiCall('/swipe/superlike', 'POST', { profileId });
            
            if (response.isMatch) {
                this.handleNewMatch(response.match);
            }
            
            return response;
        } catch (error) {
            console.error('Super like error:', error);
            throw error;
        }
    }

    // ========== DATING CHAT ==========

    /**
     * Get chat history with a match
     */
    async getChatHistory(matchId, page = 1, limit = 50) {
        try {
            const response = await this.apiCall(
                `/chat/${matchId}?page=${page}&limit=${limit}`, 
                'GET'
            );
            return response.messages;
        } catch (error) {
            console.error('Failed to get chat history:', error);
            return [];
        }
    }

    /**
     * Send message to match
     */
    async sendMessage(matchId, message, type = 'text', attachments = []) {
        try {
            const messageData = {
                matchId,
                message,
                type,
                attachments,
                timestamp: new Date().toISOString()
            };

            const response = await this.apiCall('/chat/message', 'POST', messageData);
            
            // Send via WebSocket for real-time delivery
            if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
                this.wsConnection.send(JSON.stringify({
                    type: 'dating_message',
                    data: messageData
                }));
            }
            
            return response.message;
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }

    /**
     * Mark message as read
     */
    async markMessageRead(messageId) {
        try {
            await this.apiCall(`/chat/message/${messageId}/read`, 'PUT');
            return true;
        } catch (error) {
            console.error('Failed to mark message as read:', error);
            return false;
        }
    }

    /**
     * Send typing indicator
     */
    sendTypingIndicator(matchId, isTyping) {
        if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
            this.wsConnection.send(JSON.stringify({
                type: 'typing_indicator',
                data: { matchId, isTyping }
            }));
        }
    }

    /**
     * Upload chat photo
     */
    async uploadChatPhoto(matchId, file) {
        try {
            const formData = new FormData();
            formData.append('photo', file);
            formData.append('matchId', matchId);

            const response = await fetch(`${this.baseURL}/chat/photo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Photo upload failed');
            }

            const result = await response.json();
            return result.photoUrl;
        } catch (error) {
            console.error('Chat photo upload error:', error);
            throw error;
        }
    }

    // ========== MATCHES MANAGEMENT ==========

    /**
     * Get all matches
     */
    async getMatches() {
        try {
            const response = await this.apiCall('/matches', 'GET');
            return response.matches;
        } catch (error) {
            console.error('Failed to get matches:', error);
            // Return cached matches
            const cached = localStorage.getItem('datingMatches');
            return cached ? JSON.parse(cached) : [];
        }
    }

    /**
     * Unmatch user
     */
    async unmatch(matchId) {
        try {
            await this.apiCall(`/matches/${matchId}`, 'DELETE');
            return true;
        } catch (error) {
            console.error('Failed to unmatch:', error);
            throw error;
        }
    }

    /**
     * Report profile
     */
    async reportProfile(profileId, reason, details) {
        try {
            const response = await this.apiCall('/report', 'POST', {
                profileId,
                reason,
                details,
                timestamp: new Date().toISOString()
            });
            return response;
        } catch (error) {
            console.error('Failed to report profile:', error);
            throw error;
        }
    }

    /**
     * Block user
     */
    async blockUser(userId) {
        try {
            await this.apiCall('/block', 'POST', { userId });
            return true;
        } catch (error) {
            console.error('Failed to block user:', error);
            throw error;
        }
    }

    // ========== WEBSOCKET CONNECTION ==========

    /**
     * Connect to dating WebSocket for real-time updates
     */
    connectDatingWebSocket() {
        const wsURL = 'wss://api.connecthub.com/v1/dating/ws';
        
        try {
            this.wsConnection = new WebSocket(wsURL);

            this.wsConnection.onopen = () => {
                console.log('✓ Dating WebSocket connected');
                
                // Authenticate
                this.wsConnection.send(JSON.stringify({
                    type: 'auth',
                    token: this.getAuthToken()
                }));
            };

            this.wsConnection.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('WebSocket message parse error:', error);
                }
            };

            this.wsConnection.onerror = (error) => {
                console.error('Dating WebSocket error:', error);
            };

            this.wsConnection.onclose = () => {
                console.log('Dating WebSocket disconnected');
                // Reconnect after 5 seconds
                setTimeout(() => this.connectDatingWebSocket(), 5000);
            };
        } catch (error) {
            console.error('Failed to connect Dating WebSocket:', error);
        }
    }

    /**
     * Handle WebSocket messages
     */
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'new_match':
                this.handleNewMatch(data.match);
                break;
            case 'new_message':
                this.handleNewMessage(data.message);
                break;
            case 'typing_indicator':
                this.handleTypingIndicator(data.matchId, data.isTyping);
                break;
            case 'message_read':
                this.handleMessageRead(data.messageId);
                break;
            case 'match_viewed_profile':
                this.handleProfileView(data.viewerId);
                break;
            default:
                console.log('Unknown WebSocket message type:', data.type);
        }
    }

    handleNewMatch(match) {
        // Dispatch event for UI update
        document.dispatchEvent(new CustomEvent('datingNewMatch', {
            detail: match
        }));
        
        // Show notification
        if (typeof showNotification === 'function') {
            showNotification('New Match!', `You matched with ${match.profile.name}!`);
        }
    }

    handleNewMessage(message) {
        // Dispatch event for UI update
        document.dispatchEvent(new CustomEvent('datingNewMessage', {
            detail: message
        }));
    }

    handleTypingIndicator(matchId, isTyping) {
        document.dispatchEvent(new CustomEvent('datingTypingIndicator', {
            detail: { matchId, isTyping }
        }));
    }

    handleMessageRead(messageId) {
        document.dispatchEvent(new CustomEvent('datingMessageRead', {
            detail: { messageId }
        }));
    }

    handleProfileView(viewerId) {
        document.dispatchEvent(new CustomEvent('datingProfileViewed', {
            detail: { viewerId }
        }));
    }

    // ========== UTILITY METHODS ==========

    /**
     * Generic API call wrapper
     */
    async apiCall(endpoint, method = 'GET', data = null) {
        const url = `${this.baseURL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`API call failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API call error (${endpoint}):`, error);
            throw error;
        }
    }

    /**
     * Get authentication token
     */
    getAuthToken() {
        return localStorage.getItem('authToken') || 'demo_token_123';
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.wsConnection) {
            this.wsConnection.close();
        }
        this.matchingCache.clear();
    }
}

// Initialize and export
const datingAPIService = new DatingAPIService();
window.datingAPIService = datingAPIService;

export default datingAPIService;
