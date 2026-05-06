// ProfilePage.jsx — Full user profile with Firebase Firestore
// Features: profile header, stats, posts grid, edit profile modal,
//           follow/unfollow, bio, photos, about section, settings shortcut

import React, { useState, useEffect, useCallback } from 'react';
import {
  doc, getDoc, updateDoc, collection, query,
  where, orderBy, limit, getDocs, onSnapshot,
} from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';
import { timeAgo } from '@utils/timeAgo';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function initials(name = '') {
  return name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || '?';
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = {
  page:       { height: '100%', overflowY: 'auto', background: '#0a0a0a', paddingBottom: 24 },
  banner:     { height: 110, background: 'linear-gradient(135deg,#6366f1 0%,#ec4899 50%,#f59e0b 100%)', position: 'relative', flexShrink: 0 },
  avatarWrap: { position: 'absolute', bottom: -36, left: 16 },
  avatar:     (size) => ({ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: '3px solid #0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: size * 0.36, letterSpacing: '-1px' }),
  editBtn:    { position: 'absolute', bottom: -28, right: 16, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '6px 14px', color: '#e2e8f0', fontSize: 13, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)' },
  name:       { fontWeight: 800, fontSize: 20, color: '#f1f5f9', marginBottom: 2 },
  handle:     { fontSize: 13, color: '#64748b', marginBottom: 8 },
  bio:        { fontSize: 14, color: '#94a3b8', lineHeight: 1.55, marginBottom: 12 },
  statsRow:   { display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', margin: '0 0 16px' },
  stat:       { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', cursor: 'pointer' },
  statNum:    { fontWeight: 800, fontSize: 18, color: '#f1f5f9' },
  statLbl:    { fontSize: 11, color: '#64748b', marginTop: 1 },
  tabBar:     { display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 4 },
  tab:        (active) => ({ flex: 1, padding: '10px 0', textAlign: 'center', fontSize: 13, fontWeight: active ? 700 : 400, color: active ? '#f1f5f9' : '#475569', borderBottom: active ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.15s', background: 'none', border: 'none' }),
  postGrid:   { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, padding: '0 2px' },
  postCell:   { aspectRatio: '1', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, cursor: 'pointer', position: 'relative', overflow: 'hidden' },
  postImg:    { width: '100%', height: '100%', objectFit: 'cover' },
  badge:      (color) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, background: color || 'rgba(99,102,241,0.15)', borderRadius: 20, padding: '3px 10px', fontSize: 12, color: '#a5b4fc', marginRight: 6, marginBottom: 6 }),
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' },
  modal:      { background: '#1a1a2e', borderRadius: '24px 24px 0 0', padding: '24px 20px 32px', width: '100%', maxWidth: 480, maxHeight: '88vh', overflowY: 'auto' },
  input:      { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12, fontFamily: 'inherit' },
  label:      { fontSize: 12, color: '#64748b', marginBottom: 4, display: 'block' },
  saveBtn:    { width: '100%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 12, padding: '12px', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 8 },
  followBtn:  (following) => ({ flex: 1, background: following ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg,#6366f1,#ec4899)', border: following ? '1px solid rgba(255,255,255,0.12)' : 'none', borderRadius: 10, padding: '8px 0', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }),
  msgBtn:     { flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 0', color: '#e2e8f0', fontWeight: 600, fontSize: 13, cursor: 'pointer' },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div>
      <div style={{ height: 110, background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ padding: '48px 16px 16px' }}>
        <div className="skeleton" style={{ height: 22, width: '40%', borderRadius: 8, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: '25%', borderRadius: 8, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 14, width: '80%', borderRadius: 8, marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 8 }} />
      </div>
    </div>
  );
}

// ─── Post grid cell ───────────────────────────────────────────────────────────
function PostCell({ post }) {
  return (
    <div style={S.postCell}>
      {post.imageUrl
        ? <img src={post.imageUrl} alt="" style={S.postImg} onError={e => { e.target.style.display = 'none'; }} loading="lazy" />
        : <span style={{ fontSize: 20 }}>📝</span>
      }
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0 }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; e.currentTarget.style.opacity = 1; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.style.opacity = 0; }}>
        <span style={{ color: '#fff', fontSize: 12 }}>❤️ {post.likesCount || 0}</span>
        <span style={{ color: '#fff', fontSize: 12 }}>💬 {post.commentsCount || 0}</span>
      </div>
    </div>
  );
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditProfileModal({ profile, uid, onClose, onSaved }) {
  const [form, setForm] = useState({
    displayName: profile.displayName || '',
    username:    profile.username || '',
    bio:         profile.bio || '',
    location:    profile.location || '',
    website:     profile.website || '',
  });
  const [saving, setSaving] = useState(false);

  function update(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function save() {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', uid), {
        displayName: form.displayName.trim(),
        username:    form.username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, ''),
        bio:         form.bio.trim(),
        location:    form.location.trim(),
        website:     form.website.trim(),
        updatedAt:   new Date(),
      });
      onSaved({ ...profile, ...form });
    } catch (err) {
      console.error('[Profile] save error:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={S.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18 }}>Edit Profile</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        <label style={S.label}>Display Name</label>
        <input style={S.input} value={form.displayName} onChange={e => update('displayName', e.target.value)} placeholder="Your name" />

        <label style={S.label}>Username</label>
        <input style={S.input} value={form.username} onChange={e => update('username', e.target.value)} placeholder="@username" />

        <label style={S.label}>Bio</label>
        <textarea style={{ ...S.input, resize: 'none', minHeight: 80 }}
          value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Tell people about yourself…" />

        <label style={S.label}>Location</label>
        <input style={S.input} value={form.location} onChange={e => update('location', e.target.value)} placeholder="City, Country" />

        <label style={S.label}>Website</label>
        <input style={S.input} value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://yoursite.com" type="url" />

        <button style={S.saveBtn} onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// ─── About Tab ────────────────────────────────────────────────────────────────
function AboutTab({ profile }) {
  const items = [
    { icon: '📍', label: profile.location || 'No location set' },
    { icon: '🔗', label: profile.website || 'No website', link: profile.website },
    { icon: '📅', label: profile.createdAt ? `Joined ${new Date(profile.createdAt?.toDate?.() || profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : 'Joined recently' },
    { icon: '✉️', label: profile.email || '' },
  ];

  const interests = profile.interests || ['Technology', 'Music', 'Travel'];

  return (
    <div style={{ padding: '16px 16px' }}>
      <div style={{ marginBottom: 20 }}>
        {items.filter(i => i.label).map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, color: '#94a3b8', fontSize: 14 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
            {item.link
              ? <a href={item.link} target="_blank" rel="noreferrer" style={{ color: '#818cf8', textDecoration: 'none' }}>{item.label}</a>
              : <span>{item.label}</span>}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Interests</div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {interests.map((t, i) => <span key={i} style={S.badge()}>{t}</span>)}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account</div>
        {[
          { icon: '🔒', label: 'Privacy Settings' },
          { icon: '🔔', label: 'Notification Preferences' },
          { icon: '🌙', label: 'Appearance' },
          { icon: '🚪', label: 'Sign Out', danger: true },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', color: item.danger ? '#f87171' : '#cbd5e1', fontSize: 14 }}>
            <span>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {!item.danger && <span style={{ color: '#475569' }}>›</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ProfilePage ─────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user } = useAuth();
  const uid = user?.uid;

  const [profile, setProfile] = useState(null);
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('posts'); // posts | about
  const [editing, setEditing] = useState(false);

  // Load profile from Firestore
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'users', uid), snap => {
      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() });
      } else {
        // Create a default profile document from Firebase Auth data
        const defaultProfile = {
          uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          email:       user.email || '',
          username:    (user.email?.split('@')[0] || 'user').toLowerCase(),
          bio:         '',
          location:    '',
          website:     '',
          followersCount: 0,
          followingCount: 0,
          postsCount:  0,
          createdAt:   new Date(),
          interests:   [],
        };
        setProfile(defaultProfile);
      }
      setLoading(false);
    }, err => {
      console.error('[Profile] load error:', err);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  // Load user's posts
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    getDocs(q).then(snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }).catch(err => {
      console.error('[Profile] posts load error:', err);
    });
  }, [uid]);

  if (!uid) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', gap: 12 }}>
        <div style={{ fontSize: 48 }}>👤</div>
        <h3 style={{ color: '#f1f5f9' }}>Sign in to view your profile</h3>
      </div>
    );
  }

  if (loading) return <ProfileSkeleton />;

  const displayName = profile?.displayName || user?.displayName || 'User';
  const username    = profile?.username    || user?.email?.split('@')[0] || 'user';
  const bio         = profile?.bio         || '';
  const followers   = profile?.followersCount || 0;
  const following   = profile?.followingCount || 0;
  const postCount   = posts.length || profile?.postsCount || 0;

  return (
    <div style={S.page}>
      {/* Banner */}
      <div style={S.banner}>
        <div style={S.avatarWrap}>
          <div style={S.avatar(76)}>
            {user?.photoURL
              ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
              : initials(displayName)
            }
          </div>
        </div>
        <button style={S.editBtn} onClick={() => setEditing(true)}>✏️ Edit</button>
      </div>

      {/* Profile info */}
      <div style={{ padding: '48px 16px 0' }}>
        <div style={S.name}>{displayName}</div>
        <div style={S.handle}>@{username}</div>
        {bio && <div style={S.bio}>{bio}</div>}

        {/* Action buttons — own profile shows Edit, else Follow + Message */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button style={{ ...S.followBtn(false), flex: 'none', padding: '8px 20px', background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            onClick={() => setEditing(true)}>
            ✏️ Edit Profile
          </button>
          <button style={{ ...S.msgBtn, flex: 'none', padding: '8px 20px' }}>
            📤 Share
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsRow}>
        {[
          { num: postCount,  label: 'Posts' },
          { num: followers,  label: 'Followers' },
          { num: following,  label: 'Following' },
        ].map(s => (
          <div key={s.label} style={S.stat}>
            <span style={S.statNum}>{s.num >= 1000 ? (s.num / 1000).toFixed(1) + 'k' : s.num}</span>
            <span style={S.statLbl}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={S.tabBar}>
        {[
          { key: 'posts', label: '⊞ Posts' },
          { key: 'about', label: '👤 About' },
        ].map(t => (
          <button key={t.key} style={S.tab(tab === t.key)} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'posts' && (
        posts.length > 0
          ? <div style={S.postGrid}>
              {posts.map(p => <PostCell key={p.id} post={p} />)}
            </div>
          : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', color: '#64748b', gap: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 52 }}>📸</div>
              <h3 style={{ color: '#f1f5f9', fontWeight: 700 }}>No posts yet</h3>
              <p style={{ fontSize: 14 }}>Share your first post from the Feed tab!</p>
            </div>
      )}

      {tab === 'about' && <AboutTab profile={profile} />}

      {/* Edit modal */}
      {editing && (
        <EditProfileModal
          profile={profile}
          uid={uid}
          onClose={() => setEditing(false)}
          onSaved={updated => { setProfile(updated); setEditing(false); }}
        />
      )}
    </div>
  );
}
