/**
 * ConnectHub Events Missing UI Components
 * Implements the 5 missing Events Screen interfaces from the audit
 */

class EventsMissingUIComponents {
    constructor(app) {
        this.app = app;
        this.eventData = {
            events: new Map(),
            registrations: [],
            checkins: [],
            feedback: new Map(),
            photos: []
        };
        
        this.initializeMissingComponents();
    }

    /**
     * Initialize all 5 missing Events UI components
     */
    initializeMissingComponents() {
        console.log('Initializing 5 Missing Events UI Components');
    }

    /**
     * 1. EVENT CREATION FORM INTERFACE
     */
    showEventCreationForm() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-calendar-plus"></i> Create New Event</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="event-creation-form">
                    <!-- Event Cover Image -->
                    <div style="margin-bottom: 2rem;">
                        <label style="display: block; margin-bottom: 1rem; font-weight: 600;">Event Cover Image</label>
                        <div style="position: relative; width: 100%; height: 200px; background: linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden;" onclick="this.uploadEventImage()">
                            <div style="text-align: center; color: white;">
                                <i class="fas fa-image" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                                <div>Click to upload event image</div>
                                <div style="font-size: 0.8rem; opacity: 0.8;">Recommended: 1920x1080 pixels</div>
                            </div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                        <!-- Left Column - Event Details -->
                        <div>
                            <!-- Basic Event Information -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                                <h3><i class="fas fa-info-circle"></i> Event Information</h3>
                                
                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Event Title *</label>
                                    <input type="text" id="event-title" placeholder="Enter event title..." style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                                </div>

                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Event Description *</label>
                                    <textarea id="event-description" placeholder="Describe your event, what attendees can expect, agenda, and any special requirements..." style="width: 100%; height: 120px; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass); resize: vertical;"></textarea>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Event Category</label>
                                        <select id="event-category" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                                            <option value="">Select category...</option>
                                            <option value="conference">Conference</option>
                                            <option value="workshop">Workshop</option>
                                            <option value="seminar">Seminar</option>
                                            <option value="meetup">Meetup</option>
                                            <option value="networking">Networking</option>
                                            <option value="social">Social Event</option>
                                            <option value="training">Training</option>
                                            <option value="webinar">Webinar</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Event Format</label>
                                        <select id="event-format" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);" onchange="this.toggleEventFormat()">
                                            <option value="in-person">In-Person</option>
                                            <option value="virtual">Virtual</option>
                                            <option value="hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- Date and Time -->
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Start Date & Time *</label>
                                        <input type="datetime-local" id="event-start-time" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">End Date & Time *</label>
                                        <input type="datetime-local" id="event-end-time" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                                    </div>
                                </div>

                                <!-- Location/Virtual Link -->
                                <div id="location-section" style="margin-bottom: 1.5rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Event Location *</label>
                                    <input type="text" id="event-location" placeholder="Enter venue address..." style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass); margin-bottom: 0.5rem;">
                                    <textarea id="venue-details" placeholder="Additional venue information, parking details, accessibility info..." style="width: 100%; height: 60px; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass); resize: vertical;"></textarea>
                                </div>

                                <!-- Tags -->
                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Event Tags</label>
                                    <input type="text" id="event-tags" placeholder="networking, tech, professional, beginner-friendly" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Separate tags with commas to help people discover your event</div>
                                </div>
                            </div>

                            <!-- Speaker Information -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 2rem;">
                                <h3><i class="fas fa-microphone"></i> Speakers & Presenters</h3>
                                <div id="speakers-list">
                                    <div style="display: grid; grid-template-columns: 1fr 2fr 1fr auto; gap: 0.5rem; margin-bottom: 0.75rem; align-items: end;">
                                        <input type="text" placeholder="Speaker name" style="padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);">
                                        <input type="text" placeholder="Title/Bio" style="padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);">
                                        <input type="email" placeholder="Email (optional)" style="padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);">
                                        <button style="background: var(--error); color: white; border: none; padding: 0.5rem; border-radius: 6px; cursor: pointer;" onclick="this.removeSpeaker(this)">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <button class="btn btn-secondary btn-small" onclick="this.addSpeaker()" style="margin-top: 0.5rem;">
                                    <i class="fas fa-plus"></i> Add Speaker
                                </button>
                            </div>
                        </div>

                        <!-- Right Column - Settings -->
                        <div>
                            <!-- Registration Settings -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                                <h4><i class="fas fa-ticket-alt"></i> Registration</h4>
                                <div style="margin-top: 1rem;">
                                    <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                                        <input type="checkbox" id="requires-registration" checked>
                                        <span>Require registration to attend</span>
                                    </label>
                                    
                                    <div style="margin-bottom: 1rem;">
                                        <label style="display: block; margin-bottom: 0.5rem;">Maximum Attendees</label>
                                        <input type="number" placeholder="100" min="1" style="width: 100%; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);">
                                    </div>
                                    
                                    <div style="margin-bottom: 1rem;">
                                        <label style="display: block; margin-bottom: 0.5rem;">Registration Deadline</label>
                                        <input type="datetime-local" style="width: 100%; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);">
                                    </div>
                                    
                                    <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                        <input type="checkbox">
                                        <span>Enable waitlist</span>
                                    </label>
                                    
                                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                                        <input type="checkbox">
                                        <span>Approval required</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Event Privacy -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                                <h4><i class="fas fa-lock"></i> Privacy Settings</h4>
                                <div style="margin-top: 1rem;">
                                    <label style="display: flex; align-items: start; gap: 0.5rem; margin-bottom: 1rem; cursor: pointer;">
                                        <input type="radio" name="event-privacy" value="public" checked>
                                        <div>
                                            <div style="font-weight: 600;">Public Event</div>
                                            <div style="font-size: 0.8rem; color: var(--text-muted);">Anyone can see and join</div>
                                        </div>
                                    </label>
                                    <label style="display: flex; align-items: start; gap: 0.5rem; margin-bottom: 1rem; cursor: pointer;">
                                        <input type="radio" name="event-privacy" value="private">
                                        <div>
                                            <div style="font-weight: 600;">Private Event</div>
                                            <div style="font-size: 0.8rem; color: var(--text-muted);">Invitation required</div>
                                        </div>
                                    </label>
                                    <label style="display: flex; align-items: start; gap: 0.5rem; cursor: pointer;">
                                        <input type="radio" name="event-privacy" value="group-only">
                                        <div>
                                            <div style="font-weight: 600;">Group Members Only</div>
                                            <div style="font-size: 0.8rem; color: var(--text-muted);">Visible to group members</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <!-- Notifications -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                                <h4><i class="fas fa-bell"></i> Notifications</h4>
                                <div style="margin-top: 1rem;">
                                    <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                        <input type="checkbox" checked>
                                        <span>Email confirmations</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                        <input type="checkbox" checked>
                                        <span>Reminder 24h before</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                        <input type="checkbox">
                                        <span>Reminder 1h before</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                                        <input type="checkbox">
                                        <span>Follow-up survey</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                        <button class="btn btn-secondary" onclick="this.saveDraft()">
                            <i class="fas fa-save"></i> Save as Draft
                        </button>
                        <button class="btn btn-secondary" onclick="this.previewEvent()">
                            <i class="fas fa-eye"></i> Preview Event
                        </button>
                        <button class="btn btn-primary" onclick="this.publishEvent()">
                            <i class="fas fa-calendar-plus"></i> Publish Event
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.uploadEventImage = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Event image upload opened', 'info');
            }
        };

        modal.toggleEventFormat = () => {
            const format = modal.querySelector('#event-format').value;
            const locationSection = modal.querySelector('#location-section');
            const locationInput = modal.querySelector('#event-location');
            const venueDetails = modal.querySelector('#venue-details');
            
            if (format === 'virtual') {
                locationSection.querySelector('label').textContent = 'Meeting Link *';
                locationInput.placeholder = 'Enter Zoom, Teams, or other meeting link...';
                venueDetails.placeholder = 'Meeting details, access instructions, tech requirements...';
            } else if (format === 'hybrid') {
                locationSection.querySelector('label').textContent = 'Venue & Meeting Link *';
                locationInput.placeholder = 'Venue address and meeting link...';
                venueDetails.placeholder = 'Venue and virtual meeting details...';
            } else {
                locationSection.querySelector('label').textContent = 'Event Location *';
                locationInput.placeholder = 'Enter venue address...';
                venueDetails.placeholder = 'Additional venue information, parking details, accessibility info...';
            }
        };

        modal.addSpeaker = () => {
            const speakersContainer = modal.querySelector('#speakers-list');
            const newSpeaker = document.createElement('div');
            newSpeaker.style.cssText = 'display: grid; grid-template-columns: 1fr 2fr 1fr auto; gap: 0.5rem; margin-bottom: 0.75rem; align-items: end;';
            newSpeaker.innerHTML = `
                <input type="text" placeholder="Speaker name" style="padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);">
                <input type="text" placeholder="Title/Bio" style="padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);">
                <input type="email" placeholder="Email (optional)" style="padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);">
                <button style="background: var(--error); color: white; border: none; padding: 0.5rem; border-radius: 6px; cursor: pointer;" onclick="this.removeSpeaker(this)">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            speakersContainer.appendChild(newSpeaker);
        };

        modal.removeSpeaker = (button) => {
            button.closest('div').remove();
        };

        modal.saveDraft = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Event saved as draft!', 'success');
            }
        };

        modal.previewEvent = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Event preview opened', 'info');
            }
        };

        modal.publishEvent = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Event published successfully!', 'success');
            }
            modal.remove();
        };

        document.body.appendChild(modal);
    }

    /**
     * 2. EVENT DETAILS VIEW INTERFACE
     */
    showEventDetailsView() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content extra-large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h2><i class="fas fa-calendar-day"></i> React Development Workshop</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="event-details-content">
                    <!-- Event Hero Section -->
                    <div style="position: relative; height: 300px; background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1200 300\"><rect width=\"1200\" height=\"300\" fill=\"%23667eea\"/><text x=\"600\" y=\"150\" font-family=\"Arial\" font-size=\"48\" fill=\"white\" text-anchor=\"middle\" dominant-baseline=\"middle\">React Workshop</text></svg>'); background-size: cover; background-position: center; border-radius: 12px; margin-bottom: 2rem; display: flex; flex-direction: column; justify-content: flex-end; padding: 2rem; color: white;">
                        <div style="display: flex; justify-content: space-between; align-items: end;">
                            <div>
                                <div style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px; display: inline-block; margin-bottom: 1rem;">
                                    <i class="fas fa-code"></i> Workshop • Technology
                                </div>
                                <h1 style="margin: 0; font-size: 2.5rem; margin-bottom: 0.5rem;">React Development Workshop</h1>
                                <div style="opacity: 0.9; font-size: 1.1rem;">Learn modern React patterns and best practices from industry experts</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 12px; backdrop-filter: blur(10px);">
                                    <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">Saturday, March 25</div>
                                    <div style="font-size: 1rem; opacity: 0.9;">2:00 PM - 6:00 PM PST</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                        <!-- Left Column - Event Information -->
                        <div>
                            <!-- Event Description -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                                <h3><i class="fas fa-info-circle"></i> About This Event</h3>
                                <div style="line-height: 1.6; color: var(--text-secondary); margin-top: 1rem;">
                                    <p>Join us for an intensive React development workshop where you'll learn the latest patterns, best practices, and advanced techniques used by top React developers in the industry.</p>
                                    <p>This hands-on workshop covers:</p>
                                    <ul style="margin: 1rem 0; padding-left: 2rem;">
                                        <li>Modern React hooks and patterns</li>
                                        <li>State management with Context API and Zustand</li>
                                        <li>Performance optimization techniques</li>
                                        <li>Testing strategies for React applications</li>
                                        <li>Building scalable component architectures</li>
                                    </ul>
                                    <p>Perfect for intermediate developers looking to level up their React skills. Bring your laptop and be ready to code!</p>
                                </div>

                                <!-- Tags -->
                                <div style="margin-top: 1.5rem;">
                                    <div style="display: flex; flex-wrap: gap: 0.5rem;">
                                        ${['react', 'javascript', 'frontend', 'workshop', 'hands-on', 'intermediate'].map(tag => `
                                            <span style="background: var(--primary-light); color: var(--primary); padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem;"># ${tag}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>

                            <!-- Event Schedule -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                                <h3><i class="fas fa-clock"></i> Event Schedule</h3>
                                <div style="margin-top: 1rem;">
                                    ${[
                                        { time: '2:00 PM - 2:30 PM', title: 'Welcome & Setup', desc: 'Introduction and development environment setup' },
                                        { time: '2:30 PM - 3:30 PM', title: 'Modern React Hooks', desc: 'Deep dive into useState, useEffect, and custom hooks' },
                                        { time: '3:30 PM - 3:45 PM', title: 'Coffee Break', desc: 'Network with fellow developers' },
                                        { time: '3:45 PM - 4:45 PM', title: 'State Management', desc: 'Context API, Zustand, and when to use each' },
                                        { time: '4:45 PM - 5:45 PM', title: 'Performance Optimization', desc: 'React.memo, useMemo, useCallback, and code splitting' },
                                        { time: '5:45 PM - 6:00 PM', title: 'Q&A & Wrap-up', desc: 'Questions, resources, and next steps' }
                                    ].map(item => `
                                        <div style="display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--glass-border);">
                                            <div style="min-width: 140px; font-weight: 600; color: var(--primary);">${item.time}</div>
                                            <div style="flex: 1;">
                                                <div style="font-weight: 600; margin-bottom: 0.25rem;">${item.title}</div>
                                                <div style="color: var(--text-secondary); font-size: 0.9rem;">${item.desc}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Speakers -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                                <h3><i class="fas fa-microphone"></i> Featured Speakers</h3>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1rem;">
                                    ${[
                                        { name: 'Sarah Chen', title: 'Senior React Developer at Meta', bio: '5+ years building React apps, contributor to React core', avatar: '👩‍💻' },
                                        { name: 'Mike Rodriguez', title: 'Lead Frontend Architect', bio: 'Expert in React performance and scalable architectures', avatar: '👨‍💻' }
                                    ].map(speaker => `
                                        <div style="display: flex; gap: 1rem; align-items: start;">
                                            <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">${speaker.avatar}</div>
                                            <div>
                                                <div style="font-weight: 600; margin-bottom: 0.25rem;">${speaker.name}</div>
                                                <div style="color: var(--primary); font-size: 0.9rem; margin-bottom: 0.5rem;">${speaker.title}</div>
                                                <div style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.4;">${speaker.bio}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Right Column - Event Actions & Info -->
                        <div>
                            <!-- Registration Card -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; border: 2px solid var(--primary-light);">
                                <div style="text-align: center; margin-bottom: 1.5rem;">
                                    <div style="font-size: 2rem; font-weight: 700; color: var(--success); margin-bottom: 0.5rem;">FREE</div>
                                    <div style="color: var(--text-secondary);">Limited to 50 attendees</div>
                                </div>
                                
                                <div style="margin-bottom: 1.5rem;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                        <span>Registered</span>
                                        <strong>32/50</strong>
                                    </div>
                                    <div style="background: var(--glass-border); height: 6px; border-radius: 3px; overflow: hidden;">
                                        <div style="background: var(--primary); height: 100%; width: 64%; border-radius: 3px; transition: width 0.3s ease;"></div>
                                    </div>
                                </div>

                                <button class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;" onclick="this.registerForEvent()">
                                    <i class="fas fa-ticket-alt"></i> Register for Event
                                </button>
                                
                                <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-secondary" style="flex: 1;" onclick="this.addToCalendar()">
                                    <i class="fas fa-calendar-plus"></i> Add to Calendar
                                </button>
                                <button class="btn btn-secondary" style="flex: 1;" onclick="this.shareEvent()">
                                    <i class="fas fa-share"></i> Share
                                </button>
                            </div>
                        </div>

                        <!-- Event Location -->
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                            <h4><i class="fas fa-map-marker-alt"></i> Location</h4>
                            <div style="margin-top: 1rem;">
                                <div style="font-weight: 600; margin-bottom: 0.5rem;">TechHub Conference Center</div>
                                <div style="color: var(--text-secondary); margin-bottom: 1rem;">123 Innovation Drive, San Francisco, CA 94105</div>
                                <button class="btn btn-secondary btn-small" onclick="this.viewMap()">
                                    <i class="fas fa-map"></i> View Map
                                </button>
                            </div>
                        </div>

                        <!-- Attendees -->
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                <h4><i class="fas fa-users"></i> Attendees (32)</h4>
                                <button style="background: none; border: none; color: var(--primary); cursor: pointer;" onclick="this.viewAllAttendees()">View All</button>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, 40px); gap: 0.5rem;">
                                ${Array.from({length: 12}).map((_, i) => `
                                    <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.8rem;">${String.fromCharCode(65 + i)}</div>
                                `).join('')}
                                <div style="width: 40px; height: 40px; border-radius: 50%; border: 2px dashed var(--glass-border); display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.8rem;">+20</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Comments/Discussion Section -->
                <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-top: 2rem;">
                    <h3><i class="fas fa-comments"></i> Event Discussion</h3>
                    <div style="margin-top: 1rem;">
                        <!-- Add Comment -->
                        <div style="display: flex; gap: 1rem; margin-bottom: 2rem; align-items: start;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; flex-shrink: 0;">Y</div>
                            <div style="flex: 1;">
                                <textarea placeholder="Ask a question or share your thoughts about this event..." style="width: 100%; height: 80px; padding: 1rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass); resize: vertical;"></textarea>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                                    <div style="font-size: 0.8rem; color: var(--text-muted);">Ask questions, share tips, or connect with other attendees</div>
                                    <button class="btn btn-primary btn-small">Post Comment</button>
                                </div>
                            </div>
                        </div>

                        <!-- Sample Comments -->
                        ${[
                            { author: 'Alex Kim', time: '2 hours ago', comment: 'Really excited for this workshop! Will the materials be available afterward?', avatar: 'A' },
                            { author: 'Maria Santos', time: '5 hours ago', comment: 'Is this suitable for someone with 1 year React experience? The description says intermediate.', avatar: 'M' },
                            { author: 'David Chen', time: '1 day ago', comment: 'Looking forward to the state management section. Will you cover Redux as well?', avatar: 'D' }
                        ].map(comment => `
                            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: start;">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; flex-shrink: 0;">${comment.avatar}</div>
                                <div style="flex: 1;">
                                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                        <span style="font-weight: 600;">${comment.author}</span>
                                        <span style="color: var(--text-muted); font-size: 0.85rem;">${comment.time}</span>
                                    </div>
                                    <div style="color: var(--text-secondary); line-height: 1.5;">${comment.comment}</div>
                                    <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                                        <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.25rem 0;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-muted)'">
                                            <i class="fas fa-thumbs-up"></i> Like
                                        </button>
                                        <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.25rem 0;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-muted)'">
                                            <i class="fas fa-reply"></i> Reply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        modal.registerForEvent = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Successfully registered for event!', 'success');
            }
        };

        modal.addToCalendar = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Event added to calendar', 'success');
            }
        };

        modal.shareEvent = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Event link copied to clipboard', 'info');
            }
        };

        modal.viewMap = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Opening map view...', 'info');
            }
        };

        modal.viewAllAttendees = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Viewing all attendees', 'info');
            }
        };

        document.body.appendChild(modal);
    }

    /**
     * 3. EVENT CHECK-IN INTERFACE
     */
    showEventCheckIn() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-qrcode"></i> Event Check-In</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="check-in-content">
                    <!-- Event Info Header -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; text-align: center;">
                        <h3 style="margin-bottom: 0.5rem;">React Development Workshop</h3>
                        <div style="color: var(--primary); font-weight: 600; margin-bottom: 0.5rem;">Today, March 25 • 2:00 PM - 6:00 PM</div>
                        <div style="color: var(--text-secondary);">TechHub Conference Center, Room A</div>
                    </div>

                    <!-- Check-in Methods -->
                    <div style="margin-bottom: 2rem;">
                        <h4><i class="fas fa-mobile-alt"></i> Check-In Methods</h4>
                        
                        <!-- QR Code Check-in -->
                        <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin: 1rem 0; text-align: center;">
                            <h5 style="margin-bottom: 1rem;"><i class="fas fa-qrcode"></i> QR Code Check-In</h5>
                            <div style="width: 200px; height: 200px; background: white; border-radius: 8px; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; border: 2px solid var(--glass-border);">
                                <div style="width: 180px; height: 180px; background: 
                                    repeating-linear-gradient(
                                        90deg,
                                        #000 0px, #000 8px,
                                        #fff 8px, #fff 16px
                                    ),
                                    repeating-linear-gradient(
                                        0deg,
                                        #000 0px, #000 8px,
                                        #fff 8px, #fff 16px
                                    );
                                    background-size: 16px 16px;
                                    border-radius: 4px;
                                    position: relative;
                                ">
                                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #000; color: white; padding: 0.25rem; border-radius: 2px; font-size: 0.7rem;">QR</div>
                                </div>
                            </div>
                            <div style="color: var(--text-secondary); margin-bottom: 1rem;">Show this QR code to event staff for quick check-in</div>
                            <button class="btn btn-secondary" onclick="this.downloadQRCode()">
                                <i class="fas fa-download"></i> Download QR Code
                            </button>
                        </div>

                        <!-- Manual Check-in -->
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem;">
                            <h5 style="margin-bottom: 1rem;"><i class="fas fa-user-check"></i> Manual Check-In</h5>
                            <div style="display: flex; gap: 1rem; align-items: end;">
                                <div style="flex: 1;">
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Check-in Code</label>
                                    <input type="text" id="checkin-code" placeholder="Enter your 6-digit code..." style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass); text-align: center; font-size: 1.2rem; letter-spacing: 2px;">
                                </div>
                                <button class="btn btn-primary" onclick="this.manualCheckIn()">
                                    <i class="fas fa-check"></i> Check In
                                </button>
                            </div>
                            <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.5rem;">Check your email for the 6-digit check-in code sent before the event</div>
                        </div>

                        <!-- NFC Check-in -->
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <h5 style="margin-bottom: 1rem;"><i class="fas fa-wifi"></i> NFC/Tap Check-In</h5>
                            <div style="text-align: center;">
                                <div style="width: 120px; height: 120px; border: 3px dashed var(--primary); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; position: relative;">
                                    <i class="fas fa-wifi" style="font-size: 2rem; color: var(--primary);"></i>
                                    <div style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; border-radius: 50%; background: var(--success); animation: pulse 2s infinite;"></div>
                                </div>
                                <div style="color: var(--text-secondary); margin-bottom: 1rem;">Hold your NFC-enabled device near the event check-in station</div>
                                <button class="btn btn-secondary" onclick="this.enableNFC()">
                                    <i class="fas fa-wifi"></i> Enable NFC
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Check-in Status -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 2rem;">
                        <h4><i class="fas fa-check-circle"></i> Check-in Status</h4>
                        <div id="checkin-status" style="margin-top: 1rem;">
                            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--warning-light); border-radius: 8px; border-left: 4px solid var(--warning);">
                                <i class="fas fa-clock" style="color: var(--warning); font-size: 1.5rem;"></i>
                                <div>
                                    <div style="font-weight: 600; color: var(--warning);">Not Checked In</div>
                                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Please check in when you arrive at the event</div>
                                </div>
                            </div>
                        </div>

                        <!-- Check-in History -->
                        <div style="margin-top: 2rem;">
                            <h5 style="margin-bottom: 1rem;">Recent Check-ins</h5>
                            <div style="space-y: 0.5rem;">
                                ${[
                                    { event: 'JavaScript Fundamentals Workshop', date: 'March 18, 2024', status: 'Attended' },
                                    { event: 'Web Development Bootcamp', date: 'March 10, 2024', status: 'Attended' },
                                    { event: 'Frontend Meetup', date: 'February 28, 2024', status: 'No-Show' }
                                ].map(item => `
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--glass-light); border-radius: 6px; margin-bottom: 0.5rem;">
                                        <div>
                                            <div style="font-weight: 600; margin-bottom: 0.25rem;">${item.event}</div>
                                            <div style="color: var(--text-secondary); font-size: 0.85rem;">${item.date}</div>
                                        </div>
                                        <span style="padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; background: ${item.status === 'Attended' ? 'var(--success-light); color: var(--success)' : 'var(--error-light); color: var(--error)'};">${item.status}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.downloadQRCode = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('QR code downloaded to device', 'success');
            }
        };

        modal.manualCheckIn = () => {
            const code = modal.querySelector('#checkin-code').value;
            if (code && code.length === 6) {
                const statusDiv = modal.querySelector('#checkin-status');
                statusDiv.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--success-light); border-radius: 8px; border-left: 4px solid var(--success);">
                        <i class="fas fa-check-circle" style="color: var(--success); font-size: 1.5rem;"></i>
                        <div>
                            <div style="font-weight: 600; color: var(--success);">Successfully Checked In!</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Welcome to React Development Workshop</div>
                        </div>
                    </div>
                `;
                if (this.app && this.app.showToast) {
                    this.app.showToast('Successfully checked in to event!', 'success');
                }
            } else {
                if (this.app && this.app.showToast) {
                    this.app.showToast('Please enter a valid 6-digit check-in code', 'error');
                }
            }
        };

        modal.enableNFC = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('NFC check-in ready - tap your device on the scanner', 'info');
            }
        };

        document.body.appendChild(modal);
    }

    /**
     * 4. EVENT PHOTO GALLERY INTERFACE
     */
    showEventPhotoGallery() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content extra-large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-images"></i> Event Photo Gallery</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="photo-gallery-content">
                    <!-- Gallery Header -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <div>
                            <h3 style="margin-bottom: 0.5rem;">React Development Workshop</h3>
                            <div style="color: var(--text-secondary);">March 25, 2024 • 156 photos by 23 attendees</div>
                        </div>
                        <div style="display: flex; gap: 1rem;">
                            <button class="btn btn-secondary" onclick="this.uploadEventPhoto()">
                                <i class="fas fa-camera"></i> Add Photos
                            </button>
                            <button class="btn btn-secondary" onclick="this.downloadAllPhotos()">
                                <i class="fas fa-download"></i> Download All
                            </button>
                        </div>
                    </div>

                    <!-- Gallery Controls -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 1rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <span>View:</span>
                                <select id="gallery-view" style="padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);" onchange="this.changeGalleryView()">
                                    <option value="grid">Grid View</option>
                                    <option value="masonry">Masonry</option>
                                    <option value="slideshow">Slideshow</option>
                                </select>
                            </label>
                            
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <span>Sort:</span>
                                <select id="gallery-sort" style="padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);" onchange="this.sortGallery()">
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="author">By Author</option>
                                </select>
                            </label>
                        </div>

                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem;" onclick="this.toggleFavorites()" title="Show only favorites">
                                <i class="fas fa-heart"></i>
                            </button>
                            <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem;" onclick="this.shareGallery()" title="Share gallery">
                                <i class="fas fa-share"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Photo Grid -->
                    <div id="photo-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        ${Array.from({length: 12}).map((_, i) => `
                            <div class="photo-item" style="position: relative; aspect-ratio: 1; background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); border-radius: 8px; overflow: hidden; cursor: pointer; group;" onclick="this.openPhotoViewer(${i})">
                                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">
                                    📷 ${i + 1}
                                </div>
                                
                                <!-- Photo Overlay -->
                                <div style="position: absolute; top: 0.5rem; right: 0.5rem; display: flex; gap: 0.25rem;">
                                    <button style="background: rgba(0,0,0,0.7); border: none; color: white; padding: 0.25rem; border-radius: 4px; cursor: pointer;" onclick="event.stopPropagation(); this.likePhoto(${i})" title="Like photo">
                                        <i class="fas fa-heart"></i>
                                    </button>
                                    <button style="background: rgba(0,0,0,0.7); border: none; color: white; padding: 0.25rem; border-radius: 4px; cursor: pointer;" onclick="event.stopPropagation(); this.sharePhoto(${i})" title="Share photo">
                                        <i class="fas fa-share"></i>
                                    </button>
                                </div>
                                
                                <!-- Photo Info -->
                                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 1rem 0.75rem 0.75rem; color: white;">
                                    <div style="font-size: 0.8rem; opacity: 0.9;">by User${i + 1}</div>
                                    <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; opacity: 0.8; margin-top: 0.25rem;">
                                        <span><i class="fas fa-heart"></i> ${Math.floor(Math.random() * 50) + 1}</span>
                                        <span><i class="fas fa-comment"></i> ${Math.floor(Math.random() * 10)}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Photo Upload Section -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 2rem; border: 2px dashed var(--glass-border);">
                        <div style="text-align: center;">
                            <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"></i>
                            <h4 style="margin-bottom: 0.5rem;">Share Your Event Photos</h4>
                            <div style="color: var(--text-secondary); margin-bottom: 1.5rem;">Help create lasting memories by sharing your photos from the event</div>
                            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                                <button class="btn btn-primary" onclick="this.uploadFromCamera()">
                                    <i class="fas fa-camera"></i> Take Photo
                                </button>
                                <button class="btn btn-secondary" onclick="this.uploadFromGallery()">
                                    <i class="fas fa-images"></i> Upload from Gallery
                                </button>
                                <button class="btn btn-secondary" onclick="this.uploadMultiple()">
                                    <i class="fas fa-plus"></i> Upload Multiple
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.changeGalleryView = () => {
            const view = modal.querySelector('#gallery-view').value;
            const grid = modal.querySelector('#photo-grid');
            
            if (view === 'masonry') {
                grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
                grid.style.gridAutoRows = 'auto';
            } else if (view === 'slideshow') {
                grid.style.display = 'flex';
                grid.style.overflow = 'hidden';
            } else {
                grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
                grid.style.display = 'grid';
            }
            
            if (this.app && this.app.showToast) {
                this.app.showToast(`Switched to ${view} view`, 'info');
            }
        };

        modal.sortGallery = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Gallery sorted successfully', 'info');
            }
        };

        modal.openPhotoViewer = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Opening photo ${index + 1} in viewer`, 'info');
            }
        };

        modal.likePhoto = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Photo liked!', 'success');
            }
        };

        modal.sharePhoto = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Photo link copied to clipboard', 'info');
            }
        };

        modal.uploadFromCamera = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Camera opened for photo capture', 'info');
            }
        };

        modal.uploadFromGallery = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Gallery picker opened', 'info');
            }
        };

        modal.uploadMultiple = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Multiple photo uploader opened', 'info');
            }
        };

        modal.downloadAllPhotos = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Downloading all event photos...', 'info');
            }
        };

        modal.toggleFavorites = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Showing favorite photos only', 'info');
            }
        };

        modal.shareGallery = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Gallery link copied to clipboard', 'info');
            }
        };

        modal.downloadQRCode = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('QR code downloaded to device', 'success');
            }
        };

        modal.manualCheckIn = () => {
            const code = modal.querySelector('#checkin-code').value;
            if (code && code.length === 6) {
                const statusDiv = modal.querySelector('#checkin-status');
                statusDiv.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--success-light); border-radius: 8px; border-left: 4px solid var(--success);">
                        <i class="fas fa-check-circle" style="color: var(--success); font-size: 1.5rem;"></i>
                        <div>
                            <div style="font-weight: 600; color: var(--success);">Successfully Checked In!</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Welcome to React Development Workshop</div>
                        </div>
                    </div>
                `;
                if (this.app && this.app.showToast) {
                    this.app.showToast('Successfully checked in to event!', 'success');
                }
            } else {
                if (this.app && this.app.showToast) {
                    this.app.showToast('Please enter a valid 6-digit check-in code', 'error');
                }
            }
        };

        modal.enableNFC = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('NFC check-in ready - tap your device on the scanner', 'info');
            }
        };

        document.body.appendChild(modal);
    }

    /**
     * 5. EVENT FEEDBACK FORM INTERFACE
     */
    showEventFeedbackForm() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-star"></i> Event Feedback</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="feedback-form">
                    <!-- Event Info -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; text-align: center;">
                        <h3 style="margin-bottom: 0.5rem;">React Development Workshop</h3>
                        <div style="color: var(--primary); font-weight: 600; margin-bottom: 0.5rem;">March 25, 2024 • 2:00 PM - 6:00 PM</div>
                        <div style="color: var(--text-secondary);">TechHub Conference Center</div>
                    </div>

                    <!-- Overall Rating -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                        <h3><i class="fas fa-star"></i> Overall Rating</h3>
                        <div style="margin-top: 1rem;">
                            <div style="text-align: center; margin-bottom: 1.5rem;">
                                <div style="color: var(--text-secondary); margin-bottom: 1rem;">How would you rate this event overall?</div>
                                <div style="display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 1rem;">
                                    ${Array.from({length: 5}).map((_, i) => `
                                        <button style="background: none; border: none; font-size: 2rem; color: var(--text-muted); cursor: pointer; transition: color 0.2s;" 
                                                onmouseover="this.style.color='var(--warning)'" 
                                                onmouseout="this.style.color='var(--text-muted)'" 
                                                onclick="this.rateEvent(${i + 1})">
                                            ⭐
                                        </button>
                                    `).join('')}
                                </div>
                                <div id="rating-text" style="color: var(--text-muted); font-size: 0.9rem;">Click stars to rate</div>
                            </div>
                        </div>
                    </div>

                    <!-- Detailed Feedback -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                        <!-- Content Quality -->
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <h4><i class="fas fa-book"></i> Content Quality</h4>
                            <div style="margin-top: 1rem;">
                                <div style="margin-bottom: 1rem;">
                                    <label style="display: block; margin-bottom: 0.5rem;">Content Rating</label>
                                    <div style="display: flex; gap: 0.25rem;">
                                        ${Array.from({length: 5}).map((_, i) => `
                                            <button style="background: none; border: none; font-size: 1.2rem; color: var(--text-muted); cursor: pointer;" onclick="this.rateContent(${i + 1})">⭐</button>
                                        `).join('')}
                                    </div>
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem;">What did you like most?</label>
                                    <textarea placeholder="The content was well-structured and practical..." style="width: 100%; height: 80px; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass); resize: vertical;"></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Speaker Performance -->
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <h4><i class="fas fa-microphone"></i> Speaker Performance</h4>
                            <div style="margin-top: 1rem;">
                                <div style="margin-bottom: 1rem;">
                                    <label style="display: block; margin-bottom: 0.5rem;">Speaker Rating</label>
                                    <div style="display: flex; gap: 0.25rem;">
                                        ${Array.from({length: 5}).map((_, i) => `
                                            <button style="background: none; border: none; font-size: 1.2rem; color: var(--text-muted); cursor: pointer;" onclick="this.rateSpeaker(${i + 1})">⭐</button>
                                        `).join('')}
                                    </div>
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem;">Speaker Feedback</label>
                                    <textarea placeholder="The speakers were knowledgeable and engaging..." style="width: 100%; height: 80px; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass); resize: vertical;"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Organization & Logistics -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                        <h3><i class="fas fa-cogs"></i> Organization & Logistics</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1rem;">
                            ${[
                                { category: 'Event Registration', icon: 'fa-ticket-alt' },
                                { category: 'Venue & Facilities', icon: 'fa-building' },
                                { category: 'Schedule & Timing', icon: 'fa-clock' },
                                { category: 'Communication', icon: 'fa-envelope' }
                            ].map(item => `
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                                        <i class="fas ${item.icon}"></i> ${item.category}
                                    </label>
                                    <div style="display: flex; gap: 0.25rem; margin-bottom: 0.5rem;">
                                        ${Array.from({length: 5}).map((_, i) => `
                                            <button style="background: none; border: none; font-size: 1rem; color: var(--text-muted); cursor: pointer;" onclick="this.rateLogistics('${item.category.toLowerCase().replace(/\s+/g, '-')}', ${i + 1})">⭐</button>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Improvement Suggestions -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                        <h3><i class="fas fa-lightbulb"></i> Suggestions for Improvement</h3>
                        <div style="margin-top: 1rem;">
                            <textarea placeholder="What could have been better? Any suggestions for future events?" style="width: 100%; height: 120px; padding: 1rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass); resize: vertical;"></textarea>
                        </div>
                    </div>

                    <!-- Additional Questions -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                        <h3><i class="fas fa-question-circle"></i> Additional Questions</h3>
                        <div style="margin-top: 1rem; space-y: 1.5rem;">
                            <div style="margin-bottom: 1.5rem;">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Would you attend similar events in the future?</label>
                                <div style="display: flex; gap: 1rem;">
                                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                        <input type="radio" name="future-events" value="definitely">
                                        <span>Definitely</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                        <input type="radio" name="future-events" value="probably">
                                        <span>Probably</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                        <input type="radio" name="future-events" value="maybe">
                                        <span>Maybe</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                        <input type="radio" name="future-events" value="unlikely">
                                        <span>Unlikely</span>
                                    </label>
                                </div>
                            </div>

                            <div style="margin-bottom: 1.5rem;">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Would you recommend this event to others?</label>
                                <div style="display: flex; gap: 1rem;">
                                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                        <input type="radio" name="recommend" value="yes">
                                        <span>Yes, absolutely</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                        <input type="radio" name="recommend" value="maybe">
                                        <span>Maybe</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                        <input type="radio" name="recommend" value="no">
                                        <span>No</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">What topics would you like to see in future events?</label>
                                <input type="text" placeholder="Advanced React patterns, Node.js, TypeScript..." style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                            </div>
                        </div>
                    </div>

                    <!-- Contact Preferences -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                        <h4><i class="fas fa-envelope"></i> Contact Preferences</h4>
                        <div style="margin-top: 1rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; cursor: pointer;">
                                <input type="checkbox" checked>
                                <span>Send me updates about similar events</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; cursor: pointer;">
                                <input type="checkbox">
                                <span>Contact me for feedback on future events</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox">
                                <span>Share my feedback publicly (anonymous)</span>
                            </label>
                        </div>
                    </div>

                    <!-- Submit Actions -->
                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button class="btn btn-secondary" onclick="this.saveFeedbackDraft()">
                            <i class="fas fa-save"></i> Save Draft
                        </button>
                        <button class="btn btn-primary" onclick="this.submitFeedback()">
                            <i class="fas fa-paper-plane"></i> Submit Feedback
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.rateEvent = (rating) => {
            const stars = modal.querySelectorAll('[onclick*="rateEvent"]');
            const ratingText = modal.querySelector('#rating-text');
            
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.style.color = 'var(--warning)';
                } else {
                    star.style.color = 'var(--text-muted)';
                }
            });
            
            const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
            ratingText.textContent = `${rating}/5 - ${ratingLabels[rating - 1]}`;
            ratingText.style.color = 'var(--primary)';
        };

        modal.rateContent = (rating) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Content rated ${rating}/5 stars`, 'info');
            }
        };

        modal.rateSpeaker = (rating) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Speaker rated ${rating}/5 stars`, 'info');
            }
        };

        modal.rateLogistics = (category, rating) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`${category} rated ${rating}/5 stars`, 'info');
            }
        };

        modal.saveFeedbackDraft = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Feedback saved as draft', 'info');
            }
        };

        modal.submitFeedback = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Thank you for your feedback!', 'success');
            }
            modal.remove();
        };

        document.body.appendChild(modal);
    }
}

// Export for global access
window.EventsMissingUIComponents = EventsMissingUIComponents;
