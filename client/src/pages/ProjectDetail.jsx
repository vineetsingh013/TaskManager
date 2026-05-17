import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projects, tasks, users as usersApi } from '../api/client';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = () => {
    projects.get(id)
      .then(setProject)
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProject(); }, [id]);

  if (loading) return <div className="loading">Loading project</div>;
  if (!project) return null;

  const isAdmin = project.members.find(m => m.id === user.id)?.role === 'admin';

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => navigate('/projects')}>← Back to Projects</button>
          <h1 style={{ marginTop: '0.75rem' }}>{project.name}</h1>
          {project.description && <span className="page-header-subtitle">{project.description}</span>}
        </div>
      </div>

      <div className="card-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{project.tasks.length}</div>
        </div>
        <div className="stat-card">
          <h3>Members</h3>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{project.members.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <TasksPanel projectId={id} tasks={project.tasks} members={project.members} isAdmin={isAdmin} onUpdate={fetchProject} />
        <MembersPanel projectId={id} members={project.members} isAdmin={isAdmin} currentUserId={user.id} onUpdate={fetchProject} />
      </div>
    </div>
  );
}

function TasksPanel({ projectId, tasks: taskList, members, isAdmin, onUpdate }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '' });
  const [error, setError] = useState('');

  const resetForm = () => setForm({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '' });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await tasks.create(projectId, { ...form, assigned_to: form.assigned_to || null });
      setShowCreate(false);
      resetForm();
      onUpdate();
    } catch (err) { setError(err.message); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await tasks.update(editingTask.id, { ...form, assigned_to: form.assigned_to || null });
      setEditingTask(null);
      resetForm();
      onUpdate();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasks.delete(taskId);
      onUpdate();
    } catch (err) { alert(err.message); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await tasks.update(taskId, { status });
      onUpdate();
    } catch (err) { alert(err.message); }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      assigned_to: task.assigned_to ? String(task.assigned_to) : '',
      priority: task.priority,
      due_date: task.due_date || '',
    });
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Tasks</h2>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowCreate(true); }}>+ Add Task</button>
        )}
      </div>

      {taskList.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">◌</div>
            <p className="empty-state-text">No tasks yet</p>
            {isAdmin && (
              <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowCreate(true); }}>Add the first task</button>
            )}
          </div>
        </div>
      ) : (
        taskList.map((task) => (
          <div key={task.id} className="task-card">
            <div className="task-card-header">
              <div style={{ flex: 1 }}>
                <div className="task-card-title-row">
                  <span className="task-card-title">{task.title}</span>
                  <span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                </div>
                {task.description && <div className="task-card-desc">{task.description}</div>}
                <div className="task-card-meta">
                  {task.assigned_name && <span>👤 {task.assigned_name}</span>}
                  {task.due_date && <span>📅 {task.due_date}</span>}
                </div>
              </div>
              <div className="task-card-actions">
                <select
                  className="status-select"
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                {isAdmin && (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(task)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task.id)}>Del</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      {(showCreate || editingTask) && (
        <div className="modal-overlay" onClick={() => { setShowCreate(false); setEditingTask(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingTask ? 'Edit Task' : 'Create Task'}</h2>
            <form onSubmit={editingTask ? handleUpdate : handleCreate}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
                  <option value="">Unassigned</option>
                  {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                </div>
              </div>
              {error && <p className="error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowCreate(false); setEditingTask(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTask ? 'Update Task' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MembersPanel({ projectId, members, isAdmin, currentUserId, onUpdate }) {
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState('');

  const memberIds = new Set(members.map(m => m.id));

  const openAdd = () => {
    setShowAdd(true);
    setEmail('');
    setError('');
    usersApi.all()
      .then(setAllUsers)
      .catch(() => {});
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await projects.addMember(projectId, { email, role: 'member' });
      setShowAdd(false);
      setEmail('');
      onUpdate();
    } catch (err) { setError(err.message); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await projects.updateMember(projectId, userId, { role: newRole });
      onUpdate();
    } catch (err) { alert(err.message); }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await projects.removeMember(projectId, userId);
      onUpdate();
    } catch (err) { alert(err.message); }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Team</h2>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Member</button>
        )}
      </div>

      <div className="card">
        {members.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No members</p>
        ) : (
          members.map((m) => (
            <div key={m.id} className="member-item">
              <div className="member-info">
                <div className="member-avatar">{getInitials(m.name)}</div>
                <div>
                  <div className="member-name">{m.name}</div>
                  <div className="member-email">{m.email}</div>
                </div>
              </div>
              <div className="member-actions">
                <span className={`badge badge-${m.role}`}>{m.role}</span>
                {isAdmin && m.id !== currentUserId && (
                  <>
                    <select
                      className="status-select"
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value)}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemove(m.id)}>Remove</button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Member</h2>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Select user</label>
                <select
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ marginBottom: '0.5rem' }}
                >
                  <option value="">Choose from registered users…</option>
                  {allUsers.filter(u => !memberIds.has(u.id)).map(u => (
                    <option key={u.id} value={u.email}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  <span style={{ flex: 1, borderTop: '1px solid var(--border)' }} />
                  <span>or</span>
                  <span style={{ flex: 1, borderTop: '1px solid var(--border)' }} />
                </div>
              </div>
              <div className="form-group">
                <label>Or enter email manually</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
              </div>
              {error && <p className="error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
