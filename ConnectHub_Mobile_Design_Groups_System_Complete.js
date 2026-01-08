// ========================================
// CONNECTHUB MOBILE DESIGN - GROUPS SYSTEM
// Complete Groups Management System
// ========================================

// Groups State Management
const groupsState = {
    userGroups: [],
    groupMembers: {},
    groupPosts: {},
    groupFiles: {},
    groupEvents: {},
    groupRoles: {},
    groupInvitations: [],
    groupCategories: ['Technology', 'Arts & Culture', 'Sports & Fitness', 'Education', 'Business', 'Entertainment', 'Gaming', 'Travel', 'Food & Dining', 'Health & Wellness'],
    currentGroup: null,
    groupNotificationSettings: {}
};

// Initialize Groups System
function initializeGroupsSystem() {
    console.log('Groups System Initialized');
    
    // Sample groups data
    groupsState.userGroups = [
        {
            id: 1,
            name: 'Tech Enthusiasts',
            emoji: '💻',
            description: 'A community for technology lovers',
            members: 2456,
            privacy: 'Public',
            category: 'Technology',
            joined: true,
            isAdmin: true,
            gradient: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            rules: ['Be respectful', 'No spam', 'Stay on topic', 'Help others'],
            settings: {
                allowPosts: true,
                allowFiles: true,
                allowEvents: true,
                moderationLevel: 'medium'
            }
        },
        {
            id: 2,
            name: 'Creative Designers',
            emoji: '🎨',
            description: 'Share your creative work and ideas',
            members: 1832,
            privacy: 'Public',
            category: 'Arts & Culture',
            joined: true,
            isAdmin: false,
            gradient: 'linear-gradient(135deg, var(--success), var(--accent))',
            rules: ['Share constructive feedback', 'Respect copyrights', 'Be supportive', 'No plagiarism'],
            settings: {
                allowPosts: true,
                allowFiles: true,
                allowEvents: true,
                moderationLevel: 'low'
            }
        },
        {
            id: 3,
            name: 'Book Club',
            emoji: '📚',
            description: 'Monthly book discussions and reviews',
            members: 945,
            privacy: 'Private',
            category: 'Education',
            joined: true,
            isAdmin: false,
            gradient: 'linear-gradient(135deg, var(--warning), var(--error))',
            rules: ['Spoiler warnings required', 'Monthly reading schedule', 'Participate actively'],
            settings: {
                allowPosts: true,
                allowFiles: true,
                allowEvents: true,
                moderationLevel: 'high'
            }
        }
    ];
    
    // Sample group members
    groupsState.groupMembers = {
        1: [
            { id: 1, name: 'John Doe', emoji: '👤', role: 'Admin', joinedDate: '2020-01-15', active: true },
            { id: 2, name: 'Sarah Johnson', emoji: '👤', role: 'Moderator', joinedDate: '2020-03-20', active: true },
            { id: 3, name: 'Mike Chen', emoji: '😊', role: 'Member', joinedDate: '2021-05-10', active: true },
            { id: 4, name: 'Emily Rodriguez', emoji: '🎨', role: 'Member', joinedDate: '2021-08-15', active: false },
            { id: 5, name: 'David Kim', emoji: '🚀', role: 'Member', joinedDate: '2022-01-20', active: true }
        ],
        2: [
            { id: 1, name: 'John Doe', emoji: '👤', role: 'Member', joinedDate: '2021-06-10', active: true },
            { id: 2, name: 'Emily Rodriguez', emoji: '🎨', role: 'Admin', joinedDate: '2020-05-15', active: true },
            { id: 3, name: 'Jessica Lee', emoji: '🎭', role: 'Moderator', joinedDate: '2021-02-20', active: true }
        ],
        3: [
            { id: 1, name: 'John Doe', emoji: '👤', role: 'Member', joinedDate: '2022-02-01', active: true },
            { id: 2, name: 'Sarah Johnson', emoji: '👤', role: 'Admin', joinedDate: '2019-11-05', active: true }
        ]
    };
    
    // Sample group posts
    groupsState.groupPosts = {
        1: [
            { id: 1, author: 'Sarah Johnson', emoji: '👤', content: 'Check out this new AI tool!', timestamp: '2 hours ago', likes: 45, comments: 12 },
            { id: 2, author: 'Mike Chen', emoji: '😊', content: 'Just deployed my first app!', timestamp: '5 hours ago', likes: 67, comments: 23 }
        ],
        2: [
            { id: 1, author: 'Emily Rodriguez', emoji: '🎨', content: 'New design project showcase', timestamp: '1 hour ago', likes: 89, comments: 34 }
        ],
        3: [
            { id: 1, author: 'Sarah Johnson', emoji: '👤', content: 'This month: "Dune" by Frank Herbert', timestamp: '1 day ago', likes: 34, comments: 18 }
        ]
    };
    
    // Sample group files
    groupsState.groupFiles = {
        1: [
            { id: 1, name: 'Meeting Notes.pdf', uploader: 'Sarah Johnson', size: '2.5 MB', uploadDate: '2 days ago', type: 'pdf' },
            { id: 2, name: 'Project Proposal.docx', uploader: 'Mike Chen', size: '1.8 MB', uploadDate: '1 week ago', type: 'doc' },
            { id: 3, name: 'Code Examples.zip', uploader: 'David Kim', size: '5.3 MB', uploadDate: '2 weeks ago', type: 'zip' }
        ],
        2: [
            { id: 1, name: 'Design Templates.fig', uploader: 'Emily Rodriguez', size: '12.4 MB', uploadDate: '3 days ago', type: 'figma' }
        ],
        3: [
            { id: 1, name: 'Reading Schedule.pdf', uploader: 'Sarah Johnson', size: '0.5 MB', uploadDate: '1 week ago', type: 'pdf' }
        ]
    };
    
    // Sample group events
    groupsState.groupEvents = {
        1: [
            { id: 1, title: 'Tech Meetup 2024', date: '2024-12-25', time: '18:00', location: 'Convention Center', attendees: 45 },
            { id: 2, title: 'Coding Workshop', date: '2024-12-30', time: '14:00', location: 'Online', attendees: 78 }
        ],
        2: [
            { id: 1, title: 'Design Showcase', date: '2024-12-22', time: '19:00', location: 'Art Gallery', attendees: 34 }
        ],
        3: [
            { id: 1, title: 'Monthly Book Discussion', date: '2024-12-28', time: '20:00', location: 'Online', attendees: 23 }
        ]
    };
}

// ========== OPEN GROUP DETAILS (Updated to use dashboard) ==========

// Override the original openModal function for 'groupDetails'
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function() {
        const originalOpenModal = window.openModal || function() {};
        
        window.openModal = function(type, param) {
            if (type === 'groupDetails') {
                openGroupDetailsDashboard(1);
            } else {
                originalOpenModal(type, param);
            }
        };
        
        initializeGroupsSystem();
    });
}

// ========== FULL GROUP DETAILS DASHBOARD ==========

function openGroupDetailsDashboard(groupId) {
    const group = groupsState.userGroups.find(g => g.id === groupId) || groupsState.userGroups[0];
    groupsState.currentGroup = group;
    
    const modalHTML = '<div id="groupDetailsDashboardModal" class="modal show"><div class="modal-header"><div class="modal-close" onclick="closeGroupDetailsDashboard()">✕</div><div class="modal-title">' + group.name + '</div><button class="nav-btn" onclick="openGroupSettingsMenu(' + group.id + ')">⚙️</button></div><div class="modal-content"><div style="text-align: center; margin: 20px 0;"><div style="width: 120px; height: 120px; border-radius: 20px; background: ' + group.gradient + '; display: flex; align-items: center; justify-content: center; font-size: 60px; margin: 0 auto 16px; border: 4px solid var(--glass-border);">' + group.emoji + '</div><div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">' + group.name + '</div><div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 12px;">' + group.description + '</div><div style="display: inline-block; padding: 6px 16px; background: rgba(79, 70, 229, 0.2); border-radius: 16px; font-size: 12px; font-weight: 700; color: var(--primary);">' + group.privacy + ' • ' + group.category + '</div></div><div class="stats-grid"><div class="stat-card" onclick="openGroupMembersManager(' + group.id + ')"><div class="stat-value">' + group.members + '</div><div class="stat-label">Members</div></div><div class="stat-card" onclick="openGroupPostFeed(' + group.id + ')"><div class="stat-value">' + (groupsState.groupPosts[group.id] || []).length + '</div><div class="stat-label">Posts</div></div><div class="stat-card" onclick="openGroupFileSharing(' + group.id + ')"><div class="stat-value">' + (groupsState.groupFiles[group.id] || []).length + '</div><div class="stat-label">Files</div></div><div class="stat-card" onclick="openGroupEvents(' + group.id + ')"><div class="stat-value">' + (groupsState.groupEvents[group.id] || []).length + '</div><div class="stat-label">Events</div></div></div><div style="display: flex; gap: 8px; margin: 20px 0; overflow-x: auto; scrollbar-width: none;"><div class="pill-nav-button active" onclick="switchGroupTab(this, \'feed\', ' + group.id + ')">Feed</div><div class="pill-nav-button" onclick="switchGroupTab(this, \'members\', ' + group.id + ')">Members</div><div class="pill-nav-button" onclick="switchGroupTab(this, \'files\', ' + group.id + ')">Files</div><div class="pill-nav-button" onclick="switchGroupTab(this, \'events\', ' + group.id + ')">Events</div>' + (group.isAdmin ? '<div class="pill-nav-button" onclick="switchGroupTab(this, \'admin\', ' + group.id + ')">Admin</div>' : '') + '</div><div id="groupTabContent">' + getGroupFeedContent(group.id) + '</div><div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 20px;">' + (group.joined ? '<button class="btn" onclick="openGroupChat(' + group.id + ')">💬 Group Chat</button><button class="btn" style="background: var(--glass);" onclick="openCreateGroupPost(' + group.id + ')">📝 Post</button><button class="btn" style="background: var(--glass);" onclick="inviteToGroup(' + group.id + ')">👥 Invite</button><button class="btn" style="background: var(--glass);" onclick="shareGroup(' + group.id + ')">🔗 Share</button>' : '<button class="btn" onclick="joinGroup(' + group.id + ')" style="grid-column: span 2;">Join Group</button>') + '</div></div></div>';
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    if (typeof showToast === 'function') {
        showToast('Opening ' + group.name + '... 👥');
    }
}

function closeGroupDetailsDashboard() {
    const modal = document.getElementById('groupDetailsDashboardModal');
    if (modal) modal.remove();
}

// ========== GROUP TAB SWITCHING ==========

function switchGroupTab(element, tab, groupId) {
    element.parentElement.querySelectorAll('.pill-nav-button').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    
    const content = document.getElementById('groupTabContent');
    if (!content) return;
    
    switch(tab) {
        case 'feed':
            content.innerHTML = getGroupFeedContent(groupId);
            break;
        case 'members':
            content.innerHTML = getGroupMembersContent(groupId);
            break;
        case 'files':
            content.innerHTML = getGroupFilesContent(groupId);
            break;
        case 'events':
            content.innerHTML = getGroupEventsContent(groupId);
            break;
        case 'admin':
            content.innerHTML = getGroupAdminContent(groupId);
            break;
    }
}

// ========== GROUP FEED CONTENT ==========

function getGroupFeedContent(groupId) {
    const posts = groupsState.groupPosts[groupId] || [];
    
    if (posts.length === 0) {
        return '<div style="text-align: center; padding: 60px 20px;"><div style="font-size: 64px; margin-bottom: 16px;">📝</div><div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No Posts Yet</div><div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px;">Be the first to share something!</div><button class="btn" onclick="openCreateGroupPost(' + groupId + ')">📝 Create Post</button></div>';
    }
    
    let html = '<div class="section-header"><div class="section-title">Recent Posts</div><div class="section-link" onclick="openCreateGroupPost(' + groupId + ')">+ Post</div></div>';
    
    posts.forEach(post => {
        html += '<div class="post-card"><div class="post-header"><div class="post-avatar">' + post.emoji + '</div><div class="post-header-info"><div class="post-author">' + post.author + '</div><div class="post-meta">' + post.timestamp + '</div></div><div class="post-menu" onclick="openGroupPostOptions(' + post.id + ', ' + groupId + ')">⋯</div></div><div class="post-content">' + post.content + '</div><div class="post-actions"><div class="post-action" onclick="likeGroupPost(' + post.id + ', ' + groupId + ', this)"><span>👍</span> ' + post.likes + '</div><div class="post-action" onclick="openGroupPostComments(' + post.id + ', ' + groupId + ')"><span>💬</span> ' + post.comments + '</div><div class="post-action" onclick="shareGroupPost(' + post.id + ', ' + groupId + ')"><span>🔄</span> Share</div></div></div>';
    });
    
    return html;
}

// ========== GROUP MEMBERS CONTENT ==========

function getGroupMembersContent(groupId) {
    const members = groupsState.groupMembers[groupId] || [];
    const group = groupsState.userGroups.find(g => g.id === groupId);
    
    let html = '<div class="search-bar"><span>🔍</span><input type="text" class="search-input" placeholder="Search members..." oninput="searchGroupMembers(this.value, ' + groupId + ')" /></div><div class="section-header"><div class="section-title">Members (' + members.length + ')</div>' + (group.isAdmin ? '<div class="section-link" onclick="openPendingMemberRequests(' + groupId + ')">Pending</div>' : '') + '</div><div id="groupMembersList">';
    
    members.forEach(member => {
        html += '<div class="friend-card" onclick="openGroupMemberProfile(' + member.id + ', ' + groupId + ')"><div class="friend-avatar">' + member.emoji + '</div><div class="friend-info"><div class="friend-name">' + member.name + '</div><div class="friend-mutual">' + member.role + (member.active ? ' • Active' : ' • Offline') + '</div></div><button class="friend-btn secondary" onclick="event.stopPropagation(); messageGroupMember(' + member.id + ', \'' + member.name + '\')">💬</button></div>';
    });
    
    html += '</div>';
    return html;
}

// ========== GROUP FILES CONTENT ==========

function getGroupFilesContent(groupId) {
    const files = groupsState.groupFiles[groupId] || [];
    
    let html = '<div class="section-header"><div class="section-title">Shared Files</div><div class="section-link" onclick="uploadGroupFile(' + groupId + ')">+ Upload</div></div>';
    
    if (files.length === 0) {
        html += '<div style="text-align: center; padding: 60px 20px;"><div style="font-size: 64px; margin-bottom: 16px;">📁</div><div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No Files Yet</div><div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px;">Share documents, images, and more</div><button class="btn" onclick="uploadGroupFile(' + groupId + ')">📤 Upload File</button></div>';
    } else {
        html += '<div class="search-bar"><span>🔍</span><input type="text" class="search-input" placeholder="Search files..." /></div>';
        files.forEach(file => {
            html += '<div class="list-item" onclick="openGroupFile(' + file.id + ', ' + groupId + ')"><div class="list-item-icon">' + getFileIcon(file.type) + '</div><div class="list-item-content"><div class="list-item-title">' + file.name + '</div><div class="list-item-subtitle">' + file.uploader + ' • ' + file.size + ' • ' + file.uploadDate + '</div></div><button class="nav-btn" onclick="event.stopPropagation(); downloadGroupFile(' + file.id + ', ' + groupId + ')">⬇️</button></div>';
        });
    }
    
    return html;
}

// ========== GROUP EVENTS CONTENT ==========

function getGroupEventsContent(groupId) {
    const events = groupsState.groupEvents[groupId] || [];
    const group = groupsState.userGroups.find(g => g.id === groupId);
    
    let html = '<div class="section-header"><div class="section-title">Group Events</div>' + (group.isAdmin ? '<div class="section-link" onclick="createGroupEvent(' + groupId + ')">+ Create</div>' : '') + '</div>';
    
    if (events.length === 0) {
        html += '<div style="text-align: center; padding: 60px 20px;"><div style="font-size: 64px; margin-bottom: 16px;">📅</div><div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">No Events Scheduled</div><div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px;">Create events for group members</div>' + (group.isAdmin ? '<button class="btn" onclick="createGroupEvent(' + groupId + ')">📅 Create Event</button>' : '') + '</div>';
    } else {
        events.forEach(event => {
            const date = new Date(event.date);
            const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
            const day = date.getDate();
            html += '<div class="event-card" onclick="viewGroupEventDetails(' + event.id + ', ' + groupId + ')"><div class="event-date"><div class="event-date-box"><div class="event-month">' + month + '</div><div class="event-day">' + day + '</div></div><div><div class="event-title">' + event.title + '</div><div class="event-details">📍 ' + event.location + ' • ' + event.time + '</div><div class="event-details">👥 ' + event.attendees + ' attending</div></div></div><button class="btn" style="margin-top: 12px;" onclick="event.stopPropagation(); rsvpGroupEvent(' + event.id + ', ' + groupId + ')">✓ RSVP</button></div>';
        });
    }
    
    return html;
}

// ========== GROUP ADMIN CONTENT ==========

function getGroupAdminContent(groupId) {
    const group = groupsState.userGroups.find(g => g.id === groupId);
    
    return '<div style="text-align: center; margin: 30px 0;"><div style="font-size: 64px; margin-bottom: 16px;">🛡️</div><div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Admin Panel</div><div style="font-size: 14px; color: var(--text-secondary);">Manage group settings and members</div></div><div class="section-header"><div class="section-title">Admin Tools</div></div><div class="list-item" onclick="openGroupModerationPanel(' + groupId + ')"><div class="list-item-icon">🛡️</div><div class="list-item-content"><div class="list-item-title">Moderation Panel</div><div class="list-item-subtitle">Manage posts and members</div></div><div class="list-item-arrow">→</div></div><div class="list-item" onclick="openGroupRolesPermissions(' + groupId + ')"><div class="list-item-icon">👥</div><div class="list-item-content"><div class="list-item-title">Roles & Permissions</div><div class="list-item-subtitle">Manage member roles</div></div><div class="list-item-arrow">→</div></div><div class="list-item" onclick="openGroupRulesEditor(' + groupId + ')"><div class="list-item-icon">📋</div><div class="list-item-content"><div class="list-item-title">Group Rules</div><div class="list-item-subtitle">Edit guidelines</div></div><div class="list-item-arrow">→</div></div><div class="list-item" onclick="openGroupAnalyticsPanel(' + groupId + ')"><div class="list-item-icon">📊</div><div class="list-item-content"><div class="list-item-title">Analytics</div><div class="list-item-subtitle">View group insights</div></div><div class="list-item-arrow">→</div></div><div class="list-item" onclick="openPendingMemberRequests(' + groupId + ')"><div class="list-item-icon">⏳</div><div class="list-item-content"><div class="list-item-title">Pending Requests</div><div class="list-item-subtitle">Member join requests</div></div><div class="list-item-arrow">→</div></div><div class="list-item" onclick="manageSubgroups(' + groupId + ')"><div class="list-item-icon">🔀</div><div class="list-item-content"><div class="list-item-title">Subgroups</div><div class="list-item-subtitle">Create and manage subgroups</div></div><div class="list-item-arrow">→</div></div><div class="section-header"><div class="section-title">Group Settings</div></div><div class="toggle-container"><div><div class="list-item-title">Allow Member Posts</div><div class="list-item-subtitle">Members can create posts</div></div><div class="toggle-switch ' + (group.settings.allowPosts ? 'active' : '') + '" onclick="toggleGroupSetting(' + groupId + ', \'allowPosts\', this)"><div class="toggle-slider"></div></div></div><div class="toggle-container"><div><div class="list-item-title">Allow File Sharing</div><div class="list-item-subtitle">Members can share files</div></div><div class="toggle-switch ' + (group.settings.allowFiles ? 'active' : '') + '" onclick="toggleGroupSetting(' + groupId + ', \'allowFiles\', this)"><div class="toggle-slider"></div></div></div><div class="toggle-container"><div><div class="list-item-title">Allow Event Creation</div><div class="list-item-subtitle">Members can create events</div></div><div class="toggle-switch ' + (group.settings.allowEvents ? 'active' : '') + '" onclick="toggleGroupSetting(' + groupId + ', \'allowEvents\', this)"><div class="toggle-slider"></div></div></div><div class="list-item" onclick="openGroupPrivacySettings(' + groupId + ')"><div class="list-item-icon">🔐</div><div class="list-item-content"><div class="list-item-title">Privacy Settings</div><div class="list-item-subtitle">' + group.privacy + ' group</div></div><div class="list-item-arrow">→</div></div><button class="btn" style="background: var(--error); margin-top: 20px;" onclick="deleteGroupConfirm(' + groupId + ')">🗑️ Delete Group</button>';
}

// ========== HELPER FUNCTIONS ==========

function getFileIcon(type) {
    const icons = {
        'pdf': '📄',
        'doc': '📝',
        'zip': '📦',
        'figma': '🎨',
        'image': '🖼️',
        'video': '🎥',
        'audio': '🎵'
    };
    return icons[type] || '📁';
}

function showToastHelper(message) {
    if (typeof showToast === 'function') {
        showToast(message);
    } else {
        console.log('Toast:', message);
    }
}

// ========== GROUP ACTION FUNCTIONS ==========

function joinGroup(groupId) {
    const group = groupsState.userGroups.find(g => g.id === groupId);
    if (!group) return;
    
    group.joined = true;
    group.members++;
    
    closeGroupDetailsDashboard();
    showToastHelper('Joined ' + group.name + '! 🎉');
    
    setTimeout(function() {
        showToastHelper('Welcome to the community!');
    }, 1500);
}

function leaveGroup(groupId) {
    const group = groupsState.userGroups.find(g => g.id === groupId);
    if (!group) return;
    
    if (confirm('Are you sure you want to leave this group?')) {
        group.joined = false;
        group.members--;
        
        closeGroupDetailsDashboard();
        showToastHelper('Left ' + group.name);
    }
}

function openGroupChat(groupId) {
    const group = groupsState.userGroups.find(g => g.id === groupId);
    closeGroupDetailsDashboard();
    
    showToastHelper('Opening group chat for ' + group.name + '... 💬');
    
    setTimeout(function() {
        showToastHelper('Group chat with ' + group.members + ' members');
    }, 1000);
}

function openCreateGroupPost(groupId) {
    const group = groupsState.userGroups.find(g => g.id === groupId);
    
    showToastHelper('Creating post in ' + group.name + '... 📝');
    
    setTimeout(function() {
        showToastHelper('Post created in group!');
    }, 1500);
}

function inviteToGroup(groupId) {
    const group = groupsState.userGroups.find(g => g.id === groupId);
    
    showToastHelper('Sending invitations to ' + group.name + '... 👥');
    
    setTimeout(function() {
        showToastHelper('Invitations sent successfully!');
    }, 1500);
}

function shareGroup(groupId) {
    const group = groupsState.userGroups.find(g => g.id === groupId);
    
    showToastHelper('Group link copied! 🔗');
    
    setTimeout(function() {
        showToastHelper('Share ' + group.name + ' with friends!');
    }, 1000);
}

function likeGroupPost(postId, groupId, element) {
    element.classList.toggle('active');
    const icon = element.querySelector('span');
    
    if (element.classList.contains('active')) {
        icon.textContent = '❤️';
        showToastHelper('Liked!');
    } else {
        icon.textContent = '👍';
    }
}

function openGroupPostComments(postId, groupId) {
    showToastHelper('Opening comments... 💬');
}

function shareGroupPost(postId, groupId) {
    showToastHelper('Post shared! 🔄');
}

function openGroupPostOptions(postId, groupId) {
    showToastHelper('Post options... ⋯');
}

function searchGroupMembers(query, groupId) {
    if (query.trim().length > 0) {
        showToastHelper('Searching members: ' + query);
    }
}

function openGroupMemberProfile(memberId, groupId) {
    const members = groupsState.groupMembers[groupId] || [];
    const member = members.find(m => m.id === memberId);
    
    if (member) {
        showToastHelper('Opening ' + member.name + ' profile... 👤');
    }
}

function messageGroupMember(memberId, name) {
    showToastHelper('Opening chat with ' + name + '... 💬');
}

function uploadGroupFile(groupId) {
    showToastHelper('Opening file picker... 📤');
    
    setTimeout(function() {
        showToastHelper('File uploaded to group! ✓');
    }, 2000);
}

function openGroupFile(fileId, groupId) {
    showToastHelper('Opening file... 📁');
}

function downloadGroupFile(fileId, groupId) {
    showToastHelper('Downloading file... ⬇️');
    
    setTimeout(function() {
        showToastHelper('File downloaded! ✓');
    }, 1500);
}

function createGroupEvent(groupId) {
    showToastHelper('Creating group event... 📅');
}

function viewGroupEventDetails(eventId, groupId) {
    showToastHelper('Opening event details... 📅');
}

function rsvpGroupEvent(eventId, groupId) {
    showToastHelper('RSVP confirmed! ✓');
}

// ========== ADMIN PANEL FUNCTIONS (FULL DASHBOARDS) ==========

// 1. Group Members Manager - Full Dashboard
function openGroupMembersManager(groupId) {
    const group = groupsState.userGroups.find(g => g.id === groupId);
    const members = groupsState.groupMembers[groupId] || [];
    
    const modalHTML = `
        <div id="groupMembersManagerModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeModal('groupMembersManager')">✕</div>
                <div class="modal-title">Members Manager</div>
                <button class="nav-btn" onclick="inviteToGroup(${groupId})">+</button>
            </div>
            <div class="modal-content">
                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 48px; margin-bottom: 12px;">👥</div>
                    <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Manage Members</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">${members.length} total members</div>
                </div>
                
                <div class="search-bar">
                    <span>🔍</span>
                    <input type="text" class="search-input" placeholder="Search members..." oninput="searchGroupMembers(this.value, ${groupId})" />
                </div>
                
                <div class="section-header">
                    <div class="section-title">All Members</div>
                    ${group.isAdmin ? '<div class="section-link" onclick="openPendingMemberRequests(' + groupId + ')">Pending</div>' : ''}
                </div>
                
                ${members.map(member => `
                    <div class="friend-card" onclick="openGroupMemberProfile(${member.id}, ${groupId})">
                        <div class="friend-avatar">${member.emoji}</div>
                        <div class="friend-info">
                            <div class="friend-name">${member.name}</div>
                            <div class="friend-mutual">${member.role}${member.active ? ' • Active' : ' • Offline'}</div>
                        </div>
                        <button class="friend-btn secondary" onclick="event.stopPropagation(); messageGroupMember(${member.id}, '${member.name}')">💬</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    showToastHelper('Members manager opened 👥');
}

// 2. Group Post Feed - Standalone Dashboard
function openGroupPostFeed(groupId) {
    const group = groupsState.userGroups.find(g => g.id === groupId);
    const posts = groupsState.groupPosts[groupId] || [];
    
    const modalHTML = `
        <div id="groupPostFeedModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeModal('groupPostFeed')">✕</div>
                <div class="modal-title">Group Posts</div>
                <button class="nav-btn" onclick="openCreateGroupPost(${groupId})">+</button>
            </div>
            <div class="modal-content">
                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 48px; margin-bottom: 12px;">📝</div>
                    <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Group Posts</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">${posts.length} total posts</div>
                </div>
                
                ${posts.length === 0 ? `
                    <div style="text-align: center; padding: 40px 20px;">
                        <div style="font-size: 48px; margin-bottom: 12px;">📭</div>
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No Posts Yet</div>
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 16px;">Be the first to post!</div>
                        <button class="btn" onclick="openCreateGroupPost(${groupId})">Create Post</button>
                    </div>
                ` : posts.map(post => `
                    <div class="post-card">
                        <div class="post-header">
                            <div class="post-avatar">${post.emoji}</div>
                            <div class="post-header-info">
                                <div class="post-author">${post.author}</div>
                                <div class="post-meta">${post.timestamp}</div>
                            </div>
                            <div class="post-menu" onclick="openGroupPostOptions(${post.id}, ${groupId})">⋯</div>
                        </div>
                        <div class="post-content">${post.content}</div>
                        <div class="post-actions">
                            <div class="post-action" onclick="likeGroupPost(${post.id}, ${groupId}, this)">
                                <span>👍</span> ${post.likes}
                            </div>
                            <div class="post-action" onclick="openGroupPostComments(${post.id}, ${groupId})">
                                <span>💬</span> ${post.comments}
                            </div>
                            <div class="post-action" onclick="shareGroupPost(${post.id}, ${groupId})">
                                <span>🔄</span> Share
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    showToastHelper('Post feed opened 📝');
}

// 3. Group File Sharing - Standalone Dashboard
function openGroupFileSharing(groupId) {
    const group = groupsState.userGroups.find(g => g.id === groupId);
    const files = groupsState.groupFiles[groupId] || [];
    
    const modalHTML = `
        <div id="groupFileSharingModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeModal('groupFileSharing')">✕</div>
                <div class="modal-title">File Sharing</div>
                <button class="nav-btn" onclick="uploadGroupFile(${groupId})">+</button>
            </div>
            <div class="modal-content">
                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 48px; margin-bottom: 12px;">📁</div>
                    <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Shared Files</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">${files.length} files shared</div>
                </div>
                
                ${files.length > 0 ? `
                    <div class="search-bar">
                        <span>🔍</span>
                        <input type="text" class="search-input" placeholder="Search files..." />
                    </div>
                ` : ''}
                
                ${files.length === 0 ? `
                    <div style="text-align: center; padding: 40px 20px;">
                        <div style="font-size: 48px; margin-bottom: 12px;">📂</div>
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No Files Yet</div>
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 16px;">Share documents and media</div>
                        <button class="btn" onclick="uploadGroupFile(${groupId})">Upload File</button>
                    </div>
                ` : files.map(file => `
                    <div class="list-item" onclick="openGroupFile(${file.id}, ${groupId})">
                        <div class="list-item-icon">${getFileIcon(file.type)}</div>
                        <div class="list-item-content">
                            <div class="list-item-title">${file.name}</div>
                            <div class="list-item-subtitle">${file.uploader} • ${file.size} • ${file.uploadDate}</div>
                        </div>
                        <button class="nav-btn" onclick="event.stopPropagation(); downloadGroupFile(${file.id}, ${groupId})">⬇️</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    showToastHelper('File sharing opened 📁');
}

// 4. Group Events - Standalone Dashboard
function openGroupEvents(groupId) {
    const group = groupsState.userGroups.find(g => g.id === groupId);
    const events = groupsState.groupEvents[groupId] || [];
    
    const modalHTML = `
        <div id="groupEventsModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeModal('groupEvents')">✕</div>
                <div class="modal-title">Group Events</div>
                ${group.isAdmin ? '<button class="nav-btn" onclick="createGroupEvent(' + groupId + ')">+</button>' : ''}
            </div>
            <div class="modal-content">
                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 48px; margin-bottom: 12px;">📅</div>
                    <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Upcoming Events</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">${events.length} scheduled events</div>
                </div>
                
                ${events.length === 0 ? `
                    <div style="text-align: center; padding: 40px 20px;">
                        <div style="font-size: 48px; margin-bottom: 12px;">🗓️</div>
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No Events Scheduled</div>
                        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 16px;">Create events for your group</div>
                        ${group.isAdmin ? '<button class="btn" onclick="createGroupEvent(' + groupId + ')">Create Event</button>' : ''}
                    </div>
                ` : events.map(event => {
                    const date = new Date(event.date);
                    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                    const day = date.getDate();
                    return `
                        <div class="event-card" onclick="viewGroupEventDetails(${event.id}, ${groupId})">
                            <div class="event-date">
                                <div class="event-date-box">
                                    <div class="event-month">${month}</div>
                                    <div class="event-day">${day}</div>
                                </div>
                                <div>
                                    <div class="event-title">${event.title}</div>
                                    <div class="event-details">📍 ${event.location} • ${event.time}</div>
                                    <div class="event-details">👥 ${event.attendees} attending</div>
                                </div>
                            </div>
                            <button class="btn" style="margin-top: 12px;" onclick="event.stopPropagation(); rsvpGroupEvent(${event.id}, ${groupId})">✓ RSVP</button>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    showToastHelper('Events dashboard opened 📅');
}

// 5. Group Settings Menu - Full Dashboard
function openGroupSettingsMenu(groupId) {
    const group = groupsState.userGroups.find(g => g.id === groupId);
    
    const modalHTML = `
        <div id="groupSettingsMenuModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeModal('groupSettingsMenu')">✕</div>
                <div class="modal-title">Group Settings</div>
            </div>
            <div class="modal-content">
                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 48px; margin-bottom: 12px;">⚙️</div>
                    <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Settings</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Manage group preferences</div>
                </div>
                
                <div class="section-header">
                    <div class="section-title">General</div>
                </div>
                
                <div class="list-item" onclick="openGroupNotificationSettings(${groupId})">
                    <div class="list-item-icon">🔔</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Notifications</div>
                        <div class="list-item-subtitle">Manage group alerts</div>
                    </div>
                    <div class="list-item-arrow">→</div>
                </div>
                
                <div class="list-item" onclick="openGroupPrivacySettings(${groupId})">
                    <div class="list-item-icon">🔐</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Privacy</div>
                        <div class="list-item-subtitle">${group.privacy} group</div>
                    </div>
                    <div class="list-item-arrow">→</div>
                </div>
                
                ${group.isAdmin ? `
                    <div class="section-header" style="margin-top: 20px;">
                        <div class="section-title">Admin Tools</div>
                    </div>
                    
                    <div class="list-item" onclick="openGroupModerationPanel(${groupId})">
                        <div class="list-item-icon">🛡️</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Moderation</div>
                            <div class="list-item-subtitle">Manage content & members</div>
                        </div>
                        <div class="list-item-arrow">→</div>
                    </div>
                    
                    <div class="list-item" onclick="openGroupRolesPermissions(${groupId})">
                        <div class="list-item-icon">👥</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Roles & Permissions</div>
                            <div class="list-item-subtitle">Manage member roles</div>
                        </div>
                        <div class="list-item-arrow">→</div>
                    </div>
                    
                    <div class="list-item" onclick="openGroupAnalyticsPanel(${groupId})">
                        <div class="list-item-icon">📊</div>
                        <div class="list-item-content">
                            <div class="list-item-title">Analytics</div>
                            <div class="list-item-subtitle">View group insights</div>
                        </div>
                        <div class="list-item-arrow">→</div>
                    </div>
                ` : ''}
                
                <div class="section-header" style="margin-top: 20px;">
                    <div class="section-title">Actions</div>
                </div>
                
                <div class="list-item" onclick="shareGroup(${groupId})">
                    <div class="list-item-icon">🔗</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Share Group</div>
                        <div class="list-item-subtitle">Invite others</div>
                    </div>
                    <div class="list-item-arrow">→</div>
                </div>
                
                ${group.joined && !group.isAdmin ? `
                    <button class="btn" style="background: var(--error); margin-top: 20px;" onclick="leaveGroup(${groupId})">
                        🚪 Leave Group
                    </button>
                ` : ''}
                
                ${group.isAdmin ? `
                    <button class="btn" style="background: var(--error); margin-top: 20px;" onclick="deleteGroupConfirm(${groupId})">
                        🗑️ Delete Group
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    showToastHelper('Settings opened ⚙️');
}

// 6. Group Moderation Panel - Full Dashboard
function openGroupModerationPanel(groupId) {
    const group = groupsState.userGroups.find(g => g.id === groupId);
    
    const modalHTML = `
        <div id="groupModerationPanelModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeModal('groupModerationPanel')">✕</div>
                <div class="modal-title">Moderation Panel</div>
            </div>
            <div class="modal-content">
                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 48px; margin-bottom: 12px;">🛡️</div>
                    <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Moderation</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Manage content and members</div>
                </div>
                
                <div class="section-header">
                    <div class="section-title">Quick Actions</div>
                </div>
                
                <div class="list-item" onclick="openPendingMemberRequests(${groupId})">
                    <div class="list-item-icon">⏳</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Pending Requests</div>
                        <div class="list-item-subtitle">3 members waiting approval</div>
                    </div>
                    <div class="list-item-arrow">→</div>
                </div>
                
                <div class="list-item" onclick="showToastHelper('Reviewing reported posts...')">
                    <div class="list-item-icon">⚠️</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Reported Content</div>
                        <div class="list-item-subtitle">2 posts flagged for review</div>
                    </div>
                    <div class="list-item-arrow">→</div>
                </div>
                
                <div class="list-item" onclick="showToastHelper('Opening member reports...')">
                    <div class="list-item-icon">🚫</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Member Reports</div>
                        <div class="list-item-subtitle">1 member under review</div>
                    </div>
                    <div class="list-item-arrow">→</div>
                </div>
                
                <div class="section-header" style="margin-top: 20px;">
                    <div class="section-title">Moderation Tools</div>
                </div>
                
                <div class="toggle-container">
                    <div>
                        <div class="list-item-title">Post Approval Required</div>
                        <div class="list-item-subtitle">Review posts before publishing</div>
                    </div>
                    <div class="toggle-switch" onclick="toggleGroupSetting(${groupId}, 'postApproval', this)">
                        <div class="toggle-slider"></div>
                    </div>
                </div>
                
                <div class="toggle-container">
                    <div>
                        <div class="list-item-title">Auto-Moderate Links</div>
                        <div class="list-item-subtitle">Automatically filter suspicious links</div>
                    </div>
                    <div class="toggle-switch active" onclick="toggleGroupSetting(${groupId}, 'autoModerate', this)">
                        <div class="toggle-slider"></div>
                    </div>
                </div>
                
                <div class="toggle-container">
                    <div>
                        <div class="list-item-title">Spam Filter</div>
                        <div class="list-item-subtitle">Block spam and repetitive content</div>
                    </div>
                    <div class="toggle-switch active" onclick="toggleGroupSetting(${groupId}, 'spamFilter', this)">
                        <div class="toggle-slider"></div>
                    </div>
                </div>
                
                <div class="list-item" onclick="openGroupRulesEditor(${groupId})">
                    <div class="list-item-icon">📋</div>
                    <div class="list-item-content">
                        <div class="list-item-title">Edit Group Rules</div>
                        <div class="list-item-subtitle">Manage community guidelines</div>
                    </div>
                    <div class="list-item-arrow">→</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    showToastHelper('Moderation panel opened 🛡️');
}

// 7. Roles & Permissions - Full Dashboard
function openGroupRolesPermissions(groupId) {
    const members = groupsState.groupMembers[groupId] || [];
    const admins = members.filter(m => m.role === 'Admin');
    const moderators = members.filter(m => m.role === 'Moderator');
    const regularMembers = members.filter(m => m.role === 'Member');
    
    const modalHTML = `
        <div id="groupRolesPermissionsModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeModal('groupRolesPermissions')">✕</div>
                <div class="modal-title">Roles & Permissions</div>
            </div>
            <div class="modal-content">
                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 48px; margin-bottom: 12px;">👥</div>
                    <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Manage Roles</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Assign member permissions</div>
                </div>
                
                <div class="section-header">
                    <div class="section-title">Admins (${admins.length})</div>
                </div>
                ${admins.map(member => `
                    <div class="friend-card">
                        <div class="friend-avatar">${member.emoji}</div>
                        <div class="friend-info">
                            <div class="friend-name">${member.name}</div>
                            <div class="friend-mutual">Full permissions</div>
                        </div>
                        <button class="friend-btn secondary" onclick="showToastHelper('Managing ${member.name} role...')">Edit</button>
                    </div>
                `).join('')}
                
                <div class="section-header" style="margin-top: 20px;">
                    <div class="section-title">Moderators (${moderators.length})</div>
                    <div class="section-link" onclick="showToastHelper('Adding moderator...')">+ Add</div>
                </div>
                ${moderators.map(member => `
                    <div class="friend-card">
                        <div class="friend-avatar">${member.emoji}</div>
                        <div class="friend-info">
                            <div class="friend-name">${member.name}</div>
                            <div class="friend-mutual">Can moderate content</div>
                        </div>
                        <button class="friend-btn secondary" onclick="showToastHelper('Managing ${member.name} role...')">Edit</button>
                    </div>
                `).join('')}
                
                <div class="section-header" style="margin-top: 20px;">
                    <div class="section-title">Members (${regularMembers.length})</div>
                </div>
                ${regularMembers.slice(0, 3).map(member => `
                    <div class="friend-card">
                        <div class="friend-avatar">${member.emoji}</div>
                        <div class="friend-info">
                            <div class="friend-name">${member.name}</div>
                            <div class="friend-mutual">Standard permissions</div>
                        </div>
                        <button class="friend-btn secondary" onclick="showToastHelper('Promoting ${member.name}...')">Promote</button>
                    </div>
                `).join('')}
                
                <div class="section-header" style="margin-top: 20px;">
                    <div class="section-title">Permission Settings</div>

// Export functions for use in main app
if (typeof window !== 'undefined') {
    window.groupsState = groupsState;
    window.initializeGroupsSystem = initializeGroupsSystem;
    window.openGroupDetailsDashboard = openGroupDetailsDashboard;
    window.closeGroupDetailsDashboard = closeGroupDetailsDashboard;
}

console.log('✓ ConnectHub Groups System Loaded');
