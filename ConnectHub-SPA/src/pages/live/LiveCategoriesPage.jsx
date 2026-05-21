// LiveCategoriesPage.jsx — /live/categories
// SECTION-4 NEW: Stream Categories Browser
// FIX: category filtering now uses a real Firestore query (where category == selectedCat)
// instead of the static/hardcoded list that was on the main LivePage.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, query, where, orderBy, limit, onSnapshot,
} from 'firebase/firestore';
import { db } from '@/firebase/config';

const CATEGORIES = [
  { id: 'all',       label: '🔥 All',       color: '#ef4444' },
  { id: 'gaming',    label: '🎮 Gaming',     color: '#6366f1' },
  { id: 'music',     label: '🎵 Music',      color: '#f59e0b' },
  { id: 'talk',      label: '🎙️ Talk',       color: '#22c55e' },
  { id: 'sports',    label: '⚽ Sports',     color: '#3b82f6' },
  { id: 'cooking',   label: '🍳 Cooking',    color: '#f97316' },
  { id: 'art',       label: '🎨 Art',        color: '#a855f7' },
  { id: 'fitness',   label: '💪 Fitness',    color: '#10b981' },
  { id: 'education', label: '📚 Education',  color: '#0ea5e9' },
  { id: 'travel',    label: '✈️ Travel',     color: '#ec4899' },
  { id: 'comedy',    label: '😂 Comedy',     color: '#eab308' },
  { id: 'tech',      label: '💻 Tech',       color: '#64748b' },
];

function StreamCard({ stream, onClick }) {
  const fmt = n => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n || 0);
  return (
    <div onClick={onClick} style={{ background:'#1e293b', borderRadius:'12px', overflow:'hidden',
      border:'1px solid #334155', cursor:'pointer', marginBottom:'10px' }}>
      <div style={{ width:'100%', height:'100px', background:'#0f172a', position:'relative',
        display:'flex', alignItems:'center', justifyContent:'center' }}>
        {stream.thumbnailUrl ? (
          <img src={stream.thumbnailUrl} alt={stream.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        ) : (
          <div style={{ fontSize:'28px' }}>🎬</div>
        )}
        <div style={{ position:'absolute', top:'6px', left:'6px', background:'#ef4444',
          borderRadius:'6px', padding:'2px 7px', color:'white', fontSize:'9px', fontWeight:800 }}>● LIVE</div>
        <div style={{ position:'absolute', top:'6px', right:'6px', background:'rgba(0,0,0,0.7)',
          borderRadius:'6px', padding:'2px 7px', color:'white', fontSize:'9px' }}>
          👁 {fmt(stream.viewerCount)}
        </div>
      </div>
      <div style={{ padding:'8px 10px' }}>
        <div style={{ fontWeight:700, fontSize:'12px', overflow:'hidden', textOverflow:'ellipsis',
          whiteSpace:'nowrap', color:'#f1f5f9', marginBottom:'2px' }}>{stream.title}</div>
        <div style={{ color:'#64748b', fontSize:'11px' }}>{stream.userName}</div>
      </div>
    </div>
  );
}

export default function LiveCategoriesPage() {
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState('all');
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  // SECTION-4 FIX: Wire category filtering to Firestore query (was static before)
  useEffect(() => {
    setLoading(true);
    let q;
    if (selectedCat === 'all') {
      q = query(
        collection(db, 'streams'),
        where('status', '==', 'live'),
        orderBy('viewerCount', 'desc'),
        limit(30)
      );
    } else {
      q = query(
        collection(db, 'streams'),
        where('status', '==', 'live'),
        where('category', '==', selectedCat),
        orderBy('viewerCount', 'desc'),
        limit(30)
      );
    }

    const unsub = onSnapshot(q, snap => {
      setStreams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, [selectedCat]);

  const catObj = CATEGORIES.find(c => c.id === selectedCat) || CATEGORIES[0];

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:'80px', color:'#f1f5f9' }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'10px' }}>
        <button onClick={() => navigate('/live')} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:'20px', cursor:'pointer' }}>←</button>
        <div>
          <div style={{ fontWeight:800, fontSize:'16px' }}>🗂️ Browse by Category</div>
          <div style={{ color:'#64748b', fontSize:'11px' }}>{streams.length} live now in {catObj.label}</div>
        </div>
      </div>

      {/* Category chips */}
      <div style={{ display:'flex', gap:'8px', padding:'12px 16px', overflowX:'auto', borderBottom:'1px solid #1e293b' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCat(cat.id)}
            style={{ flexShrink:0, background: selectedCat === cat.id ? cat.color : '#1e293b',
              border: selectedCat === cat.id ? 'none' : '1px solid #334155',
              borderRadius:'20px', padding:'6px 14px', color: selectedCat === cat.id ? 'white' : '#94a3b8',
              fontSize:'12px', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap',
              transition:'all 0.2s ease' }}>
            {cat.label}
          </button>
        ))}
      </div>

      <div style={{ padding:'12px 16px' }}>
        {loading && (
          <>
            <style>{`@keyframes pulse{0%,100%{opacity:0.6}50%{opacity:0.3}}`}</style>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background:'#1e293b', borderRadius:'12px', height:'120px', marginBottom:'10px',
                animation:'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </>
        )}

        {!loading && streams.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>📡</div>
            <div style={{ fontWeight:700, fontSize:'16px', marginBottom:'8px' }}>No live streams in this category</div>
            <div style={{ color:'#64748b', fontSize:'13px', marginBottom:'20px' }}>
              Check back soon or browse another category.
            </div>
            <button onClick={() => setSelectedCat('all')}
              style={{ background:'linear-gradient(135deg,#ef4444,#f59e0b)', border:'none',
                borderRadius:'12px', padding:'10px 22px', color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
              🔥 Show All Live
            </button>
          </div>
        )}

        {!loading && streams.map(s => (
          <StreamCard key={s.id} stream={s} onClick={() => navigate(`/live/watch/${s.id}`)} />
        ))}
      </div>
    </div>
  );
}
