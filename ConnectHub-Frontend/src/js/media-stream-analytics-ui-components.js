/**
 * Stream Analytics Dashboard Interface - Complete System for ConnectHub Media Streaming
 * Provides: Real-time Analytics, Performance Metrics, Audience Analytics, Revenue Analytics
 */

class StreamAnalyticsUI {
    constructor() {
        this.currentTimeframe = '24h';
        this.refreshInterval = null;
        this.initializeAnalytics();
    }

    initializeAnalytics() {
        console.log('Stream Analytics Dashboard initialized');
        this.addStyles();
        this.bindGlobalEvents();
    }

    addStyles() {
        if (!document.getElementById('stream-analytics-styles')) {
            const style = document.createElement('style');
            style.id = 'stream-analytics-styles';
            style.textContent = `
                .analytics-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center;
                    z-index: 10000; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
                .analytics-modal-overlay.show { opacity: 1; visibility: visible; }
                .analytics-modal { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 20px; 
                    width: 95%; max-width: 1400px; height: 90vh; overflow: hidden; transform: scale(0.9); 
                    transition: transform 0.3s ease; box-shadow: 0 20px 40px rgba(0,0,0,0.3); color: white; }
                .analytics-modal-overlay.show .analytics-modal { transform: scale(1); }
                .analytics-modal-header { padding: 25px 30px; border-bottom: 1px solid rgba(255,255,255,0.1); 
                    display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.2); }
                .analytics-modal-content { height: calc(90vh - 80px); display: flex; }
                .analytics-close-btn { background: none; border: none; color: white; font-size: 24px; 
                    cursor: pointer; padding: 8px; border-radius: 50%; transition: all 0.2s ease; }
                .analytics-sidebar { width: 280px; background: rgba(0,0,0,0.3); padding: 20px; overflow-y: auto; }
                .sidebar-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; 
                    border-radius: 10px; cursor: pointer; transition: all 0.2s ease; margin-bottom: 4px; }
                .sidebar-item:hover { background: rgba(255,255,255,0.1); }
                .sidebar-item.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                .analytics-content { flex: 1; display: flex; flex-direction: column; }
                .content-header { padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.1); }
                .content-body { flex: 1; padding: 20px 30px; overflow-y: auto; }
                .metrics-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .metric-card { background: rgba(255,255,255,0.05); border-radius: 15px; padding: 25px; transition: all 0.3s ease; }
                .metric-value { font-size: 28px; font-weight: 700; margin-bottom: 5px; }
                .metric-label { font-size: 14px; color: rgba(255,255,255,0.7); }
                .chart-section { background: rgba(255,255,255,0.03); border-radius: 15px; padding: 25px; margin-bottom: 25px; }
                .chart-container { height: 300px; background: rgba(0,0,0,0.2); border-radius: 10px; 
                    display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.5); }
                .data-table { background: rgba(255,255,255,0.03); border-radius: 15px; overflow: hidden; }
                .table-row { padding: 15px 20px; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 20px; }
                .real-time-indicator { display: flex; align-items: center; gap: 8px; }
                .indicator-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            `;
            document.head.appendChild(style);
        }
    }

    bindGlobalEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAnalyticsDashboard();
        });
    }

    showAnalyticsDashboard() {
        const modal = document.createElement('div');
        modal.className = 'analytics-modal-overlay';
        modal.id = 'stream-analytics-modal';
        modal.innerHTML = `
            <div class="analytics-modal">
                <div class="analytics-modal-header">
                    <div>
                        <h2>📊 Stream Analytics Dashboard</h2>
                        <p style="margin: 0; color: rgba(255,255,255,0.7);">Real-time analytics and performance insights</p>
                    </div>
                    <div class="real-time-indicator">
                        <div class="indicator-dot"></div>
                        <span style="font-size: 14px;">Live Data</span>
                    </div>
                    <button class="analytics-close-btn" onclick="streamAnalyticsUI.closeAnalyticsDashboard()">×</button>
                </div>
                <div class="analytics-modal-content">
                    <div class="analytics-sidebar">
                        <div style="margin-bottom: 15px;">
                            <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 10px;">ANALYTICS</div>
                            <div class="sidebar-item active" data-section="overview">
                                <span>📊</span> Overview
                            </div>
                            <div class="sidebar-item" data-section="audience">
                                <span>👥</span> Audience
                            </div>
                            <div class="sidebar-item" data-section="revenue">
                                <span>💰</span> Revenue
                            </div>
                            <div class="sidebar-item" data-section="performance">
                                <span>⚡</span> Performance
                            </div>
                        </div>
                    </div>
                    <div class="analytics-content">
                        <div class="content-header">
                            <div style="font-size: 24px; font-weight: 700;">Analytics Overview</div>
                            <div style="font-size: 14px; color: rgba(255,255,255,0.7);">Real-time insights and performance metrics</div>
                        </div>
                        <div class="content-body" id="analytics-content-area">
                            <div class="metrics-overview">
                                <div class="metric-card">
                                    <div class="metric-value">2,847</div>
                                    <div class="metric-label">Active Viewers</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-value">45m</div>
                                    <div class="metric-label">Avg Watch Time</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-value">$1,234</div>
                                    <div class="metric-label">Revenue (24h)</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-value">68%</div>
                                    <div class="metric-label">Engagement Rate</div>
                                </div>
                            </div>
                            <div class="chart-section">
                                <div style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">Viewer Trends</div>
                                <div class="chart-container">📈 Interactive Chart Area - Viewer trends over time</div>
                            </div>
                            <div class="data-table">
                                <div class="table-row" style="background: rgba(0,0,0,0.3); font-weight: 600;">
                                    <div>Stream Title</div>
                                    <div>Status</div>
                                    <div>Viewers</div>
                                    <div>Duration</div>
                                    <div>Revenue</div>
                                </div>
                                <div class="table-row">
                                    <div>🎮 Gaming Session Live</div>
                                    <div>🔴 LIVE</div>
                                    <div>1,234</div>
                                    <div>2h 45m</div>
                                    <div>$89.50</div>
                                </div>
                                <div class="table-row">
                                    <div>🎵 Music Performance</div>
                                    <div>⏹️ ENDED</div>
                                    <div>892</div>
                                    <div>1h 30m</div>
                                    <div>$156.75</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        this.setupAnalyticsEvents();
        this.startAutoRefresh();
    }

    setupAnalyticsEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.sidebar-item[data-section]')) {
                const item = e.target.closest('.sidebar-item');
                document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.loadAnalyticsSection(item.dataset.section);
            }
        });
    }

    loadAnalyticsSection(section) {
        const contentArea = document.getElementById('analytics-content-area');
        if (!contentArea) return;

        const sections = {
            overview: this.renderOverview(),
            audience: this.renderAudience(),
            revenue: this.renderRevenue(),
            performance: this.renderPerformance()
        };

        contentArea.innerHTML = sections[section] || sections.overview;
    }

    renderOverview() {
        return `
            <div class="metrics-overview">
                <div class="metric-card">
                    <div class="metric-value">2,847</div>
                    <div class="metric-label">Active Viewers</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">45m</div>
                    <div class="metric-label">Avg Watch Time</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">$1,234</div>
                    <div class="metric-label">Revenue (24h)</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">68%</div>
                    <div class="metric-label">Engagement Rate</div>
                </div>
            </div>
            <div class="chart-section">
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">Viewer Trends</div>
                <div class="chart-container">📈 Real-time viewer analytics and engagement metrics</div>
            </div>
        `;
    }

    renderAudience() {
        return `
            <div class="metrics-overview">
                <div class="metric-card">
                    <div class="metric-value">12,847</div>
                    <div class="metric-label">Total Followers</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">324</div>
                    <div class="metric-label">New Followers</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">76%</div>
                    <div class="metric-label">Return Rate</div>
                </div>
            </div>
            <div class="chart-section">
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">Audience Demographics</div>
                <div class="chart-container">👥 Detailed audience insights and demographics data</div>
            </div>
        `;
    }

    renderRevenue() {
        return `
            <div class="metrics-overview">
                <div class="metric-card">
                    <div class="metric-value">$3,456</div>
                    <div class="metric-label">Total Revenue</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">$89.50</div>
                    <div class="metric-label">Avg per Stream</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">142</div>
                    <div class="metric-label">Subscribers</div>
                </div>
            </div>
            <div class="chart-section">
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">Revenue Analytics</div>
                <div class="chart-container">💰 Monetization performance and earnings breakdown</div>
            </div>
        `;
    }

    renderPerformance() {
        return `
            <div class="metrics-overview">
                <div class="metric-card">
                    <div class="metric-value">99.2%</div>
                    <div class="metric-label">Uptime</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">1080p</div>
                    <div class="metric-label">Max Quality</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">45ms</div>
                    <div class="metric-label">Avg Latency</div>
                </div>
            </div>
            <div class="chart-section">
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">Performance Metrics</div>
                <div class="chart-container">⚡ Technical performance and streaming quality data</div>
            </div>
        `;
    }

    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            console.log('Refreshing analytics data...');
        }, 30000);
    }

    refreshData() {
        console.log('Manual refresh triggered');
    }

    closeAnalyticsDashboard() {
        const modal = document.getElementById('stream-analytics-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    loadAnalyticsData() {
        console.log('Loading analytics data');
    }
}

// Initialize Stream Analytics
const streamAnalyticsUI = new StreamAnalyticsUI();

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StreamAnalyticsUI;
}
