require('./src/config/db.js');
require('mongoose');
console.log('MongoDB state: ' + mongoose.connection.readyState);