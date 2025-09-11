/**
 * Interest Personalization Dashboard - Exact Design Implementation
 * Using the exact design and functionality from the provided HTML file
 */

// Sample interest data organized by categories
const interestCategories = {
    "🔬 Technology": [
        "Artificial Intelligence", "Programming", "Web Development", "Mobile Apps", "Blockchain", 
        "Cybersecurity", "Data Science", "Cloud Computing", "IoT", "Virtual Reality", "Gaming", 
        "Startups", "Tech News", "Software Engineering"
    ],
    "🎨 Creative Arts": [
        "Photography", "Digital Art", "Graphic Design", "Video Editing", "Music Production", 
        "Writing", "Painting", "Drawing", "Sculpture", "Fashion Design", "Interior Design", 
        "Animation", "Film Making", "Creative Writing"
    ],
    "🎵 Music & Entertainment": [
        "Pop Music", "Rock", "Electronic", "Hip Hop", "Classical", "Jazz", "Country", 
        "Podcasts", "Movies", "TV Shows", "Netflix", "Streaming", "Live Music", "Concerts"
    ],
    "🏃 Fitness & Health": [
        "Gym", "Running", "Yoga", "Cycling", "Swimming", "Martial Arts", "CrossFit", 
        "Nutrition", "Meditation", "Mental Health", "Wellness", "Sports", "Hiking", "Climbing"
    ],
    "🌍 Travel & Adventure": [
        "Backpacking", "City Travel", "Beach", "Mountains", "Cultural Tourism", "Food Tourism", 
        "Photography Travel", "Solo Travel", "Adventure Sports", "Camping", "Road Trips", 
        "International Travel", "Local Exploration"
    ],
    "🍳 Food & Cooking": [
        "Cooking", "Baking", "Vegetarian", "Vegan", "Italian Cuisine", "Asian Cuisine", 
        "Street Food", "Fine Dining", "Coffee", "Wine", "Cocktails", "Food Photography", 
        "Recipe Sharing", "Restaurant Reviews"
    ],
    "📚 Learning & Education": [
        "Online Courses", "Language Learning", "History", "Science", "Philosophy", "Psychology", 
        "Literature", "Self-Improvement", "Skill Building", "Professional Development", 
        "Certifications", "Academic Research"
    ],
    "💼 Business & Career": [
        "Entrepreneurship", "Marketing", "Sales", "Leadership", "Finance", "Investing", 
        "Real Estate", "Networking", "Career Growth", "Personal Branding", "Business Strategy", 
        "E-commerce", "Freelancing"
    ],
    "🌱 Lifestyle": [
        "Sustainability", "Minimalism", "Home Decor", "Gardening", "Pets", "Family", 
        "Relationships", "Social Issues", "Volunteering", "Spirituality", "Personal Growth", 
        "Life Hacks", "Productivity"
    ],
    "🎮 Gaming & Hobbies": [
        "Video Games", "Board Games", "Card Games", "Collecting", "DIY Projects", "Crafts", 
        "Model Building", "Puzzles", "Chess", "Sports Betting", "Fantasy Sports", "Esports"
    ]
};

let selectedInterests = new Set();
let currentTab = 'interests';

// Function to ensure CSS variables are available
function ensureCSSVariables() {
    if (!document.querySelector('#personalization-styles')) {
        const style = document.createElement('style');
        style.id = 'personalization-styles';
        style.innerHTML = `
            :root {
                --primary: #4f46e5;
                --secondary: #ec4899;
                --glass: rgba(255, 255, 255, 0.05);
                --glass-border: rgba(255, 255, 255, 0.1);
                --text-primary: #ffffff;
                --text-secondary: #94a3b8;
            }
            
            @keyframes modalFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes modalSlideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes modalFadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            .category-card {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 1.5rem;
                transition: all 0.3s ease;
            }
            
            .category-card:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-2px);
            }
            
            .category-title {
                font-size: 1.1rem;
                font-weight: 600;
                margin-bottom: 1rem;
                color: white;
            }
            
            .interest-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            
            .interest-tag {
                padding: 0.5rem 1rem;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.9rem;
                color: white;
                user-select: none;
            }
            
            .interest-tag:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-1px);
            }
            
            .interest-tag.selected {
                background: linear-gradient(135deg, #4f46e5 0%, #ec4899 100%);
                color: white;
                border-color: #4f46e5;
            }
            
            .selected-tag {
                background: linear-gradient(135deg, #4f46e5 0%, #ec4899 100%);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9rem;
            }
            
            .remove-tag {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 0.8rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .nav-tab:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .nav-tab.active {
                background: rgba(255, 255, 255, 0.1);
                border-bottom-color: #4f46e5;
                color: #4f46e5;
            }
            
            .tab-content {
                display: none;
            }
            
            .tab-content.active {
                display: block;
            }
            
            .close-btn:hover {
                background: rgba(255,255,255,0.3);
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the personalization modal
function initializePersonalization() {
    populateInterestCategories();
    setupTabSwitching();
    setupInterestSearch();
    loadExistingPreferences();
}

function populateInterestCategories() {
    const container = document.getElementById('interestCategories');
    if (!container) return;
    
    container.innerHTML = '';
    Object.keys(interestCategories).forEach(categoryName => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        
        const interests = interestCategories[categoryName];
        categoryCard.innerHTML = `
            <div class="category-title">${categoryName}</div>
            <div class="interest-tags">
                ${interests.map(interest => `
                    <div class="interest-tag" onclick="toggleInterest('${interest}')">
                        ${interest}
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(categoryCard);
    });
}

function setupTabSwitching() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        }
    });

    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.getAttribute('data-tab') === tabName) {
            content.classList.add('active');
        }
    });

    currentTab = tabName;
}

function setupInterestSearch() {
    const searchInput = document.getElementById('interestSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterInterests(e.target.value);
        });
    }
}

function filterInterests(searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    document.querySelectorAll('.category-card').forEach(card => {
        const interestTags = card.querySelectorAll('.interest-tag');
        let hasVisibleTags = false;
        
        interestTags.forEach(tag => {
            const interest = tag.textContent.toLowerCase();
            if (interest.includes(searchLower)) {
                tag.style.display = 'flex';
                hasVisibleTags = true;
            } else {
                tag.style.display = 'none';
            }
        });
        
        card.style.display = hasVisibleTags ? 'block' : 'none';
    });
}

function toggleInterest(interest) {
    if (selectedInterests.has(interest)) {
        selectedInterests.delete(interest);
    } else {
        if (selectedInterests.size >= 15) {
            showToast('Maximum 15 interests allowed', 'warning');
            return;
        }
        selectedInterests.add(interest);
    }
    
    updateInterestDisplay();
    updateSelectedInterestsDisplay();
}

function updateInterestDisplay() {
    document.querySelectorAll('.interest-tag').forEach(tag => {
        const interest = tag.textContent.trim();
        if (selectedInterests.has(interest)) {
            tag.classList.add('selected');
        } else {
            tag.classList.remove('selected');
        }
    });
    updateInterestProgress();
}

function updateInterestProgress() {
    const count = selectedInterests.size;
    const progress = Math.min((count / 15) * 100, 100);
    
    const progressElement = document.getElementById('interestProgress');
    if (progressElement) {
        progressElement.style.width = progress + '%';
    }
    
    let message = `${count} interests selected`;
    if (count < 5) {
        message += ' (minimum 5 recommended)';
    } else if (count >= 5 && count < 10) {
        message += ' (good start!)';
    } else if (count >= 10) {
        message += ' (excellent!)';
    }
    
    const countElement = document.getElementById('interestCount');
    if (countElement) {
        countElement.textContent = message;
    }
}

function updateSelectedInterestsDisplay() {
    const container = document.getElementById('selectedInterestsContainer');
    const tagsContainer = document.getElementById('selectedInterestsTags');
    
    if (selectedInterests.size > 0) {
        if (container) container.style.display = 'block';
        if (tagsContainer) {
            tagsContainer.innerHTML = Array.from(selectedInterests).map(interest => `
                <div class="selected-tag">
                    ${interest}
                    <button class="remove-tag" onclick="removeInterest('${interest}')">&times;</button>
                </div>
            `).join('');
        }
    } else {
        if (container) container.style.display = 'none';
    }
}

function removeInterest(interest) {
    selectedInterests.delete(interest);
    updateInterestDisplay();
    updateSelectedInterestsDisplay();
}

function toggleSetting(element) {
    element.classList.toggle('active');
    const slider = element.querySelector('.toggle-slider');
    if (element.classList.contains('active')) {
        element.style.background = '#4f46e5';
        if (slider) slider.style.transform = 'translateX(30px)';
    } else {
        element.style.background = 'rgba(255, 255, 255, 0.05)';
        if (slider) slider.style.transform = 'translateX(0px)';
    }
}

function updateSliderValue(type, value) {
    const valueElement = document.getElementById(type + 'Value');
    if (valueElement) {
        valueElement.textContent = value + '%';
    }
}

function loadExistingPreferences() {
    const existingInterests = ['Technology', 'Photography', 'Travel', 'Music', 'Fitness'];
    existingInterests.forEach(interest => {
        selectedInterests.add(interest);
    });
    updateInterestDisplay();
    updateSelectedInterestsDisplay();
}

function resetPersonalization() {
    if (confirm('Reset all personalization settings to default?')) {
        selectedInterests.clear();
        updateInterestDisplay();
        updateSelectedInterestsDisplay();
        
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.classList.remove('active');
            toggle.style.background = 'rgba(255, 255, 255, 0.05)';
            const slider = toggle.querySelector('.toggle-slider');
            if (slider) slider.style.transform = 'translateX(0px)';
        });
        
        showToast('Personalization settings reset', 'info');
    }
}

function saveAndClose() {
    if (selectedInterests.size < 5) {
        showToast('Please select at least 5 interests for better recommendations', 'warning');
        return;
    }
    
    // Save preferences (simulate API call)
    const preferences = {
        interests: Array.from(selectedInterests),
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('connecthub_personalization', JSON.stringify(preferences));
    showToast('Personalization saved successfully!', 'success');
    closePersonalizationModal();
}

function closePersonalizationModal() {
    const modal = document.getElementById('personalizationModal');
    if (modal) {
        modal.style.animation = 'modalFadeOut 0.3s ease forwards';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#4f46e5'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        z-index: 10002;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        font-size: 0.9rem;
        font-weight: 500;
    `;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `${icons[type]} ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Main function to open personalization dashboard
function openPersonalizationDashboard() {
    try {
        console.log('Opening personalization dashboard...');
        ensureCSSVariables();
        
        // Remove any existing modal
        const existingModal = document.getElementById('personalizationModal');
        if (existingModal) existingModal.remove();

        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'personalization-modal';
        modal.id = 'personalizationModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
            animation: modalFadeIn 0.3s ease;
        `;

        // Create modal content
        modal.innerHTML = createModalHTML();
        document.body.appendChild(modal);
        
        // Initialize functionality
        setTimeout(() => {
            initializePersonalization();
            
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closePersonalizationModal();
            });
            
            // Close on escape key
            const handleKeydown = (e) => {
                if (e.key === 'Escape') {
                    closePersonalizationModal();
                    document.removeEventListener('keydown', handleKeydown);
                }
            };
            document.addEventListener('keydown', handleKeydown);
        }, 100);
        
    } catch (error) {
        console.error('Error opening personalization dashboard:', error);
        showToast('Error opening personalization dashboard', 'error');
    }
}

function createModalHTML() {
    return `
        <div class="personalization-content" style="
            background: #16213e;
            border-radius: 24px;
            width: 95%;
            max-width: 1200px;
            height: 90vh;
            max-height: 800px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: modalSlideIn 0.3s ease;
            color: #ffffff;
        ">
            <div class="personalization-header" style="
                padding: 2rem;
                background: linear-gradient(135deg, #4f46e5 0%, #ec4899 100%);
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div>
                    <h2 style="margin: 0; font-size: 1.5rem;">🎯 Personalize Your Experience</h2>
                    <p style="opacity: 0.9; font-size: 0.9rem; margin: 0.5rem 0 0 0;">Customize your content to match your interests and preferences</p>
                </div>
                <button class="close-btn" onclick="closePersonalizationModal()" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">&times;</button>
            </div>

            <div class="personalization-nav" style="
                display: flex;
                background: rgba(255, 255, 255, 0.05);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                overflow-x: auto;
            ">
                <div class="nav-tab active" data-tab="interests" style="
                    padding: 1rem 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                    border-bottom: 3px solid transparent;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255, 255, 255, 0.1);
                    border-bottom-color: #4f46e5;
                    color: #4f46e5;
                ">
                    🏷️ Interests
                </div>
                <div class="nav-tab" data-tab="content" style="
                    padding: 1rem 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                    border-bottom: 3px solid transparent;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                ">
                    📱 Content
                </div>
            </div>

            <div class="personalization-body" style="
                flex: 1;
                overflow-y: auto;
                padding: 2rem;
            ">
                <div class="tab-content active" data-tab="interests">
                    <div class="progress-indicator" style="
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 8px;
                        padding: 1rem;
                        margin-bottom: 2rem;
                    ">
                        <div class="progress-bar" style="
                            height: 8px;
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 4px;
                            overflow: hidden;
                            margin-bottom: 0.5rem;
                        ">
                            <div class="progress-fill" id="interestProgress" style="
                                height: 100%;
                                background: linear-gradient(90deg, #4f46e5, #ec4899);
                                border-radius: 4px;
                                transition: width 0.3s ease;
                                width: 0%;
                            "></div>
                        </div>
                        <div class="selected-count" id="interestCount" style="
                            color: #4f46e5;
                            font-weight: 600;
                            margin-bottom: 1rem;
                        ">0 interests selected (minimum 5 recommended)</div>
                    </div>

                    <div class="search-container" style="
                        position: relative;
                        margin-bottom: 2rem;
                    ">
                        <input type="text" class="search-input" placeholder="Search interests..." id="interestSearch" style="
                            width: 100%;
                            padding: 1rem 1.5rem;
                            padding-right: 4rem;
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            border-radius: 25px;
                            color: #ffffff;
                            font-size: 1rem;
                            outline: none;
                        ">
                        <button class="search-btn" style="
                            position: absolute;
                            right: 0.5rem;
                            top: 50%;
                            transform: translateY(-50%);
                            background: #4f46e5;
                            border: none;
                            border-radius: 50%;
                            width: 40px;
                            height: 40px;
                            color: white;
                            cursor: pointer;
                            font-size: 1.2rem;
                        ">🔍</button>
                    </div>

                    <div class="selected-interests" id="selectedInterestsContainer" style="
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 12px;
                        padding: 1.5rem;
                        margin-bottom: 2rem;
                        display: none;
                    ">
                        <h4 style="margin-bottom: 1rem;">Your Selected Interests</h4>
                        <div class="selected-tags" id="selectedInterestsTags" style="
                            display: flex;
                            flex-wrap: wrap;
                            gap: 0.5rem;
                        "></div>
                    </div>

                    <div class="interest-categories" id="interestCategories" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 1.5rem;
                        margin-bottom: 2rem;
                    "></div>
                </div>

                <div class="tab-content" data-tab="content">
                    <div style="text-align: center; padding: 2rem; color: #94a3b8;">
                        <h3>📱 Content Preferences</h3>
                        <p>Content preferences coming soon...</p>
                    </div>
                </div>
            </div>

            <div class="personalization-footer" style="
                padding: 1.5rem 2rem;
                background: rgba(255, 255, 255, 0.05);
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div>
                    <div style="color: #94a3b8; font-size: 0.9rem;">Changes are saved automatically</div>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button onclick="resetPersonalization()" style="
                        background: rgba(255, 255, 255, 0.05);
                        color: #ffffff;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 12px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">Reset to Default</button>
                    <button onclick="saveAndClose()" style="
                        background: linear-gradient(135deg, #4f46e5 0%, #ec4899 100%);
                        color: white;
                        border: none;
                        padding: 0.75rem 2rem;
                        border-radius: 12px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">✅ Done</button>
                </div>
            </div>
        </div>
    `;
}

// Global function exports for backwards compatibility
window.openPersonalizationDashboard = openPersonalizationDashboard;
window.closePersonalizationModal = closePersonalizationModal;
window.toggleInterest = toggleInterest;
window.removeInterest = removeInterest;
window.toggleSetting = toggleSetting;
window.updateSliderValue = updateSliderValue;
window.resetPersonalization = resetPersonalization;
window.saveAndClose = saveAndClose;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Ensure global functions are available
    window.openPersonalizationDashboard = openPersonalizationDashboard;
    window.closePersonalizationModal = closePersonalizationModal;
    window.toggleInterest = toggleInterest;
    window.removeInterest = removeInterest;
    window.toggleSetting = toggleSetting;
    window.updateSliderValue = updateSliderValue;
    window.resetPersonalization = resetPersonalization;
    window.saveAndClose = saveAndClose;
});
