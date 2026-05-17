const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res) => {
  const totalProjects = db.prepare(`
    SELECT COUNT(*) as count FROM projects p
    JOIN project_members pm ON p.id = pm.project_id
    WHERE pm.user_id = ?
  `).get(req.user.id).count;

  const tasksSummary = db.prepare(`
    SELECT
      COUNT(*) as total,
      COALESCE(SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END), 0) as todo,
      COALESCE(SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END), 0) as in_progress,
      COALESCE(SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END), 0) as done
    FROM tasks t
    JOIN project_members pm ON t.project_id = pm.project_id
    WHERE pm.user_id = ?
  `).get(req.user.id);

  const overdueTasks = db.prepare(`
    SELECT t.*, u.name as assigned_name, p.name as project_name
    FROM tasks t
    JOIN project_members pm ON t.project_id = pm.project_id
    JOIN users u ON t.assigned_to = u.id
    JOIN projects p ON t.project_id = p.id
    WHERE pm.user_id = ? AND t.status != 'done' AND t.due_date IS NOT NULL AND t.due_date < date('now')
    ORDER BY t.due_date ASC
  `).all(req.user.id);

  const recentTasks = db.prepare(`
    SELECT t.*, u.name as assigned_name, p.name as project_name
    FROM tasks t
    JOIN project_members pm ON t.project_id = pm.project_id
    JOIN users u ON t.assigned_to = u.id
    JOIN projects p ON t.project_id = p.id
    WHERE pm.user_id = ?
    ORDER BY t.created_at DESC LIMIT 10
  `).all(req.user.id);

  const isAdmin = req.user.role === 'admin';
  const upcomingTasks = db.prepare(`
    SELECT t.*, u.name as assigned_name, p.name as project_name, p.id as project_id
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE ${isAdmin ? '1=1' : 't.assigned_to = ?'}
      AND t.project_id IN (SELECT project_id FROM project_members WHERE user_id = ?)
      AND t.status != 'done' AND t.due_date IS NOT NULL
      AND t.due_date >= date('now')
      AND t.due_date <= date('now', '+2 days')
    ORDER BY t.due_date ASC
  `).all(...(isAdmin ? [req.user.id] : [req.user.id, req.user.id]));

  res.json({ totalProjects, tasksSummary, overdueTasks, recentTasks, upcomingTasks });
});

module.exports = router;
