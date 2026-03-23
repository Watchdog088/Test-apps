/**
 * Consent Management System - Frontend
 * Professional consent system for dating app safety
 */

class ConsentManager {
    constructor() {
        this.apiBaseUrl = '/api/v1/consent';
        this.currentUser = null;
        this.consentRequests = [];
        this.mutualConsents = [];
        this.init();
    }

    async init() {
        // Get current user from session/local storage
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        
        if (this.currentUser) {
            await this.loadConsentData();
        }
    }

    async loadConsentData() {
        try {
            await Promise.all([
                this.loadConsentRequests(),
                this.loadMutualConsents()
            ]);
            this.updateUI();
        } catch (error) {
            console.error('Error loading consent data:', error);
        }
    }

    async loadConsentRequests() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/requests`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.consentRequests = data.data?.requests || [];
            }
        } catch (error) {
            console.error('Error loading consent requests:', error);
        }
    }

    async loadMutualConsents() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/agreements`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.mutualConsents = data.data?.agreements || [];
            }
        } catch (error) {
            console.error('Error loading mutual consents:', error);
        }
    }

    showConsentModal(recipientId, recipientName) {
        const modal = document.createElement('div');
        modal.className = 'consent-modal-overlay';
        modal.innerHTML = `
            <div class="consent-modal">
                <div class="consent-modal-header">
                    <h2>🤝 Consent Request</h2>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                
                <div class="consent-modal-body">
                    <div class="consent-education-section">
                        <div class="consent-info-box">
                            <h3>📚 About Consent</h3>
                            <p>Consent is an ongoing, enthusiastic agreement between all parties involved. 
                               It must be freely given, can be withdrawn at any time, and should be clear and specific.</p>
                            <button class="education-link" onclick="consentManager.showEducationModal()">
                                Learn More About Consent
                            </button>
                        </div>
                    </div>

                    <div class="consent-request-form">
                        <h3>Request from ${recipientName}</h3>
                        
                        <div class="form-group">
                            <label>Personal Message (Optional)</label>
                            <textarea id="consentMessage" placeholder="Share your thoughts or feelings..."></textarea>
                        </div>

                        <div class="form-group">
                            <label>Boundaries & Preferences</label>
                            <div class="boundaries-section">
                                <div class="boundary-item">
                                    <input type="checkbox" id="protection" />
                                    <label for="protection">Protection required</label>
                                </div>
                                <div class="boundary-item">
                                    <input type="checkbox" id="mutualTesting" />
                                    <label for="mutualTesting">Recent mutual testing</label>
                                </div>
                                <div class="boundary-item">
                                    <input type="checkbox" id="safeWord" />
                                    <label for="safeWord">Establish safe word</label>
                                </div>
                                <div class="boundary-item">
                                    <input type="checkbox" id="emergencyContact" />
                                    <label for="emergencyContact">Share emergency contact</label>
                                </div>
                                <div class="boundary-item">
                                    <input type="checkbox" id="locationSharing" />
                                    <label for="locationSharing">Location sharing</label>
                                </div>
                            </div>
                        </div>

                        <div class="safety-section" id="safetyDetails" style="display: none;">
                            <h4>Safety Details</h4>
                            <div class="form-group">
                                <label>Safe Word</label>
                                <input type="text" id="safeWordInput" placeholder="Choose a safe word" />
                            </div>
                            <div class="form-group">
                                <label>Emergency Contact</label>
                                <input type="text" id="emergencyName" placeholder="Contact name" />
                                <input type="tel" id="emergencyPhone" placeholder="Phone number" />
                                <select id="emergencyRelation">
                                    <option value="">Relationship</option>
                                    <option value="friend">Friend</option>
                                    <option value="family">Family</option>
                                    <option value="partner">Partner</option>
                                    <option value="roommate">Roommate</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="consent-actions">
                            <button class="btn-cancel" onclick="this.closest('.consent-modal-overlay').remove()">
                                Cancel
                            </button>
                            <button class="btn-send" onclick="consentManager.sendConsentRequest('${recipientId}')">
                                Send Request
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners for dynamic form updates
        modal.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const safetySection = modal.querySelector('#safetyDetails');
                const needsSafety = modal.querySelector('#safeWord').checked || 
                                   modal.querySelector('#emergencyContact').checked;
                safetySection.style.display = needsSafety ? 'block' : 'none';
            });
        });
    }

    async sendConsentRequest(recipientId) {
        try {
            const modal = document.querySelector('.consent-modal');
            const message = modal.querySelector('#consentMessage').value;
            
            // Collect boundaries
            const boundaries = [];
            const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
            checkboxes.forEach(cb => {
                boundaries.push(cb.nextElementSibling.textContent);
            });

            // Collect safety preferences
            const safetyPreferences = {
                protectionRequired: modal.querySelector('#protection').checked,
                mutualTesting: modal.querySelector('#mutualTesting').checked,
                safeWord: modal.querySelector('#safeWordInput')?.value || null,
                emergencyContact: modal.querySelector('#emergencyContact').checked ? {
                    name: modal.querySelector('#emergencyName')?.value,
                    phone: modal.querySelector('#emergencyPhone')?.value,
                    relationship: modal.querySelector('#emergencyRelation')?.value
                } : null,
                location: {
                    shareLocation: modal.querySelector('#locationSharing').checked,
                    trustedContact: null,
                    checkInTime: null
                }
            };

            const response = await fetch(`${this.apiBaseUrl}/request`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipientId,
                    message,
                    boundaries,
                    safetyPreferences
                })
            });

            if (response.ok) {
                modal.parentElement.remove();
                this.showSuccessMessage('Consent request sent successfully! 💕');
                await this.loadConsentData();
            } else {
                const error = await response.json();
                this.showErrorMessage(error.message);
            }
        } catch (error) {
            console.error('Error sending consent request:', error);
            this.showErrorMessage('Failed to send consent request');
        }
    }

    showResponseModal(request) {
        const modal = document.createElement('div');
        modal.className = 'consent-modal-overlay';
        modal.innerHTML = `
            <div class="consent-modal response-modal">
                <div class="consent-modal-header">
                    <h2>💝 Consent Request</h2>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                
                <div class="consent-modal-body">
                    <div class="request-details">
                        <div class="requester-info">
                            <img src="${request.requester.avatar || '/default-avatar.png'}" alt="${request.requester.firstName}" />
                            <h3>${request.requester.firstName} ${request.requester.lastName}</h3>
                        </div>
                        
                        ${request.message ? `
                            <div class="request-message">
                                <h4>Personal Message:</h4>
                                <p>${request.message}</p>
                            </div>
                        ` : ''}
                        
                        ${request.boundaries && request.boundaries.length > 0 ? `
                            <div class="request-boundaries">
                                <h4>Their Preferences:</h4>
                                <ul>
                                    ${request.boundaries.map(b => `<li>✓ ${b}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        <div class="expires-info">
                            <small>⏰ Expires: ${new Date(request.expiresAt).toLocaleString()}</small>
                        </div>
                    </div>

                    <div class="response-form">
                        <h3>Your Response</h3>
                        
                        <div class="form-group">
                            <label>Your Message (Optional)</label>
                            <textarea id="responseMessage" placeholder="Share your thoughts..."></textarea>
                        </div>

                        <div class="form-group">
                            <label>Your Boundaries & Preferences</label>
                            <div class="boundaries-section">
                                <div class="boundary-item">
                                    <input type="checkbox" id="respProtection" />
                                    <label for="respProtection">Protection required</label>
                                </div>
                                <div class="boundary-item">
                                    <input type="checkbox" id="respMutualTesting" />
                                    <label for="respMutualTesting">Recent mutual testing</label>
                                </div>
                                <div class="boundary-item">
                                    <input type="checkbox" id="respSafeWord" />
                                    <label for="respSafeWord">Establish safe word</label>
                                </div>
                                <div class="boundary-item">
                                    <input type="checkbox" id="respEmergencyContact" />
                                    <label for="respEmergencyContact">Share emergency contact</label>
                                </div>
                                <div class="boundary-item">
                                    <input type="checkbox" id="respLocationSharing" />
                                    <label for="respLocationSharing">Location sharing</label>
                                </div>
                            </div>
                        </div>

                        <div class="safety-section" id="respSafetyDetails" style="display: none;">
                            <h4>Safety Details</h4>
                            <div class="form-group">
                                <label>Safe Word</label>
                                <input type="text" id="respSafeWordInput" placeholder="Choose a safe word" />
                            </div>
                            <div class="form-group">
                                <label>Emergency Contact</label>
                                <input type="text" id="respEmergencyName" placeholder="Contact name" />
                                <input type="tel" id="respEmergencyPhone" placeholder="Phone number" />
                                <select id="respEmergencyRelation">
                                    <option value="">Relationship</option>
                                    <option value="friend">Friend</option>
                                    <option value="family">Family</option>
                                    <option value="partner">Partner</option>
                                    <option value="roommate">Roommate</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="consent-actions">
                            <button class="btn-decline" onclick="consentManager.respondToRequest('${request.id}', 'decline')">
                                Decline
                            </button>
                            <button class="btn-accept" onclick="consentManager.respondToRequest('${request.id}', 'accept')">
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners for dynamic form updates
        modal.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const safetySection = modal.querySelector('#respSafetyDetails');
                const needsSafety = modal.querySelector('#respSafeWord').checked || 
                                   modal.querySelector('#respEmergencyContact').checked;
                safetySection.style.display = needsSafety ? 'block' : 'none';
            });
        });
    }

    async respondToRequest(requestId, decision) {
        try {
            const modal = document.querySelector('.response-modal');
            const message = modal.querySelector('#responseMessage').value;
            
            let boundaries = [];
            let safetyPreferences = null;

            if (decision === 'accept') {
                // Collect boundaries
                const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
                checkboxes.forEach(cb => {
                    if (cb.id.startsWith('resp')) {
                        boundaries.push(cb.nextElementSibling.textContent);
                    }
                });

                // Collect safety preferences
                safetyPreferences = {
                    protectionRequired: modal.querySelector('#respProtection').checked,
                    mutualTesting: modal.querySelector('#respMutualTesting').checked,
                    safeWord: modal.querySelector('#respSafeWordInput')?.value || null,
                    emergencyContact: modal.querySelector('#respEmergencyContact').checked ? {
                        name: modal.querySelector('#respEmergencyName')?.value,
                        phone: modal.querySelector('#respEmergencyPhone')?.value,
                        relationship: modal.querySelector('#respEmergencyRelation')?.value
                    } : null,
                    location: {
                        shareLocation: modal.querySelector('#respLocationSharing').checked,
                        trustedContact: null,
                        checkInTime: null
                    }
                };
            }

            const response = await fetch(`${this.apiBaseUrl}/respond/${requestId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    decision,
                    message,
                    boundaries,
                    safetyPreferences
                })
            });

            if (response.ok) {
                modal.parentElement.remove();
                const successMsg = decision === 'accept' 
                    ? 'Consent request accepted! 💕 Mutual agreement created.'
                    : 'Response sent respectfully. 🙏';
                this.showSuccessMessage(successMsg);
                await this.loadConsentData();
            } else {
                const error = await response.json();
                this.showErrorMessage(error.message);
            }
        } catch (error) {
            console.error('Error responding to consent request:', error);
            this.showErrorMessage('Failed to respond to request');
        }
    }

    showEducationModal() {
        const modal = document.createElement('div');
        modal.className = 'consent-modal-overlay education-modal';
        modal.innerHTML = `
            <div class="consent-modal">
                <div class="consent-modal-header">
                    <h2>📚 Consent Education</h2>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                
                <div class="consent-modal-body">
                    <div class="education-content">
                        <div class="education-section">
                            <h3>🤝 Understanding Consent</h3>
                            <p>Consent is an ongoing, enthusiastic agreement between all parties involved. 
                               It must be freely given, can be withdrawn at any time, and should be clear and specific.</p>
                            <ul>
                                <li>✓ Must be freely given without pressure</li>
                                <li>✓ Can be withdrawn at any time</li>
                                <li>✓ Should be clear and enthusiastic</li>
                                <li>✓ Requires ongoing communication</li>
                            </ul>
                        </div>

                        <div class="education-section">
                            <h3>💬 Communication & Boundaries</h3>
                            <p>Open communication about boundaries, desires, and limits is essential. 
                               Discussing these topics beforehand creates a safer and more enjoyable experience for everyone.</p>
                            <ul>
                                <li>✓ Discuss boundaries before intimacy</li>
                                <li>✓ Respect all stated limits</li>
                                <li>✓ Check in regularly during encounters</li>
                                <li>✓ Create a safe space for communication</li>
                            </ul>
                        </div>

                        <div class="education-section">
                            <h3>🛡️ Safety & Protection</h3>
                            <p>Prioritizing safety includes discussing protection, testing, and having emergency contacts. 
                               Taking care of your sexual health benefits everyone involved.</p>
                            <ul>
                                <li>✓ Discuss protection methods</li>
                                <li>✓ Share recent testing results</li>
                                <li>✓ Have emergency contacts available</li>
                                <li>✓ Choose safe meeting locations</li>
                            </ul>
                        </div>

                        <div class="education-resources">
                            <h3>📖 Additional Resources</h3>
                            <div class="resource-links">
                                <a href="https://www.plannedparenthood.org/learn/sex-pleasure-and-sexual-dysfunction/sexual-consent" target="_blank">
                                    📄 What is Consent? - Planned Parenthood
                                </a>
                                <a href="https://www.loveisrespect.org/resources/what-are-sexual-boundaries/" target="_blank">
                                    📄 Setting Boundaries - Love is Respect
                                </a>
                                <a href="https://www.rainn.org/national-resources-sexual-assault-survivors-and-their-loved-ones" target="_blank">
                                    📞 Emergency Resources - RAINN
                                </a>
                                <a href="https://www.cdc.gov/std/prevention/" target="_blank">
                                    📄 Sexual Health Basics - CDC
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="education-actions">
                        <button class="btn-primary" onclick="this.closest('.consent-modal-overlay').remove()">
                            Got it, thanks!
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    updateUI() {
        this.updateConsentRequestsUI();
        this.updateMutualConsentsUI();
    }

    updateConsentRequestsUI() {
        const container = document.querySelector('.consent-requests-container');
        if (!container) return;

        const pendingRequests = this.consentRequests.filter(r => r.status === 'pending');
        
        if (pendingRequests.length === 0) {
            container.innerHTML = `
                <div class="no-requests">
                    <p>No pending consent requests</p>
                </div>
            `;
            return;
        }

        container.innerHTML = pendingRequests.map(request => `
            <div class="consent-request-card">
                <div class="request-header">
                    <img src="${request.requester.avatar || '/default-avatar.png'}" alt="${request.requester.firstName}" />
                    <div>
                        <h4>${request.requester.firstName} ${request.requester.lastName}</h4>
                        <small>Expires: ${new Date(request.expiresAt).toLocaleDateString()}</small>
                    </div>
                </div>
                
                ${request.message ? `
                    <div class="request-preview">
                        <p>${request.message.substring(0, 100)}${request.message.length > 100 ? '...' : ''}</p>
                    </div>
                ` : ''}
                
                <div class="request-actions">
                    <button class="btn-view" onclick="consentManager.showResponseModal(${JSON.stringify(request).replace(/"/g, '&quot;')})">
                        View & Respond
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateMutualConsentsUI() {
        const container = document.querySelector('.mutual-consents-container');
        if (!container) return;

        if (this.mutualConsents.length === 0) {
            container.innerHTML = `
                <div class="no-agreements">
                    <p>No active mutual consent agreements</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.mutualConsents.map(consent => {
            const partner = consent.userOne.id === this.currentUser.id ? consent.userTwo : consent.userOne;
            
            return `
                <div class="mutual-consent-card">
                    <div class="consent-header">
                        <img src="${partner.avatar || '/default-avatar.png'}" alt="${partner.firstName}" />
                        <div>
                            <h4>Agreement with ${partner.firstName}</h4>
                            <small>Created: ${new Date(consent.createdAt).toLocaleDateString()}</small>
                        </div>
                    </div>
                    
                    ${consent.agreedBoundaries.length > 0 ? `
                        <div class="agreed-boundaries">
                            <h5>Agreed Boundaries:</h5>
                            <ul>
                                ${consent.agreedBoundaries.map(b => `<li>✓ ${b}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div class="consent-actions">
                        <button class="btn-cancel-small" onclick="consentManager.cancelAgreement('${consent.id}')">
                            Cancel Agreement
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async cancelAgreement(agreementId) {
        if (!confirm('Are you sure you want to cancel this mutual consent agreement?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/cancel/${agreementId}?type=agreement`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.showSuccessMessage('Agreement cancelled successfully');
                await this.loadConsentData();
            } else {
                const error = await response.json();
                this.showErrorMessage(error.message);
            }
        } catch (error) {
            console.error('Error cancelling agreement:', error);
            this.showErrorMessage('Failed to cancel agreement');
        }
    }

    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }

    showErrorMessage(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}

// Initialize consent manager
const consentManager = new ConsentManager();

// Export for global use
window.consentManager = consentManager;
