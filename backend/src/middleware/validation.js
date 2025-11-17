/**
 * Input Validation Middleware
 * Validates and sanitizes all incoming requests
 */

const logger = require('../utils/logger');

/**
 * Validates email format
 */
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 255;
}

/**
 * Validates and sanitizes string input
 */
function sanitizeString(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

/**
 * Validates case ID format
 */
function isValidCaseId(caseId) {
  if (typeof caseId !== 'string') return false;
  // Format: C-XXXXXXXXXXXX or AR-XXXXXXXXXXXX
  return /^[CAR](-[A-Z0-9]{12,})?$/.test(caseId);
}

/**
 * Validates file type by extension and MIME type
 */
function isValidFileType(filename, mimetype) {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.doc', '.docx'];
  const fileExt = require('path').extname(filename).toLowerCase();
  
  return allowedTypes.includes(mimetype) && allowedExtensions.includes(fileExt);
}

/**
 * Contact form validation middleware
 */
function validateContactInput(req, res, next) {
  const errors = [];
  const sanitized = {};
  
  // Name validation
  if (!req.body.name || !req.body.name.trim()) {
    errors.push('Name is required');
  } else {
    const name = sanitizeString(req.body.name, 100);
    if (name.length < 2) {
      errors.push('Name must be at least 2 characters');
    } else if (name.length > 100) {
      errors.push('Name is too long (max 100 characters)');
    } else {
      sanitized.name = name;
    }
  }
  
  // Email validation
  if (!req.body.email || !req.body.email.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(req.body.email)) {
    errors.push('Invalid email format');
  } else {
    sanitized.email = req.body.email.trim().toLowerCase();
  }
  
  // Phone validation (optional)
  if (req.body.phone) {
    const phone = sanitizeString(req.body.phone, 20);
    if (phone.length > 0 && phone.length < 10) {
      errors.push('Phone number is too short');
    } else {
      sanitized.phone = phone;
    }
  }
  
  // Message validation
  if (req.body.message) {
    const message = sanitizeString(req.body.message, 5000);
    if (message.length > 5000) {
      errors.push('Message is too long (max 5000 characters)');
    } else {
      sanitized.message = message;
    }
  }
  
  // Service type validation
  if (req.body.serviceType) {
    const allowedServices = [
      'forex', 'crypto', 'stock-trading', 'binary-options', 
      'nigerian-scam', 'other', 'corporate-asset-recovery',
      'property-reclaim', 'digital-forensics', 'due-diligence',
      'surveillance', 'litigation-support'
    ];
    const serviceType = sanitizeString(req.body.serviceType, 50);
    if (!allowedServices.includes(serviceType)) {
      errors.push('Invalid service type');
    } else {
      sanitized.serviceType = serviceType;
    }
  }
  
  if (errors.length > 0) {
    logger.warn('Contact form validation failed', { errors, ip: req.ip });
    return res.status(400).json({ 
      success: false, 
      errors 
    });
  }
  
  // Replace request body with sanitized data
  req.body = sanitized;
  next();
}

/**
 * Case ID validation middleware
 */
function validateCaseId(req, res, next) {
  const caseId = req.params.caseId || req.query.caseId || req.body.caseId;
  
  if (!caseId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Case ID is required' 
    });
  }
  
  if (!isValidCaseId(caseId)) {
    logger.warn('Invalid case ID format', { caseId, ip: req.ip });
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid case ID format' 
    });
  }
  
  req.sanitizedCaseId = caseId;
  next();
}

/**
 * Admin login validation
 */
function validateAdminLogin(req, res, next) {
  const errors = [];
  
  if (!req.body.email || !req.body.email.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(req.body.email)) {
    errors.push('Invalid email format');
  }
  
  if (!req.body.password) {
    errors.push('Password is required');
  } else if (typeof req.body.password !== 'string') {
    errors.push('Invalid password format');
  } else if (req.body.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else if (req.body.password.length > 128) {
    errors.push('Password is too long');
  }
  
  if (errors.length > 0) {
    logger.warn('Admin login validation failed', { 
      email: req.body.email ? 'provided' : 'missing',
      ip: req.ip 
    });
    return res.status(400).json({ 
      success: false, 
      errors 
    });
  }
  
  // Sanitize email
  req.body.email = req.body.email.trim().toLowerCase();
  next();
}

/**
 * Pagination validation
 */
function validatePagination(req, res, next) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  
  req.pagination = { page, limit };
  next();
}

/**
 * File upload validation (pre-upload)
 */
function validateFileUpload(req, res, next) {
  if (!req.files || req.files.length === 0) {
    return next(); // Files are optional
  }
  
  const errors = [];
  const maxFileSize = (process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024;
  const maxFiles = parseInt(process.env.MAX_FILES_PER_UPLOAD) || 5;
  
  if (req.files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`);
  }
  
  for (const file of req.files) {
    if (file.size > maxFileSize) {
      errors.push(`File "${file.originalname}" exceeds ${process.env.MAX_FILE_SIZE_MB || 10}MB limit`);
    }
    
    if (!isValidFileType(file.originalname, file.mimetype)) {
      errors.push(`File type not allowed: ${file.originalname}`);
    }
    
    // Check for suspicious filenames
    if (/\.\.|%00|[\x00-\x1f]/.test(file.originalname)) {
      errors.push(`Invalid filename: ${file.originalname}`);
    }
  }
  
  if (errors.length > 0) {
    logger.warn('File upload validation failed', { errors, ip: req.ip });
    return res.status(400).json({ 
      success: false, 
      errors 
    });
  }
  
  next();
}

module.exports = {
  validateContactInput,
  validateCaseId,
  validateAdminLogin,
  validatePagination,
  validateFileUpload,
  isValidEmail,
  sanitizeString,
  isValidCaseId,
  isValidFileType
};

