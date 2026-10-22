const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/tender_portal');
console.log('MongoDB state: ' + mongoose.connection.readyState);