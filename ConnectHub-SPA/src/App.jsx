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

// Auth Pages — Section 1 full implementation
import LoginPage           from './pages/auth/LoginPage';
import VerifyEmailPage     from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage  from './pages/auth/ForgotPasswordPage';
import AccountRecoveryPage from './pages/auth/AccountRecoveryPage';

// ── SECTION-6: Messages new pages (May 2026)
const MessageRequestsPage      = lazy(() => import('./pages/messages/MessageRequestsPage'));
const ArchivedConversationsPage = lazy(() => import('./pages/messages/ArchivedConversationsPage'));
const GroupChatCreatePage      = lazy(() => import('./pages/messages/GroupChatCreatePage'));

// ── SECTION-7: Notifications new pages (May 2026)
const ActivitySummaryPage         = lazy(() => import('./pages/notifications/ActivitySummaryPage'));
const NotificationQuietHoursPage  = lazy(() => import('./pages/notifications/NotificationQuietHoursPage'));

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

// ── Feed sub-pages (May 2026) + Section-2 new pages (May 2026)
const CommentThreadPage    = lazy(() => import('./pages/feed/FeedSubPages').then(m => ({ default: m.CommentThreadPage })));
const TrendingDashPage     = lazy(() => import('./pages/feed/FeedSubPages').then(m => ({ default: m.TrendingDashboardPage })));
const CreatePostPage       = lazy(() => import('./pages/feed/FeedSubPages').then(m => ({ default: m.CreatePostPage })));
const PostEditPage         = lazy(() => import('./pages/feed/FeedSubPages').then(m => ({ default: m.PostEditPage })));
const RepostWithCommentPage = lazy(() => import('./pages/feed/FeedSubPages').then(m => ({ default: m.RepostWithCommentPage })));
const ShareSheetPage       = lazy(() => import('./pages/feed/FeedSubPages').then(m => ({ default: m.ShareSheetPage })));
// ROUTE-01: Ads info page — fixes dead "Learn more" link (Sprint 2)
const AdsInfoPage          = lazy(() => import('./pages/feed/FeedSubPages').then(m => ({ default: m.AdsInfoPage })));

// ── Dating sub-pages (May 2026)
const DatingBoostPage      = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.DatingBoostPage })));
const DatingCompatPage     = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.DatingCompatPage })));
const DatingSettingsPage   = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.DatingSettingsPage })));

// ── SECTION 5: New Dating Pages (May 2026)
const DatingProfileEditPage    = lazy(() => import('./pages/dating/DatingProfileEditPage'));
const DatingProfileViewPage    = lazy(() => import('./pages/dating/DatingProfileViewPage'));
const SafetyCenterPage         = lazy(() => import('./pages/dating/SafetyCenterPage'));
const SpeedDatingPage          = lazy(() => import('./pages/dating/SpeedDatingPage'));
const DatingPreferencesDeepPage = lazy(() => import('./pages/dating/DatingPreferencesDeepPage'));

// ── Group sub-pages (May 2026)
const GroupCreatePage      = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.GroupCreatePage })));
const GroupMembersPage     = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.GroupMembersPage })));
const GroupSettingsPage    = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.GroupSettingsPage })));

// ── Event sub-pages (May 2026)
const EventCreatePage      = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.EventCreatePage })));
const EventAttendeesPage   = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.EventAttendeesPage })));
const MyEventsPage         = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.MyEventsPage })));

// ── SECTION-8: Profile new pages (May 2026)
const ProfileEditPage          = lazy(() => import('./pages/profile/ProfileEditPage'));
const ProfileInsightsPage      = lazy(() => import('./pages/profile/ProfileInsightsPage'));
const ProfileVerifyRequestPage = lazy(() => import('./pages/profile/ProfileVerifyRequestPage'));

// ── Music sub-pages (May 2026)
const AlbumDetailPage      = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.AlbumDetailPage })));
const PlaylistPage         = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.PlaylistPage })));
const PlaylistCreatePage   = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.PlaylistCreatePage })));

// ── Media sub-pages (May 2026)
const PhotoGalleryPage     = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.PhotoGalleryPage })));
const MediaUploadPage      = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.MediaUploadPage })));
const MediaLibraryPage     = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.MediaLibraryPage })));

// ── Gaming sub-pages (May 2026)
const GameDetailPage       = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.GameDetailPage })));
const TournamentPage       = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.TournamentPage })));

// ── Video Call sub-pages (May 2026)
const CallSetupPage        = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.CallSetupPage })));
const ActiveCallPage       = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.ActiveCallPage })));

// ── AR/VR sub-pages (May 2026)
const ARFilterPreviewPage  = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.ARFilterPreviewPage })));
const VRViewerPage         = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.VRViewerPage })));

// ── Premium sub-pages (May 2026)
const PremiumCheckoutPage  = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.PremiumCheckoutPage })));
const SubscriptionManagePage = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.SubscriptionManagePage })));

// ── Help sub-pages (May 2026)
const SupportTicketPage    = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.SupportTicketPage })));

// ── Saved sub-pages (May 2026)
const CollectionPage       = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.CollectionPage })));
const CollectionCreatePage = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.CollectionCreatePage })));

// ── Marketplace extras (May 2026)
const CartPage             = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.CartPage })));
const ListingBoostPage     = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.ListingBoostPage })));

// ── Friends extras (May 2026)
const ContactImportPage    = lazy(() => import('./pages/misc/RemainingDashboards').then(m => ({ default: m.ContactImportPage })));

// Onboarding (POLISH-15)
const OnboardingPage = lazy(() => import('./pages/onboarding/OnboardingPage'));

// Main App Pages (lazy loaded)
const FeedPage          = lazy(() => import('./pages/feed/FeedPage'));
const StoriesPage       = lazy(() => import('./pages/stories/StoriesPage'));
// ── SECTION-3: Story sub-pages ──────────────────────────────────────────────
const StoryCreatePage     = lazy(() => import('./pages/stories/StoryCreatePage'));
// ── SECTION-4B: Live Q&A + Gifts Leaderboard ────────────────────────────────
const LiveQAPage              = lazy(() => import('./pages/live/LiveQAPage'));
const LiveGiftsLeaderboardPage = lazy(() => import('./pages/live/LiveGiftsLeaderboardPage'));
const StoryAnalyticsPage  = lazy(() => import('./pages/stories/StoryAnalyticsPage'));
const StoryHighlightsPage = lazy(() => import('./pages/stories/StoryHighlightsPage'));
const StoryArchivePage    = lazy(() => import('./pages/stories/StoryArchivePage'));
const LivePage          = lazy(() => import('./pages/live/LivePage'));

// Live sub-pages (LIVE-BUG-01 through LIVE-BUG-10 fixes)
const LiveSetupPage          = lazy(() => import('./pages/live/LiveSetupPage'));
const LiveWatchPage          = lazy(() => import('./pages/live/LiveWatchPage'));
const LiveMonetizationPage   = lazy(() => import('./pages/live/LiveMonetizationPage'));
const LiveModerationPage     = lazy(() => import('./pages/live/LiveModerationPage'));
const LiveSchedulePage       = lazy(() => import('./pages/live/LiveSchedulePage'));
const LiveAnalyticsPage      = lazy(() => import('./pages/live/LiveAnalyticsPage'));
// SECTION-4 NEW: Three missing dashboard pages
const LiveCohostPage         = lazy(() => import('./pages/live/LiveCohostPage'));
const LiveClipsPage          = lazy(() => import('./pages/live/LiveClipsPage'));
const LiveCategoriesPage     = lazy(() => import('./pages/live/LiveCategoriesPage'));
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
          {/* Public auth routes — Section 1 */}
          <Route path="/login"            element={<LoginPage />} />
          <Route path="/verify-email"     element={<VerifyEmailPage />} />
          <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
          <Route path="/account-recovery" element={<AccountRecoveryPage />} />

          {/* Onboarding — public but only reachable after sign-up */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Protected */}
          <Route path="/" element={<PrivateRoute><AppShell /></PrivateRoute>}>
            <Route index element={<Navigate to="/feed" replace />} />
            <Route path="feed"          element={<FeedPage />} />
            <Route path="stories"           element={<StoriesPage />} />
            {/* SECTION-3: Story sub-pages */}
            <Route path="stories/create"    element={<StoryCreatePage />} />
            <Route path="stories/analytics" element={<StoryAnalyticsPage />} />
            <Route path="stories/highlights" element={<StoryHighlightsPage />} />
            <Route path="stories/archive"   element={<StoryArchivePage />} />
            <Route path="live"              element={<LivePage />} />
            {/* LIVE-BUG-01-10 FIXES: new live sub-routes */}
            <Route path="live/setup"        element={<LiveSetupPage />} />
            <Route path="live/watch/:streamId" element={<LiveWatchPage />} />
            <Route path="live/monetization" element={<LiveMonetizationPage />} />
            <Route path="live/moderation"   element={<LiveModerationPage />} />
            <Route path="live/schedule"     element={<LiveSchedulePage />} />
            <Route path="live/analytics"    element={<LiveAnalyticsPage />} />
            {/* SECTION-4 NEW: Co-host, clips manager, categories browser */}
            <Route path="live/cohost"       element={<LiveCohostPage />} />
            <Route path="live/clips"        element={<LiveClipsPage />} />
            <Route path="live/categories"   element={<LiveCategoriesPage />} />
            {/* BUG-04 FIX: /live/notifications — bell icon destination */}
            <Route path="live/notifications" element={<LiveNotificationsPage />} />
            {/* BUG-05 FIX: /clips/:clipId — trending clips destination */}
            <Route path="clips/:clipId"      element={<ClipViewerPage />} />
            {/* REC-6.10: /live/vod/:id — VOD replay */}
            <Route path="live/vod/:id"       element={<LiveVODPage />} />
            {/* SECTION-4B: Q&A session + Gifts leaderboard */}
            <Route path="live/qa/:streamId"     element={<LiveQAPage />} />
            <Route path="live/gifts/:streamId"  element={<LiveGiftsLeaderboardPage />} />
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

            {/* ── NEW REMAINING DASHBOARD ROUTES (May 2026) ── */}
            {/* Feed — Section 2 (May 2026) */}
            <Route path="post/create"           element={<CreatePostPage />} />
            <Route path="post/:id/comments"     element={<CommentThreadPage />} />
            <Route path="post/:id/edit"         element={<PostEditPage />} />
            <Route path="post/:id/repost"       element={<RepostWithCommentPage />} />
            <Route path="post/:id/share"        element={<ShareSheetPage />} />
            <Route path="trending/dashboard"    element={<TrendingDashPage />} />
            {/* ROUTE-01: /ads/info — About Ads info page (Sprint 2) */}
            <Route path="ads/info"              element={<AdsInfoPage />} />

            {/* Dating */}
            <Route path="dating/boost"          element={<DatingBoostPage />} />
            <Route path="dating/compat/:uid"    element={<DatingCompatPage />} />
            <Route path="dating/settings"       element={<DatingSettingsPage />} />
            {/* SECTION 5 NEW — May 2026 */}
            <Route path="dating/profile/edit"   element={<DatingProfileEditPage />} />
            <Route path="dating/profile/:uid"   element={<DatingProfileViewPage />} />
            <Route path="dating/safety"         element={<SafetyCenterPage />} />
            <Route path="dating/speed"          element={<SpeedDatingPage />} />
            <Route path="dating/preferences"    element={<DatingPreferencesDeepPage />} />

            {/* Groups */}
            <Route path="groups/create"         element={<GroupCreatePage />} />
            <Route path="groups/:id/members"    element={<GroupMembersPage />} />
            <Route path="groups/:id/settings"   element={<GroupSettingsPage />} />

            {/* Events */}
            <Route path="events/create"         element={<EventCreatePage />} />
            <Route path="events/:id/attendees"  element={<EventAttendeesPage />} />
            <Route path="events/mine"           element={<MyEventsPage />} />

            {/* Profile — SECTION-8 (May 2026) */}
            <Route path="profile/edit"          element={<ProfileEditPage />} />
            <Route path="profile/insights"      element={<ProfileInsightsPage />} />
            <Route path="profile/verify-request" element={<ProfileVerifyRequestPage />} />

            {/* Music */}
            <Route path="music/album/:id"       element={<AlbumDetailPage />} />
            <Route path="music/playlist/:id"    element={<PlaylistPage />} />
            <Route path="music/playlist/create" element={<PlaylistCreatePage />} />

            {/* Media Hub */}
            <Route path="media/photos"          element={<PhotoGalleryPage />} />
            <Route path="media/upload"          element={<MediaUploadPage />} />
            <Route path="media/library"         element={<MediaLibraryPage />} />

            {/* Gaming */}
            <Route path="gaming/game/:id"       element={<GameDetailPage />} />
            <Route path="gaming/tournament"     element={<TournamentPage />} />

            {/* Video Calls */}
            <Route path="videocalls/new"        element={<CallSetupPage />} />
            <Route path="videocalls/call/:id"   element={<ActiveCallPage />} />

            {/* AR/VR */}
            <Route path="arvr/filter/:id"       element={<ARFilterPreviewPage />} />
            <Route path="arvr/vr/:id"           element={<VRViewerPage />} />

            {/* Premium */}
            <Route path="premium/checkout"      element={<PremiumCheckoutPage />} />
            <Route path="premium/manage"        element={<SubscriptionManagePage />} />

            {/* Help */}
            <Route path="help/ticket"           element={<SupportTicketPage />} />

            {/* Saved */}
            <Route path="saved/collection/:id"  element={<CollectionPage />} />
            <Route path="saved/collection/new"  element={<CollectionCreatePage />} />

            {/* Marketplace */}
            <Route path="cart"                        element={<CartPage />} />
            <Route path="marketplace/boost/:id"       element={<ListingBoostPage />} />

            {/* Friends */}
            <Route path="friends/find"          element={<ContactImportPage />} />

            {/* ── SECTION-6: Messages new pages (May 2026) ── */}
            <Route path="messages/requests"     element={<MessageRequestsPage />} />
            <Route path="messages/archived"     element={<ArchivedConversationsPage />} />
            <Route path="messages/group/create" element={<GroupChatCreatePage />} />

            {/* ── SECTION-7: Notifications new pages (May 2026) ── */}
            {/* FIX-N01/N02/N03/N04/N05 applied to NotificationsPage */}
            {/* Activity summary dashboard for weekly engagement digest */}
            <Route path="notifications/activity-summary" element={<ActivitySummaryPage />} />
            {/* Quiet hours setting — mute non-urgent notifications by schedule */}
            <Route path="settings/notifications/quiet-hours" element={<NotificationQuietHoursPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
