/**
 * =============================================
 *  T&M Online Fashions — Collection Page Engine
 *  Dynamically renders products from ProductsCatalog
 *  with filter sidebar, sort, and search.
 * =============================================
 */

(function () {
    'use strict';

    // ─── Configuration ────────────────────────────────
    // Reads data-collection on <body> or <script> tag
    // e.g. <body data-collection="Sarees">
    function getCollectionConfig() {
        const body = document.body;
        return {
            subcategory: body.dataset.collection || null,   // 'Sarees', 'Lehenga', 'Men', null=all
            category: body.dataset.category || null,   // 'Women', 'Men'
            title: body.dataset.collectionTitle || 'All Products',
            subtitle: body.dataset.collectionSubtitle || 'Explore our handcrafted collection',
            banner: body.dataset.collectionBanner || './images/image-1.webp',
        };
    }

    // ─── Price formatter ─────────────────────────────
    function fmtPrice(amount, currency) {
        currency = currency || '₹';
        return currency + '\u00a0' + Number(amount).toLocaleString('en-IN');
    }

    // ─── Get products from catalog ───────────────────
    function getProducts(cfg) {
        if (!window.ProductsCatalog) return [];
        return window.ProductsCatalog.filter(function (p) {
            if (cfg.subcategory && p.subcategory !== cfg.subcategory) return false;
            if (cfg.category && p.category !== cfg.category) return false;
            return true;
        });
    }

    // ─── Sort products ───────────────────────────────
    function sortProducts(products, sortVal) {
        var sorted = products.slice();
        switch (sortVal) {
            case 'price-low': sorted.sort(function (a, b) { return a.price - b.price; }); break;
            case 'price-high': sorted.sort(function (a, b) { return b.price - a.price; }); break;
            case 'name-az': sorted.sort(function (a, b) { return a.name.localeCompare(b.name); }); break;
            case 'name-za': sorted.sort(function (a, b) { return b.name.localeCompare(a.name); }); break;
        }
        return sorted;
    }

    // ─── Filter products ─────────────────────────────
    function filterProducts(products, filters) {
        return products.filter(function (p) {
            // Subcategory filter
            if (filters.subcat && filters.subcat !== 'all' && p.subcategory !== filters.subcat) return false;
            // Price range
            if (filters.minPrice && p.price < filters.minPrice) return false;
            if (filters.maxPrice && p.price > filters.maxPrice) return false;
            // Search
            if (filters.search) {
                var q = filters.search.toLowerCase();
                if (!p.name.toLowerCase().includes(q) && !p.subcategory.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }

    // ─── Render product card ─────────────────────────
    function renderCard(p) {
        var img = p.images[0];
        var img2 = p.images[1] || img;
        var disc = p.compareAtPrice ? Math.round((1 - p.price / p.compareAtPrice) * 100) : 0;
        var isWishlisted = window.TMStore ? window.TMStore.isInWishlist(p.id) : false;
        var heartClass = isWishlisted ? 'fa-solid' : 'fa-regular';
        var heartStyle = isWishlisted ? 'color: #ff3b3b;' : '';

        return `
        <div class="clp-card" onclick="window.location.href='product.html?id=${p.id}'">
            <div class="clp-card-media">
                <img class="clp-img clp-img-a" src="${img}"  alt="${p.name}" loading="lazy">
                <img class="clp-img clp-img-b" src="${img2}" alt="${p.name}" loading="lazy">
                ${disc ? `<span class="clp-badge">${disc}% OFF</span>` : ''}
                
                <button class="clp-action-btn clp-wish-btn" title="Wishlist"
                        style="background: transparent !important; box-shadow: none !important; font-size: 22px; border: none; padding: 4px; color: #1a1a1a; width: auto; height: auto;"
                        onclick="event.stopPropagation(); if(window.TMStore) { var added = window.TMStore.toggleWishlist('${p.id}'); var icon = this.querySelector('i'); if(added){ icon.classList.replace('fa-regular', 'fa-solid'); icon.style.color='#ff3b3b'; } else { icon.classList.replace('fa-solid', 'fa-regular'); icon.style.color=''; } }">
                    <i class="${heartClass} fa-heart" style="${heartStyle}"></i>
                </button>
                    
                <div class="clp-card-overlay-actions">
                    <button class="clp-action-btn clp-cart-quick-btn" title="Quick Add"
                        onclick="event.stopPropagation(); if(window.TMStore){ window.TMStore.addToCart('${p.id}', 'FREE', 1); this.innerHTML='<i class=\\'fa-solid fa-check\\'></i>'; setTimeout(()=>{ this.innerHTML='<i class=\\'fa-solid fa-bag-shopping\\'></i>'; }, 1800); }">
                        <i class="fa-solid fa-bag-shopping"></i>
                    </button>
                </div>
            </div>
            <div class="clp-card-info">
                <p class="clp-card-sub">${p.subcategory}</p>
                <p class="clp-card-name">${p.name}</p>
                <div class="clp-card-pricing">
                    <span class="clp-price" data-base-price="${p.price}">${fmtPrice(p.price, p.currency)}</span>
                    ${p.compareAtPrice ? `<span class="clp-compare" data-base-price="${p.compareAtPrice}">${fmtPrice(p.compareAtPrice, p.currency)}</span>` : ''}
                </div>
            </div>
        </div>`;
    }

    // ─── Render empty state ───────────────────────────
    function renderEmpty() {
        return `<div class="clp-empty">
            <i class="fa-solid fa-bag-shopping"></i>
            <h3>No Products Found</h3>
            <p>Try adjusting your filters or search term.</p>
            <button class="clp-clear-btn" onclick="CollectionPage.resetFilters()">Clear Filters</button>
        </div>`;
    }

    // ─── Render grid ─────────────────────────────────
    function renderGrid(products) {
        var grid = document.getElementById('clpGrid');
        var count = document.getElementById('clpCount');
        if (!grid) return;
        if (count) count.textContent = products.length + ' product' + (products.length !== 1 ? 's' : '');
        if (!products.length) { grid.innerHTML = renderEmpty(); return; }
        grid.innerHTML = products.map(renderCard).join('');
    }

    // ─── Build filter sidebar ─────────────────────────
    function buildFilters(allProducts, cfg) {
        var sidebarEl = document.getElementById('clpSidebar');
        if (!sidebarEl) return;

        // Collect all subcategories from data
        var subcats = [];
        var seenSubs = {};
        window.ProductsCatalog.forEach(function (p) {
            if (cfg.category && p.category !== cfg.category) return;
            if (!seenSubs[p.subcategory]) {
                seenSubs[p.subcategory] = true;
                subcats.push(p.subcategory);
            }
        });

        // Price range from visible products
        var prices = allProducts.map(function (p) { return p.price; });
        var minAll = Math.min.apply(null, prices) || 0;
        var maxAll = Math.max.apply(null, prices) || 200000;

        var subcatLinks = subcats.map(function (s) {
            var isActive = (cfg.subcategory === s || (!cfg.subcategory && s === 'all')) ? 'active' : '';
            return `<li><a class="clp-filter-link ${isActive}" data-subcat="${s}" href="#" onclick="event.preventDefault(); CollectionPage.setSubcat('${s}')">${s}</a></li>`;
        }).join('');

        sidebarEl.innerHTML = `
        <div class="clp-filter-group">
            <h4 class="clp-filter-heading">Categories</h4>
            <ul class="clp-filter-list">
                <li><a class="clp-filter-link ${!cfg.subcategory ? 'active' : ''}" href="#" onclick="event.preventDefault(); CollectionPage.setSubcat('all')">All</a></li>
                ${subcatLinks}
            </ul>
        </div>
        <div class="clp-filter-group">
            <h4 class="clp-filter-heading">Price Range</h4>
            <div class="clp-price-inputs">
                <input type="number" id="clpMinPrice" class="clp-price-input" placeholder="Min ₹" min="0" value="" oninput="CollectionPage.applyFilters()">
                <span class="clp-price-sep">–</span>
                <input type="number" id="clpMaxPrice" class="clp-price-input" placeholder="Max ₹" min="0" value="" oninput="CollectionPage.applyFilters()">
            </div>
        </div>
        <div class="clp-filter-group">
            <h4 class="clp-filter-heading">Occasion</h4>
            <ul class="clp-filter-list">
                <li><a class="clp-filter-link" href="#">Bridal</a></li>
                <li><a class="clp-filter-link" href="#">Party Wear</a></li>
                <li><a class="clp-filter-link" href="#">Festive</a></li>
                <li><a class="clp-filter-link" href="#">Casual</a></li>
            </ul>
        </div>
        <button class="clp-clear-btn" onclick="CollectionPage.resetFilters()" style="width:100%;margin-top:12px;">Clear All Filters</button>`;
    }

    // ─── State ───────────────────────────────────────
    var _state = {
        allProducts: [],
        filtered: [],
        sort: 'default',
        search: '',
        subcat: null,
        minPrice: null,
        maxPrice: null,
        cfg: {}
    };

    // ─── Apply all filters + sort + render ───────────
    function applyAll() {
        var f = filterProducts(_state.allProducts, {
            subcat: _state.subcat,
            minPrice: _state.minPrice,
            maxPrice: _state.maxPrice,
            search: _state.search,
        });
        _state.filtered = sortProducts(f, _state.sort);
        renderGrid(_state.filtered);
    }

    // ─── Public API ──────────────────────────────────
    window.CollectionPage = {
        setSubcat: function (val) {
            _state.subcat = (val === 'all') ? null : val;
            // Update sidebar active link
            document.querySelectorAll('.clp-filter-link[data-subcat]').forEach(function (a) {
                a.classList.toggle('active', a.dataset.subcat === val);
            });
            var allLink = document.querySelector('.clp-filter-link:not([data-subcat])');
            if (allLink) allLink.classList.toggle('active', val === 'all');
            applyAll();
        },
        setSort: function (val) {
            _state.sort = val;
            applyAll();
        },
        setSearch: function (val) {
            _state.search = val;
            applyAll();
        },
        applyFilters: function () {
            var minEl = document.getElementById('clpMinPrice');
            var maxEl = document.getElementById('clpMaxPrice');
            _state.minPrice = minEl && minEl.value ? parseFloat(minEl.value) : null;
            _state.maxPrice = maxEl && maxEl.value ? parseFloat(maxEl.value) : null;
            applyAll();
        },
        resetFilters: function () {
            _state.subcat = _state.cfg.subcategory || null;
            _state.minPrice = null;
            _state.maxPrice = null;
            _state.search = '';
            _state.sort = 'default';
            var minEl = document.getElementById('clpMinPrice');
            var maxEl = document.getElementById('clpMaxPrice');
            var srEl = document.getElementById('clpSearch');
            if (minEl) minEl.value = '';
            if (maxEl) maxEl.value = '';
            if (srEl) srEl.value = '';
            // Reset custom dropdown label
            var label = document.getElementById('clpSortLabel');
            if (label) label.textContent = 'Featured';
            var sortMenu = document.getElementById('clpSortMenu');
            if (sortMenu) {
                sortMenu.querySelectorAll('li').forEach(function (el) { el.classList.remove('active'); });
                var def = sortMenu.querySelector('li[data-val="default"]');
                if (def) def.classList.add('active');
            }
            document.querySelectorAll('.clp-filter-link').forEach(function (a) { a.classList.remove('active'); });
            var allLink = document.querySelector('.clp-filter-link:not([data-subcat])');
            if (allLink) allLink.classList.add('active');
            applyAll();
        },
        // Toggle mobile filter sidebar
        toggleSidebar: function () {
            var sb = document.getElementById('clpSidebar');
            var ov = document.getElementById('clpSidebarOverlay');
            if (!sb) return;
            sb.classList.toggle('open');
            if (ov) ov.classList.toggle('open');
            document.body.style.overflow = sb.classList.contains('open') ? 'hidden' : '';
        }
    };

    // ─── Init ─────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {
        var cfg = getCollectionConfig();
        _state.cfg = cfg;
        _state.subcat = cfg.subcategory;

        // Set hero title/subtitle
        var titleEl = document.getElementById('clpHeroTitle');
        var subtitleEl = document.getElementById('clpHeroSubtitle');
        var bannerEl = document.getElementById('clpHeroBanner');
        if (titleEl) titleEl.textContent = cfg.title;
        if (subtitleEl) subtitleEl.textContent = cfg.subtitle;
        if (bannerEl) bannerEl.src = cfg.banner;

        // Load products
        _state.allProducts = getProducts(cfg);

        // Build sidebar
        buildFilters(_state.allProducts, cfg);

        // Wire custom sort dropdown
        var sortMenu = document.getElementById('clpSortMenu');
        if (sortMenu) {
            sortMenu.querySelectorAll('li').forEach(function (li) {
                li.addEventListener('click', function () {
                    var val = this.dataset.val;
                    // Update label
                    var label = document.getElementById('clpSortLabel');
                    if (label) label.textContent = this.textContent;
                    // Update active class
                    sortMenu.querySelectorAll('li').forEach(function (el) { el.classList.remove('active'); });
                    this.classList.add('active');
                    // Close dropdown
                    var wrap = document.getElementById('clpSortWrap');
                    if (wrap) wrap.classList.remove('open');
                    // Apply sort
                    CollectionPage.setSort(val);
                });
            });
        }

        // Wire search
        var searchEl = document.getElementById('clpSearch');
        if (searchEl) searchEl.addEventListener('input', function () {
            CollectionPage.setSearch(this.value);
        });

        // Wire mobile sidebar overlay close
        var ov = document.getElementById('clpSidebarOverlay');
        if (ov) ov.addEventListener('click', function () { CollectionPage.toggleSidebar(); });

        // Initial render
        applyAll();
    });

})();

/* ── Global custom sort dropdown toggle ── */
function clpToggleSort(e) {
    e.stopPropagation();
    var wrap = document.getElementById('clpSortWrap');
    if (wrap) wrap.classList.toggle('open');
}

/* Close on outside click */
document.addEventListener('click', function (e) {
    var wrap = document.getElementById('clpSortWrap');
    if (wrap && !wrap.contains(e.target)) {
        wrap.classList.remove('open');
    }
});

// ===========================
//  MOBILE NAV DRAWER TOGGLE
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

    // Close drawer on resize above mobile
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            closeDrawer();
        }
    });
})();
