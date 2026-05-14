import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">✦</div>
          <span className="sidebar-brand-text">Task Manager</span>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Main</div>
          <NavLink to="/" end>
            <span className="nav-icon">◇</span> Dashboard
          </NavLink>
          <NavLink to="/projects">
            <span className="nav-icon">⊞</span> Projects
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={toggle}>
            <span className="theme-toggle-icon">{theme === 'light' ? '☾' : '☀'}</span>
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">
                <span className={`badge badge-${user?.role}`}>{user?.role}</span>
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
