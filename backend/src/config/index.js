/**
 * Centralized Environment Configuration
 * Loads and validates all environment variables
 */

require('dotenv').config();

const config = {
  // Server Configuration
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  useHttps: process.env.USE_HTTPS !== 'false',

  // Admin Configuration
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@sleuthservice.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'capital-reclaim-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'mail.sleuthservice.com',
    port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true' || process.env.EMAIL_SECURE === 'true',
    user: process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@sleuthservice.com',
    password: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '',
    from: process.env.DEFAULT_EMAIL_FROM || 'noreply@sleuthservice.com',
  },

  // Data Retention (GDPR Compliance)
  retention: {
    dataDays: parseInt(process.env.DATA_RETENTION_DAYS, 10) || 2555,
    completedCaseDays: parseInt(process.env.COMPLETED_CASE_RETENTION_DAYS, 10) || 1095,
    backupDays: parseInt(process.env.BACKUP_RETENTION_DAYS, 10) || 30,
  },

  // Security Settings
  security: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,
    maxFilesPerUpload: parseInt(process.env.MAX_FILES_PER_UPLOAD, 10) || 5,
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

// Validation for production
if (config.env === 'production') {
  const errors = [];

  if (config.admin.password === 'admin123' || !process.env.ADMIN_PASSWORD) {
    errors.push('ADMIN_PASSWORD must be set in production');
  }

  if (config.jwt.secret.includes('capital-reclaim-secret-key-change-in-production')) {
    errors.push('JWT_SECRET must be changed in production');
  }

  if (!config.email.password || config.email.password === '') {
    errors.push('Email password (SMTP_PASS or EMAIL_PASSWORD) must be set in production');
  }

  if (errors.length > 0) {
    console.error('❌ Configuration errors detected:');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('\n⚠️  Please fix these issues before deploying to production.');
    process.exit(1);
  }
}

module.exports = config;

