// src/hooks/useAuth.js
// BUG-02 (FULL FIX): Loads followingIds + friendIds from Firestore on login
// BUG-09 (FULL FIX): Real-time Firestore listeners for unreadMessages + unreadNotifications
// BLOCKER-1 FIX: Removed demoMode guard — auth always runs and sets demoMode=false on real login
// TIMEOUT-FIX: 3-second timeout so app never stays stuck on splash screen
// NULL-AUTH-FIX: Gracefully handles null auth (missing Firebase config) without crashing
// BLACK-SCREEN-FIX: loading initialised from the Zustand store so subsequent calls
//   (PrivateRoute, SmartRoot, AppShell) don't each restart with loading=true, which
//   caused a cascade of SplashScreen flashes / black screens.
//   Rule: user===undefined means "Firebase hasn't resolved yet" (loading=true).
//         user===null means "resolved, not logged in" (loading=false).
//         user===object means "resolved, logged in" (loading=false).

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc, getDoc, collection, query, where,
  onSnapshot, limit, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@fb/config';
import useAppStore from '@store/useAppStore';

export function useAuth() {
  const {
    user, setUser, setUserProfile,
    setFollowingIds, setFriendIds,
    setUnreadMessages, setUnreadNotifications,
    setDemoMode,
  } = useAppStore();

  // BLACK-SCREEN-FIX: initialise from the shared store instead of always true.
  // If user is already resolved (not undefined) from a prior useAuth() call on
  // this page load, skip the loading state entirely — no extra SplashScreen flash.
  const [loading, setLoading] = useState(() => useAppStore.getState().user === undefined);

  useEffect(() => {
    // NULL-AUTH-FIX: If Firebase didn't initialize (missing .env keys), bail out immediately
    if (!auth) {
      console.warn('[useAuth] Firebase auth is null — missing VITE_FIREBASE_* env vars. Running as unauthenticated.');
      setUser(null);
      setLoading(false);
      return;
    }

    // TIMEOUT-FIX: 15 seconds max — mobile-safe; 3s was too aggressive on slow
    // connections and could log out a legitimate user mid-session.
    // The timer is cleared immediately when onAuthStateChanged fires (see below),
    // so real users on fast connections are never affected by this limit.
    const timeoutId = setTimeout(() => {
      console.warn('[useAuth] Firebase auth timeout (15s) — treating as unauthenticated');
      setUser(null);
      setLoading(false);
    }, 15000);

    const unsubs = [];

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeoutId);

      // Clean up previous listeners
      unsubs.forEach(fn => fn());
      unsubs.length = 0;

      if (!firebaseUser) {
        setUser(null);
        setUserProfile(null);
        setFollowingIds([]);
        setFriendIds([]);
        setUnreadMessages(0);
        setUnreadNotifications(0);
        setLoading(false);
        return;
      }

      // Real user is logged in
      setDemoMode(false);
      setUser(firebaseUser);

      // Load or create profile doc (requires db to be available)
      if (db) {
        const profileRef = doc(db, 'users', firebaseUser.uid);
        try {
          const snap = await getDoc(profileRef);
          if (snap.exists()) {
            setUserProfile(snap.data());
          } else {
            const newProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || null,
              bio: '',
              postsCount: 0,
              followersCount: 0,
              followingCount: 0,
              following: [],
              followers: [],
              interests: [],
              isVerified: false,
              onboardingComplete: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(profileRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.warn('[useAuth] Profile load error:', err);
        }

        // Subscribe to following subcollection
        // BUG-FIX (Jun 2026): Followers snapshot was opened inside the following
        // snapshot callback without ever being unsubscribed.  Every time the
        // following list changed a brand-new Firestore listener was registered,
        // causing an unbounded memory / connection leak.
        // Fix: maintain a separate `unsubFollowers` ref that is cancelled before
        // re-subscribing, and push it into the shared `unsubs` array so the
        // outer cleanup also tears it down on logout.
        try {
          let unsubFollowers = null; // tracks the inner follower listener

          const followingRef = collection(db, 'users', firebaseUser.uid, 'following');
          const unsubFollowing = onSnapshot(followingRef, (snap) => {
            const ids = snap.docs.map(d => d.id);
            setFollowingIds(ids);

            // Cancel the previous followers listener before creating a new one
            if (unsubFollowers) {
              unsubFollowers();
              unsubFollowers = null;
            }

            const followersRef = collection(db, 'users', firebaseUser.uid, 'followers');
            unsubFollowers = onSnapshot(followersRef, (followerSnap) => {
              const followerIds = new Set(followerSnap.docs.map(d => d.id));
              const mutualIds = ids.filter(id => followerIds.has(id));
              setFriendIds(mutualIds);
            });
          });

          // Wrap both listeners in a single teardown so the outer cleanup handles them
          unsubs.push(() => {
            unsubFollowing();
            if (unsubFollowers) unsubFollowers();
          });
        } catch (err) {
          console.warn('[useAuth] Following subscription error:', err);
          try {
            const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
            const data = profileSnap.data() || {};
            setFollowingIds(data.following || []);
            setFriendIds(data.friends || []);
          } catch {}
        }

        // Real-time unread message count
        try {
          const convoQuery = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', firebaseUser.uid),
          );
          const unsubConvos = onSnapshot(convoQuery, (snap) => {
            let totalUnread = 0;
            snap.docs.forEach(d => {
              const data = d.data();
              const unreadMap = data.unreadCounts || {};
              totalUnread += (unreadMap[firebaseUser.uid] || 0);
            });
            setUnreadMessages(totalUnread);
          });
          unsubs.push(unsubConvos);
        } catch (err) {
          console.warn('[useAuth] Unread messages subscription error:', err);
        }

        // Real-time unread notification count
        try {
          const notifQuery = query(
            collection(db, 'notifications'),
            where('recipientUid', '==', firebaseUser.uid),
            where('read', '==', false),
            limit(99),
          );
          const unsubNotifs = onSnapshot(notifQuery, (snap) => {
            setUnreadNotifications(snap.size);
          });
          unsubs.push(unsubNotifs);
        } catch (err) {
          console.warn('[useAuth] Notifications subscription error:', err);
        }
      }

      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubAuth();
      unsubs.forEach(fn => fn());
    };
  }, []);

  return { user, loading };
}

export default useAuth;
