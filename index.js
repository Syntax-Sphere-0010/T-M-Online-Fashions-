// ===========================
//  HERO SLIDER
// ===========================
(function () {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let current = 0;
    let timer = null;
    const DESKTOP_INTERVAL = 4500;
    const MOBILE_INTERVAL = 2000;

    if (!prevBtn || !nextBtn || slides.length === 0) return;

    // Slide destination URLs (one per slide)
    const slideLinks = [
        'lehenga-collection.html',
        'sarees-collection.html',
        'sarees-collection.html',
        'sarees-collection.html',
        'women-collection.html',
        'women-collection.html'
    ];

    function isMobile() {
        return window.innerWidth <= 768;
    }

    function getInterval() {
        return isMobile() ? MOBILE_INTERVAL : DESKTOP_INTERVAL;
    }

    function goTo(index) {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');

        current = (index + slides.length) % slides.length;

        slides[current].classList.add('active');
        dots[current].classList.add('active');
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() {
        clearInterval(timer);
        timer = setInterval(next, getInterval());
    }

    function resetAuto() {
        startAuto();
    }

    // Arrow buttons
    nextBtn.addEventListener('click', function () {
        next();
        resetAuto();
    });

    prevBtn.addEventListener('click', function () {
        prev();
        resetAuto();
    });

    // Dot buttons
    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            goTo(parseInt(dot.dataset.index, 10));
            resetAuto();
        });
    });

    // Pause on hover (desktop)
    const slider = document.getElementById('heroSlider');
    slider.addEventListener('mouseenter', function () { clearInterval(timer); });
    slider.addEventListener('mouseleave', startAuto);

    // Touch / swipe support
    let touchStartX = 0;
    slider.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    slider.addEventListener('touchend', function (e) {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            diff > 0 ? next() : prev();
            resetAuto();
        }
    }, { passive: true });

    // Click to navigate on mobile
    slides.forEach(function (slide, index) {
        slide.addEventListener('click', function () {
            if (isMobile() && slideLinks[index]) {
                window.location.href = slideLinks[index];
            }
        });
    });

    // Restart auto-play on resize (adjust interval)
    window.addEventListener('resize', function () {
        resetAuto();
    });

    // Kick off auto-play
    startAuto();
})();


// ===========================
//  NEW ARRIVALS CAROUSEL — Auto-scroll, no buttons
// ===========================
(function () {
    const container = document.querySelector('.arrivals-scroll-container');
    if (!container) return;

    let autoTimer = null;
    let userScrolling = false;
    let userScrollTimeout = null;

    function autoScrollStep() {
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 2) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: 280, behavior: 'smooth' });
        }
    }

    function startAutoScroll() {
        stopAutoScroll();
        autoTimer = setInterval(autoScrollStep, 2800);
    }

    function stopAutoScroll() {
        clearInterval(autoTimer);
        autoTimer = null;
    }

    // Pause on user interaction (mouse or touch)
    container.addEventListener('touchstart', function () {
        userScrolling = true;
        stopAutoScroll();
    }, { passive: true });

    container.addEventListener('touchend', function () {
        clearTimeout(userScrollTimeout);
        userScrollTimeout = setTimeout(function () {
            userScrolling = false;
            startAutoScroll();
        }, 3000);
    }, { passive: true });

    container.addEventListener('mouseenter', function () {
        stopAutoScroll();
    });

    container.addEventListener('mouseleave', function () {
        startAutoScroll();
    });

    // Kick off
    startAutoScroll();
})();


// ===========================
//  TRENDING NOW CAROUSEL — Auto-scroll, no buttons
// ===========================
(function () {
    const container = document.querySelector('.trending-scroll-container');
    if (!container) return;

    let autoTimer = null;

    function autoScrollStep() {
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 2) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: 280, behavior: 'smooth' });
        }
    }

    function startAutoScroll() {
        stopAutoScroll();
        autoTimer = setInterval(autoScrollStep, 2800);
    }

    function stopAutoScroll() {
        clearInterval(autoTimer);
        autoTimer = null;
    }

    container.addEventListener('mouseenter', stopAutoScroll);
    container.addEventListener('mouseleave', startAutoScroll);

    container.addEventListener('touchstart', function () {
        stopAutoScroll();
    }, { passive: true });

    container.addEventListener('touchend', function () {
        setTimeout(startAutoScroll, 3000);
    }, { passive: true });

    startAutoScroll();
})();


// ===========================
//  WISHLIST FUNCTIONALITY (Homepage)
// ===========================
(function () {
    // Helper: read wishlist from localStorage (mirrors TMStore logic)
    function getWishlistIds() {
        try {
            return JSON.parse(localStorage.getItem('tm_wishlist')) || [];
        } catch (e) {
            return [];
        }
    }

    function saveWishlistIds(ids) {
        localStorage.setItem('tm_wishlist', JSON.stringify(ids));
    }

    function updateBadge() {
        // Prefer TMStore if available (already loaded via store.js)
        if (window.TMStore) {
            window.TMStore.updateWishlistBadge();
        } else {
            var count = getWishlistIds().length;
            var badge = document.getElementById('wishlistCount');
            if (badge) {
                badge.textContent = count;
                badge.classList.toggle('show', count > 0);
            }
        }
    }

    // Initialise all wishlist buttons on the homepage
    document.querySelectorAll('.wishlist-btn').forEach(function (btn) {
        var productId = btn.dataset.id;
        var icon = btn.querySelector('i');
        if (!icon) return;

        // Set initial icon state from persisted data
        var inWishlist = productId
            ? (window.TMStore ? window.TMStore.isInWishlist(productId) : getWishlistIds().indexOf(productId) > -1)
            : false;

        if (inWishlist) {
            icon.classList.replace('fa-regular', 'fa-solid');
            icon.style.color = '#ff3b3b';
            btn.classList.add('active');
        }

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            var id = this.dataset.id;
            var added;

            if (window.TMStore) {
                added = window.TMStore.toggleWishlist(id);
            } else {
                var ids = getWishlistIds();
                var idx = ids.indexOf(id);
                if (idx > -1) { ids.splice(idx, 1); added = false; }
                else { ids.push(id); added = true; }
                saveWishlistIds(ids);
                updateBadge();
            }

            var btnIcon = this.querySelector('i');
            if (added) {
                btnIcon.classList.replace('fa-regular', 'fa-solid');
                btnIcon.style.color = '#ff3b3b';
                this.classList.add('active');
            } else {
                btnIcon.classList.replace('fa-solid', 'fa-regular');
                btnIcon.style.color = '';
                this.classList.remove('active');
            }
        });
    });
})();

// ===========================
//  CLIENT DIARIES CAROUSEL
// ===========================
(function () {
    const track = document.getElementById('diariesTrack');
    const prevBtn = document.getElementById('diariesPrev');
    const nextBtn = document.getElementById('diariesNext');
    const section = document.querySelector('.client-diaries');

    if (!track) return;

    function isMobile() {
        return window.innerWidth <= 768;
    }

    // --- Desktop: button-based scroll ---
    if (prevBtn && nextBtn) {
        let scrollAmount = 0;
        const cardWidth = 520 + 25;

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
    }

    // --- Mobile: auto-scroll with loop + IntersectionObserver ---
    const viewport = track.parentElement;
    let autoTimer = null;
    let isVisible = false;

    function autoScrollStep() {
        if (!isMobile() || !viewport) return;
        const maxScroll = viewport.scrollWidth - viewport.clientWidth;
        if (viewport.scrollLeft >= maxScroll - 2) {
            // Loop back to first card
            viewport.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            viewport.scrollBy({ left: 280, behavior: 'smooth' });
        }
    }

    function startAutoScroll() {
        stopAutoScroll();
        if (isMobile() && isVisible) {
            autoTimer = setInterval(autoScrollStep, 2000);
        }
    }

    function stopAutoScroll() {
        clearInterval(autoTimer);
        autoTimer = null;
    }

    // Pause on touch, resume after 3s
    if (viewport) {
        let userTimeout = null;

        viewport.addEventListener('touchstart', function () {
            stopAutoScroll();
        }, { passive: true });

        viewport.addEventListener('touchend', function () {
            clearTimeout(userTimeout);
            userTimeout = setTimeout(startAutoScroll, 3000);
        }, { passive: true });
    }

    // IntersectionObserver: only auto-scroll when section is in view
    if (section && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                isVisible = entry.isIntersecting;
                if (isVisible && isMobile()) {
                    startAutoScroll();
                } else {
                    stopAutoScroll();
                }
            });
        }, { threshold: 0.3 });

        observer.observe(section);
    }

    window.addEventListener('resize', function () {
        if (isMobile() && isVisible) {
            startAutoScroll();
        } else {
            stopAutoScroll();
        }
    });
})();

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
