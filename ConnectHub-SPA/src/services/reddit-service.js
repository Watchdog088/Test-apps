/**
 * reddit-service.js
 * ─────────────────────────────────────────────────────────────
 * Uses Reddit's PUBLIC JSON API — NO API KEY REQUIRED.
 * Reddit exposes .json on any public URL, e.g.:
 *   https://www.reddit.com/r/popular.json
 *
 * Twitter/X has been removed entirely (costs $100+/mo).
 * Reddit public JSON is the free replacement for social trending.
 *
 * Rate limit: ~60 requests/min unauthenticated (plenty for app use)
 * Docs: https://www.reddit.com/dev/api (no auth needed for GET)
 */

const REDDIT_BASE = 'https://www.reddit.com';

// Map our app categories to reddit subreddits
const CATEGORY_SUBREDDITS = {
  All:     'popular',
  Music:   'Music+hiphopheads+WeAreTheMusicMakers',
  Videos:  'videos+youtubehaiku',
  News:    'worldnews+news',
  Sports:  'sports+nba+nfl+soccer',
  Tech:    'technology+programming+MachineLearning',
};

/**
 * Fetch trending posts from Reddit public JSON.
 * No API key, no OAuth — just a fetch() call.
 * @param {string} category  - Tab category (All, Music, etc.)
 * @param {number} limit     - Number of posts to return (default 15)
 * @returns {Promise<Array>} - Normalized post objects
 */
export async function fetchRedditTrending(category = 'All', limit = 15) {
  const subreddit = CATEGORY_SUBREDDITS[category] || 'popular';
  const url = `${REDDIT_BASE}/r/${subreddit}/hot.json?limit=${limit}&raw_json=1`;

  try {
    const res = await fetch(url, {
      headers: {
        // Reddit requires a non-empty User-Agent for public requests
        'User-Agent': 'LynkApp/1.0 (web; contact@lynkapp.com)',
      },
    });

    if (!res.ok) throw new Error(`Reddit HTTP ${res.status}`);
    const json = await res.json();

    const posts = json?.data?.children || [];

    return posts.map((item, idx) => {
      const post = item.data;
      return {
        id:        post.id,
        rank:      idx + 1,
        tag:       post.title.length > 60 ? post.title.slice(0, 57) + '…' : post.title,
        subreddit: `r/${post.subreddit}`,
        posts:     formatScore(post.score),
        change:    `${post.num_comments} comments`,
        hot:       post.score > 10000,
        upvotes:   post.score,
        url:       `https://www.reddit.com${post.permalink}`,
        thumbnail:
          post.thumbnail && post.thumbnail.startsWith('http')
            ? post.thumbnail
            : null,
        category,
        emoji:     getCategoryEmoji(post.subreddit_name_prefixed),
        color:     getCategoryColor(idx),
        source:    'reddit',
      };
    });
  } catch (err) {
    console.warn('[reddit-service] fetch failed, using static fallback:', err.message);
    return getStaticFallback(category);
  }
}

/**
 * Fetch trending topics (subreddit names) as hashtag-style chips.
 * Uses r/popular/rising for fresh content.
 */
export async function fetchRedditTopics(limit = 10) {
  try {
    const res = await fetch(
      `${REDDIT_BASE}/r/popular/rising.json?limit=${limit}&raw_json=1`,
      { headers: { 'User-Agent': 'LynkApp/1.0 (web; contact@lynkapp.com)' } }
    );
    if (!res.ok) throw new Error(`Reddit HTTP ${res.status}`);
    const json = await res.json();
    const posts = json?.data?.children || [];
    // De-duplicate subreddits
    const seen = new Set();
    return posts
      .map(p => p.data)
      .filter(p => { if (seen.has(p.subreddit)) return false; seen.add(p.subreddit); return true; })
      .slice(0, limit)
      .map((p, i) => ({
        id:        p.subreddit,
        tag:       `#${p.subreddit}`,
        posts:     formatScore(p.score),
        change:    `+${Math.floor(Math.random() * 20) + 1}%`,
        hot:       p.score > 5000,
        rank:      i + 1,
        emoji:     getCategoryEmoji(p.subreddit_name_prefixed),
        color:     getCategoryColor(i),
        source:    'reddit',
      }));
  } catch (err) {
    console.warn('[reddit-service] topics fetch failed:', err.message);
    return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────

function formatScore(score) {
  if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(1)}M`;
  if (score >= 1_000)    return `${(score / 1_000).toFixed(0)}K`;
  return String(score);
}

const EMOJI_MAP = {
  music: '🎵', hiphop: '🎤', gaming: '🎮', technology: '💻',
  science: '🔬', worldnews: '🌍', news: '📰', sports: '⚽',
  soccer: '⚽', nba: '🏀', nfl: '🏈', videos: '📹',
  funny: '😂', art: '🎨', food: '🍕', fitness: '💪',
  travel: '✈️', popular: '🔥',
};

function getCategoryEmoji(subredditPrefixed = '') {
  const name = subredditPrefixed.replace('r/', '').toLowerCase();
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (name.includes(key)) return emoji;
  }
  return '📌';
}

const COLORS = ['#6366f1','#ec4899','#f59e0b','#3b82f6','#10b981','#8b5cf6','#14b8a6','#ef4444','#f97316','#06b6d4'];
function getCategoryColor(index) { return COLORS[index % COLORS.length]; }

// Static fallback in case Reddit is unreachable
function getStaticFallback(category) {
  return [
    { id:'fb1', rank:1, tag:'#TrendingNow', subreddit:'r/popular', posts:'245K', change:'+18%', hot:true, emoji:'🔥', color:'#6366f1', source:'fallback', category },
    { id:'fb2', rank:2, tag:'#MusicVibes2026', subreddit:'r/Music', posts:'189K', change:'+12%', hot:true, emoji:'🎵', color:'#ec4899', source:'fallback', category },
    { id:'fb3', rank:3, tag:'#TechNews2026', subreddit:'r/technology', posts:'134K', change:'+21%', hot:true, emoji:'💻', color:'#3b82f6', source:'fallback', category },
    { id:'fb4', rank:4, tag:'#GamingMoments', subreddit:'r/gaming', posts:'98K', change:'+9%', hot:false, emoji:'🎮', color:'#8b5cf6', source:'fallback', category },
    { id:'fb5', rank:5, tag:'#WorldNews', subreddit:'r/worldnews', posts:'87K', change:'+6%', hot:false, emoji:'🌍', color:'#10b981', source:'fallback', category },
  ];
}
