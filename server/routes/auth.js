const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { MASTER_SECRET } = require('../crypto');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Kullanıcı adı ve şifre gereklidir.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Kullanıcı adı veya şifre hatalı.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Kullanıcı adı veya şifre hatalı.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name, role: user.role },
      MASTER_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Giriş işlemi sırasında sunucu hatası.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, name, role, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı.' });
    }
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Mevcut şifre ve yeni şifre gereklidir.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ success: false, error: 'Mevcut şifreniz hatalı.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, req.user.id);

    return res.json({ success: true, message: 'Şifreniz başarıyla güncellendi.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
