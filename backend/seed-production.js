/**
 * MongoDB Atlas Enterprise Production Seed Data Generator
 * Realistic Indian data for tender portal
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

// Indian data sets
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

const INDIAN_CITIES = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane', 'Solapur'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'],
  'Delhi': ['New Delhi', 'Delhi', 'Noida', 'Gurgaon', 'Faridabad'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Noida'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
};

const INDIAN_COMPANY_PREFIXES = [
  'Shri', 'Sri', 'Jai', 'Maharaja', 'Royal', 'Prime', 'Elite', 'Global',
  'National', 'Indian', 'Bharat', 'Hindustan', 'Apollo', 'Zenith', 'Sterling',
  'Crystal', 'Diamond', 'Golden', 'Silver', 'Platinum', 'Supreme', 'Excel',
  'Precision', 'Quality', 'Reliable', 'Trusted', 'Modern', 'Classic', 'Grand'
];

const INDIAN_COMPANY_SUFFIXES = [
  'Industries', 'Enterprises', 'Corporation', 'Private Limited', 'Ltd',
  'Pvt Ltd', 'Solutions', 'Services', 'Technologies', 'Systems',
  'Constructions', 'Builders', 'Contractors', 'Engineers', 'Consultants',
  'Manufacturers', 'Suppliers', 'Exports', 'Imports', 'Trading Co',
  'Associates', 'Group', 'Holdings', 'Ventures', 'Partners'
];

const INDIAN_NAMES = [
  'Rajesh Kumar', 'Suresh Patel', 'Amit Shah', 'Vikram Singh', 'Rahul Sharma',
  'Priya Reddy', 'Anita Desai', 'Kavita Joshi', 'Meera Iyer', 'Sunita Rao',
  'Arjun Menon', 'Karthik Nair', 'Ravi Varma', 'Deepak Gupta', 'Sanjay Agarwal',
  'Neha Kapoor', 'Pooja Malhotra', 'Ritu Bansal', 'Sneha Kulkarni', 'Divya Pai',
  'Mohammed Rafi', 'Imran Khan', 'Salim Sheikh', 'Anwar Ali', 'Bilal Ahmed',
  'John Matthew', 'Thomas George', 'Joseph Thomas', 'Mary John', 'Susan Thomas'
];

const TENDER_CATEGORIES = [
  'Construction', 'IT Services', 'Healthcare', 'Education', 'Transportation',
  'Energy', 'Water Supply', 'Telecommunications', 'Defense', 'Agriculture',
  'Manufacturing', 'Consulting', 'Security Services', 'Cleaning Services',
  'Catering', 'Hospitality', 'Media', 'Research', 'Legal Services', 'Financial Services'
];

const TENDER_STATUSES = ['draft', 'published', 'active', 'closed', 'cancelled', 'awarded'];
const BID_STATUSES = ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'];
const ORGANIZATION_TYPES = ['vendor', 'buyer', 'contractor', 'consultant', 'service_provider'];

// Generate Indian GST number
function generateGST() {
  const stateCodes = [
    '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36'
  ];
  const stateCode = stateCodes[Math.floor(Math.random() * stateCodes.length)];
  const pan = generatePAN();
  const entityNumber = Math.floor(Math.random() * 9000) + 1000;
  const checkDigit = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${stateCode}${pan}${entityNumber}Z${checkDigit}`;
}

// Generate Indian PAN number
function generatePAN() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let pan = '';
  for (let i = 0; i < 5; i++) pan += letters.charAt(Math.floor(Math.random() * 26));
  const year = Math.floor(Math.random() * 90) + 10;
  for (let i = 0; i < 4; i++) pan += Math.floor(Math.random() * 10);
  pan += letters.charAt(Math.floor(Math.random() * 26));
  return pan;
}

// Generate Indian phone number
function generateIndianPhone() {
  const codes = ['+91', '91'];
  const operators = ['7', '8', '9'];
  const code = codes[Math.floor(Math.random() * codes.length)];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  let number = operator;
  for (let i = 0; i < 9; i++) {
    number += Math.floor(Math.random() * 10);
  }
  return `${code}${number}`;
}

// Generate Indian PIN code
function generatePINCode() {
  return (Math.floor(Math.random() * 900000) + 100000).toString();
}

// Generate company name
function generateCompanyName() {
  const prefix = INDIAN_COMPANY_PREFIXES[Math.floor(Math.random() * INDIAN_COMPANY_PREFIXES.length)];
  const suffix = INDIAN_COMPANY_SUFFIXES[Math.floor(Math.random() * INDIAN_COMPANY_SUFFIXES.length)];
  const middle = faker.company.name().split(' ')[0];
  return `${prefix} ${middle} ${suffix}`;
}

// Generate Indian address
function generateIndianAddress() {
  const state = INDIAN_STATES[Math.floor(Math.random() * INDIAN_STATES.length)];
  const cities = INDIAN_CITIES[state] || ['City'];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const street = faker.location.streetAddress();
  const pincode = generatePINCode();
  
  return {
    street,
    city,
    state,
    pincode,
    country: 'India',
    full: `${street}, ${city}, ${state} - ${pincode}, India`
  };
}

class ProductionSeedService {
  constructor() {
    this.users = [];
    this.organizations = [];
    this.tenders = [];
    this.bids = [];
    this.documents = [];
    this.notifications = [];
    this.auditLogs = [];
    this.applicationLogs = [];
    this.analytics = [];
  }

  async connect() {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✓ Connected to MongoDB Atlas');
  }

  async disconnect() {
    await mongoose.connection.close();
    console.log('✓ Disconnected from MongoDB Atlas');
  }

  async clearExistingData() {
    console.log('\n🗑️  Clearing existing data...');
    const collections = [
      'users', 'organizations', 'tenders', 'bids', 'documents',
      'notifications', 'audit_logs', 'application_logs', 'analytics',
      'categories', 'sessions', 'auditlogs'
    ];

    for (const collection of collections) {
      try {
        await mongoose.connection.db.collection(collection).deleteMany({});
        console.log(`   ✓ Cleared ${collection}`);
      } catch (error) {
        console.log(`   ⚠️  Could not clear ${collection}: ${error.message}`);
      }
    }
  }

  async generateUsers(count = 200) {
    console.log(`\n👥 Generating ${count} users...`);
    const users = [];
    const roles = ['admin', 'vendor', 'evaluator', 'buyer'];

    for (let i = 0; i < count; i++) {
      const name = INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)];
      const firstName = name.split(' ')[0].toLowerCase();
      const email = `${firstName}${i}@example.com`;
      const role = i < 10 ? 'admin' : roles[Math.floor(Math.random() * (roles.length - 1)) + 1];

      users.push({
        fullName: name,
        email: email,
        password: await bcrypt.hash('User@12345', 10),
        role: role,
        companyName: generateCompanyName(),
        phone: generateIndianPhone(),
        isActive: Math.random() > 0.1,
        createdAt: faker.date.past({ years: 2 }),
        updatedAt: new Date(),
      });
    }

    await mongoose.connection.db.collection('users').insertMany(users);
    this.users = users;
    console.log(`   ✓ Created ${users.length} users`);
  }

  async generateOrganizations(count = 50) {
    console.log(`\n🏢 Generating ${count} organizations...`);
    const organizations = [];

    for (let i = 0; i < count; i++) {
      const owner = this.users[Math.floor(Math.random() * this.users.length)];
      const address = generateIndianAddress();

      organizations.push({
        name: generateCompanyName(),
        type: ORGANIZATION_TYPES[Math.floor(Math.random() * ORGANIZATION_TYPES.length)],
        email: `contact${i}@company.com`,
        phone: generateIndianPhone(),
        gstNumber: generateGST(),
        panNumber: generatePAN(),
        registrationNumber: `REG${Math.floor(Math.random() * 100000)}`,
        address: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.pincode,
          country: 'India',
        },
        website: `https://company${i}.com`,
        description: faker.company.catchPhrase(),
        verificationStatus: ['pending', 'verified', 'rejected'][Math.floor(Math.random() * 3)],
        isVerified: Math.random() > 0.3,
        isActive: Math.random() > 0.1,
        ownerId: owner._id || this.users[0]._id,
        profileCompleteness: Math.floor(Math.random() * 100),
        createdAt: faker.date.past({ years: 3 }),
        updatedAt: new Date(),
      });
    }

    await mongoose.connection.db.collection('organizations').insertMany(organizations);
    this.organizations = organizations;
    console.log(`   ✓ Created ${organizations.length} organizations`);
  }

  async generateTenders(count = 500) {
    console.log(`\n📋 Generating ${count} tenders...`);
    const tenders = [];
    const usedTenderNumbers = new Set();

    for (let i = 0; i < count; i++) {
      const org = this.organizations[Math.floor(Math.random() * this.organizations.length)];
      const user = this.users[Math.floor(Math.random() * this.users.length)];
      const category = TENDER_CATEGORIES[Math.floor(Math.random() * TENDER_CATEGORIES.length)];
      const status = TENDER_STATUSES[Math.floor(Math.random() * TENDER_STATUSES.length)];
      const deadline = faker.date.future({ years: 1 });

      // Generate unique tender number
      let tenderNumber;
      do {
        tenderNumber = `TND${new Date().getFullYear()}-${Math.floor(Math.random() * 100000)}`;
      } while (usedTenderNumbers.has(tenderNumber));
      usedTenderNumbers.add(tenderNumber);

      tenders.push({
        title: `${category} Tender for ${faker.company.name()}`,
        tenderNumber: tenderNumber,
        slug: `tender-${category.toLowerCase()}-${i}-${Date.now()}`,
        description: faker.lorem.paragraphs(3),
        category: category.toLowerCase().replace(' ', '_'),
        status: status,
        visibility: ['public', 'private'][Math.floor(Math.random() * 2)],
        budget: {
          estimated: Math.floor(Math.random() * 10000000) + 100000,
          currency: 'INR',
          budgetType: 'fixed',
        },
        submissionDeadline: deadline,
        openingDate: new Date(deadline.getTime() + 7 * 24 * 60 * 60 * 1000),
        issuingOrganization: org._id,
        createdBy: user._id,
        publishedAt: status !== 'draft' ? faker.date.past({ years: 1 }) : null,
        closedAt: status === 'closed' ? new Date() : null,
        isArchived: status === 'closed' || status === 'cancelled',
        location: `${generateIndianAddress().city}, ${generateIndianAddress().state}`,
        contactPerson: {
          name: INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)],
          email: `contact${i}@tender.com`,
          phone: generateIndianPhone(),
        },
        tags: [category.toLowerCase(), 'government', 'procurement'],
        createdAt: faker.date.past({ years: 2 }),
        updatedAt: new Date(),
      });
    }

    await mongoose.connection.db.collection('tenders').insertMany(tenders);
    this.tenders = tenders;
    console.log(`   ✓ Created ${tenders.length} tenders`);
  }

  async generateBids(count = 1500) {
    console.log(`\n💼 Generating ${count} bids...`);
    const bids = [];
    const usedBidNumbers = new Set();

    for (let i = 0; i < count; i++) {
      const tender = this.tenders[Math.floor(Math.random() * this.tenders.length)];
      const vendors = this.users.filter(u => u.role === 'vendor');
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];
      const org = this.organizations[Math.floor(Math.random() * this.organizations.length)];
      const status = BID_STATUSES[Math.floor(Math.random() * BID_STATUSES.length)];

      // Generate unique bid number
      let bidNumber;
      do {
        bidNumber = `BID${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`;
      } while (usedBidNumbers.has(bidNumber));
      usedBidNumbers.add(bidNumber);

      bids.push({
        bidNumber: bidNumber,
        tenderId: tender._id,
        vendorId: vendor ? vendor._id : this.users[0]._id,
        organizationId: org._id,
        status: status,
        bidType: 'combined',
        bidAmount: Math.floor(Math.random() * 5000000) + 50000,
        currency: 'INR',
        technicalProposal: faker.lorem.paragraphs(2),
        financialProposal: faker.lorem.paragraph(1),
        evaluationStatus: ['pending', 'under_review', 'approved', 'rejected'][Math.floor(Math.random() * 4)],
        submittedAt: faker.date.past({ years: 1 }),
        isWithdrawn: status === 'withdrawn',
        isDeleted: false,
        auditLog: [{
          action: 'submitted',
          performedBy: vendor ? vendor._id : this.users[0]._id,
          timestamp: new Date(),
          details: 'Bid submitted',
        }],
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: new Date(),
      });
    }

    await mongoose.connection.db.collection('bids').insertMany(bids);
    this.bids = bids;
    console.log(`   ✓ Created ${bids.length} bids`);
  }

  async generateDocuments(count = 1000) {
    console.log(`\n📄 Generating ${count} documents...`);
    const documents = [];
    const docTypes = ['proposal', 'technical', 'financial', 'compliance', 'certificate', 'report'];

    for (let i = 0; i < count; i++) {
      const tender = this.tenders[Math.floor(Math.random() * this.tenders.length)];
      const bid = this.bids[Math.floor(Math.random() * this.bids.length)];
      const uploader = this.users[Math.floor(Math.random() * this.users.length)];

      documents.push({
        fileName: `document_${i}.${['pdf', 'doc', 'docx', 'xls', 'xlsx'][Math.floor(Math.random() * 5)]}`,
        fileUrl: `/uploads/documents/doc_${i}.pdf`,
        originalFileName: `${faker.lorem.words(3)}.pdf`,
        fileSize: Math.floor(Math.random() * 10000000) + 10000,
        mimeType: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'][Math.floor(Math.random() * 3)],
        documentType: docTypes[Math.floor(Math.random() * docTypes.length)],
        title: faker.lorem.sentence(5),
        description: faker.lorem.paragraph(1),
        tenderId: tender._id,
        bidId: Math.random() > 0.5 ? bid._id : null,
        uploadedBy: uploader._id,
        status: 'active',
        isPublic: Math.random() > 0.5,
        downloadCount: Math.floor(Math.random() * 100),
        isDeleted: false,
        createdAt: faker.date.past({ years: 2 }),
        updatedAt: new Date(),
      });
    }

    await mongoose.connection.db.collection('documents').insertMany(documents);
    this.documents = documents;
    console.log(`   ✓ Created ${documents.length} documents`);
  }

  async generateNotifications(count = 1000) {
    console.log(`\n🔔 Generating ${count} notifications...`);
    const notifications = [];
    const types = ['tender', 'bid', 'system', 'alert', 'reminder'];
    const categories = ['tender', 'bid', 'organization', 'system', 'broadcast'];

    for (let i = 0; i < count; i++) {
      const user = this.users[Math.floor(Math.random() * this.users.length)];

      notifications.push({
        title: faker.lorem.sentence(5),
        message: faker.lorem.paragraph(1),
        type: types[Math.floor(Math.random() * types.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        priority: ['low', 'normal', 'high', 'urgent'][Math.floor(Math.random() * 4)],
        status: ['pending', 'sent', 'delivered', 'read'][Math.floor(Math.random() * 4)],
        recipientType: 'user',
        recipientId: user._id,
        sentAt: faker.date.past({ years: 1 }),
        expiresAt: faker.date.future({ years: 1 }),
        createdBy: this.users[0]._id,
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: new Date(),
      });
    }

    await mongoose.connection.db.collection('notifications').insertMany(notifications);
    this.notifications = notifications;
    console.log(`   ✓ Created ${notifications.length} notifications`);
  }

  async generateAuditLogs(count = 10000) {
    console.log(`\n📝 Generating ${count} audit logs...`);
    const auditLogs = [];
    const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT'];
    const resourceTypes = ['User', 'Tender', 'Bid', 'Organization', 'Document', 'Notification'];

    const batchSize = 1000;
    for (let i = 0; i < count; i += batchSize) {
      const batch = [];
      for (let j = 0; j < batchSize && i + j < count; j++) {
        const user = this.users[Math.floor(Math.random() * this.users.length)];
        batch.push({
          action: actions[Math.floor(Math.random() * actions.length)],
          resourceType: resourceTypes[Math.floor(Math.random() * resourceTypes.length)],
          performedBy: user._id,
          performedByEmail: user.email,
          ipAddress: faker.internet.ipv4(),
          userAgent: faker.internet.userAgent(),
          status: ['SUCCESS', 'FAILURE', 'PARTIAL'][Math.floor(Math.random() * 3)],
          createdAt: faker.date.past({ years: 2 }),
        });
      }
      await mongoose.connection.db.collection('audit_logs').insertMany(batch);
      auditLogs.push(...batch);
      console.log(`   ✓ Generated ${Math.min(i + batchSize, count)}/${count} audit logs`);
    }

    this.auditLogs = auditLogs;
    console.log(`   ✓ Created ${auditLogs.length} audit logs`);
  }

  async generateApplicationLogs(count = 20000) {
    console.log(`\n📊 Generating ${count} application logs...`);
    const levels = ['error', 'warn', 'info', 'debug'];
    const services = ['api', 'auth', 'database', 'sync', 'backup', 'archive'];

    const batchSize = 2000;
    for (let i = 0; i < count; i += batchSize) {
      const batch = [];
      for (let j = 0; j < batchSize && i + j < count; j++) {
        batch.push({
          level: levels[Math.floor(Math.random() * levels.length)],
          message: faker.lorem.sentence(10),
          service: services[Math.floor(Math.random() * services.length)],
          correlation_id: faker.string.uuid(),
          metadata: {
            user: this.users[Math.floor(Math.random() * this.users.length)]?.email,
            endpoint: faker.internet.url(),
          },
          timestamp: faker.date.past({ years: 1 }),
        });
      }
      await mongoose.connection.db.collection('application_logs').insertMany(batch);
      console.log(`   ✓ Generated ${Math.min(i + batchSize, count)}/${count} application logs`);
    }

    console.log(`   ✓ Created ${count} application logs`);
  }

  async generateAnalytics(count = 50000) {
    console.log(`\n📈 Generating ${count} analytics records...`);
    const metricTypes = ['page_view', 'tender_view', 'bid_submit', 'search', 'download', 'login'];
    const entityTypes = ['tender', 'bid', 'organization', 'user', 'document'];

    const batchSize = 5000;
    for (let i = 0; i < count; i += batchSize) {
      const batch = [];
      for (let j = 0; j < batchSize && i + j < count; j++) {
        batch.push({
          metric_type: metricTypes[Math.floor(Math.random() * metricTypes.length)],
          entity_type: entityTypes[Math.floor(Math.random() * entityTypes.length)],
          entity_id: this.tenders[Math.floor(Math.random() * this.tenders.length)]?._id,
          value: Math.floor(Math.random() * 1000),
          date: faker.date.past({ years: 1 }),
          timestamp: faker.date.past({ years: 1 }).getTime(),
          metadata: {
            source: ['web', 'mobile', 'api'][Math.floor(Math.random() * 3)],
            browser: faker.internet.userAgent(),
          },
          created_at: new Date(),
        });
      }
      await mongoose.connection.db.collection('analytics').insertMany(batch);
      console.log(`   ✓ Generated ${Math.min(i + batchSize, count)}/${count} analytics records`);
    }

    console.log(`   ✓ Created ${count} analytics records`);
  }

  async run() {
    try {
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║  MongoDB Atlas Production Data Generator               ║');
      console.log('╚════════════════════════════════════════════════════════╝\n');

      await this.connect();
      await this.clearExistingData();

      await this.generateUsers(200);
      await this.generateOrganizations(50);
      await this.generateTenders(500);
      await this.generateBids(1500);
      await this.generateDocuments(1000);
      await this.generateNotifications(1000);
      await this.generateAuditLogs(10000);
      await this.generateApplicationLogs(20000);
      await this.generateAnalytics(50000);

      console.log('\n╔════════════════════════════════════════════════════════╗');
      console.log('║  ✓ Production Data Generation Complete               ║');
      console.log('╚════════════════════════════════════════════════════════╝');

      // Generate summary
      const summary = await this.generateSummary();
      console.log('\n📊 DATA SUMMARY:');
      console.log(JSON.stringify(summary, null, 2));

      process.exit(0);
    } catch (error) {
      console.error('✗ Seed generation failed:', error);
      process.exit(1);
    }
  }

  async generateSummary() {
    const db = mongoose.connection.db;
    return {
      users: await db.collection('users').countDocuments(),
      organizations: await db.collection('organizations').countDocuments(),
      tenders: await db.collection('tenders').countDocuments(),
      bids: await db.collection('bids').countDocuments(),
      documents: await db.collection('documents').countDocuments(),
      notifications: await db.collection('notifications').countDocuments(),
      audit_logs: await db.collection('audit_logs').countDocuments(),
      application_logs: await db.collection('application_logs').countDocuments(),
      analytics: await db.collection('analytics').countDocuments(),
    };
  }
}

const seeder = new ProductionSeedService();
seeder.run();