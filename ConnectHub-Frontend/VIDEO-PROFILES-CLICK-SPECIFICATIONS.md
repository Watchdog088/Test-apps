# Video Profiles Click Behavior Specifications
## ConnectHub - Video Profiles Section Interaction Requirements

### Overview
This document specifies the complete behavior and display requirements for video interactions in the Video Profiles section of the Meet People Dashboard.

---

## 1. PRIMARY VIDEO CLICK BEHAVIOR

### When User Clicks on Video Profile Card
**Method Called:** `playVideoProfile(profileId)`

**What Should Happen:**
1. **Immediate Visual Feedback**
   - Video progress bar appears at bottom of video card
   - Play button transforms to pause button with smooth transition
   - Video thumbnail overlay dims slightly to indicate playback

2. **Progress Animation**
   - Progress bar fills from 0% to 100% over simulated video duration
   - Progress updates every 100ms (2% increment per update)
   - Smooth CSS transition for progress bar movement

3. **Audio/Visual Simulation**
   - Card gains subtle glow effect during playback
   - Optional: Subtle pulsing animation on play button area
   - Video duration badge updates to show remaining time

4. **Completion Behavior**
   - When progress reaches 100%, show completion checkmark animation
   - Green checkmark icon appears with fade-in and scale animation
   - Checkmark removes automatically after 3 seconds
   - Progress bar resets and play button returns

5. **Toast Notifications**
   - Initial: `"Playing [Name]'s video introduction"` (info type)
   - On completion: Video complete feedback

---

## 2. SECONDARY INTERACTION BUTTONS

### Like Video Button
**Method Called:** `likeVideoProfile(profileId)`

**Display Elements:**
- Heart icon button with like counter
- Located in video actions panel
- Shows current like count next to icon

**Click Behavior:**
1. **Visual Animation**
   - Large animated heart (💕) appears at center of video card
   - Heart floats upward with fade-out animation over 2 seconds
   - Like count increments immediately in UI

2. **Match Logic**
   - 60% chance of triggering a video match
   - If match occurs: Shows match animation after 1-second delay
   - Match overlay displays with celebration animation

3. **Match Animation Elements:**
   - Fullscreen overlay with animated hearts (💖💕💓)
   - "It's a Video Match!" title
   - Profile information display
   - Action buttons: "Send Message" and "Keep Browsing"

4. **Toast Notifications**
   - Standard like: `"💕 You liked [Name]'s video!"`
   - Match case: `"🎉 Video Match with [Name]!"`

### Message Video Button
**Method Called:** `sendVideoMessage(profileId)`

**Modal Display:**
1. **Header Section**
   - Title: "Send Message to [Name]"
   - Close button (X) in top-right corner

2. **Profile Preview**
   - Video thumbnail with gradient background
   - Profile name, age, and location
   - Match percentage indicator

3. **Quick Message Templates**
   - "💬 Love your video!" button
   - "❓ Ask about video" button  
   - "✨ Common interests" button
   - Clicking template populates message textarea

4. **Message Composer**
   - Large textarea for custom message
   - Character limit indicator (optional)
   - Send button with paper plane icon

### Share Video Button
**Method Called:** `shareVideoProfile(profileId)`

**Modal Display:**
1. **Share Options Grid**
   - Facebook, Twitter, Instagram, WhatsApp buttons
   - Copy Link option with clipboard icon
   - Each platform shows appropriate brand icon

2. **Share Preview Card**
   - Video thumbnail preview
   - "[Name]'s Video Profile" title
   - Bio excerpt
   - View/like statistics

3. **Behavior**
   - Each platform button shows "Sharing to [Platform]..." toast
   - Copy link shows "Profile link copied to clipboard!" message
   - Modal closes automatically after successful action

### Fullscreen Video Button
**Method Called:** `expandVideo(profileId)`

**Fullscreen Modal Elements:**
1. **Header**
   - "[Name]'s Video Introduction" title
   - Close button (X)

2. **Video Player Area**
   - Large video container with gradient background
   - Centered play button overlay
   - Profile name and location overlay at bottom

3. **Action Panel**
   - Like, Message, and Share buttons
   - Same functionality as card-level buttons
   - Larger button sizing for fullscreen view

---

## 3. ADVANCED INTERACTION FEATURES

### Super Like Video
**Method Called:** `superLikeVideo(profileId)`

**Animation Sequence:**
1. **Star Burst Effect**
   - Large golden star (⭐) appears at top-center of card
   - Star scales in with bounce effect
   - Particle burst animation around star
   - Animation duration: 3 seconds

2. **Special Notification**
   - Toast: `"⭐ Super Liked [Name]'s video! They'll know you're really interested!"`
   - Different color scheme (gold) for super like toast

### Quick Actions (Hover/Touch)
**Available on Card Hover:**
- Quick like button (heart icon)
- Quick message button (message icon)  
- Save for later button (bookmark icon)

**Hover Enhancement Panel:**
- Compatibility score display
- Mutual interests emoji indicators
- Quick action buttons with tooltips

### Video Control Features
**Additional Click Behaviors:**

1. **Bookmark Video** (`bookmarkVideo()`)
   - Bookmark icon toggles fill state
   - Toast: `"Bookmarked [Name]'s video profile!"`

2. **Audio Preview** (`toggleVideoSound()`)
   - Volume icon toggles between muted/unmuted states
   - Toast: `"Audio preview for [Name]'s video"`

3. **View Full Profile** (`viewFullProfile()`)
   - Navigates to complete profile view
   - Toast: `"Opening [Name]'s full profile..."`

---

## 4. FILTER AND DISCOVERY INTERACTIONS

### Interest Tag Clicks
**Method Called:** `filterByInterest(interest)`
- Clicking interest tags filters video grid
- Shows loading state while filtering
- Updates video count and displays filtered results
- Toast: `"Filtering videos by [Interest] interest"`

### View All Interests
**Method Called:** `showAllInterests(profileId)`

**Modal Display:**
- Grid layout of all user interests
- Each interest shows emoji and name
- "Find Similar" button for each interest
- Larger, more detailed interest cards

### Location Map View
**Method Called:** `viewLocationMap(profileId)`
- Shows location on interactive map
- Displays proximity to user
- Toast: `"Showing [Name]'s location on map"`

---

## 5. VISUAL FEEDBACK SPECIFICATIONS

### Loading States
1. **Initial Video Load**
   - Skeleton loader with video icon
   - Progress bar: "Loading video profiles..."
   - "Finding the best video introductions for you" subtitle

2. **Video Processing**
   - Shimmer effect on video thumbnails
   - Placeholder play button with pulse animation

### Error Handling
1. **Failed Video Load**
   - Error icon overlay on video thumbnail
   - "Video unavailable" message
   - Retry button option

2. **Network Issues**
   - Toast: "Connection issue - please try again"
   - Automatic retry mechanism after 3 seconds

### Responsive Behavior
1. **Mobile Devices**
   - Larger touch targets for video controls
   - Swipe gestures for video navigation
   - Full-screen video prioritized on tap

2. **Desktop**
   - Hover effects on all interactive elements
   - Keyboard shortcuts for video actions
   - Right-click context menu options

---

## 6. PERFORMANCE CONSIDERATIONS

### Video Simulation
- Progress updates capped at 60fps
- Smooth CSS transitions for all animations
- Minimal DOM manipulation during playback

### Memory Management
- Remove animation elements after completion
- Clear timeouts and intervals properly
- Limit concurrent video simulations

### Accessibility
- ARIA labels for all video controls
- Keyboard navigation support
- Screen reader announcements for state changes
- Color contrast compliance for all text overlays

---

## 7. TECHNICAL IMPLEMENTATION NOTES

### Key Methods Overview
```javascript
// Primary interactions
playVideoProfile(profileId)           // Main video click
likeVideoProfile(profileId)          // Like button click
sendVideoMessage(profileId)          // Message button click
shareVideoProfile(profileId)         // Share button click
expandVideo(profileId)               // Fullscreen click

// Secondary interactions
superLikeVideo(profileId)            // Super like action
bookmarkVideo(profileId)             // Save video
toggleVideoSound(profileId)          // Audio toggle
viewFullProfile(profileId)           // Profile navigation

// Utility interactions
filterByInterest(interest)           // Interest filtering
showAllInterests(profileId)          // Interest modal
viewLocationMap(profileId)          // Map view
```

### Animation Classes
- `.video-like-heart-enhanced` - Like animation
- `.super-like-star` - Super like effect
- `.video-complete-checkmark` - Completion indicator
- `.video-match-overlay` - Match celebration

### State Management
- Video playback progress stored per profile
- Like states tracked and persisted
- Filter preferences maintained in session
- Recently viewed videos cached

This comprehensive specification ensures a rich, engaging, and intuitive video interaction experience in the ConnectHub Video Profiles section.
