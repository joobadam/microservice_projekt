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
    
    await createTables();
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    throw error;
  }
}

/**
 * Táblák létrehozása
 */
async function createTables() {
  const createUrlsTable = `
    CREATE TABLE IF NOT EXISTS urls (
      id SERIAL PRIMARY KEY,
      short_code VARCHAR(6) UNIQUE NOT NULL,
      original_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_short_code (short_code),
      INDEX idx_created_at (created_at)
    );
  `;

  const createClicksTable = `
    CREATE TABLE IF NOT EXISTS clicks (
      id SERIAL PRIMARY KEY,
      short_code VARCHAR(6) NOT NULL,
      clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_agent TEXT,
      ip_address INET,
      FOREIGN KEY (short_code) REFERENCES urls(short_code) ON DELETE CASCADE,
      INDEX idx_short_code (short_code),
      INDEX idx_clicked_at (clicked_at)
    );
  `;

  try {
    await pool.query(createUrlsTable);
    await pool.query(createClicksTable);
    console.log('✅ Database tables created/verified');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

/**
 * URL mentése az adatbázisba
 * @param {string} shortCode - Rövid kód
 * @param {string} originalUrl - Eredeti URL
 * @returns {object} Mentett URL objektum
 */
async function saveUrl(shortCode, originalUrl) {
  const query = `
    INSERT INTO urls (short_code, original_url) 
    VALUES ($1, $2) 
    RETURNING *
  `;
  
  try {
    const result = await pool.query(query, [shortCode, originalUrl]);
    return result.rows[0];
  } catch (error) {
    console.error('Error saving URL:', error);
    throw error;
  }
}

/**
 * URL lekérdezése rövid kód alapján
 * @param {string} shortCode - Rövid kód
 * @param {string} originalUrl - Eredeti URL (opcionális, duplikátum ellenőrzéshez)
 * @returns {object|null} URL objektum vagy null
 */
async function getUrlByCode(shortCode, originalUrl = null) {
  let query;
  let params;

  if (originalUrl) {
    query = 'SELECT * FROM urls WHERE original_url = $1 ORDER BY created_at ASC LIMIT 1';
    params = [originalUrl];
  } else {
    query = 'SELECT * FROM urls WHERE short_code = $1';
    params = [shortCode];
  }

  try {
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting URL:', error);
    throw error;
  }
}

/**
 * Kattintás rögzítése
 * @param {string} shortCode - Rövid kód
 * @param {string} userAgent - User agent
 * @param {string} ipAddress - IP cím
 * @returns {object} Mentett click objektum
 */
async function saveClick(shortCode, userAgent = null, ipAddress = null) {
  const query = `
    INSERT INTO clicks (short_code, user_agent, ip_address) 
    VALUES ($1, $2, $3) 
    RETURNING *
  `;
  
  try {
    const result = await pool.query(query, [shortCode, userAgent, ipAddress]);
    return result.rows[0];
  } catch (error) {
    console.error('Error saving click:', error);
    throw error;
  }
}

/**
 * Statisztikák lekérdezése
 * @param {string} shortCode - Rövid kód
 * @returns {object} Statisztikák
 */
async function getStats(shortCode) {
  const urlQuery = 'SELECT * FROM urls WHERE short_code = $1';
  const clicksQuery = 'SELECT COUNT(*) as click_count FROM clicks WHERE short_code = $1';
  
  try {
    const [urlResult, clicksResult] = await Promise.all([
      pool.query(urlQuery, [shortCode]),
      pool.query(clicksQuery, [shortCode])
    ]);

    const url = urlResult.rows[0];
    const clickCount = parseInt(clicksResult.rows[0].click_count);

    if (!url) {
      return null;
    }

    return {
      shortCode: url.short_code,
      originalUrl: url.original_url,
      createdAt: url.created_at,
      clickCount
    };
  } catch (error) {
    console.error('Error getting stats:', error);
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
  saveUrl,
  getUrlByCode,
  saveClick,
  getStats,
  closeDB
};
