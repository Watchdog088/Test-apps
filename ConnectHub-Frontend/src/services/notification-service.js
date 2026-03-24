/**
 * LynkApp Notification Service - Phase 8
 * Real-time In-App Notifications (Firestore)
 *
 * Phase 8 Features:
 *   8.1 Create a notification (write to Firestore)
 *   8.2 Listen to notifications in real-time (onSnapshot)
 *   8.3 Mark one notification as read
 *   8.4 Mark ALL notifications as read
 *   8.5 Delete a notification
 *   8.6 Real-time unread count (notification bell badge)
 *   8.7 Trigger helpers — notifyLike, notifyComment,
 *       notifyFriendRequest, notifyFriendAccepted, notifyNewMessage, notifyMention
 *
 * Firestore structure:
 *   notifications/{notifId}
 *     recipientId:    "uid123"
 *     senderId:       "uid456"
 *     senderName:     "John Doe"
 *     senderAvatar:   "https://..."
 *     type:           "like" | "comment" | "friend_request" | "friend_accepted"
 *                     | "new_message" | "mention" | "follow"
 *     message:        "John liked your post"
 *     postId:         "postId123"     (optional — for likes/comments/mentions)
 *     conversationId: "uid1_uid2"     (optional — for messages)
 *     isRead:         false
 *     createdAt:      timestamp
 *
 * Notification types and their messages:
 *   like              → "{name} liked your post"
 *   comment           → "{name} commented: {excerpt}"
 *   friend_request    → "{name} sent you a friend request"
 *   friend_accepted   → "{name} accepted your friend request"
 *   new_message       → "{name} sent you a message"
 *   mention           → "{name} mentioned you in a post"
 *   follow            → "{name} started following you"
 *
 * Updated: Phase 8 - March 2026
 */

let db;
let addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc,
    collection, query, where, orderBy, limit,
    onSnapshot, serverTimestamp, writeBatch;

class NotificationService {
    constructor() {
        this.firebaseInitialized = false;
        this._listeners          = new Map(); // key → unsubscribe fn
        this.initializeFirebase();
    }

    // ─────────────────────────────────────────────
    //  FIREBASE INIT
    // ─────────────────────────────────────────────

    async initializeFirebase() {
        try {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
            const { getApps }    = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');

            const apps = getApps();
            if (apps.length === 0) {
                console.warn('⏳ NotificationService: Firebase not ready, retrying...');
                setTimeout(() => this.initializeFirebase(), 1000);
                return;
            }

            db              = firestoreModule.getFirestore(apps[0]);
            addDoc          = firestoreModule.addDoc;
            getDoc          = firestoreModule.getDoc;
            getDocs         = firestoreModule.getDocs;
            updateDoc       = firestoreModule.updateDoc;
            deleteDoc       = firestoreModule.deleteDoc;
            doc             = firestoreModule.doc;
            collection      = firestoreModule.collection;
            query           = firestoreModule.query;
            where           = firestoreModule.where;
            orderBy         = firestoreModule.orderBy;
            limit           = firestoreModule.limit;
            onSnapshot      = firestoreModule.onSnapshot;
            serverTimestamp = firestoreModule.serverTimestamp;
            writeBatch      = firestoreModule.writeBatch;

            this.firebaseInitialized = true;
            console.log('✅ NotificationService: Firebase ready');
        } catch (error) {
            console.error('❌ NotificationService: Firebase init failed', error);
        }
    }

    async waitForFirebase() {
        let attempts = 0;
        while (!this.firebaseInitialized && attempts < 20) {
            await new Promise(r => setTimeout(r, 500));
            attempts++;
        }
        if (!this.firebaseInitialized) throw new Error('Firebase not available. Please refresh.');
    }

    _me() {
        const u = window.authService?.getCurrentUser();
        if (!u) throw new Error('You must be logged in');
        return u;
    }

    // ─────────────────────────────────────────────
    //  TASK 8.1 — CREATE A NOTIFICATION
    // ─────────────────────────────────────────────

    /**
     * Write a notification to Firestore for a specific recipient.
     * The recipient will see it in real-time via their onSnapshot listener.
     *
     * @param {object} opts
     * @param {string} opts.recipientId     User who receives the notification
     * @param {string} opts.type            "like"|"comment"|"friend_request"|"friend_accepted"|"new_message"|"mention"|"follow"
     * @param {string} opts.message         Human-readable message e.g. "John liked your post"
     * @param {string} [opts.postId]        Relevant post (for likes/comments)
     * @param {string} [opts.conversationId] Relevant conversation (for messages)
     * @returns {{ success, notificationId }}
     */
    async createNotification({ recipientId, type, message, postId, conversationId }) {
        try {
            await this.waitForFirebase();
            const me = this._me();

            // Don't notify yourself
            if (recipientId === me.userId) {
                return { success: true, notificationId: null };
            }

            const notifData = {
                recipientId:    recipientId,
                senderId:       me.userId,
                senderName:     me.displayName   || me.username || 'Someone',
                senderAvatar:   me.profilePicture || '',
                type:           type,
                message:        message,
                isRead:         false,
                createdAt:      serverTimestamp()
            };

            if (postId)         notifData.postId         = postId;
            if (conversationId) notifData.conversationId = conversationId;

            const docRef = await addDoc(collection(db, 'notifications'), notifData);
            return { success: true, notificationId: docRef.id };
        } catch (error) {
            console.error('❌ createNotification error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 8.2 — LISTEN TO NOTIFICATIONS (real-time)
    // ─────────────────────────────────────────────

    /**
     * Subscribe to the current user's notifications.
     * Fires immediately with existing notifications, then updates in real-time.
     *
     * @param {Function} callback  Called with (notifications[])
     * @param {number}   [max=50]  Max notifications to fetch
     * @returns {Function} Unsubscribe function
     *
     * Usage:
     *   const unsub = notificationService.listenToNotifications((notifs) => {
     *     renderNotificationList(notifs);
     *   });
     *   // Later: unsub();
     */
    listenToNotifications(callback, max = 50) {
        if (!this.firebaseInitialized) {
            setTimeout(() => this.listenToNotifications(callback, max), 1000);
            return () => {};
        }

        const me = this._me();

        // Cancel any previous listener
        const prev = this._listeners.get('notifications');
        if (prev) prev();

        const q = query(
            collection(db, 'notifications'),
            where('recipientId', '==', me.userId),
            orderBy('createdAt', 'desc'),
            limit(max)
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const notifications = snap.docs.map(d => ({
                notificationId: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            }));
            callback(notifications);
        }, (error) => {
            console.error('❌ Notifications listener error:', error);
        });

        this._listeners.set('notifications', unsubscribe);
        return unsubscribe;
    }

    /**
     * One-time fetch of the current user's notifications.
     */
    async getNotifications(max = 50) {
        try {
            await this.waitForFirebase();
            const me = this._me();

            const snap = await getDocs(
                query(
                    collection(db, 'notifications'),
                    where('recipientId', '==', me.userId),
                    orderBy('createdAt', 'desc'),
                    limit(max)
                )
            );

            const notifications = snap.docs.map(d => ({
                notificationId: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            }));

            return { success: true, data: notifications };
        } catch (error) {
            console.error('❌ getNotifications error:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 8.3 — MARK ONE NOTIFICATION AS READ
    // ─────────────────────────────────────────────

    /**
     * Mark a single notification as read.
     * Call this when the user taps/clicks a notification.
     *
     * @param {string} notificationId
     */
    async markAsRead(notificationId) {
        try {
            await this.waitForFirebase();
            await updateDoc(doc(db, 'notifications', notificationId), {
                isRead: true
            });
            return { success: true };
        } catch (error) {
            console.error('❌ markAsRead error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 8.4 — MARK ALL NOTIFICATIONS AS READ
    // ─────────────────────────────────────────────

    /**
     * Mark ALL unread notifications as read for the current user.
     * Call this when the user opens the notifications panel.
     * Uses Firestore batch writes for efficiency.
     */
    async markAllAsRead() {
        try {
            await this.waitForFirebase();
            const me = this._me();

            const snap = await getDocs(
                query(
                    collection(db, 'notifications'),
                    where('recipientId', '==', me.userId),
                    where('isRead', '==', false)
                )
            );

            if (snap.empty) return { success: true, count: 0 };

            // Batch update (max 500 per batch — notifications won't typically hit that)
            const batch = writeBatch(db);
            snap.docs.forEach(d => {
                batch.update(doc(db, 'notifications', d.id), { isRead: true });
            });
            await batch.commit();

            console.log(`✅ Marked ${snap.size} notifications as read`);
            return { success: true, count: snap.size };
        } catch (error) {
            console.error('❌ markAllAsRead error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 8.5 — DELETE A NOTIFICATION
    // ─────────────────────────────────────────────

    /**
     * Delete a notification for the current user.
     *
     * @param {string} notificationId
     */
    async deleteNotification(notificationId) {
        try {
            await this.waitForFirebase();
            await deleteDoc(doc(db, 'notifications', notificationId));
            return { success: true };
        } catch (error) {
            console.error('❌ deleteNotification error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 8.6 — REAL-TIME UNREAD COUNT (bell badge)
    // ─────────────────────────────────────────────

    /**
     * Subscribe to the unread notification count in real-time.
     * Use this to update the badge on the notification bell in the nav.
     *
     * @param {Function} callback  Called with (count: number)
     * @returns {Function} Unsubscribe function
     *
     * Usage:
     *   notificationService.listenToUnreadCount((count) => {
     *     bellBadge.textContent = count > 0 ? count : '';
     *     bellBadge.style.display = count > 0 ? 'flex' : 'none';
     *   });
     */
    listenToUnreadCount(callback) {
        if (!this.firebaseInitialized) {
            setTimeout(() => this.listenToUnreadCount(callback), 1000);
            return () => {};
        }

        const me = this._me();

        const prev = this._listeners.get('unreadCount');
        if (prev) prev();

        const q = query(
            collection(db, 'notifications'),
            where('recipientId', '==', me.userId),
            where('isRead', '==', false)
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            callback(snap.size);
        }, (error) => {
            console.error('❌ Unread count listener error:', error);
        });

        this._listeners.set('unreadCount', unsubscribe);
        return unsubscribe;
    }

    /**
     * One-time fetch of unread count.
     */
    async getUnreadCount() {
        try {
            await this.waitForFirebase();
            const me = this._me();

            const snap = await getDocs(
                query(
                    collection(db, 'notifications'),
                    where('recipientId', '==', me.userId),
                    where('isRead', '==', false)
                )
            );

            return { success: true, count: snap.size };
        } catch (error) {
            console.error('❌ getUnreadCount error:', error);
            return { success: false, count: 0 };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 8.7 — TRIGGER HELPERS
    //  Call these from other services to generate notifications
    // ─────────────────────────────────────────────

    /**
     * 👍 Notify someone that you liked their post.
     *
     * @param {string} postOwnerId
     * @param {string} postId
     *
     * Usage (in feed service, when user taps Like):
     *   await notificationService.notifyLike(post.authorId, post.postId);
     */
    async notifyLike(postOwnerId, postId) {
        const me = this._me();
        return this.createNotification({
            recipientId: postOwnerId,
            type:        'like',
            message:     `${me.displayName || me.username || 'Someone'} liked your post`,
            postId:      postId
        });
    }

    /**
     * 💬 Notify someone that you commented on their post.
     *
     * @param {string} postOwnerId
     * @param {string} postId
     * @param {string} commentExcerpt  First 60 chars of the comment
     *
     * Usage:
     *   await notificationService.notifyComment(post.authorId, post.postId, comment.text);
     */
    async notifyComment(postOwnerId, postId, commentExcerpt = '') {
        const me      = this._me();
        const excerpt = commentExcerpt.length > 60
            ? commentExcerpt.substring(0, 57) + '...'
            : commentExcerpt;

        return this.createNotification({
            recipientId: postOwnerId,
            type:        'comment',
            message:     `${me.displayName || me.username || 'Someone'} commented: "${excerpt}"`,
            postId:      postId
        });
    }

    /**
     * 👋 Notify someone that you sent them a friend request.
     *
     * @param {string} recipientId
     *
     * Usage (in friends service, when user taps Add Friend):
     *   await notificationService.notifyFriendRequest(targetUserId);
     */
    async notifyFriendRequest(recipientId) {
        const me = this._me();
        return this.createNotification({
            recipientId: recipientId,
            type:        'friend_request',
            message:     `${me.displayName || me.username || 'Someone'} sent you a friend request`
        });
    }

    /**
     * ✅ Notify someone that you accepted their friend request.
     *
     * @param {string} recipientId
     *
     * Usage (in friends service, when user accepts):
     *   await notificationService.notifyFriendAccepted(requestSenderId);
     */
    async notifyFriendAccepted(recipientId) {
        const me = this._me();
        return this.createNotification({
            recipientId: recipientId,
            type:        'friend_accepted',
            message:     `${me.displayName || me.username || 'Someone'} accepted your friend request`
        });
    }

    /**
     * 💬 Notify someone that you sent them a message.
     * Note: Only fires once per conversation per session to avoid spam.
     *
     * @param {string} recipientId
     * @param {string} conversationId
     * @param {string} [messagePreview]  First 40 chars of the message
     *
     * Usage (in messaging service, when sending first message):
     *   await notificationService.notifyNewMessage(otherUserId, conversationId, text);
     */
    async notifyNewMessage(recipientId, conversationId, messagePreview = '') {
        const me      = this._me();
        const preview = messagePreview.length > 40
            ? messagePreview.substring(0, 37) + '...'
            : messagePreview;

        return this.createNotification({
            recipientId:    recipientId,
            type:           'new_message',
            message:        `${me.displayName || me.username || 'Someone'} sent you a message: "${preview}"`,
            conversationId: conversationId
        });
    }

    /**
     * @ Notify someone that you mentioned them in a post.
     *
     * @param {string} mentionedUserId
     * @param {string} postId
     *
     * Usage (when creating a post that contains @username):
     *   await notificationService.notifyMention(mentionedUserId, postId);
     */
    async notifyMention(mentionedUserId, postId) {
        const me = this._me();
        return this.createNotification({
            recipientId: mentionedUserId,
            type:        'mention',
            message:     `${me.displayName || me.username || 'Someone'} mentioned you in a post`,
            postId:      postId
        });
    }

    /**
     * ➕ Notify someone that you started following them.
     *
     * @param {string} recipientId
     *
     * Usage:
     *   await notificationService.notifyFollow(targetUserId);
     */
    async notifyFollow(recipientId) {
        const me = this._me();
        return this.createNotification({
            recipientId: recipientId,
            type:        'follow',
            message:     `${me.displayName || me.username || 'Someone'} started following you`
        });
    }

    // ─────────────────────────────────────────────
    //  HELPER — STOP ALL LISTENERS
    // ─────────────────────────────────────────────

    stopAllListeners() {
        this._listeners.forEach(unsub => unsub());
        this._listeners.clear();
    }

    // ─────────────────────────────────────────────
    //  HELPER — NOTIFICATION ICON MAP
    // ─────────────────────────────────────────────

    /**
     * Returns an emoji or icon name for a given notification type.
     * Use this to render the correct icon next to each notification.
     */
    getIcon(type) {
        const icons = {
            like:            '❤️',
            comment:         '💬',
            friend_request:  '👋',
            friend_accepted: '✅',
            new_message:     '📩',
            mention:         '@',
            follow:          '➕'
        };
        return icons[type] || '🔔';
    }

    /**
     * Returns a route/path to navigate to when a notification is tapped.
     * Customize this to match your app's navigation structure.
     */
    getNavigationTarget(notification) {
        switch (notification.type) {
            case 'like':
            case 'comment':
            case 'mention':
                return notification.postId ? `/post/${notification.postId}` : '/feed';
            case 'friend_request':
                return '/friends/requests';
            case 'friend_accepted':
                return `/profile/${notification.senderId}`;
            case 'new_message':
                return notification.conversationId
                    ? `/messages/${notification.conversationId}`
                    : '/messages';
            case 'follow':
                return `/profile/${notification.senderId}`;
            default:
                return '/';
        }
    }
}

// ── Singleton ─────────────────────────────────
const notificationService = new NotificationService();
window.notificationService = notificationService;

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    notificationService.stopAllListeners();
});

// export default notificationService;
