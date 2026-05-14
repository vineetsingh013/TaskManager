const express = require('express');
const db = require('../db');
const { authenticate, requireProjectRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/project/:projectId', (req, res) => {
  const membership = db.prepare('SELECT * FROM project_members WHERE project_id = ? AND user_id = ?').get(req.params.projectId, req.user.id);
  if (!membership) return res.status(403).json({ error: 'Not a project member' });
  const tasks = db.prepare(`
    SELECT t.*, u.name as assigned_name
    FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.project_id = ?
    ORDER BY t.created_at DESC
  `).all(req.params.projectId);
  res.json(tasks);
});

router.post('/project/:projectId', requireProjectRole('admin', 'member'), (req, res) => {
  const { title, description, assigned_to, priority, due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (assigned_to) {
    const member = db.prepare('SELECT * FROM project_members WHERE project_id = ? AND user_id = ?').get(req.params.projectId, assigned_to);
    if (!member) return res.status(400).json({ error: 'Assigned user is not a project member' });
  }
  const result = db.prepare(
    'INSERT INTO tasks (title, description, project_id, assigned_to, created_by, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(title, description || '', req.params.projectId, assigned_to || null, req.user.id, priority || 'medium', due_date || null);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(task);
});

router.put('/:id', (req, res) => {
  const task = db.prepare(`
    SELECT t.* FROM tasks t
    JOIN project_members pm ON t.project_id = pm.project_id
    WHERE t.id = ? AND pm.user_id = ?
  `).get(req.params.id, req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found or access denied' });

  const { title, description, status, assigned_to, priority, due_date } = req.body;
  if (assigned_to) {
    const member = db.prepare('SELECT * FROM project_members WHERE project_id = ? AND user_id = ?').get(task.project_id, assigned_to);
    if (!member) return res.status(400).json({ error: 'Assigned user is not a project member' });
  }
  db.prepare(`
    UPDATE tasks SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      status = COALESCE(?, status),
      assigned_to = COALESCE(?, assigned_to),
      priority = COALESCE(?, priority),
      due_date = COALESCE(?, due_date),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title || null, description !== undefined ? description : null,
    status || null, assigned_to !== undefined ? assigned_to : null,
    priority || null, due_date !== undefined ? due_date : null,
    req.params.id
  );
  const updated = db.prepare('SELECT t.*, u.name as assigned_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE t.id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const task = db.prepare(`
    SELECT t.* FROM tasks t
    JOIN project_members pm ON t.project_id = pm.project_id
    WHERE t.id = ? AND pm.user_id = ? AND pm.role = 'admin'
  `).get(req.params.id, req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found or access denied' });
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Task deleted' });
});

module.exports = router;
