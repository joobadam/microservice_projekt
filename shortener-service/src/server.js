const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { generateShortCode } = require('./utils/shortCodeGenerator');
const { validateUrl } = require('./utils/urlValidator');
const { connectDB, saveUrl, getUrlByCode } = require('./database/mock-db');
const { connectRedis, setCache, getCache } = require('./cache/mock-redis');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'URL Shortener Service',
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.end('# HELP url_shortener_requests_total Total number of URL shortening requests\n' +
          '# TYPE url_shortener_requests_total counter\n' +
          'url_shortener_requests_total ' + (global.requestCount || 0) + '\n');
});

app.post('/api/shorten', async (req, res) => {
  try {
    const { url } = req.body;

    const validation = validateUrl(url);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: validation.error 
      });
    }

    const existingUrl = await getUrlByCode(null, url);
    if (existingUrl) {
      const shortUrl = `${process.env.BASE_URL || 'http://localhost:5001'}/${existingUrl.short_code}`;
      return res.json({ 
        shortUrl,
        originalUrl: url,
        shortCode: existingUrl.short_code,
        createdAt: existingUrl.created_at
      });
    }

    let shortCode;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      shortCode = generateShortCode();
      attempts++;
      
      if (attempts > maxAttempts) {
        return res.status(500).json({ 
          error: 'Nem sikerült egyedi rövid kódot generálni' 
        });
      }
    } while (await getUrlByCode(shortCode));

    const savedUrl = await saveUrl(shortCode, url);
    
    await setCache(shortCode, url, 3600);

    const shortUrl = `${process.env.BASE_URL || 'http://localhost:5001'}/${shortCode}`;
    
    global.requestCount = (global.requestCount || 0) + 1;

    res.json({
      shortUrl,
      originalUrl: url,
      shortCode,
      createdAt: savedUrl.created_at
    });

  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ 
      error: 'Belső szerver hiba történt' 
    });
  }
});

app.get('/api/url/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    const cachedUrl = await getCache(shortCode);
    if (cachedUrl) {
      return res.json({
        shortCode,
        originalUrl: cachedUrl,
        source: 'cache'
      });
    }

    const urlData = await getUrlByCode(shortCode);
    if (!urlData) {
      return res.status(404).json({ 
        error: 'Rövid URL nem található' 
      });
    }

    await setCache(shortCode, urlData.original_url, 3600);

    res.json({
      shortCode,
      originalUrl: urlData.original_url,
      createdAt: urlData.created_at,
      source: 'database'
    });

  } catch (error) {
    console.error('Error getting URL:', error);
    res.status(500).json({ 
      error: 'Belső szerver hiba történt' 
    });
  }
});

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

    global.requestCount = 0;

    app.listen(PORT, () => {
      console.log(`🚀 URL Shortener Service running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
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
