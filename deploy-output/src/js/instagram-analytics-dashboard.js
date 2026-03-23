// Instagram-Inspired Advanced Analytics Dashboard Implementation
// Complete implementation based on provided design specifications

class InstagramAnalyticsDashboard {
    constructor() {
        this.currentTab = 'overview';
        this.currentPeriod = '7days';
        this.isLiveUpdating = true;
        this.activityFeedPaused = false;
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharts();
        this.startRealTimeUpdates();
        this.generateInitialActivity();
        this.setupStoryInteractions();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Time period controls
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changePeriod(e.target.dataset.period);
            });
        });

        // Activity feed controls
        const pauseBtn = document.getElementById('pause-feed');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.toggleActivityFeed();
            });
        }
    }

    setupStoryInteractions() {
        document.querySelectorAll('.story-item').forEach((story, index) => {
            story.addEventListener('click', () => {
                const tabs = ['overview', 'users', 'revenue', 'engagement', 'performance', 'acquisition'];
                if (tabs[index]) {
                    this.switchTab(tabs[index]);
                }
            });
        });
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) activeTab.classList.add('active');

        // Show/hide content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        const activeContent = document.getElementById(tabName);
        if (activeContent) {
            activeContent.classList.remove('hidden');
            activeContent.classList.add('fade-in');
        }

        this.currentTab = tabName;
        this.updateChartsForTab(tabName);
    }

    changePeriod(period) {
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-period="${period}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        this.currentPeriod = period;
        this.updateAllCharts();
        this.showToast(`Updated to ${this.formatPeriod(period)}`);
    }

    formatPeriod(period) {
        const formats = {
            'today': 'Today',
            '7days': '7 Days',
            '30days': '30 Days',
            '90days': '90 Days',
            '1year': '1 Year',
            'custom': 'Custom'
        };
        return formats[period] || period;
    }

    initializeCharts() {
        Chart.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
        Chart.defaults.color = '#888';
        Chart.defaults.borderColor = '#3a3a3a';
        Chart.defaults.backgroundColor = 'rgba(255,255,255,0.1)';
        
        // Growth Chart
        const growthCtx = document.getElementById('growthChart');
        if (growthCtx) {
            this.charts.growth = new Chart(growthCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                    datasets: [{
                        label: 'Users',
                        data: [8500, 9200, 11400, 12800, 14200, 15100, 15420],
                        borderColor: '#ffffff',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2
                    }, {
                        label: 'Revenue ($K)',
                        data: [78, 85, 92, 108, 118, 121, 125.4],
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { 
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 20,
                                color: '#e5e5e5'
                            }
                        }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true,
                            grid: {
                                color: '#3a3a3a'
                            },
                            ticks: {
                                color: '#888'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#888'
                            }
                        }
                    },
                    elements: {
                        point: {
                            radius: 4,
                            hoverRadius: 6
                        }
                    }
                }
            });
        }

        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx) {
            this.charts.revenue = new Chart(revenueCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Subscriptions', 'One-time', 'Add-ons', 'Enterprise'],
                    datasets: [{
                        data: [77.5, 18.2, 12.8, 16.9],
                        backgroundColor: ['#ffffff', '#b0b0b0', '#888888', '#666666'],
                        borderWidth: 0,
                        hoverBorderWidth: 2,
                        hoverBorderColor: '#1f1f1f'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { 
                            position: 'right',
                            labels: {
                                usePointStyle: true,
                                padding: 15,
                                color: '#e5e5e5'
                            }
                        }
                    },
                    cutout: '60%'
                }
            });
        }

        // Engagement Chart
        const engagementCtx = document.getElementById('engagementChart');
        if (engagementCtx) {
            this.charts.engagement = new Chart(engagementCtx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Sessions',
                        data: [2847, 3254, 3891, 4032, 3765, 2943, 2587],
                        backgroundColor: '#ffffff',
                        borderRadius: 4,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true,
                            grid: {
                                color: '#3a3a3a'
                            },
                            ticks: {
                                color: '#888'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#888'
                            }
                        }
                    }
                }
            });
        }

        // Performance Chart
        const performanceCtx = document.getElementById('performanceChart');
        if (performanceCtx) {
            this.charts.performance = new Chart(performanceCtx, {
                type: 'line',
                data: {
                    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                    datasets: [{
                        label: 'Load Time (s)',
                        data: [1.1, 0.9, 1.3, 1.5, 1.2, 1.0],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { 
                            display: false,
                            labels: {
                                color: '#e5e5e5'
                            }
                        }
                    },
                    scales: {
                        y: { 
                            beginAtZero: true,
                            grid: {
                                color: '#3a3a3a'
                            },
                            ticks: {
                                color: '#888'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#888'
                            }
                        }
                    },
                    elements: {
                        point: {
                            radius: 4,
                            hoverRadius: 6
                        }
                    }
                }
            });
        }

        // Acquisition Chart
        const acquisitionCtx = document.getElementById('acquisitionChart');
        if (acquisitionCtx) {
            this.charts.acquisition = new Chart(acquisitionCtx, {
                type: 'pie',
                data: {
                    labels: ['Organic Search', 'Social Media', 'Direct', 'Referral', 'Email', 'Paid'],
                    datasets: [{
                        data: [34.5, 28.2, 15.7, 12.3, 6.8, 2.5],
                        backgroundColor: [
                            '#ffffff',
                            '#d0d0d0',
                            '#a0a0a0',
                            '#808080',
                            '#606060',
                            '#404040'
                        ],
                        borderWidth: 0,
                        hoverBorderWidth: 2,
                        hoverBorderColor: '#1f1f1f'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 15,
                                color: '#e5e5e5'
                            }
                        }
                    }
                }
            });
        }
    }

    updateChartsForTab(tabName) {
        setTimeout(() => {
            Object.values(this.charts).forEach(chart => {
                if (chart && chart.canvas.offsetParent !== null) {
                    chart.resize();
                }
            });
        }, 150);
    }

    updateAllCharts() {
        const multiplier = this.getPeriodMultiplier();
        
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.data && chart.data.datasets) {
                chart.data.datasets.forEach(dataset => {
                    dataset.data = dataset.data.map(value => 
                        Math.round(value * multiplier * (0.8 + Math.random() * 0.4))
                    );
                });
                chart.update('none');
            }
        });
    }

    getPeriodMultiplier() {
        const multipliers = {
            'today': 0.1,
            '7days': 1.0,
            '30days': 3.2,
            '90days': 8.7,
            '1year': 12.5,
            'custom': 1.0
        };
        return multipliers[this.currentPeriod] || 1.0;
    }

    startRealTimeUpdates() {
        setInterval(() => {
            if (this.isLiveUpdating) {
                const users = document.getElementById('concurrent-users');
                const currentUsers = parseInt(users.textContent.replace(',', ''));
                const newUsers = currentUsers + Math.floor(Math.random() * 20 - 10);
                users.textContent = Math.max(1000, newUsers).toLocaleString();
            }
        }, 30000);

        setInterval(() => {
            if (this.isLiveUpdating && !this.activityFeedPaused) {
                this.addActivityItem();
            }
        }, 5000);
    }

    generateInitialActivity() {
        const activities = [
            { user: 'John D', action: 'completed onboarding', time: '2m' },
            { user: 'Sarah M', action: 'upgraded to Premium', time: '5m' },
            { user: 'Mike R', action: 'shared a report', time: '8m' },
            { user: 'Lisa K', action: 'created project', time: '12m' },
            { user: 'Tom B', action: 'exported data', time: '15m' },
            { user: 'Anna P', action: 'invited member', time: '18m' }
        ];

        const feed = document.getElementById('activity-feed');
        if (feed) {
            activities.forEach(activity => {
                this.createActivityItem(activity.user, activity.action, activity.time, feed);
            });
        }
    }

    addActivityItem() {
        const users = ['Alex T', 'Emma L', 'Chris W', 'Maya S', 'Jake H', 'Sophie R'];
        const actions = [
            'logged in',
            'completed milestone',
            'shared content',
            'updated profile',
            'created dashboard',
            'exported report'
        ];

        const user = users[Math.floor(Math.random() * users.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const feed = document.getElementById('activity-feed');

        if (feed) {
            this.createActivityItem(user, action, 'now', feed, true);
            
            const items = feed.querySelectorAll('.activity-item');
            if (items.length > 8) {
                items[items.length - 1].remove();
            }
        }
    }

    createActivityItem(user, action, time, container, prepend = false) {
        const item = document.createElement('div');
        item.className = 'activity-item';
        const initials = user.split(' ').map(n => n[0]).join('');
        
        item.innerHTML = `
            <div class="activity-avatar">${initials}</div>
            <div class="activity-content">
                <div class="activity-text"><strong>${user}</strong> ${action}</div>
                <div class="activity-time">${time} ago</div>
            </div>
        `;

        if (prepend) {
            container.insertBefore(item, container.firstChild);
            item.style.animation = 'fadeIn 0.3s ease-in';
        } else {
            container.appendChild(item);
        }
    }

    toggleActivityFeed() {
        this.activityFeedPaused = !this.activityFeedPaused;
        const btn = document.getElementById('pause-feed');
        if (btn) {
            btn.innerHTML = this.activityFeedPaused ? '▶ Play' : '⏸ Pause';
        }
        this.showToast(this.activityFeedPaused ? 'Feed paused' : 'Feed resumed');
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: linear-gradient(135deg, #2a2a2a, #1f1f1f);
            color: #e5e5e5;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 1000;
            font-size: 14px;
            font-weight: 500;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            border: 1px solid #3a3a3a;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // Main method to create the complete dashboard HTML
    createDashboard() {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Advanced Analytics Dashboard</title>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }

                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f0f0f 50%, #1f1f1f 75%, #0a0a0a 100%);
                        background-attachment: fixed;
                        min-height: 100vh;
                        color: #e5e5e5;
                    }

                    .dashboard-container {
                        max-width: 1200px;
                        margin: 0 auto;
                        background: rgba(20, 20, 20, 0.95);
                        backdrop-filter: blur(10px);
                        min-height: 100vh;
                        box-shadow: 0 0 40px rgba(0,0,0,0.5);
                        border-left: 1px solid rgba(255,255,255,0.1);
                        border-right: 1px solid rgba(255,255,255,0.1);
                    }

                    .header {
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

                    .header h1 {
                        font-size: 24px;
                        font-weight: 600;
                        color: #262626;
                        letter-spacing: -0.3px;
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

                    .tabs {
                        background: #ffffff;
                        border-bottom: 1px solid #dbdbdb;
                        padding: 0;
                        display: flex;
                        overflow-x: auto;
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                    }

                    .tabs::-webkit-scrollbar {
                        display: none;
                    }

                    .tab {
                        padding: 16px 24px;
                        cursor: pointer;
                        border-bottom: 2px solid transparent;
                        transition: all 0.2s ease;
                        white-space: nowrap;
                        display: flex;
                        align-items: center;
                        gap
