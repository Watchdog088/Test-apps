// Gaming Additional Missing UI Components for ConnectHub
// Implements 2 additional missing gaming interfaces: Game Lobby/Room Management and Leaderboard System

class GamingAdditionalMissingUIComponents {
    constructor() {
        this.currentUser = null;
        this.gameLobbies = [];
        this.leaderboards = {};
        this.currentGameRoom = null;
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {};
        this.roomChatMessages = [];
        this.playerReadyStatus = {};
        this.currentTimeframe = 'global';
        this.currentLeaderboardFilters = {
            gameType: 'all',
            region: 'all'
        };
        this.currentPage = 1;
        this.itemsPerPage = 20;
        
        this.init();
    }

    async init() {
        await this.loadTranslations();
        this.initializeEventListeners();
    }

    async loadTranslations() {
        this.translations = {
            en: {
                gameLobby: 'Game Lobby',
                createRoom: 'Create Room',
                joinRoom: 'Join Room',
                roomSettings: 'Room Settings',
                players: 'Players',
                maxPlayers: 'Max Players',
                gameMode: 'Game Mode',
                difficulty: 'Difficulty',
                privacy: 'Privacy',
                password: 'Password',
                invite: 'Invite',
                startGame: 'Start Game',
                leaveRoom: 'Leave Room',
                roomCode: 'Room Code',
                waiting: 'Waiting for players...',
                ready: 'Ready',
                notReady: 'Not Ready',
                spectate: 'Spectate',
                kick: 'Kick',
                promote: 'Promote to Host',
                leaderboard: 'Leaderboard',
                globalRanking: 'Global Ranking',
                weeklyRanking: 'Weekly Ranking',
                monthlyRanking: 'Monthly Ranking',
                allTime: 'All Time',
                rank: 'Rank',
                player: 'Player',
                score: 'Score',
                wins: 'Wins',
                gamesPlayed: 'Games Played',
                winRate: 'Win Rate',
                points: 'Points',
                level: 'Level',
                experience: 'Experience',
                achievements: 'Achievements',
                viewProfile: 'View Profile',
                challenge: 'Challenge',
                myRank: 'My Rank',
                topPlayers: 'Top Players',
                filterBy: 'Filter by',
                gameType: 'Game Type',
                region: 'Region',
                timeframe: 'Timeframe',
                refreshRankings: 'Refresh Rankings'
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

    // =================== MISSING UI 1: GAME LOBBY/ROOM MANAGEMENT INTERFACE ===================
    async createGameLobbyInterface(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="game-lobby-interface">
                <div class="lobby-header">
                    <h2 class="lobby-title">
                        <i class="fas fa-gamepad"></i>
                        ${this.t('gameLobby')}
                    </h2>
                    
                    <div class="lobby-actions">
                        <button class="create-room-btn" onclick="gamingAdditionalUI.showCreateRoomModal()">
                            <i class="fas fa-plus"></i>
                            ${this.t('createRoom')}
                        </button>
                        <button class="join-room-btn" onclick="gamingAdditionalUI.showJoinRoomModal()">
                            <i class="fas fa-sign-in-alt"></i>
                            ${this.t('joinRoom')}
                        </button>
                        <button class="quick-match-btn" onclick="gamingAdditionalUI.findQuickMatch()">
                            <i class="fas fa-bolt"></i>
                            Quick Match
                        </button>
                    </div>
                </div>

                <div class="lobby-content">
                    <div class="lobby-sidebar">
                        <div class="active-rooms-section">
                            <h3>Active Rooms</h3>
                            <div class="room-filters">
                                <select id="lobby-game-filter" class="control-select" onchange="gamingAdditionalUI.filterRooms()">
                                    <option value="all">All Games</option>
                                    <option value="tic-tac-toe">Tic Tac Toe</option>
                                    <option value="memory">Memory Game</option>
                                    <option value="quiz">Quiz Challenge</option>
                                    <option value="word-game">Word Games</option>
                                </select>
                                <select id="lobby-privacy-filter" class="control-select" onchange="gamingAdditionalUI.filterRooms()">
                                    <option value="all">All Rooms</option>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                            <div class="rooms-list" id="available-rooms"></div>
                        </div>
                        
                        <div class="my-rooms-section">
                            <h3>My Recent Rooms</h3>
                            <div class="recent-rooms" id="recent-rooms"></div>
                        </div>
                    </div>

                    <div class="lobby-main">
                        <div id="no-room-selected" class="no-room-state">
                            <div class="no-room-icon">🎮</div>
                            <h3>No Room Selected</h3>
                            <p>Create a new room or join an existing one to start playing!</p>
                        </div>

                        <div id="room-interface" class="room-interface" style="display: none;">
                            <div class="room-header">
                                <div class="room-info">
                                    <h3 class="room-name" id="current-room-name">Room Name</h3>
                                    <div class="room-details">
                                        <span class="room-code" id="current-room-code">Room Code: #ABC123</span>
                                        <span class="room-game" id="current-room-game">Game: Tic Tac Toe</span>
                                        <span class="room-privacy" id="current-room-privacy">Public</span>
                                    </div>
                                </div>
                                
                                <div class="room-actions">
                                    <button class="invite-btn" onclick="gamingAdditionalUI.showInviteModal()">
                                        <i class="fas fa-user-plus"></i>
                                        ${this.t('invite')}
                                    </button>
                                    <button class="settings-btn" onclick="gamingAdditionalUI.showRoomSettings()">
                                        <i class="fas fa-cog"></i>
                                        Settings
                                    </button>
                                    <button class="leave-room-btn danger-btn" onclick="gamingAdditionalUI.leaveRoom()">
                                        <i class="fas fa-sign-out-alt"></i>
                                        ${this.t('leaveRoom')}
                                    </button>
                                </div>
                            </div>

                            <div class="room-content">
                                <div class="players-section">
                                    <h4>${this.t('players')} <span id="player-count">0/0</span></h4>
                                    <div class="players-grid" id="room-players"></div>
                                </div>

                                <div class="game-preview-section">
                                    <h4>Game Preview</h4>
                                    <div class="game-preview" id="game-preview">
                                        <div class="preview-placeholder">
                                            <i class="fas fa-gamepad"></i>
                                            <p>Game will appear here when started</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="room-chat-section">
                                    <h4>Room Chat</h4>
                                    <div class="room-chat" id="room-chat"></div>
                                    <div class="chat-input">
                                        <input type="text" id="room-chat-input" placeholder="Type a message..." onkeypress="gamingAdditionalUI.handleChatKeyPress(event)">
                                        <button onclick="gamingAdditionalUI.sendRoomMessage()">
                                            <i class="fas fa-paper-plane"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="room-footer">
                                <div class="ready-status">
                                    <button class="ready-toggle-btn" id="ready-toggle" onclick="gamingAdditionalUI.toggleReady()">
                                        <i class="fas fa-check"></i>
                                        ${this.t('ready')}
                                    </button>
                                </div>
                                
                                <div class="game-controls">
                                    <button class="start-game-btn" id="start-game-btn" onclick="gamingAdditionalUI.startGame()">
                                        <i class="fas fa-play"></i>
                                        ${this.t('startGame')}
                                    </button>
                                    <button class="spectate-btn" onclick="gamingAdditionalUI.spectateGame()">
                                        <i class="fas fa-eye"></i>
                                        ${this.t('spectate')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Create Room Modal -->
                <div id="create-room-modal" class="modal-overlay" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${this.t('createRoom')}</h3>
                            <button class="close-modal" onclick="gamingAdditionalUI.closeModal('create-room-modal')">×</button>
                        </div>
                        
                        <div class="modal-body">
                            <form id="create-room-form">
                                <div class="form-group">
                                    <label for="room-name-input">Room Name</label>
                                    <input type="text" id="room-name-input" placeholder="Enter room name..." maxlength="30" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="room-game-select">${this.t('gameType')}</label>
                                    <select id="room-game-select" required>
                                        <option value="">Select a game...</option>
                                        <option value="tic-tac-toe">Tic Tac Toe</option>
                                        <option value="memory">Memory Game</option>
                                        <option value="quiz">Quiz Challenge</option>
                                        <option value="word-game">Word Games</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="max-players-select">${this.t('maxPlayers')}</label>
                                    <select id="max-players-select">
                                        <option value="2">2 Players</option>
                                        <option value="4">4 Players</option>
                                        <option value="6">6 Players</option>
                                        <option value="8">8 Players</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="room-privacy-select">${this.t('privacy')}</label>
                                    <select id="room-privacy-select" onchange="gamingAdditionalUI.togglePasswordField()">
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                        <option value="friends-only">Friends Only</option>
                                    </select>
                                </div>
                                
                                <div class="form-group" id="password-group" style="display: none;">
                                    <label for="room-password-input">${this.t('password')}</label>
                                    <input type="password" id="room-password-input" placeholder="Room password...">
                                </div>
                                
                                <div class="form-group">
                                    <label for="difficulty-select">${this.t('difficulty')}</label>
                                    <select id="difficulty-select">
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        
                        <div class="modal-footer">
                            <button class="cancel-btn" onclick="gamingAdditionalUI.closeModal('create-room-modal')">Cancel</button>
                            <button class="create-btn primary-btn" onclick="gamingAdditionalUI.createRoom()">
                                ${this.t('createRoom')}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Join Room Modal -->
                <div id="join-room-modal" class="modal-overlay" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${this.t('joinRoom')}</h3>
                            <button class="close-modal" onclick="gamingAdditionalUI.closeModal('join-room-modal')">×</button>
                        </div>
                        
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="join-room-code">${this.t('roomCode')}</label>
                                <input type="text" id="join-room-code" placeholder="Enter room code..." maxlength="10" oninput="gamingAdditionalUI.checkRoomRequirements()">
                            </div>
                            
                            <div class="form-group" id="join-password-group" style="display: none;">
                                <label for="join-room-password">${this.t('password')}</label>
                                <input type="password" id="join-room-password" placeholder="Room password...">
                            </div>
                        </div>
                        
                        <div class="modal-footer">
                            <button class="cancel-btn" onclick="gamingAdditionalUI.closeModal('join-room-modal')">Cancel</button>
                            <button class="join-btn primary-btn" onclick="gamingAdditionalUI.joinRoomByCode()">
                                ${this.t('joinRoom')}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Invite Modal -->
                <div id="invite-modal" class="modal-overlay" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${this.t('invite')} Friends</h3>
                            <button class="close-modal" onclick="gamingAdditionalUI.closeModal('invite-modal')">×</button>
                        </div>
                        
                        <div class="modal-body">
                            <div class="invite-methods">
                                <div class="invite-link-section">
                                    <label>Share Room Link</label>
                                    <div class="link-share">
                                        <input type="text" id="room-link" readonly>
                                        <button class="copy-btn" onclick="gamingAdditionalUI.copyRoomLink()">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="invite-friends-section">
                                    <label>Invite Friends</label>
                                    <div class="friends-list" id="invite-friends-list">
                                        <!-- Friends list will be populated here -->
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="modal-footer">
                            <button class="cancel-btn" onclick="gamingAdditionalUI.closeModal('invite-modal')">Done</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await this.loadAvailableRooms();
        await this.loadRecentRooms();
    }

    // =================== MISSING UI 2: LEADERBOARD SYSTEM ===================
    async createLeaderboardInterface(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="leaderboard-interface">
                <div class="leaderboard-header">
                    <h2 class="leaderboard-title">
                        <i class="fas fa-trophy"></i>
                        ${this.t('leaderboard')}
                    </h2>
                    
                    <div class="leaderboard-controls">
                        <div class="timeframe-tabs">
                            <button class="tab-btn active" data-timeframe="global" onclick="gamingAdditionalUI.switchTimeframe('global')">
                                ${this.t('globalRanking')}
                            </button>
                            <button class="tab-btn" data-timeframe="weekly" onclick="gamingAdditionalUI.switchTimeframe('weekly')">
                                ${this.t('weeklyRanking')}
                            </button>
                            <button class="tab-btn" data-timeframe="monthly" onclick="gamingAdditionalUI.switchTimeframe('monthly')">
                                ${this.t('monthlyRanking')}
                            </button>
                        </div>
                        
                        <button class="refresh-btn" onclick="gamingAdditionalUI.refreshLeaderboard()">
                            <i class="fas fa-sync-alt"></i>
                            ${this.t('refreshRankings')}
                        </button>
                    </div>
                </div>

                <div class="leaderboard-filters">
                    <div class="filter-group">
                        <label for="leaderboard-game-filter">${this.t('gameType')}</label>
                        <select id="leaderboard-game-filter" onchange="gamingAdditionalUI.filterLeaderboard()">
                            <option value="all">All Games</option>
                            <option value="tic-tac-toe">Tic Tac Toe</option>
                            <option value="memory">Memory Game</option>
                            <option value="quiz">Quiz Challenge</option>
                            <option value="word-game">Word Games</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label for="leaderboard-region-filter">${this.t('region')}</label>
                        <select id="leaderboard-region-filter" onchange="gamingAdditionalUI.filterLeaderboard()">
                            <option value="all">All Regions</option>
                            <option value="north-america">North America</option>
                            <option value="europe">Europe</option>
                            <option value="asia">Asia</option>
                            <option value="oceania">Oceania</option>
                        </select>
                    </div>
                </div>

                <div class="leaderboard-content">
                    <!-- Top 3 Podium -->
                    <div class="podium-section">
                        <h3>${this.t('topPlayers')}</h3>
                        <div class="podium" id="leaderboard-podium">
                            <div class="podium-position second-place">
                                <div class="podium-rank">2</div>
                                <div class="podium-player" id="second-place-player">
                                    <div class="player-avatar">
                                        <img src="/src/assets/default-avatar.png" alt="Player 2">
                                    </div>
                                    <div class="player-name">Loading...</div>
                                    <div class="player-score">0 pts</div>
                                </div>
                            </div>
                            
                            <div class="podium-position first-place">
                                <div class="podium-rank">1</div>
                                <div class="crown-icon">👑</div>
                                <div class="podium-player" id="first-place-player">
                                    <div class="player-avatar">
                                        <img src="/src/assets/default-avatar.png" alt="Player 1">
                                    </div>
                                    <div class="player-name">Loading...</div>
                                    <div class="player-score">0 pts</div>
                                </div>
                            </div>
                            
                            <div class="podium-position third-place">
                                <div class="podium-rank">3</div>
                                <div class="podium-player" id="third-place-player">
                                    <div class="player-avatar">
                                        <img src="/src/assets/default-avatar.png" alt="Player 3">
                                    </div>
                                    <div class="player-name">Loading...</div>
                                    <div class="player-score">0 pts</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Full Leaderboard Table -->
                    <div class="leaderboard-table-section">
                        <div class="my-rank-highlight" id="my-rank-highlight" style="display: none;">
                            <h4>${this.t('myRank')}</h4>
                            <div class="my-rank-card" id="my-rank-card">
                                <!-- User's rank will be populated here -->
                            </div>
                        </div>

                        <div class="leaderboard-table-container">
                            <table class="leaderboard-table" id="leaderboard-table">
                                <thead>
                                    <tr>
                                        <th class="rank-col">${this.t('rank')}</th>
                                        <th class="player-col">${this.t('player')}</th>
                                        <th class="score-col">${this.t('score')}</th>
                                        <th class="wins-col">${this.t('wins')}</th>
                                        <th class="games-col">${this.t('gamesPlayed')}</th>
                                        <th class="winrate-col">${this.t('winRate')}</th>
                                        <th class="actions-col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="leaderboard-tbody">
                                    <tr class="loading-row">
                                        <td colspan="7">
                                            <div class="loading-spinner">
                                                <i class="fas fa-spinner fa-spin"></i>
                                                Loading leaderboard...
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="leaderboard-pagination" id="leaderboard-pagination">
                            <button class="prev-btn" onclick="gamingAdditionalUI.previousPage()" disabled>
                                <i class="fas fa-chevron-left"></i>
                                Previous
                            </button>
                            
                            <div class="page-info">
                                Page <span id="current-page">1</span> of <span id="total-pages">1</span>
                            </div>
                            
                            <button class="next-btn" onclick="gamingAdditionalUI.nextPage()">
                                Next
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await this.loadLeaderboardData();
    }

    // =================== GAME LOBBY UTILITY FUNCTIONS ===================

    async loadAvailableRooms() {
        try {
            const gameFilter = document.getElementById('lobby-game-filter')?.value || 'all';
            const privacyFilter = document.getElementById('lobby-privacy-filter')?.value || 'all';
            
            // Mock data for available rooms
            const mockRooms = [
                {
                    id: 'room_001',
                    name: 'Quick Tic Tac Toe',
                    game: 'tic-tac-toe',
                    currentPlayers: 1,
                    maxPlayers: 2,
                    privacy: 'public',
                    host: 'PlayerOne',
                    difficulty: 'medium'
                },
                {
                    id: 'room_002',
                    name: 'Memory Champions',
                    game: 'memory',
                    currentPlayers: 3,
                    maxPlayers: 4,
                    privacy: 'public',
                    host: 'MemoryMaster',
                    difficulty: 'hard'
                },
                {
                    id: 'room_003',
                    name: 'Quiz Night',
                    game: 'quiz',
                    currentPlayers: 2,
                    maxPlayers: 6,
                    privacy: 'private',
                    host: 'QuizKing',
                    difficulty: 'easy'
                }
            ];

            const container = document.getElementById('available-rooms');
            if (!container) return;

            const filteredRooms = mockRooms.filter(room => {
                if (gameFilter !== 'all' && room.game !== gameFilter) return false;
                if (privacyFilter !== 'all' && room.privacy !== privacyFilter) return false;
                return true;
            });

            container.innerHTML = filteredRooms.map(room => `
                <div class="room-card" onclick="gamingAdditionalUI.joinRoom('${room.id}')">
                    <div class="room-info">
                        <h4 class="room-name">${room.name}</h4>
                        <div class="room-meta">
                            <span class="game-type">${room.game}</span>
                            <span class="player-count">${room.currentPlayers}/${room.maxPlayers}</span>
                            <span class="privacy ${room.privacy}">${room.privacy}</span>
                        </div>
                        <div class="room-host">Host: ${room.host}</div>
                    </div>
                    <div class="room-actions">
                        <button class="join-room-btn" onclick="event.stopPropagation(); gamingAdditionalUI.joinRoom('${room.id}')">
                            Join
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading available rooms:', error);
        }
    }

    async loadRecentRooms() {
        try {
            // Mock data for recent rooms
            const recentRooms = [
                { id: 'recent_001', name: 'My Last Game', game: 'tic-tac-toe', lastPlayed: '2 hours ago' },
                { id: 'recent_002', name: 'Memory Fun', game: 'memory', lastPlayed: '1 day ago' }
            ];

            const container = document.getElementById('recent-rooms');
            if (!container) return;

            container.innerHTML = recentRooms.map(room => `
                <div class="recent-room-card">
                    <div class="room-name">${room.name}</div>
                    <div class="room-details">
                        <span class="game-type">${room.game}</span>
                        <span class="last-played">${room.lastPlayed}</span>
                    </div>
                    <button onclick="gamingAdditionalUI.rejoinRoom('${room.id}')">Rejoin</button>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading recent rooms:', error);
        }
    }

    showCreateRoomModal() {
        document.getElementById('create-room-modal').style.display = 'flex';
    }

    showJoinRoomModal() {
        document.getElementById('join-room-modal').style.display = 'flex';
    }

    showInviteModal() {
        if (this.currentGameRoom) {
            const link = `https://connecthub.com/room/${this.currentGameRoom.code}`;
            document.getElementById('room-link').value = link;
            document.getElementById('invite-modal').style.display = 'flex';
            this.loadFriendsForInvite();
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    togglePasswordField() {
        const privacySelect = document.getElementById('room-privacy-select');
        const passwordGroup = document.getElementById('password-group');
        
        if (privacySelect.value === 'private') {
            passwordGroup.style.display = 'block';
        } else {
            passwordGroup.style.display = 'none';
        }
    }

    async createRoom() {
        try {
            const formData = {
                name: document.getElementById('room-name-input').value,
                game: document.getElementById('room-game-select').value,
                maxPlayers: parseInt(document.getElementById('max-players-select').value),
                privacy: document.getElementById('room-privacy-select').value,
                password: document.getElementById('room-password-input').value,
                difficulty: document.getElementById('difficulty-select').value
            };

            if (!formData.name || !formData.game) {
                alert('Please fill in all required fields');
                return;
            }

            // Simulate room creation
            const newRoom = {
                id: 'room_' + Date.now(),
                code: this.generateRoomCode(),
                ...formData,
                host: 'CurrentUser',
                currentPlayers: 1,
                players: []
            };

            this.currentGameRoom = newRoom;
            this.closeModal('create-room-modal');
            this.showRoomInterface(newRoom);
            
            console.log('Room created:', newRoom);
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Failed to create room. Please try again.');
        }
    }

    async joinRoom(roomId) {
        try {
            // Simulate joining room
            const room = {
                id: roomId,
                name: 'Joined Room',
                game: 'tic-tac-toe',
                code: 'ABC123',
                currentPlayers: 2,
                maxPlayers: 4,
                privacy: 'public'
            };

            this.currentGameRoom = room;
            this.showRoomInterface(room);
        } catch (error) {
            console.error('Error joining room:', error);
            alert('Failed to join room. Please try again.');
        }
    }

    async joinRoomByCode() {
        try {
            const roomCode = document.getElementById('join-room-code').value;
            const password = document.getElementById('join-room-password').value;

            if (!roomCode) {
                alert('Please enter a room code');
                return;
            }

            // Simulate room join by code
            const room = {
                id: 'room_code',
                name: 'Room ' + roomCode,
                code: roomCode,
                game: 'tic-tac-toe',
                currentPlayers: 2,
                maxPlayers: 4,
                privacy: 'private'
            };

            this.currentGameRoom = room;
            this.closeModal('join-room-modal');
            this.showRoomInterface(room);
        } catch (error) {
            console.error('Error joining room by code:', error);
            alert('Room not found or invalid password');
        }
    }

    showRoomInterface(room) {
        document.getElementById('no-room-selected').style.display = 'none';
        document.getElementById('room-interface').style.display = 'block';
        
        document.getElementById('current-room-name').textContent = room.name;
        document.getElementById('current-room-code').textContent = `Room Code: #${room.code}`;
        document.getElementById('current-room-game').textContent = `Game: ${room.game}`;
        document.getElementById('current-room-privacy').textContent = room.privacy;
        
        this.updatePlayersList();
        this.initializeRoomChat();
    }

    updatePlayersList() {
        const container = document.getElementById('room-players');
        const playerCount = document.getElementById('player-count');
        
        // Mock players data
        const players = [
            { id: 'p1', name: 'CurrentUser', ready: false, isHost: true },
            { id: 'p2', name: 'Player2', ready: true, isHost: false }
        ];

        playerCount.textContent = `${players.length}/${this.currentGameRoom?.maxPlayers || 4}`;
        
        container.innerHTML = players.map(player => `
            <div class="player-card ${player.ready ? 'ready' : ''}">
                <div class="player-avatar">
                    <img src="/src/assets/default-avatar.png" alt="${player.name}">
                </div>
                <div class="player-info">
                    <div class="player-name">
                        ${player.name}
                        ${player.isHost ? '<span class="host-badge">Host</span>' : ''}
                    </div>
                    <div class="player-status">
                        ${player.ready ? this.t('ready') : this.t('notReady')}
                    </div>
                </div>
                ${!player.isHost ? `
                    <div class="player-actions">
                        <button onclick="gamingAdditionalUI.kickPlayer('${player.id}')" class="kick-btn">
                            ${this.t('kick')}
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    initializeRoomChat() {
        this.roomChatMessages = [
            { user: 'System', message: 'Welcome to the room!', timestamp: Date.now() - 30000 },
            { user: 'Player2', message: 'Hey everyone!', timestamp: Date.now() - 15000 }
        ];
        this.updateRoomChat();
    }

    updateRoomChat() {
        const container = document.getElementById('room-chat');
        if (!container) return;

        container.innerHTML = this.roomChatMessages.map(msg => `
            <div class="chat-message ${msg.user === 'CurrentUser' ? 'own-message' : ''}">
                <div class="message-header">
                    <span class="username">${msg.user}</span>
                    <span class="timestamp">${new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="message-text">${msg.message}</div>
            </div>
        `).join('');

        container.scrollTop = container.scrollHeight;
    }

    handleChatKeyPress(event) {
        if (event.key === 'Enter') {
            this.sendRoomMessage();
        }
    }

    sendRoomMessage() {
        const input = document.getElementById('room-chat-input');
        const message = input.value.trim();
        
        if (message) {
            this.roomChatMessages.push({
                user: 'CurrentUser',
                message: message,
                timestamp: Date.now()
            });
            
            input.value = '';
            this.updateRoomChat();
        }
    }

    toggleReady() {
        const button = document.getElementById('ready-toggle');
        const isReady = button.classList.contains('ready');
        
        if (isReady) {
            button.classList.remove('ready');
            button.innerHTML = `<i class="fas fa-check"></i> ${this.t('ready')}`;
        } else {
            button.classList.add('ready');
            button.innerHTML = `<i class="fas fa-times"></i> ${this.t('notReady')}`;
        }
        
        this.updatePlayersList();
    }

    startGame() {
        if (this.currentGameRoom) {
            alert('Starting game...');
            // Implement game start logic
        }
    }

    spectateGame() {
        alert('Spectating game...');
        // Implement spectate logic
    }

    leaveRoom() {
        if (confirm('Are you sure you want to leave the room?')) {
            this.currentGameRoom = null;
            document.getElementById('room-interface').style.display = 'none';
            document.getElementById('no-room-selected').style.display = 'block';
            this.loadAvailableRooms();
        }
    }

    filterRooms() {
        this.loadAvailableRooms();
    }

    findQuickMatch() {
        alert('Finding quick match...');
        // Implement quick match logic
    }

    generateRoomCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    copyRoomLink() {
        const linkInput = document.getElementById('room-link');
        linkInput.select();
        document.execCommand('copy');
        alert('Room link copied to clipboard!');
    }

    checkRoomRequirements() {
        const roomCode = document.getElementById('join-room-code').value;
        const passwordGroup = document.getElementById('join-password-group');
        
        // Show password field for certain room codes (mock logic)
        if (roomCode.toLowerCase().includes('private')) {
            passwordGroup.style.display = 'block';
        } else {
            passwordGroup.style.display = 'none';
        }
    }

    rejoinRoom(roomId) {
        this.joinRoom(roomId);
    }

    kickPlayer(playerId) {
        if (confirm('Are you sure you want to kick this player?')) {
            // Implement kick player logic
            alert('Player kicked');
            this.updatePlayersList();
        }
    }

    showRoomSettings() {
        alert('Room settings functionality would be implemented here');
    }

    loadFriendsForInvite() {
        const container = document.getElementById('invite-friends-list');
        if (!container) return;

        // Mock friends data
        const friends = [
            { id: 'f1', name: 'Friend1', online: true },
            { id: 'f2', name: 'Friend2', online: false },
            { id: 'f3', name: 'Friend3', online: true }
        ];

        container.innerHTML = friends.map(friend => `
            <div class="friend-invite-item">
                <div class="friend-info">
                    <div class="friend-name">${friend.name}</div>
                    <div class="friend-status ${friend.online ? 'online' : 'offline'}">
                        ${friend.online ? 'Online' : 'Offline'}
                    </div>
                </div>
                <button onclick="gamingAdditionalUI.inviteFriend('${friend.id}')" ${!friend.online ? 'disabled' : ''}>
                    Invite
                </button>
            </div>
        `).join('');
    }

    inviteFriend(friendId) {
        alert('Friend invited!');
        // Implement friend invite logic
    }

    // =================== LEADERBOARD UTILITY FUNCTIONS ===================

    async loadLeaderboardData() {
        try {
            // Mock leaderboard data
            const mockLeaderboard = [
                {
                    rank: 1, userId: 'user1', username: 'GamerPro', avatar: '/src/assets/default-avatar.png',
                    score: 2500, wins: 45, gamesPlayed: 50, level: 15, region: 'north-america'
                },
                {
                    rank: 2, userId: 'user2', username: 'QuizMaster', avatar: '/src/assets/default-avatar.png',
                    score: 2300, wins: 38, gamesPlayed: 42, level: 13, region: 'europe'
                },
                {
                    rank: 3, userId: 'user3', username: 'MemoryKing', avatar: '/src/assets/default-avatar.png',
                    score: 2100, wins: 35, gamesPlayed: 40, level: 12, region: 'asia'
                },
                {
                    rank: 4, userId: 'user4', username: 'SpeedRunner', avatar: '/src/assets/default-avatar.png',
                    score: 1950, wins: 32, gamesPlayed: 38, level: 11, region: 'north-america'
                },
                {
                    rank: 5, userId: 'user5', username: 'PuzzlePro', avatar: '/src/assets/default-avatar.png',
                    score: 1800, wins: 28, gamesPlayed: 35, level: 10, region: 'europe'
                }
            ];

            this.updatePodium(mockLeaderboard.slice(0, 3));
            this.updateLeaderboardTable(mockLeaderboard);
            this.updateUserRank(15, mockLeaderboard[14] || null);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
    }

    updatePodium(topPlayers) {
        const positions = ['second-place-player', 'first-place-player', 'third-place-player'];
        const indices = [1, 0, 2]; // Second, First, Third

        positions.forEach((positionId, index) => {
            const player = topPlayers[indices[index]];
            const element = document.getElementById(positionId);
            
            if (player && element) {
                element.innerHTML = `
                    <div class="player-avatar">
                        <img src="${player.avatar}" alt="${player.username}">
                    </div>
                    <div class="player-name">${player.username}</div>
                    <div class="player-score">${player.score} pts</div>
                `;
            }
        });
    }

    updateLeaderboardTable(players) {
        const tbody = document.getElementById('leaderboard-tbody');
        if (!tbody) return;

        tbody.innerHTML = players.map(player => `
            <tr class="leaderboard-row">
                <td class="rank-cell">
                    <span class="rank-number">#${player.rank}</span>
                </td>
                <td class="player-cell">
                    <div class="player-info">
                        <img src="${player.avatar}" alt="${player.username}" class="player-avatar">
                        <div class="player-details">
                            <div class="player-name">${player.username}</div>
                            <div class="player-level">Level ${player.level}</div>
                        </div>
                    </div>
                </td>
                <td class="score-cell">${player.score.toLocaleString()}</td>
                <td class="wins-cell">${player.wins}</td>
                <td class="games-cell">${player.gamesPlayed}</td>
                <td class="winrate-cell">${((player.wins / player.gamesPlayed) * 100).toFixed(1)}%</td>
                <td class="actions-cell">
                    <button class="action-btn" onclick="gamingAdditionalUI.viewProfile('${player.userId}')">
                        ${this.t('viewProfile')}
                    </button>
                    <button class="action-btn challenge-btn" onclick="gamingAdditionalUI.challengePlayer('${player.userId}')">
                        ${this.t('challenge')}
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateUserRank(rank, userStats) {
        const highlightElement = document.getElementById('my-rank-highlight');
        const cardElement = document.getElementById('my-rank-card');
        
        if (userStats && highlightElement && cardElement) {
            highlightElement.style.display = 'block';
            cardElement.innerHTML = `
                <div class="my-rank-info">
                    <div class="rank-position">#${rank}</div>
                    <div class="user-stats">
                        <div class="stat-item">
                            <span class="stat-label">${this.t('score')}</span>
                            <span class="stat-value">${userStats.score.toLocaleString()}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">${this.t('wins')}</span>
                            <span class="stat-value">${userStats.wins}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">${this.t('winRate')}</span>
                            <span class="stat-value">${((userStats.wins / userStats.gamesPlayed) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    switchTimeframe(timeframe) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-timeframe="${timeframe}"]`).classList.add('active');
        
        this.currentTimeframe = timeframe;
        this.currentPage = 1;
        this.loadLeaderboardData();
    }

    filterLeaderboard() {
        const gameType = document.getElementById('leaderboard-game-filter').value;
        const region = document.getElementById('leaderboard-region-filter').value;
        
        this.currentLeaderboardFilters.gameType = gameType;
        this.currentLeaderboardFilters.region = region;
        this.currentPage = 1;
        
        this.loadLeaderboardData();
    }

    refreshLeaderboard() {
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            refreshBtn.disabled = true;
        }
        
        setTimeout(() => {
            this.loadLeaderboardData();
            if (refreshBtn) {
                refreshBtn.innerHTML = `<i class="fas fa-sync-alt"></i> ${this.t('refreshRankings')}`;
                refreshBtn.disabled = false;
            }
        }, 1000);
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePaginationControls();
            this.loadLeaderboardData();
        }
    }

    nextPage() {
        this.currentPage++;
        this.updatePaginationControls();
        this.loadLeaderboardData();
    }

    updatePaginationControls() {
        const currentPageElement = document.getElementById('current-page');
        const totalPagesElement = document.getElementById('total-pages');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        if (currentPageElement) currentPageElement.textContent = this.currentPage;
        if (totalPagesElement) totalPagesElement.textContent = Math.max(1, Math.ceil(100 / this.itemsPerPage)); // Assuming 100 total items
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= Math.ceil(100 / this.itemsPerPage);
        }
    }

    viewProfile(userId) {
        alert(`Viewing profile for user: ${userId}`);
        // Implement profile view logic
    }

    challengePlayer(userId) {
        if (confirm('Send a game challenge to this player?')) {
            alert('Challenge sent!');
            // Implement challenge logic
        }
    }

    // =================== UTILITY FUNCTIONS ===================

    refreshAllInterfaces() {
        // Refresh both interfaces when language changes
        const lobbyInterface = document.querySelector('.game-lobby-interface');
        const leaderboardInterface = document.querySelector('.leaderboard-interface');
        
        if (lobbyInterface && lobbyInterface.parentNode) {
            this.createGameLobbyInterface(lobbyInterface.parentNode.id);
        }
        
        if (leaderboardInterface && leaderboardInterface.parentNode) {
            this.createLeaderboardInterface(leaderboardInterface.parentNode.id);
        }
    }

    // =================== API INTEGRATION METHODS ===================

    async makeApiCall(endpoint, options = {}) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }

    // =================== EVENT HANDLERS ===================

    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        // Show user-friendly error message
        const errorMessage = error.message || 'An unexpected error occurred';
        alert(`${context ? context + ': ' : ''}${errorMessage}`);
    }

    // =================== CLEANUP METHODS ===================

    cleanup() {
        // Clean up any intervals, listeners, etc.
        this.currentGameRoom = null;
        this.roomChatMessages = [];
        this.playerReadyStatus = {};
    }

    destroy() {
        this.cleanup();
        // Remove event listeners
        document.removeEventListener('languageChanged', this.refreshAllInterfaces);
    }
}

// =================== GLOBAL INITIALIZATION ===================

// Initialize the gaming additional missing UI components when DOM is ready
let gamingAdditionalUI;

document.addEventListener('DOMContentLoaded', function() {
    gamingAdditionalUI = new GamingAdditionalMissingUIComponents();
});

// Make it globally available
window.GamingAdditionalMissingUIComponents = GamingAdditionalMissingUIComponents;
window.gamingAdditionalUI = gamingAdditionalUI;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamingAdditionalMissingUIComponents;
}
