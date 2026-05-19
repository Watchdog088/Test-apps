/**
 * youtube-data-service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * YouTube Data API v3 — ADDITIONAL USES beyond the music player.
 * Uses VITE_YOUTUBE_API_KEY from ConnectHub-SPA/.env
 *
 * Covers:
 *  1. Video search with filters (type, order, duration, region)
 *  2. Channel details & subscriber counts
 *  3. Video details (stats, description, tags, captions)
 *  4. Trending / most-popular videos by category
 *  5. Live stream detection (check if a video is currently live)
 *  6. Playlist items (load all videos from a playlist)
 *  7. Related videos (use search with relatedToVideoId)
 *  8. Channel uploads (get latest uploads from a channel)
 *  9. Comment threads (read top comments on a video)
 * 10. Video categories (by region code)
 *
 * Quota: 10,000 units/day free.  Search costs 100 units; most reads cost 1–3.
 * Docs:  https://developers.google.com/youtube/v3/docs
 */

const API_KEY  = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// ─── Internal fetch helper ─────────────────────────────────────────────────
async function ytFetch(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set('key', API_KEY);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `YouTube API error ${res.status}`);
  }
  return res.json();
}

// ─── 1. Video Search ───────────────────────────────────────────────────────
/**
 * Search for videos.
 * @param {string}  query
 * @param {object}  opts  - { maxResults, order, videoDuration, regionCode, videoCategoryId, pageToken }
 * @returns  { items: [], nextPageToken, prevPageToken, totalResults }
 */
export async function searchVideos(query, opts = {}) {
  const data = await ytFetch('search', {
    part: 'snippet',
    type: 'video',
    q: query,
    maxResults: opts.maxResults || 10,
    order: opts.order || 'relevance',           // relevance | date | rating | viewCount
    videoDuration: opts.videoDuration || 'any', // any | short | medium | long
    regionCode: opts.regionCode || 'US',
    videoCategoryId: opts.videoCategoryId,
    pageToken: opts.pageToken,
    safeSearch: 'moderate',
  });
  return {
    items: (data.items || []).map(item => ({
      videoId:      item.id.videoId,
      title:        item.snippet.title,
      description:  item.snippet.description,
      thumbnail:    item.snippet.thumbnails?.medium?.url,
      channelTitle: item.snippet.channelTitle,
      channelId:    item.snippet.channelId,
      publishedAt:  item.snippet.publishedAt,
    })),
    nextPageToken: data.nextPageInfo?.nextPageToken,
    totalResults:  data.pageInfo?.totalResults || 0,
  };
}

// ─── 2. Channel Details ────────────────────────────────────────────────────
/**
 * Get details for one or more channel IDs.
 * @param {string|string[]} channelIds
 */
export async function getChannelDetails(channelIds) {
  const ids = Array.isArray(channelIds) ? channelIds.join(',') : channelIds;
  const data = await ytFetch('channels', {
    part: 'snippet,statistics,brandingSettings',
    id: ids,
    maxResults: 10,
  });
  return (data.items || []).map(ch => ({
    channelId:       ch.id,
    title:           ch.snippet.title,
    description:     ch.snippet.description,
    thumbnail:       ch.snippet.thumbnails?.medium?.url,
    banner:          ch.brandingSettings?.image?.bannerExternalUrl,
    subscribers:     ch.statistics?.subscriberCount,
    videoCount:      ch.statistics?.videoCount,
    viewCount:       ch.statistics?.viewCount,
    country:         ch.snippet.country,
    customUrl:       ch.snippet.customUrl,
    publishedAt:     ch.snippet.publishedAt,
  }));
}

// ─── 3. Video Details ──────────────────────────────────────────────────────
/**
 * Get full stats + snippet for one or more video IDs.
 * @param {string|string[]} videoIds
 */
export async function getVideoDetails(videoIds) {
  const ids = Array.isArray(videoIds) ? videoIds.join(',') : videoIds;
  const data = await ytFetch('videos', {
    part: 'snippet,statistics,contentDetails,liveStreamingDetails',
    id: ids,
  });
  return (data.items || []).map(v => ({
    videoId:      v.id,
    title:        v.snippet.title,
    description:  v.snippet.description,
    tags:         v.snippet.tags || [],
    thumbnail:    v.snippet.thumbnails?.maxres?.url || v.snippet.thumbnails?.high?.url,
    channelTitle: v.snippet.channelTitle,
    channelId:    v.snippet.channelId,
    publishedAt:  v.snippet.publishedAt,
    duration:     v.contentDetails?.duration,   // ISO 8601 e.g. PT4M13S
    viewCount:    v.statistics?.viewCount,
    likeCount:    v.statistics?.likeCount,
    commentCount: v.statistics?.commentCount,
    isLive:       v.snippet.liveBroadcastContent === 'live',
    isUpcoming:   v.snippet.liveBroadcastContent === 'upcoming',
    liveStartTime: v.liveStreamingDetails?.actualStartTime,
    concurrentViewers: v.liveStreamingDetails?.concurrentViewers,
  }));
}

// ─── 4. Trending Videos ────────────────────────────────────────────────────
/**
 * Get most-popular videos (trending) for a given region + optional category.
 * @param {object} opts - { regionCode, videoCategoryId, maxResults }
 *
 * Category IDs (US): 10=Music, 20=Gaming, 24=Entertainment, 25=News, 28=Science
 */
export async function getTrendingVideos(opts = {}) {
  const data = await ytFetch('videos', {
    part: 'snippet,statistics,contentDetails',
    chart: 'mostPopular',
    regionCode: opts.regionCode || 'US',
    videoCategoryId: opts.videoCategoryId,
    maxResults: opts.maxResults || 20,
    pageToken: opts.pageToken,
  });
  return {
    items: (data.items || []).map(v => ({
      videoId:      v.id,
      title:        v.snippet.title,
      thumbnail:    v.snippet.thumbnails?.high?.url,
      channelTitle: v.snippet.channelTitle,
      publishedAt:  v.snippet.publishedAt,
      viewCount:    v.statistics?.viewCount,
      likeCount:    v.statistics?.likeCount,
      duration:     v.contentDetails?.duration,
    })),
    nextPageToken: data.nextPageToken,
  };
}

// ─── 5. Live Stream Detection ──────────────────────────────────────────────
/**
 * Check whether a video is currently live-streaming.
 * Returns { isLive, concurrentViewers, scheduledStart }
 */
export async function checkIsLive(videoId) {
  const [video] = await getVideoDetails(videoId);
  if (!video) return { isLive: false };
  return {
    isLive:            video.isLive,
    isUpcoming:        video.isUpcoming,
    concurrentViewers: video.concurrentViewers,
    scheduledStart:    video.liveStartTime,
  };
}

// ─── 6. Playlist Items ─────────────────────────────────────────────────────
/**
 * Load all videos in a playlist (auto-paginates up to maxResults).
 * @param {string} playlistId
 * @param {number} maxResults   max 50 per call; set higher to auto-paginate
 */
export async function getPlaylistItems(playlistId, maxResults = 50) {
  const items = [];
  let pageToken;
  do {
    const data = await ytFetch('playlistItems', {
      part: 'snippet,contentDetails',
      playlistId,
      maxResults: Math.min(maxResults - items.length, 50),
      pageToken,
    });
    (data.items || []).forEach(item => items.push({
      videoId:     item.contentDetails.videoId,
      title:       item.snippet.title,
      thumbnail:   item.snippet.thumbnails?.medium?.url,
      channelTitle: item.snippet.channelTitle,
      position:    item.snippet.position,
      publishedAt: item.snippet.publishedAt,
    }));
    pageToken = data.nextPageToken;
  } while (pageToken && items.length < maxResults);
  return items;
}

// ─── 7. Related Videos ─────────────────────────────────────────────────────
/**
 * Find videos related to a given videoId.
 * NOTE: relatedToVideoId requires type=video and no query.
 */
export async function getRelatedVideos(videoId, maxResults = 10) {
  const data = await ytFetch('search', {
    part: 'snippet',
    type: 'video',
    relatedToVideoId: videoId,
    maxResults,
  });
  return (data.items || []).map(item => ({
    videoId:      item.id.videoId,
    title:        item.snippet.title,
    thumbnail:    item.snippet.thumbnails?.medium?.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt:  item.snippet.publishedAt,
  }));
}

// ─── 8. Channel Latest Uploads ─────────────────────────────────────────────
/**
 * Get the latest N uploads from a channel.
 * First resolves the channel's uploads playlist, then fetches items.
 */
export async function getChannelLatestUploads(channelId, maxResults = 10) {
  // Get the "uploads" playlist ID from the channel
  const chData = await ytFetch('channels', {
    part: 'contentDetails',
    id: channelId,
  });
  const uploadsPlaylistId = chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) return [];
  return getPlaylistItems(uploadsPlaylistId, maxResults);
}

// ─── 9. Comment Threads ────────────────────────────────────────────────────
/**
 * Get top-level comments for a video.
 * @param {string} videoId
 * @param {object} opts  - { maxResults, order }  order: time | relevance
 */
export async function getVideoComments(videoId, opts = {}) {
  const data = await ytFetch('commentThreads', {
    part: 'snippet',
    videoId,
    maxResults: opts.maxResults || 20,
    order: opts.order || 'relevance',
    textFormat: 'plainText',
  });
  return (data.items || []).map(item => {
    const c = item.snippet.topLevelComment.snippet;
    return {
      commentId:    item.id,
      authorName:   c.authorDisplayName,
      authorAvatar: c.authorProfileImageUrl,
      text:         c.textDisplay,
      likeCount:    c.likeCount,
      publishedAt:  c.publishedAt,
      replyCount:   item.snippet.totalReplyCount,
    };
  });
}

// ─── 10. Video Categories ──────────────────────────────────────────────────
/**
 * Get the list of video categories for a region.
 * @param {string} regionCode  e.g. 'US', 'GB'
 */
export async function getVideoCategories(regionCode = 'US') {
  const data = await ytFetch('videoCategories', {
    part: 'snippet',
    regionCode,
    hl: 'en_US',
  });
  return (data.items || [])
    .filter(cat => cat.snippet.assignable)
    .map(cat => ({
      categoryId:   cat.id,
      title:        cat.snippet.title,
    }));
}

// ─── Convenience: parse ISO 8601 duration to human-readable ───────────────
export function parseDuration(iso) {
  if (!iso) return '';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return iso;
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Convenience: format large numbers ────────────────────────────────────
export function formatCount(n) {
  const num = parseInt(n) || 0;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000)     return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)         return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}
