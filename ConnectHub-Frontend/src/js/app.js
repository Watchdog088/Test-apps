// Global state management
let currentCategory = null;
let currentScreen = 'home';
let isLoggedIn = false;
let isPlaying = false;
let currentTrackIndex = 0;
let gameStates = {};
let notificationCount = 3;
let isShuffleEnabled = false;
let isRepeatEnabled = false;
let isStreamLive = false;
let streamDuration = 0;
let viewerCount = 0;

// Initialize UI component instances
let profileUIComponents = null;
let searchUIComponents = null;
let groupsUIComponents = null;
let eventsUIComponents = null;
let advancedSearchResultsUI = null;
let searchDiscoveryStreamingComponents = null;

// Delete Account Modal State Management
let deleteAccountState = {
    currentStep: 1,
    dataExported: false,
    confirmationChecked: false,
    passwordEntered: false,
    deletionInProgress: false,
    deletionProgress: 0,
    deletionStep: '',
    deletionComplete: false
};

// Delete Account Modal Functionality
function openDeleteAccountModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'deleteAccountModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'deleteAccountTitle');
    modal.setAttribute('aria-modal', 'true');
    
    modal.innerHTML = `
        <div class="delete-modal-content">
            <div class="delete-modal-header">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h2 id="deleteAccountTitle">Delete Account</h2>
                <p style="margin-top: 0.5rem; opacity: 0.9;">This action cannot be undone</p>
            </div>
            
            <div class="delete-modal-body" id="deleteModalBody">
                <!-- Step 1: Warning and Information -->
                <div id="deleteStep1" class="delete-step">
                    <div class="warning-section">
                        <h3 style="color: var(--error); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            🚨 Permanent Account Deletion
                        </h3>
                        <p style="margin-bottom: 1rem; line-height: 1.6;">
                            <strong>Warning:</strong> Deleting your account is permanent and irreversible. Once deleted, you will not be able to recover your account or any of your data.
                        </p>
                        <ul style="list-style: none; padding: 0; margin: 1rem 0;">
                            <li style="margin: 0.5rem 0; color: var(--error);">• Your profile will be completely removed</li>
                            <li style="margin: 0.5rem 0; color: var(--error);">• All matches and conversations will be deleted</li>
                            <li style="margin: 0.5rem 0; color: var(--error);">• Your friends will no longer be able to find you</li>
                            <li style="margin: 0.5rem 0; color: var(--error);">• This action cannot be reversed</li>
                        </ul>
                    </div>

                    <h4 style="margin: 2rem 0 1rem;">The following data will be permanently deleted:</h4>
                    
                    <div class="data-list">
                        <div class="data-item">
                            <div class="data-icon">👤</div>
                            <div>
                                <div style="font-weight: 600;">Profile Information</div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem;">Name, bio, photos, preferences, and personal details</div>
                            </div>
                        </div>
                        <div class="data-item">
                            <div class="data-icon">💬</div>
                            <div>
                                <div style="font-weight: 600;">Messages & Conversations</div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem;">All chat history, matches, and communications</div>
                            </div>
                        </div>
                        <div class="data-item">
                            <div class="data-icon">🎵</div>
                            <div>
                                <div style="font-weight: 600;">Media Content</div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem;">Uploaded photos, videos, music playlists, and shared content</div>
                            </div>
                        </div>
                        <div class="data-item">
                            <div class="data-icon">👥</div>
                            <div>
                                <div style="font-weight: 600;">Social Connections</div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem;">Friends, followers, groups, and event participations</div>
                            </div>
                        </div>
                        <div class="data-item">
                            <div class="data-icon">🎮</div>
                            <div>
                                <div style="font-weight: 600;">Gaming & Activity Data</div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem;">Game progress, scores, achievements, and activity history</div>
                            </div>
                        </div>
                        <div class="data-item">
                            <div class="data-icon">💰</div>
                            <div>
                                <div style="font-weight: 600;">Wallet & Transactions</div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem;">Coin balance, transaction history, and purchase records</div>
                            </div>
                        </div>
                        <div class="data-item">
                            <div class="data-icon">📊</div>
                            <div>
                                <div style="font-weight: 600;">Analytics & Business Data</div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem;">Performance metrics, business insights, and usage statistics</div>
                            </div>
                        </div>
                    </div>

                    <div class="export-section">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">💾</div>
                        <h4 style="color: var(--success); margin-bottom: 1rem;">Recommended: Download Your Data</h4>
                        <p style="margin-bottom: 1rem; line-height: 1.6;">
                            Before deleting your account, we strongly recommend downloading a copy of your data. 
                            This includes your posts, messages, photos, and other personal information.
                        </p>
                        <button class="btn btn-primary" onclick="downloadUserData()" style="background: var(--success);">
                            📥 Download My Data
                        </button>
                        <p style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-muted);">
                            Data export may take a few minutes to prepare
                        </p>
                    </div>

                    <div style="text-align: center; margin-top: 2rem;">
                        <button class="btn btn-secondary" onclick="closeDeleteModal()" style="margin-right: 1rem;">
                            Cancel
                        </button>
                        <button class="btn btn-error" onclick="proceedToConfirmation()">
                            Continue with Deletion
                        </button>
                    </div>
                </div>

                <!-- Step 2: Confirmation and Password Verification -->
                <div id="deleteStep2" class="delete-step" style="display: none;">
                    <div class="step-indicator">
                        <div class="step completed"></div>
                        <div class="step active"></div>
                        <div class="step"></div>
                    </div>

                    <h3 style="margin-bottom: 1.5rem; text-align: center;">Final Confirmation Required</h3>
                    
                    <div class="confirmation-section">
                        <div class="checkbox-container">
                            <input type="checkbox" id="deleteConfirmation" required>
                            <label for="deleteConfirmation" style="line-height: 1.5; flex: 1;">
                                <strong>I understand that this action is permanent and irreversible.</strong>
                                I confirm that I want to permanently delete my ConnectHub account and all associated data. 
                                I acknowledge that this cannot be undone and I will lose access to all my content, 
                                connections, and account features forever.
                            </label>
                        </div>

                        <div class="form-group" style="margin-top: 1.5rem;">
                            <label class="form-label" for="deletePassword">
                                <strong>Enter your password to confirm:</strong>
                            </label>
                            <input 
                                type="password" 
                                id="deletePassword" 
                                class="form-input" 
                                placeholder="Enter your current password" 
                                required 
                                autocomplete="current-password"
                                style="border-color: var(--error);"
                            >
                            <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.5rem;">
                                Password verification is required for security
                            </div>
                        </div>

                        <div id="deleteError" style="display: none; color: var(--error); background: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 2rem;">
                        <button class="btn btn-secondary" onclick="backToWarning()" style="margin-right: 1rem;">
                            ← Back
                        </button>
                        <button class="btn btn-error" onclick="confirmAccountDeletion()" id="finalDeleteBtn" disabled>
                            🗑️ Delete My Account Forever
                        </button>
                    </div>
                </div>

                <!-- Step 3: Deletion Progress -->
                <div id="deleteStep3" class="delete-step" style="display: none;">
                    <div class="step-indicator">
                        <div class="step completed"></div>
                        <div class="step completed"></div>
                        <div class="step active"></div>
                    </div>

                    <div class="delete-progress">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🗑️</div>
                        <h3>Deleting Your Account...</h3>
                        <p style="color: var(--text-secondary); margin: 1rem 0;">
                            Please wait while we permanently remove your account and data.
                        </p>
                        
                        <div class="delete-progress-bar">
                            <div class="delete-progress-fill" id="deleteProgressFill"></div>
                        </div>
                        
                        <div id="deleteProgressText" style="margin-top: 1rem; color: var(--text-secondary);">
                            Initializing deletion process...
                        </div>

                        <div style="margin-top: 2rem; font-size: 0.9rem; color: var(--text-muted);">
                            This process may take up to 30 seconds to complete.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => {
        modal.classList.add('active');
        const firstFocusable = modal.querySelector('button, input');
        if (firstFocusable) firstFocusable.focus();
    }, 50);
}

// Download user data
function downloadUserData() {
    showToast('Preparing your data export...', 'info');
    showLoading();
    
    // Simulate data export process
    setTimeout(() => {
        hideLoading();
        deleteAccountState.dataExported = true;
        showToast('Data export completed! Download started.', 'success');
        
        // Create a mock download
        const link = document.createElement('a');
        link.href = 'data:text/plain;charset=utf-8,ConnectHub Data Export\nProfile, Messages, Media, and more...';
        link.download = 'connecthub-data-export.txt';
        link.click();
    }, 3000);
}

// Close delete account modal with enhanced cancel flow
function closeDeleteModal() {
    const modal = document.getElementById('deleteAccountModal');
    if (modal) {
        // Show cancel confirmation with alternatives
        showCancelConfirmation();
    }
}

// Show cancel confirmation with support options
function showCancelConfirmation() {
    const cancelModal = document.createElement('div');
    cancelModal.className = 'modal active';
    cancelModal.id = 'cancelDeleteModal';
    cancelModal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">💭</div>
                <h2 style="color: var(--primary); margin-bottom: 1rem;">We're Here to Help</h2>
                <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 2rem;">
                    Before you go, we want to make sure you have all the support you need. 
                    Sometimes account issues can be resolved without deletion.
                </p>
                
                <div style="display: grid; gap: 1rem; margin: 2rem 0;">
                    <button class="btn btn-primary" onclick="contactSupport(); closeCancelModal();">
                        💬 Talk to Support
                    </button>
                    <button class="btn btn-secondary" onclick="showAccountOptions(); closeCancelModal();">
                        ⚙️ Account Settings
                    </button>
                    <button class="btn btn-secondary" onclick="showPrivacyOptions(); closeCancelModal();">
                        🔒 Privacy Controls
                    </button>
                    <button class="btn btn-secondary" onclick="suggestBreak(); closeCancelModal();">
                        ⏸️ Take a Break Instead
                    </button>
                </div>
                
                <div style="border-top: 1px solid var(--glass-border); padding-top: 1.5rem; margin-top: 1.5rem;">
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">
                        Still want to delete your account?
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button class="btn btn-secondary" onclick="closeCancelModal()">Stay on ConnectHub</button>
                        <button class="btn btn-error" onclick="closeCancelModal(); setTimeout(openDeleteAccountModal, 300);">Continue Deletion</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(cancelModal);
    
    // Close original modal
    const deleteModal = document.getElementById('deleteAccountModal');
    if (deleteModal) deleteModal.classList.remove('active');
}

// Close cancel modal
function closeCancelModal() {
    const modal = document.getElementById('cancelDeleteModal');
    if (modal) {
        modal.remove();
    }
    
    // Also close delete modal
    const deleteModal = document.getElementById('deleteAccountModal');
    if (deleteModal) {
        deleteModal.classList.remove('active');
    }
    resetDeleteAccountModal();
}

// Enhanced proceed to confirmation with cooling-off period
function proceedToConfirmation() {
    // Check if user exported data
    if (!deleteAccountState.dataExported) {
        showDataExportReminder();
        return;
    }
    
    // Show cooling-off period warning
    showCoolingOffWarning();
}

// Show data export reminder
function showDataExportReminder() {
    const reminderModal = document.createElement('div');
    reminderModal.className = 'modal active';
    reminderModal.id = 'dataReminderModal';
    reminderModal.innerHTML = `
        <div class="modal-content" style="max-width: 550px;">
            <div style="padding: 2rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📥</div>
                    <h2 style="color: var(--warning);">Don't Lose Your Memories</h2>
                </div>
                
                <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                    <h3 style="color: var(--warning); margin-bottom: 1rem;">⚠️ Important Reminder</h3>
                    <p style="line-height: 1.6; margin-bottom: 1rem;">
                        You haven't downloaded your data yet. Once your account is deleted, you'll permanently lose:
                    </p>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin: 0.5rem 0;">📸 All your photos and videos</li>
                        <li style="margin: 0.5rem 0;">💬 Conversations and messages</li>
                        <li style="margin: 0.5rem 0;">👥 Your connections and matches</li>
                        <li style="margin: 0.5rem 0;">📊 Your activity and achievements</li>
                    </ul>
                </div>
                
                <div style="text-align: center;">
                    <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                        Take 3 minutes to save your memories. It's free and might be important to you later.
                    </p>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="downloadUserData(); closeDataReminder();">
                            📥 Download My Data First
                        </button>
                        <button class="btn btn-secondary" onclick="closeDataReminder();">
                            ← Go Back
                        </button>
                        <button class="btn" style="background: rgba(239, 68, 68, 0.8); color: white;" onclick="proceedWithoutData();">
                            Continue Without Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(reminderModal);
}

// Close data reminder modal
function closeDataReminder() {
    const modal = document.getElementById('dataReminderModal');
    if (modal) modal.remove();
}

// Proceed without downloading data
function proceedWithoutData() {
    closeDataReminder();
    
    const finalWarning = confirm(
        "FINAL WARNING: You are about to permanently delete your account WITHOUT saving your data.\n\n" +
        "This means you will lose:\n" +
        "• All photos, videos, and media\n" +
        "• All messages and conversations\n" +
        "• All connections and matches\n" +
        "• All posts and memories\n\n" +
        "Are you absolutely certain you want to continue without downloading your data?"
    );
    
    if (finalWarning) {
        showCoolingOffWarning();
    }
}

// Show cooling-off period warning
function showCoolingOffWarning() {
    const coolingModal = document.createElement('div');
    coolingModal.className = 'modal active';
    coolingModal.id = 'coolingOffModal';
    coolingModal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div style="padding: 2rem; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
                <h2 style="color: var(--error); margin-bottom: 1rem;">Take a Moment</h2>
                
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                    <p style="line-height: 1.6; margin-bottom: 1rem;">
                        Account deletion is permanent and cannot be undone. We recommend waiting 24 hours before making this decision.
                    </p>
                    <p style="font-weight: 600; color: var(--error);">
                        Are you sure this is the right choice for you right now?
                    </p>
                </div>
                
                <div style="margin: 1.5rem 0;">
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">
                        Common reasons people reconsider:
                    </p>
                    <div style="display: grid; gap: 0.5rem; margin-top: 1rem; text-align: left;">
                        <div style="font-size: 0.9rem;">• Made connections they'd miss</div>
                        <div style="font-size: 0.9rem;">• Have valuable memories saved</div>
                        <div style="font-size: 0.9rem;">• Temporary frustration that passes</div>
                        <div style="font-size: 0.9rem;">• Privacy concerns that can be fixed</div>
                    </div>
                </div>
                
                <div id="coolingTimer" style="background: var(--glass); border-radius: 8px; padding: 1rem; margin: 1.5rem 0;">
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">Cooling-off Period</div>
                    <div id="timerDisplay" style="font-size: 1.5rem; color: var(--primary);">0:30</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">Please wait 30 seconds before continuing</div>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-secondary" onclick="closeCoolingModal()">
                        💙 Keep My Account
                    </button>
                    <button class="btn btn-error" id="proceedAfterCooling" disabled onclick="proceedAfterCoolingOff()">
                        🗑️ Still Delete Account
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(coolingModal);
    startCoolingTimer();
}

// Start cooling-off timer
function startCoolingTimer() {
    let timeLeft = 30;
    const timerDisplay = document.getElementById('timerDisplay');
    const proceedBtn = document.getElementById('proceedAfterCooling');
    
    const timer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        if (timerDisplay) {
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            if (proceedBtn) {
                proceedBtn.disabled = false;
                proceedBtn.style.opacity = '1';
                proceedBtn.style.cursor = 'pointer';
            }
            if (timerDisplay) {
                timerDisplay.textContent = 'Ready';
                timerDisplay.parentElement.style.background = 'rgba(239, 68, 68, 0.1)';
            }
        }
        
        timeLeft--;
    }, 1000);
}

// Close cooling-off modal
function closeCoolingModal() {
    const modal = document.getElementById('coolingOffModal');
    if (modal) modal.remove();
    
    showToast('Account deletion cancelled. We\'re glad you\'re staying!', 'success');
}

// Proceed after cooling-off period
function proceedAfterCoolingOff() {
    const modal = document.getElementById('coolingOffModal');
    if (modal) modal.remove();
    
    // Now actually proceed to step 2
    deleteAccountState.currentStep = 2;
    showDeleteStep(2);
    
    // Set up event listeners for step 2
    setTimeout(() => {
        const checkbox = document.getElementById('deleteConfirmation');
        const password = document.getElementById('deletePassword');
        
        if (checkbox) {
            checkbox.addEventListener('change', validateConfirmationInputs);
        }
        
        if (password) {
            password.addEventListener('input', validateConfirmationInputs);
            password.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !document.getElementById('finalDeleteBtn').disabled) {
                    confirmAccountDeletion();
                }
            });
        }
    }, 100);
}

// Go back to warning step
function backToWarning() {
    deleteAccountState.currentStep = 1;
    showDeleteStep(1);
}

// Show specific delete step
function showDeleteStep(step) {
    document.querySelectorAll('.delete-step').forEach((stepEl, index) => {
        stepEl.style.display = index === (step - 1) ? 'block' : 'none';
    });
    
    if (step === 3) {
        document.querySelector('.delete-progress').style.display = 'block';
        startDeletionProcess();
    }
}

// Validate confirmation inputs
function validateConfirmationInputs() {
    const checkbox = document.getElementById('deleteConfirmation');
    const password = document.getElementById('deletePassword');
    const deleteBtn = document.getElementById('finalDeleteBtn');
    
    if (checkbox && password && deleteBtn) {
        const isValid = checkbox.checked && password.value.length > 0;
        deleteBtn.disabled = !isValid;
        
        deleteAccountState.confirmationChecked = checkbox.checked;
        deleteAccountState.passwordEntered = password.value.length > 0;
    }
}

// Show delete error
function showDeleteError(message) {
    const errorDiv = document.getElementById('deleteError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Confirm account deletion
function confirmAccountDeletion() {
    const password = document.getElementById('deletePassword');
    const errorDiv = document.getElementById('deleteError');
    
    if (!password || !password.value) {
        showDeleteError('Please enter your password to continue.');
        return;
    }
    
    // Simulate password verification
    if (password.value.length < 6) { // Mock validation
        showDeleteError('Incorrect password. Please try again.');
        password.classList.add('shake');
        setTimeout(() => password.classList.remove('shake'), 500);
        return;
    }
    
    // Hide any previous errors
    if (errorDiv) errorDiv.style.display = 'none';
    
    // Proceed to deletion
    deleteAccountState.currentStep = 3;
    showDeleteStep(3);
}

// Start deletion process
function startDeletionProcess() {
    const progressFill = document.getElementById('deleteProgressFill');
    const progressText = document.getElementById('deleteProgressText');
    
    const deletionSteps = [
        { progress: 10, text: 'Verifying account credentials...' },
        { progress: 25, text: 'Removing profile information...' },
        { progress: 40, text: 'Deleting messages and conversations...' },
        { progress: 55, text: 'Removing media content...' },
        { progress: 70, text: 'Clearing social connections...' },
        { progress: 85, text: 'Removing wallet and transaction data...' },
        { progress: 95, text: 'Finalizing account deletion...' },
        { progress: 100, text: 'Account deletion completed.' }
    ];
    
    let currentStepIndex = 0;
    
    const processStep = () => {
        if (currentStepIndex < deletionSteps.length) {
            const step = deletionSteps[currentStepIndex];
            
            if (progressFill) progressFill.style.width = step.progress + '%';
            if (progressText) progressText.textContent = step.text;
            
            currentStepIndex++;
            
            // Simulate variable processing time for each step
            const delay = currentStepIndex === deletionSteps.length ? 1500 : 2000 + Math.random() * 2000;
            setTimeout(processStep, delay);
        } else {
            completeDeletion();
        }
    };
    
    processStep();
}

// Complete deletion process
function completeDeletion() {
    setTimeout(() => {
        hideLoading();
        closeDeleteModal();
        
        // Show final confirmation
        showToast('Account deleted successfully. You will be redirected shortly.', 'success');
        
        // Simulate logout and redirect
        setTimeout(() => {
            // In a real app, this would log out the user and redirect to homepage
            isLoggedIn = false;
            currentCategory = null;
            currentScreen = 'home';
            
            // Hide all sections and show auth screen
            document.querySelectorAll('.category-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById('authScreen').classList.add('active');
            
            updateMainNav();
            updateSubNav();
            
            showToast('Your account has been permanently deleted. Thank you for using ConnectHub.', 'info');
        }, 2000);
    }, 1500);
}

// Reset modal to initial state
function resetDeleteAccountModal() {
    deleteAccountState = {
        currentStep: 1,
        dataExported: false,
        confirmationChecked: false,
        passwordEntered: false,
        deletionInProgress: false,
        deletionProgress: 0,
        deletionStep: '',
        deletionComplete: false
    };
    
    // Reset all steps
    document.querySelectorAll('.delete-step').forEach((step, index) => {
        step.style.display = index === 0 ? 'block' : 'none';
    });
    
    // Reset form inputs
    const checkbox = document.getElementById('deleteConfirmation');
    const password = document.getElementById('deletePassword');
    const deleteBtn = document.getElementById('finalDeleteBtn');
    
    if (checkbox) checkbox.checked = false;
    if (password) password.value = '';
    if (deleteBtn) deleteBtn.disabled = true;
    
    // Hide error messages
    const errorDiv = document.getElementById('deleteError');
    if (errorDiv) errorDiv.style.display = 'none';
}
