// src/hooks/useAuth.js
// BUG-02 (FULL FIX): Loads followingIds + friendIds from Firestore on login
// BUG-09 (FULL FIX): Real-time Firestore listeners for unreadMessages + unreadNotifications

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc, getDoc, collection, query, where,
  onSnapshot, orderBy, limit, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@fb/config';
import useAppStore from '@store/useAppStore';

export function useAuth() {
  const {
    user, setUser, setUserProfile,
    setFollowingIds, setFriendIds,
    setUnreadMessages, setUnreadNotifications,
    demoMode,
  } = useAppStore();

  useEffect(() => {
    // Demo mode — no Firebase needed
    if (demoMode) return;

    const unsubs = [];

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
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
        return;
      }

      setUser(firebaseUser);

      // --- Load or create profile doc ---
      const profileRef = doc(db, 'users', firebaseUser.uid);
      try {
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          setUserProfile(snap.data());
        } else {
          // First-time user — create basic profile
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

      // --- BUG-02 FULL FIX: Subscribe to following subcollection ---
      try {
        const followingRef = collection(db, 'users', firebaseUser.uid, 'following');
        const unsubFollowing = onSnapshot(followingRef, (snap) => {
          const ids = snap.docs.map(d => d.id);
          setFollowingIds(ids);

          // Mutual follows = friends
          // For simplicity: check followers subcollection to determine mutual
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
        // Fallback: try flat array field on profile doc
        try {
          const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          const data = profileSnap.data() || {};
          setFollowingIds(data.following || []);
          setFriendIds(data.friends || []);
        } catch {}
      }

      // --- BUG-09 FULL FIX: Real-time unread message count ---
      try {
        const convoQuery = query(
          collection(db, 'conversations'),
          where('participants', 'array-contains', firebaseUser.uid),
        );
        const unsubConvos = onSnapshot(convoQuery, (snap) => {
          let totalUnread = 0;
          snap.docs.forEach(d => {
            const data = d.data();
            // Each conversation stores unreadCount per user as a map
            const unreadMap = data.unreadCounts || {};
            totalUnread += (unreadMap[firebaseUser.uid] || 0);
          });
          setUnreadMessages(totalUnread);
        });
        unsubs.push(unsubConvos);
      } catch (err) {
        console.warn('[useAuth] Unread messages subscription error:', err);
      }

      // --- BUG-09 FULL FIX: Real-time unread notification count ---
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
    });

    return () => {
      unsubAuth();
      unsubs.forEach(fn => fn());
    };
  }, [demoMode]);

  return {
    user,
    loading: user === undefined,
  };
}

export default useAuth;
