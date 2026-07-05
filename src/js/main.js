/* ============================================================
   PIXELCRAFT STUDIO — SCRIPT
   Vanilla JS only. No dependencies.
   ============================================================ */
(function () {
    'use strict';

    /* ---------- Loader ---------- */
    window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        setTimeout(() => loader.classList.add('hide'), 500);
    });

    /* ---------- Sticky / shrinking navbar ---------- */
    const navbar = document.getElementById('navbar');
    const onScrollNav = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    document.addEventListener('scroll', onScrollNav, { passive: true });
    onScrollNav();

    /* ---------- Mobile menu ---------- */
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    navLinks.querySelectorAll('a').forEach(link =>
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        })
    );

    /* ---------- Scroll progress bar ---------- */
    const scrollProgress = document.getElementById('scrollProgress');
    const updateProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = pct + '%';
    };
    document.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    /* ---------- Back to top ---------- */
    const backToTop = document.getElementById('backToTop');
    document.addEventListener('scroll', () => {
        backToTop.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    /* ---------- Scroll indicator ---------- */
    const scrollIndicator = document.getElementById('scrollIndicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
        });
    }

    /* ---------- Cursor glow (desktop only) ---------- */
    const cursorGlow = document.getElementById('cursorGlow');
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
        window.addEventListener('mousemove', (e) => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        });
    }

    /* ---------- 3D hero orb — mouse parallax tilt ---------- */
    const orbStage = document.getElementById('orbStage');
    const orb = document.getElementById('orb');
    if (orbStage && orb) {
        let targetX = 8, targetY = 0, curX = 8, curY = 0;
        orbStage.addEventListener('mousemove', (e) => {
            const rect = orbStage.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            targetY = px * 40;
            targetX = 8 - py * 40;
        });
        orbStage.addEventListener('mouseleave', () => { targetX = 8; targetY = 0; });

        (function animateOrb() {
            curX += (targetX - curX) * 0.06;
            curY += (targetY - curY) * 0.06;
            orb.style.transform = `rotateX(${curX}deg) rotateY(${curY}deg)`;
            requestAnimationFrame(animateOrb);
        })();

        // pause the CSS auto-spin while user is interacting, resume after
        let spinTimeout;
        orbStage.addEventListener('mousemove', () => {
            orb.style.animationPlayState = 'paused';
            clearTimeout(spinTimeout);
            spinTimeout = setTimeout(() => { orb.style.animationPlayState = 'running'; }, 1500);
        });

        document.getElementById('orbPrev')?.addEventListener('click', () => {
            orb.style.animationDirection = 'reverse';
        });
        document.getElementById('orbNext')?.addEventListener('click', () => {
            orb.style.animationDirection = 'normal';
        });
    }

    /* ---------- Reveal on scroll (Intersection Observer) ---------- */
    const revealEls = document.querySelectorAll('[data-reveal]');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    revealEls.forEach(el => revealObserver.observe(el));

    /* ---------- Animated counters ---------- */
    const statNumbers = document.querySelectorAll('.stat-number');
    const animateCount = (el) => {
        const target = parseInt(el.dataset.count, 10);
        const duration = 1600;
        const start = performance.now();
        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        };
        requestAnimationFrame(tick);
    };
    const statsSection = document.getElementById('stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statNumbers.forEach(animateCount);
                    statsObserver.disconnect();
                }
            });
        }, { threshold: 0.4 });
        statsObserver.observe(statsSection);
    }

    /* ---------- Portfolio filter ---------- */
    const filterBar = document.getElementById('filterBar');
    const projectCards = document.querySelectorAll('.project-card');
    if (filterBar) {
        filterBar.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            projectCards.forEach(card => {
                const match = filter === 'all' || card.dataset.category === filter;
                card.classList.toggle('is-hidden', !match);
            });
        });
    }

    /* ---------- Testimonials slider (auto + dots) ---------- */
    const track = document.getElementById('testimonialTrack');
    const dotsWrap = document.getElementById('testimonialDots');
    if (track && dotsWrap) {
        const slides = track.children.length;
        let index = 0;

        for (let i = 0; i < slides; i++) {
            const dot = document.createElement('button');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(dot);
        }

        function goTo(i) {
            index = (i + slides) % slides;
            track.style.transform = `translateX(-${index * 100}%)`;
            [...dotsWrap.children].forEach((d, di) => d.classList.toggle('active', di === index));
        }

        let autoSlide = setInterval(() => goTo(index + 1), 5000);
        const slider = document.getElementById('testimonialSlider');
        slider.addEventListener('mouseenter', () => clearInterval(autoSlide));
        slider.addEventListener('mouseleave', () => { autoSlide = setInterval(() => goTo(index + 1), 5000); });
    }

    /* ---------- FAQ accordion ---------- */
    const accordion = document.getElementById('accordion');
    if (accordion) {
        accordion.querySelectorAll('.accordion-item').forEach(item => {
            const trigger = item.querySelector('.accordion-trigger');
            const panel = item.querySelector('.accordion-panel');
            trigger.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');
                accordion.querySelectorAll('.accordion-item.open').forEach(openItem => {
                    openItem.classList.remove('open');
                    openItem.querySelector('.accordion-panel').style.maxHeight = null;
                });
                if (!isOpen) {
                    item.classList.add('open');
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                }
            });
        });
    }

    /* ---------- Contact form validation ---------- */
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let valid = true;

            const name = contactForm.querySelector('#name');
            const email = contactForm.querySelector('#email');
            const message = contactForm.querySelector('#message');

            const setState = (field, ok) => {
                field.closest('.form-field').classList.toggle('invalid', !ok);
                if (!ok) valid = false;
            };

            setState(name, name.value.trim().length > 1);
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setState(email, emailPattern.test(email.value.trim()));
            setState(message, message.value.trim().length > 9);

            if (valid) {
                formSuccess.classList.add('show');
                contactForm.reset();
                setTimeout(() => formSuccess.classList.remove('show'), 5000);
            }
        });

        contactForm.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('input', () => field.closest('.form-field').classList.remove('invalid'));
        });
    }

    /* ---------- Newsletter form ---------- */
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input');
            input.value = '';
            input.placeholder = 'Subscribed ✓';
            setTimeout(() => (input.placeholder = 'you@company.com'), 3000);
        });
    }

    /* ---------- Smooth scroll for in-page anchors ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const id = anchor.getAttribute('href');
            if (id.length > 1) {
                const target = document.querySelector(id);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    /* ---------- Lazy-load ready hook (media elements use CSS backgrounds here,
       kept for any future <img data-src> additions) ---------- */
    const lazyImgs = document.querySelectorAll('img[data-src]');
    if (lazyImgs.length) {
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.src = entry.target.dataset.src;
                    lazyObserver.unobserve(entry.target);
                }
            });
        });
        lazyImgs.forEach(img => lazyObserver.observe(img));
    }

})();