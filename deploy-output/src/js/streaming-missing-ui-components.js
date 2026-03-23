/**
 * ConnectHub - Missing Media/Streaming UI Components
 * This file implements the 6 missing UI interfaces identified in the feature audit:
 * 1. Music Library/Playlist Management
 * 2. Upload Music Interface
 * 3. Stream Scheduling
 * 4. Stream Analytics Dashboard
 * 5. Video Call Recording
 * 6. Screen Sharing Interface
 */

class StreamingMissingUIManager {
    constructor() {
        this.currentPlaylist = null;
        this.uploadQueue = [];
        this.scheduledStreams = [];
        this.isRecording = false;
        this.isScreenSharing = false;
        this.recordedChunks = [];
        this.mediaRecorder = null;
        this.screenStream = null;
        
        this.initializeMissingComponents();
    }

    initializeMissingComponents() {
        this.createMusicLibraryUI();
        this.createUploadMusicUI();
        this.createStreamSchedulingUI();
        this.createStreamAnalyticsUI();
        this.createVideoCallRecordingUI();
        this.createScreenSharingUI();
        this.setupEventListeners();
    }

    // 1. MUSIC LIBRARY/PLAYLIST MANAGEMENT UI
    createMusicLibraryUI() {
        const musicLibraryHTML = `
            <!-- Music Library Modal -->
            <div id="music-library-modal" class="modal streaming-modal" style="display: none;">
                <div class="modal-content large-modal">
                    <div class="modal-header">
                        <h2>🎵 Music Library</h2>
                        <span class="close" data-modal="music-library-modal">&times;</span>
                    </div>
                    
                    <div class="music-library-container">
                        <!-- Library Navigation -->
                        <div class="library-nav">
                            <button class="nav-btn active" data-section="my-music">My Music</button>
                            <button class="nav-btn" data-section="playlists">Playlists</button>
                            <button class="nav-btn" data-section="favorites">Favorites</button>
                            <button class="nav-btn" data-section="recently-played">Recent</button>
                        </div>

                        <!-- Library Content -->
                        <div class="library-content">
                            <!-- My Music Section -->
                            <div id="my-music-section" class="library-section active">
                                <div class="section-header">
                                    <div class="library-controls">
                                        <input type="text" id="music-search" placeholder="Search your music..." class="search-input">
                                        <select id="music-filter" class="filter-select">
                                            <option value="all">All Music</option>
                                            <option value="songs">Songs</option>
                                            <option value="albums">Albums</option>
                                            <option value="artists">Artists</option>
                                        </select>
                                        <select id="music-sort" class="sort-select">
                                            <option value="recent">Recently Added</option>
                                            <option value="title">Title A-Z</option>
                                            <option value="artist">Artist A-Z</option>
                                            <option value="plays">Most Played</option>
                                        </select>
                                    </div>
                                    <div class="library-stats">
                                        <span id="music-count">0 songs</span>
                                        <span id="total-duration">0:00 total</span>
                                    </div>
                                </div>

                                <div class="music-grid" id="music-grid">
                                    <!-- Music items will be populated here -->
                                </div>
                            </div>

                            <!-- Playlists Section -->
                            <div id="playlists-section" class="library-section">
                                <div class="section-header">
                                    <button id="create-playlist-btn" class="primary-btn">
                                        ➕ Create Playlist
                                    </button>
                                    <div class="playlist-stats">
                                        <span id="playlist-count">0 playlists</span>
                                    </div>
                                </div>

                                <div class="playlists-grid" id="playlists-grid">
                                    <!-- Playlists will be populated here -->
                                </div>
                            </div>

                            <!-- Favorites Section -->
                            <div id="favorites-section" class="library-section">
                                <div class="favorites-grid" id="favorites-grid">
                                    <!-- Favorite songs will be populated here -->
                                </div>
                            </div>

                            <!-- Recently Played Section -->
                            <div id="recently-played-section" class="library-section">
                                <div class="recent-grid" id="recent-grid">
                                    <!-- Recently played songs will be populated here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Create Playlist Modal -->
            <div id="create-playlist-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Create New Playlist</h3>
                        <span class="close" data-modal="create-playlist-modal">&times;</span>
                    </div>
                    <form id="create-playlist-form">
                        <div class="form-group">
                            <label>Playlist Name</label>
                            <input type="text" id="playlist-name" placeholder="My Playlist" required maxlength="100">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="playlist-description" placeholder="Describe your playlist..." maxlength="500"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Privacy</label>
                            <select id="playlist-privacy">
                                <option value="public">Public - Anyone can see</option>
                                <option value="private">Private - Only you can see</option>
                                <option value="friends">Friends - Only friends can see</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Cover Image</label>
                            <input type="file" id="playlist-cover" accept="image/*">
                            <div class="cover-preview" id="cover-preview" style="display: none;"></div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="secondary-btn" data-action="cancel">Cancel</button>
                            <button type="submit" class="primary-btn">Create Playlist</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Add to Playlist Modal -->
            <div id="add-to-playlist-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add to Playlist</h3>
                        <span class="close" data-modal="add-to-playlist-modal">&times;</span>
                    </div>
                    <div class="playlist-selection">
                        <div id="playlist-options">
                            <!-- Playlist options will be populated here -->
                        </div>
                        <button id="create-new-playlist-option" class="secondary-btn full-width">
                            ➕ Create New Playlist
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', musicLibraryHTML);
    }

    // 2. UPLOAD MUSIC INTERFACE
    createUploadMusicUI() {
        const uploadMusicHTML = `
            <!-- Upload Music Modal -->
            <div id="upload-music-modal" class="modal streaming-modal" style="display: none;">
                <div class="modal-content large-modal">
                    <div class="modal-header">
                        <h2>🎵 Upload Music</h2>
                        <span class="close" data-modal="upload-music-modal">&times;</span>
                    </div>
                    
                    <div class="upload-container">
                        <!-- Upload Area -->
                        <div class="upload-dropzone" id="music-dropzone">
                            <div class="dropzone-content">
                                <div class="upload-icon">🎵</div>
                                <h3>Drop music files here or click to browse</h3>
                                <p>Supported formats: MP3, WAV, FLAC, M4A (Max 50MB per file)</p>
                                <input type="file" id="music-file-input" multiple accept=".mp3,.wav,.flac,.m4a" style="display: none;">
                                <button type="button" class="primary-btn" onclick="document.getElementById('music-file-input').click()">
                                    Choose Files
                                </button>
                            </div>
                        </div>

                        <!-- Upload Queue -->
                        <div class="upload-queue" id="upload-queue" style="display: none;">
                            <h3>Upload Queue</h3>
                            <div class="queue-header">
                                <span class="queue-stats">
                                    <span id="queue-count">0</span> files
                                    (<span id="queue-size">0 MB</span>)
                                </span>
                                <div class="queue-actions">
                                    <button id="clear-queue-btn" class="secondary-btn">Clear All</button>
                                    <button id="start-upload-btn" class="primary-btn">Start Upload</button>
                                </div>
                            </div>
                            <div class="queue-list" id="queue-list">
                                <!-- Upload items will be populated here -->
                            </div>
                        </div>

                        <!-- Upload Progress -->
                        <div class="upload-progress" id="upload-progress" style="display: none;">
                            <h3>Uploading...</h3>
                            <div class="overall-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="overall-progress-fill"></div>
                                </div>
                                <span class="progress-text">
                                    <span id="current-file-index">0</span> of 
                                    <span id="total-files">0</span> files
                                    (<span id="overall-percentage">0%</span>)
                                </span>
                            </div>
                            <div class="current-upload" id="current-upload">
                                <!-- Current upload progress will be shown here -->
                            </div>
                        </div>

                        <!-- Upload Complete -->
                        <div class="upload-complete" id="upload-complete" style="display: none;">
                            <div class="success-icon">✅</div>
                            <h3>Upload Complete!</h3>
                            <p><span id="successful-uploads">0</span> files uploaded successfully</p>
                            <div class="complete-actions">
                                <button id="view-library-btn" class="primary-btn">View in Library</button>
                                <button id="upload-more-btn" class="secondary-btn">Upload More</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Music Metadata Editor -->
            <div id="metadata-editor-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Music Details</h3>
                        <span class="close" data-modal="metadata-editor-modal">&times;</span>
                    </div>
                    <form id="metadata-form">
                        <div class="metadata-preview">
                            <div class="album-art-preview" id="album-art-preview">
                                <div class="placeholder">🎵</div>
                            </div>
                            <input type="file" id="album-art-input" accept="image/*" style="display: none;">
                            <button type="button" class="change-art-btn" onclick="document.getElementById('album-art-input').click()">
                                Change Art
                            </button>
                        </div>
                        <div class="metadata-fields">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Title</label>
                                    <input type="text" id="track-title" required>
                                </div>
                                <div class="form-group">
                                    <label>Artist</label>
                                    <input type="text" id="track-artist" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Album</label>
                                    <input type="text" id="track-album">
                                </div>
                                <div class="form-group">
                                    <label>Year</label>
                                    <input type="number" id="track-year" min="1900" max="2030">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Genre</label>
                                    <select id="track-genre">
                                        <option value="">Select Genre</option>
                                        <option value="rock">Rock</option>
                                        <option value="pop">Pop</option>
                                        <option value="hip-hop">Hip Hop</option>
                                        <option value="electronic">Electronic</option>
                                        <option value="jazz">Jazz</option>
                                        <option value="classical">Classical</option>
                                        <option value="folk">Folk</option>
                                        <option value="country">Country</option>
                                        <option value="r&b">R&B</option>
                                        <option value="alternative">Alternative</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Track #</label>
                                    <input type="number" id="track-number" min="1">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea id="track-description" placeholder="Optional description..." maxlength="500"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Privacy</label>
                                <select id="track-privacy">
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                    <option value="friends">Friends Only</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="secondary-btn" data-action="cancel">Cancel</button>
                            <button type="submit" class="primary-btn">Save Details</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', uploadMusicHTML);
    }

    // 3. STREAM SCHEDULING UI
    createStreamSchedulingUI() {
        const streamSchedulingHTML = `
            <!-- Stream Scheduling Modal -->
            <div id="stream-scheduling-modal" class="modal streaming-modal" style="display: none;">
                <div class="modal-content large-modal">
                    <div class="modal-header">
                        <h2>📅 Schedule Stream</h2>
                        <span class="close" data-modal="stream-scheduling-modal">&times;</span>
                    </div>
                    
                    <div class="scheduling-container">
                        <!-- Schedule Form -->
                        <div class="schedule-form">
                            <form id="schedule-stream-form">
                                <div class="form-section">
                                    <h3>Stream Details</h3>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Stream Title</label>
                                            <input type="text" id="schedule-title" placeholder="Enter stream title" required maxlength="100">
                                        </div>
                                        <div class="form-group">
                                            <label>Category</label>
                                            <select id="schedule-category" required>
                                                <option value="">Select Category</option>
                                                <option value="gaming">Gaming</option>
                                                <option value="music">Music</option>
                                                <option value="talk">Talk Show</option>
                                                <option value="cooking">Cooking</option>
                                                <option value="fitness">Fitness</option>
                                                <option value="art">Art & Creativity</option>
                                                <option value="education">Education</option>
                                                <option value="podcast">Podcast</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Description</label>
                                        <textarea id="schedule-description" placeholder="Describe what you'll be streaming..." maxlength="1000"></textarea>
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Tags</label>
                                            <input type="text" id="schedule-tags" placeholder="e.g., music, live, chill (comma separated)">
                                        </div>
                                        <div class="form-group">
                                            <label>Language</label>
                                            <select id="schedule-language">
                                                <option value="en">English</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                                <option value="de">German</option>
                                                <option value="pt">Portuguese</option>
                                                <option value="ja">Japanese</option>
                                                <option value="ko">Korean</option>
                                                <option value="zh">Chinese</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-section">
                                    <h3>Schedule & Duration</h3>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Start Date</label>
                                            <input type="date" id="schedule-date" required>
                                        </div>
                                        <div class="form-group">
                                            <label>Start Time</label>
                                            <input type="time" id="schedule-time" required>
                                        </div>
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>Expected Duration</label>
                                            <select id="schedule-duration">
                                                <option value="30">30 minutes</option>
                                                <option value="60">1 hour</option>
                                                <option value="90">1.5 hours</option>
                                                <option value="120">2 hours</option>
                                                <option value="180">3 hours</option>
                                                <option value="240">4 hours</option>
                                                <option value="0">No limit</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label>Time Zone</label>
                                            <select id="schedule-timezone">
                                                <option value="UTC">UTC</option>
                                                <option value="EST">Eastern (EST)</option>
                                                <option value="PST">Pacific (PST)</option>
                                                <option value="GMT">GMT</option>
                                                <option value="CET">Central European (CET)</option>
                                                <option value="JST">Japan (JST)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="recurring-options">
                                        <label class="checkbox-label">
                                            <input type="checkbox" id="schedule-recurring">
                                            <span class="checkmark"></span>
                                            Recurring Stream
                                        </label>
                                        
                                        <div class="recurring-details" id="recurring-details" style="display: none;">
                                            <div class="form-row">
                                                <div class="form-group">
                                                    <label>Repeat</label>
                                                    <select id="recurring-frequency">
                                                        <option value="daily">Daily</option>
                                                        <option value="weekly">Weekly</option>
                                                        <option value="monthly">Monthly</option>
                                                    </select>
                                                </div>
                                                <div class="form-group">
                                                    <label>End After</label>
                                                    <input type="number" id="recurring-count" min="1" max="50" value="10">
                                                    <span>occurrences</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-section">
                                    <h3>Stream Settings</h3>
                                    <div class="settings-grid">
                                        <label class="checkbox-label">
                                            <input type="checkbox" id="schedule-chat-enabled" checked>
                                            <span class="checkmark"></span>
                                            Enable Chat
                                        </label>
                                        
                                        <label class="checkbox-label">
                                            <input type="checkbox" id="schedule-recording-enabled">
                                            <span class="checkmark"></span>
                                            Auto-Record Stream
                                        </label>
                                        
                                        <label class="checkbox-label">
                                            <input type="checkbox" id="schedule-notifications-enabled" checked>
                                            <span class="checkmark"></span>
                                            Send Notifications
                                        </label>
                                        
                                        <label class="checkbox-label">
                                            <input type="checkbox" id="schedule-private">
                                            <span class="checkmark"></span>
                                            Private Stream
                                        </label>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Stream Quality</label>
                                        <select id="schedule-quality">
                                            <option value="720p">720p HD (Recommended)</option>
                                            <option value="1080p">1080p Full HD</option>
                                            <option value="480p">480p Standard</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="form-actions">
                                    <button type="button" class="secondary-btn" data-action="cancel">Cancel</button>
                                    <button type="button" class="secondary-btn" id="save-draft-btn">Save as Draft</button>
                                    <button type="submit" class="primary-btn">Schedule Stream</button>
                                </div>
                            </form>
                        </div>

                        <!-- Scheduled Streams List -->
                        <div class="scheduled-streams">
                            <h3>Upcoming Streams</h3>
                            <div class="streams-filter-bar">
                                <select id="scheduled-filter">
                                    <option value="all">All Scheduled</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                </select>
                                <button id="export-schedule-btn" class="secondary-btn">📋 Export</button>
                            </div>
                            <div class="scheduled-list" id="scheduled-streams-list">
                                <!-- Scheduled streams will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit Scheduled Stream Modal -->
            <div id="edit-scheduled-stream-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Scheduled Stream</h3>
                        <span class="close" data-modal="edit-scheduled-stream-modal">&times;</span>
                    </div>
                    <div class="edit-actions">
                        <button id="start-early-btn" class="primary-btn">Start Now</button>
                        <button id="reschedule-btn" class="secondary-btn">Reschedule</button>
                        <button id="cancel-stream-btn" class="danger-btn">Cancel Stream</button>
                    </div>
                    <div class="stream-details" id="edit-stream-details">
                        <!-- Stream details will be populated here -->
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', streamSchedulingHTML);
    }

    // 4. STREAM ANALYTICS DASHBOARD UI
    createStreamAnalyticsUI() {
        const streamAnalyticsHTML = `
            <!-- Stream Analytics Modal -->
            <div id="stream-analytics-modal" class="modal streaming-modal" style="display: none;">
                <div class="modal-content extra-large-modal">
                    <div class="modal-header">
                        <h2>📊 Stream Analytics</h2>
                        <span class="close" data-modal="stream-analytics-modal">&times;</span>
                    </div>
                    
                    <div class="analytics-container">
                        <!-- Analytics Header -->
                        <div class="analytics-header">
                            <div class="period-selector">
                                <button class="period-btn active" data-period="today">Today</button>
                                <button class="period-btn" data-period="week">This Week</button>
                                <button class="period-btn" data-period="month">This Month</button>
                                <button class="period-btn" data-period="year">This Year</button>
                                <button class="period-btn" data-period="custom">Custom</button>
                            </div>
                            <div class="export-options">
                                <button id="export-pdf-btn" class="secondary-btn">📄 PDF</button>
                                <button id="export-csv-btn" class="secondary-btn">📊 CSV</button>
                                <button id="share-analytics-btn" class="secondary-btn">🔗 Share</button>
                            </div>
                        </div>

                        <!-- Key Metrics -->
                        <div class="metrics-overview">
                            <div class="metric-card">
                                <div class="metric-icon">👁️</div>
                                <div class="metric-info">
                                    <h3 id="total-views">0</h3>
                                    <p>Total Views</p>
                                    <span class="metric-change positive" id="views-change">+0%</span>
                                </div>
                            </div>
                            
                            <div class="metric-card">
                                <div class="metric-icon">⏱️</div>
                                <div class="metric-info">
                                    <h3 id="watch-time">0h 0m</h3>
                                    <p>Watch Time</p>
                                    <span class="metric-change positive" id="watch-time-change">+0%</span>
                                </div>
                            </div>
                            
                            <div class="metric-card">
                                <div class="metric-icon">👥</div>
                                <div class="metric-info">
                                    <h3 id="avg-viewers">0</h3>
                                    <p>Avg Concurrent</p>
                                    <span class="metric-change positive" id="viewers-change">+0%</span>
                                </div>
                            </div>
                            
                            <div class="metric-card">
                                <div class="metric-icon">💰</div>
                                <div class="metric-info">
                                    <h3 id="total-earnings">$0.00</h3>
                                    <p>Earnings</p>
                                    <span class="metric-change positive" id="earnings-change">+0%</span>
                                </div>
                            </div>
                        </div>

                        <!-- Analytics Content -->
                        <div class="analytics-content">
                            <!-- Left Column -->
                            <div class="analytics-left">
                                <!-- Viewership Chart -->
                                <div class="analytics-card">
                                    <div class="card-header">
                                        <h3>👁️ Viewership Over Time</h3>
                                        <select id="viewership-timeframe">
                                            <option value="hourly">Hourly</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                        </select>
                                    </div>
                                    <div class="chart-container">
                                        <canvas id="viewership-chart"></canvas>
                                    </div>
                                </div>

                                <!-- Engagement Chart -->
                                <div class="analytics-card">
                                    <div class="card-header">
                                        <h3>💬 Engagement Metrics</h3>
                                        <div class="engagement-toggles">
                                            <label class="toggle-label">
                                                <input type="checkbox" id="show-messages" checked>
                                                Messages
                                            </label>
                                            <label class="toggle-label">
                                                <input type="checkbox" id="show-reactions" checked>
                                                Reactions
                                            </label>
                                            <label class="toggle-label">
                                                <input type="checkbox" id="show-gifts" checked>
                                                Gifts
                                            </label>
                                        </div>
                                    </div>
                                    <div class="chart-container">
                                        <canvas id="engagement-chart"></canvas>
                                    </div>
                                </div>

                                <!-- Revenue Chart -->
                                <div class="analytics-card">
                                    <div class="card-header">
                                        <h3>💰 Revenue Breakdown</h3>
                                        <select id="revenue-type">
                                            <option value="all">All Sources</option>
                                            <option value="gifts">Gifts</option>
                                            <option value="subscriptions">Subscriptions</option>
                                            <option value="donations">Donations</option>
                                        </select>
                                    </div>
                                    <div class="chart-container">
                                        <canvas id="revenue-chart"></canvas>
                                    </div>
                                </div>
                            </div>

                            <!-- Right Column -->
                            <div class="analytics-right">
                                <!-- Top Streams -->
                                <div class="analytics-card">
                                    <div class="card-header">
                                        <h3>🏆 Top Streams</h3>
                                        <select id="top-streams-period">
                                            <option value="week">This Week</option>
                                            <option value="month">This Month</option>
                                            <option value="year">This Year</option>
                                        </select>
                                    </div>
                                    <div class="top-streams-list" id="top-streams-list">
                                        <!-- Top streams will be populated here -->
                                    </div>
                                </div>

                                <!-- Audience Demographics -->
                                <div class="analytics-card">
                                    <div class="card-header">
                                        <h3>👥 Audience Demographics</h3>
                                    </div>
                                    <div class="demographics-container">
                                        <div class="demo-section">
                                            <h4>Age Groups</h4>
                                            <div class="demo-chart" id="age-chart">
                                                <!-- Age demographics chart -->
                                            </div>
                                        </div>
                                        <div class="demo-section">
                                            <h4>Geographic Distribution</h4>
                                            <div class="geo-list" id="geo-list">
                                                <!-- Geographic data -->
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Recent Activity -->
                                <div class="analytics-card">
                                    <div class="card-header">
                                        <h3>📈 Recent Activity</h3>
                                    </div>
                                    <div class="activity-list" id="recent-activity">
                                        <!-- Recent activity feed -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Custom Date Range Modal -->
            <div id="custom-date-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Custom Date Range</h3>
                        <span class="close" data-modal="custom-date-modal">&times;</span>
                    </div>
                    <form id="custom-date-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Start Date</label>
                                <input type="date" id="custom-start-date" required>
                            </div>
                            <div class="form-group">
                                <label>End Date</label>
                                <input type="date" id="custom-end-date" required>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="secondary-btn" data-action="cancel">Cancel</button>
                            <button type="submit" class="primary-btn">Apply Range</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', streamAnalyticsHTML);
    }

    // 5. VIDEO CALL RECORDING UI
    createVideoCallRecordingUI() {
        const videoCallRecordingHTML = `
            <!-- Video Call Recording Controls -->
            <div id="call-recording-controls" class="recording-controls" style="display: none;">
                <div class="recording-indicator">
                    <div class="record-dot"></div>
                    <span>Recording</span>
                    <span id="recording-duration">00:00</span>
                </div>
                <div class="recording-actions">
                    <button id="pause-recording-btn" class="control-btn">⏸️</button>
                    <button id="stop-recording-btn" class="control-btn stop">⏹️</button>
                    <button id="recording-settings-btn" class="control-btn">⚙️</button>
                </div>
            </div>

            <!-- Recording Settings Modal -->
            <div id="recording-settings-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>📹 Recording Settings</h3>
                        <span class="close" data-modal="recording-settings-modal">&times;</span>
                    </div>
                    <div class="recording-settings">
                        <div class="form-section">
                            <h4>Quality Settings</h4>
                            <div class="form-group">
                                <label>Video Quality</label>
                                <select id="recording-quality">
                                    <option value="1080p">1080p Full HD</option>
                                    <option value="720p" selected>720p HD</option>
                                    <option value="480p">480p Standard</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Frame Rate</label>
                                <select id="recording-framerate">
                                    <option value="30">30 FPS</option>
                                    <option value="24" selected>24 FPS</option>
                                    <option value="15">15 FPS</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Audio Quality</label>
                                <select id="recording-audio-quality">
                                    <option value="high">High (320 kbps)</option>
                                    <option value="medium" selected>Medium (128 kbps)</option>
                                    <option value="low">Low (64 kbps)</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-section">
                            <h4>Recording Options</h4>
                            <div class="settings-grid">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="record-audio" checked>
                                    <span class="checkmark"></span>
                                    Include Audio
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="record-screen" checked>
                                    <span class="checkmark"></span>
                                    Include Screen Share
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="record-participants">
                                    <span class="checkmark"></span>
                                    Record All Participants
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="auto-save-cloud">
                                    <span class="checkmark"></span>
                                    Auto-save to Cloud
                                </label>
                            </div>
                        </div>

                        <div class="form-section">
                            <h4>Storage & Privacy</h4>
                            <div class="form-group">
                                <label>Save Location</label>
                                <select id="recording-save-location">
                                    <option value="local">Local Device</option>
                                    <option value="cloud">Cloud Storage</option>
                                    <option value="both" selected>Both</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Recording Name</label>
                                <input type="text" id="recording-name-template" 
                                       value="Call_{date}_{time}" 
                                       placeholder="e.g., Meeting_{date}">
                            </div>
                            <div class="form-group">
                                <label>Privacy</label>
                                <select id="recording-privacy">
                                    <option value="private" selected>Private</option>
                                    <option value="participants">Share with Participants</option>
                                    <option value="public">Public</option>
                                </select>
                            </div>
                        </div>

                        <div class="storage-info">
                            <div class="storage-usage">
                                <h4>Storage Usage</h4>
                                <div class="storage-bar">
                                    <div class="storage-fill" style="width: 45%"></div>
                                </div>
                                <span>4.5 GB of 10 GB used</span>
                            </div>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="secondary-btn" data-action="cancel">Cancel</button>
                        <button type="button" class="primary-btn" id="save-recording-settings">Save Settings</button>
                    </div>
                </div>
            </div>

            <!-- Recording Complete Modal -->
            <div id="recording-complete-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>📹 Recording Complete</h3>
                        <span class="close" data-modal="recording-complete-modal">&times;</span>
                    </div>
                    <div class="recording-summary">
                        <div class="summary-stats">
                            <div class="stat-item">
                                <span class="stat-label">Duration:</span>
                                <span class="stat-value" id="final-duration">0:00</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">File Size:</span>
                                <span class="stat-value" id="final-file-size">0 MB</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Quality:</span>
                                <span class="stat-value" id="final-quality">720p</span>
                            </div>
                        </div>
                        
                        <div class="recording-preview">
                            <video id="recording-preview-video" controls style="width: 100%; max-height: 200px;">
                                <!-- Recording preview will be loaded here -->
                            </video>
                        </div>

                        <div class="recording-actions">
                            <button id="download-recording-btn" class="primary-btn">⬇️ Download</button>
                            <button id="share-recording-btn" class="secondary-btn">🔗 Share</button>
                            <button id="edit-recording-btn" class="secondary-btn">✏️ Edit</button>
                            <button id="delete-recording-btn" class="danger-btn">🗑️ Delete</button>
                        </div>

                        <div class="transcript-section" style="display: none;">
                            <h4>Auto-Generated Transcript</h4>
                            <div class="transcript-content" id="recording-transcript">
                                <!-- Transcript will be generated here -->
                            </div>
                            <button id="download-transcript-btn" class="secondary-btn">Download Transcript</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- My Recordings Library -->
            <div id="recordings-library-modal" class="modal streaming-modal" style="display: none;">
                <div class="modal-content large-modal">
                    <div class="modal-header">
                        <h2>📹 My Recordings</h2>
                        <span class="close" data-modal="recordings-library-modal">&times;</span>
                    </div>
                    <div class="recordings-container">
                        <div class="recordings-header">
                            <div class="search-controls">
                                <input type="text" id="recordings-search" placeholder="Search recordings...">
                                <select id="recordings-filter">
                                    <option value="all">All Recordings</option>
                                    <option value="calls">Video Calls</option>
                                    <option value="streams">Streams</option>
                                    <option value="meetings">Meetings</option>
                                </select>
                                <select id="recordings-sort">
                                    <option value="recent">Most Recent</option>
                                    <option value="duration">Duration</option>
                                    <option value="size">File Size</option>
                                    <option value="name">Name A-Z</option>
                                </select>
                            </div>
                            <div class="bulk-actions" style="display: none;">
                                <button id="select-all-recordings" class="secondary-btn">Select All</button>
                                <button id="bulk-download" class="secondary-btn">Download Selected</button>
                                <button id="bulk-delete" class="danger-btn">Delete Selected</button>
                            </div>
                        </div>
                        <div class="recordings-grid" id="recordings-grid">
                            <!-- Recordings will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', videoCallRecordingHTML);
    }

    // 6. SCREEN SHARING INTERFACE
    createScreenSharingUI() {
        const screenSharingHTML = `
            <!-- Screen Share Modal -->
            <div id="screen-share-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>🖥️ Share Your Screen</h3>
                        <span class="close" data-modal="screen-share-modal">&times;</span>
                    </div>
                    <div class="screen-share-options">
                        <h4>Choose what to share:</h4>
                        <div class="share-options-grid">
                            <div class="share-option" data-type="screen">
                                <div class="option-icon">🖥️</div>
                                <h5>Entire Screen</h5>
                                <p>Share everything on your screen</p>
                            </div>
                            <div class="share-option" data-type="window">
                                <div class="option-icon">🪟</div>
                                <h5>Application Window</h5>
                                <p>Share a specific application</p>
                            </div>
                            <div class="share-option" data-type="tab">
                                <div class="option-icon">🌐</div>
                                <h5>Browser Tab</h5>
                                <p>Share a browser tab</p>
                            </div>
                        </div>

                        <div class="screen-selection" id="screen-selection" style="display: none;">
                            <h4>Select Screen/Window:</h4>
                            <div class="screen-previews" id="screen-previews">
                                <!-- Screen/window previews will be populated here -->
                            </div>
                        </div>

                        <div class="share-settings">
                            <div class="settings-row">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="share-audio" checked>
                                    <span class="checkmark"></span>
                                    Share Computer Audio
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="share-cursor">
                                    <span class="checkmark"></span>
                                    Show Mouse Cursor
                                </label>
                            </div>
                            <div class="quality-settings">
                                <label>Quality:</label>
                                <select id="screen-share-quality">
                                    <option value="high">High (Better quality, more bandwidth)</option>
                                    <option value="balanced" selected>Balanced</option>
                                    <option value="performance">Performance (Better for slow connections)</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="secondary-btn" data-action="cancel">Cancel</button>
                            <button type="button" class="primary-btn" id="start-screen-share">Start Sharing</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Screen Share Controls -->
            <div id="screen-share-controls" class="floating-controls" style="display: none;">
                <div class="controls-content">
                    <div class="sharing-indicator">
                        <div class="sharing-dot"></div>
                        <span>Sharing Screen</span>
                    </div>
                    <div class="control-buttons">
                        <button id="pause-share-btn" class="control-btn" title="Pause">⏸️</button>
                        <button id="annotate-btn" class="control-btn" title="Annotate">✏️</button>
                        <button id="pointer-btn" class="control-btn" title="Laser Pointer">📍</button>
                        <button id="settings-share-btn" class="control-btn" title="Settings">⚙️</button>
                        <button id="stop-share-btn" class="control-btn stop" title="Stop Sharing">⏹️</button>
                    </div>
                </div>
            </div>

            <!-- Screen Share Settings Panel -->
            <div id="screen-share-settings-panel" class="settings-panel" style="display: none;">
                <div class="panel-header">
                    <h4>Screen Share Settings</h4>
                    <button class="close-panel" id="close-share-settings">✕</button>
                </div>
                <div class="panel-content">
                    <div class="setting-group">
                        <label>Resolution:</label>
                        <select id="share-resolution">
                            <option value="auto" selected>Auto</option>
                            <option value="1080p">1080p</option>
                            <option value="720p">720p</option>
                            <option value="480p">480p</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label>Frame Rate:</label>
                        <select id="share-framerate">
                            <option value="30">30 FPS</option>
                            <option value="15" selected>15 FPS</option>
                            <option value="5">5 FPS (Low bandwidth)</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="optimize-text" checked>
                            <span class="checkmark"></span>
                            Optimize for text
                        </label>
                    </div>
                    <div class="setting-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="hide-notifications">
                            <span class="checkmark"></span>
                            Hide notifications
                        </label>
                    </div>
                </div>
            </div>

            <!-- Annotation Toolbar -->
            <div id="annotation-toolbar" class="annotation-tools" style="display: none;">
                <div class="tool-group">
                    <button class="tool-btn active" data-tool="pen" title="Pen">✏️</button>
                    <button class="tool-btn" data-tool="highlighter" title="Highlighter">🖍️</button>
                    <button class="tool-btn" data-tool="arrow" title="Arrow">➡️</button>
                    <button class="tool-btn" data-tool="text" title="Text">🅰️</button>
                    <button class="tool-btn" data-tool="shape" title="Shape">⬜</button>
                </div>
                <div class="tool-options">
                    <input type="color" id="annotation-color" value="#ff0000" title="Color">
                    <input type="range" id="annotation-size" min="1" max="10" value="3" title="Size">
                </div>
                <div class="tool-actions">
                    <button id="undo-annotation" title="Undo">↶</button>
                    <button id="clear-annotations" title="Clear All">🗑️</button>
                    <button id="save-annotations" title="Save">💾</button>
                </div>
            </div>

            <!-- Screen Share Viewer (for participants) -->
            <div id="screen-share-viewer" class="share-viewer" style="display: none;">
                <div class="viewer-header">
                    <div class="presenter-info">
                        <span id="presenter-name">John Doe</span> is sharing their screen
                    </div>
                    <div class="viewer-controls">
                        <button id="request-control-btn" class="control-btn">🎮 Request Control</button>
                        <button id="fullscreen-viewer-btn" class="control-btn">⛶ Fullscreen</button>
                        <button id="close-viewer-btn" class="control-btn">✕</button>
                    </div>
                </div>
                <div class="viewer-content">
                    <video id="shared-screen-video" autoplay muted></video>
                    <canvas id="annotation-canvas" style="position: absolute; top: 0; left: 0; pointer-events: none;"></canvas>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', screenSharingHTML);
    }

    setupEventListeners() {
        // Close modal listeners
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close')) {
                const modalId = e.target.dataset.modal;
                if (modalId) {
                    document.getElementById(modalId).style.display = 'none';
                }
            }
        });

        // Music Library Events
        this.setupMusicLibraryEvents();
        
        // Upload Music Events  
        this.setupUploadMusicEvents();
        
        // Stream Scheduling Events
        this.setupStreamSchedulingEvents();
        
        // Analytics Events
        this.setupAnalyticsEvents();
        
        // Recording Events
        this.setupRecordingEvents();
        
        // Screen Sharing Events
        this.setupScreenSharingEvents();
    }

    setupMusicLibraryEvents() {
        // Library navigation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-btn')) {
                document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                const section = e.target.dataset.section;
                document.querySelectorAll('.library-section').forEach(s => s.classList.remove('active'));
                document.getElementById(`${section}-section`).classList.add('active');
            }
        });

        // Create playlist
        const createPlaylistBtn = document.getElementById('create-playlist-btn');
        if (createPlaylistBtn) {
            createPlaylistBtn.addEventListener('click', () => {
                document.getElementById('create-playlist-modal').style.display = 'block';
            });
        }

        // Playlist form submission
        const createPlaylistForm = document.getElementById('create-playlist-form');
        if (createPlaylistForm) {
            createPlaylistForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreatePlaylist();
            });
        }
    }

    setupUploadMusicEvents() {
        // File input change
        const fileInput = document.getElementById('music-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelection(e.target.files);
            });
        }

        // Drag and drop
        const dropzone = document.getElementById('music-dropzone');
        if (dropzone) {
            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('dragover');
            });

            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('dragover');
            });

            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('dragover');
                this.handleFileSelection(e.dataTransfer.files);
            });
        }

        // Upload queue actions
        const startUploadBtn = document.getElementById('start-upload-btn');
        if (startUploadBtn) {
            startUploadBtn.addEventListener('click', () => this.startMusicUpload());
        }

        const clearQueueBtn = document.getElementById('clear-queue-btn');
        if (clearQueueBtn) {
            clearQueueBtn.addEventListener('click', () => this.clearUploadQueue());
        }
    }

    setupStreamSchedulingEvents() {
        // Schedule form submission
        const scheduleForm = document.getElementById('schedule-stream-form');
        if (scheduleForm) {
            scheduleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleScheduleStream();
            });
        }

        // Recurring stream toggle
        const recurringCheckbox = document.getElementById('schedule-recurring');
        if (recurringCheckbox) {
            recurringCheckbox.addEventListener('change', (e) => {
                const details = document.getElementById('recurring-details');
                details.style.display = e.target.checked ? 'block' : 'none';
            });
        }
    }

    setupAnalyticsEvents() {
        // Period selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('period-btn')) {
                document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                const period = e.target.dataset.period;
                if (period === 'custom') {
                    document.getElementById('custom-date-modal').style.display = 'block';
                } else {
                    this.loadAnalyticsData(period);
                }
            }
        });

        // Export options
        const exportPdfBtn = document.getElementById('export-pdf-btn');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => this.exportAnalytics('pdf'));
        }

        const exportCsvBtn = document.getElementById('export-csv-btn');
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => this.exportAnalytics('csv'));
        }
    }

    setupRecordingEvents() {
        // Recording controls
        const startRecordingBtn = document.getElementById('start-recording-btn');
        if (startRecordingBtn) {
            startRecordingBtn.addEventListener('click', () => this.startRecording());
        }

        const stopRecordingBtn = document.getElementById('stop-recording-btn');
        if (stopRecordingBtn) {
            stopRecordingBtn.addEventListener('click', () => this.stopRecording());
        }

        const pauseRecordingBtn = document.getElementById('pause-recording-btn');
        if (pauseRecordingBtn) {
            pauseRecordingBtn.addEventListener('click', () => this.pauseRecording());
        }
    }

    setupScreenSharingEvents() {
        // Screen share option selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.share-option')) {
                const option = e.target.closest('.share-option');
                document.querySelectorAll('.share-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                const type = option.dataset.type;
                this.showScreenSelection(type);
            }
        });

        // Start screen share
        const startShareBtn = document.getElementById('start-screen-share');
        if (startShareBtn) {
            startShareBtn.addEventListener('click', () => this.startScreenShare());
        }

        // Stop screen share
        const stopShareBtn = document.getElementById('stop-share-btn');
        if (stopShareBtn) {
            stopShareBtn.addEventListener('click', () => this.stopScreenShare());
        }
    }

    // API Methods for each component
    async handleCreatePlaylist() {
        const formData = {
            name: document.getElementById('playlist-name').value,
            description: document.getElementById('playlist-description').value,
            privacy: document.getElementById('playlist-privacy').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/music/playlists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                document.getElementById('create-playlist-modal').style.display = 'none';
                this.loadPlaylists();
            }
        } catch (error) {
            console.error('Error creating playlist:', error);
        }
    }

    handleFileSelection(files) {
        Array.from(files).forEach(file => {
            if (this.isValidMusicFile(file)) {
                this.uploadQueue.push({
                    id: Date.now() + Math.random(),
                    file: file,
                    status: 'pending'
                });
            }
        });
        
        this.updateUploadQueue();
    }

    isValidMusicFile(file) {
        const validTypes = ['audio/mp3', 'audio/wav', 'audio/flac', 'audio/m4a'];
        const maxSize = 50 * 1024 * 1024; // 50MB
        
        return validTypes.includes(file.type) && file.size <= maxSize;
    }

    updateUploadQueue() {
        const queue = document.getElementById('upload-queue');
        const queueList = document.getElementById('queue-list');
        
        if (this.uploadQueue.length > 0) {
            queue.style.display = 'block';
            document.getElementById('queue-count').textContent = this.uploadQueue.length;
            
            const totalSize = this.uploadQueue.reduce((total, item) => total + item.file.size, 0);
            document.getElementById('queue-size').textContent = (totalSize / (1024 * 1024)).toFixed(1);
            
            queueList.innerHTML = this.uploadQueue.map(item => `
                <div class="queue-item" data-id="${item.id}">
                    <div class="item-info">
                        <span class="file-name">${item.file.name}</span>
                        <span class="file-size">${(item.file.size / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>
                    <div class="item-status">${item.status}</div>
                    <button class="remove-item" onclick="streamingMissingUI.removeFromQueue('${item.id}')">✕</button>
                </div>
            `).join('');
        } else {
            queue.style.display = 'none';
        }
    }

    removeFromQueue(itemId) {
        this.uploadQueue = this.uploadQueue.filter(item => item.id !== itemId);
        this.updateUploadQueue();
    }

    clearUploadQueue() {
        this.uploadQueue = [];
        this.updateUploadQueue();
    }

    async startMusicUpload() {
        if (this.uploadQueue.length === 0) return;
        
        const progressSection = document.getElementById('upload-progress');
        const queueSection = document.getElementById('upload-queue');
        
        queueSection.style.display = 'none';
        progressSection.style.display = 'block';
        
        document.getElementById('total-files').textContent = this.uploadQueue.length;
        
        for (let i = 0; i < this.uploadQueue.length; i++) {
            const item = this.uploadQueue[i];
            document.getElementById('current-file-index').textContent = i + 1;
            
            try {
                await this.uploadSingleFile(item, i);
                item.status = 'completed';
            } catch (error) {
                item.status = 'failed';
                console.error('Upload failed for', item.file.name, error);
            }
            
            const percentage = Math.round(((i + 1) / this.uploadQueue.length) * 100);
            document.getElementById('overall-percentage').textContent = `${percentage}%`;
            document.getElementById('overall-progress-fill').style.width = `${percentage}%`;
        }
        
        this.showUploadComplete();
    }

    async uploadSingleFile(item, index) {
        const formData = new FormData();
        formData.append('file', item.file);
        
        const response = await fetch(`${API_BASE_URL}/music/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        return response.json();
    }

    showUploadComplete() {
        document.getElementById('upload-progress').style.display = 'none';
        document.getElementById('upload-complete').style.display = 'block';
        
        const successful = this.uploadQueue.filter(item => item.status === 'completed').length;
        document.getElementById('successful-uploads').textContent = successful;
    }

    async handleScheduleStream() {
        const formData = {
            title: document.getElementById('schedule-title').value,
            category: document.getElementById('schedule-category').value,
            description: document.getElementById('schedule-description').value,
            tags: document.getElementById('schedule-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            language: document.getElementById('schedule-language').value,
            scheduledDate: document.getElementById('schedule-date').value,
            scheduledTime: document.getElementById('schedule-time').value,
            duration: parseInt(document.getElementById('schedule-duration').value),
            timezone: document.getElementById('schedule-timezone').value,
            isRecurring: document.getElementById('schedule-recurring').checked,
            chatEnabled: document.getElementById('schedule-chat-enabled').checked,
            recordingEnabled: document.getElementById('schedule-recording-enabled').checked,
            notificationsEnabled: document.getElementById('schedule-notifications-enabled').checked,
            isPrivate: document.getElementById('schedule-private').checked,
            quality: document.getElementById('schedule-quality').value
        };

        if (formData.isRecurring) {
            formData.recurringFrequency = document.getElementById('recurring-frequency').value;
            formData.recurringCount = parseInt(document.getElementById('recurring-count').value);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/streaming/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                document.getElementById('stream-scheduling-modal').style.display = 'none';
                this.loadScheduledStreams();
                alert('Stream scheduled successfully!');
            }
        } catch (error) {
            console.error('Error scheduling stream:', error);
            alert('Failed to schedule stream');
        }
    }

    async loadScheduledStreams() {
        try {
            const response = await fetch(`${API_BASE_URL}/streaming/scheduled`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                this.displayScheduledStreams(data.streams);
            }
        } catch (error) {
            console.error('Error loading scheduled streams:', error);
        }
    }

    displayScheduledStreams(streams) {
        const list = document.getElementById('scheduled-streams-list');
        if (!list) return;

        if (streams.length === 0) {
            list.innerHTML = '<p class="no-streams">No scheduled streams</p>';
            return;
        }

        list.innerHTML = streams.map(stream => `
            <div class="scheduled-stream-item" data-stream-id="${stream.id}">
                <div class="stream-time">
                    <div class="date">${new Date(stream.scheduledDate).toLocaleDateString()}</div>
                    <div class="time">${stream.scheduledTime}</div>
                </div>
                <div class="stream-details">
                    <h4>${stream.title}</h4>
                    <p>${stream.category} • ${stream.duration ? stream.duration + 'min' : 'No limit'}</p>
                    <span class="status ${stream.status}">${stream.status}</span>
                </div>
                <div class="stream-actions">
                    <button onclick="streamingMissingUI.editScheduledStream('${stream.id}')">Edit</button>
                    <button onclick="streamingMissingUI.cancelScheduledStream('${stream.id}')" class="danger">Cancel</button>
                </div>
            </div>
        `).join('');
    }

    loadAnalyticsData(period) {
        // This would load actual analytics data from the backend
        console.log('Loading analytics for period:', period);
        
        // Update metric cards with sample data
        document.getElementById('total-views').textContent = '12,345';
        document.getElementById('watch-time').textContent = '2h 34m';
        document.getElementById('avg-viewers').textContent = '87';
        document.getElementById('total-earnings').textContent = '$234.56';
    }

    exportAnalytics(format) {
        console.log('Exporting analytics as', format);
        // This would trigger the actual export functionality
    }

    async startRecording() {
        if (this.isRecording) return;

        try {
            // Get display media for recording
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            this.mediaRecorder = new MediaRecorder(stream);
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.handleRecordingComplete();
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            
            document.getElementById('call-recording-controls').style.display = 'flex';
            this.startRecordingTimer();
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Failed to start recording');
        }
    }

    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) return;

        this.mediaRecorder.stop();
        this.isRecording = false;
        
        document.getElementById('call-recording-controls').style.display = 'none';
        this.stopRecordingTimer();
    }

    pauseRecording() {
        if (!this.isRecording || !this.mediaRecorder) return;

        if (this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.pause();
        } else if (this.mediaRecorder.state === 'paused') {
            this.mediaRecorder.resume();
        }
    }

    startRecordingTimer() {
        this.recordingStartTime = Date.now();
        this.recordingTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('recording-duration').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopRecordingTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    handleRecordingComplete() {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        document.getElementById('recording-preview-video').src = url;
        document.getElementById('final-file-size').textContent = `${(blob.size / (1024 * 1024)).toFixed(1)} MB`;
        document.getElementById('recording-complete-modal').style.display = 'block';
    }

    async startScreenShare() {
        if (this.isScreenSharing) return;

        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: document.getElementById('share-audio').checked
            });

            this.screenStream = stream;
            this.isScreenSharing = true;
            
            document.getElementById('screen-share-modal').style.display = 'none';
            document.getElementById('screen-share-controls').style.display = 'flex';
            
            // Handle stream end
            stream.getVideoTracks()[0].onended = () => {
                this.stopScreenShare();
            };
        } catch (error) {
            console.error('Error starting screen share:', error);
            alert('Failed to start screen sharing');
        }
    }

    stopScreenShare() {
        if (!this.isScreenSharing || !this.screenStream) return;

        this.screenStream.getTracks().forEach(track => track.stop());
        this.screenStream = null;
        this.isScreenSharing = false;
        
        document.getElementById('screen-share-controls').style.display = 'none';
    }

    showScreenSelection(type) {
        const selection = document.getElementById('screen-selection');
        selection.style.display = 'block';
        
        // This would populate with actual screen/window options
        const previews = document.getElementById('screen-previews');
        previews.innerHTML = `
            <div class="screen-preview" data-source="screen1">
                <div class="preview-thumbnail">🖥️</div>
                <span>Screen 1</span>
            </div>
        `;
    }

    // Public methods to show each UI component
    showMusicLibrary() {
        document.getElementById('music-library-modal').style.display = 'block';
    }

    showUploadMusic() {
        document.getElementById('upload-music-modal').style.display = 'block';
    }

    showStreamScheduling() {
        document.getElementById('stream-scheduling-modal').style.display = 'block';
        this.loadScheduledStreams();
    }

    showStreamAnalytics() {
        document.getElementById('stream-analytics-modal').style.display = 'block';
        this.loadAnalyticsData('today');
    }

    showRecordingsLibrary() {
        document.getElementById('recordings-library-modal').style.display = 'block';
    }

    showScreenShareOptions() {
        document.getElementById('screen-share-modal').style.display = 'block';
    }
}

// Initialize the missing streaming components
const streamingMissingUI = new StreamingMissingUIManager();

// Export for global access
window.streamingMissingUI = streamingMissingUI;

// Integration with existing media controls
document.addEventListener('DOMContentLoaded', () => {
    // Add buttons to existing media interface to access new features
    const mediaSection = document.getElementById('media-category');
    if (mediaSection) {
        // Add music library button
        const musicSection = mediaSection.querySelector('#mediaMusic');
        if (musicSection) {
            const libraryBtn = document.createElement('button');
            libraryBtn.textContent = '🎵 Music Library';
            libraryBtn.className = 'secondary-btn';
            libraryBtn.onclick = () => streamingMissingUI.showMusicLibrary();
            musicSection.appendChild(libraryBtn);

            const uploadBtn = document.createElement('button');
            uploadBtn.textContent = '⬆️ Upload Music';
            uploadBtn.className = 'primary-btn';
            uploadBtn.onclick = () => streamingMissingUI.showUploadMusic();
            musicSection.appendChild(uploadBtn);
        }

        // Add streaming controls
        const liveSection = mediaSection.querySelector('#mediaLive');
        if (liveSection) {
            const scheduleBtn = document.createElement('button');
            scheduleBtn.textContent = '📅 Schedule Stream';
            scheduleBtn.className = 'secondary-btn';
            scheduleBtn.onclick = () => streamingMissingUI.showStreamScheduling();
            liveSection.appendChild(scheduleBtn);

            const analyticsBtn = document.createElement('button');
            analyticsBtn.textContent = '📊 Analytics';
            analyticsBtn.className = 'secondary-btn';
            analyticsBtn.onclick = () => streamingMissingUI.showStreamAnalytics();
            liveSection.appendChild(analyticsBtn);
        }

        // Add video call features
        const videoSection = mediaSection.querySelector('#mediaVideo');
        if (videoSection) {
            const recordBtn = document.createElement('button');
            recordBtn.textContent = '📹 My Recordings';
            recordBtn.className = 'secondary-btn';
            recordBtn.onclick = () => streamingMissingUI.showRecordingsLibrary();
            videoSection.appendChild(recordBtn);

            const shareBtn = document.createElement('button');
            shareBtn.textContent = '🖥️ Share Screen';
            shareBtn.className = 'secondary-btn';
            shareBtn.onclick = () => streamingMissingUI.showScreenShareOptions();
            videoSection.appendChild(shareBtn);
        }
    }
});
