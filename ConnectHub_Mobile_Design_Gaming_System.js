// ========================================
// CONNECTHUB GAMING HUB SYSTEM
// Complete Gaming Platform with All Features
// ========================================

const gamingSystem = {
    // ========== GAME STATE MANAGEMENT ==========
    state: {
        currentGame: null,
        isPaused: false,
        score: 0,
        level: 42,
        xp: 15680,
        achievements: [],
        highScores: {
            tetris: 24500,
            candy: 18900,
            cards: 5670,
            puzzle: 12300
        },
        gameStats: {
            totalGames: 230,
            gamesWon: 156,
            gamesLost: 74,
            winRate: 68,
            totalPlayTime: '45h 23m'
        },
        challenges: {
            daily: [
                { id: 1, title: 'Win 3 games today', progress: 2, target: 3, reward: 500 },
                { id: 2, title: 'Score 10,000+ in Tetris', progress: 8500, target: 10000, reward: 750 }
            ]
        },
        leaderboard: [
            { rank: 1, username: 'ProGamer123', points: 5890, isOnline: true },
            { rank: 2, username: 'GameMaster', points: 5234, isOnline: true }
        ],
        tournaments: [],
        settings: {
            soundEnabled: true,
            musicEnabled: true,
            vibrationEnabled: true,
            notifications: true,
            difficulty: 'medium'
        }
    },

    // ========== CORE FUNCTIONS ==========
    playGame(gameType) {
        showToast(`Loading ${gameType}...`);
        setTimeout(() => {
            this.showGameInterface(gameType);
        }, 500);
    },

    showGameInterface(gameType) {
        const games = {
            'tetris': { title: '🟦 Block Blitz', desc: 'Classic block puzzle game' },
            'candy': { title: '🍬 Sweet Match', desc: 'Match 3 or more candies' },
            'cards': { title: '🃏 Card Champion', desc: 'Beat the dealer' },
            'puzzle': { title: '🧩 Puzzle Master', desc: 'Slide tiles to solve' }
        };

        const game = games[gameType];
        
        const content = document.getElementById('gameInterfaceContent');
        content.innerHTML = `
            <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); height: 300px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 20px;">
                <div style="font-size: 80px; margin-bottom: 20px;">${game.title.split(' ')[0]}</div>
                <div style="font-size: 16px; margin-bottom: 20px;">${game.desc}</div>
                <button class="btn" style="width: auto; padding: 16px 40px;" onclick="gamingSystem.startGame('${gameType}')">
                    ▶️ Start Game
                </button>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">Level 5</div>
                    <div class="stat-label">Current</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${gamingSystem.state.highScores[gameType]}</div>
                    <div class="stat-label">High Score</div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 16px;">
                <button class="btn" style="background: var(--glass);" onclick="gamingSystem.viewStats('${gameType}')">📊 Stats</button>
                <button class="btn" style="background: var(--glass);" onclick="gamingSystem.openSettings('${gameType}')">⚙️ Settings</button>
            </div>
        `;
        
        document.getElementById('gameInterfaceTitle').textContent = game.title;
        openModal('gameInterface');
    },

    startGame(gameType) {
        closeModal('gameInterface');
        showToast(`🎮 ${gameType} started!`);
        
        // Update stats
        this.state.gameStats.totalGames++;
        this.updateChallengeProgress(3, this.state.gameStats.totalGames % 5);
        
        setTimeout(() => {
            showToast('Game in progress... Controls active!');
        }, 1000);
    },

    saveGameResult(game, score, won = true) {
        if (score > this.state.highScores[game]) {
            this.state.highScores[game] = score;
            showToast(`🎉 New high score: ${score}!`);
        }
        
        if (won) {
            this.state.gameStats.gamesWon++;
            this.updateChallengeProgress(1, this.state.gameStats.gamesWon % 3);
        } else {
            this.state.gameStats.gamesLost++;
        }
        
        this.state.gameStats.winRate = Math.round((this.state.gameStats.gamesWon / this.state.gameStats.totalGames) * 100);
        this.addXP(Math.floor(score / 10));
    },

    showGameOver(game, score, extra = 0, won = true, time = 0) {
        let message = won ? '🎉 Victory!' : '😔 Game Over';
        showToast(`${message} Score: ${score}`);
    },

    // ========== ACHIEVEMENT SYSTEM ==========
    checkAchievements(game, score, extra = 0) {
        // Check score achievements
        if (game === 'tetris' && score >= 25000) {
            this.unlockAchievement(3);
        }
        
        // Check level achievements
        if (this.state.level >= 50) {
            this.unlockAchievement(6);
        }
    },

    unlockAchievement(id) {
        const achievement = this.achievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            achievement.unlockedDate = new Date().toISOString().split('T')[0];
            this.addXP(achievement.xp);
            showToast(`🏆 Achievement Unlocked: ${achievement.name}!`);
            
            if (this.state.settings.notifications) {
                showInAppNotification('🏆', 'Achievement Unlocked!', achievement.name, { type: 'achievement' });
            }
        }
    },

    // ========== XP & LEVELING SYSTEM ==========
    addXP(amount) {
        this.state.xp += amount;
        const xpForNextLevel = this.state.level * 500;
        
        if (this.state.xp >= xpForNextLevel) {
            this.state.level++;
            this.state.xp = 0;
            showToast(`🎉 Level Up! Now Level ${this.state.level}`);
            
            if (this.state.settings.notifications) {
                showInAppNotification('🎮', 'Level Up!', `You reached Level ${this.state.level}!`, { type: 'gaming' });
            }
        }
    },

    // ========== CHALLENGE SYSTEM ==========
    updateChallengeProgress(challengeId, progress) {
        const challenge = [...this.state.challenges.daily, ...this.state.challenges.weekly]
            .find(c => c.id === challengeId);
        
        if (challenge && !challenge.completed) {
            challenge.progress = Math.min(progress, challenge.target);
            
            if (challenge.progress >= challenge.target) {
                challenge.completed = true;
                this.addXP(challenge.reward);
                showToast(`✅ Challenge Complete! +${challenge.reward} XP`);
            }
        }
    },

    // ========== LEADERBOARD SYSTEM ==========
    updateLeaderboard() {
        // Sort by points
        this.state.leaderboard.sort((a, b) => b.points - a.points);
        
        // Update ranks
        this.state.leaderboard.forEach((player, index) => {
            player.rank = index + 1;
        });
    },

    // ========== TOURNAMENT SYSTEM ==========
    viewTournaments() {
        const modalHTML = `
            <div id="tournamentsModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="closeModal('tournaments')">✕</div>
                    <div class="modal-title">🏆 Tournaments</div>
                </div>
                <div class="modal-content">
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="font-size: 64px; margin-bottom: 16px;">🏆</div>
                        <div style="font-size: 18px; font-weight: 600;">Compete & Win Prizes</div>
                    </div>
                    
                    <div class="section-header">
                        <div class="section-title">Active Tournaments</div>
                    </div>
                    
                    <div class="card" style="margin-bottom: 12px; cursor: pointer;" onclick="gamingSystem.joinTournament(1)">
                        <div style="font-size: 40px; margin-bottom: 12px;">🏆</div>
                        <div style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Winter Championship</div>
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Tetris • $500 Prize</div>
                        <div style="font-size: 13px; margin-bottom: 12px;">156 participants • Starts in 5 days</div>
                        <button class="btn">Join Tournament</button>
                    </div>
                    
                    <div class="section-header">
                        <div class="section-title">Upcoming</div>
                    </div>
                    
                    <div class="card" onclick="gamingSystem.viewTournamentDetails(2)">
                        <div style="font-size: 40px; margin-bottom: 12px;">🍬</div>
                        <div style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Candy Masters</div>
                        <div style="font-size: 14px; color: var(--text-secondary);">$300 Prize • Starts Dec 28</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    joinTournament(id) {
        showToast('Joining tournament...');
        setTimeout(() => {
            showToast('✅ Successfully joined! Good luck!');
        }, 1000);
    },

    // ========== MULTIPLAYER SYSTEM ==========
    openMultiplayer() {
        const modalHTML = `
            <div id="multiplayerModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="closeModal('multiplayer')">✕</div>
                    <div class="modal-title">👥 Multiplayer</div>
                </div>
                <div class="modal-content">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                        <button class="btn" onclick="gamingSystem.createRoom()">➕ Create Room</button>
                        <button class="btn" style="background: var(--glass);" onclick="gamingSystem.quickMatch()">⚡ Quick Match</button>
                    </div>
                    
                    <div class="section-header">
                        <div class="section-title">Active Rooms</div>
                    </div>
                    
                    <div class="list-item" onclick="gamingSystem.joinRoom(1)">
                        <div class="list-item-icon">🎮</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Tetris Battle</div>
                            <div class="list-item-subtitle">3/4 players • Public</div>
                        </div>
                        <button class="friend-btn primary">Join</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    createRoom() {
        showToast('Creating multiplayer room...');
        setTimeout(() => {
            showToast('Room created! Waiting for players...');
        }, 1000);
    },

    quickMatch() {
        showToast('Finding opponents...');
        setTimeout(() => {
            showToast('Match found! Connecting...');
        }, 1500);
    },

    joinRoom(id) {
        showToast('Joining room...');
        setTimeout(() => {
            showToast('Joined! Game starting soon...');
        }, 1000);
    },

    // ========== GAME SETTINGS ==========
    openSettings(game) {
        const modalHTML = `
            <div id="gameSettingsModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="closeModal('gameSettings')">✕</div>
                    <div class="modal-title">⚙️ Game Settings</div>
                </div>
                <div class="modal-content">
                    <div class="toggle-container">
                        <div>
                            <div class="list-item-title">Sound Effects</div>
                        </div>
                        <div class="toggle-switch active" onclick="toggleSwitch(this); gamingSystem.toggleSound()">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    
                    <div class="toggle-container">
                        <div>
                            <div class="list-item-title">Background Music</div>
                        </div>
                        <div class="toggle-switch active" onclick="toggleSwitch(this); gamingSystem.toggleMusic()">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    
                    <div class="toggle-container">
                        <div>
                            <div class="list-item-title">Vibration</div>
                        </div>
                        <div class="toggle-switch active" onclick="toggleSwitch(this)">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    
                    <div class="list-item" onclick="gamingSystem.selectDifficulty()">
                        <div class="list-item-content">
                            <div class="list-item-title">Difficulty</div>
                            <div class="list-item-subtitle">Medium</div>
                        </div>
                        <div class="list-item-arrow">→</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    toggleSound() {
        this.state.settings.soundEnabled = !this.state.settings.soundEnabled;
        showToast(this.state.settings.soundEnabled ? 'Sound enabled' : 'Sound disabled');
    },

    toggleMusic() {
        this.state.settings.musicEnabled = !this.state.settings.musicEnabled;
        showToast(this.state.settings.musicEnabled ? 'Music enabled' : 'Music disabled');
    },

    selectDifficulty() {
        const modalHTML = `
            <div id="difficultyModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="closeModal('difficulty')">✕</div>
                    <div class="modal-title">Difficulty</div>
                </div>
                <div class="modal-content">
                    <div class="list-item" onclick="gamingSystem.setDifficulty('easy')">
                        <div class="list-item-content">
                            <div class="list-item-title">Easy</div>
                            <div class="list-item-subtitle">Relaxed gameplay</div>
                        </div>
                    </div>
                    <div class="list-item" onclick="gamingSystem.setDifficulty('medium')" style="background: rgba(79, 70, 229, 0.1); border-color: var(--primary);">
                        <div class="list-item-content">
                            <div class="list-item-title">Medium</div>
                            <div class="list-item-subtitle">Balanced challenge</div>
                        </div>
                        <div style="color: var(--primary); font-weight: 600;">✓</div>
                    </div>
                    <div class="list-item" onclick="gamingSystem.setDifficulty('hard')">
                        <div class="list-item-content">
                            <div class="list-item-title">Hard</div>
                            <div class="list-item-subtitle">Expert level</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    setDifficulty(level) {
        this.state.settings.difficulty = level;
        closeModal('difficulty');
        closeModal('gameSettings');
        showToast(`Difficulty set to ${level}`);
    },

    viewStats(game) {
        showToast(`Viewing ${game} statistics...`);
    },

    playSound(type) {
        if (!this.state.settings.soundEnabled) return;
        // Sound playback logic here
    },

    // ========== ACHIEVEMENT VIEWER ==========
    viewAchievements() {
        const modalHTML = `
            <div id="achievementsModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="closeModal('achievements')">✕</div>
                    <div class="modal-title">🏆 Achievements</div>
                </div>
                <div class="modal-content">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">12/50</div>
                            <div class="stat-label">Unlocked</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">2,450</div>
                            <div class="stat-label">XP Earned</div>
                        </div>
                    </div>
                    
                    <div class="section-header">
                        <div class="section-title">Recent Unlocks</div>
                    </div>
                    
                    <div class="card" style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), transparent); border-color: var(--primary);">
                        <div style="font-size: 48px; margin-bottom: 12px;">🏆</div>
                        <div style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">First Win</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">Win your first game</div>
                        <div style="font-size: 12px; color: var(--primary); margin-top: 8px;">+100 XP</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // ========== LEADERBOARD VIEWER ==========
    viewFullLeaderboard() {
        const modalHTML = `
            <div id="fullLeaderboardModal-gaming" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="gamingSystem.closeFullLeaderboard()">✕</div>
                    <div class="modal-title">🏆 Leaderboard</div>
                </div>
                <div class="modal-content">
                    ${this.state.leaderboard.map(player => `
                        <div class="list-item" style="${player.isCurrentUser ? 'background: rgba(79, 70, 229, 0.1); border-color: var(--primary);' : ''}">
                            <div style="font-size: 24px; font-weight: 700; color: ${player.rank === 1 ? '#ffd700' : player.rank === 2 ? '#c0c0c0' : player.rank === 3 ? '#cd7f32' : 'var(--text-secondary)'};">${player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}</div>
                            <div class="list-item-content">
                                <div class="list-item-title">${player.username}${player.isCurrentUser ? ' (You)' : ''}</div>
                                <div class="list-item-subtitle">${player.points} points${player.isOnline ? ' • 🟢 Online' : ''}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    closeFullLeaderboard() {
        const modal = document.getElementById('fullLeaderboardModal-gaming');
        if (modal) modal.remove();
    },

    // ========== GAME INVITATIONS ==========
    inviteFriend(friendName) {
        showToast(`Inviting ${friendName} to play...`);
        setTimeout(() => {
            showToast('Invitation sent! ✅');
        }, 1000);
    },

    // ========== SPECTATOR MODE ==========
    spectateGame(username) {
        showToast(`Watching ${username}'s game...`);
        setTimeout(() => {
            showToast('Now spectating! 👀');
        }, 1000);
    },

    // ========== GAME REPLAYS ==========
    viewReplays() {
        const modalHTML = `
            <div id="replaysModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="closeModal('replays')">✕</div>
                    <div class="modal-title">📹 Replays</div>
                </div>
                <div class="modal-content">
                    <div class="list-item" onclick="gamingSystem.watchReplay(1)">
                        <div class="list-item-icon">🎮</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Tetris - 24,500 pts</div>
                            <div class="list-item-subtitle">Yesterday • 15:30</div>
                        </div>
                        <div class="list-item-arrow">▶️</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    watchReplay(id) {
        closeModal('replays');
        showToast('Loading replay...');
        setTimeout(() => {
            showToast('Replay started! ▶️');
        }, 1000);
    },

    // ========== GAME CHAT ==========
    openGameChat() {
        const modalHTML = `
            <div id="gameChatModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="closeModal('gameChat')">✕</div>
                    <div class="modal-title">💬 Game Chat</div>
                </div>
                <div class="modal-content">
                    <div class="chat-messages" style="height: calc(100vh - 250px);">
                        <div class="chat-bubble received">GG! Great game!</div>
                        <div class="chat-bubble sent">Thanks! You too! 🎮</div>
                    </div>
                    <div style="position: sticky; bottom: 0; background: var(--bg-primary); padding: 16px 0; display: flex; gap: 10px;">
                        <input type="text" class="input-field" style="margin-bottom: 0;" placeholder="Type message..." />
                        <button class="chat-send-btn" onclick="showToast('Message sent')">➤</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
};

// Make gamingSystem globally accessible
window.gamingSystem = gamingSystem;

console.log('✅ Gaming Hub System Loaded');
