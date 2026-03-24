/**
 * LynkApp Friends API Service - Phase 5
 * Real Firebase/Firestore Social Features Integration
 *
 * Phase 5 Features:
 *   5.1 Send friend request
 *   5.2 Accept friend request
 *   5.3 Decline friend request
 *   5.4 Cancel sent friend request
 *   5.5 View friends list
 *   5.6 Unfriend
 *   5.7 View pending requests (incoming & outgoing)
 *   5.8 Friend counts auto-update on profiles
 *
 * Firestore structure:
 *   friendRequests/{requestId}       ← one doc per request
 *   friendships/{uid1_uid2}          ← deterministic ID, one per pair
 *
 * Updated: Phase 5 - March 2026
 */

let db;
let doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, setDoc,
    collection, query, where, orderBy, limit,
    serverTimestamp, increment;

class FriendsAPIService {
    constructor() {
        this.firebaseInitialized = false;
        this.initializeFirebase();
    }

    // ─────────────────────────────────────────────
    //  FIREBASE INIT
    // ─────────────────────────────────────────────

    async initializeFirebase() {
        try {
            const {
                getFirestore,
                doc: docRef,
                addDoc: addDocument,
                getDoc: getDocument,
                getDocs: getDocuments,
                updateDoc: updateDocument,
                deleteDoc: deleteDocument,
                setDoc: setDocument,
                collection: collectionRef,
                query: queryFn,
                where: whereFn,
                orderBy: orderByFn,
                limit: limitFn,
                serverTimestamp: timestamp,
                increment: incrementFn
            } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

            const { getApps } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
            const apps = getApps();

            if (apps.length === 0) {
                console.warn('⏳ FriendsAPIService: Firebase not ready, retrying...');
                setTimeout(() => this.initializeFirebase(), 1000);
                return;
            }

            db = getFirestore(apps[0]);

            doc             = docRef;
            addDoc          = addDocument;
            getDoc          = getDocument;
            getDocs         = getDocuments;
            updateDoc       = updateDocument;
            deleteDoc       = deleteDocument;
            setDoc          = setDocument;
            collection      = collectionRef;
            query           = queryFn;
            where           = whereFn;
            orderBy         = orderByFn;
            limit           = limitFn;
            serverTimestamp = timestamp;
            increment       = incrementFn;

            this.firebaseInitialized = true;
            console.log('✅ FriendsAPIService: Firebase ready');
        } catch (error) {
            console.error('❌ FriendsAPIService: Firebase init failed', error);
        }
    }

    async waitForFirebase() {
        let attempts = 0;
        while (!this.firebaseInitialized && attempts < 20) {
            await new Promise(r => setTimeout(r, 500));
            attempts++;
        }
        if (!this.firebaseInitialized) {
            throw new Error('Firebase not available. Please refresh the page.');
        }
    }

    // ─────────────────────────────────────────────
    //  HELPERS
    // ─────────────────────────────────────────────

    /** Current logged-in user (throws if not signed in) */
    _me() {
        const u = window.authService?.getCurrentUser();
        if (!u) throw new Error('You must be logged in');
        return u;
    }

    /**
     * Deterministic friendship document ID.
     * Always sorts the two UIDs so the same pair always produces the same ID.
     */
    _friendshipId(uid1, uid2) {
        return [uid1, uid2].sort().join('_');
    }

    // ─────────────────────────────────────────────
    //  TASK 5.1 — SEND FRIEND REQUEST
    // ─────────────────────────────────────────────

    /**
     * Send a friend request to another user.
     * Guards against:
     *   - sending to yourself
     *   - duplicate pending requests
     *   - already friends
     */
    async sendFriendRequest(toUserId) {
        try {
            await this.waitForFirebase();
            const me = this._me();

            if (toUserId === me.userId) {
                return { success: false, error: 'You cannot send a friend request to yourself' };
            }

            // Check not already friends
            const alreadyFriends = await this.areFriends(me.userId, toUserId);
            if (alreadyFriends) {
                return { success: false, error: 'You are already friends with this user' };
            }

            // Check no pending request already exists in either direction
            const existing = await this._findPendingRequest(me.userId, toUserId);
            if (existing) {
                return { success: false, error: 'A friend request already exists between you two' };
            }

            // Create the request
            const requestData = {
                fromUserId:   me.userId,
                fromName:     me.displayName  || me.username || 'User',
                fromUsername: me.username     || '',
                fromAvatar:   me.profilePicture || '',
                toUserId:     toUserId,
                status:       'pending',
                createdAt:    serverTimestamp(),
                updatedAt:    serverTimestamp()
            };

            const docRef_ = await addDoc(collection(db, 'friendRequests'), requestData);

            // Notify
            window.dispatchEvent(new CustomEvent('friend:requestSent', {
                detail: { requestId: docRef_.id, toUserId }
            }));

            console.log('✅ Friend request sent:', docRef_.id);
            return { success: true, requestId: docRef_.id, message: 'Friend request sent!' };
        } catch (error) {
            console.error('❌ sendFriendRequest error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 5.2 — ACCEPT FRIEND REQUEST
    // ─────────────────────────────────────────────

    /**
     * Accept an incoming friend request.
     * Creates a bidirectional friendship document and updates both users' stats.
     */
    async acceptFriendRequest(requestId) {
        try {
            await this.waitForFirebase();
            const me = this._me();

            const reqRef  = doc(db, 'friendRequests', requestId);
            const reqSnap = await getDoc(reqRef);

            if (!reqSnap.exists()) return { success: false, error: 'Friend request not found' };

            const request = reqSnap.data();

            if (request.toUserId !== me.userId) {
                return { success: false, error: 'This request was not sent to you' };
            }
            if (request.status !== 'pending') {
                return { success: false, error: `Request already ${request.status}` };
            }

            // 1. Mark the request as accepted
            await updateDoc(reqRef, {
                status:    'accepted',
                updatedAt: serverTimestamp()
            });

            // 2. Create the friendship (bidirectional — one doc with sorted ID)
            const friendshipId = this._friendshipId(me.userId, request.fromUserId);
            await setDoc(doc(db, 'friendships', friendshipId), {
                users:     [me.userId, request.fromUserId],
                userId1:   me.userId,
                userId2:   request.fromUserId,
                createdAt: serverTimestamp(),
                status:    'active'
            });

            // 3. Increment friendsCount for BOTH users
            await this._incrementFriendsCount(me.userId,          1);
            await this._incrementFriendsCount(request.fromUserId, 1);

            window.dispatchEvent(new CustomEvent('friend:requestAccepted', {
                detail: { requestId, friendId: request.fromUserId }
            }));

            console.log('✅ Friend request accepted:', requestId);
            return { success: true, message: 'Friend request accepted! You are now friends 🎉' };
        } catch (error) {
            console.error('❌ acceptFriendRequest error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 5.3 — DECLINE FRIEND REQUEST
    // ─────────────────────────────────────────────

    async declineFriendRequest(requestId) {
        try {
            await this.waitForFirebase();
            const me = this._me();

            const reqRef  = doc(db, 'friendRequests', requestId);
            const reqSnap = await getDoc(reqRef);

            if (!reqSnap.exists()) return { success: false, error: 'Friend request not found' };

            const request = reqSnap.data();

            if (request.toUserId !== me.userId) {
                return { success: false, error: 'This request was not sent to you' };
            }

            await updateDoc(reqRef, {
                status:    'declined',
                updatedAt: serverTimestamp()
            });

            window.dispatchEvent(new CustomEvent('friend:requestDeclined', {
                detail: { requestId }
            }));

            return { success: true, message: 'Friend request declined' };
        } catch (error) {
            console.error('❌ declineFriendRequest error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 5.4 — CANCEL SENT REQUEST
    // ─────────────────────────────────────────────

    /**
     * Cancel a friend request YOU sent (before it is accepted/declined).
     */
    async cancelFriendRequest(requestId) {
        try {
            await this.waitForFirebase();
            const me = this._me();

            const reqRef  = doc(db, 'friendRequests', requestId);
            const reqSnap = await getDoc(reqRef);

            if (!reqSnap.exists()) return { success: false, error: 'Request not found' };

            const request = reqSnap.data();

            if (request.fromUserId !== me.userId) {
                return { success: false, error: 'You can only cancel requests you sent' };
            }
            if (request.status !== 'pending') {
                return { success: false, error: 'Request has already been responded to' };
            }

            await deleteDoc(reqRef);

            window.dispatchEvent(new CustomEvent('friend:requestCancelled', {
                detail: { requestId }
            }));

            return { success: true, message: 'Friend request cancelled' };
        } catch (error) {
            console.error('❌ cancelFriendRequest error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 5.5 — VIEW FRIENDS LIST
    // ─────────────────────────────────────────────

    /**
     * Get the full list of friends for a user.
     * Defaults to the currently logged-in user.
     */
    async getFriends(userId) {
        try {
            await this.waitForFirebase();

            if (!userId) {
                const me = this._me();
                userId = me.userId;
            }

            // Friendships where userId appears in the `users` array
            const snap = await getDocs(
                query(
                    collection(db, 'friendships'),
                    where('users', 'array-contains', userId)
                )
            );

            if (snap.empty) return { success: true, data: [], count: 0 };

            // Collect the "other" user's ID from each friendship
            const friendIds = snap.docs.map(d => {
                const data = d.data();
                return data.users.find(uid => uid !== userId);
            }).filter(Boolean);

            // Fetch each friend's profile
            const profiles = await Promise.all(
                friendIds.map(fid => this._fetchUserProfile(fid))
            );

            return {
                success: true,
                data:    profiles.filter(Boolean),
                count:   profiles.length
            };
        } catch (error) {
            console.error('❌ getFriends error:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 5.6 — UNFRIEND
    // ─────────────────────────────────────────────

    async unfriend(friendId) {
        try {
            await this.waitForFirebase();
            const me = this._me();

            const friendshipId  = this._friendshipId(me.userId, friendId);
            const friendshipRef = doc(db, 'friendships', friendshipId);
            const friendshipSnap = await getDoc(friendshipRef);

            if (!friendshipSnap.exists()) {
                return { success: false, error: 'You are not friends with this user' };
            }

            await deleteDoc(friendshipRef);

            // Decrement counts for both users
            await this._incrementFriendsCount(me.userId, -1);
            await this._incrementFriendsCount(friendId,  -1);

            window.dispatchEvent(new CustomEvent('friend:unfriended', {
                detail: { friendId }
            }));

            return { success: true, message: 'You have unfriended this user' };
        } catch (error) {
            console.error('❌ unfriend error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 5.7 — VIEW PENDING REQUESTS
    // ─────────────────────────────────────────────

    /**
     * Get all INCOMING pending friend requests for the current user.
     */
    async getIncomingRequests() {
        try {
            await this.waitForFirebase();
            const me = this._me();

            const snap = await getDocs(
                query(
                    collection(db, 'friendRequests'),
                    where('toUserId', '==', me.userId),
                    where('status',   '==', 'pending'),
                    orderBy('createdAt', 'desc')
                )
            );

            const requests = await Promise.all(
                snap.docs.map(async d => {
                    const data    = d.data();
                    const profile = await this._fetchUserProfile(data.fromUserId);
                    return {
                        requestId:  d.id,
                        ...data,
                        senderProfile: profile
                    };
                })
            );

            return { success: true, data: requests, count: requests.length };
        } catch (error) {
            console.error('❌ getIncomingRequests error:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    /**
     * Get all OUTGOING (sent) pending friend requests.
     */
    async getOutgoingRequests() {
        try {
            await this.waitForFirebase();
            const me = this._me();

            const snap = await getDocs(
                query(
                    collection(db, 'friendRequests'),
                    where('fromUserId', '==', me.userId),
                    where('status',     '==', 'pending'),
                    orderBy('createdAt', 'desc')
                )
            );

            const requests = await Promise.all(
                snap.docs.map(async d => {
                    const data    = d.data();
                    const profile = await this._fetchUserProfile(data.toUserId);
                    return {
                        requestId:       d.id,
                        ...data,
                        recipientProfile: profile
                    };
                })
            );

            return { success: true, data: requests, count: requests.length };
        } catch (error) {
            console.error('❌ getOutgoingRequests error:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // ─────────────────────────────────────────────
    //  RELATIONSHIP STATUS CHECK
    // ─────────────────────────────────────────────

    /**
     * Returns the relationship status between the current user and another user.
     * Possible values: 'friends' | 'pending_sent' | 'pending_received' | 'none'
     */
    async getRelationshipStatus(otherUserId) {
        try {
            await this.waitForFirebase();
            const me = this._me();

            if (otherUserId === me.userId) return { status: 'self' };

            // Check if already friends
            const friendshipId = this._friendshipId(me.userId, otherUserId);
            const fSnap = await getDoc(doc(db, 'friendships', friendshipId));
            if (fSnap.exists()) return { status: 'friends' };

            // Check for pending request sent by ME
            const sentReq = await this._findPendingRequestFromTo(me.userId, otherUserId);
            if (sentReq) return { status: 'pending_sent', requestId: sentReq.id };

            // Check for pending request sent TO ME
            const receivedReq = await this._findPendingRequestFromTo(otherUserId, me.userId);
            if (receivedReq) return { status: 'pending_received', requestId: receivedReq.id };

            return { status: 'none' };
        } catch (error) {
            console.error('❌ getRelationshipStatus error:', error);
            return { status: 'none' };
        }
    }

    /**
     * Check if two users are friends.
     */
    async areFriends(userId1, userId2) {
        try {
            await this.waitForFirebase();
            const friendshipId = this._friendshipId(userId1, userId2);
            const snap = await getDoc(doc(db, 'friendships', friendshipId));
            return snap.exists();
        } catch (_) {
            return false;
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 5.8 — FRIEND COUNT UPDATES
    // ─────────────────────────────────────────────

    /**
     * Increment (or decrement) a user's friendsCount in their profile document.
     * Called automatically on accept and unfriend.
     */
    async _incrementFriendsCount(userId, delta) {
        try {
            await updateDoc(doc(db, 'users', userId), {
                'stats.friendsCount': increment(delta)
            });
        } catch (error) {
            // Non-critical — profile stats will be recalculated by Phase 3 service
            console.warn('⚠️  Could not update friendsCount for', userId, error.message);
        }
    }

    // ─────────────────────────────────────────────
    //  MUTUAL FRIENDS
    // ─────────────────────────────────────────────

    /**
     * Get the list of mutual friends between the current user and another user.
     */
    async getMutualFriends(otherUserId) {
        try {
            await this.waitForFirebase();
            const me = this._me();

            const [myFriendsResult, theirFriendsResult] = await Promise.all([
                this.getFriends(me.userId),
                this.getFriends(otherUserId)
            ]);

            const myIds    = new Set(myFriendsResult.data.map(f => f.userId));
            const mutual   = theirFriendsResult.data.filter(f => myIds.has(f.userId));

            return { success: true, data: mutual, count: mutual.length };
        } catch (error) {
            console.error('❌ getMutualFriends error:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // ─────────────────────────────────────────────
    //  FRIEND SUGGESTIONS (basic — people you may know)
    // ─────────────────────────────────────────────

    /**
     * Returns up to `limit` user profiles who are:
     *   - NOT already friends with you
     *   - NOT yourself
     * (Simple implementation — Phase 6+ can add ML ranking)
     */
    async getFriendSuggestions(limit_ = 10) {
        try {
            await this.waitForFirebase();
            const me = this._me();

            // Get current friends IDs
            const myFriendsResult = await this.getFriends(me.userId);
            const friendIds = new Set(myFriendsResult.data.map(f => f.userId));
            friendIds.add(me.userId); // exclude self

            // Query recent users (newest accounts first)
            const snap = await getDocs(
                query(
                    collection(db, 'users'),
                    orderBy('createdAt', 'desc'),
                    limit(limit_ + friendIds.size + 5) // over-fetch to account for filtering
                )
            );

            const suggestions = snap.docs
                .map(d => ({ userId: d.id, ...d.data() }))
                .filter(u => !friendIds.has(u.userId))
                .slice(0, limit_);

            return { success: true, data: suggestions };
        } catch (error) {
            console.error('❌ getFriendSuggestions error:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // ─────────────────────────────────────────────
    //  PRIVATE HELPERS
    // ─────────────────────────────────────────────

    /**
     * Fetch a user's profile document from Firestore.
     * Returns null if not found.
     */
    async _fetchUserProfile(userId) {
        try {
            const snap = await getDoc(doc(db, 'users', userId));
            if (!snap.exists()) return null;
            return { userId: snap.id, ...snap.data() };
        } catch (_) {
            return null;
        }
    }

    /**
     * Find any pending request between two users in either direction.
     */
    async _findPendingRequest(uid1, uid2) {
        const a = await this._findPendingRequestFromTo(uid1, uid2);
        if (a) return a;
        return this._findPendingRequestFromTo(uid2, uid1);
    }

    /**
     * Find a pending request from `fromUid` to `toUid` specifically.
     */
    async _findPendingRequestFromTo(fromUid, toUid) {
        try {
            const snap = await getDocs(
                query(
                    collection(db, 'friendRequests'),
                    where('fromUserId', '==', fromUid),
                    where('toUserId',   '==', toUid),
                    where('status',     '==', 'pending'),
                    limit(1)
                )
            );
            return snap.empty ? null : snap.docs[0];
        } catch (_) {
            return null;
        }
    }

    // ─────────────────────────────────────────────
    //  LEGACY / BACKWARD COMPATIBILITY STUBS
    // ─────────────────────────────────────────────

    /** Old signature: sendFriendRequest(myUserId, targetUserId) */
    async sendRequest(myUserId, targetUserId) {
        return this.sendFriendRequest(targetUserId);
    }

    /** Old signature: acceptFriendRequest(myUserId, requestId) */
    async acceptRequest(myUserId, requestId) {
        return this.acceptFriendRequest(requestId);
    }

    /** Old signature: declineFriendRequest(myUserId, requestId) */
    async declineRequest(myUserId, requestId) {
        return this.declineFriendRequest(requestId);
    }

    /** getFriendRequests — returns incoming pending requests */
    async getFriendRequests() {
        return this.getIncomingRequests();
    }

    /** getSentRequests — returns outgoing pending requests */
    async getSentRequests() {
        return this.getOutgoingRequests();
    }

    // ── Stub functions that will be real in Phase 6 ──
    async blockUser(targetUserId)   { return { success: false, error: 'Block/unblock will be available in Phase 6' }; }
    async unblockUser(targetUserId) { return { success: false, error: 'Block/unblock will be available in Phase 6' }; }
    async getBlockedUsers()         { return { success: true, data: [] }; }

    clearCache() { /* no-op — Firestore is always fresh */ }
}

// ── Singleton ─────────────────────────────────
const friendsAPIService = new FriendsAPIService();
window.friendsAPIService = friendsAPIService;

export default friendsAPIService;
