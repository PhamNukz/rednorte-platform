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
               background: 'linear-gradient(145deg,#060d1e 0%,#0b1f42 50%,#0d3468 100%)',
               position: 'relative', overflow: 'hidden' },
  bg:        { position: 'absolute', inset: 0, pointerEvents: 'none',
               backgroundImage: `
                 radial-gradient(ellipse 70% 55% at 15% 35%,rgba(0,115,177,0.25) 0%,transparent 60%),
                 radial-gradient(ellipse 50% 45% at 85% 70%,rgba(6,182,212,0.14) 0%,transparent 55%)` },
  backBtn:   { position: 'absolute', top: 22, left: 26,
               background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)',
               border: '1px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.85)',
               padding: '8px 18px', borderRadius: 10, cursor: 'pointer', fontSize: 13, zIndex: 10,
               fontWeight: 500 },
  card:      { position: 'relative', background: '#fff', borderRadius: 22,
               padding: '44px 46px 36px', width: 430, maxWidth: '92vw',
               boxShadow: '0 32px 96px rgba(0,0,0,0.38)' },
  iconWrap:  { textAlign: 'center', marginBottom: 20 },
  iconCircle:{ width: 68, height: 68, borderRadius: 20, display: 'inline-flex',
               alignItems: 'center', justifyContent: 'center', fontSize: 30,
               boxShadow: '0 8px 28px rgba(0,0,0,0.22)' },
  title:     { margin: '0 0 8px', color: '#0f172a', fontSize: 23, fontWeight: 900,
               textAlign: 'center', letterSpacing: '-0.6px' },
  sub:       { margin: '0 0 26px', color: '#94a3b8', fontSize: 13, textAlign: 'center', lineHeight: 1.6 },
  errorBox:  { background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444',
               borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#dc2626',
               fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 },
  field:     { marginBottom: 20 },
  label:     { display: 'block', marginBottom: 7, fontSize: 13, color: '#374151', fontWeight: 700 },
  input:     { width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0',
               borderRadius: 10, fontSize: 14, background: '#f8fafc',
               boxSizing: 'border-box', color: '#0f172a' },
  btn:       { width: '100%', padding: '13px', color: '#fff', border: 'none', borderRadius: 10,
               fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 6,
               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
               boxShadow: '0 4px 18px rgba(0,0,0,0.28)', letterSpacing: '0.1px' },
  switchWrap:{ textAlign: 'center', marginTop: 22, fontSize: 13, color: '#94a3b8' },
  switchLink:{ background: 'none', border: 'none', color: '#0073b1', cursor: 'pointer',
               fontSize: 13, fontWeight: 700 },
  hint:      { marginTop: 22, padding: '14px 16px',
               background: 'linear-gradient(135deg,#f0f9ff,#f8fafc)',
               border: '1px solid #e0f2fe',
               borderRadius: 12, fontSize: 12, color: '#64748b', lineHeight: 1.8 },
};
