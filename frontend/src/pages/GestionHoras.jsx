import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listaEsperaService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { key: 'consultar', label: '🔍 Consultar hora',   desc: 'Ver estado de tus solicitudes' },
  { key: 'confirmar', label: '✅ Confirmar hora',    desc: 'Confirmar solicitudes pendientes' },
  { key: 'anular',    label: '❌ Anular hora',        desc: 'Cancelar una hora reservada' },
  { key: 'cambiar',   label: '🔄 Cambiar hora',       desc: 'Modificar tu solicitud' },
];

const ESTADO_COLOR = {
  pendiente:  '#f59e0b',
  en_espera:  '#3b82f6',
  asignada:   '#10b981',
  cancelada:  '#ef4444',
  completada: '#6b7280',
};
const ESTADO_LABEL = {
  pendiente:  'Pendiente',
  en_espera:  'En Espera',
  asignada:   'Asignada',
  cancelada:  'Cancelada',
  completada: 'Completada',
};

export default function GestionHoras() {
  const navigate        = useNavigate();
  const [params]        = useSearchParams();
  const { user, isAuthenticated, logout } = useAuth();
  const [tab, setTab]   = useState(params.get('tab') || 'consultar');
  const [tabKey, setTabKey] = useState(0);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Si no está logueado, redirige al login
  const requireAuth = () => {
    if (!isAuthenticated) navigate('/login');
  };

  useEffect(() => { requireAuth(); }, [isAuthenticated]); // eslint-disable-line

  const fetchSolicitudes = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await listaEsperaService.listar();
      setSolicitudes(res.data.data || []);
    } catch {
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchSolicitudes(); }, [fetchSolicitudes]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const changeTab = (t) => {
    requireAuth();
    setTab(t);
    setTabKey(k => k + 1);
  };

  const activas     = solicitudes.filter(s => !['cancelada', 'completada'].includes(s.estado));
  const pendientes  = solicitudes.filter(s => s.estado === 'pendiente');
  const cancelables = solicitudes.filter(s => !['cancelada', 'completada'].includes(s.estado));
  const editables   = solicitudes.filter(s => s.estado === 'pendiente');

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <button onClick={() => navigate('/')} style={s.backBtn}>←</button>
          <span style={s.brand}>RedNorte</span>
          <span style={s.sep}>·</span>
          <span style={s.headerSub}>Gestión de Horas</span>
        </div>
        <div style={s.headerRight}>
          {user && <span style={s.userInfo}>RUT: {user.rut}</span>}
          <button onClick={() => { logout(); navigate('/'); }} style={s.logoutBtn}>Salir</button>
        </div>
      </header>

      {/* ── Nav Tabs ── */}
      <nav style={s.nav}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => changeTab(key)}
            style={s.tab}
            className={`nav-tab${tab === key ? ' active' : ''}`}
          >
            <span style={{ ...s.tabText, color: tab === key ? '#0073b1' : '#555',
              fontWeight: tab === key ? 700 : 400 }}>
              {label}
            </span>
          </button>
        ))}
      </nav>

      {/* ── Content ── */}
      <main style={s.main}>
        {loading ? <Skeleton /> : (
          <div key={tabKey} className="tab-content">
            {tab === 'consultar' && (
              <TabConsultar solicitudes={activas} onRefresh={fetchSolicitudes} />
            )}
            {tab === 'confirmar' && (
              <TabConfirmar
                solicitudes={pendientes}
                onConfirmar={async (id) => {
                  try {
                    await listaEsperaService.actualizarEstado(id, 'en_espera', 'Confirmado por el paciente');
                    showToast('Solicitud confirmada y en lista de espera.');
                    fetchSolicitudes();
                  } catch { showToast('Error al confirmar.', 'error'); }
                }}
              />
            )}
            {tab === 'anular' && (
              <TabAnular
                solicitudes={cancelables}
                onAnular={async (id) => {
                  try {
                    await listaEsperaService.actualizarEstado(id, 'cancelada', 'Cancelado por el paciente');
                    showToast('Hora anulada correctamente.');
                    fetchSolicitudes();
                  } catch { showToast('Error al anular.', 'error'); }
                }}
              />
            )}
            {tab === 'cambiar' && (
              <TabCambiar
                solicitudes={editables}
                onRefresh={() => { fetchSolicitudes(); showToast('Solicitud actualizada.'); }}
              />
            )}
          </div>
        )}
      </main>

      {/* ── Bottom CTA ── */}
      <div style={s.bottomBar}>
        <button onClick={() => navigate('/reservar')} style={s.newBtn} className="btn-animate">
          + Nueva reserva
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ ...s.toast, background: toast.type === 'error' ? '#ef4444' : '#10b981' }}
             className="toast">
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ── Consultar ───────────────────────────────────────────────────────────── */
function TabConsultar({ solicitudes }) {
  if (solicitudes.length === 0) return <EmptyState icon="📋" text="No tienes solicitudes activas." />;
  return (
    <section>
      <h2 style={s.sectionTitle}>Mis solicitudes activas</h2>
      <div style={s.cardGrid}>
        {solicitudes.map((sol, i) => (
          <SolCard key={sol.id} sol={sol} idx={i} />
        ))}
      </div>
    </section>
  );
}

/* ── Confirmar ───────────────────────────────────────────────────────────── */
function TabConfirmar({ solicitudes, onConfirmar }) {
  const [confirming, setConfirming] = useState(null);
  if (solicitudes.length === 0) return <EmptyState icon="✅" text="No tienes solicitudes pendientes de confirmar." />;
  return (
    <section>
      <h2 style={s.sectionTitle}>Confirmar solicitudes</h2>
      <p style={s.sectionDesc}>Las solicitudes en estado <em>Pendiente</em> requieren tu confirmación para ingresar a la lista de espera.</p>
      <div style={s.cardGrid}>
        {solicitudes.map((sol, i) => (
          <div key={sol.id} style={s.card} className={`card-hover animate-fadeInUp delay-${Math.min(i+1,5)}`}>
            <CardHead sol={sol} />
            <button
              style={{ ...s.actionBtn, background: '#10b981', marginTop: 14, width: '100%' }}
              disabled={confirming === sol.id}
              onClick={async () => { setConfirming(sol.id); await onConfirmar(sol.id); setConfirming(null); }}
              className="btn-animate"
            >
              {confirming === sol.id ? 'Confirmando…' : '✅ Confirmar esta hora'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Anular ──────────────────────────────────────────────────────────────── */
function TabAnular({ solicitudes, onAnular }) {
  const [selected, setSelected] = useState(null);
  const [anulando, setAnulando] = useState(false);

  if (solicitudes.length === 0) return <EmptyState icon="❌" text="No tienes solicitudes activas para anular." />;

  return (
    <section>
      <h2 style={s.sectionTitle}>Anular hora</h2>
      <p style={s.sectionDesc}>Selecciona la solicitud que deseas cancelar.</p>
      <div style={s.cardGrid}>
        {solicitudes.map((sol, i) => (
          <div
            key={sol.id}
            onClick={() => setSelected(sol.id === selected ? null : sol.id)}
            style={{ ...s.card, cursor: 'pointer',
              border: selected === sol.id ? '2px solid #ef4444' : '1px solid #e5e7eb' }}
            className={`card-hover animate-fadeInUp delay-${Math.min(i+1,5)}`}
          >
            <CardHead sol={sol} />
            {selected === sol.id && (
              <button
                style={{ ...s.actionBtn, background: '#ef4444', marginTop: 14, width: '100%' }}
                disabled={anulando}
                onClick={async (e) => {
                  e.stopPropagation();
                  setAnulando(true);
                  await onAnular(sol.id);
                  setSelected(null);
                  setAnulando(false);
                }}
                className="btn-animate"
              >
                {anulando ? 'Anulando…' : '❌ Confirmar anulación'}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Cambiar ─────────────────────────────────────────────────────────────── */
function TabCambiar({ solicitudes, onRefresh }) {
  const [editing, setEditing] = useState(null);

  if (solicitudes.length === 0) return (
    <EmptyState icon="🔄" text="Solo puedes modificar solicitudes en estado Pendiente." />
  );

  return (
    <section>
      <h2 style={s.sectionTitle}>Cambiar solicitud</h2>
      <p style={s.sectionDesc}>Selecciona una solicitud pendiente para modificar sus datos.</p>
      <div style={s.cardGrid}>
        {solicitudes.map((sol, i) => (
          <div key={sol.id} style={s.card}
               className={`card-hover animate-fadeInUp delay-${Math.min(i+1,5)}`}>
            <CardHead sol={sol} />
            {editing === sol.id ? (
              <EditForm sol={sol} onSaved={() => { setEditing(null); onRefresh(); }} onCancel={() => setEditing(null)} />
            ) : (
              <button
                style={{ ...s.actionBtn, background: '#0073b1', marginTop: 14, width: '100%' }}
                onClick={() => setEditing(sol.id)}
                className="btn-animate"
              >
                ✏️ Modificar esta solicitud
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function EditForm({ sol, onSaved, onCancel }) {
  const [desc, setDesc] = useState(sol.descripcion || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Solo actualizamos la descripcion vía nota en el historial
      await listaEsperaService.actualizarEstado(sol.id, 'pendiente', `[Modificación paciente] ${desc}`);
      onSaved();
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div style={{ marginTop: 14 }}>
      <label style={s.label}>Actualizar motivo / descripción</label>
      <textarea
        style={{ ...s.input, resize: 'vertical', minHeight: 72 }}
        value={desc}
        onChange={e => setDesc(e.target.value)}
        rows={3}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={onCancel} style={s.btnSecondary}>Cancelar</button>
        <button onClick={handleSave} disabled={saving} style={s.actionBtn} className="btn-animate">
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function SolCard({ sol, idx }) {
  return (
    <div style={s.card} className={`card-hover animate-fadeInUp delay-${Math.min(idx+1,5)}`}>
      <CardHead sol={sol} />
      <dl style={s.dl}>
        <dt style={s.dt}>Tipo</dt>
        <dd style={s.dd}>{sol.tipo}</dd>
        <dt style={s.dt}>Ingreso</dt>
        <dd style={s.dd}>{new Date(sol.fecha_ingreso).toLocaleDateString('es-CL')}</dd>
        {sol.hospital_origen && <><dt style={s.dt}>Hospital</dt><dd style={s.dd}>{sol.hospital_origen}</dd></>}
      </dl>
    </div>
  );
}

function CardHead({ sol }) {
  return (
    <>
      <div style={s.cardHeader}>
        <span style={s.cardEsp}>{sol.especialidad}</span>
        <span style={{ ...s.badge, background: ESTADO_COLOR[sol.estado] || '#999' }}>
          {ESTADO_LABEL[sol.estado] || sol.estado}
        </span>
      </div>
      <div style={s.divider} />
    </>
  );
}

function EmptyState({ icon, text }) {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }} className="animate-fadeIn">
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <p style={{ color: '#9ca3af', fontSize: 15, marginBottom: 20 }}>{text}</p>
      <button onClick={() => navigate('/reservar')} style={s.newBtn} className="btn-animate">
        + Crear nueva reserva
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={s.cardGrid}>
      {[1,2,3].map(i => (
        <div key={i} style={{ ...s.card, padding: 20 }}>
          <div className="skeleton" style={{ height: 18, width: '60%', marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 12, width: '90%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 12, width: '70%' }} />
        </div>
      ))}
    </div>
  );
}

/* ── Estilos ─────────────────────────────────────────────────────────────── */
const s = {
  page:        { minHeight: '100vh', background: '#f0f4f8', display: 'flex', flexDirection: 'column' },
  header:      { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px',
                 height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                 boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 10 },
  backBtn:     { background: 'none', border: 'none', color: '#0073b1', cursor: 'pointer',
                 fontSize: 18, fontWeight: 600, padding: '0 4px' },
  brand:       { fontSize: 17, fontWeight: 800, color: '#0073b1' },
  sep:         { color: '#d1d5db' },
  headerSub:   { fontSize: 14, color: '#6b7280' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 14 },
  userInfo:    { fontSize: 12, color: '#9ca3af' },
  logoutBtn:   { background: 'none', border: '1px solid #e5e7eb', color: '#374151',
                 padding: '5px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
  nav:         { background: '#fff', borderBottom: '2px solid #e5e7eb', padding: '0 24px',
                 display: 'flex', overflowX: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  tab:         { padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
                 outline: 'none', whiteSpace: 'nowrap' },
  tabText:     { fontSize: 13, transition: 'color 0.18s' },
  main:        { flex: 1, padding: '28px 24px', maxWidth: 1000, margin: '0 auto', width: '100%' },
  sectionTitle:{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 },
  sectionDesc: { fontSize: 14, color: '#9ca3af', marginBottom: 22 },
  cardGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 16 },
  card:        { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
                 padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardEsp:     { fontSize: 15, fontWeight: 700, color: '#1a1a2e' },
  badge:       { padding: '3px 10px', borderRadius: 20, color: '#fff', fontSize: 11,
                 fontWeight: 700, textTransform: 'uppercase' },
  divider:     { height: 1, background: '#f1f5f9', marginBottom: 10 },
  dl:          { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '5px 10px' },
  dt:          { fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', paddingTop: 1 },
  dd:          { fontSize: 13, color: '#374151', margin: 0 },
  actionBtn:   { background: '#0073b1', color: '#fff', border: 'none', padding: '9px 18px',
                 borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  btnSecondary:{ background: '#fff', color: '#374151', border: '1px solid #d1d5db',
                 padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  label:       { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input:       { width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db',
                 borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                 background: '#fafafa', fontFamily: 'inherit' },
  bottomBar:   { background: '#fff', borderTop: '1px solid #e5e7eb', padding: '14px 24px',
                 display: 'flex', justifyContent: 'center' },
  newBtn:      { background: '#0073b1', color: '#fff', border: 'none', padding: '11px 28px',
                 borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 },
  toast:       { position: 'fixed', bottom: 24, right: 24, color: '#fff', padding: '12px 20px',
                 borderRadius: 10, fontWeight: 600, fontSize: 13, zIndex: 9999,
                 boxShadow: '0 6px 24px rgba(0,0,0,0.2)' },
};
