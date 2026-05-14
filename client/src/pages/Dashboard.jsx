import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboard } from '../api/client';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboard.get()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="card-grid">
        <div className="stat-card">
          <h3>Total Projects</h3>
          <div className="stat-value">{data.totalProjects}</div>
        </div>
        <div className="stat-card">
          <h3>To Do</h3>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{data.tasksSummary.todo}</div>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{data.tasksSummary.in_progress}</div>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{data.tasksSummary.done}</div>
        </div>
      </div>

      {data.overdueTasks.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <h2 className="mb-2" style={{ color: 'var(--danger)' }}>Overdue Tasks</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.overdueTasks.map((task) => (
                <tr key={task.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${task.project_id}`)}>
                  <td>{task.title}</td>
                  <td>{task.project_name}</td>
                  <td>{task.assigned_name}</td>
                  <td style={{ color: 'var(--danger)' }}>{task.due_date}</td>
                  <td><span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <h2 className="mb-2">Recent Tasks</h2>
        {data.recentTasks.length === 0 ? (
          <p style={{ color: 'var(--gray-400)' }}>No tasks yet. Create a project to get started.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTasks.map((task) => (
                <tr key={task.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${task.project_id}`)}>
                  <td>{task.title}</td>
                  <td>{task.project_name}</td>
                  <td>{task.assigned_name}</td>
                  <td><span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span></td>
                  <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
