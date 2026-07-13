/**
 * Database Seed Script
 * Populates the database with initial data for development and testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./src/models/User');
const AuditLog = require('./src/models/AuditLog');

// Import module models
const { Session } = require('./src/modules/auth/model');
const { Category } = require('./src/modules/categories/model');
const { Organization } = require('./src/modules/organizations/model');
const FAQ = require('./src/modules/faq/model');

const seedData = {
  users: [
    {
      fullName: 'System Administrator',
      email: 'admin@phoenixtender.com',
      password: 'Admin@123',
      role: 'admin',
      companyName: 'Phoenix Tender Tech',
      phone: '+1-555-0100',
      isActive: true,
    },
    {
      fullName: 'Test Vendor',
      email: 'vendor@example.com',
      password: 'Vendor@123',
      role: 'vendor',
      companyName: 'Test Vendor Corp',
      phone: '+1-555-0101',
      isActive: true,
    },
    {
      fullName: 'Test Evaluator',
      email: 'evaluator@example.com',
      password: 'Evaluator@123',
      role: 'evaluator',
      companyName: 'Evaluation Services Inc',
      phone: '+1-555-0102',
      isActive: true,
    },
  ],
  
  categories: [
  {
    name: 'Construction',
    code: 'CONST',
    description: 'Construction and infrastructure projects',
    type: 'construction',
    status: 'active',
  },
  {
    name: 'IT Services',
    code: 'IT',
    description: 'Information technology services and software',
    type: 'it_software',
    status: 'active',
  },
  {
    name: 'Consulting',
    code: 'CONS',
    description: 'Professional consulting services',
    type: 'consultancy',
    status: 'active',
  },
  {
    name: 'Healthcare',
    code: 'HLTH',
    description: 'Healthcare and medical services',
    type: 'medical',
    status: 'active',
  },
  {
    name: 'Education',
    code: 'EDU',
    description: 'Educational services and training',
    type: 'education',
    status: 'active',
  },
],
  
  faqs: [
    {
      question: 'How do I register as a vendor?',
      answer: 'To register as a vendor, click on the "Register" button on the homepage, fill in your company details, and submit your application. Once verified, you will receive an email with your login credentials.',
      category: 'registration',
      isPublished: true,
      isFeatured: true,
      order: 1,
    },
    {
      question: 'How do I submit a bid for a tender?',
      answer: 'After logging in, browse available tenders, select the one you\'re interested in, click "Submit Bid", fill in your bid details including pricing and documentation, then submit before the deadline.',
      category: 'bids',
      isPublished: true,
      isFeatured: true,
      order: 2,
    },
    {
      question: 'What are the payment terms?',
      answer: 'Payment terms vary by tender. Typically, payments are made in milestones as specified in the tender document. Some tenders may require an advance payment guarantee.',
      category: 'payment',
      isPublished: true,
      isFeatured: false,
      order: 3,
    },
    {
      question: 'How are bids evaluated?',
      answer: 'Bids are evaluated based on technical compliance, financial proposal, past performance, and other criteria specified in the tender document. The evaluation committee reviews all submissions and makes recommendations.',
      category: 'tenders',
      isPublished: true,
      isFeatured: true,
      order: 4,
    },
    {
      question: 'Can I modify my bid after submission?',
      answer: 'Yes, you can modify your bid before the submission deadline. After the deadline, no modifications are allowed. Contact support if you encounter any issues.',
      category: 'bids',
      isPublished: true,
      isFeatured: false,
      order: 5,
    },
  ],
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tender_portal');
    console.log('✓ Connected to database');
    
    // Clear existing data (optional - comment out to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Session.deleteMany({});
    await Category.deleteMany({});
    await Organization.deleteMany({});
    await FAQ.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('✓ Existing data cleared');
    
    // Seed users (passwords will be hashed by pre-save hook)
    console.log('👥 Seeding users...');
    const users = [];
    for (const userData of seedData.users) {
      const user = await User.create(userData);
      users.push(user);
    }
    console.log(`✓ Created ${users.length} users`);
    
    // Seed categories
    console.log('📁 Seeding categories...');
    const categories = await Category.insertMany(seedData.categories.map(cat => ({
      ...cat,
      createdBy: users[0]._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })));
    console.log(`✓ Created ${categories.length} categories`);
    
    // Seed FAQs
    console.log('❓ Seeding FAQs...');
    const faqs = await FAQ.insertMany(seedData.faqs);
    console.log(`✓ Created ${faqs.length} FAQs`);
    
    // Create a sample organization
    console.log('🏢 Creating sample organization...');
    const org = await Organization.create({
      name: 'Sample Organization',
      type: 'vendor',
      email: 'contact@sampleorg.com',
      phone: '+1-555-0200',
      address: '123 Business Street, City, Country',
      website: 'https://sampleorg.com',
      description: 'A sample organization for testing',
      verificationStatus: 'verified',
      isVerified: true,
      ownerId: users[1]._id,
    });
    console.log('✓ Created sample organization');
    
    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Default Credentials:');
    console.log('  Admin: admin@phoenixtender.com / Admin@123');
    console.log('  Vendor: vendor@example.com / Vendor@123');
    console.log('  Evaluator: evaluator@example.com / Evaluator@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();