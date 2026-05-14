import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Páginas
import LandingPage         from './pages/LandingPage';
import ReservaWizard       from './pages/ReservaWizard';
import GestionHoras        from './pages/GestionHoras';
import Login               from './pages/Login';
import LoginProfesional    from './pages/LoginProfesional';
import PortalPaciente      from './pages/PortalPaciente';
import PortalDoctor        from './pages/PortalDoctor';
import PanelAdmin          from './pages/PanelAdmin';

/** Animación de entrada al cambiar de ruta */
function AnimatedPage({ children }) {
  const location = useLocation();
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('page-enter');
    void el.offsetWidth;
    el.classList.add('page-enter');
  }, [location.pathname]);
  return (
    <div ref={ref} className="page-enter" style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}

/** Ruta privada con control de rol */
function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.rol)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Públicas ── */}
      <Route path="/"           element={<AnimatedPage><LandingPage /></AnimatedPage>} />
      <Route path="/reservar"   element={<AnimatedPage><ReservaWizard /></AnimatedPage>} />
      <Route path="/login"      element={<AnimatedPage><Login /></AnimatedPage>} />
      <Route path="/profesional" element={<AnimatedPage><LoginProfesional /></AnimatedPage>} />

      {/* ── Paciente (requiere auth) ── */}
      <Route path="/mis-horas"  element={
        <AnimatedPage><GestionHoras /></AnimatedPage>
      } />
      <Route path="/portal"     element={
        <PrivateRoute roles={['paciente']}>
          <AnimatedPage><PortalPaciente /></AnimatedPage>
        </PrivateRoute>
      } />

      {/* ── Doctor ── */}
      <Route path="/doctor"     element={
        <PrivateRoute roles={['medico']}>
          <AnimatedPage><PortalDoctor /></AnimatedPage>
        </PrivateRoute>
      } />

      {/* ── Administración ── */}
      <Route path="/admin"      element={
        <PrivateRoute roles={['admin', 'medico']}>
          <AnimatedPage><PanelAdmin /></AnimatedPage>
        </PrivateRoute>
      } />

      {/* ── Fallback ── */}
      <Route path="*"           element={<Navigate to="/" replace />} />
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
