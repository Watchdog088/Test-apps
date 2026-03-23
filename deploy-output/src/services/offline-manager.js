/**
 * ConnectHub Offline Manager
 * IndexedDB-based storage for offline functionality
 */

class OfflineManager {
    constructor() {
        this.dbName = 'ConnectHubDB';
        this.dbVersion = 2;
        this.db = null;
        this.isOnline = navigator.onLine;
        
        // Initialize database
        this.initDB();
        
        // Monitor online/offline status
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    /**
     * Initialize IndexedDB
     */
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✓ IndexedDB initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores if they don't exist
                const stores = [
                    { name: 'posts', keyPath: 'id', indexes: [{ name: 'timestamp', keyPath: 'timestamp' }] },
                    { name: 'messages', keyPath: 'id', indexes: [{ name: 'conversationId', keyPath: 'conversationId' }] },
                    { name: 'notifications', keyPath: 'id', indexes: [{ name: 'timestamp', keyPath: 'timestamp' }] },
                    { name: 'pending-posts', keyPath: 'id', autoIncrement: true },
                    { name: 'pending-messages', keyPath: 'id', autoIncrement: true },
                    { name: 'pending-uploads', keyPath: 'id', autoIncrement: true },
                    { name: 'user-data', keyPath: 'userId' },
                    { name: 'cached-data', keyPath: 'key' },
                    { name: 'drafts', keyPath: 'id', autoIncrement: true }
                ];

                stores.forEach(storeConfig => {
                    if (!db.objectStoreNames.contains(storeConfig.name)) {
                        const store = db.createObjectStore(storeConfig.name, {
                            keyPath: storeConfig.keyPath,
                            autoIncrement: storeConfig.autoIncrement
                        });

                        // Create indexes
                        if (storeConfig.indexes) {
                            storeConfig.indexes.forEach(index => {
                                store.createIndex(index.name, index.keyPath, { unique: false });
                            });
                        }

                        console.log(`Created object store: ${storeConfig.name}`);
                    }
                });
            };
        });
    }

    /**
     * Save data to IndexedDB
     */
    async saveData(storeName, data) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get data from IndexedDB
     */
    async getData(storeName, key) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all data from a store
     */
    async getAllData(storeName) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete data from IndexedDB
     */
    async deleteData(storeName, key) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all data from a store
     */
    async clearStore(storeName) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Cache posts for offline viewing
     */
    async cachePosts(posts) {
        const promises = posts.map(post => this.saveData('posts', {
            ...post,
            cachedAt: Date.now()
        }));
        return Promise.all(promises);
    }

    /**
     * Get cached posts
     */
    async getCachedPosts(limit = 50) {
        const posts = await this.getAllData('posts');
        return posts
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    /**
     * Cache messages for offline viewing
     */
    async cacheMessages(conversationId, messages) {
        const promises = messages.map(message => this.saveData('messages', {
            ...message,
            conversationId,
            cachedAt: Date.now()
        }));
        return Promise.all(promises);
    }

    /**
     * Get cached messages for a conversation
     */
    async getCachedMessages(conversationId) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['messages'], 'readonly');
            const store = transaction.objectStore('messages');
            const index = store.index('conversationId');
            const request = index.getAll(conversationId);

            request.onsuccess = () => {
                const messages = request.result.sort((a, b) => a.timestamp - b.timestamp);
                resolve(messages);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Queue action for later (when back online)
     */
    async queueAction(type, data) {
        const storeName = `pending-${type}`;
        const action = {
            type,
            data,
            timestamp: Date.now(),
            retries: 0
        };

        await this.saveData(storeName, action);
        
        // Show notification
        if (window.showToast) {
            window.showToast('Action saved. Will sync when back online.', 'info');
        }

        // Try to sync if online
        if (this.isOnline) {
            this.syncPendingActions();
        }
    }

    /**
     * Sync pending actions when back online
     */
    async syncPendingActions() {
        if (!this.isOnline) return;

        const types = ['posts', 'messages', 'uploads'];
        
        for (const type of types) {
            const storeName = `pending-${type}`;
            const actions = await this.getAllData(storeName);

            for (const action of actions) {
                try {
                    await this.executePendingAction(type, action);
                    await this.deleteData(storeName, action.id);
                    console.log(`✓ Synced ${type} action:`, action.id);
                } catch (error) {
                    console.error(`Failed to sync ${type} action:`, error);
                    
                    // Increment retry count
                    action.retries = (action.retries || 0) + 1;
                    
                    // Remove if too many retries
                    if (action.retries > 3) {
                        await this.deleteData(storeName, action.id);
                        console.log(`Removed failed action after ${action.retries} retries`);
                    } else {
                        await this.saveData(storeName, action);
                    }
                }
            }
        }

        if (window.showToast) {
            window.showToast('All pending actions synced! ✓', 'success');
        }
    }

    /**
     * Execute a pending action
     */
    async executePendingAction(type, action) {
        const apiService = window.apiService;
        
        switch (type) {
            case 'posts':
                return await apiService.post('/posts', action.data);
            
            case 'messages':
                return await apiService.post('/messages', action.data);
            
            case 'uploads':
                // Handle file uploads
                if (action.data.file) {
                    return await apiService.uploadFile(action.data.file, action.data.type);
                }
                break;
        }
    }

    /**
     * Save draft
     */
    async saveDraft(type, content) {
        const draft = {
            type,
            content,
            timestamp: Date.now()
        };
        
        const id = await this.saveData('drafts', draft);
        
        if (window.showToast) {
            window.showToast('Draft saved ✓', 'success');
        }
        
        return id;
    }

    /**
     * Get all drafts
     */
    async getDrafts(type) {
        const allDrafts = await this.getAllData('drafts');
        return type ? allDrafts.filter(d => d.type === type) : allDrafts;
    }

    /**
     * Delete draft
     */
    async deleteDraft(id) {
        return this.deleteData('drafts', id);
    }

    /**
     * Handle online event
     */
    handleOnline() {
        console.log('✓ Connection restored');
        this.isOnline = true;
        
        // Update UI
        const indicator = document.getElementById('connection-status');
        if (indicator) {
            indicator.className = 'online';
            indicator.textContent = 'Online';
        }
        
        if (window.showToast) {
            window.showToast('Back online! Syncing data...', 'success');
        }
        
        // Sync pending actions
        this.syncPendingActions();
        
        // Reconnect WebSocket
        if (window.realtimeService) {
            window.realtimeService.connect(localStorage.getItem('connecthub_token'));
        }
    }

    /**
     * Handle offline event
     */
    handleOffline() {
        console.log('⚠ Connection lost');
        this.isOnline = false;
        
        // Update UI
        const indicator = document.getElementById('connection-status');
        if (indicator) {
            indicator.className = 'offline';
            indicator.textContent = 'Offline';
        }
        
        if (window.showToast) {
            window.showToast('You are offline. Changes will sync when reconnected.', 'warning');
        }
    }

    /**
     * Check if online
     */
    isConnected() {
        return this.isOnline;
    }

    /**
     * Get storage usage
     */
    async getStorageUsage() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            return {
                usage: estimate.usage,
                quota: estimate.quota,
                percentage: Math.round((estimate.usage / estimate.quota) * 100)
            };
        }
        return null;
    }

    /**
     * Clear all offline data
     */
    async clearAllData() {
        const stores = [
            'posts', 'messages', 'notifications', 
            'pending-posts', 'pending-messages', 'pending-uploads',
            'cached-data', 'drafts'
        ];

        const promises = stores.map(store => this.clearStore(store));
        await Promise.all(promises);
        
        console.log('✓ All offline data cleared');
        
        if (window.showToast) {
            window.showToast('All offline data cleared ✓', 'success');
        }
    }
}

// Create and export global instance
const offlineManager = new OfflineManager();
window.offlineManager = offlineManager;

export default offlineManager;
