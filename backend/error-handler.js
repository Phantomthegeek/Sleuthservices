/**
 * Centralized Error Handling and Logging
 * 
 * This module provides centralized error tracking, logging, and monitoring
 * for the Capital Reclaim application.
 */

const fs = require('fs').promises;
const path = require('path');

// Error log directory
const ERROR_LOG_DIR = path.join(__dirname, 'logs', 'errors');

// Ensure error log directory exists
async function ensureErrorLogDir() {
  try {
    await fs.mkdir(ERROR_LOG_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create error log directory:', error);
  }
}

// Initialize on load
ensureErrorLogDir();

/**
 * Log error to file
 */
async function logError(error, context = {}) {
  try {
    const logFile = path.join(
      ERROR_LOG_DIR,
      `errors-${new Date().toISOString().split('T')[0]}.log`
    );
    
    const errorEntry = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message || 'Unknown error',
        stack: error.stack || null,
        name: error.name || 'Error',
        code: error.code || null
      },
      context: {
        ...context,
        nodeVersion: process.version,
        platform: process.platform
      }
    };
    
    await fs.appendFile(logFile, JSON.stringify(errorEntry) + '\n');
    
    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('📛 Error logged:', errorEntry);
    }
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
}

/**
 * Get error statistics
 */
async function getErrorStats(days = 7) {
  try {
    const errors = [];
    const files = await fs.readdir(ERROR_LOG_DIR);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    for (const file of files) {
      if (file.startsWith('errors-') && file.endsWith('.log')) {
        const filePath = path.join(ERROR_LOG_DIR, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        const lines = content.trim().split('\n').filter(l => l);
        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            if (new Date(entry.timestamp) >= cutoffDate) {
              errors.push(entry);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
    
    // Analyze errors
    const stats = {
      total: errors.length,
      byType: {},
      byDay: {},
      recent: errors.slice(-10)
    };
    
    errors.forEach(entry => {
      // Count by error type
      const errorType = entry.error.name || 'Unknown';
      stats.byType[errorType] = (stats.byType[errorType] || 0) + 1;
      
      // Count by day
      const day = entry.timestamp.split('T')[0];
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    });
    
    return stats;
  } catch (error) {
    console.error('Failed to get error stats:', error);
    return { total: 0, byType: {}, byDay: {}, recent: [] };
  }
}

/**
 * Clean old error logs (retention policy)
 */
async function cleanOldErrorLogs(retentionDays = 30) {
  try {
    const files = await fs.readdir(ERROR_LOG_DIR);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    let deleted = 0;
    for (const file of files) {
      if (file.startsWith('errors-') && file.endsWith('.log')) {
        const filePath = path.join(ERROR_LOG_DIR, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          deleted++;
        }
      }
    }
    
    if (deleted > 0) {
      console.log(`🧹 Cleaned up ${deleted} old error log file(s)`);
    }
    
    return deleted;
  } catch (error) {
    console.error('Failed to clean old error logs:', error);
    return 0;
  }
}

/**
 * Express error middleware
 */
function errorHandler(err, req, res, next) {
  // Log the error
  logError(err, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  // Send appropriate response
  if (err.code === 'ENOENT') {
    return res.status(404).json({ 
      success: false, 
      error: 'Resource not found' 
    });
  }
  
  if (err.code === 'EACCES' || err.code === 'EPERM') {
    return res.status(403).json({ 
      success: false, 
      error: 'Permission denied' 
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
}

module.exports = {
  logError,
  getErrorStats,
  cleanOldErrorLogs,
  errorHandler,
  ensureErrorLogDir
};

