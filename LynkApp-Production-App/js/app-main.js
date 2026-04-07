
        // DEMO LOGIN: Bypass Firebase auth for review/testing purposes
        function demoLogin() {
            // 1. Hide the login screen
            var loginScreen = document.getElementById('loginScreen');
            if (loginScreen) {
                loginScreen.style.display = 'none';
            }
            
            // 2. Show the main app container
            var appContainer = document.querySelector('.app-container');
            if (appContainer) {
                appContainer.style.display = 'block';
                appContainer.style.visibility = 'visible';
                appContainer.style.opacity = '1';
            }
            
            // Also remove hidden class from anything that's hidden but should show
            document.querySelectorAll('.app-container, .bottom-nav, .top-nav').forEach(function(el) {
                el.classList.remove('hidden');
                el.style.display = '';
            });
            
            // 3. Navigate to feed screen
            if (typeof openScreen === 'function') {
                openScreen('feed');
            }
            
            // 4. Show welcome toast
            if (typeof showToast === 'function') {
                showToast('Welcome to LynkApp Demo! 🎉');
            }
        }

        let currentScreen = 'feed';
        let currentMainTab = 'feed';
        let currentBottomTab = 'social';

        // Switch between pill navigation tabs (Feed, Stories, Live, Trending, Groups)
        function switchPillTab(element, tab) {
            // Remove active class from all pill buttons
            document.querySelectorAll('.pill-nav-button').forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            element.classList.add('active');
            
            // Show corresponding screen
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(tab + '-screen').classList.add('active');
            
            currentMainTab = tab;
            currentScreen = tab;
        }

        // Open music player from navigation bar
        function openMusicPlayer(element) {
            // Remove active class from all pill buttons
            document.querySelectorAll('.pill-nav-button').forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked music button
            if (element) {
                element.classList.add('active');
            }
            
            // Show music player screen
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            const musicPlayerScreen = document.getElementById('musicPlayer-screen');
            if (musicPlayerScreen) {
                musicPlayerScreen.classList.add('active');
            }
            
            currentScreen = 'musicPlayer';
            showToast('🎵 Music Player opened');
        }

        // Switch between top navigation tabs (Feed, Stories, Live, Trending, Groups)
        function switchMainTab(tab) {
            // Update nav tabs
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            event.currentTarget.classList.add('active');
            
            // Show corresponding screen
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(tab + '-screen').classList.add('active');
            
            currentMainTab = tab;
            currentScreen = tab;
        }

        // Switch between bottom navigation tabs (Social, Dating, Messages, Media, Friends)
        function switchBottomTab(tab) {
            // Update nav items
            document.querySelectorAll('.bottom-nav .nav-item').forEach(item => item.classList.remove('active'));
            event.currentTarget.classList.add('active');
            
            // Map bottom tabs to screens
            let screenMap = {
                'social': 'feed',
                'dating': 'dating',
                'messages': 'messages',
                'media': 'media',
                'friends': 'friends'
            };
            
            let screenToShow = screenMap[tab];
            
            // Hide all screens
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            
            // Show selected screen
            document.getElementById(screenToShow + '-screen').classList.add('active');
            
            // Reset top nav tabs when switching to social
            if (tab === 'social') {
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                document.querySelector('.nav-tab').classList.add('active');
                currentMainTab = 'feed';
            }
            
            currentBottomTab = tab;
            currentScreen = screenToShow;
        }

        // Switch between main screens (legacy support)
        function switchScreen(screen) {
            // Hide all screens
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            
            // Show selected screen
            document.getElementById(screen + '-screen').classList.add('active');
            
            currentScreen = screen;
        }

        // Open a screen from anywhere
        function openScreen(screen) {
            // Close any open modals
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
            
            // Hide all screens
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            
            // Show selected screen
            document.getElementById(screen + '-screen').classList.add('active');
            
            currentScreen = screen;
        }

        // Modal functions
        function openModal(type) {
            const modal = document.getElementById(type + 'Modal');
            if (modal) {
                modal.classList.add('show');
            }
        }

        function closeModal(type) {
            const modal = document.getElementById(type + 'Modal');
            if (modal) {
                modal.classList.remove('show');
            }
        }

        // Toast notification
        function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);
        }

        // Post actions
        function toggleLikePost(button) {
            button.classList.toggle('active');
            const icon = button.querySelector('span');
            if (button.classList.contains('active')) {
                icon.textContent = '❤️';
                showToast('Liked!');
            } else {
                icon.textContent = '👍';
            }
        }

        function sharePost() {
            openModal('sharePost');
        }
        
        // FIX: submitActualPost is an alias for publishPost (Post button was broken)
        function submitActualPost() {
            publishPost();
        }

        function publishPost() {
            closeModal('createPost');
            showToast('Post published!');
        }

        function selectFeeling(feeling) {
            closeModal('addFeeling');
            showToast(`Feeling ${feeling}`);
        }

        // Toggle switch
        function toggleSwitch(element) {
            element.classList.toggle('active');
        }

        // Search functionality
        function handleSearch(value) {
            const defaultView = document.getElementById('searchDefault');
            const resultsView = document.getElementById('searchResults');
            
            if (value.trim().length > 0) {
                defaultView.style.display = 'none';
                resultsView.style.display = 'block';
            } else {
                defaultView.style.display = 'block';
                resultsView.style.display = 'none';
            }
        }

        function clearSearch() {
            const searchInput = document.getElementById('mainSearchInput');
            searchInput.value = '';
            handleSearch('');
            showToast('Search cleared');
        }

        function clearRecentSearches() {
            // Get all recent search items and remove them
            const searchDefault = document.getElementById('searchDefault');
            const recentSearchItems = searchDefault.querySelectorAll('.list-item');
            recentSearchItems.forEach((item, index) => {
                // Only remove the first two items (recent searches, not trending or quick links)
                if (index < 2) {
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.remove();
                    }, 200);
                }
            });
            showToast('Recent searches cleared');
        }

        function removeSearch(element) {
            element.parentElement.style.opacity = '0';
            setTimeout(() => {
                element.parentElement.remove();
                showToast('Removed from recent searches');
            }, 200);
        }

        function performSearch(query) {
            const searchInput = document.getElementById('mainSearchInput');
            searchInput.value = query;
            handleSearch(query);
            showToast(`Searching for: ${query}`);
        }

        // Notification actions
        function markAllAsRead() {
            const unreadNotifications = document.querySelectorAll('#notifications-screen .notification-item.unread');
            unreadNotifications.forEach(item => {
                item.classList.remove('unread');
            });
            showToast('All notifications marked as read');
        }

        function goToPost(element) {
            // Remove unread status
            element.classList.remove('unread');
            
            // Get notification type from the icon
            const icon = element.querySelector('.notification-icon').textContent.trim();
            
            // Navigate based on notification type
            if (icon === '👍' || icon === '💬') {
                // Like or comment notification - go to feed
                closeModal('notifications');
                openScreen('feed');
                showToast('Navigating to post...');
            } else if (icon === '👥') {
                // Friend request - go to friends screen
                openScreen('friends');
                showToast('Opening friend requests...');
            } else if (icon === '📅') {
                // Event notification - open event details
                openScreen('events');
                showToast('Opening event details...');
            } else if (icon === '🎮') {
                // Gaming notification - go to gaming screen
                openScreen('gaming');
                showToast('Opening gaming hub...');
            } else {
                // Default action
                showToast('Opening content...');
            }
        }

        // Message actions
        function sendMessage() {
            showToast('Message sent!');
        }

        // Camera functions
        let isRecording = false;
        
        function toggleRecording() {
            isRecording = !isRecording;
            if (isRecording) {
                showToast('Recording started');
            } else {
                showToast('Recording stopped');
            }
        }

        function switchCamera() {
            showToast('Camera switched');
        }

        function openGallery() {
            showToast('Gallery opened');
        }

        function selectAR(effect) {
            closeModal('arFeatures');
            showToast(`AR effect applied: ${effect}`);
        }

        // Profile actions
        function saveProfile() {
            closeModal('editProfile');
            showToast('Profile updated!');
        }

        function shareProfile() {
            showToast('Profile link copied!');
        }

        // Friend actions
        function addFriend(button) {
            button.textContent = '✓ Request Sent';
            button.style.background = 'var(--success)';
            showToast('Friend request sent!');
        }

        function removeSuggestion(button) {
            button.parentElement.parentElement.style.opacity = '0';
            setTimeout(() => {
                button.parentElement.parentElement.remove();
                showToast('Suggestion removed');
            }, 200);
        }

        // Dating actions
        function passDatingProfile() {
            showToast('Passed');
        }

        function likeDatingProfile() {
            showToast('Liked! 💚');
        }

        function superLike() {
            showToast('Super Liked! ⭐');
        }

        // Event actions
        function markInterested() {
            showToast('Marked as interested');
        }

        function shareEvent() {
            showToast('Event shared!');
        }

        // Gaming actions
        function playGame(game) {
            // Open the game interface modal
            openModal('gameInterface');
            
            // Update the game interface based on which game was selected
            const gameTitle = document.getElementById('gameInterfaceTitle');
            const gameContent = document.getElementById('gameInterfaceContent');
            
            const games = {
                'puzzle': { title: '🧩 Puzzle Master', content: 'Match 3 or more blocks to clear them!' },
                'racing': { title: '🏎️ Speed Racer', content: 'Race to the finish line!' },
                'cards': { title: '🃏 Card Champion', content: 'Beat the dealer in this card game!' },
                'trivia': { title: '🧠 Trivia Master', content: 'Answer questions to win!' }
            };
            
            const selectedGame = games[game] || { title: '🎮 Game', content: 'Loading game...' };
            gameTitle.textContent = selectedGame.title;
            gameContent.innerHTML = `
                <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); height: 300px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 64px; margin-bottom: 20px;">
                    <div style="font-size: 80px; margin-bottom: 20px;">${selectedGame.title.split(' ')[0]}</div>
                    <button class="btn" style="width: auto; padding: 16px 40px; font-size: 18px;" onclick="startGame('${game}')">
                        ▶️ Start Game
                    </button>
                </div>
                <div style="font-size: 16px; text-align: center; color: var(--text-secondary); margin-bottom: 20px;">
                    ${selectedGame.content}
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">Level 5</div>
                        <div class="stat-label">Current Level</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">2,450</div>
                        <div class="stat-label">High Score</div>
                    </div>
                </div>
            `;
            
            showToast(`Loading ${game}...`);
        }
        
        // Start game function
        function startGame(game) {
            closeModal('gameInterface');
            showToast(`🎮 Starting ${game}... Game will begin!`);
            
            // Simulate game starting
            setTimeout(() => {
                showToast('🎉 Game started! Good luck!');
            }, 1000);
        }

        // Initialize
        window.addEventListener('load', () => {
            console.log('LynkApp Complete Prototype Loaded');
        });

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                const modalId = e.target.id.replace('Modal', '');
                closeModal(modalId);
            }
        });

        // ========== MARKETPLACE FUNCTIONALITY ==========
        
        // Marketplace Sample Data
        const marketplaceListings = [
            { id: 1, title: 'MacBook Pro 2023', price: 1200, category: 'electronics', emoji: '💻', seller: 'Sarah M', rating: 4.9, description: 'Like new MacBook Pro with M2 chip, 16GB RAM, 512GB SSD.', condition: 'like-new', gradient: 'linear-gradient(135deg, var(--primary), var(--secondary))' },
            { id: 2, title: 'Wireless Headphones', price: 120, category: 'electronics', emoji: '🎧', seller: 'Mike J', rating: 4.8, description: 'Premium wireless headphones with noise cancellation.', condition: 'good', gradient: 'linear-gradient(135deg, var(--success), var(--accent))' },
            { id: 3, title: 'Vintage Camera', price: 450, category: 'electronics', emoji: '📷', seller: 'Emma W', rating: 5.0, description: 'Classic film camera in excellent condition.', condition: 'good', gradient: 'linear-gradient(135deg, var(--warning), var(--error))' },
            { id: 4, title: 'Gaming Console', price: 350, category: 'electronics', emoji: '🎮', seller: 'John D', rating: 4.7, description: 'Latest gaming console with 2 controllers.', condition: 'like-new', gradient: 'linear-gradient(135deg, var(--secondary), var(--primary))' },
            { id: 5, title: 'Smart Watch', price: 180, category: 'electronics', emoji: '⌚', seller: 'Lisa G', rating: 4.9, description: 'Fitness tracking, heart rate monitor, waterproof.', condition: 'good', gradient: 'linear-gradient(135deg, var(--accent), var(--success))' },
            { id: 6, title: 'Winter Jacket', price: 85, category: 'clothing', emoji: '🧥', seller: 'Anna K', rating: 4.6, description: 'Warm winter jacket, size L.', condition: 'like-new', gradient: 'linear-gradient(135deg, var(--error), var(--warning))' },
            { id: 7, title: 'Running Shoes', price: 65, category: 'sports', emoji: '👟', seller: 'Tom R', rating: 4.5, description: 'Professional running shoes, size 10.', condition: 'good', gradient: 'linear-gradient(135deg, var(--primary), var(--accent))' },
            { id: 8, title: 'Coffee Maker', price: 45, category: 'home', emoji: '☕', seller: 'Kate M', rating: 4.8, description: 'Programmable coffee maker with grinder.', condition: 'good', gradient: 'linear-gradient(135deg, var(--warning), var(--primary))' },
            { id: 9, title: 'Office Chair', price: 150, category: 'home', emoji: '🪑', seller: 'David L', rating: 4.7, description: 'Ergonomic office chair with lumbar support.', condition: 'like-new', gradient: 'linear-gradient(135deg, var(--success), var(--primary))' },
            { id: 10, title: 'Guitar', price: 280, category: 'music', emoji: '🎸', seller: 'Sarah M', rating: 5.0, description: 'Acoustic guitar with case.', condition: 'good', gradient: 'linear-gradient(135deg, var(--secondary), var(--accent))' },
            { id: 11, title: 'Desk Lamp', price: 35, category: 'home', emoji: '💡', seller: 'Mike J', rating: 4.6, description: 'LED desk lamp with adjustable brightness.', condition: 'new', gradient: 'linear-gradient(135deg, var(--accent), var(--warning))' },
            { id: 12, title: 'Backpack', price: 55, category: 'other', emoji: '🎒', seller: 'Emma W', rating: 4.8, description: 'Durable travel backpack with laptop compartment.', condition: 'like-new', gradient: 'linear-gradient(135deg, var(--primary), var(--success))' },
            { id: 13, title: 'Cookbook Collection', price: 40, category: 'books', emoji: '📚', seller: 'Lisa G', rating: 4.9, description: 'Set of 5 professional cookbooks.', condition: 'good', gradient: 'linear-gradient(135deg, var(--warning), var(--secondary))' },
            { id: 14, title: 'Yoga Mat', price: 25, category: 'sports', emoji: '🧘', seller: 'Anna K', rating: 4.7, description: 'Premium yoga mat with carry strap.', condition: 'like-new', gradient: 'linear-gradient(135deg, var(--success), var(--accent))' },
            { id: 15, title: 'Board Game Set', price: 30, category: 'toys', emoji: '🎲', seller: 'John D', rating: 4.8, description: 'Collection of 3 popular board games.', condition: 'good', gradient: 'linear-gradient(135deg, var(--error), var(--primary))' },
            { id: 16, title: 'Plant Pots', price: 20, category: 'home', emoji: '🪴', seller: 'Kate M', rating: 4.6, description: 'Set of 4 ceramic plant pots.', condition: 'new', gradient: 'linear-gradient(135deg, var(--accent), var(--success))' },
        ];

        // Marketplace State
        let marketplaceCart = [];
        let marketplaceWishlist = [];
        let marketplaceNotificationCount = 3;
        let currentMarketplaceItem = null;

        // Initialize marketplace when screen opens
        function initializeMarketplace() {
            marketplaceRenderListings();
            marketplaceUpdateCartBadge();
        }

        // Render marketplace listings
        function marketplaceRenderListings() {
            const grid = document.getElementById('marketplaceListingsGrid');
            if (!grid) return;
            
            grid.innerHTML = marketplaceListings.map(item => `
                <div class="listing-card" onclick="marketplaceOpenItemDetails(${item.id})" style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; overflow: hidden; cursor: pointer; transition: all 0.3s;">
                    <div style="width: 100%; height: 140px; background: ${item.gradient}; display: flex; align-items: center; justify-content: center; font-size: 48px; position: relative;">
                        ${item.emoji}
                        <div onclick="event.stopPropagation(); marketplaceToggleWishlist(${item.id})" style="position: absolute; top: 8px; right: 8px; width: 32px; height: 32px; border-radius: 50%; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer;">
                            ${marketplaceWishlist.includes(item.id) ? '❤️' : '🤍'}
                        </div>
                    </div>
                    <div style="padding: 12px;">
                        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</div>
                        <div style="font-size: 18px; font-weight: 800; color: var(--primary); margin-bottom: 4px;">$${item.price}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${item.condition} • ${item.seller}</div>
                    </div>
                </div>
            `).join('');
        }

        // Switch marketplace tabs
        function marketplaceSwitchTab(tab) {
            document.querySelectorAll('#marketplace-screen .pill-nav-button').forEach(btn => btn.classList.remove('active'));
            event.currentTarget.classList.add('active');

            document.querySelectorAll('#marketplace-screen .tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById('marketplace-' + tab + '-tab').classList.add('active');

            if (tab === 'wishlist') {
                marketplaceRenderWishlist();
            } else if (tab === 'selling') {
                marketplaceRenderMyListings();
            }
        }

        // Toggle wishlist
        function marketplaceToggleWishlist(id) {
            const index = marketplaceWishlist.indexOf(id);
            if (index > -1) {
                marketplaceWishlist.splice(index, 1);
                showToast('Removed from wishlist');
            } else {
                marketplaceWishlist.push(id);
                showToast('Added to wishlist ❤️');
            }
            marketplaceRenderListings();
            marketplaceRenderWishlist();
        }

        // Render wishlist
        function marketplaceRenderWishlist() {
            const items = marketplaceListings.filter(item => marketplaceWishlist.includes(item.id));
            const grid = document.getElementById('marketplaceWishlistGrid');
            const empty = document.getElementById('marketplaceEmptyWishlist');

            if (items.length === 0) {
                grid.innerHTML = '';
                empty.style.display = 'block';
            } else {
                empty.style.display = 'none';
                grid.innerHTML = items.map(item => `
                    <div class="listing-card" onclick="marketplaceOpenItemDetails(${item.id})" style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; overflow: hidden; cursor: pointer;">
                        <div style="width: 100%; height: 140px; background: ${item.gradient}; display: flex; align-items: center; justify-content: center; font-size: 48px; position: relative;">
                            ${item.emoji}
                            <div onclick="event.stopPropagation(); marketplaceToggleWishlist(${item.id})" style="position: absolute; top: 8px; right: 8px; width: 32px; height: 32px; border-radius: 50%; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; font-size: 16px;">
                                ❤️
                            </div>
                        </div>
                        <div style="padding: 12px;">
                            <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${item.title}</div>
                            <div style="font-size: 18px; font-weight: 800; color: var(--primary); margin-bottom: 4px;">$${item.price}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${item.condition} • ${item.seller}</div>
                        </div>
                    </div>
                `).join('');
            }

            document.getElementById('marketplaceWishlistCount').textContent = `${items.length} items`;
        }

        // Render my listings
        function marketplaceRenderMyListings() {
            const myItems = marketplaceListings.slice(0, 5);
            const grid = document.getElementById('marketplaceMyListingsGrid');
            if (!grid) return;

            grid.innerHTML = myItems.map(item => `
                <div class="listing-card" onclick="marketplaceOpenItemDetails(${item.id})" style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; overflow: hidden; cursor: pointer;">
                    <div style="width: 100%; height: 140px; background: ${item.gradient}; display: flex; align-items: center; justify-content: center; font-size: 48px;">
                        ${item.emoji}
                    </div>
                    <div style="padding: 12px;">
                        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${item.title}</div>
                        <div style="font-size: 18px; font-weight: 800; color: var(--primary); margin-bottom: 4px;">$${item.price}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">Active • 45 views</div>
                    </div>
                </div>
            `).join('');
        }

        // Open item details
        function marketplaceOpenItemDetails(id) {
            const item = marketplaceListings.find(i => i.id === id);
            if (!item) return;

            currentMarketplaceItem = item;
            const content = document.getElementById('marketplaceItemContent');
            
            content.innerHTML = `
                <div style="width: 100%; height: 300px; background: ${item.gradient}; display: flex; align-items: center; justify-content: center; font-size: 100px; margin-bottom: 16px;">
                    ${item.emoji}
                </div>
                <div style="font-size: 32px; font-weight: 800; color: var(--primary); margin-bottom: 8px;">$${item.price}</div>
                <div style="font-size: 22px; font-weight: 700; margin-bottom: 12px;">${item.title}</div>
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 16px;">
                    <span style="background: var(--glass); padding: 4px 12px; border-radius: 12px; margin-right: 8px;">${item.condition}</span>
                    <span>⭐ ${item.rating}</span>
                </div>
                <div style="font-size: 15px; line-height: 1.6; color: var(--text-secondary); margin-bottom: 16px;">
                    ${item.description}
                </div>
                <div class="list-item" style="margin-bottom: 16px;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 16px;">${item.seller.substring(0, 2)}</div>
                    <div class="list-item-content">
                        <div class="list-item-title">${item.seller}</div>
                        <div class="list-item-subtitle">⭐ ${item.rating} • 47 sales</div>
                    </div>
                    <button class="nav-btn" onclick="marketplaceOpenChat('${item.seller}', '${item.seller.substring(0, 2)}')">💬</button>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 20px;">
                    <button class="btn" style="flex: 1; background: var(--glass); border: 1px solid var(--glass-border);" onclick="marketplaceToggleWishlist(${id})">
                        ${marketplaceWishlist.includes(id) ? '❤️' : '🤍'} Save
                    </button>
                    <button class="btn" style="flex: 1;" onclick="marketplaceAddToCart(${id})">
                        🛒 Add to Cart
                    </button>
                </div>
            `;

            marketplaceOpenModal('item');
        }

        // Add to cart
        function marketplaceAddToCart(id) {
            if (!marketplaceCart.includes(id)) {
                marketplaceCart.push(id);
                marketplaceUpdateCartBadge();
                showToast('Added to cart! 🛒');
                marketplaceCloseModal('item');
            } else {
                showToast('Already in cart');
            }
        }

        // Update cart badge
        function marketplaceUpdateCartBadge() {
            const badge = document.getElementById('marketplaceCartBadge');
            if (marketplaceCart.length > 0) {
                badge.textContent = marketplaceCart.length;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }

        // Render cart
        function marketplaceRenderCart() {
            const items = marketplaceListings.filter(item => marketplaceCart.includes(item.id));
            const content = document.getElementById('marketplaceCartContent');
            
            if (items.length === 0) {
                content.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🛒</div>
                        <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Cart is Empty</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Add items to your cart to get started</div>
                    </div>
                `;
                return;
            }

            const total = items.reduce((sum, item) => sum + item.price, 0);
            
            content.innerHTML = items.map(item => `
                <div class="list-item" style="margin-bottom: 12px;">
                    <div style="width: 80px; height: 80px; background: ${item.gradient}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0;">
                        ${item.emoji}
                    </div>
                    <div class="list-item-content">
                        <div class="list-item-title">${item.title}</div>
                        <div style="font-size: 18px; font-weight: 700; color: var(--primary);">$${item.price}</div>
                    </div>
                    <div onclick="event.stopPropagation(); marketplaceRemoveFromCart(${item.id})" style="color: var(--error); cursor: pointer; padding: 8px; font-size: 20px;">🗑️</div>
                </div>
            `).join('');
            
            content.innerHTML += `
                <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); padding: 20px; border-radius: 16px; margin-top: 20px; text-align: center;">
                    <div style="font-size: 14px; margin-bottom: 8px;">Total</div>
                    <div style="font-size: 32px; font-weight: 800;">$${total}</div>
                </div>
                <button class="btn" style="margin-top: 16px;" onclick="marketplaceProceedToCheckout()">Checkout</button>
            `;
        }

        function marketplaceRemoveFromCart(id) {
            marketplaceCart = marketplaceCart.filter(itemId => itemId !== id);
            marketplaceUpdateCartBadge();
            marketplaceRenderCart();
            showToast('Removed from cart');
        }

        function marketplaceProceedToCheckout() {
            if (marketplaceCart.length === 0) {
                showToast('Cart is empty');
                return;
            }
            const items = marketplaceListings.filter(item => marketplaceCart.includes(item.id));
            const total = items.reduce((sum, item) => sum + item.price, 0);
            document.getElementById('marketplaceCheckoutTotal').textContent = `$${total}`;
            marketplaceCloseModal('cart');
            setTimeout(() => marketplaceOpenModal('checkout'), 300);
        }

        function marketplaceProcessPayment() {
            showToast('Processing payment...');
            setTimeout(() => {
                marketplaceCart = [];
                marketplaceUpdateCartBadge();
                marketplaceCloseModal('checkout');
                showToast('Order placed successfully! 🎉');
            }, 1500);
        }

        function marketplacePublishListing() {
            const title = document.getElementById('marketplaceListingTitle').value;
            const price = document.getElementById('marketplaceListingPrice').value;
            
            if (!title || !price) {
                showToast('Please fill all fields');
                return;
            }
            
            marketplaceCloseModal('createListing');
            showToast('Listing published! 🎉');
        }

        function marketplaceSearchItems(query) {
            const filtered = marketplaceListings.filter(item => 
                item.title.toLowerCase().includes(query.toLowerCase()) ||
                item.description.toLowerCase().includes(query.toLowerCase())
            );
            
            const grid = document.getElementById('marketplaceListingsGrid');
            if (!grid) return;
            
            grid.innerHTML = filtered.map(item => `
                <div class="listing-card" onclick="marketplaceOpenItemDetails(${item.id})" style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; overflow: hidden; cursor: pointer; transition: all 0.3s;">
                    <div style="width: 100%; height: 140px; background: ${item.gradient}; display: flex; align-items: center; justify-content: center; font-size: 48px; position: relative;">
                        ${item.emoji}
                    </div>
                    <div style="padding: 12px;">
                        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${item.title}</div>
                        <div style="font-size: 18px; font-weight: 800; color: var(--primary); margin-bottom: 4px;">$${item.price}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${item.condition}</div>
                    </div>
                </div>
            `).join('');
            
            document.getElementById('marketplaceResultsCount').textContent = `${filtered.length} items`;
        }

        function marketplaceFilterByCategory(category) {
            const filtered = marketplaceListings.filter(item => item.category === category);
            const grid = document.getElementById('marketplaceListingsGrid');
            if (!grid) return;
            
            grid.innerHTML = filtered.map(item => `
                <div class="listing-card" onclick="marketplaceOpenItemDetails(${item.id})" style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; overflow: hidden; cursor: pointer;">
                    <div style="width: 100%; height: 140px; background: ${item.gradient}; display: flex; align-items: center; justify-content: center; font-size: 48px;">
                        ${item.emoji}
                    </div>
                    <div style="padding: 12px;">
                        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${item.title}</div>
                        <div style="font-size: 18px; font-weight: 800; color: var(--primary); margin-bottom: 4px;">$${item.price}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${item.condition}</div>
                    </div>
                </div>
            `).join('');
            
            document.getElementById('marketplaceResultsCount').textContent = `${filtered.length} items`;
            showToast(`Showing ${category}`);
        }

        function marketplaceOpenModal(type) {
            const modal = document.getElementById('marketplace' + type.charAt(0).toUpperCase() + type.slice(1) + 'Modal');
            if (modal) {
                modal.classList.add('show');
                if (type === 'cart') {
                    marketplaceRenderCart();
                }
            }
        }

        function marketplaceCloseModal(type) {
            const modal = document.getElementById('marketplace' + type.charAt(0).toUpperCase() + type.slice(1) + 'Modal');
            if (modal) {
                modal.classList.remove('show');
            }
        }

        function marketplaceToggleNotifications() {
            const panel = document.getElementById('marketplaceNotificationsPanel');
            panel.classList.toggle('show');
        }

        function marketplaceMarkAllRead() {
            document.querySelectorAll('#marketplaceNotificationsPanel .notification-item.unread').forEach(item => {
                item.classList.remove('unread');
            });
            marketplaceNotificationCount = 0;
            document.getElementById('marketplaceNotificationsBadge').style.display = 'none';
            showToast('All notifications marked as read');
        }

        function marketplaceHandleNotification(type) {
            marketplaceToggleNotifications();
            if (type === 'order') {
                marketplaceOpenModal('orders');
            } else if (type === 'message') {
                marketplaceSwitchTab('messages');
            }
        }

        function marketplaceOpenChat(name, initials) {
            document.getElementById('marketplaceChatTitle').textContent = name;
            marketplaceOpenModal('chat');
        }

        // Initialize marketplace when opening the screen
        document.addEventListener('DOMContentLoaded', function() {
            initializeMarketplace();
        });

        // Listen for screen changes to initialize marketplace
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target.id === 'marketplace-screen' && mutation.target.classList.contains('active')) {
                    initializeMarketplace();
                }
            });
        });

        if (document.getElementById('marketplace-screen')) {
            observer.observe(document.getElementById('marketplace-screen'), {
                attributes: true,
                attributeFilter: ['class']
            });
        }

        // ========== HISTORY NAVIGATION SYSTEM ==========
        
        let navigationHistory = [];
        let currentModalStack = [];

        // Enhanced openScreen with history tracking
        const originalOpenScreen = openScreen;
        openScreen = function(screen) {
            navigationHistory.push({type: 'screen', id: currentScreen});
            originalOpenScreen(screen);
        }

        // Enhanced openModal with history tracking
        const originalOpenModal = openModal;
        openModal = function(type) {
            navigationHistory.push({type: 'modal', id: type});
            currentModalStack.push(type);
            originalOpenModal(type);
        }

        // Enhanced closeModal with history awareness
        const originalCloseModal = closeModal;
        closeModal = function(type) {
            const index = currentModalStack.indexOf(type);
            if (index > -1) {
                currentModalStack.splice(index, 1);
            }
            originalCloseModal(type);
        }

        // Handle browser back button
        window.addEventListener('popstate', function(e) {
            if (currentModalStack.length > 0) {
                const lastModal = currentModalStack.pop();
                originalCloseModal(lastModal);
            } else if (currentScreen !== 'feed') {
                originalOpenScreen('feed');
            }
        });

        // Push initial state
        history.pushState({screen: 'feed'}, '', '#feed');

        // Enhanced navigation functions that update URL hash
        function navigateToScreen(screen) {
            history.pushState({screen: screen}, '', '#' + screen);
            openScreen(screen);
        }

        function navigateBack() {
            if (currentModalStack.length > 0) {
                const lastModal = currentModalStack.pop();
                closeModal(lastModal);
            } else if (currentScreen !== 'feed') {
                openScreen('feed');
            } else {
                showToast('Already at home');
            }
        }

        // Add back button handler to logo
        document.querySelector('.nav-logo').onclick = function() {
            if (currentScreen !== 'feed') {
                openScreen('feed');
            } else {
                showToast('Already at home');
            }
        };

        // ========== CREATE POST FUNCTIONALITY ==========
        
        let selectedPhotoForPost = null;
        let selectedVideoForPost = null;
        let selectedLocationForPost = null;
        let taggedPeopleInPost = [];

        // Add photo to post
        function addPhotoToPost() {
            openModal('selectPhotoForPost');
        }

        // Select photo from gallery
        function selectPhoto(emoji) {
            selectedPhotoForPost = emoji;
            document.getElementById('photoPreview').textContent = emoji;
            document.getElementById('selectedPhotoPreview').style.display = 'block';
            closeModal('selectPhotoForPost');
            showToast('Photo added! 📷');
        }

        // Remove selected photo
        function removeSelectedPhoto() {
            selectedPhotoForPost = null;
            document.getElementById('selectedPhotoPreview').style.display = 'none';
            showToast('Photo removed');
        }

        // Add video to post
        function addVideoToPost() {
            openModal('selectVideoForPost');
        }

        // Select video from gallery
        function selectVideo(emoji) {
            selectedVideoForPost = emoji;
            document.getElementById('videoPreview').textContent = emoji;
            document.getElementById('selectedVideoPreview').style.display = 'block';
            closeModal('selectVideoForPost');
            showToast('Video added! 🎥');
        }

        // Remove selected video
        function removeSelectedVideo() {
            selectedVideoForPost = null;
            document.getElementById('selectedVideoPreview').style.display = 'none';
            showToast('Video removed');
        }

        // Add location to post
        function addLocationToPost() {
            openModal('selectLocation');
        }

        // Select location
        function selectLocation(location) {
            selectedLocationForPost = location;
            document.getElementById('locationText').textContent = location;
            document.getElementById('selectedLocation').style.display = 'block';
            closeModal('selectLocation');
            showToast('Location added! 📍');
        }

        // Remove selected location
        function removeSelectedLocation() {
            selectedLocationForPost = null;
            document.getElementById('selectedLocation').style.display = 'none';
            showToast('Location removed');
        }

        // Tag people in post
        function tagPeopleInPost() {
            openModal('tagPeople');
        }

        // Tag a person
        function tagPerson(name, emoji) {
            if (!taggedPeopleInPost.find(p => p.name === name)) {
                taggedPeopleInPost.push({name: name, emoji: emoji});
                updateTaggedPeopleDisplay();
                showToast(`Tagged ${name}!`);
            } else {
                showToast(`${name} already tagged`);
            }
        }

        // Update tagged people display
        function updateTaggedPeopleDisplay() {
            const container = document.getElementById('taggedPeopleList');
            const section = document.getElementById('taggedPeople');
            
            if (taggedPeopleInPost.length > 0) {
                section.style.display = 'block';
                container.innerHTML = taggedPeopleInPost.map((person, index) => `
                    <div style="background: var(--glass); border: 1px solid var(--glass-border); border-radius: 20px; padding: 6px 12px; display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 16px;">${person.emoji}</span>
                        <span style="font-size: 13px; font-weight: 600;">${person.name}</span>
                        <span onclick="removeTaggedPerson(${index})" style="cursor: pointer; margin-left: 4px; color: var(--error);">✕</span>
                    </div>
                `).join('');
            } else {
                section.style.display = 'none';
            }
        }

        // Remove tagged person
        function removeTaggedPerson(index) {
            const person = taggedPeopleInPost[index];
            taggedPeopleInPost.splice(index, 1);
            updateTaggedPeopleDisplay();
            showToast(`Removed ${person.name}`);
        }

        // Select privacy setting
        function selectPrivacy(privacy) {
            document.getElementById('postPrivacy').textContent = privacy;
            closeModal('selectPrivacy');
            showToast(`Privacy set to ${privacy}`);
        }

        // Publish post with all selected content
        function publishPost() {
            const text = document.getElementById('postTextContent').value;
            
            if (!text && !selectedPhotoForPost && !selectedVideoForPost) {
                showToast('Please add some content to your post');
                return;
            }

            // Create new post object
            const newPost = {
                text: text,
                photo: selectedPhotoForPost,
                video: selectedVideoForPost,
                location: selectedLocationForPost,
                taggedPeople: [...taggedPeopleInPost],
                privacy: document.getElementById('postPrivacy').textContent,
                timestamp: 'Just now'
            };

            // Add post to feed
            addPostToFeed(newPost);

            // Reset form
            document.getElementById('postTextContent').value = '';
            selectedPhotoForPost = null;
            selectedVideoForPost = null;
            selectedLocationForPost = null;
            taggedPeopleInPost = [];
            document.getElementById('selectedPhotoPreview').style.display = 'none';
            document.getElementById('selectedVideoPreview').style.display = 'none';
            document.getElementById('selectedLocation').style.display = 'none';
            document.getElementById('taggedPeople').style.display = 'none';
            document.getElementById('postPrivacy').textContent = '🌍 Public';

            closeModal('createPost');
            showToast('Post published successfully! 🎉');
        }

        // ========== CREATE STORY FUNCTIONS ==========
        
        function openStoryCamera() {
            var cameraInput = document.getElementById('storyCameraInput');
            if (cameraInput) {
                cameraInput.click();
            } else {
                showToast('Camera opening... 📷');
            }
        }

        function openStoryGallery() {
            var galleryInput = document.getElementById('storyGalleryInput');
            if (galleryInput) {
                galleryInput.click();
            } else {
                showToast('Opening gallery... 🖼️');
            }
        }

        // Handle story media file selection
        function handleStoryMedia(event) {
            var file = event.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(e) {
                showToast('Media selected! Publishing your story... ✨');
                closeModal('createStory');
                setTimeout(function() {
                    showToast('Story published! 🎉');
                }, 800);
            };
            reader.readAsDataURL(file);
        }

        // FIX 3: Add a location typed into the search box
        function addLocationFromSearch() {
            var input = document.querySelector('#selectLocationModal .search-input');
            var loc = input ? input.value.trim() : '';
            if (!loc) {
                showToast('Please type a location first 📍');
                return;
            }
            selectLocation(loc);
        }

        
        // Share modal helper functions - FIX Issue 6
        function shareToFeed() { showToast('Post shared to your feed! 📰'); }
        function shareToStory() { showToast('Post added to your story! 🌟'); openModal('createStory'); }
        function shareViaMessage() { showToast('Opening messages to share...'); openModal('newMessage'); }
        function copyPostLink() {
            var link = window.location.href + '?post=shared';
            if (navigator.clipboard) {
                navigator.clipboard.writeText(link).then(function() {
                    showToast('Link copied to clipboard! 🔗');
                });
            } else {
                showToast('Link copied! 🔗');
            }
        }
        function shareExternal(platform) {
            var msgs = { facebook: 'Sharing to Facebook...', twitter: 'Sharing to X (Twitter)...', instagram: 'Sharing to Instagram...' };
            showToast((msgs[platform] || 'Sharing...') + ' 🚀');
        }

        // ========== GO LIVE FUNCTIONS ==========
        
        function selectLivePrivacy(privacy) {
            document.getElementById('livePrivacy').textContent = privacy;
            closeModal('selectLivePrivacy');
            showToast(`Privacy set to ${privacy}`);
        }

        function startLiveStream() {
            const title = document.getElementById('liveTitle').value;
            const description = document.getElementById('liveDescription').value;
            const privacy = document.getElementById('livePrivacy').textContent;

            if (!title) {
                showToast('Please add a title for your live stream');
                return;
            }

            closeModal('goLive');
            showToast('🔴 Going live...');
            
            // Simulate live stream starting
            setTimeout(() => {
                showToast('You are now LIVE! 🎥');
            }, 1500);
        }

        // ========== UPLOAD MEDIA FUNCTIONS ==========
        
        function selectMediaFromDevice() {
            showToast('Opening device file picker...');
            setTimeout(() => {
                showToast('Select photos or videos to upload');
            }, 800);
        }

        function selectPhotosFromGallery() {
            closeModal('uploadMedia');
            showToast('Opening photo gallery... 📷');
            setTimeout(() => {
                showToast('Photos selected! Ready to upload');
            }, 1000);
        }

        function selectVideosFromGallery() {
            closeModal('uploadMedia');
            showToast('Opening video gallery... 🎥');
            setTimeout(() => {
                showToast('Videos selected! Ready to upload');
            }, 1000);
        }

        // ========== CREATE EVENT FUNCTIONS ==========
        
        function createNewEvent() {
            const name = document.getElementById('eventName').value;
            const location = document.getElementById('eventLocation').value;
            const date = document.getElementById('eventDate').value;
            const time = document.getElementById('eventTime').value;
            const description = document.getElementById('eventDescription').value;

            if (!name || !location || !date || !time) {
                showToast('Please fill in all required fields');
                return;
            }

            closeModal('createEvent');
            showToast('Event created successfully! 📅');
            
            // Clear the form
            document.getElementById('eventName').value = '';
            document.getElementById('eventLocation').value = '';
            document.getElementById('eventDate').value = '';
            document.getElementById('eventTime').value = '';
            document.getElementById('eventDescription').value = '';
        }

        // ========== CREATE GROUP FUNCTIONS ==========
        
        function selectGroupPrivacy(privacy) {
            document.getElementById('groupPrivacy').textContent = privacy;
            closeModal('selectGroupPrivacy');
            showToast(`Privacy set to ${privacy}`);
        }

        function createNewGroup() {
            const name = document.getElementById('groupName').value;
            const description = document.getElementById('groupDescription').value;
            const privacy = document.getElementById('groupPrivacy').textContent;

            if (!name) {
                showToast('Please enter a group name');
                return;
            }

            closeModal('createGroup');
            showToast('Group created successfully! 👥');
            
            // Clear the form
            document.getElementById('groupName').value = '';
            document.getElementById('groupDescription').value = '';
            document.getElementById('groupPrivacy').textContent = 'Public';
        }

        // ========== CREATE POLL FUNCTIONS ==========
        
        function selectPollLength(length) {
            document.getElementById('pollLength').textContent = length;
            closeModal('selectPollLength');
            showToast(`Poll length set to ${length}`);
        }

        function createNewPoll() {
            const question = document.getElementById('pollQuestion').value;
            const option1 = document.getElementById('pollOption1').value;
            const option2 = document.getElementById('pollOption2').value;
            const length = document.getElementById('pollLength').textContent;

            if (!question || !option1 || !option2) {
                showToast('Please fill in the question and at least 2 options');
                return;
            }

            closeModal('createPoll');
            showToast('Poll created successfully! 📊');
            
            // Clear the form
            document.getElementById('pollQuestion').value = '';
            document.getElementById('pollOption1').value = '';
            document.getElementById('pollOption2').value = '';
            document.getElementById('pollLength').textContent = '1 day';
        }

        // ========== CREATE FUNDRAISER FUNCTIONS ==========
        
        function selectFundraiserCategory(category) {
            document.getElementById('fundraiserCategory').textContent = category;
            closeModal('selectFundraiserCategory');
            showToast(`Category set to ${category}`);
        }

        function createNewFundraiser() {
            const title = document.getElementById('fundraiserTitle').value;
            const goal = document.getElementById('fundraiserGoal').value;
            const description = document.getElementById('fundraiserDescription').value;
            const category = document.getElementById('fundraiserCategory').textContent;

            if (!title || !goal || !description || category === 'Select a category') {
                showToast('Please fill in all fields and select a category');
                return;
            }

            closeModal('createFundraiser');
            showToast('Fundraiser created successfully! 💰');
            
            // Clear the form
            document.getElementById('fundraiserTitle').value = '';
            document.getElementById('fundraiserGoal').value = '';
            document.getElementById('fundraiserDescription').value = '';
            document.getElementById('fundraiserCategory').textContent = 'Select a category';
        }

        // Add post to feed
        function addPostToFeed(post) {
            const feedScreen = document.getElementById('feed-screen');
            const createPostCard = feedScreen.querySelector('.card');
            
            const newPostHTML = `
                <div class="post-card" style="animation: slideUp 0.3s ease;">
                    <div class="post-header">
                        <div class="post-avatar">👤</div>
                        <div class="post-header-info">
                            <div class="post-author">[Current User]</div>
                            <div class="post-meta">${post.timestamp} • ${post.privacy}</div>
                        </div>
                        <div class="post-menu" onclick="openModal('postOptions')">⋯</div>
                    </div>
                    ${post.text ? `<div class="post-content">${post.text}${post.location ? ` 📍 ${post.location}` : ''}${post.taggedPeople.length > 0 ? ` — with ${post.taggedPeople.map(p => p.name).join(', ')}` : ''}</div>` : ''}
                    ${post.photo ? `<div class="post-image">${post.photo}</div>` : ''}
                    ${post.video ? `<div class="post-image">${post.video}</div>` : ''}
                    <div class="post-actions">
                        <div class="post-action" onclick="toggleLikePost(this)">
                            <span>👍</span> Like
                        </div>
                        <div class="post-action" onclick="openModal('comments')">
                            <span>💬</span> Comment
                        </div>
                        <div class="post-action" onclick="sharePost()">
                            <span>🔄</span> Share
                        </div>
                    </div>
                </div>
            `;
            
            createPostCard.insertAdjacentHTML('afterend', newPostHTML);
        }

        // ========== IN-APP NOTIFICATION SYSTEM ==========
        
        let currentNotificationTimeout = null;
        let pendingNotification = null;
        let inAppNotificationsEnabled = true; // Default to enabled

        // Toggle in-app notifications on/off
        function toggleInAppNotifications(element) {
            element.classList.toggle('active');
            inAppNotificationsEnabled = element.classList.contains('active');
            
            if (inAppNotificationsEnabled) {
                showToast('In-app notifications enabled');
            } else {
                showToast('In-app notifications disabled');
                // Dismiss any currently showing notification
                dismissInAppNotification();
            }
        }

        // Show in-app notification banner
        function showInAppNotification(icon, title, text, action) {
            // Check if notifications are enabled
            if (!inAppNotificationsEnabled) {
                return; // Don't show notification if disabled
            }
            const notification = document.getElementById('inAppNotification');
            const notificationIcon = document.getElementById('notificationIcon');
            const notificationTitle = document.getElementById('notificationTitle');
            const notificationText = document.getElementById('notificationText');

            // Store the action for when notification is clicked
            pendingNotification = action;

            // Update notification content
            notificationIcon.textContent = icon;
            notificationTitle.textContent = title;
            notificationText.textContent = text;

            // Clear any existing timeout
            if (currentNotificationTimeout) {
                clearTimeout(currentNotificationTimeout);
            }

            // Show notification
            notification.classList.add('show');

            // Auto-dismiss after 5 seconds
            currentNotificationTimeout = setTimeout(() => {
                dismissInAppNotification();
            }, 5000);
        }

        // Dismiss in-app notification
        function dismissInAppNotification() {
            const notification = document.getElementById('inAppNotification');
            notification.classList.remove('show');
            pendingNotification = null;
            
            if (currentNotificationTimeout) {
                clearTimeout(currentNotificationTimeout);
                currentNotificationTimeout = null;
            }
        }

        // Handle notification click
        function handleInAppNotificationClick() {
            if (!pendingNotification) return;

            dismissInAppNotification();

            // Execute the action based on notification type
            if (pendingNotification.type === 'like' || pendingNotification.type === 'comment') {
                openScreen('feed');
            } else if (pendingNotification.type === 'friend_request') {
                openScreen('friends');
            } else if (pendingNotification.type === 'event') {
                openScreen('events');
            } else if (pendingNotification.type === 'gaming') {
                openScreen('gaming');
            } else if (pendingNotification.type === 'message') {
                openScreen('messages');
            }
        }

        // Simulate receiving new notifications (for demo purposes)
        function simulateNotifications() {
            const notifications = [
                { icon: '👍', title: 'New Like', text: 'Sarah liked your post', action: { type: 'like' } },
                { icon: '💬', title: 'New Comment', text: 'Mike commented on your photo', action: { type: 'comment' } },
                { icon: '👥', title: 'Friend Request', text: 'Emily sent you a friend request', action: { type: 'friend_request' } },
                { icon: '📅', title: 'Event Reminder', text: 'Tech Conference starts tomorrow', action: { type: 'event' } },
                { icon: '🎮', title: 'Achievement Unlocked', text: 'You leveled up to Level 43!', action: { type: 'gaming' } },
                { icon: '💬', title: 'New Message', text: 'You have 2 new messages', action: { type: 'message' } }
            ];

            let notificationIndex = 0;

            // Show first notification after 10 seconds
            setTimeout(() => {
                const notif = notifications[notificationIndex];
                showInAppNotification(notif.icon, notif.title, notif.text, notif.action);
                notificationIndex = (notificationIndex + 1) % notifications.length;

                // Continue showing notifications every 15 seconds
                setInterval(() => {
                    const notif = notifications[notificationIndex];
                    showInAppNotification(notif.icon, notif.title, notif.text, notif.action);
                    notificationIndex = (notificationIndex + 1) % notifications.length;
                }, 15000);
            }, 10000);
        }

        // Start simulating notifications on page load
        window.addEventListener('load', () => {
            simulateNotifications();
        });

        // ========== PROBLEM TYPE SELECTION & SUBMISSION ==========
        
        function selectProblemType(type) {
            document.getElementById('selectedProblemType').textContent = type;
            closeModal('selectProblemType');
            showToast(`Problem type: ${type}`);
        }

        function submitProblemReport() {
            const problemType = document.getElementById('selectedProblemType').textContent;
            const description = document.getElementById('problemDescription').value;

            if (problemType === 'Select a category') {
                showToast('Please select a problem type');
                return;
            }

            if (!description.trim()) {
                showToast('Please describe the problem');
                return;
            }

            closeModal('reportProblem');
            showToast('Problem report submitted successfully! ✓');
            
            // Clear the form
            document.getElementById('selectedProblemType').textContent = 'Select a category';
            document.getElementById('problemDescription').value = '';
        }

        // ========== AI ASSISTANT FUNCTIONS ==========
        
        function askAI(question) {
            const chatMessages = document.getElementById('aiChatMessages');
            
            // Add user question
            const userBubble = document.createElement('div');
            userBubble.className = 'chat-bubble sent';
            userBubble.textContent = question;
            chatMessages.appendChild(userBubble);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Simulate AI response
            setTimeout(() => {
                const responses = {
                    'How do I reset my password?': 'To reset your password, go to Settings → Change Password. Enter your current password, then create a new strong password with at least 8 characters including letters, numbers, and symbols.',
                    'How do I change privacy settings?': 'Go to Settings → Privacy Settings to control who can see your posts, message you, and view your profile. You can set different privacy levels for different types of content.',
                    'How do I report a problem?': 'To report a problem, go to Help & Support → Report a Problem. Select the problem type and describe the issue in detail. Our team will review and respond within 24 hours.',
                    'How do I delete my account?': 'To delete your account permanently, go to Settings → Data Settings → Delete Account. Please note this action is permanent and cannot be undone. All your data will be removed.'
                };
                
                const aiBubble = document.createElement('div');
                aiBubble.className = 'chat-bubble received';
                aiBubble.textContent = responses[question] || 'I can help you with account security, privacy settings, reporting problems, and account management. What would you like to know more about?';
                chatMessages.appendChild(aiBubble);
                
                // Scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 800);
        }

        function sendToAI() {
            const input = document.getElementById('aiAssistantInput');
            const question = input.value.trim();
            
            if (!question) {
                showToast('Please type a question');
                return;
            }
            
            askAI(question);
            input.value = '';
        }

        // Add enter key support for AI assistant
        document.addEventListener('DOMContentLoaded', () => {
            const aiInput = document.getElementById('aiAssistantInput');
            if (aiInput) {
                aiInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        sendToAI();
                    }
                });
            }
        });

        // ========== PRIVACY SETTINGS FUNCTIONS ==========
        
        function updatePostVisibility(visibility) {
            // Update the privacy settings screen
            const element = document.querySelector('#privacySettingsModal .list-item:first-child .list-item-subtitle');
            if (element) {
                element.textContent = visibility;
            }
            closeModal('whoCanSeeMyPosts');
            showToast(`Post visibility set to ${visibility}`);
        }

        function updateMessagePrivacy(privacy) {
            // Update the privacy settings screen
            const element = document.querySelector('#privacySettingsModal .list-item:nth-child(2) .list-item-subtitle');
            if (element) {
                element.textContent = privacy;
            }
            closeModal('whoCanMessageMe');
            showToast(`Message privacy set to ${privacy}`);
        }

        function updateProfileVisibility(visibility) {
            // Update the privacy settings screen
            const element = document.querySelector('#privacySettingsModal .list-item:nth-child(3) .list-item-subtitle');
            if (element) {
                element.textContent = visibility;
            }
            closeModal('profileVisibility');
            showToast(`Profile visibility set to ${visibility}`);
        }

        // ========== DATA SETTINGS FUNCTIONS ==========
        
        function requestDataDownload() {
            closeModal('downloadYourData');
            showToast('Data download requested! 📥');
            
            // Simulate processing
            setTimeout(() => {
                showToast('We\'ll notify you when your data is ready (within 48 hours)');
            }, 2000);
        }

        function confirmDeactivateAccount() {
            const password = document.getElementById('deactivatePassword').value;

            if (!password.trim()) {
                showToast('Please enter your password to confirm');
                return;
            }

            closeModal('deactivateAccount');
            showToast('Account deactivated successfully');
            
            // Simulate account deactivation
            setTimeout(() => {
                showToast('Your account has been temporarily disabled');
            }, 1500);
            
            // Clear the password field
            document.getElementById('deactivatePassword').value = '';
        }

        function confirmDeleteAccount() {
            const password = document.getElementById('deletePassword').value;
            const confirmToggle = document.getElementById('deleteConfirmToggle');

            if (!password.trim()) {
                showToast('Please enter your password');
                return;
            }

            if (!confirmToggle.classList.contains('active')) {
                showToast('Please confirm you understand this is permanent');
                return;
            }

            closeModal('deleteAccount');
            showToast('Account deletion initiated...');
            
            // Simulate account deletion process
            setTimeout(() => {
                showToast('Your account will be deleted within 30 days. You can cancel during this period.');
            }, 2000);
            
            // Clear the form
            document.getElementById('deletePassword').value = '';
            confirmToggle.classList.remove('active');
        }

        // ========== ACCOUNT PREFERENCES FUNCTIONS ==========
        
        function updateLanguage(language) {
            document.getElementById('selectedLanguage').textContent = language;
            closeModal('selectLanguage');
            showToast(`Language set to ${language}`);
        }

        function updateTimezone(timezone) {
            document.getElementById('selectedTimezone').textContent = timezone;
            closeModal('selectTimezone');
            showToast(`Timezone set to ${timezone}`);
        }

        function updateDateFormat(format) {
            document.getElementById('selectedDateFormat').textContent = format;
            closeModal('selectDateFormat');
            showToast(`Date format set to ${format}`);
        }

        // ========== PROFILE PRIVACY FUNCTIONS ==========
        
        function updateFriendRequestsPrivacy(setting) {
            document.getElementById('friendRequestsPrivacy').textContent = setting;
            closeModal('whoCanSendFriendRequests');
            showToast(`Friend requests: ${setting}`);
        }

        function updateFriendsListPrivacy(setting) {
            document.getElementById('friendsListPrivacy').textContent = setting;
            closeModal('whoCanSeeFriendsList');
            showToast(`Friends list visibility: ${setting}`);
        }

        // ========== NAVIGATE TO MESSAGES FUNCTION ==========
        
        function navigateToMessages(fromModal) {
            // Close the current modal
            closeModal(fromModal);
            
            // Switch to messages tab in bottom navigation
            document.querySelectorAll('.bottom-nav .nav-item').forEach(item => item.classList.remove('active'));
            document.querySelectorAll('.bottom-nav .nav-item')[2].classList.add('active'); // Messages is 3rd item (index 2)
            
            // Show messages screen
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('messages-screen').classList.add('active');
            
            currentBottomTab = 'messages';
            currentScreen = 'messages';
            
            showToast('Opening Messages... 💬');
        }

        // ========== RELATED POSTS NAVIGATION ==========
        
        // Open related post from trending details
        function openRelatedPost(postId) {
            // Close the trending details modal
            closeModal('trendingDetails');
            
            // Show loading message
            showToast('Opening post...');
            
            // Simulate navigating to the specific post
            setTimeout(() => {
                // Navigate to feed screen
                openScreen('feed');
                
                // Show confirmation
                showToast(`Viewing post from ${postId.replace(/-/g, ' ')}`);
                
                // Scroll to top of feed
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300);
        }
        
        // ========== POST OPTIONS FUNCTIONS ==========
        
        // Copy post link to clipboard
        function copyPostLink() {
            // Simulate copying link to clipboard
            const postLink = 'https://lynkapp.com/post/12345';
            
            // Try to use clipboard API if available
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(postLink).then(() => {
                    showToast('Link copied to clipboard! 🔗');
                }).catch(() => {
                    // Fallback if clipboard API fails
                    showToast('Link copied! 🔗');
                });
            } else {
                // Fallback for browsers that don't support clipboard API
                showToast('Link copied! 🔗');
            }
        }

        // Hide post from feed
        function hidePostAction() {
            showToast('Post hidden from your feed');
            
            // Simulate removing the post from view
            setTimeout(() => {
                showToast('We\'ll show you less content like this');
            }, 1500);
        }

        // Submit post report
        function submitPostReport(reason) {
            closeModal('reportPost');
            
            // Show confirmation message
            showToast('Report submitted. Thank you for keeping LynkApp safe! ✓');
            
            // Navigate to help screen after a brief delay
            setTimeout(() => {
                openScreen('help');
                showToast('Visit Help & Support for more information');
            }, 2000);
        }

        // ========== SENSITIVE CONTENT FILTER FUNCTIONS ==========
        
        // Select sensitive content filter setting
        function selectSensitiveContentFilter(filterType) {
            closeModal('sensitiveContent');
            
            // Show confirmation with appropriate message based on selection
            if (filterType === 'Show All') {
                showToast('Sensitive content will be shown without warnings');
            } else if (filterType === 'Show with Warnings') {
                showToast('You\'ll see warnings before viewing sensitive content ⚠️');
            } else if (filterType === 'Hide Sensitive Content') {
                showToast('Sensitive content will be hidden from your feed 🚫');
            }
            
            // Update the setting in content preferences (if needed in future)
            setTimeout(() => {
                showToast('Settings saved successfully! ✓');
            }, 1500);
        }

        // ========== COMPREHENSIVE NAVIGATION SYSTEM ==========
        
        // Ensure all social media features are clickable (15 features)
        const socialMediaFeatures = {
            createPost: () => openModal('createPost'),
            addPhoto: () => openModal('selectPhotoForPost'),
            addVideo: () => openModal('selectVideoForPost'),
            addLocation: () => openModal('selectLocation'),
            tagFriends: () => openModal('tagPeople'),
            likePost: (btn) => toggleLikePost(btn),
            commentPost: () => openModal('comments'),
            sharePost: () => sharePost(),
            deletePost: () => showToast('Post deleted'),
            editPost: () => showToast('Edit post functionality'),
            reportPost: () => openModal('reportPost'),
            refreshFeed: () => showToast('Refreshing feed...'),
            viewAnalytics: () => showToast('Post analytics'),
            clickHashtag: () => showToast('Viewing hashtag'),
            savePost: () => { closeModal('postOptions'); openScreen('saved'); showToast('Post saved'); }
        };

        // Ensure all Messages/Chat features are clickable (20 features)
        const messagesFeatures = {
            sendMessage: () => sendChatMessage(),
            sendPhoto: () => openModal('galleryMemes'),
            sendVideo: () => openModal('galleryMemes'),
            sendVoice: () => openModal('voiceMessage'),
            sendFile: () => openModal('filePicker'),
            sendLocation: () => openModal('locationShare'),
            sendMeme: () => openModal('memeBrowser'),
            sendContact: () => shareContact(),
            emojiReaction: () => showToast('Emoji reaction added'),
            messageSearch: () => showToast('Searching messages...'),
            deleteMessage: () => showToast('Message deleted'),
            editMessage: () => showToast('Message edited'),
            blockUser: () => showToast('User blocked'),
            reportChat: () => showToast('Chat reported'),
            archiveConversation: () => showToast('Conversation archived'),
            pinConversation: () => showToast('Conversation pinned'),
            muteConversation: () => showToast('Conversation muted'),
            groupChat: () => showToast('Group chat feature'),
            videoCall: () => startVideoCall(),
            phoneCall: () => startPhoneCall()
        };

        // Ensure all Profile features are clickable (17 features)
        const profileFeatures = {
            editProfile: () => openModal('editProfile'),
            uploadProfilePhoto: () => showToast('Upload profile photo'),
            uploadCoverPhoto: () => showToast('Upload cover photo'),
            updateBio: () => openModal('editProfile'),
            updateLocation: () => openModal('editProfile'),
            privacySettings: () => openModal('privacySettings'),
            blockList: () => openModal('blockingSettings'),
            deactivateAccount: () => openModal('deactivateAccount'),
            deleteAccount: () => openModal('deleteAccount'),
            changePassword: () => openModal('changePassword'),
            updateEmail: () => openModal('editPersonalInfo'),
            updatePhone: () => openModal('editPersonalInfo'),
            addSocialLinks: () => showToast('Add social media links'),
            downloadData: () => openModal('downloadYourData'),
            viewFollowers: () => openModal('followersList'),
            viewFollowing: () => openModal('followingList'),
            viewPostArchive: () => openModal('allPosts')
        };

        // Ensure all Groups features are clickable (17 features)
        const groupsFeatures = {
            createGroup: () => openModal('createGroup'),
            joinGroup: () => showToast('Joined group!'),
            leaveGroup: () => showToast('Left group'),
            inviteMembers: () => showToast('Invite sent'),
            postInGroup: () => openModal('createPost'),
            groupChat: () => openModal('chatWindow'),
            setGroupRules: () => showToast('Group rules updated'),
            adminControls: () => showToast('Admin panel'),
            banMember: () => showToast('Member banned'),
            uploadGroupPhoto: () => showToast('Upload group photo'),
            editGroupDescription: () => showToast('Description updated'),
            searchGroups: () => showToast('Searching groups...'),
            filterByCategory: () => showToast('Filtering groups'),
            approveMembership: () => showToast('Membership approved'),
            createGroupEvent: () => openModal('createEvent'),
            shareGroupFiles: () => showToast('File sharing'),
            viewGroupAnalytics: () => showToast('Group analytics')
        };

        // Ensure all Events features are clickable (17 features)
        const eventsFeatures = {
            createEvent: () => openModal('createEvent'),
            rsvpEvent: () => showToast('RSVP confirmed!'),
            setReminder: () => showToast('Reminder set'),
            addToCalendar: () => showToast('Added to calendar'),
            eventChat: () => openModal('chatWindow'),
            shareEvent: () => shareEvent(),
            uploadEventPhotos: () => showToast('Upload event photos'),
            viewEventLocation: () => showToast('Opening map...'),
            buyTickets: () => showToast('Ticket purchase'),
            viewGuestList: () => showToast('Guest list'),
            searchEvents: () => showToast('Searching events...'),
            filterByLocation: () => showToast('Location filter'),
            filterByDate: () => showToast('Date filter'),
            filterByCategory: () => showToast('Category filter'),
            postEventUpdate: () => showToast('Event update posted'),
            cancelEvent: () => showToast('Event cancelled'),
            joinWaitlist: () => showToast('Added to waitlist')
        };

        // Ensure all Stories features are clickable (14 features)
        const storiesFeatures = {
            createStory: () => openModal('createStory'),
            photoCapture: () => openStoryCamera(),
            videoCapture: () => openStoryCamera(),
            editStory: () => showToast('Story editor'),
            viewStoryViews: () => showToast('Story views'),
            replyToStory: () => showToast('Reply sent'),
            shareStory: () => showToast('Story shared'),
            setStoryPrivacy: () => showToast('Privacy updated'),
            archiveStory: () => showToast('Story archived'),
            viewStory: () => openModal('viewStory'),
            createHighlight: () => showToast('Highlight created'),
            addStoryMusic: () => showToast('Music added'),
            addStoryPoll: () => showToast('Poll added'),
            deleteStory: () => showToast('Story deleted')
        };

        // Ensure all Explore features are clickable (10 features)
        const exploreFeatures = {
            viewTrending: () => { switchPillTab(document.querySelectorAll('.pill-nav-button')[3], 'trending'); },
            viewSuggestedUsers: () => openScreen('friends'),
            viewInterestFeed: () => showToast('Interest-based feed'),
            searchPosts: () => openModal('searchModal'),
            followHashtag: () => showToast('Following hashtag'),
            locationDiscover: () => showToast('Location discovery'),
            viewRecommendations: () => showToast('AI recommendations'),
            saveContent: () => showToast('Content saved'),
            hideContent: () => showToast('Content hidden'),
            exploreCategories: () => showToast('Browse categories')
        };

        // Ensure all Search features are clickable (10 features)
        const searchFeatures = {
            searchUsers: () => { openModal('searchModal'); showToast('Search users'); },
            searchPosts: () => { openModal('searchModal'); showToast('Search posts'); },
            searchGroups: () => { openModal('searchModal'); showToast('Search groups'); },
            searchEvents: () => { openModal('searchModal'); showToast('Search events'); },
            searchHashtags: () => { openModal('searchModal'); showToast('Search hashtags'); },
            searchLocation: () => { openModal('searchModal'); showToast('Search location'); },
            applyFilters: () => showToast('Filters applied'),
            viewSearchHistory: () => showToast('Search history'),
            getSuggestions: () => showToast('Search suggestions'),
            clearSearch: () => clearSearch()
        };

        // Ensure all Settings features are clickable (12 features)
        const settingsFeatures = {
            privacySettings: () => openModal('privacySettings'),
            notificationSettings: () => openModal('emailPreferences'),
            blockedUsers: () => openModal('blockingSettings'),
            mutedUsers: () => showToast('Muted users list'),
            accountPreferences: () => openModal('accountPreferences'),
            languageSettings: () => openModal('selectLanguage'),
            themeSettings: () => showToast('Theme settings'),
            dataManagement: () => openModal('dataSettings'),
            connectedApps: () => showToast('Connected apps'),
            twoFactorAuth: () => openModal('enable2FA'),
            loginHistory: () => openModal('manageDevices'),
            securityAlerts: () => showToast('Security alerts')
        };

        // Make all features globally accessible
        window.socialMediaFeatures = socialMediaFeatures;
        window.messagesFeatures = messagesFeatures;
        window.profileFeatures = profileFeatures;
        window.groupsFeatures = groupsFeatures;
        window.eventsFeatures = eventsFeatures;
        window.storiesFeatures = storiesFeatures;
        window.exploreFeatures = exploreFeatures;
        window.searchFeatures = searchFeatures;
        window.settingsFeatures = settingsFeatures;

        // ========== MUSIC PLAYER FEATURES ==========
        
        let likedSongs = [];
        let musicQueue = [];
        let musicPlaylists = [];

        // Toggle music heart (like/unlike song)
        function toggleMusicHeart(songId) {
            const heartBtn = document.getElementById('heart-btn-' + songId);
            if (!heartBtn) return;
            
            const index = likedSongs.indexOf(songId);
            if (index > -1) {
                // Unlike
                likedSongs.splice(index, 1);
                heartBtn.textContent = '🤍';
                showToast('Removed from library');
            } else {
                // Like
                likedSongs.push(songId);
                heartBtn.textContent = '❤️';
                showToast('Added to library ❤️');
            }
        }

        // Open search music modal
        function openSearchMusicModal() {
            const modalHTML = `
                <div id="searchMusicModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('searchMusic')">✕</div>
                        <div class="modal-title">Search Music</div>
                    </div>
                    <div class="modal-content">
                        <div class="search-bar">
                            <span>🔍</span>
                            <input type="text" class="search-input" placeholder="Search songs, artists, albums..." oninput="searchMusic(this.value)" />
                        </div>
                        <div class="section-header">
                            <div class="section-title">Quick Search</div>
                        </div>
                        <div class="list-item" onclick="performMusicSearch('Top Charts')">
                            <div class="list-item-icon">🔥</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Top Charts</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        <div class="list-item" onclick="performMusicSearch('New Releases')">
                            <div class="list-item-icon">🆕</div>
                            <div class="list-item-content">
                                <div class="list-item-title">New Releases</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        <div class="list-item" onclick="performMusicSearch('Discover Weekly')">
                            <div class="list-item-icon">🌟</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Discover Weekly</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // Search music function
        function searchMusic(query) {
            if (query.trim().length > 0) {
                showToast(`Searching for: ${query}`);
            }
        }

        // Perform music search
        function performMusicSearch(query) {
            closeModal('searchMusic');
            
            // Create a full dashboard based on the search query
            const dashboardHTML = `
                <div id="musicSearchResultsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('musicSearchResults')">✕</div>
                        <div class="modal-title">${query}</div>
                    </div>
                    <div class="modal-content">
                        ${getMusicSearchContent(query)}
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', dashboardHTML);
            showToast(`Loading: ${query}`);
        }

        // Get music search content based on query type
        function getMusicSearchContent(query) {
            if (query === 'Top Charts') {
                return `
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="font-size: 64px; margin-bottom: 16px;">🔥</div>
                        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Top Charts</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Most popular songs right now</div>
                    </div>
                    
                    <div class="section-header">
                        <div class="section-title">🏆 Top 10 This Week</div>
                    </div>
                    
                    <div class="list-item" onclick="closeModal('musicSearchResults'); window.musicPlayer.playMusic(1); showToast('🎵 Playing Starlight Dreams')">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #ffd700, #ffed4e); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; color: #000;">1</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Starlight Dreams</div>
                            <div class="list-item-subtitle">The Moonwalkers • 4:05</div>
                        </div>
                        <button class="nav-btn" id="chart-heart-1" onclick="event.stopPropagation(); toggleChartHeart(this, 'chart-1')">🤍</button>
                    </div>
                    
                    <div class="list-item" onclick="closeModal('musicSearchResults'); window.musicPlayer.playMusic(2); showToast('🎵 Playing Electric Pulse')">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #c0c0c0, #e8e8e8); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; color: #000;">2</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Electric Pulse</div>
                            <div class="list-item-subtitle">Neon Nights • 3:18</div>
                        </div>
                        <button class="nav-btn" id="chart-heart-2" onclick="event.stopPropagation(); toggleChartHeart(this, 'chart-2')">🤍</button>
                    </div>
                    
                    <div class="list-item" onclick="closeModal('musicSearchResults'); window.musicPlayer.playMusic(3); showToast('🎵 Playing Ocean Waves')">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #cd7f32, #e8b572); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; color: #000;">3</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Ocean Waves</div>
                            <div class="list-item-subtitle">Calm Collective • 5:12</div>
                        </div>
                        <button class="nav-btn" id="chart-heart-3" onclick="event.stopPropagation(); toggleChartHeart(this, 'chart-3')">🤍</button>
                    </div>
                    
                    <div class="list-item" onclick="closeModal('musicSearchResults'); showToast('🎵 Playing Midnight City'); window.musicPlayer.playMusic(4)">
                        <div style="width: 40px; height: 40px; background: var(--glass); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px;">4</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Midnight City</div>
                            <div class="list-item-subtitle">Urban Beats • 3:45</div>
                        </div>
                        <button class="nav-btn" id="chart-heart-4" onclick="event.stopPropagation(); toggleChartHeart(this, 'chart-4')">🤍</button>
                    </div>
                    
                    <div class="list-item" onclick="closeModal('musicSearchResults'); showToast('🎵 Playing Summer Breeze'); window.musicPlayer.playMusic(5)">
                        <div style="width: 40px; height: 40px; background: var(--glass); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px;">5</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Summer Breeze</div>
                            <div class="list-item-subtitle">Coastal Vibes • 4:20</div>
                        </div>
                        <button class="nav-btn" id="chart-heart-5" onclick="event.stopPropagation(); toggleChartHeart(this, 'chart-5')">🤍</button>
                    </div>
                    
                    <div class="list-item" onclick="closeModal('musicSearchResults'); showToast('🎵 Playing Digital Dreams'); window.musicPlayer.playMusic(6)">
                        <div style="width: 40px; height: 40px; background: var(--glass); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px;">6</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Digital Dreams</div>
                            <div class="list-item-subtitle">Synthwave Society • 3:55</div>
                        </div>
                        <button class="nav-btn" id="chart-heart-6" onclick="event.stopPropagation(); toggleChartHeart(this, 'chart-6')">🤍</button>
                    </div>
                    
                    <button class="btn" style="margin-top: 16px;" onclick="loadMoreCharts()">
                        Load More Charts
                    </button>
                `;
            } else if (query === 'New Releases') {
                return `
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="font-size: 64px; margin-bottom: 16px;">🆕</div>
                        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">New Releases</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Fresh tracks from this week</div>
                    </div>
                    
                    <div class="section-header">
                        <div class="section-title">🎵 Just Dropped</div>
                    </div>
                    
                    <div class="list-item" onclick="closeModal('musicSearchResults'); showToast('🎵 Playing Tomorrow\\'s Echo')">
                        <div class="list-item-icon">🎸</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Tomorrow's Echo</div>
                            <div class="list-item-subtitle">Future Sound • 3:42 • New</div>
                        </div>
                        <button class="nav-btn" id="new-heart-1" onclick="event.stopPropagation(); toggleChartHeart(this, 'new-1')">🤍</button>
                    </div>
                    
                    <div class="list-item" onclick="closeModal('musicSearchResults'); showToast('🎵 Playing Neon Lights')">
                        <div class="list-item-icon">💡</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Neon Lights</div>
                            <div class="list-item-subtitle">City Nights • 4:15 • New</div>
                        </div>
                        <button class="nav-btn" id="new-heart-2" onclick="event.stopPropagation(); toggleChartHeart(this, 'new-2')">🤍</button>
                    </div>
                    
                    <div class="list-item" onclick="closeModal('musicSearchResults'); showToast('🎵 Playing Crystal Rain')">
                        <div class="list-item-icon">💎</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Crystal Rain</div>
                            <div class="list-item-subtitle">Ambient Flow • 5:30 • New</div>
                        </div>
                        <button class="nav-btn" id="new-heart-3" onclick="event.stopPropagation(); toggleChartHeart(this, 'new-3')">🤍</button>
                    </div>
                    
                    <div class="section-header">
                        <div class="section-title">🔥 Hot New Albums</div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                        <div onclick="openAlbum('Electric Hearts')" style="background: linear-gradient(135deg, var(--primary), var(--secondary)); aspect-ratio: 1; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s;">
                            <div style="font-size: 48px; margin-bottom: 8px;">🎵</div>
                            <div style="font-size: 14px; font-weight: 600;">Electric Hearts</div>
                            <div style="font-size: 12px; opacity: 0.8;">Various Artists</div>
                        </div>
                        <div onclick="openAlbum('Ocean Dreams')" style="background: linear-gradient(135deg, var(--success), var(--accent)); aspect-ratio: 1; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s;">
                            <div style="font-size: 48px; margin-bottom: 8px;">🌊</div>
                            <div style="font-size: 14px; font-weight: 600;">Ocean Dreams</div>
                            <div style="font-size: 12px; opacity: 0.8;">Calm Collective</div>
                        </div>
                    </div>
                    
                    <button class="btn" style="margin-top: 16px;" onclick="browseAllNewReleases()">
                        Browse All New Releases
                    </button>
                `;
            } else if (query === 'Discover Weekly') {
                return `
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="font-size: 64px; margin-bottom: 16px;">🌟</div>
                        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Discover Weekly</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">Personalized recommendations just for you</div>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); padding: 16px; border-radius: 12px; margin-bottom: 20px; cursor: pointer;" onclick="playYourMix()">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 40px;">🎧</div>
                            <div style="flex: 1;">
                                <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">Your Mix</div>
                                <div style="font-size: 13px; opacity: 0.9;">30 songs • Updated Weekly</div>
                            </div>
                            <button class="nav-btn" onclick="event.stopPropagation(); playYourMix()">▶️</button>
                        </div>
                    </div>
                    
                    <div class="section-header">
                        <div class="section-title">✨ Recommended for You</div>
                    </div>
                    
                    <div class="list-item" onclick="closeModal('musicSearchResults'); showToast('🎵 Playing Whisper Wind')">
                        <div class="list-item-icon">🍃</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Whisper Wind</div>
                            <div class="list-item-subtitle">Acoustic Dreams • 3:50</div>
                        </div>
                        <button class="nav-btn" id="rec-heart-1" onclick="event.stopPropagation(); toggleChartHeart(this, 'rec-1')">🤍</button>
                    </div>
                    
                    <div class="list-item" onclick="closeModal('musicSearchResults'); showToast('🎵 Playing Cosmic Journey')">
                        <div class="list-item-icon">🚀</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Cosmic Journey</div>
                            <div class="list-item-subtitle">Space Sounds • 6:15</div>
                        </div>
                        <button class="nav-btn" id="rec-heart-2" onclick="event.stopPropagation(); toggleChartHeart(this, 'rec-2')">🤍</button>
                    </div>
                    
                    <div class="list-item" onclick="closeModal('musicSearchResults'); showToast('🎵 Playing Golden Hour')">
                        <div class="list-item-icon">🌅</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Golden Hour</div>
                            <div class="list-item-subtitle">Sunset Melodies • 4:30</div>
                        </div>
                        <button class="nav-btn" id="rec-heart-3" onclick="event.stopPropagation(); toggleChartHeart(this, 'rec-3')">🤍</button>
                    </div>
                    
                    <div class="section-header">
                        <div class="section-title">🎯 Based on Your Taste</div>
                    </div>
                    
                    <div class="list-item" onclick="closeModal('musicSearchResults'); showToast('🎵 Playing Midnight Jazz')">
                        <div class="list-item-icon">🎷</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Midnight Jazz</div>
                            <div class="list-item-subtitle">Smooth Grooves • 5:20</div>
                        </div>
                        <button class="nav-btn" id="taste-heart-1" onclick="event.stopPropagation(); toggleChartHeart(this, 'taste-1')">🤍</button>
                    </div>
                    
                    <div class="list-item" onclick="closeModal('musicSearchResults'); showToast('🎵 Playing Thunder Road')">
                        <div class="list-item-icon">⚡</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Thunder Road</div>
                            <div class="list-item-subtitle">Rock Legends • 4:45</div>
                        </div>
                        <button class="nav-btn" id="taste-heart-2" onclick="event.stopPropagation(); toggleChartHeart(this, 'taste-2')">🤍</button>
                    </div>
                    
                    <button class="btn" style="margin-top: 16px; background: var(--glass);" onclick="refreshRecommendations()">
                        🔄 Refresh Recommendations
                    </button>
                `;
            }
            
            return '<div>Loading...</div>';
        }
        
        // Toggle heart in charts/recommendations - universal function
        function toggleChartHeart(button, songId) {
            if (button.textContent === '🤍') {
                button.textContent = '❤️';
                showToast('Added to library ❤️');
            } else {
                button.textContent = '🤍';
                showToast('Removed from library');
            }
        }
        
        // Load more charts function
        function loadMoreCharts() {
            showToast('Loading more charts... 📊');
            setTimeout(() => {
                showToast('Songs 7-20 loaded! Scroll to view more');
            }, 1000);
        }
        
        // Album Data
        const albumsData = {
            'Electric Hearts': {
                title: 'Electric Hearts',
                artist: 'Various Artists',
                year: '2025',
                genre: 'Electronic/Pop',
                emoji: '🎵',
                gradient: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                tracks: [
                    { id: 1, title: 'Electric Love', artist: 'Neon Nights', duration: '3:45' },
                    { id: 2, title: 'Heartbeat', artist: 'Pulse Wave', duration: '4:12' },
                    { id: 3, title: 'Digital Dreams', artist: 'Synthwave Society', duration: '3:55' },
                    { id: 4, title: 'Voltage', artist: 'Current Flow', duration: '3:30' },
                    { id: 5, title: 'Circuit Breaker', artist: 'Electric Pulse', duration: '4:05' },
                    { id: 6, title: 'Spark', artist: 'Lightning Strike', duration: '3:20' },
                    { id: 7, title: 'Power Grid', artist: 'Energy Source', duration: '4:30' },
                    { id: 8, title: 'Charged Up', artist: 'Voltage Masters', duration: '3:40' }
                ]
            },
            'Ocean Dreams': {
                title: 'Ocean Dreams',
                artist: 'Calm Collective',
                year: '2025',
                genre: 'Ambient/Chill',
                emoji: '🌊',
                gradient: 'linear-gradient(135deg, var(--success), var(--accent))',
                tracks: [
                    { id: 1, title: 'Ocean Waves', artist: 'Calm Collective', duration: '5:12' },
                    { id: 2, title: 'Seafoam', artist: 'Tidal Wave', duration: '4:45' },
                    { id: 3, title: 'Deep Blue', artist: 'Aqua Sound', duration: '5:30' },
                    { id: 4, title: 'Coastal Breeze', artist: 'Beach Vibes', duration: '4:20' },
                    { id: 5, title: 'Tide Pool', artist: 'Marine Life', duration: '4:55' },
                    { id: 6, title: 'Moonlit Waters', artist: 'Night Ocean', duration: '5:40' },
                    { id: 7, title: 'Coral Reef', artist: 'Underwater', duration: '4:10' },
                    { id: 8, title: 'Sunset Sail', artist: 'Horizon', duration: '5:05' }
                ]
            }
        };

        // Open album function - Now opens full album dashboard
        function openAlbum(albumName) {
            const album = albumsData[albumName];
            if (!album) {
                showToast(`Album not found: ${albumName}`);
                return;
            }

            // Create album modal dynamically
            const albumModalHTML = `
                <div id="albumDetailsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeAlbumModal()">✕</div>
                        <div class="modal-title">Album</div>
                        <button class="nav-btn" onclick="event.stopPropagation(); toggleAlbumLike('${albumName}')">
                            <span id="albumLikeBtn">🤍</span>
                        </button>
                    </div>
                    <div class="modal-content">
                        <!-- Album Cover -->
                        <div style="width: 100%; max-width: 280px; aspect-ratio: 1; margin: 0 auto 20px; background: ${album.gradient}; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 100px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
                            ${album.emoji}
                        </div>
                        
                        <!-- Album Info -->
                        <div style="text-align: center; margin-bottom: 24px;">
                            <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">${album.title}</div>
                            <div style="font-size: 16px; color: var(--text-secondary); margin-bottom: 4px;">${album.artist}</div>
                            <div style="font-size: 13px; color: var(--text-muted);">${album.year} • ${album.genre} • ${album.tracks.length} tracks</div>
                        </div>
                        
                        <!-- Album Actions -->
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px;">
                            <button class="btn" onclick="playAlbum('${albumName}')">
                                ▶️ Play All
                            </button>
                            <button class="btn" style="background: var(--glass);" onclick="shuffleAlbum('${albumName}')">
                                🔀 Shuffle
                            </button>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
                            <button class="btn" style="background: var(--glass); font-size: 13px; padding: 12px;" onclick="shareAlbum('${albumName}')">
                                🔗 Share
                            </button>
                            <button class="btn" style="background: var(--glass); font-size: 13px; padding: 12px;" onclick="downloadAlbum('${albumName}')">
                                ⬇️ Download
                            </button>
                            <button class="btn" style="background: var(--glass); font-size: 13px; padding: 12px;" onclick="addAlbumToPlaylist('${albumName}')">
                                ➕ Add
                            </button>
                        </div>
                        
                        <!-- Track List -->
                        <div class="section-header">
                            <div class="section-title">Tracks</div>
                            <div class="section-link">${album.tracks.length} songs</div>
                        </div>
                        
                        ${album.tracks.map((track, index) => `
                            <div class="list-item" onclick="playAlbumTrack('${albumName}', ${index})" style="margin-bottom: 8px; cursor: pointer; transition: all 0.2s;">
                                <div style="width: 36px; height: 36px; background: var(--glass); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">
                                    ${index + 1}
                                </div>
                                <div class="list-item-content">
                                    <div class="list-item-title">${track.title}</div>
                                    <div class="list-item-subtitle">${track.artist} • ${track.duration}</div>
                                </div>
                                <button class="nav-btn" id="album-track-heart-${index}" onclick="event.stopPropagation(); toggleAlbumTrackHeart(${index})">🤍</button>
                            </div>
                        `).join('')}
                        
                        <!-- Album Stats -->
                        <div class="section-header" style="margin-top: 24px;">
                            <div class="section-title">Album Info</div>
                        </div>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">2.4M</div>
                                <div class="stat-label">Plays</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">125K</div>
                                <div class="stat-label">Likes</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${album.year}</div>
                                <div class="stat-label">Release Year</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${album.tracks.length}</div>
                                <div class="stat-label">Songs</div>
                            </div>
                        </div>
                        
                        <!-- Related Albums -->
                        <div class="section-header" style="margin-top: 24px;">
                            <div class="section-title">You May Also Like</div>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                            ${getRelatedAlbums(albumName).map(relatedAlbum => `
                                <div onclick="openAlbum('${relatedAlbum.name}')" style="background: ${relatedAlbum.gradient}; aspect-ratio: 1; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s; padding: 16px;">
                                    <div style="font-size: 40px; margin-bottom: 8px;">${relatedAlbum.emoji}</div>
                                    <div style="font-size: 13px; font-weight: 600; text-align: center;">${relatedAlbum.name}</div>
                                    <div style="font-size: 11px; opacity: 0.8; text-align: center;">${relatedAlbum.artist}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            // Remove existing album modal if any
            const existingModal = document.getElementById('albumDetailsModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // Add new album modal
            document.body.insertAdjacentHTML('beforeend', albumModalHTML);
            
            // Close the music search results modal
            closeModal('musicSearchResults');
            
            showToast(`Opening ${albumName} 🎵`);
        }
        
        // Get related albums
        function getRelatedAlbums(currentAlbum) {
            const allAlbums = [
                { name: 'Electric Hearts', artist: 'Various Artists', emoji: '🎵', gradient: 'linear-gradient(135deg, var(--primary), var(--secondary))' },
                { name: 'Ocean Dreams', artist: 'Calm Collective', emoji: '🌊', gradient: 'linear-gradient(135deg, var(--success), var(--accent))' }
            ];
            
            return allAlbums.filter(album => album.name !== currentAlbum);
        }
        
        // Close album modal
        function closeAlbumModal() {
            const modal = document.getElementById('albumDetailsModal');
            if (modal) {
                modal.remove();
            }
        }
        
        // Toggle album like
        function toggleAlbumLike(albumName) {
            const likeBtn = document.getElementById('albumLikeBtn');
            if (likeBtn.textContent === '🤍') {
                likeBtn.textContent = '❤️';
                showToast(`Added ${albumName} to library ❤️`);
            } else {
                likeBtn.textContent = '🤍';
                showToast(`Removed ${albumName} from library`);
            }
        }
        
        // Play entire album
        function playAlbum(albumName) {
            closeAlbumModal();
            showToast(`▶️ Playing ${albumName} album...`);
            setTimeout(() => {
                showToast(`Now playing all ${albumsData[albumName].tracks.length} tracks!`);
            }, 1000);
        }
        
        // Shuffle album
        function shuffleAlbum(albumName) {
            closeAlbumModal();
            showToast(`🔀 Shuffling ${albumName}...`);
            setTimeout(() => {
                showToast('Album playing in shuffle mode!');
            }, 1000);
        }
        
        // Share album
        function shareAlbum(albumName) {
            showToast(`Sharing ${albumName}... 🔗`);
            setTimeout(() => {
                showToast('Album link copied to clipboard!');
            }, 800);
        }
        
        // Download album
        function downloadAlbum(albumName) {
            showToast(`Downloading ${albumName}... ⬇️`);
            setTimeout(() => {
                showToast(`${albumsData[albumName].tracks.length} tracks downloaded!`);
            }, 1500);
        }
        
        // Add album to playlist
        function addAlbumToPlaylist(albumName) {
            showToast(`Adding ${albumName} to playlist... ➕`);
            setTimeout(() => {
                showToast('Album added to your playlist!');
            }, 800);
        }
        
        // Play specific track from album
        function playAlbumTrack(albumName, trackIndex) {
            const album = albumsData[albumName];
            const track = album.tracks[trackIndex];
            
            closeAlbumModal();
            showToast(`🎵 Playing: ${track.title}`);
            
            // Simulate starting playback
            setTimeout(() => {
                showToast(`Now playing ${track.title} by ${track.artist}`);
            }, 800);
        }
        
        // Toggle heart for album track
        function toggleAlbumTrackHeart(trackIndex) {
            const heartBtn = document.getElementById(`album-track-heart-${trackIndex}`);
            if (heartBtn.textContent === '🤍') {
                heartBtn.textContent = '❤️';
                showToast('Added to library ❤️');
            } else {
                heartBtn.textContent = '🤍';
                showToast('Removed from library');
            }
        }
        
        // Browse all new releases function
        function browseAllNewReleases() {
            showToast('Loading all new releases... 🆕');
            setTimeout(() => {
                showToast('Browse complete catalog of new music');
            }, 1000);
        }
        
        // Play your mix function
        function playYourMix() {
            closeModal('musicSearchResults');
            showToast('🎧 Playing Your Mix...');
            setTimeout(() => {
                showToast('30 personalized songs now playing!');
            }, 1000);
        }
        
        // Refresh recommendations function
        function refreshRecommendations() {
            showToast('Refreshing recommendations... 🔄');
            setTimeout(() => {
                showToast('New recommendations loaded!');
            }, 1500);
        }

        // Open create music playlist modal
        function openCreateMusicPlaylistModal() {
            const modalHTML = `
                <div id="createMusicPlaylistModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('createMusicPlaylist')">✕</div>
                        <div class="modal-title">➕ Create Playlist</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">📁</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">New Playlist</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Organize your favorite tracks</div>
                        </div>
                        <input type="text" class="input-field" placeholder="Playlist name..." id="newPlaylistName" />
                        <textarea class="input-field textarea-field" placeholder="Description (optional)" id="newPlaylistDescription"></textarea>
                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">Make Public</div>
                                <div class="list-item-subtitle">Others can see your playlist</div>
                            </div>
                            <div class="toggle-switch" id="playlistPublicToggle" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                        <button class="btn" onclick="createMusicPlaylist()">Create Playlist</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // Create music playlist
        function createMusicPlaylist() {
            const name = document.getElementById('newPlaylistName').value;
            
            if (!name.trim()) {
                showToast('Please enter a playlist name');
                return;
            }
            
            const description = document.getElementById('newPlaylistDescription').value;
            const isPublic = document.getElementById('playlistPublicToggle').classList.contains('active');
            
            const newPlaylist = {
                id: Date.now(),
                name: name,
                description: description || 'My playlist',
                isPublic: isPublic,
                tracks: [],
                createdAt: new Date()
            };
            
            musicPlaylists.push(newPlaylist);
            closeModal('createMusicPlaylist');
            showToast(`Playlist "${name}" created! 📁`);
        }

        // Open audio quality modal
        function openAudioQualityModal() {
            const modalHTML = `
                <div id="audioQualityModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('audioQuality')">✕</div>
                        <div class="modal-title">⚙️ Audio Quality</div>
                    </div>
                    <div class="modal-content">
                        <div style="margin-bottom: 20px;">
                            <div style="font-size: 14px; color: var(--text-secondary);">Higher quality uses more data and storage</div>
                        </div>
                        <div class="list-item" onclick="selectAudioQuality('Low', '96 kbps', this)">
                            <div class="list-item-content">
                                <div class="list-item-title">Low</div>
                                <div class="list-item-subtitle">96 kbps • ~1 MB/min</div>
                            </div>
                        </div>
                        <div class="list-item" onclick="selectAudioQuality('Medium', '128 kbps', this)">
                            <div class="list-item-content">
                                <div class="list-item-title">Medium</div>
                                <div class="list-item-subtitle">128 kbps • ~1.5 MB/min</div>
                            </div>
                        </div>
                        <div class="list-item" onclick="selectAudioQuality('High', '320 kbps', this)" style="background: rgba(79, 70, 229, 0.1); border-color: var(--primary);">
                            <div class="list-item-content">
                                <div class="list-item-title">High</div>
                                <div class="list-item-subtitle">320 kbps • ~3.5 MB/min</div>
                            </div>
                            <div style="color: var(--primary); font-weight: 600;">✓</div>
                        </div>
                        <div class="list-item" onclick="selectAudioQuality('Lossless', '1411 kbps', this)">
                            <div class="list-item-content">
                                <div class="list-item-title">Lossless</div>
                                <div class="list-item-subtitle">1411 kbps • ~10 MB/min</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // Select audio quality
        function selectAudioQuality(quality, bitrate, element) {
            // Remove selection from all items
            const modal = document.getElementById('audioQualityModal');
            modal.querySelectorAll('.list-item').forEach(item => {
                item.style.background = 'var(--glass)';
                item.style.borderColor = 'var(--glass-border)';
                const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                if (checkmark) checkmark.remove();
            });
            
            // Add selection to clicked item
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            closeModal('audioQuality');
            showToast(`Quality set to ${quality} (${bitrate})`);
        }

        // Open music queue modal
        function openMusicQueueModal() {
            const modalHTML = `
                <div id="musicQueueModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('musicQueue')">✕</div>
                        <div class="modal-title">📋 Queue</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🎵</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Up Next</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">3 songs in queue</div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">🌟</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Starlight Dreams</div>
                                <div class="list-item-subtitle">The Moonwalkers • 4:05</div>
                            </div>
                            <button class="nav-btn" onclick="event.stopPropagation(); removeFromQueue(1)">✕</button>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">⚡</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Electric Pulse</div>
                                <div class="list-item-subtitle">Neon Nights • 3:18</div>
                            </div>
                            <button class="nav-btn" onclick="event.stopPropagation(); removeFromQueue(2)">✕</button>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">🌊</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Ocean Waves</div>
                                <div class="list-item-subtitle">Calm Collective • 5:12</div>
                            </div>
                            <button class="nav-btn" onclick="event.stopPropagation(); removeFromQueue(3)">✕</button>
                        </div>
                        <button class="btn" style="background: var(--error); margin-top: 16px;" onclick="clearMusicQueue()">Clear Queue</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // Open music lyrics modal
        function openMusicLyricsModal() {
            const modalHTML = `
                <div id="musicLyricsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('musicLyrics')">✕</div>
                        <div class="modal-title">📝 Lyrics</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Starlight Dreams</div>
                            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px;">The Moonwalkers</div>
                        </div>
                        <div style="text-align: center; line-height: 2; font-size: 16px; color: var(--text-secondary);">
                            <div style="margin-bottom: 12px; color: white; font-weight: 600;">Verse 1:</div>
                            <div style="margin-bottom: 12px;">In the silence of the night</div>
                            <div style="margin-bottom: 12px;">Stars are shining oh so bright</div>
                            <div style="margin-bottom: 12px;">Dancing in the moonlight glow</div>
                            <div style="margin-bottom: 20px;">Let the rhythm take control</div>
                            
                            <div style="margin-bottom: 12px; color: white; font-weight: 600;">Chorus:</div>
                            <div style="margin-bottom: 12px;">Starlight dreams carry me away</div>
                            <div style="margin-bottom: 12px;">To a place where I can stay</div>
                            <div style="margin-bottom: 12px;">In this moment here with you</div>
                            <div style="margin-bottom: 20px;">All my dreams are coming true</div>
                        </div>
                        <button class="btn" style="background: var(--glass); margin-top: 16px;" onclick="shareLyrics()">📤 Share Lyrics</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // Open music share modal
        function openMusicShareModal() {
            const modalHTML = `
                <div id="musicShareModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('musicShare')">✕</div>
                        <div class="modal-title">🔗 Share Music</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🎵</div>
                            <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Starlight Dreams</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">The Moonwalkers</div>
                        </div>
                        <div class="section-header">
                            <div class="section-title">Share to</div>
                        </div>
                        <div class="list-item" onclick="shareToSocial('Facebook')">
                            <div class="list-item-icon">📘</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Facebook</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        <div class="list-item" onclick="shareToSocial('Twitter')">
                            <div class="list-item-icon">🐦</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Twitter</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        <div class="list-item" onclick="shareToSocial('WhatsApp')">
                            <div class="list-item-icon">💬</div>
                            <div class="list-item-content">
                                <div class="list-item-title">WhatsApp</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        <div class="list-item" onclick="copyMusicLink()">
                            <div class="list-item-icon">🔗</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Copy Link</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // Open music download modal
        function openMusicDownloadModal() {
            const modalHTML = `
                <div id="musicDownloadModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('musicDownload')">✕</div>
                        <div class="modal-title">⬇️ Download</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">💾</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Download for Offline</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Listen without internet connection</div>
                        </div>
                        <div class="list-item" onclick="downloadSong('High')">
                            <div class="list-item-content">
                                <div class="list-item-title">High Quality</div>
                                <div class="list-item-subtitle">320 kbps • ~3.5 MB</div>
                            </div>
                            <div style="color: var(--primary); font-weight: 600;">✓</div>
                        </div>
                        <div class="list-item" onclick="downloadSong('Medium')">
                            <div class="list-item-content">
                                <div class="list-item-title">Medium Quality</div>
                                <div class="list-item-subtitle">128 kbps • ~1.5 MB</div>
                            </div>
                        </div>
                        <div class="list-item" onclick="downloadSong('Low')">
                            <div class="list-item-content">
                                <div class="list-item-title">Low Quality</div>
                                <div class="list-item-subtitle">96 kbps • ~1 MB</div>
                            </div>
                        </div>
                        <button class="btn" style="margin-top: 16px;" onclick="viewDownloadedSongs()">View Downloaded Songs</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // Queue functions
        function removeFromQueue(id) {
            showToast(`Removed from queue`);
        }

        function clearMusicQueue() {
            closeModal('musicQueue');
            showToast('Queue cleared');
        }

        // Lyrics functions
        function shareLyrics() {
            closeModal('musicLyrics');
            showToast('Lyrics shared! 📤');
        }

        // Share functions
        function shareToSocial(platform) {
            closeModal('musicShare');
            showToast(`Shared to ${platform}! 📤`);
        }

        function copyMusicLink() {
            closeModal('musicShare');
            showToast('Link copied to clipboard! 🔗');
        }

        // Download functions
        function downloadSong(quality) {
            closeModal('musicDownload');
            showToast(`Downloading in ${quality} quality... 💾`);
            setTimeout(() => {
                showToast('Download complete! ✓');
            }, 2000);
        }

        function viewDownloadedSongs() {
            closeModal('musicDownload');
            showToast('Opening downloaded songs... 📥');
        }

        // Wrapper functions to open modals from music player
        window.openSearchMusicFromPlayer = openSearchMusicModal;
        window.openCreatePlaylistFromPlayer = openCreateMusicPlaylistModal;
        window.openAudioQualityFromPlayer = openAudioQualityModal;
        window.openMusicQueueFromPlayer = openMusicQueueModal;
        window.openMusicLyricsFromPlayer = openMusicLyricsModal;
        window.openMusicShareFromPlayer = openMusicShareModal;
        window.openMusicDownloadFromPlayer = openMusicDownloadModal;

        // ========== MESSAGING FEATURES FUNCTIONS ==========
        
        // Video call
        function startVideoCall() {
            openModal('videoCall');
            
            // Simulate call connecting
            setTimeout(() => {
                document.getElementById('callStatus').textContent = 'Ringing...';
            }, 500);
            
            setTimeout(() => {
                document.getElementById('callStatus').textContent = 'Connected';
            }, 2000);
            
            showToast('Starting video call... 📹');
        }

        // Phone call
        function startPhoneCall() {
            openModal('phoneCall');
            
            // Simulate call connecting
            setTimeout(() => {
                document.getElementById('phoneCallStatus').textContent = 'Ringing...';
            }, 500);
            
            setTimeout(() => {
                document.getElementById('phoneCallStatus').textContent = 'Connected';
            }, 2000);
            
            showToast('Starting phone call... 📞');
        }

        // End video call
        function endCall() {
            closeModal('videoCall');
            showToast('Video call ended');
        }

        // End phone call
        function endPhoneCall() {
            closeModal('phoneCall');
            showToast('Phone call ended');
        }

        // Toggle mute in video call
        function toggleMute() {
            showToast('Microphone toggled');
        }

        // Toggle video in video call
        function toggleVideo() {
            showToast('Video toggled');
        }

        // Toggle camera in video call
        function toggleCallCamera() {
            showToast('Camera switched');
        }

        // Toggle speaker in phone call
        function toggleSpeaker() {
            showToast('Speaker toggled');
        }

        // Toggle mute in phone call
        function togglePhoneMute() {
            showToast('Microphone toggled');
        }

        // Open messaging options (files, location, memes)
        function openMessagingOptions() {
            openModal('messagingOptions');
        }

        // Share file
        function shareFile() {
            closeModal('messagingOptions');
            openModal('filePicker');
        }

        // Share location
        function shareLocation() {
            closeModal('messagingOptions');
            openModal('locationShare');
        }

        // Share meme
        function shareMeme() {
            closeModal('messagingOptions');
            openModal('memeBrowser');
        }

        // Share contact
        function shareContact() {
            closeModal('messagingOptions');
            showToast('Opening contacts... 👤');
            setTimeout(() => {
                showToast('Select a contact to share');
            }, 800);
        }

        // Open camera for message
        function openCameraForMessage() {
            openModal('cameraFilters');
        }

        // Open gallery for message
        function openGalleryForMessage() {
            openModal('galleryMemes');
        }

        // Record voice message
        function recordVoiceMessage() {
            openModal('voiceMessage');
        }

        // Switch gallery tabs (Photos/Memes)
        function switchGalleryTab(element, tab) {
            // Remove active class from all buttons
            element.parentElement.querySelectorAll('.pill-nav-button').forEach(btn => btn.classList.remove('active'));
            element.classList.add('active');
            
            // Hide all tabs
            document.querySelectorAll('#galleryMemesModal .tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show selected tab
            if (tab === 'photos') {
                document.getElementById('galleryPhotosTab').classList.add('active');
            } else {
                document.getElementById('galleryMemesTab').classList.add('active');
            }
        }

        // Select gallery photo
        function selectGalleryPhoto(emoji) {
            closeModal('galleryMemes');
            showToast('Photo selected! 📷');
            
            // Simulate sending photo
            setTimeout(() => {
                addMessageToChat('photo', emoji);
                showToast('Photo sent! ✓');
            }, 500);
        }

        // Select meme
        function selectMeme(emoji) {
            showToast('Meme selected! 😂');
        }

        // Select and send meme
        function selectAndSendMeme(emoji) {
            closeModal('memeBrowser');
            showToast('Sending meme... 😂');
            
            // Simulate sending meme
            setTimeout(() => {
                addMessageToChat('meme', emoji);
                showToast('Meme sent! ✓');
            }, 500);
        }

        // Take picture with camera
        function takePicture() {
            closeModal('cameraFilters');
            showToast('Taking photo... 📸');
            
            setTimeout(() => {
                showToast('Photo captured! ✓');
            }, 800);
        }

        // Record video
        function recordVideo() {
            closeModal('cameraFilters');
            showToast('Recording video... 🎥');
            
            setTimeout(() => {
                showToast('Video recorded! ✓');
            }, 2000);
        }

        // Apply filter
        function applyFilter(filter) {
            showToast(`Filter applied: ${filter}`);
        }

        // Toggle voice recording
        let isRecordingVoice = false;
        let voiceRecordingTimer = null;
        let voiceRecordingSeconds = 0;

        function toggleVoiceRecording() {
            const icon = document.getElementById('voiceMessageIcon');
            const status = document.getElementById('voiceMessageStatus');
            const timer = document.getElementById('voiceMessageTimer');
            const recordBtn = document.getElementById('recordVoiceBtn');
            const sendBtn = document.getElementById('sendVoiceBtn');

            if (!isRecordingVoice) {
                // Start recording
                isRecordingVoice = true;
                voiceRecordingSeconds = 0;
                
                icon.textContent = '🔴';
                status.textContent = 'Recording...';
                status.style.display = 'none';
                timer.style.display = 'block';
                recordBtn.style.display = 'none';
                sendBtn.style.display = 'block';
                
                // Start timer
                voiceRecordingTimer = setInterval(() => {
                    voiceRecordingSeconds++;
                    const minutes = Math.floor(voiceRecordingSeconds / 60);
                    const seconds = voiceRecordingSeconds % 60;
                    timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }, 1000);
                
                showToast('Recording started... 🎤');
            } else {
                // Stop recording
                isRecordingVoice = false;
                clearInterval(voiceRecordingTimer);
                
                icon.textContent = '✓';
                status.textContent = 'Recording Complete';
                status.style.display = 'block';
                timer.style.display = 'block';
                
                showToast('Recording stopped');
            }
        }

        // Send voice message
        function sendVoiceMessage() {
            if (!isRecordingVoice && voiceRecordingSeconds > 0) {
                closeModal('voiceMessage');
                showToast('Voice message sent! 🎤');
                
                // Reset voice recording state
                const icon = document.getElementById('voiceMessageIcon');
                const status = document.getElementById('voiceMessageStatus');
                const timer = document.getElementById('voiceMessageTimer');
                const recordBtn = document.getElementById('recordVoiceBtn');
                const sendBtn = document.getElementById('sendVoiceBtn');
                
                icon.textContent = '🎤';
                status.textContent = 'Tap to Record';
                status.style.display = 'block';
                timer.style.display = 'none';
                timer.textContent = '00:00';
                recordBtn.style.display = 'block';
                sendBtn.style.display = 'none';
                voiceRecordingSeconds = 0;
                
                // Simulate adding voice message to chat
                setTimeout(() => {
                    addMessageToChat('voice', '🎤');
                }, 300);
            }
        }

        // Select file from device
        function selectFileFromDevice() {
            showToast('Opening file browser...');
            setTimeout(() => {
                showToast('Select a file to share');
            }, 800);
        }

        // Send selected file
        function sendSelectedFile(filename) {
            closeModal('filePicker');
            showToast(`Sending ${filename}...`);
            
            setTimeout(() => {
                addMessageToChat('file', `📄 ${filename}`);
                showToast('File sent! ✓');
            }, 1000);
        }

        // Send current location
        function sendCurrentLocation() {
            closeModal('locationShare');
            showToast('Sending location... 📍');
            
            setTimeout(() => {
                addMessageToChat('location', '📍 San Francisco, CA');
                showToast('Location sent! ✓');
            }, 800);
        }

        // Send chat message
        function sendChatMessage() {
            const input = document.getElementById('chatMessageInput');
            const message = input.value.trim();
            
            if (!message) {
                showToast('Please type a message');
                return;
            }
            
            addMessageToChat('text', message);
            input.value = '';
            showToast('Message sent! ✓');
        }

        // Add message to chat (helper function)
        function addMessageToChat(type, content) {
            const chatMessages = document.querySelector('#chatWindowModal .chat-messages');
            if (!chatMessages) return;
            
            const messageBubble = document.createElement('div');
            messageBubble.className = 'chat-bubble sent';
            
            if (type === 'photo' || type === 'meme') {
                messageBubble.innerHTML = `<div style="font-size: 48px;">${content}</div>`;
            } else if (type === 'voice') {
                messageBubble.innerHTML = `<div style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 24px;">${content}</span><span style="font-size: 14px;">0:15</span></div>`;
            } else if (type === 'file') {
                messageBubble.innerHTML = `<div style="display: flex; align-items: center; gap: 8px;">${content}</div>`;
            } else if (type === 'location') {
                messageBubble.innerHTML = `<div style="display: flex; align-items: center; gap: 8px;">${content}</div>`;
            } else {
                messageBubble.textContent = content;
            }
            
            chatMessages.appendChild(messageBubble);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Add enter key support for chat input
        document.addEventListener('DOMContentLoaded', () => {
            const chatInput = document.getElementById('chatMessageInput');
            if (chatInput) {
                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        sendChatMessage();
                    }
                });
            }
        });

        // ========== LIVE STREAMING FEATURES ==========
        
        // Select stream quality
        function selectStreamQuality(quality, element) {
            // Remove selection from all items
            const modal = document.getElementById('streamQualitySettingsModal');
            modal.querySelectorAll('.list-item').forEach(item => {
                item.style.background = 'var(--glass)';
                item.style.borderColor = 'var(--glass-border)';
                const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                if (checkmark) checkmark.remove();
            });
            
            // Add selection to clicked item
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            showToast(`Stream quality set to ${quality}`);
            
            // Update the quality display in setup modal if it exists
            const qualityDisplay = document.querySelector('#setupLiveStreamModal .list-item-subtitle');
            if (qualityDisplay && qualityDisplay.parentElement.querySelector('.list-item-title').textContent === 'Quality') {
                qualityDisplay.textContent = `${quality} HD • 30 FPS`;
            }
        }
        
        // Select stream frame rate
        function selectStreamFrameRate(fps, element) {
            // Remove selection from all frame rate items
            const modal = document.getElementById('streamQualitySettingsModal');
            const frameRateItems = Array.from(modal.querySelectorAll('.list-item')).slice(4, 6); // Frame rate items
            
            frameRateItems.forEach(item => {
                item.style.background = 'var(--glass)';
                item.style.borderColor = 'var(--glass-border)';
                const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                if (checkmark) checkmark.remove();
            });
            
            // Add selection to clicked item
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            showToast(`Frame rate set to ${fps}`);
        }
        
        // View all donations
        function viewAllDonations() {
            closeModal('streamDonations');
            
            // Create donations history modal
            const modalHTML = `
                <div id="donationsHistoryModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeDonationsHistory()">✕</div>
                        <div class="modal-title">💰 Donation History</div>
                    </div>
                    <div class="modal-content">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">$247</div>
                                <div class="stat-label">This Month</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">$1,234</div>
                                <div class="stat-label">Total Earned</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">34</div>
                                <div class="stat-label">Supporters</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">$23</div>
                                <div class="stat-label">Average</div>
                            </div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Recent Donations</div>
                            <div class="section-link">Last 30 days</div>
                        </div>
                        
                        <div class="list-item">
                            <div class="post-avatar">👤</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Sarah M. donated $10</div>
                                <div class="list-item-subtitle">Just now • "Great stream!"</div>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="post-avatar">😊</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Mike J. donated $25</div>
                                <div class="list-item-subtitle">1 day ago • "Keep it up!"</div>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="post-avatar">🎨</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Emily R. donated $50</div>
                                <div class="list-item-subtitle">3 days ago • "Amazing content!"</div>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="post-avatar">🚀</div>
                            <div class="list-item-content">
                                <div class="list-item-title">David K. donated $15</div>
                                <div class="list-item-subtitle">5 days ago • "Thanks for the stream"</div>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="post-avatar">💻</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Tech Fan donated $100</div>
                                <div class="list-item-subtitle">1 week ago • "Awesome work!"</div>
                            </div>
                        </div>
                        
                        <button class="btn" style="margin-top: 16px; background: var(--glass);" onclick="exportDonationHistory()">
                            📊 Export History
                        </button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            showToast('Loading donation history... 💰');
        }
        
        // Close donations history
        function closeDonationsHistory() {
            const modal = document.getElementById('donationsHistoryModal');
            if (modal) {
                modal.remove();
            }
        }
        
        // Export donation history
        function exportDonationHistory() {
            showToast('Exporting donation history... 📊');
            setTimeout(() => {
                showToast('Export ready! Check your downloads folder');
            }, 1500);
        }
        
        // Remove moderator
        function removeModerator(name) {
            showToast(`Removed ${name} as moderator`);
        }
        
        // View banned users
        function viewBannedUsers() {
            closeModal('streamModerators');
            
            // Create banned users modal
            const modalHTML = `
                <div id="bannedUsersModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeBannedUsers()">✕</div>
                        <div class="modal-title">🚫 Banned Users</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🚫</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Banned Users List</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Users banned from your streams</div>
                        </div>
                        
                        <div class="list-item">
                            <div class="post-avatar">😠</div>
                            <div class="list-item-content">
                                <div class="list-item-title">SpamUser123</div>
                                <div class="list-item-subtitle">Banned 2 weeks ago • Spam</div>
                            </div>
                            <button class="friend-btn primary" style="padding: 6px 12px; font-size: 12px;" onclick="unbanUser('SpamUser123')">Unban</button>
                        </div>
                        <div class="list-item">
                            <div class="post-avatar">😡</div>
                            <div class="list-item-content">
                                <div class="list-item-title">ToxicViewer</div>
                                <div class="list-item-subtitle">Banned 1 month ago • Harassment</div>
                            </div>
                            <button class="friend-btn primary" style="padding: 6px 12px; font-size: 12px;" onclick="unbanUser('ToxicViewer')">Unban</button>
                        </div>
                        
                        <div style="background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; padding: 16px; margin-top: 20px;">
                            <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">💡 Note</div>
                            <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
                                Banned users cannot view or participate in your streams. They can be unbanned at any time.
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            showToast('Loading banned users list... 🚫');
        }
        
        // Close banned users
        function closeBannedUsers() {
            const modal = document.getElementById('bannedUsersModal');
            if (modal) {
                modal.remove();
            }
        }
        
        // Unban user
        function unbanUser(username) {
            showToast(`${username} has been unbanned ✓`);
            setTimeout(() => {
                showToast(`${username} can now view your streams again`);
            }, 1000);
        }
        
        // Create scheduled stream
        function createScheduledStream() {
            const title = document.getElementById('scheduledStreamTitle').value;
            const date = document.getElementById('scheduledStreamDate').value;
            const time = document.getElementById('scheduledStreamTime').value;
            
            if (!title || !date || !time) {
                showToast('Please fill in all required fields');
                return;
            }
            
            closeModal('scheduleStream');
            showToast('Stream scheduled successfully! 📅');
            
            // Clear the form
            document.getElementById('scheduledStreamTitle').value = '';
            document.getElementById('scheduledStreamDesc').value = '';
            document.getElementById('scheduledStreamDate').value = '';
            document.getElementById('scheduledStreamTime').value = '';
        }
        
        // Cancel scheduled stream
        function cancelScheduledStream(title) {
            showToast(`Cancelled: ${title}`);
        }
        
        // Connect platform for multi-streaming
        function connectPlatform(platform) {
            showToast(`Connecting to ${platform}...`);
            setTimeout(() => {
                showToast(`✓ ${platform} connected successfully!`);
            }, 1500);
        }
        
        // Connect new platform
        function connectNewPlatform() {
            showToast('Opening platform connections... 🌐');
            setTimeout(() => {
                showToast('Select a platform to connect');
            }, 800);
        }
        
        // Start live stream now
        function startLiveStreamNow() {
            const title = document.getElementById('liveStreamTitle').value;
            
            if (!title) {
                showToast('Please enter a stream title');
                return;
            }
            
            closeModal('setupLiveStream');
            showToast('🔴 Going live...');
            
            // Simulate stream starting
            setTimeout(() => {
                showToast('You are now LIVE! 🎥');
            }, 1500);
            
            setTimeout(() => {
                showToast('Stream started successfully! Viewers can now join.');
            }, 3000);
        }
        
        // Stream analytics dashboard
        window.liveStreaming = window.liveStreaming || {};
        window.liveStreaming.viewStreamAnalytics = function() {
            // Create analytics dashboard modal
            const modalHTML = `
                <div id="streamAnalyticsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeStreamAnalytics()">✕</div>
                        <div class="modal-title">📊 Stream Analytics</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">📊</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Stream Performance</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Your streaming statistics</div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Overall Stats</div>
                            <div class="section-link">Last 30 days</div>
                        </div>
                        
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">15</div>
                                <div class="stat-label">Total Streams</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">1,234</div>
                                <div class="stat-label">Total Viewers</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">82</div>
                                <div class="stat-label">Avg Viewers</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">45h</div>
                                <div class="stat-label">Total Duration</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">3.2h</div>
                                <div class="stat-label">Avg Duration</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">156</div>
                                <div class="stat-label">Peak Viewers</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">$247</div>
                                <div class="stat-label">Donations</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">89%</div>
                                <div class="stat-label">Engagement</div>
                            </div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Top Streams</div>
                        </div>
                        
                        <div class="list-item">
                            <div class="list-item-icon">🎮</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Gaming Marathon</div>
                                <div class="list-item-subtitle">156 peak viewers • 4h 30m</div>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">🎨</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Art Session</div>
                                <div class="list-item-subtitle">124 peak viewers • 3h 15m</div>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">💻</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Coding Stream</div>
                                <div class="list-item-subtitle">98 peak viewers • 2h 45m</div>
                            </div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Viewer Growth</div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 16px;">
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Growth This Month</div>
                            <div style="font-size: 48px; font-weight: 800; margin-bottom: 4px;">+23%</div>
                            <div style="font-size: 13px; opacity: 0.9;">Compared to last month</div>
                        </div>
                        
                        <button class="btn" style="background: var(--glass);" onclick="exportAnalytics()">
                            📊 Export Full Report
                        </button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            showToast('Loading stream analytics... 📊');
        };
        
        // Close stream analytics
        function closeStreamAnalytics() {
            const modal = document.getElementById('streamAnalyticsModal');
            if (modal) {
                modal.remove();
            }
        }
        
        // Export analytics
        function exportAnalytics() {
            showToast('Exporting analytics report... 📊');
            setTimeout(() => {
                showToast('Report exported successfully! ✓');
            }, 1500);
        }
        
        // ========== DONATIONS & TIPS FUNCTIONS ==========
        
        // Test donation alert
        function testDonationAlert() {
            showToast('Testing donation alert... 🔔');
            setTimeout(() => {
                showInAppNotification('💰', 'Test Alert', 'Sarah M. donated $10! "Great stream!"', { type: 'donation' });
            }, 800);
        }
        
        // Select minimum donation amount
        function selectMinimumDonation(amount, element) {
            // Remove selection from all items
            const modal = document.getElementById('minimumDonationModal');
            modal.querySelectorAll('.list-item').forEach(item => {
                item.style.background = 'var(--glass)';
                item.style.borderColor = 'var(--glass-border)';
                const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                if (checkmark) checkmark.remove();
            });
            
            // Add selection to clicked item
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            showToast(`Minimum donation set to ${amount}`);
        }
        
        // Set custom minimum amount
        function setCustomMinimum() {
            const input = document.getElementById('customMinAmount');
            const amount = input.value;
            
            if (!amount || amount <= 0) {
                showToast('Please enter a valid amount');
                return;
            }
            
            showToast(`Minimum donation set to $${amount}`);
            closeModal('minimumDonation');
        }
        
        // Open payment method details - NOW OPENS FULL DASHBOARD
        function openPaymentMethodDetails(method) {
            closeModal('paymentMethods');
            
            const paymentData = {
                'PayPal': {
                    email: 'john.doe@email.com',
                    status: 'Primary',
                    connected: 'Jan 2024',
                    transactions: 156,
                    totalReceived: '$2,450',
                    gradient: 'linear-gradient(135deg, #0070ba, #1546a0)',
                    emoji: '💳'
                },
                'Stripe': {
                    account: '****4532',
                    status: 'Connected',
                    connected: 'Mar 2024',
                    transactions: 89,
                    totalReceived: '$1,890',
                    gradient: 'linear-gradient(135deg, #635bff, #0a2540)',
                    emoji: '💎'
                },
                'Venmo': {
                    username: '[@username]',
                    status: 'Connected',
                    connected: 'May 2024',
                    transactions: 45,
                    totalReceived: '$780',
                    gradient: 'linear-gradient(135deg, #3d95ce, #008cff)',
                    emoji: '📱'
                }
            };
            
            const data = paymentData[method];
            if (!data) return;
            
            const modalHTML = `
                <div id="paymentMethodDetailsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closePaymentMethodDetails()">✕</div>
                        <div class="modal-title">${method} Details</div>
                        <button class="nav-btn" onclick="removePaymentMethod('${method}')">🗑️</button>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="width: 120px; height: 120px; background: ${data.gradient}; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 64px; margin: 0 auto 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
                                ${data.emoji}
                            </div>
                            <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">${method}</div>
                            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 4px;">${data.email || data.account || data.username}</div>
                            <div style="display: inline-block; padding: 6px 16px; background: rgba(16, 185, 129, 0.2); border-radius: 16px; font-size: 12px; font-weight: 600; color: var(--success);">
                                ${data.status}
                            </div>
                        </div>
                        
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">${data.transactions}</div>
                                <div class="stat-label">Transactions</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${data.totalReceived}</div>
                                <div class="stat-label">Total Received</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${data.connected}</div>
                                <div class="stat-label">Connected</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">✓ Active</div>
                                <div class="stat-label">Status</div>
                            </div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Account Settings</div>
                        </div>
                        
                        <div class="list-item" onclick="updatePaymentEmail('${method}')">
                            <div class="list-item-icon">📧</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Update Email/Account</div>
                                <div class="list-item-subtitle">Change linked account</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <div class="list-item" onclick="viewPaymentHistory('${method}')">
                            <div class="list-item-icon">📊</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Transaction History</div>
                                <div class="list-item-subtitle">${data.transactions} transactions</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">Auto-Transfer</div>
                                <div class="list-item-subtitle">Automatic withdrawal to bank</div>
                            </div>
                            <div class="toggle-switch active" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                        
                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">Email Notifications</div>
                                <div class="list-item-subtitle">Get notified of payments</div>
                            </div>
                            <div class="toggle-switch active" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                        
                <div class="section-header">
                    <div class="section-title">Leaderboard</div>
                    <div class="section-link" onclick="gamingSystem.viewFullLeaderboard()">View All</div>
                </div>

                <div class="list-item" onclick="gamingSystem.viewFullLeaderboard()" style="cursor: pointer;">
                    <div style="font-size: 24px; font-weight: 700; color: #ffd700;">🥇</div>
                    <div class="list-item-content">
                        <div class="list-item-title">ProGamer123</div>
                        <div class="list-item-subtitle">5,890 points • 🟢 Online</div>
                    </div>
                </div>

                <div class="list-item" onclick="gamingSystem.viewFullLeaderboard()" style="cursor: pointer;">
                    <div style="font-size: 24px; font-weight: 700; color: #c0c0c0;">🥈</div>
                    <div class="list-item-content">
                        <div class="list-item-title">GameMaster</div>
                        <div class="list-item-subtitle">5,234 points • 🟢 Online</div>
                    </div>
                </div>
                            <div style="font-size: 16px; font-weight: 700; color: var(--success);">+$25</div>
                        </div>
                        
                        <div class="list-item">
                            <div class="post-avatar">🎨</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Emily R.</div>
                                <div class="list-item-subtitle">3 days ago</div>
                            </div>
                            <div style="font-size: 16px; font-weight: 700; color: var(--success);">+$50</div>
                        </div>
                        
                        <div style="background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; padding: 16px; margin-top: 20px;">
                            <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">💡 Payment Info</div>
                            <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
                                ${method} processes payments instantly. Fees may apply based on transaction type. Standard withdrawal takes 1-3 business days.
                            </div>
                        </div>
                        
                        <button class="btn" style="background: var(--error); margin-top: 20px;" onclick="confirmRemovePaymentMethod('${method}')">
                            Remove ${method}
                        </button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            showToast(`Opening ${method} details... 💳`);
        }
        
        // Close payment method details
        function closePaymentMethodDetails() {
            const modal = document.getElementById('paymentMethodDetailsModal');
            if (modal) {
                modal.remove();
            }
        }
        
        // Update payment email
        function updatePaymentEmail(method) {
            showToast(`Update ${method} account information`);
        }
        
        // View payment history
        function viewPaymentHistory(method) {
            showToast(`Loading ${method} transaction history... 📊`);
        }
        
        // Remove payment method
        function removePaymentMethod(method) {
            showToast(`Remove ${method}? This action can be undone by reconnecting.`);
        }
        
        // Confirm remove payment method
        function confirmRemovePaymentMethod(method) {
            closePaymentMethodDetails();
            showToast(`${method} removed successfully`);
        }
        
        // Connect payment method - NOW OPENS SETUP DASHBOARD
        function connectPaymentMethod(method) {
            closeModal('paymentMethods');
            showToast(`Setting up ${method}... 💳`);
            
            // Simple confirmation for demo
            setTimeout(() => {
                showToast(`${method} connection pending... Please check your email to verify.`);
            }, 1500);
            
            setTimeout(() => {
                showToast(`${method} will be connected once verified! ✓`);
            }, 3000);
        }
        
        // Close payment method setup
        function closePaymentMethodSetup() {
            const modal = document.getElementById('paymentMethodSetupModal');
            if (modal) {
                modal.remove();
            }
        }
        
        // Complete payment method setup
        function completePaymentMethodSetup(method) {
            let input;
            if (method === 'Cash App') {
                input = document.getElementById('cashtag');
                if (!input || !input.value.trim()) {
                    showToast('Please enter your $Cashtag');
                    return;
                }
                if (!input.value.startsWith('$')) {
                    showToast('Cashtag must start with $');
                    return;
                }
            } else if (method === 'Bitcoin') {
                input = document.getElementById('walletAddress');
                if (!input || !input.value.trim()) {
                    showToast('Please enter your Bitcoin wallet address');
                    return;
                }
                if (input.value.length < 26) {
                    showToast('Please enter a valid Bitcoin wallet address');
                    return;
                }
            }
            
            closePaymentMethodSetup();
            showToast(`Connecting ${method}... 💳`);
            
            setTimeout(() => {
                showToast(`${method} connected successfully! ✓`);
            }, 1500);
        }
        
        // Select alert duration
        function selectAlertDuration(duration, element) {
            // Remove selection from all items
            const modal = document.getElementById('alertDurationModal');
            modal.querySelectorAll('.list-item').forEach(item => {
                item.style.background = 'var(--glass)';
                item.style.borderColor = 'var(--glass-border)';
                const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                if (checkmark) checkmark.remove();
            });
            
            // Add selection to clicked item
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            // Update the value in donation alerts modal
            const durationDisplay = document.getElementById('alertDurationValue');
            if (durationDisplay) {
                durationDisplay.textContent = duration;
            }
            
            closeModal('alertDuration');
            showToast(`Alert duration set to ${duration}`);
        }
        
        // Select alert animation
        function selectAlertAnimation(animation, element) {
            // Remove selection from all items
            const modal = document.getElementById('alertAnimationModal');
            modal.querySelectorAll('.list-item').forEach(item => {
                item.style.background = 'var(--glass)';
                item.style.borderColor = 'var(--glass-border)';
                const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                if (checkmark) checkmark.remove();
            });
            
            // Add selection to clicked item
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            // Update the value in donation alerts modal
            const animationDisplay = document.getElementById('alertAnimationValue');
            if (animationDisplay) {
                animationDisplay.textContent = animation;
            }
            
            closeModal('alertAnimation');
            showToast(`Animation set to ${animation}`);
        }
        
        // Update auto-recording status
        function updateAutoRecordingStatus(toggleElement) {
            if (toggleElement.classList.contains('active')) {
                showToast('Auto-recording enabled 🔴');
            } else {
                showToast('Auto-recording disabled');
            }
        }
        
        // View recorded streams
        function viewRecordedStreams() {
            closeModal('streamRecording');
            
            // Create recorded streams modal
            const modalHTML = `
                <div id="recordedStreamsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeRecordedStreams()">✕</div>
                        <div class="modal-title">📁 Recorded Streams</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">📹</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Your Recorded Streams</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">12 recordings available</div>
                        </div>
                        
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">12</div>
                                <div class="stat-label">Total Streams</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">15.4 GB</div>
                                <div class="stat-label">Storage Used</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">45h</div>
                                <div class="stat-label">Total Duration</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">1080p</div>
                                <div class="stat-label">Quality</div>
                            </div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Recordings</div>
                            <div class="section-link" id="recordingFilter">Last 30 days</div>
                        </div>
                        
                        <div class="list-item" onclick="playRecording('Gaming Marathon')">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🎮</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Gaming Marathon</div>
                                <div class="list-item-subtitle">4h 30m • 2.8 GB • 3 days ago</div>
                            </div>
                            <button class="nav-btn" onclick="event.stopPropagation(); downloadRecording('Gaming Marathon')">⬇️</button>
                        </div>
                        
                        <div class="list-item" onclick="playRecording('Art Session')">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--success), var(--accent)); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🎨</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Art Session</div>
                                <div class="list-item-subtitle">3h 15m • 2.1 GB • 5 days ago</div>
                            </div>
                            <button class="nav-btn" onclick="event.stopPropagation(); downloadRecording('Art Session')">⬇️</button>
                        </div>
                        
                        <div class="list-item" onclick="playRecording('Coding Stream')">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--warning), var(--error)); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">💻</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Coding Stream</div>
                                <div class="list-item-subtitle">2h 45m • 1.8 GB • 1 week ago</div>
                            </div>
                            <button class="nav-btn" onclick="event.stopPropagation(); downloadRecording('Coding Stream')">⬇️</button>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 20px;">
                            <button class="btn" style="background: var(--glass);" onclick="changeRecordingFilter()">
                                📅 Change Filter
                            </button>
                            <button class="btn" style="background: var(--glass);" onclick="exportRecordingHistory()">
                                📊 Export History
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            showToast('Loading recorded streams... 📹');
        }
        
        // Close recorded streams
        function closeRecordedStreams() {
            const modal = document.getElementById('recordedStreamsModal');
            if (modal) {
                modal.remove();
            }
        }
        
        // Play recording
        function playRecording(title) {
            showToast(`▶️ Playing: ${title}`);
            setTimeout(() => {
                showToast('Recording started! Use video controls to navigate.');
            }, 1000);
        }
        
        // Download recording
        function downloadRecording(title) {
            showToast(`Downloading: ${title}... ⬇️`);
            setTimeout(() => {
                showToast('Download started! Check your downloads folder.');
            }, 1500);
        }
        
        // Change recording filter (Last 30 days, Last 90 days, All time, etc.)
        function changeRecordingFilter() {
            const filters = ['Last 30 days', 'Last 90 days', 'This year', 'All time'];
            const currentFilter = document.getElementById('recordingFilter').textContent;
            const currentIndex = filters.indexOf(currentFilter);
            const nextIndex = (currentIndex + 1) % filters.length;
            const nextFilter = filters[nextIndex];
            
            document.getElementById('recordingFilter').textContent = nextFilter;
            showToast(`Filter changed to: ${nextFilter} 📅`);
        }
        
        // Export recording history
        function exportRecordingHistory() {
            showToast('Exporting recording history... 📊');
            setTimeout(() => {
                showToast('Export complete! History saved to downloads.');
            }, 1500);
        }
        
        // Open recording quality modal
        window.openModal('recordingQuality', function() {
            const modalHTML = `
                <div id="recordingQualityModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('recordingQuality')">✕</div>
                        <div class="modal-title">⚙️ Recording Quality</div>
                    </div>
                    <div class="modal-content">
                        <div class="section-header">
                            <div class="section-title">Select Quality</div>
                        </div>
                        <div class="list-item" onclick="selectRecordingQuality('720p HD', this)">
                            <div class="list-item-content">
                                <div class="list-item-title">720p HD</div>
                                <div class="list-item-subtitle">High quality • ~1.5 GB/hour</div>
                            </div>
                        </div>
                        <div class="list-item" onclick="selectRecordingQuality('1080p Full HD', this)" style="background: rgba(79, 70, 229, 0.1); border-color: var(--primary);">
                            <div class="list-item-content">
                                <div class="list-item-title">1080p Full HD</div>
                                <div class="list-item-subtitle">Best quality • ~3 GB/hour</div>
                            </div>
                            <div style="color: var(--primary); font-weight: 600;">✓</div>
                        </div>
                        <div class="list-item" onclick="selectRecordingQuality('4K Ultra HD', this)">
                            <div class="list-item-content">
                                <div class="list-item-title">4K Ultra HD</div>
                                <div class="list-item-subtitle">Maximum quality • ~6 GB/hour</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        });
        
        // Select recording quality
        function selectRecordingQuality(quality, element) {
            // Remove selection from all items
            const modal = document.getElementById('recordingQualityModal');
            modal.querySelectorAll('.list-item').forEach(item => {
                item.style.background = 'var(--glass)';
                item.style.borderColor = 'var(--glass-border)';
                const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                if (checkmark) checkmark.remove();
            });
            
            // Add selection to clicked item
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            // Update the value in stream recording modal
            const qualityDisplay = document.getElementById('recordingQualityValue');
            if (qualityDisplay) {
                qualityDisplay.textContent = quality;
            }
            
            closeModal('recordingQuality');
            showToast(`Recording quality set to ${quality}`);
        }

        // ========== AR/VR CUSTOM FEATURES ==========
        
        // Create custom AR filter
        function createCustomARFilter() {
            const modalHTML = `
                <div id="createCustomARFilterModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('createCustomARFilter')">✕</div>
                        <div class="modal-title">🎨 Create Custom Filter</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🎨</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Design Your Filter</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Create a unique AR filter</div>
                        </div>
                        
                        <input type="text" class="input-field" placeholder="Filter name..." id="customFilterName" />
                        
                        <div class="section-header">
                            <div class="section-title">Choose Style</div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                            <div onclick="selectFilterStyle('Face', this)" style="padding: 16px; background: var(--glass); border: 2px solid var(--glass-border); border-radius: 12px; text-align: center; cursor: pointer; transition: all 0.2s;">
                                <div style="font-size: 32px; margin-bottom: 8px;">👤</div>
                                <div style="font-size: 12px; font-weight: 600;">Face</div>
                            </div>
                            <div onclick="selectFilterStyle('Color', this)" style="padding: 16px; background: var(--glass); border: 2px solid var(--glass-border); border-radius: 12px; text-align: center; cursor: pointer; transition: all 0.2s;">
                                <div style="font-size: 32px; margin-bottom: 8px;">🎨</div>
                                <div style="font-size: 12px; font-weight: 600;">Color</div>
                            </div>
                            <div onclick="selectFilterStyle('Effect', this)" style="padding: 16px; background: var(--glass); border: 2px solid var(--glass-border); border-radius: 12px; text-align: center; cursor: pointer; transition: all 0.2s;">
                                <div style="font-size: 32px; margin-bottom: 8px;">✨</div>
                                <div style="font-size: 12px; font-weight: 600;">Effect</div>
                            </div>
                        </div>
                        
                        <button class="btn" onclick="saveCustomFilter()">Create Filter</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            showToast('Opening filter creator... 🎨');
        }
        
        // Select filter style
        function selectFilterStyle(style, element) {
            const modal = document.getElementById('createCustomARFilterModal');
            modal.querySelectorAll('div[onclick*="selectFilterStyle"]').forEach(item => {
                item.style.borderColor = 'var(--glass-border)';
            });
            element.style.borderColor = 'var(--primary)';
            showToast(`Style: ${style}`);
        }
        
        // Save custom filter
        function saveCustomFilter() {
            const name = document.getElementById('customFilterName').value;
            if (!name.trim()) {
                showToast('Please enter a filter name');
                return;
            }
            
            closeModal('createCustomARFilter');
            showToast(`Creating filter: ${name}... 🎨`);
            
            setTimeout(() => {
                showToast('Custom filter created successfully! ✓');
            }, 1500);
        }
        
        // Connect VR headset prompt
        function connectVRHeadsetPrompt() {
            const modalHTML = `
                <div id="connectVRHeadsetModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('connectVRHeadset')">✕</div>
                        <div class="modal-title">🥽 Connect VR Headset</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🥽</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">VR Headset Setup</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Connect your VR device</div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Available Devices</div>
                        </div>
                        
                        <div class="list-item" onclick="connectVRDevice('Meta Quest 3')">
                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🥽</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Meta Quest 3</div>
                                <div class="list-item-subtitle">Wireless VR headset</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <div class="list-item" onclick="connectVRDevice('PlayStation VR2')">
                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, var(--success), var(--accent)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🎮</div>
                            <div class="list-item-content">
                                <div class="list-item-title">PlayStation VR2</div>
                                <div class="list-item-subtitle">Console VR system</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <div class="list-item" onclick="connectVRDevice('HTC Vive')">
                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, var(--warning), var(--error)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🔵</div>
                            <div class="list-item-content">
                                <div class="list-item-title">HTC Vive</div>
                                <div class="list-item-subtitle">PC VR headset</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <div class="list-item" onclick="connectVRDevice('Apple Vision Pro')">
                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, var(--accent), var(--primary)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🍎</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Apple Vision Pro</div>
                                <div class="list-item-subtitle">Mixed reality headset</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <button class="btn" style="background: var(--glass); margin-top: 16px;" onclick="scanForVRDevices()">
                            🔍 Scan for Devices
                        </button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            showToast('Opening VR headset connection... 🥽');
        }
        
        // Connect VR device
        function connectVRDevice(deviceName) {
            closeModal('connectVRHeadset');
            showToast(`Connecting to ${deviceName}... 🥽`);
            
            setTimeout(() => {
                showToast(`✓ Connected to ${deviceName}!`);
            }, 2000);
        }
        
        // Scan for VR devices
        function scanForVRDevices() {
            showToast('Scanning for VR devices... 🔍');
            
            setTimeout(() => {
                showToast('Scan complete! Found 2 devices');
            }, 2000);
        }
        
        // ========== VIDEO CALLS FUNCTIONS ==========
        
        // Initialize video calls module (to be called from LynkApp_Mobile_Design_Media_Hub.js)
        window.videoCalls = window.videoCalls || {};
        
        // Initiate video call with selected contact
        function initiateVideoCall(name, emoji) {
            closeModal('selectContactForCall');
            showToast(`📹 Starting video call with ${name}...`);
            
            // Simulate call connecting
            setTimeout(() => {
                openModal('videoCall');
                document.getElementById('callStatus').textContent = 'Ringing...';
            }, 500);
            
            setTimeout(() => {
                document.getElementById('callStatus').textContent = 'Connected';
                showToast(`Connected with ${name}! 📹`);
            }, 2500);
        }
        
        // Initiate voice call with selected contact
        function initiateVoiceCall(name, emoji) {
            closeModal('selectContactForVoiceCall');
            showToast(`📞 Starting voice call with ${name}...`);
            
            // Simulate call connecting
            setTimeout(() => {
                openModal('phoneCall');
                document.getElementById('phoneCallStatus').textContent = 'Ringing...';
            }, 500);
            
            setTimeout(() => {
                document.getElementById('phoneCallStatus').textContent = 'Connected';
                showToast(`Connected with ${name}! 📞`);
            }, 2500);
        }
        
        // Add person to call
        function addPersonToCall(name) {
            closeModal('addCallParticipant');
            showToast(`Adding ${name} to the call... 👥`);
            
            setTimeout(() => {
                showToast(`${name} has been added to the call! ✓`);
            }, 1000);
        }
        
        // Select virtual background
        function selectVirtualBackground(background) {
            closeModal('virtualBackgrounds');
            showToast(`Background set to: ${background} 🎨`);
            
            setTimeout(() => {
                showToast('Virtual background applied! ✓');
            }, 800);
        }
        
        // Upload custom background
        function uploadCustomBackground() {
            closeModal('virtualBackgrounds');
            showToast('Opening file picker... 📤');
            
            setTimeout(() => {
                showToast('Select an image for your virtual background');
            }, 800);
            
            setTimeout(() => {
                showToast('Custom background uploaded successfully! ✓');
            }, 2500);
        }
        
        // Create scheduled call
        function createScheduledCall() {
            const title = document.getElementById('scheduleCallTitle').value;
            const date = document.getElementById('scheduleCallDate').value;
            const time = document.getElementById('scheduleCallTime').value;
            
            if (!title || !date || !time) {
                showToast('Please fill in all required fields');
                return;
            }
            
            closeModal('scheduleVideoCall');
            showToast('Call scheduled successfully! 📅');
            
            setTimeout(() => {
                showToast(`${title} scheduled for ${date} at ${time}`);
            }, 1500);
            
            // Clear the form
            document.getElementById('scheduleCallTitle').value = '';
            document.getElementById('scheduleCallDate').value = '';
            document.getElementById('scheduleCallTime').value = '';
        }
        
        // Cancel scheduled video call
        function cancelScheduledVideoCall(title) {
            showToast(`Cancelled: ${title}`);
            
            setTimeout(() => {
                showToast('Scheduled call removed from calendar');
            }, 1000);
        }
        
        // Toggle screen share (for video calls)
        window.videoCalls.toggleScreenShare = function() {
            showToast('Opening screen share options... 🖥️');
            
            // Create screen share modal
            const modalHTML = `
                <div id="screenShareModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeScreenShare()">✕</div>
                        <div class="modal-title">🖥️ Screen Share</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🖥️</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Share Your Screen</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Choose what to share</div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Screen Share Options</div>
                        </div>
                        
                        <div class="list-item" onclick="startScreenShare('entire')">
                            <div class="list-item-icon">🖥️</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Share Entire Screen</div>
                                <div class="list-item-subtitle">Share everything visible</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <div class="list-item" onclick="startScreenShare('window')">
                            <div class="list-item-icon">🪟</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Share Application Window</div>
                                <div class="list-item-subtitle">Share specific app</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <div class="list-item" onclick="startScreenShare('tab')">
                            <div class="list-item-icon">📑</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Share Browser Tab</div>
                                <div class="list-item-subtitle">Share specific tab</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Settings</div>
                        </div>
                        
                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">Share Audio</div>
                                <div class="list-item-subtitle">Include system audio</div>
                            </div>
                            <div class="toggle-switch active" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                        
                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">Show Cursor</div>
                                <div class="list-item-subtitle">Display mouse pointer</div>
                            </div>
                            <div class="toggle-switch active" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        };
        
        // Close screen share modal
        function closeScreenShare() {
            const modal = document.getElementById('screenShareModal');
            if (modal) {
                modal.remove();
            }
        }
        
        // Start screen share
        function startScreenShare(type) {
            closeScreenShare();
            
            const types = {
                'entire': 'Entire Screen',
                'window': 'Application Window',
                'tab': 'Browser Tab'
            };
            
            showToast(`Sharing ${types[type]}... 🖥️`);
            
            setTimeout(() => {
                showToast('Screen sharing started! ✓');
            }, 1000);
        }
        
        // Toggle call recording
        window.videoCalls.toggleCallRecording = function() {
            showToast('Opening recording options... 🔴');
            
            // Create call recording modal
            const modalHTML = `
                <div id="callRecordingModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeCallRecording()">✕</div>
                        <div class="modal-title">🔴 Call Recording</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🎥</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Record This Call</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Save this conversation for later</div>
                        </div>
                        
                        <div style="background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                            <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">⚠️ Important</div>
                            <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
                                All participants will be notified when recording starts. Make sure to get consent before recording.
                            </div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Recording Quality</div>
                        </div>
                        
                        <div class="list-item" onclick="selectCallRecordingQuality('720p HD', this)">
                            <div class="list-item-content">
                                <div class="list-item-title">720p HD</div>
                                <div class="list-item-subtitle">Standard quality • ~100 MB/10min</div>
                            </div>
                        </div>
                        <div class="list-item" onclick="selectCallRecordingQuality('1080p Full HD', this)" style="background: rgba(79, 70, 229, 0.1); border-color: var(--primary);">
                            <div class="list-item-content">
                                <div class="list-item-title">1080p Full HD</div>
                                <div class="list-item-subtitle">High quality • ~200 MB/10min</div>
                            </div>
                            <div style="color: var(--primary); font-weight: 600;">✓</div>
                        </div>
                        
                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">Record Audio</div>
                                <div class="list-item-subtitle">Include call audio</div>
                            </div>
                            <div class="toggle-switch active" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                        
                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">Auto-Save</div>
                                <div class="list-item-subtitle">Save automatically after call</div>
                            </div>
                            <div class="toggle-switch active" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                        
                        <button class="btn" onclick="startCallRecording()">
                            🔴 Start Recording
                        </button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        };
        
        // Close call recording modal
        function closeCallRecording() {
            const modal = document.getElementById('callRecordingModal');
            if (modal) {
                modal.remove();
            }
        }
        
        // Select call recording quality
        function selectCallRecordingQuality(quality, element) {
            // Remove selection from all items in modal
            const modal = document.getElementById('callRecordingModal');
            modal.querySelectorAll('.list-item').forEach(item => {
                item.style.background = 'var(--glass)';
                item.style.borderColor = 'var(--glass-border)';
                const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                if (checkmark) checkmark.remove();
            });
            
            // Add selection to clicked item
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            showToast(`Recording quality: ${quality}`);
        }
        
        // Start call recording
        function startCallRecording() {
            closeCallRecording();
            showToast('🔴 Recording started...');
            
            setTimeout(() => {
                showToast('All participants have been notified');
            }, 1000);
        }
        
        // View call history
        window.videoCalls.viewCallHistory = function() {
            // Create call history modal
            const modalHTML = `
                <div id="callHistoryModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeCallHistory()">✕</div>
                        <div class="modal-title">📋 Call History</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">📋</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Call History</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Your recent calls</div>
                        </div>
                        
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">23</div>
                                <div class="stat-label">Total Calls</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">5h 12m</div>
                                <div class="stat-label">Call Time</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">15</div>
                                <div class="stat-label">Video Calls</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">8</div>
                                <div class="stat-label">Voice Calls</div>
                            </div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Recent Calls</div>
                            <div class="section-link" onclick="filterCallHistory()">Filter</div>
                        </div>
                        
                        <div class="list-item" onclick="callBackContact('[User Name]', 'video')">
                            <div class="list-item-icon">📹</div>
                            <div class="list-item-content">
                                <div class="list-item-title">[User Name]</div>
                                <div class="list-item-subtitle">Video Call • 0 minutes • Just now</div>
                            </div>
                            <button class="nav-btn" onclick="event.stopPropagation(); callBackContact('[User Name]', 'video')">📹</button>
                        </div>
                        
                        <div class="list-item" onclick="callBackContact('[User Name]', 'voice')">
                            <div class="list-item-icon">📞</div>
                            <div class="list-item-content">
                                <div class="list-item-title">[User Name]</div>
                                <div class="list-item-subtitle">Voice Call • 0 minutes • Just now</div>
                            </div>
                            <button class="nav-btn" onclick="event.stopPropagation(); callBackContact('[User Name]', 'voice')">📞</button>
                        </div>
                        
                        <div class="list-item" onclick="viewCallDetails('[User Name]')">
                            <div class="list-item-icon">📹</div>
                            <div class="list-item-content">
                                <div class="list-item-title">[User Name]</div>
                                <div class="list-item-subtitle">Video Call • 0 minutes • Yesterday</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <div class="list-item" style="opacity: 0.6;">
                            <div class="list-item-icon">📞</div>
                            <div class="list-item-content">
                                <div class="list-item-title">[User Name]</div>
                                <div class="list-item-subtitle">Missed Call • 2 days ago</div>
                            </div>
                            <button class="nav-btn" onclick="event.stopPropagation(); callBackContact('[User Name]', 'voice')">📞</button>
                        </div>
                        
                        <div class="list-item" onclick="viewCallDetails('[User Name]')">
                            <div class="list-item-icon">📹</div>
                            <div class="list-item-content">
                                <div class="list-item-title">[User Name]</div>
                                <div class="list-item-subtitle">Video Call • 0 minutes • 3 days ago</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <button class="btn" style="background: var(--glass); margin-top: 16px;" onclick="exportCallHistory()">
                            📊 Export History
                        </button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            showToast('Loading call history... 📋');
        };
        
        // Close call history
        function closeCallHistory() {
            const modal = document.getElementById('callHistoryModal');
            if (modal) {
                modal.remove();
            }
        }
        
        // Call back a contact
        function callBackContact(name, type) {
            closeCallHistory();
            
            if (type === 'video') {
                initiateVideoCall(name, '👤');
            } else {
                initiateVoiceCall(name, '👤');
            }
        }
        
        // View call details
        function viewCallDetails(name) {
            showToast(`Viewing call details for ${name}... 📊`);
            
            // Create call details modal
            setTimeout(() => {
                const modalHTML = `
                    <div id="callDetailsModal" class="modal show">
                        <div class="modal-header">
                            <div class="modal-close" onclick="closeCallDetails()">✕</div>
                            <div class="modal-title">Call Details</div>
                        </div>
                        <div class="modal-content">
                            <div style="text-align: center; margin: 20px 0;">
                                <div class="post-avatar" style="width: 80px; height: 80px; font-size: 32px; margin: 0 auto 12px;">👤</div>
                                <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">${name}</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">Video Call</div>
                            </div>
                            
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <div class="stat-value">23:15</div>
                                    <div class="stat-label">Duration</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">720p</div>
                                    <div class="stat-label">Quality</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">Good</div>
                                    <div class="stat-label">Connection</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">Yesterday</div>
                                    <div class="stat-label">When</div>
                                </div>
                            </div>
                            
                            <div class="section-header">
                                <div class="section-title">Actions</div>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                                <button class="btn" onclick="callBackContact('${name}', 'video')">
                                    📹 Call Again
                                </button>
                                <button class="btn" style="background: var(--glass);" onclick="deleteCallFromHistory('${name}')">
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.insertAdjacentHTML('beforeend', modalHTML);
            }, 300);
        }
        
        // Close call details
        function closeCallDetails() {
            const modal = document.getElementById('callDetailsModal');
            if (modal) {
                modal.remove();
            }
        }
        
        // Delete call from history
        function deleteCallFromHistory(name) {
            closeCallDetails();
            closeCallHistory();
            showToast(`Call with ${name} deleted from history`);
        }
        
        // Filter call history
        function filterCallHistory() {
            showToast('Opening filter options... 🔍');
            setTimeout(() => {
                showToast('Filter by: All / Video / Voice / Missed');
            }, 800);
        }
        
        // Export call history
        function exportCallHistory() {
            showToast('Exporting call history... 📊');
            setTimeout(() => {
                showToast('Call history exported successfully! ✓');
            }, 1500);
        }

        // ========== CREATOR PROFILE FUNCTIONS ==========
        
        // Filter creator analytics
        function filterCreatorAnalytics(element, period) {
            // Remove active class from all buttons
            element.parentElement.querySelectorAll('.pill-nav-button').forEach(btn => btn.classList.remove('active'));
            element.classList.add('active');
            
            const periods = {
                '7d': '7 days',
                '30d': '30 days',
                '1y': '1 year'
            };
            
            showToast(`Showing analytics for ${periods[period]}`);
        }
        
        // Share creator profile
        function shareCreatorProfile() {
            showToast('Creator profile link copied! 🔗');
            setTimeout(() => {
                showToast('Share your profile to gain more followers!');
            }, 1500);
        }
        
        // Delete scheduled post (mobile version)
        function deleteScheduledPostMobile(id) {
            if (confirm('Delete this scheduled post?')) {
                showToast('Scheduled post deleted');
            }
        }
        
        // Open detailed analytics modal
        window.openModal = (function(original) {
            return function(type) {
                // Handle creator profile modals
                if (type === 'detailedAnalytics') {
                    openDetailedAnalyticsModal();
                } else if (type === 'subscriptions') {
                    openSubscriptionsModal();
                } else if (type === 'donations') {
                    openDonationsModal();
                } else if (type === 'sponsorships') {
                    openSponsorshipsModal();
                } else if (type === 'merchandise') {
                    openMerchandiseModal();
                } else if (type === 'fullCalendar') {
                    openFullCalendarModal();
                } else if (type === 'scheduleNewPost') {
                    openScheduleNewPostModal();
                } else if (type === 'contentLibrary') {
                    openContentLibraryModal();
                } else if (type === 'contentDetails') {
                    openContentDetailsModal();
                } else if (type === 'contentIdeas') {
                    openContentIdeasModal();
                } else if (type === 'creatorAnalytics') {
                    openCreatorAnalyticsModal();
                } else if (type === 'payoutSettings') {
                    openPayoutSettingsModal();
                } else if (type === 'newContent') {
                    openNewContentModal();
                } else if (type === 'editCreatorProfile') {
                    openEditCreatorProfileModal();
                } else if (type === 'applyVerification') {
                    openApplyVerificationModal();
                } else if (type === 'upgradePremium') {
                    openUpgradePremiumModal();
                } else if (type === 'becomePartner') {
                    openBecomePartnerModal();
                } else if (type === 'monetizationDetails') {
                    openMonetizationDetailsModal();
                } else if (type === 'editScheduledPost') {
                    openEditScheduledPostModal();
                } else if (type === 'creatorSettings') {
                    openCreatorSettingsModal();
                } else {
                    original(type);
                }
            };
        })(openModal);
        
        // Detailed Analytics Modal
        function openDetailedAnalyticsModal() {
            const modalHTML = `
                <div id="detailedAnalyticsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('detailedAnalytics')">✕</div>
                        <div class="modal-title">📊 Detailed Analytics</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">📊</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Performance Dashboard</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Last 30 days</div>
                        </div>
                        
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">1.23M</div>
                                <div class="stat-label">Total Views</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">89.4K</div>
                                <div class="stat-label">Engagement</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">+12.5K</div>
                                <div class="stat-label">New Followers</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">$8,945</div>
                                <div class="stat-label">Revenue</div>
                            </div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Top Content</div>
                        </div>
                        
                        <div class="list-item">
                            <div class="list-item-icon">🎥</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Tech Review Video</div>
                                <div class="list-item-subtitle">125K views • 8.5% engagement</div>
                            </div>
                        </div>
                        
                        <div class="list-item">
                            <div class="list-item-icon">📸</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Behind the Scenes</div>
                                <div class="list-item-subtitle">89K views • 12.3% engagement</div>
                            </div>
                        </div>
                        
                        <button class="btn" style="background: var(--glass); margin-top: 16px;" onclick="exportAnalytics()">
                            📥 Export Report
                        </button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Subscriptions Modal
        function openSubscriptionsModal() {
            const modalHTML = `
                <div id="subscriptionsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('subscriptions')">✕</div>
                        <div class="modal-title">💳 Subscriptions</div>
                    </div>
                    <div class="modal-content">
                        <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Monthly Revenue</div>
                            <div style="font-size: 48px; font-weight: 800;">$3,245</div>
                            <div style="font-size: 13px; opacity: 0.9;">4,834 subscribers</div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Subscription Tiers</div>
                            <button class="btn" style="width: auto; padding: 8px 16px;" onclick="createNewTier()">+ Add Tier</button>
                        </div>
                        
                        <div class="card" style="margin-bottom: 12px;">
                            <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">Basic Tier</div>
                            <div style="font-size: 20px; font-weight: 800; color: var(--primary); margin-bottom: 8px;">$4.99<span style="font-size: 14px; color: var(--text-secondary); font-weight: 400;">/month</span></div>
                            <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">2,456 subscribers</div>
                            <div style="font-size: 13px; margin-bottom: 8px;">✓ Early access to content</div>
                            <div style="font-size: 13px; margin-bottom: 8px;">✓ Exclusive community access</div>
                            <button class="btn" style="background: var(--glass); margin-top: 8px;" onclick="editTier('basic')">Edit Tier</button>
                        </div>
                        
                        <div class="card" style="margin-bottom: 12px; border-color: var(--primary); background: rgba(79, 70, 229, 0.05);">
                            <div style="display: inline-block; padding: 4px 12px; background: var(--primary); border-radius: 12px; font-size: 11px; font-weight: 700; margin-bottom: 8px;">POPULAR</div>
                            <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">Premium Tier</div>
                            <div style="font-size: 20px; font-weight: 800; color: var(--primary); margin-bottom: 8px;">$9.99<span style="font-size: 14px; color: var(--text-secondary); font-weight: 400;">/month</span></div>
                            <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">1,890 subscribers</div>
                            <div style="font-size: 13px; margin-bottom: 8px;">✓ All Basic benefits</div>
                            <div style="font-size: 13px; margin-bottom: 8px;">✓ Behind-the-scenes content</div>
                            <div style="font-size: 13px; margin-bottom: 8px;">✓ 1-on-1 monthly call</div>
                            <button class="btn" style="background: var(--glass); margin-top: 8px;" onclick="editTier('premium')">Edit Tier</button>
                        </div>
                        
                        <button class="btn" onclick="manageSubscribers()">Manage Subscribers</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Donations Modal
        function openDonationsModal() {
            const modalHTML = `
                <div id="donationsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('donations')">✕</div>
                        <div class="modal-title">🎁 Donations & Tips</div>
                    </div>
                    <div class="modal-content">
                        <div style="background: linear-gradient(135deg, var(--success), var(--accent)); padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Total Received</div>
                            <div style="font-size: 48px; font-weight: 800;">$2,890</div>
                            <div style="font-size: 13px; opacity: 0.9;">2,156 tips this month</div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Recent Tips</div>
                        </div>
                        
                        <div class="list-item">
                            <div class="post-avatar">👤</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Sarah M. • $10</div>
                                <div class="list-item-subtitle">Just now • "Great content!"</div>
                            </div>
                        </div>
                        
                        <div class="list-item">
                            <div class="post-avatar">😊</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Mike J. • $25</div>
                                <div class="list-item-subtitle">1 day ago • "Keep it up!"</div>
                            </div>
                        </div>
                        
                        <button class="btn" style="background: var(--glass);" onclick="setupDonationOptions()">Setup Donations</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Sponsorships Modal
        function openSponsorshipsModal() {
            const modalHTML = `
                <div id="sponsorshipsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('sponsorships')">✕</div>
                        <div class="modal-title">🤝 Sponsorships</div>
                    </div>
                    <div class="modal-content">
                        <div style="background: linear-gradient(135deg, var(--warning), var(--error)); padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Monthly Revenue</div>
                            <div style="font-size: 48px; font-weight: 800;">$1,800</div>
                            <div style="font-size: 13px; opacity: 0.9;">5 active sponsorship deals</div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Active Deals</div>
                        </div>
                        
                        <div class="card" style="margin-bottom: 12px;">
                            <div style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Tech Brand Partnership</div>
                            <div style="font-size: 18px; font-weight: 800; color: var(--success);">$500/month</div>
                            <div style="font-size: 13px; color: var(--text-secondary); margin-top: 8px;">1 sponsored post per week</div>
                        </div>
                        
                        <button class="btn" onclick="findNewSponsors()">Find New Sponsors</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Merchandise Modal
        function openMerchandiseModal() {
            const modalHTML = `
                <div id="merchandiseModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('merchandise')">✕</div>
                        <div class="modal-title">👕 Merchandise Store</div>
                    </div>
                    <div class="modal-content">
                        <div style="background: linear-gradient(135deg, var(--accent), var(--success)); padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Monthly Sales</div>
                            <div style="font-size: 48px; font-weight: 800;">$1,010</div>
                            <div style="font-size: 13px; opacity: 0.9;">156 products</div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Your Products</div>
                            <button class="btn" style="width: auto; padding: 8px 16px;" onclick="addNewProduct()">+ Add Product</button>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                            <div style="background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; padding: 12px; text-align: center;">
                                <div style="font-size: 40px; margin-bottom: 8px;">👕</div>
                                <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">T-Shirt</div>
                                <div style="font-size: 16px; font-weight: 700; color: var(--primary);">$25</div>
                            </div>
                            <div style="background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; padding: 12px; text-align: center;">
                                <div style="font-size: 40px; margin-bottom: 8px;">🧢</div>
                                <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Cap</div>
                                <div style="font-size: 16px; font-weight: 700; color: var(--primary);">$18</div>
                            </div>
                        </div>
                        
                        <button class="btn" style="background: var(--glass); margin-top: 16px;" onclick="manageStore()">Manage Store</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Full Calendar Modal
        function openFullCalendarModal() {
            const modalHTML = `
                <div id="fullCalendarModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('fullCalendar')">✕</div>
                        <div class="modal-title">📅 Content Calendar</div>
                        <button class="btn" style="width: auto; padding: 8px 16px;" onclick="openScheduleNewPostModal()">+ Schedule</button>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 20px 0;">
                            <div style="font-size: 24px; font-weight: 700; margin-bottom: 12px;">December 2024</div>
                            <div style="display: flex; justify-content: center; gap: 12px;">
                                <button class="nav-btn" onclick="previousMonth()">←</button>
                                <button class="nav-btn" onclick="nextMonth()">→</button>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 16px;">
                            <div style="text-align: center; font-size: 11px; font-weight: 600; color: var(--text-secondary); padding: 8px;">S</div>
                            <div style="text-align: center; font-size: 11px; font-weight: 600; color: var(--text-secondary); padding: 8px;">M</div>
                            <div style="text-align: center; font-size: 11px; font-weight: 600; color: var(--text-secondary); padding: 8px;">T</div>
                            <div style="text-align: center; font-size: 11px; font-weight: 600; color: var(--text-secondary); padding: 8px;">W</div>
                            <div style="text-align: center; font-size: 11px; font-weight: 600; color: var(--text-secondary); padding: 8px;">T</div>
                            <div style="text-align: center; font-size: 11px; font-weight: 600; color: var(--text-secondary); padding: 8px;">F</div>
                            <div style="text-align: center; font-size: 11px; font-weight: 600; color: var(--text-secondary); padding: 8px;">S</div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;" id="calendarDays">
                            <!-- Calendar days will be generated -->
                        </div>
                        
                        <div class="section-header" style="margin-top: 20px;">
                            <div class="section-title">Scheduled Posts</div>
                        </div>
                        
                        <div class="list-item">
                            <div class="list-item-icon">🎥</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Tech Review Video</div>
                                <div class="list-item-subtitle">Dec 20, 10:00 AM</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            generateCalendarDays();
        }
        
        // Generate calendar days
        function generateCalendarDays() {
            const container = document.getElementById('calendarDays');
            if (!container) return;
            
            const daysHTML = [];
            const today = 13; // Current day
            
            // Add empty cells for days before month starts (December 2024 starts on Sunday)
            for (let i = 0; i < 0; i++) {
                daysHTML.push('<div></div>');
            }
            
            // Add days (31 days in December)
            for (let day = 1; day <= 31; day++) {
                const isToday = day === today;
                const hasPost = day === 20 || day === 22 || day === 25;
                
                daysHTML.push(`
                    <div onclick="selectCalendarDay(${day})" style="aspect-ratio: 1; background: ${isToday ? 'rgba(79, 70, 229, 0.2)' : 'var(--glass)'}; border: 1px solid ${isToday ? 'var(--primary)' : 'var(--glass-border)'}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; padding: 4px;">
                        <div style="font-size: 13px; font-weight: 600;">${day}</div>
                        ${hasPost ? '<div style="width: 4px; height: 4px; background: var(--primary); border-radius: 50%; margin-top: 2px;"></div>' : ''}
                    </div>
                `);
            }
            
            container.innerHTML = daysHTML.join('');
        }
        
        // Select calendar day
        function selectCalendarDay(day) {
            showToast(`Selected day ${day}`);
        }
        
        // Previous/Next month
        function previousMonth() {
            showToast('Showing previous month');
        }
        
        function nextMonth() {
            showToast('Showing next month');
        }
        
        // Schedule New Post Modal
        function openScheduleNewPostModal() {
            const modalHTML = `
                <div id="scheduleNewPostModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('scheduleNewPost')">✕</div>
                        <div class="modal-title">📅 Schedule Post</div>
                    </div>
                    <div class="modal-content">
                        <input type="text" class="input-field" placeholder="Post title..." id="scheduledPostTitle" />
                        <textarea class="input-field textarea-field" placeholder="Caption..." id="scheduledPostCaption"></textarea>
                        <input type="datetime-local" class="input-field" id="scheduledPostDateTime" />
                        <select class="input-field" id="scheduledPostType">
                            <option>Regular Post</option>
                            <option>Video</option>
                            <option>Story</option>
                            <option>Live Stream</option>
                        </select>
                        <button class="btn" onclick="saveScheduledPost()">Schedule Post</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Save scheduled post
        function saveScheduledPost() {
            const title = document.getElementById('scheduledPostTitle').value;
            const caption = document.getElementById('scheduledPostCaption').value;
            const dateTime = document.getElementById('scheduledPostDateTime').value;
            
            if (!title || !caption || !dateTime) {
                showToast('Please fill in all fields');
                return;
            }
            
            closeModal('scheduleNewPost');
            showToast('Post scheduled successfully! 📅');
        }
        
        // Content Library Modal
        function openContentLibraryModal() {
            const modalHTML = `
                <div id="contentLibraryModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('contentLibrary')">✕</div>
                        <div class="modal-title">📚 Content Library</div>
                    </div>
                    <div class="modal-content">
                        <div class="search-bar">
                            <span>🔍</span>
                            <input type="text" class="search-input" placeholder="Search content..." />
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                            <div onclick="viewContent(1)" style="aspect-ratio: 1; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px; cursor: pointer;">📸</div>
                            <div onclick="viewContent(2)" style="aspect-ratio: 1; background: linear-gradient(135deg, var(--success), var(--accent)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px; cursor: pointer;">🎥</div>
                            <div onclick="viewContent(3)" style="aspect-ratio: 1; background: linear-gradient(135deg, var(--warning), var(--error)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px; cursor: pointer;">📝</div>
                            <div onclick="viewContent(4)" style="aspect-ratio: 1; background: linear-gradient(135deg, var(--accent), var(--success)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px; cursor: pointer;">🎬</div>
                            <div onclick="viewContent(5)" style="aspect-ratio: 1; background: linear-gradient(135deg, var(--secondary), var(--primary)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px; cursor: pointer;">📱</div>
                            <div onclick="viewContent(6)" style="aspect-ratio: 1; background: linear-gradient(135deg, var(--error), var(--warning)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px; cursor: pointer;">🖼️</div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Content Details Modal
        function openContentDetailsModal() {
            const modalHTML = `
                <div id="contentDetailsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('contentDetails')">✕</div>
                        <div class="modal-title">Content Details</div>
                    </div>
                    <div class="modal-content">
                        <div class="post-image" style="height: 300px; font-size: 80px;">📸</div>
                        
                        <div class="stats-grid" style="margin-top: 16px;">
                            <div class="stat-card">
                                <div class="stat-value">125K</div>
                                <div class="stat-label">Views</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">8.5%</div>
                                <div class="stat-label">Engagement</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">15.2K</div>
                                <div class="stat-label">Likes</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">$625</div>
                                <div class="stat-label">Revenue</div>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 16px;">
                            <button class="btn" onclick="editContent()">✏️ Edit</button>
                            <button class="btn" style="background: var(--glass);" onclick="deleteContent()">🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Content Ideas Modal
        function openContentIdeasModal() {
            const modalHTML = `
                <div id="contentIdeasModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('contentIdeas')">✕</div>
                        <div class="modal-title">💡 Content Ideas</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">💡</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Content Ideas Generator</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">AI-powered inspiration</div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Trending Topics</div>
                        </div>
                        
                        <div class="card" style="margin-bottom: 12px; cursor: pointer;" onclick="useIdea('Tech Reviews')">
                            <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">🎥 Tech Reviews</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Review latest gadgets and tech products</div>
                        </div>
                        
                        <div class="card" style="margin-bottom: 12px; cursor: pointer;" onclick="useIdea('Behind the Scenes')">
                            <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">📸 Behind the Scenes</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Show your creative process</div>
                        </div>
                        
                        <button class="btn" onclick="generateMoreIdeas()">Generate More Ideas</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Creator Analytics Modal
        function openCreatorAnalyticsModal() {
            openDetailedAnalyticsModal();
        }
        
        // Payout Settings Modal
        function openPayoutSettingsModal() {
            const modalHTML = `
                <div id="payoutSettingsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('payoutSettings')">✕</div>
                        <div class="modal-title">💵 Payout Settings</div>
                    </div>
                    <div class="modal-content">
                        <div style="background: linear-gradient(135deg, var(--success), var(--primary)); padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Available Balance</div>
                            <div style="font-size: 48px; font-weight: 800;">$8,945</div>
                            <div style="font-size: 13px; opacity: 0.9;">Ready to withdraw</div>
                        </div>
                        
                        <button class="btn" style="margin-bottom: 20px;" onclick="requestPayout()">Request Payout</button>
                        
                        <div class="section-header">
                            <div class="section-title">Payment Methods</div>
                        </div>
                        
                        <div class="list-item" onclick="openPaymentMethodDetails('PayPal')">
                            <div class="list-item-icon">💳</div>
                            <div class="list-item-content">
                                <div class="list-item-title">PayPal</div>
                                <div class="list-item-subtitle">john.doe@email.com • Primary</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // New Content Modal
        function openNewContentModal() {
            const modalHTML = `
                <div id="newContentModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('newContent')">✕</div>
                        <div class="modal-title">➕ New Content</div>
                    </div>
                    <div class="modal-content">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                            <button class="btn" onclick="createNewVideo()">🎥 Video</button>
                            <button class="btn" style="background: var(--glass);" onclick="createNewPhoto()">📸 Photo</button>
                            <button class="btn" style="background: var(--glass);" onclick="createNewArticle()">📝 Article</button>
                            <button class="btn" style="background: var(--glass);" onclick="createNewStory()">⭐ Story</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Edit Creator Profile Modal
        function openEditCreatorProfileModal() {
            const modalHTML = `
                <div id="editCreatorProfileModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('editCreatorProfile')">✕</div>
                        <div class="modal-title">✏️ Edit Profile</div>
                        <button class="btn" style="width: auto; padding: 8px 20px;" onclick="saveCreatorProfile()">Save</button>
                    </div>
                    <div class="modal-content">
                        <input type="text" class="input-field" placeholder="Creator name" value="[Current User]" id="creatorName" />
                        <input type="text" class="input-field" placeholder="Username" value="[@username]" id="creatorUsername" />
                        <textarea class="input-field textarea-field" placeholder="Bio" id="creatorBio">Content Creator</textarea>
                        <input type="text" class="input-field" placeholder="Category" value="Technology" id="creatorCategory" />
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Apply Verification Modal
        function openApplyVerificationModal() {
            const modalHTML = `
                <div id="applyVerificationModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('applyVerification')">✕</div>
                        <div class="modal-title">✓ Apply for Verification</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">✓</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Get Verified</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Prove your authenticity</div>
                        </div>
                        
                        <div style="background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                            <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Requirements:</div>
                            <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.8;">
                                ✓ Active account for 6+ months<br>
                                ✓ 10,000+ followers<br>
                                ✓ Valid government ID<br>
                                ✓ Authentic & active presence
                            </div>
                        </div>
                        
                        <button class="btn" onclick="startVerificationProcess()">Start Application</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Upgrade Premium Modal
        function openUpgradePremiumModal() {
            const modalHTML = `
                <div id="upgradePremiumModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('upgradePremium')">✕</div>
                        <div class="modal-title">⭐ Upgrade to Premium</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">⭐</div>
                            <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Premium Creator</div>
                            <div style="font-size: 18px; font-weight: 800; color: var(--primary); margin-bottom: 4px;">$19.99<span style="font-size: 14px; color: var(--text-secondary); font-weight: 400;">/month</span></div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Premium Benefits</div>
                        </div>
                        
                        <div style="font-size: 14px; margin-bottom: 12px;">✓ Advanced analytics dashboard</div>
                        <div style="font-size: 14px; margin-bottom: 12px;">✓ Priority support</div>
                        <div style="font-size: 14px; margin-bottom: 12px;">✓ Custom branding options</div>
                        <div style="font-size: 14px; margin-bottom: 12px;">✓ Higher revenue share</div>
                        <div style="font-size: 14px; margin-bottom: 20px;">✓ Exclusive features early access</div>
                        
                        <button class="btn" onclick="upgradeToPremium()">Upgrade Now</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Become Partner Modal
        function openBecomePartnerModal() {
            const modalHTML = `
                <div id="becomePartnerModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('becomePartner')">✕</div>
                        <div class="modal-title">🎖️ Become a Partner</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🎖️</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Partner Program</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Exclusive benefits for top creators</div>
                        </div>
                        
                        <div style="background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                            <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Requirements:</div>
                            <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.8;">
                                ✓ 500,000+ followers<br>
                                ✓ Verified account<br>
                                ✓ Consistent content quality<br>
                                ✓ Active engagement
                            </div>
                        </div>
                        
                        <button class="btn" onclick="applyForPartnership()">Apply Now</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Monetization Details Modal
        function openMonetizationDetailsModal() {
            const modalHTML = `
                <div id="monetizationDetailsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('monetizationDetails')">✕</div>
                        <div class="modal-title">💰 Monetization Overview</div>
                    </div>
                    <div class="modal-content">
                        <div style="background: linear-gradient(135deg, var(--success), var(--accent)); padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Total Revenue</div>
                            <div style="font-size: 48px; font-weight: 800;">$8,945</div>
                            <div style="font-size: 13px; opacity: 0.9;">This month</div>
                        </div>
                        
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">$3,245</div>
                                <div class="stat-label">Subscriptions</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">$2,890</div>
                                <div class="stat-label">Tips</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">$1,800</div>
                                <div class="stat-label">Sponsorships</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">$1,010</div>
                                <div class="stat-label">Merchandise</div>
                            </div>
                        </div>
                        
                        <button class="btn" style="background: var(--glass); margin-top: 16px;" onclick="viewDetailedRevenue()">View Details</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Edit Scheduled Post Modal
        function openEditScheduledPostModal() {
            const modalHTML = `
                <div id="editScheduledPostModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('editScheduledPost')">✕</div>
                        <div class="modal-title">✏️ Edit Scheduled Post</div>
                    </div>
                    <div class="modal-content">
                        <input type="text" class="input-field" placeholder="Post title..." value="Tech Review Video" />
                        <textarea class="input-field textarea-field" placeholder="Caption...">My latest tech review</textarea>
                        <input type="datetime-local" class="input-field" value="2024-12-20T10:00" />
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                            <button class="btn" onclick="updateScheduledPost()">Save Changes</button>
                            <button class="btn" style="background: var(--error);" onclick="deleteScheduledPost()">Delete</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Creator Settings Modal
        function openCreatorSettingsModal() {
            const modalHTML = `
                <div id="creatorSettingsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('creatorSettings')">✕</div>
                        <div class="modal-title">⚙️ Creator Settings</div>
                    </div>
                    <div class="modal-content">
                        <div class="section-header">
                            <div class="section-title">Profile Settings</div>
                        </div>
                        
                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">Show Analytics to Public</div>
                                <div class="list-item-subtitle">Display your stats</div>
                            </div>
                            <div class="toggle-switch" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                        
                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">Enable Subscriptions</div>
                                <div class="list-item-subtitle">Allow paid subscriptions</div>
                            </div>
                            <div class="toggle-switch active" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                        
                        <div class="list-item" onclick="openPayoutSettingsModal()">
                            <div class="list-item-icon">💵</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Payout Settings</div>
                                <div class="list-item-subtitle">Manage payments</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Helper functions for Creator Profile
        function createNewTier() { showToast('Creating new tier... 💳'); }
        function editTier(tier) { showToast(`Editing ${tier} tier... ✏️`); }
        function manageSubscribers() { showToast('Opening subscribers dashboard... 👥'); }
        function setupDonationOptions() { showToast('Setting up donations... 🎁'); }
        function findNewSponsors() { showToast('Finding sponsors... 🤝'); }
        function addNewProduct() { showToast('Adding new product... 👕'); }
        function manageStore() { showToast('Opening store manager... 🛍️'); }
        function viewContent(id) { openContentDetailsModal(); }
        function editContent() { showToast('Opening editor... ✏️'); }
        function deleteContent() { if(confirm('Delete this content?')) showToast('Content deleted'); }
        function useIdea(idea) { closeModal('contentIdeas'); showToast(`Using idea: ${idea} 💡`); }
        function generateMoreIdeas() { showToast('Generating more ideas... 💡'); }
        function requestPayout() { showToast('Requesting payout... 💵'); setTimeout(() => showToast('Payout requested! Processing 1-3 days'), 1500); }
        function createNewVideo() { closeModal('newContent'); showToast('Creating new video... 🎥'); }
        function createNewPhoto() { closeModal('newContent'); showToast('Creating new photo... 📸'); }
        function createNewArticle() { closeModal('newContent'); showToast('Creating new article... 📝'); }
        function createNewStory() { closeModal('newContent'); showToast('Creating new story... ⭐'); }
        function saveCreatorProfile() { closeModal('editCreatorProfile'); showToast('Profile updated! ✓'); }
        function startVerificationProcess() { closeModal('applyVerification'); showToast('Starting verification... ✓'); }
        function upgradeToPremium() { closeModal('upgradePremium'); showToast('Processing upgrade... ⭐'); }
        function applyForPartnership() { closeModal('becomePartner'); showToast('Application submitted! 🎖️'); }
        function viewDetailedRevenue() { closeModal('monetizationDetails'); openDetailedAnalyticsModal(); }
        function updateScheduledPost() { closeModal('editScheduledPost'); showToast('Post updated! ✓'); }
        function deleteScheduledPost() { if(confirm('Delete this post?')) { closeModal('editScheduledPost'); showToast('Post deleted'); } }

        // ========== AR/VR - 8 MISSING DASHBOARD FUNCTIONS ==========

        // 1. 360° Video Library Dashboard
        function open360VideoLibrary() {
            window.arVR = window.arVR || arvrSystem;
            const modalHTML = `
                <div id="video360LibraryModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('video360Library'); const modal = document.getElementById('video360LibraryModal'); if(modal) modal.remove();">✕</div>
                        <div class="modal-title">🎬 360° Videos</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🎬</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Immersive 360° Videos</div>
                        </div>
                        <div class="list-item" onclick="play360Video('Nature')">
                            <div class="list-item-icon">🌿</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Amazon Rainforest</div>
                                <div class="list-item-subtitle">8:45 • 4K</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        <div class="list-item" onclick="play360Video('Space')">
                            <div class="list-item-icon">🚀</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Space Station</div>
                                <div class="list-item-subtitle">12:30 • 4K</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        function play360Video(title) {
            showToast(`▶️ Playing: ${title}`);
        }

        // 2. AR Shopping Dashboard
        function openARShoppingDashboard() {
            window.arVR = window.arVR || arvrSystem;
            const modalHTML = `
                <div id="arShoppingModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('arShopping'); const modal = document.getElementById('arShoppingModal'); if(modal) modal.remove();">✕</div>
                        <div class="modal-title">🛍️ AR Shopping</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🛍️</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Virtual Try-On</div>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                            <div onclick="tryOnItem('Sunglasses')" class="card" style="text-align: center; padding: 20px; cursor: pointer;">
                                <div style="font-size: 40px; margin-bottom: 12px;">😎</div>
                                <div style="font-size: 14px; font-weight: 600;">Sunglasses</div>
                                <div style="font-size: 16px; color: var(--primary);">$89</div>
                            </div>
                            <div onclick="tryOnItem('Hat')" class="card" style="text-align: center; padding: 20px; cursor: pointer;">
                                <div style="font-size: 40px; margin-bottom: 12px;">🎩</div>
                                <div style="font-size: 14px; font-weight: 600;">Hat</div>
                                <div style="font-size: 16px; color: var(--primary);">$45</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        function tryOnItem(item) {
            showToast(`📸 Trying on ${item}...`);
        }

        // 3. AR Games Dashboard
        function openARGamesDashboard() {
            window.arVR = window.arVR || arvrSystem;
            const modalHTML = `
                <div id="arGamesModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('arGames'); const modal = document.getElementById('arGamesModal'); if(modal) modal.remove();">✕</div>
                        <div class="modal-title">🎮 AR Games</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🎮</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Play AR Games</div>
                        </div>
                        <div class="list-item" onclick="playARGame('Treasure Hunt')">
                            <div class="list-item-icon">🏴‍☠️</div>
                            <div class="list-item-content">
                                <div class="list-item-title">AR Treasure Hunt</div>
                                <div class="list-item-subtitle">Find treasures</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        <div class="list-item" onclick="playARGame('Space Invaders')">
                            <div class="list-item-icon">👾</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Space Invaders AR</div>
                                <div class="list-item-subtitle">Defend Earth</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        function playARGame(game) {
            showToast(`🎮 Starting ${game}...`);
        }

        // 4. VR Meditation Dashboard
        function openVRMeditationDashboard() {
            window.arVR = window.arVR || arvrSystem;
            const modalHTML = `
                <div id="vrMeditationModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('vrMeditation'); const modal = document.getElementById('vrMeditationModal'); if(modal) modal.remove();">✕</div>
                        <div class="modal-title">🧘 VR Meditation</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🧘</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">VR Meditation</div>
                        </div>
                        <div class="list-item" onclick="startMeditation('Forest')">
                            <div class="list-item-icon">🌲</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Peaceful Forest</div>
                                <div class="list-item-subtitle">10, 15, 20 min</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        <div class="list-item" onclick="startMeditation('Beach')">
                            <div class="list-item-icon">🏖️</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Tropical Beach</div>
                                <div class="list-item-subtitle">10, 15, 20 min</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        function startMeditation(env) {
            showToast(`🧘 Starting ${env} meditation...`);
        }

        // 5. Custom Filter Creator Dashboard
        function openCustomFilterCreator() {
            window.arVR = window.arVR || arvrSystem;
            const modalHTML = `
                <div id="customFilterModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('customFilter'); const modal = document.getElementById('customFilterModal'); if(modal) modal.remove();">✕</div>
                        <div class="modal-title">🎨 Custom Filter</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🎨</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Create AR Filter</div>
                        </div>
                        <input type="text" class="input-field" placeholder="Filter name..." />
                        <button class="btn" onclick="createFilter()">Create Filter</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        function createFilter() {
            showToast('🎨 Filter created!');
        }

        // 6. VR Headset Manager Dashboard
        function openVRHeadsetManager() {
            window.arVR = window.arVR || arvrSystem;
            const modalHTML = `
                <div id="vrHeadsetModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('vrHeadset'); const modal = document.getElementById('vrHeadsetModal'); if(modal) modal.remove();">✕</div>
                        <div class="modal-title">🥽 VR Headset</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🥽</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">VR Headset Manager</div>
                        </div>
                        <div class="list-item" onclick="connectHeadset('Quest 3')">
                            <div class="list-item-icon">🥽</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Meta Quest 3</div>
                                <div class="list-item-subtitle">Available</div>
                            </div>
                            <button class="btn" style="padding: 8px 16px;">Connect</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        function connectHeadset(device) {
            showToast(`🥽 Connecting to ${device}...`);
        }

        // 7. Spatial Audio Config Dashboard
        function openSpatialAudioConfig() {
            window.arVR = window.arVR || arvrSystem;
            const modalHTML = `
                <div id="spatialAudioModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('spatialAudio'); const modal = document.getElementById('spatialAudioModal'); if(modal) modal.remove();">✕</div>
                        <div class="modal-title">🎧 Spatial Audio</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🎧</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">3D Spatial Audio</div>
                        </div>
                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">Enable Spatial Audio</div>
                                <div class="list-item-subtitle">3D positional audio</div>
                            </div>
                            <div class="toggle-switch active" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                        <button class="btn" onclick="testSpatialAudio()">🔊 Test Audio</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        function testSpatialAudio() {
            showToast('🔊 Testing spatial audio...');
        }

        // 8. Hand Tracking Dashboard
        function openHandTrackingDashboard() {
            window.arVR = window.arVR || arvrSystem;
            const modalHTML = `
                <div id="handTrackingModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('handTracking'); const modal = document.getElementById('handTrackingModal'); if(modal) modal.remove();">✕</div>
                        <div class="modal-title">👋 Hand Tracking</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">👋</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Hand Tracking</div>
                        </div>
                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">Enable Hand Tracking</div>
                                <div class="list-item-subtitle">Control with hands</div>
                            </div>
                            <div class="toggle-switch active" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                        <button class="btn" onclick="testHandTracking()">👋 Test Tracking</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        function testHandTracking() {
            showToast('👋 Testing hand tracking...');
        }

        // ========== BUSINESS PROFILE FUNCTIONS ==========
        
        // Share business profile
        function shareBusinessProfile() {
            showToast('Business profile link copied! 🔗');
            setTimeout(() => {
                showToast('Share your business to attract more customers!');
            }, 1500);
        }
        
        // Call business
        function callBusiness() {
            showToast('Calling (415) 555-0123... 📞');
            setTimeout(() => {
                showToast('Call connected! Speak with Tech Solutions Inc.');
            }, 1500);
        }
        
        // Email business
        function emailBusiness() {
            showToast('Opening email to contact@techsolutions.com... 📧');
            setTimeout(() => {
                showToast('Email client opened');
            }, 800);
        }
        
        // Visit website
        function visitWebsite() {
            showToast('Opening www.techsolutions.com... 🌐');
            setTimeout(() => {
                showToast('Website opened in browser');
            }, 800);
        }
        
        // Business Profile Modals
        
        // Edit Business Profile Modal
        window.openModal = (function(original) {
            return function(type) {
                // Handle business profile modals
                if (type === 'editBusinessProfile') {
                    openEditBusinessProfileModal();
                } else if (type === 'businessSettings') {
                    openBusinessSettingsModal();
                } else if (type === 'editBusinessHours') {
                    openEditBusinessHoursModal();
                } else if (type === 'businessHoursDetails') {
                    openBusinessHoursDetailsModal();
                } else if (type === 'holidayHours') {
                    openHolidayHoursModal();
                } else if (type === 'editLocation') {
                    openEditLocationModal();
                } else if (type === 'viewMap') {
                    openViewMapModal();
                } else if (type === 'socialMediaLinks') {
                    openSocialMediaLinksModal();
                } else if (type === 'manageProductsServices') {
                    openManageProductsServicesModal();
                } else if (type === 'serviceDetails') {
                    openServiceDetailsModal(arguments[1]);
                } else if (type === 'catalogBrowser') {
                    openCatalogBrowserModal();
                } else if (type === 'manageTeam') {
                    openManageTeamModal();
                } else if (type === 'teamMemberProfile') {
                    openTeamMemberProfileModal(arguments[1]);
                } else if (type === 'viewAllTeam') {
                    openViewAllTeamModal();
                } else if (type === 'networkingTools') {
                    openNetworkingToolsModal();
                } else if (type === 'businessConnections') {
                    openBusinessConnectionsModal();
                } else if (type === 'partnerships') {
                    openPartnershipsModal();
                } else if (type === 'leads') {
                    openLeadsModal();
                } else if (type === 'opportunities') {
                    openOpportunitiesModal();
                } else if (type === 'findBusinesses') {
                    openFindBusinessesModal();
                } else if (type === 'sendProposal') {
                    openSendProposalModal();
                } else if (type === 'scheduleBusinessMeeting') {
                    openScheduleBusinessMeetingModal();
                } else if (type === 'businessMessenger') {
                    openBusinessMessengerModal();
                } else if (type === 'getDirections') {
                    openGetDirectionsModal();
                } else if (type === 'bookAppointment') {
                    openBookAppointmentModal();
                } else if (type === 'requestQuote') {
                    openRequestQuoteModal();
                } else if (type === 'businessAnalytics') {
                    openBusinessAnalyticsModal();
                } else {
                    original(type);
                }
            };
        })(openModal);
        
        // Edit Business Profile Modal
        function openEditBusinessProfileModal() {
            const modalHTML = `
                <div id="editBusinessProfileModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('editBusinessProfile')">✕</div>
                        <div class="modal-title">✏️ Edit Business Profile</div>
                        <button class="btn" style="width: auto; padding: 8px 20px;" onclick="saveBusinessProfile()">Save</button>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <div style="width: 100px; height: 100px; border-radius: 20px; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-size: 40px; margin: 0 auto 12px; border: 4px solid var(--glass-border);">
                                🏢
                            </div>
                            <button class="btn" style="margin-top: 12px; background: var(--glass);" onclick="changeBusinessLogo()">
                                Change Logo
                            </button>
                        </div>
                        
                        <input type="text" class="input-field" placeholder="Business Name" value="Tech Solutions Inc." id="businessName" />
                        <input type="text" class="input-field" placeholder="Industry/Category" value="Technology & Consulting" id="businessCategory" />
                        <textarea class="input-field textarea-field" placeholder="Business Description" id="businessDescription">Leading provider of technology solutions and consulting services.</textarea>
                        <input type="text" class="input-field" placeholder="Tagline" value="Innovation Meets Excellence" id="businessTagline" />
                        <input type="email" class="input-field" placeholder="Contact Email" value="contact@techsolutions.com" id="businessEmail" />
                        <input type="tel" class="input-field" placeholder="Phone Number" value="(415) 555-0123" id="businessPhone" />
                        <input type="url" class="input-field" placeholder="Website URL" value="www.techsolutions.com" id="businessWebsite" />
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Business Settings Modal
        function openBusinessSettingsModal() {
            const modalHTML = `
                <div id="businessSettingsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('businessSettings')">✕</div>
                        <div class="modal-title">⚙️ Business Settings</div>
                    </div>
                    <div class="modal-content">
                        <div class="section-header">
                            <div class="section-title">Profile Settings</div>
                        </div>
                        
                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">Business Profile Active</div>
                                <div class="list-item-subtitle">Show business features</div>
                            </div>
                            <div class="toggle-switch active" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                        
                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">Show Contact Info</div>
                                <div class="list-item-subtitle">Display publicly</div>
                            </div>
                            <div class="toggle-switch active" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                        
                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">Accept Appointments</div>
                                <div class="list-item-subtitle">Allow booking</div>
                            </div>
                            <div class="toggle-switch active" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Notifications</div>
                        </div>
                        
                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">New Customer Inquiries</div>
                                <div class="list-item-subtitle">Get notified</div>
                            </div>
                            <div class="toggle-switch active" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                        
                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">Review Notifications</div>
                                <div class="list-item-subtitle">New reviews</div>
                            </div>
                            <div class="toggle-switch active" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                        
                        <div class="list-item" onclick="openBusinessPrivacySettings()">
                            <div class="list-item-icon">🔐</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Privacy Settings</div>
                                <div class="list-item-subtitle">Manage data visibility</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Edit Business Hours Modal
        function openEditBusinessHoursModal() {
            const modalHTML = `
                <div id="editBusinessHoursModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('editBusinessHours')">✕</div>
                        <div class="modal-title">🕐 Edit Business Hours</div>
                        <button class="btn" style="width: auto; padding: 8px 20px;" onclick="saveBusinessHours()">Save</button>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 20px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🕐</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Set Your Hours</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Let customers know when you're open</div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Weekly Schedule</div>
                        </div>
                        
                        <div class="card" style="margin-bottom: 12px;">
                            <div style="font-weight: 600; margin-bottom: 12px;">Monday - Friday</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <input type="time" class="input-field" value="09:00" style="margin-bottom: 0;" />
                                <input type="time" class="input-field" value="18:00" style="margin-bottom: 0;" />
                            </div>
                        </div>
                        
                        <div class="card" style="margin-bottom: 12px;">
                            <div style="font-weight: 600; margin-bottom: 12px;">Saturday</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <input type="time" class="input-field" value="10:00" style="margin-bottom: 0;" />
                                <input type="time" class="input-field" value="16:00" style="margin-bottom: 0;" />
                            </div>
                        </div>
                        
                        <div class="card" style="margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="font-weight: 600;">Sunday</div>
                                <div class="toggle-switch" id="sundayToggle" onclick="toggleSwitch(this)">
                                    <div class="toggle-slider"></div>
                                </div>
                            </div>
                            <div style="font-size: 13px; color: var(--text-secondary); margin-top: 8px;">Closed</div>
                        </div>
                        
                        <button class="btn" style="background: var(--glass); margin-top: 16px;" onclick="copyHours()">
                            📋 Copy Hours to All Days
                        </button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Business Hours Details Modal
        function openBusinessHoursDetailsModal() {
            const modalHTML = `
                <div id="businessHoursDetailsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('businessHoursDetails')">✕</div>
                        <div class="modal-title">🕐 Business Hours</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🕐</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Operating Hours</div>
                            <div style="padding: 8px 20px; background: rgba(16, 185, 129, 0.2); border-radius: 16px; font-size: 14px; font-weight: 700; color: var(--success); display: inline-block;">
                                OPEN NOW
                            </div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Weekly Schedule</div>
                        </div>
                        
                        <div class="list-item">
                            <div class="list-item-icon">📅</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Monday</div>
                                <div class="list-item-subtitle">9:00 AM - 6:00 PM</div>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">📅</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Tuesday</div>
                                <div class="list-item-subtitle">9:00 AM - 6:00 PM</div>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">📅</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Wednesday</div>
                                <div class="list-item-subtitle">9:00 AM - 6:00 PM</div>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">📅</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Thursday</div>
                                <div class="list-item-subtitle">9:00 AM - 6:00 PM</div>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">📅</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Friday</div>
                                <div class="list-item-subtitle">9:00 AM - 6:00 PM</div>
                            </div>
                        </div>
                        <div class="list-item">
                            <div class="list-item-icon">📅</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Saturday</div>
                                <div class="list-item-subtitle">10:00 AM - 4:00 PM</div>
                            </div>
                        </div>
                        <div class="list-item" style="opacity: 0.6;">
                            <div class="list-item-icon">📅</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Sunday</div>
                                <div class="list-item-subtitle">Closed</div>
                            </div>
                        </div>
                        
                        <button class="btn" style="background: var(--glass); margin-top: 16px;" onclick="editBusinessHours()">
                            ✏️ Edit Hours
                        </button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Holiday Hours Modal
        function openHolidayHoursModal() {
            const modalHTML = `
                <div id="holidayHoursModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('holidayHours')">✕</div>
                        <div class="modal-title">🎄 Holiday Hours</div>
                        <button class="btn" style="width: auto; padding: 8px 16px;" onclick="addHolidayHours()">+ Add</button>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🎄</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Special Holiday Schedule</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Manage holiday operating hours</div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Upcoming Holidays</div>
                        </div>
                        
                        <div class="card" style="margin-bottom: 12px;">
                            <div style="font-weight: 600; margin-bottom: 8px;">🎄 Christmas Day</div>
                            <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">December 25, 2024</div>
                            <div style="padding: 6px 16px; background: rgba(239, 68, 68, 0.2); border-radius: 12px; font-size: 12px; font-weight: 700; color: var(--error); display: inline-block;">
                                CLOSED
                            </div>
                            <button class="btn" style="background: var(--glass); margin-top: 12px; font-size: 13px; padding: 10px;" onclick="editHoliday('Christmas')">
                                Edit
                            </button>
                        </div>
                        
                        <div class="card" style="margin-bottom: 12px;">
                            <div style="font-weight: 600; margin-bottom: 8px;">🎊 New Year's Day</div>
                            <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">January 1, 2025</div>
                            <div style="padding: 6px 16px; background: rgba(16, 185, 129, 0.2); border-radius: 12px; font-size: 12px; font-weight: 700; color: var(--success); display: inline-block;">
                                12:00 PM - 5:00 PM
                            </div>
                            <button class="btn" style="background: var(--glass); margin-top: 12px; font-size: 13px; padding: 10px;" onclick="editHoliday('NewYear')">
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Edit Location Modal
        function openEditLocationModal() {
            const modalHTML = `
                <div id="editLocationModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('editLocation')">✕</div>
                        <div class="modal-title">📍 Edit Location</div>
                        <button class="btn" style="width: auto; padding: 8px 20px;" onclick="saveLocation()">Save</button>
                    </div>
                    <div class="modal-content">
                        <input type="text" class="input-field" placeholder="Street Address" value="123 Market St" id="businessStreet" />
                        <input type="text" class="input-field" placeholder="City" value="San Francisco" id="businessCity" />
                        <input type="text" class="input-field" placeholder="State" value="CA" id="businessState" />
                        <input type="text" class="input-field" placeholder="ZIP Code" value="94103" id="businessZip" />
                        <input type="text" class="input-field" placeholder="Country" value="United States" id="businessCountry" />
                        
                        <button class="btn" style="background: var(--glass); margin-top: 16px;" onclick="useCurrentLocation()">
                            📍 Use Current Location
                        </button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // View Map Modal
        function openViewMapModal() {
            const modalHTML = `
                <div id="viewMapModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('viewMap')">✕</div>
                        <div class="modal-title">📍 Location</div>
                    </div>
                    <div class="modal-content">
                        <div style="width: 100%; height: 300px; background: linear-gradient(135deg, var(--success), var(--accent)); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 20px; position: relative;">
                            <div style="font-size: 80px; margin-bottom: 16px;">📍</div>
                            <div style="font-size: 16px; font-weight: 600;">123 Market St</div>
                            <div style="font-size: 14px; opacity: 0.9;">San Francisco, CA 94103</div>
                        </div>
                        
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">2.4mi</div>
                                <div class="stat-label">Distance</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">8 min</div>
                                <div class="stat-label">Drive Time</div>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 16px;">
                            <button class="btn" onclick="getDirectionsToLocation()">
                                🗺️ Directions
                            </button>
                            <button class="btn" style="background: var(--glass);" onclick="shareBusinessLocation()">
                                📤 Share
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Social Media Links Modal
        function openSocialMediaLinksModal() {
            const modalHTML = `
                <div id="socialMediaLinksModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('socialMediaLinks')">✕</div>
                        <div class="modal-title">🔗 Social Media</div>
                    </div>
                    <div class="modal-content">
                        <div class="section-header">
                            <div class="section-title">Connected Platforms</div>
                            <div class="section-link">5 connected</div>
                        </div>
                        
                        <div class="list-item" onclick="visitSocialMedia('Facebook')">
                            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #1877F2, #0C63D4); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">📘</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Facebook</div>
                                <div class="list-item-subtitle">@techsolutions</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <div class="list-item" onclick="visitSocialMedia('Twitter')">
                            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #1DA1F2, #0C85D0); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🐦</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Twitter</div>
                                <div class="list-item-subtitle">@techsolutions</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <div class="list-item" onclick="visitSocialMedia('LinkedIn')">
                            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #0077B5, #005E93); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">💼</div>
                            <div class="list-item-content">
                                <div class="list-item-title">LinkedIn</div>
                                <div class="list-item-subtitle">Tech Solutions Inc</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <div class="list-item" onclick="visitSocialMedia('Instagram')">
                            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #E1306C, #C13584); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">📸</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Instagram</div>
                                <div class="list-item-subtitle">@techsolutionsinc</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <div class="list-item" onclick="visitSocialMedia('YouTube')">
                            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #FF0000, #CC0000); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">▶️</div>
                            <div class="list-item-content">
                                <div class="list-item-title">YouTube</div>
                                <div class="list-item-subtitle">Tech Solutions Channel</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <button class="btn" style="background: var(--glass); margin-top: 16px;" onclick="addSocialMediaPlatform()">
                            ➕ Add Platform
                        </button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Manage Products/Services Modal
        function openManageProductsServicesModal() {
            const modalHTML = `
                <div id="manageProductsServicesModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('manageProductsServices')">✕</div>
                        <div class="modal-title">💼 Manage Services</div>
                        <button class="btn" style="width: auto; padding: 8px 16px;" onclick="addNewService()">+ Add</button>
                    </div>
                    <div class="modal-content">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">8</div>
                                <div class="stat-label">Services</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">45</div>
                                <div class="stat-label">Active Projects</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">$45K</div>
                                <div class="stat-label">Monthly</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">4.9★</div>
                                <div class="stat-label">Rating</div>
                            </div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">All Services</div>
                        </div>
                        
                        <div class="card" style="margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <div style="font-size: 40px;">💻</div>
                                <div style="flex: 1;">
                                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">Web Development</div>
                                    <div style="font-size: 14px; font-weight: 700; color: var(--primary);">$5,000+</div>
                                </div>
                            </div>
                            <button class="btn" style="background: var(--glass); font-size: 13px; padding: 10px;" onclick="editService('Web Development')">✏️ Edit</button>
                        </div>
                        
                        <button class="btn" style="background: var(--glass);" onclick="viewAllServices()">View All 8 Services</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Service Details Modal
        function openServiceDetailsModal(serviceName) {
            const serviceData = {
                'Web Development': {
                    price: '$5,000+',
                    emoji: '💻',
                    description: 'Professional web development services for modern businesses',
                    gradient: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    features: ['Responsive Design', 'SEO Optimized', 'Fast Performance', 'Security Features']
                },
                'Mobile Apps': {
                    price: '$8,000+',
                    emoji: '📱',
                    description: 'Native iOS and Android app development',
                    gradient: 'linear-gradient(135deg, var(--success), var(--accent))',
                    features: ['Cross-Platform', 'App Store Ready', 'Push Notifications', 'Cloud Integration']
                },
                'Cloud Solutions': {
                    price: '$3,500+',
                    emoji: '☁️',
                    description: 'Scalable cloud infrastructure and migration services',
                    gradient: 'linear-gradient(135deg, var(--accent), var(--primary))',
                    features: ['AWS/Azure/GCP', 'Auto-Scaling', '99.9% Uptime', '24/7 Monitoring']
                },
                'IT Consulting': {
                    price: '$150/hr',
                    emoji: '🎯',
                    description: 'Expert technology consulting and strategic planning',
                    gradient: 'linear-gradient(135deg, var(--warning), var(--error))',
                    features: ['Technology Strategy', 'System Architecture', 'Best Practices', 'Technical Audit']
                }
            };
            
            const service = serviceData[serviceName] || serviceData['Web Development'];
            
            const modalHTML = `
                <div id="serviceDetailsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('serviceDetails')">✕</div>
                        <div class="modal-title">${serviceName}</div>
                    </div>
                    <div class="modal-content">
                        <div style="width: 100%; height: 200px; background: ${service.gradient}; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 80px; margin-bottom: 20px;">
                            ${service.emoji}
                        </div>
                        
                        <div style="font-size: 28px; font-weight: 800; color: var(--primary); margin-bottom: 12px;">${service.price}</div>
                        <div style="font-size: 16px; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.6;">${service.description}</div>
                        
                        <div class="section-header">
                            <div class="section-title">Key Features</div>
                        </div>
                        
                        ${service.features.map(feature => `
                            <div style="font-size: 14px; margin-bottom: 8px;">✓ ${feature}</div>
                        `).join('')}
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 20px;">
                            <button class="btn" onclick="requestServiceQuote('${serviceName}')">💬 Get Quote</button>
                            <button class="btn" style="background: var(--glass);" onclick="bookServiceConsultation('${serviceName}')">📅 Book Call</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Catalog Browser Modal
        function openCatalogBrowserModal() {
            const modalHTML = `
                <div id="catalogBrowserModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('catalogBrowser')">✕</div>
                        <div class="modal-title">📁 Service Catalog</div>
                    </div>
                    <div class="modal-content">
                        <div class="search-bar">
                            <span>🔍</span>
                            <input type="text" class="search-input" placeholder="Search services..." />
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                            <div class="card" style="text-align: center; padding: 20px; cursor: pointer;" onclick="openModal('serviceDetails', 'Web Development')">
                                <div style="font-size: 48px; margin-bottom: 12px;">💻</div>
                                <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Web Development</div>
                                <div style="font-size: 16px; font-weight: 700; color: var(--primary);">$5,000+</div>
                            </div>
                            <div class="card" style="text-align: center; padding: 20px; cursor: pointer;" onclick="openModal('serviceDetails', 'Mobile Apps')">
                                <div style="font-size: 48px; margin-bottom: 12px;">📱</div>
                                <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Mobile Apps</div>
                                <div style="font-size: 16px; font-weight: 700; color: var(--primary);">$8,000+</div>
                            </div>
                            <div class="card" style="text-align: center; padding: 20px; cursor: pointer;" onclick="openModal('serviceDetails', 'Cloud Solutions')">
                                <div style="font-size: 48px; margin-bottom: 12px;">☁️</div>
                                <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Cloud Solutions</div>
                                <div style="font-size: 16px; font-weight: 700; color: var(--primary);">$3,500+</div>
                            </div>
                            <div class="card" style="text-align: center; padding: 20px; cursor: pointer;" onclick="openModal('serviceDetails', 'IT Consulting')">
                                <div style="font-size: 48px; margin-bottom: 12px;">🎯</div>
                                <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">IT Consulting</div>
                                <div style="font-size: 16px; font-weight: 700; color: var(--primary);">$150/hr</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Manage Team Modal
        function openManageTeamModal() {
            const modalHTML = `
                <div id="manageTeamModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('manageTeam')">✕</div>
                        <div class="modal-title">👥 Manage Team</div>
                        <button class="btn" style="width: auto; padding: 8px 16px;" onclick="inviteTeamMember()">+ Invite</button>
                    </div>
                    <div class="modal-content">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">25</div>
                                <div class="stat-label">Team Members</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">5</div>
                                <div class="stat-label">Departments</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">8</div>
                                <div class="stat-label">Managers</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">17</div>
                                <div class="stat-label">Staff</div>
                            </div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Team Members</div>
                        </div>
                        
                        <div class="list-item" onclick="openModal('teamMemberProfile', '[User Name]')">
                            <div class="post-avatar">👤</div>
                            <div class="list-item-content">
                                <div class="list-item-title">[User Name]</div>
                                <div class="list-item-subtitle">CEO • Joined 2020</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <div class="list-item" onclick="openModal('teamMemberProfile', '[User Name]')">
                            <div class="post-avatar">😊</div>
                            <div class="list-item-content">
                                <div class="list-item-title">[User Name]</div>
                                <div class="list-item-subtitle">CTO • Joined 2021</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <button class="btn" style="background: var(--glass); margin-top: 16px;" onclick="viewOrgChart()">📊 View Org Chart</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Team Member Profile Modal
        function openTeamMemberProfileModal(name) {
            const memberData = {
                '[User Name]': { title: 'CEO', department: 'Executive', joined: '2020', emoji: '👤', email: 'user@example.com' },
                '[User Name]': { title: 'CTO', department: 'Technology', joined: '2021', emoji: '😊', email: 'user@example.com' },
                '[User Name]': { title: 'Lead Designer', department: 'Design', joined: '2022', emoji: '🎨', email: 'user@example.com' }
            };
            
            const member = memberData[name] || memberData['[User Name]'];
            
            const modalHTML = `
                <div id="teamMemberProfileModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('teamMemberProfile')">✕</div>
                        <div class="modal-title">${name}</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 20px 0;">
                            <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-size: 40px; margin: 0 auto 12px;">${member.emoji}</div>
                            <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">${name}</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">${member.title}</div>
                        </div>
                        
                        <div class="list-item" onclick="emailTeamMember('${member.email}')">
                            <div class="list-item-icon">📧</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Email</div>
                                <div class="list-item-subtitle">${member.email}</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <div class="list-item">
                            <div class="list-item-icon">🏢</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Department</div>
                                <div class="list-item-subtitle">${member.department}</div>
                            </div>
                        </div>
                        
                        <div class="list-item">
                            <div class="list-item-icon">📅</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Joined</div>
                                <div class="list-item-subtitle">${member.joined}</div>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 16px;">
                            <button class="btn" onclick="messageTeamMember('${name}')">💬 Message</button>
                            <button class="btn" style="background: var(--glass);" onclick="editTeamMember('${name}')">✏️ Edit</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // View All Team Modal
        function openViewAllTeamModal() {
            const modalHTML = `
                <div id="viewAllTeamModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('viewAllTeam')">✕</div>
                        <div class="modal-title">👥 All Team Members</div>
                    </div>
                    <div class="modal-content">
                        <div class="search-bar">
                            <span>🔍</span>
                            <input type="text" class="search-input" placeholder="Search team..." />
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px;">
                            ${['Executive', 'Technology Management', 'Design', 'Engineering', 'Sales', 'Marketing', 'Support', 'HR', 'Finance'].map(member => `
                                <div style="text-align: center; cursor: pointer;" onclick="showToast('Opening ${member} profile')">
                                    <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-size: 20px; margin: 0 auto 8px;">👤</div>
                                    <div style="font-size: 11px; font-weight: 600; margin-bottom: 2px;">${member.split(' ')[0]}</div>
                                    <div style="font-size: 10px; color: var(--text-secondary);">${member.split(' ')[1] || 'Team'}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Networking Tools Modal
        function openNetworkingToolsModal() {
            const modalHTML = `
                <div id="networkingToolsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('networkingTools')">✕</div>
                        <div class="modal-title">🤝 Networking Tools</div>
                    </div>
                    <div class="modal-content">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                            <button class="btn" onclick="createNetworkingEvent()">📅 Create Event</button>
                            <button class="btn" style="background: var(--glass);" onclick="sendConnectionRequest()">👥 Connect</button>
                            <button class="btn" style="background: var(--glass);" onclick="viewIndustryGroups()">🏢 Industry Groups</button>
                            <button class="btn" style="background: var(--glass);" onclick="attendNetworkingEvent()">🎯 Events</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Business Connections Modal
        function openBusinessConnectionsModal() {
            const modalHTML = `
                <div id="businessConnectionsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('businessConnections')">✕</div>
                        <div class="modal-title">👥 Business Connections</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">👥</div>
                            <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">234 Connections</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Your professional network</div>
                        </div>
                        
                        <div class="search-bar">
                            <span>🔍</span>
                            <input type="text" class="search-input" placeholder="Search connections..." />
                        </div>
                        
                        <div class="friend-card">
                            <div class="friend-avatar">🏢</div>
                            <div class="friend-info">
                                <div class="friend-name">Acme Corporation</div>
                                <div class="friend-mutual">Technology Partner</div>
                            </div>
                            <button class="friend-btn secondary">Message</button>
                        </div>
                        
                        <div class="friend-card">
                            <div class="friend-avatar">💼</div>
                            <div class="friend-info">
                                <div class="friend-name">Global Consulting LLC</div>
                                <div class="friend-mutual">Business Partner</div>
                            </div>
                            <button class="friend-btn secondary">Message</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Partnerships Modal
        function openPartnershipsModal() {
            const modalHTML = `
                <div id="partnershipsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('partnerships')">✕</div>
                        <div class="modal-title">🤝 Partnerships</div>
                    </div>
                    <div class="modal-content">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">12</div>
                                <div class="stat-label">Active Partners</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">$125K</div>
                                <div class="stat-label">Total Value</div>
                            </div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Active Partnerships</div>
                        </div>
                        
                        <div class="card" style="margin-bottom: 12px;">
                            <div style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Strategic Technology Alliance</div>
                            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Acme Corporation</div>
                            <div style="font-size: 18px; font-weight: 800; color: var(--success);">$45K/year</div>
                        </div>
                        
                        <button class="btn" onclick="findNewPartners()">Find New Partners</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Leads Modal
        function openLeadsModal() {
            const modalHTML = `
                <div id="leadsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('leads')">✕</div>
                        <div class="modal-title">📊 Active Leads</div>
                    </div>
                    <div class="modal-content">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">45</div>
                                <div class="stat-label">Active Leads</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">23</div>
                                <div class="stat-label">Hot Leads</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">$89K</div>
                                <div class="stat-label">Potential Value</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">68%</div>
                                <div class="stat-label">Conversion</div>
                            </div>
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Hot Leads</div>
                        </div>
                        
                        <div class="list-item" onclick="viewLeadDetails('Startup Co')">
                            <div class="list-item-icon">🔥</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Startup Co</div>
                                <div class="list-item-subtitle">$15K opportunity • 85% confident</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>
                        
                        <button class="btn" onclick="generateLeadReport()">📊 Generate Report</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Opportunities Modal
        function openOpportunitiesModal() {
            const modalHTML = `
                <div id="opportunitiesModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('opportunities')">✕</div>
                        <div class="modal-title">💼 Opportunities</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">💼</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Business Opportunities</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">8 new opportunities</div>
                        </div>
                        
                        <div class="card" style="margin-bottom: 12px; cursor: pointer;" onclick="viewOpportunityDetails('Cloud Migration')">
                            <div style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">☁️ Cloud Migration Project</div>
                            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Enterprise Solutions Inc.</div>
                            <div style="font-size: 18px; font-weight: 800; color: var(--success);">$75K - $100K</div>
                            <div style="padding: 4px 12px; background: rgba(16, 185, 129, 0.2); border-radius: 12px; font-size: 11px; font-weight: 700; color: var(--success); display: inline-block; margin-top: 8px;">
                                ACTIVE
                            </div>
                        </div>
                        
                        <button class="btn" onclick="findMoreOpportunities()">🔍 Find More</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Find Businesses Modal
        function openFindBusinessesModal() {
            const modalHTML = `
                <div id="findBusinessesModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('findBusinesses')">✕</div>
                        <div class="modal-title">🔍 Find Businesses</div>
                    </div>
                    <div class="modal-content">
                        <div class="search-bar">
                            <span>🔍</span>
                            <input type="text" class="search-input" placeholder="Search businesses..." />
                        </div>
                        
                        <div class="section-header">
                            <div class="section-title">Recommended</div>
                        </div>
                        
                        <div class="friend-card">
                            <div class="friend-avatar">🏢</div>
                            <div class="friend-info">
                                <div class="friend-name">Innovation Labs</div>
                                <div class="friend-mutual">Technology • 4.8★</div>
                            </div>
                            <button class="friend-btn primary">Connect</button>
                        </div>
                        
                        <div class="friend-card">
                            <div class="friend-avatar">💼</div>
                            <div class="friend-info">
                                <div class="friend-name">Digital Agency Pro</div>
                                <div class="friend-mutual">Marketing • 4.9★</div>
                            </div>
                            <button class="friend-btn primary">Connect</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Send Proposal Modal
        function openSendProposalModal() {
            const modalHTML = `
                <div id="sendProposalModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('sendProposal')">✕</div>
                        <div class="modal-title">📄 Send Proposal</div>
                    </div>
                    <div class="modal-content">
                        <input type="text" class="input-field" placeholder="Proposal title..." id="proposalTitle" />
                        <input type="text" class="input-field" placeholder="Client/Business name..." id="proposalClient" />
                        <input type="number" class="input-field" placeholder="Estimated value ($)..." id="proposalValue" />
                        <textarea class="input-field textarea-field" placeholder="Proposal details..." id="proposalDetails"></textarea>
                        <button class="btn" onclick="sendBusinessProposal()">📤 Send Proposal</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Schedule Business Meeting Modal
        function openScheduleBusinessMeetingModal() {
            const modalHTML = `
                <div id="scheduleBusinessMeetingModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('scheduleBusinessMeeting')">✕</div>
                        <div class="modal-title">📅 Schedule Meeting</div>
                    </div>
                    <div class="modal-content">
                        <input type="text" class="input-field" placeholder="Meeting title..." id="meetingTitle" />
                        <input type="datetime-local" class="input-field" id="meetingDateTime" />
                        <input type="text" class="input-field" placeholder="Meeting location/link..." id="meetingLocation" />
                        <textarea class="input-field textarea-field" placeholder="Meeting agenda..." id="meetingAgenda"></textarea>
                        <button class="btn" onclick="scheduleBusinessMeeting()">📅 Schedule</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Business Messenger Modal
        function openBusinessMessengerModal() {
            const modalHTML = `
                <div id="businessMessengerModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('businessMessenger')">✕</div>
                        <div class="modal-title">💬 Business Messenger</div>
                    </div>
                    <div class="modal-content">
                        <div class="search-bar">
                            <span>🔍</span>
                            <input type="text" class="search-input" placeholder="Search messages..." />
                        </div>
                        
                        <div class="message-item" onclick="openBusinessChat('Acme Corp')">
                            <div class="message-avatar" style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-weight: 600;">AC</div>
                            <div class="message-content">
                                <div class="message-name">Acme Corp</div>
                                <div class="message-preview">We'd like to discuss a partnership...</div>
                            </div>
                            <div class="message-time">1h</div>
                        </div>
                        
                        <div class="message-item" onclick="openBusinessChat('Global LLC')">
                            <div class="message-avatar" style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--success), var(--accent)); display: flex; align-items: center; justify-content: center; font-weight: 600;">GL</div>
                            <div class="message-content">
                                <div class="message-name">Global Consulting</div>
                                <div class="message-preview">Thanks for the proposal!</div>
                            </div>
                            <div class="message-time">3h</div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Get Directions Modal
        function openGetDirectionsModal() {
            const modalHTML = `
                <div id="getDirectionsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('getDirections')">✕</div>
                        <div class="modal-title">🗺️ Get Directions</div>
                    </div>
                    <div class="modal-content">
                        <div style="width: 100%; height: 250px; background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 20px;">
                            <div style="font-size: 80px; margin-bottom: 16px;">🗺️</div>
                            <div style="font-size: 16px; font-weight: 600;">123 Market St</div>
                            <div style="font-size: 14px; opacity: 0.9;">San Francisco, CA 94103</div>
                        </div>
                        
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">2.4mi</div>
                                <div class="stat-label">Distance</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">8 min</div>
                                <div class="stat-label">Drive</div>
                            </div>
                        </div>
                        
                        <button class="btn" onclick="openInMaps()">Open in Maps</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Book Appointment Modal
        function openBookAppointmentModal() {
            const modalHTML = `
                <div id="bookAppointmentModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('bookAppointment')">✕</div>
                        <div class="modal-title">📅 Book Appointment</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 20px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">📅</div>
                            <div style="font-size: 18px; font-weight: 600;">Schedule Your Visit</div>
                        </div>
                        
                        <input type="text" class="input-field" placeholder="Your name..." />
                        <input type="email" class="input-field" placeholder="Email address..." />
                        <input type="tel" class="input-field" placeholder="Phone number..." />
                        <select class="input-field">
                            <option>Select service...</option>
                            <option>Web Development</option>
                            <option>Mobile Apps</option>
                            <option>Cloud Solutions</option>
                            <option>IT Consulting</option>
                        </select>
                        <input type="date" class="input-field" />
                        <input type="time" class="input-field" />
                        <textarea class="input-field textarea-field" placeholder="Additional notes (optional)"></textarea>
                        <button class="btn" onclick="confirmAppointment()">Confirm Appointment</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Request Quote Modal
        function openRequestQuoteModal() {
            const modalHTML = `
                <div id="requestQuoteModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('requestQuote')">✕</div>
                        <div class="modal-title">💰 Request Quote</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 20px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">💰</div>
                            <div style="font-size: 18px; font-weight: 600;">Get a Custom Quote</div>
                        </div>
                        
                        <input type="text" class="input-field" placeholder="Your name..." />
                        <input type="email" class="input-field" placeholder="Email address..." />
                        <select class="input-field">
                            <option>Select service...</option>
                            <option>Web Development</option>
                            <option>Mobile Apps</option>
                            <option>Cloud Solutions</option>
                            <option>IT Consulting</option>
                        </select>
                        <textarea class="input-field textarea-field" placeholder="Project details..."></textarea>
                        <button class="btn" onclick="submitQuoteRequest()">Request Quote</button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Business Analytics Modal
        function openBusinessAnalyticsModal() {
            const modalHTML = `
                <div id="businessAnalyticsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('businessAnalytics')">✕</div>
                        <div class="modal-title">📊 Business Analytics</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">📊</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Business Performance</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Last 30 days</div>
                        </div>
                        
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">892</div>
                                <div class="stat-label">Customers</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">$45K</div>
                                <div class="stat-label">Revenue</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">4.8★</div>
                                <div class="stat-label">Rating</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">2.4K</div>
                                <div class="stat-label">Reviews</div>
                            </div>
                        </div>
                        
                        <button class="btn" style="background: var(--glass); margin-top: 16px;" onclick="exportBusinessReport()">
                            📥 Export Report
                        </button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // View All Business Tools - Dashboard for all 8 tools
        function viewAllBusinessTools() {
            const modalHTML = `
                <div id="viewAllBusinessToolsModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('viewAllBusinessTools')">✕</div>
                        <div class="modal-title">🛠️ Business Tools</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🛠️</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Complete Business Toolkit</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">8 powerful tools to grow your business</div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                            <button class="btn" style="background: var(--glass);" onclick="closeModal('viewAllBusinessTools'); businessTools.openAnalyticsDashboard()">📊 Analytics</button>
                            <button class="btn" style="background: var(--glass);" onclick="closeModal('viewAllBusinessTools'); businessTools.openAdManagement()">📢 Ad Manager</button>
                            <button class="btn" style="background: var(--glass);" onclick="closeModal('viewAllBusinessTools'); businessTools.openCRM()">👥 CRM</button>
                            <button class="btn" style="background: var(--glass);" onclick="closeModal('viewAllBusinessTools'); businessTools.manageInvoices()">📄 Invoices</button>
                            <button class="btn" style="background: var(--glass);" onclick="closeModal('viewAllBusinessTools'); businessTools.setupPaymentProcessing()">💳 Payments</button>
                            <button class="btn" style="background: var(--glass);" onclick="closeModal('viewAllBusinessTools'); businessTools.showBusinessInsights()">💡 Insights</button>
                            <button class="btn" style="background: var(--glass);" onclick="closeModal('viewAllBusinessTools'); businessTools.analyzeCompetitors()">🔍 Competitors</button>
                            <button class="btn" style="background: var(--glass);" onclick="closeModal('viewAllBusinessTools'); businessTools.managePromotions()">🎯 Promotions</button>
                            <button class="btn" style="background: var(--glass);" onclick="closeModal('viewAllBusinessTools'); businessTools.manageCatalog()">📦 Catalog</button>
                            <button class="btn" style="background: var(--glass);" onclick="closeModal('viewAllBusinessTools'); businessTools.manageReviews()">⭐ Reviews</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            showToast('Opening Business Tools dashboard... 🛠️');
        }

        // Helper functions for Business Profile
        function changeBusinessLogo() { showToast('Opening logo picker... 🏢'); }
        function saveBusinessProfile() { closeModal('editBusinessProfile'); showToast('Business profile updated! ✓'); }
        function openBusinessPrivacySettings() { showToast('Opening privacy settings... 🔐'); }
        function editBusinessHours() { closeModal('businessHoursDetails'); openModal('editBusinessHours'); }
        function saveBusinessHours() { closeModal('editBusinessHours'); showToast('Business hours updated! ✓'); }
        function copyHours() { showToast('Hours copied to all days! 📋'); }
        function addHolidayHours() { showToast('Adding holiday hours... 🎄'); }
        function editHoliday(holiday) { showToast(`Editing ${holiday} hours... ✏️`); }
        function saveLocation() { closeModal('editLocation'); showToast('Location updated! ✓'); }
        function useCurrentLocation() { showToast('Using current location... 📍'); }
        function getDirectionsToLocation() { showToast('Opening directions... 🗺️'); }
        function shareBusinessLocation() { showToast('Location link copied! 📤'); }
        function visitSocialMedia(platform) { showToast(`Opening ${platform}... 🔗`); }
        function addSocialMediaPlatform() { showToast('Adding new platform... ➕'); }
        function editService(service) { showToast(`Editing ${service}... ✏️`); }
        function viewAllServices() { showToast('Loading all services... 💼'); }
        function requestServiceQuote(service) { closeModal('serviceDetails'); showToast(`Requesting quote for ${service}... 💬`); }
        function bookServiceConsultation(service) { closeModal('serviceDetails'); showToast(`Booking consultation for ${service}... 📅`); }
        function inviteTeamMember() { showToast('Sending invitation... ➕'); }
        function viewOrgChart() { showToast('Loading organization chart... 📊'); }
        function emailTeamMember(email) { showToast(`Opening email to ${email}... 📧`); }
        function messageTeamMember(name) { showToast(`Opening chat with ${name}... 💬`); }
        function editTeamMember(name) { showToast(`Editing ${name} profile... ✏️`); }
        function createNetworkingEvent() { showToast('Creating networking event... 📅'); }
        function sendConnectionRequest() { showToast('Sending connection request... 👥'); }
        function viewIndustryGroups() { showToast('Finding industry groups... 🏢'); }
        function attendNetworkingEvent() { showToast('Finding events... 🎯'); }
        function findNewPartners() { showToast('Searching for partners... 🤝'); }
        function viewLeadDetails(lead) { showToast(`Opening details for ${lead}... 🔥`); }
        function generateLeadReport() { showToast('Generating lead report... 📊'); }
        function viewOpportunityDetails(opp) { showToast(`Opening ${opp}... 💼`); }
        function findMoreOpportunities() { showToast('Finding opportunities... 🔍'); }
        function sendBusinessProposal() { closeModal('sendProposal'); showToast('Proposal sent! 📤'); }
        function scheduleBusinessMeeting() { closeModal('scheduleBusinessMeeting'); showToast('Meeting scheduled! 📅'); }
        function openBusinessChat(name) { closeModal('businessMessenger'); showToast(`Opening chat with ${name}... 💬`); }
        function openInMaps() { closeModal('getDirections'); showToast('Opening in maps app... 🗺️'); }
        function confirmAppointment() { closeModal('bookAppointment'); showToast('Appointment confirmed! 📅'); }
        function submitQuoteRequest() { closeModal('requestQuote'); showToast('Quote request submitted! 💰'); }
        function exportBusinessReport() { showToast('Exporting business report... 📊'); }

        // ========== ADVANCED DATING PROFILE FUNCTIONS ==========
        
        let selectedInterests = ['Gym', 'Photography', 'Travel'];
        let selectedValues = ['Honesty', 'Loyalty', 'Communication'];
        let selectedDealbreakers = ['Smoking', 'Dishonesty'];
        
        // Save Dating Profile
        function saveDatingProfile() {
            closeModal('editDatingProfile');
            showToast('Dating profile updated! ✓');
        }
        
        // Change Dating Photos
        function changeDatingPhotos() {
            showToast('Opening photo gallery... 📷');
            setTimeout(() => {
                showToast('Select photos to add to your dating profile');
            }, 800);
        }
        
        // Save Dating Preferences
        function saveDatingPreferences() {
            closeModal('datingPreferences');
            showToast('Preferences saved! ⚙️');
        }
        
        // Update Age Range
        function updateAgeRange(slider, type) {
            const display = document.getElementById('ageRangeDisplay');
            if (!display) return;
            
            const min = slider.parentElement.querySelector('input[min="18"]').value;
            const max = slider.parentElement.querySelector('input[min="25"]').value;
            display.textContent = `${min} - ${max}`;
        }
        
        // Update Distance
        function updateDistance(slider) {
            const display = document.getElementById('distanceDisplay');
            if (!display) return;
            display.textContent = `${slider.value} miles`;
        }
        
        // Select Gender Preference
        function selectGenderPreference(gender, element) {
            const modal = document.getElementById('datingPreferencesModal');
            if (!modal) return;
            
            // Remove selection from all gender preference items
            const genderItems = modal.querySelectorAll('.list-item');
            genderItems.forEach(item => {
                if (item.querySelector('.list-item-icon')?.textContent.includes('👩') || 
                    item.querySelector('.list-item-icon')?.textContent.includes('👨') || 
                    item.querySelector('.list-item-icon')?.textContent.includes('👥')) {
                    item.style.background = 'var(--glass)';
                    item.style.borderColor = 'var(--glass-border)';
                    const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                    if (checkmark) checkmark.remove();
                }
            });
            
            // Add selection to clicked item
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            showToast(`Show me: ${gender}`);
        }
        
        // Select Education Filter
        function selectEducationFilter(value, element) {
            // Update selection
            const modal = document.getElementById('educationFilterModal');
            modal.querySelectorAll('.list-item').forEach(item => {
                item.style.background = 'var(--glass)';
                item.style.borderColor = 'var(--glass-border)';
                const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                if (checkmark) checkmark.remove();
            });
            
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            // Update display in preferences modal
            const display = document.getElementById('educationFilterValue');
            if (display) display.textContent = value;
            
            closeModal('educationFilter');
            showToast(`Education: ${value}`);
        }
        
        // Select Body Type Filter
        function selectBodyTypeFilter(value, element) {
            const modal = document.getElementById('bodyTypeFilterModal');
            modal.querySelectorAll('.list-item').forEach(item => {
                item.style.background = 'var(--glass)';
                item.style.borderColor = 'var(--glass-border)';
                const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                if (checkmark) checkmark.remove();
            });
            
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            const display = document.getElementById('bodyTypeFilterValue');
            if (display) display.textContent = value;
            
            closeModal('bodyTypeFilter');
            showToast(`Body type: ${value}`);
        }
        
        // Select Height Filter
        function selectHeightFilter(value, element) {
            const modal = document.getElementById('heightFilterModal');
            modal.querySelectorAll('.list-item').forEach(item => {
                item.style.background = 'var(--glass)';
                item.style.borderColor = 'var(--glass-border)';
                const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                if (checkmark) checkmark.remove();
            });
            
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            const display = document.getElementById('heightFilterValue');
            if (display) display.textContent = value;
            
            closeModal('heightFilter');
            showToast(`Height: ${value}`);
        }
        
        // Select Religion Filter
        function selectReligionFilter(value, element) {
            const modal = document.getElementById('religionFilterModal');
            modal.querySelectorAll('.list-item').forEach(item => {
                item.style.background = 'var(--glass)';
                item.style.borderColor = 'var(--glass-border)';
                const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                if (checkmark) checkmark.remove();
            });
            
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            const display = document.getElementById('religionFilterValue');
            if (display) display.textContent = value;
            
            closeModal('religionFilter');
            showToast(`Religion: ${value}`);
        }
        
        // Select Ethnicity Filter
        function selectEthnicityFilter(value, element) {
            const modal = document.getElementById('ethnicityFilterModal');
            modal.querySelectorAll('.list-item').forEach(item => {
                item.style.background = 'var(--glass)';
                item.style.borderColor = 'var(--glass-border)';
                const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                if (checkmark) checkmark.remove();
            });
            
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            const display = document.getElementById('ethnicityFilterValue');
            if (display) display.textContent = value;
            
            closeModal('ethnicityFilter');
            showToast(`Ethnicity: ${value}`);
        }
        
        // Select Children Preference
        function selectChildrenPreference(value, element) {
            openModal('childrenPreference');
        }
        
        function selectChildrenPref(value, element) {
            const modal = document.getElementById('childrenPreferenceModal');
            modal.querySelectorAll('.list-item').forEach(item => {
                item.style.background = 'var(--glass)';
                item.style.borderColor = 'var(--glass-border)';
                const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                if (checkmark) checkmark.remove();
            });
            
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            const display = document.getElementById('childrenValue');
            if (display) display.textContent = value;
            
            closeModal('childrenPreference');
            showToast(`Children: ${value}`);
        }
        
        // Select Marriage Preference
        function selectMarriagePreference(value, element) {
            openModal('marriagePreference');
        }
        
        function selectMarriagePref(value, element) {
            const modal = document.getElementById('marriagePreferenceModal');
            modal.querySelectorAll('.list-item').forEach(item => {
                item.style.background = 'var(--glass)';
                item.style.borderColor = 'var(--glass-border)';
                const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                if (checkmark) checkmark.remove();
            });
            
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            const display = document.getElementById('marriageValue');
            if (display) display.textContent = value;
            
            closeModal('marriagePreference');
            showToast(`Marriage: ${value}`);
        }
        
        // Select Family Importance
        function selectFamilyImportance(value, element) {
            openModal('familyImportance');
        }
        
        function selectFamilyImp(value, element) {
            const modal = document.getElementById('familyImportanceModal');
            modal.querySelectorAll('.list-item').forEach(item => {
                item.style.background = 'var(--glass)';
                item.style.borderColor = 'var(--glass-border)';
                const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                if (checkmark) checkmark.remove();
            });
            
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            const display = document.getElementById('familyValue');
            if (display) display.textContent = value;
            
            closeModal('familyImportance');
            showToast(`Family: ${value}`);
        }
        
        // Toggle Value in Dating Values
        function toggleValue(element, value) {
            element.classList.toggle('selected');
            
            if (element.classList.contains('selected')) {
                if (!element.textContent.startsWith('✓')) {
                    element.textContent = '✓ ' + value;
                }
            } else {
                element.textContent = value;
            }
        }
        
        // Save Dating Values
        function saveDatingValues() {
            const selectedCount = document.querySelectorAll('#selectDatingValuesModal .interest-tag.selected').length;
            const display = document.getElementById('selectedValuesCount');
            if (display) display.textContent = `${selectedCount} selected`;
            
            closeModal('selectDatingValues');
            showToast('Values saved! ❤️');
        }
        
        // Save Dealbreakers
        function saveDealbreakers() {
            const selectedCount = document.querySelectorAll('#selectDealbreakersModal .interest-tag.selected').length;
            const display = document.getElementById('selectedDealbreakers');
            if (display) display.textContent = `${selectedCount} selected`;
            
            closeModal('selectDealbreakers');
            showToast('Dealbreakers saved! 🚫');
        }
        
        // Save Relationship Goals
        function saveRelationshipGoals() {
            closeModal('relationshipGoals');
            showToast('Relationship goals saved! 🎯');
        }
        
        // Select Relationship Type
        function selectRelationshipType(type, element) {
            const modal = document.getElementById('relationshipGoalsModal');
            if (!modal) return;
            
            // Remove selection from all relationship type items
            const items = modal.querySelectorAll('.list-item');
            items.forEach(item => {
                if (item.querySelector('.list-item-icon')?.textContent.includes('💑') || 
                    item.querySelector('.list-item-icon')?.textContent.includes('🌹') || 
                    item.querySelector('.list-item-icon')?.textContent.includes('👥') || 
                    item.querySelector('.list-item-icon')?.textContent.includes('🤔')) {
                    item.style.background = 'var(--glass)';
                    item.style.borderColor = 'var(--glass-border)';
                    const checkmark = item.querySelector('div[style*="color: var(--primary)"]');
                    if (checkmark) checkmark.remove();
                }
            });
            
            // Add selection to clicked item
            element.style.background = 'rgba(79, 70, 229, 0.1)';
            element.style.borderColor = 'var(--primary)';
            element.insertAdjacentHTML('beforeend', '<div style="color: var(--primary); font-weight: 600;">✓</div>');
            
            showToast(`Looking for: ${type}`);
        }
        
        // Save Interests & Hobbies
        function saveInterestsHobbies() {
            const selectedCount = document.querySelectorAll('#interestsHobbiesModal .interest-tag.selected').length;
            closeModal('interestsHobbies');
            showToast(`Saved ${selectedCount} interests! 🎨`);
        }
        
        // Toggle Interest
        function toggleInterest(element, interest) {
            const max = 10;
            const currentCount = document.querySelectorAll('#interestsHobbiesModal .interest-tag.selected').length;
            const counter = document.getElementById('interestCount');
            
            if (element.classList.contains('selected')) {
                // Deselect
                element.classList.remove('selected');
                if (counter) counter.textContent = `${currentCount - 1} / ${max}`;
                selectedInterests = selectedInterests.filter(i => i !== interest);
            } else {
                // Select (check limit)
                if (currentCount >= max) {
                    showToast(`Maximum ${max} interests allowed`);
                    return;
                }
                element.classList.add('selected');
                if (counter) counter.textContent = `${currentCount + 1} / ${max}`;
                selectedInterests.push(interest);
            }
        }
        
        // Add New Verified Photo
        function addNewVerifiedPhoto() {
            closeModal('photoVerification');
            showToast('Opening camera for verification... 📸');
            
            setTimeout(() => {
                showToast('Take a selfie matching the pose shown');
            }, 1000);
            
            setTimeout(() => {
                showToast('Photo verified successfully! ✓');
                openModal('photoVerification');
            }, 3000);
        }

        // ========== VIDEO CALLS - 10 MISSING FEATURES FUNCTIONS ==========

        // 1. DEVICE SETTINGS FUNCTIONS
        function selectCamera() {
            closeModal('deviceSettings');
            showToast('Opening camera selector... 📹');
            setTimeout(() => {
                showToast('Camera selected! ✓');
            }, 800);
        }

        function selectMicrophone() {
            closeModal('deviceSettings');
            showToast('Opening microphone selector... 🎤');
            setTimeout(() => {
                showToast('Microphone selected! ✓');
            }, 800);
        }

        function selectSpeaker() {
            closeModal('deviceSettings');
            showToast('Opening speaker selector... 🔊');
            setTimeout(() => {
                showToast('Speaker selected! ✓');
            }, 800);
        }

        function testDevices() {
            closeModal('deviceSettings');
            showToast('Testing devices... 🔧');
            setTimeout(() => {
                showToast('Camera: ✓ Working | Microphone: ✓ Working | Speakers: ✓ Working');
            }, 1500);
        }

        // 2. AUDIO SETTINGS FUNCTIONS
        function updateMicVolume(slider) {
            const display = document.getElementById('micVolume');
            if (display) {
                display.textContent = `${slider.value}%`;
            }
        }

        function updateSpeakerVolume(slider) {
            const display = document.getElementById('speakerVolume');
            if (display) {
                display.textContent = `${slider.value}%`;
            }
        }

        function testAudioSettings() {
            closeModal('audioSettings');
            showToast('Testing audio settings... 🎧');
            setTimeout(() => {
                showToast('Playing test sound...');
            }, 800);
            setTimeout(() => {
                showToast('Audio test complete! ✓');
            }, 2000);
        }

        // 3. CALL QUALITY MONITOR FUNCTIONS
        function viewDetailedStats() {
            closeModal('callQualityMonitor');
            showToast('Loading detailed statistics... 📈');
            setTimeout(() => {
                showToast('Detailed network stats available');
            }, 1000);
        }

        // 4. RECORDINGS LIBRARY FUNCTIONS
        function playCallRecording(title) {
            closeModal('recordingsLibrary');
            showToast(`▶️ Playing: ${title}`);
            setTimeout(() => {
                showToast('Recording playback started');
            }, 800);
        }

        function downloadCallRecording(title) {
            showToast(`Downloading: ${title}... ⬇️`);
            setTimeout(() => {
                showToast('Download started! Check your downloads folder.');
            }, 1500);
        }

        function manageRecordingsStorage() {
            closeModal('recordingsLibrary');
            showToast('Opening storage management... 💾');
            setTimeout(() => {
                showToast('Manage recordings, delete old files to free up space');
            }, 1000);
        }

        // 5. WAITING ROOM FUNCTIONS
        function admitParticipant(name) {
            showToast(`Admitting ${name} to the call... ✓`);
            setTimeout(() => {
                showToast(`${name} has joined the call!`);
            }, 800);
        }

        function denyParticipant(name) {
            showToast(`Denied ${name} from joining`);
        }

        function admitAllParticipants() {
            closeModal('waitingRoom');
            showToast('Admitting all participants... ✓');
            setTimeout(() => {
                showToast('All participants have joined the call!');
            }, 1000);
        }

        // 6. SCHEDULED CALLS LIST FUNCTIONS
        function viewScheduledCallDetails(title) {
            showToast(`Opening details for: ${title}... 📅`);
            setTimeout(() => {
                showToast('View participants, agenda, and call settings');
            }, 1000);
        }

        function joinScheduledCall(title) {
            closeModal('scheduledCallsList');
            showToast(`Joining ${title}... 📹`);
            setTimeout(() => {
                showToast('Connecting to scheduled call...');
            }, 800);
            setTimeout(() => {
                showToast('Call started! ✓');
            }, 2000);
        }

        // 7. GROUP CALL SETTINGS FUNCTIONS
        function selectMaxParticipants() {
            showToast('Opening participant limit selector... 👥');
            setTimeout(() => {
                showToast('Select max: 10, 25, 50, or 100 participants');
            }, 800);
        }

        function selectCallLayout() {
            showToast('Opening layout options... 📱');
            setTimeout(() => {
                showToast('Choose: Grid View, Speaker View, or Gallery View');
            }, 800);
        }

        function viewGroupCallGuide() {
            closeModal('groupCallSettings');
            showToast('Opening group call setup guide... 📖');
            setTimeout(() => {
                showToast('Learn how to host effective group calls');
            }, 1000);
        }

        // 8. CALL ANALYTICS FUNCTIONS
        function exportCallAnalytics() {
            closeModal('callAnalytics');
            showToast('Exporting call analytics... 📊');
            setTimeout(() => {
                showToast('Analytics report exported successfully! ✓');
            }, 1500);
        }

        // 9. CALL SETTINGS FUNCTIONS
        function selectVideoResolution() {
            showToast('Opening resolution selector... 📹');
            setTimeout(() => {
                showToast('Select: 480p, 720p HD, or 1080p Full HD');
            }, 800);
        }

        function openCallPrivacySettings() {
            showToast('Opening call privacy settings... 🔐');
            setTimeout(() => {
                showToast('Control who can call you: Everyone, Friends, or No One');
            }, 1000);
        }

        function resetCallSettings() {
            closeModal('callSettings');
            showToast('Resetting call settings... 🔄');
            setTimeout(() => {
                showToast('All settings reset to default! ✓');
            }, 1200);
        }

        // 10. NETWORK QUALITY FUNCTIONS
        function runNetworkTest() {
            closeModal('networkQuality');
            showToast('Running speed test... 📡');
            setTimeout(() => {
                showToast('Testing download speed...');
            }, 1000);
            setTimeout(() => {
                showToast('Testing upload speed...');
            }, 2000);
            setTimeout(() => {
                showToast('Speed test complete! 45 Mbps ↓ | 12 Mbps ↑');
            }, 3500);
        }

        // ========== ADDITIONAL VIDEO CALLS HELPER FUNCTIONS ==========

        // Edit post from menu
        function editPostFromMenu() {
            closeModal('postOptions');
            showToast('Opening post editor... ✏️');
            setTimeout(() => {
                showToast('Edit your post content');
            }, 800);
        }

        // Delete post from menu
        function deletePostFromMenu() {
            if (confirm('Delete this post permanently?')) {
                closeModal('postOptions');
                showToast('Post deleted successfully');
            }
        }

        // Settings helper functions
        function showChangePasswordModal() {
            openModal('changePassword');
        }

        function showChangeEmailModal() {
            showToast('Opening email change settings... 📧');
            setTimeout(() => {
                showToast('Verify new email with confirmation code');
            }, 800);
        }

        function showTwoFactorSetup() {
            openModal('enable2FA');
        }

        function showDeviceManagement() {
            openModal('manageDevices');
        }

        function showSessionManagement() {
            showToast('Opening session management... 🔐');
            setTimeout(() => {
                showToast('View and manage all active sessions');
            }, 800);
        }

        function showPrivacyEnforcement() {
            showToast('Opening privacy enforcement... 👁️');
            setTimeout(() => {
                showToast('Control read receipts, last seen, and online status');
            }, 1000);
        }

        function showBlockedUsers() {
            openModal('blockingSettings');
        }

        function showDataExport() {
            openModal('downloadYourData');
        }

        function showAccountDeactivation() {
            openModal('deactivateAccount');
        }

        function showAccountDeletion() {
            openModal('deleteAccount');
        }

        function showLanguageSettings() {
            openModal('selectLanguage');
        }

        function showTimezoneSettings() {
            openModal('selectTimezone');
        }

        function showNotificationSettings() {
            showToast('Opening notification settings... 🔔');
            setTimeout(() => {
                showToast('Manage all your notification preferences');
            }, 800);
        }

        function showLoginHistory() {
            showToast('Loading login history... 📋');
            setTimeout(() => {
                showToast('View recent login activity and locations');
            }, 1000);
        }

        function showSecurityAlerts() {
            showToast('Loading security alerts... ⚠️');
            setTimeout(() => {
                showToast('Review recent security notifications');
            }, 1000);
        }

        // Premium Profile Functions
        function sharePremiumProfile() {
            showToast('Premium profile link copied! 🔗');
            setTimeout(() => {
                showToast('Share your exclusive premium profile!');
            }, 1500);
        }

        function togglePremiumIncognito(element) {
            element.classList.toggle('active');
            if (element.classList.contains('active')) {
                showToast('Incognito mode enabled 🕵️');
            } else {
                showToast('Incognito mode disabled');
            }
        }

        // ========== AR/VR - 8 MISSING FEATURES DASHBOARDS ==========

        // 6. VR Headset Manager Dashboard
        function openVRHeadsetManager() {
            const modalHTML = `
                <div id="vrHeadsetManagerModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('vrHeadsetManager')">✕</div>
                        <div class="modal-title">🥽 VR Headset Manager</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🥽</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">VR Headset Connection</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Connect and manage your VR headset</div>
                        </div>

                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">Oculus Quest 2</div>
                                <div class="stat-label">Connected Device</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">85%</div>
                                <div class="stat-label">Battery Level</div>
                            </div>
                        </div>

                        <div style="margin: 24px 0;">
                            <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">🔗 Connection Status</div>
                            <div class="card" style="background: var(--success); color: white; padding: 16px; margin-bottom: 12px;">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <div>
                                        <div style="font-weight: 600; margin-bottom: 4px;">✓ Connected</div>
                                        <div style="font-size: 12px; opacity: 0.9;">VR Headset is ready</div>
                                    </div>
                                    <button class="btn" style="background: rgba(255,255,255,0.2);" onclick="disconnectVRHeadset()">Disconnect</button>
                                </div>
                            </div>
                        </div>

                        <div style="margin: 24px 0;">
                            <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">⚙️ Headset Settings</div>
                            <div class="settings-list">
                                <div class="settings-item">
                                    <div>
                                        <div class="settings-label">Refresh Rate</div>
                                        <div class="settings-sublabel">90Hz (Recommended)</div>
                                    </div>
                                    <select class="form-input" style="width: auto;" onchange="updateRefreshRate(this.value)">
                                        <option value="60">60Hz</option>
                                        <option value="72">72Hz</option>
                                        <option value="90" selected>90Hz</option>
                                        <option value="120">120Hz</option>
                                    </select>
                                </div>
                                <div class="settings-item">
                                    <div>
                                        <div class="settings-label">IPD (Interpupillary Distance)</div>
                                        <div class="settings-sublabel">63mm</div>
                                    </div>
                                    <input type="range" min="58" max="72" value="63" class="form-input" style="width: 150px;" oninput="updateIPD(this.value)">
                                </div>
                                <div class="settings-item">
                                    <div>
                                        <div class="settings-label">Tracking Mode</div>
                                        <div class="settings-sublabel">6DOF (6 Degrees of Freedom)</div>
                                    </div>
                                    <select class="form-input" style="width: auto;">
                                        <option value="3dof">3DOF</option>
                                        <option value="6dof" selected>6DOF</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style="margin: 24px 0;">
                            <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">📱 Available Devices</div>
                            <div class="list-item" style="cursor: pointer;" onclick="connectHeadset('Oculus Quest 2')">
                                <div style="font-size: 24px; margin-right: 12px;">🥽</div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600;">Oculus Quest 2</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">Connected • Battery: 85%</div>
                                </div>
                                <div style="color: var(--success);">●</div>
                            </div>
                            <div class="list-item" style="cursor: pointer; opacity: 0.5;" onclick="connectHeadset('HTC Vive Pro')">
                                <div style="font-size: 24px; margin-right: 12px;">🥽</div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600;">HTC Vive Pro</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">Not Connected</div>
                                </div>
                                <button class="btn btn-sm" onclick="event.stopPropagation(); connectHeadset('HTC Vive Pro')">Connect</button>
                            </div>
                            <div class="list-item" style="cursor: pointer; opacity: 0.5;" onclick="connectHeadset('PlayStation VR2')">
                                <div style="font-size: 24px; margin-right: 12px;">🥽</div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600;">PlayStation VR2</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">Not Connected</div>
                                </div>
                                <button class="btn btn-sm" onclick="event.stopPropagation(); connectHeadset('PlayStation VR2')">Connect</button>
                            </div>
                        </div>

                        <button class="btn btn-primary" style="width: 100%; margin-top: 16px;" onclick="calibrateVRHeadset()">🎯 Calibrate Headset</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // 7. Spatial Audio Config Dashboard
        function openSpatialAudioConfig() {
            const modalHTML = `
                <div id="spatialAudioConfigModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('spatialAudioConfig')">✕</div>
                        <div class="modal-title">🎧 Spatial Audio Configuration</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🎧</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">3D Spatial Audio</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Immersive audio positioning</div>
                        </div>

                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">HRTF</div>
                                <div class="stat-label">Audio Model</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">Enabled</div>
                                <div class="stat-label">3D Audio</div>
                            </div>
                        </div>

                        <div style="margin: 24px 0;">
                            <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">🎚️ Audio Settings</div>
                            <div class="settings-list">
                                <div class="settings-item">
                                    <div style="flex: 1;">
                                        <div class="settings-label">Enable Spatial Audio</div>
                                        <div class="settings-sublabel">3D positional audio</div>
                                    </div>
                                    <label class="switch">
                                        <input type="checkbox" checked onchange="toggleSpatialAudio(this.checked)">
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                <div class="settings-item">
                                    <div style="flex: 1;">
                                        <div class="settings-label">HRTF (Head-Related Transfer Function)</div>
                                        <div class="settings-sublabel">Realistic sound positioning</div>
                                    </div>
                                    <label class="switch">
                                        <input type="checkbox" checked onchange="toggleHRTF(this.checked)">
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                <div class="settings-item">
                                    <div style="flex: 1;">
                                        <div class="settings-label">Distance Attenuation</div>
                                        <div class="settings-sublabel">Sound fades with distance</div>
                                    </div>
                                    <label class="switch">
                                        <input type="checkbox" checked onchange="toggleDistanceAttenuation(this.checked)">
                                        <span class="slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div style="margin: 24px 0;">
                            <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">🔊 Volume Controls</div>
                            <div class="settings-item">
                                <div style="flex: 1;">
                                    <div class="settings-label">Master Volume</div>
                                    <div class="settings-sublabel">Overall audio level</div>
                                </div>
                                <input type="range" min="0" max="100" value="75" class="form-input" style="width: 150px;" oninput="updateMasterVolume(this.value)">
                                <span style="margin-left: 8px; min-width: 40px;">75%</span>
                            </div>
                            <div class="settings-item">
                                <div style="flex: 1;">
                                    <div class="settings-label">Ambient Volume</div>
                                    <div class="settings-sublabel">Background sounds</div>
                                </div>
                                <input type="range" min="0" max="100" value="50" class="form-input" style="width: 150px;" oninput="updateAmbientVolume(this.value)">
                                <span style="margin-left: 8px; min-width: 40px;">50%</span>
                            </div>
                            <div class="settings-item">
                                <div style="flex: 1;">
                                    <div class="settings-label">Voice Chat Volume</div>
                                    <div class="settings-sublabel">Other users' voices</div>
                                </div>
                                <input type="range" min="0" max="100" value="80" class="form-input" style="width: 150px;" oninput="updateVoiceVolume(this.value)">
                                <span style="margin-left: 8px; min-width: 40px;">80%</span>
                            </div>
                        </div>

                        <div style="margin: 24px 0;">
                            <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">🎵 Audio Presets</div>
                            <div class="card-grid">
                                <div class="card" style="text-align: center; padding: 16px; cursor: pointer;" onclick="applyAudioPreset('immersive')">
                                    <div style="font-size: 32px; margin-bottom: 8px;">🎭</div>
                                    <div style="font-weight: 600; margin-bottom: 4px;">Immersive</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">Full 3D audio</div>
                                </div>
                                <div class="card" style="text-align: center; padding: 16px; cursor: pointer;" onclick="applyAudioPreset('balanced')">
                                    <div style="font-size: 32px; margin-bottom: 8px;">⚖️</div>
                                    <div style="font-weight: 600; margin-bottom: 4px;">Balanced</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">Moderate 3D</div>
                                </div>
                                <div class="card" style="text-align: center; padding: 16px; cursor: pointer;" onclick="applyAudioPreset('performance')">
                                    <div style="font-size: 32px; margin-bottom: 8px;">⚡</div>
                                    <div style="font-weight: 600; margin-bottom: 4px;">Performance</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">Optimized</div>
                                </div>
                            </div>
                        </div>

                        <button class="btn btn-primary" style="width: 100%; margin-top: 16px;" onclick="testSpatialAudio()">🔊 Test Spatial Audio</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // 8. Hand Tracking Dashboard
        function openHandTrackingDashboard() {
            const modalHTML = `
                <div id="handTrackingDashboardModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('handTrackingDashboard')">✕</div>
                        <div class="modal-title">👋 Hand Tracking</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">👋</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Hand Tracking System</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Control VR with your hands</div>
                        </div>

                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">30 FPS</div>
                                <div class="stat-label">Tracking Rate</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">21 Points</div>
                                <div class="stat-label">Per Hand</div>
                            </div>
                        </div>

                        <div style="margin: 24px 0;">
                            <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">✋ Tracking Status</div>
                            <div class="card" style="background: var(--success); color: white; padding: 16px; margin-bottom: 12px;">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <div>
                                        <div style="font-weight: 600; margin-bottom: 4px;">✓ Both Hands Detected</div>
                                        <div style="font-size: 12px; opacity: 0.9;">Tracking active and stable</div>
                                    </div>
                                    <div style="font-size: 24px;">👐</div>
                                </div>
                            </div>
                        </div>

                        <div style="margin: 24px 0;">
                            <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">👆 Recognized Gestures</div>
                            <div class="card-grid">
                                <div class="card" style="text-align: center; padding: 16px;">
                                    <div style="font-size: 32px; margin-bottom: 8px;">👌</div>
                                    <div style="font-weight: 600; margin-bottom: 4px;">Pinch</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">Select items</div>
                                </div>
                                <div class="card" style="text-align: center; padding: 16px;">
                                    <div style="font-size: 32px; margin-bottom: 8px;">☝️</div>
                                    <div style="font-weight: 600; margin-bottom: 4px;">Point</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">Navigate menus</div>
                                </div>
                                <div class="card" style="text-align: center; padding: 16px;">
                                    <div style="font-size: 32px; margin-bottom: 8px;">✊</div>
                                    <div style="font-weight: 600; margin-bottom: 4px;">Grab</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">Hold objects</div>
                                </div>
                                <div class="card" style="text-align: center; padding: 16px;">
                                    <div style="font-size: 32px; margin-bottom: 8px;">✌️</div>
                                    <div style="font-weight: 600; margin-bottom: 4px;">Peace</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">Custom action</div>
                                </div>
                            </div>
                        </div>

                        <div style="margin: 24px 0;">
                            <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">⚙️ Tracking Settings</div>
                            <div class="settings-list">
                                <div class="settings-item">
                                    <div style="flex: 1;">
                                        <div class="settings-label">Enable Hand Tracking</div>
                                        <div class="settings-sublabel">Use hands instead of controllers</div>
                                    </div>
                                    <label class="switch">
                                        <input type="checkbox" checked onchange="toggleHandTracking(this.checked)">
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                <div class="settings-item">
                                    <div style="flex: 1;">
                                        <div class="settings-label">Gesture Recognition</div>
                                        <div class="settings-sublabel">Detect hand gestures</div>
                                    </div>
                                    <label class="switch">
                                        <input type="checkbox" checked onchange="toggleGestureRecognition(this.checked)">
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                <div class="settings-item">
                                    <div style="flex: 1;">
                                        <div class="settings-label">Tracking Sensitivity</div>
                                        <div class="settings-sublabel">High precision mode</div>
                                    </div>
                                    <select class="form-input" style="width: auto;">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high" selected>High</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style="margin: 24px 0;">
                            <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">🎯 Calibration</div>
                            <div class="card" style="padding: 16px;">
                                <div style="margin-bottom: 12px;">
                                    <div style="font-weight: 600; margin-bottom: 4px;">Hand Size Calibration</div>
                                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">Adjust for better accuracy</div>
                                    <input type="range" min="0" max="100" value="50" class="form-input" style="width: 100%;" oninput="calibrateHandSize(this.value)">
                                </div>
                                <button class="btn" style="width: 100%;" onclick="runHandCalibration()">🎯 Run Calibration</button>
                            </div>
                        </div>

                        <button class="btn btn-primary" style="width: 100%; margin-top: 16px;" onclick="startHandTrackingTest()">👋 Test Hand Tracking</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // 9. AR Effects Library Dashboard (additional AR/VR features)
        function filterEffects(category) {
            showToast(`Filtering effects: ${category}`);
        }

        function applyAREffect(effect) {
            showToast(`Applying ${effect} effect... ✨`);
        }

        function previewEffect(effect) {
            showToast(`Previewing ${effect}... 👁️`);
        }

        // 1. 360° Video Library Dashboard
        function open360VideoLibrary() {
            const modalHTML = `
                <div id="video360LibraryModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('video360Library')">✕</div>
                        <div class="modal-title">🎬 360° Video Library</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🎬</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Immersive 360° Videos</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Experience videos in every direction</div>
                        </div>

                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">24</div>
                                <div class="stat-label">Total Videos</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">12</div>
                                <div class="stat-label">Downloaded</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">4K</div>
                                <div class="stat-label">Max Quality</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">8</div>
                                <div class="stat-label">Categories</div>
                            </div>
                        </div>

                        <div class="section-header">
                            <div class="section-title">Categories</div>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
                            <div onclick="filter360Category('nature')" style="text-align: center; padding: 12px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer;">
                                <div style="font-size: 32px; margin-bottom: 4px;">🌿</div>
                                <div style="font-size: 11px; font-weight: 600;">Nature</div>
                            </div>
                            <div onclick="filter360Category('travel')" style="text-align: center; padding: 12px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer;">
                                <div style="font-size: 32px; margin-bottom: 4px;">✈️</div>
                                <div style="font-size: 11px; font-weight: 600;">Travel</div>
                            </div>
                            <div onclick="filter360Category('space')" style="text-align: center; padding: 12px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer;">
                                <div style="font-size: 32px; margin-bottom: 4px;">🚀</div>
                                <div style="font-size: 11px; font-weight: 600;">Space</div>
                            </div>
                            <div onclick="filter360Category('sports')" style="text-align: center; padding: 12px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer;">
                                <div style="font-size: 32px; margin-bottom: 4px;">⚽</div>
                                <div style="font-size: 11px; font-weight: 600;">Sports</div>
                            </div>
                        </div>

                        <div class="section-header">
                            <div class="section-title">Featured Videos</div>
                        </div>

                        <div class="card" onclick="play360Video('Nature Documentary')" style="cursor: pointer; margin-bottom: 12px;">
                            <div style="background: linear-gradient(135deg, var(--success), var(--accent)); height: 150px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 48px; margin-bottom: 12px; position: relative;">
                                🌿
                                <div style="position: absolute; bottom: 8px; right: 8px; padding: 4px 12px; background: rgba(0,0,0,0.8); border-radius: 8px; font-size: 11px; font-weight: 700;">4K • 8:45</div>
                            </div>
                            <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">Amazon Rainforest Journey</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Nature • 2.4M views</div>
                        </div>

                        <div class="card" onclick="play360Video('Space Station')" style="cursor: pointer; margin-bottom: 12px;">
                            <div style="background: linear-gradient(135deg, var(--primary), #1e1b4b); height: 150px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 48px; margin-bottom: 12px; position: relative;">
                                🚀
                                <div style="position: absolute; bottom: 8px; right: 8px; padding: 4px 12px; background: rgba(0,0,0,0.8); border-radius: 8px; font-size: 11px; font-weight: 700;">4K • 12:30</div>
                            </div>
                            <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">International Space Station Tour</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Space • 1.8M views</div>
                        </div>

                        <button class="btn" style="background: var(--glass);" onclick="browse All360Videos()">Browse All Videos</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // 2. AR Shopping Dashboard
        function openARShoppingDashboard() {
            const modalHTML = `
                <div id="arShoppingDashboardModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('arShoppingDashboard')">✕</div>
                        <div class="modal-title">🛍️ AR Virtual Shop</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🛍️</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Try Before You Buy</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Virtual try-on with AR technology</div>
                        </div>

                        <div class="section-header">
                            <div class="section-title">Shop Categories</div>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
                            <div onclick="openARCategory('glasses')" style="text-align: center; padding: 16px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer;">
                                <div style="font-size: 40px; margin-bottom: 8px;">👓</div>
                                <div style="font-size: 12px; font-weight: 600;">Glasses</div>
                            </div>
                            <div onclick="openARCategory('hats')" style="text-align: center; padding: 16px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer;">
                                <div style="font-size: 40px; margin-bottom: 8px;">🎩</div>
                                <div style="font-size: 12px; font-weight: 600;">Hats</div>
                            </div>
                            <div onclick="openARCategory('jewelry')" style="text-align: center; padding: 16px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer;">
                                <div style="font-size: 40px; margin-bottom: 8px;">💎</div>
                                <div style="font-size: 12px; font-weight: 600;">Jewelry</div>
                            </div>
                            <div onclick="openARCategory('makeup')" style="text-align: center; padding: 16px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer;">
                                <div style="font-size: 40px; margin-bottom: 8px;">💄</div>
                                <div style="font-size: 12px; font-weight: 600;">Makeup</div>
                            </div>
                        </div>

                        <div class="section-header">
                            <div class="section-title">Popular Items</div>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                            <div onclick="tryOnARItem('Sunglasses', '$89')" style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; padding: 16px; cursor: pointer;">
                                <div style="font-size: 48px; text-align: center; margin-bottom: 12px;">😎</div>
                                <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px; text-align: center;">Designer Sunglasses</div>
                                <div style="font-size: 16px; font-weight: 700; color: var(--primary); text-align: center;">$89</div>
                                <button class="btn" style="margin-top: 8px; font-size: 13px; padding: 8px;" onclick="event.stopPropagation(); startARTryOn('Sunglasses')">📸 Try On</button>
                            </div>
                            <div onclick="tryOnARItem('Crown', '$45')" style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; padding: 16px; cursor: pointer;">
                                <div style="font-size: 48px; text-align: center; margin-bottom: 12px;">👑</div>
                                <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px; text-align: center;">Royal Crown</div>
                                <div style="font-size: 16px; font-weight: 700; color: var(--primary); text-align: center;">$45</div>
                                <button class="btn" style="margin-top: 8px; font-size: 13px; padding: 8px;" onclick="event.stopPropagation(); startARTryOn('Crown')">📸 Try On</button>
                            </div>
                        </div>

                        <button class="btn" style="background: var(--glass); margin-top: 16px;" onclick="openARShoppingCamera()">📷 Start AR Try-On</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // 3. AR Games Dashboard
        function openARGamesDashboard() {
            const modalHTML = `
                <div id="arGamesDashboardModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('arGamesDashboard')">✕</div>
                        <div class="modal-title">🎮 AR Games</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🎮</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Augmented Reality Games</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Play games in your real environment</div>
                        </div>

                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">Level 15</div>
                                <div class="stat-label">Current Level</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">2,450</div>
                                <div class="stat-label">High Score</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">45</div>
                                <div class="stat-label">Games Played</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">12</div>
                                <div class="stat-label">Achievements</div>
                            </div>
                        </div>

                        <div class="section-header">
                            <div class="section-title">Available Games</div>
                        </div>

                        <div class="list-item" onclick="playARGame('Treasure Hunt')">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #ffd700, #ffed4e); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px;">🏴‍☠️</div>
                            <div class="list-item-content">
                                <div class="list-item-title">AR Treasure Hunt</div>
                                <div class="list-item-subtitle">Find hidden treasures in your space • Best: 2,450</div>
                            </div>
                            <button class="nav-btn" onclick="event.stopPropagation(); playARGame('Treasure Hunt')">▶️</button>
                        </div>

                        <div class="list-item" onclick="playARGame('Space Invaders')">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px;">👾</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Space Invaders AR</div>
                                <div class="list-item-subtitle">Defend Earth from aliens • Best: 1,890</div>
                            </div>
                            <button class="nav-btn" onclick="event.stopPropagation(); playARGame('Space Invaders')">▶️</button>
                        </div>

                        <div class="list-item" onclick="playARGame('Portal Pets')">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--accent), var(--success)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px;">🐾</div>
                            <div class="list-item-content">
                                <div class="list-item-title">AR Portal Pets</div>
                                <div class="list-item-subtitle">Care for virtual pets • Level 8</div>
                            </div>
                            <button class="nav-btn" onclick="event.stopPropagation(); playARGame('Portal Pets')">▶️</button>
                        </div>

                        <div class="section-header">
                            <div class="section-title">Your Achievements</div>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                            <div style="aspect-ratio: 1; background: linear-gradient(135deg, #ffd700, #ffed4e); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🏆</div>
                            <div style="aspect-ratio: 1; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">⭐</div>
                            <div style="aspect-ratio: 1; background: linear-gradient(135deg, var(--success), var(--accent)); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">💎</div>
                            <div style="aspect-ratio: 1; background: var(--glass); border: 2px dashed var(--glass-border); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">+9</div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // 4. VR Meditation Dashboard
        function openVRMeditationDashboard() {
            const modalHTML = `
                <div id="vrMeditationDashboardModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('vrMeditationDashboard')">✕</div>
                        <div class="modal-title">🧘 VR Meditation</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🧘</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Virtual Reality Meditation</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Find peace in immersive environments</div>
                        </div>

                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">24</div>
                                <div class="stat-label">Sessions</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">8h 45m</div>
                                <div class="stat-label">Total Time</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">21</div>
                                <div class="stat-label">Day Streak</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">⭐⭐⭐⭐⭐</div>
                                <div class="stat-label">Calm Level</div>
                            </div>
                        </div>

                        <div class="section-header">
                            <div class="section-title">Meditation Environments</div>
                        </div>

                        <div class="list-item" onclick="startVRMeditation('Forest', '10 min')">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--success), #059669); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px;">🌲</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Peaceful Forest</div>
                                <div class="list-item-subtitle">10, 15, 20 min • Breathing exercises</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>

                        <div class="list-item" onclick="startVRMeditation('Beach', '0 min')">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--accent), #3b82f6); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px;">🏖️</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Tropical Beach</div>
                                <div class="list-item-subtitle">10, 15, 20 min • Ocean sounds</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>

                        <div class="list-item" onclick="startVRMeditation('Mountain', '20 min')">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #78716c, #a8a29e); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px;">⛰️</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Mountain Peak</div>
                                <div class="list-item-subtitle">10, 15, 20, 30 min • Mindfulness</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>

                        <div class="list-item" onclick="startVRMeditation('Space', '0 min')">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #1e1b4b, #312e81); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px;">🌌</div>
                            <div class="list-item-content">
                                <div class="list-item-title">Cosmic Space</div>
                                <div class="list-item-subtitle">10, 15, 20 min • Deep relaxation</div>
                            </div>
                            <div class="list-item-arrow">→</div>
                        </div>

                        <div class="section-header">
                            <div class="section-title">Guided Sessions</div>
                        </div>

                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">Voice Guidance</div>
                                <div class="list-item-subtitle">Instructor-led meditation</div>
                            </div>
                            <div class="toggle-switch active" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>

                        <div class="toggle-container">
                            <div>
                                <div class="list-item-title">Ambient Sounds</div>
                                <div class="list-item-subtitle">Nature sounds for relaxation</div>
                            </div>
                            <div class="toggle-switch active" onclick="toggleSwitch(this)">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>

                        <button class="btn" onclick="viewMeditationProgress()">📊 View Progress</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // 5. Custom Filter Creator Dashboard
        function openCustomFilterCreator() {
            const modalHTML = `
                <div id="customFilterCreatorModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="closeModal('customFilterCreator')">✕</div>
                        <div class="modal-title">🎨 Custom Filter Creator</div>
                    </div>
                    <div class="modal-content">
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🎨</div>
                            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Design Your Own AR Filter</div>
                            <div style="font-size: 14px; color: var(--text-secondary);">Create unique face filters</div>
                        </div>

                        <div class="section-header">
                            <div class="section-title">Filter Elements</div>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                            <div onclick="addFilterElement('ears')" style="text-align: center; padding: 16px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer;">
                                <div style="font-size: 40px; margin-bottom: 8px;">👂</div>
                                <div style="font-size: 12px; font-weight: 600;">Ears</div>
                            </div>
                            <div onclick="addFilterElement('nose')" style="text-align: center; padding: 16px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer;">
                                <div style="font-size: 40px; margin-bottom: 8px;">👃</div>
                                <div style="font-size: 12px; font-weight: 600;">Nose</div>
                            </div>
                            <div onclick="addFilterElement('eyes')" style="text-align: center; padding: 16px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer;">
                                <div style="font-size: 40px; margin-bottom: 8px;">👁️</div>
                                <div style="font-size: 12px; font-weight: 600;">Eyes</div>
                            </div>
                            <div onclick="addFilterElement('sparkles')" style="text-align: center; padding: 16px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer;">
                                <div style="font-size: 40px; margin-bottom: 8px;">✨</div>
                                <div style="font-size: 12px; font-weight: 600;">Sparkles</div>
                            </div>
                            <div onclick="addFilterElement('frame')" style="text-align: center; padding: 16px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer;">
                                <div style="font-size: 40px; margin-bottom: 8px;">🖼️</div>
                                <div style="font-size: 12px; font-weight: 600;">Frame</div>
                            </div>
                            <div onclick="addFilterElement('text')" style="text-align: center; padding: 16px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer;">
                                <div style="font-size: 40px; margin-bottom: 8px;">📝</div>
                                <div style="font-size: 12px; font-weight: 600;">Text</div>
                            </div>
                        </div>

                        <input type="text" class="input-field" placeholder="Filter name..." id="customFilterNameInput" />

                        <div class="section-header">
                            <div class="section-title">Color Options</div>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 16px;">
                            <div onclick="selectFilterColor('#FF0000')" style="width: 100%; aspect-ratio: 1; background: #FF0000; border-radius: 8px; cursor: pointer;"></div>
                            <div onclick="selectFilterColor('#00FF00')" style="width: 100%; aspect-ratio: 1; background: #00FF00; border-radius: 8px; cursor: pointer;"></div>
                            <div onclick="selectFilterColor('#0000FF')" style="width: 100%; aspect-ratio: 1; background: #0000FF; border-radius: 8px; cursor: pointer;"></div>
                            <div onclick="selectFilterColor('#FFFF00')" style="width: 100%; aspect-ratio: 1; background: #FFFF00; border-radius: 8px; cursor: pointer;"></div>
                            <div onclick="selectFilterColor('#FF00FF')" style="width: 100%; aspect-ratio: 1; background: #FF00FF; border-radius: 8px; cursor: pointer;"></div>
                            <div onclick="selectFilterColor('#00FFFF')" style="width: 100%; aspect-ratio: 1; background: #00FFFF; border-radius: 8px; cursor: pointer;"></div>
                        </div>

                        <button class="btn" onclick="saveCustomARFilter()">💾 Save Filter</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // AR/VR Helper Functions
        function filter360Category(category) {
            showToast(`Filtering by: ${category}`);
        }

        function play360Video(title) {
            showToast(`▶️ Playing: ${title}`);
        }

        function browseAll360Videos() {
            showToast('Loading all 360° videos...');
        }

        function openARCategory(category) {
            showToast(`Opening ${category} category...`);
        }

        function tryOnARItem(item, price) {
            showToast(`Try on: ${item} (${price})`);
        }

        function startARTryOn(item) {
            showToast(`📸 Starting AR try-on for ${item}...`);
        }

        function openARShoppingCamera() {
            showToast('Opening AR shopping camera... 🛍️');
        }

        function playARGame(game) {
            showToast(`🎮 Starting ${game}...`);
        }

        function startVRMeditation(env, duration) {
            showToast(`🧘 Starting ${env} meditation (${duration})...`);
        }

        function viewMeditationProgress() {
            showToast('Loading meditation progress... 📊');
        }

        function addFilterElement(element) {
            showToast(`Added ${element} to filter ➕`);
        }

        function selectFilterColor(color) {
            showToast(`Color selected: ${color} 🎨`);
        }

        function saveCustomARFilter() {
            const name = document.getElementById('customFilterNameInput')?.value;
            if (!name || !name.trim()) {
                showToast('Please enter a filter name');
                return;
            }
            closeModal('customFilterCreator');
            showToast(`Custom filter "${name}" created! ✓`);
        }

        function connectHeadset(device) {
            showToast(`🥽 Connecting to ${device}...`);
            setTimeout(() => showToast(`✓ Connected to ${device}!`), 1500);
        }

        function disconnectVRHeadset() {
            showToast('Disconnecting VR headset...');
        }

        function updateRefreshRate(rate) {
            showToast(`Refresh rate set to ${rate}Hz`);
        }

        function updateIPD(value) {
            showToast(`IPD adjusted to ${value}mm`);
        }

        function calibrateVRHeadset() {
            showToast('Starting VR headset calibration... 🎯');
        }

        function toggleSpatialAudio(enabled) {
            showToast(enabled ? 'Spatial audio enabled 🎧' : 'Spatial audio disabled');
        }

        function toggleHRTF(enabled) {
            showToast(enabled ? 'HRTF enabled' : 'HRTF disabled');
        }

        function toggleDistanceAttenuation(enabled) {
            showToast(enabled ? 'Distance attenuation enabled' : 'Distance attenuation disabled');
        }

        function updateMasterVolume(value) {
            document.querySelector('#spatialAudioConfigModal span:nth-of-type(3)').textContent = `${value}%`;
        }

        function updateAmbientVolume(value) {
            document.querySelector('#spatialAudioConfigModal span:nth-of-type(4)').textContent = `${value}%`;
        }

        function updateVoiceVolume(value) {
            document.querySelector('#spatialAudioConfigModal span:nth-of-type(5)').textContent = `${value}%`;
        }

        function applyAudioPreset(preset) {
            showToast(`Applied ${preset} audio preset 🎵`);
        }

        function testSpatialAudio() {
            showToast('🔊 Testing spatial audio...');
            setTimeout(() => showToast('Audio test complete! ✓'), 2000);
        }

        function toggleHandTracking(enabled) {
            showToast(enabled ? 'Hand tracking enabled 👋' : 'Hand tracking disabled');
        }

        function toggleGestureRecognition(enabled) {
            showToast(enabled ? 'Gesture recognition enabled' : 'Gesture recognition disabled');
        }

        function calibrateHandSize(value) {
            showToast(`Hand size: ${value}%`);
        }

        function runHandCalibration() {
            showToast('Starting hand calibration... 🎯');
            setTimeout(() => showToast('Calibration complete! ✓'), 2000);
        }

        function startHandTrackingTest() {
            showToast('👋 Starting hand tracking test...');
            setTimeout(() => showToast('Show your hands to the camera'), 1000);
        }

        // ========== EVENTS SECTION HELPER FUNCTIONS ==========
        
        // Filter events by status
        function filterEventsByStatus(status) {
            showToast(`Filtering events: ${status}`);
            setTimeout(() => {
                if (status === 'attending') {
                    showToast('Showing 5 events you\'re attending');
                } else if (status === 'hosting') {
                    showToast('Showing 2 events you\'re hosting');
                } else if (status === 'interested') {
                    showToast('Showing 8 events you\'re interested in');
                }
            }, 800);
        }
        
        // View all upcoming events
        function viewAllUpcomingEvents() {
            showToast('Loading all upcoming events... 📅');
            setTimeout(() => {
                showToast('Browse all 15 upcoming events');
            }, 1000);
        }
        
        // View my hosted events
        function viewMyHostedEvents() {
            showToast('Loading your hosted events... 🎯');
            setTimeout(() => {
                showToast('Manage 2 events you\'re hosting');
            }, 1000);
        }
        
        // View past events
        function viewPastEvents() {
            showToast('Loading past events... 📚');
            setTimeout(() => {
                showToast('View 12 past events and memories');
            }, 1000);
        }
        
        // View past event details
        function viewPastEventDetails(eventName) {
            showToast(`Opening ${eventName} details... 📅`);
            setTimeout(() => {
                showToast('View photos, memories, and attendees');
            }, 1000);
        }
        
        // Enhanced Events System object wrapper
        if (typeof eventsSystem !== 'undefined') {
            // Add enhanced modal opener
            eventsSystem.openCreateEventModal = function() {
                openModal('createEvent');
                showToast('Creating new event... ➕');
            };
            
            // Enhanced event details opener
            const originalOpenEventDetails = eventsSystem.openEventDetails;
            eventsSystem.openEventDetails = function(eventId) {
                if (originalOpenEventDetails) {
                    originalOpenEventDetails.call(this, eventId);
                } else {
                    openModal('viewEvent');
                    showToast('Opening event details... 📅');
                }
            };
        }

        // Initialize on load
        document.addEventListener('DOMContentLoaded', () => {
            console.log('LynkApp Complete - All systems loaded');
            console.log('✓ Events Section Enhanced - RSVP, Attendees, Event Creation Ready');
            
            // Initialize marketplace
            if (typeof initializeMarketplace === 'function') {
                initializeMarketplace();
            }
            
            // Verify events system is loaded
            setTimeout(() => {
                if (typeof eventsSystem !== 'undefined') {
                    console.log('✓ Events System fully integrated and operational');
                    console.log('  - Event Creation: READY');
                    console.log('  - RSVP Functionality: READY');
                    console.log('  - Attendees Management: READY');
                    console.log('  - All 17 Features: COMPLETE');
                }
                
                // Expose AR/VR System globally
                if (typeof arvrSystem !== 'undefined') {
                    window.arVR = arvrSystem;
                    console.log('✓ AR/VR System loaded and ready');
                    console.log('  - AR Filters: READY ✓');
                    console.log('  - 3D Rendering: READY ✓');
                    console.log('  - Face Tracking: READY ✓');
                    console.log('  - Virtual Rooms: READY ✓');
                    console.log('  - All AR/VR Features: COMPLETE');
                } else {
                    // Fallback if AR/VR system not loaded
                    window.arVR = {
                        openARCamera: function() { showToast('Opening AR Camera... 📸'); },
                        applyFaceFilter: function(filter) { showToast(`Applying ${filter} filter... ✨`); },
                        enterVirtualRoom: function(room) { showToast(`Entering ${room}... 🥽`); }
                    };
                    console.log('✓ AR/VR Fallback system active');
                }
            }, 500);
        });

        // ========== SPLASH SCREEN TRANSITION ==========
        
        // Auto-transition from splash screen to login screen
        window.addEventListener('DOMContentLoaded', () => {
            const splashScreen = document.getElementById('splashScreen');
            const loginScreen = document.getElementById('loginScreen');
            
            // Show splash screen for 2.5 seconds, then transition to login
            setTimeout(() => {
                splashScreen.classList.add('fade-out');
                
                // After fade out animation completes, hide splash and show login
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                    loginScreen.classList.remove('hidden');
                }, 500); // Match CSS fade-out animation duration
            }, 2500); // 2.5 seconds splash screen display
        });

        // ========== LOGIN SCREEN FUNCTIONS ==========
        
        // Switch Login Tab
        function switchLoginTab(tab) {
            const loginTab = document.querySelectorAll('.login-tab')[0];
            const registerTab = document.querySelectorAll('.login-tab')[1];
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');
            const footerText = document.getElementById('footerText');
            const footerLink = document.getElementById('footerLink');

            if (tab === 'login') {
                loginTab.classList.add('active');
                registerTab.classList.remove('active');
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
                footerText.textContent = "Don't have an account? ";
                footerLink.textContent = "Sign up";
                footerLink.onclick = () => switchLoginTab('register');
            } else {
                loginTab.classList.remove('active');
                registerTab.classList.add('active');
                loginForm.classList.remove('active');
                registerForm.classList.add('active');
                footerText.textContent = "Already have an account? ";
                footerLink.textContent = "Sign in";
                footerLink.onclick = () => switchLoginTab('login');
            }
        }

        // Toggle Password Visibility
        function togglePasswordVisibility(inputId) {
            const input = document.getElementById(inputId);
            if (input) {
                input.type = input.type === 'password' ? 'text' : 'password';
            }
        }

        // Toggle Checkbox for Login
        function toggleCheckboxLogin(checkboxId) {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.classList.toggle('checked');
            }
        }

        // Handle Login
        function handleLogin() {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            if (!email || !password) {
                showToast('Please fill in all fields');
                return;
            }

            // Simulate login
            console.log('Logging in:', email);
            showToast('Logging in...');
            setTimeout(function() { showAppAfterLogin(); }, 1200);
            
            setTimeout(() => {
                showAppAfterLogin();
            }, 1000);
        }

        // Handle Register
        function handleRegister() {
            const firstName = document.getElementById('registerFirstName').value;
            const lastName = document.getElementById('registerLastName').value;
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;

            if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
                showToast('Please fill in all fields');
                return;
            }

            if (password !== confirmPassword) {
                showToast('Passwords do not match');
                return;
            }

            console.log('Registering new user:', email);
            showToast('Creating account...');
            
            setTimeout(() => {
                showAppAfterLogin();
            }, 1000);
        }

        // Social Login
        function socialLogin(provider) {
            console.log('Social login with:', provider);
            showToast(`Logging in with ${provider}...`);
            
            setTimeout(() => {
                showAppAfterLogin();
            }, 1500);
        }

        // Show Main App After Login
        function showAppAfterLogin() {
            document.getElementById('loginScreen').classList.add('hidden');
            document.querySelector('.app-container').classList.add('active');
            showToast('Welcome to LynkApp! 🎉 🎉');
        }

        // Logout Function
        function logoutUser() {
            if (confirm('Are you sure you want to logout?')) {
                document.getElementById('loginScreen').classList.remove('hidden');
                document.querySelector('.app-container').classList.remove('active');
                
                // Reset forms
                document.getElementById('loginEmail').value = '';
                document.getElementById('loginPassword').value = '';
                
                showToast('Logged out successfully');
            }
        }