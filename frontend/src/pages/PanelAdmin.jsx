import { useEffect, useState, useCallback } from 'react';
import { listaEsperaService, agendaService, reportesService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PRIORIDAD_COLOR = {
  critica: '#dc2626', alta: '#f59e0b', media: '#3b82f6', baja: '#6b7280',
};
const ESTADO_COLOR = {
  pendiente: '#f59e0b', en_espera: '#3b82f6', asignada: '#10b981',
  cancelada: '#ef4444', completada: '#6b7280',
};

const TABS = [
  { key: 'lista',     label: 'Lista de Espera', icon: '📋' },
  { key: 'horas',     label: 'Horas Disponibles', icon: '🗓' },
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
];

export default function PanelAdmin() {
  const { user, logout } = useAuth();
  const [tab, setTab]           = useState('lista');
  const [tabKey, setTabKey]     = useState(0);
  const [solicitudes, setSolicitudes] = useState([]);
  const [dashboard, setDashboard]     = useState(null);
  const [horas, setHoras]             = useState([]);
  const [filtros, setFiltros]         = useState({ estado: '', especialidad: '' });
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [solRes, dashRes, horasRes] = await Promise.all([
        listaEsperaService.listar(filtros),
        reportesService.dashboard().catch(() => ({ data: { data: null } })),
        agendaService.horasDisponibles({}).catch(() => ({ data: { data: [] } })),
      ]);
      setSolicitudes(solRes.data.data || []);
      setDashboard(dashRes.data.data);
      setHoras(horasRes.data.data || []);
    } catch {
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const changeTab = (t) => {
    if (t === tab) return;
    setTab(t);
    setTabKey(k => k + 1);
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await listaEsperaService.actualizarEstado(id, nuevoEstado, 'Cambio manual desde panel');
      showToast(`Estado actualizado a "${nuevoEstado}"`);
      fetchData();
    } catch {
      showToast('Error al actualizar estado', 'error');
    }
  };

  return (
    <div style={s.layout}>
      {/* ── Header ── */}
      <header style={s.header} className="header-animate">
        <div style={s.hLeft}>
          <span style={s.brand}>RedNorte</span>
          <span style={s.headerTitle}>Panel Administrativo</span>
        </div>
        <div style={s.hRight}>
          <span style={s.rolBadge}>{user?.rol?.toUpperCase()}</span>
          <span style={s.rutText}>RUT: {user?.rut}</span>
          <button onClick={logout} style={s.logoutBtn} className="btn-animate">Salir</button>
        </div>
      </header>

      {/* ── Tabs ── */}
      <nav style={s.nav}>
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => changeTab(key)}
            style={s.tab}
            className={`nav-tab${tab === key ? ' active' : ''}`}
          >
            <span style={{ ...s.tabText, color: tab === key ? '#0073b1' : '#666',
              fontWeight: tab === key ? 700 : 400 }}>
              {icon} {label}
            </span>
          </button>
        ))}
      </nav>

      {/* ── Filtros (solo lista) ── */}
      {tab === 'lista' && (
        <div style={s.filtrosBar} className="animate-fadeIn">
          <select
            value={filtros.estado}
            onChange={e => setFiltros(f => ({ ...f, estado: e.target.value }))}
            style={s.select}
          >
            <option value="">Todos los estados</option>
            {['pendiente','en_espera','asignada','cancelada','completada'].map(e => (
              <option key={e} value={e}>{e.replace('_',' ')}</option>
            ))}
          </select>
          <input
            style={s.filterInput}
            placeholder="🔍  Especialidad..."
            value={filtros.especialidad}
            onChange={e => setFiltros(f => ({ ...f, especialidad: e.target.value }))}
          />
          <span style={s.total}>{solicitudes.length} resultado{solicitudes.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* ── Contenido ── */}
      <main style={s.main}>
        {loading ? <LoadingSpinner /> : (
          <div key={tabKey} className="tab-content">
            {tab === 'lista' &&
              <TabLista solicitudes={solicitudes} cambiarEstado={cambiarEstado} />}
            {tab === 'horas' &&
              <TabHoras horas={horas} />}
            {tab === 'dashboard' && dashboard &&
              <TabDashboard dashboard={dashboard} />}
            {tab === 'dashboard' && !dashboard &&
              <div style={s.emptyState} className="animate-fadeIn">
                <div style={s.emptyIcon}>📊</div>
                <p>El dashboard requiere datos en el sistema.</p>
              </div>}
          </div>
        )}
      </main>

      {/* ── Toast ── */}
      {toast && (
        <div
          key={toast.msg}
          style={{ ...s.toast, background: toast.type === 'error' ? '#ef4444' : '#10b981' }}
          className="toast"
        >
          {toast.type === 'error' ? '✕ ' : '✓ '}{toast.msg}
        </div>
      )}
    </div>
  );
}

/* ── Tabs ──────────────────────────────────────────────────────────────────── */

function TabLista({ solicitudes, cambiarEstado }) {
  if (solicitudes.length === 0) {
    return (
      <div style={s.emptyState} className="animate-fadeIn">
        <div style={s.emptyIcon}>📋</div>
        <p style={{ color: '#9ca3af' }}>Sin solicitudes con los filtros aplicados.</p>
      </div>
    );
  }
  return (
    <div style={s.tableWrapper} className="animate-fadeInUp">
      <table style={s.table}>
        <thead>
          <tr style={s.thead}>
            {['Paciente','Especialidad','Tipo','Prioridad','Estado','Ingreso','Acciones'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {solicitudes.map((sol, i) => (
            <tr
              key={sol.id}
              style={s.tr}
              className={`table-row animate-fadeInUp delay-${Math.min(i + 1, 5)}`}
            >
              <td style={s.td}><strong>{sol.nombre_paciente}</strong></td>
              <td style={s.td}>{sol.especialidad}</td>
              <td style={s.td}>{sol.tipo}</td>
              <td style={s.td}>
                <span style={{ ...s.badge, background: PRIORIDAD_COLOR[sol.prioridad] }}>
                  {sol.prioridad}
                </span>
              </td>
              <td style={s.td}>
                <span style={{ ...s.badge, background: ESTADO_COLOR[sol.estado] || '#999' }}>
                  {sol.estado.replace('_', ' ')}
                </span>
              </td>
              <td style={{ ...s.td, color: '#6b7280', fontSize: 12 }}>
                {new Date(sol.fecha_ingreso).toLocaleDateString('es-CL')}
              </td>
              <td style={s.td}>
                <div style={s.actions}>
                  {sol.estado === 'pendiente' && (
                    <ActionBtn color="#0073b1" onClick={() => cambiarEstado(sol.id,'en_espera')}>
                      Activar
                    </ActionBtn>
                  )}
                  {!['cancelada','completada'].includes(sol.estado) && (
                    <ActionBtn color="#ef4444" onClick={() => cambiarEstado(sol.id,'cancelada')}>
                      Cancelar
                    </ActionBtn>
                  )}
                  {sol.estado === 'en_espera' && (
                    <ActionBtn color="#10b981" onClick={() => cambiarEstado(sol.id,'asignada')}>
                      Asignar
                    </ActionBtn>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabHoras({ horas }) {
  return (
    <>
      <h2 style={s.sectionTitle}>Horas Médicas Disponibles</h2>
      {horas.length === 0 ? (
        <div style={s.emptyState} className="animate-fadeIn">
          <div style={s.emptyIcon}>🗓</div>
          <p style={{ color: '#9ca3af' }}>Sin horas disponibles registradas.</p>
        </div>
      ) : (
        <div style={s.horaGrid}>
          {horas.map((h, i) => (
            <div
              key={h.id}
              style={s.horaCard}
              className={`hora-card animate-fadeInUp delay-${Math.min(i + 1, 5)}`}
            >
              <span style={{ ...s.badge, background: h.estado === 'disponible' ? '#10b981' : '#f59e0b',
                marginBottom: 10, display: 'inline-block' }}>
                {h.estado}
              </span>
              <div style={s.horaEsp}>{h.especialidad}</div>
              <div style={s.horaMed}>Dr(a). {h.nombre_medico}</div>
              <div style={s.horaFecha}>
                {new Date(h.fecha_hora).toLocaleString('es-CL', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
              </div>
              <div style={s.horaHosp}>{h.hospital}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function TabDashboard({ dashboard }) {
  const stats = [
    { label: 'Cancelaciones (30d)', value: dashboard.cancelaciones_30d?.canceladas ?? '—', color: '#ef4444' },
    { label: 'Total Solicitudes (30d)', value: dashboard.cancelaciones_30d?.total ?? '—', color: '#0073b1' },
    { label: 'Tasa Cancelación', value: `${dashboard.cancelaciones_30d?.tasa_cancelacion_pct ?? 0}%`, color: '#f59e0b' },
  ];

  return (
    <>
      <h2 style={s.sectionTitle}>Dashboard Ejecutivo</h2>
      <div style={s.statsGrid}>
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            style={s.statCard}
            className={`stat-card animate-scaleIn delay-${i + 1}`}
          >
            <div style={{ ...s.statVal, color: stat.color }}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ ...s.sectionTitle, fontSize: 15, marginTop: 28 }}>Solicitudes por Estado</h3>
      <div style={s.tableWrapper} className="animate-fadeInUp delay-4">
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>Estado</th>
              <th style={s.th}>Total</th>
              <th style={s.th}>Prom. Horas en Espera</th>
            </tr>
          </thead>
          <tbody>
            {(dashboard.solicitudes_por_estado || []).map((row, i) => (
              <tr key={row.estado} style={s.tr} className={`table-row animate-fadeInUp delay-${i + 1}`}>
                <td style={s.td}>
                  <span style={{ ...s.badge, background: ESTADO_COLOR[row.estado] || '#999' }}>
                    {row.estado}
                  </span>
                </td>
                <td style={s.td}>{row.total}</td>
                <td style={s.td}>{row.promedio_horas_espera ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Micro-componentes ───────────────────────────────────────────────────── */
function ActionBtn({ color, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{ ...s.actionBtn, background: color }}
      className="btn-animate"
    >
      {children}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <div style={s.bigSpinner} />
    </div>
  );
}

/* ── Estilos ─────────────────────────────────────────────────────────────── */
const s = {
  layout:      { minHeight: '100vh', background: '#f0f4f8', display: 'flex', flexDirection: 'column' },
  header:      { background: 'linear-gradient(135deg,#1a1a2e,#16213e)', color: '#fff',
                 padding: '14px 32px', display: 'flex', justifyContent: 'space-between',
                 alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' },
  hLeft:       { display: 'flex', alignItems: 'baseline', gap: 14 },
  brand:       { fontSize: 20, fontWeight: 800, color: '#38bdf8', letterSpacing: '-0.5px' },
  headerTitle: { fontSize: 14, opacity: 0.75 },
  hRight:      { display: 'flex', alignItems: 'center', gap: 14 },
  rolBadge:    { background: '#0073b1', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 },
  rutText:     { fontSize: 12, opacity: 0.7 },
  logoutBtn:   { background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
                 color: '#fff', padding: '6px 16px', borderRadius: 7, cursor: 'pointer', fontSize: 13 },
  nav:         { background: '#fff', borderBottom: '2px solid #e5e7eb', padding: '0 32px',
                 display: 'flex', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  tab:         { padding: '14px 22px', background: 'none', border: 'none', cursor: 'pointer', outline: 'none' },
  tabText:     { fontSize: 14, transition: 'color 0.18s' },
  filtrosBar:  { background: '#fff', padding: '14px 32px', borderBottom: '1px solid #e5e7eb',
                 display: 'flex', gap: 12, alignItems: 'center' },
  select:      { padding: '8px 12px', border: '1.5px solid #d1d5db', borderRadius: 7, fontSize: 13,
                 background: '#fafafa', outline: 'none', cursor: 'pointer' },
  filterInput: { padding: '8px 14px', border: '1.5px solid #d1d5db', borderRadius: 7,
                 fontSize: 13, background: '#fafafa', outline: 'none', width: 230 },
  total:       { fontSize: 12, color: '#9ca3af', marginLeft: 'auto' },
  main:        { flex: 1, padding: '28px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' },
  sectionTitle:{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 20 },
  tableWrapper:{ background: '#fff', borderRadius: 12, overflow: 'hidden',
                 boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  thead:       { background: 'linear-gradient(135deg,#1a1a2e,#16213e)' },
  th:          { padding: '12px 16px', color: '#e2e8f0', fontSize: 12, fontWeight: 700,
                 textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr:          { borderBottom: '1px solid #f1f5f9' },
  td:          { padding: '12px 16px', fontSize: 13, color: '#374151', verticalAlign: 'middle' },
  badge:       { padding: '3px 10px', borderRadius: 12, color: '#fff', fontSize: 11,
                 fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' },
  actions:     { display: 'flex', gap: 6, flexWrap: 'wrap' },
  actionBtn:   { color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 6,
                 cursor: 'pointer', fontSize: 11, fontWeight: 600 },
  horaGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px,1fr))', gap: 16 },
  horaCard:    { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
                 padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  horaEsp:     { fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 },
  horaMed:     { fontSize: 13, color: '#374151', marginBottom: 4 },
  horaFecha:   { fontSize: 13, color: '#0073b1', fontWeight: 600, marginBottom: 4 },
  horaHosp:    { fontSize: 12, color: '#9ca3af' },
  statsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 8 },
  statCard:    { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
                 padding: '24px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statVal:     { fontSize: 38, fontWeight: 800, letterSpacing: '-1px' },
  statLabel:   { fontSize: 13, color: '#6b7280', marginTop: 4, fontWeight: 500 },
  emptyState:  { textAlign: 'center', padding: '60px 0' },
  emptyIcon:   { fontSize: 48, marginBottom: 14 },
  toast:       { position: 'fixed', bottom: 28, right: 28, color: '#fff', padding: '12px 22px',
                 borderRadius: 10, fontWeight: 600, fontSize: 14, zIndex: 9999,
                 boxShadow: '0 6px 24px rgba(0,0,0,0.2)' },
  bigSpinner:  { width: 40, height: 40, border: '4px solid #e5e7eb',
                 borderTopColor: '#0073b1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
};
