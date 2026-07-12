# Phoenix Tender Portal - Deployment Checklist

**Version:** 1.0.0  
**Date:** July 13, 2026  
**Status:** Production Ready

---

## Pre-Deployment Requirements

### 1. Environment Configuration

#### 1.1 Backend Environment Variables

**File:** `.env` (production)

```bash
# Required - Must be set before deployment
NODE_ENV=production
PORT=5000

# Database - MongoDB connection string
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/tender_portal?retryWrites=true&w=majority

# Security - CRITICAL: Must be 64+ characters
JWT_SECRET=<GENERATE_STRONG_SECRET_64_CHARS_MINIMUM>
JWT_EXPIRES_IN=1h

# CORS - Production frontend URL
CORS_ORIGIN=https://your-production-domain.com
FRONTEND_URL=https://your-production-domain.com

# File Upload
UPLOAD_PATH=/app/backend/src/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,png,jpg,jpeg

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (SMTP)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=<your-app-password>
SMTP_FROM_NAME="Phoenix Tender Portal"
SMTP_FROM_EMAIL=noreply@your-domain.com

# Logging
LOG_LEVEL=info

# Optional - Monitoring
SENTRY_DSN=https://<key>@sentry.io/<project-id>
```

**Security Checklist:**
- [ ] JWT_SECRET is 64+ characters (use: `openssl rand -hex 32`)
- [ ] MongoDB password is strong (16+ chars, mixed case, numbers, symbols)
- [ ] SMTP credentials are app-specific passwords (not main account password)
- [ ] No default/development values in production .env

#### 1.2 Frontend Environment Variables

**File:** `.env` (production)

```bash
VITE_API_URL=https://api.your-production-domain.com/api
VITE_APP_NAME=Phoenix Tender Portal
VITE_MAX_FILE_SIZE=10485760
```

---

### 2. Database Setup

#### 2.1 MongoDB Configuration

**Recommended:** MongoDB Atlas (Managed Service)

**Setup Steps:**
- [ ] Create MongoDB Atlas cluster (M10 or higher for production)
- [ ] Enable backup (daily automated backups)
- [ ] Configure IP whitelist (allow application server IPs)
- [ ] Create database user with readWrite permissions
- [ ] Enable encryption at rest
- [ ] Set up monitoring alerts

**Connection String Format:**
```
mongodb+srv://<username>:<password>@cluster.mongodb.net/tender_portal?retryWrites=true&w=majority&readPreference=secondaryPreferred
```

**Indexes to Verify:**
```javascript
// Run in MongoDB shell or Compass
db.users.getIndexes();
db.tenders.getIndexes();
db.bids.getIndexes();
db.organizations.getIndexes();
db.sessions.getIndexes();

// Expected count:
// Users: 3 indexes
// Tenders: 8 indexes
// Bids: 7 indexes
// Organizations: 7 indexes
// Sessions: 1 TTL index
```

**Data Migration:**
- [ ] Export development data (if needed): `mongodump`
- [ ] Import to production: `mongorestore`
- [ ] Verify data integrity
- [ ] Run sanity checks on counts

---

### 3. SSL/TLS Certificates

#### 3.1 Certificate Options

**Option A: Let's Encrypt (Free)**
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
# Test renewal: sudo certbot renew --dry-run
```

**Option B: Cloud Provider SSL**
- [ ] AWS: AWS Certificate Manager (ACM)
- [ ] Azure: App Service Certificates
- [ ] GCP: Google-managed SSL certificates

**Option C: Purchase Commercial Certificate**
- [ ] DigiCert, Comodo, GlobalSign, etc.
- [ ] Install on load balancer or web server

#### 3.2 HTTPS Configuration

**Nginx Example:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location / {
        root /var/www/phoenix-tender-portal;
        try_files $uri $uri/ /index.html;
    }
}
```

---

### 4. Server Setup

#### 4.1 System Requirements

**Minimum Production Server:**
- CPU: 2 cores
- RAM: 4 GB
- Storage: 40 GB SSD
- OS: Ubuntu 20.04 LTS or higher

**Recommended Production Server:**
- CPU: 4 cores
- RAM: 8 GB
- Storage: 80 GB SSD
- OS: Ubuntu 22.04 LTS

#### 4.2 Dependencies Installation

```bash
# Node.js (v18+ LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v18.x.x
npm --version   # Should be 9.x.x or higher

# PM2 (Process Manager)
sudo npm install -g pm2

# Nginx (Reverse Proxy)
sudo apt-get install -y nginx

# MongoDB (if self-hosting)
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### 4.3 Application Deployment

```bash
# Clone repository
git clone https://github.com/your-org/phoenix-tender-portal.git
cd phoenix-tender-portal

# Install backend dependencies
cd backend
npm install --production

# Install frontend dependencies
cd ../frontend
npm install
npm run build

# Set up environment files
cd ../backend
cp .env.example .env
# Edit .env with production values

# Start application with PM2
cd backend
pm2 start server.js --name phoenix-backend
pm2 save
pm2 startup
```

---

### 5. Monitoring & Alerting

#### 5.1 Application Monitoring

**Option A: PM2 Monitoring**
```bash
# View application status
pm2 status

# View logs
pm2 logs phoenix-backend

# Monitor resources
pm2 monit

# Restart application
pm2 restart phoenix-backend

# Setup email alerts
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Option B: Application Performance Monitoring (APM)**

**New Relic:**
```bash
npm install newrelic
```

**New Relic Configuration (`newrelic.js`):**
```javascript
exports.config = {
  app_name: ['Phoenix Tender Portal'],
  license_key: 'your-license-key',
  logging: {
    level: 'info',
  },
};
```

**Sentry (Error Tracking):**
```bash
npm install @sentry/node
```

#### 5.2 Database Monitoring

**MongoDB Atlas:**
- [ ] Enable Real-Time Performance Panel
- [ ] Set up alerts for:
  - Connection count > 80% of limit
  - Memory usage > 80%
  - Disk usage > 80%
  - Slow queries (>100ms)
  - Failed authentication attempts

**Self-Hosted MongoDB:**
```bash
# Enable MongoDB profiler
use admin
db.setProfilingLevel({ slowOpThreshold: 100 })

# View slow queries
db.system.profile.find().sort({$natural:-1}).limit(10)
```

#### 5.3 Log Aggregation

**Option A: ELK Stack**
- Elasticsearch, Logstash, Kibana
- Centralized log management
- Search and visualization

**Option B: Hosted Solutions**
- Datadog
- Splunk
- LogDNA
- Papertrail

---

### 6. Backup Strategy

#### 6.1 Database Backups

**MongoDB Atlas (Automated):**
- [ ] Enable continuous backup
- [ ] Configure point-in-time recovery
- [ ] Set retention policy (30 days minimum)
- [ ] Test restore procedure

**Self-Hosted MongoDB:**
```bash
#!/bin/bash
# backup-mongodb.sh
BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

mongodump --uri="mongodb://localhost:27017/tender_portal" --out=$BACKUP_DIR/$DATE

# Keep last 7 daily backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

**Cron Job (Daily at 2 AM):**
```bash
0 2 * * * /path/to/backup-mongodb.sh
```

#### 6.2 File Upload Backups

```bash
#!/bin/bash
# backup-uploads.sh
BACKUP_DIR="/backups/uploads"
UPLOAD_DIR="/app/backend/src/uploads"
DATE=$(date +%Y%m%d_%H%M%S)

tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz $UPLOAD_DIR

# Keep last 14 daily backups
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +14 -delete
```

#### 6.3 Backup Verification

**Weekly Tasks:**
- [ ] Verify backup files exist
- [ ] Test restore from backup (monthly)
- [ ] Check backup size trends
- [ ] Review backup logs for errors

---

### 7. Security Hardening

#### 7.1 Server Security

```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Configure firewall (UFW)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Disable root SSH login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# Restart SSH service
sudo systemctl restart sshd

# Install fail2ban
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
```

#### 7.2 Application Security

- [ ] Verify CORS origins are production URLs only
- [ ] Ensure rate limiting is enabled
- [ ] Test password strength requirements
- [ ] Verify HTTPS enforcement
- [ ] Check security headers (use: https://securityheaders.com)

#### 7.3 Dependency Scanning

```bash
# Check for vulnerabilities
npm audit

# Auto-fix where possible
npm audit fix

# For critical issues
npm audit fix --force

# Install audit tool
npm install -g npm-audit-html
npm audit --audit-level=moderate | npm-audit-html > audit-report.html
```

---

### 8. Performance Testing

#### 8.1 Load Testing

**Tools:**
- Apache JMeter
- k6 (Grafana)
- Artillery.io

**Test Scenarios:**
```javascript
// k6 example
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5m', target: 100 },  // Ramp to 100 users
    { duration: '10m', target: 100 }, // Stay at 100 users
    { duration: '5m', target: 0 },    // Ramp down
  ],
};

export default function() {
  const res = http.get('https://api.your-domain.com/api/tenders');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

**Performance Targets:**
- [ ] Average response time < 200ms
- [ ] 95th percentile < 500ms
- [ ] 99th percentile < 1000ms
- [ ] Error rate < 0.1%
- [ ] Throughput: 100+ requests/second

#### 8.2 Browser Performance

**Lighthouse Targets:**
- [ ] Performance: 90+
- [ ] Accessibility: 90+
- [ ] Best Practices: 90+
- [ ] SEO: 90+
- [ ] PWA: N/A (not a PWA)

---

### 9. Final Verification

#### 9.1 Health Check Verification

```bash
# Test all health endpoints
curl https://api.your-domain.com/health
curl https://api.your-domain.com/health/ready
curl https://api.your-domain.com/health/live
curl https://api.your-domain.com/health/db
curl https://api.your-domain.com/health/storage

# Expected: All return status "healthy" or "ready"
```

#### 9.2 API Smoke Tests

```bash
# Root endpoint
curl https://api.your-domain.com/

# Public endpoints
curl https://api.your-domain.com/api/tenders
curl https://api.your-domain.com/api/categories
curl https://api.your-domain.com/api/services

# Authentication (test with valid credentials)
curl -X POST https://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

#### 9.3 Frontend Verification

- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Login/Register forms function
- [ ] Protected routes redirect properly
- [ ] Tender listing displays
- [ ] Tender detail page loads
- [ ] File uploads work
- [ ] Forms submit successfully
- [ ] Error states display correctly
- [ ] Mobile responsive design works

---

### 10. Go-Live Checklist

#### Day Before Launch

- [ ] Complete all pre-deployment requirements
- [ ] Run full regression test suite
- [ ] Verify monitoring is active
- [ ] Verify backups are running
- [ ] Notify stakeholders of maintenance window
- [ ] Prepare rollback plan

#### Launch Day

- [ ] Deploy backend to production
- [ ] Verify backend health checks
- [ ] Deploy frontend to production
- [ ] Verify frontend functionality
- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Verify database connections
- [ ] Test critical user flows
- [ ] Announce launch to stakeholders

#### Post-Launch (First 24 Hours)

- [ ] Monitor error logs hourly
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Verify all integrations
- [ ] Document any issues
- [ ] Prepare hotfix if needed

---

### 11. Rollback Plan

#### Rollback Triggers

- Critical bug affecting core functionality
- Security vulnerability discovered
- Performance degradation > 50%
- Data corruption detected
- Error rate > 5%

#### Rollback Procedure

```bash
# PM2 rollback
pm2 restart phoenix-backend --env production

# Git rollback
cd /path/to/phoenix-tender-portal
git fetch
git checkout <previous-stable-tag>
npm install --production
pm2 restart phoenix-backend

# Database rollback (if needed)
# Restore from backup
mongorestore --uri="mongodb://..." /path/to/backup
```

---

### 12. Post-Deployment Monitoring

#### First Week

**Daily Checks:**
- [ ] Error rate < 1%
- [ ] Response time < 500ms (avg)
- [ ] Database connection stable
- [ ] Disk usage < 70%
- [ ] Memory usage < 80%
- [ ] Backup completed successfully

**Weekly Report:**
- [ ] Total users
- [ ] Total tenders
- [ ] Total bids
- [ ] Average response time
- [ ] Error count
- [ ] Uptime percentage

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | | | |
| Tech Lead | | | |
| DevOps Engineer | | | |
| QA Lead | | | |
| Security Officer | | | |

---

**Document Version:** 1.0  
**Last Updated:** July 13, 2026  
**Next Review:** After first production deployment