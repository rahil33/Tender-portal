# Phoenix Tender Portal - Backend API

[![CI/CD](https://github.com/phoenix-tender/backend/actions/workflows/ci.yml/badge.svg)](https://github.com/phoenix-tender/backend/actions)
[![Docker](https://img.shields.io/docker/v/phoenix-tender-backend)](https://hub.docker.com/r/phoenix-tender/backend)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

A comprehensive tender management system built with Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication & Authorization** - JWT-based with session management
- 👥 **User Management** - Complete user lifecycle
- 🏢 **Organization Management** - Multi-organization support
- 📋 **Tender Management** - Full tender lifecycle
- 💰 **Bid Management** - Bid submission and evaluation
- 📁 **Document Management** - File upload, versioning, verification
- 📊 **Analytics & Reports** - Advanced analytics and reporting
- 🔔 **Notifications** - In-app, email, and broadcast notifications
- ⚙️ **Settings** - User, organization, and system settings
- 👨‍💼 **Admin Dashboard** - Complete admin controls
- 📞 **Contact & Support** - Enquiry management
- ⭐ **Reviews & Ratings** - Organization reviews
- ❓ **FAQ** - Frequently asked questions
- 🏥 **Health Checks** - System monitoring
- 📚 **API Documentation** - Swagger/OpenAPI

## Quick Start

### Prerequisites
- Node.js v20+
- MongoDB v7+
- npm or yarn

### Development Setup

```bash
# Clone repository
git clone https://github.com/phoenix-tender/backend.git
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start MongoDB
# (Update MONGO_URI in .env with your MongoDB connection)

# Seed database (optional)
npm run seed

# Run in development mode
npm run dev
```

Server will start on `http://localhost:5000`

### Docker Setup

```bash
# Start all services
docker-compose up

# Start with seed data
docker-compose --profile seed up

# View logs
docker-compose logs -f api
```

## API Documentation

Once running, access the Swagger documentation at:
- **Swagger UI**: http://localhost:5000/api/docs
- **OpenAPI JSON**: http://localhost:5000/api/docs/json

## Default Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@phoenixtender.com | Admin@123 |
| Vendor | vendor@example.com | Vendor@123 |
| Evaluator | evaluator@example.com | Evaluator@123 |

**⚠️ Change these immediately in production!**

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/sessions` - Get active sessions
- `DELETE /api/auth/sessions/:id` - Revoke session

### Tenders
- `POST /api/tenders` - Create tender
- `GET /api/tenders` - List tenders
- `GET /api/tenders/:id` - Get tender details
- `PUT /api/tenders/:id` - Update tender
- `DELETE /api/tenders/:id` - Delete tender
- `POST /api/tenders/:id/publish` - Publish tender
- `POST /api/tenders/:id/close` - Close tender

### Bids
- `POST /api/bids` - Submit bid
- `GET /api/bids` - List bids
- `GET /api/bids/:id` - Get bid details
- `PUT /api/bids/:id` - Update bid
- `POST /api/bids/:id/evaluate` - Evaluate bid

### Organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations` - List organizations
- `GET /api/organizations/:id` - Get organization
- `PUT /api/organizations/:id` - Update organization
- `POST /api/organizations/:id/members` - Add member

[See PROJECT_COMPLETION.md for complete API documentation]

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Integration tests
npm run test:integration

# Unit tests
npm run test:unit

# With coverage
npm test -- --coverage
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose models
│   ├── modules/         # Feature modules
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── validators/      # Validators
│   ├── uploads/         # File uploads
│   └── tests/           # Test files
├── .github/             # GitHub Actions
├── docker-compose.yml   # Docker orchestration
├── Dockerfile           # Docker build
├── server.js            # Application entry
├── seed.js              # Database seeding
└── package.json         # Dependencies
```

## Environment Variables

See `.env.example` for all available options:

```bash
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/tender_portal
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

## Security

- Helmet security headers
- CORS configuration
- Rate limiting
- JWT authentication
- Password hashing (bcrypt)
- Input validation
- XSS protection
- Audit logging
- Non-root Docker containers

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

ISC

## Support

For issues and questions:
- Create an issue on GitHub
- Email: support@phoenixtender.com

## Acknowledgments

Built with:
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [Swagger](https://swagger.io/)