import { useEffect, useState, useCallback } from 'react';
import { listaEsperaService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ESTADOS_COLOR = {
  pendiente:   '#f59e0b',
  en_espera:   '#3b82f6',
  asignada:    '#10b981',
  cancelada:   '#ef4444',
  completada:  '#6b7280',
};

const ESTADOS_LABEL = {
  pendiente:  'Pendiente',
  en_espera:  'En Espera',
  asignada:   'Asignada',
  cancelada:  'Cancelada',
  completada: 'Completada',
};

export default function PortalPaciente() {
  const { user, logout } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('solicitudes');
  // Key para re-animar el contenido al cambiar de tab
  const [tabKey, setTabKey] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const res = await listaEsperaService.listar();
      setSolicitudes(res.data.data || []);
    } catch {
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const changeTab = (t) => {
    if (t === tab) return;
    setTab(t);
    setTabKey(k => k + 1);
  };

  const TABS = [
    { key: 'solicitudes', label: 'Mis Solicitudes' },
    { key: 'historial',   label: 'Historial' },
    { key: 'notificaciones', label: 'Notificaciones' },
  ];

  return (
    <div style={s.layout}>
      {/* ── Header ── */}
      <header style={s.header} className="header-animate">
        <div style={s.headerLeft}>
          <span style={s.headerLogo}>RedNorte</span>
          <span style={s.headerTitle}>Portal del Paciente</span>
        </div>
        <div style={s.headerRight}>
          <span style={s.rut}>RUT: {user?.rut}</span>
          <button onClick={logout} style={s.logoutBtn} className="btn-animate">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* ── Tabs ── */}
      <nav style={s.nav}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => changeTab(key)}
            style={s.tab}
            className={`nav-tab${tab === key ? ' active' : ''}`}
          >
            <span style={{ ...s.tabText, color: tab === key ? '#0073b1' : '#666',
              fontWeight: tab === key ? 700 : 400 }}>
              {label}
            </span>
          </button>
        ))}
      </nav>

      {/* ── Contenido ── */}
      <main style={s.main}>
        {loading ? (
          <SkeletonList />
        ) : (
          <div key={tabKey} className="tab-content">
            {tab === 'solicitudes' && <TabSolicitudes solicitudes={solicitudes} />}
            {tab === 'historial'   && <TabHistorial />}
            {tab === 'notificaciones' && <TabNotificaciones />}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Sub-componentes ─────────────────────────────────────────────────────── */

function TabSolicitudes({ solicitudes }) {
  return (
    <section>
      <h2 style={s.sectionTitle}>Mis Solicitudes en Lista de Espera</h2>
      {solicitudes.length === 0 ? (
        <div style={s.emptyState} className="animate-fadeIn">
          <div style={s.emptyIcon}>📋</div>
          <p style={s.emptyText}>No tienes solicitudes activas.</p>
        </div>
      ) : (
        <div style={s.cardGrid}>
          {solicitudes.map((sol, i) => (
            <div
              key={sol.id}
              style={s.card}
              className={`card-hover animate-fadeInUp delay-${Math.min(i + 1, 5)}`}
            >
              <div style={s.cardHeader}>
                <span style={s.cardEsp}>{sol.especialidad}</span>
                <span
                  style={{ ...s.badge, background: ESTADOS_COLOR[sol.estado] || '#999' }}
                  className="badge-animate"
                >
                  {ESTADOS_LABEL[sol.estado] || sol.estado}
                </span>
              </div>
              <div style={s.divider} />
              <dl style={s.dl}>
                <Row label="Tipo"       value={sol.tipo} />
                <Row label="Prioridad"  value={sol.prioridad} highlight={sol.prioridad === 'critica' || sol.prioridad === 'alta'} />
                <Row label="Ingresado"  value={fmtDate(sol.fecha_ingreso)} />
                {sol.fecha_asignacion && <Row label="Asignado" value={fmtDate(sol.fecha_asignacion)} />}
                {sol.hospital_origen   && <Row label="Hospital" value={sol.hospital_origen} />}
              </dl>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function TabHistorial() {
  return (
    <section className="animate-fadeInUp">
      <h2 style={s.sectionTitle}>Historial de Citas</h2>
      <div style={s.emptyState}>
        <div style={s.emptyIcon}>📅</div>
        <p style={s.emptyText}>Tu historial de citas aparecerá aquí.</p>
      </div>
    </section>
  );
}

function TabNotificaciones() {
  return (
    <section className="animate-fadeInUp">
      <h2 style={s.sectionTitle}>Notificaciones</h2>
      <div style={s.emptyState}>
        <div style={s.emptyIcon}>🔔</div>
        <p style={s.emptyText}>Sin notificaciones por el momento.</p>
      </div>
    </section>
  );
}

function Row({ label, value, highlight }) {
  return (
    <>
      <dt style={s.dt}>{label}</dt>
      <dd style={{ ...s.dd, color: highlight ? '#ef4444' : '#374151', fontWeight: highlight ? 700 : 400 }}>
        {value}
      </dd>
    </>
  );
}

function SkeletonList() {
  return (
    <div style={s.cardGrid}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ ...s.card, padding: 20 }}>
          <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: '75%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: '50%' }} />
        </div>
      ))}
    </div>
  );
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CL', { day:'2-digit', month:'short', year:'numeric' }) : '—';

/* ── Estilos ─────────────────────────────────────────────────────────────── */
const s = {
  layout:      { minHeight: '100vh', background: '#f0f4f8', display: 'flex', flexDirection: 'column' },
  header:      { background: 'linear-gradient(135deg,#0073b1,#005f93)', color: '#fff',
                 padding: '14px 32px', display: 'flex', justifyContent: 'space-between',
                 alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' },
  headerLeft:  { display: 'flex', alignItems: 'baseline', gap: 12 },
  headerLogo:  { fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' },
  headerTitle: { fontSize: 14, opacity: 0.85 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
  rut:         { fontSize: 13, opacity: 0.8 },
  logoutBtn:   { background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)',
                 color: '#fff', padding: '6px 16px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  nav:         { background: '#fff', borderBottom: '2px solid #e5e7eb', padding: '0 32px',
                 display: 'flex', gap: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  tab:         { padding: '14px 22px', background: 'none', border: 'none', cursor: 'pointer', outline: 'none' },
  tabText:     { fontSize: 14, transition: 'color 0.18s' },
  main:        { flex: 1, padding: '32px', maxWidth: 1000, margin: '0 auto', width: '100%' },
  sectionTitle:{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 22 },
  cardGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 },
  card:        { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
                 padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardEsp:     { fontSize: 15, fontWeight: 700, color: '#1a1a2e' },
  badge:       { padding: '4px 12px', borderRadius: 20, color: '#fff', fontSize: 11,
                 fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' },
  divider:     { height: 1, background: '#f1f5f9', marginBottom: 12 },
  dl:          { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px' },
  dt:          { fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', alignSelf: 'start', paddingTop: 1 },
  dd:          { fontSize: 13, margin: 0 },
  emptyState:  { textAlign: 'center', padding: '60px 0' },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyText:   { color: '#9ca3af', fontSize: 15 },
};
