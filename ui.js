/**
 * ui.js
 * Universal UI Utilities and Accessibility Enhancements
 * 
 * This file provides cross-page UI functionality including:
 * - Navigation state management
 * - Form submission handling
 * - Accessibility enhancements
 * - Dropdown menu management
 * - Modal dialog handling
 * 
 * All functions are wrapped in IIFEs to avoid global namespace pollution
 */

(function(){
    /**
     * onReady(fn)
     * Executes a function when the DOM is ready
     * @param {Function} fn - Function to execute when DOM is ready
     */
    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            // DOM already loaded, execute immediately
            setTimeout(fn, 0);
        }
    }

    /**
     * closest(el, selector)
     * Finds the closest ancestor element matching the selector
     * Similar to Element.closest() but with better browser support
     * @param {Element} el - Starting element
     * @param {string} selector - CSS selector to match
     * @returns {Element|null} - Matching ancestor or null
     */
    function closest(el, selector) {
        while (el && el.nodeType === 1) {  // nodeType 1 = ELEMENT_NODE
            if (el.matches(selector)) return el;
            el = el.parentElement;
        }
        return null;
    }

    /**
     * setNavActive()
     * Automatically sets the active state on navigation links based on current page
     * Compares the current URL pathname with each nav link's href
     */
    function setNavActive() {
        try {
            var links = document.querySelectorAll('.nav a.nav-link');
            if (!links.length) return;
            var current = location.pathname.split('/').pop() || 'index.html';
            links.forEach(function(a) {
                var href = (a.getAttribute('href') || '').split('/').pop();
                if (href === current) {
                    a.classList.add('active');
                } else {
                    a.classList.remove('active');
                }
            });
        } catch (e) {}
    }

    /**
     * standardizeButtons()
     * Ensures all buttons have proper type attributes for accessibility and form behavior
     * Automatically detects submit buttons by text content and form context
     */
    function standardizeButtons() {
        try {
            var buttons = document.querySelectorAll('button');
            buttons.forEach(function(btn) {
                // Only set type if not already specified
                if (!btn.getAttribute('type')) {
                    var text = (btn.textContent || '').toLowerCase();
                    // Detect submit-like buttons by text content
                    var isSubmitLike = /submit|send|save|log in|sign in|track|apply|export/.test(text);
                    var inForm = !!closest(btn, 'form');
                    
                    if (isSubmitLike) {
                        btn.setAttribute('type', 'submit');
                    } else {
                        // Default to 'button' type to prevent accidental form submission
                        btn.setAttribute('type', inForm ? 'button' : 'button');
                    }
                }
                // Set ARIA attribute for accessibility
                btn.setAttribute('aria-pressed', 'false');
            });
        } catch (e) {}
    }

    function anchorsAsButtons() {
        try {
            var anchors = document.querySelectorAll('a.btn, a[class*="btn"]');
            anchors.forEach(function(a) {
                var href = a.getAttribute('href');
                if (!href || href === '#') {
                    a.setAttribute('role', 'button');
                    a.setAttribute('tabindex', '0');
                    a.addEventListener('click', function(ev) {
                        ev.preventDefault();
                    });
                    a.addEventListener('keydown', function(ev) {
                        if (ev.key === 'Enter' || ev.key === ' ') {
                            ev.preventDefault();
                            a.click();
                        }
                    });
                }
            });
        } catch (e) {}
    }

    /**
     * preventDoubleSubmit()
     * Prevents accidental double-submission of forms
     * Disables submit button immediately on form submission
     * Re-enables after 15 seconds as a safety measure
     */
    function preventDoubleSubmit() {
        try {
            document.querySelectorAll('form').forEach(function(form) {
                form.addEventListener('submit', function(ev) {
                    var submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        // If already disabled, prevent submission
                        if (submitBtn.disabled) {
                            ev.preventDefault();
                            return;
                        }
                        
                        // Disable button and set loading state
                        submitBtn.disabled = true;
                        submitBtn.classList.add('is-submitting');
                        submitBtn.setAttribute('aria-disabled', 'true');
                        form.setAttribute('aria-busy', 'true');
                        
                        // Re-enable after 15 seconds as safety measure
                        // (In case form submission fails silently)
                        setTimeout(function() {
                            form.removeAttribute('aria-busy');
                            if (submitBtn) {
                                submitBtn.disabled = false;
                                submitBtn.classList.remove('is-submitting');
                                submitBtn.removeAttribute('aria-disabled');
                            }
                        }, 15000);
                    }
                });
            });
        } catch (e) {}
    }

    function initDropdowns() {
        try {
            var toggles = document.querySelectorAll('[data-dropdown-toggle]');
            var openMenu = null;
            
            function closeOpen() {
                if (openMenu) {
                    openMenu.classList.remove('open');
                    var toggle = openMenu.__toggle;
                    if (toggle) {
                        toggle.setAttribute('aria-expanded', 'false');
                    }
                    openMenu = null;
                }
            }

            document.addEventListener('click', function(e) {
                if (openMenu && !closest(e.target, '[data-dropdown]')) {
                    closeOpen();
                }
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeOpen();
                }
            });

            toggles.forEach(function(toggle) {
                var parent = closest(toggle, '[data-dropdown]');
                if (!parent) return;
                var menu = parent.querySelector('[data-dropdown-menu]');
                if (!menu) return;

                toggle.setAttribute('aria-haspopup', 'true');
                toggle.setAttribute('aria-expanded', 'false');
                menu.setAttribute('role', 'menu');
                
                if (!menu.id) {
                    menu.id = (toggle.id ? toggle.id + 'Menu' : 'dropdownMenu' + Math.random().toString(36).slice(2));
                }
                toggle.setAttribute('aria-controls', menu.id);
                menu.__toggle = toggle;

                menu.querySelectorAll('a,button').forEach(function(item) {
                    if (!item.getAttribute('role')) {
                        item.setAttribute('role', 'menuitem');
                    }
                });

                toggle.addEventListener('click', function(ev) {
                    ev.preventDefault();
                    var isOpen = menu.classList.contains('open');
                    closeOpen();
                    if (!isOpen) {
                        menu.classList.add('open');
                        toggle.setAttribute('aria-expanded', 'true');
                        openMenu = menu;
                    }
                });

                toggle.addEventListener('keydown', function(ev) {
                    if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'ArrowDown') {
                        ev.preventDefault();
                        if (!menu.classList.contains('open')) {
                            closeOpen();
                            menu.classList.add('open');
                            toggle.setAttribute('aria-expanded', 'true');
                            openMenu = menu;
                            var first = menu.querySelector('[role="menuitem"],a,button');
                            first && first.focus();
                        }
                    }
                });

                menu.addEventListener('keydown', function(ev) {
                    var items = [].slice.call(menu.querySelectorAll('[role="menuitem"],a,button'));
                    var idx = items.indexOf(document.activeElement);
                    if (ev.key === 'ArrowDown') {
                        ev.preventDefault();
                        var next = items[idx + 1] || items[0];
                        next && next.focus();
                    } else if (ev.key === 'ArrowUp') {
                        ev.preventDefault();
                        var prev = items[idx - 1] || items[items.length - 1];
                        prev && prev.focus();
                    } else if (ev.key === 'Tab') {
                        closeOpen();
                    }
                });

                menu.addEventListener('focusout', function(ev) {
                    var to = ev.relatedTarget;
                    var toggleEl = menu.__toggle;
                    if (!to || !(menu.contains(to) || (toggleEl && toggleEl.contains(to)))) {
                        closeOpen();
                    }
                });
            });
        } catch (e) {}
    }

    function enhanceSelects() {
        try {
            document.querySelectorAll('select').forEach(function(sel) {
                if (sel.required) {
                    sel.setAttribute('aria-required', 'true');
                }
                var id = sel.id;
                if (id) {
                    var lbl = document.querySelector('label[for="' + id + '"]');
                    if (!lbl && !sel.getAttribute('aria-label')) {
                        sel.setAttribute('aria-label', (sel.name || 'Select'));
                    }
                }
            });
        } catch (e) {}
    }

    function setBusyState(target, busy) {
        try {
            var form = closest(target, 'form') || target;
            if (!form) return;
            var submitBtn = form.querySelector('button[type="submit"]');
            form.setAttribute('aria-busy', busy ? 'true' : 'false');
            if (submitBtn) {
                submitBtn.disabled = !!busy;
                submitBtn.setAttribute('aria-disabled', busy ? 'true' : 'false');
                if (busy) {
                    submitBtn.classList.add('is-submitting');
                } else {
                    submitBtn.classList.remove('is-submitting');
                }
            }
        } catch (e) {}
    }

    function injectFocusStyles() {
        try {
            if (document.getElementById('a11y-focus-styles')) return;
            var style = document.createElement('style');
            style.id = 'a11y-focus-styles';
            style.textContent = 'button:focus-visible, .btn:focus-visible, a:focus-visible {outline:3px solid #3b82f6; outline-offset:2px; box-shadow:0 0 0 4px rgba(30,64,175,0.25);} input:focus-visible, select:focus-visible, textarea:focus-visible {outline:3px solid #3b82f6; outline-offset:2px; box-shadow:0 0 0 4px rgba(30,64,175,0.15);} button:disabled, .btn[aria-disabled="true"] {cursor:not-allowed; opacity:0.7;}';
            document.head.appendChild(style);
        } catch (e) {}
    }

    function runA11yDevChecks() {
        try {
            var isDev = /(localhost|127\.0\.0\.1)/.test(location.hostname) || location.search.indexOf('dev=1') > -1;
            if (!isDev) return;

            if (!window.__devChecksLoaded) {
                var script = document.createElement('script');
                script.src = 'dev-checks.js';
                script.defer = true;
                script.id = 'dev-checks-loader';
                document.head.appendChild(script);
                window.__devChecksLoaded = true;
            }

            var issues = [];
            document.querySelectorAll('button').forEach(function(btn) {
                if (!btn.getAttribute('type')) issues.push({el: btn, msg: 'Button missing type attribute'});
                var name = (btn.getAttribute('aria-label') || btn.textContent || '').trim();
                if (!name) issues.push({el: btn, msg: 'Button missing accessible name'});
            });

            document.querySelectorAll('input,select,textarea').forEach(function(inp) {
                if (!inp.name) issues.push({el: inp, msg: inp.tagName + ' missing name attribute'});
                var hasLabel = !!document.querySelector('label[for="' + inp.id + '"]');
                var accName = (inp.getAttribute('aria-label') || '').trim();
                if (!hasLabel && !accName) issues.push({el: inp, msg: inp.tagName + ' missing associated label or aria-label'});
            });

            document.querySelectorAll('.error-message').forEach(function(el) {
                var role = el.getAttribute('role');
                var live = el.getAttribute('aria-live');
                if (role !== 'alert' || live !== 'polite') {
                    issues.push({el: el, msg: 'Error message should have role="alert" and aria-live="polite"'});
                }
            });

            document.querySelectorAll('[data-dropdown-toggle]').forEach(function(t) {
                if (!t.getAttribute('aria-expanded')) issues.push({el: t, msg: 'Dropdown toggle missing aria-expanded'});
            });

            if (issues.length) {
                console.group('[Dev Checks] Accessibility warnings');
                issues.forEach(function(i) {
                    console.warn(i.msg, i.el);
                });
                console.groupEnd();
            }
        } catch (e) {}
    }

    window.UIHelpers = window.UIHelpers || {
        setBusy: setBusyState,
        closeDropdowns: function() {
            try {
                document.querySelectorAll('[data-dropdown-menu].open').forEach(function(m) {
                    m.classList.remove('open');
                    var t = m.__toggle;
                    if (t) {
                        t.setAttribute('aria-expanded', 'false');
                    }
                });
            } catch (e) {}
        }
    };

    /**
     * initMobileMenu()
     * Initializes mobile menu toggle functionality for all pages
     */
    function initMobileMenu() {
        try {
            const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
            const nav = document.querySelector('.nav');
            
            if (mobileMenuToggle && nav) {
                // Toggle menu on button click
                mobileMenuToggle.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent event bubbling
                    const isExpanded = this.getAttribute('aria-expanded') === 'true';
                    const newState = !isExpanded;
                    
                    this.setAttribute('aria-expanded', newState);
                    nav.classList.toggle('active');
                    
                    // Change icon based on state
                    this.textContent = newState ? '✕' : '☰';
                });
                
                // Close menu when clicking on nav links
                nav.querySelectorAll('.nav-link').forEach(link => {
                    link.addEventListener('click', function() {
                        nav.classList.remove('active');
                        mobileMenuToggle.setAttribute('aria-expanded', 'false');
                        mobileMenuToggle.textContent = '☰';
                    });
                });
                
                // Close menu when clicking outside the header
                document.addEventListener('click', function(event) {
                    const header = document.querySelector('.header');
                    if (header && !header.contains(event.target)) {
                        nav.classList.remove('active');
                        mobileMenuToggle.setAttribute('aria-expanded', 'false');
                        mobileMenuToggle.textContent = '☰';
                    }
                });
                
                // Prevent menu from closing when clicking inside it
                nav.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            }
        } catch (e) {
            console.error('Mobile menu initialization error:', e);
        }
    }

    onReady(function() {
        setNavActive();
        standardizeButtons();
        anchorsAsButtons();
        preventDoubleSubmit();
        initDropdowns();
        enhanceSelects();
        injectFocusStyles();
        initMobileMenu(); // Initialize mobile menu toggle
        runA11yDevChecks();
    });
})();

(function(){
    function r(f) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', f);
        } else {
            setTimeout(f, 0);
        }
    }

    function s(el, a, v) {
        try {
            if (el && !el.hasAttribute(a)) el.setAttribute(a, v);
        } catch (e) {}
    }

    function icons() {
        try {
            document.querySelectorAll('[data-icon]').forEach(function(i) {
                i.setAttribute('aria-hidden', 'true');
            });
        } catch (e) {}
    }

    function nav() {
        try {
            var nav = document.querySelector('.admin-nav');
            if (nav) nav.setAttribute('role', 'tablist');
            
            var m = document.getElementById('messagesNavBtn');
            var c = document.getElementById('casesNavBtn');
            
            if (m) {
                m.setAttribute('role', 'tab');
                m.setAttribute('aria-controls', 'messagesView');
                m.setAttribute('aria-selected', m.classList.contains('active') ? 'true' : 'false');
                m.addEventListener('click', function() {
                    m.setAttribute('aria-selected', 'true');
                    c && c.setAttribute('aria-selected', 'false');
                });
            }
            
            if (c) {
                c.setAttribute('role', 'tab');
                c.setAttribute('aria-controls', 'casesView');
                c.setAttribute('aria-selected', c.classList.contains('active') ? 'true' : 'false');
                c.addEventListener('click', function() {
                    c.setAttribute('aria-selected', 'true');
                    m && m.setAttribute('aria-selected', 'false');
                });
            }
        } catch (e) {}
    }

    function trap(modal) {
        try {
            var panel = modal.querySelector('.modal-content') || modal;
            var nodes = panel.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
            if (!nodes.length) return;
            
            var first = nodes[0], last = nodes[nodes.length - 1];
            
            function key(e) {
                if (e.key === 'Tab') {
                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                } else if (e.key === 'Escape') {
                    var close = modal.querySelector('.close-btn') || modal.querySelector('[data-close]');
                    if (close) {
                        close.click();
                    } else {
                        modal.classList.remove('active');
                    }
                }
            }
            
            modal.addEventListener('keydown', key);
            setTimeout(function() {
                first.focus();
            }, 0);
        } catch (e) {}
    }

    function modals() {
        try {
            var list = document.querySelectorAll('.modal');
            list.forEach(function(m) {
                s(m, 'role', 'dialog');
                s(m, 'aria-modal', 'true');
                
                var h2 = m.querySelector('.modal-header h2');
                if (h2 && !h2.id) {
                    h2.id = m.id + '-title';
                }
                if (h2) {
                    s(m, 'aria-labelledby', h2.id);
                }
                
                var desc = document.getElementById(m.id + 'Content') || m.querySelector('.modal-content');
                if (desc && !m.getAttribute('aria-describedby')) {
                    m.setAttribute('aria-describedby', desc.id || h2 && h2.id || '');
                }
                
                var obs = new MutationObserver(function(rs) {
                    rs.forEach(function(r) {
                        if (r.attributeName === 'class' && m.classList.contains('active')) {
                            trap(m);
                        }
                    });
                });
                obs.observe(m, {attributes: true});
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    document.querySelectorAll('.modal.active').forEach(function(m) {
                        var close = m.querySelector('.close-btn');
                        if (close) {
                            close.click();
                        } else {
                            m.classList.remove('active');
                        }
                    });
                }
            });
        } catch (e) {}
    }

    r(function() {
        icons();
        nav();
        modals();
    });
})();