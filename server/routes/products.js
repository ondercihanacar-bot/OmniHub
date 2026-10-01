const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/products - Get all supported products
router.get('/', authenticateToken, (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY name ASC').all();
    const formatted = products.map(p => ({
      ...p,
      available_modules: JSON.parse(p.available_modules || '[]'),
      default_quotas: JSON.parse(p.default_quotas || '{}')
    }));
    return res.json({ success: true, products: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/products/:id - Update product modules/version
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { name, description, version, available_modules, is_active } = req.body;
    db.prepare(`
      UPDATE products 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          version = COALESCE(?, version),
          available_modules = COALESCE(?, available_modules),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(
      name || null,
      description || null,
      version || null,
      available_modules ? JSON.stringify(available_modules) : null,
      is_active !== undefined ? is_active : null,
      req.params.id
    );

    return res.json({ success: true, message: 'Ürün bilgileri güncellendi.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
