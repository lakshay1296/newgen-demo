// Entry point for the backend server
const app = require('./src/server');
const { testConnection } = require('./src/config/db');

// Test database connection
testConnection()
  .then(connected => {
    if (!connected) {
      console.warn('Warning: Database connection failed. Some features may not work properly.');
    }
  })
  .catch(err => {
    console.error('Error testing database connection:', err);
  });

// Export app for testing
module.exports = app;