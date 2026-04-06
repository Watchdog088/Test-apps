/**
 * Lynkapp Production – User Testing Bug Fixes  (v2 – corrected element targets)
 * Target: LynkApp-Production-App/index.html
 *
 * Fixes 7 critical issues reported during user testing:
 *  1. Account creation → force full profile setup wizard after signup
 *  2. "Post" button in Create Post not working  (targets #postTextContent)
 *  3. No "Add Location" confirm button in the location picker
 *  4. No "Add Person" confirm button in the Tag People picker
 *  5. Comments Add/Post button not submitting comments
 *  6. Share button opens nothing – now opens share-options window
 *  7. Create Story camera & gallery buttons do nothing
 */

(function () {
    'use strict';

    console.log('[UserTestingFixes v2] Loading – all 7 fixes targeting correct element IDs…');

    // ── helpers ──────────────────────────────────────────────────────────────
    function toast(msg) {
        if (typeof showToast === 'function') { showToast(msg); return; }
        var t = document.createElement('div');
        t.textContent = msg;
        t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 20px;border-radius:20px;z-index:999999;font-size:14px;pointer-events:none;';
        document.body.appendChild(t);
        setTimeout(function () { t.remove(); }, 2500);
    }

    function openM(id) { if (typeof openModal === 'function') { openModal(id); } }
    function closeM(id) { if (typeof closeModal === 'function') { closeModal(id); } }

    // Run after the app scripts have fully initialised
    function init() {
        fix1_ProfileSetupAfterSignup();
        fix2_PostButton();
        fix3_AddLocationButton();
        fix4_TagPeopleButton();
        fix5_CommentsAddButton();
        fix6_ShareButtonWindow();
        fix7_StoryCameraGallery();
        injectGlobalStyles();
        console.log('[UserTestingFixes v2] ✅ All 7 fixes applied.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 1500); });
    } else {
        setTimeout(init, 1500);
    }

    // =========================================================================
    // FIX 1 – Full profile setup wizard after account creation
    // =========================================================================
    function fix1_ProfileSetupAfterSignup() {
        // Works for both the Firebase auth flow and any direct submit on #authForm
        // Strategy: watch for the auth screen hiding / feed screen appearing, then
        // show the wizard if the user hasn't completed it yet.

        function maybeShowWizard() {
            var done = localStorage.getItem('lynkapp_profile_completed');
            if (done) return;
            // Small extra delay so the main app can finish its own transitions
            setTimeout(showProfileWizard, 800);
        }

        // Hook into handleAuthSubmit (register mode)
        var _orig = window.handleAuthSubmit;
        window.handleAuthSubmit = function (e) {
            var isRegister = !!document.querySelector('.auth-tab.active[data-mode="register"], #registerTab.active, .tab-btn.active[onclick*="register"]');
            if (typeof _orig === 'function') _orig.call(this, e);
            if (isRegister) { setTimeout(maybeShowWizard, 2200); }
        };

        // Hook handleRegister() – called directly by the HTML "Create Account" button
        var _origReg = window.handleRegister;
        window.handleRegister = function () {
            if (typeof _origReg === 'function') _origReg.apply(this, arguments);
            setTimeout(maybeShowWizard, 2200);
        };

        // Also catch any button whose text is "Create Account" / "Sign Up"
        document.addEventListener('click', function (e) {
            var btn = e.target.closest('button, [type="submit"]');
            if (!btn) return;
            var txt = btn.textContent.toLowerCase();
            if ((txt.includes('create account') || txt.includes('sign up') || txt.includes('register')) && !localStorage.getItem('lynkapp_profile_completed')) {
                setTimeout(maybeShowWizard, 2200);
            }
        }, true);

        console.log('[Fix 1] ✅ Profile setup wizard hooked.');
    }

    function showProfileWizard() {
        if (document.getElementById('ut-profile-wizard')) return;

        var overlay = document.createElement('div');
        overlay.id = 'ut-profile-wizard';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:999990;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';

        var interests = ['Photography','Travel','Music','Art','Tech','Sports','Food','Fashion','Gaming','Fitness','Movies','Books','Nature','Science','Design','Business'];
        var gradients = ['linear-gradient(135deg,#6366f1,#8b5cf6)','linear-gradient(135deg,#ef4444,#f59e0b)','linear-gradient(135deg,#10b981,#06b6d4)','linear-gradient(135deg,#ec4899,#f472b6)','linear-gradient(135deg,#3b82f6,#60a5fa)','linear-gradient(135deg,#f59e0b,#fbbf24)'];

        overlay.innerHTML =
            '<div style="background:var(--bg-card,#1e1e2e);border:1px solid var(--glass-border,#333);border-radius:20px;width:100%;max-width:460px;max-height:92vh;overflow-y:auto;padding:28px;color:var(--text-primary,#fff);">' +

            // ── STEP 1 ──────────────────────────────────────────────────────
            '<div id="wiz-s1">' +
                '<div style="text-align:center;margin-bottom:22px;">' +
                    '<div style="font-size:54px;margin-bottom:8px;">👤</div>' +
                    '<h2 style="margin:0 0 4px;font-size:22px;font-weight:700;">Complete Your Profile</h2>' +
                    '<p style="margin:0;font-size:13px;color:var(--text-secondary,#aaa);">Step 1 of 2 – Tell us about yourself</p>' +
                '</div>' +

                // Avatar upload
                '<div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">' +
                    '<div id="wiz-avatar" style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,var(--primary,#6366f1),var(--secondary,#ec4899));display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:#fff;overflow:hidden;flex-shrink:0;border:3px solid var(--glass-border,#444);">JD</div>' +
                    '<div>' +
                        '<button onclick="document.getElementById(\'wiz-photo-input\').click()" style="padding:9px 16px;background:var(--primary,#6366f1);color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;">📷 Upload Photo</button>' +
                        '<input id="wiz-photo-input" type="file" accept="image/*" hidden onchange="(function(f){if(!f)return;var r=new FileReader();r.onload=function(e){var av=document.getElementById(\'wiz-avatar\');av.innerHTML=\'<img src=\\\'\'+e.target.result+\'\\\' style=width:100%;height:100%;object-fit:cover>\'};r.readAsDataURL(f)})(this.files[0])">' +
                        '<div style="font-size:11px;color:var(--text-secondary,#888);margin-top:4px;">JPG, PNG or GIF</div>' +
                    '</div>' +
                '</div>' +

                inputField('wiz-name','text','Display Name *','Your full name') +
                inputField('wiz-username','text','Username *','@username') +
                textareaField('wiz-bio','Bio','Tell people a little about yourself…') +
                inputField('wiz-location','text','Location','City, Country (optional)') +

                '<button onclick="window._wizNext()" style="width:100%;padding:14px;background:linear-gradient(135deg,var(--primary,#6366f1),var(--secondary,#ec4899));color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;margin-top:6px;">Next →</button>' +
            '</div>' +

            // ── STEP 2 ──────────────────────────────────────────────────────
            '<div id="wiz-s2" style="display:none;">' +
                '<div style="text-align:center;margin-bottom:22px;">' +
                    '<div style="font-size:54px;margin-bottom:8px;">⭐</div>' +
                    '<h2 style="margin:0 0 4px;font-size:22px;font-weight:700;">Your Interests</h2>' +
                    '<p style="margin:0;font-size:13px;color:var(--text-secondary,#aaa);">Step 2 of 2 – Pick topics you love (select any)</p>' +
                '</div>' +
                '<div id="wiz-interests" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">' +
                    interests.map(function (i) {
                        return '<button class="wiz-int-btn" onclick="this.classList.toggle(\'sel\');this.style.background=this.classList.contains(\'sel\')?\'var(--primary,#6366f1)\':\'var(--glass,#2a2a3e)\';this.style.borderColor=this.classList.contains(\'sel\')?\'var(--primary,#6366f1)\':\'var(--glass-border,#444)\';" style="padding:8px 16px;background:var(--glass,#2a2a3e);border:1px solid var(--glass-border,#444);border-radius:20px;cursor:pointer;font-size:13px;color:var(--text-primary,#fff);transition:all 0.2s;">' + i + '</button>';
                    }).join('') +
                '</div>' +

                // Background style
                '<div style="margin-bottom:18px;">' +
                    '<p style="font-size:13px;color:var(--text-secondary,#aaa);margin-bottom:8px;">Profile background style</p>' +
                    '<div style="display:flex;gap:10px;">' +
                        gradients.map(function (g) {
                            return '<button onclick="window._wizGrad=\'' + g + '\';this.parentElement.querySelectorAll(\'button\').forEach(function(b){b.style.outline=\'none\'});this.style.outline=\'3px solid white\';" style="width:40px;height:40px;border-radius:50%;background:' + g + ';border:none;cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform=\'scale(1.1)\'" onmouseout="this.style.transform=\'scale(1)\'"></button>';
                        }).join('') +
                    '</div>' +
                '</div>' +

                inputField('wiz-dob','date','Date of Birth','') +

                '<div style="display:flex;gap:10px;">' +
                    '<button onclick="document.getElementById(\'wiz-s2\').style.display=\'none\';document.getElementById(\'wiz-s1\').style.display=\'block\'" style="flex:1;padding:14px;background:var(--glass,#2a2a3e);color:var(--text-primary,#fff);border:1px solid var(--glass-border,#444);border-radius:12px;font-size:14px;cursor:pointer;">← Back</button>' +
                    '<button onclick="window._wizComplete()" style="flex:2;padding:14px;background:linear-gradient(135deg,#10b981,#06b6d4);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;">✓ Complete Setup</button>' +
                '</div>' +
            '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        window._wizGrad = gradients[0];

        window._wizNext = function () {
            var name = (document.getElementById('wiz-name') || {}).value || '';
            var user = (document.getElementById('wiz-username') || {}).value || '';
            if (!name.trim() || !user.trim()) { toast('Please enter your name and username'); return; }
            document.getElementById('wiz-s1').style.display = 'none';
            document.getElementById('wiz-s2').style.display = 'block';
        };

        window._wizComplete = function () {
            var sel = document.querySelectorAll('.wiz-int-btn.sel');
            var interests = Array.from(sel).map(function (b) { return b.textContent; });
            localStorage.setItem('lynkapp_profile_completed', 'true');
            localStorage.setItem('lynkapp_display_name', (document.getElementById('wiz-name') || {}).value || '');
            localStorage.setItem('lynkapp_username', (document.getElementById('wiz-username') || {}).value || '');
            localStorage.setItem('lynkapp_bio', (document.getElementById('wiz-bio') || {}).value || '');
            localStorage.setItem('lynkapp_location', (document.getElementById('wiz-location') || {}).value || '');
            localStorage.setItem('lynkapp_interests', interests.join(','));
            localStorage.setItem('lynkapp_dob', (document.getElementById('wiz-dob') || {}).value || '');
            var wiz = document.getElementById('ut-profile-wizard');
            if (wiz) wiz.remove();
            toast('🎉 Profile complete! Welcome to Lynkapp!');
        };
    }

    function inputField(id, type, label, placeholder) {
        return '<div style="margin-bottom:14px;">' +
            '<label style="display:block;font-size:12px;color:var(--text-secondary,#aaa);margin-bottom:5px;">' + label + '</label>' +
            '<input id="' + id + '" type="' + type + '" placeholder="' + placeholder + '" style="width:100%;padding:12px;background:var(--glass,#2a2a3e);border:1px solid var(--glass-border,#444);border-radius:10px;color:var(--text-primary,#fff);font-size:14px;box-sizing:border-box;outline:none;">' +
        '</div>';
    }
    function textareaField(id, label, placeholder) {
        return '<div style="margin-bottom:14px;">' +
            '<label style="display:block;font-size:12px;color:var(--text-secondary,#aaa);margin-bottom:5px;">' + label + '</label>' +
            '<textarea id="' + id + '" placeholder="' + placeholder + '" rows="3" style="width:100%;padding:12px;background:var(--glass,#2a2a3e);border:1px solid var(--glass-border,#444);border-radius:10px;color:var(--text-primary,#fff);font-size:14px;box-sizing:border-box;resize:vertical;outline:none;"></textarea>' +
        '</div>';
    }

    // =========================================================================
    // FIX 2 – "Post" / "Publish" button in Create Post
    //   Same pattern as Fix 5 (comments): hook openModal → find existing button
    //   → style it → wire onclick. No duplicate buttons created.
    // =========================================================================
    function fix2_PostButton() {
        // Hook openModal so we style+wire the existing Post button each time the modal opens
        var _om2 = window.openModal;
        window.openModal = function (id) {
            _om2.call(this, id);
            if (id === 'createPost') {
                setTimeout(wirePostButton, 150);
            }
        };

        // Also catch any direct openCreatePost / createNewPost callers
        var _origCNP = window.openCreatePost || window.createNewPost;
        if (typeof _origCNP === 'function') {
            window.openCreatePost = window.createNewPost = function () {
                _origCNP.call(this);
                setTimeout(wirePostButton, 250);
            };
        }

        // ── style + wire the existing Post button (like styleCommentInput for comments) ──
        function wirePostButton() {
            var modal = document.getElementById('createPostModal');
            if (!modal || modal.dataset.utPostWired) return;
            modal.dataset.utPostWired = '1';

            // Style the existing textarea
            var ta = modal.querySelector('#postTextContent, #postContent, textarea');
            if (ta) {
                Object.assign(ta.style, {
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    minHeight: '100px'
                });
            }

            // Find the existing Post button by onclick attribute or button text
            var postBtn = modal.querySelector('[onclick*="publishPost"],[onclick*="createPost"],[onclick*="submitPost"]');
            if (!postBtn) {
                modal.querySelectorAll('button').forEach(function (b) {
                    var t = b.textContent.trim().toLowerCase();
                    if (!postBtn && (t === 'post' || t === 'publish' || t === 'share' || t === 'create post')) {
                        postBtn = b;
                    }
                });
            }

            if (postBtn && !postBtn.dataset.utWired) {
                postBtn.dataset.utWired = '1'; // prevent duplicate listeners on re-opens
                // Style it like the comment send button (gradient, rounded pill)
                postBtn.style.cssText =
                    'padding:12px 32px;background:linear-gradient(135deg,var(--primary,#6366f1),var(--secondary,#ec4899));' +
                    'color:#fff;border:none;border-radius:25px;font-size:0.95rem;font-weight:600;' +
                    'cursor:pointer;min-width:100px;transition:opacity 0.15s;';
                postBtn.onmouseover = function () { this.style.opacity = '0.85'; };
                postBtn.onmouseout  = function () { this.style.opacity = '1'; };
                // Remove any old onclick, wire directly
                postBtn.removeAttribute('onclick');
                postBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    doPublishPost(modal);
                });
            }
        }

        // ── the actual publish action (mirrors submitComment exactly) ──────────
        function doPublishPost(modal) {
            var ta   = modal ? (modal.querySelector('#postTextContent, #postContent, textarea')) : document.getElementById('postTextContent');
            var text = ta ? ta.value.trim() : '';

            var hasPhoto    = !!window._ut_postPhoto;
            var hasLocation = !!window._ut_postLocation;
            var hasTags     = !!(window._ut_postTags && window._ut_postTags.length);

            if (!text && !hasPhoto && !hasLocation) {
                toast('Please write something before posting');
                return;
            }

            var postId = 'post-' + Date.now();

            var locationBadge = hasLocation
                ? '<span style="font-size:0.82rem;color:var(--text-secondary);margin-left:6px;">📍 ' + window._ut_postLocation + '</span>'
                : '';
            var tagBadge = hasTags
                ? '<span style="font-size:0.82rem;color:var(--primary);margin-left:6px;">— with ' + window._ut_postTags.join(', ') + '</span>'
                : '';
            var photoBlock = hasPhoto
                ? '<div style="margin:12px 0;border-radius:14px;overflow:hidden;height:220px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:4rem;">📸</div>'
                : '';
            var safeText = text
                ? text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')
                : '';

            var cardHTML =
                '<div id="' + postId + '" class="post-card" style="animation:utFadeUp 0.4s ease;">' +
                    '<div class="post-header">' +
                        '<div class="post-avatar" style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--primary,#6366f1),var(--secondary,#ec4899));display:flex;align-items:center;justify-content:center;font-size:0.88rem;font-weight:700;color:#fff;flex-shrink:0;">JD</div>' +
                        '<div class="post-header-info">' +
                            '<div class="post-author" style="font-weight:600;">You' + locationBadge + tagBadge + '</div>' +
                            '<div class="post-meta" style="font-size:0.8rem;color:var(--text-secondary);">Just now · 🌍 Public</div>' +
                        '</div>' +
                    '</div>' +
                    (safeText ? '<div class="post-content" style="padding:12px 0;line-height:1.55;">' + safeText + '</div>' : '') +
                    photoBlock +
                    '<div class="post-actions">' +
                        '<div class="post-action" onclick="window._utToggleLike(this)" style="cursor:pointer;"><span>👍</span> Like</div>' +
                        '<div class="post-action" onclick="window.openModal(\'comments\')" style="cursor:pointer;"><span>💬</span> Comment</div>' +
                        '<div class="post-action" onclick="window.sharePost()" style="cursor:pointer;"><span>🔄</span> Share</div>' +
                    '</div>' +
                '</div>';

            // Inject at the top of the feed – try all known containers
            var feedEl = document.getElementById('feedContainer') ||
                         document.getElementById('feed-screen') ||
                         document.getElementById('postsContainer') ||
                         document.querySelector('.feed-container') ||
                         document.querySelector('.posts-list') ||
                         (document.querySelector('.post-card') && document.querySelector('.post-card').parentElement);

            if (feedEl) {
                var firstCard = feedEl.querySelector('.post-card, .card, article');
                var tmp = document.createElement('div');
                tmp.innerHTML = cardHTML;
                var newCard = tmp.firstElementChild;
                if (firstCard) {
                    feedEl.insertBefore(newCard, firstCard);
                } else {
                    feedEl.insertAdjacentElement('afterbegin', newCard);
                }
            }

            // Reset form state (mirrors comment reset)
            if (ta) ta.value = '';
            window._ut_postPhoto    = null;
            window._ut_postLocation = null;
            window._ut_postTags     = null;
            // NOTE: do NOT reset utPostWired – the event listener stays on the button
            document.querySelectorAll('.ut-attach-badge').forEach(function (el) { el.remove(); });

            closeM('createPost');
            toast('🎉 Post published!');
        }

        // Expose globally – covers ALL onclick variants used in the HTML
        window.publishPost = function () {
            var modal = document.getElementById('createPostModal');
            doPublishPost(modal);
        };
        // The HTML Post button calls submitActualPost() – wire it here so it works
        // even before wirePostButton() has run on first modal open
        window.submitActualPost = function () {
            var modal = document.getElementById('createPostModal');
            doPublishPost(modal);
        };

        // ── helpers used by newly created post cards ──────────────────────────
        window._utToggleLike = function (el) {
            el.classList.toggle('active');
            var s = el.querySelector('span');
            s.textContent = el.classList.contains('active') ? '❤️' : '👍';
            el.style.color = el.classList.contains('active') ? 'var(--error,#ef4444)' : '';
        };

        console.log('[Fix 2] ✅ Post button wired to existing HTML element (same pattern as comments).');
    }

    function createEl(html) {
        var d = document.createElement('div');
        d.innerHTML = html;
        return d.firstElementChild;
    }

    // =========================================================================
    // FIX 3 – "Add Location" confirm button in the location picker
    // =========================================================================
    function fix3_AddLocationButton() {
        // The location modal already exists as #selectLocationModal.
        // Pre-defined items call selectLocation(place) which works fine.
        // What's missing: a text input + "Add Location" button for custom entries.
        // We inject them into the modal once it opens.

        // Override addLocationToPost so we can also inject UI enhancements
        var _orig = window.addLocationToPost || function () { openM('selectLocation'); };
        window.addLocationToPost = function () {
            _orig.call(this);
            // After the modal opens, inject our input+button if not already there
            setTimeout(injectLocationInput, 120);
        };

        // Also intercept openModal so the injection fires every time
        var _om = window.openModal;
        window.openModal = function (id) {
            _om.call(this, id);
            if (id === 'selectLocation') {
                setTimeout(injectLocationInput, 120);
            }
        };

        // Override selectLocation so it also saves to our state variable
        var _origSL = window.selectLocation;
        window.selectLocation = function (location) {
            window._ut_postLocation = location;
            if (typeof _origSL === 'function') _origSL.call(this, location);
            // Show badge in create-post modal
            showAttachBadge('📍 ' + location, 'location');
            toast('📍 Location added: ' + location);
        };

        console.log('[Fix 3] ✅ Location picker enhanced with input + confirm button.');
    }

    function injectLocationInput() {
        var modal = document.getElementById('selectLocationModal');
        if (!modal || modal.querySelector('.ut-loc-input-row')) return;

        var content = modal.querySelector('.modal-content');
        if (!content) return;

        var row = document.createElement('div');
        row.className = 'ut-loc-input-row';
        row.style.cssText = 'padding:0 0 14px 0;';
        row.innerHTML =
            '<p style="font-size:12px;color:var(--text-secondary,#aaa);margin:0 0 8px;">Or type a custom location:</p>' +
            '<div style="display:flex;gap:8px;">' +
                '<input id="ut-custom-loc" placeholder="Enter location…" style="flex:1;padding:11px 14px;background:var(--glass,#2a2a3e);border:1px solid var(--glass-border,#444);border-radius:10px;color:var(--text-primary,#fff);font-size:14px;outline:none;">' +
                '<button id="ut-add-loc-btn" style="padding:11px 18px;background:var(--primary,#6366f1);color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:14px;font-weight:600;white-space:nowrap;">Add Location</button>' +
            '</div>';

        // Insert before the list items
        content.insertBefore(row, content.firstChild);

        document.getElementById('ut-add-loc-btn').addEventListener('click', function () {
            var val = (document.getElementById('ut-custom-loc') || {}).value.trim();
            if (!val) { toast('Please enter a location'); return; }
            window.selectLocation(val);
        });

        // Also allow Enter key
        document.getElementById('ut-custom-loc').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') document.getElementById('ut-add-loc-btn').click();
        });
    }

    // =========================================================================
    // FIX 4 – "Add Person" confirm button in the Tag People picker
    // =========================================================================
    function fix4_TagPeopleButton() {
        // The tag people modal exists as #tagPeopleModal.
        // Items call tagPerson(name, emoji) which works.
        // Missing: a search box for finding people + a visible "Done / Add" button.

        var _om = window.openModal;
        window.openModal = function (id) {
            _om.call(this, id);
            if (id === 'tagPeople') {
                setTimeout(injectTagPeopleFooter, 120);
            }
        };

        // Override tagPeopleInPost too (called by the 👥 action button)
        var _origTP = window.tagPeopleInPost || function () { openM('tagPeople'); };
        window.tagPeopleInPost = function () {
            _origTP.call(this);
            setTimeout(injectTagPeopleFooter, 120);
        };

        // Keep track of who was tagged so publishPost can read it
        var _origTag = window.tagPerson;
        window.tagPerson = function (name, emoji) {
            if (!window._ut_postTags) window._ut_postTags = [];
            if (!window._ut_postTags.includes(name)) {
                window._ut_postTags.push(name);
            }
            if (typeof _origTag === 'function') _origTag.call(this, name, emoji);
        };

        console.log('[Fix 4] ✅ Tag People modal enhanced with search + confirm button.');
    }

    function injectTagPeopleFooter() {
        var modal = document.getElementById('tagPeopleModal');
        if (!modal || modal.querySelector('.ut-tag-footer')) return;

        var content = modal.querySelector('.modal-content');
        if (!content) return;

        // --- Search box at the top ---
        var topRow = document.createElement('div');
        topRow.className = 'ut-tag-footer'; // flag so we don't inject twice
        topRow.innerHTML = ''; // placeholder class only
        content.insertBefore(topRow, content.firstChild); // just flags the modal

        var searchRow = document.createElement('div');
        searchRow.style.cssText = 'margin-bottom:12px;';
        searchRow.innerHTML =
            '<input id="ut-tag-search" placeholder="🔍 Search for a person…" style="width:100%;padding:11px 14px;background:var(--glass,#2a2a3e);border:1px solid var(--glass-border,#444);border-radius:10px;color:var(--text-primary,#fff);font-size:14px;box-sizing:border-box;outline:none;">';
        content.insertBefore(searchRow, content.firstChild);

        document.getElementById('ut-tag-search').addEventListener('input', function () {
            var q = this.value.toLowerCase();
            modal.querySelectorAll('.friend-card, .list-item').forEach(function (item) {
                var name = item.textContent.toLowerCase();
                item.style.display = name.includes(q) ? '' : 'none';
            });
        });

        // --- "Done – Add People" button at the bottom ---
        var footer = document.createElement('div');
        footer.style.cssText = 'padding:16px 0 4px;';
        footer.innerHTML =
            '<button id="ut-confirm-tag-btn" style="width:100%;padding:14px;background:linear-gradient(135deg,var(--primary,#6366f1),var(--secondary,#ec4899));color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;">👥 Done – Add People</button>';
        content.appendChild(footer);

        document.getElementById('ut-confirm-tag-btn').addEventListener('click', function () {
            var tagged = window._ut_postTags || [];
            closeM('tagPeople');
            if (tagged.length > 0) {
                showAttachBadge('👥 ' + tagged.join(', '), 'tags');
                toast('👥 Tagged: ' + tagged.join(', '));
            } else {
                toast('No one tagged yet – tap a person to tag them');
            }
        });
    }

    // =========================================================================
    // FIX 5 – Comments section: wire up existing HTML input (no duplicate UI)
    // =========================================================================
    function fix5_CommentsAddButton() {
        // The HTML already has #commentInputField + .chat-send-btn calling submitComment().
        // We must NOT add a second input row – just make submitComment() actually work
        // and style the existing elements properly.

        // Override submitComment() – the existing button calls this
        window.submitComment = function () {
            var input = document.getElementById('commentInputField');
            var val   = input ? input.value.trim() : '';
            if (!val) { toast('Please write a comment first'); return; }

            // Find or create the comments list inside the modal
            var modal = document.getElementById('commentsModal');
            if (!modal) return;
            var list = modal.querySelector('.ut-modal-comment-list');
            if (!list) {
                list = document.createElement('div');
                list.className = 'ut-modal-comment-list';
                list.style.cssText = 'max-height:280px;overflow-y:auto;padding:0 0 8px 0;';
                // Insert BEFORE the sticky input row
                var stickyRow = modal.querySelector('[style*="sticky"]');
                if (stickyRow) {
                    stickyRow.parentNode.insertBefore(list, stickyRow);
                } else {
                    var mc = modal.querySelector('.modal-content');
                    if (mc) mc.appendChild(list);
                }
            }

            appendComment(list, val);
            if (input) input.value = '';
            toast('💬 Comment posted!');
        };

        // Style the existing input + send button on first open
        var _om = window.openModal;
        window.openModal = function (id) {
            _om.call(this, id);
            if (id === 'comments') {
                setTimeout(styleCommentInput, 120);
            }
        };

        // Also wire up comment buttons on feed posts
        setTimeout(wireAllExistingPostComments, 2000);

        console.log('[Fix 5] ✅ submitComment() wired – single input row, no duplicates.');
    }

    function styleCommentInput() {
        var modal = document.getElementById('commentsModal');
        if (!modal || modal.dataset.utStyled) return;
        modal.dataset.utStyled = '1';

        // Style the existing input field to be properly sized
        var inp = document.getElementById('commentInputField');
        if (inp) {
            inp.style.cssText = (inp.getAttribute('style') || '') +
                ';flex:1;padding:11px 16px;border-radius:25px;font-size:0.92rem;outline:none;box-sizing:border-box;';
        }

        // Style the send button to be a proper round button
        var btn = modal.querySelector('.chat-send-btn');
        if (btn) {
            btn.style.cssText =
                'width:42px;height:42px;min-width:42px;border-radius:50%;background:var(--primary,#6366f1);' +
                'color:#fff;border:none;cursor:pointer;font-size:1.1rem;display:flex;align-items:center;' +
                'justify-content:center;flex-shrink:0;transition:opacity 0.15s;';
            btn.onmouseover = function () { this.style.opacity = '0.85'; };
            btn.onmouseout  = function () { this.style.opacity = '1'; };
        }

        // Ensure the sticky row is flex
        var stickyRow = modal.querySelector('[style*="sticky"]');
        if (stickyRow) {
            stickyRow.style.display  = 'flex';
            stickyRow.style.gap      = '8px';
            stickyRow.style.alignItems = 'center';
        }
    }

    function wireCommentBox(container) {
        // Legacy helper kept for inline post comment boxes (created by Fix 2 posts)
        var input = container.querySelector('.ut-comment-input');
        var btn   = container.querySelector('.ut-comment-btn');
        var list  = container.querySelector('.ut-comment-list');
        if (!input || !btn || btn.dataset.utWired) return;
        btn.dataset.utWired = '1';

        var submit = function () {
            var val = input.value.trim();
            if (!val) { toast('Please write a comment'); return; }
            appendComment(list || container, val);
            input.value = '';
            toast('💬 Comment posted!');
        };
        btn.addEventListener('click', submit);
        input.addEventListener('keypress', function (e) { if (e.key === 'Enter') submit(); });
    }

    function appendComment(container, text) {
        var safeText = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        var div = document.createElement('div');
        div.style.cssText = 'display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--glass-border);animation:utFadeUp 0.3s ease;';
        div.innerHTML =
            '<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--primary,#6366f1),var(--secondary,#ec4899));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0;">JD</div>' +
            '<div style="flex:1;">' +
                '<div style="font-weight:600;font-size:0.88rem;">You <span style="font-size:0.78rem;color:var(--text-secondary);font-weight:400;">· just now</span></div>' +
                '<div style="font-size:0.9rem;margin-top:2px;line-height:1.45;">' + safeText + '</div>' +
                '<div style="margin-top:5px;display:flex;gap:14px;">' +
                    '<span onclick="this.style.color=this.style.color?\'\':\' var(--error)\'" style="cursor:pointer;font-size:0.8rem;color:var(--text-secondary);">Like</span>' +
                    '<span style="cursor:pointer;font-size:0.8rem;color:var(--text-secondary);">Reply</span>' +
                '</div>' +
            '</div>';
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    function wireAllExistingPostComments() {
        document.querySelectorAll('.post-card, article').forEach(function (post) {
            if (post.dataset.utComEnhanced) return;
            post.dataset.utComEnhanced = '1';
            post.querySelectorAll('.post-action, button').forEach(function (btn) {
                var t = btn.textContent.toLowerCase();
                if (t.includes('comment')) {
                    btn.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        openM('comments');
                    });
                }
            });
        });
    }

    // =========================================================================
    // FIX 6 – Share button opens a proper share-options window
    // =========================================================================
    function fix6_ShareButtonWindow() {
        // The HTML already has #sharePostModal.
        // The inline post-action buttons call sharePost() which just toasts.
        // Fix: make sharePost() open the existing sharePostModal instead.

        window.sharePost = function () {
            // If the HTML's sharePostModal exists, use it
            var existing = document.getElementById('sharePostModal');
            if (existing) {
                openM('sharePost');
                return;
            }
            // Fallback: build our own share sheet
            window._utOpenShare();
        };

        // Also expose this for new posts created by fix 2
        window._utOpenShare = function () {
            var existing = document.getElementById('sharePostModal');
            if (existing) { openM('sharePost'); return; }

            var sheet = document.getElementById('ut-share-sheet');
            if (sheet) { sheet.remove(); }

            var el = document.createElement('div');
            el.id = 'ut-share-sheet';
            el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.72);z-index:999991;display:flex;align-items:flex-end;justify-content:center;';
            el.innerHTML =
                '<div style="background:var(--bg-card,#1e1e2e);border:1px solid var(--glass-border,#333);border-radius:20px 20px 0 0;width:100%;max-width:500px;padding:24px;animation:utSlideUp 0.3s ease;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
                        '<h3 style="margin:0;font-size:19px;color:var(--text-primary,#fff);">🔄 Share Post</h3>' +
                        '<button onclick="document.getElementById(\'ut-share-sheet\').remove()" style="background:none;border:none;color:var(--text-primary,#fff);font-size:1.4rem;cursor:pointer;line-height:1;">✕</button>' +
                    '</div>' +
                    shareOption('📝', 'Share to Your Timeline', 'Post it on your feed', "window._utShareToTimeline()") +
                    shareOption('📨', 'Send to a Friend', 'Share via direct message', "window._utShareToFriend()") +
                    shareOption('👥', 'Share to a Group', 'Post in a group', "window._utShareToGroup()") +
                    shareOption('⭐', 'Add to Your Story', 'Share as a story', "window._utShareToStory()") +
                    '<div style="display:flex;justify-content:center;gap:20px;border-top:1px solid var(--glass-border);padding-top:18px;margin-top:14px;">' +
                        extShareBtn('💬','WhatsApp','#25D366',"window.open('https://wa.me/?text='+encodeURIComponent('Check this out on Lynkapp!'),'_blank');document.getElementById('ut-share-sheet').remove()") +
                        extShareBtn('🐦','Twitter','#1DA1F2',"window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent('Check this out on Lynkapp!'),'_blank');document.getElementById('ut-share-sheet').remove()") +
                        extShareBtn('📘','Facebook','#1877F2',"window.open('https://www.facebook.com/sharer/sharer.php?u=https://lynkapp.com','_blank');document.getElementById('ut-share-sheet').remove()") +
                        extShareBtn('📧','Email','#EA4335',"window.open('mailto:?subject=Check+this+out&body=Check+this+out+on+Lynkapp!');document.getElementById('ut-share-sheet').remove()") +
                    '</div>' +
                    '<div style="display:flex;gap:8px;margin-top:16px;">' +
                        '<input id="ut-share-link" value="https://lynkapp.com/post/' + Date.now() + '" readonly style="flex:1;padding:10px 14px;background:var(--glass,#2a2a3e);border:1px solid var(--glass-border,#444);border-radius:10px;color:var(--text-primary,#fff);font-size:13px;">' +
                        '<button onclick="var i=document.getElementById(\'ut-share-link\');navigator.clipboard?navigator.clipboard.writeText(i.value).then(function(){toast(\'📋 Link copied!\')}).catch(function(){i.select();document.execCommand(\'copy\');toast(\'📋 Copied!\')}):(i.select(),document.execCommand(\'copy\'),toast(\'📋 Copied!\'))" style="padding:10px 16px;background:var(--primary,#6366f1);color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:1.1rem;">📋</button>' +
                    '</div>' +
                '</div>';

            document.body.appendChild(el);
            el.addEventListener('click', function (e) { if (e.target === el) el.remove(); });
        };

        // ── Share action: Timeline ────────────────────────────────────────────
        window._utShareToTimeline = function () {
            var sheet = document.getElementById('ut-share-sheet');
            if (sheet) sheet.remove();

            // Build a "shared post" card and inject at the top of the feed
            var feedEl = document.getElementById('feedContainer') ||
                         document.getElementById('feed-screen') ||
                         document.getElementById('postsContainer') ||
                         document.querySelector('.feed-container') ||
                         document.querySelector('.posts-list') ||
                         (document.querySelector('.post-card') && document.querySelector('.post-card').parentElement);

            if (feedEl) {
                var cardId = 'shared-' + Date.now();
                var div = document.createElement('div');
                div.id = cardId;
                div.className = 'post-card';
                div.style.animation = 'utFadeUp 0.4s ease';
                div.innerHTML =
                    '<div class="post-header">' +
                        '<div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--primary,#6366f1),var(--secondary,#ec4899));display:flex;align-items:center;justify-content:center;font-size:0.88rem;font-weight:700;color:#fff;flex-shrink:0;">JD</div>' +
                        '<div class="post-header-info">' +
                            '<div class="post-author" style="font-weight:600;">You <span style="font-size:0.78rem;color:var(--text-secondary);font-weight:400;">shared a post</span></div>' +
                            '<div class="post-meta" style="font-size:0.8rem;color:var(--text-secondary);">Just now · 🌍 Public</div>' +
                        '</div>' +
                    '</div>' +
                    '<div style="background:var(--glass,rgba(99,102,241,0.08));border:1px solid var(--glass-border,#444);border-radius:12px;padding:12px 14px;margin:10px 0;font-size:0.88rem;color:var(--text-secondary);">' +
                        '<div style="font-weight:600;margin-bottom:4px;color:var(--text-primary,#fff);">🔄 Shared Post</div>' +
                        '<div>Originally posted on Lynkapp</div>' +
                    '</div>' +
                    '<div class="post-actions">' +
                        '<div class="post-action" onclick="window._utToggleLike(this)" style="cursor:pointer;"><span>👍</span> Like</div>' +
                        '<div class="post-action" onclick="window.openModal(\'comments\')" style="cursor:pointer;"><span>💬</span> Comment</div>' +
                        '<div class="post-action" onclick="window.sharePost()" style="cursor:pointer;"><span>🔄</span> Share</div>' +
                    '</div>';

                var firstCard = feedEl.querySelector('.post-card, .card, article');
                if (firstCard) { feedEl.insertBefore(div, firstCard); }
                else { feedEl.insertAdjacentElement('afterbegin', div); }
            }

            toast('📝 Shared to your timeline!');
        };

        // ── Share action: Send to a Friend ────────────────────────────────────
        window._utShareToFriend = function () {
            var sheet = document.getElementById('ut-share-sheet');
            if (sheet) sheet.remove();

            var friends = ['Alex Johnson','Maria Garcia','Jordan Lee','Sam Chen','Riley Taylor','Casey Brown'];

            var picker = document.createElement('div');
            picker.id = 'ut-friend-share-picker';
            picker.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:999993;display:flex;align-items:flex-end;justify-content:center;';
            picker.innerHTML =
                '<div style="background:var(--bg-card,#1e1e2e);border:1px solid var(--glass-border,#333);border-radius:20px 20px 0 0;width:100%;max-width:500px;padding:24px;animation:utSlideUp 0.3s ease;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
                        '<h3 style="margin:0;font-size:18px;color:var(--text-primary,#fff);">📨 Send to a Friend</h3>' +
                        '<button onclick="document.getElementById(\'ut-friend-share-picker\').remove()" style="background:none;border:none;color:var(--text-primary,#fff);font-size:1.4rem;cursor:pointer;">✕</button>' +
                    '</div>' +
                    '<input id="ut-friend-search" placeholder="🔍 Search friends…" oninput="window._utFilterFriends(this.value)" style="width:100%;padding:10px 14px;background:var(--glass,#2a2a3e);border:1px solid var(--glass-border,#444);border-radius:10px;color:var(--text-primary,#fff);font-size:14px;box-sizing:border-box;margin-bottom:12px;outline:none;">' +
                    '<div id="ut-friend-list" style="max-height:280px;overflow-y:auto;">' +
                        friends.map(function (f, i) {
                            var colors = ['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6','#8b5cf6'];
                            return '<div class="ut-friend-row" onclick="window._utSendToFriend(\'' + f + '\')" style="display:flex;align-items:center;gap:12px;padding:11px 4px;cursor:pointer;border-bottom:1px solid var(--glass-border,#2a2a3e);transition:background 0.15s;border-radius:8px;" onmouseover="this.style.background=\'var(--glass,#2a2a3e)\'" onmouseout="this.style.background=\'transparent\'">' +
                                '<div style="width:44px;height:44px;border-radius:50%;background:' + colors[i % colors.length] + ';display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:15px;flex-shrink:0;">' + f.charAt(0) + '</div>' +
                                '<div><div style="font-weight:600;color:var(--text-primary,#fff);font-size:14px;">' + f + '</div><div style="font-size:12px;color:var(--text-secondary,#aaa);">Tap to send</div></div>' +
                            '</div>';
                        }).join('') +
                    '</div>' +
                '</div>';

            document.body.appendChild(picker);
            picker.addEventListener('click', function (e) { if (e.target === picker) picker.remove(); });

            window._utFilterFriends = function (q) {
                picker.querySelectorAll('.ut-friend-row').forEach(function (row) {
                    row.style.display = row.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
                });
            };
            window._utSendToFriend = function (name) {
                picker.remove();
                // Open messages modal if it exists, pre-populate with shared post context
                var msgModal = document.getElementById('messagesModal') || document.getElementById('chatModal') || document.getElementById('dmModal');
                if (msgModal && typeof openModal === 'function') {
                    openModal(msgModal.id);
                }
                // Inject a sent-message bubble into any open chat
                var chatBody = document.querySelector('.chat-messages, .message-list, .messages-container, #chatMessages');
                if (chatBody) {
                    var bubble = document.createElement('div');
                    bubble.style.cssText = 'display:flex;justify-content:flex-end;padding:6px 0;animation:utFadeUp 0.3s ease;';
                    bubble.innerHTML = '<div style="max-width:72%;background:linear-gradient(135deg,var(--primary,#6366f1),var(--secondary,#ec4899));color:#fff;padding:10px 14px;border-radius:18px 18px 4px 18px;font-size:13px;line-height:1.45;">📎 Shared a post with you! Check it out on Lynkapp. <span style="display:block;font-size:11px;opacity:0.75;margin-top:3px;">Just now ✓✓</span></div>';
                    chatBody.appendChild(bubble);
                    chatBody.scrollTop = chatBody.scrollHeight;
                }
                toast('📨 Post sent to ' + name + '!');
            };
        };

        // ── Share action: Share to a Group ────────────────────────────────────
        window._utShareToGroup = function () {
            var sheet = document.getElementById('ut-share-sheet');
            if (sheet) sheet.remove();

            var groups = [
                { name: 'Photography Club', emoji: '📸', members: '142 members' },
                { name: 'Tech Enthusiasts', emoji: '💻', members: '389 members' },
                { name: 'Travel Squad', emoji: '✈️',  members: '57 members' },
                { name: 'Fitness Goals',   emoji: '💪', members: '203 members' },
                { name: 'Music Lovers',    emoji: '🎵', members: '511 members' },
                { name: 'Book Club',       emoji: '📚', members: '88 members' }
            ];

            var picker = document.createElement('div');
            picker.id = 'ut-group-share-picker';
            picker.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:999993;display:flex;align-items:flex-end;justify-content:center;';
            picker.innerHTML =
                '<div style="background:var(--bg-card,#1e1e2e);border:1px solid var(--glass-border,#333);border-radius:20px 20px 0 0;width:100%;max-width:500px;padding:24px;animation:utSlideUp 0.3s ease;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
                        '<h3 style="margin:0;font-size:18px;color:var(--text-primary,#fff);">👥 Share to a Group</h3>' +
                        '<button onclick="document.getElementById(\'ut-group-share-picker\').remove()" style="background:none;border:none;color:var(--text-primary,#fff);font-size:1.4rem;cursor:pointer;">✕</button>' +
                    '</div>' +
                    '<div style="max-height:320px;overflow-y:auto;">' +
                        groups.map(function (g) {
                            return '<div onclick="window._utPostToGroup(\'' + g.name + '\')" style="display:flex;align-items:center;gap:14px;padding:12px 4px;cursor:pointer;border-bottom:1px solid var(--glass-border,#2a2a3e);transition:background 0.15s;border-radius:8px;" onmouseover="this.style.background=\'var(--glass,#2a2a3e)\'" onmouseout="this.style.background=\'transparent\'">' +
                                '<div style="width:48px;height:48px;border-radius:14px;background:var(--glass,#2a2a3e);border:1px solid var(--glass-border,#444);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">' + g.emoji + '</div>' +
                                '<div><div style="font-weight:600;color:var(--text-primary,#fff);font-size:14px;">' + g.name + '</div><div style="font-size:12px;color:var(--text-secondary,#aaa);">' + g.members + ' · Tap to share</div></div>' +
                            '</div>';
                        }).join('') +
                    '</div>' +
                '</div>';

            document.body.appendChild(picker);
            picker.addEventListener('click', function (e) { if (e.target === picker) picker.remove(); });

            window._utPostToGroup = function (groupName) {
                picker.remove();
                // Inject a group post card into the feed to confirm the share happened
                var feedEl = document.getElementById('feedContainer') ||
                             document.getElementById('feed-screen') ||
                             document.getElementById('postsContainer') ||
                             document.querySelector('.feed-container') ||
                             document.querySelector('.posts-list') ||
                             (document.querySelector('.post-card') && document.querySelector('.post-card').parentElement);

                if (feedEl) {
                    var div = document.createElement('div');
                    div.className = 'post-card';
                    div.style.animation = 'utFadeUp 0.4s ease';
                    div.innerHTML =
                        '<div class="post-header">' +
                            '<div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#10b981,#06b6d4);display:flex;align-items:center;justify-content:center;font-size:0.88rem;font-weight:700;color:#fff;flex-shrink:0;">JD</div>' +
                            '<div class="post-header-info">' +
                                '<div class="post-author" style="font-weight:600;">You <span style="font-size:0.78rem;color:var(--text-secondary);font-weight:400;">shared to <strong>' + groupName + '</strong></span></div>' +
                                '<div class="post-meta" style="font-size:0.8rem;color:var(--text-secondary);">Just now · 👥 Group</div>' +
                            '</div>' +
                        '</div>' +
                        '<div style="background:var(--glass,rgba(16,185,129,0.08));border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:12px 14px;margin:10px 0;font-size:0.88rem;">' +
                            '<div style="font-weight:600;margin-bottom:3px;color:var(--text-primary,#fff);">🔄 Shared to ' + groupName + '</div>' +
                            '<div style="color:var(--text-secondary,#aaa);">Originally posted on Lynkapp</div>' +
                        '</div>' +
                        '<div class="post-actions">' +
                            '<div class="post-action" onclick="window._utToggleLike(this)" style="cursor:pointer;"><span>👍</span> Like</div>' +
                            '<div class="post-action" onclick="window.openModal(\'comments\')" style="cursor:pointer;"><span>💬</span> Comment</div>' +
                            '<div class="post-action" onclick="window.sharePost()" style="cursor:pointer;"><span>🔄</span> Share</div>' +
                        '</div>';
                    var firstCard = feedEl.querySelector('.post-card, .card, article');
                    if (firstCard) { feedEl.insertBefore(div, firstCard); }
                    else { feedEl.insertAdjacentElement('afterbegin', div); }
                }
                toast('👥 Post shared to ' + groupName + '!');
            };
        };

        // ── Share action: Add to Your Story ───────────────────────────────────
        window._utShareToStory = function () {
            var sheet = document.getElementById('ut-share-sheet');
            if (sheet) sheet.remove();

            // Add a shared story bubble to the stories bar
            var storiesList = document.getElementById('storiesList') || document.querySelector('.stories-list, .stories-row, .stories-container');
            if (storiesList) {
                var bubble = document.createElement('div');
                bubble.style.cssText = 'min-width:90px;text-align:center;cursor:pointer;flex-shrink:0;animation:utFadeUp 0.3s ease;';
                bubble.innerHTML =
                    '<div style="width:78px;height:78px;border-radius:50%;background:linear-gradient(135deg,var(--primary,#6366f1),var(--secondary,#ec4899));display:flex;align-items:center;justify-content:center;border:3px solid var(--primary,#6366f1);margin:0 auto 6px;font-size:2rem;">🔄</div>' +
                    '<div style="font-size:12px;color:var(--text-primary,#fff);">Shared Story</div>';
                storiesList.insertBefore(bubble, storiesList.firstChild);
            }

            // Also show a small floating preview that auto-dismisses
            var preview = document.createElement('div');
            preview.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--bg-card,#1e1e2e);border:1px solid var(--glass-border,#333);border-radius:20px;padding:32px 28px;text-align:center;z-index:999994;animation:utFadeUp 0.35s ease;min-width:260px;max-width:320px;';
            preview.innerHTML =
                '<div style="font-size:56px;margin-bottom:10px;">⭐</div>' +
                '<div style="font-size:17px;font-weight:700;color:var(--text-primary,#fff);margin-bottom:6px;">Added to Your Story!</div>' +
                '<div style="font-size:13px;color:var(--text-secondary,#aaa);margin-bottom:18px;">Your followers can now see this for 24 hours.</div>' +
                '<button onclick="document.getElementById(\'ut-story-confirm\').remove()" style="padding:10px 28px;background:linear-gradient(135deg,var(--primary,#6366f1),var(--secondary,#ec4899));color:#fff;border:none;border-radius:25px;font-size:14px;font-weight:600;cursor:pointer;">Done</button>';
            preview.id = 'ut-story-confirm';
            document.body.appendChild(preview);
            setTimeout(function () { var el = document.getElementById('ut-story-confirm'); if (el) el.remove(); }, 3500);

            toast('⭐ Post added to your story!');
        };

        console.log('[Fix 6] ✅ sharePost() now opens share window.');
    }

    function shareOption(icon, title, sub, onclick) {
        return '<div onclick="' + onclick + '" style="padding:13px 14px;cursor:pointer;display:flex;align-items:center;gap:14px;border-radius:12px;background:var(--glass,#2a2a3e);margin-bottom:8px;transition:opacity 0.15s;" onmouseover="this.style.opacity=\'0.85\'" onmouseout="this.style.opacity=\'1\'">' +
            '<span style="font-size:1.4rem;">' + icon + '</span>' +
            '<div><div style="font-weight:600;font-size:14px;color:var(--text-primary,#fff);">' + title + '</div><div style="font-size:12px;color:var(--text-secondary,#aaa);">' + sub + '</div></div>' +
        '</div>';
    }
    function extShareBtn(icon, label, bg, onclick) {
        return '<div onclick="' + onclick + '" style="text-align:center;cursor:pointer;">' +
            '<div style="width:50px;height:50px;border-radius:50%;background:' + bg + ';display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin:0 auto 5px;">' + icon + '</div>' +
            '<div style="font-size:11px;color:var(--text-secondary,#aaa);">' + label + '</div>' +
        '</div>';
    }

    // =========================================================================
    // FIX 7 – Create Story: camera + gallery buttons actually work
    // =========================================================================
    function fix7_StoryCameraGallery() {
        // The story modal's buttons call openStoryCamera() and openStoryGallery()
        // which currently just show a toast. We override both.

        window.openStoryCamera = function () {
            closeM('createStory');
            _tryCamera();
        };

        window.openStoryGallery = function () {
            closeM('createStory');
            _openFileGallery();
        };

        // Also override createStory so clicking it opens our picker sheet
        window.createStory = function () {
            _showStoryPicker();
        };

        // ── camera ────────────────────────────────────────────────────────────
        function _tryCamera() {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
                    .then(function (stream) { _showCameraPreview(stream); })
                    .catch(function (err) {
                        console.warn('[Fix7] Camera denied:', err.name);
                        toast('📷 Camera unavailable – opening gallery instead');
                        _openFileGallery();
                    });
            } else {
                toast('Camera not supported on this device – opening gallery');
                _openFileGallery();
            }
        }

        // ── gallery / file picker ─────────────────────────────────────────────
        function _openFileGallery() {
            var fi = document.createElement('input');
            fi.type = 'file';
            fi.accept = 'image/*,video/*';
            fi.style.display = 'none';
            fi.addEventListener('change', function () {
                if (fi.files && fi.files[0]) {
                    var file = fi.files[0];
                    toast('📸 Story created: ' + file.name);
                    _addStoryBubble();
                }
                document.body.removeChild(fi);
            });
            document.body.appendChild(fi);
            fi.click();
        }

        // ── camera preview UI ─────────────────────────────────────────────────
        function _showCameraPreview(stream) {
            var prev = document.getElementById('ut-story-camera');
            if (prev) prev.remove();

            var el = document.createElement('div');
            el.id = 'ut-story-camera';
            el.style.cssText = 'position:fixed;inset:0;background:#000;z-index:999992;display:flex;flex-direction:column;';
            el.innerHTML =
                '<div style="position:absolute;top:0;left:0;right:0;padding:16px;display:flex;justify-content:space-between;align-items:center;z-index:2;">' +
                    '<button onclick="window._utCloseCam()" style="background:rgba(0,0,0,0.5);border:none;color:#fff;width:42px;height:42px;border-radius:50%;cursor:pointer;font-size:18px;backdrop-filter:blur(8px);">✕</button>' +
                    '<span style="color:#fff;font-weight:600;text-shadow:0 1px 4px rgba(0,0,0,0.5);">Story Camera</span>' +
                    '<button onclick="window._utFlipCam()" style="background:rgba(0,0,0,0.5);border:none;color:#fff;width:42px;height:42px;border-radius:50%;cursor:pointer;font-size:18px;backdrop-filter:blur(8px);">🔄</button>' +
                '</div>' +
                '<video id="ut-cam-video" autoplay playsinline muted style="flex:1;object-fit:cover;width:100%;"></video>' +
                '<div style="position:absolute;bottom:28px;left:0;right:0;display:flex;justify-content:center;align-items:center;gap:28px;z-index:2;">' +
                    '<button onclick="_openFileGallery();window._utCloseCam()" style="background:rgba(255,255,255,0.2);border:2px solid #fff;color:#fff;width:50px;height:50px;border-radius:14px;cursor:pointer;font-size:20px;backdrop-filter:blur(8px);">🖼️</button>' +
                    '<button onclick="window._utCapture()" style="width:74px;height:74px;border-radius:50%;border:5px solid #fff;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;">' +
                        '<div style="width:58px;height:58px;border-radius:50%;background:#fff;"></div>' +
                    '</button>' +
                    '<div style="width:50px;"></div>' +
                '</div>';

            document.body.appendChild(el);
            var vid = document.getElementById('ut-cam-video');
            vid.srcObject = stream;
            window._utStream = stream;

            window._utCloseCam = function () {
                if (window._utStream) { window._utStream.getTracks().forEach(function (t) { t.stop(); }); window._utStream = null; }
                var e = document.getElementById('ut-story-camera'); if (e) e.remove();
            };
            window._utCapture = function () {
                var v = document.getElementById('ut-cam-video');
                var c = document.createElement('canvas');
                c.width  = v.videoWidth  || 640;
                c.height = v.videoHeight || 480;
                c.getContext('2d').drawImage(v, 0, 0);
                window._utCloseCam();
                toast('📸 Story captured!');
                _addStoryBubble();
            };
            window._utFlipCam = function () {
                if (window._utStream) { window._utStream.getTracks().forEach(function (t) { t.stop(); }); }
                var facing = window._utCamFacing === 'environment' ? 'user' : 'environment';
                window._utCamFacing = facing;
                navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false })
                    .then(function (s) {
                        var v = document.getElementById('ut-cam-video');
                        if (v) v.srcObject = s;
                        window._utStream = s;
                    }).catch(function () { toast('Could not switch camera'); });
            };
        }

        // ── picker sheet ──────────────────────────────────────────────────────
        function _showStoryPicker() {
            var el = document.getElementById('ut-story-picker');
            if (el) el.remove();

            var sheet = document.createElement('div');
            sheet.id = 'ut-story-picker';
            sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:999991;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';
            sheet.innerHTML =
                '<div style="background:var(--bg-card,#1e1e2e);border:1px solid var(--glass-border,#333);border-radius:20px;width:100%;max-width:400px;padding:28px;color:var(--text-primary,#fff);">' +
                    '<div style="text-align:center;margin-bottom:22px;">' +
                        '<div style="font-size:52px;margin-bottom:8px;">📸</div>' +
                        '<h2 style="margin:0 0 4px;font-size:22px;">Create Story</h2>' +
                        '<p style="margin:0;font-size:13px;color:var(--text-secondary,#aaa);">Choose how to create your story</p>' +
                    '</div>' +
                    storyOption('📷','#6366f1','Camera','Take a photo or record video','window._tryCamera();document.getElementById(\'ut-story-picker\').remove()') +
                    storyOption('🖼️','#10b981','Gallery','Choose from your photos & videos','window._openFileGallery();document.getElementById(\'ut-story-picker\').remove()') +
                    storyOption('✏️','#f59e0b','Text Story','Write a colorful text story','window._showTextStory();document.getElementById(\'ut-story-picker\').remove()') +
                    '<button onclick="document.getElementById(\'ut-story-picker\').remove()" style="width:100%;margin-top:12px;padding:13px;background:var(--glass,#2a2a3e);border:1px solid var(--glass-border,#444);border-radius:12px;cursor:pointer;font-size:14px;color:var(--text-secondary,#aaa);">Cancel</button>' +
                '</div>';

            document.body.appendChild(sheet);
            sheet.addEventListener('click', function (e) { if (e.target === sheet) sheet.remove(); });

            // expose inner helpers to onclick strings
            window._tryCamera = _tryCamera;
            window._openFileGallery = _openFileGallery;
            window._showTextStory = _showTextStoryCreator;
        }

        // ── text story creator ────────────────────────────────────────────────
        function _showTextStoryCreator() {
            var grads = ['linear-gradient(135deg,#6366f1,#8b5cf6)','linear-gradient(135deg,#ef4444,#f59e0b)','linear-gradient(135deg,#10b981,#06b6d4)','linear-gradient(135deg,#ec4899,#f472b6)','linear-gradient(135deg,#1e293b,#475569)','linear-gradient(135deg,#f59e0b,#fbbf24)'];
            var el = document.createElement('div');
            el.id = 'ut-text-story';
            el.style.cssText = 'position:fixed;inset:0;z-index:999992;display:flex;flex-direction:column;';
            el.innerHTML =
                '<div id="ut-ts-bg" style="flex:1;background:' + grads[0] + ';display:flex;flex-direction:column;">' +
                    '<div style="padding:16px;display:flex;justify-content:space-between;align-items:center;">' +
                        '<button onclick="document.getElementById(\'ut-text-story\').remove()" style="background:rgba(0,0,0,0.3);border:none;color:#fff;width:42px;height:42px;border-radius:50%;cursor:pointer;font-size:16px;backdrop-filter:blur(8px);">✕</button>' +
                        '<span style="font-weight:600;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,0.4);">Text Story</span>' +
                        '<button onclick="document.getElementById(\'ut-text-story\').remove();toast(\'⭐ Story published!\');_addStoryBubble()" style="background:rgba(255,255,255,0.25);border:none;color:#fff;padding:10px 20px;border-radius:25px;cursor:pointer;font-weight:600;backdrop-filter:blur(8px);">Share</button>' +
                    '</div>' +
                    '<div style="flex:1;display:flex;align-items:center;justify-content:center;padding:28px;">' +
                        '<textarea placeholder="Type your story…" style="background:transparent;border:none;color:#fff;font-size:26px;font-weight:700;text-align:center;width:100%;resize:none;outline:none;text-shadow:0 2px 8px rgba(0,0,0,0.3);" rows="4"></textarea>' +
                    '</div>' +
                    '<div style="padding:18px;display:flex;justify-content:center;gap:10px;">' +
                        grads.map(function (g) {
                            return '<button onclick="document.getElementById(\'ut-ts-bg\').style.background=\'' + g + '\'" style="width:36px;height:36px;border-radius:50%;background:' + g + ';border:3px solid rgba(255,255,255,0.6);cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform=\'scale(1.15)\'" onmouseout="this.style.transform=\'scale(1)\'"></button>';
                        }).join('') +
                    '</div>' +
                '</div>';
            document.body.appendChild(el);
        }

        function _addStoryBubble() {
            var list = document.getElementById('storiesList') || document.querySelector('.stories-list, .stories-row');
            if (!list) return;
            var div = document.createElement('div');
            div.style.cssText = 'min-width:90px;text-align:center;cursor:pointer;flex-shrink:0;';
            div.innerHTML =
                '<div style="width:78px;height:78px;border-radius:50%;background:linear-gradient(135deg,var(--primary,#6366f1),var(--secondary,#ec4899));display:flex;align-items:center;justify-content:center;border:3px solid var(--primary,#6366f1);margin:0 auto 6px;font-size:2rem;">📸</div>' +
                '<div style="font-size:12px;">Your Story</div>';
            list.insertBefore(div, list.firstChild);
        }

        console.log('[Fix 7] ✅ Story camera + gallery patched.');
    }

    function storyOption(icon, color, title, sub, onclick) {
        return '<div onclick="' + onclick + '" style="display:flex;align-items:center;gap:16px;padding:16px;background:var(--glass,#2a2a3e);border:1px solid var(--glass-border,#444);border-radius:14px;cursor:pointer;margin-bottom:10px;transition:opacity 0.15s;" onmouseover="this.style.opacity=\'0.85\'" onmouseout="this.style.opacity=\'1\'">' +
            '<div style="width:48px;height:48px;border-radius:50%;background:' + color + ';display:flex;align-items:center;justify-content:center;font-size:22px;color:#fff;flex-shrink:0;">' + icon + '</div>' +
            '<div><div style="font-weight:600;font-size:14px;color:var(--text-primary,#fff);">' + title + '</div><div style="font-size:12px;color:var(--text-secondary,#aaa);">' + sub + '</div></div>' +
        '</div>';
    }

    // =========================================================================
    // Helper: attachment badge inside #createPostModal
    // =========================================================================
    function showAttachBadge(text, type) {
        var modal = document.getElementById('createPostModal');
        if (!modal) return;
        // Remove previous badge of same type
        var old = modal.querySelector('.ut-attach-badge[data-type="' + type + '"]');
        if (old) old.remove();

        var badge = document.createElement('div');
        badge.className = 'ut-attach-badge';
        badge.dataset.type = type;
        badge.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--glass,rgba(99,102,241,0.12));border:1px solid var(--glass-border,#444);border-radius:8px;margin:6px 0;font-size:0.88rem;color:var(--text-primary,#fff);';
        badge.innerHTML = '<span>' + text + '</span>' +
            '<button onclick="this.parentElement.remove();window._ut_post' + (type === 'location' ? 'Location' : (type === 'tags' ? 'Tags' : 'Photo')) + '=null;" style="background:none;border:none;color:var(--text-secondary,#888);cursor:pointer;font-size:1.1rem;line-height:1;">✕</button>';

        var ta = modal.querySelector('#postTextContent, #postContent, textarea');
        if (ta && ta.parentElement) {
            ta.parentElement.insertBefore(badge, ta.nextSibling);
        } else {
            var mc = modal.querySelector('.modal-content');
            if (mc) mc.appendChild(badge);
        }
    }

    // =========================================================================
    // Global CSS keyframes
    // =========================================================================
    function injectGlobalStyles() {
        var s = document.getElementById('ut-fix-styles');
        if (s) return;
        s = document.createElement('style');
        s.id = 'ut-fix-styles';
        s.textContent =
            '@keyframes utFadeUp{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}' +
            '@keyframes utSlideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}' +
            '#ut-profile-wizard *,#ut-share-sheet *,#ut-story-camera *,#ut-text-story *,#ut-story-picker *{box-sizing:border-box;}' +
            '.ut-attach-badge button:hover{color:var(--error,#ef4444)!important;}' +
            '.wiz-int-btn.sel{background:var(--primary,#6366f1)!important;border-color:var(--primary,#6366f1)!important;}';
        document.head.appendChild(s);
    }

})();
