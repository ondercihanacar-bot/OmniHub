const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/customers - List all customers with license count summaries
router.get('/', authenticateToken, (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const customers = db.prepare(`
      SELECT 
        c.*,
        COUNT(l.id) as total_licenses,
        SUM(CASE WHEN l.status = 'active' THEN 1 ELSE 0 END) as active_licenses,
        SUM(CASE WHEN l.status = 'suspended' THEN 1 ELSE 0 END) as suspended_licenses,
        SUM(CASE WHEN l.status = 'demo' THEN 1 ELSE 0 END) as demo_licenses
      FROM customers c
      LEFT JOIN licenses l ON c.id = l.customer_id
      WHERE c.company_name LIKE ? OR c.contact_name LIKE ? OR c.city LIKE ? OR c.email LIKE ? OR c.phone LIKE ?
      GROUP BY c.id
      ORDER BY c.company_name ASC
    `).all(search, search, search, search, search);

    return res.json({ success: true, customers });
  } catch (err) {
    console.error('Customer fetch error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/customers/:id - Detail with customer's licenses
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Müşteri bulunamadı.' });
    }

    const licenses = db.prepare(`
      SELECT l.*, p.name as product_name, p.code as product_code, p.icon as product_icon
      FROM licenses l
      JOIN products p ON l.product_id = p.id
      WHERE l.customer_id = ?
      ORDER BY l.created_at DESC
    `).all(req.params.id);

    return res.json({
      success: true,
      customer,
      licenses: licenses.map(l => ({
        ...l,
        enabled_modules: JSON.parse(l.enabled_modules || '[]')
      }))
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/customers - Create new customer
router.post('/', authenticateToken, (req, res) => {
  try {
    const { company_name, contact_name, phone, email, city, tax_office, tax_number, address, notes } = req.body;
    
    if (!company_name || !contact_name) {
      return res.status(400).json({ success: false, error: 'Firma adı ve yetkili kişi zorunludur.' });
    }

    const stmt = db.prepare(`
      INSERT INTO customers (company_name, contact_name, phone, email, city, tax_office, tax_number, address, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
    `);

    const result = stmt.run(
      company_name.trim(),
      contact_name.trim(),
      phone || null,
      email || null,
      city || null,
      tax_office || null,
      tax_number || null,
      address || null,
      notes || null
    );

    const newCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ success: true, customer: newCustomer });
  } catch (err) {
    console.error('Customer create error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { company_name, contact_name, phone, email, city, tax_office, tax_number, address, notes } = req.body;

    if (!company_name || !contact_name) {
      return res.status(400).json({ success: false, error: 'Firma adı ve yetkili kişi zorunludur.' });
    }

    const stmt = db.prepare(`
      UPDATE customers 
      SET company_name = ?, contact_name = ?, phone = ?, email = ?, city = ?, 
          tax_office = ?, tax_number = ?, address = ?, notes = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `);

    const result = stmt.run(
      company_name.trim(),
      contact_name.trim(),
      phone || null,
      email || null,
      city || null,
      tax_office || null,
      tax_number || null,
      address || null,
      notes || null,
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Müşteri bulunamadı.' });
    }

    const updatedCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    return res.json({ success: true, customer: updatedCustomer });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const checkLicenses = db.prepare('SELECT COUNT(*) as count FROM licenses WHERE customer_id = ?').get(req.params.id);
    if (checkLicenses.count > 0) {
      return res.status(400).json({
        success: false,
        error: `Bu müşteriye ait ${checkLicenses.count} adet lisans bulunmaktadır. Lütfen önce lisansları silin veya arşivleyin.`
      });
    }

    const result = db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Müşteri bulunamadı.' });
    }

    return res.json({ success: true, message: 'Müşteri başarıyla silindi.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
