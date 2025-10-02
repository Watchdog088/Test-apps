import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  RefreshControl,
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
  Input
} from '../components/DesignSystem';

const { width } = Dimensions.get('window');

const EnhancedHomeScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    // Mock data - replace with actual API calls
    const mockStories = [
      {
        id: 1,
        user: { name: 'Your Story', avatar: null },
        hasNewStory: false,
        isOwn: true,
      },
      {
        id: 2,
        user: { name: 'Emma', avatar: 'https://picsum.photos/60/60?random=1' },
        hasNewStory: true,
        isOwn: false,
      },
      {
        id: 3,
        user: { name: 'John', avatar: 'https://picsum.photos/60/60?random=2' },
        hasNewStory: true,
        isOwn: false,
      },
      {
        id: 4,
        user: { name: 'Sarah', avatar: 'https://picsum.photos/60/60?random=3' },
        hasNewStory: true,
        isOwn: false,
      },
      {
        id: 5,
        user: { name: 'Mike', avatar: 'https://picsum.photos/60/60?random=4' },
        hasNewStory: false,
        isOwn: false,
      },
    ];

    const mockPosts = [
      {
        id: 1,
        user: { 
          name: 'Emma Watson', 
          username: '@emma_w',
          avatar: 'https://picsum.photos/50/50?random=1',
          isVerified: true,
          isOnline: true
        },
        content: 'Just finished an amazing photography session! The golden hour lighting was absolutely perfect 📸 #photography #goldenhour #nature',
        images: [
          'https://picsum.photos/400/300?random=1',
          'https://picsum.photos/400/300?random=2'
        ],
        timestamp: '2h ago',
        location: 'Central Park, NYC',
        likes: { count: 1247, isLiked: false },
        comments: { count: 89, preview: [
          { user: 'john_doe', text: 'Amazing shots! 🔥' },
          { user: 'photo_lover', text: 'The lighting is incredible!' }
        ]},
        shares: { count: 23 },
        tags: ['photography', 'goldenhour', 'nature'],
        type: 'photo',
      },
      {
        id: 2,
        user: { 
          name: 'John Smith', 
          username: '@john_smith',
          avatar: 'https://picsum.photos/50/50?random=2',
          isVerified: false,
          isOnline: false
        },
        content: 'Beautiful sunset at the beach today. Nature never fails to amaze me! 🌅\n\nFeeling grateful for moments like these.',
        images: ['https://picsum.photos/400/300?random=3'],
        timestamp: '4h ago',
        location: 'Malibu Beach',
        likes: { count: 892, isLiked: true },
        comments: { count: 67, preview: [
          { user: 'beach_lover', text: 'Stunning view! 😍' }
        ]},
        shares: { count: 12 },
        tags: ['sunset', 'beach', 'nature'],
        type: 'photo',
      },
      {
        id: 3,
        user: { 
          name: 'Sarah Johnson', 
          username: '@sarah_codes',
          avatar: 'https://picsum.photos/50/50?random=3',
          isVerified: true,
          isOnline: true
        },
        content: 'Coffee and coding - perfect combination for a productive morning! ☕️💻\n\nWorking on some exciting new features for our app. Can\'t wait to share them with you all!',
        images: [],
        timestamp: '6h ago',
        location: 'San Francisco',
        likes: { count: 456, isLiked: false },
        comments: { count: 34, preview: [
          { user: 'dev_guru', text: 'Keep up the great work!' },
          { user: 'coffee_addict', text: 'What\'s your go-to coffee? ☕' }
        ]},
        shares: { count: 8 },
        tags: ['coding', 'productivity', 'coffee'],
        type: 'text',
      }
    ];

    setStories(mockStories);
    setPosts(mockPosts);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContent();
    setRefreshing(false);
  };

  const toggleSearch = () => {
    const toValue = searchVisible ? 0 : 1;
    setSearchVisible(!searchVisible);
    
    Animated.spring(searchAnimation, {
      toValue,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleLike = (postId) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              likes: {
                ...post.likes,
                isLiked: !post.likes.isLiked,
                count: post.likes.isLiked 
                  ? post.likes.count - 1 
                  : post.likes.count + 1
              }
            }
          : post
      )
    );
  };

  const StoryItem = ({ item }) => (
    <TouchableOpacity style={styles.storyItem}>
      <View style={[
        styles.storyBorder,
        item.hasNewStory && styles.storyBorderActive,
        item.isOwn && styles.storyBorderOwn
      ]}>
        <Avatar 
          source={item.user.avatar ? { uri: item.user.avatar } : null}
          name={item.user.name}
          size="large"
          showOnlineIndicator={false}
        />
        {item.isOwn && (
          <View style={styles.addStoryButton}>
            <Icon name="add" size={16} color={COLORS.textOnPrimary} />
          </View>
        )}
      </View>
      <Text style={styles.storyUsername} numberOfLines={1}>
        {item.isOwn ? 'Your Story' : item.user.name}
      </Text>
    </TouchableOpacity>
  );

  const PostHeader = ({ user, timestamp, location }) => (
    <View style={styles.postHeader}>
      <Avatar 
        source={user.avatar ? { uri: user.avatar } : null}
        name={user.name}
        showOnlineIndicator={true}
        isOnline={user.isOnline}
      />
      <View style={styles.postUserInfo}>
        <View style={styles.userNameRow}>
          <Text style={styles.postUserName}>{user.name}</Text>
          {user.isVerified && (
            <Icon name="verified" size={16} color={COLORS.primary} style={styles.verifiedIcon} />
          )}
        </View>
        <Text style={styles.postUsername}>{user.username}</Text>
        <View style={styles.postMetaRow}>
          <Text style={styles.postTimestamp}>{timestamp}</Text>
          {location && (
            <>
              <Text style={styles.postMetaDot}>•</Text>
              <Icon name="location-on" size={12} color={COLORS.textTertiary} />
              <Text style={styles.postLocation}>{location}</Text>
            </>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.postMenuButton}>
        <Icon name="more-vert" size={24} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const PostContent = ({ content, images, tags }) => (
    <View style={styles.postContent}>
      <Text style={styles.postText}>{content}</Text>
      
      {images && images.length > 0 && (
        <View style={styles.postImagesContainer}>
          {images.length === 1 ? (
            <Image source={{ uri: images[0] }} style={styles.postImageSingle} />
          ) : (
            <View style={styles.postImagesGrid}>
              {images.map((image, index) => (
                <Image 
                  key={index}
                  source={{ uri: image }} 
                  style={[
                    styles.postImageGrid,
                    { width: (width - SPACING.md * 3) / 2 }
                  ]} 
                />
              ))}
            </View>
          )}
        </View>
      )}

      {tags && tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <Badge 
              key={index}
              text={`#${tag}`}
              variant="secondary"
              size="small"
              style={styles.tagBadge}
            />
          ))}
        </View>
      )}
    </View>
  );

  const PostActions = ({ post }) => (
    <View style={styles.postActions}>
      <View style={styles.postActionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(post.id)}
        >
          <Icon 
            name={post.likes.isLiked ? "favorite" : "favorite-border"} 
            size={24} 
            color={post.likes.isLiked ? COLORS.like : COLORS.textSecondary} 
          />
          <Text style={[
            styles.actionText,
            post.likes.isLiked && { color: COLORS.like }
          ]}>
            {post.likes.count}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="chat-bubble-outline" size={24} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>{post.comments.count}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share" size={24} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>{post.shares.count}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.bookmarkButton}>
        <Icon name="bookmark-border" size={24} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const PostItem = ({ item }) => (
    <Card style={styles.postCard} shadow={true}>
      <PostHeader 
        user={item.user}
        timestamp={item.timestamp}
        location={item.location}
      />
      <PostContent 
        content={item.content}
        images={item.images}
        tags={item.tags}
      />
      <PostActions post={item} />
      
      {item.comments.preview && item.comments.preview.length > 0 && (
        <View style={styles.commentsPreview}>
          {item.comments.preview.map((comment, index) => (
            <View key={index} style={styles.commentPreview}>
              <Text style={styles.commentUser}>{comment.user}</Text>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))}
          <TouchableOpacity>
            <Text style={styles.viewAllComments}>
              View all {item.comments.count} comments
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  const searchBarHeight = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });

  const searchBarOpacity = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.surface} barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💜 Lynk</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleSearch} style={styles.headerButton}>
            <Icon name="search" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="notifications-none" size={24} color={COLORS.textPrimary} />
            <Badge 
              text="3" 
              variant="error" 
              size="small" 
              style={styles.notificationBadge} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="chat-bubble-outline" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <Animated.View style={[
        styles.searchContainer,
        { 
          height: searchBarHeight,
          opacity: searchBarOpacity,
        }
      ]}>
        <Input
          placeholder="Search posts, people, or topics..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon="search"
          style={styles.searchInput}
        />
      </Animated.View>

      {/* Content */}
      <FlatList
        data={[{ type: 'stories' }, ...posts]}
        keyExtractor={(item, index) => item.type === 'stories' ? 'stories' : item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        renderItem={({ item }) => {
          if (item.type === 'stories') {
            return (
              <View style={styles.storiesContainer}>
                <FlatList
                  data={stories}
                  keyExtractor={(story) => story.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => <StoryItem item={item} />}
                  contentContainerStyle={styles.storiesList}
                />
              </View>
            );
          }
          return <PostItem item={item} />;
        }}
        ListFooterComponent={<View style={{ height: SPACING.xxl }} />}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Icon name="add" size={24} color={COLORS.textOnPrimary} />
      </TouchableOpacity>
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
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.xs,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  searchContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    marginBottom: 0,
  },
  storiesContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  storiesList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 70,
  },
  storyBorder: {
    padding: 2,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
    position: 'relative',
  },
  storyBorderActive: {
    borderColor: COLORS.accent,
  },
  storyBorderOwn: {
    borderColor: COLORS.textTertiary,
  },
  addStoryButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  storyUsername: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  postCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: 0,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  postUserInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postUserName: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.textPrimary,
  },
  verifiedIcon: {
    marginLeft: SPACING.xs,
  },
  postUsername: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textTertiary,
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  postTimestamp: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  postMetaDot: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginHorizontal: SPACING.xs,
  },
  postLocation: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  postMenuButton: {
    padding: SPACING.xs,
  },
  postContent: {
    paddingHorizontal: SPACING.md,
  },
  postText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  postImagesContainer: {
    marginBottom: SPACING.sm,
  },
  postImageSingle: {
    width: '100%',
    height: 250,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundDark,
  },
  postImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  postImageGrid: {
    height: 150,
    marginHorizontal: SPACING.xs,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundDark,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  tagBadge: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  postActionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
    padding: SPACING.xs,
  },
  actionText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  bookmarkButton: {
    padding: SPACING.xs,
  },
  commentsPreview: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  commentPreview: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  commentUser: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
  },
  commentText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
  },
  viewAllComments: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.large,
  },
};

export default EnhancedHomeScreen;
