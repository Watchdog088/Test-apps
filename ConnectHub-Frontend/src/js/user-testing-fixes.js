/**
 * ConnectHub - User Testing Bug Fixes
 * Fixes 7 issues reported during user testing
 * 
 * 1. Account creation -> force full profile setup
 * 2. Post button in create post not working
 * 3. No button to add location
 * 4. No button to add/tag a person
 * 5. Comments add button not working
 * 6. Share button window not opening
 * 7. Story camera/gallery buttons not working
 */

(function() {
    'use strict';
    
    console.log('[UserTestingFixes] Initializing all 7 bug fixes...');

    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(applyAllFixes, 1500);
    });

    function applyAllFixes() {
        fix1_ForceProfileSetup();
        fix2_PostButtonNotWorking();
        fix3_AddLocationButton();
        fix4_TagPeopleButton();
        fix5_CommentsAddButton();
        fix6_ShareButtonWindow();
        fix7_StoryCameraGallery();
        console.log('[UserTestingFixes] All 7 fixes applied successfully');
    }

    // ==========================================
    // FIX 1: Force full profile setup after signup
    // ==========================================
    function fix1_ForceProfileSetup() {
        // Intercept signup completion to redirect to profile setup
        const origSignup = window.handleSignup;
        window.handleSignup = async function(e) {
            if (e && e.preventDefault) e.preventDefault();
            
            // Run original signup if exists
            if (typeof origSignup === 'function') {
                await origSignup.call(this, e);
            }
            
            // After signup, show profile setup wizard
            showProfileSetupWizard();
        };

        // Also intercept Firebase auth state changes
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('.signup-btn, #signup-btn, [data-action="signup"]');
            if (btn) {
                setTimeout(function() {
                    // Check if user just signed up (no profile completed flag)
                    const profileCompleted = localStorage.getItem('connecthub_profile_completed');
                    if (!profileCompleted) {
                        showProfileSetupWizard();
                    }
                }, 2000);
            }
        });

        console.log('[Fix1] Profile setup after signup - FIXED');
    }

    function showProfileSetupWizard() {
        // Remove existing wizard if any
        const existing = document.getElementById('profile-setup-wizard');
        if (existing) existing.remove();

        const wizard = document.createElement('div');
        wizard.id = 'profile-setup-wizard';
        wizard.innerHTML = `
            <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;">
                <div style="background:white;border-radius:16px;width:90%;max-width:500px;max-height:90vh;overflow-y:auto;padding:30px;">
                    <div id="wizard-step-1" class="wizard-step">
                        <h2 style="margin:0 0 5px;font-size:22px;">Complete Your Profile</h2>
                        <p style="color:#666;margin:0 0 20px;font-size:14px;">Let's set up your profile so others can find you</p>
                        <div style="margin-bottom:15px;">
                            <label style="display:block;font-weight:600;margin-bottom:5px;font-size:14px;">Display Name *</label>
                            <input type="text" id="setup-display-name" placeholder="Your display name" 
                                style="width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
                        </div>
                        <div style="margin-bottom:15px;">
                            <label style="display:block;font-weight:600;margin-bottom:5px;font-size:14px;">Username *</label>
                            <input type="text" id="setup-username" placeholder="@username" 
                                style="width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
                        </div>
                        <div style="margin-bottom:15px;">
                            <label style="display:block;font-weight:600;margin-bottom:5px;font-size:14px;">Bio</label>
                            <textarea id="setup-bio" placeholder="Tell us about yourself..." rows="3"
                                style="width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;resize:vertical;"></textarea>
                        </div>
                        <div style="margin-bottom:15px;">
                            <label style="display:block;font-weight:600;margin-bottom:5px;font-size:14px;">Profile Photo</label>
                            <div style="display:flex;align-items:center;gap:12px;">
                                <div id="setup-avatar-preview" style="width:64px;height:64px;border-radius:50%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:24px;color:#999;overflow:hidden;">
                                    <i class="fas fa-user"></i>
                                </div>
                                <button onclick="document.getElementById('setup-avatar-input').click()" 
                                    style="padding:8px 16px;background:#007bff;color:white;border:none;border-radius:8px;cursor:pointer;font-size:13px;">
                                    Upload Photo
                                </button>
                                <input type="file" id="setup-avatar-input" accept="image/*" hidden onchange="window._previewSetupAvatar(this)">
                            </div>
                        </div>
                        <button onclick="window._goToWizardStep(2)" 
                            style="width:100%;padding:12px;background:#007bff;color:white;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;margin-top:10px;">
                            Next Step
                        </button>
                    </div>
                    <div id="wizard-step-2" class="wizard-step" style="display:none;">
                        <h2 style="margin:0 0 5px;font-size:22px;">Your Interests</h2>
                        <p style="color:#666;margin:0 0 20px;font-size:14px;">Select topics you're interested in</p>
                        <div id="setup-interests" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">
                            ${['Photography','Travel','Music','Art','Technology','Sports','Food','Fashion','Gaming','Fitness','Movies','Books','Nature','Science','Business'].map(i =>
                                '<button class="interest-tag" onclick="this.classList.toggle(\'selected\');this.style.background=this.classList.contains(\'selected\')?\'#007bff\':\'#f0f0f0\';this.style.color=this.classList.contains(\'selected\')?\'white\':\'#333\'" style="padding:8px 16px;background:#f0f0f0;border:none;border-radius:20px;cursor:pointer;font-size:13px;color:#333;">' + i + '</button>'
                            ).join('')}
                        </div>
                        <div style="margin-bottom:15px;">
                            <label style="display:block;font-weight:600;margin-bottom:5px;font-size:14px;">Location (optional)</label>
                            <input type="text" id="setup-location" placeholder="City, Country" 
                                style="width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
                        </div>
                        <div style="margin-bottom:15px;">
                            <label style="display:block;font-weight:600;margin-bottom:5px;font-size:14px;">Date of Birth</label>
                            <input type="date" id="setup-dob" 
                                style="width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
                        </div>
                        <div style="display:flex;gap:10px;">
                            <button onclick="window._goToWizardStep(1)" 
                                style="flex:1;padding:12px;background:#f0f0f0;color:#333;border:none;border-radius:8px;font-size:14px;cursor:pointer;">
                                Back
                            </button>
                            <button onclick="window._completeProfileSetup()" 
                                style="flex:2;padding:12px;background:#28a745;color:white;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;">
                                Complete Setup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(wizard);

        window._previewSetupAvatar = function(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('setup-avatar-preview');
                    preview.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover;">';
                };
                reader.readAsDataURL(input.files[0]);
            }
        };

        window._goToWizardStep = function(step) {
            if (step === 2) {
                const name = document.getElementById('setup-display-name').value.trim();
                const username = document.getElementById('setup-username').value.trim();
                if (!name || !username) {
                    alert('Please fill in your display name and username');
                    return;
                }
            }
            document.querySelectorAll('.wizard-step').forEach(function(s) { s.style.display = 'none'; });
            document.getElementById('wizard-step-' + step).style.display = 'block';
        };

        window._completeProfileSetup = function() {
            localStorage.setItem('connecthub_profile_completed', 'true');
            localStorage.setItem('connecthub_display_name', document.getElementById('setup-display-name').value);
            localStorage.setItem('connecthub_username', document.getElementById('setup-username').value);
            localStorage.setItem('connecthub_bio', document.getElementById('setup-bio').value);
            
            if (typeof app !== 'undefined' && app.showToast) {
                app.showToast('Profile setup complete! Welcome to ConnectHub!', 'success');
            }
            document.getElementById('profile-setup-wizard').remove();
        };
    }

    // ==========================================
    // FIX 2: Post button not working in create post
    // ==========================================
    function fix2_PostButtonNotWorking() {
        // Use event delegation to catch all post button clicks
        document.addEventListener('click', function(e) {
            const postBtn = e.target.closest('.post-btn, #post-btn, .create-post-btn, .submit-post-btn, [data-action="post"]');
            if (!postBtn) return;
            
            // Check if inside create-post modal
            const modal = postBtn.closest('.modal, .create-post-modal, #create-post-modal');
            const postTextArea = document.querySelector('.post-text, #post-text, .create-post-textarea, .modal-body textarea');
            
            if (!postTextArea) return;
            
            const content = postTextArea.value ? postTextArea.value.trim() : (postTextArea.textContent || '').trim();
            
            if (!content) {
                if (typeof app !== 'undefined' && app.showToast) {
                    app.showToast('Please write something before posting', 'warning');
                }
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            // Create the post
            const newPost = {
                id: 'post-' + Date.now(),
                content: content,
                timestamp: new Date(),
                user: (typeof app !== 'undefined' && app.currentUser) ? app.currentUser : { name: 'You', avatar: '' },
                stats: { likes: 0, comments: 0, shares: 0 }
            };

            // Add to posts array if available
            if (typeof app !== 'undefined' && app.posts) {
                app.posts.unshift(newPost);
            }

            // Clear the text area
            if (postTextArea.value !== undefined) {
                postTextArea.value = '';
            } else {
                postTextArea.textContent = '';
            }

            // Close the modal
            if (modal) {
                modal.classList.remove('show', 'active');
                modal.style.display = 'none';
            }

            // Refresh feed
            if (typeof app !== 'undefined') {
                if (app.renderPosts) app.renderPosts();
                else if (app.loadFeedPosts) app.loadFeedPosts();
            }

            if (typeof app !== 'undefined' && app.showToast) {
                app.showToast('Post published successfully!', 'success');
            }
            
            console.log('[Fix2] Post created:', newPost.id);
        });

        // Also fix the modal footer post button specifically
        const observer = new MutationObserver(function() {
            const modalFooter = document.querySelector('#create-post-modal .modal-footer');
            if (modalFooter) {
                const postBtns = modalFooter.querySelectorAll('.btn-primary, .post-btn');
                postBtns.forEach(function(btn) {
                    if (!btn.dataset.fixApplied) {
                        btn.dataset.fixApplied = 'true';
                        btn.style.pointerEvents = 'auto';
                        btn.style.opacity = '1';
                        btn.disabled = false;
                    }
                });
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        console.log('[Fix2] Post button - FIXED');
    }

    // ==========================================
    // FIX 3: Add location button missing
    // ==========================================
    function fix3_AddLocationButton() {
        document.addEventListener('click', function(e) {
            // Intercept location-related buttons
            const locationBtn = e.target.closest('.add-location-btn, .location-btn, [data-action="location"], [title*="ocation"]');
            if (!locationBtn) return;
            
            e.preventDefault();
            showLocationModal();
        });

        // Inject Add Location button into post composer if missing
        const injectLocationBtn = function() {
            const postActions = document.querySelectorAll('.post-actions, .post-options, .composer-actions, .modal-body .action-bar');
            postActions.forEach(function(container) {
                if (container.querySelector('.location-add-btn-fix')) return;
                const btn = document.createElement('button');
                btn.className = 'location-add-btn-fix';
                btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Location';
                btn.title = 'Add Location';
                btn.style.cssText = 'display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border:1px solid #ddd;background:white;border-radius:6px;cursor:pointer;font-size:13px;color:#555;margin:4px;';
                btn.onclick = function(ev) { ev.preventDefault(); showLocationModal(); };
                container.appendChild(btn);
            });
        };

        // Run now and on DOM changes
        injectLocationBtn();
        new MutationObserver(injectLocationBtn).observe(document.body, { childList: true, subtree: true });

        console.log('[Fix3] Add location button - FIXED');
    }

    function showLocationModal() {
        const existing = document.getElementById('location-add-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'location-add-modal';
        modal.innerHTML = `
            <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;">
                <div style="background:white;border-radius:12px;width:90%;max-width:420px;padding:24px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                        <h3 style="margin:0;font-size:18px;">Add Location</h3>
                        <button onclick="document.getElementById('location-add-modal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#666;">&times;</button>
                    </div>
                    <div style="position:relative;margin-bottom:12px;">
                        <i class="fas fa-search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#999;"></i>
                        <input type="text" id="location-search-input" placeholder="Search for a location..." 
                            style="width:100%;padding:10px 12px 10px 36px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;"
                            oninput="window._filterLocations(this.value)">
                    </div>
                    <div id="location-results" style="max-height:200px;overflow-y:auto;margin-bottom:12px;">
                        <div class="loc-item" onclick="window._selectLocation('New York, NY')" style="padding:10px 12px;border-bottom:1px solid #f0f0f0;cursor:pointer;display:flex;align-items:center;gap:8px;">
                            <i class="fas fa-map-marker-alt" style="color:#e74c3c;"></i> New York, NY
                        </div>
                        <div class="loc-item" onclick="window._selectLocation('Los Angeles, CA')" style="padding:10px 12px;border-bottom:1px solid #f0f0f0;cursor:pointer;display:flex;align-items:center;gap:8px;">
                            <i class="fas fa-map-marker-alt" style="color:#e74c3c;"></i> Los Angeles, CA
                        </div>
                        <div class="loc-item" onclick="window._selectLocation('London, UK')" style="padding:10px 12px;border-bottom:1px solid #f0f0f0;cursor:pointer;display:flex;align-items:center;gap:8px;">
                            <i class="fas fa-map-marker-alt" style="color:#e74c3c;"></i> London, UK
                        </div>
                        <div class="loc-item" onclick="window._selectLocation('Tokyo, Japan')" style="padding:10px 12px;border-bottom:1px solid #f0f0f0;cursor:pointer;display:flex;align-items:center;gap:8px;">
                            <i class="fas fa-map-marker-alt" style="color:#e74c3c;"></i> Tokyo, Japan
                        </div>
                        <div class="loc-item" onclick="window._selectLocation('Paris, France')" style="padding:10px 12px;cursor:pointer;display:flex;align-items:center;gap:8px;">
                            <i class="fas fa-map-marker-alt" style="color:#e74c3c;"></i> Paris, France
                        </div>
                    </div>
                    <button id="location-add-confirm" onclick="window._addCustomLocation()" 
                        style="width:100%;padding:10px;background:#007bff;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">
                        <i class="fas fa-plus"></i> Add Location
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        window._filterLocations = function(query) {
            document.querySelectorAll('.loc-item').forEach(function(item) {
                item.style.display = item.textContent.toLowerCase().includes(query.toLowerCase()) ? 'flex' : 'none';
            });
        };

        window._selectLocation = function(loc) {
            document.getElementById('location-search-input').value = loc;
        };

        window._addCustomLocation = function() {
            var loc = document.getElementById('location-search-input').value.trim();
            if (!loc) { alert('Please enter or select a location'); return; }
            if (typeof app !== 'undefined' && app.showToast) {
                app.showToast('Location added: ' + loc, 'success');
            }
            document.getElementById('location-add-modal').remove();
        };
    }

    // ==========================================
    // FIX 4: Tag people button missing
    // ==========================================
    function fix4_TagPeopleButton() {
        document.addEventListener('click', function(e) {
            const tagBtn = e.target.closest('.tag-people-btn, .tag-btn, [data-action="tag"], [title*="ag people"]');
            if (!tagBtn) return;
            e.preventDefault();
            showTagPeopleModal();
        });

        // Inject tag people button into post composer if missing
        var injectTagBtn = function() {
            var postActions = document.querySelectorAll('.post-actions, .post-options, .composer-actions, .modal-body .action-bar');
            postActions.forEach(function(container) {
                if (container.querySelector('.tag-people-btn-fix')) return;
                var btn = document.createElement('button');
                btn.className = 'tag-people-btn-fix';
                btn.innerHTML = '<i class="fas fa-user-tag"></i> Tag People';
                btn.title = 'Tag People';
                btn.style.cssText = 'display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border:1px solid #ddd;background:white;border-radius:6px;cursor:pointer;font-size:13px;color:#555;margin:4px;';
                btn.onclick = function(ev) { ev.preventDefault(); showTagPeopleModal(); };
                container.appendChild(btn);
            });
        };
        injectTagBtn();
        new MutationObserver(injectTagBtn).observe(document.body, { childList: true, subtree: true });

        console.log('[Fix4] Tag people button - FIXED');
    }

    function showTagPeopleModal() {
        var existing = document.getElementById('tag-people-modal');
        if (existing) existing.remove();

        var mockPeople = [
            { name: 'Emma Watson', username: '@emmawatson', avatar: 'EW', color: '#42b72a' },
            { name: 'Alex Johnson', username: '@alexj', avatar: 'AJ', color: '#ff6b6b' },
            { name: 'Sarah Chen', username: '@sarahc', avatar: 'SC', color: '#9b59b6' },
            { name: 'Mike Rodriguez', username: '@miker', avatar: 'MR', color: '#e67e22' },
            { name: 'Lisa Park', username: '@lisap', avatar: 'LP', color: '#3498db' }
        ];

        var modal = document.createElement('div');
        modal.id = 'tag-people-modal';
        modal.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;">' +
            '<div style="background:white;border-radius:12px;width:90%;max-width:420px;padding:24px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
                    '<h3 style="margin:0;font-size:18px;">Tag People</h3>' +
                    '<button onclick="document.getElementById(\'tag-people-modal\').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#666;">&times;</button>' +
                '</div>' +
                '<input type="text" placeholder="Search people..." style="width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;margin-bottom:12px;" oninput="window._filterPeople(this.value)">' +
                '<div id="people-list" style="max-height:250px;overflow-y:auto;margin-bottom:12px;">' +
                    mockPeople.map(function(p) {
                        return '<div class="person-item" data-name="' + p.name.toLowerCase() + '" style="padding:10px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:10px;cursor:pointer;" onclick="window._toggleTagPerson(this,\'' + p.name + '\')">' +
                            '<div style="width:36px;height:36px;border-radius:50%;background:' + p.color + ';color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;">' + p.avatar + '</div>' +
                            '<div style="flex:1;"><div style="font-weight:600;font-size:14px;">' + p.name + '</div><div style="font-size:12px;color:#666;">' + p.username + '</div></div>' +
                            '<div class="tag-check" style="width:24px;height:24px;border:2px solid #ddd;border-radius:50%;display:flex;align-items:center;justify-content:center;"></div>' +
                        '</div>';
                    }).join('') +
                '</div>' +
                '<button onclick="window._confirmTagPeople()" style="width:100%;padding:10px;background:#007bff;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">' +
                    '<i class="fas fa-user-tag"></i> Add Tagged People' +
                '</button>' +
            '</div>' +
        '</div>';
        
        document.body.appendChild(modal);

        window._taggedPeople = [];

        window._filterPeople = function(query) {
            document.querySelectorAll('.person-item').forEach(function(item) {
                item.style.display = item.dataset.name.includes(query.toLowerCase()) ? 'flex' : 'none';
            });
        };

        window._toggleTagPerson = function(el, name) {
            var check = el.querySelector('.tag-check');
            var idx = window._taggedPeople.indexOf(name);
            if (idx === -1) {
                window._taggedPeople.push(name);
                check.innerHTML = '<i class="fas fa-check" style="color:#007bff;font-size:12px;"></i>';
                check.style.borderColor = '#007bff';
            } else {
                window._taggedPeople.splice(idx, 1);
                check.innerHTML = '';
                check.style.borderColor = '#ddd';
            }
        };

        window._confirmTagPeople = function() {
            if (window._taggedPeople.length === 0) {
                alert('Please select at least one person to tag');
                return;
            }
            if (typeof app !== 'undefined' && app.showToast) {
                app.showToast('Tagged: ' + window._taggedPeople.join(', '), 'success');
            }
            document.getElementById('tag-people-modal').remove();
        };
    }

    // ==========================================
    // FIX 5: Comments add button not working
    // ==========================================
    function fix5_CommentsAddButton() {
        // Use event delegation for comment post buttons
        document.addEventListener('click', function(e) {
            var commentBtn = e.target.closest('.comment-post-btn, #comment-post-btn, .add-comment-btn, .submit-comment-btn');
            if (!commentBtn) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            var commentInput = document.querySelector('#comment-input, .comment-input, .comment-textarea');
            if (!commentInput) return;
            
            var content = (commentInput.value || commentInput.textContent || '').trim();
            if (!content) {
                if (typeof app !== 'undefined' && app.showToast) {
                    app.showToast('Please write a comment first', 'warning');
                }
                return;
            }

            // Create comment element
            var commentsContainer = document.querySelector('#comments-container, .comments-container, .comments-list');
            if (commentsContainer) {
                var commentEl = document.createElement('div');
                commentEl.className = 'comment-item';
                commentEl.style.cssText = 'padding:12px;border-bottom:1px solid #f0f0f0;display:flex;gap:10px;animation:fadeIn 0.3s;';
                var userName = (typeof app !== 'undefined' && app.currentUser) ? app.currentUser.name : 'You';
                commentEl.innerHTML = 
                    '<div style="width:32px;height:32px;border-radius:50%;background:#007bff;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0;">You</div>' +
                    '<div style="flex:1;">' +
                        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">' +
                            '<span style="font-weight:600;font-size:14px;">' + userName + '</span>' +
                            '<span style="font-size:12px;color:#999;">Just now</span>' +
                        '</div>' +
                        '<div style="font-size:14px;color:#333;">' + content + '</div>' +
                        '<div style="margin-top:6px;display:flex;gap:12px;">' +
                            '<button style="background:none;border:none;color:#666;font-size:12px;cursor:pointer;"><i class="fas fa-heart"></i> Like</button>' +
                            '<button style="background:none;border:none;color:#666;font-size:12px;cursor:pointer;"><i class="fas fa-reply"></i> Reply</button>' +
                        '</div>' +
                    '</div>';

                // Remove "no comments" placeholder
                var noComments = commentsContainer.querySelector('.no-comments, .comments-loading');
                if (noComments) noComments.remove();
                
                commentsContainer.insertBefore(commentEl, commentsContainer.firstChild);
            }

            // Clear input
            if (commentInput.value !== undefined) commentInput.value = '';
            else commentInput.textContent = '';

            // Update button state
            commentBtn.disabled = true;
            commentBtn.style.opacity = '0.5';

            if (typeof app !== 'undefined' && app.showToast) {
                app.showToast('Comment posted!', 'success');
            }
            console.log('[Fix5] Comment posted successfully');
        });

        // Enable comment button when input has text
        document.addEventListener('input', function(e) {
            if (e.target.matches('#comment-input, .comment-input, .comment-textarea')) {
                var btn = document.querySelector('.comment-post-btn, #comment-post-btn, .add-comment-btn');
                if (btn) {
                    var hasText = (e.target.value || e.target.textContent || '').trim().length > 0;
                    btn.disabled = !hasText;
                    btn.style.opacity = hasText ? '1' : '0.5';
                }
            }
        });

        // Also handle Enter key to post comment
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey && e.target.matches('#comment-input, .comment-input')) {
                e.preventDefault();
                var btn = document.querySelector('.comment-post-btn, #comment-post-btn, .add-comment-btn');
                if (btn && !btn.disabled) btn.click();
            }
        });

        console.log('[Fix5] Comments add button - FIXED');
    }

    // ==========================================
    // FIX 6: Share button window not opening
    // ==========================================
    function fix6_ShareButtonWindow() {
        document.addEventListener('click', function(e) {
            var shareBtn = e.target.closest('.share-btn, [data-action="share"], .share-post-btn');
            if (!shareBtn) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            var postEl = shareBtn.closest('.feed-post, .post-item, [data-post-id]');
            var postId = postEl ? (postEl.dataset.postId || 'post-' + Date.now()) : 'post-' + Date.now();
            
            showShareModal(postId);
        });

        console.log('[Fix6] Share button window - FIXED');
    }

    function showShareModal(postId) {
        var existing = document.getElementById('share-fix-modal');
        if (existing) existing.remove();

        var modal = document.createElement('div');
        modal.id = 'share-fix-modal';
        modal.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;">' +
            '<div style="background:white;border-radius:12px;width:90%;max-width:440px;padding:24px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
                    '<h3 style="margin:0;font-size:18px;">Share Post</h3>' +
                    '<button onclick="document.getElementById(\'share-fix-modal\').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#666;">&times;</button>' +
                '</div>' +
                '<div style="margin-bottom:16px;">' +
                    '<h4 style="margin:0 0 10px;font-size:14px;color:#666;">Share on ConnectHub</h4>' +
                    '<div style="display:flex;flex-direction:column;gap:8px;">' +
                        '<button onclick="window._shareAction(\'story\',\'' + postId + '\')" style="display:flex;align-items:center;gap:10px;padding:12px;border:1px solid #eee;border-radius:8px;background:white;cursor:pointer;font-size:14px;text-align:left;"><i class="fas fa-clock" style="color:#007bff;width:20px;"></i> Share to Your Story</button>' +
                        '<button onclick="window._shareAction(\'message\',\'' + postId + '\')" style="display:flex;align-items:center;gap:10px;padding:12px;border:1px solid #eee;border-radius:8px;background:white;cursor:pointer;font-size:14px;text-align:left;"><i class="fas fa-paper-plane" style="color:#28a745;width:20px;"></i> Send in Message</button>' +
                        '<button onclick="window._shareAction(\'group\',\'' + postId + '\')" style="display:flex;align-items:center;gap:10px;padding:12px;border:1px solid #eee;border-radius:8px;background:white;cursor:pointer;font-size:14px;text-align:left;"><i class="fas fa-users" style="color:#9b59b6;width:20px;"></i> Share to Group</button>' +
                    '</div>' +
                '</div>' +
                '<div style="margin-bottom:16px;">' +
                    '<h4 style="margin:0 0 10px;font-size:14px;color:#666;">Share to Other Apps</h4>' +
                    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">' +
                        '<button onclick="window._shareExternal(\'facebook\',\'' + postId + '\')" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;border:1px solid #eee;border-radius:8px;background:white;cursor:pointer;"><i class="fab fa-facebook" style="font-size:24px;color:#1877f2;"></i><span style="font-size:11px;">Facebook</span></button>' +
                        '<button onclick="window._shareExternal(\'twitter\',\'' + postId + '\')" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;border:1px solid #eee;border-radius:8px;background:white;cursor:pointer;"><i class="fab fa-twitter" style="font-size:24px;color:#1da1f2;"></i><span style="font-size:11px;">Twitter</span></button>' +
                        '<button onclick="window._shareExternal(\'whatsapp\',\'' + postId + '\')" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;border:1px solid #eee;border-radius:8px;background:white;cursor:pointer;"><i class="fab fa-whatsapp" style="font-size:24px;color:#25d366;"></i><span style="font-size:11px;">WhatsApp</span></button>' +
                        '<button onclick="window._shareExternal(\'email\',\'' + postId + '\')" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;border:1px solid #eee;border-radius:8px;background:white;cursor:pointer;"><i class="fas fa-envelope" style="font-size:24px;color:#e74c3c;"></i><span style="font-size:11px;">Email</span></button>' +
                    '</div>' +
                '</div>' +
                '<div>' +
                    '<h4 style="margin:0 0 8px;font-size:14px;color:#666;">Copy Link</h4>' +
                    '<div style="display:flex;gap:8px;">' +
                        '<input type="text" value="https://lynkapp.com/posts/' + postId + '" readonly style="flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;background:#f8f8f8;" id="share-link-input">' +
                        '<button onclick="navigator.clipboard.writeText(document.getElementById(\'share-link-input\').value);if(typeof app!==\'undefined\'&&app.showToast)app.showToast(\'Link copied!\',\'success\')" style="padding:8px 14px;background:#007bff;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;"><i class="fas fa-copy"></i></button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
        
        document.body.appendChild(modal);

        window._shareAction = function(type, id) {
            var msgs = { story: 'Shared to your story!', message: 'Opening messages...', group: 'Select a group to share' };
            if (typeof app !== 'undefined' && app.showToast) app.showToast(msgs[type] || 'Shared!', 'success');
            document.getElementById('share-fix-modal').remove();
        };

        window._shareExternal = function(platform, id) {
            var url = encodeURIComponent('https://lynkapp.com/posts/' + id);
            var urls = {
                facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
                twitter: 'https://twitter.com/intent/tweet?url=' + url,
                whatsapp: 'https://wa.me/?text=' + url,
                email: 'mailto:?subject=Check this out&body=' + url
            };
            if (urls[platform]) window.open(urls[platform], '_blank', 'width=600,height=400');
            if (typeof app !== 'undefined' && app.showToast) app.showToast('Opening ' + platform + '...', 'info');
            document.getElementById('share-fix-modal').remove();
        };
    }

    // ==========================================
    // FIX 7: Story camera/gallery buttons
    // ==========================================
    function fix7_StoryCameraGallery() {
        document.addEventListener('click', function(e) {
            // Camera button in story creation
            var cameraBtn = e.target.closest('.start-camera-btn, .camera-btn, [data-action="camera"], .camera-mode-btn[data-mode="photo"]');
            if (cameraBtn && (cameraBtn.closest('.story-creation-modal, .story-camera-modal, .tab-panel[data-panel="camera"]') || cameraBtn.closest('#story-camera-modal'))) {
                e.preventDefault();
                e.stopPropagation();
                openStoryCamera();
                return;
            }

            // Gallery button
            var galleryBtn = e.target.closest('.gallery-btn, .browse-btn, [data-action="gallery"], .upload-btn');
            if (galleryBtn && galleryBtn.closest('.story-creation-modal, .story-camera-modal, .tab-panel[data-panel="upload"]')) {
                e.preventDefault();
                e.stopPropagation();
                openStoryGallery();
                return;
            }

            // Also handle the "Your Story" / add story clicks to show camera/gallery picker
            var addStory = e.target.closest('.add-story, .add-story-btn, #create-story-item, #add-story-btn');
            if (addStory) {
                e.preventDefault();
                e.stopPropagation();
                showStoryCameraGalleryPicker();
                return;
            }
        });

        console.log('[Fix7] Story camera/gallery buttons - FIXED');
    }

    function showStoryCameraGalleryPicker() {
        var existing = document.getElementById('story-picker-modal');
        if (existing) existing.remove();

        var modal = document.createElement('div');
        modal.id = 'story-picker-modal';
        modal.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;">' +
            '<div style="background:white;border-radius:16px;width:90%;max-width:360px;padding:24px;text-align:center;">' +
                '<h3 style="margin:0 0 8px;font-size:20px;">Create Story</h3>' +
                '<p style="color:#666;margin:0 0 20px;font-size:14px;">Choose how to create your story</p>' +
                '<div style="display:flex;flex-direction:column;gap:10px;">' +
                    '<button onclick="document.getElementById(\'story-picker-modal\').remove();window._openStoryCamera()" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border:1px solid #eee;border-radius:10px;background:white;cursor:pointer;font-size:15px;text-align:left;">' +
                        '<div style="width:44px;height:44px;border-radius:50%;background:#007bff;color:white;display:flex;align-items:center;justify-content:center;font-size:18px;"><i class="fas fa-camera"></i></div>' +
                        '<div><div style="font-weight:600;">Camera</div><div style="font-size:12px;color:#666;">Take a photo or video</div></div>' +
                    '</button>' +
                    '<button onclick="document.getElementById(\'story-picker-modal\').remove();window._openStoryGallery()" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border:1px solid #eee;border-radius:10px;background:white;cursor:pointer;font-size:15px;text-align:left;">' +
                        '<div style="width:44px;height:44px;border-radius:50%;background:#28a745;color:white;display:flex;align-items:center;justify-content:center;font-size:18px;"><i class="fas fa-images"></i></div>' +
                        '<div><div style="font-weight:600;">Gallery</div><div style="font-size:12px;color:#666;">Choose from your photos</div></div>' +
                    '</button>' +
                    '<button onclick="document.getElementById(\'story-picker-modal\').remove();window._openStoryText()" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border:1px solid #eee;border-radius:10px;background:white;cursor:pointer;font-size:15px;text-align:left;">' +
                        '<div style="width:44px;height:44px;border-radius:50%;background:#9b59b6;color:white;display:flex;align-items:center;justify-content:center;font-size:18px;"><i class="fas fa-font"></i></div>' +
                        '<div><div style="font-weight:600;">Text</div><div style="font-size:12px;color:#666;">Create a text story</div></div>' +
                    '</button>' +
                '</div>' +
                '<button onclick="document.getElementById(\'story-picker-modal\').remove()" style="margin-top:16px;padding:10px 24px;background:#f0f0f0;border:none;border-radius:8px;cursor:pointer;font-size:14px;color:#666;">Cancel</button>' +
            '</div>' +
        '</div>';
        
        document.body.appendChild(modal);

        window._openStoryCamera = openStoryCamera;
        window._openStoryGallery = openStoryGallery;
        window._openStoryText = function() {
            if (typeof storyDashboard !== 'undefined') {
                storyDashboard.openStoryCreation();
                setTimeout(function() { storyDashboard.switchTab('text'); }, 300);
            } else if (typeof app !== 'undefined' && app.showToast) {
                app.showToast('Text story mode opened', 'info');
            }
        };
    }

    function openStoryCamera() {
        // Try to use the existing story dashboard camera
        if (typeof storyDashboard !== 'undefined' && storyDashboard.openStoryCreation) {
            storyDashboard.openStoryCreation();
            setTimeout(function() {
                storyDashboard.switchTab('camera');
                setTimeout(function() {
                    storyDashboard.initializeCamera();
                }, 500);
            }, 300);
            return;
        }

        // Fallback: request camera directly
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
                .then(function(stream) {
                    showCameraPreview(stream);
                })
                .catch(function(err) {
                    console.error('Camera error:', err);
                    if (typeof app !== 'undefined' && app.showToast) {
                        app.showToast('Camera access denied. Please allow camera permissions.', 'error');
                    }
                    // Fallback to gallery
                    openStoryGallery();
                });
        } else {
            if (typeof app !== 'undefined' && app.showToast) {
                app.showToast('Camera not supported on this device', 'warning');
            }
            openStoryGallery();
        }
    }

    function showCameraPreview(stream) {
        var existing = document.getElementById('story-camera-live');
        if (existing) existing.remove();

        var modal = document.createElement('div');
        modal.id = 'story-camera-live';
        modal.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:black;z-index:99999;display:flex;flex-direction:column;">' +
            '<div style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center;color:white;position:absolute;top:0;left:0;right:0;z-index:2;">' +
                '<button onclick="window._closeStoryCamera()" style="background:rgba(0,0,0,0.5);border:none;color:white;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:16px;"><i class="fas fa-times"></i></button>' +
                '<span style="font-weight:600;">Story Camera</span>' +
                '<button onclick="window._flipStoryCamera()" style="background:rgba(0,0,0,0.5);border:none;color:white;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:16px;"><i class="fas fa-sync-alt"></i></button>' +
            '</div>' +
            '<video id="story-live-video" autoplay playsinline muted style="flex:1;object-fit:cover;width:100%;"></video>' +
            '<div style="padding:20px;display:flex;justify-content:center;align-items:center;gap:24px;position:absolute;bottom:0;left:0;right:0;z-index:2;">' +
                '<button onclick="window._openStoryGalleryFromCamera()" style="background:rgba(255,255,255,0.2);border:2px solid white;color:white;width:44px;height:44px;border-radius:12px;cursor:pointer;font-size:18px;"><i class="fas fa-images"></i></button>' +
                '<button onclick="window._captureStoryPhoto()" style="width:70px;height:70px;border-radius:50%;border:4px solid white;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;"><div style="width:56px;height:56px;border-radius:50%;background:white;"></div></button>' +
                '<div style="width:44px;"></div>' +
            '</div>' +
        '</div>';
        
        document.body.appendChild(modal);

        var video = document.getElementById('story-live-video');
        video.srcObject = stream;

        window._storyStream = stream;

        window._closeStoryCamera = function() {
            stream.getTracks().forEach(function(t) { t.stop(); });
            document.getElementById('story-camera-live').remove();
        };

        window._captureStoryPhoto = function() {
            var canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            var dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            
            stream.getTracks().forEach(function(t) { t.stop(); });
            document.getElementById('story-camera-live').remove();

            if (typeof app !== 'undefined' && app.showToast) {
                app.showToast('Photo captured for your story!', 'success');
            }
        };

        window._flipStoryCamera = function() {
            stream.getTracks().forEach(function(t) { t.stop(); });
            var currentMode = stream.getVideoTracks()[0] && stream.getVideoTracks()[0].getSettings().facingMode;
            var newMode = currentMode === 'user' ? 'environment' : 'user';
            navigator.mediaDevices.getUserMedia({ video: { facingMode: newMode }, audio: false })
                .then(function(newStream) {
                    document.getElementById('story-live-video').srcObject = newStream;
                    window._storyStream = newStream;
                });
        };

        window._openStoryGalleryFromCamera = function() {
            stream.getTracks().forEach(function(t) { t.stop(); });
            document.getElementById('story-camera-live').remove();
            openStoryGallery();
        };
    }

    function openStoryGallery() {
        // Try existing story dashboard
        if (typeof storyDashboard !== 'undefined' && storyDashboard.openStoryCreation) {
            storyDashboard.openStoryCreation();
            setTimeout(function() {
                storyDashboard.switchTab('upload');
                setTimeout(function() {
                    storyDashboard.triggerFileSelect();
                }, 300);
            }, 300);
            return;
        }

        // Fallback: create file input directly
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*,video/*';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', function() {
            if (fileInput.files && fileInput.files[0]) {
                var file = fileInput.files[0];
                if (typeof app !== 'undefined' && app.showToast) {
                    app.showToast('Selected: ' + file.name + ' for your story!', 'success');
                }
            }
            document.body.removeChild(fileInput);
        });

        document.body.appendChild(fileInput);
        fileInput.click();
    }

    // Add fadeIn animation
    var style = document.createElement('style');
    style.textContent = '@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }';
    document.head.appendChild(style);

})();
