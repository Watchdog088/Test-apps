/**
 * Dev.to API Service — LynkApp
 * ==============================
 * Completely FREE — No API key required for reading public content.
 * Optional API key for authenticated actions (publishing, following).
 * Base URL: https://dev.to/api
 *
 * Used in: Feed, Trending, Media Hub, Search
 */

const DEVTO_BASE = 'https://dev.to/api';
let _apiKey = null; // Optional. Set for write actions.

export function setDevtoApiKey(key) { _apiKey = key; }

function headers() {
  const h = { 'Content-Type': 'application/json' };
  if (_apiKey) h['api-key'] = _apiKey;
  return h;
}

async function dFetch(path, params = {}) {
  const url = new URL(`${DEVTO_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') url.searchParams.set(k, v); });
  const res = await fetch(url.toString(), { headers: headers() });
  if (!res.ok) throw new Error(`Dev.to ${res.status}: ${path}`);
  return res.json();
}

// ─── Articles ─────────────────────────────────────────────────────────────

/** Get latest articles */
export async function getArticles(opts = {}) {
  return dFetch('/articles', {
    page: opts.page || 1,
    per_page: opts.limit || 20,
    tag: opts.tag || '',
    username: opts.username || '',
    state: opts.state || 'fresh', // fresh | rising | all
    top: opts.top || '',
  });
}

/** Get trending articles (top of the week) */
export async function getTrending(limit = 20) {
  return dFetch('/articles', { top: 7, per_page: limit });
}

/** Get articles by tag */
export async function getByTag(tag, limit = 20) {
  return dFetch('/articles', { tag, per_page: limit, state: 'all' });
}

/** Get a single article by ID */
export async function getArticle(id) {
  return dFetch(`/articles/${id}`);
}

/** Get articles by a specific user */
export async function getUserArticles(username, limit = 20) {
  return dFetch('/articles', { username, per_page: limit });
}

/** Search articles (Dev.to doesn't have a native search endpoint,
 *  so we filter locally from a broader fetch) */
export async function searchArticles(query, limit = 20) {
  const articles = await dFetch('/articles', { per_page: 100, state: 'all' });
  const q = query.toLowerCase();
  return articles
    .filter(a => a.title.toLowerCase().includes(q) || (a.tag_list || []).some(t => t.includes(q)))
    .slice(0, limit);
}

// ─── Tags ─────────────────────────────────────────────────────────────────

/** Get popular tags */
export async function getPopularTags() {
  return dFetch('/tags', { page: 1, per_page: 30 });
}

// ─── Users ────────────────────────────────────────────────────────────────

/** Get a user profile */
export async function getUser(username) {
  return dFetch(`/users/by_username`, { url: username });
}

// ─── Comments ─────────────────────────────────────────────────────────────

/** Get comments for an article */
export async function getComments(articleId) {
  return dFetch('/comments', { a_id: articleId });
}

// ─── Formatters ───────────────────────────────────────────────────────────

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function getTagColor(tag) {
  const palette = ['#3b82f6','#8b5cf6','#f97316','#22c55e','#ec4899','#06b6d4','#f59e0b','#10b981','#ef4444','#a855f7'];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export function reactionIcon(count) {
  if (count >= 500) return '🔥';
  if (count >= 100) return '⭐';
  if (count >= 50) return '💚';
  return '👍';
}

// ─── UI Card Builder ─────────────────────────────────────────────────────

export function buildDevtoCard(article) {
  if (!article) return '';
  const age = timeAgo(article.published_at || article.created_at);
  const tags = (article.tag_list || []).slice(0, 3);
  const reactions = article.public_reactions_count || 0;
  const comments = article.comments_count || 0;
  const readTime = article.reading_time_minutes || 1;

  return `
  <div style="background:#1e293b;border-radius:12px;overflow:hidden;margin-bottom:12px;
    border-left:4px solid #3b82f6;transition:transform 0.15s"
    onmouseover="this.style.transform='translateY(-2px)'"
    onmouseout="this.style.transform=''">
    ${article.cover_image ? `<img src="${article.cover_image}" alt="" style="width:100%;height:120px;object-fit:cover" loading="lazy" onerror="this.style.display='none'">` : ''}
    <div style="padding:12px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <img src="${article.user?.profile_image_90 || `https://api.dicebear.com/7.x/initials/svg?seed=${article.user?.username}`}" alt="" style="width:24px;height:24px;border-radius:50%;object-fit:cover" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=${article.user?.username}'">
        <span style="color:#94a3b8;font-size:11px">${article.user?.name || article.user?.username || 'Dev'}</span>
        <span style="color:#475569;font-size:10px">• ${age}</span>
        <span style="color:#475569;font-size:10px;margin-left:auto">⏱ ${readTime}m read</span>
      </div>
      <a href="${article.url}" target="_blank" rel="noopener" style="color:#f1f5f9;font-size:14px;font-weight:700;text-decoration:none;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.4">${article.title}</a>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px">
        ${tags.map(t => `<span style="background:${getTagColor(t)}22;color:${getTagColor(t)};padding:2px 7px;border-radius:4px;font-size:10px;font-weight:600">#${t}</span>`).join('')}
      </div>
      <div style="display:flex;gap:16px;margin-top:10px;padding-top:8px;border-top:1px solid #0f172a">
        <span style="color:#94a3b8;font-size:11px">${reactionIcon(reactions)} ${reactions} reactions</span>
        <span style="color:#94a3b8;font-size:11px">💬 ${comments} comments</span>
      </div>
    </div>
  </div>`;
}

export function buildDevtoTagBadge(tag) {
  const c = getTagColor(tag.name || tag);
  const count = tag.bg_color_hex ? tag.articles_count : '';
  return `<span style="background:${c}22;color:${c};padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer">#${tag.name || tag}${count ? ` <small>(${count})</small>` : ''}</span>`;
}

export default {
  setDevtoApiKey,
  getArticles, getTrending, getByTag, getArticle,
  getUserArticles, searchArticles, getPopularTags, getUser, getComments,
  timeAgo, getTagColor, reactionIcon, buildDevtoCard, buildDevtoTagBadge,
};
