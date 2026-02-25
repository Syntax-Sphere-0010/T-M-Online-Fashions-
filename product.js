// ===========================
//  PRODUCT DATA (All values rendered dynamically from here)
// ===========================
const productData = {
    id: 'GL3812',
    name: 'Crimson Red Umbrella Style Silk Bridal Lehenga with Elbow Sleeve Blouse',
    sku: 'GL3812',
    category: 'Lehenga',
    subcategory: 'Bridal Lehenga',
    price: 51500,
    currency: '₹',
    deliveryDays: '40 to 45 Working Days',
    availability: 'In Stock',
    emiPerMonth: 1811,
    images: [
        './images/image-1.webp',
        './images/image-2.webp',
        './images/image-3.webp',
        './images/image-4.webp',
        './images/image-5.webp',
    ],
    sizes: [
        { label: '--Select--', value: '' },
        { label: 'XS (34)', value: 'XS' },
        { label: 'S (36)', value: 'S' },
        { label: 'M (38)', value: 'M' },
        { label: 'L (40)', value: 'L' },
        { label: 'XL (42)', value: 'XL' },
        { label: 'XXL (44)', value: 'XXL' },
        { label: 'Custom Size', value: 'CUSTOM' },
    ],
    measurementLink: 'Lehenga Measurements',
    details: {
        fabric: 'Pure Silk with Zari Work',
        work: 'Zari, Sequins, Stone, Resham Embroidery',
        blouse: 'Elbow Sleeve Blouse (Stitched)',
        dupatta: 'Heavy Embroidered Net Dupatta',
        lining: 'Cancan + Cotton Inner',
        weight: '4.5 kg (approx)',
        occasion: 'Wedding, Bridal, Reception',
        washCare: 'Dry Clean Only',
        deliveryTime: '40–45 Working Days (Custom Made)',
    },
    description: `<p>Be the most stunning bride in this magnificent <strong>Crimson Red Umbrella Style Silk Bridal Lehenga</strong>. Crafted from the finest pure silk, this lehenga features an umbrella cut silhouette that creates a regal and graceful drape.</p>
<p>The entire ensemble is adorned with rich <em>zari, sequins, stone, and resham embroidery</em> that shimmers beautifully under every light. The elbow sleeve blouse adds a classic touch to the contemporary design.</p>
<ul>
    <li>Pure silk fabric with rich zari weaving</li>
    <li>Umbrella cut for a royal silhouette</li>
    <li>Elbow sleeve stitched blouse included</li>
    <li>Heavy embroidered net dupatta included</li>
    <li>Cancan and cotton inner lining for comfort</li>
    <li>Can be customised to your exact measurements</li>
</ul>
<p>This lehenga is crafted to order — made exclusively for you with meticulous attention to detail.</p>`,
    shippingInfo: `<p><strong>Free Worldwide Shipping</strong> on all orders.</p>
<ul>
    <li><strong>Domestic (India):</strong> 40–45 Working Days (Made to Order)</li>
    <li><strong>International:</strong> 45–55 Working Days</li>
    <li>Tracking information provided via email & SMS</li>
    <li>Secure packaging to ensure safe delivery</li>
    <li>COD available for select pincodes in India</li>
</ul>
<p><strong>Returns & Exchange:</strong> We accept returns within 7 days of delivery. Items must be unused and in original packaging. Custom-made products are eligible for exchange only.</p>
<p>For assistance, reach out via WhatsApp or email.</p>`,
};

// Related Products Data
const relatedProducts = [
    {
        id: 'GL3810',
        name: 'Beige Sequins Embroidered Net Promotional Lehenga with Resham and Stone',
        price: 32500,
        image: './images/image-4.webp',
        link: 'product.html',
    },
    {
        id: 'GL3815',
        name: 'Red Crepe Ready To Wear Saree with Silk Blouse and Embroidery',
        price: 15990,
        image: './images/image-1.webp',
        link: 'product.html',
    },
    {
        id: 'GL3820',
        name: 'Black Lycra Ready To Wear Saree with Embroidered Sleeveless Blouse',
        price: 18490,
        image: './images/image-2.webp',
        link: 'product.html',
    },
    {
        id: 'GL3825',
        name: 'Blush Pink Sequins Embroidered Georgette Lehenga with Ruffle Dupatta',
        price: 42000,
        image: './images/image-6.webp',
        link: 'product.html',
    },
    {
        id: 'GL3830',
        name: 'Emerald Green Zari Embroidered Silk Anarkali Suit with Network Dupatta',
        price: 21500,
        image: './images/image-7.webp',
        link: 'product.html',
    },
    {
        id: 'GL3835',
        name: 'Orange Sequins Embroidered Net Lehenga with Resham and Stone Work',
        price: 29900,
        image: './images/image-5.webp',
        link: 'product.html',
    },
];

// ===========================
//  UTILITY FUNCTIONS
// ===========================
function formatPrice(amount, currency = '₹') {
    return `${currency} ${amount.toLocaleString('en-IN')}`;
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

    // Add to cart animation
    document.getElementById('pdpAddToCart').addEventListener('click', function () {
        this.classList.add('added');
        this.innerHTML = '<i class="fa-solid fa-check"></i> ADDED TO CART';
        setTimeout(() => {
            this.classList.remove('added');
            this.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> ADD TO CART';
        }, 2000);
    });

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
    renderBreadcrumb(productData);
    renderGallery(productData);
    renderProductInfo(productData);
    renderTabs(productData);
    renderRelatedProducts(relatedProducts);
    window.scrollTo({ top: 0, behavior: 'auto' });
});
