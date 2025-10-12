// Simple file-based database for local development
const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'simple-db.json');

async function loadDb() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { urls: {}, clicks: {} };
  }
}

async function saveDb(db) {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

async function saveUrl(shortCode, originalUrl) {
  const db = await loadDb();
  const url = {
    id: Date.now(),
    short_code: shortCode,
    original_url: originalUrl,
    created_at: new Date().toISOString()
  };
  
  db.urls[shortCode] = url;
  await saveDb(db);
  console.log(`✅ URL saved: ${shortCode} -> ${originalUrl}`);
  return url;
}

async function getUrlByCode(shortCode, originalUrl = null) {
  const db = await loadDb();
  
  if (originalUrl) {
    for (const [code, url] of Object.entries(db.urls)) {
      if (url.original_url === originalUrl) {
        return url;
      }
    }
    return null;
  }
  
  return db.urls[shortCode] || null;
}

async function saveClick(shortCode, userAgent = null, ipAddress = null, referer = null) {
  const db = await loadDb();
  const click = {
    id: Date.now(),
    short_code: shortCode,
    clicked_at: new Date().toISOString(),
    user_agent: userAgent,
    ip_address: ipAddress,
    referer: referer
  };
  
  if (!db.clicks[shortCode]) {
    db.clicks[shortCode] = [];
  }
  db.clicks[shortCode].push(click);
  await saveDb(db);
  
  console.log(`✅ Click saved for ${shortCode}`);
  return click;
}

async function getStats(shortCode) {
  const db = await loadDb();
  const url = db.urls[shortCode];
  if (!url) {
    return null;
  }
  
  const clickList = db.clicks[shortCode] || [];
  const lastClickedAt = clickList.length > 0 
    ? clickList[clickList.length - 1].clicked_at 
    : null;
  
  return {
    shortCode: url.short_code,
    originalUrl: url.original_url,
    createdAt: url.created_at,
    clickCount: clickList.length,
    lastClickedAt
  };
}

async function getClickHistory(shortCode, limit = 50, offset = 0) {
  const db = await loadDb();
  const clickList = db.clicks[shortCode] || [];
  return clickList
    .sort((a, b) => new Date(b.clicked_at) - new Date(a.clicked_at))
    .slice(offset, offset + limit);
}

async function getTopUrls(limit = 10) {
  const db = await loadDb();
  const topUrls = [];
  
  for (const [shortCode, clickList] of Object.entries(db.clicks)) {
    const url = db.urls[shortCode];
    if (url) {
      topUrls.push({
        shortCode: url.short_code,
        originalUrl: url.original_url,
        createdAt: url.created_at,
        clickCount: clickList.length,
        lastClickedAt: clickList.length > 0 ? clickList[clickList.length - 1].clicked_at : null
      });
    }
  }
  
  return topUrls
    .sort((a, b) => b.clickCount - a.clickCount)
    .slice(0, limit);
}

module.exports = {
  saveUrl,
  getUrlByCode,
  saveClick,
  getStats,
  getClickHistory,
  getTopUrls
};
