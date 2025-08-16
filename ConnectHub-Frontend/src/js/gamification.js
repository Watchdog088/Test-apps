// Gamification System for ConnectHub Frontend
class GamificationSystem {
    constructor() {
        this.userStats = null;
        this.achievements = [];
        this.dailyChallenges = [];
        this.leaderboard = [];
        this.rewards = [];
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {};
        
        this.init();
    }

    async init() {
        await this.loadTranslations();
        this.initializeEventListeners();
        this.createGamificationUI();
    }

    async loadTranslations() {
        // Basic translations for frontend
        this.translations = {
            en: {
                level: 'Level',
                points: 'Points',
                achievements: 'Achievements',
                dailyChallenges: 'Daily Challenges',
                leaderboard: 'Leaderboard',
                rewards: 'Rewards',
                streak: 'Day Streak',
                progress: 'Progress',
                redeem: 'Redeem',
                complete: 'Complete',
                locked: 'Locked',
                unlocked: 'Unlocked'
            },
            es: {
                level: 'Nivel',
                points: 'Puntos',
                achievements: 'Logros',
                dailyChallenges: 'Desafíos Diarios',
                leaderboard: 'Tabla de Posiciones',
                rewards: 'Recompensas',
                streak: 'Días Consecutivos',
                progress: 'Progreso',
                redeem: 'Canjear',
                complete: 'Completar',
                locked: 'Bloqueado',
                unlocked: 'Desbloqueado'
            },
            fr: {
                level: 'Niveau',
                points: 'Points',
                achievements: 'Succès',
                dailyChallenges: 'Défis Quotidiens',
                leaderboard: 'Classement',
                rewards: 'Récompenses',
                streak: 'Série de Jours',
                progress: 'Progrès',
                redeem: 'Échanger',
                complete: 'Terminer',
                locked: 'Verrouillé',
                unlocked: 'Déverrouillé'
            }
        };
    }

    t(key) {
        return this.translations[this.currentLanguage]?.[key] || this.translations.en[key] || key;
    }

    initializeEventListeners() {
        document.addEventListener('userAction', (event) => {
            this.handleUserAction(event.detail);
        });

        // Language change listener
        document.addEventListener('languageChanged', (event) => {
            this.currentLanguage = event.detail.language;
            this.refreshUI();
        });
    }

    createGamificationUI() {
        // Create gamification panel in sidebar
        const sidebar = document.querySelector('.sidebar') || document.querySelector('.left-panel');
        if (!sidebar) return;

        const gamificationPanel = document.createElement('div');
        gamificationPanel.className = 'gamification-panel';
        gamificationPanel.innerHTML = `
            <div class="user-progress">
                <div class="level-info">
                    <span class="level-badge">🏆 ${this.t('level')} <span id="user-level">1</span></span>
                    <span class="points-badge">⭐ <span id="user-points">0</span> ${this.t('points')}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="level-progress" style="width: 0%"></div>
                </div>
                <div class="streak-info">
                    <span class="streak-badge">🔥 <span id="user-streak">0</span> ${this.t('streak')}</span>
                </div>
            </div>

            <div class="gamification-tabs">
                <button class="tab-btn active" data-tab="challenges">${this.t('dailyChallenges')}</button>
                <button class="tab-btn" data-tab="achievements">${this.t('achievements')}</button>
                <button class="tab-btn" data-tab="rewards">${this.t('rewards')}</button>
            </div>

            <div class="tab-content">
                <div id="challenges-tab" class="tab-pane active">
                    <div id="daily-challenges"></div>
                </div>
                <div id="achievements-tab" class="tab-pane">
                    <div id="achievements-list"></div>
                </div>
                <div id="rewards-tab" class="tab-pane">
                    <div id="rewards-list"></div>
                </div>
            </div>
        `;

        sidebar.appendChild(gamificationPanel);
        this.initializeTabSwitching();
        this.loadUserStats();
    }

    initializeTabSwitching() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all tabs and panes
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));

                // Add active class to clicked tab and corresponding pane
                btn.classList.add('active');
                const tabName = btn.dataset.tab;
                document.getElementById(`${tabName}-tab`).classList.add('active');

                // Load content for the active tab
                this.loadTabContent(tabName);
            });
        });
    }

    async loadUserStats() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/v1/gamification/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': this.currentLanguage
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.userStats = data.data;
                this.updateUserStatsUI();
                this.loadDailyChallenges();
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    }

    updateUserStatsUI() {
        if (!this.userStats) return;

        document.getElementById('user-level').textContent = this.userStats.level;
        document.getElementById('user-points').textContent = this.userStats.totalPoints.toLocaleString();
        document.getElementById('user-streak').textContent = this.userStats.currentStreak;

        // Update progress bar
        const progressBar = document.getElementById('level-progress');
        const progressPercent = ((this.userStats.totalPoints - this.getPreviousLevelPoints(this.userStats.level)) / 
                                (this.getNextLevelPoints(this.userStats.level) - this.getPreviousLevelPoints(this.userStats.level))) * 100;
        progressBar.style.width = `${Math.min(progressPercent, 100)}%`;
    }

    getPreviousLevelPoints(level) {
        return Math.pow(level - 1, 2) * 100;
    }

    getNextLevelPoints(level) {
        return Math.pow(level, 2) * 100;
    }

    async loadTabContent(tabName) {
        switch (tabName) {
            case 'challenges':
                await this.loadDailyChallenges();
                break;
            case 'achievements':
                await this.loadAchievements();
                break;
            case 'rewards':
                await this.loadRewards();
                break;
        }
    }

    async loadDailyChallenges() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/v1/gamification/challenges/daily', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': this.currentLanguage
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.dailyChallenges = data.data;
                this.renderDailyChallenges();
            }
        } catch (error) {
            console.error('Error loading daily challenges:', error);
        }
    }

    renderDailyChallenges() {
        const container = document.getElementById('daily-challenges');
        if (!container) return;

        container.innerHTML = this.dailyChallenges.map(challenge => `
            <div class="challenge-item ${challenge.completed ? 'completed' : ''}" data-challenge-id="${challenge.id}">
                <div class="challenge-icon">${challenge.icon}</div>
                <div class="challenge-info">
                    <div class="challenge-description">${challenge.description}</div>
                    <div class="challenge-progress">
                        <div class="progress-bar small">
                            <div class="progress-fill" style="width: ${(challenge.progress || 0) / challenge.target * 100}%"></div>
                        </div>
                        <span class="progress-text">${challenge.progress || 0}/${challenge.target}</span>
                    </div>
                    <div class="challenge-reward">+${challenge.points} ${this.t('points')}</div>
                </div>
                ${challenge.completed ? 
                    `<span class="status completed">${this.t('complete')}</span>` :
                    `<button class="complete-btn" onclick="gamification.completeChallenge('${challenge.id}')">${this.t('complete')}</button>`
                }
            </div>
        `).join('');
    }

    async loadAchievements() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/v1/gamification/achievements', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': this.currentLanguage
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.achievements = data.data;
                this.renderAchievements();
            }
        } catch (error) {
            console.error('Error loading achievements:', error);
        }
    }

    renderAchievements() {
        const container = document.getElementById('achievements-list');
        if (!container) return;

        // Group achievements by category
        const categories = {};
        this.achievements.forEach(achievement => {
            if (!categories[achievement.category]) {
                categories[achievement.category] = [];
            }
            categories[achievement.category].push(achievement);
        });

        container.innerHTML = Object.entries(categories).map(([category, achievements]) => `
            <div class="achievement-category">
                <h3 class="category-title">${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                <div class="achievements-grid">
                    ${achievements.map(achievement => `
                        <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}" 
                             data-rarity="${achievement.rarity}">
                            <div class="achievement-icon">${achievement.icon}</div>
                            <div class="achievement-info">
                                <div class="achievement-name">${achievement.name}</div>
                                <div class="achievement-description">${achievement.description}</div>
                                <div class="achievement-points">+${achievement.points} ${this.t('points')}</div>
                            </div>
                            <div class="achievement-status ${achievement.unlocked ? 'unlocked' : 'locked'}">
                                ${achievement.unlocked ? this.t('unlocked') : this.t('locked')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    async loadRewards() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/v1/gamification/rewards', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': this.currentLanguage
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.rewards = data.data;
                this.renderRewards();
            }
        } catch (error) {
            console.error('Error loading rewards:', error);
        }
    }

    renderRewards() {
        const container = document.getElementById('rewards-list');
        if (!container) return;

        container.innerHTML = this.rewards.map(reward => `
            <div class="reward-item" data-rarity="${reward.rarity}">
                <div class="reward-icon">${reward.icon}</div>
                <div class="reward-info">
                    <div class="reward-name">${reward.name}</div>
                    <div class="reward-description">${reward.description}</div>
                    <div class="reward-cost">${reward.cost} coins</div>
                </div>
                <button class="redeem-btn" onclick="gamification.redeemReward('${reward.id}')"
                        ${(this.userStats?.coins || 0) < reward.cost ? 'disabled' : ''}>
                    ${this.t('redeem')}
                </button>
            </div>
        `).join('');
    }

    async completeChallenge(challengeId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`/api/v1/gamification/challenges/${challengeId}/complete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': this.currentLanguage
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.showNotification(`Challenge completed! +${data.data.points} points`, 'success');
                await this.loadUserStats();
                await this.loadDailyChallenges();
                this.checkForNewAchievements();
            }
        } catch (error) {
            console.error('Error completing challenge:', error);
            this.showNotification('Failed to complete challenge', 'error');
        }
    }

    async redeemReward(rewardId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`/api/v1/gamification/rewards/${rewardId}/redeem`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': this.currentLanguage
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.showNotification(data.message, 'success');
                await this.loadUserStats();
                await this.loadRewards();
            } else {
                const errorData = await response.json();
                this.showNotification(errorData.error, 'error');
            }
        } catch (error) {
            console.error('Error redeeming reward:', error);
            this.showNotification('Failed to redeem reward', 'error');
        }
    }

    async checkForNewAchievements() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/v1/gamification/check-achievements', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': this.currentLanguage
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data.newAchievements > 0) {
                    data.data.achievements.forEach(achievement => {
                        this.showAchievementUnlocked(achievement);
                    });
                }
            }
        } catch (error) {
            console.error('Error checking achievements:', error);
        }
    }

    showAchievementUnlocked(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-popup">
                <div class="achievement-header">🏆 Achievement Unlocked!</div>
                <div class="achievement-details">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-text">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-points">+${achievement.points} points</div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    handleUserAction(action) {
        // Track user actions for challenges and achievements
        const actions = {
            'post_created': () => this.awardPoints(10, 'Created a post'),
            'like_given': () => this.awardPoints(2, 'Liked a post'),
            'comment_made': () => this.awardPoints(5, 'Made a comment'),
            'match_made': () => this.awardPoints(25, 'Got a match'),
            'message_sent': () => this.awardPoints(3, 'Sent a message')
        };

        if (actions[action.type]) {
            actions[action.type]();
        }
    }

    async awardPoints(points, reason) {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/v1/gamification/award-points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': this.currentLanguage
                },
                body: JSON.stringify({ points, reason })
            });

            if (response.ok) {
                await this.loadUserStats();
                this.checkForNewAchievements();
            }
        } catch (error) {
            console.error('Error awarding points:', error);
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

    refreshUI() {
        // Refresh all UI text when language changes
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
        
        this.loadUserStats();
    }

    async updateStreak() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/v1/gamification/streak/update', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept-Language': this.currentLanguage
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.message) {
                    this.showNotification(data.message, 'success');
                }
                await this.loadUserStats();
            }
        } catch (error) {
            console.error('Error updating streak:', error);
        }
    }
}

// Initialize gamification system
let gamification;
document.addEventListener('DOMContentLoaded', () => {
    gamification = new GamificationSystem();
});

// Export for global access
window.gamification = gamification;
