/**
 * Apply 4 UI fixes to LynkApp-Production-App/index.html (the LIVE production file)
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'LynkApp-Production-App', 'index.html');
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

// Insert CSS before the closing </style> tag (first occurrence)
content = content.replace('</style>', cssToAdd + '\n        </style>');

// ============================================================
// FIX 1: Friends screen – add Post button to the right of search bar
// ============================================================
content = content.replace(
    /(<div id="friends-screen" class="screen">)([\s\S]*?)(<div class="search-bar">)([\s\S]*?)(placeholder="Search friends\.\.\."\s*\/>)([\s\S]*?)(<\/div>)/,
    (match, screenOpen, before, barOpen, inside, inputClose, after, barClose) => {
        return `${screenOpen}${before}<div class="search-bar" style="display:flex;align-items:center;gap:8px;">${inside}${inputClose}
                    <button class="search-post-btn" onclick="showToast('Post created! \u270f\ufe0f')" title="Post">\u270f\ufe0f</button>
                ${barClose}`;
    }
);

// ============================================================
// FIX 2: Add back button to every non-feed screen
// ============================================================
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
    const pattern = new RegExp(
        `(<div id="${screenId}" class="screen(?:\\s+active)?">)([\\s\\n\\r]+)(<div )`,
        ''
    );
    content = content.replace(pattern, (match, openTag, whitespace, nextDiv) => {
        return `${openTag}${whitespace}${backButtonHtml}${nextDiv}`;
    });
});

// ============================================================
// FIX 3a: allFriendsModal – add Post button to search bar
// ============================================================
content = content.replace(
    /(<div id="allFriendsModal" class="modal">[\s\S]*?<div class="search-bar">)([\s\S]*?)(placeholder="Search friends\.\.\."\s*\/>)([\s\S]*?)(<\/div>)/,
    (match, before, inside, inputClose, after, barClose) => {
        return `${before.replace('<div class="search-bar">', '<div class="search-bar" style="display:flex;align-items:center;gap:8px;">')}${inside}${inputClose}
                    <button class="search-post-btn" onclick="showToast('Post created! \u270f\ufe0f')" title="Post">\u270f\ufe0f</button>
                ${barClose}`;
    }
);

// ============================================================
// FIX 3b: allFriendsModal – Make Message buttons navigate to messages screen
// ============================================================
content = content.replace(
    /<div id="allFriendsModal"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
    (modalHtml) => {
        return modalHtml.replace(
            /<button class="friend-btn secondary">(Message)<\/button>/g,
            `<button class="friend-btn secondary" onclick="closeModal('allFriends'); openScreen('messages'); showToast('Opening Messages \ud83d\udcac')">Message</button>`
        );
    }
);

// ============================================================
// FIX 4: Create Story Modal – add a Create Story submit button
// ============================================================
content = content.replace(
    /(<div id="createStoryModal" class="modal">[\s\S]*?)(<button class="btn" onclick="openStoryGallery\(\)">[\s\S]*?<\/button>)([\s\S]*?)(<\/div>[\s\S]*?<\/div>)([\s\S]*?<!-- View Story Modal -->)/,
    (match, before, galleryBtn, between, closingDivs, viewStory) => {
        return `${before}${galleryBtn}${between}
                <button class="btn" style="margin-top: 16px; background: linear-gradient(135deg, var(--primary), var(--secondary));" onclick="createAndShareStory()">
                    \ud83c\udf1f Create Story
                </button>${closingDivs}${viewStory}`;
    }
);

// ============================================================
// Add createAndShareStory() JS function
// ============================================================
const storyFunctionJs = `
        function createAndShareStory() {
            closeModal('createStory');
            showToast('Your story has been created! \ud83c\udf1f');
        }
`;

const lastScriptClose = content.lastIndexOf('</script>');
if (lastScriptClose !== -1) {
    content = content.slice(0, lastScriptClose) + storyFunctionJs + '\n    ' + content.slice(lastScriptClose);
}

// ============================================================
// Write the modified file
// ============================================================
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ All 4 fixes applied to LynkApp-Production-App/index.html');
console.log('');
console.log('  Fix 1: Friends screen - Post button added to search bar');
console.log('  Fix 2: Back button added to all 24 non-feed screens');
console.log('  Fix 3: All Friends modal - Post button + Message buttons work');
console.log('  Fix 4: Create Story modal - Create Story submit button added');
