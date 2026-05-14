import { useEffect, useState, useCallback } from 'react';
import { listaEsperaService, agendaService } from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ── Constantes de dominio ───────────────────────────────────────────────── */
const ESTADOS_COLOR = {
  pendiente:  '#f59e0b',
  en_espera:  '#3b82f6',
  asignada:   '#10b981',
  cancelada:  '#ef4444',
  completada: '#6b7280',
};
const ESTADOS_LABEL = {
  pendiente:  'Pendiente',
  en_espera:  'En Espera',
  asignada:   'Asignada',
  cancelada:  'Cancelada',
  completada: 'Completada',
};
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
  const [form, setForm] = useState({
    paciente_nombre: user?.nombre || '',
    paciente_rut:    user?.rut    || '',
    especialidad:    '',
    tipo:            '',
    descripcion:     '',
    hospital_origen: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError]       = useState('');
  const [exito, setExito]       = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.especialidad || !form.tipo || !form.paciente_nombre || !form.paciente_rut) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      await listaEsperaService.registrar(form);
      setExito(true);
      setTimeout(onCreada, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la solicitud. Intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <div style={s.formCard} className="animate-fadeIn">
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontSize: 52 }}>✅</div>
          <h3 style={{ color: '#10b981', marginTop: 12, fontSize: 18 }}>¡Solicitud creada exitosamente!</h3>
          <p style={{ color: '#6b7280', marginTop: 8 }}>Serás redirigido en un momento…</p>
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

      {error && <div style={s.errorBanner}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Tipo de solicitud */}
        <div style={s.fieldGroup}>
          <label style={s.label}>Tipo de Atención <span style={s.req}>*</span></label>
          <div style={s.tipoGrid}>
            {TIPOS.map(({ value, label, icon, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => set('tipo', value)}
                style={{
                  ...s.tipoCard,
                  ...(form.tipo === value ? s.tipoCardActive : {}),
                }}
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
            value={form.especialidad}
            onChange={e => set('especialidad', e.target.value)}
            style={s.select}
            required
          >
            <option value="">— Selecciona una especialidad —</option>
            {ESPECIALIDADES.map(esp => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>
        </div>

        {/* Datos del paciente */}
        <div style={s.row2}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Nombre del Paciente <span style={s.req}>*</span></label>
            <input
              type="text"
              value={form.paciente_nombre}
              onChange={e => set('paciente_nombre', e.target.value)}
              style={s.input}
              placeholder="Nombre completo"
              required
            />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>RUT <span style={s.req}>*</span></label>
            <input
              type="text"
              value={form.paciente_rut}
              onChange={e => set('paciente_rut', e.target.value)}
              style={s.input}
              placeholder="12.345.678-9"
              required
            />
          </div>
        </div>

        {/* Hospital origen */}
        <div style={s.fieldGroup}>
          <label style={s.label}>Hospital / Centro de origen</label>
          <input
            type="text"
            value={form.hospital_origen}
            onChange={e => set('hospital_origen', e.target.value)}
            style={s.input}
            placeholder="Ej: Hospital Dr. Juan Noé"
          />
        </div>

        {/* Descripción */}
        <div style={s.fieldGroup}>
          <label style={s.label}>Descripción / Motivo de consulta</label>
          <textarea
            value={form.descripcion}
            onChange={e => set('descripcion', e.target.value)}
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
  return (
    <div
      style={s.card}
      className={`card-hover animate-fadeInUp delay-${Math.min(idx + 1, 5)}`}
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
        <Row label="Tipo"      value={sol.tipo} />
        <Row label="Prioridad" value={sol.prioridad}
             highlight={sol.prioridad === 'urgente' || sol.prioridad === 'alta'} />
        <Row label="Ingresado" value={fmtDate(sol.fecha_ingreso)} />
        {sol.fecha_asignacion && <Row label="Asignado"  value={fmtDate(sol.fecha_asignacion)} />}
        {sol.hospital_origen  && <Row label="Hospital"  value={sol.hospital_origen} />}
        {sol.descripcion      && <Row label="Motivo"    value={sol.descripcion} />}
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
  layout:       { minHeight: '100vh', background: '#f0f4f8', display: 'flex', flexDirection: 'column' },

  // Header
  header:       { background: 'linear-gradient(135deg,#0073b1,#005f93)', color: '#fff',
                  padding: '12px 32px', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' },
  headerLeft:   { display: 'flex', alignItems: 'baseline', gap: 10 },
  headerLogo:   { fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' },
  headerSep:    { opacity: 0.4, fontSize: 16 },
  headerTitle:  { fontSize: 14, opacity: 0.85 },
  headerRight:  { display: 'flex', alignItems: 'center', gap: 16 },
  userBadge:    { display: 'flex', alignItems: 'center', gap: 10 },
  userAvatar:   { width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 15, color: '#fff',
                  // inline flex trick
                  lineHeight: '36px', textAlign: 'center' },
  userName:     { fontSize: 13, fontWeight: 600 },
  userRut:      { fontSize: 11, opacity: 0.7 },
  logoutBtn:    { background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)',
                  color: '#fff', padding: '6px 16px', borderRadius: 7, cursor: 'pointer',
                  fontSize: 13, fontWeight: 500 },

  // Nav
  nav:          { background: '#fff', borderBottom: '2px solid #e5e7eb', padding: '0 24px',
                  display: 'flex', alignItems: 'center', gap: 0,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  tab:          { padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', outline: 'none' },
  tabText:      { fontSize: 14, transition: 'color 0.18s' },
  btnNueva:     { marginLeft: 'auto', background: '#0073b1', color: '#fff', border: 'none',
                  padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                  fontWeight: 600, whiteSpace: 'nowrap' },

  // Main
  main:         { flex: 1, padding: '28px 32px', maxWidth: 1040, margin: '0 auto', width: '100%' },
  sectionHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 },

  // Cards
  cardGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 },
  card:         { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
                  padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardEsp:      { fontSize: 15, fontWeight: 700, color: '#1a1a2e' },
  badge:        { padding: '4px 12px', borderRadius: 20, color: '#fff', fontSize: 11,
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' },
  divider:      { height: 1, background: '#f1f5f9', marginBottom: 12 },
  dl:           { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px' },
  dt:           { fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase',
                  alignSelf: 'start', paddingTop: 1 },
  dd:           { fontSize: 13, margin: 0 },

  // Empty state
  emptyState:   { textAlign: 'center', padding: '60px 0' },
  emptyIcon:    { fontSize: 48, marginBottom: 12 },
  emptyText:    { color: '#9ca3af', fontSize: 15, marginBottom: 20 },

  // Buttons
  btnPrimary:   { background: '#0073b1', color: '#fff', border: 'none', padding: '10px 22px',
                  borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  btnSecondary: { background: '#fff', color: '#374151', border: '1px solid #d1d5db',
                  padding: '10px 22px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 },

  // Form
  formCard:     { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
                  padding: '24px 28px', marginBottom: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  formHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  formTitle:    { fontSize: 17, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  btnClose:     { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9ca3af',
                  lineHeight: 1, padding: '0 4px' },
  fieldGroup:   { marginBottom: 18 },
  label:        { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  req:          { color: '#ef4444' },
  input:        { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8,
                  fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s' },
  select:       { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8,
                  fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box',
                  cursor: 'pointer' },
  textarea:     { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8,
                  fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  fontFamily: 'inherit' },
  row2:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 },
  tipoGrid:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 },
  tipoCard:     { border: '2px solid #e5e7eb', borderRadius: 10, padding: '12px 8px',
                  cursor: 'pointer', background: '#fafafa', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', gap: 4, transition: 'all 0.15s' },
  tipoCardActive:{ borderColor: '#0073b1', background: '#eff6ff' },
  tipoIcon:     { fontSize: 22 },
  tipoLabel:    { fontSize: 13, fontWeight: 700, color: '#1a1a2e' },
  tipoDesc:     { fontSize: 11, color: '#9ca3af', lineHeight: 1.3 },
  formFooter:   { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24,
                  paddingTop: 18, borderTop: '1px solid #f1f5f9' },
  errorBanner:  { background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
                  borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 13 },
};
