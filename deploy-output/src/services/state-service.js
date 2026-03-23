/**
 * ConnectHub State Management Service
 * Centralized state management for the mobile app
 * Phase 1: Core Infrastructure Implementation
 */

class StateService {
    constructor() {
        this.state = {
            user: null,
            feed: [],
            messages: [],
            notifications: [],
            friends: [],
            groups: [],
            events: [],
            savedPosts: [],
            activeConversation: null,
            datingProfile: null,
            matches: [],
            settings: this.loadSettings()
        };
        
        this.listeners = new Map();
        this.stateHistory = [];
        this.maxHistoryLength = 50;
    }

    /**
     * Get current state
     */
    getState(path = null) {
        if (!path) return this.state;
        
        // Support nested paths like 'user.profile.name'
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }

    /**
     * Set state
     */
    setState(path, value, silent = false) {
        const oldValue = this.getState(path);
        
        // Update state
        if (path.includes('.')) {
            // Handle nested paths
            const keys = path.split('.');
            const lastKey = keys.pop();
            const target = keys.reduce((obj, key) => {
                if (!obj[key]) obj[key] = {};
                return obj[key];
            }, this.state);
            target[lastKey] = value;
        } else {
            this.state[path] = value;
        }
        
        // Save to history
        this.addToHistory(path, oldValue, value);
        
        // Persist certain states
        this.persistState(path);
        
        // Notify listeners
        if (!silent) {
            this.notifyListeners(path, value, oldValue);
        }
    }

    /**
     * Update state (merge with existing)
     */
    updateState(path, updates, silent = false) {
        const currentValue = this.getState(path);
        const newValue = { ...currentValue, ...updates };
        this.setState(path, newValue, silent);
    }

    /**
     * Add item to array state
     */
    addToArray(path, item) {
        const currentArray = this.getState(path) || [];
        this.setState(path, [...currentArray, item]);
    }

    /**
     * Remove item from array state
     */
    removeFromArray(path, predicate) {
        const currentArray = this.getState(path) || [];
        const newArray = currentArray.filter(item => !predicate(item));
        this.setState(path, newArray);
    }

    /**
     * Update item in array state
     */
    updateInArray(path, predicate, updates) {
        const currentArray = this.getState(path) || [];
        const newArray = currentArray.map(item => 
            predicate(item) ? { ...item, ...updates } : item
        );
        this.setState(path, newArray);
    }

    /**
     * Subscribe to state changes
     */
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, []);
        }
        this.listeners.get(path).push(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(path);
            if (callbacks) {
                this.listeners.set(
                    path,
                    callbacks.filter(cb => cb !== callback)
                );
            }
        };
    }

    /**
     * Notify listeners of state changes
     */
    notifyListeners(path, newValue, oldValue) {
        // Notify exact path listeners
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (error) {
                    console.error(`Error in state listener for ${path}:`, error);
                }
            });
        }
        
        // Notify wildcard listeners (*)
        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(callback => {
                try {
                    callback(path, newValue, oldValue);
                } catch (error) {
                    console.error('Error in wildcard state listener:', error);
                }
            });
        }
        
        // Notify parent path listeners
        const pathParts = path.split('.');
        for (let i = pathParts.length - 1; i > 0; i--) {
            const parentPath = pathParts.slice(0, i).join('.');
            if (this.listeners.has(parentPath)) {
                this.listeners.get(parentPath).forEach(callback => {
                    try {
                        callback(this.getState(parentPath), null);
                    } catch (error) {
                        console.error(`Error in parent listener for ${parentPath}:`, error);
                    }
                });
            }
        }
    }

    /**
     * Add to state history
     */
    addToHistory(path, oldValue, newValue) {
        this.stateHistory.push({
            path,
            oldValue,
            newValue,
            timestamp: Date.now()
        });
        
        // Limit history size
        if (this.stateHistory.length > this.maxHistoryLength) {
            this.stateHistory.shift();
        }
    }

    /**
     * Get state history
     */
    getHistory(path = null) {
        if (!path) return this.stateHistory;
        return this.stateHistory.filter(entry => entry.path === path);
    }

    /**
     * Clear state history
     */
    clearHistory() {
        this.stateHistory = [];
    }

    /**
     * Persist state to localStorage
     */
    persistState(path) {
        const persistPaths = ['settings', 'user', 'datingProfile'];
        
        if (persistPaths.includes(path)) {
            try {
                const value = this.getState(path);
                localStorage.setItem(`connecthub_${path}`, JSON.stringify(value));
            } catch (error) {
                console.error(`Failed to persist ${path}:`, error);
            }
        }
    }

    /**
     * Load persisted state
     */
    loadPersistedState() {
        const persistPaths = ['settings', 'user', 'datingProfile'];
        
        persistPaths.forEach(path => {
            try {
                const stored = localStorage.getItem(`connecthub_${path}`);
                if (stored) {
                    this.state[path] = JSON.parse(stored);
                }
            } catch (error) {
                console.error(`Failed to load ${path}:`, error);
            }
        });
    }

    /**
     * Load default settings
     */
    loadSettings() {
        const defaultSettings = {
            theme: 'light',
            language: 'en',
            notifications: {
                enabled: true,
                sound: true,
                vibration: true,
                messages: true,
                likes: true,
                comments: true,
                follows: true,
                mentions: true
            },
            privacy: {
                profileVisibility: 'public',
                showOnlineStatus: true,
                showLastSeen: true,
                allowMessagesFrom: 'everyone',
                allowTagging: true,
                showLocation: false
            },
            feed: {
                autoplayVideos: true,
                dataUsage: 'standard',
                showSuggestedPosts: true
            },
            dating: {
                ageRange: [18, 50],
                maxDistance: 50,
                showMe: 'everyone',
                discoverable: true
            }
        };
        
        try {
            const stored = localStorage.getItem('connecthub_settings');
            if (stored) {
                return { ...defaultSettings, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
        
        return defaultSettings;
    }

    /**
     * Update settings
     */
    updateSettings(path, value) {
        const keys = path.split('.');
        let settings = { ...this.state.settings };
        
        if (keys.length === 1) {
            settings[keys[0]] = value;
        } else {
            let target = settings;
            for (let i = 0; i < keys.length - 1; i++) {
                target[keys[i]] = { ...target[keys[i]] };
                target = target[keys[i]];
            }
            target[keys[keys.length - 1]] = value;
        }
        
        this.setState('settings', settings);
    }

    /**
     * Clear all state
     */
    clearState() {
        this.state = {
            user: null,
            feed: [],
            messages: [],
            notifications: [],
            friends: [],
            groups: [],
            events: [],
            savedPosts: [],
            activeConversation: null,
            datingProfile: null,
            matches: [],
            settings: this.loadSettings()
        };
        
        this.clearHistory();
        this.notifyListeners('*', this.state, null);
    }

    /**
     * Export state
     */
    exportState() {
        return JSON.stringify(this.state, null, 2);
    }

    /**
     * Import state
     */
    importState(stateJson) {
        try {
            const newState = JSON.parse(stateJson);
            this.state = newState;
            this.notifyListeners('*', this.state, null);
            return true;
        } catch (error) {
            console.error('Failed to import state:', error);
            return false;
        }
    }

    /**
     * Batch update multiple states
     */
    batchUpdate(updates) {
        Object.entries(updates).forEach(([path, value]) => {
            this.setState(path, value, true);
        });
        
        // Notify all affected listeners after batch
        Object.keys(updates).forEach(path => {
            this.notifyListeners(path, this.getState(path), null);
        });
    }

    /**
     * Computed state getter
     */
    computed(computeFn) {
        return computeFn(this.state);
    }

    /**
     * Get unread message count
     */
    getUnreadMessageCount() {
        return this.computed(state => {
            const conversations = state.messages;
            return conversations.reduce((count, conv) => {
                return count + (conv.unreadCount || 0);
            }, 0);
        });
    }

    /**
     * Get unread notification count
     */
    getUnreadNotificationCount() {
        return this.computed(state => {
            return state.notifications.filter(n => !n.read).length;
        });
    }

    /**
     * Get active conversation
     */
    getActiveConversation() {
        return this.computed(state => {
            const conversationId = state.activeConversation;
            if (!conversationId) return null;
            return state.messages.find(m => m.id === conversationId);
        });
    }

    /**
     * Get user feed
     */
    getFeed(type = 'all') {
        return this.computed(state => {
            const feed = state.feed;
            if (type === 'all') return feed;
            return feed.filter(post => post.type === type);
        });
    }

    /**
     * Check if post is saved
     */
    isPostSaved(postId) {
        return this.computed(state => {
            return state.savedPosts.some(p => p.id === postId);
        });
    }

    /**
     * Check if user is friend
     */
    isFriend(userId) {
        return this.computed(state => {
            return state.friends.some(f => f.id === userId);
        });
    }

    /**
     * Debug state
     */
    debug() {
        console.log('Current State:', this.state);
        console.log('Listeners:', this.listeners);
        console.log('History:', this.stateHistory);
    }
}

// Create and export global instance
const stateService = new StateService();

// Load persisted state on initialization
stateService.loadPersistedState();

window.stateService = stateService;

export default stateService;
