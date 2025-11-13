/**
 * CREATOR/INFLUENCER PROFILE JAVASCRIPT
 * Complete functionality for creator dashboard
 */

// Global state
let currentTab = 'profile';
let currentCalendarView = 'month';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Sample data for demo
const sampleContent = [
    { id: 1, title: 'Tech Review Video', type: 'video', views: 125000, engagement: 8.5, date: '2024-12-20' },
    { id: 2, title: 'Behind the Scenes', type: 'image', views: 89000, engagement: 12.3, date: '2024-12-22' },
    { id: 3, title: 'Tutorial Series', type: 'video', views: 234000, engagement: 15.7, date: '2024-12-25' },
    { id: 4, title: 'Product Launch', type: 'post', views: 156000, engagement: 9.2, date: '2024-12-27' },
    { id: 5, title: 'Q&A Session', type: 'live', views: 67000, engagement: 18.4, date: '2024-12-28' }
];

const sampleTransactions = [
    { date: '2024-12-15', type: 'Subscription', description: 'Premium tier subscribers', amount: '$3,245.00', status: 'Completed' },
    { date: '2024-12-14', type: 'Donation', description: 'Tips from live stream', amount: '$890.50', status: 'Completed' },
    { date: '2024-12-13', type: 'Sponsorship', description: 'Brand partnership payment', amount: '$5,000.00', status: 'Completed' },
    { date: '2024-12-12', type: 'Merchandise', description: 'Product sales', amount: '$1,245.75', status: 'Completed' },
    { date: '2024-12-10', type: 'Subscription', description: 'Monthly recurring revenue', amount: '$2,890.00', status: 'Completed' }
];

const contentIdeas = [
    { icon: '🎯', title: 'Product Review', description: 'Review the latest tech gadget from your sponsors', category: 'sponsored' },
    { icon: '📚', title: 'Tutorial Series', description: 'Create a step-by-step guide for beginners', category: 'educational' },
    { icon: '🎬', title: 'Behind the Scenes', description: 'Show your creative process and workspace', category: 'personal' },
    { icon: '💬', title: 'Q&A Live Stream', description: 'Answer questions from your community', category: 'engagement' },
    { icon: '🔥', title: 'Trending Challenge', description: 'Join the latest viral trend in your niche', category: 'trending' },
    { icon: '🎨', title: 'Collaboration', description: 'Partner with another creator for unique content', category: 'collab' }
];

// ==============================================
// INITIALIZATION
// ==============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Creator Profile initialized');
    initializeProfile();
    populateContentShowcase();
    populateAnalyticsTables();
    populateTransactions();
    initializeCalendar();
    populateContentIdeas();
    populateScheduledPosts();
    populateContentLibrary();
    renderCharts();
});

function initializeProfile() {
    // Set default active tab
    switchTab('profile');
}

// ==============================================
// TAB SWITCHING
// ==============================================

function switchTab(tabName) {
    currentTab = tabName;
    
    // Hide all tabs
    document.querySelectorAll('.tab-section').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    showToast(`Switched to ${tabName} tab`, 'success');
}

// ==============================================
// PROFILE FUNCTIONS
// ==============================================

function editProfile() {
    showToast('Edit profile feature - Opening editor', 'info');
    // In a real app, this would open an edit modal
}

function editProfilePhoto() {
    showToast('Upload profile photo', 'info');
    // File upload would happen here
}

function editCoverPhoto() {
    showToast('Upload cover photo', 'info');
    // File upload would happen here
}

function shareProfile() {
    showToast('Share link copied to clipboard!', 'success');
    // Copy link to clipboard
}

function viewPublicProfile() {
    showToast('Opening public profile view', 'info');
    window.open('creator-profile.html', '_blank');
}

function openSettings() {
    showToast('Opening settings', 'info');
}

function applyForVerification() {
    showToast('Opening verification application', 'info');
}

function upgradeToPremium() {
    showToast('Opening premium upgrade options', 'info');
}

function becomePartner() {
    showToast('Opening partnership application', 'info');
}

function manageContent() {
    switchTab('content');
}

function editSocialLinks() {
    showToast('Edit social links', 'info');
}

function openLink(platform) {
    showToast(`Opening ${platform} profile`, 'info');
}

// ==============================================
// CONTENT SHOWCASE
// ==============================================

function populateContentShowcase() {
    const container = document.getElementById('contentShowcase');
    if (!container) return;
    
    const contentHTML = Array.from({length: 12}, (_, i) => `
        <div class="content-item-card" onclick="viewContentItem(${i + 1})">
            <div class="content-item-preview">
                ${['📸', '🎥', '📝', '🎬'][i % 4]}
            </div>
            <div class="content-item-info">
                <div class="content-item-title">Content ${i + 1}</div>
                <div class="content-item-meta">
                    <span>${Math.floor(Math.random() * 500)}K views</span>
                    <span>${(Math.random() * 15 + 5).toFixed(1)}% engagement</span>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = contentHTML;
}

function viewContentItem(id) {
    showToast(`Viewing content item #${id}`, 'info');
}

// ==============================================
// ANALYTICS FUNCTIONS
// ==============================================

function filterAnalytics(period) {
    // Remove active class from all filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    showToast(`Filtering analytics for ${period}`, 'success');
    // In a real app, this would fetch new data
    updateCharts(period);
}

function updateChart(chartName, metric) {
    showToast(`Updating ${chartName} chart with ${metric} data`, 'info');
    // Chart update logic here
}

function viewFullDemographics() {
    showToast('Opening detailed demographics view', 'info');
}

function exportAnalytics() {
    showToast('Exporting analytics data...', 'success');
    setTimeout(() => {
        showToast('Analytics exported successfully!', 'success');
    }, 1500);
}

function populateAnalyticsTables() {
    const tbody = document.getElementById('performanceTableBody');
    if (!tbody) return;
    
    const rows = sampleContent.map(item => `
        <tr>
            <td>${item.title}</td>
            <td>${item.views.toLocaleString()}</td>
            <td>${item.engagement}%</td>
            <td>${Math.floor(item.views * 0.15).toLocaleString()}</td>
            <td>$${(item.views * 0.005).toFixed(2)}</td>
            <td>
                <button class="btn btn-small" onclick="viewContentDetails(${item.id})">View</button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = rows;
}

function viewContentDetails(id) {
    showToast(`Viewing details for content #${id}`, 'info');
}

function renderCharts() {
    // Growth Chart
    const growthCanvas = document.getElementById('growthCanvas');
    if (growthCanvas) {
        const ctx = growthCanvas.getContext('2d');
        drawLineChart(ctx, growthCanvas.width, growthCanvas.height);
    }
    
    // Demographics Chart
    const demoCanvas = document.getElementById('demographicsCanvas');
    if (demoCanvas) {
        const ctx = demoCanvas.getContext('2d');
        drawPieChart(ctx, demoCanvas.width, demoCanvas.height);
    }
    
    // Activity Heatmap
    renderActivityHeatmap();
}

function drawLineChart(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const points = 30;
    for (let i = 0; i < points; i++) {
        const x = (width / points) * i;
        const y = height / 2 + Math.sin(i * 0.5) * 100 + Math.random() * 50;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    
    ctx.stroke();
}

function drawPieChart(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    const data = [42, 18, 12, 8, 20];
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
    
    let currentAngle = -Math.PI / 2;
    
    data.forEach((value, index) => {
        const sliceAngle = (value / 100) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index];
        ctx.fill();
        
        currentAngle += sliceAngle;
    });
}

function renderActivityHeatmap() {
    const container = document.getElementById('activityHeatmap');
    if (!container) return;
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = ['12am', '6am', '12pm', '6pm'];
    
    let html = '<div style="display: grid; grid-template-columns: 50px repeat(24, 1fr); gap: 2px; font-size: 0.7rem;">';
    
    // Header
    html += '<div></div>';
    for (let i = 0; i < 24; i++) {
        if (i % 6 === 0) html += `<div style="text-align: center;">${hours[i/6]}</div>`;
        else html += '<div></div>';
    }
    
    // Days
    days.forEach(day => {
        html += `<div style="padding: 4px;">${day}</div>`;
        for (let i = 0; i < 24; i++) {
            const intensity = Math.random();
            const color = `rgba(99, 102, 241, ${intensity})`;
            html += `<div style="background: ${color}; height: 20px; border-radius: 2px;" title="${day} ${i}:00 - ${intensity.toFixed(2)}"></div>`;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function updateCharts(period) {
    renderCharts();
}

// ==============================================
// MONETIZATION FUNCTIONS
// ==============================================

function openStreamDetails(type) {
    showToast(`Opening ${type} details`, 'info');
}

function manageSubscriptions() {
    showToast('Opening subscription management', 'info');
}

function setupDonations() {
    showToast('Setting up donation options', 'info');
}

function findSponsors() {
    showToast('Opening sponsor marketplace', 'info');
}

function manageMerch() {
    showToast('Opening merchandise store', 'info');
}

function createNewTier() {
    showToast('Creating new subscription tier', 'info');
}

function editTier(tier) {
    showToast(`Editing ${tier} tier`, 'info');
}

function requestPayout() {
    showToast('Processing payout request...', 'info');
    setTimeout(() => {
        showToast('Payout requested successfully!', 'success');
    }, 1500);
}

function changePaymentMethod() {
    showToast('Opening payment method options', 'info');
}

function updatePayoutSchedule(schedule) {
    showToast(`Payout schedule updated to ${schedule}`, 'success');
}

function exportTransactions() {
    showToast('Exporting transaction history...', 'info');
    setTimeout(() => {
        showToast('Transactions exported successfully!', 'success');
    }, 1500);
}

function populateTransactions() {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;
    
    const rows = sampleTransactions.map(txn => `
        <tr>
            <td>${txn.date}</td>
            <td>${txn.type}</td>
            <td>${txn.description}</td>
            <td style="font-weight: 600; color: var(--creator-success);">${txn.amount}</td>
            <td><span style="padding: 0.25rem 0.75rem; background: var(--creator-success); color: white; border-radius: 12px; font-size: 0.85rem;">${txn.status}</span></td>
        </tr>
    `).join('');
    
    tbody.innerHTML = rows;
}

// ==============================================
// CALENDAR FUNCTIONS
// ==============================================

function initializeCalendar() {
    renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    
    // Update title
    const title = document.getElementById('calendarTitle');
    if (title) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        title.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
    
    let html = '';
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day" style="opacity: 0.3;"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate() && 
                       currentMonth === today.getMonth() && 
                       currentYear === today.getFullYear();
        
        const posts = day % 3 === 0 ? ['📝 Blog Post', '🎥 Video'] : day % 2 === 0 ? ['📸 Photo'] : [];
        
        html += `
            <div class="calendar-day ${isToday ? 'today' : ''}" onclick="selectCalendarDay(${day})">
                <div class="day-number">${day}</div>
                <div class="day-posts">
                    ${posts.map(post => `<div class="day-post-indicator">${post}</div>`).join('')}
                </div>
            </div>
        `;
    }
    
    grid.innerHTML = html;
}

function selectCalendarDay(day) {
    showToast(`Selected ${day}`, 'info');
}

function previousPeriod() {
    if (currentMonth === 0) {
        currentMonth = 11;
        currentYear--;
    } else {
        currentMonth--;
    }
    renderCalendar();
}

function nextPeriod() {
    if (currentMonth === 11) {
        currentMonth = 0;
        currentYear++;
    } else {
        currentMonth++;
    }
    renderCalendar();
}

function switchCalendarView(view) {
    currentCalendarView = view;
    
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    showToast(`Switched to ${view} view`, 'success');
}

function schedulePost() {
    const modal = document.getElementById('scheduleModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function viewCalendarSettings() {
    showToast('Opening calendar settings', 'info');
}

function saveScheduledPost() {
    const dateTime = document.getElementById('scheduleDateTime').value;
    const type = document.getElementById('contentType').value;
    const caption = document.getElementById('contentCaption').value;
    
    if (!dateTime || !caption) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    showToast('Post scheduled successfully!', 'success');
    closeModal('scheduleModal');
    
    // Clear form
    document.getElementById('scheduleDateTime').value = '';
    document.getElementById('contentCaption').value = '';
    
    // Refresh scheduled posts
    populateScheduledPosts();
}

function populateScheduledPosts() {
    const container = document.getElementById('scheduledPostsList');
    if (!container) return;
    
    const posts = [
        { id: 1, title: 'Tech Review Video', time: 'Dec 20, 2024 at 10:00 AM', status: 'scheduled', type: '🎥' },
        { id: 2, title: 'Behind the Scenes Photo', time: 'Dec 22, 2024 at 3:00 PM', status: 'scheduled', type: '📸' },
        { id: 3, title: 'Tutorial Series Part 1', time: 'Dec 25, 2024 at 12:00 PM', status: 'scheduled', type: '📝' },
        { id: 4, title: 'Q&A Live Stream', time: 'Dec 28, 2024 at 6:00 PM', status: 'scheduled', type: '🎬' }
    ];
    
    const html = posts.map(post => `
        <div class="scheduled-post-card">
            <div class="post-thumbnail">${post.type}</div>
            <div class="post-details">
                <div class="post-title">${post.title}</div>
                <div class="post-meta">⏰ ${post.time}</div>
            </div>
            <div class="post-actions">
                <button class="btn btn-small" onclick="editScheduledPost(${post.id})">✏️ Edit</button>
                <button class="btn btn-small btn-error" onclick="deleteScheduledPost(${post.id})">🗑️</button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function editScheduledPost(id) {
    showToast(`Editing scheduled post #${id}`, 'info');
}

function deleteScheduledPost(id) {
    if (confirm('Are you sure you want to delete this scheduled post?')) {
        showToast('Post deleted', 'success');
        populateScheduledPosts();
    }
}

function filterPosts(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    showToast(`Filtering posts: ${filter}`, 'success');
}

function generateIdeas() {
    showToast('Generating content ideas with AI...', 'info');
    setTimeout(() => {
        showToast('New ideas generated!', 'success');
        populateContentIdeas();
    }, 1500);
}

function populateContentIdeas() {
    const container = document.getElementById('contentIdeas');
    if (!container) return;
    
    const html = contentIdeas.map((idea, index) => `
        <div class="idea-card" onclick="useIdea(${index})">
            <div class="idea-icon">${idea.icon}</div>
            <div class="idea-title">${idea.title}</div>
            <div class="idea-description">${idea.description}</div>
            <button class="btn btn-primary btn-small">Use This Idea</button>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function useIdea(index) {
    const idea = contentIdeas[index];
    showToast(`Creating post from idea: ${idea.title}`, 'success');
    schedulePost();
}

// ==============================================
// CONTENT MANAGEMENT
// ==============================================

function createNewContent() {
    showToast('Opening content creator', 'info');
    schedulePost();
}

function searchContent(query) {
    if (query.length < 2) return;
    showToast(`Searching for: ${query}`, 'info');
}

function filterContentType(type) {
    showToast(`Filtering content: ${type}`, 'success');
}

function populateContentLibrary() {
    const container = document.getElementById('contentLibrary');
    if (!container) return;
    
    const items = sampleContent.map(item => `
        <div class="content-item-card" onclick="editContent(${item.id})">
            <div class="content-item-preview">
                ${item.type === 'video' ? '🎥' : item.type === 'image' ? '📸' : item.type === 'live' ? '🎬' : '📝'}
            </div>
            <div class="content-item-info">
                <div class="content-item-title">${item.title}</div>
                <div class="content-item-meta">
                    <span>${item.views.toLocaleString()} views</span>
                    <span>${item.engagement}%</span>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = items;
}

function editContent(id) {
    showToast(`Editing content #${id}`, 'info');
}

// ==============================================
// MODAL FUNCTIONS
// ==============================================

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

function showToast(message, type = 'info') {
    // Create toast if it doesn't exist
    let toast = document.getElementById('creatorToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'creatorToast';
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 1rem 1.5rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            display: none;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
    }
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.style.borderLeftColor = colors[type] || colors.info;
    toast.style.borderLeftWidth = '4px';
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.5rem;">${icons[type]}</span>
            <span>${message}</span>
        </div>
    `;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

console.log('✅ Creator Profile JavaScript loaded successfully');
