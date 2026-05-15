/**
 * youtube-music-service.js
 * ─────────────────────────────────────────────────────────────
 * FREE music player using the YouTube IFrame Player API.
 * Replaces FeedFM ($99/mo) — ZERO cost using our existing
 * VITE_YOUTUBE_API_KEY from ConnectHub-SPA/.env
 *
 * How it works:
 *  1. YouTube Data API v3 — searches for music playlists/videos
 *  2. YouTube IFrame Player API — embeds a player in the DOM
 *
 * Twitter/X dependency: REMOVED entirely.
 * FeedFM dependency:    REPLACED with this service.
 *
 * YouTube IFrame API docs: https://developers.google.com/youtube/iframe_api_reference
 */

const YT_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YT_API_BASE = 'https://www.googleapis.com/youtube/v3';

// ─── Curated free-to-stream music channel/playlist IDs ────────
// These are public YouTube channels that stream copyright-free / licensed music
export const MUSIC_STATIONS = [
  {
    id: 'lofi',
    name: 'Lo-Fi Chill',
    emoji: '☕',
    color: '#6366f1',
    // Lofi Girl live stream (always running)
    videoId: 'jfKfPfyJRdk',
    description: 'Beats to relax/study to',
    genre: 'Lo-Fi',
  },
  {
    id: 'hiphop',
    name: 'Hip Hop Vibes',
    emoji: '🎤',
    color: '#ec4899',
    videoId: '36YnV9STBqc',
    description: 'Hip hop & trap beats',
    genre: 'Hip Hop',
  },
  {
    id: 'pop',
    name: 'Pop Hits 2026',
    emoji: '🎵',
    color: '#f59e0b',
    videoId: 'NA0BXKWF8PE',
    description: 'Top pop hits',
    genre: 'Pop',
  },
  {
    id: 'rnb',
    name: 'R&B Grooves',
    emoji: '🎸',
    color: '#10b981',
    videoId: '4xDzrJKXOOY',
    description: 'Smooth R&B vibes',
    genre: 'R&B',
  },
  {
    id: 'edm',
    name: 'EDM / Dance',
    emoji: '🎧',
    color: '#3b82f6',
    videoId: 'HMnrl0tmd3k',
    description: 'Electronic dance music',
    genre: 'EDM',
  },
  {
    id: 'jazz',
    name: 'Jazz & Soul',
    emoji: '🎷',
    color: '#8b5cf6',
    videoId: 'neV3EPgvZ3g',
    description: 'Smooth jazz for focus',
    genre: 'Jazz',
  },
];

/**
 * Search YouTube for music videos by query.
 * Uses Data API v3 (free quota: 10,000 units/day).
 * @param {string} query - Search term (e.g. "chill beats 2026")
 * @param {number} maxResults - Number of results (default 10)
 * @returns {Promise<Array>} - Normalized track objects
 */
export async function searchYouTubeMusic(query, maxResults = 10) {
  if (!YT_API_KEY) {
    console.warn('[youtube-music] No API key found — using station list instead');
    return MUSIC_STATIONS.slice(0, maxResults).map(stationToTrack);
  }

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q: `${query} official music`,
      type: 'video',
      videoCategoryId: '10', // Music category
      maxResults: String(maxResults),
      key: YT_API_KEY,
    });

    const res = await fetch(`${YT_API_BASE}/search?${params}`);
    if (!res.ok) throw new Error(`YouTube API HTTP ${res.status}`);
    const data = await res.json();

    return (data.items || []).map((item, i) => ({
      id:          item.id.videoId,
      videoId:     item.id.videoId,
      title:       item.snippet.title,
      artist:      item.snippet.channelTitle,
      thumbnail:   item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      description: item.snippet.description?.slice(0, 100),
      rank:        i + 1,
      source:      'youtube',
      embedUrl:    `https://www.youtube.com/embed/${item.id.videoId}?autoplay=1&controls=1`,
      watchUrl:    `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (err) {
    console.warn('[youtube-music] search failed, using stations fallback:', err.message);
    return MUSIC_STATIONS.slice(0, maxResults).map(stationToTrack);
  }
}

/**
 * Fetch trending music videos from YouTube.
 * Uses the Videos endpoint with chart=mostPopular + music category.
 */
export async function fetchYouTubeTrendingMusic(regionCode = 'US', maxResults = 10) {
  if (!YT_API_KEY) return MUSIC_STATIONS.map(stationToTrack);

  try {
    const params = new URLSearchParams({
      part: 'snippet,statistics',
      chart: 'mostPopular',
      videoCategoryId: '10',
      regionCode,
      maxResults: String(maxResults),
      key: YT_API_KEY,
    });

    const res = await fetch(`${YT_API_BASE}/videos?${params}`);
    if (!res.ok) throw new Error(`YouTube API HTTP ${res.status}`);
    const data = await res.json();

    return (data.items || []).map((item, i) => ({
      id:          item.id,
      videoId:     item.id,
      title:       item.snippet.title,
      artist:      item.snippet.channelTitle,
      thumbnail:   item.snippet.thumbnails?.medium?.url,
      views:       formatCount(Number(item.statistics?.viewCount || 0)),
      likes:       formatCount(Number(item.statistics?.likeCount || 0)),
      rank:        i + 1,
      hot:         Number(item.statistics?.viewCount || 0) > 1_000_000,
      source:      'youtube',
      embedUrl:    `https://www.youtube.com/embed/${item.id}?autoplay=1&controls=1`,
      watchUrl:    `https://www.youtube.com/watch?v=${item.id}`,
    }));
  } catch (err) {
    console.warn('[youtube-music] trending fetch failed:', err.message);
    return MUSIC_STATIONS.map(stationToTrack);
  }
}

/**
 * Build a YouTube IFrame embed URL for a given video ID.
 * Autoplay, no related videos from other channels, modest branding.
 */
export function getYouTubeEmbedUrl(videoId, options = {}) {
  const params = new URLSearchParams({
    autoplay:        options.autoplay    ? '1' : '0',
    controls:        options.noControls ? '0' : '1',
    rel:             '0',  // Don't show related from other channels
    modestbranding:  '1',
    fs:              '1',
    cc_load_policy:  '0',
    iv_load_policy:  '3', // Hide annotations
    ...Object.fromEntries(
      Object.entries(options).filter(([k]) => !['autoplay','noControls'].includes(k))
    ),
  });
  return `https://www.youtube.com/embed/${videoId}?${params}`;
}

// ─── Helpers ──────────────────────────────────────────────────

function stationToTrack(s) {
  return {
    id:          s.videoId,
    videoId:     s.videoId,
    title:       s.name,
    artist:      s.description,
    thumbnail:   `https://img.youtube.com/vi/${s.videoId}/mqdefault.jpg`,
    genre:       s.genre,
    emoji:       s.emoji,
    color:       s.color,
    source:      'youtube-station',
    embedUrl:    getYouTubeEmbedUrl(s.videoId, { autoplay: true }),
    watchUrl:    `https://www.youtube.com/watch?v=${s.videoId}`,
  };
}

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)    return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}
