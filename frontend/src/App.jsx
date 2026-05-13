import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import PortalPaciente from './pages/PortalPaciente';
import PanelAdmin from './pages/PanelAdmin';

/** Envuelve cada ruta con la clase page-enter para la animación de entrada */
function AnimatedPage({ children }) {
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reaplica la animación al cambiar de ruta
    el.classList.remove('page-enter');
    void el.offsetWidth; // force reflow
    el.classList.add('page-enter');
  }, [location.pathname]);

  return (
    <div ref={ref} className="page-enter" style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}

function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.rol)) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <AnimatedPage><Login /></AnimatedPage>
      } />
      <Route path="/portal" element={
        <PrivateRoute roles={['paciente']}>
          <AnimatedPage><PortalPaciente /></AnimatedPage>
        </PrivateRoute>
      } />
      <Route path="/admin" element={
        <PrivateRoute roles={['admin', 'medico']}>
          <AnimatedPage><PanelAdmin /></AnimatedPage>
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
