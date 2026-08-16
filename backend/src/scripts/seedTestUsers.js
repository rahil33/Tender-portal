require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting test user seed...');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to database');

    const testUsers = [
      {
        email: 'test.admin@phoenixtech.in',
        password: 'GemTest@Admin2026!',
        role: 'admin',
        fullName: 'Admin',
      },
      {
        email: 'test.seller@phoenixtech.in',
        password: 'GemTest@Seller2026!',
        role: 'seller',
        fullName: 'Seller',
      },
      {
        email: 'test.buyer@phoenixtech.in',
        password: 'GemTest@Buyer2026!',
        role: 'buyer',
        fullName: 'Buyer',
      },
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        // Display-name only update: never changes password/role. Keeps the
        // credential in the database untouched while giving the UI the proper
        // display name (Admin / Seller / Buyer).
        if (existingUser.fullName !== userData.fullName) {
          existingUser.fullName = userData.fullName;
          await existingUser.save();
          console.log(`✓ Updated display name for: ${userData.email} -> ${userData.fullName}`);
        }

        if (
          existingUser.role === userData.role &&
          existingUser.isActive === true
        ) {
          console.log(`✓ User already exists: ${userData.email} (role: ${existingUser.role}, isActive: ${existingUser.isActive})`);
          continue;
        }

        if (existingUser.role !== userData.role) {
          console.log(`⚠️  Role mismatch for ${userData.email}: expected ${userData.role}, found ${existingUser.role}`);
          existingUser.role = userData.role;
          await existingUser.save();
          console.log(`✓ Updated role to: ${userData.role}`);
          continue;
        }

        if (existingUser.isActive === false) {
          existingUser.isActive = true;
          await existingUser.save();
          console.log(`✓ Reactivated: ${userData.email}`);
          continue;
        }
      }

      const user = new User({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        isActive: true,
      });

      await user.save();
      console.log(`✓ Created user: ${userData.email} (role: ${userData.role})`);
    }

    console.log('\n✅ Test user seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();