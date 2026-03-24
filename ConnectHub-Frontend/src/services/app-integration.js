/**
 * LynkApp Integration Layer - Phase 9
 * Connects all 8 phases into one cohesive app
 *
 * Phase 9 Wiring:
 *   9.1 App bootstrap — start all services after login, tear down on logout
 *   9.2 Nav badge wiring — notification bell + messages unread count
 *   9.3 Like button integration — like post + trigger notification
 *   9.4 Comment integration — comment + trigger notification
 *   9.5 Friend button integration — send/accept request + trigger notification
 *   9.6 Message integration — open DM + send message + trigger notification
 *   9.7 Post image upload — compress, upload, create post
 *   9.8 Avatar upload — compress, upload, update profile
 *
 * This file is the single entry-point for your UI code.
 * Import or load this file, then call:
 *   LynkApp.bootstrap()     → called automatically on authStateChanged
 *   LynkApp.likePost(post)  → handles everything
 *   LynkApp.sendMessage(...)
 *   etc.
 *
 * Updated: Phase 9 - March 2026
 */

const LynkApp = (() => {

    // ─────────────────────────────────────────────
    //  INTERNAL STATE
    // ─────────────────────────────────────────────

    const _unsubscribers = [];   // All active listeners — cleaned up on logout
    let   _bootstrapped   = false;

    // ─────────────────────────────────────────────
    //  TASK 9.1 — APP BOOTSTRAP
    //  Called automatically when user logs in
    // ─────────────────────────────────────────────

    /**
     * Start all real-time listeners after a successful login.
     * Wire up the nav badges, notification bell, and messages badge.
     *
     * Usage: Called automatically. You can also call manually:
     *   LynkApp.bootstrap();
     */
    async function bootstrap() {
        if (_bootstrapped) return;

        const user = window.authService?.getCurrentUser();
        if (!user) {
            console.warn('LynkApp.bootstrap() called but no user logged in');
            return;
        }

        console.log('🚀 LynkApp: Bootstrapping all services for', user.username || user.email);

        // TASK 9.2 — Wire nav badges
        _wireNavBadges();

        _bootstrapped = true;
        console.log('✅ LynkApp: All services bootstrapped');

        // Dispatch ready event — UI can listen for this
        window.dispatchEvent(new CustomEvent('lynkapp:ready', { detail: { user } }));
    }

    /**
     * Tear down all active listeners on logout.
     * Prevents Firebase quota waste and memory leaks.
     */
    function teardown() {
        _unsubscribers.forEach(fn => { try { fn(); } catch (e) {} });
        _unsubscribers.length = 0;

        window.messagingService?.stopAllListeners?.();
        window.notificationService?.stopAllListeners?.();

        _bootstrapped = false;
        console.log('🛑 LynkApp: Listeners torn down');
    }

    // ─────────────────────────────────────────────
    //  TASK 9.2 — NAV BADGE WIRING
    // ─────────────────────────────────────────────

    function _wireNavBadges() {
        // Notification bell badge
        if (window.notificationService) {
            const unsubNotif = window.notificationService.listenToUnreadCount((count) => {
                _updateBadge('.notif-bell-badge, [data-badge="notifications"]', count);
            });
            if (unsubNotif) _unsubscribers.push(unsubNotif);
        }

        // Messages badge
        if (window.messagingService) {
            const unsubMsg = window.messagingService.listenToUnreadCount((count) => {
                _updateBadge('.messages-badge, [data-badge="messages"]', count);
            });
            if (unsubMsg) _unsubscribers.push(unsubMsg);
        }
    }

    function _updateBadge(selector, count) {
        document.querySelectorAll(selector).forEach(el => {
            el.textContent    = count > 99 ? '99+' : (count > 0 ? count : '');
            el.style.display  = count > 0 ? 'flex' : 'none';
        });
    }

    // ─────────────────────────────────────────────
    //  TASK 9.3 — LIKE POST
    // ─────────────────────────────────────────────

    /**
     * Like (or unlike) a post. Handles:
     *   1. Calling the feed API to persist the like
     *   2. Sending a notification to the post author
     *   3. Updating the like button UI (optimistic update)
     *
     * @param {object} post  { postId, authorId, isLiked, likeCount }
     * @param {HTMLElement} [likeBtn]  Optional button to update visually
     * @returns {{ success, isLiked, likeCount }}
     *
     * Usage:
     *   likeBtn.addEventListener('click', () => LynkApp.likePost(post, likeBtn));
     */
    async function likePost(post, likeBtn) {
        try {
            const me = window.authService?.getCurrentUser();
            if (!me) return { success: false, error: 'Not logged in' };

            const newIsLiked  = !post.isLiked;
            const newCount    = post.likeCount + (newIsLiked ? 1 : -1);

            // Optimistic UI update
            if (likeBtn) {
                likeBtn.classList.toggle('liked', newIsLiked);
                const countEl = likeBtn.querySelector('.like-count');
                if (countEl) countEl.textContent = newCount;
            }

            // Persist to Firestore
            let result = { success: true };
            if (window.feedAPIService) {
                result = newIsLiked
                    ? await window.feedAPIService.likePost(post.postId)
                    : await window.feedAPIService.unlikePost(post.postId);
            }

            // Send notification (only when liking, not unliking; never self-notify)
            if (newIsLiked && post.authorId !== me.userId && window.notificationService) {
                window.notificationService.notifyLike(post.authorId, post.postId);
            }

            // Update the post object for next interaction
            post.isLiked  = newIsLiked;
            post.likeCount = newCount;

            return { success: true, isLiked: newIsLiked, likeCount: newCount };
        } catch (error) {
            console.error('❌ LynkApp.likePost error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 9.4 — ADD COMMENT
    // ─────────────────────────────────────────────

    /**
     * Submit a comment on a post. Handles:
     *   1. Saving the comment via feed API
     *   2. Sending a notification to the post author
     *
     * @param {object} post    { postId, authorId }
     * @param {string} text    Comment text
     * @returns {{ success, commentId }}
     *
     * Usage:
     *   const result = await LynkApp.addComment(post, commentInput.value);
     */
    async function addComment(post, text) {
        try {
            const me = window.authService?.getCurrentUser();
            if (!me) return { success: false, error: 'Not logged in' };
            if (!text?.trim()) return { success: false, error: 'Comment cannot be empty' };

            let result = { success: true };
            if (window.feedAPIService) {
                result = await window.feedAPIService.createComment(post.postId, { content: text.trim() });
            }

            // Notify the post author (skip self-comments)
            if (post.authorId !== me.userId && window.notificationService) {
                window.notificationService.notifyComment(post.authorId, post.postId, text.trim());
            }

            return result;
        } catch (error) {
            console.error('❌ LynkApp.addComment error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 9.5 — FRIEND BUTTON
    // ─────────────────────────────────────────────

    /**
     * Send a friend request to another user. Handles:
     *   1. Calling the friends API
     *   2. Sending a notification to the target user
     *
     * @param {string} targetUserId
     * @returns {{ success }}
     *
     * Usage:
     *   addFriendBtn.addEventListener('click', () => LynkApp.sendFriendRequest(user.userId));
     */
    async function sendFriendRequest(targetUserId) {
        try {
            let result = { success: true };
            if (window.friendsAPIService) {
                result = await window.friendsAPIService.sendFriendRequest(targetUserId);
            }

            if (result.success && window.notificationService) {
                window.notificationService.notifyFriendRequest(targetUserId);
            }

            return result;
        } catch (error) {
            console.error('❌ LynkApp.sendFriendRequest error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Accept a friend request. Handles:
     *   1. Calling the friends API
     *   2. Sending a notification back to the requester
     *
     * @param {string} requesterId  The user who sent the original request
     * @returns {{ success }}
     *
     * Usage:
     *   acceptBtn.addEventListener('click', () => LynkApp.acceptFriendRequest(requesterId));
     */
    async function acceptFriendRequest(requesterId) {
        try {
            let result = { success: true };
            if (window.friendsAPIService) {
                result = await window.friendsAPIService.acceptFriendRequest(requesterId);
            }

            if (result.success && window.notificationService) {
                window.notificationService.notifyFriendAccepted(requesterId);
            }

            return result;
        } catch (error) {
            console.error('❌ LynkApp.acceptFriendRequest error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 9.6 — MESSAGING
    // ─────────────────────────────────────────────

    /**
     * Open a DM conversation with another user.
     * Gets or creates the conversation, then returns the conversationId.
     *
     * @param {string} otherUserId
     * @returns {{ success, conversationId, isNew }}
     *
     * Usage:
     *   const { conversationId } = await LynkApp.openConversation(user.userId);
     *   // Then navigate to the messages screen with this conversationId
     */
    async function openConversation(otherUserId) {
        if (!window.messagingService) return { success: false, error: 'Messaging not available' };
        return window.messagingService.getOrCreateConversation(otherUserId);
    }

    /**
     * Send a text message in a conversation. Handles:
     *   1. Saving the message via messaging service
     *   2. Sending a notification to the recipient
     *
     * @param {string} conversationId
     * @param {string} otherUserId    The recipient's user ID (for notification)
     * @param {string} text
     * @returns {{ success, messageId }}
     *
     * Usage:
     *   sendBtn.addEventListener('click', async () => {
     *     const result = await LynkApp.sendMessage(conversationId, otherUserId, input.value);
     *     if (result.success) input.value = '';
     *   });
     */
    async function sendMessage(conversationId, otherUserId, text) {
        try {
            if (!window.messagingService) return { success: false, error: 'Messaging not available' };

            const result = await window.messagingService.sendMessage(conversationId, text);

            // Send notification to the recipient
            if (result.success && window.notificationService) {
                window.notificationService.notifyNewMessage(otherUserId, conversationId, text);
            }

            return result;
        } catch (error) {
            console.error('❌ LynkApp.sendMessage error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Subscribe to live messages for a conversation.
     * Automatically marks messages as read when opened.
     *
     * @param {string}   conversationId
     * @param {Function} callback   Called with (messages[]) on every change
     * @returns {Function} Unsubscribe function
     *
     * Usage:
     *   const unsub = LynkApp.listenToMessages(conversationId, msgs => renderMessages(msgs));
     *   // On leaving the conversation screen: unsub();
     */
    function listenToMessages(conversationId, callback) {
        if (!window.messagingService) return () => {};

        // Mark as read when opening a conversation
        window.messagingService.markConversationAsRead(conversationId);

        return window.messagingService.listenToMessages(conversationId, callback);
    }

    // ─────────────────────────────────────────────
    //  TASK 9.7 — POST WITH IMAGE UPLOAD
    // ─────────────────────────────────────────────

    /**
     * Create a new post (with optional image).
     * Handles compression, upload, then post creation in one call.
     *
     * @param {object}   opts
     * @param {string}   opts.content     Post text
     * @param {File}     [opts.imageFile] Optional image to attach
     * @param {Function} [opts.onProgress] Called with (percent) during upload
     * @returns {{ success, postId, downloadURL }}
     *
     * Usage:
     *   const result = await LynkApp.createPost({
     *     content: 'My post caption',
     *     imageFile: fileInput.files[0],
     *     onProgress: pct => uploadBar.style.width = pct + '%'
     *   });
     */
    async function createPost({ content, imageFile, onProgress } = {}) {
        try {
            let imageUrl = null;

            // Upload image first (if attached)
            if (imageFile && window.storageService) {
                const uploadResult = await window.storageService.uploadPostImage(imageFile, onProgress);
                if (!uploadResult.success) {
                    return { success: false, error: 'Image upload failed: ' + uploadResult.error };
                }
                imageUrl = uploadResult.downloadURL;
            }

            // Create the post
            let result = { success: true };
            if (window.feedAPIService) {
                result = await window.feedAPIService.createPost({
                    content:  content || '',
                    imageUrl: imageUrl || null
                });
            }

            return { ...result, imageUrl };
        } catch (error) {
            console.error('❌ LynkApp.createPost error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 9.8 — AVATAR UPLOAD
    // ─────────────────────────────────────────────

    /**
     * Upload a new profile avatar. Handles:
     *   1. Validate the file
     *   2. Show immediate preview
     *   3. Compress + upload to Firebase Storage
     *   4. Update the user's profile in Firestore
     *   5. Update all visible avatar <img> tags on the page
     *
     * @param {File}       file
     * @param {HTMLElement} [avatarImg]   Preview image element to update immediately
     * @param {Function}   [onProgress]  Called with (percent) during upload
     * @returns {{ success, downloadURL }}
     *
     * Usage:
     *   avatarInput.addEventListener('change', async (e) => {
     *     const result = await LynkApp.uploadAvatar(
     *       e.target.files[0],
     *       document.querySelector('#my-avatar'),
     *       pct => progressBar.style.width = pct + '%'
     *     );
     *   });
     */
    async function uploadAvatar(file, avatarImg, onProgress) {
        if (!window.storageService) return { success: false, error: 'Storage not available' };

        // Validate
        const validationError = window.storageService.validateImageFile(file, 10);
        if (validationError) return { success: false, error: validationError };

        // Immediate preview
        let previewUrl = null;
        if (avatarImg) {
            previewUrl = window.storageService.createPreviewURL(file);
            avatarImg.src = previewUrl;
        }

        // Upload (compresses automatically)
        const result = await window.storageService.uploadProfilePhoto(file, onProgress);

        // Clean up preview URL
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        // Update all visible avatar elements on the page
        if (result.success) {
            document.querySelectorAll('[data-my-avatar]').forEach(img => {
                img.src = result.downloadURL;
            });
            if (avatarImg) avatarImg.src = result.downloadURL;
        }

        return result;
    }

    // ─────────────────────────────────────────────
    //  NOTIFICATION PANEL HELPERS
    // ─────────────────────────────────────────────

    /**
     * Open the notification panel.
     * Marks all as read and subscribes to live updates.
     *
     * @param {Function} renderCallback  Called with (notifications[])
     * @returns {Function} Unsubscribe function
     *
     * Usage:
     *   bellIcon.addEventListener('click', () => {
     *     const unsub = LynkApp.openNotificationPanel(renderNotifications);
     *     closePanel.addEventListener('click', unsub, { once: true });
     *   });
     */
    function openNotificationPanel(renderCallback) {
        if (!window.notificationService) return () => {};

        // Mark all as read when panel opens
        window.notificationService.markAllAsRead();

        // Subscribe to live updates
        return window.notificationService.listenToNotifications(renderCallback);
    }

    /**
     * Tap a notification — mark it as read, then navigate to the right screen.
     *
     * @param {object}   notification  Full notification object
     * @param {Function} [navigateFn] Custom navigation function (default: location.hash)
     *
     * Usage:
     *   LynkApp.handleNotificationTap(notification, (path) => router.navigate(path));
     */
    async function handleNotificationTap(notification, navigateFn) {
        if (!window.notificationService) return;

        // Mark as read
        await window.notificationService.markAsRead(notification.notificationId);

        // Navigate
        const target = window.notificationService.getNavigationTarget(notification);
        if (navigateFn) {
            navigateFn(target);
        } else {
            window.location.hash = target;
        }
    }

    // ─────────────────────────────────────────────
    //  AUTH STATE WATCHER
    //  Automatically bootstrap on login, teardown on logout
    // ─────────────────────────────────────────────

    function _watchAuthState() {
        // Listen for login
        window.addEventListener('auth:loginSuccess', () => {
            setTimeout(bootstrap, 500); // Small delay to ensure all services are ready
        });

        // Listen for logout
        window.addEventListener('auth:logout', teardown);

        // If user is already logged in when this script loads
        const currentUser = window.authService?.getCurrentUser();
        if (currentUser) {
            setTimeout(bootstrap, 1000);
        }
    }

    // ─────────────────────────────────────────────
    //  UTILITY HELPERS
    // ─────────────────────────────────────────────

    /**
     * Format a timestamp as a relative "time ago" string.
     * e.g. "just now", "2m ago", "3h ago", "Jan 15"
     */
    function timeAgo(timestamp) {
        const now   = Date.now();
        const date  = new Date(timestamp).getTime();
        const diff  = Math.floor((now - date) / 1000); // seconds

        if (diff < 60)           return 'just now';
        if (diff < 3600)         return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400)        return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800)       return `${Math.floor(diff / 86400)}d ago`;

        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day:   'numeric'
        });
    }

    /**
     * Truncate text with an ellipsis.
     */
    function truncate(text, maxLength = 100) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
    }

    // ─────────────────────────────────────────────
    //  INITIALIZATION
    // ─────────────────────────────────────────────

    // Start watching auth state as soon as this script loads
    _watchAuthState();
    console.log('📱 LynkApp Integration Layer loaded — waiting for login...');

    // ─────────────────────────────────────────────
    //  PUBLIC API
    // ─────────────────────────────────────────────

    return {
        // Lifecycle
        bootstrap,
        teardown,

        // Feed interactions (Phase 4 + 8)
        likePost,
        addComment,
        createPost,

        // Social (Phase 5 + 8)
        sendFriendRequest,
        acceptFriendRequest,

        // Messaging (Phase 6 + 8)
        openConversation,
        sendMessage,
        listenToMessages,

        // File uploads (Phase 7)
        uploadAvatar,

        // Notifications (Phase 8)
        openNotificationPanel,
        handleNotificationTap,

        // Utilities
        timeAgo,
        truncate
    };
})();

// Make globally available
window.LynkApp = LynkApp;

// export default LynkApp; // Removed: loaded as regular <script>, not ES module
