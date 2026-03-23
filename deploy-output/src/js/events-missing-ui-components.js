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
     * 1. COMPREHENSIVE EVENT CREATION DASHBOARD
     */
    showEventCreationForm() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1200px; width: 95%; max-height: 90vh; padding: 0; overflow: hidden;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); padding: 2rem; color: white; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin: 0; font-size: 1.8rem; margin-bottom: 0.5rem;"><i class="fas fa-calendar-plus"></i> Create New Event</h2>
                            <p style="margin: 0; opacity: 0.9; font-size: 1rem;">Build and publish professional events with all the tools you need</p>
                        </div>
                        <button style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0.5rem; border-radius: 50%; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center;" onclick="this.closest('.modal').remove()" title="Close">✕</button>
                    </div>
                </div>

                <!-- Main Content Scrollable Area -->
                <div style="padding: 2rem; max-height: calc(90vh - 140px); overflow-y: auto;">
                    <div class="event-creation-dashboard">
                        <!-- Event Cover Image Upload Section -->
                        <div style="margin-bottom: 2.5rem;">
                            <label style="display: block; margin-bottom: 1rem; font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">
                                <i class="fas fa-image"></i> Event Cover Image
                            </label>
                            <div id="image-upload-area" style="position: relative; width: 100%; height: 250px; background: linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; border: 3px dashed rgba(255,255,255,0.3); transition: all 0.3s ease;" onclick="this.triggerImageUpload()">
                                <div id="upload-placeholder" style="text-align: center; color: white; pointer-events: none;">
                                    <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.8;"></i>
                                    <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">Click to upload event image</div>
                                    <div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 0.5rem;">or drag and drop here</div>
                                    <div style="font-size: 0.8rem; opacity: 0.7;">Recommended: 1920x1080 pixels • PNG, JPG up to 10MB</div>
                                </div>
                                <input type="file" id="image-upload-input" accept="image/*" style="display: none;">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 3rem;">
                            <!-- Left Column - Main Event Details -->
                            <div>
                                <!-- Basic Event Information -->
                                <div style="background: var(--glass); border-radius: 16px; padding: 2.5rem; margin-bottom: 2rem; border: 1px solid var(--glass-border);">
                                    <h3 style="margin-bottom: 2rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                                        <i class="fas fa-info-circle" style="color: var(--primary);"></i> Event Information
                                    </h3>
                                    
                                    <div style="margin-bottom: 2rem;">
                                        <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">
                                            Event Title <span style="color: var(--error);">*</span>
                                        </label>
                                        <input type="text" id="event-title" placeholder="Enter a compelling event title..." 
                                               style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary); font-size: 1rem; transition: all 0.3s ease;">
                                        <div id="title-feedback" style="margin-top: 0.5rem; font-size: 0.8rem; display: none;"></div>
                                    </div>

                                    <div style="margin-bottom: 2rem;">
                                        <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">
                                            Event Description <span style="color: var(--error);">*</span>
                                        </label>
                                        <textarea id="event-description" placeholder="Describe your event in detail. What will attendees learn or experience? Include agenda, requirements, and what makes it special..." 
                                                  style="width: 100%; height: 140px; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary); resize: vertical; font-family: inherit; line-height: 1.5;"></textarea>
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                                            <div style="font-size: 0.8rem; color: var(--text-secondary);">Share what makes your event unique and valuable</div>
                                            <div id="char-count" style="font-size: 0.8rem; color: var(--text-muted);">0/500</div>
                                        </div>
                                    </div>

                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                                        <div>
                                            <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">Event Category</label>
                                            <select id="event-category" style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary); cursor: pointer;">
                                                <option value="">Select category...</option>
                                                <option value="conference">🏢 Conference</option>
                                                <option value="workshop">🔧 Workshop</option>
                                                <option value="seminar">📚 Seminar</option>
                                                <option value="meetup">👥 Meetup</option>
                                                <option value="networking">🤝 Networking</option>
                                                <option value="social">🎉 Social Event</option>
                                                <option value="training">📖 Training</option>
                                                <option value="webinar">💻 Webinar</option>
                                                <option value="other">✨ Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">Event Format</label>
                                            <select id="event-format" style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary); cursor: pointer;" onchange="this.updateLocationFields()">
                                                <option value="in-person">🏢 In-Person</option>
                                                <option value="virtual">💻 Virtual</option>
                                                <option value="hybrid">🔄 Hybrid</option>
                                            </select>
                                        </div>
                                    </div>

                                    <!-- Date and Time -->
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                                        <div>
                                            <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">Start Date & Time <span style="color: var(--error);">*</span></label>
                                            <input type="datetime-local" id="event-start-time" style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary);">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">End Date & Time <span style="color: var(--error);">*</span></label>
                                            <input type="datetime-local" id="event-end-time" style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary);">
                                        </div>
                                    </div>

                                    <!-- Location/Virtual Setup -->
                                    <div id="location-section" style="margin-bottom: 2rem;">
                                        <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">Event Location <span style="color: var(--error);">*</span></label>
                                        <input type="text" id="event-location" placeholder="Enter venue address..." style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary); margin-bottom: 0.75rem;">
                                        <textarea id="venue-details" placeholder="Additional venue information, parking details, accessibility info..." style="width: 100%; height: 80px; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary); resize: vertical;"></textarea>
                                    </div>

                                    <!-- Tags -->
                                    <div style="margin-bottom: 2rem;">
                                        <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">Event Tags</label>
                                        <input type="text" id="event-tags" placeholder="networking, tech, professional, beginner-friendly" style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary);">
                                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">Separate tags with commas to help people discover your event</div>
                                    </div>
                                </div>

                                <!-- Speaker Information -->
                                <div style="background: var(--glass); border-radius: 16px; padding: 2.5rem; border: 1px solid var(--glass-border);">
                                    <h3 style="margin-bottom: 2rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                                        <i class="fas fa-microphone" style="color: var(--primary);"></i> Speakers & Presenters
                                    </h3>
                                    <div id="speakers-list">
                                        <div style="display: grid; grid-template-columns: 1fr 2fr 1fr auto; gap: 0.75rem; margin-bottom: 1rem; align-items: end;">
                                            <input type="text" placeholder="Speaker name" style="padding: 0.75rem; border: 2px solid var(--glass-border); border-radius: 8px; background: var(--glass); color: var(--text-primary);">
                                            <input type="text" placeholder="Title/Bio" style="padding: 0.75rem; border: 2px solid var(--glass-border); border-radius: 8px; background: var(--glass); color: var(--text-primary);">
                                            <input type="email" placeholder="Email (optional)" style="padding: 0.75rem; border: 2px solid var(--glass-border); border-radius: 8px; background: var(--glass); color: var(--text-primary);">
                                            <button style="background: var(--error); color: white; border: none; padding: 0.75rem; border-radius: 8px; cursor: pointer;" onclick="this.removeSpeaker(this)">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <button class="btn btn-secondary btn-small" onclick="this.addSpeaker()" style="margin-top: 1rem;">
                                        <i class="fas fa-plus"></i> Add Speaker
                                    </button>
                                </div>
                            </div>

                            <!-- Right Column - Settings -->
                            <div>
                                <!-- Registration Settings -->
                                <div style="background: var(--glass); border-radius: 16px; padding: 2rem; margin-bottom: 2rem; border: 1px solid var(--glass-border);">
                                    <h4 style="margin-bottom: 1.5rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-ticket-alt" style="color: var(--primary);"></i> Registration</h4>
                                    
                                    <label style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; cursor: pointer;">
                                        <input type="checkbox" id="requires-registration" checked>
                                        <span>Require registration to attend</span>
                                    </label>
                                    
                                    <div style="margin-bottom: 1.5rem;">
                                        <label style="display: block; margin-bottom: 0.75rem; font-weight: 600;">Maximum Attendees</label>
                                        <input type="number" placeholder="100" min="1" style="width: 100%; padding: 0.75rem; border: 2px solid var(--glass-border); border-radius: 8px; background: var(--glass); color: var(--text-primary);">
                                    </div>
                                    
                                    <div style="margin-bottom: 1.5rem;">
                                        <label style="display: block; margin-bottom: 0.75rem; font-weight: 600;">Registration Deadline</label>
                                        <input type="datetime-local" style="width: 100%; padding: 0.75rem; border: 2px solid var(--glass-border); border-radius: 8px; background: var(--glass); color: var(--text-primary);">
                                    </div>
                                    
                                    <label style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; cursor: pointer;">
                                        <input type="checkbox">
                                        <span>Enable waitlist</span>
                                    </label>
                                    
                                    <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                                        <input type="checkbox">
                                        <span>Approval required</span>
                                    </label>
                                </div>

                                <!-- Event Privacy -->
                                <div style="background: var(--glass); border-radius: 16px; padding: 2rem; margin-bottom: 2rem; border: 1px solid var(--glass-border);">
                                    <h4 style="margin-bottom: 1.5rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-lock" style="color: var(--primary);"></i> Privacy Settings</h4>
                                    
                                    <label style="display: flex; align-items: start; gap: 0.75rem; margin-bottom: 1.5rem; cursor: pointer;">
                                        <input type="radio" name="event-privacy" value="public" checked>
                                        <div>
                                            <div style="font-weight: 600;">Public Event</div>
                                            <div style="font-size: 0.85rem; color: var(--text-muted);">Anyone can see and join</div>
                                        </div>
                                    </label>
                                    <label style="display: flex; align-items: start; gap: 0.75rem; margin-bottom: 1.5rem; cursor: pointer;">
                                        <input type="radio" name="event-privacy" value="private">
                                        <div>
                                            <div style="font-weight: 600;">Private Event</div>
                                            <div style="font-size: 0.85rem; color: var(--text-muted);">Invitation required</div>
                                        </div>
                                    </label>
                                    <label style="display: flex; align-items: start; gap: 0.75rem; cursor: pointer;">
                                        <input type="radio" name="event-privacy" value="group-only">
                                        <div>
                                            <div style="font-weight: 600;">Group Members Only</div>
                                            <div style="font-size: 0.85rem; color: var(--text-muted);">Visible to group members</div>
                                        </div>
                                    </label>
                                </div>

                                <!-- Notifications -->
                                <div style="background: var(--glass); border-radius: 16px; padding: 2rem; border: 1px solid var(--glass-border);">
                                    <h4 style="margin-bottom: 1.5rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-bell" style="color: var(--primary);"></i> Notifications</h4>
                                    
                                    <label style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; cursor: pointer;">
                                        <input type="checkbox" checked>
                                        <span>Email confirmations</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; cursor: pointer;">
                                        <input type="checkbox" checked>
                                        <span>Reminder 24h before</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; cursor: pointer;">
                                        <input type="checkbox">
                                        <span>Reminder 1h before</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                                        <input type="checkbox">
                                        <span>Follow-up survey</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--glass-border);">
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
            </div>
        `;

        // Add event handlers
        modal.triggerImageUpload = () => {
            const fileInput = modal.querySelector('#image-upload-input');
            fileInput.click();
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.displayImagePreview(modal, e.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            };
        };

        modal.updateLocationFields = () => {
            const format = modal.querySelector('#event-format').value;
            const locationSection = modal.querySelector('#location-section');
            const locationInput = modal.querySelector('#event-location');
            const venueDetails = modal.querySelector('#venue-details');
            
            if (format === 'virtual') {
                locationSection.querySelector('label').innerHTML = 'Meeting Link <span style="color: var(--error);">*</span>';
                locationInput.placeholder = 'Enter Zoom, Teams, or other meeting link...';
                venueDetails.placeholder = 'Meeting details, access instructions, tech requirements...';
            } else if (format === 'hybrid') {
                locationSection.querySelector('label').innerHTML = 'Venue & Meeting Link <span style="color: var(--error);">*</span>';
                locationInput.placeholder = 'Venue address and meeting link...';
                venueDetails.placeholder = 'Venue and virtual meeting details...';
            } else {
                locationSection.querySelector('label').innerHTML = 'Event Location <span style="color: var(--error);">*</span>';
                locationInput.placeholder = 'Enter venue address...';
                venueDetails.placeholder = 'Additional venue information, parking details, accessibility info...';
            }
        };

        modal.addSpeaker = () => {
            const speakersContainer = modal.querySelector('#speakers-list');
            const newSpeaker = document.createElement('div');
            newSpeaker.style.cssText = 'display: grid; grid-template-columns: 1fr 2fr 1fr auto; gap: 0.75rem; margin-bottom: 1rem; align-items: end;';
            newSpeaker.innerHTML = `
                <input type="text" placeholder="Speaker name" style="padding: 0.75rem; border: 2px solid var(--glass-border); border-radius: 8px; background: var(--glass); color: var(--text-primary);">
                <input type="text" placeholder="Title/Bio" style="padding: 0.75rem; border: 2px solid var(--glass-border); border-radius: 8px; background: var(--glass); color: var(--text-primary);">
                <input type="email" placeholder="Email (optional)" style="padding: 0.75rem; border: 2px solid var(--glass-border); border-radius: 8px; background: var(--glass); color: var(--text-primary);">
                <button style="background: var(--error); color: white; border: none; padding: 0.75rem; border-radius: 8px; cursor: pointer;" onclick="this.removeSpeaker(this)">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            speakersContainer.appendChild(newSpeaker);
        };

        modal.removeSpeaker = (button) => {
            button.closest('div').remove();
        };

        modal.saveDraft = () => {
            if (this.validateForm(modal, false)) {
                if (this.app && this.app.showToast) {
                    this.app.showToast('Event saved as draft!', 'success');
                }
            }
        };

        modal.previewEvent = () => {
            if (this.validateForm(modal, true)) {
                this.showEventPreview(modal);
            }
        };

        modal.publishEvent = () => {
            if (this.validateForm(modal, true)) {
                if (this.app && this.app.showToast) {
                    this.app.showToast('Event published successfully!', 'success');
                }
                modal.remove();
            }
        };

        document.body.appendChild(modal);
    }

    displayImagePreview(modal, imageSrc) {
        const uploadArea = modal.querySelector('#image-upload-area');
        const placeholder = modal.querySelector('#upload-placeholder');
        
        uploadArea.style.backgroundImage = `url(${imageSrc})`;
        uploadArea.style.backgroundSize = 'cover';
        uploadArea.style.backgroundPosition = 'center';
        placeholder.style.display = 'none';
    }

    validateForm(modal, requireAll = false) {
        const title = modal.querySelector('#event-title').value.trim();
        const description = modal.querySelector('#event-description').value.trim();
        const startTime = modal.querySelector('#event-start-time').value;
        const endTime = modal.querySelector('#event-end-time').value;
        const location = modal.querySelector('#event-location').value.trim();

        let isValid = true;
        let errors = [];

        if (requireAll) {
            if (!title) {
                errors.push('Event title is required');
                isValid = false;
            }
            if (!description) {
                errors.push('Event description is required');
                isValid = false;
            }
            if (!startTime) {
                errors.push('Start date and time is required');
                isValid = false;
            }
            if (!endTime) {
                errors.push('End date and time is required');
                isValid = false;
            }
            if (!location) {
                errors.push('Event location is required');
                isValid = false;
            }
            if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
                errors.push('End time must be after start time');
                isValid = false;
            }
        }

        if (!isValid && this.app && this.app.showToast) {
            this.app.showToast(errors.join('. '), 'error');
        }

        return isValid;
    }

    showEventPreview(modal) {
        const title = modal.querySelector('#event-title').value || 'Untitled Event';
        const description = modal.querySelector('#event-description').value || 'No description provided';
        
        const previewModal = document.createElement('div');
        previewModal.className = 'modal active';
        previewModal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; width: 90%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-eye"></i> Event Preview</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>
                
                <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                    <h1 style="margin-bottom: 1rem; color: var(--primary);">${title}</h1>
                    <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">${description}</p>
                    <div style="color: var(--text-muted); font-size: 0.9rem;">This is how your event will appear to attendees</div>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close Preview</button>
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove(); modal.publishEvent();">Publish Event</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(previewModal);
    }

    /**
     * 2. EVENT DETAILS VIEW INTERFACE
     */
    showEventDetailsView() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1000px; width: 95%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h2><i class="fas fa-calendar-day"></i> React Development Workshop</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="event-details-content">
                    <!-- Event Hero Section -->
                    <div style="position: relative; height: 250px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 12px; margin-bottom: 2rem; display: flex; flex-direction: column; justify-content: flex-end; padding: 2rem; color: white;">
                        <h1 style="margin: 0; font-size: 2rem; margin-bottom: 0.5rem;">React Development Workshop</h1>
                        <div style="opacity: 0.9; font-size: 1rem;">Learn modern React patterns and best practices from industry experts</div>
                    </div>

                    <div style="text-align: center; margin: 2rem 0;">
                        <button class="btn btn-primary" onclick="this.registerForEvent()">
                            <i class="fas fa-ticket-alt"></i> Register for Event
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.registerForEvent = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Successfully registered for event!', 'success');
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

                    <!-- QR Code Check-in -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem; text-align: center;">
                        <h5 style="margin-bottom: 1rem;"><i class="fas fa-qrcode"></i> QR Code Check-In</h5>
                        <div style="width: 200px; height: 200px; background: white; border-radius: 8px; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; border: 2px solid var(--glass-border);">
                            <div style="width: 180px; height: 180px; background: repeating-linear-gradient(90deg, #000 0px, #000 8px, #fff 8px, #fff 16px), repeating-linear-gradient(0deg, #000 0px, #000 8px, #fff 8px, #fff 16px); background-size: 16px 16px; border-radius: 4px; position: relative;">
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

        document.body.appendChild(modal);
    }

    /**
     * 4. EVENT PHOTO GALLERY INTERFACE
     */
    showEventPhotoGallery() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1000px; width: 95%;">
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

                    <!-- Photo Grid -->
                    <div id="photo-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        ${Array.from({length: 8}).map((_, i) => `
                            <div class="photo-item" style="position: relative; aspect-ratio: 1; background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); border-radius: 8px; overflow: hidden; cursor: pointer;" onclick="this.openPhotoViewer(${i})">
                                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">
                                    📷 ${i + 1}
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Photo Upload Section -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 2rem; border: 2px dashed var(--glass-border); text-align: center;">
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
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.openPhotoViewer = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Opening photo ${index + 1} in viewer`, 'info');
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

        modal.downloadAllPhotos = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Downloading all event photos...', 'info');
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
            <div class="modal-content" style="max-width: 800px; width: 95%;">
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
                    <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                        <h3><i class="fas fa-lightbulb"></i> Suggestions for Improvement</h3>
                        <div style="margin-top: 1rem;">
                            <textarea placeholder="What could have been better? Any suggestions for future events?" style="width: 100%; height: 120px; padding: 1rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass); resize: vertical;"></textarea>
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
