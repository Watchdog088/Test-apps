/**
 * Enhanced Music Library Interface - ConnectHub Music System
 * Provides: Music Library, Live Sessions Dashboard, Discovery Interface, Comprehensive Player
 */

class MusicLibraryUI {
    constructor() {
        this.currentTrack = null;
        this.isPlaying = false;
        this.viewMode = 'grid';
        this.activeInterface = 'library';
        this.activeTab = 'trending';
        this.liveMetrics = {
            activeListeners: 12847,
            totalSessions: 156,
            avgSessionTime: "24m 32s",
            topGenres: ["Electronic", "Pop", "Rock", "Hip-Hop"]
        };
        this.tracks = [
            { id: 1, title: "Midnight Dreams", artist: "Luna Vista", album: "Nocturnal", duration: "3:42", plays: 125420, liked: true, image: "🎵" },
            { id: 2, title: "Electric Pulse", artist: "Neon Collective", album: "Digital Soul", duration: "4:18", plays: 89301, liked: false, image: "🎶" },
            { id: 3, title: "Ocean Waves", artist: "Coastal Sounds", album: "Tidal Rhythms", duration: "5:02", plays: 203845, liked: true, image: "🌊" },
            { id: 4, title: "Urban Symphony", artist: "City Lights", album: "Metropolitan", duration: "3:55", plays: 156789, liked: false, image: "🏙️" },
            { id: 5, title: "Digital Dreams", artist: "ElectroWave", album: "Future Sounds", duration: "4:05", plays: 98765, liked: true, image: "💫" }
        ];
        this.discoveryData = {
            trending: [
                { id: 1, title: "Synthetic Dreams", artist: "AI Collective", plays: 892341, isLive: true, thumbnail: "🤖" },
                { id: 2, title: "Quantum Beat", artist: "Future Bass", plays: 567123, isLive: false, thumbnail: "⚡" }
            ],
            recommended: [
                { id: 3, title: "Ambient Journey", artist: "Space Echo", similarity: 89, thumbnail: "🌌" }
            ]
        };
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
                    background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center;
                    z-index: 10000; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
                .music-modal-overlay.show { opacity: 1; visibility: visible; }
                .music-modal { background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); 
                    border-radius: 20px; width: 95%; max-width: 1200px; height: 85vh; overflow: hidden; 
                    transform: scale(0.9); transition: transform 0.3s ease; 
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5); color: white; border: 1px solid rgba(255,255,255,0.1); }
                .music-modal-overlay.show .music-modal { transform: scale(1); }
                
                /* Header Styles */
                .music-modal-header { height: 80px; padding: 0 30px; display: flex; align-items: center; 
                    justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); }
                .music-modal-header.library { background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); }
                .music-modal-header.dashboard { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); }
                .music-modal-header.discovery { background: linear-gradient(135deg, #059669 0%, #1e40af 100%); }
                
                .music-close-btn { background: none; border: none; color: white; font-size: 24px; 
                    cursor: pointer; padding: 8px; border-radius: 50%; transition: all 0.2s ease; }
                .music-close-btn:hover { background: rgba(255,255,255,0.2); }
                
                /* Navigation */
                .music-nav { display: flex; gap: 20px; margin-bottom: 20px; }
                .nav-tab { padding: 12px 24px; border-radius: 12px; background: rgba(255,255,255,0.1); 
                    color: white; border: none; cursor: pointer; font-weight: 600; transition: all 0.2s ease; }
                .nav-tab.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                .nav-tab:hover:not(.active) { background: rgba(255,255,255,0.2); }
                
                /* Content Layout */
                .music-modal-content { height: calc(85vh - 80px); display: flex; }
                .music-sidebar { width: 280px; background: rgba(0,0,0,0.3); padding: 20px; overflow-y: auto; }
                .sidebar-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; 
                    border-radius: 12px; cursor: pointer; transition: all 0.2s ease; margin-bottom: 4px; }
                .sidebar-item:hover { background: rgba(255,255,255,0.1); }
                .sidebar-item.active { background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); }
                
                .music-content { flex: 1; display: flex; flex-direction: column; }
                .content-header { padding: 25px 30px; border-bottom: 1px solid rgba(255,255,255,0.1); 
                    display: flex; align-items: center; justify-content: space-between; }
                .content-body { flex: 1; padding: 30px; overflow-y: auto; }
                
                /* Controls */
                .content-controls { display: flex; align-items: center; gap: 15px; flex-wrap: wrap; margin-bottom: 25px; }
                .search-input { width: 300px; padding: 12px 20px; background: rgba(255,255,255,0.1); 
                    border: 1px solid rgba(255,255,255,0.2); border-radius: 25px; color: white; 
                    font-size: 14px; transition: all 0.2s ease; }
                .search-input:focus { border-color: #7c3aed; background: rgba(255,255,255,0.15); outline: none; }
                .search-input::placeholder { color: rgba(255,255,255,0.5); }
                
                .view-toggle { display: flex; gap: 5px; background: rgba(255,255,255,0.1); border-radius: 8px; padding: 4px; }
                .view-btn { padding: 8px 12px; border: none; background: none; color: rgba(255,255,255,0.7); 
                    border-radius: 6px; cursor: pointer; transition: all 0.2s ease; }
                .view-btn.active { background: rgba(255,255,255,0.2); color: white; }
                
                .create-btn { background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); 
                    color: white; padding: 10px 20px; border: none; border-radius: 20px; cursor: pointer; 
                    font-weight: 600; transition: all 0.2s ease; }
                .create-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(124,58,237,0.3); }
                
                /* Grid View */
                .music-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
                .music-card { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; 
                    transition: all 0.3s ease; cursor: pointer; border: 1px solid rgba(255,255,255,0.05); }
                .music-card:hover { background: rgba(255,255,255,0.1); transform: translateY(-5px); 
                    box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
                
                .album-art { width: 100%; aspect-ratio: 1; background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); 
                    border-radius: 12px; display: flex; align-items: center; justify-content: center; 
                    font-size: 48px; margin-bottom: 15px; position: relative; overflow: hidden; }
                .play-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); 
                    display: flex; align-items: center; justify-content: center; opacity: 0; 
                    transition: all 0.3s ease; backdrop-filter: blur(4px); }
                .music-card:hover .play-overlay { opacity: 1; }
                .play-btn { background: white; color: black; border: none; width: 56px; height: 56px; 
                    border-radius: 50%; font-size: 20px; cursor: pointer; transition: all 0.2s ease; 
                    display: flex; align-items: center; justify-content: center; }
                .play-btn:hover { transform: scale(1.1); }
                
                .track-title { font-weight: 700; font-size: 16px; margin-bottom: 6px; overflow: hidden; 
                    text-overflow: ellipsis; white-space: nowrap; }
                .track-artist { font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 8px; }
                .track-stats { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
                .track-duration { font-size: 12px; color: rgba(255,255,255,0.5); }
                .track-plays { font-size: 12px; color: rgba(255,255,255,0.6); }
                
                /* List View */
                .music-list { display: flex; flex-direction: column; gap: 8px; }
                .music-list-item { display: flex; align-items: center; gap: 15px; padding: 15px 20px; 
                    background: rgba(255,255,255,0.03); border-radius: 12px; transition: all 0.2s ease; 
                    cursor: pointer; border: 1px solid rgba(255,255,255,0.05); }
                .music-list-item:hover { background: rgba(255,255,255,0.08); }
                .list-album-art { width: 56px; height: 56px; border-radius: 8px; 
                    background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); 
                    display: flex; align-items: center; justify-content: center; font-size: 20px; }
                .track-info { flex: 1; min-width: 0; }
                
                /* Player Bar */
                .music-player-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 100px; 
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); 
                    border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; 
                    padding: 0 30px; z-index: 10001; transform: translateY(100%); transition: all 0.3s ease; 
                    backdrop-filter: blur(20px); }
                .music-player-bar.show { transform: translateY(0); }
                
                .player-track-info { display: flex; align-items: center; gap: 15px; min-width: 320px; }
                .player-art { width: 70px; height: 70px; border-radius: 10px; 
                    background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); 
                    display: flex; align-items: center; justify-content: center; font-size: 24px; }
                
                .player-controls { flex: 1; display: flex; align-items: center; justify-content: center; gap: 25px; }
                .player-btn { background: none; border: none; color: white; font-size: 20px; 
                    cursor: pointer; padding: 10px; border-radius: 50%; transition: all 0.2s ease; 
                    width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
                .player-btn:hover { background: rgba(255,255,255,0.1); }
                .player-btn.primary { background: white; color: black; width: 50px; height: 50px; font-size: 24px; }
                .player-btn.primary:hover { background: rgba(255,255,255,0.9); transform: scale(1.05); }
                
                /* Discovery specific styles */
                .discovery-tabs { display: flex; gap: 5px; background: rgba(255,255,255,0.1); 
                    border-radius: 12px; padding: 6px; margin-bottom: 25px; }
                .discovery-tab { padding: 10px 20px; border: none; background: none; color: rgba(255,255,255,0.7); 
                    border-radius: 8px; cursor: pointer; transition: all 0.2s ease; font-weight: 500; }
                .discovery-tab.active { background: linear-gradient(135deg, #059669 0%, #1e40af 100%); color: white; }
                
                .genre-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }
                .genre-card { background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); 
                    border-radius: 15px; padding: 25px; text-align: center; cursor: pointer; 
                    transition: all 0.3s ease; }
                .genre-card:hover { transform: translateY(-5px) scale(1.05); }
                
                /* Dashboard specific styles */
                .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .metric-card { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 25px; 
                    border: 1px solid rgba(255,255,255,0.1); }
                .metric-value { font-size: 32px; font-weight: 700; color: #3b82f6; margin: 8px 0; }
                .metric-trend { color: #10b981; font-size: 14px; display: flex; align-items: center; gap: 5px; }
                
                .charts-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                .chart-card { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 25px; 
                    border: 1px solid rgba(255,255,255,0.1); }
                .chart-placeholder { height: 200px; background: rgba(255,255,255,0.1); border-radius: 10px; 
                    display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.5); }
                
                .activity-feed { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 25px; 
                    border: 1px solid rgba(255,255,255,0.1); }
                .activity-item { display: flex; align-items: center; gap: 10px; padding: 12px 0; 
                    border-bottom: 1px solid rgba(255,255,255,0.05); }
                .activity-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; 
                    animation: pulse 2s infinite; }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                /* Live indicator */
                .live-indicator { display: flex; align-items: center; gap: 8px; }
                .live-dot { width: 12px; height: 12px; background: #ef4444; border-radius: 50%; animation: pulse 1.5s infinite; }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .music-modal { width: 100%; height: 100%; border-radius: 0; }
                    .music-modal-content { flex-direction: column; }
                    .music-sidebar { width: 100%; height: auto; }
                    .content-controls { flex-direction: column; align-items: stretch; }
                    .search-input { width: 100%; }
                    .music-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
                }
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
        modal.id = 'music-interfaces-modal';
        modal.innerHTML = `
            <div style="min-height: 100vh; background: linear-gradient(135deg, #7c3aed 0%, #1e40af 50%, #059669 100%); padding: 2rem;">
                <!-- Navigation -->
                <div style="max-width: 1200px; margin: 0 auto 2rem;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 1.5rem;">
                        <button class="nav-tab ${this.activeInterface === 'library' ? 'active' : ''}" onclick="musicLibraryUI.switchInterface('library')">
                            🎵 Music Library
                        </button>
                        <button class="nav-tab ${this.activeInterface === 'dashboard' ? 'active' : ''}" onclick="musicLibraryUI.switchInterface('dashboard')">
                            📊 Live Dashboard
                        </button>
                        <button class="nav-tab ${this.activeInterface === 'discovery' ? 'active' : ''}" onclick="musicLibraryUI.switchInterface('discovery')">
                            🌟 Music Discovery
                        </button>
                        <button class="music-close-btn" onclick="musicLibraryUI.closeModal('music-interfaces-modal')" style="margin-left: auto;">×</button>
                    </div>
                </div>
                
                <!-- Interface Content -->
                <div id="interface-content">
                    ${this.renderActiveInterface()}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        this.setupMusicInterfaceEvents();
        this.startLiveUpdates();
    }

    switchInterface(interfaceName) {
        this.activeInterface = interfaceName;
        const contentEl = document.getElementById('interface-content');
        if (contentEl) {
            contentEl.innerHTML = this.renderActiveInterface();
        }
        
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[onclick="musicLibraryUI.switchInterface('${interfaceName}')"]`).classList.add('active');
        
        if (interfaceName === 'library') {
            this.setupMusicLibraryEvents();
        } else if (interfaceName === 'discovery') {
            this.setupDiscoveryEvents();
        }
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
        return `
            <div class="music-modal" style="transform: none; opacity: 1;">
                <div class="music-modal-header library">
                    <h1 style="font-size: 24px; font-weight: 700; margin: 0;">Music Library</h1>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="position: relative;">
                            <input type="text" class="search-input" placeholder="Search tracks, artists..." id="music-search">
                        </div>
                        <div class="view-toggle">
                            <button class="view-btn ${this.viewMode === 'grid' ? 'active' : ''}" onclick="musicLibraryUI.setViewMode('grid')">⊞</button>
                            <button class="view-btn ${this.viewMode === 'list' ? 'active' : ''}" onclick="musicLibraryUI.setViewMode('list')">☰</button>
                        </div>
                    </div>
                </div>
                <div class="music-modal-content" style="height: calc(85vh - 160px);">
                    <div class="music-sidebar">
                        <nav style="display: flex; flex-direction: column; gap: 8px;">
                            <div class="sidebar-item active" data-section="all-music">
                                <span>🎵</span> All Music
                            </div>
                            <div class="sidebar-item" data-section="recently-played">
                                <span>🕐</span> Recently Played
                            </div>
                            <div class="sidebar-item" data-section="favorites">
                                <span>❤️</span> Liked Songs
                            </div>
                        </nav>
                    </div>
                    <div class="music-content">
                        <div class="content-body">
                            <div id="music-content-area">
                                ${this.renderMusicContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLiveSessionsDashboard() {
        return `
            <div class="music-modal" style="transform: none; opacity: 1;">
                <div class="music-modal-header dashboard">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <h1 style="font-size: 24px; font-weight: 700; margin: 0;">Live Sessions Dashboard</h1>
                        <div class="live-indicator">
                            <div class="live-dot"></div>
                            <span style="color: #10b981; font-size: 14px; font-weight: 600;">LIVE</span>
                        </div>
                    </div>
                    <div style="text-align: right; color: rgba(255,255,255,0.8);">
                        <p style="margin: 0; font-size: 14px;">Last updated: ${new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
                <div style="padding: 30px; height: calc(85vh - 160px); overflow-y: auto;">
                    <!-- Metrics Grid -->
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                                <h3 style="font-size: 18px; font-weight: 600; margin: 0;">Active Listeners</h3>
                                <span style="font-size: 24px;">👥</span>
                            </div>
                            <div class="metric-value">${this.liveMetrics.activeListeners.toLocaleString()}</div>
                            <div class="metric-trend">
                                <span>📈</span> +12% from last hour
                            </div>
                        </div>
                        
                        <div class="metric-card">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                                <h3 style="font-size: 18px; font-weight: 600; margin: 0;">Active Sessions</h3>
                                <span style="font-size: 24px;">📻</span>
                            </div>
                            <div class="metric-value" style="color: #7c3aed;">${this.liveMetrics.totalSessions}</div>
                            <div class="metric-trend">
                                <span>📈</span> +8% from yesterday
                            </div>
                        </div>
                        
                        <div class="metric-card">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                                <h3 style="font-size: 18px; font-weight: 600; margin: 0;">Avg Session Time</h3>
                                <span style="font-size: 24px;">🕐</span>
                            </div>
                            <div class="metric-value" style="color: #059669;">${this.liveMetrics.avgSessionTime}</div>
                            <div class="metric-trend">
                                <span>📈</span> +2m 15s from last week
                            </div>
                        </div>
                    </div>

                    <!-- Charts Section -->
                    <div class="charts-section">
                        <div class="chart-card">
                            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">Listener Activity (Last 24h)</h3>
                            <div class="chart-placeholder">
                                <div style="display: flex; align-items: end; gap: 8px; height: 120px;">
                                    ${Array.from({length: 12}, (_, i) => `<div style="width: 12px; background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); border-radius: 2px; height: ${Math.random() * 100}%;"></div>`).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <div class="chart-card">
                            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">Top Genres</h3>
                            <div style="display: flex; flex-direction: column; gap: 15px;">
                                ${this.liveMetrics.topGenres.map((genre, index) => `
                                    <div style="display: flex; align-items: center; justify-content: space-between;">
                                        <span style="color: white; font-weight: 500;">${genre}</span>
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <div style="width: 100px; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden;">
                                                <div style="width: ${(4-index) * 25}%; height: 100%; background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); border-radius: 4px;"></div>
                                            </div>
                                            <span style="color: rgba(255,255,255,0.7); font-size: 12px;">${(4-index) * 25}%</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Real-time Activity Feed -->
                    <div class="activity-feed">
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">Real-time Activity</h3>
                        <div style="max-height: 200px; overflow-y: auto;">
                            <div class="activity-item">
                                <div class="activity-dot"></div>
                                <span style="color: rgba(255,255,255,0.8); font-size: 14px;">New user joined session #42</span>
                                <span style="color: rgba(255,255,255,0.5); font-size: 12px; margin-left: auto;">Just now</span>
                            </div>
                            <div class="activity-item">
                                <div class="activity-dot"></div>
                                <span style="color: rgba(255,255,255,0.8); font-size: 14px;">Track 'Midnight Dreams' started playing</span>
                                <span style="color: rgba(255,255,255,0.5); font-size: 12px; margin-left: auto;">1m ago</span>
                            </div>
                            <div class="activity-item">
                                <div class="activity-dot"></div>
                                <span style="color: rgba(255,255,255,0.8); font-size: 14px;">Session #38 ended after 45 minutes</span>
                                <span style="color: rgba(255,255,255,0.5); font-size: 12px; margin-left: auto;">2m ago</span>
                            </div>
                            <div class="activity-item">
                                <div class="activity-dot"></div>
                                <span style="color: rgba(255,255,255,0.8); font-size: 14px;">User liked 'Electric Pulse'</span>
                                <span style="color: rgba(255,255,255,0.5); font-size: 12px; margin-left: auto;">3m ago</span>
                            </div>
                            <div class="activity-item">
                                <div class="activity-dot"></div>
                                <span style="color: rgba(255,255,255,0.8); font-size: 14px;">New session started in Electronic genre</span>
                                <span style="color: rgba(255,255,255,0.5); font-size: 12px; margin-left: auto;">5m ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderMusicDiscoveryInterface() {
        return `
            <div class="music-modal" style="transform: none; opacity: 1;">
                <div class="music-modal-header discovery">
                    <h1 style="font-size: 24px; font-weight: 700; margin: 0;">Music Discovery</h1>
                    <div class="discovery-tabs">
                        <button class="discovery-tab ${this.activeTab === 'trending' ? 'active' : ''}" onclick="musicLibraryUI.setDiscoveryTab('trending')">Trending</button>
                        <button class="discovery-tab ${this.activeTab === 'recommended' ? 'active' : ''}" onclick="musicLibraryUI.setDiscoveryTab('recommended')">Recommended</button>
                        <button class="discovery-tab ${this.activeTab === 'genres' ? 'active' : ''}" onclick="musicLibraryUI.setDiscoveryTab('genres')">Genres</button>
                    </div>
                </div>
                <div style="padding: 30px; height: calc(85vh - 160px); overflow-y: auto;">
                    <div id="discovery-content">
                        ${this.renderDiscoveryContent()}
                    </div>
                </div>
            </div>
        `;
    }

    renderDiscoveryContent() {
        switch(this.activeTab) {
            case 'trending':
                return `
                    <div>
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px;">
                            <h2 style="font-size: 20px; font-weight: 600; margin: 0;">Trending Now</h2>
                            <div class="live-indicator">
                                <div class="live-dot" style="background: #ef4444;"></div>
                                <span style="color: #ef4444; font-size: 14px; font-weight: 600;">Live Updates</span>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 25px;">
                            ${this.discoveryData.trending.map((item, index) => `
                                <div style="background: rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; transition: all 0.3s ease; cursor: pointer; border: 1px solid rgba(255,255,255,0.1);"
                                     onmouseover="this.style.transform='translateY(-5px) scale(1.02)'" 
                                     onmouseout="this.style.transform='translateY(0) scale(1)'">
                                    <div style="position: relative; height: 180px; background: linear-gradient(135deg, #059669 0%, #1e40af 100%); display: flex; align-items: center; justify-content: center; font-size: 48px;">
                                        ${item.thumbnail}
                                        ${item.isLive ? `
                                            <div style="position: absolute; top: 15px; left: 15px; display: flex; align-items: center; gap: 8px; background: #ef4444; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                                <div style="width: 8px; height: 8px; background: white; border-radius: 50%; animation: pulse 1.5s infinite;"></div>
                                                LIVE
                                            </div>
                                        ` : ''}
                                        <div style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                            #${index + 1}
                                        </div>
                                        <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.4); opacity: 0; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center;"
                                             onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">
                                            <button class="play-btn" onclick="musicLibraryUI.playTrack(${item.id})" style="width: 60px; height: 60px; font-size: 24px;">▶️</button>
                                        </div>
                                    </div>
                                    <div style="padding: 20px;">
                                        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 6px; color: white;">${item.title}</h3>
                                        <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin-bottom: 12px;">${item.artist}</p>
                                        <div style="display: flex; align-items: center; justify-content: space-between;">
                                            <span style="color: #7c3aed; font-size: 14px; font-weight: 600;">${item.plays.toLocaleString()} plays</span>
                                            <div style="display: flex; gap: 10px;">
                                                <button style="background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; font-size: 16px; padding: 4px;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">❤️</button>
                                                <button style="background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; font-size: 16px; padding: 4px;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">🔗</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            case 'recommended':
                return `
                    <div>
                        <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 25px;">Recommended for You</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 25px;">
                            ${this.discoveryData.recommended.map(item => `
                                <div style="background: rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; transition: all 0.3s ease; cursor: pointer; border: 1px solid rgba(255,255,255,0.1);">
                                    <div style="position: relative; height: 180px; background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); display: flex; align-items: center; justify-content: center; font-size: 48px;">
                                        ${item.thumbnail}
                                        <div style="position: absolute; top: 15px; right: 15px; background: linear-gradient(135deg, #059669 0%, #1e40af 100%); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">
                                            ${item.similarity}% Match
                                        </div>
                                    </div>
                                    <div style="padding: 20px;">
                                        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 6px; color: white;">${item.title}</h3>
                                        <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin-bottom: 15px;">${item.artist}</p>
                                        <div style="display: flex; align-items: center; justify-content: space-between;">
                                            <div style="display: flex; align-items: center; gap: 6px;">
                                                <span style="color: #fbbf24; font-size: 16px;">⭐</span>
                                                <span style="color: rgba(255,255,255,0.8); font-size: 14px;">Recommended</span>
                                            </div>
                                            <button style="background: none; border: none; color: #1e40af; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                                <span>View Similar</span>
                                                <span>›</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            case 'genres':
                return `
                    <div>
                        <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 25px;">Explore Genres</h2>
                        <div class="genre-grid">
                            ${['Electronic', 'Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'R&B', 'Country'].map(genre => `
                                <div class="genre-card" onclick="musicLibraryUI.exploreGenre('${genre}')">
                                    <div style="font-size: 32px; margin-bottom: 12px;">🎵</div>
                                    <h3 style="font-size: 16px; font-weight: 600; color: white; margin: 0;">${genre}</h3>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            default:
                return this.renderDiscoveryContent();
        }
    }

    renderMusicContent() {
        if (this.viewMode === 'grid') {
            return `
                <div class="music-grid">
                    ${this.tracks.map(track => `
                        <div class="music-card" data-track-id="${track.id}">
                            <div class="album-art">
                                ${track.image}
                                <div class="play-overlay">
                                    <button class="play-btn" onclick="musicLibraryUI.playTrack(${track.id})">▶️</button>
                                </div>
                            </div>
                            <div class="track-title">${track.title}</div>
                            <div class="track-artist">${track.artist}</div>
                            <div class="track-stats">
                                <span class="track-plays">${track.plays.toLocaleString()} plays</span>
                                <button style="background: none; border: none; color: ${track.liked ? '#ef4444' : 'rgba(255,255,255,0.5)'}; cursor: pointer; font-size: 16px;" onclick="musicLibraryUI.toggleLike(${track.id})">
                                    ${track.liked ? '❤️' : '🤍'}
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            return `
                <div class="music-list">
                    ${this.tracks.map(track => `
                        <div class="music-list-item" data-track-id="${track.id}">
                            <button class="play-btn" style="width: 32px; height: 32px; font-size: 14px;" onclick="musicLibraryUI.playTrack(${track.id})">▶️</button>
                            <div class="list-album-art">${track.image}</div>
                            <div class="track-info">
                                <div class="track-title" style="font-size: 15px;">${track.title}</div>
                                <div class="track-artist" style="font-size: 13px;">${track.artist}</div>
                            </div>
                            <span style="color: rgba(255,255,255,0.5); font-size: 13px;">${track.duration}</span>
                            <button style="background: none; border: none; color: ${track.liked ? '#ef4444' : 'rgba(255,255,255,0.5)'}; cursor: pointer; font-size: 16px;" onclick="musicLibraryUI.toggleLike(${track.id})">
                                ${track.liked ? '❤️' : '🤍'}
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    setupMusicInterfaceEvents() {
        // Set up interface-specific event listeners
    }

    setupDiscoveryEvents() {
        // Set up discovery-specific event listeners  
    }

    setViewMode(mode) {
        this.viewMode = mode;
        const contentArea = document.getElementById('music-content-area');
        if (contentArea) {
            contentArea.innerHTML = this.renderMusicContent();
        }
        
        // Update view toggle buttons
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[onclick="musicLibraryUI.setViewMode('${mode}')"]`).classList.add('active');
    }

    setDiscoveryTab(tab) {
        this.activeTab = tab;
        const contentEl = document.getElementById('discovery-content');
        if (contentEl) {
            contentEl.innerHTML = this.renderDiscoveryContent();
        }
        
        // Update discovery tabs
        document.querySelectorAll('.discovery-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[onclick="musicLibraryUI.setDiscoveryTab('${tab}')"]`).classList.add('active');
    }

    toggleLike(trackId) {
        const track = this.tracks.find(t => t.id === trackId);
        if (track) {
            track.liked = !track.liked;
            // Re-render content to update the UI
            const contentArea = document.getElementById('music-content-area');
            if (contentArea) {
                contentArea.innerHTML = this.renderMusicContent();
            }
        }
    }

    exploreGenre(genre) {
        console.log(`Exploring ${genre} genre`);
        // Implementation for genre exploration
    }

    startLiveUpdates() {
        // Simulate real-time updates for live metrics
        setInterval(() => {
            this.liveMetrics.activeListeners += Math.floor(Math.random() * 20) - 10;
            if (this.liveMetrics.activeListeners < 0) this.liveMetrics.activeListeners = 0;
            
            // Update display if dashboard is active
            if (this.activeInterface === 'dashboard') {
                const metricsEl = document.querySelector('.metric-value');
                if (metricsEl) {
                    metricsEl.textContent = this.liveMetrics.activeListeners.toLocaleString();
                }
            }
        }, 3000);
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

// Make it globally accessible
window.musicLibraryUI = musicLibraryUI;

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusicLibraryUI;
}
