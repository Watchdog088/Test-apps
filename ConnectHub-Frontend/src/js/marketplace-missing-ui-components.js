// Marketplace Missing UI Components
// 6 Advanced UI Interfaces for Complete Marketplace Experience

class MarketplaceMissingUIComponents {
    constructor() {
        this.currentProduct = null;
        this.cart = JSON.parse(localStorage.getItem('connecthub_cart') || '[]');
        this.wishlist = JSON.parse(localStorage.getItem('connecthub_wishlist') || '[]');
        this.orders = JSON.parse(localStorage.getItem('connecthub_orders') || '[]');
        this.init();
    }

    init() {
        // Update cart count on initialization
        this.updateCartCount();
        // Initialize sample data if empty
        if (this.orders.length === 0) {
            this.initializeSampleData();
        }
    }

    initializeSampleData() {
        // Sample orders data
        this.orders = [
            {
                id: 'ORDER-001',
                date: '2024-01-15',
                status: 'Delivered',
                total: 299.99,
                items: [
                    { name: 'iPhone Case', quantity: 1, price: 29.99, image: '📱' },
                    { name: 'Bluetooth Headphones', quantity: 1, price: 179.99, image: '🎧' },
                    { name: 'USB Cable', quantity: 2, price: 15.99, image: '🔌' }
                ],
                seller: 'TechStore',
                tracking: 'TRK123456789'
            },
            {
                id: 'ORDER-002',
                date: '2024-01-20',
                status: 'In Transit',
                total: 89.99,
                items: [
                    { name: 'Wireless Mouse', quantity: 1, price: 49.99, image: '🖱️' },
                    { name: 'Mouse Pad', quantity: 1, price: 19.99, image: '📄' }
                ],
                seller: 'OfficeSupplies',
                tracking: 'TRK987654321'
            }
        ];
        localStorage.setItem('connecthub_orders', JSON.stringify(this.orders));
    }

    // 1. Advanced Product Viewer/Details Modal
    showAdvancedProductViewer(productId = 1) {
        // Sample product data
        const product = {
            id: productId,
            name: 'iPhone 15 Pro Max',
            price: 1199.99,
            originalPrice: 1299.99,
            discount: 8,
            rating: 4.8,
            reviews: 1247,
            seller: 'Apple Store Official',
            sellerRating: 4.9,
            condition: 'Brand New',
            category: 'Electronics > Smartphones',
            description: 'The most powerful iPhone ever with the latest A17 Pro chip, titanium design, and advanced camera system with 5x optical zoom.',
            features: [
                'A17 Pro chip with 6-core GPU',
                'Pro camera system with 5x optical zoom',
                'Titanium design with aerospace-grade alloy',
                'All-Day battery life up to 29 hours video playback',
                'iOS 17 with advanced AI features'
            ],
            specifications: {
                'Display': '6.7" Super Retina XDR OLED',
                'Storage': '256GB, 512GB, 1TB',
                'RAM': '8GB',
                'Camera': '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
                'Battery': '4422 mAh',
                'Colors': 'Natural Titanium, Blue Titanium, White Titanium, Black Titanium'
            },
            images: ['📱', '📷', '⚡', '🔋', '💎'],
            availability: 'In Stock',
            shipping: {
                free: true,
                estimatedDays: '2-3 business days',
                expedited: '$15.99 - Next day delivery'
            },
            warranty: '1 Year Apple Limited Warranty + AppleCare+ available'
        };

        const modal = this.createModal('advancedProductViewer', 'Product Details', () => {
            this.closeModal('advancedProductViewer');
        });

        modal.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; max-height: 70vh; overflow-y: auto;">
                <!-- Product Images Section -->
                <div>
                    <div style="background: var(--glass); border-radius: 20px; padding: 2rem; text-align: center; margin-bottom: 1rem;">
                        <div style="font-size: 8rem; margin-bottom: 1rem;" role="img" aria-label="Product image">${product.images[0]}</div>
                        <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem;">
                            ${product.images.map((img, index) => `
                                <div style="width: 60px; height: 60px; background: var(--bg-card); border: 2px solid ${index === 0 ? 'var(--primary)' : 'var(--glass-border)'}; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 2rem; cursor: pointer;" 
                                     onclick="this.parentElement.previousElementSibling.innerHTML = '${img}'; this.parentElement.querySelectorAll('div').forEach(d => d.style.border = '2px solid var(--glass-border)'); this.style.border = '2px solid var(--primary)';">${img}</div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- 360° View Button -->
                    <button class="btn btn-secondary" style="width: 100%; margin-bottom: 1rem;" onclick="marketplaceMissingUI.show360View('${product.id}')">
                        🔄 360° View
                    </button>

                    <!-- AR Try-On Button -->
                    <button class="btn btn-primary" style="width: 100%;" onclick="marketplaceMissingUI.tryARMode('${product.id}')">
                        📱 Try with AR
                    </button>
                </div>

                <!-- Product Details Section -->
                <div>
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="background: var(--success); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">BESTSELLER</span>
                            <span style="color: var(--text-muted); font-size: 0.9rem;">${product.category}</span>
                        </div>
                        <h2 style="margin-bottom: 0.5rem;">${product.name}</h2>
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <div style="display: flex; align-items: center; gap: 0.25rem;">
                                <span style="color: var(--warning);">⭐⭐⭐⭐⭐</span>
                                <span style="font-weight: 600;">${product.rating}</span>
                                <span style="color: var(--text-muted);">(${product.reviews} reviews)</span>
                            </div>
                        </div>
                    </div>

                    <!-- Price Section -->
                    <div style="background: var(--glass); padding: 1.5rem; border-radius: 16px; margin-bottom: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <div style="font-size: 2rem; font-weight: 800; color: var(--primary);">$${product.price}</div>
                            <div style="text-decoration: line-through; color: var(--text-muted); font-size: 1.2rem;">$${product.originalPrice}</div>
                            <div style="background: var(--error); color: white; padding: 0.25rem 0.5rem; border-radius: 20px; font-size: 0.8rem;">-${product.discount}%</div>
                        </div>
                        <div style="color: var(--success); font-weight: 600;">✅ ${product.availability}</div>
                    </div>

                    <!-- Seller Information -->
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--glass); border-radius: 12px; margin-bottom: 1.5rem;">
                        <div style="width: 50px; height: 50px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white;">🏪</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">${product.seller}</div>
                            <div style="display: flex; align-items: center; gap: 0.25rem; color: var(--text-secondary);">
                                <span style="color: var(--warning);">⭐</span>
                                <span>${product.sellerRating} seller rating</span>
                            </div>
                        </div>
                        <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.viewSellerProfile('${product.seller}')">
                            View Store
                        </button>
                    </div>

                    <!-- Variant Selection -->
                    <div style="margin-bottom: 1.5rem;">
                        <div style="font-weight: 600; margin-bottom: 0.75rem;">Storage:</div>
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                            <button class="btn btn-secondary btn-small variant-btn active" data-variant="256GB" onclick="marketplaceMissingUI.selectVariant(this, '256GB', 1199.99)">256GB</button>
                            <button class="btn btn-secondary btn-small variant-btn" data-variant="512GB" onclick="marketplaceMissingUI.selectVariant(this, '512GB', 1299.99)">512GB</button>
                            <button class="btn btn-secondary btn-small variant-btn" data-variant="1TB" onclick="marketplaceMissingUI.selectVariant(this, '1TB', 1499.99)">1TB</button>
                        </div>
                        <div style="font-weight: 600; margin-bottom: 0.75rem;">Color:</div>
                        <div style="display: flex; gap: 0.5rem;">
                            <div style="width: 40px; height: 40px; background: #8B7355; border-radius: 50%; border: 3px solid var(--primary); cursor: pointer;" title="Natural Titanium"></div>
                            <div style="width: 40px; height: 40px; background: #4A6CF7; border-radius: 50%; border: 2px solid var(--glass-border); cursor: pointer;" title="Blue Titanium"></div>
                            <div style="width: 40px; height: 40px; background: #E5E5E7; border-radius: 50%; border: 2px solid var(--glass-border); cursor: pointer;" title="White Titanium"></div>
                            <div style="width: 40px; height: 40px; background: #1D1D1F; border-radius: 50%; border: 2px solid var(--glass-border); cursor: pointer;" title="Black Titanium"></div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                        <button class="btn btn-primary" style="flex: 1;" onclick="marketplaceMissingUI.buyNowAdvanced('${product.id}')">
                            🛒 Buy Now - $${product.price}
                        </button>
                        <button class="btn btn-secondary" onclick="marketplaceMissingUI.addToCartAdvanced('${product.id}')">
                            ➕ Cart
                        </button>
                        <button class="btn btn-secondary" onclick="marketplaceMissingUI.toggleWishlist('${product.id}', '${product.name}')">
                            ${this.isInWishlist(product.id) ? '❤️' : '🤍'}
                        </button>
                    </div>

                    <!-- Shipping Information -->
                    <div style="background: var(--glass); padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
                        <div style="font-weight: 600; margin-bottom: 0.5rem;">📦 Shipping Information</div>
                        <div style="color: var(--success); margin-bottom: 0.25rem;">✅ FREE shipping - ${product.shipping.estimatedDays}</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">⚡ ${product.shipping.expedited}</div>
                    </div>

                    <!-- Warranty -->
                    <div style="background: var(--glass); padding: 1rem; border-radius: 12px;">
                        <div style="font-weight: 600; margin-bottom: 0.5rem;">🛡️ Warranty</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">${product.warranty}</div>
                    </div>
                </div>
            </div>

            <!-- Product Details Tabs -->
            <div style="margin-top: 2rem;">
                <div style="display: flex; border-bottom: 1px solid var(--glass-border); margin-bottom: 1rem;">
                    <button class="product-tab active" data-tab="description" onclick="marketplaceMissingUI.switchProductTab(this, 'description')" style="padding: 0.75rem 1.5rem; border: none; background: none; color: var(--text-primary); cursor: pointer; border-bottom: 2px solid var(--primary);">Description</button>
                    <button class="product-tab" data-tab="specifications" onclick="marketplaceMissingUI.switchProductTab(this, 'specifications')" style="padding: 0.75rem 1.5rem; border: none; background: none; color: var(--text-secondary); cursor: pointer; border-bottom: 2px solid transparent;">Specifications</button>
                    <button class="product-tab" data-tab="reviews" onclick="marketplaceMissingUI.switchProductTab(this, 'reviews')" style="padding: 0.75rem 1.5rem; border: none; background: none; color: var(--text-secondary); cursor: pointer; border-bottom: 2px solid transparent;">Reviews (${product.reviews})</button>
                </div>

                <div class="tab-content active" data-content="description">
                    <p style="line-height: 1.6; margin-bottom: 1rem;">${product.description}</p>
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">Key Features:</div>
                    <ul style="list-style: none; padding: 0;">
                        ${product.features.map(feature => `<li style="margin-bottom: 0.5rem; padding-left: 1rem; position: relative;"><span style="position: absolute; left: 0; color: var(--success);">✅</span>${feature}</li>`).join('')}
                    </ul>
                </div>

                <div class="tab-content" data-content="specifications" style="display: none;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        ${Object.entries(product.specifications).map(([key, value]) => `
                            <div style="background: var(--glass); padding: 1rem; border-radius: 12px;">
                                <div style="font-weight: 600; color: var(--primary); margin-bottom: 0.5rem;">${key}</div>
                                <div style="color: var(--text-secondary);">${value}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="tab-content" data-content="reviews" style="display: none;">
                    <div style="margin-bottom: 2rem;">
                        <div style="display: flex; align-items: center; gap: 2rem; margin-bottom: 1rem;">
                            <div style="text-align: center;">
                                <div style="font-size: 3rem; font-weight: 800; color: var(--primary);">${product.rating}</div>
                                <div style="color: var(--warning); margin-bottom: 0.25rem;">⭐⭐⭐⭐⭐</div>
                                <div style="color: var(--text-muted); font-size: 0.9rem;">${product.reviews} reviews</div>
                            </div>
                            <div style="flex: 1;">
                                ${[5,4,3,2,1].map(stars => `
                                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                        <span style="min-width: 60px;">${stars} stars</span>
                                        <div style="flex: 1; height: 8px; background: var(--glass-border); border-radius: 4px; overflow: hidden;">
                                            <div style="width: ${stars === 5 ? '75%' : stars === 4 ? '15%' : stars === 3 ? '6%' : stars === 2 ? '3%' : '1%'}; height: 100%; background: var(--warning);"></div>
                                        </div>
                                        <span style="min-width: 40px; font-size: 0.9rem;">${stars === 5 ? '75%' : stars === 4 ? '15%' : stars === 3 ? '6%' : stars === 2 ? '3%' : '1%'}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sample Reviews -->
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <div style="background: var(--glass); padding: 1.5rem; border-radius: 12px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <div style="font-weight: 600;">Sarah M.</div>
                                <div style="color: var(--warning);">⭐⭐⭐⭐⭐</div>
                            </div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Verified Purchase - 2 days ago</div>
                            <div style="line-height: 1.5;">"Absolutely incredible! The camera quality is mind-blowing and the titanium build feels so premium. Battery lasts all day even with heavy usage. Definitely worth the upgrade!"</div>
                        </div>
                        
                        <div style="background: var(--glass); padding: 1.5rem; border-radius: 12px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <div style="font-weight: 600;">Mike J.</div>
                                <div style="color: var(--warning);">⭐⭐⭐⭐⭐</div>
                            </div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Verified Purchase - 1 week ago</div>
                            <div style="line-height: 1.5;">"Fast shipping, excellent packaging. The phone exceeded my expectations. The A17 Pro chip is incredibly fast for gaming and video editing."</div>
                        </div>
                        
                        <div style="background: var(--glass); padding: 1.5rem; border-radius: 12px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <div style="font-weight: 600;">Alex C.</div>
                                <div style="color: var(--warning);">⭐⭐⭐⭐⭐</div>
                            </div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Verified Purchase - 2 weeks ago</div>
                            <div style="line-height: 1.5;">"Professional photographer here - the 5x optical zoom is a game changer. Image quality is stunning even in low light. Highly recommended!"</div>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 2rem;">
                        <button class="btn btn-secondary" onclick="marketplaceMissingUI.loadMoreReviews()">Load More Reviews</button>
                    </div>
                </div>
            </div>

            <!-- Related Products -->
            <div style="margin-top: 3rem; border-top: 1px solid var(--glass-border); padding-top: 2rem;">
                <h3 style="margin-bottom: 1rem;">You May Also Like</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    ${[
                        { name: 'iPhone 15 Case', price: 49.99, image: '📱', rating: 4.6 },
                        { name: 'MagSafe Charger', price: 39.99, image: '🔌', rating: 4.7 },
                        { name: 'AirPods Pro', price: 249.99, image: '🎧', rating: 4.8 }
                    ].map(item => `
                        <div style="background: var(--glass); padding: 1rem; border-radius: 12px; text-align: center; cursor: pointer;" onclick="marketplaceMissingUI.showAdvancedProductViewer(Math.floor(Math.random() * 100))">
                            <div style="font-size: 3rem; margin-bottom: 0.5rem;">${item.image}</div>
                            <div style="font-weight: 600; margin-bottom: 0.25rem;">${item.name}</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.25rem;">⭐ ${item.rating}</div>
                            <div style="color: var(--primary); font-weight: 600;">$${item.price}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        if (typeof showToast === 'function') {
            showToast('Advanced Product Viewer opened! 🛍️', 'success');
        }
    }

    // 2. Shopping Cart Management Interface
    showShoppingCartManager() {
        const modal = this.createModal('shoppingCartManager', 'Shopping Cart', () => {
            this.closeModal('shoppingCartManager');
        });

        const cartItems = this.cart.length > 0 ? this.cart : [
            { id: 1, name: 'iPhone 15 Pro', price: 1199.99, quantity: 1, image: '📱', seller: 'Apple Store' },
            { id: 2, name: 'MacBook Air M2', price: 1299.99, quantity: 1, image: '💻', seller: 'Apple Store' },
            { id: 3, name: 'AirPods Pro', price: 249.99, quantity: 2, image: '🎧', seller: 'Audio Shop' }
        ];

        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08; // 8% tax
        const shipping = subtotal > 35 ? 0 : 9.99; // Free shipping over $35
        const total = subtotal + tax + shipping;

        modal.innerHTML = `
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; max-height: 70vh; overflow-y: auto;">
                <!-- Cart Items -->
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h3>Cart Items (${cartItems.length})</h3>
                        <button class="btn btn-error btn-small" onclick="marketplaceMissingUI.clearCart()">
                            🗑️ Clear Cart
                        </button>
                    </div>

                    <div id="cartItemsList">
                        ${cartItems.map(item => `
                            <div class="cart-item" data-id="${item.id}" style="display: flex; align-items: center; gap: 1rem; padding: 1.5rem; background: var(--glass); border-radius: 16px; margin-bottom: 1rem;">
                                <div style="width: 80px; height: 80px; background: var(--bg-card); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem;" role="img" aria-label="Product image">${item.image}</div>
                                
                                <div style="flex: 1;">
                                    <h4 style="margin-bottom: 0.5rem;">${item.name}</h4>
                                    <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Sold by ${item.seller}</div>
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <div style="font-weight: 600; color: var(--primary); font-size: 1.1rem;">$${item.price.toFixed(2)}</div>
                                        <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-card); border-radius: 8px; padding: 0.25rem;">
                                            <button style="width: 30px; height: 30px; border: none; background: var(--glass); border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;" onclick="marketplaceMissingUI.updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                                            <span style="min-width: 30px; text-align: center; font-weight: 600;">${item.quantity}</span>
                                            <button style="width: 30px; height: 30px; border: none; background: var(--primary); color: white; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;" onclick="marketplaceMissingUI.updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                                        </div>
                                    </div>
                                </div>

                                <div style="text-align: right;">
                                    <div style="font-weight: 700; font-size: 1.2rem; margin-bottom: 0.5rem;">$${(item.price * item.quantity).toFixed(2)}</div>
                                    <div style="display: flex; gap: 0.5rem;">
                                        <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.moveToWishlist('${item.id}')" title="Move to Wishlist">
                                            🤍
                                        </button>
                                        <button class="btn btn-error btn-small" onclick="marketplaceMissingUI.removeFromCart('${item.id}')" title="Remove from Cart">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Recommended Items -->
                    <div style="margin-top: 2rem; border-top: 1px solid var(--glass-border); padding-top: 1.5rem;">
                        <h4 style="margin-bottom: 1rem;">Frequently Bought Together</h4>
                        <div style="display: flex; gap: 1rem; overflow-x: auto; padding: 0.5rem 0;">
                            ${[
                                { name: 'Phone Case', price: 29.99, image: '📱' },
                                { name: 'Screen Protector', price: 19.99, image: '🛡️' },
                                { name: 'Wireless Charger', price: 49.99, image: '🔌' }
                            ].map(item => `
                                <div style="min-width: 150px; background: var(--glass); padding: 1rem; border-radius: 12px; text-align: center; cursor: pointer;" onclick="marketplaceMissingUI.addRecommendedToCart('${item.name}', ${item.price})">
                                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">${item.image}</div>
                                    <div style="font-size: 0.9rem; margin-bottom: 0.25rem;">${item.name}</div>
                                    <div style="color: var(--primary); font-weight: 600;">$${item.price}</div>
                                    <button class="btn btn-primary btn-small" style="margin-top: 0.5rem;">Add to Cart</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Order Summary -->
                <div>
                    <div style="background: var(--glass); padding: 1.5rem; border-radius: 16px; position: sticky; top: 1rem;">
                        <h3 style="margin-bottom: 1.5rem;">Order Summary</h3>
                        
                        <!-- Promo Code -->
                        <div style="margin-bottom: 1.5rem;">
                            <div style="display: flex; gap: 0.5rem;">
                                <input type="text" placeholder="Promo code" style="flex: 1; padding: 0.75rem; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-primary);" id="promoCodeInput">
                                <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.applyPromoCode()">Apply</button>
                            </div>
                            <div id="promoMessage" style="margin-top: 0.5rem; font-size: 0.9rem;"></div>
                        </div>

                        <!-- Cost Breakdown -->
                        <div style="border-top: 1px solid var(--glass-border); padding-top: 1rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>Subtotal (${cartItems.length} items):</span>
                                <span>$${subtotal.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>Tax:</span>
                                <span>$${tax.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; ${shipping === 0 ? 'color: var(--success);' : ''}">
                                <span>Shipping:</span>
                                <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
                            </div>
                            ${subtotal < 35 ? '<div style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 0.5rem;">Add $' + (35 - subtotal).toFixed(2) + ' more for free shipping</div>' : ''}
                            <div style="border-top: 1px solid var(--glass-border); padding-top: 0.5rem; display: flex; justify-content: space-between; font-weight: 700; font-size: 1.2rem;">
                                <span>Total:</span>
                                <span style="color: var(--primary);">$${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <!-- Checkout Buttons -->
                        <div style="margin-top: 1.5rem;">
                            <button class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;" onclick="marketplaceMissingUI.proceedToCheckout()">
                                🛒 Proceed to Checkout
                            </button>
                            <button class="btn btn-secondary" style="width: 100%;" onclick="marketplaceMissingUI.saveForLater()">
                                💾 Save for Later
                            </button>
                        </div>

                        <!-- Trust Badges -->
                        <div style="margin-top: 1.5rem; text-align: center; padding-top: 1rem; border-top: 1px solid var(--glass-border);">
                            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Secure Checkout</div>
                            <div style="display: flex; justify-content: center; gap: 1rem;">
                                <span title="SSL Secure">🔒</span>
                                <span title="Visa">💳</span>
                                <span title="PayPal">🅿️</span>
                                <span title="Apple Pay">📱</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recently Viewed -->
            <div style="margin-top: 2rem; border-top: 1px solid var(--glass-border); padding-top: 1.5rem;">
                <h4 style="margin-bottom: 1rem;">Recently Viewed</h4>
                <div style="display: flex; gap: 1rem; overflow-x: auto;">
                    ${[
                        { name: 'Smart Watch', price: 399.99, image: '⌚' },
                        { name: 'Gaming Mouse', price: 79.99, image: '🖱️' },
                        { name: 'Keyboard', price: 149.99, image: '⌨️' }
                    ].map(item => `
                        <div style="min-width: 150px; background: var(--glass); padding: 1rem; border-radius: 12px; text-align: center; cursor: pointer;" onclick="marketplaceMissingUI.showAdvancedProductViewer(Math.floor(Math.random() * 100))">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">${item.image}</div>
                            <div style="font-size: 0.9rem; margin-bottom: 0.25rem;">${item.name}</div>
                            <div style="color: var(--primary); font-weight: 600;">$${item.price}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        if (typeof showToast === 'function') {
            showToast('Shopping Cart Manager opened! 🛒', 'success');
        }
    }

    // 3. Order Tracking & History System
    showOrderTrackingSystem() {
        const modal = this.createModal('orderTrackingSystem', 'Order Tracking & History', () => {
            this.closeModal('orderTrackingSystem');
        });

        modal.innerHTML = `
            <div style="margin-bottom: 2rem;">
                <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                    <button class="btn btn-primary order-tab active" data-tab="current" onclick="marketplaceMissingUI.switchOrderTab(this, 'current')">Current Orders</button>
                    <button class="btn btn-secondary order-tab" data-tab="history" onclick="marketplaceMissingUI.switchOrderTab(this, 'history')">Order History</button>
                    <button class="btn btn-secondary order-tab" data-tab="tracking" onclick="marketplaceMissingUI.switchOrderTab(this, 'tracking')">Track Order</button>
                </div>
            </div>

            <!-- Current Orders Tab -->
            <div class="order-tab-content active" data-content="current">
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    ${this.orders.filter(order => order.status !== 'Delivered').map(order => `
                        <div style="background: var(--glass); border-radius: 16px; padding: 1.5rem; border-left: 4px solid ${order.status === 'Processing' ? 'var(--warning)' : order.status === 'Shipped' ? 'var(--primary)' : order.status === 'In Transit' ? 'var(--info)' : 'var(--success)'};">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                                <div>
                                    <h4 style="margin-bottom: 0.5rem;">Order ${order.id}</h4>
                                    <div style="color: var(--text-secondary); font-size: 0.9rem;">${order.date} • ${order.items.length} items</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="background: ${order.status === 'Processing' ? 'var(--warning)' : order.status === 'Shipped' ? 'var(--primary)' : order.status === 'In Transit' ? 'var(--info)' : 'var(--success)'}; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; margin-bottom: 0.5rem;">${order.status}</div>
                                    <div style="font-weight: 700; font-size: 1.1rem;">$${order.total}</div>
                                </div>
                            </div>

                            <!-- Order Items -->
                            <div style="display: flex; gap: 1rem; margin-bottom: 1rem; overflow-x: auto; padding: 0.5rem 0;">
                                ${order.items.map(item => `
                                    <div style="min-width: 100px; text-align: center;">
                                        <div style="width: 60px; height: 60px; background: var(--bg-card); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 0.5rem;">${item.image}</div>
                                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${item.name}</div>
                                        <div style="font-size: 0.8rem; color: var(--text-muted);">Qty: ${item.quantity}</div>
                                    </div>
                                `).join('')}
                            </div>

                            <!-- Order Progress -->
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <div style="width: 16px; height: 16px; background: var(--success); border-radius: 50%;"></div>
                                    <span style="font-size: 0.9rem;">Order Confirmed</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <div style="width: 16px; height: 16px; background: ${order.status === 'Processing' ? 'var(--warning)' : 'var(--success)'}; border-radius: 50%;"></div>
                                    <span style="font-size: 0.9rem;">Processing</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <div style="width: 16px; height: 16px; background: ${['Shipped', 'In Transit', 'Delivered'].includes(order.status) ? 'var(--success)' : 'var(--glass-border)'}; border-radius: 50%;"></div>
                                    <span style="font-size: 0.9rem;">Shipped</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <div style="width: 16px; height: 16px; background: ${order.status === 'Delivered' ? 'var(--success)' : 'var(--glass-border)'}; border-radius: 50%;"></div>
                                    <span style="font-size: 0.9rem;">Delivered</span>
                                </div>
                            </div>

                            <!-- Action Buttons -->
                            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                                <button class="btn btn-primary btn-small" onclick="marketplaceMissingUI.trackOrder('${order.id}', '${order.tracking}')">
                                    📦 Track Package
                                </button>
                                <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.viewOrderDetails('${order.id}')">
                                    📋 View Details
                                </button>
                                <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.contactSeller('${order.seller}')">
                                    💬 Contact Seller
                                </button>
                                ${order.status === 'Processing' ? `<button class="btn btn-error btn-small" onclick="marketplaceMissingUI.cancelOrder('${order.id}')">❌ Cancel Order</button>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Order History Tab -->
            <div class="order-tab-content" data-content="history" style="display: none;">
                <div style="margin-bottom: 1rem;">
                    <input type="text" placeholder="Search orders..." style="width: 100%; padding: 0.75rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-primary);" onkeyup="marketplaceMissingUI.filterOrders(this.value)">
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${this.orders.map(order => `
                        <div style="background: var(--glass); border-radius: 12px; padding: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                <div>
                                    <h4>Order ${order.id}</h4>
                                    <div style="color: var(--text-secondary); font-size: 0.9rem;">${order.date}</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-weight: 700; margin-bottom: 0.25rem;">$${order.total}</div>
                                    <div style="background: ${order.status === 'Delivered' ? 'var(--success)' : 'var(--primary)'}; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem;">${order.status}</div>
                                </div>
                            </div>
                            
                            <div style="color: var(--text-secondary); margin-bottom: 1rem;">
                                ${order.items.length} items from ${order.seller}
                            </div>

                            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                                <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.viewOrderDetails('${order.id}')">View Details</button>
                                <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.reorderItems('${order.id}')">🔄 Buy Again</button>
                                ${order.status === 'Delivered' ? `<button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.leaveReview('${order.id}')">⭐ Write Review</button>` : ''}
                                <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.downloadInvoice('${order.id}')">📄 Invoice</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Track Order Tab -->
            <div class="order-tab-content" data-content="tracking" style="display: none;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h3>Track Your Package</h3>
                    <div style="max-width: 400px; margin: 1rem auto;">
                        <input type="text" placeholder="Enter order ID or tracking number..." style="width: 100%; padding: 1rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-primary); margin-bottom: 1rem;" id="trackingInput">
                        <button class="btn btn-primary" style="width: 100%;" onclick="marketplaceMissingUI.trackPackage()">🔍 Track Package</button>
                    </div>
                </div>

                <div id="trackingResults" style="display: none;">
                    <!-- Tracking results will be displayed here -->
                </div>

                <!-- Sample Tracking Info -->
                <div style="background: var(--glass); border-radius: 16px; padding: 2rem;">
                    <h4 style="margin-bottom: 1rem;">Recent Tracking: ORDER-002</h4>
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="width: 60px; height: 60px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white;">📦</div>
                        <div>
                            <div style="font-weight: 600; margin-bottom: 0.25rem;">In Transit</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Tracking: TRK987654321</div>
                            <div style="color: var(--success); font-size: 0.9rem;">Estimated delivery: Tomorrow</div>
                        </div>
                    </div>

                    <!-- Tracking Timeline -->
                    <div style="border-left: 2px solid var(--glass-border); margin-left: 1rem; padding-left: 1rem;">
                        <div style="margin-bottom: 1rem; position: relative;">
                            <div style="position: absolute; left: -1.5rem; width: 16px; height: 16px; background: var(--success); border-radius: 50%; border: 3px solid var(--bg-card);"></div>
                            <div style="font-weight: 600; margin-bottom: 0.25rem;">Package is out for delivery</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Today 9:23 AM - Local facility</div>
                        </div>
                        <div style="margin-bottom: 1rem; position: relative;">
                            <div style="position: absolute; left: -1.5rem; width: 16px; height: 16px; background: var(--success); border-radius: 50%; border: 3px solid var(--bg-card);"></div>
                            <div style="font-weight: 600; margin-bottom: 0.25rem;">Arrived at delivery facility</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Today 6:15 AM - New York, NY</div>
                        </div>
                        <div style="margin-bottom: 1rem; position: relative;">
                            <div style="position: absolute; left: -1.5rem; width: 16px; height: 16px; background: var(--success); border-radius: 50%; border: 3px solid var(--bg-card);"></div>
                            <div style="font-weight: 600; margin-bottom: 0.25rem;">In transit</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Yesterday 8:45 PM - Philadelphia, PA</div>
                        </div>
                        <div style="position: relative;">
                            <div style="position: absolute; left: -1.5rem; width: 16px; height: 16px; background: var(--success); border-radius: 50%; border: 3px solid var(--bg-card);"></div>
                            <div style="font-weight: 600; margin-bottom: 0.25rem;">Package shipped</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">2 days ago 2:30 PM - Warehouse</div>
                        </div>
                    </div>

                    <!-- Delivery Options -->
                    <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--glass-border);">
                        <h5 style="margin-bottom: 1rem;">Delivery Options</h5>
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.rescheduleDelivery()">
                                📅 Reschedule
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.changeDeliveryAddress()">
                                📍 Change Address
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.authorizeDelivery()">
                                ✅ Authorize Delivery
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        if (typeof showToast === 'function') {
            showToast('Order Tracking System opened! 📦', 'success');
        }
    }

    // 4. Seller Profile & Store Management
    showSellerProfileManager(sellerId = 'apple-store') {
        const modal = this.createModal('sellerProfileManager', 'Seller Profile', () => {
            this.closeModal('sellerProfileManager');
        });

        const sellerData = {
            id: sellerId,
            name: 'Apple Store Official',
            logo: '🍎',
            rating: 4.9,
            reviews: 15420,
            established: '2007',
            location: 'Cupertino, CA',
            description: 'Official Apple Store bringing you the latest in innovative technology, from iPhones to MacBooks, with authentic products and warranty.',
            stats: {
                products: 234,
                followers: 125000,
                responseTime: '< 1 hour',
                shippingTime: '1-2 business days'
            },
            badges: ['Verified Seller', 'Top Rated', 'Fast Shipping', 'Authentic Products'],
            categories: ['Electronics', 'Smartphones', 'Computers', 'Accessories', 'Tablets'],
            policies: {
                returns: '30-day return policy',
                warranty: 'Full manufacturer warranty included',
                shipping: 'Free shipping on orders over $35'
            }
        };

        modal.innerHTML = `
            <div style="max-height: 70vh; overflow-y: auto;">
                <!-- Store Header -->
                <div style="background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: white; border-radius: 16px; padding: 2rem; margin-bottom: 2rem; text-align: center;">
                    <div style="width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto 1rem;">${sellerData.logo}</div>
                    <h2 style="margin-bottom: 0.5rem;">${sellerData.name}</h2>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem;">
                        <span style="color: var(--warning);">⭐⭐⭐⭐⭐</span>
                        <span style="font-weight: 600;">${sellerData.rating}</span>
                        <span>(${sellerData.reviews.toLocaleString()} reviews)</span>
                    </div>
                    <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 1rem;">
                        <div>
                            <div style="font-size: 1.5rem; font-weight: 700;">${sellerData.stats.products}</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Products</div>
                        </div>
                        <div>
                            <div style="font-size: 1.5rem; font-weight: 700;">${(sellerData.stats.followers / 1000).toFixed(0)}K</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Followers</div>
                        </div>
                        <div>
                            <div style="font-size: 1.5rem; font-weight: 700;">Since ${sellerData.established}</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Established</div>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: center; gap: 1rem;">
                        <button class="btn" style="background: rgba(255,255,255,0.2); color: white;" onclick="marketplaceMissingUI.followSeller('${sellerData.id}')">
                            ➕ Follow Store
                        </button>
                        <button class="btn" style="background: rgba(255,255,255,0.2); color: white;" onclick="marketplaceMissingUI.contactSeller('${sellerData.id}')">
                            💬 Contact
                        </button>
                    </div>
                </div>

                <!-- Store Navigation -->
                <div style="display: flex; gap: 1rem; margin-bottom: 2rem; overflow-x: auto;">
                    <button class="btn btn-primary store-tab active" data-tab="products" onclick="marketplaceMissingUI.switchStoreTab(this, 'products')">Products</button>
                    <button class="btn btn-secondary store-tab" data-tab="about" onclick="marketplaceMissingUI.switchStoreTab(this, 'about')">About</button>
                    <button class="btn btn-secondary store-tab" data-tab="reviews" onclick="marketplaceMissingUI.switchStoreTab(this, 'reviews')">Reviews</button>
                    <button class="btn btn-secondary store-tab" data-tab="policies" onclick="marketplaceMissingUI.switchStoreTab(this, 'policies')">Policies</button>
                </div>

                <!-- Products Tab -->
                <div class="store-tab-content active" data-content="products">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3>Featured Products</h3>
                        <div style="display: flex; gap: 0.5rem;">
                            <select style="background: var(--glass); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.5rem; color: var(--text-primary);">
                                <option>All Categories</option>
                                ${sellerData.categories.map(cat => `<option>${cat}</option>`).join('')}
                            </select>
                            <select style="background: var(--glass); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.5rem; color: var(--text-primary);">
                                <option>Sort by: Featured</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Newest First</option>
                                <option>Best Selling</option>
                            </select>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        ${[
                            { name: 'iPhone 15 Pro Max', price: 1199.99, image: '📱', rating: 4.8, reviews: 2341 },
                            { name: 'MacBook Air M2', price: 1299.99, image: '💻', rating: 4.9, reviews: 1876 },
                            { name: 'AirPods Pro (2nd gen)', price: 249.99, image: '🎧', rating: 4.7, reviews: 3142 },
                            { name: 'Apple Watch Series 9', price: 399.99, image: '⌚', rating: 4.8, reviews: 1654 },
                            { name: 'iPad Pro 12.9"', price: 1099.99, image: '📄', rating: 4.9, reviews: 987 },
                            { name: 'Mac Studio', price: 1999.99, image: '🖥️', rating: 4.8, reviews: 432 }
                        ].map(product => `
                            <div style="background: var(--glass); border-radius: 12px; padding: 1rem; cursor: pointer; transition: transform 0.2s ease;" onclick="marketplaceMissingUI.showAdvancedProductViewer(Math.floor(Math.random() * 100))" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                <div style="font-size: 3rem; text-align: center; margin-bottom: 1rem;">${product.image}</div>
                                <h4 style="margin-bottom: 0.5rem; font-size: 1rem;">${product.name}</h4>
                                <div style="display: flex; align-items: center; gap: 0.25rem; margin-bottom: 0.5rem;">
                                    <span style="color: var(--warning); font-size: 0.8rem;">⭐</span>
                                    <span style="font-size: 0.9rem; color: var(--text-secondary);">${product.rating} (${product.reviews})</span>
                                </div>
                                <div style="font-weight: 700; color: var(--primary); font-size: 1.1rem;">$${product.price}</div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Pagination -->
                    <div style="display: flex; justify-content: center; margin-top: 2rem;">
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-secondary btn-small">Previous</button>
                            <button class="btn btn-primary btn-small">1</button>
                            <button class="btn btn-secondary btn-small">2</button>
                            <button class="btn btn-secondary btn-small">3</button>
                            <button class="btn btn-secondary btn-small">Next</button>
                        </div>
                    </div>
                </div>

                <!-- About Tab -->
                <div class="store-tab-content" data-content="about" style="display: none;">
                    <div class="grid-2" style="margin-bottom: 2rem;">
                        <div>
                            <h4 style="margin-bottom: 1rem;">Store Information</h4>
                            <div style="background: var(--glass); padding: 1.5rem; border-radius: 12px;">
                                <p style="line-height: 1.6; margin-bottom: 1rem;">${sellerData.description}</p>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                    <div>
                                        <div style="font-size: 0.9rem; color: var(--text-secondary);">Established</div>
                                        <div style="font-weight: 600;">${sellerData.established}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 0.9rem; color: var(--text-secondary);">Location</div>
                                        <div style="font-weight: 600;">${sellerData.location}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 0.9rem; color: var(--text-secondary);">Response Time</div>
                                        <div style="font-weight: 600;">${sellerData.stats.responseTime}</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 0.9rem; color: var(--text-secondary);">Shipping Time</div>
                                        <div style="font-weight: 600;">${sellerData.stats.shippingTime}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 style="margin-bottom: 1rem;">Store Badges</h4>
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
                                ${sellerData.badges.map(badge => `
                                    <span style="background: var(--primary); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem;">${badge}</span>
                                `).join('')}
                            </div>
                            
                            <h4 style="margin-bottom: 1rem;">Categories</h4>
                            <div style="background: var(--glass); padding: 1.5rem; border-radius: 12px;">
                                ${sellerData.categories.map(category => `
                                    <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--glass-border); cursor: pointer;" onclick="marketplaceMissingUI.filterByCategory('${category}')">
                                        <span>${category}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Reviews Tab -->
                <div class="store-tab-content" data-content="reviews" style="display: none;">
                    <div style="margin-bottom: 2rem;">
                        <div style="display: flex; align-items: center; gap: 2rem; margin-bottom: 2rem;">
                            <div style="text-align: center;">
                                <div style="font-size: 3rem; font-weight: 800; color: var(--primary);">${sellerData.rating}</div>
                                <div style="color: var(--warning); margin-bottom: 0.25rem;">⭐⭐⭐⭐⭐</div>
                                <div style="color: var(--text-muted); font-size: 0.9rem;">${sellerData.reviews.toLocaleString()} reviews</div>
                            </div>
                            <div style="flex: 1;">
                                ${[5,4,3,2,1].map(stars => `
                                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                        <span style="min-width: 60px;">${stars} stars</span>
                                        <div style="flex: 1; height: 8px; background: var(--glass-border); border-radius: 4px; overflow: hidden;">
                                            <div style="width: ${stars === 5 ? '85%' : stars === 4 ? '10%' : stars === 3 ? '3%' : stars === 2 ? '1%' : '1%'}; height: 100%; background: var(--warning);"></div>
                                        </div>
                                        <span style="min-width: 40px; font-size: 0.9rem;">${stars === 5 ? '85%' : stars === 4 ? '10%' : stars === 3 ? '3%' : stars === 2 ? '1%' : '1%'}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Sample Store Reviews -->
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <div style="background: var(--glass); padding: 1.5rem; border-radius: 12px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <div style="font-weight: 600;">Jennifer K.</div>
                                    <div style="color: var(--warning);">⭐⭐⭐⭐⭐</div>
                                </div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Verified Buyer - 1 week ago</div>
                                <div style="line-height: 1.5;">"Excellent seller! Fast shipping, authentic products, and great customer service. I've ordered multiple items and never been disappointed. Highly recommend!"</div>
                            </div>
                            
                            <div style="background: var(--glass); padding: 1.5rem; border-radius: 12px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <div style="font-weight: 600;">Robert L.</div>
                                    <div style="color: var(--warning);">⭐⭐⭐⭐⭐</div>
                                </div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Verified Buyer - 3 days ago</div>
                                <div style="line-height: 1.5;">"Official Apple store with genuine products. Packaging was perfect, delivery was super fast. Will definitely buy again!"</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Policies Tab -->
                <div class="store-tab-content" data-content="policies" style="display: none;">
                    <div class="grid-2">
                        <div class="card">
                            <h4 style="margin-bottom: 1rem;">🔄 Return Policy</h4>
                            <p style="color: var(--text-secondary); line-height: 1.6;">${sellerData.policies.returns}</p>
                            <div style="margin-top: 1rem; padding: 1rem; background: var(--glass); border-radius: 8px;">
                                <div style="font-size: 0.9rem;">
                                    <div style="margin-bottom: 0.5rem;">• Items must be in original condition</div>
                                    <div style="margin-bottom: 0.5rem;">• Original packaging required</div>
                                    <div>• Free return shipping on defective items</div>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <h4 style="margin-bottom: 1rem;">🛡️ Warranty</h4>
                            <p style="color: var(--text-secondary); line-height: 1.6;">${sellerData.policies.warranty}</p>
                            <div style="margin-top: 1rem; padding: 1rem; background: var(--glass); border-radius: 8px;">
                                <div style="font-size: 0.9rem;">
                                    <div style="margin-bottom: 0.5rem;">• 1-year manufacturer warranty</div>
                                    <div style="margin-bottom: 0.5rem;">• AppleCare+ available</div>
                                    <div>• Technical support included</div>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <h4 style="margin-bottom: 1rem;">📦 Shipping</h4>
                            <p style="color: var(--text-secondary); line-height: 1.6;">${sellerData.policies.shipping}</p>
                            <div style="margin-top: 1rem; padding: 1rem; background: var(--glass); border-radius: 8px;">
                                <div style="font-size: 0.9rem;">
                                    <div style="margin-bottom: 0.5rem;">• Standard shipping: 3-5 business days</div>
                                    <div style="margin-bottom: 0.5rem;">• Express shipping: 1-2 business days</div>
                                    <div>• Same-day delivery available in select areas</div>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <h4 style="margin-bottom: 1rem;">💬 Customer Service</h4>
                            <div style="margin-top: 1rem; padding: 1rem; background: var(--glass); border-radius: 8px;">
                                <div style="font-size: 0.9rem;">
                                    <div style="margin-bottom: 0.5rem;">• 24/7 customer support</div>
                                    <div style="margin-bottom: 0.5rem;">• Live chat available</div>
                                    <div style="margin-bottom: 0.5rem;">• Phone support: 1-800-APL-CARE</div>
                                    <div>• Average response time: < 1 hour</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        if (typeof showToast === 'function') {
            showToast('Seller Profile Manager opened! 🏪', 'success');
        }
    }

    // 5. Wishlist Management System
    showWishlistManager() {
        const modal = this.createModal('wishlistManager', 'My Wishlist', () => {
            this.closeModal('wishlistManager');
        });

        // Sample wishlist items if empty
        const wishlistItems = this.wishlist.length > 0 ? this.wishlist : [
            { id: 1, name: 'iPad Pro 12.9"', price: 1099.99, originalPrice: 1199.99, image: '📄', seller: 'Apple Store', addedDate: '2024-01-10', inStock: true, priceDropped: true },
            { id: 2, name: 'Sony WH-1000XM5', price: 349.99, originalPrice: 399.99, image: '🎧', seller: 'AudioTech', addedDate: '2024-01-08', inStock: true, priceDropped: false },
            { id: 3, name: 'Gaming Keyboard', price: 149.99, originalPrice: 149.99, image: '⌨️', seller: 'GamerHub', addedDate: '2024-01-05', inStock: false, priceDropped: false }
        ];

        modal.innerHTML = `
            <div style="max-height: 70vh; overflow-y: auto;">
                <!-- Wishlist Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--glass-border);">
                    <div>
                        <h3>My Wishlist (${wishlistItems.length} items)</h3>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Save items for later and get notified of price drops</div>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <button class="btn btn-secondary" onclick="marketplaceMissingUI.shareWishlist()">📤 Share Wishlist</button>
                        <button class="btn btn-primary" onclick="marketplaceMissingUI.addAllToCart()">🛒 Add All to Cart</button>
                    </div>
                </div>

                <!-- Wishlist Actions -->
                <div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="selectAll" onchange="marketplaceMissingUI.toggleSelectAll()" style="width: 18px; height: 18px;">
                        <label for="selectAll" style="font-size: 0.9rem; color: var(--text-secondary);">Select All</label>
                    </div>
                    <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.removeSelected()" disabled id="removeSelectedBtn">🗑️ Remove Selected</button>
                    <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.moveSelectedToCart()" disabled id="moveSelectedBtn">🛒 Move Selected to Cart</button>
                    <select style="background: var(--glass); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.5rem; color: var(--text-primary);" onchange="marketplaceMissingUI.sortWishlist(this.value)">
                        <option value="recent">Sort by: Recently Added</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name">Name: A to Z</option>
                        <option value="availability">Availability</option>
                    </select>
                </div>

                <!-- Wishlist Items -->
                <div id="wishlistItemsList">
                    ${wishlistItems.map(item => `
                        <div class="wishlist-item" data-id="${item.id}" style="display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; background: var(--glass); border-radius: 16px; margin-bottom: 1rem; ${!item.inStock ? 'opacity: 0.7;' : ''}">
                            <input type="checkbox" class="item-checkbox" data-id="${item.id}" style="width: 18px; height: 18px;" onchange="marketplaceMissingUI.updateSelectedActions()">
                            
                            <div style="width: 100px; height: 100px; background: var(--bg-card); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 3rem; cursor: pointer;" onclick="marketplaceMissingUI.showAdvancedProductViewer('${item.id}')" role="img" aria-label="Product image">${item.image}</div>
                            
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: start; gap: 1rem; margin-bottom: 0.5rem;">
                                    <div style="flex: 1;">
                                        <h4 style="margin-bottom: 0.5rem; cursor: pointer;" onclick="marketplaceMissingUI.showAdvancedProductViewer('${item.id}')">${item.name}</h4>
                                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Sold by ${item.seller}</div>
                                        <div style="color: var(--text-muted); font-size: 0.8rem;">Added ${item.addedDate}</div>
                                    </div>
                                    
                                    <!-- Price and Status -->
                                    <div style="text-align: right;">
                                        <div style="font-weight: 700; font-size: 1.2rem; color: var(--primary); margin-bottom: 0.25rem;">$${item.price}</div>
                                        ${item.originalPrice > item.price ? `<div style="text-decoration: line-through; color: var(--text-muted); font-size: 0.9rem;">$${item.originalPrice}</div>` : ''}
                                        ${item.priceDropped ? '<div style="color: var(--success); font-size: 0.8rem; margin-top: 0.25rem;">📉 Price dropped!</div>' : ''}
                                        ${!item.inStock ? '<div style="color: var(--error); font-size: 0.8rem; margin-top: 0.25rem;">❌ Out of stock</div>' : '<div style="color: var(--success); font-size: 0.8rem; margin-top: 0.25rem;">✅ In stock</div>'}
                                    </div>
                                </div>

                                <!-- Item Actions -->
                                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                                    ${item.inStock ? `
                                        <button class="btn btn-primary btn-small" onclick="marketplaceMissingUI.addToCartFromWishlist('${item.id}')">
                                            🛒 Add to Cart
                                        </button>
                                        <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.buyNowFromWishlist('${item.id}')">
                                            ⚡ Buy Now
                                        </button>
                                    ` : `
                                        <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.notifyWhenAvailable('${item.id}')">
                                            🔔 Notify When Available
                                        </button>
                                        <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.findSimilarItems('${item.id}')">
                                            🔍 Find Similar
                                        </button>
                                    `}
                                    <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.shareWishlistItem('${item.id}')">
                                        📤 Share
                                    </button>
                                    <button class="btn btn-error btn-small" onclick="marketplaceMissingUI.removeFromWishlist('${item.id}')">
                                        🗑️ Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                ${wishlistItems.length === 0 ? `
                    <div style="text-align: center; padding: 4rem 2rem; color: var(--text-secondary);">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">🤍</div>
                        <h3 style="margin-bottom: 1rem;">Your wishlist is empty</h3>
                        <p style="margin-bottom: 2rem;">Save items you're interested in to keep track of them</p>
                        <button class="btn btn-primary" onclick="marketplaceMissingUI.closeModal('wishlistManager'); switchToScreen('extra', 'marketplace')">
                            🛒 Start Shopping
                        </button>
                    </div>
                ` : ''}

                <!-- Wishlist Insights -->
                ${wishlistItems.length > 0 ? `
                    <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--glass-border);">
                        <h4 style="margin-bottom: 1.5rem;">💡 Wishlist Insights</h4>
                        <div class="grid-3">
                            <div style="background: var(--glass); padding: 1.5rem; border-radius: 12px; text-align: center;">
                                <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
                                <div style="font-weight: 600; color: var(--primary); font-size: 1.2rem;">$${wishlistItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem;">Total Value</div>
                            </div>
                            <div style="background: var(--glass); padding: 1.5rem; border-radius: 12px; text-align: center;">
                                <div style="font-size: 2rem; margin-bottom: 0.5rem;">📉</div>
                                <div style="font-weight: 600; color: var(--success); font-size: 1.2rem;">$${(wishlistItems.reduce((sum, item) => sum + (item.originalPrice - item.price), 0)).toFixed(2)}</div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem;">Total Savings</div>
                            </div>
                            <div style="background: var(--glass); padding: 1.5rem; border-radius: 12px; text-align: center;">
                                <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                                <div style="font-weight: 600; color: var(--info); font-size: 1.2rem;">${wishlistItems.filter(item => item.inStock).length}/${wishlistItems.length}</div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem;">Available</div>
                            </div>
                        </div>
                    </div>

                    <!-- Price Drop Alerts -->
                    <div style="margin-top: 2rem;">
                        <h4 style="margin-bottom: 1rem;">🔔 Price Drop Alerts</h4>
                        <div style="background: var(--glass); padding: 1.5rem; border-radius: 12px;">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                <input type="checkbox" checked style="width: 18px; height: 18px;">
                                <span>Notify me when prices drop on wishlist items</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                <input type="checkbox" checked style="width: 18px; height: 18px;">
                                <span>Email me daily wishlist summary</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <input type="checkbox" style="width: 18px; height: 18px;">
                                <span>Push notifications for back-in-stock items</span>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Recommended Items -->
                <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--glass-border);">
                    <h4 style="margin-bottom: 1rem;">💡 You Might Also Like</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        ${[
                            { name: 'Magic Mouse', price: 79.99, image: '🖱️', rating: 4.3 },
                            { name: 'USB-C Hub', price: 59.99, image: '🔌', rating: 4.6 },
                            { name: 'Laptop Stand', price: 49.99, image: '💻', rating: 4.7 }
                        ].map(item => `
                            <div style="background: var(--glass); padding: 1rem; border-radius: 12px; text-align: center; cursor: pointer;" onclick="marketplaceMissingUI.addToWishlistQuick('${item.name}', ${item.price})">
                                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">${item.image}</div>
                                <div style="font-weight: 600; margin-bottom: 0.25rem; font-size: 0.9rem;">${item.name}</div>
                                <div style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.25rem;">⭐ ${item.rating}</div>
                                <div style="color: var(--primary); font-weight: 600;">$${item.price}</div>
                                <button class="btn btn-primary btn-small" style="margin-top: 0.5rem; width: 100%;">🤍 Add to Wishlist</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        if (typeof showToast === 'function') {
            showToast('Wishlist Manager opened! 🤍', 'success');
        }
    }

    // 6. Advanced Search & Filter System
    showAdvancedSearchSystem() {
        const modal = this.createModal('advancedSearchSystem', 'Advanced Search & Filters', () => {
            this.closeModal('advancedSearchSystem');
        });

        modal.innerHTML = `
            <div style="max-height: 70vh; overflow-y: auto;">
                <!-- Search Bar -->
                <div style="margin-bottom: 2rem;">
                    <div style="position: relative;">
                        <input type="text" id="advancedSearchInput" placeholder="Search products, brands, categories..." style="width: 100%; padding: 1rem 3rem 1rem 1rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--text-primary); font-size: 1.1rem;">
                        <button style="position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); background: var(--primary); border: none; border-radius: 8px; width: 40px; height: 40px; color: white; cursor: pointer; font-size: 1.2rem;" onclick="marketplaceMissingUI.performAdvancedSearch()" aria-label="Search">🔍</button>
                    </div>
                    
                    <!-- Quick Search Suggestions -->
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
                        ${['iPhone', 'MacBook', 'Gaming', 'Headphones', 'Watches'].map(term => `
                            <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.quickSearch('${term}')">${term}</button>
                        `).join('')}
                    </div>
                </div>

                <!-- Advanced Filters -->
                <div style="display: grid; grid-template-columns: 300px 1fr; gap: 2rem;">
                    <!-- Filter Sidebar -->
                    <div style="background: var(--glass); padding: 1.5rem; border-radius: 16px; height: fit-content;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                            <h4>Filters</h4>
                            <button class="btn btn-error btn-small" onclick="marketplaceMissingUI.clearAllFilters()">Clear All</button>
                        </div>

                        <!-- Price Range -->
                        <div style="margin-bottom: 2rem;">
                            <h5 style="margin-bottom: 1rem;">💰 Price Range</h5>
                            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                                <input type="number" placeholder="Min" style="flex: 1; padding: 0.5rem; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-primary);" id="minPrice">
                                <input type="number" placeholder="Max" style="flex: 1; padding: 0.5rem; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-primary);" id="maxPrice">
                            </div>
                            <input type="range" min="0" max="2000" value="1000" style="width: 100%; margin-bottom: 0.5rem;" onchange="marketplaceMissingUI.updatePriceRange(this.value)">
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary);">
                                <span>$0</span>
                                <span id="priceRangeValue">$1000</span>
                                <span>$2000+</span>
                            </div>
                        </div>

                        <!-- Categories -->
                        <div style="margin-bottom: 2rem;">
                            <h5 style="margin-bottom: 1rem;">📂 Categories</h5>
                            ${['Electronics', 'Fashion', 'Home & Garden', 'Books', 'Sports', 'Toys', 'Beauty'].map(category => `
                                <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; cursor: pointer;">
                                    <input type="checkbox" onchange="marketplaceMissingUI.toggleCategoryFilter('${category}')">
                                    <span>${category}</span>
                                </label>
                            `).join('')}
                        </div>

                        <!-- Condition -->
                        <div style="margin-bottom: 2rem;">
                            <h5 style="margin-bottom: 1rem;">🔍 Condition</h5>
                            ${['New', 'Like New', 'Good', 'Fair'].map(condition => `
                                <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; cursor: pointer;">
                                    <input type="checkbox" onchange="marketplaceMissingUI.toggleConditionFilter('${condition}')">
                                    <span>${condition}</span>
                                </label>
                            `).join('')}
                        </div>

                        <!-- Rating -->
                        <div style="margin-bottom: 2rem;">
                            <h5 style="margin-bottom: 1rem;">⭐ Rating</h5>
                            ${[5,4,3,2,1].map(rating => `
                                <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; cursor: pointer;">
                                    <input type="radio" name="rating" onchange="marketplaceMissingUI.setRatingFilter(${rating})">
                                    <span>${'⭐'.repeat(rating)} & up</span>
                                </label>
                            `).join('')}
                        </div>

                        <!-- Seller -->
                        <div style="margin-bottom: 2rem;">
                            <h5 style="margin-bottom: 1rem;">🏪 Seller</h5>
                            <input type="text" placeholder="Seller name..." style="width: 100%; padding: 0.5rem; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-primary); margin-bottom: 1rem;" id="sellerFilter">
                            <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; cursor: pointer;">
                                <input type="checkbox" onchange="marketplaceMissingUI.toggleVerifiedSellers()">
                                <span>Verified sellers only</span>
                            </label>
                        </div>

                        <!-- Shipping -->
                        <div style="margin-bottom: 2rem;">
                            <h5 style="margin-bottom: 1rem;">📦 Shipping</h5>
                            <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; cursor: pointer;">
                                <input type="checkbox" onchange="marketplaceMissingUI.toggleFreeShipping()">
                                <span>Free shipping</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; cursor: pointer;">
                                <input type="checkbox" onchange="marketplaceMissingUI.toggleFastShipping()">
                                <span>Fast shipping (1-2 days)</span>
                            </label>
                        </div>

                        <!-- Location -->
                        <div style="margin-bottom: 2rem;">
                            <h5 style="margin-bottom: 1rem;">📍 Location</h5>
                            <select style="width: 100%; padding: 0.5rem; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-primary); margin-bottom: 1rem;" onchange="marketplaceMissingUI.setLocationFilter(this.value)">
                                <option value="all">All Locations</option>
                                <option value="local">Local (within 25 miles)</option>
                                <option value="national">National</option>
                                <option value="international">International</option>
                            </select>
                            <input type="range" min="1" max="1000" value="25" style="width: 100%; margin-bottom: 0.5rem;" onchange="marketplaceMissingUI.updateLocationRange(this.value)">
                            <div style="text-align: center; font-size: 0.8rem; color: var(--text-secondary);">
                                Within <span id="locationRangeValue">25</span> miles
                            </div>
                        </div>
                    </div>

                    <!-- Search Results -->
                    <div>
                        <!-- Search Results Header -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                            <div>
                                <h4>Search Results</h4>
                                <div style="color: var(--text-secondary); font-size: 0.9rem;" id="searchResultsCount">Showing 1,234 results</div>
                            </div>
                            <div style="display: flex; gap: 1rem;">
                                <select style="background: var(--glass); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.5rem; color: var(--text-primary);" onchange="marketplaceMissingUI.sortResults(this.value)">
                                    <option value="relevance">Sort by: Relevance</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Customer Rating</option>
                                    <option value="newest">Newest First</option>
                                    <option value="bestselling">Best Selling</option>
                                </select>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="btn btn-secondary btn-small view-toggle active" data-view="grid" onclick="marketplaceMissingUI.switchView('grid')">⊞</button>
                                    <button class="btn btn-secondary btn-small view-toggle" data-view="list" onclick="marketplaceMissingUI.switchView('list')">☰</button>
                                </div>
                            </div>
                        </div>

                        <!-- Active Filters -->
                        <div style="margin-bottom: 1.5rem;" id="activeFilters">
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                <!-- Active filters will be displayed here -->
                            </div>
                        </div>

                        <!-- Search Results Grid -->
                        <div id="searchResultsGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                            ${[
                                { id: 1, name: 'iPhone 15 Pro Max', price: 1199.99, originalPrice: 1299.99, image: '📱', rating: 4.8, reviews: 1247, seller: 'Apple Store', condition: 'New', shipping: 'Free' },
                                { id: 2, name: 'MacBook Air M2', price: 1299.99, originalPrice: 1399.99, image: '💻', rating: 4.9, reviews: 890, seller: 'Tech Hub', condition: 'New', shipping: 'Free' },
                                { id: 3, name: 'AirPods Pro (2nd gen)', price: 249.99, originalPrice: 299.99, image: '🎧', rating: 4.7, reviews: 2341, seller: 'Audio World', condition: 'New', shipping: 'Free' },
                                { id: 4, name: 'Gaming Keyboard RGB', price: 89.99, originalPrice: 129.99, image: '⌨️', rating: 4.5, reviews: 567, seller: 'Gaming Store', condition: 'New', shipping: '$5.99' },
                                { id: 5, name: 'Wireless Mouse', price: 59.99, originalPrice: 79.99, image: '🖱️', rating: 4.6, reviews: 432, seller: 'Office Supplies', condition: 'Like New', shipping: 'Free' },
                                { id: 6, name: 'Smart Watch', price: 299.99, originalPrice: 349.99, image: '⌚', rating: 4.4, reviews: 876, seller: 'Wearables Plus', condition: 'New', shipping: 'Free' }
                            ].map(product => `
                                <div class="search-result-item" style="background: var(--glass); border-radius: 16px; padding: 1.5rem; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;" 
                                     onclick="marketplaceMissingUI.showAdvancedProductViewer('${product.id}')"
                                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.1)'"
                                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                                    <div style="position: relative; margin-bottom: 1rem;">
                                        <div style="font-size: 4rem; text-align: center; margin-bottom: 1rem;">${product.image}</div>
                                        <div style="position: absolute; top: 0; right: 0;">
                                            <button style="background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="event.stopPropagation(); marketplaceMissingUI.toggleWishlist('${product.id}', '${product.name}')">
                                                🤍
                                            </button>
                                        </div>
                                        ${product.originalPrice > product.price ? `
                                            <div style="position: absolute; top: 0; left: 0; background: var(--error); color: white; padding: 0.25rem 0.5rem; border-radius: 8px; font-size: 0.7rem; font-weight: 600;">
                                                -${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                            </div>
                                        ` : ''}
                                    </div>
                                    
                                    <h4 style="margin-bottom: 0.5rem; font-size: 1rem; line-height: 1.2;">${product.name}</h4>
                                    
                                    <div style="display: flex; align-items: center; gap: 0.25rem; margin-bottom: 0.5rem;">
                                        <span style="color: var(--warning); font-size: 0.8rem;">⭐</span>
                                        <span style="font-size: 0.9rem; font-weight: 600;">${product.rating}</span>
                                        <span style="color: var(--text-secondary); font-size: 0.8rem;">(${product.reviews})</span>
                                    </div>
                                    
                                    <div style="margin-bottom: 0.5rem;">
                                        <div style="font-weight: 700; color: var(--primary); font-size: 1.2rem; margin-bottom: 0.25rem;">$${product.price}</div>
                                        ${product.originalPrice > product.price ? `<div style="text-decoration: line-through; color: var(--text-muted); font-size: 0.9rem;">$${product.originalPrice}</div>` : ''}
                                    </div>
                                    
                                    <div style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.5rem;">
                                        Sold by ${product.seller}
                                    </div>
                                    
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                        <span style="background: var(--success); color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.7rem;">${product.condition}</span>
                                        <span style="color: ${product.shipping === 'Free' ? 'var(--success)' : 'var(--text-secondary)'}; font-size: 0.8rem; font-weight: 600;">
                                            ${product.shipping === 'Free' ? '🚚 Free shipping' : '🚚 ' + product.shipping}
                                        </span>
                                    </div>
                                    
                                    <div style="display: flex; gap: 0.5rem;">
                                        <button class="btn btn-primary btn-small" style="flex: 1;" onclick="event.stopPropagation(); marketplaceMissingUI.addToCartAdvanced('${product.id}')">
                                            🛒 Add to Cart
                                        </button>
                                        <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); marketplaceMissingUI.quickView('${product.id}')">
                                            👁️ Quick View
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Search Results List View (Hidden by default) -->
                        <div id="searchResultsList" style="display: none;">
                            <!-- List view results would go here -->
                        </div>

                        <!-- Pagination -->
                        <div style="display: flex; justify-content: center; margin-top: 3rem;">
                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                <button class="btn btn-secondary btn-small">Previous</button>
                                <button class="btn btn-primary btn-small">1</button>
                                <button class="btn btn-secondary btn-small">2</button>
                                <button class="btn btn-secondary btn-small">3</button>
                                <span style="color: var(--text-secondary); margin: 0 0.5rem;">...</span>
                                <button class="btn btn-secondary btn-small">24</button>
                                <button class="btn btn-secondary btn-small">Next</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Search Suggestions -->
                <div style="margin-top: 3rem; border-top: 1px solid var(--glass-border); padding-top: 2rem;">
                    <h4 style="margin-bottom: 1.5rem;">💡 Search Suggestions</h4>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${['Latest iPhone models', 'Gaming laptops under $1000', 'Wireless headphones', 'Smart home devices', 'Fitness trackers', 'Professional cameras', 'Mechanical keyboards'].map(suggestion => `
                            <button class="btn btn-secondary btn-small" onclick="marketplaceMissingUI.searchSuggestion('${suggestion}')">${suggestion}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        if (typeof showToast === 'function') {
            showToast('Advanced Search & Filter System opened! 🔍', 'success');
        }
    }

    // Helper Methods and Utility Functions

    createModal(id, title, onClose) {
        // Remove existing modal if it exists
        const existing = document.getElementById(id);
        if (existing) {
            existing.remove();
        }

        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal active';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 2rem;
        `;

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            width: 100%;
            max-width: 1200px;
            max-height: 90vh;
            overflow: hidden;
        `;

        const modalHeader = document.createElement('div');
        modalHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 2rem;
            border-bottom: 1px solid var(--glass-border);
        `;

        const modalTitle = document.createElement('h2');
        modalTitle.textContent = title;
        modalTitle.style.margin = '0';

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: var(--text-primary);
            font-size: 1.5rem;
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s ease;
        `;
        closeButton.onclick = onClose;

        const modalBody = document.createElement('div');
        modalBody.style.cssText = `
            padding: 2rem;
        `;

        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modal.appendChild(modalContent);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                onClose();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById(id)) {
                onClose();
            }
        });

        return modalBody;
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        }
    }

    isInWishlist(productId) {
        return this.wishlist.some(item => item.id == productId);
    }

    // Product Viewer Helper Methods
    switchProductTab(button, tabName) {
        // Update tab buttons
        document.querySelectorAll('.product-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.style.color = 'var(--text-secondary)';
            tab.style.borderBottom = '2px solid transparent';
        });
        button.classList.add('active');
        button.style.color = 'var(--text-primary)';
        button.style.borderBottom = '2px solid var(--primary)';

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
            content.classList.remove('active');
        });
        const targetContent = document.querySelector(`.tab-content[data-content="${tabName}"]`);
        if (targetContent) {
            targetContent.style.display = 'block';
            targetContent.classList.add('active');
        }
    }

    selectVariant(button, variant, price) {
        document.querySelectorAll('.variant-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = '';
            btn.style.color = '';
        });
        button.classList.add('active');
        button.style.background = 'var(--primary)';
        button.style.color = 'white';

        // Update price if needed
        const priceElement = document.querySelector('.btn-primary[onclick*="buyNowAdvanced"]');
        if (priceElement) {
            priceElement.innerHTML = `🛒 Buy Now - $${price}`;
        }
    }

    show360View(productId) {
        if (typeof showToast === 'function') {
            showToast('360° view feature coming soon! 🔄', 'info');
        }
    }

    tryARMode(productId) {
        if (typeof showToast === 'function') {
            showToast('AR try-on feature coming soon! 📱', 'info');
        }
    }

    loadMoreReviews() {
        if (typeof showToast === 'function') {
            showToast('Loading more reviews...', 'info');
        }
    }

    viewSellerProfile(sellerId) {
        this.showSellerProfileManager(sellerId);
    }

    // Cart Management Methods
    updateCartQuantity(itemId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(itemId);
            return;
        }

        const itemIndex = this.cart.findIndex(item => item.id == itemId);
        if (itemIndex > -1) {
            this.cart[itemIndex].quantity = newQuantity;
            localStorage.setItem('connecthub_cart', JSON.stringify(this.cart));
            this.updateCartCount();
            
            // Update display
            const itemElement = document.querySelector(`.cart-item[data-id="${itemId}"]`);
            if (itemElement) {
                const quantitySpan = itemElement.querySelector('span[style*="min-width: 30px"]');
                const totalElement = itemElement.querySelector('div[style*="font-size: 1.2rem"]');
                if (quantitySpan) quantitySpan.textContent = newQuantity;
                if (totalElement) totalElement.textContent = `$${(this.cart[itemIndex].price * newQuantity).toFixed(2)}`;
            }

            if (typeof showToast === 'function') {
                showToast('Cart updated!', 'success');
            }
        }
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id != itemId);
        localStorage.setItem('connecthub_cart', JSON.stringify(this.cart));
        this.updateCartCount();

        const itemElement = document.querySelector(`.cart-item[data-id="${itemId}"]`);
        if (itemElement) {
            itemElement.remove();
        }

        if (typeof showToast === 'function') {
            showToast('Item removed from cart', 'info');
        }
    }

    clearCart() {
        this.cart = [];
        localStorage.setItem('connecthub_cart', JSON.stringify(this.cart));
        this.updateCartCount();

        const cartList = document.getElementById('cartItemsList');
        if (cartList) {
            cartList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Your cart is empty</div>';
        }

        if (typeof showToast === 'function') {
            showToast('Cart cleared', 'info');
        }
    }

    moveToWishlist(itemId) {
        const item = this.cart.find(item => item.id == itemId);
        if (item && !this.isInWishlist(itemId)) {
            this.wishlist.push({
                id: item.id,
                name: item.name,
                price: item.price,
                originalPrice: item.price * 1.1,
                image: item.image,
                seller: item.seller,
                addedDate: new Date().toISOString().split('T')[0],
                inStock: true,
                priceDropped: false
            });
            localStorage.setItem('connecthub_wishlist', JSON.stringify(this.wishlist));
        }
        this.removeFromCart(itemId);

        if (typeof showToast === 'function') {
            showToast('Item moved to wishlist! 🤍', 'success');
        }
    }

    addToCartAdvanced(productId) {
        const existingItem = this.cart.find(item => item.id == productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.cart.push({
                id: productId,
                name: 'Sample Product',
                price: 99.99,
                quantity: 1,
                image: '📦',
                seller: 'Sample Store'
            });
        }
        localStorage.setItem('connecthub_cart', JSON.stringify(this.cart));
        this.updateCartCount();

        if (typeof showToast === 'function') {
            showToast('Added to cart! 🛒', 'success');
        }
    }

    buyNowAdvanced(productId) {
        this.addToCartAdvanced(productId);
        this.proceedToCheckout();
    }

    applyPromoCode() {
        const input = document.getElementById('promoCodeInput');
        const messageEl = document.getElementById('promoMessage');
        
        if (input && messageEl) {
            const code = input.value.trim();
            if (code.toUpperCase() === 'SAVE10') {
                messageEl.innerHTML = '<span style="color: var(--success);">✅ 10% discount applied!</span>';
                input.value = '';
            } else if (code) {
                messageEl.innerHTML = '<span style="color: var(--error);">❌ Invalid promo code</span>';
            }
        }
    }

    proceedToCheckout() {
        if (typeof showToast === 'function') {
            showToast('Redirecting to secure checkout...', 'info');
        }
    }

    saveForLater() {
        if (typeof showToast === 'function') {
            showToast('Cart saved for later!', 'success');
        }
    }

    addRecommendedToCart(name, price) {
        this.cart.push({
            id: Date.now(),
            name: name,
            price: price,
            quantity: 1,
            image: '📦',
            seller: 'Recommended Store'
        });
        localStorage.setItem('connecthub_cart', JSON.stringify(this.cart));
        this.updateCartCount();

        if (typeof showToast === 'function') {
            showToast(`${name} added to cart!`, 'success');
        }
    }

    // Order Tracking Methods
    switchOrderTab(button, tabName) {
        document.querySelectorAll('.order-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.classList.remove('btn-primary');
            tab.classList.add('btn-secondary');
        });
        button.classList.add('active');
        button.classList.remove('btn-secondary');
        button.classList.add('btn-primary');

        document.querySelectorAll('.order-tab-content').forEach(content => {
            content.style.display = 'none';
            content.classList.remove('active');
        });
        const targetContent = document.querySelector(`.order-tab-content[data-content="${tabName}"]`);
        if (targetContent) {
            targetContent.style.display = 'block';
            targetContent.classList.add('active');
        }
    }

    trackOrder(orderId, trackingNumber) {
        if (typeof showToast === 'function') {
            showToast(`Tracking order ${orderId} with tracking number ${trackingNumber}`, 'info');
        }
    }

    viewOrderDetails(orderId) {
        if (typeof showToast === 'function') {
            showToast(`Viewing details for order ${orderId}`, 'info');
        }
    }

    contactSeller(sellerId) {
        if (typeof showToast === 'function') {
            showToast(`Opening chat with seller: ${sellerId}`, 'info');
        }
        // This would typically open a chat interface
    }

    cancelOrder(orderId) {
        if (typeof showToast === 'function') {
            showToast(`Canceling order ${orderId}...`, 'info');
        }
    }

    filterOrders(searchTerm) {
        // Filter logic would be implemented here
        if (typeof showToast === 'function') {
            showToast(`Filtering orders by: ${searchTerm}`, 'info');
        }
    }

    trackPackage() {
        const input = document.getElementById('trackingInput');
        if (input && input.value.trim()) {
            if (typeof showToast === 'function') {
                showToast(`Tracking package: ${input.value}`, 'info');
            }
        }
    }

    rescheduleDelivery() {
        if (typeof showToast === 'function') {
            showToast('Delivery rescheduling options opened', 'info');
        }
    }

    changeDeliveryAddress() {
        if (typeof showToast === 'function') {
            showToast('Address change form opened', 'info');
        }
    }

    authorizeDelivery() {
        if (typeof showToast === 'function') {
            showToast('Delivery authorization saved', 'success');
        }
    }

    reorderItems(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.items.forEach(item => {
                this.addToCartAdvanced(item.id || Date.now() + Math.random());
            });
            if (typeof showToast === 'function') {
                showToast('Items added to cart for reorder!', 'success');
            }
        }
    }

    leaveReview(orderId) {
        if (typeof showToast === 'function') {
            showToast(`Review form opened for order ${orderId}`, 'info');
        }
    }

    downloadInvoice(orderId) {
        if (typeof showToast === 'function') {
            showToast(`Downloading invoice for order ${orderId}`, 'info');
        }
    }

    // Seller Profile Methods
    switchStoreTab(button, tabName) {
        document.querySelectorAll('.store-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.classList.remove('btn-primary');
            tab.classList.add('btn-secondary');
        });
        button.classList.add('active');
        button.classList.remove('btn-secondary');
        button.classList.add('btn-primary');

        document.querySelectorAll('.store-tab-content').forEach(content => {
            content.style.display = 'none';
            content.classList.remove('active');
        });
        const targetContent = document.querySelector(`.store-tab-content[data-content="${tabName}"]`);
        if (targetContent) {
            targetContent.style.display = 'block';
            targetContent.classList.add('active');
        }
    }

    followSeller(sellerId) {
        if (typeof showToast === 'function') {
            showToast(`Following seller: ${sellerId}`, 'success');
        }
    }

    filterByCategory(category) {
        if (typeof showToast === 'function') {
            showToast(`Filtering products by category: ${category}`, 'info');
        }
    }

    // Wishlist Management Methods
    toggleWishlist(productId, productName) {
        const isInWishlist = this.isInWishlist(productId);
        
        if (isInWishlist) {
            this.wishlist = this.wishlist.filter(item => item.id != productId);
            if (typeof showToast === 'function') {
                showToast('Removed from wishlist', 'info');
            }
        } else {
            this.wishlist.push({
                id: productId,
                name: productName || 'Product',
                price: 99.99,
                originalPrice: 109.99,
                image: '📦',
                seller: 'Sample Store',
                addedDate: new Date().toISOString().split('T')[0],
                inStock: true,
                priceDropped: false
            });
            if (typeof showToast === 'function') {
                showToast('Added to wishlist! 🤍', 'success');
            }
        }
        
        localStorage.setItem('connecthub_wishlist', JSON.stringify(this.wishlist));
        
        // Update button icon if it exists
        const wishlistBtn = event?.target;
        if (wishlistBtn) {
            wishlistBtn.innerHTML = isInWishlist ? '🤍' : '❤️';
        }
    }

    shareWishlist() {
        if (typeof showToast === 'function') {
            showToast('Wishlist sharing options opened', 'info');
        }
    }

    addAllToCart() {
        this.wishlist.filter(item => item.inStock).forEach(item => {
            const existingItem = this.cart.find(cartItem => cartItem.id == item.id);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                this.cart.push({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                    image: item.image,
                    seller: item.seller
                });
            }
        });
        
        localStorage.setItem('connecthub_cart', JSON.stringify(this.cart));
        this.updateCartCount();

        if (typeof showToast === 'function') {
            showToast('Available wishlist items added to cart!', 'success');
        }
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const itemCheckboxes = document.querySelectorAll('.item-checkbox');
        
        itemCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
        
        this.updateSelectedActions();
    }

    updateSelectedActions() {
        const selectedItems = document.querySelectorAll('.item-checkbox:checked');
        const removeBtn = document.getElementById('removeSelectedBtn');
        const moveBtn = document.getElementById('moveSelectedBtn');
        
        const hasSelection = selectedItems.length > 0;
        if (removeBtn) {
            removeBtn.disabled = !hasSelection;
            removeBtn.style.opacity = hasSelection ? '1' : '0.5';
        }
        if (moveBtn) {
            moveBtn.disabled = !hasSelection;
            moveBtn.style.opacity = hasSelection ? '1' : '0.5';
        }
    }

    removeSelected() {
        const selectedCheckboxes = document.querySelectorAll('.item-checkbox:checked');
        selectedCheckboxes.forEach(checkbox => {
            const itemId = checkbox.getAttribute('data-id');
            this.removeFromWishlist(itemId);
        });
    }

    moveSelectedToCart() {
        const selectedCheckboxes = document.querySelectorAll('.item-checkbox:checked');
        selectedCheckboxes.forEach(checkbox => {
            const itemId = checkbox.getAttribute('data-id');
            this.addToCartFromWishlist(itemId);
        });
    }

    sortWishlist(sortBy) {
        if (typeof showToast === 'function') {
            showToast(`Sorting wishlist by: ${sortBy}`, 'info');
        }
    }

    addToCartFromWishlist(itemId) {
        const item = this.wishlist.find(item => item.id == itemId);
        if (item) {
            this.addToCartAdvanced(itemId);
        }
    }

    buyNowFromWishlist(itemId) {
        this.addToCartFromWishlist(itemId);
        this.proceedToCheckout();
    }

    notifyWhenAvailable(itemId) {
        if (typeof showToast === 'function') {
            showToast('You\'ll be notified when this item is back in stock!', 'success');
        }
    }

    findSimilarItems(itemId) {
        if (typeof showToast === 'function') {
            showToast('Finding similar items...', 'info');
        }
    }

    shareWishlistItem(itemId) {
        if (typeof showToast === 'function') {
            showToast('Item sharing options opened', 'info');
        }
    }

    removeFromWishlist(itemId) {
        this.wishlist = this.wishlist.filter(item => item.id != itemId);
        localStorage.setItem('connecthub_wishlist', JSON.stringify(this.wishlist));

        const itemElement = document.querySelector(`.wishlist-item[data-id="${itemId}"]`);
        if (itemElement) {
            itemElement.remove();
        }

        if (typeof showToast === 'function') {
            showToast('Removed from wishlist', 'info');
        }
    }

    addToWishlistQuick(name, price) {
        this.wishlist.push({
            id: Date.now(),
            name: name,
            price: price,
            originalPrice: price * 1.1,
            image: '📦',
            seller: 'Store',
            addedDate: new Date().toISOString().split('T')[0],
            inStock: true,
            priceDropped: false
        });
        localStorage.setItem('connecthub_wishlist', JSON.stringify(this.wishlist));

        if (typeof showToast === 'function') {
            showToast(`${name} added to wishlist!`, 'success');
        }
    }

    // Advanced Search Methods
    performAdvancedSearch() {
        const searchInput = document.getElementById('advancedSearchInput');
        if (searchInput && searchInput.value.trim()) {
            if (typeof showToast === 'function') {
                showToast(`Searching for: ${searchInput.value}`, 'info');
            }
            // Search logic would be implemented here
        }
    }

    quickSearch(term) {
        const searchInput = document.getElementById('advancedSearchInput');
        if (searchInput) {
            searchInput.value = term;
            this.performAdvancedSearch();
        }
    }

    clearAllFilters() {
        // Clear all filter inputs
        document.querySelectorAll('#advancedSearchSystem input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('#advancedSearchSystem input[type="radio"]').forEach(rb => rb.checked = false);
        document.querySelectorAll('#advancedSearchSystem input[type="number"]').forEach(input => input.value = '');
        document.querySelectorAll('#advancedSearchSystem select').forEach(select => select.selectedIndex = 0);

        if (typeof showToast === 'function') {
            showToast('All filters cleared', 'info');
        }
    }

    updatePriceRange(value) {
        const rangeValueEl = document.getElementById('priceRangeValue');
        if (rangeValueEl) {
            rangeValueEl.textContent = `$${value}`;
        }
    }

    toggleCategoryFilter(category) {
        if (typeof showToast === 'function') {
            showToast(`Category filter: ${category}`, 'info');
        }
    }

    toggleConditionFilter(condition) {
        if (typeof showToast === 'function') {
            showToast(`Condition filter: ${condition}`, 'info');
        }
    }

    setRatingFilter(rating) {
        if (typeof showToast === 'function') {
            showToast(`Rating filter: ${rating}+ stars`, 'info');
        }
    }

    toggleVerifiedSellers() {
        if (typeof showToast === 'function') {
            showToast('Verified sellers filter toggled', 'info');
        }
    }

    toggleFreeShipping() {
        if (typeof showToast === 'function') {
            showToast('Free shipping filter toggled', 'info');
        }
    }

    toggleFastShipping() {
        if (typeof showToast === 'function') {
            showToast('Fast shipping filter toggled', 'info');
        }
    }

    setLocationFilter(location) {
        if (typeof showToast === 'function') {
            showToast(`Location filter: ${location}`, 'info');
        }
    }

    updateLocationRange(value) {
        const rangeValueEl = document.getElementById('locationRangeValue');
        if (rangeValueEl) {
            rangeValueEl.textContent = value;
        }
    }

    sortResults(sortBy) {
        if (typeof showToast === 'function') {
            showToast(`Sorting results by: ${sortBy}`, 'info');
        }
    }

    switchView(viewType) {
        const gridView = document.getElementById('searchResultsGrid');
        const listView = document.getElementById('searchResultsList');
        const buttons = document.querySelectorAll('.view-toggle');
        
        buttons.forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = '';
        });
        
        const activeBtn = document.querySelector(`.view-toggle[data-view="${viewType}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.style.background = 'var(--primary)';
            activeBtn.style.color = 'white';
        }

        if (viewType === 'grid') {
            if (gridView) gridView.style.display = 'grid';
            if (listView) listView.style.display = 'none';
        } else {
            if (gridView) gridView.style.display = 'none';
            if (listView) listView.style.display = 'block';
        }
    }

    quickView(productId) {
        if (typeof showToast === 'function') {
            showToast('Quick view opened', 'info');
        }
        // This would open a smaller product preview modal
    }

    searchSuggestion(suggestion) {
        const searchInput = document.getElementById('advancedSearchInput');
        if (searchInput) {
            searchInput.value = suggestion;
            this.performAdvancedSearch();
        }
    }
}

// Initialize the Marketplace Missing UI Components
const marketplaceMissingUI = new MarketplaceMissingUIComponents();
