import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button className="theme-floating-toggle" onClick={toggle} aria-label="Toggle theme">
      <span className={`theme-floating-sun ${theme === 'light' ? 'active' : ''}`}>☀</span>
      <span className={`theme-floating-moon ${theme === 'dark' ? 'active' : ''}`}>☾</span>
    </button>
  );
}
