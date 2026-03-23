// Data Export Functionality
let exportState = {
    selectedData: new Set(['profileData', 'postsData', 'messagesData', 'connectionsData']),
    isExporting: false,
    currentStep: 0,
    progress: 0
};

const dataTypes = {
    profileData: { name: 'Profile Information', size: 2.5, unit: 'MB' },
    postsData: { name: 'Posts & Content', size: 45, unit: 'MB' },
    mediaData: { name: 'Photos & Videos', size: 2300, unit: 'MB' },
    messagesData: { name: 'Messages & Chats', size: 12, unit: 'MB' },
    connectionsData: { name: 'Connections & Network', size: 5, unit: 'MB' },
    analyticsData: { name: 'Analytics & Insights', size: 8, unit: 'MB' }
};

function openDataExportModal() {
    document.getElementById('dataExportModal').classList.add('active');
    updateSummary();
    
    // Add change listeners to checkboxes
    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
}

function closeDataExportModal() {
    if (exportState.isExporting) {
        if (confirm('Export is in progress. Are you sure you want to cancel?')) {
            cancelExport();
            document.getElementById('dataExportModal').classList.remove('active');
        }
    } else {
        document.getElementById('dataExportModal').classList.remove('active');
        resetModal();
    }
}

function handleCheckboxChange(event) {
    const checkboxId = event.target.id;
    
    if (event.target.checked) {
        exportState.selectedData.add(checkboxId);
    } else {
        exportState.selectedData.delete(checkboxId);
    }
    
    updateSummary();
}

function updateSummary() {
    const selectedCount = exportState.selectedData.size;
    let totalSize = 0;
    let estimatedTime = '1-2 minutes';

    exportState.selectedData.forEach(dataType => {
        if (dataTypes[dataType]) {
            totalSize += dataTypes[dataType].size;
        }
    });

    // Calculate estimated time based on data size
    if (totalSize > 100) {
        estimatedTime = '5-10 minutes';
    } else if (totalSize > 50) {
        estimatedTime = '3-5 minutes';
    }

    document.getElementById('selectedCount').textContent = selectedCount;
    document.getElementById('estimatedSize').textContent = `~${totalSize.toFixed(1)} MB`;
    document.getElementById('estimatedTime').textContent = estimatedTime;
    
    // Enable/disable export button
    document.getElementById('startExportBtn').disabled = selectedCount === 0;
}

function startExport() {
    if (exportState.selectedData.size === 0) {
        showToast('Please select at least one data type to export', 'warning');
        return;
    }

    exportState.isExporting = true;
    exportState.currentStep = 0;
    exportState.progress = 0;

    // Switch to processing phase
    document.getElementById('selectionPhase').style.display = 'none';
    document.getElementById('processingPhase').style.display = 'block';
    document.getElementById('completionPhase').style.display = 'none';

    // Start the export process
    processExportSteps();
}

function processExportSteps() {
    const steps = [
        { name: 'Validating Data Selection', duration: 1000 },
        { name: 'Collecting Data', duration: 3000 },
        { name: 'Processing & Formatting', duration: 2500 },
        { name: 'Creating Archive', duration: 2000 },
        { name: 'Finalizing Export', duration: 1500 }
    ];

    let currentStepIndex = 0;

    function processStep() {
        if (!exportState.isExporting) return; // Export was cancelled

        const stepNum = currentStepIndex + 1;
        const step = document.getElementById(`step${stepNum}`);
        const status = document.getElementById(`status${stepNum}`);
        
        // Mark current step as active
        step.classList.add('active');
        status.innerHTML = `
            <div class="status-dot status-processing"></div>
            <span>Processing...</span>
        `;

        // Update progress
        const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;
        document.getElementById('exportProgress').style.width = progressPercent + '%';
        document.getElementById('progressText').textContent = steps[currentStepIndex].name;
        document.getElementById('progressDetail').textContent = `Step ${stepNum} of ${steps.length}`;

        setTimeout(() => {
            if (!exportState.isExporting) return; // Export was cancelled

            // Mark step as complete
            step.classList.remove('active');
            step.classList.add('complete');
            status.innerHTML = `
                <div class="status-dot status-complete"></div>
                <span>Complete</span>
            `;

            currentStepIndex++;

            if (currentStepIndex < steps.length) {
                processStep();
            } else {
                completeExport();
            }
        }, steps[currentStepIndex].duration);
    }

    processStep();
}

function cancelExport() {
    exportState.isExporting = false;
    resetModal();
    showToast('Export cancelled', 'info');
}

function completeExport() {
    exportState.isExporting = false;
    
    // Generate completion data
    const now = new Date();
    document.getElementById('finalFileSize').textContent = calculateFinalSize();
    document.getElementById('generationTime').textContent = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Update included data list
    updateIncludedDataList();

    // Switch to completion phase
    document.getElementById('processingPhase').style.display = 'none';
    document.getElementById('completionPhase').style.display = 'block';

    showToast('Export completed successfully!', 'success');
}

function calculateFinalSize() {
    let totalSize = 0;
    exportState.selectedData.forEach(dataType => {
        if (dataTypes[dataType]) {
            totalSize += dataTypes[dataType].size;
        }
    });
    
    // Add some compression efficiency
    const compressedSize = totalSize * 0.85;
    return compressedSize.toFixed(1) + ' MB';
}

function updateIncludedDataList() {
    const includedData = document.getElementById('includedData');
    const items = [];

    if (exportState.selectedData.has('profileData')) {
        items.push('Profile information and account settings');
    }
    if (exportState.selectedData.has('postsData')) {
        items.push('156 posts with metadata and engagement data');
    }
    if (exportState.selectedData.has('mediaData')) {
        items.push('1,234 photos and videos');
    }
    if (exportState.selectedData.has('messagesData')) {
        items.push('2,567 messages and conversation threads');
    }
    if (exportState.selectedData.has('connectionsData')) {
        items.push('1,247 connections and relationship data');
    }
    if (exportState.selectedData.has('analyticsData')) {
        items.push('3 months of analytics and insights');
    }

    includedData.innerHTML = items.map(item => `<li>${item}</li>`).join('');
}

function downloadFile() {
    // Create export data
    const exportData = {
        timestamp: new Date().toISOString(),
        user: 'John Doe',
        exportedData: Array.from(exportState.selectedData),
        data: {
            profile: exportState.selectedData.has('profileData') ? {
                name: 'John Doe',
                email: 'john@example.com',
                joinDate: '2023-01-01'
            } : null,
            posts: exportState.selectedData.has('postsData') ? [
                { id: 1, content: 'Sample post 1', date: '2023-06-01' },
                { id: 2, content: 'Sample post 2', date: '2023-06-15' }
            ] : null,
            media: exportState.selectedData.has('mediaData') ? [
                { id: 1, type: 'image', url: 'image1.jpg' },
                { id: 2, type: 'video', url: 'video1.mp4' }
            ] : null,
            messages: exportState.selectedData.has('messagesData') ? [
                { id: 1, from: 'Emma', content: 'Hi!', date: '2023-06-20' },
                { id: 2, from: 'John', content: 'Hello!', date: '2023-06-20' }
            ] : null,
            connections: exportState.selectedData.has('connectionsData') ? [
                { id: 1, name: 'Emma Wilson', type: 'friend' },
                { id: 2, name: 'Mike Johnson', type: 'follower' }
            ] : null
        }
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `connecthub-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    showToast('Download started! Check your downloads folder.', 'success');
}

function resetModal() {
    // Reset to initial state
    document.getElementById('selectionPhase').style.display = 'block';
    document.getElementById('processingPhase').style.display = 'none';
    document.getElementById('completionPhase').style.display = 'none';

    // Reset all steps
    for (let i = 1; i <= 5; i++) {
        const step = document.getElementById(`step${i}`);
        const status = document.getElementById(`status${i}`);
        
        step.classList.remove('active', 'complete');
        status.innerHTML = `
            <div class="status-dot status-pending"></div>
            <span>Pending</span>
        `;
    }

    // Reset progress
    document.getElementById('exportProgress').style.width = '0%';
    
    exportState.isExporting = false;
    exportState.currentStep = 0;
    exportState.progress = 0;
}

function showToast(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Remove toast after 4 seconds
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Close modal on background click
    document.getElementById('dataExportModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('dataExportModal')) {
            closeDataExportModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDataExportModal();
        }
    });
});
