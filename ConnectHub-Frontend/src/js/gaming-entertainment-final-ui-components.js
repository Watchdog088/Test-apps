// Gaming Entertainment Final UI Components for ConnectHub
// Implements 3 additional comprehensive gaming interfaces: Gaming Store/Marketplace, Gaming Social/Community, and Gaming Streaming/Broadcasting

class GamingEntertainmentFinalUIComponents {
    constructor() {
        this.currentUser = null;
        this.gameStore = {
            games: [],
            categories: [],
            cart: [],
            wishlist: [],
            ownedGames: []
        };
        this.gamingCommunity = {
            clubs: [],
            forums: [],
            friends: [],
            posts: []
        };
        this.gameStreaming = {
            liveStreams: [],
            followedStreamers: [],
            streamSettings: {},
            viewerCount: 0
        };
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {};
        this.currentFilters = {};
        this.currentView = 'grid';
        this.isStreaming = false;
        
        this.init();
    }

    async init() {
        await this.loadTranslations();
        this.initializeEventListeners();
    }

    async loadTranslations() {
        this.translations = {
            en: {
                // Gaming Store
                gameStore: 'Gaming Store',
                marketplace: 'Marketplace',
                browse: 'Browse Games',
                categories: 'Categories',
                featured: 'Featured',
                newReleases: 'New Releases',
                topSelling: 'Top Selling',
                onSale: 'On Sale',
                free: 'Free to Play',
                cart: 'Shopping Cart',
                wishlist: 'Wishlist',
                library: 'My Library',
                purchase: 'Purchase',
                addToCart: 'Add to Cart',
                addToWishlist: 'Add to Wishlist',
                removeFromCart: 'Remove from Cart',
                removeFromWishlist: 'Remove from Wishlist',
                price: 'Price',
                discount: 'Discount',
                rating: 'Rating',
                reviews: 'Reviews',
                description: 'Description',
                screenshots: 'Screenshots',
                systemRequirements: 'System Requirements',
                genres: 'Genres',
                developer: 'Developer',
                publisher: 'Publisher',
                releaseDate: 'Release Date',
                checkout: 'Checkout',
                total: 'Total',
                
                // Gaming Community
                gamingCommunity: 'Gaming Community',
                clubs: 'Gaming Clubs',
                forums: 'Forums',
                friends: 'Gaming Friends',
                posts: 'Community Posts',
                createClub: 'Create Club',
                joinClub: 'Join Club',
                leaveClub: 'Leave Club',
                myClubs: 'My Clubs',
                clubMembers: 'Members',
                clubEvents: 'Club Events',
                discussions: 'Discussions',
                newPost: 'New Post',
                reply: 'Reply',
                like: 'Like',
                share: 'Share',
                following: 'Following',
                followers: 'Followers',
                onlineNow: 'Online Now',
                recently: 'Recently Active',
                achievements: 'Recent Achievements',
                gameStatus: 'Game Status',
                invite: 'Invite to Game',
                message: 'Send Message',
                
                // Gaming Streaming
                gameStreaming: 'Game Streaming',
                liveStreams: 'Live Streams',
                myStream: 'My Stream',
                startStream: 'Start Streaming',
                endStream: 'End Stream',
                streamSettings: 'Stream Settings',
                streamTitle: 'Stream Title',
                streamDescription: 'Stream Description',
                streamCategory: 'Game Category',
                viewers: 'Viewers',
                followers: 'Followers',
                following: 'Following',
                chat: 'Chat',
                donate: 'Donate',
                subscribe: 'Subscribe',
                follow: 'Follow',
                unfollow: 'Unfollow',
                quality: 'Quality',
                fullscreen: 'Fullscreen',
                volume: 'Volume',
                streamKey: 'Stream Key',
                resolution: 'Resolution',
                frameRate: 'Frame Rate',
                bitrate: 'Bitrate',
                goLive: 'Go Live',
                featured: 'Featured Streams',
                popular: 'Popular',
                categories: 'Game Categories',
                viewAll: 'View All',
                filterBy: 'Filter by',
                sortBy: 'Sort by'
            }
        };
    }

    t(key) {
        return this.translations[this.currentLanguage]?.[key] || this.translations.en[key] || key;
    }

    initializeEventListeners() {
        document.addEventListener('languageChanged', (event) => {
            this.currentLanguage = event.detail.language;
            this.refreshAllInterfaces();
        });
    }

    // =================== MISSING UI 1: GAMING STORE/MARKETPLACE INTERFACE ===================
    async createGamingStoreInterface(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="gaming-store-interface">
                <div class="store-header">
                    <h2 class="store-title">
                        <i class="fas fa-store"></i>
                        ${this.t('gameStore')}
                    </h2>
                    
                    <div class="store-navigation">
                        <button class="nav-btn active" data-section="featured" onclick="gamingEntertainmentFinalUI.switchStoreSection('featured')">
                            <i class="fas fa-star"></i>
                            ${this.t('featured')}
                        </button>
                        <button class="nav-btn" data-section="browse" onclick="gamingEntertainmentFinalUI.switchStoreSection('browse')">
                            <i class="fas fa-search"></i>
                            ${this.t('browse')}
                        </button>
                        <button class="nav-btn" data-section="library" onclick="gamingEntertainmentFinalUI.switchStoreSection('library')">
                            <i class="fas fa-book"></i>
                            ${this.t('library')}
                        </button>
                        <button class="nav-btn cart-btn" data-section="cart" onclick="gamingEntertainmentFinalUI.switchStoreSection('cart')">
                            <i class="fas fa-shopping-cart"></i>
                            ${this.t('cart')} <span class="cart-count" id="cart-count">0</span>
                        </button>
                    </div>
                    
                    <div class="store-search">
                        <input type="text" id="store-search-input" placeholder="Search games..." onkeyup="gamingEntertainmentFinalUI.searchGames()">
                        <button class="search-btn">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>

                <div class="store-content">
                    <!-- Featured Section -->
                    <div id="featured-section" class="store-section active">
                        <div class="featured-banner">
                            <div class="banner-game">
                                <div class="banner-image">
                                    <img src="/src/assets/featured-game.jpg" alt="Featured Game" id="featured-game-image">
                                </div>
                                <div class="banner-info">
                                    <h3 class="banner-title" id="featured-game-title">Epic Adventure Quest</h3>
                                    <p class="banner-description" id="featured-game-description">Embark on an epic journey through mystical lands...</p>
                                    <div class="banner-price">
                                        <span class="original-price">$59.99</span>
                                        <span class="sale-price">$39.99</span>
                                        <span class="discount-badge">33% OFF</span>
                                    </div>
                                    <div class="banner-actions">
                                        <button class="purchase-btn primary-btn">
                                            <i class="fas fa-credit-card"></i>
                                            ${this.t('purchase')}
                                        </button>
                                        <button class="cart-btn secondary-btn">
                                            <i class="fas fa-cart-plus"></i>
                                            ${this.t('addToCart')}
                                        </button>
                                        <button class="wishlist-btn">
                                            <i class="fas fa-heart"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="featured-categories">
                            <div class="category-section">
                                <h3>${this.t('newReleases')}</h3>
                                <div class="games-horizontal-scroll" id="new-releases"></div>
                            </div>
                            
                            <div class="category-section">
                                <h3>${this.t('topSelling')}</h3>
                                <div class="games-horizontal-scroll" id="top-selling"></div>
                            </div>
                            
                            <div class="category-section">
                                <h3>${this.t('onSale')}</h3>
                                <div class="games-horizontal-scroll" id="on-sale"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Browse Section -->
                    <div id="browse-section" class="store-section">
                        <div class="browse-filters">
                            <div class="filter-group">
                                <label>${this.t('categories')}:</label>
                                <select id="category-filter" onchange="gamingEntertainmentFinalUI.filterGames()">
                                    <option value="all">All Categories</option>
                                    <option value="action">Action</option>
                                    <option value="adventure">Adventure</option>
                                    <option value="strategy">Strategy</option>
                                    <option value="puzzle">Puzzle</option>
                                    <option value="rpg">RPG</option>
                                    <option value="simulation">Simulation</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label>${this.t('price')}:</label>
                                <select id="price-filter" onchange="gamingEntertainmentFinalUI.filterGames()">
                                    <option value="all">All Prices</option>
                                    <option value="free">Free</option>
                                    <option value="under-10">Under $10</option>
                                    <option value="under-30">Under $30</option>
                                    <option value="under-60">Under $60</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label>${this.t('rating')}:</label>
                                <select id="rating-filter" onchange="gamingEntertainmentFinalUI.filterGames()">
                                    <option value="all">All Ratings</option>
                                    <option value="5">5 Stars</option>
                                    <option value="4">4+ Stars</option>
                                    <option value="3">3+ Stars</option>
                                </select>
                            </div>
                            
                            <div class="view-toggle">
                                <button class="view-btn active" data-view="grid" onclick="gamingEntertainmentFinalUI.switchView('grid')">
                                    <i class="fas fa-th"></i>
                                </button>
                                <button class="view-btn" data-view="list" onclick="gamingEntertainmentFinalUI.switchView('list')">
                                    <i class="fas fa-list"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="games-container">
                            <div id="games-grid" class="games-grid active"></div>
                            <div id="games-list" class="games-list"></div>
                        </div>
                        
                        <div class="pagination" id="store-pagination">
                            <button class="prev-page" onclick="gamingEntertainmentFinalUI.previousPage()">Previous</button>
                            <div class="page-numbers" id="page-numbers"></div>
                            <button class="next-page" onclick="gamingEntertainmentFinalUI.nextPage()">Next</button>
                        </div>
                    </div>

                    <!-- Library Section -->
                    <div id="library-section" class="store-section">
                        <div class="library-header">
                            <h3>${this.t('library')} (12 games)</h3>
                            <div class="library-filters">
                                <select id="library-sort">
                                    <option value="recent">Recently Played</option>
                                    <option value="alphabetical">A-Z</option>
                                    <option value="install-date">Install Date</option>
                                    <option value="playtime">Play Time</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="library-games" id="library-games"></div>
                    </div>

                    <!-- Cart Section -->
                    <div id="cart-section" class="store-section">
                        <div class="cart-header">
                            <h3>${this.t('cart')}</h3>
                            <button class="clear-cart-btn" onclick="gamingEntertainmentFinalUI.clearCart()">
                                Clear Cart
                            </button>
                        </div>
                        
                        <div class="cart-content">
                            <div class="cart-items" id="cart-items">
                                <div class="empty-cart">
                                    <i class="fas fa-shopping-cart"></i>
                                    <p>Your cart is empty</p>
                                    <button onclick="gamingEntertainmentFinalUI.switchStoreSection('browse')">
                                        Browse Games
                                    </button>
                                </div>
                            </div>
                            
                            <div class="cart-summary" id="cart-summary" style="display: none;">
                                <div class="summary-item">
                                    <span>Subtotal:</span>
                                    <span id="cart-subtotal">$0.00</span>
                                </div>
                                <div class="summary-item">
                                    <span>Tax:</span>
                                    <span id="cart-tax">$0.00</span>
                                </div>
                                <div class="summary-item total">
                                    <span>Total:</span>
                                    <span id="cart-total">$0.00</span>
                                </div>
                                <button class="checkout-btn primary-btn" onclick="gamingEntertainmentFinalUI.checkout()">
                                    <i class="fas fa-credit-card"></i>
                                    ${this.t('checkout')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Game Detail Modal -->
                <div id="game-detail-modal" class="modal-overlay" style="display: none;">
                    <div class="modal-content game-detail-content">
                        <div class="modal-header">
                            <h3 id="game-detail-title">Game Title</h3>
                            <button class="close-modal" onclick="gamingEntertainmentFinalUI.closeGameDetail()">×</button>
                        </div>
                        
                        <div class="modal-body">
                            <div class="game-detail-media">
                                <div class="game-screenshots" id="game-screenshots">
                                    <img src="/src/assets/game-screenshot.jpg" alt="Game Screenshot">
                                </div>
                                <div class="game-video" style="display: none;">
                                    <video controls>
                                        <source src="/src/assets/game-trailer.mp4" type="video/mp4">
                                    </video>
                                </div>
                            </div>
                            
                            <div class="game-detail-info">
                                <div class="game-meta">
                                    <div class="meta-item">
                                        <span class="meta-label">${this.t('developer')}:</span>
                                        <span class="meta-value" id="game-developer">Developer Name</span>
                                    </div>
                                    <div class="meta-item">
                                        <span class="meta-label">${this.t('publisher')}:</span>
                                        <span class="meta-value" id="game-publisher">Publisher Name</span>
                                    </div>
                                    <div class="meta-item">
                                        <span class="meta-label">${this.t('releaseDate')}:</span>
                                        <span class="meta-value" id="game-release-date">2024-01-01</span>
                                    </div>
                                    <div class="meta-item">
                                        <span class="meta-label">${this.t('genres')}:</span>
                                        <span class="meta-value" id="game-genres">Action, Adventure</span>
                                    </div>
                                </div>
                                
                                <div class="game-description" id="game-detail-description">
                                    Game description will be loaded here...
                                </div>
                                
                                <div class="game-system-requirements">
                                    <h4>${this.t('systemRequirements')}</h4>
                                    <div class="requirements-content" id="system-requirements">
                                        System requirements will be loaded here...
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="modal-footer">
                            <div class="game-price">
                                <span class="current-price" id="detail-price">$39.99</span>
                                <span class="original-price" id="detail-original-price">$59.99</span>
                            </div>
                            <div class="game-actions">
                                <button class="wishlist-btn" onclick="gamingEntertainmentFinalUI.toggleWishlist()">
                                    <i class="fas fa-heart"></i>
                                    ${this.t('wishlist')}
                                </button>
                                <button class="cart-btn secondary-btn" onclick="gamingEntertainmentFinalUI.addToCartFromDetail()">
                                    <i class="fas fa-cart-plus"></i>
                                    ${this.t('addToCart')}
                                </button>
                                <button class="purchase-btn primary-btn" onclick="gamingEntertainmentFinalUI.purchaseGame()">
                                    <i class="fas fa-credit-card"></i>
                                    ${this.t('purchase')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await this.loadGamesData();
        this.renderFeaturedSection();
    }

    // =================== MISSING UI 2: GAMING SOCIAL/COMMUNITY INTERFACE ===================
    async createGamingCommunityInterface(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="gaming-community-interface">
                <div class="community-header">
                    <h2 class="community-title">
                        <i class="fas fa-users"></i>
                        ${this.t('gamingCommunity')}
                    </h2>
                    
                    <div class="community-navigation">
                        <button class="nav-btn active" data-section="feed" onclick="gamingEntertainmentFinalUI.switchCommunitySection('feed')">
                            <i class="fas fa-home"></i>
                            Community Feed
                        </button>
                        <button class="nav-btn" data-section="clubs" onclick="gamingEntertainmentFinalUI.switchCommunitySection('clubs')">
                            <i class="fas fa-users-cog"></i>
                            ${this.t('clubs')}
                        </button>
                        <button class="nav-btn" data-section="friends" onclick="gamingEntertainmentFinalUI.switchCommunitySection('friends')">
                            <i class="fas fa-user-friends"></i>
                            ${this.t('friends')}
                        </button>
                        <button class="nav-btn" data-section="forums" onclick="gamingEntertainmentFinalUI.switchCommunitySection('forums')">
                            <i class="fas fa-comments"></i>
                            ${this.t('forums')}
                        </button>
                    </div>
                    
                    <div class="community-actions">
                        <button class="new-post-btn primary-btn" onclick="gamingEntertainmentFinalUI.showNewPostModal()">
                            <i class="fas fa-plus"></i>
                            ${this.t('newPost')}
                        </button>
                    </div>
                </div>

                <div class="community-content">
                    <!-- Community Feed Section -->
                    <div id="feed-section" class="community-section active">
                        <div class="feed-sidebar">
                            <div class="user-summary">
                                <div class="user-avatar">
                                    <img src="/src/assets/user-avatar.jpg" alt="User Avatar">
                                </div>
                                <div class="user-info">
                                    <h4>Current User</h4>
                                    <div class="user-stats">
                                        <div class="stat-item">
                                            <span class="stat-number">127</span>
                                            <span class="stat-label">${this.t('friends')}</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-number">8</span>
                                            <span class="stat-label">${this.t('clubs')}</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-number">2,450</span>
                                            <span class="stat-label">Gaming Score</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="quick-actions">
                                <button onclick="gamingEntertainmentFinalUI.findGamingFriends()">
                                    <i class="fas fa-user-plus"></i>
                                    Find Gaming Friends
                                </button>
                                <button onclick="gamingEntertainmentFinalUI.discoverClubs()">
                                    <i class="fas fa-search"></i>
                                    Discover Clubs
                                </button>
                                <button onclick="gamingEntertainmentFinalUI.browseForums()">
                                    <i class="fas fa-comments"></i>
                                    Browse Forums
                                </button>
                            </div>
                            
                            <div class="online-friends">
                                <h4>${this.t('onlineNow')} (12)</h4>
                                <div class="friends-list" id="online-friends-list"></div>
                            </div>
                        </div>
                        
                        <div class="feed-main">
                            <div class="post-composer">
                                <div class="composer-header">
                                    <img src="/src/assets/user-avatar.jpg" alt="User Avatar" class="composer-avatar">
                                    <input type="text" placeholder="Share your gaming experience..." onclick="gamingEntertainmentFinalUI.showNewPostModal()">
                                </div>
                                <div class="composer-actions">
                                    <button onclick="gamingEntertainmentFinalUI.attachScreenshot()">
                                        <i class="fas fa-image"></i>
                                        Screenshot
                                    </button>
                                    <button onclick="gamingEntertainmentFinalUI.shareAchievement()">
                                        <i class="fas fa-trophy"></i>
                                        Achievement
                                    </button>
                                    <button onclick="gamingEntertainmentFinalUI.shareGameClip()">
                                        <i class="fas fa-video"></i>
                                        Game Clip
                                    </button>
                                </div>
                            </div>
                            
                            <div class="community-feed" id="community-feed"></div>
                        </div>
                        
                        <div class="feed-sidebar-right">
                            <div class="trending-topics">
                                <h4>Trending in Gaming</h4>
                                <div class="trending-list">
                                    <div class="trending-item">#NewGameRelease</div>
                                    <div class="trending-item">#ESports2024</div>
                                    <div class="trending-item">#IndieGaming</div>
                                    <div class="trending-item">#GamingSetup</div>
                                    <div class="trending-item">#RetroGaming</div>
                                </div>
                            </div>
                            
                            <div class="suggested-clubs">
                                <h4>Suggested Clubs</h4>
                                <div class="suggestions-list" id="suggested-clubs-list"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Gaming Clubs Section -->
                    <div id="clubs-section" class="community-section">
                        <div class="clubs-header">
                            <div class="clubs-tabs">
                                <button class="club-tab active" data-tab="my-clubs" onclick="gamingEntertainmentFinalUI.switchClubTab('my-clubs')">
                                    ${this.t('myClubs')}
                                </button>
                                <button class="club-tab" data-tab="discover" onclick="gamingEntertainmentFinalUI.switchClubTab('discover')">
                                    Discover Clubs
                                </button>
                                <button class="club-tab" data-tab="popular" onclick="gamingEntertainmentFinalUI.switchClubTab('popular')">
                                    Popular Clubs
                                </button>
                            </div>
                            
                            <button class="create-club-btn primary-btn" onclick="gamingEntertainmentFinalUI.showCreateClubModal()">
                                <i class="fas fa-plus"></i>
                                ${this.t('createClub')}
                            </button>
                        </div>
                        
                        <div class="clubs-content">
                            <div id="my-clubs-tab" class="club-tab-content active">
                                <div class="clubs-grid" id="my-clubs-grid"></div>
                            </div>
                            
                            <div id="discover-tab" class="club-tab-content">
                                <div class="club-filters">
                                    <select id="club-category-filter">
                                        <option value="all">All Categories</option>
                                        <option value="competitive">Competitive</option>
                                        <option value="casual">Casual</option>
                                        <option value="social">Social</option>
                                        <option value="learning">Learning</option>
                                    </select>
                                    <select id="club-game-filter">
                                        <option value="all">All Games</option>
                                        <option value="fps">FPS Games</option>
                                        <option value="moba">MOBA Games</option>
                                        <option value="rpg">RPG Games</option>
                                        <option value="strategy">Strategy Games</option>
                                    </select>
                                </div>
                                <div class="clubs-grid" id="discover-clubs-grid"></div>
                            </div>
                            
                            <div id="popular-tab" class="club-tab-content">
                                <div class="clubs-grid" id="popular-clubs-grid"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Gaming Friends Section -->
                    <div id="friends-section" class="community-section">
                        <div class="friends-header">
                            <div class="friends-tabs">
                                <button class="friend-tab active" data-tab="all-friends" onclick="gamingEntertainmentFinalUI.switchFriendTab('all-friends')">
                                    All Friends (127)
                                </button>
                                <button class="friend-tab" data-tab="online" onclick="gamingEntertainmentFinalUI.switchFriendTab('online')">
                                    ${this.t('onlineNow')} (12)
                                </button>
                                <button class="friend-tab" data-tab="requests" onclick="gamingEntertainmentFinalUI.switchFriendTab('requests')">
                                    Friend Requests (3)
                                </button>
                            </div>
                            
                            <div class="friends-search">
                                <input type="text" placeholder="Search friends..." id="friends-search-input">
                                <button class="add-friend-btn" onclick="gamingEntertainmentFinalUI.showAddFriendModal()">
                                    <i class="fas fa-user-plus"></i>
                                    Add Friend
                                </button>
                            </div>
                        </div>
                        
                        <div class="friends-content">
                            <div id="all-friends-tab" class="friend-tab-content active">
                                <div class="friends-grid" id="all-friends-grid"></div>
                            </div>
                            
                            <div id="online-tab" class="friend-tab-content">
                                <div class="friends-grid" id="online-friends-grid"></div>
                            </div>
                            
                            <div id="requests-tab" class="friend-tab-content">
                                <div class="friend-requests" id="friend-requests-list"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Gaming Forums Section -->
                    <div id="forums-section" class="community-section">
                        <div class="forums-header">
                            <h3>${this.t('forums')}</h3>
                            <button class="create-topic-btn primary-btn" onclick="gamingEntertainmentFinalUI.showCreateTopicModal()">
                                <i class="fas fa-plus"></i>
                                Create Topic
                            </button>
                        </div>
                        
                        <div class="forums-content">
                            <div class="forum-categories" id="forum-categories"></div>
                            <div class="recent-topics" id="recent-topics"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await this.loadCommunityData();
        this.renderCommunityFeed();
    }

    // =================== MISSING UI 3: GAMING STREAMING/BROADCASTING INTERFACE ===================
    async createGameStreamingInterface(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="game-streaming-interface">
                <div class="streaming-header">
                    <h2 class="streaming-title">
                        <i class="fas fa-broadcast-tower"></i>
                        ${this.t('gameStreaming')}
                    </h2>
                    
                    <div class="streaming-navigation">
                        <button class="nav-btn active" data-section="live-streams" onclick="gamingEntertainmentFinalUI.switchStreamingSection('live-streams')">
                            <i class="fas fa-play-circle"></i>
                            ${this.t('liveStreams')}
                        </button>
                        <button class="nav-btn" data-section="my-stream" onclick="gamingEntertainmentFinalUI.switchStreamingSection('my-stream')">
                            <i class="fas fa-video"></i>
                            ${this.t('myStream')}
                        </button>
                        <button class="nav-btn" data-section="following" onclick="gamingEntertainmentFinalUI.switchStreamingSection('following')">
                            <i class="fas fa-heart"></i>
                            ${this.t('following')}
                        </button>
                        <button class="nav-btn" data-section="categories" onclick="gamingEntertainmentFinalUI.switchStreamingSection('categories')">
                            <i class="fas fa-th-large"></i>
                            ${this.t('categories')}
                        </button>
                    </div>
                    
                    <div class="streaming-actions">
                        <button class="start-stream-btn primary-btn" onclick="gamingEntertainmentFinalUI.toggleStreaming()">
                            <i class="fas fa-broadcast-tower"></i>
                            <span id="stream-toggle-text">${this.t('startStream')}</span>
                        </button>
                    </div>
                </div>

                <div class="streaming-content">
                    <!-- Live Streams Section -->
                    <div id="live-streams-section" class="streaming-section active">
                        <div class="streams-filters">
                            <div class="filter-group">
                                <select id="stream-category-filter" onchange="gamingEntertainmentFinalUI.filterStreams()">
                                    <option value="all">All Games</option>
                                    <option value="fps">FPS Games</option>
                                    <option value="moba">MOBA Games</option>
                                    <option value="rpg">RPG Games</option>
                                    <option value="strategy">Strategy Games</option>
                                    <option value="casual">Casual Games</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <select id="stream-sort-filter" onchange="gamingEntertainmentFinalUI.sortStreams()">
                                    <option value="viewers">Most Viewers</option>
                                    <option value="recent">Recently Started</option>
                                    <option value="trending">Trending</option>
                                    <option value="followed">Followed Streamers</option>
                                </select>
                            </div>
                            
                            <div class="search-streams">
                                <input type="text" id="stream-search-input" placeholder="Search streams..." onkeyup="gamingEntertainmentFinalUI.searchStreams()">
                                <button class="search-btn">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="featured-streams">
                            <h3>${this.t('featured')} ${this.t('liveStreams')}</h3>
                            <div class="featured-stream-carousel" id="featured-streams"></div>
                        </div>
                        
                        <div class="streams-grid" id="live-streams-grid"></div>
                    </div>

                    <!-- My Stream Section -->
                    <div id="my-stream-section" class="streaming-section">
                        <div class="stream-dashboard">
                            <div class="stream-stats">
                                <div class="stat-card">
                                    <div class="stat-icon">👥</div>
                                    <div class="stat-info">
                                        <div class="stat-number" id="current-viewers">0</div>
                                        <div class="stat-label">${this.t('viewers')}</div>
                                    </div>
                                </div>
                                
                                <div class="stat-card">
                                    <div class="stat-icon">❤️</div>
                                    <div class="stat-info">
                                        <div class="stat-number" id="stream-followers">1,234</div>
                                        <div class="stat-label">${this.t('followers')}</div>
                                    </div>
                                </div>
                                
                                <div class="stat-card">
                                    <div class="stat-icon">⏱️</div>
                                    <div class="stat-info">
                                        <div class="stat-number" id="stream-duration">00:00:00</div>
                                        <div class="stat-label">Stream Duration</div>
                                    </div>
                                </div>
                                
                                <div class="stat-card">
                                    <div class="stat-icon">💬</div>
                                    <div class="stat-info">
                                        <div class="stat-number" id="chat-messages">0</div>
                                        <div class="stat-label">Chat Messages</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="stream-preview">
                                <div class="preview-container">
                                    <div class="stream-preview-video" id="stream-preview">
                                        <div class="preview-placeholder">
                                            <i class="fas fa-video-slash"></i>
                                            <p>Stream Preview</p>
                                            <p class="status-text" id="stream-status">Stream Offline</p>
                                        </div>
                                    </div>
                                    
                                    <div class="stream-controls">
                                        <div class="control-group">
                                            <label for="stream-title-input">${this.t('streamTitle')}</label>
                                            <input type="text" id="stream-title-input" placeholder="Enter stream title..." maxlength="100">
                                        </div>
                                        
                                        <div class="control-group">
                                            <label for="stream-category-input">${this.t('streamCategory')}</label>
                                            <select id="stream-category-input">
                                                <option value="">Select game category...</option>
                                                <option value="fps">FPS Games</option>
                                                <option value="moba">MOBA Games</option>
                                                <option value="rpg">RPG Games</option>
                                                <option value="strategy">Strategy Games</option>
                                                <option value="casual">Casual Games</option>
                                            </select>
                                        </div>
                                        
                                        <div class="control-row">
                                            <div class="control-group">
                                                <label for="stream-resolution">${this.t('resolution')}</label>
                                                <select id="stream-resolution">
                                                    <option value="720p">720p</option>
                                                    <option value="1080p" selected>1080p</option>
                                                    <option value="1440p">1440p</option>
                                                </select>
                                            </div>
                                            
                                            <div class="control-group">
                                                <label for="stream-framerate">${this.t('frameRate')}</label>
                                                <select id="stream-framerate">
                                                    <option value="30">30 FPS</option>
                                                    <option value="60" selected>60 FPS</option>
                                                </select>
                                            </div>
                                            
                                            <div class="control-group">
                                                <label for="stream-bitrate">${this.t('bitrate')}</label>
                                                <select id="stream-bitrate">
                                                    <option value="2500">2500 kbps</option>
                                                    <option value="4000" selected>4000 kbps</option>
                                                    <option value="6000">6000 kbps</option>
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <div class="stream-actions-row">
                                            <button class="stream-settings-btn" onclick="gamingEntertainmentFinalUI.showStreamSettings()">
                                                <i class="fas fa-cog"></i>
                                                ${this.t('streamSettings')}
                                            </button>
                                            
                                            <button class="go-live-btn primary-btn" onclick="gamingEntertainmentFinalUI.goLive()">
                                                <i class="fas fa-play"></i>
                                                ${this.t('goLive')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="stream-chat-dashboard">
                            <div class="chat-header">
                                <h4>Stream Chat</h4>
                                <div class="chat-controls">
                                    <button class="chat-control-btn" onclick="gamingEntertainmentFinalUI.toggleChatModerator()">
                                        <i class="fas fa-shield-alt"></i>
                                    </button>
                                    <button class="chat-control-btn" onclick="gamingEntertainmentFinalUI.clearChat()">
                                        <i class="fas fa-broom"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="chat-messages" id="stream-chat-messages">
                                <div class="chat-placeholder">
                                    <i class="fas fa-comments"></i>
                                    <p>Chat messages will appear here when you go live</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Following Section -->
                    <div id="following-section" class="streaming-section">
                        <div class="following-header">
                            <h3>Streamers You Follow (24)</h3>
                            <div class="following-filters">
                                <button class="filter-btn active" data-filter="all">All (24)</button>
                                <button class="filter-btn" data-filter="live">Live (8)</button>
                                <button class="filter-btn" data-filter="offline">Offline (16)</button>
                            </div>
                        </div>
                        
                        <div class="followed-streamers" id="followed-streamers-grid"></div>
                    </div>

                    <!-- Categories Section -->
                    <div id="categories-section" class="streaming-section">
                        <div class="categories-header">
                            <h3>Browse by Game Category</h3>
                        </div>
                        
                        <div class="categories-grid" id="stream-categories-grid"></div>
                    </div>
                </div>

                <!-- Stream Detail Modal -->
                <div id="stream-detail-modal" class="modal-overlay" style="display: none;">
                    <div class="modal-content stream-detail-content">
                        <div class="modal-header">
                            <h3 id="stream-detail-title">Stream Title</h3>
                            <button class="close-modal" onclick="gamingEntertainmentFinalUI.closeStreamDetail()">×</button>
                        </div>
                        
                        <div class="modal-body">
                            <div class="stream-player-container">
                                <div class="stream-player" id="stream-player">
                                    <video controls width="100%" height="400">
                                        <source src="" type="video/mp4">
                                        Your browser does not support the video tag.
                                    </video>
                                    
                                    <div class="player-overlay">
                                        <div class="player-controls">
                                            <button class="control-btn" onclick="gamingEntertainmentFinalUI.toggleFullscreen()">
                                                <i class="fas fa-expand"></i>
                                            </button>
                                            <div class="volume-control">
                                                <button class="control-btn">
                                                    <i class="fas fa-volume-up"></i>
                                                </button>
                                                <input type="range" class="volume-slider" min="0" max="100" value="50">
                                            </div>
                                            <div class="quality-selector">
                                                <select>
                                                    <option value="720p">720p</option>
                                                    <option value="1080p" selected>1080p</option>
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <div class="stream-info-overlay">
                                            <div class="viewer-count">👥 1,234 viewers</div>
                                            <div class="stream-duration">⏱️ 2:34:12</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="stream-info">
                                    <div class="streamer-info">
                                        <img src="/src/assets/streamer-avatar.jpg" alt="Streamer" class="streamer-avatar">
                                        <div class="streamer-details">
                                            <h4 class="streamer-name" id="modal-streamer-name">Streamer Name</h4>
                                            <p class="stream-category" id="modal-stream-category">Playing: Game Category</p>
                                            <p class="follower-count">1,234 followers</p>
                                        </div>
                                        <div class="streamer-actions">
                                            <button class="follow-btn primary-btn" onclick="gamingEntertainmentFinalUI.toggleFollow()">
                                                <i class="fas fa-heart"></i>
                                                ${this.t('follow')}
                                            </button>
                                            <button class="subscribe-btn" onclick="gamingEntertainmentFinalUI.showSubscribeModal()">
                                                <i class="fas fa-star"></i>
                                                ${this.t('subscribe')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="stream-chat-container">
                                <div class="chat-header">
                                    <h4>${this.t('chat')}</h4>
                                </div>
                                
                                <div class="chat-messages" id="modal-chat-messages"></div>
                                
                                <div class="chat-input-container">
                                    <input type="text" id="modal-chat-input" placeholder="Type a message..." onkeypress="gamingEntertainmentFinalUI.handleModalChatKeyPress(event)">
                                    <button onclick="gamingEntertainmentFinalUI.sendModalChatMessage()">
                                        <i class="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await this.loadStreamingData();
        this.renderLiveStreams();
    }

    // =================== GAMING STORE UTILITY FUNCTIONS ===================
    
    async loadGamesData() {
        try {
            // Mock games data
            const mockGames = [
                {
                    id: 'game001',
                    title: 'Epic Adventure Quest',
                    price: 39.99,
                    originalPrice: 59.99,
                    discount: 33,
                    rating: 4.8,
                    reviews: 1250,
                    category: 'adventure',
                    genre: ['Adventure', 'RPG'],
                    developer: 'Epic Studios',
                    publisher: 'Game Publisher',
                    releaseDate: '2024-01-15',
                    image: '/src/assets/game1.jpg',
                    featured: true,
                    onSale: true
                },
                {
                    id: 'game002',
                    title: 'Space Strategy Commander',
                    price: 29.99,
                    originalPrice: 29.99,
                    discount: 0,
                    rating: 4.6,
                    reviews: 890,
                    category: 'strategy',
                    genre: ['Strategy', 'Simulation'],
                    developer: 'Space Games Inc',
                    publisher: 'Strategy Masters',
                    releaseDate: '2024-02-01',
                    image: '/src/assets/game2.jpg',
                    featured: false,
                    newRelease: true
                }
                // Add more mock games as needed
            ];
            
            this.gameStore.games = mockGames;
        } catch (error) {
            console.error('Error loading games data:', error);
        }
    }

    renderFeaturedSection() {
        // Render featured banner, new releases, top selling, and on sale games
        const featuredGame = this.gameStore.games.find(g => g.featured);
        if (featuredGame) {
            document.getElementById('featured-game-title').textContent = featuredGame.title;
            document.getElementById('featured-game-description').textContent = featuredGame.description || 'Amazing gaming experience awaits...';
        }
        
        // Render horizontal scrolls for each category
        this.renderHorizontalGameScroll('new-releases', this.gameStore.games.filter(g => g.newRelease));
        this.renderHorizontalGameScroll('top-selling', this.gameStore.games.slice(0, 6));
        this.renderHorizontalGameScroll('on-sale', this.gameStore.games.filter(g => g.onSale));
    }

    renderHorizontalGameScroll(containerId, games) {
        const container = document.getElementById(containerId);
        if (!container || !games) return;

        container.innerHTML = games.map(game => `
            <div class="game-card-horizontal" onclick="gamingEntertainmentFinalUI.showGameDetail('${game.id}')">
                <div class="game-image">
                    <img src="${game.image}" alt="${game.title}">
                    ${game.discount > 0 ? `<div class="discount-badge">-${game.discount}%</div>` : ''}
                </div>
                <div class="game-info">
                    <h4 class="game-title">${game.title}</h4>
                    <div class="game-rating">
                        <div class="stars">★★★★★</div>
                        <span class="rating-text">${game.rating} (${game.reviews})</span>
                    </div>
                    <div class="game-price">
                        ${game.discount > 0 ? 
                            `<span class="original-price">$${game.originalPrice}</span>
                             <span class="sale-price">$${game.price}</span>` :
                            `<span class="current-price">$${game.price}</span>`
                        }
                    </div>
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); gamingEntertainmentFinalUI.addToCart('${game.id}')">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // =================== GAMING COMMUNITY UTILITY FUNCTIONS ===================
    
    async loadCommunityData() {
        try {
            // Mock community data
            const mockPosts = [
                {
                    id: 'post001',
                    author: 'GamerPro123',
                    avatar: '/src/assets/avatar1.jpg',
                    content: 'Just completed an amazing quest in Epic Adventure! 🏆',
                    timestamp: Date.now() - 3600000,
                    likes: 24,
                    comments: 8,
                    game: 'Epic Adventure Quest',
                    type: 'achievement'
                },
                {
                    id: 'post002',
                    author: 'StrategyMaster',
                    avatar: '/src/assets/avatar2.jpg',
                    content: 'Looking for team members for tonight\'s tournament. DM me! 🎮',
                    timestamp: Date.now() - 7200000,
                    likes: 15,
                    comments: 12,
                    game: 'Strategy Commander',
                    type: 'social'
                }
            ];
            
            this.gamingCommunity.posts = mockPosts;
        } catch (error) {
            console.error('Error loading community data:', error);
        }
    }

    renderCommunityFeed() {
        const container = document.getElementById('community-feed');
        if (!container) return;

        container.innerHTML = this.gamingCommunity.posts.map(post => `
            <div class="community-post">
                <div class="post-header">
                    <img src="${post.avatar}" alt="${post.author}" class="post-avatar">
                    <div class="post-info">
                        <h4 class="post-author">${post.author}</h4>
                        <p class="post-timestamp">${this.formatTimestamp(post.timestamp)}</p>
                        ${post.game ? `<p class="post-game">Playing: ${post.game}</p>` : ''}
                    </div>
                </div>
                
                <div class="post-content">
                    <p>${post.content}</p>
                </div>
                
                <div class="post-actions">
                    <button class="post-action-btn" onclick="gamingEntertainmentFinalUI.likePost('${post.id}')">
                        <i class="fas fa-heart"></i>
                        <span>${post.likes}</span>
                    </button>
                    <button class="post-action-btn" onclick="gamingEntertainmentFinalUI.commentPost('${post.id}')">
                        <i class="fas fa-comment"></i>
                        <span>${post.comments}</span>
                    </button>
                    <button class="post-action-btn" onclick="gamingEntertainmentFinalUI.sharePost('${post.id}')">
                        <i class="fas fa-share"></i>
                        Share
                    </button>
                </div>
            </div>
        `).join('');
    }

    // =================== GAMING STREAMING UTILITY FUNCTIONS ===================
    
    async loadStreamingData() {
        try {
            // Mock streaming data
            const mockStreams = [
                {
                    id: 'stream001',
                    streamerName: 'ProGamer_TV',
                    streamTitle: 'Epic Boss Battle - Road to Victory!',
                    game: 'Epic Adventure Quest',
                    viewers: 1234,
                    category: 'adventure',
                    thumbnail: '/src/assets/stream1.jpg',
                    avatar: '/src/assets/streamer1.jpg',
                    isLive: true,
                    duration: '02:34:12',
                    featured: true
                },
                {
                    id: 'stream002',
                    streamerName: 'StrategyQueen',
                    streamTitle: 'Building the Ultimate Empire',
                    game: 'Space Strategy Commander',
                    viewers: 856,
                    category: 'strategy',
                    thumbnail: '/src/assets/stream2.jpg',
                    avatar: '/src/assets/streamer2.jpg',
                    isLive: true,
                    duration: '01:45:30',
                    featured: false
                }
            ];
            
            this.gameStreaming.liveStreams = mockStreams;
        } catch (error) {
            console.error('Error loading streaming data:', error);
        }
    }

    renderLiveStreams() {
        const container = document.getElementById('live-streams-grid');
        if (!container) return;

        container.innerHTML = this.gameStreaming.liveStreams.map(stream => `
            <div class="stream-card" onclick="gamingEntertainmentFinalUI.openStream('${stream.id}')">
                <div class="stream-thumbnail">
                    <img src="${stream.thumbnail}" alt="${stream.streamTitle}">
                    <div class="stream-overlay">
                        <div class="live-indicator">LIVE</div>
                        <div class="viewer-count">👥 ${stream.viewers}</div>
                        <div class="stream-duration">⏱️ ${stream.duration}</div>
                    </div>
                </div>
                
                <div class="stream-info">
                    <div class="streamer-avatar">
                        <img src="${stream.avatar}" alt="${stream.streamerName}">
                    </div>
                    <div class="stream-details">
                        <h4 class="stream-title">${stream.streamTitle}</h4>
                        <p class="streamer-name">${stream.streamerName}</p>
                        <p class="stream-game">${stream.game}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // =================== EVENT HANDLERS ===================
    
    switchStoreSection(section) {
        document.querySelectorAll('.store-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        
        document.getElementById(`${section}-section`).classList.add('active');
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
    }

    switchCommunitySection(section) {
        document.querySelectorAll('.community-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        
        document.getElementById(`${section}-section`).classList.add('active');
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
    }

    switchStreamingSection(section) {
        document.querySelectorAll('.streaming-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        
        document.getElementById(`${section}-section`).classList.add('active');
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
    }

    addToCart(gameId) {
        const game = this.gameStore.games.find(g => g.id === gameId);
        if (game && !this.gameStore.cart.find(item => item.id === gameId)) {
            this.gameStore.cart.push(game);
            this.updateCartCount();
            this.showNotification(`${game.title} added to cart!`, 'success');
        }
    }

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = this.gameStore.cart.length;
        }
    }

    toggleStreaming() {
        this.isStreaming = !this.isStreaming;
        const toggleText = document.getElementById('stream-toggle-text');
        if (toggleText) {
            toggleText.textContent = this.isStreaming ? this.t('endStream') : this.t('startStream');
        }
    }

    formatTimestamp(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ago`;
        } else {
            return `${minutes}m ago`;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    refreshAllInterfaces() {
        // Refresh all interfaces when language changes
        const storeInterface = document.querySelector('.gaming-store-interface');
        const communityInterface = document.querySelector('.gaming-community-interface');
        const streamingInterface = document.querySelector('.game-streaming-interface');
        
        if (storeInterface && storeInterface.parentNode) {
            this.createGamingStoreInterface(storeInterface.parentNode.id);
        }
        
        if (communityInterface && communityInterface.parentNode) {
            this.createGamingCommunityInterface(communityInterface.parentNode.id);
        }
        
        if (streamingInterface && streamingInterface.parentNode) {
            this.createGameStreamingInterface(streamingInterface.parentNode.id);
        }
    }

    // =================== ADDITIONAL UTILITY FUNCTIONS ===================
    
    // Store functions
    searchGames() {
        const searchTerm = document.getElementById('store-search-input').value.toLowerCase();
        const filteredGames = this.gameStore.games.filter(game => 
            game.title.toLowerCase().includes(searchTerm) ||
            game.developer.toLowerCase().includes(searchTerm) ||
            game.genre.some(g => g.toLowerCase().includes(searchTerm))
        );
        this.renderGamesGrid(filteredGames);
    }
    
    filterGames() {
        const category = document.getElementById('category-filter').value;
        const price = document.getElementById('price-filter').value;
        const rating = document.getElementById('rating-filter').value;
        
        let filteredGames = [...this.gameStore.games];
        
        if (category !== 'all') {
            filteredGames = filteredGames.filter(game => game.category === category);
        }
        
        if (price !== 'all') {
            filteredGames = filteredGames.filter(game => {
                switch(price) {
                    case 'free': return game.price === 0;
                    case 'under-10': return game.price < 10;
                    case 'under-30': return game.price < 30;
                    case 'under-60': return game.price < 60;
                    default: return true;
                }
            });
        }
        
        if (rating !== 'all') {
            const minRating = parseFloat(rating);
            filteredGames = filteredGames.filter(game => game.rating >= minRating);
        }
        
        this.renderGamesGrid(filteredGames);
    }
    
    switchView(view) {
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        if (view === 'grid') {
            document.getElementById('games-grid').classList.add('active');
            document.getElementById('games-list').classList.remove('active');
        } else {
            document.getElementById('games-list').classList.add('active');
            document.getElementById('games-grid').classList.remove('active');
        }
        this.currentView = view;
    }
    
    renderGamesGrid(games) {
        const gridContainer = document.getElementById('games-grid');
        const listContainer = document.getElementById('games-list');
        
        if (gridContainer) {
            gridContainer.innerHTML = games.map(game => `
                <div class="game-card" onclick="gamingEntertainmentFinalUI.showGameDetail('${game.id}')">
                    <div class="game-image">
                        <img src="${game.image}" alt="${game.title}">
                        ${game.discount > 0 ? `<div class="discount-badge">-${game.discount}%</div>` : ''}
                    </div>
                    <div class="game-info">
                        <h4 class="game-title">${game.title}</h4>
                        <div class="game-rating">★★★★★ ${game.rating}</div>
                        <div class="game-price">
                            ${game.discount > 0 ? 
                                `<span class="original-price">$${game.originalPrice}</span>
                                 <span class="sale-price">$${game.price}</span>` :
                                `<span class="current-price">$${game.price}</span>`
                            }
                        </div>
                        <button class="add-to-cart-btn" onclick="event.stopPropagation(); gamingEntertainmentFinalUI.addToCart('${game.id}')">
                            Add to Cart
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Community functions
    showNewPostModal() { alert('New post modal - Implementation needed'); }
    findGamingFriends() { alert('Find gaming friends - Implementation needed'); }
    discoverClubs() { alert('Discover clubs - Implementation needed'); }
    browseForums() { alert('Browse forums - Implementation needed'); }
    switchClubTab(tab) { console.log('Switch club tab:', tab); }
    switchFriendTab(tab) { console.log('Switch friend tab:', tab); }
    showCreateClubModal() { alert('Create club modal - Implementation needed'); }
    showAddFriendModal() { alert('Add friend modal - Implementation needed'); }
    showCreateTopicModal() { alert('Create topic modal - Implementation needed'); }
    likePost(postId) { console.log('Like post:', postId); }
    commentPost(postId) { console.log('Comment post:', postId); }
    sharePost(postId) { console.log('Share post:', postId); }
    attachScreenshot() { alert('Attach screenshot - Implementation needed'); }
    shareAchievement() { alert('Share achievement - Implementation needed'); }
    shareGameClip() { alert('Share game clip - Implementation needed'); }
    
    // Streaming functions
    filterStreams() { console.log('Filter streams'); }
    sortStreams() { console.log('Sort streams'); }
    searchStreams() { console.log('Search streams'); }
    showStreamSettings() { alert('Stream settings - Implementation needed'); }
    goLive() { 
        this.isStreaming = true;
        document.getElementById('stream-status').textContent = 'Stream Live';
        alert('Going live - Implementation needed'); 
    }
    toggleChatModerator() { console.log('Toggle chat moderator'); }
    clearChat() { console.log('Clear chat'); }
    openStream(streamId) { 
        document.getElementById('stream-detail-modal').style.display = 'flex';
        console.log('Open stream:', streamId); 
    }
    closeStreamDetail() { 
        document.getElementById('stream-detail-modal').style.display = 'none'; 
    }
    toggleFullscreen() { console.log('Toggle fullscreen'); }
    toggleFollow() { console.log('Toggle follow'); }
    showSubscribeModal() { alert('Subscribe modal - Implementation needed'); }
    handleModalChatKeyPress(event) {
        if (event.key === 'Enter') {
            this.sendModalChatMessage();
        }
    }
    sendModalChatMessage() {
        const input = document.getElementById('modal-chat-input');
        if (input.value.trim()) {
            console.log('Send chat message:', input.value);
            input.value = '';
        }
    }
    
    // Store functions continued
    showGameDetail(gameId) { 
        document.getElementById('game-detail-modal').style.display = 'flex';
        console.log('Show game detail:', gameId); 
    }
    closeGameDetail() { 
        document.getElementById('game-detail-modal').style.display = 'none'; 
    }
    toggleWishlist() { console.log('Toggle wishlist'); }
    addToCartFromDetail() { console.log('Add to cart from detail'); }
    purchaseGame() { alert('Purchase game - Implementation needed'); }
    clearCart() { 
        this.gameStore.cart = [];
        this.updateCartCount();
    }
    checkout() { alert('Checkout - Implementation needed'); }
    previousPage() { console.log('Previous page'); }
    nextPage() { console.log('Next page'); }
}

// =================== GLOBAL INITIALIZATION ===================

// Initialize the gaming entertainment final UI components when DOM is ready
let gamingEntertainmentFinalUI;

document.addEventListener('DOMContentLoaded', function() {
    gamingEntertainmentFinalUI = new GamingEntertainmentFinalUIComponents();
});

// Make it globally available
window.GamingEntertainmentFinalUIComponents = GamingEntertainmentFinalUIComponents;
window.gamingEntertainmentFinalUI = gamingEntertainmentFinalUI;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamingEntertainmentFinalUIComponents;
}
