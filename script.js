document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded event fired");
    
    // Initialize UI components
    initializeModals();
    initializePostActions();
    initializeCreatePost();
    initializeImageViewer();
    initializeFeedTabs();
    initializeDatingSection();
    initializeHomeNavigation();
    initializeNavigation();
    
    console.log("Looking for Test Dating Section button...");
    
    // Add event listener for the Test Dating Section button
    const testDatingBtn = document.getElementById('test-dating-section-btn');
    console.log("Test Dating Section button:", testDatingBtn);
    
    if (testDatingBtn) {
        console.log("Test Dating Section button found");
        testDatingBtn.addEventListener('click', function() {
            console.log("Test Dating Section button clicked");
            showDatingSection();
        });
    } else {
        console.error("Test Dating Section button not found");
        
        // Try a different approach with a timeout
        setTimeout(function() {
            console.log("Trying to find Test Dating Section button again after timeout...");
            const testDatingBtnRetry = document.getElementById('test-dating-section-btn');
            console.log("Test Dating Section button (retry):", testDatingBtnRetry);
            
            if (testDatingBtnRetry) {
                console.log("Test Dating Section button found after timeout");
                testDatingBtnRetry.addEventListener('click', function() {
                    console.log("Test Dating Section button clicked (retry)");
                    showDatingSection();
                });
            } else {
                console.error("Test Dating Section button still not found after timeout");
                
                // Try with querySelector as a fallback
                const testDatingBtnFallback = document.querySelector('button#test-dating-section-btn');
                console.log("Test Dating Section button (fallback):", testDatingBtnFallback);
                
                if (testDatingBtnFallback) {
                    console.log("Test Dating Section button found with querySelector");
                    testDatingBtnFallback.addEventListener('click', function() {
                        console.log("Test Dating Section button clicked (fallback)");
                        showDatingSection();
                    });
                } else {
                    // Last resort: add click handler to all buttons
                    console.log("Adding click handler to all buttons as last resort");
                    const allButtons = document.querySelectorAll('button');
                    allButtons.forEach(function(btn) {
                        if (btn.textContent.trim() === 'Test Dating Section') {
                            console.log("Found button with 'Test Dating Section' text:", btn);
                            btn.addEventListener('click', function() {
                                console.log("Test Dating Section button clicked (text match)");
                                showDatingSection();
                            });
                        }
                    });
                }
            }
        }, 500);
    }
    
    // Initialize back to main button
    const backToMainBtn = document.getElementById('back-to-main');
    if (backToMainBtn) {
        backToMainBtn.addEventListener('click', function() {
            showMainContent();
        });
    } else {
        console.error("Back to main button not found on initial load");
        // Add a mutation observer to watch for the button to be added to the DOM
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    const backBtn = document.getElementById('back-to-main');
                    if (backBtn && !backBtn.hasEventListener) {
                        backBtn.addEventListener('click', function() {
                            showMainContent();
                        });
                        backBtn.hasEventListener = true;
                        console.log("Back to main button event listener attached");
                    }
                }
            });
        });
        
        // Start observing the document body for DOM changes
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    // Direct access to dating section for testing
    const datingLink = document.querySelector('a[href="#"][id="dating-nav"]');
    if (datingLink) {
        console.log("Dating link found directly:", datingLink);
        
        // Add a direct click handler
        datingLink.onclick = function(e) {
            e.preventDefault();
            console.log("Dating link clicked directly");
            
            const mainContent = document.querySelector('.main-content');
            const datingSection = document.getElementById('dating-section');
            
            if (mainContent && datingSection) {
                mainContent.style.display = 'none';
                datingSection.style.display = 'block';
                
                // Update navigation active state
                const navItems = document.querySelectorAll('.main-nav li');
                navItems.forEach(item => item.classList.remove('active'));
                this.parentElement.classList.add('active');
                
                console.log("Dating section displayed");
            } else {
                console.error("Could not find main content or dating section");
            }
            
            return false;
        };
    } else {
        console.error("Could not find dating link directly");
    }
    
    // Show a welcome message in console
    console.log('ConnectHub Social Media App initialized successfully!');
});

// Dating Section Functionality
function initializeDatingSection() {
    const datingNav = document.getElementById('dating-nav');
    const datingSection = document.getElementById('dating-section');
    const mainContent = document.querySelector('.main-content');
    const datingTabs = document.querySelectorAll('.dating-tab');
    const likeBtn = document.querySelector('.profile-card .like-btn');
    const dislikeBtn = document.querySelector('.profile-card .dislike-btn');
    const matchMessageBtns = document.querySelectorAll('.match-action-btn.message-btn');
    const dateBtns = document.querySelectorAll('.match-action-btn.date-btn');
    const matchFoundModal = document.getElementById('match-found-modal');
    const matchMessageModal = document.getElementById('match-message-modal');
    const planDateModal = document.getElementById('plan-date-modal');
    
    // Initialize back to main button directly in this function
    const backToMainBtn = document.getElementById('back-to-main');
    if (backToMainBtn) {
        console.log("Back to main button found in initializeDatingSection");
        backToMainBtn.addEventListener('click', function() {
            console.log("Back to main button clicked in initializeDatingSection");
            showMainContent();
        });
    } else {
        console.error("Back to main button not found in initializeDatingSection");
        // We'll try to find it once the dating section is displayed
        setTimeout(function() {
            const laterBackBtn = document.getElementById('back-to-main');
            if (laterBackBtn && !laterBackBtn.hasEventListener) {
                laterBackBtn.addEventListener('click', function() {
                    console.log("Back to main button clicked (delayed binding)");
                    showMainContent();
                });
                laterBackBtn.hasEventListener = true;
                console.log("Back to main button event listener attached (delayed)");
            }
        }, 500);
    }
    
    // Toggle between main content and dating section
    if (datingNav && datingSection) {
        console.log("Dating nav and section found");
        
        datingNav.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Dating nav clicked");
            
            // Update navigation active state
            const navItems = document.querySelectorAll('.main-nav li');
            navItems.forEach(item => item.classList.remove('active'));
            this.parentElement.classList.add('active');
            
            // Force display properties directly
            if (datingSection.style.display === 'block') {
                console.log("Switching to main content");
                // Switch back to main content
                mainContent.style.display = 'grid';
                datingSection.style.display = 'none';
                
                // Update home nav to active
                const homeNav = document.querySelector('.main-nav li:first-child');
                if (homeNav) {
                    homeNav.classList.add('active');
                }
                this.parentElement.classList.remove('active');
            } else {
                console.log("Switching to dating section");
                // Switch to dating section
                mainContent.style.display = 'none';
                datingSection.style.display = 'block';
                
                // Show toast notification
                showToast('Welcome to ConnectHub Dating!');
            }
        });
    } else {
        console.error("Dating nav or section not found", { 
            datingNav: datingNav ? "Found" : "Not found", 
            datingSection: datingSection ? "Found" : "Not found" 
        });
    }
    
    // Dating tabs functionality
    datingTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            datingTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get the tab type from data attribute
            const tabType = this.getAttribute('data-tab');
            
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.dating-tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show the selected tab content
            const selectedContent = document.getElementById(`${tabType}-tab`);
            if (selectedContent) {
                selectedContent.classList.add('active');
            }
        });
    });
    
    // Like/Dislike functionality
    if (likeBtn) {
        likeBtn.addEventListener('click', function() {
            // In a real app, this would send a like to the server
            // For the prototype, we'll show a match modal 50% of the time
            if (Math.random() > 0.5) {
                openModal(matchFoundModal);
            } else {
                showToast('You liked Sophia!');
                loadNextProfile();
            }
        });
    }
    
    if (dislikeBtn) {
        dislikeBtn.addEventListener('click', function() {
            // In a real app, this would send a dislike to the server
            showToast('Profile skipped');
            loadNextProfile();
        });
    }
    
    // Message button functionality
    matchMessageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Close match found modal if it's open
            if (matchFoundModal) {
                closeModal(matchFoundModal);
            }
            
            // Open message modal
            openModal(matchMessageModal);
        });
    });
    
    // Date button functionality
    dateBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            openModal(planDateModal);
        });
    });
    
    // Date type options in plan date modal
    const dateTypeOptions = document.querySelectorAll('.date-type-option');
    dateTypeOptions.forEach(option => {
        option.addEventListener('click', function() {
            dateTypeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Location options in plan date modal
    const locationOptions = document.querySelectorAll('.location-option');
    locationOptions.forEach(option => {
        option.addEventListener('click', function() {
            const locationInput = document.querySelector('.location-picker input');
            const locationName = this.querySelector('h4').textContent;
            const locationAddress = this.querySelector('p').textContent;
            
            if (locationInput) {
                locationInput.value = `${locationName}, ${locationAddress}`;
            }
        });
    });
    
    // Date submit button
    const dateSubmitBtn = document.querySelector('.date-submit-btn');
    if (dateSubmitBtn) {
        dateSubmitBtn.addEventListener('click', function() {
            closeModal(planDateModal);
            showToast('Date invitation sent!');
        });
    }
    
    // Helper function to load next profile
    function loadNextProfile() {
        // In a real app, this would fetch a new profile from the server
        // For the prototype, we'll just show a loading message
        const cardContainer = document.querySelector('.card-container');
        if (cardContainer) {
            cardContainer.innerHTML = '<div class="loading-profile">Loading next profile...</div>';
            
            // Simulate loading a new profile after 1 second
            setTimeout(() => {
                cardContainer.innerHTML = `
                    <div class="profile-card">
                        <div class="profile-card-header">
                            <img src="https://source.unsplash.com/random/600x800/?portrait,woman,2" alt="Profile Photo" class="profile-card-image">
                            <div class="profile-card-info">
                                <h3>Olivia Martinez, 26</h3>
                                <p><i class="fas fa-map-marker-alt"></i> 3 miles away</p>
                            </div>
                        </div>
                        <div class="profile-card-body">
                            <p class="profile-bio">Art director and foodie. Love trying new restaurants and traveling. Looking for someone with similar interests!</p>
                            <div class="profile-interests">
                                <span class="interest-tag">Art</span>
                                <span class="interest-tag">Food</span>
                                <span class="interest-tag">Travel</span>
                                <span class="interest-tag">Music</span>
                            </div>
                        </div>
                        <div class="profile-card-actions">
                            <button class="action-btn dislike-btn"><i class="fas fa-times"></i></button>
                            <button class="action-btn like-btn"><i class="fas fa-heart"></i></button>
                        </div>
                    </div>
                `;
                
                // Re-attach event listeners to the new buttons
                const newLikeBtn = document.querySelector('.profile-card .like-btn');
                const newDislikeBtn = document.querySelector('.profile-card .dislike-btn');
                
                if (newLikeBtn) {
                    newLikeBtn.addEventListener('click', function() {
                        if (Math.random() > 0.5) {
                            openModal(matchFoundModal);
                        } else {
                            showToast('You liked Olivia!');
                            loadNextProfile();
                        }
                    });
                }
                
                if (newDislikeBtn) {
                    newDislikeBtn.addEventListener('click', function() {
                        showToast('Profile skipped');
                        loadNextProfile();
                    });
                }
            }, 1000);
        }
    }
    
    // Helper functions for modals
    function openModal(modal) {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        }
    }
    
    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }
    }
}

// Feed Tab Functionality
function initializeFeedTabs() {
    const feedTabs = document.querySelectorAll('.feed-tab');
    
    feedTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            feedTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get the feed type from data attribute
            const feedType = this.getAttribute('data-feed');
            
            // Hide all feeds
            const feeds = document.querySelectorAll('.feed-posts');
            feeds.forEach(feed => feed.classList.remove('active'));
            
            // Show the selected feed
            const selectedFeed = document.querySelector(`.${feedType}-feed`);
            if (selectedFeed) {
                selectedFeed.classList.add('active');
            }
            
            // Show toast notification for feed change
            if (feedType === 'for-you') {
                showToast('Showing personalized recommendations for you');
            } else {
                showToast('Showing posts from people you follow');
            }
        });
    });
}

// Modal Functionality
function initializeModals() {
    // Get all modal triggers and modals
    const createPostTrigger = document.getElementById('post-text-input');
    const photoVideoBtn = document.getElementById('photo-video-btn');
    const createPostModal = document.getElementById('create-post-modal');
    const imageViewerModal = document.getElementById('image-viewer-modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // Open create post modal when clicking on the post input or photo/video button
    if (createPostTrigger) {
        createPostTrigger.addEventListener('click', function() {
            openModal(createPostModal);
        });
    }
    
    if (photoVideoBtn) {
        photoVideoBtn.addEventListener('click', function() {
            openModal(createPostModal);
        });
    }
    
    // Add click event to all post images to open image viewer
    const postImages = document.querySelectorAll('.post-image');
    postImages.forEach(image => {
        image.addEventListener('click', function() {
            const fullsizeImage = document.getElementById('fullsize-image');
            fullsizeImage.src = this.src;
            openModal(imageViewerModal);
        });
    });
    
    // Close modal when clicking close button
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });
    
    // Helper functions for modals
    function openModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }
    
    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Post Actions (Like, Comment, Share, Save)
function initializePostActions() {
    // Like buttons
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const countSpan = this.querySelector('span');
            const count = parseInt(countSpan.textContent.replace(/,/g, ''));
            
            if (icon.classList.contains('far')) {
                // Like the post
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#ed4956'; // Heart color
                countSpan.textContent = formatCount(count + 1);
            } else {
                // Unlike the post
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '';
                countSpan.textContent = formatCount(count - 1);
            }
        });
    });
    
    // Comment buttons - toggle comment section visibility
    const commentButtons = document.querySelectorAll('.comment-btn');
    commentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const post = this.closest('.post');
            const commentSection = post.querySelector('.post-comments');
            
            if (commentSection) {
                if (commentSection.style.display === 'none') {
                    commentSection.style.display = 'block';
                } else {
                    commentSection.style.display = 'none';
                }
            }
        });
    });
    
    // Save buttons
    const saveButtons = document.querySelectorAll('.save-btn');
    saveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const icon = this.querySelector('i');
            
            if (icon.classList.contains('far')) {
                // Save the post
                icon.classList.remove('far');
                icon.classList.add('fas');
                showToast('Post saved to your collection');
            } else {
                // Unsave the post
                icon.classList.remove('fas');
                icon.classList.add('far');
                showToast('Post removed from your collection');
            }
        });
    });
    
    // Share buttons
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            // In a real app, this would open a share dialog
            showToast('Share dialog would open here');
        });
    });
    
    // Helper function to format counts (e.g., 1200 -> 1.2K)
    function formatCount(count) {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        } else {
            return count.toString();
        }
    }
}

// Create Post Functionality
function initializeCreatePost() {
    const createPostBtn = document.getElementById('create-post-btn');
    const submitPostBtn = document.getElementById('submit-post');
    const addPhotoBtn = document.getElementById('add-photo');
    const addVideoBtn = document.getElementById('add-video');
    const addEmojiBtn = document.getElementById('add-emoji');
    const mediaPreview = document.getElementById('media-preview');
    
    // Submit post button in the modal
    if (submitPostBtn) {
        submitPostBtn.addEventListener('click', function() {
            // In a real app, this would submit the post data to the server
            const modal = this.closest('.modal');
            closeModal(modal);
            showToast('Your post has been published!');
        });
    }
    
    // Add photo button
    if (addPhotoBtn) {
        addPhotoBtn.addEventListener('click', function() {
            // In a real app, this would open a file picker
            // For the prototype, we'll just add a placeholder image
            if (mediaPreview) {
                const img = document.createElement('img');
                img.src = 'https://via.placeholder.com/300x200?text=Your+Photo+Here';
                img.alt = 'Photo preview';
                img.style.maxWidth = '100%';
                img.style.borderRadius = '8px';
                
                // Clear previous previews
                mediaPreview.innerHTML = '';
                mediaPreview.appendChild(img);
            }
        });
    }
    
    // Add video button
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', function() {
            // In a real app, this would open a file picker
            // For the prototype, we'll just add a placeholder video
            if (mediaPreview) {
                const videoContainer = document.createElement('div');
                videoContainer.className = 'video-container';
                videoContainer.style.paddingTop = '56.25%';
                videoContainer.style.position = 'relative';
                videoContainer.style.borderRadius = '8px';
                videoContainer.style.overflow = 'hidden';
                
                const video = document.createElement('video');
                video.controls = true;
                video.poster = 'https://via.placeholder.com/600x400?text=Your+Video+Here';
                video.style.position = 'absolute';
                video.style.top = '0';
                video.style.left = '0';
                video.style.width = '100%';
                video.style.height = '100%';
                
                // Clear previous previews
                mediaPreview.innerHTML = '';
                videoContainer.appendChild(video);
                mediaPreview.appendChild(videoContainer);
            }
        });
    }
    
    // Helper function to close modal
    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Image Viewer Functionality
function initializeImageViewer() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const fullsizeImage = document.getElementById('fullsize-image');
    
    // Current image index
    let currentImageIndex = 0;
    let galleryImages = [];
    
    // Get all post images
    const postImages = document.querySelectorAll('.post-image');
    postImages.forEach((image, index) => {
        galleryImages.push(image.src);
        
        image.addEventListener('click', function() {
            currentImageIndex = index;
            updateImageViewer();
        });
    });
    
    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            updateImageViewer();
        });
    }
    
    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            updateImageViewer();
        });
    }
    
    // Update image viewer with current image
    function updateImageViewer() {
        if (fullsizeImage && galleryImages.length > 0) {
            fullsizeImage.src = galleryImages[currentImageIndex];
        }
    }
}

// Toast Notification
function showToast(message) {
    // Check if a toast container already exists
    let toastContainer = document.querySelector('.toast-container');
    
    // If not, create one
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.left = '50%';
        toastContainer.style.transform = 'translateX(-50%)';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.marginTop = '10px';
    toast.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease-in-out';
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Trigger reflow to enable transition
    void toast.offsetWidth;
    
    // Show toast
    toast.style.opacity = '1';
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        
        // Remove toast after fade out
        setTimeout(() => {
            toastContainer.removeChild(toast);
            
            // Remove container if empty
            if (toastContainer.children.length === 0) {
                document.body.removeChild(toastContainer);
            }
        }, 300);
    }, 3000);
}

// Responsive Navigation
window.addEventListener('resize', function() {
    adjustNavigationForScreenSize();
});

function adjustNavigationForScreenSize() {
    const navItems = document.querySelectorAll('.main-nav li a');
    const screenWidth = window.innerWidth;
    
    navItems.forEach(item => {
        const icon = item.querySelector('i');
        const text = item.textContent.trim().replace(icon.textContent.trim(), '').trim();
        
        if (screenWidth <= 480) {
            // Show only icons on small screens
            item.innerHTML = `<i class="${icon.className}"></i>`;
        } else {
            // Show icons and text on larger screens
            item.innerHTML = `<i class="${icon.className}"></i> ${text}`;
        }
    });
}

// Call this function on initial load
adjustNavigationForScreenSize();

// Function to initialize home navigation
function initializeHomeNavigation() {
    // Add direct click handler to all elements with the home icon
    const homeIcons = document.querySelectorAll('.fa-home');
    homeIcons.forEach(icon => {
        console.log("Found home icon:", icon);
        icon.addEventListener('click', function(e) {
            console.log("Home icon clicked directly");
            e.preventDefault();
            e.stopPropagation(); // Stop event from bubbling up
            showMainContent();
            return false;
        });
        
        // Also add click handler to the parent element (usually an <a> tag)
        if (icon.parentElement) {
            icon.parentElement.addEventListener('click', function(e) {
                console.log("Home icon parent clicked");
                e.preventDefault();
                showMainContent();
                return false;
            });
        }
    });
    
    // Add specific handler for the main navigation home link
    const homeNavLinks = document.querySelectorAll('.main-nav li:first-child a, a[href="#"] .fa-home, .app-header a[href="#"]:first-child');
    homeNavLinks.forEach(link => {
        if (link) {
            console.log("Home navigation link found:", link);
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("Home link clicked");
                showMainContent();
                return false;
            });
        }
    });
    
    // Also add a global click handler for any element that might be the home icon
    document.addEventListener('click', function(e) {
        // Check if the clicked element is the Home icon or contains it
        if ((e.target.classList && e.target.classList.contains('fa-home')) || 
            (e.target.querySelector && e.target.querySelector('.fa-home'))) {
            console.log("Home icon or container clicked via global handler");
            e.preventDefault();
            showMainContent();
            return false;
        }
    });
}

// Function to show dating section - making it globally accessible
window.showDatingSection = function() {
    console.log("showDatingSection function called");
    
    const mainContent = document.querySelector('.main-content');
    const datingSection = document.getElementById('dating-section');
    
    console.log("Main content:", mainContent);
    console.log("Dating section:", datingSection);
    
    if (mainContent && datingSection) {
        // Hide main content and show dating section
        mainContent.style.display = 'none';
        datingSection.style.display = 'block';
        
        // Update navigation active state
        const navItems = document.querySelectorAll('.main-nav li');
        navItems.forEach(item => item.classList.remove('active'));
        
        const datingNavItem = document.querySelector('a[id="dating-nav"]').parentElement;
        if (datingNavItem) {
            datingNavItem.classList.add('active');
        }
        
        // Show toast notification
        showToast('Welcome to ConnectHub Dating!');
        
        console.log("Dating section displayed");
    } else {
        console.error("Could not find main content or dating section");
    }
}

// Function to show main content (go back from dating section)
function showMainContent() {
    const mainContent = document.querySelector('.main-content');
    const datingSection = document.getElementById('dating-section');
    const notificationsSection = document.getElementById('notifications-section');
    const messagesSection = document.getElementById('messages-section');
    const profileSection = document.getElementById('profile-section');
    
    if (mainContent) {
        // Show main content and hide all other sections
        mainContent.style.display = 'grid';
        
        if (datingSection) datingSection.style.display = 'none';
        if (notificationsSection) notificationsSection.style.display = 'none';
        if (messagesSection) messagesSection.style.display = 'none';
        if (profileSection) profileSection.style.display = 'none';
        
        // Update navigation active state
        const navItems = document.querySelectorAll('.main-nav li');
        navItems.forEach(item => item.classList.remove('active'));
        
        const homeNavItem = document.querySelector('.main-nav li:first-child');
        if (homeNavItem) {
            homeNavItem.classList.add('active');
        }
        
        // Show toast notification
        showToast('Returned to main feed');
    }
}

// Function to initialize navigation for all sections
function initializeNavigation() {
    // Get navigation links
    const notificationsLink = document.querySelector('.main-nav li a i.fa-bell').parentElement;
    const messagesLink = document.querySelector('.main-nav li a i.fa-envelope').parentElement;
    const profileLink = document.querySelector('.main-nav li a i.fa-user').parentElement;
    
    // Add click event listeners
    if (notificationsLink) {
        notificationsLink.addEventListener('click', function(e) {
            e.preventDefault();
            showNotificationsSection();
            return false;
        });
    }
    
    if (messagesLink) {
        messagesLink.addEventListener('click', function(e) {
            e.preventDefault();
            showMessagesSection();
            return false;
        });
    }
    
    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            showProfileSection();
            return false;
        });
    }
}

// Function to show notifications section
function showNotificationsSection() {
    const mainContent = document.querySelector('.main-content');
    const datingSection = document.getElementById('dating-section');
    const notificationsSection = document.getElementById('notifications-section');
    const messagesSection = document.getElementById('messages-section');
    const profileSection = document.getElementById('profile-section');
    
    if (mainContent && notificationsSection) {
        // Hide main content and other sections, show notifications section
        mainContent.style.display = 'none';
        if (datingSection) datingSection.style.display = 'none';
        notificationsSection.style.display = 'block';
        if (messagesSection) messagesSection.style.display = 'none';
        if (profileSection) profileSection.style.display = 'none';
        
        // Update navigation active state
        const navItems = document.querySelectorAll('.main-nav li');
        navItems.forEach(item => item.classList.remove('active'));
        
        const notificationsNavItem = document.querySelector('.main-nav li a i.fa-bell').parentElement.parentElement;
        if (notificationsNavItem) {
            notificationsNavItem.classList.add('active');
        }
        
        // Show toast notification
        showToast('Viewing your notifications');
    } else if (!notificationsSection) {
        // Create notifications section if it doesn't exist
        createNotificationsSection();
        // Try again after creating the section
        setTimeout(showNotificationsSection, 100);
    }
}

// Function to show messages section
function showMessagesSection() {
    const mainContent = document.querySelector('.main-content');
    const datingSection = document.getElementById('dating-section');
    const notificationsSection = document.getElementById('notifications-section');
    const messagesSection = document.getElementById('messages-section');
    const profileSection = document.getElementById('profile-section');
    
    if (mainContent && messagesSection) {
        // Hide main content and other sections, show messages section
        mainContent.style.display = 'none';
        if (datingSection) datingSection.style.display = 'none';
        if (notificationsSection) notificationsSection.style.display = 'none';
        messagesSection.style.display = 'block';
        if (profileSection) profileSection.style.display = 'none';
        
        // Update navigation active state
        const navItems = document.querySelectorAll('.main-nav li');
        navItems.forEach(item => item.classList.remove('active'));
        
        const messagesNavItem = document.querySelector('.main-nav li a i.fa-envelope').parentElement.parentElement;
        if (messagesNavItem) {
            messagesNavItem.classList.add('active');
        }
        
        // Show toast notification
        showToast('Viewing your messages');
    } else if (!messagesSection) {
        // Create messages section if it doesn't exist
        createMessagesSection();
        // Try again after creating the section
        setTimeout(showMessagesSection, 100);
    }
}

// Function to show profile section
function showProfileSection() {
    const mainContent = document.querySelector('.main-content');
    const datingSection = document.getElementById('dating-section');
    const notificationsSection = document.getElementById('notifications-section');
    const messagesSection = document.getElementById('messages-section');
    const profileSection = document.getElementById('profile-section');
    
    if (mainContent && profileSection) {
        // Hide main content and other sections, show profile section
        mainContent.style.display = 'none';
        if (datingSection) datingSection.style.display = 'none';
        if (notificationsSection) notificationsSection.style.display = 'none';
        if (messagesSection) messagesSection.style.display = 'none';
        profileSection.style.display = 'block';
        
        // Update navigation active state
        const navItems = document.querySelectorAll('.main-nav li');
        navItems.forEach(item => item.classList.remove('active'));
        
        const profileNavItem = document.querySelector('.main-nav li a i.fa-user').parentElement.parentElement;
        if (profileNavItem) {
            profileNavItem.classList.add('active');
        }
        
        // Show toast notification
        showToast('Viewing your profile');
    } else if (!profileSection) {
        // Create profile section if it doesn't exist
        createProfileSection();
        // Try again after creating the section
        setTimeout(showProfileSection, 100);
    }
}

// Function to create notifications section
function createNotificationsSection() {
    if (!document.getElementById('notifications-section')) {
        const appContainer = document.querySelector('.app-container');
        
        const notificationsSection = document.createElement('div');
        notificationsSection.id = 'notifications-section';
        notificationsSection.className = 'notifications-container';
        notificationsSection.style.display = 'none';
        
        notificationsSection.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-bell"></i> Notifications</h2>
                <p>Stay updated with what's happening</p>
                <button id="back-from-notifications" class="back-btn" onclick="showMainContent(); return false;">
                    <i class="fas fa-arrow-left"></i> Back to Main
                </button>
            </div>
            
            <div class="notifications-content">
                <div class="notifications-filters">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="mentions">Mentions</button>
                    <button class="filter-btn" data-filter="likes">Likes</button>
                    <button class="filter-btn" data-filter="comments">Comments</button>
                </div>
                
                <div class="notifications-list">
                    <div class="notification-item unread">
                        <img src="https://via.placeholder.com/40" alt="User" class="user-avatar">
                        <div class="notification-content">
                            <p><strong>Emma Watson</strong> liked your photo</p>
                            <span class="notification-time">2 minutes ago</span>
                        </div>
                        <div class="notification-action">
                            <button class="mark-read-btn"><i class="fas fa-check"></i></button>
                        </div>
                    </div>
                    
                    <div class="notification-item unread">
                        <img src="https://via.placeholder.com/40" alt="User" class="user-avatar">
                        <div class="notification-content">
                            <p><strong>Robert Chen</strong> commented on your post: "Amazing shot! What camera did you use?"</p>
                            <span class="notification-time">15 minutes ago</span>
                        </div>
                        <div class="notification-action">
                            <button class="mark-read-btn"><i class="fas fa-check"></i></button>
                        </div>
                    </div>
                    
                    <div class="notification-item">
                        <img src="https://via.placeholder.com/40" alt="User" class="user-avatar">
                        <div class="notification-content">
                            <p><strong>Sarah Chen</strong> mentioned you in a comment</p>
                            <span class="notification-time">1 hour ago</span>
                        </div>
                    </div>
                    
                    <div class="notification-item">
                        <img src="https://via.placeholder.com/40" alt="User" class="user-avatar">
                        <div class="notification-content">
                            <p><strong>Tech Insider</strong> and <strong>5 others</strong> liked your comment</p>
                            <span class="notification-time">3 hours ago</span>
                        </div>
                    </div>
                    
                    <div class="notification-item">
                        <img src="https://via.placeholder.com/40" alt="User" class="user-avatar">
                        <div class="notification-content">
                            <p>You have a new follower: <strong>Mike Wilson</strong></p>
                            <span class="notification-time">Yesterday</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        appContainer.appendChild(notificationsSection);
        
        // Add event listeners for notification filters
        const filterBtns = notificationsSection.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all filter buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                // In a real app, this would filter the notifications
                showToast(`Showing ${this.textContent} notifications`);
            });
        });
        
        // Add event listeners for mark as read buttons
        const markReadBtns = notificationsSection.querySelectorAll('.mark-read-btn');
        markReadBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const notificationItem = this.closest('.notification-item');
                notificationItem.classList.remove('unread');
                this.style.display = 'none';
                showToast('Notification marked as read');
            });
        });
    }
}

// Function to create messages section
function createMessagesSection() {
    if (!document.getElementById('messages-section')) {
        const appContainer = document.querySelector('.app-container');
        
        const messagesSection = document.createElement('div');
        messagesSection.id = 'messages-section';
        messagesSection.className = 'messages-container';
        messagesSection.style.display = 'none';
        
        messagesSection.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-envelope"></i> Messages</h2>
                <p>Connect with your friends and followers</p>
                <button id="back-from-messages" class="back-btn" onclick="showMainContent(); return false;">
                    <i class="fas fa-arrow-left"></i> Back to Main
                </button>
            </div>
            
            <div class="messages-content">
                <div class="messages-sidebar">
                    <div class="messages-search">
                        <input type="text" placeholder="Search messages...">
                        <button><i class="fas fa-search"></i></button>
                    </div>
                    
                    <div class="conversations-list">
                        <div class="conversation-item active">
                            <img src="https://via.placeholder.com/40" alt="User" class="user-avatar">
                            <div class="conversation-info">
                                <h3>Emma Watson</h3>
                                <p>Thanks for the recommendation!</p>
                            </div>
                            <div class="conversation-meta">
                                <span class="time">2m</span>
                                <span class="unread-count">1</span>
                            </div>
                        </div>
                        
                        <div class="conversation-item">
                            <img src="https://via.placeholder.com/40" alt="User" class="user-avatar">
                            <div class="conversation-info">
                                <h3>Robert Chen</h3>
                                <p>Let me know when you're free</p>
                            </div>
                            <div class="conversation-meta">
                                <span class="time">1h</span>
                            </div>
                        </div>
                        
                        <div class="conversation-item">
                            <img src="https://via.placeholder.com/40" alt="User" class="user-avatar">
                            <div class="conversation-info">
                                <h3>Photography Group</h3>
                                <p>Mike: Check out this new lens!</p>
                            </div>
                            <div class="conversation-meta">
                                <span class="time">3h</span>
                            </div>
                        </div>
                        
                        <div class="conversation-item">
                            <img src="https://via.placeholder.com/40" alt="User" class="user-avatar">
                            <div class="conversation-info">
                                <h3>Sarah Chen</h3>
                                <p>The event is on Friday at 7pm</p>
                            </div>
                            <div class="conversation-meta">
                                <span class="time">1d</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="messages-main">
                    <div class="chat-header">
                        <div class="chat-user-info">
                            <img src="https://via.placeholder.com/40" alt="User" class="user-avatar">
                            <div>
                                <h3>Emma Watson</h3>
                                <p>Online now</p>
                            </div>
                        </div>
                        <div class="chat-actions">
                            <button><i class="fas fa-phone"></i></button>
                            <button><i class="fas fa-video"></i></button>
                            <button><i class="fas fa-info-circle"></i></button>
                        </div>
                    </div>
                    
                    <div class="chat-messages">
                        <div class="message-date">Today</div>
                        
                        <div class="message received">
                            <img src="https://via.placeholder.com/30" alt="User" class="user-avatar small">
                            <div class="message-content">
                                <p>Hey! Have you tried that new camera you were talking about?</p>
                                <span class="message-time">10:15 AM</span>
                            </div>
                        </div>
                        
                        <div class="message sent">
                            <div class="message-content">
                                <p>Yes! It's amazing. The image quality is incredible.</p>
                                <span class="message-time">10:17 AM</span>
                            </div>
                        </div>
                        
                        <div class="message sent">
                            <div class="message-content">
                                <p>I'll send you some sample shots later.</p>
                                <span class="message-time">10:18 AM</span>
                            </div>
                        </div>
                        
                        <div class="message received">
                            <img src="https://via.placeholder.com/30" alt="User" class="user-avatar small">
                            <div class="message-content">
                                <p>That would be great! I'm thinking of getting one too.</p>
                                <span class="message-time">10:20 AM</span>
                            </div>
                        </div>
                        
                        <div class="message received">
                            <img src="https://via.placeholder.com/30" alt="User" class="user-avatar small">
                            <div class="message-content">
                                <p>Do you have any recommendations for lenses?</p>
                                <span class="message-time">10:21 AM</span>
                            </div>
                        </div>
                        
                        <div class="message sent">
                            <div class="message-content">
                                <p>Definitely! The 24-70mm f/2.8 is a great all-around lens. Perfect for most situations.</p>
                                <span class="message-time">10:25 AM</span>
                            </div>
                        </div>
                        
                        <div class="message received">
                            <img src="https://via.placeholder.com/30" alt="User" class="user-avatar small">
                            <div class="message-content">
                                <p>Thanks for the recommendation!</p>
                                <span class="message-time">10:30 AM</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chat-input">
                        <button class="attachment-btn"><i class="fas fa-paperclip"></i></button>
                        <input type="text" placeholder="Type a message...">
                        <button class="emoji-btn"><i class="fas fa-smile"></i></button>
                        <button class="send-btn"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
        `;
        
        appContainer.appendChild(messagesSection);
        
        // Add event listeners for conversation items
        const conversationItems = messagesSection.querySelectorAll('.conversation-item');
        conversationItems.forEach(item => {
            item.addEventListener('click', function() {
                // Remove active class from all conversation items
                conversationItems.forEach(i => i.classList.remove('active'));
                // Add active class to clicked item
                this.classList.add('active');
                
                // In a real app, this would load the conversation
                const userName = this.querySelector('h3').textContent;
                const chatHeader = messagesSection.querySelector('.chat-header');
                if (chatHeader) {
                    chatHeader.querySelector('h3').textContent = userName;
                }
                
                showToast(`Conversation with ${userName} loaded`);
            });
        });
        
        // Add event listener for send button
        const sendBtn = messagesSection.querySelector('.send-btn');
        const messageInput = messagesSection.querySelector('.chat-input input');
        
        if (sendBtn && messageInput) {
            sendBtn.addEventListener('click', function() {
                const messageText = messageInput.value.trim();
                if (messageText) {
                    // In a real app, this would send the message to the server
                    const chatMessages = messagesSection.querySelector('.chat-messages');
                    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    const messageElement = document.createElement('div');
                    messageElement.className = 'message sent';
                    messageElement.innerHTML = `
                        <div class="message-content">
                            <p>${messageText}</p>
                            <span class="message-time">${currentTime}</span>
                        </div>
                    `;
                    
                    chatMessages.appendChild(messageElement);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    messageInput.value = '';
                }
            });
            
            // Allow sending message with Enter key
            messageInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendBtn.click();
                }
            });
        }
    }
}

// Function to create profile section
function createProfileSection() {
    if (!document.getElementById('profile-section')) {
        const appContainer = document.querySelector('.app-container');
        
        const profileSection = document.createElement('div');
        profileSection.id = 'profile-section';
        profileSection.className = 'profile-container';
        profileSection.style.display = 'none';
        
        profileSection.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-user"></i> Your Profile</h2>
                <p>Manage your personal information and content</p>
                <button id="back-from-profile" class="back-btn" onclick="showMainContent(); return false;">
                    <i class="fas fa-arrow-left"></i> Back to Main
                </button>
            </div>
            
            <div class="profile-content">
                <div class="profile-header-section">
                    <div class="profile-cover-photo">
                        <img src="https://source.unsplash.com/random/1200x300/?landscape" alt="Cover Photo">
                        <button class="edit-cover-btn"><i class="fas fa-camera"></i> Edit Cover</button>
                    </div>
                    
                    <div class="profile-user-info">
                        <div class="profile-photo-large">
                            <img src="https://via.placeholder.com/150" alt="User Profile">
                            <button class="edit-photo-btn"><i class="fas fa-camera"></i></button>
                        </div>
                        
                        <div class="profile-details">
                            <h1>John Doe</h1>
                            <p class="username">@johndoe</p>
                            <p class="bio">Digital creator | Photography enthusiast | Travel lover</p>
                            
                            <div class="profile-stats-large">
                                <div class="stat">
                                    <span class="count">248</span>
                                    <span class="label">Posts</span>
                                </div>
                                <div class="stat">
                                    <span class="count">12.4K</span>
                                    <span class="label">Followers</span>
                                </div>
                                <div class="stat">
                                    <span class="count">1,024</span>
                                    <span class="label">Following</span>
                                </div>
                            </div>
                            
                            <button class="edit-profile-btn"><i class="fas fa-edit"></i> Edit Profile</button>
                        </div>
                    </div>
                </div>
                
                <div class="profile-tabs">
                    <button class="profile-tab active" data-tab="posts">Posts</button>
                    <button class="profile-tab" data-tab="saved">Saved</button>
                    <button class="profile-tab" data-tab="tagged">Tagged</button>
                </div>
                
                <div class="profile-tab-content active" id="posts-tab">
                    <div class="profile-posts-grid">
                        <div class="profile-post">
                            <img src="https://source.unsplash.com/random/300x300/?camera" alt="Post">
                            <div class="post-overlay">
                                <div class="post-stats">
                                    <span><i class="fas fa-heart"></i> 245</span>
                                    <span><i class="fas fa-comment"></i> 42</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-post">
                            <img src="https://source.unsplash.com/random/300x300/?travel" alt="Post">
                            <div class="post-overlay">
                                <div class="post-stats">
                                    <span><i class="fas fa-heart"></i> 189</span>
                                    <span><i class="fas fa-comment"></i> 23</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-post">
                            <img src="https://source.unsplash.com/random/300x300/?nature" alt="Post">
                            <div class="post-overlay">
                                <div class="post-stats">
                                    <span><i class="fas fa-heart"></i> 321</span>
                                    <span><i class="fas fa-comment"></i> 56</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-post">
                            <img src="https://source.unsplash.com/random/300x300/?city" alt="Post">
                            <div class="post-overlay">
                                <div class="post-stats">
                                    <span><i class="fas fa-heart"></i> 178</span>
                                    <span><i class="fas fa-comment"></i> 19</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-post">
                            <img src="https://source.unsplash.com/random/300x300/?portrait" alt="Post">
                            <div class="post-overlay">
                                <div class="post-stats">
                                    <span><i class="fas fa-heart"></i> 432</span>
                                    <span><i class="fas fa-comment"></i> 67</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-post">
                            <img src="https://source.unsplash.com/random/300x300/?food" alt="Post">
                            <div class="post-overlay">
                                <div class="post-stats">
                                    <span><i class="fas fa-heart"></i> 287</span>
                                    <span><i class="fas fa-comment"></i> 34</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="profile-tab-content" id="saved-tab">
                    <div class="profile-posts-grid">
                        <div class="profile-post">
                            <img src="https://source.unsplash.com/random/300x300/?technology" alt="Saved Post">
                            <div class="post-overlay">
                                <div class="post-stats">
                                    <span><i class="fas fa-heart"></i> 543</span>
                                    <span><i class="fas fa-comment"></i> 87</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-post">
                            <img src="https://source.unsplash.com/random/300x300/?art" alt="Saved Post">
                            <div class="post-overlay">
                                <div class="post-stats">
                                    <span><i class="fas fa-heart"></i> 321</span>
                                    <span><i class="fas fa-comment"></i> 45</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-post">
                            <img src="https://source.unsplash.com/random/300x300/?design" alt="Saved Post">
                            <div class="post-overlay">
                                <div class="post-stats">
                                    <span><i class="fas fa-heart"></i> 267</span>
                                    <span><i class="fas fa-comment"></i> 32</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="profile-tab-content" id="tagged-tab">
                    <div class="profile-posts-grid">
                        <div class="profile-post">
                            <img src="https://source.unsplash.com/random/300x300/?people" alt="Tagged Post">
                            <div class="post-overlay">
                                <div class="post-stats">
                                    <span><i class="fas fa-heart"></i> 198</span>
                                    <span><i class="fas fa-comment"></i> 24</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-post">
                            <img src="https://source.unsplash.com/random/300x300/?event" alt="Tagged Post">
                            <div class="post-overlay">
                                <div class="post-stats">
                                    <span><i class="fas fa-heart"></i> 276</span>
                                    <span><i class="fas fa-comment"></i> 41</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        appContainer.appendChild(profileSection);
        
        // Add event listeners for profile tabs
        const profileTabs = profileSection.querySelectorAll('.profile-tab');
        profileTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                profileTabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Get the tab type from data attribute
                const tabType = this.getAttribute('data-tab');
                
                // Hide all tab contents
                const tabContents = profileSection.querySelectorAll('.profile-tab-content');
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Show the selected tab content
                const selectedContent = profileSection.querySelector(`#${tabType}-tab`);
                if (selectedContent) {
                    selectedContent.classList.add('active');
                }
            });
        });
        
        // Add event listener for edit profile button
        const editProfileBtn = profileSection.querySelector('.edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', function() {
                showToast('Edit profile functionality would open here');
            });
        }
    }
}
