/**
 * Dating Post-Match Flow Manager
 * Manages the complete flow after users match:
 * 1. Match celebration
 * 2. Dating Assistant (suggests dates based on common interests)
 * 3. Consent Management Interface
 * 4. Navigation to dashboards
 */

class DatingPostMatchFlowManager {
    constructor() {
        this.currentMatch = null;
        this.matchQueue = [];
        this.consentDashboardData = new Map();
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadConsentHistory();
        console.log('Dating Post-Match Flow Manager initialized');
    }

    bindEvents() {
        // Listen for successful swipe matches
        document.addEventListener('datingMatchCreated', (e) => {
            this.handleNewMatch(e.detail);
        });

        // Make profile views clickable
        document.addEventListener('click', (e) => {
            if (e.target.closest('[onclick*="profileViews"]') || e.target.id === 'profileViewsCard') {
                e.preventDefault();
                this.showProfileViewsDashboard();
            }
            
            if (e.target.closest('[onclick*="todayActivity"]') || e.target.id === 'todayActivityCard') {
                e.preventDefault();
                this.showTodayActivityDashboard();
            }

            if (e.target.closest('[onclick*="consentDashboard"]') || e.target.id === 'consentDashboardBtn') {
                e.preventDefault();
                this.showConsentDashboard();
            }
        });
    }

    // 1. HANDLE NEW MATCH - Complete Post-Match Flow
    handleNewMatch(matchData) {
        this.currentMatch = matchData;
        
        // Show match celebration first
        this.showMatchCelebration(matchData);
        
        // After celebration, show dating assistant
        setTimeout(() => {
            this.showDatingAssistant(matchData);
        }, 3000);
    }

    showMatchCelebration(match) {
        const modal = document.createElement('div');
        modal.className = 'match-celebration-modal';
        modal.innerHTML = `
            <div class="match-overlay"></div>
            <div class="match-container">
                <div class="match-animation">
                    <div class="confetti">🎉</div>
                    <h1 class="match-title">It's a Match!</h1>
                    <div class="match-profiles">
                        <div class="profile-circle">
                            <div class="profile-avatar">👤</div>
                        </div>
                        <div class="heart-icon">💕</div>
                        <div class="profile-circle">
                            <div class="profile-avatar">${match.avatar || '😊'}</div>
                        </div>
                    </div>
                    <p class="match-subtitle">You and ${match.name} liked each other!</p>
                </div>
                <div class="match-actions">
                    <button class="btn btn-primary btn-large" onclick="datingPostMatchFlow.proceedToDatingAssistant()">
                        Continue →
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    findCommonInterests(match) {
        // Simulate finding common interests
        const allInterests = [
            { name: 'Coffee', icon: '☕' },
            { name: 'Hiking', icon: '🥾' },
            { name: 'Photography', icon: '📸' },
            { name: 'Movies', icon: '🎬' },
            { name: 'Travel', icon: '✈️' }
        ];
        return allInterests.slice(0, 3); // Return first 3 as common
    }

    generateDateSuggestions(commonInterests, match) {
        return [
            {
                icon: '☕',
                title: 'Coffee & Conversation',
                description: 'Start with a relaxed coffee date at a cozy local café',
                duration: '1-2 hours',
                cost: '$',
                location: 'Downtown',
                reason: 'Perfect low-pressure first date to get to know each other'
            },
            {
                icon: '🥾',
                title: 'Scenic Hiking Trail',
                description: 'Explore a beautiful hiking trail and enjoy nature together',
                duration: '2-3 hours',
                cost: 'Free',
                location: 'Local Park',
                reason: 'You both love hiking - great way to bond while staying active'
            },
            {
                icon: '🎨',
                title: 'Art Gallery Visit',
                description: 'Browse local art galleries and discuss your favorites',
                duration: '1-2 hours',
                cost: '$$',
                location: 'Arts District',
                reason: 'Creative and cultured - plenty to talk about'
            }
        ];
    }

    proposeDateIdea(suggestionIndex, matchId) {
        document.querySelector('.dating-assistant-modal')?.remove();
        this.showConsentInterface(matchId, suggestionIndex);
    }

    skipToMessaging(matchId) {
        document.querySelector('.dating-assistant-modal')?.remove();
        showToast('Opening chat with your match... 💬');
        // Navigate to messages
        setTimeout(() => openModal('chatWindow'), 300);
    }

    showMoreSuggestions() {
        showToast('Generating more date ideas... 🔄');
        // In real app, would regenerate suggestions
    }

    // 3. CONSENT MANAGEMENT INTERFACE - After date is agreed
    showConsentInterface(matchId, dateSuggestionIndex) {
        const modal = document.createElement('div');
        modal.className = 'consent-interface-modal active';
        modal.innerHTML = `
            <div class="consent-overlay"></div>
            <div class="consent-container">
                <div class="consent-header">
                    <h2>📋 Date Safety & Consent</h2>
                    <p>Before finalizing your date plans</p>
                    <button class="close-btn" onclick="this.closest('.consent-interface-modal').remove()">×</button>
                </div>

                <div class="consent-intro">
                    <div class="safety-icon">🛡️</div>
                    <h3>Your Safety Matters</h3>
                    <p>We want to ensure both you and your match feel comfortable and safe. Let's establish consent and safety measures for your date.</p>
                </div>

                <div class="consent-agreement-section">
                    <h3>✓ Consent Agreement</h3>
                    <div class="consent-checkboxes">
                        <label class="consent-checkbox">
                            <input type="checkbox" id="consentMeetup" required>
                            <span>I consent to meeting ${this.currentMatch?.name || 'my match'} for this date</span>
                        </label>
                        <label class="consent-checkbox">
                            <input type="checkbox" id="consentShareLocation" required>
                            <span>I agree to share my date location with emergency contacts</span>
                        </label>
                        <label class="consent-checkbox">
                            <input type="checkbox" id="consentSafetyCheckin" required>
                            <span>I agree to participate in safety check-ins during the date</span>
                        </label>
                        <label class="consent-checkbox">
                            <input type="checkbox" id="understandWithdraw" required>
                            <span>I understand I can withdraw consent at any time</span>
                        </label>
                    </div>
                </div>

                <div class="consent-boundaries-section">
                    <h3>🎯 Set Your Boundaries</h3>
                    <div class="boundaries-options">
                        <div class="boundary-item">
                            <label>Public Meeting Only</label>
                            <input type="checkbox" checked>
                        </div>
                        <div class="boundary-item">
                            <label>Arrive Separately</label>
                            <input type="checkbox" checked>
                        </div>
                        <div class="boundary-item">
                            <label>No Alcohol</label>
                            <input type="checkbox">
                        </div>
                        <div class="boundary-item">
                            <label>Time Limit (Specify Duration)</label>
                            <input type="checkbox">
                        </div>
                    </div>
                </div>

                <div class="consent-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.consent-interface-modal').remove()">
                        Cancel Date
                    </button>
                    <button class="btn btn-primary" onclick="datingPostMatchFlow.submitConsent('${matchId}')">
                        Confirm & Continue
                    </button>
                </div>

                <div class="consent-note">
                    <p><strong>Note:</strong> Both parties must provide consent. Your match will receive a similar consent request. You can view and manage all consents in the Consent Dashboard.</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    submitConsent(matchId) {
        // Validate all required checkboxes
        const required = ['consentMeetup', 'consentShareLocation', 'consentSafetyCheckin', 'understandWithdraw'];
        const allChecked = required.every(id => document.getElementById(id)?.checked);

        if (!allChecked) {
            showToast('Please check all required consent items', 'error');
            return;
        }

        // Store consent record
        const consentRecord = {
            matchId: matchId,
            timestamp: new Date().toISOString(),
            matchName: this.currentMatch?.name || 'Unknown',
            consentGiven: true,
            boundaries: this.collectBoundaries(),
            canWithdraw: true
        };

        this.consentDashboardData.set(matchId, consentRecord);
        this.saveConsentHistory();

        // Close modal
        document.querySelector('.consent-interface-modal')?.remove();

        // Show success and navigate to consent dashboard
        showToast('Consent recorded! Opening Consent Dashboard... ✓', 'success');
        setTimeout(() => this.showConsentDashboard(), 1000);
    }

    collectBoundaries() {
        const boundaries = [];
        document.querySelectorAll('.boundary-item input[type="checkbox"]:checked').forEach(checkbox => {
            boundaries.push(checkbox.parentElement.querySelector('label').textContent);
        });
        return boundaries;
    }

    // 4. CONSENT DASHBOARD - View and manage all consent records
    showConsentDashboard() {
        const consentRecords = Array.from(this.consentDashboardData.values());

        const modal = document.createElement('div');
        modal.className = 'consent-dashboard-modal active';
        modal.innerHTML = `
            <div class="dashboard-overlay" onclick="this.parentElement.remove()"></div>
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h2>🛡️ Consent Dashboard</h2>
                    <p>Manage all your date consents and safety records</p>
                    <button class="close-btn" onclick="this.closest('.consent-dashboard-modal').remove()">×</button>
                </div>

                <div class="dashboard-stats">
                    <div class="stat-card">
                        <div class="stat-value">${consentRecords.length}</div>
                        <div class="stat-label">Total Consents</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${consentRecords.filter(r => r.consentGiven).length}</div>
                        <div class="stat-label">Active</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">0</div>
                        <div class="stat-label">Withdrawn</div>
                    </div>
                </div>

                <div class="consent-records-section">
                    <h3>📋 Consent Records</h3>
                    ${consentRecords.length > 0 ? `
                        <div class="records-list">
                            ${consentRecords.map(record => `
                                <div class="consent-record-card">
                                    <div class="record-header">
                                        <div class="record-match">
                                            <div class="match-avatar">😊</div>
                                            <div class="match-info">
                                                <h4>${record.matchName}</h4>
                                                <p class="record-date">${new Date(record.timestamp).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div class="record-status ${record.consentGiven ? 'active' : 'withdrawn'}">
                                            ${record.consentGiven ? '✓ Active' : '✕ Withdrawn'}
                                        </div>
                                    </div>
                                    
                                    <div class="record-boundaries">
                                        <strong>Boundaries Set:</strong>
                                        <ul>
                                            ${record.boundaries.map(b => `<li>${b}</li>`).join('')}
                                        </ul>
                                    </div>

                                    <div class="record-actions">
                                        <button class="btn btn-sm btn-outline" onclick="datingPostMatchFlow.viewConsentDetails('${record.matchId}')">
                                            View Details
                                        </button>
                                        ${record.canWithdraw ? `
                                            <button class="btn btn-sm btn-danger" onclick="datingPostMatchFlow.withdrawConsent('${record.matchId}')">
                                                🚫 Withdraw Consent
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <div class="empty-icon">📋</div>
                            <h3>No Consent Records Yet</h3>
                            <p>When you agree to meet matches, consent records will appear here</p>
                        </div>
                    `}
                </div>

                <div class="dashboard-info">
                    <h4>💡 About Consent Management</h4>
                    <ul>
                        <li>All dates require mutual consent from both parties</li>
                        <li>You can withdraw consent at any time - no questions asked</li>
                        <li>Records are kept for your safety and accountability</li>
                        <li>Emergency contacts can access this information if needed</li>
                    </ul>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    viewConsentDetails(matchId) {
        const record = this.consentDashboardData.get(matchId);
        if (!record) return;

        alert(`Consent Details for ${record.matchName}\n\nDate: ${new Date(record.timestamp).toLocaleString()}\nStatus: ${record.consentGiven ? 'Active' : 'Withdrawn'}\nBoundaries: ${record.boundaries.join(', ')}`);
    }

    withdrawConsent(matchId) {
        if (confirm('Are you sure you want to withdraw consent? This will notify your match.')) {
            const record = this.consentDashboardData.get(matchId);
            if (record) {
                record.consentGiven = false;
                record.withdrawnAt = new Date().toISOString();
                this.saveConsentHistory();
                
                showToast('Consent withdrawn successfully', 'success');
                
                // Refresh dashboard
                document.querySelector('.consent-dashboard-modal')?.remove();
                setTimeout(() => this.showConsentDashboard(), 300);
            }
        }
    }

    // 5. PROFILE VIEWS DASHBOARD
    showProfileViewsDashboard() {
        const views = this.generateProfileViewsData();

        const modal = document.createElement('div');
        modal.className = 'profile-views-dashboard active';
        modal.innerHTML = `
            <div class="dashboard-overlay" onclick="this.parentElement.remove()"></div>
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h2>👁️ Profile Views</h2>
                    <p>See who's been checking out your profile</p>
                    <button class="close-btn" onclick="this.closest('.profile-views-dashboard').remove()">×</button>
                </div>

                <div class="views-stats">
                    <div class="stat-card">
                        <div class="stat-value">${views.total}</div>
                        <div class="stat-label">Total Views</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${views.today}</div>
                        <div class="stat-label">Today</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${views.thisWeek}</div>
                        <div class="stat-label">This Week</div>
                    </div>
                </div>

                <div class="viewers-list">
                    <h3>Recent Viewers</h3>
                    ${views.viewers.map(viewer => `
                        <div class="viewer-card">
                            <div class="viewer-avatar">${viewer.avatar}</div>
                            <div class="viewer-info">
                                <h4>${viewer.name}, ${viewer.age}</h4>
                                <p>${viewer.distance} miles away • ${viewer.timeAgo}</p>
                            </div>
                            <button class="btn btn-sm btn-primary" onclick="showToast('Opening profile...')">
                                View Profile
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    generateProfileViewsData() {
        return {
            total: 45,
            today: 8,
            thisWeek: 23,
            viewers: [
                { name: 'Sarah', age: 26, avatar: '😊', distance: 3, timeAgo: '2 hours ago' },
                { name: 'Emma', age: 24, avatar: '🎨', distance: 5, timeAgo: '5 hours ago' },
                { name: 'Jessica', age: 28, avatar: '✨', distance: 2, timeAgo: '1 day ago' },
                { name: 'Amanda', age: 25, avatar: '💕', distance: 7, timeAgo: '2 days ago' }
            ]
        };
    }

    // 6. TODAY'S ACTIVITY DASHBOARD
    showTodayActivityDashboard() {
        const activity = this.generateTodayActivityData();

        const modal = document.createElement('div');
        modal.className = 'activity-dashboard-modal active';
        modal.innerHTML = `
            <div class="dashboard-overlay" onclick="this.parentElement.remove()"></div>
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h2>📊 Today's Activity</h2>
                    <p>Your dating activity summary for today</p>
                    <button class="close-btn" onclick="this.closest('.activity-dashboard-modal').remove()">×</button>
                </div>

                <div class="activity-stats">
                    <div class="stat-card">
                        <div class="stat-icon">👀</div>
                        <div class="stat-value">${activity.profilesViewed}</div>
                        <div class="stat-label">Profiles Viewed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💚</div>
                        <div class="stat-value">${activity.likesSent}</div>
                        <div class="stat-label">Likes Sent</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">❤️</div>
                        <div class="stat-value">${activity.likesReceived}</div>
                        <div class="stat-label">Likes Received</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✨</div>
                        <div class="stat-value">${activity.matches}</div>
                        <div class="stat-label">New Matches</div>
                    </div>
                </div>

                <div class="activity-timeline">
                    <h3>Activity Timeline</h3>
                    <div class="timeline">
                        ${activity.timeline.map(item => `
                            <div class="timeline-item">
                                <div class="timeline-time">${item.time}</div>
                                <div class="timeline-icon">${item.icon}</div>
                                <div class="timeline-content">
                                    <p>${item.description}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    generateTodayActivityData() {
        return {
            profilesViewed: 23,
            likesSent: 8,
            likesReceived: 12,
            matches: 3,
            timeline: [
                { time: '2:30 PM', icon: '💚', description: 'You liked Sarah\'s profile' },
                { time: '1:45 PM', icon: '✨', description: 'New match with Emma!' },
                { time: '12:30 PM', icon: '👀', description: 'Amanda viewed your profile' },
                { time: '11:15 AM', icon: '💬', description: 'You sent a message to Jessica' },
                { time: '10:00 AM', icon: '💚', description: 'You liked 5 profiles' }
            ]
        };
    }

    // Storage methods
    loadConsentHistory() {
        const stored = localStorage.getItem('datingConsentRecords');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.consentDashboardData = new Map(Object.entries(data));
            } catch (e) {
                console.error('Error loading consent history:', e);
            }
        }
    }

    saveConsentHistory() {
        const data = Object.fromEntries(this.consentDashboardData);
        localStorage.setItem('datingConsentRecords', JSON.stringify(data));
    }
}

// Initialize the manager
const datingPostMatchFlow = new DatingPostMatchFlowManager();
window.datingPostMatchFlow = datingPostMatchFlow;

// Demo function to test the flow
function demoMatchFlow() {
    const demoMatch = {
        id: 'match_' + Date.now(),
        name: 'Sarah',
        age: 26,
        avatar: '😊',
        interests: ['Coffee', 'Hiking', 'Photography']
    };

    document.dispatchEvent(new CustomEvent('datingMatchCreated', {
        detail: demoMatch
    }));
}

// Make demo available globally
window.demoMatchFlow = demoMatchFlow;

// Utility function for toast notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
