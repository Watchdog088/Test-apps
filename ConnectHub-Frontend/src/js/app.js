// Global state management
let currentCategory = null;
let currentScreen = 'home';
let isLoggedIn = false;
let isPlaying = false;
let currentTrackIndex = 0;
let gameStates = {};
let notificationCount = 3;
let isShuffleEnabled = false;
let isRepeatEnabled = false;
let isStreamLive = false;
let streamDuration = 0;
let viewerCount = 0;

// Initialize UI component instances
let profileUIComponents = null;
let searchUIComponents = null;
let groupsUIComponents = null;
let eventsUIComponents = null;
let advancedSearchResultsUI = null;
let searchDiscoveryStreamingComponents = null;

// Sample data arrays
const samplePosts = [
    {
        id: 1,
        user: 'ConnectHub AI',
        avatar: 'AI',
        time: '2 hours ago',
        content: 'Welcome to ConnectHub! 🚀 Your all-in-one social platform with AI-powered matching, live streaming, and smart content curation. Ready to connect? #ConnectHub #Social',
        likes: 124,
        comments: 23,
        shares: 12,
        image: true
    },
    {
        id: 2,
        user: 'Emma Wilson',
        avatar: 'EW',
        time: '4 hours ago',
        content: 'Just had an amazing coffee at the new café downtown! ☕ The atmosphere is perfect for remote work. Anyone want to join me tomorrow?',
        likes: 45,
        comments: 8,
        shares: 3
    },
    {
        id: 3,
        user: 'Tech News',
        avatar: 'TN',
        time: '6 hours ago',
        content: 'Breaking: New AI breakthrough in natural language processing! This could revolutionize how we interact with technology. What do you think? 🤖',
        likes: 234,
        comments: 67,
        shares: 89
    },
    {
        id: 4,
        user: 'Mike Johnson',
        avatar: 'MJ',
        time: '8 hours ago',
        content: 'Beautiful sunset from my hiking trip today! Nature never fails to amaze me. 🌅 #nature #hiking #photography',
        likes: 156,
        comments: 23,
        shares: 15
    }
];

const sampleUsers = [
    { name: 'Emma Wilson', avatar: 'EW', status: 'online', mutualFriends: 2, profession: 'Software Developer' },
    { name: 'Mike Johnson', avatar: 'MJ', status: 'offline', mutualFriends: 5, profession: 'Photographer' },
    { name: 'Sarah Miller', avatar: 'SM', status: 'online', mutualFriends: 3, profession: 'Designer' },
    { name: 'Alex Chen', avatar: 'AC', status: 'away', mutualFriends: 1, profession: 'Data Scientist' },
    { name: 'Lisa Garcia', avatar: 'LG', status: 'online', mutualFriends: 4, profession: 'Marketing Manager' },
    { name: 'David Brown', avatar: 'DB', status: 'offline', mutualFriends: 2, profession: 'Engineer' }
];

const sampleTracks = [
    { title: 'Digital Dreams', artist: 'ElectroWave', album: 'Future Sounds' },
    { title: 'Neon Nights', artist: 'SynthMaster', album: 'City Lights' },
    { title: 'Code Symphony', artist: 'TechBeats', album: 'Binary Rhythms' },
    { title: 'Virtual Reality', artist: 'CyberTunes', album: 'Digital Age' },
    { title: 'AI Love Song', artist: 'RoboRomance', album: 'Machine Hearts' }
];

const sampleMatches = [
    { name: 'Sarah Miller', avatar: 'SM', age: 26, distance: '2 miles', match: 95, interests: ['Coffee', 'Travel', 'Photography'], bio: 'Love exploring new places and trying different cuisines!' },
    { name: 'Emma Wilson', avatar: 'EW', age: 24, distance: '5 miles', match: 89, interests: ['Music', 'Art', 'Hiking'], bio: 'Artist by day, music lover by night 🎨🎵' },
    { name: 'Lisa Garcia', avatar: 'LG', age: 28, distance: '3 miles', match: 92, interests: ['Fitness', 'Cooking', 'Books'], bio: 'Fitness enthusiast and book worm. Balance is key!' },
    { name: 'Anna Kim', avatar: 'AK', age: 25, distance: '4 miles', match: 87, interests: ['Tech', 'Gaming', 'Movies'], bio: 'Software developer who loves sci-fi and gaming 🎮' }
];

const sampleMarketplaceItems = [
    { id: 1, title: 'iPhone 15 Pro', price: 899, condition: 'Like new', seller: 'TechStore', image: '📱', category: 'electronics', description: 'Latest iPhone in excellent condition' },
    { id: 2, title: 'MacBook Air M2', price: 1299, condition: 'Excellent', seller: 'AppleDeals', image: '💻', category: 'electronics', description: 'Powerful laptop for work and creativity' },
    { id: 3, title: 'Gaming Chair', price: 299, condition: 'Good', seller: 'FurnitureHub', image: '🪑', category: 'home', description: 'Comfortable ergonomic gaming chair' },
    { id: 4, title: 'Sneakers', price: 150, condition: 'New', seller: 'ShoeLover', image: '👟', category: 'fashion', description: 'Limited edition designer sneakers' },
    { id: 5, title: 'Camera Lens', price: 450, condition: 'Excellent', seller: 'PhotoPro', image: '📷', category: 'electronics', description: 'Professional 50mm lens' },
    { id: 6, title: 'Cookbook', price: 25, condition: 'Good', seller: 'BookWorm', image: '📚', category: 'books', description: 'Delicious recipes from around the world' }
];

// Category and screen mappings
const categoryScreens = {
    social: ['home', 'messages', 'profile', 'groups', 'events', 'stories', 'explore', 'search', 'settings'],
    dating: ['swipe', 'matches', 'preferences', 'chat'],
    media: ['music', 'live', 'video', 'ar'],
    extra: ['games', 'marketplace', 'business', 'wallet', 'analytics', 'help']
};

const subNavItems = {
    social: [
        { id: 'home', label: '🏠 Home', icon: '🏠' },
        { id: 'messages', label: '💬 Messages', icon: '💬' },
        { id: 'profile', label: '👤 Profile', icon: '👤' },
        { id: 'groups', label: '👥 Groups', icon: '👥' },
        { id: 'events', label: '📅 Events', icon: '📅' },
        { id: 'stories', label: '📱 Stories', icon: '📱' },
        { id: 'explore', label: '🌟 Explore', icon: '🌟' },
        { id: 'search', label: '🔍 Search', icon: '🔍' },
        { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
    ],
    dating: [
        { id: 'swipe', label: '💕 Discover', icon: '💕' },
        { id: 'matches', label: '💬 Matches', icon: '💬' },
        { id: 'preferences', label: '⚙️ Preferences', icon: '⚙️' },
        { id: 'chat', label: '💭 Dating Chat', icon: '💭' }
    ],
    media: [
        { id: 'music', label: '🎵 Music', icon: '🎵' },
        { id: 'live', label: '📺 Live Stream', icon: '📺' },
        { id: 'video', label: '📹 Video Calls', icon: '📹' },
        { id: 'ar', label: '🥽 AR/VR', icon: '🥽' }
    ],
    extra: [
        { id: 'games', label: '🎮 Games', icon: '🎮' },
        { id: 'marketplace', label: '🛒 Shop', icon: '🛒' },
        { id: 'business', label: '💼 Business', icon: '💼' },
        { id: 'wallet', label: '💰 Wallet', icon: '💰' },
        { id: 'analytics', label: '📊 Analytics', icon: '📊' },
        { id: 'help', label: '❓ Help', icon: '❓' }
    ]
};

// Utility functions
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `${icons[type]} ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

function handleKeyPress(event, callback) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        callback();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

// Navigation functions
function updateMainNav() {
    const mainNav = document.getElementById('mainNav');
    if (!mainNav) return;
    
    if (!isLoggedIn) {
        mainNav.innerHTML = '';
        return;
    }

    const navItems = [
        { id: 'home', label: '🏠 Home', action: 'goHome()' },
        { id: 'search', label: '🔍 Search', action: "switchToScreen('social', 'search')" }
    ];

    const categoryTabs = `
        <div class="category-nav">
            <div class="category-tab ${currentCategory === 'social' ? 'active' : ''}" data-category="social" onclick="switchCategory('social')" role="button" tabindex="0">
                📱 Social
            </div>
            <div class="category-tab ${currentCategory === 'dating' ? 'active' : ''}" data-category="dating" onclick="switchCategory('dating')" role="button" tabindex="0">
                💕 Dating
            </div>
            <div class="category-tab ${currentCategory === 'media' ? 'active' : ''}" data-category="media" onclick="switchCategory('media')" role="button" tabindex="0">
                🎵 Media
            </div>
            <div class="category-tab ${currentCategory === 'extra' ? 'active' : ''}" data-category="extra" onclick="switchCategory('extra')" role="button" tabindex="0">
                🎮 Extra
            </div>
        </div>
    `;

    const notificationBtn = `
        <div class="nav-item" onclick="toggleNotifications()" role="button" tabindex="0" aria-label="Notifications">
            🔔 Notifications
            ${notificationCount > 0 ? '<div class="notification-dot"></div>' : ''}
        </div>
    `;

    mainNav.innerHTML = navItems.map(item => 
        `<div class="nav-item" onclick="${item.action}" role="button" tabindex="0">${item.label}</div>`
    ).join('') + categoryTabs + notificationBtn;
}

function updateSubNav() {
    const subNavContainer = document.getElementById('subNavContainer');
    if (!subNavContainer) return;

    if (!isLoggedIn || !currentCategory) {
        subNavContainer.style.display = 'none';
        return;
    }

    subNavContainer.style.display = 'block';
    const subNav = document.getElementById('subNav');
    if (!subNav) return;
    
    const items = subNavItems[currentCategory] || [];
    
    subNav.innerHTML = items.map(item => `
        <div class="sub-nav-item ${item.id === currentScreen ? 'active' : ''}" 
             onclick="switchToScreen('${currentCategory}', '${item.id}')" role="button" tabindex="0">
            ${item.label}
        </div>
    `).join('');
}

function goHome() {
    if (isLoggedIn) {
        const categorySelection = document.getElementById('categorySelection');
        if (categorySelection) {
            categorySelection.classList.add('active');
            document.querySelectorAll('.category-section').forEach(section => {
                if (section.id !== 'categorySelection') {
                    section.classList.remove('active');
                }
            });
        }
        currentCategory = null;
        updateMainNav();
        updateSubNav();
    } else {
        location.reload();
    }
}

function selectCategory(category) {
    if (!isLoggedIn) {
        showToast('Please sign in to access this feature', 'warning');
        return;
    }
    switchCategory(category);
}

function switchCategory(category) {
    if (!isLoggedIn) {
        showToast('Please sign in to access this feature', 'warning');
        return;
    }

    currentCategory = category;
    currentScreen = categoryScreens[category][0];

    // Hide all category sections
    document.querySelectorAll('.category-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected category
    const categorySection = document.getElementById(`${category}Category`);
    if (categorySection) {
        categorySection.classList.add('active');
        loadCategoryContent(category);
    }
    
    updateMainNav();
    updateSubNav();
}

function switchToScreen(category, screen) {
    if (!isLoggedIn) {
        showToast('Please sign in first', 'warning');
        return;
    }

    if (category !== currentCategory) {
        switchCategory(category);
        return;
    }

    currentScreen = screen;
    loadScreenContent(category, screen);
    updateSubNav();
}

// Content loading functions
function loadCategoryContent(category) {
    const categoryElement = document.getElementById(`${category}Category`);
    if (categoryElement) {
        categoryElement.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const defaultScreen = document.getElementById(`${category}${categoryScreens[category][0].charAt(0).toUpperCase() + categoryScreens[category][0].slice(1)}`);
        if (defaultScreen) {
            defaultScreen.classList.add('active');
        }
    }

    switch(category) {
        case 'social':
            populateSocialHome();
            break;
        case 'dating':
            loadDatingCard();
            break;
        case 'media':
            initializeMusic();
            break;
        case 'extra':
            break;
    }
}

function loadScreenContent(category, screen) {
    const categoryElement = document.getElementById(`${category}Category`);
    if (categoryElement) {
        categoryElement.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(`${category}${screen.charAt(0).toUpperCase() + screen.slice(1)}`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            initializeScreenContent(category, screen);
        }
    }
}

function initializeScreenContent(category, screen) {
    const screenKey = `${category}-${screen}`;
    
    switch(screenKey) {
        case 'social-home':
            populateSocialHome();
            break;
        case 'social-messages':
            populateConversations();
            break;
        case 'social-profile':
            populateProfileScreen();
            break;
        case 'social-search':
            populateSearchDefaults();
            break;
        case 'social-groups':
            populateGroups();
            break;
        case 'social-events':
            populateEvents();
            break;
        case 'social-stories':
            populateStories();
            break;
        case 'dating-swipe':
            loadDatingCard();
            break;
        case 'dating-matches':
            populateMatches();
            break;
        case 'dating-chat':
            populateDatingChat();
            break;
        case 'dating-preferences':
            populateDatingPreferences();
            break;
        case 'media-music':
            initializeMusic();
            break;
        case 'media-video':
            populateVideoCallData();
            break;
        case 'extra-marketplace':
            populateMarketplace();
            break;
        case 'extra-wallet':
            populateWalletTransactions();
            break;
    }
}

// Social Media Functions
function populateSocialHome() {
    const postsContainer = document.getElementById('postsContainer');
    const suggestedFriends = document.getElementById('suggestedFriends');
    const activeUsers = document.getElementById('activeUsers');

    if (postsContainer) {
        postsContainer.innerHTML = samplePosts.map(post => `
            <article style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem; transition: all 0.3s ease;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <div style="width: 45px; height: 45px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); display: flex; align-items: center; justify-content: center; font-weight: 600; color: white;" aria-label="User avatar">${post.avatar}</div>
                    <div>
                        <h4>${post.user}</h4>
                        <div style="color: var(--text-muted); font-size: 0.9rem;">${post.time}</div>
                    </div>
                </div>
                <div style="margin-bottom: 1rem; line-height: 1.6;">${post.content}</div>
                ${post.image ? `<div style="width: 100%; height: 300px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 12px; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; font-size: 3rem; cursor: pointer;" role="img" aria-label="Post image">🌟</div>` : ''}
                <div style="display: flex; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--glass-border);">
                    <button class="btn btn-secondary btn-small" onclick="toggleLike(this, ${post.id})" aria-label="Like post">❤️ <span>${post.likes}</span></button>
                    <button class="btn btn-secondary btn-small" onclick="showComments(${post.id})" aria-label="View comments">💬 <span>${post.comments}</span></button>
                    <button class="btn btn-secondary btn-small" onclick="sharePost(${post.id})" aria-label="Share post">🔄 <span>${post.shares}</span></button>
                    <button class="btn btn-secondary btn-small" onclick="sharePost(${post.id})">📤 Share</button>
                </div>
            </article>
        `).join('');
    }

    if (suggestedFriends) {
        suggestedFriends.innerHTML = sampleUsers.slice(0, 3).map(user => `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--glass-border);">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); display: flex; align-items: center; justify-content: center; font-weight: 600; color: white; font-size: 0.9rem;" aria-label="User avatar">${user.avatar}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 0.9rem;">${user.name}</div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">${user.mutualFriends} mutual friends</div>
                </div>
                <button class="btn btn-primary btn-small" onclick="addFriend('${user.name}')">Add</button>
            </div>
        `).join('');
    }

    if (activeUsers) {
        activeUsers.innerHTML = sampleUsers.filter(user => user.status === 'online').map(user => `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 0.5rem 0;">
                <div style="position: relative;">
                    <div style="width: 35px; height: 35px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); display: flex; align-items: center; justify-content: center; font-weight: 600; color: white; font-size: 0.8rem;" aria-label="User avatar">${user.avatar}</div>
                    <div style="position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; background: var(--success); border-radius: 50%; border: 2px solid var(--bg-card);" aria-label="Online status"></div>
                </div>
                <div style="font-size: 0.9rem;">${user.name}</div>
            </div>
        `).join('');
    }
}

function populateConversations() {
    const conversationsList = document.getElementById('conversationsList');
    const sampleConversations = [
        { user: 'Sarah Miller', avatar: 'SM', lastMessage: 'Hey! How was your day? 😊', time: '2m', unread: true },
        { user: 'Emma Wilson', avatar: 'EW', lastMessage: 'Thanks for the coffee recommendation!', time: '1h', unread: false },
        { user: 'Mike Johnson', avatar: 'MJ', lastMessage: 'Are we still on for tomorrow?', time: '3h', unread: false },
        { user: 'Alex Chen', avatar: 'AC', lastMessage: 'Check out this cool project!', time: '1d', unread: false }
    ];
    
    if (conversationsList) {
        conversationsList.innerHTML = sampleConversations.map(conv => `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; cursor: pointer; transition: all 0.3s ease; ${conv.unread ? 'background: var(--glass);' : ''}" onclick="openChat('${conv.user}', '${conv.avatar}')" role="button" tabindex="0">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); display: flex; align-items: center; justify-content: center; font-weight: 600; color: white;" aria-label="User avatar">${conv.avatar}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${conv.user}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">${conv.lastMessage}</div>
                </div>
                <div style="color: var(--text-muted); font-size: 0.8rem;">${conv.time}</div>
                ${conv.unread ? '<div style="width: 8px; height: 8px; background: var(--primary); border-radius: 50%;" aria-label="Unread message"></div>' : ''}
            </div>
        `).join('');
    }
}

function populateProfileScreen() {
    const profileContainer = document.getElementById('socialProfile');
    
    if (profileContainer) {
        profileContainer.innerHTML = `
            <div style="background: var(--bg-card); border-radius: 20px; padding: 2rem; margin-bottom: 2rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white;">JD</div>
                    <h2>John Doe</h2>
                    <p style="color: var(--text-secondary);">Software Developer • ConnectHub Member</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                    <div style="background: var(--glass); padding: 1.5rem; border-radius: 12px;">
                        <h3 style="color: var(--primary); margin-bottom: 1rem;">🎨 Profile Tools (10 interfaces)</h3>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <button class="btn btn-primary btn-small" onclick="showAdvancedProfileEditor()">✏️ Advanced Profile Editor</button>
                            <button class="btn btn-primary btn-small" onclick="showPhotoEditor()">📷 Photo Editor & Filters</button>
                            <button class="btn btn-primary btn-small" onclick="showPrivacyControlPanel()">🔒 Privacy Control Panel</button>
                            <button class="btn btn-primary btn-small" onclick="showAchievementsGallery()">🏆 Achievements Gallery</button>
                            <button class="btn btn-primary btn-small" onclick="showConnectionsManager()">👥 Connections Manager</button>
                        </div>
                    </div>
                    
                    <div style="background: var(--glass); padding: 1.5rem; border-radius: 12px;">
                        <h3 style="color: var(--primary); margin-bottom: 1rem;">🔍 Search Tools (5 interfaces)</h3>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <button class="btn btn-secondary btn-small" onclick="showAdvancedSearchFilters()">🎯 Advanced Search Filters</button>
                            <button class="btn btn-secondary btn-small" onclick="showSearchResultsCustomizer()">⚙️ Search Results Customizer</button>
                            <button class="btn btn-secondary btn-small" onclick="showSavedSearchesManager()">💾 Saved Searches Manager</button>
                            <button class="btn btn-secondary btn-small" onclick="showSearchHistoryViewer()">📜 Search History Viewer</button>
                            <button class="btn btn-secondary btn-small" onclick="showRealTimeSearchSuggestions()">⚡ Real-time Search Suggestions</button>
                        </div>
                    </div>
                    
                    <div style="background: var(--glass); padding: 1.5rem; border-radius: 12px;">
                        <h3 style="color: var(--primary); margin-bottom: 1rem;">👥 Groups Tools (7 interfaces)</h3>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <button class="btn btn-success btn-small" onclick="showGroupCreationWizard()">🔧 Group Creation Wizard</button>
                            <button class="btn btn-success btn-small" onclick="showGroupMembersManager()">👥 Group Members Manager</button>
                            <button class="btn btn-success btn-small" onclick="showGroupDiscussionBoard()">💬 Group Discussion Board</button>
                            <button class="btn btn-success btn-small" onclick="showGroupEventsCalendar()">📅 Group Events Calendar</button>
                            <button class="btn btn-success btn-small" onclick="showGroupSettingsPanel()">⚙️ Group Settings Panel</button>
                            <button class="btn btn-success btn-small" onclick="showGroupAnalyticsDashboard()">📊 Group Analytics Dashboard</button>
                            <button class="btn btn-success btn-small" onclick="showGroupResourceLibrary()">📚 Group Resource Library</button>
                        </div>
                    </div>
                    
                    <div style="background: var(--glass); padding: 1.5rem; border-radius: 12px;">
                        <h3 style="color: var(--primary); margin-bottom: 1rem;">📅 Events Tools (5 interfaces)</h3>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <button class="btn btn-warning btn-small" onclick="showEventCreationForm()">🔧 Event Creation Form</button>
                            <button class="btn btn-warning btn-small" onclick="showEventDetailsView()">📝 Event Details View</button>
                            <button class="btn btn-warning btn-small" onclick="showEventCheckIn()">✅ Event Check-in System</button>
                            <button class="btn btn-warning btn-small" onclick="showEventPhotoGallery()">📸 Event Photo Gallery</button>
                            <button class="btn btn-warning btn-small" onclick="showEventFeedbackForm()">📝 Event Feedback Form</button>
                        </div>
                    </div>
                </div>
                
                <div style="background: var(--primary); color: white; padding: 1.5rem; border-radius: 12px; text-align: center;">
                    <h3 style="margin-bottom: 1rem;">🎉 47 Advanced UI Interfaces Available!</h3>
                    <p>Click any button above to explore the detailed, interactive user interfaces. Each interface includes advanced features like photo editing, privacy controls, real-time search, group management, event planning, and much more!</p>
                    <div style="margin-top: 1rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                        <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;">✨ Photo Editing</span>
                        <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;">🔒 Privacy Controls</span>
                        <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;">📊 Analytics</span>
                        <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;">⚡ Real-time Features</span>
                    </div>
                </div>
            </div>
        `;
    }
}

function populateSearchDefaults() {
    const trendingTopics = document.getElementById('trendingTopics');
    const suggestedPeople = document.getElementById('suggestedPeople');

    if (trendingTopics) {
        trendingTopics.innerHTML = `
            <div style="padding: 1rem; background: var(--glass); border-radius: 12px; cursor: pointer; margin-bottom: 1rem;" onclick="searchTrending('ConnectHub')" role="button" tabindex="0">
                <div style="font-weight: 600; margin-bottom: 0.5rem;">#ConnectHub</div>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">24.5K posts</div>
            </div>
            <div style="padding: 1rem; background: var(--glass); border-radius: 12px; cursor: pointer; margin-bottom: 1rem;" onclick="searchTrending('AITech')" role="button" tabindex="0">
                <div style="font-weight: 600; margin-bottom: 0.5rem;">#AITech</div>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">15.2K posts</div>
            </div>
            <div style="padding: 1rem; background: var(--glass); border-radius: 12px; cursor: pointer;" onclick="searchTrending('SocialMedia')" role="button" tabindex="0">
                <div style="font-weight: 600; margin-bottom: 0.5rem;">#SocialMedia</div>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">12.1K posts</div>
            </div>
        `;
    }

    if (suggestedPeople) {
        suggestedPeople.innerHTML = sampleUsers.slice(0, 3).map(user => `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--glass); border-radius: 12px; margin-bottom: 1rem;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); display: flex; align-items: center; justify-content: center; font-weight: 600; color: white; font-size: 0.9rem;" aria-label="User avatar">${user.avatar}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 0.9rem;">${user.name}</div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">${user.profession}</div>
                </div>
                <button class="btn btn-primary btn-small" onclick="followUser('${user.name}')">Follow</button>
            </div>
        `).join('');
    }
}

function populateGroups() {
    const groupsList = document.getElementById('groupsList');
    const sampleGroups = [
        { name: 'Tech Enthusiasts', members: 1234, description: 'Discuss latest tech trends and innovations' },
        { name: 'Photography Club', members: 567, description: 'Share your best shots and photography tips' },
        { name: 'Book Lovers', members: 890, description: 'Discover new books and share reading experiences' },
        { name: 'Startup Community', members: 445, description: 'Connect with entrepreneurs and startup founders' },
        { name: 'Music Producers', members: 322, description: 'Collaborate and share music production techniques' },
        { name: 'Travel Adventurers', members: 756, description: 'Share travel stories and destination recommendations' }
    ];

    if (groupsList) {
        groupsList.innerHTML = sampleGroups.map(group => `
            <div class="card" role="listitem">
                <div style="font-size: 3rem; text-align: center; margin-bottom: 1rem;" role="img" aria-label="Group">👥</div>
                <h3>${group.name}</h3>
                <p style="color: var(--text-secondary); margin: 1rem 0;">${group.description}</p>
                <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${group.members.toLocaleString()} members</div>
                <button class="btn btn-primary" onclick="joinGroup('${group.name}')">Join Group</button>
            </div>
        `).join('');
    }
}

function populateEvents() {
    const eventsList = document.getElementById('eventsList');
    const sampleEvents = [
        { name: 'Tech Meetup 2024', date: 'Dec 15, 2024', location: 'Downtown Convention Center', attendees: 234 },
        { name: 'Photography Workshop', date: 'Dec 20, 2024', location: 'Art Studio', attendees: 45 },
        { name: 'Book Club Meeting', date: 'Dec 25, 2024', location: 'Central Library', attendees: 23 },
        { name: 'Startup Pitch Night', date: 'Dec 28, 2024', location: 'Innovation Hub', attendees: 156 },
        { name: 'Music Festival', date: 'Jan 5, 2025', location: 'City Park', attendees: 1200 },
        { name: 'Hiking Adventure', date: 'Jan 10, 2025', location: 'Mountain Trail', attendees: 67 }
    ];

    if (eventsList) {
        eventsList.innerHTML = sampleEvents.map(event => `
            <div class="card" role="listitem">
                <div style="font-size: 3rem; text-align: center; margin-bottom: 1rem;" role="img" aria-label="Event">📅</div>
                <h3>${event.name}</h3>
                <p style="color: var(--text-secondary); margin: 0.5rem 0;">${event.date}</p>
                <p style="color: var(--text-muted); margin: 1rem 0;">${event.location}</p>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${event.attendees} attending</p>
                <button class="btn btn-primary" onclick="joinEvent('${event.name}')">Join Event</button>
            </div>
        `).join('');
    }
}

function populateStories() {
    const storiesList = document.getElementById('storiesList');
    const sampleStories = [
        { user: 'Your Story', avatar: 'JD', type: 'add' },
        { user: 'Emma Wilson', avatar: 'EW', type: 'story' },
        { user: 'Mike Johnson', avatar: 'MJ', type: 'story' },
        { user: 'Sarah Miller', avatar: 'SM', type: 'story' },
        { user: 'Alex Chen', avatar: 'AC', type: 'story' }
    ];

    if (storiesList) {
        storiesList.innerHTML = sampleStories.map(story => `
            <div style="flex-shrink: 0; text-align: center; cursor: pointer;" onclick="${story.type === 'add' ? 'createStory()' : `viewStory('${story.user}')`}" role="button" tabindex="0">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: ${story.type === 'add' ? 'var(--glass)' : 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)'}; border: ${story.type === 'story' ? '3px solid var(--primary)' : '2px dashed var(--glass-border)'}; display: flex; align-items: center; justify-content: center; font-weight: 600; color: white; margin-bottom: 0.5rem;" aria-label="${story.type === 'add' ? 'Add story' : story.user + ' story'}">
                    ${story.type === 'add' ? '+' : story.avatar}
                </div>
                <div style="font-size: 0.8rem; max-width: 80px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${story.user}</div>
            </div>
        `).join('');
    }
}

// Dating Functions
function loadDatingCard() {
    const cardContent = document.getElementById('datingCardContent');
    if (!cardContent) return;
    
    const currentMatch = sampleMatches[Math.floor(Math.random() * sampleMatches.length)];
    
    cardContent.innerHTML = `
        <div style="width: 100%; height: 70%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); display: flex; align-items: center; justify-content: center; font-size: 4rem; color: white;" role="img" aria-label="Profile photo">💕</div>
        <div style="padding: 1.5rem;">
            <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">${currentMatch.name}, ${currentMatch.age}</div>
            <div style="color: var(--text-secondary); margin-bottom: 1rem;">📍 ${currentMatch.distance} away • ${currentMatch.match}% match</div>
            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">"${currentMatch.bio}"</div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${currentMatch.interests.map(interest => `<span style="background: var(--glass); padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem;">${interest}</span>`).join('')}
            </div>
        </div>
    `;

    // Add comprehensive dating UI test buttons
    addDatingTestButtons();
}

function addDatingTestButtons() {
    const datingSwipe = document.getElementById('datingSwipe');
    if (!datingSwipe || document.getElementById('datingTestButtons')) return;

    const testButtonsContainer = document.createElement('div');
    testButtonsContainer.id = 'datingTestButtons';
    testButtonsContainer.style.cssText = 'margin-top: 2rem; padding: 1.5rem; background: var(--glass); border-radius: 12px;';
    testButtonsContainer.innerHTML = `
        <h3 style="color: var(--primary); margin-bottom: 1rem;">💕 Advanced Dating Features (3 Missing UIs)</h3>
        <p style="margin-bottom: 1rem; color: var(--text-secondary);">Test the comprehensive dating UI interfaces that were missing:</p>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button class="btn btn-primary btn-small" onclick="showDatingProfileSetupWizard()">
                🔧 Dating Profile Setup Wizard
            </button>
            <button class="btn btn-primary btn-small" onclick="showSuperLikeBoostFeatures()">
                ⭐ Super Like/Boost Features
            </button>
            <button class="btn btn-primary btn-small" onclick="showDateSchedulingInterface()">
                📅 Date Scheduling Interface
            </button>
        </div>
        <div style="margin-top: 1rem; padding: 1rem; background: var(--primary); color: white; border-radius: 8px; text-align: center;">
            <strong>✅ All 3 Critical Dating UIs Implemented!</strong>
            <p style="margin-top: 0.5rem; font-size: 0.9rem;">Complete profile setup, premium features, and advanced date scheduling</p>
        </div>
    `;

    datingSwipe.appendChild(testButtonsContainer);
}

function populateMatches() {
    const matchesList = document.getElementById('matchesList');
    
    if (matchesList) {
        matchesList.innerHTML = sampleMatches.map(match => `
            <div class="card" style="text-align: center;" role="listitem">
                <div style="width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, var(--secondary) 0%, var(--accent) 100%); margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white;" aria-label="Profile photo">${match.avatar}</div>
                <h3>${match.name}</h3>
                <p style="color: var(--text-secondary);">${match.match}% Match</p>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0.5rem 0;">${match.distance} away</p>
                <div style="display: flex; gap: 0.5rem; justify-content: center; margin: 1rem 0; flex-wrap: wrap;">
                    ${match.interests.slice(0, 3).map(interest => `<span style="background: var(--glass); padding: 0.25rem 0.5rem; border-radius: 8px; font-size: 0.7rem;">${interest}</span>`).join('')}
                </div>
                <button class="btn btn-primary" onclick="startDatingChat('${match.name}', '${match.avatar}')">💬 Message</button>
            </div>
        `).join('');
    }
}

function populateDatingChat() {
    const chatList = document.getElementById('datingChatList');
    
    if (chatList) {
        chatList.innerHTML = sampleMatches.map(match => `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; cursor: pointer; transition: all 0.3s ease;" onclick="openDatingChat('${match.name}', '${match.avatar}')" role="button" tabindex="0">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--secondary) 0%, var(--accent) 100%); display: flex; align-items: center; justify-content: center; font-weight: 600; color: white;" aria-label="Profile photo">${match.avatar}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${match.name}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">${match.match}% match</div>
                </div>
            </div>
        `).join('');
    }
}

function populateDatingPreferences() {
    const interestTags = document.getElementById('interestTags');
    const datingInterests = ['Travel', 'Music', 'Sports', 'Art', 'Technology', 'Food', 'Movies', 'Books', 'Fitness', 'Photography', 'Gaming', 'Dancing', 'Hiking', 'Cooking', 'Fashion', 'Science'];
    
    if (interestTags) {
        interestTags.innerHTML = datingInterests.map(interest => `
            <span class="btn btn-secondary btn-small interest-tag" onclick="toggleInterest(this)" role="button" tabindex="0" aria-pressed="false">${interest}</span>
        `).join('');
    }
}

function swipeCard(direction) {
    const card = document.getElementById('datingCard');
    if (!card) return;
    
    const isLike = direction === 'right';
    
    card.style.transform = `translateX(${direction === 'right' ? '100%' : '-100%'}) rotate(${direction === 'right' ? '15deg' : '-15deg'})`;
    card.style.opacity = '0';
    
    setTimeout(() => {
        if (isLike) {
            showToast("It's a match! 💕", 'success');
        } else {
            showToast('Maybe next time...', 'info');
        }
        
        card.style.transform = 'translateX(0) rotate(0)';
        card.style.opacity = '1';
        loadDatingCard();
    }, 300);
}

function startDatingChat(name, avatar) {
    switchToScreen('dating', 'chat');
    setTimeout(() => openDatingChat(name, avatar), 100);
}

function openDatingChat(name, avatar) {
    const chatArea = document.getElementById('datingChatArea');
    if (chatArea) {
        chatArea.innerHTML = `
            <div style="padding: 1rem 1.5rem; background: var(--bg-card); border-bottom: 1px solid var(--glass-border);">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--secondary) 0%, var(--accent) 100%); display: flex; align-items: center; justify-content: center; font-weight: 600; color: white;" aria-label="Profile photo">${avatar}</div>
                    <div>
                        <h3>${name}</h3>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">It's a match! 💕</p>
                    </div>
                </div>
            </div>
            <div style="flex: 1; padding: 1rem; background: var(--bg-secondary); overflow-y: auto;">
                <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;" role="img" aria-label="Heart">💕</div>
                    <p>You and ${name} liked each other!</p>
                    <p style="margin-top: 0.5rem;">Start a conversation below</p>
                </div>
            </div>
            <div style="padding: 1rem; background: var(--bg-card); border-top: 1px solid var(--glass-border);">
                <div style="display: flex; gap: 1rem;">
                    <input type="text" id="datingMessageInput" placeholder="Say something nice..." style="flex: 1; padding: 0.75rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 20px; color: var(--text-primary);">
                    <button class="btn btn-primary" onclick="sendDatingMessage('${name}')" aria-label="Send message">💕</button>
                </div>
            </div>
        `;
    }
}

function updateAgeRange(value) {
    const element = document.getElementById('ageRangeValue');
    if (element) element.textContent = `18-${value}`;
}

function updateDistance(value) {
    const element = document.getElementById('distanceValue');
    if (element) element.textContent = `${value} miles`;
}

function toggleInterest(element) {
    element.classList.toggle('active');
    const isPressed = element.classList.contains('active');
    element.setAttribute('aria-pressed', isPressed);
    
    if (isPressed) {
        element.style.background = 'var(--primary)';
        element.style.color = 'white';
    } else {
        element.style.background = '';
        element.style.color = '';
    }
}

// Media Functions
function initializeMusic() {
    updateNowPlaying();
}

function updateNowPlaying() {
    const track = sampleTracks[currentTrackIndex];
    const currentTrackEl = document.getElementById('currentTrack');
    const artistNameEl = document.getElementById('artistName');
    
    if (currentTrackEl) currentTrackEl.textContent = track.title;
    if (artistNameEl) artistNameEl.textContent = `${track.artist} - ${track.album}`;
}

function togglePlayPause() {
    isPlaying = !isPlaying;
    const btn = document.getElementById('playButton');
    if (btn) {
        btn.textContent = isPlaying ? '⏸️' : '▶️';
        btn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
    }
    
    if (isPlaying) {
        showToast('Now playing: ' + sampleTracks[currentTrackIndex].title, 'info');
        startProgressAnimation();
    } else {
        showToast('Music paused', 'info');
    }
}

function startProgressAnimation() {
    if (!isPlaying) return;
    
    const progressFill = document.getElementById('progressFill');
    if (!progressFill) return;
    
    let width = parseInt(progressFill.style.width) || 0;
    
    const interval = setInterval(() => {
        if (!isPlaying || width >= 100) {
            clearInterval(interval);
            if (width >= 100) {
                nextTrack();
            }
            return;
        }
        width += 1;
        progressFill.style.width = width + '%';
    }, 200);
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % sampleTracks.length;
    updateNowPlaying();
    const progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = '0%';
    if (isPlaying) {
        startProgressAnimation();
    }
    showToast('Next track: ' + sampleTracks[currentTrackIndex].title, 'info');
}

function previousTrack() {
    currentTrackIndex = currentTrackIndex === 0 ? sampleTracks.length - 1 : currentTrackIndex - 1;
    updateNowPlaying();
    const progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = '0%';
    if (isPlaying) {
        startProgressAnimation();
    }
    showToast('Previous track: ' + sampleTracks[currentTrackIndex].title, 'info');
}

function toggleShuffle() {
    isShuffleEnabled = !isShuffleEnabled;
    const btn = document.getElementById('shuffleButton');
    if (btn) {
        btn.style.background = isShuffleEnabled ? 'var(--primary)' : '';
        btn.style.color = isShuffleEnabled ? 'white' : '';
    }
    showToast(isShuffleEnabled ? 'Shuffle enabled' : 'Shuffle disabled', 'info');
}

function toggleRepeat() {
    isRepeatEnabled = !isRepeatEnabled;
    const btn = document.getElementById('repeatButton');
    if (btn) {
        btn.style.background = isRepeatEnabled ? 'var(--primary)' : '';
        btn.style.color = isRepeatEnabled ? 'white' : '';
    }
    showToast(isRepeatEnabled ? 'Repeat enabled' : 'Repeat disabled', 'info');
}

function seekTrack(event) {
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
    
    showToast(`Seeked to ${Math.round(percentage)}%`, 'info');
}

function shareTrack() {
    const track = sampleTracks[currentTrackIndex];
    showToast(`Shared: ${track.title} by ${track.artist}`, 'success');
}

function openMusicLibrary() {
    if (window.musicLibraryUI) {
        window.musicLibraryUI.showMusicLibrary();
        showToast('Enhanced Music Library opened!', 'success');
    } else {
        showToast('Music Library not available', 'error');
    }
}

function startLiveSession() {
    showToast('Starting live music session...', 'info');
}

function discoverMusic() {
    showToast('Discovering new music based on your taste...', 'info');
}

function toggleMic() {
    const btn = document.getElementById('micButton');
    if (btn) {
        const isMuted = btn.textContent.includes('🎤');
        btn.innerHTML = isMuted ? '🔇 Muted' : '🎤 Mic';
        btn.className = isMuted ? 'btn btn-error btn-small' : 'btn btn-secondary btn-small';
    }
    showToast(btn && btn.textContent.includes('Muted') ? 'Microphone muted' : 'Microphone enabled', 'info');
}

function toggleCamera() {
    const btn = document.getElementById('cameraButton');
    if (btn) {
        const isOff = btn.textContent.includes('📷');
        btn.innerHTML = isOff ? '📹 Off' : '📷 Camera';
        btn.className = isOff ? 'btn btn-error btn-small' : 'btn btn-secondary btn-small';
    }
    showToast(btn && btn.textContent.includes('Off') ? 'Camera disabled' : 'Camera enabled', 'info');
}

function toggleStream() {
    isStreamLive = !isStreamLive;
    const btn = document.getElementById('streamButton');
    const viewerCountEl = document.getElementById('viewerCount');
    
    if (btn) {
        btn.innerHTML = isStreamLive ? '⏹️ Stop' : '🔴 Go Live';
    }
    
    if (isStreamLive) {
        viewerCount = 1;
        streamDuration = 0;
        startStreamTimer();
        showToast('Stream started! You\'re now live!', 'success');
    } else {
        viewerCount = 0;
        showToast('Stream ended', 'info');
    }
    
    if (viewerCountEl) viewerCountEl.textContent = `${viewerCount} viewers`;
}

function startStreamTimer() {
    const interval = setInterval(() => {
        if (!isStreamLive) {
            clearInterval(interval);
            return;
        }
        
        streamDuration++;
        const minutes = Math.floor(streamDuration / 60);
        const seconds = streamDuration % 60;
        const durationEl = document.getElementById('streamDuration');
        if (durationEl) {
            durationEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Simulate viewers joining
        if (Math.random() < 0.1) {
            viewerCount++;
            const viewerCountEl = document.getElementById('viewerCount');
            if (viewerCountEl) viewerCountEl.textContent = `${viewerCount} viewers`;
        }
    }, 1000);
}

function sendChatMessage(event) {
    if (event && event.key !== 'Enter') return;
    
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    
    if (message) {
        const chatMessages = document.getElementById('liveChatMessages');
        if (chatMessages) {
            chatMessages.innerHTML += `
                <div style="margin-bottom: 0.75rem; padding: 0.5rem; background: var(--glass-border); border-radius: 8px;">
                    <strong>You:</strong> ${message}
                </div>
            `;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        input.value = '';
        showToast('Message sent to live chat', 'success');
    }
}

function populateVideoCallData() {
    const recentCalls = document.getElementById('recentCalls');
    const scheduledCalls = document.getElementById('scheduledCalls');
    
    if (recentCalls) {
        recentCalls.innerHTML = `
            <div style="padding: 0.5rem; margin-bottom: 0.5rem; background: var(--glass); border-radius: 8px; cursor: pointer;">
                Emma Wilson - 2 min ago
            </div>
            <div style="padding: 0.5rem; margin-bottom: 0.5rem; background: var(--glass); border-radius: 8px; cursor: pointer;">
                Mike Johnson - 1 hour ago
            </div>
            <div style="padding: 0.5rem; margin-bottom: 0.5rem; background: var(--glass); border-radius: 8px; cursor: pointer;">
                Sarah Miller - 3 hours ago
            </div>
        `;
    }
    
    if (scheduledCalls) {
        scheduledCalls.innerHTML = `
            <div style="padding: 0.5rem; margin-bottom: 0.5rem; background: var(--glass); border-radius: 8px; cursor: pointer;">
                Team Meeting - 3:00 PM
            </div>
            <div style="padding: 0.5rem; margin-bottom: 0.5rem; background: var(--glass); border-radius: 8px; cursor: pointer;">
                Client Call - Tomorrow 10:00 AM
            </div>
        `;
    }
}

function startVideoCall() {
    showToast('Starting video call...', 'info');
}

function scheduleCall() {
    showToast('Opening call scheduler...', 'info');
}

function viewCallHistory() {
    showToast('Viewing call history...', 'info');
}

function addContact() {
    showToast('Opening contact manager...', 'info');
}

function launchARExperience(type) {
    showToast(`Launching ${type.replace('-', ' ')} experience...`, 'info');
}

// Extra Functions
function populateMarketplace() {
    const marketplaceItems = document.getElementById('marketplaceItems');
    
    if (marketplaceItems) {
        marketplaceItems.innerHTML = sampleMarketplaceItems.map(item => `
            <div class="card" role="listitem">
                <div style="height: 200px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 12px; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white;" role="img" aria-label="Product image">${item.image}</div>
                <h3>${item.title}</h3>
                <p style="color: var(--text-secondary);">${item.condition}</p>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Sold by ${item.seller}</p>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0.5rem 0;">${item.description}</p>
                <p style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin: 1rem 0;">$${item.price}</p>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-primary btn-small" onclick="buyNow(${item.id})">Buy Now</button>
                    <button class="btn btn-secondary btn-small" onclick="addToCart(${item.id})">Add to Cart</button>
                </div>
            </div>
        `).join('');
    }

    // Initialize category filters
    setTimeout(() => {
        document.querySelectorAll('.category-filter').forEach(filter => {
            filter.addEventListener('click', () => {
                document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                filterMarketplace(filter.getAttribute('data-category'));
            });
        });
    }, 100);
}

function filterMarketplace(category) {
    const items = category === 'all' ? sampleMarketplaceItems : sampleMarketplaceItems.filter(item => item.category === category);
    const marketplaceItems = document.getElementById('marketplaceItems');
    
    if (marketplaceItems) {
        marketplaceItems.innerHTML = items.map(item => `
            <div class="card" role="listitem">
                <div style="height: 200px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 12px; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white;" role="img" aria-label="Product image">${item.image}</div>
                <h3>${item.title}</h3>
                <p style="color: var(--text-secondary);">${item.condition}</p>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Sold by ${item.seller}</p>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0.5rem 0;">${item.description}</p>
                <p style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin: 1rem 0;">$${item.price}</p>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-primary btn-small" onclick="buyNow(${item.id})">Buy Now</button>
                    <button class="btn btn-secondary btn-small" onclick="addToCart(${item.id})">Add to Cart</button>
                </div>
            </div>
        `).join('');
    }
}

function populateWalletTransactions() {
    const transactionHistory = document.getElementById('transactionHistory');
    const sampleTransactions = [
        { type: 'received', amount: 100, from: 'Daily Check-in', time: '2 hours ago' },
        { type: 'sent', amount: 50, to: 'Emma Wilson', time: '1 day ago' },
        { type: 'received', amount: 200, from: 'Friend Referral', time: '2 days ago' },
        { type: 'sent', amount: 75, to: 'Mike Johnson', time: '3 days ago' },
        { type: 'received', amount: 150, from: 'Game Tournament', time: '5 days ago' }
    ];

    if (transactionHistory) {
        transactionHistory.innerHTML = sampleTransactions.map(tx => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--glass-border);">
                <div>
                    <div style="font-weight: 600; color: ${tx.type === 'received' ? 'var(--success)' : 'var(--error)'};">
                        ${tx.type === 'received' ? '+' : '-'}${tx.amount} coins
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">
                        ${tx.type === 'received' ? 'From: ' + tx.from : 'To: ' + tx.to}
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.8rem;">${tx.time}</div>
                </div>
            </div>
        `).join('');
    }
}

// Game Functions
function playGame(gameType) {
    const gameModal = document.getElementById('gameModal');
    const gameTitle = document.getElementById('gameTitle');
    const gameArea = document.getElementById('gameArea');
    
    if (gameTitle) gameTitle.textContent = gameType.charAt(0).toUpperCase() + gameType.slice(1);
    
    switch(gameType) {
        case 'tictactoe':
            initializeTicTacToe(gameArea);
            break;
        case 'memory':
            initializeMemoryGame(gameArea);
            break;
        case 'quiz':
            initializeQuiz(gameArea);
            break;
        case 'puzzle':
            initializePuzzleGame(gameArea);
            break;
        case 'cards':
            initializeCardGame(gameArea);
            break;
        case 'strategy':
            initializeStrategyGame(gameArea);
            break;
        default:
            if (gameArea) {
                gameArea.innerHTML = `<div style="text-align: center; padding: 2rem;">
                    <h3>Coming Soon!</h3>
                    <p>This game is under development. Stay tuned!</p>
                </div>`;
            }
    }
    
    if (gameModal) gameModal.classList.add('active');
}

function initializeTicTacToe(gameArea) {
    gameStates.tictactoe = {
        board: Array(9).fill(''),
        currentPlayer: 'X',
        gameOver: false
    };

    if (gameArea) {
        gameArea.innerHTML = `
            <div style="text-align: center; margin-bottom: 1rem;">
                <div id="gameStatus">Player X's turn</div>
            </div>
            <div class="game-board tic-tac-toe">
                ${Array(9).fill().map((_, i) => `
                    <div class="game-cell" onclick="makeMove(${i})" id="cell-${i}" role="button" tabindex="0" aria-label="Cell ${i + 1}"></div>
                `).join('')}
            </div>
            <div style="text-align: center; margin-top: 1rem;">
                <button class="btn btn-secondary" onclick="resetTicTacToe()">Reset Game</button>
            </div>
        `;
    }
}

function makeMove(cellIndex) {
    const game = gameStates.tictactoe;
    if (!game || game.board[cellIndex] !== '' || game.gameOver) return;
    
    game.board[cellIndex] = game.currentPlayer;
    const cell = document.getElementById(`cell-${cellIndex}`);
    if (cell) {
        cell.textContent = game.currentPlayer;
        cell.setAttribute('aria-label', `Cell ${cellIndex + 1}, ${game.currentPlayer}`);
    }
    
    if (checkWinTicTacToe()) {
        const status = document.getElementById('gameStatus');
        if (status) status.textContent = `Player ${game.currentPlayer} wins!`;
        game.gameOver = true;
        showToast(`Player ${game.currentPlayer} wins!`, 'success');
    } else if (game.board.every(cell => cell !== '')) {
        const status = document.getElementById('gameStatus');
        if (status) status.textContent = "It's a tie!";
        game.gameOver = true;
        showToast("It's a tie!", 'info');
    } else {
        game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
        const status = document.getElementById('gameStatus');
        if (status) status.textContent = `Player ${game.currentPlayer}'s turn`;
    }
}

function checkWinTicTacToe() {
    const game = gameStates.tictactoe;
    if (!game) return false;
    
    const winPatterns = [
        [0,1,2], [3,4,5], [6,7,8], // rows
        [0,3,6], [1,4,7], [2,5,8], // columns
        [0,4,8], [2,4,6] // diagonals
    ];
    
    return winPatterns.some(pattern => 
        pattern.every(index => game.board[index] === game.currentPlayer)
    );
}

function resetTicTacToe() {
    gameStates.tictactoe = {
        board: Array(9).fill(''),
        currentPlayer: 'X',
        gameOver: false
    };
    
    for (let i = 0; i < 9; i++) {
        const cell = document.getElementById(`cell-${i}`);
        if (cell) {
            cell.textContent = '';
            cell.setAttribute('aria-label', `Cell ${i + 1}`);
        }
    }
    const status = document.getElementById('gameStatus');
    if (status) status.textContent = "Player X's turn";
}

function initializeMemoryGame(gameArea) {
    const symbols = ['🌟', '🎵', '🎮', '💎', '🚀', '🌈', '⚡', '🔥'];
    const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    
    gameStates.memory = {
        cards: cards,
        flipped: [],
        matched: [],
        moves: 0
    };

    if (gameArea) {
        gameArea.innerHTML = `
            <div style="text-align: center; margin-bottom: 1rem;">
                <div>Moves: <span id="moveCount">0</span></div>
            </div>
            <div class="game-board memory-game">
                ${cards.map((symbol, i) => `
                    <div class="memory-card" onclick="flipCard(${i})" id="memory-${i}" role="button" tabindex="0" aria-label="Memory card ${i + 1}">?</div>
                `).join('')}
            </div>
            <div style="text-align: center; margin-top: 1rem;">
                <button class="btn btn-secondary" onclick="resetMemoryGame()">Reset Game</button>
            </div>
        `;
    }
}

function flipCard(index) {
    const game = gameStates.memory;
    if (!game || game.flipped.length >= 2 || game.flipped.includes(index) || game.matched.includes(index)) return;
    
    game.flipped.push(index);
    const card = document.getElementById(`memory-${index}`);
    if (card) {
        card.textContent = game.cards[index];
        card.classList.add('flipped');
        card.setAttribute('aria-label', `Memory card ${index + 1}, ${game.cards[index]}`);
    }
    
    if (game.flipped.length === 2) {
        game.moves++;
        const moveCount = document.getElementById('moveCount');
        if (moveCount) moveCount.textContent = game.moves;
        
        setTimeout(() => {
            const [first, second] = game.flipped;
            if (game.cards[first] === game.cards[second]) {
                game.matched.push(first, second);
                const firstCard = document.getElementById(`memory-${first}`);
                const secondCard = document.getElementById(`memory-${second}`);
                if (firstCard) firstCard.classList.add('matched');
                if (secondCard) secondCard.classList.add('matched');
                
                if (game.matched.length === game.cards.length) {
                    showToast(`Congratulations! You won in ${game.moves} moves!`, 'success');
                }
            } else {
                const firstCard = document.getElementById(`memory-${first}`);
                const secondCard = document.getElementById(`memory-${second}`);
                if (firstCard) {
                    firstCard.textContent = '?';
                    firstCard.classList.remove('flipped');
                    firstCard.setAttribute('aria-label', `Memory card ${first + 1}`);
                }
                if (secondCard) {
                    secondCard.textContent = '?';
                    secondCard.classList.remove('flipped');
                    secondCard.setAttribute('aria-label', `Memory card ${second + 1}`);
                }
            }
            game.flipped = [];
        }, 1000);
    }
}

function resetMemoryGame() {
    const gameArea = document.querySelector('#gameModal .modal-content #gameArea');
    if (gameArea) initializeMemoryGame(gameArea);
}

function initializeQuiz(gameArea) {
    const questions = [
        { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: 2 },
        { question: "Which planet is closest to the sun?", options: ["Venus", "Mercury", "Earth", "Mars"], correct: 1 },
        { question: "What is 2 + 2?", options: ["3", "4", "5", "6"], correct: 1 },
        { question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Monet"], correct: 2 },
        { question: "What is the largest ocean?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 }
    ];

    gameStates.quiz = { questions: questions, currentQuestion: 0, score: 0 };
    showQuizQuestion(gameArea);
}

function showQuizQuestion(gameArea) {
    const game = gameStates.quiz;
    if (!game || !gameArea) return;
    
    const question = game.questions[game.currentQuestion];

    gameArea.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <div style="color: var(--text-secondary);">Question ${game.currentQuestion + 1} of ${game.questions.length}</div>
            <div style="color: var(--primary); font-weight: 600;">Score: ${game.score}</div>
        </div>
        <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1.5rem;">${question.question}</h3>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${question.options.map((option, i) => `
                    <button class="btn btn-secondary" onclick="answerQuestion(${i})" style="text-align: left; justify-content: flex-start;">
                        ${String.fromCharCode(65 + i)}. ${option}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function answerQuestion(selectedIndex) {
    const game = gameStates.quiz;
    if (!game) return;
    
    const question = game.questions[game.currentQuestion];
    const isCorrect = selectedIndex === question.correct;
    
    if (isCorrect) {
        game.score++;
        showToast('Correct!', 'success');
    } else {
        showToast(`Wrong! The correct answer was ${question.options[question.correct]}`, 'error');
    }
    
    game.currentQuestion++;
    
    setTimeout(() => {
        if (game.currentQuestion < game.questions.length) {
            const gameArea = document.querySelector('#gameModal .modal-content #gameArea');
            if (gameArea) showQuizQuestion(gameArea);
        } else {
            const gameArea = document.querySelector('#gameModal .modal-content #gameArea');
            if (gameArea) {
                gameArea.innerHTML = `
                    <div style="text-align: center;">
                        <h2>Quiz Complete!</h2>
                        <div style="font-size: 2rem; color: var(--primary); margin: 1rem 0;">${game.score}/${game.questions.length}</div>
                        <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                            ${game.score === game.questions.length ? 'Perfect score! 🎉' : 
                              game.score >= game.questions.length / 2 ? 'Well done! 👏' : 'Better luck next time! 💪'}
                        </p>
                        <button class="btn btn-primary" onclick="resetQuiz()">Play Again</button>
                    </div>
                `;
            }
        }
    }, 1500);
}

function resetQuiz() {
    const gameArea = document.querySelector('#gameModal .modal-content #gameArea');
    if (gameArea) initializeQuiz(gameArea);
}

function initializePuzzleGame(gameArea) {
    if (gameArea) {
        gameArea.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h3>🧩 Puzzle Games</h3>
                <p style="color: var(--text-secondary); margin: 1rem 0;">Slide the tiles to solve the puzzle!</p>
                <div style="display: grid; grid-template-columns: repeat(3, 80px); gap: 2px; justify-content: center; margin: 2rem 0;">
                    ${Array(8).fill().map((_, i) => `
                        <div style="width: 80px; height: 80px; background: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; cursor: pointer;" onclick="movePuzzleTile(${i})">${i + 1}</div>
                    `).join('')}
                    <div style="width: 80px; height: 80px; background: var(--glass); border-radius: 8px;"></div>
                </div>
                <button class="btn btn-secondary" onclick="shufflePuzzle()">Shuffle</button>
            </div>
        `;
    }
}

function initializeCardGame(gameArea) {
    if (gameArea) {
        gameArea.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h3>🃏 Card Games</h3>
                <p style="color: var(--text-secondary); margin: 1rem 0;">Classic Solitaire</p>
                <div style="display: flex; justify-content: center; gap: 1rem; margin: 2rem 0;">
                    ${Array(4).fill().map((_, i) => `
                        <div style="width: 60px; height: 80px; background: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; cursor: pointer;">🂠</div>
                    `).join('')}
                </div>
                <button class="btn btn-primary" onclick="dealCards()">Deal Cards</button>
            </div>
        `;
    }
}

function initializeStrategyGame(gameArea) {
    if (gameArea) {
        gameArea.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h3>♟️ Strategy Games</h3>
                <p style="color: var(--text-secondary); margin: 1rem 0;">Coming soon: Chess, Checkers, and more!</p>
                <div style="display: grid; grid-template-columns: repeat(8, 40px); gap: 1px; justify-content: center; margin: 2rem 0;">
                    ${Array(64).fill().map((_, i) => `
                        <div style="width: 40px; height: 40px; background: ${(Math.floor(i / 8) + i) % 2 === 0 ? 'var(--glass)' : 'var(--glass-border)'}; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                            ${i < 16 || i > 47 ? (i < 16 ? '♟' : '♙') : ''}
                        </div>
                    `).join('')}
                </div>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Chess board preview - Full game coming soon!</p>
            </div>
        `;
    }
}

// Interactive Functions
function toggleNotifications() {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.toggle('active');
        if (panel.classList.contains('active')) {
            notificationCount = 0;
            updateMainNav();
        }
    }
}

function openCreatePost(type = 'text') {
    const modal = document.getElementById('createPostModal');
    if (modal) modal.classList.add('active');
    if (type !== 'text') {
        showToast(`Creating ${type} post...`, 'info');
    }
}

function publishPost() {
    const content = document.getElementById('postContent');
    if (content && content.value.trim()) {
        showLoading();
        setTimeout(() => {
            hideLoading();
            showToast('Post published successfully!', 'success');
            closeModal('createPostModal');
            content.value = '';
        }, 1000);
    } else {
        showToast('Please enter some content', 'warning');
    }
}

function toggleLike(btn, postId) {
    const countSpan = btn.querySelector('span');
    if (countSpan) {
        const count = parseInt(countSpan.textContent);
        const isLiked = btn.classList.contains('liked');
        
        if (isLiked) {
            btn.classList.remove('liked');
            countSpan.textContent = count - 1;
            showToast('Unliked', 'info');
        } else {
            btn.classList.add('liked');
            countSpan.textContent = count + 1;
            showToast('Liked! ❤️', 'success');
        }
    }
}

function showComments(postId) {
    showToast('Opening comments...', 'info');
}

function sharePost(postId) {
    showToast('Post shared!', 'success');
}

function addFriend(name) {
    showToast(`Friend request sent to ${name}`, 'success');
}

function followUser(name) {
    showToast(`Now following ${name}`, 'success');
}

function joinGroup(name) {
    showToast(`Joined ${name}`, 'success');
}

function joinEvent(name) {
    showToast(`Registered for ${name}`, 'success');
}

function createStory() {
    showToast('Story creation opened', 'info');
}

function viewStory(user) {
    showToast(`Viewing ${user}'s story`, 'info');
}

function openChat(userName, avatar) {
    const chatArea = document.getElementById('chatArea');
    if (chatArea) {
        chatArea.innerHTML = `
            <div style="padding: 1rem 1.5rem; background: var(--bg-card); border-bottom: 1px solid var(--glass-border);">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); display: flex; align-items: center; justify-content: center; font-weight: 600; color: white;" aria-label="User avatar">${avatar}</div>
                    <div>
                        <h3>${userName}</h3>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Online now</p>
                    </div>
                </div>
            </div>
            <div style="flex: 1; padding: 1rem; background: var(--bg-secondary); overflow-y: auto;" id="messagesArea">
                <div class="chat-message">
                    <div style="width: 35px; height: 35px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); display: flex; align-items: center; justify-content: center; font-weight: 600; color: white; font-size: 0.9rem;" aria-label="User avatar">${avatar}</div>
                    <div class="chat-bubble">Hey! How are you doing?</div>
                </div>
                <div class="chat-message own">
                    <div style="width: 35px; height: 35px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); display: flex; align-items: center; justify-content: center; font-weight: 600; color: white; font-size: 0.9rem;" aria-label="Your avatar">JD</div>
                    <div class="chat-bubble">I'm great! How about you?</div>
                </div>
            </div>
            <div style="padding: 1rem; background: var(--bg-card); border-top: 1px solid var(--glass-border);">
                <div style="display: flex; gap: 1rem;">
                    <input type="text" id="messageInput" placeholder="Type a message..." style="flex: 1; padding: 0.75rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 20px; color: var(--text-primary);" onkeypress="sendMessage(event, '${userName}')">
                    <button class="btn btn-primary" onclick="sendMessage(null, '${userName}')" aria-label="Send message">📤</button>
                </div>
            </div>
        `;
    }
}

function sendMessage(event, userName) {
    if (event && event.key !== 'Enter') return;
    
    const input = document.getElementById('messageInput');
    if (!input) return;
    
    const message = input.value.trim();
    
    if (message) {
        const messagesArea = document.getElementById('messagesArea');
        if (messagesArea) {
            messagesArea.innerHTML += `
                <div class="chat-message own">
                    <div style="width: 35px; height: 35px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); display: flex; align-items: center; justify-content: center; font-weight: 600; color: white; font-size: 0.9rem;" aria-label="Your avatar">JD</div>
                    <div class="chat-bubble">${message}</div>
                </div>
            `;
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }
        input.value = '';
        showToast(`Message sent to ${userName}`, 'success');
    }
}

function sendDatingMessage(name) {
    const input = document.getElementById('datingMessageInput');
    if (input && input.value.trim()) {
        showToast(`Message sent to ${name}`, 'success');
        input.value = '';
    }
}

function searchTrending(hashtag) {
    showToast(`Searching for #${hashtag}...`, 'info');
}

function performSearch(query) {
    if (query && query.trim()) {
        showToast(`Searching for "${query}"...`, 'info');
    }
}

function buyNow(itemId) {
    showToast('Redirecting to checkout...', 'info');
}

function addToCart(itemId) {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = parseInt(cartCount.textContent) + 1;
    }
    showToast('Added to cart!', 'success');
}

function movePuzzleTile(index) {
    showToast(`Moving tile ${index + 1}`, 'info');
}

function shufflePuzzle() {
    showToast('Puzzle shuffled!', 'info');
}

function dealCards() {
    showToast('Cards dealt!', 'info');
}

// Authentication Functions
function socialLogin(provider) {
    showLoading();
    showToast(`Signing in with ${provider}...`, 'info');
    setTimeout(() => {
        hideLoading();
        isLoggedIn = true;
        document.getElementById('authScreen').classList.remove('active');
        document.getElementById('categorySelection').classList.add('active');
        showToast('Welcome to ConnectHub!', 'success');
        updateMainNav();
        updateSubNav();
    }, 2000);
}

function forgotPassword() {
    showToast('Password reset link sent to your email', 'info');
}

// Initialize UI component instances when needed
function initializeUIComponents() {
    if (!profileUIComponents && window.ProfileUIComponents) {
        profileUIComponents = new ProfileUIComponents();
    }
    if (!searchUIComponents && window.SearchMissingUIComponents) {
        searchUIComponents = new SearchMissingUIComponents();
    }
    if (!groupsUIComponents && window.GroupsMissingUIComponents) {
        groupsUIComponents = new GroupsMissingUIComponents();
    }
    if (!eventsUIComponents && window.EventsMissingUIComponents) {
        eventsUIComponents = new EventsMissingUIComponents();
    }
    if (!advancedSearchResultsUI && window.AdvancedSearchResultsUI) {
        advancedSearchResultsUI = new AdvancedSearchResultsUI({
            showToast: showToast
        });
    }
    if (!searchDiscoveryStreamingComponents && window.SearchDiscoveryStreamingComponents) {
        searchDiscoveryStreamingComponents = new SearchDiscoveryStreamingComponents();
    }
}

// Enhanced UI interface functions for Profile Screen
function showAdvancedProfileEditor() {
    initializeUIComponents();
    if (profileUIComponents) {
        profileUIComponents.showAdvancedProfileEditor();
        showToast('Advanced Profile Editor opened!', 'success');
    }
}

function showPhotoEditor() {
    initializeUIComponents();
    if (profileUIComponents) {
        profileUIComponents.showPhotoEditor();
        showToast('Photo Editor opened!', 'success');
    }
}

function showPrivacyControlPanel() {
    initializeUIComponents();
    if (profileUIComponents) {
        profileUIComponents.showPrivacyControlPanel();
        showToast('Privacy Control Panel opened!', 'success');
    }
}

function showAchievementsGallery() {
    initializeUIComponents();
    if (profileUIComponents) {
        profileUIComponents.showAchievementsGallery();
        showToast('Achievements Gallery opened!', 'success');
    }
}

function showConnectionsManager() {
    initializeUIComponents();
    if (profileUIComponents) {
        profileUIComponents.showConnectionsManager();
        showToast('Connections Manager opened!', 'success');
    }
}

// Enhanced UI interface functions for Search Screen
function showAdvancedSearchFilters() {
    initializeUIComponents();
    if (searchUIComponents) {
        searchUIComponents.showAdvancedSearchFilters();
        showToast('Advanced Search Filters opened!', 'success');
    }
}

function showSearchResultsCustomizer() {
    initializeUIComponents();
    if (searchUIComponents) {
        searchUIComponents.showSearchResultsCustomizer();
        showToast('Search Results Customizer opened!', 'success');
    }
}

function showSavedSearchesManager() {
    initializeUIComponents();
    if (searchUIComponents) {
        searchUIComponents.showSavedSearchesManager();
        showToast('Saved Searches Manager opened!', 'success');
    }
}

function showSearchHistoryViewer() {
    initializeUIComponents();
    if (searchUIComponents) {
        searchUIComponents.showSearchHistoryViewer();
        showToast('Search History Viewer opened!', 'success');
    }
}

function showRealTimeSearchSuggestions() {
    initializeUIComponents();
    if (searchUIComponents) {
        searchUIComponents.showRealTimeSearchSuggestions();
        showToast('Real-time Search Suggestions opened!', 'success');
    }
}

// NEW: Advanced Search Results UI function - The 1 Missing Search & Discovery Interface
function showAdvancedSearchResults(query = 'photography', results = {}) {
    initializeUIComponents();
    if (advancedSearchResultsUI) {
        advancedSearchResultsUI.showAdvancedSearchResults(query, results);
        showToast('Advanced Search Results opened!', 'success');
    } else {
        showToast('Advanced Search Results UI not available', 'warning');
    }
}

// NEW: Search & Discovery Streaming UI interface functions - The 3 Missing Search & Discovery Streaming Interfaces
function showLiveStreamSearch() {
    initializeUIComponents();
    if (searchDiscoveryStreamingComponents) {
        searchDiscoveryStreamingComponents.showLiveStreamSearch();
        showToast('Live Stream Search & Discovery opened!', 'success');
    } else {
        showToast('Live Stream Search UI not available', 'warning');
    }
}

function showContentRecommendations() {
    initializeUIComponents();
    if (searchDiscoveryStreamingComponents) {
        searchDiscoveryStreamingComponents.showContentRecommendations();
        showToast('Content Recommendation Engine opened!', 'success');
    } else {
        showToast('Content Recommendations UI not available', 'warning');
    }
}

function showTrendingAnalytics() {
    initializeUIComponents();
    if (searchDiscoveryStreamingComponents) {
        searchDiscoveryStreamingComponents.showTrendingAnalytics();
        showToast('Trending Streams Analytics opened!', 'success');
    } else {
        showToast('Trending Analytics UI not available', 'warning');
    }
}

// Enhanced UI interface functions for Groups Screen
function showGroupCreationWizard() {
    initializeUIComponents();
    if (groupsUIComponents) {
        groupsUIComponents.showGroupCreationWizard();
        showToast('Group Creation Wizard opened!', 'success');
    }
}

function showGroupMembersManager() {
    initializeUIComponents();
    if (groupsUIComponents) {
        groupsUIComponents.showGroupMembersManager();
        showToast('Group Members Manager opened!', 'success');
    }
}

function showGroupDiscussionBoard() {
    initializeUIComponents();
    if (groupsUIComponents) {
        groupsUIComponents.showGroupDiscussionBoard();
        showToast('Group Discussion Board opened!', 'success');
    }
}

function showGroupEventsCalendar() {
    initializeUIComponents();
    if (groupsUIComponents) {
        groupsUIComponents.showGroupEventsCalendar();
        showToast('Group Events Calendar opened!', 'success');
    }
}

function showGroupSettingsPanel() {
    initializeUIComponents();
    if (groupsUIComponents) {
        groupsUIComponents.showGroupSettingsPanel();
        showToast('Group Settings Panel opened!', 'success');
    }
}

function showGroupAnalyticsDashboard() {
    initializeUIComponents();
    if (groupsUIComponents) {
        groupsUIComponents.showGroupAnalyticsDashboard();
        showToast('Group Analytics Dashboard opened!', 'success');
    }
}

function showGroupResourceLibrary() {
    initializeUIComponents();
    if (groupsUIComponents) {
        groupsUIComponents.showGroupResourceLibrary();
        showToast('Group Resource Library opened!', 'success');
    }
}

// Enhanced UI interface functions for Events Screen
function showEventCreationForm() {
    initializeUIComponents();
    if (eventsUIComponents) {
        eventsUIComponents.showEventCreationForm();
        showToast('Event Creation Form opened!', 'success');
    }
}

function showEventDetailsView() {
    initializeUIComponents();
    if (eventsUIComponents) {
        eventsUIComponents.showEventDetailsView();
        showToast('Event Details View opened!', 'success');
    }
}

function showEventCheckIn() {
    initializeUIComponents();
    if (eventsUIComponents) {
        eventsUIComponents.showEventCheckIn();
        showToast('Event Check-in opened!', 'success');
    }
}

function showEventPhotoGallery() {
    initializeUIComponents();
    if (eventsUIComponents) {
        eventsUIComponents.showEventPhotoGallery();
        showToast('Event Photo Gallery opened!', 'success');
    }
}

function showEventFeedbackForm() {
    initializeUIComponents();
    if (eventsUIComponents) {
        eventsUIComponents.showEventFeedbackForm();
        showToast('Event Feedback Form opened!', 'success');
    }
}

// Privacy & Security UI interface functions
function showContentReportInterface(contentId, contentType, contentPreview) {
    if (window.privacySecurityUI) {
        window.privacySecurityUI.showContentReportInterface(contentId, contentType, contentPreview);
        showToast('Content Reporting Interface opened!', 'success');
    }
}

function showBlockMuteInterface(userId, username) {
    if (window.privacySecurityUI) {
        window.privacySecurityUI.showBlockMuteInterface(userId, username);
        showToast('Block/Mute User Interface opened!', 'success');
    }
}

function showPrivacyPolicyInterface() {
    if (window.privacySecurityUI) {
        window.privacySecurityUI.showPrivacyPolicyInterface();
        showToast('Privacy Policy & Terms Interface opened!', 'success');
    }
}

function showDataExportInterface() {
    if (window.privacySecurityUI) {
        window.privacySecurityUI.showDataExportInterface();
        showToast('Data Export Interface opened!', 'success');
    }
}

function showContentFilterInterface() {
    if (window.privacySecurityUI) {
        window.privacySecurityUI.showContentFilterInterface();
        showToast('Content Filter Settings opened!', 'success');
    }
}

// Event listeners and initialization
document.addEventListener('DOMContentLoaded', () => {
    updateMainNav();
    updateSubNav();
    
    // Initialize UI components after a short delay to ensure all classes are loaded
    setTimeout(initializeUIComponents, 500);

    // Auth tab switching
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const mode = tab.getAttribute('data-mode');
            const isLogin = mode === 'login';
            
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const nameGroup = document.getElementById('nameGroup');
            const confirmGroup = document.getElementById('confirmGroup');
            const authButtonText = document.getElementById('authButtonText');
            
            if (nameGroup) nameGroup.style.display = isLogin ? 'none' : 'block';
            if (confirmGroup) confirmGroup.style.display = isLogin ? 'none' : 'block';
            if (authButtonText) authButtonText.textContent = isLogin ? 'Sign In' : 'Register';
        });
    });

    // Auth form submission
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showLoading();
            
            setTimeout(() => {
                hideLoading();
                isLoggedIn = true;
                document.getElementById('authScreen').classList.remove('active');
                document.getElementById('categorySelection').classList.add('active');
                showToast('Welcome to ConnectHub!', 'success');
                updateMainNav();
                updateSubNav();
            }, 1500);
        });
    }

    // Close modals on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Close notification panel when clicking outside
    document.addEventListener('click', (e) => {
        const notificationPanel = document.getElementById('notificationPanel');
        if (notificationPanel && !e.target.closest('.notification-panel') && !e.target.closest('[onclick*="toggleNotifications"]')) {
            notificationPanel.classList.remove('active');
        }
    });

    // Keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close any open modals
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
            
            // Close notification panel
            const notificationPanel = document.getElementById('notificationPanel');
            if (notificationPanel) {
                notificationPanel.classList.remove('active');
            }
        }
    });

    // Show welcome toast after delay
    setTimeout(() => {
        if (!isLoggedIn) {
            showToast('Welcome to ConnectHub! Sign in to explore all features.', 'info');
        }
    }, 2000);
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('App error:', e.error);
    showToast('Something went wrong. Please try again.', 'error');
});

// Service worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
