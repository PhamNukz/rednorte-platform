import { useNavigate } from 'react-router-dom';

const ESPECIALIDADES = [
  { id: 'Medicina General',  icon: '🩺', desc: 'Consulta general y preventiva' },
  { id: 'Cardiología',       icon: '❤️', desc: 'Corazón y sistema cardiovascular' },
  { id: 'Neurología',        icon: '🧠', desc: 'Sistema nervioso y cerebro' },
  { id: 'Traumatología',     icon: '🦴', desc: 'Huesos, músculos y articulaciones' },
  { id: 'Ginecología',       icon: '🌸', desc: 'Salud femenina y reproductiva' },
  { id: 'Pediatría',         icon: '👶', desc: 'Atención médica infantil' },
  { id: 'Cirugía General',   icon: '🏥', desc: 'Procedimientos quirúrgicos' },
  { id: 'Dermatología',      icon: '🔬', desc: 'Piel, cabello y uñas' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      {/* ── Navbar ── */}
      <header style={s.nav}>
        <div style={s.navInner}>
          <div style={s.brand}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#0073b1"/>
              <rect x="14" y="7"  width="4" height="18" rx="2" fill="#fff"/>
              <rect x="7"  y="14" width="18" height="4" rx="2" fill="#fff"/>
            </svg>
            <span style={s.brandText}>RedNorte</span>
            <span style={s.brandSub}>Salud Pública</span>
          </div>
          <div style={s.navActions}>
            <button onClick={() => navigate('/profesional')} style={s.navBtnOutline} className="btn-animate">
              👨‍⚕️ Acceso Profesional
            </button>
            <button onClick={() => navigate('/profesional?role=admin')} style={s.navBtnSolid} className="btn-animate">
              🔐 Administración
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroContent} className="animate-fadeInUp">
          <div style={s.heroEmojiWrap}>
            <span style={s.heroEmoji} className="hero-icon">🏥</span>
          </div>
          <h1 style={s.heroTitle}>Tu salud, nuestra prioridad</h1>
          <p style={s.heroSub}>
            Reserva horas médicas, consulta el estado de tus solicitudes y gestiona tu atención en los
            centros RedNorte de forma rápida y segura.
          </p>
          <div style={s.heroButtons}>
            <button
              onClick={() => navigate('/reservar')}
              style={s.btnPrimary}
              className="btn-animate animate-scaleIn delay-2"
            >
              📅 Reservar Hora
            </button>
            <button
              onClick={() => navigate('/mis-horas')}
              style={s.btnSecondary}
              className="btn-animate animate-scaleIn delay-3"
            >
              🔍 Consultar mi Hora
            </button>
          </div>
        </div>
      </section>

      {/* ── Especialidades ── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle} className="animate-fadeIn">Nuestras Especialidades</h2>
          <p style={s.sectionSub}>Selecciona la especialidad que necesitas para comenzar tu reserva</p>
          <div style={s.espGrid}>
            {ESPECIALIDADES.map(({ id, icon, desc }, i) => (
              <div
                key={id}
                onClick={() => navigate(`/reservar?especialidad=${encodeURIComponent(id)}`)}
                style={s.espCard}
                className={`service-card animate-fadeInUp delay-${Math.min(i + 1, 5)}`}
              >
                <div style={s.espIcon}>{icon}</div>
                <div style={s.espName}>{id}</div>
                <div style={s.espDesc}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.footerBrand}>RedNorte</span>
          <span style={s.footerText}>Sistema Público de Gestión de Salud · 2025</span>
          <div style={s.footerLinks}>
            <button onClick={() => navigate('/profesional')} style={s.footerLink}>Profesionales</button>
            <span style={{ color: '#4b5563' }}>·</span>
            <button onClick={() => navigate('/profesional?role=admin')} style={s.footerLink}>Administración</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Estilos ─────────────────────────────────────────────────────────────── */
const s = {
  page:        { minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' },

  // Navbar
  nav:         { background: '#fff', borderBottom: '1px solid #e5e7eb',
                 boxShadow: '0 1px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 100 },
  navInner:    { maxWidth: 1140, margin: '0 auto', padding: '0 24px', height: 64,
                 display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brand:       { display: 'flex', alignItems: 'center', gap: 10 },
  brandText:   { fontSize: 20, fontWeight: 800, color: '#0073b1', letterSpacing: '-0.5px' },
  brandSub:    { fontSize: 11, color: '#9ca3af', fontWeight: 500, letterSpacing: '0.5px',
                 textTransform: 'uppercase', marginTop: 2 },
  navActions:  { display: 'flex', gap: 10 },
  navBtnOutline:{ border: '1.5px solid #0073b1', color: '#0073b1', background: 'none',
                  padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  navBtnSolid: { background: '#0073b1', color: '#fff', border: 'none',
                 padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },

  // Hero
  hero:        { background: 'linear-gradient(135deg, #0a1628 0%, #0d2547 45%, #0073b1 100%)',
                 padding: '80px 24px 100px', position: 'relative', overflow: 'hidden' },
  heroBg:      { position: 'absolute', inset: 0,
                 backgroundImage: `radial-gradient(circle at 15% 50%, rgba(0,115,177,0.25) 0%, transparent 50%),
                                   radial-gradient(circle at 85% 20%, rgba(99,179,237,0.15) 0%, transparent 45%)`,
                 pointerEvents: 'none' },
  heroContent: { maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' },
  heroEmojiWrap:{ marginBottom: 16 },
  heroEmoji:   { fontSize: 52, display: 'inline-block' },
  heroTitle:   { fontSize: 42, fontWeight: 800, color: '#fff', lineHeight: 1.15,
                 letterSpacing: '-1px', margin: '0 0 16px' },
  heroSub:     { fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, margin: '0 0 36px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' },
  heroButtons: { display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' },
  btnPrimary:  { background: '#fff', color: '#0073b1', border: 'none',
                 padding: '14px 32px', borderRadius: 10, cursor: 'pointer',
                 fontSize: 15, fontWeight: 700, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  btnSecondary:{ background: 'rgba(255,255,255,0.15)', color: '#fff',
                 border: '1.5px solid rgba(255,255,255,0.5)',
                 padding: '14px 32px', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 600 },

  // Especialidades section
  section:     { flex: 1, padding: '60px 24px' },
  sectionInner:{ maxWidth: 1140, margin: '0 auto' },
  sectionTitle:{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', textAlign: 'center', marginBottom: 8 },
  sectionSub:  { color: '#9ca3af', textAlign: 'center', marginBottom: 40, fontSize: 15 },
  espGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  espCard:     { background: '#fff', border: '2px solid #e5e7eb', borderRadius: 14,
                 padding: '24px 20px', textAlign: 'center',
                 boxShadow: '0 2px 10px rgba(0,0,0,0.05)', cursor: 'pointer' },
  espIcon:     { fontSize: 36, marginBottom: 12, display: 'block' },
  espName:     { fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 6 },
  espDesc:     { fontSize: 12, color: '#9ca3af', lineHeight: 1.4 },

  // Footer
  footer:      { background: '#1a1a2e', padding: '24px' },
  footerInner: { maxWidth: 1140, margin: '0 auto', display: 'flex',
                 alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  footerBrand: { color: '#38bdf8', fontWeight: 800, fontSize: 16 },
  footerText:  { color: '#9ca3af', fontSize: 12 },
  footerLinks: { display: 'flex', gap: 12, alignItems: 'center' },
  footerLink:  { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer',
                 fontSize: 12, textDecoration: 'underline' },
};
