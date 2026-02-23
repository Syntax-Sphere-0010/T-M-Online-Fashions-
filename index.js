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
    const INTERVAL = 4500;

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
        timer = setInterval(next, INTERVAL);
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

    // Pause on hover
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

    // Kick off auto-play
    startAuto();
})();

// ===========================
//  NEW ARRIVALS CAROUSEL
// ===========================
(function () {
    const track = document.getElementById('arrivalsTrack');
    const prevBtn = document.getElementById('arrivalsPrev');
    const nextBtn = document.getElementById('arrivalsNext');

    if (!track || !prevBtn || !nextBtn) return;

    let scrollAmount = 0;
    const cardWidth = 260 + 20; // Width + gap

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
})();

// ===========================
//  WISHLIST FUNCTIONALITY
// ===========================
(function () {
    const wishlistBtns = document.querySelectorAll('.wishlist-btn');
    const wishlistCountBadge = document.getElementById('wishlistCount');
    let count = 0;

    if (!wishlistCountBadge) return;

    wishlistBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const icon = this.querySelector('i');

            this.classList.toggle('active');

            if (this.classList.contains('active')) {
                // Change to solid heart
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
                count++;
            } else {
                // Change to regular heart
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
                count--;
            }

            // Update badge
            wishlistCountBadge.textContent = count;
            if (count > 0) {
                wishlistCountBadge.classList.add('show');
            } else {
                wishlistCountBadge.classList.remove('show');
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

    if (track && prevBtn && nextBtn) {
        let scrollAmount = 0;
        const cardWidth = 520 + 25; // Card width + gap

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
})();
