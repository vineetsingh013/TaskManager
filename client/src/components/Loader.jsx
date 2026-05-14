import { useTheme } from '../context/ThemeContext';

export default function Loader({ text = 'Loading…' }) {
  const { theme } = useTheme();

  return (
    <div className="app-loader" data-theme={theme}>
      <div className="app-loader-ring">
        <div className="app-loader-ring-inner" />
      </div>
      <div className="app-loader-icon">✦</div>
      <div className="app-loader-name">Task Manager</div>
      <div className="app-loader-dots">
        <span className="app-loader-dot" />
        <span className="app-loader-dot" />
        <span className="app-loader-dot" />
      </div>
      <div className="app-loader-text">{text}</div>
    </div>
  );
}
