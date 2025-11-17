/**
 * Reusable HTML Components
 * Functions to generate common HTML elements used across multiple pages
 */

/**
 * Generate navigation HTML
 * @param {string} currentPage - Current page identifier
 * @returns {string} Navigation HTML
 */
export function generateNavigation(currentPage = '') {
  const navLinks = [
    { href: 'index.html', text: 'Home', id: 'home' },
    { href: 'asset-reclaim.html', text: 'Asset Reclaim', id: 'asset-reclaim' },
    { href: 'client-login.html', text: 'Client Login', id: 'client-login' },
    { href: 'about.html', text: 'About', id: 'about' }
  ];

  const links = navLinks.map(link => {
    const active = currentPage === link.id ? 'active' : '';
    return `<a href="${link.href}" class="nav-link ${active}">${link.text}</a>`;
  }).join('\n                ');

  return `
    <header class="header" role="banner">
        <div class="container">
            <div class="logo">
                <h1>Sleuthservice</h1>
                <p>Asset recovery & financial investigations</p>
            </div>
            <nav class="nav" role="navigation" aria-label="Main navigation">
                ${links}
            </nav>
        </div>
    </header>
  `;
}

/**
 * Generate footer HTML
 * @returns {string} Footer HTML
 */
export function generateFooter() {
  return `
    <footer class="footer" role="contentinfo">
        <div class="container">
            <div class="footer-content">
                <!-- Company Info -->
                <div class="footer-section">
                    <h3>Sleuthservice</h3>
                    <p>Professional asset recovery and financial investigations with complete confidentiality and precision. Your trusted partner for corporate due diligence, digital forensics, and litigation support.</p>
                    <p style="margin-top: 1rem; font-weight: 600; color: #06b6d4;">
                        <span data-icon="lock" class="icon-18"></span> Confidentiality Guaranteed
                    </p>
                </div>

                <!-- Quick Links -->
                <div class="footer-section">
                    <h3>Quick Links</h3>
                    <ul class="footer-links">
                        <li><a href="index.html"><span data-icon="home" class="icon-16"></span> Home</a></li>
                        <li><a href="asset-reclaim.html"><span data-icon="money" class="icon-16"></span> Asset Reclaim</a></li>
                        <li><a href="about.html"><span data-icon="info" class="icon-16"></span> About Us</a></li>
                        <li><a href="client-login.html"><span data-icon="lock" class="icon-16"></span> Client Login</a></li>
                        <li><a href="admin-login.html"><span data-icon="settings" class="icon-16"></span> Admin Portal</a></li>
                    </ul>
                </div>

                <!-- Services -->
                <div class="footer-section">
                    <h3>Our Services</h3>
                    <ul class="footer-links">
                        <li><a href="asset-reclaim.html"><span data-icon="briefcase" class="icon-16"></span> Corporate Asset Recovery</a></li>
                        <li><a href="asset-reclaim.html"><span data-icon="home" class="icon-16"></span> Property Reclaim Services</a></li>
                        <li><a href="index.html"><span data-icon="search" class="icon-16"></span> Digital Forensics</a></li>
                        <li><a href="index.html"><span data-icon="document" class="icon-16"></span> Due Diligence</a></li>
                        <li><a href="index.html"><span data-icon="tracking" class="icon-16"></span> Surveillance & Asset Tracing</a></li>
                        <li><a href="index.html"><span data-icon="document" class="icon-16"></span> Litigation Support</a></li>
                    </ul>
                </div>

                <!-- Contact -->
                <div class="footer-section">
                    <h3>Contact Us</h3>
                    <div class="footer-contact">
                        <div class="footer-contact-item">
                            <span data-icon="email" class="icon-18"></span>
                            <a href="mailto:noreply@sleuthservice.com" style="color: var(--text-light); text-decoration: none;">noreply@sleuthservice.com</a>
                        </div>
                        <div class="footer-contact-item">
                            <span data-icon="globe" class="icon-18"></span>
                            <span>Global Reach - International Network</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; <span id="currentYear">2024</span> Sleuthservice. All rights reserved.</p>
                <div class="footer-legal">
                    <a href="privacy-policy.html">Privacy Policy</a>
                    <a href="terms-of-service.html">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>
  `;
}

/**
 * Generate meta tags HTML
 * @param {Object} meta - Meta tag configuration
 * @param {string} meta.title - Page title
 * @param {string} meta.description - Page description
 * @param {string} meta.url - Canonical URL
 * @param {string} meta.type - Open Graph type
 * @param {string} meta.keywords - SEO keywords
 * @returns {string} Meta tags HTML
 */
export function generateMetaTags({ title, description, url, type = 'website', keywords = '' }) {
  return `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${url}">
    <meta property="og:type" content="${type}">
    <meta property="og:site_name" content="Sleuthservice">
    <meta property="og:image" content="https://sleuthservice.com/og-image.jpg">
    <meta property="og:locale" content="en_US">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="https://sleuthservice.com/og-image.jpg">
    ${keywords ? `<meta name="keywords" content="${keywords}">` : ''}
    <meta name="author" content="Sleuthservice">
    <meta name="robots" content="index, follow">
  `;
}

/**
 * Generate skip link for accessibility
 * @returns {string} Skip link HTML
 */
export function generateSkipLink() {
  return `<a href="#main-content" class="skip-link">Skip to main content</a>`;
}

