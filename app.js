// Automatically load SEO helper utility
(function() {
    if (!document.getElementById('seo-helper-script') && typeof window !== 'undefined') {
        const script = document.createElement('script');
        script.id = 'seo-helper-script';
        const pathPrefix = (window.location.pathname.includes('/states/') ||
                            window.location.pathname.includes('/traditional-games/') ||
                            window.location.pathname.includes('/freedom-timeline/') ||
                            window.location.pathname.includes('/postal-stamps/') ||
                            window.location.pathname.includes('/handloom/')) ? '../' : '';
        script.src = pathPrefix + 'seo-helper.js';
        script.defer = true;
        document.head.appendChild(script);
    }
})();

/* ==========================================================================
   INCREDIBLE INDIA EXPLORER - APPLICATION CORE LOGIC
   Pure Vanilla JavaScript for navigation, theme, focus trap, and routing setup.
   ========================================================================== */

window.setupFocusTrap = function(modalElement) {
    if (!modalElement) return null;
    const focusableSelector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    const focusableElements = Array.from(modalElement.querySelectorAll(focusableSelector));
    const previousActiveElement = document.activeElement;
    
    if (focusableElements.length > 0) {
        setTimeout(() => focusableElements[0].focus(), 50);
    } else {
        modalElement.setAttribute('tabindex', '-1');
        setTimeout(() => modalElement.focus(), 50);
    }
    
    const keydownHandler = function(e) {
        if (e.key === 'Tab') {
            const elements = Array.from(modalElement.querySelectorAll(focusableSelector));
            if (elements.length === 0) return;
            const first = elements[0];
            const last = elements[elements.length - 1];
            
            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === first || document.activeElement === modalElement) {
                    last.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === last) {
                    first.focus();
                    e.preventDefault();
                }
            }
        }
    };
    
    modalElement.addEventListener('keydown', keydownHandler);
    
    return {
        deactivate: function() {
            modalElement.removeEventListener('keydown', keydownHandler);
            if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
                setTimeout(() => previousActiveElement.focus(), 50);
            }
        }
    };
};

// Global state for route-level listener/observer management
window.__iiRouteState = window.__iiRouteState || {
    observers: new Set(),
    navigationBound: false,
    scrollListenerBound: false,
    navDocClickListenerBound: false,
    lastRouteKey: null
};

function iiRegisterObserver(obs) {
    if (!obs) return;
    window.__iiRouteState.observers.add(obs);
}

function iiDisconnectRouteObservers() {
    if (!window.__iiRouteState || !window.__iiRouteState.observers) return;
    for (const obs of window.__iiRouteState.observers) {
        try {
            obs.disconnect();
        } catch (e) {
            // ignore
        }
    }
    window.__iiRouteState.observers.clear();
}

/**
 * Safe init helper — wraps a page init function in try-catch so a single
 * failing section doesn't break the entire SPA route transition.
 */
function safeInitFn(initFn, name) {
    try {
        const result = initFn();
        if (result && typeof result.catch === 'function') {
            result.catch(err => {
                console.error(`[App] Async error in ${name}:`, err);
                if (window.ToastNotifier) {
                    window.ToastNotifier.error(`${name} encountered an error. Some features may not work.`);
                }
            });
        }
    } catch (err) {
        console.error(`[App] Error initializing ${name}:`, err);
        if (window.ToastNotifier) {
            window.ToastNotifier.error(`${name} failed to load. Please refresh the page.`);
        }
    }
}

/**
 * Error boundary for lazyLoadScript chains
 */
function handleInitError(pageName, err) {
    console.error(`[App] Failed to load ${pageName} page module:`, err);
    if (window.ToastNotifier) {
        window.ToastNotifier.error(`Could not load ${pageName} content. Please try again.`);
    }
}

/* Initialise the unified toast notification system */
(function initToastSystem() {
    var pathPrefix = (window.location.pathname.includes('/states/') ||
        window.location.pathname.includes('/traditional-games/') ||
        window.location.pathname.includes('/freedom-timeline/') ||
        window.location.pathname.includes('/postal-stamps/') ||
        window.location.pathname.includes('/handloom/')) ? '../' : '';
    var script = document.createElement('script');
    script.src = pathPrefix + 'js-modules/toast-system.js';
    script.async = true;
    script.onload = function () {
        if (window.ToastNotifier) {
            window.dispatchEvent(new CustomEvent('toast:ready'));
        }
    };
    document.head.appendChild(script);
})();

/* Initialize route management engine */
(function initRouteEngine() {
    var pathPrefix = (window.location.pathname.includes('/states/') ||
        window.location.pathname.includes('/traditional-games/') ||
        window.location.pathname.includes('/freedom-timeline/') ||
        window.location.pathname.includes('/postal-stamps/') ||
        window.location.pathname.includes('/handloom/')) ? '../' : '';
    var script = document.createElement('script');
    script.src = pathPrefix + 'js-modules/router-init.js';
    script.async = true;
    script.onload = function () {
        if (typeof window.handleRouteInit === 'function') {
            window.handleRouteInit();
        }
    };
    document.head.appendChild(script);
})();

/* ==========================================================================
   SHARED NAVIGATION & SCROLL EVENTS
   ========================================================================== */

function initNavigation() {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const btnScrollTop = document.getElementById('btn-scroll-top');
    const exploreDropdown = navMenu?.querySelector('.nav-dropdown .dropdown-menu');
    const currentPath = window.location.pathname;

    if (navbar && navbar.dataset.listenerBound) return;
    if (navbar) navbar.dataset.listenerBound = "true";

    // Sticky navbar on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            if (btnScrollTop) btnScrollTop.classList.add('visible');
        } else {
            navbar.classList.remove('scrolled');
            if (btnScrollTop) btnScrollTop.classList.remove('visible');
        }
    });

    if (exploreDropdown && !exploreDropdown.querySelector('a[href="dance.html"]')) {
        const danceLink = document.createElement('a');
        danceLink.href = 'dance.html';
        danceLink.className = 'dropdown-item';
        danceLink.textContent = 'Dance';
        if (currentPath.includes('dance.html')) {
            danceLink.classList.add('active');
        }
        exploreDropdown.appendChild(danceLink);
    }

    if (exploreDropdown && !exploreDropdown.querySelector('a[href="sports.html"]')) {
        const sportsLink = document.createElement('a');
        sportsLink.href = 'sports.html';
        sportsLink.className = 'dropdown-item';
        sportsLink.textContent = 'Sports';
        if (currentPath.includes('sports.html')) {
            sportsLink.classList.add('active');
        }
        exploreDropdown.appendChild(sportsLink);
    }

    if (exploreDropdown && !exploreDropdown.querySelector('a[href="science.html"]')) {
        const scienceLink = document.createElement('a');
        scienceLink.href = 'science.html';
        scienceLink.className = 'dropdown-item';
        scienceLink.textContent = 'Science';
        if (currentPath.includes('science.html')) {
            scienceLink.classList.add('active');
        }
        exploreDropdown.appendChild(scienceLink);
    }

    if (exploreDropdown && !exploreDropdown.querySelector('a[href="music.html"]')) {
        const musicLink = document.createElement('a');
        musicLink.href = 'music.html';
        musicLink.className = 'dropdown-item';
        musicLink.textContent = 'Music';
        if (currentPath.includes('music.html')) {
            musicLink.classList.add('active');
        }
        exploreDropdown.appendChild(musicLink);
    }

    if (exploreDropdown && !exploreDropdown.querySelector('a[href="literature.html"]')) {
        const literatureLink = document.createElement('a');
        literatureLink.href = 'literature.html';
        literatureLink.className = 'dropdown-item';
        literatureLink.textContent = 'Literature';
        if (currentPath.includes('literature.html')) {
            literatureLink.classList.add('active');
        }
        exploreDropdown.appendChild(literatureLink);
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('open');
            if (navMenu) navMenu.classList.toggle('open');
        });
    }

    navLinks.forEach(link => {
        if (link.classList.contains('dropdown-toggle')) return;
        link.addEventListener('click', () => {
            if (menuToggle) menuToggle.classList.remove('open');
            if (navMenu) navMenu.classList.remove('open');
        });
    });

    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const parentDropdown = toggle.closest('.nav-dropdown');
            if (!parentDropdown) return;

            const isOpen = parentDropdown.classList.contains('open');

            document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
                if (dropdown !== parentDropdown) {
                    dropdown.classList.remove('open');
                    const otherToggle = dropdown.querySelector('.dropdown-toggle');
                    if (otherToggle) {
                        otherToggle.setAttribute('aria-expanded', 'false');
                    }
                }
            });

            if (isOpen) {
                parentDropdown.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            } else {
                parentDropdown.classList.add('open');
                toggle.setAttribute('aria-expanded', 'true');
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
                dropdown.classList.remove('open');
                const toggle = dropdown.querySelector('.dropdown-toggle');
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    });

    if (btnScrollTop) {
        btnScrollTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    if (themeBtn.dataset.listenerBound) return;
    themeBtn.dataset.listenerBound = "true";

    const setThemeIcon = (isLightTheme) => {
        if (isLightTheme) {
            themeBtn.innerHTML = `
                <svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M12 3v2M12 19v2M5 5l1.5 1.5M17.5 17.5L19 19M3 12h2M19 12h2M5 19l1.5-1.5M17.5 6.5L19 5" />
                    <circle cx="12" cy="12" r="4.5" />
                </svg>
            `;
            themeBtn.setAttribute('title', 'Toggle Dark Mode');
            themeBtn.setAttribute('aria-label', 'Toggle Dark Mode');
        } else {
            themeBtn.innerHTML = `
                <svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M21 12.8A8.8 8.8 0 0 1 11.2 3 8.8 8.8 0 1 0 21 12.8Z" fill="currentColor" />
                </svg>
            `;
            themeBtn.setAttribute('title', 'Toggle Light Mode');
            themeBtn.setAttribute('aria-label', 'Toggle Light Mode');
        }
    };

    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
        setThemeIcon(true);
    } else {
        setThemeIcon(false);
    }

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLightTheme = document.body.classList.contains('light-theme');
        setThemeIcon(isLightTheme);
        const theme = isLightTheme ? 'light' : 'dark';
        localStorage.setItem('theme', theme);
    });
}

function initRotatingText() {
    const rotators = document.querySelectorAll('.rotating-text-wrapper');
    rotators.forEach(wrapper => {
        if (wrapper.dataset.intervalId) {
            clearInterval(parseInt(wrapper.dataset.intervalId, 10));
        }

        const wordsStr = wrapper.getAttribute('data-words');
        if (!wordsStr) return;

        const words = wordsStr.split(',').map(w => w.trim());
        if (words.length === 0) return;

        let currentIndex = 0;
        wrapper.innerHTML = `<span class="rotating-text">${words[0]}</span>`;

        const intervalId = setInterval(() => {
            const currentSpan = wrapper.querySelector('.rotating-text');
            if (currentSpan) {
                currentSpan.style.animation = 'slideOutFade 0.5s ease-in forwards';
            }

            setTimeout(() => {
                const innerSpan = wrapper.querySelector('.rotating-text');
                if (!innerSpan) return;
                currentIndex = (currentIndex + 1) % words.length;
                wrapper.innerHTML = `<span class="rotating-text">${words[currentIndex]}</span>`;
            }, 500);
        }, 3500);

        wrapper.dataset.intervalId = intervalId.toString();
    });
}

function initScrollEffects() {
    const fadeSections = document.querySelectorAll('.fade-in-section, .story-step');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.scroll-section');

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    fadeSections.forEach(section => {
        fadeObserver.observe(section);
    });

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

// Global exports
window.initNavigation = initNavigation;
window.initThemeToggle = initThemeToggle;
window.initRotatingText = initRotatingText;
window.initScrollEffects = initScrollEffects;
