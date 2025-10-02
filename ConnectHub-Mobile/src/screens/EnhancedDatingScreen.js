import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  PanGestureHandler,
  Animated,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  RADIUS, 
  SHADOWS,
  Button,
  Avatar,
  Card,
  Badge,
  Divider
} from '../components/DesignSystem';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = height * 0.75;

const EnhancedDatingScreen = ({ navigation }) => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [matches, setMatches] = useState(0);
  const [likes, setLikes] = useState(0);
  const [cardPosition] = useState(new Animated.ValueXY());
  const [cardRotation] = useState(new Animated.Value(0));
  const [nextCardScale] = useState(new Animated.Value(0.9));
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [lastMatchedUser, setLastMatchedUser] = useState(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const mockProfiles = [
      {
        id: 1,
        name: 'Alexandra',
        age: 28,
        distance: 2,
        bio: 'Adventure seeker 🏔️ | Coffee enthusiast ☕ | Dog lover 🐕\n\nLooking for someone to explore the world with! I love hiking, trying new restaurants, and weekend getaways.',
        location: 'New York, NY',
        education: 'Columbia University',
        job: 'Marketing Manager',
        photos: [
          'https://picsum.photos/400/600?random=10',
          'https://picsum.photos/400/600?random=11',
          'https://picsum.photos/400/600?random=12',
          'https://picsum.photos/400/600?random=13'
        ],
        interests: ['Travel', 'Photography', 'Hiking', 'Coffee', 'Dogs'],
        isVerified: true,
        zodiacSign: 'Leo',
        height: '5\'7"',
        lastActive: 'Active now',
        mutualFriends: 3,
        mutualInterests: 5,
      },
      {
        id: 2,
        name: 'Maria',
        age: 26,
        distance: 5,
        bio: 'Yoga instructor 🧘‍♀️ | Artist 🎨 | Foodie 🍜\n\nLife is beautiful when you find balance. Love creating art, practicing yoga, and discovering amazing food spots.',
        location: 'Brooklyn, NY',
        education: 'Parsons School of Design',
        job: 'Yoga Instructor & Artist',
        photos: [
          'https://picsum.photos/400/600?random=20',
          'https://picsum.photos/400/600?random=21',
          'https://picsum.photos/400/600?random=22'
        ],
        interests: ['Yoga', 'Art', 'Meditation', 'Cooking', 'Nature'],
        isVerified: false,
        zodiacSign: 'Virgo',
        height: '5\'5"',
        lastActive: '2 hours ago',
        mutualFriends: 1,
        mutualInterests: 3,
      },
      {
        id: 3,
        name: 'David',
        age: 30,
        distance: 7,
        bio: 'Chef & traveler 👨‍🍳✈️ | Foodie at heart ❤️\n\nLet\'s explore the world one dish at a time! I love cooking, traveling, and sharing great conversations over amazing meals.',
        location: 'Manhattan, NY',
        education: 'Culinary Institute of America',
        job: 'Head Chef',
        photos: [
          'https://picsum.photos/400/600?random=30',
          'https://picsum.photos/400/600?random=31',
          'https://picsum.photos/400/600?random=32',
          'https://picsum.photos/400/600?random=33',
          'https://picsum.photos/400/600?random=34'
        ],
        interests: ['Cooking', 'Travel', 'Wine', 'Music', 'Reading'],
        isVerified: true,
        zodiacSign: 'Taurus',
        height: '6\'1"',
        lastActive: 'Active now',
        mutualFriends: 7,
        mutualInterests: 4,
      }
    ];

    setProfiles(mockProfiles);
  };

  const handleSwipe = (direction, profile) => {
    const isLike = direction === 'right';
    
    if (isLike) {
      setLikes(prev => prev + 1);
      // Simulate match probability (30% chance)
      if (Math.random() > 0.7) {
        setMatches(prev => prev + 1);
        setLastMatchedUser(profile);
        setTimeout(() => setShowMatchModal(true), 500);
      }
    }

    // Animate card out
    Animated.parallel([
      Animated.timing(cardPosition, {
        toValue: { x: direction === 'right' ? width : -width, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(cardRotation, {
        toValue: direction === 'right' ? 1 : -1,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start(() => {
      // Move to next card
      setCurrentIndex(prev => prev + 1);
      
      // Reset animations
      cardPosition.setValue({ x: 0, y: 0 });
      cardRotation.setValue(0);
      
      // Scale up next card
      Animated.spring(nextCardScale, {
        toValue: 1,
        useNativeDriver: false,
      }).start(() => {
        nextCardScale.setValue(0.9);
      });
    });
  };

  const handleManualSwipe = (direction) => {
    const currentProfile = profiles[currentIndex];
    if (currentProfile) {
      handleSwipe(direction, currentProfile);
    }
  };

  const ProfileCard = ({ profile, index, isActive }) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showDetails, setShowDetails] = useState(false);

    if (!profile) return null;

    const cardStyle = isActive
      ? {
          transform: [
            { translateX: cardPosition.x },
            { translateY: cardPosition.y },
            {
              rotate: cardRotation.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: ['-30deg', '0deg', '30deg'],
              }),
            },
          ],
        }
      : {
          transform: [{ scale: nextCardScale }],
          zIndex: -1,
        };

    return (
      <Animated.View style={[styles.cardContainer, cardStyle]}>
        <Card style={styles.profileCard} padding={false} shadow={true}>
          {/* Photo Section */}
          <View style={styles.photoContainer}>
            <Image 
              source={{ uri: profile.photos[currentPhotoIndex] }} 
              style={styles.profilePhoto}
            />
            
            {/* Photo Indicators */}
            {profile.photos.length > 1 && (
              <View style={styles.photoIndicators}>
                {profile.photos.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.photoIndicator,
                      idx === currentPhotoIndex && styles.photoIndicatorActive
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Photo Navigation */}
            <TouchableOpacity
              style={[styles.photoNavigation, styles.photoNavLeft]}
              onPress={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
              disabled={currentPhotoIndex === 0}
            />
            <TouchableOpacity
              style={[styles.photoNavigation, styles.photoNavRight]}
              onPress={() => setCurrentPhotoIndex(Math.min(profile.photos.length - 1, currentPhotoIndex + 1))}
              disabled={currentPhotoIndex === profile.photos.length - 1}
            />

            {/* Status Indicators */}
            <View style={styles.statusIndicators}>
              {profile.isVerified && (
                <Badge text="✓ Verified" variant="primary" size="small" />
              )}
              <Badge text={profile.lastActive} variant="success" size="small" />
            </View>

            {/* Gradient Overlay */}
            <View style={styles.gradientOverlay} />
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <View style={styles.profileHeader}>
              <View style={styles.nameSection}>
                <View style={styles.nameRow}>
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Text style={styles.profileAge}>{profile.age}</Text>
                </View>
                <View style={styles.locationRow}>
                  <Icon name="location-on" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.profileDistance}>{profile.distance} miles away</Text>
                </View>
                <Text style={styles.profileLocation}>{profile.location}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.detailsButton}
                onPress={() => setShowDetails(!showDetails)}
              >
                <Icon 
                  name={showDetails ? "keyboard-arrow-up" : "info-outline"} 
                  size={24} 
                  color={COLORS.primary} 
                />
              </TouchableOpacity>
            </View>

            {/* Bio */}
            <Text style={styles.profileBio} numberOfLines={showDetails ? undefined : 3}>
              {profile.bio}
            </Text>

            {/* Details Section */}
            {showDetails && (
              <View style={styles.detailsSection}>
                <Divider style={styles.divider} />
                
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Icon name="school" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>{profile.education}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="work" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>{profile.job}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="height" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>{profile.height}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="stars" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>{profile.zodiacSign}</Text>
                  </View>
                </View>

                {/* Interests */}
                <View style={styles.interestsSection}>
                  <Text style={styles.sectionTitle}>Interests</Text>
                  <View style={styles.interestsTags}>
                    {profile.interests.map((interest, idx) => (
                      <Badge 
                        key={idx}
                        text={interest}
                        variant="secondary"
                        size="small"
                        style={styles.interestTag}
                      />
                    ))}
                  </View>
                </View>

                {/* Mutual Connections */}
                {(profile.mutualFriends > 0 || profile.mutualInterests > 0) && (
                  <View style={styles.mutualSection}>
                    <Text style={styles.sectionTitle}>You have in common</Text>
                    <View style={styles.mutualStats}>
                      {profile.mutualFriends > 0 && (
                        <View style={styles.mutualStat}>
                          <Icon name="people" size={16} color={COLORS.primary} />
                          <Text style={styles.mutualText}>{profile.mutualFriends} mutual friends</Text>
                        </View>
                      )}
                      {profile.mutualInterests > 0 && (
                        <View style={styles.mutualStat}>
                          <Icon name="favorite" size={16} color={COLORS.primary} />
                          <Text style={styles.mutualText}>{profile.mutualInterests} shared interests</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </Card>
      </Animated.View>
    );
  };

  const MatchModal = () => (
    <Modal
      visible={showMatchModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowMatchModal(false)}
    >
      <View style={styles.matchModalOverlay}>
        <View style={styles.matchModalContent}>
          <View style={styles.matchHeader}>
            <Text style={styles.matchTitle}>It's a Match! 🎉</Text>
            <Text style={styles.matchSubtitle}>You and {lastMatchedUser?.name} liked each other</Text>
          </View>
          
          <View style={styles.matchAvatars}>
            <Avatar size="xlarge" name="You" style={styles.matchAvatar} />
            <Icon name="favorite" size={32} color={COLORS.accent} style={styles.heartIcon} />
            <Avatar 
              source={{ uri: lastMatchedUser?.photos[0] }} 
              size="xlarge" 
              style={styles.matchAvatar} 
            />
          </View>

          <View style={styles.matchActions}>
            <Button
              title="Send Message"
              variant="primary"
              size="large"
              fullWidth
              onPress={() => {
                setShowMatchModal(false);
                // Navigate to chat
              }}
              style={styles.matchButton}
            />
            <Button
              title="Keep Swiping"
              variant="ghost"
              size="large"
              fullWidth
              onPress={() => setShowMatchModal(false)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  if (!currentProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="favorite-border" size={64} color={COLORS.textTertiary} />
          <Text style={styles.emptyTitle}>No more profiles</Text>
          <Text style={styles.emptySubtitle}>Check back later for new people to discover!</Text>
          <Button
            title="Adjust Filters"
            variant="primary"
            onPress={() => setShowFilters(true)}
            style={styles.emptyButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>💕 Discover</Text>
        
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <Icon name="tune" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{matches}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{likes}</Text>
          <Text style={styles.statLabel}>Likes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profiles.length - currentIndex}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>

      {/* Cards Stack */}
      <View style={styles.cardsContainer}>
        {nextProfile && (
          <ProfileCard profile={nextProfile} index={currentIndex + 1} isActive={false} />
        )}
        <ProfileCard profile={currentProfile} index={currentIndex} isActive={true} />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handleManualSwipe('left')}
        >
          <Icon name="close" size={32} color={COLORS.textOnPrimary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.superLikeButton]}
        >
          <Icon name="star" size={24} color={COLORS.textOnPrimary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleManualSwipe('right')}
        >
          <Icon name="favorite" size={32} color={COLORS.textOnPrimary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.boostButton]}
        >
          <Icon name="flash-on" size={24} color={COLORS.textOnPrimary} />
        </TouchableOpacity>
      </View>

      {/* Match Modal */}
      <MatchModal />
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.small,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  profileCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  photoContainer: {
    flex: 1,
    position: 'relative',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.backgroundDark,
  },
  photoIndicators: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  photoIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 2,
  },
  photoIndicatorActive: {
    backgroundColor: COLORS.textOnPrimary,
  },
  photoNavigation: {
    position: 'absolute',
    top: 0,
    bottom: '30%',
    width: '50%',
  },
  photoNavLeft: {
    left: 0,
  },
  photoNavRight: {
    right: 0,
  },
  statusIndicators: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    alignItems: 'flex-end',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
  },
  profileInfo: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  nameSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  profileName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  profileAge: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  profileDistance: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  profileLocation: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textTertiary,
  },
  detailsButton: {
    padding: SPACING.xs,
  },
  profileBio: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  detailsSection: {
    marginTop: SPACING.sm,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  detailsGrid: {
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  interestsSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  interestsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  mutualSection: {
    marginTop: SPACING.sm,
  },
  mutualStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mutualStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginBottom: SPACING.xs,
  },
  mutualText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    marginLeft: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.sm,
    ...SHADOWS.medium,
  },
  passButton: {
    backgroundColor: COLORS.error,
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  superLikeButton: {
    backgroundColor: COLORS.superLike,
  },
  likeButton: {
    backgroundColor: COLORS.success,
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  boostButton: {
    backgroundColor: COLORS.accent,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    width: 200,
  },
  // Match Modal Styles
  matchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    margin: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.large,
  },
  matchHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  matchTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.accent,
    marginBottom: SPACING.sm,
  },
  matchSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  matchAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  matchAvatar: {
    marginHorizontal: SPACING.md,
  },
  heartIcon: {
    marginHorizontal: SPACING.md,
  },
  matchActions: {
    width: '100%',
  },
  matchButton: {
    marginBottom: SPACING.md,
  },
};

export default EnhancedDatingScreen;
