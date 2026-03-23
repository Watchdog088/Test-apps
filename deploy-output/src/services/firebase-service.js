/**
 * Firebase Service
 * Quick Firebase setup for prototype backend testing
 * Includes mock data for all features and real-time functionality
 * Phase 1: Core Infrastructure
 */

import { firebaseConfig, USE_MOCK_MODE } from './firebase-config.js';

class FirebaseService {
    constructor() {
        this.mockMode = USE_MOCK_MODE;
        this.db = null;
        this.auth = null;
        this.storage = null;
        this.database = null;
        this.listeners = new Map();
        
        // Initialize mock data
        this.initializeMockData();
        
        // Initialize Firebase if not in mock mode
        if (!this.mockMode) {
            this.initializeFirebase();
        }
    }

    /**
     * Initialize Firebase SDK
     */
    async initializeFirebase() {
        try {
            // Check if Firebase SDK is loaded
            if (typeof firebase === 'undefined') {
                console.warn('Firebase SDK not loaded. Using mock mode.');
                this.mockMode = true;
                return;
            }

            // Initialize Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }

            // Get Firebase services
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            this.storage = firebase.storage();
            this.database = firebase.database();

            console.log('✓ Firebase initialized successfully');
            
            // Set up auth state listener
            this.auth.onAuthStateChanged((user) => {
                this.handleAuthStateChange(user);
            });
            
        } catch (error) {
            console.error('Firebase initialization error:', error);
            console.log('Falling back to mock mode');
            this.mockMode = true;
        }
    }

    /**
     * Initialize comprehensive mock data
     */
    initializeMockData() {
        // Check if mock data already exists
        if (localStorage.getItem('firebase_mock_initialized')) {
            return;
        }

        const mockData = {
            // User data
            currentUser: {
                uid: 'user_123',
                email: 'demo@connecthub.com',
                displayName: 'Alex Morgan',
                photoURL: 'https://i.pravatar.cc/150?img=33',
                createdAt: Date.now() - (90 * 24 * 60 * 60 * 1000), // 90 days ago
                emailVerified: true,
                premium: true,
                verified: true,
                stats: {
                    followers: 1234,
                    following: 567,
                    posts: 89,
                    friends: 234
                }
            },

            // Posts data
            posts: this.generateMockPosts(20),

            // Messages/Conversations
            conversations: this.generateMockConversations(10),

            // Friends
            friends: this.generateMockFriends(50),

            // Dating profiles
            datingProfiles: this.generateMockDatingProfiles(30),

            // Matches
            matches: this.generateMockMatches(8),

            // Stories
            stories: this.generateMockStories(15),

            // Live streams
            liveStreams: this.generateMockLiveStreams(5),

            // Groups
            groups: this.generateMockGroups(12),

            // Events
            events: this.generateMockEvents(10),

            // Notifications
            notifications: this.generateMockNotifications(25),

            // Music library
            music: this.generateMockMusic(50),

            // Playlists
            playlists: this.generateMockPlaylists(5),

            // Marketplace items
            marketplace: this.generateMockMarketplace(20),

            // Gaming data
            gaming: this.generateMockGaming(),

            // Business profiles
            businesses: this.generateMockBusinesses(10),

            // Creator content
            creatorContent: this.generateMockCreatorContent(),

            // Settings
            settings: this.getDefaultSettings()
        };

        // Store all mock data
        Object.keys(mockData).forEach(key => {
            localStorage.setItem(`firebase_${key}`, JSON.stringify(mockData[key]));
        });

        localStorage.setItem('firebase_mock_initialized', 'true');
        console.log('✓ Mock data initialized successfully');
    }

    /**
     * Generate mock posts
     */
    generateMockPosts(count) {
        const posts = [];
        const users = this.generateMockUsers(10);
        const postTypes = ['text', 'photo', 'video', 'poll', 'event'];
        
        for (let i = 0; i < count; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const type = postTypes[Math.floor(Math.random() * postTypes.length)];
            
            posts.push({
                id: `post_${i + 1}`,
                userId: user.id,
                user: user,
                type: type,
                content: this.generatePostContent(type),
                timestamp: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000),
                likes: Math.floor(Math.random() * 500),
                comments: Math.floor(Math.random() * 100),
                shares: Math.floor(Math.random() * 50),
                saved: false,
                liked: Math.random() > 0.7,
                privacy: 'public'
            });
        }
        
        return posts.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Generate post content
     */
    generatePostContent(type) {
        const contents = {
            text: [
                'Just had an amazing day! 🌟',
                'Exploring new places and making memories 📸',
                'Life is beautiful when you appreciate the little things ✨',
                'Weekend vibes are the best! 🎉',
                'Grateful for amazing friends and family ❤️'
            ],
            photo: {
                text: 'Check out this amazing view! 🌅',
                media: [`https://picsum.photos/400/300?random=${Math.random()}`]
            },
            video: {
                text: 'New video is up! 🎬',
                media: ['video_placeholder.mp4'],
                thumbnail: `https://picsum.photos/400/300?random=${Math.random()}`
            },
            poll: {
                text: 'What should I do this weekend?',
                options: ['Go hiking', 'Watch movies', 'Meet friends', 'Stay home'],
                votes: [45, 23, 67, 12]
            },
            event: {
                text: 'Join me for an amazing event!',
                eventName: 'Summer Music Festival',
                eventDate: Date.now() + (7 * 24 * 60 * 60 * 1000)
            }
        };
        
        return type === 'text' 
            ? contents.text[Math.floor(Math.random() * contents.text.length)]
            : contents[type];
    }

    /**
     * Generate mock users
     */
    generateMockUsers(count) {
        const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'Lucas'];
        const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        
        const users = [];
        for (let i = 0; i < count; i++) {
            const firstName = names[Math.floor(Math.random() * names.length)];
            const lastName = surnames[Math.floor(Math.random() * surnames.length)];
            
            users.push({
                id: `user_${i + 100}`,
                name: `${firstName} ${lastName}`,
                username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`,
                avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
                verified: Math.random() > 0.7,
                premium: Math.random() > 0.6,
                bio: 'Living my best life 🌟',
                location: 'New York, NY',
                followers: Math.floor(Math.random() * 10000),
                following: Math.floor(Math.random() * 1000)
            });
        }
        
        return users;
    }

    /**
     * Generate mock conversations
     */
    generateMockConversations(count) {
        const conversations = [];
        const users = this.generateMockUsers(count);
        
        const messages = [
            'Hey! How are you?',
            'That sounds great!',
            'Let\'s meet up soon',
            'Thanks for sharing!',
            'Can\'t wait to see you',
            'That was fun!',
            'See you later!',
            'Good morning! ☀️',
            'Have a great day!',
            'Let me know when you\'re free'
        ];
        
        for (let i = 0; i < count; i++) {
            const user = users[i];
            conversations.push({
                id: `conv_${i + 1}`,
                user: user,
                lastMessage: messages[Math.floor(Math.random() * messages.length)],
                timestamp: Date.now() - (Math.random() * 24 * 60 * 60 * 1000),
                unread: Math.random() > 0.6 ? Math.floor(Math.random() * 5) + 1 : 0,
                online: Math.random() > 0.5,
                messages: this.generateConversationMessages(20, user)
            });
        }
        
        return conversations.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Generate conversation messages
     */
    generateConversationMessages(count, otherUser) {
        const messages = [];
        const messageTexts = [
            'Hey! How are you doing?',
            'I\'m doing great, thanks!',
            'Want to grab coffee later?',
            'Sounds good to me!',
            'What time works for you?',
            'How about 3 PM?',
            'Perfect! See you then',
            'Looking forward to it!',
            'Did you see the new post?',
            'Yes! It was amazing'
        ];
        
        for (let i = 0; i < count; i++) {
            const isFromMe = Math.random() > 0.5;
            messages.push({
                id: `msg_${i + 1}`,
                text: messageTexts[Math.floor(Math.random() * messageTexts.length)],
                sender: isFromMe ? 'me' : otherUser.id,
                timestamp: Date.now() - ((count - i) * 60 * 60 * 1000),
                read: true,
                type: 'text'
            });
        }
        
        return messages;
    }

    /**
     * Generate mock friends
     */
    generateMockFriends(count) {
        const users = this.generateMockUsers(count);
        return users.map(user => ({
            ...user,
            friendship: {
                since: Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000),
                mutualFriends: Math.floor(Math.random() * 50),
                status: 'friends'
            }
        }));
    }

    /**
     * Generate mock dating profiles
     */
    generateMockDatingProfiles(count) {
        const profiles = [];
        const users = this.generateMockUsers(count);
        const interests = ['Travel', 'Music', 'Fitness', 'Cooking', 'Photography', 'Reading', 'Gaming', 'Art', 'Hiking', 'Movies'];
        const bios = [
            'Adventure seeker and coffee lover ☕',
            'Living life one day at a time 🌟',
            'Passionate about travel and photography 📸',
            'Fitness enthusiast and foodie 🏋️',
            'Music lover and concert goer 🎵',
            'Book worm and art enthusiast 📚',
            'Outdoor adventurer and nature lover 🌲',
            'Tech geek and gamer 🎮',
            'Yoga instructor and wellness advocate 🧘',
            'Chef by day, musician by night 🎸'
        ];
        
        for (let i = 0; i < count; i++) {
            const user = users[i];
            profiles.push({
                id: `profile_${i + 1}`,
                userId: user.id,
                name: user.name,
                age: 22 + Math.floor(Math.random() * 20),
                photos: [
                    `https://i.pravatar.cc/400?img=${i + 1}`,
                    `https://picsum.photos/400/500?random=${i + 1}`,
                    `https://picsum.photos/400/500?random=${i + 100}`
                ],
                bio: bios[Math.floor(Math.random() * bios.length)],
                location: 'Within 10 miles',
                distance: Math.floor(Math.random() * 20) + 1,
                interests: interests.sort(() => 0.5 - Math.random()).slice(0, 5),
                verified: Math.random() > 0.6,
                education: 'University Graduate',
                job: 'Professional',
                height: `5'${Math.floor(Math.random() * 12)}"`,
                compatibility: Math.floor(Math.random() * 40) + 60,
                lastActive: 'Active today'
            });
        }
        
        return profiles;
    }

    /**
     * Generate mock matches
     */
    generateMockMatches(count) {
        const matches = [];
        const profiles = this.generateMockDatingProfiles(count);
        
        for (let i = 0; i < count; i++) {
            matches.push({
                id: `match_${i + 1}`,
                profile: profiles[i],
                matchedAt: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000),
                messages: this.generateConversationMessages(5, profiles[i]),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
                status: 'active'
            });
        }
        
        return matches.sort((a, b) => b.matchedAt - a.matchedAt);
    }

    /**
     * Generate mock stories
     */
    generateMockStories(count) {
        const stories = [];
        const users = this.generateMockUsers(count);
        
        for (let i = 0; i < count; i++) {
            const user = users[i];
            const storyCount = Math.floor(Math.random() * 5) + 1;
            const items = [];
            
            for (let j = 0; j < storyCount; j++) {
                items.push({
                    id: `story_item_${i}_${j}`,
                    type: Math.random() > 0.5 ? 'photo' : 'video',
                    media: `https://picsum.photos/400/700?random=${i * 10 + j}`,
                    timestamp: Date.now() - (Math.random() * 24 * 60 * 60 * 1000),
                    views: Math.floor(Math.random() * 500),
                    duration: 5000
                });
            }
            
            stories.push({
                id: `story_${i + 1}`,
                user: user,
                items: items,
                seen: Math.random() > 0.6,
                timestamp: items[0].timestamp
            });
        }
        
        return stories.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Generate mock live streams
     */
    generateMockLiveStreams(count) {
        const streams = [];
        const users = this.generateMockUsers(count);
        const titles = [
            'Just chatting with you all! 💬',
            'Cooking dinner live 🍳',
            'Gaming session! Join me 🎮',
            'Q&A with followers ❓',
            'Music jam session 🎵'
        ];
        
        for (let i = 0; i < count; i++) {
            const user = users[i];
            streams.push({
                id: `stream_${i + 1}`,
                streamer: user,
                title: titles[i % titles.length],
                thumbnail: `https://picsum.photos/400/300?random=${i + 50}`,
                viewers: Math.floor(Math.random() * 5000) + 100,
                startedAt: Date.now() - (Math.random() * 2 * 60 * 60 * 1000),
                category: ['Gaming', 'Just Chatting', 'Music', 'Cooking', 'Art'][i % 5],
                isLive: true
            });
        }
        
        return streams;
    }

    /**
     * Generate mock groups
     */
    generateMockGroups(count) {
        const groups = [];
        const categories = ['Travel', 'Technology', 'Fitness', 'Food', 'Photography', 'Music', 'Art', 'Books', 'Sports', 'Gaming'];
        
        for (let i = 0; i < count; i++) {
            const category = categories[i % categories.length];
            groups.push({
                id: `group_${i + 1}`,
                name: `${category} Enthusiasts`,
                description: `A community for ${category.toLowerCase()} lovers`,
                cover: `https://picsum.photos/400/200?random=${i + 20}`,
                members: Math.floor(Math.random() * 10000) + 100,
                posts: Math.floor(Math.random() * 1000) + 50,
                category: category,
                joined: Math.random() > 0.5,
                privacy: Math.random() > 0.7 ? 'private' : 'public',
                role: Math.random() > 0.8 ? 'admin' : 'member'
            });
        }
        
        return groups;
    }

    /**
     * Generate mock events
     */
    generateMockEvents(count) {
        const events = [];
        const eventTypes = ['Concert', 'Festival', 'Meetup', 'Workshop', 'Conference', 'Party', 'Sports', 'Exhibition'];
        
        for (let i = 0; i < count; i++) {
            const type = eventTypes[i % eventTypes.length];
            const daysFromNow = Math.floor(Math.random() * 60);
            
            events.push({
                id: `event_${i + 1}`,
                title: `${type} Event ${i + 1}`,
                description: `Join us for an amazing ${type.toLowerCase()} experience!`,
                cover: `https://picsum.photos/400/200?random=${i + 30}`,
                date: Date.now() + (daysFromNow * 24 * 60 * 60 * 1000),
                location: 'New York, NY',
                host: this.generateMockUsers(1)[0],
                attendees: Math.floor(Math.random() * 500) + 50,
                interested: Math.floor(Math.random() * 1000) + 100,
                rsvp: Math.random() > 0.6 ? 'going' : 'interested',
                price: Math.random() > 0.5 ? 'Free' : `$${Math.floor(Math.random() * 50) + 10}`,
                category: type
            });
        }
        
        return events.sort((a, b) => a.date - b.date);
    }

    /**
     * Generate mock notifications
     */
    generateMockNotifications(count) {
        const notifications = [];
        const types = ['like', 'comment', 'follow', 'mention', 'share', 'match', 'message'];
        const users = this.generateMockUsers(10);
        
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const user = users[Math.floor(Math.random() * users.length)];
            
            notifications.push({
                id: `notif_${i + 1}`,
                type: type,
                user: user,
                message: this.getNotificationMessage(type, user.name),
                timestamp: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000),
                read: Math.random() > 0.4,
                link: `/post/${Math.floor(Math.random() * 100)}`
            });
        }
        
        return notifications.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Get notification message
     */
    getNotificationMessage(type, userName) {
        const messages = {
            like: `${userName} liked your post`,
            comment: `${userName} commented on your post`,
            follow: `${userName} started following you`,
            mention: `${userName} mentioned you in a post`,
            share: `${userName} shared your post`,
            match: `You have a new match with ${userName}!`,
            message: `${userName} sent you a message`
        };
        
        return messages[type] || `${userName} interacted with you`;
    }

    /**
     * Generate mock music
     */
    generateMockMusic(count) {
        const songs = [];
        const artists = ['The Weeknd', 'Drake', 'Taylor Swift', 'Ed Sheeran', 'Ariana Grande', 'Post Malone', 'Billie Eilish', 'Dua Lipa', 'Justin Bieber', 'Olivia Rodrigo'];
        const genres = ['Pop', 'Hip Hop', 'R&B', 'Rock', 'Electronic', 'Country', 'Indie', 'Jazz'];
        
        for (let i = 0; i < count; i++) {
            const artist = artists[Math.floor(Math.random() * artists.length)];
            songs.push({
                id: `song_${i + 1}`,
                title: `Song Title ${i + 1}`,
                artist: artist,
                album: `Album ${Math.floor(i / 10) + 1}`,
                duration: 180 + Math.floor(Math.random() * 120), // 3-5 minutes
                cover: `https://picsum.photos/300/300?random=${i + 200}`,
                genre: genres[Math.floor(Math.random() * genres.length)],
                plays: Math.floor(Math.random() * 1000000),
                liked: Math.random() > 0.7,
                year: 2020 + Math.floor(Math.random() * 5),
                url: `audio_${i + 1}.mp3` // Placeholder
            });
        }
        
        return songs;
    }

    /**
     * Generate mock playlists
     */
    generateMockPlaylists(count) {
        const playlists = [];
        const names = ['Workout Mix', 'Chill Vibes', 'Party Hits', 'Focus Music', 'Road Trip'];
        
        for (let i = 0; i < count; i++) {
            const songCount = Math.floor(Math.random() * 30) + 10;
            playlists.push({
                id: `playlist_${i + 1}`,
                name: names[i % names.length],
                description: `Best songs for ${names[i % names.length].toLowerCase()}`,
                cover: `https://picsum.photos/300/300?random=${i + 300}`,
                songs: songCount,
                duration: songCount * 210, // Average 3.5 minutes per song
                creator: 'me',
                public: Math.random() > 0.5,
                followers: Math.floor(Math.random() * 10000)
            });
        }
        
        return playlists;
    }

    /**
     * Generate mock marketplace
     */
    generateMockMarketplace(count) {
        const items = [];
        const categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Toys', 'Beauty', 'Automotive'];
        
        for (let i = 0; i < count; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            items.push({
                id: `item_${i + 1}`,
                title: `${category} Item ${i + 1}`,
                description: `Great ${category.toLowerCase()} item in excellent condition`,
                price: Math.floor(Math.random() * 500) + 10,
                image: `https://picsum.photos/300/300?random=${i + 400}`,
                seller: this.generateMockUsers(1)[0],
                category: category,
                condition: ['New', 'Like New', 'Good', 'Fair'][Math.floor(Math.random() * 4)],
                location: 'New York, NY',
                posted: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000),
                views: Math.floor(Math.random() * 1000),
                saved: Math.random() > 0.8
            });
        }
        
        return items.sort((a, b) => b.posted - a.posted);
    }

    /**
     * Generate mock gaming data
     */
    generateMockGaming() {
        return {
            profile: {
                level: 42,
                xp: 8945,
                nextLevel: 10000,
                wins: 156,
                losses: 78,
                winRate: 0.68,
                rank: 'Diamond',
                achievements: 45,
                totalGames: 234
            },
            games: [
                {
                    id: 'game_1',
                    name: 'Battle Royale',
                    icon: '🎮',
                    players: 2453,
                    category: 'Action',
                    rating: 4.5
                },
                {
                    id: 'game_2',
                    name: 'Word Challenge',
                    icon: '📝',
                    players: 1892,
                    category: 'Puzzle',
                    rating: 4.8
                },
                {
                    id: 'game_3',
                    name: 'Racing League',
                    icon: '🏎️',
                    players: 3421,
                    category: 'Racing',
                    rating: 4.6
                },
                {
                    id: 'game_4',
                    name: 'Strategy Empire',
                    icon: '⚔️',
                    players: 1567,
                    category: 'Strategy',
                    rating: 4.4
                }
            ],
            leaderboard: this.generateMockUsers(10).map((user, i) => ({
                ...user,
                rank: i + 1,
                score: 10000 - (i * 500),
                wins: 200 - (i * 10)
            })),
            challenges: [
                {
                    id: 'challenge_1',
                    name: 'Daily Win Streak',
                    progress: 3,
                    target: 7,
                    reward: '500 XP',
                    icon: '🔥'
                },
                {
                    id: 'challenge_2',
                    name: 'Score Master',
                    progress: 4500,
                    target: 10000,
                    reward: 'Legendary Badge',
                    icon: '⭐'
                }
            ]
        };
    }

    /**
     * Generate mock businesses
     */
    generateMockBusinesses(count) {
        const businesses = [];
        const types = ['Restaurant', 'Cafe', 'Gym', 'Salon', 'Store', 'Agency', 'Studio', 'Clinic'];
        
        for (let i = 0; i < count; i++) {
            const type = types[i % types.length];
            businesses.push({
                id: `business_${i + 1}`,
                name: `${type} ${i + 1}`,
                description: `Professional ${type.toLowerCase()} services`,
                logo: `https://i.pravatar.cc/150?img=${i + 50}`,
                cover: `https://picsum.photos/400/200?random=${i + 500}`,
                category: type,
                rating: (4 + Math.random()).toFixed(1),
                reviews: Math.floor(Math.random() * 500) + 50,
                followers: Math.floor(Math.random() * 5000) + 500,
                verified: Math.random() > 0.5,
                hours: {
                    monday: '9:00 AM - 6:00 PM',
                    tuesday: '9:00 AM - 6:00 PM',
                    wednesday: '9:00 AM - 6:00 PM',
                    thursday: '9:00 AM - 6:00 PM',
                    friday: '9:00 AM - 6:00 PM',
                    saturday: '10:00 AM - 4:00 PM',
                    sunday: 'Closed'
                },
                location: 'New York, NY',
                phone: '(555) 123-4567',
                email: `contact@${type.toLowerCase()}${i + 1}.com`
            });
        }
        
        return businesses;
    }

    /**
     * Generate mock creator content
     */
    generateMockCreatorContent() {
        return {
            profile: {
                verified: true,
                premium: true,
                followers: 245000,
                views: 1200000,
                engagement: 8.4,
                monthlyRevenue: 8900
            },
            monetization: {
                subscriptions: {
                    active: 245,
                    revenue: 3245,
                    growth: 12
                },
                donations: {
                    total: 2890,
                    count: 156,
                    topDonor: 500
                },
                sponsorships: {
                    active: 5,
                    revenue: 1800,
                    pending: 3
                },
                merchandise: {
                    products: 12,
                    sold: 89,
                    revenue: 1010
                }
            },
            content: {
                videos: 45,
                posts: 123,
                streams: 34,
                photos: 256
            },
            analytics: {
                views: [1234, 2345, 1890, 2567, 3456, 2890, 4123],
                engagement: [7.2, 8.1, 7.8, 8.5, 9.2, 8.7, 8.4],
                earnings: [6500, 7200, 7800, 8200, 8900, 9100, 8900]
            }
        };
    }

    /**
     * Get default settings
     */
    getDefaultSettings() {
        return {
            notifications: {
                push: true,
                email: true,
                sms: false,
                sounds: true,
                likes: true,
                comments: true,
                follows: true,
                mentions: true,
                messages: true,
                groupUpdates: true
            },
            privacy: {
                profileVisibility: 'public',
                whoCanMessage: 'everyone',
                whoCanSeePost: 'public',
                whoCanSeeFriends: 'friends',
                showOnlineStatus: true,
                allowTagging: true,
                allowFriendRequests: true
            },
            account: {
                language: 'en',
                timezone: 'America/New_York',
                dateFormat: 'MM/DD/YYYY',
                theme: 'auto'
            },
            security: {
                twoFactorAuth: false,
                loginAlerts: true,
                deviceManagement: true
            }
        };
    }

    /**
     * Get data from mock storage or Firebase
     */
    async getData(collection) {
        if (this.mockMode) {
            const data = localStorage.getItem(`firebase_${collection}`);
            return data ? JSON.parse(data) : null;
        }

        try {
            const snapshot = await this.db.collection(collection).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error(`Error getting ${collection}:`, error);
            return null;
        }
    }

    /**
     * Set data in mock storage or Firebase
     */
    async setData(collection, data) {
        if (this.mockMode) {
            localStorage.setItem(`firebase_${collection}`, JSON.stringify(data));
            this.notifyListeners(collection, data);
            return true;
        }

        try {
            await this.db.collection(collection).doc(data.id).set(data);
            this.notifyListeners(collection, data);
            return true;
        } catch (error) {
            console.error(`Error setting ${collection}:`, error);
            return false;
        }
    }

    /**
     * Update data in mock storage or Firebase
     */
    async updateData(collection, id, updates) {
        if (this.mockMode) {
            const data = await this.getData(collection);
            if (Array.isArray(data)) {
                const index = data.findIndex(item => item.id === id);
                if (index !== -1) {
                    data[index] = { ...data[index], ...updates };
                    await this.setData(collection, data);
                    return true;
                }
            } else if (data && data.id === id) {
                await this.setData(collection, { ...data, ...updates });
                return true;
            }
            return false;
        }

        try {
            await this.db.collection(collection).doc(id).update(updates);
            this.notifyListeners(collection, updates);
            return true;
        } catch (error) {
            console.error(`Error updating ${collection}:`, error);
            return false;
        }
    }

    /**
     * Delete data from mock storage or Firebase
     */
    async deleteData(collection, id) {
        if (this.mockMode) {
            const data = await this.getData(collection);
            if (Array.isArray(data)) {
                const filtered = data.filter(item => item.id !== id);
                await this.setData(collection, filtered);
                return true;
            }
            return false;
        }

        try {
            await this.db.collection(collection).doc(id).delete();
            this.notifyListeners(collection, { id, deleted: true });
            return true;
        } catch (error) {
            console.error(`Error deleting ${collection}:`, error);
            return false;
        }
    }

    /**
     * Add item to array in data
     */
    async addToArray(collection, id, field, item) {
        const data = await this.getData(collection);
        if (Array.isArray(data)) {
            const index = data.findIndex(d => d.id === id);
            if (index !== -1) {
                if (!Array.isArray(data[index][field])) {
                    data[index][field] = [];
                }
                data[index][field].push(item);
                await this.setData(collection, data);
                return true;
            }
        }
        return false;
    }

    /**
     * Real-time listener for data changes
     */
    onDataChange(collection, callback) {
        if (this.mockMode) {
            // Set up storage event listener for cross-tab sync
            const handler = (e) => {
                if (e.key === `firebase_${collection}` && e.newValue) {
                    callback(JSON.parse(e.newValue));
                }
            };
            window.addEventListener('storage', handler);
            
            // Store listener for cleanup
            if (!this.listeners.has(collection)) {
                this.listeners.set(collection, []);
            }
            this.listeners.get(collection).push({ callback, handler });
            
            // Return unsubscribe function
            return () => {
                window.removeEventListener('storage', handler);
                const listeners = this.listeners.get(collection);
                if (listeners) {
                    const index = listeners.findIndex(l => l.callback === callback);
                    if (index !== -1) listeners.splice(index, 1);
                }
            };
        }

        // Firebase real-time listener
        try {
            const unsubscribe = this.db.collection(collection)
                .onSnapshot((snapshot) => {
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    callback(data);
                });
            return unsubscribe;
        } catch (error) {
            console.error(`Error setting up listener for ${collection}:`, error);
            return () => {};
        }
    }

    /**
     * Notify all listeners of data change
     */
    notifyListeners(collection, data) {
        if (this.listeners.has(collection)) {
            this.listeners.get(collection).forEach(listener => {
                try {
                    listener.callback(data);
                } catch (error) {
                    console.error('Listener callback error:', error);
                }
            });
        }
    }

    /**
     * Simulate real-time update
     */
    simulateRealTimeUpdate(collection, delay = 2000) {
        setTimeout(async () => {
            const data = await this.getData(collection);
            this.notifyListeners(collection, data);
            
            // Show toast notification
            if (window.showToast) {
                window.showToast(`${collection} updated in real-time ✓`);
            }
        }, delay);
    }

    /**
     * Handle auth state change
     */
    handleAuthStateChange(user) {
        if (user) {
            console.log('User signed in:', user.email);
            // Load user data
            this.loadUserData(user.uid);
        } else {
            console.log('User signed out');
        }
    }

    /**
     * Load user data
     */
    async loadUserData(uid) {
        const userData = await this.getData('currentUser');
        if (userData && userData.uid === uid) {
            console.log('User data loaded:', userData.displayName);
        }
    }

    /**
     * Sign in user (mock)
     */
    async signIn(email, password) {
        if (this.mockMode) {
            const user = await this.getData('currentUser');
            if (user && user.email === email) {
                console.log('✓ Mock sign in successful');
                if (window.showToast) {
                    window.showToast('Signed in successfully ✓');
                }
                return { success: true, user };
            }
            return { success: false, error: 'Invalid credentials' };
        }

        try {
            const result = await this.auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Sign out user (mock)
     */
    async signOut() {
        if (this.mockMode) {
            console.log('✓ Mock sign out successful');
            if (window.showToast) {
                window.showToast('Signed out successfully');
            }
            return { success: true };
        }

        try {
            await this.auth.signOut();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get current user
     */
    async getCurrentUser() {
        if (this.mockMode) {
            return await this.getData('currentUser');
        }

        return this.auth.currentUser;
    }

    /**
     * Reset all mock data (useful for testing)
     */
    resetMockData() {
        if (this.mockMode) {
            localStorage.removeItem('firebase_mock_initialized');
            // Clear all firebase_ prefixed items
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('firebase_')) {
                    localStorage.removeItem(key);
                }
            });
            // Reinitialize
            this.initializeMockData();
            console.log('✓ Mock data reset complete');
            if (window.showToast) {
                window.showToast('Mock data reset successfully ✓');
            }
        }
    }

    /**
     * Get initialization status
     */
    isInitialized() {
        if (this.mockMode) {
            return localStorage.getItem('firebase_mock_initialized') === 'true';
        }
        return this.auth !== null && this.db !== null;
    }

    /**
     * Get service info
     */
    getInfo() {
        return {
            mode: this.mockMode ? 'MOCK' : 'FIREBASE',
            initialized: this.isInitialized(),
            collections: this.mockMode ? Object.keys(localStorage)
                .filter(key => key.startsWith('firebase_') && key !== 'firebase_mock_initialized')
                .map(key => key.replace('firebase_', '')) : [],
            listenersCount: this.listeners.size
        };
    }
}

// Create and export global instance
const firebaseService = new FirebaseService();
window.firebaseService = firebaseService;

export default firebaseService;
