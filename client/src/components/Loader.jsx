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

const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: 4 + Math.random() * 8,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 3,
  duration: 3 + Math.random() * 4,
}));

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
      <div className="app-loader-particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="app-loader-particle"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>
      <div className="app-loader-content">
        <div className="app-loader-ring">
          <div className="app-loader-ring-inner" />
          <div className="app-loader-ring-glow" />
        </div>
        <div className="app-loader-icon">⚡</div>
        <div className="app-loader-name">Task Manager</div>
        <div className="app-loader-tagline">{taglines[tagIndex]}</div>
        <div className="app-loader-bar-wrap">
          <div className="app-loader-bar" style={{ width: `${pct}%` }} />
        </div>
        <div className="app-loader-pct">{pct}%</div>
        <div className="app-loader-steps">
          <div className={`app-loader-step ${pct >= 25 ? 'done' : ''}`} />
          <div className={`app-loader-step ${pct >= 50 ? 'done' : ''}`} />
          <div className={`app-loader-step ${pct >= 75 ? 'done' : ''}`} />
          <div className={`app-loader-step ${pct >= 100 ? 'done' : ''}`} />
        </div>
      </div>
    </div>
  );
}
