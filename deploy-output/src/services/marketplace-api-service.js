/**
 * ConnectHub Marketplace API Service
 * Complete backend integration for all 17 marketplace features
 * Connects to backend API endpoints for full e-commerce functionality
 */

class MarketplaceAPIService {
    constructor() {
        this.baseURL = process.env.REACT_APP_API_URL || 'https://api.connecthub.com/v1';
        this.marketplaceURL = `${this.baseURL}/marketplace`;
        this.ordersURL = `${this.marketplaceURL}/orders`;
        this.productsURL = `${this.marketplaceURL}/products`;
        this.cartURL = `${this.marketplaceURL}/cart`;
        this.paymentsURL = `${this.marketplaceURL}/payments`;
        this.sellersURL = `${this.marketplaceURL}/sellers`;
        this.reviewsURL = `${this.marketplaceURL}/reviews`;
        this.disputesURL = `${this.marketplaceURL}/disputes`;
        this.returnsURL = `${this.marketplaceURL}/returns`;
        this.shippingURL = `${this.marketplaceURL}/shipping`;
        this.analyticsURL = `${this.marketplaceURL}/analytics`;
    }

    // ==================== PRODUCT MANAGEMENT ====================
    
    /**
     * Get all products with filters
     */
    async getProducts(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters);
            const response = await fetch(`${this.productsURL}?${queryParams}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get products error:', error);
            throw error;
        }
    }

    /**
     * Get product by ID
     */
    async getProductById(productId) {
        try {
            const response = await fetch(`${this.productsURL}/${productId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get product error:', error);
            throw error;
        }
    }

    /**
     * Create new product listing
     */
    async createProduct(productData) {
        try {
            const response = await fetch(this.productsURL, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(productData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Create product error:', error);
            throw error;
        }
    }

    /**
     * Update product
     */
    async updateProduct(productId, productData) {
        try {
            const response = await fetch(`${this.productsURL}/${productId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(productData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Update product error:', error);
            throw error;
        }
    }

    /**
     * Delete product
     */
    async deleteProduct(productId) {
        try {
            const response = await fetch(`${this.productsURL}/${productId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Delete product error:', error);
            throw error;
        }
    }

    /**
     * Search products
     */
    async searchProducts(query, filters = {}) {
        try {
            const searchParams = { q: query, ...filters };
            const queryParams = new URLSearchParams(searchParams);
            const response = await fetch(`${this.productsURL}/search?${queryParams}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Search products error:', error);
            throw error;
        }
    }

    // ==================== CART MANAGEMENT ====================
    
    /**
     * Get user's cart
     */
    async getCart() {
        try {
            const response = await fetch(this.cartURL, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get cart error:', error);
            throw error;
        }
    }

    /**
     * Add item to cart
     */
    async addToCart(productId, quantity = 1, variations = {}) {
        try {
            const response = await fetch(`${this.cartURL}/items`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ productId, quantity, variations })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Add to cart error:', error);
            throw error;
        }
    }

    /**
     * Update cart item quantity
     */
    async updateCartItem(itemId, quantity) {
        try {
            const response = await fetch(`${this.cartURL}/items/${itemId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ quantity })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Update cart item error:', error);
            throw error;
        }
    }

    /**
     * Remove item from cart
     */
    async removeFromCart(itemId) {
        try {
            const response = await fetch(`${this.cartURL}/items/${itemId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Remove from cart error:', error);
            throw error;
        }
    }

    /**
     * Clear cart
     */
    async clearCart() {
        try {
            const response = await fetch(this.cartURL, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Clear cart error:', error);
            throw error;
        }
    }

    // ==================== ORDER MANAGEMENT ====================
    
    /**
     * Create order from cart
     */
    async createOrder(orderData) {
        try {
            const response = await fetch(this.ordersURL, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(orderData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Create order error:', error);
            throw error;
        }
    }

    /**
     * Get user's orders
     */
    async getOrders(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters);
            const response = await fetch(`${this.ordersURL}?${queryParams}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get orders error:', error);
            throw error;
        }
    }

    /**
     * Get order by ID
     */
    async getOrderById(orderId) {
        try {
            const response = await fetch(`${this.ordersURL}/${orderId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get order error:', error);
            throw error;
        }
    }

    /**
     * Track order
     */
    async trackOrder(orderId) {
        try {
            const response = await fetch(`${this.ordersURL}/${orderId}/tracking`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Track order error:', error);
            throw error;
        }
    }

    /**
     * Cancel order
     */
    async cancelOrder(orderId, reason) {
        try {
            const response = await fetch(`${this.ordersURL}/${orderId}/cancel`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ reason })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Cancel order error:', error);
            throw error;
        }
    }

    // ==================== PAYMENT PROCESSING ====================
    
    /**
     * Process payment
     */
    async processPayment(paymentData) {
        try {
            const response = await fetch(`${this.paymentsURL}/process`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(paymentData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Process payment error:', error);
            throw error;
        }
    }

    /**
     * Get payment methods
     */
    async getPaymentMethods() {
        try {
            const response = await fetch(`${this.paymentsURL}/methods`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get payment methods error:', error);
            throw error;
        }
    }

    /**
     * Add payment method
     */
    async addPaymentMethod(methodData) {
        try {
            const response = await fetch(`${this.paymentsURL}/methods`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(methodData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Add payment method error:', error);
            throw error;
        }
    }

    /**
     * Calculate marketplace fees
     */
    async calculateFees(orderData) {
        try {
            const response = await fetch(`${this.paymentsURL}/calculate-fees`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(orderData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Calculate fees error:', error);
            throw error;
        }
    }

    // ==================== SELLER MANAGEMENT ====================
    
    /**
     * Get seller profile
     */
    async getSellerProfile(sellerId) {
        try {
            const response = await fetch(`${this.sellersURL}/${sellerId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get seller profile error:', error);
            throw error;
        }
    }

    /**
     * Rate seller
     */
    async rateSeller(sellerId, rating, comment) {
        try {
            const response = await fetch(`${this.sellersURL}/${sellerId}/ratings`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ rating, comment })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Rate seller error:', error);
            throw error;
        }
    }

    /**
     * Get seller ratings
     */
    async getSellerRatings(sellerId) {
        try {
            const response = await fetch(`${this.sellersURL}/${sellerId}/ratings`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get seller ratings error:', error);
            throw error;
        }
    }

    /**
     * Apply seller protection
     */
    async applySellerProtection(orderId) {
        try {
            const response = await fetch(`${this.sellersURL}/protection/apply`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ orderId })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Apply seller protection error:', error);
            throw error;
        }
    }

    // ==================== REVIEWS ====================
    
    /**
     * Add product review
     */
    async addProductReview(productId, reviewData) {
        try {
            const response = await fetch(`${this.reviewsURL}/products/${productId}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(reviewData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Add product review error:', error);
            throw error;
        }
    }

    /**
     * Get product reviews
     */
    async getProductReviews(productId, filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters);
            const response = await fetch(`${this.reviewsURL}/products/${productId}?${queryParams}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get product reviews error:', error);
            throw error;
        }
    }

    /**
     * Update review
     */
    async updateReview(reviewId, reviewData) {
        try {
            const response = await fetch(`${this.reviewsURL}/${reviewId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(reviewData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Update review error:', error);
            throw error;
        }
    }

    /**
     * Delete review
     */
    async deleteReview(reviewId) {
        try {
            const response = await fetch(`${this.reviewsURL}/${reviewId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Delete review error:', error);
            throw error;
        }
    }

    // ==================== SHIPPING ====================
    
    /**
     * Calculate shipping cost
     */
    async calculateShipping(shippingData) {
        try {
            const response = await fetch(`${this.shippingURL}/calculate`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(shippingData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Calculate shipping error:', error);
            throw error;
        }
    }

    /**
     * Get shipping options
     */
    async getShippingOptions(destination) {
        try {
            const response = await fetch(`${this.shippingURL}/options`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ destination })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get shipping options error:', error);
            throw error;
        }
    }

    // ==================== DISPUTES ====================
    
    /**
     * Open dispute
     */
    async openDispute(disputeData) {
        try {
            const response = await fetch(this.disputesURL, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(disputeData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Open dispute error:', error);
            throw error;
        }
    }

    /**
     * Get disputes
     */
    async getDisputes(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters);
            const response = await fetch(`${this.disputesURL}?${queryParams}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get disputes error:', error);
            throw error;
        }
    }

    /**
     * Resolve dispute
     */
    async resolveDispute(disputeId, resolution) {
        try {
            const response = await fetch(`${this.disputesURL}/${disputeId}/resolve`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ resolution })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Resolve dispute error:', error);
            throw error;
        }
    }

    // ==================== RETURNS & REFUNDS ====================
    
    /**
     * Request return
     */
    async requestReturn(returnData) {
        try {
            const response = await fetch(this.returnsURL, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(returnData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Request return error:', error);
            throw error;
        }
    }

    /**
     * Get returns
     */
    async getReturns(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters);
            const response = await fetch(`${this.returnsURL}?${queryParams}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get returns error:', error);
            throw error;
        }
    }

    /**
     * Approve return
     */
    async approveReturn(returnId) {
        try {
            const response = await fetch(`${this.returnsURL}/${returnId}/approve`, {
                method: 'POST',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Approve return error:', error);
            throw error;
        }
    }

    /**
     * Process refund
     */
    async processRefund(returnId, refundData) {
        try {
            const response = await fetch(`${this.returnsURL}/${returnId}/refund`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(refundData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Process refund error:', error);
            throw error;
        }
    }

    // ==================== INVENTORY ====================
    
    /**
     * Update inventory
     */
    async updateInventory(productId, quantity) {
        try {
            const response = await fetch(`${this.productsURL}/${productId}/inventory`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ quantity })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Update inventory error:', error);
            throw error;
        }
    }

    /**
     * Get inventory status
     */
    async getInventoryStatus(productId) {
        try {
            const response = await fetch(`${this.productsURL}/${productId}/inventory`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get inventory status error:', error);
            throw error;
        }
    }

    // ==================== ANALYTICS ====================
    
    /**
     * Get sales analytics
     */
    async getSalesAnalytics(sellerId, period = 'month') {
        try {
            const response = await fetch(`${this.analyticsURL}/sellers/${sellerId}/sales?period=${period}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get sales analytics error:', error);
            throw error;
        }
    }

    /**
     * Get product performance
     */
    async getProductPerformance(productId) {
        try {
            const response = await fetch(`${this.analyticsURL}/products/${productId}/performance`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get product performance error:', error);
            throw error;
        }
    }

    /**
     * Get marketplace insights
     */
    async getMarketplaceInsights() {
        try {
            const response = await fetch(`${this.analyticsURL}/insights`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get marketplace insights error:', error);
            throw error;
        }
    }

    // ==================== WISHLIST ====================
    
    /**
     * Get wishlist
     */
    async getWishlist() {
        try {
            const response = await fetch(`${this.marketplaceURL}/wishlist`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get wishlist error:', error);
            throw error;
        }
    }

    /**
     * Add to wishlist
     */
    async addToWishlist(productId) {
        try {
            const response = await fetch(`${this.marketplaceURL}/wishlist`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ productId })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Add to wishlist error:', error);
            throw error;
        }
    }

    /**
     * Remove from wishlist
     */
    async removeFromWishlist(productId) {
        try {
            const response = await fetch(`${this.marketplaceURL}/wishlist/${productId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Remove from wishlist error:', error);
            throw error;
        }
    }

    // ==================== BUYER PROTECTION ====================
    
    /**
     * Apply buyer protection
     */
    async applyBuyerProtection(orderId) {
        try {
            const response = await fetch(`${this.marketplaceURL}/buyer-protection/apply`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ orderId })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Apply buyer protection error:', error);
            throw error;
        }
    }

    /**
     * Get buyer protection status
     */
    async getBuyerProtectionStatus(orderId) {
        try {
            const response = await fetch(`${this.marketplaceURL}/buyer-protection/${orderId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get buyer protection status error:', error);
            throw error;
        }
    }

    // ==================== NOTIFICATIONS ====================
    
    /**
     * Get marketplace notifications
     */
    async getNotifications() {
        try {
            const response = await fetch(`${this.marketplaceURL}/notifications`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get notifications error:', error);
            throw error;
        }
    }

    /**
     * Mark notification as read
     */
    async markNotificationRead(notificationId) {
        try {
            const response = await fetch(`${this.marketplaceURL}/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Mark notification read error:', error);
            throw error;
        }
    }

    // ==================== HELPER METHODS ====================
    
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const token = localStorage.getItem('auth_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    /**
     * Upload product images
     */
    async uploadProductImages(productId, images) {
        try {
            const formData = new FormData();
            images.forEach((image, index) => {
                formData.append(`image${index}`, image);
            });

            const response = await fetch(`${this.productsURL}/${productId}/images`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: formData
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Upload product images error:', error);
            throw error;
        }
    }
}

// Export singleton instance
const marketplaceAPIService = new MarketplaceAPIService();
export default marketplaceAPIService;

// Also export for use in window scope
if (typeof window !== 'undefined') {
    window.marketplaceAPIService = marketplaceAPIService;
}
