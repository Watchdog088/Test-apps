// ========== FEED SCREEN SYSTEM - COMPLETE IMPLEMENTATION ==========
// This file implements all Feed Screen functionality

(function() {
    'use strict';

    // ========== FEED STATE MANAGEMENT ==========
    
    const FeedState = {
        posts: [],
        currentPage: 1,
        postsPerPage: 10,
        hasMore: true,
        isLoading: false,
        filters: {
            privacy: 'all',
            type: 'all',
            feeling: null
        },
        lastRefresh: null
    };

    // ========== POST CLASS ==========
    
    class Post {
        constructor(data) {
            this.id = data.id || Date.now() + Math.random();
            this.userId = data.userId || 'current_user';
            this.author = data.author || 'John Doe';
            this.authorAvatar = data.authorAvatar || '👤';
            this.content = data.content || '';
            this.photo = data.photo || null;
            this.video = data.video || null;
            this.location = data.location || null;
            this.taggedPeople = data.taggedPeople || [];
            this.feeling = data.feeling || null;
            this.privacy = data.privacy || '🌍 Public';
            this.timestamp = data.timestamp || new Date();
            this.likes = data.likes || 0;
            this.comments = data.comments || [];
            this.shares = data.shares || 0;
            this.isLiked = data.isLiked || false;
            this.isEdited = data.isEdited || false;
        }

        getRelativeTime() {
            const now = new Date();
            const diff = Math.floor((now - new Date(this.timestamp)) / 1000);

            if (diff < 60) return 'Just now';
            if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
            if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
            if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
            if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
            return `${Math.floor(diff / 2592000)}mo ago`;
        }

        toHTML() {
            const feelingText = this.feeling ? ` — feeling ${this.feeling}` : '';
            const locationText = this.location ? ` at ${this.location}` : '';
            const taggedText = this.taggedPeople.length > 0 ? ` with ${this.taggedPeople.map(p => p.name).join(', ')}` : '';
            const editedBadge = this.isEdited ? '<span style="font-size: 11px; color: var(--text-muted);">(edited)</span>' : '';

            return `
                <div class="post-card" data-post-id="${this.id}">
                    <div class="post-header">
                        <div class="post-avatar">${this.authorAvatar}</div>
                        <div class="post-header-info">
                            <div class="post-author">${this.author}${feelingText}${locationText}${taggedText}</div>
                            <div class="post-meta">
                                <span class="post-timestamp" data-timestamp="${this.timestamp}">${this.getRelativeTime()}</span> • ${this.privacy} ${editedBadge}
                            </div>
                        </div>
                        <div class="post-menu" onclick="FeedSystem.openPostOptions('${this.id}')">⋯</div>
                    </div>
                    ${this.content ? `<div class="post-content">${this.content}</div>` : ''}
                    ${this.photo ? `<div class="post-image">${this.photo}</div>` : ''}
                    ${this.video ? `<div class="post-image">${this.video}</div>` : ''}
                    <div class="post-actions">
                        <div class="post-action ${this.isLiked ? 'active' : ''}" onclick="FeedSystem.toggleLike('${this.id}', this)">
                            <span>${this.isLiked ? '❤️' : '👍'}</span> 
                            <span class="post-like-count">${this.likes > 0 ? this.likes : ''}</span> Like
                        </div>
                        <div class="post-action" onclick="FeedSystem.openComments('${this.id}')">
                            <span>💬</span> 
                            <span class="post-comment-count">${this.comments.length > 0 ? this.comments.length : ''}</span> Comment
                        </div>
                        <div class="post-action" onclick="FeedSystem.sharePost('${this.id}')">
                            <span>🔄</span> 
                            <span class="post-share-count">${this.shares > 0 ? this.shares : ''}</span> Share
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // ========== FEED SYSTEM ==========
    
    window.FeedSystem = {
        init: function() {
            this.loadSamplePosts();
            this.setupInfiniteScroll();
            this.setupRefreshMechanism();
            this.startTimestampUpdates();
            this.setupFilterButtons();
            this.enhancePublishPost();
            console.log('Feed System initialized');
        },

        loadSamplePosts: function() {
            const samplePosts = [
                new Post({
                    id: 'post_1',
                    author: 'Sarah Johnson',
                    authorAvatar: '👤',
                    content: 'Just finished an amazing project! Feeling proud 🎉',
                    photo: '🎨',
                    privacy: '🌍 Public',
                    timestamp: new Date(Date.now() - 7200000),
                    likes: 45,
                    comments: [{author: 'Mike', text: 'Great!'}],
                    shares: 5,
                    feeling: '😊 Proud'
                }),
                new Post({
                    id: 'post_2',
                    author: 'Mike Chen',
                    authorAvatar: '😊',
                    content: 'Beautiful sunset today! Nature is amazing 🌅',
                    photo: '🌅',
                    privacy: '👥 Friends',
                    timestamp: new Date(Date.now() - 18000000),
                    likes: 32,
                    shares: 2
                })
            ];
            
            FeedState.posts = samplePosts;
            this.renderFeed();
        },

        renderFeed: function(scroll = false) {
            const feedScreen = document.getElementById('feed-screen');
            if (!feedScreen) return;

            const createPostCard = feedScreen.querySelector('.card');
            if (!createPostCard) return;

            const existingPosts = feedScreen.querySelectorAll('.post-card');
            existingPosts.forEach(post => post.remove());

            const filteredPosts = this.filterPosts();
            filteredPosts.forEach(post => {
                createPostCard.insertAdjacentHTML('afterend', post.toHTML());
            });

            this.updateAllTimestamps();
            if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        filterPosts: function() {
            let filtered = [...FeedState.posts];

            if (FeedState.filters.privacy !== 'all') {
                filtered = filtered.filter(post => {
                    if (FeedState.filters.privacy === 'public') return post.privacy.includes('Public');
                    if (FeedState.filters.privacy === 'friends') return post.privacy.includes('Friends');
                    if (FeedState.filters.privacy === 'only_me') return post.privacy.includes('Only Me');
                    return true;
                });
            }

            if (FeedState.filters.type !== 'all') {
                filtered = filtered.filter(post => {
                    if (FeedState.filters.type === 'text') return !post.photo && !post.video;
                    if (FeedState.filters.type === 'photo') return post.photo !== null;
                    if (FeedState.filters.type === 'video') return post.video !== null;
                    return true;
                });
            }

            return filtered;
        },

        createPost: function(postData) {
            const newPost = new Post({
                ...postData, 
                author: 'John Doe', 
                authorAvatar: '👤', 
                timestamp: new Date(),
                likes: 0,
                comments: [],
                shares: 0,
                isLiked: false,
                isEdited: false
            });
            
            FeedState.posts.unshift(newPost);
            this.renderFeed(true);
            
            // Simulate backend API call
            this.simulateAPICall('POST', '/api/posts', newPost);
            
            // Show success with post details
            window.showToast(`✓ Post created with ${newPost.privacy} privacy`);
            
            // Simulate real-time notification to followers (for demo)
            if (newPost.privacy === '🌍 Public') {
                setTimeout(() => {
                    window.showToast('📢 Your post is now visible to everyone');
                }, 1000);
            } else if (newPost.privacy === '👥 Friends') {
                setTimeout(() => {
                    window.showToast('👥 Your post is visible to friends only');
                }, 1000);
            } else if (newPost.privacy === '🔒 Only Me') {
                setTimeout(() => {
                    window.showToast('🔒 Your post is private - only you can see it');
                }, 1000);
            }
            
            return newPost.id;
        },

        editPost: function(postId, newContent) {
            const post = FeedState.posts.find(p => p.id === postId);
            if (!post) {
                window.showToast('❌ Post not found');
                return;
            }

            Object.assign(post, newContent, {isEdited: true});
            this.renderFeed();
            this.simulateAPICall('PUT', `/api/posts/${postId}`, post);
            window.showToast('✓ Post updated successfully!');
            
            // Show analytics update
            setTimeout(() => {
                window.showToast('📊 Update applied to ' + this.filterPosts().length + ' posts in feed');
            }, 1500);
        },

        deletePost: function(postId) {
            const index = FeedState.posts.findIndex(p => p.id === postId);
            if (index === -1) {
                window.showToast('❌ Post not found');
                return;
            }

            const post = FeedState.posts[index];
            FeedState.posts.splice(index, 1);
            this.renderFeed();
            this.simulateAPICall('DELETE', `/api/posts/${postId}`);
            window.showToast('🗑️ Post deleted successfully');
            
            // Show confirmation
            setTimeout(() => {
                window.showToast('✓ Feed updated - Post removed');
            }, 1000);
        },

        toggleLike: function(postId, element) {
            const post = FeedState.posts.find(p => p.id === postId);
            if (!post) {
                window.showToast('❌ Post not found');
                return;
            }

            post.isLiked = !post.isLiked;
            post.likes += post.isLiked ? 1 : -1;

            const icon = element.querySelector('span:first-child');
            const count = element.querySelector('.post-like-count');
            
            if (post.isLiked) {
                element.classList.add('active');
                icon.textContent = '❤️';
                window.showToast('❤️ Liked!');
                
                // Animate the like
                element.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 200);
            } else {
                element.classList.remove('active');
                icon.textContent = '👍';
                window.showToast('Like removed');
            }
            
            count.textContent = post.likes > 0 ? post.likes : '';
            this.simulateAPICall('POST', `/api/posts/${postId}/like`, {liked: post.isLiked});
            
            // Show engagement update
            setTimeout(() => {
                window.showToast(`👍 ${post.likes} ${post.likes === 1 ? 'like' : 'likes'} total`);
            }, 1000);
        },

        sharePost: function(postId) {
            const post = FeedState.posts.find(p => p.id === postId);
            if (!post) {
                window.showToast('❌ Post not found');
                return;
            }

            post.shares += 1;
            const postCard = document.querySelector(`[data-post-id="${postId}"]`);
            if (postCard) {
                const shareCount = postCard.querySelector('.post-share-count');
                if (shareCount) shareCount.textContent = post.shares;
            }

            window.showToast('🔄 Post shared successfully!');
            this.simulateAPICall('POST', `/api/posts/${postId}/share`);
            
            // Show share confirmation with options
            setTimeout(() => {
                this.showShareOptions(post);
            }, 500);
        },

        showShareOptions: function(post) {
            const options = ['Facebook', 'Twitter', 'WhatsApp', 'Copy Link'];
            const randomOption = options[Math.floor(Math.random() * options.length)];
            window.showToast(`📤 Share to ${randomOption}?`);
        },

        openComments: function(postId) {
            window.currentPostForComments = postId;
            window.openModal('comments');
        },

        openPostOptions: function(postId) {
            window.currentPostForOptions = postId;
            window.openModal('postOptions');
        },

        setupInfiniteScroll: function() {
            window.addEventListener('scroll', () => {
                if (FeedState.isLoading || !FeedState.hasMore) return;

                const scrollHeight = document.documentElement.scrollHeight;
                const scrollTop = window.pageYOffset;
                const clientHeight = window.innerHeight;

                if (scrollHeight - (scrollTop + clientHeight) < 200) {
                    this.loadMorePosts();
                }
            });
        },

        loadMorePosts: function() {
            if (FeedState.isLoading) return;
            
            FeedState.isLoading = true;
            window.showToast('Loading more... 📄');

            setTimeout(() => {
                const morePosts = this.generateSamplePosts(5);
                FeedState.posts.push(...morePosts);
                
                const feedScreen = document.getElementById('feed-screen');
                morePosts.forEach(post => {
                    feedScreen.insertAdjacentHTML('beforeend', post.toHTML());
                });

                if (FeedState.currentPage >= 3) FeedState.hasMore = false;
                FeedState.currentPage++;
                FeedState.isLoading = false;
            }, 1000);
        },

        generateSamplePosts: function(count) {
            const posts = [];
            const authors = ['Alex Smith', 'Jordan Taylor', 'Casey Morgan'];
            const avatars = ['😎', '🚀', '🌟'];

            for (let i = 0; i < count; i++) {
                posts.push(new Post({
                    author: authors[i % 3],
                    authorAvatar: avatars[i % 3],
                    content: 'Great content here!',
                    privacy: '🌍 Public',
                    timestamp: new Date(Date.now() - (i * 3600000)),
                    likes: Math.floor(Math.random() * 50)
                }));
            }
            return posts;
        },

        refreshFeed: function() {
            window.showToast('🔄 Refreshing feed...');
            FeedState.lastRefresh = new Date();
            
            setTimeout(() => {
                const newPosts = this.generateSamplePosts(2);
                FeedState.posts.unshift(...newPosts);
                this.renderFeed(true);
                const lastRefreshTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                window.showToast(`✓ Feed refreshed! ${newPosts.length} new posts`);
                
                // Show last refresh time
                setTimeout(() => {
                    window.showToast(`⏰ Last updated: ${lastRefreshTime}`);
                }, 1500);
            }, 1000);
        },

        setupRefreshMechanism: function() {
            let touchStartY = 0;

            window.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
            }, {passive: true});

            window.addEventListener('touchend', (e) => {
                const touchEndY = e.changedTouches[0].clientY;
                if (window.scrollY === 0 && (touchEndY - touchStartY) > 100) {
                    this.refreshFeed();
                }
            }, {passive: true});
        },

        updateAllTimestamps: function() {
            document.querySelectorAll('.post-timestamp').forEach(ts => {
                const timestamp = new Date(ts.dataset.timestamp);
                const post = FeedState.posts.find(p => p.timestamp.toString() === timestamp.toString());
                if (post) ts.textContent = post.getRelativeTime();
            });
        },

        startTimestampUpdates: function() {
            setInterval(() => this.updateAllTimestamps(), 60000);
        },

        setupFilterButtons: function() {
            const feedScreen = document.getElementById('feed-screen');
            if (!feedScreen) return;

            const createPostCard = feedScreen.querySelector('.card');
            if (!createPostCard) return;

            const filterHTML = `
                <div id="feedFilterButton" style="background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; padding: 12px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;" onclick="FeedSystem.openFilterModal()">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 18px;">🔍</span>
                        <span style="font-size: 14px; font-weight: 600;">Filter Feed</span>
                    </div>
                    <div id="filterIndicator" style="font-size: 12px; color: var(--text-secondary);">No filters</div>
                </div>
            `;

            createPostCard.insertAdjacentHTML('afterend', filterHTML);
        },

        openFilterModal: function() {
            const modalHTML = `
                <div id="feedFilterModal" class="modal show">
                    <div class="modal-header">
                        <div class="modal-close" onclick="FeedSystem.closeFilterModal()">✕</div>
                        <div class="modal-title">🔍 Filter Feed</div>
                        <button class="btn" style="width: auto; padding: 8px 20px;" onclick="FeedSystem.clearFilters()">Clear</button>
                    </div>
                    <div class="modal-content">
                        <div class="section-header"><div class="section-title">Privacy</div></div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
                            <div class="interest-tag ${FeedState.filters.privacy === 'all' ? 'selected' : ''}" onclick="FeedSystem.setFilter('privacy', 'all', this)">All</div>
                            <div class="interest-tag ${FeedState.filters.privacy === 'public' ? 'selected' : ''}" onclick="FeedSystem.setFilter('privacy', 'public', this)">🌍 Public</div>
                            <div class="interest-tag ${FeedState.filters.privacy === 'friends' ? 'selected' : ''}" onclick="FeedSystem.setFilter('privacy', 'friends', this)">👥 Friends</div>
                        </div>
                        <div class="section-header"><div class="section-title">Type</div></div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
                            <div class="interest-tag ${FeedState.filters.type === 'all' ? 'selected' : ''}" onclick="FeedSystem.setFilter('type', 'all', this)">All</div>
                            <div class="interest-tag ${FeedState.filters.type === 'text' ? 'selected' : ''}" onclick="FeedSystem.setFilter('type', 'text', this)">📝 Text</div>
                            <div class="interest-tag ${FeedState.filters.type === 'photo' ? 'selected' : ''}" onclick="FeedSystem.setFilter('type', 'photo', this)">📷 Photo</div>
                            <div class="interest-tag ${FeedState.filters.type === 'video' ? 'selected' : ''}" onclick="FeedSystem.setFilter('type', 'video', this)">🎥 Video</div>
                        </div>
                        <button class="btn" onclick="FeedSystem.applyFilters()">Apply Filters</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        },

        closeFilterModal: function() {
            const modal = document.getElementById('feedFilterModal');
            if (modal) modal.remove();
        },

        setFilter: function(filterType, value, element) {
            element.parentElement.querySelectorAll('.interest-tag').forEach(tag => tag.classList.remove('selected'));
            element.classList.add('selected');
            FeedState.filters[filterType] = value;
        },

        clearFilters: function() {
            FeedState.filters = {privacy: 'all', type: 'all', feeling: null};
            const modal = document.getElementById('feedFilterModal');
            if (modal) {
                modal.querySelectorAll('.interest-tag').forEach(tag => tag.classList.remove('selected'));
                modal.querySelectorAll('.interest-tag')[0]?.classList.add('selected');
                modal.querySelectorAll('.interest-tag')[4]?.classList.add('selected');
            }
            window.showToast('Filters cleared');
        },

        applyFilters: function() {
            this.closeFilterModal();
            const beforeCount = FeedState.posts.length;
            this.renderFeed(true);
            const afterCount = this.filterPosts().length;
            this.updateFilterIndicator();
            window.showToast(`✓ Filters applied - Showing ${afterCount} of ${beforeCount} posts`);
            
            // Show filter summary
            setTimeout(() => {
                let filterSummary = [];
                if (FeedState.filters.privacy !== 'all') filterSummary.push(FeedState.filters.privacy);
                if (FeedState.filters.type !== 'all') filterSummary.push(FeedState.filters.type);
                if (filterSummary.length > 0) {
                    window.showToast(`📌 Active filters: ${filterSummary.join(', ')}`);
                }
            }, 2000);
        },

        updateFilterIndicator: function() {
            const indicator = document.getElementById('filterIndicator');
            if (!indicator) return;

            const count = (FeedState.filters.privacy !== 'all' ? 1 : 0) + (FeedState.filters.type !== 'all' ? 1 : 0);
            indicator.textContent = count > 0 ? `${count} active` : 'No filters';
            indicator.style.color = count > 0 ? 'var(--primary)' : 'var(--text-secondary)';
        },

        enhancePublishPost: function() {
            window.publishPostEnhanced = (feeling) => {
                const text = document.getElementById('postTextContent').value;
                const privacy = document.getElementById('postPrivacy').textContent;
                
                // Validation
                if (!text && !window.selectedPhotoForPost && !window.selectedVideoForPost) {
                    window.showToast('❌ Please add some content to your post');
                    return;
                }
                
                const postData = {
                    content: text,
                    photo: window.selectedPhotoForPost,
                    video: window.selectedVideoForPost,
                    location: window.selectedLocationForPost,
                    taggedPeople: window.taggedPeopleInPost || [],
                    feeling: feeling || window.selectedFeelingForPost,
                    privacy: privacy
                };

                const postId = this.createPost(postData);

                // Clear form
                document.getElementById('postTextContent').value = '';
                window.selectedPhotoForPost = null;
                window.selectedVideoForPost = null;
                window.selectedLocationForPost = null;
                window.taggedPeopleInPost = [];
                window.selectedFeelingForPost = null;
                document.getElementById('postPrivacy').textContent = '🌍 Public';
                
                document.getElementById('selectedPhotoPreview').style.display = 'none';
                document.getElementById('selectedVideoPreview').style.display = 'none';
                document.getElementById('selectedLocation').style.display = 'none';
                document.getElementById('taggedPeople').style.display = 'none';

                window.closeModal('createPost');
                window.showToast('✓ Post published successfully!');
                
                // Simulate real-time update notification
                setTimeout(() => {
                    window.showToast('📊 Post analytics: 0 views so far');
                }, 2000);
            };
        },

        simulateAPICall: function(method, endpoint, data) {
            console.log(`📡 API Call: ${method} ${endpoint}`, data);
            return new Promise((resolve) => {
                setTimeout(() => {
                    const response = {
                        success: true, 
                        data: data,
                        timestamp: new Date().toISOString()
                    };
                    console.log('✓ API Response:', response);
                    resolve(response);
                }, 500);
            });
        },

        // Real-time feed simulation
        startRealTimeUpdates: function() {
            // Simulate receiving new posts from other users
            setInterval(() => {
                if (Math.random() > 0.7 && FeedState.posts.length < 50) {
                    const newPost = this.generateSamplePosts(1)[0];
                    FeedState.posts.unshift(newPost);
                    
                    // Only show notification if user is on feed screen
                    const feedScreen = document.getElementById('feed-screen');
                    if (feedScreen && feedScreen.classList.contains('active')) {
                        window.showInAppNotification(
                            '🔔',
                            'New Post',
                            `${newPost.author} just posted`,
                            { type: 'newPost', postId: newPost.id }
                        );
                        
                        // Auto-refresh feed to show new post
                        setTimeout(() => {
                            this.renderFeed(false);
                        }, 500);
                    }
                }
            }, 30000); // Check every 30 seconds
        }
    };

    // ========== ENHANCED POST FEATURES ==========
    
    // Override publishPost function with edit support
    window.publishPost = function() {
        if (window.editingPostId) {
            // Edit existing post
            const text = document.getElementById('postTextContent').value;
            const privacy = document.getElementById('postPrivacy').textContent;
            
            const updatedData = {
                content: text,
                photo: window.selectedPhotoForPost,
                video: window.selectedVideoForPost,
                location: window.selectedLocationForPost,
                taggedPeople: window.taggedPeopleInPost || [],
                feeling: window.selectedFeelingForPost,
                privacy: privacy
            };
            
            window.FeedSystem.editPost(window.editingPostId, updatedData);
            window.editingPostId = null;
            
            // Clear form
            document.getElementById('postTextContent').value = '';
            window.selectedPhotoForPost = null;
            window.selectedVideoForPost = null;
            window.selectedLocationForPost = null;
            window.taggedPeopleInPost = [];
            window.selectedFeelingForPost = null;
            document.getElementById('postPrivacy').textContent = '🌍 Public';
            
            document.getElementById('selectedPhotoPreview').style.display = 'none';
            document.getElementById('selectedVideoPreview').style.display = 'none';
            document.getElementById('selectedLocation').style.display = 'none';
            document.getElementById('taggedPeople').style.display = 'none';
            
            window.closeModal('createPost');
        } else {
            // Create new post
            const feeling = window.selectedFeelingForPost;
            window.publishPostEnhanced(feeling);
        }
    };

    // Edit post from options menu
    window.editPostFromMenu = function() {
        const postId = window.currentPostForOptions;
        const post = FeedState.posts.find(p => p.id === postId);
        if (!post) {
            window.showToast('❌ Post not found');
            return;
        }

        window.closeModal('postOptions');
        
        // Populate form with existing post data
        document.getElementById('postTextContent').value = post.content || '';
        window.selectedPhotoForPost = post.photo;
        window.selectedVideoForPost = post.video;
        window.selectedLocationForPost = post.location;
        window.taggedPeopleInPost = post.taggedPeople || [];
        window.selectedFeelingForPost = post.feeling;
        document.getElementById('postPrivacy').textContent = post.privacy;

        // Show previews
        if (post.photo) {
            document.getElementById('photoPreview').textContent = post.photo;
            document.getElementById('selectedPhotoPreview').style.display = 'block';
        }
        if (post.video) {
            document.getElementById('videoPreview').textContent = post.video;
            document.getElementById('selectedVideoPreview').style.display = 'block';
        }
        if (post.location) {
            document.getElementById('selectedLocation').style.display = 'block';
            document.getElementById('locationText').textContent = post.location;
        }
        if (post.taggedPeople && post.taggedPeople.length > 0) {
            window.updateTaggedPeopleDisplay();
        }

        // Set editing mode
        window.editingPostId = postId;
        
        // Update modal title
        setTimeout(() => {
            const modalTitle = document.querySelector('#createPostModal .modal-title');
            if (modalTitle) modalTitle.textContent = 'Edit Post';
            const publishBtn = document.querySelector('#createPostModal .btn');
            if (publishBtn) publishBtn.textContent = 'Save';
        }, 100);
        
        window.openModal('createPost');
        window.showToast('✏️ Editing post...');
    };

    // Delete post from options menu with confirmation
    window.deletePostFromMenu = function() {
        const postId = window.currentPostForOptions;
        window.closeModal('postOptions');
        
        // Show confirmation dialog
        const confirmed = confirm('🗑️ Delete this post?\n\nThis action cannot be undone.');
        
        if (confirmed) {
            window.FeedSystem.deletePost(postId);
        } else {
            window.showToast('Deletion cancelled');
        }
    };

    // Feeling selection with visual feedback
    window.selectFeeling = function(feeling) {
        window.selectedFeelingForPost = feeling;
        window.closeModal('addFeeling');
        window.showToast(`✓ Feeling ${feeling} selected`);
        
        // Update create post UI to show selected feeling
        setTimeout(() => {
            const createPostModal = document.getElementById('createPostModal');
            if (createPostModal && createPostModal.classList.contains('show')) {
                window.showToast(`💭 Your post will include: ${feeling}`);
            }
        }, 500);
    };

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            FeedSystem.init();
            FeedSystem.startRealTimeUpdates();
        });
    } else {
        FeedSystem.init();
        FeedSystem.startRealTimeUpdates();
    }

})();
