// AppleSignInButton.jsx — Sprint 3: Apple Sign-In component (iOS only)
// NEW component — imported by LoginPage.jsx and SignupPage.jsx
// Renders ONLY on iOS/iPadOS — zero impact on Android/web users

import React, { useState } from 'react';
import { auth } from '@/firebase/config';
import { OAuthProvider, signInWithPopup } from 'firebase/auth';

// Only render on Apple platforms
const isApplePlatform = /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent);

export default function AppleSignInButton({ onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  // Don't render on non-Apple platforms
  if (!isApplePlatform) return null;

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      const result = await signInWithPopup(auth, provider);
      onSuccess?.(result.user);
    } catch (err) {
      // User cancelled or error — don't surface unless it's a real error
      if (err.code !== 'auth/popup-closed-by-user') {
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
