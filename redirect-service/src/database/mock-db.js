// Mock database for local development without PostgreSQL
const fileDb = require('../../file-db');

async function connectDB() {
  console.log('✅ Mock Database connected (no PostgreSQL needed)');
  return true;
}

async function getUrlByCode(shortCode) {
  return fileDb.getUrlByCode(shortCode);
}

async function closeDB() {
  console.log('✅ Mock Database connection closed');
}

module.exports = {
  connectDB,
  getUrlByCode,
  closeDB
};
