// Mock database for local development without PostgreSQL
const fileDb = require('../../../file-db');

async function connectDB() {
  console.log('✅ Mock Database connected (no PostgreSQL needed)');
  return true;
}

async function saveClick(shortCode, userAgent = null, ipAddress = null, referer = null) {
  return fileDb.saveClick(shortCode, userAgent, ipAddress, referer);
}

async function getStats(shortCode) {
  return fileDb.getStats(shortCode);
}

async function getClickHistory(shortCode, limit = 50, offset = 0) {
  return fileDb.getClickHistory(shortCode, limit, offset);
}

async function getTopUrls(limit = 10) {
  return fileDb.getTopUrls(limit);
}

async function closeDB() {
  console.log('✅ Mock Database connection closed');
}

module.exports = {
  connectDB,
  saveClick,
  getStats,
  getClickHistory,
  getTopUrls,
  closeDB
};
