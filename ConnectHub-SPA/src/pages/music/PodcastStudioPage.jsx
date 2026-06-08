// src/pages/music/PodcastStudioPage.jsx
// Podcast Creator Studio — users can create a show, upload episodes,
// manage their feed, and view basic play analytics.
// Audio files + cover art are uploaded to Firebase Storage.

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  getFirestore, collection, addDoc, getDocs,
  query, where, orderBy, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL,
} from 'firebase/storage';

const db  = getFirestore();
const storage = getStorage();

// ─── helpers ──────────────────────────────────────────────────────────────────
function fmtSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function fmtDur(secs) {
  if (!secs) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Upload helper (returns { url, progress$ }) ───────────────────────────────
function uploadFile(file, path, onProgress) {
  return new Promise((resolve, reject) => {
    const r = storageRef(storage, path);
    const task = uploadBytesResumable(r, file);
    task.on('state_changed',
      snap => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => { resolve(await getDownloadURL(task.snapshot.ref)); },
    );
  });
}

// ─── Sub-view: CreateShowForm ─────────────────────────────────────────────────
function CreateShowForm({ userId, onCreated }) {
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [category, setCategory] = useState('Society & Culture');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [err, setErr]             = useState('');
  const fileRef = useRef();

  const CATS = [
    'Arts','Business','Comedy','Education','Fiction','Government',
    'Health & Fitness','History','Kids & Family','Leisure','Music',
    'News','Religion & Spirituality','Science','Society & Culture',
    'Sports','Technology','True Crime','TV & Film',
  ];

  function handleCover(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { setErr('Cover must be an image file.'); return; }
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
    setErr('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) { setErr('Show title is required.'); return; }
    setUploading(true); setErr('');
    try {
      let coverUrl = '';
      if (coverFile) {
        coverUrl = await uploadFile(
          coverFile,
          `podcasts/${userId}/cover_${Date.now()}_${coverFile.name}`,
          setProgress,
        );
      }
      const docRef = await addDoc(collection(db, 'podcast_shows'), {
        userId, title: title.trim(), description: desc.trim(),
        category, coverUrl,
        subscriberCount: 0, episodeCount: 0,
        createdAt: serverTimestamp(),
      });
      onCreated({ id: docRef.id, title: title.trim(), description: desc.trim(), category, coverUrl, episodeCount: 0 });
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setUploading(false);
    }
  }

  const s = { label: { display:'block', color:'#94a3b8', fontSize:13, marginBottom:5, fontWeight:600 } };

  return (
    <form onSubmit={handleSubmit} style={{ padding:'0 16px 32px' }}>
      <div style={{ fontSize:17, fontWeight:800, color:'#f1f5f9', marginBottom:20 }}>🎙️ Create Your Podcast Show</div>

      {/* Cover art */}
      <div style={{ marginBottom:16, textAlign:'center' }}>
        <div
          onClick={() => fileRef.current.click()}
          style={{
            width:120, height:120, borderRadius:16,
            background: coverPreview ? `url(${coverPreview}) center/cover` : '#1e293b',
            border:'2px dashed #334155', display:'inline-flex',
            alignItems:'center', justifyContent:'center', cursor:'pointer',
            fontSize:36,
          }}
        >
          {!coverPreview && '🖼️'}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleCover} />
        <div style={{ color:'#64748b', fontSize:12, marginTop:6 }}>Tap to upload cover art (recommended 3000×3000 px)</div>
      </div>

      {/* Title */}
      <div style={{ marginBottom:14 }}>
        <label style={s.label}>Show Title *</label>
        <input
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="e.g. The Daily Hustle"
          style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:10, padding:'11px 12px', color:'#f1f5f9', fontSize:14, boxSizing:'border-box' }}
        />
      </div>

      {/* Description */}
      <div style={{ marginBottom:14 }}>
        <label style={s.label}>Description</label>
        <textarea
          value={desc} onChange={e => setDesc(e.target.value)}
          rows={3} placeholder="Tell listeners what your show is about…"
          style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:10, padding:'11px 12px', color:'#f1f5f9', fontSize:14, resize:'none', boxSizing:'border-box' }}
        />
      </div>

      {/* Category */}
      <div style={{ marginBottom:20 }}>
        <label style={s.label}>Category</label>
        <select
          value={category} onChange={e => setCategory(e.target.value)}
          style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:10, padding:'11px 12px', color:'#f1f5f9', fontSize:14, boxSizing:'border-box' }}
        >
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {err && <div style={{ color:'#ef4444', fontSize:13, marginBottom:12 }}>{err}</div>}

      {uploading && (
        <div style={{ marginBottom:14 }}>
          <div style={{ height:6, background:'#1e293b', borderRadius:99 }}>
            <div style={{ width:`${progress}%`, height:'100%', background:'linear-gradient(90deg,#6366f1,#ec4899)', borderRadius:99, transition:'width .3s' }} />
          </div>
          <div style={{ color:'#64748b', fontSize:12, marginTop:4 }}>Uploading… {progress}%</div>
        </div>
      )}

      <button
        type="submit" disabled={uploading}
        style={{ width:'100%', background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:14, padding:'14px', color:'white', fontWeight:800, fontSize:15, cursor:'pointer', opacity: uploading ? .6 : 1 }}
      >
        {uploading ? 'Creating…' : '🚀 Create Show'}
      </button>
    </form>
  );
}

// ─── Sub-view: UploadEpisodeForm ──────────────────────────────────────────────
function UploadEpisodeForm({ userId, showId, showTitle, episodeCount, onUploaded, onCancel }) {
  const [title, setTitle]     = useState('');
  const [desc, setDesc]       = useState('');
  const [season, setSeason]   = useState(1);
  const [epNum, setEpNum]     = useState(episodeCount + 1);
  const [audioFile, setAudioFile] = useState(null);
  const [duration, setDuration]   = useState(0);
  const [progress, setProgress]   = useState(0);
  const [uploading, setUploading] = useState(false);
  const [err, setErr]             = useState('');
  const audioRef = useRef();

  function handleAudio(e) {
    const f = e.target.files[0];
    if (!f) return;
    const allowed = ['audio/mpeg','audio/mp3','audio/wav','audio/x-m4a','audio/ogg','audio/mp4'];
    if (!allowed.includes(f.type) && !f.name.match(/\.(mp3|wav|m4a|ogg|aac)$/i)) {
      setErr('Please upload an MP3, WAV, M4A, or OGG audio file.'); return;
    }
    setAudioFile(f); setErr('');
    // get duration
    const url = URL.createObjectURL(f);
    const a = new Audio(url);
    a.addEventListener('loadedmetadata', () => { setDuration(a.duration); URL.revokeObjectURL(url); });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) { setErr('Episode title is required.'); return; }
    if (!audioFile)    { setErr('Please select an audio file.'); return; }
    setUploading(true); setErr('');
    try {
      const audioUrl = await uploadFile(
        audioFile,
        `podcasts/${userId}/${showId}/ep_${Date.now()}_${audioFile.name}`,
        setProgress,
      );
      await addDoc(collection(db, 'podcast_episodes'), {
        userId, showId, showTitle,
        title: title.trim(), description: desc.trim(),
        audioUrl, duration, fileSize: audioFile.size,
        season: Number(season), episodeNumber: Number(epNum),
        plays: 0, published: true,
        createdAt: serverTimestamp(),
      });
      // bump episodeCount on the show
      await updateDoc(doc(db, 'podcast_shows', showId), { episodeCount: episodeCount + 1 });
      onUploaded();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setUploading(false);
    }
  }

  const s = { label: { display:'block', color:'#94a3b8', fontSize:13, marginBottom:5, fontWeight:600 } };

  return (
    <form onSubmit={handleSubmit} style={{ padding:'0 16px 32px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
        <button type="button" onClick={onCancel} style={{ background:'none', border:'none', color:'#6366f1', fontSize:20, cursor:'pointer', padding:0 }}>‹</button>
        <div style={{ fontSize:17, fontWeight:800, color:'#f1f5f9' }}>📤 Upload New Episode</div>
      </div>
      <div style={{ background:'rgba(99,102,241,0.1)', borderRadius:10, padding:'10px 12px', marginBottom:16, color:'#a5b4fc', fontSize:13 }}>
        Show: <strong>{showTitle}</strong>
      </div>

      {/* Audio file drop zone */}
      <div
        onClick={() => audioRef.current.click()}
        style={{
          border: audioFile ? '2px solid #6366f1' : '2px dashed #334155',
          borderRadius:14, padding:'20px 16px', textAlign:'center',
          background:'#1e293b', cursor:'pointer', marginBottom:16,
        }}
      >
        {audioFile ? (
          <>
            <div style={{ fontSize:28 }}>🎵</div>
            <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:14, marginTop:6 }}>{audioFile.name}</div>
            <div style={{ color:'#64748b', fontSize:12 }}>{fmtSize(audioFile.size)}{duration ? ` · ${fmtDur(duration)}` : ''}</div>
          </>
        ) : (
          <>
            <div style={{ fontSize:36 }}>🎙️</div>
            <div style={{ color:'#94a3b8', fontSize:14, marginTop:8 }}>Tap to select audio file</div>
            <div style={{ color:'#64748b', fontSize:12, marginTop:4 }}>MP3, WAV, M4A, OGG · Max 500 MB</div>
          </>
        )}
      </div>
      <input ref={audioRef} type="file" accept="audio/*" style={{ display:'none' }} onChange={handleAudio} />

      {/* Title */}
      <div style={{ marginBottom:14 }}>
        <label style={s.label}>Episode Title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Episode 1: Getting Started"
          style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:10, padding:'11px 12px', color:'#f1f5f9', fontSize:14, boxSizing:'border-box' }} />
      </div>

      {/* Description */}
      <div style={{ marginBottom:14 }}>
        <label style={s.label}>Show Notes / Description</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
          placeholder="What's this episode about?"
          style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:10, padding:'11px 12px', color:'#f1f5f9', fontSize:14, resize:'none', boxSizing:'border-box' }} />
      </div>

      {/* Season + Episode number */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
        <div>
          <label style={s.label}>Season</label>
          <input type="number" min={1} value={season} onChange={e => setSeason(e.target.value)}
            style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:10, padding:'11px 12px', color:'#f1f5f9', fontSize:14, boxSizing:'border-box' }} />
        </div>
        <div>
          <label style={s.label}>Episode #</label>
          <input type="number" min={1} value={epNum} onChange={e => setEpNum(e.target.value)}
            style={{ width:'100%', background:'#1e293b', border:'1px solid #334155', borderRadius:10, padding:'11px 12px', color:'#f1f5f9', fontSize:14, boxSizing:'border-box' }} />
        </div>
      </div>

      {err && <div style={{ color:'#ef4444', fontSize:13, marginBottom:12 }}>{err}</div>}

      {uploading && (
        <div style={{ marginBottom:14 }}>
          <div style={{ height:6, background:'#1e293b', borderRadius:99 }}>
            <div style={{ width:`${progress}%`, height:'100%', background:'linear-gradient(90deg,#6366f1,#ec4899)', borderRadius:99, transition:'width .3s' }} />
          </div>
          <div style={{ color:'#64748b', fontSize:12, marginTop:4 }}>Uploading audio… {progress}%</div>
        </div>
      )}

      <button type="submit" disabled={uploading}
        style={{ width:'100%', background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:14, padding:'14px', color:'white', fontWeight:800, fontSize:15, cursor:'pointer', opacity: uploading ? .6 : 1 }}>
        {uploading ? 'Uploading…' : '📤 Publish Episode'}
      </button>
    </form>
  );
}

// ─── Sub-view: ShowDashboard ──────────────────────────────────────────────────
function ShowDashboard({ show, userId, onBack }) {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState('episodes'); // 'episodes' | 'upload' | 'analytics'

  async function loadEpisodes() {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'podcast_episodes'),
        where('showId', '==', show.id),
        orderBy('createdAt', 'desc'),
      );
      const snap = await getDocs(q);
      setEpisodes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { /* index may not exist yet */ }
    setLoading(false);
  }

  useEffect(() => { loadEpisodes(); }, [show.id]);

  async function deleteEpisode(epId) {
    if (!window.confirm('Delete this episode? This cannot be undone.')) return;
    await deleteDoc(doc(db, 'podcast_episodes', epId));
    setEpisodes(ep => ep.filter(e => e.id !== epId));
  }

  async function togglePublish(ep) {
    await updateDoc(doc(db, 'podcast_episodes', ep.id), { published: !ep.published });
    setEpisodes(arr => arr.map(e => e.id === ep.id ? { ...e, published: !e.published } : e));
  }

  if (view === 'upload') {
    return (
      <UploadEpisodeForm
        userId={userId} showId={show.id} showTitle={show.title}
        episodeCount={episodes.length}
        onUploaded={() => { loadEpisodes(); setView('episodes'); }}
        onCancel={() => setView('episodes')}
      />
    );
  }

  return (
    <div style={{ paddingBottom:32 }}>
      {/* Back + Show header */}
      <div style={{ padding:'0 16px', marginBottom:16 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:'#6366f1', fontSize:14, fontWeight:700, cursor:'pointer', padding:0, marginBottom:12 }}>← All Shows</button>
        <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
          <div style={{ width:72, height:72, borderRadius:14, background: show.coverUrl ? `url(${show.coverUrl}) center/cover` : 'linear-gradient(135deg,#6366f1,#ec4899)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>
            {!show.coverUrl && '🎙️'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:800, fontSize:16, color:'#f1f5f9' }}>{show.title}</div>
            <div style={{ color:'#64748b', fontSize:12, marginTop:3 }}>{show.category}</div>
            <div style={{ color:'#94a3b8', fontSize:12, marginTop:2 }}>{episodes.length} episode{episodes.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', borderBottom:'1px solid #1e293b', marginBottom:16 }}>
        {[['episodes','📋 Episodes'],['analytics','📊 Analytics']].map(([k,label]) => (
          <div key={k} onClick={() => setView(k)}
            style={{ flex:1, padding:'10px', textAlign:'center', fontSize:13, fontWeight:view===k?700:500, color:view===k?'#6366f1':'#64748b', borderBottom:view===k?'2px solid #6366f1':'2px solid transparent', cursor:'pointer' }}>
            {label}
          </div>
        ))}
      </div>

      {view === 'analytics' ? (
        <div style={{ padding:'0 16px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
            {[
              ['🎧','Total Plays', episodes.reduce((a,e) => a + (e.plays||0), 0).toLocaleString()],
              ['📅','Episodes', episodes.length],
              ['👥','Subscribers', (show.subscriberCount||0).toLocaleString()],
              ['⭐','Avg Rating', '—'],
            ].map(([icon,label,val]) => (
              <div key={label} style={{ background:'#1e293b', borderRadius:14, padding:'16px 14px' }}>
                <div style={{ fontSize:22 }}>{icon}</div>
                <div style={{ fontWeight:800, fontSize:22, color:'#f1f5f9', marginTop:6 }}>{val}</div>
                <div style={{ color:'#64748b', fontSize:12 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'#1e293b', borderRadius:14, padding:'16px', textAlign:'center', color:'#64748b', fontSize:13 }}>
            Detailed play analytics available after your first 100 plays. Keep publishing!
          </div>
        </div>
      ) : (
        <div style={{ padding:'0 16px' }}>
          <button onClick={() => setView('upload')}
            style={{ width:'100%', background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:14, padding:'13px', color:'white', fontWeight:800, fontSize:14, cursor:'pointer', marginBottom:16 }}>
            + Upload New Episode
          </button>
          {loading ? (
            <div style={{ textAlign:'center', color:'#64748b', padding:32 }}>Loading episodes…</div>
          ) : episodes.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <div style={{ fontSize:48 }}>📭</div>
              <div style={{ color:'#94a3b8', marginTop:12, fontSize:14 }}>No episodes yet</div>
              <div style={{ color:'#64748b', fontSize:13, marginTop:4 }}>Upload your first episode to get started!</div>
            </div>
          ) : (
            episodes.map(ep => (
              <div key={ep.id} style={{ background:'#1e293b', borderRadius:14, padding:'14px', marginBottom:10, display:'flex', gap:12, alignItems:'flex-start' }}>
                <div style={{ fontSize:28, flexShrink:0, marginTop:2 }}>🎵</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:14, marginBottom:2 }}>{ep.title}</div>
                  <div style={{ color:'#64748b', fontSize:12 }}>
                    S{ep.season} E{ep.episodeNumber}
                    {ep.duration ? ` · ${fmtDur(ep.duration)}` : ''}
                    {ep.fileSize ? ` · ${fmtSize(ep.fileSize)}` : ''}
                  </div>
                  <div style={{ color:'#94a3b8', fontSize:12, marginTop:2 }}>{(ep.plays||0).toLocaleString()} plays</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
                  <button onClick={() => togglePublish(ep)}
                    style={{ background: ep.published ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)', border:'none', borderRadius:8, padding:'5px 10px', color: ep.published ? '#10b981' : '#64748b', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                    {ep.published ? '✓ Live' : '○ Draft'}
                  </button>
                  <button onClick={() => deleteEpisode(ep.id)}
                    style={{ background:'rgba(239,68,68,0.15)', border:'none', borderRadius:8, padding:'5px 10px', color:'#ef4444', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main: PodcastStudioPage ──────────────────────────────────────────────────
export default function PodcastStudioPage() {
  const navigate       = useNavigate();
  const { user }       = useAuth();
  const [shows, setShows]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]     = useState('list'); // 'list' | 'create' | showId
  const [activeShow, setActiveShow] = useState(null);

  async function loadShows() {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'podcast_shows'), where('userId','==', user.uid), orderBy('createdAt','desc'));
      const snap = await getDocs(q);
      setShows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { /* first load before index */ }
    setLoading(false);
  }

  useEffect(() => { loadShows(); }, [user?.uid]);

  if (view === 'create') {
    return (
      <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:80 }}>
        <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => setView('list')} style={{ background:'none', border:'none', color:'#6366f1', fontSize:22, cursor:'pointer', lineHeight:1 }}>‹</button>
          <span style={{ fontSize:18, fontWeight:800, color:'#f1f5f9' }}>New Podcast Show</span>
        </div>
        <div style={{ paddingTop:20 }}>
          <CreateShowForm
            userId={user?.uid}
            onCreated={show => { setShows(arr => [show, ...arr]); setView('list'); }}
          />
        </div>
      </div>
    );
  }

  if (view === 'show' && activeShow) {
    return (
      <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:80 }}>
        <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => { setView('list'); setActiveShow(null); }} style={{ background:'none', border:'none', color:'#6366f1', fontSize:22, cursor:'pointer', lineHeight:1 }}>‹</button>
          <span style={{ fontSize:18, fontWeight:800, color:'#f1f5f9' }}>Podcast Studio</span>
        </div>
        <div style={{ paddingTop:20 }}>
          <ShowDashboard show={activeShow} userId={user?.uid} onBack={() => { setView('list'); setActiveShow(null); }} />
        </div>
      </div>
    );
  }

  // ── Show list (default) ──────────────────────────────────────────────────────
  return (
    <div style={{ background:'#0f172a', minHeight:'100vh', paddingBottom:80 }}>
      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => navigate('/music/podcasts')} style={{ background:'none', border:'none', color:'#6366f1', fontSize:22, cursor:'pointer', lineHeight:1 }}>‹</button>
          <span style={{ fontSize:18, fontWeight:800, color:'#f1f5f9' }}>🎙️ Podcast Studio</span>
        </div>
        <button onClick={() => setView('create')}
          style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:12, padding:'8px 14px', color:'white', fontWeight:700, fontSize:13, cursor:'pointer' }}>
          + New Show
        </button>
      </div>

      {/* Creator tip banner */}
      <div style={{ margin:'16px 16px 0', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:14, padding:'14px 16px' }}>
        <div style={{ fontWeight:700, color:'#a5b4fc', fontSize:14, marginBottom:4 }}>📡 Your shows are published on LynkApp</div>
        <div style={{ color:'#64748b', fontSize:12 }}>Listeners subscribed to your show will be notified each time you upload a new episode.</div>
      </div>

      <div style={{ padding:'16px' }}>
        {loading ? (
          <div style={{ textAlign:'center', color:'#64748b', padding:40 }}>Loading your shows…</div>
        ) : shows.length === 0 ? (
          <div style={{ textAlign:'center', paddingTop:48 }}>
            <div style={{ fontSize:64, lineHeight:1 }}>🎙️</div>
            <div style={{ fontWeight:800, fontSize:18, color:'#f1f5f9', marginTop:16 }}>Start Your Podcast</div>
            <div style={{ color:'#64748b', fontSize:14, marginTop:8, maxWidth:280, margin:'8px auto 0' }}>
              Create your first show, upload episodes, and reach listeners right here on LynkApp.
            </div>
            <button onClick={() => setView('create')}
              style={{ marginTop:24, background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:14, padding:'13px 32px', color:'white', fontWeight:800, fontSize:15, cursor:'pointer' }}>
              🚀 Create My First Show
            </button>
          </div>
        ) : (
          shows.map(show => (
            <div key={show.id}
              onClick={() => { setActiveShow(show); setView('show'); }}
              style={{ display:'flex', gap:14, alignItems:'center', background:'#1e293b', borderRadius:16, padding:'14px', marginBottom:12, cursor:'pointer' }}>
              <div style={{ width:60, height:60, borderRadius:12, background: show.coverUrl ? `url(${show.coverUrl}) center/cover` : 'linear-gradient(135deg,#6366f1,#ec4899)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
                {!show.coverUrl && '🎙️'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:800, color:'#f1f5f9', fontSize:15 }}>{show.title}</div>
                <div style={{ color:'#64748b', fontSize:12, marginTop:2 }}>{show.category}</div>
                <div style={{ color:'#94a3b8', fontSize:12, marginTop:2 }}>{show.episodeCount||0} episodes · {(show.subscriberCount||0).toLocaleString()} subscribers</div>
              </div>
              <span style={{ color:'#334155', fontSize:22 }}>›</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
