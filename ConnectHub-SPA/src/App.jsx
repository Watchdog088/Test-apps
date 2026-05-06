// src/App.jsx — Router shell with lazy-loaded routes for all 23 screens
// Each lazy() call = a separate JS chunk. Only downloads when user visits that page.

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import SplashScreen from './components/common/SplashScreen';
import { useAuth } from './hooks/useAuth';

// ── Auth Pages (tiny, always needed) ──────────────────────────
import LoginPage from './pages/auth/LoginPage';

// ── Main App Pages (lazy loaded — separate JS chunks) ─────────
const FeedPage         = lazy(() => import('./pages/feed/FeedPage'));
const StoriesPage      = lazy(() => import('./pages/stories/StoriesPage'));
const LivePage         = lazy(() => import('./pages/live/LivePage'));
const TrendingPage     = lazy(() => import('./pages/trending/TrendingPage'));
const GroupsPage       = lazy(() => import('./pages/groups/GroupsPage'));
const MessagesPage     = lazy(() => import('./pages/messages/MessagesPage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const ProfilePage      = lazy(() => import('./pages/profile/ProfilePage'));
const FriendsPage      = lazy(() => import('./pages/friends/FriendsPage'));
const DatingPage       = lazy(() => import('./pages/dating/DatingPage'));
const EventsPage       = lazy(() => import('./pages/events/EventsPage'));
const GamingPage       = lazy(() => import('./pages/gaming/GamingPage'));
const MarketplacePage  = lazy(() => import('./pages/marketplace/MarketplacePage'));
const MediaHubPage     = lazy(() => import('./pages/mediahub/MediaHubPage'));
const MusicPage        = lazy(() => import('./pages/music/MusicPage'));
const VideoCallsPage   = lazy(() => import('./pages/videocalls/VideoCallsPage'));
const LiveStreamPage   = lazy(() => import('./pages/live/LivePage'));
const ARVRPage         = lazy(() => import('./pages/arvr/ARVRPage'));
const SavedPage        = lazy(() => import('./pages/saved/SavedPage'));
const SearchPage       = lazy(() => import('./pages/search/SearchPage'));
const SettingsPage     = lazy(() => import('./pages/settings/SettingsPage'));
const BusinessPage     = lazy(() => import('./pages/business/BusinessPage'));
const CreatorPage      = lazy(() => import('./pages/creator/CreatorPage'));
const HelpPage         = lazy(() => import('./pages/help/HelpPage'));
const MenuPage         = lazy(() => import('./pages/menu/MenuPage'));
const PremiumPage      = lazy(() => import('./pages/premium/PremiumPage'));

// ── Page Loading Fallback ─────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', padding: '40px', flexDirection: 'column', gap: '16px'
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: '#6366f1',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span style={{ color: '#94a3b8', fontSize: '14px' }}>Loading...</span>
    </div>
  );
}

// ── Protected Route wrapper ────────────────────────────────────
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { loading } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/login" element={<LoginPage />} />

        {/* ── Protected App Routes (inside AppShell with nav bars) ── */}
        <Route path="/" element={<PrivateRoute><AppShell /></PrivateRoute>}>
          <Route index element={<Navigate to="/feed" replace />} />
          <Route path="feed"          element={<FeedPage />} />
          <Route path="stories"       element={<StoriesPage />} />
          <Route path="live"          element={<LivePage />} />
          <Route path="trending"      element={<TrendingPage />} />
          <Route path="groups"        element={<GroupsPage />} />
          <Route path="messages"      element={<MessagesPage />} />
          <Route path="messages/:id"  element={<MessagesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile"       element={<ProfilePage />} />
          <Route path="profile/:uid"  element={<ProfilePage />} />
          <Route path="friends"       element={<FriendsPage />} />
          <Route path="dating"        element={<DatingPage />} />
          <Route path="events"        element={<EventsPage />} />
          <Route path="gaming"        element={<GamingPage />} />
          <Route path="marketplace"   element={<MarketplacePage />} />
          <Route path="media"         element={<MediaHubPage />} />
          <Route path="music"         element={<MusicPage />} />
          <Route path="videocalls"    element={<VideoCallsPage />} />
          <Route path="livestream"    element={<LiveStreamPage />} />
          <Route path="arvr"          element={<ARVRPage />} />
          <Route path="saved"         element={<SavedPage />} />
          <Route path="search"        element={<SearchPage />} />
          <Route path="settings"      element={<SettingsPage />} />
          <Route path="business"      element={<BusinessPage />} />
          <Route path="creator"       element={<CreatorPage />} />
          <Route path="help"          element={<HelpPage />} />
          <Route path="menu"          element={<MenuPage />} />
          <Route path="premium"       element={<PremiumPage />} />
        </Route>

        {/* ── Catch-all → redirect to feed ── */}
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </Suspense>
  );
}
