import { useEffect, useState, useCallback } from 'react';
import { listaEsperaService, agendaService } from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ── Constantes de dominio ───────────────────────────────────────────────── */
const ESTADOS = {
  pendiente:  { label: 'Pendiente',        color: '#f59e0b', bg: '#fffbeb', icon: '⏳', desc: 'Tu solicitud fue recibida y espera ser procesada.' },
  en_espera:  { label: 'En lista de espera', color: '#3b82f6', bg: '#eff6ff', icon: '🕐', desc: 'Estás en la lista. Se te asignará hora según disponibilidad.' },
  asignada:   { label: 'Hora confirmada',  color: '#10b981', bg: '#f0fdf4', icon: '✅', desc: 'Tu hora médica fue confirmada.' },
  cancelada:  { label: 'Cancelada',        color: '#ef4444', bg: '#fef2f2', icon: '❌', desc: 'Esta solicitud fue cancelada.' },
  completada: { label: 'Completada',       color: '#6b7280', bg: '#f8fafc', icon: '☑️',  desc: 'Atención finalizada.' },
};
const ESTADOS_COLOR = Object.fromEntries(Object.entries(ESTADOS).map(([k,v]) => [k, v.color]));
const ESTADOS_LABEL = Object.fromEntries(Object.entries(ESTADOS).map(([k,v]) => [k, v.label]));
const TIPOS = [
  { value: 'URGENCIA',     label: 'Urgencia',     icon: '🚨', desc: 'Atención inmediata requerida' },
  { value: 'PROGRAMADA',   label: 'Programada',   icon: '📅', desc: 'Cita de rutina o control' },
  { value: 'PROCEDIMIENTO',label: 'Procedimiento', icon: '🔬', desc: 'Examen o procedimiento médico' },
  { value: 'QUIRURGICA',   label: 'Quirúrgica',   icon: '🏥', desc: 'Intervención quirúrgica' },
];
const ESPECIALIDADES = [
  'Medicina General', 'Cardiología', 'Traumatología', 'Neurología',
  'Pediatría', 'Ginecología', 'Oftalmología', 'Dermatología',
  'Psiquiatría', 'Cirugía General', 'Urología', 'Otorrinolaringología',
];

/* ── Componente principal ─────────────────────────────────────────────────── */
export default function PortalPaciente() {
  const { user, logout } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('solicitudes');
  const [tabKey, setTabKey] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listaEsperaService.listar();
      setSolicitudes(res.data.data || []);
    } catch {
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSolicitudes(); }, [fetchSolicitudes]);

  const changeTab = (t) => {
    if (t === tab) return;
    setShowForm(false);
    setTab(t);
    setTabKey(k => k + 1);
  };

  const handleSolicitudCreada = () => {
    setShowForm(false);
    fetchSolicitudes();
  };

  const TABS = [
    { key: 'solicitudes',  label: '📋 Mis Solicitudes' },
    { key: 'horas',        label: '🕐 Horas Disponibles' },
    { key: 'historial',    label: '📅 Historial' },
  ];

  const activas = solicitudes.filter(s => !['completada', 'cancelada'].includes(s.estado));
  const historial = solicitudes.filter(s => ['completada', 'cancelada'].includes(s.estado));

  return (
    <div style={s.layout}>
      {/* ── Header ── */}
      <header style={s.header} className="header-animate">
        <div style={s.headerLeft}>
          <span style={s.headerLogo}>RedNorte</span>
          <span style={s.headerSep}>|</span>
          <span style={s.headerTitle}>Portal del Paciente</span>
        </div>
        <div style={s.headerRight}>
          <div style={s.userBadge}>
            <span style={s.userAvatar}>{(user?.nombre || user?.rut || 'P')[0].toUpperCase()}</span>
            <div>
              <div style={s.userName}>{user?.nombre || 'Paciente'}</div>
              <div style={s.userRut}>RUT: {user?.rut}</div>
            </div>
          </div>
          <button onClick={logout} style={s.logoutBtn} className="btn-animate">
            Salir
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
        {/* Botón Nueva Solicitud siempre visible */}
        <button
          onClick={() => { setTab('solicitudes'); setTabKey(k => k + 1); setShowForm(true); }}
          style={s.btnNueva}
          className="btn-animate"
        >
          + Nueva Solicitud
        </button>
      </nav>

      {/* ── Contenido ── */}
      <main style={s.main}>
        {loading ? (
          <SkeletonList />
        ) : (
          <div key={tabKey} className="tab-content">
            {tab === 'solicitudes' && (
              <TabSolicitudes
                solicitudes={activas}
                showForm={showForm}
                setShowForm={setShowForm}
                onCreada={handleSolicitudCreada}
                user={user}
              />
            )}
            {tab === 'horas' && <TabHoras user={user} />}
            {tab === 'historial' && <TabHistorial solicitudes={historial} />}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── TabSolicitudes ──────────────────────────────────────────────────────── */
function TabSolicitudes({ solicitudes, showForm, setShowForm, onCreada, user }) {
  return (
    <section>
      <div style={s.sectionHeader}>
        <h2 style={s.sectionTitle}>Mis Solicitudes Activas</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={s.btnPrimary} className="btn-animate">
            + Nueva Solicitud
          </button>
        )}
      </div>

      {showForm && (
        <FormNuevaSolicitud
          user={user}
          onCreada={onCreada}
          onCancelar={() => setShowForm(false)}
        />
      )}

      {solicitudes.length === 0 && !showForm ? (
        <div style={s.emptyState} className="animate-fadeIn">
          <div style={s.emptyIcon}>📋</div>
          <p style={s.emptyText}>No tienes solicitudes activas.</p>
          <button onClick={() => setShowForm(true)} style={s.btnPrimary} className="btn-animate">
            Crear mi primera solicitud
          </button>
        </div>
      ) : (
        <div style={s.cardGrid}>
          {solicitudes.map((sol, i) => (
            <SolicitudCard key={sol.id} sol={sol} idx={i} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Formulario Nueva Solicitud ──────────────────────────────────────────── */
function FormNuevaSolicitud({ user, onCreada, onCancelar }) {
  const [especialidad, setEspecialidad] = useState('');
  const [tipo, setTipo]                 = useState('');
  const [descripcion, setDescripcion]   = useState('');
  const [enviando, setEnviando]         = useState(false);
  const [error, setError]               = useState('');
  const [exito, setExito]               = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!especialidad || !tipo) {
      setError('Selecciona la especialidad y el tipo de atención.');
      return;
    }
    if (!user?.id) {
      setError('Sesión inválida. Por favor cierra sesión e inicia nuevamente.');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      await listaEsperaService.registrar({
        paciente_id:     user.id,
        rut_paciente:    user.rut,
        nombre_paciente: user.nombre || user.rut,
        especialidad,
        tipo:            tipo.toLowerCase(),
        descripcion:     descripcion || undefined,
        hospital_origen: 'RedNorte',
      });
      setExito(true);
      setTimeout(onCreada, 1400);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la solicitud. Intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <div style={s.formCard} className="animate-fadeIn">
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontSize: 52 }}>✅</div>
          <h3 style={{ color: '#10b981', marginTop: 12, fontSize: 18 }}>¡Solicitud creada!</h3>
          <p style={{ color: '#6b7280', marginTop: 8 }}>Tu solicitud fue recibida y será procesada a la brevedad.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.formCard} className="animate-fadeIn">
      <div style={s.formHeader}>
        <h3 style={s.formTitle}>Nueva Solicitud de Atención</h3>
        <button onClick={onCancelar} style={s.btnClose}>✕</button>
      </div>

      {/* Info paciente */}
      <div style={sf.patientBadge}>
        <span style={sf.patientAvatar}>{(user?.nombre || user?.rut || 'P')[0].toUpperCase()}</span>
        <div>
          <div style={sf.patientName}>{user?.nombre || 'Paciente'}</div>
          <div style={sf.patientRut}>RUT: {user?.rut}</div>
        </div>
      </div>

      {error && <div style={s.errorBanner}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Tipo */}
        <div style={s.fieldGroup}>
          <label style={s.label}>Tipo de Atención <span style={s.req}>*</span></label>
          <div style={s.tipoGrid}>
            {TIPOS.map(({ value, label, icon, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTipo(value)}
                style={{ ...s.tipoCard, ...(tipo === value ? s.tipoCardActive : {}) }}
              >
                <span style={s.tipoIcon}>{icon}</span>
                <span style={s.tipoLabel}>{label}</span>
                <span style={s.tipoDesc}>{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Especialidad */}
        <div style={s.fieldGroup}>
          <label style={s.label}>Especialidad <span style={s.req}>*</span></label>
          <select
            value={especialidad}
            onChange={e => setEspecialidad(e.target.value)}
            style={s.select}
            required
          >
            <option value="">— Selecciona una especialidad —</option>
            {ESPECIALIDADES.map(esp => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div style={s.fieldGroup}>
          <label style={s.label}>Motivo de consulta</label>
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            style={s.textarea}
            rows={3}
            placeholder="Describe brevemente el motivo de la solicitud…"
          />
        </div>

        <div style={s.formFooter}>
          <button type="button" onClick={onCancelar} style={s.btnSecondary}>
            Cancelar
          </button>
          <button type="submit" style={s.btnPrimary} disabled={enviando} className="btn-animate">
            {enviando ? 'Enviando…' : 'Enviar Solicitud'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* Estilos locales del formulario */
const sf = {
  patientBadge: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#f0f9ff', border: '1px solid #bae6fd',
    borderRadius: 10, padding: '10px 14px', marginBottom: 18,
  },
  patientAvatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg,#0073b1,#06b6d4)',
    color: '#fff', fontWeight: 800, fontSize: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  patientName: { fontSize: 13, fontWeight: 700, color: '#0f172a' },
  patientRut:  { fontSize: 11, color: '#64748b', marginTop: 2 },
};

/* ── TabHoras ────────────────────────────────────────────────────────────── */
function TabHoras({ user }) {
  const [horas, setHoras]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [especialidad, setEsp]      = useState('');
  const [reservando, setReservando] = useState(null);
  const [msgMap, setMsgMap]         = useState({});

  const fetchHoras = useCallback(async () => {
    setLoading(true);
    try {
      const params = especialidad ? { especialidad } : {};
      const res = await agendaService.horasDisponibles(params);
      setHoras(res.data.data || res.data || []);
    } catch {
      setHoras([]);
    } finally {
      setLoading(false);
    }
  }, [especialidad]);

  useEffect(() => { fetchHoras(); }, [fetchHoras]);

  const handleReservar = async (hora) => {
    setReservando(hora.id);
    try {
      // El endpoint del BFF / agenda medica para reservar una hora
      await import('../services/api').then(m =>
        m.default.patch(`/api/agenda/horas/${hora.id}/reservar`, {
          paciente_rut:    user?.rut    || '',
          paciente_nombre: user?.nombre || '',
        })
      );
      setMsgMap(m => ({ ...m, [hora.id]: { ok: true, text: '✅ Hora reservada exitosamente' } }));
      // Quitar la hora de la lista
      setHoras(hs => hs.filter(h => h.id !== hora.id));
    } catch (err) {
      const msg = err.response?.data?.message || 'No se pudo reservar. Intenta de nuevo.';
      setMsgMap(m => ({ ...m, [hora.id]: { ok: false, text: `❌ ${msg}` } }));
    } finally {
      setReservando(null);
    }
  };

  return (
    <section>
      <div style={s.sectionHeader}>
        <h2 style={s.sectionTitle}>Horas Médicas Disponibles</h2>
        <select value={especialidad} onChange={e => setEsp(e.target.value)} style={{ ...s.select, width: 220 }}>
          <option value="">Todas las especialidades</option>
          {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {loading ? (
        <SkeletonList />
      ) : horas.length === 0 ? (
        <div style={s.emptyState} className="animate-fadeIn">
          <div style={s.emptyIcon}>🏥</div>
          <p style={s.emptyText}>No hay horas disponibles{especialidad ? ` para ${especialidad}` : ''} en este momento.</p>
          <button onClick={fetchHoras} style={s.btnSecondary}>Recargar</button>
        </div>
      ) : (
        <div style={s.cardGrid}>
          {horas.map((hora, i) => (
            <div
              key={hora.id}
              style={s.card}
              className={`card-hover animate-fadeInUp delay-${Math.min(i + 1, 5)}`}
            >
              <div style={s.cardHeader}>
                <span style={s.cardEsp}>{hora.especialidad}</span>
                <span style={{ ...s.badge, background: '#10b981' }}>Disponible</span>
              </div>
              <div style={s.divider} />
              <dl style={s.dl}>
                {hora.nombre_medico && <Row label="Médico"    value={hora.nombre_medico} />}
                <Row label="Fecha"    value={fmtDateTime(hora.fecha_hora)} />
                {hora.duracion_min  && <Row label="Duración"  value={`${hora.duracion_min} min`} />}
                {hora.hospital      && <Row label="Hospital"  value={hora.hospital} />}
              </dl>
              {msgMap[hora.id] ? (
                <div style={{ marginTop: 12, fontSize: 13, color: msgMap[hora.id].ok ? '#10b981' : '#ef4444' }}>
                  {msgMap[hora.id].text}
                </div>
              ) : (
                <button
                  style={{ ...s.btnPrimary, marginTop: 14, width: '100%' }}
                  onClick={() => handleReservar(hora)}
                  disabled={reservando === hora.id}
                  className="btn-animate"
                >
                  {reservando === hora.id ? 'Reservando…' : 'Reservar Hora'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ── TabHistorial ────────────────────────────────────────────────────────── */
function TabHistorial({ solicitudes }) {
  return (
    <section className="animate-fadeInUp">
      <h2 style={s.sectionTitle}>Historial de Solicitudes</h2>
      {solicitudes.length === 0 ? (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>📅</div>
          <p style={s.emptyText}>Aquí aparecerán tus solicitudes completadas o canceladas.</p>
        </div>
      ) : (
        <div style={s.cardGrid}>
          {solicitudes.map((sol, i) => (
            <SolicitudCard key={sol.id} sol={sol} idx={i} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ── SolicitudCard ───────────────────────────────────────────────────────── */
function SolicitudCard({ sol, idx }) {
  const est = ESTADOS[sol.estado] || { label: sol.estado, color: '#999', bg: '#f8fafc', icon: '•', desc: '' };
  const tipoLabel = {
    urgencia: '🚨 Urgencia', programada: '📅 Consulta', procedimiento: '🔬 Procedimiento', quirurgica: '🏥 Cirugía',
  }[sol.tipo] || sol.tipo;

  return (
    <div
      style={{ ...s.card, borderLeft: `4px solid ${est.color}` }}
      className={`card-hover animate-fadeInUp delay-${Math.min(idx + 1, 5)}`}
    >
      <div style={s.cardHeader}>
        <span style={s.cardEsp}>{sol.especialidad}</span>
        <span style={{ ...s.badge, background: est.color }} className="badge-animate">
          {est.icon} {est.label}
        </span>
      </div>

      {/* Explicación del estado */}
      <div style={{ background: est.bg, borderRadius: 8, padding: '7px 10px', margin: '10px 0', fontSize: 12, color: est.color, fontWeight: 500 }}>
        {est.desc}
      </div>

      <dl style={s.dl}>
        <Row label="Tipo"      value={tipoLabel} />
        {sol.prioridad && sol.prioridad !== 'media' && (
          <Row label="Prioridad" value={sol.prioridad.charAt(0).toUpperCase() + sol.prioridad.slice(1)}
               highlight={sol.prioridad === 'critica' || sol.prioridad === 'alta'} />
        )}
        <Row label="Ingresado"  value={fmtDate(sol.fecha_ingreso)} />
        {sol.fecha_asignacion && <Row label="Confirmado" value={fmtDate(sol.fecha_asignacion)} />}
        {sol.hospital_origen  && <Row label="Hospital"   value={sol.hospital_origen} />}
        {sol.descripcion      && <Row label="Motivo"     value={sol.descripcion} />}
      </dl>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function Row({ label, value, highlight }) {
  return (
    <>
      <dt style={s.dt}>{label}</dt>
      <dd style={{ ...s.dd, color: highlight ? '#ef4444' : '#374151', fontWeight: highlight ? 700 : 400 }}>
        {value ?? '—'}
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

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

const fmtDateTime = (d) => d
  ? new Date(d).toLocaleString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';

/* ── Estilos ─────────────────────────────────────────────────────────────── */
const s = {
  layout:       { minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column' },

  // Header
  header:       { background: 'linear-gradient(135deg,#0073b1 0%,#005a8e 60%,#004a7c 100%)', color: '#fff',
                  padding: '0 32px', height: 60, display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.18)' },
  headerLeft:   { display: 'flex', alignItems: 'baseline', gap: 10 },
  headerLogo:   { fontSize: 20, fontWeight: 900, letterSpacing: '-0.6px' },
  headerSep:    { opacity: 0.35, fontSize: 16 },
  headerTitle:  { fontSize: 13, opacity: 0.75, fontWeight: 500 },
  headerRight:  { display: 'flex', alignItems: 'center', gap: 14 },
  userBadge:    { display: 'flex', alignItems: 'center', gap: 10 },
  userAvatar:   { width: 36, height: 36, borderRadius: 12,
                  background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 15, color: '#fff', lineHeight: 1 },
  userName:     { fontSize: 13, fontWeight: 700, lineHeight: 1.2 },
  userRut:      { fontSize: 11, opacity: 0.65, marginTop: 2 },
  logoutBtn:    { background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)',
                  color: '#fff', padding: '6px 16px', borderRadius: 8, cursor: 'pointer',
                  fontSize: 13, fontWeight: 500 },

  // Nav
  nav:          { background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
                  borderBottom: '1px solid #e8edf3', padding: '0 28px',
                  display: 'flex', alignItems: 'center', gap: 0,
                  boxShadow: '0 1px 6px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 50 },
  tab:          { padding: '15px 20px', background: 'none', border: 'none', cursor: 'pointer', outline: 'none' },
  tabText:      { fontSize: 13, transition: 'color 0.18s' },
  btnNueva:     { marginLeft: 'auto', background: 'linear-gradient(135deg,#0073b1,#005a8e)',
                  color: '#fff', border: 'none',
                  padding: '8px 20px', borderRadius: 9, cursor: 'pointer', fontSize: 13,
                  fontWeight: 700, whiteSpace: 'nowrap',
                  boxShadow: '0 3px 12px rgba(0,115,177,0.3)' },

  // Main
  main:         { flex: 1, padding: '28px 32px', maxWidth: 1040, margin: '0 auto', width: '100%' },
  sectionHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' },

  // Cards
  cardGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 18 },
  card:         { background: '#fff', border: '1px solid #e8edf3', borderRadius: 16,
                  padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  cardHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardEsp:      { fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.2px' },
  badge:        { padding: '3px 10px', borderRadius: 20, color: '#fff', fontSize: 11,
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' },
  divider:      { height: 1, background: '#f1f5f9', marginBottom: 12 },
  dl:           { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px' },
  dt:           { fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase',
                  alignSelf: 'start', paddingTop: 1, letterSpacing: '0.4px' },
  dd:           { fontSize: 13, margin: 0, color: '#374151', fontWeight: 500 },

  // Empty state
  emptyState:   { textAlign: 'center', padding: '60px 0' },
  emptyIcon:    { fontSize: 52, marginBottom: 14 },
  emptyText:    { color: '#94a3b8', fontSize: 15, marginBottom: 22, lineHeight: 1.6 },

  // Buttons
  btnPrimary:   { background: 'linear-gradient(135deg,#0073b1,#005a8e)', color: '#fff', border: 'none',
                  padding: '10px 24px', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 700,
                  boxShadow: '0 3px 12px rgba(0,115,177,0.28)' },
  btnSecondary: { background: '#fff', color: '#374151', border: '1.5px solid #e2e8f0',
                  padding: '10px 22px', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 500 },

  // Form
  formCard:     { background: '#fff', border: '1px solid #e8edf3', borderRadius: 18,
                  padding: '26px 30px', marginBottom: 28,
                  boxShadow: '0 6px 32px rgba(0,0,0,0.09)' },
  formHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  formTitle:    { fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' },
  btnClose:     { background: '#f1f5f9', border: 'none', fontSize: 14, cursor: 'pointer',
                  color: '#64748b', width: 28, height: 28, borderRadius: 7,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' },
  fieldGroup:   { marginBottom: 18 },
  label:        { display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 7 },
  req:          { color: '#ef4444' },
  input:        { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 9,
                  fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#f8fafc',
                  color: '#0f172a', transition: 'border-color 0.15s' },
  select:       { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 9,
                  fontSize: 14, outline: 'none', background: '#f8fafc', boxSizing: 'border-box',
                  cursor: 'pointer', color: '#0f172a' },
  textarea:     { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 9,
                  fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  fontFamily: 'inherit', background: '#f8fafc', color: '#0f172a' },
  row2:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 },
  tipoGrid:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 },
  tipoCard:     { border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '12px 8px',
                  cursor: 'pointer', background: '#f8fafc', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', gap: 4, transition: 'all 0.16s ease' },
  tipoCardActive:{ borderColor: '#0073b1', background: '#eff6ff',
                   boxShadow: '0 0 0 3px rgba(0,115,177,0.12)' },
  tipoIcon:     { fontSize: 22 },
  tipoLabel:    { fontSize: 13, fontWeight: 700, color: '#0f172a' },
  tipoDesc:     { fontSize: 11, color: '#94a3b8', lineHeight: 1.4 },
  formFooter:   { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24,
                  paddingTop: 18, borderTop: '1px solid #f1f5f9' },
  errorBanner:  { background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444',
                  color: '#b91c1c', borderRadius: 10,
                  padding: '10px 14px', marginBottom: 18, fontSize: 13 },
};
