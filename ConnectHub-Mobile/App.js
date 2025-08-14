import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const { width, height } = Dimensions.get('window');

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Colors
const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  accent: '#ec4899',
  success: '#10b981',
  error: '#ef4444',
};

// API Service
class APIService {
  static async request(endpoint, options = {}) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...options,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async getPosts() {
    return this.request('/posts');
  }

  static async createPost(postData) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  static async getDatingProfiles() {
    return this.request('/dating/discover');
  }

  static async getMatches() {
    return this.request('/dating/matches');
  }

  static async getMessages() {
    return this.request('/messages');
  }
}

// Auth Screen
const AuthScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await APIService.login(email, password);
      } else {
        result = await APIService.register({ name, email, password });
      }

      if (result.success) {
        await AsyncStorage.setItem('userToken', result.token);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
        navigation.replace('MainApp');
      } else {
        Alert.alert('Error', result.message || 'Authentication failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <View style={styles.authContainer}>
        <View style={styles.header}>
          <Text style={styles.logo}>💜 ConnectHub</Text>
          <Text style={styles.subtitle}>Connect, Share, Date</Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor={COLORS.textSecondary}
            />
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={COLORS.textSecondary}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={COLORS.textSecondary}
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>
              {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Home/Feed Screen
const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const result = await APIService.getPosts();
      if (result.success) {
        setPosts(result.posts || mockPosts);
      } else {
        setPosts(mockPosts);
      }
    } catch (error) {
      setPosts(mockPosts);
    }
  };

  const createPost = async () => {
    if (!newPost.trim()) return;
    
    try {
      const result = await APIService.createPost({ content: newPost });
      if (result.success) {
        setNewPost('');
        setShowCreatePost(false);
        loadPosts();
      } else {
        Alert.alert('Error', 'Failed to create post');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    }
  };

  const PostItem = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.user.name[0]}</Text>
        </View>
        <View style={styles.postInfo}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
      </View>
      
      <Text style={styles.postContent}>{item.content}</Text>
      
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} />
      )}
      
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="favorite-border" size={20} color={COLORS.accent} />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="comment" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💜 ConnectHub</Text>
        <TouchableOpacity onPress={() => setShowCreatePost(true)}>
          <Icon name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => <PostItem item={item} />}
        keyExtractor={item => item.id.toString()}
        refreshing={refreshing}
        onRefresh={loadPosts}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showCreatePost} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreatePost(false)}>
              <Icon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity onPress={createPost}>
              <Text style={styles.postButton}>Post</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.postInput}
            placeholder="What's on your mind?"
            value={newPost}
            onChangeText={setNewPost}
            multiline
            autoFocus
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// Dating Screen
const DatingScreen = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const result = await APIService.getDatingProfiles();
      if (result.success) {
        setProfiles(result.profiles || mockDatingProfiles);
      } else {
        setProfiles(mockDatingProfiles);
      }
    } catch (error) {
      setProfiles(mockDatingProfiles);
    }
  };

  const handleSwipe = (liked) => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more profiles
      Alert.alert('No more profiles', 'Check back later for new people!');
    }
  };

  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No profiles available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.datingHeader}>
        <Text style={styles.headerTitle}>💕 Discover</Text>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.profileCard}>
          <Image source={{ uri: currentProfile.photo }} style={styles.profileImage} />
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentProfile.name}, {currentProfile.age}</Text>
            <Text style={styles.profileBio}>{currentProfile.bio}</Text>
            <Text style={styles.profileDistance}>{currentProfile.distance} miles away</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.passBtn]} 
              onPress={() => handleSwipe(false)}
            >
              <Icon name="close" size={30} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.likeBtn]} 
              onPress={() => handleSwipe(true)}
            >
              <Icon name="favorite" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Messages Screen
const MessagesScreen = () => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const result = await APIService.getMessages();
      if (result.success) {
        setConversations(result.conversations || mockConversations);
      } else {
        setConversations(mockConversations);
      }
    } catch (error) {
      setConversations(mockConversations);
    }
  };

  const ConversationItem = ({ item }) => (
    <TouchableOpacity style={styles.conversationItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.user.name[0]}</Text>
      </View>
      <View style={styles.conversationInfo}>
        <Text style={styles.conversationName}>{item.user.name}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
      <View style={styles.conversationMeta}>
        <Text style={styles.messageTime}>{item.time}</Text>
        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <FlatList
        data={conversations}
        renderItem={({ item }) => <ConversationItem item={item} />}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

// Profile Screen
const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const data = await AsyncStorage.getItem('userData');
    if (data) {
      setUserData(JSON.parse(data));
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    // Navigation would be handled by parent component
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {userData?.name?.[0] || 'U'}
            </Text>
          </View>
          <Text style={styles.profileName}>{userData?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{userData?.email || 'user@example.com'}</Text>
        </View>

        <View style={styles.profileOptions}>
          <TouchableOpacity style={styles.optionItem}>
            <Icon name="person" size={24} color={COLORS.primary} />
            <Text style={styles.optionText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Icon name="settings" size={24} color={COLORS.primary} />
            <Text style={styles.optionText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Icon name="help" size={24} color={COLORS.primary} />
            <Text style={styles.optionText}>Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} onPress={handleLogout}>
            <Icon name="logout" size={24} color={COLORS.error} />
            <Text style={[styles.optionText, { color: COLORS.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Main Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Dating') {
            iconName = 'favorite';
          } else if (route.name === 'Messages') {
            iconName = 'chat';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingBottom: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Dating" component={DatingScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Main App Component
const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>ConnectHub</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainApp" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Mock Data
const mockPosts = [
  {
    id: 1,
    user: { name: 'Emma Watson', avatar: 'https://picsum.photos/50/50?random=1' },
    content: 'Just finished an amazing photography session! The golden hour lighting was absolutely perfect 📸 #photography #goldenhour',
    image: 'https://picsum.photos/400/300?random=1',
    time: '2h ago',
    likes: 124,
    comments: 18,
  },
  {
    id: 2,
    user: { name: 'John Smith', avatar: 'https://picsum.photos/50/50?random=2' },
    content: 'Beautiful sunset at the beach today. Nature never fails to amaze me! 🌅',
    image: 'https://picsum.photos/400/300?random=2',
    time: '4h ago',
    likes: 89,
    comments: 12,
  },
  {
    id: 3,
    user: { name: 'Sarah Johnson', avatar: 'https://picsum.photos/50/50?random=3' },
    content: 'Coffee and coding - perfect combination for a productive morning! ☕️💻',
    time: '6h ago',
    likes: 56,
    comments: 8,
  },
];

const mockDatingProfiles = [
  {
    id: 1,
    name: 'Alex',
    age: 28,
    bio: 'Love hiking, photography, and good coffee. Looking for someone to share adventures with!',
    photo: 'https://picsum.photos/300/400?random=10',
    distance: 3,
  },
  {
    id: 2,
    name: 'Maria',
    age: 26,
    bio: 'Artist and yoga enthusiast. Life is beautiful when you find balance 🧘‍♀️',
    photo: 'https://picsum.photos/300/400?random=11',
    distance: 5,
  },
  {
    id: 3,
    name: 'David',
    age: 30,
    bio: 'Foodie and traveler. Let\'s explore the world one dish at a time! 🍕✈️',
    photo: 'https://picsum.photos/300/400?random=12',
    distance: 7,
  },
];

const mockConversations = [
  {
    id: 1,
    user: { name: 'Alex Johnson' },
    lastMessage: 'Hey! How was your day?',
    time: '2m ago',
    unread: 2,
  },
  {
    id: 2,
    user: { name: 'Maria Garcia' },
    lastMessage: 'Thanks for the great conversation!',
    time: '1h ago',
    unread: 0,
  },
  {
    id: 3,
    user: { name: 'David Chen' },
    lastMessage: 'See you tomorrow!',
    time: '3h ago',
    unread: 1,
  },
];

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  authContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: COLORS.surface,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchText: {
    textAlign: 'center',
    color: COLORS.primary,
    fontSize: 16,
  },
  postCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  postInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  postTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  postButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  postInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    color: COLORS.text,
  },
  datingHeader: {
    padding: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileCard: {
    width: width - 40,
    height: height * 0.7,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  profileImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
  },
  profileInfo: {
    padding: 20,
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  profileDistance: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passBtn: {
    backgroundColor: COLORS.error,
  },
  likeBtn: {
    backgroundColor: COLORS.success,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.surface,
    marginBottom: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  profileOptions: {
    paddingHorizontal: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: COLORS.text,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default AppNavigator;
