/**
 * Enterprise Missing UI Components
 * 
 * This file contains the 4 missing UI interfaces for the Enterprise section:
 * 1. Advanced Analytics Dashboard - Detailed business metrics and performance reports
 * 2. Team Management Interface - Invite members, manage roles and permissions
 * 3. Enterprise Admin Panel - Advanced settings, API management, whitelabel config
 * 4. Content Moderation Dashboard - Review content, manage reports, user management
 */

function EnterpriseMissingUIComponents() {
    // Constructor properties
    this.currentBusinessAccount = null;
    this.teamMembers = [];
    this.analyticsData = {};
    this.moderationQueue = [];
    
    // Initialize
    this.init = function() {
        // Initialize enterprise data and event listeners
        this.loadEnterpriseData();
        this.setupEventListeners();
    };
    
    this.loadEnterpriseData = function() {
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
    };
    
    this.setupEventListeners = function() {
        var self = this;
        // Global event listeners for enterprise modals
        document.addEventListener('click', function(e) {
            if (e.target.matches('.close-modal')) {
                self.closeModal(e.target.closest('.enterprise-modal'));
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                var modals = document.querySelectorAll('.enterprise-modal.active');
                for (var i = 0; i < modals.length; i++) {
                    self.closeModal(modals[i]);
                }
            }
        });
    };
    
    this.closeModal = function(modal) {
        if (modal) {
            modal.classList.remove('active');
            setTimeout(function() {
                modal.remove();
            }, 300);
        }
    };
    
    // 1. ADVANCED ANALYTICS DASHBOARD
    this.showAdvancedAnalyticsDashboard = function() {
        // Ensure data is loaded
        if (!this.analyticsData || !this.analyticsData.overview) {
            this.loadEnterpriseData();
        }
        
        // Use safe defaults if data is still not available
        var analytics = this.analyticsData && this.analyticsData.overview ? this.analyticsData.overview : {
            totalUsers: 15420,
            activeUsers: 8950,
            engagement: 4.2,
            revenue: 125430,
            growth: 12.5
        };
        
        var modal = document.createElement('div');
        modal.className = 'enterprise-modal analytics-dashboard-modal active';
        
        var modalContent = '<div class="enterprise-modal-overlay">' +
            '<div class="enterprise-modal-content extra-large-modal">' +
            '<div class="modal-header">' +
            '<h2>📊 Advanced Analytics Dashboard</h2>' +
            '<p>Instagram-inspired comprehensive business insights</p>' +
            '<button class="close-modal">×</button>' +
            '</div>' +
            '<div class="instagram-analytics">' +
            '<div class="analytics-header">' +
            '<h1>Analytics</h1>' +
            '<div class="live-indicator">' +
            '<div class="pulse"></div>' +
            '<span><span id="concurrent-users">2,847</span> active</span>' +
            '</div>' +
            '</div>' +
            '<div class="analytics-content">' +
            '<div class="stories-scroll">' +
            '<div class="story-item" onclick="showAdvancedAnalyticsDashboard()">' +
            '<div class="story-circle">📊</div>' +
            '<div class="story-label">Overview</div>' +
            '</div>' +
            '<div class="story-item">' +
            '<div class="story-circle">👥</div>' +
            '<div class="story-label">Users</div>' +
            '</div>' +
            '<div class="story-item">' +
            '<div class="story-circle">💰</div>' +
            '<div class="story-label">Revenue</div>' +
            '</div>' +
            '<div class="story-item">' +
            '<div class="story-circle">📈</div>' +
            '<div class="story-label">Growth</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="analytics-tabs">' +
            '<button class="analytics-tab active">📊 Overview</button>' +
            '<button class="analytics-tab">👥 Users</button>' +
            '<button class="analytics-tab">💰 Revenue</button>' +
            '<button class="analytics-tab">📈 Engagement</button>' +
            '</div>' +
            '<div class="analytics-content">' +
            '<div class="kpi-grid">' +
            '<div class="kpi-card">' +
            '<div class="kpi-header">' +
            '<div class="kpi-title">Monthly Revenue</div>' +
            '<div class="kpi-icon">💰</div>' +
            '</div>' +
            '<div class="kpi-value">$125.4K</div>' +
            '<div class="kpi-change positive">↗ +15.2% vs last month</div>' +
            '</div>' +
            '<div class="kpi-card">' +
            '<div class="kpi-header">' +
            '<div class="kpi-title">Total Users</div>' +
            '<div class="kpi-icon">👥</div>' +
            '</div>' +
            '<div class="kpi-value">' + analytics.totalUsers.toLocaleString() + '</div>' +
            '<div class="kpi-change positive">↗ +' + analytics.growth + '% (1,234 new)</div>' +
            '</div>' +
            '<div class="kpi-card">' +
            '<div class="kpi-header">' +
            '<div class="kpi-title">Engagement Score</div>' +
            '<div class="kpi-icon">📈</div>' +
            '</div>' +
            '<div class="kpi-value">' + analytics.engagement + '/10</div>' +
            '<div class="kpi-change positive">↗ +0.3 vs last period</div>' +
            '</div>' +
            '<div class="kpi-card">' +
            '<div class="kpi-header">' +
            '<div class="kpi-title">Conversion Rate</div>' +
            '<div class="kpi-icon">🎯</div>' +
            '</div>' +
            '<div class="kpi-value">8.4%</div>' +
            '<div class="kpi-change positive">↗ +1.2% vs last month</div>' +
            '</div>' +
            '</div>' +
            '<div class="chart-container">' +
            '<div class="chart-header">' +
            '<h3 class="chart-title">📈 User Growth Trends</h3>' +
            '</div>' +
            '<div style="padding: 2rem; text-align: center; color: #666;">' +
            'Interactive charts will load here...' +
            '</div>' +
            '</div>' +
            '<div class="chart-container">' +
            '<div class="chart-header">' +
            '<h3 class="chart-title">📊 Real-time Activity</h3>' +
            '</div>' +
            '<div class="activity-feed" id="activityFeed">' +
            '<div class="activity-item">' +
            '<div class="activity-time">2m ago</div>' +
            '<div class="activity-text">New user signup completed</div>' +
            '</div>' +
            '<div class="activity-item">' +
            '<div class="activity-time">5m ago</div>' +
            '<div class="activity-text">Premium subscription activated</div>' +
            '</div>' +
            '<div class="activity-item">' +
            '<div class="activity-time">8m ago</div>' +
            '<div class="activity-text">User completed profile setup</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
        
        // Initialize real-time updates
        this.startRealTimeUpdates();
    };

    // 2. TEAM MANAGEMENT INTERFACE
    this.showTeamManagementInterface = function() {
        var modal = document.createElement('div');
        modal.className = 'enterprise-modal team-management-modal active';
        
        var membersList = '';
        for (var i = 0; i < this.teamMembers.length; i++) {
            var member = this.teamMembers[i];
            var initials = member.name.split(' ').map(function(n) { return n[0]; }).join('');
            var resendButton = member.status === 'pending' ? 
                '<button class="action-btn" title="Resend Invitation">📧</button>' : '';
            
            membersList += '<div class="member-card ' + member.status + '">' +
                '<div class="member-info">' +
                '<div class="member-avatar">' +
                '<div class="avatar-circle">' + initials + '</div>' +
                '<div class="status-indicator ' + member.status + '"></div>' +
                '</div>' +
                '<div class="member-details">' +
                '<div class="member-name">' + member.name + '</div>' +
                '<div class="member-email">' + member.email + '</div>' +
                '<div class="member-meta">' +
                '<span class="role-badge ' + member.role + '">' + 
                member.role.charAt(0).toUpperCase() + member.role.slice(1) + '</span>' +
                '<span class="join-date">Joined: ' + (member.joinedAt || 'Pending') + '</span>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="member-actions">' +
                '<button class="action-btn" title="View Details">👁️</button>' +
                '<button class="action-btn" title="Edit Member">✏️</button>' +
                '<button class="action-btn" title="Manage Permissions">🔐</button>' +
                resendButton +
                '<button class="action-btn danger" title="Remove Member">🗑️</button>' +
                '</div>' +
                '</div>';
        }
        
        var activeMembers = this.teamMembers.filter(function(m) { return m.status === 'active'; }).length;
        var pendingMembers = this.teamMembers.filter(function(m) { return m.status === 'pending'; }).length;
        var adminMembers = this.teamMembers.filter(function(m) { return m.role === 'admin'; }).length;
        var managerMembers = this.teamMembers.filter(function(m) { return m.role === 'manager'; }).length;
        var editorMembers = this.teamMembers.filter(function(m) { return m.role === 'editor'; }).length;
        var viewerMembers = this.teamMembers.filter(function(m) { return m.role === 'viewer'; }).length;
        
        var modalContent = '<div class="enterprise-modal-overlay">' +
            '<div class="enterprise-modal-content large-modal">' +
            '<div class="modal-header">' +
            '<h2>👥 Team Management</h2>' +
            '<p>Manage team members, roles, and permissions</p>' +
            '<button class="close-modal">×</button>' +
            '</div>' +
            '<div class="team-management">' +
            '<div class="team-header">' +
            '<div class="team-stats">' +
            '<div class="stat-item">' +
            '<div class="stat-value">' + this.teamMembers.length + '</div>' +
            '<div class="stat-label">Total Members</div>' +
            '</div>' +
            '<div class="stat-item">' +
            '<div class="stat-value">' + activeMembers + '</div>' +
            '<div class="stat-label">Active</div>' +
            '</div>' +
            '<div class="stat-item">' +
            '<div class="stat-value">' + pendingMembers + '</div>' +
            '<div class="stat-label">Pending</div>' +
            '</div>' +
            '</div>' +
            '<div class="team-actions">' +
            '<button class="btn btn-primary">👋 Invite Member</button>' +
            '<button class="btn btn-secondary">📄 Export List</button>' +
            '</div>' +
            '</div>' +
            '<div class="team-members-section">' +
            '<div class="section-header">' +
            '<h3>Team Members</h3>' +
            '</div>' +
            '<div class="members-list">' +
            membersList +
            '</div>' +
            '</div>' +
            '<div class="roles-permissions-section">' +
            '<div class="section-header">' +
            '<h3>Roles & Permissions</h3>' +
            '</div>' +
            '<div class="roles-grid">' +
            '<div class="role-card admin">' +
            '<div class="role-title">Admin</div>' +
            '<div class="role-count">' + adminMembers + ' members</div>' +
            '</div>' +
            '<div class="role-card manager">' +
            '<div class="role-title">Manager</div>' +
            '<div class="role-count">' + managerMembers + ' members</div>' +
            '</div>' +
            '<div class="role-card editor">' +
            '<div class="role-title">Editor</div>' +
            '<div class="role-count">' + editorMembers + ' members</div>' +
            '</div>' +
            '<div class="role-card viewer">' +
            '<div class="role-title">Viewer</div>' +
            '<div class="role-count">' + viewerMembers + ' members</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
    };

    // 3. ENTERPRISE ADMIN PANEL
    this.showEnterpriseAdminPanel = function() {
        var modal = document.createElement('div');
        modal.className = 'enterprise-modal admin-panel-modal active';
        
        var modalContent = '<div class="enterprise-modal-overlay">' +
            '<div class="enterprise-modal-content extra-large-modal">' +
            '<div class="modal-header">' +
            '<h2>⚙️ Enterprise Admin Panel</h2>' +
            '<p>Advanced settings, API management, and system configuration</p>' +
            '<button class="close-modal">×</button>' +
            '</div>' +
            '<div class="admin-panel">' +
            '<div class="admin-nav">' +
            '<div class="nav-section">' +
            '<div class="nav-title">System</div>' +
            '<button class="nav-btn active">⚙️ General Settings</button>' +
            '<button class="nav-btn">🔌 API Management</button>' +
            '<button class="nav-btn">🎨 Whitelabel Config</button>' +
            '<button class="nav-btn">🔒 Security</button>' +
            '</div>' +
            '</div>' +
            '<div class="admin-content">' +
            '<div class="admin-section active">' +
            '<div class="section-header">' +
            '<h3>⚙️ General Settings</h3>' +
            '<p>Configure basic business account settings</p>' +
            '</div>' +
            '<div class="settings-grid">' +
            '<div class="setting-card">' +
            '<div class="setting-header">' +
            '<h4>Business Information</h4>' +
            '</div>' +
            '<div class="setting-content">' +
            '<div class="info-item">' +
            '<label>Company Name</label>' +
            '<span>' + this.currentBusinessAccount.companyName + '</span>' +
            '</div>' +
            '<div class="info-item">' +
            '<label>Industry</label>' +
            '<span>' + this.currentBusinessAccount.industry + '</span>' +
            '</div>' +
            '<div class="info-item">' +
            '<label>Business Type</label>' +
            '<span>' + this.currentBusinessAccount.businessType + '</span>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="setting-card">' +
            '<div class="setting-header">' +
            '<h4>API Keys & Access</h4>' +
            '</div>' +
            '<div class="setting-content">' +
            '<div class="api-key-item">' +
            '<label>Production API Key</label>' +
            '<div class="key-display">' +
            '<span class="key-value">ck_1a2b3c4d5e6f7g8h9i0j...</span>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
    };

    // 4. CONTENT MODERATION DASHBOARD
    this.showContentModerationDashboard = function() {
        var modal = document.createElement('div');
        modal.className = 'enterprise-modal moderation-dashboard-modal active';
        
        var moderationList = '';
        for (var i = 0; i < this.moderationQueue.length; i++) {
            var item = this.moderationQueue[i];
            moderationList += '<div class="moderation-item ' + item.status + '">' +
                '<div class="item-header">' +
                '<div class="item-type">' +
                '<span class="type-badge">' + item.type.toUpperCase() + '</span>' +
                '<span class="reason-badge">' + item.reason.replace('_', ' ').toUpperCase() + '</span>' +
                '</div>' +
                '<div class="item-meta">' +
                '<span class="timestamp">' + item.timestamp + '</span>' +
                '<span class="reporter">Reported by: ' + item.reporter + '</span>' +
                '</div>' +
                '</div>' +
                '<div class="item-content">' +
                '<div class="content-preview">' + item.content + '</div>' +
                '</div>' +
                '<div class="item-actions">' +
                '<button class="btn btn-success btn-small">✅ Approve</button>' +
                '<button class="btn btn-warning btn-small">❓ Need Info</button>' +
                '<button class="btn btn-danger btn-small">❌ Reject</button>' +
                '</div>' +
                '</div>';
        }
        
        var pendingCount = this.moderationQueue.filter(function(item) { return item.status === 'pending'; }).length;
        var reviewingCount = this.moderationQueue.filter(function(item) { return item.status === 'reviewing'; }).length;
        
        var modalContent = '<div class="enterprise-modal-overlay">' +
            '<div class="enterprise-modal-content extra-large-modal">' +
            '<div class="modal-header">' +
            '<h2>🛡️ Content Moderation Dashboard</h2>' +
            '<p>Review reported content, manage users, and maintain platform safety</p>' +
            '<button class="close-modal">×</button>' +
            '</div>' +
            '<div class="moderation-dashboard">' +
            '<div class="moderation-header">' +
            '<div class="moderation-stats">' +
            '<div class="stat-card pending">' +
            '<div class="stat-icon">⏳</div>' +
            '<div class="stat-content">' +
            '<div class="stat-value">' + pendingCount + '</div>' +
            '<div class="stat-label">Pending Review</div>' +
            '</div>' +
            '</div>' +
            '<div class="stat-card reviewing">' +
            '<div class="stat-icon">👁️</div>' +
            '<div class="stat-content">' +
            '<div class="stat-value">' + reviewingCount + '</div>' +
            '<div class="stat-label">Under Review</div>' +
            '</div>' +
            '</div>' +
            '<div class="stat-card resolved">' +
            '<div class="stat-icon">✅</div>' +
            '<div class="stat-content">' +
            '<div class="stat-value">47</div>' +
            '<div class="stat-label">Resolved Today</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="moderation-queue">' +
            '<div class="queue-header">' +
            '<h3>Content Review Queue</h3>' +
            '</div>' +
            '<div class="moderation-list">' +
            moderationList +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);
    };

    // Supporting Methods
    this.startRealTimeUpdates = function() {
        var self = this;
        this.realTimeInterval = setInterval(function() {
            self.updateRealTimeData();
        }, 30000);
    };

    this.updateRealTimeData = function() {
        var concurrentElement = document.getElementById('concurrent-users');
        if (concurrentElement) {
            var currentCount = parseInt(concurrentElement.textContent.replace(',', ''));
            var newCount = currentCount + Math.floor(Math.random() * 20) - 10;
            concurrentElement.textContent = Math.max(0, newCount).toLocaleString();
        }
    };
}

// Initialize the enterprise UI components
var enterpriseUI = new EnterpriseMissingUIComponents();
enterpriseUI.init(); // Initialize the data

// Global functions to call the enterprise interfaces
function showAdvancedAnalyticsDashboard() {
    enterpriseUI.showAdvancedAnalyticsDashboard();
}

function showTeamManagementInterface() {
    enterpriseUI.showTeamManagementInterface();
}

function showEnterpriseAdminPanel() {
    enterpriseUI.showEnterpriseAdminPanel();
}

function showContentModerationDashboard() {
    enterpriseUI.showContentModerationDashboard();
}

// Toast notification function
function showToast(message, type) {
    type = type || 'info';
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    
    var icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = icons[type] + ' ' + message;
    toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #333; color: #fff; padding: 1rem 1.5rem; border-radius: 8px; z-index: 10000;';
    
    document.body.appendChild(toast);
    
    setTimeout(function() {
        toast.remove();
    }, 3000);
}
