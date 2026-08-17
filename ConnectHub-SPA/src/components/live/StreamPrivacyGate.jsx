// StreamPrivacyGate.jsx — Sprint 4: Access gate for follower-only streams
// NEW component — used in LiveWatchPage to block non-followers from private streams

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';

export default function StreamPrivacyGate({ stream, onAccessGranted }) {
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;

  // If stream is public or has no privacy setting → grant access immediately
  if (!stream || !stream.privacy || stream.privacy === 'public') {
    onAccessGranted?.();
    return null;
  }

  // If the viewer is the creator → grant access
  if (uid && uid === stream.uid) {
    onAccessGranted?.();
    return null;
  }

  // followers-only: check if viewer is in followers list
  if (stream.privacy === 'followers') {
    const isFollowing = stream.followers?.includes(uid);
    if (isFollowing) {
      onAccessGranted?.();
      return null;
    }

    const handleFollow = async () => {
      if (!uid) return navigate('/auth/login');
      try {
        await updateDoc(doc(db, 'users', stream.uid), {
          followers: arrayUnion(uid),
        });
        await updateDoc(doc(db, 'streams', stream.id), {
          followers: arrayUnion(uid),
        });
        onAccessGranted?.();
      } catch (err) {
        console.error('[StreamPrivacyGate] Follow error:', err);
      }
    };

    const s = {
      page:  { minHeight: '100vh', background: '#0f0f0f', display: 'flex', flexDirection: 'column',
               alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' },
      icon:  { fontSize: '64px', marginBottom: '20px' },
      title: { fontSize: '22px', fontWeight: 800, color: '#f1f5f9', marginBottom: '12px' },
      sub:   { color: '#94a3b8', fontSize: '15px', marginBottom: '32px', lineHeight: 1.6, maxWidth: '300px' },
      btn:   { padding: '14px 32px', background: '#3b82f6', border: 'none', borderRadius: '12px',
               color: '#fff', fontWeight: 700, fontSize: '16px', cursor: 'pointer', marginBottom: '12px', display: 'block', width: '100%', maxWidth: '280px' },
      back:  { color: '#64748b', fontSize: '14px', cursor: 'pointer', background: 'none', border: 'none' },
    };

    return (
      <div style={s.page}>
        <div style={s.icon}>🔒</div>
        <div style={s.title}>Followers Only</div>
        <div style={s.sub}>
          <strong>{stream.userName || 'This creator'}</strong> is streaming exclusively for their followers.
          Follow them to watch live.
        </div>
        <button style={s.btn} onClick={handleFollow}>
          ➕ Follow to Watch
        </button>
        <button style={s.back} onClick={() => navigate('/live')}>← Back to Live</button>
      </div>
    );
  }

  // Default: deny access for unknown privacy modes
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚫</div>
        <div>This stream is private.</div>
      </div>
    </div>
  );
}
