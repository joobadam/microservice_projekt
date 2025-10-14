const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { validateClickData } = require('./utils/clickValidator');
const { connectDB, saveClick, getStats, getClickHistory, getTopUrls } = require('./database/mock-db');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'URL Analytics Service',
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.end('# HELP analytics_clicks_total Total number of tracked clicks\n' +
          '# TYPE analytics_clicks_total counter\n' +
          'analytics_clicks_total ' + (global.clickCount || 0) + '\n' +
          '# HELP analytics_requests_total Total number of analytics requests\n' +
          '# TYPE analytics_requests_total counter\n' +
          'analytics_requests_total ' + (global.requestCount || 0) + '\n');
});

app.post('/api/track', async (req, res) => {
  try {
    const clickData = req.body;

    const validation = validateClickData(clickData);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: validation.error 
      });
    }

    const savedClick = await saveClick(
      clickData.shortCode,
      clickData.userAgent,
      clickData.ipAddress,
      clickData.referer
    );

    global.clickCount = (global.clickCount || 0) + 1;

    res.status(201).json({
      success: true,
      clickId: savedClick.id,
      shortCode: clickData.shortCode,
      timestamp: savedClick.clicked_at
    });

  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ 
      error: 'Belső szerver hiba történt' 
    });
  }
});

app.get('/api/stats/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    if (!shortCode || shortCode.length !== 6) {
      return res.status(400).json({ 
        error: 'Érvénytelen rövid kód formátum' 
      });
    }

    let stats = await getStats(shortCode);
    // Fallback: if not present locally, verify existence via shortener-service
    if (!stats) {
      try {
        const shortenerUrl = process.env.SHORTENER_SERVICE_URL || 'http://shortener-service:5000';
        const resp = await fetch(`${shortenerUrl}/api/url/${shortCode}`, { method: 'GET', timeout: 2000 });
        if (resp.ok) {
          const data = await resp.json();
          stats = {
            shortCode: shortCode,
            originalUrl: data.originalUrl,
            createdAt: data.createdAt || new Date().toISOString(),
            clickCount: 0,
            lastClickedAt: null
          };
        }
      } catch (_) {
        // ignore fallback error
      }
    }
    if (!stats) {
      return res.status(404).json({ error: 'Rövid URL nem található' });
    }

    global.requestCount = (global.requestCount || 0) + 1;

    res.json({
      shortCode: stats.shortCode,
      originalUrl: stats.originalUrl,
      createdAt: stats.createdAt,
      clickCount: stats.clickCount,
      lastClickedAt: stats.lastClickedAt
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ 
      error: 'Belső szerver hiba történt' 
    });
  }
});

app.get('/api/history/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    if (!shortCode || shortCode.length !== 6) {
      return res.status(400).json({ 
        error: 'Érvénytelen rövid kód formátum' 
      });
    }

    const history = await getClickHistory(shortCode, parseInt(limit), parseInt(offset));

    res.json({
      shortCode,
      clicks: history,
      total: history.length
    });

  } catch (error) {
    console.error('Error getting click history:', error);
    res.status(500).json({ 
      error: 'Belső szerver hiba történt' 
    });
  }
});

app.get('/api/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topUrls = await getTopUrls(parseInt(limit));

    res.json({
      topUrls,
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('Error getting top URLs:', error);
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

    global.clickCount = 0;
    global.requestCount = 0;

    app.listen(PORT, () => {
      console.log(`🚀 URL Analytics Service running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
      console.log(`📊 Stats example: http://localhost:${PORT}/api/stats/abc123`);
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
