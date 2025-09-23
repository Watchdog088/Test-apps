// Change Password Modal Functionality
function openChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
        modal.classList.add('active');
        // Focus on first input for accessibility
        setTimeout(() => {
            document.getElementById('currentPassword').focus();
        }, 300);
    }
}

function closeChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
        modal.classList.remove('active');
        resetForm();
    }
}

// Reset form to initial state
function resetForm() {
    const form = document.getElementById('changePasswordForm');
    if (form) {
        form.reset();
        
        // Reset all error/success states
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error', 'success');
        });
        
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.classList.remove('visible');
            msg.textContent = '';
        });
        
        document.querySelectorAll('.success-message').forEach(msg => {
            msg.classList.remove('visible');
        });
        
        // Reset password requirements
        Object.keys(passwordRequirements).forEach(req => {
            passwordRequirements[req] = false;
            const element = document.getElementById(`req-${req}`);
            if (element) element.classList.remove('met');
        });
        
        // Reset password strength
        updatePasswordStrength('');
        
        // Reset button state
        const btn = document.getElementById('changePasswordBtn');
        if (btn) {
            btn.disabled = true;
            document.getElementById('btnText').style.display = 'inline';
            document.getElementById('btnLoader').style.display = 'none';
        }
    }
}

// Toggle password visibility
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
        button.setAttribute('aria-label', 'Hide password');
    } else {
        input.type = 'password';
        button.textContent = '👁️';
        button.setAttribute('aria-label', 'Show password');
    }
}

// Password requirements state
let passwordRequirements = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
};

// Check password requirements
function checkPasswordRequirements(password) {
    passwordRequirements.length = password.length >= 8;
    passwordRequirements.uppercase = /[A-Z]/.test(password);
    passwordRequirements.lowercase = /[a-z]/.test(password);
    passwordRequirements.number = /\d/.test(password);
    passwordRequirements.special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    // Update requirement indicators
    Object.keys(passwordRequirements).forEach(req => {
        const element = document.getElementById(`req-${req}`);
        if (element) {
            if (passwordRequirements[req]) {
                element.classList.add('met');
            } else {
                element.classList.remove('met');
            }
        }
    });
    
    return Object.values(passwordRequirements).every(req => req);
}

// Calculate password strength
function calculatePasswordStrength(password) {
    if (!password) return 0;
    
    let score = 0;
    const checks = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /\d/.test(password),
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    ];
    
    score = checks.filter(check => check).length;
    
    // Bonus points for longer passwords
    if (password.length >= 12) score += 0.5;
    if (password.length >= 16) score += 0.5;
    
    return Math.min(score / 5, 1);
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strength = calculatePasswordStrength(password);
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthFill || !strengthText) return;
    
    // Remove all strength classes
    strengthFill.className = 'strength-fill';
    strengthText.className = 'strength-text';
    
    if (!password) {
        strengthText.textContent = 'Password strength';
        return;
    }
    
    if (strength < 0.25) {
        strengthFill.classList.add('strength-weak');
        strengthText.classList.add('strength-weak-text');
        strengthText.textContent = 'Weak';
    } else if (strength < 0.5) {
        strengthFill.classList.add('strength-fair');
        strengthText.classList.add('strength-fair-text');
        strengthText.textContent = 'Fair';
    } else if (strength < 0.8) {
        strengthFill.classList.add('strength-good');
        strengthText.classList.add('strength-good-text');
        strengthText.textContent = 'Good';
    } else {
        strengthFill.classList.add('strength-strong');
        strengthText.classList.add('strength-strong-text');
        strengthText.textContent = 'Strong';
    }
}

// Show error message
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(inputId + 'Error');
    
    if (input) {
        input.classList.add('error');
        input.classList.remove('success');
    }
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('visible');
    }
}

// Show success message
function showSuccess(inputId, message = '') {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(inputId + 'Error');
    const successElement = document.getElementById(inputId + 'Success');
    
    if (input) {
        input.classList.add('success');
        input.classList.remove('error');
    }
    
    if (errorElement) {
        errorElement.classList.remove('visible');
    }
    
    if (successElement && message) {
        successElement.textContent = message;
        successElement.classList.add('visible');
    }
}

// Clear validation state
function clearValidation(inputId) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(inputId + 'Error');
    const successElement = document.getElementById(inputId + 'Success');
    
    if (input) {
        input.classList.remove('error', 'success');
    }
    
    if (errorElement) {
        errorElement.classList.remove('visible');
    }
    
    if (successElement) {
        successElement.classList.remove('visible');
    }
}

// Validate form and update submit button state
function validateForm() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = document.getElementById('changePasswordBtn');
    
    let isValid = true;
    
    // Check if all fields are filled
    if (!currentPassword || !newPassword || !confirmPassword) {
        isValid = false;
    }
    
    // Check if new password meets requirements
    if (!checkPasswordRequirements(newPassword)) {
        isValid = false;
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword && confirmPassword) {
        isValid = false;
    }
    
    if (submitBtn) {
        submitBtn.disabled = !isValid;
    }
    
    return isValid;
}

// Handle password change form submission
async function handlePasswordChange(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('changePasswordBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    
    // Update button to loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline';
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    try {
        // Validate new password requirements
        if (!checkPasswordRequirements(newPassword)) {
            showError('newPassword', 'Password does not meet security requirements');
            throw new Error('Password requirements not met');
        }
        
        // Validate password confirmation
        if (newPassword !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match');
            throw new Error('Passwords do not match');
        }
        
        // Check if new password is different from current
        if (currentPassword === newPassword) {
            showError('newPassword', 'New password must be different from current password');
            throw new Error('New password same as current');
        }
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Success! Close modal and show success message
        closeChangePasswordModal();
        showToast('Password changed successfully! You will be logged out for security.', 'success');
        
        // Simulate auto-logout after password change
        setTimeout(() => {
            showToast('Logging out for security...', 'info');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }, 2000);
        
    } catch (error) {
        console.error('Password change error:', error.message);
    } finally {
        // Reset button state
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoader) btnLoader.style.display = 'none';
        
        validateForm();
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Form submission
    const form = document.getElementById('changePasswordForm');
    if (form) {
        form.addEventListener('submit', handlePasswordChange);
    }
    
    // Current password validation
    const currentPasswordInput = document.getElementById('currentPassword');
    if (currentPasswordInput) {
        currentPasswordInput.addEventListener('input', () => {
            clearValidation('currentPassword');
            validateForm();
        });
    }
    
    // New password validation
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            
            updatePasswordStrength(password);
            checkPasswordRequirements(password);
            
            if (password) {
                if (checkPasswordRequirements(password)) {
                    showSuccess('newPassword');
                } else {
                    showError('newPassword', 'Password does not meet all requirements');
                }
            } else {
                clearValidation('newPassword');
            }
            
            // Re-validate confirm password if it has a value
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (confirmPassword) {
                validateConfirmPassword();
            }
            
            validateForm();
        });
    }
    
    // Confirm password validation
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validateConfirmPassword);
        confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
    }
    
    function validateConfirmPassword() {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (confirmPassword) {
            if (newPassword === confirmPassword) {
                showSuccess('confirmPassword', 'Passwords match');
            } else {
                showError('confirmPassword', 'Passwords do not match');
            }
        } else {
            clearValidation('confirmPassword');
        }
        
        validateForm();
    }
});
