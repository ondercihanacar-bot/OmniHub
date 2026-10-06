const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const crypto = require('./crypto');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'omnihub.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for high performance & integrity
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      city TEXT,
      tax_office TEXT,
      tax_number TEXT,
      address TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      version TEXT DEFAULT '1.0.0',
      available_modules TEXT DEFAULT '[]',
      default_quotas TEXT DEFAULT '{}',
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_key TEXT UNIQUE NOT NULL,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      license_type TEXT NOT NULL, -- yearly, multi_year, monthly, lifetime, demo
      duration_months INTEGER DEFAULT 12,
      status TEXT NOT NULL DEFAULT 'active', -- active, suspended, expired, demo, revoked
      start_date TEXT NOT NULL,
      end_date TEXT,
      max_devices INTEGER DEFAULT 1,
      max_users INTEGER DEFAULT 50,
      enabled_modules TEXT DEFAULT '[]',
      hardware_id TEXT,
      hwid_lock_enabled INTEGER DEFAULT 1,
      last_heartbeat TEXT,
      last_ip TEXT,
      last_client_version TEXT,
      activation_date TEXT,
      notes TEXT,
      payload_signature TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS heartbeat_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_id INTEGER NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
      license_key TEXT NOT NULL,
      ip_address TEXT,
      hardware_id TEXT,
      client_version TEXT,
      device_count INTEGER DEFAULT 0,
      active_users INTEGER DEFAULT 0,
      uptime_seconds INTEGER DEFAULT 0,
      status_returned TEXT,
      details TEXT,
      logged_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  seedData();
}

function seedData() {
  // 1. Seed Admin User if not exists
  const checkUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!checkUser) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin123', salt);
    db.prepare(`
      INSERT INTO users (username, password, name, role) 
      VALUES (?, ?, ?, ?)
    `).run('admin', hash, 'Önder Cihan ACAR', 'admin');
  }

  // 2. Seed Default Products: OMNIFlow & OmniSpot
  const omniflowModules = JSON.stringify([
    'Network Monitor',
    'Syslog Server',
    'SNMP Manager',
    'Topology Map',
    'Auto Backup',
    'Alert Center',
    'Inventory Asset'
  ]);
  
  const omnispotModules = JSON.stringify([
    '5651 Log Signer',
    'SMS Gateway',
    'TC Kimlik Doğrulama',
    'Otel / PMS Entegrasyonu',
    'Voucher Generator',
    'Bandwidth Shaper',
    'Multi-SSID'
  ]);

  const insertProduct = db.prepare(`
    INSERT OR REPLACE INTO products (id, name, code, description, icon, version, available_modules, default_quotas, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProduct.run(
    'omniflow',
    'OMNIFlow',
    'FLW',
    'Bilişim ve Altyapı Yönetim Sistemi, SNMP izleme, Syslog ve topoloji motoru.',
    'Activity',
    '2.4.0',
    omniflowModules,
    JSON.stringify({ default_devices: 50, default_users: 100 }),
    1
  );

  insertProduct.run(
    'omnispot',
    'OmniSpot',
    'SPT',
    'Kurumsal Hotspot, 5651 Uyumlu Log İmzalama, SMS ve TC Kimlikli Misafir Ağı.',
    'Wifi',
    '3.1.2',
    omnispotModules,
    JSON.stringify({ default_devices: 10, default_users: 500 }),
    1
  );

  const omnibackupModules = JSON.stringify([
    'MSSQL Canlı Yedekleme',
    'MySQL / MariaDB Yedekleme',
    'VSS Volume Shadow Copy',
    'Active Cyber Shield (Ransomware Kalkanı)',
    'SureBackup Otomatik DR Tatbikatı',
    'Instant VM Boot (Anında Sanallaştırma)',
    'WORM Değiştirilemez Yedek Kilidi',
    'Zstandard & Deduplication Sıkıştırma',
    'Google Drive & NAS Bulut Aktarımı',
    'Yerel Ağ Radarı & Ajan Keşfi'
  ]);

  insertProduct.run(
    'omnibackup',
    'OmniBackup Enterprise',
    'BCK',
    'Kurumsal Canlı SQL/VSS Yedekleme, Ransomware Kalkanı, WORM ve Anında DR Sanallaştırma Platformu.',
    'ShieldCheck',
    '2.0.0',
    omnibackupModules,
    JSON.stringify({ default_devices: 20, default_users: 10 }),
    1
  );

  // 3. Seed Sample Customers if table is empty
  const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get();
  if (customerCount.count === 0) {
    const insertCustomer = db.prepare(`
      INSERT INTO customers (company_name, contact_name, phone, email, city, tax_office, tax_number, address, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const cust1 = insertCustomer.run(
      'Anadolu Bilişim Teknolojileri A.Ş.',
      'Murat Yılmaz',
      '+90 532 555 1020',
      'bilgi@anadolubilisim.com.tr',
      'İstanbul',
      'Mecidiyeköy VD',
      '1234567890',
      'Büyükdere Cad. No: 182 Şişli / İstanbul',
      'Bölge bayisi & Kurumsal IT müşterisi'
    );

    const cust2 = insertCustomer.run(
      'Marmara Lojistik ve Dağıtım Ltd. Şti.',
      'Selin Kaya',
      '+90 541 333 4050',
      'it@marmaralojistik.com',
      'Kocaeli',
      'Gebze VD',
      '9876543210',
      'Organize Sanayi Bölgesi 4. Cadde No: 12 Gebze / Kocaeli',
      '3 Depo ve merkez ofis ağı'
    );

    const cust3 = insertCustomer.run(
      'Ege Turizm & Grand Resort Otelleri',
      'Caner Demir',
      '+90 505 777 8899',
      'teknik@egeresort.com',
      'İzmir',
      'Çeşme VD',
      '4567891230',
      'Alaçatı Mah. Sahil Cad. No: 44 Çeşme / İzmir',
      'OmniSpot 5651 ve Otel PMS entegrasyonu kullanıcısı'
    );

    // 4. Seed Realistic Sample Licenses
    const insertLicense = db.prepare(`
      INSERT INTO licenses (
        license_key, customer_id, product_id, license_type, duration_months,
        status, start_date, end_date, max_devices, max_users, enabled_modules,
        hardware_id, hwid_lock_enabled, last_heartbeat, last_ip, last_client_version,
        activation_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Helper date generator
    const now = new Date();
    const oneYearLater = new Date(now.getTime() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0];
    const expiringSoon = new Date(now.getTime() + 11 * 24 * 3600 * 1000).toISOString().split('T')[0]; // in 11 days!
    const expiredPast = new Date(now.getTime() - 15 * 24 * 3600 * 1000).toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    // License 1: Active OMNIFlow for Anadolu Bilişim
    const key1 = crypto.generateLicenseKey('FLW');
    insertLicense.run(
      key1,
      cust1.lastInsertRowid,
      'omniflow',
      'yearly',
      12,
      'active',
      todayStr,
      oneYearLater,
      50,
      250,
      JSON.stringify(['Network Monitor', 'Syslog Server', 'Topology Map', 'Auto Backup']),
      'CPU-BFEBFBFF-MB-CZC74966Q9',
      1,
      new Date().toISOString(),
      '195.175.22.84',
      '2.4.0',
      todayStr,
      'Yıllık kurumsal lisans paketi'
    );

    // License 2: Expiring Soon (11 days) OMNIFlow for Marmara Lojistik
    const key2 = crypto.generateLicenseKey('FLW');
    insertLicense.run(
      key2,
      cust2.lastInsertRowid,
      'omniflow',
      'yearly',
      12,
      'active',
      new Date(now.getTime() - 354 * 24 * 3600 * 1000).toISOString().split('T')[0],
      expiringSoon,
      30,
      100,
      JSON.stringify(['Network Monitor', 'Syslog Server', 'Alert Center']),
      'CPU-7F06D0FF-MB-VMW564D12',
      1,
      new Date().toISOString(),
      '88.247.112.5',
      '2.3.9',
      todayStr,
      'Yenileme için aranacak - Teklif hazırlandı'
    );

    // License 3: Demo OmniSpot for Ege Resort
    const key3 = crypto.generateLicenseKey('SPT');
    insertLicense.run(
      key3,
      cust3.lastInsertRowid,
      'omnispot',
      'demo',
      1,
      'demo',
      todayStr,
      new Date(now.getTime() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
      10,
      500,
      JSON.stringify(['5651 Log Signer', 'SMS Gateway', 'TC Kimlik Doğrulama', 'Otel / PMS Entegrasyonu']),
      null, // Not activated yet
      1,
      null,
      null,
      null,
      null,
      '15 günlük tam yetkili otel demo sürümü'
    );

    // License 4: Suspended License (Payment Delay)
    const key4 = crypto.generateLicenseKey('SPT');
    insertLicense.run(
      key4,
      cust2.lastInsertRowid,
      'omnispot',
      'yearly',
      12,
      'suspended',
      new Date(now.getTime() - 100 * 24 * 3600 * 1000).toISOString().split('T')[0],
      new Date(now.getTime() + 265 * 24 * 3600 * 1000).toISOString().split('T')[0],
      15,
      300,
      JSON.stringify(['5651 Log Signer', 'SMS Gateway']),
      'CPU-34AEFBFF-MB-ASUS9988',
      1,
      new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      '88.247.112.5',
      '3.1.0',
      todayStr,
      'Ödeme gecikmesi nedeniyle uzaktan donduruldu'
    );
  }

  // 5. Seed Default Settings
  const defaultSettings = [
    { key: 'company_name', value: 'OmniHub Yazılım & Lisans Teknolojileri' },
    { key: 'developer_signature', value: 'Designed & Developed by Önder Cihan ACAR © 2026. All Rights Reserved.' },
    { key: 'master_secret', value: crypto.MASTER_SECRET },
    { key: 'heartbeat_interval_hours', value: '24' },
    { key: 'renewal_alert_days', value: '30,15,7' },
    { key: 'whatsapp_template', value: 'Sayın *{contact_name}* ({company_name}),\n\n*{product_name}* lisansınızın geçerlilik süresi *{end_date}* tarihinde sona erecektir ({days_left} gün kaldı).\n\nHizmet kesintisi yaşamamak ve güncel sürümlerden yararlanmaya devam etmek için lisans yenileme teklifinizi onaylamanızı rica ederiz.\n\nİyi çalışmalar dileriz.\n*Önder Cihan ACAR* - OmniHub' },
    { key: 'email_template_subject', value: '{product_name} Lisans Yenileme Hatırlatması - {company_name}' },
    { key: 'email_template_body', value: 'Sayın {contact_name},\n\n{company_name} bünyesinde kullanılmakta olan {product_name} lisansınızın süresi {end_date} tarihinde dolacaktır ({days_left} gün kaldı).\n\nLisans yenileme faturanız ve avantajlı yenileme şartları için lütfen bizimle iletişime geçiniz.\n\nSaygılarımızla,\nÖnder Cihan ACAR\nOmniHub Lisans Yönetim Merkezi' }
  ];

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  for (const s of defaultSettings) {
    insertSetting.run(s.key, s.value);
  }
}

// Initialize tables and seed on module load
initSchema();

module.exports = {
  db,
  initSchema
};
