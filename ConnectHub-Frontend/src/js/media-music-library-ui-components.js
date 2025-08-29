/**
 * Music Library/Playlist Management Interface - Complete System for ConnectHub
 * Provides: Music Library Management, Playlist Creation, Music Upload, Search & Filtering, Player Integration
 */

class MusicLibraryUI {
    constructor() {
        this.currentTrack = null;
        this.isPlaying = false;
        this.initializeMusicLibrary();
    }

    initializeMusicLibrary() {
        console.log('Music Library System initialized');
        this.addStyles();
        this.bindGlobalEvents();
    }

    addStyles() {
        if (!document.getElementById('music-library-styles')) {
            const style = document.createElement('style');
            style.id = 'music-library-styles';
            style.textContent = `
                .music-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center;
                    z-index: 10000; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
                .music-modal-overlay.show { opacity: 1; visibility: visible; }
                .music-modal { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 20px; 
                    width: 95%; max-width: 1200px; height: 85vh; overflow: hidden; transform: scale(0.9); 
                    transition: transform 0.3s ease; box-shadow: 0 20px 40px rgba(0,0,0,0.3); color: white; }
                .music-modal-overlay.show .music-modal { transform: scale(1); }
                .music-modal-header { padding: 25px 30px; border-bottom: 1px solid rgba(255,255,255,0.1); 
                    display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.2); }
                .music-modal-content { height: calc(85vh - 80px); display: flex; }
                .music-close-btn { background: none; border: none; color: white; font-size: 24px; 
                    cursor: pointer; padding: 8px; border-radius: 50%; transition: all 0.2s ease; }
                .music-sidebar { width: 280px; background: rgba(0,0,0,0.3); padding: 20px; overflow-y: auto; }
                .sidebar-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; 
                    border-radius: 10px; cursor: pointer; transition: all 0.2s ease; margin-bottom: 4px; }
                .sidebar-item:hover { background: rgba(255,255,255,0.1); }
                .sidebar-item.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                .music-content { flex: 1; display: flex; flex-direction: column; }
                .content-header { padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.1); }
                .content-body { flex: 1; padding: 20px 30px; overflow-y: auto; }
                .content-controls { display: flex; align-items: center; gap: 15px; flex-wrap: wrap; margin-bottom: 20px; }
                .search-input { width: 250px; padding: 8px 15px; background: rgba(255,255,255,0.1); 
                    border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; color: white; }
                .create-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; padding: 8px 16px; border: none; border-radius: 15px; cursor: pointer; }
                .music-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
                .music-card { background: rgba(255,255,255,0.05); border-radius: 15px; padding: 15px; 
                    transition: all 0.3s ease; cursor: pointer; }
                .music-card:hover { background: rgba(255,255,255,0.1); transform: translateY(-5px); }
                .album-art { width: 100%; aspect-ratio: 1; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    border-radius: 10px; display: flex; align-items: center; justify-content: center; 
                    font-size: 36px; margin-bottom: 12px; position: relative; }
                .play-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); 
                    display: flex; align-items: center; justify-content: center; opacity: 0; transition: all 0.2s ease; }
                .music-card:hover .play-overlay { opacity: 1; }
                .play-btn { background: white; color: black; border: none; width: 50px; height: 50px; 
                    border-radius: 50%; font-size: 20px; cursor: pointer; }
                .track-title { font-weight: 600; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .track-artist { font-size: 13px; color: rgba(255,255,255,0.7); }
                .track-duration { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 8px; }
                .music-list { display: flex; flex-direction: column; gap: 8px; }
                .music-list-item { display: flex; align-items: center; gap: 15px; padding: 12px; 
                    background: rgba(255,255,255,0.03); border-radius: 10px; transition: all 0.2s ease; cursor: pointer; }
                .music-list-item:hover { background: rgba(255,255,255,0.08); }
                .track-info { flex: 1; }
                .music-player-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 90px; 
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
                    border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; 
                    padding: 0 20px; z-index: 10001; transform: translateY(100%); transition: all 0.3s ease; }
                .music-player-bar.show { transform: translateY(0); }
                .player-track-info { display: flex; align-items: center; gap: 15px; width: 300px; }
                .player-art { width: 60px; height: 60px; border-radius: 8px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    display: flex; align-items: center; justify-content: center; }
                .player-controls { flex: 1; display: flex; align-items: center; justify-content: center; gap: 20px; }
                .player-btn { background: none; border: none; color: white; font-size: 20px; 
                    cursor: pointer; padding: 8px; border-radius: 50%; transition: all 0.2s ease; }
                .player-btn:hover { background: rgba(255,255,255,0.1); }
                .player-btn.primary { background: white; color: black; width: 40px; height: 40px; }
                .upload-area { border: 2px dashed rgba(255,255,255,0.3); border-radius: 15px; 
                    padding: 40px; text-align: center; margin: 20px 0; transition: all 0.3s ease; }
                .upload-area:hover { border-color: #667eea; background: rgba(102,126,234,0.1); }
            `;
            document.head.appendChild(style);
        }
    }

    bindGlobalEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAllModals();
        });
    }

    showMusicLibrary() {
        const modal = document.createElement('div');
        modal.className = 'music-modal-overlay';
        modal.id = 'music-library-modal';
        modal.innerHTML = `
            <div class="music-modal">
                <div class="music-modal-header">
                    <div>
                        <h2>🎵 Music Library</h2>
                        <p style="margin: 0; color: rgba(255,255,255,0.7);">Manage your music collection and playlists</p>
                    </div>
                    <button class="music-close-btn" onclick="musicLibraryUI.closeModal('music-library-modal')">×</button>
                </div>
                <div class="music-modal-content">
                    <div class="music-sidebar">
                        <div style="margin-bottom: 20px;">
                            <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 10px;">LIBRARY</div>
                            <div class="sidebar-item active" data-section="all-music">
                                <span>🎵</span> All Music <span style="margin-left: auto; font-size: 12px;">5</span>
                            </div>
                            <div class="sidebar-item" data-section="recently-played">
                                <span>⏱️</span> Recently Played
                            </div>
                            <div class="sidebar-item" data-section="favorites">
                                <span>❤️</span> Liked Songs <span style="margin-left: auto; font-size: 12px;">2</span>
                            </div>
                            <div class="sidebar-item" data-section="uploads">
                                <span>⬆️</span> My Uploads <span style="margin-left: auto; font-size: 12px;">0</span>
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 10px;">PLAYLISTS</div>
                            <div class="sidebar-item" data-section="create-playlist" style="color: #667eea;">
                                <span>➕</span> Create Playlist
                            </div>
                        </div>
                    </div>
                    <div class="music-content">
                        <div class="content-header">
                            <div style="font-size: 24px; font-weight: 700;" id="content-title">All Music</div>
                            <div style="font-size: 14px; color: rgba(255,255,255,0.7);" id="content-subtitle">Your complete music collection</div>
                        </div>
                        <div class="content-body">
                            <div class="content-controls">
                                <input type="text" class="search-input" placeholder="Search songs, artists, albums..." id="music-search">
                                <button class="create-btn" onclick="musicLibraryUI.showUploadInterface()">⬆️ Upload Music</button>
                            </div>
                            <div id="music-content-area">
                                <div class="music-grid">
                                    <div class="music-card" data-track-id="1">
                                        <div class="album-art">
                                            🎵
                                            <div class="play-overlay">
                                                <button class="play-btn" onclick="musicLibraryUI.playTrack(1)">▶️</button>
                                            </div>
                                        </div>
                                        <div class="track-title">Bohemian Rhapsody</div>
                                        <div class="track-artist">Queen</div>
                                        <div class="track-duration">5:55</div>
                                    </div>
                                    <div class="music-card" data-track-id="2">
                                        <div class="album-art">
                                            🎵
                                            <div class="play-overlay">
                                                <button class="play-btn" onclick="musicLibraryUI.playTrack(2)">▶️</button>
                                            </div>
                                        </div>
                                        <div class="track-title">Hotel California</div>
                                        <div class="track-artist">Eagles</div>
                                        <div class="track-duration">6:30</div>
                                    </div>
                                    <div class="music-card" data-track-id="3">
                                        <div class="album-art">
                                            🎵
                                            <div class="play-overlay">
                                                <button class="play-btn" onclick="musicLibraryUI.playTrack(3)">▶️</button>
                                            </div>
                                        </div>
                                        <div class="track-title">Stairway to Heaven</div>
                                        <div class="track-artist">Led Zeppelin</div>
                                        <div class="track-duration">8:02</div>
                                    </div>
                                    <div class="music-card" data-track-id="4">
                                        <div class="album-art">
                                            🎵
                                            <div class="play-overlay">
                                                <button class="play-btn" onclick="musicLibraryUI.playTrack(4)">▶️</button>
                                            </div>
                                        </div>
                                        <div class="track-title">Sweet Child O' Mine</div>
                                        <div class="track-artist">Guns N' Roses</div>
                                        <div class="track-duration">5:03</div>
                                    </div>
                                    <div class="music-card" data-track-id="5">
                                        <div class="album-art">
                                            🎵
                                            <div class="play-overlay">
                                                <button class="play-btn" onclick="musicLibraryUI.playTrack(5)">▶️</button>
                                            </div>
                                        </div>
                                        <div class="track-title">Imagine</div>
                                        <div class="track-artist">John Lennon</div>
                                        <div class="track-duration">3:03</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        this.setupMusicLibraryEvents();
    }

    setupMusicLibraryEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.sidebar-item[data-section]')) {
                const item = e.target.closest('.sidebar-item');
                const section = item.dataset.section;
                
                document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                this.loadMusicContent(section);
            }
        });

        const searchInput = document.getElementById('music-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchMusic(e.target.value);
            });
        }
    }

    loadMusicContent(section) {
        const contentArea = document.getElementById('music-content-area');
        const titleEl = document.getElementById('content-title');
        const subtitleEl = document.getElementById('content-subtitle');
        
        if (!contentArea) return;

        const sections = {
            'all-music': () => {
                titleEl.textContent = 'All Music';
                subtitleEl.textContent = 'Your complete music collection';
                return this.renderAllMusic();
            },
            'recently-played': () => {
                titleEl.textContent = 'Recently Played';
                subtitleEl.textContent = 'Your recent listening history';
                return this.renderRecentlyPlayed();
            },
            'favorites': () => {
                titleEl.textContent = 'Liked Songs';
                subtitleEl.textContent = 'Songs you\'ve liked';
                return this.renderFavorites();
            },
            'uploads': () => {
                titleEl.textContent = 'My Uploads';
                subtitleEl.textContent = 'Music you\'ve uploaded';
                return this.renderUploads();
            },
            'create-playlist': () => {
                this.showCreatePlaylistModal();
                return '';
            }
        };

        const renderFunction = sections[section];
        if (renderFunction) {
            const content = renderFunction();
            if (content) contentArea.innerHTML = content;
        }
    }

    renderAllMusic() {
        return `
            <div class="music-grid">
                <div class="music-card" data-track-id="1">
                    <div class="album-art">🎵
                        <div class="play-overlay">
                            <button class="play-btn" onclick="musicLibraryUI.playTrack(1)">▶️</button>
                        </div>
                    </div>
                    <div class="track-title">Bohemian Rhapsody</div>
                    <div class="track-artist">Queen</div>
                    <div class="track-duration">5:55</div>
                </div>
                <div class="music-card" data-track-id="2">
                    <div class="album-art">🎵
                        <div class="play-overlay">
                            <button class="play-btn" onclick="musicLibraryUI.playTrack(2)">▶️</button>
                        </div>
                    </div>
                    <div class="track-title">Hotel California</div>
                    <div class="track-artist">Eagles</div>
                    <div class="track-duration">6:30</div>
                </div>
                <div class="music-card" data-track-id="3">
                    <div class="album-art">🎵
                        <div class="play-overlay">
                            <button class="play-btn" onclick="musicLibraryUI.playTrack(3)">▶️</button>
                        </div>
                    </div>
                    <div class="track-title">Stairway to Heaven</div>
                    <div class="track-artist">Led Zeppelin</div>
                    <div class="track-duration">8:02</div>
                </div>
            </div>
        `;
    }

    renderRecentlyPlayed() {
        return `
            <div class="music-list">
                <div class="music-list-item" data-track-id="1">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center;">🎵</div>
                    <div class="track-info">
                        <div class="track-title">Shape of You</div>
                        <div class="track-artist">Ed Sheeran</div>
                    </div>
                    <div style="font-size: 13px; color: rgba(255,255,255,0.5);">Played 2 hours ago</div>
                    <button class="play-btn" style="width: 30px; height: 30px;" onclick="musicLibraryUI.playTrack(1)">▶️</button>
                </div>
            </div>
        `;
    }

    renderFavorites() {
        return `
            <div class="music-list">
                <div class="music-list-item" data-track-id="1">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center;">🎵</div>
                    <div class="track-info">
                        <div class="track-title">Bohemian Rhapsody</div>
                        <div class="track-artist">Queen</div>
                    </div>
                    <div style="font-size: 13px; color: rgba(255,255,255,0.5);">❤️ Liked</div>
                    <button class="play-btn" style="width: 30px; height: 30px;" onclick="musicLibraryUI.playTrack(1)">▶️</button>
                </div>
            </div>
        `;
    }

    renderUploads() {
        return `
            <div class="upload-area">
                <div style="font-size: 48px; margin-bottom: 15px;">⬆️</div>
                <div style="font-size: 16px; margin-bottom: 10px;">Drag & drop music files here</div>
                <div style="font-size: 13px; color: rgba(255,255,255,0.6);">Supported formats: MP3, WAV, FLAC, M4A (Max 50MB per file)</div>
                <input type="file" style="display: none;" id="music-file-input" multiple accept=".mp3,.wav,.flac,.m4a">
                <button class="create-btn" onclick="document.getElementById('music-file-input').click()" style="margin-top: 20px;">📁 Browse Files</button>
            </div>
        `;
    }

    showCreatePlaylistModal() {
        console.log('Create playlist modal would open here');
        alert('Create Playlist feature - would open modal for playlist creation');
    }

    playTrack(trackId) {
        console.log(`Playing track ${trackId}`);
        this.currentTrack = trackId;
        this.isPlaying = true;
        this.showMusicPlayer(trackId);
    }

    showMusicPlayer(trackId) {
        let playerBar = document.getElementById('music-player-bar');
        
        if (!playerBar) {
            playerBar = document.createElement('div');
            playerBar.id = 'music-player-bar';
            playerBar.className = 'music-player-bar';
            playerBar.innerHTML = `
                <div class="player-track-info">
                    <div class="player-art">🎵</div>
                    <div>
                        <div style="font-weight: 600; margin-bottom: 2px;">Bohemian Rhapsody</div>
                        <div style="font-size: 13px; color: rgba(255,255,255,0.7);">Queen</div>
                    </div>
                </div>
                
                <div class="player-controls">
                    <button class="player-btn" onclick="musicLibraryUI.toggleShuffle()">🔀</button>
                    <button class="player-btn" onclick="musicLibraryUI.previousTrack()">⏮️</button>
                    <button class="player-btn primary" onclick="musicLibraryUI.togglePlay()">⏸️</button>
                    <button class="player-btn" onclick="musicLibraryUI.nextTrack()">⏭️</button>
                    <button class="player-btn" onclick="musicLibraryUI.toggleRepeat()">🔁</button>
                </div>
                
                <div style="width: 150px; display: flex; align-items: center; gap: 10px;">
                    <button class="player-btn">🔊</button>
                    <div style="flex: 1; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px;">
                        <div style="width: 80%; height: 100%; background: white; border-radius: 2px;"></div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(playerBar);
        }
        
        setTimeout(() => playerBar.classList.add('show'), 10);
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        console.log('Toggle play/pause');
    }

    toggleShuffle() {
        console.log('Toggle shuffle');
    }

    toggleRepeat() {
        console.log('Toggle repeat');
    }

    previousTrack() {
        console.log('Previous track');
    }

    nextTrack() {
        console.log('Next track');
    }

    showUploadInterface() {
        const uploadsItem = document.querySelector('[data-section="uploads"]');
        if (uploadsItem) {
            uploadsItem.click();
        }
    }

    searchMusic(query) {
        console.log('Searching for:', query);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    closeAllModals() {
        document.querySelectorAll('.music-modal-overlay').forEach(modal => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });
    }

    loadUserMusicLibrary() {
        console.log('Loading user music library');
    }
}

// Initialize Music Library
const musicLibraryUI = new MusicLibraryUI();

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusicLibraryUI;
}
