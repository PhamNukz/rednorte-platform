import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listaEsperaService, agendaService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ESTADO_COLOR = {
  pendiente:  '#f59e0b', en_espera: '#3b82f6',
  asignada:   '#10b981', cancelada:  '#ef4444', completada: '#6b7280',
};

const ESPECIALIDADES = [
  'Medicina General', 'Cardiología', 'Neurología', 'Traumatología',
  'Ginecología', 'Pediatría', 'Cirugía General', 'Dermatología',
];

export default function PortalDoctor() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tab, setTab]     = useState('citas');
  const [tabKey, setTabKey] = useState(0);
  const [solicitudes, setSolicitudes] = useState([]);
  const [horas, setHoras]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [solRes, horasRes] = await Promise.all([
        listaEsperaService.listar({ limit: 100 }).catch(() => ({ data: { data: [] } })),
        // Filtrar horas por el RUT del médico logueado — devuelve todas sus horas (no solo disponibles)
        agendaService.horasDisponibles({ medico_rut: user?.rut, limit: 200 }).catch(() => ({ data: { data: [] } })),
      ]);
      const allSol = solRes.data?.data || solRes.data || [];
      setSolicitudes(allSol.filter(s => ['asignada', 'en_espera'].includes(s.estado)));
      const horasArray = horasRes.data?.data || horasRes.data || [];
      setHoras(Array.isArray(horasArray) ? horasArray : []);
    } catch {
      setSolicitudes([]); setHoras([]);
    } finally { setLoading(false); }
  }, [user?.rut]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const changeTab = (t) => { setTab(t); setTabKey(k => k + 1); };

  const handleCancelar = async (id, motivo) => {
    try {
      await listaEsperaService.actualizarEstado(id, 'cancelada', motivo);
      showToast('Cita cancelada correctamente.');
      fetchData();
    } catch { showToast('Error al cancelar la cita.', 'error'); }
  };

  const handleAgregarHora = async (horaData) => {
    try {
      await agendaService.crearHora({ ...horaData, medico_rut: user?.rut });
      showToast('Hora agregada al horario.');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error al agregar la hora.', 'error');
    }
  };

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <header style={s.header} className="header-animate">
        <div style={s.headerLeft}>
          <span style={s.brand}>RedNorte</span>
          <span style={s.sep}>|</span>
          <span style={s.headerTitle}>Portal del Profesional</span>
        </div>
        <div style={s.headerRight}>
          <div style={s.userBadge}>
            <div style={s.avatar}>{(user?.rut || 'D')[0]}</div>
            <div>
              <div style={s.userName}>{user?.nombre || 'Profesional'}</div>
              <div style={s.userRut}>RUT: {user?.rut}</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={s.logoutBtn}>Salir</button>
        </div>
      </header>

      {/* ── Stats rápidas ── */}
      <div style={s.statsBar} className="animate-fadeIn">
        <StatPill label="Citas asignadas"  value={solicitudes.filter(s => s.estado === 'asignada').length}  color="#10b981" />
        <StatPill label="En lista espera"  value={solicitudes.filter(s => s.estado === 'en_espera').length} color="#3b82f6" />
        <StatPill label="Horas disponibles" value={horas.filter(h => h.estado === 'disponible').length}   color="#0073b1" />
      </div>

      {/* ── Nav ── */}
      <nav style={s.nav}>
        {[
          { key: 'citas',    label: '📋 Mis Citas' },
          { key: 'horario',  label: '🗓 Mi Horario' },
        ].map(({ key, label }) => (
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
        {loading ? <Spinner /> : (
          <div key={tabKey} className="tab-content">
            {tab === 'citas'   && <TabCitas solicitudes={solicitudes} onCancelar={handleCancelar} />}
            {tab === 'horario' && <TabHorario horas={horas} onAgregar={handleAgregarHora} />}
          </div>
        )}
      </main>

      {toast && (
        <div style={{ ...s.toast, background: toast.type === 'error' ? '#ef4444' : '#10b981' }} className="toast">
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ── Tab Citas ───────────────────────────────────────────────────────────── */
function TabCitas({ solicitudes, onCancelar }) {
  const [cancelModal, setCancelModal] = useState(null); // { id, nombre }

  if (solicitudes.length === 0) {
    return (
      <div style={s.emptyState} className="animate-fadeIn">
        <div style={{ fontSize: 48 }}>📋</div>
        <p style={{ color: '#9ca3af', marginTop: 12 }}>No tienes citas asignadas actualmente.</p>
      </div>
    );
  }

  return (
    <section>
      <h2 style={s.sectionTitle}>Citas y Solicitudes Asignadas</h2>
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              {['Paciente','Especialidad','Tipo','Estado','Ingreso','Acciones'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((sol, i) => (
              <tr key={sol.id} style={s.tr} className={`table-row animate-fadeInUp delay-${Math.min(i+1,5)}`}>
                <td style={s.td}>
                  <div style={{ fontWeight: 600 }}>{sol.nombre_paciente}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{sol.rut_paciente}</div>
                </td>
                <td style={s.td}>{sol.especialidad}</td>
                <td style={s.td}>{sol.tipo}</td>
                <td style={s.td}>
                  <span style={{ ...s.badge, background: ESTADO_COLOR[sol.estado] }}>
                    {sol.estado.replace('_',' ')}
                  </span>
                </td>
                <td style={{ ...s.td, color: '#9ca3af', fontSize: 12 }}>
                  {new Date(sol.fecha_ingreso).toLocaleDateString('es-CL')}
                </td>
                <td style={s.td}>
                  {!['cancelada','completada'].includes(sol.estado) && (
                    <button
                      style={s.cancelBtn}
                      onClick={() => setCancelModal({ id: sol.id, nombre: sol.nombre_paciente })}
                      className="btn-animate"
                    >
                      Cancelar cita
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal cancelar ── */}
      {cancelModal && (
        <CancelModal
          nombre={cancelModal.nombre}
          onCancel={() => setCancelModal(null)}
          onConfirm={async (motivo) => {
            await onCancelar(cancelModal.id, motivo);
            setCancelModal(null);
          }}
        />
      )}
    </section>
  );
}

/* ── Modal cancelar cita ─────────────────────────────────────────────────── */
function CancelModal({ nombre, onCancel, onConfirm }) {
  const [motivo, setMotivo]   = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');

  const handleConfirm = async () => {
    if (!motivo.trim() || motivo.trim().length < 10) {
      setErr('Ingresa un justificativo de al menos 10 caracteres.');
      return;
    }
    setLoading(true);
    await onConfirm(motivo);
    setLoading(false);
  };

  return (
    <div style={s.overlay} className="modal-overlay">
      <div style={s.modal} className="modal-card">
        <div style={s.modalHeader}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Cancelar cita</h3>
          <button onClick={onCancel} style={s.closeBtn}>✕</button>
        </div>
        <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>
          Cancelando cita del paciente <strong>{nombre}</strong>.
          Por favor indica el motivo de cancelación.
        </p>
        <label style={s.label}>Justificativo <span style={{ color: '#ef4444' }}>*</span></label>
        <textarea
          style={{ ...s.input, resize: 'vertical', minHeight: 80 }}
          placeholder="Ej: El médico no puede asistir por enfermedad. Se notificará al paciente..."
          value={motivo}
          onChange={e => { setMotivo(e.target.value); setErr(''); }}
          rows={3}
        />
        {err && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>{err}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button onClick={onCancel} style={s.btnBack}>Cancelar</button>
          <button onClick={handleConfirm} disabled={loading} style={s.btnDanger} className="btn-animate">
            {loading ? 'Cancelando…' : 'Confirmar cancelación'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Tab Horario ─────────────────────────────────────────────────────────── */
function TabHorario({ horas, onAgregar }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ especialidad: '', fecha: '', hora: '', duracion_min: 30 });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAgregar = async () => {
    if (!form.especialidad || !form.fecha || !form.hora) return;
    setSaving(true);
    const fechaHora = `${form.fecha}T${form.hora}:00`;
    await onAgregar({
      especialidad: form.especialidad,
      hospital: 'Hospital RedNorte',
      fecha_hora: fechaHora,
      duracion_min: parseInt(form.duracion_min) || 30,
    });
    setForm({ especialidad: '', fecha: '', hora: '', duracion_min: 30 });
    setShowForm(false);
    setSaving(false);
  };

  // Agrupar por fecha
  const porFecha = horas.reduce((acc, h) => {
    const d = new Date(h.fecha_hora).toLocaleDateString('es-CL', { weekday:'long', day:'2-digit', month:'long' });
    if (!acc[d]) acc[d] = [];
    acc[d].push(h);
    return acc;
  }, {});

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ ...s.sectionTitle, margin: 0 }}>Mi Horario de Atención</h2>
        <button onClick={() => setShowForm(!showForm)} style={s.addBtn} className="btn-animate">
          {showForm ? '✕ Cancelar' : '+ Agregar hora'}
        </button>
      </div>

      {/* ── Formulario nuevo horario ── */}
      {showForm && (
        <div style={s.formCard} className="animate-fadeIn">
          <h4 style={{ margin: '0 0 16px', fontWeight: 700, color: '#1a1a2e' }}>Nueva hora de atención</h4>
          <div style={s.formRow}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Especialidad</label>
              <select value={form.especialidad} onChange={e => set('especialidad', e.target.value)} style={s.select}>
                <option value="">Seleccionar…</option>
                {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Duración (min)</label>
              <select value={form.duracion_min} onChange={e => set('duracion_min', e.target.value)} style={s.select}>
                {[20, 30, 45, 60].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
          </div>
          <div style={s.formRow}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Fecha</label>
              <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)}
                style={s.input} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Hora</label>
              <input type="time" value={form.hora} onChange={e => set('hora', e.target.value)} style={s.input} />
            </div>
          </div>
          <button onClick={handleAgregar} disabled={saving || !form.especialidad || !form.fecha || !form.hora}
            style={{ ...s.addBtn, opacity: (!form.especialidad || !form.fecha || !form.hora) ? 0.5 : 1 }}
            className="btn-animate">
            {saving ? 'Guardando…' : 'Guardar hora'}
          </button>
        </div>
      )}

      {/* ── Lista de horarios ── */}
      {Object.keys(porFecha).length === 0 ? (
        <div style={s.emptyState} className="animate-fadeIn">
          <div style={{ fontSize: 40 }}>🗓</div>
          <p style={{ color: '#9ca3af', marginTop: 10 }}>No hay horas registradas aún.</p>
        </div>
      ) : (
        Object.entries(porFecha).map(([fecha, slots]) => (
          <div key={fecha} style={s.daySection} className="animate-fadeInUp">
            <h3 style={s.dayTitle}>{fecha}</h3>
            <div style={s.slotsRow}>
              {slots.map(slot => (
                <div key={slot.id} style={{
                  ...s.slotChip,
                  background: slot.estado === 'disponible' ? '#eff6ff' : '#f1f5f9',
                  borderColor: slot.estado === 'disponible' ? '#0073b1' : '#d1d5db',
                  color: slot.estado === 'disponible' ? '#0073b1' : '#9ca3af',
                }}>
                  {new Date(slot.fecha_hora).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                  <span style={{ fontSize: 10, marginLeft: 4 }}>{slot.duracion_min}m</span>
                  {slot.estado !== 'disponible' && <span style={s.reservadaBadge}>Reservada</span>}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}

/* ── Micro-componentes ───────────────────────────────────────────────────── */
function StatPill({ label, value, color }) {
  return (
    <div style={{ ...s.statPill, borderColor: color }}>
      <span style={{ ...s.statVal, color }}>{value}</span>
      <span style={s.statLabel}>{label}</span>
    </div>
  );
}
function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div style={s.bigSpinner} />
    </div>
  );
}

/* ── Estilos ─────────────────────────────────────────────────────────────── */
const s = {
  page:        { minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column' },
  header:      { background: 'linear-gradient(135deg,#080f1e 0%,#0d2244 60%,#0d3468 100%)', color: '#fff',
                 padding: '0 32px', height: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                 boxShadow: '0 2px 16px rgba(0,0,0,0.25)' },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 10 },
  brand:       { fontSize: 19, fontWeight: 900, color: '#38bdf8', letterSpacing: '-0.5px' },
  sep:         { opacity: 0.3, fontSize: 18 },
  headerTitle: { fontSize: 13, opacity: 0.7, letterSpacing: '0.1px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
  userBadge:   { display: 'flex', alignItems: 'center', gap: 10 },
  avatar:      { width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.18)',
                 border: '1px solid rgba(255,255,255,0.25)',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 fontWeight: 800, fontSize: 15, color: '#fff' },
  userName:    { fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.2 },
  userRut:     { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  logoutBtn:   { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                 color: 'rgba(255,255,255,0.85)', padding: '6px 16px', borderRadius: 8,
                 cursor: 'pointer', fontSize: 13, fontWeight: 500,
                 transition: 'background 0.16s ease' },

  statsBar:    { background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
                 borderBottom: '1px solid #e8edf3', padding: '10px 32px',
                 display: 'flex', gap: 14 },
  statPill:    { border: '1.5px solid', borderRadius: 12, padding: '10px 20px',
                 display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                 background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  statVal:     { fontSize: 24, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.5px' },
  statLabel:   { fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase',
                 letterSpacing: '0.4px' },

  nav:         { background: '#fff', borderBottom: '1px solid #e8edf3', padding: '0 32px',
                 display: 'flex', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' },
  tab:         { padding: '15px 22px', background: 'none', border: 'none', cursor: 'pointer', outline: 'none' },
  tabText:     { fontSize: 14, transition: 'color 0.18s' },
  main:        { flex: 1, padding: '28px 32px', maxWidth: 1100, margin: '0 auto', width: '100%' },

  sectionTitle:{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 18, letterSpacing: '-0.3px' },
  tableWrap:   { background: '#fff', borderRadius: 16, overflow: 'hidden',
                 boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e8edf3' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  thead:       { background: 'linear-gradient(135deg,#080f1e 0%,#0d2244 100%)' },
  th:          { padding: '13px 16px', color: '#cbd5e1', fontSize: 11, fontWeight: 700,
                 textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.6px' },
  tr:          { borderBottom: '1px solid #f1f5f9' },
  td:          { padding: '13px 16px', fontSize: 13, color: '#374151', verticalAlign: 'middle' },
  badge:       { padding: '3px 10px', borderRadius: 20, color: '#fff', fontSize: 11,
                 fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' },
  cancelBtn:   { background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', border: 'none',
                 padding: '5px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                 boxShadow: '0 2px 8px rgba(239,68,68,0.3)' },

  // Horario form
  formCard:    { background: '#fff', border: '1px solid #e8edf3', borderRadius: 16,
                 padding: '22px 26px', marginBottom: 24,
                 boxShadow: '0 4px 20px rgba(0,0,0,0.07)' },
  formRow:     { display: 'flex', gap: 16, marginBottom: 14 },
  label:       { display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 },
  input:       { width: '100%', padding: '10px 13px', border: '1.5px solid #e2e8f0',
                 borderRadius: 9, fontSize: 13, outline: 'none', background: '#f8fafc',
                 boxSizing: 'border-box', color: '#0f172a' },
  select:      { width: '100%', padding: '10px 13px', border: '1.5px solid #e2e8f0',
                 borderRadius: 9, fontSize: 13, outline: 'none', background: '#f8fafc',
                 boxSizing: 'border-box', cursor: 'pointer', color: '#0f172a' },
  addBtn:      { background: 'linear-gradient(135deg,#0073b1,#005a8e)', color: '#fff', border: 'none',
                 padding: '10px 24px', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                 boxShadow: '0 4px 14px rgba(0,115,177,0.32)' },
  daySection:  { marginBottom: 22 },
  dayTitle:    { fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'capitalize',
                 marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f1f5f9',
                 letterSpacing: '0.1px', display: 'flex', alignItems: 'center', gap: 8 },
  slotsRow:    { display: 'flex', flexWrap: 'wrap', gap: 8 },
  slotChip:    { border: '1.5px solid', borderRadius: 9, padding: '7px 14px', fontSize: 13,
                 fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 },
  reservadaBadge:{ background: '#f59e0b', color: '#fff', borderRadius: 5,
                   padding: '2px 7px', fontSize: 9, fontWeight: 700, marginLeft: 4,
                   textTransform: 'uppercase', letterSpacing: '0.4px' },

  emptyState:  { textAlign: 'center', padding: '60px 0' },
  bigSpinner:  { width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: '#0073b1',
                 borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  toast:       { position: 'fixed', bottom: 24, right: 24, color: '#fff', padding: '13px 22px',
                 borderRadius: 12, fontWeight: 700, fontSize: 13, zIndex: 9999,
                 boxShadow: '0 8px 28px rgba(0,0,0,0.22)' },

  // Modal
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                 backdropFilter: 'blur(4px)',
                 display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modal:       { background: '#fff', borderRadius: 18, padding: '26px 30px',
                 width: '100%', maxWidth: 440, boxShadow: '0 32px 96px rgba(0,0,0,0.32)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  closeBtn:    { background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#94a3b8',
                 width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                 borderRadius: 6, transition: 'background 0.14s' },
  btnBack:     { background: '#fff', color: '#374151', border: '1.5px solid #e2e8f0',
                 padding: '9px 20px', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  btnDanger:   { background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', border: 'none',
                 padding: '9px 22px', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                 boxShadow: '0 4px 14px rgba(239,68,68,0.32)' },
};
