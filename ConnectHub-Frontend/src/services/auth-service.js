/**
 * ConnectHub Authentication Service with Firebase
 * Phase 2: Real Firebase Authentication Implementation
 * Updated: March 19, 2026
 */

// firebaseConfig loaded via regular <script> tag before this file — read from window
const firebaseConfig = window.firebaseConfig || {};

// Firebase imports (using CDN modules)
let auth, db;
let createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, 
    onAuthStateChanged, sendPasswordResetEmail, updateProfile;
let doc, setDoc, getDoc, updateDoc, serverTimestamp;

class AuthService {
    constructor() {
        this.currentUser = null;
        this.authToken = null;
        this.listeners = [];
        this.firebaseInitialized = false;
        
        // Initialize Firebase
        this.initializeFirebase();
    }

    /**
     * Initialize Firebase Authentication and Firestore
     */
    async initializeFirebase() {
        try {
            // Initialize Firebase App
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
            const { getAuth, createUserWithEmailAndPassword: createUser, 
                    signInWithEmailAndPassword: signIn, signOut: signOutUser,
                    onAuthStateChanged: authStateChanged, sendPasswordResetEmail: sendReset,
                    updateProfile: updateUserProfile } = 
                await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
            const { getFirestore, doc: docRef, setDoc: setDocument, 
                    getDoc: getDocument, updateDoc: updateDocument, 
                    serverTimestamp: timestamp } = 
                await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

            // Initialize Firebase
            const app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);

            // Assign functions
            createUserWithEmailAndPassword = createUser;
            signInWithEmailAndPassword = signIn;
            signOut = signOutUser;
            onAuthStateChanged = authStateChanged;
            sendPasswordResetEmail = sendReset;
            updateProfile = updateUserProfile;
            doc = docRef;
            setDoc = setDocument;
            getDoc = getDocument;
            updateDoc = updateDocument;
            serverTimestamp = timestamp;

            this.firebaseInitialized = true;
            console.log('✅ Firebase Authentication initialized');

            // Set up auth state listener
            this.setupAuthStateListener();

        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            throw new Error('Failed to initialize Firebase Authentication');
        }
    }

    /**
     * Set up Firebase auth state listener
     */
    setupAuthStateListener() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in
                console.log('🔐 User signed in:', user.email);
                await this.loadUserProfile(user.uid);
                this.notifyListeners('authStateChanged', this.currentUser);
            } else {
                // User is signed out
                console.log('🔓 User signed out');
                this.currentUser = null;
                this.authToken = null;
                this.notifyListeners('authStateChanged', null);
            }
        });
    }

    /**
     * Load user profile from Firestore
     */
    async loadUserProfile(userId) {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            
            if (userDoc.exists()) {
                this.currentUser = {
                    userId: userId,
                    ...userDoc.data()
                };
                
                // Get auth token
                this.authToken = await auth.currentUser.getIdToken();
                
                return this.currentUser;
            } else {
                console.warn('User profile not found in Firestore');
                return null;
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
            return null;
        }
    }

    /**
     * Register new user (TASK 2.2)
     */
    async register(userData) {
        try {
            if (!this.firebaseInitialized) {
                throw new Error('Firebase not initialized. Please wait...');
            }

            const { email, password, username, displayName } = userData;

            // Validate input
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            console.log('📝 Creating user account...', email);

            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log('✅ User account created:', user.uid);

            // Update profile with display name
            if (displayName) {
                await updateProfile(user, { displayName });
            }

            // Create user profile in Firestore (TASK 2.7)
            await this.createUserProfile(user, {
                username: username || email.split('@')[0],
                displayName: displayName || username || email.split('@')[0]
            });

            console.log('✅ User profile created in Firestore');

            // Load the profile
            await this.loadUserProfile(user.uid);

            this.notifyListeners('register', this.currentUser);

            return {
                success: true,
                user: this.currentUser,
                token: this.authToken
            };

        } catch (error) {
            console.error('❌ Registration failed:', error);
            
            // Firebase error handling
            let errorMessage = 'Registration failed';
            
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            throw new Error(errorMessage);
        }
    }

    /**
     * Create user profile in Firestore (TASK 2.7)
     */
    async createUserProfile(user, additionalData = {}) {
        try {
            const userProfile = {
                userId: user.uid,
                email: user.email,
                username: additionalData.username || user.email.split('@')[0],
                displayName: additionalData.displayName || user.displayName || user.email.split('@')[0],
                bio: '',
                profilePicture: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(additionalData.displayName || user.email),
                coverPhoto: null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastActive: serverTimestamp(),
                stats: {
                    postsCount: 0,
                    friendsCount: 0,
                    followersCount: 0,
                    followingCount: 0
                },
                settings: {
                    privacy: 'public',
                    notifications: true,
                    emailNotifications: true,
                    darkMode: false
                },
                verified: false,
                online: true
            };

            // Create document in Firestore
            await setDoc(doc(db, 'users', user.uid), userProfile);

            return userProfile;
        } catch (error) {
            console.error('Failed to create user profile:', error);
            throw error;
        }
    }

    /**
     * Login user (TASK 2.3)
     */
    async login(credentials) {
        try {
            if (!this.firebaseInitialized) {
                throw new Error('Firebase not initialized. Please wait...');
            }

            const { email, password } = credentials;

            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            console.log('🔐 Logging in...', email);

            // Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log('✅ Logged in successfully:', user.uid);

            // Load user profile
            await this.loadUserProfile(user.uid);

            // Update last active
            await this.updateLastActive(user.uid);

            this.notifyListeners('login', this.currentUser);

            return {
                success: true,
                user: this.currentUser,
                token: this.authToken
            };

        } catch (error) {
            console.error('❌ Login failed:', error);
            
            let errorMessage = 'Login failed';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Invalid email or password';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (error.code === 'auth/user-disabled') {
                errorMessage = 'This account has been disabled';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Please try again later';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            throw new Error(errorMessage);
        }
    }

    /**
     * Logout user (TASK 2.4)
     */
    async logout() {
        try {
            if (!this.firebaseInitialized || !auth.currentUser) {
                this.clearAuth();
                return;
            }

            console.log('🔓 Logging out...');

            // Update online status before logout
            if (this.currentUser) {
                await this.updateOnlineStatus(this.currentUser.userId, false);
            }

            // Sign out from Firebase
            await signOut(auth);

            this.clearAuth();
            
            console.log('✅ Logged out successfully');

        } catch (error) {
            console.error('❌ Logout failed:', error);
            // Clear anyway
            this.clearAuth();
        }
    }

    /**
     * Clear authentication state
     */
    clearAuth() {
        this.authToken = null;
        this.currentUser = null;
        this.notifyListeners('logout');
    }

    /**
     * Request password reset (TASK 2.6)
     */
    async forgotPassword(email) {
        try {
            if (!this.firebaseInitialized) {
                throw new Error('Firebase not initialized');
            }

            if (!email) {
                throw new Error('Email is required');
            }

            console.log('📧 Sending password reset email to:', email);

            await sendPasswordResetEmail(auth, email);

            console.log('✅ Password reset email sent');

            return {
                success: true,
                message: 'Password reset email sent! Check your inbox.'
            };

        } catch (error) {
            console.error('❌ Password reset failed:', error);
            
            let errorMessage = 'Failed to send reset email';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            throw new Error(errorMessage);
        }
    }

    /**
     * Update last active timestamp
     */
    async updateLastActive(userId) {
        try {
            await updateDoc(doc(db, 'users', userId), {
                lastActive: serverTimestamp(),
                online: true
            });
        } catch (error) {
            console.error('Failed to update last active:', error);
        }
    }

    /**
     * Update online status
     */
    async updateOnlineStatus(userId, isOnline) {
        try {
            await updateDoc(doc(db, 'users', userId), {
                online: isOnline,
                lastActive: serverTimestamp()
            });
        } catch (error) {
            console.error('Failed to update online status:', error);
        }
    }

    /**
     * Check if user is authenticated (TASK 2.5)
     */
    isAuthenticated() {
        return !!(auth && auth.currentUser && this.currentUser);
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Get authentication token
     */
    async getToken() {
        if (auth && auth.currentUser) {
            try {
                this.authToken = await auth.currentUser.getIdToken();
                return this.authToken;
            } catch (error) {
                console.error('Failed to get token:', error);
                return null;
            }
        }
        return this.authToken;
    }

    /**
     * Update current user data
     */
    async updateCurrentUser(userData) {
        if (this.currentUser && auth.currentUser) {
            try {
                // Update Firestore
                await updateDoc(doc(db, 'users', this.currentUser.userId), {
                    ...userData,
                    updatedAt: serverTimestamp()
                });

                // Update local state
                this.currentUser = {
                    ...this.currentUser,
                    ...userData
                };

                this.notifyListeners('userUpdate', this.currentUser);

                return this.currentUser;
            } catch (error) {
                console.error('Failed to update user:', error);
                throw error;
            }
        }
    }

    /**
     * Add authentication listener
     */
    addListener(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
        }
    }

    /**
     * Remove authentication listener
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    /**
     * Notify all listeners of auth state changes
     */
    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Listener error:', error);
            }
        });
    }

    /**
     * Legacy methods for backward compatibility
     * These maintain the same interface as before
     */
    
    async refreshToken() {
        // Firebase handles token refresh automatically
        return await this.getToken();
    }

    async resetPassword(token, newPassword) {
        // This is handled by Firebase's password reset email flow
        console.warn('Use forgotPassword() instead');
        return { success: false, message: 'Use forgot password flow' };
    }

    async changePassword(currentPassword, newPassword) {
        // TODO: Implement in Phase 3
        console.warn('Change password not yet implemented');
        return { success: false, message: 'Not yet implemented' };
    }

    async validateSession() {
        // Firebase handles session validation automatically
        return this.isAuthenticated();
    }

    async socialLogin(provider, accessToken) {
        // TODO: Implement social login in Phase 3
        console.warn('Social login not yet implemented');
        throw new Error('Social login not yet implemented');
    }

    async verifyEmail(token) {
        // TODO: Implement email verification in Phase 3
        console.warn('Email verification not yet implemented');
        throw new Error('Email verification not yet implemented');
    }

    async resendVerification() {
        // TODO: Implement in Phase 3
        console.warn('Resend verification not yet implemented');
        throw new Error('Not yet implemented');
    }

    async enableTwoFactor() {
        // TODO: Implement 2FA in Phase 3
        console.warn('2FA not yet implemented');
        throw new Error('2FA not yet implemented');
    }

    async verifyTwoFactor(code) {
        // TODO: Implement in Phase 3
        throw new Error('2FA not yet implemented');
    }

    async disableTwoFactor(password) {
        // TODO: Implement in Phase 3
        throw new Error('2FA not yet implemented');
    }

    async getSessions() {
        // Firebase doesn't expose sessions in the same way
        return [];
    }

    async revokeSession(sessionId) {
        // Not applicable for Firebase
        return { success: false };
    }

    /**
     * Cleanup on destruction
     */
    destroy() {
        this.listeners = [];
        this.currentUser = null;
        this.authToken = null;
    }
}

// Create and export global instance
const authService = new AuthService();
window.authService = authService;

// export default authService; // loaded as regular <script> — use window.authService instead
