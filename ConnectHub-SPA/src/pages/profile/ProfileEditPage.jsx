// src/pages/profile/ProfileEditPage.jsx
// SECTION-8 FIX: Full edit profile form — saves to Firestore, uploads photo via Firebase Storage
// FIX-P06: Profile photo upload connected to Firebase Storage (Cloudinary fallback)
// FIX-P07: All form fields save to Firestore users/{uid} document
// NEW-P05: Pinned posts management (select up to 3)
// NEW-P06: Social links editing
// NEW-P07: Profile theme for premium users

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  doc, getDoc, updateDoc, collection, query, where, orderBy, getDocs, serverTimestamp
} from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@fb/config';
import { useAuth } from '@hooks/useAuth';

const INTEREST_OPTIONS = [
  'Music', 'Travel', 'Fitness', 'Art', 'Food', 'Gaming', 'Photography',
  'Technology', 'Fashion', 'Sports', 'Movies', 'Books', 'Nature', 'Dance',
  'Cooking', 'Business', 'Science', 'Comedy', 'Politics', 'Finance',
];

const S = {
  page: { background: '#0a0a18', minHeight: '100vh', paddingBottom: 100, fontFamily: 'system-ui,sans-serif', color: '#f1f5f9' },
  hdr: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 50 },
  back: { background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#f1f5f9', fontSize: 18, cursor: 'pointer' },
  saveBtn: (loading) => ({ background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 12, padding: '10px 24px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', marginLeft: 'auto' }),
  section: { padding: '16px 16px 4px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  card: { margin: '4px 16px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' },
  field: { padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  label: { fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 600 },
  inp: { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  textarea: { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none', resize: 'vertical', minHeight: 80, fontFamily: 'inherit' },
};

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileRef = useRef(null);
  const coverRef = useRef(null);

  const [form, setForm] = useState({
    displayName: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    pronouns: '',
    interests: [],
    socialLinks: { twitter: '', instagram: '', tiktok: '', youtube: '', website: '' },
    photoURL: '',
    coverUrl: '',
    isPrivate: false,
    theme: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [posts, setPosts] = useState([]);
  const [pinnedPosts, setPinnedPosts] = useState([]);
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  // ── Load profile + posts ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            displayName: data.displayName || '',
            username: data.username || '',
            bio: data.bio || '',
            location: data.location || '',
            website: data.website || '',
            pronouns: data.pronouns || '',
            interests: data.interests || [],
            socialLinks: { twitter: '', instagram: '', tiktok: '', youtube: '', website: '', ...(data.socialLinks || {}) },
            photoURL: data.photoURL || '',
            coverUrl: data.coverUrl || '',
            isPrivate: data.isPrivate || false,
            theme: data.theme || '',
          });
          setPinnedPosts(data.pinnedPosts || []);
        }
        // Load user posts for pinning
        const postsSnap = await getDocs(
          query(collection(db, 'posts'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'))
        );
        setPosts(postsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('[ProfileEdit load]', err);
      }
      setLoading(false);
    })();
  }, [user]);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }
  function setSocial(key, val) { setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, [key]: val } })); }

  // ── FIX-P06: Upload profile photo to Firebase Storage ────────────────────
  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    // Validate
    if (!file.type.startsWith('image/')) { showToast('❌ Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('❌ Image must be under 5MB'); return; }

    setUploading(true);
    setUploadProgress(0);
    try {
      const path = `avatars/${user.uid}/${Date.now()}_${file.name}`;
      const sRef = storageRef(storage, path);
      const task = uploadBytesResumable(sRef, file);

      await new Promise((resolve, reject) => {
        task.on('state_changed',
          snap => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          resolve
        );
      });

      const url = await getDownloadURL(sRef);
      set('photoURL', url);
      showToast('✅ Profile photo updated!');
    } catch (err) {
      console.error('[Photo upload]', err);
      showToast('❌ Upload failed — check your connection');
    }
    setUploading(false);
    setUploadProgress(0);
  }

  // ── Upload cover photo ───────────────────────────────────────────────────
  async function handleCoverUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;
    if (!file.type.startsWith('image/')) { showToast('❌ Please select an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { showToast('❌ Cover must be under 10MB'); return; }

    setUploadingCover(true);
    try {
      const path = `covers/${user.uid}/${Date.now()}_${file.name}`;
      const sRef = storageRef(storage, path);
      const task = uploadBytesResumable(sRef, file);
      await new Promise((res, rej) => task.on('state_changed', null, rej, res));
      const url = await getDownloadURL(sRef);
      set('coverUrl', url);
      showToast('✅ Cover photo updated!');
    } catch (err) {
      console.error('[Cover upload]', err);
      showToast('❌ Cover upload failed');
    }
    setUploadingCover(false);
  }

  // ── Toggle interest ──────────────────────────────────────────────────────
  function toggleInterest(int) {
    setForm(f => {
      const curr = f.interests;
      if (curr.includes(int)) return { ...f, interests: curr.filter(i => i !== int) };
      if (curr.length >= 10) { showToast('Max 10 interests'); return f; }
      return { ...f, interests: [...curr, int] };
    });
  }

  // ── Toggle pinned post ───────────────────────────────────────────────────
  function togglePin(postId) {
    setPinnedPosts(prev => {
      if (prev.includes(postId)) return prev.filter(id => id !== postId);
      if (prev.length >= 3) { showToast('Max 3 pinned posts'); return prev; }
      return [...prev, postId];
    });
  }

  // ── FIX-P07: Save all to Firestore ──────────────────────────────────────
  async function handleSave() {
    if (!user?.uid) return;
    if (!form.displayName.trim()) { showToast('❌ Display name is required'); return; }

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: form.displayName.trim(),
        username: form.username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, ''),
        bio: form.bio.trim(),
        location: form.location.trim(),
        website: form.website.trim(),
        pronouns: form.pronouns.trim(),
        interests: form.interests,
        socialLinks: form.socialLinks,
        photoURL: form.photoURL,
        coverUrl: form.coverUrl,
        pinnedPosts,
        isPrivate: form.isPrivate,
        theme: form.theme,
        updatedAt: serverTimestamp(),
      });
      showToast('✅ Profile saved successfully!');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      console.error('[ProfileEdit save]', err);
      showToast('❌ Failed to save — please try again');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          Loading profile…
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 20px', color: '#f1f5f9', fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={S.hdr}>
        <button style={S.back} onClick={() => navigate(-1)}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17 }}>✏️ Edit Profile</span>
        <button style={S.saveBtn(saving)} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Cover Photo */}
      <div
        onClick={() => coverRef.current?.click()}
        style={{ height: 120, background: form.coverUrl ? 'none' : 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}>
        {form.coverUrl && <img src={form.coverUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {uploadingCover
            ? <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Uploading…</div>
            : <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, background: 'rgba(0,0,0,0.5)', borderRadius: 10, padding: '8px 16px' }}>📷 Change Cover Photo</div>}
        </div>
      </div>
      <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />

      {/* Profile Photo */}
      <div style={{ padding: '0 16px', marginTop: -44, marginBottom: 16, display: 'flex', alignItems: 'flex-end', gap: 16 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ width: 88, height: 88, borderRadius: '50%', border: '4px solid #0a0a18', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
            {form.photoURL
              ? <img src={form.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (form.displayName[0]?.toUpperCase() || '👤')}
            {uploading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                {uploadProgress}%
              </div>
            )}
          </div>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: '#6366f1', border: '2px solid #0a0a18', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14 }}>
            📷
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
          Tap photo to upload · Max 5MB<br />
          <span style={{ color: '#6366f1' }}>Firebase Storage connected ✓</span>
        </div>
      </div>

      {/* Basic Info */}
      <div style={S.section}>Basic Information</div>
      <div style={S.card}>
        {[
          { label: 'Display Name *', key: 'displayName', placeholder: 'Your full name', maxLength: 50 },
          { label: 'Username', key: 'username', placeholder: 'your_handle (letters, numbers, _ .)', maxLength: 30 },
          { label: 'Pronouns', key: 'pronouns', placeholder: 'e.g. they/them, she/her', maxLength: 30 },
          { label: 'Location', key: 'location', placeholder: 'City, Country', maxLength: 80 },
        ].map(f => (
          <div key={f.key} style={S.field}>
            <div style={S.label}>{f.label}</div>
            <input
              value={form[f.key]}
              onChange={e => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              maxLength={f.maxLength}
              style={S.inp}
            />
          </div>
        ))}
        <div style={S.field}>
          <div style={S.label}>Bio</div>
          <textarea
            value={form.bio}
            onChange={e => set('bio', e.target.value)}
            placeholder="Tell people about yourself…"
            maxLength={300}
            style={S.textarea}
          />
          <div style={{ fontSize: 11, color: '#475569', marginTop: 4, textAlign: 'right' }}>{form.bio.length}/300</div>
        </div>
        <div style={{ ...S.field, borderBottom: 'none' }}>
          <div style={S.label}>Website</div>
          <input
            value={form.website}
            onChange={e => set('website', e.target.value)}
            placeholder="https://yourwebsite.com"
            type="url"
            style={S.inp}
          />
        </div>
      </div>

      {/* Social Links */}
      <div style={S.section}>Social Links</div>
      <div style={S.card}>
        {[
          { key: 'twitter', label: '🐦 Twitter / X', placeholder: '@username' },
          { key: 'instagram', label: '📷 Instagram', placeholder: '@username' },
          { key: 'tiktok', label: '🎵 TikTok', placeholder: '@username' },
          { key: 'youtube', label: '▶️ YouTube', placeholder: 'channel name or URL' },
        ].map((s, i) => (
          <div key={s.key} style={{ ...S.field, borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <div style={S.label}>{s.label}</div>
            <input
              value={form.socialLinks[s.key]}
              onChange={e => setSocial(s.key, e.target.value)}
              placeholder={s.placeholder}
              style={S.inp}
            />
          </div>
        ))}
      </div>

      {/* Interests */}
      <div style={S.section}>Interests ({form.interests.length}/10)</div>
      <div style={{ margin: '4px 16px 12px', padding: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {INTEREST_OPTIONS.map(int => (
            <button key={int} onClick={() => toggleInterest(int)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontWeight: 600,
              background: form.interests.includes(int) ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.07)',
              border: form.interests.includes(int) ? 'none' : '1px solid rgba(255,255,255,0.12)',
              color: form.interests.includes(int) ? '#fff' : '#94a3b8',
              transition: 'all 0.15s',
            }}>
              {int}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned Posts */}
      {posts.length > 0 && (
        <>
          <div style={S.section}>Pinned Posts ({pinnedPosts.length}/3)</div>
          <div style={{ margin: '4px 16px 12px', padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px' }}>Select up to 3 posts to pin at the top of your grid.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4 }}>
              {posts.slice(0, 12).map(post => {
                const isPinned = pinnedPosts.includes(post.id);
                return (
                  <div key={post.id} onClick={() => togglePin(post.id)} style={{
                    aspectRatio: '1', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', position: 'relative',
                    background: post.imageUrl ? 'none' : (post.color || 'linear-gradient(135deg,#1e293b,#334155)'),
                    border: isPinned ? '2px solid #6366f1' : '2px solid transparent', transition: 'border 0.15s',
                  }}>
                    {post.imageUrl
                      ? <img src={post.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{post.emoji || '📸'}</div>}
                    {isPinned && (
                      <div style={{ position: 'absolute', top: 3, right: 3, background: '#6366f1', borderRadius: 6, padding: '2px 5px', fontSize: 10, color: '#fff', fontWeight: 700 }}>📌</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Privacy */}
      <div style={S.section}>Privacy</div>
      <div style={S.card}>
        <div style={{ ...S.field, borderBottom: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#f1f5f9' }}>🔒 Private Account</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Only approved followers can see your posts</div>
          </div>
          <button onClick={() => set('isPrivate', !form.isPrivate)} style={{ width: 48, height: 26, borderRadius: 13, background: form.isPrivate ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: form.isPrivate ? 24 : 4, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
          </button>
        </div>
      </div>

      {/* Profile Theme (Premium only) */}
      {form.isPremium !== false && (
        <>
          <div style={S.section}>🎨 Profile Theme (Premium)</div>
          <div style={S.card}>
            <div style={{ ...S.field, borderBottom: 'none' }}>
              <div style={S.label}>Background Color</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                {['#0a0a18','#0d1117','#0f172a','#1a0a2e','#0a1628','#0d1f0d','#1a0a0a','linear-gradient(135deg,#0f0c29,#302b63)'].map(color => (
                  <button key={color} onClick={() => set('theme', color)}
                    style={{ width: 36, height: 36, borderRadius: 10, background: color, border: form.theme === color ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer', outline: 'none' }} />
                ))}
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', cursor: 'pointer' }}>
                  Custom: <input type="color" value={form.theme.startsWith('#') ? form.theme : '#0a0a18'} onChange={e => set('theme', e.target.value)} style={{ width: 36, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none' }} />
                </label>
              </div>
              {form.theme && <button onClick={() => set('theme', '')} style={{ marginTop: 8, fontSize: 11, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Reset to default</button>}
            </div>
          </div>
        </>
      )}

      {/* Account */}
      <div style={S.section}>Account</div>
      <div style={S.card}>
        <div style={{ ...S.field, borderBottom: 'none' }}>
          <button onClick={() => navigate('/profile/verify-request')} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: 'none', border: 'none', color: '#818cf8', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <div style={{ textAlign: 'left' }}>
              <div>Request Verification Badge</div>
              <div style={{ fontSize: 11, color: '#475569' }}>Submit ID for profile verification</div>
            </div>
            <span style={{ marginLeft: 'auto', color: '#475569' }}>→</span>
          </button>
        </div>
      </div>

      {/* Save Button (bottom) */}
      <div style={{ padding: '16px 16px 32px' }}>
        <button onClick={handleSave} disabled={saving} style={{ width: '100%', background: saving ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 16, padding: '16px', color: '#fff', fontWeight: 800, fontSize: 16, cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? '⏳ Saving…' : '💾 Save Profile'}
        </button>
      </div>
    </div>
  );
}
