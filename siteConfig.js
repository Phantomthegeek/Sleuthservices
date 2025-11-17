/**
 * siteConfig.js
 * Sleuthservice Website Configuration
 * 
 * This file contains all site-wide configuration including company information,
 * contact details, statistics, and helper functions to apply these settings
 * dynamically across all pages.
 * 
 * Developed by Little Einstein Studios
 */

// Browser-compatible version (no ES6 modules)
// Using var instead of const/let for maximum browser compatibility
var siteConfig = {
  // Developer/Credits information (optional, can be removed in production)
  developer: {
    studio: "Little Einstein Studios",
    website: "https://littleeinsteinstudios.com",
    credits:
      "Designed and developed by Little Einstein Studios — Bringing brands to life through design, animation, and technology."
  },

  // Main company information - used throughout the site
  company: {
    name: "Sleuthservice",
    tagline: "Recovering what's rightfully yours",
    slogan: "Asset Recovery & Financial Investigations",
    description:
      "Sleuthservice is a professional asset recovery and financial investigation company. We specialize in locating and reclaiming lost, unclaimed, or misappropriated assets for individuals, families, and organizations.",
    industry: "Asset Recovery & Investigations",
    // Key statistics displayed on homepage and throughout site
    // These values are automatically inserted into elements with data-stat attributes
    keyStats: {
      assetsRecovered: "$2.5M+",      // Total assets recovered (displayed in hero section)
      successCases: "1,200+",          // Number of successful cases
      successRate: "98%",               // Success rate percentage
      averageResponse: "Within 24 hours" // Average response time
    },
    cta: {
      primaryText: "Submit Your Case",
      primaryLink: "/submit-case",
      secondaryText: "Track Existing Case",
      secondaryLink: "/track-case"
    },
    location: "United States",
    email: "noreply@sleuthservice.com",
    phone: "+1 (951) 224-3746"
  },

  // Contact information - automatically applied to all [data-email] and [data-phone] elements
  contact: {
    email: "noreply@sleuthservice.com",  // Main contact email
    phone: "+1 (951) 224-3746",               // Main contact phone (US format)
    officeHours: "Mon–Fri, 9am–6pm (EST)",    // Business hours (Eastern Standard Time)
    form: {
      title: "Send Us a Message",
      fields: [
        "Full Name",
        "Email Address",
        "Phone Number",
        "Case Type",
        "Message"
      ],
      submitText: "Submit Enquiry",
      successMessage:
        "Thank you for contacting Sleuthservice. A licensed investigator will respond within 24 hours."
    },
    socials: {
      facebook: "https://facebook.com/sleuthservice",
      linkedin: "https://linkedin.com/company/sleuthservice",
      twitter: "https://twitter.com/sleuthservice"
    }
  },

  footer: {
    text: "© 2025 Sleuthservice. All rights reserved.",
    builtBy:
      "Website crafted with precision and passion by Little Einstein Studios."
  }
};

/**
 * applySiteConfig()
 * 
 * Automatically applies configuration values from siteConfig to the page
 * by finding elements with data attributes and updating their content.
 * 
 * This function runs automatically when the DOM is ready, ensuring all
 * dynamic content is populated from the central configuration.
 */
function applySiteConfig() {
  // Safety check: exit if config is not loaded
  if (typeof siteConfig === 'undefined') return;
  
  // Update page title if it contains the company name
  // This ensures consistency across all pages
  if (document.title && document.title.includes('Aesus')) {
    document.title = document.title.replace(/Aesus Asset Reclaim/g, siteConfig.company.name);
  }
  // Also replace any remaining Aesus references
  document.title = document.title.replace(/Aesus/g, siteConfig.company.name);
  
  // Update company name throughout the page
  // Finds all elements with [data-company-name] attribute and updates text
  const companyNameElements = document.querySelectorAll('[data-company-name]');
  companyNameElements.forEach(el => {
    el.textContent = siteConfig.company.name;
  });
  
  // Update tagline - short marketing phrase
  const taglineElements = document.querySelectorAll('[data-tagline]');
  taglineElements.forEach(el => {
    el.textContent = siteConfig.company.tagline;
  });
  
  // Update slogan - longer descriptive text
  const sloganElements = document.querySelectorAll('[data-slogan]');
  sloganElements.forEach(el => {
    el.textContent = siteConfig.company.slogan;
  });
  
  // Update statistics (assetsRecovered, successCases, etc.)
  // Matches data-stat attribute value to keyStats object keys
  const statsElements = document.querySelectorAll('[data-stat]');
  statsElements.forEach(el => {
    const statType = el.getAttribute('data-stat');
    if (siteConfig.company.keyStats[statType]) {
      el.textContent = siteConfig.company.keyStats[statType];
    }
  });
  
  // Update email addresses
  // Handles both links (<a>) and text elements
  const emailElements = document.querySelectorAll('[data-email]');
  emailElements.forEach(el => {
    if (el.tagName === 'A') {
      // For links, update both href and text
      el.href = 'mailto:' + siteConfig.contact.email;
      el.textContent = siteConfig.contact.email;
    } else {
      // For text elements, just update content
      el.textContent = siteConfig.contact.email;
    }
  });
  
  // Update phone numbers
  // Removes spaces from phone number for tel: links
  const phoneElements = document.querySelectorAll('[data-phone]');
  phoneElements.forEach(el => {
    if (el.tagName === 'A') {
      // For links, update both href (no spaces) and text (formatted)
      el.href = 'tel:' + siteConfig.contact.phone.replace(/\s/g, '');
      el.textContent = siteConfig.contact.phone;
    } else {
      // For text elements, just update content
      el.textContent = siteConfig.contact.phone;
    }
  });
  
  // Update footer text (if present)
  const footerText = document.querySelector('[data-footer-text]');
  if (footerText) {
    footerText.textContent = siteConfig.footer.text;
  }
  
  // Update current year automatically
  // Finds all [data-current-year] elements and sets to current year
  const yearElements = document.querySelectorAll('[data-current-year]');
  const currentYear = new Date().getFullYear();
  yearElements.forEach(el => {
    el.textContent = currentYear;
  });
}

/**
 * Auto-initialization
 * 
 * Immediately Invoked Function Expression (IIFE) that runs when this script loads.
 * Automatically applies site configuration when the DOM is ready.
 * 
 * Also dynamically loads ui.js if it hasn't been loaded yet.
 */
(function() {
  try {
    /**
     * loadUIScript()
     * Dynamically loads ui.js script if not already present
     * This allows for lazy loading of UI utilities
     */
    function loadUIScript(){
      try{
        var s=document.createElement('script');
        s.src='ui.js';
        s.defer=true;  // Defer loading until HTML parsing is complete
        document.head.appendChild(s);
      }catch(e){
        // Silently fail if script loading fails
      }
    }
    
    // Check if DOM is still loading
    if (document.readyState === 'loading') {
      // Wait for DOM to be ready
      document.addEventListener('DOMContentLoaded', function(){
        applySiteConfig();  // Apply all configuration
        loadUIScript();     // Load UI utilities
      });
    } else {
      // DOM already loaded, apply immediately
      setTimeout(function(){
        applySiteConfig();
        loadUIScript();
      }, 0);
    }
  } catch (error) {
    // Graceful error handling - log warning but don't break the page
    console.warn('siteConfig: Error applying config', error);
  }
})();
