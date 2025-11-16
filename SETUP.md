# Capital Reclaim Setup Guide

## Installation

1. Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

## Configuration

1. Set up environment variables:
   - Copy `.env.example` to `.env` in the project root
   - Update the email configuration with your Gmail credentials
   - For Gmail, you need to generate an App Password:
     - Go to Google Account > Security > 2-Step Verification
     - Enable 2-Step Verification if not already enabled
     - Go to App Passwords and generate one
     - Use this password in your `.env` file

2. Update email credentials in `.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Open your browser and navigate to:
- Main site: `http://localhost:3000` (Production: `https://sleuthservice.com`)
- Admin Dashboard: `http://localhost:3000/admin-dashboard.html` (Production: `https://sleuthservice.com/admin-dashboard.html`)
  - Email: `admin@sleuthservice.com`
  - Password: `admin123` (configured in .env)

## Features

### Admin Dashboard
- View all cases
- Edit case details
- Update case status
- Add notes and updates
- Statistics dashboard

### Client Dashboard
- View assigned cases
- Track case status
- Download attached files
- View case updates

### Email Notifications
- Case creation confirmations
- Status update notifications
- Magic login links for clients

## Important Notes

- Change default admin password in production
- Configure proper email service (currently set for Gmail)
- Set a strong JWT_SECRET in production
- The email transporter is configured for Gmail by default

## API Endpoints

### Public
- `POST /api/contact` - Submit new case
- `GET /api/case/:caseId` - Get case status
- `POST /api/client/request-login` - Request client dashboard access
- `GET /api/client/cases?token=X` - Get client cases

### Admin (Requires Authentication)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/cases` - Get all cases
- `GET /api/admin/cases/:caseId` - Get specific case
- `PUT /api/admin/cases/:caseId` - Update case

## Security

- All admin endpoints require JWT authentication
- Client dashboard uses time-limited tokens (15 minutes)
- File uploads are validated and sanitized
- Rate limiting is enabled

