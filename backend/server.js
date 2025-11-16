// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Load SSL certificates if they exist
let httpsEnabled = false;
let httpsServer = null;

if (process.env.USE_HTTPS !== 'false') {
  try {
    const fs = require('fs');
    const https = require('https');
    const certPath = path.join(__dirname, 'ssl', 'cert.pem');
    const keyPath = path.join(__dirname, 'ssl', 'key.pem');
    
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      const options = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath)
      };
      httpsServer = https.createServer(options, app);
      httpsEnabled = true;
      console.log('🔒 HTTPS enabled with SSL certificate');
    }
  } catch (error) {
    console.log('⚠️  HTTPS not available, using HTTP');
  }
}

const PORT = process.env.PORT || 3000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sleuthservice.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // ⚠️ CHANGE IN PRODUCTION - MUST be set in .env
const JWT_SECRET = process.env.JWT_SECRET || 'capital-reclaim-secret-key-change-in-production'; // ⚠️ CHANGE IN PRODUCTION

// Security warning for production
if (process.env.NODE_ENV === 'production') {
  if (ADMIN_PASSWORD === 'admin123' || !process.env.ADMIN_PASSWORD) {
    console.error('🚨 CRITICAL SECURITY WARNING: Default admin password detected in production!');
    console.error('🚨 Set ADMIN_PASSWORD in .env file immediately!');
  }
  if (JWT_SECRET.includes('capital-reclaim-secret-key-change-in-production')) {
    console.error('🚨 CRITICAL SECURITY WARNING: Default JWT secret detected in production!');
    console.error('🚨 Set JWT_SECRET in .env file immediately!');
  }
}

// Configure email transporter - Using Outlook by default (no app password needed)
// To use Gmail: Change host to 'smtp.gmail.com' and use App Password
// To use Yahoo: Change host to 'smtp.mail.yahoo.com'
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'noreply@sleuthservice.com',
    pass: process.env.EMAIL_PASSWORD || 'vNOssNkZLM3t'
  }
});

// Set default email from address
const DEFAULT_EMAIL_FROM = process.env.DEFAULT_EMAIL_FROM || process.env.EMAIL_USER || 'noreply@sleuthservice.com';

// Security middleware - Enhanced for production
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

app.use(cors());

// Trust proxy for accurate IP addresses (important for rate limiting and security)
app.set('trust proxy', 1);

// Rate limiting - prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.use('/api/admin/login', authLimiter);

// Rate limiting for client OTP endpoints
const clientLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 OTP requests per windowMs
  message: 'Too many OTP requests. Please wait a few minutes before trying again.',
  skipSuccessfulRequests: false,
});

const clientVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 verification attempts per windowMs
  message: 'Too many verification attempts. Please wait a few minutes before trying again.',
  skipSuccessfulRequests: false,
});

app.use('/api/client/request-login', clientLoginLimiter);
app.use('/api/client/verify-otp', clientVerifyLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Data storage setup
const dataDir = path.join(__dirname, 'data');
const leadsFile = path.join(dataDir, 'leads.json');
const usersFile = path.join(dataDir, 'users.json');

const initDirectories = async () => {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(path.join(__dirname, 'uploads'), { recursive: true });
    
    await fs.access(leadsFile).catch(() => fs.writeFile(leadsFile, '[]', 'utf8'));
    await fs.access(usersFile).catch(() => fs.writeFile(usersFile, '[]', 'utf8'));
  } catch (error) {
    console.error('Directory initialization failed:', error);
  }
};

let writeQueue = Promise.resolve();

const readLeads = async () => {
  try {
    const data = await fs.readFile(leadsFile, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading leads:', error);
    return [];
  }
};

const writeLeads = async (leads) => {
  return new Promise((resolve, reject) => {
    writeQueue = writeQueue
      .then(() => fs.writeFile(leadsFile, JSON.stringify(leads, null, 2), 'utf8'))
      .then(resolve)
      .catch(reject);
  });
};

const readUsers = async () => {
  try {
    const data = await fs.readFile(usersFile, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    return [];
  }
};

const writeUsers = async (users) => {
  return new Promise((resolve, reject) => {
    writeQueue = writeQueue
      .then(() => fs.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf8'))
      .then(resolve)
      .catch(reject);
  });
};

// Email helper
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: DEFAULT_EMAIL_FROM,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Email error:', error);
  }
};

// File upload configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const tempDir = path.join(__dirname, 'uploads', 'temp');
    try {
      await fs.mkdir(tempDir, { recursive: true });
      cb(null, tempDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${timestamp}-${cleanName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf', 'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.doc', '.docx'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      return cb(new Error(`File extension ${fileExt} not allowed`), false);
    }
    
    cb(null, true);
  }
});

const validateContactInput = (data) => {
  const errors = [];
  
  if (!data.name?.trim()) errors.push('Name is required');
  if (!data.email?.trim()) errors.push('Email is required');
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  if (data.name && data.name.length > 100) errors.push('Name too long');
  if (data.email && data.email.length > 255) errors.push('Email too long');
  
  const sanitized = {
    name: data.name?.trim().replace(/[<>]/g, ''),
    email: data.email?.trim().replace(/[<>]/g, ''),
    phone: data.phone?.trim().replace(/[<>]/g, ''),
    service: data.service?.trim().replace(/[<>]/g, ''),
    message: data.message?.trim().replace(/[<>]/g, '')
  };
  
  return { errors, sanitized };
};

const generateCaseId = () => 'C-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();

const moveFilesToCaseFolder = async (tempFiles, caseId) => {
  const caseDir = path.join(__dirname, 'uploads', caseId);
  await fs.mkdir(caseDir, { recursive: true });

  const movedFiles = [];
  for (const tempFile of tempFiles) {
    const oldPath = path.join(__dirname, 'uploads', 'temp', tempFile.filename);
    const newPath = path.join(caseDir, tempFile.filename);
    
    try {
      await fs.rename(oldPath, newPath);
      movedFiles.push({
        ...tempFile,
        url: `/api/uploads/${caseId}/${tempFile.filename}`
      });
    } catch (error) {
      console.error('Error moving file:', error);
    }
  }

  return movedFiles;
};

// File download endpoint
app.get('/api/uploads/:caseId/:filename', async (req, res) => {
  try {
    const { caseId, filename } = req.params;
    
    if (!filename.match(/^\d+-[a-zA-Z0-9._-]+$/)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const filePath = path.join(__dirname, 'uploads', caseId, filename);
    await fs.access(filePath);
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('File download error:', error);
    res.status(404).json({ error: 'File not found' });
  }
});

// AUTHENTICATION MIDDLEWARE
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin login attempts tracking
let loginAttempts = {};
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

// Clean up old login attempts
setInterval(() => {
  const now = Date.now();
  Object.keys(loginAttempts).forEach(ip => {
    if (now - loginAttempts[ip].lastAttempt > LOGIN_LOCKOUT_TIME) {
      delete loginAttempts[ip];
    }
  });
}, 60 * 1000); // Clean every minute

// Admin activity logging
const logAdminActivity = async (action, adminEmail, details = {}) => {
  try {
    const logDir = path.join(__dirname, 'logs');
    await fs.mkdir(logDir, { recursive: true });
    
    const logFile = path.join(logDir, `admin-activity-${new Date().toISOString().split('T')[0]}.log`);
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      adminEmail,
      ...details
    };
    
    await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('Failed to log admin activity:', error);
  }
};

// AUTH API
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Check login attempts
    if (loginAttempts[clientIP] && loginAttempts[clientIP].attempts >= MAX_LOGIN_ATTEMPTS) {
      const timeRemaining = LOGIN_LOCKOUT_TIME - (Date.now() - loginAttempts[clientIP].lastAttempt);
      if (timeRemaining > 0) {
        await logAdminActivity('login_attempt_blocked', email, { 
          reason: 'Too many failed attempts',
          ip: clientIP,
          attempts: loginAttempts[clientIP].attempts
        });
        return res.status(429).json({ 
          error: `Too many login attempts. Please try again in ${Math.ceil(timeRemaining / 60000)} minutes.` 
        });
      } else {
        // Lockout expired, reset
        delete loginAttempts[clientIP];
      }
    }
    
    // Validate credentials
    const isValidEmail = email === ADMIN_EMAIL || email === process.env.ADMIN_EMAIL;
    const isValidPassword = password === ADMIN_PASSWORD;
    
    if (isValidEmail && isValidPassword) {
      // Successful login
      delete loginAttempts[clientIP];
      
      const token = jwt.sign(
        { id: 'admin', email: ADMIN_EMAIL, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      await logAdminActivity('login_success', email, { ip: clientIP });
      
      return res.json({ success: true, token });
    }
    
    // Failed login
    if (!loginAttempts[clientIP]) {
      loginAttempts[clientIP] = { attempts: 0, lastAttempt: Date.now() };
    }
    loginAttempts[clientIP].attempts++;
    loginAttempts[clientIP].lastAttempt = Date.now();
    
    await logAdminActivity('login_failed', email, { 
      ip: clientIP,
      attempts: loginAttempts[clientIP].attempts
    });
    
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ADMIN API ENDPOINTS
app.get('/api/admin/cases', authenticateAdmin, async (req, res) => {
  try {
    const leads = await readLeads();
    
    // Pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Sort support
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc'; // 'asc' or 'desc'
    
    // Filter support
    let filteredCases = [...leads];
    
    // Status filter
    if (req.query.status) {
      filteredCases = filteredCases.filter(c => c.status === req.query.status);
    }
    
    // Date range filter
    if (req.query.startDate) {
      const startDate = new Date(req.query.startDate);
      filteredCases = filteredCases.filter(c => new Date(c.createdAt) >= startDate);
    }
    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999); // Include entire end date
      filteredCases = filteredCases.filter(c => new Date(c.createdAt) <= endDate);
    }
    
    // Search filter
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filteredCases = filteredCases.filter(c => 
        c.id?.toLowerCase().includes(searchTerm) ||
        c.name?.toLowerCase().includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm) ||
        c.service?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sorting
    filteredCases.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle dates
      if (sortBy.includes('date') || sortBy.includes('Date') || sortBy.includes('At')) {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      // Handle strings
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    
    // Pagination
    const totalCases = filteredCases.length;
    const paginatedCases = filteredCases.slice(startIndex, endIndex);
    
    // Ensure updatedAt field exists
    paginatedCases.forEach(caseItem => {
      if (!caseItem.updatedAt) {
        caseItem.updatedAt = caseItem.createdAt;
      }
    });
    
    res.json({ 
      success: true, 
      cases: paginatedCases,
      pagination: {
        page,
        limit,
        total: totalCases,
        totalPages: Math.ceil(totalCases / limit),
        hasNextPage: endIndex < totalCases,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    if (logError) {
      await logError(error, { endpoint: '/api/admin/cases' }).catch(() => {});
    }
    res.status(500).json({ success: false, error: 'Failed to read cases' });
  }
});

app.get('/api/admin/cases/:caseId', authenticateAdmin, async (req, res) => {
  try {
    const leads = await readLeads();
    const caseData = leads.find(c => c.id === req.params.caseId);
    
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json({ success: true, case: caseData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch case' });
  }
});

// Search endpoint
app.get('/api/admin/cases/search', authenticateAdmin, async (req, res) => {
  try {
    const { query, status, startDate, endDate } = req.query;
    const leads = await readLeads();
    
    let results = [...leads];
    
    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(c => 
        c.id?.toLowerCase().includes(searchTerm) ||
        c.name?.toLowerCase().includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm) ||
        c.service?.toLowerCase().includes(searchTerm) ||
        c.message?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Status filter
    if (status) {
      results = results.filter(c => c.status === status);
    }
    
    // Date filters
    if (startDate) {
      const start = new Date(startDate);
      results = results.filter(c => new Date(c.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      results = results.filter(c => new Date(c.createdAt) <= end);
    }
    
    res.json({ success: true, cases: results, count: results.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

// CSV Export endpoint
app.get('/api/admin/cases/export/csv', authenticateAdmin, async (req, res) => {
  try {
    const leads = await readLeads();
    
    // Build CSV header
    const headers = ['Case ID', 'Client Name', 'Email', 'Phone', 'Service', 'Status', 'Created', 'Last Updated'];
    const csvRows = [headers.join(',')];
    
    // Build CSV rows
    leads.forEach(caseItem => {
      const row = [
        caseItem.id || '',
        `"${(caseItem.name || '').replace(/"/g, '""')}"`,
        caseItem.email || '',
        caseItem.phone || '',
        `"${(caseItem.service || '').replace(/"/g, '""')}"`,
        caseItem.status || '',
        new Date(caseItem.createdAt).toLocaleDateString(),
        new Date(caseItem.updatedAt || caseItem.createdAt).toLocaleDateString()
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=cases-export-' + new Date().toISOString().split('T')[0] + '.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Export failed' });
  }
});

// Bulk status update
app.put('/api/admin/cases/bulk-update', authenticateAdmin, async (req, res) => {
  try {
    const { caseIds, status, notes } = req.body;
    
    if (!Array.isArray(caseIds) || caseIds.length === 0) {
      return res.status(400).json({ error: 'caseIds array required' });
    }
    
    const leads = await readLeads();
    const updatedCases = [];
    
    caseIds.forEach(caseId => {
      const caseIndex = leads.findIndex(c => c.id === caseId);
      if (caseIndex !== -1) {
        const caseData = leads[caseIndex];
        
        if (status) {
          caseData.status = status;
          caseData.updates = caseData.updates || [];
          caseData.updates.push({
            date: new Date().toISOString(),
            message: notes || `Status changed to ${status}`,
            status: status
          });
        }
        
        caseData.updatedAt = new Date().toISOString();
        updatedCases.push(caseData);
      }
    });
    
    await writeLeads(leads);
    
    res.json({ success: true, updated: updatedCases.length, cases: updatedCases });
  } catch (error) {
    res.status(500).json({ error: 'Bulk update failed' });
  }
});

app.put('/api/admin/cases/:caseId', authenticateAdmin, async (req, res) => {
  try {
    const { caseId } = req.params;
    const { status, updates, notes } = req.body;
    
    // Log case update activity
    await logAdminActivity('case_updated', req.user.email, {
      caseId,
      status: status || null,
      hasNotes: !!notes,
      hasUpdates: !!updates
    });
    
    const leads = await readLeads();
    const caseIndex = leads.findIndex(c => c.id === caseId);
    
    if (caseIndex === -1) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    const caseData = leads[caseIndex];
    
    if (status && status !== caseData.status) {
      caseData.status = status;
      caseData.updates = caseData.updates || [];
      caseData.updates.push({
        date: new Date().toISOString(),
        message: `Status changed to ${status}`,
        status: status
      });
    }
    
    if (notes) {
      caseData.notes = caseData.notes || [];
      caseData.notes.push({
        date: new Date().toISOString(),
        message: notes
      });
    }
    
    if (updates && Array.isArray(updates)) {
      caseData.updates = [...(caseData.updates || []), ...updates];
    }
    
    // Update updatedAt timestamp
    caseData.updatedAt = new Date().toISOString();
    
    leads[caseIndex] = caseData;
    await writeLeads(leads);
    
    // Send email notification to client
    if (status) {
      const emailHtml = `
        <h2>Case Update: ${caseData.id}</h2>
        <p>Your case status has been updated to: <strong>${status}</strong></p>
        ${notes ? `<p>Notes: ${notes}</p>` : ''}
        <p>Login to your client portal to view more details.</p>
      `;
      await sendEmail(caseData.email, `Case Update: ${caseData.id}`, emailHtml);
    }
    
    res.json({ success: true, case: caseData });
  } catch (error) {
    if (logError) {
      await logError(error, { endpoint: '/api/admin/cases/:caseId', caseId: req.params.caseId }).catch(() => {});
    }
    res.status(500).json({ error: 'Failed to update case' });
  }
});

// ADMIN EMAIL - Send custom email to client
app.post('/api/admin/send-email', authenticateAdmin, async (req, res) => {
  try {
    const { to, cc, subject, message, caseId, priority } = req.body;
    
    console.log('Webmail request received:', { to, cc, subject, message: message?.substring(0, 50), caseId, priority });
    
    if (!to || !subject || !message) {
      return res.status(400).json({ success: false, error: 'Missing required fields: to, subject, message' });
    }
    
    // Determine priority color
    const priorityColors = {
      'urgent': '#dc2626',
      'high': '#ea580c',
      'normal': '#1e40af'
    };
    const priorityColor = priorityColors[priority] || '#1e40af';
    
    // Build email HTML with proper formatting
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">Sleuthservice</h2>
        </div>
        ${priority && priority !== 'normal' ? `
        <div style="background: ${priorityColor}; color: white; padding: 10px 20px; text-align: center; font-weight: 600;">
          ${priority.toUpperCase()} PRIORITY
        </div>
        ` : ''}
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #1e40af; margin-bottom: 20px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          ${caseId ? `
            <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px;">
              <p style="margin: 0; color: #1e40af;">
                <strong>Reference Case:</strong> ${caseId}
              </p>
              <a href="${req.protocol}://${req.get('host')}/client-login.html" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background: #1e40af; color: white; text-decoration: none; border-radius: 5px;">View Case</a>
            </div>
          ` : ''}
        </div>
        <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 12px;">
          <p>This email was sent from Sleuthservice</p>
        </div>
      </div>
    `;
    
    const mailOptions = {
      from: DEFAULT_EMAIL_FROM,
      to: to,
      subject: subject,
      html: emailHtml
    };
    
    if (cc) {
      mailOptions.cc = cc;
    }
    
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to, cc ? `(CC: ${cc})` : '');
    
    // Store email in case history (if caseId provided)
    if (caseId) {
      try {
        const leads = await readLeads();
        const caseIndex = leads.findIndex(c => c.id === caseId);
        if (caseIndex !== -1) {
          const caseData = leads[caseIndex];
          if (!caseData.emailHistory) {
            caseData.emailHistory = [];
          }
          caseData.emailHistory.push({
            date: new Date().toISOString(),
            to,
            cc: cc || null,
            subject,
            sentBy: req.user.email,
            priority: priority || 'normal',
            status: 'sent'
          });
          caseData.updatedAt = new Date().toISOString();
          await writeLeads(leads);
        }
      } catch (error) {
        console.error('Failed to save email history:', error);
      }
    }
    
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    if (logError) {
      await logError(error, { 
        endpoint: '/api/admin/send-email',
        caseId: req.body.caseId,
        to: req.body.to
      }).catch(() => {});
    }
    console.error('Email send error:', error);
    res.status(500).json({ success: false, error: 'Failed to send email: ' + error.message });
  }
});

// CLIENT LOGIN - Generate magic link
// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

app.post('/api/client/request-login', async (req, res) => {
  try {
    const { email } = req.body;
    
    const leads = await readLeads();
    const userCases = leads.filter(l => l.email === email);
    
    if (userCases.length === 0) {
      return res.status(404).json({ error: 'No cases found for this email' });
    }
    
    // Generate 6-digit OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    // Log OTP to console for testing (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n═══════════════════════════════════════');
      console.log(`📧 OTP Generated for: ${email}`);
      console.log(`🔑 OTP Code: ${otp}`);
      console.log(`⏰ Expires at: ${expiresAt.toISOString()}`);
      console.log('═══════════════════════════════════════\n');
    }
    
    // Store OTP with expiration (ensure OTP is stored as string)
    const otpString = String(otp).trim();
    console.log('📝 Storing OTP:', { email, otp: otpString, expiresAt: expiresAt.toISOString() });
    
    const users = await readUsers();
    // Remove any existing OTPs for this email
    const filteredUsers = users.filter(u => !(u.email === email && u.otp));
    filteredUsers.push({ 
      email, 
      otp: otpString, // Store as string to avoid type mismatch
      otpExpiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString() 
    });
    await writeUsers(filteredUsers);
    console.log('✅ OTP stored successfully');
    
    // Send OTP via email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #1e40af; margin-top: 0;">Your Login Code - Sleuthservice</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Use this one-time password (OTP) to access your client portal:
          </p>
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 24px; border-radius: 12px; text-align: center; margin: 30px 0;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Your Code:</div>
            <div style="font-size: 48px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            This code will expire in <strong>10 minutes</strong> for your security.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 16px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            If you didn't request this code, please ignore this email or contact our support team.
          </p>
        </div>
      </div>
    `;
    
    await sendEmail(email, 'Your Sleuthservice Login Code', emailHtml);
    
    // Always return OTP in response for development/testing
    // This makes testing easier - remove in production or add proper environment check
    const response = { 
      success: true, 
      message: 'OTP code sent to your email',
      otp: otp, // Always include OTP for now (for testing)
      debug: 'This OTP will expire in 10 minutes',
      expiresAt: expiresAt.toISOString()
    };
    
    // Only exclude OTP in explicit production mode
    if (process.env.NODE_ENV === 'production') {
      delete response.otp;
      delete response.debug;
      delete response.expiresAt;
    }
    
    console.log('Sending response with OTP:', response.otp ? 'YES' : 'NO');
    res.json(response);
  } catch (error) {
    console.error('Request login error:', error);
    res.status(500).json({ error: 'Failed to send OTP code' });
  }
});

// Development endpoint to get OTP for testing (remove in production!)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/client/get-otp/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const users = await readUsers();
      const user = users.find(u => u.email === email && u.otp);
      
      if (!user) {
        return res.status(404).json({ error: 'No active OTP found for this email' });
      }
      
      // Check if expired
      if (user.otpExpiresAt && new Date(user.otpExpiresAt) < new Date()) {
        return res.status(410).json({ error: 'OTP has expired', expired: true });
      }
      
      res.json({ 
        email: user.email,
        otp: user.otp,
        expiresAt: user.otpExpiresAt,
        expiresIn: Math.floor((new Date(user.otpExpiresAt) - new Date()) / 1000 / 60) + ' minutes'
      });
    } catch (error) {
      console.error('Get OTP error:', error);
      res.status(500).json({ error: 'Failed to get OTP' });
    }
  });
}

// Verify OTP and create session
app.post('/api/client/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }
    
    // Normalize OTP (ensure it's a string, trim whitespace, remove any non-digits)
    const normalizedOtp = String(otp).trim().replace(/[^0-9]/g, '');
    
    if (normalizedOtp.length !== 6) {
      return res.status(400).json({ error: 'OTP must be 6 digits' });
    }
    
    console.log('Verifying OTP:', {
      email,
      receivedOtp: normalizedOtp,
      receivedType: typeof otp
    });
    
    const users = await readUsers();
    const user = users.find(u => {
      const storedOtp = String(u.otp || '').trim();
      const emailMatch = u.email === email;
      const otpMatch = storedOtp === normalizedOtp;
      
      console.log('Checking user:', {
        email: u.email,
        emailMatch,
        storedOtp,
        otpMatch,
        hasOtp: !!u.otp
      });
      
      return emailMatch && otpMatch;
    });
    
    if (!user) {
      // Log all OTPs for this email for debugging
      const userOtps = users.filter(u => u.email === email);
      console.log('User OTPs found for email:', userOtps.map(u => ({
        otp: u.otp,
        expiresAt: u.otpExpiresAt,
        expired: u.otpExpiresAt ? new Date(u.otpExpiresAt) < new Date() : false
      })));
      
      return res.status(401).json({ error: 'Invalid OTP code. Please check the code and try again.' });
    }
    
    // Check if OTP is expired
    if (user.otpExpiresAt && new Date(user.otpExpiresAt) < new Date()) {
      return res.status(401).json({ error: 'OTP code has expired. Please request a new code.' });
    }
    
    // OTP is valid, create session token
    const sessionToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Update user with session token, remove OTP
    const userIndex = users.findIndex(u => {
      const storedOtp = String(u.otp || '').trim();
      return u.email === email && storedOtp === normalizedOtp;
    });
    
    if (userIndex !== -1) {
      users[userIndex] = {
        email,
        token: sessionToken,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
      };
      await writeUsers(users);
      console.log('✅ OTP verified and session created for:', email);
    } else {
      console.error('❌ User not found after verification - this should not happen');
    }
    
    res.json({ success: true, token: sessionToken, message: 'Login successful' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

app.get('/api/client/cases', async (req, res) => {
  try {
    const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }
    
    const users = await readUsers();
    const user = users.find(u => u.token === token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Check if token has expired (24 hours for OTP-based sessions)
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }
    
    const leads = await readLeads();
    const userCases = leads.filter(l => l.email === user.email);
    
    // Ensure updatedAt field exists
    userCases.forEach(caseItem => {
      if (!caseItem.updatedAt) {
        caseItem.updatedAt = caseItem.createdAt;
      }
    });
    
    res.json({ success: true, cases: userCases });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// Client message reply endpoint
app.post('/api/client/reply', async (req, res) => {
  try {
    const { token, caseId, message } = req.body;
    
    if (!token || !caseId || !message) {
      return res.status(400).json({ error: 'Token, caseId, and message required' });
    }
    
    const users = await readUsers();
    const user = users.find(u => u.token === token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Check if session has expired (24 hours for OTP-based sessions)
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }
    
    const leads = await readLeads();
    const caseIndex = leads.findIndex(c => c.id === caseId && c.email === user.email);
    
    if (caseIndex === -1) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    const caseData = leads[caseIndex];
    
    // Add client reply
    if (!caseData.clientReplies) {
      caseData.clientReplies = [];
    }
    
    caseData.clientReplies.push({
      date: new Date().toISOString(),
      message: message.trim().replace(/[<>]/g, ''),
      from: 'client'
    });
    
    caseData.updatedAt = new Date().toISOString();
    
    leads[caseIndex] = caseData;
    await writeLeads(leads);
    
    // Notify admin via email (if configured)
    const emailHtml = `
      <h2>New Client Reply - Case ${caseId}</h2>
      <p><strong>Client:</strong> ${caseData.name} (${caseData.email})</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f8fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
        ${message.replace(/\n/g, '<br>')}
      </div>
      <p><a href="${req.protocol}://${req.get('host')}/admin-dashboard.html">View in Admin Dashboard</a></p>
    `;
    
    await sendEmail(
      process.env.ADMIN_EMAIL || 'admin@sleuthservice.com',
      `New Client Reply: ${caseId}`,
      emailHtml
    );
    
    res.json({ success: true, message: 'Reply sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

// Download all files as ZIP endpoint
app.get('/api/client/cases/:caseId/download-all', async (req, res) => {
  try {
    const { caseId } = req.params;
    const token = req.query.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }
    
    const users = await readUsers();
    const user = users.find(u => u.token === token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Check if session has expired (24 hours for OTP-based sessions)
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }
    
    const leads = await readLeads();
    const caseData = leads.find(c => c.id === caseId && c.email === user.email);
    
    if (!caseData || !caseData.files || caseData.files.length === 0) {
      return res.status(404).json({ error: 'Case not found or no files available' });
    }
    
    // Return list of download URLs instead of creating ZIP server-side
    // Client can download files individually or use a client-side ZIP library
    const downloadLinks = caseData.files.map(file => ({
      filename: file.originalName || file.filename,
      url: `/api/uploads/${caseId}/${file.filename}`,
      size: file.size
    }));
    
    res.json({ success: true, files: downloadLinks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to prepare download' });
  }
});

// PUBLIC API
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

app.post('/api/contact', upload.array('files', 5), async (req, res) => {
  try {
    const { errors, sanitized } = validateContactInput(req.body);
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: errors.join(', ') 
      });
    }

    const caseId = generateCaseId();
    
    let files = [];
    if (req.files && req.files.length > 0) {
      const tempFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }));
      
      files = await moveFilesToCaseFolder(tempFiles, caseId);
    }

    const lead = {
      id: caseId,
      ...sanitized,
      files,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'new',
      updates: [],
      clientReplies: []
    };

    const leads = await readLeads();
    leads.push(lead);
    await writeLeads(leads);

    // Send confirmation email to client
    const emailHtml = `
      <h2>Case Submitted Successfully</h2>
      <p>Your case ${caseId} has been received by Sleuthservice.</p>
      <p>We will review and contact you within 24 hours.</p>
      <p>Login to track your case status: ${req.protocol}://${req.get('host')}/client-login.html</p>
    `;
    await sendEmail(sanitized.email, `Case Created: ${caseId}`, emailHtml);

    res.json({ 
      success: true, 
      caseId,
      message: 'Case submitted successfully' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

app.get('/api/case/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params;
    
    if (!caseId.match(/^C-[A-Z0-9]+$/) && !caseId.match(/^AR-[A-Z0-9]+$/)) {
      return res.status(400).json({ error: 'Invalid case ID format' });
    }
    
    const leads = await readLeads();
    const caseData = leads.find(lead => lead.id === caseId);

    if (!caseData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Case not found' 
      });
    }

    res.json({
      success: true,
      case: {
        id: caseData.id,
        status: caseData.status,
        createdAt: caseData.createdAt,
        service: caseData.service,
        updates: caseData.updates || []
      }
    });

  } catch (error) {
    console.error('Get case error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Asset Reclaim route
const crypto = require('crypto');

const tmpUploadDir = path.join(__dirname, 'uploads', 'tmp');
fs.mkdir(tmpUploadDir, { recursive: true }).catch(console.error);

const assetReclaimUpload = multer({
  dest: tmpUploadDir,
  limits: { files: 5, fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Invalid file type'), false);
    cb(null, true);
  }
});

const generateAssetReclaimCaseId = () => 'AR-' + crypto.randomBytes(6).toString('hex').toUpperCase();

app.post('/api/asset-reclaim', assetReclaimUpload.array('files', 5), async (req, res) => {
  try {
    const { company, contactName, email, phone, propertyAddress, details } = req.body;
    if (!company || !contactName || !email || !details) {
      if (req.files) for (const f of req.files) try { await fs.promises.unlink(f.path); } catch(e){}
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const caseId = generateAssetReclaimCaseId();
    const destDir = path.join(__dirname, 'uploads', 'asset-reclaim', caseId);
    await fs.promises.mkdir(destDir, { recursive: true });

    const savedFiles = [];
    if (req.files && req.files.length) {
      for (const f of req.files) {
        const safeName = f.originalname.replace(/[^\w.-]/g, '_');
        const dest = path.join(destDir, safeName);
        await fs.promises.rename(f.path, dest);
        savedFiles.push({ filename: safeName, mimetype: f.mimetype, size: f.size });
      }
    }

    const casesPath = path.join(dataDir, 'asset-reclaims.json');
    let existing = [];
    try {
      const raw = await fs.promises.readFile(casesPath, 'utf8');
      existing = JSON.parse(raw || '[]');
    } catch (e) { existing = []; }

    const record = {
      caseId,
      company,
      contactName,
      email,
      phone,
      propertyAddress,
      details,
      files: savedFiles,
      createdAt: new Date().toISOString(),
      status: 'new',
      updates: []
    };

    existing.push(record);
    await fs.promises.writeFile(casesPath, JSON.stringify(existing, null, 2));

    res.json({ ok: true, caseId });
  } catch (err) {
    console.error('asset-reclaim error', err);
    if (req.files) {
      for (const f of req.files) {
        try { await fs.promises.unlink(f.path); } catch (e) {}
      }
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Error tracking and logging (with graceful fallback)
let logError, getErrorStats, cleanOldErrorLogs;
let errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files' });
    }
  }
  console.error('Unhandled error:', err);
  if (logError) {
    logError(err, { method: req.method, path: req.path, ip: req.ip }).catch(() => {});
  }
  res.status(err.status || 500).json({ error: 'Something went wrong' });
};

try {
  const errorHandlerModule = require('./error-handler');
  logError = errorHandlerModule.logError;
  getErrorStats = errorHandlerModule.getErrorStats;
  cleanOldErrorLogs = errorHandlerModule.cleanOldErrorLogs;
  
  // Clean old error logs on startup
  cleanOldErrorLogs(30).catch(err => console.warn('Error log cleanup warning:', err));
  console.log('✅ Error tracking system initialized');
} catch (error) {
  console.warn('⚠️  Error handler module not available, using basic error logging');
  logError = async (err, ctx) => console.error('Error:', err.message || err, ctx);
  getErrorStats = async () => ({ total: 0, byType: {}, byDay: {}, recent: [] });
  cleanOldErrorLogs = async () => 0;
}

// Error statistics endpoint (admin only) - Must be before other admin routes to catch it
app.get('/api/admin/errors/stats', authenticateAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const stats = await getErrorStats(days);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error stats endpoint error:', error);
    if (logError) {
      await logError(error, { endpoint: '/api/admin/errors/stats' }).catch(() => {});
    }
    res.status(500).json({ success: false, error: 'Failed to get error stats' });
  }
});

// Global error handler middleware (must be before 404 handler)
app.use(errorHandler);

// 404 handler for HTML pages (after all API routes)
app.use((req, res) => {
  // Only handle non-API routes with HTML response
  if (!req.path.startsWith('/api') && req.accepts('html')) {
    const indexPath = path.join(__dirname, '..', '404.html');
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
      return res.status(404).sendFile(indexPath);
    }
  }
  // JSON response for API routes or JSON requests
  res.status(404).json({ error: 'Not found' });
});

const startServer = async () => {
  await initDirectories();
  
  if (httpsEnabled && httpsServer) {
    // Start HTTPS server
    httpsServer.listen(PORT, () => {
      console.log('🔒 Sleuthservice HTTPS server running on https://localhost:' + PORT);
      console.log('✅ Health check: https://localhost:' + PORT + '/api/health');
      console.log('⚠️  Browser will show security warning (self-signed cert) - click "Advanced" → "Proceed"');
      console.log('🔒 Security features: Enabled');
    });
    
    // Also start HTTP server on port 3001 as fallback (for browsers that reject self-signed certs)
    const httpPort = 3001;
    app.listen(httpPort, () => {
      console.log('🚀 HTTP fallback server running on http://localhost:' + httpPort);
      console.log('💡 Use http://localhost:' + httpPort + ' if HTTPS gives connection issues');
    });
  } else {
    app.listen(PORT, () => {
      console.log('🚀 Sleuthservice HTTP server running on http://localhost:' + PORT);
      console.log('✅ Health check: http://localhost:' + PORT + '/api/health');
      console.log('⚠️  Running without HTTPS (for production, use SSL)');
      console.log('🔒 Security features: Enabled');
    });
  }
};

startServer().catch(console.error);
