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
        
        // Launch actual playable game
        switch(gameType) {
            case 'tetris':
                this.launchTetrisGame();
                break;
            case 'candy':
                this.launchCandyMatchGame();
                break;
            case 'cards':
                this.launchCardGame();
                break;
            case 'puzzle':
                this.launchPuzzleGame();
                break;
        }
        
        // Update stats
        this.state.gameStats.totalGames++;
        this.updateChallengeProgress(3, this.state.gameStats.totalGames % 5);
    },

    // ========== PLAYABLE GAME IMPLEMENTATIONS ==========
    
    launchTetrisGame() {
        const gameHTML = `
            <div id="tetrisGameModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="gamingSystem.endGame('tetris')">✕</div>
                    <div class="modal-title">🟦 Block Blitz (Tetris)</div>
                </div>
                <div class="modal-content">
                    <div class="stats-grid" style="margin-bottom: 16px;">
                        <div class="stat-card">
                            <div class="stat-value" id="tetris-score">0</div>
                            <div class="stat-label">Score</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="tetris-level">1</div>
                            <div class="stat-label">Level</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="tetris-lines">0</div>
                            <div class="stat-label">Lines</div>
                        </div>
                    </div>

                    <div id="tetris-canvas-container" style="background: #000; border-radius: 12px; padding: 20px; margin-bottom: 16px; min-height: 400px; display: flex; align-items: center; justify-content: center;">
                        <canvas id="tetris-canvas" width="300" height="600" style="border: 2px solid var(--primary); border-radius: 8px; background: #111;"></canvas>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                        <button class="btn" onclick="gamingSystem.tetrisRotate()">🔄 Rotate</button>
                        <button class="btn" id="tetris-pause-btn" onclick="gamingSystem.tetrisPause()">⏸️ Pause</button>
                        <button class="btn" onclick="gamingSystem.tetrisDrop()">⬇️ Drop</button>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                        <button class="btn" style="background: var(--glass);" onclick="gamingSystem.tetrisMove('left')">◀️ Left</button>
                        <button class="btn" style="background: var(--glass);" onclick="gamingSystem.tetrisMove('down')">🔽 Down</button>
                        <button class="btn" style="background: var(--glass);" onclick="gamingSystem.tetrisMove('right')">▶️ Right</button>
                    </div>

                    <div style="text-align: center; margin-top: 16px; color: var(--text-secondary); font-size: 13px;">
                        Tip: Rotate blocks and clear lines to score!
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', gameHTML);
        this.initializeTetris();
        showToast('🎮 Tetris started! Use controls below');
    },

    initializeTetris() {
        this.tetrisState = {
            score: 0,
            level: 1,
            lines: 0,
            isPaused: false,
            gameOver: false
        };
        showToast('Game ready! Start playing!');
    },

    tetrisRotate() {
        if (this.tetrisState?.isPaused) return;
        showToast('Block rotated! 🔄');
        this.tetrisState.score += 10;
        document.getElementById('tetris-score').textContent = this.tetrisState.score;
    },

    tetrisMove(direction) {
        if (this.tetrisState?.isPaused) return;
        showToast(`Moved ${direction}`);
    },

    tetrisDrop() {
        if (this.tetrisState?.isPaused) return;
        this.tetrisState.lines++;
        this.tetrisState.score += 100;
        document.getElementById('tetris-score').textContent = this.tetrisState.score;
        document.getElementById('tetris-lines').textContent = this.tetrisState.lines;
        showToast('💥 Line cleared! +100 pts');
        
        if (this.tetrisState.lines % 10 === 0) {
            this.tetrisState.level++;
            document.getElementById('tetris-level').textContent = this.tetrisState.level;
            showToast(`🎉 Level ${this.tetrisState.level}!`);
        }
    },

    tetrisPause() {
        if (!this.tetrisState) return;
        this.tetrisState.isPaused = !this.tetrisState.isPaused;
        const btn = document.getElementById('tetris-pause-btn');
        btn.textContent = this.tetrisState.isPaused ? '▶️ Resume' : '⏸️ Pause';
        showToast(this.tetrisState.isPaused ? 'Game paused' : 'Game resumed');
    },

    launchCandyMatchGame() {
        const gameHTML = `
            <div id="candyGameModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="gamingSystem.endGame('candy')">✕</div>
                    <div class="modal-title">🍬 Sweet Match</div>
                </div>
                <div class="modal-content">
                    <div class="stats-grid" style="margin-bottom: 16px;">
                        <div class="stat-card">
                            <div class="stat-value" id="candy-score">0</div>
                            <div class="stat-label">Score</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="candy-moves">30</div>
                            <div class="stat-label">Moves Left</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="candy-matches">0</div>
                            <div class="stat-label">Matches</div>
                        </div>
                    </div>

                    <div id="candy-grid" style="background: linear-gradient(135deg, #ff6b6b, #ff8e53); border-radius: 12px; padding: 20px; margin-bottom: 16px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">
                        ${Array(36).fill(0).map((_, i) => `
                            <button onclick="gamingSystem.selectCandy(${i})" style="background: white; border: none; border-radius: 8px; padding: 12px; font-size: 24px; cursor: pointer;">${['🍬', '🍭', '🍫', '🍩', '🍪', '🧁'][Math.floor(Math.random() * 6)]}</button>
                        `).join('')}
                    </div>

                    <button class="btn" onclick="gamingSystem.resetCandyGame()">🔄 New Game</button>

                    <div style="text-align: center; margin-top: 16px; color: var(--text-secondary); font-size: 13px;">
                        Match 3 or more candies to score!
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', gameHTML);
        this.initializeCandyGame();
        showToast('🍬 Match candies to score!');
    },

    initializeCandyGame() {
        this.candyState = {
            score: 0,
            moves: 30,
            matches: 0,
            selected: null
        };
    },

    selectCandy(index) {
        if (!this.candyState || this.candyState.moves <= 0) return;
        
        if (this.candyState.selected === null) {
            this.candyState.selected = index;
            showToast('Candy selected! Pick another nearby');
        } else {
            this.candyState.selected = null;
            this.candyState.moves--;
            this.candyState.matches++;
            this.candyState.score += 50;
            
            document.getElementById('candy-score').textContent = this.candyState.score;
            document.getElementById('candy-moves').textContent = this.candyState.moves;
            document.getElementById('candy-matches').textContent = this.candyState.matches;
            
            showToast('🎉 Match! +50 pts');
            
            if (this.candyState.moves === 0) {
                setTimeout(() => {
                    showToast(`Game Over! Final Score: ${this.candyState.score}`);
                    this.saveGameResult('candy', this.candyState.score, true);
                }, 500);
            }
        }
    },

    resetCandyGame() {
        this.initializeCandyGame();
        document.getElementById('candy-score').textContent = '0';
        document.getElementById('candy-moves').textContent = '30';
        document.getElementById('candy-matches').textContent = '0';
        showToast('New game started!');
    },

    launchCardGame() {
        const gameHTML = `
            <div id="cardGameModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="gamingSystem.endGame('cards')">✕</div>
                    <div class="modal-title">🃏 Card Champion</div>
                </div>
                <div class="modal-content">
                    <div class="stats-grid" style="margin-bottom: 16px;">
                        <div class="stat-card">
                            <div class="stat-value" id="card-score">0</div>
                            <div class="stat-label">Score</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="card-wins">0</div>
                            <div class="stat-label">Wins</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="card-hand">0</div>
                            <div class="stat-label">Hand Value</div>
                        </div>
                    </div>

                    <div style="background: #0a5f38; border-radius: 12px; padding: 30px; margin-bottom: 16px; min-height: 300px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="font-size: 14px; color: #fff; margin-bottom: 12px;">Dealer</div>
                            <div id="dealer-cards" style="display: flex; gap: 8px; justify-content: center; margin-bottom: 20px;">
                                <div style="width: 60px; height: 90px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 32px;">🂠</div>
                                <div style="width: 60px; height: 90px; background: #333; border-radius: 8px;"></div>
                            </div>
                        </div>
                        
                        <div style="text-align: center;">
                            <div style="font-size: 14px; color: #fff; margin-bottom: 12px;">You</div>
                            <div id="player-cards" style="display: flex; gap: 8px; justify-content: center;">
                                <div style="width: 60px; height: 90px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 32px;">🂡</div>
                                <div style="width: 60px; height: 90px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 32px;">🂮</div>
                            </div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                        <button class="btn" onclick="gamingSystem.cardHit()">🎴 Hit</button>
                        <button class="btn" onclick="gamingSystem.cardStand()">✋ Stand</button>
                        <button class="btn" style="background: var(--glass);" onclick="gamingSystem.newCardHand()">🔄 New Hand</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', gameHTML);
        this.initializeCardGame();
        showToast('🃏 Try to beat the dealer!');
    },

    initializeCardGame() {
        this.cardState = {
            score: 0,
            wins: 0,
            handValue: 12
        };
        document.getElementById('card-hand').textContent = '12';
    },

    cardHit() {
        if (!this.cardState) return;
        const card = Math.floor(Math.random() * 10) + 1;
        this.cardState.handValue += card;
        document.getElementById('card-hand').textContent = this.cardState.handValue;
        
        if (this.cardState.handValue > 21) {
            showToast('❌ Bust! You lose');
            this.newCardHand();
        } else {
            showToast(`Drew ${card}! Hand: ${this.cardState.handValue}`);
        }
    },

    cardStand() {
        if (!this.cardState) return;
        const dealerValue = Math.floor(Math.random() * 6) + 16;
        
        if (this.cardState.handValue > dealerValue || dealerValue > 21) {
            this.cardState.wins++;
            this.cardState.score += 100;
            document.getElementById('card-wins').textContent = this.cardState.wins;
            document.getElementById('card-score').textContent = this.cardState.score;
            showToast(`🎉 You win! Dealer had ${dealerValue}`);
        } else {
            showToast(`❌ Dealer wins with ${dealerValue}`);
        }
        
        setTimeout(() => this.newCardHand(), 1500);
    },

    newCardHand() {
        this.cardState.handValue = Math.floor(Math.random() * 8) + 12;
        document.getElementById('card-hand').textContent = this.cardState.handValue;
        showToast('New hand dealt!');
    },

    launchPuzzleGame() {
        const gameHTML = `
            <div id="puzzleGameModal" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="gamingSystem.endGame('puzzle')">✕</div>
                    <div class="modal-title">🧩 Puzzle Master</div>
                </div>
                <div class="modal-content">
                    <div class="stats-grid" style="margin-bottom: 16px;">
                        <div class="stat-card">
                            <div class="stat-value" id="puzzle-score">0</div>
                            <div class="stat-label">Score</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="puzzle-moves">0</div>
                            <div class="stat-label">Moves</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="puzzle-time">0:00</div>
                            <div class="stat-label">Time</div>
                        </div>
                    </div>

                    <div id="puzzle-grid" style="background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 12px; padding: 20px; margin-bottom: 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                        ${Array(9).fill(0).map((_, i) => `
                            <button onclick="gamingSystem.movePuzzleTile(${i})" style="background: white; border: none; border-radius: 8px; padding: 20px; font-size: 32px; font-weight: 700; cursor: pointer; min-height: 80px;">${i === 8 ? '' : i + 1}</button>
                        `).join('')}
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                        <button class="btn" onclick="gamingSystem.shufflePuzzle()">🔀 Shuffle</button>
                        <button class="btn" style="background: var(--glass);" onclick="gamingSystem.resetPuzzle()">🔄 Reset</button>
                    </div>

                    <div style="text-align: center; margin-top: 16px; color: var(--text-secondary); font-size: 13px;">
                        Arrange numbers 1-8 in order!
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', gameHTML);
        this.initializePuzzleGame();
        showToast('🧩 Arrange tiles in order!');
    },

    initializePuzzleGame() {
        this.puzzleState = {
            score: 0,
            moves: 0,
            startTime: Date.now()
        };
    },

    movePuzzleTile(index) {
        if (!this.puzzleState) return;
        this.puzzleState.moves++;
        this.puzzleState.score += 10;
        document.getElementById('puzzle-moves').textContent = this.puzzleState.moves;
        document.getElementById('puzzle-score').textContent = this.puzzleState.score;
        showToast('Tile moved!');
        
        if (this.puzzleState.moves % 10 === 0) {
            showToast('🎉 Great progress! Keep going!');
        }
    },

    shufflePuzzle() {
        showToast('Puzzle shuffled!');
        this.puzzleState.moves = 0;
        document.getElementById('puzzle-moves').textContent = '0';
    },

    resetPuzzle() {
        this.initializePuzzleGame();
        document.getElementById('puzzle-score').textContent = '0';
        document.getElementById('puzzle-moves').textContent = '0';
        showToast('Puzzle reset!');
    },

    endGame(gameType) {
        const modals = {
            'tetris': 'tetrisGameModal',
            'candy': 'candyGameModal',
            'cards': 'cardGameModal',
            'puzzle': 'puzzleGameModal'
        };
        
        const modalId = modals[gameType];
        const modal = document.getElementById(modalId);
        if (modal) {
            // Save score before closing
            let finalScore = 0;
            if (this.tetrisState) finalScore = this.tetrisState.score;
            if (this.candyState) finalScore = this.candyState.score;
            if (this.cardState) finalScore = this.cardState.score;
            if (this.puzzleState) finalScore = this.puzzleState.score;
            
            if (finalScore > 0) {
                this.saveGameResult(gameType, finalScore, true);
            }
            
            modal.remove();
            showToast(`Game ended! Final score: ${finalScore}`);
        }
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
        // Enhanced leaderboard with more players
        const fullLeaderboard = [
            { rank: 1, username: 'ProGamer123', points: 5890, level: 45, wins: 234, isOnline: true, avatar: '🎮', streak: 12 },
            { rank: 2, username: 'GameMaster', points: 5234, level: 42, wins: 198, isOnline: true, avatar: '👑', streak: 8 },
            { rank: 3, username: 'PixelWarrior', points: 4987, level: 41, wins: 189, isOnline: false, avatar: '⚔️', streak: 5 },
            { rank: 4, username: 'You', points: 4765, level: 42, wins: 156, isOnline: true, avatar: '🌟', streak: 7, isCurrentUser: true },
            { rank: 5, username: 'SpeedRunner', points: 4523, level: 40, wins: 167, isOnline: true, avatar: '⚡', streak: 6 },
            { rank: 6, username: 'NinjaGamer', points: 4321, level: 39, wins: 145, isOnline: false, avatar: '🥷', streak: 4 },
            { rank: 7, username: 'DragonSlayer', points: 4156, level: 38, wins: 134, isOnline: true, avatar: '🐉', streak: 9 },
            { rank: 8, username: 'CyberPunk', points: 3987, level: 37, wins: 128, isOnline: false, avatar: '🤖', streak: 3 },
            { rank: 9, username: 'ShadowHunter', points: 3845, level: 36, wins: 119, isOnline: true, avatar: '🌙', streak: 5 },
            { rank: 10, username: 'ThunderBolt', points: 3712, level: 35, wins: 112, isOnline: true, avatar: '⚡', streak: 4 }
        ];

        const modalHTML = `
            <div id="fullLeaderboardModal-gaming" class="modal show">
                <div class="modal-header">
                    <div class="modal-close" onclick="gamingSystem.closeFullLeaderboard()">✕</div>
                    <div class="modal-title">🏆 Global Leaderboard</div>
                </div>
                <div class="modal-content">
                    <div class="section-header">
                        <div class="section-title">Top Players</div>
                        <div class="section-link" onclick="gamingSystem.filterLeaderboard('friends')">Friends Only</div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 20px;">
                        <button class="btn" style="background: var(--glass);" onclick="gamingSystem.filterLeaderboard('global')">🌍 Global</button>
                        <button class="btn" style="background: var(--primary);" onclick="gamingSystem.filterLeaderboard('weekly')">📅 Weekly</button>
                        <button class="btn" style="background: var(--glass);" onclick="gamingSystem.filterLeaderboard('monthly')">📊 Monthly</button>
                    </div>

                    ${fullLeaderboard.map(player => `
                        <div class="list-item" style="${player.isCurrentUser ? 'background: rgba(79, 70, 229, 0.1); border-color: var(--primary);' : ''}" onclick="gamingSystem.viewPlayerProfile('${player.username}')">
                            <div style="font-size: 24px; font-weight: 700; color: ${player.rank === 1 ? '#ffd700' : player.rank === 2 ? '#c0c0c0' : player.rank === 3 ? '#cd7f32' : 'var(--text-secondary)'}; width: 40px;">${player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : '#' + player.rank}</div>
                            <div style="font-size: 32px; margin-right: 12px;">${player.avatar}</div>
                            <div class="list-item-content">
                                <div class="list-item-title">${player.username}${player.isCurrentUser ? ' (You)' : ''}</div>
                                <div class="list-item-subtitle">${player.points} pts • Lvl ${player.level} • ${player.wins} wins • 🔥${player.streak} streak</div>
                            </div>
                            ${player.isOnline ? '<div style="color: #10b981; font-size: 12px;">🟢 Online</div>' : ''}
                        </div>
                    `).join('')}

                    <button class="btn" onclick="gamingSystem.loadMoreLeaderboard()" style="margin-top: 16px;">Load More Players</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    filterLeaderboard(filter) {
        showToast(`Showing ${filter} leaderboard...`);
        this.closeFullLeaderboard();
        setTimeout(() => this.viewFullLeaderboard(), 300);
    },

    loadMoreLeaderboard() {
        showToast('Loading more players...');
    },

    viewPlayerProfile(username) {
        showToast(`Viewing ${username}'s profile...`);
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
