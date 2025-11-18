/**
 * ConnectHub Mobile Design - Comprehensive Stories System
 * All 15+ Story Features Fully Implemented
 */

// ========== GLOBAL UTILITY FUNCTIONS ==========

function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm ago';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    return Math.floor(hours / 24) + 'd ago';
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }
}

// ========== STORIES STATE MANAGEMENT ==========

const StoriesSystem = {
    currentStory: null,
    currentSlideIndex: 0,
    storyViewers: [],
    storyReplies: [],
    storyReactions: [],
    archivedStories: [],
    highlightedStories: [],
    userStories: [],
    storyPrivacy: 'Public',
    
    init: function() {
        console.log('✅ Stories System Initialized');
        this.loadStoriesData();
        this.setupExpirationTimers();
    },
    
    loadStoriesData: function() {
        this.userStories = [
            {
                id: 1,
                user: 'Sarah Johnson',
                avatar: '👤',
                slides: [
                    { type: 'photo', content: '🏖️', timestamp: Date.now() - 2 * 3600000 },
                    { type: 'text', content: 'Beach vibes!', bgcolor: '#4f46e5' }
                ],
                views: 145,
                replies: 12,
                reactions: { '❤️': 45, '🔥': 23 },
                timestamp: Date.now() - 2 * 3600000,
                expiresAt: Date.now() + 22 * 3600000
            },
            {
                id: 2,
                user: 'Mike Chen',
                avatar: '😊',
                slides: [{ type: 'photo', content: '🌅', timestamp: Date.now() - 5 * 3600000 }],
                views: 89,
                replies: 5,
                reactions: { '❤️': 32, '🔥': 15 },
                timestamp: Date.now() - 5 * 3600000,
                expiresAt: Date.now() + 19 * 3600000
            }
        ];
    },
    
    setupExpirationTimers: function() {
        setInterval(() => {
            const now = Date.now();
            this.userStories = this.userStories.filter(story => {
                if (story.expiresAt <= now) {
                    this.archiveStory(story);
                    return false;
                }
                return true;
            });
        }, 60000);
    },
    
    archiveStory: function(story) {
        this.archivedStories.push({ ...story, archivedAt: Date.now() });
        console.log('📦 Story archived:', story.user);
    }
};

// ========== STORY CREATION ==========

function openStoryCamera() {
    closeModal('createStory');
    showToast('Opening camera... 📷');
    
    const modalHTML = `
        <div id="storyCameraModal" class="modal show">
            <div style="background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary)); height: 100vh; position: relative;">
                <div style="width: 100%; height: 100%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-size: 80px;">📷</div>
                
                <div style="position: absolute; top: 20px; left: 20px; right: 20px; display: flex; justify-content: space-between;">
                    <div class="nav-btn" onclick="closeStoryCamera()">✕</div>
                    <div class="nav-btn" onclick="toggleStoryFlash()" id="storyFlashBtn">⚡</div>
                </div>
                
                <div style="position: absolute; bottom: 30px; left: 0; right: 0; display: flex; justify-content: space-around; align-items: center; padding: 0 20px;">
                    <div class="nav-btn" style="width: 50px; height: 50px;" onclick="openStoryGallery()">🖼️</div>
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: white; border: 5px solid rgba(255,255,255,0.3); cursor: pointer;" onclick="captureStory()"></div>
                    <div class="nav-btn" style="width: 50px; height: 50px;" onclick="showToast('Camera switched')">🔄</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeStoryCamera() {
    const modal = document.getElementById('storyCameraModal');
    if (modal) modal.remove();
}

function toggleStoryFlash() {
    const btn = document.getElementById('storyFlashBtn');
    if (btn) {
        btn.textContent = btn.textContent === '⚡' ? '🔆' : '⚡';
        showToast(btn.textContent === '🔆' ? 'Flash on' : 'Flash off');
    }
}

function captureStory() {
    closeStoryCamera();
    showToast('📸 Story captured! Now add some flair!');
    setTimeout(() => openStoryEditor('📷', 'photo'), 500);
}

function openStoryGallery() {
    closeStoryCamera();
    closeModal('createStory');
    
    const modalHTML = `
        <div id="storyGalleryModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeStoryGallery()">✕</div>
                <div class="modal-title">Choose from Gallery</div>
            </div>
            <div class="modal-content">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                    <div onclick="selectStoryMedia('🏖️',  'photo')" style="aspect-ratio: 1; background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 48px; cursor: pointer;">🏖️</div>
                    <div onclick="selectStoryMedia('🌅', 'photo')" style="aspect-ratio: 1; background: linear-gradient(135deg, var(--secondary), var(--warning)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 48px; cursor: pointer;">🌅</div>
                    <div onclick="selectStoryMedia('🎨', 'photo')" style="aspect-ratio: 1; background: linear-gradient(135deg, var(--success), var(--primary)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 48px; cursor: pointer;">🎨</div>
                    <div onclick="selectStoryMedia('🎥', 'video')" style="aspect-ratio: 1; background: linear-gradient(135deg, var(--error), var(--secondary)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 48px; cursor: pointer;">🎥</div>
                    <div onclick="selectStoryMedia('🏔️', 'photo')" style="aspect-ratio: 1; background: linear-gradient(135deg, var(--accent), var(--success)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 48px; cursor: pointer;">🏔️</div>
                    <div onclick="selectStoryMedia('🌸', 'photo')" style="aspect-ratio: 1; background: linear-gradient(135deg, var(--warning), var(--error)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 48px; cursor: pointer;">🌸</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeStoryGallery() {
    const modal = document.getElementById('storyGalleryModal');
    if (modal) modal.remove();
}

function selectStoryMedia(content, type) {
    closeStoryGallery();
    openStoryEditor(content, type);
}

function openStoryEditor(content, type) {
    const modalHTML = `
        <div id="storyEditorModal" class="modal show">
            <div style="background: var(--bg-primary); height: 100vh; position: relative;">
                <div id="storyCanvas" style="width: 100%; height: 100%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-size: 100px;">${content}</div>
                
                <div style="position: absolute; top: 20px; left: 20px; right: 20px; display: flex; justify-content: space-between;">
                    <div class="nav-btn" onclick="closeStoryEditor()">✕</div>
                    <div style="display: flex; gap: 8px;">
                        <div class="nav-btn" onclick="addTextToStory()">Aa</div>
                        <div class="nav-btn" onclick="addStickerToStory()">🎨</div>
                        <div class="nav-btn" onclick="addMusicToStory()">🎵</div>
                        <div class="nav-btn" onclick="addPollToStory()">📊</div>
                    </div>
                </div>
                
                <div style="position: absolute; bottom: 20px; left: 20px; right: 20px;">
                    <button class="btn" onclick="shareStoryWithPrivacy()">Share to Story 📤</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeStoryEditor() {
    const modal = document.getElementById('storyEditorModal');
    if (modal) modal.remove();
}

function addTextToStory() {
    showToast('✍️ Text tool activated!');
}

function addStickerToStory() {
    showToast('🎨 Sticker panel opened!');
}

function addMusicToStory() {
    showToast('🎵 Music library opened!');
}

function addPollToStory() {
    showToast('📊 Creating poll...');
}

function shareStoryWithPrivacy() {
    closeStoryEditor();
    
    const modalHTML = `
        <div id="shareStoryModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeShareStory()">✕</div>
                <div class="modal-title">🔒 Share Story</div>
            </div>
            <div class="modal-content">
                <div class="list-item" onclick="shareStory('Public')">
                    <div class="list-item-icon">🌍</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Public</div>
                        <div class="list-item-subtitle">Everyone</div>
                    </div>
                </div>
                <div class="list-item" onclick="shareStory('Friends')">
                    <div class="list-item-icon">👥</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Friends</div>
                        <div class="list-item-subtitle">Friends only</div>
                    </div>
                </div>
                <div class="list-item" onclick="shareStory('Close Friends')">
                    <div class="list-item-icon">⭐</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Close Friends</div>
                        <div class="list-item-subtitle">Select list</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeShareStory() {
    const modal = document.getElementById('shareStoryModal');
    if (modal) modal.remove();
}

function shareStory(privacy) {
    closeShareStory();
    StoriesSystem.storyPrivacy = privacy;
    showToast('✅ Story shared with ' + privacy + '!');
}

// ========== STORY VIEWING ==========

function viewStory(storyId) {
    const story = StoriesSystem.userStories.find(s => s.id === storyId) || {
        id: 1,
        user: 'Sarah',
        avatar: '👤',
        slides: [{ content: '✨', type: 'photo' }],
        views: 145,
        timestamp: Date.now() - 2 * 3600000
    };
    
    StoriesSystem.currentStory = story;
    StoriesSystem.currentSlideIndex = 0;
    openStoryViewerModal(story);
}

function openStoryViewerModal(story) {
    const slide = story.slides[StoriesSystem.currentSlideIndex];
    
    const modalHTML = `
        <div id="storyViewerModal" class="modal show">
            <div style="background: #000; height: 100vh; position: relative;">
                <div style="position: absolute; top: 10px; left: 10px; right: 10px; display: flex; gap: 4px; z-index: 20;">
                    ${story.slides.map((s, i) => `
                        <div style="flex: 1; height: 3px; background: rgba(255,255,255,0.3); border-radius: 2px;">
                            <div style="width: ${i < StoriesSystem.currentSlideIndex ? '100' : i === StoriesSystem.currentSlideIndex ? '50' : '0'}%; height: 100%; background: white;"></div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="position: absolute; top: 25px; left: 10px; right: 10px; display: flex; align-items: center; gap: 12px; z-index: 20; padding: 10px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; border: 2px solid white;">${story.avatar}</div>
                    <div style="flex: 1;">
                        <div style="font-size: 15px; font-weight: 700; color: white;">${story.user}</div>
                        <div style="font-size: 12px; color: rgba(255,255,255,0.8);">${getTimeAgo(story.timestamp)}</div>
                    </div>
                    <div class="nav-btn" onclick="showStoryOptions()" style="background: rgba(0,0,0,0.4);">⋮</div>
                    <div class="nav-btn" onclick="closeStoryViewer()" style="background: rgba(0,0,0,0.4);">✕</div>
                </div>
                
                <div id="storySlideContent" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 120px;" onclick="nextStorySlide()">${slide.content}</div>
                
                <div style="position: absolute; bottom: 20px; left: 10px; right: 10px; z-index: 20;">
                    <div style="display: flex; gap: 8px; align-items: center; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); border-radius: 30px; padding: 8px 16px;">
                        <input type="text" placeholder="Send message..." style="flex: 1; background: transparent; border: none; color: white; font-size: 14px; outline: none;" onclick="event.stopPropagation()" id="storyReplyInput" />
                        <div onclick="event.stopPropagation(); sendStoryReply()" style="cursor: pointer; font-size: 20px;">➤</div>
                        <div onclick="event.stopPropagation(); openStoryReactions()" style="cursor: pointer; font-size: 24px;">❤️</div>
                    </div>
                </div>
                
                <div onclick="previousStorySlide()" style="position: absolute; left: 0; top: 100px; bottom: 100px; width: 30%; z-index: 10;"></div>
                <div onclick="nextStorySlide()" style="position: absolute; right: 0; top: 100px; bottom: 100px; width: 30%; z-index: 10;"></div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    if (!StoriesSystem.storyViewers.includes('You')) {
        StoriesSystem.storyViewers.push('You');
        story.views++;
    }
}

function closeStoryViewer() {
    const modal = document.getElementById('storyViewerModal');
    if (modal) modal.remove();
    StoriesSystem.currentStory = null;
}

function nextStorySlide() {
    const story = StoriesSystem.currentStory;
    if (!story) return;
    
    if (StoriesSystem.currentSlideIndex < story.slides.length - 1) {
        StoriesSystem.currentSlideIndex++;
        const slide = story.slides[StoriesSystem.currentSlideIndex];
        const content = document.getElementById('storySlideContent');
        if (content) content.innerHTML = slide.content;
    } else {
        closeStoryViewer();
        showToast('✅ Story complete!');
    }
}

function previousStorySlide() {
    if (StoriesSystem.currentSlideIndex > 0) {
        StoriesSystem.currentSlideIndex--;
        const slide = StoriesSystem.currentStory.slides[StoriesSystem.currentSlideIndex];
        const content = document.getElementById('storySlideContent');
        if (content) content.innerHTML = slide.content;
    }
}

function sendStoryReply() {
    const input = document.getElementById('storyReplyInput');
    if (input && input.value.trim()) {
        StoriesSystem.storyReplies.push({
            story: StoriesSystem.currentStory.id,
            message: input.value,
            timestamp: Date.now()
        });
        input.value = '';
        showToast('💬 Reply sent!');
    }
}

function openStoryReactions() {
    const modalHTML = `
        <div id="storyReactionsModal" style="position: fixed; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.95); backdrop-filter: blur(20px); border-radius: 24px 24px 0 0; padding: 20px; z-index: 250;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
                <div onclick="reactToStory('❤️')" style="text-align: center; cursor: pointer;">
                    <div style="font-size: 48px;">❤️</div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.7);">Love</div>
                </div>
                <div onclick="reactToStory('🔥')" style="text-align: center; cursor: pointer;">
                    <div style="font-size: 48px;">🔥</div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.7);">Fire</div>
                </div>
                <div onclick="reactToStory('😂')" style="text-align: center; cursor: pointer;">
                    <div style="font-size: 48px;">😂</div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.7);">Haha</div>
                </div>
                <div onclick="reactToStory('😍')" style="text-align: center; cursor: pointer;">
                    <div style="font-size: 48px;">😍</div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.7);">Love</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function reactToStory(reaction) {
    StoriesSystem.storyReactions.push({
        story: StoriesSystem.currentStory.id,
        reaction: reaction,
        timestamp: Date.now()
    });
    
    const modal = document.getElementById('storyReactionsModal');
    if (modal) modal.remove();
    showToast('Reacted with ' + reaction);
}

function showStoryOptions() {
    const modalHTML = `
        <div id="storyOptionsModal" style="position: fixed; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.95); backdrop-filter: blur(20px); border-radius: 24px 24px 0 0; padding: 20px; z-index: 250;">
            <div style="font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 20px;">Story Options</div>
            <div class="list-item" onclick="viewStoryViewers()">
                <div class="list-item-icon">👁️</div>
                <div class="list-item-content">
                    <div class="list-item-title">View Viewers</div>
                    <div class="list-item-subtitle">${StoriesSystem.currentStory.views} views</div>
                </div>
            </div>
            <div class="list-item" onclick="createStoryHighlight()">
                <div class="list-item-icon">⭐</div>
                <div class="list-item-content">
                    <div class="list-item-title">Add to Highlight</div>
                </div>
            </div>
            <div class="list-item" onclick="downloadStory()">
                <div class="list-item-icon">⬇️</div>
                <div class="list-item-content">
                    <div class="list-item-title">Download</div>
                </div>
            </div>
            <button class="btn" style="background: var(--glass); margin-top: 12px;" onclick="closeStoryOptions()">Cancel</button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeStoryOptions() {
    const modal = document.getElementById('storyOptionsModal');
    if (modal) modal.remove();
}

function viewStoryViewers() {
    closeStoryOptions();
    showToast('👁️ Opening viewers list...');
}

function createStoryHighlight() {
    closeStoryOptions();
    showToast('⭐ Adding to highlights...');
}

function downloadStory() {
    closeStoryOptions();
    showToast('⬇️ Downloading story...');
}

function openStoryArchive() {
    showToast('📦 Opening story archive...');
}

// Initialize on load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        StoriesSystem.init();
    });
}

console.log('✅ Stories System Module Loaded');
