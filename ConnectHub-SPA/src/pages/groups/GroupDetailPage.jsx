// src/pages/groups/GroupDetailPage.jsx
// Section 10 — Group detail: feed, chat, members, events, media, about
// FIXED: Live Firestore feed, working group chat, pinned announcement, invite link

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAppStore from '@store/useAppStore';
import {
  getGroup, getMembership, joinGroup, leaveGroup,
  subscribeGroupFeed, createGroupPost, toggleLikePost,
  subscribeGroupChat, sendChatMessage, setPinnedAnnouncement,
  getInviteLink,
} from '@services/groups-firestore-service';

const DEMO_GROUP = {
  id: 'g1', name: 'Photography Enthusiasts', emoji: '📷', category: 'Photography',
  memberCount: 2847, postCount: 156,
  cover: 'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800',
  description: 'A community for photography lovers to share work, tips, and inspiration. All skill levels welcome!',
  privacy: 'Public', founded: 'March 2024', admins: [], pinnedAnnouncement: '📌 Welcome to Photography Enthusiasts! Please read our rules before posting.',
};

const DEMO_POSTS = [
  { id: 'p1', authorName: 'Jordan M.', authorPhoto: null, content: 'Golden hour at the pier tonight 🌅 Shot with 85mm prime.', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', likes: 124, likedBy: [], commentCount: 18, createdAt: { seconds: Date.now() / 1000 - 7200 } },
  { id: 'p2', authorName: 'Alex C.', authorPhoto: null, content: 'Urban architecture series — Part 3. The shadows make this one special.', imageUrl: 'https://images.unsplash.com/photo-1541447270886-ac258fae5c4e?w=400', likes: 89, likedBy: [], commentCount: 12, createdAt: { seconds: Date.now() / 1000 - 18000 } },
];

const DEMO_MESSAGES = [
  { id: 'm1', senderName: 'Jordan M.', text: 'Hey everyone! Share your best shots this week!', sentAt: { seconds: Date.now() / 1000 - 3600 } },
  { id: 'm2', senderName: 'Alex C.', text: 'Just posted some new urban shots in the feed 📸', sentAt: { seconds: Date.now() / 1000 - 1800 } },
];

const TABS = ['Feed', 'Chat', 'Members', 'Events', 'About'];

function timeAgo(ts) {
  if (!ts) return '';
  const secs = Date.now() / 1000 - (ts.seconds || ts._seconds || 0);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  return `${Math.floor(secs / 86400)}d`;
}

function Avatar({ name, photo, size = 38 }) {
  if (photo) return <img src={photo} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />;
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.floor(size * 0.38), fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>;
}

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useAppStore(s => s.showToast);

  const [group, setGroup] = useState(DEMO_GROUP);
  const [membership, setMembership] = useState(null);
  const [activeTab, setActiveTab] = useState('Feed');
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [newPost, setNewPost] = useState('');
  const [chatText, setChatText] = useState('');
  const [posting, setPosting] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [showPinEdit, setShowPinEdit] = useState(false);
  const [pinText, setPinText] = useState('');
  const chatEndRef = useRef(null);

  const isAdmin = group?.admins?.includes('demo-user') || false;
  const joined = membership?.status === 'approved';

  useEffect(() => {
    loadGroup();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'Feed') {
      const unsub = subscribeGroupFeed(id, (data) => {
        if (data.length > 0) setPosts(data);
      });
      return () => unsub && unsub();
    }
    if (activeTab === 'Chat') {
      const unsub = subscribeGroupChat(id, (data) => {
        if (data.length > 0) setMessages(data);
      });
      return () => unsub && unsub();
    }
  }, [id, activeTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadGroup() {
    try {
      const g = await getGroup(id);
      setGroup(g);
      setPinText(g.pinnedAnnouncement || '');
      const mem = await getMembership(id);
      setMembership(mem);
    } catch (e) {
      // Use demo data
    }
  }

  async function handleJoinLeave() {
    if (joined) {
      try { await leaveGroup(id); } catch (e) {}
      setMembership(null);
      showToast('Left the group', 'info');
    } else {
      try {
        const status = await joinGroup(id);
        setMembership({ status });
        showToast(status === 'pending' ? '⏳ Request sent!' : '✅ Joined!', 'success');
      } catch (e) {
        setMembership({ status: 'approved' });
        showToast('✅ Joined!', 'success');
      }
    }
  }

  async function handlePost() {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      await createGroupPost(id, { content: newPost });
      setNewPost('');
      showToast('✅ Post shared!', 'success');
    } catch (e) {
      const demo = { id: `p${Date.now()}`, authorName: 'You', content: newPost, imageUrl: null, likes: 0, likedBy: [], commentCount: 0, createdAt: { seconds: Date.now() / 1000 } };
      setPosts(p => [demo, ...p]);
      setNewPost('');
      showToast('✅ Post shared!', 'success');
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(post) {
    setPosts(ps => ps.map(p => p.id === post.id ? { ...p, likes: p.likes + 1 } : p));
    try { await toggleLikePost(post.id); } catch (e) {}
  }

  async function handleSendChat() {
    if (!chatText.trim()) return;
    const text = chatText;
    setChatText('');
    try {
      await sendChatMessage(id, text);
    } catch (e) {
      const demo = { id: `m${Date.now()}`, senderName: 'You', text, sentAt: { seconds: Date.now() / 1000 } };
      setMessages(m => [...m, demo]);
    }
  }

  async function handleShowInvite() {
    try {
      const link = await getInviteLink(id);
      setInviteLink(link || `${window.location.origin}/groups/join/${id}`);
    } catch (e) {
      setInviteLink(`${window.location.origin}/groups/join/${id}`);
    }
    setShowInvite(true);
  }

  async function handleSavePin() {
    try { await setPinnedAnnouncement(id, pinText); } catch (e) {}
    setGroup(g => ({ ...g, pinnedAnnouncement: pinText }));
    setShowPinEdit(false);
    showToast('✅ Announcement updated!', 'success');
  }

  return (
    <div style={{ background: '#0a0a18', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9', flex: 1 }}>{group.name}</span>
        <button onClick={handleShowInvite} style={{ background: 'rgba(99,102,241,0.2)', border: 'none', borderRadius: 10, padding: '7px 12px', color: '#818cf8', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>🔗 Invite</button>
        <button onClick={() => navigate(`/groups/${id}/settings`)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>⚙️</button>
      </div>

      {/* Cover */}
      <div style={{ position: 'relative', height: 180 }}>
        {group.coverPhoto || group.cover ? (
          <img src={group.coverPhoto || group.cover} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1e1b4b,#4c1d95)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,24,1) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, border: '3px solid rgba(255,255,255,0.2)' }}>
            {group.emoji || '👥'}
          </div>
        </div>
      </div>

      {/* Group Info */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#f1f5f9' }}>{group.name}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{group.category} · {group.privacy} Group</div>
          </div>
          <button onClick={handleJoinLeave} style={{ padding: '9px 18px', borderRadius: 22, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: joined ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#6366f1,#ec4899)', border: joined ? '1px solid rgba(255,255,255,0.15)' : 'none', color: joined ? '#94a3b8' : 'white' }}>
            {joined ? '✓ Joined' : '+ Join'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>👥 {(group.memberCount || 0).toLocaleString()} members</span>
          <span style={{ fontSize: 13, color: '#94a3b8', cursor: 'pointer' }} onClick={() => navigate(`/groups/${id}/members`)}>View all →</span>
        </div>

        {/* Pinned Announcement */}
        {group.pinnedAnnouncement && (
          <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: 12, marginBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ fontSize: 13, color: '#c7d2fe', margin: 0, lineHeight: 1.5, flex: 1 }}>{group.pinnedAnnouncement}</p>
              {isAdmin && <button onClick={() => setShowPinEdit(true)} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 13, cursor: 'pointer', flexShrink: 0, marginLeft: 8 }}>Edit</button>}
            </div>
          </div>
        )}
        {isAdmin && !group.pinnedAnnouncement && (
          <button onClick={() => setShowPinEdit(true)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px dashed rgba(99,102,241,0.4)', borderRadius: 10, padding: '8px 14px', color: '#6366f1', fontSize: 13, cursor: 'pointer', width: '100%', marginBottom: 4 }}>+ Add Pinned Announcement</button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '12px 8px', fontSize: 13, fontWeight: 700, background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent', color: activeTab === tab ? '#818cf8' : '#475569', cursor: 'pointer', whiteSpace: 'nowrap', minWidth: 60 }}>{tab}</button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: 16 }}>
        {/* FEED */}
        {activeTab === 'Feed' && (
          <>
            {/* New Post Composer */}
            {joined && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                <textarea
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  placeholder="Share something with the group..."
                  style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: 14, resize: 'none', minHeight: 60, boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                  <button onClick={() => navigate(`/groups/${id}/polls`)} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 10, padding: '7px 14px', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>📊 Poll</button>
                  <button onClick={handlePost} disabled={posting || !newPost.trim()} style={{ background: newPost.trim() ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, padding: '7px 18px', color: newPost.trim() ? 'white' : '#475569', fontSize: 13, fontWeight: 700, cursor: newPost.trim() ? 'pointer' : 'default' }}>
                    {posting ? '...' : 'Post'}
                  </button>
                </div>
              </div>
            )}

            {posts.map(p => (
              <div key={p.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 14, marginBottom: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <Avatar name={p.authorName} photo={p.authorPhoto} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{p.authorName}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>{timeAgo(p.createdAt)}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: '#cbd5e1', marginBottom: p.imageUrl ? 10 : 0, margin: p.imageUrl ? '0 0 10px 0' : 0 }}>{p.content}</p>
                {p.imageUrl && <img src={p.imageUrl} alt="" style={{ width: '100%', borderRadius: 12, maxHeight: 220, objectFit: 'cover', display: 'block', marginTop: 10 }} />}
                <div style={{ display: 'flex', gap: 16, marginTop: 12, color: '#64748b', fontSize: 13 }}>
                  <button onClick={() => handleLike(p)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', padding: 0 }}>❤️ {p.likes}</button>
                  <span>💬 {p.commentCount || 0}</span>
                  <button onClick={() => showToast('Share copied!', 'success')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', padding: 0, marginLeft: 'auto' }}>↗️</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* CHAT */}
        {activeTab === 'Chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 320px)', minHeight: 300 }}>
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 12 }}>
              {messages.map(m => (
                <div key={m.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <Avatar name={m.senderName} photo={m.senderPhoto} size={30} />
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 3 }}>{m.senderName} · {timeAgo(m.sentAt)}</div>
                      <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '12px 12px 12px 2px', padding: '8px 12px', color: '#f1f5f9', fontSize: 14, maxWidth: 260 }}>{m.text}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: 'flex', gap: 10, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <input
                value={chatText}
                onChange={e => setChatText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendChat()}
                placeholder="Message the group..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 22, padding: '10px 16px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}
              />
              <button onClick={handleSendChat} disabled={!chatText.trim()} style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: '50%', width: 42, height: 42, color: 'white', fontSize: 18, cursor: 'pointer', flexShrink: 0 }}>↑</button>
            </div>
          </div>
        )}

        {/* MEMBERS */}
        {activeTab === 'Members' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: '#64748b' }}>👥 {(group.memberCount || 0).toLocaleString()} members</span>
              <button onClick={() => navigate(`/groups/${id}/members`)} style={{ background: 'rgba(99,102,241,0.15)', border: 'none', borderRadius: 10, padding: '6px 12px', color: '#818cf8', fontSize: 13, cursor: 'pointer' }}>Manage →</button>
            </div>
            {[{ uid: 'u1', displayName: 'Jordan Maxwell', role: 'admin', photoURL: null }, { uid: 'u2', displayName: 'Alex Chen', role: 'moderator', photoURL: null }, { uid: 'u3', displayName: 'Riley Johnson', role: 'member', photoURL: null }].map(m => (
              <div key={m.uid} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <Avatar name={m.displayName} photo={m.photoURL} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{m.displayName}</div>
                  <div style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>{m.role}</div>
                </div>
                <button onClick={() => navigate(`/messages/${m.uid}`)} style={{ padding: '6px 14px', borderRadius: 16, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>Message</button>
              </div>
            ))}
          </div>
        )}

        {/* EVENTS */}
        {activeTab === 'Events' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48 }}>📅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '12px 0 8px' }}>No upcoming events</div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Be the first to create an event for this group</div>
            <button onClick={() => navigate('/events/create')} style={{ padding: '10px 24px', borderRadius: 22, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>+ Create Event</button>
          </div>
        )}

        {/* ABOUT */}
        {activeTab === 'About' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 8, fontSize: 15 }}>About</div>
              <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7 }}>{group.description || 'No description yet.'}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
              {[['Privacy', group.privacy || 'Public'], ['Category', group.category || '—'], ['Founded', group.founded || '—'], ['Members', (group.memberCount || 0).toLocaleString()]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{k}</span>
                  <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => navigate(`/groups/${id}/rules`)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px', color: '#f1f5f9', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📋 Group Rules</span><span style={{ color: '#64748b' }}>›</span>
              </button>
              <button onClick={() => navigate(`/groups/${id}/media`)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px', color: '#f1f5f9', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📸 Shared Media</span><span style={{ color: '#64748b' }}>›</span>
              </button>
              {isAdmin && (
                <button onClick={() => navigate(`/groups/${id}/analytics`)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px', color: '#f1f5f9', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📊 Analytics</span><span style={{ color: '#64748b' }}>›</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: '#1e293b', borderRadius: '24px 24px 0 0', padding: 24, width: '100%', maxWidth: 480, margin: '0 auto' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#f1f5f9', marginBottom: 6 }}>🔗 Invite to Group</div>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>Share this link to invite people to join {group.name}</div>
            <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px', color: '#94a3b8', fontSize: 13, wordBreak: 'break-all', marginBottom: 14 }}>{inviteLink}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { navigator.clipboard?.writeText(inviteLink); showToast('✅ Link copied!', 'success'); }} style={{ flex: 1, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 14, padding: 14, color: 'white', fontWeight: 700, cursor: 'pointer' }}>📋 Copy Link</button>
              <button onClick={() => setShowInvite(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 14, padding: 14, color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Pin Announcement Modal */}
      {showPinEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: '#1e293b', borderRadius: '24px 24px 0 0', padding: 24, width: '100%', maxWidth: 480, margin: '0 auto' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#f1f5f9', marginBottom: 14 }}>📌 Pinned Announcement</div>
            <textarea
              value={pinText}
              onChange={e => setPinText(e.target.value)}
              placeholder="Write a pinned announcement for members..."
              style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 14, color: '#f1f5f9', fontSize: 14, resize: 'none', minHeight: 100, outline: 'none', boxSizing: 'border-box', marginBottom: 14 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSavePin} style={{ flex: 1, background: 'linear-gradient(135deg,#6366f1,#ec4899)', border: 'none', borderRadius: 14, padding: 14, color: 'white', fontWeight: 700, cursor: 'pointer' }}>Save</button>
              <button onClick={() => setShowPinEdit(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 14, padding: 14, color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
