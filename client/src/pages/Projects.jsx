import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects } from '../api/client';

export default function Projects() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const fetchProjects = () => {
    projects.list()
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const p = await projects.create(form);
      setShowCreate(false);
      setForm({ name: '', description: '' });
      navigate(`/projects/${p.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>New Project</button>
      </div>

      {list.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--gray-400)', marginBottom: '1rem' }}>No projects yet</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create your first project</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {list.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => navigate(`/projects/${p.id}`)}
            >
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>{p.name}</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{p.description || 'No description'}</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                <span>{p.member_count} members</span>
                <span>{p.task_count} tasks</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Project</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              {error && <p className="error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
