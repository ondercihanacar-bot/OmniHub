const crypto = require('crypto');

// Master Secret Key for HMAC & AES operations
// Can be customized via environment variable or settings
const MASTER_SECRET = process.env.OMNIHUB_SECRET || 'OMNIHUB_ENTERPRISE_SECRET_KEY_2026_ONDER_CIHAN_ACAR_SECURE';

/**
 * Generates a formatted license key like:
 * OMNI-FLW-A8F2-9C1D-E4B7
 * Includes a checksum character in the last block to verify integrity.
 */
function generateLicenseKey(productCode = 'FLW') {
  const prefix = `OMNI-${productCode.toUpperCase()}`;
  
  // Generate random bytes for blocks
  const b1 = crypto.randomBytes(2).toString('hex').toUpperCase(); // 4 chars
  const b2 = crypto.randomBytes(2).toString('hex').toUpperCase(); // 4 chars
  const b3_seed = crypto.randomBytes(1).toString('hex').toUpperCase(); // 2 chars
  
  // Calculate a 2-char checksum from prefix + b1 + b2 + b3_seed
  const rawData = `${prefix}-${b1}-${b2}-${b3_seed}`;
  const hash = crypto.createHmac('sha256', MASTER_SECRET).update(rawData).digest('hex').toUpperCase();
  const checksum = hash.slice(0, 2);
  
  const b3 = `${b3_seed}${checksum}`; // 4 chars total
  
  return `${prefix}-${b1}-${b2}-${b3}`;
}

/**
 * Validates the format and algorithmic checksum of a license key
 */
function validateLicenseKeyFormat(key) {
  if (!key || typeof key !== 'string') return false;
  const parts = key.trim().toUpperCase().split('-');
  if (parts.length !== 4) return false;
  if (parts[0] !== 'OMNI') return false;
  
  const [omni, prod, b1, b2, b3] = [parts[0], parts[1], parts[2], parts[3], parts[3]];
  // Re-split accurately
  const segments = key.trim().toUpperCase().split('-');
  if (segments.length !== 5) {
    // If format is OMNI-PROD-B1-B2-B3 (5 segments)
    if (segments.length === 5) {
      const pOmni = segments[0];
      const pProd = segments[1];
      const pB1 = segments[2];
      const pB2 = segments[3];
      const pB3 = segments[4];
      
      if (pOmni !== 'OMNI') return false;
      if (pB3.length !== 4) return false;
      
      const seed = pB3.slice(0, 2);
      const expectedChecksum = pB3.slice(2, 4);
      const raw = `OMNI-${pProd}-${pB1}-${pB2}-${seed}`;
      const hash = crypto.createHmac('sha256', MASTER_SECRET).update(raw).digest('hex').toUpperCase();
      return hash.slice(0, 2) === expectedChecksum;
    }
    return false;
  }
  return true;
}

/**
 * Creates an encrypted / tamper-proof cryptographic license payload
 * Can be exported as .omnilicense or embedded in QR codes
 */
function createLicensePayload(licenseData) {
  const payloadJson = JSON.stringify({
    license_key: licenseData.license_key,
    customer_id: licenseData.customer_id,
    customer_name: licenseData.customer_name,
    product_id: licenseData.product_id,
    product_name: licenseData.product_name,
    license_type: licenseData.license_type,
    start_date: licenseData.start_date,
    end_date: licenseData.end_date,
    max_devices: licenseData.max_devices,
    max_users: licenseData.max_users,
    enabled_modules: licenseData.enabled_modules,
    hardware_id: licenseData.hardware_id || null,
    issued_at: new Date().toISOString(),
    issuer: 'OmniHub License Authority (Önder Cihan ACAR © 2026)'
  });

  const signature = crypto.createHmac('sha256', MASTER_SECRET)
    .update(payloadJson)
    .digest('hex');

  // AES-256-GCM encryption for binary/offline license blob
  const iv = crypto.randomBytes(12);
  const key = crypto.createHash('sha256').update(MASTER_SECRET).digest();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(payloadJson, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');

  const bundle = {
    v: 1,
    iv: iv.toString('base64'),
    data: encrypted,
    tag: authTag,
    sig: signature
  };

  return {
    rawPayload: payloadJson,
    signature,
    encodedBlob: Buffer.from(JSON.stringify(bundle)).toString('base64')
  };
}

/**
 * Verifies an encoded license blob
 */
function verifyLicenseBlob(base64Blob) {
  try {
    const raw = Buffer.from(base64Blob, 'base64').toString('utf8');
    const bundle = JSON.parse(raw);
    
    const key = crypto.createHash('sha256').update(MASTER_SECRET).digest();
    const iv = Buffer.from(bundle.iv, 'base64');
    const authTag = Buffer.from(bundle.tag, 'base64');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(bundle.data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    // Check HMAC
    const expectedSig = crypto.createHmac('sha256', MASTER_SECRET)
      .update(decrypted)
      .digest('hex');
      
    if (expectedSig !== bundle.sig) {
      return { valid: false, error: 'Signature mismatch' };
    }
    
    return { valid: true, payload: JSON.parse(decrypted) };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

/**
 * Normalizes HWID string for comparison (case-insensitive, trims)
 */
function normalizeHardwareId(hwid) {
  if (!hwid) return null;
  return hwid.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

module.exports = {
  MASTER_SECRET,
  generateLicenseKey,
  validateLicenseKeyFormat,
  createLicensePayload,
  verifyLicenseBlob,
  normalizeHardwareId
};
