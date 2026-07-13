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
const { BlogPost } = require('./src/modules/blog/model');

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

  blogPosts: [
    {
      title: 'Complete Guide to GeM Registration in 2026',
      slug: 'gem-registration-guide',
      excerpt: 'Step-by-step guide to register your business on the Government e-Marketplace portal and start selling to government departments.',
      content: `<h2>Introduction</h2><p>The Government e-Marketplace (GeM) is India's national public procurement portal that facilitates online procurement of common use goods and services required by various Government Departments, Organizations and Public Sector Undertakings (PSUs).</p><h2>Why Register on GeM?</h2><ul><li>Direct access to government buyers</li><li>Transparent and efficient procurement process</li><li>No registration fees</li><li>Pan-India presence</li></ul><h2>Registration Process</h2><p>Follow these steps to complete your GeM registration:</p><ol><li>Visit the GeM portal (gem.gov.in)</li><li>Click on 'Seller Enrollment'</li><li>Fill in your basic details</li><li>Verify your mobile number and email</li><li>Complete your company profile</li><li>Upload required documents</li><li>Wait for verification</li></ol><h2>Required Documents</h2><ul><li>PAN Card</li><li>Aadhaar Card</li><li>Business registration certificate</li><li>MSME certificate (if applicable)</li><li>Bank account details</li><li>GST registration</li></ul><h2>Conclusion</h2><p>GeM registration opens up tremendous opportunities for businesses to participate in government procurement. With over ₹2 lakh crore of annual procurement, it's a platform no serious vendor can ignore.</p>`,
      coverImage: 'https://images.unsplash.com/photo-1565489030990-e211075fe11c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      category: 'gem-portal',
      tags: ['gem', 'registration', 'government', 'procurement'],
      author: { name: 'Rajesh Sharma', role: 'GeM Consultant', email: 'rajesh@phoenixtender.com' },
      publishedAt: '2026-03-20T10:00:00.000Z',
      isPublished: true,
      views: 1250,
      readTime: 8,
    },
    {
      title: '10 Essential Tips for Winning Government Tenders',
      slug: 'tender-bidding-tips',
      excerpt: 'Learn the proven strategies and best practices that can significantly improve your chances of winning government contracts.',
      content: `<h2>Introduction</h2><p>Winning government tenders requires a combination of preparation, strategy, and attention to detail. Here are 10 essential tips to help you succeed.</p><h2>1. Understand the Tender Requirements</h2><p>Read the tender document thoroughly. Make sure you understand every requirement before submitting your bid.</p><h2>2. Prepare Complete Documentation</h2><p>Missing documents are the most common reason for bid rejection. Create a checklist and verify everything.</p><h2>3. Competitive Pricing</h2><p>Research market rates and price competitively. Remember, L1 (lowest bid) doesn't always win, but pricing matters.</p><h2>4. Highlight Your Experience</h2><p>Showcase relevant past projects and success stories. Government buyers value proven track records.</p><h2>5. Quality Assurance</h2><p>Demonstrate your quality control processes and certifications.</p><h2>6. Meet All Eligibility Criteria</h2><p>Ensure you meet all technical and financial eligibility requirements.</p><h2>7. Submit Before Deadline</h2><p>Never wait until the last minute. Technical issues can cause delays.</p><h2>8. Attend Pre-Bid Meetings</h2><p>These meetings provide valuable insights and clarification opportunities.</p><h2>9. Build Relationships</h2><p>Network with government departments and understand their needs.</p><h2>10. Learn from Feedback</h2><p>Analyze why you won or lost tenders to improve future bids.</p>`,
      coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      category: 'tender-tips',
      tags: ['tender', 'bidding', 'tips', 'government contracts'],
      author: { name: 'Priya Patel', role: 'Tender Expert', email: 'priya@phoenixtender.com' },
      publishedAt: '2026-03-18T10:00:00.000Z',
      isPublished: true,
      views: 980,
      readTime: 6,
    },
    {
      title: 'Understanding OEM Authorization on GeM',
      slug: 'oem-authorization-process',
      excerpt: 'Everything you need to know about becoming an authorized OEM on the GeM platform and managing your reseller network.',
      content: `<h2>What is OEM Authorization?</h2><p>Original Equipment Manufacturer (OEM) authorization on GeM allows manufacturers to authorize resellers to sell their products on the platform.</p><h2>Benefits of OEM Authorization</h2><ul><li>Control over pricing and distribution</li><li>Expanded market reach through resellers</li><li>Brand protection</li><li>Direct communication with end customers</li></ul><h2>How to Become an Authorized OEM</h2><ol><li>Register on GeM as a seller</li><li>Complete your company verification</li><li>Upload product catalog</li><li>Apply for OEM status with supporting documents</li><li>Wait for GeM approval</li></ol><h2>Managing Resellers</h2><p>As an OEM, you can:</p><ul><li>Authorize specific resellers</li><li>Set maximum discount limits</li><li>Monitor reseller activities</li><li>Revoke authorization if needed</li></ul><h2>Required Documents</h2><ul><li>Manufacturing license</li><li>Trademark registration</li><li>MSME certificate (if applicable)</li><li>Product quality certifications</li></ul>`,
      coverImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      category: 'gem-portal',
      tags: ['oem', 'authorization', 'gem', 'reseller'],
      author: { name: 'Amit Kumar', role: 'OEM Specialist', email: 'amit@phoenixtender.com' },
      publishedAt: '2026-03-15T10:00:00.000Z',
      isPublished: true,
      views: 756,
      readTime: 7,
    },
    {
      title: 'MSME Certificates: Types and Benefits',
      slug: 'msme-certificates-guide',
      excerpt: 'Comprehensive guide to different types of MSME certificates and how they can help you win more government tenders.',
      content: `<h2>Introduction</h2><p>MSME (Micro, Small, and Medium Enterprises) registration provides numerous benefits for businesses participating in government tenders.</p><h2>Types of MSME Registration</h2><ul><li>Udyam Registration (new)</li><li>Udyog Aadhaar (old, being phased out)</li></ul><h2>Classification Criteria</h2><p><strong>Manufacturing Enterprises:</strong></p><ul><li>Micro: Investment ≤ ₹1 crore, Turnover ≤ ₹5 crore</li><li>Small: Investment ≤ ₹10 crore, Turnover ≤ ₹50 crore</li><li>Medium: Investment ≤ ₹50 crore, Turnover ≤ ₹250 crore</li></ul><p><strong>Service Enterprises:</strong></p><ul><li>Micro: Investment ≤ ₹10 lakh, Turnover ≤ ₹5 crore</li><li>Small: Investment ≤ ₹2 crore, Turnover ≤ ₹50 crore</li><li>Medium: Investment ≤ ₹5 crore, Turnover ≤ ₹250 crore</li></ul><h2>Benefits in Government Tenders</h2><ul><li>Exemption from earnest money deposit (EMD)</li><li>Price preference over non-MSME bidders</li><li>Reserved tenders for MSME only</li><li>Faster payment cycles</li></ul><h2>How to Register</h2><p>Visit udyamregistration.gov.in and complete the online registration process. It's free and instant.</p>`,
      coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      category: 'certificates',
      tags: ['msme', 'certificate', 'udyam', 'government tender'],
      author: { name: 'Rajesh Sharma', role: 'GeM Consultant', email: 'rajesh@phoenixtender.com' },
      publishedAt: '2026-03-12T10:00:00.000Z',
      isPublished: true,
      views: 1120,
      readTime: 5,
    },
    {
      title: 'Why ISO Certification Matters for Tender Success',
      slug: 'iso-certification-importance',
      excerpt: 'Discover how ISO certifications can enhance your credibility and open doors to high-value government contracts.',
      content: `<h2>Introduction</h2><p>ISO (International Organization for Standardization) certifications are globally recognized standards that demonstrate your commitment to quality, safety, and efficiency.</p><h2>Common ISO Certifications for Tenders</h2><ul><li>ISO 9001: Quality Management Systems</li><li>ISO 14001: Environmental Management</li><li>ISO 45001: Occupational Health and Safety</li><li>ISO 27001: Information Security Management</li><li>ISO 22000: Food Safety Management</li></ul><h2>Benefits in Government Tenders</h2><ul><li>Technical evaluation points</li><li>Mandatory requirement for high-value tenders</li><li>Competitive advantage over non-certified competitors</li><li>Enhanced credibility and trust</li></ul><h2>How to Get ISO Certified</h2><ol><li>Choose the relevant ISO standard</li><li>Implement the management system</li><li>Internal audit and management review</li><li>Select a certification body</li><li>Stage 1 audit (document review)</li><li>Stage 2 audit (implementation review)</li><li>Certification and surveillance audits</li></ol><h2>Cost and Timeline</h2><p>Typical certification takes 3-6 months and costs between ₹50,000 to ₹2,00,000 depending on organization size and scope.</p>`,
      coverImage: 'https://images.unsplash.com/photo-1586281378019-df6c6964583d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      category: 'certificates',
      tags: ['iso', 'certification', 'quality', 'tender'],
      author: { name: 'Priya Patel', role: 'Tender Expert', email: 'priya@phoenixtender.com' },
      publishedAt: '2026-03-10T10:00:00.000Z',
      isPublished: true,
      views: 890,
      readTime: 6,
    },
    {
      title: 'Essential Documentation Checklist for Tender Submission',
      slug: 'tender-documentation-checklist',
      excerpt: 'Never miss a required document again with our comprehensive checklist for tender bid submissions.',
      content: `<h2>Introduction</h2><p>Complete documentation is crucial for tender success. Missing even one document can lead to bid rejection.</p><h2>Company Registration Documents</h2><ul><li>Certificate of Incorporation</li><li>Memorandum of Association (MOA)</li><li>Articles of Association (AOA)</li><li>PAN Card</li><li>GST Registration</li><li>MSME Certificate (if applicable)</li></ul><h2>Financial Documents</h2><ul><li>Audited financial statements (last 3 years)</li><li>Income tax returns (last 3 years)</li><li>Bank statements</li><li>Net worth certificate</li><li>Turnover certificate</li></ul><h2>Technical Documents</h2><ul><li>ISO certifications</li><li>Product specifications</li><li>Quality test reports</li><li>Manufacturer authorization (if reseller)</li><li>Service level agreements</li></ul><h2>Experience Documents</h2><ul><li>Work orders from previous clients</li><li>Completion certificates</li><li>Client testimonials</li><li>Case studies</li></ul><h2>Compliance Documents</h2><ul><li>Labour license</li><li>EPF registration</li><li>ESI registration</li><li>Professional tax registration</li><li>No dues certificate</li></ul><h2>Tender-Specific Documents</h2><ul><li>Bid security / EMD</li><li>Power of attorney</li><li>Affidavits as per tender format</li><li>Undertakings and declarations</li></ul><h2>Pro Tips</h2><ul><li>Create a master document folder</li><li>Keep digital copies of everything</li><li>Update documents regularly</li><li>Get documents attested in advance</li></ul>`,
      coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      category: 'tender-tips',
      tags: ['documentation', 'checklist', 'tender', 'compliance'],
      author: { name: 'Amit Kumar', role: 'OEM Specialist', email: 'amit@phoenixtender.com' },
      publishedAt: '2026-03-08T10:00:00.000Z',
      isPublished: true,
      views: 1450,
      readTime: 4,
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
    
    // Seed blog posts
    console.log('📝 Seeding blog posts...');
    const blogPosts = await BlogPost.insertMany(seedData.blogPosts.map(post => ({
      ...post,
      createdAt: new Date(),
      updatedAt: new Date(),
    })));
    console.log(`✓ Created ${blogPosts.length} blog posts`);
    
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