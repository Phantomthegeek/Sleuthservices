/**
 * Production Logging System
 * Replaces console.log with structured logging
 */

const fs = require('fs').promises;
const path = require('path');

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const LOG_LEVEL_NAMES = {
  0: 'ERROR',
  1: 'WARN',
  2: 'INFO',
  3: 'DEBUG'
};

class Logger {
  constructor() {
    this.logLevel = this.getLogLevel();
    this.logDir = path.join(__dirname, '../../logs');
    this.errorLogDir = path.join(this.logDir, 'errors');
    this.init();
  }

  getLogLevel() {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    return LOG_LEVELS[envLevel] ?? LOG_LEVELS.INFO;
  }

  async init() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
      await fs.mkdir(this.errorLogDir, { recursive: true });
    } catch (error) {
      // Fallback to console if directory creation fails
      console.error('Failed to create log directories:', error.message);
    }
  }

  shouldLog(level) {
    return level <= this.logLevel;
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const levelName = LOG_LEVEL_NAMES[level];
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${levelName}] ${message}${dataStr}\n`;
  }

  sanitizeData(data) {
    if (!data) return null;
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];
    const sanitized = { ...data };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }
    
    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }
    
    return sanitized;
  }

  async writeToFile(filename, message) {
    try {
      const filePath = path.join(this.logDir, filename);
      await fs.appendFile(filePath, message, 'utf8');
    } catch (error) {
      // Fallback to console if file write fails
      if (process.env.NODE_ENV !== 'production') {
        console.error('Log write failed:', error.message);
      }
    }
  }

  async error(message, error = null, data = null) {
    if (!this.shouldLog(LOG_LEVELS.ERROR)) return;
    
    const sanitizedData = this.sanitizeData(data);
    const errorData = error ? {
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
      ...sanitizedData
    } : sanitizedData;
    
    const logMessage = this.formatMessage(LOG_LEVELS.ERROR, message, errorData);
    
    // Write to error log file
    const errorLogFile = `errors-${new Date().toISOString().split('T')[0]}.log`;
    await this.writeToFile(`errors/${errorLogFile}`, logMessage);
    
    // Also write to main log
    const mainLogFile = `app-${new Date().toISOString().split('T')[0]}.log`;
    await this.writeToFile(mainLogFile, logMessage);
    
    // Console output (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌', message, errorData);
    }
  }

  async warn(message, data = null) {
    if (!this.shouldLog(LOG_LEVELS.WARN)) return;
    
    const sanitizedData = this.sanitizeData(data);
    const logMessage = this.formatMessage(LOG_LEVELS.WARN, message, sanitizedData);
    
    const logFile = `app-${new Date().toISOString().split('T')[0]}.log`;
    await this.writeToFile(logFile, logMessage);
    
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️', message, sanitizedData);
    }
  }

  async info(message, data = null) {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    
    const sanitizedData = this.sanitizeData(data);
    const logMessage = this.formatMessage(LOG_LEVELS.INFO, message, sanitizedData);
    
    const logFile = `app-${new Date().toISOString().split('T')[0]}.log`;
    await this.writeToFile(logFile, logMessage);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('ℹ️', message, sanitizedData || '');
    }
  }

  async debug(message, data = null) {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
    
    const sanitizedData = this.sanitizeData(data);
    const logMessage = this.formatMessage(LOG_LEVELS.DEBUG, message, sanitizedData);
    
    const logFile = `app-${new Date().toISOString().split('T')[0]}.log`;
    await this.writeToFile(logFile, logMessage);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍', message, sanitizedData || '');
    }
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;

