/**
 * XSS Prevention Utilities (Browser-compatible)
 * Sanitizes user input to prevent XSS attacks
 */

(function(window) {
  'use strict';

  /**
   * Escapes HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text safe for HTML
   */
  function escapeHtml(text) {
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
    
    return text.replace(/[&<>"'/]/g, function(char) {
      return map[char];
    });
  }

  /**
   * Safely sets text content (replaces innerHTML usage)
   * @param {HTMLElement} element - Element to update
   * @param {string} text - Text to set
   */
  function setSafeText(element, text) {
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
  function setSafeHtml(element, html) {
    if (!element) return;
    
    // Basic sanitization - remove script tags and event handlers
    let sanitized = String(html)
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:text\/html/gi, '');
    
    // For now, use textContent for maximum safety
    // In production, integrate DOMPurify: element.innerHTML = DOMPurify.sanitize(html);
    element.textContent = sanitized;
  }

  /**
   * Creates safe HTML from template with escaped values
   * @param {string} template - Template string with ${} placeholders
   * @param {Object} values - Values to insert (will be escaped)
   * @returns {string} - Safe HTML string
   */
  function safeTemplate(template, values) {
    let result = template;
    for (const key in values) {
      const placeholder = '${' + key + '}';
      const escaped = escapeHtml(String(values[key]));
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), escaped);
    }
    return result;
  }

  /**
   * Validates and sanitizes email address
   * @param {string} email - Email to validate
   * @returns {string|null} - Sanitized email or null if invalid
   */
  function sanitizeEmail(email) {
    if (typeof email !== 'string') return null;
    
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(trimmed)) return null;
    if (trimmed.length > 255) return null;
    
    return escapeHtml(trimmed);
  }

  // Export to window
  window.Sanitize = {
    escapeHtml: escapeHtml,
    setSafeText: setSafeText,
    setSafeHtml: setSafeHtml,
    safeTemplate: safeTemplate,
    sanitizeEmail: sanitizeEmail
  };

})(window);

