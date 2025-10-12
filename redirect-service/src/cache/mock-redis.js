// Mock Redis for local development without Redis
const cache = new Map();

async function connectRedis() {
  console.log('✅ Mock Redis connected (no Redis needed)');
  return true;
}

async function setCache(key, value, ttl = 3600) {
  const expiry = Date.now() + (ttl * 1000);
  cache.set(key, { value, expiry });
  return true;
}

async function getCache(key) {
  const item = cache.get(key);
  if (!item) {
    return null;
  }
  
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  
  return item.value;
}

async function closeRedis() {
  console.log('✅ Mock Redis connection closed');
}

module.exports = {
  connectRedis,
  setCache,
  getCache,
  closeRedis
};
