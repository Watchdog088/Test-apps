// ========================================
// CONNECTHUB MOBILE DESIGN - TRENDING SYSTEM
// Complete Trending Features Implementation
// ========================================

(function() {
    'use strict';

    // ========== TRENDING DATA & ALGORITHM ==========
    
    // Trending topics data
    const trendingTopicsData = [
        {
            id: 1,
            rank: 1,
            title: 'New AI Features Released',
            hashtag: '#AIFeatures',
            category: 'Technology',
            postCount: 45200,
            engagementRate: 8.5,
            trendingDuration: 180,
            location: 'San Francisco, CA',
            peakTime: '2:00 PM',
            relatedHashtags: ['#AI', '#Technology', '#Innovation', '#Tech2025'],
            trendingScore: 95.8,
            isFollowing: false,
            relatedPosts: [
                { id: 'tech-insider-1', author: 'Tech Insider', avatar: '👤', content: 'These new AI features are game-changing! 🚀', timestamp: '1 hour ago', likes: 2345, comments: 156 },
                { id: 'ai-expert-2', author: 'AI Expert', avatar: '🤖', content: 'Here\'s how the new AI tools can boost your productivity', timestamp: '2 hours ago', likes: 1890, comments: 234 },
                { id: 'developer-news-3', author: 'Developer News', avatar: '💻', content: 'Breaking: New AI features now available to all users!', timestamp: '3 hours ago', likes: 3456, comments: 445 }
            ]
        },
        {
            id: 2,
            rank: 2,
            title: 'Tech Conference 2025',
            hashtag: '#TechConf2025',
            category: 'Events',
            postCount: 32100,
            engagementRate: 7.2,
            trendingDuration: 60,
            location: 'New York, NY',
            peakTime: '10:00 AM',
            relatedHashtags: ['#Conference', '#Networking', '#Technology'],
            trendingScore: 88.3,
            isFollowing: false,
            relatedPosts: [
                { id: 'conference-1', author: 'Event Organizers', avatar: '🎪', content: 'Amazing keynote speakers lined up!', timestamp: '30 min ago', likes: 1567, comments: 89 }
            ]
        },
        {
            id: 3,
            rank: 3,
            title: 'Climate Action Summit',
            hashtag: '#ClimateAction',
            category: 'News',
            postCount: 28500,
            engagementRate: 6.8,
            trendingDuration: 300,
            location: 'Global',
            peakTime: '3:00 PM',
            relatedHashtags: ['#Climate', '#Environment', '#Sustainability'],
            trendingScore: 82.5,
            isFollowing: false,
            relatedPosts: []
        },
        {
            id: 4,
            rank: 4,
            title: 'Election 2025 Debates',
            hashtag: '#Election2025',
            category: 'Politics',
            postCount: 52300,
            engagementRate: 9.2,
            trendingDuration: 240,
            location: 'Global',
            peakTime: '8:00 PM',
            relatedHashtags: ['#Politics', '#Debates', '#Democracy', '#Vote2025'],
            trendingScore: 93.4,
            isFollowing: false,
            relatedPosts: [
                { id: 'political-analyst-1', author: 'Political Analyst', avatar: '🏛️', content: 'Key highlights from tonight\'s debate - policy positions explained', timestamp: '45 min ago', likes: 4521, comments: 678 },
                { id: 'news-network-2', author: 'News Network', avatar: '📺', content: 'Fact-checking the major claims from the debate', timestamp: '1 hour ago', likes: 3890, comments: 445 },
                { id: 'voter-voice-3', author: 'Voter Voice', avatar: '🗳️', content: 'Here\'s what voters are saying about the debate', timestamp: '2 hours ago', likes: 2567, comments: 234 }
            ]
        },
        {
            id: 5,
            rank: 5,
            title: 'Healthcare Reform Bill',
            hashtag: '#HealthcareReform',
            category: 'Politics',
            postCount: 38700,
            engagementRate: 7.8,
            trendingDuration: 420,
            location: 'New York, NY',
            peakTime: '1:00 PM',
            relatedHashtags: ['#Healthcare', '#Policy', '#Reform', '#PublicHealth'],
            trendingScore: 87.6,
            isFollowing: false,
            relatedPosts: [
                { id: 'health-expert-1', author: 'Healthcare Expert', avatar: '👨‍⚕️', content: 'Breaking down what the new healthcare bill means for you', timestamp: '3 hours ago', likes: 2890, comments: 312 },
                { id: 'policy-watch-2', author: 'Policy Watch', avatar: '📋', content: 'Timeline: How the healthcare reform will be implemented', timestamp: '4 hours ago', likes: 2134, comments: 189 }
            ]
        },
        {
            id: 6,
            rank: 6,
            title: 'Global Summit Updates',
            hashtag: '#GlobalSummit',
            category: 'Politics',
            postCount: 29400,
            engagementRate: 6.9,
            trendingDuration: 360,
            location: 'Global',
            peakTime: '11:00 AM',
            relatedHashtags: ['#InternationalRelations', '#Diplomacy', '#WorldLeaders'],
            trendingScore: 81.3,
            isFollowing: false,
            relatedPosts: [
                { id: 'diplomat-1', author: 'International Affairs', avatar: '🌐', content: 'Major agreements reached at the global summit', timestamp: '5 hours ago', likes: 1876, comments: 156 },
                { id: 'world-news-2', author: 'World News', avatar: '📰', content: 'What the summit outcomes mean for global cooperation', timestamp: '6 hours ago', likes: 1543, comments: 98 }
            ]
        }
    ];

    const trendingCategories = [
        { id: 'all', name: 'All', emoji: '🔥' },
        { id: 'technology', name: 'Technology', emoji: '💻' },
        { id: 'entertainment', name: 'Entertainment', emoji: '🎬' },
        { id: 'sports', name: 'Sports', emoji: '⚽' },
        { id: 'news', name: 'News', emoji: '📰' },
        { id: 'politics', name: 'Politics', emoji: '🏛️' },
        { id: 'events', name: 'Events', emoji: '📅' },
        { id: 'gaming', name: 'Gaming', emoji: '🎮' },
        { id: 'science', name: 'Science', emoji: '🔬' }
    ];

    let currentTrendingFilter = 'all';
    let currentLocationFilter = 'all';
    let followedTopics = new Set();
    let trendingNotifications = new Set();

    // ========== UTILITY FUNCTIONS ==========
    
    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    function formatDuration(minutes) {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            return hours + (hours === 1 ? ' hour' : ' hours');
        }
        return minutes + (minutes === 1 ? ' minute' : ' minutes');
    }

    // ========== TRENDING UI RENDERING ==========
    
    function renderTrendingCards(filter = 'all', locationFilter = 'all') {
        let filteredTopics = [...trendingTopicsData];
        
        if (filter !== 'all') {
            filteredTopics = filteredTopics.filter(topic => 
                topic.category.toLowerCase() === filter.toLowerCase()
            );
        }
        
        if (locationFilter !== 'all') {
            filteredTopics = filteredTopics.filter(topic => 
                topic.location.includes(locationFilter) || topic.location === 'Global'
            );
        }
        
        const trendingScreen = document.getElementById('trending-screen');
        if (!trendingScreen) return;
        
        let container = trendingScreen.querySelector('.trending-cards-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'trending-cards-container';
            container.style.marginTop = '16px';
            
            const header = trendingScreen.querySelector('.section-header');
            if (header) {
                const filters = trendingScreen.querySelector('.trending-filters');
                if (filters) {
                    filters.after(container);
                } else {
                    header.after(container);
                }
            }
        }
        
        container.innerHTML = filteredTopics.map(topic => `
            <div class="trending-card" onclick="window.trendingSystem.openTrendingDetails(${topic.id})" style="cursor: pointer; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div class="trending-tag">#${topic.rank} TRENDING</div>
                    <button class="nav-btn" onclick="event.stopPropagation(); window.trendingSystem.toggleFollowTopic(${topic.id})" style="width: 32px; height: 32px;">
                        ${followedTopics.has(topic.id) ? '⭐' : '☆'}
                    </button>
                </div>
                <div class="trending-title">${topic.title}</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
                    ${topic.hashtag} • ${topic.category}
                </div>
                <div class="trending-stats">${formatNumber(topic.postCount)} posts • Trending for ${formatDuration(topic.trendingDuration)}</div>
                <div class="post-actions" style="border-top: 1px solid var(--glass-border); margin-top: 12px;">
                    <div class="post-action" onclick="event.stopPropagation(); window.trendingSystem.likeTrendingTopic(${topic.id}, this)">
                        <span>👍</span> Like
                    </div>
                    <div class="post-action" onclick="event.stopPropagation(); window.trendingSystem.commentOnTrending(${topic.id})">
                        <span>💬</span> Comment
                    </div>
                    <div class="post-action" onclick="event.stopPropagation(); window.trendingSystem.shareTrendingTopic(${topic.id})">
                        <span>🔄</span> Share
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderTrendingFilters() {
        const trendingScreen = document.getElementById('trending-screen');
        if (!trendingScreen) return;
        
        const header = trendingScreen.querySelector('.section-header');
        if (!header) return;
        
        let filtersContainer = trendingScreen.querySelector('.trending-filters');
        if (!filtersContainer) {
            filtersContainer = document.createElement('div');
            filtersContainer.className = 'trending-filters';
            header.after(filtersContainer);
        }
        
        filtersContainer.innerHTML = `
            <div style="display: flex; gap: 8px; overflow-x: auto; padding: 12px 0;">
                ${trendingCategories.map(cat => `
                    <div class="pill-nav-button ${cat.id === currentTrendingFilter ? 'active' : ''}" 
                         onclick="window.trendingSystem.filterByCategory('${cat.id}')"
                         style="flex-shrink: 0;">
                        ${cat.emoji} ${cat.name}
                    </div>
                `).join('')}
            </div>
            <div style="display: flex; gap: 8px; padding: 12px 0;">
                <button class="btn" style="width: auto; padding: 10px 16px; font-size: 13px;" onclick="window.trendingSystem.openLocationFilter()">
                    📍 ${currentLocationFilter === 'all' ? 'All Locations' : currentLocationFilter}
                </button>
                <button class="btn" style="width: auto; padding: 10px 16px; font-size: 13px;" onclick="window.trendingSystem.openPersonalizationSettings()">
                    ⚙️ Personalize
                </button>
                <button class="btn" style="width: auto; padding: 10px 16px; font-size: 13px;" onclick="window.trendingSystem.refreshTrending()">
                    🔄 Refresh
                </button>
            </div>
        `;
    }

    function filterByCategory(category) {
        currentTrendingFilter = category;
        renderTrendingFilters();
        renderTrendingCards(category, currentLocationFilter);
        
        const categoryName = trendingCategories.find(c => c.id === category)?.name || 'All';
        if (typeof showToast === 'function') {
            showToast(`Showing: ${categoryName}`);
        }
    }

    function openLocationFilter() {
        const modalHTML = `
            <div id="trendingLocationFilterModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="window.trendingSystem.closeLocationFilter()">✕</div>
                    <div class="modal-title">📍 Location Filter</div>
                </div>
                <div class="modal-content">
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="font-size: 64px;">📍</div>
                        <div style="font-size: 18px; font-weight: 600; margin: 16px 0;">Filter by Location</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">See what's trending near you</div>
                    </div>
                    
                    <div class="list-item" onclick="window.trendingSystem.selectLocationFilter('all')">
                        <div class="list-item-icon">🌍</div>
                        <div class="list-item-content">
                            <div class="list-item-title">All Locations</div>
                            <div class="list-item-subtitle">Global trending</div>
                        </div>
                    </div>
                    
                    <div class="list-item" onclick="window.trendingSystem.selectLocationFilter('San Francisco, CA')">
                        <div class="list-item-icon">🌉</div>
                        <div class="list-item-content">
                            <div class="list-item-title">San Francisco, CA</div>
                        </div>
                    </div>
                    
                    <div class="list-item" onclick="window.trendingSystem.selectLocationFilter('New York, NY')">
                        <div class="list-item-icon">🗽</div>
                        <div class="list-item-content">
                            <div class="list-item-title">New York, NY</div>
                        </div>
                    </div>
                    
                    <div class="list-item" onclick="window.trendingSystem.selectLocationFilter('Los Angeles, CA')">
                        <div class="list-item-icon">🎬</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Los Angeles, CA</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    function closeLocationFilter() {
        const modal = document.getElementById('trendingLocationFilterModal');
        if (modal) modal.remove();
    }

    function selectLocationFilter(location) {
        currentLocationFilter = location;
        closeLocationFilter();
        renderTrendingFilters();
        renderTrendingCards(currentTrendingFilter, location);
        
        if (typeof showToast === 'function') {
            showToast(`📍 Location: ${location}`);
        }
    }

    function openPersonalizationSettings() {
        const modalHTML = `
            <div id="trendingPersonalizationModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="window.trendingSystem.closePersonalizationSettings()">✕</div>
                    <div class="modal-title">⚙️ Personalization</div>
                </div>
                <div class="modal-content">
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="font-size: 64px;">⚙️</div>
                        <div style="font-size: 18px; font-weight: 600; margin: 16px 0;">Customize Trending</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Tailor topics to your interests</div>
                    </div>
                    
                    <div class="toggle-container">
                        <div>
                            <div class="list-item-title">Personalized Trending</div>
                            <div class="list-item-subtitle">Topics based on your interests</div>
                        </div>
                        <div class="toggle-switch active" onclick="window.trendingSystem.togglePersonalization(this)">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    
                    <div class="toggle-container">
                        <div>
                            <div class="list-item-title">Auto-Refresh</div>
                            <div class="list-item-subtitle">Update every 5 minutes</div>
                        </div>
                        <div class="toggle-switch active" onclick="window.trendingSystem.toggleAutoRefresh(this)">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    
                    <button class="btn" onclick="window.trendingSystem.savePersonalizationSettings()">
                        Save Settings
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    function closePersonalizationSettings() {
        const modal = document.getElementById('trendingPersonalizationModal');
        if (modal) modal.remove();
    }

    function savePersonalizationSettings() {
        closePersonalizationSettings();
        if (typeof showToast === 'function') {
            showToast('Settings saved! ⚙️');
        }
        renderTrendingCards(currentTrendingFilter, currentLocationFilter);
    }

    function togglePersonalization(toggle) {
        if (typeof toggleSwitch === 'function') {
            toggleSwitch(toggle);
        }
        
        const isEnabled = toggle.classList.contains('active');
        if (typeof showToast === 'function') {
            showToast(isEnabled ? 'Personalization enabled' : 'Personalization disabled');
        }
    }

    // ========== TRENDING DETAILS ==========
    
    function openTrendingDetails(topicId) {
        const topic = trendingTopicsData.find(t => t.id === topicId);
        if (!topic) return;

        const modalHTML = `
            <div id="trendingDetailsFullModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="window.trendingSystem.closeTrendingDetails()">✕</div>
                    <div class="modal-title">Trending Details</div>
                </div>
                <div class="modal-content">
                    <div class="trending-tag">#${topic.rank} TRENDING</div>
                    <div class="section-title" style="margin: 12px 0;">${topic.title}</div>
                    <div class="post-meta" style="margin-bottom: 12px;">${topic.hashtag} • ${topic.category}</div>
                    <div class="post-meta" style="margin-bottom: 20px;">${formatNumber(topic.postCount)} posts • Trending for ${formatDuration(topic.trendingDuration)}</div>
                    
                    <div class="stats-grid" style="margin-bottom: 20px;">
                        <div class="stat-card">
                            <div class="stat-value">${formatNumber(topic.postCount)}</div>
                            <div class="stat-label">Total Posts</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${topic.engagementRate}%</div>
                            <div class="stat-label">Engagement</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${topic.peakTime}</div>
                            <div class="stat-label">Peak Time</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${topic.trendingScore.toFixed(1)}%</div>
                            <div class="stat-label">Trend Score</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                        <button class="btn" onclick="window.trendingSystem.toggleFollowTopic(${topic.id})">
                            ${followedTopics.has(topic.id) ? '⭐ Following' : '☆ Follow Topic'}
                        </button>
                        <button class="btn" style="background: var(--glass);" onclick="window.trendingSystem.toggleTopicNotifications(${topic.id})">
                            ${trendingNotifications.has(topic.id) ? '🔔 Notifications On' : '🔕 Notify Me'}
                        </button>
                    </div>
                    
                    <div class="section-header">
                        <div class="section-title">Related Hashtags</div>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
                        ${topic.relatedHashtags.map(tag => `
                            <div class="interest-tag" onclick="window.trendingSystem.exploreHashtag('${tag}')">${tag}</div>
                        `).join('')}
                    </div>
                    
                    <div class="section-header">
                        <div class="section-title">Related Posts</div>
                        <div class="section-link">${topic.relatedPosts.length} posts</div>
                    </div>
                    
                    ${topic.relatedPosts.map(post => `
                        <div class="post-card" onclick="window.trendingSystem.openRelatedPost('${post.id}')" style="cursor: pointer; margin-bottom: 12px;">
                            <div class="post-header">
                                <div class="post-avatar">${post.avatar}</div>
                                <div class="post-header-info">
                                    <div class="post-author">${post.author}</div>
                                    <div class="post-meta">${post.timestamp}</div>
                                </div>
                            </div>
                            <div class="post-content">${post.content}</div>
                            <div style="display: flex; gap: 16px; margin-top: 12px; font-size: 13px; color: var(--text-secondary);">
                                <span>👍 ${formatNumber(post.likes)}</span>
                                <span>💬 ${formatNumber(post.comments)}</span>
                            </div>
                        </div>
                    `).join('')}
                    
                    <button class="btn" style="background: var(--glass); margin-top: 16px;" onclick="window.trendingSystem.loadMoreRelatedPosts(${topic.id})">
                        Load More Posts
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    function closeTrendingDetails() {
        const modal = document.getElementById('trendingDetailsFullModal');
        if (modal) modal.remove();
    }

    // ========== TRENDING ACTIONS ==========
    
    function toggleFollowTopic(topicId) {
        const topic = trendingTopicsData.find(t => t.id === topicId);
        if (!topic) return;
        
        if (followedTopics.has(topicId)) {
            followedTopics.delete(topicId);
            if (typeof showToast === 'function') {
                showToast(`Unfollowed ${topic.title}`);
            }
        } else {
            followedTopics.add(topicId);
            if (typeof showToast === 'function') {
                showToast(`Following ${topic.title} ⭐`);
            }
        }
        
        renderTrendingCards(currentTrendingFilter, currentLocationFilter);
    }

    function toggleTopicNotifications(topicId) {
        const topic = trendingTopicsData.find(t => t.id === topicId);
        if (!topic) return;
        
        if (trendingNotifications.has(topicId)) {
            trendingNotifications.delete(topicId);
            if (typeof showToast === 'function') {
                showToast('Notifications disabled');
            }
        } else {
            trendingNotifications.add(topicId);
            if (typeof showToast === 'function') {
                showToast(`🔔 You'll be notified about ${topic.title}`);
            }
        }
        
        closeTrendingDetails();
        setTimeout(() => openTrendingDetails(topicId), 100);
    }

    function likeTrendingTopic(topicId, element) {
        if (element) {
            element.classList.toggle('active');
            const icon = element.querySelector('span');
            if (element.classList.contains('active')) {
                icon.textContent = '❤️';
                if (typeof showToast === 'function') {
                    showToast('Liked!');
                }
            } else {
                icon.textContent = '👍';
            }
        }
    }

    function commentOnTrending(topicId) {
        if (typeof openModal === 'function') {
            openModal('comments');
        }
    }

    function shareTrendingTopic(topicId) {
        const topic = trendingTopicsData.find(t => t.id === topicId);
        if (topic && typeof showToast === 'function') {
            showToast(`Shared ${topic.title}!`);
        }
    }

    function exploreHashtag(hashtag) {
        if (typeof showToast === 'function') {
            showToast(`Exploring ${hashtag}...`);
        }
    }

    function openRelatedPost(postId) {
        closeTrendingDetails();
        if (typeof showToast === 'function') {
            showToast('Opening post...');
        }
        setTimeout(() => {
            if (typeof openScreen === 'function') {
                openScreen('feed');
            }
        }, 300);
    }

    function loadMoreRelatedPosts(topicId) {
        if (typeof showToast === 'function') {
            showToast('Loading more posts... 📱');
        }
    }

    // ========== REFRESH MECHANISM ==========
    
    function refreshTrending() {
        if (typeof showToast === 'function') {
            showToast('Refreshing trending... 🔄');
        }
        
        setTimeout(() => {
            renderTrendingCards(currentTrendingFilter, currentLocationFilter);
            if (typeof showToast === 'function') {
                showToast('Trending updated! ✓');
            }
        }, 1000);
    }

    function toggleAutoRefresh(toggle) {
        if (typeof toggleSwitch === 'function') {
            toggleSwitch(toggle);
        }
        
        const isEnabled = toggle.classList.contains('active');
        if (typeof showToast === 'function') {
            showToast(isEnabled ? 'Auto-refresh enabled (every 5 min)' : 'Auto-refresh disabled');
        }
    }

    // ========== INITIALIZATION ==========
    
    function initializeTrendingSystem() {
        renderTrendingFilters();
        renderTrendingCards();
        console.log('✓ Trending System initialized');
    }

    // ========== PUBLIC API ==========
    
    window.trendingSystem = {
        initialize: initializeTrendingSystem,
        filterByCategory: filterByCategory,
        openLocationFilter: openLocationFilter,
        closeLocationFilter: closeLocationFilter,
        selectLocationFilter: selectLocationFilter,
        openPersonalizationSettings: openPersonalizationSettings,
        closePersonalizationSettings: closePersonalizationSettings,
        savePersonalizationSettings: savePersonalizationSettings,
        togglePersonalization: togglePersonalization,
        toggleAutoRefresh: toggleAutoRefresh,
        refreshTrending: refreshTrending,
        openTrendingDetails: openTrendingDetails,
        closeTrendingDetails: closeTrendingDetails,
        toggleFollowTopic: toggleFollowTopic,
        toggleTopicNotifications: toggleTopicNotifications,
        likeTrendingTopic: likeTrendingTopic,
        commentOnTrending: commentOnTrending,
        shareTrendingTopic: shareTrendingTopic,
        exploreHashtag: exploreHashtag,
        openRelatedPost: openRelatedPost,
        loadMoreRelatedPosts: loadMoreRelatedPosts
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTrendingSystem);
    } else {
        initializeTrendingSystem();
    }

})();

console.log('✓ ConnectHub Trending System loaded');
