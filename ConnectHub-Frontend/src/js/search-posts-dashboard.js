/**
 * ConnectHub - Search Posts Dashboard
 * Comprehensive search posts functionality with advanced filtering and results display
 */

class SearchPostsDashboard {
    constructor(app) {
        this.app = app;
        this.searchResults = [];
        this.currentQuery = '';
        this.filters = {
            contentTypes: ['text', 'image', 'video', 'link'],
            dateFrom: null,
            dateTo: null,
            hashtags: '',
            author: '',
            minLikes: 0,
            minComments: 0
        };
        this.sortBy = 'relevance';
        this.viewMode = 'list';
        this.currentPage = 1;
        this.resultsPerPage = 15;
        this.isLoading = false;
        this.hasMore = true;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeFilters();
        this.loadTrendingTopics();
    }

    setupEventListeners() {
        // Posts tab click handler
        document.addEventListener('click', (e) => {
            if (e.target.closest('#posts-search-tab')) {
                this.activatePostsTab();
            }
            
            // Search posts button click
            if (e.target.closest('.search-posts-btn')) {
                this.activatePostsTab();
            }

            // Filter apply/clear buttons
            if (e.target.closest('#apply-posts-filters')) {
                this.applyFilters();
            }
            
            if (e.target.closest('#clear-posts-filters')) {
                this.clearFilters();
            }

            // View toggle buttons
            if (e.target.closest('.posts-sort-options .view-toggle-btn')) {
                this.toggleView(e.target.closest('.view-toggle-btn').dataset.view);
            }

            // Load more button
            if (e.target.closest('#posts-load-more')) {
                this.loadMoreResults();
            }

            // Trending tag clicks
            if (e.target.closest('.trending-tag')) {
                const tag = e.target.textContent;
                this.searchPosts(tag);
            }

            // Post action buttons
            if (e.target.closest('.post-like-btn')) {
                this.handlePostLike(e.target.closest('.post-result-card'));
            }
            
            if (e.target.closest('.post-comment-btn')) {
                this.handlePostComment(e.target.closest('.post-result-card'));
            }
            
            if (e.target.closest('.view-full-post-btn')) {
                this.viewFullPost(e.target.closest('.post-result-card'));
            }
        });

        // Sort dropdown change
        document.addEventListener('change', (e) => {
            if (e.target.id === 'posts-sort-select') {
                this.sortBy = e.target.value;
                this.sortResults();
            }
        });

        // Filter input changes
        document.addEventListener('input', (e) => {
            if (e.target.closest('.posts-filters')) {
                this.handleFilterChange(e.target);
            }
        });

        // Global search input
        const globalSearchInput = document.getElementById('global-search-main');
        if (globalSearchInput) {
            globalSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && this.isPostsTabActive()) {
                    this.searchPosts(e.target.value);
                }
            });
        }
    }

    activatePostsTab() {
        // Switch to posts tab
        document.querySelectorAll('.search-tab').forEach(tab => {
            tab.classList.toggle('active', tab.id === 'posts-search-tab');
        });

        document.querySelectorAll('.search-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === 'posts-search-content');
        });

        // Perform search if there's a query
        const currentQuery = document.getElementById('global-search-main')?.value;
        if (currentQuery && currentQuery.length >= 2) {
            this.searchPosts(currentQuery);
        } else {
            this.showEmptyState();
        }

        this.app.showToast('Posts search activated', 'info');
    }

    isPostsTabActive() {
        const postsTab = document.getElementById('posts-search-tab');
        return postsTab?.classList.contains('active');
    }

    async searchPosts(query) {
        if (!query || query.length < 2) {
            this.showEmptyState();
            return;
        }

        this.currentQuery = query;
        this.currentPage = 1;
        this.hasMore = true;
        this.setLoading(true);

        try {
            const results = await this.performPostsSearch(query);
            this.searchResults = results;
            this.renderResults();
            this.updateResultsCount();
            this.hideEmptyState();
        } catch (error) {
            console.error('Posts search failed:', error);
            this.app.showToast('Search failed. Please try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async performPostsSearch(query) {
        // Simulate API call with realistic data
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockResults = this.generateMockPostResults(query, this.resultsPerPage);
                resolve(mockResults);
            }, 800);
        });
    }

    generateMockPostResults(query, count) {
        const posts = [];
        const authors = [
            { name: 'Alex Thompson', username: '@alexthompson', avatar: 'https://source.unsplash.com/40x40/?portrait,man&sig=1' },
            { name: 'Sarah Chen', username: '@sarahchen', avatar: 'https://source.unsplash.com/40x40/?portrait,woman&sig=2' },
            { name: 'Mike Rodriguez', username: '@mikerodriguez', avatar: 'https://source.unsplash.com/40x40/?portrait,man&sig=3' },
            { name: 'Emily Davis', username: '@emilydavis', avatar: 'https://source.unsplash.com/40x40/?portrait,woman&sig=4' },
            { name: 'David Kim', username: '@davidkim', avatar: 'https://source.unsplash.com/40x40/?portrait,man&sig=5' },
            { name: 'Lisa Wang', username: '@lisawang', avatar: 'https://source.unsplash.com/40x40/?portrait,woman&sig=6' }
        ];

        const contentTypes = ['text', 'image', 'video', 'link'];
        const hashtags = ['#photography', '#travel', '#food', '#art', '#music', '#tech', '#fitness', '#nature'];

        for (let i = 0; i < count; i++) {
            const author = authors[i % authors.length];
            const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
            const postHashtags = hashtags.slice(0, Math.floor(Math.random() * 3) + 1);
            
            let content = this.generatePostContent(query, contentType);
            content = this.highlightSearchTerms(content, query);

            posts.push({
                id: `post-${Date.now()}-${i}`,
                author: author,
                content: content,
                contentType: contentType,
                hashtags: postHashtags,
                media: this.generateMediaContent(contentType, i),
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                likes: Math.floor(Math.random() * 2000) + 10,
                comments: Math.floor(Math.random() * 200) + 5,
                shares: Math.floor(Math.random() * 100) + 1,
                isLiked: Math.random() > 0.7,
                engagement: Math.random() * 0.1 + 0.02
            });
        }

        return this.applyCurrentFilters(posts);
    }

    generatePostContent(query, type) {
        const templates = {
            text: [
                `Just had an amazing experience with ${query}! Can't wait to share more about this journey.`,
                `Thoughts on ${query}: it's completely changed my perspective on things. What do you think?`,
                `Deep dive into ${query} - here's what I've learned after months of research and practice.`,
                `Why ${query} matters more than you think. Thread 🧵`,
                `Quick tip about ${query} that saved me hours of work. Hope this helps!`
            ],
            image: [
                `Captured this beautiful moment during my ${query} adventure! The lighting was perfect.`,
                `New ${query} photography project I've been working on. Feedback welcome! 📸`,
                `Behind the scenes of my ${query} shoot. The story behind this image is incredible.`,
                `Found this hidden gem while exploring ${query} spots. Nature never ceases to amaze me.`
            ],
            video: [
                `Watch my ${query} journey unfold in this 2-minute video. Emotional rollercoaster! 🎬`,
                `Tutorial: How to master ${query} in 30 days. Step-by-step guide inside! ▶️`,
                `Time-lapse of my ${query} project from start to finish. 72 hours compressed into 3 minutes.`,
                `Live reaction to trying ${query} for the first time. You won't believe what happens! 😱`
            ],
            link: [
                `Essential ${query} resources that changed my life. Bookmark this thread! 🔗`,
                `Comprehensive guide to ${query} - everything you need to know in one place.`,
                `The science behind ${query} explained by leading experts. Mind-blowing research!`,
                `${query} industry report 2024: trends, statistics, and future predictions.`
            ]
        };

        const typeTemplates = templates[type] || templates.text;
        return typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
    }

    generateMediaContent(type, index) {
        switch (type) {
            case 'image':
                return {
                    type: 'image',
                    url: `https://source.unsplash.com/600x400/?${this.currentQuery}&sig=${index}`,
                    thumbnail: `https://source.unsplash.com/300x200/?${this.currentQuery}&sig=${index}`,
                    alt: `${this.currentQuery} image`
                };
            case 'video':
                return {
                    type: 'video',
                    thumbnail: `https://source.unsplash.com/600x400/?video,${this.currentQuery}&sig=${index}`,
                    duration: Math.floor(Math.random() * 300) + 30,
                    views: Math.floor(Math.random() * 10000) + 100
                };
            case 'link':
                const domains = ['medium.com', 'youtube.com', 'github.com', 'devto', 'blog.com'];
                return {
                    type: 'link',
                    url: `https://${domains[index % domains.length]}/${this.currentQuery}`,
                    title: `Ultimate guide to ${this.currentQuery}`,
                    description: `Comprehensive resource about ${this.currentQuery} with practical examples and tips.`,
                    favicon: `https://source.unsplash.com/16x16/?logo&sig=${index}`
                };
            default:
                return null;
        }
    }

    highlightSearchTerms(content, query) {
        if (!query) return content;
        
        const terms = query.toLowerCase().split(' ').filter(term => term.length > 2);
        let highlightedContent = content;
        
        terms.forEach(term => {
            const regex = new RegExp(`(${term})`, 'gi');
            highlightedContent = highlightedContent.replace(regex, '<mark class="search-highlight">$1</mark>');
        });
        
        return highlightedContent;
    }

    applyCurrentFilters(posts) {
        let filteredPosts = [...posts];

        // Content type filter
        if (this.filters.contentTypes.length > 0 && this.filters.contentTypes.length < 4) {
            filteredPosts = filteredPosts.filter(post => 
                this.filters.contentTypes.includes(post.contentType)
            );
        }

        // Date range filter
        if (this.filters.dateFrom) {
            const fromDate = new Date(this.filters.dateFrom);
            filteredPosts = filteredPosts.filter(post => 
                new Date(post.timestamp) >= fromDate
            );
        }

        if (this.filters.dateTo) {
            const toDate = new Date(this.filters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            filteredPosts = filteredPosts.filter(post => 
                new Date(post.timestamp) <= toDate
            );
        }

        // Author filter
        if (this.filters.author) {
            const authorQuery = this.filters.author.toLowerCase();
            filteredPosts = filteredPosts.filter(post => 
                post.author.name.toLowerCase().includes(authorQuery) ||
                post.author.username.toLowerCase().includes(authorQuery)
            );
        }

        // Hashtags filter
        if (this.filters.hashtags) {
            const hashtagsArray = this.filters.hashtags.split(',').map(tag => 
                tag.trim().toLowerCase().replace('#', '')
            ).filter(tag => tag.length > 0);
            
            if (hashtagsArray.length > 0) {
                filteredPosts = filteredPosts.filter(post =>
                    hashtagsArray.some(filterTag =>
                        post.hashtags.some(postTag =>
                            postTag.toLowerCase().replace('#', '').includes(filterTag)
                        )
                    )
                );
            }
        }

        // Engagement filters
        if (this.filters.minLikes > 0) {
            filteredPosts = filteredPosts.filter(post => post.likes >= this.filters.minLikes);
        }

        if (this.filters.minComments > 0) {
            filteredPosts = filteredPosts.filter(post => post.comments >= this.filters.minComments);
        }

        return filteredPosts;
    }

    sortResults() {
        if (!this.searchResults.length) return;

        const sortFunctions = {
            relevance: (a, b) => b.engagement - a.engagement,
            recent: (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
            popular: (a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares),
            likes: (a, b) => b.likes - a.likes,
            comments: (a, b) => b.comments - a.comments,
            shares: (a, b) => b.shares - a.shares
        };

        const sortFn = sortFunctions[this.sortBy] || sortFunctions.relevance;
        this.searchResults.sort(sortFn);
        this.renderResults();
    }

    renderResults() {
        const listView = document.getElementById('posts-list-view');
        const gridView = document.getElementById('posts-grid-view');

        if (this.viewMode === 'list' && listView) {
            this.renderListView(listView);
        } else if (this.viewMode === 'grid' && gridView) {
            this.renderGridView(gridView);
        }

        this.updateLoadMoreButton();
    }

    renderListView(container) {
        container.innerHTML = this.searchResults.map(post => `
            <div class="post-result-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-author">
                        <img src="${post.author.avatar}" alt="${post.author.name}" class="author-avatar">
                        <div class="author-info">
                            <h5 class="author-name">${post.author.name}</h5>
                            <span class="author-username">${post.author.username}</span>
                        </div>
                    </div>
                    <div class="post-timestamp">
                        <span>${this.formatTimestamp(post.timestamp)}</span>
                        <span class="content-type-badge ${post.contentType}">${this.getContentTypeIcon(post.contentType)}</span>
                    </div>
                </div>

                <div class="post-content">
                    <div class="post-text">${post.content}</div>
                    ${this.renderPostMedia(post.media)}
                    ${post.hashtags.length > 0 ? `
                        <div class="post-hashtags">
                            ${post.hashtags.map(tag => `
                                <span class="hashtag" onclick="searchPostsDashboard.searchPosts('${tag}')">${tag}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <div class="post-engagement">
                    <div class="engagement-stats">
                        <span class="stat-item">
                            <i class="fas fa-heart"></i>
                            <span class="stat-count">${this.formatNumber(post.likes)}</span>
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-comment"></i>
                            <span class="stat-count">${this.formatNumber(post.comments)}</span>
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-share"></i>
                            <span class="stat-count">${this.formatNumber(post.shares)}</span>
                        </span>
                    </div>

                    <div class="post-actions">
                        <button class="post-action-btn post-like-btn ${post.isLiked ? 'liked' : ''}" 
                                title="${post.isLiked ? 'Unlike' : 'Like'}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="post-action-btn post-comment-btn" title="Comment">
                            <i class="fas fa-comment"></i>
                        </button>
                        <button class="post-action-btn post-share-btn" title="Share">
                            <i class="fas fa-share"></i>
                        </button>
                        <button class="post-action-btn view-full-post-btn" title="View Full Post">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderGridView(container) {
        container.innerHTML = this.searchResults.map(post => `
            <div class="post-grid-item" data-post-id="${post.id}">
                <div class="grid-post-media">
                    ${this.renderGridPostMedia(post)}
                </div>
                <div class="grid-post-overlay">
                    <div class="grid-post-author">
                        <img src="${post.author.avatar}" alt="${post.author.name}" class="grid-author-avatar">
                        <span class="grid-author-name">${post.author.name}</span>
                    </div>
                    <div class="grid-post-stats">
                        <span><i class="fas fa-heart"></i> ${this.formatNumber(post.likes)}</span>
                        <span><i class="fas fa-comment"></i> ${this.formatNumber(post.comments)}</span>
                    </div>
                </div>
                <div class="grid-post-actions">
                    <button class="grid-action-btn post-like-btn ${post.isLiked ? 'liked' : ''}">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="grid-action-btn view-full-post-btn">
                        <i class="fas fa-expand"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderPostMedia(media) {
        if (!media) return '';

        switch (media.type) {
            case 'image':
                return `
                    <div class="post-media image-media">
                        <img src="${media.url}" alt="${media.alt}" class="post-image" loading="lazy">
                    </div>
                `;
            case 'video':
                return `
                    <div class="post-media video-media">
                        <div class="video-thumbnail" style="background-image: url('${media.thumbnail}')">
                            <div class="video-play-button">
                                <i class="fas fa-play"></i>
                            </div>
                            <div class="video-duration">${this.formatDuration(media.duration)}</div>
                            <div class="video-views">${this.formatNumber(media.views)} views</div>
                        </div>
                    </div>
                `;
            case 'link':
                return `
                    <div class="post-media link-media">
                        <div class="link-preview">
                            <img src="${media.favicon}" alt="Favicon" class="link-favicon">
                            <div class="link-info">
                                <h6 class="link-title">${media.title}</h6>
                                <p class="link-description">${media.description}</p>
                                <span class="link-url">${media.url}</span>
                            </div>
                        </div>
                    </div>
                `;
            default:
                return '';
        }
    }

    renderGridPostMedia(post) {
        if (post.media) {
            switch (post.media.type) {
                case 'image':
                    return `<img src="${post.media.thumbnail || post.media.url}" alt="${post.media.alt}" class="grid-media-image">`;
                case 'video':
                    return `
                        <div class="grid-video-thumbnail" style="background-image: url('${post.media.thumbnail}')">
                            <div class="grid-video-play"><i class="fas fa-play"></i></div>
                            <div class="grid-video-duration">${this.formatDuration(post.media.duration)}</div>
                        </div>
                    `;
                default:
                    return `<div class="grid-text-placeholder"><i class="fas fa-file-text"></i></div>`;
            }
        }
        return `<div class="grid-text-placeholder"><i class="fas fa-file-text"></i></div>`;
    }

    getContentTypeIcon(type) {
        const icons = {
            text: '<i class="fas fa-align-left"></i>',
            image: '<i class="fas fa-image"></i>',
            video: '<i class="fas fa-video"></i>',
            link: '<i class="fas fa-link"></i>'
        };
        return icons[type] || icons.text;
    }

    toggleView(view) {
        this.viewMode = view;
        
        // Update toggle buttons
        document.querySelectorAll('.posts-sort-options .view-toggle-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Update view containers
        document.getElementById('posts-list-view').classList.toggle('active', view === 'list');
        document.getElementById('posts-grid-view').classList.toggle('active', view === 'grid');

        this.renderResults();
        this.app.showToast(`Switched to ${view} view`, 'info');
    }

    applyFilters() {
        // Collect filter values
        const contentTypeCheckboxes = document.querySelectorAll('.posts-filters input[type="checkbox"]');
        this.filters.contentTypes = Array.from(contentTypeCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        this.filters.dateFrom = document.getElementById('posts-date-from')?.value || null;
        this.filters.dateTo = document.getElementById('posts-date-to')?.value || null;
        this.filters.hashtags = document.getElementById('posts-hashtags-filter')?.value || '';
        this.filters.author = document.getElementById('posts-author-filter')?.value || '';
        this.filters.minLikes = parseInt(document.getElementById('posts-min-likes')?.value) || 0;
        this.filters.minComments = parseInt(document.getElementById('posts-min-comments')?.value) || 0;

        // Reapply search with filters
        if (this.currentQuery) {
            this.searchPosts(this.currentQuery);
        }

        this.app.showToast('Filters applied', 'success');
    }

    clearFilters() {
        // Reset filter values
        this.filters = {
            contentTypes: ['text', 'image', 'video', 'link'],
            dateFrom: null,
            dateTo: null,
            hashtags: '',
            author: '',
            minLikes: 0,
            minComments: 0
        };

        // Reset UI elements
        document.querySelectorAll('.posts-filters input[type="checkbox"]').forEach(cb => cb.checked = true);
        document.querySelectorAll('.posts-filters input[type="date"]').forEach(input => input.value = '');
        document.querySelectorAll('.posts-filters input[type="text"]').forEach(input => input.value = '');
        document.querySelectorAll('.posts-filters input[type="number"]').forEach(input => input.value = '');

        // Reapply search
        if (this.currentQuery) {
            this.searchPosts(this.currentQuery);
        }

        this.app.showToast('Filters cleared', 'info');
    }

    handleFilterChange(input) {
        // Real-time filter updates could be implemented here
        // For now, we'll wait for the apply button
    }

    async loadMoreResults() {
        if (this.isLoading || !this.hasMore) return;

        this.currentPage++;
        this.setLoading(true, 'load-more');

        try {
            const moreResults = await this.performPostsSearch(this.currentQuery);
            
            if (moreResults.length > 0) {
                this.searchResults = [...this.searchResults, ...moreResults];
                this.renderResults();
            } else {
                this.hasMore = false;
                this.updateLoadMoreButton();
            }
        } catch (error) {
            console.error('Failed to load more results:', error);
            this.app.showToast('Failed to load more results', 'error');
        } finally {
            this.setLoading(false, 'load-more');
        }
    }

    handlePostLike(postCard) {
        const postId = postCard.dataset.postId;
        const post = this.searchResults.find(p => p.id === postId);
        
        if (post) {
            post.isLiked = !post.isLiked;
            post.likes += post.isLiked ? 1 : -1;
            
            const likeBtn = postCard.querySelector('.post-like-btn');
            likeBtn.classList.toggle('liked', post.isLiked);
            
            const likeCount = postCard.querySelector('.stat-count');
            if (likeCount) {
                likeCount.textContent = this.formatNumber(post.likes);
            }
            
            this.app.showToast(post.isLiked ? 'Post liked!' : 'Post unliked', 'success');
        }
    }

    handlePostComment(postCard) {
        const postId = postCard.dataset.postId;
        this.app.showToast('Comment feature coming soon!', 'info');
        // Comment functionality would be implemented here
    }

    viewFullPost(postCard) {
        const postId = postCard.dataset.postId;
        const post = this.searchResults.find(p => p.id === postId);
        
        if (post) {
            this.openPostModal(post);
        }
    }

    openPostModal(post) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content post-modal">
                <div class="post-modal-header">
                    <div class="post-author">
                        <img src="${post.author.avatar}" alt="${post.author.name}" class="author-avatar">
                        <div class="author-info">
                            <h5>${post.author.name}</h5>
                            <span>${post.author.username}</span>
                        </div>
                    </div>
                    <button class="close-modal-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="post-modal-content">
                    <div class="post-text">${post.content}</div>
                    ${this.renderPostMedia(post.media)}
                    ${post.hashtags.length > 0 ? `
                        <div class="post-hashtags">
                            ${post.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="post-modal-footer">
                    <div class="engagement-stats">
                        <span><i class="fas fa-heart"></i> ${this.formatNumber(post.likes)}</span>
                        <span><i class="fas fa-comment"></i> ${this.formatNumber(post.comments)}</span>
                        <span><i class="fas fa-share"></i> ${this.formatNumber(post.shares)}</span>
                    </div>
                    <div class="post-timestamp">${this.formatTimestamp(post.timestamp)}</div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        modal.querySelector('.close-modal-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    showEmptyState() {
        const emptyState = document.getElementById('posts-empty-state');
        const resultsContainer = document.getElementById('posts-results-container');

        if (emptyState) {
            emptyState.style.display = 'flex';
        }
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
    }

    hideEmptyState() {
        const emptyState = document.getElementById('posts-empty-state');
        const resultsContainer = document.getElementById('posts-results-container');

        if (emptyState) {
            emptyState.style.display = 'none';
        }
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
        }
    }

    setLoading(isLoading, type = 'search') {
        this.isLoading = isLoading;

        if (type === 'search') {
            const resultsContainer = document.getElementById('posts-results-container');
            if (resultsContainer) {
                if (isLoading) {
                    resultsContainer.innerHTML = `
                        <div class="posts-loading-state">
                            <div class="loading-spinner"></div>
                            <p>Searching posts...</p>
                        </div>
                    `;
                }
            }
        } else if (type === 'load-more') {
            const loadMoreBtn = document.getElementById('posts-load-more');
            if (loadMoreBtn) {
                loadMoreBtn.disabled = isLoading;
                loadMoreBtn.innerHTML = isLoading ? 
                    '<i class="fas fa-spinner fa-spin"></i> Loading...' :
                    '<i class="fas fa-chevron-down"></i> Load More Posts';
            }
        }
    }

    updateLoadMoreButton() {
        const loadMoreContainer = document.getElementById('posts-load-more-container');
        if (loadMoreContainer) {
            if (this.hasMore && this.searchResults.length > 0) {
                loadMoreContainer.style.display = 'flex';
            } else {
                loadMoreContainer.style.display = 'none';
            }
        }
    }

    updateResultsCount() {
        const resultsCountBadge = document.getElementById('posts-results-count');
        if (resultsCountBadge) {
            resultsCountBadge.textContent = this.formatNumber(this.searchResults.length);
            resultsCountBadge.style.display = this.searchResults.length > 0 ? 'inline' : 'none';
        }
    }

    initializeFilters() {
        // Set default checkbox values
        document.querySelectorAll('.posts-filters input[type="checkbox"]').forEach(checkbox => {
            if (this.filters.contentTypes.includes(checkbox.value)) {
                checkbox.checked = true;
            }
        });
    }

    loadTrendingTopics() {
        // This would typically load from an API
        const trendingTopics = ['photography', 'travel', 'food', 'art', 'music'];
        const trendingContainer = document.querySelector('#posts-empty-state .trending-tags');
        
        if (trendingContainer) {
            trendingContainer.innerHTML = trendingTopics.map(topic => 
                `<span class="trending-tag" onclick="searchPostsDashboard.searchPosts('${topic}')">#${topic}</span>`
            ).join('');
        }
    }

    formatTimestamp(timestamp) {
        const now = new Date();
        const postDate = new Date(timestamp);
        const diffMs = now - postDate;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) {
            return 'Just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return postDate.toLocaleDateString();
        }
    }

    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// Initialize the Search Posts Dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for the main app to be available
    const initDashboard = () => {
        if (window.connectHub) {
            window.searchPostsDashboard = new SearchPostsDashboard(window.connectHub);
            console.log('Search Posts Dashboard initialized');
        } else {
            setTimeout(initDashboard, 100);
        }
    };
    
    initDashboard();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchPostsDashboard;
}
