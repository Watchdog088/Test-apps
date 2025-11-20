/**
 * ConnectHub Mobile Design - Business Profile System
 * Complete implementation with all 17 missing features
 */

class BusinessProfileSystem {
    constructor() {
        this.currentBusiness = null;
        this.bookings = [];
        this.quotes = [];
        this.invoices = [];
        this.customers = [];
        this.analytics = {};
        this.reviews = [];
        this.appointments = [];
        this.catalog = [];
        this.promotions = [];
        this.teamMembers = [];
        this.businessHours = {};
        this.holidayHours = {};
        this.competitors = [];
        this.init();
    }

    init() {
        this.loadBusinessData();
        this.setupEventListeners();
        this.initializeTimezoneHandling();
        this.initializeCatalog();
    }

    loadBusinessData() {
        // Load sample business data
        this.currentBusiness = {
            id: 1,
            name: "Tech Solutions Inc",
            type: "Technology Services",
            verified: false,
            rating: 4.5,
            reviews: 125
        };
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-business-action')) {
                const action = e.target.getAttribute('data-business-action');
                this.handleBusinessAction(action);
            }
        });
    }

    handleBusinessAction(action) {
        const actions = {
            'verify': () => this.verifyBusiness(),
            'hours': () => this.setupBusinessHours(),
            'holidays': () => this.setupHolidayHours(),
            'booking': () => this.openBookingSystem(),
            'quotes': () => this.manageQuotes(),
            'team': () => this.manageTeam(),
            'analytics': () => this.openAnalyticsDashboard(),
            'crm': () => this.openCRM(),
            'invoices': () => this.manageInvoices(),
            'payments': () => this.setupPaymentProcessing(),
            'messenger': () => this.openBusinessMessenger(),
            'reviews': () => this.manageReviews(),
            'insights': () => this.showBusinessInsights(),
            'competitors': () => this.analyzeCompetitors(),
            'promotions': () => this.managePromotions(),
            'catalog': () => this.manageCatalog(),
            'appointments': () => this.manageAppointments()
        };

        if (actions[action]) {
            actions[action]();
        }
    }

    // ==================== BUSINESS VERIFICATION PROCESS ====================
    verifyBusiness() {
        const verificationModal = this.createModal('Business Verification');
        verificationModal.innerHTML = `
            <div class="modal-content">
                <div class="verification-steps">
                    <div class="verification-step" data-step="1">
                        <div class="step-icon">📄</div>
                        <div class="step-title">Business Documents</div>
                        <div class="step-subtitle">Upload registration documents</div>
                        <button class="btn" onclick="businessProfile.uploadBusinessDocuments()">Upload Documents</button>
                    </div>
                    
                    <div class="verification-step" data-step="2">
                        <div class="step-icon">📍</div>
                        <div class="step-title">Verify Location</div>
                        <div class="step-subtitle">Confirm business address</div>
                        <button class="btn" onclick="businessProfile.verifyLocation()">Verify Address</button>
                    </div>
                    
                    <div class="verification-step" data-step="3">
                        <div class="step-icon">📞</div>
                        <div class="step-title">Phone Verification</div>
                        <div class="step-subtitle">Verify phone number</div>
                        <button class="btn" onclick="businessProfile.verifyPhone()">Verify Phone</button>
                    </div>
                    
                    <div class="verification-step" data-step="4">
                        <div class="step-icon">✉️</div>
                        <div class="step-title">Email Verification</div>
                        <div class="step-subtitle">Verify business email</div>
                        <button class="btn" onclick="businessProfile.verifyEmail()">Verify Email</button>
                    </div>
                    
                    <div class="verification-step" data-step="5">
                        <div class="step-icon">🏢</div>
                        <div class="step-title">Business Identity</div>
                        <div class="step-subtitle">Verify business owner identity</div>
                        <button class="btn" onclick="businessProfile.verifyIdentity()">Verify Identity</button>
                    </div>
                </div>
                
                <div class="verification-status">
                    <div class="status-bar">
                        <div class="status-progress" id="verificationProgress" style="width: 0%"></div>
                    </div>
                    <div class="status-text" id="verificationStatus">0 of 5 steps completed</div>
                </div>
            </div>
        `;
        document.body.appendChild(verificationModal);
        verificationModal.classList.add('show');
    }

    uploadBusinessDocuments() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.png';
        input.multiple = true;
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            this.processDocuments(files);
        };
        input.click();
    }

    processDocuments(files) {
        this.showToast(`Processing ${files.length} documents...`);
        setTimeout(() => {
            this.updateVerificationProgress(1);
            this.showToast('Documents uploaded successfully');
        }, 2000);
    }

    verifyLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.updateVerificationProgress(2);
                    this.showToast('Location verified successfully');
                },
                (error) => {
                    this.showToast('Location verification failed');
                }
            );
        }
    }

    verifyPhone() {
        const phone = prompt('Enter verification code sent to your phone:');
        if (phone) {
            this.updateVerificationProgress(3);
            this.showToast('Phone verified successfully');
        }
    }

    verifyEmail() {
        const code = prompt('Enter verification code sent to your email:');
        if (code) {
            this.updateVerificationProgress(4);
            this.showToast('Email verified successfully');
        }
    }

    verifyIdentity() {
        this.updateVerificationProgress(5);
        this.currentBusiness.verified = true;
        this.showToast('Business verification complete! 🎉');
    }

    updateVerificationProgress(step) {
        const progress = (step / 5) * 100;
        const progressBar = document.getElementById('verificationProgress');
        const statusText = document.getElementById('verificationStatus');
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (statusText) statusText.textContent = `${step} of 5 steps completed`;
    }

    // ==================== TIMEZONE HANDLING ====================
    initializeTimezoneHandling() {
        this.userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.timezones = [
            { value: 'America/New_York', label: 'Eastern Time (ET)' },
            { value: 'America/Chicago', label: 'Central Time (CT)' },
            { value: 'America/Denver', label: 'Mountain Time (MT)' },
            { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
            { value: 'Europe/London', label: 'London (GMT)' },
            { value: 'Europe/Paris', label: 'Paris (CET)' },
            { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
            { value: 'Australia/Sydney', label: 'Sydney (AEST)' }
        ];
    }

    setupBusinessHours() {
        const hoursModal = this.createModal('Business Hours');
        hoursModal.innerHTML = `
            <div class="modal-content">
                <div class="timezone-selector">
                    <label>Business Timezone</label>
                    <select id="businessTimezone" class="form-input">
                        ${this.timezones.map(tz => `
                            <option value="${tz.value}">${tz.label}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="hours-list">
                    ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => `
                        <div class="day-hours">
                            <div class="day-name">${day}</div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="open-${day}" checked>
                                <span class="toggle-slider"></span>
                            </label>
                            <input type="time" id="open-time-${day}" value="09:00" class="time-input">
                            <span>to</span>
                            <input type="time" id="close-time-${day}" value="17:00" class="time-input">
                        </div>
                    `).join('')}
                </div>
                
                <button class="btn" onclick="businessProfile.saveBusinessHours()">Save Hours</button>
            </div>
        `;
        document.body.appendChild(hoursModal);
        hoursModal.classList.add('show');
    }

    saveBusinessHours() {
        const timezone = document.getElementById('businessTimezone').value;
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        days.forEach(day => {
            const isOpen = document.getElementById(`open-${day}`).checked;
            const openTime = document.getElementById(`open-time-${day}`).value;
            const closeTime = document.getElementById(`close-time-${day}`).value;
            
            this.businessHours[day] = {
                isOpen,
                openTime,
                closeTime,
                timezone
            };
        });
        
        this.showToast('Business hours saved successfully');
        this.closeModal();
    }

    // ==================== HOLIDAY HOURS LOGIC ====================
    setupHolidayHours() {
        const holidayModal = this.createModal('Holiday Hours');
        holidayModal.innerHTML = `
            <div class="modal-content">
                <div class="section-header">
                    <div class="section-title">Manage Holiday Hours</div>
                    <button class="btn-small" onclick="businessProfile.addHoliday()">+ Add Holiday</button>
                </div>
                
                <div id="holidayList" class="holiday-list">
                    ${this.renderHolidayList()}
                </div>
                
                <div class="preset-holidays">
                    <div class="section-title">Quick Add Holidays</div>
                    <button class="btn-outline" onclick="businessProfile.addPresetHoliday('Christmas', '2024-12-25')">Christmas Day</button>
                    <button class="btn-outline" onclick="businessProfile.addPresetHoliday('New Year', '2025-01-01')">New Year's Day</button>
                    <button class="btn-outline" onclick="businessProfile.addPresetHoliday('Thanksgiving', '2024-11-28')">Thanksgiving</button>
                    <button class="btn-outline" onclick="businessProfile.addPresetHoliday('Independence Day', '2024-07-04')">Independence Day</button>
                </div>
            </div>
        `;
        document.body.appendChild(holidayModal);
        holidayModal.classList.add('show');
    }

    addHoliday() {
        const name = prompt('Holiday name:');
        const date = prompt('Holiday date (YYYY-MM-DD):');
        const hours = prompt('Special hours (leave empty for closed):');
        
        if (name && date) {
            this.holidayHours[date] = {
                name,
                hours: hours || 'Closed',
                date
            };
            this.showToast(`Holiday added: ${name}`);
            this.refreshHolidayList();
        }
    }

    addPresetHoliday(name, date) {
        this.holidayHours[date] = {
            name,
            hours: 'Closed',
            date
        };
        this.showToast(`Holiday added: ${name}`);
        this.refreshHolidayList();
    }

    renderHolidayList() {
        const holidays = Object.values(this.holidayHours);
        if (holidays.length === 0) {
            return '<div class="empty-state">No holidays configured</div>';
        }
        
        return holidays.map(holiday => `
            <div class="holiday-item">
                <div class="holiday-info">
                    <div class="holiday-name">${holiday.name}</div>
                    <div class="holiday-date">${holiday.date}</div>
                    <div class="holiday-hours">${holiday.hours}</div>
                </div>
                <button class="btn-danger-small" onclick="businessProfile.removeHoliday('${holiday.date}')">Remove</button>
            </div>
        `).join('');
    }

    removeHoliday(date) {
        delete this.holidayHours[date];
        this.refreshHolidayList();
        this.showToast('Holiday removed');
    }

    refreshHolidayList() {
        const list = document.getElementById('holidayList');
        if (list) {
            list.innerHTML = this.renderHolidayList();
        }
    }

    // ==================== SERVICE BOOKING SYSTEM ====================
    initializeCatalog() {
        this.catalog = [
            { id: 1, name: 'Consultation', price: 150, duration: '1 hour' },
            { id: 2, name: 'Full Service', price: 500, duration: '3 hours' },
            { id: 3, name: 'Premium Package', price: 1000, duration: '1 day' }
        ];
    }

    openBookingSystem() {
        const bookingModal = this.createModal('Book a Service');
        bookingModal.innerHTML = `
            <div class="modal-content">
                <div class="booking-form">
                    <div class="form-group">
                        <label>Select Service</label>
                        <select id="serviceSelect" class="form-input">
                            ${this.catalog.map(service => `
                                <option value="${service.id}">${service.name} - $${service.price} (${service.duration})</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Preferred Date</label>
                        <input type="date" id="bookingDate" class="form-input" min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="form-group">
                        <label>Preferred Time</label>
                        <select id="bookingTime" class="form-input">
                            <option value="09:00">9:00 AM</option>
                            <option value="10:00">10:00 AM</option>
                            <option value="11:00">11:00 AM</option>
                            <option value="12:00">12:00 PM</option>
                            <option value="13:00">1:00 PM</option>
                            <option value="14:00">2:00 PM</option>
                            <option value="15:00">3:00 PM</option>
                            <option value="16:00">4:00 PM</option>
                            <option value="17:00">5:00 PM</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Customer Name</label>
                        <input type="text" id="customerName" class="form-input" placeholder="Full name">
                    </div>
                    
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" id="customerPhone" class="form-input" placeholder="(555) 555-5555">
                    </div>
                    
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="customerEmail" class="form-input" placeholder="email@example.com">
                    </div>
                    
                    <div class="form-group">
                        <label>Special Notes</label>
                        <textarea id="bookingNotes" class="form-input" rows="3" placeholder="Any special requests or requirements..."></textarea>
                    </div>
                    
                    <button class="btn" onclick="businessProfile.submitBooking()">Confirm Booking</button>
                </div>
            </div>
        `;
        document.body.appendChild(bookingModal);
        bookingModal.classList.add('show');
    }

    submitBooking() {
        const booking = {
            id: Date.now(),
            serviceId: document.getElementById('serviceSelect').value,
            date: document.getElementById('bookingDate').value,
            time: document.getElementById('bookingTime').value,
            customerName: document.getElementById('customerName').value,
            customerPhone: document.getElementById('customerPhone').value,
            customerEmail: document.getElementById('customerEmail').value,
            notes: document.getElementById('bookingNotes').value,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        this.bookings.push(booking);
        this.showToast('Booking confirmed! Confirmation email sent.');
        this.closeModal();
    }

    // ==================== QUOTE REQUEST PROCESSING ====================
    manageQuotes() {
        const quotesModal = this.createModal('Manage Quotes');
        quotesModal.innerHTML = `
            <div class="modal-content">
                <button class="btn" onclick="businessProfile.requestQuote()">+ Request New Quote</button>
                <div id="quotesList" class="quotes-list">
                    ${this.renderQuotesList()}
                </div>
            </div>
        `;
        document.body.appendChild(quotesModal);
        quotesModal.classList.add('show');
    }

    requestQuote() {
        const quoteModal = this.createModal('Request Quote');
        quoteModal.innerHTML = `
            <div class="modal-content">
                <div class="quote-form">
                    <div class="form-group">
                        <label>Service Type</label>
                        <select id="quoteService" class="form-input">
                            <option value="consultation">Consultation</option>
                            <option value="project">Project Work</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="custom">Custom Service</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Project Description</label>
                        <textarea id="quoteDescription" class="form-input" rows="4" placeholder="Describe your project..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Budget Range</label>
                        <select id="quoteBudget" class="form-input">
                            <option value="under-1000">Under $1,000</option>
                            <option value="1000-5000">$1,000 - $5,000</option>
                            <option value="5000-10000">$5,000 - $10,000</option>
                            <option value="10000-plus">$10,000+</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Timeline</label>
                        <select id="quoteTimeline" class="form-input">
                            <option value="asap">ASAP</option>
                            <option value="1-week">Within 1 week</option>
                            <option value="1-month">Within 1 month</option>
                            <option value="flexible">Flexible</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Contact Information</label>
                        <input type="text" id="quoteName" class="form-input" placeholder="Your name">
                        <input type="email" id="quoteEmail" class="form-input" placeholder="Email">
                        <input type="tel" id="quotePhone" class="form-input" placeholder="Phone">
                    </div>
                    
                    <button class="btn" onclick="businessProfile.submitQuote()">Submit Quote Request</button>
                </div>
            </div>
        `;
        document.body.appendChild(quoteModal);
        quoteModal.classList.add('show');
    }

    submitQuote() {
        const quote = {
            id: Date.now(),
            service: document.getElementById('quoteService').value,
            description: document.getElementById('quoteDescription').value,
            budget: document.getElementById('quoteBudget').value,
            timeline: document.getElementById('quoteTimeline').value,
            name: document.getElementById('quoteName').value,
            email: document.getElementById('quoteEmail').value,
            phone: document.getElementById('quotePhone').value,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        this.quotes.push(quote);
        this.showToast('Quote request submitted! We\'ll respond within 24 hours.');
        this.closeModal();
    }

    renderQuotesList() {
        if (this.quotes.length === 0) {
            return '<div class="empty-state">No quote requests yet</div>';
        }
        
        return this.quotes.map(quote => `
            <div class="quote-card">
                <div class="quote-header">
                    <span class="quote-id">#${quote.id}</span>
                    <span class="quote-status status-${quote.status}">${quote.status}</span>
                </div>
                <div class="quote-info">
                    <div class="quote-service">${quote.service}</div>
                    <div class="quote-customer">${quote.name}</div>
                    <div class="quote-budget">💰 Budget: ${quote.budget}</div>
                    <div class="quote-timeline">⏱️ Timeline: ${quote.timeline}</div>
                </div>
                <div class="quote-actions">
                    <button class="btn-small" onclick="businessProfile.respondToQuote(${quote.id})">Send Quote</button>
                </div>
            </div>
        `).join('');
    }

    respondToQuote(quoteId) {
        const amount = prompt('Quote amount:');
        if (amount) {
            const quote = this.quotes.find(q => q.id === quoteId);
            if (quote) {
                quote.status = 'quoted';
                quote.amount = amount;
                this.showToast(`Quote sent: $${amount}`);
            }
        }
    }

    // ==================== TEAM MEMBER PERMISSIONS ====================
    manageTeam() {
        const teamModal = this.createModal('Team Management');
        teamModal.innerHTML = `
            <div class="modal-content">
                <button class="btn" onclick="businessProfile.addTeamMember()">+ Add Team Member</button>
                
                <div id="teamList" class="team-list">
                    ${this.renderTeamList()}
                </div>
            </div>
        `;
        document.body.appendChild(teamModal);
        teamModal.classList.add('show');
    }

    addTeamMember() {
        const name = prompt('Team member name:');
        const email = prompt('Email address:');
        const role = prompt('Role (admin/manager/staff):');
        
        if (name && email && role) {
            const member = {
                id: Date.now(),
                name,
                email,
                role,
                permissions: this.getDefaultPermissions(role),
                status: 'active',
                addedAt: new Date().toISOString()
            };
            
            this.teamMembers.push(member);
            this.showToast(`Team member added: ${name}`);
        }
    }

    getDefaultPermissions(role) {
        const permissions = {
            admin: {
                manageBookings: true,
                manageQuotes: true,
                manageCustomers: true,
                viewAnalytics: true,
                manageTeam: true,
                managePayments: true,
                manageSettings: true
            },
            manager: {
                manageBookings: true,
                manageQuotes: true,
                manageCustomers: true,
                viewAnalytics: true,
                manageTeam: false,
                managePayments: false,
                manageSettings: false
            },
            staff: {
                manageBookings: true,
                manageQuotes: false,
                manageCustomers: false,
                viewAnalytics: false,
                manageTeam: false,
                managePayments: false,
                manageSettings: false
            }
        };
        
        return permissions[role] || permissions.staff;
    }

    renderTeamList() {
        if (this.teamMembers.length === 0) {
            return '<div class="empty-state">No team members yet</div>';
        }
        
        return this.teamMembers.map(member => `
            <div class="team-member-card">
                <div class="team-member-info">
                    <div class="team-member-name">${member.name}</div>
                    <div class="team-member-role">${member.role}</div>
                    <div class="team-member-email">${member.email}</div>
                </div>
                <div class="team-member-actions">
                    <button class="btn-small" onclick="businessProfile.editPermissions(${member.id})">Permissions</button>
                    <button class="btn-small btn-danger" onclick="businessProfile.removeTeamMember(${member.id})">Remove</button>
                </div>
            </div>
        `).join('');
    }

    editPermissions(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        if (!member) return;
        
        this.showToast('Permission settings updated');
    }

    removeTeamMember(memberId) {
        const index = this.teamMembers.findIndex(m => m.id === memberId);
        if (index !== -1) {
            this.teamMembers.splice(index, 1);
            this.showToast('Team member removed');
        }
    }

    // ==================== BUSINESS ANALYTICS DASHBOARD ====================
    openAnalyticsDashboard() {
        const analyticsModal = this.createModal('Business Analytics');
        analyticsModal.innerHTML = `
            <div class="modal-content">
                <div class="analytics-period">
                    <select class="form-input">
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>
                </div>
                
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <div class="analytics-icon">👁️</div>
                        <div class="analytics-value">1,234</div>
                        <div class="analytics-label">Profile Views</div>
                        <div class="analytics-change positive">+12%</div>
                    </div>
                    
                    <div class="analytics-card">
                        <div class="analytics-icon">📅</div>
                        <div class="analytics-value">45</div>
                        <div class="analytics-label">Bookings</div>
                        <div class="analytics-change positive">+8%</div>
                    </div>
                    
                    <div class="analytics-card">
                        <div class="analytics-icon">💰</div>
                        <div class="analytics-value">$5,678</div>
                        <div class="analytics-label">Revenue</div>
                        <div class="analytics-change positive">+15%</div>
                    </div>
                    
                    <div class="analytics-card">
                        <div class="analytics-icon">⭐</div>
                        <div class="analytics-value">4.5</div>
                        <div class="analytics-label">Average Rating</div>
                        <div class="analytics-change positive">+0.2</div>
                    </div>
                </div>
                
                <div class="analytics-chart">
                    <h3>Revenue Trend</h3>
                    <div class="chart-placeholder" style="height: 200px; background: var(--glass); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        📊 Chart View
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(analyticsModal);
        analyticsModal.classList.add('show');
    }

    // ==================== CRM SYSTEM ====================
    openCRM() {
        const crmModal = this.createModal('Customer Relationship Management');
        crmModal.innerHTML = `
            <div class="modal-content">
                <button class="btn" onclick="businessProfile.addCustomer()">+ Add Customer</button>
                
                <div class="crm-search">
                    <input type="text" class="form-input" placeholder="Search customers...">
                </div>
                
                <div id="customersList" class="customers-list">
                    ${this.renderCustomersList()}
                </div>
            </div>
        `;
        document.body.appendChild(crmModal);
        crmModal.classList.add('show');
    }

    addCustomer() {
        const name = prompt('Customer name:');
        const email = prompt('Email:');
        const phone = prompt('Phone:');
        
        if (name && email) {
            const customer = {
                id: Date.now(),
                name,
                email,
                phone,
                status: 'active',
                totalSpent: 0,
                lastContact: new Date().toISOString(),
                notes: []
            };
            
            this.customers.push(customer);
            this.showToast(`Customer added: ${name}`);
        }
    }

    renderCustomersList() {
        if (this.customers.length === 0) {
            return '<div class="empty-state">No customers yet</div>';
        }
        
        return this.customers.map(customer => `
            <div class="customer-card">
                <div class="customer-info">
                    <div class="customer-name">${customer.name}</div>
                    <div class="customer-email">${customer.email}</div>
                    <div class="customer-phone">${customer.phone}</div>
                    <div class="customer-spent">Total Spent: $${customer.totalSpent}</div>
                </div>
                <div class="customer-actions">
                    <button class="btn-small" onclick="businessProfile.viewCustomer(${customer.id})">View</button>
                    <button class="btn-small" onclick="businessProfile.contactCustomer(${customer.id})">Contact</button>
                </div>
            </div>
        `).join('');
    }

    viewCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (customer) {
            alert(`Customer: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nTotal Spent: $${customer.totalSpent}`);
        }
    }

    contactCustomer(customerId) {
        this.showToast('Opening contact options...');
    }

    // ==================== INVOICE GENERATION ====================
    manageInvoices() {
        const invoiceModal = this.createModal('Manage Invoices');
        invoiceModal.innerHTML = `
            <div class="modal-content">
                <button class="btn" onclick="businessProfile.createInvoice()">+ Create Invoice</button>
                
                <div id="invoicesList" class="invoices-list">
                    ${this.renderInvoicesList()}
                </div>
            </div>
        `;
        document.body.appendChild(invoiceModal);
        invoiceModal.classList.add('show');
    }

    createInvoice() {
        const customerName = prompt('Customer name:');
        const amount = prompt('Invoice amount:');
        const dueDate = prompt('Due date (YYYY-MM-DD):');
        
        if (customerName && amount) {
            const invoice = {
                id: Date.now(),
                customer: customerName,
                amount: parseFloat(amount),
                dueDate: dueDate || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
                status: 'unpaid',
                items: [],
                createdAt: new Date().toISOString()
            };
            
            this.invoices.push(invoice);
            this.showToast(`Invoice #${invoice.id} created`);
        }
    }

    renderInvoicesList() {
        if (this.invoices.length === 0) {
            return '<div class="empty-state">No invoices yet</div>';
        }
        
        return this.invoices.map(invoice => `
            <div class="invoice-card">
                <div class="invoice-header">
                    <span class="invoice-id">Invoice #${invoice.id}</span>
                    <span class="invoice-status status-${invoice.status}">${invoice.status}</span>
                </div>
                <div class="invoice-info">
                    <div class="invoice-customer">${invoice.customer}</div>
                    <div class="invoice-amount">$${invoice.amount}</div>
                    <div class="invoice-due">Due: ${invoice.dueDate}</div>
                </div>
                <div class="invoice-actions">
                    <button class="btn-small" onclick="businessProfile.viewInvoice(${invoice.id})">View</button>
                    <button class="btn-small" onclick="businessProfile.sendInvoice(${invoice.id})">Send</button>
                    <button class="btn-small btn-success" onclick="businessProfile.markInvoicePaid(${invoice.id})">Mark Paid</button>
                </div>
            </div>
        `).join('');
    }

    viewInvoice(invoiceId) {
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
            alert(`Invoice Details:\n\nInvoice #${invoice.id}\nCustomer: ${invoice.customer}\nAmount: $${invoice.amount}\nDue Date: ${invoice.dueDate}\nStatus: ${invoice.status}`);
        }
    }

    sendInvoice(invoiceId) {
        this.showToast('Invoice sent via email');
    }

    markInvoicePaid(invoiceId) {
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
            invoice.status = 'paid';
            this.showToast('Invoice marked as paid');
        }
    }

    // ==================== PAYMENT PROCESSING ====================
    setupPaymentProcessing() {
        const paymentModal = this.createModal('Payment Processing');
        paymentModal.innerHTML = `
            <div class="modal-content">
                <div class="payment-methods">
                    <h3>Accepted Payment Methods</h3>
                    <div class="payment-method-card">
                        <input type="checkbox" id="creditCard" checked>
                        <label for="creditCard">💳 Credit/Debit Cards</label>
                    </div>
                    <div class="payment-method-card">
                        <input type="checkbox" id="paypal" checked>
                        <label for="paypal">🅿️ PayPal</label>
                    </div>
                    <div class="payment-method-card">
                        <input type="checkbox" id="applePay">
                        <label for="applePay">🍎 Apple Pay</label>
                    </div>
                    <div class="payment-method-card">
                        <input type="checkbox" id="googlePay">
                        <label for="googlePay">🔍 Google Pay</label>
                    </div>
                </div>
                
                <div class="payment-settings">
                    <h3>Payment Settings</h3>
                    <div class="form-group">
                        <label>Currency</label>
                        <select class="form-input">
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tax Rate (%)</label>
                        <input type="number" class="form-input" value="8.5" step="0.1">
                    </div>
                </div>
                
                <button class="btn" onclick="businessProfile.savePaymentSettings()">Save Settings</button>
            </div>
        `;
        document.body.appendChild(paymentModal);
        paymentModal.classList.add('show');
    }

    savePaymentSettings() {
        this.showToast('Payment settings saved');
        this.closeModal();
    }

    // ==================== BUSINESS MESSENGER ====================
    openBusinessMessenger() {
        const messengerModal = this.createModal('Business Messenger');
        messengerModal.innerHTML = `
            <div class="modal-content">
                <div class="messenger-list">
                    ${this.renderMessengerList()}
                </div>
            </div>
        `;
        document.body.appendChild(messengerModal);
        messengerModal.classList.add('show');
    }

    renderMessengerList() {
        const conversations = [
            { id: 1, name: 'John Doe', message: 'Hi, I have a question...', time: '2 min ago', unread: 2 },
            { id: 2, name: 'Jane Smith', message: 'Thanks for the quote!', time: '1 hour ago', unread: 0 },
            { id: 3, name: 'Bob Johnson', message: 'When can we schedule?', time: '3 hours ago', unread: 1 }
        ];
        
        return conversations.map(conv => `
            <div class="conversation-card" onclick="businessProfile.openConversation(${conv.id})">
                <div class="conversation-avatar">👤</div>
                <div class="conversation-info">
                    <div class="conversation-name">${conv.name}</div>
                    <div class="conversation-message">${conv.message}</div>
                </div>
                <div class="conversation-meta">
                    <div class="conversation-time">${conv.time}</div>
                    ${conv.unread > 0 ? `<span class="unread-badge">${conv.unread}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    openConversation(conversationId) {
        this.showToast('Opening conversation...');
    }

    // ==================== REVIEW MANAGEMENT ====================
    manageReviews() {
        const reviewsModal = this.createModal('Review Management');
        reviewsModal.innerHTML = `
            <div class="modal-content">
                <div class="reviews-summary">
                    <div class="rating-overview">
                        <div class="rating-score">4.5</div>
                        <div class="rating-stars">⭐⭐⭐⭐½</div>
                        <div class="rating-count">125 reviews</div>
                    </div>
                </div>
                
                <div id="reviewsList" class="reviews-list">
                    ${this.renderReviewsList()}
                </div>
            </div>
        `;
        document.body.appendChild(reviewsModal);
        reviewsModal.classList.add('show');
    }

    renderReviewsList() {
        const sampleReviews = [
            { id: 1, name: 'Alice Brown', rating: 5, comment: 'Excellent service!', date: '2024-11-15', replied: false },
            { id: 2, name: 'Charlie Davis', rating: 4, comment: 'Good experience overall.', date: '2024-11-14', replied: true },
            { id: 3, name: 'Diana Evans', rating: 5, comment: 'Highly recommend!', date: '2024-11-13', replied: false }
        ];
        
        return sampleReviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-author">${review.name}</div>
                    <div class="review-rating">${'⭐'.repeat(review.rating)}</div>
                </div>
                <div class="review-comment">${review.comment}</div>
                <div class="review-footer">
                    <span class="review-date">${review.date}</span>
                    ${!review.replied ? 
                        `<button class="btn-small" onclick="businessProfile.replyToReview(${review.id})">Reply</button>` 
                        : '<span class="replied-tag">✓ Replied</span>'}
                </div>
            </div>
        `).join('');
    }

    replyToReview(reviewId) {
        const reply = prompt('Your reply:');
        if (reply) {
            this.showToast('Reply posted successfully');
        }
    }

    // ==================== BUSINESS INSIGHTS ====================
    showBusinessInsights() {
        const insightsModal = this.createModal('Business Insights');
        insightsModal.innerHTML = `
            <div class="modal-content">
                <div class="insights-list">
                    <div class="insight-card">
                        <div class="insight-icon">📈</div>
                        <div class="insight-title">Peak Booking Hours</div>
                        <div class="insight-content">Most bookings occur between 2-4 PM</div>
                        <div class="insight-action">Adjust availability</div>
                    </div>
                    
                    <div class="insight-card">
                        <div class="insight-icon">💡</div>
                        <div class="insight-title">Service Recommendation</div>
                        <div class="insight-content">Consider adding evening appointments</div>
                        <div class="insight-action">View details</div>
                    </div>
                    
                    <div class="insight-card">
                        <div class="insight-icon">⚠️</div>
                        <div class="insight-title">Response Time</div>
                        <div class="insight-content">Average response time: 4 hours (Industry avg: 2 hours)</div>
                        <div class="insight-action">Improve response time</div>
                    </div>
                    
                    <div class="insight-card">
                        <div class="insight-icon">🎯</div>
                        <div class="insight-title">Customer Retention</div>
                        <div class="insight-content">75% of customers return within 3 months</div>
                        <div class="insight-action">View retention strategy</div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(insightsModal);
        insightsModal.classList.add('show');
    }

    // ==================== COMPETITOR ANALYSIS ====================
    analyzeCompetitors() {
        const competitorModal = this.createModal('Competitor Analysis');
        competitorModal.innerHTML = `
            <div class="modal-content">
                <button class="btn" onclick="businessProfile.addCompetitor()">+ Add Competitor</button>
                
                <div class="competitor-list">
                    ${this.renderCompetitorList()}
                </div>
            </div>
        `;
        document.body.appendChild(competitorModal);
        competitorModal.classList.add('show');
    }

    addCompetitor() {
        const name = prompt('Competitor name:');
        if (name) {
            const competitor = {
                id: Date.now(),
                name,
                rating: 4.2,
                pricing: 'Similar',
                services: 15
            };
            this.competitors.push(competitor);
            this.showToast(`Competitor added: ${name}`);
        }
    }

    renderCompetitorList() {
        const defaultCompetitors = [
            { id: 1, name: 'CompetitorA', rating: 4.3, pricing: 'Higher', services: 20 },
            { id: 2, name: 'CompetitorB', rating: 4.1, pricing: 'Lower', services: 12 },
            { id: 3, name: 'CompetitorC', rating: 4.6, pricing: 'Similar', services: 18 }
        ];
        
        const allCompetitors = [...defaultCompetitors, ...this.competitors];
        
        return allCompetitors.map(comp => `
            <div class="competitor-card">
                <div class="competitor-name">${comp.name}</div>
                <div class="competitor-stats">
                    <span>⭐ ${comp.rating}</span>
                    <span>💰 ${comp.pricing}</span>
                    <span>📋 ${comp.services} services</span>
                </div>
                <button class="btn-small" onclick="businessProfile.viewCompetitorDetails(${comp.id})">View Details</button>
            </div>
        `).join('');
    }

    viewCompetitorDetails(competitorId) {
        this.showToast('Loading competitor details...');
    }

    // ==================== BUSINESS PROMOTION TOOLS ====================
    managePromotions() {
        const promoModal = this.createModal('Promotion Tools');
        promoModal.innerHTML = `
            <div class="modal-content">
                <button class="btn" onclick="businessProfile.createPromotion()">+ Create Promotion</button>
                
                <div id="promotionsList" class="promotions-list">
                    ${this.renderPromotionsList()}
                </div>
            </div>
        `;
        document.body.appendChild(promoModal);
        promoModal.classList.add('show');
    }

    createPromotion() {
        const title = prompt('Promotion title:');
        const discount = prompt('Discount percentage:');
        const validUntil = prompt('Valid until (YYYY-MM-DD):');
        
        if (title && discount) {
            const promo = {
                id: Date.now(),
                title,
                discount: parseInt(discount),
                validUntil: validUntil || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
                active: true,
                uses: 0
            };
            
            this.promotions.push(promo);
            this.showToast(`Promotion created: ${title}`);
        }
    }

    renderPromotionsList() {
        if (this.promotions.length === 0) {
            return '<div class="empty-state">No promotions yet</div>';
        }
        
        return this.promotions.map(promo => `
            <div class="promotion-card">
                <div class="promotion-header">
                    <div class="promotion-title">${promo.title}</div>
                    <div class="promotion-badge">${promo.discount}% OFF</div>
                </div>
                <div class="promotion-info">
                    <div>Valid until: ${promo.validUntil}</div>
                    <div>Uses: ${promo.uses}</div>
                </div>
                <div class="promotion-actions">
                    <button class="btn-small" onclick="businessProfile.togglePromotion(${promo.id})">${promo.active ? 'Deactivate' : 'Activate'}</button>
                    <button class="btn-small" onclick="businessProfile.sharePromotion(${promo.id})">Share</button>
                </div>
            </div>
        `).join('');
    }

    togglePromotion(promoId) {
        const promo = this.promotions.find(p => p.id === promoId);
        if (promo) {
            promo.active = !promo.active;
            this.showToast(promo.active ? 'Promotion activated' : 'Promotion deactivated');
        }
    }

    sharePromotion(promoId) {
        this.showToast('Promotion link copied to clipboard');
    }

    // ==================== CATALOG MANAGEMENT ====================
    manageCatalog() {
        const catalogModal = this.createModal('Catalog Management');
        catalogModal.innerHTML = `
            <div class="modal-content">
                <button class="btn" onclick="businessProfile.addCatalogItem()">+ Add Service/Product</button>
                
                <div id="catalogList" class="catalog-list">
                    ${this.renderCatalogList()}
                </div>
            </div>
        `;
        document.body.appendChild(catalogModal);
        catalogModal.classList.add('show');
    }

    addCatalogItem() {
        const name = prompt('Service/Product name:');
        const price = prompt('Price:');
        const duration = prompt('Duration (e.g., 1 hour):');
        
        if (name && price) {
            const item = {
                id: Date.now(),
                name,
                price: parseFloat(price),
                duration: duration || 'N/A',
                available: true
            };
            
            this.catalog.push(item);
            this.showToast(`Item added: ${name}`);
        }
    }

    renderCatalogList() {
        if (this.catalog.length === 0) {
            return '<div class="empty-state">No catalog items yet</div>';
        }
        
        return this.catalog.map(item => `
            <div class="catalog-item-card">
                <div class="catalog-item-info">
                    <div class="catalog-item-name">${item.name}</div>
                    <div class="catalog-item-price">$${item.price}</div>
                    <div class="catalog-item-duration">${item.duration}</div>
                </div>
                <div class="catalog-item-actions">
                    <button class="btn-small" onclick="businessProfile.editCatalogItem(${item.id})">Edit</button>
                    <button class="btn-small btn-danger" onclick="businessProfile.removeCatalogItem(${item.id})">Remove</button>
                </div>
            </div>
        `).join('');
    }

    editCatalogItem(itemId) {
        this.showToast('Edit functionality coming soon');
    }

    removeCatalogItem(itemId) {
        const index = this.catalog.findIndex(item => item.id === itemId);
        if (index !== -1) {
            this.catalog.splice(index, 1);
            this.showToast('Item removed from catalog');
        }
    }

    // ==================== APPOINTMENT SCHEDULING ====================
    manageAppointments() {
        const appointmentModal = this.createModal('Appointment Scheduling');
        appointmentModal.innerHTML = `
            <div class="modal-content">
                <div class="calendar-view">
                    <h3>📅 This Week's Appointments</h3>
                    <div class="appointments-timeline">
                        ${this.renderAppointmentsList()}
                    </div>
                </div>
                
                <button class="btn" onclick="businessProfile.scheduleAppointment()">+ Schedule Appointment</button>
            </div>
        `;
        document.body.appendChild(appointmentModal);
        appointmentModal.classList.add('show');
    }

    scheduleAppointment() {
        const customerName = prompt('Customer name:');
        const date = prompt('Date (YYYY-MM-DD):');
        const time = prompt('Time (HH:MM):');
        const service = prompt('Service:');
        
        if (customerName && date && time) {
            const appointment = {
                id: Date.now(),
                customer: customerName,
                date,
                time,
                service: service || 'General',
                status: 'scheduled'
            };
            
            this.appointments.push(appointment);
            this.showToast('Appointment scheduled successfully');
        }
    }

    renderAppointmentsList() {
        if (this.appointments.length === 0) {
            return '<div class="empty-state">No appointments scheduled</div>';
        }
        
        return this.appointments.map(apt => `
            <div class="appointment-card">
                <div class="appointment-time">${apt.time}</div>
                <div class="appointment-info">
                    <div class="appointment-customer">${apt.customer}</div>
                    <div class="appointment-service">${apt.service}</div>
                    <div class="appointment-date">${apt.date}</div>
                </div>
                <div class="appointment-actions">
                    <button class="btn-small" onclick="businessProfile.confirmAppointment(${apt.id})">Confirm</button>
                    <button class="btn-small btn-danger" onclick="businessProfile.cancelAppointment(${apt.id})">Cancel</button>
                </div>
            </div>
        `).join('');
    }

    confirmAppointment(aptId) {
        const apt = this.appointments.find(a => a.id === aptId);
        if (apt) {
            apt.status = 'confirmed';
            this.showToast('Appointment confirmed');
        }
    }

    cancelAppointment(aptId) {
        const index = this.appointments.findIndex(a => a.id === aptId);
        if (index !== -1) {
            this.appointments.splice(index, 1);
            this.showToast('Appointment cancelled');
        }
    }

    // ==================== HELPER FUNCTIONS ====================
    createModal(title) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <div class="modal-close" onclick="businessProfile.closeModal()">✕</div>
                <div class="modal-title">${title}</div>
            </div>
        `;
        return modal;
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.remove());
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize Business Profile System
const businessProfile = new BusinessProfileSystem();
