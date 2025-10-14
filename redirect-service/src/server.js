const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

const { isValidShortCode } = require('./utils/shortCodeValidator');
const { connectDB, getUrlByCode } = require('./database/mock-db');
const { connectRedis, getCache, setCache } = require('./cache/mock-redis');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'URL Redirect Service',
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.end('# HELP url_redirect_requests_total Total number of redirect requests\n' +
          '# TYPE url_redirect_requests_total counter\n' +
          'url_redirect_requests_total ' + (global.redirectCount || 0) + '\n' +
          '# HELP url_redirect_cache_hits_total Total number of cache hits\n' +
          '# TYPE url_redirect_cache_hits_total counter\n' +
          'url_redirect_cache_hits_total ' + (global.cacheHits || 0) + '\n');
});

app.get('/r/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    if (!isValidShortCode(shortCode)) {
      return res.status(400).json({ 
        error: 'Érvénytelen rövid kód formátum' 
      });
    }

    let originalUrl = null;
    let source = '';

    const cachedUrl = await getCache(shortCode);
    if (cachedUrl) {
      originalUrl = cachedUrl;
      source = 'cache';
      global.cacheHits = (global.cacheHits || 0) + 1;
    } else {
      const urlData = await getUrlByCode(shortCode);
      if (urlData) {
        originalUrl = urlData.original_url;
        source = 'database';
        await setCache(shortCode, originalUrl, 3600);
      } else {
        // Fallback: ask shortener-service over HTTP so services don't need shared storage
        try {
          const shortenerUrl = process.env.SHORTENER_SERVICE_URL || 'http://shortener-service:5000';
          const resp = await axios.get(`${shortenerUrl}/api/url/${shortCode}`, { timeout: 2000 });
          if (resp?.data?.originalUrl) {
            originalUrl = resp.data.originalUrl;
            source = 'shortener-api';
            await setCache(shortCode, originalUrl, 3600);
          }
        } catch (apiErr) {
          // ignore; will return 404 below
        }
      }
    }

    if (!originalUrl) {
      return res.status(404).json({ 
        error: 'Rövid URL nem található' 
      });
    }

    trackClick(shortCode, req).catch(error => {
      console.error('Analytics tracking failed:', error);
    });

    global.redirectCount = (global.redirectCount || 0) + 1;

    const redirectType = process.env.REDIRECT_TYPE || '302';
    const statusCode = redirectType === '301' ? 301 : 302;
    
    res.redirect(statusCode, originalUrl);

  } catch (error) {
    console.error('Error handling redirect:', error);
    res.status(500).json({ 
      error: 'Belső szerver hiba történt' 
    });
  }
});

/**
 * Kattintás rögzítése az Analytics service-ben
 * @param {string} shortCode - Rövid kód
 * @param {object} req - Express request objektum
 */
async function trackClick(shortCode, req) {
  try {
    const analyticsUrl = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:5002';
    
    const clickData = {
      shortCode,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString(),
      referer: req.get('Referer')
    };

    const response = await axios.post(`${analyticsUrl}/api/track`, clickData, {
      timeout: 2000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Click tracked for ${shortCode}:`, response.status);
  } catch (error) {
    console.warn(`⚠️ Failed to track click for ${shortCode}:`, error.message);
  }
}

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Belső szerver hiba történt' 
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint nem található' 
  });
});

async function startServer() {
  try {
    await connectDB();
    console.log('✅ Database connected');

    await connectRedis();
    console.log('✅ Redis connected');

    global.redirectCount = 0;
    global.cacheHits = 0;

    app.listen(PORT, () => {
      console.log(`🚀 URL Redirect Service running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
      console.log(`🔗 Redirect example: http://localhost:${PORT}/abc123`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
