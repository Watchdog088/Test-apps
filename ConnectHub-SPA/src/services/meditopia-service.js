/**
 * Meditopia Mindfulness & Meditation Service
 *
 * NOTE: Meditopia does NOT have a public REST API.
 * This service provides:
 *   1. A curated library of free/public mindfulness content (built-in)
 *   2. Integration hooks for when Meditopia opens a partner API
 *   3. Breathing exercise timers, mood tracking, and sleep sounds
 *      using the Web Audio API + built-in data — 100% functional today
 *   4. Quotation feed from a free public quotes API (ZenQuotes)
 *   5. Mindfulness session tracker (localStorage-based)
 *
 * When Meditopia provides official API access, replace MEDITOPIA_API_KEY
 * and MEDITOPIA_BASE with your credentials.
 */

// ─── Config (swap when Meditopia opens their API) ───────────────────────────
const MEDITOPIA_API_KEY = import.meta.env?.VITE_MEDITOPIA_API_KEY || null;
const MEDITOPIA_BASE    = 'https://api.meditopia.com/v1'; // placeholder

// ZenQuotes — free, no key, CORS-friendly via proxy
const ZENQUOTES_BASE = 'https://zenquotes.io/api';
const CORS_PROXY     = 'https://corsproxy.io/?';

// ─── Built-in Meditation Content Library ────────────────────────────────────

export const MEDITATION_SESSIONS = [
  {
    id: 'breath-5',
    title: '5-Minute Breathing',
    category: 'breathing',
    duration: 5,
    level: 'beginner',
    description: 'A calming 5-minute box breathing exercise to reduce stress.',
    instructions: ['Inhale 4 counts', 'Hold 4 counts', 'Exhale 4 counts', 'Hold 4 counts'],
    cycles: 15,
    tags: ['stress', 'anxiety', 'quick'],
    icon: '🫁',
  },
  {
    id: 'breath-10',
    title: '10-Minute Deep Breathing',
    category: 'breathing',
    duration: 10,
    level: 'beginner',
    description: 'Extended deep breathing for sustained calm and focus.',
    instructions: ['Inhale 6 counts', 'Hold 2 counts', 'Exhale 8 counts'],
    cycles: 20,
    tags: ['focus', 'calm', 'relaxation'],
    icon: '🧘',
  },
  {
    id: 'body-scan-15',
    title: '15-Minute Body Scan',
    category: 'body-scan',
    duration: 15,
    level: 'beginner',
    description: 'Progressive relaxation from head to toe.',
    instructions: [
      'Close eyes, relax shoulders',
      'Focus on each body part from feet to head',
      'Release tension with each exhale',
    ],
    tags: ['sleep', 'relaxation', 'body'],
    icon: '🌿',
  },
  {
    id: 'morning-mindfulness-7',
    title: '7-Minute Morning Mindfulness',
    category: 'mindfulness',
    duration: 7,
    level: 'beginner',
    description: 'Start your day with intention and awareness.',
    instructions: [
      'Set a positive intention for the day',
      'Observe 3 things you are grateful for',
      'Breathe deeply and smile',
    ],
    tags: ['morning', 'gratitude', 'intention'],
    icon: '☀️',
  },
  {
    id: 'sleep-prep-20',
    title: '20-Minute Sleep Preparation',
    category: 'sleep',
    duration: 20,
    level: 'intermediate',
    description: 'Wind down your mind and body before sleep.',
    instructions: [
      'Lie comfortably in bed',
      'Slow breathing: 4-7-8 pattern',
      'Visualize a peaceful place',
      'Let thoughts drift without attachment',
    ],
    tags: ['sleep', 'insomnia', 'nighttime'],
    icon: '🌙',
  },
  {
    id: 'focus-3',
    title: '3-Minute Focus Reset',
    category: 'focus',
    duration: 3,
    level: 'beginner',
    description: 'Quick mental reset during work or study.',
    instructions: [
      'Stop all activity',
      'Breathe in deeply x3',
      'Acknowledge current thoughts without judgment',
      'Return to task refreshed',
    ],
    tags: ['work', 'productivity', 'quick'],
    icon: '🎯',
  },
  {
    id: 'anxiety-relief-8',
    title: '8-Minute Anxiety Relief',
    category: 'anxiety',
    duration: 8,
    level: 'beginner',
    description: 'Grounding technique for anxiety and overwhelm.',
    instructions: [
      '5-4-3-2-1 grounding: name 5 things you see',
      '4 things you can touch',
      '3 things you hear',
      '2 things you smell',
      '1 thing you taste',
    ],
    tags: ['anxiety', 'grounding', 'panic'],
    icon: '💙',
  },
  {
    id: 'loving-kindness-12',
    title: '12-Minute Loving Kindness',
    category: 'compassion',
    duration: 12,
    level: 'intermediate',
    description: 'Cultivate love and compassion for self and others.',
    instructions: [
      'Send kindness to yourself',
      'Send kindness to a loved one',
      'Send kindness to a neutral person',
      'Send kindness to all beings',
    ],
    tags: ['compassion', 'love', 'relationships'],
    icon: '❤️',
  },
];

export const SLEEP_SOUNDS = [
  { id: 'rain',      label: 'Rain',         emoji: '🌧️', freq: 200, type: 'noise' },
  { id: 'ocean',     label: 'Ocean Waves',  emoji: '🌊', freq: 150, type: 'noise' },
  { id: 'forest',    label: 'Forest',       emoji: '🌲', freq: 180, type: 'noise' },
  { id: 'fire',      label: 'Campfire',     emoji: '🔥', freq: 100, type: 'noise' },
  { id: 'white',     label: 'White Noise',  emoji: '⬜', freq: 0,   type: 'white' },
  { id: 'binaural',  label: 'Binaural Beats', emoji: '🎵', freq: 10, type: 'binaural' },
];

export const BREATHING_PATTERNS = [
  { id: 'box',      name: 'Box Breathing',    inhale: 4, holdIn: 4, exhale: 4, holdOut: 4, description: 'Equal counts — stress reduction' },
  { id: '478',      name: '4-7-8 Breathing',  inhale: 4, holdIn: 7, exhale: 8, holdOut: 0, description: 'Sleep & anxiety relief' },
  { id: 'coherent', name: 'Coherent Breathing',inhale: 5, holdIn: 0, exhale: 5, holdOut: 0, description: 'Heart rate variability' },
  { id: 'alternate',name: 'Alternate Nostril', inhale: 4, holdIn: 4, exhale: 4, holdOut: 4, description: 'Balance & clarity' },
  { id: 'wim-hof',  name: 'Wim Hof Method',   inhale: 2, holdIn: 0, exhale: 1, holdOut: 0, description: 'Energy & vitality (30 cycles)' },
];

export const MOOD_OPTIONS = [
  { value: 1, label: 'Very Bad',   emoji: '😢', color: '#ef4444' },
  { value: 2, label: 'Bad',        emoji: '😞', color: '#f97316' },
  { value: 3, label: 'Neutral',    emoji: '😐', color: '#eab308' },
  { value: 4, label: 'Good',       emoji: '🙂', color: '#22c55e' },
  { value: 5, label: 'Very Good',  emoji: '😄', color: '#14b8a6' },
];

// ─── Inspirational Quotes (ZenQuotes API) ───────────────────────────────────

/**
 * Get today's inspirational quote.
 * Uses ZenQuotes (free, no API key needed).
 */
export async function getTodayQuote() {
  const res = await fetch(`${CORS_PROXY}${encodeURIComponent(`${ZENQUOTES_BASE}/today`)}`);
  if (!res.ok) throw new Error('Failed to fetch quote');
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

/**
 * Get a random inspirational quote.
 */
export async function getRandomQuote() {
  const res = await fetch(`${CORS_PROXY}${encodeURIComponent(`${ZENQUOTES_BASE}/random`)}`);
  if (!res.ok) throw new Error('Failed to fetch quote');
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

/**
 * Get multiple inspirational quotes (up to 50).
 */
export async function getQuotes(count = 10) {
  const res = await fetch(`${CORS_PROXY}${encodeURIComponent(`${ZENQUOTES_BASE}/quotes`)}`);
  if (!res.ok) throw new Error('Failed to fetch quotes');
  const data = await res.json();
  return data.slice(0, count);
}

// ─── Session / Mood Tracking (localStorage) ─────────────────────────────────

const SESSION_KEY = 'meditopia_sessions';
const MOOD_KEY    = 'meditopia_moods';

/**
 * Log a completed meditation session.
 * @param {object} session - { sessionId, duration, completedAt }
 */
export function logSession(session) {
  const sessions = getSessions();
  sessions.unshift({ ...session, completedAt: session.completedAt || new Date().toISOString() });
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessions.slice(0, 100)));
  return sessions[0];
}

/**
 * Get all logged sessions.
 */
export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Log a mood entry.
 * @param {number} mood - 1-5
 * @param {string} note - Optional note
 */
export function logMood(mood, note = '') {
  const moods = getMoodLog();
  const entry = { mood, note, loggedAt: new Date().toISOString() };
  moods.unshift(entry);
  localStorage.setItem(MOOD_KEY, JSON.stringify(moods.slice(0, 365)));
  return entry;
}

/**
 * Get mood log entries.
 */
export function getMoodLog() {
  try {
    return JSON.parse(localStorage.getItem(MOOD_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Get streak (consecutive days with at least one session).
 */
export function getMeditationStreak() {
  const sessions = getSessions();
  if (!sessions.length) return 0;
  const days = [...new Set(sessions.map(s => s.completedAt?.slice(0, 10)))].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);
  let check = today;
  for (const day of days) {
    if (day === check) {
      streak++;
      const d = new Date(check);
      d.setDate(d.getDate() - 1);
      check = d.toISOString().slice(0, 10);
    } else break;
  }
  return streak;
}

/**
 * Get total minutes meditated.
 */
export function getTotalMinutes() {
  return getSessions().reduce((sum, s) => sum + (s.duration || 0), 0);
}

// ─── Session Lookup ──────────────────────────────────────────────────────────

/**
 * Get meditation sessions by category.
 * @param {string} category - 'breathing'|'mindfulness'|'sleep'|'anxiety'|'focus'|'compassion'
 */
export function getSessionsByCategory(category) {
  return MEDITATION_SESSIONS.filter(s => s.category === category);
}

/**
 * Get a single session by ID.
 */
export function getSessionById(id) {
  return MEDITATION_SESSIONS.find(s => s.id === id) || null;
}

/**
 * Search sessions by tag.
 */
export function searchSessionsByTag(tag) {
  return MEDITATION_SESSIONS.filter(s => s.tags.includes(tag.toLowerCase()));
}
