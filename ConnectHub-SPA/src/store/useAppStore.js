// src/store/useAppStore.js — Global Zustand state store
// Replaces the scattered global variables from the monolith

import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────────────
  user: null,
  userProfile: null,
  demoMode: false,
  setUser: (user) => set({ user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setDemoMode: (v) => set({ demoMode: v }),

  // ── Toast Notifications ───────────────────────────────────
  toast: null,
  showToast: (message, duration = 3000) => {
    set({ toast: message });
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
  // followingIds: list of user IDs this user follows
  // friendIds: mutual follows (intersection of following + followers)
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
}));

export default useAppStore;
