// src/pages/stories/StoryAnalyticsPage.jsx
// SECTION-3 NEW: Story Analytics Dashboard — /stories/analytics
// Shows: total views, reactions, replies, per-story breakdown,
//        who viewed + when, engagement rate, reach over time

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, query, where, orderBy, limit,
  getDocs, onSnapshot,
} from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';

// ─── Demo analytics data ────────────────────────────────────────────────────
const DEMO_STATS = {
  totalStories: 7,
  totalViews: 142,
  totalReactions: 38,
  totalReplies: 12,
  engagementRate: 35,
  stories: [
    { id:'s1', content:'🎵 New music drop today!',  views:42, reactions:12, replies:4, time:'2h ago', color:'#ec4899' },
    { id:'s2', content:'✈️ Tokyo vibes 🗼',          views:38, reactions:9,  replies:3, time:'5h ago', color:'#6366f1' },
    { id:'s3', content:'💪 Morning run complete!',   views:31, reactions:8,  replies:2, time:'8h ago', color:'#10b981' },
    { id:'s4', content:'🎨 New artwork finished!',   views:18, reactions:6,  replies:2, time:'12h ago',color:'#8b5cf6' },
    { id:'s5', content:'🍕 Best ramen in the city!', views:13, reactions:3,  replies:1, time:'18h ago',color:'#f59e0b' },
  ],
  viewers: [
    { name:'Alex',    emoji:'✈️', color:'#6366f1', time:'2 min ago' },
    { name:'Jordan',  emoji:'🎵', color:'#ec4899', time:'8 min ago' },
    { name:'Riley',   emoji:'💪', color:'#10b981', time:'15 min ago' },
    { name:'Morgan',  emoji:'🎨', color:'#8b5cf6', time:'32 min ago' },
    { name:'Sam',     emoji:'🍕', color:'#f59e0b', time:'1h ago' },
    { name:'Casey',   emoji:'🎮', color:'#3b82f6', time:'2h ago' },
    { name:'Taylor',  emoji:'📸', color:'#14b8a6', time:'3h ago' },
  ],
  hourlyViews: [3,7,12,18,24,31,36,40,38,35,28,22,18,15,12,10,8,6,5,4,4,3,3,4],
};

function StatCard({ label, value, icon, colour }) {
  return (
    <div style={{ background:`rgba(${colour},0.08)`, border:`1px solid rgba(${colour},0.2)`,
      borderRadius:16, padding:'16px 14px', textAlign:'center', flex:1, minWidth:0 }}>
      <div style={{ fontSize:26, marginBottom:4 }}>{icon}</div>
      <div style={{ fontSize:22, fontWeight:800, color:'#f1f5f9' }}>{value}</div>
      <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{label}</div>
    </div>
  );
}

function MiniBar({ value, max }) {
  const pct = max ? Math.max(4, Math.round((value / max) * 100)) : 4;
  return (
    <div style={{ flex:1, height:6, background:'rgba(255,255,255,0.08)', borderRadius:6, overflow:'hidden' }}>
      <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,#6366f1,#ec4899)', borderRadius:6 }} />
    </div>
  );
}

export default function StoryAnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats]     = useState(DEMO_STATS);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('overview'); // 'overview' | 'stories' | 'viewers'

  useEffect(() => {
    // In production: query Firestore for user's own stories + seenBy counts
    // For now use demo data with a short delay to simulate loading
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [user]);

  const maxViews = Math.max(...stats.stories.map(s => s.views));

  return (
    <div style={{ background:'#0a0a18', minHeight:'100vh', paddingBottom:80 }}>
      {/* Header */}
      <div style={{ padding:'14px 16px 10px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => navigate('/stories')}
          style={{ background:'none', border:'none', color:'#94a3b8', fontSize:22, cursor:'pointer', lineHeight:1 }}>←</button>
        <div>
          <h2 style={{ color:'#f1f5f9', fontSize:18, fontWeight:800, margin:0 }}>📊 Story Analytics</h2>
          <p style={{ color:'#475569', fontSize:12, margin:0 }}>Last 24 hours of your stories</p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:8, padding:'0 16px 16px' }}>
        {[['overview','Overview'],['stories','Per Story'],['viewers','Viewers']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ flex:1, padding:'9px', border:'none', borderRadius:12, fontWeight:700, fontSize:13,
              cursor:'pointer', background: tab===id ? '#6366f1' : 'rgba(255,255,255,0.06)',
              color: tab===id ? 'white' : '#94a3b8' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#475569' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📊</div>
          <p>Loading analytics…</p>
        </div>
      ) : (
        <div style={{ padding:'0 16px' }}>

          {/* OVERVIEW TAB */}
          {tab === 'overview' && (
            <>
              {/* KPI row */}
              <div style={{ display:'flex', gap:10, marginBottom:16 }}>
                <StatCard label="Total Views"     value={stats.totalViews}     icon="👁" colour="99,102,241" />
                <StatCard label="Reactions"       value={stats.totalReactions}  icon="❤️" colour="236,72,153" />
                <StatCard label="Replies"         value={stats.totalReplies}    icon="💬" colour="16,185,129" />
              </div>

              {/* Engagement rate */}
              <div style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)',
                borderRadius:16, padding:'16px', marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ color:'#94a3b8', fontSize:13, fontWeight:700 }}>Engagement Rate</span>
                  <span style={{ color:'#6366f1', fontSize:18, fontWeight:800 }}>{stats.engagementRate}%</span>
                </div>
                <div style={{ height:8, background:'rgba(255,255,255,0.08)', borderRadius:8, overflow:'hidden' }}>
                  <div style={{ width:`${stats.engagementRate}%`, height:'100%',
                    background:'linear-gradient(90deg,#6366f1,#ec4899)', borderRadius:8 }} />
                </div>
                <p style={{ color:'#475569', fontSize:11, margin:'8px 0 0' }}>
                  % of viewers who reacted or replied
                </p>
              </div>

              {/* Hourly views chart (bar chart) */}
              <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:16, padding:'16px', marginBottom:16 }}>
                <p style={{ color:'#94a3b8', fontSize:13, fontWeight:700, marginBottom:12 }}>Hourly Views (24h)</p>
                <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:60 }}>
                  {stats.hourlyViews.map((v, i) => {
                    const maxH = Math.max(...stats.hourlyViews);
                    const pct  = maxH ? (v / maxH) * 100 : 0;
                    return (
                      <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                        <div style={{ width:'100%', height:`${pct}%`, minHeight:3,
                          background: i === 23 ? '#ec4899' : 'rgba(99,102,241,0.6)',
                          borderRadius:'2px 2px 0 0' }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                  <span style={{ color:'#475569', fontSize:10 }}>24h ago</span>
                  <span style={{ color:'#475569', fontSize:10 }}>Now</span>
                </div>
              </div>

              {/* Summary */}
              <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:16, padding:'16px' }}>
                <p style={{ color:'#94a3b8', fontSize:13, fontWeight:700, marginBottom:10 }}>Summary</p>
                {[
                  { label:'Stories Posted', value:stats.totalStories, icon:'📖' },
                  { label:'Avg Views / Story', value:Math.round(stats.totalViews/stats.totalStories), icon:'👁' },
                  { label:'Avg Reactions / Story', value:Math.round(stats.totalReactions/stats.totalStories), icon:'❤️' },
                  { label:'Avg Replies / Story', value:Math.round(stats.totalReplies/stats.totalStories), icon:'💬' },
                ].map(row => (
                  <div key={row.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color:'#94a3b8', fontSize:13 }}>{row.icon} {row.label}</span>
                    <span style={{ color:'#f1f5f9', fontSize:14, fontWeight:700 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* PER STORY TAB */}
          {tab === 'stories' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {stats.stories.map(s => (
                <div key={s.id} style={{ background:'rgba(255,255,255,0.04)', borderRadius:16, padding:'14px 16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:s.color,
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                      📖
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ color:'#f1f5f9', fontSize:13, fontWeight:700, margin:0,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.content}</p>
                      <p style={{ color:'#475569', fontSize:11, margin:0 }}>{s.time}</p>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:12, marginBottom:10 }}>
                    <span style={{ color:'#94a3b8', fontSize:12 }}>👁 {s.views}</span>
                    <span style={{ color:'#94a3b8', fontSize:12 }}>❤️ {s.reactions}</span>
                    <span style={{ color:'#94a3b8', fontSize:12 }}>💬 {s.replies}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ color:'#475569', fontSize:11 }}>Views</span>
                    <MiniBar value={s.views} max={maxViews} />
                    <span style={{ color:'#6366f1', fontSize:11, fontWeight:700, flexShrink:0 }}>{s.views}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEWERS TAB */}
          {tab === 'viewers' && (
            <div>
              <p style={{ color:'#94a3b8', fontSize:13, marginBottom:12 }}>
                👁 {stats.totalViews} people viewed your stories in the last 24h
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                {stats.viewers.map((v, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0',
                    borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width:42, height:42, borderRadius:'50%', background:v.color,
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                      {v.emoji}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ color:'#f1f5f9', fontSize:14, fontWeight:700, margin:0 }}>{v.name}</p>
                      <p style={{ color:'#475569', fontSize:11, margin:0 }}>{v.time}</p>
                    </div>
                    <span style={{ color:'#334155', fontSize:12 }}>👁</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
