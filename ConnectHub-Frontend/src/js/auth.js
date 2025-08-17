// Authentication JavaScript for Lynk
class AuthManager {
    constructor() {
        this.currentForm = 'login';
        this.isLoading = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupPasswordToggles();
        this.setupPasswordStrength();
        this.addFormAnimations();
    }

    bindEvents() {
        // Form switching
        const showRegisterBtn = document.getElementById('show-register');
        const showLoginBtn = document.getElementById('show-login');
        const forgotPasswordLink = document.getElementById('forgot-password-link');
        const backToLoginBtn = document.getElementById('back-to-login');

        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchForm('register');
            });
        }

        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchForm('login');
            });
        }

        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchForm('forgot');
            });
        }

        if (backToLoginBtn) {
            backToLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchForm('login');
            });
        }

        // Form submissions
        const loginForm = document.getElementById('login-form-element');
        const registerForm = document.getElementById('register-form-element');
        const forgotPasswordForm = document.getElementById('forgot-password-form-element');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
        }

        // Social login buttons
        this.setupSocialLogin();

        // Real-time validation
        this.setupRealTimeValidation();
    }

    switchForm(formType) {
        const forms = {
            login: document.getElementById('login-form'),
            register: document.getElementById('register-form'),
            forgot: document.getElementById('forgot-password-form')
        };

        // Hide all forms
        Object.values(forms).forEach(form => {
            if (form) {
                form.style.display = 'none';
                form.classList.remove('fade-in');
                form.classList.add('fade-out');
            }
        });

        // Show selected form with animation
        setTimeout(() => {
            if (forms[formType]) {
                forms[formType].style.display = 'block';
                forms[formType].classList.remove('fade-out');
                forms[formType].classList.add('fade-in');
                this.currentForm = formType;
            }
        }, 150);

        // Clear any existing error messages
        this.clearErrors();
    }

    setupPasswordToggles() {
        const toggleButtons = document.querySelectorAll('.password-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentElement.querySelector('input');
                const icon = button.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                    button.setAttribute('title', 'Hide password');
                } else {
                    input.type = 'password';
                    icon.className = 'fas fa-eye';
                    button.setAttribute('title', 'Show password');
                }
            });
        });
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('register-password');
        const confirmPasswordInput = document.getElementById('register-confirm-password');
        const strengthFill = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');

        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                const password = e.target.value;
                const strength = this.calculatePasswordStrength(password);
                this.updatePasswordStrength(strength, strengthFill, strengthText);
            });
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', (e) => {
                this.validatePasswordMatch(passwordInput.value, e.target.value);
            });
        }
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];

        if (password.length >= 8) score += 1;
        else feedback.push('Use 8+ characters');

        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('Add lowercase letters');

        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('Add uppercase letters');

        if (/\d/.test(password)) score += 1;
        else feedback.push('Add numbers');

        if (/[^a-zA-Z\d]/.test(password)) score += 1;
        else feedback.push('Add special characters');

        const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['weak', 'weak', 'fair', 'good', 'strong'];

        return {
            score,
            level: levels[score] || 'Very Weak',
            color: colors[score] || 'weak',
            feedback: feedback.slice(0, 2) // Show max 2 suggestions
        };
    }

    updatePasswordStrength(strength, strengthFill, strengthText) {
        if (!strengthFill || !strengthText) return;

        strengthFill.className = `strength-fill ${strength.color}`;
        strengthText.textContent = `Password strength: ${strength.level}`;

        if (strength.feedback.length > 0 && strength.score < 4) {
            strengthText.textContent += ` (${strength.feedback.join(', ')})`;
        }
    }

    validatePasswordMatch(password, confirmPassword) {
        const errorElement = document.getElementById('register-confirm-password-error');
        if (!errorElement) return;

        if (confirmPassword && password !== confirmPassword) {
            errorElement.textContent = 'Passwords do not match';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }

    setupRealTimeValidation() {
        // Email validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateEmail(input));
        });

        // Username validation
        const usernameInput = document.getElementById('register-username');
        if (usernameInput) {
            usernameInput.addEventListener('blur', () => this.validateUsername(usernameInput));
        }
    }

    validateEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const errorElement = document.getElementById(input.id + '-error');
        
        if (!errorElement) return true;

        if (input.value && !emailRegex.test(input.value)) {
            errorElement.textContent = 'Please enter a valid email address';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }

    validateUsername(input) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
        const errorElement = document.getElementById('register-username-error');
        
        if (!errorElement) return true;

        if (input.value && !usernameRegex.test(input.value)) {
            errorElement.textContent = 'Username must be 3-30 characters (letters, numbers, underscore only)';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }

    setupSocialLogin() {
        // Google login
        const googleBtns = document.querySelectorAll('#google-login, #google-register');
        googleBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleSocialLogin('google'));
        });

        // Facebook login
        const facebookBtns = document.querySelectorAll('#facebook-login, #facebook-register');
        facebookBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleSocialLogin('facebook'));
        });

        // Apple login
        const appleBtns = document.querySelectorAll('#apple-login, #apple-register');
        appleBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleSocialLogin('apple'));
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const form = e.target;
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const remember = formData.get('remember');

        // Validate form
        if (!this.validateLoginForm(email, password)) return;

        this.setLoadingState('login', true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, remember })
            });

            const data = await response.json();

            if (data.success) {
                // Store tokens
                localStorage.setItem('accessToken', data.data.tokens.accessToken);
                if (remember) {
                    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
                }

                // Store user data
                localStorage.setItem('user', JSON.stringify(data.data.user));

                this.showToast('Welcome back!', 'success');
                
                // Redirect to main app
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);

            } else {
                this.handleAuthError(data.message || 'Login failed');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.handleAuthError('Network error. Please try again.');
        } finally {
            this.setLoadingState('login', false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const form = e.target;
        const formData = new FormData(form);
        const data = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            datingEnabled: formData.get('datingEnabled') === 'on',
            terms: formData.get('terms')
        };

        // Validate form
        if (!this.validateRegisterForm(data)) return;

        this.setLoadingState('register', true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    username: data.username,
                    email: data.email,
                    password: data.password,
                    datingEnabled: data.datingEnabled
                })
            });

            const result = await response.json();

            if (result.success) {
                // Store tokens
                localStorage.setItem('accessToken', result.data.tokens.accessToken);
                localStorage.setItem('refreshToken', result.data.tokens.refreshToken);
                localStorage.setItem('user', JSON.stringify(result.data.user));

                this.showToast('Account created successfully! Welcome to Lynk!', 'success');
                
                // Redirect to main app
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);

            } else {
                if (result.errors && Array.isArray(result.errors)) {
                    result.errors.forEach(error => {
                        this.showFieldError(error.path, error.msg);
                    });
                } else {
                    this.handleAuthError(result.message || 'Registration failed');
                }
            }

        } catch (error) {
            console.error('Registration error:', error);
            this.handleAuthError('Network error. Please try again.');
        } finally {
            this.setLoadingState('register', false);
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const form = e.target;
        const formData = new FormData(form);
        const email = formData.get('email');

        if (!email || !this.validateEmail(form.querySelector('input[type="email"]'))) return;

        this.setLoadingState('forgot', true);

        try {
            // Simulate API call for forgot password
            await new Promise(resolve => setTimeout(resolve, 2000));

            this.showToast('Password reset link sent to your email!', 'success');
            setTimeout(() => {
                this.switchForm('login');
            }, 2000);

        } catch (error) {
            console.error('Forgot password error:', error);
            this.handleAuthError('Failed to send reset email. Please try again.');
        } finally {
            this.setLoadingState('forgot', false);
        }
    }

    async handleSocialLogin(provider) {
        this.showToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon!`, 'warning');
    }

    validateLoginForm(email, password) {
        let isValid = true;

        if (!email) {
            this.showFieldError('login-email', 'Email is required');
            isValid = false;
        }

        if (!password) {
            this.showFieldError('login-password', 'Password is required');
            isValid = false;
        }

        return isValid;
    }

    validateRegisterForm(data) {
        let isValid = true;

        if (!data.firstName) {
            this.showFieldError('register-firstname', 'First name is required');
            isValid = false;
        }

        if (!data.lastName) {
            this.showFieldError('register-lastname', 'Last name is required');
            isValid = false;
        }

        if (!data.username) {
            this.showFieldError('register-username', 'Username is required');
            isValid = false;
        }

        if (!data.email) {
            this.showFieldError('register-email', 'Email is required');
            isValid = false;
        }

        if (!data.password) {
            this.showFieldError('register-password', 'Password is required');
            isValid = false;
        } else if (data.password.length < 6) {
            this.showFieldError('register-password', 'Password must be at least 6 characters');
            isValid = false;
        }

        if (data.password !== data.confirmPassword) {
            this.showFieldError('register-confirm-password', 'Passwords do not match');
            isValid = false;
        }

        if (!data.terms) {
            this.showFieldError('terms', 'You must agree to the Terms of Service');
            isValid = false;
        }

        return isValid;
    }

    showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });
    }

    handleAuthError(message) {
        this.showToast(message, 'error');
    }

    setLoadingState(formType, isLoading) {
        this.isLoading = isLoading;
        const button = document.getElementById(`${formType}-btn`);
        const btnText = button?.querySelector('.btn-text');
        const btnLoader = button?.querySelector('.btn-loader');

        if (button) {
            button.disabled = isLoading;
        }

        if (btnText && btnLoader) {
            if (isLoading) {
                btnText.style.opacity = '0';
                btnLoader.style.display = 'block';
            } else {
                btnText.style.opacity = '1';
                btnLoader.style.display = 'none';
            }
        }
    }

    addFormAnimations() {
        // Add entrance animations to form elements
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            form.classList.add('fade-in');
        });

        // Add floating animation to logo
        const logo = document.querySelector('.animated-logo svg');
        if (logo) {
            logo.style.animation = 'logoFloat 3s ease-in-out infinite';
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const toastId = `toast-${Date.now()}`;
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-title">${this.getToastTitle(type)}</span>
                <button class="toast-close" onclick="authManager.closeToast('${toastId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="toast-message">${message}</div>
        `;
        toast.id = toastId;

        toastContainer.appendChild(toast);

        // Show toast with animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Auto remove toast after 5 seconds
        setTimeout(() => {
            this.closeToast(toastId);
        }, 5000);
    }

    closeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    }

    getToastTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        return titles[type] || 'Notification';
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// Handle browser back/forward navigation
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.form) {
        window.authManager.switchForm(e.state.form);
    }
});

// Add some utility functions for form validation
const ValidationUtils = {
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isValidUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
        return usernameRegex.test(username);
    },

    isStrongPassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongPasswordRegex.test(password);
    },

    sanitizeInput(input) {
        return input.trim().replace(/[<>]/g, '');
    }
};

// Export for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager, ValidationUtils };
}
