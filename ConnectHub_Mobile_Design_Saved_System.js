// ========================================
// CONNECTHUB MOBILE DESIGN - SAVED SYSTEM
// Complete Saved Items & Collections Management
// ========================================

// Saved System State Management
const savedSystem = {
    collections: [
        { 
            id: 1, 
            name: 'Travel Inspiration', 
            emoji: '📸', 
            privacy: 'private', 
            itemCount: 24, 
            createdDate: '2024-01-15', 
            lastUpdated: '2024-12-18',
            description: 'Beautiful places to visit',
            coverImage: '🏖️',
            category: 'lifestyle',
            shared: false,
            collaborators: []
        },
        { 
            id: 2, 
            name: 'Recipes', 
            emoji: '🍳', 
            privacy: 'private', 
            itemCount: 18, 
            createdDate: '2024-02-20', 
            lastUpdated: '2024-12-17',
            description: 'Delicious food ideas',
            coverImage: '🍕',
            category: 'food',
            shared: false,
            collaborators: []
        },
        { 
            id: 3, 
            name: 'Tech News', 
            emoji: '💻', 
            privacy: 'public', 
            itemCount: 32, 
            createdDate: '2024-03-10', 
            lastUpdated: '2024-12-19',
            description: 'Latest technology updates',
            coverImage: '🚀',
            category: 'technology',
            shared: true,
            collaborators: ['Sarah Johnson', 'Mike Chen']
        },
        { 
            id: 4, 
            name: 'Workout Routines', 
            emoji: '💪', 
            privacy: 'private', 
            itemCount: 15, 
            createdDate: '2024-04-05', 
            lastUpdated: '2024-12-16',
            description: 'Fitness exercises and tips',
            coverImage: '🏋️',
            category: 'fitness',
            shared: false,
            collaborators: []
        },
        { 
            id: 5, 
            name: 'Art & Design', 
            emoji: '🎨', 
            privacy: 'friends', 
            itemCount: 27, 
            createdDate: '2024-05-12', 
            lastUpdated: '2024-12-18',
            description: 'Creative inspiration',
            coverImage: '🖼️',
            category: 'art',
            shared: true,
            collaborators: ['Emily Rodriguez']
        }
    ],
    
    savedItems: [
        { 
            id: 1, 
            type: 'post', 
            content: 'Amazing sunset photography tips!', 
            emoji: '📷', 
            savedDate: '2024-12-19T10:30:00', 
            collectionId: 1,
            author: 'Sarah Johnson',
            tags: ['photography', 'tips', 'sunset'],
            url: null
        },
        { 
            id: 2, 
            type: 'post', 
            content: '10 Easy Dinner Recipes', 
            emoji: '🍝', 
            savedDate: '2024-12-18T15:20:00', 
            collectionId: 2,
            author: 'Chef Mike',
            tags: ['recipes', 'cooking', 'dinner'],
            url: null
        },
        { 
            id: 3, 
            type: 'video', 
            content: 'AI Revolution in 2025', 
            emoji: '🤖', 
            savedDate: '2024-12-17T09:15:00', 
            collectionId: 3,
            author: 'Tech Insider',
            tags: ['ai', 'technology', 'future'],
            url: null
        },
        { 
            id: 4, 
            type: 'article', 
            content: 'Best Travel Destinations 2025', 
            emoji: '✈️', 
            savedDate: '2024-12-16T14:45:00', 
            collectionId: 1,
            author: 'Travel Guide Daily',
            tags: ['travel', 'destinations', '2025'],
            url: 'https://example.com/travel-2025'
        },
        { 
            id: 5, 
            type: 'post', 
            content: 'Home Workout Challenge', 
            emoji: '🏃', 
            savedDate: '2024-12-15T08:00:00', 
            collectionId: 4,
            author: 'Fitness Coach',
            tags: ['fitness', 'workout', 'health'],
            url: null
        }
    ],
    
    recentSaves: [],
    currentFilter: 'all',
    currentSort: 'recent',
    searchQuery: '',
    selectedItems: [],
    bulkModeActive: false,
    autoCollections: {
        enabled: true,
        rules: {
            'photography': { keywords: ['photo', 'camera', 'photography'], collectionId: 1 },
            'food': { keywords: ['recipe', 'food', 'cooking'], collectionId: 2 },
            'tech': { keywords: ['tech', 'ai', 'software'], collectionId: 3 },
            'fitness': { keywords: ['workout', 'fitness', 'exercise'], collectionId: 4 }
        }
    }
};

// Initialize Saved System
function initializeSavedSystem() {
    console.log('Initializing Saved System...');
    updateRecentSaves();
    updateSavedBadges();
}

// ========================================
// 1. SAVE/UNSAVE POST LOGIC
// ========================================

function savePost(postId, postData) {
    // Check if already saved
    const existingSave = savedSystem.savedItems.find(item => 
        item.type === 'post' && item.content === postData.content
    );
    
    if (existingSave) {
        showToast('Already saved!');
        return;
    }
    
    // Create new saved item
    const newSave = {
        id: Date.now(),
        type: 'post',
        content: postData.content || 'Saved post',
        emoji: postData.emoji || '📝',
        savedDate: new Date().toISOString(),
        collectionId: null,
        author: postData.author || 'Unknown',
        tags: extractTags(postData.content),
        url: postData.url || null
    };
    
    // Auto-collection logic
    if (savedSystem.autoCollections.enabled) {
        const autoCollection = determineAutoCollection(newSave);
        if (autoCollection) {
            newSave.collectionId = autoCollection.id;
            showToast(`Saved to ${autoCollection.name}! 🔖`);
        } else {
            showToast('Post saved! 🔖');
        }
    } else {
        showToast('Post saved! 🔖');
    }
    
    savedSystem.savedItems.unshift(newSave);
    updateRecentSaves();
    updateSavedBadges();
}

function unsavePost(itemId) {
    const item = savedSystem.savedItems.find(i => i.id === itemId);
    if (!item) return;
    
    if (confirm('Remove from saved items?')) {
        savedSystem.savedItems = savedSystem.savedItems.filter(i => i.id !== itemId);
        
        // Update collection count
        if (item.collectionId) {
            const collection = savedSystem.collections.find(c => c.id === item.collectionId);
            if (collection) {
                collection.itemCount--;
            }
        }
        
        updateRecentSaves();
        updateSavedBadges();
        showToast('Removed from saved');
    }
}

function toggleSavePost(postId, postData) {
    const existingSave = savedSystem.savedItems.find(item => 
        item.type === 'post' && item.content === postData.content
    );
    
    if (existingSave) {
        unsavePost(existingSave.id);
    } else {
        savePost(postId, postData);
    }
}

function isPostSaved(postData) {
    return savedSystem.savedItems.some(item => 
        item.type === 'post' && item.content === postData.content
    );
}

// ========================================
// 2. COLLECTION ORGANIZATION
// ========================================

function createCollection(collectionData) {
    const newCollection = {
        id: Date.now(),
        name: collectionData.name || 'New Collection',
        emoji: collectionData.emoji || '📁',
        privacy: collectionData.privacy || 'private',
        itemCount: 0,
        createdDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        description: collectionData.description || '',
        coverImage: collectionData.emoji || '📁',
        category: collectionData.category || 'other',
        shared: false,
        collaborators: []
    };
    
    savedSystem.collections.push(newCollection);
    showToast(`Collection "${collectionData.name}" created! ✓`);
    renderCollections();
}

function deleteCollection(collectionId) {
    const collection = savedSystem.collections.find(c => c.id === collectionId);
    if (!collection) return;
    
    if (confirm(`Delete collection "${collection.name}"? Items will be moved to Recent Saves.`)) {
        // Move items to unsorted (null collectionId)
        savedSystem.savedItems.forEach(item => {
            if (item.collectionId === collectionId) {
                item.collectionId = null;
            }
        });
        
        savedSystem.collections = savedSystem.collections.filter(c => c.id !== collectionId);
        showToast(`Collection "${collection.name}" deleted`);
        renderCollections();
    }
}

function editCollection(collectionId, newData) {
    const collection = savedSystem.collections.find(c => c.id === collectionId);
    if (!collection) return;
    
    Object.assign(collection, newData);
    collection.lastUpdated = new Date().toISOString().split('T')[0];
    
    showToast('Collection updated! ✓');
    renderCollections();
}

function duplicateCollection(collectionId) {
    const collection = savedSystem.collections.find(c => c.id === collectionId);
    if (!collection) return;
    
    const duplicate = {
        ...collection,
        id: Date.now(),
        name: `${collection.name} (Copy)`,
        itemCount: 0,
        createdDate: new Date().toISOString().split('T')[0],
        collaborators: []
    };
    
    savedSystem.collections.push(duplicate);
    showToast(`Collection duplicated! ✓`);
    renderCollections();
}

// ========================================
// 3. COLLECTION SORTING & FILTERING
// ========================================

function sortCollections(sortBy) {
    savedSystem.currentSort = sortBy;
    
    const sortFunctions = {
        'recent': (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated),
        'alphabetical': (a, b) => a.name.localeCompare(b.name),
        'itemCount': (a, b) => b.itemCount - a.itemCount,
        'oldest': (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
    };
    
    savedSystem.collections.sort(sortFunctions[sortBy] || sortFunctions.recent);
    
    const labels = {
        'recent': 'Recently Updated',
        'alphabetical': 'A-Z',
        'itemCount': 'Most Items',
        'oldest': 'Oldest First'
    };
    
    showToast(`Sorted by: ${labels[sortBy]}`);
    renderCollections();
}

function filterCollections(filterType) {
    savedSystem.currentFilter = filterType;
    showToast(`Filter: ${filterType}`);
    renderCollections();
}

function filterByCategory(category) {
    const filtered = savedSystem.collections.filter(c => c.category === category);
    showToast(`${filtered.length} ${category} collections`);
}

function filterByPrivacy(privacyLevel) {
    const filtered = savedSystem.collections.filter(c => c.privacy === privacyLevel);
    showToast(`${filtered.length} ${privacyLevel} collections`);
}

// ========================================
// 4. COLLECTION SHARING
// ========================================

function shareCollection(collectionId) {
    const collection = savedSystem.collections.find(c => c.id === collectionId);
    if (!collection) return;
    
    // Generate shareable link
    const shareLink = `https://connecthub.com/collections/${collectionId}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareLink).then(() => {
            showToast(`Share link copied! 🔗`);
        }).catch(() => {
            showToast(`Share link: ${shareLink}`);
        });
    } else {
        showToast(`Share link copied! 🔗`);
    }
    
    collection.shared = true;
}

function addCollaborator(collectionId, collaboratorName) {
    const collection = savedSystem.collections.find(c => c.id === collectionId);
    if (!collection) return;
    
    if (!collection.collaborators.includes(collaboratorName)) {
        collection.collaborators.push(collaboratorName);
        showToast(`${collaboratorName} added as collaborator! ✓`);
    } else {
        showToast('Already a collaborator');
    }
}

function removeCollaborator(collectionId, collaboratorName) {
    const collection = savedSystem.collections.find(c => c.id === collectionId);
    if (!collection) return;
    
    collection.collaborators = collection.collaborators.filter(c => c !== collaboratorName);
    showToast(`${collaboratorName} removed`);
}

function stopSharingCollection(collectionId) {
    const collection = savedSystem.collections.find(c => c.id === collectionId);
    if (!collection) return;
    
    collection.shared = false;
    collection.collaborators = [];
    showToast('Collection is now private');
}

// ========================================
// 5. COLLECTION PRIVACY SETTINGS
// ========================================

function changeCollectionPrivacy(collectionId, newPrivacy) {
    const collection = savedSystem.collections.find(c => c.id === collectionId);
    if (!collection) return;
    
    collection.privacy = newPrivacy;
    
    const labels = {
        'private': 'Only Me',
        'friends': 'Friends',
        'public': 'Public'
    };
    
    showToast(`Privacy: ${labels[newPrivacy]} 🔒`);
}

function viewCollectionPrivacySettings(collectionId) {
    const collection = savedSystem.collections.find(c => c.id === collectionId);
    if (!collection) return;
    
    openCollectionPrivacyModal(collection);
}

// ========================================
// 6. MOVE ITEMS BETWEEN COLLECTIONS
// ========================================

function moveItemToCollection(itemId, targetCollectionId) {
    const item = savedSystem.savedItems.find(i => i.id === itemId);
    if (!item) return;
    
    const oldCollectionId = item.collectionId;
    
    // Update item
    item.collectionId = targetCollectionId;
    
    // Update collection counts
    if (oldCollectionId) {
        const oldCollection = savedSystem.collections.find(c => c.id === oldCollectionId);
        if (oldCollection) oldCollection.itemCount--;
    }
    
    if (targetCollectionId) {
        const newCollection = savedSystem.collections.find(c => c.id === targetCollectionId);
        if (newCollection) {
            newCollection.itemCount++;
            newCollection.lastUpdated = new Date().toISOString().split('T')[0];
            showToast(`Moved to ${newCollection.name}! ✓`);
        }
    } else {
        showToast('Moved to Recent Saves! ✓');
    }
}

function moveMultipleItems(itemIds, targetCollectionId) {
    itemIds.forEach(id => moveItemToCollection(id, targetCollectionId));
    showToast(`Moved ${itemIds.length} items! ✓`);
}

function openMoveItemModal(itemId) {
    const item = savedSystem.savedItems.find(i => i.id === itemId);
    if (!item) return;
    
    createMoveItemModal(item);
}

// ========================================
// 7. BULK SAVE/DELETE
// ========================================

function toggleBulkMode() {
    savedSystem.bulkModeActive = !savedSystem.bulkModeActive;
    savedSystem.selectedItems = [];
    
    if (savedSystem.bulkModeActive) {
        showToast('Bulk selection mode activated ✓');
    } else {
        showToast('Bulk mode disabled');
    }
}

function toggleItemSelection(itemId) {
    const index = savedSystem.selectedItems.indexOf(itemId);
    
    if (index > -1) {
        savedSystem.selectedItems.splice(index, 1);
    } else {
        savedSystem.selectedItems.push(itemId);
    }
    
    showToast(`${savedSystem.selectedItems.length} items selected`);
}

function selectAllItems() {
    savedSystem.selectedItems = savedSystem.savedItems.map(item => item.id);
    showToast(`All ${savedSystem.selectedItems.length} items selected`);
}

function deselectAllItems() {
    savedSystem.selectedItems = [];
    showToast('Selection cleared');
}

function bulkDelete() {
    if (savedSystem.selectedItems.length === 0) {
        showToast('No items selected');
        return;
    }
    
    if (confirm(`Delete ${savedSystem.selectedItems.length} items?`)) {
        savedSystem.savedItems = savedSystem.savedItems.filter(
            item => !savedSystem.selectedItems.includes(item.id)
        );
        
        showToast(`${savedSystem.selectedItems.length} items deleted`);
        savedSystem.selectedItems = [];
        savedSystem.bulkModeActive = false;
        updateRecentSaves();
    }
}

function bulkMoveToCollection(targetCollectionId) {
    if (savedSystem.selectedItems.length === 0) {
        showToast('No items selected');
        return;
    }
    
    moveMultipleItems(savedSystem.selectedItems, targetCollectionId);
    savedSystem.selectedItems = [];
    savedSystem.bulkModeActive = false;
}

function bulkAddTags(tags) {
    if (savedSystem.selectedItems.length === 0) {
        showToast('No items selected');
        return;
    }
    
    savedSystem.selectedItems.forEach(itemId => {
        const item = savedSystem.savedItems.find(i => i.id === itemId);
        if (item) {
            item.tags = [...new Set([...item.tags, ...tags])];
        }
    });
    
    showToast(`Tags added to ${savedSystem.selectedItems.length} items! ✓`);
}

// ========================================
// 8. COLLECTION SEARCH
// ========================================

function searchCollections(query) {
    savedSystem.searchQuery = query.toLowerCase().trim();
    
    if (!query) {
        showToast('Search cleared');
        renderCollections();
        return;
    }
    
    const results = savedSystem.collections.filter(collection => 
        collection.name.toLowerCase().includes(savedSystem.searchQuery) ||
        collection.description.toLowerCase().includes(savedSystem.searchQuery) ||
        collection.category.toLowerCase().includes(savedSystem.searchQuery)
    );
    
    showToast(`Found ${results.length} collections`);
    return results;
}

function searchSavedItems(query) {
    savedSystem.searchQuery = query.toLowerCase().trim();
    
    if (!query) {
        showToast('Search cleared');
        return;
    }
    
    const results = savedSystem.savedItems.filter(item => 
        item.content.toLowerCase().includes(savedSystem.searchQuery) ||
        item.author.toLowerCase().includes(savedSystem.searchQuery) ||
        item.tags.some(tag => tag.toLowerCase().includes(savedSystem.searchQuery))
    );
    
    showToast(`Found ${results.length} saved items`);
    return results;
}

function searchByTag(tag) {
    const results = savedSystem.savedItems.filter(item => 
        item.tags.includes(tag)
    );
    
    showToast(`${results.length} items with #${tag}`);
}

function getAllTags() {
    const allTags = new Set();
    savedSystem.savedItems.forEach(item => {
        item.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
}

// ========================================
// 9. AUTO-COLLECTION BY TYPE
// ========================================

function toggleAutoCollection() {
    savedSystem.autoCollections.enabled = !savedSystem.autoCollections.enabled;
    
    if (savedSystem.autoCollections.enabled) {
        showToast('Auto-collections enabled ✓');
    } else {
        showToast('Auto-collections disabled');
    }
}

function determineAutoCollection(item) {
    if (!savedSystem.autoCollections.enabled) return null;
    
    const content = item.content.toLowerCase();
    const tags = item.tags.join(' ').toLowerCase();
    const searchText = content + ' ' + tags;
    
    for (const [key, rule] of Object.entries(savedSystem.autoCollections.rules)) {
        if (rule.keywords.some(keyword => searchText.includes(keyword))) {
            return savedSystem.collections.find(c => c.id === rule.collectionId);
        }
    }
    
    return null;
}

function addAutoCollectionRule(keywords, collectionId) {
    const key = keywords[0];
    savedSystem.autoCollections.rules[key] = {
        keywords: keywords,
        collectionId: collectionId
    };
    
    showToast('Auto-collection rule added! ✓');
}

function removeAutoCollectionRule(key) {
    delete savedSystem.autoCollections.rules[key];
    showToast('Rule removed');
}

function organizeAllItemsByType() {
    let organized = 0;
    
    savedSystem.savedItems.forEach(item => {
        if (!item.collectionId) {
            const autoCollection = determineAutoCollection(item);
            if (autoCollection) {
                item.collectionId = autoCollection.id;
                autoCollection.itemCount++;
                organized++;
            }
        }
    });
    
    showToast(`${organized} items auto-organized! ✓`);
}

// ========================================
// 10. COLLECTION EXPORT
// ========================================

function exportCollection(collectionId, format = 'json') {
    const collection = savedSystem.collections.find(c => c.id === collectionId);
    if (!collection) return;
    
    const items = savedSystem.savedItems.filter(item => item.collectionId === collectionId);
    
    const exportData = {
        collection: {
            name: collection.name,
            description: collection.description,
            itemCount: collection.itemCount,
            createdDate: collection.createdDate
        },
        items: items.map(item => ({
            content: item.content,
            type: item.type,
            author: item.author,
            savedDate: item.savedDate,
            tags: item.tags,
            url: item.url
        })),
        exportDate: new Date().toISOString(),
        exportFormat: format
    };
    
    if (format === 'json') {
        const dataStr = JSON.stringify(exportData, null, 2);
        downloadFile(`${collection.name}.json`, dataStr, 'application/json');
    } else if (format === 'csv') {
        const csv = convertToCSV(exportData.items);
        downloadFile(`${collection.name}.csv`, csv, 'text/csv');
    } else if (format === 'html') {
        const html = generateHTMLExport(exportData);
        downloadFile(`${collection.name}.html`, html, 'text/html');
    }
    
    showToast(`Exporting ${collection.name} as ${format.toUpperCase()}... 📥`);
    setTimeout(() => {
        showToast('Export complete! ✓');
    }, 1500);
}

function exportAllCollections() {
    const exportData = {
        collections: savedSystem.collections.map(c => ({
            name: c.name,
            description: c.description,
            itemCount: c.itemCount,
            items: savedSystem.savedItems.filter(i => i.collectionId === c.id)
        })),
        totalCollections: savedSystem.collections.length,
        totalItems: savedSystem.savedItems.length,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    downloadFile('ConnectHub_All_Collections.json', dataStr, 'application/json');
    
    showToast('Exporting all collections... 📥');
    setTimeout(() => {
        showToast('Export complete! ✓');
    }, 1500);
}

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function convertToCSV(items) {
    const headers = ['Content', 'Type', 'Author', 'Saved Date', 'Tags', 'URL'];
    const rows = items.map(item => [
        `"${item.content}"`,
        item.type,
        item.author,
        item.savedDate,
        `"${item.tags.join(', ')}"`,
        item.url || ''
    ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function generateHTMLExport(data) {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${data.collection.name} - ConnectHub Collection</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        h1 { color: #4f46e5; }
        .item { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .meta { color: #666; font-size: 14px; margin-top: 10px; }
        .tags { margin-top: 10px; }
        .tag { display: inline-block; background: #e0e7ff; color: #4f46e5; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin: 2px; }
    </style>
</head>
<body>
    <h1>${data.collection.name}</h1>
    <p>${data.collection.description}</p>
    <hr>
    ${data.items.map(item => `
        <div class="item">
            <div style="font-size: 24px;">${item.emoji || '📝'}</div>
            <h3>${item.content}</h3>
            <div class="meta">By ${item.author} • ${new Date(item.savedDate).toLocaleDateString()}</div>
            <div class="tags">${item.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}</div>
            ${item.url ? `<div class="meta"><a href="${item.url}" target="_blank">${item.url}</a></div>` : ''}
        </div>
    `).join('')}
    <hr>
    <p style="text-align: center; color: #999; font-size: 12px;">Exported from ConnectHub on ${new Date(data.exportDate).toLocaleDateString()}</p>
</body>
</html>`;
}

// ========================================
// ADDITIONAL SAVED FEATURES
// ========================================

// Update Recent Saves
function updateRecentSaves() {
    savedSystem.recentSaves = savedSystem.savedItems
        .filter(item => !item.collectionId)
        .sort((a, b) => new Date(b.savedDate) - new Date(a.savedDate))
        .slice(0, 10);
}

// Extract Tags from Content
function extractTags(content) {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1).toLowerCase()) : [];
}

// Update Saved Badges
function updateSavedBadges() {
    // Update saved items count displays
    const totalSaved = savedSystem.savedItems.length;
    const totalCollections = savedSystem.collections.length;
    
    console.log(`Total saved: ${totalSaved}, Collections: ${totalCollections}`);
}

// Render Collections
function renderCollections() {
    console.log('Rendering collections...');
}

// View Collection Items
function viewCollectionItems(collectionId) {
    const collection = savedSystem.collections.find(c => c.id === collectionId);
    if (!collection) return;
    
    const items = savedSystem.savedItems.filter(item => item.collectionId === collectionId);
    
    openViewCollectionDashboard(collection, items);
}

// Add Item to Collection
function addItemToCollection(itemId, collectionId) {
    moveItemToCollection(itemId, collectionId);
}

// Quick Save to Collection
function quickSaveToCollection(postData, collectionId) {
    const newItem = {
        id: Date.now(),
        type: 'post',
        content: postData.content,
        emoji: postData.emoji || '📝',
        savedDate: new Date().toISOString(),
        collectionId: collectionId,
        author: postData.author || 'Unknown',
        tags: extractTags(postData.content),
        url: postData.url || null
    };
    
    savedSystem.savedItems.unshift(newItem);
    
    const collection = savedSystem.collections.find(c => c.id === collectionId);
    if (collection) {
        collection.itemCount++;
        collection.lastUpdated = new Date().toISOString().split('T')[0];
        showToast(`Saved to ${collection.name}! 🔖`);
    }
    
    updateRecentSaves();
    updateSavedBadges();
}

// Modal & UI Helper Functions (placeholders for UI layer)
function openViewCollectionDashboard(collection, items) {
    console.log(`Opening collection: ${collection.name} with ${items.length} items`);
}

function createMoveItemModal(item) {
    console.log(`Move item modal for: ${item.content}`);
}

function openCollectionPrivacyModal(collection) {
    console.log(`Privacy settings for: ${collection.name}`);
}

console.log('✓ Saved System loaded successfully');
