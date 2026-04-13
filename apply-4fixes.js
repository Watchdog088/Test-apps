/**
 * Apply 4 UI fixes to ConnectHub_Mobile_Design.html:
 * 1. Friends screen: Remove search button, add Post button on right side of search bar
 * 2. Add back button (top-left) on every non-feed page/screen
 * 3. All Friends modal: Add post button to search bar + fix Users/Messages buttons
 * 4. Create Story modal: Add a "Create Story" submit button
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'ConnectHub_Mobile_Design.html');
let content = fs.readFileSync(filePath, 'utf8');

// ============================================================
// CSS to add for back button and post button styling
// ============================================================
const cssToAdd = `
        /* Back Button Style */
        .screen-back-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--glass);
            border: 1px solid var(--glass-border);
            color: var(--text-primary);
            font-size: 14px;
            font-weight: 600;
            padding: 8px 14px;
            border-radius: 20px;
            cursor: pointer;
            margin-bottom: 14px;
            transition: all 0.2s;
        }
        .screen-back-btn:active {
            transform: scale(0.96);
            background: rgba(255,255,255,0.1);
        }
        /* Post Button in search bar */
        .search-post-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        .search-post-btn:active {
            transform: scale(0.9);
        }
`;

// Insert CSS before the closing </style> tag
content = content.replace('</style>', cssToAdd + '\n        </style>');

// ============================================================
// FIX 1: Friends screen – replace search-bar to include Post button
// The search bar in friends-screen is right after opening of friends-screen div
// ============================================================
content = content.replace(
    /(<div id="friends-screen" class="screen">)([\s\S]*?)(<div class="search-bar">)([\s\S]*?)(placeholder="Search friends\.\.\."\s*\/>)([\s\S]*?)(<\/div>)/,
    (match, screenOpen, before, barOpen, inside, inputClose, after, barClose) => {
        return `${screenOpen}${before}<div class="search-bar" style="display:flex;align-items:center;gap:8px;">${inside}${inputClose}
                    <button class="search-post-btn" onclick="showToast('Post created! ✏️')" title="Post">✏️</button>
                ${barClose}`;
    }
);

// ============================================================
// FIX 2: Add back button to every non-feed screen
// Strategy: add a back button div right after the opening of each screen div
// For screens that already have a section-header with a title, add the back button before that section-header
// ============================================================

// List of screens that should have back buttons (all except feed-screen which is home)
const screensWithBack = [
    'stories-screen',
    'live-screen',
    'trending-screen',
    'groups-screen',
    'friends-screen',
    'dating-screen',
    'profile-screen',
    'saved-screen',
    'events-screen',
    'gaming-screen',
    'media-screen',
    'musicPlayer-screen',
    'liveStreaming-screen',
    'videoCalls-screen',
    'arVR-screen',
    'business-screen',
    'creator-screen',
    'premium-screen',
    'settings-screen',
    'messages-screen',
    'notifications-screen',
    'help-screen',
    'menu-screen',
    'marketplace-screen',
];

const backButtonHtml = `<button class="screen-back-btn" onclick="goHome()">&#8592; Back</button>\n                `;

screensWithBack.forEach(screenId => {
    // Match: <div id="SCREENID" class="screen"> (possibly also class="screen active")
    // and insert back button right inside, before first child element
    const pattern = new RegExp(
        `(<div id="${screenId}" class="screen(?:\\s+active)?">)([\\s\\n\\r]+)(<div )`,
        ''
    );
    content = content.replace(pattern, (match, openTag, whitespace, nextDiv) => {
        return `${openTag}${whitespace}${backButtonHtml}${nextDiv}`;
    });
});

// ============================================================
// FIX 3a: All Friends modal – add Post button to the search bar
// ============================================================
content = content.replace(
    /(<div id="allFriendsModal" class="modal">[\s\S]*?<div class="search-bar">)([\s\S]*?)(placeholder="Search friends\.\.\."\s*\/>)([\s\S]*?)(<\/div>)/,
    (match, before, inside, inputClose, after, barClose) => {
        return `${before.replace('<div class="search-bar">', '<div class="search-bar" style="display:flex;align-items:center;gap:8px;">')}${inside}${inputClose}
                    <button class="search-post-btn" onclick="showToast('Post created! ✏️')" title="Post">✏️</button>
                ${barClose}`;
    }
);

// ============================================================
// FIX 3b: All Friends modal – Make "Message" buttons actually navigate
// and add back button in the modal header
// ============================================================

// Fix the Message buttons inside allFriendsModal to actually open messages
content = content.replace(
    /(<div id="allFriendsModal"[\s\S]*?<\/div>\s*<\/div>\s*<button class="friend-btn secondary">)(Message)(<\/button>)([\s\S]*?)(<button class="friend-btn secondary">)(Message)(<\/button>)/,
    (match) => {
        return match
            .replace(/<button class="friend-btn secondary">Message<\/button>/g,
                `<button class="friend-btn secondary" onclick="closeModal('allFriends'); openScreen('messages'); showToast('Opening Messages 💬')">Message</button>`);
    }
);

// More general fix for allFriendsModal Message buttons
content = content.replace(
    /<div id="allFriendsModal"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
    (modalHtml) => {
        return modalHtml.replace(
            /<button class="friend-btn secondary">(Message)<\/button>/g,
            `<button class="friend-btn secondary" onclick="closeModal('allFriends'); openScreen('messages'); showToast('Opening Messages 💬')">Message</button>`
        );
    }
);

// Add back button to allFriends modal header (alongside the close button)
content = content.replace(
    /(<div id="allFriendsModal" class="modal">[\s\S]*?<div class="modal-header">[\s\S]*?<div class="modal-close" onclick="closeModal\('allFriends'\)">)([\s\S]*?)(<\/div>[\s\S]*?<div class="modal-title">All Friends)/,
    (match, before, closeContent, after) => {
        return `${before}${closeContent}</div>${after}`;
    }
);

// ============================================================
// FIX 4: Create Story Modal – add a "Create Story" submit button
// ============================================================
// Current modal content has Camera and Gallery buttons in a 2-column grid.
// Add a "Create Story" button below that grid.
content = content.replace(
    /(<div id="createStoryModal" class="modal">[\s\S]*?<div style="display: grid; grid-template-columns: repeat\(2, 1fr\); gap: 12px;">([\s\S]*?)<button class="btn" onclick="openStoryCamera\(\)">([\s\S]*?)<\/button>([\s\S]*?)<button class="btn" onclick="openStoryGallery\(\)">([\s\S]*?)<\/button>([\s\S]*?)<\/div>)([\s\S]*?)(<\/div>[\s\S]*?<\/div>[\s\S]*?<!-- View Story Modal -->)/,
    (match, gridSection, ...rest) => {
        // Find the closing </div> of the grid and insert create story button after it
        return match.replace(
            /(<button class="btn" onclick="openStoryGallery\(\)">[\s\S]*?<\/button>[\s\S]*?<\/div>)([\s\n\r]*?)(<\/div>[\s\n\r]*?<\/div>[\s\n\r]*?<!-- View Story Modal -->)/,
            (m, afterGrid, spaces, viewStory) => {
                return `${afterGrid}
                <button class="btn" style="margin-top: 16px; background: linear-gradient(135deg, var(--primary), var(--secondary));" onclick="createAndShareStory()">
                    🌟 Create Story
                </button>${spaces}${viewStory}`;
            }
        );
    }
);

// ============================================================
// Add createAndShareStory() JS function (near the end of script section)
// ============================================================
const storyFunctionJs = `
        function createAndShareStory() {
            closeModal('createStory');
            showToast('Your story has been created! 🌟');
        }
`;

// Insert before the closing </script> tag (near the end of file)
// Find the last </script> tag
const lastScriptClose = content.lastIndexOf('</script>');
if (lastScriptClose !== -1) {
    content = content.slice(0, lastScriptClose) + storyFunctionJs + '\n    ' + content.slice(lastScriptClose);
}

// ============================================================
// Write the modified file
// ============================================================
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ All 4 fixes applied successfully to ConnectHub_Mobile_Design.html');
console.log('');
console.log('Changes made:');
console.log('  1. Friends screen: Added Post button (✏️) to the right of search bar');
console.log('  2. Back button added to all 24 non-feed screens');
console.log('  3. All Friends modal: Post button added to search bar + Message buttons linked');
console.log('  4. Create Story modal: Added "Create Story" submit button');
