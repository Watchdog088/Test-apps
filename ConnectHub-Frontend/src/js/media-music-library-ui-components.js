/**
 * ConnectHub Music Interfaces - Complete Implementation
 * Based on the provided music-library-interface2.txt design
 * Includes: Music Library, Live Sessions Dashboard, Music Discovery, Global Mini Player
 */

class MusicLibraryUI {
    constructor() {
        // Global State Management
        this.activeInterface = 'library';
        this.isPlaying = false;
        this.currentTrack = null;
        this.globalProgress = 0;
        this.globalVolume = 75;

        // Music Library State
        this.viewMode = 'grid';
        this.activeFilter = 'all';
        this.searchQuery = '';

        // Discovery State
        this.activeTab = 'trending';
        this.currentView = 'main';
        this.selectedGenre = null;
        this.selectedRecommendation = null;
        this.selectedTrack = null;
        this.navigationStack = [];
        this.genreSearchQuery = '';

        // Live Dashboard State
        this.liveMetrics = {
            activeListeners: 12847,
            totalSessions: 156,
            avgSessionTime: "24m 32s",
            topGenres: ["Electronic", "Pop", "Rock", "Hip-Hop"],
            recentActivity: []
        };

        // Enhanced Mock Data
        this.musicLibraryTracks = [
            { 
                id: 1, title: "Midnight Dreams", artist: "Luna Vista", album: "Nocturnal Echoes", 
                duration: "3:42", plays: 125420, liked: true, dateAdded: "2024-01-15", genre: "Electronic",
                image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop" 
            },
            { 
                id: 2, title: "Electric Pulse", artist: "Neon Collective", album: "Digital Soul", 
                duration: "4:18", plays: 89301, liked: false, dateAdded: "2024-01-12", genre: "Electronic",
                image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=200&h=200&fit=crop" 
            },
            { 
                id: 3, title: "Ocean Waves", artist: "Coastal Sounds", album: "Tidal Rhythms", 
                duration: "5:02", plays: 203845, liked: true, dateAdded: "2024-01-10", genre: "Ambient",
                image: "https://images.unsplash.com/photo-1520637836862-4d197d17c97a?w=200&h=200&fit=crop" 
            },
            { 
                id: 4, title: "Urban Symphony", artist: "City Lights", album: "Metropolitan", 
                duration: "3:55", plays: 156789, liked: false, dateAdded: "2024-01-08", genre: "Hip-Hop",
                image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" 
            },
            { 
                id: 5, title: "Starlight Serenade", artist: "Cosmic Journey", album: "Infinite Space", 
                duration: "6:23", plays: 78452, liked: true, dateAdded: "2024-01-05", genre: "Ambient",
                image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop" 
            },
            { 
                id: 6, title: "Neon Nights", artist: "Synthwave Dreams", album: "Retro Future", 
                duration: "4:44", plays: 192367, liked: false, dateAdded: "2024-01-03", genre: "Electronic",
                image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=200&h=200&fit=crop" 
            }
        ];

        this.genreData = {
            'Electronic': {
                id: 'electronic', name: 'Electronic', description: 'Synthetic beats and digital soundscapes',
                totalTracks: 1247, totalListeners: 89432,
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
                artists: ['Synthwave Masters', 'Neon Collective', 'Future Bass', 'Cyber City'],
                tracks: [
                    { id: 101, title: "Digital Horizon", artist: "Synthwave Masters", album: "Cyber Dreams", duration: "4:12", plays: 892341, liked: false, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop" },
                    { id: 102, title: "Electric Pulse", artist: "Neon Collective", album: "Digital Soul", duration: "4:18", plays: 756432, liked: true, image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=200&h=200&fit=crop" },
                    { id: 103, title: "Neon Dreams", artist: "Future Bass", album: "Synthetic Reality", duration: "3:45", plays: 634521, liked: false, image: "https://images.unsplash.com/photo-1520637836862-4d197d17c97a?w=200&h=200&fit=crop" },
                    { id: 104, title: "Cyber Nights", artist: "Cyber City", album: "Digital Metropolis", duration: "5:02", plays: 543219, liked: true, image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" },
                    { id: 105, title: "Quantum Beats", artist: "Synthwave Masters", album: "Future Waves", duration: "4:33", plays: 421876, liked: false, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop" }
                ]
            },
            'Hip-Hop': {
                id: 'hiphop', name: 'Hip-Hop', description: 'Beats, rhymes, and urban culture',
                totalTracks: 892, totalListeners: 124567,
                gradient: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
                artists: ['City Lights', 'Lyrical Minds', 'Beat Collective'],
                tracks: [
                    { id: 201, title: "Urban Symphony", artist: "City Lights", album: "Metropolitan", duration: "3:55", plays: 1234567, liked: true, image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" },
                    { id: 202, title: "Street Poetry", artist: "Lyrical Minds", album: "Words & Beats", duration: "4:21", plays: 987654, liked: false, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop" },
                    { id: 203, title: "Bass Drop", artist: "Beat Collective", album: "Underground", duration: "3:12", plays: 765432, liked: true, image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=200&h=200&fit=crop" }
                ]
            },
            'Jazz': {
                id: 'jazz', name: 'Jazz', description: 'Smooth rhythms and improvised melodies',
                totalTracks: 674, totalListeners: 67890,
                gradient: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)',
                artists: ['Smooth Collective', 'Jazz Masters', 'Blue Note'],
                tracks: [
                    { id: 301, title: "Midnight Jazz", artist: "Smooth Collective", album: "After Hours", duration: "6:45", plays: 456789, liked: false, image: "https://images.unsplash.com/photo-1520637836862-4d197d17c97a?w=200&h=200&fit=crop" },
                    { id: 302, title: "Blue Harmony", artist: "Jazz Masters", album: "Classic Sessions", duration: "5:23", plays: 234567, liked: true, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop" }
                ]
            },
            'Rock': {
                id: 'rock', name: 'Rock', description: 'Powerful guitars and driving rhythms',
                totalTracks: 1156, totalListeners: 198765,
                gradient: 'linear-gradient(135deg, #dc2626 0%, #ec4899 100%)',
                artists: ['Thunder Strike', 'Electric Storm', 'Rock Legends'],
                tracks: [
                    { id: 401, title: "Thunder Road", artist: "Thunder Strike", album: "Electric Dreams", duration: "4:56", plays: 1456789, liked: true, image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" },
                    { id: 402, title: "Storm Chaser", artist: "Electric Storm", album: "Lightning", duration: "3:42", plays: 876543, liked: false, image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=200&h=200&fit=crop" }
                ]
            }
        };

        this.recommendationCategories = {
            'Because you like Electronic': {
                id: 'electronic-similar', reason: 'Based on your listening history',
                tracks: [
                    { id: 501, title: "Ambient Journey", artist: "Space Echo", album: "Cosmic Waves", duration: "7:23", similarity: 94, plays: 234567, liked: false, image: "https://images.unsplash.com/photo-1520637836862-4d197d17c97a?w=200&h=200&fit=crop" },
                    { id: 502, title: "Synthetic Dreams", artist: "AI Collective", album: "Future Sound", duration: "5:16", similarity: 89, plays: 345678, liked: true, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop" }
                ]
            }
        };

        this.trendingData = [
            { id: 1, title: "Viral Sensation", artist: "TikTok Star", plays: 2341567, isLive: true, thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=169&fit=crop" },
            { id: 2, title: "Chart Topper", artist: "Pop Sensation", plays: 1876432, isLive: false, thumbnail: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=169&fit=crop" },
            { id: 3, title: "Rising Star", artist: "New Artist", plays: 987654, isLive: true, thumbnail: "https://images.unsplash.com/photo-1520637836862-4d197d17c97a?w=300&h=169&fit=crop" }
        ];

        this.initializeMusicLibrary();
    }

    initializeMusicLibrary() {
        console.log('ConnectHub Music Library initialized');
        this.addStyles();
        this.bindGlobalEvents();
        this.startGlobalEffects();
    }

    addStyles() {
        if (!document.getElementById('music-library-styles')) {
            const style = document.createElement('style');
            style.id = 'music-library-styles';
            style.textContent = `
                /* ConnectHub Music Library - Complete Styles */
                .music-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }

                .music-modal-overlay.show {
                    opacity: 1;
                    visibility: visible;
                }

                .music-interface-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #7c3aed 0%, #1e40af 50%, #059669 100%);
                    padding: 2rem;
                    width: 100%;
                    overflow-y: auto;
                }
                
                .music-nav-container {
                    max-width: 1200px;
                    margin: 0 auto 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1.5rem;
                }
                
                .music-nav-tab {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    padding: 12px 24px;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .music-nav-tab:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }
                
                .music-nav-tab.active {
                    background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
                    box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
                }
                
                .music-close-btn {
                    margin-left: auto;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .music-close-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.1);
                }
                
                .music-modal {
                    background: #111827;
                    border-radius: 16px;
                    width: 95%;
                    max-width: 1200px;
                    height: 85vh;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                }
                
                .music-header {
                    height: 80px;
                    background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .music-header.dashboard {
                    background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
                }
                
                .music-header.discovery {
                    background: linear-gradient(135deg, #059669 0%, #1e40af 100%);
                }
                
                .music-header h1 {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0;
                    color: white;
                }
                
                .header-controls {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                
                .music-content {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }
                
                .music-sidebar {
                    width: 280px;
                    background: rgba(0, 0, 0, 0.3);
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 24px;
                    overflow-y: auto;
                }
                
                .sidebar-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 8px;
                }
                
                .sidebar-item:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
                
                .sidebar-item.active {
                    background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
                    color: white;
                }
                
                .main-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                .content-body {
                    flex: 1;
                    padding: 24px;
                    overflow-y: auto;
                    padding-bottom: 120px;
                }
                
                .music-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 24px;
                }
                
                .music-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 16px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                .music-card:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateY(-4px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                    border-color: rgba(255, 255, 255, 0.15);
                }
                
                .album-art {
                    width: 100%;
                    aspect-ratio: 1;
                    border-radius: 12px;
                    margin-bottom: 16px;
                    position: relative;
                    overflow: hidden;
                    background: #374151;
                }
                
                .album-art img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .play-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(4px);
                }
                
                .music-card:hover .play-overlay {
                    opacity: 1;
                }
                
                .play-btn {
                    background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
                    border: none;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    color: white;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
                }
                
                .play-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
                }
                
                .track-title {
                    font-weight: 600;
                    font-size: 16px;
                    color: white;
                    margin-bottom: 4px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .track-artist {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 14px;
                    margin-bottom: 12px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .track-stats {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                }
                
                .track-plays {
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .track-duration {
                    color: rgba(255, 255, 255, 0.5);
                }
                
                /* Live indicator */
                .live-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .live-dot {
                    width: 12px;
                    height: 12px;
                    background: #ef4444;
                    border-radius: 50%;
                    animation: pulse 1.5s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                /* Discovery tabs */
                .discovery-tabs {
                    display: flex;
                    gap: 5px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 6px;
                    margin-bottom: 25px;
                }
                
                .discovery-tab {
                    padding: 10px 20px;
                    border: none;
                    background: none;
                    color: rgba(255, 255, 255, 0.7);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-weight: 500;
                }
                
                .discovery-tab.active {
                    background: linear-gradient(135deg, #059669 0%, #1e40af 100%);
                    color: white;
                }
                
                /* Genre cards */
                .genre-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 15px;
                }
                
                .genre-card {
                    background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
                    border-radius: 15px;
                    padding: 25px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .genre-card:hover {
                    transform: translateY(-5px) scale(1.05);
                }
            `;
            document.head.appendChild(style);
        }
    }

    bindGlobalEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    startGlobalEffects() {
        // Simulate progress bar movement when playing
        setInterval(() => {
            if (this.isPlaying && this.currentTrack) {
                this.globalProgress += 0.5;
                if (this.globalProgress >= 100) {
                    this.globalProgress = 0;
                }
                this.updateMiniPlayer();
            }
        }, 200);

        // Simulate real-time updates for live metrics
        setInterval(() => {
            this.liveMetrics.activeListeners += Math.floor(Math.random() * 20) - 10;
            if (this.liveMetrics.activeListeners < 0) this.liveMetrics.activeListeners = 0;
            
            this.liveMetrics.recentActivity.push({
                id: Date.now(),
                text: this.getRandomActivity(),
                time: new Date().toLocaleTimeString()
            });
            
            if (this.liveMetrics.recentActivity.length > 10) {
                this.liveMetrics.recentActivity = this.liveMetrics.recentActivity.slice(-10);
            }
        }, 5000);
    }

    getRandomActivity() {
        const activities = [
            "New user joined session #42",
            "Track 'Midnight Dreams' started playing",
            "Session #38 ended after 45 minutes",
            "User liked 'Electric Pulse'",
            "New session started in Electronic genre",
            "Trending track shared 847 times",
            "Artist 'Luna Vista' gained 200 new followers"
        ];
        return activities[Math.floor(Math.random() * activities.length)];
    }

    // Main interface method - Fixed to use proper modal overlay
    showMusicLibrary() {
        // Remove any existing music modals
        const existingModal = document.getElementById('music-library-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'music-modal-overlay';
        modal.id = 'music-library-modal';
        modal.innerHTML = `
            <div class="music-interface-container">
                <div class="music-nav-container">
                    <button class="music-nav-tab ${this.activeInterface === 'library' ? 'active' : ''}" onclick="musicLibraryUI.switchInterface('library')">
                        🎵 Music Library
                    </button>
                    <button class="music-nav-tab ${this.activeInterface === 'dashboard' ? 'active' : ''}" onclick="musicLibraryUI.switchInterface('dashboard')">
                        📊 Live Dashboard
                    </button>
                    <button class="music-nav-tab ${this.activeInterface === 'discovery' ? 'active' : ''}" onclick="musicLibraryUI.switchInterface('discovery')">
                        🌟 Music Discovery
                    </button>
                    <button class="music-close-btn" onclick="musicLibraryUI.closeModal()">×</button>
                </div>
                
                <div id="interface-content">
                    ${this.renderActiveInterface()}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Show the modal with animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        this.setupEventListeners();
    }

    switchInterface(interfaceName) {
        this.activeInterface = interfaceName;
        const contentEl = document.getElementById('interface-content');
        if (contentEl) {
            contentEl.innerHTML = this.renderActiveInterface();
        }
        
        // Update nav tabs
        document.querySelectorAll('.music-nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[onclick="musicLibraryUI.switchInterface('${interfaceName}')"]`)?.classList.add('active');
        
        this.setupEventListeners();
    }

    renderActiveInterface() {
        switch(this.activeInterface) {
            case 'library':
                return this.renderMusicLibraryInterface();
            case 'dashboard':
                return this.renderLiveSessionsDashboard();
            case 'discovery':
                return this.renderMusicDiscoveryInterface();
            default:
                return this.renderMusicLibraryInterface();
        }
    }

    renderMusicLibraryInterface() {
        const filteredTracks = this.getFilteredTracks();
        
        return `
            <div class="music-modal">
                <div class="music-header">
                    <h1>Music Library</h1>
                    <div class="header-controls">
                        <input type="text" placeholder="Search tracks, artists..." class="music-search-input" id="music-search" value="${this.searchQuery}">
                        <div class="view-toggle">
                            <button class="view-btn ${this.viewMode === 'grid' ? 'active' : ''}" onclick="musicLibraryUI.setViewMode('grid')">⊞</button>
                            <button class="view-btn ${this.viewMode === 'list' ? 'active' : ''}" onclick="musicLibraryUI.setViewMode('list')">☰</button>
                        </div>
                    </div>
                </div>
                <div class="music-content">
                    <div class="music-sidebar">
                        <div class="sidebar-item ${this.activeFilter === 'all' ? 'active' : ''}" onclick="musicLibraryUI.setFilter('all')">
                            🎵 All Music
                        </div>
                        <div class="sidebar-item ${this.activeFilter === 'liked' ? 'active' : ''}" onclick="musicLibraryUI.setFilter('liked')">
                            ❤️ Liked Songs
                        </div>
                        <div class="sidebar-item ${this.activeFilter === 'recent' ? 'active' : ''}" onclick="musicLibraryUI.setFilter('recent')">
                            🕐 Recently Added
                        </div>
                    </div>
                    <div class="main-content">
                        <div class="content-body">
                            ${this.renderMusicContent(filteredTracks)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLiveSessionsDashboard() {
        return `
            <div class="music-modal">
                <div class="music-header dashboard">
                    <div>
                        <h1>Live Sessions Dashboard</h1>
                        <div class="live-indicator">
                            <div class="live-dot"></div>
                            <span style="color: #10b981; font-size: 14px; font-weight: 600;">LIVE</span>
                        </div>
                    </div>
                    <div style="text-align: right; color: rgba(255,255,255,0.8); font-size: 14px;">
                        Last updated: ${new Date().toLocaleTimeString()}
                    </div>
                </div>
                <div class="content-body">
                    <div class="metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px;">
                        <div class="metric-card" style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 25px; border: 1px solid rgba(255,255,255,0.1);">
                            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">👥 Active Listeners</h3>
                            <div style="font-size: 32px; font-weight: 700; color: #3b82f6; margin: 8px 0;">${this.liveMetrics.activeListeners.toLocaleString()}</div>
                            <div style="color: #10b981; font-size: 14px;">📈 +12% from last hour</div>
                        </div>
                        
                        <div class="metric-card" style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 25px; border: 1px solid rgba(255,255,255,0.1);">
                            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">📻 Active Sessions</h3>
                            <div style="font-size: 32px; font-weight: 700; color: #7c3aed; margin: 8px 0;">${this.liveMetrics.totalSessions}</div>
                            <div style="color: #10b981; font-size: 14px;">📈 +8% from yesterday</div>
                        </div>
                        
                        <div class="metric-card" style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 25px; border: 1px solid rgba(255,255,255,0.1);">
                            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">🕐 Avg Session Time</h3>
                            <div style="font-size: 32px; font-weight: 700; color: #059669; margin: 8px 0;">${this.liveMetrics.avgSessionTime}</div>
                            <div style="color: #10b981; font-size: 14px;">📈 +2m 15s from last week</div>
                        </div>
                    </div>

                    <div style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 25px; border: 1px solid rgba(255,255,255,0.1);">
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">Real-time Activity</h3>
                        <div style="max-height: 200px; overflow-y: auto;">
                            ${this.liveMetrics.recentActivity.slice(-5).map(activity => `
                                <div style="display: flex; align-items: center; gap: 10px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <div class="live-dot" style="width: 8px; height: 8px;"></div>
                                    <span style="color: rgba(255,255,255,0.8); font-size: 14px;">${activity.text}</span>
                                    <span style="color: rgba(255,255,255,0.5); font-size: 12px; margin-left: auto;">${activity.time}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderMusicDiscoveryInterface() {
        return `
            <div class="music-modal">
                <div class="music-header discovery">
                    <h1>Music Discovery</h1>
                    <div class="discovery-tabs">
                        <button class="discovery-tab ${this.activeTab === 'trending' ? 'active' : ''}" onclick="musicLibraryUI.setDiscoveryTab('trending')">Trending</button>
                        <button class="discovery-tab ${this.activeTab === 'recommended' ? 'active' : ''}" onclick="musicLibraryUI.setDiscoveryTab('recommended')">Recommended</button>
                        <button class="discovery-tab ${this.activeTab === 'genres' ? 'active' : ''}" onclick="musicLibraryUI.setDiscoveryTab('genres')">Genres</button>
                    </div>
                </div>
                <div class="content-body">
                    ${this.renderDiscoveryContent()}
                </div>
            </div>
        `;
    }

    renderDiscoveryContent() {
        // Check if we're in genre detail view
        if (this.currentView === 'genreDetail' && this.selectedGenre) {
            return this.renderGenreDetailView();
        }
        
        switch(this.activeTab) {
            case 'trending':
                return `
                    <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 25px;">🔥 Trending Now</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 25px;">
                        ${this.trendingData.map((item, index) => `
                            <div class="music-card" onclick="musicLibraryUI.playTrack(${item.id})">
                                <div class="album-art">
                                    <img src="${item.thumbnail}" alt="${item.title}">
                                    <div class="play-overlay">
                                        <button class="play-btn">▶️</button>
                                    </div>
                                    ${item.isLive ? '<div style="position: absolute; top: 15px; left: 15px; background: #ef4444; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;"><div class="live-dot" style="width: 8px; height: 8px; display: inline-block; margin-right: 4px;"></div>LIVE</div>' : ''}
                                    <div style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">#${index + 1}</div>
                                </div>
                                <div class="track-title">${item.title}</div>
                                <div class="track-artist">${item.artist}</div>
                                <div class="track-stats">
                                    <span class="track-plays">${item.plays.toLocaleString()} plays</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            case 'recommended':
                return `
                    <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 25px;">🎯 Recommended for You</h2>
                    ${Object.entries(this.recommendationCategories).map(([categoryName, category]) => `
                        <div style="margin-bottom: 40px;">
                            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">${categoryName}</h3>
                            <p style="color: rgba(255,255,255,0.7); margin-bottom: 20px;">${category.reason}</p>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                                ${category.tracks.map(track => `
                                    <div class="music-card" onclick="musicLibraryUI.playTrack(${track.id})">
                                        <div class="album-art">
                                            <img src="${track.image}" alt="${track.title}">
                                            <div class="play-overlay">
                                                <button class="play-btn">▶️</button>
                                            </div>
                                            <div style="position: absolute; top: 15px; right: 15px; background: linear-gradient(135deg, #059669 0%, #1e40af 100%); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">${track.similarity}% Match</div>
                                        </div>
                                        <div class="track-title">${track.title}</div>
                                        <div class="track-artist">${track.artist}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                `;
            case 'genres':
                return `
                    <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 25px;">🎨 Explore Genres</h2>
                    <div class="genre-grid">
                        ${Object.values(this.genreData).map(genre => `
                            <div class="genre-card" onclick="musicLibraryUI.exploreGenre('${genre.name}')">
                                <div style="font-size: 32px; margin-bottom: 12px;">🎵</div>
                                <h3 style="font-size: 16px; font-weight: 600; color: white; margin: 0 0 8px 0;">${genre.name}</h3>
                                <p style="font-size: 14px; color: rgba(255,255,255,0.8); margin: 0;">${genre.description}</p>
                            </div>
                        `).join('')}
                    </div>
                `;
        }
    }

    renderMusicContent(tracks) {
        if (this.viewMode === 'grid') {
            return `
                <div class="music-grid">
                    ${tracks.map(track => `
                        <div class="music-card" onclick="musicLibraryUI.playTrack(${track.id})">
                            <div class="album-art">
                                <img src="${track.image}" alt="${track.title}">
                                <div class="play-overlay">
                                    <button class="play-btn">▶️</button>
                                </div>
                                ${track.liked ? '<div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); border-radius: 50%; padding: 4px; color: #ef4444; font-size: 14px;">❤️</div>' : ''}
                            </div>
                            <div class="track-title">${track.title}</div>
                            <div class="track-artist">${track.artist}</div>
                            <div class="track-stats">
                                <span class="track-plays">${track.plays.toLocaleString()} plays</span>
                                <span class="track-duration">${track.duration}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            return `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${tracks.map((track, index) => `
                        <div style="display: flex; align-items: center; gap: 16px; padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 12px; cursor: pointer; border: 1px solid rgba(255,255,255,0.05);" onclick="musicLibraryUI.playTrack(${track.id})">
                            <span style="width: 24px; text-align: center; color: rgba(255,255,255,0.5); font-size: 14px;">${index + 1}</span>
                            <button class="play-btn" style="width: 32px; height: 32px; font-size: 12px;">▶️</button>
                            <img src="${track.image}" alt="${track.title}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;">
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: 500; color: white; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${track.title}</div>
                                <div style="color: rgba(255,255,255,0.7); font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${track.artist} • ${track.album}</div>
                            </div>
                            <span style="color: rgba(255,255,255,0.5); font-size: 14px; min-width: 80px; text-align: center;">${track.genre}</span>
                            <span style="color: rgba(255,255,255,0.5); font-size: 14px; min-width: 80px; text-align: right;">${track.plays.toLocaleString()}</span>
                            <span style="color: rgba(255,255,255,0.5); font-size: 14px; font-family: 'Courier New', monospace; min-width: 50px; text-align: right;">${track.duration}</span>
                            <button style="background: none; border: none; color: ${track.liked ? '#ef4444' : 'rgba(255,255,255,0.5)'}; cursor: pointer; padding: 4px; font-size: 16px;" onclick="event.stopPropagation(); musicLibraryUI.toggleLike(${track.id})">
                                ${track.liked ? '❤️' : '🤍'}
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    getFilteredTracks() {
        return this.musicLibraryTracks.filter(track => {
            const matchesSearch = !this.searchQuery || 
                track.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                track.artist.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                track.album.toLowerCase().includes(this.searchQuery.toLowerCase());
            
            const matchesFilter = this.activeFilter === 'all' || 
                (this.activeFilter === 'liked' && track.liked) ||
                (this.activeFilter === 'recent' && new Date(track.dateAdded) > new Date('2024-01-10'));
            
            return matchesSearch && matchesFilter;
        });
    }

    // Event handlers
    setViewMode(mode) {
        this.viewMode = mode;
        this.switchInterface(this.activeInterface);
    }

    setFilter(filter) {
        this.activeFilter = filter;
        this.switchInterface(this.activeInterface);
    }

    setDiscoveryTab(tab) {
        this.activeTab = tab;
        this.switchInterface(this.activeInterface);
    }

    playTrack(trackId) {
        let track = this.musicLibraryTracks.find(t => t.id === trackId);
        if (!track) {
            track = this.trendingData.find(t => t.id === trackId);
        }
        if (!track) {
            Object.values(this.genreData).forEach(genre => {
                const found = genre.tracks.find(t => t.id === trackId);
                if (found) track = found;
            });
        }
        if (!track) {
            Object.values(this.recommendationCategories).forEach(category => {
                const found = category.tracks.find(t => t.id === trackId);
                if (found) track = found;
            });
        }

        if (track) {
            this.currentTrack = track;
            this.isPlaying = true;
            this.globalProgress = 0;
            this.showMiniPlayer();
            console.log('Playing:', track.title, 'by', track.artist);
        }
    }

    toggleLike(trackId) {
        const track = this.musicLibraryTracks.find(t => t.id === trackId);
        if (track) {
            track.liked = !track.liked;
            this.switchInterface(this.activeInterface); // Refresh the interface
        }
    }

    exploreGenre(genreName) {
        console.log('Exploring genre:', genreName);
        
        // Save current navigation state
        this.navigationStack.push({
            view: 'main',
            tab: 'genres',
            data: null
        });
        
        // Update state
        this.selectedGenre = this.genreData[genreName];
        this.currentView = 'genreDetail';
        this.genreSearchQuery = '';
        
        // Re-render interface
        this.switchInterface(this.activeInterface);
    }

    renderGenreDetailView() {
        const genre = this.selectedGenre;
        if (!genre) return '<div>Genre not found</div>';

        // Filter tracks based on search query
        const filteredTracks = genre.tracks.filter(track => 
            !this.genreSearchQuery || 
            track.title.toLowerCase().includes(this.genreSearchQuery.toLowerCase()) ||
            track.artist.toLowerCase().includes(this.genreSearchQuery.toLowerCase()) ||
            track.album.toLowerCase().includes(this.genreSearchQuery.toLowerCase())
        );

        return `
            <!-- Navigation Breadcrumbs -->
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <button onclick="musicLibraryUI.navigateBack()" style="background: rgba(255,255,255,0.1); border: none; border-radius: 8px; color: white; padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease;">
                    <span style="font-size: 16px;">←</span>
                    <span style="font-weight: 500;">Back</span>
                </button>
                <span style="color: rgba(255,255,255,0.5); font-size: 14px;">/</span>
                <span style="color: white; font-weight: 600; font-size: 16px;">${genre.name}</span>
            </div>

            <!-- Genre Hero Section -->
            <div style="background: ${genre.gradient}; border-radius: 20px; padding: 40px; margin-bottom: 32px; position: relative; overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 32px;">
                    <!-- Genre Icon -->
                    <div style="width: 128px; height: 128px; background: rgba(255,255,255,0.2); border-radius: 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                        <div style="font-size: 64px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">🎵</div>
                    </div>
                    
                    <!-- Genre Info -->
                    <div style="flex: 1;">
                        <h1 style="font-size: 48px; font-weight: 700; color: white; margin: 0 0 12px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${genre.name}</h1>
                        <p style="font-size: 18px; color: rgba(255,255,255,0.9); margin: 0 0 16px 0; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${genre.description}</p>
                        <div style="font-size: 14px; color: rgba(255,255,255,0.8); display: flex; gap: 16px;">
                            <span>${genre.totalTracks.toLocaleString()} tracks</span>
                            <span>•</span>
                            <span>${genre.totalListeners.toLocaleString()} listeners</span>
                        </div>
                    </div>
                </div>
                
                <!-- Decorative Background -->
                <div style="position: absolute; top: -20px; right: -20px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(40px); pointer-events: none;"></div>
                <div style="position: absolute; bottom: -30px; left: -30px; width: 150px; height: 150px; background: rgba(255,255,255,0.05); border-radius: 50%; filter: blur(30px); pointer-events: none;"></div>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 16px; margin-bottom: 40px;">
                <button onclick="musicLibraryUI.playAllTracks('${genre.name}')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; border-radius: 12px; color: white; padding: 12px 24px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: all 0.2s ease;">
                    <span style="font-size: 16px;">▶️</span>
                    Play All
                </button>
                <button onclick="musicLibraryUI.shuffleTracks('${genre.name}')" style="background: rgba(255,255,255,0.1); border: none; border-radius: 12px; color: white; padding: 12px 24px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease;">
                    <span style="font-size: 16px;">🔀</span>
                    Shuffle
                </button>
                <button onclick="musicLibraryUI.followGenre('${genre.name}')" style="background: rgba(255,255,255,0.1); border: none; border-radius: 12px; color: white; padding: 12px 24px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease;">
                    <span style="font-size: 16px;">❤️</span>
                    Follow Genre
                </button>
            </div>

            <!-- Popular Artists Section -->
            <div style="margin-bottom: 40px;">
                <h2 style="font-size: 20px; font-weight: 600; color: white; margin-bottom: 20px;">Popular Artists</h2>
                <div style="display: flex; gap: 12px; overflow-x: auto; padding: 4px;">
                    ${genre.artists.map((artist, index) => `
                        <div style="background: rgba(107, 114, 128, 1); hover:background: rgba(75, 85, 99, 1); border-radius: 12px; padding: 12px 20px; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; min-width: fit-content;">
                            <div style="color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 600; margin-bottom: 2px;">#${index + 1}</div>
                            <div style="color: white; font-weight: 500; font-size: 14px;">${artist}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Popular Tracks Section -->
            <div>
                <h2 style="font-size: 20px; font-weight: 600; color: white; margin-bottom: 20px;">Popular Tracks</h2>
                
                <!-- Search Bar -->
                <div style="margin-bottom: 24px;">
                    <input 
                        type="text" 
                        placeholder="Search in genre..." 
                        value="${this.genreSearchQuery}"
                        id="genre-search-input"
                        style="background: rgba(107, 114, 128, 1); border: none; border-radius: 12px; color: white; padding: 12px 16px 12px 44px; width: 100%; max-width: 400px; font-size: 14px;"
                    />
                    <div style="position: relative; top: -36px; left: 16px; color: rgba(255,255,255,0.5); pointer-events: none;">
                        <span style="font-size: 16px;">🔍</span>
                    </div>
                </div>

                <!-- Tracks List -->
                <div style="background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                    <!-- Header -->
                    <div style="display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7);">
                        <span style="width: 24px; text-align: center;">#</span>
                        <span style="width: 32px;"></span>
                        <span style="width: 56px;"></span>
                        <span style="flex: 1;">Title</span>
                        <span style="width: 100px; text-align: right;">Plays</span>
                        <span style="width: 60px; text-align: right; font-family: 'Courier New', monospace;">Time</span>
                        <span style="width: 40px;"></span>
                        <span style="width: 24px;"></span>
                    </div>
                    
                    <!-- Track Rows -->
                    ${filteredTracks.map((track, index) => `
                        <div onclick="musicLibraryUI.playTrack(${track.id})" style="display: flex; align-items: center; gap: 16px; padding: 12px 20px; cursor: pointer; transition: all 0.2s ease; border-bottom: 1px solid rgba(255,255,255,0.05); group;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
                            <!-- Index -->
                            <span style="width: 24px; text-align: center; color: rgba(255,255,255,0.5); font-size: 14px;">${index + 1}</span>
                            
                            <!-- Play Button -->
                            <button class="play-btn" style="width: 32px; height: 32px; font-size: 12px; opacity: 0; transition: opacity 0.2s ease;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">▶️</button>
                            
                            <!-- Album Art -->
                            <img src="${track.image}" alt="${track.title}" style="width: 56px; height: 56px; border-radius: 8px; object-fit: cover;">
                            
                            <!-- Track Info -->
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: 500; color: white; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${track.title}</div>
                                <div style="color: rgba(255,255,255,0.7); font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${track.artist} • ${track.album}</div>
                            </div>
                            
                            <!-- Play Count -->
                            <span style="width: 100px; text-align: right; color: rgba(255,255,255,0.5); font-size: 14px;">${track.plays.toLocaleString()}</span>
                            
                            <!-- Duration -->
                            <span style="width: 60px; text-align: right; color: rgba(255,255,255,0.5); font-size: 14px; font-family: 'Courier New', monospace;">${track.duration}</span>
                            
                            <!-- Like Button -->
                            <button onclick="event.stopPropagation(); musicLibraryUI.toggleGenreTrackLike(${track.id})" style="width: 40px; height: 40px; background: none; border: none; color: ${track.liked ? '#ef4444' : 'rgba(255,255,255,0.5)'}; cursor: pointer; font-size: 16px; border-radius: 50%; transition: all 0.2s ease;">
                                ${track.liked ? '❤️' : '🤍'}
                            </button>
                            
                            <!-- More Options -->
                            <button style="width: 24px; height: 24px; background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 16px; opacity: 0; transition: opacity 0.2s ease;" onmouseover="this.style.opacity='1'; this.parentElement.style.opacity='1'" onmouseout="this.style.opacity='0'">
                                <span style="transform: rotate(90deg); display: inline-block;">⋯</span>
                            </button>
                        </div>
                    `).join('')}
                    
                    ${filteredTracks.length === 0 ? `
                        <div style="padding: 40px 20px; text-align: center; color: rgba(255,255,255,0.5);">
                            <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                            <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">No tracks found</div>
                            <div style="font-size: 14px;">Try adjusting your search terms</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    navigateBack() {
        const previous = this.navigationStack.pop();
        if (previous) {
            this.currentView = previous.view;
            this.activeTab = previous.tab;
            this.selectedGenre = previous.data?.genre || null;
        } else {
            this.currentView = 'main';
            this.activeTab = 'genres';
            this.selectedGenre = null;
        }
        this.switchInterface(this.activeInterface);
    }

    playAllTracks(genreName) {
        const genre = this.genreData[genreName];
        if (genre && genre.tracks.length > 0) {
            this.playTrack(genre.tracks[0].id);
            console.log(`Playing all tracks from ${genreName} genre`);
        }
    }

    shuffleTracks(genreName) {
        const genre = this.genreData[genreName];
        if (genre && genre.tracks.length > 0) {
            const randomIndex = Math.floor(Math.random() * genre.tracks.length);
            this.playTrack(genre.tracks[randomIndex].id);
            console.log(`Shuffling tracks from ${genreName} genre`);
        }
    }

    followGenre(genreName) {
        console.log(`Following ${genreName} genre`);
        // Add follow logic here
    }

    toggleGenreTrackLike(trackId) {
        // Find track in current genre and toggle like
        if (this.selectedGenre) {
            const track = this.selectedGenre.tracks.find(t => t.id === trackId);
            if (track) {
                track.liked = !track.liked;
                this.switchInterface(this.activeInterface); // Refresh the interface
            }
        }
    }

    showMiniPlayer() {
        let player = document.getElementById('music-mini-player');
        
        if (!player) {
            player = document.createElement('div');
            player.id = 'music-mini-player';
            player.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                height: 80px;
                background: #1f2937;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                padding: 0 24px;
                z-index: 10001;
                backdrop-filter: blur(20px);
                color: white;
            `;
            
            document.body.appendChild(player);
        }
        
        player.innerHTML = `
            <div style="display: flex; align-items: center; gap: 16px; min-width: 320px;">
                <img src="${this.currentTrack.image}" alt="${this.currentTrack.title}" style="width: 56px; height: 56px; border-radius: 8px; object-fit: cover;">
                <div>
                    <div style="font-weight: 600; margin-bottom: 2px;">${this.currentTrack.title}</div>
                    <div style="font-size: 13px; color: rgba(255,255,255,0.7);">${this.currentTrack.artist}</div>
                </div>
            </div>
            
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <button onclick="musicLibraryUI.togglePlay()" style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); border: none; width: 40px; height: 40px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        ${this.isPlaying ? '⏸️' : '▶️'}
                    </button>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; width: 100%; max-width: 400px;">
                    <span style="font-size: 12px; color: rgba(255,255,255,0.5); min-width: 35px;">${this.formatTime((this.globalProgress / 100) * 180)}</span>
                    <div style="flex: 1; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden;">
                        <div style="width: ${this.globalProgress}%; height: 100%; background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); border-radius: 2px; transition: width 0.2s ease;"></div>
                    </div>
                    <span style="font-size: 12px; color: rgba(255,255,255,0.5); min-width: 35px;">${this.currentTrack.duration}</span>
                </div>
            </div>
            
            <button onclick="musicLibraryUI.closeMiniPlayer()" style="background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; font-size: 20px; padding: 8px;">×</button>
        `;
    }

    updateMiniPlayer() {
        const player = document.getElementById('music-mini-player');
        if (player && this.currentTrack) {
            const progressBar = player.querySelector('div[style*="width: ' + (this.globalProgress - 0.5) + '%"]');
            if (progressBar) {
                progressBar.style.width = `${this.globalProgress}%`;
            }
        }
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        this.showMiniPlayer(); // Refresh the player UI
    }

    closeMiniPlayer() {
        const player = document.getElementById('music-mini-player');
        if (player) {
            player.remove();
        }
        this.currentTrack = null;
        this.isPlaying = false;
        this.globalProgress = 0;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    setupEventListeners() {
        const searchInput = document.getElementById('music-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.switchInterface(this.activeInterface);
            });
        }

        const genreSearchInput = document.getElementById('genre-search-input');
        if (genreSearchInput) {
            genreSearchInput.addEventListener('input', (e) => {
                this.genreSearchQuery = e.target.value;
                this.switchInterface(this.activeInterface);
            });
        }
    }

    closeModal() {
        const modal = document.getElementById('music-library-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
}

// Initialize and make globally accessible
const musicLibraryUI = new MusicLibraryUI();
window.musicLibraryUI = musicLibraryUI;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusicLibraryUI;
}
