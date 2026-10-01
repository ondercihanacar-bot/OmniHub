const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { db } = require('../db');
const crypto = require('../crypto');
const { authenticateToken } = require('../middleware/auth');

// Helper to calculate expiry date
function calculateEndDate(startDateStr, type, months = 12, days = 0) {
  if (type === 'lifetime') return null;
  const start = new Date(startDateStr);
  if (days > 0) {
    start.setDate(start.getDate() + days);
  } else {
    start.setMonth(start.getMonth() + parseInt(months, 10));
  }
  return start.toISOString().split('T')[0];
}

// GET /api/licenses - List all licenses with filters
router.get('/', authenticateToken, (req, res) => {
  try {
    const { product_id, status, customer_id, search } = req.query;
    let query = `
      SELECT 
        l.*,
        c.company_name,
        c.contact_name,
        c.phone as customer_phone,
        c.email as customer_email,
        c.city as customer_city,
        p.name as product_name,
        p.code as product_code,
        p.icon as product_icon
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      JOIN products p ON l.product_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (product_id) {
      query += ' AND l.product_id = ?';
      params.push(product_id);
    }
    if (status) {
      query += ' AND l.status = ?';
      params.push(status);
    }
    if (customer_id) {
      query += ' AND l.customer_id = ?';
      params.push(customer_id);
    }
    if (search) {
      query += ' AND (l.license_key LIKE ? OR c.company_name LIKE ? OR c.contact_name LIKE ? OR l.hardware_id LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY l.id DESC';

    const licenses = db.prepare(query).all(...params);

    const formatted = licenses.map(l => {
      // Calculate days remaining
      let daysRemaining = null;
      let isExpired = false;
      if (l.end_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exp = new Date(l.end_date);
        exp.setHours(0, 0, 0, 0);
        const diffTime = exp.getTime() - today.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysRemaining < 0) {
          isExpired = true;
        }
      }

      return {
        ...l,
        enabled_modules: JSON.parse(l.enabled_modules || '[]'),
        days_remaining: daysRemaining,
        is_expired: isExpired
      };
    });

    return res.json({ success: true, licenses: formatted });
  } catch (err) {
    console.error('License list error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/licenses/:id - Single license detail with QR and logs
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const license = db.prepare(`
      SELECT 
        l.*,
        c.company_name,
        c.contact_name,
        c.phone as customer_phone,
        c.email as customer_email,
        c.city as customer_city,
        c.tax_office,
        c.tax_number,
        c.address as customer_address,
        p.name as product_name,
        p.code as product_code,
        p.icon as product_icon,
        p.version as product_version
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      JOIN products p ON l.product_id = p.id
      WHERE l.id = ?
    `).get(req.params.id);

    if (!license) {
      return res.status(404).json({ success: false, error: 'Lisans bulunamadı.' });
    }

    // Generate QR Code for certificate / mobile verification
    const qrPayload = JSON.stringify({
      portal: 'OmniHub License Authority',
      key: license.license_key,
      customer: license.company_name,
      product: license.product_name,
      type: license.license_type,
      expires: license.end_date || 'Lifetime',
      status: license.status,
      signature: (license.payload_signature || '').slice(0, 16)
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#030712',
        light: '#ffffff'
      }
    });

    // Recent heartbeat telemetry logs
    const heartbeatLogs = db.prepare(`
      SELECT * FROM heartbeat_logs 
      WHERE license_id = ? 
      ORDER BY logged_at DESC 
      LIMIT 20
    `).all(req.params.id);

    return res.json({
      success: true,
      license: {
        ...license,
        enabled_modules: JSON.parse(license.enabled_modules || '[]'),
        qr_code: qrDataUrl
      },
      heartbeat_logs: heartbeatLogs
    });
  } catch (err) {
    console.error('License detail error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/licenses/generate - Generate & save a new cryptographic license
router.post('/generate', authenticateToken, (req, res) => {
  try {
    const {
      customer_id,
      product_id,
      license_type, // 'yearly', '2year', '3year', 'monthly', 'lifetime', 'demo'
      duration_months,
      duration_days,
      start_date,
      max_devices,
      max_users,
      enabled_modules,
      hardware_id,
      hwid_lock_enabled,
      notes
    } = req.body;

    if (!customer_id || !product_id || !license_type) {
      return res.status(400).json({ success: false, error: 'Müşteri, ürün ve lisans tipi zorunludur.' });
    }

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customer_id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Seçilen müşteri bulunamadı.' });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Seçilen ürün bulunamadı.' });
    }

    // Determine start date and end date
    const start = start_date || new Date().toISOString().split('T')[0];
    let end = null;
    let months = 12;

    if (license_type === 'yearly') {
      months = 12;
      end = calculateEndDate(start, license_type, 12);
    } else if (license_type === '2year') {
      months = 24;
      end = calculateEndDate(start, license_type, 24);
    } else if (license_type === '3year') {
      months = 36;
      end = calculateEndDate(start, license_type, 36);
    } else if (license_type === 'monthly') {
      months = duration_months ? parseInt(duration_months, 10) : 1;
      end = calculateEndDate(start, license_type, months);
    } else if (license_type === 'demo') {
      const days = duration_days ? parseInt(duration_days, 10) : 15;
      end = calculateEndDate(start, license_type, 0, days);
    } else if (license_type === 'lifetime') {
      end = null;
    }

    // Generate unique cryptographic license key
    let licenseKey = crypto.generateLicenseKey(product.code);
    let attempts = 0;
    while (db.prepare('SELECT id FROM licenses WHERE license_key = ?').get(licenseKey) && attempts < 10) {
      licenseKey = crypto.generateLicenseKey(product.code);
      attempts++;
    }

    const normalizedHwid = hardware_id ? crypto.normalizeHardwareId(hardware_id) : null;
    const modulesJson = JSON.stringify(enabled_modules || []);
    const initialStatus = license_type === 'demo' ? 'demo' : 'active';

    // Create encrypted tamper-proof payload
    const payloadResult = crypto.createLicensePayload({
      license_key: licenseKey,
      customer_id: customer.id,
      customer_name: customer.company_name,
      product_id: product.id,
      product_name: product.name,
      license_type,
      start_date: start,
      end_date: end,
      max_devices: max_devices || 1,
      max_users: max_users || 50,
      enabled_modules: enabled_modules || [],
      hardware_id: normalizedHwid
    });

    const stmt = db.prepare(`
      INSERT INTO licenses (
        license_key, customer_id, product_id, license_type, duration_months,
        status, start_date, end_date, max_devices, max_users, enabled_modules,
        hardware_id, hwid_lock_enabled, notes, payload_signature, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
    `);

    const result = stmt.run(
      licenseKey,
      customer.id,
      product.id,
      license_type,
      months,
      initialStatus,
      start,
      end,
      max_devices || 1,
      max_users || 50,
      modulesJson,
      normalizedHwid,
      hwid_lock_enabled !== false ? 1 : 0,
      notes || null,
      payloadResult.signature
    );

    const createdLicense = db.prepare('SELECT * FROM licenses WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      license: {
        ...createdLicense,
        enabled_modules: JSON.parse(createdLicense.enabled_modules || '[]'),
        customer_name: customer.company_name,
        product_name: product.name,
        encoded_blob: payloadResult.encodedBlob
      }
    });
  } catch (err) {
    console.error('Generate license error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/licenses/:id/status - Toggle status (active, suspended, expired, revoked, demo)
router.put('/:id/status', authenticateToken, (req, res) => {
  try {
    const { status, notes } = req.body;
    const allowed = ['active', 'suspended', 'expired', 'revoked', 'demo'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Geçersiz lisans durumu.' });
    }

    const current = db.prepare('SELECT * FROM licenses WHERE id = ?').get(req.params.id);
    if (!current) {
      return res.status(404).json({ success: false, error: 'Lisans bulunamadı.' });
    }

    let appendNote = current.notes || '';
    if (notes) {
      appendNote = appendNote ? `${appendNote} | ${notes}` : notes;
    }

    db.prepare(`
      UPDATE licenses 
      SET status = ?, notes = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(status, appendNote, req.params.id);

    return res.json({ success: true, message: `Lisans durumu '${status}' olarak güncellendi.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/licenses/:id/renew - Extend license expiration
router.post('/:id/renew', authenticateToken, (req, res) => {
  try {
    const { additional_months = 12, additional_days = 0 } = req.body;
    const license = db.prepare('SELECT * FROM licenses WHERE id = ?').get(req.params.id);
    if (!license) {
      return res.status(404).json({ success: false, error: 'Lisans bulunamadı.' });
    }

    // Base date for extension: if already expired, extend from today. If still active, extend from current end_date.
    let baseDate = new Date();
    if (license.end_date) {
      const currentEnd = new Date(license.end_date);
      if (currentEnd > baseDate) {
        baseDate = currentEnd;
      }
    }

    if (additional_days > 0) {
      baseDate.setDate(baseDate.getDate() + parseInt(additional_days, 10));
    } else {
      baseDate.setMonth(baseDate.getMonth() + parseInt(additional_months, 10));
    }

    const newEndDate = baseDate.toISOString().split('T')[0];

    db.prepare(`
      UPDATE licenses 
      SET end_date = ?, status = 'active', updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(newEndDate, req.params.id);

    return res.json({
      success: true,
      message: `Lisans ${newEndDate} tarihine kadar başarıyla uzatıldı ve aktifleştirildi.`,
      new_end_date: newEndDate
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/licenses/:id/reset-hwid - Clear HWID lock
router.post('/:id/reset-hwid', authenticateToken, (req, res) => {
  try {
    const result = db.prepare(`
      UPDATE licenses 
      SET hardware_id = NULL, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Lisans bulunamadı.' });
    }

    return res.json({
      success: true,
      message: 'Donanım kilidi başarıyla sıfırlandı. Müşteri bir sonraki başlatmada yeni donanımına kilitlenecektir.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/licenses/:id - Delete license
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM licenses WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Lisans bulunamadı.' });
    }
    return res.json({ success: true, message: 'Lisans kaydı başarıyla silindi.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/licenses/:id/export - Download offline cryptographically signed license file
router.get('/:id/export', authenticateToken, (req, res) => {
  try {
    const license = db.prepare(`
      SELECT l.*, c.company_name, c.tax_number, p.name as product_name
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      JOIN products p ON l.product_id = p.id
      WHERE l.id = ?
    `).get(req.params.id);

    if (!license) {
      return res.status(404).json({ success: false, error: 'Lisans bulunamadı.' });
    }

    const payloadResult = crypto.createLicensePayload({
      license_key: license.license_key,
      customer_id: license.customer_id,
      customer_name: license.company_name,
      product_id: license.product_id,
      product_name: license.product_name,
      license_type: license.license_type,
      start_date: license.start_date,
      end_date: license.end_date,
      max_devices: license.max_devices,
      max_users: license.max_users,
      enabled_modules: JSON.parse(license.enabled_modules || '[]'),
      hardware_id: license.hardware_id
    });

    res.setHeader('Content-Disposition', `attachment; filename="${license.license_key}.omnilicense"`);
    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify(payloadResult, null, 2));
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
