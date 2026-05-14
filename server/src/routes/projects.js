const express = require('express');
const db = require('../db');
const { authenticate, requireProjectRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res) => {
  const projects = db.prepare(`
    SELECT p.*, u.name as creator_name,
      (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count
    FROM projects p
    JOIN users u ON p.created_by = u.id
    JOIN project_members pm ON p.id = pm.project_id
    WHERE pm.user_id = ?
    ORDER BY p.created_at DESC
  `).all(req.user.id);
  res.json(projects);
});

router.post('/', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required' });

  const result = db.prepare('INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)').run(name, description || '', req.user.id);
  const projectId = result.lastInsertRowid;
  db.prepare('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)').run(projectId, req.user.id, 'admin');
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  res.status(201).json(project);
});

router.get('/:id', (req, res) => {
  const project = db.prepare(`
    SELECT p.*, u.name as creator_name
    FROM projects p JOIN users u ON p.created_by = u.id WHERE p.id = ?
  `).get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const membership = db.prepare('SELECT * FROM project_members WHERE project_id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!membership) return res.status(403).json({ error: 'Not a project member' });
  const members = db.prepare(`
    SELECT u.id, u.name, u.email, pm.role
    FROM project_members pm JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
  `).all(req.params.id);
  const tasks = db.prepare(`
    SELECT t.*, u.name as assigned_name
    FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.project_id = ?
    ORDER BY t.created_at DESC
  `).all(req.params.id);
  res.json({ ...project, members, tasks });
});

router.put('/:id', requireProjectRole('admin'), (req, res) => {
  const { name, description } = req.body;
  db.prepare('UPDATE projects SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?')
    .run(name || null, description !== undefined ? description : null, req.params.id);
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  res.json(project);
});

router.delete('/:id', requireProjectRole('admin'), (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ message: 'Project deleted' });
});

router.get('/:id/members', (req, res) => {
  const members = db.prepare(`
    SELECT u.id, u.name, u.email, pm.role
    FROM project_members pm JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
  `).all(req.params.id);
  res.json(members);
});

router.post('/:id/members', requireProjectRole('admin'), (req, res) => {
  const { email, role } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const user = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const existing = db.prepare('SELECT * FROM project_members WHERE project_id = ? AND user_id = ?').get(req.params.id, user.id);
  if (existing) return res.status(409).json({ error: 'User is already a member' });
  db.prepare('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)').run(req.params.id, user.id, role || 'member');
  const members = db.prepare(`
    SELECT u.id, u.name, u.email, pm.role
    FROM project_members pm JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
  `).all(req.params.id);
  res.status(201).json(members);
});

router.put('/:id/members/:userId', requireProjectRole('admin'), (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ error: 'Role is required' });
  db.prepare('UPDATE project_members SET role = ? WHERE project_id = ? AND user_id = ?').run(role, req.params.id, req.params.userId);
  const members = db.prepare(`
    SELECT u.id, u.name, u.email, pm.role
    FROM project_members pm JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
  `).all(req.params.id);
  res.json(members);
});

router.delete('/:id/members/:userId', requireProjectRole('admin'), (req, res) => {
  if (req.params.userId == req.user.id) return res.status(400).json({ error: 'Cannot remove yourself' });
  db.prepare('DELETE FROM project_members WHERE project_id = ? AND user_id = ?').run(req.params.id, req.params.userId);
  res.json({ message: 'Member removed' });
});

module.exports = router;
