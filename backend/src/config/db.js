const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tender_portal', {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    logger.info('✓ MongoDB Connected Successfully', { 
      host: conn.connection.host,
      name: conn.connection.name,
    });
    
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB Connection Error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB Disconnected');
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
  logger.error(`✗ MongoDB Connection Failed: ${error.message}`);
  console.error(error); // full error object, for extra detail in the terminal
  process.exit(1);
  }
};

module.exports = connectDB;
