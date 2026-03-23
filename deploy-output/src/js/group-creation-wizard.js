/**
 * Group Creation Wizard - Detailed 3-Step Implementation
 * Based on the specification provided
 */

class GroupCreationWizard {
    constructor(app) {
        this.app = app;
        this.currentStep = 1;
        this.formData = {
            // Step 1: Basic Information
            name: '',
            category: '',
            location: '',
            description: '',
            tags: '',
            coverPhoto: null,
            
            // Step 2: Settings & Permissions
            privacy: 'public',
            memberPermissions: {
                canPost: true,
                canCreateEvents: true,
                canInviteOthers: false,
                canUploadFiles: false
            },
            groupRules: [],
            moderationSettings: {
                requirePostApproval: false,
                autoModerateContent: false,
                allowMemberReporting: true
            },
            
            // Step 3: Final settings
            savedAsDraft: false
        };
    }

    /**
     * Show the Group Creation Wizard Modal
     */
    show() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = this.buildWizardHTML();
        
        // Add event handlers
        this.attachEventHandlers(modal);
        
        document.body.appendChild(modal);
        return modal;
    }

    /**
     * Build the complete wizard HTML
     */
    buildWizardHTML() {
        return `
            <div class="modal-content" style="max-width: 900px; width: 95%; max-height: 95vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; position: sticky; top: 0; background: var(--bg-card); z-index: 10; padding-bottom: 1rem;">
                    <h2><i class="fas fa-users-cog"></i> Create New Group</h2>
                    <button class="close-wizard" style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;">✕</button>
                </div>

                <!-- Progress Indicator -->
                <div class="wizard-progress" style="display: flex; justify-content: center; margin-bottom: 3rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div class="step-indicator" data-step="1" style="display: flex; align-items: center; gap: 0.5rem;">
                            <div class="step-circle" style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; transition: all 0.3s ease;">1</div>
                            <span style="font-weight: 500;">Basic Information</span>
                        </div>
                        <div class="step-connector" style="width: 50px; height: 2px; background: var(--glass-border); transition: all 0.3s ease;"></div>
                        <div class="step-indicator" data-step="2" style="display: flex; align-items: center; gap: 0.5rem;">
                            <div class="step-circle" style="width: 40px; height: 40px; border-radius: 50%; background: var(--glass-border); color: var(--text-muted); display: flex; align-items: center; justify-content: center; font-weight: 600; transition: all 0.3s ease;">2</div>
                            <span style="font-weight: 500; color: var(--text-muted);">Settings & Permissions</span>
                        </div>
                        <div class="step-connector" style="width: 50px; height: 2px; background: var(--glass-border); transition: all 0.3s ease;"></div>
                        <div class="step-indicator" data-step="3" style="display: flex; align-items: center; gap: 0.5rem;">
                            <div class="step-circle" style="width: 40px; height: 40px; border-radius: 50%; background: var(--glass-border); color: var(--text-muted); display: flex; align-items: center; justify-content: center; font-weight: 600; transition: all 0.3s ease;">3</div>
                            <span style="font-weight: 500; color: var(--text-muted);">Review & Create</span>
                        </div>
                    </div>
                </div>

                <!-- Wizard Content -->
                <div class="wizard-content">
                    ${this.buildStep1HTML()}
                    ${this.buildStep2HTML()}
                    ${this.buildStep3HTML()}
                </div>

                <!-- Navigation Buttons -->
                <div class="wizard-navigation" style="display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--glass-border);">
                    <button class="btn btn-secondary prev-step" style="display: none;">
                        <i class="fas fa-arrow-left"></i> Previous
                    </button>
                    <div style="flex: 1;"></div>
                    <button class="btn btn-primary next-step">
                        Next <i class="fas fa-arrow-right"></i>
                    </button>
                    <button class="btn btn-primary create-group" style="display: none;">
                        <i class="fas fa-plus-circle"></i> Create Group
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Build Step 1: Basic Information HTML
     */
    buildStep1HTML() {
        return `
            <div class="wizard-step" data-step="1" style="display: block;">
                <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-info-circle" style="color: var(--primary);"></i> Basic Information
                    </h3>
                    
                    <!-- Group Cover Photo Upload Area -->
                    <div style="margin-bottom: 2rem;">
                        <label style="display: block; margin-bottom: 1rem; font-weight: 600; color: var(--text-primary);">Group Cover Photo</label>
                        <div class="cover-upload-area" style="position: relative; width: 100%; height: 200px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; border: 2px dashed rgba(255,255,255,0.3); transition: all 0.3s ease;">
                            <div style="text-align: center; color: white; pointer-events: none;">
                                <i class="fas fa-camera" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                                <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">Click to upload cover photo</div>
                                <div style="font-size: 0.9rem; opacity: 0.8;">Recommended dimensions: 1200x300 pixels</div>
                            </div>
                        </div>
                    </div>

                    <!-- Essential Group Details Form -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <div>
                            <div class="form-group" style="margin-bottom: 1.5rem;">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary);">Group Name *</label>
                                <input type="text" id="group-name" class="form-input" placeholder="Enter group name..." required>
                                <div class="error-message" style="color: var(--error); font-size: 0.8rem; margin-top: 0.25rem; display: none;"></div>
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 1.5rem;">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary);">Group Category *</label>
                                <select id="group-category" class="form-input" required>
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
                                <div class="error-message" style="color: var(--error); font-size: 0.8rem; margin-top: 0.25rem; display: none;"></div>
                            </div>

                            <div class="form-group">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary);">Location</label>
                                <input type="text" id="group-location" class="form-input" placeholder="City, State or Online">
                            </div>
                        </div>

                        <div>
                            <div class="form-group" style="margin-bottom: 1.5rem;">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary);">Group Description *</label>
                                <textarea id="group-description" class="form-input" placeholder="Describe what your group is about, what activities you'll do, and what kind of members you're looking for..." style="height: 120px; resize: vertical;" required></textarea>
                                <div class="error-message" style="color: var(--error); font-size: 0.8rem; margin-top: 0.25rem; display: none;"></div>
                            </div>
                            
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary);">Tags (comma-separated)</label>
                                <input type="text" id="group-tags" class="form-input" placeholder="javascript, coding, meetup, networking">
                                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Help people find your group with relevant tags</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Build Step 2: Settings & Permissions HTML
     */
    buildStep2HTML() {
        return `
            <div class="wizard-step" data-step="2" style="display: none;">
                <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-cogs" style="color: var(--primary);"></i> Group Settings & Permissions
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <div>
                            <!-- Privacy Settings -->
                            <div style="margin-bottom: 2rem;">
                                <h4 style="margin-bottom: 1rem;">Privacy Settings</h4>
                                <div class="privacy-options">
                                    <label style="display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1rem; cursor: pointer; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--glass-border); transition: all 0.3s ease;">
                                        <input type="radio" name="privacy" value="public" checked style="margin-top: 0.25rem;">
                                        <div>
                                            <div style="font-weight: 600; margin-bottom: 0.25rem;">Public Group</div>
                                            <div style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.4;">Anyone can find and join this group</div>
                                        </div>
                                    </label>
                                    <label style="display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1rem; cursor: pointer; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--glass-border); transition: all 0.3s ease;">
                                        <input type="radio" name="privacy" value="private" style="margin-top: 0.25rem;">
                                        <div>
                                            <div style="font-weight: 600; margin-bottom: 0.25rem;">Private Group</div>
                                            <div style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.4;">People need approval to join</div>
                                        </div>
                                    </label>
                                    <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--glass-border); transition: all 0.3s ease;">
                                        <input type="radio" name="privacy" value="secret" style="margin-top: 0.25rem;">
                                        <div>
                                            <div style="font-weight: 600; margin-bottom: 0.25rem;">Secret Group</div>
                                            <div style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.4;">Only members can see the group</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <!-- Member Permissions -->
                            <div style="margin-bottom: 2rem;">
                                <h4 style="margin-bottom: 1rem;">Member Permissions</h4>
                                <div class="permission-options">
                                    <label style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; cursor: pointer;">
                                        <input type="checkbox" name="permission" value="canPost" checked>
                                        <span>Members can post content</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; cursor: pointer;">
                                        <input type="checkbox" name="permission" value="canCreateEvents" checked>
                                        <span>Members can create events</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; cursor: pointer;">
                                        <input type="checkbox" name="permission" value="canInviteOthers">
                                        <span>Members can invite others</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                                        <input type="checkbox" name="permission" value="canUploadFiles">
                                        <span>Members can upload files</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <!-- Group Rules -->
                            <div style="margin-bottom: 2rem;">
                                <h4 style="margin-bottom: 1rem;">Group Rules</h4>
                                <div class="rules-list">
                                    <div class="rule-item" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                                        <input type="text" placeholder="Enter a group rule..." style="flex: 1; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass); color: var(--text-primary);">
                                        <button type="button" class="remove-rule" style="background: var(--error); color: white; border: none; padding: 0.5rem; border-radius: 6px; cursor: pointer;">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-secondary btn-small add-rule" style="margin-top: 0.5rem;">
                                    <i class="fas fa-plus"></i> Add Rule
                                </button>
                            </div>

                            <!-- Moderation Settings -->
                            <div>
                                <h4 style="margin-bottom: 1rem;">Moderation Settings</h4>
                                <div class="moderation-options">
                                    <label style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; cursor: pointer;">
                                        <input type="checkbox" name="moderation" value="requirePostApproval">
                                        <span>Require post approval</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; cursor: pointer;">
                                        <input type="checkbox" name="moderation" value="autoModerateContent">
                                        <span>Auto-moderate inappropriate content</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                                        <input type="checkbox" name="moderation" value="allowMemberReporting" checked>
                                        <span>Allow member reporting</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Build Step 3: Review & Create HTML
     */
    buildStep3HTML() {
        return `
            <div class="wizard-step" data-step="3" style="display: none;">
                <div style="background: var(--glass); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-check-circle" style="color: var(--primary);"></i> Review & Create
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
                        <div>
                            <h4 style="margin-bottom: 1rem;">Basic Information</h4>
                            <div style="background: var(--bg-card); border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem;">
                                <div style="margin-bottom: 0.75rem;"><strong>Name:</strong> <span class="review-name">-</span></div>
                                <div style="margin-bottom: 0.75rem;"><strong>Category:</strong> <span class="review-category">-</span></div>
                                <div style="margin-bottom: 0.75rem;"><strong>Location:</strong> <span class="review-location">-</span></div>
                                <div><strong>Description:</strong> <div class="review-description" style="margin-top: 0.5rem; color: var(--text-secondary); line-height: 1.5;">-</div></div>
                            </div>
                        </div>

                        <div>
                            <h4 style="margin-bottom: 1rem;">Settings Summary</h4>
                            <div style="background: var(--bg-card); border-radius: 8px; padding: 1.5rem;">
                                <div style="margin-bottom: 0.75rem;"><strong>Privacy:</strong> <span class="review-privacy">-</span></div>
                                <div style="margin-bottom: 0.75rem;"><strong>Member Permissions:</strong></div>
                                <div class="review-permissions" style="margin-left: 1rem; color: var(--text-secondary); line-height: 1.5;">-</div>
                                <div style="margin-top: 1rem;"><strong>Group Rules:</strong></div>
                                <div class="review-rules" style="margin-left: 1rem; color: var(--text-secondary); line-height: 1.5;">-</div>
                            </div>
                        </div>
                    </div>

                    <!-- Next Steps Information -->
                    <div style="background: var(--primary-bg, rgba(79, 70, 229, 0.1)); border: 1px solid var(--primary, #4f46e5); border-radius: 8px; padding: 1.5rem; margin-top: 2rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                            <i class="fas fa-info-circle" style="color: var(--primary);"></i>
                            <strong>Next Steps After Creation</strong>
                        </div>
                        <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary); line-height: 1.6;">
                            <li>Invite your first members to get the conversation started</li>
                            <li>Create your first post to set the tone for your group</li>
                            <li>Set up group events and activities</li>
                            <li>Configure additional settings as your group grows</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Attach all event handlers to the modal
     */
    attachEventHandlers(modal) {
        const self = this;

        // Close button
        modal.querySelector('.close-wizard').addEventListener('click', () => {
            modal.remove();
        });

        // Navigation buttons
        modal.querySelector('.next-step').addEventListener('click', () => {
            this.nextStep(modal);
        });

        modal.querySelector('.prev-step').addEventListener('click', () => {
            this.previousStep(modal);
        });

        modal.querySelector('.create-group').addEventListener('click', () => {
            this.createGroup(modal);
        });

        // Cover photo upload
        modal.querySelector('.cover-upload-area').addEventListener('click', () => {
            this.uploadCoverPhoto();
        });

        // Add/Remove rule buttons
        modal.addEventListener('click', (e) => {
            if (e.target.closest('.add-rule')) {
                this.addRule(modal);
            }
            if (e.target.closest('.remove-rule')) {
                this.removeRule(e.target.closest('.rule-item'));
            }
        });

        // Form validation
        const requiredFields = modal.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('input', () => this.validateField(field));
            field.addEventListener('blur', () => this.validateField(field));
        });

        // Privacy option styling
        modal.addEventListener('change', (e) => {
            if (e.target.name === 'privacy') {
                this.updatePrivacySelection(modal);
            }
        });
    }

    /**
     * Move to next step
     */
    nextStep(modal) {
        if (!this.validateCurrentStep(modal)) {
            return;
        }

        if (this.currentStep < 3) {
            // Hide current step
            modal.querySelector(`.wizard-step[data-step="${this.currentStep}"]`).style.display = 'none';
            
            this.currentStep++;
            
            // Show next step
            modal.querySelector(`.wizard-step[data-step="${this.currentStep}"]`).style.display = 'block';
            
            // Update progress indicator
            this.updateProgressIndicator(modal);
            
            // Update navigation buttons
            this.updateNavigationButtons(modal);
            
            if (this.currentStep === 3) {
                this.populateReviewStep(modal);
            }
        }
    }

    /**
     * Move to previous step
     */
    previousStep(modal) {
        if (this.currentStep > 1) {
            // Hide current step
            modal.querySelector(`.wizard-step[data-step="${this.currentStep}"]`).style.display = 'none';
            
            this.currentStep--;
            
            // Show previous step
            modal.querySelector(`.wizard-step[data-step="${this.currentStep}"]`).style.display = 'block';
            
            // Update progress indicator
            this.updateProgressIndicator(modal);
            
            // Update navigation buttons
            this.updateNavigationButtons(modal);
        }
    }

    /**
     * Update progress indicator
     */
    updateProgressIndicator(modal) {
        const indicators = modal.querySelectorAll('.step-indicator');
        const connectors = modal.querySelectorAll('.step-connector');
        
        indicators.forEach((indicator, index) => {
            const circle = indicator.querySelector('.step-circle');
            const span = indicator.querySelector('span');
            const stepNumber = index + 1;
            
            if (stepNumber <= this.currentStep) {
                circle.style.background = 'var(--primary)';
                circle.style.color = 'white';
                span.style.color = 'var(--text-primary)';
                
                if (stepNumber < this.currentStep && connectors[index]) {
                    connectors[index].style.background = 'var(--primary)';
                }
            } else {
                circle.style.background = 'var(--glass-border)';
                circle.style.color = 'var(--text-muted)';
                span.style.color = 'var(--text-muted)';
                
                if (connectors[index]) {
                    connectors[index].style.background = 'var(--glass-border)';
                }
            }
        });
    }

    /**
     * Update navigation buttons
     */
    updateNavigationButtons(modal) {
        const prevBtn = modal.querySelector('.prev-step');
        const nextBtn = modal.querySelector('.next-step');
        const createBtn = modal.querySelector('.create-group');
        
        prevBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-flex';
        
        if (this.currentStep === 3) {
            nextBtn.style.display = 'none';
            createBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            createBtn.style.display = 'none';
        }
    }

    /**
     * Validate current step
     */
    validateCurrentStep(modal) {
        if (this.currentStep === 1) {
            const name = modal.querySelector('#group-name');
            const category = modal.querySelector('#group-category');
            const description = modal.querySelector('#group-description');
            
            let isValid = true;
            
            if (!name.value.trim()) {
                this.showFieldError(name, 'Group name is required');
                isValid = false;
            }
            
            if (!category.value) {
                this.showFieldError(category, 'Please select a category');
                isValid = false;
            }
            
            if (!description.value.trim()) {
                this.showFieldError(description, 'Group description is required');
                isValid = false;
            }
            
            return isValid;
        }
        
        return true;
    }

    /**
     * Validate individual field
     */
    validateField(field) {
        const errorDiv = field.parentNode.querySelector('.error-message');
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            this.showFieldError(field, `${field.previousElementSibling.textContent.replace('*', '').trim()} is required`);
            return false;
        } else {
            this.hideFieldError(field);
            return true;
        }
    }

    /**
     * Show field error
     */
    showFieldError(field, message) {
        const errorDiv = field.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
        field.style.borderColor = 'var(--error)';
    }

    /**
     * Hide field error
     */
    hideFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
        field.style.borderColor = 'var(--glass-border)';
    }

    /**
     * Update privacy selection styling
     */
    updatePrivacySelection(modal) {
        const options = modal.querySelectorAll('.privacy-options label');
        options.forEach(label => {
            const radio = label.querySelector('input[type="radio"]');
            if (radio.checked) {
                label.style.background = 'var(--primary-light, rgba(79, 70, 229, 0.1))';
                label.style.borderColor = 'var(--primary)';
            } else {
                label.style.background = 'transparent';
                label.style.borderColor = 'var(--glass-border)';
            }
        });
    }

    /**
     * Add new rule
     */
    addRule(modal) {
        const rulesList = modal.querySelector('.rules-list');
        const newRule = document.createElement('div');
        newRule.className = 'rule-item';
        newRule.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;';
        
        newRule.innerHTML = `
            <input type="text" placeholder="Enter a group rule..." style="flex: 1; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass); color: var(--text-primary);">
            <button type="button" class="remove-rule" style="background: var(--error); color: white; border: none; padding: 0.5rem; border-radius: 6px; cursor: pointer;">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        rulesList.appendChild(newRule);
    }

    /**
     * Remove rule
     */
    removeRule(ruleItem) {
        ruleItem.remove();
    }

    /**
     * Upload cover photo
     */
    uploadCoverPhoto() {
        if (this.app && this.app.showToast) {
            this.app.showToast('Cover photo upload opened', 'info');
        }
        
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleCoverPhotoUpload(file);
            }
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }

    /**
     * Handle cover photo upload
     */
    handleCoverPhotoUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const coverArea = document.querySelector('.cover-upload-area');
            if (coverArea) {
                coverArea.style.backgroundImage = `url(${e.target.result})`;
                coverArea.style.backgroundSize = 'cover';
                coverArea.style.backgroundPosition = 'center';
                coverArea.innerHTML = `
                    <div style="background: rgba(0,0,0,0.5); color: white; padding: 0.5rem; border-radius: 4px;">
                        <i class="fas fa-check"></i> Cover photo uploaded
                    </div>
                `;
            }
            this.formData.coverPhoto = file;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Populate review step with form data
     */
    populateReviewStep(modal) {
        // Basic Information
        const name = modal.querySelector('#group-name').value || 'Not specified';
        const category = modal.querySelector('#group-category');
        const categoryText = category.options[category.selectedIndex]?.text || 'Not specified';
        const location = modal.querySelector('#group-location').value || 'Not specified';
        const description = modal.querySelector('#group-description').value || 'Not specified';
        
        modal.querySelector('.review-name').textContent = name;
        modal.querySelector('.review-category').textContent = categoryText;
        modal.querySelector('.review-location').textContent = location;
        modal.querySelector('.review-description').textContent = description;
        
        // Privacy Settings
        const privacy = modal.querySelector('input[name="privacy"]:checked')?.value || 'public';
        const privacyLabels = {
            public: 'Public Group',
            private: 'Private Group', 
            secret: 'Secret Group'
        };
        modal.querySelector('.review-privacy').textContent = privacyLabels[privacy];
        
        // Member Permissions
        const permissions = [];
        modal.querySelectorAll('input[name="permission"]:checked').forEach(checkbox => {
            const labels = {
                canPost: 'Members can post content',
                canCreateEvents: 'Members can create events',
                canInviteOthers: 'Members can invite others',
                canUploadFiles: 'Members can upload files'
            };
            permissions.push(labels[checkbox.value]);
        });
        modal.querySelector('.review-permissions').innerHTML = permissions.length 
            ? permissions.map(p => `<div>• ${p}</div>`).join('')
            : 'No special permissions selected';
        
        // Group Rules
        const rules = [];
        modal.querySelectorAll('.rule-item input[type="text"]').forEach(input => {
            if (input.value.trim()) {
                rules.push(input.value.trim());
            }
        });
        modal.querySelector('.review-rules').innerHTML = rules.length 
            ? rules.map(rule => `<div>• ${rule}</div>`).join('')
            : 'No rules specified';
    }

    /**
     * Create the group
     */
    createGroup(modal) {
        // Collect all form data
        this.collectFormData(modal);
        
        // Show loading state
        const createBtn = modal.querySelector('.create-group');
        const originalText = createBtn.innerHTML;
        createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Group...';
        createBtn.disabled = true;
        
        // Simulate group creation process
        setTimeout(() => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Group created successfully! Welcome to your new community.', 'success');
            }
            
            // Close modal
            modal.remove();
            
            // In a real implementation, you would:
            // 1. Send data to backend API
            // 2. Handle success/error responses
            // 3. Redirect to the new group page
            // 4. Update UI with new group
            
        }, 2000);
    }

    /**
     * Collect form data from all steps
     */
    collectFormData(modal) {
        // Step 1: Basic Information
        this.formData.name = modal.querySelector('#group-name').value;
        this.formData.category = modal.querySelector('#group-category').value;
        this.formData.location = modal.querySelector('#group-location').value;
        this.formData.description = modal.querySelector('#group-description').value;
        this.formData.tags = modal.querySelector('#group-tags').value;
        
        // Step 2: Privacy & Permissions
        this.formData.privacy = modal.querySelector('input[name="privacy"]:checked')?.value || 'public';
        
        // Member permissions
        this.formData.memberPermissions = {
            canPost: modal.querySelector('input[name="permission"][value="canPost"]').checked,
            canCreateEvents: modal.querySelector('input[name="permission"][value="canCreateEvents"]').checked,
            canInviteOthers: modal.querySelector('input[name="permission"][value="canInviteOthers"]').checked,
            canUploadFiles: modal.querySelector('input[name="permission"][value="canUploadFiles"]').checked
        };
        
        // Group rules
        this.formData.groupRules = [];
        modal.querySelectorAll('.rule-item input[type="text"]').forEach(input => {
            if (input.value.trim()) {
                this.formData.groupRules.push(input.value.trim());
            }
        });
        
        // Moderation settings
        this.formData.moderationSettings = {
            requirePostApproval: modal.querySelector('input[name="moderation"][value="requirePostApproval"]').checked,
            autoModerateContent: modal.querySelector('input[name="moderation"][value="autoModerateContent"]').checked,
            allowMemberReporting: modal.querySelector('input[name="moderation"][value="allowMemberReporting"]').checked
        };
        
        return this.formData;
    }

    /**
     * Save as draft functionality
     */
    saveAsDraft(modal) {
        this.collectFormData(modal);
        this.formData.savedAsDraft = true;
        
        if (this.app && this.app.showToast) {
            this.app.showToast('Group saved as draft!', 'success');
        }
        
        // In a real implementation, save to localStorage or send to backend
        localStorage.setItem('groupDraft', JSON.stringify(this.formData));
    }

    /**
     * Load draft data if available
     */
    loadDraft() {
        const draft = localStorage.getItem('groupDraft');
        if (draft) {
            try {
                this.formData = JSON.parse(draft);
                return true;
            } catch (e) {
                console.error('Failed to load group draft:', e);
            }
        }
        return false;
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GroupCreationWizard;
}
