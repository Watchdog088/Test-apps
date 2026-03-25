(function(){
﻿/**
 * LynkApp Feed API Service - Phase 4
 * Real Firebase/Firestore Feed & Posts Integration
 *
 * Phase 4 Features:
 *   4.1 Create text post to Firestore
 *   4.2 Display feed (all users, newest first)
 *   4.3 Like / unlike posts (real count updates)
 *   4.4 Add & fetch comments on posts
 *   4.5 Delete own posts
 *   4.6 Pagination — 20 posts per page with cursor
 *   4.7 Refresh feed (reload from top)
 *
 * Firestore structure:
 *   posts/{postId}                    ← main post document
 *   posts/{postId}/likes/{userId}     ← one doc per user who liked
 *   posts/{postId}/comments/{commentId} ← comment sub-collection
 *
 * Updated: Phase 4 - March 2026
 */

let db;
let doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
    collection, query, orderBy, limit, startAfter,
    where, serverTimestamp, increment, setDoc, getCountFromServer;

class FeedAPIService {
    constructor() {
        this.firebaseInitialized = false;
        this.lastVisiblePost    = null;   // cursor for pagination
        this.postsPerPage       = 20;
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
                collection: collectionRef,
                query: queryFn,
                orderBy: orderByFn,
                limit: limitFn,
                startAfter: startAfterFn,
                where: whereFn,
                serverTimestamp: timestamp,
                increment: incrementFn,
                setDoc: setDocument,
                getCountFromServer: countFn
            } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

            const { getApps } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
            const apps = getApps();

            if (apps.length === 0) {
                console.warn('⏳ FeedAPIService: Firebase app not ready, retrying in 1s...');
                setTimeout(() => this.initializeFirebase(), 1000);
                return;
            }

            db = getFirestore(apps[0]);

            doc              = docRef;
            addDoc           = addDocument;
            getDoc           = getDocument;
            getDocs          = getDocuments;
            updateDoc        = updateDocument;
            deleteDoc        = deleteDocument;
            collection       = collectionRef;
            query            = queryFn;
            orderBy          = orderByFn;
            limit            = limitFn;
            startAfter       = startAfterFn;
            where            = whereFn;
            serverTimestamp  = timestamp;
            increment        = incrementFn;
            setDoc           = setDocument;
            getCountFromServer = countFn;

            this.firebaseInitialized = true;
            console.log('✅ FeedAPIService: Firebase ready');
        } catch (error) {
            console.error('❌ FeedAPIService: Firebase init failed', error);
        }
    }

    /** Wait until Firebase is ready (max 10 s) */
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
    //  TASK 4.1 — CREATE POST
    // ─────────────────────────────────────────────

    /**
     * Create a new text post (with optional image URL for Phase 3/7 compat).
     *
     * @param {Object} postData
     *   { content, imageUrl?, privacy? }
     */
    async createPost(postData) {
        try {
            await this.waitForFirebase();

            const currentUser = window.authService?.getCurrentUser();
            if (!currentUser) throw new Error('You must be logged in to post');

            // Validate
            if (!postData.content || postData.content.trim().length === 0) {
                throw new Error('Post content cannot be empty');
            }
            if (postData.content.trim().length > 2000) {
                throw new Error('Post must be 2000 characters or less');
            }

            const post = {
                userId:        currentUser.userId,
                authorName:    currentUser.displayName  || currentUser.username || 'User',
                authorUsername: currentUser.username    || '',
                authorAvatar:  currentUser.profilePicture || '',
                content:       postData.content.trim(),
                imageUrl:      postData.imageUrl        || null,
                privacy:       postData.privacy         || 'public',
                likesCount:    0,
                commentsCount: 0,
                sharesCount:   0,
                hashtags:      this._extractHashtags(postData.content),
                mentions:      this._extractMentions(postData.content),
                createdAt:     serverTimestamp(),
                updatedAt:     serverTimestamp(),
                isEdited:      false
            };

            const postsRef  = collection(db, 'posts');
            const docRef_   = await addDoc(postsRef, post);

            console.log('✅ Post created:', docRef_.id);

            // Update the user's postsCount stat
            try {
                await updateDoc(doc(db, 'users', currentUser.userId), {
                    'stats.postsCount': increment(1)
                });
            } catch (_) { /* stat update is non-critical */ }

            // Emit browser event so UI can react
            window.dispatchEvent(new CustomEvent('post:created', {
                detail: { postId: docRef_.id, ...post }
            }));

            return {
                success: true,
                postId: docRef_.id,
                data: { postId: docRef_.id, ...post }
            };
        } catch (error) {
            console.error('❌ createPost error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 4.2 — FETCH FEED (newest first)
    // ─────────────────────────────────────────────

    /**
     * Load the first page of the feed.
     * Resets the pagination cursor — call this on initial load or refresh.
     */
    async getFeed(options = {}) {
        try {
            await this.waitForFirebase();

            this.lastVisiblePost = null;   // reset cursor

            const pageSize = options.limit || this.postsPerPage;

            const q = query(
                collection(db, 'posts'),
                orderBy('createdAt', 'desc'),
                limit(pageSize)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return { success: true, data: [], hasMore: false };
            }

            // Save cursor for pagination
            this.lastVisiblePost = snapshot.docs[snapshot.docs.length - 1];

            const posts = await Promise.all(
                snapshot.docs.map(d => this._hydratePost(d))
            );

            return {
                success: true,
                data: posts,
                hasMore: posts.length === pageSize
            };
        } catch (error) {
            console.error('❌ getFeed error:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 4.6 — PAGINATION (load more)
    // ─────────────────────────────────────────────

    /**
     * Load the NEXT page of posts using the cursor from the previous call.
     */
    async loadMorePosts(options = {}) {
        try {
            await this.waitForFirebase();

            if (!this.lastVisiblePost) {
                // Nothing to paginate from — return empty
                return { success: true, data: [], hasMore: false };
            }

            const pageSize = options.limit || this.postsPerPage;

            const q = query(
                collection(db, 'posts'),
                orderBy('createdAt', 'desc'),
                startAfter(this.lastVisiblePost),
                limit(pageSize)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return { success: true, data: [], hasMore: false };
            }

            this.lastVisiblePost = snapshot.docs[snapshot.docs.length - 1];

            const posts = await Promise.all(
                snapshot.docs.map(d => this._hydratePost(d))
            );

            return {
                success: true,
                data: posts,
                hasMore: posts.length === pageSize
            };
        } catch (error) {
            console.error('❌ loadMorePosts error:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 4.7 — REFRESH FEED
    // ─────────────────────────────────────────────

    /**
     * Reload the feed from the top (same as getFeed but explicit name).
     */
    async refreshFeed(options = {}) {
        return this.getFeed(options);
    }

    // ─────────────────────────────────────────────
    //  GET SINGLE POST
    // ─────────────────────────────────────────────

    async getPost(postId) {
        try {
            await this.waitForFirebase();

            const postSnap = await getDoc(doc(db, 'posts', postId));
            if (!postSnap.exists()) {
                return { success: false, error: 'Post not found' };
            }

            const post = await this._hydratePost(postSnap);
            return { success: true, data: post };
        } catch (error) {
            console.error('❌ getPost error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 4.3 — LIKE / UNLIKE
    // ─────────────────────────────────────────────

    /**
     * Toggle like on a post.
     * Stores one document per user in posts/{postId}/likes/{userId}.
     * Returns { success, isLiked, likesCount }
     */
    async toggleLike(postId) {
        try {
            await this.waitForFirebase();

            const currentUser = window.authService?.getCurrentUser();
            if (!currentUser) throw new Error('You must be logged in to like posts');

            const likeRef = doc(db, 'posts', postId, 'likes', currentUser.userId);
            const likeSnap = await getDoc(likeRef);

            const postRef = doc(db, 'posts', postId);

            if (likeSnap.exists()) {
                // ── Already liked → unlike ──────────────────
                await deleteDoc(likeRef);
                await updateDoc(postRef, { likesCount: increment(-1) });

                const postSnap = await getDoc(postRef);
                const likesCount = postSnap.data()?.likesCount ?? 0;

                window.dispatchEvent(new CustomEvent('post:unliked', {
                    detail: { postId, likesCount }
                }));

                return { success: true, isLiked: false, likesCount };
            } else {
                // ── Not liked yet → like ────────────────────
                await setDoc(likeRef, {
                    userId:    currentUser.userId,
                    likedAt:   serverTimestamp()
                });
                await updateDoc(postRef, { likesCount: increment(1) });

                const postSnap = await getDoc(postRef);
                const likesCount = postSnap.data()?.likesCount ?? 1;

                window.dispatchEvent(new CustomEvent('post:liked', {
                    detail: { postId, likesCount }
                }));

                return { success: true, isLiked: true, likesCount };
            }
        } catch (error) {
            console.error('❌ toggleLike error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check whether the current user has liked a specific post.
     */
    async hasLiked(postId) {
        try {
            await this.waitForFirebase();
            const currentUser = window.authService?.getCurrentUser();
            if (!currentUser) return false;

            const likeSnap = await getDoc(
                doc(db, 'posts', postId, 'likes', currentUser.userId)
            );
            return likeSnap.exists();
        } catch (_) {
            return false;
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 4.4 — COMMENTS
    // ─────────────────────────────────────────────

    /**
     * Add a comment to a post.
     * Stores it in posts/{postId}/comments/{commentId}.
     */
    async addComment(postId, text) {
        try {
            await this.waitForFirebase();

            const currentUser = window.authService?.getCurrentUser();
            if (!currentUser) throw new Error('You must be logged in to comment');

            if (!text || text.trim().length === 0) {
                throw new Error('Comment cannot be empty');
            }
            if (text.trim().length > 500) {
                throw new Error('Comment must be 500 characters or less');
            }

            const comment = {
                postId:          postId,
                userId:          currentUser.userId,
                authorName:      currentUser.displayName || currentUser.username || 'User',
                authorUsername:  currentUser.username   || '',
                authorAvatar:    currentUser.profilePicture || '',
                text:            text.trim(),
                likesCount:      0,
                createdAt:       serverTimestamp()
            };

            const commentsRef = collection(db, 'posts', postId, 'comments');
            const commentDoc  = await addDoc(commentsRef, comment);

            // Increment the post's commentsCount
            await updateDoc(doc(db, 'posts', postId), {
                commentsCount: increment(1)
            });

            window.dispatchEvent(new CustomEvent('post:commented', {
                detail: { postId, commentId: commentDoc.id, ...comment }
            }));

            return {
                success: true,
                commentId: commentDoc.id,
                data: { commentId: commentDoc.id, ...comment }
            };
        } catch (error) {
            console.error('❌ addComment error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Fetch all comments on a post, newest first.
     */
    async getComments(postId, options = {}) {
        try {
            await this.waitForFirebase();

            const q = query(
                collection(db, 'posts', postId, 'comments'),
                orderBy('createdAt', 'desc'),
                limit(options.limit || 50)
            );

            const snap = await getDocs(q);
            const comments = snap.docs.map(d => ({ commentId: d.id, ...d.data() }));

            return { success: true, data: comments };
        } catch (error) {
            console.error('❌ getComments error:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    /**
     * Delete a comment (only the comment author can do this).
     */
    async deleteComment(postId, commentId) {
        try {
            await this.waitForFirebase();

            const currentUser = window.authService?.getCurrentUser();
            if (!currentUser) throw new Error('Not logged in');

            const commentRef  = doc(db, 'posts', postId, 'comments', commentId);
            const commentSnap = await getDoc(commentRef);

            if (!commentSnap.exists()) {
                return { success: false, error: 'Comment not found' };
            }
            if (commentSnap.data().userId !== currentUser.userId) {
                return { success: false, error: 'You can only delete your own comments' };
            }

            await deleteDoc(commentRef);
            await updateDoc(doc(db, 'posts', postId), {
                commentsCount: increment(-1)
            });

            return { success: true };
        } catch (error) {
            console.error('❌ deleteComment error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 4.5 — DELETE OWN POST
    // ─────────────────────────────────────────────

    /**
     * Delete a post. Only the post author can delete it.
     */
    async deletePost(postId) {
        try {
            await this.waitForFirebase();

            const currentUser = window.authService?.getCurrentUser();
            if (!currentUser) throw new Error('Not logged in');

            const postRef  = doc(db, 'posts', postId);
            const postSnap = await getDoc(postRef);

            if (!postSnap.exists()) {
                return { success: false, error: 'Post not found' };
            }
            if (postSnap.data().userId !== currentUser.userId) {
                return { success: false, error: 'You can only delete your own posts' };
            }

            await deleteDoc(postRef);

            // Decrement user's postsCount
            try {
                await updateDoc(doc(db, 'users', currentUser.userId), {
                    'stats.postsCount': increment(-1)
                });
            } catch (_) { /* non-critical */ }

            window.dispatchEvent(new CustomEvent('post:deleted', {
                detail: { postId }
            }));

            return { success: true, message: 'Post deleted' };
        } catch (error) {
            console.error('❌ deletePost error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  GET A USER'S OWN POSTS (for profile page)
    // ─────────────────────────────────────────────

    async getUserPosts(userId, options = {}) {
        try {
            await this.waitForFirebase();

            if (!userId) {
                const u = window.authService?.getCurrentUser();
                if (!u) return { success: false, error: 'Not logged in', data: [] };
                userId = u.userId;
            }

            const pageSize = options.limit || this.postsPerPage;

            const q = query(
                collection(db, 'posts'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(pageSize)
            );

            const snap  = await getDocs(q);
            const posts = await Promise.all(snap.docs.map(d => this._hydratePost(d)));

            return {
                success: true,
                data: posts,
                hasMore: posts.length === pageSize
            };
        } catch (error) {
            console.error('❌ getUserPosts error:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // ─────────────────────────────────────────────
    //  EDIT POST
    // ─────────────────────────────────────────────

    /**
     * Edit the content of an existing post (author only).
     */
    async editPost(postId, newContent) {
        try {
            await this.waitForFirebase();

            const currentUser = window.authService?.getCurrentUser();
            if (!currentUser) throw new Error('Not logged in');

            if (!newContent || newContent.trim().length === 0) {
                throw new Error('Post content cannot be empty');
            }

            const postRef  = doc(db, 'posts', postId);
            const postSnap = await getDoc(postRef);

            if (!postSnap.exists()) return { success: false, error: 'Post not found' };
            if (postSnap.data().userId !== currentUser.userId) {
                return { success: false, error: 'You can only edit your own posts' };
            }

            await updateDoc(postRef, {
                content:   newContent.trim(),
                isEdited:  true,
                updatedAt: serverTimestamp(),
                hashtags:  this._extractHashtags(newContent),
                mentions:  this._extractMentions(newContent)
            });

            return { success: true, message: 'Post updated' };
        } catch (error) {
            console.error('❌ editPost error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  PRIVATE HELPERS
    // ─────────────────────────────────────────────

    /**
     * Convert a Firestore document snapshot into a plain post object.
     * Also attaches whether the current user has liked it.
     */
    async _hydratePost(docSnap) {
        const data   = docSnap.data();
        const postId = docSnap.id;

        // Check if current user liked this post
        let isLiked = false;
        try {
            const currentUser = window.authService?.getCurrentUser();
            if (currentUser) {
                const likeSnap = await getDoc(
                    doc(db, 'posts', postId, 'likes', currentUser.userId)
                );
                isLiked = likeSnap.exists();
            }
        } catch (_) { /* non-critical */ }

        return {
            postId,
            ...data,
            isLiked,
            // Convert Firestore timestamps to ISO strings for easy display
            createdAtDisplay: data.createdAt?.toDate
                ? this._timeAgo(data.createdAt.toDate())
                : 'Just now'
        };
    }

    /** Extract #hashtags from text */
    _extractHashtags(text) {
        if (!text) return [];
        return (text.match(/#(\w+)/g) || []).map(t => t.slice(1));
    }

    /** Extract @mentions from text */
    _extractMentions(text) {
        if (!text) return [];
        return (text.match(/@(\w+)/g) || []).map(m => m.slice(1));
    }

    /** Human-friendly relative time ("2 minutes ago") */
    _timeAgo(date) {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60)   return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    // ─────────────────────────────────────────────
    //  LEGACY / BACKWARD COMPATIBILITY STUBS
    //  (kept so existing UI code doesn't break)
    // ─────────────────────────────────────────────

    /** Alias used by old UI code */
    async getFeedPosts(page = 1, limit_ = 20) {
        if (page === 1) return this.getFeed({ limit: limit_ });
        return this.loadMorePosts({ limit: limit_ });
    }

    /** Old toggleLike signature accepted (postId, userId) */
    async likePost(postId)   { return this.toggleLike(postId); }
    async unlikePost(postId) { return this.toggleLike(postId); }
}

// ── Singleton ─────────────────────────────────
const feedAPIService = new FeedAPIService();
window.feedAPIService = feedAPIService;

// export default feedAPIService;

})();