require('dotenv').config();
const app = require('./server');

console.log('Test server started');

// Keep server running for 30 seconds for testing
setTimeout(() => {
  console.log('Test complete');
  process.exit(0);
}, 30000);