/**
 * Lynkapp - User Testing Bug Fixes for ConnectHub_Mobile_Design.html
 * Target: The MAIN deployed prototype (1,086 KB monolith)
 * 
 * Fixes 7 critical issues:
 * 1. Account creation → force full profile setup after register
 * 2. Post button (publishPost) not working
 * 3. No button to add/confirm location in create post
 * 4. No button to add/confirm tagged person in create post
 * 5. Comments add button not working
 * 6. Share button window not opening
 * 7. Story camera/gallery buttons not opening
 */

(function() {
    'use strict';
    
    console.log('[LynkFixes] Initializing 7 bug fixes for ConnectHub_Mobile_Design.html...');

    setTimeout(applyAllFixes, 800);

    function applyAllFixes() {
        fix1_ProfileSetupAfterRegister();
        fix2_PublishPostWorking();
        fix3_LocationPicker();
        fix4_TagPeoplePicker();
        fix5_CommentsSystem();
        fix6_ShareWindow();
        fix7_StoryCameraGallery();
        injectTagPeopleButton();
        console.log('[LynkFixes] ✅ All 7 fixes applied to ConnectHub_Mobile_Design.html');
    }

    // ==========================================
    // FIX 1: Profile setup after register
    // ==========================================
    function fix1_ProfileSetupAfterRegister() {
        var origRegister = window.handleRegister;
        window.handleRegister = function() {
            if (typeof origRegister === 'function') origRegister.apply(this, arguments);
            setTimeout(function() {
                if (!localStorage.getItem('lynk_profile_done')) {
                    var fn = document.getElementById('registerFirstName');
                    showProfileWizard(fn ? fn.value.trim() : '');
                }
            }, 1500);
        };
        console.log('[Fix1] ✅ Profile setup after register');
    }

    function showProfileWizard(name) {
        var el = document.getElementById('profile-wizard-overlay');
        if (el) el.remove();
        var ov = document.createElement('div');
        ov.id = 'profile-wizard-overlay';
        ov.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.88);z-index:100000;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';
        ov.innerHTML = '<div style="background:#1a1a2e;border:1px solid #333;border-radius:20px;width:100%;max-width:420px;max-height:90vh;overflow-y:auto;padding:24px;color:#fff;">' +
            '<div id="pw-step1">' +
                '<div style="text-align:center;margin-bottom:20px;"><div style="font-size:48px;">👤</div><h2 style="margin:8px 0 4px;font-size:20px;">Complete Your Profile</h2><p style="color:#888;font-size:13px;margin:0;">Step 1 of 2</p></div>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:12px;color:#aaa;margin-bottom:4px;">Display Name *</label><input id="pw-name" value="' + (name||'') + '" placeholder="Your name" style="width:100%;padding:11px;background:#2a2a3e;border:1px solid #444;border-radius:10px;color:#fff;font-size:14px;box-sizing:border-box;"></div>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:12px;color:#aaa;margin-bottom:4px;">Username *</label><input id="pw-user" placeholder="@username" style="width:100%;padding:11px;background:#2a2a3e;border:1px solid #444;border-radius:10px;color:#fff;font-size:14px;box-sizing:border-box;"></div>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:12px;color:#aaa;margin-bottom:4px;">Bio</label><textarea id="pw-bio" placeholder="Tell us about yourself..." rows="2" style="width:100%;padding:11px;background:#2a2a3e;border:1px solid #444;border-radius:10px;color:#fff;font-size:14px;box-sizing:border-box;resize:vertical;"></textarea></div>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:12px;color:#aaa;margin-bottom:4px;">Profile Photo</label><div style="display:flex;align-items:center;gap:10px;"><div id="pw-avatar" style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#ec4899);display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;">👤</div><button onclick="document.getElementById(\'pw-photo\').click()" style="padding:9px 14px;background:#6366f1;color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:13px;">📷 Upload</button><input type="file" id="pw-photo" accept="image/*" hidden onchange="if(this.files[0]){var r=new FileReader();r.onload=function(e){document.getElementById(\'pw-avatar\').innerHTML=\'<img src=\\\'\'+e.target.result+\'\\\' style=width:100%;height:100%;object-fit:cover;border-radius:50%>\'};r.readAsDataURL(this.files[0])}"></div></div>' +
                '<button onclick="var n=document.getElementById(\'pw-name\').value.trim(),u=document.getElementById(\'pw-user\').value.trim();if(!n||!u){alert(\'Please fill in name and username\');return;}document.getElementById(\'pw-step1\').style.display=\'none\';document.getElementById(\'pw-step2\').style.display=\'block\'" style="width:100%;padding:13px;background:linear-gradient(135deg,#6366f1,#ec4899);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;margin-top:6px;">Next Step →</button>' +
            '</div>' +
            '<div id="pw-step2" style="display:none;">' +
                '<div style="text-align:center;margin-bottom:20px;"><div style="font-size:48px;">⭐</div><h2 style="margin:8px 0 4px;font-size:20px;">Your Interests</h2><p style="color:#888;font-size:13px;margin:0;">Step 2 of 2</p></div>' +
                '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">' +
                    ['Photography','Travel','Music','Art','Tech','Sports','Food','Fashion','Gaming','Fitness','Movies','Books'].map(function(i){return '<button onclick="this.classList.toggle(\'sel\');this.style.background=this.classList.contains(\'sel\')?\'#6366f1\':\'#2a2a3e\'" style="padding:7px 14px;background:#2a2a3e;border:1px solid #444;border-radius:18px;cursor:pointer;font-size:12px;color:#fff;">'+i+'</button>'}).join('') +
                '</div>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:12px;color:#aaa;margin-bottom:4px;">Location</label><input id="pw-loc" placeholder="City, Country" style="width:100%;padding:11px;background:#2a2a3e;border:1px solid #444;border-radius:10px;color:#fff;font-size:14px;box-sizing:border-box;"></div>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:12px;color:#aaa;margin-bottom:4px;">Date of Birth</label><input type="date" id="pw-dob" style="width:100%;padding:11px;background:#2a2a3e;border:1px solid #444;border-radius:10px;color:#fff;font-size:14px;box-sizing:border-box;"></div>' +
                '<div style="display:flex;gap:8px;"><button onclick="document.getElementById(\'pw-step2\').style.display=\'none\';document.getElementById(\'pw-step1\').style.display=\'block\'" style="flex:1;padding:13px;background:#2a2a3e;color:#fff;border:1px solid #444;border-radius:12px;font-size:13px;cursor:pointer;">← Back</button><button onclick="window._finishProfile()" style="flex:2;padding:13px;background:linear-gradient(135deg,#10b981,#06b6d4);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;">Complete Setup ✓</button></div>' +
            '</div>' +
        '</div>';
        document.body.appendChild(ov);
        window._finishProfile = function() {
            localStorage.setItem('lynk_profile_done','true');
            document.getElementById('profile-wizard-overlay').remove();
            if (typeof showToast === 'function') showToast('Profile complete! Welcome! 🎉');
        };
    }

    // ==========================================
    // FIX 2: publishPost working
    // ==========================================
    function fix2_PublishPostWorking() {
        window.publishPost = function() {
            var ta = document.getElementById('postTextContent');
            var text = ta ? ta.value.trim() : '';
            if (!text && !window._attachedPhoto && !window._attachedLocation) {
                if (typeof showToast === 'function') showToast('Please write something or add media');
                return;
            }
            var locHTML = window._attachedLocation ? '<div style="font-size:12px;color:#888;margin-top:4px;">📍 '+window._attachedLocation+'</div>' : '';
            var tagHTML = window._taggedPeople && window._taggedPeople.length ? '<div style="font-size:12px;color:#6366f1;margin-top:4px;">👥 with '+window._taggedPeople.join(', ')+'</div>' : '';
            var photoHTML = window._attachedPhoto ? '<div style="margin:10px 0;border-radius:12px;overflow:hidden;height:200px;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;"><span style="font-size:3rem;">📸</span></div>' : '';
            var escaped = text.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
            var postHTML = '<div class="post-card" style="background:#1a1a2e;border:1px solid #333;border-radius:16px;padding:14px;margin-bottom:12px;animation:fadeIn 0.3s;">' +
                '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
                    '<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#ec4899);display:flex;align-items:center;justify-content:center;font-weight:600;color:#fff;font-size:14px;">You</div>' +
                    '<div><div style="font-weight:600;font-size:14px;">You</div><div style="font-size:11px;color:#888;">Just now</div>'+locHTML+tagHTML+'</div>' +
                '</div>' +
                '<div style="margin-bottom:10px;line-height:1.5;font-size:14px;">'+escaped+'</div>' + photoHTML +
                '<div style="display:flex;justify-content:space-around;padding-top:10px;border-top:1px solid #333;">' +
                    '<button onclick="this.innerHTML=this.innerHTML.includes(\'d\')?\'❤️ Like\':\'❤️ Liked\'" style="background:none;border:none;color:#888;cursor:pointer;font-size:13px;padding:6px 10px;">❤️ Like</button>' +
                    '<button onclick="window._openComments(this.closest(\'.post-card\'))" style="background:none;border:none;color:#888;cursor:pointer;font-size:13px;padding:6px 10px;">💬 Comment</button>' +
                    '<button onclick="window._openShare()" style="background:none;border:none;color:#888;cursor:pointer;font-size:13px;padding:6px 10px;">🔄 Share</button>' +
                '</div>' +
                '<div class="post-comments" style="display:none;margin-top:10px;padding-top:10px;border-top:1px solid #333;"></div>' +
            '</div>';
            var feed = document.getElementById('feed-screen');
            if (feed) {
                var postsArea = feed.querySelector('.posts-container') || feed.querySelector('.post-card') && feed.querySelector('.post-card').parentElement || feed;
                var firstPost = postsArea.querySelector('.post-card');
                if (firstPost) firstPost.insertAdjacentHTML('beforebegin', postHTML);
                else postsArea.insertAdjacentHTML('afterbegin', postHTML);
            }
            if (ta) ta.value = '';
            window._attachedPhoto = null; window._attachedLocation = null; window._taggedPeople = null;
            var inds = document.querySelectorAll('.fix-attachment-ind'); inds.forEach(function(e){e.remove()});
            closeModal('createPost');
            if (typeof showToast === 'function') showToast('Post published! 🎉');
        };
        console.log('[Fix2] ✅ publishPost working');
    }

    // ==========================================
    // FIX 3: Location picker
    // ==========================================
    function fix3_LocationPicker() {
        window.openLocationPicker = function() {
            var el = document.getElementById('loc-picker'); if (el) el.remove();
            var locs = ['New York, NY','Los Angeles, CA','London, UK','Tokyo, Japan','Paris, France','Sydney, Australia','Miami, FL','San Francisco, CA','Toronto, Canada','Berlin, Germany','Dubai, UAE','Singapore'];
            var m = document.createElement('div'); m.id = 'loc-picker';
            m.style.cssText = 'display:flex;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:100001;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';
            m.innerHTML = '<div style="background:#1a1a2e;border:1px solid #333;border-radius:20px;width:100%;max-width:400px;max-height:80vh;overflow:hidden;color:#fff;"><div style="padding:16px;border-bottom:1px solid #333;display:flex;justify-content:space-between;"><h3 style="margin:0;font-size:17px;">📍 Add Location</h3><button onclick="document.getElementById(\'loc-picker\').remove()" style="background:none;border:none;color:#fff;font-size:1.3rem;cursor:pointer;">✕</button></div><div style="padding:14px;"><input type="text" id="loc-search" placeholder="🔍 Search location..." style="width:100%;padding:10px;background:#2a2a3e;border:1px solid #444;border-radius:10px;color:#fff;font-size:13px;box-sizing:border-box;" oninput="window._filterLocs(this.value)"></div><div id="loc-list" style="max-height:250px;overflow-y:auto;padding:0 14px;">'+locs.map(function(l){return '<div class="loc-item" onclick="window._pickLoc(\''+l+'\',this)" style="padding:10px 12px;border-bottom:1px solid #2a2a3e;cursor:pointer;border-radius:8px;font-size:13px;">📍 '+l+'</div>'}).join('')+'</div><div style="padding:14px;"><button onclick="window._confirmLoc()" style="width:100%;padding:12px;background:linear-gradient(135deg,#6366f1,#ec4899);color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;">📍 Add This Location</button></div></div>';
            document.body.appendChild(m);
            m.addEventListener('click',function(e){if(e.target===m)m.remove()});
            window._filterLocs = function(q){document.querySelectorAll('.loc-item').forEach(function(i){i.style.display=i.textContent.toLowerCase().includes(q.toLowerCase())?'block':'none'})};
            window._pickLoc = function(l,el){document.querySelectorAll('.loc-item').forEach(function(i){i.style.background='transparent'});el.style.background='rgba(99,102,241,0.2)';document.getElementById('loc-search').value=l};
            window._confirmLoc = function(){var v=document.getElementById('loc-search').value.trim();if(!v){showToast('Select a location');return;}window._attachedLocation=v;document.getElementById('loc-picker').remove();addIndicator('📍 '+v,'location');showToast('📍 Location: '+v)};
        };
        console.log('[Fix3] ✅ Location picker');
    }

    // ==========================================
    // FIX 4: Tag people
    // ==========================================
    function fix4_TagPeoplePicker() {
        window._taggedPeople = [];
        window.openTagPeople = function() {
            var el = document.getElementById('tag-picker'); if (el) el.remove();
            var people = [{n:'Emma Watson',u:'@emma',c:'#6366f1'},{n:'Alex Johnson',u:'@alexj',c:'#ef4444'},{n:'Sarah Chen',u:'@sarahc',c:'#06b6d4'},{n:'Mike Rodriguez',u:'@miker',c:'#f59e0b'},{n:'Lisa Park',u:'@lisap',c:'#ec4899'},{n:'David Kim',u:'@davidk',c:'#10b981'},{n:'Olivia Brown',u:'@oliviab',c:'#8b5cf6'},{n:'James Wilson',u:'@jamesw',c:'#14b8a6'}];
            var m = document.createElement('div'); m.id = 'tag-picker';
            m.style.cssText = 'display:flex;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:100001;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';
            m.innerHTML = '<div style="background:#1a1a2e;border:1px solid #333;border-radius:20px;width:100%;max-width:400px;max-height:80vh;overflow:hidden;color:#fff;"><div style="padding:16px;border-bottom:1px solid #333;display:flex;justify-content:space-between;"><h3 style="margin:0;font-size:17px;">👥 Tag People</h3><button onclick="document.getElementById(\'tag-picker\').remove()" style="background:none;border:none;color:#fff;font-size:1.3rem;cursor:pointer;">✕</button></div><div style="padding:14px;"><input type="text" placeholder="🔍 Search..." style="width:100%;padding:10px;background:#2a2a3e;border:1px solid #444;border-radius:10px;color:#fff;font-size:13px;box-sizing:border-box;" oninput="window._filterTags(this.value)"></div><div style="max-height:250px;overflow-y:auto;padding:0 14px;">'+people.map(function(p){return '<div class="tag-item" data-n="'+p.n+'" onclick="window._toggleTag(this,\''+p.n+'\')" style="padding:10px;border-bottom:1px solid #2a2a3e;display:flex;align-items:center;gap:10px;cursor:pointer;border-radius:8px;"><div style="width:36px;height:36px;border-radius:50%;background:'+p.c+';color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;">'+p.n[0]+'</div><div style="flex:1;"><div style="font-weight:600;font-size:13px;">'+p.n+'</div><div style="font-size:11px;color:#888;">'+p.u+'</div></div><div class="tc" style="width:22px;height:22px;border:2px solid #444;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;"></div></div>'}).join('')+'</div><div style="padding:14px;"><button onclick="window._confirmTags()" style="width:100%;padding:12px;background:linear-gradient(135deg,#6366f1,#ec4899);color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;">👥 Tag Selected</button></div></div>';
            document.body.appendChild(m);
            m.addEventListener('click',function(e){if(e.target===m)m.remove()});
            window._tagSel = [];
            window._filterTags = function(q){document.querySelectorAll('.tag-item').forEach(function(i){i.style.display=i.dataset.n.toLowerCase().includes(q.toLowerCase())?'flex':'none'})};
            window._toggleTag = function(el,n){var c=el.querySelector('.tc'),i=window._tagSel.indexOf(n);if(i===-1){window._tagSel.push(n);c.innerHTML='✓';c.style.borderColor='#6366f1';c.style.background='#6366f1';c.style.color='#fff';el.style.background='rgba(99,102,241,0.15)'}else{window._tagSel.splice(i,1);c.innerHTML='';c.style.borderColor='#444';c.style.background='transparent';el.style.background='transparent'}};
            window._confirmTags = function(){if(!window._tagSel.length){showToast('Select at least one person');return;}window._taggedPeople=window._tagSel.slice();document.getElementById('tag-picker').remove();addIndicator('👥 '+window._taggedPeople.join(', '),'tags');showToast('👥 Tagged: '+window._taggedPeople.join(', '))};
        };
        console.log('[Fix4] ✅ Tag people');
    }

    // ==========================================
    // FIX 5: Comments system
    // ==========================================
    function fix5_CommentsSystem() {
        window._openComments = function(post) {
            if (!post) return;
            var cs = post.querySelector('.post-comments');
            if (!cs) { cs = document.createElement('div'); cs.className='post-comments'; cs.style.cssText='margin-top:10px;padding-top:10px;border-top:1px solid #333;'; post.appendChild(cs); }
            if (cs.style.display==='block') { cs.style.display='none'; return; }
            cs.style.display='block';
            if (!cs.querySelector('.ci-row')) {
                cs.innerHTML = '<div class="cl"></div><div class="ci-row" style="display:flex;gap:6px;margin-top:8px;"><input type="text" placeholder="Write a comment..." class="ci" style="flex:1;padding:9px 12px;background:#2a2a3e;border:1px solid #444;border-radius:20px;color:#fff;font-size:13px;"><button class="cb" style="padding:9px 14px;background:#6366f1;color:#fff;border:none;border-radius:20px;cursor:pointer;font-size:13px;">Post</button></div>';
                var inp = cs.querySelector('.ci'), btn = cs.querySelector('.cb'), list = cs.querySelector('.cl');
                var add = function() {
                    var t = inp.value.trim(); if (!t) return;
                    list.insertAdjacentHTML('beforeend','<div style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid #2a2a3e;"><div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#ec4899);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:#fff;flex-shrink:0;">You</div><div style="flex:1;"><div style="display:flex;gap:6px;margin-bottom:2px;"><span style="font-weight:600;font-size:12px;">You</span><span style="font-size:11px;color:#888;">Just now</span></div><div style="font-size:13px;line-height:1.4;">'+t.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div><div style="margin-top:3px;display:flex;gap:10px;"><span onclick="this.textContent=this.textContent.includes(\'d\')?\'Like\':\'Liked ❤️\'" style="cursor:pointer;font-size:11px;color:#888;">Like</span><span style="font-size:11px;color:#888;cursor:pointer;">Reply</span></div></div></div>');
                    inp.value = '';
                    showToast('Comment posted! 💬');
                };
                btn.addEventListener('click', add);
                inp.addEventListener('keypress', function(e) { if (e.key==='Enter') add(); });
            }
            var ci = cs.querySelector('.ci'); if (ci) ci.focus();
        };
        // Enhance existing posts
        setTimeout(function() {
            document.querySelectorAll('.post-card').forEach(function(p) { enhancePost(p); });
            var feed = document.getElementById('feed-screen');
            if (feed) {
                var obs = new MutationObserver(function(muts) { muts.forEach(function(m) { m.addedNodes.forEach(function(n) { if (n.nodeType===1 && n.classList && n.classList.contains('post-card')) enhancePost(n); }); }); });
                obs.observe(feed, { childList:true, subtree:true });
            }
        }, 500);
        console.log('[Fix5] ✅ Comments system');
    }

    function enhancePost(post) {
        if (post.dataset.enhanced) return;
        post.dataset.enhanced = 'true';
        var btns = post.querySelectorAll('button, .action-btn, [onclick]');
        btns.forEach(function(b) {
            var t = (b.textContent||'').toLowerCase();
            if (t.includes('comment')) { b.onclick = function(e){e.preventDefault();window._openComments(post)}; }
            if (t.includes('share')) { b.onclick = function(e){e.preventDefault();window._openShare()}; }
        });
        if (!post.querySelector('.post-comments')) {
            var s = document.createElement('div'); s.className='post-comments'; s.style.display='none'; post.appendChild(s);
        }
    }

    // ==========================================
    // FIX 6: Share window
    // ==========================================
    function fix6_ShareWindow() {
        window.sharePost = function() { window._openShare(); };
        window._openShare = function() {
            var el = document.getElementById('share-fix'); if (el) el.remove();
            var m = document.createElement('div'); m.id = 'share-fix';
            m.style.cssText = 'display:flex;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:100001;align-items:flex-end;justify-content:center;';
            m.innerHTML = '<div style="background:#1a1a2e;border:1px solid #333;border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:20px;color:#fff;animation:slideUp 0.3s;">' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h3 style="margin:0;font-size:18px;">🔄 Share Post</h3><button onclick="document.getElementById(\'share-fix\').remove()" style="background:none;border:none;color:#fff;font-size:1.3rem;cursor:pointer;">✕</button></div>' +
                '<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:14px;">' +
                    '<div onclick="document.getElementById(\'share-fix\').remove();showToast(\'📝 Shared to timeline!\')" style="padding:12px;cursor:pointer;display:flex;align-items:center;gap:12px;border-radius:10px;background:#2a2a3e;"><span style="font-size:1.2rem;">📝</span><div><div style="font-weight:600;font-size:13px;">Share to Timeline</div><div style="font-size:11px;color:#888;">Post on your feed</div></div></div>' +
                    '<div onclick="document.getElementById(\'share-fix\').remove();showToast(\'📨 Sent to friend!\')" style="padding:12px;cursor:pointer;display:flex;align-items:center;gap:12px;border-radius:10px;background:#2a2a3e;"><span style="font-size:1.2rem;">📨</span><div><div style="font-weight:600;font-size:13px;">Send to Friend</div><div style="font-size:11px;color:#888;">Direct message</div></div></div>' +
                    '<div onclick="document.getElementById(\'share-fix\').remove();showToast(\'👥 Shared to group!\')" style="padding:12px;cursor:pointer;display:flex;align-items:center;gap:12px;border-radius:10px;background:#2a2a3e;"><span style="font-size:1.2rem;">👥</span><div><div style="font-weight:600;font-size:13px;">Share to Group</div><div style="font-size:11px;color:#888;">Post in group</div></div></div>' +
                    '<div onclick="document.getElementById(\'share-fix\').remove();showToast(\'⭐ Added to story!\')" style="padding:12px;cursor:pointer;display:flex;align-items:center;gap:12px;border-radius:10px;background:#2a2a3e;"><span style="font-size:1.2rem;">⭐</span><div><div style="font-weight:600;font-size:13px;">Share to Story</div><div style="font-size:11px;color:#888;">Add to story</div></div></div>' +
                '</div>' +
                '<div style="border-top:1px solid #333;padding-top:14px;"><p style="font-size:12px;color:#888;margin:0 0 8px;">External sharing</p><div style="display:flex;gap:14px;justify-content:center;">' +
                    '<div onclick="window.open(\'https://wa.me/?text=\'+encodeURIComponent(\'Check this on Lynkapp!\'));document.getElementById(\'share-fix\').remove()" style="text-align:center;cursor:pointer;"><div style="width:44px;height:44px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;font-size:1.2rem;margin:0 auto 3px;">💬</div><div style="font-size:10px;">WhatsApp</div></div>' +
                    '<div onclick="window.open(\'https://twitter.com/intent/tweet?text=\'+encodeURIComponent(\'Check this on Lynkapp!\'));document.getElementById(\'share-fix\').remove()" style="text-align:center;cursor:pointer;"><div style="width:44px;height:44px;border-radius:50%;background:#1DA1F2;display:flex;align-items:center;justify-content:center;font-size:1.2rem;margin:0 auto 3px;">🐦</div><div style="font-size:10px;">Twitter</div></div>' +
                    '<div onclick="window.open(\'https://facebook.com/sharer/sharer.php?u=\'+encodeURIComponent(\'https://lynkapp.com\'));document.getElementById(\'share-fix\').remove()" style="text-align:center;cursor:pointer;"><div style="width:44px;height:44px;border-radius:50%;background:#1877F2;display:flex;align-items:center;justify-content:center;font-size:1.2rem;margin:0 auto 3px;">📘</div><div style="font-size:10px;">Facebook</div></div>' +
                    '<div onclick="window.open(\'mailto:?subject=Check+this&body=Check+this+on+Lynkapp!\');document.getElementById(\'share-fix\').remove()" style="text-align:center;cursor:pointer;"><div style="width:44px;height:44px;border-radius:50%;background:#EA4335;display:flex;align-items:center;justify-content:center;font-size:1.2rem;margin:0 auto 3px;">📧</div><div style="font-size:10px;">Email</div></div>' +
                '</div></div>' +
                '<div style="display:flex;gap:6px;margin-top:12px;"><input type="text" value="https://lynkapp.com/post/'+Date.now()+'" readonly style="flex:1;padding:10px;background:#2a2a3e;border:1px solid #444;border-radius:10px;color:#fff;font-size:12px;"><button onclick="navigator.clipboard.writeText(this.previousElementSibling.value).then(function(){showToast(\'📋 Link copied!\')}).catch(function(){showToast(\'📋 Copied!\')})" style="padding:10px 14px;background:#6366f1;color:#fff;border:none;border-radius:10px;cursor:pointer;">📋</button></div>' +
            '</div>';
            document.body.appendChild(m);
            m.addEventListener('click',function(e){if(e.target===m)m.remove()});
        };
        console.log('[Fix6] ✅ Share window');
    }

    // ==========================================
    // FIX 7: Story camera/gallery
    // ==========================================
    function fix7_StoryCameraGallery() {
        window.createStory = function() {
            var el = document.getElementById('story-fix'); if (el) el.remove();
            var m = document.createElement('div'); m.id = 'story-fix';
            m.style.cssText = 'display:flex;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:100001;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';
            m.innerHTML = '<div style="background:#1a1a2e;border:1px solid #333;border-radius:20px;width:100%;max-width:380px;padding:24px;color:#fff;">' +
                '<div style="text-align:center;margin-bottom:20px;"><div style="font-size:48px;">📸</div><h2 style="margin:8px 0 4px;font-size:20px;">Create Story</h2><p style="color:#888;font-size:13px;margin:0;">Choose how to create</p></div>' +
                '<div style="display:flex;flex-direction:column;gap:10px;">' +
                    '<button onclick="window._storyCamera()" style="display:flex;align-items:center;gap:14px;padding:14px;background:#2a2a3e;border:1px solid #444;border-radius:12px;cursor:pointer;color:#fff;font-size:14px;text-align:left;"><div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:20px;">📷</div><div><div style="font-weight:600;">Camera</div><div style="font-size:12px;color:#888;">Take photo or video</div></div></button>' +
                    '<button onclick="window._storyGallery()" style="display:flex;align-items:center;gap:14px;padding:14px;background:#2a2a3e;border:1px solid #444;border-radius:12px;cursor:pointer;color:#fff;font-size:14px;text-align:left;"><div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#10b981,#06b6d4);display:flex;align-items:center;justify-content:center;font-size:20px;">🖼️</div><div><div style="font-weight:600;">Gallery</div><div style="font-size:12px;color:#888;">Choose from photos</div></div></button>' +
                    '<button onclick="window._storyText()" style="display:flex;align-items:center;gap:14px;padding:14px;background:#2a2a3e;border:1px solid #444;border-radius:12px;cursor:pointer;color:#fff;font-size:14px;text-align:left;"><div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#ef4444);display:flex;align-items:center;justify-content:center;font-size:20px;">✏️</div><div><div style="font-weight:600;">Text Story</div><div style="font-size:12px;color:#888;">Text-based story</div></div></button>' +
                '</div>' +
                '<button onclick="document.getElementById(\'story-fix\').remove()" style="width:100%;margin-top:14px;padding:12px;background:#2a2a3e;border:1px solid #444;border-radius:10px;cursor:pointer;color:#888;font-size:13px;">Cancel</button>' +
            '</div>';
            document.body.appendChild(m);
            m.addEventListener('click',function(e){if(e.target===m)m.remove()});

            window._storyCamera = function() {
                document.getElementById('story-fix').remove();
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false})
                        .then(function(stream) {
                            var p = document.createElement('div'); p.id='story-cam';
                            p.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:100002;display:flex;flex-direction:column;';
                            p.innerHTML = '<div style="padding:14px;display:flex;justify-content:space-between;position:absolute;top:0;left:0;right:0;z-index:2;"><button onclick="window._closeCam()" style="background:rgba(0,0,0,0.5);border:none;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:16px;">✕</button><span style="font-weight:600;color:#fff;">Camera</span><button onclick="window._flipCam()" style="background:rgba(0,0,0,0.5);border:none;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:14px;">🔄</button></div><video id="cam-vid" autoplay playsinline muted style="flex:1;object-fit:cover;width:100%;"></video><div style="padding:20px;display:flex;justify-content:center;position:absolute;bottom:20px;left:0;right:0;z-index:2;"><button onclick="window._capture()" style="width:64px;height:64px;border-radius:50%;border:4px solid #fff;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;"><div style="width:50px;height:50px;border-radius:50%;background:#fff;"></div></button></div>';
                            document.body.appendChild(p);
                            document.getElementById('cam-vid').srcObject = stream;
                            window._camStream = stream;
                            window._closeCam = function(){if(window._camStream)window._camStream.getTracks().forEach(function(t){t.stop()});var e=document.getElementById('story-cam');if(e)e.remove()};
                            window._capture = function(){window._closeCam();showToast('📸 Story captured!')};
                            window._flipCam = function(){if(window._camStream)window._camStream.getTracks().forEach(function(t){t.stop()});var f=window._camFace||'user';var nf=f==='user'?'environment':'user';window._camFace=nf;navigator.mediaDevices.getUserMedia({video:{facingMode:nf}}).then(function(ns){document.getElementById('cam-vid').srcObject=ns;window._camStream=ns}).catch(function(){showToast('Cannot switch camera')})};
                        })
                        .catch(function() { showToast('📷 Camera not available. Opening gallery...'); window._storyGallery(); });
                } else { showToast('Camera not supported'); window._storyGallery(); }
            };

            window._storyGallery = function() {
                var p = document.getElementById('story-fix'); if(p)p.remove();
                var f = document.createElement('input'); f.type='file'; f.accept='image/*,video/*'; f.style.display='none';
                f.addEventListener('change',function(){if(f.files&&f.files[0]){showToast('📸 Story created: '+f.files[0].name);}document.body.removeChild(f)});
                document.body.appendChild(f); f.click();
            };

            window._storyText = function() {
                var p = document.getElementById('story-fix'); if(p)p.remove();
                var grads = ['linear-gradient(135deg,#6366f1,#8b5cf6)','linear-gradient(135deg,#ef4444,#f59e0b)','linear-gradient(135deg,#10b981,#06b6d4)','linear-gradient(135deg,#3b82f6,#60a5fa)','linear-gradient(135deg,#ec4899,#f472b6)','linear-gradient(135deg,#1e293b,#475569)'];
                var c = document.createElement('div'); c.id='text-story';
                c.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:100002;display:flex;flex-direction:column;';
                c.innerHTML = '<div id="ts-bg" style="flex:1;background:'+grads[0]+';display:flex;flex-direction:column;"><div style="padding:14px;display:flex;justify-content:space-between;"><button onclick="document.getElementById(\'text-story\').remove()" style="background:rgba(0,0,0,0.3);border:none;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:14px;">✕</button><span style="font-weight:600;color:#fff;">Text Story</span><button onclick="document.getElementById(\'text-story\').remove();showToast(\'⭐ Story published!\')" style="background:rgba(255,255,255,0.25);border:none;color:#fff;padding:8px 16px;border-radius:20px;cursor:pointer;font-weight:600;">Share</button></div><div style="flex:1;display:flex;align-items:center;justify-content:center;padding:24px;"><textarea placeholder="Type your story..." style="background:transparent;border:none;color:#fff;font-size:24px;font-weight:700;text-align:center;width:100%;resize:none;outline:none;min-height:100px;text-shadow:0 2px 6px rgba(0,0,0,0.3);" rows="3"></textarea></div><div style="padding:16px;display:flex;justify-content:center;gap:8px;">'+grads.map(function(g){return '<button onclick="document.getElementById(\'ts-bg\').style.background=\''+g+'\'" style="width:32px;height:32px;border-radius:50%;background:'+g+';border:3px solid #fff;cursor:pointer;"></button>'}).join('')+'</div></div>';
                document.body.appendChild(c);
            };
        };
        console.log('[Fix7] ✅ Story camera/gallery');
    }

    // ==========================================
    // Add Tag People button + Location button to create post
    // ==========================================
    function injectTagPeopleButton() {
        var createModal = document.getElementById('createPostModal');
        if (!createModal) return;
        // Find action buttons area (Photo, Video, etc.)
        var allBtns = createModal.querySelectorAll('button, .action-btn, [onclick]');
        var actionRow = null;
        allBtns.forEach(function(b) {
            var t = (b.textContent||'').toLowerCase();
            if (t.includes('photo') || t.includes('video') || t.includes('location')) {
                actionRow = b.parentElement;
            }
        });
        if (actionRow) {
            // Add Tag People button if not present
            if (!actionRow.querySelector('[onclick*="openTagPeople"]')) {
                var tagBtn = document.createElement('button');
                tagBtn.className = 'action-btn';
                tagBtn.setAttribute('onclick', 'openTagPeople()');
                tagBtn.innerHTML = '👥 Tag People';
                tagBtn.style.cssText = 'padding:8px 12px;background:#2a2a3e;border:1px solid #444;border-radius:10px;color:#fff;cursor:pointer;font-size:12px;';
                actionRow.appendChild(tagBtn);
            }
            // Make location button work
            allBtns.forEach(function(b) {
                if ((b.textContent||'').toLowerCase().includes('location')) {
                    b.onclick = function(e) { e.preventDefault(); openLocationPicker(); };
                }
            });
        }
        console.log('[Enhancement] ✅ Tag People + Location buttons injected');
    }

    // Utility: add attachment indicator
    function addIndicator(text, type) {
        var modal = document.getElementById('createPostModal');
        if (!modal) return;
        var ex = modal.querySelector('.fix-attachment-ind[data-type="'+type+'"]');
        if (ex) ex.remove();
        var ind = document.createElement('div');
        ind.className = 'fix-attachment-ind';
        ind.dataset.type = type;
        ind.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:rgba(99,102,241,0.1);border:1px solid #333;border-radius:8px;margin:6px 14px;font-size:12px;color:#fff;';
        ind.innerHTML = '<span>'+text+'</span><button onclick="this.parentElement.remove();window._attached'+(type==='location'?'Location':'Photo')+'=null;" style="background:none;border:none;color:#888;cursor:pointer;font-size:14px;">✕</button>';
        var ta = modal.querySelector('textarea');
        if (ta) ta.parentElement.insertAdjacentElement('afterend', ind);
    }

    // CSS animations
    var st = document.createElement('style');
    st.textContent = '@keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}.loc-item:hover,.tag-item:hover{background:rgba(99,102,241,0.1)!important}';
    document.head.appendChild(st);

})();
