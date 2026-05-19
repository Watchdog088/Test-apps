/**
 * HackerNews API Service — LynkApp
 * ====================================
 * FREE · No API key required · No rate limit
 * Base: https://hacker-news.firebaseio.com/v0/
 *
 * Sections served:
 *  - Trending  → top/best/new stories as news feed
 *  - Feed      → HN story cards with comments count
 *  - Media Hub → Ask HN / Show HN curated lists
 *  - Search    → Powered by Algolia HN Search API (free)
 */

const HN_BASE = 'https://hacker-news.firebaseio.com/v0';
const HN_ALGOLIA = 'https://hn.algolia.com/api/v1';
const HN_ITEM_URL = 'https://news.ycombinator.com/item?id=';

// ─── Category endpoints ────────────────────────────────────────────────────
const STORY_TYPES = {
  top:  `${HN_BASE}/topstories.json`,
  new:  `${HN_BASE}/newstories.json`,
  best: `${HN_BASE}/beststories.json`,
  ask:  `${HN_BASE}/askstories.json`,
  show: `${HN_BASE}/showstories.json`,
  job:  `${HN_BASE}/jobstories.json`,
};

// ─── Internal helpers ──────────────────────────────────────────────────────

async function _fetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HN fetch failed: ${res.status} ${url}`);
  return res.json();
}

/** Get a single item (story, comment, poll, etc.) by ID */
export async function getItem(id) {
  return _fetch(`${HN_BASE}/item/${id}.json`);
}

/** Get user profile */
export async function getUser(username) {
  return _fetch(`${HN_BASE}/user/${username}.json`);
}

/** Get the current "max item" ID (useful for polling new content) */
export async function getMaxItemId() {
  return _fetch(`${HN_BASE}/maxitem.json`);
}

/** Get changed items/profiles since last check */
export async function getUpdates() {
  return _fetch(`${HN_BASE}/updates.json`);
}

// ─── Story list helpers ────────────────────────────────────────────────────

/**
 * Get IDs for a story type, then fetch up to `limit` full items in parallel
 * @param {'top'|'new'|'best'|'ask'|'show'|'job'} type
 * @param {number} limit  max stories to fetch (default 30)
 * @param {number} offset skip first N ids (for pagination)
 */
export async function getStories(type = 'top', limit = 30, offset = 0) {
  const url = STORY_TYPES[type] || STORY_TYPES.top;
  const ids = await _fetch(url);
  const slice = ids.slice(offset, offset + limit);
  const stories = await Promise.all(slice.map(id => getItem(id)));
  return stories.filter(Boolean); // remove any null items
}

/** Top 30 stories */
export async function getTopStories(limit = 30) {
  return getStories('top', limit);
}

/** Best 30 stories */
export async function getBestStories(limit = 30) {
  return getStories('best', limit);
}

/** Newest 30 stories */
export async function getNewStories(limit = 30) {
  return getStories('new', limit);
}

/** Ask HN stories */
export async function getAskStories(limit = 20) {
  return getStories('ask', limit);
}

/** Show HN stories */
export async function getShowStories(limit = 20) {
  return getStories('show', limit);
}

/** Job listings */
export async function getJobStories(limit = 20) {
  return getStories('job', limit);
}

/**
 * Fetch top-level comments for a story (up to `limit`)
 */
export async function getStoryComments(storyId, limit = 10) {
  const story = await getItem(storyId);
  if (!story || !story.kids || story.kids.length === 0) return [];
  const ids = story.kids.slice(0, limit);
  const comments = await Promise.all(ids.map(id => getItem(id)));
  return comments.filter(c => c && !c.deleted && !c.dead);
}

// ─── Algolia Search API (free, no key) ────────────────────────────────────

/**
 * Full-text search across HackerNews content
 * @param {string} query  search terms
 * @param {'story'|'comment'|'poll'|''} type  filter by item type
 * @param {number} limit
 */
export async function searchHN(query, type = 'story', limit = 20) {
  const params = new URLSearchParams({
    query,
    tags: type || 'story',
    hitsPerPage: limit,
  });
  const data = await _fetch(`${HN_ALGOLIA}/search?${params}`);
  return data.hits || [];
}

/**
 * Search stories sorted by date (most recent first)
 */
export async function searchHNByDate(query, limit = 20) {
  const params = new URLSearchParams({
    query,
    tags: 'story',
    hitsPerPage: limit,
  });
  const data = await _fetch(`${HN_ALGOLIA}/search_by_date?${params}`);
  return data.hits || [];
}

/**
 * Get stories from a specific author via Algolia
 */
export async function getStoriesByAuthor(username, limit = 20) {
  const params = new URLSearchParams({
    tags: `story,author_${username}`,
    hitsPerPage: limit,
  });
  const data = await _fetch(`${HN_ALGOLIA}/search?${params}`);
  return data.hits || [];
}

// ─── Formatters ────────────────────────────────────────────────────────────

/**
 * Extract the readable domain from a URL
 * e.g. "https://github.com/foo/bar" → "github.com"
 */
export function extractDomain(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/** Relative time string: "3h ago", "2d ago", etc. */
export function timeAgo(unixTimestamp) {
  if (!unixTimestamp) return 'unknown';
  const seconds = Math.floor(Date.now() / 1000) - unixTimestamp;
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/** Score badge color: orange/gold/green based on score */
export function scoreBadgeColor(score) {
  if (!score) return '#6b7280';
  if (score >= 500) return '#f97316'; // orange — viral
  if (score >= 200) return '#f59e0b'; // gold — hot
  if (score >= 50)  return '#22c55e'; // green — good
  return '#3b82f6';                   // blue — normal
}

/** Format comment count */
export function formatComments(n) {
  if (!n) return '0 comments';
  if (n === 1) return '1 comment';
  return `${n} comments`;
}

/** Strip HTML tags from HN comment text */
export function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

// ─── UI Builders ───────────────────────────────────────────────────────────

/**
 * Build an HTML string for a single story card (compact)
 */
export function buildStoryCard(story, index) {
  if (!story || story.type === 'job') {
    return buildJobCard(story, index);
  }
  const domain = extractDomain(story.url);
  const hnLink = HN_ITEM_URL + story.id;
  const score = story.score || 0;
  const badgeColor = scoreBadgeColor(score);
  const age = timeAgo(story.time);
  const comments = story.descendants || 0;

  return `
  <div class="hn-card" style="
    background:#1e293b;border-radius:12px;padding:14px 16px;margin-bottom:10px;
    border-left:4px solid ${badgeColor};cursor:pointer;
    transition:transform 0.15s,box-shadow 0.15s;
  " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 16px rgba(0,0,0,0.3)'"
     onmouseout="this.style.transform='';this.style.boxShadow=''">

    <!-- Rank + Score -->
    <div style="display:flex;align-items:flex-start;gap:12px">
      <div style="min-width:32px;text-align:center">
        <div style="font-size:11px;color:#64748b;font-weight:600">#${(index||0)+1}</div>
        <div style="font-size:18px;font-weight:700;color:${badgeColor};line-height:1.1">${score}</div>
        <div style="font-size:9px;color:#94a3b8">pts</div>
      </div>

      <!-- Content -->
      <div style="flex:1;min-width:0">
        <a href="${story.url || hnLink}" target="_blank" rel="noopener" style="
          color:#f1f5f9;font-size:14px;font-weight:600;text-decoration:none;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
          line-height:1.4
        " title="${(story.title||'').replace(/"/g,'&quot;')}">${story.title || 'Untitled'}</a>

        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;align-items:center">
          ${domain ? `<span style="background:#0f172a;color:#38bdf8;padding:2px 7px;border-radius:4px;font-size:11px;font-family:monospace">${domain}</span>` : ''}
          <span style="color:#94a3b8;font-size:11px">by <span style="color:#e2e8f0">${story.by||'unknown'}</span></span>
          <span style="color:#64748b;font-size:11px">${age}</span>
          <a href="${hnLink}" target="_blank" rel="noopener" style="
            color:#94a3b8;font-size:11px;text-decoration:none;margin-left:auto;
          ">💬 ${formatComments(comments)}</a>
        </div>
      </div>
    </div>
  </div>`;
}

/** Build a job listing card */
export function buildJobCard(job, index) {
  if (!job) return '';
  const age = timeAgo(job.time);
  const link = job.url || (HN_ITEM_URL + job.id);
  return `
  <div class="hn-job-card" style="
    background:#1e293b;border-radius:12px;padding:14px 16px;margin-bottom:10px;
    border-left:4px solid #8b5cf6;
  ">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <span style="font-size:14px">💼</span>
      <span style="color:#8b5cf6;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Job Posting</span>
      <span style="color:#64748b;font-size:11px;margin-left:auto">${age}</span>
    </div>
    <a href="${link}" target="_blank" rel="noopener" style="
      color:#f1f5f9;font-size:14px;font-weight:600;text-decoration:none;display:block;margin-bottom:4px
    ">${job.title || 'Job Opportunity'}</a>
    <span style="color:#94a3b8;font-size:11px">Posted by ${job.by||'unknown'}</span>
  </div>`;
}

/** Build a comment card */
export function buildCommentCard(comment) {
  if (!comment) return '';
  const text = stripHtml(comment.text || '');
  const age = timeAgo(comment.time);
  const preview = text.length > 200 ? text.slice(0, 200) + '…' : text;
  return `
  <div style="
    background:#1e293b;border-radius:8px;padding:12px 14px;margin-bottom:8px;
    border-left:3px solid #3b82f6;
  ">
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
      <span style="
        width:28px;height:28px;border-radius:50%;background:#1d4ed8;
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-size:12px;font-weight:700;flex-shrink:0
      ">${(comment.by||'?')[0].toUpperCase()}</span>
      <span style="color:#e2e8f0;font-size:12px;font-weight:600">${comment.by||'unknown'}</span>
      <span style="color:#64748b;font-size:11px">${age}</span>
    </div>
    <p style="color:#94a3b8;font-size:13px;margin:0;line-height:1.6;white-space:pre-wrap">${preview}</p>
  </div>`;
}

/**
 * Build a compact trending ticker item (for the Trending strip)
 */
export function buildTrendingItem(story, rank) {
  const domain = extractDomain(story.url);
  const score = story.score || 0;
  const color = scoreBadgeColor(score);
  return `
  <a href="${story.url || HN_ITEM_URL + story.id}" target="_blank" rel="noopener" style="
    display:inline-flex;align-items:center;gap:8px;
    background:#1e293b;border-radius:8px;padding:8px 12px;
    text-decoration:none;border:1px solid #334155;
    white-space:nowrap;flex-shrink:0;
    transition:background 0.15s;
  " onmouseover="this.style.background='#0f172a'"
     onmouseout="this.style.background='#1e293b'">
    <span style="color:#64748b;font-size:11px">#${rank}</span>
    <span style="color:${color};font-weight:700;font-size:13px">${score}▲</span>
    <span style="color:#f1f5f9;font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis">${story.title||'Story'}</span>
    ${domain ? `<span style="color:#38bdf8;font-size:10px;font-family:monospace">${domain}</span>` : ''}
  </a>`;
}

/**
 * Build a full HN feed section for the Trending page
 * Returns an HTML string with tabs: Top / Best / New / Ask / Show
 */
export async function buildTrendingFeed(limit = 15) {
  const [top, best, newS] = await Promise.all([
    getTopStories(limit),
    getBestStories(limit),
    getNewStories(limit),
  ]);

  const renderList = (stories) =>
    stories.map((s, i) => buildStoryCard(s, i)).join('');

  return `
  <div class="hn-feed" id="hn-feed-container">
    <!-- Tabs -->
    <div style="display:flex;gap:4px;margin-bottom:16px;flex-wrap:wrap">
      ${['top','best','new'].map((t,i) => `
        <button onclick="hnSwitchTab('${t}')" id="hn-tab-${t}" style="
          padding:8px 16px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:600;
          background:${i===0?'#f97316':'#1e293b'};color:${i===0?'#fff':'#94a3b8'};
          transition:all 0.15s
        ">${t.charAt(0).toUpperCase()+t.slice(1)}</button>
      `).join('')}
    </div>

    <div id="hn-tab-content-top">${renderList(top)}</div>
    <div id="hn-tab-content-best" style="display:none">${renderList(best)}</div>
    <div id="hn-tab-content-new" style="display:none">${renderList(newS)}</div>
  </div>

  <script>
  function hnSwitchTab(tab) {
    ['top','best','new'].forEach(t => {
      const el = document.getElementById('hn-tab-content-'+t);
      const btn = document.getElementById('hn-tab-'+t);
      if (el) el.style.display = t===tab ? 'block' : 'none';
      if (btn) {
        btn.style.background = t===tab ? '#f97316' : '#1e293b';
        btn.style.color = t===tab ? '#fff' : '#94a3b8';
      }
    });
  }
  <\/script>`;
}

/**
 * Build a mini "HN Widget" for the Feed page sidebar
 * Shows top 5 stories, compact format
 */
export async function buildFeedWidget(limit = 5) {
  const stories = await getTopStories(limit);
  const items = stories.map((s, i) => `
    <a href="${s.url || HN_ITEM_URL + s.id}" target="_blank" rel="noopener" style="
      display:flex;gap:10px;align-items:flex-start;padding:10px 0;
      text-decoration:none;border-bottom:1px solid #1e293b;
    ">
      <span style="
        min-width:28px;height:28px;border-radius:6px;background:${scoreBadgeColor(s.score)};
        display:flex;align-items:center;justify-content:center;
        color:#fff;font-weight:700;font-size:12px;flex-shrink:0
      ">${s.score >= 1000 ? '🔥' : s.score}</span>
      <span style="color:#cbd5e1;font-size:12px;line-height:1.4;
        display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden
      ">${s.title||'Story'}</span>
    </a>
  `).join('');

  return `
  <div style="background:#0f172a;border-radius:12px;padding:16px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <span style="font-size:18px">🦊</span>
      <h4 style="color:#f1f5f9;margin:0;font-size:14px">HackerNews Top Stories</h4>
    </div>
    ${items}
    <a href="https://news.ycombinator.com" target="_blank" rel="noopener" style="
      display:block;text-align:center;margin-top:10px;padding:8px;
      background:#f97316;border-radius:8px;color:#fff;font-size:12px;
      text-decoration:none;font-weight:600
    ">View All on HN →</a>
  </div>`;
}

/**
 * Build the Media Hub "Tech News" panel
 * Ask HN + Show HN stories
 */
export async function buildMediaHubPanel(limit = 10) {
  const [ask, show] = await Promise.all([
    getAskStories(limit),
    getShowStories(limit),
  ]);

  return `
  <div>
    <h3 style="color:#f97316;font-size:15px;margin:0 0 12px">💡 Ask HN</h3>
    ${ask.map((s, i) => buildStoryCard(s, i)).join('')}
    <h3 style="color:#22c55e;font-size:15px;margin:16px 0 12px">🚀 Show HN</h3>
    ${show.map((s, i) => buildStoryCard(s, i)).join('')}
  </div>`;
}

/**
 * Search HN and return formatted story cards
 */
export async function buildSearchResults(query, limit = 15) {
  const hits = await searchHN(query, 'story', limit);
  if (hits.length === 0) {
    return `<p style="color:#94a3b8;text-align:center;padding:20px">No results found for "${query}"</p>`;
  }
  return hits.map((h, i) => {
    // Algolia hit shape is slightly different from native API
    const story = {
      id: h.objectID,
      title: h.title,
      url: h.url,
      by: h.author,
      score: h.points || 0,
      descendants: h.num_comments || 0,
      time: h.created_at_i,
      type: 'story',
    };
    return buildStoryCard(story, i);
  }).join('');
}

export default {
  // Core
  getItem, getUser, getMaxItemId, getUpdates,
  // Stories
  getStories, getTopStories, getBestStories, getNewStories,
  getAskStories, getShowStories, getJobStories,
  // Comments
  getStoryComments,
  // Search
  searchHN, searchHNByDate, getStoriesByAuthor,
  // Formatters
  extractDomain, timeAgo, scoreBadgeColor, formatComments, stripHtml,
  // Builders
  buildStoryCard, buildJobCard, buildCommentCard,
  buildTrendingItem, buildTrendingFeed,
  buildFeedWidget, buildMediaHubPanel, buildSearchResults,
};
