/**
 * Backwards-compatible wrapper. All logic lives in ./database.js.
 * Returns a promise that rejects with MongoConnectionError (never exits).
 */
const { connect } = require('./database');

const connectDB = () => connect();

module.exports = connectDB;
