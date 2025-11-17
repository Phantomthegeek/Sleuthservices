# Configuration Module

This module provides centralized configuration management for the Sleuthservice backend.

## Usage

```javascript
const config = require('./src/config');

// Access configuration values
const port = config.port;
const adminEmail = config.admin.email;
const emailHost = config.email.host;
```

## Configuration Structure

### Server Configuration
- `env`: Environment (development/production)
- `port`: Server port
- `useHttps`: Whether to use HTTPS

### Admin Configuration
- `admin.email`: Admin email address
- `admin.password`: Admin password

### JWT Configuration
- `jwt.secret`: JWT secret key
- `jwt.expiresIn`: JWT expiration time

### Email Configuration
- `email.host`: SMTP host
- `email.port`: SMTP port
- `email.secure`: Use secure connection
- `email.user`: SMTP username
- `email.password`: SMTP password
- `email.from`: Default "From" address

### Data Retention
- `retention.dataDays`: Data retention period (days)
- `retention.completedCaseDays`: Completed case retention (days)
- `retention.backupDays`: Backup retention (days)

### Security Settings
- `security.rateLimitWindowMs`: Rate limit window (ms)
- `security.rateLimitMaxRequests`: Max requests per window
- `security.maxFileSizeMB`: Max file size (MB)
- `security.maxFilesPerUpload`: Max files per upload

### Logging
- `logging.level`: Log level (error/warn/info/debug)

## Production Validation

The configuration module automatically validates critical settings in production:
- Admin password must be changed from default
- JWT secret must be changed from default
- Email password must be set

If validation fails, the application will exit with an error message.

