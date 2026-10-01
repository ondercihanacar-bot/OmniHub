const express = require('express');
const router = express.Router();
const { db } = require('../db');
const crypto = require('../crypto');

// Helper to get client IP
function getClientIp(req) {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
}

// POST /api/v1/license/activate - First-time activation & HWID lock
router.post('/activate', (req, res) => {
  try {
    const { license_key, hardware_id, client_version, hostname } = req.body;
    const clientIp = getClientIp(req);

    if (!license_key) {
      return res.status(400).json({ valid: false, error: 'Lisans anahtarı gereklidir.' });
    }

    const license = db.prepare(`
      SELECT l.*, c.company_name, c.tax_number, p.name as product_name, p.code as product_code
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      JOIN products p ON l.product_id = p.id
      WHERE l.license_key = ?
    `).get(license_key.trim());

    if (!license) {
      return res.status(404).json({ valid: false, error: 'Geçersiz lisans anahtarı. OmniHub üzerinde kayıt bulunamadı.' });
    }

    // Check expiration
    if (license.end_date) {
      const today = new Date().toISOString().split('T')[0];
      if (license.end_date < today) {
        db.prepare("UPDATE licenses SET status = 'expired' WHERE id = ?").run(license.id);
        return res.status(403).json({
          valid: false,
          status: 'expired',
          error: `Lisans süreniz ${license.end_date} tarihinde dolmuştur.`
        });
      }
    }

    // Check suspension / revocation
    if (license.status === 'suspended') {
      return res.status(403).json({
        valid: false,
        status: 'suspended',
        error: 'Lisansınız merkez tarafından askıya alınmıştır/dondurulmuştur.'
      });
    }
    if (license.status === 'revoked') {
      return res.status(403).json({
        valid: false,
        status: 'revoked',
        error: 'Lisansınız feshedilmiştir.'
      });
    }

    const normHwid = crypto.normalizeHardwareId(hardware_id);

    // Hardware lock enforcement
    if (license.hwid_lock_enabled) {
      if (!normHwid) {
        return res.status(400).json({
          valid: false,
          error: 'Bu lisans donanım kilidi gerektirmektedir. Lütfen sunucu donanım kimliği (HWID) gönderin.'
        });
      }

      if (license.hardware_id && crypto.normalizeHardwareId(license.hardware_id) !== normHwid) {
        // HWID mismatch!
        return res.status(403).json({
          valid: false,
          status: 'hwid_mismatch',
          error: 'Donanım uyuşmazlığı tespit edildi! Bu lisans farklı bir fiziksel sunucuya mühürlenmiştir.'
        });
      }

      // First time binding HWID
      if (!license.hardware_id) {
        db.prepare('UPDATE licenses SET hardware_id = ? WHERE id = ?').run(normHwid, license.id);
      }
    }

    // Mark activated
    db.prepare(`
      UPDATE licenses 
      SET last_heartbeat = datetime('now', 'localtime'),
          last_ip = ?,
          last_client_version = ?,
          activation_date = COALESCE(activation_date, datetime('now', 'localtime')),
          updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(clientIp, client_version || '1.0.0', license.id);

    // Create encrypted payload response
    const payload = crypto.createLicensePayload({
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
      hardware_id: normHwid || license.hardware_id
    });

    return res.json({
      valid: true,
      message: 'Aktivasyon başarılı. OmniHub merkezi tarafından onaylandı.',
      status: license.status,
      license_key: license.license_key,
      customer_name: license.company_name,
      product_name: license.product_name,
      end_date: license.end_date,
      max_devices: license.max_devices,
      max_users: license.max_users,
      enabled_modules: JSON.parse(license.enabled_modules || '[]'),
      token: payload.encodedBlob
    });
  } catch (err) {
    console.error('Activate API error:', err);
    return res.status(500).json({ valid: false, error: 'Aktivasyon sunucu hatası.' });
  }
});

// POST /api/v1/license/heartbeat - Periodic online signal & remote control
router.post('/heartbeat', (req, res) => {
  try {
    const {
      license_key,
      hardware_id,
      client_version,
      device_count = 0,
      active_users = 0,
      uptime_seconds = 0,
      details
    } = req.body;

    const clientIp = getClientIp(req);

    if (!license_key) {
      return res.status(400).json({ valid: false, error: 'Lisans anahtarı belirtilmedi.' });
    }

    const license = db.prepare(`
      SELECT l.*, c.company_name, p.name as product_name
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      JOIN products p ON l.product_id = p.id
      WHERE l.license_key = ?
    `).get(license_key.trim());

    if (!license) {
      return res.status(404).json({
        valid: false,
        status: 'not_found',
        error: 'Lisans bulunamadı veya silinmiş.'
      });
    }

    const normHwid = crypto.normalizeHardwareId(hardware_id);

    // 1. Check HWID
    if (license.hwid_lock_enabled && license.hardware_id) {
      if (crypto.normalizeHardwareId(license.hardware_id) !== normHwid) {
        db.prepare(`
          INSERT INTO heartbeat_logs (license_id, license_key, ip_address, hardware_id, client_version, device_count, active_users, uptime_seconds, status_returned, details)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(license.id, license.license_key, clientIp, normHwid, client_version, device_count, active_users, uptime_seconds, 'hwid_mismatch', 'HWID uyuşmazlığı nedeniyle reddedildi');

        return res.status(403).json({
          valid: false,
          status: 'hwid_mismatch',
          error: 'Donanım uyuşmazlığı tespit edildi. Lisans bu donanıma ait değil.'
        });
      }
    }

    // 2. Check Expiration
    if (license.end_date) {
      const today = new Date().toISOString().split('T')[0];
      if (license.end_date < today) {
        db.prepare("UPDATE licenses SET status = 'expired' WHERE id = ?").run(license.id);

        db.prepare(`
          INSERT INTO heartbeat_logs (license_id, license_key, ip_address, hardware_id, client_version, device_count, active_users, uptime_seconds, status_returned, details)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(license.id, license.license_key, clientIp, normHwid, client_version, device_count, active_users, uptime_seconds, 'expired', 'Süre doldu');

        return res.status(403).json({
          valid: false,
          status: 'expired',
          error: `Lisans süreniz ${license.end_date} tarihinde sona ermiştir. Lütfen OmniHub yöneticisiyle iletişime geçin.`
        });
      }
    }

    // 3. Check Suspended
    if (license.status === 'suspended') {
      db.prepare(`
        INSERT INTO heartbeat_logs (license_id, license_key, ip_address, hardware_id, client_version, device_count, active_users, uptime_seconds, status_returned, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(license.id, license.license_key, clientIp, normHwid, client_version, device_count, active_users, uptime_seconds, 'suspended', 'Donduruldu');

      return res.status(403).json({
        valid: false,
        status: 'suspended',
        error: 'Lisansınız merkez tarafından askıya alınmıştır (ödeme veya idari nedenlerle). Uygulama servisleri durduruldu.'
      });
    }

    // 4. Check Revoked
    if (license.status === 'revoked') {
      db.prepare(`
        INSERT INTO heartbeat_logs (license_id, license_key, ip_address, hardware_id, client_version, device_count, active_users, uptime_seconds, status_returned, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(license.id, license.license_key, clientIp, normHwid, client_version, device_count, active_users, uptime_seconds, 'revoked', 'Feshedildi');

      return res.status(403).json({
        valid: false,
        status: 'revoked',
        error: 'Lisansınız kalıcı olarak iptal edilmiştir.'
      });
    }

    // Heartbeat OK - update telemetry
    db.prepare(`
      UPDATE licenses 
      SET last_heartbeat = datetime('now', 'localtime'),
          last_ip = ?,
          last_client_version = ?,
          updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(clientIp, client_version || license.last_client_version, license.id);

    db.prepare(`
      INSERT INTO heartbeat_logs (license_id, license_key, ip_address, hardware_id, client_version, device_count, active_users, uptime_seconds, status_returned, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      license.id,
      license.license_key,
      clientIp,
      normHwid,
      client_version,
      device_count,
      active_users,
      uptime_seconds,
      license.status,
      typeof details === 'object' ? JSON.stringify(details) : (details || 'OK')
    );

    // Days remaining
    let daysRemaining = null;
    if (license.end_date) {
      const today = new Date();
      const exp = new Date(license.end_date);
      daysRemaining = Math.max(0, Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    }

    return res.json({
      valid: true,
      status: license.status,
      product: license.product_name,
      customer: license.company_name,
      end_date: license.end_date,
      days_remaining: daysRemaining,
      max_devices: license.max_devices,
      max_users: license.max_users,
      enabled_modules: JSON.parse(license.enabled_modules || '[]'),
      sync_interval_hours: 24,
      message: 'OmniHub Sinyali Doğrulandı: Sistem Aktif.'
    });
  } catch (err) {
    console.error('Heartbeat API error:', err);
    return res.status(500).json({ valid: false, error: 'Heartbeat işlenirken sunucu hatası.' });
  }
});

// POST /api/v1/license/verify - Quick verify endpoint
router.post('/verify', (req, res) => {
  try {
    const { license_key } = req.body;
    if (!license_key) {
      return res.status(400).json({ valid: false, error: 'Lisans anahtarı gereklidir.' });
    }

    const license = db.prepare(`
      SELECT l.license_key, l.status, l.end_date, l.max_devices, l.max_users, l.enabled_modules,
             c.company_name, p.name as product_name
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      JOIN products p ON l.product_id = p.id
      WHERE l.license_key = ?
    `).get(license_key.trim());

    if (!license) {
      return res.status(404).json({ valid: false, error: 'Lisans anahtarı geçersiz' });
    }

    return res.json({
      valid: license.status === 'active' || license.status === 'demo',
      status: license.status,
      product: license.product_name,
      customer: license.company_name,
      end_date: license.end_date,
      enabled_modules: JSON.parse(license.enabled_modules || '[]')
    });
  } catch (err) {
    return res.status(500).json({ valid: false, error: err.message });
  }
});

module.exports = router;
