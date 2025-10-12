// Shared mock database for all services
const urls = new Map();
const clicks = new Map();

let urlIdCounter = 1;
let clickIdCounter = 1;

function saveUrl(shortCode, originalUrl) {
  const url = {
    id: urlIdCounter++,
    short_code: shortCode,
    original_url: originalUrl,
    created_at: new Date().toISOString()
  };
  
  urls.set(shortCode, url);
  console.log(`✅ URL saved: ${shortCode} -> ${originalUrl}`);
  return url;
}

function getUrlByCode(shortCode, originalUrl = null) {
  if (originalUrl) {
    // Find by original URL
    for (const [code, url] of urls.entries()) {
      if (url.original_url === originalUrl) {
        return url;
      }
    }
    return null;
  }
  
  return urls.get(shortCode) || null;
}

function saveClick(shortCode, userAgent = null, ipAddress = null, referer = null) {
  const click = {
    id: clickIdCounter++,
    short_code: shortCode,
    clicked_at: new Date().toISOString(),
    user_agent: userAgent,
    ip_address: ipAddress,
    referer: referer
  };
  
  if (!clicks.has(shortCode)) {
    clicks.set(shortCode, []);
  }
  clicks.get(shortCode).push(click);
  
  console.log(`✅ Click saved for ${shortCode}`);
  return click;
}

function getStats(shortCode) {
  const url = urls.get(shortCode);
  if (!url) {
    return null;
  }
  
  const clickList = clicks.get(shortCode) || [];
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

function getAllUrls() {
  return urls;
}

function getClickHistory(shortCode, limit = 50, offset = 0) {
  const clickList = clicks.get(shortCode) || [];
  return clickList
    .sort((a, b) => new Date(b.clicked_at) - new Date(a.clicked_at))
    .slice(offset, offset + limit);
}

function getTopUrls(limit = 10) {
  const topUrls = [];
  
  for (const [shortCode, clickList] of clicks.entries()) {
    const url = urls.get(shortCode);
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
  getTopUrls,
  getAllUrls
};
