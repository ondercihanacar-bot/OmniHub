const jwt = require('jsonwebtoken');
const { MASTER_SECRET } = require('../crypto');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Yetkilendirme belirteci eksik' });
  }

  jwt.verify(token, MASTER_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Oturum süresi dolmuş veya geçersiz' });
    }
    req.user = user;
    next();
  });
}

module.exports = {
  authenticateToken
};
