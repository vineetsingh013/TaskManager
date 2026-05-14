const bcrypt = require('bcryptjs');
const db = require('./src/db');

// Clear existing data
db.exec('DELETE FROM tasks; DELETE FROM project_members; DELETE FROM projects; DELETE FROM users;');

const hash = bcrypt.hashSync('password123', 10);

// Users
db.prepare(`INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`).run(1, 'Alice Admin', 'alice@example.com', hash, 'admin');
db.prepare(`INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`).run(2, 'Bob Builder', 'bob@example.com', hash, 'member');
db.prepare(`INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`).run(3, 'Charlie Coder', 'charlie@example.com', hash, 'member');
db.prepare(`INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`).run(4, 'Diana Designer', 'diana@example.com', hash, 'member');

// Reset autoincrement
db.exec("UPDATE sqlite_sequence SET seq = 4 WHERE name = 'users'");

// Projects
db.prepare(`INSERT INTO projects (id, name, description, created_by) VALUES (?, ?, ?, ?)`).run(1, 'Website Redesign', 'Redesign the company website with modern UI/UX', 1);
db.prepare(`INSERT INTO projects (id, name, description, created_by) VALUES (?, ?, ?, ?)`).run(2, 'Mobile App MVP', 'Build MVP for the mobile app', 1);
db.prepare(`INSERT INTO projects (id, name, description, created_by) VALUES (?, ?, ?, ?)`).run(3, 'API Migration', 'Migrate legacy APIs to new microservices', 2);
db.exec("UPDATE sqlite_sequence SET seq = 3 WHERE name = 'projects'");

// Project members
db.prepare(`INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)`).run(1, 1, 'admin');
db.prepare(`INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)`).run(1, 2, 'member');
db.prepare(`INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)`).run(1, 4, 'member');
db.prepare(`INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)`).run(2, 1, 'admin');
db.prepare(`INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)`).run(2, 3, 'member');
db.prepare(`INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)`).run(3, 2, 'admin');
db.prepare(`INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)`).run(3, 3, 'member');

// Tasks
db.prepare(`INSERT INTO tasks (id, title, description, status, priority, project_id, assigned_to, created_by, due_date)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(1, 'Design homepage mockup', 'Create Figma designs for the new homepage', 'in_progress', 'high', 1, 4, 1, '2026-05-20');
db.prepare(`INSERT INTO tasks (id, title, description, status, priority, project_id, assigned_to, created_by, due_date)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(2, 'Implement navigation bar', 'Responsive navbar with dropdowns', 'todo', 'medium', 1, 2, 1, '2026-05-25');
db.prepare(`INSERT INTO tasks (id, title, description, status, priority, project_id, assigned_to, created_by, due_date)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(3, 'Set up CI/CD pipeline', 'GitHub Actions for automated deployment', 'done', 'high', 1, 2, 1, '2026-05-10');
db.prepare(`INSERT INTO tasks (id, title, description, status, priority, project_id, assigned_to, created_by, due_date)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(4, 'User authentication screen', 'Login and signup screens for mobile app', 'in_progress', 'high', 2, 3, 1, '2026-05-22');
db.prepare(`INSERT INTO tasks (id, title, description, status, priority, project_id, assigned_to, created_by, due_date)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(5, 'Push notifications', 'Implement push notification service', 'todo', 'medium', 2, null, 1, '2026-06-01');
db.prepare(`INSERT INTO tasks (id, title, description, status, priority, project_id, assigned_to, created_by, due_date)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(6, 'Refactor auth service', 'Extract auth logic into separate microservice', 'todo', 'high', 3, 3, 2, '2026-05-15');
db.prepare(`INSERT INTO tasks (id, title, description, status, priority, project_id, assigned_to, created_by, due_date)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(7, 'Write API documentation', 'OpenAPI/Swagger docs for all endpoints', 'in_progress', 'low', 3, 2, 2, '2026-06-10');
db.exec("UPDATE sqlite_sequence SET seq = 7 WHERE name = 'tasks'");

console.log('Seed data inserted!');
console.log('');
console.log('Sample accounts (password for all: password123):');
console.log('  alice@example.com  (admin)');
console.log('  bob@example.com    (member)');
console.log('  charlie@example.com (member)');
console.log('  diana@example.com  (member)');
