/**
 * =============================================
 *  T&M Online Fashions — Store Engine
 * =============================================
 *  Shared across ALL pages. Provides:
 *  - Cart management (localStorage persistence)
 *  - Cart drawer (slide-out panel)
 *  - Product grid rendering for collection pages
 *  - Cart badge updates
 *  - Checkout integration with ShopifyStore
 */

(function () {
    'use strict';

    // ── Cart Storage Key ────────────────────────────────
    const CART_KEY = 'tm_cart';
    const WISHLIST_KEY = 'tm_wishlist';

    // ── Utility ─────────────────────────────────────────
    function formatPrice(amount, currency) {
        currency = currency || '₹';
        return currency + ' ' + Number(amount).toLocaleString('en-IN');
    }

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function getWishlist() {
        try {
            return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveWishlist(list) {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    }

    // ── TMStore Object ──────────────────────────────────
    const TMStore = {

        // ── Cart ─────────────────────────────────────

        addToCart: function (productId, size, quantity) {
            quantity = quantity || 1;
            size = size || 'FREE';
            var cart = getCart();
            var existing = cart.find(function (item) {
                return item.id === productId && item.size === size;
            });

            if (existing) {
                existing.quantity += quantity;
            } else {
                var product = TMStore.getProductById(productId);
                if (!product) return;
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    currency: product.currency || '₹',
                    image: product.images[0],
                    size: size,
                    quantity: quantity,
                });
            }

            saveCart(cart);
            TMStore.updateCartBadge();
            TMStore.renderCartDrawer();
            TMStore.openCartDrawer();

            // Sync to ShopifyStore if configured
            if (window.ShopifyStore && window.ShopifyStore.isReady()) {
                window.ShopifyStore.addToCart(productId, quantity);
            }
        },

        removeFromCart: function (productId, size) {
            var cart = getCart();
            cart = cart.filter(function (item) {
                return !(item.id === productId && item.size === size);
            });
            saveCart(cart);
            TMStore.updateCartBadge();
            TMStore.renderCartDrawer();
        },

        updateQuantity: function (productId, size, newQty) {
            var cart = getCart();
            var item = cart.find(function (i) {
                return i.id === productId && i.size === size;
            });
            if (item) {
                item.quantity = Math.max(1, newQty);
            }
            saveCart(cart);
            TMStore.updateCartBadge();
            TMStore.renderCartDrawer();
        },

        getCartItems: function () {
            return getCart();
        },

        getCartCount: function () {
            return getCart().reduce(function (sum, item) {
                return sum + item.quantity;
            }, 0);
        },

        getCartTotal: function () {
            return getCart().reduce(function (sum, item) {
                return sum + (item.price * item.quantity);
            }, 0);
        },

        clearCart: function () {
            saveCart([]);
            TMStore.updateCartBadge();
            TMStore.renderCartDrawer();
        },

        // ── Wishlist ─────────────────────────────────

        toggleWishlist: function (productId) {
            var list = getWishlist();
            var idx = list.indexOf(productId);
            if (idx > -1) {
                list.splice(idx, 1);
            } else {
                list.push(productId);
            }
            saveWishlist(list);
            TMStore.updateWishlistBadge();
            return idx === -1; // true = added, false = removed
        },

        isInWishlist: function (productId) {
            return getWishlist().indexOf(productId) > -1;
        },

        // ── Product Lookup ───────────────────────────

        getProductById: function (id) {
            if (!window.ProductsCatalog) return null;
            return window.ProductsCatalog.find(function (p) {
                return p.id === id;
            }) || null;
        },

        getProductsByCategory: function (category) {
            if (!window.ProductsCatalog) return [];
            return window.ProductsCatalog.filter(function (p) {
                return p.category === category;
            });
        },

        getProductsBySubcategory: function (subcategory) {
            if (!window.ProductsCatalog) return [];
            return window.ProductsCatalog.filter(function (p) {
                return p.subcategory === subcategory;
            });
        },

        getRelatedProducts: function (productId, limit) {
            limit = limit || 6;
            var product = TMStore.getProductById(productId);
            if (!product || !window.ProductsCatalog) return [];
            return window.ProductsCatalog.filter(function (p) {
                return p.id !== productId && (p.category === product.category || p.subcategory === product.subcategory);
            }).slice(0, limit);
        },

        // ── UI: Cart Badge ───────────────────────────

        updateCartBadge: function () {
            var count = TMStore.getCartCount();
            // Update all cart badges on page
            var badges = document.querySelectorAll('.cart-count-badge');
            badges.forEach(function (badge) {
                badge.textContent = count;
                if (count > 0) {
                    badge.classList.add('show');
                } else {
                    badge.classList.remove('show');
                }
            });
        },

        updateWishlistBadge: function () {
            var count = getWishlist().length;
            var badge = document.getElementById('wishlistCount');
            if (badge) {
                badge.textContent = count;
                if (count > 0) {
                    badge.classList.add('show');
                } else {
                    badge.classList.remove('show');
                }
            }
        },

        // ── UI: Cart Drawer ──────────────────────────

        openCartDrawer: function () {
            var drawer = document.getElementById('cartDrawer');
            var backdrop = document.getElementById('cartDrawerBackdrop');
            if (drawer) drawer.classList.add('open');
            if (backdrop) backdrop.classList.add('open');
            document.body.style.overflow = 'hidden';
        },

        closeCartDrawer: function () {
            var drawer = document.getElementById('cartDrawer');
            var backdrop = document.getElementById('cartDrawerBackdrop');
            if (drawer) drawer.classList.remove('open');
            if (backdrop) backdrop.classList.remove('open');
            document.body.style.overflow = '';
        },

        renderCartDrawer: function () {
            var content = document.getElementById('cartDrawerContent');
            if (!content) return;

            var cart = getCart();

            if (cart.length === 0) {
                content.innerHTML = '<div class="cart-empty">' +
                    '<i class="fa-solid fa-bag-shopping"></i>' +
                    '<p>Your cart is empty</p>' +
                    '<a href="index.html" class="cart-continue-btn">Continue Shopping</a>' +
                    '</div>';
                var footer = document.getElementById('cartDrawerFooter');
                if (footer) footer.style.display = 'none';
                return;
            }

            var html = '';
            cart.forEach(function (item) {
                html += '<div class="cart-item" data-id="' + item.id + '" data-size="' + item.size + '">' +
                    '<div class="cart-item-img">' +
                    '<img src="' + item.image + '" alt="' + item.name + '">' +
                    '</div>' +
                    '<div class="cart-item-details">' +
                    '<p class="cart-item-name">' + item.name + '</p>' +
                    '<p class="cart-item-size">Size: ' + item.size + '</p>' +
                    '<p class="cart-item-price">' + formatPrice(item.price, item.currency) + '</p>' +
                    '<div class="cart-item-qty">' +
                    '<button class="cart-qty-btn cart-qty-minus" data-id="' + item.id + '" data-size="' + item.size + '">−</button>' +
                    '<span class="cart-qty-value">' + item.quantity + '</span>' +
                    '<button class="cart-qty-btn cart-qty-plus" data-id="' + item.id + '" data-size="' + item.size + '">+</button>' +
                    '</div>' +
                    '</div>' +
                    '<button class="cart-item-remove" data-id="' + item.id + '" data-size="' + item.size + '">' +
                    '<i class="fa-solid fa-xmark"></i>' +
                    '</button>' +
                    '</div>';
            });

            content.innerHTML = html;

            // Show footer
            var footer = document.getElementById('cartDrawerFooter');
            if (footer) {
                footer.style.display = '';
                var totalEl = document.getElementById('cartDrawerTotal');
                if (totalEl) {
                    totalEl.textContent = formatPrice(TMStore.getCartTotal());
                }
            }

            // Attach event listeners
            content.querySelectorAll('.cart-qty-minus').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var id = this.dataset.id;
                    var size = this.dataset.size;
                    var item = getCart().find(function (i) { return i.id === id && i.size === size; });
                    if (item && item.quantity > 1) {
                        TMStore.updateQuantity(id, size, item.quantity - 1);
                    }
                });
            });

            content.querySelectorAll('.cart-qty-plus').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var id = this.dataset.id;
                    var size = this.dataset.size;
                    var item = getCart().find(function (i) { return i.id === id && i.size === size; });
                    if (item) {
                        TMStore.updateQuantity(id, size, item.quantity + 1);
                    }
                });
            });

            content.querySelectorAll('.cart-item-remove').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    TMStore.removeFromCart(this.dataset.id, this.dataset.size);
                });
            });
        },

        // ── UI: Product Grid ─────────────────────────

        renderProductGrid: function (containerId, products, options) {
            options = options || {};
            var container = document.getElementById(containerId);
            if (!container) return;

            if (!products || products.length === 0) {
                container.innerHTML = '<div class="collection-empty">' +
                    '<i class="fa-solid fa-box-open"></i>' +
                    '<p>No products found in this collection.</p>' +
                    '</div>';
                return;
            }

            // Sort
            var sortBy = options.sort || 'default';
            var sorted = products.slice();
            if (sortBy === 'price-low') {
                sorted.sort(function (a, b) { return a.price - b.price; });
            } else if (sortBy === 'price-high') {
                sorted.sort(function (a, b) { return b.price - a.price; });
            } else if (sortBy === 'name-az') {
                sorted.sort(function (a, b) { return a.name.localeCompare(b.name); });
            }

            var html = '';
            sorted.forEach(function (p) {
                var isWishlisted = TMStore.isInWishlist(p.id);
                var heartClass = isWishlisted ? 'fa-solid' : 'fa-regular';
                var heartStyle = isWishlisted ? ' style="color:#ff3b3b"' : '';
                var compareHtml = p.compareAtPrice
                    ? '<span class="grid-compare-price">' + formatPrice(p.compareAtPrice, p.currency) + '</span>'
                    : '';
                var discountPercent = p.compareAtPrice
                    ? Math.round((1 - p.price / p.compareAtPrice) * 100)
                    : 0;
                var badge = discountPercent > 0
                    ? '<span class="grid-badge">' + discountPercent + '% OFF</span>'
                    : '';

                html += '<a href="product.html?id=' + p.id + '" class="grid-product-card" data-id="' + p.id + '">' +
                    '<div class="grid-product-img">' +
                    '<img src="' + p.images[0] + '" alt="' + p.name + '" loading="lazy">' +
                    badge +
                    '<button class="grid-wishlist-btn" data-id="' + p.id + '" title="Wishlist">' +
                    '<i class="' + heartClass + ' fa-heart"' + heartStyle + '></i>' +
                    '</button>' +
                    '</div>' +
                    '<div class="grid-product-info">' +
                    '<p class="grid-product-name">' + p.name + '</p>' +
                    '<div class="grid-product-pricing">' +
                    '<span class="grid-product-price">' + formatPrice(p.price, p.currency) + '</span>' +
                    compareHtml +
                    '</div>' +
                    '<p class="grid-product-delivery"><i class="fa-solid fa-truck-fast"></i> ' + p.deliveryDays + '</p>' +
                    '</div>' +
                    '</a>';
            });

            container.innerHTML = html;

            // Wishlist button clicks (prevent navigation)
            container.querySelectorAll('.grid-wishlist-btn').forEach(function (btn) {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var id = this.dataset.id;
                    var added = TMStore.toggleWishlist(id);
                    var icon = this.querySelector('i');
                    if (added) {
                        icon.classList.replace('fa-regular', 'fa-solid');
                        icon.style.color = '#ff3b3b';
                    } else {
                        icon.classList.replace('fa-solid', 'fa-regular');
                        icon.style.color = '';
                    }
                });
            });
        },

        // ── Checkout ─────────────────────────────────

        goToCheckout: function () {
            var cart = getCart();
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }

            // If ShopifyStore is configured, use its checkout
            if (window.ShopifyStore && window.ShopifyStore.isReady()) {
                window.ShopifyStore.goToCheckout();
                return;
            }

            // Mock checkout (pre-Shopify)
            var total = TMStore.getCartTotal();
            var msg = '🛒 Order Summary\n\n';
            cart.forEach(function (item) {
                msg += '• ' + item.name + '\n';
                msg += '  Size: ' + item.size + ' | Qty: ' + item.quantity + ' | ' + formatPrice(item.price * item.quantity, item.currency) + '\n\n';
            });
            msg += '────────────────\n';
            msg += 'Total: ' + formatPrice(total) + '\n\n';
            msg += 'Once your Shopify store is connected, this will redirect you to a secure Shopify checkout.\n\n';
            msg += 'For now, you can reach us on WhatsApp to place your order!';

            alert(msg);
        },

        // ── Init ─────────────────────────────────────

        init: function () {
            TMStore.updateCartBadge();
            TMStore.updateWishlistBadge();
            TMStore.renderCartDrawer();
            TMStore._bindCartDrawerEvents();
            TMStore._bindCartIconClick();

            // Init ShopifyStore if available
            if (window.ShopifyStore) {
                window.ShopifyStore.init();
            }
        },

        _bindCartDrawerEvents: function () {
            var closeBtn = document.getElementById('cartDrawerClose');
            var backdrop = document.getElementById('cartDrawerBackdrop');
            var checkoutBtn = document.getElementById('cartCheckoutBtn');

            if (closeBtn) {
                closeBtn.addEventListener('click', TMStore.closeCartDrawer);
            }
            if (backdrop) {
                backdrop.addEventListener('click', TMStore.closeCartDrawer);
            }
            if (checkoutBtn) {
                checkoutBtn.addEventListener('click', function () {
                    TMStore.goToCheckout();
                });
            }
        },

        _bindCartIconClick: function () {
            // Bind all bag icons in header to open cart drawer
            document.querySelectorAll('[title="Cart"]').forEach(function (btn) {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    TMStore.renderCartDrawer();
                    TMStore.openCartDrawer();
                });
            });
        },
    };

    // ── Expose globally ─────────────────────────────────
    if (typeof window !== 'undefined') {
        window.TMStore = TMStore;
        // Auto-init on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', TMStore.init);
        } else {
            TMStore.init();
        }
    }

})();
