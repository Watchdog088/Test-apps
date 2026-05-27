// src/store/useAppStore.js — Global Zustand state store
// Replaces the scattered global variables from the monolith
// BUG-13 FIX (May 12 2026): showToast now accepts type param (success/warning/info/error)
// DATING FIX (May 12 2026): Added datingState + setDatingState for cross-section dating data
// LIVE-FIX (May 27 2026): Removed hardcoded demo user — user starts as undefined so Firebase
//   auth resolves before PrivateRoute evaluates. demoMode now starts false.
// AUDIO-FIX (May 27 2026): Added currentTrack + isPlaying for global music player state.

import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────────────
  // LIVE MODE: user starts as `undefined` so loading=true while Firebase resolves.
  // Once onAuthStateChanged fires: real user object OR null (redirects to /login).
  // demoMode is false — real Firebase auth always runs.
  user: undefined,
  userProfile: null,
  demoMode: false,
  setUser: (user) => set({ user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setDemoMode: (v) => set({ demoMode: v }),

  // ── Toast Notifications ───────────────────────────────────
  // BUG-13 FIX: Added type param so callers can signal success/warning/info/error
  // type controls border/icon color in AppShell toast renderer
  toast: null,
  showToast: (message, type = 'info', duration = 3000) => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), duration);
  },

  // ── Unread Counts (for nav badges) ────────────────────────
  unreadMessages: 0,
  unreadNotifications: 0,
  setUnreadMessages: (n) => set({ unreadMessages: n }),
  setUnreadNotifications: (n) => set({ unreadNotifications: n }),
  incrementUnreadMessages: () => set((s) => ({ unreadMessages: s.unreadMessages + 1 })),
  incrementUnreadNotifications: () => set((s) => ({ unreadNotifications: s.unreadNotifications + 1 })),
  resetUnreadMessages: () => set({ unreadMessages: 0 }),
  // BUG-6 FIX: Added resetUnreadNotifications so NotificationsPage can clear badge on mount
  resetUnreadNotifications: () => set({ unreadNotifications: 0 }),

  // ── Feed State ────────────────────────────────────────────
  feedPosts: [],
  feedLastDoc: null,
  feedLoading: false,
  setFeedPosts: (posts) => set({ feedPosts: posts }),
  appendFeedPosts: (posts, lastDoc) => set((s) => ({
    feedPosts: [...s.feedPosts, ...posts],
    feedLastDoc: lastDoc
  })),
  setFeedLoading: (v) => set({ feedLoading: v }),

  // ── Social Graph (for feed filtering) ─────────────────────
  followingIds: [],
  friendIds: [],
  setFollowingIds: (ids) => set({ followingIds: ids }),
  setFriendIds: (ids) => set({ friendIds: ids }),

  // ── More Drawer (Rec: slide-in instead of full page nav) ───
  moreDrawerOpen: false,
  setMoreDrawerOpen: (v) => set({ moreDrawerOpen: v }),

  // ── Active Bottom Tab ─────────────────────────────────────
  activeTab: 'feed',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ── Theme (dark default) ──────────────────────────────────
  theme: 'dark',
  setTheme: (t) => {
    set({ theme: t });
    document.documentElement.setAttribute('data-theme', t);
  },

  // ── Create Post Modal ─────────────────────────────────────
  createPostOpen: false,
  setCreatePostOpen: (v) => set({ createPostOpen: v }),

  // ── Dating State ──────────────────────────────────────────
  // Shared cross-section dating data so BottomNav can show match badge
  datingState: {
    matchCount: 0,
    likedByYouCount: 0,
    preferences: null,
    swipeHistory: [],
  },
  setDatingState: (partial) => set((s) => ({
    datingState: { ...s.datingState, ...partial }
  })),
  incrementDatingMatches: () => set((s) => ({
    datingState: { ...s.datingState, matchCount: s.datingState.matchCount + 1 }
  })),

  // ── Global Music Player (Step 7.1 — Audio state) ──────────
  // currentTrack: { url, title, artist, artwork } or null
  // isPlaying: drives AudioRef in AppShell
  currentTrack: null,
  isPlaying: false,
  setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: !!track }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  stopAudio: () => set({ currentTrack: null, isPlaying: false }),
}));

export default useAppStore;
