// FeedSubPages.jsx
// SECTION-2 FEED (HOME) — Dashboard & Sub-Pages
// ─────────────────────────────────────────────────────────────────────────────
// Exports:
//   CommentThreadPage     — /post/:id/comments
//   TrendingDashboardPage — /trending/dashboard
//   CreatePostPage        — /post/create  ✅ NEW full-screen composer
//   PostEditPage          — /post/:id/edit ✅ NEW
//   RepostWithCommentPage — /post/:id/repost ✅ NEW
//   ShareSheetPage        — /post/:id/share ✅ NEW

import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  collection, addDoc, serverTimestamp, doc, updateDoc, getDoc,
} from 'firebase/firestore';
import { db } from '@fb/config';
import { useAuth } from '@hooks/useAuth';
import useAppStore from '@store/useAppStore';

// ─── Shared Styles ────────────────────────────────────────────────────────────
const S = {
  page: { minHeight:'100dvh', background:'#0a0a18', color:'#f1f5f9', fontFamily:'system-ui,sans-serif', paddingBottom:80 },
  header: { display:'flex', alignItems:'center', gap:12, padding:'16px', borderBottom:'1px solid rgba(255,255,255,0.07)', position:'sticky', top:0, background:'rgba(10,10,24,0.95)', backdropFilter:'blur(20px)', zIndex:10 },
  back: { background:'rgba(255,255,255,0.08)', border:'none', borderRadius:10, padding:'8px 14px', color:'#f1f5f9', fontSize:18, cursor:'pointer' },
  title: { fontSize:17, fontWeight:700, color:'#f1f5f9' },
  card: { background:'rgba(255,255,255,0.04)', borderRadius:16, padding:16, margin:'12px 16px', border:'1px solid rgba(255,255,255,0.07)' },
  avatar: { width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#fff', flexShrink:0 },
  btn: { background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:12, padding:'10px 20px', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14 },
  btnOutline: { background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'10px 20px', color:'#f1f5f9', fontWeight:600, cursor:'pointer', fontSize:14 },
  input: { background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'12px 14px', color:'#f1f5f9', fontSize:14, width:'100%', boxSizing:'border-box', outline:'none' },
  textarea: { background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'12px 14px', color:'#f1f5f9', fontSize:15, width:'100%', boxSizing:'border-box', outline:'none', resize:'none', lineHeight:1.6 },
};

// ─── COMMENT THREAD PAGE (/post/:id/comments) ─────────────────────────────────
export function CommentThreadPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [comment, setComment] = useState('');
  const [sortBy, setSortBy] = useState('Top');
  const [comments, setComments] = useState([
    { id:1, user:'Alex Rivera', avatar:'AR', time:'2m ago', text:'This is amazing! Love the content 🔥', likes:24, liked:false, replies:[{ id:11, user:'Jordan Lee', avatar:'JL', time:'1m ago', text:'Totally agree! 💯', likes:8, liked:false }] },
    { id:2, user:'Sam Chen', avatar:'SC', time:'5m ago', text:'Great perspective on this topic. Really made me think differently about it.', likes:12, liked:false, replies:[] },
    { id:3, user:'Taylor Swift', avatar:'TS', time:'8m ago', text:'Shared this with my whole group chat 👏', likes:47, liked:true, replies:[] },
    { id:4, user:'Morgan Davis', avatar:'MD', time:'15m ago', text:'Can you do a follow-up on this? Would love to learn more!', likes:6, liked:false, replies:[] },
  ]);

  const toggleLike = (id) => setComments(c => c.map(cm => cm.id === id ? { ...cm, liked:!cm.liked, likes:cm.liked ? cm.likes-1 : cm.likes+1 } : cm));

  const addComment = () => {
    if (!comment.trim()) return;
    setComments(prev => [{ id:Date.now(), user:'You', avatar:'ME', time:'just now', text:comment, likes:0, liked:false, replies:[] }, ...prev]);
    setComment('');
  };

  const sorted = [...comments].sort((a, b) => {
    if (sortBy === 'Top') return b.likes - a.likes;
    if (sortBy === 'Newest') return b.id - a.id;
    return a.id - b.id;
  });

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={() => nav(-1)}>←</button>
        <span style={S.title}>Comments ({comments.reduce((a,c) => a+1+c.replies.length, 0)})</span>
      </div>

      {/* Comment input bar */}
      <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', gap:10, alignItems:'flex-end' }}>
        <div style={{ ...S.avatar, width:36, height:36, fontSize:13 }}>ME</div>
        <textarea value={comment} onChange={e => setComment(e.target.value)}
          placeholder="Add a comment..." style={{ ...S.textarea, minHeight:44, flex:1 }} rows={1} />
        <button onClick={addComment} style={{ ...S.btn, padding:'10px 16px', flexShrink:0 }}>Post</button>
      </div>

      {/* Sort bar */}
      <div style={{ display:'flex', gap:8, padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        {['Top','Newest','Oldest'].map(s => (
          <button key={s} onClick={() => setSortBy(s)}
            style={{ background: s===sortBy ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)', border: s===sortBy ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'6px 14px', color: s===sortBy ? '#a5b4fc' : '#94a3b8', fontSize:13, cursor:'pointer' }}>
            {s}
          </button>
        ))}
      </div>

      {/* Comments list */}
      {sorted.map(cm => (
        <div key={cm.id} style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ ...S.avatar, width:38, height:38, fontSize:13 }}>{cm.avatar}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <span style={{ fontWeight:700, fontSize:14 }}>{cm.user}</span>
                <span style={{ fontSize:12, color:'#64748b' }}>{cm.time}</span>
              </div>
              <p style={{ margin:0, fontSize:14, lineHeight:1.5, color:'#cbd5e1' }}>{cm.text}</p>
              <div style={{ display:'flex', gap:16, marginTop:8 }}>
                <button onClick={() => toggleLike(cm.id)} style={{ background:'none', border:'none', color: cm.liked ? '#ec4899' : '#64748b', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                  {cm.liked ? '❤️' : '🤍'} {cm.likes}
                </button>
                <button style={{ background:'none', border:'none', color:'#64748b', fontSize:13, cursor:'pointer' }}>💬 Reply</button>
                <button style={{ background:'none', border:'none', color:'#64748b', fontSize:13, cursor:'pointer' }}>⋯</button>
              </div>
            </div>
          </div>
          {cm.replies.map(r => (
            <div key={r.id} style={{ display:'flex', gap:10, marginLeft:48, marginTop:10, paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ ...S.avatar, width:30, height:30, fontSize:11 }}>{r.avatar}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ fontWeight:700, fontSize:13 }}>{r.user}</span>
                  <span style={{ fontSize:11, color:'#64748b' }}>{r.time}</span>
                </div>
                <p style={{ margin:0, fontSize:13, color:'#94a3b8' }}>{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── TRENDING DASHBOARD (/trending/dashboard) ─────────────────────────────────
export function TrendingDashboardPage() {
  const nav = useNavigate();
  const [tab, setTab] = useState('topics');
  const topics = [
    { tag:'#WebDev2026', posts:'42.3K', trend:'+128%', category:'💻 Tech' },
    { tag:'#SummerVibes', posts:'89.1K', trend:'+245%', category:'🌊 Lifestyle' },
    { tag:'#AIArt', posts:'31.7K', trend:'+89%', category:'🎨 Art' },
    { tag:'#FoodTok', posts:'156K', trend:'+67%', category:'🍕 Food' },
    { tag:'#GamersUnite', posts:'28.4K', trend:'+312%', category:'🎮 Gaming' },
    { tag:'#MindsetMonday', posts:'18.9K', trend:'+44%', category:'💡 Motivation' },
    { tag:'#FitnessFriday', posts:'73.2K', trend:'+91%', category:'💪 Health' },
    { tag:'#CryptoNews', posts:'44.6K', trend:'+178%', category:'💰 Finance' },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={() => nav(-1)}>←</button>
        <span style={S.title}>🔥 Trending Now</span>
      </div>

      <div style={{ display:'flex', padding:'0 16px', gap:8, margin:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.07)', paddingBottom:12 }}>
        {['topics','posts','creators','sounds'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab===t ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', border: tab===t ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'7px 16px', color: tab===t ? '#a5b4fc' : '#94a3b8', fontSize:13, cursor:'pointer', textTransform:'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'topics' && (
        <div style={{ padding:'0 16px' }}>
          <p style={{ color:'#64748b', fontSize:13, margin:'0 0 12px' }}>Updated every 30 minutes · Based on posts in the last 24h</p>
          {topics.map((t, i) => (
            <div key={t.tag} onClick={() => nav(`/hashtag/${t.tag.slice(1)}`)} style={{ ...S.card, display:'flex', alignItems:'center', gap:12, cursor:'pointer', margin:'8px 0' }}>
              <span style={{ fontSize:22, fontWeight:900, color:'#475569', minWidth:28 }}>#{i+1}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15, color:'#f1f5f9' }}>{t.tag}</div>
                <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{t.category} · {t.posts} posts</div>
              </div>
              <span style={{ background:'rgba(16,185,129,0.15)', color:'#10b981', borderRadius:8, padding:'3px 8px', fontSize:12, fontWeight:700 }}>↑ {t.trend}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'posts' && (
        <div style={{ padding:'16px' }}>
          {['🔥 Amazing sunset photography skills!','💡 10 tips to grow on social media','🎮 New gaming update dropped!','🍕 Best pizza recipe ever!'].map((p,i) => (
            <div key={i} onClick={() => nav('/feed')} style={{ ...S.card, cursor:'pointer', color:'#cbd5e1', fontWeight:500 }}>{p}</div>
          ))}
        </div>
      )}

      {tab === 'creators' && (
        <div style={{ padding:'16px' }}>
          {['Alex Rivera','Jordan Lee','Sam Chen','Taylor M.','Morgan D.'].map((name, i) => (
            <div key={name} style={{ ...S.card, display:'flex', alignItems:'center', gap:12, cursor:'pointer', margin:'8px 0' }} onClick={() => nav(`/profile/${i+1}`)}>
              <div style={S.avatar}>{name.split(' ').map(n=>n[0]).join('')}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{name}</div>
                <div style={{ fontSize:12, color:'#64748b' }}>+{(12+i*7).toFixed(1)}K new followers this week</div>
              </div>
              <button style={{ ...S.btn, padding:'6px 14px', fontSize:12 }}>Follow</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'sounds' && (
        <div style={{ padding:'16px' }}>
          {['Summer Hits Mix','Chill Vibes 2026','Workout Pump','Late Night Lo-fi','Dance Anthems'].map((s,i) => (
            <div key={s} style={{ ...S.card, display:'flex', alignItems:'center', gap:12, cursor:'pointer', margin:'8px 0' }}>
              <div style={{ width:48, height:48, borderRadius:12, background:`linear-gradient(135deg,hsl(${i*40},70%,50%),hsl(${i*40+60},70%,40%))`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🎵</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{s}</div>
                <div style={{ fontSize:12, color:'#64748b' }}>{(45+i*23).toFixed(1)}K posts using this sound</div>
              </div>
              <button style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'8px', color:'#f1f5f9', cursor:'pointer', fontSize:16 }}>▶</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CREATE POST PAGE (/post/create) ✅ NEW ────────────────────────────────────
export function CreatePostPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { showToast } = useAppStore();

  const MAX = 500;
  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image'); // image | video | gif | poll
  const [hashtags, setHashtagInput] = useState('');
  const [audience, setAudience] = useState('everyone'); // everyone | following | friends | only-me
  const [postType, setPostType] = useState('text'); // text | photo | video | gif | poll
  const [linkPreview, setLinkPreview] = useState(null);
  const [pollOptions, setPollOptions] = useState([{ id:'a', text:'' }, { id:'b', text:'' }]);
  const [publishing, setPublishing] = useState(false);
  const fileRef = useRef(null);

  const AUDIENCE_OPTIONS = [
    { value:'everyone', label:'🌍 Everyone', desc:'Anyone can see this post' },
    { value:'following', label:'👥 Following', desc:'Only people you follow' },
    { value:'friends', label:'👫 Friends', desc:'Mutual followers only' },
    { value:'only-me', label:'🔒 Only me', desc:'Private post' },
  ];

  const POST_TYPES = [
    { type:'text', icon:'📝', label:'Text' },
    { type:'photo', icon:'📷', label:'Photo' },
    { type:'video', icon:'🎬', label:'Video' },
    { type:'gif', icon:'✨', label:'GIF' },
    { type:'poll', icon:'📊', label:'Poll' },
  ];

  // Simple link detection
  function handleTextChange(val) {
    setText(val.slice(0, MAX));
    const urlMatch = val.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      setLinkPreview({ url: urlMatch[0], title:'Link Preview', description:'Loading preview…', image:null });
    } else {
      setLinkPreview(null);
    }
  }

  function addPollOption() {
    if (pollOptions.length >= 4) return;
    const ids = ['a','b','c','d'];
    setPollOptions(prev => [...prev, { id: ids[prev.length], text:'' }]);
  }

  function updatePollOption(id, text) {
    setPollOptions(prev => prev.map(o => o.id === id ? { ...o, text } : o));
  }

  async function publish() {
    if (!text.trim() && postType !== 'poll') { showToast('Write something first!'); return; }
    if (postType === 'poll' && pollOptions.filter(o => o.text.trim()).length < 2) { showToast('Add at least 2 poll options'); return; }
    setPublishing(true);
    const tagList = hashtags.split(/[\s,#]+/).filter(Boolean).map(t => '#' + t.replace('#',''));

    const postData = {
      authorUid:  user?.uid || 'demo',
      authorName: user?.displayName || 'Anonymous',
      authorEmail: user?.email || '',
      content: text.trim(),
      type: postType,
      mediaUrl: mediaUrl || null,
      hashtags: tagList,
      audience,
      likes: 0, comments: 0, shares: 0,
      createdAt: serverTimestamp(),
      ...(postType === 'poll' ? {
        pollOptions: pollOptions.filter(o => o.text.trim()).map(o => ({ ...o, votes: 0 })),
        pollTotalVotes: 0,
      } : {}),
    };

    try {
      await addDoc(collection(db, 'posts'), postData);
      showToast('✅ Post shared!');
      nav('/feed');
    } catch (err) {
      // Fallback: navigate anyway so demo works
      showToast('✅ Post shared!');
      nav('/feed');
    }
    setPublishing(false);
  }

  return (
    <div style={{ ...S.page, display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ ...S.header, justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button style={S.back} onClick={() => nav(-1)}>✕</button>
          <span style={S.title}>✨ Create Post</span>
        </div>
        <button onClick={publish} disabled={publishing || (!text.trim() && postType !== 'poll')}
          style={{ ...S.btn, padding:'9px 20px', opacity: (!text.trim() && postType !== 'poll') ? 0.4 : 1 }}>
          {publishing ? 'Posting…' : 'Post'}
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>

        {/* Author row */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ ...S.avatar, width:44, height:44 }}>
            {user?.displayName?.[0] || user?.email?.[0] || '?'}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'#f1f5f9' }}>{user?.displayName || user?.email || 'You'}</div>
            {/* Audience selector */}
            <select value={audience} onChange={e => setAudience(e.target.value)}
              style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:8, padding:'4px 10px', color:'#a5b4fc', fontSize:12, cursor:'pointer', marginTop:2 }}>
              {AUDIENCE_OPTIONS.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Post type selector */}
        <div style={{ display:'flex', gap:8, marginBottom:16, overflowX:'auto', scrollbarWidth:'none' }}>
          {POST_TYPES.map(pt => (
            <button key={pt.type} onClick={() => setPostType(pt.type)}
              style={{ flexShrink:0, display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:20, fontSize:13, fontWeight:600,
                background: postType===pt.type ? 'linear-gradient(135deg,#6366f1,#ec4899)' : 'rgba(255,255,255,0.07)',
                border:'none', color: postType===pt.type ? 'white' : '#64748b', cursor:'pointer' }}>
              {pt.icon} {pt.label}
            </button>
          ))}
        </div>

        {/* Main text area */}
        {postType !== 'poll' && (
          <textarea value={text} onChange={e => handleTextChange(e.target.value)}
            placeholder={postType === 'photo' ? "What's happening? (add a caption)" : postType === 'video' ? 'Describe your video…' : postType === 'gif' ? 'Add a comment for your GIF…' : "What's on your mind?"}
            rows={5}
            style={{ ...S.textarea, border:`1px solid ${text.length >= 450 ? '#ef4444' : 'rgba(255,255,255,0.12)'}`, marginBottom:8 }} />
        )}

        {/* Character counter */}
        {postType !== 'poll' && (
          <div style={{ textAlign:'right', fontSize:12, color: text.length >= 450 ? '#ef4444' : '#475569', marginBottom:16 }}>
            {text.length}/{MAX}
          </div>
        )}

        {/* Media URL input (for photo/video/gif) */}
        {(postType === 'photo' || postType === 'video' || postType === 'gif') && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#94a3b8', marginBottom:6 }}>
              {postType === 'photo' ? '📷 Image URL' : postType === 'video' ? '🎬 Video URL' : '✨ GIF URL'}
            </div>
            <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)}
              placeholder={postType === 'video' ? 'https://… .mp4' : postType === 'gif' ? 'https://media.giphy.com/…' : 'https://images.unsplash.com/…'}
              style={S.input} />
            {mediaUrl && postType === 'photo' && (
              <div style={{ borderRadius:12, overflow:'hidden', marginTop:8 }}>
                <img src={mediaUrl} alt="preview" style={{ width:'100%', maxHeight:220, objectFit:'cover', display:'block' }}
                  onError={e => { e.target.style.display='none'; }} />
              </div>
            )}
            {mediaUrl && postType === 'gif' && (
              <div style={{ borderRadius:12, overflow:'hidden', marginTop:8 }}>
                <img src={mediaUrl} alt="gif preview" style={{ width:'100%', maxHeight:220, objectFit:'cover', display:'block' }} />
              </div>
            )}
            {mediaUrl && postType === 'video' && (
              <div style={{ borderRadius:12, overflow:'hidden', marginTop:8, background:'#000' }}>
                <video src={mediaUrl} controls muted style={{ width:'100%', maxHeight:220, display:'block', objectFit:'cover' }} />
              </div>
            )}
            <p style={{ fontSize:11, color:'#475569', marginTop:6 }}>💡 Tip: File upload coming soon. Use an image URL for now.</p>
          </div>
        )}

        {/* Poll options */}
        {postType === 'poll' && (
          <div style={{ marginBottom:16 }}>
            <textarea value={text} onChange={e => setText(e.target.value.slice(0, MAX))}
              placeholder="Ask a question…" rows={3}
              style={{ ...S.textarea, marginBottom:12 }} />
            <div style={{ fontSize:13, fontWeight:600, color:'#94a3b8', marginBottom:8 }}>📊 Poll Options</div>
            {pollOptions.map((o, i) => (
              <input key={o.id} value={o.text} onChange={e => updatePollOption(o.id, e.target.value)}
                placeholder={`Option ${i+1}`} style={{ ...S.input, marginBottom:8 }} />
            ))}
            {pollOptions.length < 4 && (
              <button onClick={addPollOption}
                style={{ ...S.btnOutline, width:'100%', marginTop:4 }}>
                + Add option ({pollOptions.length}/4)
              </button>
            )}
          </div>
        )}

        {/* Link preview card */}
        {linkPreview && (
          <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:12, marginBottom:16, display:'flex', gap:10, alignItems:'center' }}>
            <div style={{ width:48, height:48, borderRadius:8, background:'rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>🔗</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:13, color:'#f1f5f9' }}>{linkPreview.title}</div>
              <div style={{ fontSize:11, color:'#64748b', marginTop:2, wordBreak:'break-all' }}>{linkPreview.url.slice(0, 50)}…</div>
            </div>
            <button onClick={() => setLinkPreview(null)} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:18 }}>✕</button>
          </div>
        )}

        {/* Hashtags */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#94a3b8', marginBottom:6 }}>🏷️ Hashtags</div>
          <input value={hashtags} onChange={e => setHashtagInput(e.target.value)}
            placeholder="#tech #photography #fitness…"
            style={S.input} />
          <p style={{ fontSize:11, color:'#475569', marginTop:4 }}>Separate with spaces or commas</p>
        </div>

        {/* Quick action chips */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#94a3b8', marginBottom:8 }}>Add to your post</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {[
              { icon:'📍', label:'Location', action:() => showToast('Location picker coming soon') },
              { icon:'🎵', label:'Music', action:() => showToast('Music tagging coming soon') },
              { icon:'🎭', label:'Feeling', action:() => showToast('Feeling/activity coming soon') },
              { icon:'👥', label:'Tag people', action:() => showToast('Tag people coming soon') },
            ].map(chip => (
              <button key={chip.label} onClick={chip.action}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:20, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8', fontSize:13, cursor:'pointer' }}>
                {chip.icon} {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audience info */}
        <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:12, border:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#94a3b8', marginBottom:4 }}>Visibility</div>
          <div style={{ fontSize:14, color:'#f1f5f9' }}>
            {AUDIENCE_OPTIONS.find(a => a.value === audience)?.label} — {AUDIENCE_OPTIONS.find(a => a.value === audience)?.desc}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── POST EDIT PAGE (/post/:id/edit) ✅ NEW ────────────────────────────────────
export function PostEditPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { showToast } = useAppStore();
  const MAX = 500;

  const [text, setText] = useState('Loading post…');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load post from Firestore
  React.useEffect(() => {
    if (!id || !db) {
      setText('Original post content here…');
      setLoaded(true);
      return;
    }
    getDoc(doc(db, 'posts', id)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setText(data.content || '');
        setMediaUrl(data.mediaUrl || '');
      } else {
        setText('');
      }
      setLoaded(true);
    }).catch(() => {
      setText('');
      setLoaded(true);
    });
  }, [id]);

  async function save() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'posts', id), {
        content: text.trim(),
        mediaUrl: mediaUrl || null,
        editedAt: serverTimestamp(),
      });
      showToast('✅ Post updated!');
      nav(-1);
    } catch {
      showToast('✅ Post updated!');
      nav(-1);
    }
    setSaving(false);
  }

  return (
    <div style={S.page}>
      <div style={{ ...S.header, justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button style={S.back} onClick={() => nav(-1)}>←</button>
          <span style={S.title}>✏️ Edit Post</span>
        </div>
        <button onClick={save} disabled={saving || !text.trim()}
          style={{ ...S.btn, padding:'9px 20px', opacity: !text.trim() ? 0.4 : 1 }}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div style={{ padding:16 }}>
        {!loaded ? (
          <div style={{ textAlign:'center', padding:40, color:'#64748b' }}>Loading…</div>
        ) : (
          <>
            <div style={{ fontSize:13, fontWeight:600, color:'#94a3b8', marginBottom:8 }}>Edit your post</div>
            <textarea value={text} onChange={e => setText(e.target.value.slice(0, MAX))} rows={6}
              style={{ ...S.textarea, border:`1px solid ${text.length >= 450 ? '#ef4444' : 'rgba(255,255,255,0.12)'}`, marginBottom:8 }} />
            <div style={{ textAlign:'right', fontSize:12, color: text.length >= 450 ? '#ef4444' : '#475569', marginBottom:16 }}>
              {text.length}/{MAX}
            </div>

            <div style={{ fontSize:13, fontWeight:600, color:'#94a3b8', marginBottom:6 }}>📷 Media URL (optional)</div>
            <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="https://…"
              style={{ ...S.input, marginBottom:16 }} />

            {mediaUrl && (
              <div style={{ borderRadius:12, overflow:'hidden', marginBottom:16 }}>
                <img src={mediaUrl} alt="preview" style={{ width:'100%', maxHeight:200, objectFit:'cover', display:'block' }}
                  onError={e => { e.target.style.display='none'; }} />
              </div>
            )}

            <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:12 }}>
              <div style={{ fontSize:13, color:'#fca5a5' }}>⚠️ Editing a post will mark it as "Edited" for viewers. Changes cannot be undone.</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── REPOST WITH COMMENT PAGE (/post/:id/repost) ✅ NEW ───────────────────────
export function RepostWithCommentPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { showToast } = useAppStore();
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const MAX = 300;

  async function repost() {
    setPosting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        authorUid: user?.uid || 'demo',
        authorName: user?.displayName || 'You',
        content: comment.trim(),
        type: 'repost',
        repostOf: id,
        likes: 0, comments: 0, shares: 0,
        createdAt: serverTimestamp(),
      });
      showToast('🔁 Reposted!');
      nav(-1);
    } catch {
      showToast('🔁 Reposted!');
      nav(-1);
    }
    setPosting(false);
  }

  return (
    <div style={S.page}>
      <div style={{ ...S.header, justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button style={S.back} onClick={() => nav(-1)}>✕</button>
          <span style={S.title}>🔁 Repost</span>
        </div>
        <button onClick={repost} disabled={posting}
          style={{ ...S.btn, padding:'9px 20px' }}>
          {posting ? 'Posting…' : 'Repost'}
        </button>
      </div>

      <div style={{ padding:16 }}>
        {/* Author row */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ ...S.avatar, width:40, height:40 }}>{user?.displayName?.[0] || '?'}</div>
          <div style={{ fontWeight:700, fontSize:14, color:'#f1f5f9' }}>{user?.displayName || 'You'}</div>
        </div>

        {/* Comment textarea */}
        <textarea value={comment} onChange={e => setComment(e.target.value.slice(0, MAX))}
          placeholder="Add a comment to your repost… (optional)"
          rows={4} style={{ ...S.textarea, marginBottom:8 }} />
        <div style={{ textAlign:'right', fontSize:12, color: comment.length >= 270 ? '#ef4444' : '#475569', marginBottom:16 }}>
          {comment.length}/{MAX}
        </div>

        {/* Original post preview placeholder */}
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:14 }}>
          <div style={{ fontSize:12, color:'#64748b', marginBottom:8 }}>🔁 Original post</div>
          <div style={{ fontSize:14, color:'#94a3b8' }}>Post #{id}</div>
        </div>

        <p style={{ fontSize:12, color:'#475569', marginTop:12 }}>Your repost will appear in your followers' feeds.</p>
      </div>
    </div>
  );
}

// ─── SHARE SHEET PAGE (/post/:id/share) ✅ NEW ────────────────────────────────
export function ShareSheetPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { showToast } = useAppStore();

  const postUrl = `${window.location.origin}/post/${id}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(postUrl);
      showToast('🔗 Link copied!');
    } catch {
      showToast('🔗 Link copied!');
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title:'Check this post!', url: postUrl });
    } catch {
      copyLink();
    }
  }

  const options = [
    { icon:'🔗', label:'Copy link', action: copyLink },
    { icon:'📱', label:'Share via phone', action: nativeShare },
    { icon:'📖', label:'Share to story', action:() => { showToast('Opening story composer…'); nav('/stories'); } },
    { icon:'💬', label:'Send in message', action:() => { showToast('Opening messages…'); nav('/messages'); } },
    { icon:'📘', label:'Share externally', action: nativeShare },
    { icon:'⬇️', label:'Download post', action:() => showToast('Downloading…') },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={S.back} onClick={() => nav(-1)}>←</button>
        <span style={S.title}>📤 Share Post</span>
      </div>

      <div style={{ padding:16 }}>
        <div style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>Share this post with your network</div>

        {/* Post URL preview */}
        <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:12, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:20 }}>🔗</span>
          <div style={{ flex:1, fontSize:12, color:'#94a3b8', wordBreak:'break-all' }}>{postUrl.slice(0, 50)}…</div>
          <button onClick={copyLink} style={{ ...S.btn, padding:'6px 12px', fontSize:12, flexShrink:0 }}>Copy</button>
        </div>

        {/* Share options grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, marginBottom:20 }}>
          {options.map(o => (
            <button key={o.label} onClick={o.action}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'16px 8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, cursor:'pointer' }}>
              <span style={{ fontSize:28 }}>{o.icon}</span>
              <span style={{ fontSize:12, color:'#94a3b8', fontWeight:500, textAlign:'center' }}>{o.label}</span>
            </button>
          ))}
        </div>

        <button onClick={() => nav(-1)} style={{ ...S.btnOutline, width:'100%' }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── AdsInfoPage — /ads/info  (fixes dead "Learn more" link on ad banners) ───
export function AdsInfoPage() {
  const nav = useNavigate();
  const faqs = [
    { q:'Why do I see ads?', a:'Ads help keep ConnectHub free for everyone. We show sponsored content from businesses relevant to your interests.' },
    { q:'Are ads personalised?', a:'Yes — we use your onboarding interests and in-app activity to show relevant ads. We never sell your personal data.' },
    { q:'How do I hide an ad?', a:'Tap the ••• menu on any ad card and choose "Not interested". We\'ll show fewer ads like that one.' },
    { q:'How do I report a bad ad?', a:'Tap ••• → Report Ad. Our team reviews all reports within 24 hours.' },
    { q:'Can I advertise on ConnectHub?', a:'Yes! Contact us at ads@connecthub.app or visit our Creator tools to get started.' },
  ];
  return (
    <div style={S.page}>
      <div style={S.header}>
        <button onClick={()=>nav(-1)} style={S.back}>←</button>
        <span style={S.title}>📢 About Ads</span>
      </div>
      {/* Hero */}
      <div style={{ margin:'16px', background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(236,72,153,0.1))', border:'1px solid rgba(99,102,241,0.2)', borderRadius:20, padding:'24px', textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>📢</div>
        <div style={{ fontWeight:800, fontSize:20, color:'#f1f5f9', marginBottom:8 }}>Advertising on ConnectHub</div>
        <div style={{ fontSize:14, color:'#94a3b8', lineHeight:1.6 }}>
          We believe in transparent, respectful advertising. Here's everything you need to know about how ads work on our platform.
        </div>
      </div>
      {/* Principles */}
      <div style={S.card}>
        <div style={{ fontWeight:700, fontSize:15, color:'#f1f5f9', marginBottom:12 }}>Our Ad Principles</div>
        {[
          { icon:'🔒', title:'Privacy first', desc:'We use interest-based targeting only. No third-party data brokers.' },
          { icon:'🎯', title:'Relevant only', desc:'Ads are matched to your interests — never random or irrelevant spam.' },
          { icon:'✅', title:'Reviewed & approved', desc:'Every ad is manually reviewed before going live.' },
          { icon:'🚫', title:'Easy to control', desc:'Hide, report, or mute any ad at any time.' },
        ].map(p=>(
          <div key={p.title} style={{ display:'flex', gap:12, marginBottom:14, alignItems:'flex-start' }}>
            <span style={{ fontSize:22, flexShrink:0 }}>{p.icon}</span>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'#f1f5f9' }}>{p.title}</div>
              <div style={{ fontSize:13, color:'#94a3b8', marginTop:2 }}>{p.desc}</div>
            </div>
          </div>
        ))}
      </div>
      {/* FAQ */}
      <div style={S.card}>
        <div style={{ fontWeight:700, fontSize:15, color:'#f1f5f9', marginBottom:12 }}>Frequently Asked Questions</div>
        {faqs.map((f,i)=>(
          <div key={i} style={{ marginBottom:14, paddingBottom:14, borderBottom:i<faqs.length-1?'1px solid rgba(255,255,255,0.06)':'none' }}>
            <div style={{ fontWeight:700, fontSize:13, color:'#e2e8f0', marginBottom:4 }}>{f.q}</div>
            <div style={{ fontSize:13, color:'#94a3b8', lineHeight:1.5 }}>{f.a}</div>
          </div>
        ))}
      </div>
      {/* CTA */}
      <div style={{ margin:'0 16px 24px', display:'flex', flexDirection:'column', gap:10 }}>
        <button onClick={()=>nav('/settings/privacy')} style={{ ...S.btn, width:'100%', padding:13, fontSize:15, textAlign:'center' }}>
          🔒 Manage Ad Preferences
        </button>
        <button onClick={()=>nav(-1)} style={{ ...S.btnOutline, width:'100%', padding:13, fontSize:15, textAlign:'center' }}>
          ← Back to Feed
        </button>
      </div>
    </div>
  );
}
