/**
 * icons.js - SVG Icon System for Sleuthservice
 * 
 * This file contains all SVG icon definitions used throughout the website.
 * Icons are defined as inline SVG strings and can be inserted into elements
 * with the [data-icon] attribute via the initAllIcons() function.
 * 
 * Usage:
 *   <span data-icon="forex"></span>  // Renders the forex icon
 * 
 * All icons use currentColor, so they inherit the text color of their parent element.
 */
const Icons = {
    // Service Icons
    forex: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7V12C2 16.5 4.23 20.68 7.62 23.15L12 24L16.38 23.15C19.77 20.68 22 16.5 22 12V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7 5L17 5M9 3L15 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    crypto: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
        <path d="M12 1V6M12 18V23M4.22 4.22L7.76 7.76M16.24 16.24L19.78 19.78M1 12H6M18 12H23M4.22 19.78L7.76 16.24M16.24 7.76L19.78 4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9Z" fill="currentColor"/>
    </svg>`,
    
    stockTrading: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3V21H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7 14L11 10L15 14L19 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="7" cy="14" r="2" fill="currentColor"/>
        <circle cx="11" cy="10" r="2" fill="currentColor"/>
        <circle cx="15" cy="14" r="2" fill="currentColor"/>
        <circle cx="19" cy="10" r="2" fill="currentColor"/>
    </svg>`,
    
    binaryOptions: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
        <path d="M8 12H16M12 8V16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
        <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    nigerianScam: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 9L21 9M3 15L21 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="7.5" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="16.5" cy="12" r="1.5" fill="currentColor"/>
        <path d="M8 6C8 6 9 5 10 5C11 5 12 5 12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M12 19C12 19 13 18 14 18C15 18 16 19 16 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    ponzi: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7V12C2 16.5 4.23 20.68 7.62 23.15L12 24L16.38 23.15C19.77 20.68 22 16.5 22 12V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="17" r="2" fill="currentColor"/>
        <path d="M8 6C8 6 9 5 10 5C11 5 12 5 12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    mt760: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 9L21 9M3 15L21 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M8 12H16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="6" cy="6" r="1" fill="currentColor"/>
        <circle cx="18" cy="18" r="1" fill="currentColor"/>
    </svg>`,
    
    onlineInvestment: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3V21H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7 14L11 10L15 14L19 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="7" cy="14" r="2" fill="currentColor"/>
        <circle cx="11" cy="10" r="2" fill="currentColor"/>
        <circle cx="15" cy="14" r="2" fill="currentColor"/>
        <circle cx="19" cy="10" r="2" fill="currentColor"/>
        <path d="M8 17H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    // Process Icons
    caseReview: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 12H16M8 16H12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="9" cy="9" r="1" fill="currentColor"/>
    </svg>`,
    
    confrontEntities: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
        <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
        <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    gatherEvidence: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="11" cy="11" r="2.5" fill="currentColor"/>
        <path d="M8 8h6M8 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    
    getMoneyBack: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
        <path d="M8 17l4-2 4 2M8 7l4 2 4-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // UI Icons
    search: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
        <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    add: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    email: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    lock: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    check: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    time: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    tracking: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="2"/>
        <path d="M12 2V7M12 17V22M22 12H17M7 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    tip: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    document: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 12H16M8 16H12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    refresh: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M3 8V3H8M21 16V21H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 22h20L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    calendar: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
        <path d="M4 10h16M9 5V3M15 5V3" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="9" cy="14" r="1" fill="currentColor"/>
        <circle cx="12" cy="14" r="1" fill="currentColor"/>
        <circle cx="15" cy="14" r="1" fill="currentColor"/>
    </svg>`,
    
    welcome: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    
    // Feature Icons
    mobile: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 18H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M7 5H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M7 15H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="10" cy="10" r="1" fill="currentColor"/>
        <circle cx="14" cy="10" r="1" fill="currentColor"/>
    </svg>`,
    
    notification: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8A6 6 0 0 0 6 8C6 5.38757 7.43393 3.16509 9.5 2.34177C9.75132 2.24551 10.0237 2.19435 10.3 2.19141C10.5 2.19141 10.7 2.21063 10.9 2.24805C13.0503 2.71978 14.8 4.53745 15.2 6.8C15.2444 7.05466 15.2698 7.31228 15.2758 7.57055C15.3 7.86328 15.3 8.15 15.3 8.45L18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Additional UI Icons
    home: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    money: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
        <path d="M12 7V17M9 10H15M9 14H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    </svg>`,
    
    briefcase: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    settings: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
        <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    globe: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M2 12H22M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    lightning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    info: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    close: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    rocket: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 16.5C4.5 16.5 8 20 12 20C16 20 19.5 16.5 19.5 16.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 4L14 8L18 10L14 12L12 16L10 12L6 10L10 8L12 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="10" r="1.5" fill="currentColor"/>
    </svg>`
};

/**
 * insertIcon(iconName, targetElement)
 * 
 * Inserts an SVG icon into a target element.
 * 
 * @param {string} iconName - Name of the icon (must exist in Icons object)
 * @param {HTMLElement} targetElement - Element to insert icon into
 * @returns {boolean} - True if successful, false otherwise
 * 
 * This function:
 * - Validates that the icon exists and target element is valid
 * - Sets accessibility attributes (aria-hidden) for decorative icons
 * - Skips insertion if icon already exists to avoid duplicates
 * - Inserts the SVG markup directly into the element
 */
function insertIcon(iconName, targetElement) {
    // Validate inputs
    if (!targetElement || !Icons[iconName]) {
        return false;
    }
    
    // Mark as decorative for screen readers (icons are visual only)
    targetElement.setAttribute('aria-hidden', 'true');
    
    // Skip if icon already inserted (prevents duplicates)
    if (targetElement.querySelector('svg')) {
        return true;
    }
    
    // Insert the SVG markup
    targetElement.innerHTML = Icons[iconName];
    
    // Also mark the SVG element itself as non-accessible
    const svg = targetElement.querySelector('svg');
    if (svg) {
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');  // Prevent keyboard focus
    }
    
    return true;
}

/**
 * initAllIcons()
 * 
 * Scans the entire page for elements with [data-icon] attributes and
 * inserts the corresponding SVG icons. This is called on page load
 * and when new elements are dynamically added.
 * 
 * Usage: Elements with data-icon="iconName" will automatically get the icon inserted.
 */
function initAllIcons() {
    // Find all elements with data-icon attribute
    const iconElements = document.querySelectorAll('[data-icon]');
    
    iconElements.forEach(el => {
        // Clear any existing content first
        el.innerHTML = '';
        const iconName = el.getAttribute('data-icon');
        
        // Insert icon if it exists in the Icons object
        if (iconName && Icons[iconName]) {
            insertIcon(iconName, el);
        }
    });
}

/**
 * Auto-Initialization
 * 
 * Automatically initializes icons when the DOM is ready.
 * Also sets up a MutationObserver to watch for dynamically added elements
 * (useful for single-page applications or AJAX-loaded content).
 */
(function() {
    /**
     * initIcons()
     * Wrapper function to call initAllIcons()
     */
    function initIcons() {
        initAllIcons();
    }
    
    // Check if DOM is still loading
    if (document.readyState === 'loading') {
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', initIcons);
    } else {
        // DOM already loaded, initialize immediately
        initIcons();
    }
    
    /**
     * MutationObserver for Dynamic Content
     * 
     * Watches for new elements added to the page and re-initializes icons
     * when elements with [data-icon] attributes are added.
     * This ensures icons work in dynamically loaded content.
     */
    const observer = new MutationObserver(function(mutations) {
        let shouldReinit = false;
        
        // Check each mutation for new nodes with data-icon attribute
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    // Check if new node has data-icon attribute
                    if (node.nodeType === 1 && node.hasAttribute && node.hasAttribute('data-icon')) {
                        shouldReinit = true;
                    }
                });
            }
        });
        
        // Re-initialize all icons if new icon elements were added
        if (shouldReinit) {
            initAllIcons();
        }
    });
    
    // Start observing the document body for changes
    if (document.body) {
        observer.observe(document.body, {
            childList: true,    // Watch for added/removed child nodes
            subtree: true       // Watch all descendants, not just direct children
        });
    }
})();

// ============================================================================
// GLOBAL EXPORTS
// ============================================================================
// Make functions available globally for manual use if needed
window.insertIcon = insertIcon;      // Manually insert a single icon
window.initAllIcons = initAllIcons; // Manually re-initialize all icons
