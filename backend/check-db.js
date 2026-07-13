require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const Tender = mongoose.model('Tender');
    const count = await Tender.countDocuments({});
    console.log('Total tenders:', count);
    
    const published = await Tender.countDocuments({ status: 'published' });
    console.log('Published tenders:', published);
    
    const all = await Tender.find({}).limit(5).select('title status tenderNumber').lean();
    console.log('Sample tenders:', JSON.stringify(all, null, 2));
    
    await mongoose.disconnect();
    console.log('Disconnected');
  } catch(e) {
    console.error('Error:', e.message);
  }
}

check();