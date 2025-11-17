/**
 * XSS Prevention Utilities
 * Sanitizes user input to prevent XSS attacks
 */

/**
 * Escapes HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text safe for HTML
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') {
    return String(text);
  }
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Sanitizes text for use in HTML attributes
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export function sanitizeAttribute(text) {
  return escapeHtml(String(text)).replace(/[^\w\s-]/g, '');
}

/**
 * Sanitizes a string for use in innerHTML (basic)
 * For production, consider using DOMPurify library
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized HTML
 */
export function sanitizeHtml(html) {
  if (typeof html !== 'string') {
    return '';
  }
  
  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');
  
  // Escape remaining HTML
  return escapeHtml(sanitized);
}

/**
 * Creates a safe text node (preferred over innerHTML)
 * @param {string} text - Text content
 * @returns {Text} - Safe text node
 */
export function createTextNode(text) {
  return document.createTextNode(String(text));
}

/**
 * Safely sets text content (replaces innerHTML usage)
 * @param {HTMLElement} element - Element to update
 * @param {string} text - Text to set
 */
export function setSafeText(element, text) {
  if (element) {
    element.textContent = String(text);
  }
}

/**
 * Safely sets HTML content with basic sanitization
 * WARNING: For production, use DOMPurify library instead
 * @param {HTMLElement} element - Element to update
 * @param {string} html - HTML to set (will be sanitized)
 */
export function setSafeHtml(element, html) {
  if (!element) return;
  
  // For now, use textContent for safety
  // In production, integrate DOMPurify: element.innerHTML = DOMPurify.sanitize(html);
  element.textContent = String(html);
}

/**
 * Validates and sanitizes email address
 * @param {string} email - Email to validate
 * @returns {string|null} - Sanitized email or null if invalid
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return null;
  
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) return null;
  if (trimmed.length > 255) return null;
  
  return escapeHtml(trimmed);
}

/**
 * Validates and sanitizes URL
 * @param {string} url - URL to validate
 * @returns {string|null} - Sanitized URL or null if invalid
 */
export function sanitizeUrl(url) {
  if (typeof url !== 'string') return null;
  
  const trimmed = url.trim();
  
  // Only allow http, https, mailto, tel
  if (!/^(https?|mailto|tel):/i.test(trimmed)) return null;
  
  try {
    const urlObj = new URL(trimmed);
    return urlObj.toString();
  } catch {
    return null;
  }
}

// Export for use in both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    escapeHtml,
    sanitizeAttribute,
    sanitizeHtml,
    createTextNode,
    setSafeText,
    setSafeHtml,
    sanitizeEmail,
    sanitizeUrl
  };
}

