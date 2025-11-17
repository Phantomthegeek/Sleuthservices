# Namecheap Deployment Guide for Sleuthservice

## Prerequisites

1. **Namecheap Hosting Account** with:
   - cPanel access
   - Node.js support (check your hosting plan)
   - Email account set up for `noreply@sleuthservice.com`

2. **Domain Configuration**:
   - Domain `sleuthservice.com` pointed to Namecheap nameservers
   - SSL certificate (Let's Encrypt via cPanel)

## Step 1: Prepare Files for Upload

### Files to Upload (Frontend):
- All HTML files (index.html, about.html, asset-reclaim.html, etc.)
- styles.css
- script.js
- icons.js
- siteConfig.js
- terms-acceptance.js
- ui.js
- All other frontend assets

### Files to Upload (Backend):
- backend/ folder with:
  - server.js
  - package.json
  - package-lock.json
  - All backend files (excluding node_modules, uploads, logs, data)

## Step 2: Upload Files via cPanel File Manager

1. **Login to cPanel**
   - Go to your Namecheap account
   - Access cPanel

2. **Upload Frontend Files**:
   - Navigate to `public_html/` directory
   - Upload all frontend files (HTML, CSS, JS) to the root of `public_html/`
   - Files should be directly accessible via `https://sleuthservice.com/`

3. **Upload Backend Files (SECURITY: Outside public_html/)**:
   - **IMPORTANT**: For security, place backend files OUTSIDE `public_html/`
   - Navigate to your home directory (one level up from `public_html/`)
   - Create a folder named `backend/` in your home directory
   - Upload all backend files to `~/backend/` (NOT in `public_html/backend/`)
   - This prevents direct web access to backend files and sensitive data
   - Upload all backend files except:
     - `node_modules/` (will be installed on server)
     - `uploads/` (will be created automatically)
     - `logs/` (will be created automatically)
     - `data/` (will be created automatically)
   
   **File Structure Should Look Like:**
   ```
   ~/
   ├── public_html/          (Frontend files - publicly accessible)
   │   ├── index.html
   │   ├── styles.css
   │   ├── script.js
   │   └── ... (all frontend files)
   │
   └── backend/               (Backend files - NOT publicly accessible)
       ├── server.js
       ├── package.json
       ├── .env
       └── ... (all backend files)
   ```

## Step 3: Install Node.js Dependencies

### Option A: Via cPanel Terminal/SSH
1. Access Terminal/SSH in cPanel
2. Navigate to backend directory:
   ```bash
   cd ~/backend
   # or wherever you uploaded the backend files
   ```
3. Install dependencies:
   ```bash
   npm install --production
   ```

### Option B: Via cPanel Node.js App Manager
1. Go to cPanel → Node.js App Manager
2. Create a new Node.js application:
   - Application root: `backend`
   - Application URL: `sleuthservice.com` (or subdomain)
   - Application startup file: `server.js`
   - Node.js version: Latest LTS
3. Click "Create"
4. Install dependencies via the interface or terminal

## Step 4: Configure Environment Variables

1. **Create `.env` file** in the `backend/` directory:
   ```bash
   cd ~/backend
   nano .env
   ```

2. **Add production configuration**:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=production

   # Admin Credentials (CHANGE THESE!)
   ADMIN_EMAIL=admin@sleuthservice.com
   ADMIN_PASSWORD=YOUR_SECURE_PASSWORD_HERE

   # JWT Secret (Generate a strong random string)
   JWT_SECRET=YOUR_SECURE_JWT_SECRET_HERE

   # Email Configuration (cPanel Webmail)
   SMTP_HOST=mail.sleuthservice.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=noreply@sleuthservice.com
   SMTP_PASS="YOUR_EMAIL_PASSWORD_HERE"

   # Data Retention Policy
   DATA_RETENTION_DAYS=2555
   COMPLETED_CASE_RETENTION_DAYS=1095
   BACKUP_RETENTION_DAYS=30
   ```

3. **Generate secure secrets**:
   ```bash
   # Generate JWT_SECRET (run this locally or on server)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Step 5: Configure Email in cPanel

1. **Create Email Account**:
   - Go to cPanel → Email Accounts
   - Create `noreply@sleuthservice.com`
   - Set a strong password
   - Use this password in `.env` as `SMTP_PASS`

2. **Email Settings**:
   - SMTP Host: `mail.sleuthservice.com`
   - SMTP Port: `587` (or `465` for SSL)
   - SMTP Secure: `false` (or `true` for port 465)
   - Authentication: Required

## Step 6: Set Up SSL Certificate (AutoSSL)

### Enable AutoSSL for Free Let's Encrypt Certificate

1. **Access SSL/TLS Manager**:
   - Login to cPanel
   - Navigate to **Security** → **SSL/TLS Status**
   - Or search for "SSL" in cPanel search bar

2. **Run AutoSSL**:
   - You'll see a list of domains/subdomains
   - Find `sleuthservice.com` in the list
   - Click the **"Run AutoSSL"** button at the top
   - Wait for the process to complete (usually 1-5 minutes)
   - The certificate will be automatically issued and installed

3. **Verify SSL Installation**:
   - Check the SSL/TLS Status page - your domain should show:
     - ✅ **Valid Certificate** (green checkmark)
     - **Issued By**: Let's Encrypt
     - **Expires**: ~90 days (AutoSSL will auto-renew)
   - Visit `https://sleuthservice.com` in your browser
   - You should see a padlock icon in the address bar

4. **AutoSSL Auto-Renewal**:
   - AutoSSL automatically renews certificates before expiration
   - No manual intervention needed
   - Renewal happens automatically every ~60 days

5. **Force HTTPS Redirect** (Recommended):
   - Create or edit `.htaccess` file in `public_html/` directory
   - Add the following rules:
   ```apache
   # Force HTTPS
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   
   # Force www or non-www (choose one)
   # Option 1: Force www
   RewriteCond %{HTTP_HOST} !^www\. [NC]
   RewriteRule ^(.*)$ https://www.%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   
   # Option 2: Force non-www (remove www)
   # RewriteCond %{HTTP_HOST} ^www\.(.*)$ [NC]
   # RewriteRule ^(.*)$ https://%1%{REQUEST_URI} [L,R=301]
   ```
   - This ensures all HTTP traffic redirects to HTTPS
   - Save the file and test: `http://sleuthservice.com` should redirect to `https://sleuthservice.com`

6. **Troubleshooting SSL Issues**:
   - If AutoSSL fails, check:
     - Domain DNS is pointing to Namecheap nameservers
     - Domain is properly added in cPanel
     - No firewall blocking port 80/443
   - If certificate doesn't appear, wait 5-10 minutes and refresh
   - Contact Namecheap support if issues persist

## Step 7: Configure Backend Server

### Option A: Using PM2 (Recommended)
1. **Install PM2 globally**:
   ```bash
   npm install -g pm2
   ```

2. **Start the server**:
   ```bash
   cd ~/backend
   pm2 start server.js --name sleuthservice
   pm2 save
   pm2 startup  # Follow instructions to enable auto-start
   ```

### Option B: Using cPanel Node.js App Manager
1. In Node.js App Manager, set:
   - Application startup file: `server.js`
   - Application URL: Your domain or subdomain
2. Click "Start" or "Restart"

### Option C: Using Forever
```bash
npm install -g forever
cd ~/backend
forever start server.js
```

## Step 8: Configure File Permissions

Set proper permissions:
```bash
cd ~/backend
chmod 755 server.js
chmod 644 .env
chmod -R 755 data/
chmod -R 755 uploads/
chmod -R 755 logs/
```

## Step 9: Update Frontend API URLs (if needed)

If your backend runs on a different port or subdomain, update API URLs in:
- `script.js`
- `client-login.html`
- `client-dashboard.html`
- `admin-login.html`
- `admin-dashboard.html`

Change `http://localhost:3000` to your production API URL.

## Step 10: Test the Deployment

1. **Test Frontend**:
   - Visit `https://sleuthservice.com`
   - Check all pages load correctly
   - Test navigation

2. **Test Backend**:
   - Visit `https://sleuthservice.com/api/health`
   - Should return: `{"success":true,"message":"Server is running"}`

3. **Test Forms**:
   - Submit a test case via contact form
   - Check email is sent
   - Verify case appears in admin dashboard

4. **Test Admin Login**:
   - Go to `https://sleuthservice.com/admin-login.html`
   - Login with admin credentials
   - Verify dashboard loads

## Step 11: Set Up Automatic Backups

1. **Via cPanel Cron Jobs**:
   - Go to cPanel → Cron Jobs
   - Add a daily backup job:
   ```bash
   0 2 * * * cd ~/backend && node backup.js
   ```

## Troubleshooting

### Backend Not Starting
- **Verify backend location**: Ensure backend is in `~/backend/` NOT `~/public_html/backend/`
- Check Node.js version: `node --version`
- Check logs: `pm2 logs sleuthservice` or check `~/backend/logs/`
- Verify `.env` file exists in `~/backend/.env` with correct values
- Check port is not in use: `netstat -tulpn | grep 3000`
- Verify file permissions: `chmod 755 ~/backend/server.js`
- Check if backend path is correct in Node.js App Manager (if using cPanel)

### Email Not Sending
- Verify email account exists in cPanel
- Check SMTP credentials in `.env`
- Test email settings using `backend/test-email.js`
- Check cPanel email logs

### SSL Issues
- **AutoSSL not running**: Go to SSL/TLS Status → Click "Run AutoSSL" → Wait 5-10 minutes
- **Certificate not appearing**: 
  - Verify domain DNS points to Namecheap nameservers
  - Check domain is added in cPanel
  - Wait 10-15 minutes for DNS propagation
- **Mixed content warnings**: Ensure all resources (CSS, JS, images) load via HTTPS
- **Certificate expired**: AutoSSL should auto-renew, but manually run AutoSSL if needed
- **HTTPS redirect not working**: Check `.htaccess` file exists and has correct rewrite rules
- Verify certificate is valid: Visit `https://sleuthservice.com` and check browser padlock icon

### File Upload Issues
- Check `backend/uploads/` directory permissions
- Verify directory exists and is writable
- Check file size limits in cPanel

## Security Checklist

- [ ] Changed default admin password in `.env`
- [ ] Set strong JWT_SECRET in `.env`
- [ ] **Backend files placed OUTSIDE `public_html/`** (in `~/backend/`)
- [ ] `.env` file has correct permissions (644) - not world-readable
- [ ] SSL certificate installed via AutoSSL and working
- [ ] HTTPS redirect enabled in `.htaccess`
- [ ] Regular backups configured via cron job
- [ ] Email account secured with strong password
- [ ] File upload limits configured in cPanel
- [ ] Error logging enabled
- [ ] Node.js process running with PM2 or process manager
- [ ] Firewall rules configured (if applicable)
- [ ] Database/data files not accessible via web

## Support

For Namecheap-specific issues:
- Namecheap Knowledge Base: https://www.namecheap.com/support/
- cPanel Documentation: https://docs.cpanel.net/

## Notes

- Namecheap shared hosting may have limitations on Node.js
- Consider Namecheap VPS or dedicated server for better Node.js support
- Some shared hosting plans may require using a subdomain for Node.js apps
- Check your hosting plan's Node.js support before deployment

