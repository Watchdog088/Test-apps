/**
 * ConnectHub Join Event System
 * Comprehensive event registration interface with multiple flows
 * Based on detailed specifications for event registration UX
 */

class JoinEventSystem {
    constructor(app) {
        this.app = app;
        this.currentEvent = null;
        this.registrationData = {};
        this.paymentMethods = ['credit-card', 'paypal', 'apple-pay', 'google-pay'];
        
        // Sample events data with different types
        this.sampleEvents = [
            {
                id: 'react-workshop-2024',
                name: 'React Development Workshop',
                description: 'Learn modern React patterns and best practices from industry experts. This comprehensive workshop covers hooks, context, performance optimization, and testing strategies.',
                date: 'March 25, 2024',
                time: '2:00 PM - 6:00 PM',
                location: 'TechHub Conference Center, Room A',
                format: 'in-person',
                category: 'workshop',
                organizer: 'TechHub Academy',
                organizerEmail: 'sarah@techhub.com',
                price: 0,
                currency: 'USD',
                type: 'free',
                maxAttendees: 100,
                currentAttendees: 78,
                registrationDeadline: '2024-03-24T23:59:00Z',
                requiresApproval: false,
                hasWaitlist: true,
                privacy: 'public',
                tags: ['react', 'javascript', 'frontend', 'development', 'beginner-friendly'],
                requirements: [
                    'Laptop with Node.js installed',
                    'Basic JavaScript knowledge',
                    'Code editor (VS Code recommended)'
                ],
                agenda: [
                    { time: '2:00 PM', topic: 'Welcome & Setup' },
                    { time: '2:30 PM', topic: 'React Fundamentals Review' },
                    { time: '3:30 PM', topic: 'Modern Hooks & Patterns' },
                    { time: '4:30 PM', topic: 'Break' },
                    { time: '5:00 PM', topic: 'Performance & Testing' },
                    { time: '5:45 PM', topic: 'Q&A & Wrap-up' }
                ],
                image: '🚀',
                speakers: [
                    { name: 'Sarah Chen', title: 'Senior React Developer', bio: 'Lead developer at TechCorp with 8+ years React experience' },
                    { name: 'Mike Rodriguez', title: 'Frontend Architect', bio: 'Consultant specializing in React performance optimization' }
                ]
            },
            {
                id: 'startup-pitch-night',
                name: 'Startup Pitch Night',
                description: 'Present your startup idea to investors and fellow entrepreneurs. Network with like-minded individuals and get feedback on your business concept.',
                date: 'March 30, 2024',
                time: '6:00 PM - 9:00 PM',
                location: 'Innovation Hub, Main Hall',
                format: 'in-person',
                category: 'networking',
                organizer: 'Startup Community',
                organizerEmail: 'events@startup-community.com',
                price: 25,
                currency: 'USD',
                type: 'paid',
                maxAttendees: 50,
                currentAttendees: 32,
                registrationDeadline: '2024-03-29T18:00:00Z',
                requiresApproval: false,
                hasWaitlist: true,
                privacy: 'public',
                tags: ['startup', 'networking', 'pitching', 'investors'],
                requirements: ['Prepared 3-minute pitch (optional)', 'Business cards recommended'],
                agenda: [
                    { time: '6:00 PM', topic: 'Registration & Networking' },
                    { time: '6:30 PM', topic: 'Welcome & Instructions' },
                    { time: '7:00 PM', topic: 'Startup Pitches (Round 1)' },
                    { time: '8:00 PM', topic: 'Break & Networking' },
                    { time: '8:30 PM', topic: 'Startup Pitches (Round 2)' },
                    { time: '9:00 PM', topic: 'Awards & Closing' }
                ],
                image: '💼',
                speakers: []
            },
            {
                id: 'private-investor-meetup',
                name: 'Private Investor Meetup',
                description: 'Exclusive gathering for accredited investors. Discuss investment opportunities and market trends.',
                date: 'April 5, 2024',
                time: '7:00 PM - 10:00 PM',
                location: 'Private Club, Executive Lounge',
                format: 'in-person',
                category: 'meetup',
                organizer: 'Investment Partners',
                organizerEmail: 'exclusive@investors.com',
                price: 0,
                currency: 'USD',
                type: 'private',
                maxAttendees: 20,
                currentAttendees: 15,
                registrationDeadline: '2024-04-03T12:00:00Z',
                requiresApproval: true,
                hasWaitlist: true,
                privacy: 'private',
                accessCode: 'INV2024',
                tags: ['investment', 'exclusive', 'networking', 'private'],
                requirements: ['Accredited investor status', 'Professional attire required'],
                agenda: [
                    { time: '7:00 PM', topic: 'Welcome Reception' },
                    { time: '7:30 PM', topic: 'Market Overview Presentation' },
                    { time: '8:30 PM', topic: 'Investment Opportunities Discussion' },
                    { time: '9:30 PM', topic: 'Networking & Drinks' }
                ],
                image: '🔒',
                speakers: []
            }
        ];

        this.initializeEventSystem();
    }

    initializeEventSystem() {
        console.log('Join Event System initialized');
        
        // Bind to window for global access
        window.joinEventSystem = this;
    }

    /**
     * Main function to handle joining an event
     */
    joinEvent(eventName, eventId = null) {
        // Find the event by name or ID
        this.currentEvent = this.sampleEvents.find(event => 
            event.name === eventName || event.id === eventId
        );

        if (!this.currentEvent) {
            // Create a default event if not found
            this.currentEvent = {
                id: 'default-event',
                name: eventName,
                description: 'Join this exciting event and connect with like-minded people!',
                date: 'March 25, 2024',
                time: '2:00 PM - 6:00 PM',
                location: 'TechHub Conference Center, Room A',
                format: 'in-person',
                category: 'workshop',
                organizer: 'Event Organizer',
                organizerEmail: 'organizer@example.com',
                price: 0,
                currency: 'USD',
                type: 'free',
                maxAttendees: 100,
                currentAttendees: 78,
                registrationDeadline: '2024-03-24T23:59:00Z',
                requiresApproval: false,
                hasWaitlist: true,
                privacy: 'public',
                tags: ['networking', 'professional', 'community'],
                requirements: ['Enthusiasm to learn and network'],
                agenda: [],
                image: '🎉',
                speakers: []
            };
        }

        this.showJoinEventModal();
    }

    /**
     * Display the comprehensive join event modal
     */
    showJoinEventModal() {
        const existingModal = document.getElementById('joinEventModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = this.createJoinEventModal();
        document.body.appendChild(modal);
        modal.classList.add('active');

        setTimeout(() => {
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    /**
     * Create the comprehensive join event modal
     */
    createJoinEventModal() {
        const event = this.currentEvent;
        const spotsRemaining = event.maxAttendees - event.currentAttendees;
        const isFull = spotsRemaining <= 0;
        const isPrivate = event.type === 'private';
        const isPaid = event.type === 'paid';
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'joinEventModal';
        modal.innerHTML = this.getModalContent(event, spotsRemaining, isFull, isPrivate, isPaid);

        // Add event listeners
        this.attachModalEventListeners(modal);
        
        return modal;
    }

    getModalContent(event, spotsRemaining, isFull, isPrivate, isPaid) {
        return `
            <div class="modal-content" style="max-width: 900px; width: 95%; max-height: 90vh; padding: 0; overflow: hidden; background: var(--bg-card); border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                ${this.getEventHeader(event, spotsRemaining, isFull)}
                <div style="max-height: calc(90vh - 280px); overflow-y: auto; padding: 0;">
                    ${isPrivate ? this.getPrivateEventAccess() : ''}
                    <div style="padding: 2rem;">
                        <form id="eventRegistrationForm" style="display: flex; flex-direction: column; gap: 2rem;">
                            ${this.getPersonalInfoSection()}
                            ${this.getEventPreferencesSection()}
                            ${isPaid ? this.getPaymentSection() : ''}
                            ${this.getEventDetailsSection()}
                            ${this.getTermsSection()}
                            ${this.getRegistrationActions(isFull)}
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    getEventHeader(event, spotsRemaining, isFull) {
        return `
            <div style="position: relative; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); padding: 2rem; color: white; overflow: hidden;">
                <div style="position: absolute; top: 1rem; right: 1rem;">
                    <button onclick="window.joinEventSystem.closeModal()" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0.5rem; border-radius: 50%; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center;" title="Close">×</button>
                </div>
                
                <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem;">
                    <div style="font-size: 4rem; width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center;">${event.image}</div>
                    <div style="flex: 1;">
                        <h1 style="margin: 0 0 0.5rem 0; font-size: 2rem; font-weight: 700; line-height: 1.2;">${event.name}</h1>
                        <div style="opacity: 0.9; font-size: 1rem; margin-bottom: 1rem; display: flex; flex-wrap: wrap; gap: 1rem;">
                            <span>📅 ${event.date}</span>
                            <span>⏰ ${event.time}</span>
                            <span>📍 ${event.location}</span>
                        </div>
                        ${isFull ? 
                            '<div style="background: var(--error); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; display: inline-block;">Event Full - Waitlist Available</div>' :
                            `<div style="background: rgba(255,255,255,0.2); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; display: inline-block;">👥 ${spotsRemaining} spots available</div>`
                        }
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 12px;">
                        <div style="font-weight: 600; margin-bottom: 0.5rem;">
                            ${event.type === 'free' ? '✓ Free Event' : event.type === 'paid' ? `💰 $${event.price} ${event.currency}` : '🔒 Private Event'}
                        </div>
                        <div style="opacity: 0.9; font-size: 0.9rem;">
                            ${event.type === 'free' ? 'No payment required' : event.type === 'paid' ? 'Secure payment processing' : 'Invitation required'}
                        </div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 12px;">
                        <div style="font-weight: 600; margin-bottom: 0.5rem;">
                            ${event.requiresApproval ? '⏳ Requires Approval' : '✅ Instant Registration'}
                        </div>
                        <div style="opacity: 0.9; font-size: 0.9rem;">
                            ${event.requiresApproval ? 'Organizer will review your application' : 'Join immediately after registration'}
                        </div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 12px;">
                        <div style="font-weight: 600; margin-bottom: 0.5rem;">📝 Registration Deadline</div>
                        <div style="opacity: 0.9; font-size: 0.9rem;">${this.formatDateTime(event.registrationDeadline)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    getPrivateEventAccess() {
        return `
            <div style="padding: 2rem; background: var(--glass); border-bottom: 1px solid var(--glass-border);">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
                    <h3 style="color: var(--primary); margin-bottom: 0.5rem;">Private Event Access Required</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">This is an exclusive event. Please enter your access code to continue registration.</p>
                </div>
                
                <div style="max-width: 400px; margin: 0 auto;">
                    <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">
                        Access Code <span style="color: var(--error);">*</span>
                    </label>
                    <input type="text" id="accessCode" placeholder="Enter your access code..." 
                           style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary); font-size: 1rem; text-align: center; letter-spacing: 2px; text-transform: uppercase;"
                           maxlength="10">
                    <div id="accessCodeFeedback" style="margin-top: 0.5rem; font-size: 0.9rem; text-align: center; display: none;"></div>
                    <div style="text-align: center; margin-top: 1rem;">
                        <button type="button" onclick="window.joinEventSystem.verifyAccessCode()" class="btn btn-primary" style="padding: 0.75rem 2rem;">
                            Verify Access Code
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getPersonalInfoSection() {
        return `
            <div style="background: var(--glass); border-radius: 16px; padding: 2rem; border: 1px solid var(--glass-border);">
                <h3 style="margin-bottom: 1.5rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                    👤 Personal Information
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">
                            Full Name <span style="color: var(--error);">*</span>
                        </label>
                        <input type="text" id="fullName" value="John Doe" placeholder="Enter your full name..." 
                               style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary); font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">
                            Email Address <span style="color: var(--error);">*</span>
                        </label>
                        <input type="email" id="email" value="john.doe@email.com" placeholder="Enter your email..." 
                               style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary); font-size: 1rem;">
                    </div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">
                        Phone Number (Optional)
                    </label>
                    <input type="tel" id="phone" placeholder="+1 (555) 123-4567" 
                           style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary); font-size: 1rem;">
                </div>

                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px;">
                        <input type="checkbox" id="hasDietaryRestrictions" style="margin-top: 0.1rem;" onchange="window.joinEventSystem.toggleSection('dietarySection', this.checked)">
                        <div>
                            <div style="font-weight: 600; margin-bottom: 0.25rem;">Dietary Restrictions/Requirements</div>
                            <div style="font-size: 0.9rem; color: var(--text-secondary);">Let us know about any food allergies or dietary preferences</div>
                        </div>
                    </label>
                    
                    <div id="dietarySection" style="display: none; margin-left: 2rem;">
                        <textarea id="dietaryRestrictions" placeholder="Please describe your dietary restrictions..." 
                                  style="width: 100%; height: 80px; padding: 0.75rem; border: 2px solid var(--glass-border); border-radius: 8px; background: var(--glass); color: var(--text-primary); resize: vertical;"></textarea>
                    </div>

                    <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px;">
                        <input type="checkbox" id="needsAccessibility" style="margin-top: 0.1rem;" onchange="window.joinEventSystem.toggleSection('accessibilitySection', this.checked)">
                        <div>
                            <div style="font-weight: 600; margin-bottom: 0.25rem;">Accessibility Accommodations</div>
                            <div style="font-size: 0.9rem; color: var(--text-secondary);">Request accommodations to ensure full participation</div>
                        </div>
                    </label>
                    
                    <div id="accessibilitySection" style="display: none; margin-left: 2rem;">
                        <textarea id="accessibilityNeeds" placeholder="Please describe any accessibility accommodations..." 
                                  style="width: 100%; height: 80px; padding: 0.75rem; border: 2px solid var(--glass-border); border-radius: 8px; background: var(--glass); color: var(--text-primary); resize: vertical;"></textarea>
                    </div>
                </div>
            </div>
        `;
    }

    getEventPreferencesSection() {
        return `
            <div style="background: var(--glass); border-radius: 16px; padding: 2rem; border: 1px solid var(--glass-border);">
                <h3 style="margin-bottom: 1.5rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                    ⚙️ Event Preferences
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1.5rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">
                            How did you hear about this event?
                        </label>
                        <select id="referralSource" style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary); cursor: pointer;">
                            <option value="">Select an option...</option>
                            <option value="social-media">📱 Social Media</option>
                            <option value="friend">👥 Friend/Colleague</option>
                            <option value="website">🌐 Website/Blog</option>
                            <option value="email">📧 Email Newsletter</option>
                            <option value="search-engine">🔍 Search Engine</option>
                            <option value="other">✨ Other</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">
                            Experience Level
                        </label>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border-radius: 8px;">
                                <input type="radio" name="experienceLevel" value="beginner" checked>
                                <span>🌱 Beginner</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border-radius: 8px;">
                                <input type="radio" name="experienceLevel" value="intermediate">
                                <span>🚀 Intermediate</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border-radius: 8px;">
                                <input type="radio" name="experienceLevel" value="advanced">
                                <span>⚡ Advanced</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px;">
                        <input type="checkbox" id="addToCalendar" checked>
                        <div>
                            <div style="font-weight: 600;">📅 Add to my calendar after registration</div>
                            <div style="font-size: 0.9rem; color: var(--text-secondary);">Automatically sync with your preferred calendar app</div>
                        </div>
                    </label>
                    
                    <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px;">
                        <input type="checkbox" id="receiveReminders" checked>
                        <div>
                            <div style="font-weight: 600;">🔔 Receive event reminders</div>
                            <div style="font-size: 0.9rem; color: var(--text-secondary);">Get notified 24 hours and 1 hour before the event</div>
                        </div>
                    </label>
                    
                    <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px;">
                        <input type="checkbox" id="joinDiscussion">
                        <div>
                            <div style="font-weight: 600;">💬 Join event's private discussion group</div>
                            <div style="font-size: 0.9rem; color: var(--text-secondary);">Connect with other attendees before and after the event</div>
                        </div>
                    </label>
                </div>
            </div>
        `;
    }

    getPaymentSection() {
        const event = this.currentEvent;
        return `
            <div style="background: var(--glass); border-radius: 16px; padding: 2rem; border: 1px solid var(--glass-border);">
                <h3 style="margin-bottom: 1.5rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                    💳 Payment Information
                </h3>
                
                <div style="background: var(--primary); color: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; text-align: center;">
                    <h4 style="margin: 0 0 0.5rem 0; font-size: 1.5rem;">Event Registration Fee</h4>
                    <div style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;">$${event.price} ${event.currency}</div>
                    <div style="opacity: 0.9;">Secure payment processing • Full refund available up to 24 hours before event</div>
                </div>

                <div style="margin-bottom: 2rem;">
                    <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">
                        Payment Method
                    </label>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; padding: 1rem; background: var(--bg-secondary); border-radius: 12px; border: 2px solid transparent; transition: all 0.2s ease;" onclick="this.selectPaymentMethod('credit-card')">
                            <input type="radio" name="paymentMethod" value="credit-card" checked>
                            <div>
                                <div style="font-weight: 600;">💳 Credit/Debit Card</div>
                                <div style="font-size: 0.9rem; color: var(--text-secondary);">Visa, MasterCard, American Express</div>
                            </div>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; padding: 1rem; background: var(--bg-secondary); border-radius: 12px; border: 2px solid transparent; transition: all 0.2s ease;" onclick="this.selectPaymentMethod('paypal')">
                            <input type="radio" name="paymentMethod" value="paypal">
                            <div>
                                <div style="font-weight: 600;">🔵 PayPal</div>
                                <div style="font-size: 0.9rem; color: var(--text-secondary);">Quick and secure PayPal checkout</div>
                            </div>
                        </label>
                    </div>
                </div>

                <div id="creditCardSection">
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">
                                Card Number <span style="color: var(--error);">*</span>
                            </label>
                            <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" 
                                   style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary); font-size: 1rem;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">
                                CVV <span style="color: var(--error);">*</span>
                            </label>
                            <input type="text" id="cvv" placeholder="123" maxlength="4" 
                                   style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary); font-size: 1rem;">
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">
                                Expiry Month <span style="color: var(--error);">*</span>
                            </label>
                            <select id="expiryMonth" style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary);">
                                <option value="">Month</option>
                                ${Array.from({length: 12}, (_, i) => `<option value="${(i+1).toString().padStart(2, '0')}">${(i+1).toString().padStart(2, '0')}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">
                                Expiry Year <span style="color: var(--error);">*</span>
                            </label>
                            <select id="expiryYear" style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary);">
                                <option value="">Year</option>
                                ${Array.from({length: 10}, (_, i) => {
                                    const year = new Date().getFullYear() + i;
                                    return `<option value="${year}">${year}</option>`;
                                }).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: var(--text-primary);">
                            Cardholder Name <span style="color: var(--error);">*</span>
                        </label>
                        <input type="text" id="cardholderName" placeholder="John Doe" 
                               style="width: 100%; padding: 1rem; border: 2px solid var(--glass-border); border-radius: 12px; background: var(--glass); color: var(--text-primary); font-size: 1rem;">
                    </div>
                </div>
            </div>
        `;
    }

    getEventDetailsSection() {
        const event = this.currentEvent;
        return `
            <div style="background: var(--glass); border-radius: 16px; padding: 2rem; border: 1px solid var(--glass-border);">
                <h3 style="margin-bottom: 1.5rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                    📋 Event Details
                </h3>
                
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: var(--primary); margin-bottom: 1rem;">About This Event</h4>
                    <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">${event.description}</p>
                    
                    ${event.requirements.length > 0 ? `
                        <h5 style="color: var(--text-primary); margin-bottom: 0.75rem;">Requirements:</h5>
                        <ul style="color: var(--text-secondary); margin-left: 1.5rem; margin-bottom: 1rem;">
                            ${event.requirements.map(req => `<li style="margin-bottom: 0.5rem;">${req}</li>`).join('')}
                        </ul>
                    ` : ''}
                    
                    ${event.agenda.length > 0 ? `
                        <h5 style="color: var(--text-primary); margin-bottom: 0.75rem;">Event Agenda:</h5>
                        <div style="background: var(--bg-secondary); border-radius: 8px; padding: 1rem;">
                            ${event.agenda.map(item => `
                                <div style="display: flex; gap: 1rem; margin-bottom: 0.75rem; align-items: center;">
                                    <div style="background: var(--primary); color: white; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; min-width: 80px; text-align: center;">${item.time}</div>
                                    <div style="color: var(--text-secondary);">${item.topic}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${event.speakers.length > 0 ? `
                        <h5 style="color: var(--text-primary); margin: 1.5rem 0 0.75rem 0;">Speakers:</h5>
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            ${event.speakers.map(speaker => `
                                <div style="display: flex; gap: 1rem; align-items: center; background: var(--bg-secondary); border-radius: 8px; padding: 1rem;">
                                    <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">${speaker.name.charAt(0)}</div>
                                    <div>
                                        <div style="font-weight: 600; color: var(--text-primary);">${speaker.name}</div>
                                        <div style="color: var(--primary); font-size: 0.9rem; margin-bottom: 0.25rem;">${speaker.title}</div>
                                        <div style="color: var(--text-secondary); font-size: 0.9rem;">${speaker.bio}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    getTermsSection() {
        return `
            <div style="background: var(--glass); border-radius: 16px; padding: 2rem; border: 1px solid var(--glass-border);">
                <h3 style="margin-bottom: 1.5rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                    📋 Terms & Privacy
                </h3>
                
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px;">
                        <input type="checkbox" id="acceptTerms" style="margin-top: 0.1rem;" required>
                        <div>
                            <div style="font-weight: 600; margin-bottom: 0.25rem;">I agree to the event terms and conditions <span style="color: var(--error);">*</span></div>
                            <div style="font-size: 0.9rem; color: var(--text-secondary);">By registering, you agree to follow the event guidelines and policies</div>
                        </div>
                    </label>
                    
                    <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px;">
                        <input type="checkbox" id="photoConsent">
                        <div>
                            <div style="font-weight: 600; margin-bottom: 0.25rem;">I consent to event photography/recording</div>
                            <div style="font-size: 0.9rem; color: var(--text-secondary);">Allow photos and videos to be taken during the event for promotional purposes</div>
                        </div>
                    </label>
                    
                    <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px;">
                        <input type="checkbox" id="newsletterSubscribe">
                        <div>
                            <div style="font-weight: 600; margin-bottom: 0.25rem;">Subscribe to organizer's newsletter</div>
                            <div style="font-size: 0.9rem; color: var(--text-secondary);">Receive updates about future events and opportunities</div>
                        </div>
                    </label>
                </div>
            </div>
        `;
    }

    getRegistrationActions(isFull) {
        return `
            <div style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 2rem; border-top: 1px solid var(--glass-border);">
                <button type="button" onclick="window.joinEventSystem.closeModal()" class="btn btn-secondary" style="padding: 0.75rem 2rem;">
                    Cancel
                </button>
                ${isFull ? `
                    <button type="button" onclick="window.joinEventSystem.joinWaitlist()" class="btn btn-warning" style="padding: 0.75rem 2rem;">
                        <i class="fas fa-clock"></i> Join Waitlist
                    </button>
                ` : `
                    <button type="submit" class="btn btn-primary" style="padding: 0.75rem 2rem;">
                        <i class="fas fa-ticket-alt"></i> Complete Registration
                    </button>
                `}
            </div>
        `;
    }

    // Utility methods
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    toggleSection(sectionId, show) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = show ? 'block' : 'none';
        }
    }

    verifyAccessCode() {
        const input = document.getElementById('accessCode');
        const feedback = document.getElementById('accessCodeFeedback');
        
        if (!input || !feedback) return;

        const code = input.value.trim().toUpperCase();
        const expectedCode = this.currentEvent.accessCode;

        feedback.style.display = 'block';

        if (code === expectedCode) {
            feedback.textContent = '✅ Access code verified! You may proceed with registration.';
            feedback.style.color = 'var(--success)';
            input.style.borderColor = 'var(--success)';
            
            // Enable the rest of the form
            setTimeout(() => {
                const privateSection = feedback.closest('[style*="background: var(--glass)"]');
                if (privateSection) {
                    privateSection.style.opacity = '0.5';
                    privateSection.style.pointerEvents = 'none';
                }
            }, 1000);
        } else {
            feedback.textContent = '❌ Invalid access code. Please check your invitation and try again.';
            feedback.style.color = 'var(--error)';
            input.style.borderColor = 'var(--error)';
        }
    }

    attachModalEventListeners(modal) {
        // Form submission
        const form = modal.querySelector('#eventRegistrationForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistrationSubmission();
            });
        }

        // Close modal on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    handleRegistrationSubmission() {
        // Validate form
        if (!this.validateRegistrationForm()) {
            return;
        }

        // Collect form data
        this.collectRegistrationData();

        // Show loading state
        this.showLoadingState();

        // Simulate API call
        setTimeout(() => {
            this.showSuccessModal();
        }, 2000);
    }

    validateRegistrationForm() {
        const requiredFields = ['fullName', 'email'];
        const acceptTerms = document.getElementById('acceptTerms');
        
        // Check required fields
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                this.showToast(`Please fill in all required fields`, 'error');
                field?.focus();
                return false;
            }
        }

        // Check terms acceptance
        if (!acceptTerms?.checked) {
            this.showToast('You must accept the terms and conditions', 'error');
            acceptTerms?.focus();
            return false;
        }

        // Validate payment if required
        if (this.currentEvent.type === 'paid') {
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
            if (paymentMethod?.value === 'credit-card') {
                const cardNumber = document.getElementById('cardNumber');
                const cvv = document.getElementById('cvv');
                const cardholderName = document.getElementById('cardholderName');
                
                if (!cardNumber?.value || !cvv?.value || !cardholderName?.value) {
                    this.showToast('Please complete payment information', 'error');
                    return false;
                }
            }
        }

        // Validate private event access code
        if (this.currentEvent.type === 'private') {
            const accessCode = document.getElementById('accessCode');
            if (!accessCode?.value || accessCode.value.toUpperCase() !== this.currentEvent.accessCode) {
                this.showToast('Please verify your access code first', 'error');
                return false;
            }
        }

        return true;
    }

    collectRegistrationData() {
        const form = document.getElementById('eventRegistrationForm');
        if (!form) return;

        this.registrationData = {
            eventId: this.currentEvent.id,
            personalInfo: {
                fullName: document.getElementById('fullName')?.value || '',
                email: document.getElementById('email')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                dietaryRestrictions: document.getElementById('dietaryRestrictions')?.value || '',
                accessibilityNeeds: document.getElementById('accessibilityNeeds')?.value || ''
            },
            preferences: {
                experienceLevel: document.querySelector('input[name="experienceLevel"]:checked')?.value || 'beginner',
                referralSource: document.getElementById('referralSource')?.value || '',
                addToCalendar: document.getElementById('addToCalendar')?.checked || false,
                receiveReminders: document.getElementById('receiveReminders')?.checked || false,
                joinDiscussion: document.getElementById('joinDiscussion')?.checked || false
            },
            consent: {
                termsAccepted: document.getElementById('acceptTerms')?.checked || false,
                photographyConsent: document.getElementById('photoConsent')?.checked || false,
                newsletter: document.getElementById('newsletterSubscribe')?.checked || false
            },
            registrationDate: new Date().toISOString()
        };

        if (this.currentEvent.type === 'paid') {
            this.registrationData.payment = {
                method: document.querySelector('input[name="paymentMethod"]:checked')?.value || '',
                amount: this.currentEvent.price,
                currency: this.currentEvent.currency
            };
        }
    }

    showLoadingState() {
        const submitButton = document.querySelector('#eventRegistrationForm button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Registration...';
        }
    }

    showSuccessModal() {
        const modal = document.getElementById('joinEventModal');
        if (!modal) return;

        const event = this.currentEvent;
        const successContent = `
            <div class="modal-content" style="max-width: 600px; width: 90%; padding: 0; background: var(--bg-card); border-radius: 20px; overflow: hidden;">
                <!-- Success Header -->
                <div style="background: linear-gradient(135deg, var(--success) 0%, var(--primary) 100%); padding: 3rem 2rem; color: white; text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 1rem; animation: bounce 2s infinite;">🎉</div>
                    <h1 style="margin: 0 0 0.5rem 0; font-size: 2rem;">Successfully Registered!</h1>
                    <p style="margin: 0; opacity: 0.9; font-size: 1.1rem;">You're all set for ${event.name}</p>
                </div>

                <!-- Success Details -->
                <div style="padding: 2rem;">
                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; text-align: center;">
                        <div style="color: var(--success); font-size: 1rem; margin-bottom: 1rem;">
                            📧 Confirmation email sent to ${this.registrationData.personalInfo.email}
                        </div>
                        ${this.registrationData.preferences.addToCalendar ? 
                            '<div style="color: var(--success); font-size: 1rem; margin-bottom: 1rem;">📱 Event added to your ConnectHub calendar</div>' : ''
                        }
                    </div>

                    <!-- What's Next Section -->
                    <div style="margin-bottom: 2rem;">
                        <h3 style="color: var(--text-primary); margin-bottom: 1rem;">What's Next?</h3>
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary); line-height: 1.8;">
                                <li>Check your email for joining instructions</li>
                                ${event.requirements.length > 0 ? '<li>Review the event requirements and prepare accordingly</li>' : ''}
                                ${this.registrationData.preferences.joinDiscussion ? '<li>You will be added to the event discussion group</li>' : ''}
                                <li>Set up your tech stack and materials (see requirements)</li>
                                ${this.registrationData.preferences.receiveReminders ? '<li>You\'ll receive reminders 24 hours and 1 hour before the event</li>' : ''}
                            </ul>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        <button class="btn btn-secondary" onclick="window.joinEventSystem.addToPhoneCalendar()" style="display: flex; align-items: center; gap: 0.5rem; justify-content: center;">
                            📱 Add to Phone Calendar
                        </button>
                        <button class="btn btn-secondary" onclick="window.joinEventSystem.joinDiscussionGroup()" style="display: flex; align-items: center; gap: 0.5rem; justify-content: center;">
                            💬 Join Discussion
                        </button>
                        <button class="btn btn-secondary" onclick="window.joinEventSystem.viewRequirements()" style="display: flex; align-items: center; gap: 0.5rem; justify-content: center;">
                            📋 View Requirements
                        </button>
                        <button class="btn btn-secondary" onclick="window.joinEventSystem.contactOrganizer()" style="display: flex; align-items: center; gap: 0.5rem; justify-content: center;">
                            📧 Contact Organizer
                        </button>
                    </div>

                    <!-- Support Info -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; text-align: center; margin-bottom: 2rem;">
                        <div style="font-weight: 600; margin-bottom: 0.5rem;">Need help?</div>
                        <div style="color: var(--text-secondary);">Contact organizer: ${event.organizerEmail}</div>
                    </div>

                    <!-- Close Button -->
                    <div style="text-align: center;">
                        <button class="btn btn-primary" onclick="window.joinEventSystem.closeModal()" style="padding: 0.75rem 3rem;">
                            Done
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.innerHTML = successContent;

        // Update event attendance count
        this.currentEvent.currentAttendees += 1;
    }

    joinWaitlist() {
        // Show loading state
        const waitlistButton = document.querySelector('button[onclick*="joinWaitlist"]');
        if (waitlistButton) {
            waitlistButton.disabled = true;
            waitlistButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Joining Waitlist...';
        }

        setTimeout(() => {
            this.showWaitlistSuccessModal();
        }, 1500);
    }

    showWaitlistSuccessModal() {
        const modal = document.getElementById('joinEventModal');
        if (!modal) return;

        const event = this.currentEvent;
        const waitlistContent = `
            <div class="modal-content" style="max-width: 600px; width: 90%; padding: 0; background: var(--bg-card); border-radius: 20px; overflow: hidden;">
                <!-- Waitlist Header -->
                <div style="background: linear-gradient(135deg, var(--warning) 0%, var(--primary) 100%); padding: 3rem 2rem; color: white; text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">⏰</div>
                    <h1 style="margin: 0 0 0.5rem 0; font-size: 2rem;">Added to Waitlist!</h1>
                    <p style="margin: 0; opacity: 0.9; font-size: 1.1rem;">You're now on the waitlist for ${event.name}</p>
                </div>

                <!-- Waitlist Details -->
                <div style="padding: 2rem;">
                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; text-align: center;">
                        <div style="color: var(--warning); font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem;">
                            Position #3 in queue
                        </div>
                        <div style="color: var(--text-secondary); margin-bottom: 1rem;">
                            📧 Confirmation email sent to ${document.getElementById('email')?.value || 'your email'}
                        </div>
                        <div style="color: var(--text-secondary);">
                            📱 We'll notify you immediately if a spot becomes available
                        </div>
                    </div>

                    <!-- What Happens Next -->
                    <div style="margin-bottom: 2rem;">
                        <h3 style="color: var(--text-primary); margin-bottom: 1rem;">What Happens Next?</h3>
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary); line-height: 1.8;">
                                <li>You'll receive instant notification if someone cancels</li>
                                <li>Waitlist positions are promoted automatically</li>
                                <li>You have 2 hours to confirm if a spot opens up</li>
                                <li>No payment required until you're confirmed</li>
                                <li>You can cancel your waitlist position anytime</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                        <button class="btn btn-secondary" onclick="window.joinEventSystem.manageWaitlist()" style="display: flex; align-items: center; gap: 0.5rem; justify-content: center;">
                            ⚙️ Manage Waitlist
                        </button>
                        <button class="btn btn-secondary" onclick="window.joinEventSystem.findSimilarEvents()" style="display: flex; align-items: center; gap: 0.5rem; justify-content: center;">
                            🔍 Find Similar Events
                        </button>
                    </div>

                    <!-- Close Button -->
                    <div style="text-align: center;">
                        <button class="btn btn-primary" onclick="window.joinEventSystem.closeModal()" style="padding: 0.75rem 3rem;">
                            Done
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.innerHTML = waitlistContent;
    }

    // Helper methods for post-registration actions
    addToPhoneCalendar() {
        const event = this.currentEvent;
        const startDate = new Date(`${event.date} ${event.time.split(' - ')[0]}`);
        const endDate = new Date(`${event.date} ${event.time.split(' - ')[1]}`);
        
        // Create calendar URL (simplified)
        const calendarUrl = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.name}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;
        
        // Create download link
        const link = document.createElement('a');
        link.href = calendarUrl;
        link.download = `${event.name}.ics`;
        link.click();
        
        this.showToast('Calendar event downloaded! 📱', 'success');
    }

    joinDiscussionGroup() {
        this.showToast('Discussion group invitation sent to your email! 💬', 'success');
    }

    viewRequirements() {
        const event = this.currentEvent;
        if (event.requirements.length === 0) {
            this.showToast('No specific requirements for this event', 'info');
            return;
        }
        
        const requirementsText = event.requirements.join('\n• ');
        alert(`Event Requirements:\n\n• ${requirementsText}`);
    }

    contactOrganizer() {
        const event = this.currentEvent;
        const subject = encodeURIComponent(`Question about ${event.name}`);
        const body = encodeURIComponent(`Hi,\n\nI have a question about the upcoming event "${event.name}".\n\nThank you!`);
        window.open(`mailto:${event.organizerEmail}?subject=${subject}&body=${body}`);
        this.showToast('Email client opened! 📧', 'success');
    }

    manageWaitlist() {
        this.showToast('Waitlist management coming soon! ⚙️', 'info');
    }

    findSimilarEvents() {
        this.showToast('Finding similar events... 🔍', 'info');
    }

    closeModal() {
        const modal = document.getElementById('joinEventModal');
        if (modal) {
            modal.remove();
        }
    }

    showToast(message, type = 'info') {
        if (this.app && this.app.showToast) {
            this.app.showToast(message, type);
        } else if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize and export
window.JoinEventSystem = JoinEventSystem;
