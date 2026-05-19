/**
 * The Guardian API Service — LynkApp
 * =====================================
 * FREE tier — demo key "test" included (50 req/day)
 * Get a free production key: https://open-platform.theguardian.com/access/
 * Base URL: https://content.guardianapis.com
 *
 * Used in: Trending, Feed, Media Hub, Search
 */

// Demo key works out-of-the-box. Replace with your own free key for production.
const GUARDIAN_BASE = 'https://content.guardianapis.com';
let _apiKey = 'test'; // "test" is The Guardian's official demo key

export function setGuardianApiKey(key) { _apiKey = key; }
export function getGuardianApiKey() { return _apiKey; }

// ─── Core fetch helper ────────────────────────────────────────────────────
async function gFetch(path, params = {}) {
  const url = new URL(`${GUARDIAN_BASE}${path}`);
  url.searchParams.set('api-key', _apiKey);
  url.searchParams.set('show-fields', 'thumbnail,trailText,byline,bodyText');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Guardian ${res.status}: ${path}`);
  const data = await res.json();
  if (data.response.status !== 'ok') throw new Error('Guardian API error');
  return data.response;
}

// ─── Main endpoints ───────────────────────────────────────────────────────

/** Search articles by query */
export async function searchArticles(query, opts = {}) {
  const r = await gFetch('/search', {
    q: query,
    'page-size': opts.limit || 20,
    'order-by': opts.orderBy || 'relevance',
    section: opts.section || '',
    tag: opts.tag || '',
  });
  return r.results || [];
}

/** Get latest articles (optional section filter) */
export async function getLatestArticles(section = '', limit = 20) {
  const params = { 'page-size': limit, 'order-by': 'newest' };
  if (section) params.section = section;
  const r = await gFetch('/search', params);
  return r.results || [];
}

/** Get top articles today */
export async function getTopStories(limit = 20) {
  const r = await gFetch('/search', {
    'page-size': limit,
    'order-by': 'relevance',
    'from-date': new Date().toISOString().slice(0, 10),
  });
  return r.results || [];
}

/** Get by section: world, technology, science, sport, culture, us-news, uk-news */
export async function getBySection(section, limit = 20) {
  const r = await gFetch(`/${section}`, { 'page-size': limit });
  return r.results || [];
}

/** Get a single article by ID */
export async function getArticle(articleId) {
  const r = await gFetch(`/${articleId}`);
  return r.content || null;
}

/** Get all sections */
export async function getSections() {
  const r = await gFetch('/sections');
  return r.results || [];
}

/** Get popular tags */
export async function getTags(query = '', limit = 20) {
  const r = await gFetch('/tags', { q: query, 'page-size': limit });
  return r.results || [];
}

// ─── Formatters ────────────────────────────────────────────────────────────

export function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function getSectionColor(section) {
  const colors = {
    'world': '#ef4444', 'technology': '#3b82f6', 'science': '#8b5cf6',
    'sport': '#22c55e', 'culture': '#f59e0b', 'us-news': '#f97316',
    'uk-news': '#06b6d4', 'politics': '#ec4899', 'business': '#10b981',
    'environment': '#84cc16', 'media': '#a855f7', 'opinion': '#f97316',
  };
  return colors[section] || '#64748b';
}

// ─── UI Card Builder ──────────────────────────────────────────────────────

export function buildArticleCard(article, index) {
  if (!article) return '';
  const thumb = article.fields?.thumbnail;
  const trail = article.fields?.trailText || '';
  const byline = article.fields?.byline || '';
  const age = formatDate(article.webPublicationDate);
  const secColor = getSectionColor(article.sectionId);
  const cleanTrail = trail.replace(/<[^>]+>/g, '').slice(0, 120);

  return `
  <div style="background:#1e293b;border-radius:12px;overflow:hidden;margin-bottom:12px;
    border-left:4px solid ${secColor};display:flex;gap:0;transition:transform 0.15s;"
    onmouseover="this.style.transform='translateY(-2px)'"
    onmouseout="this.style.transform=''">
    ${thumb ? `<img src="${thumb}" alt="" style="width:90px;height:90px;object-fit:cover;flex-shrink:0;" loading="lazy" onerror="this.style.display='none'">` : `<div style="width:90px;height:90px;background:#0f172a;flex-shrink:0;display:flex;align-items:center;justify-content:center"><span style="font-size:28px">📰</span></div>`}
    <div style="padding:10px 12px;flex:1;min-width:0">
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:5px;flex-wrap:wrap">
        <span style="background:${secColor}22;color:${secColor};padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase">${article.sectionName||'News'}</span>
        <span style="color:#64748b;font-size:10px">${age}</span>
        ${byline ? `<span style="color:#94a3b8;font-size:10px">• ${byline}</span>` : ''}
      </div>
      <a href="${article.webUrl}" target="_blank" rel="noopener" style="color:#f1f5f9;font-size:13px;font-weight:600;text-decoration:none;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.4">${article.webTitle||'Article'}</a>
      ${cleanTrail ? `<p style="color:#94a3b8;font-size:11px;margin:4px 0 0;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${cleanTrail}</p>` : ''}
    </div>
  </div>`;
}

export default {
  setGuardianApiKey, getGuardianApiKey,
  searchArticles, getLatestArticles, getTopStories,
  getBySection, getArticle, getSections, getTags,
  formatDate, getSectionColor, buildArticleCard,
};
