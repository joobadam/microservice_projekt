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
 * Kattintás rögzítése
 * @param {string} shortCode - Rövid kód
 * @param {string} userAgent - User agent
 * @param {string} ipAddress - IP cím
 * @param {string} referer - Referer URL
 * @returns {object} Mentett click objektum
 */
async function saveClick(shortCode, userAgent = null, ipAddress = null, referer = null) {
  const query = `
    INSERT INTO clicks (short_code, user_agent, ip_address, referer) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *
  `;
  
  try {
    const result = await pool.query(query, [shortCode, userAgent, ipAddress, referer]);
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
  const clicksQuery = `
    SELECT 
      COUNT(*) as click_count,
      MAX(clicked_at) as last_clicked_at
    FROM clicks 
    WHERE short_code = $1
  `;
  
  try {
    const [urlResult, clicksResult] = await Promise.all([
      pool.query(urlQuery, [shortCode]),
      pool.query(clicksQuery, [shortCode])
    ]);

    const url = urlResult.rows[0];
    const clickCount = parseInt(clicksResult.rows[0].click_count);
    const lastClickedAt = clicksResult.rows[0].last_clicked_at;

    if (!url) {
      return null;
    }

    return {
      shortCode: url.short_code,
      originalUrl: url.original_url,
      createdAt: url.created_at,
      clickCount,
      lastClickedAt
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    throw error;
  }
}

/**
 * Kattintás előzmények lekérdezése
 * @param {string} shortCode - Rövid kód
 * @param {number} limit - Limit
 * @param {number} offset - Offset
 * @returns {array} Kattintás előzmények
 */
async function getClickHistory(shortCode, limit = 50, offset = 0) {
  const query = `
    SELECT 
      id,
      clicked_at,
      user_agent,
      ip_address,
      referer
    FROM clicks 
    WHERE short_code = $1 
    ORDER BY clicked_at DESC 
    LIMIT $2 OFFSET $3
  `;
  
  try {
    const result = await pool.query(query, [shortCode, limit, offset]);
    return result.rows;
  } catch (error) {
    console.error('Error getting click history:', error);
    throw error;
  }
}

/**
 * Legtöbbet kattintott URL-ek
 * @param {number} limit - Limit
 * @returns {array} Top URL-ek
 */
async function getTopUrls(limit = 10) {
  const query = `
    SELECT 
      u.short_code,
      u.original_url,
      u.created_at,
      COUNT(c.id) as click_count,
      MAX(c.clicked_at) as last_clicked_at
    FROM urls u
    LEFT JOIN clicks c ON u.short_code = c.short_code
    GROUP BY u.short_code, u.original_url, u.created_at
    ORDER BY click_count DESC, u.created_at DESC
    LIMIT $1
  `;
  
  try {
    const result = await pool.query(query, [limit]);
    return result.rows.map(row => ({
      shortCode: row.short_code,
      originalUrl: row.original_url,
      createdAt: row.created_at,
      clickCount: parseInt(row.click_count),
      lastClickedAt: row.last_clicked_at
    }));
  } catch (error) {
    console.error('Error getting top URLs:', error);
    throw error;
  }
}

/**
 * Napi statisztikák
 * @param {string} shortCode - Rövid kód (opcionális)
 * @param {string} date - Dátum (YYYY-MM-DD formátum)
 * @returns {object} Napi statisztikák
 */
async function getDailyStats(shortCode = null, date = null) {
  let query;
  let params;

  if (shortCode && date) {
    query = `
      SELECT 
        DATE(clicked_at) as click_date,
        COUNT(*) as click_count
      FROM clicks 
      WHERE short_code = $1 
        AND DATE(clicked_at) = $2
      GROUP BY DATE(clicked_at)
    `;
    params = [shortCode, date];
  } else if (shortCode) {
    query = `
      SELECT 
        DATE(clicked_at) as click_date,
        COUNT(*) as click_count
      FROM clicks 
      WHERE short_code = $1 
        AND clicked_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(clicked_at)
      ORDER BY click_date DESC
    `;
    params = [shortCode];
  } else {
    query = `
      SELECT 
        DATE(clicked_at) as click_date,
        COUNT(*) as click_count
      FROM clicks 
      WHERE clicked_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(clicked_at)
      ORDER BY click_date DESC
    `;
    params = [];
  }
  
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error getting daily stats:', error);
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
  saveClick,
  getStats,
  getClickHistory,
  getTopUrls,
  getDailyStats,
  closeDB
};
