import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projects, tasks, users } from '../api/client';

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

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return null;

  const isAdmin = project.members.find(m => m.id === user.id)?.role === 'admin';

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm mb-1" onClick={() => navigate('/projects')}>← Back</button>
          <h1>{project.name}</h1>
          <p style={{ color: 'var(--gray-500)' }}>{project.description || 'No description'}</p>
        </div>
      </div>

      <div className="card-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <div className="stat-value">{project.tasks.length}</div>
        </div>
        <div className="stat-card">
          <h3>Members</h3>
          <div className="stat-value">{project.members.length}</div>
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
    if (!confirm('Delete this task?')) return;
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Tasks</h2>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowCreate(true); }}>Add Task</button>
        )}
      </div>

      {taskList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
          No tasks yet
        </div>
      ) : (
        taskList.map((task) => (
          <div key={task.id} className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <strong>{task.title}</strong>
                  <span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                </div>
                {task.description && <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{task.description}</p>}
                <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginTop: '0.25rem', display: 'flex', gap: '1rem' }}>
                  {task.assigned_name && <span>Assigned to: {task.assigned_name}</span>}
                  {task.due_date && <span>Due: {task.due_date}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.8125rem' }}
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
                <button type="submit" className="btn btn-primary">{editingTask ? 'Update' : 'Create'}</button>
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
  const [error, setError] = useState('');

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
    if (!confirm('Remove this member?')) return;
    try {
      await projects.removeMember(projectId, userId);
      onUpdate();
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Team</h2>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>Add Member</button>
        )}
      </div>

      <div className="card">
        {members.map((m) => (
          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--gray-100)' }}>
            <div>
              <strong style={{ fontSize: '0.875rem' }}>{m.name}</strong>
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>{m.email}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className={`badge badge-${m.role}`}>{m.role}</span>
              {isAdmin && m.id !== currentUserId && (
                <>
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.id, e.target.value)}
                    style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.8125rem' }}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button className="btn btn-danger btn-sm" onClick={() => handleRemove(m.id)}>Remove</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Member</h2>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>User Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter user's email" />
              </div>
              {error && <p className="error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
