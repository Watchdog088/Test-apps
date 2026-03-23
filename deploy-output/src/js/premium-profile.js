/**
 * PREMIUM PROFILE JAVASCRIPT
 * Complete functionality for premium features
 */

// Global State
let currentTab = 'overview';
let currentTheme = null;
let userSubscription = null;
let userBadges = [];
let privacySettings = {};
let storageQuota = { used: 0, total: 1 };

// API Base URL
const API_BASE = '/api';

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Premium Profile initialized');
    initializePremiumProfile();
});

async function initializePremiumProfile() {
    await loadUserData();
    await loadSubscriptionStatus();
    await loadPrivacySettings();
    await loadStorageQuota();
    await loadThemes();
    await loadBadges();
    await loadProfileViews();
    await loadPaymentHistory();
    await loadSupportTickets();
    
    switchTab('overview');
}

// ============================================
// USER DATA & SUBSCRIPTION
// ============================================

async function loadUserData() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        
        if (data.success) {
            updatePremiumStatus(data.user.subscriptionTier || 'free');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function loadSubscriptionStatus() {
    try {
        const response = await fetch(`${API_BASE}/monetization/subscription`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        
        if (data.success && data.subscription) {
            userSubscription = data.subscription;
            updateSubscriptionDisplay();
        }
    } catch (error) {
        console.error('Error loading subscription:', error);
    }
}

function updatePremiumStatus(tier) {
    const statusEl = document.getElementById('premiumStatus');
    if (!statusEl) return;
    
    const tierNames = {
        'free': 'Free Plan',
        'premium': 'Premium Member',
        'premium_yearly': 'Premium Annual'
    };
    
    statusEl.textContent = tierNames[tier] || 'Free Plan';
    
    if (tier !== 'free') {
        statusEl.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
    }
}

function updateSubscriptionDisplay() {
    if (!userSubscription) return;
    
    const card = document.getElementById('currentSubscriptionCard');
    const details = document.getElementById('subscriptionDetails');
    
    if (card) card.style.display = 'block';
    
    if (details) {
        const endDate = new Date(userSubscription.endDate).toLocaleDateString();
        details.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">Plan:</span>
                <span class="detail-value">${userSubscription.plan.name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${userSubscription.status}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Renewal Date:</span>
                <span class="detail-value">${endDate}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value">$${userSubscription.amount}/${userSubscription.plan.billingCycle}</span>
            </div>
        `;
    }
}

async function subscribeToPlan(plan, billing) {
    showModal('subscribeModal');
    
    const form = document.getElementById('subscriptionForm');
    form.innerHTML = `
        <div class="subscription-summary">
            <h3>Subscribe to ${plan === 'premium' ? 'Premium' : 'Premium Annual'}</h3>
            <p class="plan-description">
                ${billing === 'monthly' ? '$9.99/month' : '$95.99/year (Save 20%)'}
            </p>
        </div>
        
        <div class="form-group">
            <label>Card Number</label>
            <input type="text" class="form-input" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
                <label>Expiry Date</label>
                <input type="text" class="form-input" id="cardExpiry" placeholder="MM/YY" maxlength="5">
            </div>
            <div class="form-group">
                <label>CVV</label>
                <input type="text" class="form-input" id="cardCVV" placeholder="123" maxlength="3">
            </div>
        </div>
        
        <div class="form-group">
            <label>
                <input type="checkbox" id="agreeTerms">
                I agree to the terms and conditions
            </label>
        </div>
        
        <div class="modal-actions">
            <button class="btn btn-secondary" onclick="closeModal('subscribeModal')">Cancel</button>
            <button class="btn btn-primary" onclick="processSubscription('${plan}', '${billing}')">
                Subscribe Now
            </button>
        </div>
    `;
}

async function processSubscription(plan, billing) {
    const cardNumber = document.getElementById('cardNumber').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVV = document.getElementById('cardCVV').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    if (!cardNumber || !cardExpiry || !cardCVV || !agreeTerms) {
        showToast('Please fill in all fields and agree to terms', 'error');
        return;
    }
    
    try {
        showToast('Processing payment...', 'info');
        
        // Simulate subscription activation
        showToast('Subscription activated successfully!', 'success');
        closeModal('subscribeModal');
        
        // Unlock premium features
        await unlockPremiumFeatures();
        
        // Reload subscription status
        await loadSubscriptionStatus();
        
        // Award premium badge
        await awardBadge('premium_member');
    } catch (error) {
        console.error('Subscription error:', error);
        showToast('Subscription failed: ' + error.message, 'error');
    }
}

async function unlockPremiumFeatures() {
    try {
        // Enable ad-free experience
        localStorage.setItem('adFreeMode', 'true');
        
        // Increase storage quota
        storageQuota.total = 10;
        updateStorageDisplay();
        
        // Enable all premium features
        const features = ['custom_themes', 'exclusive_badges', 'incognito_mode', 
                         'advanced_analytics', 'priority_support', 'offline_download'];
        
        for (const feature of features) {
            localStorage.setItem(`feature_${feature}`, 'true');
        }
        
        showToast('All premium features unlocked!', 'success');
    } catch (error) {
        console.error('Error unlocking features:', error);
    }
}

function manageSubscription() {
    showToast('Opening subscription management', 'info');
}

function upgradeToPremium() {
    switchTab('subscription');
    showToast('Upgrade to premium to unlock this feature', 'info');
}

function hasPremiumAccess() {
    return localStorage.getItem('adFreeMode') === 'true' || userSubscription !== null;
}

// ============================================
// THEME SYSTEM
// ============================================

const predefinedThemes = [
    {
        id: 'dark_default',
        name: 'Default Dark',
        primary: '#6366f1',
        secondary: '#8b5cf6',
        background: '#1a1a1a',
        text: '#ffffff',
        isPremium: false
    },
    {
        id: 'midnight_blue',
        name: 'Midnight Blue',
        primary: '#3b82f6',
        secondary: '#06b6d4',
        background: '#0f172a',
        text: '#e2e8f0',
        isPremium: true
    },
    {
        id: 'forest_green',
        name: 'Forest Green',
        primary: '#10b981',
        secondary: '#059669',
        background: '#064e3b',
        text: '#d1fae5',
        isPremium: true
    },
    {
        id: 'sunset_orange',
        name: 'Sunset Orange',
        primary: '#f59e0b',
        secondary: '#f97316',
        background: '#78350f',
        text: '#fef3c7',
        isPremium: true
    },
    {
        id: 'royal_purple',
        name: 'Royal Purple',
        primary: '#a855f7',
        secondary: '#c026d3',
        background: '#581c87',
        text: '#f3e8ff',
        isPremium: true
    },
    {
        id: 'rose_gold',
        name: 'Rose Gold',
        primary: '#f43f5e',
        secondary: '#fbbf24',
        background: '#9f1239',
        text: '#ffe4e6',
        isPremium: true
    }
];

async function loadThemes() {
    const grid = document.getElementById('themesGrid');
    if (!grid) return;
    
    // Load active theme from localStorage
    const savedTheme = localStorage.getItem('selectedTheme');
    currentTheme = savedTheme ? JSON.parse(savedTheme) : predefinedThemes[0];
    
    // Apply current theme
    applyTheme(currentTheme);
    
    // Render theme cards
    grid.innerHTML = predefinedThemes.map(theme => `
        <div class="theme-card ${theme.id === currentTheme.id ? 'active' : ''}" 
             onclick="selectTheme('${theme.id}')" 
             data-theme-id="${theme.id}">
            <div class="theme-preview">
                <div class="preview-header" style="background: ${theme.primary}">Header</div>
                <div class="preview-sidebar" style="background: ${theme.background}"></div>
                <div class="preview-content" style="background: ${theme.background}; opacity: 0.8;"></div>
            </div>
            <div class="theme-name">${theme.name}</div>
            ${theme.isPremium ? '<span class="premium-only-tag">Premium</span>' : ''}
        </div>
    `).join('');
}

function selectTheme(themeId) {
    const theme = predefinedThemes.find(t => t.id === themeId);
    if (!theme) return;
    
    // Check if premium theme and user has access
    if (theme.isPremium && !hasPremiumAccess()) {
        showToast('This theme requires a premium subscription', 'error');
        upgradeToPremium();
        return;
    }
    
    currentTheme = theme;
    applyTheme(theme);
    
    // Save to localStorage
    localStorage.setItem('selectedTheme', JSON.stringify(theme));
    
    // Update UI
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-theme-id="${themeId}"]`)?.classList.add('active');
    
    // Update current theme preview
    updateCurrentThemePreview();
    
    showToast(`Theme changed to ${theme.name}`, 'success');
}

function applyTheme(theme) {
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    document.documentElement.style.setProperty('--bg-primary', theme.background);
    document.documentElement.style.setProperty('--text-primary', theme.text);
}

function updateCurrentThemePreview() {
    const preview = document.getElementById('currentThemePreview');
    const name = document.getElementById('currentThemeName');
    
    if (preview && currentTheme) {
        preview.querySelector('.preview-header').style.background = currentTheme.primary;
        preview.querySelector('.preview-sidebar').style.background = currentTheme.background;
        preview.querySelector('.preview-content').style.background = currentTheme.background;
    }
    
    if (name && currentTheme) {
        name.textContent = currentTheme.name;
    }
}

async function saveCustomTheme() {
    if (!hasPremiumAccess()) {
        showToast('Custom themes require a premium subscription', 'error');
        upgradeToPremium();
        return;
    }
    
    const primary = document.getElementById('primaryColor').value;
    const secondary = document.getElementById('secondaryColor').value;
    const background = document.getElementById('backgroundColor').value;
    const text = document.getElementById('textColor').value;
    
    const customTheme = {
        id: 'custom_' + Date.now(),
        name: 'Custom Theme',
        primary,
        secondary,
        background,
        text,
        isPremium: true,
        isCustom: true
    };
    
    predefinedThemes.push(customTheme);
    applyTheme(customTheme);
    await loadThemes();
    showToast('Custom theme saved successfully!', 'success');
}

// ============================================
// BADGE SYSTEM
// ============================================

const availableBadges = [
    { id: 'early_adopter', name: 'Early Adopter', icon: '🌟', description: 'Joined in the first month', unlockCondition: 'auto', earned: false },
    { id: 'premium_member', name: 'Premium Member', icon: '⭐', description: 'Active premium subscription', unlockCondition: 'subscription', earned: false },
    { id: 'verified_creator', name: 'Verified Creator', icon: '✅', description: 'Official verified account', unlockCondition: 'verification', earned: false },
    { id: 'top_contributor', name: 'Top Contributor', icon: '🏆', description: 'Made 1000+ posts', unlockCondition: 'posts_1000', earned: false },
    { id: 'social_butterfly', name: 'Social Butterfly', icon: '🦋', description: '1000+ connections', unlockCondition: 'connections_1000', earned: false },
    { id: 'influencer', name: 'Influencer', icon: '💫', description: '100K+ followers', unlockCondition: 'followers_100k', earned: false },
    { id: 'content_king', name: 'Content King', icon: '👑', description: '1M+ total views', unlockCondition: 'views_1m', earned: false },
    { id: 'engagement_master', name: 'Engagement Master', icon: '🎯', description: '10%+ engagement rate', unlockCondition: 'engagement_10', earned: false }
];

async function loadBadges() {
    updateBadgeDisplay();
}

function updateBadgeDisplay() {
    const earnedCount = userBadges.filter(b => b.earned).length;
    const totalCount = availableBadges.length;
    const progress = Math.round((earnedCount / totalCount) * 100);
    
    document.getElementById('earnedBadges').textContent = earnedCount;
    document.getElementById('totalBadges').textContent = totalCount;
    document.getElementById('badgeProgress').textContent = progress + '%';
    
    // Update equipped badges
    const equippedContainer = document.getElementById('equippedBadges');
    const equipped = userBadges.filter(b => b.equipped).slice(0, 5);
    
    if (equipped.length === 0) {
        equippedContainer.innerHTML = '<div class="empty-state">No badges equipped</div>';
    } else {
        equippedContainer.innerHTML = equipped.map(badge => `
            <div class="badge-item">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
            </div>
        `).join('');
    }
    
    // Render badges grid
    const grid = document.getElementById('badgesGrid');
    if (grid) {
        grid.innerHTML = availableBadges.map(badge => {
            const userBadge = userBadges.find(b => b.id === badge.id);
            const earned = userBadge && userBadge.earned;
            
            return `
                <div class="badge-card ${earned ? 'earned' : 'locked'}" 
                     onclick="badgeClick('${badge.id}')">
                    <div class="badge-icon">${badge.icon}</div>
                    <div class="badge-name">${badge.name}</div>
                    <div class="badge-description">${badge.description}</div>
                    ${!earned ? `<div class="badge-locked-message">🔒 Locked</div>` : ''}
                </div>
            `;
        }).join('');
    }
}

function badgeClick(badgeId) {
    const badge = availableBadges.find(b => b.id === badgeId);
    const userBadge = userBadges.find(b => b.id === badgeId);
    
    if (userBadge && userBadge.earned) {
        toggleBadgeEquip(badgeId);
    } else {
        showToast(`This badge is locked. ${badge.description}`, 'info');
    }
}

async function toggleBadgeEquip(badgeId) {
    const badge = userBadges.find(b => b.id === badgeId);
    if (badge) {
        badge.equipped = !badge.equipped;
        await loadBadges();
        showToast('Badge equipment updated', 'success');
    }
}

async function awardBadge(badgeId) {
    const existingBadge = userBadges.find(b => b.id === badgeId);
    if (!existingBadge) {
        const badge = availableBadges.find(b => b.id === badgeId);
        if (badge) {
            userBadges.push({...badge, earned: true, equipped: false});
            await loadBadges();
            showToast(`🎉 Badge Unlocked: ${badge.name}!`, 'success');
        }
    }
}

function updateBadgePreview() {
    const icon = document.getElementById('badgeIcon').value;
    const color = document.getElementById('badgeColor').value;
    const preview = document.getElementById('customBadgePreview');
    const previewIcon = document.getElementById('previewIcon');
    
    if (previewIcon) previewIcon.textContent = icon || '⭐';
    if (preview) preview.style.background = color;
}

async function createCustomBadge() {
    if (!hasPremiumAccess()) {
        showToast('Custom badges require a premium subscription', 'error');
        upgradeToPremium();
        return;
    }
    
    const name = document.getElementById('badgeName').value;
    const icon = document.getElementById('badgeIcon').value;
    const color = document.getElementById('badgeColor').value;
    const description = document.getElementById('badgeDescription').value;
    
    if (!name || !icon || !description) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    showToast('Custom badge created successfully!', 'success');
    document.getElementById('badgeName').value = '';
    document.getElementById('badgeIcon').value = '';
    document.getElementById('badgeDescription').value = '';
    await loadBadges();
}

function editEquippedBadges() {
    showToast('Opening badge editor', 'info');
}

// ============================================
// PRIVACY & SECURITY
// ============================================

async function loadPrivacySettings() {
    // Load from localStorage as fallback
    privacySettings = {
        incognitoMode: localStorage.getItem('incognitoMode') === 'true',
        readReceipts: localStorage.getItem('readReceipts') !== 'false',
        onlineStatus: localStorage.getItem('onlineStatus') !== 'false',
        profileViews: localStorage.getItem('profileViews') || 'everyone'
    };
    applyPrivacySettings();
}

function applyPrivacySettings() {
    const incognitoEl = document.getElementById('incognitoMode');
    const readReceiptsEl = document.getElementById('readReceipts');
    const onlineStatusEl = document.getElementById('onlineStatus');
    
    if (incognitoEl) incognitoEl.checked = privacySettings.incognitoMode || false;
    if (readReceiptsEl) readReceiptsEl.checked = privacySettings.readReceipts !== false;
    if (onlineStatusEl) onlineStatusEl.checked = privacySettings.onlineStatus !== false;
    
    const profileViewsRadio = document.querySelector(`input[name="profileViews"][value="${privacySettings.profileViews || 'everyone'}"]`);
    if (profileViewsRadio) profileViewsRadio.checked = true;
}

async function toggleIncognitoMode() {
    const enabled = document.getElementById('incognitoMode').checked;
    
    if (enabled && !hasPremiumAccess()) {
        document.getElementById('incognitoMode').checked = false;
        showToast('Incognito mode requires a premium subscription', 'error');
        upgradeToPremium();
        return;
    }
    
    localStorage.setItem('incognitoMode', enabled);
    showToast(`Incognito mode ${enabled ? 'enabled' : 'disabled'}`, 'success');
}

async function toggleReadReceipts() {
    const enabled = document.getElementById('readReceipts').checked;
    localStorage.setItem('readReceipts', enabled);
    showToast(`Read receipts ${enabled ? 'enabled' : 'disabled'}`, 'success');
}

async function toggleOnlineStatus() {
    const enabled = document.getElementById('onlineStatus').checked;
    localStorage.setItem('onlineStatus', enabled);
    showToast(`Online status ${enabled ? 'visible' : 'hidden'}`, 'success');
}

async function updateProfileViewSettings() {
    const value = document.querySelector('input[name="profileViews"]:checked').value;
    
    if (value === 'none' && !hasPremiumAccess()) {
        document.querySelector('input[name="profileViews"][value="everyone"]').checked = true;
        showToast('This privacy setting requires a premium subscription', 'error');
        upgradeToPremium();
        return;
    }
    
    localStorage.setItem('profileViews', value);
    showToast('Profile view settings updated', 'success');
}

async function updateContentVisibility(type) {
    const value = document.getElementById(`${type}Visibility`).value;
    
    if (value === 'premium' && !hasPremiumAccess()) {
        document.getElementById(`${type}Visibility`).value = 'public';
        showToast('Premium content access requires a premium subscription', 'error');
        upgradeToPremium();
        return;
    }
    
    showToast(`${type} visibility updated`, 'success');
}

async function clearViewHistory() {
    if (!confirm('Are you sure you want to clear your profile view history?')) return;
    showToast('View history cleared', 'success');
    await loadProfileViews();
}

async function downloadMyData() {
    showToast('Preparing your data for download...', 'info');
    setTimeout(() => {
        showToast('Data downloaded successfully', 'success');
    }, 2000);
}

function viewPrivacySettings() {
    showToast('Opening advanced privacy settings', 'info');
}

async function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    if (!confirm('All your data will be permanently deleted. Are you absolutely sure?')) return;
    
    showToast('Account deletion in progress...', 'info');
}

// ============================================
// STORAGE MANAGEMENT
// ============================================

async function loadStorageQuota() {
    storageQuota = {
        used: 0.35,
        total: hasPremiumAccess() ? 10 : 1
    };
    updateStorageDisplay();
}

function updateStorageDisplay() {
    const used = parseFloat(storageQuota.used || 0).toFixed(2);
    const total = parseFloat(storageQuota.total || 1).toFixed(0);
    const percentage = (storageQuota.used / storageQuota.total) * 100;
    
    const usedEl = document.getElementById('storageUsed');
    const totalEl = document.getElementById('storageTotal');
    const bar = document.getElementById('storageBar');
    
    if (usedEl) usedEl.textContent = `${used} GB`;
    if (totalEl) totalEl.textContent = `${total} GB`;
    
    if (bar) {
        bar.style.width = `${percentage}%`;
        
        // Change color based on usage
        if (percentage > 90) bar.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        else if (percentage > 75) bar.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        else bar.style.background = 'var(--premium-gradient)';
    }
}

function manageStorage() {
    showToast('Opening storage management', 'info');
}

// ============================================
// PROFILE VIEWS & ANALYTICS
// ============================================

async function loadProfileViews() {
    const views = {
        total: 12456,
        today: 234,
        week: 1567,
        unique: 8934,
        recent: []
    };
    updateProfileViewsDisplay(views);
}

function updateProfileViewsDisplay(views) {
    const totalViews = views.total || 0;
    const todayViews = views.today || 0;
    const weekViews = views.week || 0;
    const uniqueVisitors = views.unique || 0;
    
    const totalEl = document.getElementById('totalViews');
    const todayEl = document.getElementById('todayViews');
    const weekEl = document.getElementById('weekViews');
    const uniqueEl = document.getElementById('uniqueVisitors');
    
    if (totalEl) totalEl.textContent = totalViews.toLocaleString();
    if (todayEl) todayEl.textContent = todayViews.toLocaleString();
    if (weekEl) weekEl.textContent = weekViews.toLocaleString();
    if (uniqueEl) uniqueEl.textContent = uniqueVisitors.toLocaleString();
}

function viewDetailedStats() {
    showToast('Opening detailed analytics', 'info');
}

// ============================================
// PAYMENT HISTORY
// ============================================

async function loadPaymentHistory() {
    const payments = [];
    updatePaymentHistory(payments);
}

function updatePaymentHistory(payments) {
    const tbody = document.getElementById('paymentHistory');
    if (!tbody) return;
    
    if (!payments || payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No payment history yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = payments.map(payment => `
        <tr>
            <td>${new Date(payment.date).toLocaleDateString()}</td>
            <td>${payment.description}</td>
            <td>$${payment.amount.toFixed(2)}</td>
            <td><span class="ticket-status ${payment.status}">${payment.status}</span></td>
            <td><button class="btn btn-small" onclick="downloadInvoice('${payment.id}')">📄 Invoice</button></td>
        </tr>
    `).join('');
}

async function downloadInvoice(paymentId) {
    showToast('Invoice downloaded', 'success');
}

function exportPayments() {
    showToast('Exporting payment history...', 'info');
}

// ============================================
// SUPPORT SYSTEM
// ============================================

async function loadSupportTickets() {
    const tickets = [];
    updateSupportTickets(tickets);
}

function updateSupportTickets(tickets) {
    const container = document.getElementById('supportTickets');
    if (!container) return;
    
    if (!tickets || tickets.length === 0) {
        container.innerHTML = '<div class="empty-state">No support tickets yet. Create one if you need help!</div>';
        return;
    }
    
    container.innerHTML = tickets.map(ticket => `
        <div class="ticket-item" onclick="viewTicket('${ticket.id}')">
            <div class="ticket-header">
                <div class="ticket-subject">${ticket.subject}</div>
                <span class="ticket-status ${ticket.status}">${ticket.status}</span>
            </div>
            <div class="ticket-meta">
                Created ${formatTime(ticket.createdAt)} • Priority: ${ticket.priority}
            </div>
        </div>
    `).join('');
}

function createSupportTicket() {
    showModal('supportTicketModal');
}

async function submitSupportTicket() {
    const subject = document.getElementById('ticketSubject').value;
    const priority = document.getElementById('ticketPriority').value;
    const category = document.getElementById('ticketCategory').value;
    const description = document.getElementById('ticketDescription').value;
    
    if (!subject || !description) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    showToast('Support ticket created successfully!', 'success');
    closeModal('supportTicketModal');
    await loadSupportTickets();
    
    // Clear form
    document.getElementById('ticketSubject').value = '';
    document.getElementById('ticketDescription').value = '';
}

function viewTicket(ticketId) {
    showToast(`Opening ticket #${ticketId}`, 'info');
}

function openLiveChat() {
    if (!hasPremiumAccess()) {
        showToast('Live chat requires a premium subscription', 'error');
        upgradeToPremium();
        return;
    }
    
    showToast('Opening live chat...', 'info');
}

function viewFAQ() {
    window.open('/help/faq', '_blank');
}

function contactEmail() {
    window.location.href = 'mailto:support@lynkapp.com';
}

// ============================================
// TAB NAVIGATION
// ============================================

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
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
}

function navigateToTab(tabName) {
    switchTab(tabName);
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

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

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showToast(message, type = 'info') {
    // Create toast if it doesn't exist
    let toast = document.getElementById('premiumToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'premiumToast';
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
            <span style="color: var(--text-primary);">${message}</span>
        </div>
    `;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
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

console.log('✅ Premium Profile JavaScript loaded successfully');
