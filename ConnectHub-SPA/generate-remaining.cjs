// Run with: node generate-remaining.js
// Generates: TopNav, SplashScreen, Toast, LoginPage, FeedPage, timeAgo, all stub pages, setup.bat
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
function write(rel, content) {
  const full = path.join(SRC, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart(), 'utf8');
  console.log('✅ wrote', rel);
}

// ── TopNav ────────────────────────────────────────────────────
write('components/layout/TopNav.jsx', `
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '@store/useAppStore';

const TITLES = {
  '/feed':'ConnectHub','/stories':'Stories','/live':'Live','/trending':'Trending',
  '/groups':'Groups','/messages':'Messages','/notifications':'Notifications',
  '/profile':'Profile','/friends':'Friends','/dating':'Dating',
  '/events':'Events','/gaming':'Gaming','/marketplace':'Marketplace',
  '/media':'Media Hub','/music':'Music','/videocalls':'Video Calls',
  '/livestream':'Live Stream','/arvr':'AR/VR','/saved':'Saved',
  '/search':'Search','/settings':'Settings','/business':'Business',
  '/creator':'Creator','/help':'Help & Support',
};

export default function TopNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const userProfile = useAppStore((s) => s.userProfile);
  const base = '/' + pathname.split('/')[1];
  const title = TITLES[base] || 'ConnectHub';

  return (
    <header style={{
      height: 'var(--top-nav-h)', display:'flex', alignItems:'center',
      justifyContent:'space-between', padding:'0 16px',
      background:'rgba(15,12,41,0.95)', backdropFilter:'blur(20px)',
      WebkitBackdropFilter:'blur(20px)',
      borderBottom:'1px solid rgba(255,255,255,0.1)', flexShrink:0, zIndex:100,
    }}>
      <span style={{
        fontWeight:700, fontSize:'18px',
        background:'linear-gradient(135deg,#6366f1,#ec4899)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        backgroundClip:'text',
      }}>{title}</span>
      <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
        <button onClick={() => navigate('/search')} style={{fontSize:'20px',padding:'4px'}} aria-label="search">🔍</button>
        <button onClick={() => navigate('/settings')} style={{fontSize:'20px',padding:'4px'}} aria-label="settings">⚙️</button>
      </div>
    </header>
  );
}
`);

// ── SplashScreen ──────────────────────────────────────────────
write('components/common/SplashScreen.jsx', `
import React from 'react';
export default function SplashScreen() {
  return (
    <div style={{
      position:'fixed',inset:0,display:'flex',flexDirection:'column',
      alignItems:'center',justifyContent:'center',gap:'16px',
      background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
      zIndex:9999,
    }}>
      <div style={{
        width:'64px',height:'64px',borderRadius:'16px',
        background:'linear-gradient(135deg,#6366f1,#ec4899)',
        display:'flex',alignItems:'center',justifyContent:'center',
        fontSize:'28px', boxShadow:'0 0 40px rgba(99,102,241,0.5)',
      }}>⚡</div>
      <span style={{
        fontSize:'24px',fontWeight:800,
        background:'linear-gradient(135deg,#6366f1,#ec4899)',
        WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
      }}>ConnectHub</span>
      <div style={{
        width:'40px',height:'40px',borderRadius:'50%',
        border:'3px solid rgba(255,255,255,0.1)',borderTopColor:'#6366f1',
        animation:'spin 0.8s linear infinite',marginTop:'16px',
      }}/>
    </div>
  );
}
`);

// ── Toast ─────────────────────────────────────────────────────
write('components/common/Toast.jsx', `
import React from 'react';
export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="toast" role="alert" aria-live="polite">
      {message}
    </div>
  );
}
`);

// ── timeAgo utility ───────────────────────────────────────────
write('utils/timeAgo.js', `
export function timeAgo(date) {
  if (!date) return '';
  const ts = date?.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diff = Math.floor((now - ts) / 1000);
  if (diff < 60)    return 'now';
  if (diff < 3600)  return Math.floor(diff / 60) + 'm';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd';
  return ts.toLocaleDateString();
}
`);

// ── LoginPage ─────────────────────────────────────────────────
write('pages/auth/LoginPage.jsx', `
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@firebase/config';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return setError('Please fill in all fields.');
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/feed', { replace: true });
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/ \\(auth.*\\)./, ''));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(''); setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate('/feed', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',
      justifyContent:'center',padding:'24px',
      background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
    }}>
      <div style={{
        width:'100%',maxWidth:'380px',background:'rgba(255,255,255,0.06)',
        backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.12)',
        borderRadius:'24px',padding:'32px 24px',
      }}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{
            width:'56px',height:'56px',borderRadius:'14px',margin:'0 auto 12px',
            background:'linear-gradient(135deg,#6366f1,#ec4899)',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',
          }}>⚡</div>
          <h1 style={{
            fontSize:'24px',fontWeight:800,
            background:'linear-gradient(135deg,#6366f1,#ec4899)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
          }}>ConnectHub</h1>
          <p style={{color:'#94a3b8',marginTop:'4px',fontSize:'14px'}}>
            {mode==='login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          <input className="input" type="email" placeholder="Email address"
            value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" />
          <input className="input" type="password" placeholder="Password"
            value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==='login'?'current-password':'new-password'} />
          {error && <p style={{color:'#ef4444',fontSize:'13px',textAlign:'center'}}>{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{marginTop:'4px'}}>
            {loading ? 'Please wait…' : (mode==='login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{display:'flex',alignItems:'center',gap:'12px',margin:'16px 0'}}>
          <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.1)'}}/>
          <span style={{color:'#64748b',fontSize:'12px'}}>OR</span>
          <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.1)'}}/>
        </div>

        <button className="btn-secondary" onClick={handleGoogle} disabled={loading}
          style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
          <span>🌐</span> Continue with Google
        </button>

        <p style={{textAlign:'center',marginTop:'20px',fontSize:'14px',color:'#94a3b8'}}>
          {mode==='login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');}}
            style={{color:'#6366f1',fontWeight:600}}>
            {mode==='login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
`);

// ── FeedPage ──────────────────────────────────────────────────
write('pages/feed/FeedPage.jsx', `
import React, { useEffect, useState, useCallback } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '@firebase/config';
import useAppStore from '@store/useAppStore';
import { timeAgo } from '@utils/timeAgo';

const PAGE_SIZE = 10;

function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  return (
    <article className="card" style={{margin:'8px 12px',cursor:'default'}}>
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
        <div className="avatar avatar-md" style={{background:'linear-gradient(135deg,#6366f1,#ec4899)'}}>
          {(post.authorName||'U')[0].toUpperCase()}
        </div>
        <div style={{flex:1}}>
          <div style={{fontWeight:600,fontSize:'14px'}}>{post.authorName||'User'}</div>
          <div style={{color:'#64748b',fontSize:'12px'}}>{timeAgo(post.createdAt)}</div>
        </div>
      </div>
      {post.text && <p style={{fontSize:'15px',lineHeight:1.5,marginBottom:'10px'}}>{post.text}</p>}
      {post.imageUrl && (
        <img src={post.imageUrl} alt="post" style={{width:'100%',borderRadius:'12px',marginBottom:'10px',objectFit:'cover',maxHeight:'300px'}}
          onError={e=>e.target.style.display='none'} loading="lazy" />
      )}
      <div style={{display:'flex',gap:'16px',borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'10px'}}>
        {[
          {icon: liked ? '❤️' : '🤍', label: (post.likesCount||0) + (liked?1:0), action: ()=>setLiked(!liked)},
          {icon:'💬', label: post.commentsCount||0},
          {icon:'🔁', label: post.sharesCount||0},
        ].map(({icon,label,action},i) => (
          <button key={i} onClick={action}
            style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'13px',color:'#94a3b8',padding:'2px 6px',borderRadius:'8px'}}>
            <span>{icon}</span><span>{label}</span>
          </button>
        ))}
      </div>
    </article>
  );
}

function SkeletonPost() {
  return (
    <div style={{margin:'8px 12px',padding:'16px',background:'rgba(255,255,255,0.05)',borderRadius:'16px'}}>
      <div style={{display:'flex',gap:'10px',marginBottom:'12px'}}>
        <div className="skeleton" style={{width:44,height:44,borderRadius:'50%'}}/>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:'6px'}}>
          <div className="skeleton" style={{height:12,width:'40%',borderRadius:6}}/>
          <div className="skeleton" style={{height:10,width:'25%',borderRadius:6}}/>
        </div>
      </div>
      <div className="skeleton" style={{height:12,width:'90%',borderRadius:6,marginBottom:6}}/>
      <div className="skeleton" style={{height:12,width:'75%',borderRadius:6}}/>
    </div>
  );
}

export default function FeedPage() {
  const { feedPosts, setFeedPosts, appendFeedPosts, feedLastDoc, feedLoading, setFeedLoading } = useAppStore();
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (afterDoc = null) => {
    if (feedLoading) return;
    setFeedLoading(true);
    try {
      let q = query(collection(db, 'posts'), orderBy('createdAt','desc'), limit(PAGE_SIZE));
      if (afterDoc) q = query(collection(db,'posts'), orderBy('createdAt','desc'), startAfter(afterDoc), limit(PAGE_SIZE));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const last = snap.docs[snap.docs.length - 1] || null;
      if (afterDoc) appendFeedPosts(docs, last);
      else          setFeedPosts(docs);
      setHasMore(docs.length === PAGE_SIZE);
    } catch (err) {
      console.error('[FeedPage] load error:', err);
    } finally {
      setFeedLoading(false);
    }
  }, [feedLoading]);

  useEffect(() => { if (feedPosts.length === 0) loadPosts(); }, []);

  function handleScroll(e) {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 200 && hasMore && !feedLoading) {
      loadPosts(feedLastDoc);
    }
  }

  return (
    <div onScroll={handleScroll} style={{height:'100%',overflowY:'auto',paddingBottom:'16px'}}>
      <div style={{padding:'12px 12px 0',display:'flex',justifyContent:'flex-end'}}>
        <button style={{
          background:'linear-gradient(135deg,#6366f1,#ec4899)',color:'white',
          border:'none',borderRadius:'12px',padding:'8px 16px',fontWeight:600,fontSize:'13px',
        }}>➕ New Post</button>
      </div>

      {feedLoading && feedPosts.length === 0
        ? Array(3).fill(0).map((_,i) => <SkeletonPost key={i} />)
        : feedPosts.length === 0
          ? (
            <div className="empty-state">
              <div className="icon">📰</div>
              <h3>Your feed is empty</h3>
              <p>Follow people to see their posts here, or create the first post!</p>
            </div>
          )
          : feedPosts.map(p => <PostCard key={p.id} post={p} />)
      }

      {feedLoading && feedPosts.length > 0 && (
        <div style={{textAlign:'center',padding:'16px',color:'#64748b',fontSize:'14px'}}>Loading more…</div>
      )}
      {!hasMore && feedPosts.length > 0 && (
        <div style={{textAlign:'center',padding:'16px',color:'#64748b',fontSize:'13px'}}>You're all caught up! 🎉</div>
      )}
    </div>
  );
}
`);

// ── Generate all remaining stub pages ──────────────────────────
const STUBS = [
  { dir: 'stories',    name: 'StoriesPage',      icon: '📸', label: 'Stories' },
  { dir: 'live',       name: 'LivePage',          icon: '📡', label: 'Live' },
  { dir: 'trending',   name: 'TrendingPage',      icon: '🔥', label: 'Trending' },
  { dir: 'groups',     name: 'GroupsPage',        icon: '👥', label: 'Groups' },
  { dir: 'messages',   name: 'MessagesPage',      icon: '💬', label: 'Messages' },
  { dir: 'notifications', name:'NotificationsPage', icon:'🔔', label:'Notifications' },
  { dir: 'profile',    name: 'ProfilePage',       icon: '👤', label: 'Profile' },
  { dir: 'friends',    name: 'FriendsPage',       icon: '🤝', label: 'Friends' },
  { dir: 'dating',     name: 'DatingPage',        icon: '💘', label: 'Dating' },
  { dir: 'events',     name: 'EventsPage',        icon: '🗓️', label: 'Events' },
  { dir: 'gaming',     name: 'GamingPage',        icon: '🎮', label: 'Gaming' },
  { dir: 'marketplace',name: 'MarketplacePage',   icon: '🛍️', label: 'Marketplace' },
  { dir: 'media',      name: 'MediaHubPage',      icon: '🎬', label: 'Media Hub' },
  { dir: 'music',      name: 'MusicPage',         icon: '🎵', label: 'Music' },
  { dir: 'videocalls', name: 'VideoCallsPage',    icon: '📹', label: 'Video Calls' },
  { dir: 'livestream', name: 'LiveStreamPage',    icon: '🔴', label: 'Live Stream' },
  { dir: 'arvr',       name: 'ARVRPage',          icon: '🥽', label: 'AR / VR' },
  { dir: 'saved',      name: 'SavedPage',         icon: '🔖', label: 'Saved' },
  { dir: 'search',     name: 'SearchPage',        icon: '🔍', label: 'Search' },
  { dir: 'settings',   name: 'SettingsPage',      icon: '⚙️', label: 'Settings' },
  { dir: 'business',   name: 'BusinessPage',      icon: '💼', label: 'Business' },
  { dir: 'creator',    name: 'CreatorPage',       icon: '✨', label: 'Creator' },
  { dir: 'help',       name: 'HelpPage',          icon: '🆘', label: 'Help & Support' },
];

STUBS.forEach(({ dir, name, icon, label }) => {
  write(`pages/${dir}/${name}.jsx`,
`import React from 'react';
import { useNavigate } from 'react-router-dom';

// TODO: Build out full ${label} page
export default function ${name}() {
  const navigate = useNavigate();
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      padding:'60px 24px',gap:'16px',textAlign:'center',minHeight:'60vh'}}>
      <div style={{fontSize:'56px'}}>${icon}</div>
      <h2 style={{fontSize:'22px',fontWeight:700}}>${label}</h2>
      <p style={{color:'#94a3b8',fontSize:'14px',maxWidth:'260px'}}>
        This section is under construction.<br/>Full implementation coming soon.
      </p>
      <button style={{
        marginTop:'8px',background:'linear-gradient(135deg,#6366f1,#ec4899)',
        color:'white',border:'none',borderRadius:'12px',padding:'10px 20px',
        fontWeight:600,fontSize:'14px',cursor:'pointer',
      }} onClick={()=>navigate(-1)}>← Go Back</button>
    </div>
  );
}
`);
});

// ── setup.bat ─────────────────────────────────────────────────
const bat = path.join(__dirname, 'setup.bat');
fs.writeFileSync(bat,
`@echo off
echo ================================================
echo  ConnectHub SPA — First-Time Setup
echo ================================================

cd /d "%~dp0"

echo.
echo [1/4] Installing dependencies...
call npm install

echo.
echo [2/4] Checking for .env file...
if not exist .env (
  copy .env.example .env
  echo     Created .env — please fill in your Firebase keys before running!
) else (
  echo     .env already exists — good.
)

echo.
echo [3/4] Running stub-page generator...
node generate-remaining.js

echo.
echo [4/4] Done!
echo.
echo  To start the dev server:
echo    cd ConnectHub-SPA
echo    npm run dev
echo.
pause
`.replace(/\n/g, '\r\n'), 'utf8');
console.log('✅ wrote setup.bat (root)');

console.log('\n🎉 All files generated successfully!\n');
console.log('Next steps:');
console.log('  1. cd ConnectHub-SPA');
console.log('  2. Copy .env.example to .env and fill in Firebase keys');
console.log('  3. npm install');
console.log('  4. npm run dev');
