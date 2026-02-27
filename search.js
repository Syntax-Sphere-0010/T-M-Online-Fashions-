// ===========================
//  SEARCH OVERLAY LOGIC
//  Shared across all pages that include the search overlay HTML
// ===========================
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // Find all search overlays on the page (in case there are duplicates or mobile/desktop versions)
        var overlays = document.querySelectorAll('.search-overlay');

        // Find all search trigger buttons
        var searchBtns = document.querySelectorAll('[title="Search"], .icon-btn-search');

        searchBtns.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                // Open the first overlay found
                if (overlays.length > 0) {
                    overlays[0].classList.add('open');
                    var input = overlays[0].querySelector('.search-overlay-input');
                    if (input) setTimeout(() => input.focus(), 100);
                }
            });
        });

        overlays.forEach(function (overlay) {
            var closeBtn = overlay.querySelector('.search-overlay-close');
            var input = overlay.querySelector('.search-overlay-input');
            var resultsEl = overlay.querySelector('.search-overlay-results');

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

        // Close overlay on outside click
        document.addEventListener('click', function (e) {
            var openOverlay = Array.from(overlays).find(o => o.classList.contains('open'));
            if (!openOverlay) return;

            if (openOverlay.contains(e.target)) return;

            var isSearchBtn = Array.from(searchBtns).some(btn => btn.contains(e.target));
            if (isSearchBtn) return;

            openOverlay.classList.remove('open');
            var input = openOverlay.querySelector('.search-overlay-input');
            var resultsEl = openOverlay.querySelector('.search-overlay-results');
            if (input) input.value = '';
            if (resultsEl) resultsEl.innerHTML = '';
        });
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
            // Updated item template for image + text + category info
            var imgUrl = p.images && p.images.length > 0 ? p.images[0] : './images/placeholder.webp';
            html += '<a class="search-suggestion-item" href="product.html?id=' + p.id + '">';
            html += '  <div class="search-suggestion-img">';
            html += '    <img src="' + imgUrl + '" alt="' + p.name + '">';
            html += '  </div>';
            html += '  <div class="search-suggestion-text">';
            html += '    <div class="search-suggestion-name">' + p.name.toLowerCase() + '</div>';
            html += '    <div class="search-suggestion-category">in ' + p.category + ' ' + p.subcategory + '</div>';
            html += '  </div>';
            html += '</a>';
        });

        resultsEl.innerHTML = html;
    }
})();
