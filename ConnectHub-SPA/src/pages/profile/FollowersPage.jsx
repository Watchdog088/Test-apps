// src/pages/profile/FollowersPage.jsx
// SECTION-8 FIX: Loads real followers/following from Firestore follows collection
// FIX-P08: follows collection queried for real data; falls back to demo if empty
// FIX-P09: Follow/Unfollow buttons write to Firestore follows collection

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  collection, query, where, getDocs, doc, getDoc,
  setDoc, deleteDoc, updateDoc, increment, serverTimestamp
} from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';

// Demo fallback data (shown when Firestore is empty)
const DEMO_USERS = [
  { uid: 'u1', displayName: 'Jordan Maxwell', bio: 'UX Designer · 2.1K followers', emoji: '🌸', following: false },
  { uid: 'u2', displayName: 'Alex Chen', bio: 'Software Engineer · 891 followers', emoji: '🔥', following: true },
  { uid: 'u3', displayName: 'Riley Johnson', bio: 'Fitness Coach · 4.2K followers', emoji: '💪', following: false },
  { uid: 'u4', displayName: 'Morgan Taylor', bio: 'Graphic Artist · 12.8K followers', emoji: '🎨', following: true },
  { uid: 'u5', displayName: 'Sam Rivera', bio: 'Chef & Food Blogger · 5.6K followers', emoji: '🍕', following: false },
  { uid: 'u6', displayName: 'Casey Lee', bio: 'Yoga Teacher · 3.3K followers', emoji: '🌙', following: false },
];

export default function FollowersPage() {
  const { uid: targetUid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isFollowingTab = location.pathname.endsWith('/following');

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [myFollowing, setMyFollowing] = useState(new Set());

  // ── Load followers or following from Firestore ───────────────────────────
  useEffect(() => {
    if (!targetUid) { setLoading(false); return; }
    (async () => {
      try {
        // FIX-P08: Query follows collection for real data
        let uids = [];
        if (isFollowingTab) {
          // Users that targetUid follows
          const snap = await getDocs(
            query(collection(db, 'follows'), where('followerId', '==', targetUid))
          );
          uids = snap.docs.map(d => d.data().followeeId);
        } else {
          // Users that follow targetUid
          const snap = await getDocs(
            query(collection(db, 'follows'), where('followeeId', '==', targetUid))
          );
          uids = snap.docs.map(d => d.data().followerId);
        }

        if (uids.length === 0) {
          // Fallback to demo data
          setUsers(DEMO_USERS);
        } else {
          // Load each user's profile doc
          const profiles = await Promise.all(
            uids.map(async uid => {
              try {
                const snap = await getDoc(doc(db, 'users', uid));
                if (snap.exists()) return { uid, ...snap.data() };
                return { uid, displayName: 'User', bio: '' };
              } catch { return { uid, displayName: 'User', bio: '' }; }
            })
          );
          setUsers(profiles);
        }

        // Load current user's following set for button state
        if (user?.uid) {
          const mySnap = await getDocs(
            query(collection(db, 'follows'), where('followerId', '==', user.uid))
          );
          setMyFollowing(new Set(mySnap.docs.map(d => d.data().followeeId)));
        }
      } catch (err) {
        console.error('[FollowersPage]', err);
        setUsers(DEMO_USERS);
      }
      setLoading(false);
    })();
  }, [targetUid, isFollowingTab, user]);

  // ── FIX-P09: Follow / Unfollow ────────────────────────────────────────────
  async function toggleFollow(targetId) {
    if (!user?.uid || targetId === user.uid) return;
    const followId = `${user.uid}_${targetId}`;
    const isNowFollowing = myFollowing.has(targetId);

    // Optimistic update
    setMyFollowing(prev => {
      const next = new Set(prev);
      if (isNowFollowing) next.delete(targetId);
      else next.add(targetId);
      return next;
    });

    try {
      if (isNowFollowing) {
        await deleteDoc(doc(db, 'follows', followId));
        await Promise.all([
          updateDoc(doc(db, 'users', user.uid), { followingCount: increment(-1) }),
          updateDoc(doc(db, 'users', targetId), { followersCount: increment(-1) }),
        ]);
      } else {
        await setDoc(doc(db, 'follows', followId), {
          followerId: user.uid,
          followeeId: targetId,
          createdAt: serverTimestamp(),
        });
        await Promise.all([
          updateDoc(doc(db, 'users', user.uid), { followingCount: increment(1) }),
          updateDoc(doc(db, 'users', targetId), { followersCount: increment(1) }),
        ]);
      }
    } catch (err) {
      console.error('[FollowersPage toggleFollow]', err);
      // Revert on error
      setMyFollowing(prev => {
        const next = new Set(prev);
        if (isNowFollowing) next.add(targetId);
        else next.delete(targetId);
        return next;
      });
    }
  }

  const filtered = users.filter(u =>
    (u.displayName || u.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80, fontFamily: 'system-ui,sans-serif', color: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>
          {isFollowingTab ? '👤 Following' : '👥 Followers'}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#475569' }}>{users.length}</span>
      </div>

      {/* Tab Toggle */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={() => navigate(`/profile/${targetUid}/followers`)}
          style={{ flex: 1, padding: '14px', fontSize: 14, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', borderBottom: !isFollowingTab ? '2px solid #6366f1' : '2px solid transparent', color: !isFollowingTab ? '#818cf8' : '#475569' }}>
          Followers
        </button>
        <button
          onClick={() => navigate(`/profile/${targetUid}/following`)}
          style={{ flex: 1, padding: '14px', fontSize: 14, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', borderBottom: isFollowingTab ? '2px solid #6366f1' : '2px solid transparent', color: isFollowingTab ? '#818cf8' : '#475569' }}>
          Following
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#475569', fontSize: 16 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            style={{ flex: 1, background: 'none', border: 'none', color: '#f1f5f9', fontSize: 14, outline: 'none' }}
          />
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, flexDirection: 'column', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ color: '#475569', fontSize: 13 }}>Loading {isFollowingTab ? 'following' : 'followers'}…</div>
        </div>
      ) : (
        <div>
          {filtered.map(u => {
            const name = u.displayName || u.name || 'User';
            const bio = u.bio || '';
            const avatar = u.photoURL || null;
            const isMe = u.uid === user?.uid;
            const isFollowed = myFollowing.has(u.uid);

            return (
              <div key={u.uid} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {/* Avatar */}
                <button onClick={() => navigate(`/profile/${u.uid}`)} style={{ width: 46, height: 46, borderRadius: '50%', background: avatar ? 'none' : 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, border: 'none', cursor: 'pointer', overflow: 'hidden', padding: 0 }}>
                  {avatar
                    ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (u.emoji || name[0]?.toUpperCase() || '👤')}
                </button>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }} onClick={() => navigate(`/profile/${u.uid}`)}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    {name}
                    {u.isVerified && <span style={{ fontSize: 12 }}>✅</span>}
                    {u.isPremium && <span style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#fff', borderRadius: 6, padding: '1px 5px', fontSize: 9, fontWeight: 800 }}>PRO</span>}
                  </div>
                  {bio && <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bio}</div>}
                  {u.followersCount > 0 && <div style={{ fontSize: 11, color: '#475569' }}>{u.followersCount >= 1000 ? `${(u.followersCount / 1000).toFixed(1)}K` : u.followersCount} followers</div>}
                </div>

                {/* Follow button (hidden for self) */}
                {!isMe && (
                  <button
                    onClick={() => toggleFollow(u.uid)}
                    style={{
                      padding: '8px 16px', borderRadius: 22, fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                      background: isFollowed ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#6366f1,#ec4899)',
                      border: isFollowed ? '1px solid rgba(255,255,255,0.15)' : 'none',
                      color: isFollowed ? '#94a3b8' : 'white',
                      transition: 'all 0.15s',
                    }}>
                    {isFollowed ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: '#475569' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{search ? '🔍' : (isFollowingTab ? '👤' : '👥')}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#64748b' }}>
                {search ? 'No users found' : isFollowingTab ? 'Not following anyone yet' : 'No followers yet'}
              </div>
              {!search && !isFollowingTab && (
                <div style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>Share your profile to gain followers</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
