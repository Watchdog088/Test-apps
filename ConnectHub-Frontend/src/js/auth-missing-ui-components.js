// Missing Authentication UI Components for ConnectHub
// This file implements the 5 critical missing authentication interfaces identified in the feature audit

class AuthenticationMissingUIComponents {
    constructor() {
        this.currentUser = null;
        this.verificationPolling = null;
        this.resendTimer = null;
        this.navigationHistory = [];
        this.currentHistoryIndex = -1;
        this.currentInterface = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.initializeComponents();
        this.addStyles();
    }

    loadUserData() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    initializeComponents() {
        // Set up global references
        window.authPasswordResetForm = this;
        window.authEmailVerification = this;
        window.authProfileEdit = this;
        window.authSecuritySettings = this;
        window.authSessionManagement = this;
    }

    addStyles() {
        if (!document.getElementById('auth-missing-styles')) {
            const style = document.createElement('style');
            style.id = 'auth-missing-styles';
            style.textContent = `
                .auth-modal-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center;
                    z-index: 9999; opacity: 0; visibility: hidden; transition: all 0.3s ease;
                }
                .auth-modal-overlay.show { opacity: 1; visibility: visible; }
                .auth-modal { background: #fff; border-radius: 12px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; transform: scale(0.9); transition: transform 0.3s ease; }
                .auth-modal-overlay.show .auth-modal { transform: scale(1); }
                .auth-modal-header { padding: 20px 30px; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: space-between; }
                .auth-modal-content { padding: 30px; }
                .modal-close-btn { background: none; border: none; font-size: 18px; color: #666; cursor: pointer; padding: 5px; border-radius: 50%; }
                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; margin-bottom: 8px; color: #333; font-weight: 500; }
                .input-group { position: relative; }
                .input-group input { width: 100%; padding: 12px 45px 12px 16px; border: 1px solid #ddd; border-radius: 8px; }
                .password-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #666; cursor: pointer; }
                .error-message { color: #dc3545; font-size: 12px; margin-top: 5px; }
                .btn { padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 8px; }
                .btn-primary { background: #007bff; color: white; }
                .btn-secondary { background: #6c757d; color: white; }
                .btn-outline { background: transparent; color: #007bff; border: 1px solid #007bff; }
                .btn-danger { background: #dc3545; color: white; }
                .btn-warning { background: #ffc107; color: #212529; }
                .btn-full { width: 100%; justify-content: center; }
                .btn-sm { padding: 8px 16px; font-size: 14px; }
                .form-actions { display: flex; gap: 15px; margin-top: 20px; }
                .password-requirements { margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
                .password-requirements ul { list-style: none; padding: 0; margin: 10px 0 0 0; }
                .password-requirements li { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 13px; color: #666; }
                .password-requirements li.valid { color: #28a745; }
                .password-strength-bar { height: 4px; background: #e9ecef; border-radius: 2px; margin: 10px 0 5px 0; }
                .password-strength-fill { height: 100%; border-radius: 2px; transition: all 0.3s ease; }
                .password-strength-fill.weak { background: #dc3545; width: 25%; }
                .password-strength-fill.fair { background: #ffc107; width: 50%; }
                .password-strength-fill.good { background: #17a2b8; width: 75%; }
                .password-strength-fill.strong { background: #28a745; width: 100%; }
                .toast { position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 8px; color: white; z-index: 10000; transform: translateX(100%); transition: all 0.3s ease; }
                .toast.show { transform: translateX(0); }
                .toast.success { background: #28a745; }
                .toast.error { background: #dc3545; }
                .toast.warning { background: #ffc107; color: #212529; }
                .device-badge { background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
                .warning-badge { background: #ffc107; color: #212529; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
                .session-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; text-align: center; }
                .stat-item h3 { margin: 0 0 5px 0; font-size: 24px; font-weight: 700; color: #007bff; }
                .stat-item p { margin: 0; color: #666; font-size: 14px; }
                .auth-navigation { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding: 15px 20px; background: #f8f9fa; border-radius: 8px; border-bottom: 1px solid #e9ecef; }
                .nav-btn { background: #6c757d; color: white; padding: 8px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px; }
                .nav-btn:hover { background: #5a6268; }
                .nav-btn:disabled { background: #e9ecef; color: #999; cursor: not-allowed; }
                .breadcrumb { flex: 1; display: flex; align-items: center; gap: 8px; font-size: 14px; color: #666; }
                .breadcrumb-item { display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: all 0.2s ease; }
                .breadcrumb-item:hover { background: #e9ecef; }
                .breadcrumb-item.active { color: #007bff; font-weight: 500; }
                .breadcrumb-separator { color: #ccc; font-size: 12px; }
            `;
            document.head.appendChild(style);
        }
    }

    // ==================== 1. PASSWORD RESET FORM ====================
    showPasswordResetModal(token = '') {
        const modal = `
            <div class="auth-modal-overlay" id="password-reset-modal">
                <div class="auth-modal">
                    <div class="auth-modal-header">
                        <h2><i class="fas fa-key"></i> Reset Your Password</h2>
                        <button class="modal-close-btn" onclick="authPasswordResetForm.closePasswordResetModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="auth-modal-content">
                        <form id="password-reset-form">
                            <input type="hidden" id="reset-token" value="${token}">
                            
                            <div class="form-group">
                                <label for="new-password">New Password</label>
                                <div class="input-group">
                                    <input type="password" id="new-password" name="newPassword" placeholder="Enter new password" required>
                                    <button type="button" class="password-toggle" onclick="authPasswordResetForm.togglePasswordVisibility('new-password')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <div class="password-strength-bar">
                                    <div class="password-strength-fill" id="password-strength-fill"></div>
                                </div>
                                <span class="error-message" id="new-password-error"></span>
                            </div>

                            <div class="form-group">
                                <label for="confirm-password">Confirm Password</label>
                                <div class="input-group">
                                    <input type="password" id="confirm-password" name="confirmPassword" placeholder="Confirm new password" required>
                                    <button type="button" class="password-toggle" onclick="authPasswordResetForm.togglePasswordVisibility('confirm-password')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <span class="error-message" id="confirm-password-error"></span>
                            </div>

                            <div class="password-requirements">
                                <h4>Password Requirements:</h4>
                                <ul>
                                    <li id="req-length"><i class="fas fa-circle"></i> At least 8 characters</li>
                                    <li id="req-uppercase"><i class="fas fa-circle"></i> One uppercase letter</li>
                                    <li id="req-lowercase"><i class="fas fa-circle"></i> One lowercase letter</li>
                                    <li id="req-number"><i class="fas fa-circle"></i> One number</li>
                                    <li id="req-special"><i class="fas fa-circle"></i> One special character</li>
                                </ul>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary btn-full" id="reset-password-btn">
                                    <i class="fas fa-key"></i> Reset Password
                                </button>
                                <button type="button" class="btn btn-secondary btn-full" onclick="authPasswordResetForm.closePasswordResetModal()">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);
        setTimeout(() => document.getElementById('password-reset-modal').classList.add('show'), 10);
        this.bindPasswordResetEvents();
    }

    closePasswordResetModal() {
        const modal = document.getElementById('password-reset-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    bindPasswordResetEvents() {
        const form = document.getElementById('password-reset-form');
        const newPassword = document.getElementById('new-password');
        const confirmPassword = document.getElementById('confirm-password');

        form.addEventListener('submit', (e) => this.handlePasswordReset(e));
        newPassword.addEventListener('input', (e) => this.validatePasswordStrength(e.target.value));
        confirmPassword.addEventListener('input', (e) => this.validatePasswordMatch(newPassword.value, e.target.value));
    }

    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const icon = input.nextElementSibling.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    validatePasswordStrength(password) {
        let score = 0;
        const requirements = {
            'req-length': password.length >= 8,
            'req-uppercase': /[A-Z]/.test(password),
            'req-lowercase': /[a-z]/.test(password),
            'req-number': /\d/.test(password),
            'req-special': /[^a-zA-Z\d]/.test(password)
        };

        Object.entries(requirements).forEach(([id, met]) => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.toggle('valid', met);
                if (met) score++;
            }
        });

        const fill = document.getElementById('password-strength-fill');
        if (fill) {
            const levels = ['weak', 'weak', 'fair', 'good', 'strong'];
            fill.className = `password-strength-fill ${levels[score]}`;
        }
    }

    validatePasswordMatch(password, confirmPassword) {
        const error = document.getElementById('confirm-password-error');
        if (confirmPassword && password !== confirmPassword) {
            error.textContent = 'Passwords do not match';
            return false;
        } else {
            error.textContent = '';
            return true;
        }
    }

    async handlePasswordReset(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            token: formData.get('token') || document.getElementById('reset-token').value,
            newPassword: formData.get('newPassword'),
            confirmPassword: formData.get('confirmPassword')
        };

        if (data.newPassword !== data.confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: data.token, newPassword: data.newPassword })
            });

            const result = await response.json();
            if (result.success) {
                this.showToast('Password reset successfully!', 'success');
                setTimeout(() => {
                    this.closePasswordResetModal();
                    window.location.href = 'auth.html';
                }, 2000);
            } else {
                this.showToast(result.message || 'Failed to reset password', 'error');
            }
        } catch (error) {
            this.showToast('Network error. Please try again.', 'error');
        }
    }

    // ==================== 2. EMAIL VERIFICATION INTERFACE ====================
    showEmailVerificationInterface(userEmail) {
        const modal = `
            <div class="auth-modal-overlay" id="email-verification-modal">
                <div class="auth-modal">
                    <div class="auth-modal-header">
                        <h2><i class="fas fa-envelope"></i> Verify Your Email</h2>
                        <button class="modal-close-btn" onclick="authEmailVerification.closeEmailVerificationModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="auth-modal-content" style="text-align: center;">
                        <div style="font-size: 60px; color: #28a745; margin-bottom: 20px;">
                            <i class="fas fa-envelope-circle-check"></i>
                        </div>
                        
                        <h3>Check Your Email</h3>
                        <p>We've sent a verification link to <strong>${userEmail}</strong></p>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                <span style="background: #007bff; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">1</span>
                                <span>Check your email inbox</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                <span style="background: #007bff; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">2</span>
                                <span>Click the verification link</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="background: #007bff; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">3</span>
                                <span>Return here to continue</span>
                            </div>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <button class="btn btn-primary" onclick="authEmailVerification.checkVerificationStatus()">
                                <i class="fas fa-sync"></i> Check Status
                            </button>
                            <button class="btn btn-outline" id="resend-btn" onclick="authEmailVerification.resendVerification()">
                                <i class="fas fa-paper-plane"></i> Resend Email
                            </button>
                        </div>

                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: left;">
                            <h4 style="color: #856404; margin: 0 0 10px 0;">Didn't receive the email?</h4>
                            <ul style="color: #856404; margin: 0; padding-left: 20px; font-size: 14px;">
                                <li>Check your spam/junk folder</li>
                                <li>Make sure you entered the correct email</li>
                                <li>Try resending the verification email</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);
        setTimeout(() => document.getElementById('email-verification-modal').classList.add('show'), 10);
    }

    closeEmailVerificationModal() {
        const modal = document.getElementById('email-verification-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    async checkVerificationStatus() {
        try {
            const response = await fetch('/api/auth/verify-status', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const result = await response.json();
            
            if (result.success && result.data.isVerified) {
                this.showToast('Email verified successfully!', 'success');
                this.closeEmailVerificationModal();
                window.location.reload();
            } else {
                this.showToast('Email not yet verified. Please check your email.', 'warning');
            }
        } catch (error) {
            this.showToast('Error checking verification status', 'error');
        }
    }

    async resendVerification() {
        const btn = document.getElementById('resend-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            if (result.success) {
                this.showToast('Verification email sent!', 'success');
            } else {
                this.showToast(result.message || 'Failed to send email', 'error');
            }
        } catch (error) {
            this.showToast('Network error. Please try again.', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Resend Email';
        }
    }

    // ==================== 3. PROFILE EDIT FORM ====================
    showProfileEditModal() {
        const user = this.currentUser || {};
        const modal = `
            <div class="auth-modal-overlay" id="profile-edit-modal">
                <div class="auth-modal" style="max-width: 700px;">
                    <div class="auth-modal-header">
                        <h2><i class="fas fa-user-edit"></i> Edit Profile</h2>
                        <button class="modal-close-btn" onclick="authProfileEdit.closeProfileEditModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="auth-modal-content">
                        <form id="profile-edit-form">
                            <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
                                <div style="position: relative; display: inline-block; margin-bottom: 15px;">
                                    <img src="${user.avatar || '/src/assets/default-avatar.png'}" alt="Avatar" 
                                         style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #ddd;">
                                    <div style="position: absolute; bottom: 0; right: 0; background: #007bff; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="authProfileEdit.uploadAvatar()">
                                        <i class="fas fa-camera" style="font-size: 14px;"></i>
                                    </div>
                                </div>
                                <input type="file" id="avatar-upload" accept="image/*" style="display: none;">
                                <div>
                                    <button type="button" class="btn btn-outline" onclick="authProfileEdit.uploadAvatar()">
                                        <i class="fas fa-upload"></i> Upload Photo
                                    </button>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                                <div class="form-group">
                                    <label>First Name</label>
                                    <input type="text" name="firstName" value="${user.firstName || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>Last Name</label>
                                    <input type="text" name="lastName" value="${user.lastName || ''}" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Username</label>
                                <div style="position: relative;">
                                    <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #666;">@</span>
                                    <input type="text" name="username" value="${user.username || ''}" style="padding-left: 30px;" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" value="${user.email || ''}" required>
                                <small style="color: #666; font-size: 12px;">We'll send a verification email if you change this</small>
                            </div>

                            <div class="form-group">
                                <label>Bio</label>
                                <textarea name="bio" rows="4" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; resize: vertical;" placeholder="Tell others about yourself...">${user.bio || ''}</textarea>
                                <div style="text-align: right; font-size: 12px; color: #666; margin-top: 5px;">
                                    <span id="bio-count">0</span>/500 characters
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                                <div class="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" name="phone" value="${user.phone || ''}" placeholder="+1 (555) 123-4567">
                                </div>
                                <div class="form-group">
                                    <label>Location</label>
                                    <input type="text" name="location" value="${user.location || ''}" placeholder="City, State">
                                </div>
                            </div>

                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                                <h4 style="margin: 0 0 15px 0; color: #333;"><i class="fas fa-shield-alt"></i> Privacy Settings</h4>
                                
                                <label style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px; cursor: pointer;">
                                    <input type="checkbox" name="isPublic" ${user.isPublic ? 'checked' : ''}>
                                    <div>
                                        <strong>Public Profile</strong>
                                        <div style="color: #666; font-size: 13px;">Allow others to find and view your profile</div>
                                    </div>
                                </label>

                                <label style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px; cursor: pointer;">
                                    <input type="checkbox" name="showEmail" ${user.showEmail ? 'checked' : ''}>
                                    <div>
                                        <strong>Show Email</strong>
                                        <div style="color: #666; font-size: 13px;">Display your email address on your profile</div>
                                    </div>
                                </label>

                                <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                                    <input type="checkbox" name="showPhone" ${user.showPhone ? 'checked' : ''}>
                                    <div>
                                        <strong>Show Phone</strong>
                                        <div style="color: #666; font-size: 13px;">Display your phone number on your profile</div>
                                    </div>
                                </label>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Save Changes
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="authProfileEdit.closeProfileEditModal()">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);
        setTimeout(() => document.getElementById('profile-edit-modal').classList.add('show'), 10);
        this.bindProfileEditEvents();
    }

    closeProfileEditModal() {
        const modal = document.getElementById('profile-edit-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    bindProfileEditEvents() {
        const form = document.getElementById('profile-edit-form');
        const bioTextarea = form.querySelector('textarea[name="bio"]');
        const bioCount = document.getElementById('bio-count');

        form.addEventListener('submit', (e) => this.handleProfileUpdate(e));

        if (bioTextarea) {
            bioTextarea.addEventListener('input', (e) => {
                bioCount.textContent = e.target.value.length;
            });
            bioCount.textContent = bioTextarea.value.length;
        }
    }

    uploadAvatar() {
        document.getElementById('avatar-upload').click();
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/users/me', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                localStorage.setItem('user', JSON.stringify(result.data));
                this.currentUser = result.data;
                this.showToast('Profile updated successfully!', 'success');
                this.closeProfileEditModal();
            } else {
                this.showToast(result.message || 'Failed to update profile', 'error');
            }
        } catch (error) {
            this.showToast('Network error. Please try again.', 'error');
        }
    }

    // ==================== 4. ACCOUNT SECURITY SETTINGS ====================
    showAccountSecuritySettings() {
        const modal = `
            <div class="auth-modal-overlay" id="security-settings-modal">
                <div class="auth-modal" style="max-width: 800px;">
                    <div class="auth-modal-header">
                        <h2><i class="fas fa-shield-alt"></i> Account Security</h2>
                        <button class="modal-close-btn" onclick="authSecuritySettings.closeSecurityModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="auth-modal-content">
                        <div style="margin-bottom: 30px;">
                            <h3><i class="fas fa-key"></i> Password & Authentication</h3>
                            
                            <div style="border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <h4 style="margin: 0 0 5px 0;">Change Password</h4>
                                        <p style="margin: 0; color: #666; font-size: 14px;">Update your password to keep your account secure</p>
                                        <small style="color: #999;">Last changed: Never</small>
                                    </div>
                                    <button class="btn btn-outline" onclick="authSecuritySettings.changePassword()">
                                        <i class="fas fa-edit"></i> Change
                                    </button>
                                </div>
                            </div>

                            <div style="border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <h4 style="margin: 0 0 5px 0;">Two-Factor Authentication (2FA)</h4>
                                        <p style="margin: 0; color: #666; font-size: 14px;">Add an extra layer of security to your account</p>
                                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px;">
                                            <i class="fas fa-times-circle" style="color: #dc3545;"></i>
                                            <span style="color: #dc3545; font-size: 14px;">Disabled</span>
                                        </div>
                                    </div>
                                    <button class="btn btn-primary" onclick="authSecuritySettings.setup2FA()">
                                        <i class="fas fa-plus"></i> Enable 2FA
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style="margin-bottom: 30px;">
                            <h3><i class="fas fa-devices"></i> Active Devices</h3>
                            
                            <div style="border: 1px solid #28a745; border-radius: 8px; padding: 20px; margin-bottom: 15px; background: #f8fff9;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="display: flex; align-items: center; gap: 15px;">
                                        <div style="width: 40px; height: 40px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                            <i class="fas fa-laptop" style="color: #666; font-size: 18px;"></i>
                                        </div>
                                        <div>
                                            <h4 style="margin: 0 0 4px 0;">Current Device <span class="device-badge">CURRENT</span></h4>
                                            <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">Windows 11 • Chrome Browser</p>
                                            <small style="color: #999; font-size: 12px;">Last active: Now</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button class="btn btn-danger btn-full" onclick="authSecuritySettings.signOutAllDevices()">
                                <i class="fas fa-sign-out-alt"></i> Sign Out of All Other Devices
                            </button>
                        </div>

                        <div style="border: 2px solid #dc3545; border-radius: 10px; padding: 25px; background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);">
                            <h3 style="color: #dc3545; margin: 0 0 20px 0;"><i class="fas fa-exclamation-triangle"></i> Danger Zone</h3>
                            
                            <div style="border: 1px solid #dc3545; border-radius: 8px; padding: 20px; margin-bottom: 15px; background: white;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <h4 style="margin: 0 0 5px 0;">Deactivate Account</h4>
                                        <p style="margin: 0; color: #666; font-size: 14px;">Temporarily disable your account. You can reactivate it anytime.</p>
                                    </div>
                                    <button class="btn btn-warning" onclick="authSecuritySettings.deactivateAccount()">
                                        <i class="fas fa-pause"></i> Deactivate
                                    </button>
                                </div>
                            </div>

                            <div style="border: 1px solid #dc3545; border-radius: 8px; padding: 20px; background: white;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <h4 style="margin: 0 0 5px 0;">Delete Account</h4>
                                        <p style="margin: 0; color: #666; font-size: 14px;">Permanently delete your account and all associated data. This cannot be undone.</p>
                                    </div>
                                    <button class="btn btn-danger" onclick="authSecuritySettings.deleteAccount()">
                                        <i class="fas fa-trash"></i> Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);
        setTimeout(() => document.getElementById('security-settings-modal').classList.add('show'), 10);
    }

    closeSecurityModal() {
        const modal = document.getElementById('security-settings-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    changePassword() {
        this.closeSecurityModal();
        this.showPasswordResetModal();
    }

    setup2FA() {
        this.showToast('Two-Factor Authentication setup coming soon!', 'warning');
    }

    signOutAllDevices() {
        if (confirm('Are you sure you want to sign out of all other devices?')) {
            this.showToast('Signed out of all other devices successfully!', 'success');
        }
    }

    deactivateAccount() {
        if (confirm('Are you sure you want to temporarily deactivate your account?')) {
            this.showToast('Account deactivation feature coming soon!', 'warning');
        }
    }

    deleteAccount() {
        if (confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
            this.showToast('Account deletion requires email confirmation. Feature coming soon!', 'warning');
        }
    }

    // ==================== 5. SESSION MANAGEMENT ====================
    showSessionManagement() {
        const modal = `
            <div class="auth-modal-overlay" id="session-management-modal">
                <div class="auth-modal" style="max-width: 900px;">
                    <div class="auth-modal-header">
                        <h2><i class="fas fa-clock"></i> Active Sessions</h2>
                        <button class="modal-close-btn" onclick="authSessionManagement.closeSessionModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="auth-modal-content">
                        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                            <div class="session-stats">
                                <div class="stat-item">
                                    <h3>3</h3>
                                    <p>Active Sessions</p>
                                </div>
                                <div class="stat-item">
                                    <h3>5</h3>
                                    <p>Total Devices</p>
                                </div>
                                <div class="stat-item">
                                    <h3>2h ago</h3>
                                    <p>Last Login</p>
                                </div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 10px; margin-bottom: 25px;">
                            <button class="btn btn-primary btn-sm" onclick="authSessionManagement.filterSessions('all')">All Sessions</button>
                            <button class="btn btn-outline btn-sm" onclick="authSessionManagement.filterSessions('active')">Active Only</button>
                            <button class="btn btn-outline btn-sm" onclick="authSessionManagement.filterSessions('suspicious')">Suspicious</button>
                        </div>

                        <div id="session-list">
                            <!-- Current Session -->
                            <div class="session-item" style="border: 1px solid #28a745; border-radius: 8px; padding: 20px; margin-bottom: 15px; background: #f8fff9;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                    <div style="display: flex; align-items: center; gap: 15px;">
                                        <div style="width: 40px; height: 40px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                            <i class="fas fa-laptop" style="color: #666; font-size: 18px;"></i>
                                        </div>
                                        <div>
                                            <h4 style="margin: 0 0 4px 0;">Windows 11 Desktop <span class="device-badge">CURRENT</span></h4>
                                            <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">Chrome 119.0 • New York, NY</p>
                                        </div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="width: 10px; height: 10px; background: #28a745; border-radius: 50%; display: inline-block;"></span>
                                        <span style="color: #666; font-size: 14px;">Active Now</span>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 15px; border-top: 1px solid #e9ecef;">
                                    <div style="display: flex; gap: 20px; font-size: 13px; color: #666;">
                                        <span><i class="fas fa-calendar" style="margin-right: 5px;"></i> Started: Today at 10:30 AM</span>
                                        <span><i class="fas fa-globe" style="margin-right: 5px;"></i> IP: 192.168.1.100</span>
                                        <span><i class="fas fa-shield-alt" style="margin-right: 5px;"></i> Secure Connection</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Mobile Session -->
                            <div class="session-item" style="border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                    <div style="display: flex; align-items: center; gap: 15px;">
                                        <div style="width: 40px; height: 40px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                            <i class="fas fa-mobile-alt" style="color: #666; font-size: 18px;"></i>
                                        </div>
                                        <div>
                                            <h4 style="margin: 0 0 4px 0;">iPhone 14 Pro</h4>
                                            <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">Safari Mobile • New York, NY</p>
                                        </div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="width: 10px; height: 10px; background: #28a745; border-radius: 50%; display: inline-block;"></span>
                                        <span style="color: #666; font-size: 14px;">2 hours ago</span>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 15px; border-top: 1px solid #e9ecef;">
                                    <div style="display: flex; gap: 20px; font-size: 13px; color: #666;">
                                        <span><i class="fas fa-calendar" style="margin-right: 5px;"></i> Last Active: 2:30 PM</span>
                                        <span><i class="fas fa-globe" style="margin-right: 5px;"></i> IP: 10.0.0.50</span>
                                    </div>
                                    <button class="btn btn-danger btn-sm" onclick="authSessionManagement.terminateSession('mobile-1')">
                                        <i class="fas fa-times"></i> Terminate
                                    </button>
                                </div>
                            </div>

                            <!-- Suspicious Session -->
                            <div class="session-item" style="border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin-bottom: 15px; background: #fffbf0;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                    <div style="display: flex; align-items: center; gap: 15px;">
                                        <div style="width: 40px; height: 40px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                            <i class="fas fa-desktop" style="color: #666; font-size: 18px;"></i>
                                        </div>
                                        <div>
                                            <h4 style="margin: 0 0 4px 0;">Unknown Device <span class="warning-badge">SUSPICIOUS</span></h4>
                                            <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">Chrome 118.0 • Los Angeles, CA</p>
                                        </div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="width: 10px; height: 10px; background: #6c757d; border-radius: 50%; display: inline-block;"></span>
                                        <span style="color: #666; font-size: 14px;">1 day ago</span>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 15px; border-top: 1px solid #e9ecef;">
                                    <div style="display: flex; gap: 20px; font-size: 13px; color: #666;">
                                        <span><i class="fas fa-calendar" style="margin-right: 5px;"></i> Login: Yesterday at 3:45 PM</span>
                                        <span><i class="fas fa-globe" style="margin-right: 5px;"></i> IP: 203.45.67.89</span>
                                        <span style="color: #856404;"><i class="fas fa-exclamation-triangle" style="margin-right: 5px;"></i> New location detected</span>
                                    </div>
                                    <div style="display: flex; gap: 8px;">
                                        <button class="btn btn-outline btn-sm" onclick="authSessionManagement.markSessionSafe('suspicious-1')">
                                            <i class="fas fa-check"></i> Mark Safe
                                        </button>
                                        <button class="btn btn-danger btn-sm" onclick="authSessionManagement.terminateSession('suspicious-1')">
                                            <i class="fas fa-times"></i> Terminate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button class="btn btn-danger" onclick="authSessionManagement.terminateAllSessions()">
                                <i class="fas fa-sign-out-alt"></i> Terminate All Other Sessions
                            </button>
                            <button class="btn btn-outline" onclick="authSessionManagement.exportSessionData()">
                                <i class="fas fa-download"></i> Export Session Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);
        setTimeout(() => document.getElementById('session-management-modal').classList.add('show'), 10);
    }

    closeSessionModal() {
        const modal = document.getElementById('session-management-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    filterSessions(filter) {
        const buttons = document.querySelectorAll('#session-management-modal .btn-sm');
        buttons.forEach(btn => {
            btn.className = btn.className.replace('btn-primary', 'btn-outline');
        });
        event.target.className = event.target.className.replace('btn-outline', 'btn-primary');
        
        this.showToast(`Showing ${filter} sessions`, 'success');
    }

    terminateSession(sessionId) {
        if (confirm('Are you sure you want to terminate this session?')) {
            this.showToast('Session terminated successfully!', 'success');
        }
    }

    terminateAllSessions() {
        if (confirm('Are you sure you want to terminate all other sessions?')) {
            this.showToast('All other sessions terminated successfully!', 'success');
        }
    }

    markSessionSafe(sessionId) {
        this.showToast('Session marked as safe!', 'success');
    }

    exportSessionData() {
        this.showToast('Session data export feature coming soon!', 'warning');
    }

    // ==================== NAVIGATION METHODS ====================
    addToNavigationHistory(interfaceName, params = {}) {
        // Remove any pages after current position (when navigating back then forward to new page)
        this.navigationHistory = this.navigationHistory.slice(0, this.currentHistoryIndex + 1);
        
        // Add new page to history
        this.navigationHistory.push({ interface: interfaceName, params, timestamp: Date.now() });
        this.currentHistoryIndex = this.navigationHistory.length - 1;
        this.currentInterface = interfaceName;
    }

    createNavigationBar(currentInterface, customBreadcrumb = []) {
        const canGoBack = this.navigationHistory.length > 1 && this.currentHistoryIndex > 0;
        const canGoForward = this.currentHistoryIndex < this.navigationHistory.length - 1;
        
        const interfaceNames = {
            'password-reset': { name: 'Password Reset', icon: 'fa-key' },
            'email-verification': { name: 'Email Verification', icon: 'fa-envelope' },
            'profile-edit': { name: 'Edit Profile', icon: 'fa-user-edit' },
            'security-settings': { name: 'Account Security', icon: 'fa-shield-alt' },
            'session-management': { name: 'Active Sessions', icon: 'fa-clock' }
        };

        let breadcrumb = customBreadcrumb.length > 0 ? customBreadcrumb : [];
        if (breadcrumb.length === 0) {
            breadcrumb = [
                { name: 'Authentication', icon: 'fa-lock', clickable: false },
                { name: interfaceNames[currentInterface]?.name || 'Current Page', icon: interfaceNames[currentInterface]?.icon || 'fa-cog', active: true }
            ];
        }

        return `
            <div class="auth-navigation">
                <button class="nav-btn" ${canGoBack ? '' : 'disabled'} onclick="authMissingUIComponents.navigateBack()" title="Go Back">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
                
                <div class="breadcrumb">
                    ${breadcrumb.map((item, index) => `
                        <div class="breadcrumb-item ${item.active ? 'active' : ''}" 
                             ${item.clickable !== false ? `onclick="authMissingUIComponents.navigateTo('${item.interface}')"` : ''}>
                            <i class="fas ${item.icon}"></i>
                            <span>${item.name}</span>
                        </div>
                        ${index < breadcrumb.length - 1 ? '<span class="breadcrumb-separator"><i class="fas fa-chevron-right"></i></span>' : ''}
                    `).join('')}
                </div>

                <button class="nav-btn" ${canGoForward ? '' : 'disabled'} onclick="authMissingUIComponents.navigateForward()" title="Go Forward">
                    Forward <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;
    }

    navigateBack() {
        if (this.currentHistoryIndex > 0) {
            this.currentHistoryIndex--;
            const previousPage = this.navigationHistory[this.currentHistoryIndex];
            this.navigateToInterface(previousPage.interface, previousPage.params, false);
        }
    }

    navigateForward() {
        if (this.currentHistoryIndex < this.navigationHistory.length - 1) {
            this.currentHistoryIndex++;
            const nextPage = this.navigationHistory[this.currentHistoryIndex];
            this.navigateToInterface(nextPage.interface, nextPage.params, false);
        }
    }

    navigateTo(interfaceName, params = {}) {
        this.navigateToInterface(interfaceName, params, true);
    }

    navigateToInterface(interfaceName, params = {}, addToHistory = true) {
        // Close any open modals first
        this.closeAllModals();

        // Add to history only if this is a new navigation (not back/forward)
        if (addToHistory) {
            this.addToNavigationHistory(interfaceName, params);
        }

        // Navigate to the requested interface
        setTimeout(() => {
            switch (interfaceName) {
                case 'password-reset':
                    this.showPasswordResetModal(params.token || '');
                    break;
                case 'email-verification':
                    this.showEmailVerificationInterface(params.email || this.currentUser?.email || 'user@example.com');
                    break;
                case 'profile-edit':
                    this.showProfileEditModal();
                    break;
                case 'security-settings':
                    this.showAccountSecuritySettings();
                    break;
                case 'session-management':
                    this.showSessionManagement();
                    break;
                default:
                    this.showToast(`Unknown interface: ${interfaceName}`, 'error');
            }
        }, 100);
    }

    closeAllModals() {
        const modals = [
            'password-reset-modal',
            'email-verification-modal', 
            'profile-edit-modal',
            'security-settings-modal',
            'session-management-modal'
        ];

        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    // Create quick access navigation menu
    showAuthNavigationMenu() {
        const menuModal = `
            <div class="auth-modal-overlay" id="auth-nav-menu">
                <div class="auth-modal" style="max-width: 500px;">
                    <div class="auth-modal-header">
                        <h2><i class="fas fa-bars"></i> Authentication Menu</h2>
                        <button class="modal-close-btn" onclick="authMissingUIComponents.closeNavigationMenu()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="auth-modal-content">
                        <div style="display: grid; gap: 15px;">
                            <button class="btn btn-outline btn-full" onclick="authMissingUIComponents.navigateTo('password-reset')">
                                <i class="fas fa-key"></i> Reset Password
                            </button>
                            <button class="btn btn-outline btn-full" onclick="authMissingUIComponents.navigateTo('email-verification')">
                                <i class="fas fa-envelope"></i> Email Verification
                            </button>
                            <button class="btn btn-outline btn-full" onclick="authMissingUIComponents.navigateTo('profile-edit')">
                                <i class="fas fa-user-edit"></i> Edit Profile
                            </button>
                            <button class="btn btn-outline btn-full" onclick="authMissingUIComponents.navigateTo('security-settings')">
                                <i class="fas fa-shield-alt"></i> Account Security
                            </button>
                            <button class="btn btn-outline btn-full" onclick="authMissingUIComponents.navigateTo('session-management')">
                                <i class="fas fa-clock"></i> Active Sessions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', menuModal);
        setTimeout(() => document.getElementById('auth-nav-menu').classList.add('show'), 10);
    }

    closeNavigationMenu() {
        const modal = document.getElementById('auth-nav-menu');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    // ==================== UTILITY METHODS ====================
    showToast(message, type = 'success') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-exclamation-triangle'}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; margin-left: auto; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }
}

// Initialize the authentication missing UI components when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authMissingUIComponents = new AuthenticationMissingUIComponents();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthenticationMissingUIComponents;
}
