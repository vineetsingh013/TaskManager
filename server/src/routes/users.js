const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

router.get('/all', authenticate, (req, res) => {
  const users = db.prepare('SELECT id, name, email FROM users ORDER BY name ASC').all();
  res.json(users);
});

router.get('/search', authenticate, (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const users = db.prepare('SELECT id, name, email FROM users WHERE name LIKE ? OR email LIKE ? LIMIT 10').all(`%${q}%`, `%${q}%`);
  res.json(users);
});

module.exports = router;
