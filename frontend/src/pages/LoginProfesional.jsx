import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginProfesional() {
  const [params] = useSearchParams();
  const isAdmin = params.get('role') === 'admin';

  const [rut, setRut]         = useState('');
  const [password, setPass]   = useState('');
  const [error, setError]     = useState('');
  const [errorKey, setErrKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();
  const formRef               = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const data = await login(rut, password);
      if (data.rol === 'admin') {
        navigate('/admin', { replace: true });
      } else if (data.rol === 'medico') {
        navigate('/doctor', { replace: true });
      } else {
        // Paciente no puede entrar por este login
        setError('Esta área es exclusiva para profesionales y administradores.');
        setErrKey(k => k + 1);
      }
    } catch (err) {
      const msg = err.response?.status === 401
        ? 'RUT o contraseña incorrectos'
        : 'Error de conexión. Intente nuevamente.';
      setError(msg);
      setErrKey(k => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={st.page} className="page-enter">
      <div style={st.bg} />

      {/* ── Back to landing ── */}
      <button onClick={() => navigate('/')} style={st.backBtn} className="btn-animate">
        ← Volver al inicio
      </button>

      <div style={st.card} className="login-card">
        {/* ── Icon ── */}
        <div style={st.iconWrap} className="animate-scaleIn">
          <div style={{ ...st.iconCircle, background: isAdmin ? '#1a1a2e' : '#0073b1' }}>
            {isAdmin ? '🔐' : '👨‍⚕️'}
          </div>
        </div>

        <h1 style={st.title} className="animate-fadeIn delay-1">
          {isAdmin ? 'Panel Administrativo' : 'Portal del Profesional'}
        </h1>
        <p style={st.sub} className="animate-fadeIn delay-1">
          {isAdmin ? 'Acceso exclusivo para administradores del sistema' : 'Acceso exclusivo para médicos y profesionales de la salud'}
        </p>

        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          {error && (
            <div key={errorKey} style={st.errorBox} className="error-box animate-fadeIn" role="alert">
              <span>⚠</span> {error}
            </div>
          )}

          <div style={st.field} className="animate-fadeInUp delay-2">
            <label style={st.label}>RUT</label>
            <input
              className="input-field"
              style={st.input}
              type="text"
              placeholder="12.345.678-9"
              value={rut}
              onChange={e => setRut(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div style={st.field} className="animate-fadeInUp delay-3">
            <label style={st.label}>Contraseña</label>
            <input
              className="input-field"
              style={st.input}
              type="password"
              value={password}
              onChange={e => setPass(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            style={{
              ...st.btn,
              background: isAdmin
                ? 'linear-gradient(135deg,#1a1a2e,#0d2547)'
                : 'linear-gradient(135deg,#0073b1,#005f93)',
              opacity: loading ? 0.82 : 1,
            }}
            disabled={loading}
            className="btn-animate animate-fadeInUp delay-4"
          >
            {loading
              ? <><span className="spinner" />Verificando...</>
              : `Ingresar como ${isAdmin ? 'Administrador' : 'Profesional'}`}
          </button>
        </form>

        {/* ── Switch link ── */}
        <div style={st.switchWrap} className="animate-fadeIn delay-5">
          {isAdmin ? (
            <span>
              ¿Eres médico?{' '}
              <button onClick={() => navigate('/profesional')} style={st.switchLink}>
                Acceso profesional →
              </button>
            </span>
          ) : (
            <span>
              ¿Eres administrador?{' '}
              <button onClick={() => navigate('/profesional?role=admin')} style={st.switchLink}>
                Acceso administrativo →
              </button>
            </span>
          )}
        </div>

        {/* ── Credentials hint (demo) ── */}
        <div style={st.hint}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Usuarios de demo</p>
          <p>Admin: <code>12345678-9</code> / <code>Admin1234</code></p>
          <p>Médico: <code>44444444-4</code> / <code>Admin1234</code></p>
        </div>
      </div>
    </div>
  );
}

const st = {
  page:      { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
               background: 'linear-gradient(135deg,#0a1628 0%,#0d2137 50%,#0a3356 100%)',
               position: 'relative', overflow: 'hidden' },
  bg:        { position: 'absolute', inset: 0,
               backgroundImage: `radial-gradient(circle at 20% 30%, rgba(0,115,177,0.18) 0%, transparent 55%),
                                 radial-gradient(circle at 80% 70%, rgba(0,115,177,0.1) 0%, transparent 55%)`,
               pointerEvents: 'none' },
  backBtn:   { position: 'absolute', top: 20, left: 24, background: 'rgba(255,255,255,0.1)',
               border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '7px 16px',
               borderRadius: 8, cursor: 'pointer', fontSize: 13, zIndex: 10 },
  card:      { position: 'relative', background: '#fff', borderRadius: 16, padding: '40px 44px 32px',
               width: 420, maxWidth: '92vw', boxShadow: '0 24px 80px rgba(0,0,0,0.35)' },
  iconWrap:  { textAlign: 'center', marginBottom: 18 },
  iconCircle:{ width: 64, height: 64, borderRadius: '50%', display: 'inline-flex',
               alignItems: 'center', justifyContent: 'center', fontSize: 28,
               boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  title:     { margin: '0 0 6px', color: '#1a1a2e', fontSize: 22, fontWeight: 800,
               textAlign: 'center', letterSpacing: '-0.5px' },
  sub:       { margin: '0 0 24px', color: '#9ca3af', fontSize: 13, textAlign: 'center', lineHeight: 1.5 },
  errorBox:  { background: '#fff5f5', border: '1px solid #fca5a5', borderLeft: '4px solid #ef4444',
               borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#b91c1c',
               fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 },
  field:     { marginBottom: 18 },
  label:     { display: 'block', marginBottom: 6, fontSize: 13, color: '#374151', fontWeight: 600 },
  input:     { width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db',
               borderRadius: 8, fontSize: 14, background: '#fafafa', boxSizing: 'border-box' },
  btn:       { width: '100%', padding: '12px', color: '#fff', border: 'none', borderRadius: 8,
               fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4,
               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  switchWrap:{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#9ca3af' },
  switchLink:{ background: 'none', border: 'none', color: '#0073b1', cursor: 'pointer',
               fontSize: 13, fontWeight: 600, textDecoration: 'underline' },
  hint:      { marginTop: 20, padding: '12px 16px', background: '#f8fafc', borderRadius: 8,
               fontSize: 12, color: '#9ca3af', lineHeight: 1.7 },
};
