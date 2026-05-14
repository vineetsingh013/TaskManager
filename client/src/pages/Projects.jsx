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

  if (loading) return <div className="loading">Loading projects</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Projects</h1>
          <span className="page-header-subtitle">{list.length} project{list.length !== 1 ? 's' : ''} in total</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>New Project</button>
      </div>

      {list.length === 0 ? (
        <div className="card empty-state" style={{ padding: '4rem 2rem' }}>
          <div className="empty-state-icon">⊞</div>
          <p className="empty-state-text">No projects yet</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create your first project</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {list.map((p) => (
            <div
              key={p.id}
              className="project-card"
              onClick={() => navigate(`/projects/${p.id}`)}
            >
              <div>
                <h3>{p.name}</h3>
                <p>{p.description || 'No description'}</p>
              </div>
              <div className="project-card-meta">
                <span>👤 {p.member_count}</span>
                <span>📋 {p.task_count}</span>
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
                <input type="text" required placeholder="e.g. Website Redesign" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="What is this project about?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              {error && <p className="error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
