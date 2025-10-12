const { Pool } = require('pg');

let pool;

/**
 * PostgreSQL adatbázis kapcsolat létrehozása
 */
async function connectDB() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'urlshortener',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  pool = new Pool(config);

  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    throw error;
  }
}

/**
 * URL lekérdezése rövid kód alapján
 * @param {string} shortCode - Rövid kód
 * @returns {object|null} URL objektum vagy null
 */
async function getUrlByCode(shortCode) {
  const query = 'SELECT * FROM urls WHERE short_code = $1';
  
  try {
    const result = await pool.query(query, [shortCode]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting URL:', error);
    throw error;
  }
}

/**
 * Adatbázis kapcsolat lezárása
 */
async function closeDB() {
  if (pool) {
    await pool.end();
    console.log('✅ Database connection closed');
  }
}

module.exports = {
  connectDB,
  getUrlByCode,
  closeDB
};
