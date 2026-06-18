// src/hooks/useAuth.js
// BUG-02 (FULL FIX): Loads followingIds + friendIds from Firestore on login
// BUG-09 (FULL FIX): Real-time Firestore listeners for unreadMessages + unreadNotifications
// BLOCKER-1 FIX: Removed demoMode guard — auth always runs and sets demoMode=false on real login
// TIMEOUT-FIX: 3-second timeout so app never stays stuck on splash screen
// NULL-AUTH-FIX: Gracefully handles null auth (missing Firebase config) without crashing

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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // NULL-AUTH-FIX: If Firebase didn't initialize (missing .env keys), bail out immediately
    if (!auth) {
      console.warn('[useAuth] Firebase auth is null — missing VITE_FIREBASE_* env vars. Running as unauthenticated.');
      setUser(null);
      setLoading(false);
      return;
    }

    // TIMEOUT-FIX: 3 seconds max — never stay stuck on splash screen
    const timeoutId = setTimeout(() => {
      console.warn('[useAuth] Firebase auth timeout — treating as unauthenticated');
      setUser(null);
      setLoading(false);
    }, 3000);

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
        try {
          const followingRef = collection(db, 'users', firebaseUser.uid, 'following');
          const unsubFollowing = onSnapshot(followingRef, (snap) => {
            const ids = snap.docs.map(d => d.id);
            setFollowingIds(ids);
            const followersRef = collection(db, 'users', firebaseUser.uid, 'followers');
            onSnapshot(followersRef, (followerSnap) => {
              const followerIds = new Set(followerSnap.docs.map(d => d.id));
              const mutualIds = ids.filter(id => followerIds.has(id));
              setFriendIds(mutualIds);
            });
          });
          unsubs.push(unsubFollowing);
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
