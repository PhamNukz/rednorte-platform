import { useNavigate } from 'react-router-dom';

const ESPECIALIDADES = [
  { id: 'Medicina General',  icon: '🩺', desc: 'Consulta general y preventiva',       color: '#0073b1' },
  { id: 'Cardiología',       icon: '❤️', desc: 'Corazón y sistema cardiovascular',    color: '#ef4444' },
  { id: 'Neurología',        icon: '🧠', desc: 'Sistema nervioso y cerebro',          color: '#8b5cf6' },
  { id: 'Traumatología',     icon: '🦴', desc: 'Huesos, músculos y articulaciones',   color: '#f59e0b' },
  { id: 'Ginecología',       icon: '🌸', desc: 'Salud femenina y reproductiva',       color: '#ec4899' },
  { id: 'Pediatría',         icon: '👶', desc: 'Atención médica infantil',            color: '#10b981' },
  { id: 'Cirugía General',   icon: '🏥', desc: 'Procedimientos quirúrgicos',          color: '#06b6d4' },
  { id: 'Dermatología',      icon: '🔬', desc: 'Piel, cabello y uñas',               color: '#f97316' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      {/* ── Navbar ── */}
      <header style={s.nav}>
        <div style={s.navInner}>
          <div style={s.brand}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#0073b1"/>
              <rect x="14" y="7"  width="4" height="18" rx="2" fill="#fff"/>
              <rect x="7"  y="14" width="18" height="4" rx="2" fill="#fff"/>
            </svg>
            <div>
              <span style={s.brandText}>RedNorte</span>
              <span style={s.brandSub}>Salud Pública</span>
            </div>
          </div>
          <div style={s.navActions}>
            <button onClick={() => navigate('/profesional')} style={s.navBtnOutline} className="btn-animate">
              👨‍⚕️ Profesionales
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
        <div style={s.heroGrid} />
        <div style={s.heroContent} className="animate-fadeInUp">
          <div style={s.heroBadge} className="animate-scaleIn">
            <span style={s.heroBadgeDot} />
            Sistema activo · Atención disponible
          </div>
          <h1 style={s.heroTitle}>
            Tu salud,<br />
            <span className="gradient-text">nuestra prioridad</span>
          </h1>
          <p style={s.heroSub}>
            Reserva horas médicas, consulta el estado de tus solicitudes y gestiona
            tu atención en los centros RedNorte de forma rápida y segura.
          </p>
          <div style={s.heroButtons}>
            <button onClick={() => navigate('/reservar')} style={s.btnPrimary}
              className="btn-animate animate-scaleIn delay-2">
              <span>📅</span> Reservar Hora
            </button>
            <button onClick={() => navigate('/mis-horas')} style={s.btnSecondary}
              className="btn-animate animate-scaleIn delay-3">
              <span>🔍</span> Mis Horas
            </button>
          </div>
          <div style={s.statsStrip} className="animate-fadeIn delay-4">
            {[
              { n: '9',   label: 'Especialidades' },
              { n: '102', label: 'Horas disponibles' },
              { n: '24h', label: 'Atención continua' },
            ].map(({ n, label }) => (
              <div key={label} style={s.statItem}>
                <span style={s.statNum}>{n}</span>
                <span style={s.statLbl}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={s.heroEmoji} className="hero-icon">🏥</div>
      </section>

      {/* ── Especialidades ── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionHead} className="animate-fadeIn">
            <div style={s.eyebrow}>Nuestros Servicios</div>
            <h2 style={s.sectionTitle}>Especialidades Médicas</h2>
            <p style={s.sectionSub}>Selecciona la especialidad para comenzar tu reserva directamente</p>
          </div>
          <div style={s.espGrid}>
            {ESPECIALIDADES.map(({ id, icon, desc, color }, i) => (
              <div
                key={id}
                onClick={() => navigate(`/reservar?especialidad=${encodeURIComponent(id)}`)}
                style={s.espCard}
                className={`service-card animate-fadeInUp delay-${Math.min(i % 5 + 1, 5)}`}
              >
                <div style={{ ...s.espIconWrap, background: `${color}15`, border: `1.5px solid ${color}28` }}>
                  <span style={s.espIcon}>{icon}</span>
                </div>
                <div style={s.espName}>{id}</div>
                <div style={s.espDesc}>{desc}</div>
                <div style={{ ...s.espArrow, color }}>→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={s.cta}>
        <div style={s.ctaInner}>
          <div>
            <h3 style={s.ctaTitle}>¿Primera vez en RedNorte?</h3>
            <p style={s.ctaSub}>Crea tu reserva en menos de 3 minutos, sin trámites presenciales.</p>
          </div>
          <button onClick={() => navigate('/reservar')} style={s.ctaBtn} className="btn-animate">
            Comenzar ahora →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerLeft}>
            <span style={s.footerBrand}>RedNorte</span>
            <span style={s.footerText}>Sistema Público de Gestión de Salud · 2025</span>
          </div>
          <div style={s.footerLinks}>
            <button onClick={() => navigate('/profesional')} style={s.footerLink}>Profesionales</button>
            <span style={{ color: '#334155' }}>·</span>
            <button onClick={() => navigate('/profesional?role=admin')} style={s.footerLink}>Administración</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' },

  nav:          { background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(16px)',
                  borderBottom: '1px solid #e8edf3', boxShadow: '0 1px 12px rgba(0,0,0,0.05)',
                  position: 'sticky', top: 0, zIndex: 100 },
  navInner:     { maxWidth: 1160, margin: '0 auto', padding: '0 28px', height: 66,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brand:        { display: 'flex', alignItems: 'center', gap: 12 },
  brandText:    { fontSize: 20, fontWeight: 900, color: '#0073b1', letterSpacing: '-0.6px',
                  display: 'block', lineHeight: 1.1 },
  brandSub:     { fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '1px',
                  textTransform: 'uppercase', display: 'block' },
  navActions:   { display: 'flex', gap: 10 },
  navBtnOutline:{ border: '1.5px solid #0073b1', color: '#0073b1', background: 'none',
                  padding: '8px 18px', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  navBtnSolid:  { background: 'linear-gradient(135deg,#0073b1,#005a8e)', color: '#fff', border: 'none',
                  padding: '8px 18px', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  boxShadow: '0 3px 14px rgba(0,115,177,0.35)' },

  hero:         { background: 'linear-gradient(145deg,#060d1e 0%,#0b1f42 45%,#0d3468 100%)',
                  padding: '96px 28px 108px', position: 'relative', overflow: 'hidden',
                  display: 'flex', justifyContent: 'center' },
  heroBg:       { position: 'absolute', inset: 0, pointerEvents: 'none',
                  backgroundImage: `
                    radial-gradient(ellipse 80% 60% at 10% 40%,rgba(0,115,177,0.32) 0%,transparent 60%),
                    radial-gradient(ellipse 50% 50% at 90% 15%,rgba(6,182,212,0.2) 0%,transparent 55%),
                    radial-gradient(ellipse 40% 40% at 80% 85%,rgba(0,115,177,0.12) 0%,transparent 50%)` },
  heroGrid:     { position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
                  backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),
                                    linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)`,
                  backgroundSize: '48px 48px' },
  heroContent:  { maxWidth: 660, textAlign: 'center', position: 'relative', zIndex: 1 },
  heroBadge:    { display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.28)',
                  borderRadius: 99, padding: '6px 16px', marginBottom: 28,
                  color: '#6ee7b7', fontSize: 12, fontWeight: 600, letterSpacing: '0.3px' },
  heroBadgeDot: { width: 7, height: 7, borderRadius: '50%', background: '#10b981',
                  boxShadow: '0 0 8px #10b981', flexShrink: 0 },
  heroTitle:    { fontSize: 54, fontWeight: 900, color: '#fff', lineHeight: 1.08,
                  letterSpacing: '-2px', margin: '0 0 22px' },
  heroSub:      { fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.78,
                  margin: '0 0 42px', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' },
  heroButtons:  { display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52 },
  btnPrimary:   { background: '#fff', color: '#0073b1', border: 'none',
                  padding: '15px 36px', borderRadius: 12, cursor: 'pointer',
                  fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 8px 28px rgba(0,0,0,0.25)' },
  btnSecondary: { color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)',
                  padding: '15px 36px', borderRadius: 12, cursor: 'pointer',
                  fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 },
  statsStrip:   { display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' },
  statItem:     { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
  statNum:      { fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1 },
  statLbl:      { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500,
                  textTransform: 'uppercase', letterSpacing: '0.6px' },
  heroEmoji:    { position: 'absolute', right: '10%', top: '50%', transform: 'translateY(-50%)',
                  fontSize: 96, opacity: 0.1, pointerEvents: 'none' },

  section:      { flex: 1, padding: '76px 28px' },
  sectionInner: { maxWidth: 1160, margin: '0 auto' },
  sectionHead:  { textAlign: 'center', marginBottom: 52 },
  eyebrow:      { fontSize: 11, fontWeight: 700, color: '#0073b1', letterSpacing: '1.5px',
                  textTransform: 'uppercase', marginBottom: 12 },
  sectionTitle: { fontSize: 34, fontWeight: 900, color: '#0f172a', marginBottom: 14, letterSpacing: '-1px' },
  sectionSub:   { color: '#64748b', fontSize: 15, lineHeight: 1.65 },
  espGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(235px,1fr))', gap: 18 },
  espCard:      { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 18,
                  padding: '28px 22px 22px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  espIconWrap:  { width: 64, height: 64, borderRadius: 18, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  espIcon:      { fontSize: 30 },
  espName:      { fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.2px', textAlign: 'center' },
  espDesc:      { fontSize: 12, color: '#94a3b8', lineHeight: 1.55, flexGrow: 1, textAlign: 'center' },
  espArrow:     { fontSize: 16, fontWeight: 800 },

  cta:          { background: 'linear-gradient(135deg,#0073b1 0%,#0d2244 100%)', padding: '48px 28px' },
  ctaInner:     { maxWidth: 1160, margin: '0 auto', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' },
  ctaTitle:     { fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' },
  ctaSub:       { fontSize: 15, color: 'rgba(255,255,255,0.68)' },
  ctaBtn:       { background: '#fff', color: '#0073b1', border: 'none',
                  padding: '14px 30px', borderRadius: 11, cursor: 'pointer',
                  fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)' },

  footer:       { background: '#080f1e', padding: '28px' },
  footerInner:  { maxWidth: 1160, margin: '0 auto', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  footerLeft:   { display: 'flex', alignItems: 'center', gap: 20 },
  footerBrand:  { color: '#38bdf8', fontWeight: 900, fontSize: 16, letterSpacing: '-0.3px' },
  footerText:   { color: '#475569', fontSize: 12 },
  footerLinks:  { display: 'flex', gap: 14, alignItems: 'center' },
  footerLink:   { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 12 },
};
