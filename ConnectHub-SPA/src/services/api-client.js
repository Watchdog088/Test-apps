/**
 * LynkApp Unified API Client
 * Points to the AWS-hosted backend: https://lynkapp.net/api
 * Falls back gracefully — Firestore is the primary real-time layer;
 * this REST client is used for admin ops, batch queries & features
 * that require server-side processing (payments, KYC, shipping, etc.)
 */

import { getAuth } from 'firebase/auth';

// ─── Base URL ──────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lynkapp.net/api';

// ─── Core fetch wrapper ────────────────────────────────────────────────────
async function request(method, path, body = null, requiresAuth = true) {
  const headers = { 'Content-Type': 'application/json' };

  if (requiresAuth) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('[API] Could not get auth token:', e.message);
    }
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${path}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  } catch (err) {
    console.error(`[API] ${method} ${path} failed:`, err.message);
    throw err;
  }
}

const get  = (path, auth = true) => request('GET',    path, null, auth);
const post = (path, body, auth = true) => request('POST',   path, body, auth);
const put  = (path, body, auth = true) => request('PUT',    path, body, auth);
const del  = (path, auth = true) => request('DELETE', path, null, auth);

// ─── Health ────────────────────────────────────────────────────────────────
export const healthAPI = {
  check: () => get('/health', false),
};

// ─── AUTH — Section 1 ─────────────────────────────────────────────────────
export const authAPI = {
  register:       (data) => post('/auth/register', data, false),
  login:          (data) => post('/auth/login', data, false),
  logout:         ()     => post('/auth/logout', {}),
  refreshToken:   ()     => post('/auth/refresh', {}),
  forgotPassword: (email) => post('/auth/forgot-password', { email }, false),
  resetPassword:  (data)  => post('/auth/reset-password', data, false),
  verifyEmail:    (token) => get(`/auth/verify-email?token=${token}`, false),
};

// ─── USERS / PROFILE — Section 8 ─────────────────────────────────────────
export const usersAPI = {
  getProfile:    (uid)  => get(`/users/${uid}`, false),
  updateProfile: (data) => put('/users/me', data),
  getFollowers:  (uid)  => get(`/users/${uid}/followers`, false),
  getFollowing:  (uid)  => get(`/users/${uid}/following`, false),
  follow:        (uid)  => post(`/users/${uid}/follow`, {}),
  unfollow:      (uid)  => del(`/users/${uid}/follow`),
  search:        (q)    => get(`/search?q=${encodeURIComponent(q)}&type=users`, false),
  requestVerify: ()     => post('/users/me/verify-request', {}),
};

// ─── POSTS / FEED — Section 2 ─────────────────────────────────────────────
export const postsAPI = {
  getFeed:      (page = 1) => get(`/posts?page=${page}`),
  getPost:      (id)       => get(`/posts/${id}`, false),
  create:       (data)     => post('/posts', data),
  update:       (id, data) => put(`/posts/${id}`, data),
  delete:       (id)       => del(`/posts/${id}`),
  like:         (id)       => post(`/posts/${id}/like`, {}),
  unlike:       (id)       => del(`/posts/${id}/like`),
  comment:      (id, text) => post(`/posts/${id}/comments`, { text }),
  getComments:  (id)       => get(`/posts/${id}/comments`, false),
  share:        (id)       => post(`/posts/${id}/share`, {}),
  save:         (id)       => post(`/posts/${id}/save`, {}),
  report:       (id, reason) => post(`/posts/${id}/report`, { reason }),
};

// ─── STORIES — Section 3 ──────────────────────────────────────────────────
export const storiesAPI = {
  getStories:     ()       => get('/stories'),
  createStory:    (data)   => post('/stories', data),
  deleteStory:    (id)     => del(`/stories/${id}`),
  viewStory:      (id)     => post(`/stories/${id}/view`, {}),
  reactToStory:   (id, emoji) => post(`/stories/${id}/react`, { emoji }),
  getHighlights:  (uid)    => get(`/stories/highlights/${uid}`, false),
};

// ─── LIVE STREAMING — Section 4 ───────────────────────────────────────────
export const streamingAPI = {
  startStream:    (data)   => post('/streaming/start', data),
  endStream:      (id)     => post(`/streaming/${id}/end`, {}),
  getActiveStreams: ()      => get('/streaming/active', false),
  getStream:      (id)     => get(`/streaming/${id}`, false),
  scheduleStream: (data)   => post('/streaming/schedule', data),
  getAnalytics:   (id)     => get(`/streaming/${id}/analytics`),
};

// ─── DATING — Section 5 ───────────────────────────────────────────────────
export const datingAPI = {
  getProfiles:    () => get('/dating/profiles'),
  swipeRight:     (id) => post(`/dating/swipe/${id}/right`, {}),
  swipeLeft:      (id) => post(`/dating/swipe/${id}/left`, {}),
  getMatches:     () => get('/dating/matches'),
  unmatch:        (id) => del(`/dating/matches/${id}`),
  getProfile:     () => get('/dating/profile/me'),
  updateProfile:  (data) => put('/dating/profile', data),
  updatePrefs:    (data) => put('/dating/preferences', data),
  reportUser:     (id, reason) => post(`/dating/report/${id}`, { reason }),
  blockUser:      (id) => post(`/dating/block/${id}`, {}),
};

// ─── MESSAGES — Section 6 ─────────────────────────────────────────────────
export const messagesAPI = {
  getConversations: ()          => get('/messages'),
  getMessages:      (convId)    => get(`/messages/${convId}`),
  sendMessage:      (convId, data) => post(`/messages/${convId}`, data),
  deleteMessage:    (convId, msgId) => del(`/messages/${convId}/${msgId}`),
  markRead:         (convId)    => put(`/messages/${convId}/read`, {}),
  archiveConvo:     (convId)    => put(`/messages/${convId}/archive`, {}),
  createGroupChat:  (data)      => post('/messages/group', data),
};

// ─── NOTIFICATIONS — Section 7 ────────────────────────────────────────────
export const notificationsAPI = {
  getAll:           ()   => get('/notifications'),
  markRead:         (id) => put(`/notifications/${id}/read`, {}),
  markAllRead:      ()   => put('/notifications/mark/read-all', {}),
  delete:           (id) => del(`/notifications/${id}`),
  getSettings:      ()   => get('/notifications/settings/prefs'),
  updateSettings:   (data) => put('/notifications/settings/prefs', data),
};

// ─── FRIENDS — Section 9 ──────────────────────────────────────────────────
export const friendsAPI = {
  getFriends:       ()     => get('/friends'),
  sendRequest:      (uid)  => post('/friends/request', { targetUserId: uid }),
  acceptRequest:    (id)   => put(`/friends/request/${id}/accept`, {}),
  rejectRequest:    (id)   => put(`/friends/request/${id}/reject`, {}),
  unfriend:         (uid)  => del(`/friends/${uid}`),
  getSuggestions:   ()     => get('/friends/suggestions/list'),
  getPendingReqs:   ()     => get('/friends/requests/pending'),
};

// ─── GROUPS — Section 10 ──────────────────────────────────────────────────
export const groupsAPI = {
  getGroups:  ()       => get('/groups'),
  getGroup:   (id)     => get(`/groups/${id}`, false),
  create:     (data)   => post('/groups', data),
  update:     (id, data) => put(`/groups/${id}`, data),
  delete:     (id)     => del(`/groups/${id}`),
  join:       (id)     => post(`/groups/${id}/join`, {}),
  leave:      (id)     => post(`/groups/${id}/leave`, {}),
  getMembers: (id)     => get(`/groups/${id}/members`),
  getPosts:   (id)     => get(`/groups/${id}/posts`),
  createPost: (id, data) => post(`/groups/${id}/posts`, data),
};

// ─── EVENTS — Section 11 ──────────────────────────────────────────────────
export const eventsAPI = {
  getEvents:    ()       => get('/events', false),
  getEvent:     (id)     => get(`/events/${id}`, false),
  create:       (data)   => post('/events', data),
  update:       (id, d)  => put(`/events/${id}`, d),
  delete:       (id)     => del(`/events/${id}`),
  rsvp:         (id, status) => post(`/events/${id}/rsvp`, { status }),
  getAttendees: (id)     => get(`/events/${id}/attendees`),
  getNearby:    ()       => get('/events/nearby/list', false),
};

// ─── MARKETPLACE — Section 12 ─────────────────────────────────────────────
export const marketplaceAPI = {
  getListings:     (params = '') => get(`/marketplace/listings${params}`, false),
  getListing:      (id)          => get(`/marketplace/listings/${id}`, false),
  createListing:   (data)        => post('/marketplace/listings', data),
  updateListing:   (id, data)    => put(`/marketplace/listings/${id}`, data),
  deleteListing:   (id)          => del(`/marketplace/listings/${id}`),
  getOrders:       ()            => get('/marketplace/orders'),
  createOrder:     (data)        => post('/marketplace/orders', data),
  updateOrderStatus: (id, status) => put(`/marketplace/orders/${id}/status`, { status }),
  createCheckout:  (data)        => post('/marketplace/checkout', data),
  getShippingRates: (data)       => post('/marketplace/shipping-rates', data),
  submitKYC:       (data)        => post('/kyc/submit', data),
  getKYCStatus:    ()            => get('/kyc/status'),
  submitReview:    (productId, data) => post(`/marketplace/listings/${productId}/reviews`, data),
  getReviews:      (productId)   => get(`/marketplace/listings/${productId}/reviews`, false),
  submitReturn:    (orderId, data) => post(`/marketplace/orders/${orderId}/return`, data),
  boostListing:    (id, tier)    => post(`/marketplace/listings/${id}/boost`, { tier }),
};

// ─── SEARCH — Section 14 ──────────────────────────────────────────────────
export const searchAPI = {
  search:      (q, type = 'all', page = 1) => get(`/search?q=${encodeURIComponent(q)}&type=${type}&page=${page}`, false),
  trending:    () => get('/search/trending/topics', false),
  hashtag:     (tag) => get(`/search/hashtags/${tag}`, false),
};

// ─── SETTINGS — Section 15 ────────────────────────────────────────────────
export const settingsAPI = {
  get:            () => get('/settings'),
  update:         (data) => put('/settings', data),
  updatePrivacy:  (data) => put('/settings/privacy', data),
  updatePassword: (data) => put('/settings/password', data),
  deleteAccount:  () => del('/settings/account'),
  getBlocked:     () => get('/settings/blocked/users'),
};

// ─── GAMING — Section 18 ──────────────────────────────────────────────────
export const gamingAPI = {
  getGames:       () => get('/gaming/games', false),
  getLeaderboard: () => get('/gaming/leaderboard', false),
  saveScore:      (gameId, score) => post('/gaming/score', { gameId, score }),
  getAchievements: () => get('/gaming/achievements'),
  createChallenge: (data) => post('/gaming/challenge', data),
};

// ─── MEDIA HUB — Section 17 ───────────────────────────────────────────────
export const mediaAPI = {
  getFeed:    () => get('/media/feed'),
  getMedia:   (id) => get(`/media/${id}`, false),
  upload:     (data) => post('/media', data),
  delete:     (id) => del(`/media/${id}`),
  like:       (id) => post(`/media/${id}/like`, {}),
};

// ─── MUSIC PLAYER — Section 16 ────────────────────────────────────────────
export const musicAPI = {
  getTracks:       () => get('/music/tracks', false),
  getPlaylists:    () => get('/music/playlists'),
  createPlaylist:  (data) => post('/music/playlists', data),
  updatePlaylist:  (id, data) => put(`/music/playlists/${id}`, data),
  deletePlaylist:  (id) => del(`/music/playlists/${id}`),
  getRadio:        () => get('/music/radio', false),
  recordPlay:      (data) => post('/music/history', data),
};

// ─── AR/VR — Section 20 ───────────────────────────────────────────────────
export const arvrAPI = {
  getFilters:     () => get('/arvr/filters', false),
  getExperiences: () => get('/arvr/experiences', false),
  startSession:   (data) => post('/arvr/session', data),
  getAssets:      () => get('/arvr/assets', false),
};

// ─── CREATOR STUDIO — Section 21 ──────────────────────────────────────────
export const creatorAPI = {
  getStats:           () => get('/creator/stats'),
  getContent:         () => get('/creator/content'),
  createContent:      (data) => post('/creator/content', data),
  getMonetization:    () => get('/creator/monetization'),
  updateMonetization: (data) => put('/creator/monetization', data),
  getAnalytics:       () => get('/creator/analytics'),
};

// ─── BUSINESS TOOLS — Section 22 ──────────────────────────────────────────
export const businessAPI = {
  getProfile:     () => get('/business/profile'),
  createProfile:  (data) => post('/business/profile', data),
  updateProfile:  (data) => put('/business/profile', data),
  getAnalytics:   () => get('/business/analytics'),
  createAd:       (data) => post('/business/ads', data),
  getAds:         () => get('/business/ads'),
};

// ─── PREMIUM — Section 23 ─────────────────────────────────────────────────
export const premiumAPI = {
  getPlans:    () => get('/premium/plans', false),
  getStatus:   () => get('/premium/status'),
  subscribe:   (planId, paymentMethodId) => post('/premium/subscribe', { planId, paymentMethodId }),
  cancel:      () => del('/premium/cancel'),
};

// ─── HELP & SUPPORT — Section 24 ──────────────────────────────────────────
export const helpAPI = {
  getArticles:   () => get('/help/articles', false),
  getArticle:    (id) => get(`/help/articles/${id}`, false),
  getFaq:        () => get('/help/faq', false),
  createTicket:  (data) => post('/help/tickets', data),
  getTickets:    () => get('/help/tickets'),
  getTicket:     (id) => get(`/help/tickets/${id}`),
  replyTicket:   (id, message) => post(`/help/tickets/${id}/reply`, { message }),
};

// ─── ADMIN — Section 26 ───────────────────────────────────────────────────
export const adminAPI = {
  getStats:       () => get('/admin/stats'),
  getUsers:       () => get('/admin/users'),
  banUser:        (id) => put(`/admin/users/${id}/ban`, {}),
  unbanUser:      (id) => put(`/admin/users/${id}/unban`, {}),
  getReports:     () => get('/admin/reports'),
  resolveReport:  (id) => put(`/admin/reports/${id}/resolve`, {}),
  getKYC:         () => get('/admin/kyc'),
  approveKYC:     (id) => put(`/admin/kyc/${id}/approve`, {}),
  rejectKYC:      (id) => put(`/admin/kyc/${id}/reject`, {}),
  getAnalytics:   () => get('/admin/analytics'),
};

// ─── VIDEO CALLS — Section 19 ─────────────────────────────────────────────
export const callsAPI = {
  initiate: (data) => post('/calls/initiate', data),
  accept:   (id) => post(`/calls/${id}/accept`, {}),
  decline:  (id) => post(`/calls/${id}/decline`, {}),
  end:      (id) => post(`/calls/${id}/end`, {}),
  history:  () => get('/calls/history'),
};

// ─── Default export — all APIs ─────────────────────────────────────────────
export default {
  BASE_URL,
  health:       healthAPI,
  auth:         authAPI,
  users:        usersAPI,
  posts:        postsAPI,
  stories:      storiesAPI,
  streaming:    streamingAPI,
  dating:       datingAPI,
  messages:     messagesAPI,
  notifications: notificationsAPI,
  friends:      friendsAPI,
  groups:       groupsAPI,
  events:       eventsAPI,
  marketplace:  marketplaceAPI,
  search:       searchAPI,
  settings:     settingsAPI,
  gaming:       gamingAPI,
  media:        mediaAPI,
  music:        musicAPI,
  arvr:         arvrAPI,
  creator:      creatorAPI,
  business:     businessAPI,
  premium:      premiumAPI,
  help:         helpAPI,
  admin:        adminAPI,
  calls:        callsAPI,
};
