/**
 * ConnectHub Mobile Design - Menu System
 * Complete Menu Navigation with Session Management, Customization, and Deep Linking
 */

class MenuSystem {
    constructor() {
        this.currentUser = null;
        this.recentlyAccessed = [];
        this.menuCustomization = {
            pinnedItems: [],
            hiddenItems: [],
            order: []
        };
        this.sessionData = null;
        this.badges = {};
        this.deepLinkHandlers = {};
        
        this.init();
    }

    init() {
        this.loadSession();
        this.loadRecentlyAccessed();
        this.loadMenuCustomization();
        this.loadBadges();
        this.setupDeepLinking();
        this.startBadgeUpdater();
    }

    // ==================== SESSION MANAGEMENT ====================
    
    loadSession() {
        try {
            const sessionData = localStorage.getItem('connecthub_session');
            if (sessionData) {
                this.sessionData = JSON.parse(sessionData);
                this.currentUser = this.sessionData.user;
                
                // Check session expiry
                if (this.sessionData.expiresAt && Date.now() > this.sessionData.expiresAt) {
                    this.handleSessionExpired();
                    return false;
                }
                
                return true;
            }
        } catch (error) {
            console.error('Error loading session:', error);
        }
        return false;
    }

    createSession(userData, rememberMe = false) {
        const expiryTime = rememberMe 
            ? Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
            : Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        
        this.sessionData = {
            user: userData,
            createdAt: Date.now(),
            expiresAt: expiryTime,
            sessionId: this.generateSessionId(),
            rememberMe: rememberMe
        };
        
        this.currentUser = userData;
        localStorage.setItem('connecthub_session', JSON.stringify(this.sessionData));
        
        // Store session token
        this.storeSessionToken(this.sessionData.sessionId);
        
        return this.sessionData;
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    storeSessionToken(token) {
        sessionStorage.setItem('connecthub_token', token);
    }

    getSessionToken() {
        return sessionStorage.getItem('connecthub_token');
    }

    refreshSession() {
        if (this.sessionData) {
            const expiryTime = this.sessionData.rememberMe
                ? Date.now() + (30 * 24 * 60 * 60 * 1000)
                : Date.now() + (24 * 60 * 60 * 1000);
            
            this.sessionData.expiresAt = expiryTime;
            localStorage.setItem('connecthub_session', JSON.stringify(this.sessionData));
        }
    }

    handleSessionExpired() {
        this.showNotification('Your session has expired. Please log in again.', 'warning');
        setTimeout(() => {
            this.logout();
        }, 2000);
    }

    logout() {
        // Clear session data
        localStorage.removeItem('connecthub_session');
        sessionStorage.removeItem('connecthub_token');
        
        // Clear user-specific data
        this.currentUser = null;
        this.sessionData = null;
        
        // Clear sensitive cached data
        this.clearSensitiveCache();
        
        // Show logout confirmation
        this.showNotification('✓ Logged out successfully', 'success');
        
        // Redirect to login page after a brief delay
        setTimeout(() => {
            this.redirectToLogin();
        }, 1500);
    }

    clearSensitiveCache() {
        // Clear any sensitive cached data
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('user_') || key.includes('private_'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    redirectToLogin() {
        // Redirect to login page
        if (typeof window !== 'undefined') {
            window.location.href = '/auth.html?redirect=' + encodeURIComponent(window.location.pathname);
        }
    }

    // ==================== RECENTLY ACCESSED ITEMS ====================
    
    loadRecentlyAccessed() {
        try {
            const stored = localStorage.getItem('connecthub_recent_items');
            if (stored) {
                this.recentlyAccessed = JSON.parse(stored);
            } else {
                this.recentlyAccessed = [];
            }
        } catch (error) {
            console.error('Error loading recently accessed:', error);
            this.recentlyAccessed = [];
        }
    }

    addRecentlyAccessed(item) {
        // Remove if already exists
        this.recentlyAccessed = this.recentlyAccessed.filter(i => i.id !== item.id);
        
        // Add to beginning
        this.recentlyAccessed.unshift({
            ...item,
            accessedAt: Date.now()
        });
        
        // Keep only last 10 items
        this.recentlyAccessed = this.recentlyAccessed.slice(0, 10);
        
        // Save to storage
        localStorage.setItem('connecthub_recent_items', JSON.stringify(this.recentlyAccessed));
        
        // Update UI
        this.renderRecentlyAccessed();
    }

    getRecentlyAccessed(limit = 5) {
        return this.recentlyAccessed.slice(0, limit);
    }

    clearRecentlyAccessed() {
        this.recentlyAccessed = [];
        localStorage.removeItem('connecthub_recent_items');
        this.renderRecentlyAccessed();
        this.showNotification('✓ Recently accessed items cleared', 'success');
    }

    renderRecentlyAccessed() {
        const container = document.getElementById('recently-accessed-container');
        if (!container) return;

        if (this.recentlyAccessed.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                    <div style="font-size: 48px; margin-bottom: 16px;">📂</div>
                    <div style="font-size: 15px; font-weight: 600; margin-bottom: 8px;">No Recent Items</div>
                    <div style="font-size: 13px;">Your recently accessed items will appear here</div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.recentlyAccessed.map(item => `
            <div class="list-item" onclick="menuSystem.navigateToItem('${item.id}', '${item.screen}')">
                <div class="list-item-icon">${item.icon}</div>
                <div class="list-item-content">
                    <div class="list-item-title">${item.title}</div>
                    <div class="list-item-subtitle">${this.formatTimeAgo(item.accessedAt)}</div>
                </div>
                <div class="list-item-arrow">→</div>
            </div>
        `).join('');
    }

    formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
        if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
        return Math.floor(seconds / 604800) + 'w ago';
    }

    // ==================== MENU CUSTOMIZATION ====================
    
    loadMenuCustomization() {
        try {
            const stored = localStorage.getItem('connecthub_menu_customization');
            if (stored) {
                this.menuCustomization = JSON.parse(stored);
            } else {
                this.menuCustomization = {
                    pinnedItems: [],
                    hiddenItems: [],
                    order: this.getDefaultMenuOrder()
                };
            }
        } catch (error) {
            console.error('Error loading menu customization:', error);
            this.menuCustomization = {
                pinnedItems: [],
                hiddenItems: [],
                order: this.getDefaultMenuOrder()
            };
        }
    }

    saveMenuCustomization() {
        localStorage.setItem('connecthub_menu_customization', JSON.stringify(this.menuCustomization));
        this.showNotification('✓ Menu customization saved', 'success');
    }

    getDefaultMenuOrder() {
        return [
            'games', 'marketplace', 'business', 'wallet', 'analytics',
            'help', 'friends', 'groups', 'events', 'trending',
            'live', 'stories', 'saved', 'profile', 'settings',
            'messages', 'notifications', 'dating', 'video-calls', 'media-hub'
        ];
    }

    pinMenuItem(itemId) {
        if (!this.menuCustomization.pinnedItems.includes(itemId)) {
            this.menuCustomization.pinnedItems.push(itemId);
            this.saveMenuCustomization();
            this.renderMenu();
        }
    }

    unpinMenuItem(itemId) {
        this.menuCustomization.pinnedItems = this.menuCustomization.pinnedItems.filter(id => id !== itemId);
        this.saveMenuCustomization();
        this.renderMenu();
    }

    hideMenuItem(itemId) {
        if (!this.menuCustomization.hiddenItems.includes(itemId)) {
            this.menuCustomization.hiddenItems.push(itemId);
            this.saveMenuCustomization();
            this.renderMenu();
        }
    }

    unhideMenuItem(itemId) {
        this.menuCustomization.hiddenItems = this.menuCustomization.hiddenItems.filter(id => id !== itemId);
        this.saveMenuCustomization();
        this.renderMenu();
    }

    reorderMenuItem(itemId, direction) {
        const currentIndex = this.menuCustomization.order.indexOf(itemId);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= this.menuCustomization.order.length) return;

        // Swap items
        [this.menuCustomization.order[currentIndex], this.menuCustomization.order[newIndex]] = 
        [this.menuCustomization.order[newIndex], this.menuCustomization.order[currentIndex]];

        this.saveMenuCustomization();
        this.renderMenu();
    }

    resetMenuCustomization() {
        this.menuCustomization = {
            pinnedItems: [],
            hiddenItems: [],
            order: this.getDefaultMenuOrder()
        };
        this.saveMenuCustomization();
        this.renderMenu();
        this.showNotification('✓ Menu reset to default', 'success');
    }

    // ==================== DYNAMIC BADGES ====================
    
    loadBadges() {
        try {
            const stored = localStorage.getItem('connecthub_menu_badges');
            if (stored) {
                this.badges = JSON.parse(stored);
            } else {
                this.initializeDefaultBadges();
            }
        } catch (error) {
            console.error('Error loading badges:', error);
            this.initializeDefaultBadges();
        }
    }

    initializeDefaultBadges() {
        this.badges = {
            messages: 5,
            notifications: 12,
            friends: 3,
            marketplace: 2,
            dating: 8
        };
        this.saveBadges();
    }

    saveBadges() {
        localStorage.setItem('connecthub_menu_badges', JSON.stringify(this.badges));
    }

    updateBadge(itemId, count) {
        if (count > 0) {
            this.badges[itemId] = count;
        } else {
            delete this.badges[itemId];
        }
        this.saveBadges();
        this.renderBadges();
    }

    incrementBadge(itemId, amount = 1) {
        this.badges[itemId] = (this.badges[itemId] || 0) + amount;
        this.saveBadges();
        this.renderBadges();
    }

    decrementBadge(itemId, amount = 1) {
        if (this.badges[itemId]) {
            this.badges[itemId] = Math.max(0, this.badges[itemId] - amount);
            if (this.badges[itemId] === 0) {
                delete this.badges[itemId];
            }
            this.saveBadges();
            this.renderBadges();
        }
    }

    clearBadge(itemId) {
        delete this.badges[itemId];
        this.saveBadges();
        this.renderBadges();
    }

    renderBadges() {
        Object.keys(this.badges).forEach(itemId => {
            const badge = document.querySelector(`[data-badge-for="${itemId}"]`);
            if (badge) {
                badge.textContent = this.badges[itemId];
                badge.style.display = this.badges[itemId] > 0 ? 'flex' : 'none';
            }
        });
    }

    startBadgeUpdater() {
        // Simulate badge updates (in production, this would come from backend)
        setInterval(() => {
            this.simulateBadgeUpdates();
        }, 30000); // Every 30 seconds
    }

    simulateBadgeUpdates() {
        // Simulate random badge updates for demo purposes
        const items = ['messages', 'notifications', 'friends', 'marketplace'];
        const randomItem = items[Math.floor(Math.random() * items.length)];
        
        if (Math.random() > 0.5) {
            this.incrementBadge(randomItem, 1);
        }
    }

    // ==================== DEEP LINKING ====================
    
    setupDeepLinking() {
        // Register deep link handlers for each menu item
        this.registerDeepLink('games', (params) => this.openGamesScreen(params));
        this.registerDeepLink('marketplace', (params) => this.openMarketplaceScreen(params));
        this.registerDeepLink('business', (params) => this.openBusinessScreen(params));
        this.registerDeepLink('wallet', (params) => this.openWalletScreen(params));
        this.registerDeepLink('analytics', (params) => this.openAnalyticsScreen(params));
        this.registerDeepLink('help', (params) => this.openHelpScreen(params));
        this.registerDeepLink('friends', (params) => this.openFriendsScreen(params));
        this.registerDeepLink('groups', (params) => this.openGroupsScreen(params));
        this.registerDeepLink('events', (params) => this.openEventsScreen(params));
        this.registerDeepLink('trending', (params) => this.openTrendingScreen(params));
        this.registerDeepLink('settings', (params) => this.openSettingsScreen(params));
        this.registerDeepLink('profile', (params) => this.openProfileScreen(params));
        
        // Listen for URL changes
        this.handleDeepLinkFromURL();
    }

    registerDeepLink(path, handler) {
        this.deepLinkHandlers[path] = handler;
    }

    handleDeepLink(deepLink) {
        try {
            const url = new URL(deepLink, window.location.origin);
            const path = url.pathname.replace('/', '');
            const params = Object.fromEntries(url.searchParams);
            
            if (this.deepLinkHandlers[path]) {
                this.deepLinkHandlers[path](params);
                return true;
            }
        } catch (error) {
            console.error('Error handling deep link:', error);
        }
        return false;
    }

    handleDeepLinkFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const screen = urlParams.get('screen');
        const action = urlParams.get('action');
        const id = urlParams.get('id');
        
        if (screen) {
            this.navigateToScreen(screen, { action, id });
        }
    }

    generateDeepLink(screen, params = {}) {
        const url = new URL(window.location.origin);
        url.searchParams.set('screen', screen);
        Object.keys(params).forEach(key => {
            url.searchParams.set(key, params[key]);
        });
        return url.toString();
    }

    shareDeepLink(screen, params = {}) {
        const deepLink = this.generateDeepLink(screen, params);
        
        if (navigator.share) {
            navigator.share({
                title: 'ConnectHub',
                url: deepLink
            });
        } else {
            this.copyToClipboard(deepLink);
            this.showNotification('✓ Link copied to clipboard', 'success');
        }
    }

    // ==================== NAVIGATION ====================
    
    navigateToScreen(screenId, params = {}) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId + '-screen');
        if (targetScreen) {
            targetScreen.classList.add('active');
            
            // Add to recently accessed
            const menuItem = this.getMenuItemById(screenId);
            if (menuItem) {
                this.addRecentlyAccessed({
                    id: screenId,
                    screen: screenId,
                    title: menuItem.title,
                    icon: menuItem.icon
                });
            }
            
            // Update URL without refresh
            const newUrl = this.generateDeepLink(screenId, params);
            window.history.pushState({ screen: screenId }, '', newUrl);
        }
    }

    navigateToItem(itemId, screenId) {
        this.navigateToScreen(screenId);
    }

    getMenuItemById(id) {
        const menuItems = {
            games: { title: 'Games & Extras', icon: '🎮' },
            marketplace: { title: 'Marketplace', icon: '🛍️' },
            business: { title: 'Business Tools', icon: '💼' },
            wallet: { title: 'Wallet & Coins', icon: '💰' },
            analytics: { title: 'Analytics', icon: '📊' },
            help: { title: 'Help & Support', icon: '💡' },
            friends: { title: 'Friends', icon: '👥' },
            groups: { title: 'Groups', icon: '👨‍👩‍👧‍👦' },
            events: { title: 'Events', icon: '📅' },
            trending: { title: 'Trending', icon: '🔥' },
            settings: { title: 'Settings', icon: '⚙️' },
            profile: { title: 'Profile', icon: '👤' }
        };
        return menuItems[id];
    }

    // Screen opening methods for deep linking
    openGamesScreen(params) { this.navigateToScreen('games', params); }
    openMarketplaceScreen(params) { this.navigateToScreen('marketplace', params); }
    openBusinessScreen(params) { this.navigateToScreen('business', params); }
    openWalletScreen(params) { this.navigateToScreen('wallet', params); }
    openAnalyticsScreen(params) { this.navigateToScreen('analytics', params); }
    openHelpScreen(params) { this.navigateToScreen('help', params); }
    openFriendsScreen(params) { this.navigateToScreen('friends', params); }
    openGroupsScreen(params) { this.navigateToScreen('groups', params); }
    openEventsScreen(params) { this.navigateToScreen('events', params); }
    openTrendingScreen(params) { this.navigateToScreen('trending', params); }
    openSettingsScreen(params) { this.navigateToScreen('settings', params); }
    openProfileScreen(params) { this.navigateToScreen('profile', params); }

    // ==================== MENU RENDERING ====================
    
    renderMenu() {
        const container = document.getElementById('menu-items-container');
        if (!container) return;

        // Get all menu items in customized order
        const items = this.getOrderedMenuItems();
        
        let html = '';
        
        // Render pinned items first
        if (this.menuCustomization.pinnedItems.length > 0) {
            html += '<div class="section-header"><div class="section-title">📌 Pinned</div></div>';
            this.menuCustomization.pinnedItems.forEach(itemId => {
                const item = items.find(i => i.id === itemId);
                if (item) {
                    html += this.renderMenuItem(item, true);
                }
            });
        }
        
        // Render regular items
        html += '<div class="section-header"><div class="section-title">All Items</div></div>';
        items.forEach(item => {
            if (!this.menuCustomization.pinnedItems.includes(item.id) &&
                !this.menuCustomization.hiddenItems.includes(item.id)) {
                html += this.renderMenuItem(item, false);
            }
        });
        
        // Render hidden items section
        if (this.menuCustomization.hiddenItems.length > 0) {
            html += '<div class="section-header"><div class="section-title">👁️‍🗨️ Hidden Items</div></div>';
            this.menuCustomization.hiddenItems.forEach(itemId => {
                const item = items.find(i => i.id === itemId);
                if (item) {
                    html += this.renderMenuItem(item, false, true);
                }
            });
        }
        
        container.innerHTML = html;
        this.renderBadges();
    }

    renderMenuItem(item, isPinned, isHidden = false) {
        const badge = this.badges[item.id] ? `<div class="badge" data-badge-for="${item.id}">${this.badges[item.id]}</div>` : '';
        const pinIcon = isPinned ? '📌' : '';
        const opacity = isHidden ? 'opacity: 0.5;' : '';
        
        return `
            <div class="list-item" onclick="menuSystem.navigateToScreen('${item.id}')" style="${opacity}">
                <div class="list-item-icon" style="position: relative;">
                    ${item.icon}
                    ${badge}
                </div>
                <div class="list-item-content">
                    <div class="list-item-title">${pinIcon} ${item.title}</div>
                    <div class="list-item-subtitle">${item.subtitle}</div>
                </div>
                <div class="list-item-arrow" onclick="event.stopPropagation(); menuSystem.showItemOptions('${item.id}')">⋮</div>
            </div>
        `;
    }

    getOrderedMenuItems() {
        const allItems = [
            { id: 'games', icon: '🎮', title: 'Games & Extras', subtitle: '16 games available' },
            { id: 'marketplace', icon: '🛍️', title: 'Marketplace', subtitle: 'Buy & sell items' },
            { id: 'business', icon: '💼', title: 'Business Tools', subtitle: '17 tools available' },
            { id: 'wallet', icon: '💰', title: 'Wallet & Coins', subtitle: 'Manage your balance' },
            { id: 'analytics', icon: '📊', title: 'Analytics', subtitle: '13 metrics available' },
            { id: 'help', icon: '💡', title: 'Help & Support', subtitle: '12 support features' },
            { id: 'friends', icon: '👥', title: 'Friends', subtitle: 'Manage connections' },
            { id: 'groups', icon: '👨‍👩‍👧‍👦', title: 'Groups', subtitle: 'Join communities' },
            { id: 'events', icon: '📅', title: 'Events', subtitle: 'Discover events' },
            { id: 'trending', icon: '🔥', title: 'Trending', subtitle: "What's hot now" },
            { id: 'settings', icon: '⚙️', title: 'Settings', subtitle: 'App preferences' },
            { id: 'profile', icon: '👤', title: 'Profile', subtitle: 'Your profile' }
        ];

        // Sort by custom order
        return allItems.sort((a, b) => {
            const aIndex = this.menuCustomization.order.indexOf(a.id);
            const bIndex = this.menuCustomization.order.indexOf(b.id);
            return aIndex - bIndex;
        });
    }

    showItemOptions(itemId) {
        const isPinned = this.menuCustomization.pinnedItems.includes(itemId);
        const isHidden = this.menuCustomization.hiddenItems.includes(itemId);
        
        const options = [
            isPinned ? 'Unpin' : 'Pin to Top',
            isHidden ? 'Unhide' : 'Hide',
            'Move Up',
            'Move Down',
            'Share Link'
        ];
        
        // Simple modal for options
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-header">
                <div class="modal-close" onclick="this.parentElement.parentElement.remove()">✕</div>
                <div class="modal-title">Menu Options</div>
            </div>
            <div class="modal-content">
                ${options.map(option => `
                    <div class="list-item" onclick="menuSystem.handleItemOption('${itemId}', '${option}'); this.parentElement.parentElement.remove();">
                        <div class="list-item-content">
                            <div class="list-item-title">${option}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        document.body.appendChild(modal);
    }

    handleItemOption(itemId, option) {
        switch(option) {
            case 'Pin to Top':
                this.pinMenuItem(itemId);
                break;
            case 'Unpin':
                this.unpinMenuItem(itemId);
                break;
            case 'Hide':
                this.hideMenuItem(itemId);
                break;
            case 'Unhide':
                this.unhideMenuItem(itemId);
                break;
            case 'Move Up':
                this.reorderMenuItem(itemId, 'up');
                break;
            case 'Move Down':
                this.reorderMenuItem(itemId, 'down');
                break;
            case 'Share Link':
                this.shareDeepLink(itemId);
                break;
        }
    }

    // ==================== MENU PERSONALIZATION ====================
    
    openMenuPersonalization() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'personalization-modal';
        modal.innerHTML = `
            <div class="modal-header">
                <div class="modal-close" onclick="document.getElementById('personalization-modal').remove()">✕</div>
                <div class="modal-title">Personalize Menu</div>
            </div>
            <div class="modal-content">
                <div class="card">
                    <div style="font-size: 15px; font-weight: 600; margin-bottom: 16px;">Quick Actions</div>
                    
                    <div class="list-item" onclick="menuSystem.resetMenuCustomization(); document.getElementById('personalization-modal').remove();">
                        <div class="list-item-icon">🔄</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Reset to Default</div>
                            <div class="list-item-subtitle">Restore original menu layout</div>
                        </div>
                    </div>
                    
                    <div class="list-item" onclick="menuSystem.clearRecentlyAccessed();">
                        <div class="list-item-icon">🗑️</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Clear Recent Items</div>
                            <div class="list-item-subtitle">Remove all recently accessed</div>
                        </div>
                    </div>
                    
                    <div class="list-item" onclick="menuSystem.exportMenuSettings();">
                        <div class="list-item-icon">📤</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Export Settings</div>
                            <div class="list-item-subtitle">Save menu configuration</div>
                        </div>
                    </div>
                    
                    <div class="list-item" onclick="menuSystem.importMenuSettings();">
                        <div class="list-item-icon">📥</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Import Settings</div>
                            <div class="list-item-subtitle">Load menu configuration</div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div style="font-size: 15px; font-weight: 600; margin-bottom: 16px;">Statistics</div>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">${this.menuCustomization.pinnedItems.length}</div>
                            <div class="stat-label">Pinned Items</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${this.menuCustomization.hiddenItems.length}</div>
                            <div class="stat-label">Hidden Items</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    exportMenuSettings() {
        const settings = {
            menuCustomization: this.menuCustomization,
            recentlyAccessed: this.recentlyAccessed,
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'connecthub-menu-settings.json';
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('✓ Settings exported', 'success');
    }

    importMenuSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const settings = JSON.parse(event.target.result);
                    
                    if (settings.menuCustomization) {
                        this.menuCustomization = settings.menuCustomization;
                        this.saveMenuCustomization();
                    }
                    
                    if (settings.recentlyAccessed) {
                        this.recentlyAccessed = settings.recentlyAccessed;
                        localStorage.setItem('connecthub_recent_items', JSON.stringify(this.recentlyAccessed));
                    }
                    
                    this.renderMenu();
                    this.renderRecentlyAccessed();
                    this.showNotification('✓ Settings imported successfully', 'success');
                } catch (error) {
                    console.error('Error importing settings:', error);
                    this.showNotification('✗ Failed to import settings', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    // ==================== UTILITY METHODS ====================
    
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    }

    showNotification(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = 'toast show';
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    // ==================== INITIALIZATION ====================
    
    initializeMenu() {
        // Render initial menu
        this.renderMenu();
        this.renderRecentlyAccessed();
        this.renderBadges();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check for deep links on page load
        this.handleDeepLinkFromURL();
    }

    setupEventListeners() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.screen) {
                this.navigateToScreen(event.state.screen);
            }
        });
        
        // Refresh session on activity
        document.addEventListener('click', () => {
            this.refreshSession();
        });
    }
}

// Initialize menu system when DOM is ready
let menuSystem;
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        menuSystem = new MenuSystem();
        menuSystem.initializeMenu();
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuSystem;
}
