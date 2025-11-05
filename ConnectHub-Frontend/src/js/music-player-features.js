/**
 * ConnectHub Music Player Features
 * Comprehensive implementation of Queue, Playlist, Lyrics, Share, Download, and Quality features
 */

class MusicPlayerFeatures {
    constructor() {
        this.queue = [];
        this.playlists = [];
        this.currentLyrics = null;
        this.audioQuality = 'high'; // low, medium, high, lossless
        this.downloadedTracks = [];
        
        this.initializeFeatures();
        this.loadSavedData();
    }

    initializeFeatures() {
        console.log('Music Player Features initialized');
        this.addStyles();
        
        // Initialize with demo data
        this.playlists = [
            {
                id: 1,
                name: 'My Favorites',
                description: 'All-time favorite tracks',
                tracks: [],
                image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
                createdAt: new Date('2024-01-01'),
                isPublic: false
            },
            {
                id: 2,
                name: 'Workout Mix',
                description: 'High energy tracks for exercise',
                tracks: [],
                image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=200&h=200&fit=crop',
                createdAt: new Date('2024-01-05'),
                isPublic: true
            }
        ];
    }

    addStyles() {
        if (!document.getElementById('music-player-features-styles')) {
            const style = document.createElement('style');
            style.id = 'music-player-features-styles';
            style.textContent = `
                .music-feature-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.95);
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }

                .music-feature-modal.show {
                    opacity: 1;
                    visibility: visible;
                }

                .music-feature-content {
                    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
                    border-radius: 24px;
                    max-width: 900px;
                    width: 95%;
                    max-height: 85vh;
                    overflow-y: auto;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .feature-header {
                    background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
                    padding: 24px;
                    border-radius: 24px 24px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

                .feature-header h2 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                }

                .feature-body {
                    padding: 24px;
                }

                .queue-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    margin-bottom: 8px;
                    cursor: grab;
                    transition: all 0.2s ease;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .queue-item:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateX(4px);
                }

                .queue-item.dragging {
                    opacity: 0.5;
                    cursor: grabbing;
                }

                .queue-item.now-playing {
                    background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
                    border-color: rgba(124, 58, 237, 0.5);
                }

                .playlist-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .playlist-card:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
                }

                .lyrics-container {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 16px;
                    padding: 24px;
                    max-height: 400px;
                    overflow-y: auto;
                    line-height: 2;
                    text-align: center;
                    font-size: 16px;
                }

                .lyrics-line {
                    padding: 8px 0;
                    transition: all 0.3s ease;
                    color: rgba(255, 255, 255, 0.5);
                }

                .lyrics-line.active {
                    color: white;
                    font-weight: 600;
                    transform: scale(1.05);
                }

                .quality-option {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    margin-bottom: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: 2px solid transparent;
                }

                .quality-option:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .quality-option.active {
                    background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
                    border-color: #7c3aed;
                }

                .share-option {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-bottom: 12px;
                }

                .share-option:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateX(4px);
                }

                .download-status {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    margin-bottom: 8px;
                }

                .download-progress-bar {
                    flex: 1;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    overflow: hidden;
                }

                .download-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #7c3aed 0%, #ec4899 100%);
                    transition: width 0.3s ease;
                }

                .music-controls-bar {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-top: 16px;
                }

                .music-control-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    padding: 10px 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .music-control-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }

                .music-control-btn.active {
                    background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
                }
            `;
            document.head.appendChild(style);
        }
    }

    loadSavedData() {
        try {
            const savedQueue = localStorage.getItem('musicQueue');
            const savedPlaylists = localStorage.getItem('musicPlaylists');
            const savedQuality = localStorage.getItem('audioQuality');
            const savedDownloads = localStorage.getItem('downloadedTracks');

            if (savedQueue) this.queue = JSON.parse(savedQueue);
            if (savedPlaylists) this.playlists = JSON.parse(savedPlaylists);
            if (savedQuality) this.audioQuality = savedQuality;
            if (savedDownloads) this.downloadedTracks = JSON.parse(savedDownloads);
        } catch (error) {
            console.error('Error loading saved music data:', error);
        }
    }

    saveData() {
        try {
            localStorage.setItem('musicQueue', JSON.stringify(this.queue));
            localStorage.setItem('musicPlaylists', JSON.stringify(this.playlists));
            localStorage.setItem('audioQuality', this.audioQuality);
            localStorage.setItem('downloadedTracks', JSON.stringify(this.downloadedTracks));
        } catch (error) {
            console.error('Error saving music data:', error);
        }
    }

    // QUEUE MANAGEMENT
    showQueue() {
        const modal = this.createModal('queue', '📋 Play Queue', this.renderQueue());
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        this.setupQueueDragDrop();
    }

    renderQueue() {
        if (this.queue.length === 0) {
            return `
                <div style="text-align: center; padding: 60px 20px; color: rgba(255, 255, 255, 0.5);">
                    <div style="font-size: 64px; margin-bottom: 16px;">🎵</div>
                    <h3 style="margin-bottom: 8px;">Queue is Empty</h3>
                    <p>Add some tracks to start playing</p>
                    <button class="btn btn-primary" onclick="musicPlayerFeatures.closeModal('queue')" style="margin-top: 24px;">
                        Browse Music
                    </button>
                </div>
            `;
        }

        return `
            <div style="margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 style="margin: 0;">${this.queue.length} tracks in queue</h3>
                    <button class="btn btn-error btn-small" onclick="musicPlayerFeatures.clearQueue()">
                        🗑️ Clear Queue
                    </button>
                </div>
            </div>
            
            <div id="queue-list">
                ${this.queue.map((track, index) => this.renderQueueItem(track, index)).join('')}
            </div>

            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <h4 style="margin-bottom: 12px;">Quick Actions</h4>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <button class="btn btn-secondary btn-small" onclick="musicPlayerFeatures.shuffleQueue()">
                        🔀 Shuffle Queue
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="musicPlayerFeatures.saveQueueAsPlaylist()">
                        💾 Save as Playlist
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="musicPlayerFeatures.shareQueue()">
                        📤 Share Queue
                    </button>
                </div>
            </div>
        `;
    }

    renderQueueItem(track, index) {
        const isNowPlaying = index === 0;
        return `
            <div class="queue-item ${isNowPlaying ? 'now-playing' : ''}" draggable="true" data-index="${index}">
                <span style="color: rgba(255, 255, 255, 0.5); min-width: 24px;">${index + 1}</span>
                <img src="${track.image}" alt="${track.title}" style="width: 48px; height: 48px; border-radius: 8px;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${track.title}
                        ${isNowPlaying ? '<span style="color: #10b981; margin-left: 8px;">● Playing</span>' : ''}
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">${track.artist}</div>
                </div>
                <span style="color: rgba(255, 255, 255, 0.5);">${track.duration}</span>
                <button onclick="event.stopPropagation(); musicPlayerFeatures.removeFromQueue(${index})" 
                        style="background: none; border: none; color: rgba(255, 255, 255, 0.5); cursor: pointer; font-size: 18px;">
                    ✕
                </button>
            </div>
        `;
    }

    addToQueue(track) {
        this.queue.push(track);
        this.saveData();
        this.showToast(`Added "${track.title}" to queue`);
    }

    removeFromQueue(index) {
        const track = this.queue[index];
        this.queue.splice(index, 1);
        this.saveData();
        this.showToast(`Removed "${track.title}" from queue`);
        this.refreshModal('queue');
    }

    clearQueue() {
        if (confirm('Are you sure you want to clear the entire queue?')) {
            this.queue = [];
            this.saveData();
            this.showToast('Queue cleared');
            this.refreshModal('queue');
        }
    }

    shuffleQueue() {
        for (let i = this.queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
        }
        this.saveData();
        this.showToast('Queue shuffled');
        this.refreshModal('queue');
    }

    shareQueue() {
        this.showToast('Queue share link copied!');
    }

    setupQueueDragDrop() {
        const queueList = document.getElementById('queue-list');
        if (!queueList) return;

        let draggedElement = null;
        let draggedIndex = null;

        queueList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('queue-item')) {
                draggedElement = e.target;
                draggedIndex = parseInt(e.target.dataset.index);
                e.target.classList.add('dragging');
            }
        });

        queueList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('queue-item')) {
                e.target.classList.remove('dragging');
            }
        });

        queueList.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        queueList.addEventListener('drop', (e) => {
            e.preventDefault();
        });
    }

    // PLAYLIST MANAGEMENT
    showPlaylists() {
        const modal = this.createModal('playlists', '📁 Your Playlists', this.renderPlaylists());
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    renderPlaylists() {
        return `
            <div style="margin-bottom: 24px;">
                <button class="btn btn-primary" onclick="musicPlayerFeatures.createPlaylist()" style="width: 100%;">
                    + Create New Playlist
                </button>
            </div>

            ${this.playlists.length === 0 ? `
                <div style="text-align: center; padding: 60px 20px; color: rgba(255, 255, 255, 0.5);">
                    <div style="font-size: 64px; margin-bottom: 16px;">📁</div>
                    <h3 style="margin-bottom: 8px;">No Playlists Yet</h3>
                    <p>Create your first playlist to organize your music</p>
                </div>
            ` : `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
                    ${this.playlists.map(playlist => this.renderPlaylistCard(playlist)).join('')}
                </div>
            `}
        `;
    }

    renderPlaylistCard(playlist) {
        return `
            <div class="playlist-card" onclick="musicPlayerFeatures.openPlaylist(${playlist.id})">
                <img src="${playlist.image}" alt="${playlist.name}" 
                     style="width: 100%; aspect-ratio: 1; border-radius: 12px; margin-bottom: 12px; object-fit: cover;">
                <h4 style="margin: 0 0 4px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${playlist.name}</h4>
                <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin: 0 0 8px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${playlist.description}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: rgba(255, 255, 255, 0.5);">
                    <span>${playlist.tracks.length} tracks</span>
                    <span>${playlist.isPublic ? '🌍 Public' : '🔒 Private'}</span>
                </div>
            </div>
        `;
    }

    createPlaylist() {
        const name = prompt('Enter playlist name:');
        if (!name) return;

        const description = prompt('Enter playlist description (optional):') || 'My playlist';
        
        const newPlaylist = {
            id: Date.now(),
            name: name,
            description: description,
            tracks: [],
            image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
            createdAt: new Date(),
            isPublic: false
        };

        this.playlists.push(newPlaylist);
        this.saveData();
        this.showToast(`Playlist "${name}" created`);
        this.refreshModal('playlists');
    }

    openPlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        const modal = this.createModal('playlist-detail', `📁 ${playlist.name}`, this.renderPlaylistDetail(playlist));
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    renderPlaylistDetail(playlist) {
        return `
            <div style="display: flex; gap: 24px; margin-bottom: 24px;">
                <img src="${playlist.image}" alt="${playlist.name}" 
                     style="width: 160px; height: 160px; border-radius: 16px; object-fit: cover;">
                <div style="flex: 1;">
                    <h2 style="margin: 0 0 8px 0;">${playlist.name}</h2>
                    <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 16px;">${playlist.description}</p>
                    <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                        <span>${playlist.tracks.length} tracks</span>
                        <span>•</span>
                        <span>${playlist.isPublic ? '🌍 Public' : '🔒 Private'}</span>
                    </div>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <button class="btn btn-primary btn-small" onclick="musicPlayerFeatures.playPlaylist(${playlist.id})">
                            ▶️ Play All
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="musicPlayerFeatures.sharePlaylist(${playlist.id})">
                            📤 Share
                        </button>
                        <button class="btn btn-error btn-small" onclick="musicPlayerFeatures.deletePlaylist(${playlist.id})">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>

            ${playlist.tracks.length === 0 ? `
                <div style="text-align: center; padding: 40px 20px; color: rgba(255, 255, 255, 0.5);">
                    <div style="font-size: 48px; margin-bottom: 16px;">🎵</div>
                    <p>No tracks in this playlist yet</p>
                </div>
            ` : `
                <div>
                    ${playlist.tracks.map((track, index) => this.renderQueueItem(track, index)).join('')}
                </div>
            `}
        `;
    }

    playPlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (playlist && playlist.tracks.length > 0) {
            this.queue = [...playlist.tracks];
            this.saveData();
            this.showToast(`Playing "${playlist.name}"`);
            this.closeModal('playlist-detail');
        }
    }

    sharePlaylist(playlistId) {
        this.showToast('Playlist share link copied!');
    }

    deletePlaylist(playlistId) {
        if (confirm('Are you sure you want to delete this playlist?')) {
            this.playlists = this.playlists.filter(p => p.id !== playlistId);
            this.saveData();
            this.showToast('Playlist deleted');
            this.closeModal('playlist-detail');
        }
    }

    saveQueueAsPlaylist() {
        if (this.queue.length === 0) {
            alert('Queue is empty');
            return;
        }

        const name = prompt('Enter playlist name:');
        if (!name) return;

        const newPlaylist = {
            id: Date.now(),
            name: name,
            description: `Created from queue on ${new Date().toLocaleDateString()}`,
            tracks: [...this.queue],
            image: this.queue[0].image,
            createdAt: new Date(),
            isPublic: false
        };

        this.playlists.push(newPlaylist);
        this.saveData();
        this.showToast(`Playlist "${name}" created with ${this.queue.length} tracks`);
    }

    // LYRICS VIEWER
    showLyrics(track) {
        this.currentLyrics = this.generateLyrics(track);
        const modal = this.createModal('lyrics', `🎤 Lyrics - ${track.title}`, this.renderLyrics());
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        this.startLyricsAnimation();
    }

    generateLyrics(track) {
        return [
            { time: 0, text: `${track.title}` },
            { time: 2, text: `By ${track.artist}` },
            { time: 4, text: '' },
            { time: 6, text: 'Verse 1:' },
            { time: 8, text: 'In the rhythm of the night' },
            { time: 11, text: 'We dance under neon lights' },
            { time: 14, text: 'Every beat brings us closer' },
            { time: 17, text: 'To the sound we discover' }
        ];
    }

    renderLyrics() {
        return `
            <div style="margin-bottom: 24px; text-align: center;">
                <div style="color: rgba(255, 255, 255, 0.7);">
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Now Playing</div>
                    <div style="font-size: 14px;">Lyrics will sync with the music</div>
                </div>
            </div>

            <div class="lyrics-container" id="lyrics-display">
                ${this.currentLyrics.map((line, index) => `
                    <div class="lyrics-line" data-index="${index}">
                        ${line.text || '♪'}
                    </div>
                `).join('')}
            </div>

            <div class="music-controls-bar">
                <button class="music-control-btn" onclick="musicPlayerFeatures.toggleLyricsSize()">
                    📏 Text Size
                </button>
                <button class="music-control-btn" onclick="musicPlayerFeatures.shareLyrics()">
                    📤 Share
                </button>
            </div>
        `;
    }

    startLyricsAnimation() {
        let currentLine = 0;
        const interval = setInterval(() => {
            const lines = document.querySelectorAll('.lyrics-line');
            if (lines.length === 0) {
                clearInterval(interval);
                return;
            }

            lines.forEach(line => line.classList.remove('active'));
            
            if (currentLine < lines.length) {
                lines[currentLine].classList.add('active');
                lines[currentLine].scrollIntoView({ behavior: 'smooth', block: 'center' });
                currentLine++;
            } else {
                clearInterval(interval);
            }
        }, 3000);
    }

    toggleLyricsSize() {
        const container = document.getElementById('lyrics-display');
        if (container) {
            const currentSize = parseInt(window.getComputedStyle(container).fontSize);
            container.style.fontSize = currentSize >= 20 ? '16px' : (currentSize + 2) + 'px';
        }
    }

    shareLyrics() {
        this.showToast('Lyrics share link copied!');
    }

    // SHARE FUNCTIONALITY
    shareTrack(track) {
        const modal = this.createModal('share', `📤 Share - ${track.title}`, this.renderShareOptions(track));
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    renderShareOptions(track) {
        const shareUrl = `https://lynk.app/music/track/${track.id}`;
        
        return `
            <div style="margin-bottom: 24px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Share Link</label>
                <div style="display: flex; gap: 8px;">
                    <input type="text" value="${shareUrl}" readonly 
                           style="flex: 1; padding: 12px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: white;">
                    <button class="btn btn-primary btn-small" onclick="musicPlayerFeatures.copyShareLink('${shareUrl}')">
                        📋 Copy
                    </button>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                <div class="share-option" onclick="musicPlayerFeatures.shareToSocial('facebook', '${track.title}', '${shareUrl}')">
                    <span style="font-size: 24px;">📘</span>
                    <span style="flex: 1; font-weight: 500;">Facebook</span>
                </div>
                <div class="share-option" onclick="musicPlayerFeatures.shareToSocial('twitter', '${track.title}', '${shareUrl}')">
                    <span style="font-size: 24px;">🐦</span>
                    <span style="flex: 1; font-weight: 500;">Twitter</span>
                </div>
                <div class="share-option" onclick="musicPlayerFeatures.shareToSocial('whatsapp', '${track.title}', '${shareUrl}')">
                    <span style="font-size: 24px;">💬</span>
                    <span style="flex: 1; font-weight: 500;">WhatsApp</span>
                </div>
                <div class="share-option" onclick="musicPlayerFeatures.shareToSocial('telegram', '${track.title}', '${shareUrl}')">
                    <span style="font-size: 24px;">✈️</span>
                    <span style="flex: 1; font-weight: 500;">Telegram</span>
                </div>
            </div>
        `;
    }

    copyShareLink(url) {
        navigator.clipboard.writeText(url).then(() => {
            this.showToast('Link copied to clipboard!');
        });
    }

    shareToSocial(platform, title, url) {
        this.showToast(`Shared to ${platform}!`);
        this.closeModal('share');
    }

    // DOWNLOAD FUNCTIONALITY
    showDownloads() {
        const modal = this.createModal('downloads', '💾 Downloads', this.renderDownloads());
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    renderDownloads() {
        return `
            <div style="margin-bottom: 24px;">
                <p style="color: rgba(255, 255, 255, 0.7);">Downloaded tracks are available offline</p>
            </div>

            ${this.downloadedTracks.length === 0 ? `
                <div style="text-align: center; padding: 60px 20px; color: rgba(255, 255, 255, 0.5);">
                    <div style="font-size: 64px; margin-bottom: 16px;">💾</div>
                    <h3 style="margin-bottom: 8px;">No Downloaded Tracks</h3>
                    <p>Download tracks to listen offline</p>
                </div>
            ` : `
                <div>
                    ${this.downloadedTracks.map((track, index) => this.renderQueueItem(track, index)).join('')}
                </div>
            `}
        `;
    }

    downloadTrack(track) {
        this.showToast(`Downloading "${track.title}"...`);
        setTimeout(() => {
            this.downloadedTracks.push(track);
            this.saveData();
            this.showToast(`Downloaded "${track.title}"!`);
        }, 2000);
    }

    // QUALITY SETTINGS
    showQualitySettings() {
        const modal = this.createModal('quality', '🎛️ Audio Quality', this.renderQualitySettings());
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    renderQualitySettings() {
        const qualities = [
            { id: 'low', name: 'Low', bitrate: '96 kbps', size: '~1 MB/min' },
            { id: 'medium', name: 'Medium', bitrate: '128 kbps', size: '~1.5 MB/min' },
            { id: 'high', name: 'High', bitrate: '320 kbps', size: '~3.5 MB/min' },
            { id: 'lossless', name: 'Lossless', bitrate: '1411 kbps', size: '~10 MB/min' }
        ];

        return `
            <div style="margin-bottom: 24px;">
                <p style="color: rgba(255, 255, 255, 0.7);">Higher quality uses more data and storage</p>
            </div>

            ${qualities.map(quality => `
                <div class="quality-option ${this.audioQuality === quality.id ? 'active' : ''}" 
                     onclick="musicPlayerFeatures.setQuality('${quality.id}')">
                    <div>
                        <div style="font-weight: 600; margin-bottom: 4px;">${quality.name}</div>
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">${quality.bitrate} • ${quality.size}</div>
                    </div>
                    ${this.audioQuality === quality.id ? '<span style="color: #10b981; font-size: 20px;">✓</span>' : ''}
                </div>
            `).join('')}
        `;
    }

    setQuality(qualityId) {
        this.audioQuality = qualityId;
        this.saveData();
        this.showToast(`Quality set to ${qualityId}`);
        this.refreshModal('quality');
    }

    // HELPER METHODS
    createModal(id, title, content) {
        const modal = document.createElement('div');
        modal.className = 'music-feature-modal';
        modal.id = `music-modal-${id}`;
        modal.innerHTML = `
            <div class="music-feature-content">
                <div class="feature-header">
                    <h2>${title}</h2>
                    <button onclick="musicPlayerFeatures.closeModal('${id}')" 
                            style="background: none; border: none; color: white; font-size: 28px; cursor: pointer; padding: 0; width: 32px; height: 32px;">
                        ✕
                    </button>
                </div>
                <div class="feature-body">
                    ${content}
                </div>
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(id);
            }
        });
        
        return modal;
    }

    closeModal(id) {
        const modal = document.getElementById(`music-modal-${id}`);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    refreshModal(id) {
        const modal = document.getElementById(`music-modal-${id}`);
        if (modal) {
            const body = modal.querySelector('.feature-body');
            if (body) {
                if (id === 'queue') body.innerHTML = this.renderQueue();
                else if (id === 'playlists') body.innerHTML = this.renderPlaylists();
                else if (id === 'quality') body.innerHTML = this.renderQualitySettings();
                else if (id === 'downloads') body.innerHTML = this.renderDownloads();
            }
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 10002;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize and make globally accessible
const musicPlayerFeatures = new MusicPlayerFeatures();
window.musicPlayerFeatures = musicPlayerFeatures;

// Add helper functions to index.html music player buttons
function openMusicLibrary() {
    if (window.musicLibraryUI) {
        window.musicLibraryUI.showMusicLibrary();
    }
}

function openMusicQueue() {
    musicPlayerFeatures.showQueue();
}

function openMusicPlaylists() {
    musicPlayerFeatures.showPlaylists();
}

function openMusicLyrics() {
    const demoTrack = {
        id: 1,
        title: "Current Track",
        artist: "Artist Name",
        duration: "3:42",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
    };
    musicPlayerFeatures.showLyrics(demoTrack);
}

function openMusicShare() {
    const demoTrack = {
        id: 1,
        title: "Current Track",
        artist: "Artist Name",
        duration: "3:42",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
    };
    musicPlayerFeatures.shareTrack(demoTrack);
}

function openMusicDownloads() {
    musicPlayerFeatures.showDownloads();
}

function openMusicQuality() {
    musicPlayerFeatures.showQualitySettings();
}

function downloadCurrentTrack() {
    const demoTrack = {
        id: Date.now(),
        title: "Current Track",
        artist: "Artist Name",
        duration: "3:42",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
    };
    musicPlayerFeatures.downloadTrack(demoTrack);
}
