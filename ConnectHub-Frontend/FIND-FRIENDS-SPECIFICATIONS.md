# Find Friends in Explore Section - UI/UX Specifications

## Overview
When users click "Find Friends" in the explore section, they should be presented with a comprehensive friend discovery interface that combines intelligent recommendations, search functionality, and social connection tools.

## What Should Be Displayed

### 1. Find Friends Dashboard Header
- **Title**: "Find Friends" with a people icon (👥)
- **Subtitle**: "Discover new connections and expand your network"
- **Quick Stats**: "X new people near you" or "X mutual friends available"
- **Action Buttons**:
  - "Import Contacts" button
  - "Invite Friends" button
  - "Search All Users" button

### 2. Friend Discovery Categories (Tabbed Interface)

#### Tab 1: "Suggested for You" (Default Active)
**Content**:
- **Personalized Recommendations** (4-6 people per row, scrollable)
  - Profile picture with online status indicator
  - Name and username
  - Mutual friends count ("3 mutual friends")
  - Common interests badges
  - Location distance ("2 miles away")
  - Reason for suggestion ("Works at TechCorp", "Lives in San Francisco")
  - Follow/Connect button
  - "X" dismiss button

#### Tab 2: "People You May Know"
**Content**:
- **Contact-Based Suggestions**
  - People from phone contacts who joined
  - Facebook/social media connections
  - Email contact matches
- **Network-Based Suggestions**
  - Friends of friends with high mutual count
  - People in same groups/communities
  - Colleagues from LinkedIn integration

#### Tab 3: "Nearby"
**Content**:
- **Location-Based Discovery**
  - People within customizable radius (1-50 miles)
  - Real-time proximity indicators
  - Check-in based suggestions
  - Event attendee connections
- **Location Settings Toggle**

#### Tab 4: "Similar Interests"
**Content**:
- **Interest-Based Matching**
  - People with shared hobbies/interests
  - Same content preferences
  - Similar followed topics/hashtags
  - Mutual group memberships

### 3. Advanced Search & Filters Section
**Search Bar**:
- Text input: "Search by name, username, or interests..."
- Voice search option
- Advanced filters toggle

**Filter Options** (Collapsible):
- **Location**: City/state input + radius slider
- **Age Range**: Min/Max age sliders
- **Interests**: Multi-select interest tags
- **Mutual Connections**: Checkbox for "Has mutual friends"
- **Online Status**: "Online now" toggle
- **Verification**: "Verified accounts only" toggle

### 4. Friend Recommendation Cards
Each person card should display:
- **Profile Photo**: 80x80px with online/offline indicator
- **Name & Username**: Full name + @username
- **Verification Badge**: Blue checkmark if verified
- **Mutual Friends**: "12 mutual friends" with mini avatars
- **Bio Preview**: First 50 characters of bio
- **Connection Reason**: "Lives nearby" / "Similar interests" / "Mutual friends"
- **Shared Interests**: 2-3 interest badges max
- **Action Buttons**:
  - Primary: "Follow" or "Send Request"
  - Secondary: "Message" (if following each other)
  - Tertiary: "..." menu (View Profile, Block, Report)

### 5. Interactive Features

#### Quick Actions Menu (3-dot menu)
- View Full Profile
- Send Message (if connection exists)
- Block User
- Report User
- Not Interested (removes from suggestions)

#### Batch Actions (Multi-select mode)
- Select multiple users
- "Follow All Selected" button
- "Skip All Selected" button

### 6. Empty/Error States
- **No Results**: "No people found matching your criteria"
- **Location Disabled**: "Enable location to find people nearby"
- **Network Error**: "Unable to load suggestions. Try again."

## What Should Happen When Clicked

### 1. Initial Load Actions
```javascript
// When "Find Friends" is clicked in explore section
1. Show loading state with skeleton cards
2. Request user's location permission (if not granted)
3. Fetch personalized recommendations from API
4. Load user's existing connections to filter out
5. Apply privacy settings and blocked users filter
6. Display "Suggested for You" tab by default
```

### 2. Friend Discovery API Calls
```javascript
// Friend recommendation algorithm should consider:
- Mutual friends (weighted heavily)
- Location proximity (if permission granted)
- Shared interests/followed topics
- Similar engagement patterns
- Contact book matches
- Social graph analysis
- Recent activity patterns
- Age range preferences
- Common groups/events
```

### 3. User Interaction Behaviors

#### Following Someone
```javascript
// When "Follow" is clicked:
1. Show loading spinner on button
2. Send follow request to API
3. Update button state to "Following" or "Requested"
4. Show success toast: "Now following [Name]" or "Request sent"
5. Add to user's following list
6. Remove from current suggestions or mark as connected
7. Update mutual friends count for related suggestions
8. Track analytics event
```

#### Dismissing Suggestions
```javascript
// When "X" is clicked on a suggestion:
1. Animate card fade out
2. Send "not interested" signal to API
3. Remove from current view
4. Update recommendation algorithm
5. Load replacement suggestion if available
```

#### Viewing Profile
```javascript
// When profile photo or name is clicked:
1. Open user profile modal/page
2. Show full profile information
3. Display mutual connections
4. Show recent posts/activity
5. Provide follow/message actions
6. Track profile view analytics
```

### 4. Search Functionality
```javascript
// When search is performed:
1. Show search loading state
2. Query API with search terms and filters
3. Display paginated results
4. Highlight matching text in results
5. Save to search history
6. Track search analytics
```

### 5. Filter Application
```javascript
// When filters are changed:
1. Update URL parameters
2. Refresh recommendations with new criteria
3. Show loading state during fetch
4. Update result count indicator
5. Save filter preferences to user settings
```

### 6. Integration Points

#### With Existing Systems
- **Search System**: Integrate with `search-ui-components.js` People tab
- **Follow System**: Use `social-missing-ui-components.js` follow functionality
- **Profile Views**: Leverage user profile modal system
- **Messaging**: Connect to messaging interface when messaging someone
- **Content Discovery**: Link with content discovery for mutual interest detection

#### Social Features
- **Import Contacts**: Phone/email contact integration
- **Social Login**: Facebook/Google friend suggestions
- **Invite System**: Send app invitations to non-users
- **Group Integration**: Suggest people from joined groups
- **Event Integration**: Suggest event attendees

### 7. Privacy & Safety Features
- **Block List**: Automatically filter out blocked users
- **Privacy Settings**: Respect user's discoverability preferences
- **Report System**: Easy reporting for inappropriate profiles
- **Data Control**: Clear explanation of how suggestions are generated
- **Opt-out Options**: Ability to disable certain suggestion types

### 8. Analytics Tracking
Track the following events:
- Find Friends section accessed
- Tab switches (Suggested, Nearby, etc.)
- Search performed
- Filter applied
- Profile viewed
- Follow action taken
- Person dismissed
- Contact import initiated
- Invite sent

### 9. Performance Considerations
- **Lazy Loading**: Load suggestions progressively
- **Caching**: Cache recommendations for quick re-access
- **Image Optimization**: Optimize profile images for fast loading
- **Infinite Scroll**: Load more suggestions as user scrolls
- **Debounced Search**: Prevent excessive API calls during typing

### 10. Mobile Responsiveness
- **Touch-Optimized**: Large tap targets for mobile
- **Swipe Gestures**: Swipe left to dismiss, right to follow
- **Card Layout**: Stack cards vertically on mobile
- **Simplified Filters**: Condensed filter interface for mobile
- **Pull-to-Refresh**: Native mobile refresh gesture support

## Implementation Priority

### Phase 1 (Core Functionality)
1. Basic friend suggestions display
2. Follow/unfollow actions
3. Search integration
4. Profile viewing

### Phase 2 (Enhanced Discovery)
1. Location-based suggestions
2. Interest-based matching
3. Advanced filtering
4. Contact import

### Phase 3 (Advanced Features)
1. Batch actions
2. Social login integration
3. Advanced analytics
4. AI-powered recommendations

This comprehensive find friends system should provide users with multiple pathways to discover and connect with new people while maintaining privacy and safety standards.
