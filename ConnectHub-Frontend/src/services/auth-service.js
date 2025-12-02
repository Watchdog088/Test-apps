/**
 * ConnectHub Authentication Service
 * Handles user authentication, session management, and authorization
 * Phase 1: Core Infrastructure Implementation
 */

import apiService from './api-service.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.authToken = null;
        this.refreshTokenTimeout = null;
        this.sessionCheckInterval = null;
        this.listeners = [];
        
        // Initialize from storage
        this.loadFromStorage();
        
        // Start session monitoring
        this.startSessionMonitoring();
    }

    /**
     * Load authentication state from storage
     */
    loadFromStorage() {
        try {
            const token = localStorage.getItem('connecthub_token');
            const userJson = localStorage.getItem('connecthub_user');
            
            if (token && userJson) {
                this.authToken = token;
                this.currentUser = JSON.parse(userJson);
                this.scheduleTokenRefresh();
            }
        } catch (error) {
            console.error('Failed to load auth state:', error);
            this.clearAuth();
        }
    }

    /**
     * Save authentication state to storage
     */
    saveToStorage() {
        if (this.authToken && this.currentUser) {
            localStorage.setItem('connecthub_token', this.authToken);
            localStorage.setItem('connecthub_user', JSON.stringify(this.currentUser));
        }
    }

    /**
     * Clear authentication state
     */
    clearAuth() {
        this.authToken = null;
        this.currentUser = null;
        localStorage.removeItem('connecthub_token');
        localStorage.removeItem('connecthub_user');
        
        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
        }
        
        this.notifyListeners('logout');
    }

    /**
     * Register new user
     */
    async register(userData) {
        try {
            const response = await apiService.post('/auth/register', userData);
            
            if (response.token && response.user) {
                this.setAuthData(response.token, response.user);
                this.notifyListeners('register', response.user);
                return response;
            }
            
            throw new Error('Invalid registration response');
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    /**
     * Login user
     */
    async login(credentials) {
        try {
            const response = await apiService.post('/auth/login', credentials);
            
            if (response.token && response.user) {
                this.setAuthData(response.token, response.user);
                this.notifyListeners('login', response.user);
                return response;
            }
            
            throw new Error('Invalid login response');
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            // Call logout endpoint
            if (this.authToken) {
                await apiService.post('/auth/logout');
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            this.clearAuth();
            
            // Disconnect WebSocket if available
            if (window.realtimeService) {
                window.realtimeService.disconnect();
            }
        }
    }

    /**
     * Refresh authentication token
     */
    async refreshToken() {
        try {
            const response = await apiService.post('/auth/refresh');
            
            if (response.token) {
                this.authToken = response.token;
                this.saveToStorage();
                this.scheduleTokenRefresh();
                return response;
            }
            
            throw new Error('Token refresh failed');
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.clearAuth();
            throw error;
        }
    }

    /**
     * Request password reset
     */
    async forgotPassword(email) {
        try {
            return await apiService.post('/auth/forgot-password', { email });
        } catch (error) {
            console.error('Forgot password failed:', error);
            throw error;
        }
    }

    /**
     * Reset password with token
     */
    async resetPassword(token, newPassword) {
        try {
            return await apiService.post('/auth/reset-password', { 
                token, 
                newPassword 
            });
        } catch (error) {
            console.error('Reset password failed:', error);
            throw error;
        }
    }

    /**
     * Change password
     */
    async changePassword(currentPassword, newPassword) {
        try {
            return await apiService.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
        } catch (error) {
            console.error('Change password failed:', error);
            throw error;
        }
    }

    /**
     * Set authentication data
     */
    setAuthData(token, user) {
        this.authToken = token;
        this.currentUser = user;
        this.saveToStorage();
        this.scheduleTokenRefresh();
        
        // Initialize WebSocket if available
        if (window.realtimeService) {
            window.realtimeService.connect(token);
        }
    }

    /**
     * Schedule automatic token refresh
     */
    scheduleTokenRefresh() {
        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
        }
        
        // Refresh token every 50 minutes (before 1 hour expiry)
        this.refreshTokenTimeout = setTimeout(() => {
            this.refreshToken().catch(error => {
                console.error('Auto token refresh failed:', error);
            });
        }, 50 * 60 * 1000);
    }

    /**
     * Start session monitoring
     */
    startSessionMonitoring() {
        // Check session validity every 5 minutes
        this.sessionCheckInterval = setInterval(() => {
            if (this.isAuthenticated()) {
                this.validateSession();
            }
        }, 5 * 60 * 1000);
    }

    /**
     * Validate current session
     */
    async validateSession() {
        try {
            const response = await apiService.get('/auth/validate');
            
            if (!response.valid) {
                this.clearAuth();
            }
        } catch (error) {
            console.error('Session validation failed:', error);
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!(this.authToken && this.currentUser);
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Get authentication token
     */
    getToken() {
        return this.authToken;
    }

    /**
     * Update currentuser data
     */
    updateCurrentUser(userData) {
        if (this.currentUser) {
            this.currentUser = {
                ...this.currentUser,
                ...userData
            };
            this.saveToStorage();
            this.notifyListeners('userUpdate', this.currentUser);
        }
    }

    /**
     * Add authentication listener
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Remove authentication listener
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    /**
     * Notify all listeners of auth state changes
     */
    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Listener error:', error);
            }
        });
    }

    /**
     * Social login (OAuth)
     */
    async socialLogin(provider, accessToken) {
        try {
            const response = await apiService.post('/auth/social-login', {
                provider,
                accessToken
            });
            
            if (response.token && response.user) {
                this.setAuthData(response.token, response.user);
                this.notifyListeners('login', response.user);
                return response;
            }
            
            throw new Error('Social login failed');
        } catch (error) {
            console.error('Social login failed:', error);
            throw error;
        }
    }

    /**
     * Verify email
     */
    async verifyEmail(token) {
        try {
            return await apiService.post('/auth/verify-email', { token });
        } catch (error) {
            console.error('Email verification failed:', error);
            throw error;
        }
    }

    /**
     * Resend verification email
     */
    async resendVerification() {
        try {
            return await apiService.post('/auth/resend-verification');
        } catch (error) {
            console.error('Resend verification failed:', error);
            throw error;
        }
    }

    /**
     * Enable two-factor authentication
     */
    async enableTwoFactor() {
        try {
            return await apiService.post('/auth/2fa/enable');
        } catch (error) {
            console.error('Enable 2FA failed:', error);
            throw error;
        }
    }

    /**
     * Verify two-factor code
     */
    async verifyTwoFactor(code) {
        try {
            return await apiService.post('/auth/2fa/verify', { code });
        } catch (error) {
            console.error('2FA verification failed:', error);
            throw error;
        }
    }

    /**
     * Disable two-factor authentication
     */
    async disableTwoFactor(password) {
        try {
            return await apiService.post('/auth/2fa/disable', { password });
        } catch (error) {
            console.error('Disable 2FA failed:', error);
            throw error;
        }
    }

    /**
     * Get user sessions
     */
    async getSessions() {
        try {
            return await apiService.get('/auth/sessions');
        } catch (error) {
            console.error('Get sessions failed:', error);
            throw error;
        }
    }

    /**
     * Revoke session
     */
    async revokeSession(sessionId) {
        try {
            return await apiService.delete(`/auth/sessions/${sessionId}`);
        } catch (error) {
            console.error('Revoke session failed:', error);
            throw error;
        }
    }

    /**
     * Cleanup on destruction
     */
    destroy() {
        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
        }
        
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
        }
        
        this.listeners = [];
    }
}

// Create and export global instance
const authService = new AuthService();
window.authService = authService;

export default authService;
