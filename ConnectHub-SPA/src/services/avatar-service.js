// src/services/avatar-service.js — DiceBear Auto-Avatar Service
// ✅ NO API KEY REQUIRED — completely free, open-source
// API Docs: https://www.dicebear.com/how-to-use/http-api/
// License: MIT (DiceBear library) — individual style licenses vary, all free to use
// What it does: Generates deterministic, unique SVG/PNG avatars from any seed string
//   (username, userId, email). Same seed always produces the same avatar.

const DICEBEAR_BASE = 'https://api.dicebear.com/9.x';

// ─── All available DiceBear styles (v9.x) ────────────────────────────────
// Each style has a different visual theme — choose the best fit per context
export const AVATAR_STYLES = {
  // ── Human / Character styles ──────────────────────────────────────────
  adventurer:         'adventurer',          // cartoon human, illustrated
  adventurerNeutral:  'adventurer-neutral',  // cartoon human, no gender expression
  avataaars:          'avataaars',           // classic Notion-style avatar
  avataaarsNeutral:   'avataaars-neutral',   // neutral avataaars
  bigEars:            'big-ears',            // big-eared cartoon character
  bigEarsNeutral:     'big-ears-neutral',    // neutral big-ears
  bigSmile:           'big-smile',           // wide-smile cartoon
  croodles:           'croodles',            // hand-drawn doodle style
  croodlesNeutral:    'croodles-neutral',    // neutral doodles
  dylan:              'dylan',               // minimalist illustrated
  funEmoji:           'fun-emoji',           // fun emoji-based face
  glass:              'glass',              // geometric glass style
  lorelei:            'lorelei',             // illustrated portrait
  loreleiNeutral:     'lorelei-neutral',     // neutral lorelei
  micah:              'micah',               // illustrated bust portrait
  miniavs:            'miniavs',             // mini illustrated avatars
  notionists:         'notionists',          // Notion-style illustrations
  notionistsNeutral:  'notionists-neutral',  // neutral notionists
  openPeeps:          'open-peeps',          // open-source illustration library
  personas:           'personas',            // illustrated personas
  pixelArt:           'pixel-art',          // pixel art character
  pixelArtNeutral:    'pixel-art-neutral',   // neutral pixel art
  // ── Abstract / Non-human styles ───────────────────────────────────────
  bottts:             'bottts',              // robot/bot avatars 🤖
  botttsNeutral:      'bottts-neutral',      // neutral bots
  icons:              'icons',               // icon-style avatars
  identicon:          'identicon',           // GitHub-style identicon
  initials:           'initials',            // letter initials avatar
  rings:              'rings',               // abstract ring patterns
  shapes:             'shapes',              // geometric shapes
  thumbs:             'thumbs',              // thumbs-up cartoon
};

// ─── LynkApp default style assignments per use case ──────────────────────
export const LYNKAPP_STYLES = {
  user:        'adventurer',        // Main user profile avatars
  dating:      'lorelei',           // Dating section — illustrated portraits
  bot:         'bottts',            // Bots, AI assistants, system messages
  group:       'shapes',            // Group / community avatars
  business:    'notionists',        // Business profiles
  gaming:      'pixel-art',         // Gaming section
  initials:    'initials',          // When you want letter-based avatars
  placeholder: 'fun-emoji',         // Generic placeholder avatars
};

// ─── LynkApp brand background color palette ──────────────────────────────
export const LYNKAPP_BACKGROUNDS = [
  'b6e3f4',  // light blue
  'c0aede',  // lavender
  'd1d4f9',  // periwinkle
  'ffd5dc',  // pink
  'ffdfbf',  // peach
  'b6f4d4',  // mint green
  'f4e4b6',  // warm yellow
  'f4b6b6',  // salmon
];

// ─── Build a deterministic background color from seed ────────────────────
function seedToBackground(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }
  return LYNKAPP_BACKGROUNDS[Math.abs(hash) % LYNKAPP_BACKGROUNDS.length];
}

// ─── Core URL builder ─────────────────────────────────────────────────────
function buildAvatarUrl(style, seed, options = {}) {
  const {
    format = 'svg',         // 'svg' | 'png' | 'jpg' | 'webp' | 'avif'
    size = 128,             // pixels (only applies to raster formats)
    backgroundColor,        // hex color without '#', or 'transparent'
    radius = 50,            // border radius 0–50 (50 = circle)
    scale = 100,            // scale % 0–200
    flip = false,           // mirror horizontally
    rotate = 0,             // rotation degrees
    translateX = 0,
    translateY = 0,
    ...extra                // style-specific options (see DiceBear docs)
  } = options;

  const bg = backgroundColor || seedToBackground(seed);
  const params = new URLSearchParams();

  params.set('seed', seed);
  if (bg !== 'transparent') params.set('backgroundColor', bg);
  if (radius !== 50) params.set('radius', radius);
  if (scale !== 100) params.set('scale', scale);
  if (flip) params.set('flip', 'true');
  if (rotate !== 0) params.set('rotate', rotate);
  if (translateX !== 0) params.set('translateX', translateX);
  if (translateY !== 0) params.set('translateY', translateY);
  if (format !== 'svg') params.set('size', size);

  // Pass any extra style-specific options
  Object.entries(extra).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.set(k, v);
  });

  return `${DICEBEAR_BASE}/${style}/${format}?${params.toString()}`;
}

// ═══════════════════════════════════════════════════════════════
//  1. PRIMARY FUNCTIONS — get avatar URL(s)
// ═══════════════════════════════════════════════════════════════

// Get a single avatar URL from any seed (username, userId, email, etc.)
// This is the main function to use in most cases.
//
// Usage:
//   const url = getAvatarUrl('jeremy_newball')
//   <img src={url} alt="Avatar" />
//
export function getAvatarUrl(seed, options = {}) {
  const style = options.style || LYNKAPP_STYLES.user;
  const cleanSeed = String(seed || 'default').trim();
  return buildAvatarUrl(style, cleanSeed, options);
}

// Get avatar URL as PNG (for places that need raster images)
export function getAvatarPng(seed, options = {}) {
  return getAvatarUrl(seed, { ...options, format: 'png', size: options.size || 128 });
}

// Get avatar URL as WebP (modern, smaller file size)
export function getAvatarWebp(seed, options = {}) {
  return getAvatarUrl(seed, { ...options, format: 'webp', size: options.size || 128 });
}

// Get a circular avatar (radius: 50)
export function getCircleAvatar(seed, options = {}) {
  return getAvatarUrl(seed, { ...options, radius: 50 });
}

// Get a square avatar (radius: 0)
export function getSquareAvatar(seed, options = {}) {
  return getAvatarUrl(seed, { ...options, radius: 0 });
}

// ═══════════════════════════════════════════════════════════════
//  2. PER-SECTION SHORTCUTS — LynkApp specific
// ═══════════════════════════════════════════════════════════════

// User profile avatar — adventurer style, circular
export function getUserAvatar(userId, options = {}) {
  return getAvatarUrl(userId, { style: 'adventurer', radius: 50, ...options });
}

// Dating profile avatar — lorelei style (illustrated portraits)
export function getDatingAvatar(userId, options = {}) {
  return getAvatarUrl(userId, { style: 'lorelei', radius: 50, ...options });
}

// Bot / AI assistant avatar — robot style
export function getBotAvatar(botId = 'lynkbot', options = {}) {
  return getAvatarUrl(botId, { style: 'bottts', radius: 50, backgroundColor: 'b6e3f4', ...options });
}

// Group / community avatar — shapes style
export function getGroupAvatar(groupId, options = {}) {
  return getAvatarUrl(groupId, { style: 'shapes', radius: 0, ...options });
}

// Business profile avatar — notionists style
export function getBusinessAvatar(businessId, options = {}) {
  return getAvatarUrl(businessId, { style: 'notionists', radius: 50, ...options });
}

// Gaming avatar — pixel art style
export function getGamingAvatar(userId, options = {}) {
  return getAvatarUrl(userId, { style: 'pixel-art', radius: 0, ...options });
}

// Initials avatar (letter-based, like Google)
// Supply the user's name and it generates letter initials
export function getInitialsAvatar(name, options = {}) {
  return getAvatarUrl(name, { style: 'initials', radius: 50, ...options });
}

// Fun emoji placeholder — for anonymous/loading states
export function getPlaceholderAvatar(seed = 'default', options = {}) {
  return getAvatarUrl(seed, { style: 'fun-emoji', radius: 50, ...options });
}

// ═══════════════════════════════════════════════════════════════
//  3. GENERATE MULTIPLE AVATARS — "avatar picker" feature
// ═══════════════════════════════════════════════════════════════

// Generate multiple avatar options for the user to pick from.
// Returns array of { url, style, seed } objects.
//
// Usage in onboarding / profile setup:
//   const options = getAvatarPicker('jeremy123', 6);
//   // Show a grid of 6 avatars to choose from
//
export function getAvatarPicker(seed, count = 6, style = 'adventurer') {
  const variants = [];
  for (let i = 0; i < count; i++) {
    const variantSeed = `${seed}_v${i}`;
    variants.push({
      id: i,
      seed: variantSeed,
      style,
      url: getAvatarUrl(variantSeed, { style, radius: 50 }),
    });
  }
  return variants;
}

// Generate one avatar for each LynkApp style (style gallery/sampler)
export function getStyleSampler(seed) {
  return Object.entries(LYNKAPP_STYLES).map(([name, style]) => ({
    name,
    style,
    url: getAvatarUrl(seed, { style, radius: 50 }),
  }));
}

// Generate avatars across multiple styles for a user (style selector in settings)
export function getMultiStyleAvatars(seed, styles = null) {
  const styleList = styles || Object.values(AVATAR_STYLES).slice(0, 12);
  return styleList.map(style => ({
    style,
    url: getAvatarUrl(seed, { style, radius: 50 }),
  }));
}

// ═══════════════════════════════════════════════════════════════
//  4. SMART FALLBACK — use photo if available, else avatar
// ═══════════════════════════════════════════════════════════════

// Returns photoUrl if available, otherwise generates a DiceBear avatar.
// This is the recommended function to use everywhere in the app.
//
// Usage:
//   const src = resolveAvatar(user.photoUrl, user.uid)
//   <img src={src} alt={user.displayName} />
//
export function resolveAvatar(photoUrl, seed, options = {}) {
  if (photoUrl && typeof photoUrl === 'string' && photoUrl.startsWith('http')) {
    return photoUrl;
  }
  return getUserAvatar(seed || 'anonymous', options);
}

// React hook usage example (reference — not actual hook):
// const avatarSrc = resolveAvatar(user?.photoURL, user?.uid);

// ═══════════════════════════════════════════════════════════════
//  5. UTILITY HELPERS
// ═══════════════════════════════════════════════════════════════

// Get the background color that will be used for a given seed
export function getAvatarBackground(seed) {
  return `#${seedToBackground(String(seed))}`;
}

// Check if a DiceBear style name is valid
export function isValidStyle(style) {
  return Object.values(AVATAR_STYLES).includes(style);
}

// Get all available style names as an array
export function getAllStyles() {
  return Object.values(AVATAR_STYLES);
}

// Get all LynkApp curated styles
export function getLynkAppStyles() {
  return { ...LYNKAPP_STYLES };
}

// ═══════════════════════════════════════════════════════════════
//  6. REACT COMPONENT HELPER — returns img props
// ═══════════════════════════════════════════════════════════════

// Returns an object of img props ready to spread onto an <img> element.
// Usage:
//   <img {...getAvatarProps(user.uid, user.displayName)} className="avatar" />
//
export function getAvatarProps(seed, displayName = '', options = {}) {
  const src = resolveAvatar(options.photoUrl, seed, options);
  const initials = (displayName || String(seed)).slice(0, 2).toUpperCase();
  return {
    src,
    alt: displayName || `Avatar for ${seed}`,
    'data-seed': seed,
    'data-initials': initials,
    onError: (e) => {
      // Fallback if image fails to load — swap to initials avatar
      e.currentTarget.src = getInitialsAvatar(displayName || seed, { size: options.size || 128 });
      e.currentTarget.onerror = null; // prevent infinite loop
    },
  };
}

// ═══════════════════════════════════════════════════════════════
//  LYNKAPP PRESETS — ready-to-use per section
// ═══════════════════════════════════════════════════════════════

export const AvatarPresets = {
  // Core
  user:        (id, opts)    => getUserAvatar(id, opts),
  dating:      (id, opts)    => getDatingAvatar(id, opts),
  group:       (id, opts)    => getGroupAvatar(id, opts),
  business:    (id, opts)    => getBusinessAvatar(id, opts),
  gaming:      (id, opts)    => getGamingAvatar(id, opts),
  bot:         (id, opts)    => getBotAvatar(id, opts),
  initials:    (name, opts)  => getInitialsAvatar(name, opts),
  placeholder: (seed, opts)  => getPlaceholderAvatar(seed, opts),
  // Smart fallback
  resolve:     (photo, seed, opts) => resolveAvatar(photo, seed, opts),
  // Picker / gallery
  picker:      (seed, count, style) => getAvatarPicker(seed, count, style),
  sampler:     (seed)        => getStyleSampler(seed),
  // Props helper
  imgProps:    (seed, name, opts) => getAvatarProps(seed, name, opts),
};

// ─── Default export ────────────────────────────────────────────
const AvatarService = {
  // Core URL generators
  getAvatarUrl,
  getAvatarPng,
  getAvatarWebp,
  getCircleAvatar,
  getSquareAvatar,
  // Per-section
  getUserAvatar,
  getDatingAvatar,
  getBotAvatar,
  getGroupAvatar,
  getBusinessAvatar,
  getGamingAvatar,
  getInitialsAvatar,
  getPlaceholderAvatar,
  // Multi-avatar
  getAvatarPicker,
  getStyleSampler,
  getMultiStyleAvatars,
  // Smart fallback
  resolveAvatar,
  // React helpers
  getAvatarProps,
  // Utils
  getAvatarBackground,
  isValidStyle,
  getAllStyles,
  getLynkAppStyles,
  // Constants
  AVATAR_STYLES,
  LYNKAPP_STYLES,
  LYNKAPP_BACKGROUNDS,
  // Presets
  AvatarPresets,
};

export default AvatarService;
