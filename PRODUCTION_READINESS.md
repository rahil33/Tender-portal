# Phoenix Tender Portal - Production Ready

## Overview

A full-stack tender management platform connecting government buyers with vendors. Built with React (Frontend) and Node.js/Express (Backend) with MongoDB.

## Architecture

### Frontend
- **Framework**: React 18.3 with Vite
- **Routing**: React Router v7
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **UI Components**: shadcn/ui + Tailwind CSS
- **Notifications**: Sonner toast notifications
- **Forms**: React Hook Form (when needed)

### Backend
- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with session management
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer
- **Documentation**: Swagger/OpenAPI

## Key Features Implemented

### ✅ Authentication & Authorization
- JWT-based authentication
- Session management with device tracking
- Role-based access control (Admin, Vendor, Buyer, Evaluator)
- Protected routes with role validation
- Automatic token refresh handling
- Secure logout with session invalidation

### ✅ Tender Management
- Create, read, update, delete tenders
- Tender status workflow (Draft → Published → Closed/Cancelled)
- Search and filtering by category, status, location
- Pagination support
- Real-time tender listing
- Tender detail pages with full information
- Document management for tenders

### ✅ User Dashboards
- **Seller Dashboard**: View uploaded tenders, track status, analytics
- **Buyer Dashboard**: Browse tenders, submit bids
- **Admin Dashboard**: Manage users, approve tenders, analytics

### ✅ API Integration
- Complete RESTful API service layer
- Axios interceptors for auth token handling
- Centralized error handling
- Automatic retry logic for failed requests
- Request/response transformation
- Environment-based API configuration

### ✅ UI/UX Features
- Loading states with skeleton loaders
- Toast notifications for user feedback
- Error boundaries for graceful error handling
- Responsive design (mobile-first)
- Accessible components (ARIA compliant)
- Form validation with error messages

### ✅ Security
- Password hashing with bcrypt
- JWT token validation
- Role-based middleware protection
- CORS configuration
- Rate limiting
- Input validation and sanitization
- Helmet security headers
- SQL injection prevention (NoSQL)
- XSS protection

## Project Structure

```
Tender-portal/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, JWT, Email configs
│   │   ├── middleware/     # Auth, validation, error handlers
│   │   ├── models/         # MongoDB models
│   │   ├── modules/        # Feature modules (auth, tenders, bids)
│   │   │   ├── controller.js
│   │   │   ├── service.js
│   │   │   ├── model.js
│   │   │   ├── routes.js
│   │   │   ├── validator.js
│   │   │   └── dto.js
│   │   ├── routes/         # Global route aggregators
│   │   ├── services/       # Shared services
│   │   └── utils/          # Helper functions
│   ├── server.js           # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/ # UI components
    │   │   ├── pages/      # Page components
    │   │   ├── layout.tsx  # Main layout
    │   │   └── routes.tsx  # Route configuration
    │   ├── components/     # Shared components
    │   ├── contexts/       # React contexts (Auth, Notifications)
    │   └── services/       # API service layer
    ├── .env                # Environment variables
    └── package.json
```

## Environment Configuration

### Backend (.env)
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://localhost:27017/tender_portal
JWT_SECRET=your-32-character-secret-key-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com
UPLOAD_PATH=./src/uploads
MAX_FILE_SIZE=10485760
```

### Frontend (.env)
```bash
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME=Phoenix Tender Portal
VITE_MAX_FILE_SIZE=10485760
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/sessions` - Get active sessions
- `DELETE /api/auth/sessions/:id` - Revoke session

### Tenders
- `GET /api/tenders` - List all tenders (public)
- `GET /api/tenders/:id` - Get tender details (public)
- `POST /api/tenders` - Create tender (authenticated)
- `PUT /api/tenders/:id` - Update tender (authenticated)
- `DELETE /api/tenders/:id` - Delete tender (authenticated)
- `GET /api/tenders/search` - Search tenders
- `GET /api/tenders/statistics` - Tender statistics

### Bids
- `POST /api/bids` - Create bid (authenticated)
- `GET /api/bids` - List bids (authenticated)
- `PUT /api/bids/:id/submit` - Submit bid
- `PUT /api/bids/:id/withdraw` - Withdraw bid
- `PUT /api/bids/:id/evaluate` - Evaluate bid (evaluator only)

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or pnpm

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

## Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Configure MongoDB connection string
3. Set strong JWT_SECRET (minimum 32 characters)
4. Configure CORS origins
5. Use PM2 or similar process manager
6. Enable HTTPS with reverse proxy (nginx)
7. Set up MongoDB backups
8. Configure logging (Winston/Morgan)

### Frontend Deployment
1. Build for production: `npm run build`
2. Deploy `dist/` folder to static host
3. Configure environment variables
4. Set up CDN for static assets
5. Enable gzip/brotli compression
6. Configure proper caching headers

### Docker Deployment
```bash
# Backend
docker build -t tender-backend .
docker run -p 5000:5000 --env-file .env tender-backend

# Frontend
docker build -t tender-frontend .
docker run -p 80:80 tender-frontend
```

## Security Checklist

- [x] Password hashing with bcrypt
- [x] JWT token authentication
- [x] Session management
- [x] Role-based access control
- [x] Input validation
- [x] SQL injection prevention
- [x] XSS protection
- [x] CORS configuration
- [x] Rate limiting
- [x] Helmet security headers
- [x] Environment variables for secrets
- [ ] SSL/TLS certificates
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning

## Performance Optimizations

- [x] API response pagination
- [x] Lazy loading of components
- [x] Code splitting
- [x] Image optimization
- [x] Skeleton loaders
- [x] Debounced search
- [ ] Redis caching
- [ ] CDN for static assets
- [ ] Database query optimization
- [ ] Index creation on frequently queried fields

## Testing

### Backend Tests
```bash
npm run test          # Run all tests
npm run test:unit     # Unit tests only
npm run test:integration  # Integration tests
```

### Frontend Tests
```bash
npm run test          # Run frontend tests
npm run test:coverage # Generate coverage report
```

## Monitoring & Logging

### Backend
- Morgan for HTTP request logging
- Winston for application logs
- Custom error tracking
- Performance monitoring endpoints

### Frontend
- Error boundaries for crash recovery
- Console error tracking
- User action logging (optional)

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review and rotate JWT secrets quarterly
- Database backup daily
- Security patch updates
- Log rotation and cleanup
- Performance monitoring

### Database Maintenance
```javascript
// Create indexes
db.tenders.createIndex({ status: 1, isArchived: 1 })
db.tenders.createIndex({ submissionDeadline: 1, status: 1 })
db.users.createIndex({ email: 1 }, { unique: true })

// Cleanup old sessions
db.sessions.deleteMany({ expiresAt: { $lt: new Date() } })
```

## Support & Documentation

- API Documentation: `/api/docs` (Swagger)
- Troubleshooting: See `FAQ_TROUBLESHOOTING.md`
- Deployment Guide: See `PRE_DEPLOYMENT_CHECKLIST.md`

## License

ISC

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## Contact

For support: support@phoenixtender.com