/**
 * ConnectHub - 4 Missing Groups & Events UI Components
 * Final missing interfaces for complete Groups & Events functionality
 */

class GroupsEventsFinalMissingUIComponents {
    constructor(app) {
        this.app = app;
        this.rsvpData = new Map();
        this.liveUpdates = [];
        this.groupAnalytics = {};
        this.notificationSettings = {};
        
        this.init();
    }

    /**
     * Initialize the 4 missing Groups & Events UI components
     */
    init() {
        this.initEventRSVPManagement();
        this.initEventLiveUpdates();
        this.initGroupAnalyticsDashboard();
        this.initEventNotificationManagement();
        
        console.log('4 Final Missing Groups & Events UI Components initialized');
    }

    // ========================================
    // 1. EVENT RSVP MANAGEMENT INTERFACE
    // ========================================

    initEventRSVPManagement() {
        // Add RSVP management button to event interfaces
        document.addEventListener('DOMContentLoaded', () => {
            this.addRSVPManagementButtons();
        });

        // Handle RSVP management clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.manage-rsvp-btn')) {
                const eventId = e.target.closest('.manage-rsvp-btn').dataset.eventId;
                this.showEventRSVPManagement(eventId);
            }
        });
    }

    addRSVPManagementButtons() {
        // Add buttons to event management interfaces
        const eventElements = document.querySelectorAll('.event-item, .event-card');
        eventElements.forEach(element => {
            if (!element.querySelector('.manage-rsvp-btn')) {
                this.addRSVPButton(element);
            }
        });
    }

    addRSVPButton(eventElement) {
        const actionsContainer = eventElement.querySelector('.event-actions') || 
                                eventElement.querySelector('.card-actions') ||
                                eventElement;
        
        if (actionsContainer) {
            const rsvpBtn = document.createElement('button');
            rsvpBtn.className = 'manage-rsvp-btn btn btn-small btn-secondary';
            rsvpBtn.dataset.eventId = eventElement.dataset.eventId || 'event-' + Date.now();
            rsvpBtn.innerHTML = '<i class="fas fa-users"></i> Manage RSVPs';
            rsvpBtn.title = 'Manage event RSVPs';
            
            actionsContainer.appendChild(rsvpBtn);
        }
    }

    showEventRSVPManagement(eventId) {
        const modal = this.createEventRSVPModal(eventId);
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    createEventRSVPModal(eventId) {
        const modal = document.createElement('div');
        modal.id = 'event-rsvp-modal';
        modal.className = 'modal large';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="rsvp-header">
                        <i class="fas fa-users"></i>
                        <h3>Event RSVP Management</h3>
                    </div>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="rsvp-management-container">
                        <!-- Event Summary -->
                        <div class="rsvp-event-summary">
                            <div class="event-info-card">
                                <div class="event-header">
                                    <h4>React Development Workshop</h4>
                                    <div class="event-details">
                                        <span><i class="fas fa-calendar"></i> March 25, 2024</span>
                                        <span><i class="fas fa-clock"></i> 2:00 PM - 6:00 PM</span>
                                        <span><i class="fas fa-map-marker-alt"></i> TechHub Conference Center</span>
                                    </div>
                                </div>
                                <div class="rsvp-stats">
                                    <div class="stat-grid">
                                        <div class="stat-item">
                                            <div class="stat-number">89</div>
                                            <div class="stat-label">Going</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-number">23</div>
                                            <div class="stat-label">Maybe</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-number">12</div>
                                            <div class="stat-label">Can't Go</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-number">45</div>
                                            <div class="stat-label">No Response</div>
                                        </div>
                                    </div>
                                    <div class="capacity-info">
                                        <div class="capacity-bar">
                                            <div class="capacity-fill" style="width: 78%"></div>
                                        </div>
                                        <div class="capacity-text">78/100 confirmed attendees</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- RSVP Management Tabs -->
                        <div class="rsvp-tabs">
                            <button class="rsvp-tab active" data-tab="attendees" onclick="groupsEventsFinalMissing.switchRSVPTab('attendees')">
                                <i class="fas fa-user-check"></i>
                                <span>Attendees (89)</span>
                            </button>
                            <button class="rsvp-tab" data-tab="maybe" onclick="groupsEventsFinalMissing.switchRSVPTab('maybe')">
                                <i class="fas fa-user-clock"></i>
                                <span>Maybe (23)</span>
                            </button>
                            <button class="rsvp-tab" data-tab="declined" onclick="groupsEventsFinalMissing.switchRSVPTab('declined')">
                                <i class="fas fa-user-times"></i>
                                <span>Declined (12)</span>
                            </button>
                            <button class="rsvp-tab" data-tab="pending" onclick="groupsEventsFinalMissing.switchRSVPTab('pending')">
                                <i class="fas fa-user-question"></i>
                                <span>No Response (45)</span>
                            </button>
                        </div>

                        <!-- RSVP Controls -->
                        <div class="rsvp-controls">
                            <div class="control-left">
                                <button class="btn btn-small btn-primary" onclick="groupsEventsFinalMissing.sendReminders()">
                                    <i class="fas fa-bell"></i> Send Reminders
                                </button>
                                <button class="btn btn-small btn-secondary" onclick="groupsEventsFinalMissing.exportRSVPList()">
                                    <i class="fas fa-download"></i> Export List
                                </button>
                                <button class="btn btn-small btn-secondary" onclick="groupsEventsFinalMissing.printRSVPList()">
                                    <i class="fas fa-print"></i> Print List
                                </button>
                            </div>
                            <div class="control-right">
                                <div class="search-input-container">
                                    <i class="fas fa-search"></i>
                                    <input type="text" placeholder="Search attendees..." class="form-input">
                                </div>
                            </div>
                        </div>

                        <!-- RSVP List Content -->
                        <div class="rsvp-content">
                            <div class="rsvp-list active" data-tab="attendees">
                                <div class="rsvp-list-header">
                                    <div class="list-actions">
                                        <label class="select-all">
                                            <input type="checkbox" onchange="groupsEventsFinalMissing.selectAllAttendees(this.checked)">
                                            <span>Select All</span>
                                        </label>
                                        <select class="form-select">
                                            <option>Bulk Actions</option>
                                            <option>Send Message</option>
                                            <option>Mark as VIP</option>
                                            <option>Move to Waitlist</option>
                                        </select>
                                    </div>
                                    <div class="sort-options">
                                        <select class="form-select" onchange="groupsEventsFinalMissing.sortAttendees(this.value)">
                                            <option value="name">Sort by Name</option>
                                            <option value="rsvp-date">RSVP Date</option>
                                            <option value="check-in">Check-in Status</option>
                                            <option value="vip">VIP Status</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="attendees-list">
                                    ${this.renderAttendeesList('going')}
                                </div>
                            </div>

                            <div class="rsvp-list" data-tab="maybe">
                                <div class="attendees-list">
                                    ${this.renderAttendeesList('maybe')}
                                </div>
                            </div>

                            <div class="rsvp-list" data-tab="declined">
                                <div class="attendees-list">
                                    ${this.renderAttendeesList('declined')}
                                </div>
                            </div>

                            <div class="rsvp-list" data-tab="pending">
                                <div class="attendees-list">
                                    ${this.renderAttendeesList('pending')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="footer-info">
                        <span class="last-updated">Last updated: 5 minutes ago</span>
                    </div>
                    <div class="footer-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                        <button class="btn btn-primary" onclick="groupsEventsFinalMissing.refreshRSVPData()">
                            <i class="fas fa-sync"></i> Refresh Data
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupRSVPModalEvents(modal, eventId);
        return modal;
    }

    renderAttendeesList(status) {
        const attendees = this.generateMockAttendees(status);
        return attendees.map(attendee => `
            <div class="attendee-item" data-attendee-id="${attendee.id}">
                <div class="attendee-select">
                    <input type="checkbox" class="attendee-checkbox">
                </div>
                <div class="attendee-avatar">
                    <div class="avatar ${attendee.vip ? 'vip' : ''}">${attendee.initials}</div>
                    ${attendee.vip ? '<div class="vip-badge"><i class="fas fa-star"></i></div>' : ''}
                </div>
                <div class="attendee-info">
                    <div class="attendee-name">${attendee.name}</div>
                    <div class="attendee-email">${attendee.email}</div>
                    <div class="attendee-meta">
                        <span class="rsvp-date">RSVP: ${attendee.rsvpDate}</span>
                        <span class="check-in-status ${attendee.checkedIn ? 'checked-in' : 'not-checked-in'}">
                            ${attendee.checkedIn ? 'Checked In' : 'Not Checked In'}
                        </span>
                    </div>
                </div>
                <div class="attendee-actions">
                    <button class="action-btn" onclick="groupsEventsFinalMissing.messageAttendee('${attendee.id}')" title="Send Message">
                        <i class="fas fa-envelope"></i>
                    </button>
                    <button class="action-btn" onclick="groupsEventsFinalMissing.viewAttendeeProfile('${attendee.id}')" title="View Profile">
                        <i class="fas fa-user"></i>
                    </button>
                    <button class="action-btn" onclick="groupsEventsFinalMissing.toggleVIP('${attendee.id}')" title="Toggle VIP">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="action-btn dropdown-toggle" onclick="groupsEventsFinalMissing.showAttendeeOptions('${attendee.id}')" title="More Options">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    generateMockAttendees(status) {
        const names = [
            'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Rodriguez', 'Jessica Wang',
            'David Kim', 'Lisa Thompson', 'John Smith', 'Maria Garcia', 'Robert Wilson',
            'Jennifer Brown', 'Chris Lee', 'Amanda Taylor', 'Daniel Martinez', 'Nicole Anderson'
        ];

        const count = status === 'going' ? 15 : status === 'maybe' ? 8 : status === 'declined' ? 5 : 12;
        
        return Array.from({length: count}, (_, i) => {
            const name = names[i] || `User ${i + 1}`;
            return {
                id: `attendee-${status}-${i}`,
                name: name,
                initials: name.split(' ').map(n => n[0]).join(''),
                email: name.toLowerCase().replace(' ', '.') + '@email.com',
                rsvpDate: this.getRandomDate(),
                checkedIn: status === 'going' && Math.random() > 0.3,
                vip: Math.random() > 0.8,
                status: status
            };
        });
    }

    getRandomDate() {
        const days = Math.floor(Math.random() * 14) + 1;
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toLocaleDateString();
    }

    setupRSVPModalEvents(modal, eventId) {
        // Setup event listeners for RSVP management functionality
    }

    switchRSVPTab(tabName) {
        // Remove active from all tabs
        document.querySelectorAll('.rsvp-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.rsvp-list').forEach(list => list.classList.remove('active'));

        // Add active to selected tab
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.querySelector(`.rsvp-list[data-tab="${tabName}"]`).classList.add('active');
    }

    sendReminders() {
        this.app.showToast('RSVP reminders sent successfully!', 'success');
    }

    exportRSVPList() {
        this.app.showToast('RSVP list exported to CSV', 'success');
    }

    printRSVPList() {
        this.app.showToast('RSVP list sent to printer', 'info');
    }

    selectAllAttendees(checked) {
        const checkboxes = document.querySelectorAll('.rsvp-list.active .attendee-checkbox');
        checkboxes.forEach(cb => cb.checked = checked);
    }

    sortAttendees(sortBy) {
        this.app.showToast(`Sorted attendees by ${sortBy}`, 'info');
    }

    messageAttendee(attendeeId) {
        this.app.showToast('Message composer opened', 'info');
    }

    viewAttendeeProfile(attendeeId) {
        this.app.showToast('Attendee profile opened', 'info');
    }

    toggleVIP(attendeeId) {
        this.app.showToast('VIP status toggled', 'success');
    }

    showAttendeeOptions(attendeeId) {
        this.app.showToast('Attendee options menu opened', 'info');
    }

    refreshRSVPData() {
        this.app.showToast('RSVP data refreshed', 'success');
    }

    // ========================================
    // 2. EVENT LIVE UPDATES INTERFACE
    // ========================================

    initEventLiveUpdates() {
        // Add live updates button to event interfaces
        document.addEventListener('DOMContentLoaded', () => {
            this.addLiveUpdatesButtons();
        });

        // Handle live updates clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.live-updates-btn')) {
                const eventId = e.target.closest('.live-updates-btn').dataset.eventId;
                this.showEventLiveUpdates(eventId);
            }
        });
    }

    addLiveUpdatesButtons() {
        const eventElements = document.querySelectorAll('.event-item, .event-card');
        eventElements.forEach(element => {
            if (!element.querySelector('.live-updates-btn')) {
                this.addLiveUpdatesButton(element);
            }
        });
    }

    addLiveUpdatesButton(eventElement) {
        const actionsContainer = eventElement.querySelector('.event-actions') || 
                                eventElement.querySelector('.card-actions') ||
                                eventElement;
        
        if (actionsContainer) {
            const updatesBtn = document.createElement('button');
            updatesBtn.className = 'live-updates-btn btn btn-small btn-success';
            updatesBtn.dataset.eventId = eventElement.dataset.eventId || 'event-' + Date.now();
            updatesBtn.innerHTML = '<i class="fas fa-broadcast-tower"></i> Live Updates';
            updatesBtn.title = 'Manage live event updates';
            
            actionsContainer.appendChild(updatesBtn);
        }
    }

    showEventLiveUpdates(eventId) {
        const modal = this.createLiveUpdatesModal(eventId);
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    createLiveUpdatesModal(eventId) {
        const modal = document.createElement('div');
        modal.id = 'live-updates-modal';
        modal.className = 'modal large';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="live-updates-header">
                        <div class="header-left">
                            <i class="fas fa-broadcast-tower"></i>
                            <h3>Event Live Updates</h3>
                            <div class="live-indicator">
                                <div class="live-dot pulsing"></div>
                                <span>LIVE</span>
                            </div>
                        </div>
                        <div class="event-status">
                            <span class="status-label">Event Status:</span>
                            <select id="event-status" onchange="groupsEventsFinalMissing.updateEventStatus(this.value)">
                                <option value="upcoming">Upcoming</option>
                                <option value="live" selected>Live - In Progress</option>
                                <option value="break">Break</option>
                                <option value="concluded">Concluded</option>
                            </select>
                        </div>
                    </div>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="live-updates-container">
                        <!-- Live Stats Dashboard -->
                        <div class="live-stats">
                            <div class="stats-grid">
                                <div class="stat-card live">
                                    <div class="stat-icon"><i class="fas fa-users"></i></div>
                                    <div class="stat-content">
                                        <div class="stat-number" id="live-attendees">78</div>
                                        <div class="stat-label">Live Attendees</div>
                                    </div>
                                    <div class="stat-change positive">+5</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-icon"><i class="fas fa-eye"></i></div>
                                    <div class="stat-content">
                                        <div class="stat-number" id="online-viewers">234</div>
                                        <div class="stat-label">Online Viewers</div>
                                    </div>
                                    <div class="stat-change positive">+12</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-icon"><i class="fas fa-comments"></i></div>
                                    <div class="stat-content">
                                        <div class="stat-number" id="live-messages">89</div>
                                        <div class="stat-label">Live Messages</div>
                                    </div>
                                    <div class="stat-change positive">+23</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-icon"><i class="fas fa-question-circle"></i></div>
                                    <div class="stat-content">
                                        <div class="stat-number" id="qa-questions">12</div>
                                        <div class="stat-label">Q&A Questions</div>
                                    </div>
                                    <div class="stat-change">+3</div>
                                </div>
                            </div>
                        </div>

                        <div class="updates-grid">
                            <!-- Update Publisher -->
                            <div class="update-publisher">
                                <div class="publisher-header">
                                    <h4><i class="fas fa-bullhorn"></i> Send Live Update</h4>
                                    <div class="update-types">
                                        <button class="update-type-btn active" data-type="announcement" onclick="groupsEventsFinalMissing.setUpdateType('announcement')">
                                            <i class="fas fa-bullhorn"></i>
                                            Announcement
                                        </button>
                                        <button class="update-type-btn" data-type="schedule" onclick="groupsEventsFinalMissing.setUpdateType('schedule')">
                                            <i class="fas fa-clock"></i>
                                            Schedule
                                        </button>
                                        <button class="update-type-btn" data-type="poll" onclick="groupsEventsFinalMissing.setUpdateType('poll')">
                                            <i class="fas fa-poll"></i>
                                            Poll
                                        </button>
                                        <button class="update-type-btn" data-type="emergency" onclick="groupsEventsFinalMissing.setUpdateType('emergency')">
                                            <i class="fas fa-exclamation-triangle"></i>
                                            Emergency
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="update-composer">
                                    <div id="announcement-composer" class="composer-panel active">
                                        <textarea class="update-textarea" placeholder="Share an important announcement with all attendees..." rows="4"></textarea>
                                        <div class="composer-options">
                                            <label class="composer-option">
                                                <input type="checkbox" checked>
                                                <span>Send push notification</span>
                                            </label>
                                            <label class="composer-option">
                                                <input type="checkbox">
                                                <span>Pin to top of feed</span>
                                            </label>
                                            <label class="composer-option">
                                                <input type="checkbox">
                                                <span>Send email notification</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div id="schedule-composer" class="composer-panel">
                                        <input type="text" class="form-input" placeholder="Schedule update title" style="margin-bottom: 0.5rem;">
                                        <div class="time-inputs">
                                            <input type="time" class="form-input" style="margin-right: 0.5rem;">
                                            <span>to</span>
                                            <input type="time" class="form-input" style="margin-left: 0.5rem;">
                                        </div>
                                        <textarea class="update-textarea" placeholder="Schedule change details..." rows="3"></textarea>
                                    </div>

                                    <div id="poll-composer" class="composer-panel">
                                        <input type="text" class="form-input" placeholder="Poll question" style="margin-bottom: 0.5rem;">
                                        <div class="poll-options">
                                            <input type="text" class="form-input" placeholder="Option 1" style="margin-bottom: 0.25rem;">
                                            <input type="text" class="form-input" placeholder="Option 2" style="margin-bottom: 0.25rem;">
                                            <button class="btn btn-small btn-secondary" onclick="groupsEventsFinalMissing.addPollOption()">+ Add Option</button>
                                        </div>
                                    </div>

                                    <div id="emergency-composer" class="composer-panel">
                                        <div class="emergency-notice">
                                            <i class="fas fa-exclamation-triangle"></i>
                                            <span>Emergency updates will be sent immediately to all attendees</span>
                                        </div>
                                        <textarea class="update-textarea emergency" placeholder="Emergency information..." rows="3"></textarea>
                                    </div>

                                    <div class="composer-actions">
                                        <div class="delivery-options">
                                            <select class="form-select">
                                                <option>Send immediately</option>
                                                <option>Schedule for later</option>
                                            </select>
                                        </div>
                                        <button class="btn btn-primary send-update-btn" onclick="groupsEventsFinalMissing.sendLiveUpdate()">
                                            <i class="fas fa-paper-plane"></i>
                                            Send Update
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Live Updates Feed -->
                            <div class="updates-feed">
                                <div class="feed-header">
                                    <h4><i class="fas fa-stream"></i> Live Updates Feed</h4>
                                    <div class="feed-controls">
                                        <button class="btn btn-small btn-secondary" onclick="groupsEventsFinalMissing.refreshFeed()">
                                            <i class="fas fa-sync"></i>
                                        </button>
                                        <button class="btn btn-small btn-secondary" onclick="groupsEventsFinalMissing.clearFeed()">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="feed-content" id="updates-feed">
                                    ${this.renderLiveUpdatesFeed()}
                                </div>
                            </div>
                        </div>

                        <!-- Live Engagement Panel -->
                        <div class="engagement-panel">
                            <div class="panel-tabs">
                                <button class="panel-tab active" data-tab="messages" onclick="groupsEventsFinalMissing.switchEngagementTab('messages')">
                                    <i class="fas fa-comments"></i>
                                    Live Chat (89)
                                </button>
                                <button class="panel-tab" data-tab="qa" onclick="groupsEventsFinalMissing.switchEngagementTab('qa')">
                                    <i class="fas fa-question-circle"></i>
                                    Q&A (12)
                                </button>
                                <button class="panel-tab" data-tab="reactions" onclick="groupsEventsFinalMissing.switchEngagementTab('reactions')">
                                    <i class="fas fa-heart"></i>
                                    Reactions
                                </button>
                            </div>

                            <div class="panel-content">
                                <div id="messages-panel" class="engagement-content active">
                                    <div class="live-messages">
                                        ${this.renderLiveMessages()}
                                    </div>
                                </div>

                                <div id="qa-panel" class="engagement-content">
                                    <div class="qa-questions">
                                        ${this.renderQAQuestions()}
                                    </div>
                                </div>

                                <div id="reactions-panel" class="engagement-content">
                                    <div class="reactions-display">
                                        ${this.renderReactionsDisplay()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="footer-status">
                        <div class="connection-status">
                            <div class="status-dot connected"></div>
                            <span>Connected to live stream</span>
                        </div>
                        <div class="last-update">Last update: Just now</div>
                    </div>
                    <div class="footer-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                        <button class="btn btn-primary" onclick="groupsEventsFinalMissing.endLiveEvent()">
                            <i class="fas fa-stop"></i> End Live Event
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupLiveUpdatesModalEvents(modal, eventId);
        return modal;
    }

    renderLiveUpdatesFeed() {
        const updates = [
            { type: 'announcement', author: 'Event Organizer', time: '2 minutes ago', content: 'Welcome everyone! We\'ll start in 5 minutes.', pinned: true },
            { type: 'schedule', author: 'Event Organizer', time: '15 minutes ago', content: 'Coffee break has been extended by 10 minutes.', icon: 'fa-clock' },
            { type: 'poll', author: 'Sarah Chen', time: '30 minutes ago', content: 'Which React pattern would you like to cover next?', responses: 45 },
            { type: 'announcement', author: 'Event Organizer', time: '45 minutes ago', content: 'Presentation slides are now available in the resources section.' }
        ];

        return updates.map(update => `
            <div class="update-item ${update.pinned ? 'pinned' : ''}" data-update-type="${update.type}">
                <div class="update-header">
                    <div class="update-author">
                        <i class="fas ${update.type === 'announcement' ? 'fa-bullhorn' : update.type === 'schedule' ? 'fa-clock' : 'fa-poll'}"></i>
                        <span class="author-name">${update.author}</span>
                    </div>
                    <div class="update-time">${update.time}</div>
                    ${update.pinned ? '<div class="pinned-badge"><i class="fas fa-thumbtack"></i></div>' : ''}
                </div>
                <div class="update-content">${update.content}</div>
                ${update.responses ? `<div class="update-stats">${update.responses} responses</div>` : ''}
                <div class="update-actions">
                    <button class="update-action-btn" onclick="groupsEventsFinalMissing.editUpdate('${update.type}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="update-action-btn" onclick="groupsEventsFinalMissing.deleteUpdate('${update.type}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderLiveMessages() {
        const messages = [
            { user: 'Alex Johnson', time: 'Just now', message: 'Great presentation! When will slides be available?', avatar: 'AJ' },
            { user: 'Maria Santos', time: '2 min ago', message: 'Can you repeat the part about useEffect dependencies?', avatar: 'MS' },
            { user: 'David Kim', time: '3 min ago', message: 'This is exactly what I needed for my project!', avatar: 'DK' },
            { user: 'Jennifer Brown', time: '5 min ago', message: 'Thanks for the demo! Very helpful.', avatar: 'JB' }
        ];

        return messages.map(msg => `
            <div class="live-message">
                <div class="message-avatar">${msg.avatar}</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-user">${msg.user}</span>
                        <span class="message-time">${msg.time}</span>
                    </div>
                    <div class="message-text">${msg.message}</div>
                </div>
                <div class="message-actions">
                    <button class="message-action-btn" onclick="groupsEventsFinalMissing.replyToMessage('${msg.user}')" title="Reply">
                        <i class="fas fa-reply"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderQAQuestions() {
        const questions = [
            { user: 'Emily Davis', time: '5 min ago', question: 'What are the performance implications of using multiple useEffect hooks?', votes: 8, answered: false },
            { user: 'Chris Lee', time: '10 min ago', question: 'How do you handle cleanup in custom hooks?', votes: 12, answered: true },
            { user: 'Amanda Taylor', time: '15 min ago', question: 'Best practices for state management in large React apps?', votes: 15, answered: false }
        ];

        return questions.map((q, i) => `
            <div class="qa-question ${q.answered ? 'answered' : ''}">
                <div class="question-header">
                    <span class="question-user">${q.user}</span>
                    <span class="question-time">${q.time}</span>
                    ${q.answered ? '<span class="answered-badge">Answered</span>' : ''}
                </div>
                <div class="question-content">${q.question}</div>
                <div class="question-actions">
                    <button class="question-action-btn" onclick="groupsEventsFinalMissing.upvoteQuestion(${i})">
                        <i class="fas fa-thumbs-up"></i> ${q.votes}
                    </button>
                    <button class="question-action-btn" onclick="groupsEventsFinalMissing.answerQuestion(${i})">
                        <i class="fas fa-microphone"></i> Answer
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderReactionsDisplay() {
        const reactions = [
            { emoji: '👍', count: 45, label: 'Like' },
            { emoji: '❤️', count: 32, label: 'Love' },
            { emoji: '😲', count: 18, label: 'Wow' },
            { emoji: '👏', count: 67, label: 'Clap' }
        ];

        return `
            <div class="reactions-grid">
                ${reactions.map(reaction => `
                    <div class="reaction-item">
                        <div class="reaction-emoji">${reaction.emoji}</div>
                        <div class="reaction-count">${reaction.count}</div>
                        <div class="reaction-label">${reaction.label}</div>
                    </div>
                `).join('')}
            </div>
            <div class="reaction-stream" id="reaction-stream">
                <!-- Live reactions will appear here -->
            </div>
        `;
    }

    setupLiveUpdatesModalEvents(modal, eventId) {
        // Setup auto-updating stats
        this.startLiveStatsUpdater();
        
        // Setup reaction stream animation
        this.startReactionStream();
    }

    startLiveStatsUpdater() {
        // Simulate live stats updates
        setInterval(() => {
            const attendeesEl = document.getElementById('live-attendees');
            const viewersEl = document.getElementById('online-viewers');
            const messagesEl = document.getElementById('live-messages');
            const questionsEl = document.getElementById('qa-questions');

            if (attendeesEl) {
                attendeesEl.textContent = Math.floor(Math.random() * 10) + 75;
            }
            if (viewersEl) {
                viewersEl.textContent = Math.floor(Math.random() * 50) + 220;
            }
            if (messagesEl) {
                messagesEl.textContent = parseInt(messagesEl.textContent) + Math.floor(Math.random() * 3);
            }
            if (questionsEl) {
                questionsEl.textContent = parseInt(questionsEl.textContent) + (Math.random() > 0.8 ? 1 : 0);
            }
        }, 5000);
    }

    startReactionStream() {
        const stream = document.getElementById('reaction-stream');
        if (!stream) return;

        const reactions = ['👍', '❤️', '😲', '👏', '🔥', '💯'];
        
        setInterval(() => {
            if (Math.random() > 0.7) {
                const reaction = document.createElement('div');
                reaction.className = 'floating-reaction';
                reaction.textContent = reactions[Math.floor(Math.random() * reactions.length)];
                reaction.style.left = Math.random() * 90 + '%';
                stream.appendChild(reaction);

                // Remove after animation
                setTimeout(() => reaction.remove(), 3000);
            }
        }, 1000);
    }

    updateEventStatus(status) {
        this.app.showToast(`Event status updated to: ${status}`, 'success');
    }

    setUpdateType(type) {
        // Hide all composer panels
        document.querySelectorAll('.composer-panel').forEach(panel => panel.classList.remove('active'));
        document.querySelectorAll('.update-type-btn').forEach(btn => btn.classList.remove('active'));

        // Show selected panel
        document.getElementById(`${type}-composer`).classList.add('active');
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
    }

    addPollOption() {
        const pollOptions = document.querySelector('.poll-options');
        const newOption = document.createElement('input');
        newOption.type = 'text';
        newOption.className = 'form-input';
        newOption.placeholder = `Option ${pollOptions.children.length}`;
        newOption.style.marginBottom = '0.25rem';
        pollOptions.insertBefore(newOption, pollOptions.lastElementChild);
    }

    sendLiveUpdate() {
        this.app.showToast('Live update sent to all attendees!', 'success');
        
        // Refresh the feed
        const feed = document.getElementById('updates-feed');
        if (feed) {
            feed.innerHTML = this.renderLiveUpdatesFeed();
        }
    }

    switchEngagementTab(tabName) {
        document.querySelectorAll('.panel-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.engagement-content').forEach(content => content.classList.remove('active'));

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-panel`).classList.add('active');
    }

    refreshFeed() {
        this.app.showToast('Feed refreshed', 'info');
    }

    clearFeed() {
        if (confirm('Are you sure you want to clear the updates feed?')) {
            this.app.showToast('Feed cleared', 'success');
        }
    }

    editUpdate(updateType) {
        this.app.showToast('Update editor opened', 'info');
    }

    deleteUpdate(updateType) {
        this.app.showToast('Update deleted', 'success');
    }

    replyToMessage(userName) {
        this.app.showToast(`Replying to ${userName}`, 'info');
    }

    upvoteQuestion(questionIndex) {
        this.app.showToast('Question upvoted', 'success');
    }

    answerQuestion(questionIndex) {
        this.app.showToast('Answering question live', 'info');
    }

    endLiveEvent() {
        if (confirm('Are you sure you want to end the live event?')) {
            this.app.showToast('Live event ended', 'success');
        }
    }

    // ========================================
    // 3. GROUP ANALYTICS DASHBOARD INTERFACE
    // ========================================

    initGroupAnalyticsDashboard() {
        // Add analytics button to group interfaces
        document.addEventListener('DOMContentLoaded', () => {
            this.addAnalyticsButtons();
        });

        // Handle analytics button clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.group-analytics-btn')) {
                const groupId = e.target.closest('.group-analytics-btn').dataset.groupId;
                this.showGroupAnalytics(groupId);
            }
        });
    }

    addAnalyticsButtons() {
        const groupElements = document.querySelectorAll('.group-item, .group-card');
        groupElements.forEach(element => {
            if (!element.querySelector('.group-analytics-btn')) {
                this.addAnalyticsButton(element);
            }
        });
    }

    addAnalyticsButton(groupElement) {
        const actionsContainer = groupElement.querySelector('.group-actions') || 
                                groupElement.querySelector('.card-actions') ||
                                groupElement;
        
        if (actionsContainer) {
            const analyticsBtn = document.createElement('button');
            analyticsBtn.className = 'group-analytics-btn btn btn-small btn-info';
            analyticsBtn.dataset.groupId = groupElement.dataset.groupId || 'group-' + Date.now();
            analyticsBtn.innerHTML = '<i class="fas fa-chart-line"></i> Analytics';
            analyticsBtn.title = 'View group analytics';
            
            actionsContainer.appendChild(analyticsBtn);
        }
    }

    showGroupAnalytics(groupId) {
        const modal = this.createGroupAnalyticsModal(groupId);
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    createGroupAnalyticsModal(groupId) {
        const modal = document.createElement('div');
        modal.id = 'group-analytics-modal';
        modal.className = 'modal extra-large';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="analytics-header">
                        <i class="fas fa-chart-line"></i>
                        <h3>Group Analytics Dashboard</h3>
                        <div class="time-range-selector">
                            <select onchange="groupsEventsFinalMissing.changeAnalyticsTimeRange(this.value)">
                                <option value="7d">Last 7 days</option>
                                <option value="30d" selected>Last 30 days</option>
                                <option value="90d">Last 3 months</option>
                                <option value="1y">Last year</option>
                            </select>
                        </div>
                    </div>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="analytics-container">
                        <!-- Key Metrics Overview -->
                        <div class="metrics-overview">
                            <div class="metrics-grid">
                                <div class="metric-card primary">
                                    <div class="metric-icon"><i class="fas fa-users"></i></div>
                                    <div class="metric-content">
                                        <div class="metric-number">1,247</div>
                                        <div class="metric-label">Total Members</div>
                                        <div class="metric-change positive">+8.2%</div>
                                    </div>
                                    <div class="metric-chart">
                                        <div class="mini-chart" style="background: linear-gradient(45deg, var(--primary) 0%, var(--primary-light) 100%); height: 30px;"></div>
                                    </div>
                                </div>
                                
                                <div class="metric-card success">
                                    <div class="metric-icon"><i class="fas fa-eye"></i></div>
                                    <div class="metric-content">
                                        <div class="metric-number">89%</div>
                                        <div class="metric-label">Engagement Rate</div>
                                        <div class="metric-change positive">+2.1%</div>
                                    </div>
                                    <div class="metric-chart">
                                        <div class="mini-chart" style="background: linear-gradient(45deg, var(--success) 0%, var(--success-light) 100%); height: 30px;"></div>
                                    </div>
                                </div>

                                <div class="metric-card warning">
                                    <div class="metric-icon"><i class="fas fa-comments"></i></div>
                                    <div class="metric-content">
                                        <div class="metric-number">2,456</div>
                                        <div class="metric-label">Messages</div>
                                        <div class="metric-change positive">+15.3%</div>
                                    </div>
                                    <div class="metric-chart">
                                        <div class="mini-chart" style="background: linear-gradient(45deg, var(--warning) 0%, var(--warning-light) 100%); height: 30px;"></div>
                                    </div>
                                </div>

                                <div class="metric-card info">
                                    <div class="metric-icon"><i class="fas fa-calendar"></i></div>
                                    <div class="metric-content">
                                        <div class="metric-number">23</div>
                                        <div class="metric-label">Events Created</div>
                                        <div class="metric-change positive">+4</div>
                                    </div>
                                    <div class="metric-chart">
                                        <div class="mini-chart" style="background: linear-gradient(45deg, var(--info) 0%, var(--info-light) 100%); height: 30px;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Charts and Detailed Analytics -->
                        <div class="analytics-grid">
                            <!-- Member Growth Chart -->
                            <div class="analytics-card">
                                <div class="card-header">
                                    <h4><i class="fas fa-user-plus"></i> Member Growth</h4>
                                    <div class="chart-controls">
                                        <button class="chart-control-btn active">New Members</button>
                                        <button class="chart-control-btn">Active Members</button>
                                    </div>
                                </div>
                                <div class="card-content">
                                    <div class="chart-container">
                                        <div class="line-chart" id="member-growth-chart">
                                            <!-- Simulated line chart with CSS -->
                                            <div class="chart-grid">
                                                ${Array.from({length: 30}, (_, i) => `
                                                    <div class="chart-bar" style="height: ${Math.random() * 80 + 20}px;" title="Day ${i + 1}: +${Math.floor(Math.random() * 10) + 1} members"></div>
                                                `).join('')}
                                            </div>
                                            <div class="chart-trend-line"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Activity Heatmap -->
                            <div class="analytics-card">
                                <div class="card-header">
                                    <h4><i class="fas fa-fire"></i> Activity Heatmap</h4>
                                    <div class="chart-legend">
                                        <span class="legend-item"><div class="legend-color low"></div>Low</span>
                                        <span class="legend-item"><div class="legend-color medium"></div>Medium</span>
                                        <span class="legend-item"><div class="legend-color high"></div>High</span>
                                    </div>
                                </div>
                                <div class="card-content">
                                    <div class="heatmap-container">
                                        <div class="heatmap-grid">
                                            ${Array.from({length: 7}, (_, day) => `
                                                <div class="heatmap-day">
                                                    <div class="day-label">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]}</div>
                                                    ${Array.from({length: 24}, (_, hour) => `
                                                        <div class="heatmap-cell ${Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'}" 
                                                             title="${hour}:00 - Activity Level"></div>
                                                    `).join('')}
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Top Contributors -->
                            <div class="analytics-card">
                                <div class="card-header">
                                    <h4><i class="fas fa-trophy"></i> Top Contributors</h4>
                                    <select onchange="groupsEventsFinalMissing.changeContributorMetric(this.value)">
                                        <option value="posts">Most Posts</option>
                                        <option value="engagement">Most Engagement</option>
                                        <option value="events">Most Events</option>
                                    </select>
                                </div>
                                <div class="card-content">
                                    <div class="contributors-list">
                                        ${this.renderTopContributors()}
                                    </div>
                                </div>
                            </div>

                            <!-- Content Performance -->
                            <div class="analytics-card">
                                <div class="card-header">
                                    <h4><i class="fas fa-chart-bar"></i> Content Performance</h4>
                                    <div class="performance-tabs">
                                        <button class="perf-tab active" data-tab="posts">Posts</button>
                                        <button class="perf-tab" data-tab="events">Events</button>
                                    </div>
                                </div>
                                <div class="card-content">
                                    <div class="performance-metrics">
                                        <div class="perf-stat">
                                            <div class="perf-number">156</div>
                                            <div class="perf-label">Total Posts</div>
                                        </div>
                                        <div class="perf-stat">
                                            <div class="perf-number">4.2k</div>
                                            <div class="perf-label">Total Likes</div>
                                        </div>
                                        <div class="perf-stat">
                                            <div class="perf-number">892</div>
                                            <div class="perf-label">Comments</div>
                                        </div>
                                        <div class="perf-stat">
                                            <div class="perf-number">67%</div>
                                            <div class="perf-label">Engagement</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Member Demographics -->
                            <div class="analytics-card">
                                <div class="card-header">
                                    <h4><i class="fas fa-users-cog"></i> Member Demographics</h4>
                                </div>
                                <div class="card-content">
                                    <div class="demographics-container">
                                        <div class="demographic-section">
                                            <h5>Member Roles</h5>
                                            <div class="role-distribution">
                                                <div class="role-item">
                                                    <span class="role-name">Members</span>
                                                    <div class="role-bar">
                                                        <div class="role-fill" style="width: 85%"></div>
                                                    </div>
                                                    <span class="role-count">1,058</span>
                                                </div>
                                                <div class="role-item">
                                                    <span class="role-name">Moderators</span>
                                                    <div class="role-bar">
                                                        <div class="role-fill" style="width: 12%"></div>
                                                    </div>
                                                    <span class="role-count">144</span>
                                                </div>
                                                <div class="role-item">
                                                    <span class="role-name">Admins</span>
                                                    <div class="role-bar">
                                                        <div class="role-fill" style="width: 3%"></div>
                                                    </div>
                                                    <span class="role-count">45</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="demographic-section">
                                            <h5>Activity Status</h5>
                                            <div class="activity-pie-chart">
                                                <div class="pie-segment active" style="--percentage: 45"></div>
                                                <div class="pie-segment occasional" style="--percentage: 35"></div>
                                                <div class="pie-segment inactive" style="--percentage: 20"></div>
                                            </div>
                                            <div class="pie-legend">
                                                <span class="legend-item"><div class="legend-color active"></div>Active (45%)</span>
                                                <span class="legend-item"><div class="legend-color occasional"></div>Occasional (35%)</span>
                                                <span class="legend-item"><div class="legend-color inactive"></div>Inactive (20%)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Export and Report Options -->
                        <div class="analytics-actions">
                            <div class="export-options">
                                <button class="btn btn-secondary" onclick="groupsEventsFinalMissing.exportAnalyticsReport()">
                                    <i class="fas fa-download"></i> Export Report
                                </button>
                                <button class="btn btn-secondary" onclick="groupsEventsFinalMissing.scheduleReport()">
                                    <i class="fas fa-clock"></i> Schedule Report
                                </button>
                                <button class="btn btn-secondary" onclick="groupsEventsFinalMissing.shareAnalytics()">
                                    <i class="fas fa-share"></i> Share Analytics
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="footer-info">
                        <span class="auto-refresh">Auto-refresh: ON</span>
                        <span class="last-updated">Last updated: 2 minutes ago</span>
                    </div>
                    <div class="footer-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                        <button class="btn btn-primary" onclick="groupsEventsFinalMissing.refreshAnalytics()">
                            <i class="fas fa-sync"></i> Refresh Data
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupAnalyticsModalEvents(modal, groupId);
        return modal;
    }

    renderTopContributors() {
        const contributors = [
            { name: 'Sarah Johnson', posts: 45, engagement: 892, events: 8, avatar: 'SJ' },
            { name: 'Mike Chen', posts: 38, engagement: 756, events: 12, avatar: 'MC' },
            { name: 'Emily Davis', posts: 32, engagement: 643, events: 6, avatar: 'ED' },
            { name: 'Alex Rodriguez', posts: 29, engagement: 589, events: 4, avatar: 'AR' },
            { name: 'Jessica Wang', posts: 24, engagement: 478, events: 7, avatar: 'JW' }
        ];

        return contributors.map((contributor, index) => `
            <div class="contributor-item">
                <div class="contributor-rank">#${index + 1}</div>
                <div class="contributor-avatar">${contributor.avatar}</div>
                <div class="contributor-info">
                    <div class="contributor-name">${contributor.name}</div>
                    <div class="contributor-stats">
                        <span>${contributor.posts} posts</span>
                        <span>${contributor.engagement} engagement</span>
                        <span>${contributor.events} events</span>
                    </div>
                </div>
                <div class="contributor-score">
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${100 - (index * 15)}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupAnalyticsModalEvents(modal, groupId) {
        // Setup chart interactions and real-time updates
    }

    changeAnalyticsTimeRange(range) {
        this.app.showToast(`Analytics updated for ${range}`, 'info');
    }

    changeContributorMetric(metric) {
        this.app.showToast(`Showing top contributors by ${metric}`, 'info');
    }

    exportAnalyticsReport() {
        this.app.showToast('Analytics report exported successfully', 'success');
    }

    scheduleReport() {
        this.app.showToast('Report scheduling opened', 'info');
    }

    shareAnalytics() {
        this.app.showToast('Analytics sharing link created', 'success');
    }

    refreshAnalytics() {
        this.app.showToast('Analytics data refreshed', 'success');
    }

    // ========================================
    // 4. EVENT NOTIFICATION MANAGEMENT INTERFACE
    // ========================================

    initEventNotificationManagement() {
        // Add notification management button to event interfaces
        document.addEventListener('DOMContentLoaded', () => {
            this.addNotificationButtons();
        });

        // Handle notification management clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.manage-notifications-btn')) {
                const eventId = e.target.closest('.manage-notifications-btn').dataset.eventId;
                this.showEventNotifications(eventId);
            }
        });
    }

    addNotificationButtons() {
        const eventElements = document.querySelectorAll('.event-item, .event-card');
        eventElements.forEach(element => {
            if (!element.querySelector('.manage-notifications-btn')) {
                this.addNotificationButton(element);
            }
        });
    }

    addNotificationButton(eventElement) {
        const actionsContainer = eventElement.querySelector('.event-actions') || 
                                eventElement.querySelector('.card-actions') ||
                                eventElement;
        
        if (actionsContainer) {
            const notificationBtn = document.createElement('button');
            notificationBtn.className = 'manage-notifications-btn btn btn-small btn-warning';
            notificationBtn.dataset.eventId = eventElement.dataset.eventId || 'event-' + Date.now();
            notificationBtn.innerHTML = '<i class="fas fa-bell"></i> Notifications';
            notificationBtn.title = 'Manage event notifications';
            
            actionsContainer.appendChild(notificationBtn);
        }
    }

    showEventNotifications(eventId) {
        const modal = this.createNotificationModal(eventId);
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    createNotificationModal(eventId) {
        const modal = document.createElement('div');
        modal.id = 'event-notification-modal';
        modal.className = 'modal large';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="notification-header">
                        <i class="fas fa-bell"></i>
                        <h3>Event Notification Management</h3>
                        <div class="notification-status">
                            <span class="status-indicator active"></span>
                            <span>Notifications Active</span>
                        </div>
                    </div>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="notification-management-container">
                        <!-- Event Info Summary -->
                        <div class="event-summary-card">
                            <div class="summary-content">
                                <h4>React Development Workshop</h4>
                                <div class="event-meta">
                                    <span><i class="fas fa-calendar"></i> March 25, 2024</span>
                                    <span><i class="fas fa-clock"></i> 2:00 PM - 6:00 PM</span>
                                    <span><i class="fas fa-users"></i> 89 attendees</span>
                                </div>
                            </div>
                            <div class="notification-overview">
                                <div class="overview-stat">
                                    <div class="stat-number">156</div>
                                    <div class="stat-label">Total Sent</div>
                                </div>
                                <div class="overview-stat">
                                    <div class="stat-number">142</div>
                                    <div class="stat-label">Delivered</div>
                                </div>
                                <div class="overview-stat">
                                    <div class="stat-number">89%</div>
                                    <div class="stat-label">Open Rate</div>
                                </div>
                            </div>
                        </div>

                        <!-- Notification Types -->
                        <div class="notification-types">
                            <div class="type-tabs">
                                <button class="type-tab active" data-tab="reminders" onclick="groupsEventsFinalMissing.switchNotificationTab('reminders')">
                                    <i class="fas fa-clock"></i>
                                    <span>Event Reminders</span>
                                </button>
                                <button class="type-tab" data-tab="updates" onclick="groupsEventsFinalMissing.switchNotificationTab('updates')">
                                    <i class="fas fa-bullhorn"></i>
                                    <span>Event Updates</span>
                                </button>
                                <button class="type-tab" data-tab="followup" onclick="groupsEventsFinalMissing.switchNotificationTab('followup')">
                                    <i class="fas fa-paper-plane"></i>
                                    <span>Follow-up</span>
                                </button>
                                <button class="type-tab" data-tab="custom" onclick="groupsEventsFinalMissing.switchNotificationTab('custom')">
                                    <i class="fas fa-edit"></i>
                                    <span>Custom Messages</span>
                                </button>
                            </div>

                            <!-- Reminder Notifications -->
                            <div class="notification-content active" data-tab="reminders">
                                <div class="content-header">
                                    <h4>Event Reminder Settings</h4>
                                    <button class="btn btn-primary btn-small" onclick="groupsEventsFinalMissing.createReminder()">
                                        <i class="fas fa-plus"></i> Add Reminder
                                    </button>
                                </div>

                                <div class="reminder-list">
                                    ${this.renderReminderList()}
                                </div>

                                <div class="reminder-templates">
                                    <h5>Quick Templates</h5>
                                    <div class="template-grid">
                                        <button class="template-btn" onclick="groupsEventsFinalMissing.applyTemplate('24h-reminder')">
                                            <i class="fas fa-clock"></i>
                                            <span>24 Hour Reminder</span>
                                        </button>
                                        <button class="template-btn" onclick="groupsEventsFinalMissing.applyTemplate('1h-reminder')">
                                            <i class="fas fa-clock"></i>
                                            <span>1 Hour Reminder</span>
                                        </button>
                                        <button class="template-btn" onclick="groupsEventsFinalMissing.applyTemplate('starting-now')">
                                            <i class="fas fa-play"></i>
                                            <span>Event Starting</span>
                                        </button>
                                        <button class="template-btn" onclick="groupsEventsFinalMissing.applyTemplate('last-chance')">
                                            <i class="fas fa-exclamation"></i>
                                            <span>Last Chance</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Event Updates -->
                            <div class="notification-content" data-tab="updates">
                                <div class="content-header">
                                    <h4>Event Update Notifications</h4>
                                    <button class="btn btn-primary btn-small" onclick="groupsEventsFinalMissing.sendUpdate()">
                                        <i class="fas fa-plus"></i> Send Update
                                    </button>
                                </div>

                                <div class="update-composer">
                                    <div class="composer-header">
                                        <select class="form-select">
                                            <option>Schedule Change</option>
                                            <option>Location Update</option>
                                            <option>Speaker Change</option>
                                            <option>General Update</option>
                                            <option>Emergency Notice</option>
                                        </select>
                                    </div>
                                    <textarea class="form-textarea" placeholder="Type your update message..." rows="4"></textarea>
                                    <div class="composer-options">
                                        <label class="composer-option">
                                            <input type="checkbox" checked>
                                            <span>Send push notification</span>
                                        </label>
                                        <label class="composer-option">
                                            <input type="checkbox" checked>
                                            <span>Send email notification</span>
                                        </label>
                                        <label class="composer-option">
                                            <input type="checkbox">
                                            <span>SMS notification (premium)</span>
                                        </label>
                                    </div>
                                    <div class="composer-actions">
                                        <button class="btn btn-secondary" onclick="groupsEventsFinalMissing.previewUpdate()">
                                            <i class="fas fa-eye"></i> Preview
                                        </button>
                                        <button class="btn btn-primary" onclick="groupsEventsFinalMissing.sendEventUpdate()">
                                            <i class="fas fa-paper-plane"></i> Send Update
                                        </button>
                                    </div>
                                </div>

                                <div class="sent-updates">
                                    <h5>Recent Updates</h5>
                                    ${this.renderSentUpdates()}
                                </div>
                            </div>

                            <!-- Follow-up Notifications -->
                            <div class="notification-content" data-tab="followup">
                                <div class="content-header">
                                    <h4>Post-Event Follow-up</h4>
                                    <div class="followup-controls">
                                        <label class="toggle-option">
                                            <input type="checkbox" checked>
                                            <span>Enable automatic follow-up</span>
                                        </label>
                                    </div>
                                </div>

                                <div class="followup-settings">
                                    <div class="setting-group">
                                        <h5>Thank You Message</h5>
                                        <div class="setting-row">
                                            <label>Send after:</label>
                                            <select class="form-select">
                                                <option>Immediately after event</option>
                                                <option>1 hour after event</option>
                                                <option>24 hours after event</option>
                                            </select>
                                        </div>
                                        <textarea class="form-textarea" placeholder="Thank you for attending..." rows="3"></textarea>
                                    </div>

                                    <div class="setting-group">
                                        <h5>Feedback Request</h5>
                                        <div class="setting-row">
                                            <label>Send after:</label>
                                            <select class="form-select">
                                                <option>24 hours after event</option>
                                                <option>48 hours after event</option>
                                                <option>1 week after event</option>
                                            </select>
                                        </div>
                                        <textarea class="form-textarea" placeholder="We'd love your feedback..." rows="3"></textarea>
                                    </div>

                                    <div class="setting-group">
                                        <h5>Future Event Promotion</h5>
                                        <div class="setting-row">
                                            <label>Send after:</label>
                                            <select class="form-select">
                                                <option>1 week after event</option>
                                                <option>2 weeks after event</option>
                                                <option>1 month after event</option>
                                            </select>
                                        </div>
                                        <textarea class="form-textarea" placeholder="Don't miss our upcoming events..." rows="3"></textarea>
                                    </div>
                                </div>
                            </div>

                            <!-- Custom Messages -->
                            <div class="notification-content" data-tab="custom">
                                <div class="content-header">
                                    <h4>Custom Message Creator</h4>
                                    <div class="message-controls">
                                        <select class="form-select">
                                            <option>Send to All Attendees</option>
                                            <option>Send to VIP Attendees</option>
                                            <option>Send to No-Shows</option>
                                            <option>Send to Specific Group</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="custom-message-composer">
                                    <div class="message-editor">
                                        <div class="editor-toolbar">
                                            <button class="toolbar-btn" title="Bold"><i class="fas fa-bold"></i></button>
                                            <button class="toolbar-btn" title="Italic"><i class="fas fa-italic"></i></button>
                                            <button class="toolbar-btn" title="Link"><i class="fas fa-link"></i></button>
                                            <button class="toolbar-btn" title="Image"><i class="fas fa-image"></i></button>
                                            <button class="toolbar-btn" title="Variables"><i class="fas fa-code"></i></button>
                                        </div>
                                        <textarea class="message-textarea" placeholder="Compose your custom message..." rows="6"></textarea>
                                        <div class="editor-footer">
                                            <div class="variable-helpers">
                                                <span>Variables:</span>
                                                <button class="variable-btn" onclick="groupsEventsFinalMissing.insertVariable('{{name}}')">{name}</button>
                                                <button class="variable-btn" onclick="groupsEventsFinalMissing.insertVariable('{{event}}')">{event}</button>
                                                <button class="variable-btn" onclick="groupsEventsFinalMissing.insertVariable('{{date}}')">{date}</button>
                                                <button class="variable-btn" onclick="groupsEventsFinalMissing.insertVariable('{{time}}')">{time}</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="message-settings">
                                        <div class="setting-section">
                                            <h5>Delivery Settings</h5>
                                            <label class="setting-option">
                                                <input type="radio" name="delivery" value="immediate" checked>
                                                <span>Send immediately</span>
                                            </label>
                                            <label class="setting-option">
                                                <input type="radio" name="delivery" value="scheduled">
                                                <span>Schedule for later</span>
                                            </label>
                                            <div class="schedule-options" style="display: none;">
                                                <input type="datetime-local" class="form-input">
                                            </div>
                                        </div>

                                        <div class="setting-section">
                                            <h5>Notification Channels</h5>
                                            <label class="setting-option">
                                                <input type="checkbox" checked>
                                                <span>Push notification</span>
                                            </label>
                                            <label class="setting-option">
                                                <input type="checkbox" checked>
                                                <span>Email</span>
                                            </label>
                                            <label class="setting-option">
                                                <input type="checkbox">
                                                <span>SMS (premium)</span>
                                            </label>
                                            <label class="setting-option">
                                                <input type="checkbox">
                                                <span>In-app message</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Notification Analytics -->
                        <div class="notification-analytics">
                            <div class="analytics-header">
                                <h4><i class="fas fa-chart-bar"></i> Notification Performance</h4>
                                <select class="form-select">
                                    <option>Last 7 days</option>
                                    <option>Last 30 days</option>
                                    <option>All time</option>
                                </select>
                            </div>
                            
                            <div class="analytics-grid">
                                <div class="analytics-stat">
                                    <div class="stat-icon success"><i class="fas fa-paper-plane"></i></div>
                                    <div class="stat-content">
                                        <div class="stat-number">456</div>
                                        <div class="stat-label">Total Sent</div>
                                        <div class="stat-change positive">+12%</div>
                                    </div>
                                </div>
                                <div class="analytics-stat">
                                    <div class="stat-icon info"><i class="fas fa-eye"></i></div>
                                    <div class="stat-content">
                                        <div class="stat-number">89%</div>
                                        <div class="stat-label">Open Rate</div>
                                        <div class="stat-change positive">+3%</div>
                                    </div>
                                </div>
                                <div class="analytics-stat">
                                    <div class="stat-icon warning"><i class="fas fa-mouse-pointer"></i></div>
                                    <div class="stat-content">
                                        <div class="stat-number">34%</div>
                                        <div class="stat-label">Click Rate</div>
                                        <div class="stat-change positive">+5%</div>
                                    </div>
                                </div>
                                <div class="analytics-stat">
                                    <div class="stat-icon primary"><i class="fas fa-reply"></i></div>
                                    <div class="stat-content">
                                        <div class="stat-number">67%</div>
                                        <div class="stat-label">Response Rate</div>
                                        <div class="stat-change positive">+8%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="footer-info">
                        <div class="notification-credits">
                            <i class="fas fa-coins"></i>
                            <span>Credits remaining: 1,247</span>
                        </div>
                    </div>
                    <div class="footer-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                        <button class="btn btn-primary" onclick="groupsEventsFinalMissing.saveNotificationSettings()">
                            <i class="fas fa-save"></i> Save Settings
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupNotificationModalEvents(modal, eventId);
        return modal;
    }

    renderReminderList() {
        const reminders = [
            { type: '24h-before', title: '24 Hours Before Event', enabled: true, sent: 89, scheduled: true },
            { type: '1h-before', title: '1 Hour Before Event', enabled: true, sent: 0, scheduled: false },
            { type: 'starting-now', title: 'Event Starting Now', enabled: false, sent: 0, scheduled: false }
        ];

        return reminders.map((reminder, index) => `
            <div class="reminder-item ${reminder.enabled ? 'enabled' : 'disabled'}">
                <div class="reminder-toggle">
                    <label class="switch">
                        <input type="checkbox" ${reminder.enabled ? 'checked' : ''} onchange="groupsEventsFinalMissing.toggleReminder(${index})">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="reminder-content">
                    <div class="reminder-title">${reminder.title}</div>
                    <div class="reminder-status">
                        ${reminder.sent > 0 ? `Sent to ${reminder.sent} attendees` : reminder.scheduled ? 'Scheduled' : 'Not scheduled'}
                    </div>
                </div>
                <div class="reminder-actions">
                    <button class="action-btn" onclick="groupsEventsFinalMissing.editReminder(${index})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="groupsEventsFinalMissing.testReminder(${index})" title="Send Test">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                    <button class="action-btn" onclick="groupsEventsFinalMissing.deleteReminder(${index})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderSentUpdates() {
        const updates = [
            { type: 'Schedule Change', message: 'Coffee break extended by 10 minutes', sent: '2 hours ago', recipients: 89, opened: 67 },
            { type: 'Location Update', message: 'Room changed to Conference Hall B', sent: '1 day ago', recipients: 89, opened: 82 },
            { type: 'General Update', message: 'Presentation slides now available', sent: '2 days ago', recipients: 89, opened: 74 }
        ];

        return updates.map(update => `
            <div class="sent-update-item">
                <div class="update-info">
                    <div class="update-type-badge">${update.type}</div>
                    <div class="update-message">${update.message}</div>
                    <div class="update-meta">
                        <span>Sent ${update.sent}</span>
                        <span>${update.recipients} recipients</span>
                        <span>${update.opened} opened (${Math.round((update.opened / update.recipients) * 100)}%)</span>
                    </div>
                </div>
                <div class="update-actions">
                    <button class="action-btn" onclick="groupsEventsFinalMissing.viewUpdateStats('${update.type}')" title="View Stats">
                        <i class="fas fa-chart-bar"></i>
                    </button>
                    <button class="action-btn" onclick="groupsEventsFinalMissing.resendUpdate('${update.type}')" title="Resend">
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupNotificationModalEvents(modal, eventId) {
        // Setup notification management events
    }

    switchNotificationTab(tabName) {
        document.querySelectorAll('.type-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.notification-content').forEach(content => content.classList.remove('active'));

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.querySelector(`.notification-content[data-tab="${tabName}"]`).classList.add('active');
    }

    createReminder() {
        this.app.showToast('Reminder creator opened', 'info');
    }

    applyTemplate(templateType) {
        this.app.showToast(`${templateType} template applied`, 'success');
    }

    sendUpdate() {
        this.app.showToast('Update composer opened', 'info');
    }

    previewUpdate() {
        this.app.showToast('Update preview opened', 'info');
    }

    sendEventUpdate() {
        this.app.showToast('Event update sent to all attendees!', 'success');
    }

    insertVariable(variable) {
        this.app.showToast(`Variable ${variable} inserted`, 'info');
    }

    toggleReminder(index) {
        this.app.showToast('Reminder setting updated', 'success');
    }

    editReminder(index) {
        this.app.showToast('Reminder editor opened', 'info');
    }

    testReminder(index) {
        this.app.showToast('Test reminder sent to your email', 'success');
    }

    deleteReminder(index) {
        if (confirm('Delete this reminder?')) {
            this.app.showToast('Reminder deleted', 'success');
        }
    }

    viewUpdateStats(updateType) {
        this.app.showToast(`${updateType} statistics opened`, 'info');
    }

    resendUpdate(updateType) {
        this.app.showToast(`Resending ${updateType}`, 'info');
    }

    saveNotificationSettings() {
        this.app.showToast('Notification settings saved successfully!', 'success');
    }
}

// Export for global access
window.GroupsEventsFinalMissingUIComponents = GroupsEventsFinalMissingUIComponents;

// Initialize when DOM is ready and app is available
document.addEventListener('DOMContentLoaded', () => {
    if (window.connectHub) {
        window.groupsEventsFinalMissing = new GroupsEventsFinalMissingUIComponents(window.connectHub);
    }
});
