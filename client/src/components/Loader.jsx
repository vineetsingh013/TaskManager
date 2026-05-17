import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const taglines = [
  'Organizing your workspace…',
  'Gathering your projects…',
  'Preparing your dashboard…',
  'Loading your tasks…',
  'Polishing the interface…',
  'Almost there…',
];

export default function Loader({ progress }) {
  const { theme } = useTheme();
  const [tagIndex, setTagIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setTagIndex(i => (i + 1) % taglines.length);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const pct = Math.round((progress || 0) * 100);

  return (
    <div className="app-loader" data-theme={theme}>
      <div className="app-loader-bg-pattern" />
      <div className="app-loader-content">
        <div className="auth-brand">
          <div className="sidebar-brand-icon" style={{ width: 44, height: 44, fontSize: '0.875rem' }}>TM</div>
          <span className="sidebar-brand-text" style={{ fontSize: '1.375rem', color: 'var(--text)' }}>Task Manager</span>
        </div>
        <div className="app-loader-ring">
          <div className="app-loader-ring-inner" />
          <div className="app-loader-ring-glow" />
        </div>
        <div className="app-loader-tagline">{taglines[tagIndex]}</div>
        <div className="app-loader-bar-wrap">
          <div className="app-loader-bar" style={{ width: `${pct}%` }} />
        </div>
        <div className="app-loader-pct">{pct}%</div>
      </div>
    </div>
  );
}
