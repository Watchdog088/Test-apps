/**
 * deezer-service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Deezer Public API — NO API KEY REQUIRED for read operations.
 * All calls go through a CORS proxy because Deezer does not send
 * Access-Control-Allow-Origin headers for browser requests.
 *
 * CORS proxy used: https://corsproxy.io/?  (free, reliable)
 * Deezer API docs: https://developers.deezer.com/api
 *
 * Features implemented:
 *  1. Search tracks, artists, albums, playlists, radio
 *  2. Get track details (preview URL, album art, BPM, etc.)
 *  3. Get artist details + top tracks + related artists
 *  4. Get album details + tracklist
 *  5. Get chart (top tracks/albums/artists/playlists by country)
 *  6. Get playlist details + tracks
 *  7. Get radio stations (Deezer editorial radio)
 *  8. Get genre list
 *  9. Get editorial (featured) content
 * 10. Build Deezer embed widget URL for a track / album / playlist
 *
 * Note: Deezer free tier gives 30-second audio previews via preview_url.
 *       Full playback requires OAuth + Deezer Premium user account.
 */

const BASE    = 'https://api.deezer.com';
const PROXY   = 'https://corsproxy.io/?';

// ─── Internal helper ───────────────────────────────────────────────────────
async function deezerFetch(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  // Route through CORS proxy
  const proxyUrl = `${PROXY}${encodeURIComponent(url.toString())}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`Deezer API error ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Deezer API error');
  return data;
}

// ─── Normalise a Deezer track object ──────────────────────────────────────
function normaliseTrack(t) {
  return {
    id:           t.id,
    title:        t.title || t.title_short,
    duration:     t.duration,        // seconds
    preview:      t.preview,         // 30-sec MP3 preview URL
    rank:         t.rank,
    explicit:     t.explicit_lyrics,
    bpm:          t.bpm,
    gain:         t.gain,
    artist: {
      id:         t.artist?.id,
      name:       t.artist?.name,
      picture:    t.artist?.picture_medium,
      link:       t.artist?.link,
    },
    album: {
      id:         t.album?.id,
      title:      t.album?.title,
      cover:      t.album?.cover_medium,
      releaseDate: t.album?.release_date,
    },
    link:         t.link,
  };
}

// ─── 1. Search ─────────────────────────────────────────────────────────────
/**
 * Search Deezer.
 * @param {string} query
 * @param {object} opts - { type, limit, index }
 *   type: 'track' | 'artist' | 'album' | 'playlist' | 'radio' | 'user' (default: 'track')
 */
export async function deezerSearch(query, opts = {}) {
  const type  = opts.type || 'track';
  const data  = await deezerFetch(`/search/${type}`, {
    q:     query,
    limit: opts.limit || 20,
    index: opts.index || 0,
  });
  return {
    total: data.total,
    next:  data.next,
    items: (data.data || []).map(item => {
      if (type === 'track')   return normaliseTrack(item);
      if (type === 'artist')  return normaliseArtist(item);
      if (type === 'album')   return normaliseAlbum(item);
      if (type === 'playlist') return normalisePlaylist(item);
      return item;
    }),
  };
}

function normaliseArtist(a) {
  return {
    id:       a.id,
    name:     a.name,
    picture:  a.picture_medium,
    fans:     a.nb_fan,
    albums:   a.nb_album,
    link:     a.link,
    radio:    a.radio,
    tracklist: a.tracklist,
  };
}

function normaliseAlbum(al) {
  return {
    id:          al.id,
    title:       al.title,
    cover:       al.cover_medium,
    releaseDate: al.release_date,
    trackCount:  al.nb_tracks,
    duration:    al.duration,
    fans:        al.fans,
    explicit:    al.explicit_lyrics,
    artist:      { id: al.artist?.id, name: al.artist?.name, picture: al.artist?.picture_small },
    link:        al.link,
    tracklist:   al.tracklist,
    genres:      al.genres?.data?.map(g => g.name) || [],
  };
}

function normalisePlaylist(pl) {
  return {
    id:          pl.id,
    title:       pl.title,
    picture:     pl.picture_medium,
    trackCount:  pl.nb_tracks,
    duration:    pl.duration,
    fans:        pl.fans,
    public:      pl.public,
    creator:     { id: pl.user?.id, name: pl.user?.name },
    link:        pl.link,
    tracklist:   pl.tracklist,
  };
}

// ─── 2. Track Details ──────────────────────────────────────────────────────
export async function getTrack(trackId) {
  const data = await deezerFetch(`/track/${trackId}`);
  return normaliseTrack(data);
}

// ─── 3. Artist Details + Top Tracks + Related ─────────────────────────────
export async function getArtist(artistId) {
  const [artist, topTracks, related] = await Promise.all([
    deezerFetch(`/artist/${artistId}`),
    deezerFetch(`/artist/${artistId}/top`, { limit: 10 }),
    deezerFetch(`/artist/${artistId}/related`, { limit: 6 }),
  ]);
  return {
    ...normaliseArtist(artist),
    topTracks: (topTracks.data || []).map(normaliseTrack),
    related:   (related.data || []).map(normaliseArtist),
  };
}

// ─── 4. Album Details + Tracklist ─────────────────────────────────────────
export async function getAlbum(albumId) {
  const data = await deezerFetch(`/album/${albumId}`);
  return {
    ...normaliseAlbum(data),
    tracks: (data.tracks?.data || []).map(normaliseTrack),
  };
}

// ─── 5. Charts ─────────────────────────────────────────────────────────────
/**
 * Get Deezer top charts.
 * @param {object} opts - { limit }  (charts are global)
 * Returns { tracks, albums, artists, playlists, podcasts }
 */
export async function getCharts(opts = {}) {
  const data = await deezerFetch('/chart', { limit: opts.limit || 10 });
  return {
    tracks:    (data.tracks?.data   || []).map(normaliseTrack),
    albums:    (data.albums?.data   || []).map(normaliseAlbum),
    artists:   (data.artists?.data  || []).map(normaliseArtist),
    playlists: (data.playlists?.data|| []).map(normalisePlaylist),
  };
}

// ─── 6. Playlist Details + Tracks ─────────────────────────────────────────
export async function getPlaylist(playlistId) {
  const data = await deezerFetch(`/playlist/${playlistId}`);
  return {
    ...normalisePlaylist(data),
    tracks: (data.tracks?.data || []).map(normaliseTrack),
  };
}

// ─── 7. Editorial Radio Stations ──────────────────────────────────────────
/**
 * Get a list of Deezer radio stations (editorial).
 */
export async function getRadioStations(limit = 25) {
  const data = await deezerFetch('/radio', { limit });
  return (data.data || []).map(r => ({
    id:       r.id,
    title:    r.title,
    picture:  r.picture_medium,
    tracklist: r.tracklist,
  }));
}

// ─── 8. Genre List ────────────────────────────────────────────────────────
export async function getGenres() {
  const data = await deezerFetch('/genre');
  return (data.data || []).map(g => ({
    id:      g.id,
    name:    g.name,
    picture: g.picture_medium,
  }));
}

// ─── 9. Editorial / Featured Content ─────────────────────────────────────
/**
 * Get Deezer editorial selections (featured playlists, new releases, charts).
 */
export async function getEditorial(editorialId = 0) {
  // editorial id 0 = All genres
  const data = await deezerFetch(`/editorial/${editorialId}/selection`);
  return (data.data || []).map(normaliseAlbum);
}

// ─── 10. Embed Widget URL ─────────────────────────────────────────────────
/**
 * Build a Deezer embed widget URL (use in an <iframe>).
 * type: 'track' | 'album' | 'playlist' | 'artist' | 'radio'
 * theme: 'auto' | 'dark' | 'light'
 */
export function getDeezerEmbedUrl(type, id, opts = {}) {
  const theme    = opts.theme    || 'auto';
  const autoplay = opts.autoplay ? 1 : 0;
  return `https://widget.deezer.com/widget/${theme}/${type}/${id}?autoplay=${autoplay}`;
}

// ─── Utility: format seconds → m:ss ───────────────────────────────────────
export function formatDuration(seconds) {
  const s = parseInt(seconds) || 0;
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, '0');
  return `${m}:${ss}`;
}
