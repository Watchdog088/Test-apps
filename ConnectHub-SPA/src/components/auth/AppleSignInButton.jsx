// AppleSignInButton.jsx — Section 2 Fix: Wire native @capacitor-community/apple-sign-in
// FIXED: Plugin is now properly detected and used on native iOS.
//        Falls back to Firebase web OAuth popup on web/macOS browsers.
// Apple App Store REQUIREMENT: Sign In with Apple MUST be offered when any other
// social sign-in (e.g., Google) is present. Missing = App Store rejection.

import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { auth } from '@/firebase/config';
import { OAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';

export default function AppleSignInButton({ onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  // Show on: iOS native, macOS, and Apple-platform browsers.
  // Hide entirely on Android native (Apple Sign-In not available on Android).
  const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
  const isAndroid = platform === 'android';
  if (isAndroid) return null;

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      if (platform === 'ios') {
        // ── NATIVE iOS path ──────────────────────────────────────────────────
        // Requires: npm install @capacitor-community/apple-sign-in && npx cap sync ios
        // Requires: "Sign In with Apple" capability enabled in Xcode
        const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
        const result = await SignInWithApple.authorize({
          clientId: 'com.lynkapp.app',          // Must match Apple Service ID / Bundle ID
          redirectURI: 'https://lynkapp.com',   // Must match configured redirect URI in Apple
          scopes: 'email name',
          state: Math.random().toString(36).substring(2),
          nonce: Math.random().toString(36).substring(2),
        });

        // Exchange Apple identity token for Firebase credential
        const { identityToken, authorizationCode } = result.response;
        const provider = new OAuthProvider('apple.com');
        const credential = provider.credential({
          idToken: identityToken,
          rawNonce: result.response.nonce,
        });
        const firebaseResult = await signInWithCredential(auth, credential);
        onSuccess?.(firebaseResult.user);

      } else {
        // ── WEB / macOS browser path ─────────────────────────────────────────
        const provider = new OAuthProvider('apple.com');
        provider.addScope('email');
        provider.addScope('name');
        const result = await signInWithPopup(auth, provider);
        onSuccess?.(result.user);
      }
    } catch (err) {
      // Swallow cancellations; surface real errors
      if (err.code !== 'auth/popup-closed-by-user' && err.message !== 'The user closed the sign-in dialog') {
        console.error('[AppleSignIn] Error:', err);
        onError?.(err.message || 'Apple Sign-In failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAppleSignIn}
      disabled={loading}
      style={{
        width: '100%',
        padding: '14px',
        background: loading ? '#1f2937' : '#000000',
        border: '2px solid #374151',
        borderRadius: '12px',
        color: '#ffffff',
        fontWeight: 700,
        fontSize: '16px',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '12px',
        transition: 'all 0.2s',
      }}
    >
      <span style={{ fontSize: '18px' }}></span>
      {loading ? 'Signing in…' : 'Continue with Apple'}
    </button>
  );
}
