// Mock database for local development without PostgreSQL
const fileDb = require('../../file-db');

async function connectDB() {
  console.log('✅ Mock Database connected (no PostgreSQL needed)');
  return true;
}

async function saveUrl(shortCode, originalUrl) {
  return fileDb.saveUrl(shortCode, originalUrl);
}

async function getUrlByCode(shortCode, originalUrl = null) {
  return fileDb.getUrlByCode(shortCode, originalUrl);
}

async function saveClick(shortCode, userAgent = null, ipAddress = null) {
  return fileDb.saveClick(shortCode, userAgent, ipAddress);
}

async function getStats(shortCode) {
  return fileDb.getStats(shortCode);
}

async function closeDB() {
  console.log('✅ Mock Database connection closed');
}

module.exports = {
  connectDB,
  saveUrl,
  getUrlByCode,
  saveClick,
  getStats,
  closeDB
};
