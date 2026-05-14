const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

function requireProjectRole(...roles) {
  return (req, res, next) => {
    const projectId = req.params.projectId || req.params.id;
    if (!projectId) return res.status(400).json({ error: 'Project ID required' });
    const membership = db.prepare(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?'
    ).get(projectId, req.user.id);
    if (!membership) return res.status(403).json({ error: 'Not a project member' });
    if (!roles.includes(membership.role)) return res.status(403).json({ error: 'Insufficient project role' });
    req.projectRole = membership.role;
    next();
  };
}

module.exports = { authenticate, requireAdmin, requireProjectRole };
