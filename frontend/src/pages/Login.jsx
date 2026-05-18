import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { validarRut, limpiarRut, formatearRutInput } from '../utils/rut';

export default function Login() {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [noAccount, setNoAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

  const handleRutChange = (e) => {
    setRut(formatearRutInput(e.target.value));
    setError('');
    setNoAccount(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    const clean = limpiarRut(rut);
    if (!validarRut(clean)) {
      setError('RUT inválido. Verifica el formato y el dígito verificador (Ej: 12345678-9).');
      setErrorKey(k => k + 1);
      return;
    }

    setError('');
    setNoAccount(false);
    setLoading(true);

    try {
      const data = await login(clean, password);
      if (data.rol === 'paciente')     navigate('/mis-horas', { replace: true });
      else if (data.rol === 'medico')  navigate('/doctor',    { replace: true });
      else                             navigate('/admin',     { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        // Distinguir "no existe" de "contraseña incorrecta"
        try {
          const check = await authService.checkRut(clean);
          if (!check.data.exists) {
            setNoAccount(true);
            setError('Este RUT no tiene cuenta registrada.');
          } else {
            setError('Contraseña incorrecta. Intenta nuevamente.');
          }
        } catch {
          setError('RUT o contraseña incorrectos.');
        }
      } else {
        setError(err.response?.data?.error || 'Error de conexión. Intente nuevamente.');
      }
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

          {error && (
            <div
              key={errorKey}
              style={styles.errorBox}
              className="error-box animate-fadeIn"
              role="alert"
            >
              <span style={styles.errorIcon}>⚠</span>
              <span>
                {error}
                {noAccount && (
                  <>
                    {' '}
                    <button
                      type="button"
                      onClick={() => navigate('/reservar')}
                      style={styles.linkBtn}
                    >
                      Crear cuenta →
                    </button>
                  </>
                )}
              </span>
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
              onChange={handleRutChange}
              autoComplete="username"
              maxLength={10}
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
    background: 'linear-gradient(145deg, #060d1e 0%, #0b1f42 50%, #0d3468 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute', inset: 0,
    backgroundImage: `
      radial-gradient(ellipse 70% 55% at 15% 35%, rgba(0,115,177,0.25) 0%, transparent 60%),
      radial-gradient(ellipse 50% 45% at 85% 70%, rgba(6,182,212,0.14) 0%, transparent 55%)`,
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    background: '#fff',
    borderRadius: 20,
    padding: '44px 48px 36px',
    boxShadow: '0 32px 96px rgba(0,0,0,0.38)',
    width: 430,
    maxWidth: '92vw',
  },
  logoSection: { textAlign: 'center', marginBottom: 30 },
  logoIcon: { marginBottom: 12 },
  brand: { margin: 0, color: '#0073b1', fontSize: 32, fontWeight: 900, letterSpacing: '-1px' },
  brandSub: { margin: '4px 0 0', color: '#94a3b8', fontSize: 13, fontWeight: 500 },
  form: {},
  heading: { margin: '0 0 22px', color: '#0f172a', fontSize: 19, fontWeight: 700, letterSpacing: '-0.3px' },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderLeft: '4px solid #ef4444',
    borderRadius: 10,
    padding: '11px 14px',
    marginBottom: 18,
    color: '#dc2626',
    fontSize: 13.5,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  errorIcon: { fontSize: 16, flexShrink: 0 },
  field: { marginBottom: 20 },
  label: { display: 'block', marginBottom: 7, fontSize: 13, color: '#374151', fontWeight: 700 },
  input: {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    fontSize: 15,
    boxSizing: 'border-box',
    background: '#f8fafc',
    color: '#0f172a',
  },
  button: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #0073b1 0%, #005a8e 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 800,
    marginTop: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    boxShadow: '0 4px 18px rgba(0,115,177,0.38)',
  },
  hint: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 26,
    lineHeight: 1.6,
  },
  linkBtn: {
    background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer',
    fontSize: 13, fontWeight: 700, textDecoration: 'underline', padding: 0,
  },
};
