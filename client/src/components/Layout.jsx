import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboard } from '../api/client';

export default function Layout() {
  const [open, setOpen] = useState(true);
  const [deadlines, setDeadlines] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  useEffect(() => {
    dashboard.get()
      .then(data => setDeadlines(data.upcomingTasks || []))
      .catch(() => {});
  }, []);

  return (
    <div className={`app-layout ${open ? '' : 'sidebar-collapsed'}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">TM</div>
            <span className="sidebar-brand-text">Task Manager</span>
          </div>
          <button className="sidebar-toggle" onClick={() => setOpen(o => !o)} title={open ? 'Collapse sidebar' : 'Expand sidebar'}>
            {open ? '≡' : '≡'}
          </button>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Main</div>
          <NavLink to="/" end title="Dashboard">
            <span className="nav-icon">◇</span>
            <span className="sidebar-nav-text">Dashboard</span>
          </NavLink>
          <NavLink to="/projects" title="Projects">
            <span className="nav-icon">⊞</span>
            <span className="sidebar-nav-text">Projects</span>
          </NavLink>
        </nav>
        {deadlines.length > 0 && (
          <div className="sidebar-deadlines">
            <div className="sidebar-nav-label">Upcoming Deadlines</div>
            {deadlines.map(t => (
              <div key={t.id} className="sidebar-deadline-item" onClick={() => navigate(`/projects/${t.project_id}`)}>
                <span className="sidebar-deadline-title">{t.title}</span>
                <span className="sidebar-deadline-date">{t.due_date}</span>
              </div>
            ))}
          </div>
        )}
        <div className="sidebar-footer">
          <div className="profile-section">
            <div className="sidebar-user">
              <div className="sidebar-avatar" title={user?.name}>{initials}</div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user?.name}</div>
                <div className="sidebar-user-email">{user?.email}</div>
                <div className="sidebar-user-role">
                  <span className={`badge badge-${user?.role}`}>{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
