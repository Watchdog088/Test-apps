// src/pages/profile/ProfilePage.jsx
// SECTION-8 SPRINT-2 — May 2026
// NEW-P08: Real QR code via api.qrserver.com (free, no API key)
// NEW-P09: Pinned posts sorted to TOP of grid (reorder implemented)
// NEW-P10: Profile theme — premium background color applied to page
// NEW-P11: Private accounts — "Request to Follow" flow with followRequests collection
// NEW-P12: Private account lock icon shown on header

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc, getDoc, collection, query, where, orderBy, getDocs,
  setDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove, increment, serverTimestamp
} from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';
import { ProfileSkeleton, TabSkeleton } from '@components/common/SkeletonLoader';

// ─── helpers ────────────────────────────────────────────────────────────────
function formatCount(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

// ─── demo fallback grid ───────────────────────────────────────────────────
const DEMO_GRID = [
  { id: 'g1', emoji: '🎵', color: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 'g2', emoji: '✈️', color: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { id: 'g3', emoji: '💪', color: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { id: 'g4', emoji: '🎨', color: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { id: 'g5', emoji: '🍕', color: 'linear-gradient(135deg,#fa709a,#fee140)' },
  { id: 'g6', emoji: '📸', color: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
];

const TABS = ['Posts', 'Reels', 'Tagged', 'Liked', 'Clips'];

// ─── Photo Viewer Overlay ────────────────────────────────────────────────────
function PhotoViewer({ src, onClose }) {
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const startRef = useRef(null);

  function handleWheel(e) {
    e.preventDefault();
    setScale(s => Math.min(4, Math.max(1, s - e.deltaY * 0.002)));
  }
  function handleMouseDown(e) { setDragging(true); startRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }; }
  function handleMouseMove(e) { if (!dragging) return; setPos({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y }); }
  function handleMouseUp() { setDragging(false); }
  function resetZoom() { setScale(1); setPos({ x: 0, y: 0 }); }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 10 }}>
        <button onClick={resetZoom} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>🔍 Reset</button>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>
      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', color: '#94a3b8', fontSize: 13 }}>Scroll to zoom · Drag to pan</div>
      <div onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        style={{ cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}>
        <img src={src} alt="Profile" draggable={false}
          style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 16, objectFit: 'contain',
            transform: `scale(${scale}) translate(${pos.x / scale}px, ${pos.y / scale}px)`,
            transition: dragging ? 'none' : 'transform 0.1s' }} />
      </div>
    </div>
  );
}

// ─── QR Code Bottom Sheet — NEW-P08: Real QR via api.qrserver.com ────────────
function QRSheet({ handle, uid, onClose, navigate }) {
  const profileUrl = `${window.location.origin}/profile/${uid}`;
  // NEW-P08: Free QR API — no API key required
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(profileUrl)}&bgcolor=ffffff&color=1e293b&margin=10`;
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard?.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareViaMessage() {
    navigate('/messages/new', { state: { prefillText: `Check out my profile: ${profileUrl}` } });
    onClose();
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: '#1e293b', borderRadius: '24px 24px 0 0', padding: 28, width: '100%', maxWidth: 480, textAlign: 'center' }}>
        <div style={{ width: 48, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }} />
        <h3 style={{ color: '#f1f5f9', margin: '0 0 4px', fontSize: 18, fontWeight: 800 }}>📱 Share Profile</h3>
        <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: 13 }}>@{handle} · Scan to visit profile</p>

        {/* NEW-P08: Real QR code image from free API */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 8, display: 'inline-block', marginBottom: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <img
            src={qrImageUrl}
            alt="QR Code"
            width={160}
            height={160}
            style={{ display: 'block', borderRadius: 8 }}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
          />
          <div style={{ display: 'none', width: 160, height: 160, background: '#f8fafc', borderRadius: 8, alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#64748b' }}>
            QR unavailable offline
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#64748b', fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profileUrl}</span>
          <button onClick={copyLink} style={{ background: copied ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0, transition: 'background 0.3s' }}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={shareViaMessage} style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 8px', color: '#f1f5f9', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            💬 Share via Message
          </button>
          <a href={`mailto:?subject=Check out my profile&body=Visit: ${profileUrl}`}
            style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 8px', color: '#f1f5f9', fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
            📧 Share via Email
          </a>
        </div>

        <button onClick={onClose} style={{ marginTop: 16, width: '100%', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 12, padding: 12, color: '#94a3b8', fontSize: 14, cursor: 'pointer' }}>Close</button>
      </div>
    </div>
  );
}

// ─── Three-dot Menu ──────────────────────────────────────────────────────────
function ThreeDotMenu({ targetUid, targetName, onBlock, onReport }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>⋯</button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 50, background: '#1e293b', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', padding: '6px 0', zIndex: 100, minWidth: 180, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {[
            { icon: '🚫', label: `Block ${targetName}`, action: () => { onBlock(); setOpen(false); }, color: '#ef4444' },
            { icon: '🚩', label: 'Report Profile', action: () => { onReport(); setOpen(false); }, color: '#f59e0b' },
            { icon: '🔗', label: 'Copy Profile Link', action: () => { navigator.clipboard?.writeText(`${window.location.origin}/profile/${targetUid}`); setOpen(false); }, color: '#94a3b8' },
          ].map(item => (
            <button key={item.label} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', padding: '12px 16px', color: item.color || '#f1f5f9', fontSize: 14, cursor: 'pointer', textAlign: 'left' }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ProfilePage ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { uid: paramUid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isOwn = !paramUid || paramUid === user?.uid;
  const targetUid = paramUid || user?.uid;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Posts');
  const [tabLoading, setTabLoading] = useState(false);

  const [posts, setPosts] = useState([]);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [clips, setClips] = useState([]);
  const [clipsLoaded, setClipsLoaded] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [mutualCount, setMutualCount] = useState(0);

  // NEW-P11: Follow request state for private accounts
  const [followRequestSent, setFollowRequestSent] = useState(false);
  const [followRequestLoading, setFollowRequestLoading] = useState(false);

  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [qrSheetOpen, setQrSheetOpen] = useState(false);

  // ── Load profile ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!targetUid) { setLoading(false); return; }
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', targetUid));
        if (snap.exists()) setProfile(snap.data());
        else setProfile(null);
      } catch { setProfile(null); }
      setLoading(false);
    })();
  }, [targetUid]);

  // ── Check follow status + follow request status ────────────────────────────
  useEffect(() => {
    if (!user?.uid || !targetUid || isOwn) return;
    (async () => {
      try {
        const [followDoc, requestDoc] = await Promise.all([
          getDoc(doc(db, 'follows', `${user.uid}_${targetUid}`)),
          getDoc(doc(db, 'followRequests', `${user.uid}_${targetUid}`)),
        ]);
        setIsFollowing(followDoc.exists());
        setFollowRequestSent(requestDoc.exists());
      } catch {}
    })();
  }, [user, targetUid, isOwn]);

  // ── Compute mutual friends ────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid || !targetUid || isOwn) return;
    (async () => {
      try {
        const [mySnap, theirSnap] = await Promise.all([
          getDocs(query(collection(db, 'follows'), where('followerId', '==', user.uid))),
          getDocs(query(collection(db, 'follows'), where('followerId', '==', targetUid))),
        ]);
        const mySet = new Set(mySnap.docs.map(d => d.data().followeeId));
        setMutualCount(theirSnap.docs.filter(d => mySet.has(d.data().followeeId)).length);
      } catch {}
    })();
  }, [user, targetUid, isOwn]);

  // ── Load posts — NEW-P09: pinned posts sorted to front ────────────────────
  useEffect(() => {
    if (activeTab !== 'Posts' || postsLoaded || !targetUid) return;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'posts'), where('userId', '==', targetUid), orderBy('createdAt', 'desc'))
        );
        const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (loaded.length > 0) {
          // NEW-P09: Sort pinned posts to front of grid
          const profileSnap = await getDoc(doc(db, 'users', targetUid));
          const pinned = profileSnap.data()?.pinnedPosts || [];
          const pinnedItems = loaded.filter(p => pinned.includes(p.id));
          const rest = loaded.filter(p => !pinned.includes(p.id));
          setPosts([...pinnedItems, ...rest]);
        } else {
          setPosts(DEMO_GRID);
        }
      } catch { setPosts(DEMO_GRID); }
      setPostsLoaded(true);
    })();
  }, [activeTab, postsLoaded, targetUid]);

  // ── Load clips ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'Clips' || clipsLoaded || !targetUid) return;
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'clips'), where('userId', '==', targetUid), orderBy('createdAt', 'desc')));
        setClips(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch { setClips([]); }
      setClipsLoaded(true);
    })();
  }, [activeTab, clipsLoaded, targetUid]);

  function handleTabChange(tab) {
    if (tab === activeTab) return;
    setTabLoading(true);
    setActiveTab(tab);
    setTimeout(() => setTabLoading(false), 300);
  }

  // ── Follow / Unfollow ─────────────────────────────────────────────────────
  async function handleFollow() {
    if (!user?.uid || followLoading) return;

    // NEW-P11: If account is private and not following, send request
    if (profile?.isPrivate && !isFollowing) {
      await handleFollowRequest();
      return;
    }

    setFollowLoading(true);
    const followId = `${user.uid}_${targetUid}`;
    try {
      if (isFollowing) {
        await deleteDoc(doc(db, 'follows', followId));
        await Promise.all([
          updateDoc(doc(db, 'users', user.uid), { followingCount: increment(-1) }),
          updateDoc(doc(db, 'users', targetUid), { followersCount: increment(-1) }),
        ]);
        setIsFollowing(false);
        setProfile(p => p ? { ...p, followersCount: Math.max(0, (p.followersCount || 1) - 1) } : p);
      } else {
        await setDoc(doc(db, 'follows', followId), { followerId: user.uid, followeeId: targetUid, createdAt: serverTimestamp() });
        await Promise.all([
          updateDoc(doc(db, 'users', user.uid), { followingCount: increment(1) }),
          updateDoc(doc(db, 'users', targetUid), { followersCount: increment(1) }),
        ]);
        setIsFollowing(true);
        setProfile(p => p ? { ...p, followersCount: (p.followersCount || 0) + 1 } : p);
      }
    } catch (err) {
      console.error('[Follow]', err);
    }
    setFollowLoading(false);
  }

  // NEW-P11: Send / cancel follow request for private accounts
  async function handleFollowRequest() {
    if (!user?.uid || followRequestLoading) return;
    setFollowRequestLoading(true);
    const reqId = `${user.uid}_${targetUid}`;
    try {
      if (followRequestSent) {
        await deleteDoc(doc(db, 'followRequests', reqId));
        setFollowRequestSent(false);
      } else {
        await setDoc(doc(db, 'followRequests', reqId), {
          requestorId: user.uid,
          requestorName: user.displayName || 'User',
          requestorPhoto: user.photoURL || '',
          targetId: targetUid,
          status: 'pending',
          createdAt: serverTimestamp(),
        });
        setFollowRequestSent(true);
      }
    } catch (err) {
      console.error('[FollowRequest]', err);
    }
    setFollowRequestLoading(false);
  }

  // ── Block user ────────────────────────────────────────────────────────────
  async function handleBlock() {
    if (!user?.uid) return;
    const confirmed = window.confirm(`Block ${displayName}? They won't be able to see your profile.`);
    if (!confirmed) return;
    try {
      await setDoc(doc(db, 'blocks', `${user.uid}_${targetUid}`), {
        blockerId: user.uid, blockedId: targetUid, createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'users', user.uid), { blockedUsers: arrayUnion(targetUid) });
      navigate(-1);
    } catch (err) { console.error('[Block]', err); }
  }

  // ── Report user ───────────────────────────────────────────────────────────
  async function handleReport() {
    if (!user?.uid) return;
    const reason = window.prompt('Reason for report:');
    if (!reason) return;
    try {
      await setDoc(doc(db, 'reports', `${user.uid}_${targetUid}_${Date.now()}`), {
        reporterId: user.uid, reportedId: targetUid, reason, type: 'profile', createdAt: serverTimestamp(), status: 'pending',
      });
      alert('Your report has been submitted for review.');
    } catch (err) { console.error('[Report]', err); }
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const displayName = profile?.displayName || user?.displayName || 'User';
  const handle = profile?.username || displayName.toLowerCase().replace(/\s+/g, '');
  const bio = profile?.bio || (isOwn ? 'Tap Edit Profile to add a bio' : 'No bio yet');
  const postsCount = formatCount(profile?.postsCount || posts.length || 0);
  const followersCount = formatCount(profile?.followersCount || 0);
  const followingCount = formatCount(profile?.followingCount || 0);
  const photoURL = profile?.photoURL || user?.photoURL || null;
  const isPremium = profile?.isPremium || false;
  const isCreator = profile?.isCreator || false;
  const isVerified = profile?.isVerified || false;
  const isPrivate = profile?.isPrivate || false;

  // NEW-P10: Profile theme — premium custom background
  const pageBackground = (isPremium && profile?.theme) ? profile.theme : '#0a0a18';

  // Private account guard — if private, not own, and not following, hide content
  const isContentHidden = isPrivate && !isOwn && !isFollowing;

  if (loading) return <div style={{ background: '#0a0a18', minHeight: '100vh' }}><ProfileSkeleton /></div>;

  return (
    <div style={{ background: pageBackground, minHeight: '100vh', paddingBottom: 80, transition: 'background 0.3s' }}>
      {/* Overlays */}
      {photoViewerOpen && photoURL && <PhotoViewer src={photoURL} onClose={() => setPhotoViewerOpen(false)} />}
      {qrSheetOpen && <QRSheet handle={handle} uid={targetUid} onClose={() => setQrSheetOpen(false)} navigate={navigate} />}

      {/* Cover */}
      <div style={{ height: 140, background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', position: 'relative' }}>
        {profile?.coverUrl && <img src={profile.coverUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        {isOwn && (
          <button onClick={() => setQrSheetOpen(true)}
            style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '6px 12px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            📤 Share
          </button>
        )}
      </div>

      {/* Avatar + stats row */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -44, marginBottom: 14 }}>
          <div onClick={() => isOwn ? setPhotoViewerOpen(true) : navigate(`/stories?uid=${targetUid}`)}
            style={{ width: 88, height: 88, borderRadius: '50%', border: !isOwn ? '3px solid #6366f1' : '4px solid ' + pageBackground, overflow: 'hidden', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0, cursor: 'pointer', boxShadow: !isOwn ? '0 0 0 3px rgba(99,102,241,0.4)' : 'none' }}>
            {photoURL ? <img src={photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : displayName[0]?.toUpperCase()}
          </div>
          <div style={{ display: 'flex', gap: 24, paddingBottom: 8 }}>
            {[
              { label: 'Posts', value: isContentHidden ? '—' : postsCount },
              { label: 'Followers', value: followersCount, onClick: () => navigate(`/profile/${targetUid}/followers`) },
              { label: 'Following', value: followingCount, onClick: () => navigate(`/profile/${targetUid}/following`) },
            ].map(s => (
              <div key={s.label} onClick={s.onClick} style={{ textAlign: 'center', cursor: s.onClick ? 'pointer' : 'default' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Name + badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#f1f5f9' }}>{displayName}</div>
          {isVerified && <span title="Verified" style={{ fontSize: 16 }}>✅</span>}
          {/* NEW-P12: Lock icon for private accounts */}
          {isPrivate && !isOwn && <span title="Private Account" style={{ fontSize: 14 }}>🔒</span>}
          {isPrivate && isOwn && <span title="Private Account" style={{ fontSize: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: '1px 6px', color: '#94a3b8' }}>🔒 Private</span>}
          {isPremium && <span style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#fff', borderRadius: 8, padding: '1px 8px', fontSize: 10, fontWeight: 800 }}>PREMIUM</span>}
          {isCreator && <span style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)', color: '#fff', borderRadius: 8, padding: '1px 8px', fontSize: 10, fontWeight: 800 }}>CREATOR</span>}
        </div>
        <div style={{ fontSize: 13, color: '#6366f1', marginBottom: 6 }}>@{handle}</div>
        <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 10 }}>{bio}</div>

        {/* Mutual friends */}
        {!isOwn && mutualCount > 0 && (
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
            👥 <strong style={{ color: '#94a3b8' }}>{mutualCount}</strong> mutual {mutualCount === 1 ? 'friend' : 'friends'}
          </div>
        )}

        {/* Social links */}
        {profile?.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            {profile.socialLinks.twitter && <a href={`https://twitter.com/${profile.socialLinks.twitter}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#1d9bf0', textDecoration: 'none' }}>🐦 Twitter</a>}
            {profile.socialLinks.instagram && <a href={`https://instagram.com/${profile.socialLinks.instagram}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#e1306c', textDecoration: 'none' }}>📷 Instagram</a>}
            {profile.socialLinks.website && <a href={profile.socialLinks.website} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#10b981', textDecoration: 'none' }}>🌐 Website</a>}
          </div>
        )}

        {/* Interests */}
        {profile?.interests?.length > 0 && !isContentHidden && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {profile.interests.map(int => (
              <span key={int} style={{ padding: '4px 10px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, fontSize: 11, color: '#818cf8' }}>{int}</span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        {isOwn ? (
          <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            <button onClick={() => navigate('/profile/edit')} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, color: '#f1f5f9', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>✏️ Edit Profile</button>
            <button onClick={() => navigate('/profile/insights')} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, color: '#f1f5f9', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>📊 Insights</button>
            <button onClick={() => setQrSheetOpen(true)} style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>📤</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            {/* NEW-P11: Request to Follow for private accounts */}
            <button onClick={handleFollow} disabled={followLoading || followRequestLoading}
              style={{ flex: 1, padding: '10px',
                background: isFollowing ? 'rgba(255,255,255,0.07)' : (isPrivate && followRequestSent) ? 'rgba(245,158,11,0.15)' : 'linear-gradient(135deg,#6366f1,#ec4899)',
                border: (isFollowing || (isPrivate && followRequestSent)) ? '1px solid rgba(255,255,255,0.15)' : 'none',
                borderRadius: 14, color: isFollowing ? '#94a3b8' : (isPrivate && followRequestSent) ? '#f59e0b' : 'white',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: (followLoading || followRequestLoading) ? 0.6 : 1 }}>
              {followLoading || followRequestLoading ? '...'
                : isFollowing ? '✓ Following'
                : isPrivate && followRequestSent ? '⏳ Requested'
                : isPrivate ? '🔒 Request to Follow'
                : '➕ Follow'}
            </button>
            <button onClick={() => navigate('/messages', { state: { matchId: paramUid, matchName: displayName } })}
              style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, color: '#f1f5f9', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              💬 Message
            </button>
            <ThreeDotMenu targetUid={targetUid} targetName={displayName} onBlock={handleBlock} onReport={handleReport} />
          </div>
        )}
      </div>

      {/* Private account content gate */}
      {isContentHidden ? (
        <div style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#f1f5f9', marginBottom: 8 }}>This Account is Private</div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
            {followRequestSent ? 'Your follow request is pending approval.' : 'Follow this account to see their photos and videos.'}
          </div>
          {!followRequestSent && (
            <button onClick={handleFollow} style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 14, padding: '12px 28px', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              🔒 Request to Follow
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto' }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => handleTabChange(tab)}
                style={{ flex: '0 0 auto', padding: '12px 16px', background: 'none', border: 'none', color: activeTab === tab ? '#f1f5f9' : '#475569', fontSize: 13, fontWeight: activeTab === tab ? 700 : 500, cursor: 'pointer', borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tabLoading ? (
            <TabSkeleton rows={4} />
          ) : activeTab === 'Posts' ? (
            !postsLoaded ? <TabSkeleton rows={3} /> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2 }}>
                {posts.map(item => (
                  <div key={item.id} onClick={() => navigate(`/post/${item.id}`)}
                    style={{ aspectRatio: '1', background: item.imageUrl ? 'none' : (item.color || '#1e293b'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      : item.emoji || '📸'}
                    {/* NEW-P09: Pinned badge */}
                    {(profile?.pinnedPosts || []).includes(item.id) && (
                      <div style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(99,102,241,0.9)', borderRadius: 6, padding: '2px 6px', fontSize: 10, color: '#fff', fontWeight: 700 }}>📌</div>
                    )}
                  </div>
                ))}
                {posts.length === 0 && (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 24px', color: '#475569' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
                    <div style={{ color: '#64748b', fontWeight: 600 }}>No posts yet</div>
                    {isOwn && <button onClick={() => navigate('/post/create')} style={{ marginTop: 16, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 12, padding: '10px 20px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Create First Post</button>}
                  </div>
                )}
              </div>
            )
          ) : activeTab === 'Reels' ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#475569' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
              <div style={{ color: '#64748b', fontWeight: 600 }}>No reels yet</div>
            </div>
          ) : activeTab === 'Tagged' ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#475569' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏷️</div>
              <div style={{ color: '#64748b', fontWeight: 600 }}>No tagged posts</div>
            </div>
          ) : activeTab === 'Liked' ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#475569' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
              <div style={{ color: '#64748b', fontWeight: 600 }}>No liked posts</div>
            </div>
          ) : activeTab === 'Clips' ? (
            !clipsLoaded ? <TabSkeleton rows={3} /> :
            clips.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✂️</div>
                <div style={{ color: '#64748b', fontWeight: 600 }}>No clips yet</div>
                {isOwn && <button onClick={() => navigate('/live/setup')} style={{ marginTop: 16, background: 'linear-gradient(135deg,#ef4444,#f59e0b)', border: 'none', borderRadius: 12, padding: '10px 20px', color: 'white', fontWeight: 700, cursor: 'pointer' }}>🔴 Start a Live Stream</button>}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 2, padding: '2px' }}>
                {clips.map(clip => (
                  <div key={clip.id} onClick={() => navigate(`/live/watch/${clip.streamId}?t=${clip.startTime}`)}
                    style={{ position: 'relative', aspectRatio: '16/9', background: '#1e293b', overflow: 'hidden', cursor: 'pointer' }}>
                    {clip.thumbnailUrl
                      ? <img src={clip.thumbnailUrl} alt={clip.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1e293b,#334155)', fontSize: '28px' }}>✂️</div>}
                    {clip.durationSeconds && (
                      <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.8)', borderRadius: '4px', padding: '1px 5px', color: 'white', fontSize: '10px', fontWeight: 600 }}>
                        {Math.floor(clip.durationSeconds / 60)}:{String(clip.durationSeconds % 60).padStart(2, '0')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : null}
        </>
      )}
    </div>
  );
}
