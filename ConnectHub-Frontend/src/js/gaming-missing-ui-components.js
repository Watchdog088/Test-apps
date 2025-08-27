// Gaming Missing UI Components for ConnectHub
// Implements the 4 missing gaming interfaces: Achievement Gallery, Daily Challenges Interface, Tournament System, Game History/Stats Detail

class GamingMissingUIComponents {
    constructor() {
        this.currentUser = null;
        this.achievements = [];
        this.dailyChallenges = [];
        this.tournaments = [];
        this.gameHistory = [];
        this.playerStats = {};
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {};
        
        this.init();
    }

    async init() {
        await this.loadTranslations();
        this.initializeEventListeners();
    }

    async loadTranslations() {
        this.translations = {
            en: {
                achievementGallery: 'Achievement Gallery',
                dailyChallenges: 'Daily Challenges',
                tournaments: 'Tournaments',
                gameHistory: 'Game History & Stats',
                viewAll: 'View All',
                filterBy: 'Filter by',
                sortBy: 'Sort by',
                rarity: 'Rarity',
                category: 'Category',
                dateUnlocked: 'Date Unlocked',
                progress: 'Progress',
                reward: 'Reward',
                timeLeft: 'Time Left',
                difficulty: 'Difficulty',
                participants: 'Participants',
                prizePool: 'Prize Pool',
                status: 'Status',
                joinTournament: 'Join Tournament',
                viewTournament: 'View Tournament',
                gamesPlayed: 'Games Played',
                winRate: 'Win Rate',
                totalScore: 'Total Score',
                averageScore: 'Average Score',
                bestScore: 'Best Score',
                achievements: 'Achievements',
                rank: 'Rank',
                level: 'Level',
                experience: 'Experience',
                coins: 'Coins',
                streaks: 'Streaks',
                detailed: 'Detailed',
                summary: 'Summary',
                recent: 'Recent',
                allTime: 'All Time',
                week: 'This Week',
                month: 'This Month',
                year: 'This Year'
            },
            es: {
                achievementGallery: 'Galería de Logros',
                dailyChallenges: 'Desafíos Diarios',
                tournaments: 'Torneos',
                gameHistory: 'Historial de Juegos y Estadísticas',
                viewAll: 'Ver Todo',
                filterBy: 'Filtrar por',
                sortBy: 'Ordenar por',
                rarity: 'Rareza',
                category: 'Categoría',
                dateUnlocked: 'Fecha de Desbloqueo',
                progress: 'Progreso',
                reward: 'Recompensa',
                timeLeft: 'Tiempo Restante',
                difficulty: 'Dificultad',
                participants: 'Participantes',
                prizePool: 'Pozo de Premios',
                status: 'Estado',
                joinTournament: 'Unirse al Torneo',
                viewTournament: 'Ver Torneo',
                gamesPlayed: 'Juegos Jugados',
                winRate: 'Tasa de Victorias',
                totalScore: 'Puntuación Total',
                averageScore: 'Puntuación Promedio',
                bestScore: 'Mejor Puntuación',
                achievements: 'Logros',
                rank: 'Rango',
                level: 'Nivel',
                experience: 'Experiencia',
                coins: 'Monedas',
                streaks: 'Rachas',
                detailed: 'Detallado',
                summary: 'Resumen',
                recent: 'Reciente',
                allTime: 'Todos los Tiempos',
                week: 'Esta Semana',
                month: 'Este Mes',
                year: 'Este Año'
            },
            fr: {
                achievementGallery: 'Galerie des Succès',
                dailyChallenges: 'Défis Quotidiens',
                tournaments: 'Tournois',
                gameHistory: 'Historique des Jeux et Statistiques',
                viewAll: 'Voir Tout',
                filterBy: 'Filtrer par',
                sortBy: 'Trier par',
                rarity: 'Rareté',
                category: 'Catégorie',
                dateUnlocked: 'Date de Déverrouillage',
                progress: 'Progrès',
                reward: 'Récompense',
                timeLeft: 'Temps Restant',
                difficulty: 'Difficulté',
                participants: 'Participants',
                prizePool: 'Cagnotte',
                status: 'Statut',
                joinTournament: 'Rejoindre le Tournoi',
                viewTournament: 'Voir le Tournoi',
                gamesPlayed: 'Jeux Joués',
                winRate: 'Taux de Victoire',
                totalScore: 'Score Total',
                averageScore: 'Score Moyen',
                bestScore: 'Meilleur Score',
                achievements: 'Succès',
                rank: 'Rang',
                level: 'Niveau',
                experience: 'Expérience',
                coins: 'Pièces',
                streaks: 'Séries',
                detailed: 'Détaillé',
                summary: 'Résumé',
                recent: 'Récent',
                allTime: 'Tous les Temps',
                week: 'Cette Semaine',
                month: 'Ce Mois',
                year: 'Cette Année'
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

    // =================== MISSING UI 1: ACHIEVEMENT GALLERY ===================
    async createAchievementGallery(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="achievement-gallery">
                <div class="gallery-header">
                    <h2 class="gallery-title">
                        <i class="fas fa-trophy"></i>
                        ${this.t('achievementGallery')}
                    </h2>
                    
                    <div class="gallery-stats">
                        <div class="stat-card">
                            <div class="stat-number" id="total-achievements">0</div>
                            <div class="stat-label">${this.t('achievements')}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="unlocked-achievements">0</div>
                            <div class="stat-label">Unlocked</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="completion-percentage">0%</div>
                            <div class="stat-label">Complete</div>
                        </div>
                    </div>
                </div>

                <div class="gallery-controls">
                    <div class="control-group">
                        <label>${this.t('filterBy')}:</label>
                        <select id="achievement-filter" class="control-select">
                            <option value="all">All Categories</option>
                            <option value="social">Social</option>
                            <option value="gaming">Gaming</option>
                            <option value="dating">Dating</option>
                            <option value="streaming">Streaming</option>
                            <option value="marketplace">Marketplace</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label>${this.t('rarity')}:</label>
                        <select id="rarity-filter" class="control-select">
                            <option value="all">All Rarities</option>
                            <option value="common">Common</option>
                            <option value="rare">Rare</option>
                            <option value="epic">Epic</option>
                            <option value="legendary">Legendary</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label>${this.t('sortBy')}:</label>
                        <select id="achievement-sort" class="control-select">
                            <option value="recent">${this.t('dateUnlocked')}</option>
                            <option value="rarity">${this.t('rarity')}</option>
                            <option value="category">${this.t('category')}</option>
                            <option value="points">Points</option>
                        </select>
                    </div>
                    
                    <div class="view-toggle">
                        <button class="toggle-btn active" data-view="grid">
                            <i class="fas fa-th"></i>
                        </button>
                        <button class="toggle-btn" data-view="list">
                            <i class="fas fa-list"></i>
                        </button>
                    </div>
                </div>

                <div class="achievements-container">
                    <div id="achievements-grid" class="achievements-grid active"></div>
                    <div id="achievements-list" class="achievements-list"></div>
                </div>
            </div>
        `;

        this.initializeAchievementGalleryEvents();
        await this.loadAchievements();
        this.renderAchievements();
    }

    initializeAchievementGalleryEvents() {
        // Filter and sort events
        document.getElementById('achievement-filter')?.addEventListener('change', () => this.filterAchievements());
        document.getElementById('rarity-filter')?.addEventListener('change', () => this.filterAchievements());
        document.getElementById('achievement-sort')?.addEventListener('change', () => this.sortAchievements());

        // View toggle events
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.toggle-btn').classList.add('active');
                
                const view = e.target.closest('.toggle-btn').dataset.view;
                this.switchAchievementView(view);
            });
        });
    }

    async loadAchievements() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/gamification/achievements/gallery', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': this.currentLanguage
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.achievements = data.data.achievements;
                this.updateAchievementStats(data.data.stats);
            }
        } catch (error) {
            console.error('Error loading achievements:', error);
        }
    }

    updateAchievementStats(stats) {
        document.getElementById('total-achievements').textContent = stats.total || 0;
        document.getElementById('unlocked-achievements').textContent = stats.unlocked || 0;
        document.getElementById('completion-percentage').textContent = 
            Math.round((stats.unlocked / stats.total) * 100) + '%' || '0%';
    }

    renderAchievements() {
        const gridContainer = document.getElementById('achievements-grid');
        const listContainer = document.getElementById('achievements-list');
        
        if (!gridContainer || !listContainer) return;

        // Grid view
        gridContainer.innerHTML = this.achievements.map(achievement => `
            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}" 
                 data-rarity="${achievement.rarity}"
                 data-category="${achievement.category}"
                 onclick="gamingMissingUI.showAchievementDetail('${achievement.id}')">
                <div class="achievement-rarity-badge rarity-${achievement.rarity}">
                    ${achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                </div>
                
                <div class="achievement-icon-container">
                    <div class="achievement-icon ${!achievement.unlocked ? 'locked' : ''}">
                        ${achievement.unlocked ? achievement.icon : '🔒'}
                    </div>
                    ${achievement.unlocked ? `<div class="unlock-date">${new Date(achievement.unlockedAt).toLocaleDateString()}</div>` : ''}
                </div>
                
                <div class="achievement-info">
                    <h3 class="achievement-name">${achievement.unlocked ? achievement.name : '???'}</h3>
                    <p class="achievement-description">${achievement.unlocked ? achievement.description : 'Hidden Achievement'}</p>
                    
                    <div class="achievement-details">
                        <span class="achievement-points">+${achievement.points} points</span>
                        <span class="achievement-category">${achievement.category}</span>
                    </div>
                    
                    ${!achievement.unlocked && achievement.hint ? 
                        `<div class="achievement-hint">Hint: ${achievement.hint}</div>` : ''}
                    
                    ${achievement.progress ? 
                        `<div class="achievement-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(achievement.progress.current / achievement.progress.total) * 100}%"></div>
                            </div>
                            <span class="progress-text">${achievement.progress.current}/${achievement.progress.total}</span>
                        </div>` : ''}
                </div>
            </div>
        `).join('');

        // List view
        listContainer.innerHTML = this.achievements.map(achievement => `
            <div class="achievement-list-item ${achievement.unlocked ? 'unlocked' : 'locked'}" 
                 data-rarity="${achievement.rarity}"
                 data-category="${achievement.category}"
                 onclick="gamingMissingUI.showAchievementDetail('${achievement.id}')">
                <div class="achievement-list-icon">
                    ${achievement.unlocked ? achievement.icon : '🔒'}
                </div>
                <div class="achievement-list-info">
                    <div class="achievement-list-header">
                        <h3 class="achievement-name">${achievement.unlocked ? achievement.name : 'Hidden Achievement'}</h3>
                        <div class="achievement-meta">
                            <span class="rarity rarity-${achievement.rarity}">${achievement.rarity}</span>
                            <span class="points">+${achievement.points} pts</span>
                            ${achievement.unlocked ? `<span class="unlock-date">${new Date(achievement.unlockedAt).toLocaleDateString()}</span>` : ''}
                        </div>
                    </div>
                    <p class="achievement-description">${achievement.unlocked ? achievement.description : 'Complete specific tasks to unlock this achievement'}</p>
                    ${achievement.progress ? 
                        `<div class="achievement-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(achievement.progress.current / achievement.progress.total) * 100}%"></div>
                            </div>
                            <span class="progress-text">${achievement.progress.current}/${achievement.progress.total}</span>
                        </div>` : ''}
                </div>
            </div>
        `).join('');
    }

    // =================== MISSING UI 2: DAILY CHALLENGES INTERFACE ===================
    async createDailyChallengesInterface(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="daily-challenges-interface">
                <div class="challenges-header">
                    <h2 class="challenges-title">
                        <i class="fas fa-calendar-check"></i>
                        ${this.t('dailyChallenges')}
                    </h2>
                    
                    <div class="daily-streak">
                        <div class="streak-display">
                            <div class="streak-number" id="current-streak">0</div>
                            <div class="streak-label">Day Streak</div>
                        </div>
                        <div class="streak-calendar">
                            <div class="calendar-week" id="streak-calendar"></div>
                        </div>
                    </div>
                </div>

                <div class="challenges-stats">
                    <div class="stat-card">
                        <i class="fas fa-tasks"></i>
                        <div class="stat-info">
                            <div class="stat-number" id="completed-today">0</div>
                            <div class="stat-label">Completed Today</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-coins"></i>
                        <div class="stat-info">
                            <div class="stat-number" id="points-earned-today">0</div>
                            <div class="stat-label">Points Today</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-clock"></i>
                        <div class="stat-info">
                            <div class="stat-number" id="time-remaining">24h</div>
                            <div class="stat-label">Time Remaining</div>
                        </div>
                    </div>
                </div>

                <div class="challenges-filters">
                    <div class="filter-group">
                        <label>${this.t('difficulty')}:</label>
                        <select id="difficulty-filter" class="control-select">
                            <option value="all">All Difficulties</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>${this.t('category')}:</label>
                        <select id="challenge-category-filter" class="control-select">
                            <option value="all">All Categories</option>
                            <option value="social">Social</option>
                            <option value="gaming">Gaming</option>
                            <option value="streaming">Streaming</option>
                            <option value="fitness">Fitness</option>
                        </select>
                    </div>
                </div>

                <div class="challenges-container">
                    <div class="challenge-sections">
                        <div class="challenge-section">
                            <h3>Active Challenges</h3>
                            <div id="active-challenges" class="challenges-grid"></div>
                        </div>
                        
                        <div class="challenge-section">
                            <h3>Completed Today</h3>
                            <div id="completed-challenges" class="challenges-grid"></div>
                        </div>
                        
                        <div class="challenge-section">
                            <h3>Bonus Challenges</h3>
                            <div id="bonus-challenges" class="challenges-grid"></div>
                        </div>
                    </div>
                </div>

                <div class="challenge-rewards">
                    <h3>Daily Completion Rewards</h3>
                    <div class="rewards-track">
                        <div class="reward-milestone" data-required="3">
                            <div class="milestone-icon">🥉</div>
                            <div class="milestone-reward">+50 coins</div>
                            <div class="milestone-label">3 challenges</div>
                        </div>
                        <div class="reward-milestone" data-required="5">
                            <div class="milestone-icon">🥈</div>
                            <div class="milestone-reward">+100 coins</div>
                            <div class="milestone-label">5 challenges</div>
                        </div>
                        <div class="reward-milestone" data-required="8">
                            <div class="milestone-icon">🥇</div>
                            <div class="milestone-reward">+200 coins</div>
                            <div class="milestone-label">8 challenges</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initializeDailyChallengesEvents();
        await this.loadDailyChallenges();
        this.renderDailyChallenges();
        this.updateStreakCalendar();
        this.startChallengeTimer();
    }

    initializeDailyChallengesEvents() {
        document.getElementById('difficulty-filter')?.addEventListener('change', () => this.filterChallenges());
        document.getElementById('challenge-category-filter')?.addEventListener('change', () => this.filterChallenges());
    }

    async loadDailyChallenges() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/gamification/challenges/daily-detailed', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': this.currentLanguage
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.dailyChallenges = data.data.challenges;
                this.updateChallengeStats(data.data.stats);
            }
        } catch (error) {
            console.error('Error loading daily challenges:', error);
        }
    }

    updateChallengeStats(stats) {
        document.getElementById('current-streak').textContent = stats.streak || 0;
        document.getElementById('completed-today').textContent = stats.completedToday || 0;
        document.getElementById('points-earned-today').textContent = stats.pointsToday || 0;
    }

    renderDailyChallenges() {
        const activeChallenges = this.dailyChallenges.filter(c => !c.completed);
        const completedChallenges = this.dailyChallenges.filter(c => c.completed);
        const bonusChallenges = this.dailyChallenges.filter(c => c.type === 'bonus');

        this.renderChallengeSection('active-challenges', activeChallenges);
        this.renderChallengeSection('completed-challenges', completedChallenges);
        this.renderChallengeSection('bonus-challenges', bonusChallenges);
        this.updateRewardTrack();
    }

    renderChallengeSection(containerId, challenges) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = challenges.map(challenge => `
            <div class="challenge-card ${challenge.completed ? 'completed' : ''}" 
                 data-difficulty="${challenge.difficulty}"
                 data-category="${challenge.category}">
                <div class="challenge-header">
                    <div class="challenge-icon">${challenge.icon}</div>
                    <div class="challenge-difficulty difficulty-${challenge.difficulty}">
                        ${challenge.difficulty}
                    </div>
                </div>
                
                <div class="challenge-content">
                    <h4 class="challenge-title">${challenge.title}</h4>
                    <p class="challenge-description">${challenge.description}</p>
                    
                    <div class="challenge-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(challenge.progress / challenge.target) * 100}%"></div>
                        </div>
                        <span class="progress-text">${challenge.progress}/${challenge.target}</span>
                    </div>
                    
                    <div class="challenge-reward">
                        <i class="fas fa-coins"></i>
                        +${challenge.reward} coins
                        ${challenge.bonusXP ? `<i class="fas fa-star"></i> +${challenge.bonusXP} XP` : ''}
                    </div>
                </div>
                
                <div class="challenge-actions">
                    ${challenge.completed ? 
                        `<span class="completion-badge">✓ Completed</span>` :
                        `<button class="challenge-btn" onclick="gamingMissingUI.startChallenge('${challenge.id}')">
                            ${challenge.inProgress ? 'Continue' : 'Start Challenge'}
                        </button>`
                    }
                </div>
            </div>
        `).join('');
    }

    // =================== MISSING UI 3: TOURNAMENT SYSTEM ===================
    async createTournamentSystem(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="tournament-system">
                <div class="tournament-header">
                    <h2 class="tournament-title">
                        <i class="fas fa-trophy"></i>
                        ${this.t('tournaments')}
                    </h2>
                    
                    <div class="tournament-user-stats">
                        <div class="user-rank">
                            <div class="rank-number" id="user-tournament-rank">#0</div>
                            <div class="rank-label">Global Rank</div>
                        </div>
                        <div class="user-tournaments-won">
                            <div class="won-number" id="tournaments-won">0</div>
                            <div class="won-label">Tournaments Won</div>
                        </div>
                    </div>
                </div>

                <div class="tournament-tabs">
                    <button class="tournament-tab active" data-tab="active">Active Tournaments</button>
                    <button class="tournament-tab" data-tab="upcoming">Upcoming</button>
                    <button class="tournament-tab" data-tab="my-tournaments">My Tournaments</button>
                    <button class="tournament-tab" data-tab="completed">Completed</button>
                </div>

                <div class="tournament-filters">
                    <div class="filter-group">
                        <label>Game Type:</label>
                        <select id="tournament-game-filter" class="control-select">
                            <option value="all">All Games</option>
                            <option value="tic-tac-toe">Tic Tac Toe</option>
                            <option value="memory">Memory Game</option>
                            <option value="quiz">Quiz Challenge</option>
                            <option value="word-game">Word Games</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Entry Fee:</label>
                        <select id="tournament-fee-filter" class="control-select">
                            <option value="all">All Fees</option>
                            <option value="free">Free</option>
                            <option value="low">Low (1-50 coins)</option>
                            <option value="medium">Medium (51-200 coins)</option>
                            <option value="high">High (200+ coins)</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>${this.t('sortBy')}:</label>
                        <select id="tournament-sort" class="control-select">
                            <option value="starting-soon">Starting Soon</option>
                            <option value="prize-pool">Prize Pool</option>
                            <option value="participants">${this.t('participants')}</option>
                            <option value="entry-fee">Entry Fee</option>
                        </select>
                    </div>
                </div>

                <div class="tournament-content">
                    <div id="active-tournaments" class="tournament-tab-content active">
                        <div class="tournaments-grid" id="active-tournaments-grid"></div>
                    </div>
                    
                    <div id="upcoming-tournaments" class="tournament-tab-content">
                        <div class="tournaments-grid" id="upcoming-tournaments-grid"></div>
                    </div>
                    
                    <div id="my-tournaments" class="tournament-tab-content">
                        <div class="tournaments-grid" id="my-tournaments-grid"></div>
                    </div>
                    
                    <div id="completed-tournaments" class="tournament-tab-content">
                        <div class="tournaments-grid" id="completed-tournaments-grid"></div>
                    </div>
                </div>

                <div class="create-tournament-section">
                    <h3>Create Your Own Tournament</h3>
                    <button class="create-tournament-btn" onclick="gamingMissingUI.showCreateTournamentModal()">
                        <i class="fas fa-plus"></i>
                        Create Tournament
                    </button>
                </div>
            </div>
        `;

        this.initializeTournamentEvents();
        await this.loadTournaments();
        this.renderTournaments();
    }

    initializeTournamentEvents() {
        // Tab switching
        document.querySelectorAll('.tournament-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.tournament-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tournament-tab-content').forEach(c => c.classList.remove('active'));
                
                e.target.classList.add('active');
                document.getElementById(`${e.target.dataset.tab}-tournaments`).classList.add('active');
                
                this.loadTournamentTab(e.target.dataset.tab);
            });
        });

        // Filters
        document.getElementById('tournament-game-filter')?.addEventListener('change', () => this.filterTournaments());
        document.getElementById('tournament-fee-filter')?.addEventListener('change', () => this.filterTournaments());
        document.getElementById('tournament-sort')?.addEventListener('change', () => this.sortTournaments());
    }

    async loadTournaments() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/gamification/tournaments', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': this.currentLanguage
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.tournaments = data.data.tournaments;
                this.updateTournamentUserStats(data.data.userStats);
            }
        } catch (error) {
            console.error('Error loading tournaments:', error);
        }
    }

    updateTournamentUserStats(userStats) {
        document.getElementById('user-tournament-rank').textContent = `#${userStats.globalRank || 0}`;
        document.getElementById('tournaments-won').textContent = userStats.tournamentsWon || 0;
    }

    renderTournaments() {
        const activeTournaments = this.tournaments.filter(t => t.status === 'active');
        const upcomingTournaments = this.tournaments.filter(t => t.status === 'upcoming');
        const myTournaments = this.tournaments.filter(t => t.isParticipating);
        const completedTournaments = this.tournaments.filter(t => t.status === 'completed');

        this.renderTournamentGrid('active-tournaments-grid', activeTournaments);
        this.renderTournamentGrid('upcoming-tournaments-grid', upcomingTournaments);
        this.renderTournamentGrid('my-tournaments-grid', myTournaments);
        this.renderTournamentGrid('completed-tournaments-grid', completedTournaments);
    }

    renderTournamentGrid(containerId, tournaments) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = tournaments.map(tournament => `
            <div class="tournament-card ${tournament.status}" data-game="${tournament.gameType}">
                <div class="tournament-header">
                    <div class="tournament-game-icon">${tournament.gameIcon}</div>
                    <div class="tournament-status status-${tournament.status}">
                        ${tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                    </div>
                </div>
                
                <div class="tournament-info">
                    <h3 class="tournament-name">${tournament.name}</h3>
                    <p class="tournament-description">${tournament.description}</p>
                    
                    <div class="tournament-details">
                        <div class="detail-item">
                            <i class="fas fa-users"></i>
                            <span>${tournament.currentParticipants}/${tournament.maxParticipants}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-coins"></i>
                            <span>${tournament.entryFee > 0 ? tournament.entryFee + ' coins' : 'Free'}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-trophy"></i>
                            <span>${tournament.prizePool} coins</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <span>${this.formatTimeRemaining(tournament.startTime)}</span>
                        </div>
                    </div>
                    
                    <div class="tournament-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(tournament.currentParticipants / tournament.maxParticipants) * 100}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="tournament-actions">
                    ${tournament.isParticipating ? 
                        `<button class="tournament-btn participating" onclick="gamingMissingUI.viewTournament('${tournament.id}')">
                            ${this.t('viewTournament')}
                        </button>` :
                        `<button class="tournament-btn join" onclick="gamingMissingUI.joinTournament('${tournament.id}')" 
                                ${tournament.currentParticipants >= tournament.maxParticipants ? 'disabled' : ''}>
                            ${this.t('joinTournament')}
                        </button>`
                    }
                </div>
            </div>
        `).join('');
    }

    // =================== MISSING UI 4: GAME HISTORY/STATS DETAIL ===================
    async createGameHistoryStats(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="game-history-stats">
                <div class="stats-header">
                    <h2 class="stats-title">
                        <i class="fas fa-chart-bar"></i>
                        ${this.t('gameHistory')}
                    </h2>
                    
                    <div class="stats-period-selector">
                        <button class="period-btn active" data-period="week">${this.t('week')}</button>
                        <button class="period-btn" data-period="month">${this.t('month')}</button>
                        <button class="period-btn" data-period="year">${this.t('year')}</button>
                        <button class="period-btn" data-period="all">${this.t('allTime')}</button>
                    </div>
                </div>

                <div class="stats-overview">
                    <div class="overview-card">
                        <div class="card-icon">🎮</div>
                        <div class="card-info">
                            <div class="card-number" id="total-games-played">0</div>
                            <div class="card-label">${this.t('gamesPlayed')}</div>
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <div class="card-icon">📊</div>
                        <div class="card-info">
                            <div class="card-number" id="overall-win-rate">0%</div>
                            <div class="card-label">${this.t('winRate')}</div>
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <div class="card-icon">⭐</div>
                        <div class="card-info">
                            <div class="card-number" id="total-points-earned">0</div>
                            <div class="card-label">Points Earned</div>
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <div class="card-icon">🏆</div>
                        <div class="card-info">
                            <div class="card-number" id="current-rank">0</div>
                            <div class="card-label">Current Rank</div>
                        </div>
                    </div>
                </div>

                <div class="stats-tabs">
                    <button class="stats-tab active" data-tab="summary">${this.t('summary')}</button>
                    <button class="stats-tab" data-tab="detailed">${this.t('detailed')}</button>
                    <button class="stats-tab" data-tab="history">Game History</button>
                    <button class="stats-tab" data-tab="achievements">Recent Achievements</button>
                </div>

                <div class="stats-content">
                    <div id="summary-stats" class="stats-tab-content active">
                        <div class="summary-grid">
                            <div class="summary-section">
                                <h3>Game Performance</h3>
                                <div class="performance-chart">
                                    <canvas id="performance-chart" width="300" height="200"></canvas>
                                </div>
                            </div>
                            
                            <div class="summary-section">
                                <h3>Game Breakdown</h3>
                                <div class="game-stats" id="game-breakdown"></div>
                            </div>
                            
                            <div class="summary-section">
                                <h3>Recent Activity</h3>
                                <div class="activity-timeline" id="recent-activity"></div>
                            </div>
                            
                            <div class="summary-section">
                                <h3>Streaks & Milestones</h3>
                                <div class="streaks-display" id="streaks-milestones"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="detailed-stats" class="stats-tab-content">
                        <div class="detailed-filters">
                            <select id="game-type-filter" class="control-select">
                                <option value="all">All Games</option>
                                <option value="tic-tac-toe">Tic Tac Toe</option>
                                <option value="memory">Memory Game</option>
                                <option value="quiz">Quiz Challenge</option>
                            </select>
                        </div>
                        
                        <div class="detailed-stats-grid" id="detailed-stats-grid"></div>
                    </div>
                    
                    <div id="history-stats" class="stats-tab-content">
                        <div class="history-filters">
                            <select id="history-game-filter" class="control-select">
                                <option value="all">All Games</option>
                                <option value="tic-tac-toe">Tic Tac Toe</option>
                                <option value="memory">Memory Game</option>
                                <option value="quiz">Quiz Challenge</option>
                            </select>
                            <select id="history-result-filter" class="control-select">
                                <option value="all">All Results</option>
                                <option value="win">Wins Only</option>
                                <option value="loss">Losses Only</option>
                                <option value="draw">Draws Only</option>
                            </select>
                        </div>
                        
                        <div class="game-history-list" id="game-history-list"></div>
                    </div>
                    
                    <div id="achievements-stats" class="stats-tab-content">
                        <div class="recent-achievements" id="recent-achievements-list"></div>
                    </div>
                </div>
            </div>
        `;

        this.initializeGameHistoryEvents();
        await this.loadGameHistory();
        this.renderGameHistory();
    }

    initializeGameHistoryEvents() {
        // Period selector
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadGameHistoryPeriod(e.target.dataset.period);
            });
        });

        // Stats tabs
        document.querySelectorAll('.stats-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.stats-tab-content').forEach(c => c.classList.remove('active'));
                
                e.target.classList.add('active');
                document.getElementById(`${e.target.dataset.tab}-stats`).classList.add('active');
                
                this.loadStatsTab(e.target.dataset.tab);
            });
        });

        // Filters
        document.getElementById('game-type-filter')?.addEventListener('change', () => this.filterDetailedStats());
        document.getElementById('history-game-filter')?.addEventListener('change', () => this.filterGameHistory());
        document.getElementById('history-result-filter')?.addEventListener('change', () => this.filterGameHistory());
    }

    async loadGameHistory() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/gamification/history/detailed', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': this.currentLanguage
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.gameHistory = data.data.history;
                this.playerStats = data.data.stats;
                this.updateOverviewStats(data.data.overview);
            }
        } catch (error) {
            console.error('Error loading game history:', error);
        }
    }

    updateOverviewStats(overview) {
        document.getElementById('total-games-played').textContent = overview.totalGames || 0;
        document.getElementById('overall-win-rate').textContent = (overview.winRate || 0) + '%';
        document.getElementById('total-points-earned').textContent = (overview.totalPoints || 0).toLocaleString();
        document.getElementById('current-rank').textContent = '#' + (overview.currentRank || 0);
    }

    renderGameHistory() {
        this.renderSummaryStats();
        this.renderDetailedStats();
        this.renderHistoryList();
        this.renderRecentAchievements();
    }

    renderSummaryStats() {
        // Game breakdown
        const gameBreakdown = document.getElementById('game-breakdown');
        if (gameBreakdown && this.playerStats.gameStats) {
            gameBreakdown.innerHTML = Object.entries(this.playerStats.gameStats).map(([game, stats]) => `
                <div class="game-stat-item">
                    <div class="game-name">${game}</div>
                    <div class="game-metrics">
                        <span class="metric">Games: ${stats.played}</span>
                        <span class="metric">Wins: ${stats.wins}</span>
                        <span class="metric">Win Rate: ${Math.round((stats.wins / stats.played) * 100)}%</span>
                        <span class="metric">Best Score: ${stats.bestScore}</span>
                    </div>
                </div>
            `).join('');
        }

        // Recent activity
        const recentActivity = document.getElementById('recent-activity');
        if (recentActivity && this.gameHistory.length > 0) {
            recentActivity.innerHTML = this.gameHistory.slice(0, 5).map(game => `
                <div class="activity-item">
                    <div class="activity-time">${new Date(game.playedAt).toLocaleDateString()}</div>
                    <div class="activity-game">${game.gameType}</div>
                    <div class="activity-result result-${game.result}">${game.result}</div>
                    <div class="activity-score">+${game.pointsEarned} pts</div>
                </div>
            `).join('');
        }

        // Streaks and milestones
        const streaksMilestones = document.getElementById('streaks-milestones');
        if (streaksMilestones && this.playerStats.streaks) {
            streaksMilestones.innerHTML = `
                <div class="streak-item">
                    <div class="streak-label">Current Win Streak</div>
                    <div class="streak-value">${this.playerStats.streaks.currentWinStreak}</div>
                </div>
                <div class="streak-item">
                    <div class="streak-label">Best Win Streak</div>
                    <div class="streak-value">${this.playerStats.streaks.bestWinStreak}</div>
                </div>
                <div class="streak-item">
                    <div class="streak-label">Daily Play Streak</div>
                    <div class="streak-value">${this.playerStats.streaks.dailyPlayStreak}</div>
                </div>
            `;
        }
    }

    renderDetailedStats() {
        const detailedGrid = document.getElementById('detailed-stats-grid');
        if (!detailedGrid || !this.playerStats.gameStats) return;

        detailedGrid.innerHTML = Object.entries(this.playerStats.gameStats).map(([game, stats]) => `
            <div class="detailed-game-card">
                <h3 class="game-title">${game}</h3>
                
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">${this.t('gamesPlayed')}</div>
                        <div class="stat-value">${stats.played}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Wins</div>
                        <div class="stat-value">${stats.wins}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Losses</div>
                        <div class="stat-value">${stats.losses}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Draws</div>
                        <div class="stat-value">${stats.draws || 0}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">${this.t('winRate')}</div>
                        <div class="stat-value">${Math.round((stats.wins / stats.played) * 100)}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">${this.t('averageScore')}</div>
                        <div class="stat-value">${Math.round(stats.totalScore / stats.played)}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">${this.t('bestScore')}</div>
                        <div class="stat-value">${stats.bestScore}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Total Points</div>
                        <div class="stat-value">${stats.totalPoints}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderHistoryList() {
        const historyList = document.getElementById('game-history-list');
        if (!historyList) return;

        historyList.innerHTML = this.gameHistory.map(game => `
            <div class="history-item" onclick="gamingMissingUI.showGameDetail('${game.id}')">
                <div class="history-game">
                    <div class="game-icon">${this.getGameIcon(game.gameType)}</div>
                    <div class="game-info">
                        <div class="game-name">${game.gameType}</div>
                        <div class="game-date">${new Date(game.playedAt).toLocaleString()}</div>
                    </div>
                </div>
                
                <div class="history-result">
                    <div class="result-badge result-${game.result}">${game.result}</div>
                    <div class="result-score">Score: ${game.score}</div>
                </div>
                
                <div class="history-stats">
                    <div class="stat">Duration: ${game.duration || 'N/A'}</div>
                    <div class="stat">Points: +${game.pointsEarned}</div>
                    ${game.opponentName ? `<div class="stat">vs ${game.opponentName}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    renderRecentAchievements() {
        const achievementsList = document.getElementById('recent-achievements-list');
        if (!achievementsList) return;

        const recentAchievements = this.achievements.filter(a => a.unlocked && a.unlockedAt)
            .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
            .slice(0, 10);

        achievementsList.innerHTML = recentAchievements.map(achievement => `
            <div class="recent-achievement-item" onclick="gamingMissingUI.showAchievementDetail('${achievement.id}')">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    <div class="achievement-date">Unlocked: ${new Date(achievement.unlockedAt).toLocaleDateString()}</div>
                </div>
                <div class="achievement-points">+${achievement.points} pts</div>
            </div>
        `).join('');
    }

    // =================== UTILITY FUNCTIONS ===================
    formatTimeRemaining(targetTime) {
        const now = new Date();
        const target = new Date(targetTime);
        const diff = target - now;

        if (diff <= 0) return 'Started';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }
        return `${hours}h ${minutes}m`;
    }

    getGameIcon(gameType) {
        const icons = {
            'tic-tac-toe': '❌',
            'memory': '🧠',
            'quiz': '❓',
            'word-game': '📝'
        };
        return icons[gameType] || '🎮';
    }

    // =================== EVENT HANDLERS ===================
    async startChallenge(challengeId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/v1/gamification/challenges/${challengeId}/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': this.currentLanguage
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.showNotification('Challenge started!', 'success');
                await this.loadDailyChallenges();
                this.renderDailyChallenges();
            }
        } catch (error) {
            console.error('Error starting challenge:', error);
        }
    }

    async joinTournament(tournamentId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/v1/gamification/tournaments/${tournamentId}/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': this.currentLanguage
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.showNotification('Successfully joined tournament!', 'success');
                await this.loadTournaments();
                this.renderTournaments();
            }
        } catch (error) {
            console.error('Error joining tournament:', error);
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
        if (document.getElementById('achievement-gallery')) {
            this.renderAchievements();
        }
        if (document.getElementById('daily-challenges-interface')) {
            this.renderDailyChallenges();
        }
        if (document.getElementById('tournament-system')) {
            this.renderTournaments();
        }
        if (document.getElementById('game-history-stats')) {
            this.renderGameHistory();
        }
    }
}

// Initialize gaming missing UI components
let gamingMissingUI;
document.addEventListener('DOMContentLoaded', () => {
    gamingMissingUI = new GamingMissingUIComponents();
});

// Export for global access
window.gamingMissingUI = gamingMissingUI;
