/**
 * ConnectHub Payment Service
 * Handles Apple Pay, Google Pay, PayPal, Stripe, and Venmo integrations
 */

class PaymentService {
    constructor() {
        this.supportedMethods = {
            applePay: false,
            googlePay: false,
            paypal: true,
            stripe: true,
            venmo: true
        };
        
        this.checkPaymentSupport();
    }

    /**
     * Check which payment methods are supported
     */
    async checkPaymentSupport() {
        // Check Apple Pay support
        if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
            this.supportedMethods.applePay = true;
            console.log('✓ Apple Pay is supported');
        }

        // Check Google Pay support
        if (window.PaymentRequest) {
            try {
                const paymentRequest = new PaymentRequest(
                    [{ supportedMethods: 'https://google.com/pay' }],
                    { total: { label: 'Test', amount: { currency: 'USD', value: '0.01' } } }
                );
                const canMakePayment = await paymentRequest.canMakePayment();
                if (canMakePayment) {
                    this.supportedMethods.googlePay = true;
                    console.log('✓ Google Pay is supported');
                }
            } catch (error) {
                console.log('Google Pay not available');
            }
        }

        return this.supportedMethods;
    }

    /**
     * Process Apple Pay payment
     */
    async processApplePay(amount, description) {
        if (!this.supportedMethods.applePay) {
            throw new Error('Apple Pay is not supported on this device');
        }

        const paymentRequest = {
            countryCode: 'US',
            currencyCode: 'USD',
            supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
            merchantCapabilities: ['supports3DS'],
            total: {
                label: description || 'ConnectHub Payment',
                amount: amount.toString()
            }
        };

        try {
            const session = new ApplePaySession(3, paymentRequest);

            return new Promise((resolve, reject) => {
                session.onvalidatemerchant = async (event) => {
                    try {
                        // Validate merchant with your backend
                        const merchantSession = await this.validateApplePayMerchant(event.validationURL);
                        session.completeMerchantValidation(merchantSession);
                    } catch (error) {
                        reject(error);
                    }
                };

                session.onpaymentauthorized = async (event) => {
                    try {
                        // Process payment with your backend
                        const result = await this.processApplePayToken(event.payment);
                        
                        if (result.success) {
                            session.completePayment(ApplePaySession.STATUS_SUCCESS);
                            resolve(result);
                        } else {
                            session.completePayment(ApplePaySession.STATUS_FAILURE);
                            reject(new Error('Payment failed'));
                        }
                    } catch (error) {
                        session.completePayment(ApplePaySession.STATUS_FAILURE);
                        reject(error);
                    }
                };

                session.oncancel = () => {
                    reject(new Error('Payment cancelled by user'));
                };

                session.begin();
            });
        } catch (error) {
            console.error('Apple Pay error:', error);
            throw error;
        }
    }

    /**
     * Validate Apple Pay merchant (to be implemented with backend)
     */
    async validateApplePayMerchant(validationURL) {
        const response = await fetch(`${window.apiService.baseURL}/payments/apple-pay/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('connecthub_token')}`
            },
            body: JSON.stringify({ validationURL })
        });

        if (!response.ok) {
            throw new Error('Merchant validation failed');
        }

        return await response.json();
    }

    /**
     * Process Apple Pay token (to be implemented with backend)
     */
    async processApplePayToken(payment) {
        const response = await fetch(`${window.apiService.baseURL}/payments/apple-pay/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('connecthub_token')}`
            },
            body: JSON.stringify({ payment })
        });

        if (!response.ok) {
            throw new Error('Payment processing failed');
        }

        return await response.json();
    }

    /**
     * Process Google Pay payment
     */
    async processGooglePay(amount, description) {
        if (!this.supportedMethods.googlePay) {
            throw new Error('Google Pay is not supported on this device');
        }

        const paymentDataRequest = {
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [{
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA']
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: 'stripe',
                        gatewayMerchantId: 'your-gateway-merchant-id'
                    }
                }
            }],
            merchantInfo: {
                merchantId: 'your-merchant-id',
                merchantName: 'ConnectHub'
            },
            transactionInfo: {
                totalPriceStatus: 'FINAL',
                totalPrice: amount.toString(),
                currencyCode: 'USD',
                countryCode: 'US'
            }
        };

        try {
            const paymentsClient = new google.payments.api.PaymentsClient({ environment: 'TEST' });
            const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
            
            // Process the payment token with your backend
            return await this.processGooglePayToken(paymentData);
        } catch (error) {
            console.error('Google Pay error:', error);
            throw error;
        }
    }

    /**
     * Process Google Pay token
     */
    async processGooglePayToken(paymentData) {
        const response = await fetch(`${window.apiService.baseURL}/payments/google-pay/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('connecthub_token')}`
            },
            body: JSON.stringify({ paymentData })
        });

        if (!response.ok) {
            throw new Error('Payment processing failed');
        }

        return await response.json();
    }

    /**
     * Process PayPal payment
     */
    async processPayPal(amount, description) {
        // PayPal integration (using PayPal SDK)
        return new Promise((resolve, reject) => {
            if (window.paypal) {
                window.paypal.Buttons({
                    createOrder: (data, actions) => {
                        return actions.order.create({
                            purchase_units: [{
                                amount: {
                                    value: amount.toString()
                                },
                                description: description
                            }]
                        });
                    },
                    onApprove: async (data, actions) => {
                        const order = await actions.order.capture();
                        resolve(order);
                    },
                    onError: (err) => {
                        reject(err);
                    }
                }).render('#paypal-button-container');
            } else {
                reject(new Error('PayPal SDK not loaded'));
            }
        });
    }

    /**
     * Process Stripe payment
     */
    async processStripe(amount, description) {
        if (!window.Stripe) {
            throw new Error('Stripe SDK not loaded');
        }

        const stripe = Stripe('your-publishable-key');
        
        // Create payment intent
        const response = await fetch(`${window.apiService.baseURL}/payments/stripe/create-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('connecthub_token')}`
            },
            body: JSON.stringify({ amount, description })
        });

        const { clientSecret } = await response.json();

        // Confirm payment
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement('card'),
                billing_details: {
                    // User billing details
                }
            }
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

        return result.paymentIntent;
    }

    /**
     * Show payment options modal
     */
    showPaymentOptions(amount, description, onSuccess, onError) {
        const modal = document.createElement('div');
        modal.id = 'payment-modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;';

        const modalContent = document.createElement('div');
        modalContent.style.cssText = 'background: var(--bg-card); border-radius: 24px; padding: 2rem; width: 90%; max-width: 500px;';

        modalContent.innerHTML = `
            <h2 style="margin-bottom: 1rem;">Select Payment Method</h2>
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: var(--glass); border-radius: 12px;">
                <div style="font-size: 0.9rem; color: var(--text-secondary);">Amount to pay</div>
                <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">$${amount.toFixed(2)}</div>
                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem;">${description}</div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${this.supportedMethods.applePay ? `
                    <button id="apple-pay-btn" style="background: black; color: white; padding: 1rem; border: none; border-radius: 12px; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l-.02-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                        </svg>
                        Pay with Apple Pay
                    </button>
                ` : ''}

                ${this.supportedMethods.googlePay ? `
                    <button id="google-pay-btn" style="background: white; color: #3c4043; padding: 1rem; border: 1px solid #dadce0; border-radius: 12px; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                        </svg>
                        Pay with Google Pay
                    </button>
                ` : ''}

                <button id="paypal-btn" style="background: #0070ba; color: white; padding: 1rem; border: none; border-radius: 12px; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .924-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.782-4.463z"/>
                    </svg>
                    Pay with PayPal
                </button>

                <button id="stripe-btn" style="background: #635bff; color: white; padding: 1rem; border: none; border-radius: 12px; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    💳 Pay with Card (Stripe)
                </button>

                <button id="venmo-btn" style="background: linear-gradient(135deg, #3D95CE 0%, #008CFF 100%); color: white; padding: 1rem; border: none; border-radius: 12px; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    💙 Pay with Venmo
                </button>

                <button id="cancel-btn" style="background: var(--glass); color: var(--text-primary); padding: 1rem; border: 1px solid var(--glass-border); border-radius: 12px; font-size: 1rem; cursor: pointer;">
                    Cancel
                </button>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Event listeners
        const applePayBtn = document.getElementById('apple-pay-btn');
        if (applePayBtn) {
            applePayBtn.onclick = async () => {
                try {
                    const result = await this.processApplePay(amount, description);
                    modal.remove();
                    if (onSuccess) onSuccess(result);
                } catch (error) {
                    if (onError) onError(error);
                }
            };
        }

        const googlePayBtn = document.getElementById('google-pay-btn');
        if (googlePayBtn) {
            googlePayBtn.onclick = async () => {
                try {
                    const result = await this.processGooglePay(amount, description);
                    modal.remove();
                    if (onSuccess) onSuccess(result);
                } catch (error) {
                    if (onError) onError(error);
                }
            };
        }

        document.getElementById('paypal-btn').onclick = async () => {
            try {
                const result = await this.processPayPal(amount, description);
                modal.remove();
                if (onSuccess) onSuccess(result);
            } catch (error) {
                if (onError) onError(error);
            }
        };

        document.getElementById('stripe-btn').onclick = async () => {
            try {
                const result = await this.processStripe(amount, description);
                modal.remove();
                if (onSuccess) onSuccess(result);
            } catch (error) {
                if (onError) onError(error);
            }
        };

        document.getElementById('venmo-btn').onclick = () => {
            modal.remove();
            if (window.showToast) {
                window.showToast('Opening Venmo payment...', 'info');
            }
        };

        document.getElementById('cancel-btn').onclick = () => {
            modal.remove();
            if (onError) onError(new Error('Payment cancelled'));
        };

        // Click outside to close
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                if (onError) onError(new Error('Payment cancelled'));
            }
        };
    }

    /**
     * Get supported payment methods
     */
    getSupportedMethods() {
        return this.supportedMethods;
    }
}

// Create and export global instance
const paymentService = new PaymentService();
window.paymentService = paymentService;

export default paymentService;
