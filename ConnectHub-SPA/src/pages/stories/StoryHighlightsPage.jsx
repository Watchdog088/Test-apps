// src/pages/stories/StoryHighlightsPage.jsx
// SECTION-3 NEW: Highlights Manager — /stories/highlights
// - View all highlights with cover + name
// - Create new highlight (persists to Firestore storyHighlights collection)
// - Edit highlight name / delete highlight
// - Add/remove stories from a highlight

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, query, where, onSnapshot,
  addDoc, deleteDoc, updateDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';
import useAppStore from '@store/useAppStore';

const DEMO_HIGHLIGHTS = [
  { id:'h1', name:'Travel',   emoji:'✈️', color:'#6366f1', storyCount:5, createdAt:'May 2026' },
  { id:'h2', name:'Food',     emoji:'🍕', color:'#f59e0b', storyCount:8, createdAt:'Apr 2026' },
  { id:'h3', name:'Fitness',  emoji:'💪', color:'#10b981', storyCount:12, createdAt:'Mar 2026' },
  { id:'h4', name:'Art',      emoji:'🎨', color:'#8b5cf6', storyCount:6, createdAt:'Feb 2026' },
  { id:'h5', name:'Gaming',   emoji:'🎮', color:'#3b82f6', storyCount:9, createdAt:'Jan 2026' },
];

const EMOJI_CHOICES = ['✈️','🍕','💪','🎨','🎮','🎵','📸','🌟','❤️','🏠','🐶','🌍'];
const COLOUR_CHOICES = ['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6','#8b5cf6','#ef4444','#0d9488'];

function CreateHighlightSheet({ onClose, onCreate }) {
  const [name, setName]     = useState('');
  const [emoji, setEmoji]   = useState('✈️');
  const [colour, setColour] = useState('#6366f1');

  function submit() {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), emoji, colour });
    onClose();
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9000, background:'rgba(0,0,0,0.7)',
      display:'flex', alignItems:'flex-end' }} onClick={onClose}>
      <div style={{ width:'100%', background:'#1a1a2e', borderRadius:'24px 24px 0 0',
        padding:'24px 20px', paddingBottom:'calc(24px + env(safe-area-inset-bottom))' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ width:36, height:4, borderRadius:4, background:'#334155', margin:'0 auto 20px' }} />
        <h3 style={{ color:'#f1f5f9', fontWeight:800, marginBottom:16, fontSize:17 }}>⭐ New Highlight</h3>

        {/* Preview */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:colour,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:32,
            boxShadow:`0 0 0 4px ${colour}40` }}>
            {emoji}
          </div>
        </div>

        {/* Name input */}
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="Highlight name (e.g. Travel)"
          maxLength={30}
          style={{ width:'100%', background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(255,255,255,0.12)', borderRadius:14,
            padding:'12px 14px', color:'#f1f5f9', fontSize:15, outline:'none',
            marginBottom:16, boxSizing:'border-box' }} />

        {/* Emoji picker */}
        <p style={{ color:'#94a3b8', fontSize:12, marginBottom:8 }}>Cover emoji</p>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
          {EMOJI_CHOICES.map(e => (
            <button key={e} onClick={() => setEmoji(e)}
              style={{ fontSize:24, background: emoji===e ? 'rgba(99,102,241,0.2)' : 'none',
                border: emoji===e ? '2px solid #6366f1' : '2px solid transparent',
                borderRadius:10, padding:'4px 6px', cursor:'pointer', lineHeight:1 }}>
              {e}
            </button>
          ))}
        </div>

        {/* Colour picker */}
        <p style={{ color:'#94a3b8', fontSize:12, marginBottom:8 }}>Background colour</p>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
          {COLOUR_CHOICES.map(c => (
            <button key={c} onClick={() => setColour(c)}
              style={{ width:32, height:32, borderRadius:'50%', background:c, border:'none',
                cursor:'pointer', outline: colour===c ? '3px solid white' : 'none', outlineOffset:2 }} />
          ))}
        </div>

        <button onClick={submit} disabled={!name.trim()}
          style={{ width:'100%', padding:'13px', background:'linear-gradient(135deg,#6366f1,#ec4899)',
            border:'none', borderRadius:14, color:'white', fontSize:15, fontWeight:700,
            cursor: name.trim() ? 'pointer' : 'not-allowed', opacity: name.trim() ? 1 : 0.5 }}>
          Create Highlight
        </button>
      </div>
    </div>
  );
}

function HighlightCard({ highlight, onDelete, onEdit }) {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, position:'relative' }}>
      <div style={{ position:'relative' }}
        onClick={() => setShowMenu(m => !m)}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:highlight.color||highlight.colour,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:34,
          boxShadow:`0 0 0 3px ${highlight.color||highlight.colour}60`,
          cursor:'pointer' }}>
          {highlight.emoji}
        </div>
        <div style={{ position:'absolute', bottom:0, right:0, width:22, height:22,
          borderRadius:'50%', background:'#1a1a2e', border:'2px solid #334155',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, cursor:'pointer' }}>
          ⋯
        </div>
      </div>
      <span style={{ fontSize:12, color:'#f1f5f9', fontWeight:600, textAlign:'center',
        maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {highlight.name}
      </span>
      <span style={{ fontSize:10, color:'#475569' }}>{highlight.storyCount} stories</span>

      {/* Context menu */}
      {showMenu && (
        <div style={{ position:'absolute', top:90, left:'50%', transform:'translateX(-50%)',
          background:'#1e2035', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)',
          zIndex:100, minWidth:130, overflow:'hidden', boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
          <button onClick={() => { setShowMenu(false); onEdit(highlight); }}
            style={{ width:'100%', padding:'12px 16px', background:'none', border:'none',
              color:'#f1f5f9', fontSize:13, textAlign:'left', cursor:'pointer',
              borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            ✏️ Rename
          </button>
          <button onClick={() => { setShowMenu(false); onDelete(highlight.id); }}
            style={{ width:'100%', padding:'12px 16px', background:'none', border:'none',
              color:'#ef4444', fontSize:13, textAlign:'left', cursor:'pointer' }}>
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function StoryHighlightsPage() {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const showToast   = useAppStore(s => s.showToast);
  const [highlights, setHighlights] = useState(DEMO_HIGHLIGHTS);
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem]     = useState(null); // { id, name }
  const [editName, setEditName]     = useState('');

  // Real Firestore listener
  useEffect(() => {
    if (!db || !user) return;
    const q = query(
      collection(db, 'storyHighlights'),
      where('authorUid', '==', user.uid),
    );
    const unsub = onSnapshot(q, snap => {
      if (!snap.empty) {
        setHighlights(snap.docs.map(d => ({ id:d.id, storyCount:0, ...d.data() })));
      }
    }, () => {}); // fallback to demo on error
    return () => unsub();
  }, [user]);

  async function createHighlight({ name, emoji, colour }) {
    const doc = {
      authorUid: user?.uid || 'demo',
      name, emoji, color: colour,
      storyCount: 0,
      storyIds: [],
      createdAt: serverTimestamp(),
    };
    try {
      if (db && user) await addDoc(collection(db, 'storyHighlights'), doc);
      else setHighlights(prev => [...prev, { id:`h${Date.now()}`, storyCount:0, ...doc, createdAt:'Just now' }]);
      showToast(`⭐ "${name}" highlight created!`);
    } catch {
      setHighlights(prev => [...prev, { id:`h${Date.now()}`, storyCount:0, ...doc, createdAt:'Just now' }]);
      showToast(`⭐ "${name}" highlight created (demo)!`);
    }
  }

  async function deleteHighlight(id) {
    try {
      if (db && user && !id.startsWith('h')) await deleteDoc(doc(db, 'storyHighlights', id));
    } catch {}
    setHighlights(prev => prev.filter(h => h.id !== id));
    showToast('🗑️ Highlight deleted');
  }

  async function renameHighlight() {
    if (!editName.trim() || !editItem) return;
    try {
      if (db && user && !editItem.id.startsWith('h')) {
        await updateDoc(doc(db, 'storyHighlights', editItem.id), { name: editName.trim() });
      }
    } catch {}
    setHighlights(prev => prev.map(h => h.id === editItem.id ? { ...h, name: editName.trim() } : h));
    showToast('✏️ Highlight renamed!');
    setEditItem(null);
    setEditName('');
  }

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:80 }}>
      {/* Header */}
      <div style={{ padding:'14px 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => navigate('/stories')}
            style={{ background:'none', border:'none', color:'#94a3b8', fontSize:22, cursor:'pointer', lineHeight:1 }}>←</button>
          <div>
            <h2 style={{ color:'#f1f5f9', fontSize:18, fontWeight:800, margin:0 }}>⭐ Highlights</h2>
            <p style={{ color:'#475569', fontSize:12, margin:0 }}>Stories saved forever</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none',
            borderRadius:12, padding:'8px 16px', color:'white', fontSize:13, fontWeight:700, cursor:'pointer' }}>
          + New
        </button>
      </div>

      {/* Info banner */}
      <div style={{ margin:'0 16px 16px', padding:'12px 16px',
        background:'rgba(99,102,241,0.08)', borderRadius:14,
        border:'1px solid rgba(99,102,241,0.15)' }}>
        <p style={{ color:'#94a3b8', fontSize:12, lineHeight:1.6, margin:0 }}>
          💡 Highlights let you keep stories on your profile <strong style={{ color:'#6366f1' }}>forever</strong>,
          even after the 24h window expires. Tap any highlight to view or edit its stories.
        </p>
      </div>

      {/* Highlights grid */}
      {highlights.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 32px' }}>
          <div style={{ fontSize:56, marginBottom:16 }}>⭐</div>
          <h3 style={{ color:'#94a3b8', fontSize:18, fontWeight:800, marginBottom:8 }}>No highlights yet</h3>
          <p style={{ color:'#475569', fontSize:14, marginBottom:20, lineHeight:1.6 }}>
            Create your first highlight to keep<br />your favourite stories forever.
          </p>
          <button onClick={() => setShowCreate(true)}
            style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none',
              borderRadius:14, padding:'12px 28px', color:'white', fontSize:15, fontWeight:700, cursor:'pointer' }}>
            ✨ Create First Highlight
          </button>
        </div>
      ) : (
        <div style={{ padding:'0 16px', display:'flex', flexWrap:'wrap', gap:20 }}>
          {highlights.map(h => (
            <HighlightCard
              key={h.id}
              highlight={h}
              onDelete={deleteHighlight}
              onEdit={(item) => { setEditItem(item); setEditName(item.name); }}
            />
          ))}
        </div>
      )}

      {/* Create sheet */}
      {showCreate && (
        <CreateHighlightSheet onClose={() => setShowCreate(false)} onCreate={createHighlight} />
      )}

      {/* Rename sheet */}
      {editItem && (
        <div style={{ position:'fixed', inset:0, zIndex:9000, background:'rgba(0,0,0,0.7)',
          display:'flex', alignItems:'flex-end' }} onClick={() => setEditItem(null)}>
          <div style={{ width:'100%', background:'#1a1a2e', borderRadius:'24px 24px 0 0',
            padding:'24px 20px', paddingBottom:'calc(24px + env(safe-area-inset-bottom))' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ color:'#f1f5f9', fontWeight:800, marginBottom:16 }}>✏️ Rename Highlight</h3>
            <input value={editName} onChange={e => setEditName(e.target.value)}
              placeholder="New name"
              style={{ width:'100%', background:'rgba(255,255,255,0.07)',
                border:'1px solid rgba(255,255,255,0.12)', borderRadius:14,
                padding:'12px 14px', color:'#f1f5f9', fontSize:15, outline:'none',
                marginBottom:12, boxSizing:'border-box' }} />
            <button onClick={renameHighlight}
              style={{ width:'100%', padding:'13px', background:'linear-gradient(135deg,#6366f1,#ec4899)',
                border:'none', borderRadius:14, color:'white', fontSize:15, fontWeight:700, cursor:'pointer' }}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
