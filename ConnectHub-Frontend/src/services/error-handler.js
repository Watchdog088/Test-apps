/**
 * ConnectHub Error Handler
 * Comprehensive error handling and recovery system
 */

class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.retryStrategies = new Map();
        
        // Set up global error handlers
        this.setupGlobalHandlers();
    }

    /**
     * Setup global error handlers
     */
    setupGlobalHandlers() {
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'UncaughtError',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'UnhandledRejection',
                message: event.reason?.message || 'Promise rejection',
                error: event.reason
            });
        });

        // Handle resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError({
                    type: 'ResourceError',
                    message: `Failed to load: ${event.target.src || event.target.href}`,
                    element: event.target.tagName
                });
            }
        }, true);
    }

    /**
     * Handle error
     */
    handleError(errorData, options = {}) {
        const error = {
            ...errorData,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            online: navigator.onLine,
            id: this.generateErrorId()
        };

        // Log error
        this.logError(error);

        // Show user-friendly message
        if (options.showToUser !== false) {
            this.showErrorToUser(error);
        }

        // Attempt recovery
        if (options.attemptRecovery !== false) {
            this.attemptRecovery(error);
        }

        // Report to analytics (if configured)
        this.reportError(error);

        return error;
    }

    /**
     * Log error
     */
    logError(error) {
        console.error('[ErrorHandler]', error);
        
        // Add to error log
        this.errorLog.push(error);
        
        // Limit log size
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        // Save to IndexedDB for debugging
        if (window.offlineManager) {
            window.offlineManager.saveData('error-logs', error).catch(err => {
                console.error('Failed to save error log:', err);
            });
        }
    }

    /**
     * Show error to user
     */
    showErrorToUser(error) {
        const userMessage = this.getUserFriendlyMessage(error);
        
        if (window.showToast) {
            window.showToast(userMessage, 'error');
        } else {
            // Fallback notification
            this.showFallbackNotification(userMessage, 'error');
        }
    }

    /**
     * Get user-friendly error message
     */
    getUserFriendlyMessage(error) {
        const messages = {
            'NetworkError': 'Connection problem. Please check your internet.',
            'AuthError': 'Authentication failed. Please log in again.',
            'ValidationError': 'Invalid data. Please check your input.',
            'NotFoundError': 'The requested item was not found.',
            'PermissionError': 'You don\'t have permission for this action.',
            'ServerError': 'Server error. Please try again later.',
            'TimeoutError': 'Request timed out. Please try again.',
            'ResourceError': 'Failed to load resource. Refresh the page.',
            'UnhandledRejection': 'An unexpected error occurred.'
        };

        return messages[error.type] || 'Something went wrong. Please try again.';
    }

    /**
     * Attempt error recovery
     */
    attemptRecovery(error) {
        switch (error.type) {
            case 'NetworkError':
                this.handleNetworkError(error);
                break;
            
            case 'AuthError':
                this.handleAuthError(error);
                break;
            
            case 'ResourceError':
                this.handleResourceError(error);
                break;
            
            default:
                // Log for manual review
                console.log('No automatic recovery available for:', error.type);
        }
    }

    /**
     * Handle network errors
     */
    handleNetworkError(error) {
        // Queue failed requests for retry
        if (error.request) {
            if (window.offlineManager) {
                window.offlineManager.queueAction(error.request.type, error.request.data);
            }
        }

        // Show offline indicator
        this.updateConnectionStatus(false);
    }

    /**
     * Handle authentication errors
     */
    handleAuthError(error) {
        // Clear invalid token
        localStorage.removeItem('connecthub_token');
        localStorage.removeItem('connecthub_user');

        // Redirect to login after short delay
        setTimeout(() => {
            if (window.showScreen) {
                window.showScreen('auth-screen');
            } else {
                window.location.href = '/auth.html';
            }
        }, 2000);
    }

    /**
     * Handle resource loading errors
     */
    handleResourceError(error) {
        // Could implement retry logic or fallback resources
        console.log('Resource error - may need manual intervention:', error);
    }

    /**
     * Update connection status indicator
     */
    updateConnectionStatus(isOnline) {
        const indicator = document.getElementById('connection-status');
        if (indicator) {
            indicator.className = isOnline ? 'online' : 'offline';
            indicator.textContent = isOnline ? 'Online' : 'Offline';
        }
    }

    /**
     * Report error to analytics
     */
    reportError(error) {
        // Only report in production
        if (window.location.hostname === 'localhost') return;

        // Send to error tracking service (e.g., Sentry)
        // This is a placeholder - integrate with your error tracking service
        try {
            // Example: Send to server
            if (navigator.sendBeacon) {
                const data = JSON.stringify({
                    ...error,
                    appVersion: window.APP_VERSION || '1.0.0'
                });
                navigator.sendBeacon('/api/v1/errors', data);
            }
        } catch (err) {
            console.error('Failed to report error:', err);
        }
    }

    /**
     * Wrap async function with error handling
     */
    async wrapAsync(fn, context = null, options = {}) {
        try {
            return await fn.call(context);
        } catch (error) {
            this.handleError({
                type: error.name || 'AsyncError',
                message: error.message,
                stack: error.stack,
                error
            }, options);
            
            if (options.rethrow) {
                throw error;
            }
            
            return options.fallbackValue;
        }
    }

    /**
     * Wrap function with error handling
     */
    wrap(fn, context = null, options = {}) {
        return (...args) => {
            try {
                const result = fn.apply(context, args);
                
                // Handle promises
                if (result && typeof result.then === 'function') {
                    return result.catch(error => {
                        this.handleError({
                            type: error.name || 'AsyncError',
                            message: error.message,
                            stack: error.stack,
                            error
                        }, options);
                        
                        if (options.rethrow) {
                            throw error;
                        }
                        
                        return options.fallbackValue;
                    });
                }
                
                return result;
            } catch (error) {
                this.handleError({
                    type: error.name || 'SyncError',
                    message: error.message,
                    stack: error.stack,
                    error
                }, options);
                
                if (options.rethrow) {
                    throw error;
                }
                
                return options.fallbackValue;
            }
        };
    }

    /**
     * Retry failed operation
     */
    async retry(fn, options = {}) {
        const {
            maxRetries = 3,
            delay = 1000,
            backoff = 2,
            onRetry = null
        } = options;

        let lastError;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                if (attempt < maxRetries) {
                    const waitTime = delay * Math.pow(backoff, attempt);
                    
                    if (onRetry) {
                        onRetry(attempt + 1, maxRetries, waitTime);
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    this.handleError({
                        type: 'RetryFailed',
                        message: `Failed after ${maxRetries} retries: ${error.message}`,
                        error
                    });
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Get error logs
     */
    getErrorLogs(filter = null) {
        if (!filter) return this.errorLog;
        
        return this.errorLog.filter(error => {
            return Object.keys(filter).every(key => error[key] === filter[key]);
        });
    }

    /**
     * Clear error logs
     */
    clearErrorLogs() {
        this.errorLog = [];
    }

    /**
     * Generate error ID
     */
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Show fallback notification
     */
    showFallbackNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fallback-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f44336' : '#4caf50'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    /**
     * Check system health
     */
    async checkSystemHealth() {
        const health = {
            online: navigator.onLine,
            storage: null,
            api: null,
            websocket: null
        };

        // Check storage
        try {
            if (window.offlineManager) {
                health.storage = 'operational';
            }
        } catch (error) {
            health.storage = 'error';
        }

        // Check API
        try {
            if (window.apiService) {
                await window.apiService.healthCheck();
                health.api = 'operational';
            }
        } catch (error) {
            health.api = 'error';
        }

        // Check WebSocket
        try {
            if (window.realtimeService) {
                health.websocket = window.realtimeService.isConnected() ? 'connected' : 'disconnected';
            }
        } catch (error) {
            health.websocket = 'error';
        }

        return health;
    }
}

// Create and export global instance
const errorHandler = new ErrorHandler();
window.errorHandler = errorHandler;

// Add helper method to window for easy access
window.handleError = (error, options) => errorHandler.handleError(error, options);

export default errorHandler;
