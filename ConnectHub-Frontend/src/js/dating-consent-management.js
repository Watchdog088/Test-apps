/**
 * Dating Consent Management System
 * Handles consent processes after matches agree to meet up
 */
class DatingConsentManagement {
    constructor() {
        this.currentConsentSession = null;
        this.consentHistory = new Map();
        this.consentTimeouts = new Map();
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadConsentHistory();
    }

    bindEvents() {
        // Listen for match agreement events
        document.addEventListener('matchAgreedToMeet', (e) => {
            this.initiateConsentProcess(e.detail);
        });

        // Listen for consent withdrawal requests
        document.addEventListener('withdrawConsent', (e) => {
            this.handleConsentWithdrawal(e.detail);
        });
    }

    /**
     * Initiate consent process after match agrees to meet
     * @param {Object} matchData - Match information
     */
    initiateConsentProcess(matchData) {
        const sessionId = this.generateSessionId();
        const consentSession = {
            id: sessionId,
            matchId: matchData.matchId,
            participants: [
                { id: matchData.user1Id, name: matchData.user1Name, consented: false },
                { id: matchData.user2Id, name: matchData.user2Name, consented: false }
            ],
            currentTurn: 0,
            meetupDetails: matchData.meetupDetails,
            status: 'pending',
            createdAt: new Date(),
            consentHistory: []
        };

        this.currentConsentSession = consentSession;
        this.showConsentInterface(consentSession);
    }

    /**
     * Show the consent management interface
     * @param {Object} session - Consent session data
     */
    showConsentInterface(session) {
        const modal = document.createElement('div');
        modal.className = 'consent-modal';
        modal.innerHTML = `
            <div class="consent-overlay" id="consentOverlay"></div>
            <div class="consent-container">
                <div class="consent-header">
                    <h2>📋 Consent Management</h2>
                    <button class="consent-close-btn" id="closeConsentModal">×</button>
                </div>
                
                <div class="consent-body">
                    <div class="meetup-summary">
                        <h3>📅 Meetup Details</h3>
                        <div class="meetup-info">
                            <p><strong>Date:</strong> ${session.meetupDetails.date}</p>
                            <p><strong>Time:</strong> ${session.meetupDetails.time}</p>
                            <p><strong>Location:</strong> ${session.meetupDetails.location}</p>
                            <p><strong>Activity:</strong> ${session.meetupDetails.activity}</p>
                        </div>
                    </div>

                    <div class="consent-participants">
                        <h3>👥 Consent Status</h3>
                        <div class="participants-grid">
                            ${session.participants.map((participant, index) => `
                                <div class="participant-card ${session.currentTurn === index ? 'active-turn' : ''}" 
                                     data-participant-id="${participant.id}">
                                    <div class="participant-info">
                                        <div class="participant-name">${participant.name}</div>
                                        <div class="consent-status ${participant.consented ? 'consented' : 'pending'}">
                                            ${participant.consented ? '✅ Consented' : '⏳ Pending'}
                                        </div>
                                    </div>
                                    ${session.currentTurn === index ? `
                                        <div class="consent-actions">
                                            <button class="consent-agree-btn" data-action="consent">
                                                ✅ I Consent to This Meetup
                                            </button>
                                            <button class="consent-decline-btn" data-action="decline">
                                                ❌ I Decline This Meetup
                                            </button>
                                        </div>
                                    ` : ''}
                                    ${participant.consented ? `
                                        <button class="withdraw-consent-btn" data-participant-id="${participant.id}">
                                            🚫 Withdraw Consent
                                        </button>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="consent-progress">
                        <h4>🔄 Process Status</h4>
                        <div class="progress-info">
                            <p><strong>Current Turn:</strong> ${session.participants[session.currentTurn].name}</p>
                            <p><strong>Session Status:</strong> ${session.status.charAt(0).toUpperCase() + session.status.slice(1)}</p>
                        </div>
                    </div>

                    <div class="consent-history">
                        <h4>📝 Consent History</h4>
                        <div class="history-list" id="consentHistoryList">
                            ${this.renderConsentHistory(session)}
                        </div>
                    </div>

                    <div class="consent-footer">
                        <div class="consent-note">
                            <p><strong>Note:</strong> Consent can be withdrawn at any time before or during the meetup. 
                            Both participants must consent for the meetup to proceed.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.bindConsentEvents(modal, session);
        this.addConsentStyles();
    }

    /**
     * Bind events for the consent interface
     */
    bindConsentEvents(modal, session) {
        const overlay = modal.querySelector('#consentOverlay');
        const closeBtn = modal.querySelector('#closeConsentModal');
        const consentBtns = modal.querySelectorAll('[data-action="consent"]');
        const declineBtns = modal.querySelectorAll('[data-action="decline"]');
        const withdrawBtns = modal.querySelectorAll('.withdraw-consent-btn');

        // Close modal
        const closeModal = () => {
            document.body.removeChild(modal);
        };

        overlay.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);

        // Handle consent actions
        consentBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleConsentDecision(session, 'consent');
            });
        });

        declineBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleConsentDecision(session, 'decline');
            });
        });

        // Handle consent withdrawal
        withdrawBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const participantId = e.target.dataset.participantId;
                this.handleConsentWithdrawal({ sessionId: session.id, participantId });
            });
        });
    }

    /**
     * Handle consent decision (agree or decline)
     */
    handleConsentDecision(session, decision) {
        const currentParticipant = session.participants[session.currentTurn];
        
        const historyEntry = {
            participantId: currentParticipant.id,
            participantName: currentParticipant.name,
            decision: decision,
            timestamp: new Date(),
            type: 'decision'
        };

        session.consentHistory.push(historyEntry);

        if (decision === 'consent') {
            currentParticipant.consented = true;
            this.showToast(`${currentParticipant.name} has consented to the meetup`, 'success');
            
            // Move to next participant or complete process
            if (session.currentTurn < session.participants.length - 1) {
                session.currentTurn++;
                this.updateConsentInterface(session);
            } else {
                // Check if all consented
                const allConsented = session.participants.every(p => p.consented);
                if (allConsented) {
                    session.status = 'approved';
                    this.completeConsentProcess(session);
                } else {
                    // Start next round
                    session.currentTurn = 0;
                    this.updateConsentInterface(session);
                }
            }
        } else {
            session.status = 'declined';
            this.showToast(`${currentParticipant.name} has declined the meetup`, 'error');
            this.completeConsentProcess(session);
        }

        this.saveConsentSession(session);
    }

    /**
     * Handle consent withdrawal
     */
    handleConsentWithdrawal(data) {
        const session = this.currentConsentSession;
        if (!session || session.id !== data.sessionId) return;

        const participant = session.participants.find(p => p.id === data.participantId);
        if (!participant) return;

        const historyEntry = {
            participantId: participant.id,
            participantName: participant.name,
            decision: 'withdraw',
            timestamp: new Date(),
            type: 'withdrawal'
        };

        session.consentHistory.push(historyEntry);
        participant.consented = false;
        session.status = 'withdrawn';

        this.showToast(`${participant.name} has withdrawn consent`, 'warning');
        this.updateConsentInterface(session);
        this.saveConsentSession(session);

        // Notify the other participant
        this.notifyConsentChange(session, participant, 'withdrawn');
    }

    /**
     * Update the consent interface display
     */
    updateConsentInterface(session) {
        const modal = document.querySelector('.consent-modal');
        if (!modal) return;

        // Remove existing modal and show updated one
        document.body.removeChild(modal);
        this.showConsentInterface(session);
    }

    /**
     * Complete the consent process
     */
    completeConsentProcess(session) {
        const modal = document.querySelector('.consent-modal');
        if (modal) {
            document.body.removeChild(modal);
        }

        if (session.status === 'approved') {
            this.showConsentCompletionModal(session, true);
            this.scheduleConsentReminders(session);
        } else {
            this.showConsentCompletionModal(session, false);
        }

        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('consentProcessComplete', {
            detail: { session, approved: session.status === 'approved' }
        }));
    }

    /**
     * Show consent completion modal
     */
    showConsentCompletionModal(session, approved) {
        const modal = document.createElement('div');
        modal.className = 'consent-completion-modal';
        modal.innerHTML = `
            <div class="consent-overlay"></div>
            <div class="consent-completion-container">
                <div class="completion-header">
                    <h2>${approved ? '✅ Meetup Approved!' : '❌ Meetup Not Approved'}</h2>
                </div>
                <div class="completion-body">
                    ${approved ? `
                        <div class="success-message">
                            <p>🎉 Both participants have consented to the meetup!</p>
                            <div class="meetup-reminder">
                                <h3>📅 Meetup Details</h3>
                                <p><strong>Date:</strong> ${session.meetupDetails.date}</p>
                                <p><strong>Time:</strong> ${session.meetupDetails.time}</p>
                                <p><strong>Location:</strong> ${session.meetupDetails.location}</p>
                            </div>
                            <div class="safety-reminder">
                                <p><strong>Safety Reminder:</strong> Remember that consent can be withdrawn at any time. 
                                Stay safe and communicate openly during your meetup.</p>
                            </div>
                        </div>
                    ` : `
                        <div class="declined-message">
                            <p>The meetup has been declined or consent was withdrawn.</p>
                            <p>You can always arrange a new meetup when both parties are ready.</p>
                        </div>
                    `}
                </div>
                <div class="completion-footer">
                    <button class="close-completion-btn">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Auto-close after 5 seconds or on button click
        const closeBtn = modal.querySelector('.close-completion-btn');
        const closeModal = () => document.body.removeChild(modal);
        
        closeBtn.addEventListener('click', closeModal);
        setTimeout(closeModal, 5000);
    }

    /**
     * Render consent history
     */
    renderConsentHistory(session) {
        if (!session.consentHistory.length) {
            return '<p class="no-history">No consent actions yet</p>';
        }

        return session.consentHistory.map(entry => `
            <div class="history-entry">
                <span class="history-participant">${entry.participantName}</span>
                <span class="history-action ${entry.decision}">${this.getActionText(entry.decision)}</span>
                <span class="history-time">${this.formatTime(entry.timestamp)}</span>
            </div>
        `).join('');
    }

    /**
     * Get action text for history display
     */
    getActionText(decision) {
        const actions = {
            'consent': '✅ Consented',
            'decline': '❌ Declined',
            'withdraw': '🚫 Withdrawn'
        };
        return actions[decision] || decision;
    }

    /**
     * Format timestamp for display
     */
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Schedule consent reminders
     */
    scheduleConsentReminders(session) {
        // Set reminder 24 hours before meetup
        const meetupTime = new Date(session.meetupDetails.date + ' ' + session.meetupDetails.time);
        const reminderTime = new Date(meetupTime.getTime() - 24 * 60 * 60 * 1000);
        
        if (reminderTime > new Date()) {
            const timeout = setTimeout(() => {
                this.sendConsentReminder(session);
            }, reminderTime.getTime() - Date.now());
            
            this.consentTimeouts.set(session.id, timeout);
        }
    }

    /**
     * Send consent reminder notification
     */
    sendConsentReminder(session) {
        this.showToast('Meetup reminder: Your consensual meetup is tomorrow. Consent can still be withdrawn if needed.', 'info');
    }

    /**
     * Notify participants of consent changes
     */
    notifyConsentChange(session, participant, changeType) {
        // In a real app, this would send push notifications
        console.log(`Consent change notification: ${participant.name} ${changeType} consent for meetup ${session.id}`);
    }

    /**
     * Save consent session to storage
     */
    saveConsentSession(session) {
        this.consentHistory.set(session.id, session);
        localStorage.setItem('datingConsentHistory', JSON.stringify(Array.from(this.consentHistory.entries())));
    }

    /**
     * Load consent history from storage
     */
    loadConsentHistory() {
        const stored = localStorage.getItem('datingConsentHistory');
        if (stored) {
            try {
                const entries = JSON.parse(stored);
                this.consentHistory = new Map(entries);
            } catch (e) {
                console.error('Error loading consent history:', e);
            }
        }
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'consent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `consent-toast consent-toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 4000);
    }

    /**
     * Add CSS styles for consent interface
     */
    addConsentStyles() {
        if (document.getElementById('consentStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'consentStyles';
        styles.textContent = `
            .consent-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .consent-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
            }

            .consent-container, .consent-completion-container {
                position: relative;
                background: white;
                border-radius: 15px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }

            .consent-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: between;
                align-items: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 15px 15px 0 0;
            }

            .consent-header h2 {
                margin: 0;
                font-size: 1.4em;
            }

            .consent-close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
            }

            .consent-close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .consent-body {
                padding: 20px;
            }

            .meetup-summary {
                background: #f8f9ff;
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 20px;
            }

            .meetup-summary h3 {
                margin: 0 0 10px 0;
                color: #333;
            }

            .meetup-info p {
                margin: 5px 0;
                color: #555;
            }

            .consent-participants {
                margin-bottom: 20px;
            }

            .consent-participants h3 {
                margin-bottom: 15px;
                color: #333;
            }

            .participants-grid {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .participant-card {
                border: 2px solid #eee;
                border-radius: 10px;
                padding: 15px;
                transition: all 0.3s ease;
            }

            .participant-card.active-turn {
                border-color: #667eea;
                background: #f8f9ff;
            }

            .participant-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .participant-name {
                font-weight: bold;
                color: #333;
            }

            .consent-status {
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 0.9em;
                font-weight: bold;
            }

            .consent-status.consented {
                background: #e8f5e8;
                color: #2e7d32;
            }

            .consent-status.pending {
                background: #fff3e0;
                color: #f57c00;
            }

            .consent-actions {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }

            .consent-agree-btn, .consent-decline-btn {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
            }

            .consent-agree-btn {
                background: #4caf50;
                color: white;
            }

            .consent-agree-btn:hover {
                background: #45a049;
                transform: translateY(-1px);
            }

            .consent-decline-btn {
                background: #f44336;
                color: white;
            }

            .consent-decline-btn:hover {
                background: #da190b;
                transform: translateY(-1px);
            }

            .withdraw-consent-btn {
                background: #ff9800;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 5px;
                font-size: 0.9em;
                cursor: pointer;
                margin-top: 10px;
                transition: all 0.2s;
            }

            .withdraw-consent-btn:hover {
                background: #f57c00;
                transform: translateY(-1px);
            }

            .consent-progress, .consent-history {
                background: #f5f5f5;
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 15px;
            }

            .consent-progress h4, .consent-history h4 {
                margin: 0 0 10px 0;
                color: #333;
            }

            .progress-info p {
                margin: 5px 0;
                color: #666;
            }

            .history-list {
                max-height: 200px;
                overflow-y: auto;
            }

            .history-entry {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #ddd;
            }

            .history-entry:last-child {
                border-bottom: none;
            }

            .history-participant {
                font-weight: bold;
                color: #333;
            }

            .history-action {
                font-size: 0.9em;
            }

            .history-action.consent {
                color: #4caf50;
            }

            .history-action.decline, .history-action.withdraw {
                color: #f44336;
            }

            .history-time {
                font-size: 0.8em;
                color: #999;
            }

            .no-history {
                color: #999;
                font-style: italic;
                text-align: center;
                margin: 10px 0;
            }

            .consent-note {
                background: #e3f2fd;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #2196f3;
            }

            .consent-note p {
                margin: 0;
                color: #1565c0;
                font-size: 0.9em;
            }

            .success-message, .declined-message {
                text-align: center;
                padding: 20px;
            }

            .success-message h3 {
                color: #4caf50;
                margin-bottom: 15px;
            }

            .meetup-reminder {
                background: #f8f9ff;
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: left;
            }

            .safety-reminder {
                background: #fff3e0;
                padding: 15px;
                border-radius: 10px;
                margin-top: 20px;
            }

            .completion-footer {
                padding: 20px;
                text-align: center;
                border-top: 1px solid #eee;
            }

            .close-completion-btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
            }

            .close-completion-btn:hover {
                background: #5a67d8;
                transform: translateY(-1px);
            }

            .consent-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                z-index: 1100;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                max-width: 300px;
            }

            .consent-toast.show {
                transform: translateX(0);
            }

            .consent-toast-success {
                background: #4caf50;
            }

            .consent-toast-error {
                background: #f44336;
            }

            .consent-toast-warning {
                background: #ff9800;
            }

            .consent-toast-info {
                background: #2196f3;
            }

            @media (max-width: 768px) {
                .consent-container, .consent-completion-container {
                    width: 95%;
                    margin: 10px;
                }

                .consent-actions {
                    flex-direction: column;
                }

                .participants-grid {
                    gap: 10px;
                }

                .consent-toast {
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Get consent session by ID
     */
    getConsentSession(sessionId) {
        return this.consentHistory.get(sessionId);
    }

    /**
     * Get all consent sessions for a user
     */
    getUserConsentSessions(userId) {
        return Array.from(this.consentHistory.values()).filter(session =>
            session.participants.some(p => p.id === userId)
        );
    }

    /**
     * Cleanup expired consent sessions
     */
    cleanupExpiredSessions() {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        for (const [sessionId, session] of this.consentHistory.entries()) {
            if (session.createdAt < oneDayAgo && session.status !== 'approved') {
                this.consentHistory.delete(sessionId);
                
                // Clear any pending timeouts
                if (this.consentTimeouts.has(sessionId)) {
                    clearTimeout(this.consentTimeouts.get(sessionId));
                    this.consentTimeouts.delete(sessionId);
                }
            }
        }
        
        this.saveConsentHistory();
    }

    /**
     * Save consent history to storage
     */
    saveConsentHistory() {
        localStorage.setItem('datingConsentHistory', JSON.stringify(Array.from(this.consentHistory.entries())));
    }
}

// Initialize consent management
window.datingConsentManager = new DatingConsentManagement();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatingConsentManagement;
}
