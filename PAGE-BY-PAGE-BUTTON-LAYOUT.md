# ConnectHub_Mobile_Design.html — Page-by-Page Button & Feature Map
**Generated:** 5/5/2026
**Total onclick handlers found:** 1188

---

## 📄 LOGIN SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 120 | Sign In | `switchLoginTab(` |
| 121 | Sign Up | `switchLoginTab(` |
| 137 | 👁️ | `togglePasswordVisibility(` |
| 142 | Remember me | `toggleCheckboxLogin(` |
| 146 | Forgot password? | `handleForgotPassword()` |
| 152 | Sign In | `handleLogin()` |
| 190 | 👁️ | `togglePasswordVisibility(` |
| 204 | Enable Dating Features | `toggleCheckboxLogin(` |
| 212 | Create Account | `handleRegister()` |
| 223 | G | `socialLogin(` |
| 224 | f | `socialLogin(` |
| 225 | 🍎 | `socialLogin(` |
| 231 | Sign up | `switchLoginTab(` |
| 251 | 👤 | `authOnboarding.showLoginScreen()` |
| 252 | ➕ | `openModal(` |
| 253 | 🔍 | `openModal(` |
| 254 | 🔔 | `openScreen(` |
| 263 | ☰ | `openScreen(` |
| 269 | Feed | `switchPillTab(this, ` |
| 270 | Stories | `switchPillTab(this, ` |
| 271 | Trending | `switchPillTab(this, ` |
| 272 | Groups | `switchPillTab(this, ` |
| 273 | Live | `switchPillTab(this, ` |
| 274 | 🎵 Music | `switchPillTab(this, ` |
| 275 | 🛍️ Marketplace | `switchPillTab(this, ` |

**Total buttons: 25**

---

## 📄 FEED-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 284 | 👤 | `openModal(` |
| 290 | 📷 Photo | `event.stopPropagation(); openModal(` |
| 293 | 🎥 Video | `event.stopPropagation(); openModal(` |
| 296 | 😊 Feeling | `event.stopPropagation(); openModal(` |
| 310 | ⋯ | `openModal(` |
| 317 | 👍 Like | `toggleLikePost(this)` |
| 320 | 💬 Comment | `openModal(` |
| 323 | 🔄 Share | `sharePost()` |
| 336 | ⋯ | `openModal(` |
| 343 | 👍 Like | `toggleLikePost(this)` |
| 346 | 💬 Comment | `openModal(` |
| 349 | 🔄 Share | `sharePost()` |

**Total buttons: 12**

---

## 📄 STORIES-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 358 | &#8592; Back | `goHome()` |
| 365 | ➕ | `openModal(` |
| 374 | 👤 | `openModal(` |
| 383 | 😊 | `openModal(` |
| 392 | 🎨 | `openModal(` |
| 401 | 🚀 | `openModal(` |
| 410 | 🎭 | `openModal(` |

**Total buttons: 7**

---

## 📄 LIVE-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 424 | &#8592; Back | `goHome()` |
| 427 | Settings | `openModal(` |
| 431 | 🎥 | `openModal(` |
| 445 | 👤 | `openModal(` |
| 462 | 🔖 | `openModal(` |

**Total buttons: 5**

---

## 📄 TRENDING-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 474 | &#8592; Back | `goHome()` |
| 479 | #1 TRENDING | `openModal(` |
| 484 | 👍 Like | `event.stopPropagation(); toggleLikePost(this)` |
| 487 | 💬 Comment | `event.stopPropagation(); openModal(` |
| 490 | 🔄 Share | `event.stopPropagation(); sharePost()` |
| 496 | #2 TRENDING | `openModal(` |
| 501 | 👍 Like | `event.stopPropagation(); toggleLikePost(this)` |
| 504 | 💬 Comment | `event.stopPropagation(); openModal(` |
| 507 | 🔄 Share | `event.stopPropagation(); sharePost()` |
| 513 | #3 TRENDING | `openModal(` |
| 518 | 👍 Like | `event.stopPropagation(); toggleLikePost(this)` |
| 521 | 💬 Comment | `event.stopPropagation(); openModal(` |
| 524 | 🔄 Share | `event.stopPropagation(); sharePost()` |

**Total buttons: 13**

---

## 📄 GROUPS-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 533 | &#8592; Back | `goHome()` |
| 536 | + New | `openModal(` |
| 539 | 💻 | `openModal(` |
| 552 | 🎨 | `openModal(` |
| 565 | 📚 | `openModal(` |

**Total buttons: 5**

---

## 📄 FRIENDS-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 596 | &#8592; Back | `goHome()` |
| 600 | ✏️ | `showToast(` |
| 605 | See All (234) | `openModal(` |
| 615 | Message | `sendMessage()` |
| 626 | Message | `sendMessage()` |
| 641 | Add Friend | `addFriend(this)` |
| 642 | ✕ | `removeSuggestion(this)` |
| 653 | Add Friend | `addFriend(this)` |
| 654 | ✕ | `removeSuggestion(this)` |

**Total buttons: 9**

---

## 📄 DATING-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 661 | &#8592; Back | `goHome()` |
| 664 | Settings | `openModal(` |
| 671 | ✏️ Edit | `openModal(` |
| 698 | ⚙️ Preferences | `openModal(` |
| 699 | 🎯 Goals | `openModal(` |
| 700 | 🎨 Interests | `openModal(` |
| 701 | 📸 Verify | `openModal(` |
| 716 | ✕ | `passDatingProfile()` |
| 717 | ⭐ | `superLike()` |
| 718 | 💚 | `likeDatingProfile()` |
| 728 | 12 | `openModal(` |
| 732 | 45 | `openModal(` |
| 736 | 3 | `openModal(` |
| 740 | 23 | `openModal(` |

**Total buttons: 14**

---

## 📄 PROFILE-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 749 | &#8592; Back | `goHome()` |
| 755 | 234 | `openModal(` |
| 759 | 1.2K | `openModal(` |
| 763 | 456 | `openModal(` |
| 769 | Edit Profile | `openModal(` |
| 770 | Share Profile | `shareProfile()` |
| 774 | Recent Posts | `openModal(` |
| 776 | See All | `event.stopPropagation(); openModal(` |
| 779 | Great day at the beach! 🏖️ | `openModal(` |

**Total buttons: 9**

---

## 📄 SAVED-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 788 | &#8592; Back | `goHome()` |
| 791 | + Collection | `openModal(` |
| 798 | 📸 | `openModal(` |
| 806 | 🍳 | `openModal(` |

**Total buttons: 4**

---

## 📄 EVENTS-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 827 | &#8592; Back | `goHome()` |
| 830 | + Create | `eventsSystem.openCreateEventModal()` |
| 835 | 5 | `filterEventsByStatus(` |
| 839 | 2 | `filterEventsByStatus(` |
| 843 | 8 | `filterEventsByStatus(` |
| 847 | 📅 | `eventsSystem.openEventCalendar()` |
| 855 | ➕ Create Event | `eventsSystem.openCreateEventModal()` |
| 856 | 🔍 Search Events | `eventsSystem.searchEvents(` |
| 861 | See All | `viewAllUpcomingEvents()` |
| 864 | (no label) | `eventsSystem.openEventDetails(1)` |
| 880 | ✓ Going | `event.stopPropagation(); eventsSystem.rsvpEvent(1, ` |
| 881 | ⭐ Interested | `event.stopPropagation(); eventsSystem.rsvpEvent(1, ` |
| 882 | 🔗 Share | `event.stopPropagation(); eventsSystem.shareEventWithTrack...` |
| 886 | (no label) | `eventsSystem.openEventDetails(2)` |
| 902 | ✓ Going | `event.stopPropagation(); eventsSystem.rsvpEvent(2, ` |
| 903 | ⭐ Interested | `event.stopPropagation(); eventsSystem.rsvpEvent(2, ` |
| 904 | 👥 Guests | `event.stopPropagation(); eventsSystem.manageGuestList(2)` |
| 910 | Manage | `viewMyHostedEvents()` |
| 913 | (no label) | `eventsSystem.openEventDetails(2)` |
| 929 | 👥 Attendees | `event.stopPropagation(); eventsSystem.manageGuestList(2)` |
| 930 | 💬 Chat | `event.stopPropagation(); eventsSystem.openEventChat(2)` |
| 931 | 📊 Stats | `event.stopPropagation(); eventsSystem.showEventAnalytics(2)` |
| 937 | See All | `viewPastEvents()` |
| 940 | (no label) | `viewPastEventDetails(` |
| 952 | 📸 Photos | `event.stopPropagation(); eventsSystem.openEventAlbum(3)` |
| 953 | 💭 Memories | `event.stopPropagation(); showToast(` |

**Total buttons: 26**

---

## 📄 GAMING-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 960 | &#8592; Back | `goHome()` |
| 963 | 🔔 Notifications | `openModal(` |
| 989 | View All | `openModal(` |
| 992 | 🟦 | `gamingSystem.playGame(` |
| 1000 | 🍬 | `gamingSystem.playGame(` |
| 1008 | 🃏 | `gamingSystem.playGame(` |
| 1016 | 🧩 | `gamingSystem.playGame(` |
| 1026 | View All | `openModal(` |
| 1029 | 🥇 | `openModal(` |
| 1037 | 🥈 | `openModal(` |

**Total buttons: 10**

---

## 📄 MEDIA-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 1062 | &#8592; Back | `goHome()` |
| 1065 | Settings | `openModal(` |
| 1070 | 🎵 | `openScreen(` |
| 1075 | 🔴 | `openScreen(` |
| 1080 | 📹 | `openScreen(` |
| 1085 | 🥽 | `openScreen(` |
| 1097 | 📷 AR Camera | `window.arVR.openARCamera()` |
| 1098 | 🔴 Go Live | `window.liveStreaming.startStream()` |
| 1099 | 🎵 Music Library | `window.musicPlayer.openMusicLibrary()` |
| 1100 | 📹 Video Call | `window.videoCalls.startVideoCall(` |

**Total buttons: 10**

---

## 📄 MUSIC PLAYER-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 1106 | &#8592; Back | `goHome()` |
| 1109 | ← Back | `openScreen(` |
| 1122 | 🔀 | `window.musicPlayer.toggleShuffle()` |
| 1123 | ⏮️ | `window.musicPlayer.playPreviousTrack()` |
| 1124 | ▶️ | `window.musicPlayer.togglePlayPause()` |
| 1125 | ⏭️ | `window.musicPlayer.playNextTrack()` |
| 1126 | 🔁 | `window.musicPlayer.cycleRepeatMode()` |
| 1140 | Search | `openSearchMusicModal()` |
| 1143 | 🌟 | `window.musicPlayer.playMusic(1)` |
| 1149 | 🤍 | `event.stopPropagation(); toggleMusicHeart(1)` |
| 1152 | ⚡ | `window.musicPlayer.playMusic(2)` |
| 1158 | 🤍 | `event.stopPropagation(); toggleMusicHeart(2)` |
| 1161 | 🌊 | `window.musicPlayer.playMusic(3)` |
| 1167 | 🤍 | `event.stopPropagation(); toggleMusicHeart(3)` |
| 1175 | 📋 Queue | `openMusicQueueModal()` |
| 1176 | ➕ Playlist | `openCreateMusicPlaylistModal()` |
| 1177 | 📝 Lyrics | `openMusicLyricsModal()` |
| 1178 | 🔗 Share | `openMusicShareModal()` |
| 1179 | ⬇️ Download | `openMusicDownloadModal()` |
| 1180 | ⚙️ Quality | `openAudioQualityModal()` |

**Total buttons: 20**

---

## 📄 LIVE STREAMING-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 1186 | &#8592; Back | `goHome()` |
| 1189 | ← Back | `openScreen(` |
| 1195 | 🔴 Start New Stream | `openModal(` |
| 1198 | 📷 Camera | `window.liveStreaming.requestCameraAccess()` |
| 1199 | 🎤 Microphone | `window.liveStreaming.requestMicrophoneAccess()` |
| 1200 | 👁️ Preview | `window.liveStreaming.showStreamPreview()` |
| 1201 | ⚙️ Quality | `openModal(` |
| 1209 | 🔴 | `openModal(` |
| 1215 | (no label) | `event.stopPropagation(); window.liveStreaming.toggleStrea...` |
| 1220 | 💰 | `openModal(` |
| 1229 | 🛡️ | `openModal(` |
| 1238 | 📊 | `window.liveStreaming.viewStreamAnalytics()` |
| 1247 | 📅 | `openModal(` |
| 1256 | 🌐 | `openModal(` |

**Total buttons: 14**

---

## 📄 VIDEO CALLS-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 1268 | &#8592; Back | `goHome()` |
| 1271 | ← Back | `openScreen(` |
| 1276 | 📹 Start Video Call | `openModal(` |
| 1277 | 📞 Start Voice Call | `openModal(` |
| 1285 | 🖥️ Screen Share | `window.videoCalls.toggleScreenShare()` |
| 1286 | 🔴 Recording | `window.videoCalls.toggleCallRecording()` |
| 1287 | 👥 Add People | `openModal(` |
| 1288 | 🎨 Background | `openModal(` |
| 1289 | 📋 History | `window.videoCalls.viewCallHistory()` |
| 1290 | 📅 Schedule | `openModal(` |
| 1291 | ⚙️ Devices | `openModal(` |
| 1292 | 🎧 Audio | `openModal(` |
| 1293 | 📊 Quality | `openModal(` |
| 1294 | 📹 Recordings | `openModal(` |
| 1295 | 🚪 Waiting Room | `openModal(` |
| 1296 | 📆 Scheduled | `openModal(` |
| 1297 | 👥 Group Calls | `openModal(` |
| 1298 | 📈 Analytics | `openModal(` |
| 1299 | 🔧 Settings | `openModal(` |
| 1300 | 📡 Network | `openModal(` |
| 1307 | 📹 | `openModal(` |
| 1316 | 📞 | `openModal(` |

**Total buttons: 22**

---

## 📄 AR V R-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 1328 | &#8592; Back | `goHome()` |
| 1331 | ← Back | `openScreen(` |
| 1337 | Open AR Camera | `window.arVR.openARCamera()` |
| 1348 | 🐶 | `window.arVR.applyFaceFilter(` |
| 1352 | ✨ | `window.arVR.applyFaceFilter(` |
| 1356 | 👑 | `window.arVR.applyFaceFilter(` |
| 1360 | 🌈 | `window.arVR.applyFaceFilter(` |
| 1364 | 😎 | `window.arVR.applyFaceFilter(` |
| 1368 | 😍 | `window.arVR.applyFaceFilter(` |
| 1378 | 🏖️ | `window.arVR.enterVirtualRoom(` |
| 1387 | 🚀 | `window.arVR.enterVirtualRoom(` |
| 1396 | ⛰️ | `window.arVR.enterVirtualRoom(` |
| 1405 | 🌊 | `window.arVR.enterVirtualRoom(` |
| 1419 | 🎬 360° Videos | `open360VideoLibrary()` |
| 1420 | 🛍️ Virtual Shop | `openARShoppingDashboard()` |
| 1421 | 🎮 AR Games | `openARGamesDashboard()` |
| 1422 | 🧘 VR Meditation | `openVRMeditationDashboard()` |
| 1423 | 🎨 Custom Filter | `openCustomFilterCreator()` |
| 1424 | 🥽 VR Headset | `openVRHeadsetManager()` |
| 1425 | 🎧 Spatial Audio | `openSpatialAudioConfig()` |
| 1426 | 👋 Hand Tracking | `openHandTrackingDashboard()` |

**Total buttons: 21**

---

## 📄 BUSINESS-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 1432 | &#8592; Back | `goHome()` |
| 1435 | Settings | `openModal(` |
| 1468 | ✏️ Edit | `openModal(` |
| 1469 | 📤 Share | `shareBusinessProfile()` |
| 1476 | Edit | `openModal(` |
| 1479 | 📅 | `openModal(` |
| 1487 | 📅 | `openModal(` |
| 1494 | 📅 | `openModal(` |
| 1506 | → | `openModal(` |
| 1513 | Edit | `openModal(` |
| 1516 | 📍 | `openModal(` |
| 1524 | 📞 | `callBusiness()` |
| 1532 | 📧 | `emailBusiness()` |
| 1540 | 🌐 | `visitWebsite()` |
| 1548 | 🔗 | `openModal(` |
| 1561 | Manage | `openModal(` |
| 1564 | 💻 | `openModal(` |
| 1570 | 📱 | `openModal(` |
| 1576 | ☁️ | `openModal(` |
| 1582 | 🎯 | `openModal(` |
| 1589 | View All Services | `openModal(` |
| 1594 | Manage | `openModal(` |
| 1597 | 👤 | `openModal(` |
| 1602 | 😊 | `openModal(` |
| 1607 | 🎨 | `openModal(` |
| 1612 | ➕ | `openModal(` |
| 1622 | Tools | `openModal(` |
| 1625 | 234 | `openModal(` |
| 1629 | 12 | `openModal(` |
| 1633 | 45 | `openModal(` |
| 1637 | 8 | `openModal(` |
| 1643 | 🔍 Find Businesses | `openModal(` |
| 1644 | 📄 Send Proposal | `openModal(` |
| 1645 | 📅 Schedule Meeting | `openModal(` |
| 1646 | 💬 Messenger | `openModal(` |
| 1654 | 🗺️ Directions | `openModal(` |
| 1655 | 📅 Book | `businessProfile.openBookingSystem()` |
| 1656 | 💰 Quote | `businessProfile.manageQuotes()` |
| 1657 | 📊 Analytics | `businessProfile.openAnalyticsDashboard()` |
| 1663 | View All | `viewAllBusinessTools()` |
| 1666 | 📊 Analytics | `businessTools.openAnalyticsDashboard()` |
| 1667 | 📢 Ad Manager | `businessTools.openAdManagement()` |
| 1668 | 👥 CRM | `businessTools.openCRM()` |
| 1669 | 📄 Invoices | `businessTools.manageInvoices()` |
| 1670 | 💳 Payments | `businessTools.setupPaymentProcessing()` |
| 1671 | 💡 Insights | `businessTools.showBusinessInsights()` |
| 1672 | 🔍 Competitors | `businessTools.analyzeCompetitors()` |
| 1673 | 🎯 Promotions | `businessTools.managePromotions()` |
| 1674 | 📦 Catalog | `businessTools.manageCatalog()` |
| 1675 | ⭐ Reviews | `businessTools.manageReviews()` |

**Total buttons: 50**

---

## 📄 CREATOR-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 1681 | &#8592; Back | `goHome()` |
| 1684 | Settings | `openModal(` |
| 1717 | ✏️ Edit | `openModal(` |
| 1718 | 📤 Share | `shareCreatorProfile()` |
| 1725 | Apply | `openModal(` |
| 1733 | ⭐ | `openModal(` |
| 1743 | 🎖️ | `openModal(` |
| 1753 | View All | `openModal(` |
| 1757 | 7 Days | `filterCreatorAnalytics(this, ` |
| 1758 | 30 Days | `filterCreatorAnalytics(this, ` |
| 1759 | 1 Year | `filterCreatorAnalytics(this, ` |
| 1788 | Manage | `openModal(` |
| 1790 | 💳 | `openModal(` |
| 1798 | 🎁 | `openModal(` |
| 1806 | 🤝 | `openModal(` |
| 1814 | 👕 | `openModal(` |
| 1826 | View Full | `openModal(` |
| 1830 | 🎥 | `openModal(` |
| 1836 | 🗑️ | `event.stopPropagation(); deleteScheduledPostMobile(1)` |
| 1838 | 📸 | `openModal(` |
| 1844 | 🗑️ | `event.stopPropagation(); deleteScheduledPostMobile(2)` |
| 1846 | + Schedule New Post | `openModal(` |
| 1852 | View All | `openModal(` |
| 1855 | 📸 | `openModal(` |
| 1856 | 🎥 | `openModal(` |
| 1857 | 📝 | `openModal(` |
| 1858 | 🎬 | `openModal(` |
| 1859 | 📱 | `openModal(` |
| 1860 | ➕ | `openModal(` |
| 1868 | 📅 Schedule | `openModal(` |
| 1869 | 💡 Ideas | `openModal(` |
| 1870 | 📊 Analytics | `openModal(` |
| 1871 | 💵 Payouts | `openModal(` |

**Total buttons: 33**

---

## 📄 PREMIUM-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 1877 | &#8592; Back | `goHome()` |
| 1880 | Settings | `openModal(` |
| 1915 | ⬆️ Upgrade | `openModal(` |
| 1916 | 📤 Share | `sharePremiumProfile()` |
| 1923 | View All | `openModal(` |
| 1926 | ☁️ | `openModal(` |
| 1931 | 🚫 | `openModal(` |
| 1936 | 🎖️ | `openModal(` |
| 1941 | 🎨 | `openModal(` |
| 1946 | 📊 | `openModal(` |
| 1951 | ⬇️ | `openModal(` |
| 1957 | View All 15+ Premium Features | `openModal(` |
| 1964 | History | `openModal(` |
| 1993 | 💬 Live Chat | `openModal(` |
| 1994 | 📞 Call Support | `openModal(` |
| 1995 | 📧 Email VIP | `openModal(` |
| 1996 | 🎫 New Ticket | `openModal(` |
| 2003 | Insights | `openModal(` |
| 2006 | 👁️ | `openModal(` |
| 2014 | 💾 | `openModal(` |
| 2022 | 📍 | `openModal(` |
| 2030 | 🚫 | `openModal(` |
| 2038 | 🕵️ | `openModal(` |
| 2044 | (no label) | `event.stopPropagation(); togglePremiumIncognito(this)` |
| 2048 | ✓ | `openModal(` |
| 2054 | (no label) | `event.stopPropagation(); toggleSwitch(this)` |
| 2058 | 👀 | `openModal(` |
| 2071 | Gallery | `openModal(` |
| 2075 | 🎨 | `openModal(` |
| 2087 | 🎖️ Badge Collection | `openModal(` |
| 2129 | 💬 VIP Chat | `openModal(` |
| 2130 | 🎨 Themes | `openModal(` |
| 2131 | 🎖️ Badges | `openModal(` |
| 2132 | 📊 Analytics | `openModal(` |

**Total buttons: 34**

---

## 📄 SETTINGS-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 2139 | &#8592; Back | `goHome()` |
| 2149 | 👤 | `openModal(` |
| 2158 | 🔒 | `showChangePasswordModal()` |
| 2167 | 📧 | `showChangeEmailModal()` |
| 2176 | 🛡️ | `showTwoFactorSetup()` |
| 2185 | 📱 | `showDeviceManagement()` |
| 2194 | 🔐 | `showSessionManagement()` |
| 2208 | 🔐 | `openModal(` |
| 2217 | 👁️ | `showPrivacyEnforcement()` |
| 2226 | 🚫 | `showBlockedUsers()` |
| 2240 | 💾 | `showDataExport()` |
| 2249 | ⏸️ | `showAccountDeactivation()` |
| 2258 | 🗑️ | `showAccountDeletion()` |
| 2272 | 🌍 | `showLanguageSettings()` |
| 2281 | 🕐 | `showTimezoneSettings()` |
| 2295 | 🔔 | `showNotificationSettings()` |
| 2309 | (no label) | `toggleSwitch(this)` |
| 2319 | (no label) | `toggleInAppNotifications(this)` |
| 2324 | 📧 | `openModal(` |
| 2338 | 📋 | `showLoginHistory()` |
| 2347 | ⚠️ | `showSecurityAlerts()` |
| 2361 | ℹ️ | `openModal(` |
| 2370 | 📄 | `openModal(` |

**Total buttons: 23**

---

## 📄 MESSAGES-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 2386 | &#8592; Back | `goHome()` |
| 2389 | + New | `openModal(` |
| 2398 | 👤 | `openModal(` |
| 2410 | 😊 | `openModal(` |
| 2421 | 🎨 | `openModal(` |

**Total buttons: 5**

---

## 📄 NOTIFICATIONS-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 2436 | &#8592; Back | `goHome()` |
| 2439 | Mark all as read | `markAllAsRead()` |
| 2442 | 👍 | `goToPost(this)` |
| 2452 | 💬 | `goToPost(this)` |
| 2462 | 👥 | `goToPost(this)` |
| 2472 | 📅 | `goToPost(this)` |
| 2482 | 🎮 | `goToPost(this)` |

**Total buttons: 7**

---

## 📄 HELP-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 2495 | &#8592; Back | `goHome()` |
| 2504 | 🔒 | `openModal(` |
| 2513 | 🔐 | `openModal(` |
| 2522 | 💬 | `openModal(` |
| 2535 | ⚠️ | `openModal(` |
| 2548 | 💬 | `openModal(` |
| 2557 | 📧 | `openModal(` |
| 2566 | 🤖 | `openModal(` |
| 2575 | 🌐 | `window.open(` |

**Total buttons: 9**

---

## 📄 MENU-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 2587 | &#8592; Back | `goHome()` |
| 2592 | 👤 | `openScreen(` |
| 2601 | 🔔 | `openScreen(` |
| 2610 | 📹 | `openScreen(` |
| 2619 | 🔴 | `switchPillTab(document.querySelector(` |
| 2628 | 🎮 | `openScreen(` |
| 2637 | 📅 | `openScreen(` |
| 2646 | 🔖 | `openScreen(` |
| 2655 | ⚙️ | `openScreen(` |
| 2664 | 🛍️ | `openScreen(` |
| 2673 | ✨ | `openScreen(` |
| 2682 | 🏢 | `openScreen(` |
| 2691 | 💡 | `openScreen(` |
| 2700 | Logout | `showToast(` |

**Total buttons: 14**

---

## 📄 MARKETPLACE-SCREEN

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 2709 | 🔔 | `marketplaceToggleNotifications()` |
| 2713 | 🛒 | `marketplaceOpenModal(` |
| 2717 | 📦 | `marketplaceOpenModal(` |

**Total buttons: 3**

---

## 📄 MARKETPLACE NOTIFICATIONS PANEL

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 2724 | ✓ | `marketplaceMarkAllRead()` |
| 2727 | 📦 | `marketplaceHandleNotification(` |
| 2732 | 💬 | `marketplaceHandleNotification(` |
| 2737 | 💰 | `marketplaceHandleNotification(` |
| 2753 | Browse | `marketplaceSwitchTab(` |
| 2754 | My Listings | `marketplaceSwitchTab(` |
| 2755 | Wishlist | `marketplaceSwitchTab(` |
| 2756 | Messages | `marketplaceSwitchTab(` |

**Total buttons: 8**

---

## 📄 MARKETPLACE-BROWSE-TAB

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 2766 | 📱 | `marketplaceFilterByCategory(` |
| 2770 | 👕 | `marketplaceFilterByCategory(` |
| 2774 | 🏠 | `marketplaceFilterByCategory(` |
| 2778 | 📚 | `marketplaceFilterByCategory(` |
| 2782 | ⚽ | `marketplaceFilterByCategory(` |
| 2786 | 🧸 | `marketplaceFilterByCategory(` |
| 2790 | 🎵 | `marketplaceFilterByCategory(` |
| 2794 | 📦 | `marketplaceFilterByCategory(` |

**Total buttons: 8**

---

## 📄 MARKETPLACE-SELLING-TAB

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 2829 | + New | `marketplaceOpenModal(` |

**Total buttons: 1**

---

## 📄 MARKETPLACE-MESSAGES-TAB

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 2853 | SM | `marketplaceOpenChat(` |
| 2862 | MJ | `marketplaceOpenChat(` |
| 2877 | 🏠 | `switchBottomTab(` |
| 2881 | 💕 | `switchBottomTab(` |
| 2885 | 💬 | `switchBottomTab(` |
| 2890 | 🎥 | `switchBottomTab(` |
| 2894 | 👥 | `switchBottomTab(` |
| 2908 | 🔔 | `handleInAppNotificationClick()` |
| 2914 | ✕ | `event.stopPropagation(); dismissInAppNotification()` |
| 2922 | ✕ | `closeModal(` |
| 2929 | ✕ | `clearSearch()` |
| 2935 | Clear | `clearRecentSearches()` |
| 2938 | 🔍 | `performSearch(` |
| 2943 | ✕ | `event.stopPropagation(); removeSearch(this)` |
| 2946 | 🔍 | `performSearch(` |
| 2951 | ✕ | `event.stopPropagation(); removeSearch(this)` |
| 2958 | 🔥 | `performSearch(` |
| 2967 | 🔥 | `performSearch(` |
| 2980 | 👥 | `closeModal(` |
| 2988 | 👥 | `closeModal(` |
| 2996 | 📅 | `closeModal(` |
| 3010 | 👤 | `closeModal(` |
| 3019 | 💻 | `closeModal(` |
| 3034 | ✕ | `closeModal(` |
| 3038 | 📝 | `openModal(` |
| 3047 | ⭐ | `openModal(` |
| 3056 | 🔴 | `openModal(` |
| 3065 | 📷 | `openModal(` |
| 3074 | 📅 | `openModal(` |
| 3083 | 👥 | `openModal(` |
| 3092 | 📊 | `openModal(` |
| 3101 | 💰 | `openModal(` |
| 3115 | ✕ | `closeModal(` |
| 3117 | Post | `submitActualPost()` |
| 3124 | 🌍 Public | `openModal(` |
| 3139 | ✕ | `removeSelectedPhoto()` |
| 3147 | ✕ | `removeSelectedVideo()` |
| 3156 | ✕ | `removeSelectedLocation()` |
| 3172 | 📷 Photo | `document.getElementById(` |
| 3175 | 🎥 Video | `document.getElementById(` |
| 3178 | 📍 Location | `addLocationToPost()` |
| 3181 | 👥 Tag People | `tagPeopleInPost()` |
| 3191 | ✕ | `closeModal(` |
| 3195 | 🌍 | `selectPrivacy(` |
| 3202 | 👥 | `selectPrivacy(` |
| 3209 | 🔒 | `selectPrivacy(` |
| 3222 | ✕ | `closeModal(` |
| 3227 | 🏖️ | `selectPhoto(` |
| 3228 | 🌅 | `selectPhoto(` |
| 3229 | 🎨 | `selectPhoto(` |
| 3230 | 🏔️ | `selectPhoto(` |
| 3231 | 🌸 | `selectPhoto(` |
| 3232 | 🌆 | `selectPhoto(` |
| 3240 | ✕ | `closeModal(` |
| 3245 | 🎮 | `selectVideo(` |
| 3246 | 🎬 | `selectVideo(` |
| 3247 | 🎵 | `selectVideo(` |
| 3248 | 🏃 | `selectVideo(` |
| 3256 | ✕ | `closeModal(` |
| 3264 | 📍 | `selectLocation(` |
| 3271 | 📍 | `selectLocation(` |
| 3278 | 📍 | `selectLocation(` |
| 3291 | ✕ | `closeModal(` |
| 3299 | 👤 | `tagPerson(` |
| 3306 | 😊 | `tagPerson(` |
| 3313 | 🎨 | `tagPerson(` |
| 3326 | ✕ | `closeModal(` |

**Total buttons: 67**

---

## 📄 COMMENTS CONTAINER

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 3339 | Like | `likeComment(this)` |
| 3340 | Reply | `replyToComment(` |
| 3354 | Like | `likeComment(this)` |
| 3355 | Reply | `replyToComment(` |
| 3363 | ➤ | `submitComment()` |
| 3371 | ← | `closeModal(` |
| 3375 | 📹 | `startVideoCall()` |
| 3376 | 📞 | `startPhoneCall()` |
| 3399 | ➕ | `openMessagingOptions()` |
| 3400 | 📷 | `openCameraForMessage()` |
| 3401 | 🖼️ | `openGalleryForMessage()` |
| 3402 | 🎤 | `recordVoiceMessage()` |
| 3406 | ➤ | `sendChatMessage()` |
| 3415 | ✕ | `closeModal(` |
| 3423 | 👤 | `closeModal(` |
| 3430 | 😊 | `closeModal(` |
| 3443 | ✕ | `closeModal(` |
| 3451 | 📷 Camera | `openStoryCamera()` |
| 3454 | 🖼️ Gallery | `openStoryGallery()` |
| 3458 | 🌟 Create Story | `createAndShareStory()` |
| 3466 | ✨ | `closeModal(` |
| 3475 | ✕ | `event.stopPropagation(); closeModal(` |
| 3484 | ✕ | `closeModal(` |
| 3490 | Privacy | `openModal(` |
| 3497 | 🔴 Start Live | `startLiveStream()` |
| 3519 | ✕ | `closeModal(` |
| 3525 | ➤ | `showToast(` |
| 3534 | ✕ | `closeModal(` |
| 3542 | Select Photos | `closeModal(` |
| 3550 | ✕ | `closeModal(` |
| 3558 | Select Video | `closeModal(` |
| 3566 | ✕ | `closeModal(` |
| 3571 | 😊 | `selectFeeling(` |
| 3575 | 😍 | `selectFeeling(` |
| 3579 | 🎉 | `selectFeeling(` |
| 3583 | 😴 | `selectFeeling(` |
| 3587 | 🤔 | `selectFeeling(` |
| 3591 | 💪 | `selectFeeling(` |
| 3602 | ✕ | `closeModal(` |
| 3606 | 📊 | `viewPostAnalytics()` |
| 3614 | ✏️ | `editPostFromMenu()` |
| 3622 | 🗑️ | `deletePostFromMenu()` |
| 3630 | 🔖 | `closeModal(` |
| 3638 | 🔄 | `closeModal(` |
| 3646 | 🔗 | `closeModal(` |
| 3653 | 👁️ | `closeModal(` |
| 3661 | ⚠️ | `closeModal(` |
| 3675 | ✕ | `closeModal(` |
| 3684 | ❌ | `closeModal(` |
| 3691 | ⚙️ | `closeModal(` |
| 3699 | Cancel | `closeModal(` |
| 3708 | ✕ | `closeModal(` |
| 3720 | 📧 | `submitPostReport(` |
| 3727 | 😢 | `submitPostReport(` |
| 3734 | 🚫 | `submitPostReport(` |
| 3741 | ⚡ | `submitPostReport(` |
| 3748 | ❌ | `submitPostReport(` |
| 3755 | 📝 | `submitPostReport(` |
| 3768 | ✕ | `closeModal(` |
| 3785 | (no label) | `toggleSwitch(this)` |
| 3794 | (no label) | `toggleSwitch(this)` |
| 3803 | (no label) | `toggleSwitch(this)` |
| 3810 | ⚠️ | `closeModal(` |
| 3818 | Save Preferences | `closeModal(` |
| 3827 | ✕ | `closeModal(` |
| 3841 | 📝 | `shareToMyTimeline()` |
| 3850 | 👤 | `shareToFriend()` |
| 3859 | 👥 | `shareToGroup()` |
| 3868 | ⭐ | `shareToStory()` |
| 3881 | 💬 | `shareViaWhatsApp()` |
| 3889 | 🐦 | `shareViaTwitter()` |
| 3897 | 📘 | `shareViaFacebook()` |
| 3905 | 🔗 | `copyPostLink()` |
| 3918 | ✕ | `closeModal(` |
| 4010 | 📥 Export Full Report | `exportPostAnalytics()` |
| 4019 | ✕ | `closeModal(` |
| 4037 | 👁️ | `selectSensitiveContentFilter(` |
| 4044 | ⚠️ | `selectSensitiveContentFilter(` |
| 4051 | 🚫 | `selectSensitiveContentFilter(` |
| 4058 | Save Settings | `closeModal(` |
| 4066 | ✕ | `closeModal(` |
| 4075 | (no label) | `toggleSwitch(this)` |
| 4084 | (no label) | `toggleSwitch(this)` |
| 4100 | ✕ | `closeModal(` |
| 4119 | ✕ | `closeModal(` |
| 4127 | 🔴 Go Live Now | `closeModal(` |
| 4136 | ✕ | `closeModal(` |
| 4142 | Privacy | `openModal(` |
| 4149 | Create Group | `createNewGroup()` |
| 4157 | ✕ | `closeModal(` |
| 4169 | Join Group | `showToast(` |
| 4190 | ✕ | `closeModal(` |
| 4208 | (no label) | `toggleSwitch(this); toggleVirtualEvent()` |
| 4215 | Create Event | `createNewEvent()` |
| 4223 | ✕ | `closeModal(` |
| 4236 | ✓ Going | `eventsSystem.rsvpEvent(1, ` |
| 4239 | ⭐ Interested | `eventsSystem.rsvpEvent(1, ` |
| 4242 | 🔗 Share | `eventsSystem.shareEventWithTracking(1)` |
| 4252 | 📅 Calendar | `eventsSystem.openEventCalendar()` |
| 4253 | 🔔 Reminders | `eventsSystem.openReminderSettings(1)` |
| 4254 | ✅ Check-In | `eventsSystem.openCheckIn(1)` |
| 4255 | 📸 Photos | `eventsSystem.openEventAlbum(1)` |
| 4256 | 💬 Chat | `eventsSystem.openEventChat(1)` |
| 4257 | 🗺️ Map | `eventsSystem.openEventMap(1)` |
| 4258 | 👥 Guests | `eventsSystem.manageGuestList(1)` |
| 4259 | 📊 Analytics | `eventsSystem.showEventAnalytics(1)` |
| 4271 | 💳 Purchase Ticket | `eventsSystem.purchaseTicket(1)` |
| 4279 | ✕ | `closeModal(` |
| 4281 | Save | `saveProfile()` |
| 4286 | Change Photo | `showToast(` |
| 4299 | ✕ | `closeModal(` |
| 4311 | Create Collection | `closeModal(` |
| 4319 | ✕ | `closeModal(` |
| 4337 | ✕ | `closeModal(` |
| 4353 | (no label) | `toggleSwitch(this)` |
| 4362 | (no label) | `toggleSwitch(this)` |
| 4371 | ✕ | `closeModal(` |
| 4376 | 😎 | `selectAR(` |
| 4380 | 👑 | `selectAR(` |
| 4384 | ✨ | `selectAR(` |
| 4388 | 🌈 | `selectAR(` |
| 4392 | 🎨 | `selectAR(` |
| 4396 | 🚀 | `selectAR(` |
| 4407 | ✕ | `closeModal(` |
| 4409 | Save | `closeModal(` |
| 4422 | ✕ | `closeModal(` |
| 4429 | Update Password | `closeModal(` |
| 4437 | ✕ | `closeModal(` |
| 4441 | Language | `openModal(` |
| 4448 | Timezone | `openModal(` |
| 4455 | Date Format | `openModal(` |
| 4467 | ✕ | `closeModal(` |
| 4471 | Who can see my posts | `openModal(` |
| 4478 | Who can message me | `openModal(` |
| 4485 | Profile visibility | `openModal(` |
| 4497 | (no label) | `toggleSwitch(this)` |
| 4506 | ✕ | `closeModal(` |
| 4528 | ✕ | `closeModal(` |
| 4532 | 💾 | `openModal(` |
| 4540 | ⏸️ | `openModal(` |
| 4548 | 🗑️ | `openModal(` |
| 4561 | ✕ | `closeModal(` |
| 4570 | (no label) | `toggleSwitch(this)` |
| 4579 | (no label) | `toggleSwitch(this)` |
| 4588 | (no label) | `toggleSwitch(this)` |
| 4597 | (no label) | `toggleSwitch(this)` |
| 4606 | ✕ | `closeModal(` |
| 4641 | ✕ | `closeModal(` |
| 4670 | ✕ | `closeModal(` |
| 4674 | 🔒 | `openModal(` |
| 4681 | 🛡️ | `openModal(` |
| 4688 | 📱 | `openModal(` |
| 4700 | ✕ | `closeModal(` |
| 4704 | 👁️ | `openModal(` |
| 4711 | 🔐 | `openModal(` |
| 4718 | 📊 | `openModal(` |
| 4730 | ✕ | `closeModal(` |
| 4734 | 💬 | `closeModal(` |
| 4741 | 📷 | `closeModal(` |
| 4748 | 🎤 | `closeModal(` |
| 4760 | ✕ | `closeModal(` |
| 4764 | Problem Type | `openModal(` |
| 4772 | Submit Report | `submitProblemReport()` |
| 4780 | ✕ | `closeModal(` |
| 4791 | ➤ | `showToast(` |
| 4798 | ✕ | `closeModal(` |
| 4807 | Send Email | `closeModal(` |
| 4815 | ✕ | `closeModal(` |
| 4826 | 🔒 Reset Password | `askAI(` |
| 4829 | 🔐 Privacy Settings | `askAI(` |
| 4832 | ⚠️ Report Issue | `askAI(` |
| 4835 | 🗑️ Delete Account | `askAI(` |
| 4843 | ➤ | `sendToAI()` |
| 4851 | ✕ | `closeModal(` |
| 4871 | Go to Settings | `closeModal(` |
| 4880 | ✕ | `closeModal(` |
| 4901 | Enable 2FA | `closeModal(` |
| 4910 | ✕ | `closeModal(` |
| 4934 | Log Out | `showToast(` |
| 4946 | ✕ | `closeModal(` |
| 4981 | Change Privacy Settings | `closeModal(` |
| 4990 | ✕ | `closeModal(` |
| 5002 | (no label) | `toggleSwitch(this)` |
| 5011 | (no label) | `toggleSwitch(this)` |
| 5015 | Who can send you friend requests | `openModal(` |
| 5022 | Who can see your friends list | `openModal(` |
| 5035 | ✕ | `closeModal(` |
| 5042 | 💾 | `closeModal(` |
| 5050 | 🔍 | `closeModal(` |
| 5058 | 📊 | `closeModal(` |
| 5066 | 🗑️ | `closeModal(` |
| 5080 | ✕ | `closeModal(` |
| 5103 | Go to Messages | `navigateToMessages(` |
| 5112 | ✕ | `closeModal(` |
| 5135 | Open Messages | `navigateToMessages(` |
| 5144 | ✕ | `closeModal(` |
| 5167 | Try It Now | `navigateToMessages(` |
| 5176 | ✕ | `closeModal(` |
| 5183 | 🌍 | `updatePostVisibility(` |
| 5191 | 👥 | `updatePostVisibility(` |
| 5198 | 🔒 | `updatePostVisibility(` |
| 5211 | ✕ | `closeModal(` |
| 5218 | 🌍 | `updateMessagePrivacy(` |
| 5226 | 👥 | `updateMessagePrivacy(` |
| 5233 | 🔒 | `updateMessagePrivacy(` |
| 5246 | ✕ | `closeModal(` |
| 5253 | 🌍 | `updateProfileVisibility(` |
| 5261 | 👥 | `updateProfileVisibility(` |
| 5268 | 🔒 | `updateProfileVisibility(` |
| 5281 | ✕ | `closeModal(` |
| 5336 | ✕ | `closeModal(` |
| 5384 | Got It | `closeModal(` |
| 5393 | ✕ | `closeModal(` |
| 5415 | Request Download | `requestDataDownload()` |
| 5424 | ✕ | `closeModal(` |
| 5443 | Deactivate Account | `confirmDeactivateAccount()` |
| 5446 | Cancel | `closeModal(` |
| 5455 | ✕ | `closeModal(` |
| 5476 | Deactivate Instead | `closeModal(` |
| 5485 | (no label) | `toggleSwitch(this)` |
| 5489 | Delete Account Permanently | `confirmDeleteAccount()` |
| 5492 | Cancel | `closeModal(` |
| 5501 | ✕ | `closeModal(` |
| 5505 | 🇺🇸 | `updateLanguage(` |
| 5512 | 🇪🇸 | `updateLanguage(` |
| 5518 | 🇫🇷 | `updateLanguage(` |
| 5524 | 🇩🇪 | `updateLanguage(` |
| 5530 | 🇨🇳 | `updateLanguage(` |
| 5542 | ✕ | `closeModal(` |
| 5546 | 🌍 | `updateTimezone(` |
| 5554 | 🌍 | `updateTimezone(` |
| 5561 | 🌍 | `updateTimezone(` |
| 5568 | 🌍 | `updateTimezone(` |
| 5581 | ✕ | `closeModal(` |
| 5585 | 📅 | `updateDateFormat(` |
| 5593 | 📅 | `updateDateFormat(` |
| 5600 | 📅 | `updateDateFormat(` |
| 5613 | ✕ | `closeModal(` |
| 5620 | 🌍 | `updateFriendRequestsPrivacy(` |
| 5628 | 👥 | `updateFriendRequestsPrivacy(` |
| 5635 | 🔒 | `updateFriendRequestsPrivacy(` |
| 5648 | ✕ | `closeModal(` |
| 5655 | 🌍 | `updateFriendsListPrivacy(` |
| 5662 | 👥 | `updateFriendsListPrivacy(` |
| 5670 | 🔒 | `updateFriendsListPrivacy(` |
| 5683 | ✕ | `closeModal(` |
| 5687 | ⚙️ | `selectProblemType(` |
| 5694 | 👤 | `selectProblemType(` |
| 5701 | ⚠️ | `selectProblemType(` |
| 5708 | 🔐 | `selectProblemType(` |
| 5715 | 💡 | `selectProblemType(` |
| 5722 | 📝 | `selectProblemType(` |
| 5737 | ✕ | `closeModal(` |
| 5739 | Save | `saveDatingProfile()` |
| 5747 | 📷 Change Photos | `changeDatingPhotos()` |
| 5828 | ⚙️ Match Preferences | `openModal(` |
| 5831 | 🎯 Relationship Goals | `openModal(` |
| 5834 | 🎨 Interests & Hobbies | `openModal(` |
| 5837 | 📸 Photo Verification | `openModal(` |
| 5846 | ✕ | `closeModal(` |
| 5848 | Save | `saveDatingPreferences()` |
| 5885 | 👩 | `selectGenderPreference(` |
| 5892 | 👨 | `selectGenderPreference(` |
| 5898 | 👥 | `selectGenderPreference(` |
| 5909 | 🎓 | `openModal(` |
| 5918 | 💪 | `openModal(` |
| 5927 | 📏 | `openModal(` |
| 5936 | 🙏 | `openModal(` |
| 5945 | 🌍 | `openModal(` |
| 5963 | (no label) | `toggleSwitch(this)` |
| 5973 | (no label) | `toggleSwitch(this)` |
| 5983 | (no label) | `toggleSwitch(this)` |
| 6000 | ✕ | `closeModal(` |
| 6002 | Save | `saveRelationshipGoals()` |
| 6014 | 💑 | `selectRelationshipType(` |
| 6022 | 🌹 | `selectRelationshipType(` |
| 6029 | 👥 | `selectRelationshipType(` |
| 6036 | 🤔 | `selectRelationshipType(` |
| 6047 | 👶 | `selectChildrenPreference(` |
| 6055 | 💍 | `selectMarriagePreference(` |
| 6063 | 👨‍👩‍👧‍👦 | `selectFamilyImportance(` |
| 6075 | ❤️ | `openModal(` |
| 6083 | 🚫 | `openModal(` |
| 6097 | ✕ | `closeModal(` |
| 6099 | Save | `saveInterestsHobbies()` |
| 6117 | 💪 Gym | `toggleInterest(this, ` |
| 6118 | 🧘 Yoga | `toggleInterest(this, ` |
| 6119 | 🏃 Running | `toggleInterest(this, ` |
| 6120 | 🥾 Hiking | `toggleInterest(this, ` |
| 6121 | 🏊 Swimming | `toggleInterest(this, ` |
| 6122 | 🚴 Cycling | `toggleInterest(this, ` |
| 6123 | 🥋 Martial Arts | `toggleInterest(this, ` |
| 6124 | 💃 Dancing | `toggleInterest(this, ` |
| 6131 | 📷 Photography | `toggleInterest(this, ` |
| 6132 | 🎵 Music | `toggleInterest(this, ` |
| 6133 | 🎨 Art | `toggleInterest(this, ` |
| 6134 | 🎭 Theater | `toggleInterest(this, ` |
| 6135 | 🏛️ Museums | `toggleInterest(this, ` |
| 6136 | 📚 Reading | `toggleInterest(this, ` |
| 6137 | ✍️ Writing | `toggleInterest(this, ` |
| 6138 | 🎬 Movies | `toggleInterest(this, ` |
| 6145 | ✈️ Travel | `toggleInterest(this, ` |
| 6146 | 🏕️ Camping | `toggleInterest(this, ` |
| 6147 | 🚗 Road Trips | `toggleInterest(this, ` |
| 6148 | 🏖️ Beach | `toggleInterest(this, ` |
| 6149 | ⛰️ Mountains | `toggleInterest(this, ` |
| 6150 | 🎒 Backpacking | `toggleInterest(this, ` |
| 6157 | 🎮 Gaming | `toggleInterest(this, ` |
| 6158 | 📺 TV Shows | `toggleInterest(this, ` |
| 6159 | 🍿 Netflix | `toggleInterest(this, ` |
| 6160 | 🎤 Concerts | `toggleInterest(this, ` |
| 6161 | 🎸 Live Music | `toggleInterest(this, ` |
| 6162 | 😂 Comedy | `toggleInterest(this, ` |
| 6169 | 👨‍🍳 Cooking | `toggleInterest(this, ` |
| 6170 | 🍕 Foodie | `toggleInterest(this, ` |
| 6171 | 🍷 Wine | `toggleInterest(this, ` |
| 6172 | ☕ Coffee | `toggleInterest(this, ` |
| 6173 | 🧁 Baking | `toggleInterest(this, ` |
| 6174 | 🍽️ Fine Dining | `toggleInterest(this, ` |
| 6181 | 💻 Technology | `toggleInterest(this, ` |
| 6182 | 💼 Entrepreneurship | `toggleInterest(this, ` |
| 6183 | 💰 Finance | `toggleInterest(this, ` |
| 6184 | 🚀 Startups | `toggleInterest(this, ` |
| 6185 | 📈 Investing | `toggleInterest(this, ` |
| 6192 | 🐕 Dogs | `toggleInterest(this, ` |
| 6193 | 🐱 Cats | `toggleInterest(this, ` |
| 6194 | 🦎 Exotic Pets | `toggleInterest(this, ` |
| 6195 | ❤️ Animal Rescue | `toggleInterest(this, ` |
| 6196 | 📷 Pet Photography | `toggleInterest(this, ` |
| 6203 | 🧘‍♂️ Meditation | `toggleInterest(this, ` |
| 6204 | 🌿 Wellness | `toggleInterest(this, ` |
| 6205 | 💆 Self-Care | `toggleInterest(this, ` |
| 6206 | 🧠 Mental Health | `toggleInterest(this, ` |
| 6207 | 🕉️ Spirituality | `toggleInterest(this, ` |
| 6215 | ✕ | `closeModal(` |
| 6265 | 📷 Add New Photo to Verify | `addNewVerifiedPhoto()` |
| 6286 | ✕ | `closeModal(` |
| 6293 | Any | `selectEducationFilter(` |
| 6300 | High School | `selectEducationFilter(` |
| 6305 | Some College | `selectEducationFilter(` |
| 6310 | Bachelor's Degree | `selectEducationFilter(` |
| 6315 | Master's Degree | `selectEducationFilter(` |
| 6320 | Doctorate/PhD | `selectEducationFilter(` |
| 6331 | ✕ | `closeModal(` |
| 6338 | Any | `selectBodyTypeFilter(` |
| 6344 | Slim | `selectBodyTypeFilter(` |
| 6349 | Athletic | `selectBodyTypeFilter(` |
| 6354 | Average | `selectBodyTypeFilter(` |
| 6359 | Muscular | `selectBodyTypeFilter(` |
| 6364 | Curvy | `selectBodyTypeFilter(` |
| 6375 | ✕ | `closeModal(` |
| 6382 | Any | `selectHeightFilter(` |
| 6388 | Under 5'0" | `selectHeightFilter(` |
| 6393 | 5'0" - 5'5" | `selectHeightFilter(` |
| 6398 | 5'6" - 5'11" | `selectHeightFilter(` |
| 6403 | 6'0" - 6'5" | `selectHeightFilter(` |
| 6408 | Over 6'5" | `selectHeightFilter(` |
| 6419 | ✕ | `closeModal(` |
| 6426 | Any | `selectReligionFilter(` |
| 6432 | Christian | `selectReligionFilter(` |
| 6437 | Muslim | `selectReligionFilter(` |
| 6442 | Jewish | `selectReligionFilter(` |
| 6447 | Hindu | `selectReligionFilter(` |
| 6452 | Buddhist | `selectReligionFilter(` |
| 6457 | Spiritual but not religious | `selectReligionFilter(` |
| 6462 | Atheist/Agnostic | `selectReligionFilter(` |
| 6467 | Other | `selectReligionFilter(` |
| 6478 | ✕ | `closeModal(` |
| 6485 | Any | `selectEthnicityFilter(` |
| 6491 | Asian | `selectEthnicityFilter(` |
| 6496 | Black/African American | `selectEthnicityFilter(` |
| 6501 | Caucasian/White | `selectEthnicityFilter(` |
| 6506 | Hispanic/Latino | `selectEthnicityFilter(` |
| 6511 | Middle Eastern | `selectEthnicityFilter(` |
| 6516 | Mixed/Multi-racial | `selectEthnicityFilter(` |
| 6521 | Other | `selectEthnicityFilter(` |
| 6532 | ✕ | `closeModal(` |
| 6539 | Want children | `selectChildrenPref(` |
| 6545 | Don't want children | `selectChildrenPref(` |
| 6550 | Have and want more | `selectChildrenPref(` |
| 6555 | Have and don't want more | `selectChildrenPref(` |
| 6560 | Not sure yet | `selectChildrenPref(` |
| 6571 | ✕ | `closeModal(` |
| 6578 | Open to marriage | `selectMarriagePref(` |
| 6584 | Want to get married | `selectMarriagePref(` |
| 6589 | Don't want marriage | `selectMarriagePref(` |
| 6594 | Not sure yet | `selectMarriagePref(` |
| 6605 | ✕ | `closeModal(` |
| 6612 | Very Important | `selectFamilyImp(` |
| 6618 | Important | `selectFamilyImp(` |
| 6623 | Somewhat Important | `selectFamilyImp(` |
| 6628 | Not that Important | `selectFamilyImp(` |
| 6639 | ✕ | `closeModal(` |
| 6641 | Save | `saveDatingValues()` |
| 6651 | ✓ Honesty | `toggleValue(this, ` |
| 6652 | ✓ Loyalty | `toggleValue(this, ` |
| 6653 | ✓ Communication | `toggleValue(this, ` |
| 6654 | Respect | `toggleValue(this, ` |
| 6655 | Trust | `toggleValue(this, ` |
| 6656 | Humor | `toggleValue(this, ` |
| 6657 | Adventure | `toggleValue(this, ` |
| 6658 | Stability | `toggleValue(this, ` |
| 6659 | Ambition | `toggleValue(this, ` |
| 6660 | Compassion | `toggleValue(this, ` |
| 6661 | Intelligence | `toggleValue(this, ` |
| 6662 | Creativity | `toggleValue(this, ` |
| 6670 | ✕ | `closeModal(` |
| 6672 | Save | `saveDealbreakers()` |
| 6682 | ✓ Smoking | `toggleValue(this, ` |
| 6683 | ✓ Dishonesty | `toggleValue(this, ` |
| 6684 | No Job | `toggleValue(this, ` |
| 6685 | Different Politics | `toggleValue(this, ` |
| 6686 | No Ambition | `toggleValue(this, ` |
| 6687 | Drug Use | `toggleValue(this, ` |
| 6688 | Excessive Drinking | `toggleValue(this, ` |
| 6689 | Poor Communication | `toggleValue(this, ` |
| 6690 | Disrespectful | `toggleValue(this, ` |
| 6691 | Unreliable | `toggleValue(this, ` |
| 6699 | ✕ | `closeModal(` |
| 6703 | 👤 | `closeModal(` |
| 6711 | 😊 | `closeModal(` |
| 6724 | ✕ | `closeModal(` |
| 6747 | ✕ | `closeModal(` |
| 6765 | ✕ | `closeModal(` |
| 6792 | ✕ | `closeModal(` |
| 6815 | (no label) | `toggleSwitch(this)` |
| 6825 | ✕ | `closeModal(` |
| 6829 | 🧩 | `playGame(` |
| 6836 | 🏎️ | `playGame(` |
| 6843 | 🃏 | `playGame(` |
| 6850 | 🧠 | `playGame(` |
| 6862 | ✕ | `closeModal(` |
| 6906 | ✕ | `closeModal(` |
| 6937 | ✕ | `closeModal(` |
| 6944 | + Add Option | `showToast(` |
| 6947 | Poll Length | `openModal(` |
| 6954 | Create Poll | `createNewPoll()` |
| 6962 | ✕ | `closeModal(` |
| 6969 | Category | `openModal(` |
| 6976 | Create Fundraiser | `createNewFundraiser()` |
| 6984 | ✕ | `closeModal(` |
| 6988 | 📁 | `selectMediaFromDevice()` |
| 6993 | 📷 Photos | `selectPhotosFromGallery()` |
| 6996 | 🎥 Videos | `selectVideosFromGallery()` |
| 7006 | ✕ | `closeModal(` |
| 7013 | ✏️ | `showToast(` |
| 7021 | Message | `closeModal(` |
| 7029 | Message | `closeModal(` |
| 7036 | ✕ | `closeModal(` |
| 7044 | 👤 | `closeModal(` |
| 7051 | 😊 | `closeModal(` |
| 7063 | ✕ | `closeModal(` |
| 7084 | ✕ | `closeModal(` |
| 7105 | ✕ | `closeModal(` |
| 7124 | ✕ | `closeModal(` |
| 7137 | 👤 | `openRelatedPost(` |
| 7147 | 🤖 | `openRelatedPost(` |
| 7157 | 💻 | `openRelatedPost(` |
| 7173 | ✕ | `closeModal(` |
| 7177 | 🌍 | `selectLivePrivacy(` |
| 7184 | 👥 | `selectLivePrivacy(` |
| 7191 | 🔒 | `selectLivePrivacy(` |
| 7204 | ✕ | `closeModal(` |
| 7208 | 🌍 | `selectGroupPrivacy(` |
| 7215 | 🔒 | `selectGroupPrivacy(` |
| 7228 | ✕ | `closeModal(` |
| 7232 | 📅 | `selectPollLength(` |
| 7238 | 📅 | `selectPollLength(` |
| 7244 | 📅 | `selectPollLength(` |
| 7250 | 📅 | `selectPollLength(` |
| 7262 | ✕ | `closeModal(` |
| 7266 | 🏥 | `selectFundraiserCategory(` |
| 7272 | 🎓 | `selectFundraiserCategory(` |
| 7278 | 🚨 | `selectFundraiserCategory(` |
| 7284 | 🏘️ | `selectFundraiserCategory(` |
| 7290 | 💝 | `selectFundraiserCategory(` |
| 7296 | 📋 | `selectFundraiserCategory(` |
| 7308 | ✕ | `marketplaceCloseModal(` |
| 7322 | ✕ | `marketplaceCloseModal(` |
| 7333 | Place Order | `marketplaceProcessPayment()` |
| 7339 | ✕ | `marketplaceCloseModal(` |
| 7355 | Publish Listing | `marketplacePublishListing()` |
| 7361 | ✕ | `marketplaceCloseModal(` |
| 7371 | ✕ | `marketplaceCloseModal(` |
| 7393 | ✕ | `marketplaceCloseModal(` |
| 7403 | ➤ | `showToast(` |
| 7411 | ✕ | `closeModal(` |
| 7422 | ✕ | `closeModal(` |
| 7434 | 360p | `selectStreamQuality(` |
| 7440 | 480p | `selectStreamQuality(` |
| 7446 | 720p HD | `selectStreamQuality(` |
| 7453 | 1080p Full HD | `selectStreamQuality(` |
| 7462 | 30 FPS | `selectStreamFrameRate(` |
| 7469 | 60 FPS | `selectStreamFrameRate(` |
| 7483 | (no label) | `toggleSwitch(this)` |
| 7492 | (no label) | `toggleSwitch(this)` |
| 7502 | ✕ | `closeModal(` |
| 7537 | (no label) | `toggleSwitch(this)` |
| 7541 | 🔔 | `openModal(` |
| 7549 | 💵 | `openModal(` |
| 7557 | 💳 | `openModal(` |
| 7582 | View All Donations | `viewAllDonations()` |
| 7589 | ✕ | `closeModal(` |
| 7598 | ➕ Add Moderator | `openModal(` |
| 7611 | ✕ | `removeModerator(` |
| 7619 | ✕ | `removeModerator(` |
| 7627 | ✕ | `removeModerator(` |
| 7637 | (no label) | `toggleSwitch(this)` |
| 7646 | (no label) | `toggleSwitch(this)` |
| 7655 | (no label) | `toggleSwitch(this)` |
| 7662 | View Banned List | `viewBannedUsers()` |
| 7671 | ✕ | `closeModal(` |
| 7684 | Category | `openModal(` |
| 7696 | (no label) | `toggleSwitch(this)` |
| 7700 | 📅 Schedule Stream | `createScheduledStream()` |
| 7712 | ✕ | `cancelScheduledStream(` |
| 7720 | ✕ | `cancelScheduledStream(` |
| 7728 | ✕ | `closeModal(` |
| 7748 | (no label) | `toggleSwitch(this)` |
| 7760 | (no label) | `toggleSwitch(this)` |
| 7772 | (no label) | `toggleSwitch(this); connectPlatform(` |
| 7784 | (no label) | `toggleSwitch(this); connectPlatform(` |
| 7796 | (no label) | `toggleSwitch(this)` |
| 7805 | (no label) | `toggleSwitch(this)` |
| 7815 | ➕ Connect New Platform | `connectNewPlatform()` |
| 7824 | ✕ | `closeModal(` |
| 7849 | ⚙️ | `openModal(` |
| 7858 | 🔒 | `openModal(` |
| 7872 | (no label) | `toggleSwitch(this)` |
| 7882 | (no label) | `toggleSwitch(this)` |
| 7887 | 🔴 Go Live Now | `startLiveStreamNow()` |
| 7896 | ✕ | `closeModal(` |
| 7900 | 📁 | `shareFile()` |
| 7908 | 📍 | `shareLocation()` |
| 7916 | 😂 | `shareMeme()` |
| 7924 | 👤 | `shareContact()` |
| 7938 | ✕ | `closeModal(` |
| 7946 | 📸 Take Photo | `takePicture()` |
| 7947 | 🎥 Record | `recordVideo()` |
| 7955 | 😎 | `applyFilter(` |
| 7959 | ✨ | `applyFilter(` |
| 7963 | 🌈 | `applyFilter(` |
| 7967 | 👑 | `applyFilter(` |
| 7978 | ✕ | `closeModal(` |
| 7983 | Photos | `switchGalleryTab(this, ` |
| 7984 | Memes | `switchGalleryTab(this, ` |

**Total buttons: 546**

---

## 📄 GALLERY PHOTOS TAB

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 7990 | 🏖️ | `selectGalleryPhoto(` |
| 7991 | 🌅 | `selectGalleryPhoto(` |
| 7992 | 🎨 | `selectGalleryPhoto(` |
| 7993 | 🏔️ | `selectGalleryPhoto(` |
| 7994 | 🌸 | `selectGalleryPhoto(` |
| 7995 | 🌆 | `selectGalleryPhoto(` |

**Total buttons: 6**

---

## 📄 GALLERY MEMES TAB

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 8002 | 😂 | `selectMeme(` |
| 8003 | 🤣 | `selectMeme(` |
| 8004 | 💀 | `selectMeme(` |
| 8005 | 🔥 | `selectMeme(` |
| 8006 | 👀 | `selectMeme(` |
| 8007 | 🤔 | `selectMeme(` |
| 8016 | ✕ | `closeModal(` |
| 8035 | (no label) | `toggleSwitch(this)` |
| 8045 | (no label) | `toggleSwitch(this)` |
| 8050 | ⏱️ | `openModal(` |
| 8059 | ✨ | `openModal(` |
| 8077 | (no label) | `toggleSwitch(this)` |
| 8087 | (no label) | `toggleSwitch(this)` |
| 8102 | 🎬 Test Alert | `testDonationAlert()` |
| 8111 | ✕ | `closeModal(` |
| 8125 | $1.00 | `selectMinimumDonation(` |
| 8133 | $2.00 | `selectMinimumDonation(` |
| 8140 | $5.00 | `selectMinimumDonation(` |
| 8147 | $10.00 | `selectMinimumDonation(` |
| 8160 | Set | `setCustomMinimum()` |
| 8175 | ✕ | `closeModal(` |
| 8190 | 💳 | `openPaymentMethodDetails(` |
| 8199 | 💎 | `openPaymentMethodDetails(` |
| 8208 | 📱 | `openPaymentMethodDetails(` |
| 8221 | 💸 | `connectPaymentMethod(` |
| 8227 | Connect | `event.stopPropagation(); connectPaymentMethod(` |
| 8230 | ₿ | `connectPaymentMethod(` |
| 8236 | Connect | `event.stopPropagation(); connectPaymentMethod(` |
| 8251 | ✕ | `closeModal(` |
| 8258 | 3 seconds | `selectAlertDuration(` |
| 8264 | 5 seconds | `selectAlertDuration(` |
| 8271 | 10 seconds | `selectAlertDuration(` |
| 8283 | ✕ | `closeModal(` |
| 8290 | Slide In | `selectAlertAnimation(` |
| 8297 | Fade In | `selectAlertAnimation(` |
| 8303 | Bounce | `selectAlertAnimation(` |
| 8309 | Zoom In | `selectAlertAnimation(` |
| 8321 | ✕ | `closeModal(` |
| 8336 | (no label) | `toggleSwitch(this); updateAutoRecordingStatus(this)` |
| 8345 | ⚙️ | `openModal(` |
| 8369 | 📁 View Recorded Streams | `viewRecordedStreams()` |
| 8385 | ✕ | `closeModal(` |
| 8395 | 🎤 Start Recording | `toggleVoiceRecording()` |
| 8398 | ➤ Send | `sendVoiceMessage()` |
| 8413 | 🔄 | `toggleCallCamera()` |
| 8417 | 🎤 | `toggleMute()` |
| 8420 | 📞 | `endCall()` |
| 8423 | 📹 | `toggleVideo()` |
| 8438 | 🔊 | `toggleSpeaker()` |
| 8441 | 📞 | `endPhoneCall()` |
| 8444 | 🎤 | `togglePhoneMute()` |
| 8456 | ✕ | `closeModal(` |
| 8467 | 👤 | `initiateVideoCall(` |
| 8475 | 😊 | `initiateVideoCall(` |
| 8483 | 🎨 | `initiateVideoCall(` |
| 8497 | ✕ | `closeModal(` |
| 8508 | 👤 | `initiateVoiceCall(` |
| 8516 | 😊 | `initiateVoiceCall(` |
| 8524 | 🎨 | `initiateVoiceCall(` |
| 8538 | ✕ | `closeModal(` |
| 8554 | 🚀 | `addPersonToCall(` |
| 8562 | 🎭 | `addPersonToCall(` |
| 8576 | ✕ | `closeModal(` |
| 8589 | 🚫 | `selectVirtualBackground(` |
| 8593 | ◎ | `selectVirtualBackground(` |
| 8597 | 🏢 | `selectVirtualBackground(` |
| 8601 | 🏖️ | `selectVirtualBackground(` |
| 8605 | 🚀 | `selectVirtualBackground(` |
| 8609 | 🏔️ | `selectVirtualBackground(` |
| 8614 | 📤 Upload Custom | `uploadCustomBackground()` |
| 8623 | ✕ | `closeModal(` |
| 8635 | 👥 | `openModal(` |
| 8643 | 📅 Schedule Call | `createScheduledCall()` |
| 8655 | ✕ | `cancelScheduledVideoCall(` |
| 8663 | ✕ | `closeModal(` |
| 8667 | 📁 | `selectFileFromDevice()` |
| 8674 | 📄 | `sendSelectedFile(` |
| 8681 | 📊 | `sendSelectedFile(` |
| 8694 | ✕ | `closeModal(` |
| 8701 | 📍 | `sendCurrentLocation()` |
| 8709 | 🗺️ | `openModal(` |
| 8723 | ✕ | `closeModal(` |
| 8735 | 😂 | `selectAndSendMeme(` |
| 8739 | 💀 | `selectAndSendMeme(` |
| 8743 | 🔥 | `selectAndSendMeme(` |
| 8747 | 👀 | `selectAndSendMeme(` |
| 8751 | 🤡 | `selectAndSendMeme(` |
| 8755 | 💯 | `selectAndSendMeme(` |
| 8768 | ✕ | `closeModal(` |
| 8781 | 📹 | `selectCamera()` |
| 8793 | 🎤 | `selectMicrophone()` |
| 8805 | 🔊 | `selectSpeaker()` |
| 8814 | 🔧 Test Devices | `testDevices()` |
| 8821 | ✕ | `closeModal(` |
| 8839 | (no label) | `toggleSwitch(this)` |
| 8849 | (no label) | `toggleSwitch(this)` |
| 8873 | 🎧 Test Audio | `testAudioSettings()` |
| 8880 | ✕ | `closeModal(` |
| 8926 | 📈 Detailed Stats | `viewDetailedStats()` |
| 8933 | ✕ | `closeModal(` |
| 8966 | 📹 | `playCallRecording(` |
| 8972 | ⬇️ | `event.stopPropagation(); downloadCallRecording(` |
| 8975 | 💼 | `playCallRecording(` |
| 8981 | ⬇️ | `event.stopPropagation(); downloadCallRecording(` |
| 8984 | 💾 Manage Storage | `manageRecordingsStorage()` |
| 8991 | ✕ | `closeModal(` |
| 9006 | (no label) | `toggleSwitch(this)` |
| 9023 | Admit | `admitParticipant(` |
| 9024 | Deny | `denyParticipant(` |
| 9035 | Admit | `admitParticipant(` |
| 9036 | Deny | `denyParticipant(` |
| 9040 | ✓ Admit All | `admitAllParticipants()` |
| 9047 | ✕ | `closeModal(` |
| 9061 | 📹 | `viewScheduledCallDetails(` |
| 9067 | ▶️ | `event.stopPropagation(); joinScheduledCall(` |
| 9074 | 💼 | `viewScheduledCallDetails(` |
| 9083 | 📊 | `viewScheduledCallDetails(` |
| 9092 | + Schedule New Call | `openModal(` |
| 9099 | ✕ | `closeModal(` |
| 9112 | 👥 | `selectMaxParticipants()` |
| 9130 | (no label) | `toggleSwitch(this)` |
| 9140 | (no label) | `toggleSwitch(this)` |
| 9150 | (no label) | `toggleSwitch(this)` |
| 9158 | 📱 | `selectCallLayout()` |
| 9167 | 📖 Setup Guide | `viewGroupCallGuide()` |
| 9174 | ✕ | `closeModal(` |
| 9253 | 📊 Export Report | `exportCallAnalytics()` |
| 9260 | ✕ | `closeModal(` |
| 9274 | 📹 | `selectVideoResolution()` |
| 9288 | (no label) | `toggleSwitch(this)` |
| 9298 | (no label) | `toggleSwitch(this)` |
| 9312 | (no label) | `toggleSwitch(this)` |
| 9322 | (no label) | `toggleSwitch(this)` |
| 9332 | (no label) | `toggleSwitch(this)` |
| 9346 | → | `openCallPrivacySettings()` |
| 9354 | (no label) | `toggleSwitch(this)` |
| 9359 | 🔄 Reset to Default | `resetCallSettings()` |
| 9366 | ✕ | `closeModal(` |
| 9434 | (no label) | `toggleSwitch(this)` |
| 9439 | 🔍 Run Speed Test | `runNetworkTest()` |
| 9446 | ✕ | `closeModal(` |
| 9480 | 📹 Call Again | `callBackContact(` |
| 9481 | 🗑️ Delete | `deleteCallFromHistory(` |

**Total buttons: 143**

---

## 📄 LNK-TAB-FEED

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 9561 | <div onclick="switchBottomTab('social');openScr... | `switchBottomTab(` |

**Total buttons: 1**

---

## 📄 LNK-TAB-MESSAGES

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 9570 | <div onclick="openScreen('messages')" id="lnk-t... | `openScreen(` |

**Total buttons: 1**

---

## 📄 LNK-TAB-CREATE

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 9583 | <div onclick="openModal('createPost')" id="lnk-... | `openModal(` |

**Total buttons: 1**

---

## 📄 LNK-TAB-NOTIF

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 9597 | <div onclick="openScreen('notifications')" id="... | `openScreen(` |

**Total buttons: 1**

---

## 📄 LNK-TAB-PROFILE

| Line | Button / Action | Function Called |
|------|----------------|-----------------|
| 9610 | <div onclick="openScreen('profile')" id="lnk-ta... | `openScreen(` |

**Total buttons: 1**

---

## 🔧 All Unique Functions Called (onclick handlers)

- `addFriend()`
- `addLocationToPost()`
- `addNewVerifiedPhoto()`
- `addPersonToCall(`
- `admitAllParticipants()`
- `admitParticipant(`
- `applyFilter(`
- `askAI(`
- `authOnboarding.showLoginScreen()`
- `businessProfile.manageQuotes()`
- `businessProfile.openAnalyticsDashboard()`
- `businessProfile.openBookingSystem()`
- `businessTools.analyzeCompetitors()`
- `businessTools.manageCatalog()`
- `businessTools.manageInvoices()`
- `businessTools.managePromotions()`
- `businessTools.manageReviews()`
- `businessTools.openAdManagement()`
- `businessTools.openAnalyticsDashboard()`
- `businessTools.openCRM()`
- `businessTools.setupPaymentProcessing()`
- `businessTools.showBusinessInsights()`
- `callBackContact(`
- `callBusiness()`
- `cancelScheduledStream(`
- `cancelScheduledVideoCall(`
- `changeDatingPhotos()`
- `clearRecentSearches()`
- `clearSearch()`
- `closeModal(`
- `confirmDeactivateAccount()`
- `confirmDeleteAccount()`
- `connectNewPlatform()`
- `connectPaymentMethod(`
- `copyPostLink()`
- `createAndShareStory()`
- `createNewEvent()`
- `createNewFundraiser()`
- `createNewGroup()`
- `createNewPoll()`
- `createScheduledCall()`
- `createScheduledStream()`
- `deleteCallFromHistory(`
- `deletePostFromMenu()`
- `denyParticipant(`
- `document.getElementById(`
- `editPostFromMenu()`
- `emailBusiness()`
- `endCall()`
- `endPhoneCall()`
- `event.stopPropagation()`
- `eventsSystem.manageGuestList()`
- `eventsSystem.openCheckIn()`
- `eventsSystem.openCreateEventModal()`
- `eventsSystem.openEventAlbum()`
- `eventsSystem.openEventCalendar()`
- `eventsSystem.openEventChat()`
- `eventsSystem.openEventDetails()`
- `eventsSystem.openEventMap()`
- `eventsSystem.openReminderSettings()`
- `eventsSystem.purchaseTicket()`
- `eventsSystem.rsvpEvent(1, `
- `eventsSystem.searchEvents(`
- `eventsSystem.shareEventWithTracking()`
- `eventsSystem.showEventAnalytics()`
- `exportCallAnalytics()`
- `exportPostAnalytics()`
- `filterCreatorAnalytics(this, `
- `filterEventsByStatus(`
- `gamingSystem.playGame(`
- `goHome()`
- `goToPost()`
- `handleForgotPassword()`
- `handleInAppNotificationClick()`
- `handleLogin()`
- `handleRegister()`
- `initiateVideoCall(`
- `initiateVoiceCall(`
- `likeComment()`
- `likeDatingProfile()`
- `manageRecordingsStorage()`
- `markAllAsRead()`
- `marketplaceCloseModal(`
- `marketplaceFilterByCategory(`
- `marketplaceHandleNotification(`
- `marketplaceMarkAllRead()`
- `marketplaceOpenChat(`
- `marketplaceOpenModal(`
- `marketplaceProcessPayment()`
- `marketplacePublishListing()`
- `marketplaceSwitchTab(`
- `marketplaceToggleNotifications()`
- `navigateToMessages(`
- `open360VideoLibrary()`
- `openARGamesDashboard()`
- `openARShoppingDashboard()`
- `openAudioQualityModal()`
- `openCallPrivacySettings()`
- `openCameraForMessage()`
- `openCreateMusicPlaylistModal()`
- `openCustomFilterCreator()`
- `openGalleryForMessage()`
- `openHandTrackingDashboard()`
- `openMessagingOptions()`
- `openModal(`
- `openMusicDownloadModal()`
- `openMusicLyricsModal()`
- `openMusicQueueModal()`
- `openMusicShareModal()`
- `openPaymentMethodDetails(`
- `openRelatedPost(`
- `openScreen(`
- `openSearchMusicModal()`
- `openSpatialAudioConfig()`
- `openStoryCamera()`
- `openStoryGallery()`
- `openVRHeadsetManager()`
- `openVRMeditationDashboard()`
- `passDatingProfile()`
- `performSearch(`
- `playCallRecording(`
- `playGame(`
- `recordVideo()`
- `recordVoiceMessage()`
- `removeModerator(`
- `removeSelectedLocation()`
- `removeSelectedPhoto()`
- `removeSelectedVideo()`
- `removeSuggestion()`
- `replyToComment(`
- `requestDataDownload()`
- `resetCallSettings()`
- `runNetworkTest()`
- `saveDatingPreferences()`
- `saveDatingProfile()`
- `saveDatingValues()`
- `saveDealbreakers()`
- `saveInterestsHobbies()`
- `saveProfile()`
- `saveRelationshipGoals()`
- `selectAR(`
- `selectAlertAnimation(`
- `selectAlertDuration(`
- `selectAndSendMeme(`
- `selectBodyTypeFilter(`
- `selectCallLayout()`
- `selectCamera()`
- `selectChildrenPref(`
- `selectChildrenPreference(`
- `selectEducationFilter(`
- `selectEthnicityFilter(`
- `selectFamilyImp(`
- `selectFamilyImportance(`
- `selectFeeling(`
- `selectFileFromDevice()`
- `selectFundraiserCategory(`
- `selectGalleryPhoto(`
- `selectGenderPreference(`
- `selectGroupPrivacy(`
- `selectHeightFilter(`
- `selectLivePrivacy(`
- `selectLocation(`
- `selectMarriagePref(`
- `selectMarriagePreference(`
- `selectMaxParticipants()`
- `selectMediaFromDevice()`
- `selectMeme(`
- `selectMicrophone()`
- `selectMinimumDonation(`
- `selectPhoto(`
- `selectPhotosFromGallery()`
- `selectPollLength(`
- `selectPrivacy(`
- `selectProblemType(`
- `selectRelationshipType(`
- `selectReligionFilter(`
- `selectSensitiveContentFilter(`
- `selectSpeaker()`
- `selectStreamFrameRate(`
- `selectStreamQuality(`
- `selectVideo(`
- `selectVideoResolution()`
- `selectVideosFromGallery()`
- `selectVirtualBackground(`
- `sendChatMessage()`
- `sendCurrentLocation()`
- `sendMessage()`
- `sendSelectedFile(`
- `sendToAI()`
- `sendVoiceMessage()`
- `setCustomMinimum()`
- `shareBusinessProfile()`
- `shareContact()`
- `shareCreatorProfile()`
- `shareFile()`
- `shareLocation()`
- `shareMeme()`
- `sharePost()`
- `sharePremiumProfile()`
- `shareProfile()`
- `shareToFriend()`
- `shareToGroup()`
- `shareToMyTimeline()`
- `shareToStory()`
- `shareViaFacebook()`
- `shareViaTwitter()`
- `shareViaWhatsApp()`
- `showAccountDeactivation()`
- `showAccountDeletion()`
- `showBlockedUsers()`
- `showChangeEmailModal()`
- `showChangePasswordModal()`
- `showDataExport()`
- `showDeviceManagement()`
- `showLanguageSettings()`
- `showLoginHistory()`
- `showNotificationSettings()`
- `showPrivacyEnforcement()`
- `showSecurityAlerts()`
- `showSessionManagement()`
- `showTimezoneSettings()`
- `showToast(`
- `showTwoFactorSetup()`
- `socialLogin(`
- `startLiveStream()`
- `startLiveStreamNow()`
- `startPhoneCall()`
- `startVideoCall()`
- `submitActualPost()`
- `submitComment()`
- `submitPostReport(`
- `submitProblemReport()`
- `superLike()`
- `switchBottomTab(`
- `switchGalleryTab(this, `
- `switchLoginTab(`
- `switchPillTab(document.querySelector(`
- `switchPillTab(this, `
- `tagPeopleInPost()`
- `tagPerson(`
- `takePicture()`
- `testAudioSettings()`
- `testDevices()`
- `testDonationAlert()`
- `toggleCallCamera()`
- `toggleCheckboxLogin(`
- `toggleInAppNotifications()`
- `toggleInterest(this, `
- `toggleLikePost()`
- `toggleMute()`
- `togglePasswordVisibility(`
- `togglePhoneMute()`
- `toggleSpeaker()`
- `toggleSwitch()`
- `toggleValue(this, `
- `toggleVideo()`
- `toggleVoiceRecording()`
- `updateDateFormat(`
- `updateFriendRequestsPrivacy(`
- `updateFriendsListPrivacy(`
- `updateLanguage(`
- `updateMessagePrivacy(`
- `updatePostVisibility(`
- `updateProfileVisibility(`
- `updateTimezone(`
- `uploadCustomBackground()`
- `viewAllBusinessTools()`
- `viewAllDonations()`
- `viewAllUpcomingEvents()`
- `viewBannedUsers()`
- `viewDetailedStats()`
- `viewGroupCallGuide()`
- `viewMyHostedEvents()`
- `viewPastEventDetails(`
- `viewPastEvents()`
- `viewPostAnalytics()`
- `viewRecordedStreams()`
- `viewScheduledCallDetails(`
- `visitWebsite()`
- `window.arVR.applyFaceFilter(`
- `window.arVR.enterVirtualRoom(`
- `window.arVR.openARCamera()`
- `window.liveStreaming.requestCameraAccess()`
- `window.liveStreaming.requestMicrophoneAccess()`
- `window.liveStreaming.showStreamPreview()`
- `window.liveStreaming.startStream()`
- `window.liveStreaming.viewStreamAnalytics()`
- `window.musicPlayer.cycleRepeatMode()`
- `window.musicPlayer.openMusicLibrary()`
- `window.musicPlayer.playMusic()`
- `window.musicPlayer.playNextTrack()`
- `window.musicPlayer.playPreviousTrack()`
- `window.musicPlayer.togglePlayPause()`
- `window.musicPlayer.toggleShuffle()`
- `window.open(`
- `window.videoCalls.startVideoCall(`
- `window.videoCalls.toggleCallRecording()`
- `window.videoCalls.toggleScreenShare()`
- `window.videoCalls.viewCallHistory()`
