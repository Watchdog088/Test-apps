// Events Finder Functionality - Complete implementation from provided design

// Sample events data
const sampleEventsData = [
    {
        id: 1,
        title: "Tech Innovators Meetup 2024",
        description: "Join fellow tech enthusiasts for an evening of networking, presentations on cutting-edge technologies, and discussions about the future of innovation.",
        date: "2024-12-15",
        time: "18:00",
        location: "Downtown Convention Center",
        address: "123 Tech Street, Downtown",
        distance: "2.3 miles",
        category: "tech",
        type: "in-person",
        price: "Free",
        attendees: 234,
        maxAttendees: 300,
        organizer: "Tech Community Hub",
        image: "💻",
        tags: ["Networking", "Innovation", "Tech"],
        featured: true
    },
    {
        id: 2,
        title: "Jazz Under the Stars",
        description: "Experience smooth jazz performances by local artists in a beautiful outdoor setting. Bring a blanket and enjoy music under the night sky.",
        date: "2024-12-16",
        time: "19:30",
        location: "Central Park Amphitheater",
        address: "456 Park Avenue",
        distance: "1.8 miles",
        category: "music",
        type: "in-person",
        price: "$25",
        attendees: 156,
        maxAttendees: 200,
        organizer: "City Arts Council",
        image: "🎷",
        tags: ["Jazz", "Outdoor", "Live Music"]
    },
    {
        id: 3,
        title: "Digital Marketing Workshop",
        description: "Learn the latest digital marketing strategies from industry experts. Covers social media, SEO, content marketing, and analytics.",
        date: "2024-12-17",
        time: "14:00",
        location: "Online",
        address: "Virtual Event",
        distance: "Online",
        category: "business",
        type: "online",
        price: "$49",
        attendees: 89,
        maxAttendees: 150,
        organizer: "Marketing Pros Academy",
        image: "📊",
        tags: ["Marketing", "Workshop", "Online"]
    },
    {
        id: 4,
        title: "Community Art Exhibition",
        description: "Showcasing local artists' work with interactive installations, live painting demonstrations, and an art marketplace.",
        date: "2024-12-18",
        time: "10:00",
        location: "Modern Art Gallery",
        address: "789 Arts District",
        distance: "3.1 miles",
        category: "art",
        type: "in-person",
        price: "Free",
        attendees: 78,
        maxAttendees: 120,
        organizer: "Local Artists Collective",
        image: "🎨",
        tags: ["Art", "Exhibition", "Community"]
    },
    {
        id: 5,
        title: "Startup Pitch Competition",
        description: "Watch innovative startups pitch their ideas to a panel of investors. Network with entrepreneurs and industry leaders.",
        date: "2024-12-19",
        time: "17:00",
        location: "Innovation Hub",
        address: "321 Business Plaza",
        distance: "4.2 miles",
        category: "business",
        type: "hybrid",
        price: "$15",
        attendees: 145,
        maxAttendees: 180,
        organizer: "Entrepreneur Network",
        image: "🚀",
        tags: ["Startup", "Pitching", "Investment"]
    },
    {
        id: 6,
        title: "Food Truck Festival",
        description: "Taste amazing food from 20+ local food trucks. Live music, family activities, and craft beer garden included.",
        date: "2024-12-20",
        time: "11:00",
        location: "Riverside Park",
        address: "555 River Road",
        distance: "2.9 miles",
        category: "food",
        type: "in-person",
        price: "Free Entry",
        attendees: 567,
        maxAttendees: 800,
        organizer: "City Events",
        image: "🍔",
        tags: ["Food", "Festival", "Family"]
    },
    {
        id: 7,
        title: "Basketball Tournament",
        description: "Amateur basketball tournament open to all skill levels. Prizes for winners and fun for everyone.",
        date: "2024-12-21",
        time: "09:00",
        location: "Sports Complex",
        address: "888 Athletic Drive",
        distance: "3.7 miles",
        category: "sports",
        type: "in-person",
        price: "$20",
        attendees: 64,
        maxAttendees: 100,
        organizer: "Local Sports League",
        image: "🏀",
        tags: ["Basketball", "Tournament", "Sports"]
    },
    {
        id: 8,
        title: "Coding Bootcamp: React Fundamentals",
        description: "Intensive one-day workshop covering React basics, components, state management, and building your first React app.",
        date: "2024-12-22",
        time: "09:00",
        location: "Tech Learning Center",
        address: "999 Code Street",
        distance: "1.5 miles",
        category: "education",
        type: "in-person",
        price: "$75",
        attendees: 32,
        maxAttendees: 40,
        organizer: "Code Academy",
        image: "⚛️",
        tags: ["React", "Coding", "Bootcamp"]
    },
    {
        id: 9,
        title: "Community Volunteer Day",
        description: "Join us for a day of giving back to the community. Multiple volunteer opportunities available.",
        date: "2024-12-23",
        time: "08:00",
        location: "Community Center",
        address: "111 Helper Lane",
        distance: "2.1 miles",
        category: "social",
        type: "in-person",
        price: "Free",
        attendees: 123,
        maxAttendees: 200,
        organizer: "Volunteer Network",
        image: "🤝",
        tags: ["Volunteer", "Community", "Service"]
    },
    {
        id: 10,
        title: "Photography Masterclass",
        description: "Advanced photography techniques with professional photographer. Includes hands-on practice and portfolio review.",
        date: "2024-12-24",
        time: "13:00",
        location: "Photo Studio",
        address: "222 Lens Avenue",
        distance: "3.8 miles",
        category: "education",
        type: "in-person",
        price: "$85",
        attendees: 18,
        maxAttendees: 25,
        organizer: "Pro Photo Academy",
        image: "📸",
        tags: ["Photography", "Masterclass", "Professional"]
    },
    {
        id: 11,
        title: "Virtual Reality Gaming Tournament",
        description: "Experience the future of gaming with VR tournaments, demos of latest VR games, and prizes for top players.",
        date: "2024-12-25",
        time: "15:00",
        location: "Gaming Lounge",
        address: "333 Virtual Street",
        distance: "4.5 miles",
        category: "tech",
        type: "in-person",
        price: "$30",
        attendees: 76,
        maxAttendees: 100,
        organizer: "VR Gaming Club",
        image: "🥽",
        tags: ["VR", "Gaming", "Tournament"]
    },
    {
        id: 12,
        title: "Wellness & Meditation Workshop",
        description: "Learn mindfulness techniques, guided meditation, and wellness practices for daily life stress management.",
        date: "2024-12-26",
        time: "10:00",
        location: "Wellness Center",
        address: "444 Peace Boulevard",
        distance: "2.7 miles",
        category: "social",
        type: "hybrid",
        price: "$35",
        attendees: 45,
        maxAttendees: 60,
        organizer: "Mindful Living",
        image: "🧘",
        tags: ["Wellness", "Meditation", "Mindfulness"]
    }
];

let filteredEventsData = [...sampleEventsData];
let currentEventFilters = {
    search: '',
    date: 'today',
    category: 'all',
    price: 'all',
    type: 'all',
    location: '',
    distance: 25
};

// Open Events Finder Modal
function openEventsFinderModal() {
    const modal = document.getElementById('eventsFinderModal');
    if (modal) {
        modal.classList.add('active');
        populateEventsGrid();
        
        // Set current date as default for date inputs
        const today = new Date().toISOString().split('T')[0];
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        if (startDate) startDate.value = today;
        if (endDate) endDate.value = today;
    }
}

// Close Events Finder Modal
function closeEventsFinderModal() {
    const modal = document.getElementById('eventsFinderModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Populate Events Grid
function populateEventsGrid() {
    const grid = document.getElementById('eventsGrid');
    const countElement = document.getElementById('eventsCount');
    
    if (!grid) return;
    
    // Update count
    if (countElement) {
        countElement.textContent = `${filteredEventsData.length} events found`;
    }

    // Generate event cards
    grid.innerHTML = filteredEventsData.map(event => `
        <div class="event-card" onclick="openEventDetail(${event.id})" role="button" tabindex="0">
            <div class="event-image">
                ${event.image}
                ${event.featured ? '<div class="event-badge">Featured</div>' : ''}
                ${event.price === 'Free' || event.price === 'Free Entry' ? '<div class="event-badge" style="left: 0.75rem; right: auto; background: var(--success);">Free</div>' : ''}
            </div>
            <div class="event-content">
                <div class="event-title">${event.title}</div>
                <div class="event-meta">
                    <div>📅 ${formatEventDate(event.date)} at ${event.time}</div>
                    <div>📍 ${event.location} (${event.distance})</div>
                    <div>👥 ${event.attendees}/${event.maxAttendees} attending</div>
                    <div>💰 ${event.price}</div>
                </div>
                <div class="event-description">${event.description}</div>
                <div class="event-tags">
                    ${event.tags.map(tag => `<span class="event-tag">${tag}</span>`).join('')}
                </div>
                <div class="event-actions">
                    <div class="event-attendees">${event.attendees} attending</div>
                    <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); joinEventFromFinder(${event.id})" aria-label="Join event">Join Event</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Format event date
function formatEventDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// Search Events
function searchEvents(query) {
    currentEventFilters.search = query.toLowerCase();
    applyEventsFilters();
}

// Filter by Date
function filterByDate(element, dateFilter) {
    // Update UI
    document.querySelectorAll('.filter-section .filter-chip').forEach(chip => {
        if (chip.parentElement.previousElementSibling.textContent.includes('When')) {
            chip.classList.remove('active');
        }
    });
    element.classList.add('active');
    
    currentEventFilters.date = dateFilter;
    applyEventsFilters();
}

// Filter by Category
function filterByCategory(element, category) {
    // Update UI
    element.parentElement.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    element.classList.add('active');
    
    currentEventFilters.category = category;
    applyEventsFilters();
}

// Filter by Price
function filterByPrice(element, priceFilter) {
    // Update UI
    element.parentElement.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    element.classList.add('active');
    
    currentEventFilters.price = priceFilter;
    applyEventsFilters();
}

// Filter by Type
function filterByType(element, type) {
    // Update UI
    element.parentElement.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    element.classList.add('active');
    
    currentEventFilters.type = type;
    applyEventsFilters();
}

// Apply all filters
function applyEventsFilters() {
    filteredEventsData = sampleEventsData.filter(event => {
        // Search filter
        if (currentEventFilters.search && !event.title.toLowerCase().includes(currentEventFilters.search) && 
            !event.description.toLowerCase().includes(currentEventFilters.search) &&
            !event.tags.some(tag => tag.toLowerCase().includes(currentEventFilters.search))) {
            return false;
        }
        
        // Category filter
        if (currentEventFilters.category !== 'all' && event.category !== currentEventFilters.category) {
            return false;
        }
        
        // Price filter
        if (currentEventFilters.price === 'free' && !event.price.toLowerCase().includes('free')) {
            return false;
        }
        if (currentEventFilters.price === 'paid' && event.price.toLowerCase().includes('free')) {
            return false;
        }
        
        // Type filter
        if (currentEventFilters.type !== 'all' && event.type !== currentEventFilters.type) {
            return false;
        }
        
        // Date filter (simplified)
        const eventDate = new Date(event.date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        switch (currentEventFilters.date) {
            case 'today':
                if (eventDate.toDateString() !== today.toDateString()) return false;
                break;
            case 'tomorrow':
                if (eventDate.toDateString() !== tomorrow.toDateString()) return false;
                break;
            case 'week':
                const weekFromNow = new Date(today);
                weekFromNow.setDate(today.getDate() + 7);
                if (eventDate < today || eventDate > weekFromNow) return false;
                break;
            case 'weekend':
                const day = eventDate.getDay();
                if (day !== 0 && day !== 6) return false;
                break;
            case 'month':
                if (eventDate.getMonth() !== today.getMonth() || 
                    eventDate.getFullYear() !== today.getFullYear()) return false;
                break;
        }
        
        return true;
    });
    
    populateEventsGrid();
}

// Update distance filter
function updateEventsDistance(value) {
    document.getElementById('distanceValue').textContent = `${value} miles`;
    currentEventFilters.distance = parseInt(value);
    // In a real app, this would filter by actual distance
}

// Use current location
function useCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                document.getElementById('locationInput').value = 'Current Location';
                if (window.showToast) {
                    window.showToast('Location updated to current position', 'success');
                }
            },
            (error) => {
                if (window.showToast) {
                    window.showToast('Unable to get location. Please enter manually.', 'warning');
                }
            }
        );
    } else {
        if (window.showToast) {
            window.showToast('Geolocation not supported by this browser', 'warning');
        }
    }
}

// Reset all filters
function resetAllFilters() {
    currentEventFilters = {
        search: '',
        date: 'today',
        category: 'all',
        price: 'all',
        type: 'all',
        location: '',
        distance: 25
    };
    
    // Reset UI
    const searchInput = document.getElementById('eventsSearchInput');
    const locationInput = document.getElementById('locationInput');
    const distanceValue = document.getElementById('distanceValue');
    const distanceSlider = document.querySelector('input[type="range"]');
    
    if (searchInput) searchInput.value = '';
    if (locationInput) locationInput.value = '';
    if (distanceValue) distanceValue.textContent = '25 miles';
    if (distanceSlider) distanceSlider.value = 25;
    
    // Reset filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    
    // Set default active filters
    document.querySelectorAll('.filter-chip').forEach(chip => {
        if (chip.textContent.includes('Today') || 
            chip.textContent.includes('All')) {
            chip.classList.add('active');
        }
    });
    
    filteredEventsData = [...sampleEventsData];
    populateEventsGrid();
    if (window.showToast) {
        window.showToast('All filters reset', 'info');
    }
}

// Toggle view
function toggleView(element, view) {
    // Update UI
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    element.classList.add('active');
    
    const mapView = document.getElementById('eventsMapView');
    const gridView = document.getElementById('eventsGrid');
    
    if (view === 'map') {
        if (mapView) mapView.classList.add('active');
        if (gridView) gridView.style.display = 'none';
    } else {
        if (mapView) mapView.classList.remove('active');
        if (gridView) gridView.style.display = 'grid';
    }
}

// Load more events
function loadMoreEvents() {
    if (window.showToast) {
        window.showToast('Loading more events...', 'info');
    }
    // In a real app, this would load more events from the API
}

// Join Event from Finder
function joinEventFromFinder(eventId) {
    const event = sampleEventsData.find(e => e.id === eventId);
    if (event) {
        event.attendees++;
        if (window.showToast) {
            window.showToast(`Successfully joined "${event.title}"!`, 'success');
        }
        populateEventsGrid(); // Refresh to show updated attendee count
    }
}

// Open Event Detail Modal
function openEventDetail(eventId) {
    const event = sampleEventsData.find(e => e.id === eventId);
    if (!event) return;
    
    const modal = document.getElementById('eventDetailModal');
    const imageEl = document.getElementById('eventDetailImage');
    const bodyEl = document.getElementById('eventDetailBody');
    
    // Update image
    if (imageEl) {
        imageEl.innerHTML = `
            ${event.image}
            <button style="position: absolute; top: 1rem; right: 1rem; background: rgba(0,0,0,0.5); border: none; color: white; font-size: 1.5rem; cursor: pointer; border-radius: 50%; width: 40px; height: 40px;" onclick="closeEventDetailModal()" aria-label="Close event details">✕</button>
        `;
    }
    
    // Update body
    if (bodyEl) {
        bodyEl.innerHTML = `
            <div class="event-detail-title">${event.title}</div>
            
            <div class="event-detail-meta">
                <div class="event-detail-meta-item">
                    <span>📅</span>
                    <div>
                        <strong>Date & Time</strong><br>
                        ${formatEventDate(event.date)} at ${event.time}
                    </div>
                </div>
                <div class="event-detail-meta-item">
                    <span>📍</span>
                    <div>
                        <strong>Location</strong><br>
                        ${event.location}<br>
                        <small>${event.address}</small>
                    </div>
                </div>
                <div class="event-detail-meta-item">
                    <span>💰</span>
                    <div>
                        <strong>Price</strong><br>
                        ${event.price}
                    </div>
                </div>
                <div class="event-detail-meta-item">
                    <span>👥</span>
                    <div>
                        <strong>Attendees</strong><br>
                        ${event.attendees}/${event.maxAttendees}
                    </div>
                </div>
            </div>
            
            <div style="margin: 2rem 0;">
                <h3>About This Event</h3>
                <p style="line-height: 1.6; color: var(--text-secondary);">${event.description}</p>
            </div>
            
            <div style="margin: 2rem 0;">
                <h4>Event Tags</h4>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap;">
                    ${event.tags.map(tag => `<span class="event-tag">${tag}</span>`).join('')}
                </div>
            </div>
            
            <div style="margin: 2rem 0;">
                <h4>Organized by</h4>
                <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">${event.organizer.charAt(0)}</div>
                    <div>
                        <div style="font-weight: 600;">${event.organizer}</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Event Organizer</div>
                    </div>
                </div>
            </div>
            
            <div class="attendees-section">
                <h4>Who's Going (${event.attendees})</h4>
                <div class="attendees-list">
                    ${Array.from({length: Math.min(event.attendees, 10)}, (_, i) => `
                        <div class="attendee-avatar">${String.fromCharCode(65 + i)}</div>
                    `).join('')}
                    ${event.attendees > 10 ? `<div style="color: var(--text-secondary); align-self: center;">+${event.attendees - 10} more</div>` : ''}
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; margin: 2rem 0; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="joinEventFromFinder(${event.id}); closeEventDetailModal();" style="flex: 1; min-width: 200px;">Join Event</button>
                <button class="btn btn-secondary" onclick="shareEvent(${event.id})" style="flex: 1; min-width: 200px;">Share Event</button>
                <button class="btn btn-secondary" onclick="addToCalendar(${event.id})">📅 Add to Calendar</button>
            </div>
            
            <div class="comments-section">
                <h4>Comments & Questions</h4>
                <div class="comment-item">
                    <div class="attendee-avatar">JS</div>
                    <div>
                        <div style="font-weight: 600;">John Smith</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin: 0.25rem 0;">Is parking available at the venue?</div>
                        <div style="color: var(--text-muted); font-size: 0.8rem;">2 hours ago</div>
                    </div>
                </div>
                <div class="comment-item">
                    <div class="attendee-avatar">EM</div>
                    <div>
                        <div style="font-weight: 600;">Emma Martinez</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin: 0.25rem 0;">Looking forward to this event! 🎉</div>
                        <div style="color: var(--text-muted); font-size: 0.8rem;">4 hours ago</div>
                    </div>
                </div>
                <div style="margin-top: 1rem;">
                    <input type="text" placeholder="Ask a question or leave a comment..." style="width: 100%; padding: 0.75rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-primary);">
                </div>
            </div>
            
            <div class="related-events">
                <h4>Related Events</h4>
                <div class="related-events-grid">
                    ${sampleEventsData.filter(e => e.id !== event.id && e.category === event.category).slice(0, 3).map(relatedEvent => `
                        <div class="related-event-card" onclick="openEventDetail(${relatedEvent.id})">
                            <div style="font-size: 2rem; text-align: center; margin-bottom: 0.5rem;">${relatedEvent.image}</div>
                            <div style="font-weight: 600; margin-bottom: 0.5rem;">${relatedEvent.title}</div>
                            <div style="color: var(--text-secondary); font-size: 0.8rem;">${formatEventDate(relatedEvent.date)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    if (modal) {
        modal.classList.add('active');
    }
}

// Close Event Detail Modal
function closeEventDetailModal() {
    const modal = document.getElementById('eventDetailModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Share Event
function shareEvent(eventId) {
    const event = sampleEventsData.find(e => e.id === eventId);
    if (event && window.showToast) {
        window.showToast(`Shared "${event.title}" with your network!`, 'success');
    }
}

// Add to Calendar
function addToCalendar(eventId) {
    const event = sampleEventsData.find(e => e.id === eventId);
    if (event && window.showToast) {
        window.showToast(`"${event.title}" added to your calendar!`, 'success');
    }
}

// Close modals on background click
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.events-finder-modal, .event-detail-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
});

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeEventsFinderModal();
        closeEventDetailModal();
    }
});

// Update the existing searchCategory function to open events finder
function searchCategory(category) {
    if (category === 'events') {
        openEventsFinderModal();
    } else {
        if (window.showToast) {
            window.showToast(`Searching ${category}...`, 'info');
        }
    }
}
