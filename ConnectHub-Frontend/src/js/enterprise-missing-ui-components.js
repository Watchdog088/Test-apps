/**
 * Enterprise Missing UI Components
 * 
 * This file contains the 4 missing UI interfaces for the Enterprise section:
 * 1. Advanced Analytics Dashboard - Detailed business metrics and performance reports
 * 2. Team Management Interface - Invite members, manage roles and permissions
 * 3. Enterprise Admin Panel - Advanced settings, API management, whitelabel config
 * 4. Content Moderation Dashboard - Review content, manage reports, user management
 */

class EnterpriseMissingUIComponents {
    constructor() {
        this.currentBusinessAccount = null;
        this.teamMembers = [];
        this.analyticsData = {};
        this.moderationQueue = [];
        this.init();
    }

    init() {
        // Initialize enterprise data and event listeners
        this.loadEnterpriseData();
        this.setupEventListeners();
    }

    loadEnterpriseData() {
        // Sample business account data
        this.currentBusinessAccount = {
            id: 'business_123',
            companyName: 'TechCorp Solutions',
            businessType: 'enterprise',
            industry: 'Technology',
            employeeCount: '201-500',
            isVerified: true,
            features: ['advanced_analytics', 'team_management', 'api_access', 'whitelabel', 'priority_support'],
            subscription: 'enterprise'
        };

        // Sample team members
        this.teamMembers = [
            { id: 1, name: 'Sarah Wilson', email: 'sarah@techcorp.com', role: 'admin', status: 'active', joinedAt: '2024-01-15', permissions: ['all'] },
            { id: 2, name: 'Mike Johnson', email: 'mike@techcorp.com', role: 'manager', status: 'active', joinedAt: '2024-02-20', permissions: ['content_management', 'analytics_view'] },
            { id: 3, name: 'Emma Davis', email: 'emma@techcorp.com', role: 'editor', status: 'active', joinedAt: '2024-03-10', permissions: ['content_create', 'content_edit'] },
            { id: 4, name: 'Alex Chen', email: 'alex@techcorp.com', role: 'viewer', status: 'pending', joinedAt: null, permissions: ['read_only'] }
        ];

        // Sample analytics data
        this.analyticsData = {
            overview: {
                totalUsers: 15420,
                activeUsers: 8950,
                engagement: 4.2,
                revenue: 125430,
                growth: 12.5
            },
            metrics: {
                userGrowth: [120, 135, 148, 162, 178, 195, 210],
                engagement: [3.8, 4.1, 3.9, 4.3, 4.2, 4.5, 4.2],
                revenue: [98000, 105000, 112000, 118000, 125430, 132000, 140000]
            }
        };

        // Sample moderation queue
        this.moderationQueue = [
            { id: 1, type: 'post', content: 'This is a sample post that needs review...', reporter: 'user@example.com', reason: 'spam', status: 'pending', timestamp: '2024-12-07 14:30' },
            { id: 2, type: 'user', content: 'User profile: suspicious activity detected', reporter: 'system', reason: 'suspicious_activity', status: 'pending', timestamp: '2024-12-07 13:45' },
            { id: 3, type: 'message', content: 'Inappropriate message in group chat', reporter: 'moderator@example.com', reason: 'harassment', status: 'reviewing', timestamp: '2024-12-07 12:20' }
        ];
    }

    setupEventListeners() {
        // Global event listeners for enterprise modals
        document.addEventListener('click', (e) => {
            if (e.target.matches('.close-modal')) {
                this.closeModal(e.target.closest('.enterprise-modal'));
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.enterprise-modal.active').forEach(modal => {
                    this.closeModal(modal);
                });
            }
        });
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    // 1. ADVANCED ANALYTICS DASHBOARD
    showAdvancedAnalyticsDashboard() {
        const modal = document.createElement('div');
        modal.className = 'enterprise-modal analytics-dashboard-modal active';
        modal.innerHTML = `
            <div class="enterprise-modal-overlay">
                <div class="enterprise-modal-content large-modal">
                    <div class="modal-header">
                        <h2>📊 Advanced Analytics Dashboard</h2>
                        <p>Comprehensive business insights and performance metrics</p>
                        <button class="close-modal">×</button>
                    </div>

                    <div class="analytics-dashboard">
                        <!-- Dashboard Header -->
                        <div class="dashboard-header">
                            <div class="time-range-selector">
                                <button class="time-btn active" onclick="enterpriseUI.loadAnalytics('week')">7 Days</button>
                                <button class="time-btn" onclick="enterpriseUI.loadAnalytics('month')">30 Days</button>
                                <button class="time-btn" onclick="enterpriseUI.loadAnalytics('quarter')">90 Days</button>
                                <button class="time-btn" onclick="enterpriseUI.loadAnalytics('year')">1 Year</button>
                            </div>
                            <div class="dashboard-actions">
                                <button class="btn btn-secondary" onclick="enterpriseUI.exportAnalytics()">📄 Export PDF</button>
                                <button class="btn btn-secondary" onclick="enterpriseUI.scheduleReport()">📅 Schedule Report</button>
                                <button class="btn btn-primary" onclick="enterpriseUI.generateCustomReport()">🔧 Custom Report</button>
                            </div>
                        </div>

                        <!-- Key Metrics Overview -->
                        <div class="metrics-overview">
                            <div class="metric-card">
                                <div class="metric-icon">👥</div>
                                <div class="metric-content">
                                    <div class="metric-value">${this.analyticsData.overview.totalUsers.toLocaleString()}</div>
                                    <div class="metric-label">Total Users</div>
                                    <div class="metric-change positive">+${this.analyticsData.overview.growth}%</div>
                                </div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-icon">⚡</div>
                                <div class="metric-content">
                                    <div class="metric-value">${this.analyticsData.overview.activeUsers.toLocaleString()}</div>
                                    <div class="metric-label">Active Users</div>
                                    <div class="metric-change positive">+8.2%</div>
                                </div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-icon">📈</div>
                                <div class="metric-content">
                                    <div class="metric-value">${this.analyticsData.overview.engagement}</div>
                                    <div class="metric-label">Avg Engagement</div>
                                    <div class="metric-change positive">+2.1%</div>
                                </div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-icon">💰</div>
                                <div class="metric-content">
                                    <div class="metric-value">$${this.analyticsData.overview.revenue.toLocaleString()}</div>
                                    <div class="metric-label">Monthly Revenue</div>
                                    <div class="metric-change positive">+15.3%</div>
                                </div>
                            </div>
                        </div>

                        <!-- Analytics Charts -->
                        <div class="analytics-charts">
                            <div class="chart-section">
                                <div class="chart-card">
                                    <div class="chart-header">
                                        <h3>📊 User Growth Trend</h3>
                                        <select class="chart-filter">
                                            <option value="daily">Daily</option>
                                            <option value="weekly" selected>Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                    <div class="chart-container">
                                        <canvas id="userGrowthChart"></canvas>
                                    </div>
                                    <div class="chart-insights">
                                        <div class="insight">📈 25% increase in new user registrations</div>
                                        <div class="insight">🎯 Peak signup time: 2-4 PM EST</div>
                                    </div>
                                </div>

                                <div class="chart-card">
                                    <div class="chart-header">
                                        <h3>💰 Revenue Analytics</h3>
                                        <div class="chart-legends">
                                            <span class="legend-item"><span class="legend-color primary"></span>Subscription</span>
                                            <span class="legend-item"><span class="legend-color secondary"></span>Ads</span>
                                            <span class="legend-item"><span class="legend-color accent"></span>Premium</span>
                                        </div>
                                    </div>
                                    <div class="chart-container">
                                        <canvas id="revenueChart"></canvas>
                                    </div>
                                    <div class="revenue-breakdown">
                                        <div class="breakdown-item">
                                            <div class="breakdown-label">Subscription Revenue</div>
                                            <div class="breakdown-value">$85,230 (68%)</div>
                                        </div>
                                        <div class="breakdown-item">
                                            <div class="breakdown-label">Ad Revenue</div>
                                            <div class="breakdown-value">$28,100 (22%)</div>
                                        </div>
                                        <div class="breakdown-item">
                                            <div class="breakdown-label">Premium Features</div>
                                            <div class="breakdown-value">$12,100 (10%)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="chart-section">
                                <div class="chart-card">
                                    <div class="chart-header">
                                        <h3>🌍 Geographic Distribution</h3>
                                        <button class="btn btn-small" onclick="enterpriseUI.showDetailedGeographics()">View Details</button>
                                    </div>
                                    <div class="geographic-data">
                                        <div class="geo-item">
                                            <div class="geo-country">🇺🇸 United States</div>
                                            <div class="geo-bar">
                                                <div class="geo-fill" style="width: 45%"></div>
                                            </div>
                                            <div class="geo-percentage">45%</div>
                                        </div>
                                        <div class="geo-item">
                                            <div class="geo-country">🇨🇦 Canada</div>
                                            <div class="geo-bar">
                                                <div class="geo-fill" style="width: 18%"></div>
                                            </div>
                                            <div class="geo-percentage">18%</div>
                                        </div>
                                        <div class="geo-item">
                                            <div class="geo-country">🇬🇧 United Kingdom</div>
                                            <div class="geo-bar">
                                                <div class="geo-fill" style="width: 12%"></div>
                                            </div>
                                            <div class="geo-percentage">12%</div>
                                        </div>
                                        <div class="geo-item">
                                            <div class="geo-country">🇩🇪 Germany</div>
                                            <div class="geo-bar">
                                                <div class="geo-fill" style="width: 8%"></div>
                                            </div>
                                            <div class="geo-percentage">8%</div>
                                        </div>
                                        <div class="geo-item">
                                            <div class="geo-country">🌏 Other</div>
                                            <div class="geo-bar">
                                                <div class="geo-fill" style="width: 17%"></div>
                                            </div>
                                            <div class="geo-percentage">17%</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="chart-card">
                                    <div class="chart-header">
                                        <h3>⏱️ User Behavior Insights</h3>
                                        <div class="behavior-tabs">
                                            <button class="tab-btn active" data-tab="engagement">Engagement</button>
                                            <button class="tab-btn" data-tab="retention">Retention</button>
                                            <button class="tab-btn" data-tab="conversion">Conversion</button>
                                        </div>
                                    </div>
                                    <div class="behavior-content" id="engagement-tab">
                                        <div class="behavior-metric">
                                            <div class="metric-title">Average Session Duration</div>
                                            <div class="metric-value-large">24m 32s</div>
                                            <div class="metric-trend positive">↑ 12% from last month</div>
                                        </div>
                                        <div class="behavior-metric">
                                            <div class="metric-title">Page Views per Session</div>
                                            <div class="metric-value-large">8.4</div>
                                            <div class="metric-trend positive">↑ 5% from last month</div>
                                        </div>
                                        <div class="behavior-metric">
                                            <div class="metric-title">Bounce Rate</div>
                                            <div class="metric-value-large">32%</div>
                                            <div class="metric-trend negative">↓ 8% from last month</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Advanced Reports Section -->
                        <div class="advanced-reports">
                            <div class="reports-header">
                                <h3>📋 Advanced Reports</h3>
                                <button class="btn btn-primary" onclick="enterpriseUI.createCustomReport()">+ Create Report</button>
                            </div>
                            <div class="reports-grid">
                                <div class="report-card">
                                    <div class="report-icon">📊</div>
                                    <div class="report-content">
                                        <div class="report-title">User Acquisition Report</div>
                                        <div class="report-description">Detailed analysis of user acquisition channels</div>
                                        <div class="report-stats">
                                            <span>Generated: Today</span>
                                            <span>Status: Ready</span>
                                        </div>
                                    </div>
                                    <div class="report-actions">
                                        <button class="btn btn-small" onclick="enterpriseUI.downloadReport('acquisition')">📄 Download</button>
                                        <button class="btn btn-small btn-secondary" onclick="enterpriseUI.scheduleReport('acquisition')">📅 Schedule</button>
                                    </div>
                                </div>
                                <div class="report-card">
                                    <div class="report-icon">💰</div>
                                    <div class="report-content">
                                        <div class="report-title">Revenue Analysis</div>
                                        <div class="report-description">Comprehensive revenue breakdown and forecasting</div>
                                        <div class="report-stats">
                                            <span>Generated: 2 hours ago</span>
                                            <span>Status: Ready</span>
                                        </div>
                                    </div>
                                    <div class="report-actions">
                                        <button class="btn btn-small" onclick="enterpriseUI.downloadReport('revenue')">📄 Download</button>
                                        <button class="btn btn-small btn-secondary" onclick="enterpriseUI.scheduleReport('revenue')">📅 Schedule</button>
                                    </div>
                                </div>
                                <div class="report-card">
                                    <div class="report-icon">👥</div>
                                    <div class="report-content">
                                        <div class="report-title">Engagement Metrics</div>
                                        <div class="report-description">Deep dive into user engagement patterns</div>
                                        <div class="report-stats">
                                            <span>Generated: Yesterday</span>
                                            <span>Status: Ready</span>
                                        </div>
                                    </div>
                                    <div class="report-actions">
                                        <button class="btn btn-small" onclick="enterpriseUI.downloadReport('engagement')">📄 Download</button>
                                        <button class="btn btn-small btn-secondary" onclick="enterpriseUI.scheduleReport('engagement')">📅 Schedule</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Initialize charts after modal is rendered
        setTimeout(() => this.initializeAnalyticsCharts(), 100);
    }

    // 2. TEAM MANAGEMENT INTERFACE
    showTeamManagementInterface() {
        const modal = document.createElement('div');
        modal.className = 'enterprise-modal team-management-modal active';
        modal.innerHTML = `
            <div class="enterprise-modal-overlay">
                <div class="enterprise-modal-content large-modal">
                    <div class="modal-header">
                        <h2>👥 Team Management</h2>
                        <p>Manage team members, roles, and permissions</p>
                        <button class="close-modal">×</button>
                    </div>

                    <div class="team-management">
                        <!-- Team Header -->
                        <div class="team-header">
                            <div class="team-stats">
                                <div class="stat-item">
                                    <div class="stat-value">${this.teamMembers.length}</div>
                                    <div class="stat-label">Total Members</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${this.teamMembers.filter(m => m.status === 'active').length}</div>
                                    <div class="stat-label">Active</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${this.teamMembers.filter(m => m.status === 'pending').length}</div>
                                    <div class="stat-label">Pending</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">5</div>
                                    <div class="stat-label">Remaining Slots</div>
                                </div>
                            </div>
                            <div class="team-actions">
                                <button class="btn btn-primary" onclick="enterpriseUI.showInviteMemberModal()">👋 Invite Member</button>
                                <button class="btn btn-secondary" onclick="enterpriseUI.exportTeamData()">📄 Export List</button>
                                <button class="btn btn-secondary" onclick="enterpriseUI.showBulkActions()">⚙️ Bulk Actions</button>
                            </div>
                        </div>

                        <!-- Team Members List -->
                        <div class="team-members-section">
                            <div class="section-header">
                                <h3>Team Members</h3>
                                <div class="members-filters">
                                    <select class="filter-select" onchange="enterpriseUI.filterTeamMembers(this.value)">
                                        <option value="all">All Members</option>
                                        <option value="active">Active Only</option>
                                        <option value="pending">Pending Invites</option>
                                        <option value="admin">Admins</option>
                                        <option value="manager">Managers</option>
                                    </select>
                                    <input type="text" class="search-input" placeholder="Search members..." 
                                           onkeyup="enterpriseUI.searchTeamMembers(this.value)">
                                </div>
                            </div>

                            <div class="members-list">
                                ${this.teamMembers.map(member => `
                                    <div class="member-card ${member.status}" data-member-id="${member.id}">
                                        <div class="member-info">
                                            <div class="member-avatar">
                                                <div class="avatar-circle">${member.name.split(' ').map(n => n[0]).join('')}</div>
                                                <div class="status-indicator ${member.status}"></div>
                                            </div>
                                            <div class="member-details">
                                                <div class="member-name">${member.name}</div>
                                                <div class="member-email">${member.email}</div>
                                                <div class="member-meta">
                                                    <span class="role-badge ${member.role}">${member.role.charAt(0).toUpperCase() + member.role.slice(1)}</span>
                                                    <span class="join-date">Joined: ${member.joinedAt || 'Pending'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="member-actions">
                                            <button class="action-btn" onclick="enterpriseUI.showMemberDetails(${member.id})" title="View Details">👁️</button>
                                            <button class="action-btn" onclick="enterpriseUI.showEditMember(${member.id})" title="Edit Member">✏️</button>
                                            <button class="action-btn" onclick="enterpriseUI.showMemberPermissions(${member.id})" title="Manage Permissions">🔐</button>
                                            ${member.status === 'pending' ? 
                                                `<button class="action-btn resend" onclick="enterpriseUI.resendInvitation(${member.id})" title="Resend Invitation">📧</button>` : 
                                                ''
                                            }
                                            <button class="action-btn danger" onclick="enterpriseUI.removeMember(${member.id})" title="Remove Member">🗑️</button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Role & Permissions Overview -->
                        <div class="roles-permissions-section">
                            <div class="section-header">
                                <h3>Roles & Permissions</h3>
                                <button class="btn btn-secondary" onclick="enterpriseUI.showCreateCustomRole()">+ Create Custom Role</button>
                            </div>
                            
                            <div class="roles-grid">
                                <div class="role-card owner">
                                    <div class="role-header">
                                        <div class="role-icon">👑</div>
                                        <div class="role-title">Owner</div>
                                    </div>
                                    <div class="role-description">Full system access and billing management</div>
                                    <div class="role-permissions">
                                        <span class="permission-badge">All Permissions</span>
                                    </div>
                                    <div class="role-count">1 member</div>
                                </div>

                                <div class="role-card admin">
                                    <div class="role-header">
                                        <div class="role-icon">⚡</div>
                                        <div class="role-title">Admin</div>
                                    </div>
                                    <div class="role-description">Manage users, content, and system settings</div>
                                    <div class="role-permissions">
                                        <span class="permission-badge">User Management</span>
                                        <span class="permission-badge">Content Control</span>
                                        <span class="permission-badge">Analytics Access</span>
                                    </div>
                                    <div class="role-count">${this.teamMembers.filter(m => m.role === 'admin').length} members</div>
                                </div>

                                <div class="role-card manager">
                                    <div class="role-header">
                                        <div class="role-icon">📊</div>
                                        <div class="role-title">Manager</div>
                                    </div>
                                    <div class="role-description">Content management and team collaboration</div>
                                    <div class="role-permissions">
                                        <span class="permission-badge">Content Management</span>
                                        <span class="permission-badge">Team Collaboration</span>
                                        <span class="permission-badge">Reports Access</span>
                                    </div>
                                    <div class="role-count">${this.teamMembers.filter(m => m.role === 'manager').length} members</div>
                                </div>

                                <div class="role-card editor">
                                    <div class="role-header">
                                        <div class="role-icon">✏️</div>
                                        <div class="role-title">Editor</div>
                                    </div>
                                    <div class="role-description">Create and edit content, limited admin access</div>
                                    <div class="role-permissions">
                                        <span class="permission-badge">Content Creation</span>
                                        <span class="permission-badge">Content Editing</span>
                                    </div>
                                    <div class="role-count">${this.teamMembers.filter(m => m.role === 'editor').length} members</div>
                                </div>

                                <div class="role-card viewer">
                                    <div class="role-header">
                                        <div class="role-icon">👁️</div>
                                        <div class="role-title">Viewer</div>
                                    </div>
                                    <div class="role-description">Read-only access to content and basic features</div>
                                    <div class="role-permissions">
                                        <span class="permission-badge">View Only</span>
                                        <span class="permission-badge">Basic Features</span>
                                    </div>
                                    <div class="role-count">${this.teamMembers.filter(m => m.role === 'viewer').length} members</div>
                                </div>
                            </div>
                        </div>

                        <!-- Recent Activity -->
                        <div class="team-activity-section">
                            <div class="section-header">
                                <h3>Recent Team Activity</h3>
                                <button class="btn btn-small" onclick="enterpriseUI.showFullActivityLog()">View All</button>
                            </div>
                            <div class="activity-timeline">
                                <div class="activity-item">
                                    <div class="activity-icon">👋</div>
                                    <div class="activity-content">
                                        <div class="activity-text"><strong>Sarah Wilson</strong> invited <strong>Alex Chen</strong> to the team</div>
                                        <div class="activity-time">2 hours ago</div>
                                    </div>
                                </div>
                                <div class="activity-item">
                                    <div class="activity-icon">🔐</div>
                                    <div class="activity-content">
                                        <div class="activity-text"><strong>Mike Johnson</strong> was promoted to Manager role</div>
                                        <div class="activity-time">1 day ago</div>
                                    </div>
                                </div>
                                <div class="activity-item">
                                    <div class="activity-icon">✅</div>
                                    <div class="activity-content">
                                        <div class="activity-text"><strong>Emma Davis</strong> accepted team invitation</div>
                                        <div class="activity-time">3 days ago</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // 3. ENTERPRISE ADMIN PANEL
    showEnterpriseAdminPanel() {
        const modal = document.createElement('div');
        modal.className = 'enterprise-modal admin-panel-modal active';
        modal.innerHTML = `
            <div class="enterprise-modal-overlay">
                <div class="enterprise-modal-content extra-large-modal">
                    <div class="modal-header">
                        <h2>⚙️ Enterprise Admin Panel</h2>
                        <p>Advanced settings, API management, and system configuration</p>
                        <button class="close-modal">×</button>
                    </div>

                    <div class="admin-panel">
                        <!-- Admin Navigation -->
                        <div class="admin-nav">
                            <div class="nav-section">
                                <div class="nav-title">System</div>
                                <button class="nav-btn active" onclick="enterpriseUI.showAdminSection('general')">⚙️ General Settings</button>
                                <button class="nav-btn" onclick="enterpriseUI.showAdminSection('api')">🔌 API Management</button>
                                <button class="nav-btn" onclick="enterpriseUI.showAdminSection('whitelabel')">🎨 Whitelabel Config</button>
                                <button class="nav-btn" onclick="enterpriseUI.showAdminSection('security')">🔒 Security</button>
                            </div>
                            <div class="nav-section">
                                <div class="nav-title">Business</div>
                                <button class="nav-btn" onclick="enterpriseUI.showAdminSection('billing')">💳 Billing & Plans</button>
                                <button class="nav-btn" onclick="enterpriseUI.showAdminSection('integrations')">🔗 Integrations</button>
                                <button class="nav-btn" onclick="enterpriseUI.showAdminSection('compliance')">📋 Compliance</button>
                            </div>
                        </div>

                        <!-- Admin Content -->
                        <div class="admin-content">
                            <div class="admin-section active" id="general-section">
                                <div class="section-header">
                                    <h3>⚙️ General Settings</h3>
                                    <p>Configure basic business account settings</p>
                                </div>

                                <div class="settings-grid">
                                    <div class="setting-card">
                                        <div class="setting-header">
                                            <h4>Business Information</h4>
                                            <button class="btn btn-small" onclick="enterpriseUI.editBusinessInfo()">✏️ Edit</button>
                                        </div>
                                        <div class="setting-content">
                                            <div class="info-item">
                                                <label>Company Name</label>
                                                <span>${this.currentBusinessAccount.companyName}</span>
                                            </div>
                                            <div class="info-item">
                                                <label>Industry</label>
                                                <span>${this.currentBusinessAccount.industry}</span>
                                            </div>
                                            <div class="info-item">
                                                <label>Business Type</label>
                                                <span>${this.currentBusinessAccount.businessType}</span>
                                            </div>
                                            <div class="info-item">
                                                <label>Employee Count</label>
                                                <span>${this.currentBusinessAccount.employeeCount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="setting-card">
                                        <div class="setting-header">
                                            <h4>API Keys & Access</h4>
                                            <button class="btn btn-small" onclick="enterpriseUI.generateAPIKey()">🔑 Generate Key</button>
                                        </div>
                                        <div class="setting-content">
                                            <div class="api-key-item">
                                                <label>Production API Key</label>
                                                <div class="key-display">
                                                    <span class="key-value">ck_1a2b3c4d5e6f7g8h9i0j...</span>
                                                    <button class="btn btn-small" onclick="enterpriseUI.copyAPIKey()">📋 Copy</button>
                                                </div>
                                            </div>
                                            <div class="api-stats">
                                                <span>Rate Limit: 10,000/hour</span>
                                                <span>Last Used: 2 hours ago</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="setting-card">
                                        <div class="setting-header">
                                            <h4>Whitelabel Configuration</h4>
                                            <button class="btn btn-small" onclick="enterpriseUI.configureWhitelabel()">🎨 Configure</button>
                                        </div>
                                        <div class="setting-content">
                                            <div class="whitelabel-preview">
                                                <div class="preview-item">
                                                    <div class="color-swatch" style="background: #007bff;"></div>
                                                    <span>Primary Color: #007bff</span>
                                                </div>
                                                <div class="preview-item">
                                                    <div class="logo-preview">🏢</div>
                                                    <span>Custom Logo: Uploaded</span>
                                                </div>
                                                <div class="preview-item">
                                                    <span>Custom Domain: app.techcorp.com</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // 4. CONTENT MODERATION DASHBOARD
    showContentModerationDashboard() {
        const modal = document.createElement('div');
        modal.className = 'enterprise-modal moderation-dashboard-modal active';
        modal.innerHTML = `
            <div class="enterprise-modal-overlay">
                <div class="enterprise-modal-content extra-large-modal">
                    <div class="modal-header">
                        <h2>🛡️ Content Moderation Dashboard</h2>
                        <p>Review reported content, manage users, and maintain platform safety</p>
                        <button class="close-modal">×</button>
                    </div>

                    <div class="moderation-dashboard">
                        <!-- Moderation Header -->
                        <div class="moderation-header">
                            <div class="moderation-stats">
                                <div class="stat-card pending">
                                    <div class="stat-icon">⏳</div>
                                    <div class="stat-content">
                                        <div class="stat-value">${this.moderationQueue.filter(item => item.status === 'pending').length}</div>
                                        <div class="stat-label">Pending Review</div>
                                    </div>
                                </div>
                                <div class="stat-card reviewing">
                                    <div class="stat-icon">👁️</div>
                                    <div class="stat-content">
                                        <div class="stat-value">${this.moderationQueue.filter(item => item.status === 'reviewing').length}</div>
                                        <div class="stat-label">Under Review</div>
                                    </div>
                                </div>
                                <div class="stat-card resolved">
                                    <div class="stat-icon">✅</div>
                                    <div class="stat-content">
                                        <div class="stat-value">47</div>
                                        <div class="stat-label">Resolved Today</div>
                                    </div>
                                </div>
                                <div class="stat-card priority">
                                    <div class="stat-icon">🚨</div>
                                    <div class="stat-content">
                                        <div class="stat-value">3</div>
                                        <div class="stat-label">High Priority</div>
                                    </div>
                                </div>
                            </div>
                            <div class="moderation-actions">
                                <button class="btn btn-secondary" onclick="enterpriseUI.exportModerationReport()">📄 Export Report</button>
                                <button class="btn btn-secondary" onclick="enterpriseUI.showModerationSettings()">⚙️ Settings</button>
                                <button class="btn btn-primary" onclick="enterpriseUI.showBulkModerationActions()">⚡ Bulk Actions</button>
                            </div>
                        </div>

                        <!-- Moderation Queue -->
                        <div class="moderation-queue">
                            <div class="queue-header">
                                <h3>Content Review Queue</h3>
                                <div class="queue-filters">
                                    <select class="filter-select" onchange="enterpriseUI.filterModerationQueue(this.value)">
                                        <option value="all">All Reports</option>
                                        <option value="pending">Pending Review</option>
                                        <option value="high-priority">High Priority</option>
                                        <option value="spam">Spam Reports</option>
                                        <option value="harassment">Harassment</option>
                                        <option value="inappropriate">Inappropriate Content</option>
                                    </select>
                                    <select class="sort-select" onchange="enterpriseUI.sortModerationQueue(this.value)">
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="priority">Priority</option>
                                    </select>
                                </div>
                            </div>

                            <div class="moderation-list">
                                ${this.moderationQueue.map(item => `
                                    <div class="moderation-item ${item.status}" data-item-id="${item.id}">
                                        <div class="item-header">
                                            <div class="item-type">
                                                <span class="type-badge ${item.type}">${item.type.toUpperCase()}</span>
                                                <span class="reason-badge">${item.reason.replace('_', ' ').toUpperCase()}</span>
                                            </div>
                                            <div class="item-meta">
                                                <span class="timestamp">${item.timestamp}</span>
                                                <span class="reporter">Reported by: ${item.reporter}</span>
                                            </div>
                                        </div>
                                        
                                        <div class="item-content">
                                            <div class="content-preview">
                                                ${item.content}
                                            </div>
                                            <div class="content-actions">
                                                <button class="btn btn-small" onclick="enterpriseUI.viewFullContent(${item.id})">👁️ View Full</button>
                                                <button class="btn btn-small" onclick="enterpriseUI.viewUserProfile(${item.id})">👤 User Profile</button>
                                                <button class="btn btn-small" onclick="enterpriseUI.viewReportHistory(${item.id})">📋 History</button>
                                            </div>
                                        </div>

                                        <div class="item-actions">
                                            <div class="action-group">
                                                <button class="btn btn-success btn-small" onclick="enterpriseUI.approveContent(${item.id})">✅ Approve</button>
                                                <button class="btn btn-warning btn-small" onclick="enterpriseUI.requestMoreInfo(${item.id})">❓ Need Info</button>
                                                <button class="btn btn-danger btn-small" onclick="enterpriseUI.rejectContent(${item.id})">❌ Reject</button>
                                            </div>
                                            <div class="severity-actions">
                                                <button class="btn btn-secondary btn-small" onclick="enterpriseUI.hideContent(${item.id})">👁️‍🗨️ Hide</button>
                                                <button class="btn btn-secondary btn-small" onclick="enterpriseUI.warnUser(${item.id})">⚠️ Warn User</button>
                                                <button class="btn btn-danger btn-small" onclick="enterpriseUI.suspendUser(${item.id})">🚫 Suspend</button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Moderation Analytics -->
                        <div class="moderation-analytics">
                            <div class="analytics-header">
                                <h3>Moderation Analytics</h3>
                                <div class="time-filter">
                                    <button class="time-btn active" onclick="enterpriseUI.loadModerationAnalytics('week')">7 Days</button>
                                    <button class="time-btn" onclick="enterpriseUI.loadModerationAnalytics('month')">30 Days</button>
                                    <button class="time-btn" onclick="enterpriseUI.loadModerationAnalytics('quarter')">90 Days</button>
                                </div>
                            </div>

                            <div class="analytics-grid">
                                <div class="analytics-card">
                                    <div class="card-header">
                                        <h4>📊 Report Volume</h4>
                                    </div>
                                    <div class="card-content">
                                        <div class="volume-chart">
                                            <div class="chart-bar" style="height: 60%;" title="Monday: 12 reports"></div>
                                            <div class="chart-bar" style="height: 80%;" title="Tuesday: 16 reports"></div>
                                            <div class="chart-bar" style="height: 40%;" title="Wednesday: 8 reports"></div>
                                            <div class="chart-bar" style="height: 90%;" title="Thursday: 18 reports"></div>
                                            <div class="chart-bar" style="height: 70%;" title="Friday: 14 reports"></div>
                                            <div class="chart-bar" style="height: 50%;" title="Saturday: 10 reports"></div>
                                            <div class="chart-bar" style="height: 30%;" title="Sunday: 6 reports"></div>
                                        </div>
                                        <div class="chart-labels">
                                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="analytics-card">
                                    <div class="card-header">
                                        <h4>🎯 Report Categories</h4>
                                    </div>
                                    <div class="card-content">
                                        <div class="category-breakdown">
                                            <div class="category-item">
                                                <div class="category-label">Spam</div>
                                                <div class="category-bar">
                                                    <div class="category-fill" style="width: 45%;"></div>
                                                </div>
                                                <div class="category-value">45%</div>
                                            </div>
                                            <div class="category-item">
                                                <div class="category-label">Harassment</div>
                                                <div class="category-bar">
                                                    <div class="category-fill" style="width: 25%;"></div>
                                                </div>
                                                <div class="category-value">25%</div>
                                            </div>
                                            <div class="category-item">
                                                <div class="category-label">Inappropriate</div>
                                                <div class="category-bar">
                                                    <div class="category-fill" style="width: 20%;"></div>
                                                </div>
                                                <div class="category-value">20%</div>
                                            </div>
                                            <div class="category-item">
                                                <div class="category-label">Other</div>
                                                <div class="category-bar">
                                                    <div class="category-fill" style="width: 10%;"></div>
                                                </div>
                                                <div class="category-value">10%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="analytics-card">
                                    <div class="card-header">
                                        <h4>⚡ Response Time</h4>
                                    </div>
                                    <div class="card-content">
                                        <div class="response-metrics">
                                            <div class="metric-item">
                                                <div class="metric-label">Average Response Time</div>
                                                <div class="metric-value">2h 15m</div>
                                                <div class="metric-trend positive">↓ 23% from last week</div>
                                            </div>
                                            <div class="metric-item">
                                                <div class="metric-label">Fastest Response</div>
                                                <div class="metric-value">8 minutes</div>
                                            </div>
                                            <div class="metric-item">
                                                <div class="metric-label">Resolution Rate</div>
                                                <div class="metric-value">94.2%</div>
                                                <div class="metric-trend positive">↑ 5% from last week</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // SUPPORTING METHODS FOR ALL INTERFACES

    // Analytics Methods
    initializeAnalyticsCharts() {
        // Initialize sample charts - in production this would use actual chart library
        console.log('Analytics charts initialized');
        showToast('📊 Analytics dashboard loaded successfully!', 'success');
    }

    loadAnalytics(period) {
        showToast(`📈 Loading analytics for ${period}...`, 'info');
        // Update time buttons
        document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }

    exportAnalytics() {
        showToast('📄 Exporting analytics report...', 'success');
    }

    scheduleReport() {
        showToast('📅 Report scheduling interface opened!', 'info');
    }

    generateCustomReport() {
        showToast('🔧 Custom report builder opened!', 'info');
    }

    downloadReport(type) {
        showToast(`📄 Downloading ${type} report...`, 'success');
    }

    createCustomReport() {
        showToast('📋 Custom report creation opened!', 'info');
    }

    showDetailedGeographics() {
        showToast('🌍 Detailed geographic analytics opened!', 'info');
    }

    // Team Management Methods
    showInviteMemberModal() {
        showToast('👋 Team member invitation form opened!', 'info');
    }

    exportTeamData() {
        showToast('📄 Exporting team member list...', 'success');
    }

    showBulkActions() {
        showToast('⚙️ Bulk action menu opened!', 'info');
    }

    filterTeamMembers(filter) {
        showToast(`🔍 Filtering team members by: ${filter}`, 'info');
    }

    searchTeamMembers(query) {
        if (query) {
            showToast(`🔍 Searching for: ${query}`, 'info');
        }
    }

    showMemberDetails(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        showToast(`👁️ Viewing details for ${member?.name}`, 'info');
    }

    showEditMember(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        showToast(`✏️ Editing ${member?.name}`, 'info');
    }

    showMemberPermissions(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        showToast(`🔐 Managing permissions for ${member?.name}`, 'info');
    }

    resendInvitation(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        showToast(`📧 Resending invitation to ${member?.name}`, 'success');
    }

    removeMember(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        if (confirm(`Are you sure you want to remove ${member?.name} from the team?`)) {
            showToast(`🗑️ ${member?.name} removed from team`, 'success');
        }
    }

    showCreateCustomRole() {
        showToast('🔧 Custom role creation opened!', 'info');
    }

    showFullActivityLog() {
        showToast('📋 Full activity log opened!', 'info');
    }

    // Admin Panel Methods
    showAdminSection(section) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        
        // Show selected section
        const sectionElement = document.getElementById(`${section}-section`);
        if (sectionElement) {
            sectionElement.classList.add('active');
        }
        
        // Update active nav button
        event.target.classList.add('active');
        
        showToast(`⚙️ Switched to ${section} settings`, 'info');
    }

    editBusinessInfo() {
        showToast('✏️ Business information editor opened!', 'info');
    }

    requestVerification() {
        showToast('📋 Verification process initiated!', 'info');
    }

    manageFeatures() {
        showToast('⚙️ Feature management panel opened!', 'info');
    }

    generateAPIKey() {
        showToast('🔑 New API key generated successfully!', 'success');
    }

    copyAPIKey() {
        showToast('📋 API key copied to clipboard!', 'success');
    }

    editAPIKey() {
        showToast('✏️ API key settings opened!', 'info');
    }

    revokeAPIKey() {
        if (confirm('Are you sure you want to revoke this API key?')) {
            showToast('🗑️ API key revoked successfully!', 'success');
        }
    }

    createWebhook() {
        showToast('🔗 Webhook creation form opened!', 'info');
    }

    testWebhook() {
        showToast('🧪 Testing webhook connection...', 'info');
    }

    editWebhook() {
        showToast('✏️ Webhook settings opened!', 'info');
    }

    deleteWebhook() {
        if (confirm('Are you sure you want to delete this webhook?')) {
            showToast('🗑️ Webhook deleted successfully!', 'success');
        }
    }

    configureWhitelabel() {
        showToast('🎨 Whitelabel configuration opened!', 'info');
    }

    // Moderation Methods
    exportModerationReport() {
        showToast('📄 Exporting moderation report...', 'success');
    }

    showModerationSettings() {
        showToast('⚙️ Moderation settings opened!', 'info');
    }

    showBulkModerationActions() {
        showToast('⚡ Bulk moderation actions opened!', 'info');
    }

    filterModerationQueue(filter) {
        showToast(`🔍 Filtering moderation queue by: ${filter}`, 'info');
    }

    sortModerationQueue(sort) {
        showToast(`📊 Sorting moderation queue by: ${sort}`, 'info');
    }

    viewFullContent(itemId) {
        const item = this.moderationQueue.find(i => i.id === itemId);
        showToast(`👁️ Viewing full content for ${item?.type} report`, 'info');
    }

    viewUserProfile(itemId) {
        showToast('👤 User profile opened!', 'info');
    }

    viewReportHistory(itemId) {
        showToast('📋 Report history opened!', 'info');
    }

    approveContent(itemId) {
        const item = this.moderationQueue.find(i => i.id === itemId);
        if (item) {
            item.status = 'approved';
            showToast('✅ Content approved successfully!', 'success');
        }
    }

    requestMoreInfo(itemId) {
        showToast('❓ Additional information requested!', 'info');
    }

    rejectContent(itemId) {
        const item = this.moderationQueue.find(i => i.id === itemId);
        if (item) {
            item.status = 'rejected';
            showToast('❌ Content rejected!', 'warning');
        }
    }

    hideContent(itemId) {
        showToast('👁️‍🗨️ Content hidden from public view!', 'success');
    }

    warnUser(itemId) {
        showToast('⚠️ Warning sent to user!', 'warning');
    }

    suspendUser(itemId) {
        if (confirm('Are you sure you want to suspend this user?')) {
            showToast('🚫 User suspended successfully!', 'warning');
        }
    }

    loadModerationAnalytics(period) {
        showToast(`📊 Loading moderation analytics for ${period}...`, 'info');
        // Update active button
        document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }
}

// Initialize the enterprise UI components
const enterpriseUI = new EnterpriseMissingUIComponents();

// Global functions to call the enterprise interfaces
window.showAdvancedAnalyticsDashboard = () => enterpriseUI.showAdvancedAnalyticsDashboard();
window.showTeamManagementInterface = () => enterpriseUI.showTeamManagementInterface();
window.showEnterpriseAdminPanel = () => enterpriseUI.showEnterpriseAdminPanel();
window.showContentModerationDashboard = () => enterpriseUI.showContentModerationDashboard();

// Toast notification function (if not already defined)
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `${icons[type]} ${message}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-card);
        color: var(--text-primary);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border: 1px solid var(--glass-border);
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
