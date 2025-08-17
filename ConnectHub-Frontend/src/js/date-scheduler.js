class DateScheduler {
    constructor() {
        this.currentMatch = null;
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedActivity = null;
        this.suggestedActivities = [
            { id: 'coffee', name: '☕ Coffee Date', description: 'Meet for coffee and conversation' },
            { id: 'dinner', name: '🍽️ Dinner Date', description: 'Share a meal together' },
            { id: 'drinks', name: '🍹 Drinks', description: 'Casual drinks at a bar' },
            { id: 'walk', name: '🚶‍♂️ Walk in the Park', description: 'Take a stroll together' },
            { id: 'movie', name: '🎬 Movie Night', description: 'Watch a movie together' },
            { id: 'museum', name: '🏛️ Museum Visit', description: 'Explore art and culture' },
            { id: 'activity', name: '🎯 Fun Activity', description: 'Mini golf, bowling, etc.' },
            { id: 'lunch', name: '🥗 Lunch Date', description: 'Meet for a casual lunch' }
        ];
    }

    // Show the date scheduler modal
    showDateScheduler(matchData, callback) {
        this.currentMatch = matchData;
        this.callback = callback;

        const modal = this.createDateSchedulerModal();
        document.body.appendChild(modal);

        // Initialize calendar and time picker
        this.initializeDatePicker();
        this.initializeTimePicker();
        this.initializeActivitySelector();

        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    }

    createDateSchedulerModal() {
        const modal = document.createElement('div');
        modal.className = 'date-scheduler-modal';
        modal.innerHTML = `
            <div class="date-scheduler-container">
                <div class="date-scheduler-header">
                    <h2>📅 Set up a Date</h2>
                    <p>Plan your perfect first date with ${this.currentMatch?.name || 'your match'}!</p>
                    <button class="close-scheduler" onclick="this.closest('.date-scheduler-modal').remove()">×</button>
                </div>

                <div class="date-scheduler-content">
                    <!-- Activity Selection -->
                    <div class="scheduler-section">
                        <h3>🎯 What would you like to do?</h3>
                        <div class="activity-grid">
                            ${this.suggestedActivities.map(activity => `
                                <button class="activity-option" data-activity="${activity.id}">
                                    <div class="activity-icon">${activity.name.split(' ')[0]}</div>
                                    <div class="activity-name">${activity.name.substring(2)}</div>
                                    <div class="activity-description">${activity.description}</div>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Date Selection -->
                    <div class="scheduler-section">
                        <h3>📅 Choose a Date</h3>
                        <div class="date-picker-container">
                            <div class="calendar-grid" id="calendar-grid"></div>
                        </div>
                    </div>

                    <!-- Time Selection -->
                    <div class="scheduler-section">
                        <h3>🕐 Pick a Time</h3>
                        <div class="time-picker-container">
                            <div class="time-slots" id="time-slots"></div>
                        </div>
                    </div>

                    <!-- Date Summary -->
                    <div class="date-summary" id="date-summary" style="display: none;">
                        <h3>📋 Date Summary</h3>
                        <div class="summary-content">
                            <div class="summary-item">
                                <span class="summary-label">Activity:</span>
                                <span class="summary-value" id="summary-activity">-</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Date:</span>
                                <span class="summary-value" id="summary-date">-</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Time:</span>
                                <span class="summary-value" id="summary-time">-</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="date-scheduler-actions">
                    <button class="scheduler-btn cancel-btn" onclick="this.closest('.date-scheduler-modal').remove()">Cancel</button>
                    <button class="scheduler-btn propose-btn" id="propose-date-btn" disabled>Propose Date</button>
                </div>
            </div>
        `;

        // Add event listeners
        this.addDateSchedulerEventListeners(modal);
        this.addDateSchedulerStyles();

        return modal;
    }

    addDateSchedulerEventListeners(modal) {
        // Activity selection
        const activityButtons = modal.querySelectorAll('.activity-option');
        activityButtons.forEach(button => {
            button.addEventListener('click', () => {
                activityButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                this.selectedActivity = button.dataset.activity;
                this.updateDateSummary();
                this.checkFormComplete();
            });
        });

        // Propose date button
        const proposeBtnElement = modal.querySelector('#propose-date-btn');
        proposeBtnElement.addEventListener('click', () => {
            this.proposeDate(modal);
        });
    }

    initializeDatePicker() {
        const calendarGrid = document.getElementById('calendar-grid');
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Generate calendar for current and next month
        this.generateCalendar(calendarGrid, currentYear, currentMonth);
    }

    generateCalendar(container, year, month) {
        const today = new Date();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        container.innerHTML = `
            <div class="calendar-header">
                <h4>${new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h4>
            </div>
            <div class="calendar-days">
                <div class="day-header">Sun</div>
                <div class="day-header">Mon</div>
                <div class="day-header">Tue</div>
                <div class="day-header">Wed</div>
                <div class="day-header">Thu</div>
                <div class="day-header">Fri</div>
                <div class="day-header">Sat</div>
                ${this.generateCalendarDays(year, month, daysInMonth, startDayOfWeek, today)}
            </div>
        `;

        // Add click listeners to date buttons
        const dateButtons = container.querySelectorAll('.calendar-date:not(.disabled)');
        dateButtons.forEach(button => {
            button.addEventListener('click', () => {
                dateButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                this.selectedDate = new Date(year, month, parseInt(button.textContent));
                this.updateDateSummary();
                this.checkFormComplete();
            });
        });
    }

    generateCalendarDays(year, month, daysInMonth, startDayOfWeek, today) {
        let html = '';
        
        // Empty cells for days before the first day of month
        for (let i = 0; i < startDayOfWeek; i++) {
            html += '<div class="calendar-date empty"></div>';
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const isToday = currentDate.toDateString() === today.toDateString();
            const isPast = currentDate < today && !isToday;
            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

            let classes = 'calendar-date';
            if (isPast) classes += ' disabled';
            if (isToday) classes += ' today';
            if (isWeekend && !isPast) classes += ' weekend';

            html += `<div class="${classes}">${day}</div>`;
        }

        return html;
    }

    initializeTimePicker() {
        const timeSlotsContainer = document.getElementById('time-slots');
        const timeSlots = [
            '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
            '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
        ];

        timeSlotsContainer.innerHTML = timeSlots.map(time => 
            `<button class="time-slot" data-time="${time}">${time}</button>`
        ).join('');

        // Add click listeners
        const timeButtons = timeSlotsContainer.querySelectorAll('.time-slot');
        timeButtons.forEach(button => {
            button.addEventListener('click', () => {
                timeButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                this.selectedTime = button.dataset.time;
                this.updateDateSummary();
                this.checkFormComplete();
            });
        });
    }

    initializeActivitySelector() {
        // Activity selection is already handled in addDateSchedulerEventListeners
    }

    updateDateSummary() {
        const summaryElement = document.getElementById('date-summary');
        
        if (this.selectedActivity || this.selectedDate || this.selectedTime) {
            summaryElement.style.display = 'block';
            
            if (this.selectedActivity) {
                const activity = this.suggestedActivities.find(a => a.id === this.selectedActivity);
                document.getElementById('summary-activity').textContent = activity ? activity.name : '-';
            }
            
            if (this.selectedDate) {
                document.getElementById('summary-date').textContent = 
                    this.selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
            }
            
            if (this.selectedTime) {
                document.getElementById('summary-time').textContent = this.selectedTime;
            }
        }
    }

    checkFormComplete() {
        const proposeBtnElement = document.getElementById('propose-date-btn');
        if (this.selectedActivity && this.selectedDate && this.selectedTime) {
            proposeBtnElement.disabled = false;
            proposeBtnElement.classList.add('enabled');
        } else {
            proposeBtnElement.disabled = true;
            proposeBtnElement.classList.remove('enabled');
        }
    }

    async proposeDate(modal) {
        if (!this.selectedActivity || !this.selectedDate || !this.selectedTime) {
            alert('Please select all date details before proposing.');
            return;
        }

        const proposeBtnElement = modal.querySelector('#propose-date-btn');
        proposeBtnElement.textContent = 'Proposing...';
        proposeBtnElement.disabled = true;

        try {
            // Create date proposal
            const dateProposal = {
                matchId: this.currentMatch?.id,
                activity: this.selectedActivity,
                date: this.selectedDate.toISOString().split('T')[0],
                time: this.selectedTime,
                location: null, // Could be added in future
                message: `Would you like to go for ${this.suggestedActivities.find(a => a.id === this.selectedActivity)?.name.substring(2)} on ${this.selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${this.selectedTime}?`
            };

            // Send to API (if available)
            const response = await this.submitDateProposal(dateProposal);
            
            // Show success message
            this.showDateProposalSuccess(modal, dateProposal);
            
            // Add to calendar if supported
            this.addToCalendar(dateProposal);

        } catch (error) {
            console.error('Error proposing date:', error);
            proposeBtnElement.textContent = 'Error - Try Again';
            setTimeout(() => {
                proposeBtnElement.textContent = 'Propose Date';
                proposeBtnElement.disabled = false;
            }, 2000);
        }
    }

    async submitDateProposal(proposal) {
        // Try to submit to API, but handle gracefully if offline
        try {
            const response = await fetch('/api/dating/propose-date', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(proposal)
            });

            if (!response.ok) {
                throw new Error('Failed to submit date proposal');
            }

            return await response.json();
        } catch (error) {
            // Store locally if API is not available
            console.log('Storing date proposal locally:', proposal);
            const storedProposals = JSON.parse(localStorage.getItem('dateProposals') || '[]');
            storedProposals.push({
                ...proposal,
                id: Date.now().toString(),
                status: 'pending',
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('dateProposals', JSON.stringify(storedProposals));
            return { success: true, stored: 'local' };
        }
    }

    showDateProposalSuccess(modal, proposal) {
        const activity = this.suggestedActivities.find(a => a.id === proposal.activity);
        
        modal.innerHTML = `
            <div class="date-scheduler-container success">
                <div class="success-animation">
                    <div class="success-icon">🎉</div>
                    <h2>Date Proposed!</h2>
                    <p>Your date invitation has been sent!</p>
                    
                    <div class="proposed-date-summary">
                        <div class="summary-card">
                            <div class="summary-icon">${activity?.name.split(' ')[0]}</div>
                            <div class="summary-details">
                                <h3>${activity?.name.substring(2)}</h3>
                                <p>${new Date(proposal.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                <p>${proposal.time}</p>
                            </div>
                        </div>
                    </div>
                    
                    <p class="success-message">
                        ${this.currentMatch?.name || 'Your match'} will be notified and can accept or suggest an alternative.
                        You'll receive a notification when they respond!
                    </p>
                </div>
                
                <div class="date-scheduler-actions">
                    <button class="scheduler-btn primary-btn" onclick="this.closest('.date-scheduler-modal').remove()">
                        Great, Thanks!
                    </button>
                </div>
            </div>
        `;

        // Auto-close after 5 seconds
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.remove();
            }
        }, 5000);

        // Callback to parent
        if (this.callback) {
            this.callback('date-proposed', proposal);
        }
    }

    addToCalendar(proposal) {
        // Create calendar event details
        const activity = this.suggestedActivities.find(a => a.id === proposal.activity);
        const eventDate = new Date(proposal.date + 'T' + this.convertTimeToISO(proposal.time));
        
        const calendarEvent = {
            title: `Date: ${activity?.name.substring(2)} with ${this.currentMatch?.name || 'Match'}`,
            start: eventDate.toISOString(),
            duration: 2, // 2 hours default
            description: proposal.message,
            location: 'TBD'
        };

        // Try to add to device calendar
        if (navigator.userAgent.includes('Mobile')) {
            this.createCalendarLink(calendarEvent);
        }
    }

    convertTimeToISO(timeString) {
        const [time, period] = timeString.split(' ');
        const [hours, minutes] = time.split(':');
        let hour24 = parseInt(hours);
        
        if (period === 'PM' && hour24 !== 12) {
            hour24 += 12;
        } else if (period === 'AM' && hour24 === 12) {
            hour24 = 0;
        }
        
        return `${hour24.toString().padStart(2, '0')}:${minutes}:00`;
    }

    createCalendarLink(event) {
        // Create downloadable calendar event
        const eventStart = new Date(event.start);
        const eventEnd = new Date(eventStart.getTime() + (event.duration * 60 * 60 * 1000));
        
        const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ConnectHub//Date Calendar//EN
BEGIN:VEVENT
UID:${Date.now()}@connecthub.app
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}
DTSTART:${eventStart.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}
DTEND:${eventEnd.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

        // Create download link
        const blob = new Blob([icalContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'date-calendar-event.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Calendar event created:', event.title);
    }

    addDateSchedulerStyles() {
        if (document.getElementById('date-scheduler-styles')) return;

        const style = document.createElement('style');
        style.id = 'date-scheduler-styles';
        style.textContent = `
            .date-scheduler-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
                opacity: 0;
                transform: scale(0.9);
                transition: all 0.3s ease;
            }

            .date-scheduler-modal.show {
                opacity: 1;
                transform: scale(1);
            }

            .date-scheduler-container {
                background: linear-gradient(135deg, #ffffff, #f8fafc);
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                max-width: 600px;
                width: 95%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
            }

            .date-scheduler-container.success {
                text-align: center;
                padding: 40px 20px;
            }

            .date-scheduler-header {
                padding: 20px 30px;
                border-bottom: 1px solid #e5e7eb;
                position: relative;
            }

            .date-scheduler-header h2 {
                margin: 0 0 5px 0;
                color: #1f2937;
                font-size: 1.5rem;
            }

            .date-scheduler-header p {
                margin: 0;
                color: #6b7280;
                font-size: 0.9rem;
            }

            .close-scheduler {
                position: absolute;
                top: 15px;
                right: 20px;
                background: none;
                border: none;
                font-size: 24px;
                color: #9ca3af;
                cursor: pointer;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            }

            .close-scheduler:hover {
                background: #f3f4f6;
                color: #374151;
            }

            .date-scheduler-content {
                padding: 20px 30px;
            }

            .scheduler-section {
                margin-bottom: 30px;
            }

            .scheduler-section h3 {
                margin: 0 0 15px 0;
                color: #1f2937;
                font-size: 1.1rem;
            }

            .activity-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
                margin-bottom: 20px;
            }

            .activity-option {
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 15px;
                background: #ffffff;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: left;
            }

            .activity-option:hover {
                border-color: #6366f1;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
            }

            .activity-option.selected {
                border-color: #6366f1;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white;
            }

            .activity-icon {
                font-size: 20px;
                margin-bottom: 5px;
            }

            .activity-name {
                font-weight: bold;
                margin-bottom: 3px;
            }

            .activity-description {
                font-size: 0.8rem;
                opacity: 0.8;
            }

            .calendar-grid {
                background: white;
                border-radius: 12px;
                padding: 15px;
                border: 1px solid #e5e7eb;
            }

            .calendar-header h4 {
                margin: 0 0 15px 0;
                text-align: center;
                color: #1f2937;
            }

            .calendar-days {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 5px;
            }

            .day-header {
                text-align: center;
                font-size: 0.8rem;
                color: #6b7280;
                padding: 8px;
                font-weight: 600;
            }

            .calendar-date {
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-weight: 500;
            }

            .calendar-date:not(.disabled):not(.empty):hover {
                background: #f3f4f6;
            }

            .calendar-date.selected {
                background: #6366f1;
                color: white;
            }

            .calendar-date.today {
                background: #dbeafe;
                color: #1d4ed8;
            }

            .calendar-date.weekend {
                color: #ef4444;
            }

            .calendar-date.disabled {
                color: #d1d5db;
                cursor: not-allowed;
            }

            .calendar-date.empty {
                visibility: hidden;
            }

            .time-slots {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                gap: 8px;
            }

            .time-slot {
                padding: 10px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.9rem;
            }

            .time-slot:hover {
                border-color: #6366f1;
                background: #f8fafc;
            }

            .time-slot.selected {
                background: #6366f1;
                color: white;
                border-color: #6366f1;
            }

            .date-summary {
                background: linear-gradient(135deg, #f0f9ff, #e0e7ff);
                border-radius: 12px;
                padding: 20px;
                margin-top: 20px;
            }

            .date-summary h3 {
                margin: 0 0 15px 0;
                color: #1f2937;
            }

            .summary-content {
                display: grid;
                gap: 10px;
            }

            .summary-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .summary-label {
                font-weight: 600;
                color: #4b5563;
            }

            .summary-value {
                color: #1f2937;
                font-weight: 500;
            }

            .date-scheduler-actions {
                padding: 20px 30px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 15px;
                justify-content: flex-end;
            }

            .scheduler-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 120px;
            }

            .cancel-btn {
                background: #f3f4f6;
                color: #6b7280;
            }

            .cancel-btn:hover {
                background: #e5e7eb;
                color: #374151;
            }

            .propose-btn {
                background: #d1d5db;
                color: #9ca3af;
            }

            .propose-btn.enabled {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
            }

            .propose-btn.enabled:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            }

            .primary-btn {
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white;
            }

            .primary-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            }

            .success-animation {
                padding: 20px;
            }

            .success-icon {
                font-size: 60px;
                margin-bottom: 20px;
                animation: successBounce 0.6s ease;
            }

            .success-animation h2 {
                color: #10b981;
                margin: 0 0 10px 0;
                font-size: 1.8rem;
            }

            .proposed-date-summary {
                margin: 30px 0;
                display: flex;
                justify-content: center;
            }

            .summary-card {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 15px;
                max-width: 300px;
            }

            .summary-icon {
                font-size: 30px;
            }

            .summary-details h3 {
                margin: 0 0 5px 0;
                color: #1f2937;
            }

            .summary-details p {
                margin: 2px 0;
                color: #6b7280;
                font-size: 0.9rem;
            }

            .success-message {
                color: #6b7280;
                line-height: 1.5;
                max-width: 400px;
                margin: 0 auto;
            }

            @keyframes successBounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-30px);
                }
                60% {
                    transform: translateY(-15px);
                }
            }

            /* Mobile responsive styles */
            @media (max-width: 768px) {
                .date-scheduler-container {
                    width: 98%;
                    max-height: 95vh;
                }

                .date-scheduler-header {
                    padding: 15px 20px;
                }

                .date-scheduler-content {
                    padding: 15px 20px;
                }

                .activity-grid {
                    grid-template-columns: 1fr;
                    gap: 8px;
                }

                .time-slots {
                    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                }

                .date-scheduler-actions {
                    padding: 15px 20px;
                    flex-direction: column;
                }

                .scheduler-btn {
                    width: 100%;
                }
            }
        `;

        document.head.appendChild(style);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DateScheduler;
}

// Make available globally
window.DateScheduler = DateScheduler;
