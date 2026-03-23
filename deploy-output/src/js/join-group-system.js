/**
 * ConnectHub Join Group System
 * Implements comprehensive join group functionality according to specification
 */

class JoinGroupSystem {
    constructor(app) {
        this.app = app;
        this.joinedGroups = new Set();
        this.pendingRequests = new Set();
        this.groupData = new Map();
        
        // Initialize sample group data
        this.initializeSampleData();
    }

    /**
     * Initialize sample group data with different privacy levels
     */
    initializeSampleData() {
        const sampleGroups = [
            {
                id: 'tech-enthusiasts',
                name: 'Tech Enthusiasts',
                description: 'Discuss latest tech trends and innovations',
                members: 1234,
                isPrivate: false,
                category: 'Technology',
                location: 'Online',
                rules: ['Be respectful', 'No spam', 'Share knowledge'],
                admins: ['Sarah Johnson', 'Mike Chen'],
                features: {
                    chat: true,
                    events: true,
                    files: true,
                    discussions: true
                }
            },
            {
                id: 'photography-club',
                name: 'Photography Club',
                description: 'Share your best shots and photography tips',
                members: 567,
                isPrivate: true,
                category: 'Hobbies',
                location: 'New York, NY',
                rules: ['Original photos only', 'Provide camera details', 'Give constructive feedback'],
                admins: ['Emma Wilson', 'Alex Rodriguez'],
                features: {
                    chat: true,
                    events: true,
                    files: true,
                    discussions: true,
                    gallery: true
                }
            },
            {
                id: 'book-lovers',
                name: 'Book Lovers',
                description: 'Discover new books and share reading experiences',
                members: 890,
                isPrivate: false,
                category: 'Literature',
                location: 'Online',
                rules: ['Respectful discussion', 'No spoilers without warnings', 'Constructive book reviews only'],
                admins: ['Lisa Martinez', 'Robert Chen'],
                features: {
                    chat: true,
                    events: true,
                    files: true,
                    discussions: true,
                    library: true,
                    reviews: true
                }
            },
            {
                id: 'startup-community',
                name: 'Startup Community',
                description: 'Connect with entrepreneurs and startup founders',
                members: 445,
                isPrivate: true,
                category: 'Business',
                location: 'San Francisco, CA',
                rules: ['Verified entrepreneurs only', 'No direct solicitation', 'Share experiences'],
                admins: ['David Kim', 'Lisa Thompson'],
                features: {
                    chat: true,
                    events: true,
                    files: true,
                    discussions: true,
                    networking: true,
                    mentorship: true
                }
            },
            {
                id: 'music-producers',
                name: 'Music Producers',
                description: 'Collaborate and share music production techniques',
                members: 322,
                isPrivate: true,
                category: 'Music',
                location: 'Los Angeles, CA',
                rules: ['Original content only', 'Constructive feedback', 'Credit collaborators'],
                admins: ['DJ Alex', 'Producer Sam', 'Music Mike'],
                features: {
                    chat: true,
                    events: true,
                    files: true,
                    discussions: true,
                    studio: true,
                    collaboration: true
                }
            },
            {
                id: 'travel-adventurers',
                name: 'Travel Adventurers',
                description: 'Share travel stories and destination recommendations',
                members: 756,
                isPrivate: false,
                category: 'Travel',
                location: 'Worldwide',
                rules: ['Share honest experiences', 'Respect local cultures', 'Help fellow travelers'],
                admins: ['World Explorer', 'Travel Guide'],
                features: {
                    chat: true,
                    events: true,
                    files: true,
                    discussions: true,
                    maps: true,
                    recommendations: true
                }
            }
        ];

        sampleGroups.forEach(group => {
            this.groupData.set(group.id, group);
        });
    }

    /**
     * Main join group handler - determines flow based on group type
     */
    handleJoinGroup(groupName) {
        // Find group data by name
        const group = this.findGroupByName(groupName);
        if (!group) {
            this.showToast('Group not found', 'error');
            return;
        }

        // Check if already joined
        if (this.joinedGroups.has(group.id)) {
            this.showGroupDashboard(group);
            return;
        }

        // Check if request is pending
        if (this.pendingRequests.has(group.id)) {
            this.showToast('Request already sent and pending approval', 'info');
            return;
        }

        // Handle based on group privacy
        if (group.isPrivate) {
            this.showJoinRequestModal(group);
        } else {
            this.joinPublicGroup(group);
        }
    }

    /**
     * Find group data by name
     */
    findGroupByName(name) {
        for (const [id, group] of this.groupData.entries()) {
            if (group.name === name) {
                return group;
            }
        }
        return null;
    }

    /**
     * Handle joining a public group immediately
     */
    joinPublicGroup(group) {
        this.showLoadingState(group.id, 'Joining...');
        
        // Simulate network delay
        setTimeout(() => {
            this.joinedGroups.add(group.id);
            this.showSuccessState(group.id, 'Joined ✓');
            this.showToast(`Successfully joined ${group.name}!`, 'success');
            
            // Show welcome notification
            setTimeout(() => {
                this.showWelcomeNotification(group);
            }, 1000);

            // Update button to show joined state
            this.updateJoinButton(group.id, 'joined');

        }, 1500);
    }

    /**
     * Show join request modal for private groups
     */
    showJoinRequestModal(group) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'joinGroupModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="margin: 0; display: flex; align-items: center; gap: 0.75rem;">
                        <i class="fas fa-user-plus" style="color: var(--primary);"></i>
                        Join ${group.name}
                    </h2>
                    <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-secondary); padding: 0.5rem;" aria-label="Close">×</button>
                </div>

                <!-- Group Preview -->
                <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="width: 60px; height: 60px; border-radius: 12px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white;">
                            👥
                        </div>
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 0.5rem 0;">${group.name}</h3>
                            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">${group.description}</div>
                            <div style="display: flex; align-items: center; gap: 1rem; color: var(--text-muted); font-size: 0.8rem;">
                                <span><i class="fas fa-users"></i> ${group.members.toLocaleString()} members</span>
                                <span><i class="fas fa-map-marker-alt"></i> ${group.location}</span>
                                <span><i class="fas fa-tag"></i> ${group.category}</span>
                                <span style="color: var(--warning);"><i class="fas fa-lock"></i> Private</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Join Request Form -->
                <div style="margin-bottom: 2rem;">
                    <label style="display: block; margin-bottom: 1rem; font-weight: 600; color: var(--text-primary);">
                        <i class="fas fa-comment-dots"></i> Why would you like to join this group? *
                    </label>
                    <textarea 
                        id="joinReason" 
                        placeholder="Please tell the group admins why you'd like to join. Be specific about your interests, experience, or what you hope to contribute..."
                        style="width: 100%; min-height: 120px; padding: 1rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass); color: var(--text-primary); font-family: inherit; resize: vertical; line-height: 1.5;"
                        required
                    ></textarea>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-muted);">
                        <span>Be genuine and specific to increase approval chances</span>
                        <span id="charCount">0/500</span>
                    </div>
                </div>

                <!-- Group Rules -->
                <div style="background: var(--info-bg); border: 1px solid var(--info-border); border-radius: 8px; padding: 1rem; margin-bottom: 2rem;">
                    <h4 style="margin: 0 0 1rem 0; color: var(--info); display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-gavel"></i>
                        Group Rules & Guidelines
                    </h4>
                    <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary);">
                        ${group.rules.map(rule => `<li style="margin-bottom: 0.5rem;">${rule}</li>`).join('')}
                    </ul>
                </div>

                <!-- Agreement Checkbox -->
                <div style="margin-bottom: 2rem;">
                    <label style="display: flex; align-items: start; gap: 0.75rem; cursor: pointer;">
                        <input 
                            type="checkbox" 
                            id="agreeRules" 
                            style="margin: 0; width: 16px; height: 16px; accent-color: var(--primary);"
                            required
                        >
                        <div style="flex: 1; line-height: 1.4; color: var(--text-secondary);">
                            I agree to follow the group rules and guidelines, and understand that my membership may be revoked if I violate these terms.
                        </div>
                    </label>
                </div>

                <!-- Expected Response Time -->
                <div style="background: var(--glass); border-radius: 8px; padding: 1rem; margin-bottom: 2rem; text-align: center;">
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">
                        <i class="fas fa-clock"></i> 
                        Expected response time: <strong>1-3 business days</strong>
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.25rem;">
                        You'll be notified via email when your request is reviewed
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button 
                        class="btn btn-secondary" 
                        onclick="this.closest('.modal').remove()"
                    >
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button 
                        class="btn btn-primary" 
                        onclick="window.joinGroupSystem.submitJoinRequest('${group.id}')"
                        id="submitRequestBtn"
                    >
                        <i class="fas fa-paper-plane"></i> Send Request
                    </button>
                </div>
            </div>
        `;

        // Add character counter functionality
        const textarea = modal.querySelector('#joinReason');
        const charCount = modal.querySelector('#charCount');
        
        textarea.addEventListener('input', () => {
            const length = textarea.value.length;
            charCount.textContent = `${length}/500`;
            
            if (length > 500) {
                charCount.style.color = 'var(--error)';
                textarea.style.borderColor = 'var(--error)';
            } else if (length > 400) {
                charCount.style.color = 'var(--warning)';
                textarea.style.borderColor = 'var(--glass-border)';
            } else {
                charCount.style.color = 'var(--text-muted)';
                textarea.style.borderColor = 'var(--glass-border)';
            }
        });

        document.body.appendChild(modal);
    }

    /**
     * Submit join request for private group
     */
    submitJoinRequest(groupId) {
        const modal = document.getElementById('joinGroupModal');
        const reason = modal.querySelector('#joinReason').value.trim();
        const agreeRules = modal.querySelector('#agreeRules').checked;
        const submitBtn = modal.querySelector('#submitRequestBtn');

        // Validation
        if (!reason) {
            this.showToast('Please provide a reason for joining', 'warning');
            modal.querySelector('#joinReason').focus();
            return;
        }

        if (reason.length < 20) {
            this.showToast('Please provide a more detailed reason (at least 20 characters)', 'warning');
            modal.querySelector('#joinReason').focus();
            return;
        }

        if (!agreeRules) {
            this.showToast('You must agree to follow the group rules', 'warning');
            modal.querySelector('#agreeRules').focus();
            return;
        }

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Request...';
        submitBtn.disabled = true;

        // Simulate request submission
        setTimeout(() => {
            this.pendingRequests.add(groupId);
            const group = this.groupData.get(groupId);
            
            this.showToast(`Request sent to ${group.name} admins!`, 'success');
            modal.remove();
            
            // Update button to show pending state
            this.updateJoinButton(groupId, 'pending');
            
            // Show pending confirmation
            this.showPendingConfirmation(group, reason);
            
        }, 2000);
    }

    /**
     * Show pending confirmation modal
     */
    showPendingConfirmation(group, reason) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; text-align: center;">
                <div style="margin-bottom: 2rem;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--warning); margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white;">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h2>Request Sent!</h2>
                    <p style="color: var(--text-secondary); line-height: 1.6;">
                        Your join request has been sent to the <strong>${group.name}</strong> admins for review.
                    </p>
                </div>

                <div style="background: var(--glass); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; text-align: left;">
                    <h4 style="margin: 0 0 0.5rem 0;">Your Message:</h4>
                    <p style="color: var(--text-secondary); font-style: italic; margin: 0;">"${reason.substring(0, 100)}${reason.length > 100 ? '...' : ''}"</p>
                </div>

                <div style="background: var(--info-bg); border: 1px solid var(--info-border); border-radius: 8px; padding: 1rem; margin-bottom: 2rem;">
                    <h4 style="margin: 0 0 0.5rem 0; color: var(--info);">What happens next?</h4>
                    <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary); text-align: left;">
                        <li>Group admins will review your request</li>
                        <li>You'll receive an email notification with their decision</li>
                        <li>Expected response time: 1-3 business days</li>
                        <li>You can check your request status anytime</li>
                    </ul>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-check"></i> Got it
                    </button>
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove(); window.joinGroupSystem.showGroupRequests()">
                        <i class="fas fa-list"></i> View My Requests
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Show group dashboard after successful join
     */
    showGroupDashboard(group) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1000px; max-height: 90vh; overflow-y: auto;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding: 1.5rem; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 12px; color: white;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 60px; height: 60px; border-radius: 12px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                            👥
                        </div>
                        <div>
                            <h2 style="margin: 0 0 0.5rem 0;">${group.name}</h2>
                            <div style="opacity: 0.9; font-size: 0.9rem;">${group.description}</div>
                            <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem; font-size: 0.8rem; opacity: 0.8;">
                                <span><i class="fas fa-users"></i> ${group.members.toLocaleString()} members</span>
                                <span><i class="fas fa-map-marker-alt"></i> ${group.location}</span>
                                <span><i class="fas fa-tag"></i> ${group.category}</span>
                            </div>
                        </div>
                    </div>
                    <button onclick="this.closest('.modal').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0.5rem; border-radius: 50%; width: 40px; height: 40px;">×</button>
                </div>

                <!-- Dashboard Content -->
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; height: 600px;">
                    <!-- Main Content Area -->
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <!-- Quick Actions -->
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
                            <button class="btn btn-primary btn-small" onclick="window.joinGroupSystem.openGroupChat('${group.id}')" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem;">
                                <i class="fas fa-comments" style="font-size: 1.5rem;"></i>
                                <span style="font-size: 0.9rem;">Group Chat</span>
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="window.joinGroupSystem.openGroupEvents('${group.id}')" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem;">
                                <i class="fas fa-calendar" style="font-size: 1.5rem;"></i>
                                <span style="font-size: 0.9rem;">Events</span>
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="window.joinGroupSystem.openGroupFiles('${group.id}')" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem;">
                                <i class="fas fa-folder" style="font-size: 1.5rem;"></i>
                                <span style="font-size: 0.9rem;">Files</span>
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="window.joinGroupSystem.openGroupMembers('${group.id}')" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem;">
                                <i class="fas fa-users" style="font-size: 1.5rem;"></i>
                                <span style="font-size: 0.9rem;">Members</span>
                            </button>
                        </div>

                        <!-- Recent Activity -->
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; flex: 1; overflow: hidden;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                <h3><i class="fas fa-stream"></i> Recent Activity</h3>
                                <button class="btn btn-small btn-secondary" onclick="window.joinGroupSystem.viewAllActivity('${group.id}')">View All</button>
                            </div>
                            <div style="height: 300px; overflow-y: auto;">
                                ${this.generateRecentActivity().map(activity => `
                                    <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--glass-border); transition: background 0.2s ease;" onmouseover="this.style.background='var(--glass-hover)'" onmouseout="this.style.background='transparent'">
                                        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: white;">
                                            ${activity.avatar}
                                        </div>
                                        <div style="flex: 1;">
                                            <div style="font-weight: 600; margin-bottom: 0.25rem;">${activity.user}</div>
                                            <div style="color: var(--text-secondary); font-size: 0.9rem;">${activity.action}</div>
                                            <div style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.25rem;">${activity.time}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <!-- Group Stats -->
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <h4><i class="fas fa-chart-bar"></i> Group Stats</h4>
                            <div style="display: grid; gap: 1rem; margin-top: 1rem;">
                                <div style="text-align: center; padding: 1rem; border: 1px solid var(--glass-border); border-radius: 8px;">
                                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${group.members}</div>
                                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Total Members</div>
                                </div>
                                <div style="text-align: center; padding: 1rem; border: 1px solid var(--glass-border); border-radius: 8px;">
                                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--success);">${Math.floor(group.members * 0.15)}</div>
                                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Active Today</div>
                                </div>
                            </div>
                        </div>

                        <!-- Group Features -->
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <h4><i class="fas fa-star"></i> Available Features</h4>
                            <div style="display: grid; gap: 0.5rem; margin-top: 1rem;">
                                ${Object.entries(group.features).map(([feature, enabled]) => {
                                    if (!enabled) return '';
                                    const icons = {
                                        chat: 'fas fa-comments',
                                        events: 'fas fa-calendar',
                                        files: 'fas fa-folder',
                                        discussions: 'fas fa-comment-dots',
                                        gallery: 'fas fa-images',
                                        networking: 'fas fa-handshake',
                                        mentorship: 'fas fa-user-tie'
                                    };
                                    return `
                                        <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: var(--success-light); color: var(--success); border-radius: 6px; font-size: 0.9rem;">
                                            <i class="${icons[feature] || 'fas fa-check'}"></i>
                                            <span>${feature.charAt(0).toUpperCase() + feature.slice(1)}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <!-- Group Admins -->
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <h4><i class="fas fa-shield-alt"></i> Group Admins</h4>
                            <div style="display: grid; gap: 0.75rem; margin-top: 1rem;">
                                ${group.admins.map(admin => `
                                    <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; cursor: pointer; border-radius: 6px; transition: background 0.2s ease;" onmouseover="this.style.background='var(--glass-hover)'" onmouseout="this.style.background='transparent'">
                                        <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.8rem;">
                                            ${admin.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div style="flex: 1;">
                                            <div style="font-weight: 600; font-size: 0.9rem;">${admin}</div>
                                            <div style="color: var(--text-muted); font-size: 0.8rem;">Admin</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Leave Group -->
                        <div style="padding: 1rem; text-align: center;">
                            <button class="btn btn-error btn-small" onclick="window.joinGroupSystem.confirmLeaveGroup('${group.id}')" style="width: 100%;">
                                <i class="fas fa-sign-out-alt"></i> Leave Group
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Generate sample recent activity data
     */
    generateRecentActivity() {
        return [
            { user: 'Sarah Johnson', action: 'shared a new article about React 18', time: '2 minutes ago', avatar: '👩' },
            { user: 'Mike Chen', action: 'started a discussion about best practices', time: '15 minutes ago', avatar: '👨' },
            { user: 'Emily Davis', action: 'uploaded presentation slides', time: '1 hour ago', avatar: '👩' },
            { user: 'Alex Rodriguez', action: 'created event "Monthly Meetup"', time: '2 hours ago', avatar: '👨' },
            { user: 'Jessica Wang', action: 'commented on the weekly standup notes', time: '3 hours ago', avatar: '👩' }
        ];
    }

    /**
     * Utility methods for UI state management
     */
    showToast(message, type = 'info') {
        if (this.app && this.app.showToast) {
            this.app.showToast(message, type);
        } else if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    showLoadingState(groupId, text) {
        const buttons = document.querySelectorAll(`[onclick*="joinGroup('${this.getGroupNameById(groupId)}')"]`);
        buttons.forEach(btn => {
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
            btn.disabled = true;
        });
    }

    showSuccessState(groupId, text) {
        const buttons = document.querySelectorAll(`[onclick*="joinGroup('${this.getGroupNameById(groupId)}')"]`);
        buttons.forEach(btn => {
            btn.innerHTML = `<i class="fas fa-check"></i> ${text}`;
            btn.className = 'btn btn-success';
            btn.disabled = false;
        });
    }

    updateJoinButton(groupId, state) {
        const groupName = this.getGroupNameById(groupId);
        const buttons = document.querySelectorAll(`[onclick*="joinGroup('${groupName}')"]`);
        
        buttons.forEach(btn => {
            switch(state) {
                case 'joined':
                    btn.innerHTML = '<i class="fas fa-check"></i> Joined ✓';
                    btn.className = 'btn btn-success';
                    btn.onclick = () => this.showGroupDashboard(this.groupData.get(groupId));
                    break;
                case 'pending':
                    btn.innerHTML = '<i class="fas fa-clock"></i> Request Sent';
                    btn.className = 'btn btn-warning';
                    btn.disabled = true;
                    break;
                default:
                    btn.innerHTML = '<i class="fas fa-plus"></i> Join Group';
                    btn.className = 'btn btn-primary';
                    btn.disabled = false;
            }
        });
    }

    getGroupNameById(groupId) {
        const group = this.groupData.get(groupId);
        return group ? group.name : '';
    }

    showWelcomeNotification(group) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; text-align: center;">
                <div style="margin-bottom: 2rem;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--success); margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white;">
                        <i class="fas fa-check"></i>
                    </div>
                    <h2>Welcome to ${group.name}!</h2>
                    <p style="color: var(--text-secondary); line-height: 1.6;">
                        You've successfully joined the group. Here's what you can do now:
                    </p>
                </div>

                <div style="display: grid; gap: 1rem; margin-bottom: 2rem; text-align: left;">
                    <div style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: var(--glass); border-radius: 8px;">
                        <i class="fas fa-comments" style="color: var(--primary); font-size: 1.2rem;"></i>
                        <div>
                            <div style="font-weight: 600;">Join Group Chat</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Connect with ${group.members.toLocaleString()} members</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: var(--glass); border-radius: 8px;">
                        <i class="fas fa-calendar" style="color: var(--primary); font-size: 1.2rem;"></i>
                        <div>
                            <div style="font-weight: 600;">Attend Events</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Join upcoming group activities</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: var(--glass); border-radius: 8px;">
                        <i class="fas fa-share" style="color: var(--primary); font-size: 1.2rem;"></i>
                        <div>
                            <div style="font-weight: 600;">Share Content</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Post discussions and share files</div>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i> Close
                    </button>
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove(); window.joinGroupSystem.showGroupDashboard(window.joinGroupSystem.groupData.get('${group.id}'))">
                        <i class="fas fa-tachometer-alt"></i> Open Dashboard
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Group dashboard action handlers
    openGroupChat(groupId) {
        const group = this.groupData.get(groupId);
        if (window.groupsUIComponents && window.groupsUIComponents.showGroupChatInterface) {
            window.groupsUIComponents.showGroupChatInterface();
        } else {
            this.showToast(`Opening ${group.name} chat...`, 'info');
        }
    }

    openGroupEvents(groupId) {
        const group = this.groupData.get(groupId);
        if (window.groupsUIComponents && window.groupsUIComponents.showGroupEventCreator) {
            window.groupsUIComponents.showGroupEventCreator();
        } else {
            this.showToast(`Opening ${group.name} events...`, 'info');
        }
    }

    openGroupFiles(groupId) {
        const group = this.groupData.get(groupId);
        if (window.groupsUIComponents && window.groupsUIComponents.showGroupFileManager) {
            window.groupsUIComponents.showGroupFileManager();
        } else {
            this.showToast(`Opening ${group.name} files...`, 'info');
        }
    }

    openGroupMembers(groupId) {
        const group = this.groupData.get(groupId);
        if (window.groupsUIComponents && window.groupsUIComponents.showGroupMemberManagement) {
            window.groupsUIComponents.showGroupMemberManagement();
        } else {
            this.showToast(`Opening ${group.name} members...`, 'info');
        }
    }

    viewAllActivity(groupId) {
        const group = this.groupData.get(groupId);
        this.showToast(`Viewing all activity for ${group.name}...`, 'info');
    }

    confirmLeaveGroup(groupId) {
        const group = this.groupData.get(groupId);
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div style="margin-bottom: 2rem;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--error); margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white;">
                        <i class="fas fa-sign-out-alt"></i>
                    </div>
                    <h2>Leave Group?</h2>
                    <p style="color: var(--text-secondary); line-height: 1.6;">
                        Are you sure you want to leave <strong>${group.name}</strong>? You'll need to request to join again if it's a private group.
                    </p>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button class="btn btn-error" onclick="window.joinGroupSystem.leaveGroup('${groupId}'); this.closest('.modal').remove();">
                        <i class="fas fa-sign-out-alt"></i> Leave Group
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    leaveGroup(groupId) {
        this.joinedGroups.delete(groupId);
        this.pendingRequests.delete(groupId);
        const group = this.groupData.get(groupId);
        
        // Update button state
        this.updateJoinButton(groupId, 'default');
        
        // Close any open dashboards
        document.querySelectorAll('.modal.active').forEach(modal => modal.remove());
        
        this.showToast(`Left ${group.name}`, 'info');
    }

    showGroupRequests() {
        const pendingGroups = Array.from(this.pendingRequests).map(id => this.groupData.get(id));
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-clock"></i> My Group Requests</h2>
                    <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-secondary);">×</button>
                </div>

                ${pendingGroups.length === 0 ? `
                    <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                        <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <h3>No Pending Requests</h3>
                        <p>You don't have any pending group requests at the moment.</p>
                    </div>
                ` : `
                    <div style="display: grid; gap: 1rem;">
                        ${pendingGroups.map(group => `
                            <div style="padding: 1.5rem; background: var(--glass); border-radius: 12px; border-left: 4px solid var(--warning);">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                                    <div>
                                        <h4 style="margin: 0 0 0.5rem 0;">${group.name}</h4>
                                        <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">${group.description}</p>
                                    </div>
                                    <span style="background: var(--warning); color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem; white-space: nowrap;">Pending</span>
                                </div>
                                <div style="color: var(--text-muted); font-size: 0.8rem;">
                                    <i class="fas fa-clock"></i> Request sent • Awaiting admin approval
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}

                <div style="margin-top: 2rem; text-align: center;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-check"></i> Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }
}

// Initialize global join group system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.joinGroupSystem = new JoinGroupSystem({ showToast: window.showToast });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JoinGroupSystem;
}
