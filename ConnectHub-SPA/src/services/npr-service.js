/**
 * NPR News Service — LynkApp
 * ============================
 * Uses rss2json.com (FREE, no key) to proxy NPR's public RSS feeds.
 * No API key required for RSS feeds. Optional: get an NPR API key at
 * https://api.npr.org/ for extended metadata.
 *
 * NPR RSS Feeds (all free, no key):
 *   News:        https://feeds.npr.org/1001/rss.xml
 *   Technology:  https://feeds.npr.org/1019/rss.xml
 *   Science:     https://feeds.npr.org/1007/rss.xml
 *   Politics:    https://feeds.npr.org/1014/rss.xml
 *   Health:      https://feeds.npr.org/1128/rss.xml
 *   Business:    https://feeds.npr.org/1006/rss.xml
 *   Arts & Life: https://feeds.npr.org/1008/rss.xml
 *   Music:       https://feeds.npr.org/1039/rss.xml
 *   World:       https://feeds.npr.org/1004/rss.xml
 *
 * Used in: Feed, Trending, Media Hub
 */

const RSS2JSON = 'https://api.rss2json.com/v1/api.json';

export const NPR_FEEDS = {
  news:        { id: '1001', label: 'News',        emoji: '📰', color: '#e11d48' },
  technology:  { id: '1019', label: 'Technology',  emoji: '💻', color: '#3b82f6' },
  science:     { id: '1007', label: 'Science',     emoji: '🔬', color: '#8b5cf6' },
  politics:    { id: '1014', label: 'Politics',    emoji: '🏛️', color: '#f97316' },
  health:      { id: '1128', label: 'Health',      emoji: '🏥', color: '#22c55e' },
  business:    { id: '1006', label: 'Business',    emoji: '💼', color: '#10b981' },
  arts:        { id: '1008', label: 'Arts & Life', emoji: '🎨', color: '#f59e0b' },
  music:       { id: '1039', label: 'Music',       emoji: '🎵', color: '#a855f7' },
  world:       { id: '1004', label: 'World',       emoji: '🌎', color: '#06b6d4' },
};

function getNprRssUrl(feedId) {
  return `https://feeds.npr.org/${feedId}/rss.xml`;
}

// ─── Core fetch ───────────────────────────────────────────────────────────
// NOTE: rss2json.com free tier does NOT support the `count` parameter.
// We fetch the default (~10 items) and slice client-side.
async function fetchFeed(feedId, limit = 20) {
  const rssUrl = getNprRssUrl(feedId);
  const url = `${RSS2JSON}?rss_url=${encodeURIComponent(rssUrl)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NPR RSS fetch failed: ${res.status}`);
  const data = await res.json();
  if (data.status !== 'ok') throw new Error(`RSS2JSON error: ${data.message || 'unknown'}`);
  const items = (data.items || []).slice(0, limit);
  return { feed: data.feed, items };
}

// ─── Main functions ───────────────────────────────────────────────────────

/** Get articles from a named feed */
export async function getByCategory(category = 'news', limit = 20) {
  const feed = NPR_FEEDS[category] || NPR_FEEDS.news;
  const { items } = await fetchFeed(feed.id, limit);
  return items.map(item => normalizeItem(item, category));
}

/** Get top news */
export async function getTopNews(limit = 20) {
  return getByCategory('news', limit);
}

/** Get technology stories */
export async function getTechStories(limit = 20) {
  return getByCategory('technology', limit);
}

/** Get science stories */
export async function getScienceStories(limit = 20) {
  return getByCategory('science', limit);
}

/** Get multiple categories at once */
export async function getMultiCategory(categories = ['news', 'technology'], limitEach = 5) {
  const results = await Promise.all(
    categories.map(cat => getByCategory(cat, limitEach).catch(() => []))
  );
  return results.flat();
}

/** Get feed metadata */
export async function getFeedInfo(category = 'news') {
  const feed = NPR_FEEDS[category] || NPR_FEEDS.news;
  const { feed: meta } = await fetchFeed(feed.id, 1);
  return meta;
}

// ─── Normalize item shape ─────────────────────────────────────────────────
function normalizeItem(item, category) {
  const feed = NPR_FEEDS[category] || NPR_FEEDS.news;
  return {
    id: item.guid || item.link,
    title: item.title,
    description: stripHtml(item.description || item.content || '').slice(0, 200),
    url: item.link,
    thumbnail: item.thumbnail || item.enclosure?.link || null,
    author: item.author || 'NPR',
    publishedAt: item.pubDate,
    category,
    categoryLabel: feed.label,
    categoryColor: feed.color,
    categoryEmoji: feed.emoji,
    source: 'NPR',
  };
}

// ─── Formatters ──────────────────────────────────────────────────────────
export function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── UI Card Builders ─────────────────────────────────────────────────────

export function buildNprCard(item) {
  if (!item) return '';
  const age = timeAgo(item.publishedAt);
  return `
  <div style="background:#1e293b;border-radius:12px;overflow:hidden;margin-bottom:10px;
    display:flex;border-left:4px solid ${item.categoryColor};transition:transform 0.15s"
    onmouseover="this.style.transform='translateY(-2px)'"
    onmouseout="this.style.transform=''">
    ${item.thumbnail ? `<img src="${item.thumbnail}" alt="" style="width:80px;height:80px;object-fit:cover;flex-shrink:0" loading="lazy" onerror="this.style.display='none'">` : `<div style="width:80px;height:80px;background:#0f172a;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:24px">${item.categoryEmoji}</div>`}
    <div style="padding:8px 12px;flex:1;min-width:0">
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:4px;flex-wrap:wrap">
        <span style="background:${item.categoryColor}22;color:${item.categoryColor};padding:1px 6px;border-radius:4px;font-size:9px;font-weight:700;text-transform:uppercase">${item.categoryLabel}</span>
        <span style="color:#64748b;font-size:9px">${age}</span>
      </div>
      <a href="${item.url}" target="_blank" rel="noopener" style="color:#f1f5f9;font-size:12px;font-weight:600;text-decoration:none;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.4">${item.title}</a>
      ${item.description ? `<p style="color:#94a3b8;font-size:11px;margin:3px 0 0;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${item.description}</p>` : ''}
    </div>
  </div>`;
}

export function buildNprFeedWidget(items) {
  if (!items?.length) return '<p style="color:#64748b;text-align:center;padding:20px">No NPR stories found</p>';
  return items.map(buildNprCard).join('');
}

export default {
  NPR_FEEDS,
  getByCategory, getTopNews, getTechStories, getScienceStories,
  getMultiCategory, getFeedInfo,
  stripHtml, timeAgo, buildNprCard, buildNprFeedWidget,
};
