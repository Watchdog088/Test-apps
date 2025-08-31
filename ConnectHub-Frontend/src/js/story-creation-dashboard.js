/**
 * ConnectHub - Enhanced Story Creation Dashboard
 * Complete implementation based on "+ Your Story Click Interaction Specifications.txt"
 * Comprehensive story creation interface with professional-grade features
 */

class StoryCreationDashboard {
    constructor(app) {
        this.app = app;
        this.cameraStream = null;
        this.currentEffect = 'none';
        this.cameraSettings = {
            facingMode: 'user',
            flashEnabled: false,
            timerSeconds: 0
        };
        this.uploadedMedia = null;
        this.capturedPhoto = null;
        this.selectedMusic = null;
        this.textStorySettings = {
            backgroundColor: '#ffffff',
            fontSize: 24,
            textAlign: 'left'
        };
        this.privacySettings = {
            visibility: 'public',
            duration: '24h',
            allowReplies: 'everyone',
            allowScreenshots: true
        };
        this.drawingCanvas = null;
        this.storyTemplates = this.initializeStoryTemplates();
        this.isDraftSaved = false;
        
        this.init();
    }

    init() {
        console.log('Initializing Enhanced Story Creation Dashboard...');
        this.createStoryCreationModal();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.initializeAutoSave();
        console.log('Story Creation Dashboard initialized successfully');
    }

    /**
     * Main Story Creation Modal Structure
     */
    createStoryCreationModal() {
        if (document.getElementById('story-creation-modal')) return;

        const modalHTML = `
            <div id="story-creation-modal" class="modal story-creation-modal" role="dialog" aria-labelledby="story-modal-title" aria-modal="true">
                <div class="modal-overlay" onclick="storyDashboard.closeStoryCreation()" aria-label="Close modal"></div>
                <div class="story-creation-container">
                    ${this.createModalHeader()}
                    ${this.createModalContent()}
                    ${this.createUniversalControls()}
                    ${this.createActionButtons()}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.addModalStyles();
    }

    createModalHeader() {
        return `
            <div class="story-creation-header">
                <div class="header-left">
                    <h2 id="story-modal-title">Create Story</h2>
                    <div class="story-settings-row">
                        <button class="setting-btn privacy-btn" onclick="storyDashboard.openPrivacySettings()" 
                                title="Privacy Settings" aria-label="Story privacy settings">
                            <i class="fas fa-lock" aria-hidden="true"></i>
                            <span class="setting-label" id="privacy-label">Public</span>
                        </button>
                        <button class="setting-btn duration-btn" onclick="storyDashboard.toggleDuration()" 
                                title="Story Duration" aria-label="Story duration settings">
                            <i class="fas fa-clock" aria-hidden="true"></i>
                            <span class="setting-label" id="duration-label">24h</span>
                        </button>
                    </div>
                </div>
                <button class="close-modal-btn" onclick="storyDashboard.closeStoryCreation()" 
                        title="Close" aria-label="Close story creation">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
            </div>
        `;
    }

    createModalContent() {
        return `
            <div class="story-creation-body">
                ${this.createTabNavigation()}
                ${this.createTabContent()}
            </div>
        `;
    }

    createTabNavigation() {
        return `
            <div class="story-tabs" role="tablist" aria-label="Story creation options">
                <button class="story-tab active" data-tab="camera" role="tab" aria-selected="true" 
                        onclick="storyDashboard.switchTab('camera')" id="camera-tab">
                    <i class="fas fa-camera" aria-hidden="true"></i>
                    <span>Camera</span>
                </button>
                <button class="story-tab" data-tab="text" role="tab" aria-selected="false" 
                        onclick="storyDashboard.switchTab('text')" id="text-tab">
                    <i class="fas fa-font" aria-hidden="true"></i>
                    <span>Text</span>
                </button>
                <button class="story-tab" data-tab="upload" role="tab" aria-selected="false" 
                        onclick="storyDashboard.switchTab('upload')" id="upload-tab">
                    <i class="fas fa-upload" aria-hidden="true"></i>
                    <span>Upload</span>
                </button>
            </div>
        `;
    }

    createTabContent() {
        return `
            <div class="story-tab-content">
                ${this.createCameraTab()}
                ${this.createTextTab()}
                ${this.createUploadTab()}
            </div>
        `;
    }

    /**
     * Camera Tab Implementation
     */
    createCameraTab() {
        return `
            <div class="tab-panel active" data-panel="camera" role="tabpanel" aria-labelledby="camera-tab">
                <div class="camera-container">
                    <div class="camera-preview-area" id="camera-preview-area">
                        <div class="camera-placeholder" id="camera-placeholder">
                            <div class="camera-icon">
                                <i class="fas fa-camera" aria-hidden="true"></i>
                            </div>
                            <h3>Ready to capture your story?</h3>
                            <p>Allow camera permissions to get started</p>
                            <button class="start-camera-btn" onclick="storyDashboard.initializeCamera()" 
                                    aria-label="Start camera">
                                <i class="fas fa-video" aria-hidden="true"></i>
                                Start Camera
                            </button>
                            <div class="camera-fallback" style="display: none;">
                                <p>Camera not available or permission denied</p>
                                <button class="fallback-btn" onclick="storyDashboard.switchTab('upload')"
                                        aria-label="Switch to upload">
                                    <i class="fas fa-upload" aria-hidden="true"></i>
                                    Upload Photo Instead
                                </button>
                            </div>
                        </div>
                        <video id="camera-stream" class="camera-video" autoplay muted playsinline 
                               style="display: none;" aria-label="Live camera feed"></video>
                        <canvas id="camera-canvas" style="display: none;"></canvas>
                        <div class="camera-overlay" id="camera-overlay" style="display: none;">
                            <div class="countdown-timer" id="countdown-timer"></div>
                        </div>
                    </div>
                    
                    <div class="camera-controls" id="camera-controls" style="display: none;">
                        <div class="camera-top-controls">
                            <button class="control-btn flash-btn" onclick="storyDashboard.toggleFlash()" 
                                    title="Flash" aria-label="Toggle flash">
                                <i class="fas fa-bolt" aria-hidden="true"></i>
                                <span id="flash-status">Off</span>
                            </button>
                            <button class="control-btn flip-btn" onclick="storyDashboard.flipCamera()" 
                                    title="Flip Camera" aria-label="Switch camera">
                                <i class="fas fa-sync-alt" aria-hidden="true"></i>
                                <span id="camera-mode">Front</span>
                            </button>
                            <button class="control-btn timer-btn" onclick="storyDashboard.toggleTimer()" 
                                    title="Timer" aria-label="Set timer">
                                <i class="fas fa-stopwatch" aria-hidden="true"></i>
                                <span id="timer-display">0s</span>
                            </button>
                        </div>
                        
                        <div class="capture-controls">
                            <button class="capture-btn" onclick="storyDashboard.capturePhoto()" 
                                    aria-label="Capture photo">
                                <div class="capture-ring">
                                    <div class="capture-inner"></div>
                                </div>
                            </button>
                        </div>
                        
                        <div class="camera-effects">
                            <div class="effects-slider" role="tablist" aria-label="Camera effects">
                                <button class="effect-btn active" data-effect="none" onclick="storyDashboard.applyEffect('none')">Normal</button>
                                <button class="effect-btn" data-effect="vintage" onclick="storyDashboard.applyEffect('vintage')">Vintage</button>
                                <button class="effect-btn" data-effect="cool" onclick="storyDashboard.applyEffect('cool')">Cool</button>
                                <button class="effect-btn" data-effect="warm" onclick="storyDashboard.applyEffect('warm')">Warm</button>
                                <button class="effect-btn" data-effect="bw" onclick="storyDashboard.applyEffect('bw')">B&W</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Text Tab Implementation
     */
    createTextTab() {
        return `
            <div class="tab-panel" data-panel="text" role="tabpanel" aria-labelledby="text-tab">
                <div class="text-story-container">
                    <div class="text-preview-area">
                        <div class="text-story-canvas" id="text-story-canvas">
                            <textarea class="story-text-input" id="story-text-input" 
                                    placeholder="What's on your mind?" maxlength="280" 
                                    aria-label="Story text content"
                                    onkeyup="storyDashboard.updateCharCount()"
                                    oninput="storyDashboard.saveDraft()"></textarea>
                        </div>
                    </div>
                    
                    <div class="text-controls-panel">
                        <div class="control-section">
                            <h4>Background Color</h4>
                            <div class="color-palette">
                                <button class="color-option active" data-color="#ffffff" onclick="storyDashboard.setBackgroundColor('#ffffff')" 
                                        style="background: #ffffff" title="White" aria-label="White background"></button>
                                <button class="color-option" data-color="#ff6b6b" onclick="storyDashboard.setBackgroundColor('#ff6b6b')" 
                                        style="background: #ff6b6b" title="Red" aria-label="Red background"></button>
                                <button class="color-option" data-color="#4ecdc4" onclick="storyDashboard.setBackgroundColor('#4ecdc4')" 
                                        style="background: #4ecdc4" title="Teal" aria-label="Teal background"></button>
                                <button class="color-option" data-color="#45b7d1" onclick="storyDashboard.setBackgroundColor('#45b7d1')" 
                                        style="background: #45b7d1" title="Blue" aria-label="Blue background"></button>
                                <button class="color-option" data-color="#96ceb4" onclick="storyDashboard.setBackgroundColor('#96ceb4')" 
                                        style="background: #96ceb4" title="Green" aria-label="Green background"></button>
                                <button class="color-option" data-color="#feca57" onclick="storyDashboard.setBackgroundColor('#feca57')" 
                                        style="background: #feca57" title="Yellow" aria-label="Yellow background"></button>
                            </div>
                        </div>
                        
                        <div class="control-section">
                            <h4>Text Format</h4>
                            <div class="format-controls">
                                <div class="slider-control">
                                    <label for="font-size-slider">Font Size: <span id="font-size-value">24px</span></label>
                                    <input type="range" id="font-size-slider" min="16" max="48" value="24" 
                                           onchange="storyDashboard.updateFontSize(this.value)" aria-label="Font size">
                                </div>
                                
                                <div class="alignment-controls">
                                    <label>Text Alignment</label>
                                    <div class="align-buttons">
                                        <button class="align-btn active" data-align="left" onclick="storyDashboard.setTextAlign('left')" 
                                                title="Align left" aria-label="Align text left">
                                            <i class="fas fa-align-left" aria-hidden="true"></i>
                                        </button>
                                        <button class="align-btn" data-align="center" onclick="storyDashboard.setTextAlign('center')" 
                                                title="Align center" aria-label="Align text center">
                                            <i class="fas fa-align-center" aria-hidden="true"></i>
                                        </button>
                                        <button class="align-btn" data-align="right" onclick="storyDashboard.setTextAlign('right')" 
                                                title="Align right" aria-label="Align text right">
                                            <i class="fas fa-align-right" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="control-section">
                            <div class="character-counter">
                                <span id="char-count" class="char-count">0</span>/280 characters
                            </div>
                        </div>
                        
                        <div class="control-section">
                            <button class="templates-btn" onclick="storyDashboard.showTemplates()" 
                                    aria-label="Choose story template">
                                <i class="fas fa-magic" aria-hidden="true"></i>
                                Quick Templates
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Upload Tab Implementation
     */
    createUploadTab() {
        return `
            <div class="tab-panel" data-panel="upload" role="tabpanel" aria-labelledby="upload-tab">
                <div class="upload-container">
                    <div class="upload-area" id="upload-drop-zone">
                        <input type="file" id="story-file-input" accept="image/jpeg,image/png,video/mp4" 
                               hidden onchange="storyDashboard.handleFileUpload(this.files[0])" 
                               aria-label="Upload media file">
                        
                        <div class="upload-placeholder" id="upload-placeholder">
                            <div class="upload-icon">
                                <i class="fas fa-cloud-upload-alt" aria-hidden="true"></i>
                            </div>
                            <h3>Upload Photo or Video</h3>
                            <p>Drag & drop files here or click to browse</p>
                            
                            <div class="upload-specs">
                                <div class="spec-item">
                                    <i class="fas fa-camera" aria-hidden="true"></i>
                                    <span>JPG, PNG</span>
                                </div>
                                <div class="spec-item">
                                    <i class="fas fa-video" aria-hidden="true"></i>
                                    <span>MP4 (max 15s)</span>
                                </div>
                                <div class="spec-item">
                                    <i class="fas fa-weight-hanging" aria-hidden="true"></i>
                                    <span>Max 10MB</span>
                                </div>
                            </div>
                            
                            <button class="browse-btn" onclick="storyDashboard.triggerFileSelect()" 
                                    aria-label="Browse for files">
                                <i class="fas fa-folder-open" aria-hidden="true"></i>
                                Browse Files
                            </button>
                        </div>
                        
                        <div class="upload-preview" id="upload-preview" style="display: none;">
                            <div class="preview-media" id="preview-media"></div>
                            <div class="upload-progress" id="upload-progress" style="display: none;">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="progress-fill"></div>
                                </div>
                                <span class="progress-text" id="progress-text">Uploading... 0%</span>
                            </div>
                        </div>
                        
                        <div class="upload-tools" id="upload-tools" style="display: none;">
                            <div class="media-controls">
                                <button class="media-tool-btn" onclick="storyDashboard.cropMedia()" 
                                        title="Crop" aria-label="Crop media">
                                    <i class="fas fa-crop" aria-hidden="true"></i>
                                    Crop
                                </button>
                                <button class="media-tool-btn video-only" onclick="storyDashboard.trimVideo()" 
                                        title="Trim Video" aria-label="Trim video">
                                    <i class="fas fa-cut" aria-hidden="true"></i>
                                    Trim
                                </button>
                                <button class="media-tool-btn" onclick="storyDashboard.openFilters()" 
                                        title="Filters" aria-label="Apply filters">
                                    <i class="fas fa-palette" aria-hidden="true"></i>
                                    Filters
                                </button>
                                <button class="media-tool-btn remove-btn" onclick="storyDashboard.removeMedia()" 
                                        title="Remove" aria-label="Remove media">
                                    <i class="fas fa-trash" aria-hidden="true"></i>
                                    Remove
                                </button>
                            </div>
                            
                            <div class="media-info" id="media-info"></div>
                        </div>
                        
                        <div class="upload-error" id="upload-error" style="display: none;" role="alert">
                            <div class="error-content">
                                <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                                <span class="error-message"></span>
                                <button class="retry-btn" onclick="storyDashboard.retryUpload()" 
                                        aria-label="Retry upload">
                                    <i class="fas fa-redo" aria-hidden="true"></i>
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Universal Story Controls
     */
    createUniversalControls() {
        return `
            <div class="story-universal-controls">
                <div class="overlay-tools">
                    <h4>Enhance Your Story</h4>
                    <div class="tools-row">
                        <button class="tool-btn" onclick="storyDashboard.addTextOverlay()" 
                                title="Add Text" aria-label="Add text overlay">
                            <i class="fas fa-font" aria-hidden="true"></i>
                            <span>Text</span>
                        </button>
                        <button class="tool-btn" onclick="storyDashboard.enableDrawing()" 
                                title="Draw" aria-label="Enable drawing tool">
                            <i class="fas fa-pencil-alt" aria-hidden="true"></i>
                            <span>Draw</span>
                        </button>
                        <button class="tool-btn" onclick="storyDashboard.openStickers()" 
                                title="Stickers" aria-label="Add stickers">
                            <i class="fas fa-smile" aria-hidden="true"></i>
                            <span>Stickers</span>
                        </button>
                        <button class="tool-btn" onclick="storyDashboard.addMusic()" 
                                title="Music" aria-label="Add music">
                            <i class="fas fa-music" aria-hidden="true"></i>
                            <span>Music</span>
                        </button>
                    </div>
                </div>
                
                <div class="story-settings">
                    <div class="settings-row">
                        <div class="setting-group">
                            <label for="reply-setting">Who can reply:</label>
                            <select id="reply-setting" onchange="storyDashboard.updateReplySetting()" 
                                    aria-label="Reply permissions">
                                <option value="everyone">Everyone</option>
                                <option value="friends">Friends</option>
                                <option value="off">Off</option>
                            </select>
                        </div>
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="screenshot-setting" checked 
                                       onchange="storyDashboard.updateScreenshotSetting()">
                                Allow screenshots
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Action Buttons
     */
    createActionButtons() {
        return `
            <div class="story-actions">
                <button class="action-btn cancel-btn" onclick="storyDashboard.cancelCreation()" 
                        aria-label="Cancel story creation">
                    <i class="fas fa-times" aria-hidden="true"></i>
                    Cancel
                </button>
                <div class="action-group">
                    <button class="action-btn draft-btn" onclick="storyDashboard.saveDraft(true)" 
                            title="Save as draft" aria-label="Save as draft">
                        <i class="fas fa-save" aria-hidden="true"></i>
                        Save Draft
                    </button>
                    <button class="action-btn publish-btn primary" onclick="storyDashboard.publishStory()" 
                            aria-label="Publish story">
                        <i class="fas fa-share" aria-hidden="true"></i>
                        Share Story
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Event Listeners Setup
     */
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('story-creation-modal');
            if (!modal || !modal.classList.contains('show')) return;

            if (e.key === 'Escape') {
                this.closeStoryCreation();
            } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                this.publishStory();
            }
        });

        // Auto-save on input changes
        document.addEventListener('input', (e) => {
            if (e.target.id === 'story-text-input') {
                this.saveDraft();
            }
        });

        // Handle + Your Story button clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-story') || e.target.closest('.add-story-btn')) {
                e.preventDefault();
                this.openStoryCreation();
            }
        });
    }

    /**
     * Drag and Drop Implementation
     */
    setupDragAndDrop() {
        let dragCounter = 0;

        document.addEventListener('dragenter', (e) => {
            if (this.isValidFile(e)) {
                dragCounter++;
                this.showDropZone();
            }
        });

        document.addEventListener('dragleave', (e) => {
            dragCounter--;
            if (dragCounter <= 0) {
                this.hideDropZone();
            }
        });

        document.addEventListener('dragover', (e) => {
            if (this.isValidFile(e)) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            }
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            dragCounter = 0;
            this.hideDropZone();
            
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });
    }

    isValidFile(e) {
        if (!e.dataTransfer) return false;
        const items = Array.from(e.dataTransfer.items);
        return items.some(item => item.type.startsWith('image/') || item.type.startsWith('video/'));
    }

    showDropZone() {
        const modal = document.getElementById('story-creation-modal');
        if (modal) {
            modal.classList.add('drag-active');
        }
    }

    hideDropZone() {
        const modal = document.getElementById('story-creation-modal');
        if (modal) {
            modal.classList.remove('drag-active');
        }
    }

    /**
     * Auto-save functionality
     */
    initializeAutoSave() {
        this.autoSaveTimer = setInterval(() => {
            this.saveDraft();
        }, 30000); // Auto-save every 30 seconds
    }

    saveDraft(manual = false) {
        const activeTab = document.querySelector('.story-tab.active')?.dataset.tab;
        const draft = {
            timestamp: new Date().toISOString(),
            tab: activeTab,
            content: null,
            settings: this.textStorySettings,
            privacy: this.privacySettings
        };

        if (activeTab === 'text') {
            const textInput = document.getElementById('story-text-input');
            if (textInput && textInput.value.trim()) {
                draft.content = {
                    type: 'text',
                    text: textInput.value,
                    settings: this.textStorySettings
                };
            }
        } else if (activeTab === 'camera' && this.capturedPhoto) {
            draft.content = {
                type: 'camera',
                hasPhoto: true
            };
        } else if (activeTab === 'upload' && this.uploadedMedia) {
            draft.content = {
                type: 'upload',
                hasMedia: true
            };
        }

        if (draft.content || manual) {
            localStorage.setItem('connecthub_story_draft', JSON.stringify(draft));
            this.isDraftSaved = true;
            
            if (manual) {
                this.showToast('Draft saved successfully!', 'success');
            }
        }
    }

    loadDraft() {
        try {
            const draftJson = localStorage.getItem('connecthub_story_draft');
            if (draftJson) {
                const draft = JSON.parse(draftJson);
                const draftAge = Date.now() - new Date(draft.timestamp).getTime();
                
                // Only load drafts from the last 24 hours
                if (draftAge < 24 * 60 * 60 * 1000) {
                    return draft;
                } else {
                    localStorage.removeItem('connecthub_story_draft');
                }
            }
        } catch (error) {
            console.error('Failed to load draft:', error);
            localStorage.removeItem('connecthub_story_draft');
        }
        return null;
    }

    clearDraft() {
        localStorage.removeItem('connecthub_story_draft');
        this.isDraftSaved = false;
        
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
    }

    /**
     * Modal Control Methods
     */
    openStoryCreation() {
        const modal = document.getElementById('story-creation-modal');
        if (modal) {
            modal.classList.add('show');
            document.body.classList.add('modal-open');
            
            // Load draft if available
            const draft = this.loadDraft();
            if (draft) {
                this.restoreDraft(draft);
            }
            
            // Focus on appropriate element
            this.focusDefaultElement();
        }
    }

    closeStoryCreation() {
        const modal = document.getElementById('story-creation-modal');
        if (modal) {
            // Check if there's unsaved content
            if (this.hasUnsavedContent()) {
                if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
                    return;
                }
            }
            
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
            
            // Cleanup
            this.stopCamera();
            this.clearDraft();
            this.resetForm();
        }
    }

    hasUnsavedContent() {
        const textInput = document.getElementById('story-text-input');
        return (textInput && textInput.value.trim()) || 
               this.capturedPhoto || 
               this.uploadedMedia;
    }

    resetForm() {
        // Reset all form elements
        const textInput = document.getElementById('story-text-input');
        if (textInput) {
            textInput.value = '';
        }
        
        // Reset settings
        this.textStorySettings = {
            backgroundColor: '#ffffff',
            fontSize: 24,
            textAlign: 'left'
        };
        
        // Clear media
        this.capturedPhoto = null;
        this.uploadedMedia = null;
        this.selectedMusic = null;
        
        // Reset UI elements
        this.updateCharCount();
        this.switchTab('camera');
    }

    focusDefaultElement() {
        setTimeout(() => {
            const activeTab = document.querySelector('.story-tab.active')?.dataset.tab;
            if (activeTab === 'text') {
                document.getElementById('story-text-input')?.focus();
            }
        }, 100);
    }

    restoreDraft(draft) {
        if (draft.tab) {
            this.switchTab(draft.tab);
        }
        
        if (draft.content && draft.content.type === 'text') {
            const textInput = document.getElementById('story-text-input');
            if (textInput) {
                textInput.value = draft.content.text;
                this.updateCharCount();
            }
        }
        
        if (draft.settings) {
            this.textStorySettings = { ...this.textStorySettings, ...draft.settings };
        }
        
        if (draft.privacy) {
            this.privacySettings = { ...this.privacySettings, ...draft.privacy };
        }
        
        this.showToast('Draft restored', 'info');
    }

    /**
     * Tab Management
     */
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.story-tab').forEach(tab => {
            const isActive = tab.dataset.tab === tabName;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
        });

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            const isActive = panel.dataset.panel === tabName;
            panel.classList.toggle('active', isActive);
        });

        // Tab-specific initialization
        if (tabName === 'text') {
            setTimeout(() => this.updateCharCount(), 100);
        }
        
        this.saveDraft();
    }

    /**
     * Camera Functionality
     */
    async initializeCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: this.cameraSettings.facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            const video = document.getElementById('camera-stream');
            const placeholder = document.getElementById('camera-placeholder');
            const controls = document.getElementById('camera-controls');
            
            if (video && placeholder && controls) {
                video.srcObject = this.cameraStream;
                video.style.display = 'block';
                placeholder.style.display = 'none';
                controls.style.display = 'block';
                
                this.showToast('Camera started successfully!', 'success');
            }
        } catch (error) {
            console.error('Camera initialization failed:', error);
            this.showCameraFallback();
        }
    }

    showCameraFallback() {
        const placeholder = document.getElementById('camera-placeholder');
        const fallback = placeholder?.querySelector('.camera-fallback');
        
        if (fallback) {
            fallback.style.display = 'block';
        }
        
        this.showToast('Camera access denied. Please use upload instead.', 'warning');
    }

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        const video = document.getElementById('camera-stream');
        if (video) {
            video.srcObject = null;
        }
    }

    toggleFlash() {
        this.cameraSettings.flashEnabled = !this.cameraSettings.flashEnabled;
        
        const flashStatus = document.getElementById('flash-status');
        const flashBtn = document.querySelector('.flash-btn');
        
        if (flashStatus) {
            flashStatus.textContent = this.cameraSettings.flashEnabled ? 'On' : 'Off';
        }
        
        if (flashBtn) {
            flashBtn.classList.toggle('active', this.cameraSettings.flashEnabled);
        }
        
        this.showToast(`Flash ${this.cameraSettings.flashEnabled ? 'enabled' : 'disabled'}`, 'info');
    }

    flipCamera() {
        this.cameraSettings.facingMode = this.cameraSettings.facingMode === 'user' ? 'environment' : 'user';
        
        const cameraMode = document.getElementById('camera-mode');
        if (cameraMode) {
            cameraMode.textContent = this.cameraSettings.facingMode === 'user' ? 'Front' : 'Back';
        }
        
        // Restart camera with new settings
        this.stopCamera();
        this.initializeCamera();
    }

    toggleTimer() {
        const timerOptions = [0, 3, 10];
        const currentIndex = timerOptions.indexOf(this.cameraSettings.timerSeconds);
        const nextIndex = (currentIndex + 1) % timerOptions.length;
        this.cameraSettings.timerSeconds = timerOptions[nextIndex];
        
        const timerDisplay = document.getElementById('timer-display');
        const timerBtn = document.querySelector('.timer-btn');
        
        if (timerDisplay) {
            timerDisplay.textContent = this.cameraSettings.timerSeconds + 's';
        }
        
        if (timerBtn) {
            timerBtn.classList.toggle('active', this.cameraSettings.timerSeconds > 0);
        }
        
        if (this.cameraSettings.timerSeconds > 0) {
            this.showToast(`Timer set to ${this.cameraSettings.timerSeconds} seconds`, 'info');
        } else {
            this.showToast('Timer disabled', 'info');
        }
    }

    async capturePhoto() {
        if (this.cameraSettings.timerSeconds > 0) {
            await this.startCountdown();
        }
        
        const video = document.getElementById('camera-stream');
        const canvas = document.getElementById('camera-canvas');
        
        if (video && canvas && video.videoWidth && video.videoHeight) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Apply current effect
            this.applyCameraFilter(context);
            
            // Draw the video frame
            context.drawImage(video, 0, 0);
            
            // Convert to data URL
            this.capturedPhoto = canvas.toDataURL('image/jpeg', 0.8);
            
            this.showCapturePreview();
            this.showToast('Photo captured!', 'success');
        }
    }

    async startCountdown() {
        const overlay = document.getElementById('camera-overlay');
        const timer = document.getElementById('countdown-timer');
        
        if (overlay && timer) {
            overlay.style.display = 'flex';
            
            for (let i = this.cameraSettings.timerSeconds; i > 0; i--) {
                timer.textContent = i;
                timer.style.transform = 'scale(1.5)';
                
                await new Promise(resolve => setTimeout(resolve, 200));
                timer.style.transform = 'scale(1)';
                await new Promise(resolve => setTimeout(resolve, 800));
            }
            
            timer.textContent = '';
            overlay.style.display = 'none';
        }
    }

    showCapturePreview() {
        if (!this.capturedPhoto) return;
        
        const previewArea = document.getElementById('camera-preview-area');
        if (previewArea) {
            previewArea.innerHTML = `
                <div class="capture-preview">
                    <img src="${this.capturedPhoto}" alt="Captured photo" class="captured-image">
                    <div class="capture-actions">
                        <button class="action-btn secondary" onclick="storyDashboard.retakePhoto()">
                            <i class="fas fa-redo"></i>
                            Retake
                        </button>
                        <button class="action-btn primary" onclick="storyDashboard.usePhoto()">
                            <i class="fas fa-check"></i>
                            Use Photo
                        </button>
                    </div>
                </div>
            `;
        }
    }

    retakePhoto() {
        this.capturedPhoto = null;
        this.initializeCamera();
    }

    usePhoto() {
        this.showToast('Photo ready for publishing!', 'success');
        // Photo is already stored in this.capturedPhoto
    }

    applyEffect(effectName) {
        this.currentEffect = effectName;
        
        // Update UI
        document.querySelectorAll('.effect-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.effect === effectName);
        });
        
        // Apply visual effect to camera stream
        const video = document.getElementById('camera-stream');
        if (video) {
            video.style.filter = this.getEffectFilter(effectName);
        }
        
        this.showToast(`Applied ${effectName} effect`, 'info');
    }

    getEffectFilter(effectName) {
        switch (effectName) {
            case 'vintage':
                return 'sepia(0.8) contrast(1.2) brightness(0.9)';
            case 'cool':
                return 'hue-rotate(180deg) saturate(1.2)';
            case 'warm':
                return 'hue-rotate(45deg) saturate(1.1) brightness(1.1)';
            case 'bw':
                return 'grayscale(1) contrast(1.2)';
            case 'none':
            default:
                return 'none';
        }
    }

    applyCameraFilter(context) {
        // This would apply the filter to the canvas context
        // For now, we'll just apply the CSS filter to the video element
    }

    /**
     * Text Story Functionality
     */
    setBackgroundColor(color) {
        this.textStorySettings.backgroundColor = color;
        
        // Update UI
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('active', option.dataset.color === color);
        });
        
        const textInput = document.getElementById('story-text-input');
        if (textInput) {
            textInput.style.backgroundColor = color;
            textInput.style.color = this.getContrastColor(color);
        }
        
        this.saveDraft();
    }

    getContrastColor(hexColor) {
        // Simple contrast calculation
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    updateFontSize(size) {
        this.textStorySettings.fontSize = parseInt(size);
        
        const textInput = document.getElementById('story-text-input');
        const fontSizeValue = document.getElementById('font-size-value');
        
        if (textInput) {
            textInput.style.fontSize = size + 'px';
        }
        
        if (fontSizeValue) {
            fontSizeValue.textContent = size + 'px';
        }
        
        this.saveDraft();
    }

    setTextAlign(alignment) {
        this.textStorySettings.textAlign = alignment;
        
        // Update UI
        document.querySelectorAll('.align-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.align === alignment);
        });
        
        const textInput = document.getElementById('story-text-input');
        if (textInput) {
            textInput.style.textAlign = alignment;
        }
        
        this.saveDraft();
    }

    updateCharCount() {
        const textInput = document.getElementById('story-text-input');
        const charCount = document.getElementById('char-count');
        
        if (textInput && charCount) {
            const length = textInput.value.length;
            charCount.textContent = length;
            
            // Update color based on usage
            if (length > 250) {
                charCount.style.color = 'var(--error-color, #e74c3c)';
            } else if (length > 200) {
                charCount.style.color = 'var(--warning-color, #f39c12)';
            } else {
                charCount.style.color = 'var(--text-secondary, #666)';
            }
        }
    }

    /**
     * File Upload Functionality
     */
    triggerFileSelect() {
        const fileInput = document.getElementById('story-file-input');
        if (fileInput) {
            fileInput.click();
        }
    }

    async handleFileUpload(file) {
        if (!file) return;

        // Validate file
        const validation = this.validateFile(file);
        if (!validation.valid) {
            this.showUploadError(validation.error);
            return;
        }

        // Show upload progress
        this.showUploadProgress();

        try {
            // Simulate upload progress
            await this.simulateUpload();
            
            // Process file
            const reader = new FileReader();
            reader.onload = (e) => {
                this.uploadedMedia = {
                    file: file,
                    dataUrl: e.target.result,
                    type: file.type.startsWith('video/') ? 'video' : 'image'
                };
                
                this.showMediaPreview();
                this.showToast('File uploaded successfully!', 'success');
            };
            
            reader.readAsDataURL(file);
            
        } catch (error) {
            console.error('Upload failed:', error);
            this.showUploadError('Upload failed. Please try again.');
        }
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
        
        if (file.size > maxSize) {
            return { valid: false, error: 'File must be under 10MB' };
        }
        
        if (!allowedTypes.includes(file.type)) {
            return { valid: false, error: 'Only JPG, PNG, and MP4 files are allowed' };
        }
        
        return { valid: true };
    }

    async simulateUpload() {
        const progressBar = document.getElementById('upload-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        for (let i = 0; i <= 100; i += 10) {
            if (progressFill) progressFill.style.width = i + '%';
            if (progressText) progressText.textContent = `Uploading... ${i}%`;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (progressBar) progressBar.style.display = 'none';
    }

    showUploadProgress() {
        const placeholder = document.getElementById('upload-placeholder');
        const preview = document.getElementById('upload-preview');
        const progress = document.getElementById('upload-progress');
        
        if (placeholder) placeholder.style.display = 'none';
        if (preview) preview.style.display = 'block';
        if (progress) progress.style.display = 'block';
    }

    showMediaPreview() {
        const previewMedia = document.getElementById('preview-media');
        const uploadTools = document.getElementById('upload-tools');
        const mediaInfo = document.getElementById('media-info');
        
        if (previewMedia && this.uploadedMedia) {
            const mediaElement = this.uploadedMedia.type === 'video' 
                ? `<video src="${this.uploadedMedia.dataUrl}" controls class="preview-video"></video>`
                : `<img src="${this.uploadedMedia.dataUrl}" alt="Uploaded media" class="preview-image">`;
            
            previewMedia.innerHTML = mediaElement;
        }
        
        if (uploadTools) {
            uploadTools.style.display = 'block';
            
            // Show/hide video-only controls
            const videoControls = uploadTools.querySelectorAll('.video-only');
            videoControls.forEach(control => {
                control.style.display = this.uploadedMedia.type === 'video' ? 'inline-flex' : 'none';
            });
        }
        
        if (mediaInfo && this.uploadedMedia) {
            const sizeInMB = (this.uploadedMedia.file.size / 1024 / 1024).toFixed(2);
            mediaInfo.innerHTML = `
                <div class="info-item">
                    <i class="fas fa-file"></i>
                    <span>${this.uploadedMedia.file.name}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-weight"></i>
                    <span>${sizeInMB} MB</span>
                </div>
            `;
        }
    }

    showUploadError(message) {
        const uploadError = document.getElementById('upload-error');
        const errorMessage = uploadError?.querySelector('.error-message');
        
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        
        if (uploadError) {
            uploadError.style.display = 'block';
        }
        
        this.showToast(message, 'error');
    }

    hideUploadError() {
        const uploadError = document.getElementById('upload-error');
        if (uploadError) {
            uploadError.style.display = 'none';
        }
    }

    retryUpload() {
        this.hideUploadError();
        const fileInput = document.getElementById('story-file-input');
        if (fileInput && fileInput.files.length > 0) {
            this.handleFileUpload(fileInput.files[0]);
        }
    }

    removeMedia() {
        this.uploadedMedia = null;
        
        // Reset UI
        const placeholder = document.getElementById('upload-placeholder');
        const preview = document.getElementById('upload-preview');
        const uploadTools = document.getElementById('upload-tools');
        const fileInput = document.getElementById('story-file-input');
        
        if (placeholder) placeholder.style.display = 'block';
        if (preview) preview.style.display = 'none';
        if (uploadTools) uploadTools.style.display = 'none';
        if (fileInput) fileInput.value = '';
        
        this.hideUploadError();
        this.showToast('Media removed', 'info');
    }

    cropMedia() {
        this.showToast('Crop tool opened! (Demo mode)', 'info');
        // In a real implementation, this would open a crop interface
    }

    trimVideo() {
        this.showToast('Video trim tool opened! (Demo mode)', 'info');
        // In a real implementation, this would open a video trimming interface
    }

    openFilters() {
        this.showToast('Filter editor opened! (Demo mode)', 'info');
        // In a real implementation, this would open a filter editor
    }

    /**
     * Universal Controls Implementation
     */
    addTextOverlay() {
        this.showToast('Text overlay tool activated! (Demo mode)', 'info');
        // In a real implementation, this would add draggable text overlays
    }

    enableDrawing() {
        const drawingBtn = document.querySelector('.tool-btn');
        if (drawingBtn) {
            drawingBtn.classList.toggle('active');
            this.showToast('Drawing mode toggled! (Demo mode)', 'info');
        }
    }

    openStickers() {
        this.createStickerModal();
    }

    createStickerModal() {
        const stickerModal = document.createElement('div');
        stickerModal.className = 'sticker-modal';
        stickerModal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="sticker-content">
                <h3>Choose Stickers</h3>
                <div class="sticker-grid">
                    <button class="sticker-item" onclick="storyDashboard.addSticker('❤️')">❤️</button>
                    <button class="sticker-item" onclick="storyDashboard.addSticker('😍')">😍</button>
                    <button class="sticker-item" onclick="storyDashboard.addSticker('🔥')">🔥</button>
                    <button class="sticker-item" onclick="storyDashboard.addSticker('💯')">💯</button>
                    <button class="sticker-item" onclick="storyDashboard.addSticker('⭐')">⭐</button>
                    <button class="sticker-item" onclick="storyDashboard.addSticker('🎉')">🎉</button>
                    <button class="sticker-item" onclick="storyDashboard.addSticker('✨')">✨</button>
                    <button class="sticker-item" onclick="storyDashboard.addSticker('🌟')">🌟</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(stickerModal);
    }

    addSticker(emoji) {
        this.showToast(`Added ${emoji} sticker!`, 'success');
        document.querySelector('.sticker-modal')?.remove();
    }

    addMusic() {
        this.createMusicModal();
    }

    createMusicModal() {
        const musicModal = document.createElement('div');
        musicModal.className = 'music-modal';
        musicModal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="music-content">
                <h3>Add Music</h3>
                <div class="music-search">
                    <input type="text" placeholder="Search music..." class="music-search-input">
                </div>
                <div class="music-list">
                    <div class="music-item" onclick="storyDashboard.selectMusic('Chill Vibes', 'Lo-Fi Beats')">
                        <div class="music-info">
                            <span class="song-title">Chill Vibes</span>
                            <span class="artist-name">Lo-Fi Beats</span>
                        </div>
                        <button class="play-btn">▶️</button>
                    </div>
                    <div class="music-item" onclick="storyDashboard.selectMusic('Summer Nights', 'Ambient Sounds')">
                        <div class="music-info">
                            <span class="song-title">Summer Nights</span>
                            <span class="artist-name">Ambient Sounds</span>
                        </div>
                        <button class="play-btn">▶️</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(musicModal);
    }

    selectMusic(title, artist) {
        this.selectedMusic = { title, artist };
        this.showToast(`Added "${title}" by ${artist}`, 'success');
        document.querySelector('.music-modal')?.remove();
    }

    /**
     * Settings Management
     */
    updateReplySetting() {
        const replySetting = document.getElementById('reply-setting');
        if (replySetting) {
            this.privacySettings.allowReplies = replySetting.value;
            this.showToast(`Reply setting updated to: ${replySetting.value}`, 'info');
        }
    }

    updateScreenshotSetting() {
        const screenshotSetting = document.getElementById('screenshot-setting');
        if (screenshotSetting) {
            this.privacySettings.allowScreenshots = screenshotSetting.checked;
            const status = screenshotSetting.checked ? 'enabled' : 'disabled';
            this.showToast(`Screenshots ${status}`, 'info');
        }
    }

    openPrivacySettings() {
        this.createPrivacyModal();
    }

    createPrivacyModal() {
        const privacyModal = document.createElement('div');
        privacyModal.className = 'privacy-modal';
        privacyModal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="privacy-content">
                <h3>Privacy Settings</h3>
                <div class="privacy-options">
                    <h4>Who can see your story?</h4>
                    <div class="radio-group">
                        <label class="radio-option">
                            <input type="radio" name="visibility" value="public" ${this.privacySettings.visibility === 'public' ? 'checked' : ''}>
                            <span>Everyone</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="visibility" value="friends" ${this.privacySettings.visibility === 'friends' ? 'checked' : ''}>
                            <span>Friends Only</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="visibility" value="custom" ${this.privacySettings.visibility === 'custom' ? 'checked' : ''}>
                            <span>Custom</span>
                        </label>
                    </div>
                </div>
                <div class="privacy-actions">
                    <button class="action-btn secondary" onclick="this.parentElement.parentElement.remove()">Cancel</button>
                    <button class="action-btn primary" onclick="storyDashboard.savePrivacySettings()">Save</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(privacyModal);
    }

    savePrivacySettings() {
        const selectedVisibility = document.querySelector('input[name="visibility"]:checked')?.value;
        if (selectedVisibility) {
            this.privacySettings.visibility = selectedVisibility;
            
            const privacyLabel = document.getElementById('privacy-label');
            if (privacyLabel) {
                const labels = {
                    'public': 'Public',
                    'friends': 'Friends',
                    'custom': 'Custom'
                };
                privacyLabel.textContent = labels[selectedVisibility];
            }
            
            this.showToast(`Privacy updated to: ${selectedVisibility}`, 'success');
        }
        
        document.querySelector('.privacy-modal')?.remove();
    }

    toggleDuration() {
        const durations = ['1h', '6h', '24h'];
        const currentIndex = durations.indexOf(this.privacySettings.duration);
        const nextIndex = (currentIndex + 1) % durations.length;
        this.privacySettings.duration = durations[nextIndex];
        
        const durationLabel = document.getElementById('duration-label');
        if (durationLabel) {
            durationLabel.textContent = this.privacySettings.duration;
        }
        
        this.showToast(`Story duration set to ${this.privacySettings.duration}`, 'info');
    }

    /**
     * Story Templates
     */
    initializeStoryTemplates() {
        return [
            {
                id: 'good-morning',
                name: 'Good Morning',
                background: '#FFA07A',
                text: 'Good morning! ☀️ Have a wonderful day ahead!',
                fontSize: 32,
                textAlign: 'center'
            },
            {
                id: 'workout',
                name: 'Workout',
                background: '#FF6347',
                text: 'Workout time! 💪 Let\'s get those gains!',
                fontSize: 28,
                textAlign: 'center'
            },
            {
                id: 'food',
                name: 'Food',
                background: '#FFD700',
                text: 'This looks delicious! 🍽️✨',
                fontSize: 30,
                textAlign: 'center'
            },
            {
                id: 'travel',
                name: 'Travel',
                background: '#87CEEB',
                text: 'Adventure awaits! ✈️🌍 Ready to explore!',
                fontSize: 26,
                textAlign: 'center'
            }
        ];
    }

    showTemplates() {
        this.createTemplatesModal();
    }

    createTemplatesModal() {
        const templatesModal = document.createElement('div');
        templatesModal.className = 'templates-modal';
        templatesModal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="templates-content">
                <h3>Story Templates</h3>
                <div class="templates-grid">
                    ${this.storyTemplates.map(template => `
                        <div class="template-item" onclick="storyDashboard.applyTemplate('${template.id}')">
                            <div class="template-preview" style="background-color: ${template.background}">
                                <span style="font-size: 14px; text-align: ${template.textAlign}; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">
                                    ${template.text.length > 30 ? template.text.substring(0, 30) + '...' : template.text}
                                </span>
                            </div>
                            <span class="template-name">${template.name}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="action-btn secondary" onclick="this.parentElement.remove()">Close</button>
            </div>
        `;
        
        document.body.appendChild(templatesModal);
    }

    applyTemplate(templateId) {
        const template = this.storyTemplates.find(t => t.id === templateId);
        if (!template) return;
        
        // Switch to text tab
        this.switchTab('text');
        
        // Apply template settings
        setTimeout(() => {
            const textInput = document.getElementById('story-text-input');
            if (textInput) {
                textInput.value = template.text;
                this.updateCharCount();
            }
            
            this.setBackgroundColor(template.background);
            this.updateFontSize(template.fontSize);
            this.setTextAlign(template.textAlign);
            
            this.showToast(`Applied ${template.name} template!`, 'success');
        }, 100);
        
        document.querySelector('.templates-modal')?.remove();
    }

    /**
     * Publishing and Actions
     */
    async publishStory() {
        try {
            // Validate content
            const validation = this.validateStoryContent();
            if (!validation.valid) {
                this.showToast(validation.error, 'warning');
                return;
            }

            // Show loading state
            this.setPublishingState(true);

            // Simulate publishing with progress
            await this.simulatePublishing();

            // Create story object
            const story = this.createStoryObject();

            // Show success
            this.showToast('Story published successfully!', 'success');
            
            // Show post-publication options
            this.showPostPublicationOptions(story);
            
            // Close modal
            this.closeStoryCreation();
            
            // Add to user's story ring (if app method available)
            if (this.app && this.app.addUserStory) {
                this.app.addUserStory(story);
            }

        } catch (error) {
            console.error('Publishing failed:', error);
            this.showToast('Failed to publish story. Please try again.', 'error');
        } finally {
            this.setPublishingState(false);
        }
    }

    validateStoryContent() {
        const activeTab = document.querySelector('.story-tab.active')?.dataset.tab;
        
        if (activeTab === 'text') {
            const textInput = document.getElementById('story-text-input');
            if (!textInput || !textInput.value.trim()) {
                return { valid: false, error: 'Please add some text to your story' };
            }
        } else if (activeTab === 'camera') {
            if (!this.capturedPhoto) {
                return { valid: false, error: 'Please capture a photo first' };
            }
        } else if (activeTab === 'upload') {
            if (!this.uploadedMedia) {
                return { valid: false, error: 'Please upload a photo or video' };
            }
        }
        
        return { valid: true };
    }

    async simulatePublishing() {
        const steps = [
            'Preparing your story...',
            'Processing media...',
            'Applying privacy settings...',
            'Publishing to feed...',
            'Story published!'
        ];
        
        for (let i = 0; i < steps.length; i++) {
            this.showToast(steps[i], 'info');
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    }

    createStoryObject() {
        const activeTab = document.querySelector('.story-tab.active')?.dataset.tab;
        const story = {
            id: `story-${Date.now()}`,
            timestamp: new Date(),
            privacy: this.privacySettings,
            music: this.selectedMusic,
            type: activeTab
        };

        if (activeTab === 'text') {
            const textInput = document.getElementById('story-text-input');
            story.content = {
                text: textInput?.value || '',
                settings: this.textStorySettings
            };
        } else if (activeTab === 'camera') {
            story.content = {
                photo: this.capturedPhoto,
                effect: this.currentEffect
            };
        } else if (activeTab === 'upload') {
            story.content = {
                media: this.uploadedMedia
            };
        }

        return story;
    }

    setPublishingState(isPublishing) {
        const publishBtn = document.querySelector('.publish-btn');
        
        if (publishBtn) {
            publishBtn.disabled = isPublishing;
            
            if (isPublishing) {
                publishBtn.innerHTML = `
                    <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
                    Publishing...
                `;
            } else {
                publishBtn.innerHTML = `
                    <i class="fas fa-share" aria-hidden="true"></i>
                    Share Story
                `;
            }
        }
    }

    showPostPublicationOptions(story) {
        const optionsModal = document.createElement('div');
        optionsModal.className = 'post-publication-modal';
        optionsModal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="publication-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Story Published!</h3>
                <p>Your story is now live and visible to your audience</p>
                
                <div class="post-options">
                    <button class="option-btn" onclick="storyDashboard.viewStory('${story.id}')">
                        <i class="fas fa-eye"></i>
                        View Story
                    </button>
                    <button class="option-btn" onclick="storyDashboard.shareExternal('${story.id}')">
                        <i class="fas fa-share-alt"></i>
                        Share to Other Platforms
                    </button>
                    <button class="option-btn" onclick="storyDashboard.viewAnalytics('${story.id}')">
                        <i class="fas fa-chart-line"></i>
                        View Analytics
                    </button>
                </div>
                
                <button class="action-btn primary" onclick="this.parentElement.remove()">
                    Continue
                </button>
            </div>
        `;
        
        document.body.appendChild(optionsModal);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (optionsModal.parentElement) {
                optionsModal.remove();
            }
        }, 10000);
    }

    viewStory(storyId) {
        this.showToast('Opening story viewer...', 'info');
        document.querySelector('.post-publication-modal')?.remove();
        // In a real implementation, this would open the story viewer
    }

    shareExternal(storyId) {
        this.showToast('Opening share options...', 'info');
        document.querySelector('.post-publication-modal')?.remove();
        // In a real implementation, this would open external sharing options
    }

    viewAnalytics(storyId) {
        this.showToast('Opening analytics...', 'info');
        document.querySelector('.post-publication-modal')?.remove();
        // In a real implementation, this would open story analytics
    }

    cancelCreation() {
        if (this.hasUnsavedContent()) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                this.closeStoryCreation();
            }
        } else {
            this.closeStoryCreation();
        }
    }

    /**
     * Utility Methods
     */
    showToast(message, type = 'info') {
        // Use app's toast method if available, otherwise create our own
        if (this.app && this.app.showToast) {
            this.app.showToast(message, type);
        } else {
            this.createToast(message, type);
        }
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `story-toast story-toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    getToastIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * Add Modal Styles
     */
    addModalStyles() {
        if (document.getElementById('story-creation-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'story-creation-styles';
        styles.textContent = `
            /* Story Creation Modal Styles */
            .story-creation-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }

            .story-creation-modal.show {
                display: flex;
            }

            .story-creation-container {
                background: white;
                border-radius: 16px;
                width: 90%;
                max-width: 900px;
                height: 90vh;
                max-height: 800px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .story-creation-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .story-creation-header h2 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }

            .story-settings-row {
                display: flex;
                gap: 12px;
                margin-top: 8px;
            }

            .setting-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: #f5f5f5;
                border: none;
                border-radius: 20px;
                font-size: 12px;
                cursor: pointer;
                transition: background 0.2s;
            }

            .setting-btn:hover {
                background: #e9e9e9;
            }

            .close-modal-btn {
                width: 36px;
                height: 36px;
                border: none;
                background: #f5f5f5;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background 0.2s;
            }

            .close-modal-btn:hover {
                background: #e9e9e9;
            }

            .story-creation-body {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .story-tabs {
                display: flex;
                border-bottom: 1px solid #eee;
                background: #fafafa;
            }

            .story-tab {
                flex: 1;
                padding: 16px;
                border: none;
                background: transparent;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-weight: 500;
                color: #666;
                cursor: pointer;
                transition: all 0.2s;
            }

            .story-tab.active {
                color: #007bff;
                background: white;
                border-bottom: 2px solid #007bff;
            }

            .story-tab-content {
                flex: 1;
                overflow: hidden;
            }

            .tab-panel {
                height: 100%;
                display: none;
            }

            .tab-panel.active {
                display: flex;
                flex-direction: column;
            }

            /* Camera Tab Styles */
            .camera-container {
                height: 100%;
                display: flex;
                flex-direction: column;
            }

            .camera-preview-area {
                flex: 1;
                background: #000;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .camera-placeholder {
                text-align: center;
                color: white;
            }

            .camera-placeholder h3 {
                margin: 16px 0 8px;
                font-size: 20px;
            }

            .camera-placeholder p {
                margin: 0 0 24px;
                opacity: 0.8;
            }

            .start-camera-btn, .fallback-btn {
                padding: 12px 24px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 0 auto;
            }

            .camera-video {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .camera-controls {
                padding: 20px;
                background: white;
            }

            .camera-top-controls {
                display: flex;
                justify-content: center;
                gap: 24px;
                margin-bottom: 20px;
            }

            .control-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                padding: 12px;
                border: none;
                background: #f5f5f5;
                border-radius: 12px;
                cursor: pointer;
                min-width: 80px;
                transition: background 0.2s;
            }

            .control-btn:hover, .control-btn.active {
                background: #007bff;
                color: white;
            }

            .capture-controls {
                display: flex;
                justify-content: center;
                margin-bottom: 20px;
            }

            .capture-btn {
                width: 80px;
                height: 80px;
                border: none;
                background: transparent;
                cursor: pointer;
                padding: 0;
            }

            .capture-ring {
                width: 80px;
                height: 80px;
                border: 4px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s;
            }

            .capture-ring:hover {
                transform: scale(1.1);
            }

            .capture-inner {
                width: 60px;
                height: 60px;
                background: #007bff;
                border-radius: 50%;
            }

            .effects-slider {
                display: flex;
                gap: 12px;
                overflow-x: auto;
                padding: 8px 0;
            }

            .effect-btn {
                padding: 8px 16px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 20px;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s;
            }

            .effect-btn.active {
                background: #007bff;
                color: white;
                border-color: #007bff;
            }

            /* Text Tab Styles */
            .text-story-container {
                height: 100%;
                display: flex;
            }

            .text-preview-area {
                flex: 1;
                background: #f5f5f5;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .text-story-canvas {
                width: 300px;
                height: 400px;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .story-text-input {
                width: 100%;
                height: 100%;
                border: none;
                padding: 20px;
                font-size: 24px;
                font-family: inherit;
                resize: none;
                outline: none;
                background: white;
                color: black;
            }

            .text-controls-panel {
                width: 320px;
                padding: 20px;
                border-left: 1px solid #eee;
                overflow-y: auto;
            }

            .control-section {
                margin-bottom: 24px;
            }

            .control-section h4 {
                margin: 0 0 12px;
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                color: #666;
            }

            .color-palette {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
            }

            .color-option {
                width: 48px;
                height: 48px;
                border: 3px solid transparent;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .color-option.active {
                border-color: #007bff;
                transform: scale(1.1);
            }

            .slider-control {
                margin-bottom: 16px;
            }

            .slider-control label {
                display: block;
                margin-bottom: 8px;
                font-size: 14px;
                font-weight: 500;
            }

            .slider-control input[type="range"] {
                width: 100%;
                height: 6px;
                background: #ddd;
                border-radius: 3px;
                outline: none;
                cursor: pointer;
            }

            .align-buttons {
                display: flex;
                gap: 8px;
            }

            .align-btn {
                flex: 1;
                padding: 12px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .align-btn.active {
                background: #007bff;
                color: white;
                border-color: #007bff;
            }

            .character-counter {
                text-align: center;
                font-size: 14px;
                color: #666;
            }

            .char-count {
                font-weight: 600;
            }

            .templates-btn {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            /* Upload Tab Styles */
            .upload-container {
                height: 100%;
                padding: 20px;
            }

            .upload-area {
                height: 100%;
                border: 2px dashed #ccc;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #fafafa;
                transition: all 0.3s;
            }

            .upload-area:hover {
                border-color: #007bff;
                background: #f0f8ff;
            }

            .upload-placeholder {
                text-align: center;
                padding: 40px;
            }

            .upload-icon {
                font-size: 48px;
                color: #ccc;
                margin-bottom: 16px;
            }

            .upload-placeholder h3 {
                margin: 16px 0 8px;
                font-size: 20px;
            }

            .upload-specs {
                display: flex;
                justify-content: center;
                gap: 24px;
                margin: 24px 0;
                font-size: 14px;
                color: #666;
            }

            .spec-item {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .browse-btn {
                padding: 12px 24px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 0 auto;
            }

            /* Universal Controls */
            .story-universal-controls {
                padding: 20px;
                border-top: 1px solid #eee;
                background: #fafafa;
            }

            .overlay-tools h4 {
                margin: 0 0 12px;
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                color: #666;
            }

            .tools-row {
                display: flex;
                gap: 16px;
                margin-bottom: 20px;
            }

            .tool-btn {
                flex: 1;
                padding: 12px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                transition: all 0.2s;
            }

            .tool-btn:hover {
                background: #f0f8ff;
                border-color: #007bff;
            }

            .settings-row {
                display: flex;
                gap: 20px;
                align-items: center;
            }

            .setting-group {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
            }

            .setting-group select {
                padding: 6px 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                background: white;
            }

            /* Action Buttons */
            .story-actions {
                padding: 20px;
                border-top: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .action-group {
                display: flex;
                gap: 12px;
            }

            .action-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }

            .action-btn.cancel-btn {
                background: #f5f5f5;
                color: #666;
            }

            .action-btn.cancel-btn:hover {
                background: #e9e9e9;
            }

            .action-btn.draft-btn {
                background: #28a745;
                color: white;
            }

            .action-btn.primary {
                background: #007bff;
                color: white;
            }

            .action-btn:hover {
                transform: translateY(-1px);
            }

            .action-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            /* Modal Styles */
            .sticker-modal, .music-modal, .privacy-modal, .templates-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }

            .sticker-content, .music-content, .privacy-content, .templates-content {
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 400px;
                width: 90%;
                max-height: 600px;
                overflow-y: auto;
            }

            .sticker-grid, .templates-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                margin: 20px 0;
            }

            .sticker-item, .template-item {
                padding: 16px;
                border: 1px solid #ddd;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                text-align: center;
            }

            .sticker-item:hover, .template-item:hover {
                background: #f0f8ff;
                border-color: #007bff;
            }

            .template-preview {
                width: 100%;
                height: 60px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 8px;
                padding: 8px;
            }

            .template-name {
                font-size: 12px;
                font-weight: 500;
            }

            .music-list {
                margin: 20px 0;
            }

            .music-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .music-item:hover {
                background: #f0f8ff;
                border-color: #007bff;
            }

            .music-info {
                display: flex;
                flex-direction: column;
            }

            .song-title {
                font-weight: 500;
                margin-bottom: 2px;
            }

            .artist-name {
                font-size: 12px;
                color: #666;
            }

            .play-btn {
                background: #007bff;
                color: white;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .radio-group {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin: 16px 0;
            }

            .radio-option {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .radio-option:hover {
                background: #f0f8ff;
                border-color: #007bff;
            }

            .privacy-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                margin-top: 24px;
            }

            /* Toast Styles */
            .story-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                padding: 16px;
                z-index: 10002;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            }

            .story-toast.show {
                opacity: 1;
                transform: translateX(0);
            }

            .story-toast-success .toast-content i {
                color: #28a745;
            }

            .story-toast-error .toast-content i {
                color: #dc3545;
            }

            .story-toast-warning .toast-content i {
                color: #ffc107;
            }

            .story-toast-info .toast-content i {
                color: #007bff;
            }

            .toast-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            /* Post Publication Modal */
            .post-publication-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }

            .publication-content {
                background: white;
                border-radius: 16px;
                padding: 40px;
                text-align: center;
                max-width: 400px;
                width: 90%;
            }

            .success-icon {
                font-size: 64px;
                color: #28a745;
                margin-bottom: 20px;
            }

            .post-options {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin: 24px 0;
            }

            .option-btn {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                text-align: left;
            }

            .option-btn:hover {
                background: #f0f8ff;
                border-color: #007bff;
            }

            /* Media Controls */
            .media-controls {
                display: flex;
                gap: 12px;
                margin-bottom: 16px;
            }

            .media-tool-btn {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                font-size: 12px;
                transition: all 0.2s;
            }

            .media-tool-btn:hover {
                background: #f0f8ff;
                border-color: #007bff;
            }

            .media-tool-btn.remove-btn {
                background: #dc3545;
                color: white;
                border-color: #dc3545;
            }

            .info-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                color: #666;
                margin-bottom: 4px;
            }

            /* Progress Bar */
            .progress-bar {
                width: 100%;
                height: 6px;
                background: #f0f0f0;
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 8px;
            }

            .progress-fill {
                height: 100%;
                background: #007bff;
                border-radius: 3px;
                transition: width 0.3s ease;
                width: 0%;
            }

            .progress-text {
                font-size: 12px;
                color: #666;
                text-align: center;
            }

            /* Error Styles */
            .upload-error, .error-content {
                background: #fff5f5;
                border: 1px solid #fed7d7;
                border-radius: 8px;
                padding: 16px;
                color: #c53030;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .retry-btn {
                background: #dc3545;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            /* Capture Preview */
            .capture-preview {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #000;
            }

            .captured-image, .preview-image, .preview-video {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                border-radius: 8px;
            }

            .capture-actions {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 16px;
            }

            /* Countdown Timer */
            .camera-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: none;
                align-items: center;
                justify-content: center;
            }

            .countdown-timer {
                font-size: 72px;
                font-weight: bold;
                color: white;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                animation: pulse 1s infinite;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .story-creation-container {
                    width: 95%;
                    height: 95vh;
                }

                .text-story-container {
                    flex-direction: column;
                }

                .text-controls-panel {
                    width: 100%;
                    border-left: none;
                    border-top: 1px solid #eee;
                    max-height: 300px;
                }

                .text-story-canvas {
                    width: 250px;
                    height: 300px;
                }

                .camera-top-controls {
                    gap: 12px;
                }

                .control-btn {
                    min-width: 60px;
                    padding: 8px;
                }

                .tools-row {
                    gap: 8px;
                }

                .color-palette {
                    grid-template-columns: repeat(6, 1fr);
                }

                .sticker-grid, .templates-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
            }

            @media (max-width: 480px) {
                .story-creation-container {
                    width: 100%;
                    height: 100vh;
                    border-radius: 0;
                }

                .text-story-canvas {
                    width: 200px;
                    height: 250px;
                }

                .camera-top-controls {
                    flex-wrap: wrap;
                }

                .capture-ring {
                    width: 60px;
                    height: 60px;
                }

                .capture-inner {
                    width: 45px;
                    height: 45px;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Export and Initialize
if (typeof window !== 'undefined') {
    window.StoryCreationDashboard = StoryCreationDashboard;
    
    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for app to be available
        const initStoryDashboard = () => {
            if (typeof app !== 'undefined' && app) {
                window.storyDashboard = new StoryCreationDashboard(app);
                console.log('Story Creation Dashboard initialized and ready!');
            } else {
                setTimeout(initStoryDashboard, 100);
            }
        };
        
        initStoryDashboard();
    });
}
