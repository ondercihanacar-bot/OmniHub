const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Initialize database schema and migrations
require('./db');

const app = express();
const PORT = process.env.PORT || 5200;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api/v1/license')) {
    console.log(`[CLIENT-API] ${req.method} ${req.path} from ${req.ip}`);
  }
  next();
});

// Health check & Version Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'OmniHub',
    version: '1.0.0',
    developer: 'Designed & Developed by Önder Cihan ACAR © 2026. All Rights Reserved.',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/licenses', require('./routes/licenses'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/products', require('./routes/products'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/v1/license', require('./routes/clientApi'));

// Static Client Serving (Production Build)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    // If not API route, serve index.html
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'Endpoint bulunamadı' });
    }
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'Sunucu tarafında beklenmeyen bir hata oluştu: ' + (err.message || err)
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`================================================================`);
  console.log(`   OmniHub - Merkezi Dağıtıcı ve Lisans Yönetim Portalı         `);
  console.log(`   Designed & Developed by Önder Cihan ACAR © 2026              `);
  console.log(`================================================================`);
  console.log(`   Port        : http://0.0.0.0:${PORT}                         `);
  console.log(`   API Endpoint: http://0.0.0.0:${PORT}/api                     `);
  console.log(`   Heartbeat   : http://0.0.0.0:${PORT}/api/v1/license/heartbeat`);
  console.log(`================================================================`);

  // 24/7 Keep-Alive Heartbeat (Render Sleep Prevention)
  const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes (Render spins down after 15 min inactivity)
  const PUBLIC_URL = process.env.RENDER_EXTERNAL_URL || 'https://omnihub-sd23.onrender.com';
  
  setInterval(async () => {
    try {
      const res = await fetch(`${PUBLIC_URL}/api/health`);
      if (res.ok) {
        console.log(`[KEEP-ALIVE] Heartbeat sent to ${PUBLIC_URL}/api/health - Status: 200 OK`);
      }
    } catch (e) {
      console.log(`[KEEP-ALIVE] Heartbeat ping notice:`, e.message);
    }
  }, PING_INTERVAL);
});
