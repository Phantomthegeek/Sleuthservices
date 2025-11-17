# cPanel Webmail SMTP Settings Guide

From the cPanel webmail client configuration page, you should see:

## Typical SMTP Settings for cPanel:

### Secure SSL/TLS Settings (Recommended):
- **Incoming Server**: sleuthservice.com (or mail.sleuthservice.com)
- **IMAP Port**: 993
- **POP3 Port**: 995
- **Outgoing Server**: sleuthservice.com (or mail.sleuthservice.com)
- **SMTP Port**: 465
- **Requires SSL/TLS**: Yes

### Non-SSL Settings:
- **Incoming Server**: mail.sleuthservice.com
- **IMAP Port**: 143
- **POP3 Port**: 110
- **Outgoing Server**: mail.sleuthservice.com
- **SMTP Port**: 587
- **Requires SSL/TLS**: No (uses STARTTLS)

## What to Check:
1. The exact SMTP server hostname
2. The SMTP port (usually 587 or 465)
3. Whether SSL/TLS is required
4. The username format (full email or just username)

## Current Configuration:
- SMTP_HOST: mail.sleuthservice.com
- SMTP_PORT: 587
- SMTP_SECURE: false
- SMTP_USER: noreply@sleuthservice.com
