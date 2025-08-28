// Instagram-Inspired Advanced Analytics Dashboard Implementation
// Based on the provided Instagram-style design with dark mode and modern UI

const InstagramAnalyticsDashboard = {
    init() {
        this.currentTab = 'overview';
        this.currentPeriod = '7days';
        this.isLiveUpdating = true;
        this.activityFeedPaused = false;
        this.charts = {};
        this.concurrentUsers = 2847;
        this.setupEventListeners();
        this.generateInitialActivity();
        this.startRealTimeUpdates();
    },

    createDashboard() {
        return `
            <style>
                .instagram-analytics {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f0f0f 50%, #1f1f1f 75%, #0a0a0a 100%);
                    background-attachment: fixed;
                    min-height: 100vh;
                    color: #e5e5e5;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    backdrop-filter: blur(10px);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .analytics-header {
                    background: #ffffff;
                    border-bottom: 1px solid #dbdbdb;
                    padding: 20px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    backdrop-filter: blur(10px);
                }

                .analytics-header h1 {
                    font-size: 24px;
                    font-weight: 600;
                    color: #262626;
                    letter-spacing: -0.3px;
                    margin: 0;
                }

                .live-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #f7f7f7;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #8e8e8e;
                }

                .pulse {
                    width: 8px;
                    height: 8px;
                    background: #22c55e;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
                    70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }

                .analytics-tabs {
                    background: #ffffff;
                    border-bottom: 1px solid #dbdbdb;
                    padding: 0;
                    display: flex;
                    overflow-x: auto;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }

                .analytics-tabs::-webkit-scrollbar {
                    display: none;
                }

                .analytics-tab {
                    padding: 16px 24px;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 500;
                    font-size: 14px;
                    color: #8e8e8e;
                    min-width: fit-content;
                    border: none;
                    background: none;
                }

                .analytics-tab:hover {
                    color: #262626;
                }

                .analytics-tab.active {
                    border-bottom-color: #262626;
                    color: #262626;
                }

                .analytics-content {
                    padding: 24px;
                    background: linear-gradient(145deg, #f5f5f5, #e8e8e8);
                }

                .time-controls {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                    padding: 4px;
                    background: #ffffff;
                    border-radius: 12px;
                    border: 1px solid #dbdbdb;
                    width: fit-content;
                }

                .time-btn {
                    padding: 8px 16px;
                    border: none;
                    background: transparent;
                    color: #8e8e8e;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-weight: 500;
                    font-size: 14px;
                }

                .time-btn:hover {
                    color: #262626;
                    background: #f7f7f7;
                }

                .time-btn.active {
                    color: #ffffff;
                    background: #262626;
                }

                .stories-scroll {
                    display: flex;
                    gap: 16px;
                    overflow-x: auto;
                    padding: 0 0 16px 0;
                    margin-bottom: 24px;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }

                .stories-scroll::-webkit-scrollbar {
                    display: none;
                }

                .story-item {
                    min-width: 120px;
                    text-align: center;
                    cursor: pointer;
                }

                .story-circle {
                    width: 80px;
                    height: 80px;
                    border: 2px solid #dbdbdb;
                    border-radius: 50%;
                    margin: 0 auto 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
                    color: white;
                    font-weight: 600;
                    transition: transform 0.2s ease;
                }

                .story-circle:hover {
                    transform: scale(1.05);
                }

                .story-label {
                    font-size: 12px;
                    color: #8e8e8e;
                    font-weight: 400;
                }

                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 16px;
                    margin-bottom: 32px;
                }

                .kpi-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 24px;
                    border: 1px solid #dbdbdb;
                    transition: all 0.2s ease;
                    position: relative;
                }

                .kpi-card:hover {
                    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
                }

                .kpi-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .kpi-title {
                    font-size: 14px;
                    color: #8e8e8e;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .kpi-icon {
                    font-size: 20px;
                    opacity: 0.7;
                }

                .kpi-value {
                    font-size: 32px;
                    font-weight: 700;
                    color: #262626;
                    margin-bottom: 8px;
                    line-height: 1.1;
                }

                .kpi-change {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 14px;
                    font-weight: 500;
                }

                .positive { 
                    color: #22c55e; 
                }
                .negative { 
                    color: #ef4444; 
                }

                .progress-bar {
                    width: 100%;
                    height: 4px;
                    background: #f1f1f1;
                    border-radius: 2px;
                    margin-top: 16px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #262626, #525252);
                    border-radius: 2px;
                    transition: width 1s ease;
                }

                .chart-container {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 24px;
                    border: 1px solid #dbdbdb;
                    margin-bottom: 24px;
                }

                .chart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .chart-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #262626;
                    margin: 0;
                }

                .chart-controls {
                    display: flex;
                    gap: 8px;
                    background: #f7f7f7;
                    padding: 4px;
                    border-radius: 8px;
                }

                .chart-btn {
                    padding: 6px 12px;
                    border: none;
                    background: transparent;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    color: #8e8e8e;
                    transition: all 0.2s ease;
                }

                .chart-btn:hover {
                    color: #262626;
                }

                .chart-btn.active {
                    background: #ffffff;
                    color: #262626;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .activity-feed {
                    max-height: 400px;
                    overflow-y: auto;
                    margin-top: 16px;
                }

                .activity-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 0;
                    border-bottom: 1px solid #f7f7f7;
                    transition: background 0.2s ease;
                }

                .activity-item:hover {
                    background: rgba(0,0,0,0.02);
                    margin: 0 -24px;
                    padding: 16px 24px;
                    border-radius: 8px;
                }

                .activity-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d, #f56040, #f77737, #fcaf45, #ffdc80);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 14px;
                }

                .activity-content {
                    flex: 1;
                }

                .activity-text {
                    font-weight: 500;
                    margin-bottom: 4px;
                    color: #262626;
                    font-size: 14px;
                }

                .activity-time {
                    color: #8e8e8e;
                    font-size: 12px;
                }

                .segment-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 16px;
                    border: 1px solid #dbdbdb;
                    border-left: 4px solid;
                }

                .segment-premium { border-left-color: #f59e0b; }
                .segment-free { border-left-color: #3b82f6; }
                .segment-trial { border-left-color: #22c55e; }

                .segment-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .segment-name {
                    font-weight: 600;
                    font-size: 16px;
                    color: #262626;
                }

                .segment-count {
                    background: #f7f7f7;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #8e8e8e;
                }

                .segment-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                    gap: 16px;
                }

                .segment-stat {
                    text-align: center;
                    padding: 16px;
                    background: #fafafa;
                    border-radius: 8px;
                }

                .segment-stat-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: #262626;
                    margin-bottom: 4px;
                }

                .segment-stat-label {
                    font-size: 11px;
                    color: #8e8e8e;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 500;
                }

                .prediction-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 16px;
                }

                .prediction-card {
                    background: #ffffff;
                    border: 1px solid #dbdbdb;
                    border-radius: 12px;
                    padding: 32px 24px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                .prediction-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #405de6, #833ab4, #fd1d1d);
                }

                .prediction-icon {
                    font-size: 32px;
                    margin-bottom: 16px;
                    opacity: 0.8;
                }

                .prediction-value {
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: #262626;
                }

                .prediction-label {
                    color: #8e8e8e;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-size: 12px;
                    font-weight: 500;
                    margin-bottom: 8px;
                }

                .prediction-change {
                    font-size: 14px;
                    color: #22c55e;
                    font-weight: 500;
                }

                .hidden { 
                    display: none; 
                }

                .fade-in {
                    animation: fadeIn 0.3s ease-in;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 16px;
                    background: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .data-table th,
                .data-table td {
                    padding: 16px;
                    text-align: left;
                    border-bottom: 1px solid #f7f7f7;
                    font-size: 14px;
                }

                .data-table th {
                    background: #fafafa;
                    font-weight: 600;
                    color: #262626;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .data-table tbody tr:hover {
                    background: rgba(0,0,0,0.02);
                }

                .geo-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-top: 24px;
                }

                .geo-item {
                    background: #fafafa;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    border: 1px solid #f1f1f1;
                }

                .geo-flag {
                    font-size: 24px;
                    margin-bottom: 8px;
                }

                .geo-country {
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: #262626;
                    font-size: 14px;
                }

                .geo-percentage {
                    color: #262626;
                    font-size: 20px;
                    font-weight: 700;
                    margin-bottom: 4px;
                }

                .geo-users {
                    font-size: 12px;
                    color: #8e8e8e;
                }

                .metric-card {
                    background: #ffffff;
                    border: 1px solid #dbdbdb;
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                    transition: all 0.2s ease;
                }

                .metric-card:hover {
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }

                .metric-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #262626;
                    margin-bottom: 4px;
                }

                .metric-label {
                    font-size: 12px;
                    color: #8e8e8e;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .instagram-analytics {
                        margin: 0;
                        border-radius: 0;
                    }
                    
                    .analytics-header {
                        padding: 16px;
                        flex-direction: column;
                        gap: 12px;
                    }
                    
                    .analytics-content {
                        padding: 16px;
                    }
                    
                    .kpi-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                    
                    .time-controls {
                        flex-wrap: wrap;
                    }

                    .stories-scroll {
                        padding: 0 0 12px 0;
                    }

                    .story-circle {
                        width: 60px;
                        height: 60px;
                        font-size: 18px;
                    }
                }

                /* Instagram-style loading shimmer */
                .shimmer {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }

                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            </style>

            <div class="instagram-analytics">
                <div class="analytics-header">
                    <h1>Analytics</h1>
                    <div class="live-indicator">
                        <div class="pulse"></div>
                        <span><span id="concurrent-users">${this.concurrentUsers}</span> active</span>
                    </div>
                </div>

                <!-- Instagram Stories-style Quick Stats -->
                <div class="analytics-content">
                    <div class="stories-scroll">
                        <div class="story-item" onclick="InstagramAnalyticsDashboard.switchTab('overview')">
                            <div class="story-circle">📊</div>
                            <div class="story-label">Overview</div>
                        </div>
                        <div class="story-item" onclick="InstagramAnalyticsDashboard.switchTab('users')">
                            <div class="story-circle">👥</div>
                            <div class="story-label">Users</div>
                        </div>
                        <div class="story-item" onclick="InstagramAnalyticsDashboard.switchTab('revenue')">
                            <div class="story-circle">💰</div>
                            <div class="story-label">Revenue</div>
                        </div>
                        <div class="story-item" onclick="InstagramAnalyticsDashboard.switchTab('engagement')">
                            <div class="story-circle">📈</div>
                            <div class="story-label">Growth</div>
                        </div>
                        <div class="story-item" onclick="InstagramAnalyticsDashboard.switchTab('performance')">
                            <div class="story-circle">⚡</div>
                            <div class="story-label">Speed</div>
                        </div>
                        <div class="story-item" onclick="InstagramAnalyticsDashboard.switchTab('acquisition')">
                            <div class="story-circle">🎯</div>
                            <div class="story-label">Goals</div>
                        </div>
                    </div>
                </div>

                <div class="analytics-tabs">
                    <button class="analytics-tab active" data-tab="overview">📊 Overview</button>
                    <button class="analytics-tab" data-tab="users">👥 Users</button>
                    <button class="analytics-tab" data-tab="revenue">💰 Revenue</button>
                    <button class="analytics-tab" data-tab="engagement">📈 Engagement</button>
                    <button class="analytics-tab" data-tab="performance">⚡ Performance</button>
                    <button class="analytics-tab" data-tab="acquisition">🎯 Acquisition</button>
                </div>

                <div class="analytics-content">
                    <div class="time-controls">
                        <button class="time-btn" data-period="today">Today</button>
                        <button class="time-btn active" data-period="7days">7D</button>
                        <button class="time-btn" data-period="30days">30D</button>
                        <button class="time-btn" data-period="90days">90D</button>
                        <button class="time-btn" data-period="1year">1Y</button>
                        <button class="time-btn" data-period="custom">Custom</button>
                    </div>

                    <!-- Overview Tab -->
                    <div id="overview" class="tab-content">
                        <div class="kpi-grid">
                            <div class="kpi-card">
                                <div class="kpi-header">
                                    <div class="kpi-title">Monthly Revenue</div>
                                    <div class="kpi-icon">💰</div>
                                </div>
                                <div class="kpi-value">$125.4K</div>
                                <div class="kpi-change positive">↗ +15.2% vs last month</div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 82%"></div>
                                </div>
                                <div style="margin-top: 12px; font-size: 12px; color: #8e8e8e;">82% of $150K goal</div>
                            </div>

                            <div class="kpi-card">
                                <div class="kpi-header">
                                    <div class="kpi-title">Total Users</div>
                                    <div class="kpi-icon">👥</div>
                                </div>
                                <div class="kpi-value">15,420</div>
                                <div class="kpi-change positive">↗ +8.7% (1,234 new)</div>
                                <div style="margin-top: 16px; font-size: 12px;">
                                    <span style="color: #22c55e;">●</span> New: 3,247 
                                    <span style="color: #3b82f6; margin-left: 12px;">●</span> Returning: 12,173
                                </div>
                            </div>

                            <div class="kpi-card">
                                <div class="kpi-header">
                                    <div class="kpi-title">Engagement Score</div>
                                    <div class="kpi-icon">📈</div>
                                </div>
                                <div class="kpi-value">7.8/10</div>
                                <div class="kpi-change positive">↗ +0.3 vs last period</div>
                                <div style="margin-top: 16px; font-size: 12px; color: #8e8e8e;">
                                    Avg Session: 4m 32s
                                </div>
                            </div>

                            <div class="kpi-card">
                                <div class="kpi-header">
                                    <div class="kpi-title">Conversion Rate
