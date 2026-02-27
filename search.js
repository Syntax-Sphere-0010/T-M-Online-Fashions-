// ===========================
//  SEARCH OVERLAY LOGIC
//  Shared across all pages that include the search overlay HTML
// ===========================
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var overlay = document.getElementById('searchOverlay');
        var closeBtn = document.getElementById('searchOverlayClose');
        var input = document.getElementById('searchInput');
        var resultsEl = document.getElementById('searchResults');
        if (!overlay) return;

        // Close handler
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                overlay.classList.remove('open');
                if (input) input.value = '';
                if (resultsEl) resultsEl.innerHTML = '';
            });
        }

        // Escape key closes
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay.classList.contains('open')) {
                overlay.classList.remove('open');
                if (input) input.value = '';
                if (resultsEl) resultsEl.innerHTML = '';
            }
        });

        // Auto-focus input when overlay opens
        var observer = new MutationObserver(function () {
            if (overlay.classList.contains('open') && input) {
                input.focus();
            }
        });
        observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });

        // Search on typing
        if (input && resultsEl) {
            var debounceTimer;
            input.addEventListener('input', function () {
                clearTimeout(debounceTimer);
                var query = this.value.trim().toLowerCase();
                debounceTimer = setTimeout(function () {
                    doSearch(query, resultsEl);
                }, 250);
            });
        }
    });

    function doSearch(query, resultsEl) {
        if (!query || query.length < 2) {
            resultsEl.innerHTML = '';
            return;
        }
        if (!window.ProductsCatalog) {
            resultsEl.innerHTML = '<p style="padding:10px;color:#888;">No product data available.</p>';
            return;
        }

        var matches = window.ProductsCatalog.filter(function (p) {
            var haystack = (p.name + ' ' + p.category + ' ' + p.subcategory + ' ' + (p.sku || '')).toLowerCase();
            return haystack.indexOf(query) > -1;
        }).slice(0, 8);

        if (matches.length === 0) {
            resultsEl.innerHTML = '<p style="padding:14px;color:#aaa;font-size:13px;">No products found for "' + query + '"</p>';
            return;
        }

        var html = '';
        matches.forEach(function (p) {
            html += '<a class="search-result-item" href="product.html?id=' + p.id + '">' +
                '<img class="search-result-img" src="' + p.images[0] + '" alt="' + p.name + '">' +
                '<div class="search-result-info">' +
                '<div class="search-result-name">' + p.name + '</div>' +
                '<div class="search-result-price">\u20b9 ' + Number(p.price).toLocaleString('en-IN') + '</div>' +
                '</div>' +
                '</a>';
        });

        resultsEl.innerHTML = html;
    }
})();
