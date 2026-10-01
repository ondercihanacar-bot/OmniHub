const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', authenticateToken, (req, res) => {
  try {
    // 1. Summary counters
    const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
    const totalLicenses = db.prepare('SELECT COUNT(*) as count FROM licenses').get().count;
    const activeLicenses = db.prepare("SELECT COUNT(*) as count FROM licenses WHERE status = 'active'").get().count;
    const suspendedLicenses = db.prepare("SELECT COUNT(*) as count FROM licenses WHERE status = 'suspended'").get().count;
    const expiredLicenses = db.prepare("SELECT COUNT(*) as count FROM licenses WHERE status = 'expired'").get().count;
    const demoLicenses = db.prepare("SELECT COUNT(*) as count FROM licenses WHERE status = 'demo'").get().count;

    // 2. Product breakdown
    const productStats = db.prepare(`
      SELECT 
        p.id,
        p.name,
        p.code,
        COUNT(l.id) as total_count,
        SUM(CASE WHEN l.status = 'active' THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN l.status = 'demo' THEN 1 ELSE 0 END) as demo_count
      FROM products p
      LEFT JOIN licenses l ON p.id = l.product_id
      GROUP BY p.id
    `).all();

    // 3. Upcoming renewals (within 30 days)
    const today = new Date().toISOString().split('T')[0];
    const in30Days = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

    const upcomingRenewals = db.prepare(`
      SELECT 
        l.id,
        l.license_key,
        l.product_id,
        l.license_type,
        l.status,
        l.end_date,
        c.id as customer_id,
        c.company_name,
        c.contact_name,
        c.phone as customer_phone,
        c.email as customer_email,
        p.name as product_name,
        p.code as product_code
      FROM licenses l
      JOIN customers c ON l.customer_id = c.id
      JOIN products p ON l.product_id = p.id
      WHERE l.end_date IS NOT NULL 
        AND l.end_date >= ? 
        AND l.end_date <= ?
        AND l.status != 'revoked'
      ORDER BY l.end_date ASC
    `).all(today, in30Days);

    const formattedRenewals = upcomingRenewals.map(item => {
      const todayDate = new Date();
      todayDate.setHours(0,0,0,0);
      const expDate = new Date(item.end_date);
      expDate.setHours(0,0,0,0);
      const daysLeft = Math.ceil((expDate.getTime() - todayDate.getTime()) / (1000 * 3600 * 24));
      
      let urgency = 'normal'; // 16-30 days
      if (daysLeft <= 7) urgency = 'critical'; // <= 7 days
      else if (daysLeft <= 15) urgency = 'warning'; // 8-15 days

      return {
        ...item,
        days_left: daysLeft,
        urgency
      };
    });

    // 4. Live Heartbeat Telemetry (recent 10 logs)
    const recentHeartbeats = db.prepare(`
      SELECT 
        h.*,
        c.company_name,
        p.name as product_name
      FROM heartbeat_logs h
      LEFT JOIN licenses l ON h.license_id = l.id
      LEFT JOIN customers c ON l.customer_id = c.id
      LEFT JOIN products p ON l.product_id = p.id
      ORDER BY h.logged_at DESC
      LIMIT 10
    `).all();

    return res.json({
      success: true,
      stats: {
        customers: customerCount,
        licenses: {
          total: totalLicenses,
          active: activeLicenses,
          suspended: suspendedLicenses,
          expired: expiredLicenses,
          demo: demoLicenses
        },
        productStats,
        upcomingRenewals: formattedRenewals,
        recentHeartbeats
      }
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
