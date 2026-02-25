// ===========================
//  PRODUCT DATA — loaded dynamically from ProductsCatalog
// ===========================
function getProductFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    if (id && window.ProductsCatalog) {
        var found = window.ProductsCatalog.find(function (p) { return p.id === id; });
        if (found) return found;
    }
    // Fallback: return first product in catalog
    if (window.ProductsCatalog && window.ProductsCatalog.length > 0) {
        return window.ProductsCatalog[0];
    }
    return null;
}

function getRelatedProducts(product) {
    if (!product || !window.ProductsCatalog) return [];
    return window.ProductsCatalog.filter(function (p) {
        return p.id !== product.id && (p.category === product.category || p.subcategory === product.subcategory);
    }).slice(0, 6).map(function (p) {
        return {
            id: p.id,
            name: p.name,
            price: p.price,
            currency: p.currency || '₹',
            image: p.images[0],
            link: 'product.html?id=' + p.id,
        };
    });
}

// ===========================
//  UTILITY FUNCTIONS
// ===========================
function formatPrice(amount, currency) {
    currency = currency || '₹';
    return currency + ' ' + Number(amount).toLocaleString('en-IN');
}

// ===========================
//  RENDER BREADCRUMB
// ===========================
function renderBreadcrumb(product) {
    const el = document.getElementById('pdpBreadcrumb');
    if (!el) return;
    el.innerHTML = `
        <a href="index.html" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-sep"><i class="fa-solid fa-chevron-right"></i></span>
        <a href="#" class="breadcrumb-link">${product.category}</a>
        <span class="breadcrumb-sep"><i class="fa-solid fa-chevron-right"></i></span>
        <span class="breadcrumb-current">${product.subcategory}</span>
    `;
}

// ===========================
//  RENDER IMAGE GALLERY
// ===========================
function renderGallery(product) {
    const el = document.getElementById('pdpGallery');
    if (!el) return;

    const thumbs = product.images.map((img, i) =>
        `<div class="pdp-thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
            <img src="${img}" alt="${product.name} view ${i + 1}" loading="lazy">
        </div>`
    ).join('');

    el.innerHTML = `
        <div class="pdp-thumbs-col">${thumbs}</div>
        <div class="pdp-main-image-wrap">
            <img src="${product.images[0]}" alt="${product.name}" class="pdp-main-image" id="pdpMainImage">
        </div>
    `;

    // Thumbnail click handler
    const thumbEls = el.querySelectorAll('.pdp-thumb');
    const mainImg = document.getElementById('pdpMainImage');

    thumbEls.forEach(th => {
        th.addEventListener('click', function () {
            const idx = parseInt(this.dataset.index);
            thumbEls.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            mainImg.src = product.images[idx];
        });
    });
}

// ===========================
//  RENDER PRODUCT INFO (Samyakk style)
// ===========================
function renderProductInfo(product) {
    const el = document.getElementById('pdpInfo');
    if (!el) return;

    // Size dropdown options
    const sizeOpts = product.sizes.map(s =>
        `<option value="${s.value}">${s.label}</option>`
    ).join('');

    el.innerHTML = `
        <div class="pdp-info-inner">

            <!-- Title row with share & wishlist -->
            <div class="pdp-title-row">
                <h1 class="pdp-title">${product.name}- ${product.sku}</h1>
                <div class="pdp-title-actions">
                    <button class="pdp-icon-action" id="pdpShareBtn" title="Share"><i class="fa-solid fa-arrow-up-from-bracket"></i></button>
                    <button class="pdp-icon-action" id="pdpWishlistBtn" title="Wishlist"><i class="fa-regular fa-heart"></i></button>
                </div>
            </div>

            <!-- Price + delivery -->
            <div class="pdp-price-row">
                <span class="pdp-price">${formatPrice(product.price, product.currency)}</span>
                <span class="pdp-delivery-days">${product.deliveryDays}</span>
            </div>

            <!-- EMI / Pay Later boxes -->
            <div class="pdp-payment-options">
                <div class="pdp-payment-box">
                    <div class="pdp-payment-box-top">
                        <span>EMI from <strong>${product.currency}${product.emiPerMonth}/month</strong></span>
                    </div>
                    <div class="pdp-payment-box-bottom">
                        <span class="pdp-payment-more"><i class="fa-solid fa-piggy-bank"></i> & more</span>
                        <a href="#" class="pdp-payment-link">View plans</a>
                    </div>
                </div>
                <div class="pdp-payment-box">
                    <div class="pdp-payment-box-top">
                        <span><strong>Pay later available</strong></span>
                    </div>
                    <div class="pdp-payment-box-bottom">
                        <span class="pdp-payment-more"><i class="fa-regular fa-calendar"></i> & more</span>
                        <a href="#" class="pdp-payment-link">View options</a>
                    </div>
                </div>
            </div>

            <!-- Secured by Razorpay -->
            <div class="pdp-secured-row">
                Secured by <strong>Razorpay</strong>
            </div>

            <!-- Size selector (dropdown) -->
            <div class="pdp-size-group">
                <label class="pdp-size-label">Size <span class="pdp-required">*</span></label>
                <div class="pdp-select-wrap">
                    <select class="pdp-size-select" id="pdpSizeSelect">${sizeOpts}</select>
                    <i class="fa-solid fa-chevron-down pdp-select-arrow"></i>
                </div>
                <a href="#" class="pdp-measure-link">${product.measurementLink}</a>
            </div>

            <!-- COD Pincode check -->
            <div class="pdp-cod-section">
                <div class="pdp-cod-header">
                    <span class="pdp-cod-title">Check Delivery for COD (India)</span>
                    <a href="#" class="pdp-store-locator">Store Locator</a>
                </div>
                <div class="pdp-pincode-row">
                    <input type="text" class="pdp-pincode-input" id="pdpPincodeInput" placeholder="Enter Pincode here..." maxlength="6">
                    <button class="pdp-pincode-btn" id="pdpPincodeBtn">Check Now</button>
                </div>
                <p class="pdp-pincode-result" id="pdpPincodeResult"></p>
            </div>

            <!-- Delivery Info -->
            <div class="pdp-delivery-info">
                <div class="pdp-delivery-item">
                    <i class="fa-solid fa-truck-fast"></i>
                    <span>Free Delivery across India</span>
                </div>
                <div class="pdp-delivery-item">
                    <i class="fa-solid fa-globe"></i>
                    <span>Free Worldwide Shipping</span>
                </div>
            </div>

            <!-- Action buttons -->
            <div class="pdp-action-buttons">
                <button class="pdp-add-to-cart" id="pdpAddToCart">
                    <i class="fa-solid fa-bag-shopping"></i> ADD TO CART
                </button>
                <button class="pdp-buy-now" id="pdpBuyNow">
                    <i class="fa-solid fa-bolt"></i> BUY IT NOW
                </button>
            </div>

            <!-- Trust icons row -->
            <div class="pdp-trust-row">
                <div class="pdp-trust-chip">
                    <i class="fa-solid fa-shield-halved"></i>
                    <span>Secure Payment</span>
                </div>
                <div class="pdp-trust-chip">
                    <i class="fa-solid fa-rotate-left"></i>
                    <span>Easy Returns</span>
                </div>
                <div class="pdp-trust-chip">
                    <i class="fa-solid fa-gem"></i>
                    <span>100% Authentic</span>
                </div>
            </div>

        </div>
    `;

    // --- Interactive Handlers ---

    // Wishlist toggle
    const wishBtn = document.getElementById('pdpWishlistBtn');
    let wishlisted = false;
    wishBtn.addEventListener('click', function () {
        wishlisted = !wishlisted;
        const icon = this.querySelector('i');
        if (wishlisted) {
            icon.classList.replace('fa-regular', 'fa-solid');
            icon.style.color = '#ff3b3b';
        } else {
            icon.classList.replace('fa-solid', 'fa-regular');
            icon.style.color = '';
        }
    });

    // Add to cart — wired to TMStore
    document.getElementById('pdpAddToCart').addEventListener('click', function () {
        var sizeSelect = document.getElementById('pdpSizeSelect');
        var selectedSize = sizeSelect ? sizeSelect.value : 'FREE';
        if (!selectedSize) {
            sizeSelect.focus();
            sizeSelect.style.borderColor = '#e53935';
            setTimeout(function () { sizeSelect.style.borderColor = ''; }, 2000);
            return;
        }
        if (window.TMStore) {
            window.TMStore.addToCart(product.id, selectedSize, 1);
        }
        this.classList.add('added');
        this.innerHTML = '<i class="fa-solid fa-check"></i> ADDED TO CART';
        var btn = this;
        setTimeout(function () {
            btn.classList.remove('added');
            btn.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> ADD TO CART';
        }, 2000);
    });

    // Buy Now — add to cart + go to checkout
    var buyNowBtn = document.getElementById('pdpBuyNow');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', function () {
            var sizeSelect = document.getElementById('pdpSizeSelect');
            var selectedSize = sizeSelect ? sizeSelect.value : 'FREE';
            if (!selectedSize) {
                sizeSelect.focus();
                sizeSelect.style.borderColor = '#e53935';
                setTimeout(function () { sizeSelect.style.borderColor = ''; }, 2000);
                return;
            }
            if (window.TMStore) {
                window.TMStore.addToCart(product.id, selectedSize, 1);
                window.TMStore.goToCheckout();
            }
        });
    }

    // Pincode check
    document.getElementById('pdpPincodeBtn').addEventListener('click', function () {
        const pincode = document.getElementById('pdpPincodeInput').value.trim();
        const result = document.getElementById('pdpPincodeResult');
        if (pincode.length !== 6 || isNaN(pincode)) {
            result.innerHTML = '<span class="pdp-pin-error"><i class="fa-solid fa-circle-xmark"></i> Please enter a valid 6-digit pincode</span>';
        } else {
            result.innerHTML = '<span class="pdp-pin-success"><i class="fa-solid fa-circle-check"></i> COD available for pincode ' + pincode + '. Estimated delivery: ' + product.deliveryDays + '</span>';
        }
    });

    // Enter key on pincode
    document.getElementById('pdpPincodeInput').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') document.getElementById('pdpPincodeBtn').click();
    });
}

// ===========================
//  RENDER TABS
// ===========================
function renderTabs(product) {
    const el = document.getElementById('pdpTabs');
    if (!el) return;

    // Build details table
    const detailRows = Object.entries(product.details).map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        return `<tr><td class="pdp-detail-label">${label}</td><td class="pdp-detail-value">${value}</td></tr>`;
    }).join('');

    el.innerHTML = `
        <div class="pdp-tabs-container">
            <div class="pdp-tab-nav">
                <button class="pdp-tab-btn active" data-tab="description">Description</button>
                <button class="pdp-tab-btn" data-tab="details">Product Details</button>
                <button class="pdp-tab-btn" data-tab="shipping">Shipping & Returns</button>
            </div>
            <div class="pdp-tab-content active" id="tab-description">
                ${product.description}
            </div>
            <div class="pdp-tab-content" id="tab-details">
                <table class="pdp-details-table">
                    <tbody>${detailRows}</tbody>
                </table>
            </div>
            <div class="pdp-tab-content" id="tab-shipping">
                ${product.shippingInfo}
            </div>
        </div>
    `;

    // Tab switching
    const tabBtns = el.querySelectorAll('.pdp-tab-btn');
    const tabContents = el.querySelectorAll('.pdp-tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(`tab-${this.dataset.tab}`).classList.add('active');
        });
    });
}

// ===========================
//  RENDER RELATED PRODUCTS
// ===========================
function renderRelatedProducts(products) {
    const el = document.getElementById('pdpRelated');
    if (!el) return;

    const cards = products.map(p => `
        <a href="${p.link}" class="pdp-related-card">
            <div class="pdp-related-img">
                <img src="${p.image}" alt="${p.name}" loading="lazy">
                <button class="wishlist-btn pdp-related-wishlist"><i class="fa-regular fa-heart"></i></button>
            </div>
            <div class="pdp-related-info">
                <p class="pdp-related-name">${p.name}</p>
                <p class="pdp-related-price">${formatPrice(p.price)}</p>
            </div>
        </a>
    `).join('');

    el.innerHTML = `
        <div class="pdp-related-container">
            <div class="pdp-related-header">
                <h2 class="section-title-alt">You May Also Like</h2>
                <div class="carousel-nav">
                    <button class="nav-btn prev" id="relatedPrev">&#8249;</button>
                    <button class="nav-btn next" id="relatedNext">&#8250;</button>
                </div>
            </div>
            <div class="pdp-related-viewport">
                <div class="pdp-related-track" id="relatedTrack">
                    ${cards}
                </div>
            </div>
        </div>
    `;

    // Carousel logic
    const track = document.getElementById('relatedTrack');
    const prevBtn = document.getElementById('relatedPrev');
    const nextBtn = document.getElementById('relatedNext');

    if (!track || !prevBtn || !nextBtn) return;

    let scrollAmount = 0;
    const cardWidth = 260 + 20;

    nextBtn.addEventListener('click', () => {
        const maxScroll = track.scrollWidth - track.parentElement.clientWidth;
        if (scrollAmount < maxScroll) {
            scrollAmount += cardWidth;
            if (scrollAmount > maxScroll) scrollAmount = maxScroll;
            track.style.transform = `translateX(-${scrollAmount}px)`;
        }
    });

    prevBtn.addEventListener('click', () => {
        if (scrollAmount > 0) {
            scrollAmount -= cardWidth;
            if (scrollAmount < 0) scrollAmount = 0;
            track.style.transform = `translateX(-${scrollAmount}px)`;
        }
    });

    // Wishlist buttons in related
    el.querySelectorAll('.pdp-related-wishlist').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.toggle('active');
            const icon = this.querySelector('i');
            if (this.classList.contains('active')) {
                icon.classList.replace('fa-regular', 'fa-solid');
                icon.style.color = '#ff3b3b';
            } else {
                icon.classList.replace('fa-solid', 'fa-regular');
                icon.style.color = '';
            }
        });
    });
}

// ===========================
//  MOBILE NAV DRAWER
// ===========================
(function () {
    const hamburger = document.getElementById('hamburgerToggle');
    const drawer = document.getElementById('mobileNavDrawer');
    const backdrop = document.getElementById('mobileNavBackdrop');
    const closeBtn = document.getElementById('mobileNavClose');

    if (!hamburger || !drawer || !backdrop || !closeBtn) return;

    function openDrawer() {
        drawer.classList.add('open');
        backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        drawer.classList.remove('open');
        backdrop.classList.remove('open');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);

    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) closeDrawer();
    });
})();

// ===========================
//  INITIALIZE PAGE
// ===========================
document.addEventListener('DOMContentLoaded', function () {
    var productData = getProductFromUrl();
    if (!productData) {
        document.body.innerHTML = '<div style="text-align:center;padding:100px 20px;"><h2>Product Not Found</h2><p>The product you are looking for does not exist.</p><a href="index.html" style="color:#b8860b;">Back to Home</a></div>';
        return;
    }

    // Update page title
    document.title = productData.name + ' – T&M Online Fashions';

    renderBreadcrumb(productData);
    renderGallery(productData);
    renderProductInfo(productData);
    renderTabs(productData);

    var related = getRelatedProducts(productData);
    renderRelatedProducts(related);

    window.scrollTo({ top: 0, behavior: 'auto' });
});
