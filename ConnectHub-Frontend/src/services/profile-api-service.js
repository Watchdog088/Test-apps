/**
 * LynkApp Profile API Service - Phase 3
 * Real Firebase/Firestore Profile Integration
 * 
 * Phase 3 Features:
 *   3.1 Fetch user profile from Firestore
 *   3.2 Profile editing form (username, bio, location, etc.)
 *   3.3 Save profile changes to Firestore
 *   3.4 View other users' profiles by ID or username
 *   3.5 Calculate real profile stats from database
 *   3.6 Profile validation (username length, uniqueness, etc.)
 * 
 * Updated: Phase 3 - March 2026
 */

// Firebase references (loaded dynamically, same pattern as auth-service.js)
let db;
let doc, getDoc, setDoc, updateDoc, getDocs, collection, 
    query, where, orderBy, limit, serverTimestamp, getCountFromServer;

class ProfileAPIService {
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
                getDoc: getDocument,
                setDoc: setDocument,
                updateDoc: updateDocument,
                getDocs: getDocuments,
                collection: collectionRef,
                query: queryFn,
                where: whereFn,
                orderBy: orderByFn,
                limit: limitFn,
                serverTimestamp: timestamp,
                getCountFromServer: countFn
            } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

            // Reuse the same Firebase app already initialised by auth-service.js
            const { getApps } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
            const apps = getApps();

            if (apps.length === 0) {
                // Auth service hasn't loaded yet — wait and retry
                console.warn('⏳ Firebase app not ready yet, retrying in 1s...');
                setTimeout(() => this.initializeFirebase(), 1000);
                return;
            }

            db = getFirestore(apps[0]);

            doc            = docRef;
            getDoc         = getDocument;
            setDoc         = setDocument;
            updateDoc      = updateDocument;
            getDocs        = getDocuments;
            collection     = collectionRef;
            query          = queryFn;
            where          = whereFn;
            orderBy        = orderByFn;
            limit          = limitFn;
            serverTimestamp = timestamp;
            getCountFromServer = countFn;

            this.firebaseInitialized = true;
            console.log('✅ ProfileAPIService: Firebase ready');
        } catch (error) {
            console.error('❌ ProfileAPIService: Firebase init failed', error);
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
    //  TASK 3.1 — FETCH PROFILE FROM FIRESTORE
    // ─────────────────────────────────────────────

    /**
     * Get any user's profile by their Firebase UID
     */
    async getProfile(userId) {
        try {
            await this.waitForFirebase();

            if (!userId) {
                // Default to logged-in user
                const currentUser = window.authService?.getCurrentUser();
                if (!currentUser) throw new Error('No user logged in');
                userId = currentUser.userId;
            }

            const userRef  = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                return { success: false, error: 'User not found' };
            }

            const data = userSnap.data();

            // Attach real stats
            const stats = await this.calculateStats(userId);

            return {
                success: true,
                data: {
                    ...data,
                    userId,
                    stats
                }
            };
        } catch (error) {
            console.error('❌ getProfile error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Shorthand — get the currently logged-in user's profile
     */
    async getMyProfile() {
        const currentUser = window.authService?.getCurrentUser();
        if (!currentUser) return { success: false, error: 'Not logged in' };
        return this.getProfile(currentUser.userId);
    }

    // ─────────────────────────────────────────────
    //  TASK 3.4 — VIEW OTHER USERS' PROFILES
    // ─────────────────────────────────────────────

    /**
     * Find a profile by username (case-insensitive exact match)
     */
    async getProfileByUsername(username) {
        try {
            await this.waitForFirebase();

            const usersRef  = collection(db, 'users');
            const q         = query(usersRef, where('username', '==', username.toLowerCase()), limit(1));
            const snapshot  = await getDocs(q);

            if (snapshot.empty) {
                return { success: false, error: `No user found with username: ${username}` };
            }

            const userDoc = snapshot.docs[0];
            const data    = userDoc.data();
            const uid     = userDoc.id;
            const stats   = await this.calculateStats(uid);

            return {
                success: true,
                data: { ...data, userId: uid, stats }
            };
        } catch (error) {
            console.error('❌ getProfileByUsername error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 3.2 & 3.3 — EDIT PROFILE & SAVE
    // ─────────────────────────────────────────────

    /**
     * Update the logged-in user's profile.
     * Validates input before writing to Firestore.
     * 
     * @param {Object} profileData  Fields to update:
     *   { displayName, username, bio, location, website, work, education }
     */
    async updateProfile(profileData) {
        try {
            await this.waitForFirebase();

            const currentUser = window.authService?.getCurrentUser();
            if (!currentUser) throw new Error('Not logged in');

            // ── Validation (Task 3.6) ──────────────────────
            const validation = await this.validateProfileData(profileData, currentUser.userId);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }

            // Build the cleaned update object
            const allowedFields = [
                'displayName', 'username', 'bio',
                'location', 'website', 'work', 'education', 'interests'
            ];

            const updatePayload = { updatedAt: serverTimestamp() };

            for (const field of allowedFields) {
                if (profileData[field] !== undefined) {
                    // Store username in lowercase so lookups are consistent
                    updatePayload[field] = field === 'username'
                        ? profileData[field].trim().toLowerCase()
                        : profileData[field];
                }
            }

            // Write to Firestore
            const userRef = doc(db, 'users', currentUser.userId);
            await updateDoc(userRef, updatePayload);

            // Keep auth-service in sync
            if (window.authService?.currentUser) {
                window.authService.currentUser = {
                    ...window.authService.currentUser,
                    ...updatePayload
                };
            }

            console.log('✅ Profile updated in Firestore');

            return {
                success: true,
                message: 'Profile updated successfully',
                data: updatePayload
            };
        } catch (error) {
            console.error('❌ updateProfile error:', error);
            return { success: false, error: error.message };
        }
    }

    /** Convenience wrappers */
    async updateBio(bio)             { return this.updateProfile({ bio }); }
    async updateLocation(location)   { return this.updateProfile({ location }); }
    async updateDisplayName(name)    { return this.updateProfile({ displayName: name }); }
    async updateUsername(username)   { return this.updateProfile({ username }); }

    // ─────────────────────────────────────────────
    //  TASK 3.5 — REAL STATS FROM DATABASE
    // ─────────────────────────────────────────────

    /**
     * Count posts, friends, followers and following for a user
     * by querying the actual Firestore collections.
     */
    async calculateStats(userId) {
        try {
            await this.waitForFirebase();

            // ── Posts count ───────────────────────────────
            let postsCount = 0;
            try {
                const postsSnap = await getCountFromServer(
                    query(collection(db, 'posts'), where('userId', '==', userId))
                );
                postsCount = postsSnap.data().count;
            } catch (_) {
                // getCountFromServer may not be available on all plans
                const fallback = await getDocs(
                    query(collection(db, 'posts'), where('userId', '==', userId))
                );
                postsCount = fallback.size;
            }

            // ── Friends count ─────────────────────────────
            let friendsCount = 0;
            try {
                const friendsSnap = await getDocs(
                    query(
                        collection(db, 'friendships'),
                        where('participants', 'array-contains', userId)
                    )
                );
                friendsCount = friendsSnap.size;
            } catch (_) { /* collection may not exist yet */ }

            // ── Followers count ───────────────────────────
            let followersCount = 0;
            try {
                const followersSnap = await getDocs(
                    query(collection(db, 'follows'), where('followingId', '==', userId))
                );
                followersCount = followersSnap.size;
            } catch (_) { /* collection may not exist yet */ }

            // ── Following count ───────────────────────────
            let followingCount = 0;
            try {
                const followingSnap = await getDocs(
                    query(collection(db, 'follows'), where('followerId', '==', userId))
                );
                followingCount = followingSnap.size;
            } catch (_) { /* collection may not exist yet */ }

            const stats = { postsCount, friendsCount, followersCount, followingCount };

            // Persist the fresh stats back to the user document
            try {
                await updateDoc(doc(db, 'users', userId), { stats, updatedAt: serverTimestamp() });
            } catch (_) { /* write may fail if not owner — that's fine */ }

            return stats;
        } catch (error) {
            console.error('❌ calculateStats error:', error);
            // Return zeros so the UI doesn't break
            return { postsCount: 0, friendsCount: 0, followersCount: 0, followingCount: 0 };
        }
    }

    // ─────────────────────────────────────────────
    //  TASK 3.6 — PROFILE VALIDATION
    // ─────────────────────────────────────────────

    /**
     * Validate profile fields before saving.
     * Returns { valid: true } or { valid: false, error: '...' }
     */
    async validateProfileData(data, currentUserId) {
        // Display name
        if (data.displayName !== undefined) {
            if (data.displayName.trim().length < 1) {
                return { valid: false, error: 'Display name cannot be empty' };
            }
            if (data.displayName.trim().length > 50) {
                return { valid: false, error: 'Display name must be 50 characters or less' };
            }
        }

        // Username
        if (data.username !== undefined) {
            const username = data.username.trim().toLowerCase();

            if (username.length < 3) {
                return { valid: false, error: 'Username must be at least 3 characters' };
            }
            if (username.length > 30) {
                return { valid: false, error: 'Username must be 30 characters or less' };
            }
            if (!/^[a-z0-9_.-]+$/.test(username)) {
                return { valid: false, error: 'Username can only contain letters, numbers, underscores, dashes and dots' };
            }

            // Uniqueness check — skip if username unchanged
            const currentUser = window.authService?.getCurrentUser();
            if (!currentUser || username !== currentUser.username) {
                const unique = await this.isUsernameAvailable(username, currentUserId);
                if (!unique) {
                    return { valid: false, error: 'That username is already taken' };
                }
            }
        }

        // Bio
        if (data.bio !== undefined && data.bio.length > 200) {
            return { valid: false, error: 'Bio must be 200 characters or less' };
        }

        // Website
        if (data.website !== undefined && data.website.trim() !== '') {
            const urlPattern = /^https?:\/\/.+/i;
            if (!urlPattern.test(data.website.trim())) {
                return { valid: false, error: 'Website must start with http:// or https://' };
            }
        }

        return { valid: true };
    }

    /**
     * Check whether a username is available (not taken by another user)
     */
    async isUsernameAvailable(username, excludeUserId = null) {
        try {
            await this.waitForFirebase();

            const q  = query(
                collection(db, 'users'),
                where('username', '==', username.toLowerCase()),
                limit(1)
            );
            const snap = await getDocs(q);

            if (snap.empty) return true;

            // Username exists — OK only if it belongs to the current user
            return excludeUserId && snap.docs[0].id === excludeUserId;
        } catch (error) {
            console.error('❌ isUsernameAvailable error:', error);
            return true; // Fail-open rather than blocking the user
        }
    }

    // ─────────────────────────────────────────────
    //  SEARCH PROFILES
    // ─────────────────────────────────────────────

    /**
     * Search users by display name or username.
     * Returns up to 20 results.
     */
    async searchProfiles(queryText, options = {}) {
        try {
            await this.waitForFirebase();

            if (!queryText || queryText.trim().length < 1) {
                return { success: true, data: [] };
            }

            const q = queryText.trim().toLowerCase();

            // Firestore doesn't support full-text search, so we use a
            // starts-with range trick on the username field.
            const snap = await getDocs(
                query(
                    collection(db, 'users'),
                    where('username', '>=', q),
                    where('username', '<=', q + '\uf8ff'),
                    limit(options.limit || 20)
                )
            );

            const results = snap.docs.map(d => ({ userId: d.id, ...d.data() }));

            return { success: true, data: results };
        } catch (error) {
            console.error('❌ searchProfiles error:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // ─────────────────────────────────────────────
    //  USER POSTS (read-only, for profile page)
    // ─────────────────────────────────────────────

    /**
     * Fetch a user's posts for display on their profile page.
     * Phase 4 will implement full post creation — this just reads.
     */
    async getUserPosts(userId, options = {}) {
        try {
            await this.waitForFirebase();

            if (!userId) {
                const u = window.authService?.getCurrentUser();
                if (!u) return { success: false, error: 'Not logged in', data: [] };
                userId = u.userId;
            }

            const pageSize = options.limit || 20;

            const q = query(
                collection(db, 'posts'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(pageSize)
            );

            const snap = await getDocs(q);
            const posts = snap.docs.map(d => ({ postId: d.id, ...d.data() }));

            return {
                success: true,
                data: posts,
                pagination: { hasMore: posts.length === pageSize }
            };
        } catch (error) {
            console.error('❌ getUserPosts error:', error);
            // Posts collection doesn't exist yet in Phase 3 — return empty gracefully
            return { success: true, data: [], pagination: { hasMore: false } };
        }
    }

    // ─────────────────────────────────────────────
    //  PROFILE PICTURE (placeholder — Phase 7)
    // ─────────────────────────────────────────────

    /**
     * Update profile picture URL in Firestore.
     * Actual file upload will be implemented in Phase 7.
     * For now we accept any URL (e.g. from ui-avatars.com or a direct link).
     */
    async updateProfilePictureUrl(url) {
        try {
            await this.waitForFirebase();

            const currentUser = window.authService?.getCurrentUser();
            if (!currentUser) throw new Error('Not logged in');

            await updateDoc(doc(db, 'users', currentUser.userId), {
                profilePicture: url,
                updatedAt: serverTimestamp()
            });

            if (window.authService?.currentUser) {
                window.authService.currentUser.profilePicture = url;
            }

            return { success: true, message: 'Profile picture updated' };
        } catch (error) {
            console.error('❌ updateProfilePictureUrl error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update cover photo URL in Firestore.
     */
    async updateCoverPhotoUrl(url) {
        try {
            await this.waitForFirebase();

            const currentUser = window.authService?.getCurrentUser();
            if (!currentUser) throw new Error('Not logged in');

            await updateDoc(doc(db, 'users', currentUser.userId), {
                coverPhoto: url,
                updatedAt: serverTimestamp()
            });

            if (window.authService?.currentUser) {
                window.authService.currentUser.coverPhoto = url;
            }

            return { success: true, message: 'Cover photo updated' };
        } catch (error) {
            console.error('❌ updateCoverPhotoUrl error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  PRIVACY SETTINGS
    // ─────────────────────────────────────────────

    async updatePrivacySettings(privacySettings) {
        try {
            await this.waitForFirebase();

            const currentUser = window.authService?.getCurrentUser();
            if (!currentUser) throw new Error('Not logged in');

            await updateDoc(doc(db, 'users', currentUser.userId), {
                'settings.privacy': privacySettings.privacy || 'public',
                updatedAt: serverTimestamp()
            });

            return { success: true, message: 'Privacy settings updated' };
        } catch (error) {
            console.error('❌ updatePrivacySettings error:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────
    //  LEGACY / BACKWARD COMPATIBILITY
    //  (kept so existing UI code doesn't break)
    // ─────────────────────────────────────────────

    async updateProfileField(field, value) {
        return this.updateProfile({ [field]: value });
    }

    async updateWork(work)           { return this.updateProfile({ work }); }
    async updateEducation(education) { return this.updateProfile({ education }); }

    async getProfileStats(userId) {
        const stats = await this.calculateStats(userId || window.authService?.getCurrentUser()?.userId);
        return { success: true, data: stats };
    }

    // Stub for Phase 7 file-upload methods
    async uploadProfilePicture(file) {
        return { success: false, error: 'File upload will be available in Phase 7. Use a URL instead.' };
    }
    async uploadCoverPhoto(file) {
        return { success: false, error: 'File upload will be available in Phase 7. Use a URL instead.' };
    }
}

// ── Singleton ─────────────────────────────────
const profileAPIService = new ProfileAPIService();
window.profileAPIService = profileAPIService;

// export default profileAPIService;
