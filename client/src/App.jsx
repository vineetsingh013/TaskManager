import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ThemeToggle from './components/ThemeToggle';
import Loader from './components/Loader';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" /> : children;
}

export default function App() {
  const { loading } = useAuth();
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading) {
      const duration = 2000;
      const start = Date.now();
      const timer = setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.min(elapsed / duration, 1);
        setProgress(pct);
        if (pct >= 1) {
          clearInterval(timer);
          setReady(true);
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [loading]);

  if (!ready) return <Loader progress={progress} />;

  return (
    <>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
        </Route>
      </Routes>
      <ThemeToggle />
    </>
  );
}
