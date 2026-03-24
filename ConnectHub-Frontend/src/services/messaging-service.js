/**
 * LynkApp Messaging Service - Phase 6
 * Real-time Firebase/Firestore Direct Messaging
 *
 * Phase 6 Features:
 *   6.1 Get or create a conversation (1-to-1 DMs)
 *   6.2 Send a message
 *   6.3 Real-time message listener (onSnapshot — messages appear instantly)
 *   6.4 List all conversations (newest first, with real-time updates)
 *   6.5 Mark messages as read + clear unread badge
 *   6.6 Delete a message (soft-delete)
 *   6.7 Unread message count (badge on nav icon)
 *
 * Firestore structure:
 *   conversations/{convoId}
 *     participants: [uid1, uid2]
 *     lastMessage:  { text, senderId, createdAt }
 *     lastMessageAt: timestamp
 *     unreadCounts:  { uid1: 0, uid2: 3 }
 *     createdAt: timestamp
 *
 *   conversations/{convoId}/messages/{msgId}
 *     senderId, senderName, senderAvatar
 *     text, type ("text"|"image")
 *     status: "sent"|"delivered"|"read"
 *     isDeleted: false
 *     createdAt: timestamp
 *
 * Updated: Phase 6 - March 2026
 */

let db;
let doc, addDoc, getDoc, getDocs, updateDoc, setDoc,
    collection, query, where, orderBy, limit,
    onSnapshot, serverTimestamp, increment, arrayContains;

class MessagingService {
    constructor() {
        this.firebaseInitialized = false;
        this._activeListeners   = new Map(); // conversationId → unsubscribe fn
        this._convoListeners    = new Map(); // "conversations" → unsubscribe fn
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
                console.warn('⏳ MessagingService: Firebase not ready, retrying...');
                setTimeout(() => this.initializeFirebase(), 1000);
                return;
            }

            db = firestoreModule.getFirestore(apps[0]);

            doc             = firestoreModule.doc;
            addDoc          = firestoreModule.addDoc;
            getDoc          = firestoreModule.getDoc;
            getDocs         = firestoreModule.getDocs;
            updateDoc       = firestoreModule.updateDoc;
            setDoc          = firestoreModule.setDoc;
            collection      = firestoreModule.collection;
            query           = firestoreModule.query;
            where           = firestoreModule.where;
            orderBy         = firestoreModule.orderBy;
            limit           = firestoreModule.limit;
            onSnapshot      = firestoreModule.onSnapshot;
            serverTimestamp = firestoreModule.serverTimestamp;
            increment       = firestoreModule.increment;

            this.firebaseInitialized = true;
            console.log('✅ MessagingService: Firebase ready');
        } catch (error) {
            console.error('❌ MessagingService: Firebase init failed', error);
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

    /** Deterministic conversation ID — same pair always produces same ID */
    _conversationId(uid1, uid2) {
        return [uid1, uid2].sort().join('_');
    }

    // ─────────────────────────────────────────────
    //  TASK 6.1 — GET OR CREATE CONVERSATION
    // ─────────────────────────────────────────────

    /**
     * Returns an existing conversation between current user and `otherUserId`,
     * or creates a new one if none exists.
     *
     * @param {string} otherUserId
     * @returns {{ success, conversationId, isNew }}
     */
    async getOrCreateConversation(otherUserId) {
        try {
            await this.waitForFirebase();
            const me   = this._me();
            const convoId = this._conversationId(me.userId, otherUserId);
            const convoRef = doc(db, 'conversations', convoId);
            const snap     = await getDoc(convoRef);

            if (snap.exists()) {
                return { success: true, conversationId: convoId, isNew: false };
            }

            // Fetch the other user's profile for display name / avatar
            const otherSnap = await getDoc(doc(db, 'users', otherUserId));
            const other     = otherSnap.exists() ? otherSnap.data() : {};

            await setDoc(convoRef, {
                participants: [me.userId, otherUserId],
                participantInfo: {
                    [me.userId]: {
                        name:   me.displayName   || me.username || 'User',
                        avatar: me.profilePicture || '',
                        username: me.username    || ''
                    },
                    [otherUserId]: {
                        name:   other.displayName   || other.username || 'User',
                        avatar: other.profilePicture || '',
                        username: other.username    || ''
                    }
                },
                lastMessage:   null,
                lastMessageAt: serverTimestamp(),
                unreadCounts: {
                    [me.userId]:    0,
                    [otherUserId]:  0
                },
                createdAt: serverTimestamp()
            });

            console.log('✅ Conversation created:', convoId);
            return { success: true, conversationId: convoId, isNew: true };
        } catch (error) {
            console.error('❌ getOrCreateConversation error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 6.2 — SEND A MESSAGE
    // ─────────────────────────────────────────────

    /**
     * Send a text message in a conversation.
     *
     * @param {string} conversationId
     * @param {string} text           Message body
     * @param {string} [type="text"]  "text" | "image"
     */
    async sendMessage(conversationId, text, type = 'text') {
        try {
            await this.waitForFirebase();
            const me = this._me();

            if (!text || !text.trim()) {
                return { success: false, error: 'Message cannot be empty' };
            }

            const trimmedText = text.trim();

            // 1. Save the message to the sub-collection
            const msgRef = await addDoc(
                collection(db, 'conversations', conversationId, 'messages'),
                {
                    senderId:     me.userId,
                    senderName:   me.displayName   || me.username || 'User',
                    senderAvatar: me.profilePicture || '',
                    text:         trimmedText,
                    type:         type,
                    status:       'sent',
                    isDeleted:    false,
                    createdAt:    serverTimestamp()
                }
            );

            // 2. Update the conversation's lastMessage + bump unread for the OTHER user
            const convoRef = doc(db, 'conversations', conversationId);
            const convoSnap = await getDoc(convoRef);

            if (convoSnap.exists()) {
                const data = convoSnap.data();
                const otherUserId = data.participants.find(p => p !== me.userId);

                await updateDoc(convoRef, {
                    lastMessage: {
                        text:      trimmedText,
                        senderId:  me.userId,
                        createdAt: new Date().toISOString()
                    },
                    lastMessageAt: serverTimestamp(),
                    [`unreadCounts.${otherUserId}`]: increment(1)
                });
            }

            window.dispatchEvent(new CustomEvent('message:sent', {
                detail: { conversationId, messageId: msgRef.id, text: trimmedText }
            }));

            return { success: true, messageId: msgRef.id };
        } catch (error) {
            console.error('❌ sendMessage error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 6.3 — REAL-TIME MESSAGE LISTENER
    // ─────────────────────────────────────────────

    /**
     * Subscribe to live messages in a conversation.
     * The callback fires immediately with existing messages,
     * then again every time a new message arrives or one is updated.
     *
     * @param {string}   conversationId
     * @param {Function} callback  Called with (messages[])
     * @returns {Function} Unsubscribe function — call it to stop listening
     *
     * Usage:
     *   const unsubscribe = messagingService.listenToMessages(convoId, msgs => {
     *     renderMessages(msgs);
     *   });
     *   // Later: unsubscribe();
     */
    listenToMessages(conversationId, callback) {
        if (!this.firebaseInitialized) {
            console.warn('⏳ MessagingService not ready — retrying listener in 1s');
            setTimeout(() => this.listenToMessages(conversationId, callback), 1000);
            return () => {};
        }

        // Cancel any existing listener on this conversation
        this.stopListeningToMessages(conversationId);

        const q = query(
            collection(db, 'conversations', conversationId, 'messages'),
            where('isDeleted', '==', false),
            orderBy('createdAt', 'asc'),
            limit(100)
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const messages = snap.docs.map(d => ({
                messageId: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            }));
            callback(messages);
        }, (error) => {
            console.error('❌ Message listener error:', error);
        });

        this._activeListeners.set(conversationId, unsubscribe);
        return unsubscribe;
    }

    /** Stop listening to a specific conversation */
    stopListeningToMessages(conversationId) {
        const unsub = this._activeListeners.get(conversationId);
        if (unsub) {
            unsub();
            this._activeListeners.delete(conversationId);
        }
    }

    /** Stop ALL active message listeners (call on logout or page close) */
    stopAllListeners() {
        this._activeListeners.forEach(unsub => unsub());
        this._activeListeners.clear();
        this._convoListeners.forEach(unsub => unsub());
        this._convoListeners.clear();
    }

    // ─────────────────────────────────────────────
    //  TASK 6.4 — LIST CONVERSATIONS (real-time)
    // ─────────────────────────────────────────────

    /**
     * Subscribe to the current user's conversations list.
     * The callback fires immediately then on every change.
     *
     * @param {Function} callback  Called with (conversations[])
     * @returns {Function} Unsubscribe function
     *
     * Usage:
     *   const unsub = messagingService.listenToConversations(convos => {
     *     renderConversationList(convos);
     *   });
     */
    listenToConversations(callback) {
        if (!this.firebaseInitialized) {
            setTimeout(() => this.listenToConversations(callback), 1000);
            return () => {};
        }

        const me = this._me();

        // Cancel any previous listener
        const prev = this._convoListeners.get('conversations');
        if (prev) prev();

        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', me.userId),
            orderBy('lastMessageAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const conversations = snap.docs.map(d => {
                const data = d.data();
                const otherUserId = data.participants.find(p => p !== me.userId);
                return {
                    conversationId:  d.id,
                    otherUserId:     otherUserId,
                    otherUser:       data.participantInfo?.[otherUserId] || {},
                    lastMessage:     data.lastMessage || null,
                    lastMessageAt:   data.lastMessageAt?.toDate?.()?.toISOString() || null,
                    unreadCount:     data.unreadCounts?.[me.userId] || 0
                };
            });
            callback(conversations);
        }, (error) => {
            console.error('❌ Conversations listener error:', error);
        });

        this._convoListeners.set('conversations', unsubscribe);
        return unsubscribe;
    }

    /**
     * One-time fetch of all conversations (no real-time updates).
     * Use `listenToConversations` for live data; use this for initial load.
     */
    async getConversations() {
        try {
            await this.waitForFirebase();
            const me = this._me();

            const snap = await getDocs(
                query(
                    collection(db, 'conversations'),
                    where('participants', 'array-contains', me.userId),
                    orderBy('lastMessageAt', 'desc')
                )
            );

            const conversations = snap.docs.map(d => {
                const data = d.data();
                const otherUserId = data.participants.find(p => p !== me.userId);
                return {
                    conversationId:  d.id,
                    otherUserId:     otherUserId,
                    otherUser:       data.participantInfo?.[otherUserId] || {},
                    lastMessage:     data.lastMessage || null,
                    lastMessageAt:   data.lastMessageAt?.toDate?.()?.toISOString() || null,
                    unreadCount:     data.unreadCounts?.[me.userId] || 0
                };
            });

            return { success: true, data: conversations };
        } catch (error) {
            console.error('❌ getConversations error:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 6.5 — MARK AS READ
    // ─────────────────────────────────────────────

    /**
     * Mark all messages in a conversation as read for the current user.
     * Resets the unread badge count to 0.
     *
     * @param {string} conversationId
     */
    async markConversationAsRead(conversationId) {
        try {
            await this.waitForFirebase();
            const me = this._me();

            // Reset unread count for this user
            await updateDoc(doc(db, 'conversations', conversationId), {
                [`unreadCounts.${me.userId}`]: 0
            });

            // Mark all unread messages as "read"
            const msgSnap = await getDocs(
                query(
                    collection(db, 'conversations', conversationId, 'messages'),
                    where('status', '!=', 'read'),
                    where('senderId', '!=', me.userId)
                )
            );

            const updates = msgSnap.docs.map(d =>
                updateDoc(doc(db, 'conversations', conversationId, 'messages', d.id), {
                    status: 'read'
                })
            );
            await Promise.all(updates);

            return { success: true };
        } catch (error) {
            console.error('❌ markConversationAsRead error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 6.6 — DELETE A MESSAGE (soft delete)
    // ─────────────────────────────────────────────

    /**
     * "Delete" a message — sets isDeleted:true so it hides from the chat.
     * Only the sender can delete their own messages.
     *
     * @param {string} conversationId
     * @param {string} messageId
     */
    async deleteMessage(conversationId, messageId) {
        try {
            await this.waitForFirebase();
            const me = this._me();

            const msgRef  = doc(db, 'conversations', conversationId, 'messages', messageId);
            const msgSnap = await getDoc(msgRef);

            if (!msgSnap.exists()) {
                return { success: false, error: 'Message not found' };
            }

            if (msgSnap.data().senderId !== me.userId) {
                return { success: false, error: 'You can only delete your own messages' };
            }

            await updateDoc(msgRef, {
                isDeleted: true,
                text:      'This message was deleted',
                deletedAt: serverTimestamp()
            });

            window.dispatchEvent(new CustomEvent('message:deleted', {
                detail: { conversationId, messageId }
            }));

            return { success: true };
        } catch (error) {
            console.error('❌ deleteMessage error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 6.7 — TOTAL UNREAD COUNT (nav badge)
    // ─────────────────────────────────────────────

    /**
     * Get the total number of unread messages across ALL conversations.
     * Use this to show a badge on the Messages icon in the nav bar.
     *
     * @returns {{ success, totalUnread }}
     */
    async getTotalUnreadCount() {
        try {
            await this.waitForFirebase();
            const me = this._me();

            const snap = await getDocs(
                query(
                    collection(db, 'conversations'),
                    where('participants', 'array-contains', me.userId)
                )
            );

            let total = 0;
            snap.docs.forEach(d => {
                total += d.data().unreadCounts?.[me.userId] || 0;
            });

            return { success: true, totalUnread: total };
        } catch (error) {
            console.error('❌ getTotalUnreadCount error:', error);
            return { success: false, totalUnread: 0 };
        }
    }

    /**
     * Subscribe to total unread count in real-time (for the nav badge).
     * The callback fires with the count every time any conversation changes.
     *
     * @param {Function} callback  Called with (count: number)
     * @returns {Function} Unsubscribe function
     *
     * Usage:
     *   messagingService.listenToUnreadCount(count => {
     *       document.querySelector('.messages-badge').textContent = count || '';
     *   });
     */
    listenToUnreadCount(callback) {
        if (!this.firebaseInitialized) {
            setTimeout(() => this.listenToUnreadCount(callback), 1000);
            return () => {};
        }

        const me = this._me();

        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', me.userId)
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            let total = 0;
            snap.docs.forEach(d => {
                total += d.data().unreadCounts?.[me.userId] || 0;
            });
            callback(total);
        });

        return unsubscribe;
    }

    // ─────────────────────────────────────────────
    //  HELPER — FETCH SINGLE CONVERSATION INFO
    // ─────────────────────────────────────────────

    async getConversation(conversationId) {
        try {
            await this.waitForFirebase();
            const me = this._me();

            const snap = await getDoc(doc(db, 'conversations', conversationId));
            if (!snap.exists()) return { success: false, error: 'Conversation not found' };

            const data = snap.data();
            const otherUserId = data.participants.find(p => p !== me.userId);

            return {
                success: true,
                data: {
                    conversationId:  snap.id,
                    otherUserId:     otherUserId,
                    otherUser:       data.participantInfo?.[otherUserId] || {},
                    lastMessage:     data.lastMessage || null,
                    unreadCount:     data.unreadCounts?.[me.userId] || 0
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  HELPER — GET MESSAGES (one-time fetch)
    // ─────────────────────────────────────────────

    /**
     * One-time fetch of the last N messages in a conversation.
     * For a live view, use `listenToMessages()` instead.
     */
    async getMessages(conversationId, messageLimit = 50) {
        try {
            await this.waitForFirebase();

            const snap = await getDocs(
                query(
                    collection(db, 'conversations', conversationId, 'messages'),
                    where('isDeleted', '==', false),
                    orderBy('createdAt', 'asc'),
                    limit(messageLimit)
                )
            );

            const messages = snap.docs.map(d => ({
                messageId: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            }));

            return { success: true, data: messages };
        } catch (error) {
            console.error('❌ getMessages error:', error);
            return { success: false, error: error.message, data: [] };
        }
    }
}

// ── Singleton ─────────────────────────────────
const messagingService = new MessagingService();
window.messagingService = messagingService;

// Clean up listeners on page unload
window.addEventListener('beforeunload', () => {
    messagingService.stopAllListeners();
});

// export default messagingService;
