/**
 * =============================================
 *  T&M Online Fashions — Shopify Buy SDK Integration
 * =============================================
 *
 *  This module provides a ready-to-use interface for
 *  Shopify's Storefront API via the Buy SDK.
 *
 *  FEATURES:
 *  - Product fetching (all products, single product, by collection)
 *  - Cart management (create, add items, remove items, get cart)
 *  - Checkout URL generation
 *  - Graceful "mock mode" when API tokens are not yet configured
 *
 *  SETUP:
 *  1. Include shopify.config.js BEFORE this file
 *  2. Include the Shopify Buy SDK (via CDN or npm)
 *  3. Call window.ShopifyStore.init() on page load
 *
 *  CDN for Shopify Buy SDK (add to your HTML <head>):
 *  <script src="https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js"></script>
 *
 *  USAGE:
 *    await ShopifyStore.init();
 *    const products = await ShopifyStore.fetchProducts();
 *    await ShopifyStore.addToCart(variantId, 1);
 *    ShopifyStore.goToCheckout();
 */

(function () {
    'use strict';

    // ── State ───────────────────────────────────────────
    let client = null;
    let checkout = null;
    let isInitialised = false;

    // ── Mock Data (used when Shopify is not configured) ─
    const MOCK_PRODUCTS = [
        {
            id: 'mock-1',
            title: 'Red Crepe Ready To Wear Saree',
            description: 'Red Crepe Ready To Wear Saree with Silk Blouse and Embroidery',
            price: '15990.00',
            currency: 'INR',
            image: './images/image-1.webp',
            availableForSale: true,
        },
        {
            id: 'mock-2',
            title: 'Black Lycra Ready To Wear Saree',
            description: 'Black Lycra Ready To Wear Saree with Embroidered Sleeveless Blouse',
            price: '18490.00',
            currency: 'INR',
            image: './images/image-2.webp',
            availableForSale: true,
        },
        {
            id: 'mock-3',
            title: 'Gold Sequins Embroidered Shimmer Lehenga',
            description: 'Gold Sequins Embroidered Shimmer Designer Lehenga with Sweetheart Neck',
            price: '25000.00',
            currency: 'INR',
            image: './images/image-3.webp',
            availableForSale: true,
        },
    ];

    const MOCK_CART = {
        id: 'mock-cart',
        lineItems: [],
        subtotalPrice: '0.00',
        totalPrice: '0.00',
        webUrl: '#',
    };

    // ── Utility ─────────────────────────────────────────

    function log(message, data) {
        const config = window.ShopifyConfig;
        if (config && config.debugMode) {
            console.log(`[ShopifyStore] ${message}`, data || '');
        }
    }

    function warn(message) {
        console.warn(`[ShopifyStore] ⚠️ ${message}`);
    }

    function isConfigured() {
        const config = window.ShopifyConfig;
        return config && config.isConfigured;
    }

    // ── Core API ────────────────────────────────────────

    const ShopifyStore = {

        /**
         * Initialise the Shopify Buy SDK client.
         * If credentials are not configured, enters mock mode.
         *
         * @returns {Promise<boolean>} true if real client connected
         */
        async init() {
            if (isInitialised) {
                log('Already initialised.');
                return isConfigured();
            }

            if (!isConfigured()) {
                warn(
                    'Shopify is NOT configured. Running in MOCK MODE.\n' +
                    'To connect to Shopify:\n' +
                    '  1. Copy .env.example → .env\n' +
                    '  2. Fill in your Shopify credentials\n' +
                    '  3. Reload the page'
                );
                isInitialised = true;
                checkout = { ...MOCK_CART };
                return false;
            }

            // Check if ShopifyBuy SDK is loaded
            if (typeof ShopifyBuy === 'undefined') {
                warn(
                    'Shopify Buy SDK not loaded. Add the following to your HTML <head>:\n' +
                    '<script src="https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js"></script>'
                );
                isInitialised = true;
                checkout = { ...MOCK_CART };
                return false;
            }

            try {
                const config = window.ShopifyConfig;
                client = ShopifyBuy.buildClient({
                    domain: config.storeDomain,
                    storefrontAccessToken: config.storefrontAccessToken,
                });

                // Create a checkout session
                checkout = await client.checkout.create();
                log('Shopify client initialised ✅', { domain: config.storeDomain });
                isInitialised = true;
                return true;
            } catch (error) {
                warn('Failed to initialise Shopify client: ' + error.message);
                checkout = { ...MOCK_CART };
                isInitialised = true;
                return false;
            }
        },

        // ── Products ────────────────────────────────────

        /**
         * Fetch all products from Shopify store.
         * Returns mock data if not configured.
         *
         * @param {number} [limit=20] Number of products to fetch
         * @returns {Promise<Array>} Array of product objects
         */
        async fetchProducts(limit = 20) {
            if (!isConfigured() || !client) {
                log('Returning mock products (not configured).');
                return MOCK_PRODUCTS;
            }

            try {
                const products = await client.product.fetchAll(limit);
                log(`Fetched ${products.length} products from Shopify.`);
                return products.map(ShopifyStore.normaliseProduct);
            } catch (error) {
                warn('Failed to fetch products: ' + error.message);
                return MOCK_PRODUCTS;
            }
        },

        /**
         * Fetch a single product by its Shopify ID.
         *
         * @param {string} productId The Shopify product GID
         * @returns {Promise<Object|null>}
         */
        async fetchProductById(productId) {
            if (!isConfigured() || !client) {
                log('Returning mock product (not configured).');
                return MOCK_PRODUCTS[0];
            }

            try {
                const product = await client.product.fetch(productId);
                log('Fetched product:', product.title);
                return ShopifyStore.normaliseProduct(product);
            } catch (error) {
                warn('Failed to fetch product: ' + error.message);
                return null;
            }
        },

        /**
         * Fetch products by collection handle.
         *
         * @param {string} collectionHandle e.g. 'sarees', 'lehengas'
         * @returns {Promise<Array>}
         */
        async fetchCollection(collectionHandle) {
            if (!isConfigured() || !client) {
                log('Returning mock products for collection (not configured).');
                return MOCK_PRODUCTS;
            }

            try {
                const collections = await client.collection.fetchAllWithProducts();
                const target = collections.find(
                    (c) => c.handle === collectionHandle
                );
                if (target) {
                    log(`Fetched collection "${collectionHandle}" with ${target.products.length} products.`);
                    return target.products.map(ShopifyStore.normaliseProduct);
                }
                warn(`Collection "${collectionHandle}" not found.`);
                return [];
            } catch (error) {
                warn('Failed to fetch collection: ' + error.message);
                return [];
            }
        },

        // ── Cart / Checkout ─────────────────────────────

        /**
         * Add a product variant to the cart.
         *
         * @param {string} variantId Shopify variant GID
         * @param {number} [quantity=1]
         * @returns {Promise<Object>} Updated checkout object
         */
        async addToCart(variantId, quantity = 1) {
            if (!isConfigured() || !client) {
                log(`Mock: Added variant ${variantId} x${quantity} to cart.`);
                MOCK_CART.lineItems.push({ variantId, quantity });
                return { ...MOCK_CART };
            }

            try {
                const lineItemsToAdd = [{ variantId, quantity }];
                checkout = await client.checkout.addLineItems(checkout.id, lineItemsToAdd);
                log('Added to cart:', { variantId, quantity });
                return checkout;
            } catch (error) {
                warn('Failed to add to cart: ' + error.message);
                return checkout;
            }
        },

        /**
         * Remove a line item from the cart.
         *
         * @param {string} lineItemId
         * @returns {Promise<Object>} Updated checkout
         */
        async removeFromCart(lineItemId) {
            if (!isConfigured() || !client) {
                log('Mock: Removed item from cart.');
                MOCK_CART.lineItems = MOCK_CART.lineItems.filter(
                    (item) => item.variantId !== lineItemId
                );
                return { ...MOCK_CART };
            }

            try {
                checkout = await client.checkout.removeLineItems(checkout.id, [lineItemId]);
                log('Removed from cart:', lineItemId);
                return checkout;
            } catch (error) {
                warn('Failed to remove from cart: ' + error.message);
                return checkout;
            }
        },

        /**
         * Get the current cart/checkout state.
         *
         * @returns {Object} Current checkout
         */
        getCart() {
            if (!isConfigured() || !client) {
                return { ...MOCK_CART };
            }
            return checkout;
        },

        /**
         * Get the number of items in the cart.
         *
         * @returns {number}
         */
        getCartCount() {
            if (!checkout) return 0;
            if (!isConfigured()) return MOCK_CART.lineItems.length;
            return checkout.lineItems
                ? checkout.lineItems.reduce((sum, item) => sum + item.quantity, 0)
                : 0;
        },

        /**
         * Redirect to the Shopify checkout page.
         */
        goToCheckout() {
            if (!checkout || !checkout.webUrl || checkout.webUrl === '#') {
                warn(
                    'Checkout not available. Shopify is not configured.\n' +
                    'Set up your .env file to enable real checkout.'
                );
                alert(
                    '🛒 Checkout is not available yet.\n\n' +
                    'Shopify integration is in setup mode.\n' +
                    'Once API tokens are configured, this will redirect you to a secure Shopify checkout.'
                );
                return;
            }
            window.location.href = checkout.webUrl;
        },

        // ── Helpers ─────────────────────────────────────

        /**
         * Normalise a Shopify SDK product into a simpler flat object.
         *
         * @param {Object} product Shopify SDK product
         * @returns {Object} Normalised product
         */
        normaliseProduct(product) {
            const variant = product.variants ? product.variants[0] : {};
            return {
                id: product.id,
                title: product.title,
                description: product.descriptionHtml || product.description || '',
                price: variant.price ? variant.price.amount || variant.price : '0.00',
                compareAtPrice: variant.compareAtPrice
                    ? variant.compareAtPrice.amount || variant.compareAtPrice
                    : null,
                currency: 'INR',
                image: product.images && product.images[0]
                    ? product.images[0].src
                    : './images/image-1.webp',
                images: product.images
                    ? product.images.map((img) => img.src)
                    : [],
                variantId: variant.id || null,
                availableForSale: product.availableForSale !== false,
                handle: product.handle || '',
            };
        },

        /**
         * Check if Shopify is properly configured and connected.
         *
         * @returns {boolean}
         */
        isReady() {
            return isInitialised && isConfigured() && client !== null;
        },

        /**
         * Check if running in mock/demo mode.
         *
         * @returns {boolean}
         */
        isMockMode() {
            return !isConfigured();
        },
    };

    // ── Expose globally ─────────────────────────────────
    if (typeof window !== 'undefined') {
        window.ShopifyStore = ShopifyStore;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ShopifyStore;
    }

})();
