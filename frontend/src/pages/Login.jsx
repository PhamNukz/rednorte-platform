import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Clave para forzar re-render del error sin recargar página
  const [errorKey, setErrorKey] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    // Siempre prevenir el comportamiento por defecto del form
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const data = await login(rut, password);
      // Navegación programática según rol — sin reload
      navigate(data.rol === 'paciente' ? '/portal' : '/admin', { replace: true });
    } catch (err) {
      // Mostrar error sin recargar — incrementar key para re-animar el shake
      const msg =
        err.response?.data?.error ||
        (err.response?.status === 401 ? 'RUT o contraseña incorrectos' : 'Error de conexión. Intente nuevamente.');
      setError(msg);
      setErrorKey(k => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page} className="page-enter">
      <div style={styles.bg} />

      <div style={styles.card} className="login-card">
        {/* Logo */}
        <div style={styles.logoSection} className="animate-fadeIn">
          <div style={styles.logoIcon}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="18" fill="#0073b1"/>
              <path d="M18 8v10M18 18l7 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="18" cy="18" r="3" fill="#fff"/>
            </svg>
          </div>
          <h1 style={styles.brand}>RedNorte</h1>
          <p style={styles.brandSub}>Servicio Público de Salud</p>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          style={styles.form}
        >
          <h2 style={styles.heading} className="animate-fadeIn delay-1">
            Iniciar Sesión
          </h2>

          {/* Caja de error — se reanima cada vez con errorKey */}
          {error && (
            <div
              key={errorKey}
              style={styles.errorBox}
              className="error-box animate-fadeIn"
              role="alert"
            >
              <span style={styles.errorIcon}>⚠</span>
              {error}
            </div>
          )}

          <div style={styles.field} className="animate-fadeInUp delay-2">
            <label style={styles.label} htmlFor="rut">RUT</label>
            <input
              id="rut"
              className="input-field"
              style={styles.input}
              type="text"
              placeholder="12345678-9"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div style={styles.field} className="animate-fadeInUp delay-3">
            <label style={styles.label} htmlFor="password">Contraseña</label>
            <input
              id="password"
              className="input-field"
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-animate animate-fadeInUp delay-4"
            style={{
              ...styles.button,
              opacity: loading ? 0.82 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" />Verificando...</>
              : 'Ingresar'}
          </button>
        </form>

        <p style={styles.hint} className="animate-fadeIn delay-5">
          Plataforma Inteligente de Gestión de Listas de Espera
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a3356 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute', inset: 0,
    backgroundImage: `radial-gradient(circle at 20% 30%, rgba(0,115,177,0.18) 0%, transparent 55%),
                      radial-gradient(circle at 80% 70%, rgba(0,115,177,0.12) 0%, transparent 55%)`,
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    background: '#fff',
    borderRadius: 16,
    padding: '40px 48px 32px',
    boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
    width: 420,
    maxWidth: '92vw',
  },
  logoSection: { textAlign: 'center', marginBottom: 28 },
  logoIcon: { marginBottom: 10 },
  brand: { margin: 0, color: '#0073b1', fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px' },
  brandSub: { margin: '4px 0 0', color: '#888', fontSize: 13 },
  form: {},
  heading: { margin: '0 0 20px', color: '#1a1a2e', fontSize: 18, fontWeight: 600 },
  errorBox: {
    background: '#fff5f5',
    border: '1px solid #fca5a5',
    borderLeft: '4px solid #ef4444',
    borderRadius: 8,
    padding: '11px 14px',
    marginBottom: 18,
    color: '#b91c1c',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  errorIcon: { fontSize: 16, flexShrink: 0 },
  field: { marginBottom: 18 },
  label: { display: 'block', marginBottom: 6, fontSize: 13.5, color: '#374151', fontWeight: 600 },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #d1d5db',
    borderRadius: 8,
    fontSize: 15,
    boxSizing: 'border-box',
    background: '#fafafa',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #0073b1 0%, #005f93 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  hint: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 11.5,
    marginTop: 24,
    lineHeight: 1.5,
  },
};
