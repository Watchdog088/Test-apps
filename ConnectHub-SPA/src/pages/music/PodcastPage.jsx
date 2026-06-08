// src/pages/music/PodcastPage.jsx
// Podcast section with Discover + Library tabs — powered by the free iTunes Search API
// No API key required. Library stored in localStorage.
//
// TABS:
//  1. Discover  — Trending shows, category browsing, search
//  2. Library   — Subscribed shows + continue-listening episodes
//  3. (inline)  — Episode list + audio player when a podcast is selected

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  searchPodcasts, browsePodcastsByGenre, getPodcastEpisodes, getTrendingPodcasts,
  getSubscriptions, isSubscribed, subscribe, unsubscribe,
  getProgress, saveProgress, formatDuration, formatDate,
  PODCAST_GENRES,
} from '@services/podcast-service';

// ─── colour palette ───────────────────────────────────────────────────────────
const C = {
  bg:      'rgba(10,8,30,1)',
  card:    'rgba(255,255,255,0.05)',
  border:  'rgba(255,255,255,0.09)',
  accent:  '#6366f1',
  accent2: '#ec4899',
  text:    '#f1f5f9',
  sub:     '#94a3b8',
  muted:   '#475569',
};

// ─── tiny helpers ─────────────────────────────────────────────────────────────
const px = (style) => style;

function PodcastCard({ podcast, onClick, subscribed, onToggleSub }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer',
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
        padding: 12, transition: 'background 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
      onMouseLeave={e => e.currentTarget.style.background = C.card}
    >
      {/* Cover art */}
      <div style={{ position: 'relative' }}>
        <img
          src={podcast.cover || ''}
          alt={podcast.name}
          loading="lazy"
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          style={{ width: '100%', aspectRatio: '1/1', borderRadius: 12, objectFit: 'cover', display: 'block' }}
        />
        {/* fallback emoji cover */}
        <div style={{
          display: 'none', width: '100%', aspectRatio: '1/1', borderRadius: 12,
          background: `linear-gradient(135deg,${C.accent},${C.accent2})`,
          alignItems: 'center', justifyContent: 'center', fontSize: 36,
        }}>🎙️</div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {podcast.name}
        </div>
        <div style={{ fontSize: 11, color: C.sub, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {podcast.author}
        </div>
        {podcast.episodes > 0 && (
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{podcast.episodes} episodes</div>
        )}
      </div>

      {/* Subscribe button */}
      <button
        onClick={e => { e.stopPropagation(); onToggleSub(podcast); }}
        style={{
          alignSelf: 'flex-start', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          border: `1px solid ${subscribed ? C.accent2 : C.accent}`,
          background: subscribed ? `rgba(236,72,153,0.15)` : `rgba(99,102,241,0.15)`,
          color: subscribed ? C.accent2 : C.accent, cursor: 'pointer',
        }}
      >
        {subscribed ? '✓ Following' : '+ Follow'}
      </button>
    </div>
  );
}

function EpisodeRow({ episode, onPlay, isPlaying }) {
  const prog = getProgress(episode.id);
  const pct  = episode.duration > 0 ? Math.min(100, Math.round((prog / episode.duration) * 100)) : 0;
  return (
    <div
      onClick={() => onPlay(episode)}
      style={{
        display: 'flex', gap: 12, padding: '12px 16px', cursor: 'pointer',
        borderBottom: `1px solid ${C.border}`,
        background: isPlaying ? 'rgba(99,102,241,0.10)' : 'transparent',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (!isPlaying) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { if (!isPlaying) e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Play indicator */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: isPlaying ? `linear-gradient(135deg,${C.accent},${C.accent2})` : C.card,
        border: `1px solid ${isPlaying ? 'transparent' : C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, color: isPlaying ? 'white' : C.sub,
      }}>
        {isPlaying ? '▶' : '▷'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: C.text, lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {episode.title}
        </div>
        <div style={{ fontSize: 11, color: C.sub, marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {episode.releaseDate && <span>{formatDate(episode.releaseDate)}</span>}
          {episode.duration > 0 && <span>⏱ {formatDuration(episode.duration)}</span>}
          {pct > 0 && pct < 99 && <span style={{ color: C.accent }}>▶ {pct}% played</span>}
          {pct >= 99 && <span style={{ color: '#22c55e' }}>✓ Done</span>}
        </div>
        {/* mini progress bar */}
        {pct > 0 && (
          <div style={{ height: 2, background: C.border, borderRadius: 1, marginTop: 6 }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 1,
              background: `linear-gradient(90deg,${C.accent},${C.accent2})` }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mini Audio Player bar ────────────────────────────────────────────────────
function AudioPlayer({ episode, podcast, onClose }) {
  const audioRef   = useRef(null);
  const [playing,  setPlaying]  = useState(false);
  const [progress, setProgress] = useState(() => getProgress(episode.id));
  const [duration, setDuration] = useState(episode.duration || 0);
  const [speed,    setSpeed]    = useState(1);
  const progRef = useRef(progress);

  const fmt = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${m}:${String(sec).padStart(2,'0')}`;
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    // seek to saved progress
    el.currentTime = getProgress(episode.id);
    el.playbackRate = speed;
  }, [episode.id]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.playbackRate = speed;
  }, [speed]);

  const onTimeUpdate = () => {
    const el = audioRef.current;
    if (!el) return;
    setProgress(el.currentTime);
    progRef.current = el.currentTime;
    saveProgress(episode.id, Math.floor(el.currentTime));
  };

  const onLoadedMeta = () => {
    if (audioRef.current) setDuration(audioRef.current.duration || duration);
  };

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const t = ratio * duration;
    if (audioRef.current) audioRef.current.currentTime = t;
    setProgress(t);
  };

  const skip = (secs) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, (audioRef.current.currentTime || 0) + secs);
    }
  };

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { el.play().then(() => setPlaying(true)).catch(() => {}); }
  };

  const pct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <div style={{
      position: 'fixed', bottom: 56, left: 0, right: 0,
      background: 'rgba(10,8,30,0.98)', backdropFilter: 'blur(24px)',
      borderTop: `1px solid rgba(99,102,241,0.3)`,
      zIndex: 300, padding: '10px 16px 12px',
    }}>
      {episode.audioUrl && (
        <audio ref={audioRef} src={episode.audioUrl}
          onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoadedMeta}
          onEnded={() => setPlaying(false)} />
      )}

      {/* Podcast + episode name */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: C.sub, marginBottom: 1 }}>{podcast?.name}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {episode.title}
          </div>
        </div>
        <button onClick={onClose} style={{ color: C.muted, fontSize: 18, lineHeight: 1, padding: '0 4px', marginLeft: 8 }}
          aria-label="Close player">✕</button>
      </div>

      {/* Progress bar */}
      <div onClick={seek} style={{ height: 4, background: C.border, borderRadius: 2, cursor: 'pointer', marginBottom: 8, userSelect: 'none' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2,
          background: `linear-gradient(90deg,${C.accent},${C.accent2})`, transition: 'width 0.5s linear' }} />
      </div>

      {/* Time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.muted, marginBottom: 10 }}>
        <span>{fmt(progress)}</span>
        <span>{duration ? fmt(duration) : '--:--'}</span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <button onClick={() => skip(-15)} style={{ color: C.sub, fontSize: 13, fontWeight: 700 }} aria-label="Back 15s">
          ↺15
        </button>
        <button onClick={togglePlay} style={{
          width: 48, height: 48, borderRadius: '50%',
          background: `linear-gradient(135deg,${C.accent},${C.accent2})`,
          border: 'none', color: 'white', fontSize: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={() => skip(30)} style={{ color: C.sub, fontSize: 13, fontWeight: 700 }} aria-label="Forward 30s">
          30↻
        </button>
        {/* Speed control */}
        <button onClick={() => setSpeed(s => s === 1 ? 1.5 : s === 1.5 ? 2 : 1)}
          style={{
            padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700,
            background: C.card, border: `1px solid ${C.border}`, color: C.accent, cursor: 'pointer',
          }}>
          {speed}×
        </button>
      </div>

      {!episode.audioUrl && (
        <div style={{ textAlign: 'center', fontSize: 11, color: C.muted, marginTop: 8 }}>
          Audio not available for this episode — open in your podcast app
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PodcastPage() {
  const navigate = useNavigate();

  const [tab,            setTab]            = useState('discover'); // 'discover' | 'library'
  const [query,          setQuery]          = useState('');
  const [searchResults,  setSearchResults]  = useState([]);
  const [trending,       setTrending]       = useState([]);
  const [genrePodcasts,  setGenrePodcasts]  = useState([]);
  const [activeGenre,    setActiveGenre]    = useState(PODCAST_GENRES[0]);
  const [selectedPodcast,setSelectedPodcast]= useState(null);
  const [episodes,       setEpisodes]       = useState([]);
  const [playingEp,      setPlayingEp]      = useState(null);
  const [subs,           setSubs]           = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [epLoading,      setEpLoading]      = useState(false);
  const searchTimer = useRef(null);

  // Load trending + subscriptions on mount
  useEffect(() => {
    setSubs(getSubscriptions());
    setLoading(true);
    getTrendingPodcasts()
      .then(setTrending)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load genre podcasts when genre changes
  useEffect(() => {
    setLoading(true);
    browsePodcastsByGenre(activeGenre.id)
      .then(setGenrePodcasts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeGenre]);

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!query.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(() => {
      setLoading(true);
      searchPodcasts(query)
        .then(setSearchResults)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 450);
    return () => clearTimeout(searchTimer.current);
  }, [query]);

  // Load episodes for selected podcast
  useEffect(() => {
    if (!selectedPodcast) return;
    setEpLoading(true);
    setEpisodes([]);
    getPodcastEpisodes(selectedPodcast.collectionId)
      .then(setEpisodes)
      .catch(() => {})
      .finally(() => setEpLoading(false));
  }, [selectedPodcast]);

  const handleToggleSub = useCallback((podcast) => {
    if (isSubscribed(podcast.id)) {
      unsubscribe(podcast.id);
    } else {
      subscribe(podcast);
    }
    setSubs(getSubscriptions());
  }, []);

  const displayed = query.trim() ? searchResults : (selectedPodcast ? [] : trending);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: C.bg, minHeight: '100dvh', color: C.text, paddingBottom: playingEp ? 180 : 80 }}>

      {/* ── Header ── */}
      <div style={{ padding: '20px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {selectedPodcast ? (
          <button onClick={() => { setSelectedPodcast(null); setEpisodes([]); }}
            style={{ color: C.sub, fontSize: 20, lineHeight: 1, padding: '4px 2px', flexShrink: 0 }}
            aria-label="Back">←</button>
        ) : (
          <button onClick={() => navigate('/music')}
            style={{ color: C.sub, fontSize: 20, lineHeight: 1, padding: '4px 2px', flexShrink: 0 }}
            aria-label="Back to Music">←</button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontWeight: 900, fontSize: 22, margin: 0 }}>
            {selectedPodcast ? selectedPodcast.name : '🎙️ Podcasts'}
          </h1>
          {selectedPodcast && (
            <p style={{ fontSize: 12, color: C.sub, margin: '2px 0 0' }}>{selectedPodcast.author}</p>
          )}
        </div>
        {selectedPodcast && (
          <button
            onClick={() => handleToggleSub(selectedPodcast)}
            style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700,
              border: `1px solid ${isSubscribed(selectedPodcast.id) ? C.accent2 : C.accent}`,
              background: isSubscribed(selectedPodcast.id) ? 'rgba(236,72,153,0.15)' : 'rgba(99,102,241,0.15)',
              color: isSubscribed(selectedPodcast.id) ? C.accent2 : C.accent, cursor: 'pointer', flexShrink: 0,
            }}
          >
            {isSubscribed(selectedPodcast.id) ? '✓ Following' : '+ Follow'}
          </button>
        )}
      </div>

      {/* ── Creator Studio CTA ── */}
      {!selectedPodcast && (
        <div
          onClick={() => navigate('/music/podcasts/studio')}
          style={{
            margin: '0 16px 4px',
            borderRadius: 12,
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.28)',
            padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 22, flexShrink: 0 }}>🎙️</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#a5b4fc' }}>Start or manage your podcast →</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>Upload episodes · Analytics · Your show dashboard</div>
          </div>
        </div>
      )}

      {/* ── Tabs (only when not in episode list view) ── */}
      {!selectedPodcast && (
        <div style={{ display: 'flex', gap: 4, padding: '0 16px 16px', borderBottom: `1px solid ${C.border}` }}>
          {[['discover', '🔍 Discover'], ['library', '📚 Library']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '8px 18px', borderRadius: 20, fontWeight: 700, fontSize: 13, cursor: 'pointer',
              background: tab === key ? `linear-gradient(135deg,${C.accent},${C.accent2})` : C.card,
              border: `1px solid ${tab === key ? 'transparent' : C.border}`,
              color: tab === key ? 'white' : C.sub, transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>
      )}

      {/* ── EPISODE LIST VIEW ── */}
      {selectedPodcast && (
        <div>
          {/* Podcast meta */}
          <div style={{ display: 'flex', gap: 14, padding: '0 16px 16px', borderBottom: `1px solid ${C.border}` }}>
            {selectedPodcast.cover && (
              <img src={selectedPodcast.cover} alt={selectedPodcast.name}
                style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: C.sub }}>{selectedPodcast.genre}</div>
              {selectedPodcast.episodes > 0 && (
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{selectedPodcast.episodes} episodes</div>
              )}
            </div>
          </div>

          {epLoading && (
            <div style={{ textAlign: 'center', padding: 32, color: C.muted }}>Loading episodes…</div>
          )}
          {!epLoading && episodes.length === 0 && (
            <div style={{ textAlign: 'center', padding: 32, color: C.muted }}>
              No episodes available via iTunes.<br />
              <a href={selectedPodcast.itunesUrl} target="_blank" rel="noopener noreferrer"
                style={{ color: C.accent, textDecoration: 'none', fontWeight: 700, marginTop: 8, display: 'inline-block' }}>
                Open in iTunes →
              </a>
            </div>
          )}
          {episodes.map(ep => (
            <EpisodeRow key={ep.id} episode={ep}
              isPlaying={playingEp?.id === ep.id}
              onPlay={setPlayingEp} />
          ))}
        </div>
      )}

      {/* ── DISCOVER TAB ── */}
      {!selectedPodcast && tab === 'discover' && (
        <div style={{ padding: '16px 16px 0' }}>

          {/* Search bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, background: C.card,
            border: `1px solid ${C.border}`, borderRadius: 14, padding: '10px 14px', marginBottom: 20,
          }}>
            <span style={{ fontSize: 16, color: C.muted }}>🔍</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search podcasts…"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: C.text, fontSize: 15, caretColor: C.accent,
              }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ color: C.muted, fontSize: 16 }}>✕</button>
            )}
          </div>

          {/* Category chips */}
          {!query && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 10 }}>
                Browse Categories
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                {PODCAST_GENRES.map(g => (
                  <button key={g.id} onClick={() => setActiveGenre(g)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, whiteSpace: 'nowrap',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                      background: activeGenre.id === g.id
                        ? `linear-gradient(135deg,${C.accent},${C.accent2})`
                        : C.card,
                      border: `1px solid ${activeGenre.id === g.id ? 'transparent' : C.border}`,
                      color: activeGenre.id === g.id ? 'white' : C.sub,
                    }}>
                    {g.emoji} {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results heading */}
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>
            {query ? `Results for "${query}"` : loading ? 'Loading…' : activeGenre.name}
          </div>

          {loading && !query && (
            <div style={{ textAlign: 'center', padding: 32, color: C.muted }}>Loading podcasts…</div>
          )}

          {/* Grid of podcast cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, paddingBottom: 24 }}>
            {(query ? searchResults : genrePodcasts).map(p => (
              <PodcastCard
                key={p.id} podcast={p}
                subscribed={subs.some(s => s.id === p.id)}
                onClick={() => setSelectedPodcast(p)}
                onToggleSub={handleToggleSub}
              />
            ))}
          </div>

          {/* Trending section (only when no search + no genre loading) */}
          {!query && trending.length > 0 && (
            <div style={{ marginTop: 8, paddingBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>
                🔥 Trending Now
              </div>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
                {trending.map(p => (
                  <div key={p.id} onClick={() => setSelectedPodcast(p)}
                    style={{ flexShrink: 0, width: 130, cursor: 'pointer' }}>
                    <img src={p.cover} alt={p.name} onError={e => e.target.style.display='none'}
                      style={{ width: 130, height: 130, borderRadius: 14, objectFit: 'cover', display: 'block' }} />
                    <div style={{ fontWeight: 700, fontSize: 12, color: C.text, marginTop: 6,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: C.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.author}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LIBRARY TAB ── */}
      {!selectedPodcast && tab === 'library' && (
        <div style={{ padding: '16px 0 0' }}>
          {subs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 32px', color: C.muted }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎙️</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.sub, marginBottom: 8 }}>No subscriptions yet</div>
              <div style={{ fontSize: 13 }}>Go to Discover and follow some podcasts!</div>
              <button onClick={() => setTab('discover')} style={{
                marginTop: 20, padding: '10px 24px', borderRadius: 20, fontWeight: 700, fontSize: 14,
                background: `linear-gradient(135deg,${C.accent},${C.accent2})`,
                border: 'none', color: 'white', cursor: 'pointer',
              }}>Browse Podcasts →</button>
            </div>
          ) : (
            <>
              <div style={{ padding: '0 16px', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>
                Your Shows ({subs.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {subs.map(p => (
                  <div key={p.id}
                    onClick={() => setSelectedPodcast(p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      borderBottom: `1px solid ${C.border}`, cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <img src={p.cover} alt={p.name} onError={e => e.target.style.display='none'}
                      style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.text,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: C.sub }}>{p.author}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); handleToggleSub(p); }}
                      style={{ color: C.accent2, fontSize: 18, lineHeight: 1, padding: '4px 6px' }}
                      aria-label="Unfollow">✕</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Audio Player (fixed bottom) ── */}
      {playingEp && (
        <AudioPlayer
          episode={playingEp}
          podcast={selectedPodcast}
          onClose={() => setPlayingEp(null)}
        />
      )}
    </div>
  );
}
