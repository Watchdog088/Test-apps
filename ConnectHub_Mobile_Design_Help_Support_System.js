/**
 * ConnectHub Mobile Design - Help & Support System
 * Complete implementation of help and support features
 */

class HelpSupportSystem {
    constructor() {
        this.tickets = [];
        this.chatHistory = [];
        this.faqDatabase = [];
        this.helpArticles = [];
        this.videoTutorials = [];
        this.supportHistory = [];
        this.knowledgeBase = [];
        this.liveAgents = [];
        this.aiResponses = {};
        
        this.init();
    }

    init() {
        console.log('🎯 Initializing Help & Support System...');
        this.loadFAQDatabase();
        this.loadHelpArticles();
        this.loadVideoTutorials();
        this.loadKnowledgeBase();
        this.initAIAssistant();
        this.loadSupportHistory();
        console.log('✅ Help & Support System initialized');
    }

    // ==================== FAQ DATABASE ====================
    loadFAQDatabase() {
        this.faqDatabase = [
            {
                id: 'faq_001',
                category: 'Account',
                question: 'How do I reset my password?',
                answer: 'Go to Settings > Account Security > Change Password. You can also use "Forgot Password" on the login screen.',
                views: 5420,
                helpful: 4891,
                tags: ['password', 'security', 'account'],
                relatedArticles: ['help_001', 'help_002'],
                lastUpdated: '2024-01-15'
            },
            {
                id: 'faq_002',
                category: 'Account',
                question: 'How do I delete my account?',
                answer: 'Navigate to Settings > Account Management > Delete Account. Note: This action is permanent and cannot be undone. All your data will be deleted within 30 days.',
                views: 3210,
                helpful: 2845,
                tags: ['account', 'deletion', 'privacy'],
                relatedArticles: ['help_003'],
                lastUpdated: '2024-01-10'
            },
            {
                id: 'faq_003',
                category: 'Privacy',
                question: 'How do I control who can see my posts?',
                answer: 'Go to Settings > Privacy > Post Visibility. You can choose Public, Friends Only, or Custom audience for each post.',
                views: 8920,
                helpful: 8201,
                tags: ['privacy', 'posts', 'visibility'],
                relatedArticles: ['help_004', 'help_005'],
                lastUpdated: '2024-01-18'
            },
            {
                id: 'faq_004',
                category: 'Features',
                question: 'How do I go live?',
                answer: 'Tap the + button in the navigation bar, select "Go Live", set your stream title and privacy settings, then tap "Start Live Stream".',
                views: 12450,
                helpful: 11823,
                tags: ['streaming', 'live', 'features'],
                relatedArticles: ['help_006', 'help_007'],
                lastUpdated: '2024-01-20'
            },
            {
                id: 'faq_005',
                category: 'Dating',
                question: 'How does the matching algorithm work?',
                answer: 'Our AI-powered algorithm considers your interests, location, activity patterns, and preferences to suggest compatible matches. The more you use the app, the better the suggestions become.',
                views: 9870,
                helpful: 8956,
                tags: ['dating', 'matching', 'algorithm'],
                relatedArticles: ['help_008', 'help_009'],
                lastUpdated: '2024-01-19'
            },
            {
                id: 'faq_006',
                category: 'Premium',
                question: 'What are the benefits of Premium?',
                answer: 'Premium includes: unlimited likes, see who liked you, priority support, advanced filters, read receipts, verified badge, and ad-free experience.',
                views: 15320,
                helpful: 14102,
                tags: ['premium', 'subscription', 'features'],
                relatedArticles: ['help_010', 'help_011'],
                lastUpdated: '2024-01-21'
            },
            {
                id: 'faq_007',
                category: 'Troubleshooting',
                question: 'Why are my messages not sending?',
                answer: 'Check your internet connection, ensure the app is updated, and verify you haven\'t been blocked. If issues persist, try logging out and back in.',
                views: 6543,
                helpful: 5432,
                tags: ['messages', 'troubleshooting', 'technical'],
                relatedArticles: ['help_012'],
                lastUpdated: '2024-01-17'
            },
            {
                id: 'faq_008',
                category: 'Safety',
                question: 'How do I report inappropriate content?',
                answer: 'Tap the three dots on any post, profile, or message, select "Report", choose a reason, and provide details. Our team reviews reports within 24 hours.',
                views: 4321,
                helpful: 4102,
                tags: ['safety', 'report', 'moderation'],
                relatedArticles: ['help_013', 'help_014'],
                lastUpdated: '2024-01-16'
            },
            {
                id: 'faq_009',
                category: 'Features',
                question: 'How do I create a group?',
                answer: 'Go to Groups tab, tap "Create Group", add name, description, category, and privacy settings. Invite members to join.',
                views: 7654,
                helpful: 7123,
                tags: ['groups', 'community', 'features'],
                relatedArticles: ['help_015'],
                lastUpdated: '2024-01-14'
            },
            {
                id: 'faq_010',
                category: 'Gaming',
                question: 'How do achievements work?',
                answer: 'Complete specific tasks and milestones to unlock achievements. Each achievement earns you XP and badges that display on your profile.',
                views: 5432,
                helpful: 4987,
                tags: ['gaming', 'achievements', 'gamification'],
                relatedArticles: ['help_016'],
                lastUpdated: '2024-01-13'
            }
        ];
        console.log(`✓ Loaded ${this.faqDatabase.length} FAQ entries`);
    }

    // ==================== HELP ARTICLES ====================
    loadHelpArticles() {
        this.helpArticles = [
            {
                id: 'help_001',
                title: 'Getting Started with ConnectHub',
                category: 'Basics',
                content: `
                    <h3>Welcome to ConnectHub!</h3>
                    <p>This guide will help you get started with your new account.</p>
                    
                    <h4>Step 1: Complete Your Profile</h4>
                    <p>Add a profile picture, bio, and interests to help others discover you.</p>
                    
                    <h4>Step 2: Connect with Friends</h4>
                    <p>Use the Find Friends feature to discover people you know.</p>
                    
                    <h4>Step 3: Explore Features</h4>
                    <p>Try posting, going live, joining groups, and exploring dating features.</p>
                `,
                views: 23400,
                helpful: 21234,
                readTime: '5 min',
                lastUpdated: '2024-01-20',
                author: 'ConnectHub Team',
                tags: ['beginner', 'setup', 'basics']
            },
            {
                id: 'help_002',
                title: 'Account Security Best Practices',
                category: 'Security',
                content: `
                    <h3>Keep Your Account Secure</h3>
                    <p>Follow these tips to protect your ConnectHub account.</p>
                    
                    <h4>Use a Strong Password</h4>
                    <p>Choose a password with at least 12 characters, including uppercase, lowercase, numbers, and symbols.</p>
                    
                    <h4>Enable Two-Factor Authentication</h4>
                    <p>Add an extra layer of security to your account.</p>
                    
                    <h4>Review Login Activity</h4>
                    <p>Check Settings > Security > Active Sessions regularly.</p>
                `,
                views: 18900,
                helpful: 17654,
                readTime: '4 min',
                lastUpdated: '2024-01-19',
                author: 'Security Team',
                tags: ['security', 'password', '2fa']
            },
            {
                id: 'help_003',
                title: 'Privacy Settings Guide',
                category: 'Privacy',
                content: `
                    <h3>Control Your Privacy</h3>
                    <p>Customize who can see your content and contact you.</p>
                    
                    <h4>Profile Privacy</h4>
                    <p>Choose who can view your profile: Everyone, Friends, or Custom.</p>
                    
                    <h4>Post Visibility</h4>
                    <p>Set default audience for your posts or customize each one.</p>
                    
                    <h4>Location Settings</h4>
                    <p>Control when and how your location is shared.</p>
                `,
                views: 16543,
                helpful: 15234,
                readTime: '6 min',
                lastUpdated: '2024-01-18',
                author: 'Privacy Team',
                tags: ['privacy', 'settings', 'control']
            },
            {
                id: 'help_004',
                title: 'Live Streaming Guide',
                category: 'Features',
                content: `
                    <h3>Start Your First Live Stream</h3>
                    <p>Learn how to go live and engage with your audience.</p>
                    
                    <h4>Setting Up Your Stream</h4>
                    <p>Choose your camera, microphone, and stream quality settings.</p>
                    
                    <h4>During Your Stream</h4>
                    <p>Interact with viewers, manage comments, and monitor metrics.</p>
                    
                    <h4>After Your Stream</h4>
                    <p>Review analytics, save highlights, and respond to feedback.</p>
                `,
                views: 34567,
                helpful: 32145,
                readTime: '8 min',
                lastUpdated: '2024-01-21',
                author: 'Creator Team',
                tags: ['streaming', 'live', 'creator']
            },
            {
                id: 'help_005',
                title: 'Dating Feature Overview',
                category: 'Dating',
                content: `
                    <h3>Find Your Perfect Match</h3>
                    <p>Discover how ConnectHub Dating can help you meet someone special.</p>
                    
                    <h4>Creating Your Dating Profile</h4>
                    <p>Add photos, answer prompts, and set your preferences.</p>
                    
                    <h4>Swiping and Matching</h4>
                    <p>Swipe right to like, left to pass. When both like each other, it's a match!</p>
                    
                    <h4>Starting Conversations</h4>
                    <p>Break the ice with thoughtful messages and use video dates.</p>
                `,
                views: 28900,
                helpful: 26543,
                readTime: '7 min',
                lastUpdated: '2024-01-20',
                author: 'Dating Team',
                tags: ['dating', 'matching', 'relationships']
            }
        ];
        console.log(`✓ Loaded ${this.helpArticles.length} help articles`);
    }

    // ==================== VIDEO TUTORIALS ====================
    loadVideoTutorials() {
        this.videoTutorials = [
            {
                id: 'video_001',
                title: 'Getting Started with ConnectHub',
                description: 'A complete walkthrough for new users',
                thumbnail: '🎬',
                duration: '5:32',
                views: 45600,
                category: 'Basics',
                difficulty: 'Beginner',
                url: '#video-tutorial-1',
                topics: ['Setup', 'Profile', 'Navigation'],
                uploadDate: '2024-01-15'
            },
            {
                id: 'video_002',
                title: 'How to Go Live',
                description: 'Learn to start your first live stream',
                thumbnail: '📹',
                duration: '8:45',
                views: 67890,
                category: 'Features',
                difficulty: 'Intermediate',
                url: '#video-tutorial-2',
                topics: ['Streaming', 'Settings', 'Engagement'],
                uploadDate: '2024-01-18'
            },
            {
                id: 'video_003',
                title: 'Creating Engaging Stories',
                description: 'Tips for creating stories that get views',
                thumbnail: '📱',
                duration: '6:20',
                views: 34500,
                category: 'Features',
                difficulty: 'Beginner',
                url: '#video-tutorial-3',
                topics: ['Stories', 'Content', 'Engagement'],
                uploadDate: '2024-01-19'
            },
            {
                id: 'video_004',
                title: 'Dating Profile Optimization',
                description: 'Create a profile that gets matches',
                thumbnail: '💕',
                duration: '10:15',
                views: 89000,
                category: 'Dating',
                difficulty: 'Intermediate',
                url: '#video-tutorial-4',
                topics: ['Dating', 'Profile', 'Photos'],
                uploadDate: '2024-01-20'
            },
            {
                id: 'video_005',
                title: 'Advanced Privacy Settings',
                description: 'Master your privacy controls',
                thumbnail: '🔒',
                duration: '7:30',
                views: 23400,
                category: 'Privacy',
                difficulty: 'Advanced',
                url: '#video-tutorial-5',
                topics: ['Privacy', 'Security', 'Settings'],
                uploadDate: '2024-01-17'
            },
            {
                id: 'video_006',
                title: 'Group Management 101',
                description: 'Create and manage successful groups',
                thumbnail: '👥',
                duration: '9:10',
                views: 12300,
                category: 'Features',
                difficulty: 'Intermediate',
                url: '#video-tutorial-6',
                topics: ['Groups', 'Community', 'Management'],
                uploadDate: '2024-01-16'
            },
            {
                id: 'video_007',
                title: 'Monetization Strategies',
                description: 'Earn money on ConnectHub',
                thumbnail: '💰',
                duration: '12:45',
                views: 56700,
                category: 'Creator',
                difficulty: 'Advanced',
                url: '#video-tutorial-7',
                topics: ['Monetization', 'Revenue', 'Tips'],
                uploadDate: '2024-01-21'
            },
            {
                id: 'video_008',
                title: 'Event Planning Guide',
                description: 'Host successful events on ConnectHub',
                thumbnail: '🎉',
                duration: '8:00',
                views: 18900,
                category: 'Features',
                difficulty: 'Intermediate',
                url: '#video-tutorial-8',
                topics: ['Events', 'Planning', 'Promotion'],
                uploadDate: '2024-01-14'
            }
        ];
        console.log(`✓ Loaded ${this.videoTutorials.length} video tutorials`);
    }

    // ==================== KNOWLEDGE BASE ====================
    loadKnowledgeBase() {
        this.knowledgeBase = [
            {
                id: 'kb_001',
                title: 'Account Management',
                articles: 15,
                icon: '👤',
                topics: ['Profile', 'Settings', 'Security', 'Deletion']
            },
            {
                id: 'kb_002',
                title: 'Privacy & Safety',
                articles: 23,
                icon: '🔒',
                topics: ['Privacy Controls', 'Blocking', 'Reporting', 'Safety Tips']
            },
            {
                id: 'kb_003',
                title: 'Features & Tools',
                articles: 45,
                icon: '⚡',
                topics: ['Posts', 'Stories', 'Live', 'Messages', 'Groups']
            },
            {
                id: 'kb_004',
                title: 'Dating',
                articles: 28,
                icon: '💕',
                topics: ['Matching', 'Profiles', 'Conversations', 'Video Dates']
            },
            {
                id: 'kb_005',
                title: 'Creator Tools',
                articles: 34,
                icon: '🎨',
                topics: ['Monetization', 'Analytics', 'Content', 'Growth']
            },
            {
                id: 'kb_006',
                title: 'Troubleshooting',
                articles: 19,
                icon: '🔧',
                topics: ['Technical Issues', 'Bugs', 'Performance', 'Connectivity']
            },
            {
                id: 'kb_007',
                title: 'Premium Features',
                articles: 12,
                icon: '⭐',
                topics: ['Subscription', 'Benefits', 'Billing', 'Cancellation']
            },
            {
                id: 'kb_008',
                title: 'Community Guidelines',
                articles: 8,
                icon: '📋',
                topics: ['Rules', 'Etiquette', 'Policies', 'Enforcement']
            }
        ];
        console.log(`✓ Loaded ${this.knowledgeBase.length} knowledge base categories`);
    }

    // ==================== AI ASSISTANT NLP ====================
    initAIAssistant() {
        this.aiResponses = {
            greeting: [
                "Hi! I'm your ConnectHub AI assistant. How can I help you today?",
                "Hello! I'm here to help. What would you like to know?",
                "Hey there! What can I assist you with?"
            ],
            account: {
                password: "To reset your password, go to Settings > Account Security > Change Password. You'll need to verify your identity via email or SMS.",
                delete: "To delete your account: 1) Go to Settings, 2) Tap Account Management, 3) Select Delete Account. Note: This is permanent and cannot be undone.",
                security: "For account security: Enable 2FA, use a strong password, review active sessions regularly, and never share your credentials.",
                verification: "To get verified: Go to Settings > Verification, complete the requirements, and submit your application. Verification usually takes 3-5 business days."
            },
            features: {
                live: "To go live: Tap + button, select 'Go Live', set title and privacy, then tap 'Start Stream'. Make sure to allow camera/microphone permissions.",
                stories: "Create stories by tapping your profile picture with the + icon. Add photos/videos, customize with filters and text, then share!",
                groups: "Create a group from the Groups tab. Add name, description, category, and invite members. Groups can be public or private.",
                dating: "Enable dating in Settings > Dating. Complete your dating profile, set preferences, and start swiping to find matches!"
            },
            issues: {
                messages: "If messages aren't sending: 1) Check internet connection, 2) Update the app, 3) Log out and back in, 4) Clear app cache.",
                loading: "If content isn't loading: Check your connection, try refreshing, clear cache, or restart the app.",
                crash: "If app crashes: Update to latest version, clear cache, restart device, or reinstall the app.",
                upload: "Upload issues? Check file size (max 100MB for videos), format compatibility, and internet connection."
            },
            premium: {
                benefits: "Premium includes: unlimited likes, see who liked you, priority support, advanced filters, read receipts, verified badge, and ad-free experience.",
                subscribe: "Subscribe to Premium in Settings > Subscription. Choose monthly ($9.99) or annual ($99.99) plans.",
                cancel: "Cancel anytime in Settings > Subscription > Manage Subscription. You'll keep benefits until the end of your billing period."
            },
            safety: {
                report: "Report content by tapping three dots > Report. Choose reason, add details. Our team reviews within 24 hours.",
                block: "Block users from their profile > three dots > Block. They won't be able to contact you or see your content.",
                privacy: "Control privacy in Settings > Privacy. Customize who can see posts, send messages, and view your profile."
            }
        };
        console.log('✓ AI Assistant initialized with NLP responses');
    }

    // ==================== TICKET SYSTEM ====================
    createTicket(ticketData) {
        const ticket = {
            id: `ticket_${Date.now()}`,
            subject: ticketData.subject,
            category: ticketData.category,
            priority: ticketData.priority || 'medium',
            description: ticketData.description,
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            assignedTo: null,
            responses: [],
            attachments: ticketData.attachments || [],
            userId: 'current_user',
            tags: ticketData.tags || []
        };

        this.tickets.push(ticket);
        this.addToSupportHistory({
            type: 'ticket_created',
            ticketId: ticket.id,
            timestamp: ticket.createdAt
        });

        console.log(`✓ Ticket created: ${ticket.id}`);
        return ticket;
    }

    updateTicketStatus(ticketId, status, response = null) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (ticket) {
            ticket.status = status;
            ticket.updatedAt = new Date().toISOString();
            
            if (response) {
                ticket.responses.push({
                    from: 'support_agent',
                    message: response,
                    timestamp: new Date().toISOString()
                });
            }

            this.addToSupportHistory({
                type: 'ticket_updated',
                ticketId: ticket.id,
                status: status,
                timestamp: ticket.updatedAt
            });

            console.log(`✓ Ticket ${ticketId} updated to ${status}`);
            return ticket;
        }
        return null;
    }

    getTickets(filter = 'all') {
        if (filter === 'all') return this.tickets;
        return this.tickets.filter(t => t.status === filter);
    }

    // ==================== SUPPORT HISTORY ====================
    loadSupportHistory() {
        this.supportHistory = [
            {
                id: 'history_001',
                type: 'chat',
                title: 'Live Chat - Account Security',
                timestamp: '2024-01-20T14:30:00Z',
                status: 'resolved',
                duration: '12 minutes',
                agent: 'Sarah M.',
                rating: 5
            },
            {
                id: 'history_002',
                type: 'ticket',
                title: 'Ticket #12345 - Upload Issue',
                timestamp: '2024-01-18T10:15:00Z',
                status: 'resolved',
                duration: '2 hours',
                agent: 'Mike J.',
                rating: 4
            },
            {
                id: 'history_003',
                type: 'chat',
                title: 'Live Chat - Feature Question',
                timestamp: '2024-01-15T16:45:00Z',
                status: 'resolved',
                duration: '8 minutes',
                agent: 'Emma W.',
                rating: 5
            }
        ];
        console.log(`✓ Loaded ${this.supportHistory.length} support history items`);
    }

    addToSupportHistory(entry) {
        this.supportHistory.unshift(entry);
        console.log('✓ Support history updated');
    }

    getSupportHistory() {
        return this.supportHistory;
    }

    // ==================== LIVE CHAT ====================
    connectToLiveAgent() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const agent = {
                    id: 'agent_' + Math.floor(Math.random() * 1000),
                    name: ['Sarah M.', 'Mike J.', 'Emma W.', 'David L.', 'Lisa K.'][Math.floor(Math.random() * 5)],
                    avatar: '👨‍💼',
                    status: 'online',
                    responseTime: '< 1 min',
                    rating: 4.9,
                    specialty: 'General Support'
                };
                this.liveAgents.push(agent);
                console.log(`✓ Connected to live agent: ${agent.name}`);
                resolve(agent);
            }, 2000);
        });
    }

    sendChatMessage(message, type = 'user') {
        const chatMessage = {
            id: `msg_${Date.now()}`,
            type: type,
            content: message,
            timestamp: new Date().toISOString(),
            read: false
        };

        this.chatHistory.push(chatMessage);
        
        if (type === 'user') {
            // Simulate agent response
            setTimeout(() => {
                this.sendChatMessage(
                    this.generateAgentResponse(message),
                    'agent'
                );
            }, 1500);
        }

        return chatMessage;
    }

    generateAgentResponse(userMessage) {
        const responses = [
            "I understand your concern. Let me help you with that.",
            "Thanks for providing that information. Here's what you can do...",
            "I've looked into this for you. The solution is...",
            "That's a great question! Let me explain...",
            "I can definitely help with that. Here are the steps..."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // ==================== AI ASSISTANT ====================
    processAIQuery(query) {
        const lowercaseQuery = query.toLowerCase();
        
        // Pattern matching for different query types
        if (lowercaseQuery.includes('hello') || lowercaseQuery.includes('hi')) {
            return this.getRandomResponse(this.aiResponses.greeting);
        }

        // Account-related queries
        if (lowercaseQuery.includes('password') || lowercaseQuery.includes('reset')) {
            return this.aiResponses.account.password;
        }
        if (lowercaseQuery.includes('delete') && lowercaseQuery.includes('account')) {
            return this.aiResponses.account.delete;
        }
        if (lowercaseQuery.includes('security') || lowercaseQuery.includes('safe')) {
            return this.aiResponses.account.security;
        }
        if (lowercaseQuery.includes('verif')) {
            return this.aiResponses.account.verification;
        }

        // Feature-related queries
        if (lowercaseQuery.includes('live') || lowercaseQuery.includes('stream')) {
            return this.aiResponses.features.live;
        }
        if (lowercaseQuery.includes('stor')) {
            return this.aiResponses.features.stories;
        }
        if (lowercaseQuery.includes('group')) {
            return this.aiResponses.features.groups;
        }
        if (lowercaseQuery.includes('dating') || lowercaseQuery.includes('match')) {
            return this.aiResponses.features.dating;
        }

        // Issue-related queries
        if (lowercaseQuery.includes('message') && (lowercaseQuery.includes('not') || lowercaseQuery.includes('can\'t'))) {
            return this.aiResponses.issues.messages;
        }
        if (lowercaseQuery.includes('load') || lowercaseQuery.includes('slow')) {
            return this.aiResponses.issues.loading;
        }
        if (lowercaseQuery.includes('crash')) {
            return this.aiResponses.issues.crash;
        }
        if (lowercaseQuery.includes('upload')) {
            return this.aiResponses.issues.upload;
        }

        // Premium-related queries
        if (lowercaseQuery.includes('premium')) {
            if (lowercaseQuery.includes('benefit') || lowercaseQuery.includes('what')) {
                return this.aiResponses.premium.benefits;
            }
            if (lowercaseQuery.includes('cancel')) {
                return this.aiResponses.premium.cancel;
            }
            return this.aiResponses.premium.subscribe;
        }

        // Safety-related queries
        if (lowercaseQuery.includes('report')) {
            return this.aiResponses.safety.report;
        }
        if (lowercaseQuery.includes('block')) {
            return this.aiResponses.safety.block;
        }
        if (lowercaseQuery.includes('privacy')) {
            return this.aiResponses.safety.privacy;
        }

        // Default response
        return "I'd be happy to help! Could you provide more details so I can better assist you? You can also search our help articles or connect with a live agent for immediate support.";
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // ==================== SEARCH FUNCTIONALITY ====================
    searchKnowledgeBase(query) {
        if (!query || query.trim().length === 0) return [];

        const lowercaseQuery = query.toLowerCase();
        const results = [];

        // Search FAQs
        this.faqDatabase.forEach(faq => {
            const score = this.calculateRelevanceScore(
                lowercaseQuery,
                faq.question.toLowerCase(),
                faq.answer.toLowerCase(),
                faq.tags
            );
            if (score > 0) {
                results.push({ type: 'faq', data: faq, score });
            }
        });

        // Search Help Articles
        this.helpArticles.forEach(article => {
            const score = this.calculateRelevanceScore(
                lowercaseQuery,
                article.title.toLowerCase(),
                article.content.toLowerCase(),
                article.tags
            );
            if (score > 0) {
                results.push({ type: 'article', data: article, score });
            }
        });

        // Search Video Tutorials
        this.videoTutorials.forEach(video => {
            const score = this.calculateRelevanceScore(
                lowercaseQuery,
                video.title.toLowerCase(),
                video.description.toLowerCase(),
                video.topics.map(t => t.toLowerCase())
            );
            if (score > 0) {
                results.push({ type: 'video', data: video, score });
            }
        });

        // Sort by relevance score
        results.sort((a, b) => b.score - a.score);
        console.log(`✓ Found ${results.length} search results for: ${query}`);
        return results;
    }

    calculateRelevanceScore(query, title, content, tags) {
        let score = 0;
        const queryWords = query.toLowerCase().split(' ');

        queryWords.forEach(word => {
            if (word.length < 3) return; // Skip very short words

            // Title match (highest weight)
            if (title.includes(word)) score += 10;

            // Tag match (high weight)
            if (tags.some(tag => tag.toLowerCase().includes(word))) score += 8;

            // Content match (medium weight)
            if (content.includes(word)) score += 3;

            // Exact phrase match in title (bonus)
            if (title.includes(query)) score += 15;
        });

        return score;
    }

    // ==================== SUPPORT RATING SYSTEM ====================
    rateSupportInteraction(interactionId, rating, feedback = '') {
        const interaction = this.supportHistory.find(h => h.id === interactionId);
        if (interaction) {
            interaction.rating = rating;
            interaction.feedback = feedback;
            interaction.ratedAt = new Date().toISOString();
            
            console.log(`✓ Rated interaction ${interactionId}: ${rating}/5 stars`);
            return true;
        }
        return false;
    }

    getAverageRating() {
        const ratedInteractions = this.supportHistory.filter(h => h.rating);
        if (ratedInteractions.length === 0) return 0;
        
        const total = ratedInteractions.reduce((sum, h) => sum + h.rating, 0);
        return (total / ratedInteractions.length).toFixed(1);
    }

    // ==================== COMMUNITY FORUMS ====================
    getCommunityForumsLink() {
        return {
            url: 'https://community.connecthub.com',
            categories: [
                { id: 1, name: 'Getting Started', posts: 1234, icon: '🚀' },
                { id: 2, name: 'Feature Requests', posts: 567, icon: '💡' },
                { id: 3, name: 'Bug Reports', posts: 345, icon: '🐛' },
                { id: 4, name: 'Tips & Tricks', posts: 890, icon: '⚡' },
                { id: 5, name: 'Dating Advice', posts: 456, icon: '💕' },
                { id: 6, name: 'Creator Corner', posts: 678, icon: '🎨' },
                { id: 7, name: 'Technical Help', posts: 234, icon: '🔧' }
            ]
        };
    }

    // ==================== HELPER FUNCTIONS ====================
    getQuickActions() {
        return [
            { id: 'chat', icon: '💬', title: 'Live Chat', subtitle: 'Talk to an agent' },
            { id: 'ticket', icon: '🎫', title: 'Submit Ticket', subtitle: 'Get help via email' },
            { id: 'ai', icon: '🤖', title: 'AI Assistant', subtitle: 'Instant answers' },
            { id: 'faq', icon: '❓', title: 'Browse FAQs', subtitle: 'Common questions' },
            { id: 'videos', icon: '📹', title: 'Video Tutorials', subtitle: 'Learn visually' },
            { id: 'community', icon: '👥', title: 'Community', subtitle: 'Ask the community' }
        ];
    }

    getPopularTopics() {
        return [
            { id: 1, title: 'Account Security', views: 45200, icon: '🔒' },
            { id: 2, title: 'Getting Started', views: 38900, icon: '🚀' },
            { id: 3, title: 'Live Streaming', views: 34567, icon: '📹' },
            { id: 4, title: 'Dating Tips', views: 28900, icon: '💕' },
            { id: 5, title: 'Premium Benefits', views: 15320, icon: '⭐' }
        ];
    }

    getSupportStats() {
        return {
            averageResponseTime: '< 2 minutes',
            ticketResolutionRate: '94%',
            customerSatisfaction: '4.8/5',
            activeAgents: 24,
            totalTicketsResolved: 15847
        };
    }
}

// Initialize Help & Support System
const helpSupportSystem = new HelpSupportSystem();

// Make globally accessible
window.helpSupportSystem = helpSupportSystem;

console.log('✅ Help & Support System fully loaded and operational');
console.log(`
╔════════════════════════════════════════════════════╗
║     HELP & SUPPORT SYSTEM - READY                 ║
╠════════════════════════════════════════════════════╣
║ ✅ FAQ Database: ${helpSupportSystem.faqDatabase.length} entries              ║
║ ✅ Help Articles: ${helpSupportSystem.helpArticles.length} articles            ║
║ ✅ Video Tutorials: ${helpSupportSystem.videoTutorials.length} videos         ║
║ ✅ Knowledge Base: ${helpSupportSystem.knowledgeBase.length} categories       ║
║ ✅ AI Assistant: NLP Enabled                      ║
║ ✅ Live Chat: Agent Connection Ready              ║
║ ✅ Ticket System: Operational                     ║
║ ✅ Support History: Tracking Active               ║
║ ✅ Rating System: Feedback Ready                  ║
║ ✅ Community Forums: Links Available              ║
║ ✅ Knowledge Search: Full-text Search             ║
╚════════════════════════════════════════════════════╝
`);
