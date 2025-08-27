/**
 * ConnectHub - 7 Missing Social Media UI Interfaces
 * Comprehensive implementation of missing social media functionality
 */

class SocialMissingUIComponents {
    constructor(app) {
        this.app = app;
        this.currentPostDetail = null;
        this.commentsData = new Map();
        this.userProfilesCache = new Map();
        this.followingUsers = new Set();
        this.storyCreationData = null;
        this.currentStoryViewer = null;
        this.storyProgressTimer = null;
        
        this.init();
    }

    /**
     * Initialize all missing social media UI components
     */
    init() {
        console.log('Initializing 7 Missing Social Media UI Components...');
        
        // 1. Post Detail View/Modal
        this.initializePostDetailModal();
        
        // 2. Comments Section Interface
        this.initializeCommentsInterface();
        
        // 3. User Profile Pages (other users)
        this.initializeUserProfilePages();
        
        // 4. Follow/Unfollow Interface
        this.initializeFollowUnfollowInterface();
        
        // 5. Advanced Post Creation (polls, locations, feelings)
        this.initializeAdvancedPostCreation();
        
        // 6. Story Creation Interface
        this.initializeStoryCreationInterface();
        
        // 7. Story Viewer Interface
        this.initializeStoryViewerInterface();
        
        console.log('All 7 Missing Social Media UI Components initialized successfully');
    }

    // =================================================================================
    // 1. POST DETAIL VIEW/MODAL
    // =================================================================================
    
    initializePostDetailModal() {
        this.createPostDetailModal();
        this.setupPostDetailListeners();
    }

    createPostDetailModal() {
        const postDetailModalHTML = `
            <div id="post-detail-modal" class="modal post-detail-modal">
                <div class="modal-overlay" onclick="socialMissingUI.closePostDetail()"></div>
                <div class="post-detail-container">
                    <div class="post-detail-header">
                        <button class="close-post-detail" onclick="socialMissingUI.closePostDetail()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="post-detail-content">
                        <div class="post-detail-main">
                            <div class="post-detail-media" id="post-detail-media"></div>
                        </div>
                        <div class="post-detail-sidebar">
                            <div class="post-detail-info">
                                <div class="post-author-info">
                                    <img src="" alt="" class="post-author-avatar" id="detail-author-avatar">
                                    <div class="author-details">
                                        <h4 class="author-name" id="detail-author-name"></h4>
                                        <span class="post-timestamp" id="detail-post-timestamp"></span>
                                    </div>
                                    <button class="follow-author-btn" id="detail-follow-btn">Follow</button>
                                </div>
                                <div class="post-detail-text" id="post-detail-text"></div>
                                <div class="post-detail-stats" id="post-detail-stats"></div>
                                <div class="post-detail-actions">
                                    <button class="post-action-btn like-btn" id="detail-like-btn">
                                        <i class="far fa-heart"></i>
                                        <span class="action-count">0</span>
                                    </button>
                                    <button class="post-action-btn comment-btn" id="detail-comment-btn">
                                        <i class="far fa-comment"></i>
                                        <span class="action-count">0</span>
                                    </button>
                                    <button class="post-action-btn share-btn" id="detail-share-btn">
                                        <i class="far fa-share-square"></i>
                                        <span class="action-count">0</span>
                                    </button>
                                    <button class="post-action-btn save-btn" id="detail-save-btn">
                                        <i class="far fa-bookmark"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="post-detail-comments" id="post-detail-comments-section"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', postDetailModalHTML);
    }

    setupPostDetailListeners() {
        document.addEventListener('click', (e) => {
            const postElement = e.target.closest('.feed-post');
            if (!postElement) return;

            const shouldExpand = e.target.closest('.post-media') || 
                               e.target.closest('.post-content h3') ||
                               e.target.classList.contains('view-post-detail');

            if (shouldExpand) {
                e.preventDefault();
                const postId = postElement.dataset.postId;
                if (postId) {
                    this.openPostDetail(postId);
                }
            }
        });

        this.setupPostDetailInteractions();
    }

    setupPostDetailInteractions() {
        const modal = document.getElementById('post-detail-modal');
        if (!modal) return;

        modal.querySelector('#detail-like-btn')?.addEventListener('click', () => this.togglePostLike());
        modal.querySelector('#detail-comment-btn')?.addEventListener('click', () => this.scrollToComments());
        modal.querySelector('#detail-share-btn')?.addEventListener('click', () => this.sharePostDetail());
        modal.querySelector('#detail-save-btn')?.addEventListener('click', () => this.togglePostSave());
        modal.querySelector('#detail-follow-btn')?.addEventListener('click', () => this.toggleFollowAuthor());

        document.addEventListener('keydown', (e) => {
            if (modal.classList.contains('show') && e.key === 'Escape') {
                this.closePostDetail();
            }
        });
    }

    async openPostDetail(postId) {
        const modal = document.getElementById('post-detail-modal');
        if (!modal) return;

        this.showPostDetailLoading();
        modal.classList.add('show');

        try {
            const postData = await this.loadPostDetail(postId);
            if (postData) {
                this.currentPostDetail = postData;
                this.renderPostDetail(postData);
                this.loadPostDetailComments(postId);
            }
        } catch (error) {
            console.error('Failed to load post detail:', error);
            this.app.showToast('Failed to load post', 'error');
            this.closePostDetail();
        }
    }

    showPostDetailLoading() {
        const modal = document.getElementById('post-detail-modal');
        const mediaContainer = modal.querySelector('#post-detail-media');
        const sidebar = modal.querySelector('.post-detail-sidebar');

        if (mediaContainer) {
            mediaContainer.innerHTML = `<div class="loading-skeleton skeleton-image"></div>`;
        }

        if (sidebar) {
            sidebar.innerHTML = `
                <div class="loading-skeleton skeleton-text"></div>
                <div class="loading-skeleton skeleton-text short"></div>
            `;
        }
    }

    async loadPostDetail(postId) {
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockPosts = {
            'post-1': {
                id: 'post-1',
                author: {
                    id: 'user-2',
                    name: 'Emma Watson',
                    username: 'emmawatson',
                    avatar: 'https://via.placeholder.com/150x150/42b72a/ffffff?text=EW',
                    verified: true,
                    followers: 2300000
                },
                content: {
                    text: 'Amazing sunset from yesterday\'s hike! The colors were absolutely breathtaking. Nature never fails to amaze me 🌅✨ #photography #nature #sunset #hiking',
                    media: [
                        {
                            type: 'image',
                            url: 'https://source.unsplash.com/800x600/?sunset,photography',
                            alt: 'Beautiful sunset photography'
                        }
                    ]
                },
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
                location: 'Rocky Mountain National Park',
                stats: {
                    likes: 1245,
                    comments: 89,
                    shares: 34,
                    saves: 156
                },
                userInteractions: {
                    liked: false,
                    saved: false,
                    following: false
                }
            }
        };

        return mockPosts[postId] || null;
    }

    renderPostDetail(postData) {
        const modal = document.getElementById('post-detail-modal');
        if (!modal || !postData) return;

        const mediaContainer = modal.querySelector('#post-detail-media');
        if (mediaContainer && postData.content.media.length > 0) {
            const media = postData.content.media[0];
            mediaContainer.innerHTML = `<img src="${media.url}" alt="${media.alt}" class="post-detail-image">`;
        }

        const authorAvatar = modal.querySelector('#detail-author-avatar');
        const authorName = modal.querySelector('#detail-author-name');
        const postTimestamp = modal.querySelector('#detail-post-timestamp');

        if (authorAvatar) authorAvatar.src = postData.author.avatar;
        if (authorName) {
            authorName.innerHTML = `
                ${postData.author.name}
                ${postData.author.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                <span class="username">@${postData.author.username}</span>
            `;
        }
        if (postTimestamp) postTimestamp.textContent = this.app.getTimeAgo(postData.timestamp);

        const postText = modal.querySelector('#post-detail-text');
        if (postText) {
            postText.innerHTML = `
                <p>${this.parsePostContent(postData.content.text)}</p>
                ${postData.location ? `<div class="post-location"><i class="fas fa-map-marker-alt"></i> ${postData.location}</div>` : ''}
            `;
        }

        this.updatePostDetailActions(postData);
    }

    parsePostContent(text) {
        return text
            .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>')
            .replace(/@(\w+)/g, '<span class="mention">@$1</span>');
    }

    updatePostDetailActions(postData) {
        const modal = document.getElementById('post-detail-modal');
        if (!modal) return;

        const likeBtn = modal.querySelector('#detail-like-btn');
        const likeIcon = likeBtn?.querySelector('i');
        const likeCount = likeBtn?.querySelector('.action-count');

        if (likeBtn) {
            likeBtn.classList.toggle('liked', postData.userInteractions.liked);
            if (likeIcon) likeIcon.className = postData.userInteractions.liked ? 'fas fa-heart' : 'far fa-heart';
            if (likeCount) likeCount.textContent = this.app.formatNumber(postData.stats.likes);
        }
    }

    async loadPostDetailComments(postId) {
        const commentsSection = document.getElementById('post-detail-comments-section');
        if (!commentsSection) return;

        commentsSection.innerHTML = `
            <div class="comments-header">
                <h4>Comments</h4>
            </div>
            <div class="comments-loading">
                <div class="loading-spinner"></div>
                <span>Loading comments...</span>
            </div>
        `;

        setTimeout(() => {
            this.renderDetailComments(postId);
        }, 1000);
    }

    closePostDetail() {
        const modal = document.getElementById('post-detail-modal');
        if (modal) {
            modal.classList.remove('show');
            this.currentPostDetail = null;
        }
    }

    togglePostLike() {
        if (!this.currentPostDetail) return;
        this.currentPostDetail.userInteractions.liked = !this.currentPostDetail.userInteractions.liked;
        this.currentPostDetail.stats.likes += this.currentPostDetail.userInteractions.liked ? 1 : -1;
        this.updatePostDetailActions(this.currentPostDetail);
        this.app.showToast(this.currentPostDetail.userInteractions.liked ? 'Post liked!' : 'Post unliked', 'success');
    }

    scrollToComments() {
        const commentsSection = document.getElementById('post-detail-comments-section');
        if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    sharePostDetail() {
        if (!this.currentPostDetail) return;
        this.app.showToast('Post shared!', 'success');
        this.currentPostDetail.stats.shares++;
        this.updatePostDetailActions(this.currentPostDetail);
    }

    togglePostSave() {
        if (!this.currentPostDetail) return;
        this.currentPostDetail.userInteractions.saved = !this.currentPostDetail.userInteractions.saved;
        this.updatePostDetailActions(this.currentPostDetail);
        this.app.showToast(this.currentPostDetail.userInteractions.saved ? 'Post saved!' : 'Post unsaved', 'success');
    }

    toggleFollowAuthor() {
        if (!this.currentPostDetail) return;
        this.currentPostDetail.userInteractions.following = !this.currentPostDetail.userInteractions.following;
        const followBtn = document.querySelector('#detail-follow-btn');
        
        if (followBtn) {
            followBtn.textContent = this.currentPostDetail.userInteractions.following ? 'Following' : 'Follow';
            followBtn.classList.toggle('following', this.currentPostDetail.userInteractions.following);
        }
        
        this.app.showToast(
            this.currentPostDetail.userInteractions.following ? 
            `Now following ${this.currentPostDetail.author.name}` : 
            `Unfollowed ${this.currentPostDetail.author.name}`, 
            'success'
        );
    }

    // =================================================================================
    // 2. COMMENTS SECTION INTERFACE
    // =================================================================================
    
    initializeCommentsInterface() {
        console.log('Initializing Comments Section Interface...');
        this.setupCommentsSystem();
    }

    setupCommentsSystem() {
        this.enhancePostComments();
        this.setupCommentInteractions();
    }

    enhancePostComments() {
        document.querySelectorAll('.feed-post').forEach(post => {
            this.addCommentInputToPost(post);
        });
    }

    addCommentInputToPost(postElement) {
        const postId = postElement.dataset.postId;
        if (!postId || postElement.querySelector('.post-comment-section')) return;

        const commentSectionHTML = `
            <div class="post-comment-section">
                <div class="comment-input-container">
                    <img src="${this.app.currentUser?.avatar || 'https://via.placeholder.com/32x32'}" 
                         alt="Your avatar" class="comment-user-avatar">
                    <div class="comment-input-wrapper">
                        <textarea placeholder="Write a comment..." 
                                class="comment-input" 
                                data-post-id="${postId}" 
                                rows="1"></textarea>
                        <div class="comment-input-actions">
                            <button class="comment-submit-btn" disabled>
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="comments-list" id="comments-list-${postId}"></div>
            </div>
        `;

        const postActions = postElement.querySelector('.post-actions');
        if (postActions) {
            postActions.insertAdjacentHTML('afterend', commentSectionHTML);
        }
    }

    setupCommentInteractions() {
        document.addEventListener('input', (e) => {
            if (e.target.matches('.comment-input')) {
                this.handleCommentInput(e.target);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.closest('.comment-submit-btn')) {
                const btn = e.target.closest('.comment-submit-btn');
                const input = btn.closest('.comment-input-wrapper').querySelector('.comment-input');
                this.submitComment(input);
            }
        });
    }

    handleCommentInput(input) {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';

        const submitBtn = input.closest('.comment-input-wrapper').querySelector('.comment-submit-btn');
        const hasContent = input.value.trim().length > 0;
        submitBtn.disabled = !hasContent;
    }

    async submitComment(input) {
        const content = input.value.trim();
        const postId = input.dataset.postId;
        if (!content || !postId) return;

        const comment = {
            id: `comment-${Date.now()}`,
            postId: postId,
            author: {
                id: this.app.currentUser?.id || 'current-user',
                name: this.app.currentUser?.name || 'You',
                avatar: this.app.currentUser?.avatar || 'https://via.placeholder.com/32x32'
            },
            content: content,
            timestamp: new Date(),
            likes: 0,
            userLiked: false
        };

        if (!this.commentsData.has(postId)) {
            this.commentsData.set(postId, []);
        }
        this.commentsData.get(postId).unshift(comment);

        input.value = '';
        this.handleCommentInput(input);
        this.renderCommentInPost(postId, comment);
        this.app.showToast('Comment posted!', 'success');
    }

    renderCommentInPost(postId, comment) {
        const commentsList = document.getElementById(`comments-list-${postId}`);
        if (!commentsList) return;

        const commentHTML = `
            <div class="comment-item" data-comment-id="${comment.id}">
                <img src="${comment.author.avatar}" alt="${comment.author.name}" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${comment.author.name}</span>
                        <span class="comment-timestamp">${this.app.getTimeAgo(comment.timestamp)}</span>
                    </div>
                    <div class="comment-text">${this.parsePostContent(comment.content)}</div>
                </div>
            </div>
        `;

        commentsList.insertAdjacentHTML('afterbegin', commentHTML);
    }

    renderDetailComments(postId) {
        const commentsSection = document.getElementById('post-detail-comments-section');
        if (!commentsSection) return;

        const mockComments = [
            {
                id: 'comment-1',
                author: { name: 'Sarah Chen', avatar: 'https://via.placeholder.com/32x32/9b59b6/ffffff?text=SC' },
                content: 'This is absolutely stunning! 😍',
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
                likes: 12
            }
        ];

        commentsSection.innerHTML = `
            <div class="comments-header">
                <h4>Comments (${mockComments.length})</h4>
            </div>
            <div class="detail-comments-list">
                ${mockComments.map(comment => `
                    <div class="detail-comment-item">
                        <img src="${comment.author.avatar}" alt="${comment.author.name}" class="detail-comment-avatar">
                        <div class="detail-comment-content">
                            <div class="detail-comment-header">
                                <span class="detail-comment-author">${comment.author.name}</span>
                                <span class="detail-comment-timestamp">${this.app.getTimeAgo(comment.timestamp)}</span>
                            </div>
                            <div class="detail-comment-text">${comment.content}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // =================================================================================
    // 3. USER PROFILE PAGES (OTHER USERS)
    // =================================================================================
    
    initializeUserProfilePages() {
        console.log('Initializing User Profile Pages...');
        this.setupUserProfileNavigation();
    }

    setupUserProfileNavigation() {
        document.addEventListener('click', (e) => {
            const shouldOpenProfile = e.target.matches('.comment-author, .post-author-name') ||
                                    e.target.closest('.comment-avatar, .post-author-avatar');

            if (shouldOpenProfile) {
                e.preventDefault();
                const userId = this.extractUserIdFromElement(e.target);
                if (userId) {
                    this.openUserProfile(userId);
                }
            }
        });
    }

    extractUserIdFromElement(element) {
        const userElement = element.closest('[data-user-id]');
        if (userElement) {
            return userElement.dataset.userId;
        }
        return 'user-emma';
    }

    async openUserProfile(userId) {
        try {
            let profileModal = document.getElementById('user-profile-modal');
            if (!profileModal) {
                profileModal = this.createUserProfileModal();
                document.body.appendChild(profileModal);
            }

            profileModal.classList.add('show');
            this.showUserProfileLoading();

            const userData = await this.loadUserProfile(userId);
            if (userData) {
                this.renderUserProfile(userData);
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
            this.app.showToast('Failed to load profile', 'error');
        }
    }

    createUserProfileModal() {
        const profileModal = document.createElement('div');
        profileModal.id = 'user-profile-modal';
        profileModal.className = 'modal user-profile-modal';
        
        profileModal.innerHTML = `
            <div class="modal-overlay" onclick="socialMissingUI.closeUserProfile()"></div>
            <div class="user-profile-container">
                <div class="user-profile-header">
                    <button class="close-profile" onclick="socialMissingUI.closeUserProfile()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="user-profile-content" id="user-profile-content"></div>
            </div>
        `;

        return profileModal;
    }

    showUserProfileLoading() {
        const content = document.getElementById('user-profile-content');
        if (content) {
            content.innerHTML = `
                <div class="profile-loading">
                    <div class="loading-skeleton profile-avatar-skeleton"></div>
                    <div class="loading-skeleton profile-name-skeleton"></div>
                    <div class="loading-skeleton profile-bio-skeleton"></div>
                </div>
            `;
        }
    }

    async loadUserProfile(userId) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            id: 'user-emma',
            name: 'Emma Watson',
            username: 'emmawatson',
            avatar: 'https://via.placeholder.com/200x200/42b72a/ffffff?text=EW',
            coverPhoto: 'https://source.unsplash.com/800x300/?nature,photography',
            bio: '📸 Professional photographer | 🌍 Nature enthusiast | ✨ Capturing moments that matter',
            location: 'San Francisco, CA',
            verified: true,
            stats: {
                posts: 847,
                followers: 125600,
                following: 923
            },
            isFollowing: false,
            recentPosts: [
                { id: 'p1', image: 'https://source.unsplash.com/300x300/?sunset', likes: 234 },
                { id: 'p2', image: 'https://source.unsplash.com/300x300/?mountain', likes: 189 }
            ]
        };
    }

    renderUserProfile(userData) {
        const content = document.getElementById('user-profile-content');
        if (!content) return;

        content.innerHTML = `
            <div class="user-profile-cover">
                <img src="${userData.coverPhoto}" alt="Cover photo" class="profile-cover-image">
            </div>
            <div class="user-profile-info">
                <div class="profile-avatar-container">
                    <img src="${userData.avatar}" alt="${userData.name}" class="profile-avatar-large">
                    ${userData.verified ? '<div class="verified-badge-large"><i class="fas fa-check-circle"></i></div>' : ''}
                </div>
                <div class="profile-main-info">
                    <div class="profile-name-section">
                        <h1 class="profile-display-name">${userData.name}</h1>
                        <p class="profile-username">@${userData.username}</p>
                    </div>
                    <div class="profile-actions">
                        <button class="profile-follow-btn" onclick="socialMissingUI.toggleUserFollow('${userData.id}')">
                            ${userData.isFollowing ? 'Following' : 'Follow'}
                        </button>
                        <button class="profile-message-btn" onclick="socialMissingUI.messageUser('${userData.id}')">
                            <i class="fas fa-comment"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="profile-bio-section">
                <p class="profile-bio">${userData.bio}</p>
                <div class="profile-details">
                    <div class="profile-detail"><i class="fas fa-map-marker-alt"></i> ${userData.location}</div>
                </div>
            </div>
            <div class="profile-stats">
                <div class="stat-item">
                    <strong>${this.app.formatNumber(userData.stats.posts)}</strong>
                    <span>Posts</span>
                </div>
                <div class="stat-item">
                    <strong>${this.app.formatNumber(userData.stats.followers)}</strong>
                    <span>Followers</span>
                </div>
                <div class="stat-item">
                    <strong>${this.app.formatNumber(userData.stats.following)}</strong>
                    <span>Following</span>
                </div>
            </div>
            <div class="profile-posts-grid">
                ${userData.recentPosts.map(post => `
                    <div class="profile-post-item" onclick="socialMissingUI.openPostDetail('${post.id}')">
                        <img src="${post.image}" alt="Post" class="profile-post-image">
                        <div class="profile-post-overlay">
                            <span><i class="fas fa-heart"></i> ${this.app.formatNumber(post.likes)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    closeUserProfile() {
        const modal = document.getElementById('user-profile-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    // =================================================================================
    // 4. FOLLOW/UNFOLLOW INTERFACE
    // =================================================================================
    
    initializeFollowUnfollowInterface() {
        console.log('Initializing Follow/Unfollow Interface...');
        this.setupFollowSystem();
    }

    setupFollowSystem() {
        this.setupFollowInteractions();
    }

    setupFollowInteractions() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.profile-follow-btn')) {
                e.stopPropagation();
                const userId = e.target.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                if (userId) {
                    this.toggleUserFollow(userId, e.target);
                }
            }
        });
    }

    async toggleUserFollow(userId, buttonElement) {
        const isCurrentlyFollowing = this.followingUsers.has(userId);
        
        if (buttonElement) {
            buttonElement.disabled = true;
            buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (isCurrentlyFollowing) {
                this.followingUsers.delete(userId);
                if (buttonElement) {
                    buttonElement.textContent = 'Follow';
                    buttonElement.classList.remove('following');
                }
                this.app.showToast('Unfollowed successfully', 'info');
            } else {
                this.followingUsers.add(userId);
                if (buttonElement) {
                    buttonElement.textContent = 'Following';
                    buttonElement.classList.add('following');
                }
                this.showFollowAnimation();
                this.app.showToast('Now following!', 'success');
            }

        } catch (error) {
            console.error('Failed to toggle follow:', error);
            this.app.showToast('Failed to update follow status', 'error');
        } finally {
            if (buttonElement) {
                buttonElement.disabled = false;
            }
        }
    }

    showFollowAnimation() {
        const animation = document.createElement('div');
        animation.className = 'follow-animation';
        animation.innerHTML = `
            <div class="follow-animation-content">
                <i class="fas fa-user-plus"></i>
                <span>Following!</span>
            </div>
        `;

        document.body.appendChild(animation);
        
        setTimeout(() => animation.classList.add('animate-in'), 100);
        setTimeout(() => {
            animation.classList.add('animate-out');
            setTimeout(() => animation.remove(), 300);
        }, 2000);
    }

    // =================================================================================
    // 5. ADVANCED POST CREATION (POLLS, LOCATIONS, FEELINGS)
    // =================================================================================
    
    initializeAdvancedPostCreation() {
        console.log('Initializing Advanced Post Creation...');
        this.enhancePostCreationModal();
    }

    enhancePostCreationModal() {
        setTimeout(() => {
            this.addAdvancedPostOptions();
            this.setupAdvancedPostCreationEvents();
        }, 1000);
    }

    addAdvancedPostOptions() {
        const modalBody = document.querySelector('#create-post-modal .modal-body');
        if (!modalBody) return;

        const advancedOptionsHTML = `
            <div class="advanced-post-options">
                <div class="advanced-options-tabs">
                    <button class="advanced-tab active" data-tab="poll">
                        <i class="fas fa-poll"></i>
                        Poll
                    </button>
                    <button class="advanced-tab" data-tab="location">
                        <i class="fas fa-map-marker-alt"></i>
                        Location
                    </button>
                    <button class="advanced-tab" data-tab="feeling">
                        <i class="fas fa-smile"></i>
                        Feeling
                    </button>
                </div>
                <div class="advanced-options-content">
                    <div class="advanced-content poll-content active" data-content="poll">
                        <div class="poll-creation">
                            <input type="text" placeholder="Ask a question..." class="poll-question">
                            <div class="poll-options">
                                <input type="text" placeholder="Option 1" class="poll-option">
                                <input type="text" placeholder="Option 2" class="poll-option">
                            </div>
                            <button class="add-poll-option">Add Option</button>
                        </div>
                    </div>
                    <div class="advanced-content location-content" data-content="location">
                        <div class="location-search">
                            <input type="text" placeholder="Search for a location..." class="location-input">
                            <div class="location-suggestions"></div>
                        </div>
                    </div>
                    <div class="advanced-content feeling-content" data-content="feeling">
                        <div class="feeling-selector">
                            <div class="feeling-categories">
                                <button class="feeling-category active" data-category="happy">😊 Happy</button>
                                <button class="feeling-category" data-category="excited">🎉 Excited</button>
                                <button class="feeling-category" data-category="grateful">🙏 Grateful</button>
                                <button class="feeling-category" data-category="relaxed">😌 Relaxed</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modalBody.insertAdjacentHTML('beforeend', advancedOptionsHTML);
    }

    setupAdvancedPostCreationEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.advanced-tab')) {
                this.switchAdvancedTab(e.target);
            }
            if (e.target.matches('.add-poll-option')) {
                this.addPollOption();
            }
            if (e.target.matches('.feeling-category')) {
                this.selectFeeling(e.target);
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.matches('.location-input')) {
                this.searchLocations(e.target.value);
            }
        });
    }

    switchAdvancedTab(tabElement) {
        const tabName = tabElement.dataset.tab;
        
        document.querySelectorAll('.advanced-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.advanced-content').forEach(content => content.classList.remove('active'));
        
        tabElement.classList.add('active');
        document.querySelector(`[data-content="${tabName}"]`)?.classList.add('active');
    }

    addPollOption() {
        const pollOptions = document.querySelector('.poll-options');
        if (!pollOptions || pollOptions.children.length >= 4) return;

        const optionNumber = pollOptions.children.length + 1;
        const newOption = document.createElement('input');
        newOption.type = 'text';
        newOption.placeholder = `Option ${optionNumber}`;
        newOption.className = 'poll-option';
        
        pollOptions.appendChild(newOption);
        newOption.focus();
    }

    searchLocations(query) {
        if (!query || query.length < 2) return;

        const suggestions = document.querySelector('.location-suggestions');
        if (!suggestions) return;

        const mockLocations = [
            'New York, NY, USA',
            'Los Angeles, CA, USA',
            'San Francisco, CA, USA',
            'Chicago, IL, USA',
            'Miami, FL, USA'
        ].filter(location => location.toLowerCase().includes(query.toLowerCase()));

        suggestions.innerHTML = mockLocations.map(location => `
            <div class="location-suggestion" onclick="socialMissingUI.selectLocation('${location}')">
                <i class="fas fa-map-marker-alt"></i>
                ${location}
            </div>
        `).join('');
    }

    selectLocation(location) {
        const locationInput = document.querySelector('.location-input');
        if (locationInput) {
            locationInput.value = location;
        }
        
        const suggestions = document.querySelector('.location-suggestions');
        if (suggestions) {
            suggestions.innerHTML = '';
        }
    }

    selectFeeling(feelingElement) {
        document.querySelectorAll('.feeling-category').forEach(cat => cat.classList.remove('active'));
        feelingElement.classList.add('active');
    }

    // =================================================================================
    // 6. STORY CREATION INTERFACE
    // =================================================================================
    
    initializeStoryCreationInterface() {
        console.log('Initializing Story Creation Interface...');
        this.createStoryCreationModal();
        this.setupStoryCreationListeners();
    }

    createStoryCreationModal() {
        const storyCreationModalHTML = `
            <div id="story-creation-modal" class="modal story-creation-modal">
                <div class="modal-overlay" onclick="socialMissingUI.closeStoryCreation()"></div>
                <div class="story-creation-container">
                    <div class="story-creation-header">
                        <h3>Create Story</h3>
                        <button class="close-story-creation" onclick="socialMissingUI.closeStoryCreation()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="story-creation-content">
                        <div class="story-creation-tabs">
                            <button class="story-tab active" data-tab="camera">
                                <i class="fas fa-camera"></i>
                                Camera
                            </button>
                            <button class="story-tab" data-tab="text">
                                <i class="fas fa-font"></i>
                                Text
                            </button>
                            <button class="story-tab" data-tab="upload">
                                <i class="fas fa-upload"></i>
                                Upload
                            </button>
                        </div>
                        <div class="story-creation-body">
                            <div class="story-content-area active" data-content="camera">
                                <div class="camera-preview">
                                    <div class="camera-placeholder">
                                        <i class="fas fa-camera"></i>
                                        <p>Camera preview would appear here</p>
                                        <button class="start-camera-btn">Start Camera</button>
                                    </div>
                                </div>
                            </div>
                            <div class="story-content-area" data-content="text">
                                <div class="text-story-creator">
                                    <textarea placeholder="What's on your mind?" class="story-text-input"></textarea>
                                    <div class="text-style-options">
                                        <div class="text-color-picker">
                                            <div class="color-option active" style="background: #ffffff" data-color="#ffffff"></div>
                                            <div class="color-option" style="background: #ff6b6b" data-color="#ff6b6b"></div>
                                            <div class="color-option" style="background: #4ecdc4" data-color="#4ecdc4"></div>
                                            <div class="color-option" style="background: #45b7d1" data-color="#45b7d1"></div>
                                            <div class="color-option" style="background: #96ceb4" data-color="#96ceb4"></div>
                                            <div class="color-option" style="background: #feca57" data-color="#feca57"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="story-content-area" data-content="upload">
                                <div class="upload-area">
                                    <input type="file" id="story-file-input" accept="image/*,video/*" hidden>
                                    <div class="upload-placeholder" onclick="document.getElementById('story-file-input').click()">
                                        <i class="fas fa-cloud-upload-alt"></i>
                                        <p>Click to upload photo or video</p>
                                        <small>JPG, PNG, MP4 up to 10MB</small>
                                    </div>
                                    <div class="uploaded-preview" id="uploaded-story-preview"></div>
                                </div>
                            </div>
                        </div>
                        <div class="story-creation-actions">
                            <button class="story-action-btn cancel-btn" onclick="socialMissingUI.closeStoryCreation()">
                                Cancel
                            </button>
                            <button class="story-action-btn publish-btn" onclick="socialMissingUI.publishStory()">
                                Share Story
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', storyCreationModalHTML);
    }

    setupStoryCreationListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.story-tab')) {
                this.switchStoryTab(e.target);
            }
            if (e.target.matches('.color-option')) {
                this.selectTextColor(e.target);
            }
            if (e.target.matches('.add-story-btn')) {
                this.openStoryCreation();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'story-file-input') {
                this.handleStoryFileUpload(e.target.files[0]);
            }
        });
    }

    openStoryCreation() {
        const modal = document.getElementById('story-creation-modal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    switchStoryTab(tabElement) {
        const tabName = tabElement.dataset.tab;
        
        document.querySelectorAll('.story-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.story-content-area').forEach(area => area.classList.remove('active'));
        
        tabElement.classList.add('active');
        document.querySelector(`[data-content="${tabName}"]`)?.classList.add('active');
    }

    selectTextColor(colorElement) {
        const color = colorElement.dataset.color;
        
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
        colorElement.classList.add('active');
        
        const textInput = document.querySelector('.story-text-input');
        if (textInput) {
            textInput.style.backgroundColor = color;
            textInput.style.color = color === '#ffffff' ? '#000000' : '#ffffff';
        }
    }

    handleStoryFileUpload(file) {
        if (!file) return;

        const preview = document.getElementById('uploaded-story-preview');
        if (!preview) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const isVideo = file.type.startsWith('video/');
            preview.innerHTML = `
                <div class="story-preview-item">
                    ${isVideo ? 
                        `<video src="${e.target.result}" controls class="story-preview-media"></video>` :
                        `<img src="${e.target.result}" alt="Story preview" class="story-preview-media">`
                    }
                    <button class="remove-story-media" onclick="socialMissingUI.removeStoryMedia()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }

    removeStoryMedia() {
        const preview = document.getElementById('uploaded-story-preview');
        if (preview) {
            preview.innerHTML = '';
        }
        
        const fileInput = document.getElementById('story-file-input');
        if (fileInput) {
            fileInput.value = '';
        }
    }

    async publishStory() {
        const activeTab = document.querySelector('.story-tab.active')?.dataset.tab;
        let storyContent = null;

        if (activeTab === 'text') {
            const textInput = document.querySelector('.story-text-input');
            const activeColor = document.querySelector('.color-option.active');
            
            if (textInput && textInput.value.trim()) {
                storyContent = {
                    type: 'text',
                    content: textInput.value.trim(),
                    backgroundColor: activeColor?.dataset.color || '#ffffff'
                };
            }
        } else if (activeTab === 'upload') {
            const fileInput = document.getElementById('story-file-input');
            if (fileInput.files.length > 0) {
                storyContent = {
                    type: 'media',
                    file: fileInput.files[0]
                };
            }
        }

        if (!storyContent) {
            this.app.showToast('Please add content to your story', 'warning');
            return;
        }

        try {
            this.app.showToast('Publishing story...', 'info');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.app.showToast('Story published successfully!', 'success');
            this.closeStoryCreation();
            
            this.addStoryToFeed(storyContent);
        } catch (error) {
            console.error('Failed to publish story:', error);
            this.app.showToast('Failed to publish story', 'error');
        }
    }

    addStoryToFeed(storyContent) {
        const storiesContainer = document.querySelector('.stories-container');
        if (!storiesContainer) return;

        const storyHTML = `
            <div class="story-item user-story" onclick="socialMissingUI.openStoryViewer('current-user')">
                <div class="story-avatar">
                    <img src="${this.app.currentUser?.avatar || 'https://via.placeholder.com/60x60'}" alt="Your story">
                    <div class="story-ring"></div>
                </div>
                <span class="story-username">Your Story</span>
            </div>
        `;

        storiesContainer.insertAdjacentHTML('afterbegin', storyHTML);
    }

    closeStoryCreation() {
        const modal = document.getElementById('story-creation-modal');
        if (modal) {
            modal.classList.remove('show');
            this.resetStoryCreation();
        }
    }

    resetStoryCreation() {
        const textInput = document.querySelector('.story-text-input');
        if (textInput) {
            textInput.value = '';
            textInput.style.backgroundColor = '#ffffff';
            textInput.style.color = '#000000';
        }
        
        this.removeStoryMedia();
        
        document.querySelectorAll('.story-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.story-content-area').forEach(area => area.classList.remove('active'));
        
        document.querySelector('[data-tab="camera"]')?.classList.add('active');
        document.querySelector('[data-content="camera"]')?.classList.add('active');
    }

    // =================================================================================
    // 7. STORY VIEWER INTERFACE
    // =================================================================================
    
    initializeStoryViewerInterface() {
        console.log('Initializing Story Viewer Interface...');
        this.createStoryViewerModal();
        this.setupStoryViewerListeners();
    }

    createStoryViewerModal() {
        const storyViewerModalHTML = `
            <div id="story-viewer-modal" class="modal story-viewer-modal">
                <div class="story-viewer-container">
                    <div class="story-viewer-header">
                        <div class="story-progress-bars" id="story-progress-bars"></div>
                        <div class="story-user-info">
                            <img src="" alt="" class="story-user-avatar" id="story-user-avatar">
                            <div class="story-user-details">
                                <span class="story-user-name" id="story-user-name"></span>
                                <span class="story-timestamp" id="story-timestamp"></span>
                            </div>
                        </div>
                        <button class="close-story-viewer" onclick="socialMissingUI.closeStoryViewer()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="story-content-viewer" id="story-content-viewer">
                        <div class="story-navigation">
                            <button class="story-nav-btn prev-story" onclick="socialMissingUI.previousStory()">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="story-nav-btn next-story" onclick="socialMissingUI.nextStory()">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                        <div class="story-media-container" id="story-media-container"></div>
                        <div class="story-interaction-area">
                            <div class="story-reactions">
                                <button class="story-reaction-btn" data-reaction="like">
                                    <i class="fas fa-heart"></i>
                                </button>
                                <button class="story-reaction-btn" data-reaction="laugh">
                                    <i class="fas fa-laugh"></i>
                                </button>
                                <button class="story-reaction-btn" data-reaction="surprise">
                                    <i class="fas fa-surprise"></i>
                                </button>
                            </div>
                            <div class="story-input-area">
                                <input type="text" placeholder="Reply to story..." class="story-reply-input">
                                <button class="story-send-reply">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', storyViewerModalHTML);
    }

    setupStoryViewerListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.story-item:not(.add-story)')) {
                const storyItem = e.target.closest('.story-item');
                const userId = storyItem.dataset.userId || 'user-1';
                this.openStoryViewer(userId);
            }
            
            if (e.target.matches('.story-reaction-btn')) {
                this.reactToStory(e.target.dataset.reaction);
            }
        });

        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('story-viewer-modal');
            if (!modal.classList.contains('show')) return;

            if (e.key === 'ArrowLeft') this.previousStory();
            if (e.key === 'ArrowRight') this.nextStory();
            if (e.key === 'Escape') this.closeStoryViewer();
        });
    }

    async openStoryViewer(userId) {
        const modal = document.getElementById('story-viewer-modal');
        if (!modal) return;

        modal.classList.add('show');
        
        try {
            const storiesData = await this.loadUserStories(userId);
            if (storiesData && storiesData.length > 0) {
                this.currentStoryViewer = {
                    userId: userId,
                    stories: storiesData,
                    currentIndex: 0
                };
                
                this.renderStoryViewer();
                this.startStoryProgress();
            }
        } catch (error) {
            console.error('Failed to load stories:', error);
            this.closeStoryViewer();
        }
    }

    async loadUserStories(userId) {
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockStories = {
            'user-1': [
                {
                    id: 'story-1',
                    type: 'image',
                    content: 'https://source.unsplash.com/400x600/?nature',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    duration: 5000
                },
                {
                    id: 'story-2',
                    type: 'text',
                    content: 'Beautiful day for a hike! 🌟',
                    backgroundColor: '#45b7d1',
                    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
                    duration: 4000
                }
            ],
            'current-user': [
                {
                    id: 'story-3',
                    type: 'text',
                    content: 'Just published my first story!',
                    backgroundColor: '#4ecdc4',
                    timestamp: new Date(),
                    duration: 3000
                }
            ]
        };

        return mockStories[userId] || [];
    }

    renderStoryViewer() {
        if (!this.currentStoryViewer) return;

        const { stories, currentIndex, userId } = this.currentStoryViewer;
        const currentStory = stories[currentIndex];

        this.updateStoryProgress();
        this.updateStoryUserInfo(userId);
        this.updateStoryContent(currentStory);
    }

    updateStoryProgress() {
        const progressBars = document.getElementById('story-progress-bars');
        if (!progressBars || !this.currentStoryViewer) return;

        const { stories, currentIndex } = this.currentStoryViewer;
        
        progressBars.innerHTML = stories.map((_, index) => `
            <div class="story-progress-bar ${index < currentIndex ? 'completed' : index === currentIndex ? 'active' : ''}">
                <div class="progress-fill"></div>
            </div>
        `).join('');
    }

    updateStoryUserInfo(userId) {
        const mockUserData = {
            'user-1': { name: 'Sarah Chen', avatar: 'https://via.placeholder.com/40x40/9b59b6/ffffff?text=SC' },
            'current-user': { name: 'You', avatar: this.app.currentUser?.avatar || 'https://via.placeholder.com/40x40' }
        };

        const userData = mockUserData[userId] || mockUserData['user-1'];
        
        const avatar = document.getElementById('story-user-avatar');
        const name = document.getElementById('story-user-name');
        const timestamp = document.getElementById('story-timestamp');

        if (avatar) avatar.src = userData.avatar;
        if (name) name.textContent = userData.name;
        if (timestamp && this.currentStoryViewer) {
            const story = this.currentStoryViewer.stories[this.currentStoryViewer.currentIndex];
            timestamp.textContent = this.app.getTimeAgo(story.timestamp);
        }
    }

    updateStoryContent(story) {
        const mediaContainer = document.getElementById('story-media-container');
        if (!mediaContainer) return;

        if (story.type === 'image') {
            mediaContainer.innerHTML = `<img src="${story.content}" alt="Story" class="story-media-content">`;
        } else if (story.type === 'text') {
            mediaContainer.innerHTML = `
                <div class="story-text-content" style="background-color: ${story.backgroundColor}">
                    <p>${story.content}</p>
                </div>
            `;
        } else if (story.type === 'video') {
            mediaContainer.innerHTML = `<video src="${story.content}" class="story-media-content" autoplay muted></video>`;
        }
    }

    startStoryProgress() {
        if (!this.currentStoryViewer) return;

        const currentStory = this.currentStoryViewer.stories[this.currentStoryViewer.currentIndex];
        const duration = currentStory.duration || 5000;

        const progressBar = document.querySelector('.story-progress-bar.active .progress-fill');
        if (progressBar) {
            progressBar.style.animation = `story-progress ${duration}ms linear forwards`;
        }

        this.storyProgressTimer = setTimeout(() => {
            this.nextStory();
        }, duration);
    }

    stopStoryProgress() {
        if (this.storyProgressTimer) {
            clearTimeout(this.storyProgressTimer);
            this.storyProgressTimer = null;
        }
    }

    nextStory() {
        if (!this.currentStoryViewer) return;

        this.stopStoryProgress();
        
        if (this.currentStoryViewer.currentIndex < this.currentStoryViewer.stories.length - 1) {
            this.currentStoryViewer.currentIndex++;
            this.renderStoryViewer();
            this.startStoryProgress();
        } else {
            this.closeStoryViewer();
        }
    }

    previousStory() {
        if (!this.currentStoryViewer) return;

        this.stopStoryProgress();
        
        if (this.currentStoryViewer.currentIndex > 0) {
            this.currentStoryViewer.currentIndex--;
            this.renderStoryViewer();
            this.startStoryProgress();
        }
    }

    reactToStory(reaction) {
        const reactionEmojis = {
            like: '❤️',
            laugh: '😂',
            surprise: '😮'
        };

        const emoji = reactionEmojis[reaction];
        if (emoji) {
            this.showStoryReaction(emoji);
            this.app.showToast(`Reacted with ${emoji}`, 'success');
        }
    }

    showStoryReaction(emoji) {
        const mediaContainer = document.getElementById('story-media-container');
        if (!mediaContainer) return;

        const reaction = document.createElement('div');
        reaction.className = 'story-reaction-animation';
        reaction.textContent = emoji;
        
        reaction.style.left = Math.random() * 80 + 10 + '%';
        reaction.style.animationDelay = '0s';
        
        mediaContainer.appendChild(reaction);
        
        setTimeout(() => reaction.remove(), 2000);
    }

    closeStoryViewer() {
        const modal = document.getElementById('story-viewer-modal');
        if (modal) {
            modal.classList.remove('show');
            this.stopStoryProgress();
            this.currentStoryViewer = null;
        }
    }

    messageUser(userId) {
        this.app.showToast('Opening message...', 'info');
        this.closeUserProfile();
        
        setTimeout(() => {
            const messagesSection = document.getElementById('messages');
            if (messagesSection) {
                this.app.showSection('messages');
            }
        }, 500);
    }
}

// Export and instantiate the Social Missing UI Components
window.SocialMissingUIComponents = SocialMissingUIComponents;

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typeof app !== 'undefined') {
        window.socialMissingUI = new SocialMissingUIComponents(app);
    } else {
        console.warn('App instance not found. Social Missing UI Components will initialize when app is available.');
        document.addEventListener('app-ready', () => {
            window.socialMissingUI = new SocialMissingUIComponents(app);
        });
    }
});
