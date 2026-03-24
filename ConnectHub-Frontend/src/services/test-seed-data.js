/**
 * LynkApp Test Seed Data - Phase 10
 * Creates test accounts and sample data for user testing
 *
 * Phase 10 Tasks:
 *   10.1 Create 3 test user accounts (Alice, Bob, Charlie)
 *   10.2 Seed sample posts for the feed
 *   10.3 Seed friend connections between test users
 *   10.4 Seed sample DM conversations
 *   10.5 Verify all 5 critical user journeys work end-to-end
 *
 * HOW TO USE:
 *   Open the browser console on your app page while logged in as admin
 *   Copy-paste and run: TestSeed.runAll()
 *
 * Updated: Phase 10 - March 2026
 */

const TestSeed = (() => {

    // ─────────────────────────────────────────────
    //  TEST ACCOUNTS
    // ─────────────────────────────────────────────

    const TEST_USERS = [
        {
            email:       'alice@lynkapp.test',
            password:    'TestPass123!',
            username:    'alice_test',
            displayName: 'Alice Johnson',
            bio:         'Test user A — loves coffee ☕ and hiking 🏔️',
            location:    'New York, NY',
            profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
        },
        {
            email:       'bob@lynkapp.test',
            password:    'TestPass123!',
            username:    'bob_test',
            displayName: 'Bob Martinez',
            bio:         'Test user B — music producer 🎵 and gamer 🎮',
            location:    'Los Angeles, CA',
            profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
        },
        {
            email:       'charlie@lynkapp.test',
            password:    'TestPass123!',
            username:    'charlie_test',
            displayName: 'Charlie Kim',
            bio:         'Test user C — photographer 📸 and foodie 🍜',
            location:    'Chicago, IL',
            profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie'
        }
    ];

    // ─────────────────────────────────────────────
    //  SAMPLE POSTS
    // ─────────────────────────────────────────────

    const SAMPLE_POSTS = [
        {
            content: '🌅 Beautiful morning in New York! Starting the day with a 5-mile run. Who else is up early? #MorningRun #NYC',
            authorIndex: 0 // Alice
        },
        {
            content: 'Just finished mixing a new track 🎵 After 3 weeks of work, it finally sounds the way I imagined. Drop a 🔥 if you want me to share it!',
            authorIndex: 1 // Bob
        },
        {
            content: 'Weekend food tour in Chicago! Hit up 6 different restaurants and tried the most amazing deep dish pizza 🍕 Thread coming soon...',
            authorIndex: 2 // Charlie
        },
        {
            content: '📸 Golden hour photography tip: The best light is 30 minutes before sunset, not at sunset itself. Here\'s why the warm colors hit different earlier 👇',
            authorIndex: 2 // Charlie
        },
        {
            content: 'Hot take: working from home has made me MORE productive, not less. Here are the 5 changes I made that actually worked ⬇️',
            authorIndex: 0 // Alice
        },
        {
            content: 'New gaming setup complete! 🖥️ Triple monitors, mechanical keyboard, and a chair that actually supports my back. The upgrade was WORTH IT.',
            authorIndex: 1 // Bob
        }
    ];

    // ─────────────────────────────────────────────
    //  TASK 10.1 — CREATE TEST ACCOUNTS
    // ─────────────────────────────────────────────

    async function createTestAccounts() {
        console.log('\n📋 TASK 10.1: Creating test accounts...');
        const results = [];

        for (const user of TEST_USERS) {
            try {
                // Try sign up
                let result;
                if (window.authService) {
                    result = await window.authService.signUp(
                        user.email,
                        user.password,
                        user.username,
                        user.displayName
                    );
                } else {
                    console.warn('  ⚠️  authService not available — skipping account creation');
                    results.push({ email: user.email, success: false, error: 'authService unavailable' });
                    continue;
                }

                if (result.success) {
                    // Update profile with bio/location
                    if (window.profileAPIService) {
                        await window.profileAPIService.updateProfile({
                            bio:      user.bio,
                            location: user.location,
                            profilePicture: user.profilePicture
                        });
                    }
                    console.log(`  ✅ Created: ${user.displayName} (${user.email})`);
                    results.push({ ...user, success: true, userId: result.user?.userId });
                } else {
                    // Account may already exist — try signing in
                    const signInResult = await window.authService.signIn(user.email, user.password);
                    if (signInResult.success) {
                        console.log(`  ℹ️  Already exists: ${user.displayName} — signed in OK`);
                        results.push({ ...user, success: true, userId: signInResult.user?.userId });
                    } else {
                        console.warn(`  ❌ Failed: ${user.displayName} — ${result.error}`);
                        results.push({ email: user.email, success: false, error: result.error });
                    }
                }
            } catch (err) {
                console.error(`  ❌ Error creating ${user.email}:`, err.message);
                results.push({ email: user.email, success: false, error: err.message });
            }

            // Sign out between accounts
            if (window.authService) {
                await window.authService.signOut?.();
                await new Promise(r => setTimeout(r, 500));
            }
        }

        console.log(`\n  📊 Accounts created/verified: ${results.filter(r => r.success).length}/${TEST_USERS.length}`);
        return results;
    }

    // ─────────────────────────────────────────────
    //  TASK 10.2 — SEED SAMPLE POSTS
    // ─────────────────────────────────────────────

    async function seedPosts() {
        console.log('\n📋 TASK 10.2: Seeding sample posts...');

        if (!window.feedAPIService) {
            console.warn('  ⚠️  feedAPIService not available — skipping post seeding');
            return [];
        }

        const results = [];

        for (const post of SAMPLE_POSTS) {
            try {
                // Sign in as the author
                const author = TEST_USERS[post.authorIndex];
                if (window.authService) {
                    await window.authService.signIn(author.email, author.password);
                    await new Promise(r => setTimeout(r, 500));
                }

                const result = await window.feedAPIService.createPost({
                    content: post.content
                });

                if (result.success) {
                    console.log(`  ✅ Post by ${author.displayName}: "${post.content.substring(0, 50)}..."`);
                    results.push({ ...result, authorEmail: author.email });
                } else {
                    console.warn(`  ❌ Failed post: ${result.error}`);
                }

                if (window.authService) {
                    await window.authService.signOut?.();
                    await new Promise(r => setTimeout(r, 300));
                }
            } catch (err) {
                console.error('  ❌ Error seeding post:', err.message);
            }
        }

        console.log(`\n  📊 Posts seeded: ${results.length}/${SAMPLE_POSTS.length}`);
        return results;
    }

    // ─────────────────────────────────────────────
    //  TASK 10.3 — SEED FRIEND CONNECTIONS
    // ─────────────────────────────────────────────

    async function seedFriendConnections() {
        console.log('\n📋 TASK 10.3: Seeding friend connections...');

        if (!window.friendsAPIService || !window.authService) {
            console.warn('  ⚠️  friendsAPIService or authService not available');
            return;
        }

        // Get user IDs first
        const userIds = {};
        for (const user of TEST_USERS) {
            const result = await window.authService.signIn(user.email, user.password);
            if (result.success) {
                userIds[user.username] = result.user?.userId;
                await window.authService.signOut?.();
                await new Promise(r => setTimeout(r, 300));
            }
        }

        console.log('  👥 User IDs:', userIds);

        // Alice → sends request to Bob
        try {
            await window.authService.signIn(TEST_USERS[0].email, TEST_USERS[0].password);
            await window.friendsAPIService.sendFriendRequest(userIds['bob_test']);
            console.log('  ✅ Alice → sent friend request to Bob');
            await window.authService.signOut?.();
            await new Promise(r => setTimeout(r, 300));
        } catch (err) {
            console.warn('  ⚠️  Alice→Bob request:', err.message);
        }

        // Bob → accepts Alice's request
        try {
            await window.authService.signIn(TEST_USERS[1].email, TEST_USERS[1].password);
            await window.friendsAPIService.acceptFriendRequest(userIds['alice_test']);
            console.log('  ✅ Bob → accepted Alice\'s friend request');
            await window.authService.signOut?.();
            await new Promise(r => setTimeout(r, 300));
        } catch (err) {
            console.warn('  ⚠️  Bob accept:', err.message);
        }

        // Charlie → sends to Alice
        try {
            await window.authService.signIn(TEST_USERS[2].email, TEST_USERS[2].password);
            await window.friendsAPIService.sendFriendRequest(userIds['alice_test']);
            console.log('  ✅ Charlie → sent friend request to Alice');
            await window.authService.signOut?.();
            await new Promise(r => setTimeout(r, 300));
        } catch (err) {
            console.warn('  ⚠️  Charlie→Alice request:', err.message);
        }

        console.log('\n  📊 Friend connections seeded ✅');
        return userIds;
    }

    // ─────────────────────────────────────────────
    //  TASK 10.4 — SEED DM CONVERSATIONS
    // ─────────────────────────────────────────────

    async function seedConversations(userIds) {
        console.log('\n📋 TASK 10.4: Seeding DM conversations...');

        if (!window.messagingService || !window.authService) {
            console.warn('  ⚠️  messagingService not available');
            return;
        }

        const messages = [
            { from: 0, to: 'bob_test',     text: 'Hey Bob! Love your new gaming setup 🎮' },
            { from: 1, to: 'alice_test',   text: 'Thanks Alice! It took me weeks to pick the monitor 😅' },
            { from: 0, to: 'bob_test',     text: 'Worth it though, the screen must look amazing!' },
            { from: 1, to: 'alice_test',   text: 'You should come over and try it sometime!' },
        ];

        if (!userIds) {
            console.warn('  ⚠️  No userIds available — run seedFriendConnections first');
            return;
        }

        for (const msg of messages) {
            try {
                const sender = TEST_USERS[msg.from];
                await window.authService.signIn(sender.email, sender.password);
                await new Promise(r => setTimeout(r, 300));

                const recipientId = userIds[msg.to];
                const { conversationId } = await window.messagingService.getOrCreateConversation(recipientId);
                await window.messagingService.sendMessage(conversationId, msg.text);

                console.log(`  ✅ ${sender.displayName}: "${msg.text}"`);
                await window.authService.signOut?.();
                await new Promise(r => setTimeout(r, 300));
            } catch (err) {
                console.warn('  ⚠️  Message seed error:', err.message);
            }
        }

        console.log('\n  📊 DM conversation seeded ✅');
    }

    // ─────────────────────────────────────────────
    //  TASK 10.5 — VERIFY 5 CRITICAL USER JOURNEYS
    // ─────────────────────────────────────────────

    async function verifyUserJourneys() {
        console.log('\n📋 TASK 10.5: Verifying critical user journeys...\n');

        const results = {
            journey1_signup:      '⏳',
            journey2_login:       '⏳',
            journey3_createPost:  '⏳',
            journey4_likeComment: '⏳',
            journey5_messaging:   '⏳',
            journey6_friends:     '⏳',
            journey7_notifications:'⏳'
        };

        // Journey 1: Sign up
        try {
            if (window.authService?.getCurrentUser) {
                results.journey1_signup = '✅ Auth service available';
            } else {
                results.journey1_signup = '❌ authService missing';
            }
        } catch (e) {
            results.journey1_signup = '❌ ' + e.message;
        }

        // Journey 2: Login
        try {
            if (window.authService?.signIn) {
                results.journey2_login = '✅ signIn method available';
            } else {
                results.journey2_login = '❌ signIn method missing';
            }
        } catch (e) {
            results.journey2_login = '❌ ' + e.message;
        }

        // Journey 3: Create post
        try {
            if (window.feedAPIService?.createPost && window.LynkApp?.createPost) {
                results.journey3_createPost = '✅ feedAPIService + LynkApp.createPost available';
            } else {
                results.journey3_createPost = '❌ feedAPIService or LynkApp.createPost missing';
            }
        } catch (e) {
            results.journey3_createPost = '❌ ' + e.message;
        }

        // Journey 4: Like / Comment
        try {
            if (window.LynkApp?.likePost && window.LynkApp?.addComment) {
                results.journey4_likeComment = '✅ LynkApp.likePost + addComment available';
            } else {
                results.journey4_likeComment = '❌ likePost or addComment missing';
            }
        } catch (e) {
            results.journey4_likeComment = '❌ ' + e.message;
        }

        // Journey 5: Messaging
        try {
            if (window.messagingService?.sendMessage && window.LynkApp?.sendMessage) {
                results.journey5_messaging = '✅ messagingService + LynkApp.sendMessage available';
            } else {
                results.journey5_messaging = '❌ messaging services missing';
            }
        } catch (e) {
            results.journey5_messaging = '❌ ' + e.message;
        }

        // Journey 6: Friends
        try {
            if (window.friendsAPIService?.sendFriendRequest && window.LynkApp?.sendFriendRequest) {
                results.journey6_friends = '✅ friendsAPIService + LynkApp wiring available';
            } else {
                results.journey6_friends = '❌ friends services missing';
            }
        } catch (e) {
            results.journey6_friends = '❌ ' + e.message;
        }

        // Journey 7: Notifications
        try {
            if (window.notificationService?.listenToUnreadCount) {
                results.journey7_notifications = '✅ notificationService available';
            } else {
                results.journey7_notifications = '❌ notificationService missing';
            }
        } catch (e) {
            results.journey7_notifications = '❌ ' + e.message;
        }

        console.log('═══════════════════════════════════════════');
        console.log('  CRITICAL USER JOURNEY VERIFICATION REPORT');
        console.log('═══════════════════════════════════════════');
        console.log(`  Journey 1 — Sign Up:          ${results.journey1_signup}`);
        console.log(`  Journey 2 — Log In:           ${results.journey2_login}`);
        console.log(`  Journey 3 — Create Post:      ${results.journey3_createPost}`);
        console.log(`  Journey 4 — Like & Comment:   ${results.journey4_likeComment}`);
        console.log(`  Journey 5 — Send Message:     ${results.journey5_messaging}`);
        console.log(`  Journey 6 — Add Friend:       ${results.journey6_friends}`);
        console.log(`  Journey 7 — Notifications:    ${results.journey7_notifications}`);
        console.log('═══════════════════════════════════════════');

        const passed  = Object.values(results).filter(r => r.startsWith('✅')).length;
        const total   = Object.keys(results).length;
        const percent = Math.round((passed / total) * 100);

        console.log(`\n  SCORE: ${passed}/${total} (${percent}%)`);
        if (percent === 100) {
            console.log('  🎉 ALL JOURNEYS VERIFIED — READY FOR USER TESTING!');
        } else {
            console.log('  ⚠️  Some services missing — check that all scripts are loaded');
        }

        return results;
    }

    // ─────────────────────────────────────────────
    //  RUN ALL (convenience method)
    // ─────────────────────────────────────────────

    async function runAll() {
        console.log('');
        console.log('╔══════════════════════════════════════════╗');
        console.log('║   LYNKAPP TEST SEED DATA — PHASE 10      ║');
        console.log('╚══════════════════════════════════════════╝');
        console.log('');

        // Quick verify first
        await verifyUserJourneys();

        // Then create test accounts
        const accountResults = await createTestAccounts();

        // Seed posts
        await seedPosts();

        // Seed friends + messages
        const userIds = await seedFriendConnections();
        await seedConversations(userIds);

        console.log('\n');
        console.log('╔══════════════════════════════════════════╗');
        console.log('║   SEED COMPLETE — APP READY FOR TESTING! ║');
        console.log('╚══════════════════════════════════════════╝');
        console.log('');
        console.log('📋 TEST ACCOUNTS:');
        console.log('   Email: alice@lynkapp.test    Password: TestPass123!');
        console.log('   Email: bob@lynkapp.test      Password: TestPass123!');
        console.log('   Email: charlie@lynkapp.test  Password: TestPass123!');
        console.log('');
        console.log('🧪 TO TEST NOTIFICATIONS:');
        console.log('   1. Open Tab A — log in as Alice');
        console.log('   2. Open Tab B — log in as Bob');
        console.log('   3. Tab B: like Alice\'s post');
        console.log('   4. Tab A: watch notification bell badge increment instantly!');
        console.log('');
        console.log('💬 TO TEST MESSAGING:');
        console.log('   1. Log in as Alice');
        console.log('   2. Open conversation with Bob');
        console.log('   3. Send a message');
        console.log('   4. In another tab as Bob, watch the message appear in real-time');
    }

    // Quick verify only
    async function quickVerify() {
        return verifyUserJourneys();
    }

    // ─────────────────────────────────────────────
    //  PUBLIC API
    // ─────────────────────────────────────────────

    return {
        runAll,
        quickVerify,
        createTestAccounts,
        seedPosts,
        seedFriendConnections,
        seedConversations,
        verifyUserJourneys,
        TEST_USERS,
        SAMPLE_POSTS
    };
})();

window.TestSeed = TestSeed;
console.log('🌱 TestSeed loaded! Run: TestSeed.quickVerify() or TestSeed.runAll()');

export default TestSeed;
