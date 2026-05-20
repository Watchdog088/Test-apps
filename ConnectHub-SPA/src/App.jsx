// src/App.jsx — Router shell with lazy-loaded routes for all screens
// BUG-10 FIX: ErrorBoundary wraps Routes
// POLISH-15 FIX: /onboarding route added
// POLISH-18 FIX: /trending redirects to /feed?filter=trending (no duplicate page)
// SPRINT-21 FIX: AdminGuard import moved to top-level (was after lazy declarations)

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import SplashScreen from './components/common/SplashScreen';
import { useAuth } from './hooks/useAuth';
// Sprint 20/21: AdminGuard + BoostListingModal — Firestore isAdmin role guard
import { AdminGuard } from './pages/marketplace/MarketplaceExtensions';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// New Dashboard Pages (lazy loaded)
const PostDetailPage       = lazy(() => import('./pages/post/PostDetailPage'));
const HashtagPage          = lazy(() => import('./pages/hashtag/HashtagPage'));
const FollowersPage        = lazy(() => import('./pages/profile/FollowersPage'));
const DatingMatchesPage    = lazy(() => import('./pages/dating/DatingMatchesPage'));
const NewMessagePage       = lazy(() => import('./pages/messages/NewMessagePage'));
const GroupDetailPage      = lazy(() => import('./pages/groups/GroupDetailPage'));
const EventDetailPage      = lazy(() => import('./pages/events/EventDetailPage'));
const ProductDetailPage    = lazy(() => import('./pages/marketplace/ProductDetailPage'));
const MyOrdersPage         = lazy(() => import('./pages/marketplace/MyOrdersPage'));
const SellerDashboardPage  = lazy(() => import('./pages/marketplace/SellerDashboardPage'));
const AdminDashboardPage   = lazy(() => import('./pages/admin/AdminDashboardPage'));
const TrendingPage         = lazy(() => import('./pages/trending/TrendingPage'));

// Settings sub-pages
const { PrivacySettingsPage, SecuritySettingsPage, NotificationPreferencesPage,
        BlockedUsersPage, DataSettingsPage, LinkedAccountsPage,
        LocaleSettingsPage, PaymentMethodsPage } = {
  PrivacySettingsPage: lazy(() => import('./pages/settings/SettingsSubPages').then(m => ({ default: m.PrivacySettingsPage }))),
  SecuritySettingsPage: lazy(() => import('./pages/settings/SettingsSubPages').then(m => ({ default: m.SecuritySettingsPage }))),
  NotificationPreferencesPage: lazy(() => import('./pages/settings/SettingsSubPages').then(m => ({ default: m.NotificationPreferencesPage }))),
  BlockedUsersPage: lazy(() => import('./pages/settings/SettingsSubPages').then(m => ({ default: m.BlockedUsersPage }))),
  DataSettingsPage: lazy(() => import('./pages/settings/SettingsSubPages').then(m => ({ default: m.DataSettingsPage }))),
  LinkedAccountsPage: lazy(() => import('./pages/settings/SettingsSubPages').then(m => ({ default: m.LinkedAccountsPage }))),
  LocaleSettingsPage: lazy(() => import('./pages/settings/SettingsSubPages').then(m => ({ default: m.LocaleSettingsPage }))),
  PaymentMethodsPage: lazy(() => import('./pages/settings/SettingsSubPages').then(m => ({ default: m.PaymentMethodsPage }))),
};

// Creator sub-pages
const CreatorAnalyticsPage    = lazy(() => import('./pages/creator/CreatorSubPages').then(m => ({ default: m.CreatorAnalyticsPage })));
const CreatorMonetizationPage = lazy(() => import('./pages/creator/CreatorSubPages').then(m => ({ default: m.CreatorMonetizationPage })));

// Misc sub-pages
const BusinessAnalyticsPage  = lazy(() => import('./pages/misc/MiscSubPages').then(m => ({ default: m.BusinessAnalyticsPage })));
const GamingLibraryPage      = lazy(() => import('./pages/misc/MiscSubPages').then(m => ({ default: m.GamingLibraryPage })));
const GamingLeaderboardPage  = lazy(() => import('./pages/misc/MiscSubPages').then(m => ({ default: m.GamingLeaderboardPage })));
const MusicArtistPage        = lazy(() => import('./pages/misc/MiscSubPages').then(m => ({ default: m.MusicArtistPage })));
const SavedCollectionsPage   = lazy(() => import('./pages/misc/MiscSubPages').then(m => ({ default: m.SavedCollectionsPage })));
const VideoPlayerPage        = lazy(() => import('./pages/misc/MiscSubPages').then(m => ({ default: m.VideoPlayerPage })));

// Onboarding (POLISH-15)
const OnboardingPage = lazy(() => import('./pages/onboarding/OnboardingPage'));

// Main App Pages (lazy loaded)
const FeedPage          = lazy(() => import('./pages/feed/FeedPage'));
const StoriesPage       = lazy(() => import('./pages/stories/StoriesPage'));
const LivePage          = lazy(() => import('./pages/live/LivePage'));

// Live sub-pages (LIVE-BUG-01 through LIVE-BUG-10 fixes)
const LiveSetupPage          = lazy(() => import('./pages/live/LiveSetupPage'));
const LiveWatchPage          = lazy(() => import('./pages/live/LiveWatchPage'));
const LiveMonetizationPage   = lazy(() => import('./pages/live/LiveMonetizationPage'));
const LiveModerationPage     = lazy(() => import('./pages/live/LiveModerationPage'));
const LiveSchedulePage       = lazy(() => import('./pages/live/LiveSchedulePage'));
const LiveAnalyticsPage      = lazy(() => import('./pages/live/LiveAnalyticsPage'));
// BUG-04 FIX: New page — bell icon on /live now has a destination
const LiveNotificationsPage  = lazy(() => import('./pages/live/LiveNotificationsPage'));
// BUG-05 FIX: New page — clip cards on /live now have a destination
const ClipViewerPage         = lazy(() => import('./pages/live/ClipViewerPage'));
// REC-6.10: VOD replay page
const LiveVODPage            = lazy(() => import('./pages/live/LiveVODPage'));
const GroupsPage        = lazy(() => import('./pages/groups/GroupsPage'));
const MessagesPage      = lazy(() => import('./pages/messages/MessagesPage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const ProfilePage       = lazy(() => import('./pages/profile/ProfilePage'));
const FriendsPage       = lazy(() => import('./pages/friends/FriendsPage'));
const DatingPage        = lazy(() => import('./pages/dating/DatingPage'));
const EventsPage        = lazy(() => import('./pages/events/EventsPage'));
const GamingPage        = lazy(() => import('./pages/gaming/GamingPage'));
const MarketplacePage      = lazy(() => import('./pages/marketplace/MarketplacePage'));
const SellerProfilePage    = lazy(() => import('./pages/marketplace/SellerProfilePage'));
const KYCAdminPage         = lazy(() => import('./pages/admin/KYCAdminPage'));
// Sprint 21: /admin/reports — Report moderation page (guarded by AdminGuard)
const ReportsAdminPage     = lazy(() => import('./pages/admin/ReportsAdminPage'));
const MediaHubPage      = lazy(() => import('./pages/mediahub/MediaHubPage'));
const MusicPage         = lazy(() => import('./pages/music/MusicPage'));
const VideoCallsPage    = lazy(() => import('./pages/videocalls/VideoCallsPage'));
const ARVRPage          = lazy(() => import('./pages/arvr/ARVRPage'));
const SavedPage         = lazy(() => import('./pages/saved/SavedPage'));
const SearchPage        = lazy(() => import('./pages/search/SearchPage'));
const SettingsPage      = lazy(() => import('./pages/settings/SettingsPage'));
const BusinessPage      = lazy(() => import('./pages/business/BusinessPage'));
const CreatorPage       = lazy(() => import('./pages/creator/CreatorPage'));
const HelpPage          = lazy(() => import('./pages/help/HelpPage'));
const MenuPage          = lazy(() => import('./pages/menu/MenuPage'));
const PremiumPage       = lazy(() => import('./pages/premium/PremiumPage'));

function PageLoader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', padding:'40px', flexDirection:'column', gap:'16px' }}>
      <div style={{ width:'40px', height:'40px', borderRadius:'50%', border:'3px solid rgba(255,255,255,0.1)', borderTopColor:'#6366f1', animation:'spin 0.8s linear infinite' }} />
      <span style={{ color:'#94a3b8', fontSize:'14px' }}>Loading...</span>
    </div>
  );
}

// BUG-10 FIX: Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('[ErrorBoundary]', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', background:'#0a0a18', padding:'32px', textAlign:'center' }}>
          <div style={{ fontSize:64, marginBottom:16 }}>⚠️</div>
          <h2 style={{ color:'#f1f5f9', fontSize:22, fontWeight:800, marginBottom:8 }}>Something went wrong</h2>
          <p style={{ color:'#64748b', fontSize:14, marginBottom:24, maxWidth:300 }}>An unexpected error occurred. Please try returning to the home screen.</p>
          <button onClick={() => { this.setState({ hasError:false, error:null }); window.location.href='/feed'; }}
            style={{ background:'linear-gradient(135deg,#6366f1,#ec4899)', border:'none', borderRadius:14, padding:'12px 28px', color:'white', fontSize:15, fontWeight:700, cursor:'pointer' }}>
            🏠 Return to Home
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre style={{ marginTop:24, color:'#ef4444', fontSize:11, textAlign:'left', maxWidth:'90vw', overflowX:'auto', background:'rgba(239,68,68,0.08)', padding:12, borderRadius:8 }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* POLISH-15: Onboarding — public but only reachable after sign-up */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Protected */}
          <Route path="/" element={<PrivateRoute><AppShell /></PrivateRoute>}>
            <Route index element={<Navigate to="/feed" replace />} />
            <Route path="feed"          element={<FeedPage />} />
            <Route path="stories"       element={<StoriesPage />} />
            <Route path="live"              element={<LivePage />} />
            {/* LIVE-BUG-01-10 FIXES: new live sub-routes */}
            <Route path="live/setup"        element={<LiveSetupPage />} />
            <Route path="live/watch/:streamId" element={<LiveWatchPage />} />
            <Route path="live/monetization" element={<LiveMonetizationPage />} />
            <Route path="live/moderation"   element={<LiveModerationPage />} />
            <Route path="live/schedule"     element={<LiveSchedulePage />} />
            <Route path="live/analytics"    element={<LiveAnalyticsPage />} />
            {/* BUG-04 FIX: /live/notifications — bell icon destination */}
            <Route path="live/notifications" element={<LiveNotificationsPage />} />
            {/* BUG-05 FIX: /clips/:clipId — trending clips destination */}
            <Route path="clips/:clipId"      element={<ClipViewerPage />} />
            {/* REC-6.10: /live/vod/:id — VOD replay */}
            <Route path="live/vod/:id"       element={<LiveVODPage />} />
            {/* POLISH-18 FIX: /trending redirects to feed with filter param — no duplicate page */}
            <Route path="trending"      element={<Navigate to="/feed?filter=trending" replace />} />
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
            <Route path="marketplace"              element={<MarketplacePage />} />
            <Route path="marketplace/seller/:name" element={<SellerProfilePage />} />
            <Route path="admin/kyc"                element={<AdminGuard><KYCAdminPage /></AdminGuard>} />
            <Route path="admin/reports"            element={<AdminGuard><ReportsAdminPage /></AdminGuard>} />
            <Route path="media"         element={<MediaHubPage />} />
            <Route path="music"         element={<MusicPage />} />
            <Route path="videocalls"    element={<VideoCallsPage />} />
            <Route path="livestream"    element={<LivePage />} />
            <Route path="arvr"          element={<ARVRPage />} />
            <Route path="saved"         element={<SavedPage />} />
            <Route path="search"        element={<SearchPage />} />
            <Route path="settings"      element={<SettingsPage />} />
            <Route path="business"      element={<BusinessPage />} />
            <Route path="creator"       element={<CreatorPage />} />
            <Route path="help"          element={<HelpPage />} />
            <Route path="menu"          element={<MenuPage />} />
            <Route path="premium"       element={<PremiumPage />} />

            {/* ── NEW DASHBOARD ROUTES ── */}
            {/* Post Detail */}
            <Route path="post/:id"              element={<PostDetailPage />} />
            {/* Hashtag feed */}
            <Route path="hashtag/:tag"          element={<HashtagPage />} />
            {/* Profile followers/following */}
            <Route path="profile/:uid/followers"  element={<FollowersPage />} />
            <Route path="profile/:uid/following"  element={<FollowersPage />} />
            {/* Dating matches */}
            <Route path="dating/matches"        element={<DatingMatchesPage />} />
            {/* New message compose */}
            <Route path="messages/new"          element={<NewMessagePage />} />
            {/* Group detail */}
            <Route path="groups/:id"            element={<GroupDetailPage />} />
            {/* Event detail */}
            <Route path="events/:id"            element={<EventDetailPage />} />
            {/* Marketplace detail pages */}
            <Route path="marketplace/product/:id"     element={<ProductDetailPage />} />
            <Route path="marketplace/orders"          element={<MyOrdersPage />} />
            <Route path="marketplace/seller/dashboard" element={<SellerDashboardPage />} />
            {/* Admin home dashboard */}
            <Route path="admin"                 element={<AdminGuard><AdminDashboardPage /></AdminGuard>} />
            {/* Settings sub-pages */}
            <Route path="settings/privacy"      element={<PrivacySettingsPage />} />
            <Route path="settings/security"     element={<SecuritySettingsPage />} />
            <Route path="settings/notifications" element={<NotificationPreferencesPage />} />
            <Route path="settings/blocked"      element={<BlockedUsersPage />} />
            <Route path="settings/data"         element={<DataSettingsPage />} />
            <Route path="settings/linked-accounts" element={<LinkedAccountsPage />} />
            <Route path="settings/locale"       element={<LocaleSettingsPage />} />
            <Route path="settings/payments"     element={<PaymentMethodsPage />} />
            {/* Creator sub-pages */}
            <Route path="creator/analytics"     element={<CreatorAnalyticsPage />} />
            <Route path="creator/monetization"  element={<CreatorMonetizationPage />} />
            {/* Business analytics */}
            <Route path="business/analytics"    element={<BusinessAnalyticsPage />} />
            {/* Gaming sub-pages */}
            <Route path="gaming/library"        element={<GamingLibraryPage />} />
            <Route path="gaming/leaderboard"    element={<GamingLeaderboardPage />} />
            {/* Music artist */}
            <Route path="music/artist/:id"      element={<MusicArtistPage />} />
            {/* Saved collections */}
            <Route path="saved/collections"     element={<SavedCollectionsPage />} />
            {/* Media video player */}
            <Route path="video/:id"             element={<VideoPlayerPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
