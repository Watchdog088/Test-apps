// Dating profiles data
const profiles = [
    {
        name: "Sarah, 28",
        distance: "2 miles away",
        occupation: "Designer",
        bio: "Love hiking, coffee, and spontaneous adventures! Looking for someone who can keep up with my energy ☕🏔️",
        interests: ["🎨 Art", "🧘 Yoga", "🎵 Music"],
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
        name: "Alex, 26",
        distance: "5 miles away",
        occupation: "Software Engineer",
        bio: "Tech enthusiast by day, foodie by night. Let's grab tacos and talk about our favorite sci-fi movies! 🌮🚀",
        interests: ["💻 Coding", "🍜 Food", "🎮 Gaming"],
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
        name: "Emma, 30",
        distance: "3 miles away",
        occupation: "Photographer",
        bio: "Capturing moments and chasing sunsets. Adventure seeker looking for a travel buddy 📸🌅",
        interests: ["📷 Photography", "✈️ Travel", "🌿 Nature"],
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop",
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    }
];

let currentProfileIndex = 0;

// Load initial profile
function loadProfile() {
    const profile = profiles[currentProfileIndex];
    const card = document.getElementById('datingCard');
    
    card.classList.remove('card-enter');
    setTimeout(() => card.classList.add('card-enter'), 10);
    
    document.getElementById('datingCardContent').innerHTML = `
        <div style="height: 100%; background: ${profile.gradient}; position: relative;">
            <img class="card-image" src="${profile.image}" alt="Profile photo">
            <div class="card-info">
                <div class="card-name">${profile.name}</div>
                <div class="card-details">📍 ${profile.distance} • 🎓 ${profile.occupation}</div>
                <div class="card-bio">${profile.bio}</div>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${profile.interests.map(interest => 
                        `<span style="padding: 0.25rem 0.75rem; background: rgba(255,255,255,0.2); border-radius: 20px; font-size: 0.85rem;">${interest}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
    `;
}

// Swipe card left or right
function swipeCard(direction) {
    const card = document.getElementById('datingCard');
    const reasonPanel = document.getElementById('swipeReasonPanel');
    
    if (direction === 'left') {
        card.style.transform = 'translateX(-150%) rotate(-30deg)';
        reasonPanel.style.display = 'block';
        setTimeout(() => reasonPanel.style.display = 'none', 3000);
    } else {
        card.style.transform = 'translateX(150%) rotate(30deg)';
        document.getElementById('matchesToday').textContent = 
            parseInt(document.getElementById('matchesToday').textContent) + 1;
    }
    
    setTimeout(() => {
        card.style.transform = 'translateX(0) rotate(0)';
        currentProfileIndex = (currentProfileIndex + 1) % profiles.length;
        loadProfile();
    }, 300);
}

// Super like functionality
function superLike() {
    const card = document.getElementById('datingCard');
    card.style.transform = 'translateY(-150%) scale(1.1)';
    document.getElementById('matchesToday').textContent = 
        parseInt(document.getElementById('matchesToday').textContent) + 1;
    
    setTimeout(() => {
        card.style.transform = 'translateX(0) rotate(0) scale(1)';
        currentProfileIndex = (currentProfileIndex + 1) % profiles.length;
        loadProfile();
    }, 300);
}

// Rewind last swipe
function rewindSwipe() {
    currentProfileIndex = (currentProfileIndex - 1 + profiles.length) % profiles.length;
    loadProfile();
}

// Submit swipe reason
function submitSwipeReason(reason) {
    document.getElementById('swipeReasonPanel').style.display = 'none';
}

// Open photo gallery
function openPhotoGallery() {
    openModal('photoGalleryModal');
}

// Report profile
function reportProfile() {
    openModal('reportModal');
}

// Open match preview
function openMatchPreview() {
    openModal('matchPreviewModal');
}

// Open matches modal
function openMatchesModal() {
    openModal('matchesModal');
}

// Open advanced filters
function openAdvancedFilters() {
    openModal('filtersModal');
}

// Open preferences modal
function openPreferencesModal() {
    openModal('preferencesModal');
}

// Use icebreaker
function useIcebreaker(element) {
    const text = element.textContent.trim();
    alert(`💬 Icebreaker copied: ${text}\n\nUse this when you match!`);
}

// Boost profile
function openBoostProfile() {
    openModal('boostModal');
}

// Open profile checker
function openProfileChecker() {
    openModal('profileCheckModal');
}

// Open swipe tutorial
function openSwipeTutorial() {
    openModal('tutorialModal');
}

// Open safety center
function openSafetyCenter() {
    openModal('safetyModal');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    
    // Boost timer countdown
    let boostMinutes = 45;
    setInterval(() => {
        if (boostMinutes > 0) {
            boostMinutes--;
            document.getElementById('boostTimer').textContent = boostMinutes + ' min';
        }
    }, 60000);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (document.querySelector('.modal-overlay.active')) return; // Don't trigger if modal is open
        
        switch(e.key) {
            case 'ArrowLeft':
                swipeCard('left');
                break;
            case 'ArrowRight':
                swipeCard('right');
                break;
            case 'ArrowUp':
                superLike();
                break;
            case 'Escape':
                const activeModal = document.querySelector('.modal-overlay.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
                break;
        }
    });
});
