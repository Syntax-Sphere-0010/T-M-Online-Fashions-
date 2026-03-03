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
//  RENDER IMAGE GALLERY (with zoom)
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
        <div class="pdp-main-image-wrap" id="pdpMainWrap">
            <img src="${product.images[0]}" alt="${product.name}" class="pdp-main-image" id="pdpMainImage">
        </div>
        <div class="pdp-zoom-panel" id="pdpZoomPanel">
            <img src="${product.images[0]}" alt="${product.name} zoom" id="pdpZoomImage">
        </div>
    `;

    // Thumbnail click handler
    const thumbEls = el.querySelectorAll('.pdp-thumb');
    const mainImg = document.getElementById('pdpMainImage');
    const zoomImg = document.getElementById('pdpZoomImage');

    thumbEls.forEach(th => {
        th.addEventListener('click', function () {
            const idx = parseInt(this.dataset.index);
            thumbEls.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            mainImg.src = product.images[idx];
            zoomImg.src = product.images[idx];
        });
    });

    // Image zoom on hover (desktop only)
    const mainWrap = document.getElementById('pdpMainWrap');
    const zoomPanel = document.getElementById('pdpZoomPanel');

    function isMobile() { return window.innerWidth <= 768; }

    if (mainWrap && zoomPanel) {
        mainWrap.addEventListener('mouseenter', function () {
            if (!isMobile()) {
                zoomPanel.classList.add('visible');
            }
        });
        mainWrap.addEventListener('mouseleave', function () {
            zoomPanel.classList.remove('visible');
        });

        // Move zoom position to follow cursor
        mainWrap.addEventListener('mousemove', function (e) {
            if (isMobile()) return;
            const rect = mainWrap.getBoundingClientRect();
            const xPct = ((e.clientX - rect.left) / rect.width) * 100;
            const yPct = ((e.clientY - rect.top) / rect.height) * 100;
            zoomImg.style.transformOrigin = `${xPct}% ${yPct}%`;
        });
    }
}

// ===========================
//  RENDER PRODUCT INFO (Redesigned)
// ===========================
function renderProductInfo(product) {
    const el = document.getElementById('pdpInfo');
    if (!el) return;

    // Size dropdown options with prices
    const sizeOpts = product.sizes.map(s =>
        `<div class="pdp-size-btn" data-value="${s.value}" data-price="${s.price || product.price}">${s.label}${s.price ? ' – ' + formatPrice(s.price, product.currency) : ''}</div>`
    ).join('');

    el.innerHTML = `
        <div class="pdp-info-inner">

            <!-- Title row with share & wishlist -->
            <div class="pdp-title-row">
                <h1 class="pdp-title">${product.name} – ${product.sku}</h1>
                <div class="pdp-title-actions">
                    <button class="pdp-icon-action pdp-share-btn" id="pdpShareBtn" title="Share">
                        <i class="fa-solid fa-arrow-up-from-bracket"></i>
                        <span class="pdp-action-tooltip">Share</span>
                    </button>
                    <button class="pdp-icon-action pdp-wishlist-action" id="pdpWishlistBtn" title="Wishlist">
                        <i class="fa-regular fa-heart"></i>
                        <span class="pdp-action-tooltip">Wishlist</span>
                    </button>
                </div>
            </div>

            <!-- Price + delivery -->
            <div class="pdp-price-row">
                <span class="pdp-price" data-base-price="${product.price}">${formatPrice(product.price, product.currency)}</span>
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

            <!-- Size + Pincode side by side (no full border, only border-bottom) -->
            <div class="pdp-size-pincode-row">
                <!-- Size selector -->
                <div class="pdp-size-group pdp-side-box">
                    <label class="pdp-side-label">SIZE <span class="pdp-required">*</span></label>
                    <input type="hidden" id="pdpSizeSelect" value="${product.sizes[0]?.value || 'FREE'}">
                    <div class="pdp-size-btn-wrap" id="pdpSizeBtnWrap" onclick="toggleSizeDropdown()">
                        <span id="pdpSizeSelectedLabel">${product.sizes[0]?.label || 'Select Size'}</span>
                        <i class="fa-solid fa-chevron-down pdp-side-chevron"></i>
                    </div>
                    <div class="pdp-size-dropdown" id="pdpSizeDropdown">
                        ${sizeOpts}
                    </div>
                    <a href="#" class="pdp-measure-link">${product.measurementLink}</a>
                </div>

                <!-- COD Pincode check -->
                <div class="pdp-cod-section pdp-side-box">
                    <label class="pdp-side-label">PINCODE</label>
                    <div class="pdp-pincode-row">
                        <input type="text" class="pdp-pincode-input" id="pdpPincodeInput" placeholder="Enter pincode..." maxlength="6">
                        <button class="pdp-pincode-btn" id="pdpPincodeBtn">Check</button>
                    </div>
                    <p class="pdp-pincode-result" id="pdpPincodeResult"></p>
                </div>
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

            <!-- Action buttons (side by side on both desktop and mobile) -->
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

    // --- Size dropdown toggle ---
    window.toggleSizeDropdown = function () {
        const dd = document.getElementById('pdpSizeDropdown');
        if (dd) dd.classList.toggle('open');
    };

    // Size button selection
    document.querySelectorAll('.pdp-size-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            document.querySelectorAll('.pdp-size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('pdpSizeSelect').value = this.dataset.value;
            document.getElementById('pdpSizeSelectedLabel').textContent = this.textContent;
            document.getElementById('pdpSizeDropdown').classList.remove('open');
        });
    });

    // Close size dropdown on outside click
    document.addEventListener('click', function (e) {
        const wrap = document.getElementById('pdpSizeBtnWrap');
        const dd = document.getElementById('pdpSizeDropdown');
        if (dd && wrap && !wrap.contains(e.target)) {
            dd.classList.remove('open');
        }
    });

    // --- Wishlist toggle with animation ---
    const wishBtn = document.getElementById('pdpWishlistBtn');
    let wishlisted = false;
    wishBtn.addEventListener('click', function () {
        wishlisted = !wishlisted;
        const icon = this.querySelector('i');
        this.classList.toggle('active', wishlisted);
        if (wishlisted) {
            icon.classList.replace('fa-regular', 'fa-solid');
            icon.style.color = '#e63946';
            // Pulse animation
            this.classList.add('pulse');
            setTimeout(() => this.classList.remove('pulse'), 400);
        } else {
            icon.classList.replace('fa-solid', 'fa-regular');
            icon.style.color = '';
        }
    });

    // --- Share toggle ---
    const shareBtn = document.getElementById('pdpShareBtn');
    shareBtn.addEventListener('click', function () {
        if (navigator.share) {
            navigator.share({ title: product.name, url: window.location.href }).catch(() => { });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.classList.add('shared');
                const icon = this.querySelector('i');
                icon.classList.replace('fa-arrow-up-from-bracket', 'fa-check');
                this.querySelector('.pdp-action-tooltip').textContent = 'Copied!';
                setTimeout(() => {
                    this.classList.remove('shared');
                    icon.classList.replace('fa-check', 'fa-arrow-up-from-bracket');
                    this.querySelector('.pdp-action-tooltip').textContent = 'Share';
                }, 2000);
            }).catch(() => { });
        }
    });

    // --- Add to cart — wired to TMStore ---
    document.getElementById('pdpAddToCart').addEventListener('click', function () {
        var sizeVal = document.getElementById('pdpSizeSelect').value;
        if (!sizeVal) sizeVal = 'FREE';
        if (window.TMStore) {
            window.TMStore.addToCart(product.id, sizeVal, 1);
        }
        this.classList.add('added');
        this.innerHTML = '<i class="fa-solid fa-check"></i> ADDED!';
        var btn = this;
        setTimeout(function () {
            btn.classList.remove('added');
            btn.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> ADD TO CART';
        }, 2000);
    });

    // --- Buy Now ---
    var buyNowBtn = document.getElementById('pdpBuyNow');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', function () {
            var sizeVal = document.getElementById('pdpSizeSelect').value;
            if (!sizeVal) sizeVal = 'FREE';
            if (window.TMStore) {
                window.TMStore.addToCart(product.id, sizeVal, 1);
                window.TMStore.goToCheckout();
            }
        });
    }

    // --- Pincode check ---
    document.getElementById('pdpPincodeBtn').addEventListener('click', function () {
        const pincode = document.getElementById('pdpPincodeInput').value.trim();
        const result = document.getElementById('pdpPincodeResult');
        if (pincode.length !== 6 || isNaN(pincode)) {
            result.innerHTML = '<span class="pdp-pin-error"><i class="fa-solid fa-circle-xmark"></i> Enter a valid 6-digit pincode</span>';
        } else {
            result.innerHTML = '<span class="pdp-pin-success"><i class="fa-solid fa-circle-check"></i> COD available! Est. ' + product.deliveryDays + '</span>';
        }
    });

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
        <div class="pdp-related-card" onclick="window.location.href='${p.link}'" style="cursor:pointer">
            <div class="pdp-related-img">
                <img src="${p.image}" alt="${p.name}" loading="lazy">
                <button class="wishlist-btn pdp-related-wishlist" onclick="event.stopPropagation()"><i class="fa-regular fa-heart"></i></button>
            </div>
            <div class="pdp-related-info">
                <p class="pdp-related-name">${p.name}</p>
                <p class="pdp-related-price">${formatPrice(p.price)}</p>
                <div class="product-card-actions" style="margin-top:8px">
                    <button class="card-add-to-cart" onclick="event.stopPropagation(); if(window.TMStore) window.TMStore.addToCart('${p.id}','FREE',1)"><i class="fa-solid fa-bag-shopping"></i> Add to Cart</button>
                    <button class="card-buy-now" onclick="event.stopPropagation(); window.location.href='${p.link}'"><i class="fa-solid fa-bolt"></i> Buy Now</button>
                </div>
            </div>
        </div>
    `).join('');

    el.innerHTML = `
        <div class="pdp-related-container">
            <div class="pdp-related-header">
                <h2 class="section-title-alt">You May Also Like</h2>
            </div>
            <div class="pdp-related-viewport">
                <div class="pdp-related-track" id="relatedTrack">
                    ${cards}
                </div>
            </div>
        </div>
    `;

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
