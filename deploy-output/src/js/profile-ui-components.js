/**
 * ConnectHub Profile UI Components
 * Redesigned to match the exact ConnectHub design specifications
 */

class ProfileUIComponents {
    constructor() {
        console.log('Initializing Profile UI Components with ConnectHub Design');
        this.setupDesignStyles();
    }

    setupDesignStyles() {
        // Ensure the exact design styles are available
        if (!document.getElementById('profile-ui-styles')) {
            const style = document.createElement('style');
            style.id = 'profile-ui-styles';
            style.textContent = `
                .profile-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.8);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    backdrop-filter: blur(20px);
                }
                
                .profile-modal.active {
                    display: flex;
                    animation: modalFadeIn 0.3s ease;
                }
                
                .profile-modal-content {
                    background: var(--bg-card);
                    border: 1px solid var(--glass-border);
                    border-radius: 20px;
                    padding: 2rem;
                    max-width: 700px;
                    width: 90%;
                    max-height: 85vh;
                    overflow-y: auto;
                    animation: modalSlideIn 0.3s ease;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                }
                
                @keyframes modalFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes modalSlideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * 1. Advanced Profile Editor Interface - Using exact ConnectHub design
     */
    showAdvancedProfileEditor() {
        const modal = document.createElement('div');
        modal.className = 'profile-modal active';
        modal.innerHTML = `
            <div class="profile-modal-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">✏️ Advanced Profile Editor</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;" onclick="this.closest('.profile-modal').remove()" onmouseover="this.style.background='var(--glass)'" onmouseout="this.style.background='none'">✕</button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 280px; gap: 2rem;">
                    <div>
                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem; margin-bottom: 1.5rem;">
                            <h3 style="margin-bottom: 1rem; color: var(--primary);">Basic Information</h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-primary);">First Name</label>
                                    <input type="text" value="John" placeholder="Your first name" style="width: 100%; padding: 1rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-primary); transition: all 0.3s ease;" onfocus="this.style.borderColor='var(--primary)'; this.style.boxShadow='0 0 20px rgba(79, 70, 229, 0.3)'" onblur="this.style.borderColor='var(--glass-border)'; this.style.boxShadow='none'">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-primary);">Last Name</label>
                                    <input type="text" value="Doe" placeholder="Your last name" style="width: 100%; padding: 1rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-primary); transition: all 0.3s ease;" onfocus="this.style.borderColor='var(--primary)'; this.style.boxShadow='0 0 20px rgba(79, 70, 229, 0.3)'" onblur="this.style.borderColor='var(--glass-border)'; this.style.boxShadow='none'">
                                </div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-primary);">Professional Title</label>
                                <input type="text" value="Software Engineer & Social Media Enthusiast" placeholder="Your professional title" style="width: 100%; padding: 1rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-primary); transition: all 0.3s ease;" onfocus="this.style.borderColor='var(--primary)'; this.style.boxShadow='0 0 20px rgba(79, 70, 229, 0.3)'" onblur="this.style.borderColor='var(--glass-border)'; this.style.boxShadow='none'">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-primary);">Bio</label>
                                <textarea rows="4" placeholder="Tell the world about yourself..." style="width: 100%; padding: 1rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-primary); resize: vertical; transition: all 0.3s ease;" onfocus="this.style.borderColor='var(--primary)'; this.style.boxShadow='0 0 20px rgba(79, 70, 229, 0.3)'" onblur="this.style.borderColor='var(--glass-border)'; this.style.boxShadow='none'">🌟 Digital creator passionate about connecting people through technology. Love hiking, photography, and discovering new music.</textarea>
                            </div>
                        </div>

                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem;">
                            <h3 style="margin-bottom: 1rem; color: var(--primary);">Social Links</h3>
                            <div style="display: grid; gap: 1rem;">
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <div style="width: 40px; height: 40px; background: #1877f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">📘</div>
                                    <input type="url" placeholder="https://facebook.com/username" style="flex: 1; padding: 1rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-primary);">
                                </div>
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <div style="width: 40px; height: 40px; background: #e4405f; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">📷</div>
                                    <input type="url" placeholder="https://instagram.com/username" style="flex: 1; padding: 1rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-primary);">
                                </div>
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <div style="width: 40px; height: 40px; background: #0077b5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">💼</div>
                                    <input type="url" placeholder="https://linkedin.com/in/username" style="flex: 1; padding: 1rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-primary);">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem; text-align: center; margin-bottom: 1.5rem;">
                            <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white;">JD</div>
                            <button class="btn btn-secondary btn-small" style="width: 100%; margin-bottom: 0.5rem;">📷 Change Photo</button>
                            <button class="btn btn-secondary btn-small" style="width: 100%;">🎨 Edit Cover</button>
                        </div>

                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem;">
                            <h4 style="margin-bottom: 1rem;">Profile Stats</h4>
                            <div style="text-align: center; margin-bottom: 1rem;">
                                <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin-bottom: 0.25rem;">1,247</div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem;">Followers</div>
                            </div>
                            <div style="text-align: center; margin-bottom: 1rem;">
                                <div style="font-size: 1.5rem; font-weight: 700; color: var(--secondary); margin-bottom: 0.25rem;">892</div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem;">Following</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent); margin-bottom: 0.25rem;">156</div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem;">Posts</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                    <button class="btn btn-secondary" onclick="this.closest('.profile-modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="if(window.showToast) window.showToast('Profile updated successfully!', 'success'); this.closest('.profile-modal').remove();">Save Changes</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * 2. Photo Editor & Filters Interface - Using exact ConnectHub design
     */
    showPhotoEditor() {
        const modal = document.createElement('div');
        modal.className = 'profile-modal active';
        modal.innerHTML = `
            <div class="profile-modal-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">📷 Photo Editor & Filters</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;" onclick="this.closest('.profile-modal').remove()" onmouseover="this.style.background='var(--glass)'" onmouseout="this.style.background='none'">✕</button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 300px; gap: 2rem;">
                    <div>
                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem; margin-bottom: 1.5rem;">
                            <div style="width: 100%; height: 300px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 4rem; color: white; margin-bottom: 1rem;">📷</div>
                            
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
                                <button class="btn btn-secondary" onclick="if(window.showToast) window.showToast('Camera opened', 'info');">📱 Camera</button>
                                <button class="btn btn-secondary" onclick="if(window.showToast) window.showToast('Gallery opened', 'info');">🖼️ Gallery</button>
                                <button class="btn btn-secondary" onclick="if(window.showToast) window.showToast('Browse files', 'info');">📁 Browse</button>
                            </div>
                        </div>

                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem;">
                            <h3 style="margin-bottom: 1rem; color: var(--primary);">Filters & Effects</h3>
                            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.5rem; margin-bottom: 2rem;">
                                <button class="btn btn-secondary btn-small" style="border: 2px solid var(--primary);">Original</button>
                                <button class="btn btn-secondary btn-small">Vintage</button>
                                <button class="btn btn-secondary btn-small">B&W</button>
                                <button class="btn btn-secondary btn-small">Warm</button>
                                <button class="btn btn-secondary btn-small">Cool</button>
                                <button class="btn btn-secondary btn-small">Sepia</button>
                            </div>
                            
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Brightness</label>
                                <input type="range" style="width: 100%; height: 6px; background: var(--glass); border-radius: 3px;" min="-50" max="50" value="0">
                            </div>
                            
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Contrast</label>
                                <input type="range" style="width: 100%; height: 6px; background: var(--glass); border-radius: 3px;" min="-50" max="50" value="0">
                            </div>
                            
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Saturation</label>
                                <input type="range" style="width: 100%; height: 6px; background: var(--glass); border-radius: 3px;" min="-50" max="50" value="0">
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem; margin-bottom: 1rem;">
                            <h4 style="margin-bottom: 1rem;">Quick Actions</h4>
                            <button class="btn btn-secondary btn-small" style="width: 100%; margin-bottom: 0.5rem;">↶ Rotate Left</button>
                            <button class="btn btn-secondary btn-small" style="width: 100%; margin-bottom: 0.5rem;">↷ Rotate Right</button>
                            <button class="btn btn-secondary btn-small" style="width: 100%; margin-bottom: 0.5rem;">✂️ Crop</button>
                            <button class="btn btn-secondary btn-small" style="width: 100%;">🔄 Reset</button>
                        </div>
                        
                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem;">
                            <h4 style="margin-bottom: 1rem;">Templates</h4>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                                <div style="aspect-ratio: 1; background: var(--primary); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8rem;">Professional</div>
                                <div style="aspect-ratio: 1; background: var(--secondary); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8rem;">Creative</div>
                                <div style="aspect-ratio: 1; background: var(--accent); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8rem;">Minimal</div>
                                <div style="aspect-ratio: 1; background: var(--warning); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8rem;">Artistic</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                    <button class="btn btn-secondary" onclick="this.closest('.profile-modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="if(window.showToast) window.showToast('Photo saved successfully!', 'success'); this.closest('.profile-modal').remove();">Save Photo</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * 3. Privacy Control Panel Interface - Using exact ConnectHub design
     */
    showPrivacyControlPanel() {
        const modal = document.createElement('div');
        modal.className = 'profile-modal active';
        modal.innerHTML = `
            <div class="profile-modal-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🔒 Privacy Control Panel</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;" onclick="this.closest('.profile-modal').remove()" onmouseover="this.style.background='var(--glass)'" onmouseout="this.style.background='none'">✕</button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem;">
                    <div class="card">
                        <h3 style="margin-bottom: 1rem; color: var(--primary);">👁️ Profile Visibility</h3>
                        <div style="margin-top: 1rem;">
                            <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; cursor: pointer;">
                                <span style="color: var(--text-primary);">🌍 Public Profile</span>
                                <input type="checkbox" checked style="accent-color: var(--primary);">
                            </label>
                            <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; cursor: pointer;">
                                <span style="color: var(--text-primary);">🟢 Show Online Status</span>
                                <input type="checkbox" checked style="accent-color: var(--primary);">
                            </label>
                            <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; cursor: pointer;">
                                <span style="color: var(--text-primary);">📊 Show Activity Status</span>
                                <input type="checkbox" style="accent-color: var(--primary);">
                            </label>
                            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                                <span style="color: var(--text-primary);">📍 Show Location</span>
                                <input type="checkbox" style="accent-color: var(--primary);">
                            </label>
                        </div>
                    </div>

                    <div class="card">
                        <h3 style="margin-bottom: 1rem; color: var(--primary);">💬 Communication</h3>
                        <div style="margin-top: 1rem;">
                            <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; cursor: pointer;">
                                <span style="color: var(--text-primary);">✉️ Allow Messages from Anyone</span>
                                <input type="checkbox" style="accent-color: var(--primary);">
                            </label>
                            <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; cursor: pointer;">
                                <span style="color: var(--text-primary);">🔍 Show in Search Results</span>
                                <input type="checkbox" checked style="accent-color: var(--primary);">
                            </label>
                            <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; cursor: pointer;">
                                <span style="color: var(--text-primary);">👥 Allow Friend Suggestions</span>
                                <input type="checkbox" checked style="accent-color: var(--primary);">
                            </label>
                            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                                <span style="color: var(--text-primary);">📞 Allow Video Calls</span>
                                <input type="checkbox" checked style="accent-color: var(--primary);">
                            </label>
                        </div>
                    </div>

                    <div class="card">
                        <h3 style="margin-bottom: 1rem; color: var(--primary);">📊 Data & Analytics</h3>
                        <div style="margin-top: 1rem;">
                            <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; cursor: pointer;">
                                <span style="color: var(--text-primary);">📈 Analytics Tracking</span>
                                <input type="checkbox" checked style="accent-color: var(--primary);">
                            </label>
                            <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; cursor: pointer;">
                                <span style="color: var(--text-primary);">🎯 Personalized Recommendations</span>
                                <input type="checkbox" checked style="accent-color: var(--primary);">
                            </label>
                            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                                <span style="color: var(--text-primary);">🤝 Share with Partners</span>
                                <input type="checkbox" style="accent-color: var(--primary);">
                            </label>
                        </div>
                    </div>

                    <div class="card">
                        <h3 style="margin-bottom: 1rem; color: var(--primary);">🚫 Blocked Users</h3>
                        <div style="margin-top: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                <span style="color: var(--text-primary);">Blocked Users</span>
                                <span style="color: var(--text-secondary);">3</span>
                            </div>
                            <button class="btn btn-secondary btn-small" style="width: 100%; margin-bottom: 0.5rem;">👥 Manage Blocked Users</button>
                            <button class="btn btn-secondary btn-small" style="width: 100%;">🛡️ Advanced Blocking</button>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                    <button class="btn btn-secondary" onclick="this.closest('.profile-modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="if(window.showToast) window.showToast('Privacy settings updated!', 'success'); this.closest('.profile-modal').remove();">Save Settings</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * 4. Achievements Gallery Interface - Using exact ConnectHub design
     */
    showAchievementsGallery() {
        const modal = document.createElement('div');
        modal.className = 'profile-modal active';
        modal.innerHTML = `
            <div class="profile-modal-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🏆 Achievements Gallery</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;" onclick="this.closest('.profile-modal').remove()" onmouseover="this.style.background='var(--glass)'" onmouseout="this.style.background='none'">✕</button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                    <div style="text-align: center; background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin-bottom: 0.25rem;">24</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Total Achievements</div>
                    </div>
                    <div style="text-align: center; background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--secondary); margin-bottom: 0.25rem;">68%</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Completion Rate</div>
                    </div>
                    <div style="text-align: center; background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent); margin-bottom: 0.25rem;">Creator</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Latest Badge</div>
                    </div>
                </div>

                <div style="display: flex; gap: 0.5rem; margin-bottom: 2rem; background: var(--glass); padding: 0.5rem; border-radius: 12px;">
                    <button class="btn btn-secondary btn-small" style="border: 2px solid var(--primary);">🏆 All</button>
                    <button class="btn btn-secondary btn-small">📱 Social</button>
                    <button class="btn btn-secondary btn-small">💡 Creative</button>
                    <button class="btn btn-secondary btn-small">🎯 Engagement</button>
                    <button class="btn btn-secondary btn-small">⭐ Special</button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; max-height: 400px; overflow-y: auto;">
                    <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1rem; text-align: center; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 30px rgba(79, 70, 229, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🥇</div>
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">First Post</div>
                        <div style="color: var(--text-secondary); font-size: 0.8rem;">Share your first moment</div>
                    </div>
                    <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1rem; text-align: center; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 30px rgba(236, 72, 153, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💬</div>
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">Social Butterfly</div>
                        <div style="color: var(--text-secondary); font-size: 0.8rem;">100+ connections made</div>
                    </div>
                    <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1rem; text-align: center; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 30px rgba(79, 70, 229, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📸</div>
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">Content Creator</div>
                        <div style="color: var(--text-secondary); font-size: 0.8rem;">50+ posts shared</div>
                    </div>
                    <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1rem; text-align: center; cursor: pointer; transition: all 0.3s ease; opacity: 0.5;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 30px rgba(156, 163, 175, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎉</div>
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">Party Host</div>
                        <div style="color: var(--text-secondary); font-size: 0.8rem;">Host 10 events</div>
                    </div>
                    <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1rem; text-align: center; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 30px rgba(79, 70, 229, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">❤️</div>
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">Love Spreader</div>
                        <div style="color: var(--text-secondary); font-size: 0.8rem;">1000+ likes given</div>
                    </div>
                    <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1rem; text-align: center; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 30px rgba(236, 72, 153, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚡</div>
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">Early Bird</div>
                        <div style="color: var(--text-secondary); font-size: 0.8rem;">Beta tester</div>
                    </div>
                    <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1rem; text-align: center; cursor: pointer; transition: all 0.3s ease; opacity: 0.5;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 30px rgba(156, 163, 175, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🌟</div>
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">Influencer</div>
                        <div style="color: var(--text-secondary); font-size: 0.8rem;">10K+ followers</div>
                    </div>
                    <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1rem; text-align: center; cursor: pointer; transition: all 0.3s ease; opacity: 0.5;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 30px rgba(156, 163, 175, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">👑</div>
                        <div style="font-weight: 600; margin-bottom: 0.25rem;">VIP Member</div>
                        <div style="color: var(--text-secondary); font-size: 0.8rem;">Premium subscriber</div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                    <button class="btn btn-secondary" onclick="this.closest('.profile-modal').remove()">Close</button>
                    <button class="btn btn-primary" onclick="if(window.showToast) window.showToast('Achievement shared!', 'success');">Share Achievement</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * 5. Profile Photo Upload Interface - Using exact ConnectHub design
     */
    showProfilePhotoUpload() {
        const modal = document.createElement('div');
        modal.className = 'profile-modal active';
        modal.innerHTML = `
            <div class="profile-modal-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">📷 Profile Photo Upload</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;" onclick="this.closest('.profile-modal').remove()" onmouseover="this.style.background='var(--glass)'" onmouseout="this.style.background='none'">✕</button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 300px; gap: 2rem;">
                    <div>
                        <div style="background: var(--bg-card); border: 2px dashed var(--glass-border); border-radius: 20px; padding: 3rem; text-align: center; margin-bottom: 2rem; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.borderColor='var(--primary)'; this.style.background='var(--glass)'" onmouseout="this.style.borderColor='var(--glass-border)'; this.style.background='var(--bg-card)'">
                            <div style="font-size: 4rem; margin-bottom: 1rem; color: var(--text-secondary);">📷</div>
                            <h3 style="margin-bottom: 0.5rem; color: var(--primary);">Drop your photo here</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 1rem;">or click to browse files</p>
                            <p style="color: var(--text-secondary); font-size: 0.9rem;">Supports JPG, PNG, GIF up to 10MB</p>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                            <button class="btn btn-secondary" style="display: flex; align-items: center; gap: 0.5rem;" onclick="if(window.showToast) window.showToast('Camera opened', 'info');">
                                <span>📱</span>
                                <span>Take Photo</span>
                            </button>
                            <button class="btn btn-secondary" style="display: flex; align-items: center; gap: 0.5rem;" onclick="if(window.showToast) window.showToast('Gallery opened', 'info');">
                                <span>🖼️</span>
                                <span>From Gallery</span>
                            </button>
                            <button class="btn btn-secondary" style="display: flex; align-items: center; gap: 0.5rem;" onclick="if(window.showToast) window.showToast('Files browsed', 'info');">
                                <span>📁</span>
                                <span>Browse Files</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem; margin-bottom: 1rem;">
                            <h4 style="margin-bottom: 1rem; color: var(--primary);">Current Photo</h4>
                            <div style="width: 150px; height: 150px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white; margin-bottom: 1rem;">JD</div>
                            <button class="btn btn-secondary btn-small" style="width: 100%;">🗑️ Remove Photo</button>
                        </div>

                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem;">
                            <h4 style="margin-bottom: 1rem; color: var(--primary);">Quick Options</h4>
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Crop Style</label>
                                <select style="width: 100%; padding: 0.75rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-primary);">
                                    <option>Square (1:1)</option>
                                    <option>Circle</option>
                                    <option>Original</option>
                                </select>
                            </div>
                            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                                <span style="color: var(--text-primary);">Auto-enhance</span>
                                <input type="checkbox" checked style="accent-color: var(--primary);">
                            </label>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                    <button class="btn btn-secondary" onclick="this.closest('.profile-modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="if(window.showToast) window.showToast('Profile photo updated!', 'success'); this.closest('.profile-modal').remove();">Save Photo</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * 6. Cover Photo Editor Interface - Using exact ConnectHub design
     */
    showCoverPhotoEditor() {
        const modal = document.createElement('div');
        modal.className = 'profile-modal active';
        modal.innerHTML = `
            <div class="profile-modal-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🎨 Cover Photo Editor</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;" onclick="this.closest('.profile-modal').remove()" onmouseover="this.style.background='var(--glass)'" onmouseout="this.style.background='none'">✕</button>
                </div>

                <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem; margin-bottom: 2rem;">
                    <div style="width: 100%; height: 200px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white; margin-bottom: 2rem; position: relative;">
                        🌄 Cover Photo Preview
                        <div style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.6); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: white; cursor: pointer;">✏️</div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                        <button class="btn btn-secondary" onclick="if(window.showToast) window.showToast('Camera opened', 'info');">📱 Camera</button>
                        <button class="btn btn-secondary" onclick="if(window.showToast) window.showToast('Gallery opened', 'info');">🖼️ Gallery</button>
                        <button class="btn btn-secondary" onclick="if(window.showToast) window.showToast('Templates shown', 'info');">🎨 Templates</button>
                        <button class="btn btn-secondary" onclick="if(window.showToast) window.showToast('Files browsed', 'info');">📁 Browse</button>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem;">
                        <div>
                            <h4 style="margin-bottom: 1rem; color: var(--primary);">Filters</h4>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                                <button class="btn btn-secondary btn-small" style="border: 2px solid var(--primary);">Original</button>
                                <button class="btn btn-secondary btn-small">Vibrant</button>
                                <button class="btn btn-secondary btn-small">Classic</button>
                                <button class="btn btn-secondary btn-small">Dramatic</button>
                                <button class="btn btn-secondary btn-small">Soft</button>
                                <button class="btn btn-secondary btn-small">Bold</button>
                            </div>
                        </div>

                        <div>
                            <h4 style="margin-bottom: 1rem; color: var(--primary);">Adjustments</h4>
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Brightness</label>
                                <input type="range" style="width: 100%; height: 6px; background: var(--glass); border-radius: 3px;" min="-50" max="50" value="0">
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Contrast</label>
                                <input type="range" style="width: 100%; height: 6px; background: var(--glass); border-radius: 3px;" min="-50" max="50" value="0">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Saturation</label>
                                <input type="range" style="width: 100%; height: 6px; background: var(--glass); border-radius: 3px;" min="-50" max="50" value="0">
                            </div>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                    <button class="btn btn-secondary" onclick="this.closest('.profile-modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="if(window.showToast) window.showToast('Cover photo updated!', 'success'); this.closest('.profile-modal').remove();">Save Cover Photo</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * 7. Bio Editor Interface - Using exact ConnectHub design
     */
    showBioEditor() {
        const modal = document.createElement('div');
        modal.className = 'profile-modal active';
        modal.innerHTML = `
            <div class="profile-modal-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">✍️ Bio Editor Interface</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;" onclick="this.closest('.profile-modal').remove()" onmouseover="this.style.background='var(--glass)'" onmouseout="this.style.background='none'">✕</button>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                    <div>
                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem; margin-bottom: 1.5rem;">
                            <h3 style="margin-bottom: 1rem; color: var(--primary);">About Me</h3>
                            <textarea rows="8" placeholder="Tell the world about yourself..." style="width: 100%; padding: 1rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-primary); resize: vertical; transition: all 0.3s ease; font-family: inherit;" onfocus="this.style.borderColor='var(--primary)'; this.style.boxShadow='0 0 20px rgba(79, 70, 229, 0.3)'" onblur="this.style.borderColor='var(--glass-border)'; this.style.boxShadow='none'">🌟 Digital creator passionate about connecting people through technology. Love hiking, photography, and discovering new music. Currently exploring AI and machine learning while building meaningful connections in the tech community.</textarea>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                                <span>Character Count: 247/500</span>
                                <span>✅ Professional tone detected</span>
                            </div>
                        </div>

                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem;">
                            <h3 style="margin-bottom: 1rem; color: var(--primary);">Interests & Hobbies</h3>
                            <div style="margin-bottom: 1rem;">
                                <input type="text" placeholder="Add interests (e.g., Photography, Travel, Music)" style="width: 100%; padding: 1rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-primary); transition: all 0.3s ease;" onfocus="this.style.borderColor='var(--primary)'; this.style.boxShadow='0 0 20px rgba(79, 70, 229, 0.3)'" onblur="this.style.borderColor='var(--glass-border)'; this.style.boxShadow='none'">
                            </div>
                            <div style="display: flex; flex-wrap: gap; gap: 0.5rem;">
                                <span style="background: var(--primary); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">📷 Photography <span style="cursor: pointer;">✕</span></span>
                                <span style="background: var(--secondary); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">🎵 Music <span style="cursor: pointer;">✕</span></span>
                                <span style="background: var(--accent); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">⛰️ Hiking <span style="cursor: pointer;">✕</span></span>
                                <span style="background: var(--success); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">💻 Tech <span style="cursor: pointer;">✕</span></span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem; margin-bottom: 1rem;">
                            <h4 style="margin-bottom: 1rem; color: var(--primary);">Bio Templates</h4>
                            <button class="btn btn-secondary btn-small" style="width: 100%; margin-bottom: 0.5rem; text-align: left;">💼 Professional</button>
                            <button class="btn btn-secondary btn-small" style="width: 100%; margin-bottom: 0.5rem; text-align: left;">🎨 Creative</button>
                            <button class="btn btn-secondary btn-small" style="width: 100%; margin-bottom: 0.5rem; text-align: left;">😊 Casual</button>
                            <button class="btn btn-secondary btn-small" style="width: 100%; text-align: left;">🌟 Inspirational</button>
                        </div>

                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem; margin-bottom: 1rem;">
                            <h4 style="margin-bottom: 1rem; color: var(--primary);">AI Suggestions</h4>
                            <div style="background: var(--glass); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; font-size: 0.9rem; color: var(--text-primary);">
                                "Consider mentioning your specific tech interests to attract like-minded connections."
                            </div>
                            <button class="btn btn-secondary btn-small" style="width: 100%;">✨ Get More Suggestions</button>
                        </div>

                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem;">
                            <h4 style="margin-bottom: 1rem; color: var(--primary);">Privacy</h4>
                            <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; cursor: pointer;">
                                <span style="color: var(--text-primary); font-size: 0.9rem;">Show to everyone</span>
                                <input type="radio" name="bio-privacy" checked style="accent-color: var(--primary);">
                            </label>
                            <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; cursor: pointer;">
                                <span style="color: var(--text-primary); font-size: 0.9rem;">Connections only</span>
                                <input type="radio" name="bio-privacy" style="accent-color: var(--primary);">
                            </label>
                            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                                <span style="color: var(--text-primary); font-size: 0.9rem;">Private</span>
                                <input type="radio" name="bio-privacy" style="accent-color: var(--primary);">
                            </label>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                    <button class="btn btn-secondary" onclick="this.closest('.profile-modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="if(window.showToast) window.showToast('Bio updated successfully!', 'success'); this.closest('.profile-modal').remove();">Save Bio</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * 8. Activity Timeline Interface - Using exact ConnectHub design
     */
    showActivityTimeline() {
        const modal = document.createElement('div');
        modal.className = 'profile-modal active';
        modal.innerHTML = `
            <div class="profile-modal-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">📊 Activity Timeline</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;" onclick="this.closest('.profile-modal').remove()" onmouseover="this.style.background='var(--glass)'" onmouseout="this.style.background='none'">✕</button>
                </div>

                <div style="display: grid; grid-template-columns: 250px 1fr; gap: 2rem;">
                    <div>
                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem; margin-bottom: 1rem;">
                            <h4 style="margin-bottom: 1rem; color: var(--primary);">Filter Timeline</h4>
                            <div style="margin-bottom: 1rem;">
                                <select style="width: 100%; padding: 0.75rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-primary);">
                                    <option>All Activity</option>
                                    <option>Posts</option>
                                    <option>Comments</option>
                                    <option>Likes</option>
                                    <option>Connections</option>
                                    <option>Events</option>
                                </select>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <select style="width: 100%; padding: 0.75rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-primary);">
                                    <option>This Month</option>
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                    <option>Last 6 Months</option>
                                    <option>This Year</option>
                                    <option>All Time</option>
                                </select>
                            </div>
                        </div>

                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem;">
                            <h4 style="margin-bottom: 1rem; color: var(--primary);">Quick Stats</h4>
                            <div style="text-align: center; margin-bottom: 1rem;">
                                <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary);">47</div>
                                <div style="color: var(--text-secondary); font-size: 0.8rem;">Posts This Month</div>
                            </div>
                            <div style="text-align: center; margin-bottom: 1rem;">
                                <div style="font-size: 1.2rem; font-weight: 700; color: var(--secondary);">156</div>
                                <div style="color: var(--text-secondary); font-size: 0.8rem;">Interactions</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 1.2rem; font-weight: 700; color: var(--accent);">23</div>
                                <div style="color: var(--text-secondary); font-size: 0.8rem;">New Connections</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style="max-height: 500px; overflow-y: auto;">
                            <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem;">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">📝</div>
                                <div style="flex: 1;">
                                    <div style="background: var(--glass); border-radius: 12px; padding: 1rem;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                            <strong style="color: var(--primary);">Posted a new photo</strong>
                                            <span style="color: var(--text-secondary); font-size: 0.8rem;">2 hours ago</span>
                                        </div>
                                        <p style="color: var(--text-primary); margin-bottom: 0.5rem;">"Beautiful sunset from today's hike! 🌅"</p>
                                        <div style="display: flex; gap: 1rem; font-size: 0.8rem; color: var(--text-secondary);">
                                            <span>❤️ 24 likes</span>
                                            <span>💬 5 comments</span>
                                            <span>🔄 3 shares</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem;">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--secondary); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">👥</div>
                                <div style="flex: 1;">
                                    <div style="background: var(--glass); border-radius: 12px; padding: 1rem;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                            <strong style="color: var(--secondary);">Connected with @sarah_tech</strong>
                                            <span style="color: var(--text-secondary); font-size: 0.8rem;">5 hours ago</span>
                                        </div>
                                        <p style="color: var(--text-primary);">Started following each other after meeting at Tech Summit 2024</p>
                                    </div>
                                </div>
                            </div>

                            <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem;">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">🎉</div>
                                <div style="flex: 1;">
                                    <div style="background: var(--glass); border-radius: 12px; padding: 1rem;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                            <strong style="color: var(--accent);">Earned "Content Creator" badge</strong>
                                            <span style="color: var(--text-secondary); font-size: 0.8rem;">1 day ago</span>
                                        </div>
                                        <p style="color: var(--text-primary);">Achieved 50+ posts milestone! Keep creating amazing content.</p>
                                    </div>
                                </div>
                            </div>

                            <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem;">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--warning); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">💬</div>
                                <div style="flex: 1;">
                                    <div style="background: var(--glass); border-radius: 12px; padding: 1rem;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                            <strong style="color: var(--warning);">Commented on @mike_dev's post</strong>
                                            <span style="color: var(--text-secondary); font-size: 0.8rem;">3 days ago</span>
                                        </div>
                                        <p style="color: var(--text-primary);">"Great insights on React performance optimization!"</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button class="btn btn-secondary" style="width: 100%; margin-top: 1rem;">📥 Load More Activity</button>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                    <button class="btn btn-secondary" onclick="this.closest('.profile-modal').remove()">Close</button>
                    <button class="btn btn-primary" onclick="if(window.showToast) window.showToast('Activity timeline exported!', 'success');">📊 Export Timeline</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * 9. Photo Gallery Grid Interface - Using exact ConnectHub design
     */
    showPhotoGalleryGrid() {
        const modal = document.createElement('div');
        modal.className = 'profile-modal active';
        modal.innerHTML = `
            <div class="profile-modal-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🖼️ Photo Gallery Grid</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;" onclick="this.closest('.profile-modal').remove()" onmouseover="this.style.background='var(--glass)'" onmouseout="this.style.background='none'">✕</button>
                </div>

                <div style="display: flex; gap: 1rem; margin-bottom: 2rem; background: var(--glass); padding: 0.5rem; border-radius: 12px;">
                    <button class="btn btn-secondary btn-small" style="border: 2px solid var(--primary);">🖼️ All Photos</button>
                    <button class="btn btn-secondary btn-small">📱 Posts</button>
                    <button class="btn btn-secondary btn-small">📷 Profile Photos</button>
                    <button class="btn btn-secondary btn-small">🎨 Cover Photos</button>
                    <button class="btn btn-secondary btn-small">⭐ Favorites</button>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span style="color: var(--text-secondary);">Sort by:</span>
                        <select style="padding: 0.5rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-primary);">
                            <option>Latest</option>
                            <option>Most Liked</option>
                            <option>Oldest</option>
                            <option>Random</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary btn-small">⬜ Grid</button>
                        <button class="btn btn-secondary btn-small">📋 List</button>
                        <button class="btn btn-secondary btn-small">🔍 Search</button>
                        <button class="btn btn-secondary btn-small">➕ Upload</button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; max-height: 400px; overflow-y: auto;">
                    <div style="aspect-ratio: 1; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; transition: all 0.3s ease; position: relative;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        📷
                        <div style="position: absolute; bottom: 5px; right: 5px; background: rgba(0,0,0,0.6); border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem;">❤️</div>
                    </div>
                    <div style="aspect-ratio: 1; background: linear-gradient(45deg, var(--secondary) 0%, var(--accent) 100%); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; transition: all 0.3s ease; position: relative;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        🌅
                        <div style="position: absolute; bottom: 5px; right: 5px; background: rgba(0,0,0,0.6); border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem;">💬</div>
                    </div>
                    <div style="aspect-ratio: 1; background: linear-gradient(225deg, var(--accent) 0%, var(--primary) 100%); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        🏔️
                    </div>
                    <div style="aspect-ratio: 1; background: linear-gradient(315deg, var(--warning) 0%, var(--secondary) 100%); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        🎵
                    </div>
                    <div style="aspect-ratio: 1; background: linear-gradient(135deg, var(--success) 0%, var(--primary) 100%); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        🍕
                    </div>
                    <div style="aspect-ratio: 1; background: linear-gradient(45deg, var(--primary) 0%, var(--warning) 100%); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        🚗
                    </div>
                    <div style="aspect-ratio: 1; background: linear-gradient(225deg, var(--secondary) 0%, var(--success) 100%); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        🎮
                    </div>
                    <div style="aspect-ratio: 1; background: linear-gradient(315deg, var(--accent) 0%, var(--primary) 100%); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        📚
                    </div>
                </div>

                <div style="background: var(--glass); border-radius: 12px; padding: 1rem; margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--text-primary);">156 photos • 24 albums • 47 tagged photos</span>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-secondary btn-small">📤 Share Album</button>
                            <button class="btn btn-secondary btn-small">📥 Download All</button>
                            <button class="btn btn-secondary btn-small">🗂️ Organize</button>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                    <button class="btn btn-secondary" onclick="this.closest('.profile-modal').remove()">Close</button>
                    <button class="btn btn-primary" onclick="if(window.showToast) window.showToast('Gallery updated!', 'success');">📤 Share Gallery</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * 10. Profile Analytics Interface - Using exact ConnectHub design
     */
    showProfileAnalytics() {
        const modal = document.createElement('div');
        modal.className = 'profile-modal active';
        modal.innerHTML = `
            <div class="profile-modal-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">📊 Profile Analytics</h2>
                    <button style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;" onclick="this.closest('.profile-modal').remove()" onmouseover="this.style.background='var(--glass)'" onmouseout="this.style.background='none'">✕</button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                    <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1.5rem; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">👁️</div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin-bottom: 0.25rem;">2,847</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Profile Views</div>
                        <div style="color: var(--success); font-size: 0.8rem; margin-top: 0.25rem;">+12% this week</div>
                    </div>
                    <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1.5rem; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📈</div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--secondary); margin-bottom: 0.25rem;">89%</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Engagement Rate</div>
                        <div style="color: var(--success); font-size: 0.8rem; margin-top: 0.25rem;">+5% this week</div>
                    </div>
                    <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1.5rem; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🌍</div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent); margin-bottom: 0.25rem;">47</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Countries Reached</div>
                        <div style="color: var(--warning); font-size: 0.8rem; margin-top: 0.25rem;">+2 new countries</div>
                    </div>
                    <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1.5rem; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏱️</div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--warning); margin-bottom: 0.25rem;">3.2m</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Avg. Time Spent</div>
                        <div style="color: var(--success); font-size: 0.8rem; margin-top: 0.25rem;">+15s this week</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                    <div>
                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem; margin-bottom: 1.5rem;">
                            <h3 style="margin-bottom: 1rem; color: var(--primary);">Profile Views Over Time</h3>
                            <div style="height: 200px; background: var(--glass); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
                                <div style="text-align: center; color: var(--text-secondary);">
                                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
                                    <div>Interactive Chart Placeholder</div>
                                    <div style="font-size: 0.8rem; margin-top: 0.5rem;">Showing profile views trend</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 2rem; text-align: center;">
                                <div>
                                    <div style="font-weight: 700; color: var(--primary);">24%</div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary);">Increase</div>
                                </div>
                                <div>
                                    <div style="font-weight: 700; color: var(--secondary);">156</div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary);">Peak Day</div>
                                </div>
                                <div>
                                    <div style="font-weight: 700; color: var(--accent);">4.2K</div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary);">Monthly Total</div>
                                </div>
                            </div>
                        </div>

                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem;">
                            <h3 style="margin-bottom: 1rem; color: var(--primary);">Top Content Performance</h3>
                            <div style="display: grid; gap: 1rem;">
                                <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--glass); border-radius: 8px;">
                                    <div style="width: 40px; height: 40px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">📷</div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; margin-bottom: 0.25rem;">Sunset Photography Post</div>
                                        <div style="font-size: 0.8rem; color: var(--text-secondary);">847 views • 156 interactions</div>
                                    </div>
                                    <div style="color: var(--primary); font-weight: 700;">+24%</div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--glass); border-radius: 8px;">
                                    <div style="width: 40px; height: 40px; background: var(--secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">💡</div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; margin-bottom: 0.25rem;">Tech Tips Article</div>
                                        <div style="font-size: 0.8rem; color: var(--text-secondary);">623 views • 89 interactions</div>
                                    </div>
                                    <div style="color: var(--secondary); font-weight: 700;">+18%</div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--glass); border-radius: 8px;">
                                    <div style="width: 40px; height: 40px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">🎵</div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; margin-bottom: 0.25rem;">Music Recommendation</div>
                                        <div style="font-size: 0.8rem; color: var(--text-secondary);">412 views • 67 interactions</div>
                                    </div>
                                    <div style="color: var(--accent); font-weight: 700;">+12%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem; margin-bottom: 1rem;">
                            <h4 style="margin-bottom: 1rem; color: var(--primary);">Audience Demographics</h4>
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <span style="color: var(--text-primary); font-size: 0.9rem;">18-24</span>
                                    <span style="color: var(--text-secondary); font-size: 0.9rem;">35%</span>
                                </div>
                                <div style="width: 100%; height: 6px; background: var(--glass); border-radius: 3px;">
                                    <div style="width: 35%; height: 100%; background: var(--primary); border-radius: 3px;"></div>
                                </div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <span style="color: var(--text-primary); font-size: 0.9rem;">25-34</span>
                                    <span style="color: var(--text-secondary); font-size: 0.9rem;">42%</span>
                                </div>
                                <div style="width: 100%; height: 6px; background: var(--glass); border-radius: 3px;">
                                    <div style="width: 42%; height: 100%; background: var(--secondary); border-radius: 3px;"></div>
                                </div>
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <span style="color: var(--text-primary); font-size: 0.9rem;">35-44</span>
                                    <span style="color: var(--text-secondary); font-size: 0.9rem;">18%</span>
                                </div>
                                <div style="width: 100%; height: 6px; background: var(--glass); border-radius: 3px;">
                                    <div style="width: 18%; height: 100%; background: var(--accent); border-radius: 3px;"></div>
                                </div>
                            </div>
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <span style="color: var(--text-primary); font-size: 0.9rem;">45+</span>
                                    <span style="color: var(--text-secondary); font-size: 0.9rem;">5%</span>
                                </div>
                                <div style="width: 100%; height: 6px; background: var(--glass); border-radius: 3px;">
                                    <div style="width: 5%; height: 100%; background: var(--warning); border-radius: 3px;"></div>
                                </div>
                            </div>
                        </div>

                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem; margin-bottom: 1rem;">
                            <h4 style="margin-bottom: 1rem; color: var(--primary);">Top Locations</h4>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="color: var(--text-primary);">🇺🇸 United States</span>
                                <span style="color: var(--text-secondary);">34%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="color: var(--text-primary);">🇬🇧 United Kingdom</span>
                                <span style="color: var(--text-secondary);">18%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="color: var(--text-primary);">🇨🇦 Canada</span>
                                <span style="color: var(--text-secondary);">12%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: var(--text-primary);">🇦🇺 Australia</span>
                                <span style="color: var(--text-secondary);">9%</span>
                            </div>
                        </div>

                        <div style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem;">
                            <h4 style="margin-bottom: 1rem; color: var(--primary);">Export Options</h4>
                            <button class="btn btn-secondary btn-small" style="width: 100%; margin-bottom: 0.5rem;">📊 Export Analytics</button>
                            <button class="btn btn-secondary btn-small" style="width: 100%; margin-bottom: 0.5rem;">📈 Generate Report</button>
                            <button class="btn btn-secondary btn-small" style="width: 100%;">📧 Email Summary</button>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                    <button class="btn btn-secondary" onclick="this.closest('.profile-modal').remove()">Close</button>
                    <button class="btn btn-primary" onclick="if(window.showToast) window.showToast('Analytics exported!', 'success');">📊 Export Data</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

// Initialize Profile UI Components and make them available globally
window.ProfileUIComponents = ProfileUIComponents;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileUIComponents;
}
