/**
 * ConnectHub Search Missing UI Components
 * Implements the 5 missing Search Screen interfaces from the audit
 */

class SearchMissingUIComponents {
    constructor(app) {
        this.app = app;
        this.searchHistory = [];
        this.savedSearches = new Map();
        this.searchAnalytics = {
            popularTerms: [],
            recentActivity: [],
            trends: []
        };
        
        this.initializeMissingComponents();
    }

    /**
     * Initialize all 5 missing Search UI components
     */
    initializeMissingComponents() {
        console.log('Initializing 5 Missing Search UI Components');
    }

    /**
     * 1. ADVANCED SEARCH FILTERS INTERFACE
     */
    showAdvancedSearchFilters() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-sliders-h"></i> Advanced Search Filters</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="advanced-filters-content">
                    <!-- Content Type Filters -->
                    <div class="filter-section" style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h4><i class="fas fa-filter"></i> Content Type</h4>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox" checked> 
                                <i class="fas fa-user" style="color: var(--primary);"></i> People
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox" checked> 
                                <i class="fas fa-newspaper" style="color: var(--secondary);"></i> Posts
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox"> 
                                <i class="fas fa-images" style="color: var(--accent);"></i> Photos
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox"> 
                                <i class="fas fa-video" style="color: var(--warning);"></i> Videos
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox"> 
                                <i class="fas fa-users-cog" style="color: var(--success);"></i> Groups
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox"> 
                                <i class="fas fa-calendar" style="color: var(--error);"></i> Events
                            </label>
                        </div>
                    </div>

                    <!-- Date Range Filters -->
                    <div class="filter-section" style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h4><i class="fas fa-calendar-alt"></i> Date Range</h4>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem;">From Date</label>
                                <input type="datetime-local" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem;">To Date</label>
                                <input type="datetime-local" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                            </div>
                        </div>
                    </div>

                    <!-- Location Filters -->
                    <div class="filter-section" style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h4><i class="fas fa-map-marker-alt"></i> Location</h4>
                        <div style="margin-top: 1rem;">
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem;">Search near</label>
                                <input type="text" placeholder="City, state, or address" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem;">Within <span id="radius-value">25</span> miles</label>
                                <input type="range" min="1" max="100" value="25" style="width: 100%;" oninput="document.getElementById('radius-value').textContent = this.value">
                            </div>
                        </div>
                    </div>

                    <!-- User Filters -->
                    <div class="filter-section" style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h4><i class="fas fa-user-check"></i> User Criteria</h4>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox"> Verified users only
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox"> Has mutual connections
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox"> Currently online
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox"> Active in last week
                            </label>
                        </div>
                    </div>

                    <!-- Engagement Filters -->
                    <div class="filter-section" style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h4><i class="fas fa-chart-line"></i> Engagement Filters</h4>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem;">Min Likes</label>
                                <input type="number" placeholder="0" min="0" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem;">Min Comments</label>
                                <input type="number" placeholder="0" min="0" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem;">Min Shares</label>
                                <input type="number" placeholder="0" min="0" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                            </div>
                        </div>
                    </div>

                    <!-- Language & Keywords -->
                    <div class="filter-section" style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                        <h4><i class="fas fa-language"></i> Language & Keywords</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem;">Language</label>
                                <select style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                                    <option value="any">Any Language</option>
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="zh">Chinese</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem;">Exclude Keywords</label>
                                <input type="text" placeholder="Separate with commas" style="width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button class="btn btn-secondary" onclick="this.clearAdvancedFilters()">Clear Filters</button>
                        <button class="btn btn-secondary" onclick="this.saveFiltersAsTemplate()">Save Template</button>
                        <button class="btn btn-primary" onclick="this.applyAdvancedFilters()">Apply Filters</button>
                    </div>
                </div>
            </div>
        `;

        modal.clearAdvancedFilters = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Filters cleared', 'info');
            }
        };

        modal.saveFiltersAsTemplate = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Filter template saved!', 'success');
            }
        };

        modal.applyAdvancedFilters = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Advanced filters applied!', 'success');
            }
            modal.remove();
        };

        document.body.appendChild(modal);
    }

    /**
     * 2. SEARCH HISTORY PANEL INTERFACE
     */
    showSearchHistoryPanel() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-history"></i> Search History</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="search-history-content">
                    <!-- History Controls -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <div style="display: flex; gap: 1rem;">
                            <button class="btn btn-small btn-primary" onclick="this.filterHistory('all')">All History</button>
                            <button class="btn btn-small btn-secondary" onclick="this.filterHistory('today')">Today</button>
                            <button class="btn btn-small btn-secondary" onclick="this.filterHistory('week')">This Week</button>
                            <button class="btn btn-small btn-secondary" onclick="this.filterHistory('month')">This Month</button>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-secondary" onclick="this.exportHistory()">
                                <i class="fas fa-download"></i> Export
                            </button>
                            <button class="btn btn-secondary" onclick="this.clearAllHistory()">
                                <i class="fas fa-trash"></i> Clear All
                            </button>
                        </div>
                    </div>

                    <!-- Search Bar for History -->
                    <div style="margin-bottom: 2rem;">
                        <div style="position: relative;">
                            <i class="fas fa-search" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                            <input type="text" placeholder="Search through your history..." style="width: 100%; padding: 0.75rem 1rem 0.75rem 3rem; border: 1px solid var(--glass-border); border-radius: 25px; background: var(--glass);">
                        </div>
                    </div>

                    <!-- History Statistics -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                        <div class="stat-card">
                            <div class="stat-number">347</div>
                            <div class="stat-label">Total Searches</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">28</div>
                            <div class="stat-label">This Week</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">12</div>
                            <div class="stat-label">Most Popular</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">5.2</div>
                            <div class="stat-label">Avg/Day</div>
                        </div>
                    </div>

                    <!-- Popular Searches -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                        <h4><i class="fas fa-fire"></i> Most Searched Terms</h4>
                        <div style="display: flex; flex-wrap: gap; margin-top: 1rem;">
                            ${['photography', 'travel destinations', 'tech tutorials', 'healthy recipes', 'workout routines', 'javascript tips', 'design inspiration', 'music playlists'].map(term => `
                                <span style="background: var(--primary); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; cursor: pointer; margin: 0.25rem;" onclick="this.searchAgain('${term}')">${term}</span>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Recent History List -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; max-height: 300px; overflow-y: auto;">
                        <h4><i class="fas fa-clock"></i> Recent Searches</h4>
                        <div id="history-list" style="margin-top: 1rem;">
                            ${[
                                { query: 'photography tips for beginners', time: '2 minutes ago', results: 1247, type: 'posts' },
                                { query: 'local hiking groups', time: '1 hour ago', results: 23, type: 'groups' },
                                { query: 'Sarah Johnson photographer', time: '3 hours ago', results: 8, type: 'people' },
                                { query: 'javascript tutorials', time: '1 day ago', results: 892, type: 'posts' },
                                { query: 'travel destinations 2024', time: '2 days ago', results: 456, type: 'posts' },
                                { query: 'fitness workout routines', time: '3 days ago', results: 334, type: 'posts' },
                                { query: 'healthy recipes vegetarian', time: '1 week ago', results: 567, type: 'posts' }
                            ].map((item, index) => `
                                <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-bottom: 1px solid var(--glass-border); margin-bottom: 0.5rem; cursor: pointer; border-radius: 8px; transition: all 0.2s ease;" onmouseover="this.style.background='var(--glass-hover)'" onmouseout="this.style.background='transparent'" onclick="this.searchAgain('${item.query}')">
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <i class="fas fa-${item.type === 'posts' ? 'newspaper' : item.type === 'people' ? 'user' : 'users-cog'}" style="color: var(--primary); width: 20px;"></i>
                                        <div>
                                            <div style="font-weight: 600; margin-bottom: 0.25rem;">${item.query}</div>
                                            <div style="color: var(--text-muted); font-size: 0.8rem;">${item.results} results • ${item.time}</div>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 0.5rem;">
                                        <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem;" onclick="event.stopPropagation(); this.addToFavorites('${item.query}')" title="Add to favorites">
                                            <i class="fas fa-star"></i>
                                        </button>
                                        <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem;" onclick="event.stopPropagation(); this.removeFromHistory(${index})" title="Remove from history">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                        <button class="btn btn-secondary" onclick="this.downloadHistory()">
                            <i class="fas fa-download"></i> Download History
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;

        modal.filterHistory = (period) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Showing ${period} searches`, 'info');
            }
        };

        modal.searchAgain = (query) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Searching again: "${query}"`, 'info');
            }
        };

        modal.addToFavorites = (query) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Added "${query}" to favorites`, 'success');
            }
        };

        modal.removeFromHistory = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Removed from search history', 'info');
            }
        };

        modal.exportHistory = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Search history exported!', 'success');
            }
        };

        modal.clearAllHistory = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Search history cleared', 'warning');
            }
        };

        modal.downloadHistory = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('History downloaded as CSV', 'success');
            }
        };

        document.body.appendChild(modal);
    }

    /**
     * 3. LOCATION SEARCH MAP INTERFACE
     */
    showLocationSearchMap() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-map-marked-alt"></i> Location Search</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="location-search-content">
                    <!-- Search Controls -->
                    <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
                        <div style="flex: 1; position: relative;">
                            <i class="fas fa-search" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                            <input type="text" id="location-search-input" placeholder="Search by location, address, or place..." style="width: 100%; padding: 0.75rem 1rem 0.75rem 3rem; border: 1px solid var(--glass-border); border-radius: 25px; background: var(--glass);">
                        </div>
                        <button class="btn btn-secondary" onclick="this.useCurrentLocation()">
                            <i class="fas fa-crosshairs"></i> Current Location
                        </button>
                        <button class="btn btn-secondary" onclick="this.showMapFilters()">
                            <i class="fas fa-sliders-h"></i> Filters
                        </button>
                    </div>

                    <!-- Map Container -->
                    <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 12px; height: 400px; margin-bottom: 2rem; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                        <!-- Mock Map Interface -->
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grid\" width=\"10\" height=\"10\" patternUnits=\"userSpaceOnUse\"><path d=\"M 10 0 L 0 0 0 10\" fill=\"none\" stroke=\"%23ddd\" stroke-width=\"0.5\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grid)\"/></svg>'); opacity: 0.3;"></div>
                        
                        <!-- Map Markers -->
                        <div style="position: absolute; top: 20%; left: 30%; width: 30px; height: 30px; background: var(--error); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="this.showLocationDetails('New York Coffee Shop')">
                            <i class="fas fa-coffee" style="color: white; font-size: 12px; transform: rotate(45deg);"></i>
                        </div>
                        <div style="position: absolute; top: 40%; left: 60%; width: 30px; height: 30px; background: var(--primary); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="this.showLocationDetails('Central Park')">
                            <i class="fas fa-tree" style="color: white; font-size: 12px; transform: rotate(45deg);"></i>
                        </div>
                        <div style="position: absolute; top: 60%; left: 45%; width: 30px; height: 30px; background: var(--secondary); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="this.showLocationDetails('Times Square')">
                            <i class="fas fa-building" style="color: white; font-size: 12px; transform: rotate(45deg);"></i>
                        </div>

                        <!-- Map Controls -->
                        <div style="position: absolute; top: 1rem; right: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                            <button style="background: white; border: 1px solid var(--glass-border); border-radius: 4px; padding: 0.5rem; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onclick="this.zoomIn()">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button style="background: white; border: 1px solid var(--glass-border); border-radius: 4px; padding: 0.5rem; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onclick="this.zoomOut()">
                                <i class="fas fa-minus"></i>
                            </button>
                        </div>

                        <!-- Map Legend -->
                        <div style="position: absolute; bottom: 1rem; left: 1rem; background: white; border-radius: 8px; padding: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <div style="font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem;">Map Legend</div>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                <div style="width: 12px; height: 12px; background: var(--error); border-radius: 50%;"></div>
                                <span style="font-size: 0.8rem;">Restaurants</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                <div style="width: 12px; height: 12px; background: var(--primary); border-radius: 50%;"></div>
                                <span style="font-size: 0.8rem;">Parks</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <div style="width: 12px; height: 12px; background: var(--secondary); border-radius: 50%;"></div>
                                <span style="font-size: 0.8rem;">Buildings</span>
                            </div>
                        </div>
                    </div>

                    <!-- Search Results Panel -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <!-- Nearby Results -->
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <h4><i class="fas fa-location-arrow"></i> Nearby Results</h4>
                            <div style="margin-top: 1rem;">
                                ${[
                                    { name: 'Brooklyn Heights Promenade', distance: '0.3 mi', type: 'Park', rating: 4.8 },
                                    { name: 'The Coffee Bean & Tea Leaf', distance: '0.5 mi', type: 'Restaurant', rating: 4.5 },
                                    { name: 'Brooklyn Bridge Park', distance: '0.7 mi', type: 'Park', rating: 4.7 },
                                    { name: 'DUMBO Art Gallery', distance: '0.9 mi', type: 'Art', rating: 4.6 }
                                ].map(place => `
                                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--glass-border);">
                                        <div>
                                            <div style="font-weight: 600;">${place.name}</div>
                                            <div style="color: var(--text-muted); font-size: 0.8rem;">${place.type} • ${place.distance}</div>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                                            <div style="display: flex; align-items: center; gap: 0.25rem; color: var(--warning);">
                                                <i class="fas fa-star" style="font-size: 0.8rem;"></i>
                                                <span style="font-size: 0.8rem;">${place.rating}</span>
                                            </div>
                                            <button class="btn btn-small btn-primary" onclick="this.showOnMap('${place.name}')">View</button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Location Filters -->
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <h4><i class="fas fa-filter"></i> Location Filters</h4>
                            <div style="margin-top: 1rem;">
                                <div style="margin-bottom: 1rem;">
                                    <label style="display: block; margin-bottom: 0.5rem;">Category</label>
                                    <select style="width: 100%; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                                        <option value="all">All Places</option>
                                        <option value="restaurants">Restaurants</option>
                                        <option value="parks">Parks</option>
                                        <option value="shopping">Shopping</option>
                                        <option value="entertainment">Entertainment</option>
                                    </select>
                                </div>
                                <div style="margin-bottom: 1rem;">
                                    <label style="display: block; margin-bottom: 0.5rem;">Price Range</label>
                                    <div style="display: flex; gap: 0.5rem;">
                                        <span style="padding: 0.25rem 0.5rem; border: 1px solid var(--primary); border-radius: 4px; cursor: pointer; font-size: 0.8rem;">$</span>
                                        <span style="padding: 0.25rem 0.5rem; border: 1px solid var(--glass-border); border-radius: 4px; cursor: pointer; font-size: 0.8rem;">$$</span>
                                        <span style="padding: 0.25rem 0.5rem; border: 1px solid var(--glass-border); border-radius: 4px; cursor: pointer; font-size: 0.8rem;">$$$</span>
                                        <span style="padding: 0.25rem 0.5rem; border: 1px solid var(--glass-border); border-radius: 4px; cursor: pointer; font-size: 0.8rem;">$$$$</span>
                                    </div>
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem;">Rating</label>
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <span style="font-size: 0.9rem;">4+</span>
                                        <input type="range" min="1" max="5" value="4" step="0.5" style="flex: 1;">
                                        <span style="color: var(--warning);"><i class="fas fa-star"></i></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                        <button class="btn btn-secondary" onclick="this.saveMapView()">
                            <i class="fas fa-bookmark"></i> Save View
                        </button>
                        <button class="btn btn-secondary" onclick="this.shareLocation()">
                            <i class="fas fa-share"></i> Share Location
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;

        modal.useCurrentLocation = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Getting current location...', 'info');
            }
        };

        modal.showMapFilters = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Map filters expanded', 'info');
            }
        };

        modal.showLocationDetails = (location) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Showing details for ${location}`, 'info');
            }
        };

        modal.zoomIn = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Zoomed in', 'info');
            }
        };

        modal.zoomOut = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Zoomed out', 'info');
            }
        };

        modal.showOnMap = (placeName) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Showing ${placeName} on map`, 'info');
            }
        };

        modal.saveMapView = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Map view saved!', 'success');
            }
        };

        modal.shareLocation = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Location shared!', 'success');
            }
        };

        document.body.appendChild(modal);
    }

    /**
     * 4. SAVED SEARCHES MANAGER INTERFACE
     */
    showSavedSearchesManager() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-bookmark"></i> Saved Searches</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="saved-searches-content">
                    <!-- Saved Searches Controls -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <div style="display: flex; gap: 1rem;">
                            <button class="btn btn-small btn-primary" onclick="this.filterSavedSearches('all')">All Saved</button>
                            <button class="btn btn-small btn-secondary" onclick="this.filterSavedSearches('recent')">Recent</button>
                            <button class="btn btn-small btn-secondary" onclick="this.filterSavedSearches('favorites')">Favorites</button>
                            <button class="btn btn-small btn-secondary" onclick="this.filterSavedSearches('alerts')">With Alerts</button>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-secondary" onclick="this.createSearchAlert()">
                                <i class="fas fa-bell"></i> Create Alert
                            </button>
                            <button class="btn btn-secondary" onclick="this.importSavedSearches()">
                                <i class="fas fa-upload"></i> Import
                            </button>
                        </div>
                    </div>

                    <!-- Search Bar for Saved Searches -->
                    <div style="margin-bottom: 2rem;">
                        <div style="position: relative;">
                            <i class="fas fa-search" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                            <input type="text" placeholder="Search through your saved searches..." style="width: 100%; padding: 0.75rem 1rem 0.75rem 3rem; border: 1px solid var(--glass-border); border-radius: 25px; background: var(--glass);">
                        </div>
                    </div>

                    <!-- Saved Searches Statistics -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                        <div class="stat-card">
                            <div class="stat-number">24</div>
                            <div class="stat-label">Saved Searches</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">8</div>
                            <div class="stat-label">Active Alerts</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">156</div>
                            <div class="stat-label">Total Runs</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">5</div>
                            <div class="stat-label">This Week</div>
                        </div>
                    </div>

                    <!-- Saved Searches List -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; max-height: 400px; overflow-y: auto;">
                        <h4><i class="fas fa-list"></i> Your Saved Searches</h4>
                        <div id="saved-searches-list" style="margin-top: 1rem;">
                            ${[
                                { name: 'Photography Tips & Tutorials', query: 'photography tips beginner tutorial', category: 'posts', alerts: true, lastRun: '2 days ago', results: 1200 },
                                { name: 'Local Hiking Groups Near Me', query: 'hiking groups outdoor activities', category: 'groups', alerts: true, lastRun: '1 week ago', results: 18 },
                                { name: 'JavaScript Development Jobs', query: 'javascript developer remote jobs', category: 'posts', alerts: false, lastRun: '3 days ago', results: 89 },
                                { name: 'Healthy Recipe Ideas', query: 'healthy recipes vegetarian low carb', category: 'posts', alerts: false, lastRun: '1 day ago', results: 456 },
                                { name: 'Tech Meetups & Events', query: 'technology meetup events networking', category: 'events', alerts: true, lastRun: '5 days ago', results: 23 },
                                { name: 'Travel Photographers Community', query: 'travel photography community groups', category: 'people', alerts: false, lastRun: '1 week ago', results: 67 }
                            ].map((search, index) => `
                                <div style="border: 1px solid var(--glass-border); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; background: var(--bg-card);">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                                        <div style="flex: 1;">
                                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                                <h5 style="margin: 0;">${search.name}</h5>
                                                ${search.alerts ? '<i class="fas fa-bell" style="color: var(--warning); font-size: 0.8rem;" title="Alerts enabled"></i>' : ''}
                                            </div>
                                            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">"${search.query}"</div>
                                            <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.8rem; color: var(--text-muted);">
                                                <span><i class="fas fa-${search.category === 'posts' ? 'newspaper' : search.category === 'people' ? 'user' : search.category === 'groups' ? 'users-cog' : 'calendar'}"></i> ${search.category}</span>
                                                <span><i class="fas fa-clock"></i> ${search.lastRun}</span>
                                                <span><i class="fas fa-search"></i> ${search.results} results</span>
                                            </div>
                                        </div>
                                        <div style="display: flex; gap: 0.5rem;">
                                            <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem;" onclick="this.toggleFavorite(${index})" title="Add to favorites">
                                                <i class="fas fa-star"></i>
                                            </button>
                                            <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem;" onclick="this.editSavedSearch(${index})" title="Edit search">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 0.5rem;">
                                        <button class="btn btn-small btn-primary" onclick="this.runSavedSearch('${search.query}')">
                                            <i class="fas fa-play"></i> Run Search
                                        </button>
                                        <button class="btn btn-small btn-secondary" onclick="this.duplicateSearch(${index})">
                                            <i class="fas fa-copy"></i> Duplicate
                                        </button>
                                        <button class="btn btn-small btn-secondary" onclick="this.toggleAlert(${index})">
                                            <i class="fas fa-${search.alerts ? 'bell-slash' : 'bell'}"></i> ${search.alerts ? 'Disable' : 'Enable'} Alert
                                        </button>
                                        <button class="btn btn-small btn-secondary" onclick="this.shareSavedSearch(${index})">
                                            <i class="fas fa-share"></i> Share
                                        </button>
                                        <button style="background: none; border: none; color: var(--error); cursor: pointer; padding: 0.5rem;" onclick="this.deleteSavedSearch(${index})" title="Delete search">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Search Alerts Section -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-top: 2rem;">
                        <h4><i class="fas fa-bell"></i> Search Alerts</h4>
                        <p style="color: var(--text-secondary); margin-bottom: 1rem;">Get notified when new content matches your saved searches</p>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem;">Alert Frequency</label>
                                <select style="width: 100%; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                                    <option value="realtime">Real-time</option>
                                    <option value="daily">Daily digest</option>
                                    <option value="weekly">Weekly summary</option>
                                    <option value="monthly">Monthly report</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem;">Minimum Results</label>
                                <input type="number" placeholder="5" min="1" style="width: 100%; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                        <button class="btn btn-secondary" onclick="this.exportSavedSearches()">
                            <i class="fas fa-download"></i> Export Searches
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;

        modal.filterSavedSearches = (filter) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Showing ${filter} saved searches`, 'info');
            }
        };

        modal.createSearchAlert = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Search alert creation opened', 'info');
            }
        };

        modal.runSavedSearch = (query) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Running search: "${query}"`, 'info');
            }
        };

        modal.editSavedSearch = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Edit search opened', 'info');
            }
        };

        modal.duplicateSearch = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Search duplicated!', 'success');
            }
        };

        modal.toggleAlert = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Alert settings updated', 'success');
            }
        };

        modal.deleteSavedSearch = (index) => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Saved search deleted', 'warning');
            }
        };

        modal.exportSavedSearches = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Saved searches exported!', 'success');
            }
        };

        document.body.appendChild(modal);
    }

    /**
     * 5. SEARCH ANALYTICS DASHBOARD INTERFACE
     */
    showSearchAnalyticsDashboard() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content large">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2><i class="fas fa-chart-bar"></i> Search Analytics Dashboard</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;" onclick="this.closest('.modal').remove()">✕</button>
                </div>

                <div class="analytics-dashboard-content">
                    <!-- Analytics Time Range -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <div style="display: flex; gap: 1rem;">
                            <button class="btn btn-small btn-primary" onclick="this.setAnalyticsRange('7d')">7 Days</button>
                            <button class="btn btn-small btn-secondary" onclick="this.setAnalyticsRange('30d')">30 Days</button>
                            <button class="btn btn-small btn-secondary" onclick="this.setAnalyticsRange('90d')">90 Days</button>
                            <button class="btn btn-small btn-secondary" onclick="this.setAnalyticsRange('1y')">1 Year</button>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-secondary" onclick="this.exportAnalytics()">
                                <i class="fas fa-download"></i> Export Report
                            </button>
                            <button class="btn btn-secondary" onclick="this.scheduleReport()">
                                <i class="fas fa-clock"></i> Schedule
                            </button>
                        </div>
                    </div>

                    <!-- Key Metrics Overview -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                        <div class="stat-card">
                            <div class="stat-number">2,847</div>
                            <div class="stat-label">Total Searches</div>
                            <div style="color: var(--success); font-size: 0.8rem;">↑ +12%</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">156</div>
                            <div class="stat-label">Unique Terms</div>
                            <div style="color: var(--success); font-size: 0.8rem;">↑ +8%</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">89</div>
                            <div class="stat-label">Avg Results/Search</div>
                            <div style="color: var(--warning); font-size: 0.8rem;">↓ -3%</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">4.8</div>
                            <div class="stat-label">Success Rate</div>
                            <div style="color: var(--success); font-size: 0.8rem;">↑ +0.2%</div>
                        </div>
                    </div>

                    <!-- Search Trends Chart -->
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <h4><i class="fas fa-chart-line"></i> Search Volume Trends (Last 30 Days)</h4>
                            <div style="height: 200px; display: flex; align-items: end; justify-content: space-between; margin-top: 1rem;">
                                ${Array.from({length: 30}, (_, i) => `
                                    <div style="width: 8px; height: ${Math.random() * 150 + 20}px; background: var(--primary); border-radius: 2px; margin: 0 1px;" title="Day ${i + 1}: ${Math.floor(Math.random() * 200) + 50} searches"></div>
                                `).join('')}
                            </div>
                        </div>

                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <h4><i class="fas fa-chart-pie"></i> Search Categories</h4>
                            <div style="margin-top: 1rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                    <span>People</span>
                                    <span style="color: var(--primary);">34%</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                    <span>Posts</span>
                                    <span style="color: var(--secondary);">28%</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                    <span>Groups</span>
                                    <span style="color: var(--accent);">19%</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                    <span>Events</span>
                                    <span style="color: var(--warning);">12%</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span>Other</span>
                                    <span style="color: var(--error);">7%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Top Search Terms -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <h4><i class="fas fa-fire"></i> Most Popular Search Terms</h4>
                            <div style="margin-top: 1rem;">
                                ${[
                                    { term: 'photography', count: 248, change: '+12%' },
                                    { term: 'travel destinations', count: 189, change: '+8%' },
                                    { term: 'healthy recipes', count: 156, change: '+5%' },
                                    { term: 'tech tutorials', count: 134, change: '+15%' },
                                    { term: 'workout routines', count: 112, change: '-2%' },
                                    { term: 'javascript', count: 98, change: '+7%' }
                                ].map(item => `
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--glass-border);">
                                        <div>
                                            <div style="font-weight: 600;">${item.term}</div>
                                            <div style="color: var(--text-muted); font-size: 0.8rem;">${item.count} searches</div>
                                        </div>
                                        <div style="color: ${item.change.startsWith('+') ? 'var(--success)' : 'var(--error)'}; font-size: 0.8rem;">
                                            ${item.change}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <h4><i class="fas fa-clock"></i> Search Activity by Time</h4>
                            <div style="margin-top: 1rem;">
                                <div style="margin-bottom: 1rem;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                        <span>Morning (6-12)</span>
                                        <span>23%</span>
                                    </div>
                                    <div style="background: var(--glass-border); height: 4px; border-radius: 2px; overflow: hidden;">
                                        <div style="background: var(--primary); height: 100%; width: 23%; border-radius: 2px;"></div>
                                    </div>
                                </div>
                                <div style="margin-bottom: 1rem;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                        <span>Afternoon (12-18)</span>
                                        <span>41%</span>
                                    </div>
                                    <div style="background: var(--glass-border); height: 4px; border-radius: 2px; overflow: hidden;">
                                        <div style="background: var(--secondary); height: 100%; width: 41%; border-radius: 2px;"></div>
                                    </div>
                                </div>
                                <div style="margin-bottom: 1rem;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                        <span>Evening (18-24)</span>
                                        <span>28%</span>
                                    </div>
                                    <div style="background: var(--glass-border); height: 4px; border-radius: 2px; overflow: hidden;">
                                        <div style="background: var(--accent); height: 100%; width: 28%; border-radius: 2px;"></div>
                                    </div>
                                </div>
                                <div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                        <span>Night (0-6)</span>
                                        <span>8%</span>
                                    </div>
                                    <div style="background: var(--glass-border); height: 4px; border-radius: 2px; overflow: hidden;">
                                        <div style="background: var(--warning); height: 100%; width: 8%; border-radius: 2px;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Search Success Analytics -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                        <h4><i class="fas fa-target"></i> Search Performance Analytics</h4>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
                            <div class="metric-card">
                                <div style="text-align: center;">
                                    <div style="font-size: 2rem; font-weight: 700; color: var(--success); margin-bottom: 0.5rem;">94.8%</div>
                                    <div style="color: var(--text-secondary);">Query Success Rate</div>
                                    <div style="color: var(--success); font-size: 0.8rem; margin-top: 0.25rem;">↑ +2.3%</div>
                                </div>
                            </div>
                            <div class="metric-card">
                                <div style="text-align: center;">
                                    <div style="font-size: 2rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">1.8s</div>
                                    <div style="color: var(--text-secondary);">Avg Response Time</div>
                                    <div style="color: var(--success); font-size: 0.8rem; margin-top: 0.25rem;">↓ -0.3s</div>
                                </div>
                            </div>
                            <div class="metric-card">
                                <div style="text-align: center;">
                                    <div style="font-size: 2rem; font-weight: 700; color: var(--warning); margin-bottom: 0.5rem;">87</div>
                                    <div style="color: var(--text-secondary);">Avg Results Found</div>
                                    <div style="color: var(--error); font-size: 0.8rem; margin-top: 0.25rem;">↓ -5</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Search Insights & Recommendations -->
                    <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                        <h4><i class="fas fa-lightbulb"></i> Search Insights & Recommendations</h4>
                        <div style="margin-top: 1rem;">
                            <div style="background: var(--info-bg); border: 1px solid var(--info-border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <i class="fas fa-chart-line" style="color: var(--info);"></i>
                                    <strong>Trending Up</strong>
                                </div>
                                <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">Search volume for "remote work" increased by 45% this week. Consider creating content around this topic.</p>
                            </div>
                            <div style="background: var(--success-bg); border: 1px solid var(--success-border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <i class="fas fa-bullseye" style="color: var(--success);"></i>
                                    <strong>Optimization Opportunity</strong>
                                </div>
                                <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">Your most popular searches have low result satisfaction. Consider refining search algorithms for better matches.</p>
                            </div>
                            <div style="background: var(--warning-bg); border: 1px solid var(--warning-border); border-radius: 8px; padding: 1rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <i class="fas fa-exclamation-triangle" style="color: var(--warning);"></i>
                                    <strong>Attention Needed</strong>
                                </div>
                                <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">Search abandonment rate increased to 23%. Users may need better search suggestions or filters.</p>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button class="btn btn-secondary" onclick="this.refreshAnalytics()">
                            <i class="fas fa-sync"></i> Refresh Data
                        </button>
                        <button class="btn btn-secondary" onclick="this.downloadReport()">
                            <i class="fas fa-file-pdf"></i> Download PDF
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;

        modal.setAnalyticsRange = (range) => {
            if (this.app && this.app.showToast) {
                this.app.showToast(`Analytics updated for ${range}`, 'info');
            }
        };

        modal.exportAnalytics = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Analytics report exported!', 'success');
            }
        };

        modal.scheduleReport = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Report scheduling opened', 'info');
            }
        };

        modal.refreshAnalytics = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('Analytics data refreshed', 'success');
            }
        };

        modal.downloadReport = () => {
            if (this.app && this.app.showToast) {
                this.app.showToast('PDF report downloaded!', 'success');
            }
        };

        document.body.appendChild(modal);
    }
}

// Export the class for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchMissingUIComponents;
}
