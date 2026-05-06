// src/hooks/useAuth.js — Firebase Auth state hook
// Single source of truth for the current user session

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@fb/config';
import useAppStore from '@store/useAppStore';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const { user, setUser, setUserProfile, demoMode } = useAppStore();

  useEffect(() => {
    // Demo mode: skip Firebase listener entirely — mock user is already set in store
    if (demoMode) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // If demo mode was activated mid-session, don't wipe the mock user
      if (useAppStore.getState().demoMode) {
        setLoading(false);
        return;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        // Load or create Firestore profile
        try {
          const profileRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(profileRef);
          if (snap.exists()) {
            setUserProfile(snap.data());
          } else {
            // First login — create profile document
            const newProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'New User',
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL || null,
              bio: '',
              postsCount: 0,
              followersCount: 0,
              followingCount: 0,
              isVerified: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(profileRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('[useAuth] Profile load error:', err);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [demoMode]);

  return { user, loading };
}
