const redis = require('redis');

let client;

/**
 * Redis kapcsolat létrehozása
 */
async function connectRedis() {
  const config = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
  };

  try {
    client = redis.createClient(config);
    
    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    client.on('ready', () => {
      console.log('✅ Redis ready to accept commands');
    });

    client.on('end', () => {
      console.log('✅ Redis connection ended');
    });

    await client.connect();
  } catch (error) {
    console.error('❌ Redis connection error:', error);
    throw error;
  }
}

/**
 * Kulcs-érték páros mentése cache-be
 * @param {string} key - Kulcs
 * @param {string} value - Érték
 * @param {number} ttl - Time to live másodpercben
 * @returns {boolean} Sikeres mentés
 */
async function setCache(key, value, ttl = 3600) {
  try {
    if (!client) {
      console.warn('Redis client not connected');
      return false;
    }

    await client.setEx(key, ttl, value);
    return true;
  } catch (error) {
    console.error('Error setting cache:', error);
    return false;
  }
}

/**
 * Érték lekérdezése cache-ből
 * @param {string} key - Kulcs
 * @returns {string|null} Érték vagy null
 */
async function getCache(key) {
  try {
    if (!client) {
      console.warn('Redis client not connected');
      return null;
    }

    const value = await client.get(key);
    return value;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
}

/**
 * Kulcs törlése cache-ből
 * @param {string} key - Kulcs
 * @returns {boolean} Sikeres törlés
 */
async function deleteCache(key) {
  try {
    if (!client) {
      console.warn('Redis client not connected');
      return false;
    }

    const result = await client.del(key);
    return result > 0;
  } catch (error) {
    console.error('Error deleting cache:', error);
    return false;
  }
}

/**
 * Több kulcs törlése egyszerre
 * @param {string[]} keys - Kulcsok tömbje
 * @returns {number} Törölt kulcsok száma
 */
async function deleteMultipleCache(keys) {
  try {
    if (!client || keys.length === 0) {
      return 0;
    }

    const result = await client.del(keys);
    return result;
  } catch (error) {
    console.error('Error deleting multiple cache keys:', error);
    return 0;
  }
}

/**
 * Cache statisztikák
 * @returns {object} Statisztikák
 */
async function getCacheStats() {
  try {
    if (!client) {
      return null;
    }

    const info = await client.info('memory');
    const keyspace = await client.info('keyspace');
    
    return {
      memory: info,
      keyspace: keyspace
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return null;
  }
}

/**
 * Redis kapcsolat lezárása
 */
async function closeRedis() {
  if (client) {
    await client.quit();
    console.log('✅ Redis connection closed');
  }
}

module.exports = {
  connectRedis,
  setCache,
  getCache,
  deleteCache,
  deleteMultipleCache,
  getCacheStats,
  closeRedis
};
