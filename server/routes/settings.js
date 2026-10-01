const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/settings
router.get('/', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/settings
router.put('/', authenticateToken, (req, res) => {
  try {
    const updates = req.body; // { key: value, ... }
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

    for (const [key, value] of Object.entries(updates)) {
      stmt.run(key, String(value));
    }

    return res.json({ success: true, message: 'Ayarlar başarıyla kaydedildi.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
