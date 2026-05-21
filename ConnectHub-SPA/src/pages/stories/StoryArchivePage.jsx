// src/pages/stories/StoryArchivePage.jsx
// SECTION-3 NEW: Story Archive — /stories/archive
// Lists the current user's own stories (active + expired) from Firestore.
// Expired stories (expiresAt < now) are labelled as archived.
// Allows the user to add any story to a highlight from this screen.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, query, where, orderBy, limit,
  onSnapshot, doc, deleteDoc,
} from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';
import useAppStore from '@store/useAppStore';

// ─── Demo archive ─────────────────────────────────────────────────────────────
const now = Date.now();
const DEMO_ARCHIVE = [
  { id:'a1', content:'🎵 New music drop today!', color:'#ec4899', expiresAt:{ toDate:()=>new Date(now + 3*3600*1000) }, createdAt:{ toDate:()=>new Date(now - 21*3600*1000) }, seenBy:['u1','u2','u3'], mediaUrl:null },
  { id:'a2', content:'✈️ Tokyo vibes 🗼',         color:'#6366f1', expiresAt:{ toDate:()=>new Date(now - 2*3600*1000) }, createdAt:{ toDate:()=>new Date(now - 26*3600*1000) }, seenBy:['u1'],          mediaUrl:null },
  { id:'a3', content:'💪 Morning run complete!',  color:'#10b981', expiresAt:{ toDate:()=>new Date(now - 5*3600*1000) }, createdAt:{ toDate:()=>new Date(now - 29*3600*1000) }, seenBy:[],              mediaUrl:null },
  { id:'a4', content:'🎨 New artwork finished!',  color:'#8b5cf6', expiresAt:{ toDate:()=>new Date(now - 24*3600*1000)}, createdAt:{ toDate:()=>new Date(now - 48*3600*1000) }, seenBy:['u1','u2'],   mediaUrl:null },
  { id:'a5', content:'🍕 Best ramen in the city!',color:'#f59e0b', expiresAt:{ toDate:()=>new Date(now - 36*3600*1000)}, createdAt:{ toDate:()=>new Date(now - 60*3600*1000) }, seenBy:[],              mediaUrl:null },
];

function timeAgo(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : (date.toDate?.() ?? new Date(date));
  const diff = Date.now() - d.getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function isExpired(story) {
  const exp = story.expiresAt?.toDate?.() ?? null;
  return exp && exp < new Date();
}

export default function StoryArchivePage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const showToast = useAppStore(s => s.showToast);
  const [stories, setStories]   = useState(DEMO_ARCHIVE);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all'); // 'all' | 'active' | 'archived'
  const [deleting, setDeleting] = useState(null);

  // Load user's own stories (all, including expired)
  useEffect(() => {
    if (!db || !user) { setLoading(false); return; }
    const q = query(
      collection(db, 'stories'),
      where('authorUid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(100),
    );
    const unsub = onSnapshot(q, snap => {
      if (!snap.empty) setStories(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [user]);

  async function deleteStory(storyId) {
    setDeleting(storyId);
    try {
      if (db && user && !storyId.startsWith('a')) await deleteDoc(doc(db, 'stories', storyId));
      setStories(prev => prev.filter(s => s.id !== storyId));
      showToast('🗑️ Story deleted');
    } catch {
      setStories(prev => prev.filter(s => s.id !== storyId));
      showToast('🗑️ Story deleted (demo)');
    }
    setDeleting(null);
  }

  const filtered = stories.filter(s => {
    if (filter === 'active')   return !isExpired(s);
    if (filter === 'archived') return isExpired(s);
    return true;
  });

  const activeCount   = stories.filter(s => !isExpired(s)).length;
  const expiredCount  = stories.filter(s =>  isExpired(s)).length;

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:80 }}>
      {/* Header */}
      <div style={{ padding:'14px 16px 10px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => navigate('/stories')}
          style={{ background:'none', border:'none', color:'#94a3b8', fontSize:22, cursor:'pointer', lineHeight:1 }}>←</button>
        <div>
          <h2 style={{ color:'#f1f5f9', fontSize:18, fontWeight:800, margin:0 }}>📦 Story Archive</h2>
          <p style={{ color:'#475569', fontSize:12, margin:0 }}>
            {activeCount} active · {expiredCount} expired
          </p>
        </div>
        <button onClick={() => navigate('/stories/create')}
          style={{ marginLeft:'auto', background:'linear-gradient(135deg,#6366f1,#ec4899)',
            border:'none', borderRadius:12, padding:'8px 14px', color:'white',
            fontSize:12, fontWeight:700, cursor:'pointer' }}>
          + New
        </button>
      </div>

      {/* Info banner */}
      <div style={{ margin:'0 16px 12px', padding:'10px 14px',
        background:'rgba(99,102,241,0.08)', borderRadius:12,
        border:'1px solid rgba(99,102,241,0.15)' }}>
        <p style={{ color:'#94a3b8', fontSize:12, lineHeight:1.5, margin:0 }}>
          💡 Stories expire after 24h but remain here for your records.
          Add expired stories to a Highlight to preserve them on your profile forever.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, padding:'0 16px 14px' }}>
        {[['all',`All (${stories.length})`],['active',`Active (${activeCount})`],['archived',`Expired (${expiredCount})`]].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)}
            style={{ flex:1, padding:'8px', border:'none', borderRadius:10, fontWeight:700,
              fontSize:12, cursor:'pointer',
              background: filter===id ? '#6366f1' : 'rgba(255,255,255,0.06)',
              color: filter===id ? 'white' : '#94a3b8' }}>
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'40px', color:'#475569' }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📦</div>
          <p>Loading archive…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px 32px' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🫙</div>
          <p style={{ color:'#475569', fontSize:14 }}>No stories in this category yet.</p>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')}
              style={{ marginTop:12, background:'rgba(99,102,241,0.15)', border:'none',
                borderRadius:12, padding:'10px 20px', color:'#6366f1', fontSize:13,
                fontWeight:700, cursor:'pointer' }}>
              View All
            </button>
          )}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:2, padding:'0 16px' }}>
          {filtered.map(s => {
            const expired = isExpired(s);
            const exp = s.expiresAt?.toDate?.();
            const created = s.createdAt?.toDate?.();
            return (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0',
                borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                {/* Colour thumb */}
                <div style={{ width:52, height:52, borderRadius:12, background:s.color||'#6366f1',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:22, flexShrink:0, opacity: expired ? 0.55 : 1 }}>
                  {s.mediaUrl ? '🖼️' : '📝'}
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color: expired ? '#475569' : '#f1f5f9', fontSize:13, fontWeight:600,
                    margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {s.content || '(image story)'}
                  </p>
                  <div style={{ display:'flex', gap:10, marginTop:3 }}>
                    <span style={{ fontSize:11, color:'#334155' }}>
                      📅 {created ? timeAgo(created) : ''}
                    </span>
                    <span style={{ fontSize:11,
                      color: expired ? '#ef4444' : '#10b981',
                      fontWeight:700 }}>
                      {expired ? '⏰ Expired' : `⏳ ${exp ? Math.round((exp.getTime()-Date.now())/3600000) : '?'}h left`}
                    </span>
                    <span style={{ fontSize:11, color:'#334155' }}>
                      👁 {s.seenBy?.length ?? 0}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <button onClick={() => navigate('/stories/highlights')}
                    style={{ background:'rgba(99,102,241,0.15)', border:'none',
                      borderRadius:8, padding:'6px 10px', color:'#6366f1',
                      fontSize:11, fontWeight:700, cursor:'pointer' }}>
                    ⭐
                  </button>
                  <button onClick={() => deleteStory(s.id)}
                    disabled={deleting === s.id}
                    style={{ background:'rgba(239,68,68,0.12)', border:'none',
                      borderRadius:8, padding:'6px 10px', color:'#ef4444',
                      fontSize:11, fontWeight:700, cursor:'pointer',
                      opacity: deleting===s.id ? 0.5 : 1 }}>
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom CTA */}
      {filtered.length > 0 && (
        <div style={{ padding:'20px 16px 0', textAlign:'center' }}>
          <button onClick={() => navigate('/stories/highlights')}
            style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.3)',
              borderRadius:14, padding:'12px 24px', color:'#6366f1', fontSize:14,
              fontWeight:700, cursor:'pointer' }}>
            ⭐ Manage Highlights to Save Stories Forever
          </button>
        </div>
      )}
    </div>
  );
}
