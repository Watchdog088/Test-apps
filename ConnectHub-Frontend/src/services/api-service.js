/**
 * ConnectHub API Service
 * Comprehensive API client for all mobile app features
 * Phase 1: Core Infrastructure Implementation
 */

class APIService {
    constructor() {
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3001/api/v1'
            : 'https://api.connecthub.com/api/v1';
        this.timeout = 30000;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    /**
     * Get authorization headers
     */
    getHeaders() {
        const token = localStorage.getItem('connecthub_token');
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    /**
     * Make HTTP request with retry logic
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...(options.headers || {})
            }
        };

        let lastError;
        
        for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                // Handle non-JSON responses
                const contentType = response.headers.get('content-type');
                let data;
                
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    data = { message: await response.text() };
                }
                
                if (!response.ok) {
                    // Handle authentication errors
                    if (response.status === 401) {
                        this.handleUnauthorized();
                        throw new Error('Unauthorized - Please log in again');
                    }
                    
                    throw new Error(data.error || data.message || `HTTP ${response.status}`);
                }
                
                return data;
                
            } catch (error) {
                lastError = error;
                
                // Don't retry on auth errors or abort errors
                if (error.message.includes('Unauthorized') || error.name === 'AbortError') {
                    throw error;
                }
                
                // Wait before retrying
                if (attempt < this.retryAttempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Handle unauthorized access
     */
    handleUnauthorized() {
        localStorage.removeItem('connecthub_token');
        localStorage.removeItem('connecthub_user');
        
        // Show notification
        if (window.showToast) {
            window.showToast('Session expired. Please log in again.');
        }
    }

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    /**
     * Upload file
     */
    async uploadFile(file, type = 'general') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const token = localStorage.getItem('connecthub_token');
        const headers = {};
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${this.baseURL}/upload`, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || data.message || 'Upload failed');
            }

            return response.json();
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await fetch(this.baseURL.replace('/api/v1', '/health'));
            return response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'ERROR', error: error.message };
        }
    }
}

// Create and export global instance
const apiService = new APIService();
window.apiService = apiService;

export default apiService;
