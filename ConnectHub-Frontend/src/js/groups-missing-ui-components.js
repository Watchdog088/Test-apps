/**
 * ConnectHub Groups Missing UI Components
 * Implements the 7 missing Groups Screen interfaces from the audit
 */

class GroupsMissingUIComponents {
    constructor(app) {
        this.app = app;
        this.groupData = {
            groups: new Map(),
            memberRequests: [],
            groupEvents: [],
            groupFiles: new Map()
        };
        
        this.initializeMissingComponents();
    }

    /**
     * Initialize all 7 missing Groups UI components
     */
    initializeMissingComponents() {
        console.log('Initializing 7 Missing Groups UI Components');
    }

    /**
     * 1. GROUP CREATION WIZARD INTERFACE
     */
    showGroupCreationWizard() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-users-cog"></i> Create New Group</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="group-creation-wizard">
                    <!-- Step Progress Indicator -->
                    <div class="wizard-progress" style="display: flex; justify-content: center; margin-bottom: 3rem;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div class="step active" style="display: flex; align-items: center; gap: 0.5rem;">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600;">1</div>
                                <span>Basic Info</span>
                            </div>
                            <div style="width: 50px; height: 2px; background: var(--glass-border);"></div>
                            <div class="step" style="display: flex; align-items: center; gap: 0.5rem;">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--glass-border); color: var(--text-muted); display: flex; align-items: center; justify-content: center; font-weight: 600;">2</div>
                                <span>Settings</span>
                            </div>
                            <div style="width: 50px; height: 2px; background: var(--glass-border);"></div>
                            <div class="step" style="display: flex; align-items: center; gap: 0.5rem;">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--glass-border); color: var(--text-muted); display: flex; align-items: center; justify-content: center; font-weight: 600;">3</div>
                                <span>Review</span>
                            </div>
                        </div>
                    </div>

                    <!-- Step 1: Basic Information -->
                    <div id="step-1" class="wizard-step active">
                        <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                            <h3><i class="fas fa-info-circle"></i> Group Basic Information</h3>
                            
                            <!-- Group Cover Photo -->
                            <div style="margin-bottom: 2rem;">
                                <label style="display: block; margin-bottom: 1rem; font-weight: 600;">Group Cover Photo</label>
                                <div style="position: relative; width: 100%; height: 200px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden;" onclick="this.uploadGroupCover()">
                                    <div style="text-align: center; color: white;">
                                        <i class="fas fa-camera" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                                        <div>Click to upload cover photo</div>
                                        <div style="font-size: 0.8rem; opacity: 0.8;">Recommended: 1200x300 pixels</div>
                                    </div>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Group Name *</label>
                                    <input type="text" id="group-name" placeholder="Enter group name..." style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass); margin-bottom: 1rem;">
                                    
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Group Category *</label>
                                    <select id="group-category" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass); margin-bottom: 1rem;">
                                        <option value="">Select category...</option>
                                        <option value="technology">Technology & Programming</option>
                                        <option value="business">Business & Networking</option>
                                        <option value="hobbies">Hobbies & Interests</option>
                                        <option value="fitness">Health & Fitness</option>
                                        <option value="education">Education & Learning</option>
                                        <option value="social">Social & Community</option>
                                        <option value="arts">Arts & Creative</option>
                                        <option value="travel">Travel & Adventure</option>
                                        <option value="sports">Sports & Recreation</option>
                                        <option value="other">Other</option>
                                    </select>

                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Location</label>
                                    <input type="text" id="group-location" placeholder="City, State or Online" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                                </div>

                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Group Description *</label>
                                    <textarea id="group-description" placeholder="Describe what your group is about, what activities you'll do, and what kind of members you're looking for..." style="width: 100%; height: 120px; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass); resize: vertical; margin-bottom: 1rem;"></textarea>
                                    
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Tags (comma-separated)</label>
                                    <input type="text" id="group-tags" placeholder="javascript, coding, meetup, networking" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Help people find your group with relevant tags</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Step 2: Group Settings -->
                    <div id="step-2" class="wizard-step" style="display: none;">
                        <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                            <h3><i class="fas fa-cogs"></i> Group Settings & Permissions</h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                                <div>
                                    <div style="margin-bottom: 2rem;">
                                        <h4>Privacy Settings</h4>
                                        <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; cursor: pointer;">
                                            <input type="radio" name="privacy" value="public" checked>
                                            <div>
                                                <div style="font-weight: 600;">Public Group</div>
                                                <div style="font-size: 0.8rem; color: var(--text-muted);">Anyone can find and join this group</div>
                                            </div>
                                        </label>
                                        <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; cursor: pointer;">
                                            <input type="radio" name="privacy" value="private">
                                            <div>
                                                <div style="font-weight: 600;">Private Group</div>
                                                <div style="font-size: 0.8rem; color: var(--text-muted);">People need approval to join</div>
                                            </div>
                                        </label>
                                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                            <input type="radio" name="privacy" value="secret">
                                            <div>
                                                <div style="font-weight: 600;">Secret Group</div>
                                                <div style="font-size: 0.8rem; color: var(--text-muted);">Only members can see the group</div>
                                            </div>
                                        </label>
                                    </div>

                                    <div style="margin-bottom: 2rem;">
                                        <h4>Member Permissions</h4>
                                        <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                            <input type="checkbox" checked>
                                            <span>Members can post content</span>
                                        </label>
                                        <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                            <input type="checkbox" checked>
                                            <span>Members can create events</span>
                                        </label>
                                        <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                            <input type="checkbox">
                                            <span>Members can invite others</span>
                                        </label>
                                        <label style="display: flex; align-items: center; gap: 0.5rem;">
                                            <input type="checkbox">
                                            <span>Members can upload files</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <div style="margin-bottom: 2rem;">
                                        <h4>Group Rules</h4>
                                        <div id="rules-list">
                                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                                <input type="text" placeholder="Enter a group rule..." style="flex: 1; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);">
                                                <button style="background: var(--error); color: white; border: none; padding: 0.5rem; border-radius: 6px; cursor: pointer;" onclick="this.removeRule(this)">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <button class="btn btn-secondary btn-small" onclick="this.addRule()" style="margin-top: 0.5rem;">
                                            <i class="fas fa-plus"></i> Add Rule
                                        </button>
                                    </div>

                                    <div>
                                        <h4>Moderation Settings</h4>
                                        <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                            <input type="checkbox">
                                            <span>Require post approval</span>
                                        </label>
                                        <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                            <input type="checkbox">
                                            <span>Auto-moderate inappropriate content</span>
                                        </label>
                                        <label style="display: flex; align-items: center; gap: 0.5rem;">
                                            <input type="checkbox" checked>
                                            <span>Allow member reporting</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Step 3: Review & Create -->
                    <div id="step-3" class="wizard-step" style="display: none;">
                        <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                            <h3><i class="fas fa-check-circle"></i> Review Group Details</h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
                                <div>
                                    <h4>Basic Information</h4>
                                    <div style="background: var(--bg-card); border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem;">
                                        <div style="margin-bottom: 0.5rem;"><strong>Name:</strong> <span id="review-name">-</span></div>
                                        <div style="margin-bottom: 0.5rem;"><strong>Category:</strong> <span id="review-category">-</span></div>
                                        <div style="margin-bottom: 0.5rem;"><strong>Location:</strong> <span id="review-location">-</span></div>
                                        <div><strong>Description:</strong> <div id="review-description" style="margin-top: 0.25rem; color: var(--text-secondary);">-</div></div>
                                    </div>
                                </div>

                                <div>
                                    <h4>Settings Summary</h4>
                                    <div style="background: var(--bg-card); border-radius: 8px; padding: 1.5rem;">
                                        <div style="margin-bottom: 0.5rem;"><strong>Privacy:</strong> <span id="review-privacy">-</span></div>
                                        <div style="margin-bottom: 0.5rem;"><strong>Member Permissions:</strong></div>
                                        <div id="review-permissions" style="margin-left: 1rem; color: var(--text-secondary);">-</div>
                                    </div>
                                </div>
                            </div>

                            <div style="background: var(--info-bg); border: 1px solid var(--info-border); border-radius: 8px; padding: 1rem; margin-top: 2rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <i class="fas fa-info-circle" style="color: var(--info);"></i>
                                    <strong>Next Steps After Creation</strong>
                                </div>
                                <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary);">
                                    <li>Invite your first members to get the conversation started</li>
                                    <li>Create your first post to set the tone for your group</li>
                                    <li>Set up group events and activities</li>
                                    <li>Configure additional settings as your group grows</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Navigation Buttons -->
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <button id="prev-btn" class="btn btn-secondary" onclick="this.previousStep()" style="display: none;">
                            <i class="fas fa-arrow-left"></i> Previous
                        </button>
                        <div style="flex: 1;"></div>
                        <button id="next-btn" class="btn btn-primary" onclick="this.nextStep()">
                            Next <i class="fas fa-arrow-right"></i>
                        </button>
                        <button id="create-btn" class="btn btn-primary" onclick="this.createGroup()" style="display: none;">
                            <i class="fas fa-plus-circle"></i> Create Group
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add wizard functionality
        let currentStep = 1;

        modal.nextStep = () => {
            if (currentStep < 3) {
                // Hide current step
                modal.querySelector(`#step-${currentStep}`).style.display = 'none';
                modal.querySelector('.step').classList.remove('active');
                
                currentStep++;
                
                // Show next step
                modal.querySelector(`#step-${currentStep}`).style.display = 'block';
                modal.querySelectorAll('.step')[currentStep - 1].classList.add('active');
                
                // Update step styling
                modal.querySelectorAll('.step')[currentStep - 1].querySelector('div').style.background = 'var(--primary)';
                modal.querySelectorAll('.step')[currentStep - 1].querySelector('div').style.color = 'white';
                
                // Update buttons
                modal.querySelector('#prev-btn').style.display = 'inline-flex';
                
                if (currentStep === 3) {
                    modal.querySelector('#next-btn').style.display = 'none';
                    modal.querySelector('#create-btn').style.display = 'inline-flex';
                    this.populateReview();
                }
            }
        };

        modal.previousStep = () => {
            if (currentStep > 1) {
                // Hide current step
                modal.querySelector(`#step-${currentStep}`).style.display = 'none';
                
                // Update step styling
                modal.querySelectorAll('.step')[currentStep - 1].querySelector('div').style.background = 'var(--glass-border)';
                modal.querySelectorAll('.step')[currentStep - 1].querySelector('div').style.color = 'var(--text-muted)';
                modal.querySelectorAll('.step')[currentStep - 1].classList.remove('active');
                
                currentStep--;
                
                // Show previous step
                modal.querySelector(`#step-${currentStep}`).style.display = 'block';
                modal.querySelectorAll('.step')[currentStep - 1].classList.add('active');
                
                // Update buttons
                if (currentStep === 1) {
                    modal.querySelector('#prev-btn').style.display = 'none';
                }
                
                modal.querySelector('#next-btn').style.display = 'inline-flex';
                modal.querySelector('#create-btn').style.display = 'none';
            }
        };

        modal.populateReview = () => {
            const name = modal.querySelector('#group-name').value || 'Not specified';
            const category = modal.querySelector('#group-category').value || 'Not specified';
            const location = modal.querySelector('#group-location').value || 'Not specified';
            const description = modal.querySelector('#group-description').value || 'Not specified';
            const privacy = modal.querySelector('input[name="privacy"]:checked').value || 'public';
            
            modal.querySelector('#review-name').textContent = name;
            modal.querySelector('#review-category').textContent = category;
            modal.querySelector('#review-location').textContent = location;
            modal.querySelector('#review-description').textContent = description;
            modal.querySelector('#review-privacy').textContent = privacy.charAt(0).toUpperCase() + privacy.slice(1);
            
            // Show permissions
            const permissions = [];
            modal.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                if (checkbox.nextElementSibling) {
                    permissions.push(checkbox.nextElementSibling.textContent);
                }
            });
            modal.querySelector('#review-permissions').textContent = permissions.length ? permissions.join(', ') : 'None selected';
        };

        modal.uploadGroupCover = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Cover photo upload opened', 'info');
            }
        };

        modal.addRule = () => {
            const rulesContainer = modal.querySelector('#rules-list');
            const newRule = document.createElement('div');
            newRule.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;';
            newRule.innerHTML = `
                <input type="text" placeholder="Enter a group rule..." style="flex: 1; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);">
                <button style="background: var(--error); color: white; border: none; padding: 0.5rem; border-radius: 6px; cursor: pointer;" onclick="this.removeRule(this)">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            rulesContainer.appendChild(newRule);
        };

        modal.removeRule = (button) => {
            button.closest('div').remove();
        };

        modal.createGroup = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Group created successfully!', 'success');
            }
            modal.remove();
        };

        document.body.appendChild(modal);
    }

    /**
     * 2. GROUP MANAGEMENT DASHBOARD INTERFACE
     */
    showGroupManagementDashboard() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content extra-large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-tachometer-alt"></i> Group Management Dashboard</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="group-dashboard-content">
                    <!-- Dashboard Summary Cards -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                        <div class="stat-card">
                            <div class="stat-number">1,247</div>
                            <div class="stat-label">Total Members</div>
                            <div style="color: var(--success); font-size: 0.8rem;">↑ +23 this week</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">89</div>
                            <div class="stat-label">Active Today</div>
                            <div style="color: var(--success); font-size: 0.8rem;">↑ +12%</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">156</div>
                            <div class="stat-label">Posts This Month</div>
                            <div style="color: var(--warning); font-size: 0.8rem;">↓ -3%</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">12</div>
                            <div class="stat-label">Pending Requests</div>
                            <div style="color: var(--error); font-size: 0.8rem;">Needs Review</div>
                        </div>
                    </div>

                    <!-- Main Dashboard Grid -->
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                        <!-- Left Column -->
                        <div>
                            <!-- Recent Activity -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                    <h4><i class="fas fa-chart-line"></i> Recent Activity</h4>
                                    <button class="btn btn-small btn-secondary" onclick="this.viewAllActivity()">View All</button>
                                </div>
                                <div style="height: 300px; overflow-y: auto;">
                                    ${[
                                        { type: 'member_join', user: 'Sarah Johnson', action: 'joined the group', time: '2 minutes ago', avatar: '👩' },
                                        { type: 'post_create', user: 'Mike Chen', action: 'created a new post about JavaScript frameworks', time: '15 minutes ago', avatar: '👨' },
                                        { type: 'event_create', user: 'Emily Davis', action: 'created event "Monthly Meetup"', time: '1 hour ago', avatar: '👩' },
                                        { type: 'member_join', user: 'Alex Rodriguez', action: 'joined the group', time: '2 hours ago', avatar: '👨' },
                                        { type: 'comment', user: 'Jessica Wang', action: 'commented on "Best practices for React"', time: '3 hours ago', avatar: '👩' },
                                        { type: 'file_upload', user: 'David Kim', action: 'uploaded a presentation file', time: '4 hours ago', avatar: '👨' },
                                        { type: 'post_create', user: 'Lisa Thompson', action: 'shared a tutorial link', time: '6 hours ago', avatar: '👩' }
                                    ].map(activity => `
                                        <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--glass-border); transition: background 0.2s ease;" onmouseover="this.style.background='var(--glass-hover)'" onmouseout="this.style.background='transparent'">
                                            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">${activity.avatar}</div>
                                            <div style="flex: 1;">
                                                <div style="font-weight: 600; margin-bottom: 0.25rem;">${activity.user}</div>
                                                <div style="color: var(--text-secondary); font-size: 0.9rem;">${activity.action}</div>
                                                <div style="color: var(--text-muted); font-size: 0.8rem;">${activity.time}</div>
                                            </div>
                                            <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem;">
                                                <i class="fas fa-chevron-right"></i>
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Member Growth Chart -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                                <h4><i class="fas fa-users"></i> Member Growth (Last 30 Days)</h4>
                                <div style="height: 200px; display: flex; align-items: end; justify-content: space-between; margin-top: 1rem; padding: 1rem 0;">
                                    ${Array.from({length: 30}, (_, i) => `
                                        <div style="width: 6px; height: ${Math.random() * 150 + 30}px; background: var(--primary); border-radius: 2px; margin: 0 1px;" title="Day ${i + 1}: +${Math.floor(Math.random() * 10) + 1} members"></div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Right Column -->
                        <div>
                            <!-- Quick Actions -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                                <h4><i class="fas fa-bolt"></i> Quick Actions</h4>
                                <div style="display: grid; gap: 0.75rem; margin-top: 1rem;">
                                    <button class="btn btn-primary btn-small" onclick="this.createAnnouncement()">
                                        <i class="fas fa-bullhorn"></i> Create Announcement
                                    </button>
                                    <button class="btn btn-secondary btn-small" onclick="this.inviteMembers()">
                                        <i class="fas fa-user-plus"></i> Invite Members
                                    </button>
                                    <button class="btn btn-secondary btn-small" onclick="this.scheduleEvent()">
                                        <i class="fas fa-calendar-plus"></i> Schedule Event
                                    </button>
                                    <button class="btn btn-secondary btn-small" onclick="this.manageRoles()">
                                        <i class="fas fa-user-cog"></i> Manage Roles
                                    </button>
                                    <button class="btn btn-secondary btn-small" onclick="this.viewReports()">
                                        <i class="fas fa-flag"></i> View Reports
                                    </button>
                                </div>
                            </div>

                            <!-- Member Requests -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                                <h4><i class="fas fa-user-clock"></i> Pending Member Requests</h4>
                                <div style="margin-top: 1rem;">
                                    ${[
                                        { name: 'Jennifer Martinez', joined: '2 days ago', mutualFriends: 8, reason: 'Interested in JavaScript development' },
                                        { name: 'Robert Chen', joined: '3 days ago', mutualFriends: 3, reason: 'Looking for networking opportunities' },
                                        { name: 'Maria Rodriguez', joined: '1 week ago', mutualFriends: 12, reason: 'Want to learn more about React' }
                                    ].map((request, index) => `
                                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border: 1px solid var(--glass-border); border-radius: 8px; margin-bottom: 0.75rem;">
                                            <div style="display: flex; align-items: center; gap: 1rem;">
                                                <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 1.2rem;">
                                                    ${request.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${request.name}</div>
                                                    <div style="color: var(--text-muted); font-size: 0.8rem;">${request.mutualFriends} mutual connections • Applied ${request.joined}</div>
                                                    <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem;">"${request.reason}"</div>
                                                </div>
                                            </div>
                                            <div style="display: flex; gap: 0.5rem;">
                                                <button class="btn btn-small btn-success" onclick="this.approveMember(${index})">
                                                    <i class="fas fa-check"></i> Approve
                                                </button>
                                                <button class="btn btn-small btn-secondary" onclick="this.rejectMember(${index})">
                                                    <i class="fas fa-times"></i> Decline
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Group Analytics -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                                <h4><i class="fas fa-chart-pie"></i> Group Analytics Summary</h4>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                                    <div style="text-align: center; padding: 1rem; border: 1px solid var(--glass-border); border-radius: 8px;">
                                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">87%</div>
                                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Engagement Rate</div>
                                    </div>
                                    <div style="text-align: center; padding: 1rem; border: 1px solid var(--glass-border); border-radius: 8px;">
                                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--success); margin-bottom: 0.5rem;">94%</div>
                                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Member Satisfaction</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.viewAllActivity = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Opening detailed activity view', 'info');
            }
        };

        modal.createAnnouncement = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Announcement creator opened', 'info');
            }
        };

        modal.inviteMembers = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Member invitation tool opened', 'info');
            }
        };

        modal.scheduleEvent = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Event scheduler opened', 'info');
            }
        };

        modal.manageRoles = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Role management opened', 'info');
            }
        };

        modal.viewReports = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Moderation reports opened', 'info');
            }
        };

        modal.approveMember = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Member request approved!', 'success');
            }
        };

        modal.rejectMember = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Member request declined', 'info');
            }
        };

        document.body.appendChild(modal);
    }

    /**
     * 3. GROUP CHAT INTERFACE
     */
    showGroupChatInterface() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content extra-large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <h2><i class="fas fa-comments"></i> Group Chat: JavaScript Developers</h2>
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--success);">
                            <i class="fas fa-circle" style="font-size: 0.8rem;"></i>
                            <span style="font-size: 0.9rem;">156 online</span>
                        </div>
                    </div>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 300px; gap: 1rem; height: 600px;">
                    <!-- Chat Area -->
                    <div style="display: flex; flex-direction: column; background: var(--glass); border-radius: 12px; overflow: hidden;">
                        <!-- Chat Header -->
                        <div style="padding: 1rem; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; gap: 1rem;">
                                <button class="btn btn-small btn-secondary" onclick="this.toggleThreads()">
                                    <i class="fas fa-layer-group"></i> Threads
                                </button>
                                <button class="btn btn-small btn-secondary" onclick="this.searchMessages()">
                                    <i class="fas fa-search"></i> Search
                                </button>
                                <button class="btn btn-small btn-secondary" onclick="this.showPinnedMessages()">
                                    <i class="fas fa-thumbtack"></i> Pinned
                                </button>
                            </div>
                            <button class="btn btn-small btn-secondary" onclick="this.openChatSettings()">
                                <i class="fas fa-cog"></i> Settings
                            </button>
                        </div>

                        <!-- Messages Area -->
                        <div id="messages-container" style="flex: 1; padding: 1rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem;">
                            ${[
                                { user: 'Sarah Johnson', time: '10:30 AM', avatar: '👩', message: 'Hey everyone! Just wanted to share this great article about React 18 features: https://react.dev/blog/2022/03/29/react-v18', reactions: ['👍', '❤️', '🔥'], reactionCount: 12 },
                                { user: 'Mike Chen', time: '10:35 AM', avatar: '👨', message: 'Thanks for sharing! The concurrent rendering updates look amazing. Has anyone tried the new useId hook yet?', reactions: ['👍'], reactionCount: 5 },
                                { user: 'Emily Davis', time: '10:42 AM', avatar: '👩', message: 'I implemented useId in my current project last week. Super helpful for accessibility! Here\'s a quick example: const id = useId(); <input id={id} aria-describedby={id + \'-help\'} />', reactions: ['👍', '🔥', '💡'], reactionCount: 8 },
                                { user: 'Alex Rodriguez', time: '11:15 AM', avatar: '👨', message: 'Speaking of React 18, anyone attending the virtual conference next week? Would love to coordinate watching sessions together.', reactions: ['🎉'], reactionCount: 3 },
                                { user: 'Jessica Wang', time: '11:20 AM', avatar: '👩', message: 'Count me in! I\'ve been looking forward to the Suspense deep dive talk.', reactions: ['👍'], reactionCount: 2 }
                            ].map((msg, index) => `
                                <div style="display: flex; align-items: start; gap: 1rem; padding: 0.75rem; border-radius: 8px; transition: background 0.2s ease;" onmouseover="this.style.background='var(--glass-hover)'" onmouseout="this.style.background='transparent'">
                                    <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">${msg.avatar}</div>
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                            <span style="font-weight: 600; color: var(--text-primary);">${msg.user}</span>
                                            <span style="color: var(--text-muted); font-size: 0.8rem;">${msg.time}</span>
                                        </div>
                                        <div style="color: var(--text-secondary); line-height: 1.5; margin-bottom: 0.5rem;">${msg.message}</div>
                                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                                            <div style="display: flex; gap: 0.25rem;">
                                                ${msg.reactions.map(reaction => `<span style="cursor: pointer; padding: 0.25rem; border-radius: 4px; transition: background 0.2s ease;" onmouseover="this.style.background='var(--glass-hover)'" onmouseout="this.style.background='transparent'" onclick="this.toggleReaction('${reaction}', ${index})">${reaction}</span>`).join('')}
                                            </div>
                                            <span style="color: var(--text-muted); font-size: 0.8rem;">${msg.reactionCount}</span>
                                            <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.25rem; margin-left: auto;" onclick="this.replyToMessage(${index})" title="Reply">
                                                <i class="fas fa-reply"></i>
                                            </button>
                                            <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.25rem;" onclick="this.showMessageOptions(${index})" title="More options">
                                                <i class="fas fa-ellipsis-h"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Message Input -->
                        <div style="padding: 1rem; border-top: 1px solid var(--glass-border);">
                            <div style="display: flex; align-items: end; gap: 0.5rem;">
                                <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.75rem;" onclick="this.attachFile()" title="Attach file">
                                    <i class="fas fa-paperclip"></i>
                                </button>
                                <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.75rem;" onclick="this.openEmojiPicker()" title="Add emoji">
                                    <i class="fas fa-smile"></i>
                                </button>
                                <div style="flex: 1; position: relative;">
                                    <textarea placeholder="Type your message... (@mention, #hashtag)" style="width: 100%; min-height: 60px; max-height: 120px; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass); resize: none; font-family: inherit;" onkeydown="if(event.key==='Enter' && !event.shiftKey) { event.preventDefault(); this.sendMessage(); }"></textarea>
                                </div>
                                <button class="btn btn-primary" onclick="this.sendMessage()">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; color: var(--text-muted); font-size: 0.8rem;">
                                <div>
                                    <span>Press Enter to send, Shift+Enter for new line</span>
                                </div>
                                <div>
                                    <i class="fas fa-users"></i> 156 members online
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Members Sidebar -->
                    <div style="display: flex; flex-direction: column; background: var(--glass); border-radius: 12px; overflow: hidden;">
                        <div style="padding: 1rem; border-bottom: 1px solid var(--glass-border);">
                            <h4 style="margin: 0;"><i class="fas fa-users"></i> Members (1,247)</h4>
                        </div>

                        <!-- Online Members -->
                        <div style="padding: 1rem; border-bottom: 1px solid var(--glass-border);">
                            <div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--success);">
                                <i class="fas fa-circle" style="font-size: 0.8rem;"></i> Online (156)
                            </div>
                            <div style="max-height: 200px; overflow-y: auto;">
                                ${[
                                    'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Rodriguez', 'Jessica Wang',
                                    'David Kim', 'Lisa Thompson', 'John Smith', 'Maria Garcia', 'Robert Wilson'
                                ].map(member => `
                                    <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; cursor: pointer; border-radius: 4px; transition: background 0.2s ease;" onmouseover="this.style.background='var(--glass-hover)'" onmouseout="this.style.background='transparent'">
                                        <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--success);"></div>
                                        <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8rem; font-weight: 600;">
                                            ${member.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span style="font-size: 0.9rem; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${member}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Group Actions -->
                        <div style="padding: 1rem;">
                            <div style="display: grid; gap: 0.5rem;">
                                <button class="btn btn-small btn-secondary" onclick="this.viewMemberDirectory()">
                                    <i class="fas fa-address-book"></i> Member Directory
                                </button>
                                <button class="btn btn-small btn-secondary" onclick="this.manageMemberRoles()">
                                    <i class="fas fa-user-cog"></i> Manage Roles
                                </button>
                                <button class="btn btn-small btn-secondary" onclick="this.groupSettings()">
                                    <i class="fas fa-cog"></i> Group Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.toggleThreads = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Thread view toggled', 'info');
            }
        };

        modal.searchMessages = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Message search opened', 'info');
            }
        };

        modal.showPinnedMessages = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Showing pinned messages', 'info');
            }
        };

        modal.openChatSettings = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Chat settings opened', 'info');
            }
        };

        modal.toggleReaction = (reaction, messageIndex) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Reacted with ${reaction}`, 'info');
            }
        };

        modal.replyToMessage = (messageIndex) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Reply started', 'info');
            }
        };

        modal.showMessageOptions = (messageIndex) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Message options opened', 'info');
            }
        };

        modal.attachFile = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('File attachment opened', 'info');
            }
        };

        modal.openEmojiPicker = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Emoji picker opened', 'info');
            }
        };

        modal.sendMessage = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Message sent!', 'success');
            }
        };

        modal.viewMemberDirectory = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Member directory opened', 'info');
            }
        };

        modal.manageMemberRoles = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Role management opened', 'info');
            }
        };

        modal.groupSettings = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Group settings opened', 'info');
            }
        };

        document.body.appendChild(modal);
    }

    /**
     * 4. GROUP EVENT CREATOR INTERFACE
     */
    showGroupEventCreator() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-calendar-plus"></i> Create Group Event</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="event-creator-content">
                    <!-- Event Cover Image -->
                    <div style="margin-bottom: 2rem;">
                        <label style="display: block; margin-bottom: 1rem; font-weight: 600;">Event Cover Image</label>
                        <div style="position: relative; width: 100%; height: 250px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden;" onclick="this.uploadEventCover()">
                            <div style="text-align: center; color: white;">
                                <i class="fas fa-image" style="font-size: 2.5rem; margin-bottom: 0.5rem;"></i>
                                <div style="font-size: 1.1rem; margin-bottom: 0.25rem;">Add Event Cover Image</div>
                                <div style="font-size: 0.9rem; opacity: 0.8;">Recommended: 1920x1080 pixels</div>
                            </div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                        <!-- Left Column - Event Details -->
                        <div>
                            <!-- Basic Event Information -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                                <h3><i class="fas fa-info-circle"></i> Event Details</h3>
                                
                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Event Title *</label>
                                    <input type="text" id="event-title" placeholder="Enter event title..." style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                                </div>

                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Event Description *</label>
                                    <textarea id="event-description" placeholder="Describe your event, what attendees can expect, and any requirements..." style="width: 100%; height: 120px; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass); resize: vertical;"></textarea>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Event Category</label>
                                        <select id="event-category" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                                            <option value="">Select category...</option>
                                            <option value="meetup">Meetup</option>
                                            <option value="workshop">Workshop</option>
                                            <option value="seminar">Seminar</option>
                                            <option value="conference">Conference</option>
                                            <option value="social">Social Event</option>
                                            <option value="networking">Networking</option>
                                            <option value="training">Training</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Event Type</label>
                                        <select id="event-type" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);" onchange="this.toggleLocationFields()">
                                            <option value="in-person">In-Person</option>
                                            <option value="virtual">Virtual</option>
                                            <option value="hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- Location Fields -->
                                <div id="location-fields" style="margin-bottom: 1.5rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Event Location *</label>
                                    <input type="text" id="event-location" placeholder="Enter venue address or online meeting link..." style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass); margin-bottom: 0.5rem;">
                                    <textarea id="event-venue-details" placeholder="Additional venue details, parking information, room number..." style="width: 100%; height: 60px; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass); resize: vertical;"></textarea>
                                </div>

                                <!-- Date and Time -->
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Start Date & Time *</label>
                                        <input type="datetime-local" id="event-start" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">End Date & Time *</label>
                                        <input type="datetime-local" id="event-end" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                                    </div>
                                </div>

                                <!-- Tags -->
                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Event Tags</label>
                                    <input type="text" id="event-tags" placeholder="javascript, networking, workshop, beginner-friendly" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Separate tags with commas</div>
                                </div>
                            </div>

                            <!-- Event Agenda -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 2rem;">
                                <h3><i class="fas fa-list-ol"></i> Event Agenda (Optional)</h3>
                                <div id="agenda-items">
                                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                                        <input type="time" style="padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);">
                                        <input type="text" placeholder="Agenda item..." style="flex: 1; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);">
                                        <button style="background: var(--error); color: white; border: none; padding: 0.5rem; border-radius: 6px; cursor: pointer;" onclick="this.removeAgendaItem(this)">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <button class="btn btn-secondary btn-small" onclick="this.addAgendaItem()" style="margin-top: 0.5rem;">
                                    <i class="fas fa-plus"></i> Add Agenda Item
                                </button>
                            </div>
                        </div>

                        <!-- Right Column - Event Settings -->
                        <div>
                            <!-- Registration Settings -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                                <h4><i class="fas fa-ticket-alt"></i> Registration Settings</h4>
                                <div style="margin-top: 1rem;">
                                    <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                                        <input type="checkbox" id="require-registration" checked>
                                        <span>Require registration</span>
                                    </label>
                                    
                                    <div style="margin-bottom: 1rem;">
                                        <label style="display: block; margin-bottom: 0.5rem;">Max Attendees</label>
                                        <input type="number" placeholder="50" min="1" style="width: 100%; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);">
                                    </div>
                                    
                                    <div style="margin-bottom: 1rem;">
                                        <label style="display: block; margin-bottom: 0.5rem;">Registration Deadline</label>
                                        <input type="datetime-local" style="width: 100%; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);">
                                    </div>
                                    
                                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                                        <input type="checkbox">
                                        <span>Waitlist when full</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Event Notifications -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                                <h4><i class="fas fa-bell"></i> Event Notifications</h4>
                                <div style="margin-top: 1rem;">
                                    <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                        <input type="checkbox" checked>
                                        <span>Announce to group</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                        <input type="checkbox" checked>
                                        <span>Send email invitations</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                        <input type="checkbox">
                                        <span>Remind attendees 24h before</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                                        <input type="checkbox">
                                        <span>Send follow-up after event</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Event Visibility -->
                            <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                                <h4><i class="fas fa-eye"></i> Event Visibility</h4>
                                <div style="margin-top: 1rem;">
                                    <label style="display: flex; align-items: start; gap: 0.5rem; margin-bottom: 1rem; cursor: pointer;">
                                        <input type="radio" name="visibility" value="group-only" checked>
                                        <div>
                                            <div style="font-weight: 600;">Group Members Only</div>
                                            <div style="font-size: 0.8rem; color: var(--text-muted);">Only group members can see and join</div>
                                        </div>
                                    </label>
                                    <label style="display: flex; align-items: start; gap: 0.5rem; margin-bottom: 1rem; cursor: pointer;">
                                        <input type="radio" name="visibility" value="public">
                                        <div>
                                            <div style="font-weight: 600;">Public Event</div>
                                            <div style="font-size: 0.8rem; color: var(--text-muted);">Anyone can see and join this event</div>
                                        </div>
                                    </label>
                                    <label style="display: flex; align-items: start; gap: 0.5rem; cursor: pointer;">
                                        <input type="radio" name="visibility" value="invite-only">
                                        <div>
                                            <div style="font-weight: 600;">Invite Only</div>
                                            <div style="font-size: 0.8rem; color: var(--text-muted);">Only invited members can attend</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                        <button class="btn btn-secondary" onclick="this.saveAsDraft()">
                            <i class="fas fa-save"></i> Save Draft
                        </button>
                        <button class="btn btn-secondary" onclick="this.previewEvent()">
                            <i class="fas fa-eye"></i> Preview
                        </button>
                        <button class="btn btn-primary" onclick="this.createEvent()">
                            <i class="fas fa-calendar-plus"></i> Create Event
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.uploadEventCover = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Event cover upload opened', 'info');
            }
        };

        modal.toggleLocationFields = () => {
            const eventType = modal.querySelector('#event-type').value;
            const locationLabel = modal.querySelector('#location-fields label');
            const locationInput = modal.querySelector('#event-location');
            
            if (eventType === 'virtual') {
                locationLabel.textContent = 'Meeting Link *';
                locationInput.placeholder = 'Enter Zoom, Teams, or other meeting link...';
            } else if (eventType === 'hybrid') {
                locationLabel.textContent = 'Venue & Meeting Link *';
                locationInput.placeholder = 'Enter venue address and online meeting link...';
            } else {
                locationLabel.textContent = 'Event Location *';
                locationInput.placeholder = 'Enter venue address...';
            }
        };

        modal.addAgendaItem = () => {
            const agendaContainer = modal.querySelector('#agenda-items');
            const newItem = document.createElement('div');
            newItem.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;';
            newItem.innerHTML = `
                <input type="time" style="padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);">
                <input type="text" placeholder="Agenda item..." style="flex: 1; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass);">
                <button style="background: var(--error); color: white; border: none; padding: 0.5rem; border-radius: 6px; cursor: pointer;" onclick="this.removeAgendaItem(this)">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            agendaContainer.appendChild(newItem);
        };

        modal.removeAgendaItem = (button) => {
            button.closest('div').remove();
        };

        modal.saveAsDraft = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Event saved as draft!', 'success');
            }
        };

        modal.previewEvent = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Event preview opened', 'info');
            }
        };

        modal.createEvent = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Event created successfully!', 'success');
            }
            modal.remove();
        };

        document.body.appendChild(modal);
    }

    /**
     * 5. GROUP FILE MANAGER INTERFACE
     */
    showGroupFileManager() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content extra-large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-folder-open"></i> Group File Manager</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="file-manager-content">
                    <!-- File Manager Header -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding: 1rem; background: var(--glass); border-radius: 12px;">
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <button class="btn btn-primary" onclick="this.uploadFiles()">
                                <i class="fas fa-upload"></i> Upload Files
                            </button>
                            <button class="btn btn-secondary" onclick="this.createFolder()">
                                <i class="fas fa-folder-plus"></i> New Folder
                            </button>
                            <div style="position: relative;">
                                <i class="fas fa-search" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                                <input type="text" placeholder="Search files..." style="padding: 0.5rem 1rem 0.5rem 2.5rem; border: 1px solid var(--glass-border); border-radius: 20px; background: var(--glass); min-width: 200px;">
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem;" onclick="this.toggleViewMode('grid')" title="Grid view">
                                <i class="fas fa-th"></i>
                            </button>
                            <button style="background: none; border: none; color: var(--primary); cursor: pointer; padding: 0.5rem;" onclick="this.toggleViewMode('list')" title="List view">
                                <i class="fas fa-list"></i>
                            </button>
                            <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem;" onclick="this.showFileStats()" title="File statistics">
                                <i class="fas fa-chart-bar"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Breadcrumb Navigation -->
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; padding: 0.75rem; background: var(--bg-card); border-radius: 8px;">
                        <i class="fas fa-folder" style="color: var(--primary);"></i>
                        <span style="color: var(--primary); cursor: pointer;" onclick="this.navigateToRoot()">Group Files</span>
                        <i class="fas fa-chevron-right" style="color: var(--text-muted); font-size: 0.8rem;"></i>
                        <span style="color: var(--primary); cursor: pointer;" onclick="this.navigateToFolder('documents')">Documents</span>
                        <i class="fas fa-chevron-right" style="color: var(--text-muted); font-size: 0.8rem;"></i>
                        <span style="color: var(--text-secondary);">Meeting Notes</span>
                    </div>

                    <div style="display: grid; grid-template-columns: 250px 1fr; gap: 2rem;">
                        <!-- File Tree Sidebar -->
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; height: 500px; overflow-y: auto;">
                            <h4 style="margin-bottom: 1rem;"><i class="fas fa-folder-tree"></i> Folders</h4>
                            <div style="font-size: 0.9rem;">
                                <div style="margin-bottom: 0.5rem;">
                                    <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; cursor: pointer; border-radius: 4px; background: var(--primary-light);" onclick="this.selectFolder('documents')">
                                        <i class="fas fa-folder-open" style="color: var(--primary);"></i>
                                        <span>Documents</span>
                                    </div>
                                    <div style="margin-left: 1rem; padding-left: 1rem; border-left: 2px solid var(--glass-border);">
                                        <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem; cursor: pointer; border-radius: 4px; background: var(--secondary-light);" onclick="this.selectFolder('meeting-notes')">
                                            <i class="fas fa-folder" style="color: var(--secondary);"></i>
                                            <span>Meeting Notes</span>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem; cursor: pointer; border-radius: 4px;" onclick="this.selectFolder('presentations')">
                                            <i class="fas fa-folder" style="color: var(--accent);"></i>
                                            <span>Presentations</span>
                                        </div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; cursor: pointer; border-radius: 4px;" onclick="this.selectFolder('images')">
                                    <i class="fas fa-folder" style="color: var(--warning);"></i>
                                    <span>Images</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; cursor: pointer; border-radius: 4px;" onclick="this.selectFolder('resources')">
                                    <i class="fas fa-folder" style="color: var(--success);"></i>
                                    <span>Resources</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; cursor: pointer; border-radius: 4px;" onclick="this.selectFolder('archive')">
                                    <i class="fas fa-folder" style="color: var(--text-muted);"></i>
                                    <span>Archive</span>
                                </div>
                            </div>
                        </div>

                        <!-- Main File Area -->
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                <h4>Meeting Notes (8 files, 12.5 MB)</h4>
                                <div style="display: flex; gap: 0.5rem;">
                                    <select style="padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass); font-size: 0.9rem;">
                                        <option>Sort by: Date Modified</option>
                                        <option>Sort by: Name</option>
                                        <option>Sort by: Size</option>
                                        <option>Sort by: Type</option>
                                    </select>
                                </div>
                            </div>

                            <!-- File List -->
                            <div style="height: 400px; overflow-y: auto;">
                                ${[
                                    { name: 'Weekly Standup - March 15.pdf', size: '2.4 MB', modified: '2 days ago', type: 'pdf', shared: true, downloads: 12 },
                                    { name: 'Project Requirements.docx', size: '856 KB', modified: '5 days ago', type: 'docx', shared: false, downloads: 8 },
                                    { name: 'API Documentation.pdf', size: '3.2 MB', modified: '1 week ago', type: 'pdf', shared: true, downloads: 25 },
                                    { name: 'Team Retrospective Notes.txt', size: '45 KB', modified: '1 week ago', type: 'txt', shared: false, downloads: 3 },
                                    { name: 'Budget Proposal 2024.xlsx', size: '1.8 MB', modified: '2 weeks ago', type: 'xlsx', shared: true, downloads: 15 },
                                    { name: 'Design Mockups.zip', size: '4.1 MB', modified: '2 weeks ago', type: 'zip', shared: false, downloads: 7 },
                                    { name: 'Meeting Recording.mp4', size: '45.2 MB', modified: '3 weeks ago', type: 'mp4', shared: true, downloads: 18 },
                                    { name: 'Deployment Guide.md', size: '128 KB', modified: '1 month ago', type: 'md', shared: false, downloads: 11 }
                                ].map((file, index) => `
                                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border: 1px solid var(--glass-border); border-radius: 8px; margin-bottom: 0.75rem; transition: background 0.2s ease;" onmouseover="this.style.background='var(--glass-hover)'" onmouseout="this.style.background='transparent'">
                                        <div style="display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 0;">
                                            <div style="width: 40px; height: 40px; border-radius: 8px; background: ${this.getFileTypeColor(file.type)}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.8rem;">
                                                ${file.type.toUpperCase()}
                                            </div>
                                            <div style="flex: 1; min-width: 0;">
                                                <div style="font-weight: 600; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${file.name}</div>
                                                <div style="color: var(--text-muted); font-size: 0.8rem; display: flex; align-items: center; gap: 1rem;">
                                                    <span>${file.size}</span>
                                                    <span>Modified ${file.modified}</span>
                                                    <span><i class="fas fa-download"></i> ${file.downloads}</span>
                                                    ${file.shared ? '<span style="color: var(--success);"><i class="fas fa-share"></i> Shared</span>' : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                                            <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem;" onclick="this.downloadFile(${index})" title="Download">
                                                <i class="fas fa-download"></i>
                                            </button>
                                            <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem;" onclick="this.shareFile(${index})" title="Share">
                                                <i class="fas fa-share"></i>
                                            </button>
                                            <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem;" onclick="this.showFileDetails(${index})" title="Details">
                                                <i class="fas fa-info-circle"></i>
                                            </button>
                                            <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem;" onclick="this.showFileOptions(${index})" title="More options">
                                                <i class="fas fa-ellipsis-v"></i>
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Storage Usage -->
                    <div style="margin-top: 2rem; padding: 1rem; background: var(--info-bg); border: 1px solid var(--info-border); border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="font-weight: 600;">Storage Usage</span>
                            <span style="color: var(--text-secondary);">156 MB of 1 GB used</span>
                        </div>
                        <div style="background: var(--glass-border); height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: var(--primary); height: 100%; width: 15.6%; border-radius: 3px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.getFileTypeColor = (type) => {
            const colors = {
                'pdf': '#FF6B6B',
                'docx': '#4ECDC4',
                'xlsx': '#45B7D1',
                'txt': '#96CEB4',
                'zip': '#FECA57',
                'mp4': '#FF9FF3',
                'md': '#54A0FF'
            };
            return colors[type] || '#95A5A6';
        };

        modal.uploadFiles = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('File upload dialog opened', 'info');
            }
        };

        modal.createFolder = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('New folder created', 'success');
            }
        };

        modal.toggleViewMode = (mode) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Switched to ${mode} view`, 'info');
            }
        };

        modal.showFileStats = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('File statistics opened', 'info');
            }
        };

        modal.navigateToRoot = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Navigated to root folder', 'info');
            }
        };

        modal.navigateToFolder = (folder) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Navigated to ${folder} folder`, 'info');
            }
        };

        modal.selectFolder = (folder) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Selected ${folder} folder`, 'info');
            }
        };

        modal.downloadFile = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('File download started', 'success');
            }
        };

        modal.shareFile = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('File sharing options opened', 'info');
            }
        };

        modal.showFileDetails = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('File details opened', 'info');
            }
        };

        modal.showFileOptions = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('File options menu opened', 'info');
            }
        };

        document.body.appendChild(modal);
    }

    /**
     * 6. GROUP MEMBER MANAGEMENT INTERFACE
     */
    showGroupMemberManagement() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content extra-large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-users-cog"></i> Group Member Management</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="member-management-content">
                    <!-- Management Controls -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding: 1rem; background: var(--glass); border-radius: 12px;">
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <button class="btn btn-primary" onclick="this.inviteNewMembers()">
                                <i class="fas fa-user-plus"></i> Invite Members
                            </button>
                            <button class="btn btn-secondary" onclick="this.exportMemberList()">
                                <i class="fas fa-download"></i> Export List
                            </button>
                            <button class="btn btn-secondary" onclick="this.bulkActions()">
                                <i class="fas fa-tasks"></i> Bulk Actions
                            </button>
                        </div>
                        <div style="position: relative;">
                            <i class="fas fa-search" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                            <input type="text" placeholder="Search members..." style="padding: 0.5rem 1rem 0.5rem 2.5rem; border: 1px solid var(--glass-border); border-radius: 20px; background: var(--glass); min-width: 250px;">
                        </div>
                    </div>

                    <!-- Member Statistics -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                        <div class="stat-card">
                            <div class="stat-number">1,247</div>
                            <div class="stat-label">Total Members</div>
                            <div style="color: var(--success); font-size: 0.8rem;">↑ +23 this week</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">89</div>
                            <div class="stat-label">Active Members</div>
                            <div style="color: var(--success); font-size: 0.8rem;">↑ +12%</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">45</div>
                            <div class="stat-label">Moderators</div>
                            <div style="color: var(--info); font-size: 0.8rem;">5 new this month</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">12</div>
                            <div class="stat-label">Pending Approval</div>
                            <div style="color: var(--warning); font-size: 0.8rem;">Review needed</div>
                        </div>
                    </div>

                    <!-- Member Filters -->
                    <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
                        <button class="btn btn-small btn-primary" onclick="this.filterMembers('all')">All Members</button>
                        <button class="btn btn-small btn-secondary" onclick="this.filterMembers('active')">Active</button>
                        <button class="btn btn-small btn-secondary" onclick="this.filterMembers('moderators')">Moderators</button>
                        <button class="btn btn-small btn-secondary" onclick="this.filterMembers('new')">New Members</button>
                        <button class="btn btn-small btn-secondary" onclick="this.filterMembers('inactive')">Inactive</button>
                    </div>

                    <!-- Members List -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; height: 500px; overflow-y: auto;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h4>Group Members</h4>
                            <div style="display: flex; gap: 0.5rem;">
                                <select style="padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass); font-size: 0.9rem;">
                                    <option>Sort by: Name</option>
                                    <option>Sort by: Join Date</option>
                                    <option>Sort by: Activity</option>
                                    <option>Sort by: Role</option>
                                </select>
                            </div>
                        </div>

                        <!-- Member List Items -->
                        ${[
                            { name: 'Sarah Johnson', email: 'sarah.j@email.com', role: 'Administrator', joined: '2 years ago', lastActive: '2 hours ago', posts: 145, status: 'online' },
                            { name: 'Mike Chen', email: 'mike.chen@email.com', role: 'Moderator', joined: '1.5 years ago', lastActive: '1 day ago', posts: 89, status: 'offline' },
                            { name: 'Emily Davis', email: 'emily.d@email.com', role: 'Member', joined: '1 year ago', lastActive: '30 minutes ago', posts: 67, status: 'online' },
                            { name: 'Alex Rodriguez', email: 'alex.r@email.com', role: 'Member', joined: '8 months ago', lastActive: '5 hours ago', posts: 34, status: 'away' },
                            { name: 'Jessica Wang', email: 'jessica.w@email.com', role: 'Moderator', joined: '6 months ago', lastActive: '15 minutes ago', posts: 78, status: 'online' },
                            { name: 'David Kim', email: 'david.k@email.com', role: 'Member', joined: '4 months ago', lastActive: '2 days ago', posts: 23, status: 'offline' }
                        ].map((member, index) => `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border: 1px solid var(--glass-border); border-radius: 8px; margin-bottom: 0.75rem; transition: background 0.2s ease;" onmouseover="this.style.background='var(--glass-hover)'" onmouseout="this.style.background='transparent'">
                                <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                                    <div style="position: relative;">
                                        <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 1.2rem;">
                                            ${member.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; border-radius: 50%; background: ${member.status === 'online' ? 'var(--success)' : member.status === 'away' ? 'var(--warning)' : 'var(--text-muted)'}; border: 2px solid var(--bg-primary);"></div>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; margin-bottom: 0.25rem;">${member.name}</div>
                                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.25rem;">${member.email}</div>
                                        <div style="display: flex; align-items: center; gap: 1rem; color: var(--text-muted); font-size: 0.8rem;">
                                            <span><i class="fas fa-shield-alt"></i> ${member.role}</span>
                                            <span><i class="fas fa-calendar"></i> Joined ${member.joined}</span>
                                            <span><i class="fas fa-clock"></i> ${member.lastActive}</span>
                                            <span><i class="fas fa-comment"></i> ${member.posts} posts</span>
                                        </div>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 0.5rem; align-items: center;">
                                    <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem;" onclick="this.viewMemberProfile(${index})" title="View profile">
                                        <i class="fas fa-user"></i>
                                    </button>
                                    <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem;" onclick="this.sendMessage(${index})" title="Send message">
                                        <i class="fas fa-envelope"></i>
                                    </button>
                                    <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem;" onclick="this.manageRole(${index})" title="Manage role">
                                        <i class="fas fa-cog"></i>
                                    </button>
                                    <button style="background: none; border: none; color: var(--error); cursor: pointer; padding: 0.5rem;" onclick="this.removeMember(${index})" title="Remove member">
                                        <i class="fas fa-user-times"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        modal.filterMembers = (filter) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Showing ${filter} members`, 'info');
            }
        };

        modal.inviteNewMembers = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Member invitation opened', 'info');
            }
        };

        modal.exportMemberList = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Member list exported!', 'success');
            }
        };

        modal.bulkActions = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Bulk actions opened', 'info');
            }
        };

        modal.viewMemberProfile = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Member profile opened', 'info');
            }
        };

        modal.sendMessage = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Message composer opened', 'info');
            }
        };

        modal.manageRole = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Role management opened', 'info');
            }
        };

        modal.removeMember = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Member removal confirmation', 'warning');
            }
        };

        document.body.appendChild(modal);
    }

    /**
     * 7. GROUP DISCOVERY FEED INTERFACE
     */
    showGroupDiscoveryFeed() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content extra-large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-compass"></i> Discover Groups</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="discovery-feed-content">
                    <!-- Discovery Filters -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding: 1rem; background: var(--glass); border-radius: 12px;">
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <select style="padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass); min-width: 150px;">
                                <option>All Categories</option>
                                <option>Technology</option>
                                <option>Business</option>
                                <option>Hobbies</option>
                                <option>Health & Fitness</option>
                                <option>Education</option>
                            </select>
                            <select style="padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass); min-width: 120px;">
                                <option>All Locations</option>
                                <option>New York</option>
                                <option>Los Angeles</option>
                                <option>Chicago</option>
                                <option>Online Only</option>
                            </select>
                            <select style="padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass); min-width: 120px;">
                                <option>All Sizes</option>
                                <option>Small (1-50)</option>
                                <option>Medium (51-500)</option>
                                <option>Large (500+)</option>
                            </select>
                        </div>
                        <div style="position: relative;">
                            <i class="fas fa-search" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                            <input type="text" placeholder="Search groups..." style="padding: 0.5rem 1rem 0.5rem 2.5rem; border: 1px solid var(--glass-border); border-radius: 20px; background: var(--glass); min-width: 250px;">
                        </div>
                    </div>

                    <!-- Quick Filters -->
                    <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
                        <button class="btn btn-small btn-primary" onclick="this.filterGroups('recommended')">Recommended</button>
                        <button class="btn btn-small btn-secondary" onclick="this.filterGroups('trending')">Trending</button>
                        <button class="btn btn-small btn-secondary" onclick="this.filterGroups('new')">New Groups</button>
                        <button class="btn btn-small btn-secondary" onclick="this.filterGroups('active')">Most Active</button>
                        <button class="btn btn-small btn-secondary" onclick="this.filterGroups('nearby')">Nearby</button>
                    </div>

                    <!-- Groups Grid -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; max-height: 600px; overflow-y: auto;">
                        ${[
                            { 
                                name: 'JavaScript Developers NYC',
                                description: 'A community of JavaScript developers sharing knowledge, best practices, and networking opportunities in NYC.',
                                category: 'Technology',
                                members: 1247,
                                posts: 156,
                                location: 'New York, NY',
                                tags: ['javascript', 'react', 'nodejs', 'frontend'],
                                isPrivate: false,
                                lastActivity: '2 hours ago',
                                trending: true
                            },
                            {
                                name: 'Digital Marketing Masters',
                                description: 'Learn and share digital marketing strategies, SEO tips, and growth hacking techniques.',
                                category: 'Business',
                                members: 856,
                                posts: 89,
                                location: 'Online',
                                tags: ['marketing', 'seo', 'social-media', 'analytics'],
                                isPrivate: false,
                                lastActivity: '1 hour ago',
                                trending: false
                            },
                            {
                                name: 'Photography Enthusiasts',
                                description: 'Share your photos, get feedback, and learn new techniques from fellow photography lovers.',
                                category: 'Hobbies',
                                members: 2134,
                                posts: 445,
                                location: 'Los Angeles, CA',
                                tags: ['photography', 'art', 'creative', 'editing'],
                                isPrivate: false,
                                lastActivity: '30 minutes ago',
                                trending: true
                            },
                            {
                                name: 'Fitness & Wellness Community',
                                description: 'Motivation, workout plans, nutrition tips, and wellness advice for a healthier lifestyle.',
                                category: 'Health & Fitness',
                                members: 1689,
                                posts: 234,
                                location: 'Chicago, IL',
                                tags: ['fitness', 'nutrition', 'wellness', 'workout'],
                                isPrivate: false,
                                lastActivity: '4 hours ago',
                                trending: false
                            },
                            {
                                name: 'Book Club & Literature',
                                description: 'Monthly book discussions, author recommendations, and literary analysis with fellow book lovers.',
                                category: 'Education',
                                members: 567,
                                posts: 78,
                                location: 'Online',
                                tags: ['books', 'literature', 'reading', 'discussion'],
                                isPrivate: false,
                                lastActivity: '6 hours ago',
                                trending: false
                            },
                            {
                                name: 'Startup Founders Network',
                                description: 'Connect with fellow entrepreneurs, share experiences, and get advice on building successful startups.',
                                category: 'Business',
                                members: 934,
                                posts: 167,
                                location: 'San Francisco, CA',
                                tags: ['startup', 'entrepreneurship', 'funding', 'networking'],
                                isPrivate: true,
                                lastActivity: '1 day ago',
                                trending: true
                            }
                        ].map((group, index) => `
                            <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; border: 1px solid var(--glass-border); transition: all 0.2s ease; cursor: pointer;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'" onclick="this.viewGroupDetails(${index})">
                                <!-- Group Header -->
                                <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 1rem;">
                                    <div style="flex: 1;">
                                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                            <h4 style="margin: 0;">${group.name}</h4>
                                            ${group.trending ? '<span style="background: var(--error); color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">TRENDING</span>' : ''}
                                            ${group.isPrivate ? '<i class="fas fa-lock" style="color: var(--warning);" title="Private Group"></i>' : ''}
                                        </div>
                                        <div style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.4; margin-bottom: 1rem;">${group.description}</div>
                                    </div>
                                </div>

                                <!-- Group Stats -->
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-size: 0.8rem; color: var(--text-muted);">
                                    <div style="display: flex; gap: 1rem;">
                                        <span><i class="fas fa-users"></i> ${group.members.toLocaleString()}</span>
                                        <span><i class="fas fa-comments"></i> ${group.posts}</span>
                                        <span><i class="fas fa-map-marker-alt"></i> ${group.location}</span>
                                    </div>
                                    <span><i class="fas fa-clock"></i> ${group.lastActivity}</span>
                                </div>

                                <!-- Tags -->
                                <div style="display: flex; flex-wrap: gap: 0.5rem; margin-bottom: 1rem;">
                                    ${group.tags.map(tag => `
                                        <span style="background: var(--primary-light); color: var(--primary); padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">${tag}</span>
                                    `).join('')}
                                </div>

                                <!-- Category Badge -->
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="background: var(--accent-light); color: var(--accent); padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">${group.category}</span>
                                    <div style="display: flex; gap: 0.5rem;">
                                        <button class="btn btn-small btn-secondary" onclick="event.stopPropagation(); this.saveGroup(${index})" title="Save for later">
                                            <i class="fas fa-bookmark"></i>
                                        </button>
                                        <button class="btn btn-small btn-primary" onclick="event.stopPropagation(); this.joinGroup(${index})">
                                            <i class="fas fa-plus"></i> Join
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Load More Button -->
                    <div style="display: flex; justify-content: center; margin-top: 2rem;">
                        <button class="btn btn-secondary" onclick="this.loadMoreGroups()">
                            <i class="fas fa-plus"></i> Load More Groups
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.filterGroups = (filter) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Showing ${filter} groups`, 'info');
            }
        };

        modal.viewGroupDetails = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Group details opened', 'info');
            }
        };

        modal.saveGroup = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Group saved for later!', 'success');
            }
        };

        modal.joinGroup = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Group join request sent!', 'success');
            }
        };

        modal.loadMoreGroups = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Loading more groups...', 'info');
            }
        };

        document.body.appendChild(modal);
    }
}

// Export the class for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GroupsMissingUIComponents;
}
